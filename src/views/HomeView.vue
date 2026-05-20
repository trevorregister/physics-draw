<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Nav -->
    <header class="bg-white border-b border-slate-200 px-6 py-4">
      <div class="max-w-5xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span class="font-semibold text-slate-800 text-lg">PhysicsDraw</span>
        </div>
        <div class="flex items-center gap-3">
          <a
            href="https://buymeacoffee.com/trevorregister"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
              <line x1="6" y1="1" x2="6" y2="4"/>
              <line x1="10" y1="1" x2="10" y2="4"/>
              <line x1="14" y1="1" x2="14" y2="4"/>
            </svg>
            Buy me a coffee
          </a>
          <RouterLink
            to="/about"
            class="text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            About
          </RouterLink>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
      <div class="mb-10">
        <h1 class="text-3xl font-bold text-slate-900">Diagram Tools</h1>
        <p class="text-slate-500 mt-2">Tools to help you efficiently create a variety of diagrams for teaching physics.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div
          v-for="tool in TOOLS"
          :key="tool.name"
          class="bg-white rounded-xl border border-slate-200 p-6 hover:border-sky-300 hover:shadow-sm transition-all group"
        >
          <div class="w-12 h-12 rounded-lg bg-sky-50 flex items-center justify-center mb-4 group-hover:bg-sky-100 transition-colors">
            <component :is="tool.icon" class="w-6 h-6 text-sky-500" />
          </div>
          <h2 class="text-lg font-semibold text-slate-800">{{ tool.title }}</h2>
          <p class="text-slate-500 text-sm mt-1 leading-relaxed">{{ tool.description }}</p>
          <RouterLink
            :to="tool.path"
            class="mt-5 block w-full py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors text-center"
          >
            Open
          </RouterLink>
        </div>

        <div
          v-for="tool in COMING_SOON"
          :key="tool.name"
          class="bg-white rounded-xl border border-slate-200 p-6 opacity-60 cursor-default select-none"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
              <component :is="tool.icon" class="w-6 h-6 text-slate-400" />
            </div>
            <span class="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Coming Soon</span>
          </div>
          <h2 class="text-lg font-semibold text-slate-500">{{ tool.title }}</h2>
          <p class="text-slate-400 text-sm mt-1 leading-relaxed">{{ tool.description }}</p>
          <div class="mt-5 w-full py-2 rounded-lg bg-slate-100 text-slate-400 text-sm font-medium text-center">
            Coming Soon
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { useHead } from '@unhead/vue'
import { SITE_URL } from '@/site'

const DESCRIPTION = 'Free online physics diagram tools for teachers. Build free body diagrams, motion maps, and apparatus diagrams — designed around the way physics teachers think.'

useHead({
  title: 'PhysicsDraw — Physics Diagram Tools for Teachers',
  meta: [
    { name: 'description', content: DESCRIPTION },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: `${SITE_URL}/` },
    { property: 'og:title', content: 'PhysicsDraw — Physics Diagram Tools for Teachers' },
    { property: 'og:description', content: DESCRIPTION },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: 'PhysicsDraw — Physics Diagram Tools for Teachers' },
    { name: 'twitter:description', content: DESCRIPTION },
  ],
  link: [{ rel: 'canonical', href: `${SITE_URL}/` }],
})

const ArrowIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', class: 'w-6 h-6' }, [
    h('path', { d: 'M12 19V5M5 12l7-7 7 7' }),
  ])

const DotLineIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', class: 'w-6 h-6' }, [
    h('line', { x1: '3', y1: '12', x2: '21', y2: '12' }),
    h('circle', { cx: '6', cy: '12', r: '2', fill: 'currentColor' }),
    h('circle', { cx: '11', cy: '12', r: '2', fill: 'currentColor' }),
    h('circle', { cx: '17', cy: '12', r: '2', fill: 'currentColor' }),
  ])

const ApparatusIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', class: 'w-6 h-6' }, [
    h('rect', { x: '3', y: '8', width: '8', height: '8' }),
    h('path', { d: 'M11 12 L13 12 L14 10 L15 14 L16 10 L17 14 L18 12 L21 12', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
  ])

const CircuitIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', class: 'w-6 h-6' }, [
    h('path', { d: 'M2 12h3' }),
    h('path', { d: 'M19 12h3' }),
    h('path', { d: 'M5 12v-2h4v4H5v-2z' }),
    h('path', { d: 'M9 12h2' }),
    h('line', { x1: '11', y1: '9', x2: '11', y2: '15' }),
    h('line', { x1: '13', y1: '9', x2: '13', y2: '15' }),
    h('path', { d: 'M13 12h2' }),
    h('path', { d: 'M15 12v-2h4v4h-4v-2z' }),
  ])

const TOOLS = [
  {
    name: 'fbd',
    title: 'Free Body Diagram',
    description: 'Draw all forces acting on an object. Add labeled force vectors with one click and drag to adjust direction and magnitude.',
    path: '/free-body-diagram',
    icon: ArrowIcon,
  },
  {
    name: 'motion-map',
    title: 'Motion Map',
    description: 'Visualize an object\'s position at equal time intervals. Show velocity vectors and acceleration to explore kinematics.',
    path: '/motion-map',
    icon: DotLineIcon,
  },
  {
    name: 'apparatus',
    title: 'Apparatus Diagram',
    description: 'Build physics scenario diagrams from a library of objects — boxes, springs, pulleys, inclines, and more.',
    path: '/apparatus',
    icon: ApparatusIcon,
  },
]

const COMING_SOON = [
  {
    name: 'circuit',
    title: 'Circuit Schematics',
    description: 'Draw circuit diagrams with resistors, capacitors, batteries, and other standard components.',
    icon: CircuitIcon,
  },
]
</script>
