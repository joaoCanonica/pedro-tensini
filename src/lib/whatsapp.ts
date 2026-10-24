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
