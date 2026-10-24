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

## Ambiente (sessão 0)

- O Astro estável atual (7.4.2) exige Node ≥ 22.23.4. O projeto foi fixado em Node 24.22.1 (LTS "Krypton"), ver `.nvmrc`.
- `pnpm build` e `pnpm dev` rodam `media:prepare` antes (predev/prebuild) e precisam de **ffmpeg/ffprobe** no ambiente de build. Definir na sessão 9 como o deploy recebe os derivados (ffmpeg no build ou upload de `public/media/`).
- O Playwright do projeto (1.64.1) procura um Chromium que não vem pré-instalado neste ambiente; `scripts/capturar.mjs` usa `/opt/pw-browsers/chromium` como alternativa. Em outra máquina: `pnpm exec playwright install chromium`.
