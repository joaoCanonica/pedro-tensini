# Entrada "A Passada" e hero da home

Sessão 4 · 24/10/2026. Arquivos: `src/components/entrada/`, `src/components/hero/`, `src/pages/index.astro`.

## Como funciona

- **Decisão (antes do 1º quadro).** Um script inline no início do `<body>` (`EntradaInicio.astro`) decide se a entrada roda:
  - roda na 1ª visita da sessão, sem movimento reduzido e sem âncora na URL;
  - `sessionStorage` fica em `try/catch`; se falhar, não roda;
  - `?entrada=1` força e `?entrada=0` desliga.
  - Só então ele cria a camada carvão e o botão **Pular**. Sem JS, nada disso existe e o hero aparece no estado final.
- **Linha do tempo (`entrada.ts`, WAAPI, 2,4 s):**

  | Tempo | O que acontece |
  |---|---|
  | 0–0,25 s | Carvão; o TB está lá, desfocado e escuro (16%). |
  | 0,25–1,0 s | A linha de latão desce até a base do monograma. Atrás dela o TB fica nítido e latão (clip-path + blur→0). "TENSINI" aparece letra a letra, com o espaçamento fechando por transform (sem bounce). |
  | 1,0–1,7 s | A linha desce pela tela. Atrás dela o pôster passa de desfocado e escuro para nítido. São duas cópias do mesmo arquivo, no retângulo exato do pôster da página: a de cima recortada pela linha. |
  | 1,7–2,4 s | O TB voa para o cabeçalho (FLIP com WAAPI). O carvão da camada se abre, a cópia nítida dissolve sobre o pôster idêntico e entram rótulo, H1, nome, status/endereço, botão e tabela, com 80 ms entre cada um. |
  | 2,4 s | A camada sai e o vídeo começa a tocar quando estiver pronto. Ele entra por cima do pôster, sem salto, porque o laço começa no quadro do pôster. |

- **Pular.** Qualquer toque, clique, tecla, rolagem ou redimensionamento leva ao estado final. Por teclado, o foco vai para o link do monograma no cabeçalho.
- **View Transition não foi usada no voo do TB.** Uma transição de mesma página tiraria snapshot da página inteira no meio da entrada e congelaria as outras animações. O FLIP com WAAPI funciona em todos os navegadores. As transições entre páginas (`@view-transition`, sessão 3) continuam valendo.

## Hero

- **Mobile:** vídeo vertical em tela cheia com véu escuro só embaixo. A ordem do texto é rótulo, H1, nome, status, endereço (link), botão largo e link de horários. O texto usa os papéis da superfície carvão em qualquer tema.
- **Desktop:** coluna de texto à esquerda com H1 grande em Caslon, e o vídeo inteiro (9:16, sem corte horizontal) na moldura "espelho" à direita. A tabela compacta fica na base da coluna, com hoje marcado.
- **Vídeo:**
  - `muted`, `playsinline`, `loop` e `preload="none"`;
  - só carrega depois de o pôster pintar e de a entrada acabar;
  - nunca carrega com Save-Data nem em 2g;
  - não toca com movimento reduzido;
  - o botão Pausar/Tocar está sempre visível (WCAG 2.2.2) e a escolha fica salva na sessão.
- **LCP:** é o pôster (`<picture>` AVIF, `fetchpriority="high"`, mais preload no `<head>` com o mesmo `sizes`). Ele está pintado desde o início, debaixo da camada da entrada.

## Números medidos

Lighthouse 13.5, mobile, 4G simulado, 3 execuções cada.

| | LCP | FCP | CLS | TBT | Performance |
|---|---|---|---|---|---|
| Com entrada (`?entrada=1`) | 1.654–1.657 ms | 1,4 s | 0,020 | 0 ms | 99 |
| Sem entrada (`?entrada=0`) | 1.651–1.654 ms | 1,4 s | 0,000–0,021 | 0 ms | 99 |

- **LCP:** o elemento de LCP é o pôster nos dois casos; a entrada não piora o LCP.
- **CLS:** a 1ª versão animava `top` da linha e `letter-spacing` do nome e chegava a CLS 0,123. Trocadas por `transform`, o CLS ficou igual ao da página sem entrada. O 0,02 restante vem da troca de fonte do H1, com ou sem entrada.
- **JS da home:** 4,57 KB gzip no total. Isso inclui entrada e vídeo (embutidos inline pelo Astro), o horário ao vivo (1,5 KB) e as cascas.

## Capturas

`docs/capturas/entrada/`: quadros de 0, 0,5, 1,0, 1,5, 2,0 e 2,4 s em 390 e 1440 px, mais um GIF por largura. Para refazer: `pnpm build && pnpm capturar:entrada`. O script para o relógio e posiciona a linha do tempo, para os quadros serem exatos.

## Testes de comportamento (Playwright, todos ok)

- **Pular:** visível no 1º quadro; Tab pula e leva o foco ao cabeçalho; Enter no botão Pular pula; clique e rolagem pulam.
- **Visitas seguintes e reduções:** visita seguinte na mesma sessão vem sem entrada; com movimento reduzido não há camada nem animação, o vídeo não toca e o botão oferece "Tocar vídeo"; sem JS não há camada e o H1 fica visível.
- **Vídeo:** com Save-Data, nenhum pedido de vídeo. Em uso normal o pôster é pedido aos 33 ms e o vídeo só depois da entrada (cerca de 2,5 s). Pausar funciona por clique e por teclado em 390 e 1440 px.
