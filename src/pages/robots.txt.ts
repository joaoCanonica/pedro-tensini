// robots.txt gerado no build.
// - Preview (indexar = false): libera o rastreio para que o noindex de cada página seja lido
//   (um Disallow esconderia o noindex), e não anuncia sitemap.
// - Produção com domínio (indexar = true): libera tudo, inclusive os rastreadores de busca das
//   IAs, e aponta o sitemap.
import type { APIRoute } from 'astro';
import { indexar, siteUrl } from '../config/seo.ts';

/** Rastreadores de busca e de IA liberados de forma explícita (o * já libera; isto documenta). */
const IAS = [
  'Googlebot',
  'Bingbot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  'PerplexityBot',
  'ClaudeBot',
  'Claude-SearchBot',
  'Google-Extended',
  'Applebot',
];

export const GET: APIRoute = () => {
  const texto =
    indexar && siteUrl
      ? [
          ...IAS.flatMap((ua) => [`User-agent: ${ua}`, 'Allow: /', '']),
          'User-agent: *',
          'Allow: /',
          'Disallow: /_estilo/',
          '',
          `Sitemap: ${siteUrl}/sitemap.xml`,
          '',
        ].join('\n')
      : [
          '# Prévia: as páginas levam noindex. Sem sitemap até o site ir ao ar.',
          'User-agent: *',
          'Allow: /',
          '',
        ].join('\n');
  return new Response(texto, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
