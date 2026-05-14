<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Nav -->
    <header class="bg-white border-b border-slate-200 px-6 py-4">
      <div class="max-w-5xl mx-auto flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span class="font-semibold text-slate-800 text-lg">PhysicsDraw</span>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
      <div class="mb-10">
        <h1 class="text-3xl font-bold text-slate-900">Diagram Tools</h1>
        <p class="text-slate-500 mt-2">Create clear physics diagrams for the classroom.</p>
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
          <button
            type="button"
            class="mt-5 w-full py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors"
            @click="router.push(tool.path)"
          >
            Open
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { h } from 'vue'

const router = useRouter()

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

const TOOLS = [
  {
    name: 'fbd',
    title: 'Free Body Diagram',
    description: 'Draw all forces acting on an object. Add labeled force vectors with one click and drag to adjust direction and magnitude.',
    path: '/fbd',
    icon: ArrowIcon,
  },
  {
    name: 'motion-map',
    title: 'Motion Map',
    description: 'Visualize an object\'s position at equal time intervals. Show velocity vectors and acceleration to explore kinematics.',
    path: '/motion-map',
    icon: DotLineIcon,
  },
]
</script>
