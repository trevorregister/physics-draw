<template>
  <g>
    <rect :x="-width / 2" :y="-height / 2" :width="width" :height="height"
          fill="#f8fafc" stroke="#1e293b" stroke-width="2" />
  </g>
</template>

<script setup lang="ts">
defineProps<{ width: number; height: number }>()
</script>
