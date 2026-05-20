<template>
  <div class="relative w-full h-full bg-white overflow-hidden">
    <svg
      ref="svgEl"
      :viewBox="`0 0 ${W} ${H}`"
      width="100%"
      height="100%"
      class="select-none"
      style="touch-action: none; cursor: crosshair;"
      @click="onCanvasClick"
      @mousemove="onMouseMove"
      @mouseleave="hoverSnap = null"
    >
      <defs>
        <marker
          id="mm-vel-arrow"
          markerWidth="8" markerHeight="6"
          refX="7" refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="#1e293b" />
        </marker>
        <marker
          id="mm-accel-arrow"
          markerWidth="8" markerHeight="6"
          refX="7" refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="#f43f5e" />
        </marker>
      </defs>

      <!-- Axis line -->
      <line
        v-if="isHorizontal"
        :x1="PADDING"
        :y1="BASELINE_Y"
        :x2="W - PADDING"
        :y2="BASELINE_Y"
        stroke="#94a3b8"
        stroke-width="2"
        stroke-linecap="round"
      />
      <line
        v-else
        :x1="BASELINE_X"
        :y1="PADDING"
        :x2="BASELINE_X"
        :y2="H - PADDING"
        stroke="#94a3b8"
        stroke-width="2"
        stroke-linecap="round"
      />

      <!-- Axis arrowhead at positive end -->
      <polygon
        v-if="isHorizontal && state.positiveDirection === 'right'"
        :points="`${W - PADDING - 1} ${BASELINE_Y - 5}, ${W - PADDING + 9} ${BASELINE_Y}, ${W - PADDING - 1} ${BASELINE_Y + 5}`"
        fill="#94a3b8"
      />
      <polygon
        v-else-if="isHorizontal && state.positiveDirection === 'left'"
        :points="`${PADDING + 1} ${BASELINE_Y - 5}, ${PADDING - 9} ${BASELINE_Y}, ${PADDING + 1} ${BASELINE_Y + 5}`"
        fill="#94a3b8"
      />
      <polygon
        v-else-if="!isHorizontal && state.positiveDirection === 'up'"
        :points="`${BASELINE_X - 5} ${PADDING + 1}, ${BASELINE_X} ${PADDING - 9}, ${BASELINE_X + 5} ${PADDING + 1}`"
        fill="#94a3b8"
      />
      <polygon
        v-else-if="!isHorizontal && state.positiveDirection === 'down'"
        :points="`${BASELINE_X - 5} ${H - PADDING - 1}, ${BASELINE_X} ${H - PADDING + 9}, ${BASELINE_X + 5} ${H - PADDING - 1}`"
        fill="#94a3b8"
      />

      <!-- "+" label at positive end -->
      <text
        v-if="isHorizontal"
        :x="state.positiveDirection === 'right' ? W - PADDING + 14 : PADDING - 14"
        :y="BASELINE_Y + 4"
        :text-anchor="state.positiveDirection === 'right' ? 'start' : 'end'"
        font-size="13"
        font-weight="600"
        fill="#64748b"
        pointer-events="none"
      >+</text>
      <text
        v-else
        :x="BASELINE_X + 8"
        :y="state.positiveDirection === 'up' ? PADDING - 14 : H - PADDING + 18"
        text-anchor="start"
        font-size="13"
        font-weight="600"
        fill="#64748b"
        pointer-events="none"
      >+</text>

      <!-- Grid tick marks (stripped on export) -->
      <g v-if="state.showGrid" data-no-export="true">
        <line
          v-for="idx in gridIndices"
          :key="idx"
          v-bind="tickAttrs(idx)"
          stroke="#cbd5e1"
          stroke-width="1"
        />
      </g>

      <!-- Dot markers -->
      <MMDotMarker
        v-for="dot in state.dots"
        :key="dot.id"
        :dot="dot"
        :orientation="state.orientation"
        :grid-spacing="state.gridSpacing"
        :canvas-w="W"
        :canvas-h="H"
        :baseline="isHorizontal ? BASELINE_Y : BASELINE_X"
        :velocity-length="velocityLengthForDot(dot)"
        :selected="selectedId === dot.id"
        :show-velocity="state.showAllVelocity && dot.velocity.visible"
        :show-accel="state.showAllAccel && dot.acceleration.visible"
        :show-label="state.showLabels"
        @select="$emit('select', $event)"
      />

      <!-- Hover preview: dashed alignment line + ghost dot -->
      <g v-if="hoverSnap" data-no-export="true">
        <line
          v-if="hoverSnap.laneOffset !== 0"
          :x1="hoverDotX"
          :y1="hoverDotY"
          :x2="isHorizontal ? hoverDotX : BASELINE_X"
          :y2="isHorizontal ? BASELINE_Y : hoverDotY"
          stroke="#cbd5e1"
          stroke-width="1"
          stroke-dasharray="4,3"
          pointer-events="none"
        />
        <circle
          :cx="hoverDotX"
          :cy="hoverDotY"
          r="7"
          fill="#94a3b8"
          opacity="0.4"
          pointer-events="none"
        />
      </g>

      <!-- Click hint when empty -->
      <text
        v-if="state.dots.length === 0"
        data-no-export="true"
        :x="W / 2"
        :y="isHorizontal ? BASELINE_Y - 30 : H / 2 - 30"
        text-anchor="middle"
        font-size="13"
        fill="#94a3b8"
        pointer-events="none"
      >Click anywhere to place dots on the axis</text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MMDot, MMState } from '@/types'
import MMDotMarker from './MMDotMarker.vue'

const props = defineProps<{
  state: MMState
  selectedId: string | null
}>()

const emit = defineEmits<{
  'add-dot': [gridIndex: number, laneOffset: number]
  select: [id: string | null]
}>()

const W = 800
const H = 500
const PADDING = 60
const BASELINE_Y = 250
const BASELINE_X = 400

const svgEl = ref<SVGSVGElement | null>(null)

const isHorizontal = computed(() => props.state.orientation === 'horizontal')

const hoverSnap = ref<{ gridIndex: number; laneOffset: number } | null>(null)

const hoverDotX = computed(() => {
  if (!hoverSnap.value) return 0
  return isHorizontal.value
    ? W / 2 + hoverSnap.value.gridIndex * props.state.gridSpacing
    : BASELINE_X + hoverSnap.value.laneOffset * props.state.gridSpacing
})
const hoverDotY = computed(() => {
  if (!hoverSnap.value) return 0
  return isHorizontal.value
    ? BASELINE_Y - hoverSnap.value.laneOffset * props.state.gridSpacing
    : H / 2 + hoverSnap.value.gridIndex * props.state.gridSpacing
})

const sortedByTime = computed(() =>
  [...props.state.dots].sort((a, b) => a.timeIndex - b.timeIndex)
)

function velocityLengthForDot(dot: MMDot): number {
  const sorted = sortedByTime.value
  const gs = props.state.gridSpacing
  const scale = props.state.velocityScale
  if (sorted.length <= 1) return gs * scale
  const idx = sorted.findIndex((d) => d.id === dot.id)
  const next = sorted[idx + 1]
  const prev = sorted[idx - 1]
  const spacing = next
    ? Math.abs(next.gridIndex - dot.gridIndex)
    : Math.abs(dot.gridIndex - prev!.gridIndex)
  return spacing * gs * scale
}

const gridIndices = computed(() => {
  const gs = props.state.gridSpacing
  const halfAxis = (isHorizontal.value ? W : H) / 2 - PADDING
  const half = Math.floor(halfAxis / gs)
  const indices: number[] = []
  for (let i = -half; i <= half; i++) indices.push(i)
  return indices
})

function tickAttrs(idx: number): Record<string, number> {
  if (isHorizontal.value) {
    const x = W / 2 + idx * props.state.gridSpacing
    return { x1: x, y1: BASELINE_Y - 6, x2: x, y2: BASELINE_Y + 6 }
  } else {
    const y = H / 2 + idx * props.state.gridSpacing
    return { x1: BASELINE_X - 6, y1: y, x2: BASELINE_X + 6, y2: y }
  }
}

function toSVGCoords(e: MouseEvent): { x: number; y: number } {
  const svg = svgEl.value!
  const pt = svg.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  const svgP = pt.matrixTransform(svg.getScreenCTM()!.inverse())
  return { x: svgP.x, y: svgP.y }
}

function snapFromEvent(e: MouseEvent): { gridIndex: number; laneOffset: number } {
  const { x, y } = toSVGCoords(e)
  const gs = props.state.gridSpacing
  const rawAxis = isHorizontal.value ? x : y
  const center = isHorizontal.value ? W / 2 : H / 2
  const maxIdx = Math.floor(((isHorizontal.value ? W : H) / 2 - PADDING) / gs)
  const gridIndex = Math.max(-maxIdx, Math.min(maxIdx, Math.round((rawAxis - center) / gs)))
  const rawLane = isHorizontal.value ? (BASELINE_Y - y) / gs : (x - BASELINE_X) / gs
  const laneOffset = Math.round(rawLane)
  return { gridIndex, laneOffset }
}

function onMouseMove(e: MouseEvent) {
  hoverSnap.value = snapFromEvent(e)
}

function onCanvasClick(e: MouseEvent) {
  const { gridIndex, laneOffset } = snapFromEvent(e)
  const existing = props.state.dots.find(
    (d) => d.gridIndex === gridIndex && d.laneOffset === laneOffset
  )
  if (existing) {
    emit('select', existing.id)
  } else {
    emit('add-dot', gridIndex, laneOffset)
  }
}

defineExpose({ svgEl })
</script>
