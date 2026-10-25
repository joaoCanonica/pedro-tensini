import { confirmado, opcional } from './tipos.ts';
import type { Campo } from './tipos.ts';

const FONTE_JOAO = 'João (WAXLO), 24/10/2026';
const FONTE_JOAO_27 = 'João (WAXLO), decisão para a publicação de 27/10/2026';

export const whatsapp: Campo<string> = confirmado('5549999037620', FONTE_JOAO);
export const telefone = confirmado('(49) 99903-7620', FONTE_JOAO);
export const instagram = confirmado(
  { usuario: 'tensinibarbiere_', url: 'https://www.instagram.com/tensinibarbiere_/' },
  'Perfil visto em 24/10/2026',
);

export const endereco = {
  rua: confirmado('Rua Hercílio Luz', `${FONTE_JOAO}; posts; Google`),
  // Ordem expressa do João: a barbearia fica dentro da galeria e o número não entra no site.
  // Confirmado como "sem número" (null): o endereço é rua + Galeria Augusta.
  numero: confirmado<string | null>(
    null,
    `${FONTE_JOAO_27}: "número não importa", endereço é a Galeria Augusta`,
  ) as Campo<string | null>,
  complemento: confirmado('Galeria Augusta', `${FONTE_JOAO}; posts`),
  salaAndar: opcional<string>(undefined, 'Andar/sala dentro da Galeria Augusta'),
  bairro: confirmado('Centro', `${FONTE_JOAO}; posts`),
  cidade: confirmado('Lages', FONTE_JOAO),
  uf: confirmado('SC', FONTE_JOAO),
  cep: confirmado('88501-010', 'Dados fixos do pacote de prompts (24/10/2026)'),
  /** Ponto de referência na rua. */
  referencia: confirmado('ao lado da Agito', FONTE_JOAO_27),
};

export const geo = confirmado(
  { lat: -27.8166534, lng: -50.3284045 },
  'Ficha do Google Maps, vista em 24/10/2026',
);
export const plusCode = confirmado(
  '5MMC+8J Lages, SC',
  'Ficha do Google Maps, vista em 24/10/2026',
);

const ll = encodeURIComponent(`${geo.valor.lat},${geo.valor.lng}`);

/** Links de mapa e rota montados das coordenadas. */
export const links = {
  googleMaps: `https://www.google.com/maps/search/?api=1&query=${ll}`,
  googleRota: `https://www.google.com/maps/dir/?api=1&destination=${ll}`,
  waze: `https://waze.com/ul?ll=${ll}&navigate=yes`,
  appleMapas: `https://maps.apple.com/?daddr=${ll}`,
} as const;
/** Link direto da ficha (place id/cid). */
export const fichaGoogle = opcional<string>(undefined, 'Link direto da ficha do Google (place id)');

export interface PassoComoChegar {
  texto: string;
  /** id de derivado em media.manifest.json */
  midia?: string;
}
/** "Da calçada à cadeira": vazio até existir foto/vídeo do caminho. */
export const comoChegar: PassoComoChegar[] = [];

export const estacionamento = opcional<string>(undefined, 'Onde estacionar perto da galeria');
