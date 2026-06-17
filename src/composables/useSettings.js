/**
 * useSettings - 设置状态与 Tauri 交互逻辑
 * 从 TodoList.vue 抽取，负责所有设置项和更新检查
 */
import { ref } from 'vue'
import {
  setAlwaysOnTop,
  checkAlwaysOnTop,
  toggleAutostart,
  getAutostartEnabled,
  listen,
  sendNotification,
  isRunningInTauri,
  syncSettingsToBackend,
  registerGlobalShortcut,
  getAppSettings,
  checkUpdate,
  installUpdate,
} from '../utils/tauriBridge.js'

export function useSettings() {
  // ─── 响应式状态 ────────────────────────────────────────
  const showSettings = ref(false)
  const isAlwaysOnTop = ref(false)
  const isAutoStartEnabled = ref(false)
  const isDailyReminderEnabled = ref(true)
  const reminderHour = ref(9)
  const reminderMinute = ref(0)
  const isTauri = ref(isRunningInTauri())
  const isShortcutEnabled = ref(false)

  // 更新状态
  const checkingUpdate = ref(false)
  const updateStatus = ref('')
  const updateInfo = ref(null)
  const installingUpdate = ref(false)

  // ─── 持久化 ──────────────────────────────────────────
  function saveSettingsToStorage() {
    try {
      localStorage.setItem('todo-flow-settings', JSON.stringify({
        alwaysOnTop: isAlwaysOnTop.value,
        autoStart: isAutoStartEnabled.value,
        dailyReminder: isDailyReminderEnabled.value,
        reminderHour: reminderHour.value,
        reminderMinute: reminderMinute.value,
        shortcutEnabled: isShortcutEnabled.value,
      }))
    } catch {
      // ignore
    }
  }

  function loadSettingsFromStorage() {
    try {
      const settings = localStorage.getItem('todo-flow-settings')
      if (settings) {
        const s = JSON.parse(settings)
        isAlwaysOnTop.value = s.alwaysOnTop || false
        isAutoStartEnabled.value = s.autoStart || false
        isDailyReminderEnabled.value = s.dailyReminder !== false
        reminderHour.value = s.reminderHour ?? 9
        reminderMinute.value = s.reminderMinute ?? 0
        isShortcutEnabled.value = s.shortcutEnabled ?? false
      }
    } catch {
      // ignore
    }
  }

  // ─── 后端同步 ────────────────────────────────────────
  async function syncReminderSettings() {
    if (!isTauri.value) return
    await syncSettingsToBackend({
      daily_reminder_enabled: isDailyReminderEnabled.value,
      reminder_hour: reminderHour.value,
      reminder_minute: reminderMinute.value,
    })
  }

  async function syncReminderTime() {
    if (!isTauri.value) return
    await syncSettingsToBackend({
      daily_reminder_enabled: isDailyReminderEnabled.value,
      reminder_hour: reminderHour.value,
      reminder_minute: reminderMinute.value,
    })
  }

  // ─── 设置操作 ────────────────────────────────────────
  async function toggleAlwaysOnTop() {
    isAlwaysOnTop.value = !isAlwaysOnTop.value
    await setAlwaysOnTop(isAlwaysOnTop.value)
    saveSettingsToStorage()
    if (isTauri.value) await syncReminderSettings()
  }

  async function toggleAutoStart() {
    if (!isTauri.value) return
    const newState = await toggleAutostart()
    isAutoStartEnabled.value = newState
    saveSettingsToStorage()
    if (isTauri.value) await syncReminderSettings()
  }

  async function toggleGlobalShortcut() {
    if (!isTauri.value) return
    isShortcutEnabled.value = !isShortcutEnabled.value
    saveSettingsToStorage()
  }

  async function toggleDailyReminder() {
    isDailyReminderEnabled.value = !isDailyReminderEnabled.value
    saveSettingsToStorage()
    await syncReminderSettings()
  }

  // ─── 后端设置加载 ────────────────────────────────────
  async function loadTauriSettings() {
    if (!isTauri.value) return

    try {
      isAutoStartEnabled.value = await getAutostartEnabled()
      isAlwaysOnTop.value = await checkAlwaysOnTop()

      const backendSettings = await getAppSettings()
      if (backendSettings) {
        isDailyReminderEnabled.value = backendSettings.daily_reminder_enabled
        reminderHour.value = backendSettings.reminder_hour
        reminderMinute.value = backendSettings.reminder_minute
      }
    } catch {
      // ignore
    }
  }

  // ─── 事件监听 ────────────────────────────────────────
  async function setupTauriListeners() {
    if (!isTauri.value) return

    // 每日提醒
    await listen('daily-reminder', async () => {
      if (isDailyReminderEnabled.value) {
        sendNotification('Todo Flow', '今天还没有安排任务吗？打开 Todo Flow 规划一下吧！')
      }
    })

    // 全局快捷键切换置顶
    await listen('always-on-top-toggle', async () => {
      isAlwaysOnTop.value = !isAlwaysOnTop.value
      await setAlwaysOnTop(isAlwaysOnTop.value)
      saveSettingsToStorage()
    })

    // 检查快捷键可用性
    isShortcutEnabled.value = await registerGlobalShortcut()

    // 后端设置变更同步
    await listen('settings-changed', async (event) => {
      console.log('Settings changed from backend:', event.payload)
      if (event.payload) {
        isDailyReminderEnabled.value = event.payload.daily_reminder_enabled
        reminderHour.value = event.payload.reminder_hour
        reminderMinute.value = event.payload.reminder_minute
      }
    })
  }

  // ─── 更新 ────────────────────────────────────────────
  async function checkForUpdate() {
    if (!isTauri.value) return
    checkingUpdate.value = true
    updateStatus.value = 'checking'
    updateInfo.value = null
    try {
      const result = await checkUpdate()
      if (result.available) {
        updateStatus.value = 'available'
        updateInfo.value = result.raw
      } else {
        updateStatus.value = 'up-to-date'
      }
    } catch {
      updateStatus.value = 'error'
    } finally {
      checkingUpdate.value = false
    }
  }

  async function installUpdateNow() {
    if (!isTauri.value || !updateInfo.value) return
    installingUpdate.value = true
    try {
      await installUpdate(updateInfo.value)
    } catch {
      updateStatus.value = 'error'
    } finally {
      installingUpdate.value = false
    }
  }

  return {
    // 状态
    showSettings, isAlwaysOnTop, isAutoStartEnabled, isDailyReminderEnabled,
    reminderHour, reminderMinute, isTauri, isShortcutEnabled,
    checkingUpdate, updateStatus, updateInfo, installingUpdate,
    // 持久化
    saveSettingsToStorage, loadSettingsFromStorage,
    // 同步
    syncReminderSettings, syncReminderTime,
    // 操作
    toggleAlwaysOnTop, toggleAutoStart, toggleGlobalShortcut, toggleDailyReminder,
    // 加载
    loadTauriSettings, setupTauriListeners,
    // 更新
    checkForUpdate, installUpdateNow,
  }
}