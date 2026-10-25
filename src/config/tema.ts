// Paleta calibrada na sessão 3 (docs/DESIGN_SYSTEM.md). Fonte visual: src/styles/tokens.css;
// scripts/audit-contraste.mjs falha se as duas divergirem.
export const cores = {
  carvao: '#121316',
  /** Navy das capas (era #15233F; as capas puxam para o azul-violeta). */
  navy: '#1A2146',
  /** Latão chapado: matiz do meio-tom do monograma (37°). */
  latao: '#B89252',
  /** Giz frio (era #F1F0EC, levemente quente). */
  giz: '#EEF0EF',
  aco: '#8C9098',
  /** Musgo da parede verde (matiz ~128°). */
  musgo: '#2C3E30',
  acoEscuro: '#565B64',
  lataoEscuro: '#7A5B26',
  lataoClaro: '#D2B073',
} as const;

export const fontes = {
  titulo: 'Libre Caslon Display',
  texto: 'Schibsted Grotesk',
} as const;

/** Escala de pente: da mais ampla (3 = a barbearia) à mais precisa (0 = acabamento e agendar). */
export const escalaPente = ['3', '2', '1½', '1', '½', '0'] as const;

export type Tema = 'claro' | 'escuro';
export const temaPadrao: Tema = 'escuro';
