<template>
  <g>
    <circle :cx="cx" :cy="cy" :r="r" fill="#f8fafc" stroke="#1e293b" stroke-width="2" />
    <line :x1="cx" :y1="cy" :x2="cx + r" :y2="cy" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3" />
    <line :x1="cx - r" :y1="cy" :x2="-width / 2" :y2="cy" stroke="#1e293b" stroke-width="2" />
    <line :x1="cx" :y1="cy + r" :x2="cx" :y2="height / 2" stroke="#1e293b" stroke-width="2" />
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ width: number; height: number }>()
const r  = computed(() => Math.min(props.width, props.height) / 4)
const cx = computed(() => props.width / 2 - r.value)
const cy = computed(() => -props.height / 2 + r.value)
</script>
