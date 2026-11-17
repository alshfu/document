# Personbevis-generator

Statisk generator för Skatteverkets **Personbevis** (A4).

Klistra in namn / personnummer / adress → Generera → PDF.

Fungerar utan server — öppna lokalt eller via **GitHub Pages**.

## Live

https://alshfu.github.io/document/personbevis-generator/

## Format

```
Nils Rauner
200708053293
Tulegatan 20
113 53 Stockholm
```

Välj ändamål (Adress, Pass, Studier …) och språk (SV/EN/GA).

## Skriv ut

**PDF** öppnar ett rent A4-fönster. Välj A4, 100 %, bakgrundsgrafik.

## Filer

- `index.html`, `ui.css`, `shell.js`
- `core.js` (render + parser)
- `logo.js` (inbäddad Skatteverket-logga)
