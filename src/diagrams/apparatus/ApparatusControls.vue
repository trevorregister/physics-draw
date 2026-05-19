<template>
  <aside class="w-64 flex-shrink-0 flex flex-col border-l border-border bg-background">
    <!-- Properties panel (when selected) -->
    <div v-if="selectedObj" class="flex-1 overflow-y-auto px-4 py-3 space-y-4 border-b border-border">
      <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {{ TYPE_NAMES[selectedObj.type] ?? selectedObj.type }}
      </p>

      <!-- Width / Height / Rotation (hidden for standalone-label) -->
      <template v-if="selectedObj.type !== 'standalone-label'">
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-xs text-muted-foreground block mb-1">Width</label>
            <input
              type="number"
              min="10"
              :value="Math.round(selectedObj.width)"
              class="w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
              @change="apparatus.resizeObject(selectedObj!.id, selectedObj!.x, selectedObj!.y, +($event.target as HTMLInputElement).value, selectedObj!.height); apparatus.commitResize(selectedObj!.id)"
            />
          </div>
          <div>
            <label class="text-xs text-muted-foreground block mb-1">Height</label>
            <input
              type="number"
              min="10"
              :value="Math.round(selectedObj.height)"
              class="w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
              @change="apparatus.resizeObject(selectedObj!.id, selectedObj!.x, selectedObj!.y, selectedObj!.width, +($event.target as HTMLInputElement).value); apparatus.commitResize(selectedObj!.id)"
            />
          </div>
        </div>

        <div>
          <label class="text-xs text-muted-foreground block mb-1">Rotation (°)</label>
          <input
            type="number"
            :value="Math.round(selectedObj.rotation)"
            class="w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
            @change="apparatus.rotateObject(selectedObj!.id, +($event.target as HTMLInputElement).value); apparatus.commitRotation(selectedObj!.id)"
          />
        </div>
      </template>

      <!-- Labels -->
      <div>
        <p class="text-xs font-medium text-muted-foreground mb-2">Labels</p>
        <div class="space-y-3">
          <div
            v-for="lbl in selectedObj.labels"
            :key="lbl.id"
            class="rounded-md border border-border bg-muted/30 p-2 space-y-1.5"
          >
            <div class="flex items-center gap-1">
              <input
                :value="lbl.katex"
                placeholder="LaTeX (e.g. F_g)"
                class="flex-1 rounded border border-input bg-background px-2 py-1 text-xs font-mono"
                @change="apparatus.updateLabel(selectedObj!.id, lbl.id, { katex: ($event.target as HTMLInputElement).value })"
              />
              <button
                type="button"
                class="text-muted-foreground hover:text-destructive transition-colors p-1"
                @click="apparatus.deleteLabel(selectedObj!.id, lbl.id)"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="grid grid-cols-2 gap-1">
              <input
                :value="lbl.value"
                placeholder="Value"
                class="rounded border border-input bg-background px-2 py-1 text-xs"
                @change="apparatus.updateLabel(selectedObj!.id, lbl.id, { value: ($event.target as HTMLInputElement).value })"
              />
              <input
                :value="lbl.unit"
                placeholder="Unit"
                class="rounded border border-input bg-background px-2 py-1 text-xs"
                @change="apparatus.updateLabel(selectedObj!.id, lbl.id, { unit: ($event.target as HTMLInputElement).value })"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          class="mt-2 w-full py-1.5 rounded-md border border-dashed border-border text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
          @click="addDefaultLabel"
        >
          + Add label
        </button>
      </div>

      <!-- Delete -->
      <button
        type="button"
        class="w-full py-1.5 rounded-md border border-destructive/30 text-destructive text-xs hover:bg-destructive/5 transition-colors"
        @click="apparatus.deleteObject(selectedObj!.id)"
      >
        Delete object
      </button>
    </div>

    <!-- Canvas controls -->
    <div class="px-4 py-3 space-y-4" :class="selectedObj ? '' : 'flex-1'">
      <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Canvas</p>

      <!-- Snap toggle -->
      <div class="flex items-center justify-between">
        <span class="text-xs text-foreground">Snap to grid</span>
        <button
          type="button"
          class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
          :class="state.snapEnabled ? 'bg-sky-500' : 'bg-muted'"
          @click="apparatus.setSnap(!state.snapEnabled)"
        >
          <span
            class="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform"
            :class="state.snapEnabled ? 'translate-x-[18px]' : 'translate-x-0.5'"
          />
        </button>
      </div>

      <!-- Grid spacing -->
      <div>
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs text-foreground">Grid spacing</span>
          <span class="text-xs text-muted-foreground">{{ state.gridSpacing }}px</span>
        </div>
        <input
          type="range"
          min="20"
          max="80"
          step="10"
          :value="state.gridSpacing"
          class="w-full accent-sky-500"
          @input="apparatus.setGridSpacing(+($event.target as HTMLInputElement).value)"
        />
      </div>

      <!-- Show grid toggle -->
      <div class="flex items-center justify-between">
        <span class="text-xs text-foreground">Show grid</span>
        <button
          type="button"
          class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
          :class="state.showGrid ? 'bg-sky-500' : 'bg-muted'"
          @click="apparatus.setShowGrid(!state.showGrid)"
        >
          <span
            class="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform"
            :class="state.showGrid ? 'translate-x-[18px]' : 'translate-x-0.5'"
          />
        </button>
      </div>
    </div>

    <!-- Footer actions -->
    <div class="px-4 py-3 border-t border-border space-y-2">
      <div class="flex gap-2">
        <button
          type="button"
          class="flex-1 py-1.5 rounded-md border border-border bg-background text-xs text-foreground hover:bg-muted transition-colors disabled:opacity-40"
          :disabled="!canUndo"
          @click="apparatus.undoAction()"
        >
          Undo
        </button>
        <button
          type="button"
          class="flex-1 py-1.5 rounded-md bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium transition-colors"
          @click="$emit('export')"
        >
          Export PNG
        </button>
      </div>
      <button
        type="button"
        class="w-full py-1.5 rounded-md border border-border bg-background text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        @click="$emit('clear')"
      >
        Clear all
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { useApparatus } from '@/composables/useApparatus'
import type { ApparatusObjectType } from '@/types/apparatus'

const props = defineProps<{
  apparatus: ReturnType<typeof useApparatus>
}>()

defineEmits<{ export: []; clear: [] }>()

const { state, selectedObject: selectedObj, canUndo } = props.apparatus
const apparatus = props.apparatus

const TYPE_NAMES: Partial<Record<ApparatusObjectType, string>> = {
  'line': 'Line',
  'hatched-line': 'Fixed Surface',
  'box': 'Box',
  'spring': 'Spring',
  'incline': 'Incline',
  'jagged-line': 'Rough Surface',
  'pulley': 'Pulley',
  'circle': 'Circle / Ball',
  'cart': 'Cart',
  'arrow': 'Arrow',
  'rod': 'Rod',
  'disk': 'Disk',
  'torque-arrow': 'Torque Arrow',
  'container': 'Container',
  'fluid-fill': 'Fluid',
  'pressure-arrow': 'Pressure Arrow',
  'pipe': 'Pipe',
  'height-bracket': 'Height Bracket',
  'ground-reference': 'Ground Reference',
  'standalone-label': 'Label',
}

function addDefaultLabel() {
  if (!selectedObj.value) return
  const h = selectedObj.value.height
  apparatus.addLabel(selectedObj.value.id, {
    katex: '',
    value: '',
    unit: '',
    offsetX: 0,
    offsetY: -(h / 2 + 20),
  })
}
</script>
