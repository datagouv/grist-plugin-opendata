/** Interface to interact with Grist tables
 */

import type { TableData } from "./types/records";
import type { Error } from "./types/report";

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
}

export interface IValidata {
  requestValidataReport(
    dataRecords: TableData,
    schemaURL: string,
    options: Options
  ): Promise<ValidataReport>;
}
