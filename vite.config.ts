import dynamicImport from 'vite-plugin-dynamic-import';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dynamicImport({
      filter(id) {
        if (id.includes('./node_modules/tone')) {
          return true;
        }
      },
    }),
    react(),
  ],

  server: {
    port: 3000,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
