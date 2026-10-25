// Preload da imagem do LCP, página a página (postbuild, antes do CSP).
// A imagem marcada como prioridade (fetchpriority="high") fica no meio do HTML; o preload no
// <head> faz o navegador pedi-la junto com o primeiro pedaço do documento. Usa o srcset AVIF do
// próprio <picture>, com o mesmo sizes: o navegador escolhe a mesma variante e não baixa duas.
// Páginas que já têm preload de imagem (a home) ficam como estão.
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DIST = resolve(process.argv.find((a) => a.startsWith('--dist='))?.slice(7) ?? 'dist');

function* htmls(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) {
      if (n !== 'media' && n !== '_astro') yield* htmls(p);
    } else if (n.endsWith('.html')) yield p;
  }
}

let n = 0;
for (const arquivo of htmls(DIST)) {
  let html = readFileSync(arquivo, 'utf8');
  if (/<link rel="preload" as="image"/.test(html)) continue;
  const picture = [...html.matchAll(/<picture[\s\S]*?<\/picture>/g)]
    .map((m) => m[0])
    .find((p) => /<img[^>]*fetchpriority="high"/.test(p));
  if (!picture) continue;
  const fonte = picture.match(/<source type="image\/avif" srcset="([^"]+)" sizes="([^"]+)"/);
  if (!fonte) continue;
  const link = `<link rel="preload" as="image" type="image/avif" imagesrcset="${fonte[1]}" imagesizes="${fonte[2]}" fetchpriority="high">`;
  // Logo depois do preload da fonte (antes do CSS embutido); sem ele, no fim do <head>.
  const fonteFonte = html.match(/<link rel="preload"[^>]*as="font"[^>]*>/)?.[0];
  html = fonteFonte
    ? html.replace(fonteFonte, `${fonteFonte}${link}`)
    : html.replace('</head>', `${link}</head>`);
  writeFileSync(arquivo, html);
  n++;
}
console.log(`[preload-lcp] ${n} páginas com preload da imagem do LCP.`);
