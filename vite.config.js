import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/Finance-master/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'offline.html'],
      manifest: false, // we use public/manifest.json directly
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/Finance-master/index.html',
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/accounts\.google\.com/,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/script\.google\.com/,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
})
