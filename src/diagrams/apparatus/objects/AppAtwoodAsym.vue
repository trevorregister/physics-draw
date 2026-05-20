<template>
  <g>
    <circle cx="0" :cy="cy" :r="r" fill="#f8fafc" stroke="#1e293b" stroke-width="2" />
    <line x1="0" :y1="cy" :x2="r" :y2="cy" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3" />
    <line :x1="-r" :y1="cy" :x2="-r" :y2="height / 4" stroke="#1e293b" stroke-width="2" />
    <line :x1="r"  :y1="cy" :x2="r"  :y2="height / 2" stroke="#1e293b" stroke-width="2" />
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ width: number; height: number }>()
const r = computed(() => props.width / 2)
const cy = computed(() => -props.height / 2 + r.value)
</script>
