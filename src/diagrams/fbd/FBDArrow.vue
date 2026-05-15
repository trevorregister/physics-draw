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
    />

    <!-- KaTeX label offset from tip -->
    <KaTeXLabel
      :latex="vector.label"
      :x="labelX"
      :y="labelY"
      :color="vector.color"
    />
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

// Label placed past the tip, offset perpendicular to the arrow
const labelX = computed(() => {
  const mag = Math.max(props.vector.magnitude, 1)
  return props.cx + dx.value * 1.08 + (-dy.value / mag) * 14
})
const labelY = computed(() => {
  const mag = Math.max(props.vector.magnitude, 1)
  return props.cy + dy.value * 1.08 + (dx.value / mag) * 14
})
</script>
