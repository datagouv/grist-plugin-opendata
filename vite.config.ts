import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Vite copies public/ verbatim, which would drop the EJS webpack template over
// the built entry. Copy only the shared static assets instead.
function sharedAssets() {
  const files = ['favicon.ico', 'oauth-callback.html']
  return {
    name: 'grist-shared-assets',
    apply: 'build' as const,
    closeBundle() {
      for (const file of files) {
        const dest = resolve(__dirname, 'dist-vite', file)
        mkdirSync(dirname(dest), { recursive: true })
        copyFileSync(resolve(__dirname, 'public', file), dest)
      }
    },
  }
}

export default defineConfig({
  plugins: [vue(), sharedAssets()],
  base: '/',
  envPrefix: 'VUE_APP',
  publicDir: false,
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
      'Access-Control-Allow-Headers': 'X-Requested-Header, content-type, Authorization',
    },
  },
})
