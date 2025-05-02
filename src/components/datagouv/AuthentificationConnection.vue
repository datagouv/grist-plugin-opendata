<template>
    <br />
  
    <div v-if="!profile.first_name">
      <p class="fr-mb-2w">Vous n’êtes pas connecté·e à data.gouv.fr</p>
      <button class="fr-btn" @click="login">Se connecter avec data.gouv.fr</button>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';
  import { useStore } from 'vuex';
  import AuthService from '@/services/AuthService';
  
  const auth = new AuthService();
  const BASE_URL = process.env.VUE_APP_DATAGOUV_PUBLISH_URL ?? 'https://www.data.gouv.fr';
  
  export default defineComponent({
    name: 'AuthenticationConnection',
    setup () {
      const store = useStore();
      const authTab = ref<Window | null>(null);
  
      async function login () {
        const url = await auth.getRedirectURL();
        authTab.value = window.open(url, '_blank');
        if (!authTab.value) alert('Popup bloquée : autorisez‑la.');
      }

      async function handleMessage (e: MessageEvent) {
        if (e.origin !== new URL(auth.redirectURI).origin) return;
        const { code, state } = e.data || {};
        if (!code || !state) return;
        authTab.value = null;
  
        let token: string;
        try {
          token = await auth.retrieveToken(code as string, state as string);
        } catch (err) {
          alert('Erreur OAuth : ' + (err as Error).message);
          auth.cleanup();
          return;
        }
  
        const me = await fetch(`${BASE_URL}/api/1/me/`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json());
        

        store.dispatch('updateToken',   token);
        store.dispatch('updateProfile', me);
        auth.cleanup();
      }
  
      onMounted(() => window.addEventListener('message', handleMessage));
      onUnmounted(() => window.removeEventListener('message', handleMessage));
  
      return {
        login,
        profile: computed(() => store.state.profile)
      };
    }
  });
  </script>
  