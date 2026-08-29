import node from '@astrojs/node';
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
    bodySizeLimit: 32 * 1024,
  }),
  session: false,
  compressHTML: true,
  server: {
    host: true,
    port: 4321,
  },
});
