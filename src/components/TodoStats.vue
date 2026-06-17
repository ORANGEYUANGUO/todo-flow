<!-- TodoStats.vue - 统计进度条 -->
<script setup>
defineProps({
  stats: Object,
})
</script>

<template>
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
</template>