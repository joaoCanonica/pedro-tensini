import { aviso, confirmado, opcional } from './tipos.ts';
import type { Campo } from './tipos.ts';

const FONTE = 'Ficha do Google Maps, conferida em 24/10/2026';

export const google = {
  nota: confirmado(5.0, FONTE),
  total: confirmado(2, FONTE),
  conferidoEm: '2026-10-24',
  /** Trechos literais, sem edição. */
  trechos: [
    confirmado(
      { autor: 'Vinicius Farias', texto: 'Top! Atendimento excelente de alta qualidade!' },
      FONTE,
    ),
    confirmado(
      { autor: 'Diogo Amaral', texto: 'Atendimento de qualidade, barbeiro muito profissional' },
      FONTE,
    ),
  ],
  linkAvaliar: opcional<string>(undefined, 'Link "escrever avaliação" do Google (place id)'),
};

export const LIMITE_DIAS_CONFERENCIA = 60;

/** Aviso quando a conferência da nota tem mais de 60 dias. */
export function avisoConferencia(hoje: Date = new Date()): Campo<string> | null {
  const dias = Math.floor(
    (hoje.getTime() - Date.parse(`${google.conferidoEm}T12:00:00-03:00`)) / 86_400_000,
  );
  return dias > LIMITE_DIAS_CONFERENCIA
    ? aviso(
        'Nota e número de avaliações do Google',
        `Conferido há ${dias} dias (limite ${LIMITE_DIAS_CONFERENCIA}). Conferir de novo e atualizar.`,
        google.conferidoEm,
      )
    : null;
}
