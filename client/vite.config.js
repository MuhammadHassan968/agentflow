import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite Configuration
 * Configures the development server and API proxy to forward /api requests
 * directly to our Express backend running on http://localhost:5000.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
