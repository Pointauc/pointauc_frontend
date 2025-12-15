import path from 'path';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import { analyzer } from 'vite-bundle-analyzer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    svgr(),
    tsconfigPaths(),
    {
      name: 'full-reload',
      handleHotUpdate({ server }) {
        server.ws.send({ type: 'full-reload' });
        return [];
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
    port: 3000,
    open: true,
    proxy: {
      '^/api.*': 'http://localhost:8000',
    },
  },
});
