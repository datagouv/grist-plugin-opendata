<template>
  <!DOCTYPE html>
  <html lang="fr">
    <head>
      <meta charset="utf-8" />
      <title>Validata Grist Plugin</title>
    </head>
    <body>
      <main class="container">
        <h2>Schéma</h2>

        <SchemaPicker />
        <ValidationReport
          :structureErrors="structureErrors"
          :bodyErrors="bodyErrors"
          :rowErrors="rowErrors"
        />
      </main>
    </body>
  </html>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { structureErrors, bodyErrors, rowErrors } from "./plugin";
import ValidationReport from "./ValidationReport.vue";
import SchemaPicker from "./SchemaPicker.vue";

export default defineComponent({
  name: "ValidataPlugin",
  components: { ValidationReport, SchemaPicker },
  setup() {
    return { validate, structureErrors, bodyErrors, rowErrors };
  },
});

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
      "The schema input is not defined, not provided as a string, or empty (i.e. not set as required). This is an internal error."
    );
    return;
  }

  return schema;
}
</script>
