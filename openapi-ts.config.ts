import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: './client-api.json',
  output: 'src/api/openapi',
  plugins: [
    {
      name: '@hey-api/client-axios',
      baseUrl: '/api',
    },
    '@hey-api/typescript',
    '@tanstack/react-query',
  ],
});
