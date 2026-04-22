import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const DESIGN_HUB = path.resolve(__dirname, '../../michaelt-design-hub/client/src')

export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for assets
  resolve: {
    alias: {
      '@': DESIGN_HUB,
    },
  },
})
