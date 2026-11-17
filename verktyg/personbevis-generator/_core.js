'use strict';

/* ===== Översättningar — portade ordagrant från generator.py ===== */
const T = {
    sv: {
        tel: 'Telefon', title: 'Personbevis', date: 'Datum', obs: 'OBS!',
        obsTxt: 'Personbevis är endast ett intyg om vad som är registrerat i folkbokföringsdatabasen och kan inte användas som ID-handling.',
        purpose: 'Ändamål', h2: 'Följande uppgifter är registrerade i folkbokföringsdatabasen', mid: '* markerar mellannamn',
        pnr: 'Personnummer', name: 'Namn', addr: 'Bostadsadress', reg: 'Folkbokföring', regdPre: 'Folkbokförd',
        lan: 'Län', kommun: 'Kommun', parish: 'Församling', prev: 'Tidigare folkbokföring de senaste två åren',
        citizen: 'Medborgare i', civil: 'Civilstånd', marriedPre: 'Gift', maiden: 'Namn som ogift',
        birth: 'Födelseort', country: 'Land', migr: 'Flyttning från/till Sverige', frm: 'Från:', to: 'Till:',
        right: 'Uppehållsrätt vid invandring', end: 'SLUT PÅ UTSKRIFT',
        more: 'Ytterligare uppgifter:',
        more1: 'Personbevis visar uppgifter som finns registrerade för en person i folkbokföringsdatabasen hos Skatteverket.',
        more2: 'Personbevis för den som är avregistrerad från folkbokföringen (utvandrad eller avliden) aktualiseras som regel inte och avser därför normalt förhållanden vid tidpunkten för avregistreringen.',
        tn: '', code: 'sv',
        homeY: function (y) { return 'Hemort år ' + y; },
        purposes: {
            Personbevis: 'Adress', pb_anställning: 'Anställning', pb_folkbockföring: 'Utdrag om folkbokföringsuppgifter',
            pb_fonder: 'Fondansökan/Stipendium', pb_hemort: 'Hemortsbevis', pb_id_kort: 'ID-kort', pb_inbjudan: 'Inbjudan',
            pb_pass: 'Pass', pb_studie: 'Studier', pb_yrkesledegimation: 'Yrkeslegitimation'
        }
    },
    en: {
        tel: 'Telephone', title: 'Population registration certificate', date: 'Date', obs: 'NOTE!',
        obsTxt: 'A population registration certificate is only a certificate of what is registered in the population register database and cannot be used as an identity document.',
        purpose: 'Purpose', h2: 'The following information is registered in the population register database', mid: '* indicates middle name',
        pnr: 'Personal identity number', name: 'Name', addr: 'Residential address', reg: 'Population registration', regdPre: 'Registered',
        lan: 'County', kommun: 'Municipality', parish: 'Parish', prev: 'Previous population registration in the last two years',
        citizen: 'Citizen of', civil: 'Marital status', marriedPre: 'Married', maiden: 'Name when unmarried',
        birth: 'Place of birth', country: 'Country', migr: 'Migration from/to Sweden', frm: 'From:', to: 'To:',
        right: 'Right of residence at immigration', end: 'END OF PRINTOUT',
        more: 'Additional information:',
        more1: 'A population registration certificate shows the information registered for a person in the population register database at the Swedish Tax Agency (Skatteverket).',
        more2: 'A population registration certificate for a person who has been deregistered from the population register (emigrated or deceased) is as a rule not updated and therefore normally refers to the circumstances at the time of deregistration.',
        tn: 'Translation from Swedish / Översättning från svenska', code: 'en',
        homeY: function (y) { return 'Domicile year ' + y; },
        purposes: {
            Personbevis: 'Address', pb_anställning: 'Employment', pb_folkbockföring: 'Extract of population registration data',
            pb_fonder: 'Fund application/Scholarship', pb_hemort: 'Certificate of domicile', pb_id_kort: 'ID card', pb_inbjudan: 'Invitation',
            pb_pass: 'Passport', pb_studie: 'Studies', pb_yrkesledegimation: 'Professional licence'
        }
    },
    ga: {
        tel: 'Teileafón', title: 'Deimhniú clárúcháin daonra', date: 'Dáta', obs: 'AIRE!',
        obsTxt: 'Níl sa deimhniú clárúcháin daonra ach teastas ar a bhfuil cláraithe i mbunachar sonraí chlár an daonra agus ní féidir é a úsáid mar dhoiciméad aitheantais.',
        purpose: 'Cuspóir', h2: 'Tá na sonraí seo a leanas cláraithe i mbunachar sonraí chlár an daonra', mid: '* léiríonn sé an lárainm',
        pnr: 'Uimhir phearsanta', name: 'Ainm', addr: 'Seoladh cónaithe', reg: 'Clárú daonra', regdPre: 'Cláraithe',
        lan: 'Contae', kommun: 'Bardas', parish: 'Paróiste', prev: 'Clárú daonra roimhe seo le dhá bhliain anuas',
        citizen: 'Saoránach de', civil: 'Stádas sibhialta', marriedPre: 'Pósta', maiden: 'Ainm neamhphósta',
        birth: 'Áit bhreithe', country: 'Tír', migr: 'Imirce ó/go dtí an tSualainn', frm: 'Ó:', to: 'Go:',
        right: 'Ceart cónaithe tráth na hinimirce', end: 'DEIREADH AN ASPHRIONTA',
        more: 'Faisnéis bhreise:',
        more1: 'Taispeánann an deimhniú clárúcháin daonra na sonraí atá cláraithe do dhuine i mbunachar sonraí chlár an daonra ag Skatteverket.',
        more2: 'De ghnáth ní nuashonraítear deimhniú clárúcháin daonra do dhuine atá díchláraithe ó chlár an daonra (ar eisimirce nó básaithe) agus dá bhrí sin is gnách go mbaineann sé leis na cúinsí tráth an díchláraithe.',
        tn: 'Aistriúchán ón tSualainnis / Översättning från svenska', code: 'ga',
        homeY: function (y) { return 'Áit chónaithe sa bhliain ' + y; },
        purposes: {
            Personbevis: 'Seoladh', pb_anställning: 'Fostaíocht', pb_folkbockföring: 'Sliocht as sonraí chlár an daonra',
            pb_fonder: 'Iarratas ar chiste/Scoláireacht', pb_hemort: 'Deimhniú áite cónaithe', pb_id_kort: 'Cárta aitheantais',
            pb_inbjudan: 'Cuireadh', pb_pass: 'Pas', pb_studie: 'Staidéar', pb_yrkesledegimation: 'Ceadúnas gairmiúil'
        }
    }
};

/* Dokumentets CSS — exakt samma som i de genererade filerna (från TEMPLATE i generator.py) */
const DOC_CSS = `@page { size: A4; margin: 0; }
html,body { margin:0; padding:0; background:#fff; color:#000; }
.pb-page, body.pb-print-root { width:210mm; height:297mm; position:relative; font-family: Arial, Helvetica, sans-serif; font-size:9pt; background:#fff; color:#000; overflow:hidden; }
.mono { font-family: "Courier New", Courier, monospace; font-size:9.5pt; white-space:pre; line-height:1.45; }
.logo { position:absolute; left:15mm; top:6mm; width:45mm; }
.tel { position:absolute; left:15mm; top:16.5mm; }
.title { position:absolute; left:105mm; top:11mm; font-weight:bold; font-size:14pt; }
.date-l { position:absolute; left:105mm; top:17.5mm; font-size:7pt; }
.date { position:absolute; left:105mm; top:20mm; }
.obs { position:absolute; left:15mm; top:22mm; width:58mm; border:1px solid #000; border-radius:3px; padding:1.5mm 2mm; font-size:7.5pt; line-height:1.35; }
.obs b { display:block; }
.purpose { position:absolute; left:15mm; top:48mm; }
.purpose b { font-size:10.5pt; margin-right:2mm; }
.h2 { position:absolute; left:15mm; top:58mm; font-weight:bold; font-size:10.5pt; }
.h2 small { display:block; font-weight:normal; font-size:6.5pt; margin-top:0.5mm; }
.body { position:absolute; left:15mm; top:68mm; right:15mm; }
.side { position:absolute; left:5mm; top:196mm; transform:rotate(-90deg); transform-origin:left top; font-size:7pt; letter-spacing:0.3px; white-space:pre; }
.more { position:absolute; left:15mm; right:15mm; top:232mm; border:1px solid #000; border-radius:3px; padding:2mm 2.5mm; font-size:7pt; line-height:1.5; display:flex; }
.more > div { flex:1; }
.more > div + div { border-left:1px solid #000; padding-left:2.5mm; margin-left:2.5mm; }
.more b { display:block; }
.web { position:absolute; left:15mm; top:270mm; font-weight:bold; font-size:8.5pt; }
.tn { position:absolute; right:15mm; top:6mm; font-size:6.5pt; color:#555; font-style:italic; }
@media print { .tn { color:#555; } }
`;

const LOGO = window.PB_LOGO || 'skatteverket_logo.png';

/* Standardperson = samma data som i de befintliga genererade dokumenten */
const DEFAULT_PERSON = {
    pnr: '19880715-7758', name: 'Ahmad Baroudi',
    addr1: 'Köpmansgatan 3 B LGH 1101', addr2: '294 31 Sölvesborg',
    regDate: '2026-03-02', lan: 'Blekinge', kommun: 'Sölvesborg', parish: '---',
    marriageDate: '2023-05-28', maidenName: 'Baroudi',
    prevDate: '2023-10-20', prevKommun: 'Karlshamn', prevParish: '---',
    hemortYear: '2026', hemortLan: '10 Blekinge', hemortKommun: '82 Karlshamn', hemortParish: '---',
    migrFrom: '2016-11-29', date: '2026-08-23',
    citizenship: { sv: 'Syrien', en: 'Syria', ga: 'An tSiria' },
    birthPlace: { sv: 'Damaskus', en: 'Damascus', ga: 'An Damaisc' },
    birthCountry: { sv: 'Syrien', en: 'Syria', ga: 'An tSiria' },
    residenceRight: { sv: 'Nej', en: 'No', ga: 'Níl' },
    civil: 'gift'
};

/* Civilstånd "ogift" per språk (läggs till här så T-speglarna ovan är orörda) */
T.sv.unmarried = 'Ogift';
T.en.unmarried = 'Unmarried';
T.ga.unmarried = 'Neamhphósta';

const DOC_TYPES = ['Personbevis', 'pb_anställning', 'pb_folkbockföring', 'pb_fonder', 'pb_hemort',
    'pb_id_kort', 'pb_inbjudan', 'pb_pass', 'pb_studie', 'pb_yrkesledegimation'];

/* ===== Renderingslogik — trogen port av build_body/TEMPLATE i generator.py ===== */
function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* Löser upp de språkberoende personfälten till strängar för aktivt språk */
function resolvePerson(p, lang) {
    const out = Object.assign({}, p);
    out.citizenship = p.citizenship[lang] || '';
    out.birthPlace = p.birthPlace[lang] || '';
    out.birthCountry = p.birthCountry[lang] || '';
    out.residenceRight = p.residenceRight[lang] || '';
    return out;
}

function buildBody(t, type, p) {
    const keys = ['pnr', 'name', 'addr', 'reg', 'lan', 'kommun', 'citizen', 'civil', 'maiden', 'birth', 'country'];
    let W = 23;
    for (const k of keys) W = Math.max(W, t[k].length + 2);
    const r = (k, v) => String(k).padEnd(W) + escapeHtml(v);
    const base = [r(t.pnr, p.pnr), r(t.name, p.name), '', r(t.addr, p.addr1), r('', p.addr2), '',
        r(t.reg, t.regdPre + ' ' + p.regDate), r(t.lan, p.lan), r(t.kommun, p.kommun)];
    const cit = ['', r(t.citizen, p.citizenship)];
    const birth = ['', r(t.birth, p.birthPlace), r(t.country, p.birthCountry)];
    const migr = ['', t.migr,
        t.frm.padEnd(17) + t.to.padEnd(15) + t.right,
        '---'.padEnd(17) + String(p.migrFrom).padEnd(15) + escapeHtml(p.residenceRight)];
    if (type === 'Personbevis') return base;
    if (type === 'pb_inbjudan') return base.concat(cit, migr);
    if (type === 'pb_hemort') {
        return base.concat(['', t.homeY(p.hemortYear), r(t.lan, p.hemortLan),
            r(t.kommun, p.hemortKommun), r(t.parish, p.hemortParish)]);
    }
    if (type === 'pb_folkbockföring') {
        const civilVal = p.civil === 'ogift' ? t.unmarried
            : (p.marriageDate ? t.marriedPre + ' ' + p.marriageDate : '');
        const civilRows = ['', r(t.civil, civilVal)];
        if (p.civil !== 'ogift') civilRows.push(r(t.maiden, p.maidenName));
        return base.concat(['', t.prev,
            t.date.padEnd(W) + t.kommun.padEnd(23) + t.parish,
            String(p.prevDate).padEnd(W) + String(p.prevKommun).padEnd(23) + escapeHtml(p.prevParish)],
            cit, civilRows, birth, migr);
    }
    return base.concat(cit, birth);
}

/* Hela dokumentet som fristående HTML — byteidentiskt med generator.py:s output */
function buildDocumentHtml(type, lang, person) {
    const t = T[lang];
    const p = resolvePerson(person, lang);
    const purposeVal = t.purposes[type];
    return '<!DOCTYPE html>\n' +
        '<html lang="' + t.code + '"><head><meta charset="utf-8"><title>' + t.title + ' – ' + escapeHtml(purposeVal) + '</title>\n' +
        '<style>\n' + DOC_CSS + '</style></head><body>\n' +
        '<div class="tn">' + t.tn + '</div>\n' +
        '<img class="logo" src="' + LOGO + '" alt="Skatteverket">\n' +
        '<div class="tel mono">' + t.tel + ': 0771-567 567</div>\n' +
        '<div class="title">' + t.title + '</div>\n' +
        '<div class="date-l">' + t.date + '</div>\n' +
        '<div class="date mono">' + p.date + '</div>\n' +
        '<div class="obs"><b>' + t.obs + '</b>' + t.obsTxt + '</div>\n' +
        '<div class="purpose"><b>' + t.purpose + '</b><span class="mono">' + escapeHtml(purposeVal) + '</span></div>\n' +
        '<div class="h2">' + t.h2 + '<small>' + t.mid + '</small></div>\n' +
        '<div class="body mono">' + buildBody(t, type, p).join('\n') + '\n' +
        '-'.repeat(73) + '\n' +
        t.end + '</div>\n' +
        '<div class="side">SKV   7780      09   ' + t.code + '      00     05     1</div>\n' +
        '<div class="more"><div><b>' + t.more + '</b>' + t.more1 + '</div><div>' + t.more2 + '</div></div>\n' +
        '<div class="web">www.skatteverket.se</div>\n' +
        '</body></html>\n';
}

/* ===== Tillstånd + localStorage ===== */
const STORAGE_KEY = 'personbevis-gen-v1';

function defaultState() {
    return { type: 'Personbevis', lang: 'sv', person: JSON.parse(JSON.stringify(DEFAULT_PERSON)) };
}

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultState();
        const s = JSON.parse(raw);
        const d = defaultState();
        const person = Object.assign(d.person, s.person || {});
        for (const k of ['citizenship', 'birthPlace', 'birthCountry', 'residenceRight']) {
            person[k] = Object.assign(d.person[k], (s.person || {})[k] || {});
        }
        return {
            type: DOC_TYPES.indexOf(s.type) !== -1 ? s.type : 'Personbevis',
            lang: T[s.lang] ? s.lang : 'sv',
            person: person
        };
    } catch (e) {
        return defaultState();
    }
}

let state = loadState();

function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        const el = document.getElementById('pb-saved');
        el.classList.add('pb-show');
        setTimeout(() => el.classList.remove('pb-show'), 1200);
    } catch (e) { /* privat läge m.m. — ignorera */ }
}

/* ===== Rendering till sidan ===== */
function renderDoc() {
    const full = buildDocumentHtml(state.type, state.lang, state.person);
    const inner = full.split('<body>')[1].replace(/<\/body>\s*<\/html>\s*$/, '');
    const cssEl = document.getElementById('pb-doc-css');
    if (cssEl) cssEl.textContent = DOC_CSS;
    const host = document.getElementById('pb-doc');
    host.innerHTML = '<div class="pb-page">' + inner + '</div>';
    if (window.pbFitPreview) window.pbFitPreview();
    const btn = document.getElementById('btn-print');
    if (btn) btn.disabled = false;
    const wrap = document.getElementById('preview-wrap');
    if (wrap) wrap.hidden = false;
}

function rebuildTypeSelect() {
    const sel = document.getElementById('pb-type');
    const t = T[state.lang];
    sel.innerHTML = DOC_TYPES.map(dt =>
        '<option value="' + dt + '"' + (dt === state.type ? ' selected' : '') + '>' +
        escapeHtml(t.purposes[dt]) + ' (' + dt.replace('pb_', '').replace(/_/g, ' ') + ')</option>').join('');
}

/* ===== Modal ===== */
const FIELDS = [
    ['pnr', 'Personnummer'], ['name', 'Namn'],
    ['addr1', 'Bostadsadress rad 1'], ['addr2', 'Bostadsadress rad 2'],
    ['regDate', 'Folkbokförd (datum)', 'date'], ['date', 'Utskriftsdatum', 'date'],
    ['lan', 'Län'], ['kommun', 'Kommun'], ['parish', 'Församling'],
    ['marriageDate', 'Gift (datum)', 'date'], ['maidenName', 'Namn som ogift'],
    ['prevDate', 'Tidigare folkbokföring (datum)', 'date'], ['prevKommun', 'Tidigare kommun'], ['prevParish', 'Tidigare församling'],
    ['hemortYear', 'Hemort år'], ['hemortLan', 'Hemort län'], ['hemortKommun', 'Hemort kommun'], ['hemortParish', 'Hemort församling'],
    ['migrFrom', 'Flyttning från (datum)', 'date']
];
const L10N_FIELDS = [
    ['citizenship', 'Medborgare i'], ['birthPlace', 'Födelseort'],
    ['birthCountry', 'Födelseland'], ['residenceRight', 'Uppehållsrätt']
];

function buildModalFields() {
    document.getElementById('pb-fields').innerHTML = FIELDS.map(f =>
        '<label>' + f[1] + '<input type="' + (f[2] || 'text') + '" data-field="' + f[0] + '"></label>').join('');
    let html = '<div></div><div class="pb-l10n-head">SV</div><div class="pb-l10n-head">EN</div><div class="pb-l10n-head">GA</div>';
    for (const f of L10N_FIELDS) {
        html += '<div>' + f[1] + '</div>' + ['sv', 'en', 'ga'].map(l =>
            '<input type="text" data-l10n="' + f[0] + '" data-lang="' + l + '">').join('');
    }
    document.getElementById('pb-l10n').innerHTML = html;

    document.querySelectorAll('[data-field]').forEach(inp => {
        inp.value = state.person[inp.dataset.field] || '';
        inp.addEventListener('input', () => {
            state.person[inp.dataset.field] = inp.value;
            saveState();
        });
    });
    document.querySelectorAll('[data-l10n]').forEach(inp => {
        inp.value = state.person[inp.dataset.l10n][inp.dataset.lang] || '';
        inp.addEventListener('input', () => {
            state.person[inp.dataset.l10n][inp.dataset.lang] = inp.value;
            saveState();
        });
    });
}

function refreshModalValues() {
    document.querySelectorAll('[data-field]').forEach(inp => {
        inp.value = state.person[inp.dataset.field] || '';
    });
    document.querySelectorAll('[data-l10n]').forEach(inp => {
        inp.value = state.person[inp.dataset.l10n][inp.dataset.lang] || '';
    });
}

function openModal() {
    const bd = document.getElementById('pb-backdrop');
    bd.classList.remove('pb-hidden');
    bd.style.display = 'block';
    if (typeof refreshModalValues === 'function') refreshModalValues();
}
function closeModal() {
    const bd = document.getElementById('pb-backdrop');
    bd.classList.add('pb-hidden');
    bd.style.display = 'none';
}

/* ===== Klistra in-parser ===== */
const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, maj: 5, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, okt: 10, oct: 10, nov: 11, dec: 12 };
const NATIONALITIES = [
    [/svensk|swedish/i, { sv: 'Sverige', en: 'Sweden', ga: 'An tSualainn' }],
    [/syrisk|syrian|syrien|syria/i, { sv: 'Syrien', en: 'Syria', ga: 'An tSiria' }]
];

/* VERSALER -> Versaler per ord ("ABRAO EREMAR" -> "Abrao Eremar") */
function titleCase(s) {
    return s.replace(/[\p{L}\p{M}]+/gu, w =>
        w.length > 1 && w === w.toUpperCase() ? w[0] + w.slice(1).toLowerCase() : w);
}

/* Värde efter en etikett — på samma rad, annars nästa rad (pass-/ID-format) */
function nextLineValue(lines, labelRe) {
    for (let i = 0; i < lines.length; i++) {
        if (labelRe.test(lines[i])) {
            const rest = lines[i].replace(labelRe, '')
                .replace(/^\d+[a-z]?\.\s*/, '')
                .replace(/^[:\s/]+/, '')
                .replace(/(surname|given names?|nationality|personal id.*|date of birth|place of birth)/i, '')
                .replace(/^[:\s/]+/, '')
                .trim();
            if (rest && !/:$/.test(rest)) return rest;
            for (let j = i + 1; j < lines.length; j++) {
                if (lines[j]) return lines[j];
            }
        }
    }
    return '';
}

function parseBirthDate(raw) {
    let m = raw.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m) return m[1] + '-' + m[2] + '-' + m[3];
    m = raw.match(/(\d{1,2})\s+([A-Za-z]{3})\D+(\d{2,4})(?!\d)/);
    if (m) {
        const mon = MONTHS[m[2].toLowerCase()];
        if (mon) {
            let y = parseInt(m[3], 10);
            if (y < 100) y += (y <= new Date().getFullYear() % 100) ? 2000 : 1900;
            return y + '-' + String(mon).padStart(2, '0') + '-' + m[1].padStart(2, '0');
        }
    }
    return '';
}

/* Århundrade för kort personnummer: från födelseår om känt, annars +/- och dagens år */
function expandPnr(yy, sep, dobYear) {
    let century;
    if (dobYear) {
        century = Math.floor(dobYear / 100) * 100;
        if (yy > dobYear % 100) century -= 100;
    } else {
        century = yy <= new Date().getFullYear() % 100 ? 2000 : 1900;
    }
    if (sep === '+') century -= 100;
    return century + yy;
}

/* Inklistrad HTML (sidkälla, DevTools-kopia m.m.) -> text. Block-taggar blir
   radbrytningar, så t.ex. <dt>Kommun</dt><dd>Huddinge kommun (0126)</dd>
   blir etikett- och värderader som parsern redan förstår. */
function htmlToText(html) {
    let t = String(html);
    t = t.replace(/<(script|style|noscript|svg|button)[\s\S]*?<\/\1>/gi, ' ');
    t = t.replace(/<(?:br|\/div|\/p|\/li|\/tr|\/dt|\/dd|\/dl|\/section|\/h[1-6]|\/td|\/th)[^>]*>/gi, '\n');
    t = t.replace(/<[^>]+>/g, ' ');
    t = t.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
         .replace(/&gt;/g, '>').replace(/&quot;/g, '"')
         .replace(/&#(\d+);/g, (m, n) => String.fromCharCode(Number(n)));
    return t.split('\n').map(l => l.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n');
}

function parsePersonText(text) {
    if (/<[a-z][^>]*>/i.test(text)) text = htmlToText(text);
    const found = [];
    const p = state.person;
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    /* Födelsedatum — används bara för århundradet i korta personnummer */
    const dobRaw = nextLineValue(lines, /födelsedatum|date of birth|född|born/i);
    const dob = dobRaw ? parseBirthDate(dobRaw) : '';
    const dobYear = dob ? parseInt(dob.slice(0, 4), 10) : 0;

    /* Personnummer — 12 siffror, YYYYMMDD-XXXX, eller YYMMDD-XXXX */
    let pnr = text.match(/(\d{8})\s*([-+ ]?)\s*(\d{4})/) || text.match(/(?:^|\D)(\d{12})(?:\D|$)/);
    if (pnr) {
        if (pnr[1].length === 12) {
            p.pnr = pnr[1].slice(0, 8) + '-' + pnr[1].slice(8);
        } else {
            p.pnr = pnr[1] + '-' + pnr[3];
        }
        found.push('personnummer');
    } else {
        pnr = text.match(/(\d{6})\s*([-+ ])\s*(\d{4})/);
        if (pnr) {
            let full = String(expandPnr(parseInt(pnr[1].slice(0, 2), 10), pnr[2], dobYear)) + pnr[1].slice(2);
            p.pnr = full + '-' + pnr[3];
            found.push('personnummer');
        }
    }

    const regd = text.match(/(?:Folkbokförd|Registered|Cláraithe)[:\s]*(\d{4}-\d{2}-\d{2})/i);
    if (regd) { p.regDate = regd[1]; found.push('folkbokförd-datum'); }

    const married = text.match(/(?<![oO])Gift[:\s]*(\d{4}-\d{2}-\d{2})|(?:Married|Pósta)[:\s]*(\d{4}-\d{2}-\d{2})/i);
    if (married) { p.marriageDate = married[1] || married[2]; found.push('civilstånd-datum'); }

    /* Civilstatus — "Ogift" (då döljs gift-datum och namn som ogift i dokumentet) */
    const civil = nextLineValue(lines, /civilstatus|civilstånd|marital status|stádas sibhialta/i);
    if (civil) {
        if (/ogift|unmarried|neamhphósta/i.test(civil)) {
            p.civil = 'ogift';
            p.marriageDate = '';
            p.maidenName = '';
        } else if (/gift|married|pósta/i.test(civil)) {
            p.civil = 'gift';
        }
        found.push('civilstatus');
    }

    /* Namn — Personnamn-rad, delat (Förnamn/Efternamn), Namn:-rad, annars heuristik */
    const fullName = nextLineValue(lines, /personnamn/i);
    const sur = fullName ? '' : nextLineValue(lines, /efternamn|surname/i);
    const given = fullName ? '' : nextLineValue(lines, /förnamn|given names?/i);
    if (fullName) {
        p.name = titleCase(fullName);
        found.push('namn');
    } else if (sur || given) {
        p.name = titleCase((given + ' ' + sur).trim());
        found.push('namn');
    } else {
        const namedLine = text.match(/(?:Namn|Name|Ainm)[:\s]+([A-ZÅÄÖ][^\n]+)/);
        if (namedLine) {
            p.name = namedLine[1].trim();
            found.push('namn');
        } else {
            for (const l of lines.slice(0, 25)) {
                if (/^[A-ZÅÄÖ][\p{L}\p{M}'-]+( [A-ZÅÄÖ][\p{L}\p{M}'-]+)+$/u.test(l) && !/\d/.test(l)) {
                    p.name = l;
                    found.push('namn');
                    break;
                }
            }
        }
    }

    /* Nationalitet -> Medborgare i (mappa landet per språk) */
    const nat = nextLineValue(lines, /nationalitet|nationality|medborgarskap|citizenship/i);
    if (nat) {
        let mapped = null;
        for (const pair of NATIONALITIES) {
            if (pair[0].test(nat)) { mapped = pair[1]; break; }
        }
        if (!mapped) {
            const v = titleCase(nat);
            mapped = { sv: v, en: v, ga: v };
        }
        p.citizenship = mapped;
        found.push('nationalitet');
    }

    /* Födelseort */
    const pob = nextLineValue(lines, /födelseort|place of birth/i);
    if (pob) {
        const v = titleCase(pob);
        p.birthPlace = { sv: v, en: v, ga: v };
        found.push('födelseort');
    }

    /* Adress — etiketter (merinfo: Gatuadress/Postnummer/Postort), annars regex-fallback */
    const gata = nextLineValue(lines, /gatuadress|street address/i);
    const postnr = nextLineValue(lines, /postnummer|postal code|postcode/i);
    const postort = nextLineValue(lines, /postort/i);
    if (gata) { p.addr1 = gata; found.push('gatuadress'); }
    if (postnr || postort) {
        p.addr2 = (postnr + ' ' + postort).trim();
        found.push('postadress');
    } else {
        for (let i = 0; i < lines.length; i++) {
            const m = lines[i].match(/^(\d{3})\s?(\d{2})\s+([A-ZÅÄÖ][\p{L}\p{M}' -]+)$/u);
            if (m) {
                p.addr2 = m[1] + ' ' + m[2] + ' ' + m[3].trim();
                found.push('postadress');
                if (i > 0 && !gata) { p.addr1 = lines[i - 1]; found.push('gatuadress'); }
                break;
            }
        }
    }

    /* Kommun/län — t.ex. merinfos "Huddinge kommun (0126)" / "Stockholms län (01)" */
    const kommunM = text.match(/([A-ZÅÄÖ][\p{L}\p{M}' -]+?) kommun\s*\((\d{4})\)/u);
    if (kommunM) {
        p.kommun = kommunM[1].trim();
        p.hemortKommun = kommunM[2].slice(2) + ' ' + p.kommun;
        found.push('kommun');
    }
    const lanM = text.match(/([A-ZÅÄÖ][\p{L}\p{M}' -]+?) län\s*\((\d{2})\)/u);
    if (lanM) {
        p.lan = lanM[1].trim().replace(/s$/, '');
        p.hemortLan = lanM[2] + ' ' + p.lan;
        found.push('län');
    }

    return found;
}

function showParseStatus(found) {
    const el = document.getElementById('pb-parse-status');
    if (found.length) {
        el.className = 'pb-status pb-ok';
        el.textContent = 'Hittade: ' + found.join(', ') + ' — kontrollera fälten nedan.';
    } else {
        el.className = 'pb-status pb-err';
        el.textContent = 'Hittade inga uppgifter att tolka.';
    }
}

/* Tom person — utgångsläge vid ny tolkning, så inga uppgifter från
   förra personen (t.ex. standardpersonens) blandas in */
function emptyPerson() {
    return {
        pnr: '', name: '', addr1: '', addr2: '',
        regDate: '', lan: '', kommun: '', parish: '---',
        marriageDate: '', maidenName: '', civil: '',
        prevDate: '', prevKommun: '', prevParish: '---',
        hemortYear: String(new Date().getFullYear()), hemortLan: '', hemortKommun: '', hemortParish: '---',
        migrFrom: '', date: new Date().toISOString().slice(0, 10),
        citizenship: { sv: '', en: '', ga: '' }, birthPlace: { sv: '', en: '', ga: '' },
        birthCountry: { sv: '', en: '', ga: '' },
        residenceRight: { sv: 'Nej', en: 'No', ga: 'Níl' }
    };
}

function runParser(text) {
    const before = state.person;
    state.person = emptyPerson();
    const found = parsePersonText(text);
    if (!found.length) state.person = before; /* inget hittades — behåll det gamla */
    refreshModalValues();
    saveState();
    showParseStatus(found);
}

/* ===== URL-import =====
   Körs verktyget via Flask-appen (starta.sh) går hämtningen via servern,
   som även klarar enklare Cloudflare-skydd (headless Chromium).
   Annars: direktförsök + offentliga CORS-proxies. Sista utväg: klistra in text. */
const PROXIES = [
    u => 'https://corsproxy.io/?url=' + encodeURIComponent(u),
    u => 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u),
    u => 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(u)
];

function looksLikeChallenge(html) {
    return /just a moment|checking your browser|cf-chl|attention required|cloudflare/i.test(html);
}

async function fetchAndParse() {
    const url = document.getElementById('pb-url').value.trim();
    const status = document.getElementById('pb-fetch-status');
    if (!url) {
        status.className = 'pb-status pb-err';
        status.textContent = 'Ange en URL först.';
        return;
    }
    const attempts = [];
    if (location.protocol.indexOf('http') === 0) {
        attempts.push({ wrap: u => '/fetch?url=' + encodeURIComponent(u), json: true, label: 'servern' });
    }
    attempts.push({ wrap: u => u, json: false, label: 'direkt anslutning' });
    PROXIES.forEach((px, i) => attempts.push({ wrap: px, json: false, label: 'proxy ' + (i + 1) }));
    let blocked = false;
    for (const att of attempts) {
        status.className = 'pb-status';
        status.textContent = 'Hämtar via ' + att.label + '…';
        try {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 45000); /* servern kan köra headless Chromium */
            const res = await fetch(att.wrap(url), { signal: ctrl.signal });
            clearTimeout(timer);
            let text;
            if (att.json) {
                const data = await res.json();
                if (!data.ok) {
                    if (/skyddad/i.test(data.error || '')) blocked = true;
                    throw new Error(data.error || 'fel');
                }
                text = String(data.text || '').trim();
            } else {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                const htmlText = await res.text();
                if (looksLikeChallenge(htmlText)) { blocked = true; throw new Error('skyddad sida'); }
                const doc = new DOMParser().parseFromString(htmlText, 'text/html');
                text = doc.body ? doc.body.innerText.trim() : '';
            }
            if (text.length < 50) throw new Error('tomt svar');
            document.getElementById('pb-paste').value = text;
            status.className = 'pb-status pb-ok';
            status.textContent = 'Hämtat — tolkar texten…';
            runParser(text);
            return;
        } catch (e) { /* prova nästa väg */ }
    }
    status.className = 'pb-status pb-err';
    status.textContent = blocked
        ? 'Sidan är skyddad (Cloudflare) och kan inte hämtas automatiskt. Öppna sidan själv, markera allt (Cmd+A), kopiera (Cmd+C) och klistra in i rutan ovan.'
        : 'Kunde inte hämta sidan. Öppna den själv, markera allt (Cmd+A), kopiera (Cmd+C) och klistra in i rutan ovan.';
}

/* ===== Init ===== */
function init() {
    document.getElementById('pb-doc-css').textContent = DOC_CSS;

    buildModalFields();
    rebuildTypeSelect();
    document.getElementById('pb-lang').value = state.lang;

    document.getElementById('pb-type').addEventListener('change', e => {
        state.type = e.target.value;
        saveState();
        renderDoc();
    });
    document.getElementById('pb-lang').addEventListener('change', e => {
        state.lang = e.target.value;
        saveState();
        rebuildTypeSelect();
        renderDoc();
    });
    document.getElementById('pb-open').addEventListener('click', openModal);
    document.getElementById('pb-apply').addEventListener('click', () => {
        closeModal();
        rebuildTypeSelect();
        renderDoc();
    });
    document.getElementById('pb-print').addEventListener('click', () => window.pbPrintBlankett && window.pbPrintBlankett());
    document.getElementById('pb-clear').addEventListener('click', () => {
        state.person = emptyPerson();
        refreshModalValues();
        saveState();
    });
    document.getElementById('pb-parse').addEventListener('click', () => {
        runParser(document.getElementById('pb-paste').value);
    });
    document.getElementById('pb-fetch').addEventListener('click', fetchAndParse);
    document.getElementById('pb-paste').addEventListener('paste', () => {
        setTimeout(() => runParser(document.getElementById('pb-paste').value), 0);
    });

    renderDoc();
}

init();
window.pbRunParser = runParser;
window.pbRenderDoc = renderDoc;


window.pbBuildDocumentHtml = buildDocumentHtml;
window.pbGetState = () => state;
window.pbDOC_CSS = DOC_CSS;
