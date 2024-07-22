import { createRouter, createWebHistory } from 'vue-router';
import GristWidget from '../components/GristWidget.vue';
import AccueilCatalogue from '../components/catalogue/AccueilCatalogue.vue';
import PublishCatalogue from '../components/catalogue/PublishCatalogue.vue';

const routes = [
  {
    path: '/',
    name: 'GristWidget',
    component: GristWidget
  },
  {
    path: '/accueil-catalogue',
    name: 'AccueilCatalogue',
    component: AccueilCatalogue
  },
  {
    path: '/publish-catalogue',
    name: 'PublishCatalogue',
    component: PublishCatalogue
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;