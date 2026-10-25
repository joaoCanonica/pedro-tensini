# Funil até o WhatsApp

25/10/2026. Tudo o que leva a pessoa do site para a conversa com o Pedro, as mensagens exatas e como ler a medição. Conferido no `dist/` e pelo teste `pnpm test:e2e`.

## Regra

- Todo CTA de WhatsApp sai de `ctaWhatsApp(origem, escolhas)` (`src/lib/whatsapp.ts`): o `href` vem de `linkWhatsApp()` com a mensagem do contexto e o link ganha `data-cta="whatsapp"`, `data-origem` e, se houver, `data-servico`.
- A URL do wa.me leva **só** o número e o texto: `https://wa.me/5549999037620?text=…`. A origem nunca vai na URL; ela só existe no evento de medição.
- Não existe formulário nem "enviar": quem envia é a pessoa, dentro do WhatsApp. O site não guarda nada do que foi escolhido.
- Texto honesto: "Você escolhe e o Pedro confirma o horário no WhatsApp." Nunca "agendado".

## Caminhos e mensagens exatas

Mensagem padrão: `Olá, Pedro! Vim pelo site e quero agendar um horário.`

Com serviço da página: `Olá, Pedro! Vim pelo site e quero agendar: {serviço}.`

| Origem (`data-origem`) | Onde                                                                                                           | Mensagem                                                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `hero`                 | Home, botão do hero                                                                                            | padrão                                                                                                                         |
| `barra`                | Barra fixa (mobile embaixo, desktop no canto) em todas as páginas, menos /agendar e 404                        | padrão; em /degrade-em-lages "degradê", /barba-e-barbaterapia "barbaterapia", /sobrancelha "sobrancelha"                       |
| `servico`              | Botão da abertura das páginas de serviço                                                                       | igual à barra da página (pomadas e serviços e preços: padrão)                                                                  |
| `montador`             | Home (seção 0), páginas de serviço (bloco Agendar), /agendar                                                   | montada pela pessoa (abaixo); sem JS ou sem escolha: padrão, ou o serviço da página                                            |
| `como-chegar`          | /como-chegar, "Antes de vir, marque."                                                                          | padrão                                                                                                                         |
| `perguntas`            | /perguntas-frequentes, "Não achou a sua?"                                                                      | padrão                                                                                                                         |
| `sobre`                | /sobre-pedro-tensini, abertura                                                                                 | padrão                                                                                                                         |
| `agendar`              | /agendar, "Prefere escrever do seu jeito?"                                                                     | padrão                                                                                                                         |
| `404`                  | Página não encontrada                                                                                          | padrão                                                                                                                         |
| `rodape`               | Rodapé de todas as páginas                                                                                     | padrão                                                                                                                         |
| `estilo`               | /\_estilo (interna, noindex)                                                                                   | padrão                                                                                                                         |

### Mensagem do montador

`Olá, Pedro! Vim pelo site e quero agendar: {serviços}. Prefiro {dia}, {período}. Meu nome é {nome}.`

- Serviços em minúscula, unidos por vírgula e "e": `degradê`, `barba e sobrancelha`, `corte, barba e sobrancelha`.
- Dia: `hoje (segunda, 26/10)`, `amanhã (sexta, 30/10)` ou, por data, `sábado, 07/11`.
- Período: `manhã`, `tarde` ou `noite`. Só aparecem os períodos que existem naquele dia; os outros ficam desabilitados com o motivo ("Manhã: já passou.", "Noite: sem atendimento (sábado fecha às 18h).").
- Dia fechado (domingo, exceção da config): aviso ("Domingo fechado. Escolha outro dia." / "Fechado em 25/12: {motivo}. Escolha outro dia.") e a mensagem sai sem dia.
- Nome é opcional; sem nome, a frase final some.
- Sem serviço, mas com dia/período: começa pela mensagem padrão e acrescenta `Prefiro …`.

Exemplos (os mesmos do e2e):

| Cenário                                          | Mensagem                                                                                                       |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Degradê, amanhã, tarde, João (quinta 29/10, 10h) | Olá, Pedro! Vim pelo site e quero agendar: degradê. Prefiro amanhã (sexta, 30/10), tarde. Meu nome é João.     |
| Barba + sobrancelha, hoje, noite (segunda, 17h30) | Olá, Pedro! Vim pelo site e quero agendar: barba e sobrancelha. Prefiro hoje (segunda, 26/10), noite.          |
| Página de degradê, sábado 07/11, manhã           | Olá, Pedro! Vim pelo site e quero agendar: degradê. Prefiro sábado, 07/11, manhã.                              |
| Sem JS (/agendar)                                | Olá, Pedro! Vim pelo site e quero agendar um horário.                                                          |

O leitor de tela ouve o resumo, não a mensagem inteira a cada letra: "Sua escolha: Degradê, amanhã, à tarde."

## Outros caminhos medidos

| Evento               | Onde                                                                                                          | Dados                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `clique_como_chegar` | Botões Google Maps / Waze / Apple Mapas (home seção 0, "Onde e quando" das páginas de serviço, /como-chegar) e o mapa estático | `app`: `google-maps`, `waze`, `apple-mapas`, `mapa-estatico` |
| `clique_ligar`       | Rodapé ("Ligar") e /agendar                                                                                   | (nenhum)                                                 |

## Medição

**Ferramenta: Umami auto-hospedado, na mesma origem do site.** Por quê:

- **Sem cookies e sem identificador**: não precisa de consentimento para contar cliques (LGPD, interesse legítimo, dado agregado). O banner continua existindo só para o que é de terceiros (o mapa do Google).
- **Nenhuma requisição a terceiros**: o site não carrega o script do Umami; o `src/lib/medicao.ts` manda o evento direto para a API (`POST /api/send`) com `fetch` + `keepalive`. Medido: 0 requisições fora do site antes do consentimento, nas 13 páginas.
- **Leve**: banner + medição somam 1,4 KB gzip; o orçamento do /agendar (≤ 10 KB) e da home (≤ 35 KB) continua folgado.
- **GA4 descartado**: põe cookies, transfere dados para fora do país, exige banner bloqueante antes de medir qualquer coisa e pesa dezenas de KB.

**Configuração (no build):**

- `PUBLIC_MEDICAO_URL`: endpoint do Umami. De preferência na mesma origem (`/api/send`, por proxy ou rewrite na hospedagem).
- `PUBLIC_MEDICAO_SITE`: id do site no Umami.
- Sem as duas variáveis, nada sai do navegador: o evento só é disparado na página (`CustomEvent("tensini:medicao")`), o que o e2e usa para conferir.
- Se o endpoint estiver em **outro domínio**, o envio só acontece depois do "Aceitar" no banner.

**O que vai em cada evento:** nome do evento, `origem` e `servico` (WhatsApp) ou `app` (rotas), caminho da página, título, idioma do navegador e hostname. Nunca nome, telefone ou o texto da mensagem.

## Como ler os eventos (Umami)

1. **Eventos → clique_whatsapp**, quebrando por `origem`: mostra qual CTA puxa mais conversa (hero, barra, montador, serviço…). Montador alto = as pessoas querem escolher dia e período; barra alta = a barra fixa está fazendo o trabalho.
2. **clique_whatsapp por `servico`**: o que as pessoas querem agendar (degradê, barbaterapia…). Vazio = clicou sem escolher serviço.
3. **clique_whatsapp por página** (URL): qual página converte. Compare com as visitas de cada página, se a contagem de visitas for ligada.
4. **clique_como_chegar por `app`**: quantas rotas foram abertas e em qual app. Pico de "mapa-estatico" pode indicar que a imagem do mapa precisa ficar mais clara.
5. **clique_ligar**: quantas pessoas preferem ligar.

Cuidados:

- **Clique não é agendamento.** O evento conta quem abriu o WhatsApp; se a pessoa enviou e se o Pedro confirmou, só o WhatsApp sabe. Para fechar a conta, o Pedro pode anotar por semana quantas conversas começaram com "Vim pelo site".
- O preview (noindex) não deve ter as variáveis de medição, para não misturar teste com dado real.

## Consentimento

- Banner em todas as páginas, na primeira visita: **Aceitar** e **Recusar** com o mesmo peso (mesma forma, cor e tamanho; conferido no e2e).
- Sem escolha ou com "Recusar": nada de terceiros. O toque em "Carregar mapa interativo" reabre o aviso; o mapa só entra depois de "Aceitar".
- A escolha fica no `localStorage` (não é cookie) e muda em "Preferências de privacidade", no rodapé.
- Sem JS: o banner não aparece e nada de terceiros carrega.

## Como testar

`pnpm build && pnpm test:e2e` (Playwright, 390 px, relógio fixo em America/Sao_Paulo):

- os 4 cenários do montador geram o link exato (inclusive só com teclado);
- todo link wa.me da página de degradê tem `data-origem` e a URL só tem `text`;
- os eventos `clique_whatsapp`, `clique_como_chegar` e `clique_ligar` saem com os dados certos;
- nenhuma requisição a terceiros antes do consentimento, nas 13 páginas, rolando até o fim. A prova fica em `docs/capturas/funil/`: o HAR (`rede-antes-do-consentimento.har`), a lista em JSON e a captura da lista de requisições;
- o mapa do Google só depois de "Aceitar", e a preferência reabre pelo rodapé.
