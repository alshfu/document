(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  function fillKommunSelect() {
    var sel = $('kommun');
    Object.keys(DeklarationTax.KOMMUNER).forEach(function (key) {
      var k = DeklarationTax.KOMMUNER[key];
      var opt = document.createElement('option');
      opt.value = key;
      opt.textContent = k.namn + ' (' + DeklarationTax.fmtSats(k.kommunalSats) + ' %)';
      if (key === 'stockholm') opt.selected = true;
      sel.appendChild(opt);
    });
    var custom = document.createElement('option');
    custom.value = 'custom';
    custom.textContent = 'Egen kommun…';
    sel.appendChild(custom);
  }

  function applyKommun() {
    var key = $('kommun').value;
    if (key === 'custom') return;
    var k = DeklarationTax.KOMMUNER[key];
    $('kommunNamn').value = k.namn;
    $('kommunalSats').value = String(k.kommunalSats).replace('.', ',');
    $('begravningSats').value = String(k.begravningSats).replace('.', ',');
  }

  function parseSats(el) {
    return parseFloat(String(el.value).replace(/\s/g, '').replace(',', '.'));
  }

  function readForm() {
    var pasted = DeklarationTax.parsePaste($('paste').value);
    if (pasted.error) return pasted;

    var avdragenRaw = $('avdragen').value.trim();
    var avdragen = avdragenRaw === '' ? null : DeklarationTax.parseAmount(avdragenRaw);

    return {
      person: {
        name: pasted.name,
        personnummer: pasted.personnummer,
        street: pasted.street,
        city: pasted.city,
        addressHtml: pasted.addressHtml,
        kommunNamn: $('kommunNamn').value.trim() || '—'
      },
      taxInput: {
        inkomst: pasted.inkomst,
        kalla: $('kalla').value,
        kommunalSats: parseSats($('kommunalSats')),
        begravningSats: parseSats($('begravningSats')),
        akassa: DeklarationTax.parseAmount($('akassa').value) || 0,
        rantor: DeklarationTax.parseAmount($('rantor').value) || 0,
        avdragen: avdragen
      }
    };
  }

  function showSummary(tax) {
    var F = DeklarationTax.fmt;
    var tillbaka = tax.diff >= 0;
    $('summary').hidden = false;
    $('summary').innerHTML =
      '<div class="sum-grid">' +
      '<div><span>Inkomst</span><b>' + F(tax.inkomst) + '</b></div>' +
      '<div><span>Slutlig skatt</span><b>' + F(tax.slutlig) + '</b></div>' +
      '<div><span>Preliminär</span><b>' + F(tax.avdragen) + '</b></div>' +
      '<div class="' + (tillbaka ? 'ok' : 'pay') + '"><span>' +
        (tillbaka ? 'Tillbaka' : 'Att betala') +
      '</span><b>' + F(Math.abs(tax.diff)) + '</b></div>' +
      '</div>';
  }

  function fitPreviewScale() {
    if (document.body.classList.contains('is-printing')) return;
    var preview = $('preview');
    if (!preview) return;
    var page = preview.querySelector('.page');
    if (!page) return;
    var pageW = page.offsetWidth || 794;
    var pageH = page.offsetHeight || 1123;
    var avail = Math.max(280, window.innerWidth - 24);
    var scale = Math.min(1, avail / pageW);
    preview.style.setProperty('--preview-scale', String(scale));
    preview.querySelectorAll('.page-slot').forEach(function (slot) {
      slot.style.height = (pageH * scale) + 'px';
    });
  }

  /** Strip mobile preview scaling so A4 pages print 1:1. */
  function preparePrint() {
    document.body.classList.add('is-printing');
    var preview = $('preview');
    if (preview) {
      preview.style.setProperty('--preview-scale', '1');
      preview.querySelectorAll('.page-slot').forEach(function (slot) {
        slot.style.height = '';
        slot.style.overflow = 'visible';
      });
      preview.querySelectorAll('.page').forEach(function (page) {
        page.style.transform = 'none';
        page.style.width = '210mm';
        page.style.height = '297mm';
        page.style.margin = '0';
      });
    }
  }

  function restoreAfterPrint() {
    document.body.classList.remove('is-printing');
    var preview = $('preview');
    if (preview) {
      preview.querySelectorAll('.page').forEach(function (page) {
        page.style.transform = '';
        page.style.width = '';
        page.style.height = '';
        page.style.margin = '';
      });
      preview.querySelectorAll('.page-slot').forEach(function (slot) {
        slot.style.overflow = '';
      });
    }
    fitPreviewScale();
  }

  function isMobile() {
    return window.matchMedia('(max-width: 820px)').matches ||
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || '');
  }

  /** Clean A4 document in a hidden iframe — reliable on mobile Safari/Chrome. */
  function printViaIframe() {
    var pages = $('preview').querySelectorAll('.page');
    if (!pages.length) return;

    var old = document.getElementById('print-frame');
    if (old) old.remove();

    var cssLinks = Array.prototype.map.call(
      document.querySelectorAll('link[rel="stylesheet"]'),
      function (l) { return l.href; }
    );
    var css = cssLinks.map(function (href) {
      return '<link rel="stylesheet" href="' + href + '">';
    }).join('');

    var bodyHtml = Array.prototype.map.call(pages, function (p) {
      return p.outerHTML;
    }).join('\n');

    var frame = document.createElement('iframe');
    frame.id = 'print-frame';
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none';
    document.body.appendChild(frame);

    var doc = frame.contentDocument || frame.contentWindow.document;
    doc.open();
    var base = location.href.replace(/[#?].*$/, '').replace(/\/[^/]*$/, '/');
    doc.write(
      '<!DOCTYPE html><html lang="sv"><head><meta charset="utf-8">' +
      '<base href="' + base + '">' +
      '<meta name="viewport" content="width=device-width">' +
      css +
      '<style>' +
      'html,body{margin:0;padding:0;background:#fff;}' +
      '.page{transform:none!important;margin:0!important;box-shadow:none!important;' +
      'width:210mm!important;height:297mm!important;page-break-after:always;break-after:page;}' +
      '.page:last-of-type{page-break-after:auto;break-after:auto;}' +
      '.page>.stamp{display:none!important;}' +
      '@page{size:A4;margin:0;}' +
      '</style></head><body>' + bodyHtml + '</body></html>'
    );
    doc.close();

    var win = frame.contentWindow;
    var done = false;
    function cleanup() {
      if (done) return;
      done = true;
      setTimeout(function () {
        if (frame.parentNode) frame.parentNode.removeChild(frame);
        restoreAfterPrint();
      }, 500);
    }
    win.addEventListener('afterprint', cleanup);
    // Wait for styles/images
    setTimeout(function () {
      try { win.focus(); win.print(); } catch (e) { cleanup(); }
      // Fallback if afterprint never fires (some Android WebViews)
      setTimeout(cleanup, 3000);
    }, 250);
  }

  function printBlankett() {
    if (!$('preview').querySelector('.page')) return;
    preparePrint();
    if (isMobile()) {
      printViaIframe();
      return;
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        window.print();
      });
    });
  }

  function wrapPages(html) {
    // Wrap each .page in .page-slot for mobile scaling
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    var out = document.createDocumentFragment();
    Array.prototype.slice.call(tmp.children).forEach(function (el) {
      if (el.classList && el.classList.contains('page')) {
        var slot = document.createElement('div');
        slot.className = 'page-slot';
        slot.appendChild(el);
        out.appendChild(slot);
      } else {
        out.appendChild(el);
      }
    });
    var wrap = document.createElement('div');
    wrap.appendChild(out);
    return wrap.innerHTML;
  }

  function generate() {
    var data = readForm();
    if (data.error) {
      $('error').hidden = false;
      $('error').textContent = data.error;
      return;
    }
    if (!isFinite(data.taxInput.kommunalSats) || !isFinite(data.taxInput.begravningSats)) {
      $('error').hidden = false;
      $('error').textContent = 'Kontrollera kommunalskattesats / begravningsavgift';
      return;
    }
    $('error').hidden = true;

    var tax = DeklarationTax.berakna(data.taxInput);
    showSummary(tax);

    var html = DeklarationRender.render(data.person, tax);
    $('preview').innerHTML = wrapPages(html);
    $('preview-wrap').hidden = false;
    $('btn-print').disabled = false;
    $('preview-label').textContent = data.person.name + ' · ' + DeklarationTax.fmt(tax.inkomst) + ' kr';

    requestAnimationFrame(function () {
      fitPreviewScale();
      $('preview-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function loadExample() {
    $('paste').value =
      'Nils Rauner\n' +
      '200708053293\n' +
      'Tulegatan 20 Stockholm\n' +
      '195 000';
    $('kommun').value = 'stockholm';
    applyKommun();
    $('kalla').value = 'lon';
    $('akassa').value = '0';
    $('rantor').value = '0';
    $('avdragen').value = '';
    generate();
  }

  document.addEventListener('DOMContentLoaded', function () {
    fillKommunSelect();
    applyKommun();
    $('kommun').addEventListener('change', applyKommun);
    $('btn-generate').addEventListener('click', generate);
    var mainBtn = $('btn-generate-main');
    if (mainBtn) mainBtn.addEventListener('click', generate);
    $('btn-example').addEventListener('click', loadExample);
    $('btn-print').addEventListener('click', printBlankett);
    $('btn-top').addEventListener('click', function () {
      $('app-ui').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    $('paste').addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') generate();
    });
    window.addEventListener('resize', fitPreviewScale);
    window.addEventListener('orientationchange', function () {
      setTimeout(fitPreviewScale, 200);
    });
    window.addEventListener('beforeprint', preparePrint);
    window.addEventListener('afterprint', restoreAfterPrint);
    // iOS Safari sometimes skips afterprint
    var mq = window.matchMedia && window.matchMedia('print');
    if (mq) {
      var onMq = function (e) {
        if (e.matches) preparePrint();
        else restoreAfterPrint();
      };
      if (mq.addEventListener) mq.addEventListener('change', onMq);
      else if (mq.addListener) mq.addListener(onMq);
    }
    if (/(?:^|[?&])demo=1(?:&|$)/.test(location.search)) {
      loadExample();
    }
  });
})();

