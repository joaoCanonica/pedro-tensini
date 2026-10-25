// Páginas de serviço: rota, nome curto (breadcrumb e links cruzados) e o que o montador
// já traz marcado. Os nomes do montador são os mesmos do Montador.astro.
export interface PaginaServico {
  rota: string;
  nome: string;
  /** Linha curta nos links para os outros serviços. */
  resumo: string;
  montador: string[];
}

export const PAGINAS_SERVICO: readonly PaginaServico[] = [
  {
    rota: '/degrade-em-lages/',
    nome: 'Degradê',
    resumo: 'Do curto ao longo, finalizado na shaver.',
    montador: ['Degradê'],
  },
  {
    rota: '/barba-e-barbaterapia/',
    nome: 'Barba e barbaterapia',
    resumo: 'O ritual em cinco tempos, da toalha quente à navalha.',
    montador: ['Barbaterapia'],
  },
  {
    rota: '/sobrancelha/',
    nome: 'Sobrancelha',
    resumo: 'Limpeza na navalha, sem mudar o desenho.',
    montador: ['Sobrancelha'],
  },
  {
    rota: '/pomadas/',
    nome: 'Pomadas',
    resumo: 'Qual usar para cada efeito, e como aplicar.',
    montador: [],
  },
  {
    rota: '/servicos-e-precos/',
    nome: 'Serviços e preços',
    resumo: 'Todos os serviços numa tabela.',
    montador: [],
  },
];

export const paginaServico = (rota: string): PaginaServico => {
  const p = PAGINAS_SERVICO.find((x) => x.rota === rota);
  if (!p) throw new Error(`Página de serviço "${rota}" fora do catálogo.`);
  return p;
};
