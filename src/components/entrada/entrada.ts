// Linha do tempo da "Passada" (WAAPI). Todos os tempos em ms a partir do início.
//   0–250   carvão; o TB está lá, desfocado e escuro.
//   250–1000 a linha de latão desce pelo monograma; atrás dela o TB fica nítido e latão;
//            "TENSINI" aparece letra a letra com o espaçamento fechando.
//   1000–1700 a linha desce pela tela; atrás dela o pôster passa de desfocado a nítido.
//   1700–2400 o TB voa para o cabeçalho (FLIP); entram H1, status/endereço e o botão.
// Qualquer toque, clique, tecla ou rolagem leva ao estado final.
const d = document.documentElement;
const camada = document.querySelector<HTMLElement>('.entrada');
const pular = document.querySelector<HTMLButtonElement>('.entrada__pular');

const CURVA = 'cubic-bezier(0.7, 0, 0.18, 1)';
const TOTAL = 2400;
const animacoes: Animation[] = [];
let acabou = false;

/** fill "both" para entradas; saídas ("forwards") não podem sobrescrever o estado inicial. */
function anima(
  el: Element,
  quadros: Keyframe[],
  delay: number,
  duration: number,
  easing = CURVA,
  fill: FillMode = 'both',
): Animation {
  const a = el.animate(quadros, { delay, duration, easing, fill });
  animacoes.push(a);
  return a;
}

function finalizar(focar = false): void {
  if (acabou) return;
  acabou = true;
  for (const a of animacoes) a.cancel();
  camada?.remove();
  pular?.remove();
  d.dataset['entrada'] = 'feita';
  removerEscutas();
  if (focar) document.querySelector<HTMLElement>('[data-entrada-alvo]')?.focus();
  document.dispatchEvent(new Event('tb:entrada-fim'));
}

const TECLAS_QUE_ROLAM = new Set([
  'Tab',
  'Enter',
  ' ',
  'Spacebar',
  'ArrowDown',
  'ArrowUp',
  'PageDown',
  'PageUp',
  'Home',
  'End',
]);
const aoTeclar = (e: KeyboardEvent): void => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (TECLAS_QUE_ROLAM.has(e.key)) e.preventDefault();
  finalizar(true);
};
const aoInteragir = (): void => finalizar(false);
const escutas: [string, EventListener][] = [
  ['keydown', aoTeclar as EventListener],
  ['pointerdown', aoInteragir],
  ['wheel', aoInteragir],
  ['touchmove', aoInteragir],
  ['scroll', aoInteragir],
  ['resize', aoInteragir],
];
function removerEscutas(): void {
  for (const [tipo, fn] of escutas) removeEventListener(tipo, fn, true);
}

function rodar(): void {
  if (!camada || !pular) return;
  camada.dataset['rodando'] = '';
  for (const [tipo, fn] of escutas)
    addEventListener(tipo, fn, { capture: true, passive: tipo !== 'keydown' });
  pular.addEventListener('click', () => finalizar(true));

  const vw = innerWidth;
  const vh = innerHeight;
  const alvo = document.querySelector<HTMLElement>('[data-entrada-alvo]');
  const poster = document.querySelector<HTMLImageElement>('[data-hero-poster] img');
  const svg = alvo?.querySelector('svg');
  if (!alvo || !poster || !svg) return finalizar();

  // Monograma no centro, um pouco acima do meio.
  const lado = Math.round(Math.min(vw * 0.42, vh * 0.26, 240));
  const monoTopo = Math.round(vh * 0.36 - lado / 2);
  const monoEsq = Math.round((vw - lado) / 2);
  const posMono = `left:${monoEsq}px;top:${monoTopo}px;width:${lado}px`;
  const fazerMono = (classe: string): SVGSVGElement => {
    const m = svg.cloneNode(true) as SVGSVGElement;
    m.removeAttribute('role');
    m.removeAttribute('aria-label');
    m.querySelector('title')?.remove();
    m.setAttribute('class', `entrada__mono ${classe}`);
    m.setAttribute('style', posMono);
    return m;
  };

  // Pôster: duas camadas do MESMO arquivo, no retângulo exato do pôster da página.
  const r = poster.getBoundingClientRect();
  const posPoster = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`;
  const fazerImg = (classe: string): HTMLImageElement => {
    const i = new Image();
    i.src = poster.currentSrc || poster.src;
    i.alt = '';
    i.decoding = 'async';
    i.className = `entrada__img ${classe}`;
    i.setAttribute('style', posPoster);
    return i;
  };

  const desfocado = fazerImg('entrada__desfocado');
  const monoDim = fazerMono('entrada__mono-dim');
  const revelado = document.createElement('div');
  revelado.className = 'entrada__revelado';
  const nitido = fazerImg('entrada__nitido');
  const mono = fazerMono('entrada__mono-nitido');
  revelado.append(nitido, mono);

  const nome = document.createElement('p');
  nome.className = 'entrada__nome';
  const tamanhoNome = Math.max(15, Math.round(lado * 0.16));
  nome.setAttribute(
    'style',
    `left:0;right:0;top:${monoTopo + lado + Math.round(lado * 0.16)}px;font-size:${tamanhoNome}px`,
  );
  for (const letra of 'TENSINI') {
    const s = document.createElement('span');
    s.textContent = letra;
    nome.append(s);
  }
  const linha = document.createElement('span');
  linha.className = 'entrada__linha';
  camada.append(desfocado, monoDim, revelado, nome, linha);

  // A linha (transform: sem CLS) passa pela base do monograma aos 1,0 s e chega ao fim da tela aos 1,7 s.
  const base = Math.min(96, ((monoTopo + lado + 8) / vh) * 100);
  const corte = (y: number) => `inset(0 0 ${(100 - y).toFixed(2)}% 0)`;
  const desce = [
    { offset: 0, easing: 'cubic-bezier(0.55, 0, 0.35, 1)' },
    { offset: 750 / 1450, easing: 'cubic-bezier(0.45, 0, 0.25, 1)' },
    { offset: 1 },
  ];
  anima(
    linha,
    [
      { ...desce[0], transform: 'translateY(0px)' },
      { ...desce[1], transform: `translateY(${((base / 100) * vh).toFixed(1)}px)` },
      { ...desce[2], transform: `translateY(${vh}px)` },
    ],
    250,
    1450,
    'linear',
  );
  anima(
    linha,
    [{ opacity: 0 }, { opacity: 1, offset: 0.04 }, { opacity: 1, offset: 0.94 }, { opacity: 0 }],
    250,
    1500,
    'linear',
  );
  anima(
    revelado,
    [
      { ...desce[0], clipPath: corte(0) },
      { ...desce[1], clipPath: corte(base) },
      { ...desce[2], clipPath: corte(100) },
    ],
    250,
    1450,
    'linear',
  );

  // Monograma: quase invisível → nítido e latão atrás da linha.
  anima(monoDim, [{ opacity: 0.16 }, { opacity: 0 }], 1000, 300, CURVA, 'forwards');
  anima(mono, [{ filter: 'blur(5px)' }, { filter: 'blur(0px)' }], 250, 750);

  // TENSINI: letra a letra, espaçamento fechando (sem bounce).
  // Espaçamento fechando por transform (não move layout: CLS zero).
  [...nome.children].forEach((letra, i) => {
    const abre = (i - 3) * 0.55;
    anima(letra, [{ transform: `translateX(${abre}em)` }, { transform: 'none' }], 420, 600);
    anima(letra, [{ opacity: 0 }, { opacity: 1 }], 420 + i * 60, 220, 'linear');
  });
  anima(nome, [{ opacity: 1 }, { opacity: 0 }], 1700, 200, CURVA, 'forwards');

  // Pôster aparece desfocado e escuro; atrás da linha, nítido.
  for (const img of [desfocado, nitido])
    anima(img, [{ opacity: 0 }, { opacity: 1 }], 650, 350, 'linear');

  // 1,7 s: o TB voa para o cabeçalho (FLIP com WAAPI) e o carvão da camada se abre para a página.
  const para = alvo.getBoundingClientRect();
  const escala = para.width / lado;
  anima(
    mono,
    [
      { transformOrigin: '0 0', transform: 'none' },
      {
        transformOrigin: '0 0',
        transform: `translate(${para.left - monoEsq}px, ${para.top - monoTopo}px) scale(${escala})`,
      },
    ],
    1700,
    500,
  );
  anima(
    camada,
    [{ backgroundColor: 'rgb(18 19 22 / 1)' }, { backgroundColor: 'rgb(18 19 22 / 0)' }],
    1700,
    400,
  );
  anima(desfocado, [{ opacity: 1 }, { opacity: 0 }], 1700, 300, 'linear', 'forwards');
  // A cópia nítida é idêntica ao pôster da página: some por cima dele sem salto e libera o texto.
  anima(nitido, [{ opacity: 1 }, { opacity: 0 }], 1720, 280, 'linear', 'forwards');

  // Texto do hero entra em sequência curta.
  [...document.querySelectorAll('.hero [data-entra]')].forEach((el, i) =>
    anima(
      el,
      [
        { opacity: 0, transform: 'translateY(14px)' },
        { opacity: 1, transform: 'none' },
      ],
      1720 + i * 80,
      280,
    ),
  );

  // O "Pular" sai no fim (segue clicável) para não cobrir o botão de agendar.
  anima(pular, [{ opacity: 1 }, { opacity: 0 }], 2100, 300, 'linear', 'forwards');

  setTimeout(() => finalizar(false), TOTAL);
}

if (d.dataset['entrada'] === 'ativa') rodar();

export {};
