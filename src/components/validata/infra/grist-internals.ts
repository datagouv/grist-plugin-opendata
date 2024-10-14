interface _RawTablesInfo {
  id: number[];
  tableId: string[];
}

/**
 * An helper class for representing and manipulating column data
 *
 * It make it more easy to manipulate information about columns, especially by
 * enabling the access of information about a specific column with its string
 * id.
 *
 * In other words, it transforms the raw columnar representation of internal
 * column information (type _InternalColumnsRepr) to access a row by column string
 * id (`colId` property)
 */
export class ColumnsInfo {
  private internalColumnsRepr: _RawColumnsInfo;
  private indexById: Record<number, number>;

  static async init() {
    return new ColumnsInfo(await this.fetchData());
  }

  /** Data of a `ColumnsInfo` does not update automatically, an explicit call
   * to `update` is necessary to fetch new data.
   *
   * It is in fact the same as initiate the object again.
   */
  async update() {
    return await ColumnsInfo.init();
  }

  private constructor(internalColumnsRepr: _RawColumnsInfo) {
    this.internalColumnsRepr = internalColumnsRepr;

    this.indexById = internalColumnsRepr.id.reduce((accu, _, idx) => {
      const id: number = internalColumnsRepr.id[idx];
      accu[id] = idx;
      return accu;
    }, {} as Record<string, number>);
  }

  async getIdFromStrId(
    strId: string,
    tableNumId: number
  ): Promise<number | undefined> {
    let index = -1;

    const columnsInfo = this.internalColumnsRepr;
    for (const [i, colId] of columnsInfo.colId.entries()) {
      const belongsToTable = this.belongsToTable(tableNumId, columnsInfo.id[i]);

      if (colId == strId && belongsToTable) {
        index = i;
        break;
      }
    }

    if (index == -1) {
      return undefined;
    }

    return this.internalColumnsRepr.id?.[index];
  }

  async getIdFromLabel(
    label: string,
    tableNumId: number
  ): Promise<number | undefined> {
    let index = -1;

    const columnsInfo = this.internalColumnsRepr;
    for (const [i, colLabel] of columnsInfo.label.entries()) {
      const belongsToTable = this.belongsToTable(tableNumId, columnsInfo.id[i]);

      if (colLabel == label && belongsToTable) {
        index = i;
        break;
      }
    }

    if (index == -1) {
      return undefined;
    }

    return this.internalColumnsRepr.id?.[index];
  }

  getProperty<K extends keyof _RawColumnsInfo>(
    property: K,
    id: number
  ): _RawColumnsInfo[K][number] {
    const idx = this.getIndex(id);
    if (idx) {
      return this.internalColumnsRepr[property][idx];
    }
    return null;
  }

  /** Lists the columns defining rules regarding the column with given string
   * Id
   *
   * @param {string} id
   *
   * @returns {?number[]}
   */
  getRules(id: number): number[] | undefined {
    const childCols: Rule = this.getProperty("rules", id);
    if (!childCols) {
      return undefined;
    }

    // Discard first element, which is always a "L" letter
    const [, ...childColsCleaned] = childCols;
    return childColsCleaned;
  }

  getStrId(id: number): string | undefined {
    return this.getProperty("colId", id);
  }

  getWidgetOptions(id: number): WidgetOptions | undefined {
    const strOptions: string = this.getProperty("widgetOptions", id);
    if (strOptions) {
      return JSON.parse(strOptions);
    }
    return;
  }

  getDescription(id: number): string {
    return this.getProperty("description", id);
  }

  getLabel(id: number): string {
    return this.getProperty("label", id);
  }

  async getTableLabels(tableNumId: number): Promise<string[]> {
    const labels: string[] = [];
    for (const [i, colId] of this.internalColumnsRepr.id.entries()) {
      const colStrId: string = this.internalColumnsRepr.colId[i];

      if (
        this.belongsToTable(tableNumId, colId) &&
        !colStrId.startsWith("gristHelper_")
      ) {
        labels.push(this.internalColumnsRepr.label[i]);
      }
    }
    return labels;
  }

  static async fetchData() {
    const columnsInfo: _RawColumnsInfo =
      await window.grist.coreDocApi.fetchTable("_grist_Tables_column");

    return columnsInfo;
  }

  /** Retrieve the row index in the internal representation table
   */
  private getIndex(id: number): number | undefined {
    return this.indexById[id];
  }

  private belongsToTable(tableNumId: number, colId: number): boolean {
    const index = this.getIndex(colId);
    if (!index) {
      return false;
    }

    const tableNumIdForColumn = this.internalColumnsRepr.parentId[index];
    return tableNumIdForColumn == tableNumId;
  }
}

export function addFillColorToWidgetOptions(
  widgetOptions: WidgetOptions | undefined
): WidgetOptions {
  widgetOptions ??= {};
  widgetOptions.rulesOptions ??= [];

  widgetOptions.rulesOptions.push({ fillColor: "#FECBCC" });

  return widgetOptions;
}

export function deleteFillColorFromWidgetOptions(
  widgetOptions: WidgetOptions | undefined,
  indexToDelete: number
): WidgetOptions | undefined {
  widgetOptions?.rulesOptions?.splice(indexToDelete, 1);
  return widgetOptions;
}

type Rule = [string, ...number[]] | null;

/**
 *
 * In Grist, columns informations are stored in a hidden table
 * with id `_grist_Tables_column`, where each row stores information about one
 * specific column in the document, including hidden and internal ones (e.g.
 * conditional formatting formula columns).
 *
 * This object stores this data in a raw columnar representation, as obtained
 * by the `grist.coreDocApi.fetchTable` interface.
 */
interface _RawColumnsInfo {
  id: number[];
  parentId: number[];
  colId: string[] /* column string id */;
  type: string[];
  widgetOptions: string[];
  isFormula: boolean[];
  formula: string[];
  label: string[];
  description: string[];
  rules: Rule[];
}

interface WidgetOptions {
  rulesOptions?: RulesOption[];
}

interface RulesOption {
  fillColor: string;
}

export class TablesInfo {
  internalTableRepr: _RawTablesInfo;
  numIdByStrId: Record<string, number>;

  static async init() {
    return new TablesInfo(await this.fetchData());
  }

  private constructor(internalTableRepr: _RawTablesInfo) {
    this.internalTableRepr = internalTableRepr;

    const numIdByStrId: Record<string, number> = {};
    internalTableRepr.tableId.forEach((strId, idx) => {
      numIdByStrId[strId] = internalTableRepr.id[idx];
    });
    this.numIdByStrId = numIdByStrId;
  }

  getNumId(strId: string): number {
    return this.numIdByStrId[strId];
  }

  private static async fetchData() {
    const columnsInfo: _RawTablesInfo = await grist.coreDocApi.fetchTable(
      "_grist_Tables"
    );
    return columnsInfo;
  }
}
