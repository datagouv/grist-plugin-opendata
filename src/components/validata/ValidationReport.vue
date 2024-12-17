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
    />

    <div v-if="errors.warnings.length > 0" class="fr-mb-3w">
      <h3>Warnings</h3>
      <ul>
        <li v-for="warning in errors.warnings" :key="warning">
          {{ warning }}
        </li>
      </ul>
    </div>

    <div
      v-if="
        errors.selectedRowErrors.length === 0 && errors.rowErrors.length > 0
      "
    >
      <DsfrHighlight
        text="Veuillez sélectionner une ligne pour en inspecter les erreurs"
      />
    </div>

    <ErrorDisplay
      title="Erreurs sur la ligne sélectionnée"
      id="row-errors"
      :errors="errors.selectedRowErrors"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import ErrorDisplay from "./ErrorDisplay.vue";
import type { ErrorsByType, Error } from "./types/report";
import { DsfrHighlight } from "@gouvminint/vue-dsfr";

export default defineComponent({
  name: "ValidationReport",
  components: { ErrorDisplay, DsfrHighlight },
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
