// Escolhe o quadro mais nítido de cada janela (quadros, retratos e pôsteres),
// grava o tempo escolhido no manifesto e gera folhas de contato em docs/capturas/midia/.
// Uso: pnpm media:stills [--sem-folhas]
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import {
  RAIZ,
  carregarManifesto,
  melhorQuadro,
  quadroPng,
  salvarManifesto,
  sondarVideo,
} from './lib/midia.mjs';

const PASTA_FOLHAS = join(RAIZ, 'docs/capturas/midia');
const semFolhas = process.argv.includes('--sem-folhas');

const { manifesto, originais } = await carregarManifesto();
const ativos = manifesto.derivados.filter((d) => !d.naoUsar);

for (const d of ativos) {
  const o = originais.get(d.origem);
  const caminho = join(RAIZ, o.arquivo);
  if (d.tipo === 'quadro') {
    const r = await melhorQuadro(caminho, d.quadro.janelaFonte, d.quadro.regiaoNitidez);
    d.quadro.t = r.t;
    console.log(`${d.id}: t=${r.t}s (quadro ${r.n}, nitidez ${r.nitidez.toFixed(0)})`);
  } else if (d.video) {
    const r = await melhorQuadro(caminho, d.video.poster.janelaFonte);
    d.video.poster.t = r.t;
    console.log(`${d.id}: pôster t=${r.t}s (quadro ${r.n}, nitidez ${r.nitidez.toFixed(0)})`);
  }
}
await salvarManifesto(manifesto);
console.log('Tempos gravados em media.manifest.json.');

if (semFolhas) process.exit(0);
await mkdir(PASTA_FOLHAS, { recursive: true });

const escapar = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

async function miniatura(buf, largura, rotulo) {
  const img = sharp(buf).resize({ width: largura });
  const { height } = await img
    .clone()
    .toBuffer({ resolveWithObject: true })
    .then((r) => r.info);
  const faixa = Buffer.from(
    `<svg width="${largura}" height="22"><rect width="100%" height="100%" fill="#121316" opacity="0.85"/>` +
      `<text x="5" y="15" font-family="sans-serif" font-size="12" fill="#F1F0EC">${escapar(rotulo)}</text></svg>`,
  );
  const corpo = await img
    .composite([{ input: faixa, top: 0, left: 0 }])
    .png()
    .toBuffer();
  return { buf: corpo, largura, altura: height };
}

async function grade(miniaturas, colunas, arquivo) {
  const gap = 4;
  const largura = Math.max(...miniaturas.map((m) => m.largura));
  const altura = Math.max(...miniaturas.map((m) => m.altura));
  const linhas = Math.ceil(miniaturas.length / colunas);
  const W = colunas * (largura + gap) + gap;
  const H = linhas * (altura + gap) + gap;
  await sharp({ create: { width: W, height: H, channels: 3, background: '#121316' } })
    .composite(
      miniaturas.map((m, i) => ({
        input: m.buf,
        left: gap + (i % colunas) * (largura + gap),
        top: gap + Math.floor(i / colunas) * (altura + gap),
      })),
    )
    .jpeg({ quality: 78 })
    .toFile(join(PASTA_FOLHAS, arquivo));
  console.log(`folha: docs/capturas/midia/${arquivo}`);
}

const fmt = (t) => t.toFixed(2).replace('.', ',') + ' s';

// Folha de contato de cada trecho de vídeo: 12 quadros distribuídos nos trechos.
for (const d of ativos.filter((x) => x.video)) {
  const o = originais.get(d.origem);
  const caminho = join(RAIZ, o.arquivo);
  const { fps } = await sondarVideo(caminho);
  const total = d.trechos.reduce((s, t) => s + (t.out - t.in), 0);
  const tempos = [];
  const N = 12;
  for (let i = 0; i < N; i++) {
    let alvo = ((i + 0.5) / N) * total;
    for (const t of d.trechos) {
      const len = t.out - t.in;
      if (alvo < len) {
        tempos.push(t.in + alvo);
        break;
      }
      alvo -= len;
    }
  }
  const minis = [];
  for (const t of tempos) {
    const png = await quadroPng(caminho, Math.round(t * fps), fps);
    minis.push(await miniatura(png, 160, `${fmt(t)}`));
  }
  const posterPng = await quadroPng(caminho, Math.round(d.video.poster.t * fps), fps);
  minis.push(await miniatura(posterPng, 160, `PÔSTER ${fmt(d.video.poster.t)}`));
  await grade(minis, 7, `${d.id}.jpg`);
}

// Quadros e retratos escolhidos (com recorte aplicado, se houver).
const minisQuadros = [];
for (const d of ativos.filter((x) => x.tipo === 'quadro')) {
  const o = originais.get(d.origem);
  const caminho = join(RAIZ, o.arquivo);
  const { fps } = await sondarVideo(caminho);
  let png = await quadroPng(caminho, Math.round(d.quadro.t * fps), fps);
  if (d.recorte) {
    const { x, y, largura, altura } = d.recorte;
    png = await sharp(png)
      .extract({ left: x, top: y, width: largura, height: altura })
      .png()
      .toBuffer();
  }
  minisQuadros.push(await miniatura(png, 200, `${d.id} ${fmt(d.quadro.t)}`));
}
await grade(minisQuadros, 5, 'quadros-e-retratos.jpg');

// Fotos: original com o retângulo do recorte e o resultado.
const minisFotos = [];
for (const d of ativos.filter((x) => x.tipo === 'imagem')) {
  const o = originais.get(d.origem);
  const caminho = join(RAIZ, o.arquivo);
  const { x, y, largura, altura } = d.recorte;
  const moldura = Buffer.from(
    `<svg width="${o.largura}" height="${o.altura}"><rect x="${x}" y="${y}" width="${largura}" height="${altura}" fill="none" stroke="#ff2d2d" stroke-width="8"/></svg>`,
  );
  const marcado = await sharp(caminho)
    .composite([{ input: moldura }])
    .png()
    .toBuffer();
  minisFotos.push(await miniatura(marcado, 216, `${o.id} (original)`));
  const recortado = await sharp(caminho)
    .extract({ left: x, top: y, width: largura, height: altura })
    .png()
    .toBuffer();
  minisFotos.push(await miniatura(recortado, 216, `${d.id} ${largura}×${altura}`));
}
// Duplicata e descartes, para registro.
for (const id of ['foto-barbaterapia-creme', 'foto-colagem-agende']) {
  const o = originais.get(id);
  minisFotos.push(
    await miniatura(await sharp(join(RAIZ, o.arquivo)).png().toBuffer(), 216, `${id} (naoUsar)`),
  );
}
await grade(minisFotos, 4, 'fotos-recortes.jpg');

await writeFile(
  join(PASTA_FOLHAS, 'LEIA.md'),
  '# Folhas de contato de mídia\n\nGeradas por `pnpm media:stills` (scripts/extract-stills.mjs). Tempos em segundos do arquivo original.\n',
);
