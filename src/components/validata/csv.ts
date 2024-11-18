import type { IGrist } from "./spi";
import { TableData, Column } from "./types/records";

type CsvTable = string;

export async function getTableAsCSV(
  table: TableData,
  gristService: IGrist
): Promise<CsvTable> {
  try {
    return await gristService.fetchCSVData();
  } catch (err) {
    return convertTableToCsv(table);
  }
}

function convertTableToCsv(table: TableData): CsvTable {
  const csvRows = [];

  const headers = table.columns.map((col) => col.label);

  csvRows.push(headers.join(","));

  for (let n = 0; n < table.nRows; n++) {
    const values = table.columns.map((col) =>
      get_nth_row_escaped_value(col, n)
    );
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}

function get_nth_row_escaped_value(column: Column, n: number): grist.CellValue {
  const value = column.values[n];
  const escapedValue =
    value !== null && value !== undefined
      ? String(value).replace(/"/g, '""')
      : "";
  return `"${escapedValue}"`;
}
