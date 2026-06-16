import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Tauri integration
import { listen, requestNotificationPermission, isRunningInTauri, logError } from './utils/tauriBridge.js'

// 全局 JS 错误捕获
window.addEventListener('error', (event) => {
  const msg = `${event.message} @ ${event.filename}:${event.lineno}:${event.colno}`
  logError(`[JS] ${msg}`)
})

// 全局 Promise 拒绝捕获
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason?.message || event.reason || 'Unknown rejection'
  logError(`[Promise] ${reason}`)
})

// 先挂载 Vue 应用，确保界面渲染
createApp(App).mount('#app')

// 在 Tauri 环境中初始化通知权限和事件监听（不阻塞界面）
async function initTauri() {
  if (!isRunningInTauri()) return

  try {
    // Request notification permission on mount
    await requestNotificationPermission()

    // Listen for daily reminder event from Rust backend
    await listen('daily-reminder', async () => {
      console.log('Received daily reminder event')
    })

    // Listen for settings changed from Rust backend
    await listen('settings-changed', async (event) => {
      console.log('Settings changed:', event.payload)
    })
  } catch (err) {
    console.warn('Tauri init failed:', err)
  }
}

// 异步初始化，不阻塞界面渲染
initTauri()
