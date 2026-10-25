# QA — Tensini Barbieri

25/10/2026 · build de prévia (noindex) · Chromium 153 (Playwright 1.64) · Lighthouse 13.5 mobile (4G lento simulado, Moto G Power).

Como repetir: `pnpm build && pnpm qa` (bateria de navegador, gera `docs/qa/qa.json` e as capturas), `pnpm test:e2e` (funil), `pnpm test` (config), `pnpm check` (tipos, ESLint, Prettier, textos), Lighthouse com `npx lighthouse <url> --form-factor=mobile`.

## 1. Desempenho

Meta do projeto: Lighthouse mobile ≥ 95 (Desempenho, Boas práticas, SEO) e 100 (Acessibilidade); LCP < 2,0 s; CLS ≈ 0; JS ≤ 35 KB gzip.

| Rota                   | Desemp. | Acess. | BP  | SEO\* | LCP (s) | CLS   | TBT | JS (KB) | Fontes (KB) | HTML (KB) | Imagens (KB) | Vídeo (KB) | Total (KB) |
| ---------------------- | ------- | ------ | --- | ----- | ------- | ----- | --- | ------- | ----------- | --------- | ------------ | ---------- | ---------- |
| / (com a entrada)      | 99      | 100    | 100 | 100   | 1,88    | 0     | 0   | 9,9     | 48,4        | 33,3      | 129,7        | 566,6      | 790,2      |
| / (sem a entrada)      | 99      | 100    | 100 | 100   | 2,03    | 0,001 | 0   | 9,9     | 48,4        | 33,3      | 129,7        | 566,6      | 790,2      |
| /agendar/              | 100     | 100    | 100 | 100   | 1,35    | 0     | 0   | 8,3     | 48,4        | 12,3      | 0            | 0          | 71,3       |
| /como-chegar/          | 100     | 100    | 100 | 100   | 1,73    | 0     | 0   | 8,1     | 48,4        | 15,8      | 38,1         | 0          | 112,7      |
| /servicos-e-precos/    | 99      | 100    | 100 | 100   | 1,96    | 0     | 0   | 9,6     | 48,4        | 19,9      | 53,1         | 0          | 133,2      |
| /degrade-em-lages/     | 98      | 100    | 100 | 100   | 2,10    | 0     | 0   | 9,6     | 48,4        | 24,3      | 66,7         | 434,1      | 585,4      |
| /barba-e-barbaterapia/ | 99      | 100    | 100 | 100   | 1,88    | 0     | 0   | 9,6     | 48,4        | 22,9      | 119,5        | 0          | 202,6      |
| /sobrancelha/          | 99      | 100    | 100 | 100   | 1,95    | 0     | 0   | 9,6     | 48,4        | 19,7      | 48,0         | 0          | 128,0      |
| /pomadas/              | 99      | 100    | 100 | 100   | 2,03    | 0     | 0   | 9,6     | 48,4        | 21,6      | 60,7         | 0          | 142,6      |
| /sobre-pedro-tensini/  | 99      | 100    | 100 | 100   | 2,03    | 0     | 0   | 3,4     | 48,4        | 16,6      | 100,8        | 0          | 171,6      |
| /perguntas-frequentes/ | 100     | 100    | 100 | 100   | 1,22    | 0,003 | 0   | 2,2     | 48,4        | 13,7      | 0            | 0          | 66,6       |
| /avaliar/              | 100     | 100    | 100 | 100   | 1,23    | 0     | 0   | 2,2     | 48,4        | 13,3      | 0            | 0          | 66,1       |
| /privacidade/          | 100     | 100    | 100 | 100   | 1,23    | 0     | 0   | 2,2     | 48,4        | 12,4      | 0            | 0          | 65,2       |
| /404.html              | 100     | 100    | 100 | 100   | 1,22    | 0     | 0   | 2,2     | 48,4        | 10,3      | 0            | 0          | 63,2       |

\* SEO medido sem a auditoria "is-crawlable", que reprova só pelo noindex proposital da prévia. Pesos = bytes transferidos (gzip/brotli quando aplicável) no carregamento medido pelo Lighthouse. Dados brutos: `docs/qa/lighthouse.json`.

**Leitura:**

- Todas as rotas passam a meta do Lighthouse (≥ 98 em Desempenho, 100 nas outras três).
- LCP < 2,0 s em 10 das 14 medições; quatro ficam entre 2,03 e 2,10 s (degradê, pomadas, sobre e home sem a entrada). O LCP é sempre o pôster AVIF (nunca o vídeo). Nas sessões anteriores as mesmas páginas variaram entre 1,95 e 2,10 s de uma rodada para outra: está no limite, não folgado. Caminho, se o João quiser apertar: pôster da abertura em 480 px no mobile.
- Com e sem a entrada: 1,88 s e 2,03 s. A entrada não atrasa o LCP (o pôster pinta por baixo dela).
- **Corrigido nesta passada:** o vídeo do hero era baixado duas vezes (1.133 KB → 567 KB). O `load()` depois de trocar o `preload` abortava e recomeçava o pedido.

**Pesos fixos:**

- JS por página: 2,2 a 9,9 KB gzip (meta ≤ 35 KB). /agendar: 3,8 KB de módulos + 4,5 KB de inline ≈ 8,3 KB (meta ≤ 10 KB).
- CSS: embutido no HTML (escolha da sessão 6, para o LCP): 38,4 KB (8,0 KB gzip) na home, 17,9 KB (4,5 KB gzip) no /agendar.
- Fontes: 2 arquivos por página, 48,4 KB (Libre Caslon Display 14,4 KB + Schibsted Grotesk 400–700 34,5 KB). As outras quatro só servem a página interna /\_estilo.
- Vídeos (540/720 px, MP4 e WebM): loops 431–853 KB; resultados 0,9–3,7 MB; vídeos de conteúdo 3,9–13,3 MB. Os de conteúdo só baixam no play (`preload="none"`); os loops, só visíveis na tela.

**Save-Data e 2g:** nenhum vídeo baixa (0 pedidos em 5 páginas, rolando até o fim). Conexão normal: 3 vídeos (os loops visíveis).

## 2. Acessibilidade

| Checagem                                     | Resultado                                                                                                                                                                                                                                            |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| axe-core 4.14 (WCAG 2.0/2.1/2.2 A e AA + boas práticas) | **0 violações** em 26 varreduras (13 rotas × tema claro e escuro). Antes das correções: `region` (aviso de prévia fora de landmark), `target-size` (links do rodapé legal), `scrollable-region-focusable` (os cinco tempos e a tabela de pomadas). |
| Contraste (`audit-contraste`)                | AA em todos os pares de token, nas três superfícies e nos dois temas.                                                                                                                                                                                 |
| Teclado, do começo ao fim                    | Entrada ativa com "Pular" → 1º Tab encerra a entrada e leva o foco à marca → 21 Tabs até o montador → serviço (Espaço), dia (Setas), período (Espaço) → Tab até "Abrir conversa no WhatsApp" com o link certo. Anel de foco visível (2 px).         |
| Leitor de tela (árvore de acessibilidade)    | Montador: formulário nomeado, 3 grupos (fieldset/legend), caixas e rádios nativos com nome; dia sem atendimento anunciado no próprio rótulo ("Hoje · domingo fechado", desabilitado); resumo falado em região viva ("Sua escolha: Corte, de manhã."); a prévia da mensagem não é relida a cada letra. Status: parágrafo com o texto ao vivo ("Fechado · abre amanhã às 8h30"). |
| Reflow 320 px                                | 0 px de rolagem horizontal e nada cortado nas 13 rotas (corrigido: /avaliar cortava 3 px).                                                                                                                                                            |
| Zoom 200% (1280 → 640 px CSS)                | 0 px de rolagem horizontal nas 13 rotas.                                                                                                                                                                                                             |
| Movimento reduzido                           | Entrada não roda; 0 vídeos tocando; 0 animações longas.                                                                                                                                                                                              |
| Pausar vídeo                                 | Hero: tocava → pausado, rótulo "Tocar vídeo", `aria-pressed="true"`. Loops: todos pausam com um botão.                                                                                                                                              |

Capturas: `docs/qa/teclado-montador-1440.jpg`, `docs/qa/320px-home.jpg`, `docs/qa/320px-agendar.jpg`, `docs/qa/zoom-200-home.jpg`, `docs/qa/zoom-200-agendar.jpg`.

Limite: não houve teste com leitor de tela real (NVDA, VoiceOver, TalkBack). Conferi a árvore de acessibilidade que eles leem. Vale uma rodada humana com VoiceOver no iPhone antes do lançamento.

## 3. Navegadores

| Navegador                          | Situação                                                                                                                                                                                                                          |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chrome desktop (Chromium 153)      | Tudo acima, mais e2e do funil 7/7.                                                                                                                                                                                                 |
| Android 390 px (Pixel 7 emulado)   | 13 rotas: 0 px de rolagem horizontal, 0 erros de JS, nenhum alvo de toque menor que 24 px, todos os links wa.me no formato `https://wa.me/5549999037620?text=…`. Captura: `docs/qa/android-pixel7-home.jpg`.                       |
| Safari iOS (WebKit) e Firefox      | **Não testados.** O download do WebKit e do Firefox do Playwright foi bloqueado pela rede deste ambiente. Fica para o João (ou para o CI, onde a rede é livre): `npx playwright install webkit firefox` e rodar `pnpm qa` trocando o navegador. |

**Link wa.me:** o formato é o oficial do WhatsApp para "clique para conversar" (só número + `text`). No celular com WhatsApp instalado o sistema abre o app; no desktop abre o WhatsApp Web (ou o app de desktop, se instalado). Isso depende do sistema, não do site, e não dá para testar em navegador emulado; conferir no celular do João no primeiro deploy.

## 4. Segurança e deploy

- **CSP por hash** em todas as páginas (`scripts/csp.mjs`, no postbuild): `script-src 'self'` mais o SHA-256 de cada script inline (28 no total), sem `unsafe-inline`. Fora: `frame-ancestors 'none'` por cabeçalho. Na bateria: 0 violações nas 13 rotas, e o mapa do Google carrega depois do "Aceitar". Prova de que bloqueia: o próprio teste não conseguiu injetar o axe por `<script>` (teve de usar o protocolo do DevTools).
- **Cabeçalhos** (`vercel.json`): HSTS de 2 anos, Referrer-Policy `strict-origin-when-cross-origin`, Permissions-Policy fechando câmera, microfone, geolocalização, pagamento, USB e Topics, `nosniff`, `X-Frame-Options: DENY`, COOP `same-origin`.
- **Cache:** `/_astro/*` (nomes com hash) e `/media/*?v=<hash>` por 1 ano, `immutable`; as mídias sem `?v` (favicon, mapa) por 1 dia. O `?v=` é o SHA-256 do arquivo, calculado no build: a URL muda quando a mídia muda.
- **Hospedagem:** projeto `pedro-tensini` criado na Vercel (time "Joao Canonica's projects"), sem deploy ainda (ver `docs/CONFERENCIA_FINAL.md`, seção Deploy).

## 5. Outras verificações desta passada

- `pnpm check`: 0 erros (astro check, ESLint, Prettier, textos).
- `pnpm test`: 47/47. `pnpm test:e2e`: 7/7. `audit-seo`: ok. `audit-compliance`: ok.
- Build de produção: **trava** (2 travas, ver `docs/CONFERENCIA_FINAL.md`).
