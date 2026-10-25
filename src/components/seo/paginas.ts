// Páginas públicas (indexáveis quando houver domínio): rota + texto-fonte. Alimenta o sitemap,
// o llms.txt e o audit-seo. /_estilo e 404 ficam de fora (noindex).
import { pagina } from '../../layouts/servico/pagina.ts';

export interface PaginaPublica {
  rota: string;
  texto: string;
  /** Rótulo curto no llms.txt. */
  nome: string;
}

export const PAGINAS: readonly PaginaPublica[] = [
  { rota: '/', texto: 'home', nome: 'Início' },
  { rota: '/agendar/', texto: 'agendar', nome: 'Agendar pelo WhatsApp' },
  { rota: '/como-chegar/', texto: 'como-chegar', nome: 'Como chegar' },
  { rota: '/servicos-e-precos/', texto: 'servicos-e-precos', nome: 'Serviços e preços' },
  { rota: '/degrade-em-lages/', texto: 'degrade-em-lages', nome: 'Degradê' },
  { rota: '/barba-e-barbaterapia/', texto: 'barba-e-barbaterapia', nome: 'Barba e barbaterapia' },
  { rota: '/sobrancelha/', texto: 'sobrancelha', nome: 'Sobrancelha' },
  { rota: '/pomadas/', texto: 'pomadas', nome: 'Qual pomada usar' },
  { rota: '/sobre-pedro-tensini/', texto: 'sobre-pedro-tensini', nome: 'Sobre o Pedro' },
  { rota: '/perguntas-frequentes/', texto: 'perguntas-frequentes', nome: 'Perguntas frequentes' },
  { rota: '/avaliar/', texto: 'avaliar', nome: 'Avaliar no Google' },
  { rota: '/privacidade/', texto: 'privacidade', nome: 'Privacidade' },
];

/** Título e descrição (frontmatter do texto-fonte). */
export const metaDe = (p: PaginaPublica) => {
  const t = pagina(p.texto);
  return { title: t.title, description: t.description, resposta: t.resposta };
};
