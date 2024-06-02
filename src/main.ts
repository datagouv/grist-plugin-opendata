import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import '@gouvfr/dsfr/dist/dsfr.min.css'
import '@gouvfr/dsfr/dist/utility/utility.min.css'
import '@gouvfr/dsfr/dist/dsfr.min.css'

import VueDsfr from '@gouvminint/vue-dsfr';
import '@gouvminint/vue-dsfr/styles';

import store from './store'; // Assurez-vous que le chemin est correct

const app = createApp(App);

// Utilisation des plugins
app.use(router);
app.use(VueDsfr)
app.use(store);

// Montage de l'application
app.mount('#app');
