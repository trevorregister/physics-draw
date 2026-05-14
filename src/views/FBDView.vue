<template>
  <div class="flex flex-col h-screen overflow-hidden bg-white">
    <!-- Top nav bar -->
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
      <span class="text-sm font-medium text-foreground">Free Body Diagram</span>
    </header>

    <!-- Content: canvas + sidebar -->
    <div class="flex flex-1 overflow-hidden">
      <div class="flex-1 overflow-hidden">
        <FBDCanvas
          ref="canvasRef"
          :state="state"
          :selected-id="selectedId"
          @select="(id) => (selectedId = id)"
          @update-vector="(id, angle, mag) => fbd.updateVector(id, { angle, magnitude: mag })"
          @commit-vector="fbd.commitVectorUpdate()"
        />
      </div>

      <FBDSidebar
        :state="state"
        :selected-id="selectedId"
        :selected-vector="selectedVector"
        :can-undo="canUndo"
        @add="fbd.addVector($event)"
        @delete="fbd.deleteVector($event)"
        @select="(id) => (selectedId = id)"
        @update-label="(id, label) => { fbd.updateVector(id, { label }); fbd.commitVectorUpdate() }"
        @set-object-style="fbd.setObjectStyle($event)"
        @set-snap="fbd.setSnapEnabled($event)"
        @set-grid="fbd.setShowGrid($event)"
        @set-crosshair="fbd.setShowCrosshair($event)"
        @undo="fbd.undoAction()"
        @export="onExport"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFBD } from '@/composables/useFBD'
import { useExport } from '@/composables/useExport'
import FBDCanvas from '@/diagrams/fbd/FBDCanvas.vue'
import FBDSidebar from '@/diagrams/fbd/FBDSidebar.vue'

const router = useRouter()
const fbd = useFBD()
const { state, selectedId, selectedVector, canUndo } = fbd

const canvasRef = ref<InstanceType<typeof FBDCanvas> | null>(null)
const svgRef = ref<SVGSVGElement | null>(null)
const exporter = useExport(svgRef, 'fbd-diagram.png')

onMounted(() => {
  svgRef.value = canvasRef.value?.svgEl ?? null
})

async function onExport() {
  svgRef.value = canvasRef.value?.svgEl ?? null
  await exporter.exportPng()
}

function onKeyDown(e: KeyboardEvent) {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (selectedId.value) fbd.deleteVector(selectedId.value)
  }
  if (e.key === 'Escape') selectedId.value = null
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault()
    fbd.undoAction()
  }
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>
