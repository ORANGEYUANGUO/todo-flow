// Tauri 2.0 Entry Point
// Handles: system tray, auto-start, daily notification scheduling, close-to-tray, global shortcut

use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;
use tauri_plugin_autostart::{MacosLauncher, ManagerExt};
use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut, ShortcutState};
use tauri_plugin_notification::NotificationExt;
use tauri::Emitter;
use tauri::Manager;
use serde::{Deserialize, Serialize};
use std::time::Duration;
use std::sync::Mutex;
use std::fs::OpenOptions;
use std::io::Write;
use std::panic;
use tokio::sync::Notify;
use std::sync::Arc;

/// 获取日志文件路径 (用户 AppData 目录下)
fn get_log_path(app: &tauri::AppHandle) -> std::path::PathBuf {
    let mut path = app
        .path()
        .app_data_dir()
        .unwrap_or_else(|_| std::path::PathBuf::from("."));
    std::fs::create_dir_all(&path).ok();
    path.push("error.log");
    path
}

/// 追加写入日志文件
fn append_to_log(path: &std::path::Path, level: &str, message: &str) {
    if let Ok(mut file) = OpenOptions::new().create(true).append(true).open(path) {
        let ts = chrono::Local::now().format("%Y-%m-%d %H:%M:%S");
        let _ = writeln!(file, "[{}] [{}] {}", ts, level, message);
    }
}

/// 前端调用：记录错误日志
#[tauri::command]
fn log_error(message: String, app: tauri::AppHandle) {
    let path = get_log_path(&app);
    append_to_log(&path, "ERROR", &message);
}

/// Shared settings between frontend and backend
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub daily_reminder_enabled: bool,
    pub reminder_hour: u32,
    pub reminder_minute: u32,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            daily_reminder_enabled: true,
            reminder_hour: 9,
            reminder_minute: 0,
        }
    }
}

lazy_static::lazy_static! {
    static ref APP_SETTINGS: Mutex<AppSettings> = Mutex::new(AppSettings::default());
    /// 设置变更通知器：前台修改设置后通知后台循环立即重算
    static ref SETTINGS_NOTIFY: Arc<Notify> = Arc::new(Notify::new());
}

/// Get current settings
pub fn get_settings() -> AppSettings {
    APP_SETTINGS.lock().unwrap().clone()
}

/// Update settings from frontend
pub fn update_settings(new_settings: AppSettings) {
    *APP_SETTINGS.lock().unwrap() = new_settings;
}

/// Calculate sleep duration until the next target time
fn sleep_until(hour: u32, minute: u32) -> Duration {
    use chrono::Local;
    let now = Local::now();
    let target = now
        .date_naive()
        .and_hms_opt(hour, minute, 0)
        .expect("invalid time");

    let delay = target.signed_duration_since(now.naive_local());
    if delay.num_seconds() <= 0 {
        // Tomorrow
        let tomorrow = target + chrono::Duration::days(1);
        (tomorrow - now.naive_local()).to_std().unwrap_or(Duration::from_secs(0))
    } else {
        delay.to_std().unwrap_or(Duration::from_secs(0))
    }
}

/// Command to update settings from frontend
#[tauri::command]
fn update_app_settings(settings: AppSettings, app: tauri::AppHandle) {
    update_settings(settings.clone());
    println!("Settings updated: {:?}", settings);
    // Notify frontend that settings changed
    let _ = app.emit("settings-changed", &settings);
    // 通知后台循环重新计算 sleep 时间
    SETTINGS_NOTIFY.notify_one();
}

/// Command to get current settings from frontend
#[tauri::command]
fn get_app_settings() -> AppSettings {
    get_settings()
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--flag"]),
        ))
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_shortcut(Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyT))
                    .expect("Failed to parse shortcut")
                .with_handler(|app, _shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        println!("Global shortcut triggered: toggle always-on-top");
                        app.emit("always-on-top-toggle", ()).expect("Failed to emit shortcut event");
                    }
                })
                .build(),
        )
        .invoke_handler(tauri::generate_handler![update_app_settings, get_app_settings, log_error])
        .setup(|app| {
            // 全局 panic hook：未捕获的 panic 写入日志
            let log_path = get_log_path(&app.handle());
            panic::set_hook(Box::new(move |info| {
                let msg = format!(
                    "Panic: {}",
                    info.payload()
                        .downcast_ref::<&str>()
                        .unwrap_or(&"<unknown>")
                );
                if let Some(loc) = info.location() {
                    append_to_log(&log_path, "PANIC", &format!("{} at {}", msg, loc));
                } else {
                    append_to_log(&log_path, "PANIC", &msg);
                }
            }));
            // Enable auto-start by default
            let manager = app.autolaunch();
            if !manager.is_enabled().unwrap_or(false) {
                let _ = manager.enable();
            }

            // Setup system tray
            let show_item = MenuItem::with_id(app, "show", "显示", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_item, &quit_item])?;

            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .tooltip("Todo Flow")
                .on_menu_event(|app, event| match event.id.0.as_str() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .build(app)?;

            // Schedule daily notification
            let handle = app.handle().clone();
            let notify = SETTINGS_NOTIFY.clone();
            tauri::async_runtime::spawn(async move {
                loop {
                    let settings = get_settings();
                    let delay = sleep_until(settings.reminder_hour, settings.reminder_minute);
                    println!(
                        "Next daily reminder in {:?}...",
                        delay
                    );
                    // 使用 select! 使 sleep 能被设置变更中断
                    tokio::select! {
                        _ = tokio::time::sleep(delay) => {
                            println!("Firing daily reminder...");

                            // Only send if reminder is enabled
                            let current_settings = get_settings();
                            if current_settings.daily_reminder_enabled {
                                handle.emit("daily-reminder", ()).unwrap();
                                handle
                                    .notification()
                                    .builder()
                                    .title("Todo Flow")
                                    .body("今天还没有安排任务吗？打开 Todo Flow 规划一下吧！")
                                    .show()
                                    .unwrap();
                            }
                        }
                        _ = notify.notified() => {
                            println!("Settings changed, recalculating reminder time...");
                            // 循环回到顶部，用新设置重新计算 delay
                        }
                    }
                }
            });

            Ok(())
        })
        .on_window_event(|window, event| {
            // Close button → minimize to tray instead of quitting
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}
