import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/free-body-diagram',
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
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
  },
]
