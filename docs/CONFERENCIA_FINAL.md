# Conferência final de normas e deploy

25/10/2026, atualizada com as decisões do João para a publicação de 27/10/2026. A única passada de normas do projeto (CDC, termos vetados, LGPD, direito de imagem, música, Google, marcas de terceiros, CNPJ), mais as travas de produção e o deploy. ✅ conferido e ok · ⚠️ conferido, com decisão ou ação do João · ⛔ trava.

Nenhuma trava e nenhuma lista foi afrouxada. As duas travas que seguravam a produção caíram porque o João confirmou os dados (nome e endereço), não porque a regra mudou.

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
- ✅ **Política completa:** cita a Vercel como hospedagem e os registros técnicos de acesso dela; "Atualizada em: 27/10/2026".
- ✅ **Nomes nas avaliações:** a home mostra só as iniciais dos autores ("V. F.", "D. A."), decisão do João.

## 4. Direito de imagem

- ✅ **Nenhum nome de cliente** em legendas, alt, descrições, vídeos publicados ou avaliações (só iniciais).
- ✅ **Trecho da agenda removido:** o app de agenda (7,0–8,8 s do original, com possíveis nomes de clientes) foi cortado do `bastidores-site`. Conferi os quadros em volta do corte no arquivo publicado: não aparece tela de agenda.
- ✅ **Autorizados:** o João confirmou que todos os clientes que aparecem autorizaram (mensagem de 25/10/2026: "tudo foi permitido pelos clientes, tudo pode subir de produção"). Mídias publicadas com cliente:

| Mídia publicada              | Onde aparece                             | Cliente visível                    | Autorizado? |
| ---------------------------- | ---------------------------------------- | ---------------------------------- | ----------- |
| `loop-hero`                  | Home, hero                               | barba e parte do rosto, em close   | ✅ (João)    |
| `experiencia-completa`       | Home (diálogo), /barba-e-barbaterapia    | rosto, sorrindo no fim             | ✅ (João)    |
| `resultado-1`                | Home, /degrade-em-lages                  | cabeça de perfil e nuca            | ✅ (João)    |
| `resultado-2`                | Home, /degrade-em-lages                  | rosto de perfil e de frente        | ✅ (João)    |
| `bastidores-site`            | /sobre-pedro-tensini                     | clientes na cadeira, rosto         | ✅ (João)    |
| `trajetoria`                 | /sobre-pedro-tensini                     | cliente, rosto (vídeo antigo)      | ✅ (João)    |
| `quadro-sobrancelha-navalha` | /sobrancelha                             | rosto do cliente (do `trajetoria`) | ✅ (João)    |
| `retrato-provisorio-1`       | Home seção 1, /sobre                     | cliente de perfil, com barba       | ✅ (João)    |
| `foto-toalha-quente`         | Home seção 1½, /barba-e-barbaterapia     | rosto parcialmente coberto         | ✅ (João)    |
| `foto-esfoliacao`            | idem                                     | rosto, olhos fechados              | ✅ (João)    |
| `foto-navalha`               | idem                                     | barba em close                     | ✅ (João)    |
| `foto-barba-finalizada`      | idem                                     | perfil                             | ✅ (João)    |
| `quadro-maquina-vinho`       | só /\_estilo (página interna, noindex)   | barba em close                     | ✅ (João)    |
| `quadro-parede-verde`        | Home seção 3, /servicos-e-precos, imagem de compartilhamento | cliente de lado/costas | ✅ (João) |
| `quadro-barbearia-geral`     | /como-chegar                             | cliente de costas                  | ✅ (João)    |
| `loop-degrade`, `quadro-resultado-nuca` | Home, /degrade-em-lages       | só nuca (o plano do rosto foi cortado) | ✅ (João) |

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

| Trava                                    | Situação                                                                                     |
| ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| WhatsApp presente e confirmado           | ✅ ok                                                                                         |
| Número do endereço confirmado            | ✅ ok: confirmado **sem número** (João: "número não importa"; o endereço é a Galeria Augusta) |
| Nome canônico confirmado                 | ✅ ok: "Pedro Tensini Barbearia" (João)                                                       |
| Nenhum termo vetado                      | ✅ ok                                                                                         |
| Nenhuma mídia `naoUsar` referenciada     | ✅ ok                                                                                         |
| Nenhum preço exibido sem fonte           | ✅ ok                                                                                         |

Resultado: **produção liberada** (0 travas; 26 pendências opcionais que não travam, em `docs/PENDENCIAS.md`). A trava do número continua valendo: um número pendente (`bloqueante`) volta a derrubar a build; o endereço sem número é um estado confirmado, com a fonte registrada em `src/config/contato.ts`.

## 10. Deploy

**O erro da Vercel (log do deploy `dpl_WxiMKHTkUKko1EfJ6qzWHC86qoxS`):** `[media] ffmpeg não encontrado`. A build rodava `media:prepare`, que gera os vídeos e imagens com ffmpeg; a imagem de build da Vercel não tem ffmpeg, e as mídias geradas estavam fora do git.

**Correção:**

- As mídias geradas (`public/media/`, 148 MB) e o cache delas (`.cache/media.json`) agora vão no git. O `media:prepare` só exige ffmpeg quando alguma mídia precisa ser gerada de novo; na Vercel ele confere os originais (sha256 do manifesto) e os arquivos, e segue. Quem muda uma mídia roda `pnpm media:prepare` localmente (com ffmpeg) e commita o resultado.
- Testado: clone limpo, sem ffmpeg, `SITE_MODO=producao pnpm build` passa (travas, auditorias e CSP).
- `vercel.json`: deploy por Git ligado (cada push no `main` publica; outros branches viram prévia). Saiu o workflow do GitHub Actions, que dependia de token.
- `SITE_URL`: se não for definida, a build de produção na Vercel usa o domínio de produção do projeto (`VERCEL_PROJECT_PRODUCTION_URL`). Quando o domínio próprio for ligado ao projeto, ele vira o canônico sem mexer no código.

**Na Vercel (time "Joao Canonica's projects"):**

- Projeto **`pedro-tensini`** (id `prj_sVgmzVsoLCFIZiq21dvYc1qFyO5H`, o que o João importou do GitHub). `SITE_MODO=producao` em Production.
- Proteção da Vercel só nas **prévias**; a produção abre para qualquer pessoa.
- O projeto antigo, sem Git, foi renomeado para `pedro-tensini-sem-git` (sem deploy; pode ser apagado).

**Domínio próprio (quando houver):** Vercel → projeto → Settings → Domains → adicionar o domínio e seguir o DNS que a Vercel mostrar. Medição, se quiser: `PUBLIC_MEDICAO_URL` e `PUBLIC_MEDICAO_SITE` em Production (`docs/FUNIL.md`).

## 11. O que depende do João (resumo)

1. Testar no **iPhone (Safari)** e num **Android real**: tocar em "Agendar no WhatsApp" e ver o app abrir; no computador, ver o WhatsApp Web abrir.
2. Fazer o merge do branch no `main` para o deploy automático seguir o código novo.
3. Domínio próprio, se quiser (seção 10).
4. O resto continua em `docs/PENDENCIAS.md` e `docs/SEO_GEO.md` (preços, fotos do caminho, ficha do Google, link de avaliação, formação, andar/sala).
