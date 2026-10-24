// Utilitários compartilhados de mídia: manifesto, ffmpeg, nitidez e tempos.
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';

export const RAIZ = new URL('../../', import.meta.url).pathname;
export const MANIFESTO = join(RAIZ, 'media.manifest.json');
export const SCHEMA = join(RAIZ, 'media.manifest.schema.json');

// Executa um comando e devolve stdout (Buffer). Erro traz o stderr.
export function executar(cmd, args, { entrada } = {}) {
  return new Promise((ok, falha) => {
    const p = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'pipe'] });
    const saida = [];
    const erros = [];
    p.stdout.on('data', (d) => saida.push(d));
    p.stderr.on('data', (d) => erros.push(d));
    p.on('error', falha);
    p.on('close', (codigo) => {
      if (codigo === 0) ok(Buffer.concat(saida));
      else {
        const msg = Buffer.concat(erros).toString().trim().split('\n').slice(-8).join('\n');
        falha(new Error(`${cmd} saiu com ${codigo}\n${msg}`));
      }
    });
    if (entrada) p.stdin.end(entrada);
    else p.stdin.end();
  });
}

export async function ferramentaExiste(cmd) {
  try {
    await executar(cmd, ['-version']);
    return true;
  } catch {
    return false;
  }
}

export function hashArquivo(caminho) {
  return new Promise((ok, falha) => {
    const h = createHash('sha256');
    createReadStream(caminho)
      .on('data', (d) => h.update(d))
      .on('end', () => ok(h.digest('hex')))
      .on('error', falha);
  });
}

export const hashTexto = (texto) => createHash('sha256').update(texto).digest('hex');

export async function sondarVideo(caminho) {
  const json = JSON.parse(
    (
      await executar('ffprobe', [
        '-v',
        'error',
        '-select_streams',
        'v:0',
        '-show_entries',
        'stream=width,height,r_frame_rate,nb_frames:format=duration',
        '-of',
        'json',
        caminho,
      ])
    ).toString(),
  );
  const s = json.streams[0];
  const [num, den] = s.r_frame_rate.split('/').map(Number);
  return {
    largura: s.width,
    altura: s.height,
    fps: num / den,
    quadros: Number(s.nb_frames),
    duracao: Number(json.format.duration),
  };
}

// Primeiro e último índice de quadro dentro de [a, b] (b exclusivo).
export function indicesNaJanela(a, b, fps) {
  return [Math.ceil(a * fps - 1e-6), Math.ceil(b * fps - 1e-6) - 1];
}

// Variância do laplaciano em tons de cinza (maior = mais nítido).
export function varianciaLaplaciano(dados, largura, altura) {
  let soma = 0;
  let somaQ = 0;
  let n = 0;
  for (let y = 1; y < altura - 1; y++) {
    for (let x = 1; x < largura - 1; x++) {
      const i = y * largura + x;
      const v =
        4 * dados[i] - dados[i - 1] - dados[i + 1] - dados[i - largura] - dados[i + largura];
      soma += v;
      somaQ += v * v;
      n++;
    }
  }
  const media = soma / n;
  return somaQ / n - media * media;
}

// Mede a nitidez de cada quadro da janela e devolve o melhor.
export async function melhorQuadro(arquivo, janela, regiao) {
  const { fps, largura, altura } = await sondarVideo(arquivo);
  const [k0, k1] = indicesNaJanela(janela[0], janela[1], fps);
  const r = regiao ?? null;
  const w = r ? r.largura : 360;
  const h = r ? r.altura : Math.round((altura * 360) / largura / 2) * 2;
  const filtros = [];
  if (r) filtros.push(`crop=${r.largura}:${r.altura}:${r.x}:${r.y}`);
  else filtros.push(`scale=${w}:${h}`);
  filtros.push('format=gray');
  // Busca precisa: o 1º quadro decodificado é o k0.
  const bruto = await executar('ffmpeg', [
    '-v',
    'error',
    '-ss',
    String((k0 - 0.5) / fps),
    '-i',
    arquivo,
    '-frames:v',
    String(k1 - k0 + 1),
    '-vf',
    filtros.join(','),
    '-fps_mode',
    'passthrough',
    '-f',
    'rawvideo',
    'pipe:1',
  ]);
  const tam = w * h;
  const medidas = [];
  for (let i = 0; i * tam < bruto.length; i++) {
    const quadro = bruto.subarray(i * tam, (i + 1) * tam);
    medidas.push({ n: k0 + i, nitidez: varianciaLaplaciano(quadro, w, h) });
  }
  if (!medidas.length) throw new Error(`Nenhum quadro em ${arquivo} ${janela.join('–')}`);
  const melhor = medidas.reduce((a, b) => (b.nitidez > a.nitidez ? b : a));
  return { n: melhor.n, t: arredondar(melhor.n / fps), nitidez: melhor.nitidez, fps, medidas };
}

// Um quadro (índice n) em PNG, resolução cheia. Busca precisa pelo tempo do quadro.
export function quadroPng(arquivo, n, fps) {
  return executar('ffmpeg', [
    '-v',
    'error',
    '-ss',
    String(Math.max(0, (n - 0.5) / fps)),
    '-i',
    arquivo,
    '-frames:v',
    '1',
    '-f',
    'image2pipe',
    '-c:v',
    'png',
    'pipe:1',
  ]);
}

export const arredondar = (x, casas = 4) => Math.round(x * 10 ** casas) / 10 ** casas;

// Converte um tempo do original para o tempo do derivado editado (trechos concatenados).
export function tempoNoEditado(trechos, tFonte) {
  let acumulado = 0;
  for (const { in: a, out: b } of trechos) {
    if (tFonte >= a && tFonte < b) return acumulado + (tFonte - a);
    acumulado += b - a;
  }
  return null;
}

export async function carregarManifesto() {
  const [manifesto, schema] = await Promise.all([
    readFile(MANIFESTO, 'utf8').then(JSON.parse),
    readFile(SCHEMA, 'utf8').then(JSON.parse),
  ]);
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const validar = ajv.compile(schema);
  if (!validar(manifesto)) {
    const erros = validar.errors.map((e) => `  ${e.instancePath || '/'} ${e.message}`).join('\n');
    throw new Error(`media.manifest.json inválido no schema:\n${erros}`);
  }
  const erros = [];
  const originais = new Map();
  const ids = new Set();
  for (const o of manifesto.originais) {
    if (ids.has(o.id)) erros.push(`id repetido: ${o.id}`);
    ids.add(o.id);
    originais.set(o.id, o);
  }
  for (const d of manifesto.derivados) {
    if (ids.has(d.id)) erros.push(`id repetido: ${d.id}`);
    ids.add(d.id);
    if (d.arquivo !== `media/${d.id}/`) erros.push(`${d.id}: arquivo deve ser media/${d.id}/`);
    const o = originais.get(d.origem);
    if (!o) {
      erros.push(`${d.id}: origem inexistente ${d.origem}`);
      continue;
    }
    if (o.naoUsar && !d.naoUsar) erros.push(`${d.id}: deriva de ${o.id}, marcado naoUsar`);
    for (const t of d.trechos) {
      if (t.out <= t.in) erros.push(`${d.id}: trecho com out <= in`);
      if (o.duracao && t.out > o.duracao + 0.05) erros.push(`${d.id}: trecho passa da duração`);
    }
    const r = d.recorte;
    if (r && o.tipo === 'foto' && (r.x + r.largura > o.largura || r.y + r.altura > o.altura))
      erros.push(`${d.id}: recorte fora da imagem`);
    const janela = d.video?.poster.janelaFonte ?? d.quadro?.janelaFonte;
    if (janela && janela[1] <= janela[0]) erros.push(`${d.id}: janela invertida`);
    if (d.video && janela && tempoNoEditado(d.trechos, janela[0]) === null)
      erros.push(`${d.id}: janela do pôster fora dos trechos`);
  }
  if (erros.length) throw new Error(`media.manifest.json inconsistente:\n  ${erros.join('\n  ')}`);
  return { manifesto, originais };
}

export async function salvarManifesto(manifesto) {
  await writeFile(MANIFESTO, JSON.stringify(manifesto, null, 2) + '\n');
  // Mantém o formato do Prettier para o check não reclamar.
  await executar(join(RAIZ, 'node_modules/.bin/prettier'), ['--write', MANIFESTO]);
}
