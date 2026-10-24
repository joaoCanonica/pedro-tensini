// Termos vetados no site (CDC/promessa). NUNCA afrouxar esta lista sem ordem expressa do João.
export const termosVetados = [
  'o melhor',
  'a melhor',
  'melhor barbeiro',
  'número 1',
  'nº 1',
  'garantido',
  'garantia',
  'horário garantido',
  'agendado com sucesso',
  '100%',
] as const;

/** Minúsculas, sem acento, espaços normais; "n°" (grau) vira "nº". */
export function normalizarTexto(s: string): string {
  return s
    .replace(/[\u00a0\u2007\u202f]/g, ' ')
    .replace(/[\u00b0\u02da]/g, '\u00ba')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Fronteira só à esquerda: "garantia" também pega "garantias" (mais rígido, nunca mais frouxo).
const padroes = termosVetados.map((termo) => ({
  termo,
  re: new RegExp(
    `(?<![\\p{L}\\p{N}])${escapar(normalizarTexto(termo)).replace(/ /g, '\\s*')}`,
    'gu',
  ),
}));

export interface Ocorrencia {
  termo: (typeof termosVetados)[number];
  trecho: string;
}

export function encontrarTermosVetados(texto: string): Ocorrencia[] {
  const norm = normalizarTexto(texto);
  const achados: Ocorrencia[] = [];
  for (const { termo, re } of padroes) {
    for (const m of norm.matchAll(re)) {
      const i = m.index;
      achados.push({ termo, trecho: norm.slice(Math.max(0, i - 30), i + m[0].length + 30).trim() });
    }
  }
  return achados;
}
