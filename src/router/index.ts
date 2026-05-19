import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/fbd',
      name: 'fbd',
      component: () => import('@/views/FBDView.vue'),
    },
    {
      path: '/motion-map',
      name: 'motion-map',
      component: () => import('@/views/MotionMapView.vue'),
    },
    {
      path: '/apparatus',
      name: 'apparatus',
      component: () => import('@/views/ApparatusView.vue'),
    },
  ],
})
