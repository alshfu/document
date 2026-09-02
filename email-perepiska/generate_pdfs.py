import csv
import re
import shutil
import random
import subprocess
from pathlib import Path

# --- Настройки отправителя ---
SENDER_NAME = "Alexandr Shchetinin"
SENDER_EMAIL = "alshfu@gmail.com"
SENDER_PHONE = "+46 70 987 65 43"
SENDER_ROLE = "Grundare"
SENDER_COMPANY = "RegBot Sweden AB"

# --- Пути ---
BASE_DIR = Path("/Users/al_sh/WebstormProjects/document/email-perepiska")
SVAR_FILE = BASE_DIR / "svar"
CSV_FILE = BASE_DIR / "butiker_kontaktlista.csv"
OUT_DIR = BASE_DIR / "pdfs"
HTML_DIR = BASE_DIR / "generated_html"

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"


def parse_responses(text: str) -> list:
    """Извлекает блоки ответов между ``` из файла svar."""
    blocks = re.findall(r"```\n(.*?)\n```", text, re.DOTALL)
    return [block.strip() for block in blocks if block.strip().startswith("Hej,")]


def read_companies(csv_path: Path) -> list:
    """Читает CSV и возвращает список компаний с валидными данными."""
    companies = []
    with csv_path.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            org = (row.get("Organisation (реестр)") or "").strip()
            email = (row.get("Email") or "").strip()
            name = (row.get("Владелец / VD") or "").strip()
            role = (row.get("Роль") or "").strip()
            if org and email and "@" in email:
                if not name:
                    name = "Kontaktperson"
                if not role:
                    role = "Kontaktperson"
                companies.append({
                    "org": org,
                    "email": email,
                    "name": name,
                    "role": role,
                })
    return companies


def slugify(name: str) -> str:
    """Делает из названия компании безопасное имя файла."""
    s = name.replace(" ", "_")
    s = re.sub(r"[^A-Za-z0-9_åäöÅÄÖéÉ-]", "", s)
    s = s.strip("_-")
    return s or "foretag"


def fill_signature(response_text: str, company: dict) -> str:
    """Заполняет заглушки подписи в ответе данными компании."""
    first_name = company["name"].split()[0] if company["name"] else "Kontaktperson"
    replacements = {
        "[Namn]": company["name"],
        "[Titel]": company["role"],
        "[Företag]": company["org"],
        "[nummer]": "+46 70 123 45 67",
        "[NAMN]": company["name"],
    }
    for placeholder, value in replacements.items():
        response_text = response_text.replace(placeholder, value)
    # Заменяем обращение "Hej," на "Hej [имя]," если имя известно
    if response_text.startswith("Hej,") and company["name"]:
        response_text = f"Hej {first_name}," + response_text[4:]
    return response_text


def build_html(response_text: str, company: dict) -> str:
    """Собирает официальный HTML для переписки с конкретной компанией."""
    response_text = fill_signature(response_text, company)
    response_paragraphs = "".join(
        f"<p>{line}</p>" for line in response_text.split("\n") if line.strip()
    )
    first_name = company["name"].split()[0] if company["name"] else "Kontaktperson"

    return f"""<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <title>Affärsförfrågan — {company['org']}</title>
    <style>
        @page {{ size: A4; margin: 22mm 18mm; }}
        * {{ box-sizing: border-box; }}
        body {{
            margin: 0;
            padding: 0;
            font-family: "Times New Roman", Times, serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #000;
            background: #fff;
        }}
        .page {{
            max-width: 174mm;
            margin: 0 auto;
        }}
        header {{
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            border-bottom: 1.5pt solid #000;
            padding-bottom: 10px;
            margin-bottom: 22px;
        }}
        .company {{ font-size: 16pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5pt; }}
        .doc-type {{ font-size: 10pt; text-align: right; }}
        .doc-type strong {{ display: block; font-size: 12pt; }}
        h1 {{ font-size: 14pt; margin: 0 0 4px; font-weight: 700; }}
        .meta {{ color: #333; font-size: 10pt; margin-bottom: 18px; }}
        .message {{
            border: 1pt solid #666;
            margin-bottom: 16px;
            overflow: hidden;
            page-break-inside: avoid;
        }}
        .message-header {{
            background: #f0f0f0;
            padding: 8px 12px;
            border-bottom: 1pt solid #666;
            font-size: 10pt;
        }}
        .message-header .from {{ font-weight: 700; }}
        .message-header .to,
        .message-header .date {{ color: #333; margin-top: 2px; }}
        .message-body,
        .reply-body {{ padding: 12px 14px; }}
        .letter-text p {{ margin: 0 0 8px; text-align: justify; }}
        .letter-text ul {{
            margin: 8px 0;
            padding-left: 24px;
        }}
        .letter-text li {{ margin-bottom: 4px; }}
        .letter-text strong {{ font-weight: 700; }}
        .offer-table {{
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0 14px;
            font-size: 10.5pt;
        }}
        .offer-table th, .offer-table td {{
            border: 1pt solid #666;
            padding: 6px 8px;
            text-align: left;
        }}
        .offer-table th {{ background: #f0f0f0; font-weight: 700; }}
        .signature {{
            margin-top: 16px;
            color: #333;
            font-size: 10.5pt;
        }}
        .signature strong {{ color: #000; }}
        .attachments {{
            margin-top: 18px;
            padding: 10px 12px;
            background: #fafafa;
            border: 1pt dashed #999;
            font-size: 10pt;
            color: #333;
        }}
        .attachments h3 {{ margin: 0 0 4px; font-size: 9pt; text-transform: uppercase; }}
        .attachments ul {{ margin: 0; padding-left: 18px; }}
        .signatures {{
            margin-top: 40px;
            display: flex;
            gap: 48px;
            page-break-inside: avoid;
        }}
        .signature-block {{ flex: 1; }}
        .signature-label {{ font-size: 9pt; color: #333; margin-bottom: 36px; }}
        .signature-line {{
            border-top: 1pt solid #000;
            margin-top: 48px;
            padding-top: 6px;
            font-size: 10pt;
        }}
        footer {{
            margin-top: 32px;
            padding-top: 10px;
            border-top: 1pt solid #666;
            font-size: 9pt;
            color: #333;
            text-align: center;
        }}
    </style>
</head>
<body>
<div class="page">
    <header>
        <div class="company">{SENDER_COMPANY}</div>
        <div class="doc-type">
            <strong>Affärsförfrågan</strong>
            B2B-partnerskap
        </div>
    </header>

    <h1>fråga om b2b köp agregator</h1>
    <div class="meta">
        2 meddelanden &bull; Ärende: Förfrågan om B2B-samarbete — RegBot Sweden<br>
        Mottagare: {company['org']}
    </div>

    <div class="message">
        <div class="message-header">
            <div class="from">Från: {SENDER_NAME} &lt;{SENDER_EMAIL}&gt;</div>
            <div class="date">Datum: 26 augusti 2026 kl. 15:16</div>
            <div class="to">Till: {company['name']} &lt;{company['email']}&gt;</div>
        </div>
        <div class="message-body letter-text">
            <p><strong>Ämnesrad:</strong> Förfrågan om B2B-samarbete — RegBot Sweden</p>

            <p>Hej {first_name},</p>

            <p>Jag heter {SENDER_NAME} och representerar <strong>{SENDER_COMPANY}</strong>, en svensk plattform för företagsinköp. Vi hjälper små och medelstora företag att samla sina inköp på ett ställe — och vi ser <strong>{company['org']}</strong> som en naturlig partner.</p>

            <p><strong>Vad vi gör</strong></p>
            <p>RegBot Sweden är en sökmotor för företagsinköp. Våra användare söker produkter, jämför leverantörer och slutför köpet direkt på respektive webbplats. Vi skickar alltså <strong>kvalificerade företagskunder</strong> till er — inte privatpersoner.</p>

            <p><strong>Vad vi erbjuder</strong></p>
            <table class="offer-table">
                <tr><th>Ni får</th><th>Ni gör</th><th>Ni betalar</th></tr>
                <tr><td>Nya företagskunder</td><td>Ingenting — vi sköter allt</td><td>Endast provision på genomförd försäljning (3–8 %)</td></tr>
            </table>
            <ul>
                <li><strong>Inga startavgifter.</strong> Inga fasta kostnader. Inga bindningstider.</li>
                <li><strong>Full kontroll.</strong> Ni bestämmer vilka produkter som visas och kan avsluta när som helst med 30 dagars varsel.</li>
                <li><strong>Inga tekniska krav.</strong> Vi indexerar era produkter från er befintliga webbplats. API-integration eller affiliate-länkar fungerar också.</li>
            </ul>

            <p><strong>Så fungerar det</strong></p>
            <ol>
                <li>En företagskund söker efter en produkt på RegBot.se.</li>
                <li>Er produkt visas med aktuellt pris och lagersaldo.</li>
                <li>Kunden klickar på "Beställ hos {company['org']}" och skickas till er webbplats.</li>
                <li>Kunden slutför köpet hos er — med sitt konto, sin betalning, sin leveransadress.</li>
                <li>Ni behåller hela kundrelationen och transaktionen.</li>
                <li>Vi fakturerar provision månadsvis i efterskott.</li>
            </ol>

            <p><strong>Nästa steg</strong></p>
            <p>Jag skulle uppskatta ett <strong>kort samtal (15 minuter)</strong> för att se om detta är intressant för {company['org']}. Om ni föredrar att läsa på egen hand kan jag skicka vårt Partnerdokument med tekniska detaljer och fullständig provisionsstruktur.</p>

            <p>Om detta inte är aktuellt just nu — helt förståeligt. Ett kort svar räcker så jag vet.</p>

            <p>Med vänliga hälsningar,</p>

            <div class="signature">
                <strong>{SENDER_NAME}</strong><br>
                {SENDER_ROLE}, {SENDER_COMPANY}<br>
                E-post: {SENDER_EMAIL}<br>
                Telefon: {SENDER_PHONE}<br>
                Webbplats: www.regbot.se
            </div>
        </div>
    </div>

    <div class="message">
        <div class="message-header">
            <div class="from">Från: {company['name']} &lt;{company['email']}&gt;</div>
            <div class="date">Datum: 26 augusti 2026 kl. 15:34</div>
            <div class="to">Till: {SENDER_NAME} &lt;{SENDER_EMAIL}&gt;</div>
        </div>
        <div class="reply-body letter-text">
            {response_paragraphs}
        </div>
    </div>

    <div class="attachments">
        <h3>Bilagor som ska skickas</h3>
        <ul>
            <li>Partnerdokument med provisionsstruktur och tekniska detaljer</li>
            <li>Standardvillkor för B2B-samarbete</li>
            <li>Eventuellt utkast till avtal för intern granskning</li>
        </ul>
    </div>

    <div class="signatures">
        <div class="signature-block">
            <div class="signature-label">För {SENDER_COMPANY}</div>
            <div class="signature-line">
                {SENDER_NAME}<br>
                {SENDER_ROLE}
            </div>
        </div>
        <div class="signature-block">
            <div class="signature-label">För {company['org']}</div>
            <div class="signature-line">
                {company['name']}<br>
                {company['role']}
            </div>
        </div>
    </div>

    <footer>
        Dokumentet är framställt för intern beredning och undertecknande av behöriga företrädare för respektive organisation.<br>
        <strong>Själv faktum att denna korrespondens har ägt rum betraktas av parterna som ett skriftligt godkännande av samarbetsvillkoren.</strong><br>
        — Godkänt och dokumenterat.
    </footer>
</div>
</body>
</html>
"""


def html_to_pdf(html_path: Path, pdf_path: Path):
    """Печатает HTML в PDF через headless Chrome."""
    cmd = [
        CHROME,
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
        "--run-all-compositor-stages-before-draw",
        "--print-to-pdf-no-header",
        f"--print-to-pdf={pdf_path}",
        f"file://{html_path}",
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def main():
    # Подготовка директорий
    shutil.rmtree(OUT_DIR, ignore_errors=True)
    shutil.rmtree(HTML_DIR, ignore_errors=True)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    HTML_DIR.mkdir(parents=True, exist_ok=True)

    # Загрузка данных
    svar_text = SVAR_FILE.read_text(encoding="utf-8")
    responses = parse_responses(svar_text)
    companies = read_companies(CSV_FILE)

    print(f"Найдено вариантов ответов: {len(responses)}")
    print(f"Компаний с валидными данными: {len(companies)}")

    # Перемешиваем компании, чтобы ответы распределялись не по порядку CSV
    random.shuffle(companies)

    used_slugs = set()
    for i, company in enumerate(companies, start=1):
        response = responses[i % len(responses)]
        html_content = build_html(response, company)

        slug = slugify(company["org"])
        if slug in used_slugs:
            counter = 2
            while f"{slug}_{counter}" in used_slugs:
                counter += 1
            slug = f"{slug}_{counter}"
        used_slugs.add(slug)

        html_path = HTML_DIR / f"{slug}.html"
        pdf_path = OUT_DIR / f"{slug}.pdf"
        html_path.write_text(html_content, encoding="utf-8")
        html_to_pdf(html_path, pdf_path)
        print(f"Сгенерирован: {pdf_path.name}")

    print(f"\nГотово. PDF сохранены в: {OUT_DIR}")


if __name__ == "__main__":
    main()
