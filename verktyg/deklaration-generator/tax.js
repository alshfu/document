/**
 * Inkomstdeklaration 1 — tax engine for income year 2025 (deklaration 2026).
 * Rules aligned with verktyg/Inkomstdeklaration_calculator.js / Skatteverket.
 */
(function (global) {
  'use strict';

  var AR2025 = {
    PBB: 58800,
    IBB: 80600,
    SKIKTGRANS: 625800,
    STATLIG_SATS: 0.20,
    PENSION_SATS: 0.07,
    PENSION_TAK_IBB: 8.07,
    PS_MAX: 1249,
    PS_SATS: 0.01,
    RANTA_ANDEL: 0.5,
    KAPITAL_RED: 0.30,
    KAPITAL_RED_OVER: 0.21,
    AKASSA_RED: 0.25,
    FORV_RED_MAX: 1500,
    FORV_RED_GOLV: 40000,
    FORV_RED_SATS: 0.0075
  };

  var KOMMUNER = {
    stockholm: { namn: 'Stockholm', kommunalSats: 30.60, begravningSats: 0.07 },
    botkyrka:  { namn: 'Botkyrka',  kommunalSats: 32.18, begravningSats: 0.25 },
    nacka:     { namn: 'Nacka',     kommunalSats: 30.26, begravningSats: 0.293 },
    jarfalla:  { namn: 'Järfälla',  kommunalSats: 31.48, begravningSats: 0.22 }
  };

  function nedat100(x)  { return Math.floor(x / 100) * 100; }
  function uppat100(x)  { return Math.ceil(x / 100) * 100; }
  function narmast100(x) {
    var r = x % 100;
    return r > 50 ? x - r + 100 : x - r;
  }

  function grundavdrag(ffi) {
    var p = AR2025.PBB, k = ffi / p, ga;
    if      (k <= 0.99) ga = 0.423 * p;
    else if (k <= 2.72) ga = 0.423 * p + 0.20 * (ffi - 0.99 * p);
    else if (k <= 3.11) ga = 0.77 * p;
    else if (k <= 7.88) ga = 0.77 * p - 0.10 * (ffi - 3.11 * p);
    else                ga = 0.293 * p;
    return Math.min(uppat100(ga), ffi);
  }

  function jobbskatteavdrag(ai, ga, ks) {
    ai = nedat100(ai);
    if (ai <= 0) return 0;
    var p = AR2025.PBB, u;
    if      (ai <= 0.91 * p) u = ai;
    else if (ai <= 3.24 * p) u = 0.91 * p + 0.3874 * (ai - 0.91 * p);
    else if (ai <= 8.08 * p) u = 1.813 * p + 0.199 * (ai - 3.24 * p);
    else                     u = 2.776 * p;
    return Math.max(0, Math.floor((u - ga) * ks / 100));
  }

  function skattePost(inkomst, ai, s) {
    var t = {};
    t.ffi = nedat100(inkomst);
    t.grundavdrag = grundavdrag(t.ffi);
    t.bfi = t.ffi - t.grundavdrag;
    t.kommunal = Math.floor(t.bfi * s.kommunalSats / 100);
    t.statlig  = Math.floor(Math.max(0, t.bfi - AR2025.SKIKTGRANS) * AR2025.STATLIG_SATS);
    var pensionUnderlag = Math.min(t.ffi, nedat100(AR2025.PENSION_TAK_IBB * AR2025.IBB));
    t.pension = narmast100(pensionUnderlag * AR2025.PENSION_SATS);
    t.begravning = Math.floor(t.bfi * s.begravningSats / 100);
    t.publicservice = Math.min(AR2025.PS_MAX, Math.floor(t.bfi * AR2025.PS_SATS));
    t.summaSkatt = t.kommunal + t.statlig + t.pension + t.begravning + t.publicservice;
    t.redPension = t.pension;
    t.jobbskatteavdrag = Math.min(
      jobbskatteavdrag(ai, t.grundavdrag, s.kommunalSats), t.kommunal);
    t.redForvarv = Math.min(AR2025.FORV_RED_MAX,
      Math.floor(Math.max(0, t.bfi - AR2025.FORV_RED_GOLV) * AR2025.FORV_RED_SATS));
    return t;
  }

  /** Standard employer withholding (no personal deductions). */
  function standardAvdragen(inkomst, ai, s) {
    var t = skattePost(inkomst, ai, s);
    return Math.max(0, t.summaSkatt - t.redPension - t.jobbskatteavdrag - t.redForvarv);
  }

  /**
   * Full calculation.
   * @param {object} input
   * @param {number} input.inkomst - total employment income
   * @param {string} input.kalla - 'lon' | 'fk' (FK = no jobbskatteavdrag)
   * @param {number} input.kommunalSats
   * @param {number} input.begravningSats
   * @param {number} [input.akassa=0]
   * @param {number} [input.rantor=0] - ränteutgifter lån utan säkerhet (full belopp)
   * @param {number|null} [input.avdragen] - override preliminär skatt; null = auto
   */
  function berakna(input) {
    var inkomst = Math.max(0, Math.round(input.inkomst || 0));
    var ai = input.kalla === 'fk' ? 0 : inkomst;
    var s = {
      kommunalSats: Number(input.kommunalSats),
      begravningSats: Number(input.begravningSats)
    };
    var akassa = Math.max(0, Math.round(input.akassa || 0));
    var rantor = Math.max(0, Math.round(input.rantor || 0));

    var t = skattePost(inkomst, ai, s);
    t.inkomst = inkomst;
    t.ai = ai;
    t.kalla = input.kalla === 'fk' ? 'fk' : 'lon';
    t.utbetalare = t.kalla === 'fk' ? 'FÖRSÄKRINGSKASSAN' : 'ARBETSGIVARE';

    t.ranteavdrag = Math.floor(rantor * AR2025.RANTA_ANDEL);
    t.underskott = t.ranteavdrag;
    t.redUnderskott = t.underskott <= 100000
      ? Math.floor(t.underskott * AR2025.KAPITAL_RED)
      : Math.floor(100000 * AR2025.KAPITAL_RED +
          (t.underskott - 100000) * AR2025.KAPITAL_RED_OVER);
    t.redAkassa = Math.floor(akassa * AR2025.AKASSA_RED);

    t.summaRed = Math.min(
      t.redPension + t.jobbskatteavdrag + t.redForvarv + t.redUnderskott + t.redAkassa,
      t.summaSkatt);
    t.slutlig = t.summaSkatt - t.summaRed;

    t.avdragen = input.avdragen == null
      ? standardAvdragen(inkomst, ai, s)
      : Math.max(0, Math.round(input.avdragen));
    t.diff = t.avdragen - t.slutlig; // >0 get back, <0 pay

    t.kommunalSats = s.kommunalSats;
    t.begravningSats = s.begravningSats;
    t.akassa = akassa;
    t.rantor = rantor;
    return t;
  }

  function fmt(n) {
    n = Math.round(n);
    var s = Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
    return n < 0 ? '-\u00a0' + s : s;
  }
  function fmtNeg(n) { return n === 0 ? '0' : '-\u00a0' + fmt(Math.abs(n)); }
  function fmtSats(x) {
    return Number(x).toFixed(2).replace(/\.?0+$/, '').replace('.', ',');
  }

  function formatPersonnummer(raw) {
    var d = String(raw || '').replace(/\D/g, '');
    if (d.length === 12) return d.slice(0, 8) + '-' + d.slice(8);
    if (d.length === 10) return d.slice(0, 6) + '-' + d.slice(6);
    return String(raw || '').trim();
  }

  function parseAmount(text) {
    var digits = String(text || '').replace(/[^\d]/g, '');
    var n = parseInt(digits, 10);
    return isFinite(n) ? n : null;
  }

  /**
   * Parse paste block:
   *   Name
   *   Personnummer
   *   Address (one or more lines until amount)
   *   Income amount
   */
  function parsePaste(text) {
    var lines = String(text || '').split(/\r?\n/).map(function (l) {
      return l.trim();
    }).filter(Boolean);
    if (lines.length < 4) {
      return { error: 'Minst 4 rader behövs: namn, personnummer, adress, inkomst' };
    }
    var name = lines[0];
    var pnr = formatPersonnummer(lines[1]);
    var amountIdx = -1;
    for (var i = lines.length - 1; i >= 2; i--) {
      if (parseAmount(lines[i]) != null && /\d/.test(lines[i])) {
        amountIdx = i;
        break;
      }
    }
    if (amountIdx < 2) {
      return { error: 'Hittade ingen inkomst (sista raden med belopp)' };
    }
    var inkomst = parseAmount(lines[amountIdx]);
    var addrLines = lines.slice(2, amountIdx);
    if (!addrLines.length) {
      return { error: 'Hittade ingen adress' };
    }
    var address = addrLines.join('\n');
    // Split "Street 12 City" / "Street 12, 123 45 City"
    var street = addrLines[0];
    var city = addrLines.length > 1 ? addrLines.slice(1).join(', ') : '';
    if (addrLines.length === 1) {
      var m = street.match(/^(.+?)\s+(\d{3}\s?\d{2}\s+.+)$/);
      if (m) {
        street = m[1].trim();
        city = m[2].trim();
      } else {
        var m2 = street.match(/^(.+\d)\s+([A-Za-zÅÄÖåäö].*)$/);
        if (m2) {
          street = m2[1].trim();
          city = m2[2].trim();
        }
      }
    }
    return {
      name: name,
      personnummer: pnr,
      street: street,
      city: city,
      addressHtml: street + (city ? '<br>' + city : ''),
      inkomst: inkomst
    };
  }

  global.DeklarationTax = {
    AR2025: AR2025,
    KOMMUNER: KOMMUNER,
    berakna: berakna,
    standardAvdragen: standardAvdragen,
    fmt: fmt,
    fmtNeg: fmtNeg,
    fmtSats: fmtSats,
    formatPersonnummer: formatPersonnummer,
    parseAmount: parseAmount,
    parsePaste: parsePaste
  };
})(typeof window !== 'undefined' ? window : globalThis);
