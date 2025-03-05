<template>

    <div v-if="showChoices && selectedTable == ''">
    <!-- 1/ cette page est celle qui est affichée pour choisir quelle table Grist utiliser -->
        <legend class="fr-fieldset__legend--regular fr-fieldset__legend" id="radio-hint-legend">
            Sélectionnez la table que vous voulez utiliser.
            <span class="fr-hint-text">Attention, toute donnée de cette table sera supprimée</span>
        </legend>
        <div v-for="item in activeGristTables" v-bind:key="item">
            <div class="fr-fieldset__element">
                <div class="fr-radio-group">
                    <input type="radio" :id="item" :name="item" :value="item" v-model="selectedTable">
                    <label class="fr-label" :for="item">
                        {{ item }}
                    </label>
                </div>
            </div>
        </div>
    </div>

    <div v-if="showChoices && selectedTable != ''">
    <!-- 2/ cette page est celle qui est affichée quand on propose à l'utilisateur de choisir dans quelle organisation dgv rechercher la donnée.
     Si l'utilisateur n'a pas d'organisation sur dgv, on ne lui montre que le bouton de recherche globale. -->
        <div v-if="profile && profile.organizations && profile.organizations.length > 0">
            <p>A quel organisation appartient le jeu de données que vous souhaitez importer dans Grist ?</p>
            <div v-for="item in profile.organizations" v-bind:key="item.id">
                <div @click="selectOrganization(item.id, item.logo_thumbnail)" class="fr-tile fr-tile--sm fr-tile--horizontal fr-enlarge-link" id="tile-6661">
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
        <div @click="selectOrganization(null, null)" class="fr-tile fr-tile--sm fr-tile--horizontal fr-enlarge-link" id="tile-6661">
            <div class="fr-tile__body">
                <div class="fr-tile__content">
                    <h3 class="fr-tile__title">
                        <a href="#">Récupérer des données sur tout data.gouv.fr</a>
                    </h3>
                </div>
            </div>
        </div>
    </div>

    <div v-if="!showChoices && selectedTable != '' && !isImported && !showLoader">
    <!-- 3/ cette page est celle qui est affichée pour rechercher un jeu de données -->
        <div v-if="showInputSearch">
            <label class="fr-label" for="text-input-text">Rechercher un jeu de données</label>
            <input class="fr-input" type="text" id="text-input-text" name="text-input-text" v-model="searchText" @input="searchDatagouv()">
            <br />
        </div>
        <div v-for="resource in resources" v-bind:key="resource.resource_id">
            <div @click="importResource(resource.resource_id)" class="fr-tile fr-tile--sm fr-tile--horizontal fr-enlarge-link" id="tile-6661">
                <div class="fr-tile__body">
                    <div class="fr-tile__content">
                        <h3 class="fr-tile__title">
                            <a href="#">{{ resource.dataset_title }}</a>
                        </h3>
                        <p class="fr-tile__detail">{{ resource.resource_title }}</p>
                    </div>
                </div>
            </div>
            <br />
        </div>
    </div>

    <div>
    <!-- 4/ cette page est celle qui est affichée quand l'import est en cours -->
        <div v-if="showLoader" class="fr-stepper">
            <h2 class="fr-stepper__title">
                En cours d'importation dans la table {{ selectedTable }}
            </h2>
            <div class="fr-stepper__steps" :data-fr-current-step="ongoingStep" data-fr-steps="8"></div>
        </div>
    </div>

    <div v-if="!showLoader && isImported">
    <!-- 5/ cette page est celle qui est affichée quand l'import est terminé -->
        <br />
        🎉 Données importées dans la table {{ selectedTable }}
    </div>


</template>


<script lang="ts">
import { defineComponent, computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { processString } from '@/utils';


interface Resource {
  dataset_id: any;
  dataset_title: any;
  resource_id: any;
  resource_title: any;
}

function debounce<T extends () => void>(fn: T, delay: number): () => void {
  let timeoutID: number;
  return () => {
    clearTimeout(timeoutID);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    timeoutID = window.setTimeout(() => fn(), delay);
  };
}

export default defineComponent({
  name: 'ImporterForm',
  components: { },
  setup() {
    const store = useStore();
    const showInputSearch = ref(false)
    const logoSelectedOrg = ref("")
    const showChoices = ref(true)
    const searchText = ref("")
    const resources = ref<Resource[]>([]);
    const selectedTable = ref("")
    const ongoingStep = ref(0)
    const nbPages = ref(0)
    const showLoader = ref(false)
    const isImported = ref(false)
    const datagouvUrl = process.env.VUE_APP_DATAGOUV_IMPORT_URL
    const tabularapiUrl = process.env.VUE_APP_DATAGOUV_TABULAR_API
    const gristUrl = process.env.VUE_APP_GRIST_URL

    const getDatasetsOrg = async (org: string) => {
        let response = await fetch(datagouvUrl + "/api/1/datasets/?organization=" + org);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data.data)
        resources.value = []
        data.data.forEach((dataset: { resources: any[]; id: any; title: any; }) => {
            dataset.resources.forEach((resource) => {
                if (resource.extras && resource.extras["analysis:parsing:finished_at"]) {
                    resources.value.push({
                        "dataset_id": dataset.id,
                        "dataset_title": dataset.title,
                        "resource_id": resource.id,
                        "resource_title": resource.title,
                    });
                }
            })
        })
        console.log(data.data)
    }

    const selectOrganization = async (org: string|null, logo: string) => {
        showChoices.value = false;
        if (org){
            logoSelectedOrg.value = logo
            await getDatasetsOrg(org);
        } else {
            showInputSearch.value = true;
        }
    }

    const searchDatagouv = async () => {
      try {
        const response = await fetch(datagouvUrl + "/api/2/datasets/search/?q=" + searchText.value, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        resources.value = []
        result.data.forEach(async (dataset: { resources: { href: string; }; id: any; title: any; }) => {
          const response2 = await fetch(dataset.resources.href, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              }
            });
            if (!response2.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result2 = await response2.json();
            result2.data.forEach((resource: { id: any; title: any; extras: any;}) => {
              if (resource.extras && resource.extras["analysis:parsing:finished_at"]) {
                resources.value.push({
                  "dataset_id": dataset.id,
                  "dataset_title": dataset.title,
                  "resource_id": resource.id,
                  "resource_title": resource.title,
                });
              }
            });
          })
      } catch (error) {
        console.error("Error datagouv search", error);
        throw error;
      }
    }

    const debouncedSearch = debounce(searchDatagouv, 500);


    const importResource = async (id: string) => {
        ongoingStep.value = 1
        showLoader.value = true;
        const tokenInfo = await window.grist.docApi.getAccessToken({readOnly: true});
        const ress = await fetch(gristUrl + "/api/docs/" + store.state.docId + "/tables/" + selectedTable.value + "/records?auth=" + tokenInfo.token, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
        });
        if (!ress.ok) {
        throw new Error(`HTTP error! status: ${ress.status}`);
        }
        const records = await ress.json();
        let recordsToRemove: any[] = []
        records.records.forEach((r: any) => {
            recordsToRemove.push(r.id)
        })


        let res = await window.grist.docApi.fetchTable(selectedTable.value);

        for (const key of Object.keys(res)) {
          if (!["id", "manualSort"].includes(key)) {
            await window.grist.docApi.applyUserActions([['RemoveColumn', selectedTable.value, key]]);
          }
        }
        await window.grist.docApi.applyUserActions([['BulkRemoveRecord', selectedTable.value, recordsToRemove]]);
        ongoingStep.value = 2

        res = await fetch(`${tabularapiUrl}/api/resources/${id}/data/?page_size=50`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const result = await res.json();
        nbPages.value = Math.ceil(result.meta.total / result.meta.page_size) - 1;



        const resss = await fetch(gristUrl + "/api/docs/" + store.state.docId + "/tables/?auth=" + tokenInfo.token, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
        });
        if (!resss.ok) {
        throw new Error(`HTTP error! status: ${resss.status}`);
        }
        const tables = await resss.json();
        let parentId = 1

        tables.tables.forEach((table: {id: string, fields: { rawViewSectionRef: number }}) => {
            if (table.id === selectedTable.value){
                parentId = table.fields.rawViewSectionRef - 1 // long analysis of the logs and many tests to find that
            }
        })

        for (const key of Object.keys(result.data[0])) {
            if (key !== "__id") {
                const processedKey = processString(key);
                let ress = await window.grist.docApi.applyUserActions([['AddColumn', selectedTable.value, processedKey, { isFormula: true, type: 'Any', formula: '' }]]);
                await window.grist.docApi.applyUserActions([['AddRecord', "_grist_Views_section_field", null, { parentPos: null, parentId: parentId, colRef: ress.retValues[0].colRef }]]);
            }
        }
        ongoingStep.value = 3


        for (let i = 0; i <= nbPages.value; i++) {
            let calculus = Math.floor((((((i+1) * 100) / nbPages.value) * 5) / 100) + 3)
            if (Number.isFinite(calculus)) {
                ongoingStep.value = calculus
            } else {
                ongoingStep.value = 8
            }
            //ongoingStep.value = Math.floor((((((i+1) * 100) / nbPages.value) * 5) / 100) + 3)

            let response2 = await fetch(`${tabularapiUrl}/api/resources/${id}/data/?page_size=50&page=${i}`);
            if (!response2.ok) {
            throw new Error(`HTTP error! status: ${response2.status}`);
            }
            let result2 = await response2.json();
            let arr: any = {};
            result2.data.forEach((item: any) => {
                for (const key of Object.keys(item)) {
                    const processedKey = processString(key);
                    if (processedKey != "id"){
                        if (!arr[processedKey]) {
                            arr[processedKey] = [];
                        }
                        arr[processedKey].push(String(item[key]));
                    }
                }
            });

            console.log("arr", arr)

            const nullArray = new Array(arr[Object.keys(arr)[0]].length).fill(null);
            let records = [['BulkAddRecord', selectedTable.value, nullArray, arr]];
            await window.grist.docApi.applyUserActions(records);

        }
        showLoader.value = false
        isImported.value = true
    };

    const getActiveGristTables = async () => {
      let activeGristTables = await window.grist.docApi.listTables();
      store.dispatch('updateActiveGristTables', activeGristTables);
      let docId = await window.grist.docApi.getDocName();
      store.dispatch('updateDocId', docId);
    }

    onMounted(async () => {
        getActiveGristTables()
    });

    return {
        profile: computed(() => store.state.profile),
        selectOrganization,
        showInputSearch,
        logoSelectedOrg,
        showChoices,
        searchText,
        searchDatagouv: debouncedSearch,
        resources,
        importResource,
        selectedTable,
        activeGristTables: computed(() => store.state.activeGristTables),
        ongoingStep,
        nbPages,
        showLoader,
        isImported,
    }

  }
});
</script>

<style scoped>
</style>
