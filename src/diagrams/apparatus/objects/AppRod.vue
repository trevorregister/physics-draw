<template>
  <g>
    <rect :x="-width / 2" :y="-height / 2" :width="width" :height="height"
          fill="#94a3b8" stroke="#1e293b" stroke-width="1.5" />
  </g>
</template>

<script setup lang="ts">
defineProps<{ width: number; height: number }>()
</script>
