<template>
  <aside class="w-72 flex-shrink-0 flex flex-col border-l border-border bg-background overflow-y-auto">
    <div class="px-4 py-3 border-b border-border">
      <h2 class="text-sm font-semibold text-foreground">Motion Map</h2>
    </div>

    <div class="flex-1 overflow-y-auto px-4 py-3 space-y-5">

      <!-- Diagram Settings -->
      <section class="space-y-3">
        <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Diagram Settings</p>

        <!-- Orientation -->
        <div>
          <p class="text-xs text-muted-foreground mb-1.5">Orientation</p>
          <div class="flex gap-1.5">
            <button
              v-for="o in ['horizontal', 'vertical']"
              :key="o"
              type="button"
              class="flex-1 py-1.5 text-xs rounded-md border transition-colors capitalize"
              :class="state.orientation === o
                ? 'bg-sky-500 border-sky-500 text-white'
                : 'bg-background border-border text-foreground hover:bg-muted'"
              @click="$emit('set-orientation', o as MMOrientation)"
            >{{ o }}</button>
          </div>
          <p v-if="state.dots.length" class="text-xs text-muted-foreground mt-1">
            Changing orientation clears all dots.
          </p>
        </div>

        <!-- Positive direction -->
        <div>
          <p class="text-xs text-muted-foreground mb-1.5">Positive direction (label only)</p>
          <div class="flex gap-1.5">
            <button
              v-for="dir in positiveDirectionOptions"
              :key="dir.val"
              type="button"
              class="flex-1 py-1.5 text-xs rounded-md border transition-colors"
              :class="state.positiveDirection === dir.val
                ? 'bg-sky-500 border-sky-500 text-white'
                : 'bg-background border-border text-foreground hover:bg-muted'"
              @click="$emit('set-positive-direction', dir.val as MMPositiveDirection)"
            >{{ dir.label }}</button>
          </div>
        </div>

        <!-- Grid spacing -->
        <div>
          <p class="text-xs text-muted-foreground mb-1.5">Grid spacing</p>
          <div class="flex items-center gap-2">
            <input
              type="range"
              min="20"
              max="80"
              step="5"
              :value="state.gridSpacing"
              class="flex-1 accent-sky-500"
              @input="$emit('set-grid-spacing', +($event.target as HTMLInputElement).value)"
            />
            <span class="text-xs text-muted-foreground w-8 text-right">{{ state.gridSpacing }}px</span>
          </div>
        </div>

        <!-- Velocity scale -->
        <div>
          <p class="text-xs text-muted-foreground mb-1.5">Velocity vector scale</p>
          <div class="flex items-center gap-2">
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              :value="state.velocityScale"
              class="flex-1 accent-sky-500"
              @input="$emit('set-velocity-scale', +($event.target as HTMLInputElement).value)"
            />
            <span class="text-xs text-muted-foreground w-8 text-right">{{ state.velocityScale.toFixed(1) }}×</span>
          </div>
        </div>

        <!-- Show grid toggle -->
        <label class="flex items-center justify-between text-sm cursor-pointer">
          <span class="text-foreground">Show grid</span>
          <Toggle :value="state.showGrid" @toggle="$emit('set-show-grid', $event)" />
        </label>
      </section>

      <!-- Selected Dot Controls -->
      <section v-if="selectedDot" class="rounded-lg border border-sky-200 bg-sky-50/50 p-3 space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium text-sky-700">Selected dot — t{{ toSubscript(selectedDot.timeIndex) }}</p>
          <button
            type="button"
            class="text-xs text-destructive hover:underline"
            @click="$emit('delete', selectedDot.id)"
          >Delete</button>
        </div>

        <!-- Velocity -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <p class="text-xs font-medium text-foreground">Velocity direction</p>
            <Toggle
              :value="selectedDot.velocity.visible"
              @toggle="$emit('update-velocity', selectedDot.id, { ...selectedDot.velocity, visible: $event })"
            />
          </div>
          <div class="flex gap-1.5">
            <button
              v-for="dir in velocityDirOptions"
              :key="dir.val"
              type="button"
              class="flex-1 py-1 text-xs rounded-md border transition-colors"
              :class="selectedDot.velocity.direction === dir.val
                ? 'bg-slate-700 border-slate-700 text-white'
                : 'bg-background border-border text-foreground hover:bg-muted'"
              @click="$emit('update-velocity', selectedDot.id, { ...selectedDot.velocity, direction: dir.val as 1 | -1 })"
            >{{ dir.label }}</button>
          </div>
        </div>

        <!-- Acceleration -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <p class="text-xs font-medium text-rose-600">Acceleration</p>
            <Toggle
              :value="selectedDot.acceleration.visible"
              color="rose"
              @toggle="$emit('update-acceleration', selectedDot.id, { ...selectedDot.acceleration, visible: $event })"
            />
          </div>
          <div class="flex gap-1.5">
            <button
              v-for="dir in accelDirOptions"
              :key="dir.val"
              type="button"
              class="flex-1 py-1 text-xs rounded-md border transition-colors"
              :class="selectedDot.acceleration.direction === dir.val
                ? 'bg-rose-500 border-rose-500 text-white'
                : 'bg-background border-border text-foreground hover:bg-muted'"
              @click="$emit('update-acceleration', selectedDot.id, { ...selectedDot.acceleration, direction: dir.val as 1 | -1 })"
            >{{ dir.label }}</button>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-muted-foreground w-12">Magnitude</span>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              :value="selectedDot.acceleration.magnitude"
              class="flex-1 accent-rose-500"
              @input="$emit('update-acceleration', selectedDot.id, { ...selectedDot.acceleration, magnitude: +($event.target as HTMLInputElement).value })"
            />
            <span class="text-xs text-muted-foreground w-6 text-right">{{ selectedDot.acceleration.magnitude }}</span>
          </div>
        </div>
      </section>

      <!-- Global Vector Controls -->
      <section class="space-y-2">
        <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Display</p>
        <label class="flex items-center justify-between text-sm cursor-pointer">
          <span class="text-foreground">Velocity vectors</span>
          <Toggle :value="state.showAllVelocity" @toggle="$emit('set-show-all-velocity', $event)" />
        </label>
        <label class="flex items-center justify-between text-sm cursor-pointer">
          <span class="text-foreground">Acceleration vectors</span>
          <Toggle :value="state.showAllAccel" @toggle="$emit('set-show-all-accel', $event)" />
        </label>
        <label class="flex items-center justify-between text-sm cursor-pointer">
          <span class="text-foreground">Time labels</span>
          <Toggle :value="state.showLabels" @toggle="$emit('set-show-labels', $event)" />
        </label>
      </section>

    </div>

    <!-- Footer -->
    <div class="border-t border-border px-4 py-3 flex gap-2">
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
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MMState, MMDot, MMOrientation, MMPositiveDirection } from '@/types'

const props = defineProps<{
  state: MMState
  selectedId: string | null
  selectedDot: MMDot | null
  canUndo: boolean
}>()

defineEmits<{
  'set-orientation': [o: MMOrientation]
  'set-positive-direction': [dir: MMPositiveDirection]
  'set-grid-spacing': [px: number]
  'set-velocity-scale': [scale: number]
  'set-show-grid': [show: boolean]
  'update-velocity': [id: string, vel: MMDot['velocity']]
  'update-acceleration': [id: string, accel: MMDot['acceleration']]
  'set-show-all-velocity': [show: boolean]
  'set-show-all-accel': [show: boolean]
  'set-show-labels': [show: boolean]
  delete: [id: string]
  undo: []
  export: []
}>()

const SUBSCRIPTS = '₀₁₂₃₄₅₆₇₈₉'
function toSubscript(n: number): string {
  return String(n)
    .split('')
    .map((d) => SUBSCRIPTS[parseInt(d)] ?? d)
    .join('')
}

const positiveDirectionOptions = computed(() =>
  props.state.orientation === 'horizontal'
    ? [{ label: 'Right →', val: 'right' }, { label: '← Left', val: 'left' }]
    : [{ label: '↑ Up', val: 'up' }, { label: 'Down ↓', val: 'down' }]
)

const velocityDirOptions = computed(() =>
  props.state.orientation === 'horizontal'
    ? [{ label: '→ Right', val: 1 }, { label: '← Left', val: -1 }]
    : [{ label: '↓ Down', val: 1 }, { label: '↑ Up', val: -1 }]
)

const accelDirOptions = computed(() =>
  props.state.orientation === 'horizontal'
    ? [{ label: '→ Right', val: 1 }, { label: '← Left', val: -1 }]
    : [{ label: '↓ Down', val: 1 }, { label: '↑ Up', val: -1 }]
)

const Toggle = {
  props: {
    value: Boolean,
    color: { type: String, default: 'sky' },
  },
  emits: ['toggle'],
  template: `
    <button
      type="button"
      class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
      :class="[value
        ? (color === 'rose' ? 'bg-rose-500 focus:ring-rose-500' : 'bg-sky-500 focus:ring-sky-500')
        : 'bg-muted focus:ring-sky-500']"
      @click="$emit('toggle', !value)"
    >
      <span
        class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
        :class="value ? 'translate-x-5' : 'translate-x-0.5'"
      />
    </button>
  `,
}
</script>
