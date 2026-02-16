import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
// import viteLoggerPlugin from './vite-logger-plugin.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()], // Temporariamente removido viteLoggerPlugin()
  server: {
    // Porta única Diana - faixa 21300-21399 (ver .env.ports)
    port: parseInt(process.env.DIANA_BINANCE_FRONTEND_PORT || '21340'),
    host: '0.0.0.0',
    strictPort: true,

    hmr: {
      port: 21340,
      host: 'localhost',
      overlay: true,
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
        target: `http://127.0.0.1:${process.env.DIANA_BINANCE_BACKEND_PORT || '21341'}`,
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