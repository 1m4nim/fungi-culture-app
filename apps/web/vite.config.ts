import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  root: path.resolve(__dirname, 'apps/web'),  // apps/webをルートに指定
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'apps/web/src'),  // @ は apps/web/src を指す
    }
  },
  server: {
    port: 5173
  }
})
