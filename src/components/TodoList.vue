<script setup>
import { ref, onMounted, TransitionGroup } from 'vue'
import { useTodos, DEMO_TODOS } from '../composables/useTodos.js'
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
  loadSettingsFromStorage()
  loadFromStorage()
  await loadTauriSettings()
  await setupTauriListeners()
  if (todos.value.length === 0) {
    todos.value = DEMO_TODOS.map(t => ({ ...t, id: crypto.randomUUID() }))
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#F0F4F8] text-[#0F172A]">
    <!-- 提醒通知 -->
    <div class="fixed top-6 right-6 z-40 space-y-2">
      <TransitionGroup name="slide-in">
        <div
          v-for="(reminder, i) in upcomingReminders"
          :key="reminder.text + i"
          class="bg-white/85 backdrop-blur-md border border-[#0EA5E9]/20 text-[#0F172A] px-5 py-3 rounded-lg shadow-lg text-sm"
        >
          {{ reminder.text }} — {{ reminder.time }}
        </div>
      </TransitionGroup>
    </div>

    <!-- 背景装饰 -->
    <div
      class="fixed inset-0 pointer-events-none"
      style="background:
        radial-gradient(ellipse at 30% 20%, rgba(14,165,233,0.04) 0%, transparent 60%),
        radial-gradient(ellipse at 70% 80%, rgba(139,92,246,0.03) 0%, transparent 50%);"
    />

    <!-- 主内容 -->
    <div class="max-w-xl mx-auto px-6 py-12 relative z-10">
      <!-- 品牌标题区 -->
      <div class="mb-8 animate-slide-up">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <!-- 品牌图标 -->
            <div
              class="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden relative flex-shrink-0"
              style="background: linear-gradient(135deg, #0EA5E9, #38BDF8); box-shadow: 0 2px 8px rgba(14,165,233,0.2);"
            >
              <div
                class="w-[14px] h-[14px] border-2.5 border-white rounded-full border-r-transparent animate-[iconSpin_3s_linear_infinite] relative z-10"
              />
              <div
                class="absolute inset-0"
                style="background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%); background-size: 200% 100%; animation: iconSweep 3s ease-in-out infinite;"
              />
            </div>
            <h1 style="font-family: 'Inter', 'Noto Sans SC', system-ui, sans-serif;" class="text-2xl font-bold text-[#0F172A] tracking-tight">
              Todo Flow
            </h1>
          </div>
          <button
            @click="showSettings = !showSettings"
            class="text-[#94A3B8] hover:text-[#0EA5E9] hover:bg-[#0EA5E9]/8 transition-all duration-250 px-2.5 py-2 rounded-lg"
            title="设置"
          >
            <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        <p class="text-sm font-medium text-[#94A3B8] mt-1 ml-11">
          让任务像水流一样顺畅
        </p>
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
      <div
        v-if="filteredTodos.length > 0"
        class="bg-white/85 backdrop-blur-md rounded-2xl py-1 shadow-[0_1px_3px_rgba(0,0,0,0.04),_0_8px_24px_rgba(0,0,0,0.04)] mb-3 transition-all duration-250 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04),_0_12px_32px_rgba(0,0,0,0.06)] hover:-translate-y-px"
      >
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
      <div
        v-if="filteredTodos.length === 0 && todos.length > 0"
        class="bg-white/85 backdrop-blur-md rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),_0_8px_24px_rgba(0,0,0,0.04)] mb-3"
      >
        <div class="text-center py-12 animate-fade-in">
          <div
            class="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-dashed border-[#CBD5E1] flex items-center justify-center text-[#94A3B8] animate-float"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p class="text-sm text-[#94A3B8] mb-2">没有匹配的任务</p>
          <button
            @click="filter = 'all'"
            class="text-xs font-medium text-[#0EA5E9] underline underline-offset-4 hover:text-[#0284C7] transition-colors cursor-pointer"
          >
            清除筛选条件
          </button>
        </div>
      </div>

      <div
        v-if="todos.length === 0"
        class="bg-white/85 backdrop-blur-md rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),_0_8px_24px_rgba(0,0,0,0.04)] mb-3"
      >
        <div class="text-center py-16 animate-fade-in">
          <div
            class="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-dashed border-[#CBD5E1] flex items-center justify-center text-[#94A3B8] animate-float"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p class="text-sm text-[#94A3B8]">开始添加你的第一个任务吧</p>
        </div>
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
.slide-in-enter-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-in-leave-active { transition: all 0.2s ease-in; }
.slide-in-enter-from { opacity: 0; transform: translateX(-16px); }
.slide-in-leave-to { opacity: 0; transform: translateX(16px); }

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }

/* 品牌图标动画注入 */
@keyframes iconSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes iconSweep {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}
</style>