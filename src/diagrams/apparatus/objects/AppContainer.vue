<template>
  <g>
    <path :d="`M ${-width / 2} ${-height / 2} L ${-width / 2} ${height / 2} L ${width / 2} ${height / 2} L ${width / 2} ${-height / 2}`"
          fill="none" stroke="#1e293b" stroke-width="2" stroke-linecap="square" />
  </g>
</template>

<script setup lang="ts">
defineProps<{ width: number; height: number }>()
</script>
