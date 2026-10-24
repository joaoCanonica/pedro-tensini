// Texto estático do horário (sem JS), a partir da config.
import { semana } from '../../config/horario.ts';
import { DIAS, formatarHora } from '../../lib/horario.ts';
import type { Janela } from '../../lib/horario.ts';

const min = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};
export const faixa = (j: Janela | null) =>
  j ? `${formatarHora(min(j.abre))}–${formatarHora(min(j.fecha))}` : 'fechado';

/** Ordem de exibição: segunda a domingo. */
export const ORDEM = [1, 2, 3, 4, 5, 6, 0] as const;
export const NOMES = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
] as const;
const CURTO = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'] as const;

export const linhasSemana = ORDEM.map((d) => ({
  dia: d,
  nome: NOMES[d],
  janela: semana.valor[d] ?? null,
}));

/** "seg a sex 8h30–20h · sáb 8h30–18h · dom fechado" */
export function resumoSemana(): string {
  const grupos: { de: number; ate: number; texto: string }[] = [];
  for (const d of ORDEM) {
    const texto = faixa(semana.valor[d] ?? null);
    const ultimo = grupos.at(-1);
    if (ultimo && ultimo.texto === texto) ultimo.ate = d;
    else grupos.push({ de: d, ate: d, texto });
  }
  return grupos
    .map((g) => `${CURTO[g.de]}${g.ate !== g.de ? ` a ${CURTO[g.ate]}` : ''} ${g.texto}`)
    .join(' · ');
}
export { DIAS };
