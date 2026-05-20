<template>
  <g>
    <line :x1="-width / 2" y1="0" :x2="width / 2" y2="0"
          stroke="#1e293b" stroke-width="2" />
  </g>
</template>

<script setup lang="ts">
defineProps<{ width: number; height: number }>()
</script>
