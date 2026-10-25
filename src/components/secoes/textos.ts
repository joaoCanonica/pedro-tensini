// Lê os textos-fonte (src/content/textos/*.md) em build e resolve os {{marcadores}} com a config.
// Os .md continuam sendo a fonte única do texto; aqui só se separa cada seção em partes.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { endereco, instagram, plusCode, telefone } from '../../config/contato.ts';
import { cnpj, nomeCanonico, profissional } from '../../config/marca.ts';
import { google } from '../../config/avaliacoes.ts';
import { modo } from '../../config/seo.ts';
import { valorPreview } from '../../config/tipos.ts';
import { resumoSemana } from '../base/semana.ts';

const conf = <T>(c: { estado: string; valor: T | null }): T | null =>
  c.estado === 'confirmado' ? c.valor : null;
const dataBr = (iso: string) => iso.split('-').reverse().join('/');

const MARCADORES: Record<string, string> = {
  pedro: profissional.nome.valor,
  nome: valorPreview(nomeCanonico) ?? '',
  instagram: `@${instagram.valor.usuario}`,
  whatsapp: telefone.valor,
  plusCode: plusCode.valor,
  cnpj: cnpj.valor,
  'endereco.curto':
    [conf(endereco.rua), conf(endereco.complemento)].filter(Boolean).join(', ') +
    ` — ${conf(endereco.bairro) ?? ''}`,
  // Número pendente: "nº a confirmar" (no preview). Confirmado como null: endereço sem número.
  'endereco.completo': [
    [
      conf(endereco.rua),
      endereco.numero.estado === 'confirmado' ? conf(endereco.numero) : 'nº a confirmar',
    ]
      .filter(Boolean)
      .join(', '),
    [conf(endereco.complemento), conf(endereco.salaAndar)].filter(Boolean).join(', '),
    conf(endereco.bairro),
    `${conf(endereco.cidade) ?? ''}/${conf(endereco.uf) ?? ''}`,
    `CEP ${conf(endereco.cep) ?? ''}`,
  ].join(', '),
  'endereco.referencia': conf(endereco.referencia) ?? '',
  'horario.semana': resumoSemana(),
  'google.nota': google.nota.valor.toFixed(1).replace('.', ','),
  'google.total': String(google.total.valor),
  'google.conferidoEm': dataBr(google.conferidoEm),
};

export interface Citacao {
  texto: string;
  fonte: string;
}
export interface ItemNumerado {
  nome: string;
  texto: string;
}
export interface Secao {
  titulo: string;
  paragrafos: string[];
  citacoes: Citacao[];
  links: string[];
  itens: ItemNumerado[];
  campos: Record<string, string>;
  provisorios: string[];
}

/** Troca {{marcadores}}; marcas [PROVISÓRIO: …] saem do texto e vão para a lista. */
export function resolver(texto: string, provisorios: string[] = []): string {
  return texto
    .replace(/\s*\[PROVISÓRIO: ([^\]]+)\]/g, (_, m: string) => {
      provisorios.push(m);
      return '';
    })
    .replace(/\{\{([\w.]+)\}\}/g, (_, k: string) => MARCADORES[k] ?? `{{${k}}}`)
    .trim();
}

let cache: string | null = null;
function home(): string {
  cache ??= readFileSync(join(process.cwd(), 'src/content/textos/home.md'), 'utf8');
  return cache;
}

/** Seção do home.md pelo começo do título ("3 ·", "Hero"...). */
export function secao(prefixo: string): Secao {
  const blocos = home().split(/^## /m);
  const bloco = blocos.find((b) => b.startsWith(prefixo));
  if (!bloco) throw new Error(`Seção "${prefixo}" não encontrada em home.md`);
  const s: Secao = {
    titulo: '',
    paragrafos: [],
    citacoes: [],
    links: [],
    itens: [],
    campos: {},
    provisorios: [],
  };
  const partes = bloco
    .split('\n')
    .slice(1)
    .join('\n')
    .split(/\n\s*\n/);
  for (const parte of partes.map((p) => p.trim()).filter(Boolean)) {
    if (parte === '---') continue;
    if (parte.startsWith('>')) {
      const linhas = parte.split('\n').map((l) => l.replace(/^>\s?/, ''));
      const fonte = linhas.find((l) => l.startsWith('Fonte:')) ?? '';
      s.citacoes.push({
        texto: resolver(
          linhas
            .filter((l) => !l.startsWith('Fonte:'))
            .join(' ')
            .replace(/^"|"$/g, ''),
          s.provisorios,
        ),
        // Na página vai a fonte curta; o detalhe de pesquisa (link, "provável", data) fica no .md.
        fonte: resolver(fonte.replace(/^Fonte:\s*/, ''), s.provisorios).replace(
          /\s*\([^)]*\)\s*$/,
          '',
        ),
      });
    } else if (/^\d+\.\s/.test(parte)) {
      for (const l of parte.split('\n')) {
        const m = l.match(/^\d+\.\s+\*\*(.+?)\.?\*\*\s*(.*)$/);
        if (m) s.itens.push({ nome: m[1] ?? '', texto: resolver(m[2] ?? '', s.provisorios) });
      }
    } else if (/^- /.test(parte)) {
      for (const l of parte.split('\n')) {
        const m = l.match(/^- ([^:]+):\s*(.*)$/);
        if (m) s.campos[m[1] ?? ''] = resolver(m[2] ?? '', s.provisorios);
      }
    } else {
      const m = parte.match(
        /^(Título|Link|Convite|Formação|Rótulo|H1|Subtítulo|Nota no Google):\s*(.*)$/s,
      );
      if (m) {
        const valor = resolver(m[2] ?? '', s.provisorios);
        if (m[1] === 'Título') s.titulo = valor;
        else if (m[1] === 'Link') s.links.push(valor);
        else s.campos[m[1] ?? ''] = valor;
      } else s.paragrafos.push(resolver(parte, s.provisorios));
    }
  }
  return s;
}

export const emPreview = modo !== 'producao';
export { MARCADORES };
