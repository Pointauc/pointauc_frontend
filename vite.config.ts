import path from 'path';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import { analyzer } from 'vite-bundle-analyzer';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    svgr(),
    tsconfigPaths(),
    {
      name: 'full-reload',
      handleHotUpdate({ file, server }) {
        if (/\.(scss|css)$/.test(file)) {
          server.ws.send({ type: 'full-reload' });
          return [];
        }
      },
    },
    // Bundle analyzer - only runs when ANALYZE env variable is set
    ...(process.env.ANALYZE === 'true' ? [analyzer()] : []),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `@use "${path.join(process.cwd(), 'src/_mantine').replace(/\\/g, '/')}" as mantine;`,
      },
    },
  },
  server: {
    host: true,
    port: 3000,
    open: true,
    proxy: {
      '^/api.*': 'http://localhost:8000',
      '/socket.io': {
        target: 'http://localhost:8000',
        ws: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router', 'react-router-dom', 'react-redux'],
          'vendor-mantine': [
            '@mantine/core',
            '@mantine/hooks',
            '@mantine/notifications',
            '@mantine/modals',
            '@mantine/dropzone',
          ],
          'vendor-animation': ['framer-motion', 'gsap'],
          'vendor-mui-icons': ['@mui/icons-material'],
        },
      },
    },
  },
  ssr: {
    // Bundle all dependencies into the SSR bundle so Vite handles CJS→ESM
    // conversion for each package. This is appropriate for a build-time
    // prerender script (not a production server), where bundle size doesn't matter.
    noExternal: true,
  },
});
