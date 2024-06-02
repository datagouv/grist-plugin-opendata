<template>
    <br />


    <div>
        <div v-if="showLoader" class="fr-stepper">
            <h2 class="fr-stepper__title">
                En cours d'importation dans la table {{ selectedTable }}
            </h2>
            <div class="fr-stepper__steps" :data-fr-current-step="ongoingStep" data-fr-steps="8"></div>
        </div>
    </div>

    <div v-if="!showLoader && isImported">
        🎉 Template importé dans la table {{ selectedTable }}
    </div>

    <div v-if="selectedTable == ''">
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
    <div v-else>
        <div v-if="selectedSchema && !selectedSchema.name && !showLoader">
            <div><label class="fr-label" for="text-input-text">Choisissez votre schéma</label></div>
            <div>
                <div class="fr-tile fr-tile--sm fr-tile--horizontal fr-enlarge-link schema-card" v-for="schema in schemas" v-bind:key="schema.name" @click="generateTemplateSchema(schema)">
                    <div class="fr-tile__body">
                        <div class="fr-tile__content">
                            <h3 class="fr-tile__title">
                                <a href="#">{{ schema.title }}</a>
                            </h3>
                            <p class="fr-tile__detail">{{ schema.description }}</p>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    </div>
</template>


<script lang="ts">
import { defineComponent, computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { processString } from '@/utils';

export default defineComponent({
  name: 'PublierForm',
  components: { },
  setup() {
    const store = useStore();
    const selectedTable = ref("")
    const schemas = ref([])
    const selectedSchema = ref({})
    const showLoader = ref(false)
    const ongoingStep = ref(0)
    const gristUrl = process.env.VUE_APP_GRIST_URL
    
    const getActiveGristTables = async () => {
      let activeGristTables = await window.grist.docApi.listTables();
      store.dispatch('updateActiveGristTables', activeGristTables);
      let docId = await window.grist.docApi.getDocName();
      store.dispatch('updateDocId', docId);
    }

    onMounted(async () => {
        getActiveGristTables()

        const response = await fetch("https://schema.data.gouv.fr/schemas-tableschema.json", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
        });
        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        schemas.value = data["schemas"];
    })

    const generateTemplateSchema = async (schema: any) => { 

        showLoader.value = true
        ongoingStep.value = 1

        const tokenInfo = await window.grist.docApi.getAccessToken({readOnly: true});
        const res4 = await fetch(gristUrl + "/api/docs/" + store.state.docId + "/tables/" + selectedTable.value + "/records?auth=" + tokenInfo.token, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
        });
        if (!res4.ok) {
        throw new Error(`HTTP error! status: ${res4.status}`);
        }
        const records = await res4.json();
        let recordsToRemove: any[] = []
        records.records.forEach((r: any) => {
            recordsToRemove.push(r.id)
        })

        ongoingStep.value = 2

        let res = await window.grist.docApi.fetchTable(selectedTable.value);

        for (const key of Object.keys(res)) {
          if (!["id", "manualSort"].includes(key)) {
            await window.grist.docApi.applyUserActions([['RemoveColumn', selectedTable.value, key]]);
          }
        }
        
        ongoingStep.value = 3
        await window.grist.docApi.applyUserActions([['BulkRemoveRecord', selectedTable.value, recordsToRemove]]);

        ongoingStep.value = 4

        res = await fetch(schema.schema_url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const result = await res.json();
        
        const ress = await fetch(gristUrl + "/api/docs/" + store.state.docId + "/tables/?auth=" + tokenInfo.token, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
        });
        if (!ress.ok) {
        throw new Error(`HTTP error! status: ${ress.status}`);
        }
        ongoingStep.value = 5

        const tables = await ress.json();
        let parentId = 1

        tables.tables.forEach((table: {id: string, fields: { rawViewSectionRef: number }}) => {
            if (table.id === selectedTable.value){
                parentId = table.fields.rawViewSectionRef - 1 // long analysis of the logs and many tests to find that
            }
        })

        ongoingStep.value = 6
        let cpt = 0
        result.fields.forEach(async (item: { name: string; }) => {
            const processedKey = processString(item.name);

            let ress = await window.grist.docApi.applyUserActions([['AddColumn', selectedTable.value, processedKey, { isFormula: true, type: 'Any', formula: '' }]]);
            await window.grist.docApi.applyUserActions([['AddRecord', "_grist_Views_section_field", null, { parentPos: null, parentId: parentId, colRef: ress.retValues[0].colRef }]]);
            cpt += 1
            if (cpt == result.fields.length){
                ongoingStep.value = 8
                showLoader.value = false
            }
        });

        selectedSchema.value = schema;    
        store.dispatch('updateMenuOption', null);

     };

    return {
        selectedTable,
        activeGristTables: computed(() => store.state.activeGristTables),
        generateTemplateSchema,
        selectedSchema,
        schemas,
        showLoader,
        ongoingStep,
    }

  }
});
</script>

<style scoped>
.schema-card{
    margin-bottom: 20px;
}
</style>
