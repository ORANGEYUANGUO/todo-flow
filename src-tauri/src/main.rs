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
        .invoke_handler(tauri::generate_handler![update_app_settings, get_app_settings])
        .setup(|app| {
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
            tauri::async_runtime::spawn(async move {
                loop {
                    let settings = get_settings();
                    let delay = sleep_until(settings.reminder_hour, settings.reminder_minute);
                    println!(
                        "Next daily reminder in {:?}...",
                        delay
                    );
                    tokio::time::sleep(delay).await;
                    println!("Firing daily reminder...");

                    // Only send if reminder is enabled
                    if settings.daily_reminder_enabled {
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
