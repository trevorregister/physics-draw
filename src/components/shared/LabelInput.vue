<template>
  <div class="space-y-1">
    <input
      :value="modelValue"
      type="text"
      class="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <div
      v-if="modelValue"
      class="min-h-[28px] px-2 py-1 rounded border border-dashed border-border bg-muted/40 flex items-center"
      ref="previewEl"
    />
    <div v-else class="min-h-[28px] px-2 py-1 text-xs text-muted-foreground italic">
      KaTeX preview
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import katex from 'katex'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()
defineEmits<{ 'update:modelValue': [value: string] }>()

const previewEl = ref<HTMLElement | null>(null)

function renderPreview() {
  nextTick(() => {
    if (!previewEl.value || !props.modelValue) return
    try {
      katex.render(props.modelValue, previewEl.value, {
        throwOnError: false,
        displayMode: false,
        output: 'html',
      })
    } catch {
      if (previewEl.value) previewEl.value.textContent = props.modelValue
    }
  })
}

watch(() => props.modelValue, renderPreview, { immediate: true })
</script>
