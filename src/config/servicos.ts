import { opcional } from './tipos.ts';
import type { Campo } from './tipos.ts';

export interface Preco {
  /** Em reais. Faixa quando "a partir de"/"de–até". */
  de: number;
  ate?: number;
}

export interface Etapa {
  nome: string;
  /** ids de derivados em media.manifest.json */
  midia: string[];
}

export interface Servico {
  slug: string;
  nome: string;
  destaque: boolean;
  /** Copy final na sessão 5. */
  descricaoCurta: string;
  preco: Campo<Preco>;
  /** Minutos. */
  duracao: Campo<number>;
  midia: string[];
  etapas?: Etapa[];
}

const PRECO = 'Preço (tabela oficial pendente; uma avaliação do Google cita R$ 40–60)';
const DURACAO = 'Duração';

export const servicos: Servico[] = [
  {
    slug: 'corte',
    nome: 'Corte',
    destaque: false,
    descricaoCurta: '',
    preco: opcional<Preco>(undefined, PRECO),
    duracao: opcional<number>(undefined, DURACAO),
    midia: ['quadro-parede-verde'],
  },
  {
    slug: 'degrade',
    nome: 'Degradê com acabamento na shaver',
    destaque: true,
    descricaoCurta: '',
    preco: opcional<Preco>(undefined, PRECO),
    duracao: opcional<number>(undefined, DURACAO),
    midia: [
      'loop-degrade',
      'resultado-1',
      'resultado-2',
      'quadro-resultado-perfil',
      'quadro-resultado-nuca',
    ],
  },
  {
    slug: 'barba',
    nome: 'Barba',
    destaque: false,
    descricaoCurta: '',
    preco: opcional<Preco>(undefined, PRECO),
    duracao: opcional<number>(undefined, DURACAO),
    midia: [
      'experiencia-completa',
      'quadro-maquina-vinho',
      'quadro-navalha',
      'quadro-resultado-barba',
    ],
  },
  {
    slug: 'barbaterapia',
    nome: 'Barbaterapia',
    destaque: false,
    descricaoCurta: '',
    preco: opcional<Preco>(undefined, PRECO),
    duracao: opcional<number>(undefined, DURACAO),
    midia: [],
    etapas: [
      { nome: 'Toalha quente', midia: ['foto-toalha-quente'] },
      { nome: 'Esfoliação', midia: ['foto-esfoliacao'] },
      // Sem foto própria: o post "Creme e massagem" repete a foto da toalha (naoUsar).
      { nome: 'Creme e massagem', midia: [] },
      { nome: 'Navalha', midia: ['foto-navalha'] },
      { nome: 'Barba finalizada', midia: ['foto-barba-finalizada'] },
    ],
  },
  {
    slug: 'sobrancelha',
    nome: 'Sobrancelha',
    destaque: false,
    descricaoCurta: '',
    preco: opcional<Preco>(undefined, PRECO),
    duracao: opcional<number>(undefined, DURACAO),
    midia: [],
  },
];

export interface Combo {
  nome: string;
  servicos: string[];
  preco: Campo<Preco>;
}
export const combos = opcional<Combo[]>(undefined, 'Combos (corte + barba etc.) e preços');

/** Preço só aparece se confirmado. */
export function precoExibivel(s: { preco: Campo<Preco> }): Preco | null {
  return s.preco.estado === 'confirmado' ? s.preco.valor : null;
}

export function formatarPreco(p: Preco): string {
  const r = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;
  return p.ate ? `${r(p.de)}–${r(p.ate).replace('R$ ', '')}` : r(p.de);
}
