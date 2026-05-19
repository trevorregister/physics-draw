<template>
  <g>
    <circle :r="r" fill="#f8fafc" stroke="#1e293b" stroke-width="2" />
    <line x1="0" y1="0" :x2="r" y2="0" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3" />
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ width: number; height: number }>()
const r = computed(() => Math.min(props.width, props.height) / 2)
</script>
