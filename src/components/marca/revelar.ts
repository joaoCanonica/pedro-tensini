// "O Degradê": revelações por evento (uma vez), nunca pelo progresso do scroll.
// [data-passada]: linha de latão desce e revela o bloco por clip-path (WAAPI).
// [data-acender]: borda em hachura acende uma vez (classe; a transição fica no CSS).
const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;

function passada(el: HTMLElement): void {
  const conteudo = el.querySelector<HTMLElement>('.passada__conteudo');
  const linha = el.querySelector<HTMLElement>('.passada__linha');
  if (!conteudo || !linha || reduzir) {
    el.dataset['passada'] = 'feita';
    return;
  }
  const dur = Number(el.dataset['duracao'] ?? 600);
  const opcoes: KeyframeAnimationOptions = {
    duration: dur,
    easing: 'cubic-bezier(0.7, 0, 0.18, 1)',
    fill: 'forwards',
  };
  const quadros: Keyframe[] = [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' }];
  if (el.dataset['desfoque'] !== undefined) {
    quadros[0] = { ...quadros[0], filter: 'blur(12px)' };
    quadros[1] = { ...quadros[1], filter: 'blur(0px)' };
  }
  const anim = conteudo.animate(quadros, opcoes);
  // A linha acompanha a borda do recorte: mesmo tempo, mesma curva, "top" na mesma thread do clip-path.
  linha.animate([{ top: '0%' }, { top: '100%' }], opcoes);
  linha.animate([{ opacity: 1 }, { opacity: 1, offset: 0.9 }, { opacity: 0 }], opcoes);
  void anim.finished.then(() => {
    el.dataset['passada'] = 'feita';
    anim.cancel();
  });
}

const io = new IntersectionObserver(
  (entradas) => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      const el = e.target as HTMLElement;
      io.unobserve(el);
      if ('passada' in el.dataset) passada(el);
      else el.dataset['acender'] = 'acesa';
    }
  },
  { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
);

for (const el of document.querySelectorAll<HTMLElement>('[data-passada=""], [data-acender=""]')) {
  if (reduzir) {
    if ('passada' in el.dataset) el.dataset['passada'] = 'feita';
    else el.dataset['acender'] = 'acesa';
  } else io.observe(el);
}
