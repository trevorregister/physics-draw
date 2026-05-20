<template>
  <div
    class="relative w-full h-full bg-white overflow-hidden"
    @dragover.prevent
    @drop="onDrop"
  >
    <svg
      ref="svgEl"
      viewBox="0 0 900 650"
      width="100%"
      height="100%"
      class="select-none"
      style="touch-action: none;"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @lostpointercapture="onPointerUp"
      @dragstart.prevent
      @wheel.prevent="onWheel"
    >
      <!-- Background: click to deselect -->
      <rect width="900" height="650" fill="transparent"
            @pointerdown="apparatus.select(null)" />

      <!-- Viewport group (pan + zoom) -->
      <g :transform="`translate(${vpX},${vpY}) scale(${vpScale})`">

        <!-- Grid -->
        <g v-if="state.showGrid" data-no-export="true" opacity="0.3">
          <line
            v-for="x in gridLinesX"
            :key="`gx-${x}`"
            :x1="x" y1="-5000" :x2="x" y2="5000"
            stroke="#94a3b8" stroke-width="0.5"
          />
          <line
            v-for="y in gridLinesY"
            :key="`gy-${y}`"
            x1="-5000" :y1="y" x2="5000" :y2="y"
            stroke="#94a3b8" stroke-width="0.5"
          />
        </g>

        <!-- Object shapes -->
        <g
          v-for="obj in state.objects"
          :key="obj.id"
          :transform="`translate(${obj.x},${obj.y}) rotate(${obj.rotation})`"
          style="cursor: move;"
          @pointerdown.stop="startMove(obj.id, $event)"
        >
          <ApparatusObjectRenderer :type="obj.type" :width="obj.width" :height="obj.height" />
          <!-- Hit-test rect for small/line objects -->
          <rect
            :x="-obj.width / 2 - 4" :y="-obj.height / 2 - 4"
            :width="obj.width + 8" :height="obj.height + 8"
            fill="transparent"
            :stroke="selectedId === obj.id ? '#0ea5e9' : 'transparent'"
            stroke-width="0"
          />
        </g>

        <!-- Labels -->
        <g v-for="obj in state.objects" :key="`lbl-${obj.id}`">
          <template v-for="lbl in obj.labels" :key="lbl.id">
            <KaTeXLabel
              :latex="buildLabelLatex(lbl)"
              :x="obj.x + lbl.offsetX"
              :y="obj.y + lbl.offsetY"
            />
            <rect
              :x="obj.x + lbl.offsetX - 60"
              :y="obj.y + lbl.offsetY - 16"
              width="120" height="32"
              fill="transparent"
              pointer-events="all"
              style="cursor: move;"
              @pointerdown.stop="startLabelDrag(obj.id, lbl.id, $event)"
            />
          </template>
        </g>

        <!-- Selection overlay -->
        <g
          v-if="selectedObj"
          :transform="`translate(${selectedObj.x},${selectedObj.y}) rotate(${selectedObj.rotation})`"
          pointer-events="none"
          data-no-export="true"
        >
          <!-- Bounding box -->
          <rect
            :x="-selectedObj.width / 2"
            :y="-selectedObj.height / 2"
            :width="selectedObj.width"
            :height="selectedObj.height"
            fill="none"
            stroke="#0ea5e9"
            stroke-width="1"
            stroke-dasharray="5 3"
          />
          <!-- Resize handles (pointer-events re-enabled) -->
          <rect
            v-for="h in resizeHandles"
            :key="h.name"
            :x="h.x - 5" :y="h.y - 5"
            width="10" height="10"
            fill="white" stroke="#0ea5e9" stroke-width="1.5"
            rx="1"
            :style="{ cursor: h.cursor, pointerEvents: 'all' }"
            @pointerdown.stop="startResize(h.name, $event)"
          />
          <!-- Rotation handle -->
          <line
            x1="0" :y1="-selectedObj.height / 2"
            x2="0" :y2="-selectedObj.height / 2 - 20"
            stroke="#0ea5e9" stroke-width="1"
            pointer-events="none"
          />
          <circle
            cx="0" :cy="-selectedObj.height / 2 - 26"
            r="6"
            fill="white" stroke="#0ea5e9" stroke-width="1.5"
            style="cursor: grab; pointer-events: all;"
            @pointerdown.stop="startRotation($event)"
          />
        </g>

      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ApparatusObjectType, ObjectLabel } from '@/types/apparatus'
import type { useApparatus } from '@/composables/useApparatus'
import { snapToIncrement, snapInclineCenter } from '@/composables/useSnap'
import { DEFAULT_DIMS } from '@/composables/useApparatus'
import ApparatusObjectRenderer from './ApparatusObjectRenderer.vue'
import KaTeXLabel from '@/components/shared/KaTeXLabel.vue'

const props = defineProps<{
  apparatus: ReturnType<typeof useApparatus>
}>()

const { state, selectedId, selectedObject: selectedObj } = props.apparatus
const apparatus = props.apparatus

const svgEl = ref<SVGSVGElement | null>(null)
defineExpose({ svgEl })

// Viewport state (not in undo stack)
const vpX = ref(0)
const vpY = ref(0)
const vpScale = ref(1)

// Grid lines computed from a large fixed range
const gridLinesX = computed(() => {
  const lines: number[] = []
  const gs = state.value.gridSpacing
  for (let x = -4000; x <= 5000; x += gs) lines.push(x)
  return lines
})
const gridLinesY = computed(() => {
  const lines: number[] = []
  const gs = state.value.gridSpacing
  for (let y = -4000; y <= 4000; y += gs) lines.push(y)
  return lines
})

const resizeHandles = computed(() => {
  if (!selectedObj.value) return []
  const hw = selectedObj.value.width / 2
  const hh = selectedObj.value.height / 2
  return [
    { name: 'nw', x: -hw, y: -hh, cursor: 'nw-resize' },
    { name: 'n',  x: 0,   y: -hh, cursor: 'n-resize' },
    { name: 'ne', x: hw,  y: -hh, cursor: 'ne-resize' },
    { name: 'e',  x: hw,  y: 0,   cursor: 'e-resize' },
    { name: 'se', x: hw,  y: hh,  cursor: 'se-resize' },
    { name: 's',  x: 0,   y: hh,  cursor: 's-resize' },
    { name: 'sw', x: -hw, y: hh,  cursor: 'sw-resize' },
    { name: 'w',  x: -hw, y: 0,   cursor: 'w-resize' },
  ]
})

// Drag state
type DragMode = null | 'move' | 'resize-nw' | 'resize-n' | 'resize-ne' | 'resize-e' |
  'resize-se' | 'resize-s' | 'resize-sw' | 'resize-w' | 'rotate' | 'label'

const DRAG_THRESHOLD_PX = 5

// After an HTML5 drop, some browsers fire a synthetic pointerdown at the drop location.
// Since the new object occupies that position, startMove would capture the pointer and
// treat subsequent mouse movement as a drag. Block startMove for one frame after a drop.
let dropGuard = false
let dropGuardFrame = -1

const dragMode = ref<DragMode>(null)
const dragObjectId = ref<string | null>(null)
const dragLabelId = ref<string | null>(null)
const dragHasStarted = ref(false)
const dragStartClientX = ref(0)
const dragStartClientY = ref(0)
const dragStart = ref({
  canvasX: 0, canvasY: 0,
  objX: 0, objY: 0,
  objW: 0, objH: 0,
  objRot: 0,
  lblOffsetX: 0, lblOffsetY: 0,
  handleAngle: 0,
})

function clientToCanvas(clientX: number, clientY: number) {
  const svg = svgEl.value!
  const pt = svg.createSVGPoint()
  pt.x = clientX
  pt.y = clientY
  const svgPt = pt.matrixTransform(svg.getScreenCTM()!.inverse())
  return {
    x: (svgPt.x - vpX.value) / vpScale.value,
    y: (svgPt.y - vpY.value) / vpScale.value,
  }
}

function startMove(objId: string, e: PointerEvent) {
  if (dropGuard) return
  const obj = state.value.objects.find((o) => o.id === objId)!
  apparatus.select(objId)
  dragMode.value = 'move'
  dragObjectId.value = objId
  dragHasStarted.value = false
  dragStartClientX.value = e.clientX
  dragStartClientY.value = e.clientY
  const pt = clientToCanvas(e.clientX, e.clientY)
  dragStart.value = { ...dragStart.value, canvasX: pt.x, canvasY: pt.y, objX: obj.x, objY: obj.y }
  svgEl.value!.setPointerCapture(e.pointerId)
}

function startResize(handleName: string, e: PointerEvent) {
  const obj = selectedObj.value!
  dragMode.value = `resize-${handleName}` as DragMode
  dragObjectId.value = obj.id
  const pt = clientToCanvas(e.clientX, e.clientY)
  dragStart.value = {
    ...dragStart.value,
    canvasX: pt.x, canvasY: pt.y,
    objX: obj.x, objY: obj.y,
    objW: obj.width, objH: obj.height,
    objRot: obj.rotation,
  }
  svgEl.value!.setPointerCapture(e.pointerId)
}

function startRotation(e: PointerEvent) {
  const obj = selectedObj.value!
  dragMode.value = 'rotate'
  dragObjectId.value = obj.id
  const pt = clientToCanvas(e.clientX, e.clientY)
  const handleAngle = Math.atan2(pt.y - obj.y, pt.x - obj.x) * 180 / Math.PI
  dragStart.value = { ...dragStart.value, canvasX: pt.x, canvasY: pt.y, objRot: obj.rotation, handleAngle }
  svgEl.value!.setPointerCapture(e.pointerId)
}

function startLabelDrag(objId: string, lblId: string, e: PointerEvent) {
  const obj = state.value.objects.find((o) => o.id === objId)!

  // Standalone labels: drag moves the object itself, not the offset
  if (obj.type === 'standalone-label') {
    startMove(objId, e)
    return
  }

  const lbl = obj.labels.find((l) => l.id === lblId)!
  apparatus.select(objId)
  dragMode.value = 'label'
  dragObjectId.value = objId
  dragLabelId.value = lblId
  const pt = clientToCanvas(e.clientX, e.clientY)
  dragStart.value = {
    ...dragStart.value,
    canvasX: pt.x, canvasY: pt.y,
    lblOffsetX: lbl.offsetX, lblOffsetY: lbl.offsetY,
  }
  svgEl.value!.setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!dragMode.value || !dragObjectId.value) return
  if (e.buttons === 0) { onPointerUp(); return }
  const pt = clientToCanvas(e.clientX, e.clientY)
  const dx = pt.x - dragStart.value.canvasX
  const dy = pt.y - dragStart.value.canvasY

  if (dragMode.value === 'move') {
    if (!dragHasStarted.value) {
      const sdx = e.clientX - dragStartClientX.value
      const sdy = e.clientY - dragStartClientY.value
      if (sdx * sdx + sdy * sdy < DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) return
      dragHasStarted.value = true
    }
    let x = dragStart.value.objX + dx
    let y = dragStart.value.objY + dy
    if (state.value.snapEnabled) {
      const obj = state.value.objects.find((o) => o.id === dragObjectId.value)!
      if (obj.type === 'incline') {
        const snapped = snapInclineCenter(x, y, obj.width, obj.height, state.value.gridSpacing)
        x = snapped.x; y = snapped.y
      } else {
        x = snapToIncrement(x, state.value.gridSpacing)
        y = snapToIncrement(y, state.value.gridSpacing)
      }
    }
    apparatus.moveObject(dragObjectId.value, x, y)

  } else if (dragMode.value === 'rotate') {
    const obj = state.value.objects.find((o) => o.id === dragObjectId.value)!
    const angle = Math.atan2(pt.y - obj.y, pt.x - obj.x) * 180 / Math.PI
    let rot = dragStart.value.objRot + (angle - dragStart.value.handleAngle)
    if (state.value.snapEnabled) rot = snapToIncrement(rot, 15)
    apparatus.rotateObject(dragObjectId.value, rot)

  } else if (dragMode.value === 'label') {
    apparatus.moveLabelOffset(
      dragObjectId.value,
      dragLabelId.value!,
      dragStart.value.lblOffsetX + dx,
      dragStart.value.lblOffsetY + dy,
    )

  } else if (dragMode.value.startsWith('resize-')) {
    const handle = dragMode.value.replace('resize-', '')
    const rad = (dragStart.value.objRot * Math.PI) / 180
    const cos = Math.cos(-rad)
    const sin = Math.sin(-rad)
    const ldx = dx * cos - dy * sin
    const ldy = dx * sin + dy * cos

    let w = dragStart.value.objW
    let h = dragStart.value.objH
    if (handle.includes('e')) w = dragStart.value.objW + 2 * ldx
    if (handle.includes('w')) w = dragStart.value.objW - 2 * ldx
    if (handle.includes('s')) h = dragStart.value.objH + 2 * ldy
    if (handle.includes('n')) h = dragStart.value.objH - 2 * ldy

    const gs = state.value.gridSpacing
    if (state.value.snapEnabled) {
      w = Math.max(gs, snapToIncrement(w, gs))
      h = Math.max(gs, snapToIncrement(h, gs))
    }
    apparatus.resizeObject(dragObjectId.value, dragStart.value.objX, dragStart.value.objY, w, h)
  }
}

function onPointerUp() {
  if (!dragMode.value || !dragObjectId.value) return
  if (dragMode.value === 'move') {
    if (dragHasStarted.value) apparatus.commitMove(dragObjectId.value)
  } else if (dragMode.value === 'rotate') apparatus.commitRotation(dragObjectId.value)
  else if (dragMode.value === 'label') apparatus.commitLabelMove(dragObjectId.value, dragLabelId.value!)
  else if (dragMode.value.startsWith('resize-')) apparatus.commitResize(dragObjectId.value)
  dragMode.value = null
  dragObjectId.value = null
  dragLabelId.value = null
  dragHasStarted.value = false
}

function onWheel(e: WheelEvent) {
  if (e.ctrlKey || e.metaKey) {
    const factor = 1 - e.deltaY * 0.001
    const newScale = Math.min(4, Math.max(0.25, vpScale.value * factor))
    const svg = svgEl.value!
    const pt = svg.createSVGPoint()
    pt.x = e.clientX; pt.y = e.clientY
    const svgPt = pt.matrixTransform(svg.getScreenCTM()!.inverse())
    vpX.value = svgPt.x - (svgPt.x - vpX.value) * (newScale / vpScale.value)
    vpY.value = svgPt.y - (svgPt.y - vpY.value) * (newScale / vpScale.value)
    vpScale.value = newScale
  } else {
    vpX.value -= e.deltaX
    vpY.value -= e.deltaY
  }
}

function onDrop(e: DragEvent) {
  const type = e.dataTransfer?.getData('apparatus-type') as ApparatusObjectType | undefined
  if (!type || !svgEl.value) return
  const pt = clientToCanvas(e.clientX, e.clientY)
  const gs = state.value.gridSpacing
  let x = state.value.snapEnabled ? snapToIncrement(pt.x, gs) : pt.x
  let y = state.value.snapEnabled ? snapToIncrement(pt.y, gs) : pt.y
  if (type === 'incline' && state.value.snapEnabled) {
    const [iw, ih] = DEFAULT_DIMS['incline']
    const snapped = snapInclineCenter(pt.x, pt.y, iw, ih, gs)
    x = snapped.x; y = snapped.y
  }
  const labelKatex = type === 'standalone-label'
    ? (e.dataTransfer?.getData('apparatus-label') || '')
    : undefined
  apparatus.addObject(type, x, y, labelKatex)
  dropGuard = true
  cancelAnimationFrame(dropGuardFrame)
  dropGuardFrame = requestAnimationFrame(() => { dropGuard = false })
}

function buildLabelLatex(lbl: ObjectLabel): string {
  if (!lbl.value.trim()) return lbl.katex
  const unitStr =
    lbl.unit === 'deg'
      ? '^{\\circ}'
      : lbl.unit
        ? `\\ \\text{${lbl.unit}}`
        : ''
  return `${lbl.katex} = ${lbl.value}${unitStr}`
}
</script>
