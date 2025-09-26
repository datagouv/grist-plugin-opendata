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

      <fieldset>
        <legend class="fr-fieldset__legend">
          Sélectionnez la table et la vue à publier
        </legend>
        <template v-for="(item, idx) in activeGristViews" :key="idx">
          <div class="fr-fieldset__element fr-radio-group fr-radio-group--block" style="width: 100%;">
            <input
              type="radio"
              :id="`grist-view-${idx}`"
              name="grist-view"
              v-model="selectedTable"
              @click="isSelectedTable = true"
              :value="item"
            />
            <label class="fr-label" :for="`grist-view-${idx}`">
              {{ item.label}}
            </label>
          </div>
        </template>
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
          <label class="fr-label" for="ds-desc">Titre public de votre fichier</label>
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

interface ColData {
  colId: string;
  displayColId: string|null;
}

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
    const selectedTable    = ref<any | null>(null);
    const resourceTitle = ref<string>('MonFichier')

    const publicationModeResource = ref('remote')
    const isPublicationModeResourceSelected = ref(false)

    const selectOrganization = (id: string) => {
      store.dispatch('updatePublierOrganization', id);
      isSelectedOrg.value = true;
      loadGristTables();
    };

    async function loadGristTables() {
      const docId     = await window.grist.docApi.getDocName();
      const { token } = await window.grist.docApi.getAccessToken({ readOnly: true });
      const base      = `${gristUrl}/api/docs/${docId}`;

      // Récupérer les tables 
      const respTables = await fetch(`${base}/tables?auth=${token}`);
      if (!respTables.ok) throw new Error(`Failed to fetch tables: ${respTables.status}`);
      const { tables: tablesArray = [] } = await respTables.json() as any;
      const tableRefs = tablesArray.map((t: any) => t.fields.tableRef);

      // Récupérer les Vues
      const sqlViews = encodeURIComponent("select * from _grist_Views_section");
      const respViews = await fetch(`${base}/sql?q=${sqlViews}&auth=${token}`);
      if (!respViews.ok) throw new Error(`Failed to fetch views: ${respViews.status}`);
      const { records: views = [] } = await respViews.json() as any;
      // ne garder que celles qui nous intéressent
      const matchingViews = views
        .filter((v: any) => tableRefs.includes(v.fields.tableRef))
        .filter((v: any) => v.fields.parentId !== 0)
        .filter((v: any) => v.fields.parentKey !== "custom");

      // Récupérer les champs de section pour ces vues
      const sqlFields = encodeURIComponent("select * from _grist_Views_section_field");
      const respFields = await fetch(`${base}/sql?q=${sqlFields}&auth=${token}`);
      if (!respFields.ok) throw new Error(`Failed to fetch section fields: ${respFields.status}`);
      const { records: fields = [] } = await respFields.json() as any;
      // regrouper par parentId (view.id)
      const fieldsByView: Record<number, number[]> = {};
      for (const rec of fields) {
        const { parentId, colRef } = rec.fields;
        if (!fieldsByView[parentId]) fieldsByView[parentId] = [];
        fieldsByView[parentId].push(colRef);
      }

      // Récupérer les colonnes de table pour le mapping colRef -> colId (label)
      const sqlCols = encodeURIComponent("select * from _grist_Tables_column");
      const respCols = await fetch(`${base}/sql?q=${sqlCols}&auth=${token}`);
      if (!respCols.ok) throw new Error(`Failed to fetch table columns: ${respCols.status}`);
      const { records: cols = [] } = await respCols.json() as any;
      // construire une map id -> colId
      const colMap: Record<number, {colId: string, displayCol: number}> = {};
      for (const rec of cols) {
        const {id, colId, displayCol} = rec.fields;
        colMap[id] = {
          colId,
          displayCol // If the column is a regular one, the value is `0`, which does not identify any colId
        };
      }

      // Construire enfin viewLabels avec la liste des colonnes pour chaque vue
      const viewLabels = matchingViews.map((v: any) => {
        const tbl = tablesArray.find((t: any) => t.fields.tableRef === v.fields.tableRef);
        const tableId = tbl ? tbl.id : String(v.fields.tableRef);

        const title = v.fields.title
          ? `Vue '${v.fields.title}'`
          : `Vue #${v.fields.id}`;

        const colRefs = fieldsByView[v.fields.id] || [];
        const columns: ColData[] = colRefs.map((c: number) => ({
          colId: colMap[c].colId || `(colRef ${c})`,
          displayColId: colMap[colMap[c].displayCol]?.colId || null,
        }));

        return {
          table:   tableId,
          id:      v.fields.id,
          title,
          label:   `Table '${tableId}' – ${title}`,
          columns,
        };
      });

      store.dispatch('updateActiveGristTables', tablesArray);
      store.dispatch('updateActiveGristViews', viewLabels);
      store.dispatch('updateDocId', docId);
    }

    function validateTable(mode: string) {
      store.dispatch('updatePublierTables', selectedTable.value ? [selectedTable.value] : []);
      isPublicationModeResourceSelected.value = true;
      publicationModeResource.value = mode
      if (selectedTable.value) resourceTitle.value = selectedTable.value.label
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

    const isPublished = ref(false);
    const datasetLink = ref('');
    
    async function replaceResource(r: any){
      selectedResource.value = r
    }

    async function fetchTableRows(
     tableRef: string | null,
      colsToKeep: ColData[]
    ): Promise<Array<Record<string, any>>> {
      if (!tableRef) {
        return [];
      }

      const tableData = await window.grist.docApi.fetchTable(tableRef);
      const colInfoMap = new Map<string, ColData>(colsToKeep.map(c => [c.colId, c]));
      const availableCols = Object.keys(tableData).filter(col =>
        colInfoMap.has(col)
      );
      const rowCount = availableCols.length
        ? (tableData[availableCols[0]] as any[]).length
        : 0;

      const rows: Array<Record<string, any>> = [];
      for (let i = 0; i < rowCount; i++) {
        const row: Record<string, any> = {};
        for (const col of availableCols) {
          const displayCol = colInfoMap.get(col)?.displayColId; // In case of references, we would like to get the display col
          const value = (tableData[displayCol || col] as any[])[i];
          row[col] = sanitizeValue(value);
        }
        rows.push(row);
      }

      return rows;
    }

    /**
     * Sanitize the passed value from a Grist table record.
     * If the value is an array:
     * 1. Remove the possible "L" prefix value
     * 2. Stringify the value for the CSV.
     */
    function sanitizeValue(value: any) {
      if (!Array.isArray(value)) {
        return value;
      }
      let sanitizedValue: any[] = value;
      if (sanitizedValue[0] === "L") {
        sanitizedValue = sanitizedValue.slice(1);
      }
      return sanitizedValue.join(",");
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

        if (publicationModeResource.value === 'file') {
          const tableRef   = selectedTable.value.table;
          const colsToKeep: ColData[] = selectedTable.value.columns;


          const rows = await fetchTableRows(tableRef, colsToKeep);

          const csv = Papa.unparse({ fields: colsToKeep.map(c => c.colId), data: rows });
          const file = new File([csv], `${tableRef}.csv`, { type: 'text/csv' });

          const upUrl = resourceMode.value === 'replace' && selectedResource.value
            ? `${datagouvUrl}/api/1/datasets/${datasetId}/resources/${selectedResource.value.id}/upload/`
            : `${datagouvUrl}/api/1/datasets/${datasetId}/upload/`;
          const upForm = new FormData();
          upForm.append('file', file);

          const up = await fetch(upUrl, {
            method: 'POST',
            headers: { 'X-API-KEY': store.state.apikey },
            body: upForm,
          });
          if (!up.ok) throw new Error(`Upload KO ${up.status}`);
          const { id: rid } = await up.json();

          const resBody = {
            title:    resourceTitle.value,
            filetype: 'file',
            format:   'csv',
            type:     'main',
          };
          const resUrl = resourceMode.value === 'replace' && selectedResource.value
            ? `${datagouvUrl}/api/1/datasets/${datasetId}/resources/${selectedResource.value.id}/`
            : `${datagouvUrl}/api/1/datasets/${datasetId}/resources/${rid}/`;

          await fetch(resUrl, {
            method:  'PUT',
            headers: {
              'Content-Type': 'application/json',
              'X-API-KEY':     store.state.apikey,
            },
            body: JSON.stringify(resBody),
          });
        }


        
        if (publicationModeResource.value == 'remote') {
          const resBody = {
            title:   resourceTitle.value,
            filetype:'remote',
            format:  'csv',
            type:    'main',
            url: gristUrl + '/o/docs/api/docs/' + store.state.docId + '/download/csv?tableId=' + selectedTable.value.table + '&viewSection=' + selectedTable.value.id
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
      profile: computed(() => store.state.profile),
      activeGristTables: computed(() => store.state.activeGristTables),
      activeGristViews: computed(() => store.state.activeGristViews),
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