<template>
  <g
    style="cursor: pointer;"
    @pointerdown.stop="$emit('drag-start', $event, dot.id)"
    @click.stop="$emit('select', dot.id)"
  >
    <!-- Dot -->
    <circle
      :cx="dotX"
      :cy="dotY"
      r="7"
      :fill="selected ? '#0ea5e9' : '#1e293b'"
      :stroke="selected ? '#0284c7' : 'none'"
      stroke-width="2"
    />

    <!-- Time label using Unicode subscripts -->
    <text
      v-if="showLabel"
      :x="labelX"
      :y="labelY"
      :text-anchor="labelAnchor"
      dominant-baseline="middle"
      font-size="11"
      fill="#64748b"
      pointer-events="none"
    >t{{ subscript }}</text>

    <!-- Velocity arrow (perpendicular to baseline) -->
    <g v-if="showVelocity && dot.velocityMag > 0" pointer-events="none">
      <defs>
        <marker
          :id="`vel-${dot.id}`"
          markerWidth="8" markerHeight="6"
          refX="7" refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="#0ea5e9" />
        </marker>
      </defs>
      <line
        :x1="dotX"
        :y1="dotY"
        :x2="velTipX"
        :y2="velTipY"
        stroke="#0ea5e9"
        stroke-width="2"
        :marker-end="`url(#vel-${dot.id})`"
      />
    </g>
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MMDot, MMOrientation } from '@/types'

const props = defineProps<{
  dot: MMDot
  index: number
  orientation: MMOrientation
  baseline: number
  selected: boolean
  showVelocity: boolean
  showLabel: boolean
}>()

defineEmits<{
  select: [id: string]
  'drag-start': [event: PointerEvent, id: string]
}>()

const SUBSCRIPTS = '₀₁₂₃₄₅₆₇₈₉'
function toSubscript(n: number): string {
  return String(n).split('').map((d) => SUBSCRIPTS[parseInt(d)] ?? d).join('')
}

const subscript = computed(() => toSubscript(props.index))

const dotX = computed(() => props.orientation === 'horizontal' ? props.dot.position : props.baseline)
const dotY = computed(() => props.orientation === 'horizontal' ? props.baseline : props.dot.position)

// Label: below dot for horizontal; to the left for vertical (velocity arrows go right)
const labelX = computed(() => props.orientation === 'horizontal' ? dotX.value : dotX.value - 14)
const labelY = computed(() => props.orientation === 'horizontal' ? dotY.value + 20 : dotY.value)
const labelAnchor = computed(() => props.orientation === 'horizontal' ? 'middle' : 'end')

// Velocity arrow: perpendicular to baseline, above (−y) for horizontal, right (+x) for vertical
const velTipX = computed(() => {
  if (props.orientation === 'vertical') {
    return dotX.value + props.dot.velocityDir * props.dot.velocityMag
  }
  return dotX.value
})
const velTipY = computed(() => {
  if (props.orientation === 'horizontal') {
    return dotY.value - props.dot.velocityDir * props.dot.velocityMag
  }
  return dotY.value
})
</script>
