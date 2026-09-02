#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Flask-app för personbevis-generatorn.

Kör:    .venv/bin/python app.py     (eller ./starta.sh)
Öppna:  http://127.0.0.1:5001

GET /            -> verktyget (generator.html)
GET /fetch?url=  -> hämtar en webbsida server-side (ingen CORS i webbläsaren).
                    Vanliga sidor hämtas med requests; skyddade sidor körs via
                    headless Chromium (Playwright). För merinfo.se loggas in med
                    uppgifterna i login.json (committas aldrig, se .gitignore);
                    sessionen sparas i session.json för återanvändning.
"""
import html as htmlmod
import json
import pathlib
import re

import requests
from flask import Flask, jsonify, request, send_file

HERE = pathlib.Path(__file__).parent
LOGIN_FILE = HERE / 'login.json'       # {"email": ..., "password": ...} — lokal, gitignored
SESSION_FILE = HERE / 'session.json'   # Playwright-cookies — lokal, gitignored
MERINFO_LOGIN = 'https://www.merinfo.se/user/login?return=https%3A%2F%2Fwww.merinfo.se'
# Inloggning mot merinfo är parkerad tills vidare (formuläret går inte att
# automatisera pålitligt). Sätt till True för att återuppta — uppgifterna
# ligger kvar i login.json (gitignored).
MERINFO_LOGIN_ENABLED = False

app = Flask(__name__)

UA = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
                  '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Accept-Language': 'sv-SE,sv;q=0.9,en;q=0.8',
}
CHALLENGE_RE = re.compile(r'just a moment|checking your browser|cf-chl|attention required', re.I)


def html_to_text(doc):
    """Plockar ut synlig text ur HTML, med radbrytningar bevarade för block-element."""
    doc = re.sub(r'(?is)<(script|style|noscript)[^>]*>.*?</\1>', ' ', doc)
    doc = re.sub(r'(?i)<\s*(br|/div|/p|/tr|/li|/h[1-6]|/td|/th|/section|/article)[^>]*>', '\n', doc)
    doc = re.sub(r'(?s)<[^>]+>', ' ', doc)
    doc = htmlmod.unescape(doc)
    lines = [re.sub(r'\s+', ' ', line).strip() for line in doc.split('\n')]
    return '\n'.join(line for line in lines if line)


def fetch_requests(url):
    """Snabb väg: vanlig HTTP-hämtning med webbläsarens headers."""
    r = requests.get(url, headers=UA, timeout=15)
    if r.status_code != 200 or CHALLENGE_RE.search(r.text):
        return ''
    return html_to_text(r.text)


def load_login():
    try:
        data = json.loads(LOGIN_FILE.read_text(encoding='utf-8'))
        if data.get('email') and data.get('password'):
            return data
    except Exception:
        pass
    return None


def wait_out_challenge(page, rounds=12):
    for _ in range(rounds):
        try:
            if not CHALLENGE_RE.search(page.content()):
                return
        except Exception:
            pass
        page.wait_for_timeout(1500)


def logged_in(page):
    try:
        if page.query_selector('text=Logga ut') or page.query_selector('text=Mina sidor'):
            return True
        return page.query_selector('a:has-text("Logga in")') is None
    except Exception:
        return False


def dismiss_consent(page):
    """Stänger Quantcast/GDPR-rutan (#qc-cmp2-container). Klick via JS (overlay:n
    blockerar vanliga klick); som sista utväg tas hela rutan bort ur DOM:en."""
    for i in range(12):
        try:
            result = page.evaluate("""
                () => {
                    const c = document.querySelector('#qc-cmp2-container');
                    if (!c) return 'saknas';
                    const accept = c.querySelector('button[mode="primary"]')
                        || [...c.querySelectorAll('button, a, [role="button"]')]
                            .find(b => /godkänn|samtyck|acceptera|accept|agree|jag förstår/i.test(b.innerText || ''));
                    if (accept) { accept.click(); return 'klickad'; }
                    return 'varken knapp eller match';
                }""")
            if result == 'klickad':
                page.wait_for_timeout(1500)
            if result in ('klickad', 'varken knapp eller match'):
                # verifiera att overlay:n är borta, annars ta bort den med våld
                page.evaluate("""
                    () => {
                        document.querySelectorAll('#qc-cmp2-container, .qc-cmp-cleanslate, [class*="qc-cmp"]')
                            .forEach(e => e.remove());
                        document.documentElement.classList.remove('qc-cmp-noscroll');
                        if (document.body) document.body.style.overflow = '';
                    }""")
                return True
            if result == 'saknas' and i >= 8:
                return True  # gav den 8 sekunder på sig att dyka upp
        except Exception:
            pass
        page.wait_for_timeout(1000)
    return False


def merinfo_login(page):
    """Loggar in på merinfo.se via det riktiga formuläret. Sparar sessionen vid lyckat."""
    creds = load_login()
    page.goto(MERINFO_LOGIN, timeout=30000, wait_until='domcontentloaded')
    wait_out_challenge(page)
    dismiss_consent(page)
    email = page.query_selector('input[name="email"], input[type="email"], input[name*="mail" i]')
    pwd = page.query_selector('input[name="password"], input[type="password"]')
    btn = page.query_selector('button[type="submit"], input[type="submit"], button:has-text("Logga in")')
    if not (email and pwd and btn):
        return False
    email.click()
    page.type('input[name="email"]', creds['email'], delay=40)
    pwd.click()
    page.type('input[name="password"]', creds['password'], delay=40)
    # vänta tills Cloudflare Turnstile aktiverat knappen (max ~25 s)
    enabled = False
    for _ in range(25):
        cls = page.get_attribute('button[type="submit"]', 'class') or ''
        if 'disabled' not in cls and page.get_attribute('button[type="submit"]', 'disabled') is None:
            enabled = True
            break
        page.wait_for_timeout(1000)
    if enabled:
        page.click('button[type="submit"]')
    else:
        # klassen kan bara vara CSS — försök klicka via JS ändå
        page.evaluate("document.querySelector('button[type=\"submit\"]').click()")
    page.wait_for_timeout(6000)
    wait_out_challenge(page)
    if logged_in(page):
        page.context.storage_state(path=str(SESSION_FILE))
        return True
    return False


def fetch_playwright(url):
    """Långsam väg: riktig headless Chromium — klarar enklare Cloudflare-utmaningar
    och loggar in på merinfo.se om uppgifter finns. Returnerar (text, inloggad)."""
    from playwright.sync_api import sync_playwright
    did_login = False
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, args=['--disable-blink-features=AutomationControlled'])
        try:
            kwargs = dict(user_agent=UA['User-Agent'], locale='sv-SE')
            if SESSION_FILE.exists():
                kwargs['storage_state'] = str(SESSION_FILE)
            context = browser.new_context(**kwargs)
            page = context.new_page()
            page.goto(url, timeout=30000, wait_until='domcontentloaded')
            wait_out_challenge(page)
            if MERINFO_LOGIN_ENABLED and 'merinfo.se' in url and load_login() and not logged_in(page):
                if SESSION_FILE.exists():
                    SESSION_FILE.unlink()  # utgången session — logga in på nytt
                did_login = merinfo_login(page)
                # alltid tillbaka till målsidan, även om inloggningen misslyckades
                page.goto(url, timeout=30000, wait_until='domcontentloaded')
                wait_out_challenge(page)
            if CHALLENGE_RE.search(page.content()):
                return '', did_login
            return (page.evaluate("document.body ? document.body.innerText : ''") or '').strip(), did_login
        finally:
            browser.close()


@app.get('/')
def index():
    return send_file(HERE / 'generator.html')


@app.get('/fetch')
def fetch():
    url = request.args.get('url', '').strip()
    if not url.startswith(('http://', 'https://')):
        return jsonify(ok=False, error='Ogiltig URL'), 400

    # merinfo maskerar personnummer för anonyma besökare — med aktiv inloggning
    # (MERINFO_LOGIN_ENABLED) går vi direkt på webbläsarvägen eftersom requests
    # annars "lyckas" men bara levererar maskerad text
    if not (MERINFO_LOGIN_ENABLED and 'merinfo.se' in url and load_login()):
        try:
            text = fetch_requests(url)
            if len(text) > 50:
                return jsonify(ok=True, via='server', text=text)
        except Exception:
            pass

    try:
        text, did_login = fetch_playwright(url)
    except ImportError:
        return jsonify(ok=False,
                       error='Sidan är skyddad och Playwright saknas i venv:en. Kopiera texten manuellt.'), 502
    except Exception as e:
        return jsonify(ok=False, error=f'Hämtning misslyckades: {e}'), 502

    if len(text) > 50:
        return jsonify(ok=True, via='webbläsare (inloggad)' if did_login else 'webbläsare', text=text)
    return jsonify(ok=False,
                   error='Sidan är skyddad (Cloudflare) — öppna den själv, kopiera texten och klistra in den.'), 502


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001)
