<template>
  <aside class="w-64 flex-shrink-0 flex flex-col border-r border-border bg-background overflow-y-auto">

    <!-- Objects section -->
    <div class="px-4 py-3 border-b border-border">
      <h2 class="text-sm font-semibold text-foreground">Objects</h2>
    </div>
    <div class="px-3 py-3 space-y-2 border-b border-border">
      <div v-for="cat in CATEGORIES" :key="cat.name">
        <button
          type="button"
          class="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
          @click="toggleCategory(cat.name)"
        >
          {{ cat.name }}
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2"
            :class="openCategories.has(cat.name) ? 'rotate-180' : ''"
            class="transition-transform"
          >
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>

        <div v-if="openCategories.has(cat.name)" class="mt-1 space-y-0.5">
          <template v-if="cat.comingSoon">
            <p class="px-2 py-2 text-xs text-muted-foreground italic">More objects coming soon</p>
          </template>
          <template v-else>
            <div
              v-for="item in cat.items"
              :key="item.type"
              draggable="true"
              class="flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-grab hover:bg-muted/60 transition-colors active:cursor-grabbing"
              @dragstart="(e) => onDragStart(e, item.type)"
            >
              <svg width="28" height="28" viewBox="-14 -14 28 28" class="flex-shrink-0 text-slate-600">
                <g v-html="item.icon" />
              </svg>
              <span class="text-xs text-foreground truncate">{{ item.label }}</span>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Labels section -->
    <div class="px-4 py-3 border-b border-border">
      <h2 class="text-sm font-semibold text-foreground">Labels</h2>
    </div>
    <div class="flex-1 px-3 py-3 space-y-0.5">
      <!-- Custom label -->
      <div class="flex items-center gap-1.5 px-2 pb-2 mb-1 border-b border-border">
        <input
          v-model="customKatex"
          placeholder="LaTeX, e.g. F_{net}"
          class="flex-1 min-w-0 rounded border border-input bg-background px-2 py-1 text-xs font-mono"
        />
        <div
          draggable="true"
          class="flex-shrink-0 px-2 py-1 rounded-md bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium cursor-grab active:cursor-grabbing transition-colors select-none"
          @dragstart="onCustomDragStart"
        >Drag</div>
      </div>
      <div
        v-for="lbl in LABEL_BANK"
        :key="lbl.katex"
        draggable="true"
        class="flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-grab hover:bg-muted/60 transition-colors active:cursor-grabbing"
        @dragstart="(e) => onLabelDragStart(e, lbl.katex)"
      >
        <span class="text-xs text-foreground w-20 truncate">{{ lbl.name }}</span>
        <span class="text-xs text-muted-foreground font-mono">{{ lbl.katex }}</span>
      </div>
    </div>

  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ApparatusObjectType } from '@/types/apparatus'

interface ObjectItem {
  type: ApparatusObjectType
  label: string
  icon: string
}

interface Category {
  name: string
  items?: ObjectItem[]
  comingSoon?: boolean
}

const CATEGORIES: Category[] = [
  {
    name: 'Common',
    items: [
      {
        type: 'line',
        label: 'Line',
        icon: '<line x1="-12" y1="0" x2="12" y2="0" stroke="currentColor" stroke-width="2"/>',
      },
      {
        type: 'hatched-line',
        label: 'Fixed Surface',
        icon: '<line x1="-12" y1="0" x2="12" y2="0" stroke="currentColor" stroke-width="2"/><line x1="-8" y1="0" x2="-14" y2="6" stroke="currentColor" stroke-width="1.5"/><line x1="-2" y1="0" x2="-8" y2="6" stroke="currentColor" stroke-width="1.5"/><line x1="4" y1="0" x2="-2" y2="6" stroke="currentColor" stroke-width="1.5"/><line x1="10" y1="0" x2="4" y2="6" stroke="currentColor" stroke-width="1.5"/>',
      },
      {
        type: 'box',
        label: 'Box',
        icon: '<rect x="-10" y="-8" width="20" height="16" fill="#f8fafc" stroke="currentColor" stroke-width="2"/>',
      },
      {
        type: 'spring',
        label: 'Spring',
        icon: '<path d="M -10 0 A 3.3 5 0 0 0 -3.3 0 A 3.3 5 0 0 0 3.3 0 A 3.3 5 0 0 0 10 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M -12 0 L -10 0 A 3.3 5 0 0 1 -3.3 0 A 3.3 5 0 0 1 3.3 0 A 3.3 5 0 0 1 10 0 L 12 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
      },
      {
        type: 'incline',
        label: 'Incline',
        icon: '<polygon points="-12,8 12,8 -12,-8" fill="#f1f5f9" stroke="currentColor" stroke-width="2"/>',
      },
      {
        type: 'jagged-line',
        label: 'Rough Surface',
        icon: '<path d="M-12 0 L-8 -6 L-4 0 L0 -6 L4 0 L8 -6 L12 0" fill="none" stroke="currentColor" stroke-width="2"/>',
      },
      {
        type: 'pulley',
        label: 'Pulley',
        icon: '<circle cx="0" cy="-4" r="8" fill="#f8fafc" stroke="currentColor" stroke-width="2"/><line x1="0" y1="-4" x2="8" y2="-4" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3 2"/><line x1="0" y1="4" x2="0" y2="13" stroke="currentColor" stroke-width="1.5"/>',
      },
      {
        type: 'atwood',
        label: 'Atwood',
        icon: '<circle cx="0" cy="-5" r="7" fill="#f8fafc" stroke="currentColor" stroke-width="2"/><line x1="0" y1="-5" x2="7" y2="-5" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3 2"/><line x1="-7" y1="-5" x2="-7" y2="12" stroke="currentColor" stroke-width="1.5"/><line x1="7" y1="-5" x2="7" y2="12" stroke="currentColor" stroke-width="1.5"/>',
      },
      {
        type: 'atwood-asym',
        label: 'Atwood (uneven)',
        icon: '<circle cx="0" cy="-5" r="7" fill="#f8fafc" stroke="currentColor" stroke-width="2"/><line x1="0" y1="-5" x2="7" y2="-5" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3 2"/><line x1="-7" y1="-5" x2="-7" y2="3" stroke="currentColor" stroke-width="1.5"/><line x1="7" y1="-5" x2="7" y2="12" stroke="currentColor" stroke-width="1.5"/>',
      },
      {
        type: 'half-atwood',
        label: 'Half-Atwood',
        icon: '<circle cx="5" cy="-4" r="6" fill="#f8fafc" stroke="currentColor" stroke-width="2"/><line x1="5" y1="-4" x2="11" y2="-4" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3 2"/><line x1="-1" y1="-4" x2="-12" y2="-4" stroke="currentColor" stroke-width="1.5"/><line x1="5" y1="2" x2="5" y2="13" stroke="currentColor" stroke-width="1.5"/>',
      },
      {
        type: 'circle',
        label: 'Ball / Disk',
        icon: '<circle r="10" fill="#f8fafc" stroke="currentColor" stroke-width="2"/>',
      },
      {
        type: 'cart',
        label: 'Cart',
        icon: '<rect x="-10" y="-6" width="20" height="10" fill="#f8fafc" stroke="currentColor" stroke-width="2"/><circle cx="-5" cy="6" r="4" fill="#f8fafc" stroke="currentColor" stroke-width="2"/><circle cx="5" cy="6" r="4" fill="#f8fafc" stroke="currentColor" stroke-width="2"/>',
      },
      {
        type: 'arrow',
        label: 'Arrow',
        icon: '<line x1="-12" y1="0" x2="6" y2="0" stroke="currentColor" stroke-width="2"/><polygon points="12,0 5,-4 5,4" fill="currentColor"/>',
      },
    ],
  },
  {
    name: 'Rotational',
    items: [
      {
        type: 'rod',
        label: 'Rod',
        icon: '<rect x="-12" y="-3" width="24" height="6" fill="#94a3b8" stroke="currentColor" stroke-width="1.5"/>',
      },
      {
        type: 'disk',
        label: 'Disk',
        icon: '<circle r="10" fill="#e2e8f0" stroke="currentColor" stroke-width="2"/>',
      },
      {
        type: 'torque-arrow',
        label: 'Torque Arrow',
        icon: '<path d="M 10 0 A 10 10 0 0 1 0 -10" fill="none" stroke="currentColor" stroke-width="2"/><polygon points="0,-10 -5,-4 5,-4" fill="currentColor"/>',
      },
    ],
  },
  {
    name: 'Fluids',
    items: [
      {
        type: 'container',
        label: 'Container',
        icon: '<path d="M-10,-8 L-10,8 L10,8 L10,-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"/>',
      },
      {
        type: 'fluid-fill',
        label: 'Fluid',
        icon: '<rect x="-10" y="-8" width="20" height="16" fill="#bfdbfe" stroke="currentColor" stroke-width="2"/><line x1="-8" y1="-3" x2="8" y2="-3" stroke="#93c5fd" stroke-width="1"/><line x1="-8" y1="3" x2="8" y2="3" stroke="#93c5fd" stroke-width="1"/>',
      },
      {
        type: 'pressure-arrow',
        label: 'Pressure Arrow',
        icon: '<line x1="-12" y1="0" x2="5" y2="0" stroke="currentColor" stroke-width="2.5"/><polygon points="12,0 4,-5 4,5" fill="currentColor"/>',
      },
      {
        type: 'pipe',
        label: 'Pipe',
        icon: '<line x1="-12" y1="-6" x2="12" y2="-6" stroke="currentColor" stroke-width="2"/><line x1="-12" y1="6" x2="12" y2="6" stroke="currentColor" stroke-width="2"/>',
      },
    ],
  },
  {
    name: 'Energy',
    items: [
      {
        type: 'height-bracket',
        label: 'Height Bracket',
        icon: '<line x1="0" y1="-10" x2="0" y2="10" stroke="currentColor" stroke-width="2"/><line x1="-5" y1="-10" x2="5" y2="-10" stroke="currentColor" stroke-width="2"/><line x1="-5" y1="10" x2="5" y2="10" stroke="currentColor" stroke-width="2"/>',
      },
      {
        type: 'ground-reference',
        label: 'Ground Reference',
        icon: '<line x1="-12" y1="0" x2="12" y2="0" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 3"/>',
      },
    ],
  },
  {
    name: 'Electricity & Magnetism',
    comingSoon: true,
  },
]

const LABEL_BANK = [
  { name: 'Mass', katex: 'm' },
  { name: 'Weight', katex: 'F_g' },
  { name: 'Normal', katex: 'F_N' },
  { name: 'Friction', katex: 'F_f' },
  { name: 'Tension', katex: 'F_T' },
  { name: 'Applied', katex: 'F_{app}' },
  { name: 'Accel.', katex: 'a' },
  { name: 'Velocity', katex: 'v' },
  { name: 'Angle', katex: '\\theta' },
  { name: 'μ_s', katex: '\\mu_s' },
  { name: 'μ_k', katex: '\\mu_k' },
  { name: 'Spring k', katex: 'k' },
  { name: 'Gravity g', katex: 'g' },
  { name: 'Inertia I', katex: 'I' },
  { name: 'ω', katex: '\\omega' },
  { name: 'Torque τ', katex: '\\tau' },
  { name: 'Height h', katex: 'h' },
  { name: 'Distance d', katex: 'd' },
  { name: 'Time t', katex: 't' },
]

const customKatex = ref('')

// 'Common' is open by default
const openCategories = ref<Set<string>>(new Set(['Common']))

function toggleCategory(name: string) {
  const s = new Set(openCategories.value)
  if (s.has(name)) s.delete(name)
  else s.add(name)
  openCategories.value = s
}

function onDragStart(e: DragEvent, type: ApparatusObjectType) {
  e.dataTransfer!.effectAllowed = 'copy'
  e.dataTransfer!.setData('apparatus-type', type)
}

function onLabelDragStart(e: DragEvent, katex: string) {
  e.dataTransfer!.effectAllowed = 'copy'
  e.dataTransfer!.setData('apparatus-type', 'standalone-label')
  e.dataTransfer!.setData('apparatus-label', katex)
}

function onCustomDragStart(e: DragEvent) {
  if (!customKatex.value.trim()) { e.preventDefault(); return }
  e.dataTransfer!.effectAllowed = 'copy'
  e.dataTransfer!.setData('apparatus-type', 'standalone-label')
  e.dataTransfer!.setData('apparatus-label', customKatex.value.trim())
}

</script>
