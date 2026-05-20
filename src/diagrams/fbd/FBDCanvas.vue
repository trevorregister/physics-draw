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
      @click="onSvgClick"
    >
      <!-- Grid -->
      <g v-if="state.showGrid" opacity="0.25">
        <line
          v-for="x in gridLinesX"
          :key="`gx-${x}`"
          :x1="x" y1="0" :x2="x" :y2="H"
          stroke="#94a3b8" stroke-width="0.5"
        />
        <line
          v-for="y in gridLinesY"
          :key="`gy-${y}`"
          x1="0" :y1="y" :x2="W" :y2="y"
          stroke="#94a3b8" stroke-width="0.5"
        />
      </g>

      <!-- Crosshair -->
      <g v-if="state.showCrosshair" opacity="0.3">
        <line :x1="CX" y1="0" :x2="CX" :y2="H" stroke="#0ea5e9" stroke-width="1" stroke-dasharray="6 4" />
        <line x1="0" :y1="CY" :x2="W" :y2="CY" stroke="#0ea5e9" stroke-width="1" stroke-dasharray="6 4" />
      </g>

      <!-- Vectors -->
      <FBDArrow
        v-for="v in state.vectors"
        :key="v.id"
        :vector="v"
        :cx="CX"
        :cy="CY"
        :selected="selectedId === v.id"
        @select="$emit('select', $event)"
        @drag-start="onDragStart"
      />

      <!-- Ghost arrow while dragging -->
      <line
        v-if="ghost"
        :x1="CX" :y1="CY"
        :x2="ghost.x" :y2="ghost.y"
        stroke="#94a3b8"
        stroke-width="2"
        stroke-dasharray="6 4"
        pointer-events="none"
        data-no-export="true"
      />

      <!-- Snap angle hint -->
      <text
        v-if="ghost && state.snapEnabled"
        :x="ghost.x + 10"
        :y="ghost.y - 6"
        font-size="11"
        fill="#64748b"
        pointer-events="none"
        data-no-export="true"
      >{{ ghost.angle }}°</text>

      <!-- Center object -->
      <FBDObject :cx="CX" :cy="CY" :style="state.objectStyle" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FBDState } from '@/types'
import { snapToIncrement } from '@/composables/useSnap'
import FBDArrow from './FBDArrow.vue'
import FBDObject from './FBDObject.vue'

const props = defineProps<{
  state: FBDState
  selectedId: string | null
}>()

const emit = defineEmits<{
  select: [id: string | null]
  'update-vector': [id: string, angle: number, magnitude: number]
  'commit-vector': []
}>()

const W = 800
const H = 600
const CX = W / 2
const CY = H / 2
const GRID_SIZE = 40

const svgEl = ref<SVGSVGElement | null>(null)

const gridLinesX = computed(() => {
  const lines = []
  for (let x = 0; x <= W; x += GRID_SIZE) lines.push(x)
  return lines
})
const gridLinesY = computed(() => {
  const lines = []
  for (let y = 0; y <= H; y += GRID_SIZE) lines.push(y)
  return lines
})

// Drag state
const dragVectorId = ref<string | null>(null)
const ghost = ref<{ x: number; y: number; angle: number } | null>(null)

function toSVGCoords(e: PointerEvent): { x: number; y: number } {
  const svg = svgEl.value!
  const pt = svg.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  const svgP = pt.matrixTransform(svg.getScreenCTM()!.inverse())
  return { x: svgP.x, y: svgP.y }
}

function onDragStart(e: PointerEvent, id: string) {
  e.preventDefault()
  dragVectorId.value = id
  svgEl.value?.setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!dragVectorId.value) return
  const { x, y } = toSVGCoords(e)
  const ddx = x - CX
  const ddy = -(y - CY)

  let rawAngle = Math.atan2(ddy, ddx) * (180 / Math.PI)
  if (rawAngle < 0) rawAngle += 360
  let rawMag = Math.sqrt(ddx * ddx + ddy * ddy)

  let angle = rawAngle
  let magnitude = Math.max(30, rawMag)

  if (props.state.snapEnabled) {
    angle = ((snapToIncrement(rawAngle, 15) % 360) + 360) % 360
    magnitude = Math.max(30, snapToIncrement(rawMag, 20))
  }

  // Recompute tip position after snapping for ghost
  const snapRad = (angle * Math.PI) / 180
  const sx = CX + magnitude * Math.cos(snapRad)
  const sy = CY - magnitude * Math.sin(snapRad)

  ghost.value = { x: sx, y: sy, angle: Math.round(angle) }
  emit('update-vector', dragVectorId.value, angle, magnitude)
}

function onPointerUp(_e: PointerEvent) {
  if (dragVectorId.value) {
    ghost.value = null
    dragVectorId.value = null
    emit('commit-vector')
  }
}

function onSvgClick(e: MouseEvent) {
  // Deselect if clicking background
  if (e.target === svgEl.value) {
    emit('select', null)
  }
}

defineExpose({ svgEl })
</script>
