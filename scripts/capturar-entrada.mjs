// Captura a entrada ("A Passada") em instantes fixos, em 390 e 1440 px:
// congela os timers, pausa as animações e posiciona a linha do tempo.
// Gera os quadros de 0, 0,5, 1,0, 1,5, 2,0 e 2,4 s e um GIF por largura em docs/capturas/entrada/.
// Uso: pnpm build && pnpm capturar:entrada
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';

const PORTA = 4331;
const BASE = `http://127.0.0.1:${PORTA}`;
const DESTINO = join('docs', 'capturas', 'entrada');
const MARCOS = [0, 500, 1000, 1500, 2000, 2400];
const PASSO = 100;
const CHROMIUM_LOCAL = '/opt/pw-browsers/chromium';

if (!existsSync('dist')) {
  console.error('dist/ não existe. Rode "pnpm build" antes.');
  process.exit(1);
}
mkdirSync(DESTINO, { recursive: true });
const tmp = mkdtempSync(join(tmpdir(), 'entrada-'));
const preview = spawn(
  'pnpm',
  ['exec', 'astro', 'preview', '--host', '127.0.0.1', '--port', String(PORTA)],
  {
    stdio: 'ignore',
  },
);
for (let i = 0; i < 60; i++) {
  try {
    await fetch(BASE);
    break;
  } catch {
    await new Promise((ok) => setTimeout(ok, 500));
  }
}

const navegador = await chromium.launch(
  existsSync(CHROMIUM_LOCAL) ? { executablePath: CHROMIUM_LOCAL } : {},
);
try {
  for (const [w, h, dpr] of [
    [390, 844, 2],
    [1440, 900, 1],
  ]) {
    const contexto = await navegador.newContext({
      viewport: { width: w, height: h },
      deviceScaleFactor: dpr,
    });
    const pagina = await contexto.newPage();
    // Sábado 13h (aberto) e relógio parado: os timers não disparam durante a captura.
    await pagina.clock.install({ time: new Date('2026-10-24T13:00:00-03:00') });
    await pagina.clock.pauseAt(new Date('2026-10-24T13:00:01-03:00'));
    await pagina.goto(`${BASE}/?entrada=1`, { waitUntil: 'load' });
    await pagina.waitForSelector('.entrada__linha', { state: 'attached' });
    await pagina.evaluate(() => globalThis.document.fonts.ready);
    await pagina.waitForFunction(() =>
      [...globalThis.document.querySelectorAll('.entrada img')].every((i) => i.complete),
    );
    for (let t = 0; t <= 2400; t += PASSO) {
      await pagina.evaluate((ms) => {
        for (const a of globalThis.document.getAnimations()) {
          a.pause();
          a.currentTime = ms;
        }
      }, t);
      const quadro = join(tmp, `${w}-${String(t).padStart(4, '0')}.png`);
      await pagina.screenshot({ path: quadro });
      if (MARCOS.includes(t)) {
        const largura = w === 390 ? 390 : 1440;
        spawnSync('ffmpeg', [
          '-v',
          'error',
          '-y',
          '-i',
          quadro,
          '-vf',
          `scale=${largura}:-2`,
          '-q:v',
          '3',
          join(DESTINO, `entrada-${w}-${String(t).padStart(4, '0')}ms.jpg`),
        ]);
      }
    }
    const gif = w === 390 ? 320 : 720;
    spawnSync('ffmpeg', [
      '-v',
      'error',
      '-y',
      '-framerate',
      String(1000 / PASSO),
      '-pattern_type',
      'glob',
      '-i',
      join(tmp, `${w}-*.png`),
      '-vf',
      `scale=${gif}:-2:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=4`,
      '-loop',
      '0',
      join(DESTINO, `entrada-${w}.gif`),
    ]);
    await contexto.close();
  }
  console.log(`Quadros e GIFs em ${DESTINO}/`);
} finally {
  await navegador.close();
  preview.kill();
  rmSync(tmp, { recursive: true, force: true });
}
