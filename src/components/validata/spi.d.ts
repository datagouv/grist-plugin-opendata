/** Interface to interact with Grist tables
 */

import type { TableData } from "./types/records";
import type { Error } from "./types/report";

/**
 * Interface for interacting with Grist
 * Implementation in "infra/grist.ts"
 */
export interface IGrist {
  /**
   * Fetch records of the selected table
   */
  fetchRecords(): Promise<TableData | undefined>;

  /**
   * Checks if the plugin already added a conditional formatting to a column
   */
  hasConditionalFormatting(strId: string): Promise<boolean>;

  /**
   * Add conditional formatting on a column
   */
  newConditionalFormatting(strId: string, formula: string): Promise<void>;

  /**
   * Update conditional formatting on a column
   */
  updateConditionalFormatting(strId: string, formula: string): Promise<void>;

  deleteConditionalFormatting(strId: string): Promise<void>;

  /**
   *
   */
  fetchCSVData(): Promise<string>;
}

export interface IValidata {
  requestValidataReport(
    csvTable: string,
    schemaURL: string,
    options: Options
  ): Promise<ValidataReport>;
}
