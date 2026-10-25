// Motor de horário: puro, sem dependências. Calcula no fuso da barbearia
// (Intl), funciona igual no build, no navegador e nos testes.
import { regrasHorario } from '../config/horario.ts';

/** Horários em "HH:MM". */
export interface Janela {
  abre: string;
  fecha: string;
}
export type Excecao =
  | { data: string; fechado: true; motivo: string }
  | { data: string; fechado?: false; janelas: readonly Janela[]; motivo: string };

export interface RegrasHorario {
  fuso: string;
  /** Índice 0 = domingo … 6 = sábado; lista vazia = fechado. */
  semana: readonly (readonly Janela[])[];
  excecoes: readonly Excecao[];
}

export interface Status {
  aberto: boolean;
  rotulo: string;
  /** Fim da janela atual (se aberto). */
  fechaEm: Date | null;
  /** Próxima abertura (se fechado). */
  abreEm: Date | null;
}

export type IdPeriodo = 'manha' | 'tarde' | 'noite';
export interface Periodo {
  id: IdPeriodo;
  rotulo: 'manhã' | 'tarde' | 'noite';
  /** Minutos desde 0h. */
  inicio: number;
  fim: number;
  /** Ex.: "8h30" e "12h". */
  inicioTexto: string;
  fimTexto: string;
}

export const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'] as const;
const PERIODOS: readonly { id: IdPeriodo; rotulo: Periodo['rotulo']; de: number; ate: number }[] = [
  { id: 'manha', rotulo: 'manhã', de: 0, ate: 12 * 60 },
  { id: 'tarde', rotulo: 'tarde', de: 12 * 60, ate: 18 * 60 },
  { id: 'noite', rotulo: 'noite', de: 18 * 60, ate: 24 * 60 },
];
/** Até quantos minutos antes do fechamento o rótulo vira "Fecha em N min". */
const AVISO_FECHAMENTO = 60;
const BUSCA_MAX_DIAS = 60;

const minutos = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

/** 510 → "8h30"; 1200 → "20h". */
export function formatarHora(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
}

interface PartesLocais {
  iso: string;
  diaSemana: number;
  /** Minutos desde 0h, com fração de segundos. */
  minutos: number;
}

const formatadores = new Map<string, Intl.DateTimeFormat>();
function formatador(fuso: string): Intl.DateTimeFormat {
  let f = formatadores.get(fuso);
  if (!f) {
    f = new Intl.DateTimeFormat('en-CA', {
      timeZone: fuso,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    formatadores.set(fuso, f);
  }
  return f;
}

function partesLocais(data: Date, fuso: string): PartesLocais {
  const p: Record<string, string> = {};
  for (const { type, value } of formatador(fuso).formatToParts(data)) p[type] = value;
  const iso = `${p['year']}-${p['month']}-${p['day']}`;
  return {
    iso,
    diaSemana: diaSemanaDe(iso),
    minutos: Number(p['hour']) * 60 + Number(p['minute']) + Number(p['second']) / 60,
  };
}

const utcDe = (iso: string): number => {
  const [a, m, d] = iso.split('-').map(Number);
  return Date.UTC(a ?? 1970, (m ?? 1) - 1, d ?? 1);
};
export const diaSemanaDe = (iso: string): number => new Date(utcDe(iso)).getUTCDay();
export function somarDias(iso: string, n: number): string {
  return new Date(utcDe(iso) + n * 86_400_000).toISOString().slice(0, 10);
}

/** Data local (YYYY-MM-DD) de um instante no fuso. */
export function diaLocal(data: Date, regras: RegrasHorario = regrasHorario): string {
  return partesLocais(data, regras.fuso).iso;
}

/** Instante absoluto de "dia iso, minuto local" no fuso. */
function instante(iso: string, min: number, fuso: string): Date {
  const palpite = utcDe(iso) + min * 60_000;
  let t = palpite;
  for (let i = 0; i < 2; i++) {
    const p = partesLocais(new Date(t), fuso);
    const local = utcDe(p.iso) + p.minutos * 60_000;
    t += palpite - local;
  }
  return new Date(Math.round(t / 1000) * 1000);
}

interface JanelaMin {
  abre: number;
  fecha: number;
}

/** Janelas de atendimento de um dia (exceção tem prioridade). */
export function janelasDoDia(iso: string, regras: RegrasHorario = regrasHorario): JanelaMin[] {
  const exc = regras.excecoes.find((e) => e.data === iso);
  const janelas = exc ? (exc.fechado ? [] : exc.janelas) : (regras.semana[diaSemanaDe(iso)] ?? []);
  return janelas
    .map((j) => ({ abre: minutos(j.abre), fecha: minutos(j.fecha) }))
    .filter((j) => j.fecha > j.abre)
    .sort((a, b) => a.abre - b.abre);
}

function quandoTexto(diasAFrente: number, iso: string): string {
  if (diasAFrente === 0) return 'hoje';
  if (diasAFrente === 1) return 'amanhã';
  if (diasAFrente < 7) return DIAS[diaSemanaDe(iso)] ?? iso;
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

export function statusEm(data: Date, regras: RegrasHorario = regrasHorario): Status {
  const agora = partesLocais(data, regras.fuso);
  const hoje = janelasDoDia(agora.iso, regras);
  const atual = hoje.find((j) => agora.minutos >= j.abre && agora.minutos < j.fecha);
  if (atual) {
    const restante = atual.fecha - agora.minutos;
    return {
      aberto: true,
      rotulo:
        restante <= AVISO_FECHAMENTO
          ? `Fecha em ${Math.ceil(restante)} min`
          : `Aberto agora · fecha às ${formatarHora(atual.fecha)}`,
      fechaEm: instante(agora.iso, atual.fecha, regras.fuso),
      abreEm: null,
    };
  }
  for (let n = 0; n <= BUSCA_MAX_DIAS; n++) {
    const iso = somarDias(agora.iso, n);
    const proxima = janelasDoDia(iso, regras).find((j) => n > 0 || j.abre > agora.minutos);
    if (proxima) {
      return {
        aberto: false,
        rotulo: `Fechado · abre ${quandoTexto(n, iso)} às ${formatarHora(proxima.abre)}`,
        fechaEm: null,
        abreEm: instante(iso, proxima.abre, regras.fuso),
      };
    }
  }
  return { aberto: false, rotulo: 'Fechado', fechaEm: null, abreEm: null };
}

/**
 * Períodos que existem num dia (manhã até 12h, tarde 12h–18h, noite 18h–fechamento),
 * recortados pelo horário daquele dia. Com `agora` no mesmo dia, some o que já passou.
 */
export function periodosDisponiveis(
  dia: string | Date,
  opcoes: { agora?: Date; regras?: RegrasHorario } = {},
): Periodo[] {
  const regras = opcoes.regras ?? regrasHorario;
  const iso = typeof dia === 'string' ? dia : diaLocal(dia, regras);
  const janelas = janelasDoDia(iso, regras);
  const agora = opcoes.agora ? partesLocais(opcoes.agora, regras.fuso) : null;
  const limite = agora && agora.iso === iso ? agora.minutos : -1;
  const saida: Periodo[] = [];
  for (const p of PERIODOS) {
    const trechos = janelas
      .map((j) => ({ de: Math.max(j.abre, p.de), ate: Math.min(j.fecha, p.ate) }))
      .filter((t) => t.ate > t.de);
    if (!trechos.length) continue;
    const inicio = Math.min(...trechos.map((t) => t.de));
    const fim = Math.max(...trechos.map((t) => t.ate));
    if (fim <= limite) continue;
    saida.push({
      id: p.id,
      rotulo: p.rotulo,
      inicio,
      fim,
      inicioTexto: formatarHora(inicio),
      fimTexto: formatarHora(fim),
    });
  }
  return saida;
}
