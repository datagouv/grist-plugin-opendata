<template>
  <br />
  <div v-if="!isSelectedOrg && !isSelectedTables">
    <div v-if="profile && profile.organizations && profile.organizations.length > 0">
      <p>Pour quelle organisations souhaitez-vous publier ?</p>
      <div v-for="item in profile.organizations" v-bind:key="item.id">
        <div @click="selectOrganization(item.id)" class="fr-tile fr-tile--sm fr-tile--horizontal fr-enlarge-link" id="tile-6661">
          <div class="fr-tile__body">
              <div class="fr-tile__content">
                  <h3 class="fr-tile__title">
                      <a href="#">{{ item.name }}</a>
                  </h3>
              </div>
          </div>
          <div class="fr-tile__header">
              <div class="fr-tile__pictogram">
                <img :src="item.logo_thumbnail" />
              </div>
          </div>
        </div>
        <br />
      </div>
    </div>
    <div v-else>
      Vous devez au préalable créer ou rejoindre une organisation sur data.gouv.fr.
      <a href="https://guides.data.gouv.fr/guide-data.gouv.fr/organisation">Voir le guide</a>
    </div>
  </div>
  <div v-if="isSelectedOrg && !isSelectedTables">
    <fieldset class="fr-fieldset" id="checkboxes" aria-labelledby="checkboxes-legend checkboxes-messages">
      <legend class="fr-fieldset__legend--regular fr-fieldset__legend" id="checkboxes-legend">
          Sélectionnez les tables que vous souhaitez publier (chaque table sera publié en tant que fichier du jeu de données data.gouv.fr).
      </legend>
      <div v-for="(item, index) in activeGristTables" v-bind:key="'checkbox-'+index" class="fr-fieldset__element">
          <div class="fr-checkbox-group">
              <input
                v-model="selectedTables"
                :value="item"
                :id="'checkbox-'+index"
                type="checkbox">
              <label class="fr-label" :for="'checkbox-'+index">
                  {{ item }}
              </label>
              <div class="fr-messages-group" :id="'checkbox-'+index+'-messages'" aria-live="assertive">
              </div>
          </div>
      </div>
    </fieldset>
    <div @click="validateTables()" class="fr-btn">Valider les tables</div>
  </div>
  <div v-if="isSelectedOrg && isSelectedTables && !isPublished">
    <label class="fr-label" for="text-input-text">Titre du jeu de données</label>
    <input class="fr-input" type="text" id="text-input-text" name="text-input-text" v-model="datasetTitle">
    <div class="fr-input-group">
      <label class="fr-label" for="textarea">
        Description du jeu de données
      </label>
      <textarea class="fr-input" id="textarea" name="textarea" v-model="datasetDescription"></textarea>
    </div>
    <div @click="publishDataset()" class="fr-btn">Publier les données</div>
  </div>
  <div v-if="isPublished">Jeu de données publié, vous pouvez y accéder <a :href="datasetLink" target="_blank">sur ce lien</a></div>
</template>


<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'PublierForm',
  components: { },
  setup() {
    const store = useStore();
    const isSelectedOrg = ref(false)
    const selectedTables = ref([])
    const isSelectedTables = ref(false)

    const datasetTitle = ref("")
    const datasetDescription = ref("")

    const isPublished = ref(false)
    const datasetLink = ref("")
    const datagouvUrl = process.env.VUE_APP_DATAGOUV_PUBLISH_URL
    const gristPublishUrl = process.env.VUE_APP_GRIST_CHEAT_URL

    const getActiveGristTables = async () => {
      let activeGristTables = await window.grist.docApi.listTables();
      store.dispatch('updateActiveGristTables', activeGristTables);
      let docId = await window.grist.docApi.getDocName();
      store.dispatch('updateDocId', docId);
    }

    const selectOrganization = (id: string) => {
      store.dispatch('updatePublierOrganization', id);
      isSelectedOrg.value = true;
      getActiveGristTables();
    }

    const validateTables = () => {
      store.dispatch('updatePublierTables', selectedTables.value);
      isSelectedTables.value = true;
    }

    const publishDataset = async () => {
      let body = {
        title: datasetTitle.value,
        description: datasetDescription.value,
        organization: {
          id: store.state.publierOrganization
        }
      }
      let response = await fetch(datagouvUrl + "/api/1/datasets/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': store.state.token
        },
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data)
      datasetLink.value = datagouvUrl + "/fr/datasets/" + data.id
      isPublished.value = true

      let datasetId = data.id
      selectedTables.value.forEach(async (item: string) => {
        let bodyResource = {
          title: item,
          format: "csv",
          type: "main",
          filetype: "remote",
          url: gristPublishUrl + "/o/docs/api/docs/" + store.state.docId + "/download/csv?tableId=" + item
        }
        response = await fetch(datagouvUrl + "/api/1/datasets/" + datasetId + "/resources/", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': store.state.token
          },
          body: JSON.stringify(bodyResource)
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        let dataResource = await response.json();
        console.log(dataResource)
      })

    }

    return {
      isSelectedOrg,
      selectOrganization,
      selectedTables,
      isSelectedTables,
      validateTables,
      datasetTitle,
      datasetDescription,
      publishDataset,
      isPublished,
      datasetLink,
      profile: computed(() => store.state.profile),
      activeGristTables: computed(() => store.state.activeGristTables),
    }

  }
});
</script>
