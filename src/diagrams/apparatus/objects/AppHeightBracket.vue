<template>
  <g>
    <line x1="0" :y1="-height / 2 + 8" x2="0" :y2="height / 2 - 8"
          stroke="#1e293b" stroke-width="2" />
    <line :x1="-6" :y1="-height / 2" :x2="6" :y2="-height / 2"
          stroke="#1e293b" stroke-width="2" />
    <line :x1="-6" :y1="height / 2" :x2="6" :y2="height / 2"
          stroke="#1e293b" stroke-width="2" />
    <polygon :points="`0,${-height / 2} -4,${-height / 2 + 10} 4,${-height / 2 + 10}`"
             fill="#1e293b" />
    <polygon :points="`0,${height / 2} -4,${height / 2 - 10} 4,${height / 2 - 10}`"
             fill="#1e293b" />
  </g>
</template>

<script setup lang="ts">
defineProps<{ width: number; height: number }>()
</script>
