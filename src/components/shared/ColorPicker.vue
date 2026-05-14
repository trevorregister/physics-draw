<template>
  <div class="flex flex-wrap gap-1.5">
    <button
      v-for="color in COLORS"
      :key="color"
      type="button"
      class="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
      :style="{
        backgroundColor: color,
        borderColor: modelValue === color ? '#0f172a' : 'transparent',
      }"
      @click="$emit('update:modelValue', color)"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()

const COLORS = [
  '#000000', // black
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#0ea5e9', // sky
  '#6366f1', // indigo
  '#a855f7', // purple
  '#ec4899', // pink
  '#78716c', // stone
]
</script>
