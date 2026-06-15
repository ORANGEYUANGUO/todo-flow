import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Tauri integration
import { listen, requestNotificationPermission } from './utils/tauriBridge.js'

async function initTauri() {
  if (typeof window === 'undefined' || !window.__TAURI__) return

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
}

initTauri().then(() => {
  createApp(App).mount('#app')
})
