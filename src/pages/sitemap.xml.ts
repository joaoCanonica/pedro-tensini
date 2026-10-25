// sitemap.xml gerado no build. Só lista páginas quando o site é indexável e tem domínio
// (URLs absolutas); na prévia sai vazio e o robots.txt não o anuncia.
import type { APIRoute } from 'astro';
import { indexar, siteUrl } from '../config/seo.ts';
import { PAGINAS } from '../components/seo/paginas.ts';

export const GET: APIRoute = () => {
  const hoje = new Date().toISOString().slice(0, 10);
  const urls =
    indexar && siteUrl
      ? PAGINAS.map((p) => `  <url><loc>${siteUrl}${p.rota}</loc><lastmod>${hoje}</lastmod></url>`)
      : [];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
