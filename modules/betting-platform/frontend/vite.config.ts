import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 21300,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});