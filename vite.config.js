import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API_PROXY_TARGET = 'https://larry-media-api-axh2emfhfxf3gxaa.germanywestcentral-01.azurewebsites.net'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy /api requests to the real backend to avoid CORS in dev
      '/api': {
        target: API_PROXY_TARGET,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
})
