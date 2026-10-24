# tensini-site

Site da Tensini Barbieri (Pedro Tensini), Galeria Augusta, Rua Hercílio Luz, Centro, Lages/SC.
Astro estático, TypeScript strict, pnpm. Contexto completo em `CLAUDE.md`; pendências em `docs/PENDENCIAS.md`.

## Requisitos

- Node 24.22.1 (`.nvmrc`) e pnpm 10.28.0 (`packageManager`).
- ffmpeg/ffprobe para `media:prepare`.

## Comandos

| Comando                                | O que faz                                                                                                              |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                             | servidor local                                                                                                         |
| `pnpm build`                           | gera `dist/`                                                                                                           |
| `pnpm preview`                         | serve `dist/`                                                                                                          |
| `pnpm check`                           | `astro check` + ESLint + Prettier                                                                                      |
| `pnpm capturar [rotas]`                | capturas 390/1440 px, claro/escuro, com e sem movimento reduzido, em `docs/capturas/<data>/` (rode `pnpm build` antes) |
| `pnpm media:prepare`                   | derivados de mídia em `public/media/` (stub)                                                                           |
| `pnpm validate-config`, `pnpm audit-*` | validações e auditorias (stubs por enquanto)                                                                           |

## Pastas

- `src/` config, componentes, layouts, páginas, estilos, scripts, conteúdo.
- `scripts/` utilitários de build, mídia e auditoria.
- `docs/` contexto, investigação, mapa de mídia, prompts, pendências, capturas e dados.
- `assets/`, `videos/` originais atuais (vão para `media-originais/` na sessão 1).
