<template>
    <span>Bienvenue sur le widget officiel data.gouv.fr intégré dans Grist.</span><br />
    <span>Pour interfacer correctement votre compte Grist avec data.gouv.fr, merci de saisir ci-dessous votre clé d'api d'accès data.gouv.fr</span>
    <div class="saisie-token">
      <input class="fr-input" type="text" id="text-input-text" name="text-input-text" v-model="token">
      <button v-if="!isTokenSet" class="fr-btn" @click="validateToken()">Valider</button>
    </div>
    <span><a :href="urlDisplay + '/fr/admin/me/'" target="_blank">Cliquez ici pour le récupérer sur l'interface data.gouv.fr</a></span>
</template>


<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useStore } from 'vuex';

const SESSION_STORAGE_TOKEN_KEY = 'apiToken';

export default defineComponent({
  name: 'TokenForm',
  components: { },
  setup() {

    const store = useStore();
    const token = ref(sessionStorage.getItem(SESSION_STORAGE_TOKEN_KEY) || '');
    const isTokenSet = ref(false);
    const datagouvUrl = process.env.VUE_APP_DATAGOUV_PUBLISH_URL;
    const urlDisplay = ref("")

    onMounted(() => {
      urlDisplay.value = datagouvUrl
    });

    const validateToken = async () => { 
      sessionStorage.setItem(SESSION_STORAGE_TOKEN_KEY, token.value);
      const response = await fetch(datagouvUrl + "/api/1/me/", {
        method: 'GET',
        headers: {
          'X-API-KEY': token.value
        }
      });
      if (!response.ok) {
        console.log("erreur")
      }
      const data = await response.json();
      if (data.email) {
        store.dispatch('updateToken', token.value);
        store.dispatch('updateProfile', data);
        isTokenSet.value = true;
        window.grist.setOption('token_datagouv', token.value);
        window.grist.setOption('profile_datagouv', data);
      }
    }

    return {
      token,
      validateToken,
      urlDisplay
    }

  }
});
</script>

<style scoped>
.saisie-token{
  display: flex;
}
</style>