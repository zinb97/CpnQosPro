import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/grafana': {
        target: 'http://192.168.10.31:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/grafana/, '')
      },
      '/volcano': {
        target: 'http://192.168.10.21:32000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/volcano/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
