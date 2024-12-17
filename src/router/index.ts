import { createRouter, createWebHistory } from "vue-router";
import GristWidget from "../components/datagouv/GristWidget.vue";
import AccueilCatalogue from "../components/datagouv/catalogue/AccueilCatalogue.vue";
import PublishCatalogue from "../components/datagouv/catalogue/PublishCatalogue.vue";
import ValidataPlugin from "../components/validata/ValidataPlugin.vue";

const routes = [
  {
    path: "/datagouv/",
    name: "GristWidget",
    component: GristWidget,
  },
  {
    path: "/datagouv/accueil-catalogue",
    name: "AccueilCatalogue",
    component: AccueilCatalogue,
  },
  {
    path: "/datagouv/publish-catalogue",
    name: "PublishCatalogue",
    component: PublishCatalogue,
  },
  {
    path: "/validata",
    name: "PublishCatalogue",
    component: ValidataPlugin,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
