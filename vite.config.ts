import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { normalizePath } from 'vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(path.join('node_modules', 'cesium', 'Build', 'Cesium', 'Workers')),
          dest: 'cesium/Workers',
        },
        {
          src: normalizePath(path.join('node_modules', 'cesium', 'Build', 'Cesium', 'ThirdParty')),
          dest: 'cesium/ThirdParty',
        },
        {
          src: normalizePath(path.join('node_modules', 'cesium', 'Build', 'Cesium', 'Assets')),
          dest: 'cesium/Assets',
        },
        {
          src: normalizePath(path.join('node_modules', 'cesium', 'Build', 'Cesium', 'Widgets')),
          dest: 'cesium/Widgets',
        },
      ],
    }),
  ],
  base: process.env.VITE_BASE_PATH || '/TGP-Land-Viewer-Claude-/',
  define: {
    CESIUM_BASE_URL: JSON.stringify(
      process.env.NODE_ENV === 'production'
        ? '/TGP-Land-Viewer-Claude-/cesium'
        : '/cesium'
    ),
  },
})
