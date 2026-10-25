// Monta a mensagem pré-preenchida e o link wa.me. Sem guardar nada.
import { whatsapp } from '../config/contato.ts';

export const MENSAGEM_PADRAO = 'Olá, Pedro! Vim pelo site e quero agendar um horário.';
const LIMITE_NOME = 60;

export interface Escolhas {
  servico?: string;
  /** Texto pronto do dia, ex.: "amanhã (sábado, 25/10)". */
  dia?: string;
  /** "manhã", "tarde" ou "noite". */
  periodo?: string;
  nome?: string;
}

const limpar = (s: string | undefined): string =>
  (s ?? '')
    .replace(/[\p{Cc}\p{Cf}]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * "Olá, Pedro! Vim pelo site e quero agendar: {servico}. Prefiro {dia}, {periodo}.{ Meu nome é {nome}.}"
 * Sem escolhas: MENSAGEM_PADRAO.
 */
export function montarMensagem(escolhas: Escolhas = {}): string {
  const servico = limpar(escolhas.servico);
  const dia = limpar(escolhas.dia);
  const periodo = limpar(escolhas.periodo);
  const nome = limpar(escolhas.nome).slice(0, LIMITE_NOME).trim();
  if (!servico && !dia && !periodo && !nome) return MENSAGEM_PADRAO;

  let texto = servico ? `Olá, Pedro! Vim pelo site e quero agendar: ${servico}.` : MENSAGEM_PADRAO;
  const preferencia = [dia, periodo].filter(Boolean).join(', ');
  if (preferencia) texto += ` Prefiro ${preferencia}.`;
  if (nome) texto += ` Meu nome é ${nome}.`;
  return texto;
}

/** Número da config; null só se o WhatsApp não estiver confirmado (trava de produção). */
export const numeroWhatsApp: string | null =
  whatsapp.estado === 'confirmado' ? whatsapp.valor : null;

export function linkWhatsApp(texto: string = MENSAGEM_PADRAO, numero = numeroWhatsApp): string {
  return `https://wa.me/${numero ?? ''}?text=${encodeURIComponent(texto)}`;
}

/** "degradê", "degradê e barba", "corte, barba e sobrancelha". */
export function juntarServicos(servicos: readonly string[]): string {
  const l = servicos.map(limpar).filter(Boolean);
  return l.length > 1 ? `${l.slice(0, -1).join(', ')} e ${l.at(-1)}` : (l[0] ?? '');
}

/** De onde veio o clique. Vai só no evento de medição (data-origem), nunca na URL do wa.me. */
export type OrigemWhatsApp =
  | 'hero'
  | 'barra'
  | 'montador'
  | 'servico'
  | 'como-chegar'
  | 'perguntas'
  | 'sobre'
  | 'agendar'
  | '404'
  | 'rodape'
  /** Página interna /_estilo (provas do design system). */
  | 'estilo';

export interface AtributosWhatsApp {
  href: string;
  'data-cta': 'whatsapp';
  'data-origem': OrigemWhatsApp;
  'data-servico'?: string;
}

/**
 * Todo CTA de WhatsApp do site sai daqui: o link com a mensagem do contexto e os atributos que
 * a medição lê no clique. A URL do wa.me leva só o número e o texto.
 */
export function ctaWhatsApp(origem: OrigemWhatsApp, escolhas: Escolhas = {}): AtributosWhatsApp {
  const a: AtributosWhatsApp = {
    href: linkWhatsApp(montarMensagem(escolhas)),
    'data-cta': 'whatsapp',
    'data-origem': origem,
  };
  const servico = limpar(escolhas.servico);
  if (servico) a['data-servico'] = servico;
  return a;
}
