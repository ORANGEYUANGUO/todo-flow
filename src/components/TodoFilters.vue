<!-- TodoFilters.vue - 筛选 + 排序 + 清除已完成 -->
<script setup>
defineProps({
  filter: String,
  sortBy: String,
  hasCompleted: Boolean,
})

const emit = defineEmits(['update:filter', 'update:sortBy', 'clearCompleted'])

const statusFilters = [
  { v: 'all', l: '全部' },
  { v: 'active', l: '待完成' },
  { v: 'completed', l: '已完成' },
]
</script>

<template>
  <div class="mb-6 flex flex-wrap items-center justify-between gap-3 animate-slide-up">
    <!-- 状态筛选 -->
    <div class="flex gap-1 bg-gray-800/50 rounded-xl p-1">
      <button
        v-for="f in statusFilters"
        :key="f.v"
        @click="emit('update:filter', f.v)"
        :class="['text-xs px-3 py-1.5 rounded-lg transition-all duration-200',
          filter === f.v ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-gray-500 hover:text-gray-300']"
      >
        {{ f.l }}
      </button>
    </div>

    <!-- 排序 & 清除 -->
    <div class="flex items-center gap-2">
      <select
        :value="sortBy"
        @change="emit('update:sortBy', $event.target.value)"
        class="bg-gray-800/50 text-gray-400 text-xs rounded-lg px-2 py-1.5 outline-none border border-gray-700/30"
      >
        <option value="created">按创建时间</option>
        <option value="scheduled">按计划时间</option>
        <option value="priority">按优先级</option>
      </select>

      <button
        v-if="hasCompleted"
        @click="emit('clearCompleted')"
        class="text-xs text-gray-600 hover:text-red-400 transition-colors px-2 py-1.5"
      >
        清除已完成
      </button>
    </div>
  </div>
</template>