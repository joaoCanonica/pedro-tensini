// Fonte única da config. Páginas, componentes e scripts importam daqui.
import * as agenda from './agenda.ts';
import * as avaliacoes from './avaliacoes.ts';
import * as contato from './contato.ts';
import * as formacao from './formacao.ts';
import * as horario from './horario.ts';
import * as marca from './marca.ts';
import * as seo from './seo.ts';
import * as servicos from './servicos.ts';

export { agenda, avaliacoes, contato, formacao, horario, marca, seo, servicos };
export * from './tipos.ts';

/** Todos os dados do cliente, para percorrer campos e pendências. */
export const config = { marca, contato, horario, servicos, avaliacoes, formacao, agenda, seo };
