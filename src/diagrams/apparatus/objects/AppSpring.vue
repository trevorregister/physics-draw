<template>
  <g>
    <path :d="springPath" fill="none" stroke="#1e293b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ width: number; height: number }>()

const springPath = computed(() => {
  const w = props.width
  const h = props.height
  const N = Math.max(4, Math.round(w / 20))
  const flat = w * 0.06
  let d = `M ${-w / 2} 0 L ${-w / 2 + flat} 0`
  for (let i = 0; i < N; i++) {
    const x = -w / 2 + flat + ((i + 0.5) * (w - 2 * flat)) / N
    const y = i % 2 === 0 ? -h / 2 : h / 2
    d += ` L ${x} ${y}`
  }
  d += ` L ${w / 2} 0`
  return d
})
</script>
