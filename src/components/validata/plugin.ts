import { highlightErrors } from "./formatting";

import type { IGrist, IValidata } from "./spi";
import {
  type ValidationReport,
  type Error,
  relatesToDataStructure,
  relatesToDataBody,
  relatesToRow,
} from "./types/report";
import type { TableData } from "./types/records";

import { ref } from "vue";

import { useValidationReport } from "./useValidationReport";

export const structureErrors = ref<Error[]>([]);
export const bodyErrors = ref<Error[]>([]);
export const rowErrors = ref<Error[]>([]);

/** Validate data against the user provided schema.
 *
 * Cell and Line error messages are only displayed after the user selects the
 * a given line with errors.
 */
export async function validateTable(
  schemaURL: string,
  validataService: IValidata,
  gristService: IGrist
) {
  const records = await gristService.fetchRecords();

  if (records) {
    const report = await validataService.requestValidataReport(
      records,
      schemaURL,
      {
        header_case: true,
      }
    );

    addRowIds(report, records);
    storeValidationReport(report);
    void highlightErrors(report, records, gristService);
    updateGeneralErrors(report);
  }
}

/** Returns the last evaluated validation report, if any.
 */

export function getValidationReport(): ValidationReport | undefined {
  const getValidationReport = useValidationReport().getValidationReport;
  return getValidationReport();
}

/** Stores a validation report for future reference with `getValidationReport`
 */
function storeValidationReport(report: ValidationReport) {
  const setValidationReport = useValidationReport().setValidationReport;
  setValidationReport(report);
}

/** Given a report, updates (displays) all table errors
 */
export function updateGeneralErrors(report: ValidationReport) {
  structureErrors.value = extractStructureErrors(report);
  bodyErrors.value = extractBodyErrors(report);
}

/** Given a report, updates (displays) errors specific to line n
 */
export function updateRowErrors(report: ValidationReport, rowId: number) {
  rowErrors.value = extractRowErrors(report, rowId);
}

function extractStructureErrors(report: ValidationReport): Error[] {
  const errors1 = report.report.errors || [];
  let errors2: Error[] = [];
  if (report.report.tasks.length > 0) {
    errors2 = report.report.tasks[0].errors;
  }

  const allErrors = errors1.concat(errors2);

  return allErrors.filter(relatesToDataStructure);
}

function extractBodyErrors(report: ValidationReport): Error[] {
  const errors1 = report.report.errors || [];
  let errors2: Error[] = [];
  if (report.report.tasks.length > 0) {
    errors2 = report.report.tasks[0].errors;
  }

  const allErrors = errors1.concat(errors2);

  return allErrors
    .filter(relatesToDataBody)
    .filter((err) => !relatesToRow(err));
}

function extractRowErrors(report: ValidationReport, rowId: number): Error[] {
  if (report.report.tasks.length == 0) {
    return [];
  }

  return report.report.tasks[0].errors
    .filter(relatesToRow)
    .filter((err) => err.rowId == rowId);
}

function addRowIds(report: ValidationReport, table: TableData) {
  for (const error of report.report.tasks[0].errors) {
    if (error.rowNumber) {
      const rowId = table.idColumn.values[error.rowNumber - 1];
      error.rowId = rowId;
    }
  }
}
