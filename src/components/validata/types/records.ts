export interface Column {
  /** The column id is forged by grist to be unique **/
  id: string;

  /** The column label is chosen by the user and is displayed at the top of
   * the column **/
  label: string;

  /** The column position (0 indexed) is stored to be able to assign errors to the
   * correct column, given that the unique id is not known */
  position: number;

  values: grist.CellValue[];
}

export interface IdColumn extends Column {
  id: "id";
  values: number[];
}

export interface TableData {
  /** The id column corresponds to internal hidden column "$id" in Grist,
   * which associates to each row a unique id **/
  idColumn: IdColumn;
  columns: Column[];

  nRows: number;

  /** grist table ID **/
  tableId: string;
}

export type CsvTable = string;
