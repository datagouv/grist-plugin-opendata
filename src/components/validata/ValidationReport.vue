<template>
  <div v-if="validationSucceeded">
    <div v-if="!hasErrors">Aucune erreur détectée</div>

    <div v-else class="fr-mt-3w fr-mb-3w">
      <!-- For structure errors -->
      <div v-if="errors.structureErrors.length > 0">
        Erreurs de structure :
        {{ detectedMsg(errors.structureErrors) }}
      </div>
      <div v-else>Pas d'erreur de structure</div>

      <!-- For row errors -->
      <div v-if="errors.rowErrors.length > 0">
        Erreurs de contenu : {{ detectedMsg(errors.rowErrors) }}
      </div>
      <div v-else>Pas d'erreur de contenu</div>
    </div>

    <ErrorDisplay
      title="Erreurs de structure"
      id="structure-errors"
      :errors="errors.structureErrors"
      displayBy="type"
    />

    <div
      v-if="
        errors.selectedRowErrors.length === 0 && errors.rowErrors.length > 0
      "
    >
      <mark>
        Veuillez sélectionner une ligne pour en inspecter les erreurs
      </mark>
    </div>

    <ErrorDisplay
      title="Erreurs sur la ligne sélectionnée"
      id="row-errors"
      :errors="errors.selectedRowErrors"
      displayBy="field"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import ErrorDisplay from "./ErrorDisplay.vue";
import type { ErrorsByType, Error } from "./types/report";

export default defineComponent({
  name: "ValidationReport",
  components: { ErrorDisplay },
  props: {
    errors: {
      type: Object as PropType<ErrorsByType>,
      required: true,
    },
    validationSucceeded: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const hasErrors = computed(() => {
      return (
        props.errors.structureErrors.length > 0 ||
        props.errors.rowErrors.length > 0
      );
    });

    return { hasErrors, detectedMsg };
  },
});

function detectedMsg(errors: Error[]): string {
  if (errors.length == 1) {
    return "1 erreur détectée";
  } else {
    return `${errors.length} erreurs détectées`;
  }
}
</script>
