/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VUE_APP_DATAGOUV_CLIENT_ID: string;
  readonly VUE_APP_DATAGOUV_IMPORT_URL: string;
  readonly VUE_APP_DATAGOUV_PUBLISH_URL: string;
  readonly VUE_APP_DATAGOUV_TABULAR_API: string;
  readonly VUE_APP_GRIST_CHEAT_URL: string;
  readonly VUE_APP_GRIST_URL: string;
  readonly VUE_APP_VALIDATA_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
