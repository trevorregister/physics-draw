<template>
  <g>
    <path :d="jaggedPath" fill="none" stroke="#1e293b" stroke-width="2" stroke-linejoin="round" />
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ width: number; height: number }>()

const jaggedPath = computed(() => {
  const w = props.width
  const toothW = 16
  const toothH = props.height / 2
  let d = `M ${-w / 2} 0`
  let x = -w / 2
  while (x + toothW <= w / 2) {
    d += ` L ${x + toothW / 2} ${-toothH} L ${x + toothW} 0`
    x += toothW
  }
  d += ` L ${w / 2} 0`
  return d
})
</script>
