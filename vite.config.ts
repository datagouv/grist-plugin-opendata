import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/',
  envPrefix: 'VUE_APP',
  resolve: {
    // webpack picked this up from tsconfig `paths`; Vite does not read that.
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    // @gouvfr/dsfr ships the legacy `@media (min-width: 0\0)` IE hack, which
    // LightningCSS rejects. errorRecovery strips it; modern browsers ignore it.
    lightningcss: { errorRecovery: true },
  },
  build: {
    outDir: 'dist-vite',
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  },
})
