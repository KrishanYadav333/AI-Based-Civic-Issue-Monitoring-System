import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': [
            'react',
            'react-dom',
            'react-router-dom',
            'redux',
            'react-redux',
            '@reduxjs/toolkit'
          ],
          'charts': [
            'recharts'
          ],
          'maps': [
            'leaflet',
            'react-leaflet'
          ],
          'ui': [
            'framer-motion',
            'lucide-react'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
})
