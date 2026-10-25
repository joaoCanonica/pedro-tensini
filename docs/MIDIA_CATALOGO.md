# Catálogo de mídia — Tensini Barbieri

Sessão 1 · 24/10/2026. Fonte única: `media.manifest.json` (validado por `media.manifest.schema.json`).

## Como funciona

| Comando | O que faz |
|---|---|
| `pnpm media:stills` | Mede a nitidez (variância do laplaciano) de cada quadro das janelas e grava o `t` escolhido no manifesto (quadros, retratos e pôsteres). Gera as folhas de contato em `docs/capturas/midia/`. |
| `pnpm media:prepare` | Gera os derivados em `public/media/` (fora do git). Confere o sha256 dos originais, usa cache por hash, apaga o que saiu do manifesto e trava se houver mídia `naoUsar` publicada. Roda sozinho antes de `dev` e `build`. |
| `pnpm media:catalogo` | Igual ao anterior e reescreve a tabela automática abaixo (pesos medidos). |

- **Originais** em `media-originais/{fotos,videos,marca}/`: intactos, só `git mv`.
- **Imagens**: AVIF + WebP em 480/800/1200/1600 px, nunca acima do original (largura do original entra quando é menor que 1600), e LQIP WebP de 24 px em base64.
- **Vídeos**: MP4 H.264 (faststart) + WebM VP9 em 720×1280 e 540×960, sem áudio enquanto `audioLiberado` for `false`. Pôster AVIF/WebP no quadro mais nítido da janela.
- **Loops**: crossfade de 0,4 s no laço (o fim dissolve no começo). Depois o laço é girado para começar no quadro do pôster, então o pôster é idêntico ao 1º quadro (sem salto quando o vídeo começa).
- **Índice** para as páginas: `public/media/media-index.json` (src, larguras, bytes, LQIP, pôster, duração).

## Decisões desta sessão

1. **Recorte das fotos da barbaterapia: 4:3, 1008×756, y 234–990.** Medido pixel a pixel: o logo vai até y≈228 (canto superior direito); os títulos começam em y≈998 (esfoliação), 1003 (toalha), 1075 (navalha) e 1170 (barba finalizada). Em 4:3 cabem 1008×756 (52% da área); em 1:1 só 756×756 (39%). Ficou 4:3. Todos estão marcados `provisorio: true`.
2. **"Creme e massagem" (858788059) é a mesma foto da "Toalha quente" (856610241).** Só o título muda; na área útil a diferença é de borda/compressão. Recortada, ela não mostra creme nem massagem: virou `naoUsar` (duplicata). O passo 3 da barbaterapia fica sem foto.
3. **Navalha (858729706)**: o mapa estimava o título em y≈820–870; ele começa em y≈1075. Usei o mesmo recorte das outras (até y 990), sem perder nada.
4. **Trechos de vídeo** conferidos quadro a quadro (detecção de corte + folhas de contato):
   - `loop-hero`: o trecho 16–22 s tem 3 planos (16,57 lateral, 19,10 macro da Wahl vinho, 21,77 máquina no buço). Corte 16,55–22,95 s (6,4 s), loop final de 6,0 s após o crossfade.
   - `loop-degrade`: nuca 5,97–7,83 s + pezinho 8,77–10,20 s. O plano do rosto do cliente (7,83–8,77 s) saiu. Loop final ≈ 2,9 s.
   - `resultado-1`: começa em 26,62 s (corte real do plano do resultado) até o fim.
   - `resultado-2`: 43,55–60,32 s. Antes de 43,6 s o Pedro ainda está cortando; de 60,5 s em diante há a transição para a vinheta com o logo raster 3D e o poste de barbeiro.
   - `bastidores-site`: o selo "BASTIDORES BARBEARIA" só ocupa o 1º plano (0–2,53 s), então sai por corte. A agenda ocupa exatamente 7,00–8,80 s e também sai. O último quadro (preto) sai.
5. **Retrato provisório**: três quadros com o rosto do Pedro sem máscara, com a nitidez medida só na região do rosto. O 3º (pomadas) é recortado em 720×720 acima das legendas queimadas.

## Folhas de contato

`docs/capturas/midia/`: uma por trecho de vídeo (`<id>.jpg`, 12 quadros + pôster), `quadros-e-retratos.jpg` e `fotos-recortes.jpg` (original com o retângulo do recorte + resultado, e os descartes).

## Tabela (automática)

<!-- AUTO:INICIO (pnpm media:catalogo) -->
| Derivado | Origem | Uso | Trecho / quadro | Pesos | Problemas |
|---|---|---|---|---|---|
| `loop-hero` | `videos/experiencia-babearia-verdadeira.mp4` | Hero da home: loop mudo decorativo (aria-hidden + botão pausar global). Macro da máquina na barba. | 16,55–22,95 s · laço 6,00 s (crossfade 0,40 s) · pôster 21,03 s | 720: MP4 0,83 MB · WebM 0,81 MB<br>540: MP4 0,51 MB · WebM 0,55 MB<br>pôster AVIF 21 KB/29 KB | O pedido era 16–22 s; o trecho tem 3 planos (16,6 lateral com pente, 19,1 macro da Wahl vinho, 21,8 máquina no buço). Pegamos 16,55–22,95 (6,4 s) para fechar 6,0 s após o crossfade. |
| `loop-degrade` | `videos/corte1.mp4` | Seção Degradê: loop mudo decorativo (close do degradê na nuca + pezinho). | 5,95–7,82 s + 8,75–10,18 s · laço 2,90 s (crossfade 0,40 s) · pôster 6,97 s | 720: MP4 0,69 MB · WebM 0,63 MB<br>540: MP4 0,42 MB · WebM 0,42 MB<br>pôster AVIF 34 KB/50 KB | Os planos reais são 5,97–7,83 (nuca) e 8,77–10,20 (pezinho); entre eles há um plano do rosto do cliente (7,83–8,77), removido. Loop final ≈ 2,9 s. |
| `resultado-1` | `videos/corte-acabamento.mp4` | Seção Degradê e /degrade-em-lages: giro do resultado (perfil, nuca, perfil). Vídeo de conteúdo com controles. | 26,62–34,83 s · pôster 32,13 s | 720: MP4 1,43 MB · WebM 1,48 MB<br>540: MP4 0,85 MB · WebM 0,96 MB<br>pôster AVIF 29 KB/46 KB | Pedido 26–35 s; o plano do resultado começa em 26,6 s (antes é o Pedro finalizando de outro ângulo). |
| `resultado-2` | `videos/corte2.mp4` | Galeria de resultados: degradê baixo em vários ângulos. Vídeo de conteúdo com controles. | 43,55–60,32 s · pôster 46,20 s | 720: MP4 3,20 MB · WebM 3,65 MB<br>540: MP4 2,11 MB · WebM 2,60 MB<br>pôster AVIF 28 KB/40 KB | Pedido 40–62 s. 38,8–43,6 s ainda é o Pedro cortando (máquina no pescoço e plano dele); de 60,5 s em diante há a transição para a vinheta com o logo raster 3D. Trecho final 43,55–60,32 s (16,8 s). |
| `experiencia-completa` | `videos/experiencia-babearia-verdadeira.mp4` | Seção Barba: vídeo completo com controles. | 0,00–59,49 s · pôster 21,03 s | 720: MP4 9,78 MB · WebM 10,12 MB<br>540: MP4 6,19 MB · WebM 6,79 MB<br>pôster AVIF 21 KB/29 KB | — |
| `bastidores-site` | `videos/bastidores.mp4` | Página Sobre / 'Um dia aqui': vídeo com controles. | 2,52–6,99 s + 8,79–56,19 s · pôster 11,73 s | 720: MP4 7,63 MB · WebM 7,74 MB<br>540: MP4 4,85 MB · WebM 5,35 MB<br>pôster AVIF 26 KB/38 KB | — |
| `pomadas` | `videos/qual-pomada-certa.mp4` | Página /pomadas: vídeo inteiro com controles (as legendas queimadas acompanham a fala). | 0,00–38,83 s · pôster 28,47 s | 720: MP4 5,51 MB · WebM 6,69 MB<br>540: MP4 3,80 MB · WebM 4,73 MB<br>pôster AVIF 40 KB/60 KB | Sem áudio, o vídeo depende das legendas queimadas. CTA 'Segue esse perfil' queimado em 36–37 s. |
| `trajetoria` | `videos/primeiro-video.mp4` | Página Sobre (trajetória), uso médio: vídeo com controles. | 0,00–61,23 s · pôster 39,53 s | 720: MP4 11,72 MB · WebM 13,01 MB<br>540: MP4 7,95 MB · WebM 9,41 MB<br>pôster AVIF 34 KB/49 KB | Qualidade menor. |
| `foto-toalha-quente` | `fotos/SaveClip.App_856610241_122104126131512758_229869556221299606_n.jpg` | Barbaterapia, passo 1: toalha quente. | — · recorte 1008×756 em (36, 234), provisório | AVIF 480: 14 KB, 800: 33 KB, 1008: 47 KB<br>WebP 480: 22 KB, 800: 48 KB, 1008: 70 KB | Recorte corta a testa e o cabelo do cliente. |
| `foto-esfoliacao` | `fotos/SaveClip.App_857872880_122104125921512758_4288702109058299548_n.jpg` | Barbaterapia, passo 2: esfoliação. | — · recorte 1008×756 em (36, 234), provisório | AVIF 480: 10 KB, 800: 23 KB, 1008: 32 KB<br>WebP 480: 15 KB, 800: 32 KB, 1008: 45 KB | Recorte corta o topo da cabeça. |
| `foto-navalha` | `fotos/SaveClip.App_858729706_122104124973512758_5633014483998655299_n.jpg` | Barbaterapia, passo 4: navalha. | — · recorte 1008×756 em (36, 234), provisório | AVIF 480: 14 KB, 800: 34 KB, 1008: 60 KB<br>WebP 480: 20 KB, 800: 50 KB, 1008: 95 KB | Recorte corta a mão com o pente no topo. |
| `foto-barba-finalizada` | `fotos/SaveClip.App_858196088_122104126245512758_3717112216634346557_n.jpg` | Barbaterapia, passo 5: barba finalizada. | — · recorte 1008×756 em (72, 234), provisório | AVIF 480: 16 KB, 800: 36 KB, 1008: 55 KB<br>WebP 480: 22 KB, 800: 52 KB, 1008: 84 KB | — |
| `monograma` | `marca/tensini-monograma-tb.svg` | Monograma TB (cópia do SVG, sem alteração). | — | 4 KB | — |
| `quadro-maquina-vinho` | `videos/experiencia-babearia-verdadeira.mp4` | Detalhe: máquina vinho na luva preta. | quadro 30,23 s (janela 29,55–30,80) | AVIF 480: 9 KB, 720: 15 KB<br>WebP 480: 11 KB, 720: 19 KB | — |
| `quadro-navalha` | `videos/experiencia-babearia-verdadeira.mp4` | Detalhe: navalha na barba. | quadro 48,87 s (janela 48,45–49,70) | AVIF 480: 13 KB, 720: 21 KB<br>WebP 480: 16 KB, 720: 27 KB | — |
| `quadro-resultado-barba` | `videos/experiencia-babearia-verdadeira.mp4` | Resultado da barba, cliente sorrindo. | quadro 57,60 s (janela 57,60–59,40) | AVIF 480: 17 KB, 720: 29 KB<br>WebP 480: 20 KB, 720: 38 KB | Rosto de cliente (autorizado pelo João). Nenhum nome. |
| `quadro-parede-verde` | `videos/corte1.mp4` | Plano geral com a parede verde (ambiente). | quadro 11,90 s (janela 10,25–12,70) | AVIF 480: 29 KB, 720: 53 KB<br>WebP 480: 43 KB, 720: 75 KB | — |
| `quadro-pedro-concentrado` | `videos/corte1.mp4` | Pedro concentrado no trabalho. | quadro 14,73 s (janela 12,80–14,80) | AVIF 480: 28 KB, 720: 47 KB<br>WebP 480: 42 KB, 720: 68 KB | — |
| `quadro-barbearia-geral` | `videos/bastidores.mp4` | Plano geral da barbearia (ambiente, Como chegar). | quadro 11,73 s (janela 10,45–12,05) | AVIF 480: 22 KB, 720: 38 KB<br>WebP 480: 27 KB, 720: 47 KB | Câmera de celular: menos nitidez. |
| `quadro-cafe-coado` | `videos/bastidores.mp4` | Café sendo coado (prova do atendimento com café). | quadro 14,00 s (janela 12,15–14,70) | AVIF 480: 31 KB, 720: 49 KB<br>WebP 480: 40 KB, 720: 62 KB | — |
| `quadro-cafe-servido` | `videos/bastidores.mp4` | Café entregue ao cliente na cadeira. | quadro 5,00 s (janela 4,45–5,33) | AVIF 480: 13 KB, 720: 22 KB<br>WebP 480: 16 KB, 720: 27 KB | Câmera de celular, plano curto. |
| `quadro-resultado-perfil` | `videos/corte-acabamento.mp4` | Resultado do degradê de perfil. | quadro 32,13 s (janela 31,87–34,70) | AVIF 480: 23 KB, 720: 46 KB<br>WebP 480: 32 KB, 720: 64 KB | — |
| `quadro-resultado-nuca` | `videos/corte-acabamento.mp4` | Resultado do degradê na nuca. | quadro 31,47 s (janela 28,57–31,80) | AVIF 480: 16 KB, 720: 31 KB<br>WebP 480: 22 KB, 720: 44 KB | — |
| `quadro-sobrancelha-navalha` | `videos/primeiro-video.mp4` | Página /sobrancelha: mídia principal provisória (navalha e pente na linha do cabelo, logo acima da sobrancelha). | quadro 28,57 s (janela 27,67–29,00) | AVIF 480: 29 KB, 720: 48 KB<br>WebP 480: 41 KB, 720: 68 KB | Vídeo mais antigo, qualidade menor que os demais. O vídeo não tem plano claro da sobrancelha sendo feita: a navalha aparece na linha do cabelo, acima da sobrancelha. Pedir foto ou vídeo real do serviço. |
| `retrato-provisorio-1` | `videos/experiencia-babearia-verdadeira.mp4` | Retrato provisório do Pedro (óculos, camiseta branca). | quadro 16,20 s (janela 15,17–16,53) | AVIF 480: 23 KB, 720: 40 KB<br>WebP 480: 31 KB, 720: 53 KB | Provisório até existir retrato profissional. Pedro olha para o cliente, não para a câmera. |
| `retrato-provisorio-2` | `videos/corte1.mp4` | Retrato provisório do Pedro (trabalhando, parede verde). | quadro 14,47 s (janela 12,80–14,80) | AVIF 480: 26 KB, 720: 44 KB<br>WebP 480: 39 KB, 720: 65 KB | Provisório. Olhar para baixo (concentrado). |
| `retrato-provisorio-3` | `videos/qual-pomada-certa.mp4` | Retrato provisório do Pedro (de frente, falando). | quadro 27,93 s (janela 25,30–29,40) · recorte 720×720 em (0, 0), provisório | AVIF 480: 20 KB, 720: 37 KB<br>WebP 480: 31 KB, 720: 57 KB | Provisório. Câmera de celular; legenda queimada fica fora do recorte. |

**Originais sem derivado:**

- `videos/seu-visual-fala-antes-de-qualquer-coisa.mp4`: **naoUsar**: Texto queimado; a frase entra no site como texto.
- `fotos/SaveClip.App_858788059_122104126857512758_3862214480292085338_n.jpg`: **naoUsar**: Duplicata da foto da toalha quente; recortada, não mostra creme nem massagem.
- `fotos/SaveClip.App_858462534_122104126341512758_8185224576184917_n.jpg`: **naoUsar**: Colagem com texto queimado.
- `fotos/foto-pedro.jpg`: Nenhum por enquanto (150 px, pequeno demais). Sem derivado.
- `marca/Pedro-tensini-logo.JPG`: **naoUsar**: Raster 3D; só referência. O nome é tipografia.
- `marca/tensini-monograma-comparacao.png`: **naoUsar**: Documentação interna.
<!-- AUTO:FIM -->

## O que pedir ao João

1. **Retrato profissional do Pedro** (vertical e horizontal). Os três provisórios são quadros de vídeo: o melhor tem 720 px de largura e o Pedro não olha para a câmera.
2. **Originais sem texto das 5 fotos da barbaterapia** (fotógrafo ou agência), e uma **foto real de "creme e massagem"**.
3. **Áudio**: confirmar que não há música comercial por baixo da fala em `qual-pomada-certa` e no fim de `bastidores` (43,6–56,2 s).
4. **Posts de origem** de `corte1`, `corte2`, `corte-acabamento` e do reel "Seu visual fala…". Confirmar o `DMdJJJdu5AW` do `primeiro-video`, a legenda completa das pomadas e o post da série da barbaterapia (`Dewh0h2DoBP`, provável).
5. **Pomadas**: cortar ou manter o final com "Segue esse perfil" queimado (36–37 s)?
6. **Vídeo "da calçada à cadeira"**, fachada da galeria, placa, ambiente vazio e antes/depois em câmera fixa (lista completa no mapa de mídia).
