// Sobe o preview e captura as rotas em 390 e 1440 px, claro e escuro,
// com e sem prefers-reduced-motion, em docs/capturas/<data>/.
// Uso: pnpm capturar [rota ...]   (padrão: /)
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const PORTA = Number(process.env.PORTA_CAPTURA ?? 4329);
const BASE = `http://127.0.0.1:${PORTA}`;
const ROTAS = process.argv.slice(2).length ? process.argv.slice(2) : ['/'];
const LARGURAS = [390, 1440];
const TEMAS = ['claro', 'escuro'];
const MOVIMENTOS = ['normal', 'reduzido'];
// Chromium pré-instalado no ambiente, usado se o do Playwright não existir.
const CHROMIUM_LOCAL = '/opt/pw-browsers/chromium';

const data = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
const destino = join('docs', 'capturas', data);
mkdirSync(destino, { recursive: true });

if (!existsSync('dist')) {
  console.error('dist/ não existe. Rode "pnpm build" antes de "pnpm capturar".');
  process.exit(1);
}

const preview = spawn(
  'pnpm',
  ['exec', 'astro', 'preview', '--host', '127.0.0.1', '--port', String(PORTA)],
  {
    stdio: ['ignore', 'pipe', 'inherit'],
  },
);

async function esperarServidor(tentativas = 60) {
  for (let i = 0; i < tentativas; i++) {
    try {
      const r = await fetch(BASE);
      if (r.ok || r.status === 404) return;
    } catch {
      // ainda subindo
    }
    await new Promise((ok) => setTimeout(ok, 500));
  }
  throw new Error(`Preview não respondeu em ${BASE}`);
}

async function abrirNavegador() {
  try {
    return await chromium.launch();
  } catch (erro) {
    if (!existsSync(CHROMIUM_LOCAL)) throw erro;
    return chromium.launch({ executablePath: CHROMIUM_LOCAL });
  }
}

function nomeArquivo(rota, largura, tema, movimento) {
  const slug = rota === '/' ? 'home' : rota.replace(/^\/|\/$/g, '').replace(/\//g, '_');
  return `${slug}-${largura}-${tema}${movimento === 'reduzido' ? '-reduzido' : ''}.png`;
}

let navegador;
let codigo = 0;
try {
  await esperarServidor();
  navegador = await abrirNavegador();
  const arquivos = [];
  for (const largura of LARGURAS) {
    for (const tema of TEMAS) {
      for (const movimento of MOVIMENTOS) {
        const contexto = await navegador.newContext({
          viewport: { width: largura, height: largura < 800 ? 844 : 900 },
          deviceScaleFactor: largura < 800 ? 2 : 1,
          colorScheme: tema === 'escuro' ? 'dark' : 'light',
          reducedMotion: movimento === 'reduzido' ? 'reduce' : 'no-preference',
        });
        const dataTheme = tema;
        await contexto.addInitScript((t) => {
          globalThis.document.documentElement.dataset.theme = t;
        }, dataTheme);
        const pagina = await contexto.newPage();
        for (const rota of ROTAS) {
          await pagina.goto(BASE + rota, { waitUntil: 'networkidle' });
          await pagina.evaluate(
            (t) => (globalThis.document.documentElement.dataset.theme = t),
            dataTheme,
          );
          // Rola a página inteira para disparar as revelações (IntersectionObserver)
          // e volta ao topo; depois deixa as animações terminarem.
          await pagina.evaluate(async () => {
            const passo = globalThis.innerHeight * 0.6;
            for (let y = 0; y < globalThis.document.body.scrollHeight; y += passo) {
              globalThis.scrollTo(0, y);
              await new Promise((ok) => setTimeout(ok, 120));
            }
            globalThis.scrollTo(0, 0);
          });
          await pagina.waitForTimeout(movimento === 'reduzido' ? 200 : 1500);
          const arquivo = join(destino, nomeArquivo(rota, largura, tema, movimento));
          await pagina.screenshot({ path: arquivo, fullPage: true });
          arquivos.push(arquivo);
        }
        await contexto.close();
      }
    }
  }
  console.log(`${arquivos.length} capturas em ${destino}/`);
  for (const a of arquivos) console.log('  ' + a);
} catch (erro) {
  console.error('Falha na captura:', erro.message);
  codigo = 1;
} finally {
  await navegador?.close();
  preview.kill();
}
process.exit(codigo);
