<template>
  <aside class="w-72 flex-shrink-0 flex flex-col border-l border-border bg-background overflow-y-auto">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-border">
      <h2 class="text-sm font-semibold text-foreground">Forces</h2>
    </div>

    <div class="flex-1 overflow-y-auto px-4 py-3 space-y-4">
      <!-- Quick-add presets -->
      <div>
        <p class="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Quick Add</p>
        <div class="grid grid-cols-2 gap-1.5">
          <button
            v-for="preset in PRESETS"
            :key="preset.key"
            type="button"
            class="px-2 py-1.5 text-xs rounded-md border border-border bg-muted/50 hover:bg-muted text-foreground transition-colors text-left"
            @click="addPreset(preset)"
          >
            <span class="font-medium">{{ preset.name }}</span>
            <span class="text-muted-foreground ml-1">({{ preset.dirLabel }})</span>
          </button>
        </div>
      </div>

      <!-- Add Force form -->
      <div class="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
        <p class="text-xs font-medium text-foreground">Custom Force</p>

        <LabelInput
          v-model="form.label"
          placeholder="e.g. F_{app}"
        />

        <div>
          <label class="text-xs text-muted-foreground mb-1 block">Color</label>
          <ColorPicker v-model="form.color" />
        </div>

        <div>
          <label class="text-xs text-muted-foreground mb-1 block">Direction</label>
          <div class="flex gap-1.5 mb-1.5">
            <button
              v-for="d in DIR_PRESETS"
              :key="d.label"
              type="button"
              class="flex-1 py-1 text-xs rounded border border-border bg-background hover:bg-muted transition-colors"
              :class="{ 'bg-sky-100 border-sky-400 text-sky-700': form.angle === d.angle }"
              @click="form.angle = d.angle"
            >{{ d.label }}</button>
          </div>
          <input
            v-model.number="form.angle"
            type="number"
            min="0"
            max="359"
            step="15"
            class="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            placeholder="Angle (0–359°)"
          />
        </div>

        <button
          type="button"
          class="w-full py-1.5 rounded-md bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
          :disabled="!form.label.trim()"
          @click="submitForm"
        >
          Add Force
        </button>
      </div>

      <!-- Vector list -->
      <div v-if="state.vectors.length">
        <p class="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Vectors</p>
        <div class="space-y-1">
          <div
            v-for="v in state.vectors"
            :key="v.id"
            class="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors"
            :class="selectedId === v.id ? 'bg-sky-50 border border-sky-200' : 'border border-transparent hover:bg-muted/50'"
            @click="$emit('select', v.id)"
          >
            <span class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: v.color }" />
            <span class="flex-1 text-xs font-mono truncate">{{ v.label }}</span>
            <span class="text-xs text-muted-foreground">{{ Math.round(v.angle) }}°</span>
            <button
              type="button"
              class="text-muted-foreground hover:text-destructive transition-colors ml-1"
              @click.stop="$emit('delete', v.id)"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Label editor when selected -->
      <div v-if="selectedVector" class="rounded-lg border border-sky-200 bg-sky-50/50 p-3 space-y-2">
        <p class="text-xs font-medium text-sky-700">Edit Label</p>
        <LabelInput
          :model-value="selectedVector.label"
          placeholder="KaTeX label"
          @update:model-value="$emit('update-label', selectedVector.id, $event)"
        />
      </div>

      <!-- Object style -->
      <div>
        <p class="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Object Style</p>
        <div class="flex gap-1.5">
          <button
            v-for="s in OBJECT_STYLES"
            :key="s.value"
            type="button"
            class="flex-1 py-1.5 text-xs rounded-md border transition-colors"
            :class="state.objectStyle === s.value
              ? 'bg-sky-500 border-sky-500 text-white'
              : 'bg-background border-border text-foreground hover:bg-muted'"
            @click="$emit('set-object-style', s.value)"
          >{{ s.label }}</button>
        </div>
      </div>

      <!-- Toggles -->
      <div class="space-y-2">
        <label class="flex items-center justify-between text-sm cursor-pointer">
          <span class="text-foreground">Snap</span>
          <button
            type="button"
            class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1"
            :class="state.snapEnabled ? 'bg-sky-500' : 'bg-muted'"
            @click="$emit('set-snap', !state.snapEnabled)"
          >
            <span
              class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
              :class="state.snapEnabled ? 'translate-x-5' : 'translate-x-0.5'"
            />
          </button>
        </label>
        <label class="flex items-center justify-between text-sm cursor-pointer">
          <span class="text-foreground">Grid</span>
          <button
            type="button"
            class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1"
            :class="state.showGrid ? 'bg-sky-500' : 'bg-muted'"
            @click="$emit('set-grid', !state.showGrid)"
          >
            <span
              class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
              :class="state.showGrid ? 'translate-x-5' : 'translate-x-0.5'"
            />
          </button>
        </label>
        <label class="flex items-center justify-between text-sm cursor-pointer">
          <span class="text-foreground">Crosshair</span>
          <button
            type="button"
            class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1"
            :class="state.showCrosshair ? 'bg-sky-500' : 'bg-muted'"
            @click="$emit('set-crosshair', !state.showCrosshair)"
          >
            <span
              class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
              :class="state.showCrosshair ? 'translate-x-5' : 'translate-x-0.5'"
            />
          </button>
        </label>
      </div>
    </div>

    <!-- Footer: undo + export + clear -->
    <div class="border-t border-border px-4 py-3 space-y-2">
      <div class="flex gap-2">
        <button
          type="button"
          class="flex-1 py-1.5 text-sm rounded-md border border-border bg-background hover:bg-muted disabled:opacity-40 transition-colors"
          :disabled="!canUndo"
          @click="$emit('undo')"
        >
          ↩ Undo
        </button>
        <button
          type="button"
          class="flex-1 py-1.5 text-sm rounded-md bg-sky-500 hover:bg-sky-600 text-white font-medium transition-colors"
          @click="$emit('export')"
        >
          Export PNG
        </button>
      </div>
      <button
        type="button"
        class="w-full py-1.5 text-sm rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
        @click="$emit('clear')"
      >
        Clear
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { FBDState, FBDVector, ObjectStyle } from '@/types'
import LabelInput from '@/components/shared/LabelInput.vue'
import ColorPicker from '@/components/shared/ColorPicker.vue'

defineProps<{
  state: FBDState
  selectedId: string | null
  selectedVector: FBDVector | null
  canUndo: boolean
}>()

const emit = defineEmits<{
  add: [opts: Omit<FBDVector, 'id'>]
  delete: [id: string]
  select: [id: string]
  'update-label': [id: string, label: string]
  'set-object-style': [style: ObjectStyle]
  'set-snap': [enabled: boolean]
  'set-grid': [show: boolean]
  'set-crosshair': [show: boolean]
  clear: []
  undo: []
  export: []
}>()

const PRESETS = [
  { key: 'weight', name: 'Weight', dirLabel: 'down', label: 'F_g', angle: 270, color: '#000000' },
  { key: 'normal', name: 'Normal', dirLabel: 'up', label: 'F_N', angle: 90, color: '#000000' },
  { key: 'friction-l', name: 'Friction', dirLabel: 'left', label: 'F_f', angle: 180, color: '#000000' },
  { key: 'friction-r', name: 'Friction', dirLabel: 'right', label: 'F_f', angle: 0, color: '#000000' },
  { key: 'applied', name: 'Applied', dirLabel: 'custom', label: 'F_{app}', angle: null as number | null, color: '#000000' },
  { key: 'tension', name: 'Tension', dirLabel: 'up', label: 'F_T', angle: 90, color: '#000000' },
  { key: 'drag', name: 'Drag', dirLabel: 'left', label: 'F_d', angle: 180, color: '#000000' },
  { key: 'buoyancy', name: 'Buoyancy', dirLabel: 'up', label: 'F_b', angle: 90, color: '#000000' },
]

const DIR_PRESETS = [
  { label: '↑', angle: 90 },
  { label: '↓', angle: 270 },
  { label: '←', angle: 180 },
  { label: '→', angle: 0 },
]

const OBJECT_STYLES: { value: ObjectStyle; label: string }[] = [
  { value: 'dot', label: 'Dot' },
  { value: 'box', label: 'Box' },
  { value: 'circle', label: 'Circle' },
]

const form = reactive({
  label: '',
  angle: 90,
  color: '#000000',
})

function submitForm() {
  if (!form.label.trim()) return
  emit('add', { label: form.label.trim(), angle: form.angle, magnitude: 100, color: form.color })
  form.label = ''
}

function addPreset(preset: (typeof PRESETS)[number]) {
  if (preset.angle === null) {
    // Pre-fill form for custom angle
    form.label = preset.label
    form.color = preset.color
    return
  }
  emit('add', { label: preset.label, angle: preset.angle, magnitude: 100, color: preset.color })
}
</script>
