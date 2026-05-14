import { createApp } from 'vue'
import './assets/index.css'
import 'katex/dist/katex.min.css'
import router from './router'
import App from './App.vue'

createApp(App).use(router).mount('#app')
