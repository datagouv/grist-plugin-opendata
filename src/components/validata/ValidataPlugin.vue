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

        <form
          id="schema-form"
          class="fr-form fr-grid-row fr-mt-3w fr-mb-3w fr-grid-row--gutters"
          @submit.prevent="handleSubmit"
        >
          <SchemaPicker />

          <div class="fr-col-12 fr-col-md-4 fr-align-self-center">
            <button type="submit" class="fr-btn fr-btn--full-width">
              Valider les données
            </button>
          </div>
        </form>
        <ValidationReport
          :errors="errors"
          :validationSucceeded="validationSucceeded"
        />
      </main>
    </body>
  </html>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

import { errors } from "./plugin";
import ValidationReport from "./ValidationReport.vue";
import SchemaPicker from "./SchemaPicker.vue";
import { GristService } from "./infra/grist";
import { ValidataService } from "./infra/validata";

import { validateTable } from "./plugin";

import { getValidationReport } from "./plugin";
import { updateRowErrors } from "./plugin";

const gristService = new GristService();
const validataService = new ValidataService();

export const schemaURL = ref<string>("");

const countdownTimeoutId = ref<number | null>(null);
const validationSucceeded = ref(false);

const COUNTDOWN_SECONDS = 1;

export default defineComponent({
  name: "ValidataPlugin",
  components: { ValidationReport, SchemaPicker },
  setup() {
    async function handleSubmit(event: SubmitEvent) {
      const schemaURL = _get_schema_url(event);

      if (schemaURL) {
        await validateTable(schemaURL, validataService, gristService);
        validationSucceeded.value = true;
      }
    }
    return { handleSubmit, validationSucceeded, errors };
  },
});

window.grist.ready({
  requiredAccess: "full",
});

window.grist.onRecord(async (row) => {
  const report = getValidationReport();
  if (report && row) {
    updateRowErrors(report, row.id);
  }
});

async function handleAutoValidate() {
  if (schemaURL.value) {
    await validateTable(schemaURL.value, validataService, gristService);
    validationSucceeded.value = true;
  }
}

window.grist.onRecords(async () => {
  if (countdownTimeoutId.value !== null) {
    clearTimeout(countdownTimeoutId.value);
  }

  countdownTimeoutId.value = window.setTimeout(() => {
    handleAutoValidate();
  }, COUNTDOWN_SECONDS * 1000);
});

window.grist.onOptions((options: any) => {
  schemaURL.value = options.schemaURL;
});

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
