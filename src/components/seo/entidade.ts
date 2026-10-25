// A entidade do negócio para Google e IAs, gerada da config (fonte única).
// - NAP (nome, endereço, telefone): o mesmo objeto alimenta o JSON-LD, o llms.txt e a conferência
//   do audit-seo contra o texto visível. Nada é digitado aqui.
// - Tipo: HairSalon (schema.org: HairSalon → HealthAndBeautyBusiness → LocalBusiness).
//   "BarberShop" não existe no vocabulário do schema.org (a proposta, issue #2049, foi fechada);
//   o Google pede o subtipo mais específico de LocalBusiness, que aqui é HairSalon.
// - Sem AggregateRating e sem Review: avaliação do próprio negócio no próprio site é
//   "autosservida" e o Google não usa (Search Central, set/2019).
// - Só entra o que está confirmado: priceRange, número do endereço, sala, ficha do Google,
//   preço e duração dos serviços, formação. Tipado com schema-dts (vocabulário atual).
import type {
  BreadcrumbList,
  FAQPage,
  HairSalon,
  OfferCatalog,
  OpeningHoursSpecification,
  Person,
  PostalAddress,
  Service,
  WithContext,
} from 'schema-dts';
import {
  endereco,
  fichaGoogle,
  geo,
  instagram,
  links,
  telefone,
  whatsapp,
} from '../../config/contato.ts';
import { nomeCanonico, profissional, variacoesVistas } from '../../config/marca.ts';
import { excecoes, semana } from '../../config/horario.ts';
import { formatarPreco, precoExibivel, servicos } from '../../config/servicos.ts';
import { siteUrl } from '../../config/seo.ts';
import { valorPreview } from '../../config/tipos.ts';
import type { Campo } from '../../config/tipos.ts';

const conf = <T>(c: Campo<T>): T | null => (c.estado === 'confirmado' ? c.valor : null);

/** URL absoluta com SITE_URL; sem domínio (preview), caminho relativo ao documento. */
export const absoluta = (caminho: string): string => (siteUrl ? `${siteUrl}${caminho}` : caminho);
export const ID_NEGOCIO = '/#barbearia';
export const ID_PEDRO = '/sobre-pedro-tensini/#pedro';

/** NAP canônico. O texto visível do site (Endereco, rodapé) e o JSON-LD saem destes campos. */
export const nap = {
  /** Nome canônico (provisório no preview; a trava de produção exige o confirmado). */
  nome: valorPreview(nomeCanonico) ?? '',
  rua: conf(endereco.rua) ?? '',
  /** null = sem número (decisão do João: o endereço é a galeria). */
  numero: conf(endereco.numero as Campo<string | null>),
  complemento: conf(endereco.complemento) ?? '',
  salaAndar: conf(endereco.salaAndar as Campo<string>),
  bairro: conf(endereco.bairro) ?? '',
  cidade: conf(endereco.cidade) ?? '',
  uf: conf(endereco.uf) ?? '',
  cep: conf(endereco.cep) ?? '',
  /** "(49) 99903-7620", como aparece no site. */
  telefone: telefone.valor,
  /** "+55 49 99903-7620" (E.164 com espaços), para o JSON-LD. */
  telefoneInternacional: (() => {
    const d = (conf(whatsapp) ?? '').replace(/\D/g, '');
    return d ? `+${d.slice(0, 2)} ${d.slice(2, 4)} ${d.slice(4, 9)}-${d.slice(9)}` : '';
  })(),
};

/** "Rua Hercílio Luz, Galeria Augusta" (número só se existir). */
export const ruaCompleta = [
  [nap.rua, nap.numero].filter(Boolean).join(', '),
  [nap.complemento, nap.salaAndar].filter(Boolean).join(', '),
].join(', ');

const DIAS_SCHEMA = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

function horarios(): OpeningHoursSpecification[] {
  // Agrupa dias com a mesma janela (seg–sex 8h30–20h; sáb 8h30–18h). Domingo fechado: fora.
  const grupos = new Map<string, (typeof DIAS_SCHEMA)[number][]>();
  semana.valor.forEach((j, dia) => {
    if (!j) return;
    const chave = `${j.abre}-${j.fecha}`;
    grupos.set(chave, [...(grupos.get(chave) ?? []), DIAS_SCHEMA[dia] ?? 'Monday']);
  });
  const normais: OpeningHoursSpecification[] = [...grupos].map(([chave, dias]) => {
    const [abre = '', fecha = ''] = chave.split('-');
    return {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: dias.map((d) => `https://schema.org/${d}` as const),
      opens: abre,
      closes: fecha,
    };
  });
  // Exceções (feriados, folgas): o Google lê validFrom/validThrough; fechado = 00:00–00:00.
  const especiais: OpeningHoursSpecification[] = excecoes.flatMap((e) =>
    e.fechado
      ? [
          {
            '@type': 'OpeningHoursSpecification',
            validFrom: e.data,
            validThrough: e.data,
            opens: '00:00',
            closes: '00:00',
          },
        ]
      : e.janelas.map((j) => ({
          '@type': 'OpeningHoursSpecification' as const,
          validFrom: e.data,
          validThrough: e.data,
          opens: j.abre,
          closes: j.fecha,
        })),
  );
  return [...normais, ...especiais];
}

export function enderecoPostal(): PostalAddress {
  return {
    '@type': 'PostalAddress',
    streetAddress: ruaCompleta,
    addressLocality: nap.cidade,
    addressRegion: nap.uf,
    postalCode: nap.cep,
    addressCountry: 'BR',
  };
}

/** Páginas de serviço (rota) por slug da config. */
const ROTA_SERVICO: Record<string, string> = {
  degrade: '/degrade-em-lages/',
  barba: '/barba-e-barbaterapia/',
  barbaterapia: '/barba-e-barbaterapia/',
  sobrancelha: '/sobrancelha/',
};
/** Uma linha por serviço, só com fato confirmado (sem preço, sem duração inventada). */
const DESCRICAO: Record<string, string> = {
  corte: 'Corte masculino, do clássico ao moderno.',
  degrade: 'Degradê (fade) do curto ao longo, com acabamento na shaver.',
  barba: 'Desenho, alinhamento e acabamento da barba na navalha.',
  barbaterapia:
    'Barba em cinco tempos: toalha quente, esfoliação, creme e massagem, navalha e barba finalizada.',
  sobrancelha: 'Sobrancelha masculina limpa na navalha, mantendo o desenho natural.',
};

export function servicoSchema(slug: string, comContexto = false): Service | WithContext<Service> {
  const s = servicos.find((x) => x.slug === slug);
  if (!s) throw new Error(`Serviço "${slug}" fora da config.`);
  const preco = precoExibivel(s);
  const rota = ROTA_SERVICO[slug];
  const servico: Service = {
    '@type': 'Service',
    name: s.nome,
    serviceType: s.nome,
    description: DESCRICAO[slug] ?? s.nome,
    provider: { '@id': absoluta(ID_NEGOCIO) },
    areaServed: { '@type': 'City', name: `${nap.cidade}, ${nap.uf}` },
    ...(rota ? { url: absoluta(rota) } : {}),
    ...(preco
      ? {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'BRL',
            price: preco.de,
            ...(preco.ate
              ? {
                  priceSpecification: {
                    '@type': 'PriceSpecification',
                    minPrice: preco.de,
                    maxPrice: preco.ate,
                    priceCurrency: 'BRL',
                  },
                }
              : {}),
          },
        }
      : {}),
  };
  return comContexto ? { '@context': 'https://schema.org', ...servico } : servico;
}

function catalogo(): OfferCatalog {
  return {
    '@type': 'OfferCatalog',
    name: 'Serviços',
    itemListElement: servicos.map((s) => ({
      '@type': 'Offer',
      itemOffered: servicoSchema(s.slug) as Service,
    })),
  };
}

/** knowsAbout: só o que os vídeos e posts provam (visagismo fica de fora até confirmar). */
const SABE = [
  'Degradê',
  'Acabamento na shaver',
  'Barba',
  'Barbaterapia',
  'Sobrancelha masculina',
  'Pomada e finalização',
];

export function pedro(): Exclude<Person, string> {
  return {
    '@type': 'Person',
    '@id': absoluta(ID_PEDRO),
    name: profissional.nome.valor,
    alternateName: profissional.nomeCompleto.valor,
    jobTitle: 'Barbeiro',
    knowsAbout: SABE,
    worksFor: { '@id': absoluta(ID_NEGOCIO) },
    url: absoluta('/sobre-pedro-tensini/'),
  };
}

/** Faixa de preço só com tabela confirmada (todos os serviços com preço). */
function faixaPreco(): string | null {
  const precos = servicos.map((s) => precoExibivel(s));
  if (precos.some((p) => !p)) return null;
  const valores = precos.flatMap((p) => (p ? [p.de, p.ate ?? p.de] : []));
  return formatarPreco({ de: Math.min(...valores), ate: Math.max(...valores) });
}

export function negocio(imagem?: string): WithContext<HairSalon> {
  const ficha = conf(fichaGoogle as Campo<string>);
  const preco = faixaPreco();
  return {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    '@id': absoluta(ID_NEGOCIO),
    name: nap.nome,
    alternateName: [...new Set(variacoesVistas.map((v) => v.nome).filter((n) => n !== nap.nome))],
    description: `Barbearia do ${profissional.nome.valor} na Galeria Augusta, ${nap.rua}, ${nap.bairro} de ${nap.cidade}/${nap.uf}: degradê com acabamento na shaver, barba, barbaterapia e sobrancelha. Agendamento pelo WhatsApp.`,
    ...(siteUrl ? { url: `${siteUrl}/` } : {}),
    ...(imagem ? { image: imagem } : {}),
    telephone: nap.telefoneInternacional,
    address: enderecoPostal(),
    geo: { '@type': 'GeoCoordinates', latitude: geo.valor.lat, longitude: geo.valor.lng },
    hasMap: links.googleMaps,
    openingHoursSpecification: horarios(),
    ...(preco ? { priceRange: preco } : {}),
    currenciesAccepted: 'BRL',
    areaServed: { '@type': 'City', name: `${nap.cidade}, ${nap.uf}` },
    sameAs: [instagram.valor.url, ...(ficha ? [ficha] : [])],
    founder: pedro(),
    employee: { '@id': absoluta(ID_PEDRO) },
    hasOfferCatalog: catalogo(),
  };
}

export interface ItemTrilha {
  nome: string;
  rota: string;
}
export function trilha(itens: ItemTrilha[]): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: itens.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.nome,
      item: absoluta(t.rota),
    })),
  };
}

export function perguntas(lista: { pergunta: string; resposta: string }[]): WithContext<FAQPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: lista.map((q) => ({
      '@type': 'Question',
      name: q.pergunta,
      acceptedAnswer: { '@type': 'Answer', text: q.resposta },
    })),
  };
}

export function pessoa(): WithContext<Person> {
  return { '@context': 'https://schema.org', ...pedro() };
}
