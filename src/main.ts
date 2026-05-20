import { ViteSSG } from 'vite-ssg'
import './assets/index.css'
import 'katex/dist/katex.min.css'
import { routes } from './router'
import App from './App.vue'

export const createApp = ViteSSG(App, { routes }, undefined, { useHead: true })
