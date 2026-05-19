<template>
  <g>
    <rect :x="-width / 2" :y="-height / 2" :width="width" :height="height"
          fill="#bfdbfe" stroke="#1e293b" stroke-width="2" />
    <line
      v-for="y in linePositions"
      :key="y"
      :x1="-width / 2 + 3" :y1="y"
      :x2="width / 2 - 3" :y2="y"
      stroke="#93c5fd" stroke-width="1"
    />
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ width: number; height: number }>()

const linePositions = computed(() => {
  const positions: number[] = []
  for (let y = -props.height / 2 + 12; y < props.height / 2 - 4; y += 12) {
    positions.push(y)
  }
  return positions
})
</script>
