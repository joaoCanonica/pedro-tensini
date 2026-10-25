// Travas de produção (CLAUDE.md, seção 8). Produção trava SÓ nestes casos.
// Funções puras: recebem a entrada e devolvem o resultado, para poder simular cada trava.
// NUNCA afrouxar sem ordem expressa do João.
import { comoChegar, endereco, whatsapp } from './contato.ts';
import { monograma, nomeCanonico } from './marca.ts';
import { servicos } from './servicos.ts';
import type { Preco } from './servicos.ts';
import { encontrarTermosVetados } from './termos.ts';
import { ehCampo } from './tipos.ts';
import type { Campo } from './tipos.ts';

export type IdTrava =
  | 'whatsapp'
  | 'numero-endereco'
  | 'nome-canonico'
  | 'termo-vetado'
  | 'midia-nao-usar'
  | 'preco-sem-fonte';

export const DESCRICAO_TRAVAS: Record<IdTrava, string> = {
  whatsapp: 'WhatsApp presente e confirmado',
  'numero-endereco': 'Número do endereço confirmado',
  'nome-canonico': 'Nome canônico confirmado',
  'termo-vetado': 'Nenhum termo vetado',
  'midia-nao-usar': 'Nenhuma mídia naoUsar referenciada',
  'preco-sem-fonte': 'Nenhum preço exibido sem fonte',
};

export interface ResultadoTrava {
  id: IdTrava;
  ok: boolean;
  detalhes: string[];
}

export interface ManifestoResumo {
  originais: readonly { id: string; naoUsar: boolean }[];
  derivados: readonly { id: string; origem: string; naoUsar: boolean }[];
}

export interface EntradaTravas {
  whatsapp: Campo<string>;
  /** Confirmado com valor null = endereço sem número, por decisão registrada na fonte. */
  numeroEndereco: Campo<string | null>;
  nomeCanonico: Campo<string>;
  /** Dados com texto que pode ir para a página. */
  conteudo: unknown;
  midiasReferenciadas: readonly { onde: string; id: string }[];
  precos: readonly { onde: string; campo: Campo<Preco> }[];
  manifesto: ManifestoResumo;
}

export function entradaPadrao(manifesto: ManifestoResumo): EntradaTravas {
  const midias = [
    { onde: 'marca.monograma', id: monograma.midia },
    ...servicos.flatMap((s) => [
      ...s.midia.map((id) => ({ onde: `servicos.${s.slug}.midia`, id })),
      ...(s.etapas ?? []).flatMap((e) =>
        e.midia.map((id) => ({ onde: `servicos.${s.slug}.etapas.${e.nome}`, id })),
      ),
    ]),
    ...comoChegar.flatMap((p, i) =>
      p.midia ? [{ onde: `contato.comoChegar[${i}]`, id: p.midia }] : [],
    ),
  ];
  return {
    whatsapp,
    numeroEndereco: endereco.numero,
    nomeCanonico,
    conteudo: { servicos, comoChegar },
    midiasReferenciadas: midias,
    precos: servicos.map((s) => ({ onde: `servicos.${s.slug}.preco`, campo: s.preco })),
    manifesto,
  };
}

const pendente = (c: Campo<unknown>) =>
  c.estado === 'confirmado'
    ? []
    : [`${c.estado}: ${'rotulo' in c && c.rotulo ? c.rotulo : 'sem valor'}`];

/** Textos de conteúdo (ignora metadados de campo: fonte, rótulo, motivo). */
function textosDeConteudo(obj: unknown, caminho = ''): { caminho: string; texto: string }[] {
  if (typeof obj === 'string') return [{ caminho, texto: obj }];
  if (ehCampo(obj))
    return textosDeConteudo(obj.estado === 'bloqueante' ? obj.provisorio : obj.valor, caminho);
  if (Array.isArray(obj)) return obj.flatMap((v, i) => textosDeConteudo(v, `${caminho}[${i}]`));
  if (obj !== null && typeof obj === 'object')
    return Object.entries(obj).flatMap(([k, v]) =>
      textosDeConteudo(v, caminho ? `${caminho}.${k}` : k),
    );
  return [];
}

export function avaliarTravas(e: EntradaTravas): ResultadoTrava[] {
  const r: ResultadoTrava[] = [];

  const wa = [...pendente(e.whatsapp)];
  if (e.whatsapp.estado === 'confirmado' && !/^55\d{10,11}$/.test(e.whatsapp.valor))
    wa.push(`número inválido: ${e.whatsapp.valor}`);
  r.push({ id: 'whatsapp', ok: wa.length === 0, detalhes: wa });

  const num = pendente(e.numeroEndereco);
  r.push({ id: 'numero-endereco', ok: num.length === 0, detalhes: num });

  const nome = pendente(e.nomeCanonico);
  r.push({ id: 'nome-canonico', ok: nome.length === 0, detalhes: nome });

  const termos = textosDeConteudo(e.conteudo).flatMap(({ caminho, texto }) =>
    encontrarTermosVetados(texto).map((o) => `${caminho}: "${o.termo}" em "${o.trecho}"`),
  );
  r.push({ id: 'termo-vetado', ok: termos.length === 0, detalhes: termos });

  const vetados = new Set([
    ...e.manifesto.originais.filter((o) => o.naoUsar).map((o) => o.id),
    ...e.manifesto.derivados.filter((d) => d.naoUsar).map((d) => d.id),
  ]);
  const derivados = new Map(e.manifesto.derivados.map((d) => [d.id, d]));
  const midia = e.midiasReferenciadas.flatMap(({ onde, id }) => {
    const d = derivados.get(id);
    if (vetados.has(id)) return [`${onde}: "${id}" é naoUsar`];
    if (d && vetados.has(d.origem)) return [`${onde}: "${id}" deriva de "${d.origem}" (naoUsar)`];
    return [];
  });
  r.push({ id: 'midia-nao-usar', ok: midia.length === 0, detalhes: midia });

  // Na config, preço só é exibível se confirmado (e confirmado exige fonte).
  const precos = e.precos.flatMap(({ onde, campo }) =>
    campo.estado === 'confirmado' && !campo.fonte.trim() ? [`${onde}: confirmado sem fonte`] : [],
  );
  r.push({ id: 'preco-sem-fonte', ok: precos.length === 0, detalhes: precos });

  return r;
}

/** Referências a mídia que não existe no manifesto (aviso, não trava). */
export function midiasDesconhecidas(e: EntradaTravas): string[] {
  const ids = new Set(e.manifesto.derivados.map((d) => d.id));
  return e.midiasReferenciadas.filter((m) => !ids.has(m.id)).map((m) => `${m.onde}: "${m.id}"`);
}
