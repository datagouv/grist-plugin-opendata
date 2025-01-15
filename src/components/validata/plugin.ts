import { highlightErrors } from "./formatting";

import type { IGrist, IValidata } from "./spi";
import {
  type ValidationResponse,
  type Error,
  type ErrorsByType,
  relatesToRow,
} from "./types/report";
import type { TableData } from "./types/records";
import { getTableAsCSV } from "./csv";

import { reactive, ref } from "vue";

import { useValidationReport } from "./useValidationReport";

export const errors = reactive<ErrorsByType>({
  structureErrors: [],
  rowErrors: [],
  selectedRowErrors: [],
  warnings: [],
});

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
  // store schema URL last used for validation as an option
  grist.setOption("schemaURL", schemaURL);

  const records = await gristService.fetchRecords();

  if (records) {
    const report = await validataService.requestValidataReport(
      await getTableAsCSV(records, gristService),
      schemaURL,
      {
        header_case: true,
      }
    );

    if (!report.report) {
      const details = report.message ? report.message : "";
      console.error(`Validation could not be performed: ${details}`);
      return;
    }

    addRowIds(report, records);
    storeValidationReport(report);
    try {
      void highlightErrors(report, records, gristService);
    } catch (e) {
      console.error(e);
    }
    updateGeneralErrors(report);
  }
}

/** Returns the last evaluated validation report, if any.
 */

export function getValidationReport(): ValidationResponse | undefined {
  const getValidationReport = useValidationReport().getValidationReport;
  return getValidationReport();
}

/** Stores a validation report for future reference with `getValidationReport`
 */
function storeValidationReport(report: ValidationResponse) {
  const setValidationReport = useValidationReport().setValidationReport;
  setValidationReport(report);
}

/** Given a report, updates (displays) all table errors
 */
export function updateGeneralErrors(report: ValidationResponse) {
  errors.structureErrors = extractStructureErrors(report);
  errors.rowErrors = extractRowErrors(report);
  errors.warnings = report.report.warnings;
}

/** Given a report, updates (displays) errors specific to line n
 */
export function updateRowErrors(report: ValidationResponse, rowId: number) {
  errors.selectedRowErrors = extractSelectedRowErrors(report, rowId);
}

function extractStructureErrors(report: ValidationResponse): Error[] {
  // "structure" in a loose sense of anything not related to a row, may include "table" errors which can be
  // categorized as "body" errors rather than structure.
  const errors = report.report.errors || [];
  return errors.filter((e) => !relatesToRow(e));
}

function extractRowErrors(report: ValidationResponse): Error[] {
  // "structure" in a loose sense of anything not related to a row, may include "table" errors which can be
  // categorized as "body" errors rather than structure.
  const errors = report.report.errors || [];
  return errors.filter(relatesToRow);
}

function extractSelectedRowErrors(
  report: ValidationResponse,
  rowId: number
): Error[] {
  return report.report.errors
    .filter(relatesToRow)
    .filter((err) => err.rowId == rowId);
}

function addRowIds(report: ValidationResponse, table: TableData) {
  for (const error of report.report.errors) {
    if (error.rowNumber) {
      // - 2 because we ignore header row + 0-indexed array whereas rowNumber
      // is 1-indexed
      const rowId = table.idColumn.values[error.rowNumber - 2];
      error.rowId = rowId;
    }
  }
}
