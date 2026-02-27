import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'emoji-picker-react',
      'react-is',
      'recharts',
      'recharts/es6',
      'd3-shape',
      'd3-scale',
    ],
    force: true,
  },
  resolve: {
    alias: {
      'react-is': 'react-is/cjs/react-is.development.js',
    },
  },
  build: {
    commonjsOptions: {
      include: [/recharts/, /node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      onwarn(warning, warn) {
        // suppress recharts circular dependency warnings
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        warn(warning);
      },
    },
  },
})
