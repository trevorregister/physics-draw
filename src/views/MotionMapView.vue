<template>
  <div class="flex flex-col h-screen overflow-hidden bg-white">
    <header class="flex-shrink-0 flex items-center gap-3 px-4 py-2.5 border-b border-border bg-white z-10">
      <button
        type="button"
        class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        @click="router.push('/')"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Home
      </button>
      <span class="text-muted-foreground">/</span>
      <span class="text-sm font-medium text-foreground">Motion Map</span>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <div class="flex-1 overflow-hidden">
        <MMCanvas
          ref="canvasRef"
          :state="state"
          :selected-id="selectedId"
          @add-dot="mm.addDot($event)"
          @select="(id) => (selectedId = id)"
        />
      </div>

      <MMSidebar
        :state="state"
        :selected-id="selectedId"
        :selected-dot="selectedDot"
        :can-undo="canUndo"
        @set-orientation="mm.setOrientation($event)"
        @set-positive-direction="mm.setPositiveDirection($event)"
        @set-grid-spacing="mm.setGridSpacing($event)"
        @set-show-grid="mm.setShowGrid($event)"
        @set-velocity-scale="mm.setVelocityScale($event)"
        @update-velocity="(id, vel) => mm.updateDotVelocity(id, vel)"
        @update-acceleration="(id, accel) => mm.updateDotAcceleration(id, accel)"
        @set-show-all-velocity="mm.setShowAllVelocity($event)"
        @set-show-all-accel="mm.setShowAllAccel($event)"
        @set-show-labels="mm.setShowLabels($event)"
        @delete="mm.deleteDot($event)"
        @clear="showClearConfirm = true"
        @undo="mm.undoAction()"
        @export="onExport"
      />
    </div>

    <ConfirmDialog
      :open="showClearConfirm"
      title="Clear diagram"
      message="This will remove all dots and reset settings. This action can be undone."
      confirm-label="Clear"
      @confirm="onClearConfirm"
      @cancel="showClearConfirm = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMotionMap } from '@/composables/useMotionMap'
import { useExport } from '@/composables/useExport'
import MMCanvas from '@/diagrams/motion-map/MMCanvas.vue'
import MMSidebar from '@/diagrams/motion-map/MMSidebar.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'

const router = useRouter()
const mm = useMotionMap()
const { state, selectedId, selectedDot, canUndo } = mm

const canvasRef = ref<InstanceType<typeof MMCanvas> | null>(null)
const svgRef = ref<SVGSVGElement | null>(null)
const exporter = useExport(svgRef, 'motion-map.png')
const showClearConfirm = ref(false)

onMounted(() => {
  svgRef.value = canvasRef.value?.svgEl ?? null
})

async function onExport() {
  svgRef.value = canvasRef.value?.svgEl ?? null
  await exporter.exportPng()
}

function onClearConfirm() {
  mm.clearAll()
  showClearConfirm.value = false
}

function onKeyDown(e: KeyboardEvent) {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (selectedId.value) mm.deleteDot(selectedId.value)
  }
  if (e.key === 'Escape') {
    if (showClearConfirm.value) showClearConfirm.value = false
    else selectedId.value = null
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault()
    mm.undoAction()
  }
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>
