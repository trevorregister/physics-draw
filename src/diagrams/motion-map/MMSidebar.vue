<template>
  <aside class="w-72 flex-shrink-0 flex flex-col border-l border-border bg-background overflow-y-auto">
    <div class="px-4 py-3 border-b border-border">
      <h2 class="text-sm font-semibold text-foreground">Motion Map</h2>
    </div>

    <div class="flex-1 overflow-y-auto px-4 py-3 space-y-4">
      <!-- Orientation -->
      <div>
        <p class="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Orientation</p>
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
          Changing orientation clears dots.
        </p>
      </div>

      <!-- Show/hide toggles -->
      <div class="space-y-2">
        <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Display</p>
        <label v-for="toggle in TOGGLES" :key="toggle.key" class="flex items-center justify-between text-sm cursor-pointer">
          <span class="text-foreground">{{ toggle.label }}</span>
          <button
            type="button"
            class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1"
            :class="(state as any)[toggle.key] ? 'bg-sky-500' : 'bg-muted'"
            @click="$emit(toggle.event as any, !(state as any)[toggle.key])"
          >
            <span
              class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
              :class="(state as any)[toggle.key] ? 'translate-x-5' : 'translate-x-0.5'"
            />
          </button>
        </label>
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
      </div>

      <!-- Acceleration controls -->
      <div>
        <p class="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Acceleration</p>
        <div class="space-y-2">
          <div class="flex gap-1.5">
            <button
              v-for="dir in [{ label: '+ (right/up)', val: 1 }, { label: '− (left/down)', val: -1 }]"
              :key="dir.val"
              type="button"
              class="flex-1 py-1 text-xs rounded-md border transition-colors"
              :class="state.accelDir === dir.val
                ? 'bg-rose-500 border-rose-500 text-white'
                : 'bg-background border-border text-foreground hover:bg-muted'"
              @click="$emit('set-accel', state.accelMag, dir.val as 1 | -1)"
            >{{ dir.label }}</button>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-xs text-muted-foreground w-12">Size</label>
            <input
              type="range"
              min="10"
              max="150"
              :value="state.accelMag"
              class="flex-1 accent-rose-500"
              @input="$emit('set-accel', +($event.target as HTMLInputElement).value, state.accelDir)"
            />
            <span class="text-xs text-muted-foreground w-8 text-right">{{ state.accelMag }}</span>
          </div>
        </div>
      </div>

      <!-- Selected dot velocity controls -->
      <div v-if="selectedDot" class="rounded-lg border border-sky-200 bg-sky-50/50 p-3 space-y-2">
        <p class="text-xs font-medium text-sky-700">Velocity (dot {{ selectedIndex }})</p>
        <div class="flex gap-1.5">
          <button
            v-for="dir in [{ label: '+ direction', val: 1 }, { label: '− direction', val: -1 }]"
            :key="dir.val"
            type="button"
            class="flex-1 py-1 text-xs rounded-md border transition-colors"
            :class="selectedDot.velocityDir === dir.val
              ? 'bg-sky-500 border-sky-500 text-white'
              : 'bg-background border-border text-foreground hover:bg-muted'"
            @click="$emit('update-velocity', selectedDot.id, selectedDot.velocityMag, dir.val as 1 | -1)"
          >{{ dir.label }}</button>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-xs text-muted-foreground w-12">Size</label>
          <input
            type="range"
            min="0"
            max="120"
            :value="selectedDot.velocityMag"
            class="flex-1 accent-sky-500"
            @input="$emit('update-velocity', selectedDot.id, +($event.target as HTMLInputElement).value, selectedDot.velocityDir)"
          />
          <span class="text-xs text-muted-foreground w-8 text-right">{{ selectedDot.velocityMag }}</span>
        </div>
      </div>

      <!-- Dot list -->
      <div v-if="sortedDots.length">
        <p class="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Dots</p>
        <div class="space-y-1">
          <div
            v-for="(dot, i) in sortedDots"
            :key="dot.id"
            class="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-xs transition-colors"
            :class="selectedId === dot.id ? 'bg-sky-50 border border-sky-200' : 'border border-transparent hover:bg-muted/50'"
            @click="$emit('select', dot.id)"
          >
            <span class="font-mono text-muted-foreground">t{{ i }}</span>
            <span class="flex-1 text-muted-foreground">pos {{ Math.round(dot.position) }}</span>
            <span class="text-sky-600">v={{ dot.velocityMag }}</span>
            <button
              type="button"
              class="text-muted-foreground hover:text-destructive transition-colors"
              @click.stop="$emit('delete', dot.id)"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
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
import type { MMState, MMDot, MMOrientation } from '@/types'
import { computed } from 'vue'

const props = defineProps<{
  state: MMState
  selectedId: string | null
  selectedDot: MMDot | null
  sortedDots: MMDot[]
  canUndo: boolean
}>()

defineEmits<{
  'set-orientation': [o: MMOrientation]
  'set-show-velocity': [show: boolean]
  'set-show-accel': [show: boolean]
  'set-show-labels': [show: boolean]
  'set-snap': [enabled: boolean]
  'set-accel': [mag: number, dir: 1 | -1]
  'update-velocity': [id: string, mag: number, dir: 1 | -1]
  delete: [id: string]
  select: [id: string]
  undo: []
  export: []
}>()

const TOGGLES = [
  { key: 'showVelocity', label: 'Velocity arrows', event: 'set-show-velocity' },
  { key: 'showAccel', label: 'Acceleration arrow', event: 'set-show-accel' },
  { key: 'showLabels', label: 'Time labels', event: 'set-show-labels' },
]

const selectedIndex = computed(() => {
  if (!props.selectedDot) return -1
  return props.sortedDots.findIndex((d) => d.id === props.selectedDot!.id)
})
</script>
