# Inkomstdeklaration generator

Статический генератор **Inkomstdeklaration 1** (inkomstår 2025 / deklaration 2026).

Вставляешь 4 строки → считаются skatt / skattereduktioner → собирается бланк из 7 страниц → печать в PDF.

Работает **без сервера** — можно открыть локально или выложить на **GitHub Pages**.

## Быстрый старт

1. Открой `index.html` в браузере  
   или подними локальный сервер из этой папки:
   ```bash
   python3 -m http.server 8080
   # http://127.0.0.1:8080/
   ```
2. Вставь данные, нажми **Generera**.
3. **Skriv ut / PDF** → системный диалог печати.

### Формат вставки

```
Nils Rauner
200708053293
Tulegatan 20 Stockholm
195 000
```

## GitHub Pages

1. Положи содержимое этой папки в репозиторий (корень или `/docs` / `/verktyg/deklaration-generator`).
2. Settings → Pages → Source: Deploy from a branch → `/` или `/docs`.
3. Открой `https://<user>.github.io/<repo>/` (или путь к папке).

Файлы, которые нужны на Pages:

- `index.html`
- `tax.js`
- `render.js`
- `app.js`
- `doc.css`
- `ui.css`
- `skatteverket_logo.svg`

На телефоне: крупный ввод, нижняя панель Generera/PDF, доп. настройки свёрнуты, бланк масштабируется под ширину экрана.

## Настройки

| Поле | Описание |
|------|----------|
| Kommun | Preset (Stockholm, Botkyrka, Nacka, Järfälla) или свои % |
| Källa | `Lön` → jobbskatteavdrag; `Försäkringskassan` → без JSA |
| A-kassa | Годовой взнос → skattereduktion 25 % |
| Ränteutgifter | Lån utan säkerhet (в 2025 вычитается 50 %) |
| Preliminär skatt | Пусто = авто (методика skattetabell) |

## Важно

Это **демо / учебный** инструмент. Бланк помечен `DEMOVERSION`. Не используй как официальную подачу в Skatteverket.
