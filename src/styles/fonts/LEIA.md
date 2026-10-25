# Fontes (OFL)

Fontsource 5.3.0, subset latino. Licenças ao lado (`OFL-*.txt`).

Na sessão 6 (home), as duas fontes do site foram enxugadas com fontTools para não disputar banda com o LCP:

- `libre-caslon-display-latin-400-normal.woff2`: subset U+0020–007E, U+00A0–00FF, aspas, travessões, reticências, marcador e U+2212; recursos kern, liga, tnum, lnum; sem hinting. 24.236 → 14.404 B.
- `schibsted-grotesk-latin-wght-normal.woff2`: o mesmo subset, mais o eixo `wght` limitado a 400–700 (o site não usa acima de 700). 46.752 → 34.528 B.

Comando (com fonttools + brotli):

```
pyftsubset <arquivo>.woff2 --unicodes="U+0020-007E,U+00A0-00FF,U+2013-2014,U+2018-201A,U+201C-201E,U+2022,U+2026,U+2039-203A,U+2212" \
  --layout-features='kern,tnum,lnum,liga' --flavor=woff2 --no-hinting --desubroutinize
# Schibsted: fontTools.varLib.instancer.instantiateVariableFont(f, {"wght": (400, 700)})
```

As alternativas testadas na sessão 3 (DM Serif Display, Inter Tight, Schibsted itálico) seguem como vieram do Fontsource.
