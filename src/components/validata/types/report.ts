interface Meta {
  args: {
    schema: string;
    url: string;
  };
  validataTableVersion: string;
  validataCoreVersion: string;
}

export interface Error {
  code: string;
  description: string;
  labels: string[];
  message: string;
  name: string;
  note: string;
  fieldNumber?: number;
  fieldName?: string;
  rowNumber?: number;
  tags: Tag[];

  // specfific to Grist
  rowId?: number;
}

interface Stats {
  errors: number;
}

interface Task {
  errors: Error[];
  partial: boolean;
  stats: {
    errors: number;
  };
  warnings: string[];
  time: number;
  valid: boolean;
}

interface Report {
  date: string;
  errors: Error[];
  stats: Stats;
  tasks: Task[];
  time: number;
  valid: boolean;
  version: string;
}

export interface ErrorsByType {
  structureErrors: Error[];
  rowErrors: Error[];
  selectedRowErrors: Error[];
  warnings: string[];
}

export interface ValidationReport {
  _meta: Meta;
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
