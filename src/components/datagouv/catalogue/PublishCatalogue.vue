<template>
  <header-widget />
  <div>
    <div v-if="showCatalog">
        <div v-if="!isCatalogue">
            <h4>Catalogue des données</h4>
            <p>Aucun catalogue de vos données n'est détecté sur data.gouv.fr, souhaitez-vous le publier ?</p>
            <div class="fr-fieldset__element fr-fieldset__element--inline radio-items">
                <div class="fr-radio-group radio-item">
                    <input type="radio" id="radio-inline-1" name="radio-inline" v-model="shouldPublishCatalogue" :value="true">
                    <label class="fr-label" for="radio-inline-1">
                        Oui
                    </label>
                </div>
                <div class="fr-radio-group radio-item">
                    <input type="radio" id="radio-inline-2" name="radio-inline" v-model="shouldPublishCatalogue" :value="false">
                    <label class="fr-label" for="radio-inline-2">
                        Non
                    </label>
                </div>
            </div>
            <div v-if="shouldPublishCatalogue">
                <div v-if="!isToken">
                    <token-form></token-form>
                </div>
                <div v-else>
                    <br />
                    <p>👋 Vous êtes connecté au compte de <b>{{ profile.first_name }} {{ profile.last_name }}</b></p>
                    <div v-if="showSelectOrga">
                        <div v-if="profile && profile.organizations && profile.organizations.length > 0">
                            <p>Pour quelle organisations souhaitez-vous publier ?</p>
                            <div v-for="item in profile.organizations" v-bind:key="item.id">
                                <div @click="selectOrganization(item)" class="fr-tile fr-tile--sm fr-tile--horizontal fr-enlarge-link" id="tile-6661">
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
                    <div v-else>
                        <div class="fr-btn" @click="publishCatalogue()">Publier mon inventaire sur data.gouv.fr au nom de {{ publishOrgaName }}</div>
                    </div>
                </div>
            </div>
        </div>
        <div v-else>
            <p>🎉 Votre catalogue est publié sur data.gouv.fr <b><a target="_blank" :href="datagouvUrl + '/fr/datasets/' + catalogueId">sur ce lien</a></b></p>
            <div class="fr-btn" @click="goToAdmin()">Modifier le jeu de données de votre catalogue sur l'admin data.gouv.fr</div>
        </div>
    </div>
    <div v-if="showDataset">
        <br />
        <h4>Publication de données</h4>
        <p>Souhaitez-vous créer un jeu de données sur data.gouv.fr à partir d'une ligne de votre catalogage public ?</p>
        <div class="fr-fieldset__element fr-fieldset__element--inline radio-items">
            <div class="fr-radio-group radio-item">
                <input type="radio" id="radio-inline-3" name="radio-inline2" v-model="shouldPublishDataset" :value="true">
                <label class="fr-label" for="radio-inline-3">
                    Oui
                </label>
            </div>
            <div class="fr-radio-group radio-item">
                <input type="radio" id="radio-inline-4" name="radio-inline2" v-model="shouldPublishDataset" :value="false">
                <label class="fr-label" for="radio-inline-4">
                    Non
                </label>
            </div>
        </div>

        <div v-if="shouldPublishDataset && showSelectOrga">
            <div v-if="profile && profile.organizations && profile.organizations.length > 0">
                <p>Pour quelle organisations souhaitez-vous publier ?</p>
                <div v-for="item in profile.organizations" v-bind:key="item.id">
                    <div @click="selectOrganization(item)" class="fr-tile fr-tile--sm fr-tile--horizontal fr-enlarge-link" id="tile-6661">
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
        </div>


        <div v-if="shouldPublishDataset && !isToken">
            <token-form></token-form>
        </div>
        <div v-else>
            <div v-if="shouldPublishDataset && !showSelectOrga" class="fr-select-group">
                <label class="fr-label" for="select">
                    Sélectionner un jeu de données
                </label>
                <select class="fr-select" id="select" name="select" @change="manageRecord()" v-model="recordToDataset">
                    <option value="" selected disabled hidden>Sélectionner une jeu de données</option>
                    <option v-for="item in filteredRecords" v-bind:key="item.id" :value="item">{{ item.fields.Titre }}</option>
                </select>
                <div v-if="recordToDataset && datasetId == ''">
                    <br />
                    <div v-if="recordToDataset && recordToDataset.fields && !recordToDataset.fields.URL_Open_Data">
                        <div class="fr-btn" @click="publishDataset()">Publier le jeu de données {{ recordToDataset.fields.Titre }}</div>
                        <p>⚠️ Attention, cela va créer un jeu de données sur data.gouv.fr qu'il faudra par la suite compléter en ajoutant les données sur l'interface d'administration de la plateforme.</p>
                    </div>
                    <div v-else>
                        <p>Ce jeu de données est déjà publié sur data.gouv.fr</p>
                        <div class="fr-btn" @click="goToDataset()">Modifier le jeu de données sur l'admin data.gouv.fr</div>
                    </div>
                </div>
                <div v-if="datasetId != ''">
                    <br />
                    <p>🎉 Le jeu de données a été publié en mode privé sur data.gouv.fr ! 🎉</p>
                    <div class="fr-btn" @click="goToNewDataset()">Ajouter les données du jeu de données sur l'admin data.gouv.fr</div>
                </div>
            </div>
        </div>
    </div>
    <br /><br />
    <p class="footer-info">* Recharger la page pour repartir à zéro.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed, watch } from 'vue';
import HeaderWidget from '../../HeaderWidget.vue';
import TokenForm from '../TokenForm.vue';
import { useStore } from 'vuex';
import { queryUrl } from '../../../utils';

interface Record {
    id: number;
    fields: {
        Titre: string;
        Description: string;
        Public: boolean;
        URL_Open_Data: string;
        Frequence_MaJ: number;
        Licence: number;
        Mots_Cles: Array<string>;
    };
}


export default defineComponent({
  name: 'PublishCatalogue',
  components: { HeaderWidget, TokenForm },
  setup() {
    let gristUrl = ""

    window.grist.getAccessToken().then(res => {
    try {
        gristUrl = res.baseUrl.split("/o/")[0];
    } catch {
        gristUrl = import.meta.env.VUE_APP_GRIST_URL || '';
    }
    }).catch(() => {
        gristUrl = import.meta.env.VUE_APP_GRIST_URL || '';
    });

    const datagouvUrl = import.meta.env.VUE_APP_DATAGOUV_IMPORT_URL
    const gristPublishUrl = import.meta.env.VUE_APP_GRIST_CHEAT_URL
    const docId: any = ref(null)
    const isCatalogue = ref(false)
    const catalogueId = ref("")
    const datasetId = ref("")
    const isToken = ref(false)
    const shouldPublishCatalogue = ref(false)
    const shouldPublishDataset = ref(false)
    const showSelectOrga = ref(true)
    const publishOrga = ref<string>("")
    const publishOrgaName = ref<string>("")
    const records = ref<Record[]>([])
    const recordToDataset = ref<Record | null>(null);
    const showCatalog = ref(true)
    const showDataset = ref(true)
    const tokenInfo = ref({ token: "" })
    const store = useStore();

    onMounted(async () => {

        window.grist.ready({
            requiredAccess: 'full',
            columns: []
        });

        tokenInfo.value = await window.grist.docApi.getAccessToken({readOnly: false});

        docId.value = await window.grist.docApi.getDocName();
        const token = await window.grist.getOption('token_datagouv');
        const profile = await window.grist.getOption('profile_datagouv');
        if (token && profile) {
          store.dispatch('updateToken', token);
          store.dispatch('updateProfile', profile);
          isToken.value = true
        }

        const url = gristUrl + "/api/docs/" + docId.value + "/tables/Ref_Catalogue/records?auth=" + tokenInfo.value.token
        const data = await queryUrl(url)
        if (data.records.length == 0) {
            isCatalogue.value = false
        } else {
            isCatalogue.value = true
            catalogueId.value = data.records[0].fields.dataset_id
        }
    });

    const goToAdmin = () => {
        window.open(datagouvUrl + "/fr/admin/dataset/" + catalogueId.value, '_blank');
    }

    const goToDataset = () => {
        if (recordToDataset.value && recordToDataset.value.fields.URL_Open_Data) {
            window.open(datagouvUrl + '/fr/admin/dataset/' + recordToDataset.value.fields.URL_Open_Data.split("/")[recordToDataset.value.fields.URL_Open_Data.split("/").length - 2], '_blank');
        }
    }

    const goToNewDataset = () => {
        window.open(datagouvUrl + '/fr/admin/dataset/' + datasetId.value, '_blank');
    }

    const filteredRecords = computed(() => records.value.filter(item => item.fields['Public']))

    const profile = computed(() => store.state.profile);
    watch(profile, (newProfile) => {
        if(newProfile && newProfile.first_name) {
            isToken.value = true
        }
    });

    watch(shouldPublishDataset, async () => {
        const url = gristUrl + "/api/docs/" + docId.value + "/tables/Catalogue/records?auth=" + tokenInfo.value.token
        const data = await queryUrl(url)
        records.value = data.records
        recordToDataset.value = null;
        showCatalog.value = false;
    });


    watch(shouldPublishCatalogue, async () => {
        showDataset.value = false;
    });

    const selectOrganization = (item: any) => {
        publishOrga.value = item.id
        publishOrgaName.value = item.name
        showSelectOrga.value = false
    }

    const manageRecord = async () => {
        datasetId.value = ""
    }

    const publishDataset = async () => {
        if (recordToDataset.value && recordToDataset.value.fields) {
            const frequencyData = await queryUrl(gristUrl + "/api/docs/" + docId.value + "/tables/Ref_Frequency/records?filter={\"id\": [" + recordToDataset.value.fields.Frequence_MaJ + "]}&auth=" + tokenInfo.value.token)
            const licenceData = await queryUrl(gristUrl + "/api/docs/" + docId.value + "/tables/Ref_Licence/records?filter={\"id\": [" + recordToDataset.value.fields.Licence + "]}&auth=" + tokenInfo.value.token)
            let licence = null;
            let frequency = null;
            let tags = null;
            if (licenceData.records.length > 0){
                licence = licenceData.records[0]["fields"]["id_technique"]
            }
            if (frequencyData.records.length > 0){
                frequency = frequencyData.records[0]["fields"]["id_technique"]
            }
            if (recordToDataset.value.fields.Mots_Cles.filter(item => item !== "L").length > 0) {
                tags = recordToDataset.value.fields.Mots_Cles.filter(item => item !== "L")
            }
            if (recordToDataset.value.fields.Description != '') {
                const body = {
                    title: recordToDataset.value.fields.Titre,
                    description: recordToDataset.value.fields.Description,
                    frequency: frequency,
                    license: licence,
                    tags: tags,
                    private: true,
                    organization: {
                        id: publishOrga.value
                    }
                }

                const headers = {
                    'Content-Type': 'application/json',
                    'X-API-KEY': store.state.token
                }
                let data: any = await queryUrl(
                    datagouvUrl + "/api/1/datasets/",
                    "POST",
                    headers,
                    JSON.stringify(body)
                )
                datasetId.value = data.id

                if (recordToDataset.value && recordToDataset.value.id) {

                    data = await queryUrl(
                        gristUrl + "/api/docs/" + docId.value + "/tables/Catalogue/records?auth=" + tokenInfo.value.token,
                        'PATCH',
                        { 'Content-Type': 'application/json' },
                        JSON.stringify({
                            records: [
                                {
                                    id: recordToDataset.value.id,
                                    fields: {
                                        URL_Open_Data: datagouvUrl + "/fr/datasets/" + datasetId.value
                                    }
                                }
                            ]
                        })
                    )
                }
            } else {
                alert("Champs Description requis.")
            }
        }
    }

    const publishCatalogue = async () => {
        const title = `Catalogue des données de l'organisation ${publishOrgaName.value}`;
        const description = `Ceci est un inventaire des données de ${publishOrgaName.value}.\nCe catalogue est géré directement sur l'outil open source \`Grist\`.\nCe jeu de donnée contient une liste de l'ensemble des jeux de données de l'organisation. Il est mis à jour en temps réel.`;

        const body = {
            title: title,
            description: description,
            organization: {
                id: publishOrga.value
            }
        }
        const headers = {
            'Content-Type': 'application/json',
            'X-API-KEY': store.state.token
        }
        let data: any = await queryUrl(
            datagouvUrl + "/api/1/datasets/",
            "POST",
            headers,
            JSON.stringify(body)
        )
        catalogueId.value = data.id

        const bodyResource = {
          title: "catalogue.csv",
          format: "csv",
          type: "main",
          filetype: "remote",
          url: gristPublishUrl + "/o/docs/api/docs/" + docId.value + "/download/csv?viewSection=21&tableId=Catalogue",
        }

        await queryUrl(
            datagouvUrl + "/api/1/datasets/" + catalogueId.value + "/resources/",
            "POST",
            headers,
            JSON.stringify(bodyResource)
        )

        data = await queryUrl(
            gristUrl + "/api/docs/" + docId.value + "/tables/Ref_Catalogue/records?auth=" + tokenInfo.value.token,
            'POST',
            { 'Content-Type': 'application/json' },
            JSON.stringify({
                records: [
                    {
                        fields: {
                            dataset_id: catalogueId.value,
                        }
                    }
                ]
            })
        )

        isCatalogue.value = true
    }

    return {
        profile: computed(() => store.state.profile),
        isCatalogue,
        catalogueId,
        datagouvUrl,
        goToAdmin,
        isToken,
        shouldPublishCatalogue,
        publishCatalogue,
        showSelectOrga,
        selectOrganization,
        publishOrgaName,
        records,
        filteredRecords,
        recordToDataset,
        shouldPublishDataset,
        publishDataset,
        goToDataset,
        datasetId,
        goToNewDataset,
        manageRecord,
        showCatalog,
        showDataset,
    };
  }
});
</script>

<style scoped>
.fr-btn:hover{
    cursor: pointer;
}

.radio-items{
    display: flex;
}
.radio-item{
    margin-right: 20px;
}
.footer-info{
    font-size: 12px;
    font-style: italic;
}
</style>
