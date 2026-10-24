// Leitura do índice gerado por pnpm media:prepare (public/media/media-index.json), em build.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface Variante {
  largura: number;
  altura: number;
  src: string;
  bytes: number;
}
export interface Imagem {
  largura: number;
  altura: number;
  avif: Variante[];
  webp: Variante[];
  lqip: string;
}
export interface VideoLargura {
  largura: number;
  altura: number;
  mp4: { src: string; bytes: number };
  webm: { src: string; bytes: number };
}
export interface ItemMidia {
  id: string;
  tipo: 'video' | 'loop' | 'imagem' | 'quadro' | 'vetor';
  provisorio: boolean;
  exibicaoMax?: { larguraCss: number; nota: string };
  imagem?: Imagem;
  videos?: VideoLargura[];
  poster?: Imagem & { tFonte: number };
  duracao?: number;
}

let cache: Record<string, ItemMidia> | null = null;

export function obterMidia(id: string): ItemMidia {
  if (!cache) {
    const arquivo = join(process.cwd(), 'public/media/media-index.json');
    try {
      cache = (JSON.parse(readFileSync(arquivo, 'utf8')) as { itens: Record<string, ItemMidia> })
        .itens;
    } catch {
      throw new Error('public/media/media-index.json ausente: rode pnpm media:prepare.');
    }
  }
  const item = cache[id];
  if (!item) throw new Error(`Mídia "${id}" não está no índice (media.manifest.json).`);
  return item;
}

export const srcset = (vs: Variante[]) => vs.map((v) => `${v.src} ${v.largura}w`).join(', ');
