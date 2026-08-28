import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
 plugins: [
   react(), 
   tailwindcss(),
   VitePWA({
     registerType: 'autoUpdate',
     includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
     manifest: {
       name: 'هبّة الإغاثة',
       short_name: 'هبّة',
       description: 'منصة إدارة الأزمات وتوجيه القوافل والمتطوعين آلياً',
       theme_color: '#dc2626',
       background_color: '#020617',
       display: 'standalone',
       orientation: 'portrait',
       dir: 'rtl',
       lang: 'ar',
       icons: [
         {
           src: 'pwa-192x192.png',
           sizes: '192x192',
           type: 'image/png'
         },
         {
           src: 'pwa-512x512.png',
           sizes: '512x512',
           type: 'image/png'
         },
         {
           src: 'pwa-512x512.png',
           sizes: '512x512',
           type: 'image/png',
           purpose: 'any maskable'
         }
       ]
     },
     workbox: {
       // Only cache necessary files for the app shell, the rest is handled by Firestore offline cache
       globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
       runtimeCaching: [
         {
           // Cache Leaflet map tiles
           urlPattern: /^https:\/\/[a-z]\.tile\.openstreetmap\.org\/.*/i,
           handler: 'StaleWhileRevalidate',
           options: {
             cacheName: 'osm-tiles',
             expiration: {
               maxEntries: 500,
               maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Days
             },
             cacheableResponse: {
               statuses: [0, 200]
             }
           }
         }
       ]
     }
   })
 ],
 build: {
   rollupOptions: {
     output: {
       manualChunks: {
         // React core — loads first, always cached
         'vendor-react': ['react', 'react-dom', 'react-router-dom'],
         // Map library — large, loaded lazily when dashboard is visited
         'vendor-leaflet': ['leaflet', 'react-leaflet'],
         // Charts library — large, loaded lazily
         'vendor-recharts': ['recharts'],
         // Icons — medium, shared across all pages
         'vendor-icons': ['lucide-react'],
       },
     },
   },
   // Raise warning threshold slightly since leaflet is unavoidably large
   chunkSizeWarningLimit: 600,
 },
})
