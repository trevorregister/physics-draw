<template>
  <g>
    <polygon :points="points" fill="#f1f5f9" stroke="#1e293b" stroke-width="2" stroke-linejoin="round" />
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ width: number; height: number }>()

const points = computed(() => {
  const hw = props.width / 2
  const hh = props.height / 2
  return `${-hw},${hh} ${hw},${hh} ${-hw},${-hh}`
})
</script>
