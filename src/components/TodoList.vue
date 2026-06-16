<script setup>
import { ref, computed, watch, onMounted, Transition, TransitionGroup } from 'vue'

// Tauri bridge imports
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
} from '../utils/tauriBridge.js'

// ─── Types ───────────────────────────────────────────────
// Todo: { id, text, completed, createdAt, scheduledAt, priority, category, reminder }

const priorities = [
  { value: 'none', label: '无', color: 'bg-gray-500', textColor: 'text-gray-500' },
  { value: 'low', label: '低', color: 'bg-green-500', textColor: 'text-green-400' },
  { value: 'medium', label: '中', color: 'bg-yellow-500', textColor: 'text-yellow-400' },
  { value: 'high', label: '高', color: 'bg-red-500', textColor: 'text-red-400' },
]

const categories = [
  { value: 'personal', label: '个人', icon: '👤', color: 'from-blue-500 to-cyan-500' },
  { value: 'work', label: '工作', icon: '💼', color: 'from-purple-500 to-pink-500' },
  { value: 'study', label: '学习', icon: '📚', color: 'from-orange-500 to-amber-500' },
  { value: 'health', label: '健康', icon: '💪', color: 'from-green-500 to-emerald-500' },
  { value: 'other', label: '其他', icon: '📌', color: 'from-gray-500 to-slate-500' },
]

// ─── State ───────────────────────────────────────────────
const todos = ref([])
const inputText = ref('')
const selectedPriority = ref('none')
const selectedCategory = ref('personal')
const showTimePicker = ref(false)
const scheduledDate = ref('')
const scheduledTime = ref('')
const reminderMinutes = ref(15)

// Filter state
const filter = ref('all') // all | active | completed | by-priority | by-category
const activePriorityFilter = ref('all')
const activeCategoryFilter = ref('all')
const sortBy = ref('created') // created | scheduled | priority

// UI state
const newConfetti = ref([])
const completedCount = ref(0)

// ─── Settings State ──────────────────────────────────────
const showSettings = ref(false)
const isAlwaysOnTop = ref(false)
const isAutoStartEnabled = ref(false)
const isDailyReminderEnabled = ref(true)
const reminderHour = ref(9)
const reminderMinute = ref(0)
const isTauri = ref(isRunningInTauri())
const isShortcutEnabled = ref(false)
const checkingUpdate = ref(false)
const updateStatus = ref('')  // '', 'checking', 'available', 'up-to-date', 'error'

// ─── Computed ────────────────────────────────────────────
const filteredTodos = computed(() => {
  let result = [...todos.value]

  // Status filter
  if (filter.value === 'active') result = result.filter(t => !t.completed)
  if (filter.value === 'completed') result = result.filter(t => t.completed)

  // Priority filter
  if (activePriorityFilter.value !== 'all') {
    result = result.filter(t => t.priority === activePriorityFilter.value)
  }

  // Category filter
  if (activeCategoryFilter.value !== 'all') {
    result = result.filter(t => t.category === activeCategoryFilter.value)
  }

  // Sort
  result.sort((a, b) => {
    if (sortBy.value === 'priority') {
      const pOrder = { high: 0, medium: 1, low: 2, none: 3 }
      return pOrder[a.priority] - pOrder[b.priority]
    }
    if (sortBy.value === 'scheduled') {
      if (!a.scheduledAt && !b.scheduledAt) return 0
      if (!a.scheduledAt) return 1
      if (!b.scheduledAt) return -1
      return new Date(a.scheduledAt) - new Date(b.scheduledAt)
    }
    return b.createdAt - a.createdAt
  })

  return result
})

const stats = computed(() => {
  const total = todos.value.length
  const completed = todos.value.filter(t => t.completed).length
  const active = total - completed
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  return { total, completed, active, percentage }
})

const upcomingReminders = computed(() => {
  const now = Date.now()
  return todos.value
    .filter(t => t.reminder && !t.completed && t.scheduledAt)
    .filter(t => {
      const sched = new Date(t.scheduledAt).getTime()
      const reminderTime = sched - (t.reminder * 60 * 1000)
      return reminderTime <= now && reminderTime + 30000 >= now // 30s window
    })
    .map(t => ({
      text: t.text,
      time: t.reminder + ' 分钟后'
    }))
})

// ─── Actions ─────────────────────────────────────────────
function addTodo() {
  const text = inputText.value.trim()
  if (!text) return

  const todo = {
    id: crypto.randomUUID(),
    text,
    completed: false,
    createdAt: Date.now(),
    scheduledAt: scheduledDate.value && scheduledTime.value
      ? `${scheduledDate.value}T${scheduledTime.value}`
      : null,
    priority: selectedPriority.value,
    category: selectedCategory.value,
    reminder: showTimePicker.value && scheduledDate.value && scheduledTime.value
      ? Number(reminderMinutes.value)
      : null,
  }

  todos.value.unshift(todo)
  inputText.value = ''
  selectedPriority.value = 'none'
  showTimePicker.value = false
  scheduledDate.value = ''
  scheduledTime.value = ''
}

function toggleTodo(id) {
  const todo = todos.value.find(t => t.id === id)
  if (todo) {
    todo.completed = !todo.completed
    if (todo.completed) {
      spawnConfetti()
      completedCount.value++
    }
  }
}

function deleteTodo(id) {
  todos.value = todos.value.filter(t => t.id !== id)
}

function clearCompleted() {
  todos.value = todos.value.filter(t => !t.completed)
}

function spawnConfetti() {
  const pieces = Array.from({ length: 8 }, (_, i) => ({
    id: crypto.randomUUID(),
    x: Math.random() * 100,
    color: ['#a855f7', '#ec4899', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'][i],
    delay: Math.random() * 0.3,
  }))
  newConfetti.value = [...newConfetti.value, ...pieces]
  setTimeout(() => {
    newConfetti.value = newConfetti.value.filter(c => !pieces.find(p => p.id === c.id))
  }, 1500)
}

function isOverdue(todo) {
  if (!todo.scheduledAt || todo.completed) return false
  return new Date(todo.scheduledAt) < new Date()
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hours = String(d.getHours()).padStart(2, '0')
  const mins = String(d.getMinutes()).padStart(2, '0')
  return `${month}/${day} ${hours}:${mins}`
}

function getRemainingTime(todo) {
  if (!todo.scheduledAt || todo.completed) return null
  const sched = new Date(todo.scheduledAt).getTime()
  const now = Date.now()
  const diff = sched - now

  if (diff <= 0) return '已过期'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) return `${hours}小时${mins}分后`
  return `${mins}分钟后`
}

function loadFromStorage() {
  try {
    const stored = localStorage.getItem('todo-flow-data')
    if (stored) {
      todos.value = JSON.parse(stored)
    }

    // Load settings from storage
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

function saveSettings() {
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

async function syncReminderSettings() {
  if (!isTauri.value) return
  await syncSettingsToBackend({
    daily_reminder_enabled: isDailyReminderEnabled.value,
    reminder_hour: reminderHour.value,
    reminder_minute: reminderMinute.value,
  })
}

/**
 * Sync reminder time to backend (called when hour/minute changes)
 */
async function syncReminderTime() {
  if (!isTauri.value) return
  await syncSettingsToBackend({
    daily_reminder_enabled: isDailyReminderEnabled.value,
    reminder_hour: reminderHour.value,
    reminder_minute: reminderMinute.value,
  })
}

async function toggleAlwaysOnTop() {
  isAlwaysOnTop.value = !isAlwaysOnTop.value
  await setAlwaysOnTop(isAlwaysOnTop.value)
  saveSettings()
  if (isTauri.value) {
    await syncSettingsToBackend({
      daily_reminder_enabled: isDailyReminderEnabled.value,
      reminder_hour: reminderHour.value,
      reminder_minute: reminderMinute.value,
    })
  }
}

async function toggleAutoStart() {
  if (!isTauri.value) return
  const newState = await toggleAutostart()
  isAutoStartEnabled.value = newState
  saveSettings()
  if (isTauri.value) {
    await syncSettingsToBackend({
      daily_reminder_enabled: isDailyReminderEnabled.value,
      reminder_hour: reminderHour.value,
      reminder_minute: reminderMinute.value,
    })
  }
}

async function loadSettings() {
  if (!isTauri.value) return

  try {
    isAutoStartEnabled.value = await getAutostartEnabled()
    isAlwaysOnTop.value = await checkAlwaysOnTop()

    // Fetch backend settings (daily reminder, reminder time)
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

/**
 * Toggle global shortcut registration
 * The shortcut is pre-registered in Rust main.rs via Builder.
 * This toggle just controls whether the user has enabled it in settings.
 */
async function toggleGlobalShortcut() {
  if (!isTauri.value) return
  // Since the shortcut is always registered in Rust,
  // we just toggle the on/off indicator
  isShortcutEnabled.value = !isShortcutEnabled.value
  saveSettings()
}

async function checkForUpdate() {
  if (!isTauri.value) return
  checkingUpdate.value = true
  updateStatus.value = 'checking'
  try {
    const result = await checkUpdate()
    if (result.available) {
      updateStatus.value = 'available'
    } else {
      updateStatus.value = 'up-to-date'
    }
  } catch {
    updateStatus.value = 'error'
  } finally {
    checkingUpdate.value = false
  }
}

// ─── Tauri Event Listeners ───────────────────────────────
async function setupTauriListeners() {
  if (!isTauri.value) return

  // Listen for daily reminder events from Rust backend
  await listen('daily-reminder', async () => {
    if (isDailyReminderEnabled.value) {
      sendNotification('Todo Flow', '今天还没有安排任务吗？打开 Todo Flow 规划一下吧！')
    }
  })

  // Listen for always-on-top toggle via global shortcut (Ctrl+Shift+T)
  await listen('always-on-top-toggle', async () => {
    isAlwaysOnTop.value = !isAlwaysOnTop.value
    await setAlwaysOnTop(isAlwaysOnTop.value)
    saveSettings()
  })

  // Try to register the global shortcut
  isShortcutEnabled.value = await registerGlobalShortcut()

  // Listen for settings-changed events from Rust backend
  await listen('settings-changed', async (event) => {
    console.log('Settings changed from backend:', event.payload)
    if (event.payload) {
      isDailyReminderEnabled.value = event.payload.daily_reminder_enabled
      reminderHour.value = event.payload.reminder_hour
      reminderMinute.value = event.payload.reminder_minute
    }
  })
}

function saveToStorage() {
  try {
    localStorage.setItem('todo-flow-data', JSON.stringify(todos.value))
  } catch {
    // ignore
  }
}

watch(todos, saveToStorage, { deep: true })

onMounted(async () => {
  loadFromStorage()
  // Load Tauri-specific settings
  await loadSettings()
  // Setup event listeners
  await setupTauriListeners()
  // Demo data if empty
  if (todos.value.length === 0) {
    todos.value = [
      {
        id: crypto.randomUUID(),
        text: '试试添加一个新的 Todo ✨',
        completed: false,
        createdAt: Date.now(),
        scheduledAt: null,
        priority: 'medium',
        category: 'personal',
        reminder: null,
      },
      {
        id: crypto.randomUUID(),
        text: '这个 Todo 已经完成了',
        completed: true,
        createdAt: Date.now() - 1000,
        scheduledAt: null,
        priority: 'low',
        category: 'personal',
        reminder: null,
      },
    ]
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 text-white">
    <!-- Confetti -->
    <TransitionGroup name="confetti" tag="div" class="fixed inset-0 pointer-events-none z-50">
      <div
        v-for="piece in newConfetti"
        :key="piece.id"
        class="confetti absolute w-2 h-2 rounded-sm"
        :style="{
          left: piece.x + '%',
          top: '-10px',
          backgroundColor: piece.color,
          animationDelay: piece.delay + 's',
        }"
      />
    </TransitionGroup>

    <!-- Reminder notifications -->
    <div class="fixed top-4 right-4 z-40 space-y-2">
      <TransitionGroup name="slide-in">
        <div
          v-for="(reminder, i) in upcomingReminders"
          :key="reminder.text"
          class="bg-purple-600/90 backdrop-blur-sm text-white px-4 py-3 rounded-xl shadow-lg shadow-purple-500/20 text-sm"
        >
          ⏰ {{ reminder.text }} — {{ reminder.time }}
        </div>
      </TransitionGroup>
    </div>

    <!-- Main content -->
    <div class="max-w-2xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="text-center mb-10 animate-slide-up">
        <div class="flex items-center justify-center gap-3 mb-2">
          <h1 class="text-5xl font-bold gradient-animate bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            Todo Flow
          </h1>
          <button
            @click="showSettings = !showSettings"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-purple-400 hover:bg-gray-800/50 transition-all duration-200"
            title="设置"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        <p class="text-gray-400 text-sm">让你的任务像水流一样顺畅</p>
      </div>

      <!-- Stats bar -->
      <div v-if="stats.total > 0" class="mb-8 animate-slide-up">
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm text-gray-400">总进度</span>
            <span class="text-2xl font-bold text-purple-400">{{ stats.percentage }}%</span>
          </div>
          <div class="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
            <div
              class="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 transition-all duration-700 ease-out"
              :style="{ width: stats.percentage + '%' }"
            />
          </div>
          <div class="flex justify-between mt-3 text-xs text-gray-500">
            <span>已完成 {{ stats.completed }} 项</span>
            <span>剩余 {{ stats.active }} 项</span>
          </div>
        </div>
      </div>

      <!-- Input area -->
      <div class="mb-6 animate-slide-up">
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
          <!-- Text input row -->
          <div class="flex items-center p-4 gap-3">
            <div class="flex-1 relative">
              <input
                v-model="inputText"
                @keyup.enter="addTodo"
                type="text"
                placeholder="添加新的任务..."
                class="w-full bg-transparent text-white placeholder-gray-500 text-lg outline-none"
              />
            </div>
            <button
              @click="addTodo"
              :disabled="!inputText.trim()"
              class="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95"
            >
              添加
            </button>
          </div>

          <!-- Priority & Category row -->
          <div class="px-4 pb-3 flex flex-wrap items-center gap-3 border-t border-gray-700/30 pt-3">
            <!-- Priority selector -->
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500">优先级</span>
              <div class="flex gap-1">
                <button
                  v-for="p in priorities"
                  :key="p.value"
                  @click="selectedPriority = p.value"
                  :class="[p.color, 'w-6 h-6 rounded-full transition-all duration-200',
                    selectedPriority === p.value ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800 scale-110' : 'opacity-50 hover:opacity-80']"
                  :title="p.label"
                />
              </div>
            </div>

            <!-- Category selector -->
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500">分类</span>
              <select
                v-model="selectedCategory"
                class="bg-gray-700/50 text-gray-300 text-xs rounded-lg px-2 py-1.5 outline-none border border-gray-600/30 focus:border-purple-500/50 transition-colors"
              >
                <option v-for="c in categories" :key="c.value" :value="c.value">
                  {{ c.icon }} {{ c.label }}
                </option>
              </select>
            </div>

            <!-- Time picker toggle -->
            <div class="flex items-center gap-2">
              <button
                @click="showTimePicker = !showTimePicker"
                :class="['text-xs px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5',
                  showTimePicker
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
                    : 'bg-gray-700/30 text-gray-500 hover:text-gray-300 border border-transparent']"
              >
                ⏰ 时间设置
              </button>
            </div>
          </div>

          <!-- Time picker panel -->
          <Transition name="time-picker">
            <div v-show="showTimePicker" class="px-4 pb-4 pt-2 border-t border-gray-700/30">
              <div class="flex flex-wrap items-end gap-3">
                <!-- Date -->
                <div>
                  <label class="block text-xs text-gray-500 mb-1">日期</label>
                  <input
                    v-model="scheduledDate"
                    type="date"
                    class="bg-gray-700/50 text-gray-300 text-xs rounded-lg px-3 py-2 outline-none border border-gray-600/30 focus:border-purple-500/50 transition-colors"
                  />
                </div>

                <!-- Time -->
                <div>
                  <label class="block text-xs text-gray-500 mb-1">时间</label>
                  <input
                    v-model="scheduledTime"
                    type="time"
                    class="bg-gray-700/50 text-gray-300 text-xs rounded-lg px-3 py-2 outline-none border border-gray-600/30 focus:border-purple-500/50 transition-colors"
                  />
                </div>

                <!-- Reminder -->
                <div>
                  <label class="block text-xs text-gray-500 mb-1">提醒 (分钟)</label>
                  <select
                    v-model="reminderMinutes"
                    class="bg-gray-700/50 text-gray-300 text-xs rounded-lg px-3 py-2 outline-none border border-gray-600/30 focus:border-purple-500/50 transition-colors"
                  >
                    <option :value="5">5 分钟</option>
                    <option :value="15">15 分钟</option>
                    <option :value="30">30 分钟</option>
                    <option :value="60">1 小时</option>
                    <option :value="120">2 小时</option>
                    <option :value="1440">1 天</option>
                  </select>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Filters & Sort -->
      <div v-if="todos.length > 0" class="mb-6 flex flex-wrap items-center justify-between gap-3 animate-slide-up">
        <!-- Status filter -->
        <div class="flex gap-1 bg-gray-800/50 rounded-xl p-1">
          <button
            v-for="f in [{v:'all',l:'全部'},{v:'active',l:'待完成'},{v:'completed',l:'已完成'}]"
            :key="f.v"
            @click="filter = f.v"
            :class="['text-xs px-3 py-1.5 rounded-lg transition-all duration-200',
              filter === f.v ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-gray-500 hover:text-gray-300']"
          >
            {{ f.l }}
          </button>
        </div>

        <!-- Sort & Clear -->
        <div class="flex items-center gap-2">
          <select
            v-model="sortBy"
            class="bg-gray-800/50 text-gray-400 text-xs rounded-lg px-2 py-1.5 outline-none border border-gray-700/30"
          >
            <option value="created">按创建时间</option>
            <option value="scheduled">按计划时间</option>
            <option value="priority">按优先级</option>
          </select>

          <button
            v-if="stats.completed > 0"
            @click="clearCompleted"
            class="text-xs text-gray-600 hover:text-red-400 transition-colors px-2 py-1.5"
          >
            清除已完成
          </button>
        </div>
      </div>

      <!-- Todo list -->
      <div class="space-y-3">
        <TransitionGroup name="slide-in">
          <div
            v-for="todo in filteredTodos"
            :key="todo.id"
            class="group bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 overflow-hidden"
            :class="{ 'opacity-60': todo.completed }"
          >
            <div class="p-4 flex items-start gap-3">
              <!-- Checkbox -->
              <button
                @click="toggleTodo(todo.id)"
                class="mt-0.5 flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200"
                :class="todo.completed
                  ? 'bg-gradient-to-br from-purple-500 to-indigo-500 border-purple-500'
                  : 'border-gray-600 hover:border-purple-500/50'"
              >
                <svg
                  v-if="todo.completed"
                  class="w-3.5 h-3.5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </button>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span
                    :class="['text-sm font-medium transition-all', todo.completed ? 'line-through text-gray-500' : 'text-gray-200']"
                  >
                    {{ todo.text }}
                  </span>
                </div>

                <!-- Meta tags -->
                <div class="flex flex-wrap items-center gap-2">
                  <!-- Priority dot -->
                  <span
                    v-if="todo.priority !== 'none'"
                    :class="['w-2 h-2 rounded-full',
                      todo.priority === 'high' ? 'bg-red-400' :
                      todo.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400']"
                    :title="todo.priority"
                  />

                  <!-- Category badge -->
                  <span
                    v-for="c in categories"
                    :key="c.value"
                    v-show="todo.category === c.value"
                    :class="['text-xs px-2 py-0.5 rounded-md bg-gray-700/50']"
                  >
                    {{ c.icon }} {{ c.label }}
                  </span>

                  <!-- Scheduled time -->
                  <span
                    v-if="todo.scheduledAt"
                    :class="['text-xs flex items-center gap-1',
                      isOverdue(todo) ? 'text-red-400' : 'text-gray-500']"
                  >
                    🕐 {{ formatTime(todo.scheduledAt) }}
                    <span
                      v-if="!todo.completed && !isOverdue(todo)"
                      class="text-purple-400"
                    >
                      · {{ getRemainingTime(todo) }}
                    </span>
                  </span>

                  <!-- Reminder badge -->
                  <span
                    v-if="todo.reminder"
                    class="text-xs text-blue-400/70"
                  >
                    🔔 提前 {{ todo.reminder }}min
                  </span>
                </div>
              </div>

              <!-- Delete button -->
              <button
                @click="deleteTodo(todo.id)"
                class="opacity-0 group-hover:opacity-100 flex-shrink-0 text-gray-600 hover:text-red-400 transition-all duration-200 p-1 rounded-lg hover:bg-red-500/10"
                title="删除"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <!-- Completion gradient bar -->
            <div
              v-if="todo.completed"
              class="h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500"
            />
          </div>
        </TransitionGroup>
      </div>

      <!-- Empty state -->
      <div
        v-if="filteredTodos.length === 0 && todos.length > 0"
        class="text-center py-16 animate-fade-in"
      >
        <div class="text-5xl mb-4">🎯</div>
        <p class="text-gray-500 text-sm">没有匹配的任务</p>
        <button
          @click="filter = 'all'; activePriorityFilter = 'all'; activeCategoryFilter = 'all'"
          class="mt-3 text-xs text-purple-400 hover:text-purple-300 transition-colors"
        >
          清除筛选条件
        </button>
      </div>

      <div
        v-if="todos.length === 0"
        class="text-center py-16 animate-fade-in"
      >
        <div class="text-5xl mb-4">✨</div>
        <p class="text-gray-500 text-sm">开始添加你的第一个任务吧！</p>
      </div>

      <!-- Settings Panel -->
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
              <!-- Always On Top -->
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-200">📌 始终置顶</p>
                  <p class="text-xs text-gray-500">窗口始终显示在最上层</p>
                </div>
                <button
                  @click="toggleAlwaysOnTop"
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
                    isAlwaysOnTop ? 'bg-purple-600' : 'bg-gray-600'
                  ]"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
                      isAlwaysOnTop ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  />
                </button>
              </div>

              <!-- Auto Start -->
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-200">☀️ 开机自启</p>
                  <p class="text-xs text-gray-500">Windows 开机自动启动 Todo Flow</p>
                </div>
                <button
                  @click="toggleAutoStart"
                  :disabled="!isTauri"
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
                    isAutoStartEnabled ? 'bg-purple-600' : 'bg-gray-600'
                  ]"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
                      isAutoStartEnabled ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  />
                </button>
              </div>

              <!-- Global Shortcut -->
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-200">⌨️ 全局快捷键</p>
                  <p class="text-xs text-gray-500">Ctrl+Shift+T 切换窗口置顶</p>
                </div>
                <button
                  @click="toggleGlobalShortcut"
                  :disabled="!isTauri"
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
                    isShortcutEnabled ? 'bg-purple-600' : 'bg-gray-600'
                  ]"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
                      isShortcutEnabled ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  />
                </button>
              </div>

              <!-- Daily Reminder -->
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-200">🔔 每日提醒</p>
                  <p class="text-xs text-gray-500">每天固定时间提醒你设置待办</p>
                </div>
                <button
                  @click="() => { isDailyReminderEnabled = !isDailyReminderEnabled; saveSettings(); syncReminderSettings() }"
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
                    isDailyReminderEnabled ? 'bg-purple-600' : 'bg-gray-600'
                  ]"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
                      isDailyReminderEnabled ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  />
                </button>
              </div>

              <!-- Reminder Time -->
              <div v-if="isDailyReminderEnabled" class="space-y-2">
                <p class="text-sm font-medium text-gray-200">⏰ 提醒时间</p>
                <div class="flex items-center gap-3">
                  <input
                    v-model.number="reminderHour"
                    @input="syncReminderTime"
                    type="number"
                    min="0"
                    max="23"
                    class="w-16 bg-gray-700/50 text-gray-300 text-sm rounded-lg px-3 py-2 outline-none border border-gray-600/30 focus:border-purple-500/50 transition-colors text-center"
                  />
                  <span class="text-gray-500">时</span>
                  <input
                    v-model.number="reminderMinute"
                    @input="syncReminderTime"
                    type="number"
                    min="0"
                    max="59"
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
                <button
                  @click="checkForUpdate"
                  :disabled="!isTauri || checkingUpdate"
                  class="text-xs px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {{ checkingUpdate ? '...' : '检查' }}
                </button>
              </div>

              <!-- Tauri Info -->
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
    </div>
  </div>
</template>

<style scoped>
/* Transition styles */
.slide-in-enter-active {
  transition: all 0.3s ease-out;
}
.slide-in-leave-active {
  transition: all 0.2s ease-in;
}
.slide-in-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
.slide-in-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.settings-enter-active {
  transition: all 0.3s ease-out;
}
.settings-leave-active {
  transition: all 0.2s ease-in;
}
.settings-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.settings-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.confetti-enter-active {
  transition: all 1s ease-out;
}
.confetti-leave-active {
  transition: none;
}
.confetti-enter-from {
  opacity: 1;
  transform: translateY(0) rotate(0deg);
}
.confetti-leave-to {
  opacity: 0;
  transform: translateY(60px) rotate(360deg);
}

.time-picker-enter-active {
  transition: all 0.2s ease-out;
}
.time-picker-leave-active {
  transition: all 0.15s ease-in;
}
.time-picker-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.time-picker-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Range input styling */
input[type="date"]::-webkit-calendar-picker-indicator,
input[type="time"]::-webkit-calendar-picker-indicator {
  filter: invert(0.7);
  cursor: pointer;
}
</style>
