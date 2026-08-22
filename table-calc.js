/*
 * table-calc.js
 * 1) Делает содержимое всех таблиц редактируемым (contenteditable).
 * 2) Превращает таблицы в «калькулятор»: колонка «Остаток» пересчитывается
 *    сквозь весь документ, как только вы меняете любую «Сумму»
 *    (или входящий остаток на первой строке).
 *
 * Логика: остаток = предыдущий остаток + сумма строки.
 * Строки без суммы (входящий остаток, «остаток с предыдущей страницы»,
 * «исходящий остаток») просто несут накопленный итог дальше.
 *
 * Формат чисел — шведский: пробел — разделитель тысяч, запятая — десятичный.
 */
(function () {
    'use strict';

    // Индексы колонок (0-based): 4 — «Сумма», 5 — «Остаток».
    var COL_AMOUNT = 4;
    var COL_BALANCE = 5;

    // "1 695,83" / "-2 430,00" / "" -> число или null (если пусто/не число)
    function parseNum(text) {
        var s = String(text).replace(/ /g, ' ').trim();
        if (s === '') return null;
        s = s.replace(/\s/g, '').replace('−', '-').replace(',', '.');
        var n = parseFloat(s);
        return isNaN(n) ? null : n;
    }

    // 1695.83 -> "1 695,83"
    function fmt(n) {
        var neg = n < 0;
        var parts = Math.abs(n).toFixed(2).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return (neg ? '-' : '') + parts[0] + ',' + parts[1];
    }

    // Записать значение в ячейку, не трогая ту, которую сейчас редактируют.
    function writeCell(cell, value, skipCell) {
        if (cell === skipCell) return;
        var next = fmt(value);
        if (cell.textContent !== next) cell.textContent = next;
    }

    // Все строки данных из всех таблиц в порядке документа.
    function allRows() {
        return Array.prototype.slice.call(
            document.querySelectorAll('table tbody tr')
        );
    }

    function recalc(skipCell) {
        var rows = allRows();
        var running = null; // накопленный остаток

        for (var i = 0; i < rows.length; i++) {
            var cells = rows[i].cells;
            if (cells.length <= COL_BALANCE) continue;

            var amountCell = cells[COL_AMOUNT];
            var balanceCell = cells[COL_BALANCE];
            var amount = parseNum(amountCell.textContent);

            if (amount !== null) {
                // Обычная проводка: прибавляем сумму.
                running = (running === null ? 0 : running) + amount;
                writeCell(balanceCell, running, skipCell);
            } else if (running === null) {
                // Самая первая строка без суммы = входящий остаток (стартовое значение).
                var seed = parseNum(balanceCell.textContent);
                running = (seed === null ? 0 : seed);
            } else {
                // Строка-перенос / итог: несёт накопленный остаток дальше.
                writeCell(balanceCell, running, skipCell);
            }
        }
    }

    function makeEditable() {
        var cells = document.querySelectorAll('table td, table th');
        for (var i = 0; i < cells.length; i++) {
            cells[i].setAttribute('contenteditable', 'true');
        }
    }

    // Небольшая подсветка редактируемой ячейки (не влияет на печать).
    function injectStyle() {
        var css =
            'table td:focus, table th:focus{outline:2px solid #4a90d9;' +
            'outline-offset:-2px;background:#eef5ff;}' +
            '.tc-bar{position:fixed;top:10px;right:10px;z-index:9999;' +
            'display:flex;gap:8px;font-family:Arial,sans-serif;font-size:13px;}' +
            '.tc-bar button{padding:7px 12px;border:0;border-radius:6px;' +
            'cursor:pointer;color:#fff;box-shadow:0 1px 4px rgba(0,0,0,.3);}' +
            '.tc-save{background:#2e7d32;} .tc-reset{background:#b23b3b;}' +
            '.tc-note{position:fixed;top:10px;left:50%;transform:translateX(-50%);' +
            'z-index:9999;background:#323232;color:#fff;padding:8px 16px;' +
            'border-radius:6px;font-family:Arial,sans-serif;font-size:13px;' +
            'opacity:0;transition:opacity .2s;pointer-events:none;}' +
            '.tc-note.show{opacity:1;}' +
            '@media print{table td:focus,table th:focus' +
            '{outline:none;background:none;} .tc-ui{display:none!important;}}';
        var style = document.createElement('style');
        style.className = 'tc-ui';
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ---------- Сохранение ----------

    var STORAGE_KEY = 'tablecalc:' + location.pathname;
    var fileHandle = null;
    var saveTimer = null;

    // Автосохранение содержимого таблиц в память браузера (localStorage).
    function saveLocal() {
        try {
            var tables = document.querySelectorAll('table');
            var data = [];
            for (var i = 0; i < tables.length; i++) data.push(tables[i].innerHTML);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) { /* приватный режим / переполнение — молча пропускаем */ }
    }

    // Восстановление ранее сохранённых правок при открытии страницы.
    function restoreLocal() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            var data = JSON.parse(raw);
            var tables = document.querySelectorAll('table');
            for (var i = 0; i < tables.length && i < data.length; i++) {
                tables[i].innerHTML = data[i];
            }
        } catch (e) { /* повреждённые данные — игнорируем */ }
    }

    function scheduleSave() {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(saveLocal, 400);
    }

    // Полный HTML документа с текущими правками, но без служебных кнопок.
    function serializeDoc() {
        var clone = document.documentElement.cloneNode(true);
        var ui = clone.querySelectorAll('.tc-ui');
        for (var i = 0; i < ui.length; i++) ui[i].parentNode.removeChild(ui[i]);
        return '<!DOCTYPE html>\n' + clone.outerHTML;
    }

    function flash(msg) {
        var n = document.querySelector('.tc-note');
        if (!n) return;
        n.textContent = msg;
        n.classList.add('show');
        setTimeout(function () { n.classList.remove('show'); }, 1800);
    }

    // Скачивание файла — запасной вариант, если запись напрямую недоступна.
    function downloadFallback() {
        var name = location.pathname.split('/').pop() || 'document.html';
        var blob = new Blob([serializeDoc()], { type: 'text/html' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = decodeURIComponent(name);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
        flash('Файл скачан — замените им исходный');
    }

    // Запись изменений в настоящий .html через File System Access API.
    function saveToFile() {
        saveLocal();
        if (!window.showSaveFilePicker) { downloadFallback(); return; }
        var name = decodeURIComponent(location.pathname.split('/').pop() || 'document.html');
        Promise.resolve()
            .then(function () {
                if (fileHandle) return fileHandle;
                return window.showSaveFilePicker({
                    suggestedName: name,
                    types: [{ description: 'HTML', accept: { 'text/html': ['.html', '.htm'] } }]
                }).then(function (h) { fileHandle = h; return h; });
            })
            .then(function (h) { return h.createWritable(); })
            .then(function (w) {
                return w.write(serializeDoc()).then(function () { return w.close(); });
            })
            .then(function () { flash('Сохранено в файл'); })
            .catch(function (err) {
                if (err && err.name === 'AbortError') return; // пользователь отменил
                downloadFallback(); // нет прав (file://) — скачиваем
            });
    }

    function buildToolbar() {
        var bar = document.createElement('div');
        bar.className = 'tc-bar tc-ui';

        var save = document.createElement('button');
        save.className = 'tc-save';
        save.textContent = '💾 Сохранить в файл';
        save.addEventListener('click', saveToFile);

        var reset = document.createElement('button');
        reset.className = 'tc-reset';
        reset.textContent = '↺ Сбросить';
        reset.addEventListener('click', function () {
            if (!confirm('Отменить все несохранённые правки и вернуть исходные данные?')) return;
            try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
            location.reload();
        });

        bar.appendChild(save);
        bar.appendChild(reset);
        document.body.appendChild(bar);

        var note = document.createElement('div');
        note.className = 'tc-note tc-ui';
        document.body.appendChild(note);
    }

    function init() {
        restoreLocal();   // сначала вернуть прошлые правки
        injectStyle();
        makeEditable();
        buildToolbar();
        recalc();         // пересчитать на случай восстановленных сумм

        // Пересчёт + автосохранение при любом вводе.
        // Пропускаем ту ячейку, что редактируют, чтобы не сбивать курсор.
        document.addEventListener('input', function (e) {
            var cell = e.target.closest ? e.target.closest('td, th') : null;
            if (!cell) return;
            recalc(cell);
            scheduleSave();
        });

        // Ctrl/Cmd+S — сохранить в файл.
        document.addEventListener('keydown', function (e) {
            if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
                e.preventDefault();
                saveToFile();
            }
        });

        // Подстраховка: сохранить в память перед уходом со страницы.
        window.addEventListener('beforeunload', saveLocal);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
