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

## Mídia a produzir

Ver `docs/TENSINI_MAPA_MIDIA.md`, seção "O que falta gravar ou fotografar".

## Ambiente (sessão 0)

- O Astro estável atual (7.4.2) exige Node ≥ 22.23.4. O projeto foi fixado em Node 24.22.1 (LTS "Krypton"), ver `.nvmrc`.
- O Playwright do projeto (1.64.1) procura um Chromium que não vem pré-instalado neste ambiente; `scripts/capturar.mjs` usa `/opt/pw-browsers/chromium` como alternativa. Em outra máquina: `pnpm exec playwright install chromium`.
