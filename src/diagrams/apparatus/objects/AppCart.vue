<template>
  <g>
    <rect :x="-width / 2" :y="-height / 2 + 10" :width="width" :height="height - 16"
          fill="#f8fafc" stroke="#1e293b" stroke-width="2" />
    <circle :cx="-width / 4" :cy="height / 2 - 2" r="8"
            fill="#f8fafc" stroke="#1e293b" stroke-width="2" />
    <circle :cx="width / 4" :cy="height / 2 - 2" r="8"
            fill="#f8fafc" stroke="#1e293b" stroke-width="2" />
  </g>
</template>

<script setup lang="ts">
defineProps<{ width: number; height: number }>()
</script>
