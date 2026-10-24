# Pendências

Itens que dependem do João ou do Pedro. Não inventar: cada campo fica pendente até confirmação.

## Bloqueantes para produção

- [ ] **Número do endereço**: João passou 405; os posts da barbaterapia dizem 205. Falta também andar/sala na Galeria Augusta.
- [ ] **Nome canônico**: recomendado "Tensini Barbieri" (logo oficial). Pedro confirma.
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
- [ ] **Nomes dos avaliadores** (Vinicius Farias, Diogo Amaral): ficam literais na config; conferir na passada de normas (sessão 9) se exibe nome completo.
- [ ] Rodar `pnpm validate-config` depois de cada dado novo: a seção automática abaixo se atualiza sozinha.

## Home (sessão 4)

- [ ] Links do hero apontam para `/como-chegar/` e `/como-chegar/#horario`, que nascem na sessão 6C (até lá dão 404 no preview).
- [ ] H1 provisório ("Degradê, barba e acabamento no detalhe."): a sessão 5 refina.

## Ambiente (sessão 0)

- O Astro estável atual (7.4.2) exige Node ≥ 22.23.4. O projeto foi fixado em Node 24.22.1 (LTS "Krypton"), ver `.nvmrc`.
- `pnpm build` e `pnpm dev` rodam `media:prepare` antes (predev/prebuild) e precisam de **ffmpeg/ffprobe** no ambiente de build. Definir na sessão 9 como o deploy recebe os derivados (ffmpeg no build ou upload de `public/media/`).
- O Playwright do projeto (1.64.1) procura um Chromium que não vem pré-instalado neste ambiente; `scripts/capturar.mjs` usa `/opt/pw-browsers/chromium` como alternativa. Em outra máquina: `pnpm exec playwright install chromium`.

<!-- CONFIG:INICIO (pnpm validate-config) -->
## Gerado pela config

### Travas de produção

- [x] WhatsApp presente e confirmado
- [ ] Número do endereço confirmado: bloqueante: 405 ou 205 — posts dizem 205
- [ ] Nome canônico confirmado: bloqueante: Tensini Barbieri — confirmar com o Pedro
- [x] Nenhum termo vetado
- [x] Nenhuma mídia naoUsar referenciada
- [x] Nenhum preço exibido sem fonte
- [ ] Termos vetados, preço sem fonte, mídia naoUsar e links wa.me no HTML: conferidos por `pnpm audit-compliance` depois do build.

### Bloqueantes

- `marca.nomeCanonico`: Tensini Barbieri — confirmar com o Pedro
- `contato.endereco.numero`: 405 ou 205 — posts dizem 205

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
