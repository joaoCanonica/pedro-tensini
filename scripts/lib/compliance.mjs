// Auditoria de HTML gerado (dist/): termos vetados, preço sem fonte,
// mídia naoUsar referenciada e links wa.me. Função pura, testável.
import { encontrarTermosVetados } from '../../src/config/termos.ts';

const ENTIDADES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ordm: 'º',
  deg: '°',
};

export function decodificar(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#')
      return String.fromCodePoint(
        e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : Number(e.slice(1)),
      );
    return ENTIDADES[e.toLowerCase()] ?? m;
  });
}

/** Texto que o visitante, o Google ou uma IA leem: corpo, atributos de texto e JSON-LD. */
export function textoAuditavel(html) {
  const ldjson = [
    ...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ].map((m) => m[1]);
  const atributos = [
    ...html.matchAll(
      /\s(?:alt|title|aria-label|aria-description|placeholder|content)\s*=\s*("([^"]*)"|'([^']*)')/gi,
    ),
  ].map((m) => m[2] ?? m[3] ?? '');
  const corpo = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  return decodificar([corpo, ...atributos, ...ldjson].join('\n'));
}

const RE_PRECO =
  /R\$\s*(\d{1,4}(?:[.,]\d{1,2})?)(?:\s*[–-]\s*(?:R\$\s*)?(\d{1,4}(?:[.,]\d{1,2})?))?/g;
const RE_WA = /https?:\/\/(?:wa\.me\/|api\.whatsapp\.com\/send\/?\?(?:[^"'\s]*&)?phone=)(\d*)/gi;
const numeroDe = (s) => Number(s.replace(',', '.'));

/**
 * @param {string} html
 * @param {{ precosConfirmados: Set<number>, idsAtivos: Set<string>, idsVetados: Set<string>,
 *           nomesOriginais: string[], numero: string | null }} ctx
 * @returns {{ trava: string, detalhe: string }[]}
 */
export function auditarHtml(html, ctx) {
  const problemas = [];
  const texto = textoAuditavel(html);

  for (const o of encontrarTermosVetados(texto))
    problemas.push({ trava: 'termo-vetado', detalhe: `"${o.termo}" em "${o.trecho}"` });

  for (const m of texto.matchAll(RE_PRECO)) {
    const valores = [m[1], m[2]].filter(Boolean).map(numeroDe);
    const semFonte = valores.filter((v) => !ctx.precosConfirmados.has(v));
    if (semFonte.length)
      problemas.push({
        trava: 'preco-sem-fonte',
        detalhe: `"${m[0].trim()}" sem preço confirmado na config`,
      });
  }

  for (const m of html.matchAll(/\/media\/([a-z0-9-]+)(?=[/"'\s?#)])/g)) {
    const id = m[1];
    if (id === 'media-index.json') continue;
    if (ctx.idsVetados.has(id))
      problemas.push({ trava: 'midia-nao-usar', detalhe: `/media/${id}/ é naoUsar` });
    else if (!ctx.idsAtivos.has(id))
      problemas.push({
        trava: 'midia-nao-usar',
        detalhe: `/media/${id}/ não é derivado ativo do manifesto`,
      });
  }
  if (/media-originais\//.test(html))
    problemas.push({ trava: 'midia-nao-usar', detalhe: 'referência direta a media-originais/' });
  for (const nome of ctx.nomesOriginais)
    if (html.includes(nome))
      problemas.push({ trava: 'midia-nao-usar', detalhe: `referência ao original ${nome}` });

  for (const m of html.matchAll(RE_WA)) {
    if (!ctx.numero || m[1] !== ctx.numero)
      problemas.push({
        trava: 'whatsapp',
        detalhe: `link "${m[0]}" não aponta para ${ctx.numero ?? '(WhatsApp ausente na config)'}`,
      });
  }
  return problemas;
}
