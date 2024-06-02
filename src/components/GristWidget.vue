<template>
  <header-widget />

  <div v-if="!profile.first_name">
    <token-form />
  </div>

  <div v-else>
    <span v-if="menuOption">
      <span class="ariane" @click="resetMenu()">Retour à l'accueil</span>
    </span>
    <span v-if="!menuOption">
      Bonjour <b>{{ profile.first_name }} {{ profile.last_name }}</b>, dites-nous ce qui vous amène.
      <menu-widget />
    </span>
    <div v-if="menuOption === 'publier'">
      <publier-form />
    </div>
    <div v-if="menuOption === 'schema'">
      <schema-form />
    </div>
    <div v-if="menuOption === 'importer'">
      <importer-form />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';
import HeaderWidget from './HeaderWidget.vue';
import TokenForm from './TokenForm.vue';
import MenuWidget from './MenuWidget.vue';
import PublierForm from './PublierForm.vue';
import SchemaForm from './SchemaForm.vue';
import ImporterForm from './ImporterForm.vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'GristWidget',
  components: { HeaderWidget, TokenForm, MenuWidget, PublierForm, SchemaForm, ImporterForm },
  setup() {

    onMounted(async () => {
        const token = await window.grist.getOption('token_datagouv');
        const profile = await window.grist.getOption('profile_datagouv');
        if (token && profile) {
          store.dispatch('updateToken', token);
          store.dispatch('updateProfile', profile);
        }
    });

    const store = useStore();
    window.grist.ready({
      requiredAccess: 'full',
      columns: []
    });
    const resetMenu = () => {
      store.dispatch('updateMenuOption', null);
    }

    return {
      profile: computed(() => store.state.profile),
      menuOption: computed(() => store.state.menuOption),
      resetMenu
    };
  }
});
</script>

<style scoped>

.card{
  width: 80%;
  min-height: 150px;
  margin: auto;
  border: 1px solid #ebebeb;
  border-bottom: 2px solid #3557A2;
  margin-bottom: 20px;
  font-family: Marianne, arial, sans serif;
  text-align: left;
  padding-left: 20px;
  cursor: pointer;
}

.card:hover{
  background-color: #EBEBEB;
}

.title-card{
  font-size: 20px;
  padding-top: 10px;
  font-weight: bold;
}

.content-card{
  font-size: 17px;
  margin-top: 20px;
}


.search-results{
  width: 80%;
  min-height: 80px;
  border: 1px solid black; 
  margin: auto;
  margin-top: 20px;
  cursor: pointer;
}

.ariane{
  font-weight: bold;
  font-style: italic;
  color: #3557A2;
  cursor: pointer;
  padding: 4px;
  padding-left: 0px;
  font-size: 12px;
}

.ariane:hover{
  background-color: #ebebeb;
}

</style>
