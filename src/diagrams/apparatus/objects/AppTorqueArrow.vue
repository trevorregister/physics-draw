<template>
  <g>
    <path :d="arcPath" fill="none" stroke="#1e293b" stroke-width="2" />
    <polygon :points="arrowHead" fill="#1e293b" />
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ width: number; height: number }>()

const r = computed(() => Math.min(props.width, props.height) / 2 - 4)

const arcPath = computed(() => {
  const rv = r.value
  return `M ${rv} 0 A ${rv} ${rv} 0 0 1 0 ${-rv}`
})

const arrowHead = computed(() => {
  const rv = r.value
  return `0,${-rv} -6,${-rv + 10} 6,${-rv + 10}`
})
</script>
