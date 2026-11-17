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
    var name = lines[0] || 'ANDERSSON,ANNA';
    var address = '';
    var pnr = '';
    for (var i = 1; i < lines.length; i++) {
      if (/(\d{6}|\d{8})\s*[-+]?\s*\d{4}/.test(lines[i]) || /^\d{12}$/.test(lines[i].replace(/\D/g, ''))) {
        var m = lines[i].replace(/\D/g, '');
        if (m.length === 12) pnr = m.slice(0, 8) + '-' + m.slice(8);
        else pnr = lines[i];
      } else {
        address += (address ? ', ' : '') + lines[i];
      }
    }
    return { name: name, address: address, pnr: pnr };
  }

  function bankDefaults(bank) {
    if (bank === 'swedbank') {
      return { clearing: '8327', account: '8327-9,123 456 789-0', bic: 'SWEDSESS',
        iban: 'SE4680000832791234567890' };
    }
    if (bank === 'revolut') {
      return { clearing: '', account: 'Revolut SEK', bic: 'EVIULT2VXXX',
        iban: 'LT123250012345678901' };
    }
    return { clearing: '3023', account: '3023 00 12345', bic: 'NDEASESS',
      iban: 'SE1830000000030230012345' };
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

  function buildConfig() {
    var from = BankSynth.parseDateString($('from').value);
    var to = BankSynth.parseDateString($('to').value);
    var income = parseFloat($('income').value) || 0;
    var spend = parseFloat($('spend').value) || 0;
    var day = parseInt($('payday').value, 10) || 25;
    var startBalance = parseFloat($('startBalance').value) || 0;
    var seed = parseInt($('seed').value, 10) || 1;
    var desc = ($('salaryDesc').value || 'Lön').trim();

    if (!from || !to || from > to) {
      return { err: 'Kontrollera periodens datum.' };
    }
    if (income <= 0) {
      return { err: 'Inkomst per månad måste vara större än 0.' };
    }

    // Approximate monthly spend via perMonth card count heuristic
    var perMonth = 22;
    if (spend > 0 && income > 0) {
      perMonth = Math.max(12, Math.min(45, Math.round(spend / 700)));
    }

    return {
      from: from,
      to: to,
      income: BankSynth.roundKronor(income),
      day: day,
      desc: desc,
      startBalance: BankSynth.roundKronor(startBalance),
      perMonth: perMonth,
      seed: seed,
      preSalary: 2000,
      fixedCosts: [],
      swish: true,
      incomes: [{ amount: BankSynth.roundKronor(income), day: day, desc: desc }]
    };
  }

  function generate() {
    try {
      $('error').classList.remove('show');
      var personInfo = parsePerson($('paste').value);
      var bank = $('bank').value;
      var defs = bankDefaults(bank);
      if (!$('account').dataset.touched) $('account').value = defs.account;
      if (!$('clearing').dataset.touched) $('clearing').value = defs.clearing;
      if (!$('bic').dataset.touched) $('bic').value = defs.bic;
      if (!$('iban').dataset.touched) $('iban').value = defs.iban;

      var config = buildConfig();
      if (config.err) {
        $('error').textContent = config.err;
        $('error').classList.add('show');
        return;
      }

      var result = BankSynth.generate(config);
      var person = {
        name: personInfo.name,
        address: personInfo.address,
        account: $('account').value.trim(),
        clearing: $('clearing').value.trim(),
        iban: $('iban').value.trim(),
        bic: $('bic').value.trim()
      };

      lastHtml = BankRender.render(bank, person, config, result);
      $('preview').innerHTML = lastHtml;
      $('preview-wrap').hidden = false;
      $('preview-wrap').removeAttribute('hidden');
      $('btn-print').disabled = false;
      $('preview-label').textContent =
        person.name + ' · ' + bank + ' · ' + result.rows.length + ' rader · saldo ' +
        BankSynth.formatSek(result.finalBalance);
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
    $('paste').value = 'Anna Andersson\n198001011234\nStorgatan 1\n111 22 Stockholm';
    $('bank').value = 'nordea';
    $('from').value = monthsAgo(3);
    $('to').value = isoToday();
    $('income').value = '32000';
    $('spend').value = '18000';
    $('startBalance').value = '4500';
    $('payday').value = '25';
    $('salaryDesc').value = 'Lön';
    $('seed').value = '42';
    var defs = bankDefaults('nordea');
    $('account').value = defs.account;
    $('clearing').value = defs.clearing;
    $('bic').value = defs.bic;
    $('iban').value = defs.iban;
    ['account', 'clearing', 'bic', 'iban'].forEach(function (id) {
      delete $(id).dataset.touched;
    });
    generate();
  }

  function printBlankett() {
    if (!lastHtml) return;
    var base = location.href.replace(/[#?].*$/, '').replace(/\/[^/]*$/, '/');
    fetch(base + 'print.css?v=1', { cache: 'no-store' })
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
      .catch(function (e) {
        $('error').textContent = 'Kunde inte ladda print.css';
        $('error').classList.add('show');
      });
  }

  function onBankChange() {
    var defs = bankDefaults($('bank').value);
    if (!$('account').dataset.touched) $('account').value = defs.account;
    if (!$('clearing').dataset.touched) $('clearing').value = defs.clearing;
    if (!$('bic').dataset.touched) $('bic').value = defs.bic;
    if (!$('iban').dataset.touched) $('iban').value = defs.iban;
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!$('from').value) $('from').value = monthsAgo(3);
    if (!$('to').value) $('to').value = isoToday();

    $('btn-generate').addEventListener('click', generate);
    $('btn-generate-dock').addEventListener('click', generate);
    $('btn-example').addEventListener('click', loadExample);
    $('btn-print').addEventListener('click', printBlankett);
    $('btn-top').addEventListener('click', function () {
      $('app-ui').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    $('bank').addEventListener('change', onBankChange);
    ['account', 'clearing', 'bic', 'iban'].forEach(function (id) {
      $(id).addEventListener('input', function () { $(id).dataset.touched = '1'; });
    });
    window.addEventListener('resize', fitPreview);

    if (/(?:^|[?&])demo=1(?:&|$)/.test(location.search)) {
      loadExample();
    }
  });
})();
