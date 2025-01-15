<template>
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
  font-family: Marianne, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 80%;
  margin: auto;
  text-align: left;
}
</style>
