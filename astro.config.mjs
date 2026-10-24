// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// SITE_URL vem do ambiente; sem domínio confirmado o site fica em noindex.
const site = process.env.SITE_URL;

const F = './src/styles/fonts';

export default defineConfig({
  ...(site ? { site } : {}),
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  // Fontes self-hosted (OFL), subset latino, font-display swap. Escolha: docs/DESIGN_SYSTEM.md.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Libre Caslon Display',
      cssVariable: '--f-caslon',
      fallbacks: ['Georgia', 'serif'],
      options: {
        variants: [
          {
            src: [`${F}/libre-caslon-display-latin-400-normal.woff2`],
            weight: 400,
            style: 'normal',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Schibsted Grotesk',
      cssVariable: '--f-schibsted',
      fallbacks: ['Arial', 'sans-serif'],
      options: {
        variants: [
          {
            src: [`${F}/schibsted-grotesk-latin-wght-normal.woff2`],
            weight: '400 900',
            style: 'normal',
          },
          {
            src: [`${F}/schibsted-grotesk-latin-wght-italic.woff2`],
            weight: '400 900',
            style: 'italic',
          },
        ],
      },
    },
    // Alternativas testadas na sessão 3 (só a página /_estilo carrega).
    {
      provider: fontProviders.local(),
      name: 'DM Serif Display',
      cssVariable: '--f-dmserif',
      fallbacks: ['Georgia', 'serif'],
      options: {
        variants: [
          { src: [`${F}/dm-serif-display-latin-400-normal.woff2`], weight: 400, style: 'normal' },
          { src: [`${F}/dm-serif-display-latin-400-italic.woff2`], weight: 400, style: 'italic' },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Inter Tight',
      cssVariable: '--f-intertight',
      fallbacks: ['Arial', 'sans-serif'],
      options: {
        variants: [
          { src: [`${F}/inter-tight-latin-wght-normal.woff2`], weight: '100 900', style: 'normal' },
        ],
      },
    },
  ],
});
