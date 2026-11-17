# Inkomstdeklaration generator

Statisk generator för **Inkomstdeklaration 1** (inkomstår 2025 / deklaration 2026).

Klistra in 4 rader → skatt/skattereduktioner beräknas → blankett (7 sidor) → skriv ut till PDF.

Fungerar **utan server** — öppna lokalt eller publicera på **GitHub Pages**.

## Snabbstart

1. Öppna `index.html` i webbläsaren  
   eller starta lokal server i den här mappen:
   ```bash
   python3 -m http.server 8080
   # http://127.0.0.1:8080/
   ```
2. Klistra in uppgifter och tryck **Generera**.
3. **PDF** → systemets utskriftsdialog.

### Format

```
Nils Rauner
200708053293
Tulegatan 20 Stockholm
195 000
```

## GitHub Pages

Live: https://alshfu.github.io/document/deklaration-generator/

Filer som behövs:

- `index.html`
- `tax.js`
- `render.js`
- `app.js`
- `doc.css`
- `ui.css`
- `skatteverket_logo.svg`

På mobil: stort inmatningsfält, docka med Generera/PDF, fler inställningar ihopfällda, blanketten skalas till skärmbredden.

## Inställningar

| Fält | Beskrivning |
|------|-------------|
| Kommun | Förinställning (Stockholm, Botkyrka, Nacka, Järfälla) eller egen % |
| Inkomstkälla | `Lön` → jobbskatteavdrag; `Försäkringskassan` → utan JSA |
| A-kassa | Årsavgift → skattereduktion 25 % |
| Ränteutgifter | Lån utan säkerhet (2025: 50 % avdragsgillt) |
| Preliminär skatt | Tom = auto (skattetabell-metod) |

## Viktigt

Detta är ett **demo-/utbildningsverktyg**. Blanketten märks `DEMOVERSION`. Använd den inte som officiell inlämning till Skatteverket.
