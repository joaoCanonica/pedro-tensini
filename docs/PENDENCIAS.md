# Pendências

Itens que dependem do João ou do Pedro. Não inventar: cada campo fica pendente até confirmação.

## Bloqueantes para produção

- [x] **Número do endereço**: decisão do João (27/10/2026): o número não entra; o endereço é Rua Hercílio Luz, Galeria Augusta, Centro. Referência: ao lado da Agito. Falta só o andar/sala, se houver (opcional).
- [x] **Nome canônico**: "Pedro Tensini Barbearia" (João, 27/10/2026). As variações antigas (Tensini Barbieri, Tensini Barbiere) ficam como `alternateName` no JSON-LD.
- [ ] **Domínio**: sem domínio, `SITE_URL` fica vazio e o site permanece em noindex.

## Dados a confirmar

- [ ] Preços e duração dos serviços.
- [ ] Intervalo de almoço e feriados/folgas.
- [ ] App de agenda: nome e se tem link público.
- [ ] Cursos/formação que entram no site.

## Mídia (sessão 1)

- [ ] **Retrato profissional do Pedro** (vertical e horizontal, luz da barbearia, sem filtro). Até lá, o site usa três quadros de vídeo como retrato provisório (`retrato-provisorio-1..3`, ver `docs/MIDIA_CATALOGO.md`).
- [ ] **Originais sem texto da barbaterapia** (do fotógrafo ou da agência). Os recortes atuais são provisórios e cortam testa e cabelo.
- [ ] **Foto real do passo "creme e massagem"**: o post "Creme e massagem" usa a mesma foto da "Toalha quente".
- [ ] **Áudio**: confirmar se `qual-pomada-certa.mp4` e a fala final do `bastidores.mp4` (43,6–56,2 s) não têm música comercial por baixo. Só então `audioLiberado: true`.
- [ ] **Posts de origem** de `corte1.mp4`, `corte2.mp4` e `corte-acabamento.mp4` (sem acesso ao Instagram nesta sessão), código do post de `seu-visual-fala…mp4`, e confirmar o `DMdJJJdu5AW` (provável) do `primeiro-video.mp4`.
- [ ] **Legenda completa** do post das pomadas (o mapa traz a legenda cortada em reticências).
- [ ] **Pomadas**: o vídeo termina com o CTA "Segue esse perfil" queimado (36–37 s). Decidir se corta o final no site.
- [ ] Demais itens a gravar: ver `docs/TENSINI_MAPA_MIDIA.md`, seção "O que falta gravar ou fotografar".

## Config (sessão 2)

- [ ] **Feriados e folgas** de 2026/2027 (e se fecha para almoço): entram em `src/config/horario.ts` (`excecoes`, `intervalo`). Sem isso, o status ao vivo trata feriado como dia normal.
- [ ] **Link direto da ficha do Google** (place id): habilita "ver no Google" e o link "avaliar". Hoje os mapas usam as coordenadas.
- [x] **Nomes dos avaliadores**: só as iniciais ("V. F.", "D. A."), decisão do João.
- [ ] Rodar `pnpm validate-config` depois de cada dado novo: a seção automática abaixo se atualiza sozinha.

## Home (sessão 4)

- [ ] Links do hero apontam para `/como-chegar/` e `/como-chegar/#horario`, que nascem na sessão 6C (até lá dão 404 no preview).
- [ ] H1 provisório ("Degradê, barba e acabamento no detalhe."): a sessão 5 refina.

## Home (sessão 6)

- [ ] Mapa estático real (seção 0): o ambiente bloqueou os tiles (OSM/Carto 403). Hoje entra um esquema honesto (grade, pino, coordenadas, Plus Code). Gerar `public/media/mapa-estatico.webp` com atribuição num ambiente com rede ou API; o componente já usa o arquivo se ele existir.
- [ ] Links da home que dependem da sessão 6C: `/como-chegar/`, `/degrade-em-lages/`, `/sobre-pedro-tensini/`, `/avaliar/` (404 no preview até lá).
- [ ] "Ver no Google" usa busca no Maps por "Barbearia - Tensini barbieri, Lages". Trocar pelo link do perfil (place id) quando o João passar.
- [ ] Favicon próprio: hoje usa o monograma SVG.
- [ ] Seção 1: retrato provisório (`retrato-provisorio-1`) e formação com selo PROVISÓRIO até o Pedro confirmar.
- [ ] Avaliações exibidas (Vinicius Farias, Diogo Amaral) são literais do Google, conferidas em 24/10/2026; reconferir antes da produção (sessão 9).
- [ ] No desktop o botão fixo "Agendar no WhatsApp" passa por cima da escala de pente de cada seção enquanto ela cruza o topo da tela (comportamento de cabeçalho fixo). Avaliar na revisão visual se vale reservar a faixa.
- [ ] Sem JS, os vídeos de conteúdo (resultado-1/2) mostram o retângulo do navegador em vez do pôster; com JS o pôster entra perto da tela.

## Páginas de serviço (sessão 7)

- [ ] /degrade-em-lages: o texto "O que é a shaver" é rascunho com selo PROVISÓRIO; o Pedro reescreve com as palavras dele.
- [ ] /pomadas: a tabela brilho × efeito × fixação só tem o que o vídeo diz (o resto aparece como "—"); o Pedro completa. "Para cada cabelo" e "Como aplicar" são rascunhos com selo PROVISÓRIO. Sem link de compra até o João confirmar se o Pedro vende pomadas.
- [ ] /sobrancelha: o primeiro vídeo não tem plano claro da sobrancelha sendo feita; o still usado (`quadro-sobrancelha-navalha`, 28,6 s) mostra a navalha na linha do cabelo, logo acima da sobrancelha. Pedir foto ou vídeo real do serviço.
- [ ] Preços e durações: as páginas mostram "Valores pelo WhatsApp" / "Consulte" até `src/config/servicos.ts` ter valores confirmados com fonte. Ao confirmar, a tabela e a ficha mudam sozinhas (conferido: build de produção sem nenhum "R$").
- [ ] Montador da página de barba vem com "Barbaterapia" marcado; trocar para "Barba" se o João preferir.
- [ ] Os selos PROVISÓRIO saem em produção, mas as frases marcadas continuam. A revisão de normas (sessão 9) confere cada uma antes do ar.
- [ ] Links ainda sem página: `/como-chegar/`, `/perguntas-frequentes/` (404 no preview).

## Local, horário e confiança (sessão 8)

- [ ] /como-chegar: "Da calçada à cadeira" sem foto em nenhum passo (selo "Foto em breve" no preview). Gravar: calçada da Rua Hercílio Luz, entrada da Galeria Augusta, corredor/andar, porta da barbearia; preencher `comoChegar` em `src/config/contato.ts`.
- [ ] /como-chegar: andar/sala (`endereco.salaAndar`) e estacionamento (`estacionamento`). Referência próxima confirmada: ao lado da Agito.
- [ ] Mapa interativo: embed do Google sem chave (`maps?q=…&output=embed`), carregado só após o clique. Conferir na sessão 9 (LGPD) se o aviso de consentimento basta.
- [ ] /avaliar: o botão e o QR apontam para `destinoAvaliar()` (`src/config/avaliacoes.ts`). Hoje é a busca da ficha no Maps; trocar pelo link direto "escrever avaliação" (place id) quando o João passar, e reimprimir a plaquinha.
- [ ] /sobre-pedro-tensini: formação só aparece no preview até cada item ser confirmado na config; imagem do certificado do workshop quando o João liberar; retrato oficial.
- [x] /privacidade: hospedagem (Vercel) e data (27/10/2026).
- [ ] Formas de pagamento, encaixe, atendimento sem hora marcada e criança seguem pendentes no FAQ (selo PROVISÓRIO).

## QA e deploy

- [x] Deploy: projeto `pedro-tensini` na Vercel ligado ao GitHub; build nativa da Vercel (sem ffmpeg, com as mídias geradas no git). Falta só o domínio próprio, se o João quiser (ver `docs/CONFERENCIA_FINAL.md`, seção 10).
- [x] Nomes de autores nas avaliações da home: iniciais.
- [ ] Marcar a lista de mídias com cliente (`docs/CONFERENCIA_FINAL.md`, seção 4).
- [ ] Safari iOS e Firefox: não testados aqui (download bloqueado); testar no aparelho e/ou no CI. Conferir no celular que o wa.me abre o app e, no desktop, o WhatsApp Web.
- [ ] Teste humano com VoiceOver (iPhone) no montador e no status.
- [ ] LCP entre 2,03 e 2,10 s em 4 medições (degradê, pomadas, sobre, home sem entrada); meta < 2,0 s. Opcional: pôster da abertura em 480 px no mobile.

## SEO e GEO

- [ ] Capturas do Rich Results Test e do validator.schema.org: o ambiente bloqueou esses sites (proxy 403). Rodar com as URLs no ar e guardar em `docs/capturas/seo/` (o JSON-LD de cada página já está lá para colar).
- [ ] `SITE_URL` (domínio) para canonical, sitemap, URLs absolutas no JSON-LD e `index, follow`.
- [ ] Link da ficha do Google (`fichaGoogle`) e de "escrever avaliação" (`google.linkAvaliar`): entram no `sameAs`, no /avaliar e no QR.
- [ ] Checklist fora do site (Perfil da Empresa, Bing, Apple, Waze, Instagram, WhatsApp Business, avaliações, teste mensal nas IAs): `docs/SEO_GEO.md`.

## Funil e LGPD

- [ ] Medição: subir o Umami (auto-hospedado) na mesma origem do site, ou um proxy `/api/send`, e definir `PUBLIC_MEDICAO_URL` e `PUBLIC_MEDICAO_SITE` no build de produção. Até lá nada é enviado (docs/FUNIL.md).
- [ ] Exceções de horário (feriados, folgas) em `src/config/horario.ts`: o montador já avisa "Fechado em dd/mm: motivo", mas a lista está vazia e o e2e não cobre esse caso (só com uma exceção cadastrada).
- [x] Revisão de normas (sessão 9): feita (`docs/CONFERENCIA_FINAL.md`).

## Textos (sessão 5)

Gerado de `src/content/textos/*.md` (marcas `[PROVISÓRIO: …]`). Cada item sai do ar ou vira texto confirmado quando o dado chegar.

- [ ] Link direto "escrever avaliação" do Google (place id). Até lá o botão abre a ficha no Google Maps — avaliar.md
- [ ] Duração da barba e da barbaterapia — barba-e-barbaterapia.md
- [ ] Tabela de preços — barba-e-barbaterapia.md, degrade-em-lages.md, perguntas-frequentes.md, sobrancelha.md
- [ ] Onde estacionar perto da galeria — como-chegar.md
- [ ] Duração do serviço — degrade-em-lages.md, sobrancelha.md
- [ ] Intervalo de retoque que o Pedro recomenda — degrade-em-lages.md
- [ ] Cursos e workshops vistos nos stories "Mentorias"; o Pedro confirma datas e certificados antes de ir ao ar — home.md
- [ ] Localizar o post da frase — home.md
- [ ] O João confirma se o crédito entra — microtextos.md
- [ ] O Pedro confirma se faz encaixe — perguntas-frequentes.md
- [ ] O Pedro confirma se atende sem horário marcado — perguntas-frequentes.md
- [ ] Duração do degradê — perguntas-frequentes.md
- [ ] Formas de pagamento (Pix, cartão, dinheiro) a confirmar com o Pedro — perguntas-frequentes.md, servicos-e-precos.md
- [ ] Estacionamento perto da galeria a confirmar com o Pedro — perguntas-frequentes.md
- [ ] O Pedro confirma se atende criança e a partir de que idade — perguntas-frequentes.md
- [ ] O Pedro confirma este resumo do vídeo e se vende as pomadas na barbearia — pomadas.md
- [ ] Tabela de preços e durações — servicos-e-precos.md
- [ ] Combos e valores — servicos-e-precos.md
- [ ] A lista abaixo foi vista nos stories do destaque "Mentorias" e só vai ao ar depois que o Pedro confirmar datas e certificados — sobre-pedro-tensini.md

Também dependem de dado (blocos condicionais `<!-- se:… -->`, já com texto de reserva pronto): preço e duração de cada serviço (`{{preco.*}}`, `{{duracao.*}}`), combos, exceções de horário, passo a passo "da calçada à cadeira", estacionamento, link de avaliar e andar/sala na galeria.

Citações com fonte a localizar (o texto é literal, mas falta o post exato): "Se você repara nos detalhes, já sabe onde vir." e "Precisão nos acabamentos, elegância no resultado!". A de "Mais que um corte, uma experiência." está no post provável DMdJJJdu5AW.

Títulos usam o nome canônico "Pedro Tensini Barbearia".

## Ambiente (sessão 0)

- O Astro estável atual (7.4.2) exige Node ≥ 22.23.4. O projeto foi fixado em Node 24.22.1 (LTS "Krypton"), ver `.nvmrc`.
- `pnpm build` e `pnpm dev` rodam `media:prepare` antes (predev/prebuild) e precisam de **ffmpeg/ffprobe** no ambiente de build. Definir na sessão 9 como o deploy recebe os derivados (ffmpeg no build ou upload de `public/media/`).
- O Playwright do projeto (1.64.1) procura um Chromium que não vem pré-instalado neste ambiente; `scripts/capturar.mjs` usa `/opt/pw-browsers/chromium` como alternativa. Em outra máquina: `pnpm exec playwright install chromium`.

<!-- CONFIG:INICIO (pnpm validate-config) -->
## Gerado pela config

### Travas de produção

- [x] WhatsApp presente e confirmado
- [x] Número do endereço confirmado
- [x] Nome canônico confirmado
- [x] Nenhum termo vetado
- [x] Nenhuma mídia naoUsar referenciada
- [x] Nenhum preço exibido sem fonte
- [ ] Termos vetados, preço sem fonte, mídia naoUsar e links wa.me no HTML: conferidos por `pnpm audit-compliance` depois do build.

### Bloqueantes

- nenhum

### Avisos

- nenhum

### Opcionais pendentes (não travam; não aparecem em produção)

- Andar/sala dentro da Galeria Augusta: `contato.endereco.salaAndar`
- Onde estacionar perto da galeria: `contato.estacionamento`
- Link direto da ficha do Google (place id): `contato.fichaGoogle`
- Feriados e folgas do ano (nenhum informado ainda): `horario.feriadosInformados`
- Intervalo de almoço: `horario.intervalo`
- Combos (corte + barba etc.) e preços: `servicos.combos`
- Preço (tabela oficial pendente; uma avaliação do Google cita R$ 40–60): `servicos.servicos[0].preco`, `servicos.servicos[1].preco`, `servicos.servicos[2].preco`, `servicos.servicos[3].preco`, `servicos.servicos[4].preco`
- Duração: `servicos.servicos[0].duracao`, `servicos.servicos[1].duracao`, `servicos.servicos[2].duracao`, `servicos.servicos[3].duracao`, `servicos.servicos[4].duracao`
- Link "escrever avaliação" do Google (place id): `avaliacoes.google.linkAvaliar`
- Formação: Pedro confirma (datas e certificados): `formacao.formacao[0]`, `formacao.formacao[1]`, `formacao.formacao[2]`, `formacao.formacao[3]`, `formacao.formacao[4]`, `formacao.formacao[5]`
- O Pedro oferece mentoria ou curso?: `formacao.ofereceMentoria`
- Nome do app de agenda: `agenda.agenda.app`
- Link público do app de agenda: `agenda.agenda.linkPublico`
- Domínio do site (SITE_URL): `seo.dominio`
<!-- CONFIG:FIM -->
