// Imagem de compartilhamento (Open Graph) 1200×630, gerada no build com sharp:
// carvão + still real à direita + monograma em latão + nome canônico + "Centro de Lages".
// Sem degradê de cor, sem brilho: a mesma paleta chapada do site.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { nap } from './entidade.ts';

export const OG = {
  caminho: '/og/tensini.jpg',
  largura: 1200,
  altura: 630,
  alt: `Monograma TB e o nome ${nap.nome}, barbearia no Centro de Lages, ao lado do Pedro cortando o cabelo de um cliente`,
} as const;

const RAIZ = process.cwd();
const CARVAO = '#121316';
const LATAO = '#B89252';
const GIZ = '#F1F0EC';
const ACO = '#8C9098';
const FONTE_TITULO = join(RAIZ, 'src/components/seo/fontes/libre-caslon-display-400.ttf');
const FONTE_TEXTO = join(RAIZ, 'src/components/seo/fontes/schibsted-grotesk-600.ttf');
const STILL = join(RAIZ, 'public/media/quadro-parede-verde/quadro-parede-verde-720.webp');
const MONOGRAMA = join(RAIZ, 'src/components/marca/tensini-monograma-tb.limpo.svg');

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function texto(
  conteudo: string,
  fonte: string,
  familia: string,
  tamanho: number,
  cor: string,
  espacamento = 0,
  largura = 640,
) {
  return sharp({
    text: {
      text: `<span foreground="${cor}"${espacamento ? ` letter_spacing="${espacamento}"` : ''}>${esc(conteudo)}</span>`,
      font: `${familia} ${tamanho}`,
      fontfile: fonte,
      dpi: 72,
      rgba: true,
      width: largura,
      wrap: 'word',
    },
  })
    .png()
    .toBuffer({ resolveWithObject: true });
}

export async function gerarOg(): Promise<Buffer> {
  const { largura: W, altura: H } = OG;
  const fotoL = 450;
  const foto = await sharp(STILL).resize(fotoL, H, { fit: 'cover', position: 'centre' }).toBuffer();
  const svg = readFileSync(MONOGRAMA, 'utf8').replace(/currentColor/g, LATAO);
  const monograma = await sharp(Buffer.from(svg)).resize({ width: 104 }).png().toBuffer();
  const nome = await texto(nap.nome, FONTE_TITULO, 'Libre Caslon Display', 82, GIZ, 0, 620);
  const lugar = await texto('CENTRO DE LAGES', FONTE_TEXTO, 'Schibsted Grotesk', 22, LATAO, 4200);
  const endereco = await texto(
    `${nap.complemento} · ${nap.rua} · ${nap.cidade}/${nap.uf}`,
    FONTE_TEXTO,
    'Schibsted Grotesk',
    22,
    ACO,
  );
  const x = 80;
  const yNome = 300;
  // Linha da "passada": latão, fina, chapada.
  const linha = await sharp({
    create: { width: 2, height: H, channels: 4, background: LATAO },
  })
    .png()
    .toBuffer();
  return sharp({ create: { width: W, height: H, channels: 3, background: CARVAO } })
    .composite([
      { input: foto, left: W - fotoL, top: 0 },
      { input: linha, left: W - fotoL - 2, top: 0 },
      { input: monograma, left: x, top: 72 },
      { input: lugar.data, left: x, top: yNome - 52 },
      { input: nome.data, left: x, top: yNome },
      { input: endereco.data, left: x, top: Math.min(H - 96, yNome + nome.info.height + 28) },
    ])
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();
}
