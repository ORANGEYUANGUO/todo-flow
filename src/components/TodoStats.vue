<!-- TodoStats.vue - 水位线进度条 -->
<script setup>
defineProps({
  stats: Object,
})
</script>

<template>
  <div
    v-if="stats.total > 0"
    class="bg-white/85 backdrop-blur-md rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),_0_8px_24px_rgba(0,0,0,0.04)] mb-3 animate-slide-up transition-all duration-250 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04),_0_12px_32px_rgba(0,0,0,0.06)] hover:-translate-y-px"
  >
    <div class="flex items-end justify-between mb-3.5">
      <span class="text-sm font-semibold uppercase tracking-wide text-[#64748B]">进度</span>
      <span class="text-[22px] font-normal text-[#0EA5E9] tabular-nums">{{ stats.percentage }}%</span>
    </div>
    <div class="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
      <div
        class="h-full rounded-full relative transition-all duration-700 ease-out"
        :style="{
          width: stats.percentage + '%',
          background: 'linear-gradient(90deg, #0EA5E9, #38BDF8, #7DD3FC)',
          backgroundSize: '200% 100%',
        }"
      >
        <!-- shimmer 波光 -->
        <div
          class="absolute inset-0 rounded-full"
          style="background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%); background-size: 200% 100%; animation: shimmer 2.5s ease-in-out infinite;"
        />
      </div>
    </div>
    <div class="flex justify-between mt-2.5 text-xs text-[#64748B] tabular-nums">
      <span>{{ stats.completed }} 项已完成</span>
      <span>{{ stats.active }} 项待完成</span>
    </div>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
</style>