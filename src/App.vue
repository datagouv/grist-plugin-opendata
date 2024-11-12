<template>
  <header class="fr-header" role="banner">
    <div class="fr-header__body">
      <div class="fr-container">
        <div class="fr-header__body-row">
          <div class="fr-col-12">
            <nav class="fr-nav" id="main-nav" role="navigation">
              <ul class="fr-nav__list">
                <li>
                  <router-link
                    class="fr-nav__link"
                    to="/validata"
                    aria-label="Plugin Validata"
                  >
                    Validata
                  </router-link>
                </li>
                <li>
                  <router-link
                    class="fr-nav__link"
                    to="/datagouv"
                    aria-label="Plugin DataGouv"
                  >
                    DataGouv
                  </router-link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </header>
  <div id="app" class="fr-container fr-mt-3w fr-mb-3w">
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
  components: {},
});
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 80%;
  margin: auto;
  text-align: left;
}
</style>
