---
pagina: (componentes)
---

# Microtextos

## Status ao vivo (gerado por `src/lib/horario.ts`)

- Aberto, mais de 60 min para fechar: "Aberto agora · fecha às 20h"
- Aberto, até 60 min para fechar: "Fecha em 40 min"
- Fechado, abre no mesmo dia: "Fechado · abre hoje às 8h30"
- Fechado, abre no dia seguinte: "Fechado · abre amanhã às 8h30"
- Fechado, abre em outro dia da semana: "Fechado · abre segunda às 8h30"
- Fechado por mais de uma semana: "Fechado · abre 11/01 às 8h30"
- Sem JS: "seg a sex 8h30–20h · sáb 8h30–18h · dom fechado"

## Botões e links

- Primário: "Agendar no WhatsApp"
- Secundários: "Como chegar" · "Ligar"
- Rotas: "Abrir no Google Maps" · "Abrir no Waze" · "Abrir no Apple Mapas"
- Mapa: "Carregar mapa interativo"
- Vídeo: "Pausar vídeo" · "Tocar vídeo"
- Entrada: "Pular" (nome acessível: "Pular a abertura")
- Acessibilidade: "Pular para o conteúdo"
- Links de seção: "Ver horários e como chegar" · "Entenda o degradê" · "Ver barba e barbaterapia" · "Conheça o Pedro" · "Qual pomada usar" · "Avaliar no Google" · "Ver todas as perguntas"
- Tema: "Tema claro" · "Tema escuro"

## Menu

Início · Degradê · Barba · Sobrancelha · Pomadas · Serviços e preços · Sobre o Pedro · Como chegar · Perguntas · Agendar

Botão do menu no mobile: "Menu" / "Fechar menu"

## Montador de mensagem

- Título: "Monte sua mensagem"
- Passo 1: "O que você quer fazer?"
  - Opções: "Corte" · "Degradê" · "Barba" · "Barbaterapia" · "Sobrancelha"
  - Dica: "Pode marcar mais de um."
- Passo 2: "Qual dia?"
  - Opções: "Hoje" · "Amanhã" · "Escolher data"
  - Domingo desabilitado, com o texto: "Domingo fechado"
  - Hoje fechado ou já sem horário: "Hoje não tem mais horário"
  - Feriado ou folga (exceção da config): "Fechado neste dia"
- Passo 3: "Qual período?"
  - Opções (só as que existem no dia): "Manhã · 8h30 às 12h" · "Tarde · 12h às 18h" · "Noite · 18h às 20h"
- Passo 4: "Seu nome (opcional)"
  - Placeholder: "Como o Pedro te chama"
- Prévia: "Sua mensagem"
- Botão: "Abrir conversa no WhatsApp"
- Nota: "O Pedro confirma o horário com você por lá."
- Nota de privacidade: "Nada do que você escolhe fica salvo neste site."
- Sem serviço escolhido, o botão abre a mensagem padrão: "Olá, Pedro! Vim pelo site e quero agendar um horário."

Formato do dia na mensagem (gerado pelo montador):

- "hoje (sábado, 25/10)"
- "amanhã (segunda, 27/10)"
- "sexta, 31/10"

Mensagem completa (texto exato de `src/lib/whatsapp.ts`):
"Olá, Pedro! Vim pelo site e quero agendar: {serviço}. Prefiro {dia}, {período}. Meu nome é {nome}."

## Rodapé

- Marca: monograma TB + "{{nome}}"
- Linha: "Barbeiro no Centro de Lages"
- Endereço: {{endereco.completo}}
- Horário: {{horario.semana}}
- WhatsApp: {{whatsapp}} · Instagram: {{instagram}}
- Links: Serviços e preços · Como chegar · Perguntas frequentes · Avaliar no Google · Política de privacidade
- Legal: "{{nome}} · Pedro Carlos Tensini · CNPJ {{cnpj}}"
- Créditos: "Site: WAXLO" [PROVISÓRIO: o João confirma se o crédito entra]

## Faixas e selos (preview)

- Faixa: "Em revisão · prévia não indexada · dados marcados como PROVISÓRIO ainda não foram confirmados"
- Selo: "PROVISÓRIO"

## Mapa (antes do consentimento)

- Texto alternativo da imagem estática: "Mapa do Centro de Lages com o ponto da Galeria Augusta, na Rua Hercílio Luz"
- Nota: "Ao carregar, o Google recebe dados de acesso do seu navegador."
