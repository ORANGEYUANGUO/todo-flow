import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Tauri integration
import { requestNotificationPermission, isRunningInTauri, logError } from './utils/tauriBridge.js'

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

// 在 Tauri 环境中初始化通知权限（不阻塞界面，事件监听由 TodoList.vue 负责）
async function initTauri() {
  if (!isRunningInTauri()) return

  try {
    // Request notification permission on mount
    await requestNotificationPermission()
  } catch (err) {
    console.warn('Tauri init failed:', err)
  }
}

// 异步初始化，不阻塞界面渲染
initTauri()
