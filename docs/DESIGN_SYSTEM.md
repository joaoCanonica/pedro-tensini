# Design system — "O Degradê"

Sessão 3 · 24/10/2026. Página viva: `/_estilo/` (noindex). O conteúdo está em `src/pages/_estilo.astro` e a rota em `src/pages/[interna].astro`, porque o Astro não roteia arquivos que começam com `_`.
Capturas em `docs/capturas/design/` (JPG): `/_estilo` em 390 e 1440 px, claro e escuro, com e sem movimento reduzido; provas tipográficas; limpeza do monograma.

## 1. Cores (calibradas)

Amostragem por mediana de pixels: capas nos quadros `quadro-parede-verde`, `retrato-provisorio-2` e `quadro-pedro-concentrado`; fundo e dourado do logo raster (`Pedro-tensini-logo.JPG`, só referência); parede verde.

| Token | Antes | Agora | Medido | Decisão |
|---|---|---|---|---|
| Carvão | #121316 | #121316 | — | Mantido. Escuro principal. |
| Navy capa | #15233F | **#1A2146** | capa na sombra #21203E, capa iluminada #424886, fundo do logo #0B1A41 | As capas puxam para o azul-violeta (matiz ≈ 235–242°). O novo navy fica no matiz das capas (≈ 231°), escuro o bastante para superfície. |
| Latão | #B89252 | #B89252 | meio-tom do monograma #A78142 (matiz 37°) | Mesmo matiz do meio-tom; é o chapado sem o brilho 3D. Mantido. |
| Giz | #F1F0EC | **#EEF0EF** | — | O anterior era levemente quente (areia). O novo é frio (azul ≥ vermelho). |
| Aço | #8C9098 | #8C9098 | — | Texto secundário no escuro. |
| Musgo | #2E3D2A | **#2C3E30** | parede verde #58745C (matiz ≈ 128°) | Ajustado ao matiz da parede. Raríssimo. |
| Aço escuro | — | #565B64 | — | Texto secundário no claro (o aço não passa AA sobre giz). |
| Latão escuro | — | #7A5B26 | — | Números da escala e "hoje" no claro (o latão sobre giz dá 2,6:1). |
| Latão claro | — | #D2B073 | — | Anel de foco no escuro; acento de texto sobre navy. |

Superfícies (`data-superficie`): `base` e `contraste` trocam com o tema (alternância carvão / giz) e `navy` é fixa. Escuro é o padrão; o tema claro entra com `data-theme="claro"`.

**Contraste:** `pnpm audit-contraste` passou com **30 pares em AA**. Os pares são texto, texto secundário, acento de texto, botão primário, botão secundário (texto e borda), foco e pontos do status, nas 3 superfícies, mais a faixa de preview e o monograma sobre carvão e navy. O script também falha se `tokens.css` e `src/config/tema.ts` divergirem. Menor valor: 5,39:1 (latão sobre navy, gráfico).

## 2. Tipografia: A (Libre Caslon Display + Schibsted Grotesk)

Três provas lado a lado (hero, tabela de horário, citação): `docs/capturas/design/provas-tipograficas-*.jpg`.

**Escolhida: A.** Por quê, olhando as provas:
- **Hero:** a Caslon Display tem contraste alto e serifa fina. Ela conversa com o TB do monograma, que também tem serifa e contraste. O "Tensini Barbieri" cabe numa linha a 1440 px com ar de editorial. A DM Serif Display é pesada e fecha a página: "Tensini / Barbieri" vira bloco de cartaz, e é a serifa de display mais repetida em sites gerados ("cara de IA").
- **Tabela de horário:** a Schibsted tem `tnum` real (o 8h30 alinha), desenho próprio e mais personalidade que a Inter Tight, que é neutra demais e se confunde com interface genérica.
- **Citação:** em corpo grande, a Caslon fica leve e cabe em duas linhas. A DM em negrito grita e quebra em três.

**Cuidados com a escolha:**
- A Caslon Display tem fios finos: não usar abaixo de cerca de 28 px. Do h3 para baixo é sempre Schibsted.
- Nenhuma das 4 fontes tem versalete real (`smcp`). Os "versaletes espaçados" são caixa alta reduzida com 0,22 em de espaçamento, como o "BARBIERI" do logo, em vez de versalete sintetizado pelo navegador.

**Carregamento:** Fonts API do Astro 7 (`fonts` no `astro.config.mjs`, estável desde o Astro 6) com `fontProviders.local()`.
- **Arquivos:** ficam em `src/styles/fonts/`, todos OFL com a licença junto; o build não depende de rede.
- **Subset e exibição:** só o subset latino (cobre ã, ç, º, ½ e –), com `font-display: swap`.
- **Fallbacks:** o Astro gera os fallbacks com métricas ajustadas, para não haver salto de layout.
- **Preload:** só da fonte do H1, a Caslon com 24 KB. A Schibsted (47 KB, variável 400–900) carrega sem preload. As alternativas DM e Inter só carregam na `/_estilo`.

**Escala fluida** (`clamp`):

| Nível | Tamanho |
|---|---|
| Display | 60 → 184 px |
| h1 | 40 → 92 px |
| h2 | 30 → 52 px |
| h3 | 22 → 30 px |
| Texto | **17 → 18 px**, entrelinha 1,55 |
| Rótulo | 12 px, com espaçamento |

## 3. Monograma

`<Monograma>` (currentColor, `role="img"` + `aria-label` + `<title>`; com `titulo=""` vira decorativo) e `<Assinatura>`: monograma + TENSINI em caixa alta espaçada, régua fina com losango central (eco do logo) e BARBIERI. O nome vem da config (`nomeCanonico`, ainda provisório).

**Limpeza** em `src/components/marca/tensini-monograma-tb.limpo.svg`, com o original intacto em `media-originais/` e o registro no manifesto. Os 2 entalhes do bevel ficavam na borda superior da barra horizontal, um de cada lado da haste do T:
1. Bico em (205,9; 230,2): os nós `L205.9,230.2 L208.0,232.5` foram trocados por uma curva única até (226,3; 235,4). O gancho do canto inferior do I, que apontava para o bico, foi alisado.
2. Degrau em (317; 235,8): os nós `L317.0,235.8` e as duas curvas foram trocados por uma curva quase reta. O início do subcaminho seguinte desceu 0,7 unidade para não deixar quina.

Antes e depois: `docs/capturas/design/monograma-limpeza-antes-depois.jpg` e a seção "Monograma" da `/_estilo`.

## 4. Assinatura "O Degradê" (componentes)

| Uso | Componente | Como |
|---|---|---|
| (a) Passada | `<Passada desfoque?>` | Linha de latão de 2 px com brilho leve desce pelo bloco e revela por `clip-path`; com `desfoque`, desfocado → nítido. WAAPI, 600 ms, uma vez (IntersectionObserver). A linha anda por `top`, na mesma thread do `clip-path` e na mesma curva, e acompanha a borda exata do recorte (conferido quadro a quadro aos 60, 120 e 200 ms). Sem JS, nada fica escondido (`@media (scripting: enabled)`). |
| (b) Escala de pente | `<EscalaPente valor rotulo regua?>` | Número em latão tabular + rótulo + régua com os 6 pentes ("dentes" curtos e o atual longo). Leitor de tela: "Pente 3 · A barbearia". |
| (c) Borda | `<BordaDegrade de para>` | SVG estático: 12 linhas paralelas da cor de baixo engrossam de 1 px até fechar (curva ^1,6), em 96 px, como o fade na nuca. Acende uma vez: `mask-image` com `--acender` registrado por `@property`, que varre da esquerda para a direita. Sem suporte ou com movimento reduzido: já acesa. |
| (d) Links e foco | `.link`, `.prosa a` | Repouso: linha cheia. Hover/foco: a cheia recolhe para a direita e a hachura a −45° entra pela esquerda. Foco: anel de 2 px com 3 px de recuo (forma, não só cor). |

**Escala de pente: com e sem.** Testada na `/_estilo` (cabeçalhos lado a lado). **Faz falta.**
- **Sem o marcador:** o título fica solto, e numa home longa as seções só se distinguem pela tipografia.
- **Com o marcador:** cada seção ganha uma posição na régua, de 3 (amplo) a 0 (preciso). É navegação editorial: diz onde se está no "degradê" da página e alinha todas as seções no mesmo fio.
- **Peso:** fica pequena o bastante para não competir com o h2.

## 5. Componentes base (`src/components/base/`)

- **`Botao`:** primário "Agendar no WhatsApp" (latão chapado, ícone oficial monocromático do Simple Icons 16.35.0, CC0, sem círculo; link `wa.me` com a mensagem padrão da config). Secundário: borda fina. Cantos de 2 px, nada de pílula, altura mínima de 48 px.
- **`Link`, `Rotulo` e `Citacao`:** a citação traz a voz do Pedro literal com a fonte obrigatória, aspa pendurada em latão e no máximo 15 caracteres de largura (`15ch`) no corpo da citação.
- **`TabelaHorario`:** peça gráfica com dias em caixa alta espaçada e horas tabulares grandes. "Hoje" aparece com a linha de latão e a palavra "hoje" (`aria-current="date"`), nunca só por cor. A tabela completa já vem no HTML estático e as exceções da config entram no `tfoot`.
- **`StatusAoVivo`:** ponto + texto do `statusEm()`. O texto carrega o significado e o ponto muda de forma (cheio = aberto, anel = fechado). Sem JS, mostra o resumo da semana. Atualiza a cada 30 s, sem `aria-live` para não falar a cada minuto.
- **`MolduraVideo`:** vertical 9:16 com moldura "espelho" (fio quente luminoso + halo), eco do espelho iluminado da barbearia.
  - **Loop:** mudo, sem controles e com `aria-hidden`; com movimento reduzido não toca.
  - **Conteúdo:** com controles, `preload="none"` e descrição.
  - **Pôster:** é um `<picture>` com AVIF e LQIP sob o vídeo. Ele é o candidato a LCP, nunca o vídeo.
- **`Poster`:** AVIF/WebP com `srcset`, LQIP de fundo e `width`/`height`. Com `prioridade`, carrega `eager` com `fetchpriority="high"`; os demais são `lazy`.
- **`Cabeca`:** meta, `robots` da config, fontes e CSS base.

## 6. Movimento

160 / 320 / 600 ms e uma curva assinatura, `cubic-bezier(0.7, 0, 0.18, 1)`: arranca firme e assenta preciso, como a passada da máquina.
- **Movimento reduzido:** nada se move e ficam os estados finais (conferido nas capturas `-reduzido`).
- **Melhoria progressiva:** View Transitions entre páginas com `@view-transition { navigation: auto }` só sem movimento reduzido. Nada usa o progresso do scroll; as revelações são por evento.

## 7. Números medidos

| Medida | Valor |
|---|---|
| JS da `/_estilo` | **2,87 KB gzip** no total: `revelar` 571 B, `vivo` 1.534 B, 4 cascas do Astro com 194 B e scripts inline da própria página (seletor de tema) com 573 B. Os componentes da sessão somam cerca de 2,3 KB. |
| CSS | 16,6 KB sem gzip (inclui as provas da página). |
| Fontes | Caslon 24 KB (com preload) e Schibsted 47 KB. Na `/_estilo`, mais DM 25 KB e Inter Tight 45 KB. |
| Contraste | 30 de 30 pares em AA. |

## 8. Pesquisa (antes de construir)

- **Astro, fontes:** a referência local do Astro 7.4 (`node_modules/astro/dist/types/public/config.d.ts`) diz que `fonts` está estável desde o 6.0, com `fontProviders.local()`, `display` padrão `swap`, `subsets` padrão `latin`, fallbacks otimizados por métrica e `<Font cssVariable preload />`. O site `docs.astro.build` não abria por fetch neste ambiente; a busca apontou o mesmo guia de fontes.
- **LCP de vídeo:** o pôster é o candidato a LCP. Preload do pôster com `fetchpriority="high"` encurta o LCP (demo do Chrome: 1,7 s → 1,2 s), enquanto preload do arquivo de vídeo não ajuda (DebugBear). Fontes: [chrome.dev, Learn Performance: vídeo](https://chrome.dev/f/learn_performance_video/7/) e [DebugBear: optimize video LCP](https://debugbear.com/blog/optimize-video-lcp).
- **`mask-image`:** Baseline 2023, já sem prefixo nos navegadores atuais ([caniuse](https://caniuse.com/mdn-css_properties_mask-image)).
- **Scroll-driven animations:** sem suporte pleno no Firefox ([browser-compat-data](https://github.com/mdn/browser-compat-data/blob/main/css/properties/scroll-timeline.json)), então só sob `@supports`. Nesta sessão não foi usada.
- **View Transitions entre documentos:** Chrome e Edge 126+ e Safari 18.2+; o Firefox ainda não tem. A saída com movimento reduzido é `navigation: none` dentro da media query ([W3C CSSWG](https://lists.w3.org/Archives/Public/public-css-archive/2023Nov/0526.html), [Shopify dev](https://shopify.dev/docs/storefronts/themes/best-practices/performance/cancel-view-transitions-on-interaction.md)).
- **`@property`:** registrar `--acender` como `<percentage>` permite transicionar o gradiente da máscara. Sem suporte, a borda simplesmente aparece acesa.
