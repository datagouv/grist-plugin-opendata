import type { IGrist } from "../spi";

import type { TableData, Column, IdColumn } from "../types/records";

import {
  ColumnsInfo,
  TablesInfo,
  addFillColorToWidgetOptions,
  deleteFillColorFromWidgetOptions,
} from "./grist-internals";

const VALIDATA_PLUGIN_WATERMARK = "_validata_plugin_watermark";

interface GristData {
  id: number[];
  [key: string]: grist.CellValue[];
}

export class GristService implements IGrist {
  /** Table ID is cached, and only updated when the data is fetched from the
   * table.
   *
   * Grist internals add hidden columns to define conditional formatting
   * formulas. It requires to pay attention on three spots of
   * `_grist_Tables_column` when adding,
   * updating or removing conditional formattings:
   *
   * - First, the formula is defined on the `formula` property of this hidden column,
   * - Then the link between the visible column and the related hidden column
   * is defined in the `rules` property of the visible column,
   * - At last, the conditional formatting color is defined in the
   * `widgetOptions.rulesOptions[i].fillColor` of the visible column, where position `i` relates to
   * position `i` in the rules
   **/
  private cachedTableStrId: string | undefined = undefined;
  private cachedTableNumId: number | undefined = undefined;

  private async getColumnsInfo() {
    return ColumnsInfo.init();
  }

  private invalidateTableIdCache(): void {
    this.cachedTableStrId = undefined;
    this.cachedTableNumId = undefined;
  }

  private async getTableStrId(): Promise<string> {
    if (!this.cachedTableStrId) {
      this.cachedTableStrId = await grist.getSelectedTableId();
    }

    return this.cachedTableStrId;
  }

  private async getTableNumId(): Promise<number> {
    if (!this.cachedTableNumId) {
      const tablesInfo = await TablesInfo.init();
      const strId = await this.getTableStrId();
      this.cachedTableNumId = tablesInfo.getNumId(strId);
    }

    return this.cachedTableNumId;
  }

  async fetchRecords() {
    /** in case the selected table on the plugin has been changed **/
    this.invalidateTableIdCache();

    const columnsInfo = await this.getColumnsInfo();
    const labels: string[] = await columnsInfo.getTableLabels(
      await this.getTableNumId()
    );

    const records: GristData | undefined = await grist.fetchSelectedTable({
      format: "columns",
      includeColumns: "normal",
    });

    if (!records) {
      console.error("Could not fetch data. This is an internal error");
      return;
    }

    return GristService.convertGristData(
      records,
      labels,
      await this.getTableStrId()
    );
  }

  async _fetchLabels() {
    const columnsInfo = await this.getColumnsInfo();
    return columnsInfo.getTableLabels(await this.getTableNumId());
  }

  async hasConditionalFormatting(strId: string): Promise<boolean> {
    const columnsInfo = await this.getColumnsInfo();

    const id = await columnsInfo.getIdFromStrId(
      strId,
      await this.getTableNumId()
    );

    if (!id) {
      return false;
    }

    const conditionalId = this._fetchConditionalFormattingId(id, columnsInfo);

    return conditionalId !== undefined;
  }

  async newConditionalFormatting(
    strId: string,
    formula: string
  ): Promise<void> {
    let columnsInfo = await this.getColumnsInfo();

    const id = await columnsInfo.getIdFromStrId(
      strId,
      await this.getTableNumId()
    );
    if (!id) {
      return;
    }

    // Action to add empty Conditional formatting rule
    const tableId = await this.getTableStrId();

    const addEmptyRule = this._addEmptyRuleAction(tableId, id);

    const updateFillColor = this._addFillColorAction(id, columnsInfo);

    await applyActions([addEmptyRule, updateFillColor]);

    // Adding conditional formatting adds a new row to internal columns information
    // Therefore, a data update is required.
    columnsInfo = await columnsInfo.update();

    const rules = columnsInfo.getRules(id);
    if (!rules) {
      return;
    }

    const conditionalFormattingId = rules[rules.length - 1];
    if (!conditionalFormattingId) {
      return;
    }

    const updateFormula = this._updateFormulaAction(
      conditionalFormattingId,
      formula
    );
    await applyActions([updateFormula]);
  }

  async updateConditionalFormatting(strId: string, formula: string) {
    const columnsInfo = await this.getColumnsInfo();

    const id = await columnsInfo.getIdFromStrId(
      strId,
      await this.getTableNumId()
    );
    if (!id) {
      return;
    }

    const conditionalFormattingId = this._fetchConditionalFormattingId(
      id,
      columnsInfo
    );

    if (conditionalFormattingId) {
      const updateFormulaAction = this._updateFormulaAction(
        conditionalFormattingId,
        formula
      );
      await applyActions([updateFormulaAction]);
    }
  }

  async deleteConditionalFormatting(strId: string) {
    const columnsInfo = await this.getColumnsInfo();

    const id = await columnsInfo.getIdFromStrId(
      strId,
      await this.getTableNumId()
    );
    if (!id) {
      return;
    }

    const formattingId = this._fetchConditionalFormattingId(id, columnsInfo);
    if (!formattingId) {
      return;
    }

    const formattingStrId = columnsInfo.getStrId(formattingId);
    if (!formattingStrId) {
      return;
    }

    if (formattingId) {
      const deleteFormatting = await this._deleteFormattingAction(
        formattingStrId
      );

      const deleteFillColor = this._deleteFillColorAction(
        id,
        formattingId,
        columnsInfo
      );

      if (deleteFillColor) {
        await applyActions([deleteFormatting, deleteFillColor]);
      }
    }
  }

  async fetchCSVData(): Promise<string> {
    const tableId = await this.getTableStrId();

    const tokenInfo: grist.AccessTokenResult =
      await grist.docApi.getAccessToken({ readOnly: true });
    return this._fetchCSVDataWithToken(tableId, tokenInfo);
  }

  async _fetchCSVDataWithToken(
    tableId: string,
    tokenInfo: grist.AccessTokenResult
  ) {
    const queryParams = new URLSearchParams({
      auth: tokenInfo.token,
      tableId: tableId,
      viewSection: "1",
    });

    const url = `${tokenInfo.baseUrl}/download/csv?${queryParams.toString()}`;
    console.log("XXX url", url);

    try {
      const response = await fetch(url);

      if (response.status == 403) {
        throw new Error("access denied");
      } else if (response.status != 200) {
        throw new Error(`${response.status}: ${response.text()}`);
      }

      return response.text();
    } catch (e) {
      throw new Error(`Could not fetch csv data: ${e}`); // { cause: e }
    }
  }

  private _fetchConditionalFormattingId(
    id: number,
    columnsInfo: ColumnsInfo
  ): number | undefined {
    const formattingIds = columnsInfo.getRules(id);

    if (formattingIds) {
      for (const id of formattingIds) {
        const ruleDescription = columnsInfo.getDescription(id);

        if (ruleDescription && ruleDescription == VALIDATA_PLUGIN_WATERMARK) {
          return id;
        }
      }
    }
    return;
  }

  private _addEmptyRuleAction(tableId: string, id: number): AddEmptyRuleAction {
    return ["AddEmptyRule", tableId, 0, id];
  }

  private _addFillColorAction(
    id: number,
    columnsInfo: ColumnsInfo
  ): UpdateRecordAction {
    const widgetOptions = columnsInfo.getWidgetOptions(id);

    const position = (columnsInfo.getRules(id) || []).length;
    const newWidgetOptions = addFillColorToWidgetOptions(
      widgetOptions,
      position
    );

    return [
      "UpdateRecord",
      "_grist_Tables_column",
      id,
      { widgetOptions: JSON.stringify(newWidgetOptions) },
    ];
  }

  private _deleteFillColorAction(
    id: number,
    formattingId: number,
    columnsInfo: ColumnsInfo
  ): UpdateRecordAction | undefined {
    const rules = columnsInfo.getRules(id);

    if (!rules) {
      return rules;
    }

    const idx = rules.indexOf(formattingId);

    const widgetOptions = columnsInfo.getWidgetOptions(id);
    const newWidgetOptions =
      deleteFillColorFromWidgetOptions(widgetOptions, idx) || "";

    return [
      "UpdateRecord",
      "_grist_Tables_column",
      id,
      { widgetOptions: JSON.stringify(newWidgetOptions) },
    ];
  }

  private _updateFormulaAction(
    conditionalFormattingId: number,
    formula: string
  ): UpdateRecordAction {
    return [
      "UpdateRecord",
      "_grist_Tables_column",
      conditionalFormattingId,
      { formula: formula, description: VALIDATA_PLUGIN_WATERMARK },
    ];
  }

  private async _deleteFormattingAction(
    conditionalFormattingStrId: string
  ): Promise<RemoveColumnAction> {
    const tableId = await this.getTableStrId();

    return ["RemoveColumn", tableId, conditionalFormattingStrId];
  }

  private static convertGristData(
    gristCol: GristData,
    labels: string[],
    tableId: string
  ): TableData {
    const idColumn: IdColumn = {
      id: "id",
      label: "",
      position: -1,
      values: gristCol.id,
    };

    const columns: Column[] = [];

    Object.keys(gristCol).forEach((colId, idx) => {
      if (colId == "id") {
        return;
      }

      const newColumn = {
        id: colId,
        label: labels[idx],
        position: idx,
        values: gristCol[colId],
      };

      columns.push(newColumn);
    });

    return {
      idColumn: idColumn,
      columns: columns,
      nRows: gristCol.id.length,
      tableId: tableId,
    };
  }
}

async function applyActions(actions: UserAction[]): Promise<void> {
  await grist.coreDocApi.applyUserActions(actions);
}
