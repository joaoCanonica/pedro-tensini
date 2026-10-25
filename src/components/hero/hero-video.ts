// Vídeo do hero: só carrega depois de o pôster pintar, nunca em Save-Data ou 2g,
// não toca com movimento reduzido e respeita a pausa. Entra por cima do pôster
// quando já está tocando (o laço começa no quadro do pôster: sem salto).
const video = document.querySelector<HTMLVideoElement>('[data-hero-video]');
const botao = document.querySelector<HTMLButtonElement>('[data-hero-pausa]');
const img = document.querySelector<HTMLImageElement>('[data-hero-poster] img');

type Conexao = { saveData?: boolean; effectiveType?: string };
const conexao = (navigator as Navigator & { connection?: Conexao }).connection;
const economia = Boolean(conexao?.saveData) || /(^|-)2g$/.test(conexao?.effectiveType ?? '');
const reduzir = matchMedia('(prefers-reduced-motion: reduce)');
let pausadoPeloUsuario = false;
try {
  pausadoPeloUsuario = sessionStorage.getItem('tb-video-pausado') === '1';
} catch {
  /* sem storage: segue o padrão */
}

function rotular(tocando: boolean): void {
  if (!botao) return;
  botao.setAttribute('aria-pressed', String(!tocando));
  const texto = botao.querySelector('.hero__pausa-texto');
  if (texto) texto.textContent = tocando ? 'Pausar vídeo' : 'Tocar vídeo';
}

function tocar(): void {
  if (!video) return;
  // Só troca o preload: isso já inicia o download. Um load() a mais abortava e recomeçava o
  // pedido (o vídeo saía baixado duas vezes).
  if (video.preload !== 'auto') video.preload = 'auto';
  void video.play().catch(() => rotular(false));
}

function pausar(): void {
  video?.pause();
  rotular(false);
}

function podeTocarSozinho(): boolean {
  return !economia && !reduzir.matches && !pausadoPeloUsuario;
}

/** Chamado no fim da entrada (ou já, se não houver entrada). */
function iniciar(): void {
  if (!video || !botao) return;
  botao.hidden = false;
  rotular(false);
  if (podeTocarSozinho()) tocar();
}

if (video && botao) {
  video.addEventListener('playing', () => {
    video.dataset['tocando'] = '';
    rotular(true);
  });
  video.addEventListener('pause', () => rotular(false));
  botao.addEventListener('click', () => {
    const tocando = !video.paused;
    pausadoPeloUsuario = tocando;
    try {
      sessionStorage.setItem('tb-video-pausado', tocando ? '1' : '0');
    } catch {
      /* sem storage */
    }
    if (tocando) pausar();
    else tocar();
  });
  reduzir.addEventListener('change', () =>
    reduzir.matches ? pausar() : podeTocarSozinho() && tocar(),
  );

  // Espera o pôster pintar (LCP) e a entrada terminar.
  const aposPoster = (): void => {
    const pronto = () =>
      requestAnimationFrame(() => requestAnimationFrame(iniciarQuandoEntradaAcabar));
    if (!img || img.complete) pronto();
    else img.addEventListener('load', pronto, { once: true });
  };
  const iniciarQuandoEntradaAcabar = (): void => {
    if (document.documentElement.dataset['entrada'] === 'ativa')
      document.addEventListener('tb:entrada-fim', iniciar, { once: true });
    else iniciar();
  };
  if (document.readyState === 'complete') aposPoster();
  else addEventListener('load', aposPoster, { once: true });
}

export {};
