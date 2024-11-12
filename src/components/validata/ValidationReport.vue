<template>
  <ErrorDisplay
    title="Erreurs de structure"
    id="structure-errors"
    :errors="structureErrors"
    noErrorMsg="Pas d'erreur de structure"
    displayBy="type"
  />

  <ErrorDisplay
    title="Erreurs générales"
    id="body-errors"
    :errors="bodyErrors"
    noErrorMsg="Pas d'erreur générale sur les données"
    displayBy="type"
  />

  <ErrorDisplay
    title="Erreurs sur la ligne"
    id="row-errors"
    :errors="rowErrors"
    noErrorMsg="Pas d'erreur de validation pour la ligne sélectionnée"
    displayBy="field"
  />
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import ErrorDisplay from "./ErrorDisplay.vue";
import type { Error } from "./types/report";

export default defineComponent({
  name: "ValidationReport",
  components: { ErrorDisplay },
  props: {
    structureErrors: {
      type: Array as PropType<Error[]>,
      required: true,
    },
    bodyErrors: {
      type: Array as PropType<Error[]>,
      required: true,
    },
    rowErrors: {
      type: Array as PropType<Error[]>,
      required: true,
    },
  },
});
</script>
