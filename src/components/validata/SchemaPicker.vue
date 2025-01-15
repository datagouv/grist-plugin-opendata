<template>
  <label for="schema-input" class="fr-label">
    Indiquez ici l'URL d'un schéma Table Schema pour valider la table
  </label>
  <div class="fr-col-12 fr-col-md-8">
    <div class="fr-input-group">
      <input
        type="text"
        name="schema"
        id="schema-input"
        class="fr-input"
        placeholder="https://example.com/schema.json"
        :value="schemaURL"
        required
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { schemaURL } from "./ValidataWidget.vue";

export default defineComponent({
  name: "SchemaPicker",
  setup() {
    return { schemaURL };
  },
});
</script>
