<template>
    <br /><br />
    <div @click="setMenuOptions('publier')" class="fr-tile fr-tile--sm fr-tile--horizontal fr-enlarge-link" id="tile-6661">
        <div class="fr-tile__body">
            <div class="fr-tile__content">
                <h3 class="fr-tile__title">
                    <a href="#">Je veux publier mes données sur data.gouv.fr</a>
                </h3>
                <p class="fr-tile__detail">Cliquez ici si vous souhaitez publier vos données Grist sur votre compte data.gouv.fr</p>
            </div>
        </div>
        <div class="fr-tile__header">
            <div class="fr-tile__pictogram">
              <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g id="SVGRepo_bgCarrier" stroke-width="0"/>
              <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
              <g id="SVGRepo_iconCarrier"> <path d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12" stroke="#060091" stroke-width="1.5"/> <path d="M2 14C2 11.1997 2 9.79961 2.54497 8.73005C3.02433 7.78924 3.78924 7.02433 4.73005 6.54497C5.79961 6 7.19974 6 10 6H14C16.8003 6 18.2004 6 19.27 6.54497C20.2108 7.02433 20.9757 7.78924 21.455 8.73005C22 9.79961 22 11.1997 22 14C22 16.8003 22 18.2004 21.455 19.27C20.9757 20.2108 20.2108 20.9757 19.27 21.455C18.2004 22 16.8003 22 14 22H10C7.19974 22 5.79961 22 4.73005 21.455C3.78924 20.9757 3.02433 20.2108 2.54497 19.27C2 18.2004 2 16.8003 2 14Z" stroke="#060091" stroke-width="1.5"/> <path d="M12 17L12 11M12 11L14.5 13.5M12 11L9.5 13.5" stroke="#060091" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> </g>
              </svg>
            </div>
        </div>
    </div>
    <br />
    <div @click="setMenuOptions('importer')" class="fr-tile fr-tile--sm fr-tile--horizontal fr-enlarge-link" id="tile-6661">
        <div class="fr-tile__body">
            <div class="fr-tile__content">
                <h3 class="fr-tile__title">
                    <a href="#">Je veux récupérer des données data.gouv.fr</a>
                </h3>
                <p class="fr-tile__detail">Récupérer un fichier CSV ou Excel déjà publié sur data.gouv.fr pour l'utiliser dans Grist.</p>
            </div>
        </div>
        <div class="fr-tile__header">
            <div class="fr-tile__pictogram">
              <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">

              <g id="SVGRepo_bgCarrier" stroke-width="0"/>

              <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>

              <g id="SVGRepo_iconCarrier"> <path d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12" stroke="#060091" stroke-width="1.5"/> <path d="M2 14C2 11.1997 2 9.79961 2.54497 8.73005C3.02433 7.78924 3.78924 7.02433 4.73005 6.54497C5.79961 6 7.19974 6 10 6H14C16.8003 6 18.2004 6 19.27 6.54497C20.2108 7.02433 20.9757 7.78924 21.455 8.73005C22 9.79961 22 11.1997 22 14C22 16.8003 22 18.2004 21.455 19.27C20.9757 20.2108 20.2108 20.9757 19.27 21.455C18.2004 22 16.8003 22 14 22H10C7.19974 22 5.79961 22 4.73005 21.455C3.78924 20.9757 3.02433 20.2108 2.54497 19.27C2 18.2004 2 16.8003 2 14Z" stroke="#060091" stroke-width="1.5"/> <path d="M12 11L12 17M12 17L14.5 14.5M12 17L9.5 14.5" stroke="#060091" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> </g>

              </svg>
            </div>
        </div>
    </div>
    <br />
    <div @click="setMenuOptions('schema')" class="fr-tile fr-tile--sm fr-tile--horizontal fr-enlarge-link" id="tile-6661">
        <div class="fr-tile__body">
            <div class="fr-tile__content">
                <h3 class="fr-tile__title">
                    <a href="#">Je veux créer un template à partir d'un schéma de données</a>
                </h3>
                <p class="fr-tile__detail">Les template Grist schémas de données permettent à un producteur de se conformer à la structure d'un type fichier partagé par l'ensemble de la communauté open data.</p>
            </div>
        </div>
        <div class="fr-tile__header">
            <div class="fr-tile__pictogram">
              <svg fill="#060091" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M72.7,65.8a6.6,6.6,0,0,0-3.2.8l-8.8-6.5a11.36,11.36,0,0,0,1.2-5.2A11.91,11.91,0,0,0,53,43.4v-10a7,7,0,0,0,4-6.2,6.9,6.9,0,1,0-13.8,0,6.73,6.73,0,0,0,4,6.2v10a11.91,11.91,0,0,0-8.9,11.5,11.36,11.36,0,0,0,1.2,5.2l-8.8,6.5a7.22,7.22,0,0,0-3.2-.8,6.9,6.9,0,1,0,6.9,6.9c0-.5-.1-.9-.1-1.3l9.2-6.8a11.61,11.61,0,0,0,13.6,0l9.2,6.8a5.7,5.7,0,0,0-.1,1.3,6.9,6.9,0,0,0,13.8,0A7.41,7.41,0,0,0,72.7,65.8ZM51.4,60.7a6.75,6.75,0,0,1-1.4.2,6.1,6.1,0,0,1-5.7-4.4,7.72,7.72,0,0,1-.2-1.5,5.81,5.81,0,0,1,3-5.1,6,6,0,0,1,6,0,5.81,5.81,0,0,1,3,5.1,7.72,7.72,0,0,1-.2,1.5A6.54,6.54,0,0,1,51.4,60.7Z"/></svg>
            </div>
        </div>
    </div>
    <br />
    <div @click="setMenuOptions('validata')" class="fr-tile fr-tile--sm fr-tile--horizontal fr-enlarge-link" id="tile-6661">
        <div class="fr-tile__body">
            <div class="fr-tile__content">
                <h3 class="fr-tile__title">
                    <a href="#">Je veux valider mes données à partir d'un schéma de données</a>
                </h3>
                <p class="fr-tile__detail">Utiliser l'outil Validata pour valider le contenu et la structure de ses données par rapport à un schéma de donnée existant, référencé ou non sur schema.data.gouv.fr</p>
            </div>
        </div>
        <div class="fr-tile__header">
            <div class="fr-tile__pictogram">
              <svg fill="#060091" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M72.7,65.8a6.6,6.6,0,0,0-3.2.8l-8.8-6.5a11.36,11.36,0,0,0,1.2-5.2A11.91,11.91,0,0,0,53,43.4v-10a7,7,0,0,0,4-6.2,6.9,6.9,0,1,0-13.8,0,6.73,6.73,0,0,0,4,6.2v10a11.91,11.91,0,0,0-8.9,11.5,11.36,11.36,0,0,0,1.2,5.2l-8.8,6.5a7.22,7.22,0,0,0-3.2-.8,6.9,6.9,0,1,0,6.9,6.9c0-.5-.1-.9-.1-1.3l9.2-6.8a11.61,11.61,0,0,0,13.6,0l9.2,6.8a5.7,5.7,0,0,0-.1,1.3,6.9,6.9,0,0,0,13.8,0A7.41,7.41,0,0,0,72.7,65.8ZM51.4,60.7a6.75,6.75,0,0,1-1.4.2,6.1,6.1,0,0,1-5.7-4.4,7.72,7.72,0,0,1-.2-1.5,5.81,5.81,0,0,1,3-5.1,6,6,0,0,1,6,0,5.81,5.81,0,0,1,3,5.1,7.72,7.72,0,0,1-.2,1.5A6.54,6.54,0,0,1,51.4,60.7Z"/></svg>
            </div>
        </div>
    </div>
    <br />
</template>


<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'MenuWidget',
  components: { },
  setup() {

    const store = useStore();
    const setMenuOptions = (option: string) => {
        store.dispatch('updateMenuOption', option);
    }

    return {
        setMenuOptions
    }

  }
});
</script>

<style scoped>
</style>
