<template>
  <div>
    <label for="schema-select" class="fr-label">
      Sélectionnez un schéma officiel référencé sur schema.data.gouv.fr
    </label>
    <select class="fr-select" id="schema-select" name="select-schema" v-model="selectedSchema" @change="updateSchemaURL">
      <option value="" selected disabled hidden>Sélectionner une option</option>
      <option v-for="schema in schemas" :key="schema.schema_url" :value="schema.schema_url">
        {{ schema.title.substring(0, 100) }}
      </option>
    </select>

    <br /><b>ou</b>
  </div>

  <div>
    <label for="schema-input" class="fr-label">
      Indiquez ici l'URL d'un schéma Table Schema pour valider la table
    </label>
    <div class="fr-col-12 fr-col-md-12">
      <div class="fr-input-group">
        <input
          type="text"
          name="schema"
          id="schema-input"
          class="fr-input"
          placeholder="https://example.com/schema.json"
          v-model="schemaURL"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import axios from "axios";

export default defineComponent({
  name: "SchemaPicker",
  props: {
    modelValue: String,
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const schemas = ref<{ title: string; schema_url: string }[]>([]);
    const selectedSchema = ref<string>("");
    const schemaURL = ref<string>(props.modelValue || "");

    const fetchSchemas = async () => {
      try {
        const response = await axios.get("https://schema.data.gouv.fr/schemas-tableschema.json");
        schemas.value = response.data["schemas"];
      } catch (error) {
        console.error("Erreur lors du chargement des schémas :", error);
      }
    };

    const updateSchemaURL = () => {
      schemaURL.value = selectedSchema.value;
      emit("update:modelValue", schemaURL.value);
    };

    onMounted(fetchSchemas);

    return { schemas, selectedSchema, schemaURL, updateSchemaURL };
  },
});
</script>
