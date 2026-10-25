// Gera os derivados de mídia em public/media/ a partir de media.manifest.json.
// Idempotente: cada derivado tem uma chave (hash da especificação + hash do original);
// se nada mudou, não refaz. Roda no predev/prebuild.
// Uso: pnpm media:prepare [--force] [--so=<id>] [--catalogo]
import { existsSync } from 'node:fs';
import { cp, mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import {
  RAIZ,
  arredondar,
  carregarManifesto,
  executar,
  ferramentaExiste,
  hashArquivo,
  hashTexto,
  indicesNaJanela,
  quadroPng,
  sondarVideo,
} from './lib/midia.mjs';

// Mude para invalidar todo o cache quando a receita de codificação mudar.
const VERSAO_RECEITA = 1;
const SAIDA = join(RAIZ, 'public/media');
// Cache fora de public/: não pode ir para o site (tem caminhos dos originais).
const CACHE = join(RAIZ, '.cache/media.json');
const INDICE = join(SAIDA, 'media-index.json');
const LARGURAS_IMG = [480, 800, 1200, 1600];
const CRF = {
  video: { mp4: 26, webm: 35 },
  loop: { mp4: 27, webm: 37 },
};

const args = process.argv.slice(2);
const forcar = args.includes('--force');
const so = args.find((a) => a.startsWith('--so='))?.slice(5);
const gerarCatalogo = args.includes('--catalogo');

const inicio = Date.now();
for (const f of ['ffmpeg', 'ffprobe']) {
  if (!(await ferramentaExiste(f))) {
    console.error(
      `[media] ${f} não encontrado. Instale ffmpeg (inclui ffprobe) para gerar os derivados.`,
    );
    process.exit(1);
  }
}

const { manifesto, originais } = await carregarManifesto();
await mkdir(SAIDA, { recursive: true });
await mkdir(join(RAIZ, '.cache'), { recursive: true });
const cache = existsSync(CACHE)
  ? JSON.parse(await readFile(CACHE, 'utf8'))
  : { originais: {}, derivados: {} };

// 1. Originais intactos: o hash tem de bater com o manifesto.
const hashes = new Map();
for (const o of manifesto.originais) {
  const caminho = join(RAIZ, o.arquivo);
  if (!existsSync(caminho)) throw new Error(`[media] original ausente: ${o.arquivo}`);
  const st = await stat(caminho);
  const marca = `${st.size}:${st.mtimeMs}`;
  let hash = cache.originais[o.arquivo]?.marca === marca ? cache.originais[o.arquivo].sha256 : null;
  if (!hash) {
    hash = await hashArquivo(caminho);
    cache.originais[o.arquivo] = { marca, sha256: hash };
  }
  if (hash !== o.sha256)
    throw new Error(`[media] ${o.arquivo} mudou (sha256 diferente do manifesto).`);
  hashes.set(o.id, hash);
}

// 2. Derivados.
const ativos = manifesto.derivados.filter((d) => !d.naoUsar);
const indice = {};
const kb = (b) => (b / 1024).toFixed(0) + ' KB';

for (const d of ativos) {
  const o = originais.get(d.origem);
  const spec = {
    VERSAO_RECEITA,
    tipo: d.tipo,
    natureza: d.natureza,
    trechos: d.trechos,
    audioLiberado: d.audioLiberado,
    video: d.video ?? null,
    quadro: d.quadro ?? null,
    recorte: d.recorte ?? null,
    origem: hashes.get(o.id),
  };
  const chave = hashTexto(JSON.stringify(spec));
  const anterior = cache.derivados[d.id];
  const pasta = join(SAIDA, d.id);
  const pular = so && so !== d.id;
  if (
    anterior &&
    (pular || (!forcar && anterior.chave === chave)) &&
    anterior.arquivos.every((a) => existsSync(join(pasta, a)))
  ) {
    indice[d.id] = anterior.indice;
    if (!pular) console.log(`[media] ${d.id}: em cache`);
    continue;
  }
  if (pular) continue;
  const t0 = Date.now();
  const tmp = join(SAIDA, `.tmp-${d.id}`);
  await rm(tmp, { recursive: true, force: true });
  await mkdir(tmp, { recursive: true });
  const r = await gerar(d, o, tmp);
  await rm(pasta, { recursive: true, force: true });
  await rename(tmp, pasta);
  const entrada = {
    id: d.id,
    origem: d.origem,
    tipo: d.tipo,
    natureza: d.natureza,
    provisorio: Boolean(d.provisorio || d.recorte?.provisorio),
    ...(d.exibicaoMax ? { exibicaoMax: d.exibicaoMax } : {}),
    ...r.indice,
  };
  cache.derivados[d.id] = { chave, arquivos: r.arquivos, indice: entrada };
  indice[d.id] = entrada;
  console.log(
    `[media] ${d.id}: gerado em ${((Date.now() - t0) / 1000).toFixed(1)} s (${r.resumo})`,
  );
}

// 3. Limpeza: nada fora do manifesto (nem de mídia naoUsar) fica em public/media.
const idsAtivos = new Set(ativos.map((d) => d.id));
for (const nome of await readdir(SAIDA)) {
  if (nome === 'media-index.json') continue;
  if (!idsAtivos.has(nome)) {
    await rm(join(SAIDA, nome), { recursive: true, force: true });
    console.log(`[media] removido: public/media/${nome}`);
  }
}
cache.derivados = Object.fromEntries(
  Object.entries(cache.derivados).filter(([id]) => idsAtivos.has(id)),
);

// 4. Trava: nenhum id naoUsar pode existir em public/media.
const vetados = [
  ...manifesto.originais.filter((o) => o.naoUsar).map((o) => o.id),
  ...manifesto.derivados.filter((d) => d.naoUsar).map((d) => d.id),
];
for (const id of vetados) {
  if (existsSync(join(SAIDA, id)) || indice[id])
    throw new Error(`[media] mídia naoUsar publicada: ${id}`);
}
for (const d of ativos) {
  if (originais.get(d.origem).naoUsar) throw new Error(`[media] ${d.id} deriva de mídia naoUsar`);
}

// 5. Índice e cache (só reescreve se mudou, para não tocar no mtime à toa).
const ordenado = Object.fromEntries(
  Object.keys(indice)
    .sort()
    .map((k) => [k, indice[k]]),
);
const textoIndice = JSON.stringify({ versao: 1, itens: ordenado }, null, 2) + '\n';
await escreverSeMudou(INDICE, textoIndice);
await escreverSeMudou(CACHE, JSON.stringify(cache, null, 2) + '\n');

if (gerarCatalogo) await catalogo(ordenado);
console.log(
  `[media] ok: ${Object.keys(ordenado).length} derivados em ${((Date.now() - inicio) / 1000).toFixed(1)} s`,
);

// ————————————————————————————————————————————————————————————

async function escreverSeMudou(caminho, texto) {
  const atual = existsSync(caminho) ? await readFile(caminho, 'utf8') : null;
  if (atual !== texto) await writeFile(caminho, texto);
}

async function gerar(d, o, tmp) {
  const origem = join(RAIZ, o.arquivo);
  if (d.tipo === 'vetor') {
    const nome = `${d.id}.svg`;
    await cp(origem, join(tmp, nome));
    const bytes = (await stat(join(tmp, nome))).size;
    return {
      arquivos: [nome],
      indice: { src: `/media/${d.id}/${nome}`, bytes },
      resumo: kb(bytes),
    };
  }
  if (d.tipo === 'imagem') {
    const { x, y, largura, altura } = d.recorte;
    const buf = await sharp(origem)
      .extract({ left: x, top: y, width: largura, height: altura })
      .png()
      .toBuffer();
    const img = await imagens(buf, d.id, tmp);
    return { arquivos: img.arquivos, indice: { imagem: img.indice }, resumo: img.resumo };
  }
  if (d.tipo === 'quadro') {
    if (d.quadro.t === undefined)
      throw new Error(`[media] ${d.id}: sem quadro.t. Rode pnpm media:stills.`);
    const { fps } = await sondarVideo(origem);
    let buf = await quadroPng(origem, Math.round(d.quadro.t * fps), fps);
    if (d.recorte) {
      const { x, y, largura, altura } = d.recorte;
      buf = await sharp(buf)
        .extract({ left: x, top: y, width: largura, height: altura })
        .png()
        .toBuffer();
    }
    const img = await imagens(buf, d.id, tmp);
    return {
      arquivos: img.arquivos,
      indice: { imagem: img.indice, quadroFonte: d.quadro.t },
      resumo: img.resumo,
    };
  }
  return video(d, origem, tmp);
}

// AVIF + WebP nas larguras padrão (nunca acima do original) + LQIP.
async function imagens(buf, base, tmp, larguras) {
  const { width, height } = await sharp(buf).metadata();
  let lista = larguras ?? LARGURAS_IMG.filter((w) => w <= width);
  if (!larguras && width < LARGURAS_IMG.at(-1) && !lista.includes(width)) lista = [...lista, width];
  const arquivos = [];
  const avif = [];
  const webp = [];
  for (const w of lista) {
    const h = Math.round((height * w) / width);
    const redim = sharp(buf).resize({ width: w });
    for (const [formato, lista_, opcoes] of [
      ['avif', avif, { quality: 55, effort: 6 }],
      ['webp', webp, { quality: 78, effort: 5 }],
    ]) {
      const nome = `${base}-${w}.${formato}`;
      const info = await redim.clone()[formato](opcoes).toFile(join(tmp, nome));
      arquivos.push(nome);
      lista_.push({
        largura: w,
        altura: h,
        src: `/media/${tmp.split('.tmp-')[1]}/${nome}`,
        bytes: info.size,
      });
    }
  }
  const lqipBuf = await sharp(buf).resize({ width: 24 }).webp({ quality: 40 }).toBuffer();
  const maior = avif.at(-1);
  return {
    arquivos,
    indice: {
      largura: width,
      altura: height,
      avif,
      webp,
      lqip: `data:image/webp;base64,${lqipBuf.toString('base64')}`,
    },
    resumo: `AVIF ${avif.map((a) => a.largura).join('/')}: maior ${kb(maior.bytes)}`,
  };
}

async function video(d, origem, tmp) {
  const info = await sondarVideo(origem);
  const { fps } = info;
  const trab = join(tmp, '_trabalho');
  await mkdir(trab);
  const audio = d.audioLiberado;
  const lossless = ['-c:v', 'libx264', '-qp', '0', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p'];
  const audioLossless = audio ? ['-c:a', 'flac'] : ['-an'];

  // a) Trechos concatenados, por índice de quadro.
  const faixas = d.trechos.map((t) => indicesNaJanela(t.in, t.out, fps));
  const N = faixas.reduce((s, [a, b]) => s + (b - a + 1), 0);
  const partes = [];
  const rotulos = [];
  faixas.forEach(([a, b], i) => {
    partes.push(`[0:v]trim=start_frame=${a}:end_frame=${b + 1},setpts=PTS-STARTPTS[v${i}]`);
    rotulos.push(`[v${i}]`);
    if (audio) {
      partes.push(`[0:a]atrim=start=${a / fps}:end=${(b + 1) / fps},asetpts=PTS-STARTPTS[a${i}]`);
      rotulos.push(`[a${i}]`);
    }
  });
  partes.push(
    `${rotulos.join('')}concat=n=${faixas.length}:v=1:a=${audio ? 1 : 0}[x]${audio ? '[xa]' : ''}`,
  );
  const X = join(trab, 'x.mkv');
  await executar('ffmpeg', [
    '-v',
    'error',
    '-y',
    '-i',
    origem,
    '-filter_complex',
    partes.join(';'),
    '-map',
    '[x]',
    ...(audio ? ['-map', '[xa]'] : []),
    ...lossless,
    ...audioLossless,
    X,
  ]);

  // Quadro do pôster no editado.
  const nPoster = Math.round(d.video.poster.t * fps);
  let px = null;
  let acumulado = 0;
  for (const [a, b] of faixas) {
    if (nPoster >= a && nPoster <= b) px = acumulado + (nPoster - a);
    acumulado += b - a + 1;
  }
  if (d.video.poster.t === undefined || px === null)
    throw new Error(`[media] ${d.id}: pôster sem t válido. Rode pnpm media:stills.`);

  let F = X;
  let quadros = N;
  let posterNoFinal = px;
  if (d.video.loop) {
    if (audio) throw new Error(`[media] ${d.id}: loop não leva áudio.`);
    // b) Laço: o fim dissolve no começo; depois gira o laço para começar no pôster.
    const dF = Math.round(d.video.loop.crossfade * fps);
    const L = N - dF;
    const pl = px - dF;
    if (pl < 0 || pl >= N - 2 * dF)
      throw new Error(`[media] ${d.id}: pôster cai na zona do crossfade.`);
    const laco = join(trab, 'laco.mkv');
    const dur = dF / fps;
    await executar('ffmpeg', [
      '-v',
      'error',
      '-y',
      '-i',
      X,
      '-filter_complex',
      [
        '[0:v]split=3[h][b][t]',
        `[h]trim=start_frame=0:end_frame=${dF},setpts=PTS-STARTPTS[h2]`,
        `[b]trim=start_frame=${dF}:end_frame=${N - dF},setpts=PTS-STARTPTS[b2]`,
        `[t]trim=start_frame=${N - dF}:end_frame=${N},setpts=PTS-STARTPTS[t2]`,
        `[t2][h2]xfade=transition=fade:duration=${dur}:offset=0[xf]`,
        '[b2][xf]concat=n=2:v=1:a=0[l]',
      ].join(';'),
      '-map',
      '[l]',
      ...lossless,
      '-an',
      laco,
    ]);
    F = laco;
    if (pl > 0) {
      const girado = join(trab, 'girado.mkv');
      await executar('ffmpeg', [
        '-v',
        'error',
        '-y',
        '-i',
        laco,
        '-filter_complex',
        `[0:v]split[a][b];[a]trim=start_frame=${pl},setpts=PTS-STARTPTS[a2];[b]trim=end_frame=${pl},setpts=PTS-STARTPTS[b2];[a2][b2]concat=n=2:v=1:a=0[r]`,
        '-map',
        '[r]',
        ...lossless,
        '-an',
        girado,
      ]);
      F = girado;
    }
    quadros = L;
    posterNoFinal = 0;
  }
  const real = await sondarVideo(F);
  if (real.quadros !== quadros && !Number.isNaN(real.quadros))
    console.warn(`[media] ${d.id}: esperado ${quadros} quadros, saiu ${real.quadros}`);

  // c) Codificação final por largura.
  const arquivos = [];
  const videos = [];
  const crfBase = d.video.loop ? CRF.loop : CRF.video;
  for (const w of d.video.larguras) {
    const h = Math.round((info.altura * w) / info.largura / 2) * 2;
    const limite = d.video.limiteBytes?.[String(w)];
    const saidaW = { largura: w, altura: h };
    for (const formato of ['mp4', 'webm']) {
      const nome = `${d.id}-${w}.${formato}`;
      const destino = join(tmp, nome);
      let crf = crfBase[formato];
      for (let tentativa = 0; ; tentativa++) {
        const codec =
          formato === 'mp4'
            ? [
                '-c:v',
                'libx264',
                '-preset',
                'slow',
                '-crf',
                String(crf),
                '-profile:v',
                'high',
                '-pix_fmt',
                'yuv420p',
                '-movflags',
                '+faststart',
                ...(audio ? ['-c:a', 'aac', '-b:a', '128k'] : ['-an']),
              ]
            : [
                '-c:v',
                'libvpx-vp9',
                '-crf',
                String(crf),
                '-b:v',
                '0',
                '-row-mt',
                '1',
                '-deadline',
                'good',
                '-cpu-used',
                '2',
                '-pix_fmt',
                'yuv420p',
                ...(audio ? ['-c:a', 'libopus', '-b:a', '96k'] : ['-an']),
              ];
        await executar('ffmpeg', [
          '-v',
          'error',
          '-y',
          '-i',
          F,
          '-vf',
          `scale=${w}:${h}:flags=lanczos`,
          ...codec,
          '-map_metadata',
          '-1',
          destino,
        ]);
        const bytes = (await stat(destino)).size;
        if (!limite || bytes <= limite) {
          saidaW[formato] = { src: `/media/${d.id}/${nome}`, bytes, crf };
          break;
        }
        if (tentativa >= 8)
          throw new Error(`[media] ${nome}: ${bytes} B acima do limite ${limite} B`);
        crf += 2;
      }
      arquivos.push(nome);
    }
    videos.push(saidaW);
  }

  // d) Pôster (AVIF/WebP nas larguras do vídeo) + LQIP.
  const posterPng = await quadroPng(F, posterNoFinal, fps);
  const poster = await imagens(
    posterPng,
    `${d.id}-poster`,
    tmp,
    d.video.larguras.slice().sort((a, b) => a - b),
  );
  await rm(trab, { recursive: true, force: true });
  const v720 = videos.find((v) => v.largura === 720) ?? videos[0];
  return {
    arquivos: [...arquivos, ...poster.arquivos],
    indice: {
      loop: Boolean(d.video.loop),
      audio,
      fps,
      duracao: arredondar(quadros / fps, 3),
      videos,
      poster: { tFonte: d.video.poster.t, ...poster.indice },
    },
    resumo: `${arredondar(quadros / fps, 2)} s; MP4 ${v720.largura}: ${kb(v720.mp4.bytes)} (crf ${v720.mp4.crf}), WebM: ${kb(v720.webm.bytes)}`,
  };
}

// Atualiza a tabela automática de docs/MIDIA_CATALOGO.md.
async function catalogo(itens) {
  const arquivo = join(RAIZ, 'docs/MIDIA_CATALOGO.md');
  const INI = '<!-- AUTO:INICIO (pnpm media:catalogo) -->';
  const FIM = '<!-- AUTO:FIM -->';
  const mb = (b) => (b / 1048576).toFixed(2).replace('.', ',') + ' MB';
  const kbv = (b) => Math.round(b / 1024) + ' KB';
  const seg = (x) => x.toFixed(2).replace('.', ',');
  const celula = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
  const linhas = [
    '| Derivado | Origem | Uso | Trecho / quadro | Pesos | Problemas |',
    '|---|---|---|---|---|---|',
  ];
  for (const d of manifesto.derivados) {
    const o = originais.get(d.origem);
    const it = itens[d.id];
    let trecho = '—';
    if (d.trechos.length) trecho = d.trechos.map((t) => `${seg(t.in)}–${seg(t.out)} s`).join(' + ');
    if (d.video?.loop)
      trecho += ` · laço ${it ? seg(it.duracao) : '?'} s (crossfade ${seg(d.video.loop.crossfade)} s)`;
    if (d.video?.poster.t !== undefined) trecho += ` · pôster ${seg(d.video.poster.t)} s`;
    if (d.quadro)
      trecho = `quadro ${seg(d.quadro.t ?? NaN)} s (janela ${seg(d.quadro.janelaFonte[0])}–${seg(d.quadro.janelaFonte[1])})`;
    if (d.recorte)
      trecho += ` · recorte ${d.recorte.largura}×${d.recorte.altura} em (${d.recorte.x}, ${d.recorte.y})${d.recorte.provisorio ? ', provisório' : ''}`;
    let pesos = d.naoUsar ? 'naoUsar' : '—';
    if (it?.videos)
      pesos =
        it.videos
          .map((v) => `${v.largura}: MP4 ${mb(v.mp4.bytes)} · WebM ${mb(v.webm.bytes)}`)
          .join('<br>') + `<br>pôster AVIF ${it.poster.avif.map((a) => kbv(a.bytes)).join('/')}`;
    else if (it?.imagem)
      pesos = `AVIF ${it.imagem.avif.map((a) => `${a.largura}: ${kbv(a.bytes)}`).join(', ')}<br>WebP ${it.imagem.webp.map((a) => `${a.largura}: ${kbv(a.bytes)}`).join(', ')}`;
    else if (it?.src) pesos = kbv(it.bytes);
    linhas.push(
      `| \`${d.id}\` | \`${o.arquivo.replace('media-originais/', '')}\` | ${celula(d.uso)} | ${trecho} | ${pesos} | ${celula([...d.problemas].join(' ') || '—')} |`,
    );
  }
  linhas.push('', '**Originais sem derivado:**', '');
  const usados = new Set(manifesto.derivados.map((d) => d.origem));
  for (const o of manifesto.originais.filter((x) => !usados.has(x.id)))
    linhas.push(
      `- \`${o.arquivo.replace('media-originais/', '')}\`: ${o.naoUsar ? `**naoUsar**: ${o.motivoNaoUsar}` : o.uso}`,
    );
  const bloco = `${INI}\n${linhas.join('\n')}\n${FIM}`;
  const atual = existsSync(arquivo)
    ? await readFile(arquivo, 'utf8')
    : `# Catálogo de mídia\n\n${INI}\n${FIM}\n`;
  const novo = atual.replace(new RegExp(`${INI.replace(/[()]/g, '\\$&')}[\\s\\S]*?${FIM}`), bloco);
  await escreverSeMudou(arquivo, novo);
  console.log('[media] catálogo atualizado: docs/MIDIA_CATALOGO.md');
}
