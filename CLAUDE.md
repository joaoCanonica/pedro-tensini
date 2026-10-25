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
