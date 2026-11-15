import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Escuta em IPv4 e IPv6 para que http://localhost:5173 funcione
  // em links de e-mail (alguns navegadores resolvem para ::1).
  server: {
    host: '::',
    port: 5173,
  },
  preview: {
    host: '::',
    port: 4173,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
})
