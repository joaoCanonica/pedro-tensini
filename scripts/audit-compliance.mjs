// Auditoria do HTML gerado: termos vetados, preço sem fonte, mídia naoUsar e links wa.me.
// Preview: só alerta. Produção: falha.
// Uso: pnpm audit-compliance [--dist=dist] [--modo=producao|preview]
//      pnpm audit-compliance --textos   (textos-fonte em src/content/textos; falha sempre)
import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { basename, join, relative, resolve } from 'node:path';
import { modo as modoEnv } from '../src/config/seo.ts';
import { combos, servicos } from '../src/config/servicos.ts';
import { numeroWhatsApp } from '../src/lib/whatsapp.ts';
import { auditarHtml, auditarTextoMd } from './lib/compliance.mjs';

const RAIZ = new URL('../', import.meta.url).pathname;
const arg = (n) => process.argv.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const dist = resolve(RAIZ, arg('dist') ?? 'dist');
const argModo = arg('modo');
const modo = argModo === 'producao' || argModo === 'preview' ? argModo : modoEnv;

const manifesto = JSON.parse(await readFile(join(RAIZ, 'media.manifest.json'), 'utf8'));
const vetadosOriginais = manifesto.originais.filter((o) => o.naoUsar);
const precosConfirmados = new Set(
  [
    ...servicos.map((s) => s.preco),
    ...(combos.estado === 'confirmado' ? combos.valor.map((c) => c.preco) : []),
  ]
    .filter((p) => p.estado === 'confirmado')
    .flatMap((p) => [p.valor.de, ...(p.valor.ate ? [p.valor.ate] : [])]),
);
const ctx = {
  precosConfirmados,
  idsAtivos: new Set(manifesto.derivados.filter((d) => !d.naoUsar).map((d) => d.id)),
  idsVetados: new Set([
    ...vetadosOriginais.map((o) => o.id),
    ...manifesto.derivados.filter((d) => d.naoUsar).map((d) => d.id),
  ]),
  // Nomes de arquivo dos originais vetados (ex.: colagem, logo raster).
  nomesOriginais: vetadosOriginais.map((o) => basename(o.arquivo)),
  numero: numeroWhatsApp,
};

// Textos-fonte: falha em qualquer modo (é conteúdo, não deploy).
if (process.argv.includes('--textos')) {
  const pasta = join(RAIZ, 'src/content/textos');
  const nomes = (await readdir(pasta)).filter((n) => n.endsWith('.md')).sort();
  const achados = [];
  for (const nome of nomes) {
    const md = await readFile(join(pasta, nome), 'utf8');
    for (const p of auditarTextoMd(md, ctx)) achados.push({ arquivo: nome, ...p });
  }
  console.log(`[compliance] textos: ${nomes.length} arquivos em src/content/textos/`);
  for (const p of achados) console.log(`[compliance] ${p.trava}: ${p.arquivo}: ${p.detalhe}`);
  if (achados.length) {
    console.error(`[compliance] TEXTOS COM PROBLEMA: ${achados.length}.`);
    process.exit(1);
  }
  console.log(
    '[compliance] ok: textos sem termo vetado, sem preço sem fonte, citações com fonte, metas no tamanho.',
  );
  process.exit(0);
}

if (!existsSync(dist)) {
  console.error(`[compliance] ${relative(RAIZ, dist)}/ não existe. Rode pnpm build.`);
  process.exit(1);
}

async function* arquivos(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (relative(dist, p) === 'media') continue; // derivados binários: conferidos pelo media:prepare
      yield* arquivos(p);
    } else if (/\.(html|js|mjs|css|json|xml|txt|webmanifest)$/.test(e.name)) yield p;
  }
}

let total = 0;
const problemas = [];
for await (const arq of arquivos(dist)) {
  total++;
  const conteudo = await readFile(arq, 'utf8');
  // Termos e preços só no HTML; mídia e WhatsApp em todo arquivo de texto.
  const achados = arq.endsWith('.html')
    ? auditarHtml(conteudo, ctx)
    : auditarHtml(conteudo, ctx).filter(
        (p) => p.trava === 'midia-nao-usar' || p.trava === 'whatsapp',
      );
  for (const p of achados) problemas.push({ arquivo: relative(dist, arq), ...p });
}

console.log(`[compliance] modo: ${modo} · ${total} arquivos em ${relative(RAIZ, dist)}/`);
for (const p of problemas) console.log(`[compliance] ${p.trava}: ${p.arquivo}: ${p.detalhe}`);
if (!problemas.length) console.log('[compliance] ok: nada encontrado.');
else if (modo === 'producao') {
  console.error(`[compliance] PRODUÇÃO BLOQUEADA: ${problemas.length} problema(s).`);
  process.exit(1);
} else console.log(`[compliance] preview: ${problemas.length} alerta(s), sem bloquear.`);
