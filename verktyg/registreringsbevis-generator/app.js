(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var lastData = null;

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function parsePaste(text) {
    var lines = String(text || '').split(/\r?\n/).map(function (l) {
      return l.trim();
    }).filter(Boolean);
    if (lines.length < 3) {
      return { error: 'Minst 3 rader: företagsnamn, org.nr, adress' };
    }
    var orgIdx = -1;
    var orgnr = null;
    for (var i = 0; i < lines.length; i++) {
      var digits = lines[i].replace(/\D/g, '');
      if (digits.length === 10 || /\d{6}\s*-?\s*\d{4}/.test(lines[i])) {
        orgnr = RegistreringsbevisRender.fmtOrg(lines[i]);
        orgIdx = i;
        break;
      }
    }
    if (!orgnr) return { error: 'Hittade inget organisationsnummer' };

    var namn = orgIdx === 0 ? (lines[1] || lines[0]) : lines[0];
    var addrLines = lines.filter(function (_, idx) {
      return idx !== orgIdx && !(orgIdx !== 0 && idx === 0);
    });
    // When name is line 0 and org is line 1, address starts at 2
    if (orgIdx === 1) addrLines = lines.slice(2);
    if (orgIdx === 0) addrLines = lines.slice(2);

    var adress1 = addrLines[0] || '';
    var adress2 = addrLines.slice(1).join(', ');
    var kommun = '';
    var last = addrLines[addrLines.length - 1] || '';
    var m = last.match(/\d{3}\s*\d{2}\s+(.+)/);
    if (m) kommun = m[1].trim();

    return {
      namn: namn,
      orgnr: orgnr,
      adress1: adress1,
      adress2: adress2,
      kommun: kommun,
      lan: ''
    };
  }

  function readForm(parsed) {
    var styrelseNamn = $('styrelse').value.trim();
    var styrelse = styrelseNamn
      ? [{ namn: styrelseNamn, pnr: $('styrelsePnr').value.trim() || 'ÅÅMMDD-XXXX', adress: $('styrelseAdress').value.trim() }]
      : [];
    return {
      namn: parsed.namn,
      orgnr: parsed.orgnr,
      adress1: parsed.adress1 || $('adress1').value.trim(),
      adress2: parsed.adress2 || $('adress2').value.trim(),
      sate: $('sate').value.trim() ||
        ([parsed.lan, parsed.kommun].filter(Boolean).join(', ') || parsed.adress2 || ''),
      bolagsform: $('bolagsform').value,
      bolagsformText: $('bolagsform').value === 'AKTIEBOLAG' ? 'privat aktiebolag' : $('bolagsform').value.toLowerCase(),
      regDatum: $('regDatum').value || today(),
      namnRegDatum: $('regDatum').value || today(),
      senasteReg: $('regDatum').value || today(),
      nedladdat: today(),
      bildat: $('bildat').value || $('regDatum').value || today(),
      aktiekapital: $('aktiekapital').value.trim() || '25.000',
      aktiekapitalHogst: $('aktiekapitalHogst').value.trim() || '100.000',
      antalAktier: $('antalAktier').value.trim() || '250',
      antalAktierHogst: $('antalAktierHogst').value.trim() || '1.000',
      styrelse: styrelse,
      firmateckning: $('firmateckning').value.trim() || 'Firman tecknas av styrelsen',
      verksamhet: $('verksamhet').value.trim() ||
        'Föremålet för bolagets verksamhet är att bedriva verksamhet samt därmed förenlig verksamhet.',
      rakenskapsar: $('rakenskapsar').value.trim() || '0101 - 1231',
      forbehall: 'Bestämmelse att företaget inte behöver ha revisor',
      kallelse: 'Kallelse sker genom brev, brev med posten eller e-post.',
      bolagsordningDatum: $('regDatum').value || today()
    };
  }

  function fitPreview() {
    var pages = document.querySelectorAll('#preview .page');
    if (!pages.length) return;
    var pageW = pages[0].offsetWidth || 794;
    var avail = Math.max(280, window.innerWidth - 24);
    var scale = Math.min(1, avail / pageW);
    pages.forEach(function (p) {
      p.style.transform = 'scale(' + scale + ')';
      p.style.transformOrigin = 'top center';
      p.style.marginBottom = (10 + p.offsetHeight * (scale - 1)) + 'px';
    });
  }

  function generate() {
    try {
      $('error').classList.remove('show');
      var raw = ($('paste').value || '').trim();
      if (!raw) {
        $('error').textContent = 'Klistra in företagsnamn, org.nr och adress först.';
        $('error').classList.add('show');
        return;
      }
      var parsed = parsePaste(raw);
      if (parsed.error) {
        $('error').textContent = parsed.error;
        $('error').classList.add('show');
        return;
      }
      if (parsed.adress1) $('adress1').value = parsed.adress1;
      if (parsed.adress2) $('adress2').value = parsed.adress2;
      if (parsed.kommun && !$('sate').value.trim()) {
        var k = parsed.kommun;
        $('sate').value = (parsed.lan ? parsed.lan + ', ' : '') + k +
          (/kommun/i.test(k) ? '' : ' kommun');
      }

      var data = readForm(parsed);
      if (!data.namn || !data.orgnr) {
        $('error').textContent = 'Kunde inte läsa namn eller organisationsnummer.';
        $('error').classList.add('show');
        return;
      }
      lastData = data;
      $('preview').innerHTML = RegistreringsbevisRender.render(data);
      $('preview-wrap').hidden = false;
      $('preview-wrap').removeAttribute('hidden');
      $('btn-print').disabled = false;
      $('preview-label').textContent = data.namn + ' · ' + data.orgnr;
      requestAnimationFrame(function () {
        fitPreview();
        $('preview-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } catch (err) {
      console.error(err);
      $('error').textContent = 'Fel vid generering: ' + (err && err.message ? err.message : err);
      $('error').classList.add('show');
    }
  }

  function loadExample() {
    $('paste').value =
      'Gotbit AB\n' +
      '559436-6022\n' +
      'Doktor Saléns Gata 5\n' +
      '413 22 GÖTEBORG';
    $('bolagsform').value = 'AKTIEBOLAG';
    $('regDatum').value = '2023-06-01';
    $('bildat').value = '2023-05-31';
    $('sate').value = 'Västra Götalands län, Göteborgs kommun';
    $('styrelse').value = 'Mattsson, Bengt Anders';
    $('styrelsePnr').value = 'ÅÅMMDD-XXXX';
    $('styrelseAdress').value = 'DOKTOR SALÉNS GATA 5 LGH 1102, 413 22 GÖTEBORG';
    $('verksamhet').value =
      'Föremålet för bolagets verksamhet är att bedriva konsultverksamhet inom IT-drift, datakommunikation och hård- och mjukvaruförsäljning samt därmed förenlig verksamhet.';
    $('rakenskapsar').value = '0501 - 0430';
    generate();
  }

  function printBlankett() {
    if (!lastData) return;
    var base = location.href.replace(/[#?].*$/, '').replace(/\/[^/]*$/, '/');
    fetch(base + 'print.css?v=1', { cache: 'no-store' })
      .then(function (r) { return r.text(); })
      .then(function (css) {
        window.RB_PRINT_CSS = css;
        var html = '<!DOCTYPE html><html lang="sv"><head><meta charset="utf-8">' +
          '<title>Registreringsbevis – ' + RegistreringsbevisRender.esc(lastData.namn) + '</title>' +
          '<style>' + css + '</style></head><body>' +
          RegistreringsbevisRender.render(lastData) +
          '<script>window.onload=function(){setTimeout(function(){window.focus();window.print();},250);};<\/script>' +
          '</body></html>';
        var win = window.open('', '_blank');
        if (!win) {
          $('error').textContent = 'Tillåt popup-fönster för PDF.';
          $('error').classList.add('show');
          return;
        }
        win.document.open();
        win.document.write(html);
        win.document.close();
      })
      .catch(function () {
        $('error').textContent = 'Kunde inte ladda print.css';
        $('error').classList.add('show');
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    $('btn-generate').addEventListener('click', generate);
    $('btn-generate-dock').addEventListener('click', generate);
    $('btn-example').addEventListener('click', loadExample);
    $('btn-print').addEventListener('click', printBlankett);
    $('btn-top').addEventListener('click', function () {
      $('app-ui').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    $('paste').addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') generate();
    });
    window.addEventListener('resize', fitPreview);
    if (/(?:^|[?&])demo=1(?:&|$)/.test(location.search)) loadExample();
  });
})();
