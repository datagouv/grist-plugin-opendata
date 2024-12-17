import { IValidata } from "../spi";
import { ValidationReport } from "../types/report";

interface Options {
  header_case?: boolean;
}

export class ValidataService implements IValidata {
  async requestValidataReport(
    csvTable: string,
    schemaURL: string,
    options: Options
  ): Promise<ValidationReport> {
    const body = makeRequestBody(csvTable, schemaURL, options);

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
