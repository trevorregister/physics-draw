<template>
  <g :opacity="selected ? 1 : 0.9">
    <!-- Arrowhead marker definition per vector -->
    <defs>
      <marker
        :id="`ah-${vector.id}`"
        markerUnits="userSpaceOnUse"
        markerWidth="25"
        markerHeight="17.5"
        refX="0"
        refY="8.75"
        orient="auto"
      >
        <polygon :points="`0 0, 25 8.75, 0 17.5`" :fill="vector.color" />
      </marker>
    </defs>

    <!-- Selection halo -->
    <line
      v-if="selected"
      :x1="cx"
      :y1="cy"
      :x2="tipX"
      :y2="tipY"
      :stroke="vector.color"
      stroke-width="8"
      stroke-opacity="0.2"
      stroke-linecap="round"
      data-no-export="true"
    />

    <!-- Vector shaft -->
    <line
      :x1="cx"
      :y1="cy"
      :x2="shaftTipX"
      :y2="shaftTipY"
      :stroke="vector.color"
      stroke-width="5"
      stroke-linecap="butt"
      :marker-end="`url(#ah-${vector.id})`"
      style="cursor: pointer;"
      @pointerdown.stop="$emit('select', vector.id)"
    />

    <!-- Invisible wider hit area on the shaft -->
    <line
      :x1="cx"
      :y1="cy"
      :x2="tipX"
      :y2="tipY"
      stroke="transparent"
      stroke-width="12"
      style="cursor: pointer;"
      @pointerdown.stop="$emit('select', vector.id)"
    />

    <!-- Large invisible hit area at tip for easy grabbing -->
    <circle
      :cx="tipX"
      :cy="tipY"
      r="18"
      fill="transparent"
      style="cursor: grab;"
      @pointerdown.stop="$emit('drag-start', $event, vector.id)"
    />
    <!-- Visual handle shown when selected -->
    <circle
      v-if="selected"
      :cx="tipX"
      :cy="tipY"
      r="5"
      :fill="vector.color"
      stroke="white"
      stroke-width="1.5"
      pointer-events="none"
      data-no-export="true"
    />

    <!-- KaTeX label offset from tip -->
    <KaTeXLabel
      :latex="vector.label"
      :x="labelX"
      :y="labelY"
      :color="vector.color"
    />

    <!-- Angle arc and label -->
    <template v-if="arcData">
      <path
        :d="arcData.d"
        fill="none"
        :stroke="vector.color"
        stroke-width="1.5"
        stroke-opacity="0.85"
        stroke-dasharray="4 3"
        pointer-events="none"
      />
      <text
        :x="arcData.labelX"
        :y="arcData.labelY"
        text-anchor="middle"
        dominant-baseline="middle"
        :fill="vector.color"
        font-size="11"
        font-family="sans-serif"
        pointer-events="none"
      >{{ arcData.displayAngle }}°</text>
    </template>
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FBDVector } from '@/types'
import KaTeXLabel from '@/components/shared/KaTeXLabel.vue'

const props = defineProps<{
  vector: FBDVector
  cx: number
  cy: number
  selected: boolean
}>()

defineEmits<{
  select: [id: string]
  'drag-start': [event: PointerEvent, id: string]
}>()

const ARROWHEAD_LENGTH = 25

const rad = computed(() => (props.vector.angle * Math.PI) / 180)
const dx = computed(() => props.vector.magnitude * Math.cos(rad.value))
const dy = computed(() => -props.vector.magnitude * Math.sin(rad.value))

const tipX = computed(() => props.cx + dx.value)
const tipY = computed(() => props.cy + dy.value)

const shaftTipX = computed(() => props.cx + (props.vector.magnitude - ARROWHEAD_LENGTH) * Math.cos(rad.value))
const shaftTipY = computed(() => props.cy - (props.vector.magnitude - ARROWHEAD_LENGTH) * Math.sin(rad.value))

const LABEL_RADIUS = 24 // px from arrowhead tip, perpendicular to shaft

const labelX = computed(() => {
  const mag = Math.max(props.vector.magnitude, 1)
  return tipX.value + (-dy.value / mag) * LABEL_RADIUS
})
const labelY = computed(() => {
  const mag = Math.max(props.vector.magnitude, 1)
  return tipY.value + (dx.value / mag) * LABEL_RADIUS
})

const ARC_R = 40

const arcData = computed(() => {
  const mode = props.vector.angleDisplay ?? 'none'
  if (mode === 'none') return null

  const angle = props.vector.angle
  const toRad = (deg: number) => (deg * Math.PI) / 180

  let displayAngle: number
  let refAngle: number
  let sweep: number

  if (mode === 'horizontal') {
    const a = angle % 180
    displayAngle = Math.round(Math.min(a, 180 - a))
    refAngle = angle > 90 && angle < 270 ? 180 : 0
    const above = Math.sin(toRad(angle)) >= 0
    sweep = refAngle === 0 ? (above ? 0 : 1) : (above ? 1 : 0)
  } else {
    const a = (angle + 90) % 180
    displayAngle = Math.round(Math.min(a, 180 - a))
    refAngle = angle > 0 && angle <= 180 ? 90 : 270
    const right = Math.cos(toRad(angle)) >= 0
    sweep = refAngle === 90 ? (right ? 1 : 0) : (right ? 0 : 1)
  }

  if (displayAngle < 1) return null

  const startX = props.cx + ARC_R * Math.cos(toRad(refAngle))
  const startY = props.cy - ARC_R * Math.sin(toRad(refAngle))
  const endX = props.cx + ARC_R * Math.cos(toRad(angle))
  const endY = props.cy - ARC_R * Math.sin(toRad(angle))
  const d = `M ${startX} ${startY} A ${ARC_R} ${ARC_R} 0 0 ${sweep} ${endX} ${endY}`

  let diff = angle - refAngle
  if (diff > 180) diff -= 360
  if (diff < -180) diff += 360
  const midAngle = refAngle + diff / 2
  const LR = ARC_R + 14
  const lx = props.cx + LR * Math.cos(toRad(midAngle))
  const ly = props.cy - LR * Math.sin(toRad(midAngle))

  return { d, displayAngle, labelX: lx, labelY: ly }
})
</script>
