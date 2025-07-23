import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/pages/HomePage.vue';
import RecommendDeposit from '@/pages/deposit/RecommendDeposit.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/api/deposits/recommendations/history',
    name: 'RecommendDeposit',
    component: RecommendDeposit,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
