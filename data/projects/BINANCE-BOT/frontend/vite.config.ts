import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
// import viteLoggerPlugin from './vite-logger-plugin.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()], // Temporariamente removido viteLoggerPlugin()
  server: {
    // Porta única para o frontend AURA - evita conflitos com outros projetos
    port: 13000,
    host: '0.0.0.0',
    strictPort: true, // Força o uso da porta específica

    // Configurações otimizadas para HMR
    hmr: {
      port: 23230, // Usar porta externa do Docker
      host: 'localhost',
      overlay: true, // Mostra erros na tela
    },

    // Configurações de watch otimizadas
    watch: {
      usePolling: true, // Força polling para detectar mudanças
      interval: 100, // Verifica mudanças a cada 100ms
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
    },

    // Configurações de cache otimizadas
    fs: {
      strict: false, // Permite arquivos fora do root
      allow: ['..'], // Permite acesso a arquivos do diretório pai
    },

    proxy: {
      '/api': {
        // Proxy FORÇADO para 127.0.0.1 em desenvolvimento
        target: 'http://127.0.0.1:23231',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true, // Habilitado para debug
  },

  // Configurações de cache otimizadas
  cacheDir: 'node_modules/.vite',

  // Configurações de otimização
  optimizeDeps: {
    force: true, // Força re-otimização das dependências
    include: ['react', 'react-dom'],
  },
})