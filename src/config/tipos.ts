// Campos tipados da config. Todo dado do cliente passa por um destes estados:
// confirmado (com fonte), opcional (pendente, não trava), bloqueante (trava produção)
// e aviso (vale, mas precisa de atenção). Nada é inventado: faltou, fica pendente.

export interface Confirmado<T> {
  readonly estado: 'confirmado';
  readonly valor: T;
  readonly fonte: string;
}
export interface Opcional<T> {
  readonly estado: 'opcional';
  /** Valor conhecido mas não confirmado (não é exibido em produção). */
  readonly valor: T | null;
  readonly rotulo: string | null;
}
export interface Bloqueante<T> {
  readonly estado: 'bloqueante';
  readonly valor: null;
  readonly rotulo: string;
  /** Valor provisório para o preview (com selo PROVISÓRIO). */
  readonly provisorio: T | null;
}
export interface Aviso<T> {
  readonly estado: 'aviso';
  readonly valor: T | null;
  readonly rotulo: string;
  readonly motivo: string;
}
export type Campo<T> = Confirmado<T> | Opcional<T> | Bloqueante<T> | Aviso<T>;

export function confirmado<T>(valor: T, fonte: string): Confirmado<T> {
  if (!fonte.trim()) throw new Error('confirmado() exige fonte');
  return { estado: 'confirmado', valor, fonte };
}

export function opcional<T>(valor?: T, rotulo?: string): Opcional<T> {
  return { estado: 'opcional', valor: valor ?? null, rotulo: rotulo ?? null };
}

export function bloqueante<T = string>(rotulo: string, provisorio?: T): Bloqueante<T> {
  return { estado: 'bloqueante', valor: null, rotulo, provisorio: provisorio ?? null };
}

export function aviso<T>(rotulo: string, motivo: string, valor?: T): Aviso<T> {
  return { estado: 'aviso', valor: valor ?? null, rotulo, motivo };
}

const ESTADOS = new Set(['confirmado', 'opcional', 'bloqueante', 'aviso']);

export function ehCampo(x: unknown): x is Campo<unknown> {
  return (
    typeof x === 'object' &&
    x !== null &&
    'estado' in x &&
    ESTADOS.has(String((x as { estado: unknown }).estado))
  );
}

/** Valor que pode ir para produção (só confirmado). */
export function valorConfirmado<T>(c: Campo<T>): T | null {
  return c.estado === 'confirmado' ? c.valor : null;
}

/** Valor para o preview: confirmado, conhecido ou provisório. */
export function valorPreview<T>(c: Campo<T>): T | null {
  return c.estado === 'bloqueante' ? c.provisorio : c.valor;
}

export interface CampoEncontrado {
  caminho: string;
  campo: Campo<unknown>;
}

/** Percorre um objeto de config e devolve todos os campos com o caminho. */
export function coletarCampos(obj: unknown, caminho = ''): CampoEncontrado[] {
  if (ehCampo(obj)) {
    const dentro =
      obj.valor !== null && typeof obj.valor === 'object' ? coletarCampos(obj.valor, caminho) : [];
    return [{ caminho, campo: obj }, ...dentro];
  }
  if (Array.isArray(obj)) return obj.flatMap((item, i) => coletarCampos(item, `${caminho}[${i}]`));
  if (obj !== null && typeof obj === 'object')
    return Object.entries(obj).flatMap(([k, v]) =>
      coletarCampos(v, caminho ? `${caminho}.${k}` : k),
    );
  return [];
}
