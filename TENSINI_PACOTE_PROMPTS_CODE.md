# Tensini Barbieri — Pacote de prompts para o Claude Code (Opus)

Versão 1 · 24/10/2026 · WAXLO

Base: `TENSINI_INVESTIGACAO_CLIENTE.md` (investigação + SEO/GEO), `TENSINI_MAPA_MIDIA.md` (cada arquivo avaliado), `tensini-monograma-tb.svg` (monograma vetorizado). Repositório: `github.com/joaoCanonica/pedro-tensini`.

---

## Como usar (ordem exata)

1. **Antes da sessão 0**, coloque na raiz do repositório: `TENSINI_INVESTIGACAO_CLIENTE.md`, `TENSINI_MAPA_MIDIA.md`, `TENSINI_PACOTE_PROMPTS_CODE.md` e, em `assets/`, `tensini-monograma-tb.svg`.
2. Abra o Claude Code (Opus) **na pasta do repositório**.
3. **Sessão 0:** cole o bloco da seção B e, logo abaixo, o Prompt 0. **Sem anexos.** A sessão grava o bloco como `CLAUDE.md`.
4. **Sessões 1 a 9:** uma sessão nova para cada, colando **só o prompt**. Não junte prompts. Cada sessão termina em commit.
5. **Nenhuma sessão precisa de anexo.** Mídia nova entra no repositório e roda o **Prompt L**. Dado novo (preço, número, horário de feriado) roda o **Prompt D**.
6. Depois das sessões **1, 3, 4, 6A, 6C e 9**, me traga o relatório e as capturas (390 e 1440 px, claro e escuro). Eu audito antes de você seguir.
7. Ordem: 0 Fundação · 1 Mídia · 2 Config · 3 Design system · 4 Entrada triunfal e hero · 5 Textos · 6A Home · 6B Serviços · 6C Local, Sobre, Agendar, FAQ · 7 Funil WhatsApp e LGPD · 8 SEO e GEO · 9 QA, conferência e deploy.

---

## A. Dados fixos (a sessão 2 transforma em config)

| Campo | Valor | Estado |
|---|---|---|
| Nome canônico | **Tensini Barbieri** (logo oficial: "TENSINI BARBIERI PROFESSIONALE") | RECOMENDADO. Pedro confirma. Variações vistas: "Tensini Barbiere" (@), "Barbearia - Tensini barbieri" (Google) |
| Profissional | Pedro Carlos Tensini ("Pedro Tensini") | CONFIRMADO (Receita + certificado) |
| CNPJ | 42.779.510/0001-59 (MEI, desde 19/07/2021, CNAE 9602-5/01) | REGISTRO. Exibir no rodapé legal |
| Endereço | Rua Hercílio Luz, **405 ou 205**, Galeria Augusta, Centro, Lages/SC, CEP 88501-010 | **BLOQUEANTE**: você passou 405; os posts dizem 205. Falta também andar/sala |
| Coordenadas | -27.8166534, -50.3284045 · plus code 5MMC+8J | VISTO (Google) |
| Horário | seg a sex 8h30–20h · sáb 8h30–18h · dom fechado | CONFIRMADO. Intervalo de almoço e feriados: PENDENTE |
| WhatsApp (funil único) | +55 49 99903-7620 · wa.me/5549999037620 | CONFIRMADO |
| Instagram | @tensinibarbiere_ | CONFIRMADO |
| Google | 5,0 · 2 avaliações (Vinicius Farias, Diogo Amaral) · conferido 24/10/2026 · sem site | VISTO |
| Serviços | Corte · degradê com acabamento na shaver (especialidade) · barba · barbaterapia (toalha quente, esfoliação, creme e massagem, navalha) · sobrancelha · pomadas/finalização | VISTO nos posts. Preços e duração: PENDENTE (Google indica R$ 40–60) |
| Formação | Cursos 2021: Diogo Silva (workshop, certificado), Elson Telles (tesoura), Moretti Class, aperfeiçoamento em Caxias do Sul, Stop Barber (Farroupilha) | VISTO nos destaques. Pedro confirma o que entra |
| Domínio | — | PENDENTE. `SITE_URL` por variável; noindex até existir |
| Agenda | Usa app de agenda (visto no vídeo) | PENDENTE: nome e se tem link público |

**Decisões do João (24/10/2026):** o funil é **agendar no WhatsApp**, explícito em toda a página. Horário e local têm de ser impossíveis de não ver. Entrada triunfal de barbeiro. Mais vídeos virão.

---

## B. BLOCO "CONTEXTO DO PROJETO" (colar só na sessão 0)

````text
CONTEXTO DO PROJETO — Tensini Barbieri, barbeiro Pedro Tensini (site premium)
Idioma de tudo (código, comentários curtos, textos, relatórios): português do Brasil.

1. QUEM E O QUÊ
- Cliente: Pedro Tensini, barbeiro, "Tensini Barbieri" (nome canônico a confirmar), Galeria Augusta, Rua Hercílio Luz, Centro, Lages/SC. Trabalha sozinho até prova em contrário.
- Especialidade (provas nos vídeos e posts): degradê com acabamento na shaver; barba e barbaterapia (toalha quente, esfoliação, creme e massagem, navalha); sobrancelha; orientação de pomada e finalização. Atendimento com café.
- Voz dele (frases reais, usar como matéria-prima): "Imagem e presença não são por acaso." · "Seu visual fala antes de qualquer palavra. Faça ele transmitir confiança." · "Atendimento focado em detalhe e resultado." · "Precisão nos acabamentos, elegância no resultado!" · "Mais que um corte, uma experiência." · "Se você repara nos detalhes, já sabe onde vir." · "Nem toda pomada é igual…". Sem emojis, sem hashtags no site.
- OBJETIVO DO SITE (nesta ordem): (1) AGENDAR PELO WHATSAPP; (2) ser encontrado e recomendado pelo Google e pelas IAs (SEO local + GEO); (3) deixar horário e local impossíveis de errar.
- Meta do João (CEO da WAXLO): o site de barbeiro mais premium da região. Sem "cara de IA". O visual e o vídeo são o que mais valem.
- Regra do projeto: o site primeiro. A conferência de normas (CDC, LGPD, direito de imagem, Google) é UMA passada no final (sessão 9). O que o João mandou está autorizado. Não corte conteúdo por falta de papel: sinalize em docs/PENDENCIAS.md.
- Dados do cliente (preço, número, anos, nomes, cursos) NUNCA são inventados. Faltou: campo pendente.

2. O FUNIL (vale para cada tela)
- Toda ação principal leva ao WhatsApp 5549999037620 com mensagem pré-preenchida. Não existe formulário com backend, não existe "enviar".
- Botão fixo "Agendar no WhatsApp" visível em todo o site (barra inferior no mobile, no cabeçalho no desktop), sem cobrir conteúdo nem o rodapé legal.
- Montador de mensagem: serviço + dia (hoje / amanhã / escolher data; domingo desabilitado) + período (manhã / tarde / noite, limitado pelo horário daquele dia) + nome opcional → abre wa.me com o texto. Sem guardar nada.
- Texto honesto: "Você escolhe e o Pedro confirma o horário no WhatsApp." Nunca "agendado" nem "horário garantido".
- Secundários: "Como chegar" e "Ligar". O link do app de agenda só entra se o João confirmar.

3. HORÁRIO E LOCAL (explícitos, sempre)
- Status ao vivo calculado em America/Sao_Paulo: "Aberto agora · fecha às 20h", "Fecha em 40 min", "Fechado · abre amanhã às 8h30", "Fechado · abre segunda às 8h30". O HTML estático já traz a tabela completa (funciona sem JS, é o que o Google e as IAs leem). Exceções (feriados, folgas) por config.
- O horário aparece: no hero (status), no rodapé de todas as páginas, na página Como chegar, no montador e no JSON-LD.
- O local aparece: endereço completo no hero, no rodapé e no Como chegar; "na Galeria Augusta" sempre junto da rua; passo a passo "da calçada à cadeira" com fotos/vídeo quando existirem; botões Google Maps, Waze e Apple Mapas; mapa interativo só após clique e consentimento (antes disso, imagem estática).

4. STACK
- Astro (estável atual; conferir e fixar), TypeScript strict, estático, ilhas mínimas, pnpm, Node LTS, `engines` e `packageManager` fixados.
- Movimento: CSS + IntersectionObserver + Web Animations API. Scroll-driven animations e View Transitions só como melhoria progressiva sob @supports. Sem GSAP, Lenis, Motion, Swiper, jQuery. Nunca sequestrar o scroll.
- Orçamento (medir): JS ≤ 35 KB gzip por página; LCP < 2,0 s em 4G mobile; CLS ≈ 0; INP < 200 ms; Lighthouse mobile ≥ 95 (Performance/BP/SEO) e 100 (Acessibilidade). Vídeo nunca é o LCP: o LCP é o pôster AVIF.
- Fontes self-hosted (subset latino).

5. IDENTIDADE
- Assinatura: "O DEGRADÊ". A especialidade dele é a transição perfeita do curto ao longo. O site passa de um estado ao outro como um degradê bem feito:
  (a) ENTRADA: uma "passada de máquina". Uma linha de latão fina atravessa a tela de cima para baixo; atrás dela o monograma TB e a imagem do hero saem do desfocado para o nítido (detalhes no Prompt 4).
  (b) ESCALA DE PENTE: os marcadores de seção usam a numeração dos pentes de máquina (3 · 2 · 1½ · 1 · ½ · 0). A home vai do mais amplo (3 = a barbearia) ao mais preciso (0 = acabamento e agendar). É navegação editorial, não decoração.
  (c) TRANSIÇÕES ENTRE SEÇÕES: borda em hachura fina de linhas paralelas cuja densidade cai (máscara CSS), como o fade na nuca. Estática; acende uma vez ao entrar na tela.
  (d) FOCO/HOVER: sublinhado que vai de cheio a hachurado.
  É evento, não progresso do scroll.
- PROIBIDO repetir (usado em outros sites nossos): vinho + coluna de pontos, linha da vida, curva dourada, oval verde, arco, navy + areia; assinaturas "A Contraforma" e "A Fresta"; fontes Cormorant, Bodoni Moda (e família Bodoni), Marcellus, Instrument Serif, Hanken Grotesk, Fraunces, Lato, Figtree, Jost, Gloock, Urbanist, Spectral, Newsreader, Albert Sans.
- Paleta (tokens claro e escuro; calibrar com os vídeos; validar AA por script):
  Carvão ≈ #121316 (escuro principal); Navy capa ≈ #15233F (superfície escura secundária, cor das capas); Latão ≈ #B89252 (acento: monograma, linha da passada, números da escala; CHAPADO, nunca dourado metálico com brilho/gradiente); Giz ≈ #F1F0EC (claro principal, frio, NÃO areia); Aço ≈ #8C9098 (texto secundário, linhas); Musgo ≈ #2E3D2A (raríssimo, eco da parede verde).
- Tipografia (testar e decidir na sessão 3; licença OFL; self-host): títulos em Libre Caslon Display (serifa de contraste, conversa com o TB clássico); texto e interface em Schibsted Grotesk; números (horários, preços, escala) em Schibsted com tabular-nums. Alternativas: DM Serif Display / Inter Tight. Rótulos em versaletes espaçados como o "BARBIERI" do logo.
- Marca: assets/tensini-monograma-tb.svg (cor única, currentColor). O logo raster 3D NÃO vai ao site. O nome é tipografia.

6. ANTI "CARA DE IA"
Proibido: grade de cartões brancos arredondados; ícone em círculo; pílulas por toda parte; ícones de tesoura/bigode/poste de barbeiro como ilustração; hero centralizado com degradê roxo/azul; textura "vintage" falsa, madeira falsa, couro falso; "Est. 20XX" inventado; seções iguais.
Usar: vídeo real grande e vertical; recortes editoriais; tipografia grande contra texto pequeno; a escala de pente; alternância carvão / giz; tabela de horário tratada como peça gráfica, não como card.

7. MÍDIA
- Originais em media-originais/ (git mv de assets/ e videos/). Derivados no build em public/media/ (fora do git): AVIF/WebP com srcset, LQIP, pôster por vídeo, MP4 H.264 + WebM, loops mudos.
- Manifesto media.manifest.json: id, arquivo, tipo, post de origem, legenda literal, uso, trechos (in/out em segundos), audioLiberado (bool), problemas, edicoes, naoUsar.
- Edição permitida: cor/exposição/balanço de branco GLOBAIS, recorte, corte de trechos. Proibido: IA generativa, apagar texto queimado por IA, super-resolução em rosto, retoque em pessoas. Tudo registrado no manifesto.
- Vídeos: tocam mudos; loops sem controles só se forem decorativos (aria-hidden + botão pausar global); vídeos de conteúdo com controles e legenda/descrição. Som só em audioLiberado.
- Pessoas: Pedro e clientes autorizados (João confirmou). Nenhum nome de cliente aparece.

8. CONFIG E TRAVAS
- Fonte única em src/config/ tipada com confirmado(), opcional(), bloqueante(), aviso(). Preview sempre funciona (faixa "em revisão", selo PROVISÓRIO, noindex).
- Produção trava só em: WhatsApp ausente; número do endereço não confirmado; nome canônico não confirmado; termo vetado no HTML; mídia "naoUsar" referenciada; preço exibido sem fonte.
- Termos vetados (src/config/termos.ts): "o melhor", "a melhor", "melhor barbeiro", "número 1", "nº 1", "garantido", "garantia", "horário garantido", "agendado com sucesso", "100%". O Code NUNCA afrouxa listas nem travas sem ordem expressa.

9. CONDUTA DO CODE
- Um prompt = uma sessão = um commit, mensagem curta em português.
- Plano curto antes de tarefa grande. Capturas e métricas no lugar de "ficou ótimo". Se não conseguir, diga.
- Capturas em 390 e 1440 px, claro e escuro, e com prefers-reduced-motion.
- Relatório no fim: o que mudou · o que falhou · o que depende do João · números medidos.
````

---

## PROMPT 0 — Fundação

````text
[COLE AQUI O BLOCO "CONTEXTO DO PROJETO" INTEIRO, ANTES DESTE TEXTO]

Tarefa: criar a fundação do projeto Astro no repositório pedro-tensini e gravar o contexto como CLAUDE.md.
Escopo: estrutura e configuração. NÃO escreva páginas, textos ou componentes visuais. NÃO apague mídia.
Leia primeiro: git ls-files; TENSINI_MAPA_MIDIA.md (resumo e achados).

Passos:
1. Salve o bloco de contexto, sem alterar, como CLAUDE.md na raiz e como docs/CONTEXTO.md.
2. Crie docs/ e mova para lá (git mv): TENSINI_INVESTIGACAO_CLIENTE.md, TENSINI_MAPA_MIDIA.md, TENSINI_PACOTE_PROMPTS_CODE.md. Se faltar algum, anote em docs/PENDENCIAS.md e siga.
3. Verifique: node, pnpm, git, ffmpeg, ffprobe, sharp (via pnpm), Chromium do Playwright. Liste o que falta; instale o seguro via pnpm. Nada global sem me dizer.
4. Astro (estável atual, TS strict, estático, sem framework de UI) na raiz, preservando assets/ e videos/. package.json: name "tensini-site", engines, packageManager, scripts: dev, build, preview, check, validate-config, audit-compliance, audit-a11y, audit-lighthouse, audit-seo, audit-contraste, media:prepare, capturar. Auditorias podem nascer como stubs.
5. Estrutura: src/{config,components,layouts,pages,styles,scripts,content}, scripts/, docs/{capturas,dados}, media-originais/ (.gitkeep), public/. .gitignore: node_modules, dist, .astro, public/media, docs/capturas/**/*.png, .env*.
6. tsconfig strict, ESLint + Prettier mínimos, .editorconfig, .nvmrc.
7. scripts/capturar.mjs: sobe o preview e captura rotas em 390 e 1440 px, claro e escuro (data-theme no <html>), e com prefers-reduced-motion, em docs/capturas/<data>/.
8. Página temporária "/" com <h1>Tensini Barbieri</h1> e noindex.
9. README.md curto.

Critério de aceite: pnpm install, build e check verdes; pnpm capturar funciona; CLAUDE.md idêntico ao bloco; commit "fundação".
````

---

## PROMPT 1 — Mídia: catálogo, cortes, loops, derivados

````text
Leia CLAUDE.md e docs/TENSINI_MAPA_MIDIA.md. Esta sessão só trata mídia. NADA vai para páginas.

Tarefa: mover originais, gerar manifesto, recortar fotos, cortar trechos e loops, gerar derivados.
Escopo: media-originais/, media.manifest.json (+ JSON Schema), scripts/prepare-media.mjs, scripts/extract-stills.mjs, docs/MIDIA_CATALOGO.md. Originais intactos (só git mv).

Passos:
1. git mv assets/* e videos/* para media-originais/{fotos,videos,marca}/. tensini-monograma-tb.svg em marca/.
2. Casar cada vídeo com o post do Instagram (o mapa já indica 4; para corte1, corte2 e corte-acabamento, registre "post: pendente" se não houver como conferir; não invente).
3. Manifesto com os campos do CLAUDE.md, seção 7. Marque:
   - naoUsar: SaveClip…858462534… (colagem), Pedro-tensini-logo.JPG (raster 3D; só referência), seu-visual-fala…mp4 (texto queimado; a frase vira texto).
   - audioLiberado: false para todos por padrão. Candidatos a liberar (João confirma): qual-pomada-certa, bastidores (trecho final com a fala do Pedro).
4. FOTOS da barbaterapia (856610241 toalha quente · 857872880 esfoliação · 858788059 creme e massagem · 858729706 navalha · 858196088 barba finalizada): derivado recortado sem texto queimado, logo e rodapé (faixa útil y ≈ 170–1000; no 858729706 até y ≈ 800). Escolha a proporção comum que perder menos (4:3 ou 1:1), registre o recorte. Se alguma não sobreviver ao recorte, relate. Preveja a troca pelos originais sem texto: o recorte é "provisório" no manifesto.
5. VÍDEOS — trechos (in/out em segundos, confira quadro a quadro e ajuste ±0,5 s):
   - loop-hero: experiencia-babearia-verdadeira 16–22 s (macro da máquina na barba). Mudo, 6 s, sem corte visível no laço (crossfade de 0,4 s se precisar), ≤ 1,2 MB em 720×1280 e versão 540×960.
   - loop-degrade: corte1 6–9 s (close do degradê na nuca) + 9–10 s (pezinho).
   - resultado-1: corte-acabamento 26–35 s (giro do resultado).
   - resultado-2: corte2 40–62 s (4 ângulos).
   - experiencia-completa: experiencia-babearia-verdadeira inteiro (seção Barba).
   - bastidores-site: bastidores SEM 7–9 s (tela da agenda com possíveis nomes de clientes) e sem o selo queimado se ele só ocupar os primeiros segundos (corte, não apagamento).
   - pomadas: qual-pomada-certa inteiro.
   - trajetoria: primeiro-video inteiro (uso médio).
   Para cada um: pôster AVIF do quadro mais nítido, MP4 H.264 + WebM, 720×1280 e 540×960, faststart.
6. STILLS: extraia 6–10 quadros nítidos (scripts/extract-stills.mjs) de experiencia (máquina vinho, navalha, resultado), corte1 (plano geral com parede verde 10–12 s, Pedro concentrado 13–15 s), bastidores (plano geral da barbearia, café sendo servido) e corte-acabamento (resultado de perfil e nuca). Natureza "quadro de vídeo"; sem upscale por IA; tamanho máximo de exibição registrado.
7. Retrato do Pedro: não há retrato bom (foto-pedro.jpg tem 150 px). Separe os 3 melhores quadros do Pedro nos vídeos (rosto nítido, sem máscara) como retrato provisório e registre em PENDENCIAS: "retrato profissional do Pedro".
8. scripts/prepare-media.mjs (predev/prebuild, idempotente, cache por hash): AVIF/WebP 480/800/1200/1600 (nunca acima do original), LQIP, vídeos acima.
9. docs/MIDIA_CATALOGO.md: tabela (arquivo, uso, trecho, pesos, problemas), folha de contato de cada trecho em docs/capturas/midia/, e a lista do que pedir ao João.

Critério de aceite: media:prepare roda do zero e é idempotente; manifesto válido no schema; loop-hero ≤ 1,2 MB; nenhum naoUsar publicável; build verde.
````

---

## PROMPT 2 — Config, horário, local e travas

````text
Leia CLAUDE.md e docs/MIDIA_CATALOGO.md.

Tarefa: config tipada (fonte única), motor de horário, dados de local e travas.
Escopo: src/config/**, src/lib/horario.ts, src/lib/whatsapp.ts, scripts/validate-config.mjs, scripts/audit-compliance.mjs (inicial), scripts/test-config.mjs, docs/PENDENCIAS.md, componentes PreviewBanner e Provisorio (estilo mínimo). Sem copy final.

Passos:
1. tipos.ts: confirmado(v, fonte), opcional(v), bloqueante(rotulo), aviso(rotulo, motivo), Campo<T>.
2. marca.ts: nomeCanonico = bloqueante("Tensini Barbieri — confirmar com o Pedro"), variacoesVistas, profissional "Pedro Tensini" (nome completo Pedro Carlos Tensini), CNPJ 42.779.510/0001-59 (exibirCnpj=true), monograma.
3. contato.ts: whatsapp 5549999037620 (confirmado); telefone (49) 99903-7620; instagram; endereco { rua "Rua Hercílio Luz", numero = bloqueante("405 ou 205 — posts dizem 205"), complemento "Galeria Augusta", salaAndar = opcional(), bairro "Centro", cidade "Lages", uf "SC", cep "88501-010" }; geo -27.8166534/-50.3284045; plusCode "5MMC+8J"; links Google Maps (ficha), Waze e Apple Mapas montados das coordenadas; comoChegar = passos[] (vazio até ter foto/vídeo; cada passo: texto, midia opcional); estacionamento = opcional().
4. horario.ts: semana estruturada (seg–sex 08:30–20:00, sáb 08:30–18:00, dom fechado), intervalo = opcional(), excecoes[] (data, fechado | horário especial, motivo), fuso America/Sao_Paulo.
5. src/lib/horario.ts (puro, testável, sem dependência): statusEm(data) → { aberto, rotulo, fechaEm, abreEm } com rótulos "Aberto agora · fecha às 20h", "Fecha em 40 min" (≤ 60 min), "Fechado · abre hoje às 8h30", "Fechado · abre amanhã às 8h30", "Fechado · abre segunda às 8h30", respeitando exceções. periodosDisponiveis(dia) → manhã (até 12h), tarde (12h–18h), noite (18h–fechamento), só os que existem naquele dia. Testes: domingo, sábado 17h45, segunda 8h00, sexta 19h30, feriado em exceção, virada de ano.
6. src/lib/whatsapp.ts: montarMensagem({ servico, dia, periodo, nome? }) → texto exato:
   "Olá, Pedro! Vim pelo site e quero agendar: {servico}. Prefiro {dia}, {periodo}.{ Meu nome é {nome}.}"
   e linkWhatsApp(texto) → https://wa.me/5549999037620?text=... (encodeURIComponent). Mensagem padrão sem escolhas: "Olá, Pedro! Vim pelo site e quero agendar um horário." Testes.
7. servicos.ts: corte, degrade (acabamento na shaver; destaque), barba, barbaterapia (5 tempos: toalha quente, esfoliação, creme e massagem, navalha, barba finalizada), sobrancelha, combos = opcional(). Cada um: slug, nome, descricaoCurta (vazia), preco = opcional(), duracao = opcional(), midia[]. Preço só aparece se confirmado.
8. avaliacoes.ts: Google 5,0 · 2 · conferido 24/10/2026; trechos literais (Vinicius Farias "Top! Atendimento excelente de alta qualidade!"; Diogo Amaral "Atendimento de qualidade, barbeiro muito profissional"); linkAvaliar = opcional(); aviso se conferidoEm > 60 dias.
9. formacao.ts: itens da investigação com fonte (destaque "Mentorias"), todos opcional() até o Pedro confirmar.
10. agenda.ts: app = opcional(), linkPublico = opcional(), exibir=false.
11. termos.ts, seo.ts (SITE_URL por env; indexar=false até domínio), tema.ts.
12. validate-config.mjs: PENDENCIAS.md. Produção falha SÓ pelas travas do CLAUDE.md seção 8.
13. audit-compliance.mjs (inicial): termos vetados em dist/; preço exibido sem confirmado; naoUsar referenciado; todo link wa.me aponta para o número da config.

Critério de aceite: testes de horário e WhatsApp verdes; preview passa com pendências; cada trava simulada derruba a produção; commit "config".
````

---

## PROMPT 3 — Design system, monograma e "O Degradê"

````text
Leia CLAUDE.md, docs/MIDIA_CATALOGO.md e src/config/tema.ts. Pesquise antes: docs.astro.build (fontes), MDN (mask-image, @property, scroll-driven animations, View Transitions), web.dev (LCP de vídeo/pôster).

Tarefa: tokens, tipografia, monograma, componentes base e os 4 usos da assinatura "O Degradê". Página /_estilo (noindex) mostrando tudo.
Escopo: src/styles/**, src/components/base/**, src/components/marca/**, src/pages/_estilo.astro, scripts/audit-contraste.mjs.

Passos:
1. Tokens (claro e escuro; escuro é o padrão do site): cores do CLAUDE.md calibradas contra os stills (o navy deve ser o das capas; o latão, o do monograma chapado). audit-contraste.mjs valida AA de cada par texto/fundo usado.
2. Tipografia: teste Libre Caslon Display + Schibsted Grotesk contra DM Serif Display + Inter Tight, em 3 provas (hero, tabela de horário, citação). Escolha e justifique com capturas. Self-host, subset latino, font-display swap, preload só da fonte do H1. Escala fluida (clamp) com display muito grande e texto 17–18 px.
3. Monograma: componente <Monograma> a partir de assets/tensini-monograma-tb.svg (currentColor, title acessível). Confira e limpe os 2 entalhes na barra horizontal que vieram do bevel do raster (ajuste de nós, sem mudar o desenho). Variante "assinatura": monograma + "TENSINI" em versaletes espaçados + régua fina com losango central (eco do logo) + "BARBIERI".
4. Assinatura "O Degradê" (componentes):
   (a) <Passada>: linha de latão de 1–2 px com leve brilho que percorre um bloco de cima para baixo e revela o conteúdo por clip-path; uma vez; WAAPI. Base da entrada e das revelações de imagem.
   (b) <EscalaPente valor="3|2|1½|1|½|0">: marcador de seção (número em latão tabular + rótulo em versalete). Precisa ler como navegação editorial; teste sem ele para ver se faz falta.
   (c) <BordaDegrade>: borda entre seções em hachura de linhas paralelas com densidade decrescente (mask-image com repeating-linear-gradient ou SVG pattern), de carvão para giz e vice-versa. Acende uma vez (opacity/mask) ao entrar na tela.
   (d) Links e foco: sublinhado de cheio para hachurado; foco visível de alto contraste (nunca só cor).
5. Componentes base: Botão primário "Agendar no WhatsApp" (ícone oficial do WhatsApp monocromático, SVG inline, sem círculo), botão secundário, Link, Rótulo, Citação (voz do Pedro, com fonte), Tabela de horário (peça gráfica: dias em versalete, horas em tabular, hoje destacado com a linha de latão), Status ao vivo (ponto + texto; o texto carrega o significado), Moldura de vídeo vertical "espelho" (borda fina luminosa quente, eco do espelho iluminado da barbearia), Pôster com LQIP.
6. Movimento: durações 160–600 ms, uma curva assinatura; prefers-reduced-motion desliga tudo que se move e mantém os estados finais.
7. /_estilo com tudo, claro e escuro.

Critério de aceite: contraste AA verde; capturas de /_estilo 390/1440 claro/escuro/reduced-motion; JS desta sessão ≤ 5 KB; commit "design system".
````

---

## PROMPT 4 — Entrada triunfal e hero

````text
Leia CLAUDE.md, src/styles e src/components (sessão 3). Use o loop-hero e o pôster do manifesto.

Tarefa: a entrada triunfal e o hero da home. Só isso.
Escopo: src/components/entrada/**, src/components/hero/**, src/pages/index.astro (só o hero; o resto vazio).

A ENTRADA — "A PASSADA" (≤ 2,4 s no total, uma vez por sessão):
- 0–0,25 s: tela carvão. O monograma TB está lá, desfocado e escuro, quase invisível.
- 0,25–1,0 s: uma linha de latão fina entra no topo e desce pelo monograma como a passada de uma máquina. Por onde passa, o TB fica nítido e latão (clip-path + blur→0). Logo abaixo, "TENSINI" em versaletes espaçados aparece letra a letra com tracking que fecha (sem bounce).
- 1,0–1,7 s: a linha continua descendo pela tela inteira. Atrás dela, o pôster do hero passa de desfocado e escuro para nítido (duas camadas do MESMO arquivo: uma com filtro, uma limpa recortada pela linha). É o degradê acontecendo na tela.
- 1,7–2,4 s: o monograma encolhe e voa para o cabeçalho (FLIP com WAAPI; View Transition se suportado); entram, em sequência curta, H1, linha de status/endereço e o botão "Agendar no WhatsApp". O vídeo-loop começa a tocar no lugar do pôster quando estiver pronto (sem salto).
- Sem som. Botão "Pular" visível e acessível desde o primeiro quadro; qualquer toque, clique, tecla ou rolagem pula para o estado final. Uma vez por sessão (sessionStorage com try/catch). Visitas seguintes e reduced-motion: estado final direto. Sem JS: estado final direto (a camada da entrada só existe se o JS criá-la).
- O pôster do hero é o LCP e está no HTML desde o início com fetchpriority="high". Meça: a entrada não pode piorar o LCP (rode Lighthouse com e sem ela; se piorar, a camada usa o próprio pôster já pintado).

O HERO:
- Mobile (390): vídeo vertical em tela cheia (720×1280 casa com o celular), véu escuro só embaixo para leitura. Embaixo, nesta ordem: rótulo "Barbeiro no Centro de Lages"; H1; status ao vivo ("Aberto agora · fecha às 20h"); endereço curto "Rua Hercílio Luz, Galeria Augusta — Centro" (vira link para Como chegar); botão "Agendar no WhatsApp" largo; link "Ver horários e como chegar".
- Desktop (1440): composição assimétrica. Coluna de texto à esquerda (H1 muito grande em Libre Caslon), vídeo vertical à direita na moldura "espelho", sem cortar o vídeo na horizontal. A tabela de horário compacta aparece na base da coluna de texto, com hoje destacado.
- H1 (provisório, a sessão 5 refina): "Degradê, barba e acabamento no detalhe." Subtítulo com o nome: "Pedro Tensini · Tensini Barbieri". O nome da pessoa e da cidade precisam estar no texto visível do hero (SEO).
- Botão pausar o vídeo sempre visível (WCAG 2.2.2). Vídeo com muted, playsinline, loop, preload="none" até o pôster pintar; não carrega em Save-Data nem em conexão 2g.

Critério de aceite: GIF/sequência de capturas da entrada (0, 0,5, 1,0, 1,5, 2,0, 2,4 s) em 390 e 1440; LCP < 2,0 s mobile medido com e sem entrada; Pular funciona por teclado; reduced-motion sem animação; commit "entrada e hero".
````

---

## PROMPT 5 — Textos (a voz dele, editada para o site)

````text
Leia CLAUDE.md, docs/TENSINI_INVESTIGACAO_CLIENTE.md (frases, legendas, avaliações, formação) e src/config.

Tarefa: escrever TODOS os textos do site em src/content/textos/*.md (ou .ts), com fonte de cada citação.
Escopo: só texto. Nada de layout.

Regras de voz:
- Frases curtas, diretas, segunda pessoa ("você"), confiantes sem exagero. Léxico dele: detalhe, precisão, acabamento, presença, confiança, experiência. Sem emoji, sem "venha conferir", sem "seja bem-vindo", sem superlativo vetado.
- Citações literais dele em destaque, com fonte (post). Ex.: "Seu visual fala antes de qualquer palavra. Faça ele transmitir confiança."
- Cada página de serviço responde, em texto simples, o que um cliente pergunta (para o Google e para as IAs): o que é, como é feito, quanto tempo (se confirmado), quanto custa (se confirmado), para quem é, como agendar, onde fica, horário. Primeiro parágrafo de cada página = resposta completa em 2–3 frases com nome, serviço, bairro e cidade ("O Pedro Tensini faz degradê com acabamento na shaver na Galeria Augusta, Centro de Lages…").
- Nada inventado: sem anos de experiência, sem número de clientes, sem prêmios. Formação só com o que for confirmado (até lá, campo provisório).

Textos a entregar:
1. Home por seção (escala 3 → 0): 3 A barbearia (ambiente, café, Galeria Augusta) · 2 O degradê (especialidade, shaver) · 1½ Barba e barbaterapia (os 5 tempos) · 1 O Pedro (quem é, cuidado, formação provisória) · ½ Resultados e o que dizem (2 avaliações literais + convite a avaliar) · 0 Agendar (montador, horário, local).
2. Páginas: /degrade-em-lages, /barba-e-barbaterapia, /sobrancelha, /pomadas (roteiro do vídeo virado texto: brilho, fixação, efeito seco; qual para quem), /servicos-e-precos, /sobre-pedro-tensini, /como-chegar, /agendar, /perguntas-frequentes (10–14 perguntas reais: aceita encaixe? atende sábado? quanto tempo leva o degradê? tem estacionamento? como acho a Galeria Augusta? atende criança? formas de pagamento? — as que dependem de dado ficam com resposta provisória marcada), /avaliar, /privacidade, 404.
3. Microtextos: status, botões, montador ("O que você quer fazer?", "Qual dia?", "Qual período?", "Seu nome (opcional)", "Abrir conversa no WhatsApp", nota "O Pedro confirma o horário com você por lá."), rodapé, alt de cada imagem (descreve o que se vê, sem palavra-chave forçada), descrições dos vídeos.
4. Metas: title (≤ 60) e description (≤ 155) de cada página, com serviço + Lages.

Critério de aceite: zero termo vetado (rode audit-compliance sobre os .md); toda citação com fonte; lista de campos provisórios em PENDENCIAS; commit "textos".
````

---

## PROMPT 6A — Home

````text
Leia CLAUDE.md, src/content/textos e os componentes das sessões 3 e 4.

Tarefa: montar a home inteira abaixo do hero, seguindo a escala de pente 3 → 0. Cada seção com um gesto próprio.
Escopo: src/pages/index.astro, src/components/secoes/**.

Seções:
- 3 · A BARBEARIA: still do plano geral (parede verde, espelho, poltrona) grande e sangrado, texto curto, detalhe do café (still do bastidores). Linha "Rua Hercílio Luz, Galeria Augusta — Centro" em destaque.
- 2 · O DEGRADÊ: o gesto é o ZOOM DE ACABAMENTO. Still do resultado (corte-acabamento) com um recorte retangular ampliado (nada de lupa circular) que acompanha o ponteiro/toque sobre a nuca (no toque: arrasta; sem JS: duas imagens lado a lado, inteira e detalhe). Ao lado, loop-degrade na moldura espelho. Link para /degrade-em-lages.
- 1½ · BARBA E BARBATERAPIA: os 5 tempos em sequência horizontal com rolagem nativa (scroll-snap, sem JS de carrossel): toalha quente → esfoliação → creme e massagem → navalha → barba finalizada, cada foto com o número e o nome do tempo. Botão "Ver a experiência completa" abre o vídeo experiencia-completa num <dialog> acessível.
- 1 · O PEDRO: retrato provisório (quadro de vídeo) + citação dele grande ("Imagem e presença não são por acaso.") + 3 linhas sobre ele + link para /sobre-pedro-tensini. Selo PROVISÓRIO no retrato enquanto não houver foto profissional.
- ½ · RESULTADOS E O QUE DIZEM: resultado-1 e resultado-2 em janelas verticais; as 2 avaliações do Google literais com nome e data de conferência; link "Ver no Google" e "Avaliar o Pedro". Sem estrelas inventadas, sem média em destaque gigante.
- 0 · AGENDAR: montador de mensagem completo (ilha), tabela de horário completa com hoje destacado e status, endereço completo, botões Google Maps / Waze / Apple Mapas, mapa estático (imagem) com o pino; "Como chegar passo a passo" (link).
- Rodapé: monograma, nome canônico, endereço completo, horário completo, WhatsApp, Instagram, CNPJ, privacidade.
- Barra fixa "Agendar no WhatsApp" (mobile) / botão no cabeçalho (desktop); some quando a seção 0 está visível para não duplicar.

Critério de aceite: capturas 390/1440 claro/escuro/reduced-motion da home inteira; Lighthouse mobile ≥ 95/100; JS total da home ≤ 35 KB gzip; sem rolagem horizontal da página; commit "home".
````

---

## PROMPT 6B — Páginas de serviço

````text
Leia CLAUDE.md, src/content/textos e src/config/servicos.ts.

Tarefa: páginas de serviço com template próprio (não cópia da home), feitas para responder busca local.
Escopo: src/pages/{degrade-em-lages,barba-e-barbaterapia,sobrancelha,pomadas,servicos-e-precos}.astro, src/layouts/Servico.astro.

Template Servico: H1 com serviço + Lages; parágrafo-resposta; mídia principal (vídeo vertical ou still); "Como é feito" em passos numerados com a escala de pente; "Quanto custa e quanto tempo" (só com dado confirmado; senão "Valores pelo WhatsApp" + selo PROVISÓRIO em preview); bloco Agendar (montador já com o serviço escolhido); bloco Onde e quando (endereço + status + horário); perguntas da página; links para os outros serviços. Breadcrumb visível.
- /degrade-em-lages: loop-degrade, resultado-1, resultado-2, zoom de acabamento; o que é a shaver e por que deixa o acabamento limpo (texto dele).
- /barba-e-barbaterapia: 5 tempos + vídeo experiencia-completa.
- /sobrancelha: still do primeiro-video (navalha na sobrancelha); página curta, honesta.
- /pomadas: vídeo pomadas (som só se audioLiberado), guia em texto: brilho × matte × fixação, qual para cada cabelo, como aplicar. Sem link de compra até o João dizer que ele vende.
- /servicos-e-precos: tabela editorial (não cards) de todos os serviços; preços confirmados ou "consulte".

Critério de aceite: capturas de cada página 390/1440; nenhuma página com preço não confirmado em produção; commit "servicos".
````

---

## PROMPT 6C — Como chegar, Sobre, Agendar, FAQ, Avaliar, 404

````text
Leia CLAUDE.md e src/content/textos.

Tarefa: as páginas que tiram dúvida de local, horário e confiança.
Escopo: src/pages/{como-chegar,sobre-pedro-tensini,agendar,perguntas-frequentes,avaliar,privacidade,404}.astro.

- /como-chegar (a página mais importante depois da home): H1 "Como chegar à Tensini Barbieri, na Galeria Augusta"; endereço completo grande com botão copiar; status + horário completo; "Da calçada à cadeira" em passos (rua → entrada da galeria → andar/sala → porta), cada passo com foto/vídeo quando existir e com selo "foto em breve" em preview quando não; botões Google Maps / Waze / Apple Mapas; mapa estático e, após clique + consentimento, mapa interativo; estacionamento (pendente); referência de pontos próximos SÓ se confirmados.
- /sobre-pedro-tensini: retrato; texto; formação (itens confirmados, com o certificado do workshop em imagem se o João liberar); vídeos bastidores-site e trajetoria; citações dele.
- /agendar: página só do montador + horário + local (é o destino dos QR codes e da bio do Instagram). Sem distração.
- /perguntas-frequentes: <details> nativos; respostas curtas; sem resposta inventada.
- /avaliar: explica em 2 linhas, botão para o link de avaliação do Google (quando existir), QR code gerado no build para imprimir na bancada (versão para impressão A6 com o monograma). Texto neutro: pede avaliação de quem foi atendido; nada de sorteio, desconto ou brinde em troca (proibido pelo Google).
- /privacidade: LGPD em linguagem simples (sem formulário; o que o site mede, consentimento, WhatsApp é conversa direta).
- 404: curta, com os 3 caminhos (agendar, como chegar, início) e o monograma.

Critério de aceite: capturas 390/1440; /agendar carrega com JS ≤ 10 KB; QR aponta para a URL de config; commit "local e paginas".
````

---

## PROMPT 7 — Funil WhatsApp, medição e LGPD

````text
Leia CLAUDE.md, src/lib/whatsapp.ts e src/lib/horario.ts.

Tarefa: endurecer o funil e medir sem invadir.
Escopo: ilhas do montador e do status, src/components/consentimento/**, src/lib/medicao.ts, docs/FUNIL.md.

Passos:
1. Montador: acessível (fieldset/legend, rádios estilizados, sem div clicável), funciona com teclado, leitor de tela anuncia o resumo ("Degradê, amanhã, à tarde"); domingo e períodos inexistentes desabilitados com explicação; data escolhida em um fechamento de exceção avisa. Sem JS: link wa.me com a mensagem padrão.
2. Todos os CTAs do site passam por linkWhatsApp() com origem (?origem não vai na URL do wa.me; só no evento de medição) e mensagem adequada ao contexto (página de degradê já preenche "degradê").
3. Status ao vivo: hidrata no cliente; HTML estático mostra a tabela; atualiza a cada minuto só com a aba visível.
4. Medição: eventos clique_whatsapp (origem, servico), clique_como_chegar (app), clique_ligar. Ferramenta: sem cookies (ex.: Plausible/Umami auto-hospedável) OU GA4 só após consentimento. Proponha e justifique; nada carrega antes do consentimento se usar cookie.
5. Banner de consentimento: botões Aceitar e Recusar com o MESMO peso; mapa interativo e medição com cookie só após aceitar; preferência alterável no rodapé.
6. docs/FUNIL.md: todos os caminhos até o WhatsApp, as mensagens exatas, e como ler os eventos.

Critério de aceite: teste e2e (Playwright) do montador em 390 px gerando o link exato para 4 cenários; nenhum request de terceiros antes do consentimento (comprovado por captura da aba Network); commit "funil e lgpd".
````

---

## PROMPT 8 — SEO local e GEO

````text
Leia CLAUDE.md e a seção SEO/GEO de docs/TENSINI_INVESTIGACAO_CLIENTE.md. Pesquise antes, e cite: schema.org (tipos HairSalon, HealthAndBeautyBusiness, LocalBusiness, Person, Service, OfferCatalog, FAQPage; confira se BarberShop existe como tipo oficial hoje), Google Search Central (dados estruturados de negócio local, avaliações autosservidas, FAQ), diretrizes de llms.txt.

Tarefa: deixar o site legível e citável por Google e IAs.
Escopo: src/components/seo/**, src/pages/robots.txt.ts, sitemap, public/llms.txt (gerado), scripts/audit-seo.mjs.

Passos:
1. JSON-LD por página, gerado da config: negócio (tipo escolhido pela pesquisa) com name canônico, alternateName (variações vistas), address completo, geo, telephone, url, sameAs (Instagram, ficha do Google quando houver URL), openingHoursSpecification, priceRange só se confirmado, hasOfferCatalog com os serviços, founder/employee Person "Pedro Tensini" com knowsAbout (degradê, barba, barbaterapia, visagismo só se confirmado). SEM AggregateRating e sem Review (autosservido). FAQPage na página de perguntas. BreadcrumbList.
2. Metas, canonical, Open Graph (imagem 1200×630 gerada no build: monograma + still + nome + "Centro de Lages"), lang pt-BR, hreflang não.
3. NAP idêntico em todas as páginas (texto visível = JSON-LD = config). audit-seo falha se divergir.
4. llms.txt: quem é, serviços, endereço, horário, como agendar (WhatsApp), links das páginas. Gerado da config.
5. Conteúdo citável: cada página com o parágrafo-resposta no topo (sessão 5); títulos em pergunta onde fizer sentido.
6. noindex enquanto indexar=false; sitemap e robots corretos quando virar true.
7. docs/SEO_GEO.md: checklist fora do site para o João (Perfil da Empresa no Google com nome canônico, endereço com número e "Galeria Augusta", categoria Barbearia, horário, fotos, link do site e de agendamento; Bing Places; Apple Business Connect; Waze; bio do Instagram com o link /agendar; WhatsApp Business com endereço e horário iguais; pedido de avaliação a todo cliente atendido, sem incentivo; teste mensal nas IAs com as perguntas "melhor barbearia no centro de Lages", "barbeiro que faz degradê em Lages", "barbearia aberta sábado Lages" — registrar respostas sem personalização).

Critério de aceite: Rich Results Test e validator.schema.org sem erro (capturas); audit-seo verde; commit "seo e geo".
````

---

## PROMPT 9 — QA, conferência final e deploy

````text
Leia CLAUDE.md e docs/PENDENCIAS.md.

Tarefa: auditoria completa, conferência de normas (a única passada) e deploy.
Escopo: correções pontuais, docs/QA.md, docs/CONFERENCIA_FINAL.md, configuração de deploy.

1. Desempenho: Lighthouse mobile em todas as rotas (≥ 95/100); pesos de JS, CSS, fontes, vídeos; LCP com e sem a entrada; vídeos não baixam em Save-Data.
2. Acessibilidade: axe em todas as rotas; teclado do começo ao fim (entrada → pular → montador → WhatsApp); leitor de tela no montador e no status; contraste; reduced-motion; zoom 200%; pausar vídeo.
3. Navegadores: Chrome, Safari iOS (WebKit do Playwright), Firefox; Android 390 px. O link wa.me abre o app no celular e o WhatsApp Web no desktop.
4. Conferência de normas (uma passada): CDC (preços claros quando exibidos; sem promessa de resultado); termos vetados; LGPD (consentimento real, privacidade); direito de imagem (todo rosto de cliente na lista de autorizados do João; nenhum nome de cliente; trecho da agenda removido); música (nenhum vídeo com som de trilha comercial); Google (sem avaliação incentivada, sem AggregateRating); marcas de terceiros (pomadas) sem sugerir patrocínio; CNPJ no rodapé.
5. Travas: rode a build de produção e liste o que ainda trava (endereço, nome canônico…). NÃO afrouxe nenhuma trava.
6. Deploy: configure a hospedagem estática indicada pelo João (Vercel por padrão), SITE_URL por env, cabeçalhos de segurança (CSP por hash, HSTS, Referrer-Policy, Permissions-Policy), cache longo para /media com hash. Preview com noindex.
7. docs/QA.md com números e capturas; docs/CONFERENCIA_FINAL.md com o que foi conferido e o que depende do João.

Critério de aceite: todos os números no relatório; nenhuma trava afrouxada; commit "qa e deploy".
````

---

## PROMPT L — Nova mídia (reutilizável)

````text
Leia CLAUDE.md e docs/MIDIA_CATALOGO.md.

Tarefa: incorporar a mídia nova que está em media-novas/ (ou na lista abaixo) sem quebrar nada.
[Lista: arquivo · o que é · onde deve entrar · post/legenda se houver · pode ter som? · tem cliente no quadro?]

Passos:
1. Inventário (ffprobe/sharp), folha de contato, avaliação de qualidade (nitidez, luz, texto queimado, música).
2. git mv para media-originais/; registros no manifesto (mesmos campos; audioLiberado só se eu disser).
3. Trechos, pôsteres, loops e derivados (mesma régua da sessão 1).
4. Encaixe pelo tipo:
   - caminho-ate-a-cadeira / fachada / porta → passos de /como-chegar (e a seção 3 da home);
   - retrato do Pedro → troca o provisório (home 1, /sobre, Open Graph);
   - antes-e-depois em câmera fixa → ativa o comparador Antes × Depois (componente <Comparador> com range acessível; só monta se o par existir);
   - novos cortes → galeria de resultados e página do serviço correspondente;
   - fotos originais da barbaterapia sem texto → substituem os recortes provisórios;
   - apresentação do Pedro falando → /sobre e transcrição em texto na página (GEO).
5. Remova selos PROVISÓRIO que deixaram de valer; atualize PENDENCIAS.
6. Capturas antes/depois das páginas afetadas.

Critério de aceite: build verde; LCP não piora; nenhum vídeo com som não liberado; commit "midia: <resumo>".
````

---

## PROMPT D — Novo dado (reutilizável)

````text
Leia CLAUDE.md e src/config.

Tarefa: atualizar dados confirmados pelo João, só na config, e propagar.
[Dados: ex.: número 405 confirmado; sala 12, 1º andar; nome canônico "Tensini Barbieri"; preços: corte R$ X (40 min)…; intervalo de almoço; feriado 25/12 fechado; link de avaliação; app de agenda e link; domínio; estacionamento; formas de pagamento]

Passos: trocar opcional()/bloqueante() por confirmado(valor, "João, <data>"); rodar validate-config, testes de horário e WhatsApp, audit-seo (NAP) e build; capturas das páginas afetadas; atualizar PENDENCIAS e, se o dado for de NAP, o checklist de docs/SEO_GEO.md.
Critério de aceite: testes verdes; nenhum texto com o valor antigo (busca no dist/); commit "dados: <resumo>".
````

---

## C. O que falta (não trava o início; trava a produção onde indicado)

**Trava a produção**
1. Número do endereço: **405 ou 205?** (posts dizem 205) + andar/sala na Galeria Augusta.
2. Nome canônico: "Tensini Barbieri" (como no logo)? Tem de bater com a placa e o Google.

**Importante antes da sessão 5**
3. Serviços com preço e duração (e combos).
4. Fecha para almoço? Feriados?
5. Formas de pagamento; estacionamento perto.
6. Formação que o Pedro quer mostrar (e se pode usar a foto do certificado).
7. Nome do app de agenda e se tem link público.
8. Confirmar que vende pomada (para a página /pomadas ter ou não "à venda aqui").

**Mídia (entra depois pelo Prompt L)**
9. Originais das fotos da barbaterapia **sem texto** (fotógrafo/agência).
10. Arquivo original do logo (vetor), se existir. Se não, fica o SVG que eu fiz.
11. Retrato do Pedro; fachada da galeria; porta; vídeo "da calçada à cadeira"; antes e depois em câmera fixa; Pedro se apresentando.
12. Confirmar: os vídeos com fala (pomada, final do bastidores) têm música comercial por baixo?

**Fora do site (eu passo o passo a passo na sessão 8)**
13. Acesso ao Perfil da Empresa no Google + link de avaliação.
14. Domínio.
