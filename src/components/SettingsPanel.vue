<!-- SettingsPanel.vue - 设置面板 -->
<script setup>
import { ref } from 'vue'

defineProps({
  showSettings: Boolean,
  isAlwaysOnTop: Boolean,
  isAutoStartEnabled: Boolean,
  isDailyReminderEnabled: Boolean,
  reminderHour: Number,
  reminderMinute: Number,
  isTauri: Boolean,
  isShortcutEnabled: Boolean,
  checkingUpdate: Boolean,
  updateStatus: String,
  updateInfo: [Object, null],
  installingUpdate: Boolean,
})

const emit = defineEmits([
  'toggleAlwaysOnTop', 'toggleAutoStart', 'toggleGlobalShortcut',
  'toggleDailyReminder', 'update:reminderHour', 'update:reminderMinute',
  'syncReminderTime', 'checkForUpdate', 'installUpdateNow',
])

// ─── 数据导出/导入 ──────────────────────────────────────────
const fileInput = ref(null)
const importStatus = ref('')  // '', 'success', 'error'

function exportData() {
  try {
    const data = {
      todos: JSON.parse(localStorage.getItem('todo-flow-data') || '[]'),
      settings: JSON.parse(localStorage.getItem('todo-flow-settings') || '{}'),
      exportDate: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `todo-flow-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    // ignore
  }
}

function triggerImport() {
  fileInput.value?.click()
}

function handleImport(event) {
  importStatus.value = ''
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      if (data.todos && data.settings) {
        localStorage.setItem('todo-flow-data', JSON.stringify(data.todos))
        localStorage.setItem('todo-flow-settings', JSON.stringify(data.settings))
        importStatus.value = 'success'
        // 刷新页面以应用导入的数据
        setTimeout(() => location.reload(), 800)
      } else {
        importStatus.value = 'error'
      }
    } catch {
      importStatus.value = 'error'
    }
  }
  reader.readAsText(file)
  // 重置 input 以便重复选择同一文件
  event.target.value = ''
}
</script>

<template>
  <Transition name="settings">
    <div v-show="showSettings" class="mt-8 animate-slide-up">
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
        <h3 class="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          设置
        </h3>

        <div class="space-y-5">
          <!-- 始终置顶 -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-200">📌 始终置顶</p>
              <p class="text-xs text-gray-500">窗口始终显示在最上层</p>
            </div>
            <button
              @click="emit('toggleAlwaysOnTop')"
              :class="['relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200', isAlwaysOnTop ? 'bg-purple-600' : 'bg-gray-600']"
            >
              <span :class="['inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200', isAlwaysOnTop ? 'translate-x-6' : 'translate-x-1']" />
            </button>
          </div>

          <!-- 开机自启 -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-200">☀️ 开机自启</p>
              <p class="text-xs text-gray-500">Windows 开机自动启动 Todo Flow</p>
            </div>
            <button
              @click="emit('toggleAutoStart')"
              :disabled="!isTauri"
              :class="['relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed', isAutoStartEnabled ? 'bg-purple-600' : 'bg-gray-600']"
            >
              <span :class="['inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200', isAutoStartEnabled ? 'translate-x-6' : 'translate-x-1']" />
            </button>
          </div>

          <!-- 全局快捷键 -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-200">⌨️ 全局快捷键</p>
              <p class="text-xs text-gray-500">Ctrl+Shift+T 切换窗口置顶</p>
            </div>
            <button
              @click="emit('toggleGlobalShortcut')"
              :disabled="!isTauri"
              :class="['relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed', isShortcutEnabled ? 'bg-purple-600' : 'bg-gray-600']"
            >
              <span :class="['inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200', isShortcutEnabled ? 'translate-x-6' : 'translate-x-1']" />
            </button>
          </div>

          <!-- 每日提醒 -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-200">🔔 每日提醒</p>
              <p class="text-xs text-gray-500">每天固定时间提醒你设置待办</p>
            </div>
            <button
              @click="emit('toggleDailyReminder')"
              :class="['relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200', isDailyReminderEnabled ? 'bg-purple-600' : 'bg-gray-600']"
            >
              <span :class="['inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200', isDailyReminderEnabled ? 'translate-x-6' : 'translate-x-1']" />
            </button>
          </div>

          <!-- 提醒时间 -->
          <div v-if="isDailyReminderEnabled" class="space-y-2">
            <p class="text-sm font-medium text-gray-200">⏰ 提醒时间</p>
            <div class="flex items-center gap-3">
              <input
                :value="reminderHour"
                @input="emit('update:reminderHour', Number($event.target.value)); emit('syncReminderTime')"
                type="number" min="0" max="23"
                class="w-16 bg-gray-700/50 text-gray-300 text-sm rounded-lg px-3 py-2 outline-none border border-gray-600/30 focus:border-purple-500/50 transition-colors text-center"
              />
              <span class="text-gray-500">时</span>
              <input
                :value="reminderMinute"
                @input="emit('update:reminderMinute', Number($event.target.value)); emit('syncReminderTime')"
                type="number" min="0" max="59"
                class="w-16 bg-gray-700/50 text-gray-300 text-sm rounded-lg px-3 py-2 outline-none border border-gray-600/30 focus:border-purple-500/50 transition-colors text-center"
              />
              <span class="text-gray-500">分</span>
            </div>
            <p class="text-xs text-gray-600">每日 {{ String(reminderHour).padStart(2, '0') }}:{{ String(reminderMinute).padStart(2, '0') }} 提醒</p>
          </div>

          <!-- 检查更新 -->
          <div class="flex items-center justify-between pt-2 border-t border-gray-700/30">
            <div>
              <p class="text-sm font-medium text-gray-200">🔄 检查更新</p>
              <p class="text-xs text-gray-500">
                <template v-if="updateStatus === 'checking'">正在检查...</template>
                <template v-else-if="updateStatus === 'available'">发现新版本！</template>
                <template v-else-if="updateStatus === 'up-to-date'">已是最新版本</template>
                <template v-else-if="updateStatus === 'error'">检查失败</template>
                <template v-else>v0.1.0</template>
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="updateStatus === 'available' && updateInfo"
                @click="emit('installUpdateNow')"
                :disabled="installingUpdate"
                class="text-xs px-3 py-1.5 rounded-lg bg-green-600/30 text-green-300 hover:bg-green-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ installingUpdate ? '安装中...' : '安装更新' }}
              </button>
              <button
                @click="emit('checkForUpdate')"
                :disabled="!isTauri || checkingUpdate"
                class="text-xs px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ checkingUpdate ? '...' : updateStatus === 'available' ? '重新检查' : '检查' }}
              </button>
            </div>
          </div>

          <!-- 数据导出/导入 -->
          <div class="flex items-center justify-between pt-2 border-t border-gray-700/30">
            <div>
              <p class="text-sm font-medium text-gray-200">💾 数据管理</p>
              <p class="text-xs text-gray-500">
                <template v-if="importStatus === 'success'">导入成功，即将刷新...</template>
                <template v-else-if="importStatus === 'error'">文件格式不正确</template>
                <template v-else>导出或导入任务数据</template>
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="exportData"
                class="text-xs px-3 py-1.5 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 transition-colors"
              >
                导出
              </button>
              <button
                @click="triggerImport"
                class="text-xs px-3 py-1.5 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 transition-colors"
              >
                导入
              </button>
              <input
                ref="fileInput"
                type="file"
                accept=".json"
                class="hidden"
                @change="handleImport"
              />
            </div>
          </div>

          <!-- 浏览器模式提示 -->
          <div v-if="!isTauri" class="pt-2 border-t border-gray-700/30">
            <p class="text-xs text-yellow-500/80 flex items-center gap-2">
              <span>⚠️</span>
              <span>当前运行在浏览器中，桌面功能需要打包为桌面应用</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.settings-enter-active { transition: all 0.3s ease-out; }
.settings-leave-active { transition: all 0.2s ease-in; }
.settings-enter-from { opacity: 0; transform: translateY(-10px); }
.settings-leave-to { opacity: 0; transform: translateY(-10px); }
</style>