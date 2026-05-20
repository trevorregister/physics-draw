<template>
  <g>
    <!-- Back arcs (top halves) drawn first so front arcs appear over them -->
    <path :d="backPath"  fill="none" stroke="#1e293b" stroke-width="2" stroke-linecap="round" />
    <path :d="frontPath" fill="none" stroke="#1e293b" stroke-width="2" stroke-linecap="round" />
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ width: number; height: number }>()

function coilDims(w: number, h: number) {
  const N = Math.max(3, Math.round(w / 24))
  const flat = w * 0.08
  const coilW = (w - 2 * flat) / N
  return { w, N, flat, coilW, rx: coilW / 2, ry: h / 2, startX: -w / 2 + flat }
}

// Top semicircles (sweep=0 → counterclockwise → arcs go upward)
const backPath = computed(() => {
  const { N, coilW, rx, ry, startX } = coilDims(props.width, props.height)
  let d = `M ${startX} 0`
  for (let i = 0; i < N; i++)
    d += ` A ${rx} ${ry} 0 0 0 ${startX + (i + 1) * coilW} 0`
  return d
})

// Flat end sections + bottom semicircles (sweep=1 → clockwise → arcs go downward)
const frontPath = computed(() => {
  const { w, N, coilW, rx, ry, startX } = coilDims(props.width, props.height)
  let d = `M ${-w / 2} 0 L ${startX} 0`
  for (let i = 0; i < N; i++)
    d += ` A ${rx} ${ry} 0 0 1 ${startX + (i + 1) * coilW} 0`
  d += ` L ${w / 2} 0`
  return d
})
</script>
