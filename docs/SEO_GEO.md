# SEO local e GEO — Tensini Barbieri

25/10/2026. O que o site já faz para ser lido e citado por Google e IAs, as decisões (com fonte), como validar quando o site estiver no ar e o checklist **fora do site** para o João.

## 1. Decisões e fontes

| Decisão                                                                                       | Por quê                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tipo **`HairSalon`** (HairSalon → HealthAndBeautyBusiness → LocalBusiness)                    | `BarberShop` **não existe** como tipo oficial do schema.org: a proposta de incluir Barbershop sob HealthAndBeautyBusiness ([schemaorg/schemaorg#2049](https://github.com/schemaorg/schemaorg/issues/2049)) foi fechada, e o tipo não aparece nos tipos gerados do vocabulário atual (`schema-dts` 2.1.0). O Google pede o subtipo mais específico de LocalBusiness ([Search Central, negócio local](https://developers.google.com/structured-data/local-businesses/)); o mais próximo é HairSalon. |
| **Sem `AggregateRating` e sem `Review`**                                                      | Desde 16/09/2019 o Google não mostra estrelas de avaliações "autosservidas" de LocalBusiness/Organization, isto é, quando o próprio negócio publica avaliações sobre si ([Google Search Central Blog, 2019](https://developers.google.com/search/blog/2019/09/making-review-rich-results-more-helpful)). A nota do Google aparece no site como texto, não como dado estruturado.                                                                                                |
| **`FAQPage` só em /perguntas-frequentes**                                                     | Desde 08/08/2023 o rich result de FAQ só aparece para sites de governo e saúde conhecidos; o Google diz que não é preciso remover a marcação ([Search Central Blog, 2023](https://developers.google.com/search/blog/2023/08/howto-faq-changes)). Mantemos porque é barato e as IAs leem: o FAQPage é o espelho exato das perguntas visíveis (o audit-seo confere).                                                                                                       |
| **`llms.txt`** gerado da config                                                               | Proposta de Jeremy Howard (set/2024, [llmstxt.org](https://llmstxt.org/)): Markdown na raiz, H1 com o nome (único item obrigatório), citação-resumo, seções H2 com links. É uma proposta, não um padrão: nenhum grande provedor confirmou publicamente que lê o arquivo ([resumo](https://www.greengeeks.com/blog/what-is-llms-txt-does-it-work-and-how-to-add-one-to-your-site/)). Custo baixo, sem promessa.                                                             |
| `priceRange`, preços, número do endereço, ficha do Google, formação, visagismo: **só confirmados** | Regra do projeto: dado do cliente nunca é inventado. Entram sozinhos quando a config marcar `confirmado()`.                                                                                                                                                                                                                                                                                                                                                                 |
| Sem `hreflang`                                                                                | O site é só pt-BR.                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

Observação de método: nesta sessão o ambiente bloqueou o acesso a schema.org, developers.google.com, Rich Results Test e validator.schema.org (proxy 403). A pesquisa foi feita por busca na web (fontes acima) e a validação, offline (seção 3).

## 2. O que o site entrega

**Dados estruturados (JSON-LD, gerado da config em `src/components/seo/entidade.ts`):**

- Em todas as páginas: o negócio `HairSalon` com
  - `name` canônico e `alternateName` (as variações vistas: "Tensini Barbiere", "TENSINI BARBIERI PROFESSIONALE", "Barbearia - Tensini barbieri");
  - `address` completo (rua, número quando confirmado, Galeria Augusta, Lages, SC, CEP, BR), `geo`, `telephone` (+55 49 99903-7620);
  - `url` e `image` (com domínio), `sameAs` (Instagram; ficha do Google quando houver o link), `hasMap`;
  - `openingHoursSpecification` (seg–sex 8h30–20h, sáb 8h30–18h; exceções da config viram horário especial);
  - `hasOfferCatalog` com os cinco serviços (sem preço até a tabela ser confirmada);
  - `founder`/`employee`: `Person` "Pedro Tensini" (Pedro Carlos Tensini), barbeiro, `knowsAbout` degradê, acabamento na shaver, barba, barbaterapia, sobrancelha, pomada e finalização. Visagismo e formação ficam de fora até confirmar.
- Páginas internas: `BreadcrumbList` igual à trilha visível.
- Degradê, barba e barbaterapia, sobrancelha: `Service` com `provider` = o negócio.
- /sobre-pedro-tensini: `Person`.
- /perguntas-frequentes: `FAQPage` com as 14 perguntas, mesmo texto do que se vê.

**Metas:** title e description do texto-fonte, canonical e `og:url` (com domínio), Open Graph com a imagem 1200×630 gerada no build (`/og/tensini.jpg`: monograma, still real, nome e "Centro de Lages"), `twitter:card`, `lang="pt-BR"`.

**NAP idêntico:** nome, endereço e telefone saem do mesmo objeto (`nap`) para o JSON-LD, o `llms.txt` e o texto visível (que já lê a mesma config). O `audit-seo` derruba o build se o visível, o JSON-LD e a config divergirem.

**Conteúdo citável:** toda página abre com o parágrafo-resposta (quem, o quê, onde, quando), inclusive a home, logo depois do hero. Títulos em pergunta onde cabe ("Quanto custa e quanto tempo leva?", "Que horas abre?", "Onde estacionar?", as 14 perguntas frequentes).

**Indexação:**

- Prévia (sem `SITE_URL` ou fora de produção): `noindex, nofollow` em todas as páginas; `robots.txt` libera o rastreio (para o noindex ser lido) e não anuncia sitemap; `sitemap.xml` vazio.
- Produção com domínio (`SITE_MODO=producao` + `SITE_URL`): `index, follow`, canonical absoluto, `sitemap.xml` com as 12 páginas públicas, `robots.txt` com o sitemap e os rastreadores de busca e de IA liberados (Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, GPTBot, PerplexityBot, ClaudeBot, Claude-SearchBot, Google-Extended, Applebot). /\_estilo e 404 ficam fora.

## 3. Validação

- **No build (`pnpm build` → `audit-seo`)**: metas, JSON-LD, regras do Google (validador `@adobe/structured-data-validator`, offline), NAP, resposta no topo, llms.txt, robots, sitemap e imagem OG. Falha = build vermelho.
- **Tipos do schema.org**: o JSON-LD é tipado com `schema-dts` (vocabulário atual); propriedade inexistente ou de tipo errado quebra o `astro check`.
- **Resultado desta sessão**: `docs/capturas/seo/validacao-local.txt` (prévia e indexável: 0 erros, 0 avisos com domínio) e o JSON-LD de cada página em `docs/capturas/seo/jsonld-*.html`.
- **Quando o site estiver no ar (pendente):**
  1. [Rich Results Test](https://search.google.com/test/rich-results) com a URL de cada página; guardar a captura em `docs/capturas/seo/`.
  2. [validator.schema.org](https://validator.schema.org/) com as mesmas URLs; guardar a captura.
  3. Search Console: enviar o sitemap e acompanhar "Melhorias" e "Páginas".

## 4. Checklist fora do site (João)

Ordem por impacto. O site só funciona como peça da entidade se estes dados forem **iguais** em todo lugar.

1. **Nome canônico decidido** (placa = Google = Instagram = WhatsApp = site). Hoje o site usa "Tensini Barbieri" como provisório; a produção trava até confirmar.
2. **Perfil da Empresa no Google**
   - [ ] Nome canônico, sem palavra-chave a mais.
   - [ ] Endereço com **número** e "**Galeria Augusta**" (e a sala/andar, se houver).
   - [ ] Categoria principal **Barbearia**; secundárias só se forem verdade.
   - [ ] Horário igual ao do site (seg–sex 8h30–20h, sáb 8h30–18h, dom fechado) e os feriados.
   - [ ] Serviços (com preço, quando houver tabela).
   - [ ] Fotos reais: fachada da galeria, entrada, corredor, porta, cadeira, ferramentas, cortes (20 a 30).
   - [ ] Link do site e link de agendamento: `https://<domínio>/agendar/`.
   - [ ] Pegar o **link direto de "escrever avaliação"** (place id) e passar para a config (`google.linkAvaliar`) e a ficha (`fichaGoogle`): entram no /avaliar, no QR e no `sameAs`.
3. **Bing Places**: importar do Google ou cadastrar com os mesmos dados.
4. **Apple Business Connect**: mesmo nome, endereço, telefone, horário, categoria e link.
5. **Waze**: conferir o pino na Rua Hercílio Luz, na galeria, e o nome.
6. **Instagram (@tensinibarbiere\_)**: nome e bio com "Barbearia no Centro de Lages · degradê e barba", endereço com a galeria e o link **`/agendar/`** do site.
7. **WhatsApp Business**: endereço e horário iguais aos do site, descrição curta e o link do site.
8. **Avaliações**: pedir a **todo** cliente atendido (plaquinha com QR na bancada + mensagem no WhatsApp depois do corte), **sem** desconto, brinde ou sorteio em troca (proibido pelo Google). Responder todas.
9. **Teste mensal nas IAs** (sem personalização: aba anônima, sem login, ou sessão sem histórico), registrando data, ferramenta, resposta e fontes citadas:
   - "melhor barbearia no centro de Lages"
   - "barbeiro que faz degradê em Lages"
   - "barbearia aberta sábado Lages"
   - Ferramentas: Google (Modo IA / Visão geral), ChatGPT, Perplexity, Gemini.
   - Também: posição no Maps para "barbearia Lages", "degradê Lages", "barbeiro centro Lages" e o total de avaliações.
   - Planilha sugerida: data · ferramenta · pergunta · o Pedro aparece? (sim/não, posição) · concorrentes citados · fontes citadas.

## 5. Metas (da investigação, para medir)

- 30 dias: nome único; Google completo; site no ar; 15 avaliações.
- 90 dias: 50 avaliações; top 10 no Maps para "barbearia Lages"; citado em pelo menos 1 das perguntas de IA sem personalização.
- 6 meses: 100 avaliações ou mais; citado com consistência para "degradê" e "barba" em Lages.
