// E2E do funil (Playwright, 390 px). Sobe o preview do dist/ e confere:
// 1. Montador: 4 cenários geram o link wa.me EXATO (relógio fixo em America/Sao_Paulo).
// 2. Medição: o clique dispara clique_whatsapp com origem e serviço; a origem não vai na URL.
// 3. LGPD: nenhuma requisição a terceiros antes do consentimento (todas as páginas, rolando
//    até o fim); o mapa do Google só depois de "Aceitar". Salva o HAR e a captura da rede em
//    docs/capturas/funil/.
// Uso: pnpm build && pnpm test:e2e
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const PORTA = Number(process.env.PORTA_E2E ?? 4329);
const BASE = `http://127.0.0.1:${PORTA}`;
const SAIDA = join('docs', 'capturas', 'funil');
const NUMERO = '5549999037620';
const wa = (texto) => `https://wa.me/${NUMERO}?text=${encodeURIComponent(texto)}`;
const PADRAO = 'Olá, Pedro! Vim pelo site e quero agendar um horário.';
const PAGINAS = [
  '/',
  '/degrade-em-lages/',
  '/barba-e-barbaterapia/',
  '/sobrancelha/',
  '/pomadas/',
  '/servicos-e-precos/',
  '/como-chegar/',
  '/sobre-pedro-tensini/',
  '/agendar/',
  '/perguntas-frequentes/',
  '/avaliar/',
  '/privacidade/',
  '/404.html',
];

if (!existsSync('dist')) {
  console.error('dist/ não existe. Rode "pnpm build" antes.');
  process.exit(1);
}
mkdirSync(SAIDA, { recursive: true });

const preview = spawn(
  'pnpm',
  ['exec', 'astro', 'preview', '--host', '127.0.0.1', '--port', String(PORTA)],
  { stdio: ['ignore', 'pipe', 'inherit'] },
);
async function esperar() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(BASE)).ok) return;
    } catch {
      // subindo
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Preview não respondeu em ${BASE}`);
}

const resultados = [];
async function caso(nome, fn) {
  try {
    await fn();
    resultados.push({ nome, ok: true });
    console.log(`  ok  ${nome}`);
  } catch (e) {
    resultados.push({ nome, ok: false, erro: e });
    console.log(`  FALHOU  ${nome}\n        ${e.message.split('\n').join('\n        ')}`);
  }
}

async function abrir(navegador, rota, quando, opcoes = {}) {
  const contexto = await navegador.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    timezoneId: 'America/Sao_Paulo',
    ...opcoes,
  });
  const pagina = await contexto.newPage();
  if (quando) await pagina.clock.setFixedTime(new Date(quando));
  // Nada sai do site: WhatsApp, Waze etc. são abortados (o evento já foi registrado no clique).
  await pagina.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, (r) => r.abort());
  await pagina.goto(BASE + rota);
  // Na home, a entrada ("passada") pula com qualquer tecla (sessão 4): espera ela terminar.
  if (opcoes.javaScriptEnabled !== false)
    await pagina.waitForFunction(
      () => globalThis.document.documentElement.dataset.entrada !== 'ativa',
    );
  return { contexto, pagina };
}
/** Marca pelo teclado (foco + Espaço): é como uma pessoa faz, e nada por cima atrapalha. */
async function marcar(locator) {
  if (await locator.isChecked()) return;
  await locator.focus();
  await locator.press('Space');
}
const linkDoMontador = (p) => p.locator('[data-montador-link]').getAttribute('href');
const avisos = async (p) => ({
  dia: ((await p.locator('[data-aviso-dia]').textContent()) ?? '').trim(),
  periodo: ((await p.locator('[data-aviso-periodo]').textContent()) ?? '').trim(),
});

let navegador;
try {
  await esperar();
  try {
    navegador = await chromium.launch();
  } catch {
    navegador = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  }

  console.log('Montador (390 px)');

  await caso('1. Só teclado: degradê, amanhã, à tarde, com nome (quinta 10h)', async () => {
    const { contexto, pagina: p } = await abrir(
      navegador,
      '/agendar/',
      '2026-10-29T10:00:00-03:00',
    );
    await p.locator('input[name=servico][value="Degradê"]').focus();
    await p.keyboard.press('Space');
    await p.locator('input[name=dia][value=hoje]').focus();
    await p.keyboard.press('Space');
    await p.keyboard.press('ArrowDown'); // hoje → amanhã (setas dentro do grupo de rádios)
    await p.locator('input[name=periodo][value=manha]').focus();
    await p.keyboard.press('Space');
    await p.keyboard.press('ArrowRight'); // manhã → tarde
    await p.locator('input[name=nome]').focus();
    await p.keyboard.type('João');
    const texto =
      'Olá, Pedro! Vim pelo site e quero agendar: degradê. Prefiro amanhã (sexta, 30/10), tarde. Meu nome é João.';
    assert.equal(await linkDoMontador(p), wa(texto));
    assert.equal(
      (await p.locator('[data-resumo]').textContent())?.trim(),
      'Sua escolha: Degradê, amanhã, à tarde.',
    );
    assert.equal(await p.locator('[data-resumo]').getAttribute('aria-live'), 'polite');
    await contexto.close();
  });

  await caso('2. Barba e sobrancelha, hoje à noite; manhã já passou (segunda 17h30)', async () => {
    const { contexto, pagina: p } = await abrir(navegador, '/', '2026-10-26T17:30:00-03:00');
    await marcar(p.locator('input[name=servico][value="Barba"]'));
    await marcar(p.locator('input[name=servico][value="Sobrancelha"]'));
    await marcar(p.locator('input[name=dia][value=hoje]'));
    assert.equal(await p.locator('input[name=periodo][value=manha]').isDisabled(), true);
    assert.equal((await avisos(p)).periodo, 'Manhã: já passou.');
    await marcar(p.locator('input[name=periodo][value=noite]'));
    const texto =
      'Olá, Pedro! Vim pelo site e quero agendar: barba e sobrancelha. Prefiro hoje (segunda, 26/10), noite.';
    assert.equal(await linkDoMontador(p), wa(texto));
    await contexto.close();
  });

  await caso('3. Página de degradê: domingo fechado, sábado sem noite (sábado 9h)', async () => {
    const { contexto, pagina: p } = await abrir(
      navegador,
      '/degrade-em-lages/',
      '2026-10-31T09:00:00-03:00',
    );
    assert.equal(await p.locator('input[name=servico][value="Degradê"]').isChecked(), true);
    // Amanhã é domingo: desabilitado com o motivo no rótulo.
    assert.equal(await p.locator('input[name=dia][value=amanha]').isDisabled(), true);
    assert.match(
      (await p.locator('input[name=dia][value=amanha] + span').textContent()) ?? '',
      /domingo fechado/,
    );
    await marcar(p.locator('input[name=dia][value=data]'));
    await p.locator('input[name=data]').fill('2026-11-01');
    assert.equal((await avisos(p)).dia, 'Domingo fechado. Escolha outro dia.');
    for (const id of ['manha', 'tarde', 'noite'])
      assert.equal(await p.locator(`input[name=periodo][value=${id}]`).isDisabled(), true);
    // Com o dia fechado, a mensagem não leva o dia.
    assert.equal(
      await linkDoMontador(p),
      wa('Olá, Pedro! Vim pelo site e quero agendar: degradê.'),
    );
    await p.locator('input[name=data]').fill('2026-11-07');
    assert.equal(await p.locator('input[name=periodo][value=noite]').isDisabled(), true);
    assert.equal((await avisos(p)).periodo, 'Noite: sem atendimento (sábado fecha às 18h).');
    await marcar(p.locator('input[name=periodo][value=manha]'));
    const texto =
      'Olá, Pedro! Vim pelo site e quero agendar: degradê. Prefiro sábado, 07/11, manhã.';
    assert.equal(await linkDoMontador(p), wa(texto));
    // Barra fixa e botão da abertura já levam o degradê.
    assert.equal(
      await p.locator('.barra__botao').getAttribute('href'),
      wa('Olá, Pedro! Vim pelo site e quero agendar: degradê.'),
    );
    await contexto.close();
  });

  await caso('4. Sem JS: só o botão, com a mensagem padrão', async () => {
    const { contexto, pagina: p } = await abrir(navegador, '/agendar/', null, {
      javaScriptEnabled: false,
    });
    assert.equal(await p.locator('[data-montador-campos]').isVisible(), false);
    assert.equal(await linkDoMontador(p), wa(PADRAO));
    await contexto.close();
  });

  console.log('Medição');

  await caso('clique_whatsapp leva origem e serviço; a URL do wa.me não leva origem', async () => {
    const { contexto, pagina: p } = await abrir(navegador, '/degrade-em-lages/', null);
    await p.evaluate(() => {
      globalThis.__eventos = [];
      globalThis.addEventListener('tensini:medicao', (e) => globalThis.__eventos.push(e.detail));
    });
    const links = await p
      .locator('a[href^="https://wa.me/"]')
      .evaluateAll((l) =>
        l.map((a) => ({ href: a.getAttribute('href'), origem: a.dataset.origem })),
      );
    assert.ok(links.length >= 3);
    for (const l of links) {
      assert.ok(l.origem, `link sem data-origem: ${l.href}`);
      assert.deepEqual([...new URL(l.href).searchParams.keys()], ['text']);
    }
    // Clique no próprio elemento (o banner de consentimento cobre o fim da tela no mobile).
    for (const sel of [
      '[data-montador-link]',
      '[data-cta="como-chegar"][data-app="waze"]',
      '[data-cta="ligar"]',
    ])
      await p
        .locator(sel)
        .first()
        .evaluate((el) => {
          el.addEventListener('click', (e) => e.preventDefault(), { once: true });
          el.click();
        });
    assert.deepEqual(await p.evaluate(() => globalThis.__eventos), [
      { evento: 'clique_whatsapp', origem: 'montador', servico: 'degradê' },
      { evento: 'clique_como_chegar', app: 'waze' },
      { evento: 'clique_ligar' },
    ]);
    await contexto.close();
  });

  console.log('LGPD');

  const terceiros = [];
  await caso('nenhuma requisição a terceiros antes do consentimento (13 páginas)', async () => {
    const contexto = await navegador.newContext({
      viewport: { width: 390, height: 844 },
      recordHar: { path: join(SAIDA, 'rede-antes-do-consentimento.har'), content: 'omit' },
    });
    const todas = [];
    contexto.on('request', (r) => {
      const u = new URL(r.url());
      todas.push({ pagina: '', tipo: r.resourceType(), url: r.url() });
      if (!['127.0.0.1', 'localhost'].includes(u.hostname) && u.protocol !== 'data:')
        terceiros.push(r.url());
    });
    const p = await contexto.newPage();
    for (const rota of PAGINAS) {
      const inicio = todas.length;
      await p.goto(BASE + rota);
      await p.evaluate(async () => {
        for (let y = 0; y < globalThis.document.body.scrollHeight; y += 400) {
          globalThis.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 40));
        }
      });
      await p.waitForTimeout(300);
      for (const t of todas.slice(inicio)) t.pagina = rota;
    }
    await contexto.close();
    writeFileSync(join(SAIDA, 'rede-antes-do-consentimento.json'), JSON.stringify(todas, null, 2));
    assert.deepEqual(terceiros, []);
    // Captura "aba Network": a lista de requisições, renderizada.
    const vis = await navegador.newPage({ viewport: { width: 1200, height: 900 } });
    const hosts = new Map();
    for (const t of todas) {
      const h = new URL(t.url).host;
      hosts.set(h, (hosts.get(h) ?? 0) + 1);
    }
    const linhas = todas
      .map(
        (t) =>
          `<tr><td>${t.pagina}</td><td>${t.tipo}</td><td>${new URL(t.url).host}</td><td>${new URL(t.url).pathname.slice(0, 70)}</td></tr>`,
      )
      .join('');
    await vis.setContent(`<!doctype html><meta charset="utf-8"><style>
      body{font:12px/1.4 system-ui,sans-serif;margin:16px;color:#121316}
      h1{font-size:16px;margin:0 0 4px} p{margin:0 0 10px}
      table{border-collapse:collapse;width:100%} td,th{border-bottom:1px solid #ddd;padding:2px 6px;text-align:left;white-space:nowrap}
      th{background:#f1f0ec} .ok{color:#2e3d2a;font-weight:700}</style>
      <h1>Rede antes do consentimento — 13 páginas, rolando até o fim (390 px)</h1>
      <p>${todas.length} requisições · hosts: ${[...hosts].map(([h, n]) => `${h} (${n})`).join(', ')} ·
      <span class="ok">terceiros: ${terceiros.length}</span> · HAR: rede-antes-do-consentimento.har</p>
      <table><tr><th>Página</th><th>Tipo</th><th>Host</th><th>Caminho</th></tr>${linhas}</table>`);
    await vis.screenshot({
      path: join(SAIDA, 'rede-antes-do-consentimento.jpg'),
      fullPage: true,
      quality: 70,
    });
    await vis.close();
  });

  await caso(
    'mapa do Google só depois de "Aceitar"; Aceitar e Recusar com o mesmo peso',
    async () => {
      const contexto = await navegador.newContext({ viewport: { width: 390, height: 844 } });
      const google = [];
      contexto.on('request', (r) => {
        if (/google\./.test(new URL(r.url()).hostname)) google.push(r.url());
      });
      await contexto.route(/google\./, (r) => r.abort());
      const p = await contexto.newPage();
      await p.goto(BASE + '/como-chegar/');
      const banner = p.locator('[data-consentimento]');
      assert.equal(await banner.isVisible(), true, 'banner na primeira visita');
      const estilo = (sel) =>
        p.locator(sel).evaluate((b) => {
          const c = globalThis.getComputedStyle(b);
          return [
            c.fontSize,
            c.fontWeight,
            c.padding,
            c.backgroundColor,
            c.color,
            c.border,
            b.offsetHeight,
          ];
        });
      assert.deepEqual(
        await estilo('[data-consent="aceito"]'),
        await estilo('[data-consent="recusado"]'),
      );
      // Recusar: o toque no mapa não carrega o Google, reabre o aviso.
      await p.locator('[data-consent="recusado"]').click();
      await p.locator('[data-mapa-carregar]').click();
      assert.equal(await banner.isVisible(), true);
      assert.equal(await p.locator('.mapa-i__iframe').count(), 0);
      assert.deepEqual(google, []);
      await p.screenshot({ path: join(SAIDA, 'consentimento-390.jpg'), quality: 80 });
      // Aceitar: o mapa entra.
      await p.locator('[data-consent="aceito"]').click();
      await p.waitForTimeout(300);
      assert.equal(await p.locator('.mapa-i__iframe').count(), 1);
      assert.ok(google.length > 0, 'depois de aceitar, o mapa pede o Google');
      // Preferência alterável no rodapé.
      await p.locator('[data-abrir-consentimento]').click();
      assert.equal(await banner.isVisible(), true);
      assert.match((await p.locator('[data-consent-atual]').textContent()) ?? '', /aceito/);
      await contexto.close();
    },
  );
} finally {
  await navegador?.close();
  preview.kill();
}

const falhas = resultados.filter((r) => !r.ok);
console.log(`\n${resultados.length - falhas.length}/${resultados.length} ok`);
if (falhas.length) process.exit(1);
