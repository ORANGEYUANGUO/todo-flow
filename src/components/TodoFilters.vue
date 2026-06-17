<!-- TodoFilters.vue - 毛玻璃筛选栏 -->
<script setup>
defineProps({
  filter: String,
  sortBy: String,
  hasCompleted: Boolean,
})

const emit = defineEmits(['update:filter', 'update:sortBy', 'clearCompleted'])

const statusFilters = [
  { v: 'all', l: '全部' },
  { v: 'active', l: '进行中' },
  { v: 'completed', l: '已完成' },
]
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3 mb-3 animate-slide-up">
    <!-- 状态筛选 -->
    <div class="flex gap-0.5 bg-white/60 backdrop-blur-md rounded-[10px] p-[3px] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <button
        v-for="f in statusFilters"
        :key="f.v"
        @click="emit('update:filter', f.v)"
        :class="['text-xs font-medium px-4 py-1.5 rounded-[7px] transition-all duration-250 cursor-pointer',
          filter === f.v
            ? 'bg-white text-[#0F172A] shadow-[0_1px_4px_rgba(0,0,0,0.08)] font-semibold'
            : 'text-[#64748B] hover:text-[#0F172A]']"
        style="font-family: 'Inter', 'Noto Sans SC', system-ui, sans-serif;"
      >
        {{ f.l }}
      </button>
    </div>

    <!-- 排序 & 清除 -->
    <div class="flex items-center gap-2.5">
      <select
        :value="sortBy"
        @change="emit('update:sortBy', $event.target.value)"
        style="font-family: 'Inter', 'Noto Sans SC', system-ui, sans-serif; background-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%2210%22 fill=%22%2394A3B8%22 viewBox=%220 0 16 16%22%3E%3Cpath d=%22M8 11L3 6h10z%22/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 10px center;"
        class="text-xs font-medium px-3 py-1.5 pr-7 rounded-lg outline-none border border-[#E2E8F0] bg-white/60 backdrop-blur-md text-[#64748B] hover:border-[#94A3B8] focus:border-[#0EA5E9] transition-all duration-200 appearance-none cursor-pointer"
      >
        <option value="created">按创建时间</option>
        <option value="scheduled">按计划时间</option>
        <option value="priority">按优先级</option>
      </select>

      <button
        v-if="hasCompleted"
        @click="emit('clearCompleted')"
        class="text-xs font-medium text-[#94A3B8] hover:text-[#F43F5E] hover:bg-[rgba(244,63,94,0.06)] transition-all duration-250 px-2.5 py-1.5 rounded-lg cursor-pointer"
        style="font-family: 'Inter', 'Noto Sans SC', system-ui, sans-serif;"
      >
        清除已完成
      </button>
    </div>
  </div>
</template>