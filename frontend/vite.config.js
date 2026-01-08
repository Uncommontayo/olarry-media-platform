import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, readdirSync } from 'fs'
import { resolve } from 'path'

const API_PROXY_TARGET = 'http://localhost:7071'

// Plugin to copy HTML files to dist during build
function copyHtmlPlugin() {
  return {
    name: 'copy-html',
    closeBundle() {
      const htmlFiles = readdirSync('.').filter(f => f.endsWith('.html') && f !== 'index.html')
      htmlFiles.forEach(file => {
        copyFileSync(file, resolve('dist', file))
        console.log(`Copied ${file} to dist/`)
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copyHtmlPlugin()],
  server: {
    proxy: {
      // Proxy /api requests to the real backend to avoid CORS in dev
      '/api': {
        target: API_PROXY_TARGET,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },
})
