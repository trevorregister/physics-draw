<template>
  <div class="relative w-full h-full bg-white overflow-hidden">
    <svg
      ref="svgEl"
      :viewBox="`0 0 ${W} ${H}`"
      width="100%"
      height="100%"
      class="select-none"
      style="touch-action: none;"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointerleave="onPointerUp"
    >
      <!-- Baseline -->
      <line
        v-if="isHorizontal"
        :x1="PADDING"
        :y1="BASELINE"
        :x2="W - PADDING"
        :y2="BASELINE"
        stroke="#cbd5e1"
        stroke-width="2"
        stroke-linecap="round"
        style="cursor: crosshair;"
        @click="onBaselineClick"
      />
      <line
        v-else
        :x1="BASELINE"
        :y1="PADDING"
        :x2="BASELINE"
        :y2="H - PADDING"
        stroke="#cbd5e1"
        stroke-width="2"
        stroke-linecap="round"
        style="cursor: crosshair;"
        @click="onBaselineClick"
      />

      <!-- Axis end arrows -->
      <polygon
        v-if="isHorizontal"
        :points="`${W - PADDING} ${BASELINE - 5}, ${W - PADDING + 10} ${BASELINE}, ${W - PADDING} ${BASELINE + 5}`"
        fill="#cbd5e1"
      />
      <polygon
        v-else
        :points="`${BASELINE - 5} ${PADDING}, ${BASELINE} ${PADDING - 10}, ${BASELINE + 5} ${PADDING}`"
        fill="#cbd5e1"
      />

      <!-- Dots -->
      <MMDotMarker
        v-for="(dot, i) in sortedDots"
        :key="dot.id"
        :dot="dot"
        :index="i"
        :orientation="state.orientation"
        :baseline="BASELINE"
        :selected="selectedId === dot.id"
        :show-velocity="state.showVelocity"
        :show-label="state.showLabels"
        @select="$emit('select', $event)"
        @drag-start="onDotDragStart"
      />

      <!-- Acceleration arrow -->
      <MMAccelArrow
        v-if="state.showAccel && sortedDots.length > 0"
        :orientation="state.orientation"
        :baseline="BASELINE"
        :center-pos="centerPos"
        :accel-mag="state.accelMag"
        :accel-dir="state.accelDir"
        :accel-side="accelSide"
      />

      <!-- Click hint when empty -->
      <text
        v-if="sortedDots.length === 0"
        :x="W / 2"
        :y="isHorizontal ? BASELINE - 20 : W / 2"
        text-anchor="middle"
        font-size="13"
        fill="#94a3b8"
        pointer-events="none"
      >Click on the baseline to place dots</text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MMState, MMDot } from '@/types'
import { snapToIncrement } from '@/composables/useSnap'
import MMDotMarker from './MMDotMarker.vue'
import MMAccelArrow from './MMAccelArrow.vue'

const props = defineProps<{
  state: MMState
  selectedId: string | null
  sortedDots: MMDot[]
}>()

const emit = defineEmits<{
  'add-dot': [position: number]
  'update-dot': [id: string, position: number]
  'commit-dot': []
  select: [id: string | null]
}>()

const W = 800
const H = 500
const PADDING = 60
const BASELINE = 260  // y for horizontal, x for vertical

const svgEl = ref<SVGSVGElement | null>(null)

const isHorizontal = computed(() => props.state.orientation === 'horizontal')

// Center of all dots for acceleration arrow anchor
const centerPos = computed(() => {
  if (props.sortedDots.length === 0) return W / 2
  const positions = props.sortedDots.map((d) => d.position)
  return (Math.min(...positions) + Math.max(...positions)) / 2
})

// Accel arrow side: below baseline for horizontal (higher SVG y), left of baseline for vertical (lower SVG x)
const accelSide = computed(() =>
  isHorizontal.value ? BASELINE + 60 : BASELINE - 60
)

function toSVGCoords(e: PointerEvent | MouseEvent): { x: number; y: number } {
  const svg = svgEl.value!
  const pt = svg.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  const svgP = pt.matrixTransform(svg.getScreenCTM()!.inverse())
  return { x: svgP.x, y: svgP.y }
}

function onBaselineClick(e: MouseEvent) {
  const { x, y } = toSVGCoords(e)
  const rawPos = isHorizontal.value ? x : y
  let pos = rawPos
  if (props.state.snapEnabled) pos = snapToIncrement(rawPos, 10)
  pos = isHorizontal.value
    ? Math.max(PADDING, Math.min(W - PADDING, pos))
    : Math.max(PADDING, Math.min(H - PADDING, pos))
  emit('add-dot', pos)
}

// Drag state
const dragDotId = ref<string | null>(null)

function onDotDragStart(e: PointerEvent, id: string) {
  e.preventDefault()
  dragDotId.value = id
  svgEl.value?.setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!dragDotId.value) return
  const { x, y } = toSVGCoords(e)
  const rawPos = isHorizontal.value ? x : y
  let pos = rawPos
  if (props.state.snapEnabled) pos = snapToIncrement(rawPos, 10)
  pos = isHorizontal.value
    ? Math.max(PADDING, Math.min(W - PADDING, pos))
    : Math.max(PADDING, Math.min(H - PADDING, pos))
  emit('update-dot', dragDotId.value, pos)
}

function onPointerUp() {
  if (dragDotId.value) {
    dragDotId.value = null
    emit('commit-dot')
  }
}

defineExpose({ svgEl })
</script>
