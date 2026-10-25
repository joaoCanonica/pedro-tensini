// QA de navegador (Playwright/Chromium) sobre o preview do dist/. Gera docs/qa/qa.json e capturas.
// Confere: axe (WCAG 2.2 AA) em todas as rotas, temas claro e escuro; vídeos não baixam em
// Save-Data/2g; teclado do começo ao fim (entrada → Pular → montador → WhatsApp); o que o leitor
// de tela recebe no montador e no status; reflow em 320 px e zoom 200%; movimento reduzido;
// pausar vídeo; Android (Pixel 7, 390 px); formato do link wa.me.
// Uso: pnpm build && pnpm qa
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { chromium, devices } from 'playwright';

const PORTA = Number(process.env.PORTA_QA ?? 4329);
const BASE = `http://127.0.0.1:${PORTA}`;
const SAIDA = join('docs', 'qa');
const AXE = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const ROTAS = [
  '/',
  '/agendar/',
  '/como-chegar/',
  '/servicos-e-precos/',
  '/degrade-em-lages/',
  '/barba-e-barbaterapia/',
  '/sobrancelha/',
  '/pomadas/',
  '/sobre-pedro-tensini/',
  '/perguntas-frequentes/',
  '/avaliar/',
  '/privacidade/',
  '/404.html',
];
mkdirSync(SAIDA, { recursive: true });
if (!existsSync('dist')) throw new Error('Rode "pnpm build" antes.');

const preview = spawn(
  'pnpm',
  ['exec', 'astro', 'preview', '--host', '127.0.0.1', '--port', String(PORTA)],
  {
    stdio: ['ignore', 'pipe', 'inherit'],
  },
);
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(BASE)).ok) break;
  } catch {
    // subindo
  }
  await new Promise((r) => setTimeout(r, 500));
}

let navegador;
try {
  navegador = await chromium.launch();
} catch {
  navegador = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
}
const relatorio = {
  data: new Date().toISOString(),
  navegador: navegador.version(),
  resultados: {},
};
const r = relatorio.resultados;
const rolarAteOFim = (p) =>
  p.evaluate(async () => {
    for (let y = 0; y < globalThis.document.body.scrollHeight; y += 400) {
      globalThis.scrollTo(0, y);
      await new Promise((ok) => setTimeout(ok, 40));
    }
  });

// —— 1. axe em todas as rotas, claro e escuro ——
r.axe = [];
for (const tema of ['escuro', 'claro']) {
  for (const rota of ROTAS) {
    const ctx = await navegador.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: 'reduce',
    });
    await ctx.addInitScript((t) => {
      globalThis.document.documentElement.dataset.theme = t;
    }, tema);
    const p = await ctx.newPage();
    await p.goto(BASE + rota);
    await rolarAteOFim(p);
    // evaluate (protocolo do DevTools) não passa pelo CSP da página; addScriptTag passaria.
    await p.evaluate(AXE);
    const res = await p.evaluate(() =>
      globalThis.axe.run(globalThis.document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
        },
      }),
    );
    r.axe.push({
      rota,
      tema,
      violacoes: res.violations.map((v) => ({
        id: v.id,
        impacto: v.impact,
        nos: v.nodes.length,
        alvo: v.nodes[0]?.target,
      })),
      aprovadas: res.passes.length,
      incompletas: res.incomplete.length,
    });
    await ctx.close();
  }
}

// —— 2. Save-Data e 2g: nenhum vídeo baixa ——
r.economia = [];
for (const [nome, conexao] of [
  ['save-data', { saveData: true, effectiveType: '4g' }],
  ['2g', { saveData: false, effectiveType: '2g' }],
  ['normal', null],
]) {
  const ctx = await navegador.newContext({ viewport: { width: 390, height: 844 } });
  if (conexao)
    await ctx.addInitScript((c) => {
      Object.defineProperty(globalThis.navigator, 'connection', { value: c, configurable: true });
    }, conexao);
  const videos = [];
  ctx.on(
    'request',
    (q) => /\.(webm|mp4)(\?|$)/.test(q.url()) && videos.push(q.url().split('/').pop()),
  );
  const p = await ctx.newPage();
  for (const rota of [
    '/',
    '/degrade-em-lages/',
    '/barba-e-barbaterapia/',
    '/sobre-pedro-tensini/',
    '/pomadas/',
  ]) {
    await p.goto(BASE + rota + (rota === '/' ? '?entrada=0' : ''));
    await rolarAteOFim(p);
    await p.waitForTimeout(800);
  }
  r.economia.push({ conexao: nome, videosBaixados: videos.length, arquivos: [...new Set(videos)] });
  await ctx.close();
}

// —— 3. Teclado do começo ao fim (home, primeira visita, com a entrada) ——
{
  const ctx = await navegador.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.route(/^https:\/\/wa\.me\//, (q) => q.abort());
  await p.goto(BASE + '/?entrada=1');
  const passos = [];
  const foco = () =>
    p.evaluate(() => {
      const a = globalThis.document.activeElement;
      return a
        ? `${a.tagName.toLowerCase()}${a.getAttribute('aria-label') ? `[${a.getAttribute('aria-label')}]` : ''} ${(a.textContent ?? '').trim().slice(0, 40)}`.trim()
        : '';
    });
  // Durante a entrada, o "Pular" é o primeiro alvo; qualquer tecla (inclusive Tab) encerra a
  // entrada e leva o foco à marca (sessão 4).
  passos.push(
    `entrada: ${await p.evaluate(() => globalThis.document.documentElement.dataset.entrada)}; Pular presente: ${await p.locator('.entrada__pular').count()}`,
  );
  await p.keyboard.press('Tab');
  await p.waitForTimeout(300);
  passos.push(
    `Tab → entrada: ${await p.evaluate(() => globalThis.document.documentElement.dataset.entrada)}, foco: ${await foco()}`,
  );
  // Tab até o primeiro serviço do montador.
  let tabs = 0;
  while (tabs < 200) {
    await p.keyboard.press('Tab');
    tabs++;
    const ok = await p.evaluate(
      () => globalThis.document.activeElement?.getAttribute('name') === 'servico',
    );
    if (ok) break;
  }
  passos.push(`${tabs} Tabs até o montador → ${await foco()}`);
  await p.keyboard.press('Space');
  // Dia: Tab até o grupo de dias, Setas para escolher um dia aberto.
  while (
    !(await p.evaluate(() => globalThis.document.activeElement?.getAttribute('name') === 'dia'))
  )
    await p.keyboard.press('Tab');
  await p.keyboard.press('ArrowDown');
  while (
    !(await p.evaluate(() => globalThis.document.activeElement?.getAttribute('name') === 'periodo'))
  )
    await p.keyboard.press('Tab');
  await p.keyboard.press('Space');
  while (
    !(await p.evaluate(() => globalThis.document.activeElement?.hasAttribute('data-montador-link')))
  )
    await p.keyboard.press('Tab');
  const href = await p.evaluate(() => globalThis.document.activeElement?.getAttribute('href'));
  passos.push(`Tab até "Abrir conversa no WhatsApp" → ${decodeURIComponent(href ?? '')}`);
  const resumo = await p.locator('[data-resumo]').textContent();
  const focoVisivel = await p.evaluate(() => {
    const a = globalThis.document.activeElement;
    const c = a && globalThis.getComputedStyle(a);
    return !!c && c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) >= 2;
  });
  r.teclado = { passos, resumoFalado: resumo, anelDeFocoVisivel: focoVisivel, linkWhatsApp: href };
  await p.screenshot({ path: join(SAIDA, 'teclado-montador-1440.jpg'), quality: 70 });
  await ctx.close();
}

// —— 4. O que o leitor de tela recebe: montador e status (árvore de acessibilidade) ——
{
  const ctx = await navegador.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  const p = await ctx.newPage();
  await p.goto(BASE + '/agendar/');
  r.leitorDeTela = {
    status: await p.locator('[data-status-vivo]').first().ariaSnapshot(),
    montador: await p.locator('[data-montador]').ariaSnapshot(),
    regioesVivas: await p.evaluate(() =>
      [...globalThis.document.querySelectorAll('[aria-live]')].map(
        (e) =>
          `${e.tagName.toLowerCase()} aria-live=${e.getAttribute('aria-live')} ${(e.getAttribute('class') ?? '').split(' ')[0]}`,
      ),
    ),
  };
  await ctx.close();
}

// —— 5. Reflow (320 px) e zoom 200% (1280 px → 640 px CSS) ——
r.reflow = [];
for (const [nome, w] of [
  ['320px', 320],
  ['zoom-200', 640],
]) {
  for (const rota of ROTAS) {
    const ctx = await navegador.newContext({
      viewport: { width: w, height: 720 },
      deviceScaleFactor: nome === 'zoom-200' ? 2 : 1,
      reducedMotion: 'reduce',
    });
    const p = await ctx.newPage();
    await p.goto(BASE + rota);
    const m = await p.evaluate(() => {
      const d = globalThis.document.documentElement;
      const largos = [...globalThis.document.querySelectorAll('main *, footer *')].filter((e) => {
        const b = e.getBoundingClientRect();
        const s = globalThis.getComputedStyle(e);
        return (
          b.width > 0 &&
          b.right > d.clientWidth + 1 &&
          s.position !== 'fixed' &&
          !e.closest('[class*="rolagem"], .tempos, ol.tempos')
        );
      });
      return {
        scroll: d.scrollWidth - d.clientWidth,
        cortados: largos
          .slice(0, 3)
          .map((e) => (e.getAttribute('class') ?? e.tagName).split(' ')[0]),
      };
    });
    r.reflow.push({ modo: nome, rota, rolagemHorizontal: m.scroll, foraDaTela: m.cortados });
    if (rota === '/' || rota === '/agendar/')
      await p.screenshot({
        path: join(SAIDA, `${nome}${rota === '/' ? '-home' : '-agendar'}.jpg`),
        quality: 60,
      });
    await ctx.close();
  }
}

// —— 6. Movimento reduzido: sem entrada, sem vídeo tocando, sem animação longa ——
{
  const ctx = await navegador.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  const p = await ctx.newPage();
  await p.goto(BASE + '/');
  await p.waitForTimeout(1500);
  await rolarAteOFim(p);
  r.movimentoReduzido = await p.evaluate(() => ({
    entrada: globalThis.document.documentElement.dataset.entrada ?? 'não rodou',
    videosTocando: [...globalThis.document.querySelectorAll('video')].filter((v) => !v.paused)
      .length,
    animacoesRodando: globalThis.document
      .getAnimations()
      .filter(
        (a) => a.playState === 'running' && Number(a.effect?.getComputedTiming().duration) > 200,
      ).length,
  }));
  await ctx.close();
}

// —— 7. Pausar vídeo (hero e loops) ——
{
  const ctx = await navegador.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(BASE + '/?entrada=0');
  await p
    .waitForFunction(() => !globalThis.document.querySelector('[data-hero-video]')?.paused, null, {
      timeout: 8000,
    })
    .catch(() => {});
  const antes = await p.evaluate(
    () => !globalThis.document.querySelector('[data-hero-video]').paused,
  );
  await p.locator('[data-hero-pausa]').click();
  const hero = await p.evaluate(() => ({
    pausado: globalThis.document.querySelector('[data-hero-video]').paused,
    rotulo: globalThis.document.querySelector('[data-hero-pausa]').textContent.trim(),
    pressed: globalThis.document.querySelector('[data-hero-pausa]').getAttribute('aria-pressed'),
  }));
  await p.locator('#degrade').scrollIntoViewIfNeeded();
  await p.waitForTimeout(1500);
  const loopAntes = await p.evaluate(
    () => !globalThis.document.querySelector('video[data-loop]').paused,
  );
  await p.locator('[data-loop-pausa]').first().click();
  const loop = await p.evaluate(() => ({
    pausados: [...globalThis.document.querySelectorAll('video[data-loop]')].every((v) => v.paused),
    rotulo: globalThis.document.querySelector('[data-loop-pausa]').textContent.trim(),
  }));
  r.pausarVideo = { heroTocavaAntes: antes, hero, loopTocavaAntes: loopAntes, loop };
  await ctx.close();
}

// —— 8. Android (Pixel 7) e links wa.me ——
{
  const ctx = await navegador.newContext({ ...devices['Pixel 7'], reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', (e) => erros.push(e.message));
  const linhas = [];
  for (const rota of ROTAS) {
    await p.goto(BASE + rota);
    const m = await p.evaluate(() => ({
      largura: globalThis.innerWidth,
      rolagem:
        globalThis.document.documentElement.scrollWidth -
        globalThis.document.documentElement.clientWidth,
      wa: [...globalThis.document.querySelectorAll('a[href*="wa.me"]')].map((a) =>
        a.getAttribute('href'),
      ),
      alvosPequenos: [...globalThis.document.querySelectorAll('a, button, input, summary')].filter(
        (e) => {
          const b = e.getBoundingClientRect();
          const s = globalThis.getComputedStyle(e);
          return (
            b.width > 0 &&
            b.height > 0 &&
            s.visibility !== 'hidden' &&
            (b.height < 24 || b.width < 24) &&
            !e.closest('p, li, dd, address, figcaption, nav')
          );
        },
      ).length,
    }));
    const waOk = m.wa.every((h) => /^https:\/\/wa\.me\/5549999037620\?text=[^&]+$/.test(h));
    linhas.push({
      rota,
      largura: m.largura,
      rolagemHorizontal: m.rolagem,
      linksWhatsApp: m.wa.length,
      formatoWaMe: waOk,
      alvosMenoresQue24px: m.alvosPequenos,
    });
  }
  await p.goto(BASE + '/');
  await p.screenshot({ path: join(SAIDA, 'android-pixel7-home.jpg'), quality: 70 });
  r.android = { dispositivo: 'Pixel 7 (emulado)', paginas: linhas, erros };
  await ctx.close();
}

// —— 9. CSP: nenhuma violação em nenhuma rota, e o mapa do Google entra depois do "Aceitar" ——
{
  const ctx = await navegador.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  await ctx.addInitScript(() => {
    globalThis.__csp = [];
    globalThis.document.addEventListener('securitypolicyviolation', (e) =>
      globalThis.__csp.push(`${e.violatedDirective} ${e.blockedURI}`),
    );
  });
  await ctx.route(/google\./, (q) =>
    q.fulfill({ status: 200, contentType: 'text/html', body: '<p>mapa</p>' }),
  );
  const p = await ctx.newPage();
  const violacoes = [];
  let metas = 0;
  for (const rota of ROTAS) {
    await p.goto(BASE + rota);
    await rolarAteOFim(p);
    metas += await p.locator('meta[http-equiv="Content-Security-Policy"]').count();
    violacoes.push(...(await p.evaluate(() => globalThis.__csp)).map((v) => `${rota} ${v}`));
  }
  await p.goto(BASE + '/como-chegar/');
  await p.locator('[data-consent="aceito"]').click();
  await p.locator('[data-mapa-carregar]').click();
  await p.waitForTimeout(500);
  violacoes.push(...(await p.evaluate(() => globalThis.__csp)).map((v) => `mapa ${v}`));
  r.csp = {
    paginasComMeta: metas,
    violacoes,
    mapaCarregou: (await p.locator('.mapa-i__iframe').count()) === 1,
  };
  await ctx.close();
}

await navegador.close();
preview.kill();
writeFileSync(join(SAIDA, 'qa.json'), JSON.stringify(relatorio, null, 2));

// —— Resumo ——
const v = r.axe.filter((x) => x.violacoes.length);
console.log(`axe: ${r.axe.length} varreduras, ${v.length} com violação`);
for (const x of v)
  console.log(
    `  ${x.tema} ${x.rota}: ${x.violacoes.map((y) => `${y.id}(${y.impacto},${y.nos})`).join(' ')}`,
  );
console.log('economia:', r.economia.map((e) => `${e.conexao}=${e.videosBaixados}`).join(' '));
console.log('teclado:', r.teclado.passos.join(' | '));
console.log(
  '  resumo falado:',
  r.teclado.resumoFalado,
  '· anel de foco:',
  r.teclado.anelDeFocoVisivel,
);
console.log(
  'reflow:',
  r.reflow
    .filter((x) => x.rolagemHorizontal > 0 || x.foraDaTela.length)
    .map((x) => `${x.modo} ${x.rota} ${x.rolagemHorizontal}px ${x.foraDaTela}`)
    .join(' ; ') || 'sem rolagem horizontal nem corte',
);
console.log('movimento reduzido:', JSON.stringify(r.movimentoReduzido));
console.log('pausar:', JSON.stringify(r.pausarVideo));
console.log(
  'android:',
  r.android.paginas
    .map(
      (x) =>
        `${x.rota} ${x.rolagemHorizontal}px wa=${x.linksWhatsApp}/${x.formatoWaMe} alvos<24=${x.alvosMenoresQue24px}`,
    )
    .join(' ; '),
  'erros:',
  r.android.erros.length,
);

// —— Código de saída: qualquer falha derruba (para usar em CI) ——
const falhas = [
  ...r.axe.filter((x) => x.violacoes.length).map((x) => `axe ${x.tema} ${x.rota}`),
  ...r.economia
    .filter((e) => e.conexao !== 'normal' && e.videosBaixados)
    .map((e) => `vídeo em ${e.conexao}`),
  ...r.reflow
    .filter((x) => x.rolagemHorizontal > 0 || x.foraDaTela.length)
    .map((x) => `reflow ${x.modo} ${x.rota}`),
  ...(r.movimentoReduzido.videosTocando || r.movimentoReduzido.animacoesRodando
    ? ['movimento reduzido']
    : []),
  ...(!r.pausarVideo.hero.pausado || !r.pausarVideo.loop.pausados ? ['pausar vídeo'] : []),
  ...r.android.paginas
    .filter((x) => x.rolagemHorizontal || !x.formatoWaMe)
    .map((x) => `android ${x.rota}`),
  ...(r.csp.violacoes.length ? ['csp'] : []),
  ...(!r.teclado.linkWhatsApp?.startsWith('https://wa.me/') || !r.teclado.anelDeFocoVisivel
    ? ['teclado']
    : []),
];
if (falhas.length) {
  console.error(`QA: ${falhas.length} falha(s): ${falhas.join(', ')}`);
  process.exitCode = 1;
} else console.log('QA: tudo ok.');
