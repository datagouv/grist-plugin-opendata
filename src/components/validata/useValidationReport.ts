import { type ValidationReport } from "./types/report";
import { ref } from "vue";

const validationReport = ref<ValidationReport | undefined>(undefined);

export function useValidationReport() {
  function getValidationReport() {
    return validationReport.value;
  }

  function setValidationReport(report: ValidationReport) {
    validationReport.value = report;
  }

  return { getValidationReport, setValidationReport, validationReport };
}
