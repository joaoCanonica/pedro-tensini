# Conferência final de normas e deploy

25/10/2026. A única passada de normas do projeto (CDC, termos vetados, LGPD, direito de imagem, música, Google, marcas de terceiros, CNPJ), mais as travas de produção e o deploy. ✅ conferido e ok · ⚠️ conferido, com decisão ou ação do João · ⛔ trava.

Nenhuma trava e nenhuma lista foi afrouxada nesta sessão.

## 1. CDC (Código de Defesa do Consumidor)

- ✅ **Preços:** nenhum preço é exibido. A config não tem preço confirmado, e o site mostra "Valores pelo WhatsApp" / "Consulte". A build de produção trava se aparecer "R$" sem fonte (`audit-compliance`, trava `preco-sem-fonte`). Quando houver tabela, ela entra com valor claro por serviço (tabela já pronta em /servicos-e-precos).
- ✅ **Sem promessa de resultado:** varri todos os textos atrás de "garantido", "perfeito", "100%", "sempre" e equivalentes. Ajuste feito: no FAQ, "Sem surpresa na hora de pagar" virou "Assim você sabe o valor antes do horário". "Sem marca" (degradê) descreve a técnica (transição sem linha visível), não promete resultado: mantido.
- ✅ **Agendamento honesto:** nenhum "agendado" ou "horário garantido"; o texto é sempre "Você escolhe e o Pedro confirma o horário no WhatsApp".

## 2. Termos vetados

- ✅ `src/config/termos.ts` intacto. `audit-compliance` sobre o HTML gerado e sobre os textos-fonte: 0 ocorrências. Produção: trava "termo vetado" ok.

## 3. LGPD

- ✅ **Consentimento real:** banner com Aceitar e Recusar de mesmo peso (mesma forma, cor e tamanho, conferido no e2e); sem escolha, nada de terceiros carrega. Prova: 0 requisições fora do site antes do consentimento, nas 13 páginas (`docs/capturas/funil/`).
- ✅ **Mapa do Google** só depois do "Aceitar"; preferência alterável no rodapé ("Preferências de privacidade").
- ✅ **Sem formulário, sem cadastro, sem cookie.** O montador não guarda nada; o WhatsApp é conversa direta (nada é enviado até a pessoa tocar em enviar no app). A escolha do banner fica no `localStorage` do próprio navegador.
- ✅ **Medição:** desligada (nada é enviado). Quando ligar, é Umami na mesma origem, sem cookie e sem identificador (`docs/FUNIL.md`).
- ✅ **Política de privacidade** em linguagem simples, coerente com o que o site faz (conferido contra o código: consentimento, mapa, vídeos próprios, nenhum player de terceiros, medição).
- ⚠️ **Pendente na política** (selo PROVISÓRIO no preview): hospedagem e prazo de guarda dos registros técnicos (Vercel), data de publicação. Ao publicar na Vercel: citar a Vercel como hospedagem e os registros de acesso dela.
- ⚠️ **Nomes nas avaliações:** a home mostra duas avaliações do Google com o nome dos autores ("Vinicius Farias", "Diogo Amaral"), como pedido na sessão 6. São dados públicos no Google, mas são nomes de clientes, e o projeto diz "nenhum nome de cliente aparece". **Decisão do João:** pedir autorização aos dois, ou trocar por iniciais ("Vinicius F."), ou tirar o nome. Não alterei porque contraria uma instrução explícita anterior.

## 4. Direito de imagem

- ✅ **Nenhum nome de cliente** em legendas, alt, descrições ou nos vídeos publicados (fora as duas avaliações acima).
- ✅ **Trecho da agenda removido:** o app de agenda (7,0–8,8 s do original, com possíveis nomes de clientes) foi cortado do `bastidores-site`. Conferi os quadros em volta do corte no arquivo publicado: não aparece tela de agenda.
- ⚠️ **Lista de autorizados:** não existe uma lista nominal; existe a autorização geral do João ("o que o João mandou está autorizado", CLAUDE.md). Para fechar, o João confirma cada mídia publicada que mostra cliente:

| Mídia publicada              | Onde aparece                             | Cliente visível                    | Autorizado? |
| ---------------------------- | ---------------------------------------- | ---------------------------------- | ----------- |
| `loop-hero`                  | Home, hero                               | barba e parte do rosto, em close   | [ ]         |
| `experiencia-completa`       | Home (diálogo), /barba-e-barbaterapia    | rosto, sorrindo no fim             | [ ]         |
| `resultado-1`                | Home, /degrade-em-lages                  | cabeça de perfil e nuca            | [ ]         |
| `resultado-2`                | Home, /degrade-em-lages                  | rosto de perfil e de frente        | [ ]         |
| `bastidores-site`            | /sobre-pedro-tensini                     | clientes na cadeira, rosto         | [ ]         |
| `trajetoria`                 | /sobre-pedro-tensini                     | cliente, rosto (vídeo antigo)      | [ ]         |
| `quadro-sobrancelha-navalha` | /sobrancelha                             | rosto do cliente (do `trajetoria`) | [ ]         |
| `retrato-provisorio-1`       | Home seção 1, /sobre                     | cliente de perfil, com barba       | [ ]         |
| `foto-toalha-quente`         | Home seção 1½, /barba-e-barbaterapia     | rosto parcialmente coberto         | [ ]         |
| `foto-esfoliacao`            | idem                                     | rosto, olhos fechados              | [ ]         |
| `foto-navalha`               | idem                                     | barba em close                     | [ ]         |
| `foto-barba-finalizada`      | idem                                     | perfil                             | [ ]         |
| `quadro-maquina-vinho`       | só /\_estilo (página interna, noindex)   | barba em close                     | [ ]         |
| `quadro-parede-verde`        | Home seção 3, /servicos-e-precos, imagem de compartilhamento | cliente de lado/costas | [ ] |
| `quadro-barbearia-geral`     | /como-chegar                             | cliente de costas                  | [ ]         |
| `loop-degrade`, `quadro-resultado-nuca` | Home, /degrade-em-lages       | só nuca (o plano do rosto foi cortado) | [ ]     |

Sem cliente: `pomadas` (só o Pedro), `quadro-cafe-coado`, monograma.

## 5. Música e som

- ✅ **Nenhum vídeo publicado tem faixa de áudio:** 32 arquivos (MP4 e WebM) conferidos com ffprobe, 0 com áudio. No manifesto, `audioLiberado: false` em todos. Não existe como tocar trilha comercial: o som foi retirado na geração.

## 6. Google

- ✅ **Sem avaliação incentivada:** /avaliar diz que não há desconto, brinde nem sorteio em troca; a plaquinha só pede a opinião.
- ✅ **Sem AggregateRating e sem Review** nos dados estruturados (o `audit-seo` derruba o build se aparecer).
- ✅ A nota do Google aparece como texto, com a data da conferência (24/10/2026); o build avisa se passar de 60 dias.

## 7. Marcas de terceiros

- ✅ **Pomadas:** o texto não cita marca. No vídeo aparecem embalagens com marca; acrescentei, junto da legenda do vídeo, "Os produtos que aparecem no vídeo são exemplos de cada tipo de pomada. Este site não vende produtos." Nenhum link de compra.
- ⚠️ A formação na config cita "Efis Cosméticos" e perfis de instrutores; ela não vai ao ar até o Pedro confirmar (só no preview).

## 8. CNPJ e identificação

- ✅ Rodapé de todas as páginas: "{nome} · Pedro Carlos Tensini · CNPJ 42.779.510/0001-59". Política de privacidade com o mesmo CNPJ.

## 9. Travas de produção

`SITE_MODO=producao pnpm build`:

| Trava                                    | Situação                                                                               |
| ---------------------------------------- | -------------------------------------------------------------------------------------- |
| WhatsApp presente e confirmado           | ✅ ok                                                                                   |
| Número do endereço confirmado            | ⛔ **trava**: "405 ou 205 — posts dizem 205"                                            |
| Nome canônico confirmado                 | ⛔ **trava**: "Tensini Barbieri" ainda não confirmado com o Pedro                       |
| Nenhum termo vetado                      | ✅ ok                                                                                   |
| Nenhuma mídia `naoUsar` referenciada     | ✅ ok                                                                                   |
| Nenhum preço exibido sem fonte           | ✅ ok                                                                                   |

Resultado: **produção bloqueada por 2 travas** (mais 27 pendências opcionais que não travam, em `docs/PENDENCIAS.md`). As travas ficam como estão; somem quando o João confirmar o número e o nome em `src/config/contato.ts` e `src/config/marca.ts` com `confirmado(valor, fonte)`.

## 10. Deploy

**Configurado:**

- `vercel.json`: build `pnpm build`, saída `dist`, cabeçalhos de segurança (HSTS, Referrer-Policy, Permissions-Policy, nosniff, X-Frame-Options, COOP, CSP `frame-ancestors`), cache longo para `/_astro` e `/media?v=hash`, deploy automático por Git desligado (ver abaixo).
- CSP por hash em cada página (`scripts/csp.mjs`, no postbuild).
- `SITE_URL` por variável de ambiente; sem ela (e sem `SITE_MODO=producao`) todo HTML sai `noindex` e o sitemap sai vazio.
- **Projeto na Vercel criado:** `pedro-tensini` (id `prj_ql6jJDbXoC1bltdRY7wzQnqrAlKV`, time "Joao Canonica's projects"). `SITE_MODO=producao` só no ambiente Production. A proteção de acesso da Vercel vem ligada para as URLs `*.vercel.app` (prévias fechadas, além do noindex).
- **Workflow** `.github/workflows/deploy.yml`: o build roda no GitHub Actions (que tem ffmpeg para gerar as mídias; a imagem de build da Vercel não tem) com cache das mídias, e publica com `vercel deploy --prebuilt`. Qualquer branch vira prévia; `main` vira produção (e a build trava enquanto houver trava).

**Não foi publicado ainda.** O conector da Vercel desta sessão não sobe os ~150 MB de mídia, e o deploy pela CLI precisa de um token que só o João pode criar. Para o primeiro deploy, o João:

1. Cria um token em vercel.com → Account Settings → Tokens.
2. No GitHub (`joaocanonica/pedro-tensini` → Settings → Secrets and variables → Actions), cria `VERCEL_TOKEN`, `VERCEL_ORG_ID` = `team_ekDszb9n4cvStIbnpxxVoSzv` e `VERCEL_PROJECT_ID` = `prj_ql6jJDbXoC1bltdRY7wzQnqrAlKV`.
3. Na mesma tela, aba Variables, cria `DEPLOY_ATIVO` = `true` (sem ela o workflow não roda).
4. Roda o workflow "deploy" (aba Actions) no branch atual: sai uma prévia `*.vercel.app` com noindex.
5. Quando o domínio existir: em Vercel → Settings → Environment Variables, cria `SITE_URL=https://<domínio>` em Production, liga o domínio ao projeto e, com as duas travas resolvidas, faz o merge em `main`.
6. Se quiser medição: `PUBLIC_MEDICAO_URL` e `PUBLIC_MEDICAO_SITE` em Production (`docs/FUNIL.md`).

## 11. O que depende do João (resumo)

1. Confirmar o **número do endereço** (405 ou 205) e o **nome canônico**: destravam a produção.
2. Decidir os **nomes nas avaliações** da home (autorização, iniciais ou sem nome).
3. Marcar a **lista de mídias com cliente** (seção 4).
4. Criar o **token da Vercel** e os três segredos no GitHub; depois, domínio e `SITE_URL`.
5. Testar no **iPhone (Safari)** e num **Android real**: tocar em "Agendar no WhatsApp" e ver o app abrir; no computador, ver o WhatsApp Web abrir.
6. Hospedagem e data na **política de privacidade** (Vercel).
7. O resto continua em `docs/PENDENCIAS.md` e `docs/SEO_GEO.md` (preços, fotos do caminho, ficha do Google, link de avaliação, formação).
