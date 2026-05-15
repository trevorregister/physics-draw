<template>
  <g style="cursor: pointer;" @click.stop="$emit('select', dot.id)">
    <!-- Dashed connector from off-axis dot to axis -->
    <line
      v-if="dot.laneOffset !== 0"
      :x1="dotX"
      :y1="dotY"
      :x2="isHorizontal ? dotX : baseline"
      :y2="isHorizontal ? baseline : dotY"
      stroke="#cbd5e1"
      stroke-width="1"
      stroke-dasharray="4,3"
      pointer-events="none"
    />

    <!-- Velocity arrow (originates from dot, parallel to axis) -->
    <line
      v-if="showVelocity && velocityLength > 0"
      :x1="dotX"
      :y1="dotY"
      :x2="velTipX"
      :y2="velTipY"
      stroke="#1e293b"
      stroke-width="2"
      marker-end="url(#mm-vel-arrow)"
      pointer-events="none"
    />

    <!-- Acceleration arrow (below/left of axis, anchored to axis projection) -->
    <line
      v-if="showAccel && dot.acceleration.magnitude > 0"
      :x1="accelBaseX"
      :y1="accelBaseY"
      :x2="accelTipX"
      :y2="accelTipY"
      stroke="#f43f5e"
      stroke-width="2"
      marker-end="url(#mm-accel-arrow)"
      pointer-events="none"
    />

    <!-- Dot -->
    <circle
      :cx="dotX"
      :cy="dotY"
      r="7"
      :fill="selected ? '#0ea5e9' : '#1e293b'"
      :stroke="selected ? '#0284c7' : 'none'"
      stroke-width="2"
    />

    <!-- Time label -->
    <text
      v-if="showLabel"
      :x="labelX"
      :y="labelY"
      :text-anchor="labelAnchor"
      dominant-baseline="middle"
      font-size="12"
      fill="#64748b"
      pointer-events="none"
    >t{{ subscript }}</text>
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MMDot, MMOrientation } from '@/types'

const ACCEL_OFFSET = 60

const props = defineProps<{
  dot: MMDot
  orientation: MMOrientation
  gridSpacing: number
  canvasW: number
  canvasH: number
  baseline: number
  velocityLength: number
  selected: boolean
  showVelocity: boolean
  showAccel: boolean
  showLabel: boolean
}>()

defineEmits<{
  select: [id: string]
}>()

const SUBSCRIPTS = '₀₁₂₃₄₅₆₇₈₉'
function toSubscript(n: number): string {
  return String(n)
    .split('')
    .map((d) => SUBSCRIPTS[parseInt(d)] ?? d)
    .join('')
}

const subscript = computed(() => toSubscript(props.dot.timeIndex))
const isHorizontal = computed(() => props.orientation === 'horizontal')

// Lane height equals gridSpacing — one lane = one grid unit perpendicular to axis
const dotX = computed(() =>
  isHorizontal.value
    ? props.canvasW / 2 + props.dot.gridIndex * props.gridSpacing
    : props.baseline + props.dot.laneOffset * props.gridSpacing
)
const dotY = computed(() =>
  isHorizontal.value
    ? props.baseline - props.dot.laneOffset * props.gridSpacing
    : props.canvasH / 2 + props.dot.gridIndex * props.gridSpacing
)

// Velocity: originates from dot, direction maps directly to SVG axis
const velDelta = computed(() => props.dot.velocity.direction * props.velocityLength)
const velTipX = computed(() => (isHorizontal.value ? dotX.value + velDelta.value : dotX.value))
const velTipY = computed(() => (isHorizontal.value ? dotY.value : dotY.value + velDelta.value))

// Acceleration: anchored to axis projection of the dot (same gridIndex position on axis)
const accelDelta = computed(
  () => props.dot.acceleration.direction * props.dot.acceleration.magnitude * props.gridSpacing
)
const accelBaseX = computed(() =>
  isHorizontal.value ? dotX.value : props.baseline - ACCEL_OFFSET
)
const accelBaseY = computed(() =>
  isHorizontal.value ? props.baseline + ACCEL_OFFSET : dotY.value
)
const accelTipX = computed(() =>
  isHorizontal.value ? dotX.value + accelDelta.value : props.baseline - ACCEL_OFFSET
)
const accelTipY = computed(() =>
  isHorizontal.value ? props.baseline + ACCEL_OFFSET : dotY.value + accelDelta.value
)

// Time label: placed to avoid dashed connector
// Horizontal above axis (laneOffset > 0): label above dot
// Otherwise: label below dot (horizontal) or left (vertical)
const labelX = computed(() => (isHorizontal.value ? dotX.value : dotX.value - 14))
const labelY = computed(() => {
  if (isHorizontal.value) {
    return props.dot.laneOffset > 0 ? dotY.value - 14 : dotY.value + 20
  }
  return dotY.value
})
const labelAnchor = computed(() => (isHorizontal.value ? 'middle' : 'end'))
</script>
