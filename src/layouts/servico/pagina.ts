// Lê um texto-fonte de página (src/content/textos/<pagina>.md) em build e devolve blocos
// prontos para o layout Servico. Os .md continuam sendo a fonte única do texto.
// Blocos condicionais (<!-- se:chave --> … <!-- senao --> … <!-- fim -->) usam só dado
// confirmado da config: sem preço confirmado, vai ao ar o texto do "senao".
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { combos, formatarPreco, precoExibivel, servicos } from '../../config/servicos.ts';
import { resolver } from '../../components/secoes/textos.ts';
import type { Campo } from '../../config/tipos.ts';

export interface Passo {
  nome: string;
  texto: string;
}
export interface ItemLista {
  rotulo: string;
  texto: string;
}
export type Bloco =
  | { tipo: 'p'; texto: string }
  | { tipo: 'passos'; itens: Passo[] }
  | { tipo: 'lista'; itens: ItemLista[] }
  | { tipo: 'tabela'; cabecalho: string[]; linhas: string[][] }
  | { tipo: 'citacao'; texto: string; fonte: string }
  | { tipo: 'sub'; titulo: string; blocos: Bloco[] };

export interface Parte {
  titulo: string;
  blocos: Bloco[];
  provisorios: string[];
}
export interface Pagina {
  title: string;
  description: string;
  h1: string;
  /** Primeiro parágrafo: a resposta completa (serviço, bairro, cidade). */
  resposta: string;
  intro: Parte;
  partes: Map<string, Parte>;
}

const servico = (slug: string) => servicos.find((s) => s.slug === slug);
export const minutos = (m: number) =>
  m >= 60 ? `${Math.floor(m / 60)}h${m % 60 || ''}` : `${m} min`;

/** Valor confirmado de uma chave de condicional ("preco.degrade", "duracao.barba", "combos"). */
function valorDe(chave: string): string | null {
  const [tipo, slug = ''] = chave.split('.');
  if (tipo === 'preco' && slug === 'tabela')
    return servicos.every((s) => precoExibivel(s)) ? 'sim' : null;
  if (tipo === 'preco') {
    const s = servico(slug);
    const p = s ? precoExibivel(s) : null;
    return p ? formatarPreco(p) : null;
  }
  if (tipo === 'duracao') {
    const d = servico(slug)?.duracao;
    return d?.estado === 'confirmado' ? minutos(d.valor) : null;
  }
  // Hoje a config tipa combos como opcional; o tipo largo deixa a página pronta para o confirmado.
  if (tipo === 'combos') return (combos as Campo<unknown>).estado === 'confirmado' ? 'sim' : null;
  return null;
}

function condicionais(md: string): string {
  return md.replace(
    /<!-- se:([\w.]+) -->([\s\S]*?)(?:<!-- senao -->([\s\S]*?))?<!-- fim -->/g,
    (_, chave: string, sim: string, nao = '') => (valorDe(chave) ? sim : nao),
  );
}

/** Marcadores de preço e duração (só existem dentro do "sim" de um condicional). */
const dados = (t: string) =>
  t.replace(/\{\{((?:preco|duracao)\.[\w]+)\}\}/g, (m, k: string) => valorDe(k) ?? m);

const semNegrito = (t: string) => t.replace(/\*\*(.+?)\*\*/g, '$1');

function blocos(texto: string, provisorios: string[]): Bloco[] {
  const r = (t: string) => semNegrito(resolver(dados(t), provisorios));
  const out: Bloco[] = [];
  const subs = texto.split(/^### /m);
  const corpo = subs.shift() ?? '';
  for (const parte of corpo
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)) {
    if (parte === '---') continue;
    if (parte.startsWith('>')) {
      const linhas = parte.split('\n').map((l) => l.replace(/^>\s?/, ''));
      const fonte = linhas.find((l) => l.startsWith('Fonte:')) ?? '';
      out.push({
        tipo: 'citacao',
        texto: r(
          linhas
            .filter((l) => !l.startsWith('Fonte:'))
            .join(' ')
            .replace(/^"|"$/g, ''),
        ),
        // Na página vai a fonte curta; o detalhe de pesquisa fica no .md.
        fonte: r(fonte.replace(/^Fonte:\s*/, '')).replace(/\s*\([^)]*\)\s*$/, ''),
      });
    } else if (/^\d+\.\s/.test(parte)) {
      const itens: Passo[] = [];
      for (const l of parte.split('\n')) {
        const m = l.match(/^\d+\.\s+\*\*(.+?)\.?\*\*\s*(.*)$/);
        if (m) itens.push({ nome: m[1] ?? '', texto: r(m[2] ?? '') });
      }
      out.push({ tipo: 'passos', itens });
    } else if (/^- /.test(parte)) {
      const itens: ItemLista[] = [];
      for (const l of parte.split('\n')) {
        const m = l.match(/^- \*\*(.+?):?\*\*:?\s*(.*)$/) ?? l.match(/^- ([^:]{1,40}):\s*(.*)$/);
        if (m) itens.push({ rotulo: m[1] ?? '', texto: r(m[2] ?? '') });
        else if (l.startsWith('- ')) itens.push({ rotulo: '', texto: r(l.slice(2)) });
      }
      out.push({ tipo: 'lista', itens });
    } else if (parte.startsWith('|')) {
      const celulas = (l: string) =>
        l
          .replace(/^\||\|$/g, '')
          .split('|')
          .map((c) => r(c.trim()));
      const [cab = '', , ...resto] = parte.split('\n');
      out.push({ tipo: 'tabela', cabecalho: celulas(cab), linhas: resto.map(celulas) });
    } else {
      const t = r(parte);
      if (t) out.push({ tipo: 'p', texto: t });
    }
  }
  for (const sub of subs) {
    const [titulo = '', ...resto] = sub.split('\n');
    out.push({ tipo: 'sub', titulo: r(titulo), blocos: blocos(resto.join('\n'), provisorios) });
  }
  return out;
}

const lidas = new Map<string, Pagina>();
export function pagina(nome: string): Pagina {
  const pronta = lidas.get(nome);
  if (pronta) return pronta;
  const bruto = readFileSync(join(process.cwd(), 'src/content/textos', `${nome}.md`), 'utf8');
  const [, front = '', corpo = ''] = bruto.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/) ?? [];
  const meta = (k: string) => front.match(new RegExp(`^${k}:\\s*(.*)$`, 'm'))?.[1]?.trim() ?? '';
  const md = condicionais(corpo);
  const h1 = md.match(/^# (.+)$/m)?.[1]?.trim() ?? '';
  const [antes = '', ...secoes] = md.replace(/^# .+$/m, '').split(/^## /m);
  const introProv: string[] = [];
  const intro: Parte = { titulo: '', blocos: blocos(antes, introProv), provisorios: introProv };
  const partes = new Map<string, Parte>();
  for (const s of secoes) {
    const [titulo = '', ...resto] = s.split('\n');
    const provisorios: string[] = [];
    partes.set(titulo.trim(), {
      titulo: titulo.trim(),
      blocos: blocos(resto.join('\n'), provisorios),
      provisorios,
    });
  }
  const primeiro = intro.blocos.find((b) => b.tipo === 'p');
  const r: Pagina = {
    title: meta('title'),
    description: meta('description'),
    h1,
    resposta: primeiro?.tipo === 'p' ? primeiro.texto : '',
    intro: { ...intro, blocos: intro.blocos.filter((b) => b !== primeiro) },
    partes,
  };
  lidas.set(nome, r);
  return r;
}

/** Parte obrigatória: falha o build se o .md mudar de título sem a página acompanhar. */
export function parte(p: Pagina, titulo: string): Parte {
  const x = p.partes.get(titulo);
  if (!x) throw new Error(`Seção "## ${titulo}" não encontrada no texto da página.`);
  return x;
}

/** Pergunta da página de perguntas frequentes, pelo título exato ("## Atende sábado?"). */
export function faq(pergunta: string): {
  pergunta: string;
  blocos: Bloco[];
  provisorios: string[];
} {
  const x = parte(pagina('perguntas-frequentes'), pergunta);
  return { pergunta, blocos: x.blocos, provisorios: x.provisorios };
}

/** Seção da própria página respondida como pergunta ("Para quem é" → "Para quem é o degradê?"). */
export function comoPergunta(
  p: Pagina,
  titulo: string,
  pergunta: string,
): { pergunta: string; blocos: Bloco[]; provisorios: string[] } {
  const x = parte(p, titulo);
  return { pergunta, blocos: x.blocos, provisorios: x.provisorios };
}
