<template>
  <foreignObject
    :x="x - width / 2"
    :y="y - height / 2"
    :width="width"
    :height="height"
    :data-label="latex"
    :data-color="color"
    style="overflow: visible; pointer-events: none;"
  >
    <div
      xmlns="http://www.w3.org/1999/xhtml"
      ref="labelEl"
      :style="{
        color,
        fontSize: '13px',
        fontFamily: 'KaTeX_Main, serif',
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }"
    />
  </foreignObject>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import katex from 'katex'

const props = defineProps<{
  latex: string
  x: number
  y: number
  color?: string
}>()

const width = 120
const height = 32
const color = props.color ?? '#1e293b'
const labelEl = ref<HTMLElement | null>(null)

function render() {
  if (!labelEl.value) return
  try {
    katex.render(props.latex, labelEl.value, {
      throwOnError: false,
      displayMode: false,
      output: 'html',
    })
  } catch {
    if (labelEl.value) labelEl.value.textContent = props.latex
  }
}

onMounted(render)
watch(() => props.latex, render)
</script>
