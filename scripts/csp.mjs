// CSP por hash, página a página (roda no postbuild, depois das auditorias de texto).
// Para cada HTML do dist/: calcula o SHA-256 de cada <script> inline executável (JSON-LD não
// executa e fica de fora) e injeta <meta http-equiv="Content-Security-Policy"> logo depois do
// <meta charset>. Sem 'unsafe-inline' em script-src: só os scripts deste build rodam.
// O cabeçalho HTTP (vercel.json) completa com o que <meta> não pode: frame-ancestors.
// - style-src 'unsafe-inline': o CSS é embutido de propósito (LCP) e há style="" (LQIP, --i);
//   CSS não executa código, e o risco fica contido por script-src.
// - frame-src só o Google, para o mapa interativo (que só carrega depois do "Aceitar").
// - connect-src: o próprio site, mais a origem da medição se PUBLIC_MEDICAO_URL for absoluta.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DIST = resolve(process.argv.find((a) => a.startsWith('--dist='))?.slice(7) ?? 'dist');
const medicao = process.env.PUBLIC_MEDICAO_URL?.trim();
const origemMedicao = medicao && /^https?:\/\//.test(medicao) ? new URL(medicao).origin : null;

function* htmls(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) {
      if (n !== 'media' && n !== '_astro') yield* htmls(p);
    } else if (n.endsWith('.html')) yield p;
  }
}

const EXECUTAVEL = /^(|text\/javascript|module|application\/javascript)$/;
let paginas = 0;
let scripts = 0;
for (const arquivo of htmls(DIST)) {
  let html = readFileSync(arquivo, 'utf8');
  html = html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/g, '');
  const hashes = new Set();
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)) {
    const tipo = m[1].match(/type="([^"]*)"/)?.[1] ?? '';
    if (!EXECUTAVEL.test(tipo)) continue;
    hashes.add(`'sha256-${createHash('sha256').update(m[2], 'utf8').digest('base64')}'`);
  }
  const politica = [
    "default-src 'self'",
    `script-src 'self' ${[...hashes].join(' ')}`.trim(),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "media-src 'self'",
    `connect-src 'self'${origemMedicao ? ` ${origemMedicao}` : ''}`,
    'frame-src https://www.google.com',
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
  const meta = `<meta http-equiv="Content-Security-Policy" content="${politica}">`;
  if (!/<meta charset="utf-8"\s*\/?>/i.test(html))
    throw new Error(`${arquivo}: sem <meta charset>`);
  html = html.replace(/(<meta charset="utf-8"\s*\/?>)/i, `$1${meta}`);
  writeFileSync(arquivo, html);
  paginas++;
  scripts += hashes.size;
}
console.log(`[csp] ${paginas} páginas com CSP por hash (${scripts} scripts inline com hash).`);
