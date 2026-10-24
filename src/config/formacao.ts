import { opcional } from './tipos.ts';

export interface ItemFormacao {
  quando: string;
  descricao: string;
  fonte: string;
}

const STORY = 'Story do destaque "Mentorias" no Instagram (visto em 24/10/2026)';
const ROTULO = 'Formação: Pedro confirma (datas e certificados)';

/** Tudo opcional até o Pedro confirmar. Não exibir em produção sem confirmado. */
export const formacao = [
  {
    quando: '13/09/2021',
    descricao: 'Curso com hidratação, camuflagem de fios grisalhos, luzes e relaxamento de fios',
    fonte: STORY,
  },
  { quando: '~2021', descricao: 'Técnica com tesoura (@elsontelleshair)', fonte: STORY },
  {
    quando: '~2021',
    descricao:
      'Workshop com Diogo Silva (@diogo_silvabarbeiro), certificado em nome de Pedro Carlos Tensini',
    fonte: STORY,
  },
  {
    quando: '~2021',
    descricao: 'Aperfeiçoamento de técnicas em Caxias do Sul-RS',
    fonte: STORY,
  },
  {
    quando: '~2021',
    descricao: 'Curso prático Moretti Class com @danillomoretti (Efis Cosméticos)',
    fonte: STORY,
  },
  {
    quando: '~2021',
    descricao: 'Evento Stop Barber "A Retomada", Farroupilha-RS',
    fonte: STORY,
  },
].map((item) => opcional<ItemFormacao>(item, ROTULO));

/** O destaque mostra o Pedro como aluno; se ele dá mentoria/curso é pendente. */
export const ofereceMentoria = opcional<boolean>(undefined, 'O Pedro oferece mentoria ou curso?');
