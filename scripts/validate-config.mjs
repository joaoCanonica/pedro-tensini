// Valida a config: lista pendências (docs/PENDENCIAS.md, seção automática) e avalia as
// travas de produção. Preview sempre passa; produção falha SÓ pelas travas (CLAUDE.md, seção 8).
// Uso: pnpm validate-config [--modo=producao|preview]   (padrão: SITE_MODO)
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { config, coletarCampos } from '../src/config/index.ts';
import { avisoConferencia } from '../src/config/avaliacoes.ts';
import { modo as modoEnv } from '../src/config/seo.ts';
import {
  DESCRICAO_TRAVAS,
  avaliarTravas,
  entradaPadrao,
  midiasDesconhecidas,
} from '../src/config/travas.ts';

const RAIZ = new URL('../', import.meta.url).pathname;
const PENDENCIAS = join(RAIZ, 'docs/PENDENCIAS.md');
const INI = '<!-- CONFIG:INICIO (pnpm validate-config) -->';
const FIM = '<!-- CONFIG:FIM -->';

const argModo = process.argv.find((a) => a.startsWith('--modo='))?.slice(7);
const modo = argModo === 'producao' || argModo === 'preview' ? argModo : modoEnv;
const semEscrever = process.argv.includes('--sem-escrever');

const manifesto = JSON.parse(await readFile(join(RAIZ, 'media.manifest.json'), 'utf8'));
const entrada = entradaPadrao(manifesto);
const travas = avaliarTravas(entrada);
const desconhecidas = midiasDesconhecidas(entrada);
const campos = coletarCampos(config).filter((c) => c.campo.estado !== 'confirmado');
const avisoAval = avisoConferencia();
if (avisoAval) campos.push({ caminho: 'avaliacoes.google.conferidoEm', campo: avisoAval });

const porEstado = (e) => campos.filter((c) => c.campo.estado === e);
const rotulo = (c) => c.campo.rotulo ?? '(sem rótulo)';

const linhas = ['## Gerado pela config', '', '### Travas de produção', ''];
for (const t of travas)
  linhas.push(
    `- [${t.ok ? 'x' : ' '}] ${DESCRICAO_TRAVAS[t.id]}${t.ok ? '' : `: ${t.detalhes.join('; ')}`}`,
  );
linhas.push(
  '- [ ] Termos vetados, preço sem fonte, mídia naoUsar e links wa.me no HTML: conferidos por `pnpm audit-compliance` depois do build.',
  '',
  '### Bloqueantes',
  '',
);
for (const c of porEstado('bloqueante')) linhas.push(`- \`${c.caminho}\`: ${rotulo(c)}`);
if (!porEstado('bloqueante').length) linhas.push('- nenhum');
linhas.push('', '### Avisos', '');
for (const c of porEstado('aviso'))
  linhas.push(`- \`${c.caminho}\`: ${rotulo(c)}. ${c.campo.motivo}`);
for (const d of desconhecidas) linhas.push(`- mídia inexistente no manifesto: ${d}`);
if (!porEstado('aviso').length && !desconhecidas.length) linhas.push('- nenhum');
linhas.push('', '### Opcionais pendentes (não travam; não aparecem em produção)', '');
const agrupados = new Map();
for (const c of porEstado('opcional')) {
  const r = rotulo(c);
  agrupados.set(r, [...(agrupados.get(r) ?? []), c.caminho]);
}
for (const [r, caminhos] of agrupados)
  linhas.push(`- ${r}: ${caminhos.map((c) => `\`${c}\``).join(', ')}`);

const bloco = `${INI}\n${linhas.join('\n')}\n${FIM}`;
if (!semEscrever && existsSync(PENDENCIAS)) {
  const atual = await readFile(PENDENCIAS, 'utf8');
  const novo = atual.includes(INI)
    ? atual.replace(new RegExp(`${INI.replace(/[()]/g, '\\$&')}[\\s\\S]*?${FIM}`), bloco)
    : `${atual.trimEnd()}\n\n${bloco}\n`;
  if (novo !== atual) await writeFile(PENDENCIAS, novo);
}

const falhas = travas.filter((t) => !t.ok);
console.log(`[config] modo: ${modo}`);
for (const t of travas)
  console.log(
    `[config] ${t.ok ? 'ok   ' : 'TRAVA'} ${DESCRICAO_TRAVAS[t.id]}${t.ok ? '' : ` — ${t.detalhes.join('; ')}`}`,
  );
console.log(
  `[config] pendências: ${porEstado('bloqueante').length} bloqueantes, ${porEstado('aviso').length} avisos, ${porEstado('opcional').length} opcionais${semEscrever ? '' : ' (docs/PENDENCIAS.md)'}`,
);
if (modo === 'producao' && falhas.length) {
  console.error(`[config] PRODUÇÃO BLOQUEADA: ${falhas.length} trava(s).`);
  process.exit(1);
}
if (falhas.length) console.log('[config] preview: segue com selo PROVISÓRIO e noindex.');
