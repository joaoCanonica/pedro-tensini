// @ts-check
import { defineConfig } from 'astro/config';

// SITE_URL vem do ambiente; sem domínio confirmado o site fica em noindex.
const site = process.env.SITE_URL;

export default defineConfig({
  ...(site ? { site } : {}),
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
