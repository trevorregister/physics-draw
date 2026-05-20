<template>
  <g>
    <line :x1="-width / 2" y1="0" :x2="width / 2" y2="0"
          stroke="#94a3b8" stroke-width="2" stroke-dasharray="6 4" />
  </g>
</template>

<script setup lang="ts">
defineProps<{ width: number; height: number }>()
</script>
