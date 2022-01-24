import { createRouter, createWebHistory } from 'vue-router';
import store from '@/store';

const routes = [{ path: '/', component: () => import('@/views/Home.vue') }];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from) => {});

export default router;
