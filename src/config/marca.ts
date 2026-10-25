import { bloqueante, confirmado } from './tipos.ts';
import type { Campo } from './tipos.ts';

export const nomeCanonico: Campo<string> = bloqueante<string>(
  'Tensini Barbieri — confirmar com o Pedro',
  'Tensini Barbieri',
);

/** Como o nome aparece hoje (consistência de entidade). */
export const variacoesVistas = [
  { nome: 'TENSINI BARBIERI PROFESSIONALE', onde: 'logo oficial' },
  { nome: 'Tensini Barbiere', onde: 'Instagram @tensinibarbiere_' },
  { nome: 'Barbearia - Tensini barbieri', onde: 'ficha do Google' },
] as const;

export const profissional = {
  nome: confirmado('Pedro Tensini', 'Instagram ("Pedro Tensini | Barbeiro") e registro'),
  nomeCompleto: confirmado(
    'Pedro Carlos Tensini',
    'Receita Federal (MEI) e certificado de workshop',
  ),
};

export const cnpj = confirmado(
  '42.779.510/0001-59',
  'Receita Federal: MEI desde 19/07/2021, CNAE 9602-5/01',
);
export const exibirCnpj = true;

export const monograma = {
  arquivo: 'media-originais/marca/tensini-monograma-tb.svg',
  /** id do derivado em media.manifest.json */
  midia: 'monograma',
} as const;
