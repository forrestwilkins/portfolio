import react from '@vitejs/plugin-react';
import * as dotenv from 'dotenv';
import { defineConfig } from 'vite';
import dynamicImport from 'vite-plugin-dynamic-import';
import { VitePWA } from 'vite-plugin-pwa';

dotenv.config();

// https://vitejs.dev/config
export default defineConfig({
  root: 'view',
  server: {
    port: parseInt(process.env.CLIENT_PORT || '3000'),
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.SERVER_PORT}/api`,
        rewrite: (path: string) => path.replace(/^\/api/, ''),
        changeOrigin: true,
      },
      // '/ws': {
      //   target: `ws://localhost:${process.env.SERVER_PORT}/ws`,
      //   changeOrigin: true,
      //   ws: true,
      // },
    },
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
