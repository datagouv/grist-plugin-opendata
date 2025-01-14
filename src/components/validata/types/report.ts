export interface Error {
  cell?: unknown;
  cells?: unknown[];
  message: string;
  fieldNumber?: number;
  fieldName?: string;
  rowNumber?: number;
  tags: Tag[];
  type: string;

  // specfific to Grist
  rowId?: number;
}

interface Stats {
  errors: number;
}

interface Report {
  errors: Error[];
  stats: Stats;
  valid: boolean;
  warnings: string[];
}

export interface ErrorsByType {
  structureErrors: Error[];
  rowErrors: Error[];
  selectedRowErrors: Error[];
  warnings: string[];
}

export interface ValidationResponse {
  schema: string;
  url: string;
  date: string;
  options: {
    ignore_header_case: boolean;
  };
  version: string;
  report: Report;
}

export enum Tag {
  Head = "#head",
  Structure = "#structure",
  Header = "#header",
  Body = "#body",
  Cell = "#cell",
  Content = "#content",
  Row = "#row",
  Table = "#table",
}

function hasTagFromSet(err: Error, set: ReadonlySet<string>): boolean {
  return err.tags.some((tag) => set.has(tag));
}

export function relatesToRow(err: Error): boolean {
  return hasTagFromSet(err, ROW_TAGS);
}

const ROW_TAGS: ReadonlySet<string> = new Set([Tag.Cell, Tag.Row]);
