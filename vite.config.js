import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  // Build under /admin/ so all asset paths are relative to that sub-path
  base: '/admin/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5175,
  },
  build: {
    // Output directly into the Cardom website's public/admin folder so a
    // single `npm run build` in the website picks everything up.
    outDir: '../Cardom/public/admin',
    emptyOutDir: true,
  },
})
