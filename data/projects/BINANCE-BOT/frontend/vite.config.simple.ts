import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Configuração simplificada do Vite para o frontend AURA
export default defineConfig({
  plugins: [react()],
  server: {
    port: 13000,
    host: '0.0.0.0',
    strictPort: true, // Força o uso da porta específica
  },
})
