import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,        // AI-Tutor uses 5174
    strictPort: true,  // use exactly this port
    open: true,        // auto-open browser on whatever port it lands on
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      }
    }
  }
})
