# Fontes da imagem Open Graph

O `sharp` (Pango) não lê WOFF2, então a imagem de compartilhamento usa cópias TTF das fontes do site:

- `libre-caslon-display-400.ttf`: de `src/styles/fonts/libre-caslon-display-latin-400-normal.woff2` (subset latino), só descompactada.
- `schibsted-grotesk-600.ttf`: de `src/styles/fonts/schibsted-grotesk-latin-wght-normal.woff2`, instância estática no peso 600 (fontTools `varLib.instancer`).

Licença: SIL Open Font License 1.1 (textos em `src/styles/fonts/OFL-*.txt`). Uso só no build; não vão para o navegador.
