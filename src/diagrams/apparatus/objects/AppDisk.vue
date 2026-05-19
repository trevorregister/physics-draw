<template>
  <g>
    <circle :r="r" fill="#e2e8f0" stroke="#1e293b" stroke-width="2" />
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ width: number; height: number }>()
const r = computed(() => Math.min(props.width, props.height) / 2)
</script>
