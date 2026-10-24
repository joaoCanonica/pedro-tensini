// Tokens de partida (CLAUDE.md, seção 5). Calibrados e validados em AA na sessão 3.
export const cores = {
  carvao: '#121316',
  navy: '#15233F',
  latao: '#B89252',
  giz: '#F1F0EC',
  aco: '#8C9098',
  musgo: '#2E3D2A',
} as const;

export const fontes = {
  titulo: 'Libre Caslon Display',
  texto: 'Schibsted Grotesk',
} as const;

/** Escala de pente: da mais ampla (3 = a barbearia) à mais precisa (0 = acabamento e agendar). */
export const escalaPente = ['3', '2', '1½', '1', '½', '0'] as const;

export type Tema = 'claro' | 'escuro';
export const temaPadrao: Tema = 'escuro';
