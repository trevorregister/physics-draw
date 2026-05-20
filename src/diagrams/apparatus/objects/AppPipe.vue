<template>
  <g>
    <line :x1="-width / 2" :y1="-height / 2" :x2="width / 2" :y2="-height / 2"
          stroke="#1e293b" stroke-width="2" />
    <line :x1="-width / 2" :y1="height / 2" :x2="width / 2" :y2="height / 2"
          stroke="#1e293b" stroke-width="2" />
  </g>
</template>

<script setup lang="ts">
defineProps<{ width: number; height: number }>()
</script>
