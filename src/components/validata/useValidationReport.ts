import { type ValidationResponse } from "./types/report";
import { ref } from "vue";

const validationReport = ref<ValidationResponse | undefined>(undefined);

export function useValidationReport() {
  function getValidationReport() {
    return validationReport.value;
  }

  function setValidationReport(report: ValidationResponse) {
    validationReport.value = report;
  }

  return { getValidationReport, setValidationReport, validationReport };
}
