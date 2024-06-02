interface Window {
    grist: {
    ready: (options?: { requiredAccess?: string; columns?: any[]; onEditOptions?: () => void }) => void;
    docApi: {
        reload(): any;
        getAccessToken(arg0: { readOnly: boolean; }): { token: string };
        getDocName(): () => Promise<any>;
        listTables: () => Promise<any>;
        fetchSelectedTable: (tableId: string) => Promise<any>;
        fetchSelectedRecord: (rowId: number) => Promise<any>;
        fetchTable: (tableId: string) => Promise<any>;
        addRecords: (tableId: string, records: { records?: any[] }) => Promise<any>;
        updateRecords: (tableId: string, records: any[]) => Promise<any>;
        replaceRecords: (tableId: string, records: any[]) => Promise<any>;
        applyUserActions: (actions: any[]) => Promise<any>;
    };
    onRecords: (handler: (records: any[], mappings: any) => void) => void;
    onRecord: (handler: (record: any) => void) => void;
    onOptions: (handler: (options: any) => void) => void;
    setOption: (key: string, value: any) => void;
    getOption: (key: string) => Promise<any>;
    getOptions: () => Promise<any>;
    setCursorPos: (pos: { rowId: number | 'new' }) => void;
    };
}
