// /llms.txt, gerado da config no build (proposta llmstxt.org: H1 com o nome, citação-resumo,
// detalhes em Markdown e seções H2 com links). Fatos só confirmados; nada de promessa.
import type { APIRoute } from 'astro';
import { nap, ruaCompleta, absoluta } from '../components/seo/entidade.ts';
import { PAGINAS, metaDe } from '../components/seo/paginas.ts';
import { resumoSemana } from '../components/base/semana.ts';
import { instagram, links } from '../config/contato.ts';
import { profissional } from '../config/marca.ts';
import { linkWhatsApp } from '../lib/whatsapp.ts';

export const GET: APIRoute = () => {
  const servicos = PAGINAS.filter((p) =>
    [
      '/degrade-em-lages/',
      '/barba-e-barbaterapia/',
      '/sobrancelha/',
      '/pomadas/',
      '/servicos-e-precos/',
    ].includes(p.rota),
  );
  const outras = PAGINAS.filter((p) => !servicos.includes(p));
  const linha = (p: (typeof PAGINAS)[number]) => {
    const m = metaDe(p);
    return `- [${p.nome}](${absoluta(p.rota)}): ${m.description}`;
  };
  const texto = `# ${nap.nome}

> Barbearia do ${profissional.nome.valor} na Galeria Augusta, ${nap.rua}, ${nap.bairro} de ${nap.cidade}/${nap.uf}. Degradê com acabamento na shaver, barba, barbaterapia e sobrancelha. Agendamento pelo WhatsApp; o Pedro confirma o horário por lá.

## Quem é

- Barbeiro: ${profissional.nome.valor} (${profissional.nomeCompleto.valor}). Atende um cliente por vez, com hora marcada.
- Especialidade: degradê (fade) com acabamento na shaver.
- Outros serviços: corte, barba, barbaterapia em cinco tempos (toalha quente, esfoliação, creme e massagem, navalha, barba finalizada), sobrancelha na navalha e orientação de pomada e finalização.
- Preços e duração: confirmados com o Pedro pelo WhatsApp, antes de marcar.

## Onde e quando

- Endereço: ${ruaCompleta}, ${nap.bairro}, ${nap.cidade}/${nap.uf}, CEP ${nap.cep}.
- Horário: ${resumoSemana()}.
- Rota no Google Maps: ${links.googleMaps}

## Como agendar

- WhatsApp ${nap.telefone}: ${linkWhatsApp()}
- No site: ${absoluta('/agendar/')} (escolha serviço, dia e período; a mensagem abre pronta no WhatsApp).
- Instagram: ${instagram.valor.url}

## Serviços

${servicos.map(linha).join('\n')}

## Páginas

${outras.map(linha).join('\n')}
`;
  return new Response(texto, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
