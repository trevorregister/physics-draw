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
        <RouterLink
          to="/"
          class="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Home
        </RouterLink>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-10">
        <!-- Left: main content -->
        <div class="sm:col-span-2 space-y-10">
          <section>
            <h1 class="text-2xl font-bold text-slate-900 mb-4">About PhysicsDraw</h1>
            <div class="space-y-4 text-slate-600 leading-relaxed">
              <p>
                I built PhysicsDraw because it's what I wished I had when I was in the classroom. Drawing something as simple as a free-body diagram or a motion map shouldn't be so cumbersome. I figured out ways around that but not in a way that was easily sharable.
              </p>
              <p>
                I know y'all aren't exactly awash in free time. Fighting with ad-hoc solutions, assuming you even have them, isn't how you want to spend that time anyway. So PhysicsDraw is all about speed and efficiency.
                Each tool is built around the way physics teachers actually think about and explain concepts, not around general-purpose diagramming workflows.
              </p>
            </div>
          </section>

          <section>
            <h2 class="text-xl font-bold text-slate-900 mb-4">About Me</h2>
            <div class="space-y-4 text-slate-600 leading-relaxed">
              <p>
                I'm a former physics teacher turned fullstack developer. I hold a B.S. in Physics from Georgia Tech and an M.A. in Teaching Physics from Kennesaw State University, and spent seven years in the classroom teaching Conceptual Physics, AP Physics 1, and AP Physics C at high schools in the Atlanta area.
              </p>
              <p>
                I transitioned into EdTech by joining the <a href="https://www.pivotinteractives.com" target="_blank" rel="noopener noreferrer" class="text-sky-600 hover:text-sky-700 underline underline-offset-2">Pivot Interactives</a> team as a customer support specialist. Over time I then joined the engineering team as a full stack developer. I'm now able to use those skills to build tools that I know will be useful for other teachers.
              </p>
              <p>
                PhysicsDraw is a personal project that sits at the intersection of those two careers. You can find out more about me at <a href="https://www.trevorregister.com" target="_blank" rel="noopener noreferrer" class="text-sky-600 hover:text-sky-700 underline underline-offset-2">trevorregister.com</a>.
              </p>
            </div>
          </section>
        </div>

        <!-- Right: card -->
        <div class="sm:col-span-1">
          <div class="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center text-center gap-4">
            <div>
              <p class="font-semibold text-slate-800">Trevor J. Register</p>
              <p class="text-sm text-slate-500 mt-0.5">Physics Educator · Fullstack Developer</p>
            </div>
            <div class="w-full border-t border-slate-100 pt-4 flex flex-col gap-2">
              <a
                href="https://www.trevorregister.com"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                trevorregister.com
              </a>
              <a
                href="https://github.com/trevorregister"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                github.com/trevorregister
              </a>
              <a
                href="https://linkedin.com/in/trevor-j-register"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </a>
              <a
                href="https://buymeacoffee.com/trevorregister"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-center gap-2 text-sm text-amber-600 hover:text-amber-700 transition-colors font-medium"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                  <line x1="6" y1="1" x2="6" y2="4"/>
                  <line x1="10" y1="1" x2="10" y2="4"/>
                  <line x1="14" y1="1" x2="14" y2="4"/>
                </svg>
                Buy me a coffee
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-200 py-5 text-center text-xs text-slate-400">
      Built with Vue 3 + TypeScript · Open source
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { SITE_URL } from '@/site'

const DESCRIPTION = 'Learn about PhysicsDraw and its creator, Trevor Register — a former physics teacher and full-stack developer building tools for physics educators.'

useHead({
  title: 'About | PhysicsDraw',
  meta: [
    { name: 'description', content: DESCRIPTION },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: `${SITE_URL}/about` },
    { property: 'og:title', content: 'About | PhysicsDraw' },
    { property: 'og:description', content: DESCRIPTION },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: 'About | PhysicsDraw' },
    { name: 'twitter:description', content: DESCRIPTION },
  ],
  link: [{ rel: 'canonical', href: `${SITE_URL}/about` }],
})
</script>
