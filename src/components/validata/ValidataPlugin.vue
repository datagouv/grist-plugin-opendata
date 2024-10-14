<template>
  <!DOCTYPE html>
  <html lang="fr">
    <head>
      <meta charset="utf-8">
      <title>Validata Grist Plugin</title>
    </head>
    <body>
      <main class="container">
        <h1> Schéma </h1>

        <form id="schema-form" class="grid" @submit.prevent="validate">
          <input type="text" name="schema" placeholder="URL d'un schéma que vous souhaitez utiliser pour valider les données" aria-label="URL of a table schema" id="schema-input" required>
          <button type="submit" >Valider les données</button>
        </form>
        <h2> Structure </h2>

        <ErrorDisplay
            id="structure-errors"
            :errors="structureErrors"
            noErrorMsg="Pas d'erreur de structure"
            displayBy="type"
            />


        <h2> Données </h2>

        <ErrorDisplay
            id="body-errors"
            :errors="bodyErrors"
            noErrorMsg="Pas d'erreur générale sur les données"
            displayBy="type"
            />

        <h1> Erreurs sur la ligne </h1>

        <ErrorDisplay
            id="row-errors"
            :errors="rowErrors"
            noErrorMsg="Pas d'erreur de validation pour la ligne sélectionnée"
            displayBy="Type"
            />

      </main>
    </body>
  </html>
</template>


<script lang="ts">
  import { defineComponent} from "vue";

  import { structureErrors, bodyErrors, rowErrors } from "./plugin";
  import ErrorDisplay  from "./ErrorDisplay.vue";

  export default defineComponent({
    name: 'ValidataPlugin',
    components: { ErrorDisplay },
    setup() {

    return { validate, structureErrors, bodyErrors, rowErrors}
    }
  })

  import { validateTable, getValidationReport } from "./plugin";
  import { updateRowErrors } from "./plugin";
  import { GristService } from "./infra/grist";
  import { ValidataService } from "./infra/validata";

  const gristService = new GristService();
  const validataService = new ValidataService();

  window.grist.ready({
    requiredAccess: "full",
  });

  window.grist.onRecord(async (row) => {
    const report = getValidationReport();
    if (report && row) {
      updateRowErrors(report, row.id);
    }
  });

  async function validate(event: SubmitEvent) {
    const schemaURL = _get_schema_url(event);

    if (schemaURL) {
      void validateTable(schemaURL, validataService, gristService);
    }
  }

  /**
   * @returns <?string> URL to a Table schema descriptor
   */
  function _get_schema_url(event: SubmitEvent) {
    const target = event.target;
    if (!target || !(target instanceof HTMLFormElement)) {
      return;
    }

    const data = new FormData(target);
    const schema = data.get("schema");
    if (!schema || !(typeof schema === "string")) {
      console.error(
        "The schema input is not defined, not provided as a string, or empty (i.e. not set as required). This is an internal error.",
      );
      return;
    }

    return schema;
  }

</script>
