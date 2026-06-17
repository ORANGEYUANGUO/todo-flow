<script setup>
import { ref, onMounted, TransitionGroup } from 'vue'
import { useTodos, priorities, categories, DEMO_TODOS } from '../composables/useTodos.js'
import { useSettings } from '../composables/useSettings.js'
import TodoInput from './TodoInput.vue'
import TodoStats from './TodoStats.vue'
import TodoFilters from './TodoFilters.vue'
import TodoItem from './TodoItem.vue'
import SettingsPanel from './SettingsPanel.vue'

// ─── Composables ──────────────────────────────────────────
const {
  todos, inputText, selectedPriority, selectedCategory,
  showTimePicker, scheduledDate, scheduledTime, reminderMinutes,
  filter, sortBy, newConfetti, completedCount,
  filteredTodos, stats, upcomingReminders,
  addTodo, toggleTodo, deleteTodo, clearCompleted,
  loadFromStorage,
} = useTodos()

const {
  showSettings, isAlwaysOnTop, isAutoStartEnabled, isDailyReminderEnabled,
  reminderHour, reminderMinute, isTauri, isShortcutEnabled,
  checkingUpdate, updateStatus, updateInfo, installingUpdate,
  saveSettingsToStorage, loadSettingsFromStorage,
  syncReminderTime,
  toggleAlwaysOnTop, toggleAutoStart, toggleGlobalShortcut, toggleDailyReminder,
  loadTauriSettings, setupTauriListeners,
  checkForUpdate, installUpdateNow,
} = useSettings()

// ─── 初始化 ──────────────────────────────────────────────
onMounted(async () => {
  // 加载设置（需要先加载，因为 demo 数据不依赖 Tauri）
  loadSettingsFromStorage()
  // 加载 Todo 数据
  loadFromStorage()
  // 加载 Tauri 设置
  await loadTauriSettings()
  // 注册事件监听
  await setupTauriListeners()
  // 空数据时显示 Demo
  if (todos.value.length === 0) {
    todos.value = DEMO_TODOS.map(t => ({ ...t, id: crypto.randomUUID() }))
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 text-white">
    <!-- 彩纸效果 -->
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

    <!-- 提醒通知 -->
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

    <!-- 主内容 -->
    <div class="max-w-2xl mx-auto px-4 py-8">
      <!-- 标题 -->
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

      <!-- 统计 -->
      <TodoStats :stats="stats" />

      <!-- 输入 -->
      <TodoInput
        :inputText="inputText"
        :selectedPriority="selectedPriority"
        :selectedCategory="selectedCategory"
        :showTimePicker="showTimePicker"
        :scheduledDate="scheduledDate"
        :scheduledTime="scheduledTime"
        :reminderMinutes="reminderMinutes"
        @update:inputText="inputText = $event"
        @update:selectedPriority="selectedPriority = $event"
        @update:selectedCategory="selectedCategory = $event"
        @update:showTimePicker="showTimePicker = $event"
        @update:scheduledDate="scheduledDate = $event"
        @update:scheduledTime="scheduledTime = $event"
        @update:reminderMinutes="reminderMinutes = $event"
        @add="addTodo"
      />

      <!-- 筛选/排序 -->
      <TodoFilters
        v-if="todos.length > 0"
        :filter="filter"
        :sortBy="sortBy"
        :hasCompleted="stats.completed > 0"
        @update:filter="filter = $event"
        @update:sortBy="sortBy = $event"
        @clearCompleted="clearCompleted"
      />

      <!-- Todo 列表 -->
      <div class="space-y-3">
        <TransitionGroup name="slide-in">
          <TodoItem
            v-for="todo in filteredTodos"
            :key="todo.id"
            :todo="todo"
            @toggle="toggleTodo"
            @delete="deleteTodo"
          />
        </TransitionGroup>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredTodos.length === 0 && todos.length > 0" class="text-center py-16 animate-fade-in">
        <div class="text-5xl mb-4">🎯</div>
        <p class="text-gray-500 text-sm">没有匹配的任务</p>
        <button
          @click="filter = 'all'"
          class="mt-3 text-xs text-purple-400 hover:text-purple-300 transition-colors"
        >
          清除筛选条件
        </button>
      </div>

      <div v-if="todos.length === 0" class="text-center py-16 animate-fade-in">
        <div class="text-5xl mb-4">✨</div>
        <p class="text-gray-500 text-sm">开始添加你的第一个任务吧！</p>
      </div>

      <!-- 设置面板 -->
      <SettingsPanel
        :showSettings="showSettings"
        :isAlwaysOnTop="isAlwaysOnTop"
        :isAutoStartEnabled="isAutoStartEnabled"
        :isDailyReminderEnabled="isDailyReminderEnabled"
        :reminderHour="reminderHour"
        :reminderMinute="reminderMinute"
        :isTauri="isTauri"
        :isShortcutEnabled="isShortcutEnabled"
        :checkingUpdate="checkingUpdate"
        :updateStatus="updateStatus"
        :updateInfo="updateInfo"
        :installingUpdate="installingUpdate"
        @toggleAlwaysOnTop="toggleAlwaysOnTop"
        @toggleAutoStart="toggleAutoStart"
        @toggleGlobalShortcut="toggleGlobalShortcut"
        @toggleDailyReminder="toggleDailyReminder"
        @update:reminderHour="reminderHour = $event"
        @update:reminderMinute="reminderMinute = $event"
        @syncReminderTime="syncReminderTime"
        @checkForUpdate="checkForUpdate"
        @installUpdateNow="installUpdateNow"
      />
    </div>
  </div>
</template>

<style scoped>
/* Transition styles */
.slide-in-enter-active { transition: all 0.3s ease-out; }
.slide-in-leave-active { transition: all 0.2s ease-in; }
.slide-in-enter-from { opacity: 0; transform: translateX(-30px); }
.slide-in-leave-to { opacity: 0; transform: translateX(30px); }

.confetti-enter-active { transition: all 1s ease-out; }
.confetti-leave-active { transition: none; }
.confetti-enter-from { opacity: 1; transform: translateY(0) rotate(0deg); }
.confetti-leave-to { opacity: 0; transform: translateY(60px) rotate(360deg); }
</style>