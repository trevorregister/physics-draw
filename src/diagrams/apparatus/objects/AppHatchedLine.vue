<template>
  <g>
    <line :x1="-width / 2" y1="0" :x2="width / 2" y2="0"
          stroke="#1e293b" stroke-width="2" />
    <line
      v-for="x in hatchPositions"
      :key="x"
      :x1="x" y1="0"
      :x2="x - 8" :y2="10"
      stroke="#1e293b" stroke-width="1.5"
    />
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ width: number; height: number }>()

const hatchPositions = computed(() => {
  const positions: number[] = []
  const spacing = 12
  for (let x = -props.width / 2 + 6; x <= props.width / 2; x += spacing) {
    positions.push(x)
  }
  return positions
})
</script>
