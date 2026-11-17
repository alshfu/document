(function (global) {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function fmt(v) {
    return BankSynth.formatSek(v);
  }

  function iso(d) {
    return BankSynth.isoDate(d instanceof Date ? d : BankSynth.parseDateString(d));
  }

  var MONTHS = ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
    'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'];

  function monthLabel(date) {
    return MONTHS[date.getUTCMonth()] + ' ' + date.getUTCFullYear();
  }

  function daysBetween(from, to) {
    return Math.round((to - from) / 86400000) + 1;
  }

  /* ---------- NORDEA ---------- */
  function nordeaLogo() {
    return '<div class="logo"><img src="assets/nordea-logo.svg" alt="Nordea" style="width:34mm;height:auto"></div>';
  }

  function nordeaWave() {
    return '<img class="wave" src="assets/nordea-wave.svg" alt="">';
  }

  function renderNordea(person, config, result) {
    var rows = result.rows;
    var perPage = 36;
    var elements = [];
    var currentMonth = '';
    for (var i = 0; i < rows.length; i++) {
      var ml = monthLabel(rows[i].b);
      if (ml !== currentMonth) {
        elements.push({ type: 'month', label: ml });
        currentMonth = ml;
      }
      elements.push({ type: 'row', row: rows[i] });
    }
    var pagesNeeded = Math.max(1, Math.ceil(elements.length / perPage));
    var income = 0, expense = 0, ic = 0, ec = 0;
    rows.forEach(function (r) {
      if (r.amount > 0) { income += r.amount; ic++; }
      else { expense += r.amount; ec++; }
    });

    var html = '';
    for (var p = 0; p < pagesNeeded; p++) {
      var slice = elements.slice(p * perPage, (p + 1) * perPage);
      var body = '';
      var odd = false;
      slice.forEach(function (el) {
        if (el.type === 'month') {
          body += '<tr><td class="month" colspan="4">' + esc(el.label) + '</td></tr>';
          odd = false;
        } else {
          body += '<tr class="' + (odd ? 'odd' : '') + '">' +
            '<td>' + iso(el.row.b) + '</td>' +
            '<td>' + esc(el.row.desc) + '</td>' +
            '<td class="num">' + fmt(el.row.amount) + '</td>' +
            '<td class="num">' + fmt(el.row.saldo) + '</td></tr>';
          odd = !odd;
        }
      });

      html += '<div class="page bank-nordea">' + nordeaWave() +
        '<div class="content">' +
        '<div class="header">' + nordeaLogo() +
        '<div class="created">Skapad ' + iso(new Date()) + '<br>Sida ' + (p + 1) + ' (' + pagesNeeded + ')</div></div>';

      if (p === 0) {
        html += '<h2 class="section">Kontouppgifter</h2><div class="rule"></div>' +
          '<div class="summary"><div class="col">' +
          '<h3>Konto</h3><table>' +
          '<tr><td class="lbl">Innehavare</td><td>' + esc(person.name) + '</td></tr>' +
          '<tr><td class="lbl">Kontonummer</td><td>' + esc(person.account) + '</td></tr>' +
          '<tr><td class="lbl">Clearingnr</td><td>' + esc(person.clearing) + '</td></tr>' +
          '<tr><td class="lbl">IBAN</td><td>' + esc(person.iban) + '</td></tr>' +
          '<tr><td class="lbl">BIC</td><td>' + esc(person.bic) + '</td></tr>' +
          '</table></div><div class="col right"><h3>Period</h3><table>' +
          '<tr><td class="lbl">Från</td><td class="val">' + iso(config.from) + '</td></tr>' +
          '<tr><td class="lbl">Till</td><td class="val">' + iso(config.to) + '</td></tr>' +
          '<tr><td class="lbl">Antal dagar</td><td class="val">' + daysBetween(config.from, config.to) + '</td></tr>' +
          '<tr><td class="lbl">Antal händelser</td><td class="val">' + rows.length + '</td></tr>' +
          '</table></div></div>' +
          '<h2 class="trans-heading">Kontohändelser från ' + iso(config.from) + ' till ' + iso(config.to) + '</h2>';
      }

      html += '<table class="trans"><colgroup>' +
        '<col class="c-date"><col class="c-name"><col class="c-amount"><col class="c-saldo">' +
        '</colgroup><thead><tr><th>Bokföringsdag</th><th>Beskrivning</th>' +
        '<th class="num">Belopp</th><th class="num">Saldo</th></tr></thead><tbody>' +
        body + '</tbody></table>' +
        '<div class="footer"><div>Nordea Bank Abp, filial i Sverige</div>' +
        '<div class="pageno">Sida ' + (p + 1) + ' (' + pagesNeeded + ')</div>' +
        '<div class="note">DEMOVERSION · ENDAST FÖR UTBILDNING · EJ GILTIG HANDLING</div></div>' +
        '</div></div>';
    }

    // Balance summary page
    html += '<div class="page bank-nordea">' + nordeaWave() +
      '<div class="content">' +
      '<div class="header">' + nordeaLogo() +
      '<div class="created">Skapad ' + iso(new Date()) + '</div></div>' +
      '<h2 class="section">Sammanställning</h2><div class="rule"></div>' +
      '<table class="balances">' +
      '<tr><td>Ingående saldo</td><td class="val">' + fmt(config.startBalance) + '</td></tr>' +
      '<tr><td>Summa insättningar (' + ic + ')</td><td class="val">' + fmt(income) + '</td></tr>' +
      '<tr><td>Summa uttag (' + ec + ')</td><td class="val">' + fmt(expense) + '</td></tr>' +
      '<tr><td><b>Utgående saldo</b></td><td class="val"><b>' + fmt(result.finalBalance) + '</b></td></tr>' +
      '</table>' +
      '<div class="footer"><div class="note">DEMOVERSION · ENDAST FÖR UTBILDNING</div></div>' +
      '</div></div>';

    return html;
  }

  /* ---------- SWEDBANK ---------- */
  function renderSwedbank(person, config, result) {
    var rows = result.rows;
    var perPage = 28;
    var pagesNeeded = Math.max(1, Math.ceil(rows.length / perPage));
    var html = '';
    for (var p = 0; p < pagesNeeded; p++) {
      var slice = rows.slice(p * perPage, (p + 1) * perPage);
      var body = '';
      if (p === 0) {
        body += '<tr class="sum"><td colspan="3">Saldo &nbsp; ' + iso(config.to) +
          '</td><td class="r">' + fmt(result.finalBalance) + '</td></tr>';
      }
      slice.forEach(function (r) {
        body += '<tr><td>' + iso(r.b) + '</td><td>' + esc(r.desc) +
          '</td><td class="r">' + fmt(r.amount) + '</td><td class="r">' + fmt(r.saldo) + '</td></tr>';
      });
      if (p === pagesNeeded - 1) {
        body += '<tr class="sum"><td colspan="3">Ingående saldo &nbsp; ' + iso(config.from) +
          '</td><td class="r">' + fmt(config.startBalance) + '</td></tr>';
      }

      html += '<div class="page bank-swedbank">' +
        '<div class="top"><div class="logo"><img src="assets/swedbank-logo.svg" alt="Swedbank" style="height:26px"></div>' +
        '<div class="head-right"><div class="title">Transaktioner</div>' +
        '<div class="meta"><span>Skapad &nbsp; ' + iso(new Date()) + '</span>' +
        '<span>Sida &nbsp; ' + (p + 1) + '</span></div></div></div>';

      if (p === 0) {
        html += '<div class="acct">' +
          '<div><span class="k">Kontoinnehavare</span>' + esc(person.name) + '</div>' +
          '<div><span class="k">Kontonummer</span>' + esc(person.account) + '</div>' +
          '<div><span class="k">Clearingnummer</span>' + esc(person.clearing) + '</div>' +
          '<div><span class="k">IBAN</span>' + esc(person.iban) + '</div>' +
          '</div>' +
          '<div class="export"><div class="h">Exporterad information</div>' +
          'Alla insättningar och uttag<br>' + iso(config.from) + ' till ' + iso(config.to) + '</div>';
      }

      html += '<table class="tx"><thead><tr>' +
        '<th>Bokföringsdag</th><th>Beskrivning</th><th class="r">Belopp</th><th class="r">Saldo</th>' +
        '</tr></thead><tbody>' + body + '</tbody></table>' +
        '<div class="foot">DEMOVERSION · ENDAST FÖR UTBILDNING · EJ GILTIG HANDLING</div>' +
        '</div>';
    }
    return html;
  }

  /* ---------- REVOLUT (simplified) ---------- */
  function renderRevolut(person, config, result) {
    var rows = result.rows;
    var perPage = 22;
    var pagesNeeded = Math.max(1, Math.ceil(rows.length / perPage));
    var html = '';
    for (var p = 0; p < pagesNeeded; p++) {
      var slice = rows.slice(p * perPage, (p + 1) * perPage);
      var body = '';
      slice.forEach(function (r) {
        var out = r.amount < 0 ? fmt(Math.abs(r.amount)) : '';
        var inn = r.amount > 0 ? fmt(r.amount) : '';
        body += '<tr><td class="date">' + iso(r.b) + '</td><td class="desc"><div class="main">' +
          esc(r.desc) + '</div></td><td class="out">' + out + '</td><td class="in">' + inn +
          '</td><td class="bal">' + fmt(r.saldo) + '</td></tr>';
      });

      html += '<div class="page bank-revolut">' +
        '<div class="wm"><span>ÖVNINGSEXEMPEL</span><span>ÖVNINGSEXEMPEL</span><span>ÖVNINGSEXEMPEL</span></div>' +
        '<header><img class="logo" src="assets/revolut-logo.png" alt="Revolut">' +
        '<div class="hdr-r"><div class="title">Kontoutdrag</div>' +
        '<div class="gen">Genererat ' + iso(new Date()) + '</div>' +
        '<div class="bank">Revolut Bank UAB</div></div></header>' +
        '<main>';
      if (p === 0) {
        html += '<div class="who"><div class="name">' + esc(person.name) + '</div>' +
          '<div class="addr">' + esc(person.address || '') + '</div>' +
          '<div class="acct"><div><span class="k">IBAN</span> ' + esc(person.iban) + '</div>' +
          '<div><span class="k">BIC</span> ' + esc(person.bic || 'EVIULT2VXXX') + '</div></div></div>' +
          '<h2>Kontotransaktioner</h2>' +
          '<p class="note">Period ' + iso(config.from) + ' – ' + iso(config.to) +
          '. Ingående saldo ' + fmt(config.startBalance) + '. Utgående saldo ' + fmt(result.finalBalance) + '.</p>';
      } else {
        html += '<h2>Kontotransaktioner (forts.)</h2>';
      }
      html += '<table class="tx five"><thead><tr>' +
        '<th>Datum</th><th>Beskrivning</th><th>Pengar ut</th><th>Pengar in</th><th>Saldo</th>' +
        '</tr></thead><tbody>' + body + '</tbody></table></main>' +
        '<footer><div class="copy">DEMOVERSION · ENDAST FÖR UTBILDNING</div>' +
        '<div class="pageno">Sida ' + (p + 1) + ' av ' + pagesNeeded + '</div></footer></div>';
    }
    return html;
  }

  function render(bank, person, config, result) {
    if (bank === 'swedbank') return renderSwedbank(person, config, result);
    if (bank === 'revolut') return renderRevolut(person, config, result);
    return renderNordea(person, config, result);
  }

  global.BankRender = { render: render, fmt: fmt, iso: iso };
})(typeof window !== 'undefined' ? window : globalThis);
