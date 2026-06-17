<!-- TodoInput.vue - 输入区域：文本输入 + 优先级/分类/时间选择器 -->
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

function onAdd() {
  emit('add')
}
</script>

<template>
  <div class="mb-6 animate-slide-up">
    <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
      <!-- 文本输入行 -->
      <div class="flex items-center p-4 gap-3">
        <div class="flex-1 relative">
          <input
            :value="inputText"
            @input="emit('update:inputText', $event.target.value)"
            @keyup.enter="onAdd"
            type="text"
            placeholder="添加新的任务..."
            class="w-full bg-transparent text-white placeholder-gray-500 text-lg outline-none"
          />
        </div>
        <button
          @click="onAdd"
          :disabled="!inputText.trim()"
          class="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95"
        >
          添加
        </button>
      </div>

      <!-- 优先级 & 分类行 -->
      <div class="px-4 pb-3 flex flex-wrap items-center gap-3 border-t border-gray-700/30 pt-3">
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500">优先级</span>
          <div class="flex gap-1">
            <button
              v-for="p in priorities"
              :key="p.value"
              @click="emit('update:selectedPriority', p.value)"
              :class="[p.color, 'w-6 h-6 rounded-full transition-all duration-200',
                selectedPriority === p.value ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800 scale-110' : 'opacity-50 hover:opacity-80']"
              :title="p.label"
            />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500">分类</span>
          <select
            :value="selectedCategory"
            @change="emit('update:selectedCategory', $event.target.value)"
            class="bg-gray-700/50 text-gray-300 text-xs rounded-lg px-2 py-1.5 outline-none border border-gray-600/30 focus:border-purple-500/50 transition-colors"
          >
            <option v-for="c in categories" :key="c.value" :value="c.value">
              {{ c.icon }} {{ c.label }}
            </option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="emit('update:showTimePicker', !showTimePicker)"
            :class="['text-xs px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5',
              showTimePicker
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
                : 'bg-gray-700/30 text-gray-500 hover:text-gray-300 border border-transparent']"
          >
            ⏰ 时间设置
          </button>
        </div>
      </div>

      <!-- 时间选择面板 -->
      <Transition name="time-picker">
        <div v-show="showTimePicker" class="px-4 pb-4 pt-2 border-t border-gray-700/30">
          <div class="flex flex-wrap items-end gap-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">日期</label>
              <input
                :value="scheduledDate"
                @input="emit('update:scheduledDate', $event.target.value)"
                type="date"
                class="bg-gray-700/50 text-gray-300 text-xs rounded-lg px-3 py-2 outline-none border border-gray-600/30 focus:border-purple-500/50 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">时间</label>
              <input
                :value="scheduledTime"
                @input="emit('update:scheduledTime', $event.target.value)"
                type="time"
                class="bg-gray-700/50 text-gray-300 text-xs rounded-lg px-3 py-2 outline-none border border-gray-600/30 focus:border-purple-500/50 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">提醒 (分钟)</label>
              <select
                :value="reminderMinutes"
                @change="emit('update:reminderMinutes', Number($event.target.value))"
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
</template>

<style scoped>
.time-picker-enter-active { transition: all 0.2s ease-out; }
.time-picker-leave-active { transition: all 0.15s ease-in; }
.time-picker-enter-from { opacity: 0; transform: translateY(-8px); }
.time-picker-leave-to { opacity: 0; transform: translateY(-8px); }

input[type="date"]::-webkit-calendar-picker-indicator,
input[type="time"]::-webkit-calendar-picker-indicator {
  filter: invert(0.7);
  cursor: pointer;
}
</style>