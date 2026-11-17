(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  function fitPreview() {
    var page = document.querySelector('#pb-doc .pb-page');
    if (!page || document.body.classList.contains('is-printing')) return;
    var pageW = page.offsetWidth || 794;
    var avail = Math.max(280, window.innerWidth - 24);
    var scale = Math.min(1, avail / pageW);
    page.style.transform = 'scale(' + scale + ')';
    page.style.transformOrigin = 'top center';
    page.parentElement.style.height = (page.offsetHeight * scale) + 'px';
  }
  window.pbFitPreview = fitPreview;

  function showError(msg) {
    var el = $('error');
    if (!msg) {
      el.classList.remove('show');
      el.textContent = '';
      return;
    }
    el.textContent = msg;
    el.classList.add('show');
  }

  function applySimplePaste(text, st) {
    var lines = text.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
    if (lines.length < 2) return;
    // Name: first non-digit-heavy line
    if (lines[0] && !/^\d{6,}/.test(lines[0].replace(/\s/g, ''))) {
      st.person.name = lines[0];
    }
    // Personnummer: prefer 12 digits (YYYYMMDDXXXX) or 8-4 before short 6-4
    var pnr =
      text.match(/(\d{8})\s*([-+ ]?)\s*(\d{4})/) ||
      text.match(/(?:^|\D)(\d{12})(?:\D|$)/) ||
      text.match(/(\d{6})\s*([-+ ])\s*(\d{4})/);
    if (pnr) {
      if (pnr[1] && pnr[1].length === 12) {
        st.person.pnr = pnr[1].slice(0, 8) + '-' + pnr[1].slice(8);
      } else {
        var full = pnr[1];
        if (full.length === 6) {
          var yy = parseInt(full.slice(0, 2), 10);
          var century = yy <= (new Date().getFullYear() % 100) ? 2000 : 1900;
          full = String(century + yy) + full.slice(2);
        }
        st.person.pnr = full + '-' + pnr[3];
      }
    }
    // Address: lines after pnr
    var addrLines = [];
    var seenPnr = false;
    for (var i = 0; i < lines.length; i++) {
      if (/(\d{6}|\d{8})\s*[-+ ]?\s*\d{4}/.test(lines[i])) {
        seenPnr = true;
        continue;
      }
      if (seenPnr) addrLines.push(lines[i]);
      else if (i > 0 && !/(\d{6}|\d{8})/.test(lines[i])) addrLines.push(lines[i]);
    }
    if (addrLines.length) {
      st.person.addr1 = addrLines[0];
      st.person.addr2 = addrLines.slice(1).join(', ');
      // Infer kommun from last address line if looks like "113 53 Stockholm"
      var last = addrLines[addrLines.length - 1];
      var m = last.match(/\d{3}\s*\d{2}\s+(.+)/);
      if (m && !st.person.kommun) st.person.kommun = m[1].trim();
    }
    if (!st.person.date) st.person.date = new Date().toISOString().slice(0, 10);
    if (!st.person.regDate) st.person.regDate = st.person.date;
  }

  function generateFromPaste() {
    showError('');
    var text = $('pb-paste').value.trim();
    if (!text) {
      showError('Klistra in namn, personnummer och adress först.');
      return;
    }
    if (window.pbRunParser) window.pbRunParser(text);
    var st = window.pbGetState && window.pbGetState();
    if (!st) {
      showError('Generatorn kunde inte startas.');
      return;
    }
    applySimplePaste(text, st);
    if (window.pbRenderDoc) window.pbRenderDoc();
    if (st.person.name || st.person.pnr) {
      $('preview-label').textContent = (st.person.name || 'Personbevis') + ' · ' + (st.person.pnr || '');
      $('preview-wrap').hidden = false;
      $('btn-print').disabled = false;
      fitPreview();
      $('preview-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      showError('Kunde inte tolka uppgifterna. Kontrollera formatet.');
    }
  }

  function loadExample() {
    $('pb-paste').value =
      'Nils Rauner\n' +
      '200708053293\n' +
      'Tulegatan 20\n' +
      '113 53 Stockholm';
    // Set defaults on state if available
    var st = window.pbGetState && window.pbGetState();
    if (st) {
      st.person.lan = st.person.lan || 'Stockholm';
      st.person.kommun = st.person.kommun || 'Stockholm';
      st.person.regDate = st.person.regDate || '2025-01-15';
      st.person.date = st.person.date || new Date().toISOString().slice(0, 10);
    }
    generateFromPaste();
  }

  function printBlankett() {
    if (!window.pbBuildDocumentHtml || !window.pbGetState) return;
    var st = window.pbGetState();
    var html = window.pbBuildDocumentHtml(st.type, st.lang, st.person);
    // Force print-root class on body for CSS
    html = html.replace('<body>', '<body class="pb-print-root">');
    // Inline DOC_CSS already in html; ensure print colors
    var win = window.open('', '_blank');
    if (!win) {
      showError('Tillåt popup-fönster för att skriva ut.');
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.onload = function () {
      setTimeout(function () {
        try { win.focus(); win.print(); } catch (e) {}
      }, 250);
    };
    // Also try after a delay for Safari
    setTimeout(function () {
      try { win.focus(); win.print(); } catch (e) {}
    }, 600);
  }
  window.pbPrintBlankett = printBlankett;

  function openModal() {
    var bd = $('pb-backdrop');
    bd.classList.remove('pb-hidden');
    bd.style.display = 'block';
    if (typeof openModal === 'function' && openModal !== arguments.callee) {
      /* core also has openModal — already built fields on init */
    }
  }

  function closeModal() {
    var bd = $('pb-backdrop');
    bd.classList.add('pb-hidden');
    bd.style.display = 'none';
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Core init already ran if script order is logo -> core -> shell
    // But core calls init on DOMContentLoaded too — order matters.
    // shell loads after core, so core's listener already registered.
    // Wire our buttons:
    $('btn-generate').addEventListener('click', generateFromPaste);
    $('btn-generate-dock').addEventListener('click', generateFromPaste);
    $('btn-example').addEventListener('click', loadExample);
    $('btn-print').addEventListener('click', printBlankett);
    $('btn-top').addEventListener('click', function () {
      $('app-ui').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    $('pb-open').addEventListener('click', function () {
      if (typeof buildModalFields === 'function') {
        // fields may already exist
      }
      openModal();
    });
    $('pb-modal-close').addEventListener('click', closeModal);
    $('pb-modal-apply').addEventListener('click', function () {
      if (typeof renderDoc === 'function') renderDoc();
      closeModal();
      $('preview-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    // backdrop click closes
    $('pb-backdrop').addEventListener('click', function (e) {
      if (e.target === $('pb-backdrop')) closeModal();
    });

    window.addEventListener('resize', fitPreview);
    window.addEventListener('orientationchange', function () {
      setTimeout(fitPreview, 200);
    });

    if (/(?:^|[?&])demo=1(?:&|$)/.test(location.search)) {
      setTimeout(loadExample, 100);
    }
  });
})();
