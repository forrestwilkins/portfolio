import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dynamicImport from 'vite-plugin-dynamic-import';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config
export default defineConfig({
  root: 'view',
  server: {
    port: 3000,
  },
  build: {
    outDir: '../dist/view',
  },
  plugins: [
    dynamicImport({
      filter(id) {
        if (id.includes('./node_modules/tone')) {
          return true;
        }
      },
    }),
    VitePWA({
      srcDir: 'view',
      registerType: 'autoUpdate',
      manifest: {
        name: 'rhizome',
        short_name: 'rhizome',
        description: 'An interactive art piece',
        theme_color: '#000000',
        orientation: 'portrait',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
    react(),
  ],
});
