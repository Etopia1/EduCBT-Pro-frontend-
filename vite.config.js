import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['emoji-picker-react', 'react-is', 'recharts']
  },
  resolve: {
    alias: {
      'react-is': 'react-is/cjs/react-is.development.js',
    },
  },
})
