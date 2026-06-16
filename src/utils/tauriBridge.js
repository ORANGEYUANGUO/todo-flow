/**
 * Tauri API Bridge
 * Safely calls Tauri APIs only when running in Tauri context.
 * Falls back to no-op when running in browser (dev mode).
 */

// 使用 window.__TAURI__ 命名空间检测（Tauri 2 默认注入）
// 不用 withGlobalTauri，避免 Vite dev 模式下误判
const isTauri = typeof window !== 'undefined' &&
  typeof window.__TAURI__ !== 'undefined' &&
  typeof window.__TAURI__.error !== 'undefined'

/**
 * Set window always-on-top
 */
export async function setAlwaysOnTop(enabled) {
  if (!isTauri) return
  const { getCurrentWindow } = await import('@tauri-apps/api/window')
  await getCurrentWindow().setAlwaysOnTop(enabled)
}

/**
 * Check if window is currently always-on-top
 */
export async function checkAlwaysOnTop() {
  if (!isTauri) return false
  const { getCurrentWindow } = await import('@tauri-apps/api/window')
  return await getCurrentWindow().isAlwaysOnTop()
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission() {
  if (!isTauri) return false
  const { requestPermission } = await import('@tauri-apps/plugin-notification')
  try {
    return await requestPermission() === 'granted'
  } catch {
    return false
  }
}

/**
 * Send a notification
 */
export async function sendNotification(title, body) {
  if (!isTauri) return
  const { notify } = await import('@tauri-apps/plugin-notification')
  notify({ title, body })
}

/**
 * Check if auto-start is enabled
 */
export async function getAutostartEnabled() {
  if (!isTauri) return false
  const { isEnabled } = await import('@tauri-apps/plugin-autostart')
  return await isEnabled()
}

/**
 * Enable auto-start
 */
export async function enableAutostart() {
  if (!isTauri) return false
  const { enable } = await import('@tauri-apps/plugin-autostart')
  try {
    await enable()
    return true
  } catch {
    return false
  }
}

/**
 * Disable auto-start
 */
export async function disableAutostart() {
  if (!isTauri) return false
  const { disable } = await import('@tauri-apps/plugin-autostart')
  try {
    await disable()
    return true
  } catch {
    return false
  }
}

/**
 * Toggle auto-start
 */
export async function toggleAutostart() {
  if (!isTauri) return false
  const { isEnabled, enable, disable } = await import('@tauri-apps/plugin-autostart')
  const enabled = await isEnabled()
  if (enabled) {
    await disable()
    return false
  } else {
    await enable()
    return true
  }
}

/**
 * Listen for Tauri events
 */
export async function listen(event, callback) {
  if (!isTauri) return () => {}
  const { listen } = await import('@tauri-apps/api/event')
  return await listen(event, callback)
}

/**
 * Check if running in Tauri
 */
export function isRunningInTauri() {
  return isTauri
}

/**
 * Update app settings (sends to Rust backend)
 */
export async function updateAppSettings(settings) {
  if (!isTauri) return false
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    await invoke('update_app_settings', { settings })
    return true
  } catch {
    return false
  }
}

/**
 * Get app settings from Rust backend
 */
export async function getAppSettings() {
  if (!isTauri) return null
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    return await invoke('get_app_settings')
  } catch {
    return null
  }
}

/**
 * Sync settings to Rust backend when changed in UI
 */
export async function syncSettingsToBackend(settings) {
  if (!isTauri) return
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    await invoke('update_app_settings', { settings })
  } catch {
    console.warn('Failed to sync settings to backend')
  }
}

/**
 * Register global shortcut (Ctrl+Shift+T)
 * The shortcut is pre-registered in Rust main.rs via Builder.
 * This function just confirms availability to the frontend.
 */
export async function registerGlobalShortcut() {
  if (!isTauri) return false
  try {
    console.log('Global shortcut Ctrl+Shift+T is pre-registered in Rust backend')
    return true
  } catch (err) {
    console.warn('Failed to check global shortcut:', err)
    return false
  }
}

/**
 * 检查应用更新
 * @returns {{ available: boolean, version?: string, body?: string }} 更新信息
 */
export async function checkUpdate() {
  if (!isTauri) return { available: false }
  try {
    const { check } = await import('@tauri-apps/plugin-updater')
    const update = await check()
    if (update) {
      return {
        available: true,
        version: update.version,
        body: update.body,
        raw: update,
      }
    }
    return { available: false }
  } catch (err) {
    console.warn('检查更新失败:', err)
    return { available: false, error: err.message }
  }
}

/**
 * 安装更新
 * @param {object} updateRaw - checkUpdate 返回的 raw 对象
 */
export async function installUpdate(updateRaw) {
  if (!isTauri || !updateRaw) return false
  try {
    const { install } = await import('@tauri-apps/plugin-updater')
    await install(updateRaw)
    return true
  } catch (err) {
    console.warn('安装更新失败:', err)
    return false
  }
}

/**
 * 记录错误日志到后端文件
 * @param {string} message - 错误信息
 */
export async function logError(message) {
  if (!isTauri) {
    console.warn('[ErrorLog]', message)
    return
  }
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    await invoke('log_error', { message })
  } catch (err) {
    console.warn('记录错误日志失败:', err)
  }
}
