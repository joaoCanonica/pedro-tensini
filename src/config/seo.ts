import { confirmado, opcional } from './tipos.ts';
import type { Campo } from './tipos.ts';

export type Modo = 'preview' | 'producao';

const env: Record<string, string | undefined> = globalThis.process?.env ?? {};

/** SITE_MODO=producao liga as travas; qualquer outra coisa é preview. */
export const modo: Modo = env['SITE_MODO'] === 'producao' ? 'producao' : 'preview';

/** SITE_URL por variável de ambiente (sem barra no fim). */
export const siteUrl: string | null = env['SITE_URL']?.trim().replace(/\/+$/, '') || null;

export const dominio: Campo<string> = siteUrl
  ? confirmado(siteUrl, 'Variável SITE_URL')
  : opcional<string>(undefined, 'Domínio do site (SITE_URL)');

/** Só indexa em produção e com domínio. */
export const indexar = modo === 'producao' && siteUrl !== null;
export const robots = indexar ? 'index, follow' : 'noindex, nofollow';

export const idioma = 'pt-BR';
