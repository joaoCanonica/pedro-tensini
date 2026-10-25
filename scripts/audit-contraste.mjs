// Valida AA (WCAG 2.2) de cada par texto/fundo usado, em cada superfície.
// Lê src/styles/tokens.css (blocos @paleta e @superficie) e confere a paleta de src/config/tema.ts.
// Uso: pnpm audit-contraste
import { readFile } from 'node:fs/promises';
import { cores } from '../src/config/tema.ts';

const RAIZ = new URL('../', import.meta.url).pathname;
const css = (await readFile(`${RAIZ}src/styles/tokens.css`, 'utf8')).replace(
  /\/\*(?!\s*@)[\s\S]*?\*\//g,
  '',
);

const variaveis = (bloco) =>
  Object.fromEntries(
    [...bloco.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]),
  );
const paleta = variaveis(css.match(/\/\*\s*@paleta\s*\*\/[^{]*\{([^}]*)\}/)[1]);
const superficies = Object.fromEntries(
  [...css.matchAll(/\/\*\s*@superficie\s+(\w+)\s*\*\/[^{]*\{([^}]*)\}/g)].map((m) => [
    m[1],
    variaveis(m[2]),
  ]),
);

function resolver(valor, sup) {
  const ref = valor.match(/^var\((--[\w-]+)\)$/);
  if (ref) return resolver(sup[ref[1]] ?? paleta[ref[1]] ?? 'indefinido', sup);
  return valor;
}
function rgb(hex) {
  const h = hex.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`cor não sólida ou inválida: ${hex}`);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
}
const lum = (hex) => {
  const [r, g, b] = rgb(hex).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contraste = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

// Pares usados nos componentes (texto 4,5:1; elementos gráficos e foco 3:1).
const PARES = [
  ['--texto', '--fundo', 4.5, 'texto corrido'],
  ['--texto-2', '--fundo', 4.5, 'texto secundário'],
  ['--acento-texto', '--fundo', 4.5, 'números da escala, rótulos de destaque, "hoje"'],
  ['--botao-texto', '--botao-fundo', 4.5, 'botão primário'],
  ['--texto', '--fundo', 4.5, 'botão secundário (texto)'],
  ['--botao-2-borda', '--fundo', 3, 'botão secundário (borda)'],
  ['--foco', '--fundo', 3, 'anel de foco'],
  ['--ponto-aberto', '--fundo', 3, 'ponto do status (aberto)'],
  ['--ponto-fechado', '--fundo', 3, 'ponto do status (fechado)'],
];
const EXTRAS = [
  ['--carvao', '--latao', 4.5, 'faixa de preview (carvão sobre latão)'],
  ['--latao', '--carvao', 3, 'monograma latão sobre carvão (gráfico)'],
  ['--latao', '--navy', 3, 'monograma latão sobre navy (gráfico)'],
];

let falhas = 0;
const linha = (ok, r, min, a, b, nome) =>
  console.log(
    `${ok ? 'ok  ' : 'FALHA'} ${r.toFixed(2).padStart(5)}:1 (mín ${min}) ${a} sobre ${b} — ${nome}`,
  );
for (const [nome, sup] of Object.entries(superficies)) {
  console.log(`\n[${nome}]`);
  for (const [t, f, min, uso] of PARES) {
    const a = resolver(sup[t] ?? `var(${t})`, sup);
    const b = resolver(sup[f] ?? `var(${f})`, sup);
    const r = contraste(a, b);
    if (r < min) falhas++;
    linha(r >= min, r, min, `${t} ${a}`, `${f} ${b}`, uso);
  }
}
console.log('\n[paleta]');
for (const [t, f, min, uso] of EXTRAS) {
  const r = contraste(paleta[t], paleta[f]);
  if (r < min) falhas++;
  linha(r >= min, r, min, `${t} ${paleta[t]}`, `${f} ${paleta[f]}`, uso);
}
// A paleta do CSS e a de src/config/tema.ts não podem divergir.
for (const [k, v] of Object.entries(cores)) {
  const nome = `--${k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
  if (paleta[nome]?.toLowerCase() !== v.toLowerCase()) {
    falhas++;
    console.log(`FALHA tema.ts ${k}=${v} diferente de tokens.css ${nome}=${paleta[nome]}`);
  }
}
console.log(
  falhas ? `\n[contraste] ${falhas} falha(s).` : '\n[contraste] AA ok em todos os pares.',
);
process.exit(falhas ? 1 : 0);
