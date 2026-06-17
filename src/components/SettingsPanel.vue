<!-- SettingsPanel.vue - 浅色设置面板 -->
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

// 数据导出/导入
const fileInput = ref(null)
const importStatus = ref('')

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
  } catch { /* ignore */ }
}

function triggerImport() { fileInput.value?.click() }

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
        setTimeout(() => location.reload(), 800)
      } else { importStatus.value = 'error' }
    } catch { importStatus.value = 'error' }
  }
  reader.readAsText(file)
  event.target.value = ''
}
</script>

<template>
  <Transition name="settings">
    <div v-show="showSettings" class="animate-slide-up">
      <div
        class="bg-white/85 backdrop-blur-md rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),_0_8px_24px_rgba(0,0,0,0.04)] mb-3 transition-all duration-250 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04),_0_12px_32px_rgba(0,0,0,0.06)] hover:-translate-y-px"
      >
        <div class="flex items-center gap-2.5 text-sm font-semibold text-[#0F172A] pb-4 mb-4 border-b border-[#F1F5F9]">
          <svg width="16" height="16" fill="none" stroke="#64748B" viewBox="0 0 24 24" class="flex-shrink-0">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          设置
        </div>

        <div class="space-y-0">
          <!-- 始终置顶 -->
          <div class="flex items-center justify-between py-3.5 border-b border-[#F1F5F9] hover:pl-1 transition-all duration-200">
            <div>
              <p class="text-sm font-medium text-[#0F172A]">始终置顶</p>
              <p class="text-xs text-[#94A3B8] mt-0.5">窗口始终显示在最上层</p>
            </div>
            <button
              @click="emit('toggleAlwaysOnTop')"
              :class="['relative h-[22px] w-[38px] rounded-[11px] transition-all duration-300 cursor-pointer flex-shrink-0',
                isAlwaysOnTop ? 'bg-[#0EA5E9] shadow-[0_0_8px_rgba(14,165,233,0.2)]' : 'bg-[#CBD5E1]']"
            >
              <span :class="['inline-block w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.1)] mt-[3px]',
                isAlwaysOnTop ? 'translate-x-[19px]' : 'translate-x-[3px]']" />
            </button>
          </div>

          <!-- 开机自启 -->
          <div class="flex items-center justify-between py-3.5 border-b border-[#F1F5F9] hover:pl-1 transition-all duration-200">
            <div>
              <p class="text-sm font-medium text-[#0F172A]">开机自启</p>
              <p class="text-xs text-[#94A3B8] mt-0.5">Windows 开机自动启动</p>
            </div>
            <button
              @click="emit('toggleAutoStart')"
              :disabled="!isTauri"
              :class="['relative h-[22px] w-[38px] rounded-[11px] transition-all duration-300 cursor-pointer flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed',
                isAutoStartEnabled ? 'bg-[#0EA5E9] shadow-[0_0_8px_rgba(14,165,233,0.2)]' : 'bg-[#CBD5E1]']"
            >
              <span :class="['inline-block w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.1)] mt-[3px]',
                isAutoStartEnabled ? 'translate-x-[19px]' : 'translate-x-[3px]']" />
            </button>
          </div>

          <!-- 全局快捷键 -->
          <div class="flex items-center justify-between py-3.5 border-b border-[#F1F5F9] hover:pl-1 transition-all duration-200">
            <div>
              <p class="text-sm font-medium text-[#0F172A]">全局快捷键</p>
              <p class="text-xs text-[#94A3B8] mt-0.5">Ctrl+Shift+T 切换窗口置顶</p>
            </div>
            <button
              @click="emit('toggleGlobalShortcut')"
              :disabled="!isTauri"
              :class="['relative h-[22px] w-[38px] rounded-[11px] transition-all duration-300 cursor-pointer flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed',
                isShortcutEnabled ? 'bg-[#0EA5E9] shadow-[0_0_8px_rgba(14,165,233,0.2)]' : 'bg-[#CBD5E1]']"
            >
              <span :class="['inline-block w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.1)] mt-[3px]',
                isShortcutEnabled ? 'translate-x-[19px]' : 'translate-x-[3px]']" />
            </button>
          </div>

          <!-- 每日提醒 -->
          <div class="flex items-center justify-between py-3.5 border-b border-[#F1F5F9] hover:pl-1 transition-all duration-200">
            <div>
              <p class="text-sm font-medium text-[#0F172A]">每日提醒</p>
              <p class="text-xs text-[#94A3B8] mt-0.5">每天固定时间提醒你设置待办</p>
            </div>
            <button
              @click="emit('toggleDailyReminder')"
              :class="['relative h-[22px] w-[38px] rounded-[11px] transition-all duration-300 cursor-pointer flex-shrink-0',
                isDailyReminderEnabled ? 'bg-[#0EA5E9] shadow-[0_0_8px_rgba(14,165,233,0.2)]' : 'bg-[#CBD5E1]']"
            >
              <span :class="['inline-block w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.1)] mt-[3px]',
                isDailyReminderEnabled ? 'translate-x-[19px]' : 'translate-x-[3px]']" />
            </button>
          </div>

          <!-- 提醒时间 -->
          <div v-if="isDailyReminderEnabled" class="py-3.5 border-b border-[#F1F5F9]">
            <p class="text-sm font-medium text-[#0F172A] mb-2.5">提醒时间</p>
            <div class="flex items-center gap-3">
              <input
                :value="reminderHour"
                @input="emit('update:reminderHour', Number($event.target.value)); emit('syncReminderTime')"
                type="number" min="0" max="23"
                class="w-16 bg-[#F8FAFC] text-[#0F172A] text-sm rounded-lg px-3 py-2 outline-none border border-[#E2E8F0] hover:border-[#94A3B8] focus:border-[#0EA5E9] transition-colors text-center"
              />
              <span class="text-[#64748B] text-sm">时</span>
              <input
                :value="reminderMinute"
                @input="emit('update:reminderMinute', Number($event.target.value)); emit('syncReminderTime')"
                type="number" min="0" max="59"
                class="w-16 bg-[#F8FAFC] text-[#0F172A] text-sm rounded-lg px-3 py-2 outline-none border border-[#E2E8F0] hover:border-[#94A3B8] focus:border-[#0EA5E9] transition-colors text-center"
              />
              <span class="text-[#64748B] text-sm">分</span>
            </div>
            <p class="text-xs text-[#94A3B8] mt-2">每日 {{ String(reminderHour).padStart(2, '0') }}:{{ String(reminderMinute).padStart(2, '0') }} 提醒</p>
          </div>

          <!-- 检查更新 -->
          <div class="flex items-center justify-between py-3.5 border-b border-[#F1F5F9] hover:pl-1 transition-all duration-200">
            <div>
              <p class="text-sm font-medium text-[#0F172A]">检查更新</p>
              <p class="text-xs text-[#94A3B8] mt-0.5">
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
                class="text-xs font-medium px-3 py-1.5 rounded-lg bg-[rgba(14,165,233,0.1)] text-[#0EA5E9] hover:bg-[rgba(14,165,233,0.18)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
              >
                {{ installingUpdate ? '安装中...' : '安装更新' }}
              </button>
              <button
                @click="emit('checkForUpdate')"
                :disabled="!isTauri || checkingUpdate"
                class="text-xs font-medium px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-transparent text-[#64748B] hover:border-[#94A3B8] hover:text-[#0F172A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
              >
                {{ checkingUpdate ? '...' : updateStatus === 'available' ? '重新检查' : '检查' }}
              </button>
            </div>
          </div>

          <!-- 数据导出/导入 -->
          <div class="flex items-center justify-between py-3.5 border-b border-[#F1F5F9] hover:pl-1 transition-all duration-200">
            <div>
              <p class="text-sm font-medium text-[#0F172A]">数据管理</p>
              <p class="text-xs text-[#94A3B8] mt-0.5">
                <template v-if="importStatus === 'success'">导入成功，即将刷新...</template>
                <template v-else-if="importStatus === 'error'">文件格式不正确</template>
                <template v-else>导出或导入任务数据</template>
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="exportData"
                class="text-xs font-medium px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-transparent text-[#64748B] hover:border-[#94A3B8] hover:text-[#0F172A] transition-all duration-200 cursor-pointer"
              >
                导出
              </button>
              <button
                @click="triggerImport"
                class="text-xs font-medium px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-transparent text-[#64748B] hover:border-[#94A3B8] hover:text-[#0F172A] transition-all duration-200 cursor-pointer"
              >
                导入
              </button>
              <input ref="fileInput" type="file" accept=".json" class="hidden" @change="handleImport" />
            </div>
          </div>

          <!-- 浏览器模式提示 -->
          <div v-if="!isTauri" class="pt-3.5">
            <p class="text-xs text-[#F59E0B]/70">
              当前运行在浏览器中，桌面功能需要打包为桌面应用
            </p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.settings-enter-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.settings-leave-active { transition: all 0.2s ease-in; }
.settings-enter-from { opacity: 0; transform: translateY(-10px); }
.settings-leave-to { opacity: 0; transform: translateY(-10px); }
</style>