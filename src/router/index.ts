import { createRouter, createWebHistory } from 'vue-router';
import GristWidget from '../components/GristWidget.vue';

const routes = [
  {
    path: '/',
    name: 'GristWidget',
    component: GristWidget
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;