import { IValidata } from "../spi";
import { ValidationReport } from "../types/report";
import { TableData, Column } from "../types/records";

interface Options {
  header_case?: boolean;
}

export class ValidataService implements IValidata {
  async requestValidataReport(
    table: TableData,
    schemaURL: string,
    options: Options
  ): Promise<ValidationReport> {
    const fileContent = tableToCsv(table);
    const body = makeRequestBody(fileContent, schemaURL, options);

    const url = "https://api.validata.etalab.studio/validate";
    return fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: body,
    }).then(function (response) {
      return response.json();
    });
  }
}

function makeRequestBody(
  fileContent: string,
  schemaURL: string,
  options: Options
) {
  const file = new File([fileContent], "testfile.csv", { type: "text/csv" });
  const body = new FormData();
  body.append("file", file);
  body.append("schema", schemaURL);
  body.append("header_case", (options.header_case || true).toString());

  return body;
}

function tableToCsv(table: TableData): string {
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
