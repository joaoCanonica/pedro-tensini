import { confirmado, opcional } from './tipos.ts';
import type { Campo } from './tipos.ts';

export type Modo = 'preview' | 'producao';

const env: Record<string, string | undefined> = globalThis.process?.env ?? {};

/** SITE_MODO=producao liga as travas; qualquer outra coisa é preview. */
export const modo: Modo = env['SITE_MODO'] === 'producao' ? 'producao' : 'preview';

/** Domínio de produção que a Vercel expõe na build (o domínio próprio, quando houver). */
const vercelProducao =
  env['VERCEL_ENV'] === 'production' && env['VERCEL_PROJECT_PRODUCTION_URL']
    ? `https://${env['VERCEL_PROJECT_PRODUCTION_URL']}`
    : '';

/** SITE_URL por variável de ambiente (sem barra no fim); na Vercel, cai no domínio de produção. */
export const siteUrl: string | null =
  (env['SITE_URL']?.trim() || vercelProducao).replace(/\/+$/, '') || null;

export const dominio: Campo<string> = siteUrl
  ? confirmado(siteUrl, env['SITE_URL'] ? 'Variável SITE_URL' : 'Domínio de produção da Vercel')
  : opcional<string>(undefined, 'Domínio do site (SITE_URL)');

/** Só indexa em produção e com domínio. */
export const indexar = modo === 'producao' && siteUrl !== null;
export const robots = indexar ? 'index, follow' : 'noindex, nofollow';

export const idioma = 'pt-BR';
