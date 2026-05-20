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
      <span class="text-sm font-medium text-foreground">Apparatus Diagram</span>
    </header>

    <!-- Content: sidebar + canvas + controls -->
    <div class="flex flex-1 overflow-hidden">
      <ApparatusSidebar />

      <div class="flex-1 overflow-hidden">
        <ApparatusCanvas ref="canvasRef" :apparatus="apparatus" />
      </div>

      <ApparatusControls
        :apparatus="apparatus"
        @export="onExport"
        @clear="showClearConfirm = true"
      />
    </div>

    <ConfirmDialog
      :open="showClearConfirm"
      title="Clear diagram"
      message="This will remove all objects. This action can be undone."
      confirm-label="Clear"
      @confirm="onClearConfirm"
      @cancel="showClearConfirm = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useApparatus } from '@/composables/useApparatus'
import { useExport } from '@/composables/useExport'
import ApparatusCanvas from '@/diagrams/apparatus/ApparatusCanvas.vue'
import ApparatusSidebar from '@/diagrams/apparatus/ApparatusSidebar.vue'
import ApparatusControls from '@/diagrams/apparatus/ApparatusControls.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'

const router = useRouter()
const apparatus = useApparatus()
const { selectedId } = apparatus

const canvasRef = ref<InstanceType<typeof ApparatusCanvas> | null>(null)
const svgRef = ref<SVGSVGElement | null>(null)
const exporter = useExport(svgRef, 'apparatus-diagram.png')
const showClearConfirm = ref(false)

onMounted(() => {
  svgRef.value = canvasRef.value?.svgEl ?? null
})

async function onExport() {
  svgRef.value = canvasRef.value?.svgEl ?? null
  await exporter.exportPng()
}

function onClearConfirm() {
  apparatus.clearAll()
  showClearConfirm.value = false
}

function onKeyDown(e: KeyboardEvent) {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (selectedId.value) apparatus.deleteObject(selectedId.value)
  }
  if (e.key === 'Escape') {
    if (showClearConfirm.value) showClearConfirm.value = false
    else apparatus.select(null)
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    apparatus.undoAction()
  }
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>
