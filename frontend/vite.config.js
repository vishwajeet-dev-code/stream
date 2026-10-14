import { defineConfig, loadEnv } from 'vite'
import { env as processEnv } from 'node:process'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '..', '')
  const apiBaseUrl =
    processEnv.API_BASE_URL ||
    processEnv.VITE_API_BASE_URL ||
    env.API_BASE_URL ||
    env.VITE_API_BASE_URL ||
    'http://localhost:8000'

  return {
    envDir: '..',
    define: {
      'import.meta.env.API_BASE_URL': JSON.stringify(apiBaseUrl),
    },
    plugins: [tailwindcss()],
    server: {
      watch: {
        usePolling: true,
      },
    },
  }
})