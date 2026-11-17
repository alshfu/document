(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var lastHtml = '';

  function isoToday() {
    return new Date().toISOString().slice(0, 10);
  }

  function monthsAgo(n) {
    var d = new Date();
    d.setUTCMonth(d.getUTCMonth() - n);
    return d.toISOString().slice(0, 10);
  }

  function parsePerson(text) {
    var lines = String(text || '').split(/\r?\n/).map(function (l) {
      return l.trim();
    }).filter(Boolean);
    if (!lines.length) return { name: '', address: '' };
    var name = lines[0];
    var address = lines.slice(1).join(', ');
    return { name: name, address: address };
  }

  function bankDefaults(bank) {
    if (bank === 'swedbank') {
      return {
        clearing: '8327', account: '8327-9,123 456 789-0',
        bic: 'SWEDSESS', iban: 'SE4680000832791234567890'
      };
    }
    if (bank === 'revolut') {
      return {
        clearing: '', account: 'Revolut SEK',
        bic: 'EVIULT2VXXX', iban: 'LT123250012345678901'
      };
    }
    return {
      clearing: '3023', account: '3023 00 12345',
      bic: 'NDEASESS', iban: 'SE1830000000030230012345'
    };
  }

  function applyBank(bank) {
    $('bank').value = bank;
    var defs = bankDefaults(bank);
    $('account').value = defs.account;
    $('clearing').value = defs.clearing;
    $('bic').value = defs.bic;
    $('iban').value = defs.iban;
    document.querySelectorAll('#banks button').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-bank') === bank);
    });
  }

  function applyMonths(n) {
    n = parseInt(n, 10) || 3;
    $('months').value = String(n);
    $('from').value = monthsAgo(n);
    $('to').value = isoToday();
    document.querySelectorAll('#periods button').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-months') === String(n));
    });
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
      var personInfo = parsePerson($('paste').value);
      if (!personInfo.name) {
        $('error').textContent = 'Skriv namn (och gärna adress).';
        $('error').classList.add('show');
        return;
      }

      var income = parseFloat($('income').value) || 0;
      var spend = parseFloat($('spend').value) || 0;
      if (income <= 0) {
        $('error').textContent = 'Ange inkomst per månad.';
        $('error').classList.add('show');
        return;
      }

      applyMonths($('months').value);
      var bank = $('bank').value;
      applyBank(bank);

      var from = BankSynth.parseDateString($('from').value);
      var to = BankSynth.parseDateString($('to').value);
      var perMonth = spend > 0 ? Math.max(12, Math.min(45, Math.round(spend / 700))) : 22;

      var config = {
        from: from,
        to: to,
        income: BankSynth.roundKronor(income),
        day: 25,
        desc: 'Lön',
        startBalance: BankSynth.roundKronor(Math.max(2000, Math.round(income * 0.15))),
        perMonth: perMonth,
        seed: 42,
        preSalary: 2000,
        fixedCosts: [],
        swish: true,
        incomes: [{ amount: BankSynth.roundKronor(income), day: 25, desc: 'Lön' }]
      };

      var result = BankSynth.generate(config);
      var person = {
        name: personInfo.name,
        address: personInfo.address,
        account: $('account').value,
        clearing: $('clearing').value,
        iban: $('iban').value,
        bic: $('bic').value
      };

      lastHtml = BankRender.render(bank, person, config, result);
      $('preview').innerHTML = lastHtml;
      $('preview-wrap').hidden = false;
      $('preview-wrap').removeAttribute('hidden');
      $('btn-print').disabled = false;
      $('preview-label').textContent =
        person.name + ' · ' + bank + ' · ' + BankSynth.formatSek(result.finalBalance);
      requestAnimationFrame(function () {
        fitPreview();
        $('preview-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } catch (err) {
      console.error(err);
      $('error').textContent = 'Fel: ' + (err && err.message ? err.message : err);
      $('error').classList.add('show');
    }
  }

  function loadExample() {
    $('paste').value = 'Anna Andersson\nStorgatan 1\n111 22 Stockholm';
    applyBank('nordea');
    applyMonths(3);
    $('income').value = '32000';
    $('spend').value = '18000';
    generate();
  }

  function printBlankett() {
    if (!lastHtml) return;
    var base = location.href.replace(/[#?].*$/, '').replace(/\/[^/]*$/, '/');
    fetch(base + 'print.css?v=2', { cache: 'no-store' })
      .then(function (r) { return r.text(); })
      .then(function (css) {
        var html = '<!DOCTYPE html><html lang="sv"><head><meta charset="utf-8">' +
          '<base href="' + base + '">' +
          '<title>Bankutdrag</title><style>' + css + '</style></head><body>' +
          lastHtml +
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
    applyBank('nordea');
    applyMonths(3);

    document.querySelectorAll('#banks button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyBank(btn.getAttribute('data-bank'));
      });
    });
    document.querySelectorAll('#periods button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyMonths(btn.getAttribute('data-months'));
      });
    });

    $('btn-generate').addEventListener('click', generate);
    $('btn-generate-dock').addEventListener('click', generate);
    $('btn-example').addEventListener('click', loadExample);
    $('btn-print').addEventListener('click', printBlankett);
    $('btn-top').addEventListener('click', function () {
      $('app-ui').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    window.addEventListener('resize', fitPreview);

    if (/(?:^|[?&])demo=1(?:&|$)/.test(location.search)) loadExample();
  });
})();
