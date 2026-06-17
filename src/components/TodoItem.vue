<!-- TodoItem.vue - 单个 Todo 条目（水滴状态环） -->
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
  if (diff <= 0) return null
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0) return `${hours}小时后`
  return `${mins}分钟后`
}

function getPriorityLabel(p) {
  if (p === 'high') return '高'
  if (p === 'medium') return '中'
  if (p === 'low') return '低'
  return ''
}

function getCategoryLabel(value) {
  const c = categories.find(c => c.value === value)
  return c ? c.label : ''
}
</script>

<template>
  <div
    class="group flex items-start gap-3.5 px-5 py-4 border-b border-[#E2E8F0]/60 transition-all duration-300"
    :class="{ 'opacity-70': todo.completed }"
  >
    <!-- 水滴状态环 -->
    <div class="flex-shrink-0 w-6 h-6 mt-0.5 flex items-center justify-center relative cursor-pointer">
      <!-- 涟漪效果（完成时） -->
      <div
        v-if="todo.completed"
        class="absolute inset-[-8px] rounded-full border-2 border-[rgba(14,165,233,0.2)]"
        style="animation: doubleRipple1 0.7s ease-out forwards;"
      />
      <div
        v-if="todo.completed"
        class="absolute inset-[-16px] rounded-full border border-[rgba(14,165,233,0.1)]"
        style="animation: doubleRipple2 0.7s ease-out 0.08s forwards;"
      />

      <!-- 圆环本体 -->
      <div
        @click="emit('toggle', todo.id)"
        :class="['w-5 h-5 rounded-full transition-all duration-300 cursor-pointer',
          // 已完成
          todo.completed && todo.priority === 'high'
            ? 'bg-gradient-to-br from-[#F43F5E] to-[#FB7185] border-[#F43F5E] shadow-[0_0_8px_rgba(244,63,94,0.2)]'
            : todo.completed
              ? 'bg-[#0EA5E9] border-[#0EA5E9] shadow-[0_0_10px_rgba(14,165,233,0.2)]'
              : todo.priority === 'high'
                ? 'bg-[#F43F5E] border-[#F43F5E] shadow-[0_0_6px_rgba(244,63,94,0.15)]'
                : 'border-2 border-[#CBD5E1] bg-transparent hover:border-[#0EA5E9] hover:scale-110'
        ]"
      >
        <!-- 勾选标记 -->
        <svg
          v-if="todo.completed"
          class="w-full h-full"
          viewBox="0 0 20 20"
        >
          <path
            d="M6 10l3 3 5-5"
            fill="none"
            stroke="#fff"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="animate-check-pop"
          />
        </svg>
        <!-- 高优先级的内部圆点 -->
        <div
          v-if="!todo.completed && todo.priority === 'high'"
          class="w-1.5 h-1.5 rounded-full bg-white/40 mx-auto mt-[5px]"
        />
      </div>
    </div>

    <!-- 内容 -->
    <div class="flex-1 min-w-0">
      <div
        :class="['text-sm font-medium leading-relaxed transition-all duration-300',
          todo.completed ? 'line-through text-[#94A3B8] font-normal' : 'text-[#0F172A]']"
      >
        {{ todo.text }}
      </div>

      <!-- 元信息 -->
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
        <!-- 优先级标签 -->
        <span
          v-if="todo.priority !== 'none'"
          :class="['text-[11px] font-medium px-1.5 py-0.5 rounded',
            todo.priority === 'high' ? 'bg-[rgba(244,63,94,0.08)] text-[#F43F5E]' :
            todo.priority === 'medium' ? 'bg-[rgba(139,92,246,0.08)] text-[#8B5CF6]' :
            'bg-[rgba(14,165,233,0.08)] text-[#0EA5E9]']"
        >
          {{ getPriorityLabel(todo.priority) }}
        </span>

        <!-- 分类 -->
        <span
          v-if="todo.category"
          class="text-[11px] text-[#64748B]"
        >
          {{ getCategoryLabel(todo.category) }}
        </span>

        <!-- 时间 -->
        <span
          v-if="todo.scheduledAt"
          :class="['font-mono text-[11px]',
            isOverdue(todo) ? 'text-[#F43F5E]/80' : 'text-[#64748B]']"
        >
          {{ formatTime(todo.scheduledAt) }}
        </span>

        <!-- 剩余时间 -->
        <span
          v-if="!todo.completed && getRemainingTime(todo)"
          class="font-mono text-[11px] text-[#0EA5E9]"
        >
          · {{ getRemainingTime(todo) }}
        </span>

        <!-- 提醒 -->
        <span v-if="todo.reminder" class="text-[11px] text-[#94A3B8]">
          提前 {{ todo.reminder }}min
        </span>
      </div>
    </div>

    <!-- 删除按钮 -->
    <button
      @click="emit('delete', todo.id)"
      class="flex-shrink-0 text-[#E2E8F0] hover:text-[#F43F5E] hover:bg-[rgba(244,63,94,0.08)] opacity-0 group-hover:opacity-100 transition-all duration-250 p-1.5 rounded-lg cursor-pointer"
      title="删除"
    >
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
@keyframes checkPop {
  0%   { transform: scale(0); }
  60%  { transform: scale(1.25); }
  100% { transform: scale(1); }
}
@keyframes doubleRipple1 {
  0%   { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(2); opacity: 0; }
}
@keyframes doubleRipple2 {
  0%   { transform: scale(1); opacity: 0.3; }
  100% { transform: scale(2.5); opacity: 0; }
}
.animate-check-pop {
  animation: checkPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
</style>