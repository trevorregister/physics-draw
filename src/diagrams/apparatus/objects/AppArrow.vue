<template>
  <g>
    <line :x1="-width / 2" y1="0" :x2="width / 2 - 10" y2="0"
          stroke="#1e293b" stroke-width="2" />
    <polygon :points="`${width / 2},0 ${width / 2 - 12},-5 ${width / 2 - 12},5`"
             fill="#1e293b" />
  </g>
</template>

<script setup lang="ts">
defineProps<{ width: number; height: number }>()
</script>
