import type { IGrist } from "./spi";
import type { ValidationReport } from "./types/report";
import type { TableData } from "./types/records";

export async function highlightErrors(
  report: ValidationReport,
  table: TableData,
  gristService: IGrist
) {
  const errorRowsByLabel = aggregateErrorRowsByLabel(report);

  const promises: Promise<void>[] = [];
  for (const label of table.columns.map((col) => col.label)) {
    const columnHasErrors = label in errorRowsByLabel;

    let errorRowIds: number[];

    if (columnHasErrors) {
      const errorRows = errorRowsByLabel[label];

      errorRowIds = errorRows.map((n) => {
        return table.idColumn.values[n - 2];
      });
    } else {
      errorRowIds = [];
    }

    const colStrId: string | undefined = findStrIdFromLabel(label, table);
    if (!colStrId) {
      return;
    }

    promises.push(
      updateOrCreateConditionalFormatting(colStrId, errorRowIds, gristService)
    );
  }
  await Promise.all(promises);
}

function findStrIdFromLabel(
  label: string,
  table: TableData
): string | undefined {
  const column = table.columns.find((col) => col.label == label);
  if (!column) {
    return;
  }
  return column.id;
}

/**
 * Returns for each column an array of row numbers containing invalid values
 */
function aggregateErrorRowsByLabel(
  report: ValidationReport
): Record<string, number[]> {
  const errorRowsByLabel: Record<string, number[]> = {};
  const reportedCellErrors = report?.report?.tasks[0]?.errors || [];

  for (const err of reportedCellErrors) {
    if (err.fieldName && err.rowNumber) {
      if (!errorRowsByLabel[err.fieldName]) {
        errorRowsByLabel[err.fieldName] = [];
      }
      errorRowsByLabel[err.fieldName].push(err.rowNumber);
    }
  }

  return errorRowsByLabel;
}

async function updateOrCreateConditionalFormatting(
  colStrId: string,
  errorRowIds: number[],
  gristService: IGrist
) {
  const formula = `$id in [${errorRowIds}]`;

  const hasFormatting = await gristService.hasConditionalFormatting(colStrId);
  const hasErrors = errorRowIds.length > 0;

  if (hasFormatting && !hasErrors) {
    await gristService.deleteConditionalFormatting(colStrId);
  }

  if (hasFormatting && hasErrors) {
    await gristService.updateConditionalFormatting(colStrId, formula);
  }

  if (!hasFormatting && hasErrors) {
    await gristService.newConditionalFormatting(colStrId, formula);
  }
}
