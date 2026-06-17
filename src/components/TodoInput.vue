<!-- TodoInput.vue - 毛玻璃输入区 -->
<script setup>
import { priorities, categories } from '../composables/useTodos.js'

const props = defineProps({
  inputText: String,
  selectedPriority: String,
  selectedCategory: String,
  showTimePicker: Boolean,
  scheduledDate: String,
  scheduledTime: String,
  reminderMinutes: Number,
})

const emit = defineEmits([
  'update:inputText', 'update:selectedPriority', 'update:selectedCategory',
  'update:showTimePicker', 'update:scheduledDate', 'update:scheduledTime',
  'update:reminderMinutes', 'add',
])

function onAdd() { emit('add') }

// 优先级样式映射
const priorityMap = {
  high: { border: '#F43F5E', bg: '#F43F5E', inner: true },
  medium: { border: '#8B5CF6', bg: '#8B5CF6', inner: true },
  low: { border: '#0EA5E9', bg: 'transparent', inner: false },
  none: { border: '#CBD5E1', bg: 'transparent', inner: false },
}
</script>

<template>
  <div
    class="bg-white/85 backdrop-blur-md rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),_0_8px_24px_rgba(0,0,0,0.04)] mb-3 animate-slide-up transition-all duration-250 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04),_0_12px_32px_rgba(0,0,0,0.06)] hover:-translate-y-px"
  >
    <!-- 主输入行 -->
    <div class="flex items-center gap-3 border-b-2 border-[#E2E8F0] pb-3.5 transition-colors duration-250 focus-within:border-[#0EA5E9]">
      <input
        :value="inputText"
        @input="emit('update:inputText', $event.target.value)"
        @keyup.enter="onAdd"
        type="text"
        placeholder="添加新任务..."
        style="font-family: 'Inter', 'Noto Sans SC', system-ui, sans-serif;"
        class="flex-1 bg-transparent text-[15px] font-medium text-[#0F172A] placeholder-[#CBD5E1] placeholder:font-normal outline-none"
      />
      <button
        @click="onAdd"
        :disabled="!inputText.trim()"
        class="relative overflow-hidden px-5 py-2 rounded-[9px] text-sm font-semibold text-white transition-all duration-200 disabled:bg-[#E2E8F0] disabled:text-[#94A3B8] disabled:shadow-none disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
        :class="inputText.trim()
          ? 'shadow-[0_2px_8px_rgba(14,165,233,0.2)] hover:shadow-[0_4px_14px_rgba(14,165,233,0.3)] hover:scale-[1.02] active:scale-[0.97]'
          : ''"
        :style="inputText.trim() ? 'background: linear-gradient(135deg, #0EA5E9, #38BDF8);' : ''"
      >
        <!-- 流光 -->
        <div
          v-if="inputText.trim()"
          class="absolute inset-0 pointer-events-none"
          style="background: linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%); background-size: 200% 100%; animation: shimmer 2s ease-in-out infinite;"
        />
        <span class="relative z-10">+ 添加</span>
      </button>
    </div>

    <!-- 选项栏 -->
    <div class="flex flex-wrap items-center gap-5 mt-3">
      <!-- 优先级 -->
      <div class="flex items-center gap-2">
        <span class="text-[11px] font-medium text-[#94A3B8]">优先级</span>
        <div class="flex gap-1.5">
          <button
            v-for="p in priorities"
            :key="p.value"
            @click="emit('update:selectedPriority', p.value)"
            :class="['w-[18px] h-[18px] rounded-full transition-all duration-250 cursor-pointer',
              selectedPriority === p.value ? 'scale-110' : 'hover:scale-110']"
            :title="p.label"
            :style="{
              border: '2px solid ' + priorityMap[p.value].border,
              background: priorityMap[p.value].bg,
              boxShadow: selectedPriority === p.value ? '0 0 0 3px rgba(14,165,233,0.15)' : 'none'
            }"
          >
            <div
              v-if="priorityMap[p.value].inner"
              class="w-[6px] h-[6px] rounded-full bg-white/50 mx-auto"
              :class="selectedPriority === p.value ? 'mt-[4px]' : 'mt-[4px]'"
            />
          </button>
        </div>
      </div>

      <!-- 分类 -->
      <div class="flex items-center gap-2">
        <span class="text-[11px] font-medium text-[#94A3B8]">分类</span>
        <select
          :value="selectedCategory"
          @change="emit('update:selectedCategory', $event.target.value)"
          style="font-family: 'Inter', 'Noto Sans SC', system-ui, sans-serif; background-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%2210%22 fill=%22%2394A3B8%22 viewBox=%220 0 16 16%22%3E%3Cpath d=%22M8 11L3 6h10z%22/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 10px center;"
          class="text-xs font-medium px-3 py-1.5 pr-7 rounded-lg outline-none border border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:border-[#94A3B8] focus:border-[#0EA5E9] focus:bg-white transition-all duration-200 appearance-none cursor-pointer"
        >
          <option v-for="c in categories" :key="c.value" :value="c.value">
            {{ c.label }}
          </option>
        </select>
      </div>

      <!-- 时间安排按钮 -->
      <button
        @click="emit('update:showTimePicker', !showTimePicker)"
        :class="['text-xs font-medium px-3 py-1.5 rounded-lg border transition-all duration-250 cursor-pointer',
          showTimePicker
            ? 'border-[#0EA5E9] bg-[rgba(14,165,233,0.06)] text-[#0EA5E9]'
            : 'border-[#E2E8F0] bg-transparent text-[#64748B] hover:border-[#0EA5E9] hover:text-[#0EA5E9] hover:-translate-y-px']"
      >
        时间安排
      </button>
    </div>

    <!-- 时间选择面板 -->
    <Transition name="time-picker">
      <div v-show="showTimePicker" class="mt-4 pt-4 border-t border-[#E2E8F0]">
        <div class="flex flex-wrap items-end gap-4">
          <div>
            <label class="block text-xs font-medium text-[#64748B] mb-1.5">日期</label>
            <input
              :value="scheduledDate"
              @input="emit('update:scheduledDate', $event.target.value)"
              type="date"
              class="bg-[#F8FAFC] text-[#0F172A] text-xs rounded-lg px-3 py-2 outline-none border border-[#E2E8F0] hover:border-[#94A3B8] focus:border-[#0EA5E9] transition-colors font-mono"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-[#64748B] mb-1.5">时间</label>
            <input
              :value="scheduledTime"
              @input="emit('update:scheduledTime', $event.target.value)"
              type="time"
              class="bg-[#F8FAFC] text-[#0F172A] text-xs rounded-lg px-3 py-2 outline-none border border-[#E2E8F0] hover:border-[#94A3B8] focus:border-[#0EA5E9] transition-colors font-mono"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-[#64748B] mb-1.5">提前提醒</label>
            <select
              :value="reminderMinutes"
              @change="emit('update:reminderMinutes', Number($event.target.value))"
              style="font-family: 'Inter', 'Noto Sans SC', system-ui, sans-serif; background-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%2210%22 fill=%22%2394A3B8%22 viewBox=%220 0 16 16%22%3E%3Cpath d=%22M8 11L3 6h10z%22/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 10px center;"
              class="bg-[#F8FAFC] text-[#0F172A] text-xs rounded-lg px-3 py-2 pr-7 outline-none border border-[#E2E8F0] hover:border-[#94A3B8] focus:border-[#0EA5E9] transition-colors appearance-none cursor-pointer font-mono"
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
</template>

<style scoped>
.time-picker-enter-active { transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
.time-picker-leave-active { transition: all 0.15s ease-in; }
.time-picker-enter-from { opacity: 0; transform: translateY(-6px); }
.time-picker-leave-to { opacity: 0; transform: translateY(-6px); }

@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}

input[type="date"]::-webkit-calendar-picker-indicator,
input[type="time"]::-webkit-calendar-picker-indicator {
  filter: invert(0.4);
  cursor: pointer;
  opacity: 0.6;
}
input[type="date"]::-webkit-calendar-picker-indicator:hover,
input[type="time"]::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}
</style>