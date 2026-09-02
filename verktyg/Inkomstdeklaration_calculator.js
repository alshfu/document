(function () {
  'use strict';

  /* ============================================================
     Константы налогового года 2025 (deklaration 2026)
     ============================================================ */
  var AR2025 = {
    PBB: 58800,             // prisbasbelopp 2025
    IBB: 80600,             // inkomstbasbelopp 2025
    SKIKTGRANS: 625800,     // нижняя граница statlig inkomstskatt (beskattningsbar)
    STATLIG_SATS: 0.20,
    PENSION_SATS: 0.07,     // allmän pensionsavgift
    PENSION_TAK_IBB: 8.07,  // потолок базы: 8,07 IBB
    PS_MAX: 1249,           // public service-avgift, максимум 2025
    PS_SATS: 0.01,          // 1 % от beskattningsbar förvärvsinkomst
    RANTA_ANDEL: 0.5,       // 2025: только 50 % процентов по кредитам без залога вычитаемы (2026: 0 %)
    KAPITAL_RED: 0.30,      // 30 % скидка на underskott av kapital до 100 000
    KAPITAL_RED_OVER: 0.21, // 21 % свыше 100 000
    AKASSA_RED: 0.25,       // с 1 juli 2025: 25 % взноса в a-kassa
    FORV_RED_MAX: 1500,     // skattereduktion för förvärvsinkomst
    FORV_RED_GOLV: 40000,   // от 40 000 kr beskattningsbar
    FORV_RED_SATS: 0.0075   // 0,75 % на интервале до max
  };

  /* Входные данные (редактируемые ячейки) */
  var state = {
    lon: 0,                 // lön от работодателя (arbetsinkomst — даёт jobbskatteavdrag)
    lonSkatt: null,         // avdragen skatt с зарплаты; null = стандартный расчёт по таблице
    inkomstFK: 222185,      // sjukpenning от Försäkringskassan (jobbskatteavdrag не положен)
    avdragenFK: 59744,      // avdragen skatt по KU от FK
    kommunalSats: 32.43,    // kommunal + region, %
    begravningSats: 0.293,  // %
    ranta0: 108, ranta1: 31, ranta2: 1,  // ränteutgifter, lån utan säkerhet
    akassa: 2015            // взнос в a-kassa за год
  };

  var SATS_KEYS = { kommunalSats: 1, begravningSats: 1 };  // поля-проценты (дробные)

  /* ============================================================
     Хелперы округления по правилам Skatteverket
     ============================================================ */
  function nedat100(x)  { return Math.floor(x / 100) * 100; }  // вниз до сотни
  function uppat100(x)  { return Math.ceil(x / 100) * 100; }   // вверх до сотни
  // до ближайшей сотни, ровно 50 — вниз (правило для allmän pensionsavgift)
  function narmast100(x) { var r = x % 100; return r > 50 ? x - r + 100 : x - r; }

  /* Grundavdrag 2025+ (63 kap. 3 § IL), в долях prisbasbelopp,
     аргумент — fastställd förvärvsinkomst */
  function grundavdrag(ffi) {
    var p = AR2025.PBB, k = ffi / p, ga;
    if      (k <= 0.99) ga = 0.423 * p;
    else if (k <= 2.72) ga = 0.423 * p + 0.20 * (ffi - 0.99 * p);
    else if (k <= 3.11) ga = 0.77 * p;
    else if (k <= 7.88) ga = 0.77 * p - 0.10 * (ffi - 3.11 * p);
    else                ga = 0.293 * p;
    return Math.min(uppat100(ga), ffi);   // округляется вверх, не больше самого дохода
  }

  /* Jobbskatteavdrag 2025 (67 kap. 7 § IL, лица моложе 66 лет).
     ai — arbetsinkomst (lön и т.п.; sjukpenning НЕ считается),
     ga — фактический grundavdrag, ks — kommunalskattesats в %.
     Ступени в prisbasbelopp: 0,91 / 3,24 / 8,08;
     underlag: 0,91 PBB + 38,74 % → 1,813 PBB + 19,9 % → потолок 2,776 PBB. */
  function jobbskatteavdrag(ai, ga, ks) {
    ai = nedat100(ai);   // SKV 433: arbetsinkomsten avrundas nedåt till helt hundratal
    if (ai <= 0) return 0;
    var p = AR2025.PBB, u;
    if      (ai <= 0.91 * p) u = ai;
    else if (ai <= 3.24 * p) u = 0.91 * p + 0.3874 * (ai - 0.91 * p);
    else if (ai <= 8.08 * p) u = 1.813 * p + 0.199 * (ai - 3.24 * p);
    else                     u = 2.776 * p;
    return Math.max(0, Math.floor((u - ga) * ks / 100));
  }

  /* Налоги и скидки, известные из дохода: общая часть для итогового
     расчёта и для стандартного расчёта удержания работодателем.
     inkomst — весь доход, ai — из него arbetsinkomst (lön) */
  function skattePost(inkomst, ai, s) {
    var t = {};
    t.ffi = nedat100(inkomst);                         // fastställd: вниз до сотни
    t.grundavdrag = grundavdrag(t.ffi);
    t.bfi = t.ffi - t.grundavdrag;                     // beskattningsbar förvärvsinkomst
    t.kommunal = Math.floor(t.bfi * s.kommunalSats / 100);
    t.statlig  = Math.floor(Math.max(0, t.bfi - AR2025.SKIKTGRANS) * AR2025.STATLIG_SATS);
    var pensionUnderlag = Math.min(t.ffi, nedat100(AR2025.PENSION_TAK_IBB * AR2025.IBB));
    t.pension = narmast100(pensionUnderlag * AR2025.PENSION_SATS);
    t.begravning = Math.floor(t.bfi * s.begravningSats / 100);
    t.publicservice = Math.min(AR2025.PS_MAX, Math.floor(t.bfi * AR2025.PS_SATS));
    t.summaSkatt = t.kommunal + t.statlig + t.pension + t.begravning + t.publicservice;
    t.redPension = t.pension;   // компенсируется полностью
    // jobbskatteavdrag зачитывается только против kommunal inkomstskatt (67 kap. 2 § IL)
    t.jobbskatteavdrag = Math.min(
      jobbskatteavdrag(ai, t.grundavdrag, s.kommunalSats), t.kommunal);
    t.redForvarv = Math.min(AR2025.FORV_RED_MAX,
      Math.floor(Math.max(0, t.bfi - AR2025.FORV_RED_GOLV) * AR2025.FORV_RED_SATS));
    return t;
  }

  /* Стандартное удержание работодателем (методика skattetabell, SKV 433):
     годовой налог на зарплату как на единственный доход, без личных
     вычетов работника (ränta, a-kassa), о которых работодатель не знает */
  function standardAvdrag(s) {
    if (s.lon <= 0) return 0;
    var t = skattePost(s.lon, s.lon, s);
    return Math.max(0, t.summaSkatt - t.redPension - t.jobbskatteavdrag - t.redForvarv);
  }

  /* ============================================================
     Полный пересчёт: state -> все производные величины
     ============================================================ */
  function berakna(s) {
    // --- доход ---
    var r = skattePost(s.lon + s.inkomstFK, s.lon, s);
    r.inkomst = s.lon + s.inkomstFK;                   // inkomst av tjänst = lön + sjukpenning
    // avdragen skatt с зарплаты: ручное значение или стандартный расчёт
    r.lonSkatt = s.lonSkatt == null ? standardAvdrag(s) : s.lonSkatt;
    r.avdragen = r.lonSkatt + s.avdragenFK;            // весь удержанный налог

    // --- kapital ---
    r.rantorSumma = s.ranta0 + s.ranta1 + s.ranta2;
    r.ranteavdrag = Math.floor(r.rantorSumma * AR2025.RANTA_ANDEL); // 2025: 50 %
    r.underskott = r.ranteavdrag;                      // underskott av kapital

    // --- skattereduktioner, зависящие от личных данных ---
    r.redUnderskott = r.underskott <= 100000
      ? Math.floor(r.underskott * AR2025.KAPITAL_RED)
      : Math.floor(100000 * AR2025.KAPITAL_RED + (r.underskott - 100000) * AR2025.KAPITAL_RED_OVER);
    r.redAkassa = Math.floor(s.akassa * AR2025.AKASSA_RED);
    // скидки не могут увести налог ниже нуля (упрощение: без разбиения по видам налога)
    r.summaRed = Math.min(
      r.redPension + r.jobbskatteavdrag + r.redForvarv + r.redUnderskott + r.redAkassa,
      r.summaSkatt);

    // --- итог ---
    r.slutlig = r.summaSkatt - r.summaRed;
    r.diff = r.avdragen - r.slutlig;                   // >0 — вернут, <0 — доплатить

    return r;
  }

  /* ============================================================
     Обратный пересчёт: правка итоговой суммы меняет составляющие.
     Разница уходит в первую компоненту (остальные не трогаем).
     ============================================================ */
  // эффективный удержанный налог с зарплаты (ручной или стандартный)
  function effLonSkatt() {
    return state.lonSkatt == null ? standardAvdrag(state) : state.lonSkatt;
  }

  var backsolve = {
    inkomst:       function (v) { state.inkomstFK = Math.max(0, v - state.lon); },
    inkomstSumma:  function (v) { state.inkomstFK = Math.max(0, v - state.lon); },
    avdragenNeg:   function (v) { state.avdragenFK = Math.max(0, v - effLonSkatt()); },
    avdragenSumma: function (v) { state.avdragenFK = Math.max(0, v - effLonSkatt()); },
    rantorSumma:   function (v) { state.ranta0 = Math.max(0, v - state.ranta1 - state.ranta2); }
  };

  /* ============================================================
     Форматирование
     ============================================================ */
  function fmt(n) {
    n = Math.round(n);
    var s = Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return n < 0 ? '- ' + s : s;
  }
  function fmtNeg(n) { return n === 0 ? '0' : '- ' + fmt(Math.abs(n)); }
  function fmtSats(x) { return x.toString().replace('.', ','); }

  function parseCell(key, text) {
    if (SATS_KEYS[key]) {
      var v = parseFloat(text.replace(/\s| /g, '').replace(',', '.'));
      return isFinite(v) && v >= 0 ? v : null;
    }
    var digits = text.replace(/[^\d]/g, '');   // знак и пробелы игнорируем
    var n = parseInt(digits, 10);
    return isFinite(n) ? n : null;
  }

  /* ============================================================
     Привязка к DOM.
     Страницы целиком contenteditable, поэтому ячейки НЕ являются
     отдельными editing host'ами: события input приходят на .page,
     а «текущую ячейку» определяем по положению курсора (selection).
     ============================================================ */
  function render(skipEl) {
    var r = berakna(state);
    var out = {
      inkomst: r.inkomst, ffi: r.ffi, grundavdrag: r.grundavdrag, bfi: r.bfi,
      ranteavdrag: r.ranteavdrag, underskott: r.underskott,
      kommunal: r.kommunal, statlig: r.statlig, pension: r.pension,
      begravning: r.begravning, publicservice: r.publicservice,
      summaSkatt: r.summaSkatt, summaSkatt2: r.summaSkatt,
      redPension: r.redPension, jobbskatteavdrag: r.jobbskatteavdrag,
      redForvarv: r.redForvarv,
      redUnderskott: r.redUnderskott, redAkassa: r.redAkassa,
      summaRed: r.summaRed, summaRed2: r.summaRed,
      slutlig: r.slutlig, slutlig2: r.slutlig,
      avdragenNeg: r.avdragen,
      diff: Math.abs(r.diff),
      inkomstSumma: r.inkomst, rantorSumma: r.rantorSumma,
      avdragenSumma: r.avdragen
    };

    document.querySelectorAll('[data-out]').forEach(function (el) {
      if (el === skipEl) return;                 // не трогаем ячейку под курсором
      var key = el.getAttribute('data-out');
      if (key === 'diffLabel') {
        el.textContent = (r.diff >= 0
          ? 'Beräknat belopp att få tillbaka'
          : 'Beräknat belopp att betala')
          + ' (exklusive ränta, egen inbetalning, debiterad preliminär skatt)';
        return;
      }
      if (!(key in out)) return;
      el.textContent = el.hasAttribute('data-neg') ? fmtNeg(out[key]) : fmt(out[key]);
    });

    // строки, которые показываем только при ненулевом значении
    document.getElementById('row-statlig').hidden = r.statlig === 0;
    document.getElementById('row-jsa').hidden = r.jobbskatteavdrag === 0;

    // синхронизация входных полей (в т.ч. продублированных)
    document.querySelectorAll('[data-in]').forEach(function (el) {
      if (el === skipEl) return;
      var key = el.getAttribute('data-in');
      var val = key === 'lonSkatt' ? r.lonSkatt : state[key];  // lonSkatt: авто или ручное
      el.textContent = SATS_KEYS[key] ? fmtSats(val) : fmt(val);
    });
  }

  if (typeof document !== 'undefined') {
    // ячейка данных, в которой сейчас стоит курсор
    function cellFromSelection() {
      var sel = window.getSelection();
      var n = sel && sel.anchorNode;
      if (!n) return null;
      var el = n.nodeType === 1 ? n : n.parentElement;
      return el ? el.closest('[data-in],[data-out]') : null;
    }

    var editingCell = null;    // ячейка с курсором (для подсветки и отката)

    document.querySelectorAll('.page').forEach(function (page) {
      page.setAttribute('contenteditable', 'true');
      page.setAttribute('spellcheck', 'false');

      // вставка только как простой текст, чтобы не ломать вёрстку
      page.addEventListener('paste', function (e) {
        e.preventDefault();
        var t = (e.clipboardData || window.clipboardData).getData('text/plain');
        document.execCommand('insertText', false, t);
      });

      // ввод: разбираем ячейку, в которой стоит курсор
      page.addEventListener('input', function () {
        var cell = cellFromSelection();
        if (!cell) return;                                   // правка свободного текста
        var inKey = cell.getAttribute('data-in');
        var outKey = cell.getAttribute('data-out');
        var v;
        if (inKey) {
          v = parseCell(inKey, cell.textContent);
          if (inKey === 'lonSkatt' && v === null) {
            state.lonSkatt = null;                     // ячейку очистили: снова стандартный расчёт
            render(cell);
          } else if (v !== null) {
            state[inKey] = SATS_KEYS[inKey] ? v : Math.max(0, v);
            render(cell);
          }
        } else if (outKey && backsolve[outKey]) {
          v = parseCell(outKey, cell.textContent);
          if (v !== null) { backsolve[outKey](v); render(cell); }
        }
        // прочие data-out: правку не применяем — откатится, когда курсор уйдёт
      });

      // Enter внутри ячейки данных = зафиксировать (без переноса строки)
      page.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && cellFromSelection()) {
          e.preventDefault();
          render();
        }
      });
    });

    // курсор перешёл в другую ячейку: подсветка + переформатирование покинутой
    // ячейки (заодно откатываются ручные правки чисто расчётных ячеек)
    document.addEventListener('selectionchange', function () {
      var cell = cellFromSelection();
      if (cell === editingCell) return;
      if (editingCell) editingCell.classList.remove('editing');
      if (cell) cell.classList.add('editing');
      editingCell = cell;
      render(cell);              // всё, кроме ячейки, в которую пришёл курсор
    });

    // ушли со страницы: переформатировать всё, кроме ячейки с курсором
    document.addEventListener('focusout', function () { render(cellFromSelection()); });

    // пометить суммы, которые можно править напрямую (для подсветки)
    document.querySelectorAll('[data-out]').forEach(function (el) {
      if (backsolve[el.getAttribute('data-out')]) el.classList.add('backsolve');
    });

    render();
  }

  // для тестов в Node
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AR2025: AR2025, state: state, berakna: berakna,
      grundavdrag: grundavdrag, jobbskatteavdrag: jobbskatteavdrag,
      standardAvdrag: standardAvdrag };
  }
})();
