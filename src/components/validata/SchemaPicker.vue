<template>
  <form
    id="schema-form"
    class="fr-form fr-grid-row fr-mt-3w fr-mb-3w fr-grid-row--gutters"
    @submit.prevent="validate"
  >
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
          required
        />
      </div>
    </div>

    <div class="fr-col-12 fr-col-md-4 fr-align-self-center">
      <button type="submit" class="fr-btn fr-btn--full-width">
        Valider les données
      </button>
    </div>
  </form>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({ name: "SchemaPicker" });
</script>
