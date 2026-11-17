(function (global) {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function fmtOrg(raw) {
    var d = String(raw || '').replace(/\D/g, '');
    if (d.length === 10) return d.slice(0, 6) + '-' + d.slice(6);
    return String(raw || '').trim();
  }

  function watermark(suffix) {
    return '<svg class="wm" width="560" height="560" viewBox="0 0 560 560">' +
      '<defs>' +
      '<path id="arcTop' + suffix + '" d="M 80 280 A 200 200 0 1 1 480 280"/>' +
      '<path id="arcBottom' + suffix + '" d="M 100 280 A 180 180 0 1 0 460 280"/>' +
      '</defs>' +
      '<g fill="#c9c9c9" opacity="0.55">' +
      '<text font-family="Arial, sans-serif" font-size="26" letter-spacing="10">' +
      '<textPath href="#arcTop' + suffix + '" startOffset="8%">SWEDISH COMPANIES</textPath></text>' +
      '<text font-family="Arial, sans-serif" font-size="26" letter-spacing="9">' +
      '<textPath href="#arcBottom' + suffix + '" startOffset="12%">REGISTRATION OFFICE</textPath></text>' +
      '<g font-size="150" font-family="serif">' +
      '<text x="130" y="270">&#9819;</text>' +
      '<text x="290" y="270">&#9819;</text>' +
      '<text x="210" y="400">&#9819;</text>' +
      '</g></g></svg>';
  }

  function logo() {
    return '<div class="logo-block"><div class="logo-line">' +
      '<svg width="36" height="36" viewBox="0 0 36 36"><g fill="#3a3a3a">' +
      '<circle cx="13" cy="6" r="3.1"/><circle cx="23" cy="6" r="3.1"/>' +
      '<circle cx="8" cy="14" r="3.1"/><circle cx="18" cy="14" r="3.1"/><circle cx="28" cy="14" r="3.1"/>' +
      '<circle cx="13" cy="22" r="3.1"/><circle cx="23" cy="22" r="3.1"/>' +
      '<circle cx="8" cy="30" r="3.1"/><circle cx="18" cy="30" r="3.1"/><circle cx="28" cy="30" r="3.1"/>' +
      '</g></svg><span class="logo-name">Bolagsverket</span></div>' +
      '<div class="logo-addr">851 81 Sundsvall<br>0771-670 670<br>www.bolagsverket.se</div></div>';
  }

  function header(d, page, total) {
    return '<div class="hdr">' + logo() +
      '<div class="hdr-right"><div class="hdr-title">' +
      '<h1>REGISTRERINGSBEVIS</h1><span class="pgn">' + page + ' (' + total + ')</span>' +
      '<p>' + esc(d.bolagsform || 'AKTIEBOLAG') + '</p></div>' +
      '<table class="regbox">' +
      '<tr><td colspan="2"><span class="lbl">Organisationsnummer</span>' + esc(d.orgnr) + '</td></tr>' +
      '<tr><td><span class="lbl">Objektets registreringsdatum</span>' + esc(d.regDatum) +
      '</td><td><span class="lbl">Företagsnamnets registreringsdatum</span>' + esc(d.namnRegDatum || d.regDatum) + '</td></tr>' +
      '<tr><td><span class="lbl">Dokumentet nedladdat</span>' + esc(d.nedladdat) +
      '</td><td><span class="lbl">Dokumentet visar senaste registreringen</span>' + esc(d.senasteReg || d.regDatum) + '</td></tr>' +
      '</table></div></div>';
  }

  function page1(d) {
    var styrelse = (d.styrelse || []).map(function (p) {
      return esc(p.pnr || 'ÅÅMMDD-XXXX') + ' ' + esc(p.namn) +
        (p.adress ? ', ' + esc(p.adress) : '');
    }).join('\n');
    var suppl = (d.suppleanter || []).map(function (p) {
      return esc(p.pnr || 'ÅÅMMDD-XXXX') + ' ' + esc(p.namn) +
        (p.adress ? ', ' + esc(p.adress) : '');
    }).join('\n');

    return '<div class="page">' + watermark('1') +
      '<div class="content">' + header(d, 1, 2) +
      '<div class="info"><div class="labels">' +
      '<div>Org.nummer:</div><div style="margin-top:6px">Företagsnamn:</div>' +
      '<div style="margin-top:2px">Adress:</div><div style="margin-top:30px">Säte:</div>' +
      '<div>Registreringslän:</div><div>Anmärkning:</div></div>' +
      '<div class="boxes"><div class="box">' + esc(d.orgnr) + '</div>' +
      '<div class="box">' + esc(d.namn) + '<br><br>' +
      esc(d.adress1) + '<br>' + esc(d.adress2) + '<br><br>' +
      esc(d.sate) + '<br><br>&nbsp;</div></div></div>' +
      '<div class="mono"><b>Detta är ett ' + esc(d.bolagsformText || 'privat aktiebolag') + '.</b>\n\n' +
      '<b>Bildat datum</b>\n' + esc(d.bildat) + '\n\n' +
      '<b>Sammanställning av aktiekapital</b>\n\n' +
      'Aktiekapital:        ' + esc(d.aktiekapital || '25.000') + ' SEK\n' +
      'Lägst.......:        ' + esc(d.aktiekapitalLagst || d.aktiekapital || '25.000') + ' SEK\n' +
      'Högst.......:        ' + esc(d.aktiekapitalHogst || '100.000') + ' SEK\n\n' +
      'Antal aktier:           ' + esc(d.antalAktier || '250') + '\n' +
      'Lägst.......:           ' + esc(d.antalAktierLagst || d.antalAktier || '250') + '\n' +
      'Högst.......:           ' + esc(d.antalAktierHogst || '1.000') + '\n\n' +
      '<b>STYRELSELEDAMOT</b>\n' + (styrelse || '—') + '\n\n' +
      '<b>STYRELSESUPPLEANTER</b>\n' + (suppl || '—') + '\n\n' +
      '<b>Firmateckning</b>\n' + esc(d.firmateckning || 'Firman tecknas av styrelsen') + '\n\n' +
      '<b>Föreskrift om antal styrelseledamöter/styrelsesuppleanter</b>\n' +
      esc(d.foreskrift || 'Styrelsen skall bestå av lägst 1 och högst 10 ledamöter\nmed lägst 0 och högst 10 suppleanter.') +
      '</div></div></div>';
  }

  function page2(d) {
    return '<div class="page">' + watermark('2') +
      '<div class="content">' + header(d, 2, 2) +
      '<div class="mono"><b>Bolagsordning</b>\nDatum för senaste ändringen: ' + esc(d.bolagsordningDatum || d.regDatum) + '\n\n' +
      '<b>FÖRBEHÅLL/AVVIKELSER/VILLKOR I BOLAGSORDNINGEN</b>\n' +
      esc(d.forbehall || 'Bestämmelse att företaget inte behöver ha revisor') + '\n\n' +
      '<b>VERKSAMHET</b>\n' + esc(d.verksamhet || '') + '\n\n' +
      '<b>Räkenskapsår</b>\n' + esc(d.rakenskapsar || '0101 - 1231') + '\n\n' +
      '<b>Kallelse</b>\n' + esc(d.kallelse || 'Kallelse sker genom brev, brev med posten eller e-post.') + '\n\n' +
      '<b>Tidigare företagsnamn</b>\n' + esc(d.tidigareNamn || '') + '\n\n' +
      'Registreringsbeviset är skapat av Bolagsverket.</div></div></div>';
  }

  function render(data) {
    var d = Object.assign({}, data);
    d.orgnr = fmtOrg(d.orgnr);
    return page1(d) + '\n' + page2(d);
  }

  function buildPrintHtml(data) {
    var css = '';
    try {
      /* filled by app after fetch */
      css = global.RB_PRINT_CSS || '';
    } catch (e) {}
    return '<!DOCTYPE html><html lang="sv"><head><meta charset="utf-8">' +
      '<title>Registreringsbevis – ' + esc(data.namn) + '</title>' +
      '<style>' + css + '</style></head><body>' + render(data) + '</body></html>';
  }

  global.RegistreringsbevisRender = {
    render: render,
    buildPrintHtml: buildPrintHtml,
    fmtOrg: fmtOrg,
    esc: esc
  };
})(typeof window !== 'undefined' ? window : globalThis);
