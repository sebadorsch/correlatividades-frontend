import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
    },
  },
  // En desarrollo, /api va al back local (en producción lo hace vercel.json).
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
