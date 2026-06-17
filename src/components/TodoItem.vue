<!-- TodoItem.vue - 单个 Todo 条目 -->
<script setup>
import { categories } from '../composables/useTodos.js'

const props = defineProps({
  todo: Object,
})

const emit = defineEmits(['toggle', 'delete'])

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
</script>

<template>
  <div
    class="group bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 overflow-hidden"
    :class="{ 'opacity-60': todo.completed }"
  >
    <div class="p-4 flex items-start gap-3">
      <!-- 复选框 -->
      <button
        @click="emit('toggle', todo.id)"
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

      <!-- 内容 -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span
            :class="['text-sm font-medium transition-all', todo.completed ? 'line-through text-gray-500' : 'text-gray-200']"
          >
            {{ todo.text }}
          </span>
        </div>

        <!-- 元信息标签 -->
        <div class="flex flex-wrap items-center gap-2">
          <span
            v-if="todo.priority !== 'none'"
            :class="['w-2 h-2 rounded-full',
              todo.priority === 'high' ? 'bg-red-400' :
              todo.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400']"
            :title="todo.priority"
          />

          <span
            v-for="c in categories"
            :key="c.value"
            v-show="todo.category === c.value"
            class="text-xs px-2 py-0.5 rounded-md bg-gray-700/50"
          >
            {{ c.icon }} {{ c.label }}
          </span>

          <span
            v-if="todo.scheduledAt"
            :class="['text-xs flex items-center gap-1', isOverdue(todo) ? 'text-red-400' : 'text-gray-500']"
          >
            🕐 {{ formatTime(todo.scheduledAt) }}
            <span v-if="!todo.completed && !isOverdue(todo)" class="text-purple-400">
              · {{ getRemainingTime(todo) }}
            </span>
          </span>

          <span v-if="todo.reminder" class="text-xs text-blue-400/70">
            🔔 提前 {{ todo.reminder }}min
          </span>
        </div>
      </div>

      <!-- 删除按钮 -->
      <button
        @click="emit('delete', todo.id)"
        class="opacity-0 group-hover:opacity-100 flex-shrink-0 text-gray-600 hover:text-red-400 transition-all duration-200 p-1 rounded-lg hover:bg-red-500/10"
        title="删除"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>

    <!-- 完成渐变条 -->
    <div
      v-if="todo.completed"
      class="h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500"
    />
  </div>
</template>