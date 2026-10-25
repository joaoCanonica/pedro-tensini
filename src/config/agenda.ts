import { opcional } from './tipos.ts';

/** App de agenda visto no bastidores.mp4 (7–9 s). Só entra se o João confirmar. */
export const agenda = {
  app: opcional<string>(undefined, 'Nome do app de agenda'),
  linkPublico: opcional<string>(undefined, 'Link público do app de agenda'),
  exibir: false,
};
