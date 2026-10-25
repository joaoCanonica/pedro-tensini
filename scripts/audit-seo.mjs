// Auditoria de SEO local e GEO sobre o dist/ (roda no postbuild). Falha (código 1) se:
// - faltar meta básica (lang pt-BR, title, description, Open Graph 1200×630) ou houver hreflang;
// - robots/canonical/sitemap/robots.txt não baterem com `indexar` (prévia = noindex);
// - o JSON-LD for inválido, faltar o exigido pelo Google para negócio local, aparecer
//   AggregateRating/Review (autosservido) ou priceRange sem tabela confirmada;
// - o NAP divergir: texto visível = JSON-LD = config;
// - a página não abrir com o parágrafo-resposta (Lages perto do topo);
// - o FAQPage não for o espelho das perguntas visíveis; o BreadcrumbList não bater com a trilha;
// - o llms.txt não trouxer nome, endereço, horário, WhatsApp e as páginas.
// Uso: pnpm build (ou: node scripts/audit-seo.mjs [--dist=dist])
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import sharp from 'sharp';
import Validador from '@adobe/structured-data-validator';
import Extrator from '@marbec/web-auto-extractor';
import { nap, ruaCompleta } from '../src/components/seo/entidade.ts';
import { PAGINAS } from '../src/components/seo/paginas.ts';
import { OG } from '../src/components/seo/og.ts';
import { resumoSemana } from '../src/components/base/semana.ts';
import { indexar, siteUrl } from '../src/config/seo.ts';
import { precoExibivel, servicos } from '../src/config/servicos.ts';
import { profissional } from '../src/config/marca.ts';
import { whatsapp } from '../src/config/contato.ts';

const arg = (n) => process.argv.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const DIST = resolve(arg('dist') ?? 'dist');
const falhas = [];
const falha = (onde, msg) => falhas.push(`${onde}: ${msg}`);
const avisos = [];
let urlsRelativas = 0;

const TIPOS_PERMITIDOS = new Set([
  'HairSalon',
  'PostalAddress',
  'GeoCoordinates',
  'OpeningHoursSpecification',
  'City',
  'Person',
  'OfferCatalog',
  'Offer',
  'PriceSpecification',
  'Service',
  'BreadcrumbList',
  'ListItem',
  'FAQPage',
  'Question',
  'Answer',
]);
const PROIBIDOS = ['AggregateRating', 'Review', 'aggregateRating', 'review', 'reviews'];

const semAcento = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '');
const texto = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
const meta = (html, chave) =>
  html.match(new RegExp(`<meta (?:name|property)="${chave}" content="([^"]*)"`))?.[1] ?? null;
const digitos = (t) => (t ?? '').replace(/\D/g, '');

/** Percorre o JSON-LD inteiro (objetos aninhados). */
function* nos(x) {
  if (Array.isArray(x)) for (const i of x) yield* nos(i);
  else if (x && typeof x === 'object') {
    yield x;
    for (const v of Object.values(x)) yield* nos(v);
  }
}

const tabelaConfirmada = servicos.every((s) => precoExibivel(s));
const nomePedro = profissional.nome.valor;
const telefoneConfig = digitos(whatsapp.valor);
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

for (const pag of PAGINAS) {
  const arquivo = join(DIST, pag.rota === '/' ? 'index.html' : `${pag.rota.slice(1)}index.html`);
  const onde = pag.rota;
  if (!existsSync(arquivo)) {
    falha(onde, `não gerada (${arquivo})`);
    continue;
  }
  const html = readFileSync(arquivo, 'utf8');

  // —— Regras do Google para dados estruturados (validador da Adobe, offline): erro derruba,
  // aviso é listado. Complementa a conferência abaixo, que cobre negócio local e NAP. ——
  const extraido = new Extrator({ addLocation: true, embedSource: ['rdfa', 'microdata'] }).parse(
    html,
  );
  for (const r of await new Validador().validate(extraido)) {
    const msg = `${r.issueMessage} @ ${JSON.stringify(r.path)}`;
    if (r.severity === 'ERROR') falha(onde, `dados estruturados: ${msg}`);
    // Sem SITE_URL as URLs do JSON-LD são relativas: aviso esperado na prévia, contado à parte.
    else if (!siteUrl && /Invalid URL/.test(r.issueMessage)) urlsRelativas++;
    else avisos.push(`${onde}: ${msg}`);
  }

  // —— Metas ——
  if (!/<html lang="pt-BR"/.test(html)) falha(onde, 'html sem lang="pt-BR"');
  const cabeca = html.match(/<head>[\s\S]*?<\/head>/)?.[0] ?? '';
  if ((cabeca.match(/<title>/g) ?? []).length !== 1) falha(onde, 'title ausente ou duplicado');
  const desc = meta(html, 'description');
  if (!desc) falha(onde, 'meta description ausente');
  else if (desc.length > 160) falha(onde, `description com ${desc.length} caracteres (> 160)`);
  if (/hreflang/i.test(html)) falha(onde, 'hreflang presente (o site é só pt-BR)');
  for (const k of ['og:title', 'og:description', 'og:image', 'og:locale', 'twitter:card'])
    if (!meta(html, k)) falha(onde, `${k} ausente`);
  if (meta(html, 'og:locale') !== 'pt_BR') falha(onde, 'og:locale diferente de pt_BR');
  if (
    meta(html, 'og:image:width') !== String(OG.largura) ||
    meta(html, 'og:image:height') !== String(OG.altura)
  )
    falha(onde, 'og:image sem 1200×630 declarado');
  const robots = meta(html, 'robots') ?? '';
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? null;
  if (indexar) {
    if (!/^index/.test(robots)) falha(onde, `robots "${robots}" com indexar = true`);
    if (canonical !== `${siteUrl}${pag.rota}`)
      falha(onde, `canonical "${canonical}" ≠ ${siteUrl}${pag.rota}`);
    if (meta(html, 'og:url') !== `${siteUrl}${pag.rota}`)
      falha(onde, 'og:url diferente do canonical');
    if (!/^https?:\/\//.test(meta(html, 'og:image') ?? '')) falha(onde, 'og:image não é absoluta');
  } else if (!/noindex/.test(robots)) falha(onde, `prévia sem noindex (robots "${robots}")`);

  // —— JSON-LD ——
  const blocos = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      blocos.push(JSON.parse(m[1]));
    } catch (e) {
      falha(onde, `JSON-LD inválido: ${e.message}`);
    }
  }
  const todos = [...nos(blocos)];
  for (const b of blocos)
    if (b['@context'] !== 'https://schema.org')
      falha(onde, 'JSON-LD sem @context https://schema.org');
  for (const n of todos) {
    const tipo = n['@type'];
    if (tipo && !TIPOS_PERMITIDOS.has(tipo)) falha(onde, `tipo inesperado no JSON-LD: ${tipo}`);
    for (const p of PROIBIDOS)
      if (p in n || tipo === p)
        falha(onde, `${p} no JSON-LD (avaliação autosservida não vale no Google)`);
  }
  const negocio = blocos.find((b) => b['@type'] === 'HairSalon');
  if (!negocio) falha(onde, 'sem o negócio (HairSalon) no JSON-LD');
  else {
    // Google, negócio local: obrigatórios name e address; recomendados geo, telefone, horário, url.
    const a = negocio.address ?? {};
    for (const k of [
      'streetAddress',
      'addressLocality',
      'addressRegion',
      'postalCode',
      'addressCountry',
    ])
      if (!a[k]) falha(onde, `address.${k} ausente`);
    if (!negocio.name) falha(onde, 'name ausente');
    if (typeof negocio.geo?.latitude !== 'number' || typeof negocio.geo?.longitude !== 'number')
      falha(onde, 'geo sem latitude/longitude numéricas');
    if (!negocio.telephone) falha(onde, 'telephone ausente');
    const horas = negocio.openingHoursSpecification ?? [];
    if (!horas.length) falha(onde, 'openingHoursSpecification ausente');
    for (const h of horas) {
      if (!HHMM.test(h.opens ?? '') || !HHMM.test(h.closes ?? ''))
        falha(onde, 'horário fora de HH:MM');
      if (!h.dayOfWeek && !h.validFrom) falha(onde, 'horário sem dayOfWeek nem validFrom');
    }
    if (siteUrl && !negocio.url) falha(onde, 'url ausente com SITE_URL definido');
    if ('priceRange' in negocio && !tabelaConfirmada)
      falha(onde, 'priceRange sem tabela de preços confirmada');
    if (JSON.stringify(negocio).toLowerCase().includes('visagismo'))
      falha(onde, 'visagismo no JSON-LD sem confirmação');

    // —— NAP: JSON-LD = config ——
    if (negocio.name !== nap.nome) falha(onde, `name "${negocio.name}" ≠ config "${nap.nome}"`);
    if (a.streetAddress !== ruaCompleta)
      falha(onde, `streetAddress "${a.streetAddress}" ≠ "${ruaCompleta}"`);
    if (a.addressLocality !== nap.cidade || a.addressRegion !== nap.uf || a.postalCode !== nap.cep)
      falha(onde, 'cidade/UF/CEP do JSON-LD diferente da config');
    if (digitos(negocio.telephone) !== telefoneConfig) falha(onde, 'telephone do JSON-LD ≠ config');
  }

  // —— NAP: texto visível = config ——
  const enderecos = [
    ...html.matchAll(/<address class="endereco[^"]*"[^>]*>([\s\S]*?)<\/address>/g),
  ].map((m) => texto(m[1]));
  if (!enderecos.length) falha(onde, 'nenhum endereço visível (<address class="endereco">)');
  for (const e of enderecos) {
    const partes = [
      nap.rua,
      nap.complemento,
      nap.bairro,
      `${nap.cidade}/${nap.uf}`,
      `CEP ${nap.cep}`,
    ];
    if (nap.salaAndar) partes.push(nap.salaAndar);
    if (nap.numero) partes.push(nap.numero);
    for (const p of partes) if (!e.includes(p)) falha(onde, `endereço visível sem "${p}": "${e}"`);
  }
  const visivel = texto(html);
  if (!visivel.includes(nap.telefone)) falha(onde, `telefone visível "${nap.telefone}" ausente`);
  const rodape = html.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? '';
  if (!texto(rodape).includes(nap.nome)) falha(onde, `rodapé sem o nome canônico "${nap.nome}"`);

  // —— Parágrafo-resposta perto do topo ——
  const principal = texto(html.match(/<main[\s\S]*?<\/main>/)?.[0] ?? '');
  const topo = principal.slice(0, 2200);
  if (!/Lages/.test(topo) || !(topo.includes(nomePedro) || topo.includes(nap.nome)))
    falha(onde, 'sem parágrafo-resposta no topo (nome e Lages nos primeiros parágrafos)');

  // —— BreadcrumbList = trilha visível ——
  const trilhaVisivel = [
    ...(html.match(/<nav class="trilha"[\s\S]*?<\/nav>/)?.[0] ?? '').matchAll(
      /<li[^>]*>([\s\S]*?)<\/li>/g,
    ),
  ].map((m) => texto(m[1]));
  const bc = blocos.find((b) => b['@type'] === 'BreadcrumbList');
  if (pag.rota !== '/') {
    if (!bc) falha(onde, 'sem BreadcrumbList');
    else {
      const itens = bc.itemListElement ?? [];
      itens.forEach((it, i) => {
        if (it.position !== i + 1) falha(onde, `BreadcrumbList position ${it.position} ≠ ${i + 1}`);
        if (!it.name || !it.item) falha(onde, 'ListItem sem name ou item');
        if (siteUrl && !/^https?:\/\//.test(it.item ?? ''))
          falha(onde, 'ListItem.item não absoluto');
      });
      const nomes = itens.map((i) => i.name);
      if (JSON.stringify(nomes) !== JSON.stringify(trilhaVisivel))
        falha(
          onde,
          `BreadcrumbList ${JSON.stringify(nomes)} ≠ trilha visível ${JSON.stringify(trilhaVisivel)}`,
        );
    }
  }

  // —— FAQPage só nas perguntas, espelho do visível ——
  const faq = blocos.find((b) => b['@type'] === 'FAQPage');
  if (pag.rota === '/perguntas-frequentes/') {
    const resumos = [...html.matchAll(/<summary[^>]*>([\s\S]*?)<\/summary>/g)].map((m) =>
      texto(m[1]),
    );
    if (!faq) falha(onde, 'sem FAQPage');
    else {
      const q = faq.mainEntity ?? [];
      if (q.length !== resumos.length)
        falha(onde, `FAQPage com ${q.length} perguntas; página com ${resumos.length}`);
      q.forEach((x, i) => {
        if (x['@type'] !== 'Question' || x.name !== resumos[i])
          falha(onde, `pergunta ${i + 1} ≠ visível`);
        const r = x.acceptedAnswer?.text ?? '';
        if (x.acceptedAnswer?.['@type'] !== 'Answer' || !r)
          falha(onde, `pergunta ${i + 1} sem Answer.text`);
        else if (!semAcento(visivel).includes(semAcento(r.slice(0, 60))))
          falha(onde, `resposta ${i + 1} não está visível na página`);
      });
    }
  } else if (faq) falha(onde, 'FAQPage fora da página de perguntas');

  // —— Service nas páginas de serviço ——
  for (const s of blocos.filter((b) => b['@type'] === 'Service')) {
    if (s.provider?.['@id'] !== negocio?.['@id'])
      falha(onde, `Service "${s.name}" sem provider = negócio`);
    if (
      s.offers &&
      !tabelaConfirmada &&
      !servicos.some((x) => x.nome === s.name && precoExibivel(x))
    )
      falha(onde, `Service "${s.name}" com preço não confirmado`);
  }
}

// —— Fora das páginas ——
const ler = (f) => (existsSync(join(DIST, f)) ? readFileSync(join(DIST, f), 'utf8') : null);
const llms = ler('llms.txt');
if (!llms) falha('llms.txt', 'não gerado');
else {
  if (!llms.startsWith(`# ${nap.nome}\n`)) falha('llms.txt', 'não começa com "# nome canônico"');
  if (!/\n> .+/.test(llms)) falha('llms.txt', 'sem a citação-resumo (> …)');
  for (const t of [
    ruaCompleta,
    nap.cep,
    resumoSemana(),
    nap.telefone,
    `wa.me/${telefoneConfig}`,
    nomePedro,
  ])
    if (!llms.includes(t)) falha('llms.txt', `sem "${t}"`);
  for (const p of PAGINAS)
    if (!llms.includes(`(${siteUrl ?? ''}${p.rota})`)) falha('llms.txt', `sem link para ${p.rota}`);
}
const robotsTxt = ler('robots.txt') ?? '';
const sitemap = ler('sitemap.xml') ?? '';
if (!robotsTxt) falha('robots.txt', 'não gerado');
if (/^Disallow: \/\s*$/m.test(robotsTxt))
  falha('robots.txt', '"Disallow: /" esconderia o noindex e o site');
if (indexar) {
  if (!robotsTxt.includes(`Sitemap: ${siteUrl}/sitemap.xml`))
    falha('robots.txt', 'sem a linha Sitemap');
  for (const p of PAGINAS)
    if (!sitemap.includes(`<loc>${siteUrl}${p.rota}</loc>`)) falha('sitemap.xml', `sem ${p.rota}`);
  if (/_estilo|404/.test(sitemap)) falha('sitemap.xml', 'lista página interna ou 404');
} else {
  if (/Sitemap:/.test(robotsTxt)) falha('robots.txt', 'prévia anunciando sitemap');
  if (/<url>/.test(sitemap)) falha('sitemap.xml', 'prévia com URLs');
}
const og = join(DIST, OG.caminho.slice(1));
if (!existsSync(og)) falha('og', `${OG.caminho} não gerada`);
else {
  const m = await sharp(og).metadata();
  if (m.width !== OG.largura || m.height !== OG.altura)
    falha('og', `${m.width}×${m.height} ≠ 1200×630`);
}

const modo = indexar ? 'indexável' : 'prévia (noindex)';
console.log(
  `[audit-seo] ${PAGINAS.length} páginas · ${modo}${siteUrl ? ` · ${siteUrl}` : ' · sem SITE_URL'}`,
);
for (const a of avisos) console.warn(`[audit-seo] aviso ${a}`);
if (urlsRelativas)
  console.log(
    `[audit-seo] ${urlsRelativas} URL(s) relativas no JSON-LD: esperado sem SITE_URL; com o domínio viram absolutas.`,
  );
if (falhas.length) {
  for (const f of falhas) console.error(`[audit-seo] FALHA ${f}`);
  console.error(`[audit-seo] ${falhas.length} falha(s).`);
  process.exit(1);
}
console.log(
  '[audit-seo] ok: metas, JSON-LD, NAP (visível = JSON-LD = config), resposta no topo, llms.txt, robots e sitemap.',
);
