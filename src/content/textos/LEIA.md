---
pagina: (documentação)
---

# Textos do site — convenções

Sessão 5 · 24/10/2026. Todo o texto do site está nesta pasta. As sessões 6 e 7 só montam o layout em cima destes arquivos.

## Frontmatter

- `pagina`: rota.
- `title`: até 60 caracteres. `description`: até 155. Conferidos por `pnpm audit-compliance --textos`.

## Marcadores de dados (vêm de `src/config`, nunca são digitados aqui)

| Marcador                                                        | Valor hoje                                                                              | Estado                                  |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------- |
| `{{nome}}`                                                      | Tensini Barbieri                                                                        | provisório (nome canônico, bloqueante)  |
| `{{pedro}}`                                                     | Pedro Tensini                                                                           | confirmado                              |
| `{{endereco.curto}}`                                            | Rua Hercílio Luz, Galeria Augusta — Centro                                              | confirmado                              |
| `{{endereco.completo}}`                                         | Rua Hercílio Luz, {{endereco.numero}}, Galeria Augusta, Centro, Lages/SC, CEP 88501-010 | número bloqueante (405 ou 205)          |
| `{{endereco.salaAndar}}`                                        | —                                                                                       | pendente                                |
| `{{horario.semana}}`                                            | segunda a sexta, das 8h30 às 20h; sábado, das 8h30 às 18h; domingo, fechado             | confirmado                              |
| `{{status}}`                                                    | status ao vivo ("Aberto agora · fecha às 20h")                                          | calculado                               |
| `{{whatsapp}}`                                                  | (49) 99903-7620                                                                         | confirmado                              |
| `{{instagram}}`                                                 | @tensinibarbiere_                                                                       | confirmado                              |
| `{{plusCode}}`                                                  | 5MMC+8J Lages, SC                                                                       | confirmado                              |
| `{{cnpj}}`                                                      | 42.779.510/0001-59                                                                      | confirmado                              |
| `{{google.nota}}`, `{{google.total}}`, `{{google.conferidoEm}}` | 5,0 · 2 · 24/10/2026                                                                    | confirmado (aviso se passar de 60 dias) |
| `{{preco.<slug>}}`, `{{duracao.<slug>}}`                        | —                                                                                       | pendentes                               |

## Blocos condicionais

```
<!-- se:preco.degrade -->  texto que usa o preço confirmado  <!-- senao -->  texto sem preço  <!-- fim -->
```

O texto do `senao` é o que vai ao ar enquanto o dado não existir, e já serve para produção.

## Provisório

`[PROVISÓRIO: motivo]` marca frase que depende de confirmação do Pedro ou do João. No preview aparece com o selo; em produção, a frase sai (ou entra a versão confirmada). Lista completa em `docs/PENDENCIAS.md`.

## Citações

Toda citação literal do Pedro vai em bloco `>` com uma linha `Fonte:` dentro do mesmo bloco. A auditoria falha se faltar.

## Voz

Frases curtas, "você", confiança sem exagero. Léxico dele: detalhe, precisão, acabamento, presença, confiança, experiência. Sem emoji, sem promessa, sem superlativo. Nada de anos de experiência, número de clientes ou prêmios.
