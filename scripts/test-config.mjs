// Testes da config: motor de horário, mensagem do WhatsApp e travas de produção.
// Uso: pnpm test-config
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { regrasHorario } from '../src/config/horario.ts';
import { avaliarTravas, entradaPadrao } from '../src/config/travas.ts';
import { encontrarTermosVetados } from '../src/config/termos.ts';
import { bloqueante, confirmado, opcional } from '../src/config/tipos.ts';
import { periodosDisponiveis, statusEm } from '../src/lib/horario.ts';
import {
  MENSAGEM_PADRAO,
  ctaWhatsApp,
  juntarServicos,
  linkWhatsApp,
  montarMensagem,
} from '../src/lib/whatsapp.ts';
import { auditarHtml, auditarTextoMd } from './lib/compliance.mjs';

const RAIZ = new URL('../', import.meta.url).pathname;
const em = (s) => new Date(`${s}-03:00`);
const rotulo = (s, regras) => statusEm(em(s), regras).rotulo;
const comExcecoes = (excecoes) => ({ ...regrasHorario, excecoes });

describe('horário: statusEm', () => {
  it('domingo: fechado, abre amanhã', () => {
    const s = statusEm(em('2026-10-25T10:00:00'));
    assert.equal(s.aberto, false);
    assert.equal(s.rotulo, 'Fechado · abre amanhã às 8h30');
    assert.equal(s.abreEm?.toISOString(), '2026-10-26T11:30:00.000Z');
    assert.equal(s.fechaEm, null);
  });
  it('sábado 17h45: fecha em 15 min', () => {
    const s = statusEm(em('2026-10-24T17:45:00'));
    assert.equal(s.aberto, true);
    assert.equal(s.rotulo, 'Fecha em 15 min');
    assert.equal(s.fechaEm?.toISOString(), '2026-10-24T21:00:00.000Z');
  });
  it('sábado depois das 18h: abre segunda', () => {
    assert.equal(rotulo('2026-10-24T18:00:00'), 'Fechado · abre segunda às 8h30');
    assert.equal(rotulo('2026-10-24T23:59:00'), 'Fechado · abre segunda às 8h30');
  });
  it('segunda 8h00: fechado, abre hoje às 8h30', () => {
    assert.equal(rotulo('2026-10-26T08:00:00'), 'Fechado · abre hoje às 8h30');
  });
  it('segunda 8h30 em ponto: aberto', () => {
    assert.equal(rotulo('2026-10-26T08:30:00'), 'Aberto agora · fecha às 20h');
  });
  it('sexta 19h30: fecha em 30 min; 19h20 → 40 min; 18h59 → aberto', () => {
    assert.equal(rotulo('2026-10-30T19:30:00'), 'Fecha em 30 min');
    assert.equal(rotulo('2026-10-30T19:20:00'), 'Fecha em 40 min');
    assert.equal(rotulo('2026-10-30T19:00:00'), 'Fecha em 60 min');
    assert.equal(rotulo('2026-10-30T18:59:00'), 'Aberto agora · fecha às 20h');
  });
  it('sexta 20h00: fechado, abre amanhã', () => {
    assert.equal(rotulo('2026-10-30T20:00:00'), 'Fechado · abre amanhã às 8h30');
  });
  it('feriado em exceção: fechado o dia todo e pula para o próximo dia', () => {
    const r = comExcecoes([{ data: '2026-11-02', fechado: true, motivo: 'Finados (teste)' }]);
    assert.equal(rotulo('2026-11-02T10:00:00', r), 'Fechado · abre amanhã às 8h30');
    assert.equal(rotulo('2026-11-01T10:00:00', r), 'Fechado · abre terça às 8h30');
    assert.equal(rotulo('2026-10-31T19:00:00', r), 'Fechado · abre terça às 8h30');
  });
  it('horário especial em exceção', () => {
    const r = comExcecoes([
      {
        data: '2026-12-24',
        janelas: [{ abre: '08:30', fecha: '14:00' }],
        motivo: 'Véspera (teste)',
      },
    ]);
    assert.equal(rotulo('2026-12-24T10:00:00', r), 'Aberto agora · fecha às 14h');
    assert.equal(rotulo('2026-12-24T13:30:00', r), 'Fecha em 30 min');
    assert.equal(rotulo('2026-12-24T15:00:00', r), 'Fechado · abre amanhã às 8h30');
  });
  it('virada de ano: 31/12 à noite → 01/01', () => {
    assert.equal(rotulo('2026-12-31T21:00:00'), 'Fechado · abre amanhã às 8h30');
    const r = comExcecoes([{ data: '2027-01-01', fechado: true, motivo: 'Ano-novo (teste)' }]);
    const s = statusEm(em('2026-12-31T21:00:00'), r);
    assert.equal(s.rotulo, 'Fechado · abre sábado às 8h30');
    assert.equal(s.abreEm?.toISOString(), '2027-01-02T11:30:00.000Z');
  });
  it('fechado por muitos dias: mostra a data', () => {
    const excecoes = Array.from({ length: 10 }, (_, i) => ({
      data: `2027-01-${String(i + 1).padStart(2, '0')}`,
      fechado: true,
      motivo: 'Férias (teste)',
    }));
    assert.equal(
      rotulo('2026-12-31T21:00:00', comExcecoes(excecoes)),
      'Fechado · abre 11/01 às 8h30',
    );
  });
  it('instante em UTC é convertido para o fuso da barbearia', () => {
    assert.equal(statusEm(new Date('2026-10-26T22:30:00Z')).rotulo, 'Fecha em 30 min');
  });
});

describe('horário: periodosDisponiveis', () => {
  const ids = (dia, op) => periodosDisponiveis(dia, op).map((p) => p.id);
  it('dia útil: manhã, tarde e noite até 20h', () => {
    const p = periodosDisponiveis('2026-10-26');
    assert.deepEqual(
      p.map((x) => `${x.id} ${x.inicioTexto}–${x.fimTexto}`),
      ['manha 8h30–12h', 'tarde 12h–18h', 'noite 18h–20h'],
    );
  });
  it('sábado: sem noite', () => assert.deepEqual(ids('2026-10-24'), ['manha', 'tarde']));
  it('domingo: nenhum', () => assert.deepEqual(ids('2026-10-25'), []));
  it('feriado em exceção: nenhum', () =>
    assert.deepEqual(
      ids('2026-11-02', {
        regras: comExcecoes([{ data: '2026-11-02', fechado: true, motivo: 't' }]),
      }),
      [],
    ));
  it('hoje às 13h: some a manhã', () =>
    assert.deepEqual(ids('2026-10-26', { agora: em('2026-10-26T13:00:00') }), ['tarde', 'noite']));
  it('intervalo de almoço recorta os períodos', () => {
    const r = {
      ...regrasHorario,
      semana: regrasHorario.semana.map((d) =>
        d.length
          ? [
              { abre: '08:30', fecha: '12:00' },
              { abre: '13:30', fecha: d[0].fecha },
            ]
          : [],
      ),
    };
    assert.equal(periodosDisponiveis('2026-10-26', { regras: r })[1]?.inicioTexto, '13h30');
    assert.equal(rotulo('2026-10-26T12:30:00', r), 'Fechado · abre hoje às 13h30');
  });
});

describe('WhatsApp', () => {
  it('mensagem completa (texto exato)', () => {
    assert.equal(
      montarMensagem({
        servico: 'Degradê',
        dia: 'amanhã (sábado, 25/10)',
        periodo: 'manhã',
        nome: 'João',
      }),
      'Olá, Pedro! Vim pelo site e quero agendar: Degradê. Prefiro amanhã (sábado, 25/10), manhã. Meu nome é João.',
    );
  });
  it('sem nome', () => {
    assert.equal(
      montarMensagem({ servico: 'Barba', dia: 'hoje', periodo: 'tarde' }),
      'Olá, Pedro! Vim pelo site e quero agendar: Barba. Prefiro hoje, tarde.',
    );
  });
  it('sem escolhas: mensagem padrão', () => {
    assert.equal(montarMensagem(), 'Olá, Pedro! Vim pelo site e quero agendar um horário.');
    assert.equal(montarMensagem({ nome: '  ' }), MENSAGEM_PADRAO);
  });
  it('nome com espaços e quebras é limpo', () => {
    assert.equal(
      montarMensagem({ servico: 'Corte', dia: 'hoje', periodo: 'noite', nome: '  Ana\n Maria ' }),
      'Olá, Pedro! Vim pelo site e quero agendar: Corte. Prefiro hoje, noite. Meu nome é Ana Maria.',
    );
  });
  it('link wa.me com o número da config e encodeURIComponent', () => {
    const texto = montarMensagem({ servico: 'Degradê', dia: 'hoje', periodo: 'manhã' });
    const link = linkWhatsApp(texto);
    assert.equal(link, `https://wa.me/5549999037620?text=${encodeURIComponent(texto)}`);
    assert.match(link, /Degrad%C3%AA/);
    assert.equal(decodeURIComponent(new URL(link).searchParams.get('text') ?? ''), texto);
    assert.equal(
      linkWhatsApp(),
      'https://wa.me/5549999037620?text=Ol%C3%A1%2C%20Pedro!%20Vim%20pelo%20site%20e%20quero%20agendar%20um%20hor%C3%A1rio.',
    );
  });
  it('juntar serviços', () => {
    assert.equal(juntarServicos([]), '');
    assert.equal(juntarServicos(['degradê']), 'degradê');
    assert.equal(juntarServicos(['corte', 'barba', 'sobrancelha']), 'corte, barba e sobrancelha');
  });
  it('CTA: origem só nos atributos, nunca na URL do wa.me', () => {
    const cta = ctaWhatsApp('servico', { servico: 'degradê' });
    assert.equal(cta['data-origem'], 'servico');
    assert.equal(cta['data-servico'], 'degradê');
    assert.equal(cta.href, linkWhatsApp('Olá, Pedro! Vim pelo site e quero agendar: degradê.'));
    const url = new URL(cta.href);
    assert.deepEqual([...url.searchParams.keys()], ['text']);
    assert.doesNotMatch(cta.href, /origem/);
    const padrao = ctaWhatsApp('hero');
    assert.equal(padrao.href, linkWhatsApp());
    assert.equal('data-servico' in padrao, false);
  });
});

const manifesto = JSON.parse(readFileSync(join(RAIZ, 'media.manifest.json'), 'utf8'));
const tudoConfirmado = () => ({
  ...entradaPadrao(manifesto),
  numeroEndereco: confirmado('205', 'teste'),
  nomeCanonico: confirmado('Tensini Barbieri', 'teste'),
});
const falhas = (e) =>
  avaliarTravas(e)
    .filter((t) => !t.ok)
    .map((t) => t.id);

describe('travas de config (cada uma derruba a produção)', () => {
  it('config real: trava número do endereço e nome canônico', () =>
    assert.deepEqual(falhas(entradaPadrao(manifesto)), ['numero-endereco', 'nome-canonico']));
  it('com tudo confirmado: nenhuma trava', () => assert.deepEqual(falhas(tudoConfirmado()), []));
  it('WhatsApp ausente', () =>
    assert.deepEqual(falhas({ ...tudoConfirmado(), whatsapp: opcional() }), ['whatsapp']));
  it('WhatsApp inválido', () =>
    assert.deepEqual(falhas({ ...tudoConfirmado(), whatsapp: confirmado('99903-7620', 't') }), [
      'whatsapp',
    ]));
  it('número do endereço não confirmado', () =>
    assert.deepEqual(falhas({ ...tudoConfirmado(), numeroEndereco: bloqueante('405 ou 205') }), [
      'numero-endereco',
    ]));
  it('nome canônico não confirmado', () =>
    assert.deepEqual(falhas({ ...tudoConfirmado(), nomeCanonico: bloqueante('x', 'Tensini') }), [
      'nome-canonico',
    ]));
  it('termo vetado no conteúdo', () =>
    assert.deepEqual(
      falhas({ ...tudoConfirmado(), conteudo: { descricao: 'O melhor degradê de Lages' } }),
      ['termo-vetado'],
    ));
  it('mídia naoUsar referenciada', () => {
    const e = tudoConfirmado();
    assert.deepEqual(
      falhas({ ...e, midiasReferenciadas: [{ onde: 'teste', id: 'foto-barbaterapia-creme' }] }),
      ['midia-nao-usar'],
    );
    assert.deepEqual(
      falhas({ ...e, midiasReferenciadas: [{ onde: 'teste', id: 'logo-raster-3d' }] }),
      ['midia-nao-usar'],
    );
  });
  it('preço confirmado sem fonte', () =>
    assert.deepEqual(
      falhas({
        ...tudoConfirmado(),
        precos: [{ onde: 'teste', campo: { estado: 'confirmado', valor: { de: 50 }, fonte: ' ' } }],
      }),
      ['preco-sem-fonte'],
    ));
});

describe('termos vetados', () => {
  const termos = (t) => encontrarTermosVetados(t).map((o) => o.termo);
  it('acha com maiúsculas, acento e variações', () => {
    assert.deepEqual(termos('O MELHOR corte'), ['o melhor']);
    assert.deepEqual(termos('Barbeiro Nº 1 da cidade'), ['nº 1']);
    assert.deepEqual(termos('barbeiro n° 1'), ['nº 1']);
    assert.deepEqual(termos('Numero 1 em Lages'), ['número 1']);
    assert.deepEqual(termos('satisfação 100% garantida'), ['100%']);
    assert.deepEqual(termos('com garantias'), ['garantia']);
    assert.ok(termos('Horário garantido').includes('horário garantido'));
  });
  it('não acusa palavras parecidas', () => {
    assert.deepEqual(termos('pelo melhor caminho, na melhor hora'), []);
    assert.deepEqual(termos('Atendimento focado em detalhe e resultado.'), []);
  });
});

const ctx = {
  precosConfirmados: new Set(),
  idsAtivos: new Set(manifesto.derivados.filter((d) => !d.naoUsar).map((d) => d.id)),
  idsVetados: new Set(manifesto.originais.filter((o) => o.naoUsar).map((o) => o.id)),
  nomesOriginais: ['Pedro-tensini-logo.JPG'],
  numero: '5549999037620',
};
const travasHtml = (html, c = ctx) => [...new Set(auditarHtml(html, c).map((p) => p.trava))];

describe('auditoria de HTML (dist)', () => {
  it('HTML limpo passa', () =>
    assert.deepEqual(
      travasHtml(
        '<a href="https://wa.me/5549999037620?text=Ol%C3%A1">Agendar</a><img src="/media/loop-hero/loop-hero-poster-720.avif" alt="Máquina na barba"><p style="width:100%">Fecha em 40 min</p>',
      ),
      [],
    ));
  it('termo vetado no texto, no alt e no JSON-LD', () => {
    assert.deepEqual(travasHtml('<p>Horário <b>garantido</b></p>'), ['termo-vetado']);
    assert.deepEqual(travasHtml('<img alt="o melhor barbeiro">'), ['termo-vetado']);
    assert.deepEqual(
      travasHtml('<script type="application/ld+json">{"slogan":"Nº 1 em Lages"}</script>'),
      ['termo-vetado'],
    );
    assert.deepEqual(travasHtml('<p>O&nbsp;melhor</p>'), ['termo-vetado']);
  });
  it('preço sem fonte', () => {
    assert.deepEqual(travasHtml('<p>Corte R$ 50</p>'), ['preco-sem-fonte']);
    assert.deepEqual(travasHtml('<p>R$ 40–60</p>'), ['preco-sem-fonte']);
    assert.deepEqual(
      travasHtml('<p>Corte R$ 50</p>', { ...ctx, precosConfirmados: new Set([50]) }),
      [],
    );
  });
  it('mídia naoUsar ou fora do manifesto', () => {
    assert.deepEqual(travasHtml('<img src="/media/foto-colagem-agende/x.avif">'), [
      'midia-nao-usar',
    ]);
    assert.deepEqual(travasHtml('<img src="/media/inventada/x.avif">'), ['midia-nao-usar']);
    assert.deepEqual(travasHtml('<img src="/Pedro-tensini-logo.JPG">'), ['midia-nao-usar']);
    assert.deepEqual(travasHtml('<img src="/media-originais/fotos/a.jpg">'), ['midia-nao-usar']);
  });
  it('link wa.me para outro número ou sem número', () => {
    assert.deepEqual(travasHtml('<a href="https://wa.me/5511999999999">x</a>'), ['whatsapp']);
    assert.deepEqual(travasHtml('<a href="https://wa.me/?text=oi">x</a>'), ['whatsapp']);
    assert.deepEqual(
      travasHtml('<a href="https://api.whatsapp.com/send?phone=5511999999999">x</a>'),
      ['whatsapp'],
    );
  });
});

describe('scripts de ponta a ponta', () => {
  const rodar = (script, args, env = {}) =>
    spawnSync(process.execPath, [join(RAIZ, 'scripts', script), ...args], {
      encoding: 'utf8',
      env: { ...process.env, ...env },
    });
  it('validate-config: preview passa com pendências', () => {
    const r = rodar('validate-config.mjs', ['--modo=preview', '--sem-escrever']);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /TRAVA/);
  });
  it('validate-config: produção falha (número e nome pendentes)', () => {
    const r = rodar('validate-config.mjs', ['--sem-escrever'], { SITE_MODO: 'producao' });
    assert.equal(r.status, 1);
    assert.match(r.stderr, /PRODUÇÃO BLOQUEADA: 2 trava/);
  });
  it('audit-compliance: cada problema derruba a produção; preview só alerta', () => {
    const casos = {
      'termo-vetado': '<p>O melhor degradê</p>',
      'preco-sem-fonte': '<p>Corte R$ 50</p>',
      'midia-nao-usar': '<img src="/media/seu-visual-fala/x.mp4">',
      whatsapp: '<a href="https://wa.me/5511999999999">x</a>',
    };
    for (const [trava, html] of Object.entries(casos)) {
      const dir = mkdtempSync(join(tmpdir(), 'tensini-dist-'));
      mkdirSync(join(dir, 'sub'));
      writeFileSync(
        join(dir, 'sub', 'index.html'),
        `<!doctype html><html><body>${html}</body></html>`,
      );
      const prod = rodar('audit-compliance.mjs', [`--dist=${dir}`, '--modo=producao']);
      const prev = rodar('audit-compliance.mjs', [`--dist=${dir}`, '--modo=preview']);
      rmSync(dir, { recursive: true, force: true });
      assert.equal(prod.status, 1, `${trava}: produção deveria falhar`);
      assert.match(prod.stdout, new RegExp(trava));
      assert.equal(prev.status, 0, `${trava}: preview deveria passar`);
    }
  });
});

describe('auditoria dos textos-fonte (.md)', () => {
  const ctxMd = { precosConfirmados: new Set(), numero: '5549999037620' };
  const travasMd = (md) => [...new Set(auditarTextoMd(md, ctxMd).map((p) => p.trava))];
  const meta = '---\npagina: /x\ntitle: Título curto\ndescription: Descrição curta.\n---\n';
  it('texto limpo com citação e fonte passa', () =>
    assert.deepEqual(
      travasMd(`${meta}\n> "Imagem e presença não são por acaso."\n> Fonte: bio do Instagram\n`),
      [],
    ));
  it('citação sem fonte falha', () =>
    assert.deepEqual(travasMd(`${meta}\n> "Imagem e presença não são por acaso."\n`), [
      'citacao-sem-fonte',
    ]));
  it('termo vetado, preço sem fonte e title longo falham', () => {
    assert.deepEqual(travasMd(`${meta}\nHorário garantido.`), ['termo-vetado']);
    assert.deepEqual(travasMd(`${meta}\nCorte por R$ 45.`), ['preco-sem-fonte']);
    assert.deepEqual(
      travasMd(`---\npagina: /x\ntitle: ${'a'.repeat(61)}\ndescription: ok\n---\n`),
      ['meta'],
    );
  });
});
