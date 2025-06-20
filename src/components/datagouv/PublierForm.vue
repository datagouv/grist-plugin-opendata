<template>
  <br />
  <div v-if="!profile.first_name">
    <authentification-connection />
  </div>
  <div v-else>
    <div v-if="!isSelectedOrg && !isPublicationModeResourceSelected">
      <div v-if="profile.organizations?.length">
        <p>Bonjour <b>{{ profile.first_name }} {{ profile.last_name }}</b>, pour quelle organisation souhaitez-vous publier ?</p>

        <div v-for="item in profile.organizations" :key="item.id">
          <div @click="selectOrganization(item.id)"
               class="fr-tile fr-tile--sm fr-tile--horizontal fr-enlarge-link">
            <div class="fr-tile__body">
              <div class="fr-tile__content">
                <h3 class="fr-tile__title"><a href="#">{{ item.name }}</a></h3>
              </div>
            </div>
            <div class="fr-tile__header">
              <div class="fr-tile__pictogram">
                <img :src="item.logo_thumbnail" alt="" />
              </div>
            </div>
          </div>
          <br />
        </div>
      </div>
      <div v-else>
        Vous devez d’abord créer ou rejoindre une organisation sur data.gouv.fr.&nbsp;
        <a href="https://guides.data.gouv.fr/guide-data.gouv.fr/organisation"
           target="_blank">Voir le guide</a>
      </div>
    </div>

    <div v-if="isSelectedOrg && !isPublicationModeResourceSelected">
      <fieldset class="fr-fieldset">
        <legend class="fr-fieldset__legend">
          Sélectionnez la table à publier
        </legend>
      
        <div v-for="(item, index) in activeGristTables"
             :key="'radio-'+index"
             class="fr-fieldset__element">
      
          <div class="fr-radio-group">
            <input
              type="radio"
              :id="'r'+index"
              name="grist-table"
              v-model="selectedTable"
              @click="isSelectedTable = true"
              :value="item"
            />
            <label class="fr-label" :for="'r'+index">{{ item }}</label>
          </div>
        </div>
      </fieldset>
    
      <div v-if="isSelectedTable">
        <button class="fr-btn btn-publish" @click="validateTable('remote')">
          Publier la table en faisant une référence à ce fichier grist sur data.gouv.fr
        </button>
        <div class="petite-ligne"><b>pré-requis :</b> rendre votre document grist en accès public</div>
        <br />
        <button class="fr-btn fr-btn--secondary btn-publish" @click="validateTable('file')">Publier la table en uploadant le fichier sur data.gouv.fr</button>
        <div class="petite-ligne"><b>Attention : </b>Les modifications effectuées sur ce grist ne seront visibles que si vous mettez à jour manuellement la table via ce plugin</div>
      </div>
    </div>

    <div v-if="isSelectedOrg && isPublicationModeResourceSelected && !publicationMode">
      <p class="fr-text--lead">Souhaitez-vous :</p>

      <div class="fr-radio-group">
        <input type="radio" id="mode-new" value="new" v-model="publicationMode">
        <label for="mode-new">
          Publier un nouveau jeu de données
        </label>
      </div>
      <br />
      <div class="fr-radio-group">
        <input type="radio" id="mode-up" value="update" v-model="publicationMode" @change="loadDatasets">
        <label for="mode-up">
          Mettre à jour un jeu de données existant
        </label>
      </div>
    </div>

    <div v-if="publicationMode==='update' && !selectedDataset">
      <p>Sélectionnez le jeu de données à mettre à jour :</p>

      <span v-if="isLoadingDatasets" class="fr-badge">Chargement…</span>

      <table v-else class="fr-table fr-table--no-caption">
        <thead><tr><th>Titre du jeu de données</th><th></th></tr></thead>
        <tbody>
          <tr v-for="d in orgDatasets" :key="d.id">
            <td>{{ d.title }}</td>
            <td>
              <button class="fr-btn fr-btn--sm" @click="selectDataset(d)">
                Choisir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="selectedDataset && !resourceMode">
      <p>Dans «{{ selectedDataset?.title }}», souhaitez-vous :</p>

      <div class="fr-radio-group">
        <input type="radio" id="res-new" value="new" v-model="resourceMode">
        <label class="fr-label" for="res-new">
          Ajouter une nouvelle ressource au jeu de données
        </label>
      </div>
      <br />
      <div class="fr-radio-group">
        <input type="radio" id="res-replace" value="replace"
               v-model="resourceMode">
        <label class="fr-label" for="res-replace">
          Remplacer une ressource existante
        </label>
      </div>
    </div>

    <div v-if="resourceMode==='replace' && !selectedResource">
      <p>Sélectionnez la ressource à remplacer :</p>
      <table class="fr-table fr-table--no-caption">
        <thead><tr><th>Titre de la ressource</th><th></th></tr></thead>
        <tbody>
          <tr v-for="r in datasetResources" :key="r.id">
            <td>{{ r.title }}</td>
            <td>
              <button class="fr-btn fr-btn--sm"
                      @click="replaceResource(r)">
                Remplacer
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="showMetaForm && !isPublished">
      <span v-if="!selectedDataset?.id">
        <label class="fr-label" for="ds-title">Titre du jeu de données</label>
        <input id="ds-title" class="fr-input" v-model="datasetTitle">
        <br />
        <div class="fr-input-group">
          <label class="fr-label" for="ds-desc">Description</label>
          <textarea id="ds-desc" class="fr-input" v-model="datasetDescription"/>
        </div>
        <br />
      </span>
      <span>
        <div class="fr-input-group">
          <label class="fr-label" for="ds-desc">Titre publique de votre fichier</label>
          <input id="ds-title" class="fr-input" v-model="resourceTitle">
        </div>
        <br />
      </span>
      <button class="fr-btn" @click="publishDataset">
        Publier les données
      </button>
    </div>

    <div v-if="isPublished">
      Jeu de données publié !&nbsp;
      <a :href="datasetLink" target="_blank">Ouvrir sur data.gouv.fr</a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import AuthentificationConnection from './AuthentificationConnection.vue';
import Papa from 'papaparse';

export default defineComponent({
  name: 'PublierForm',
  components: { AuthentificationConnection },
  setup () {
    const store = useStore();
    onMounted(async () => {
      const token   = await window.grist.getOption('token_datagouv');
      const profile = await window.grist.getOption('profile_datagouv');
      if (token)   store.dispatch('updateToken', token);
      if (profile) store.dispatch('updateProfile', profile);
    });
    

    const isSelectedOrg     = ref(false);
    const isSelectedTable  = ref(false);
    const selectedTable    = ref<string | null>(null);
    const resourceTitle = ref<string>('MonFichier')

    const publicationModeResource = ref('remote')
    const isPublicationModeResourceSelected = ref(false)

    const selectOrganization = (id: string) => {
      store.dispatch('updatePublierOrganization', id);
      isSelectedOrg.value = true;
      loadGristTables();
    };

    async function loadGristTables () {
      const tables = await window.grist.docApi.listTables();
      store.dispatch('updateActiveGristTables', tables);
      const docId = await window.grist.docApi.getDocName();
      store.dispatch('updateDocId', docId);
    }

    function validateTable(mode: string) {
      store.dispatch('updatePublierTables', selectedTable.value ? [selectedTable.value] : []);
      isPublicationModeResourceSelected.value = true;
      publicationModeResource.value = mode
      if (selectedTable.value) resourceTitle.value = selectedTable.value
    }
    const publicationMode   = ref<'new'|'update'|null>(null);

    const orgDatasets       = ref<any[]>([]);
    const isLoadingDatasets = ref(false);
    const selectedDataset   = ref<any|null>(null);

    async function loadDatasets () {
      if (publicationMode.value !== 'update') return;
      isLoadingDatasets.value = true;

      const orgId = store.state.publierOrganization;
      const url   = `${datagouvUrl}/api/1/organizations/${orgId}/datasets?page_size=200`;
      const { data } = await fetch(url).then(r => r.json());
      orgDatasets.value = data;
      isLoadingDatasets.value = false;
    }

    async function selectDataset (d: any) {
      selectedDataset.value = d;
      const url = `${datagouvUrl}/api/1/datasets/${d.id}`;
      const full = await fetch(url).then(r => r.json());
      datasetResources.value = full.resources;
    }

    const resourceMode      = ref<'new'|'replace'|null>(null);
    const datasetResources  = ref<any[]>([]);
    const selectedResource  = ref<any|null>(null);
  
    const datasetTitle       = ref('');
    const datasetDescription = ref('');

    const showMetaForm = computed(() => {
      if (publicationMode.value==='new') return true;
      if (publicationMode.value==='update' && selectedDataset.value && resourceMode.value==='new') return true;
      if (publicationMode.value==='update' && selectedResource.value) return true;
      return false;
    });

    const datagouvUrl = process.env.VUE_APP_DATAGOUV_PUBLISH_URL as string;

    let gristUrl = ""

    window.grist.getAccessToken().then(res => {
    try {
        gristUrl = res.baseUrl.split("/o/")[0];
    } catch {
        gristUrl = process.env.VUE_APP_GRIST_URL || '';
    }
    }).catch(() => {
        gristUrl = process.env.VUE_APP_GRIST_URL || '';
    });

    const gristPublishUrl = process.env.VUE_APP_GRIST_CHEAT_URL as string;

    const isPublished = ref(false);
    const datasetLink = ref('');

    async function fetchTableRows (tableId: string | null) {
      if (tableId) {
      const tokenInfo = await window.grist.docApi.getAccessToken({readOnly: true});
      const rows: any[] = [];
      const docId = store.state.docId;
      const url   = `${gristUrl}/api/docs/${docId}/tables/${tableId}/records?auth=${tokenInfo.token}`;
      const data  = await fetch(url).then(r => r.json());
      rows.push(...data.records.map((r: any) => r.fields));
      return rows;
      } else return []
    }

    async function replaceResource(r: any){
      selectedResource.value = r
    }

    async function publishDataset () {
      try {
        let datasetId = selectedDataset.value?.id ?? null;

        if (publicationMode.value === 'new') {
          const body = {
            title:       datasetTitle.value,
            description: datasetDescription.value,
            organization:{ id: store.state.publierOrganization }
          };
          const resp = await fetch(`${datagouvUrl}/api/1/datasets/`, {
            method: 'POST',
            headers: { 'Content-Type':'application/json',
                       'X-API-KEY': store.state.apikey },
            body: JSON.stringify(body)
          });
          if (!resp.ok) throw new Error(`Création dataset KO ${resp.status}`);
          datasetId = (await resp.json()).id;
        }

        if (publicationModeResource.value == 'file') {
          const rows = await fetchTableRows(selectedTable.value);
          const csv  = Papa.unparse(rows);
          const file = new File([csv], `${selectedTable.value}.csv`, { type:'text/csv' });

          const upUrl = resourceMode.value==='replace' && selectedResource.value
            ? `${datagouvUrl}/api/1/datasets/${datasetId}/resources/${selectedResource.value.id}/upload/` : `${datagouvUrl}/api/1/datasets/${datasetId}/upload/`;
          const upForm = new FormData();
          upForm.append('file', file);

          const up = await fetch(upUrl, {
            method:'POST',
            headers:{ 'X-API-KEY':store.state.apikey },
            body: upForm
          });
          if (!up.ok) throw new Error(`Upload KO ${up.status}`);
          const { id: rid } = await up.json();

          const resBody = {
            title:   resourceTitle.value,
            filetype:'file',
            format:  'csv',
            type:    'main'
          };
          const resUrl = resourceMode.value==='replace' && selectedResource.value
            ? `${datagouvUrl}/api/1/datasets/${datasetId}/resources/${selectedResource.value.id}/`
            : `${datagouvUrl}/api/1/datasets/${datasetId}/resources/${rid}/`;

          await fetch(resUrl, {
            method: resourceMode.value==='replace' ? 'PUT' : 'PUT',
            headers:{ 'Content-Type':'application/json',
                      'X-API-KEY':store.state.apikey },
            body: JSON.stringify(resBody)
          });
        }
        if (publicationModeResource.value == 'remote') {
          
          const resBody = {
            title:   resourceTitle.value,
            filetype:'remote',
            format:  'csv',
            type:    'main',
            url: gristPublishUrl + '/o/docs/api/docs/' + store.state.docId + '/download/csv?tableId=' + selectedTable.value
          };

          const resUrl = resourceMode.value==='replace'
            ? `${datagouvUrl}/api/1/datasets/${datasetId}/resources/${selectedResource.value.id}/`
            : `${datagouvUrl}/api/1/datasets/${datasetId}/resources/`;

          await fetch(resUrl, {
            method: resourceMode.value==='replace' ? 'PUT' : 'POST',
            headers:{ 'Content-Type':'application/json',
                      'X-API-KEY':store.state.apikey },
            body: JSON.stringify(resBody)
          });

        }

        datasetLink.value = `${datagouvUrl}/fr/datasets/${datasetId}`;
        isPublished.value = true;
      } catch (e:any) {
        alert(e.message);
      }
    }

    return {
      /* états UI */
      isSelectedOrg, selectOrganization,
      isSelectedTable,
      selectedTable,
      validateTable,
      publicationMode,
      orgDatasets, isLoadingDatasets, loadDatasets,
      selectedDataset, selectDataset,
      resourceMode, datasetResources, selectedResource,
      datasetTitle, datasetDescription, showMetaForm,
      publishDataset, isPublished, datasetLink, replaceResource,
      /* computed store */
      profile: computed(() => store.state.profile),
      activeGristTables: computed(() => store.state.activeGristTables),
      resourceTitle,
      isPublicationModeResourceSelected
    };
  }
});
</script>

<style scoped>
.btn-publish{
  width: 400px;
}
.petite-ligne{
  font-size: 10px;
  width: 400px;
}
</style>