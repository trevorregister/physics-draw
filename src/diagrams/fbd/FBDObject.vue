<template>
  <g>
    <!-- Dot -->
    <circle v-if="style === 'dot'" :cx="cx" :cy="cy" r="6" fill="#1e293b" />
    <!-- Box -->
    <rect
      v-else-if="style === 'box'"
      :x="cx - 16"
      :y="cy - 16"
      width="32"
      height="32"
      fill="none"
      stroke="#1e293b"
      stroke-width="2.5"
      rx="2"
    />
    <!-- Circle -->
    <circle
      v-else
      :cx="cx"
      :cy="cy"
      r="22"
      fill="none"
      stroke="#1e293b"
      stroke-width="2.5"
    />
  </g>
</template>

<script setup lang="ts">
import type { ObjectStyle } from '@/types'

defineProps<{
  cx: number
  cy: number
  style: ObjectStyle
}>()
</script>
