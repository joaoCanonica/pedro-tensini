import { confirmado, opcional } from './tipos.ts';
import type { Campo } from './tipos.ts';
import type { Excecao, Janela, RegrasHorario } from '../lib/horario.ts';

export const fuso = 'America/Sao_Paulo';

/** Índice 0 = domingo … 6 = sábado. null = fechado. */
export const semana = confirmado<readonly (Janela | null)[]>(
  [
    null,
    { abre: '08:30', fecha: '20:00' },
    { abre: '08:30', fecha: '20:00' },
    { abre: '08:30', fecha: '20:00' },
    { abre: '08:30', fecha: '20:00' },
    { abre: '08:30', fecha: '20:00' },
    { abre: '08:30', fecha: '18:00' },
  ],
  'João (WAXLO), 24/10/2026; ficha do Google',
);

/** Intervalo de almoço (se houver, divide as janelas do dia). */
export const intervalo = opcional<Janela>(undefined, 'Intervalo de almoço') as Campo<Janela>;

/** Feriados, folgas e horários especiais. Vazio até o Pedro informar. */
export const excecoes: readonly Excecao[] = [];
export const feriadosInformados = opcional<boolean>(
  undefined,
  'Feriados e folgas do ano (nenhum informado ainda)',
);

function dividir(j: Janela, pausa: Janela | null): Janela[] {
  if (!pausa || pausa.abre <= j.abre || pausa.fecha >= j.fecha) return [j];
  return [
    { abre: j.abre, fecha: pausa.abre },
    { abre: pausa.fecha, fecha: j.fecha },
  ];
}

/** Regras prontas para o motor de horário (só dados confirmados). */
export const regrasHorario: RegrasHorario = {
  fuso,
  semana: semana.valor.map((j) =>
    j ? dividir(j, intervalo.estado === 'confirmado' ? intervalo.valor : null) : [],
  ),
  excecoes,
};
