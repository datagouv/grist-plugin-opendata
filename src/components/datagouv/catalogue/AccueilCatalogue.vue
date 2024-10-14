<template>
  <header-widget />
  <div>
    <p><b>Bienvenue dans le widget data.gouv.fr de catalogage sur Grist</b></p>
    <p>Ce document Grist vous permet de gérer votre portefeuille de données au sein de votre administration.</p>
    <p>La vue <i>Catalogue Données</i> vous permet de remplir, ligne par ligne, les différentes données qui sont contenues dans vos Systèmes d'Informations.</p>
  </div>
  <div>
    <p>Pour initier ce travail, souhaitez-vous importer des données depuis data.gouv.fr ? (elles seront intégrées dans la vue <i>Catalogue Données</i>)</p>
    <div class="fr-fieldset__element fr-fieldset__element--inline radio-items">
        <div class="fr-radio-group radio-item">
            <input type="radio" id="radio-inline-1" name="radio-inline" v-model="showSearchOrgaDiv" :value="true">
            <label class="fr-label" for="radio-inline-1">
                Oui
            </label>
        </div>
        <div class="fr-radio-group radio-item">
            <input type="radio" id="radio-inline-2" name="radio-inline" v-model="showSearchOrgaDiv" :value="false">
            <label class="fr-label" for="radio-inline-2">
                Non
            </label>
        </div>
    </div>
  </div>
  <div v-if="showSearchOrgaDiv">
    <div class="searchBox">
        <label class="fr-label" for="text-input-text">Rechercher une organisation</label>
        <input class="fr-input" type="text" id="text-input-text" name="text-input-text" v-model="searchText" @input="searchOrga()">
    </div>
    <div v-if="showResults">
        <div class="results">
            <div v-for="item in searchOrgaItems" v-bind:key="item.id" class="searchItem" @click="selectOrga(item)">
                {{ item.name }}
            </div>
        </div>
    </div>
    <div v-if="dataGouvOrganization != '' && retrievingProcessStep == 0">
        <p>Vous avez sélectionné : {{ dataGouvOrganization }}</p>
        <div class="fr-btn" @click="fetchTable()">Récupérer les jeux de données de l'organisation {{ dataGouvOrganization }}</div>
        <p>⚠️ Attention, cela va ajouter des lignes sur la vue <i>Catalogue Données</i></p>
    </div>
    <div v-if="retrievingProcessStep == 1">
        <p>En cours de récupération... Patientez sur cette page !</p>
    </div>
    <div v-if="retrievingProcessStep == 2">
        <p>🎉 Données importées dans la vue <i>Catalogue Données</i> 🎉</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import HeaderWidget from '../HeaderWidget.vue';
import { queryUrl, utilsGetMetadata } from '../../../utils'; // Import functions from utils

interface Mapping {
    Titre: string;
    Mots_Cles: string;
    Date_Publication: string;
    Date_MaJ: string;
    Description: string;
    URL: string;
    URL_Open_Data: string;
    Volumetrie_en_Mo_: string;
    Format: string;
    Licence: string;
    Frequence_MaJ: string;
    Couverture_Geo: string;
    Organisation: string;
    Systeme_d_Information: string;
}

function debounce<T extends () => void>(fn: T, delay: number): () => void {
  let timeoutID: number;
  return () => {
    clearTimeout(timeoutID);
    timeoutID = window.setTimeout(() => fn(), delay);
  };
}

export default defineComponent({
  name: 'AccueilCatalogue',
  components: { HeaderWidget },
  setup() {
    const gristUrl = process.env.VUE_APP_GRIST_URL
    const datagouvUrl = process.env.VUE_APP_DATAGOUV_IMPORT_URL
    const docId: any = ref(null)
    const dataGouvOrganization = ref("")
    const dataGouvOrganizationId = ref("")
    const searchOrgaItems: any = ref([])
    const searchText = ref("")
    const showResults = ref(false)
    const showSearchOrgaDiv = ref(false)
    const retrievingProcessStep = ref(0)
    const tokenInfo = ref({ token: "" })
    onMounted(async () => {
        docId.value = await window.grist.docApi.getDocName();
        tokenInfo.value = await window.grist.docApi.getAccessToken({readOnly: false});
    });

    window.grist.ready({
      requiredAccess: 'full',
      columns: []
    });

    let mapping: Mapping = {
        "Titre": "title",
        "Mots_Cles": "tags",
        "Date_Publication": "created_at",
        "Date_MaJ": "last_modified",
        "Description": "description",
        "Organisation": "organization.name",
        "Systeme_d_Information": "data.gouv.fr",
        "Frequence_MaJ": "frequency",
        "Couverture_Geo": "spatial.granularity",
        "URL": "page",
        "URL_Open_Data": "page",
        "Format": "format",
        "Licence": "license",
        "Volumetrie_en_Mo_": "filesize"
    }

    const searchOrga = async () => {
      try {
        const result = await queryUrl(
            datagouvUrl + "/api/2/organizations/search/?q=" + searchText.value
        )
        let items: any[] = []
        result.data.forEach((item: {
          id: any; name: any;
        }) => {
            items.push({ "name": item.name, "id": item.id });
        })
        showResults.value = true
        searchOrgaItems.value = items
      } catch (error) {
        console.error("Error datagouv search", error);
        throw error;
      }
    }

    const debouncedSearch = debounce(searchOrga, 500);

    const selectOrga = (item: { name: string; id: any; }) => {
        showResults.value = false
        dataGouvOrganization.value = item.name
        dataGouvOrganizationId.value = item.id
        retrievingProcessStep.value = 0
    }

    const fetchTable = async () => {
        retrievingProcessStep.value = 1
        let headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }

        // 1 - Regarder si l'orga est présente dans la table orga. Si non, l'ajouter et ajouter son siret

        let url = datagouvUrl + "/api/1/organizations/" + dataGouvOrganizationId.value
        let data = await queryUrl(url)
        let orgaName = data.name
        let orgaSiret = data.business_number_id
        if (!orgaSiret){
            orgaSiret = ""
        }
        let orgaToCreate = true
        url = gristUrl + "/api/docs/" + docId.value + "/tables/Ref_Organisation/records?auth=" + tokenInfo.value.token
        data = await queryUrl(url)
        data.records.forEach((item: { fields: { Nom: any; }; }) => {
            if (item.fields.Nom == orgaName) {
                orgaToCreate = false
            }
        })

        if (orgaToCreate) {
            data = await queryUrl(
                gristUrl + "/api/docs/" + docId.value + "/tables/Ref_Organisation/records?auth=" + tokenInfo.value.token,
                'POST',
                headers,
                JSON.stringify({
                    records: [
                        {
                            fields: {
                                Nom: orgaName,
                                SIRET: orgaSiret
                            }
                        }
                    ]
                })
            )
        }

        // 2 - Récupérer les tables frequency, couverture geo et licence et format

        const frequencies = await utilsGetMetadata(gristUrl, docId.value, "Ref_Frequency", tokenInfo.value.token)
        const geocoverages = await utilsGetMetadata(gristUrl, docId.value, "Ref_GeographicalCoverage", tokenInfo.value.token)
        const licences = await utilsGetMetadata(gristUrl, docId.value, "Ref_Licence", tokenInfo.value.token)
        //specific process for formats
        url = gristUrl + "/api/docs/" + docId.value + "/tables/Ref_Format/records?auth=" + tokenInfo.value.token
        data = await queryUrl(url)
        const formats: any = {};
        data.records.forEach((item: { fields: { valeur: string|number; }; id: any; }) => {
            formats[item.fields.valeur] = item.id
        })


        // 3 - On remplit

        let stillWorking = true
        url = datagouvUrl + "/api/1/organizations/" + dataGouvOrganizationId.value + "/datasets"

        while (stillWorking) {
            let catalog = await queryUrl(url)
            let arr: { fields: { [key: string]: any; } }[] = [];
            catalog.data.forEach((item: { [x: string]: any; }) => {
                let object: any = {};
                for (let key in mapping) {
                    if (Object.prototype.hasOwnProperty.call(mapping, key)) {
                        let mappedKey = key as keyof Mapping;
                        if (mappedKey == "Mots_Cles"){
                            let gristArrFirst = ["L"]
                            object[mappedKey] = [...gristArrFirst, ...item[mapping[mappedKey]]]
                        } else if (mappedKey == "Licence") {
                            object[mappedKey] = licences[item[mapping[mappedKey]]];
                        } else if (mappedKey == "Frequence_MaJ") {
                            object[mappedKey] = frequencies[item[mapping[mappedKey]]];
                        } else if (mappedKey == "Format") {
                            let formatsList = ["L"]
                            item.resources.forEach((item2: { format: string; }) => {
                                if (item2.format && formats[item2.format]) {
                                    formatsList.push(formats[item2.format])
                                }
                            })
                            const uniqueFormats = [...new Set(formatsList)];
                            object[mappedKey] = uniqueFormats;
                            object[mappedKey] = [...new Set(formatsList)];
                        } else if (mappedKey == "Couverture_Geo" && item["spatial"] && item["spatial"]["zones"].length > 0) {
                            const lastColonIndex = item["spatial"]["zones"][0].lastIndexOf(':');
                            const newString = item["spatial"]["zones"][0].substring(0, lastColonIndex);
                            object[mappedKey] = geocoverages[newString];
                        } else if (mappedKey == "Organisation") {
                            object[mappedKey] = orgaName
                        } else if (mappedKey == "Systeme_d_Information") {
                            object[mappedKey] = "data.gouv.fr"
                        } else if (mappedKey == "Volumetrie_en_Mo_") {
                            let filesize = 0
                            item.resources.forEach((item2: { filesize: any; }) => {
                                if (item2.filesize) {
                                    filesize += item2.filesize
                                }
                            })
                            object[mappedKey] = filesize / 1000000;
                        } else {
                            object[mappedKey] = item[mapping[mappedKey]];
                        }
                    }
                }
                arr.push({ fields: object });
            });

            if (arr.length > 0) {
                data = await queryUrl(
                    gristUrl + "/api/docs/" + docId.value + "/tables/Catalogue/records?auth=" + tokenInfo.value.token,
                    'POST',
                    headers,
                    JSON.stringify({ "records": arr })
                )

                if (catalog.next_page && catalog.next_page != null) {
                    url = catalog.next_page
                } else {
                    stillWorking = false
                }
            } else {
                stillWorking = false
            }
        }

        retrievingProcessStep.value = 2
    };

    return {
        fetchTable,
        gristUrl,
        docId,
        searchOrga: debouncedSearch,
        searchOrgaItems,
        searchText,
        selectOrga,
        dataGouvOrganization,
        showResults,
        showSearchOrgaDiv,
        retrievingProcessStep,
    };
  }
});
</script>

<style scoped>

.results{
    border: 1px solid #ebebeb;
    padding-bottom: 5px;
}

.searchItem{
    margin-left: 20px;
    margin-right: 20px;
    min-height: 30px;
    line-height: 30px;
    border-bottom: 1px solid black;
}
.searchItem:hover{
    background-color: #ebebeb;
    cursor: pointer;
}

.searchBox{
    padding-bottom: 5px;
}

.radio-items{
    display: flex;
}
.radio-item{
    margin-right: 20px;
}

.fr-btn:hover{
    cursor: pointer;
}

</style>
