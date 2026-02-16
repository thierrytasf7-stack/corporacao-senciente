import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import viteLoggerPlugin from './vite-logger-plugin.js'

// Configuração otimizada para desenvolvimento com HMR dinâmico
export default defineConfig({
    plugins: [react(), viteLoggerPlugin()],
    server: {
        port: 13000,
        host: '0.0.0.0',
        strictPort: true,

        // HMR otimizado para mudanças instantâneas
        hmr: {
            port: 13000,
            host: 'localhost',
            overlay: true,
            clientPort: 13000,
        },

        // Watch otimizado com polling AGRESSIVO
        watch: {
            usePolling: true,
            interval: 10, // Verifica mudanças a cada 10ms
            ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
        },

        // Configurações de arquivo otimizadas
        fs: {
            strict: false,
            allow: ['..'],
            cachedChecks: false, // Desabilita cache de arquivos
        },

        // Proxy otimizado
        proxy: {
            '/api': {
                target: 'http://localhost:13001',
                changeOrigin: true,
                secure: false,
                ws: true, // Suporte a WebSocket
            },
        },
    },

    // Configurações de cache desabilitadas para desenvolvimento
    cacheDir: false,

    // Otimizações de dependências AGRESSIVAS
    optimizeDeps: {
        force: true,
        include: ['react', 'react-dom', 'react-router-dom'],
        exclude: ['@vite/client', '@vite/env'],
    },

    // Configurações de HMR AGRESSIVAS
    define: {
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: false,
    },

    // Configurações de esbuild AGRESSIVAS
    esbuild: {
        logOverride: { 'this-is-undefined-in-esm': 'silent' },
        target: 'esnext',
    },

    // Configurações de build para desenvolvimento
    build: {
        sourcemap: true,
        minify: false, // Desabilita minificação para debug
    },

    // Configurações de esbuild otimizadas
    esbuild: {
        logOverride: { 'this-is-undefined-in-esm': 'silent' },
    },

    // Configurações de CSS otimizadas
    css: {
        devSourcemap: true,
    },
})
