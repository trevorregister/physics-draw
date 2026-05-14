<template>
  <g v-if="accelMag > 0" pointer-events="none">
    <defs>
      <marker
        id="accel-ah"
        markerWidth="10" markerHeight="7"
        refX="9" refY="3.5"
        orient="auto"
      >
        <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
      </marker>
    </defs>

    <!-- Label -->
    <text
      :x="labelX"
      :y="labelY"
      text-anchor="middle"
      font-size="12"
      fill="#ef4444"
    >a</text>

    <!-- Arrow -->
    <line
      :x1="startX"
      :y1="startY"
      :x2="endX"
      :y2="endY"
      stroke="#ef4444"
      stroke-width="2.5"
      marker-end="url(#accel-ah)"
    />
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MMOrientation } from '@/types'

const props = defineProps<{
  orientation: MMOrientation
  baseline: number
  centerPos: number
  accelMag: number
  accelDir: 1 | -1
  accelSide: number
}>()

// Acceleration arrow drawn on opposite side of baseline from velocity arrows
// accelSide: +1 = below baseline (horizontal) or left (vertical), in SVG coords

const startX = computed(() =>
  props.orientation === 'horizontal' ? props.centerPos - props.accelMag / 2 : props.accelSide
)
const startY = computed(() =>
  props.orientation === 'horizontal' ? props.accelSide : props.centerPos - props.accelMag / 2
)

const endX = computed(() =>
  props.orientation === 'horizontal'
    ? props.centerPos - props.accelMag / 2 + props.accelDir * props.accelMag
    : props.accelSide
)
const endY = computed(() =>
  props.orientation === 'horizontal'
    ? props.accelSide
    : props.centerPos - props.accelMag / 2 + props.accelDir * props.accelMag
)

const labelX = computed(() =>
  props.orientation === 'horizontal' ? (startX.value + endX.value) / 2 : props.accelSide - 12
)
const labelY = computed(() =>
  props.orientation === 'horizontal' ? props.accelSide - 6 : (startY.value + endY.value) / 2
)
</script>
