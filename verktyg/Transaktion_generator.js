'use strict';

/* ==========================================================================
   Transaktionsgenerator – syntetisk testdata för bokföringsövning.
   Ingen verklig bank, person eller kontohistorik.
   ========================================================================== */

/* ---------- allmänna konstanter ---------- */
const rowsPerPage = 55;
const msPerDay = 86400000;
const truncateLength = 12;
const centsPerKrona = 100;
const decimalPlaces = 2;
const groupSize = 3;
const isoLength = 10;
const decimalBase = 10;
const accountDigits = 12;
const phoneDigits = 8;
const swishPrefix = '+467';

/* ---------- deterministisk slump (linjär kongruens) ---------- */
const lcgMultiplier = 1664525;
const lcgIncrement = 1013904223;
const lcgModulus = 4294967296;
let rngState = 1;

function seedRandom(seed) {
    let start = seed % lcgModulus;
    if (0 === start) {
        start = 1;
    }
    rngState = start;
}

function random() {
    rngState = (rngState * lcgMultiplier + lcgIncrement) % lcgModulus;
    return rngState / lcgModulus;
}

function randomBetween(low, high) {
    return low + random() * (high - low);
}

function randomInt(low, high) {
    const value = randomBetween(low, high + 1);
    return Math.floor(value);
}

function choose(list) {
    const value = random();
    const index = Math.floor(value * list.length);
    return list[index];
}

function randomDigits(count) {
    let text = '';
    while (text.length < count) {
        const value = random();
        const digit = Math.floor(value * decimalBase);
        text += digit;
    }
    return text;
}

/* ---------- belopp: "4 224,17" ---------- */
function roundKronor(value) {
    return Math.round(value * centsPerKrona) / centsPerKrona;
}

function groupThousands(digitsText) {
    let out = '';
    let count = 0;
    let i = digitsText.length - 1;
    while (0 <= i) {
        out = digitsText.charAt(i) + out;
        count += 1;
        if (0 === count % groupSize && 0 < i) {
            out = ' ' + out;
        }
        i -= 1;
    }
    return out;
}

function formatSek(value) {
    const absolute = Math.abs(value);
    const fixed = absolute.toFixed(decimalPlaces);
    const dot = fixed.indexOf('.');
    const integerPart = fixed.slice(0, dot);
    const fraction = fixed.slice(dot + 1);
    const grouped = groupThousands(integerPart);
    let sign = '';
    if (0 > value) {
        sign = '-';
    }
    return sign + grouped + ',' + fraction;
}

function parseAmount(text) {
    const raw = String(text);
    let cleaned = '';
    for (const ch of raw) {
        if (' ' !== ch && ' ' !== ch) {
            cleaned += ch;
        }
    }
    const normalised = cleaned.replace(',', '.');
    const value = parseFloat(normalised);
    let result = null;
    if (!isNaN(value)) {
        result = roundKronor(value);
    }
    return result;
}

/* ---------- datum (UTC-midnatt hela vägen) ---------- */
function utcDate(year, month, day) {
    const ms = Date.UTC(year, month, day);
    return new Date(ms);
}

function isoDate(date) {
    const full = date.toISOString();
    return full.slice(0, isoLength);
}

function addDays(date, count) {
    return new Date(date.getTime() + count * msPerDay);
}

function daysInMonth(year, month) {
    const firstNextMonth = utcDate(year, month + 1, 1);
    const lastThisMonth = addDays(firstNextMonth, -1);
    return lastThisMonth.getUTCDate();
}

/* Påskdagen – gregoriansk beräkning (Computus). Namngivna konstanter håller
   inspektionen "magic number" tyst utan att röra själva algoritmen. */
const golden = 19;
const centuryDiv = 100;
const quarter = 4;
const octaeteris = 8;
const metonic = 25;
const triennial = 3;
const epact = 15;
const lunarMonth = 30;
const paschalBase = 32;
const weekLength = 7;
const leapWeight = 11;
const springWeight = 22;
const correction = 451;
const monthBase = 114;
const monthSpan = 31;

function easterSunday(year) {
    const a = year % golden;
    const b = Math.floor(year / centuryDiv);
    const c = year % centuryDiv;
    const d = Math.floor(b / quarter);
    const e = b % quarter;
    const f = Math.floor((b + octaeteris) / metonic);
    const g = Math.floor((b - f + 1) / triennial);
    const hRaw = golden * a + b - d - g + epact;
    const h = hRaw % lunarMonth;
    const i = Math.floor(c / quarter);
    const k = c % quarter;
    const twoE = 2 * e;
    const twoI = 2 * i;
    const lRaw = paschalBase + twoE + twoI - h - k;
    const l = lRaw % weekLength;
    const mRaw = a + leapWeight * h + springWeight * l;
    const m = Math.floor(mRaw / correction);
    const monthExpr = h + l - weekLength * m + monthBase;
    const monthNumber = Math.floor(monthExpr / monthSpan);
    const dayNumber = (monthExpr % monthSpan) + 1;
    return utcDate(year, monthNumber - 1, dayNumber);
}

/* svenska helgdagar då bankerna håller stängt */
const january = 0;
const may = 4;
const june = 5;
const december = 11;
const epiphanyDay = 6;
const mayFirst = 1;
const nationalDay = 6;
const christmasEve = 24;
const christmasDay = 25;
const boxingDay = 26;
const newYearEve = 31;
const goodFridayOffset = -2;
const easterMondayOffset = 1;
const ascensionOffset = 39;
const midsummerFrom = 19;
const midsummerTo = 25;
const friday = 5;
const saturday = 6;
const sunday = 0;

const holidayCache = {};

function fixedHolidayDates(year) {
    const easter = easterSunday(year);
    return [
        utcDate(year, january, 1),
        utcDate(year, january, epiphanyDay),
        addDays(easter, goodFridayOffset),
        addDays(easter, easterMondayOffset),
        utcDate(year, may, mayFirst),
        addDays(easter, ascensionOffset),
        utcDate(year, june, nationalDay),
        utcDate(year, december, christmasEve),
        utcDate(year, december, christmasDay),
        utcDate(year, december, boxingDay),
        utcDate(year, december, newYearEve)
    ];
}

function midsummerEve(year) {
    let day = midsummerFrom;
    let found = utcDate(year, june, midsummerFrom);
    while (day <= midsummerTo) {
        const candidate = utcDate(year, june, day);
        if (friday === candidate.getUTCDay()) {
            found = candidate;
            day = midsummerTo;
        }
        day += 1;
    }
    return found;
}

function holidaySet(year) {
    if (holidayCache[year]) {
        return holidayCache[year];
    }
    const set = {};
    const dates = fixedHolidayDates(year);
    dates.push(midsummerEve(year));
    for (const date of dates) {
        set[isoDate(date)] = true;
    }
    holidayCache[year] = set;
    return set;
}

function isBusinessDay(date) {
    const weekday = date.getUTCDay();
    let result = true;
    if (sunday === weekday || saturday === weekday) {
        result = false;
    } else {
        const set = holidaySet(date.getUTCFullYear());
        if (set[isoDate(date)]) {
            result = false;
        }
    }
    return result;
}

function previousBusinessDay(date) {
    let cursor = date;
    while (!isBusinessDay(cursor)) {
        cursor = addDays(cursor, -1);
    }
    return cursor;
}

function nextBusinessDay(date) {
    let cursor = date;
    while (!isBusinessDay(cursor)) {
        cursor = addDays(cursor, 1);
    }
    return cursor;
}

function addBusinessDays(date, count) {
    let cursor = date;
    let added = 0;
    while (added < count) {
        cursor = addDays(cursor, 1);
        if (isBusinessDay(cursor)) {
            added += 1;
        }
    }
    return cursor;
}

/* ---------- text ---------- */
function truncateName(text) {
    let result = text;
    if (text.length > truncateLength) {
        result = text.slice(0, truncateLength);
    }
    return result;
}

/* svenskt mobilnummer, referens för inkommande/utgående Swish */
function swishPhone() {
    return swishPrefix + randomDigits(phoneDigits);
}

/* ---------- handlarkategorier (generiska, ingen verklig aktör) ---------- */
const foodMin = 89;
const foodMax = 1100;
const foodWeight = 5;
const restaurangMin = 85;
const restaurangMax = 450;
const restaurangWeight = 3;
const restaurangSwish = 0.3;
const clothesMin = 150;
const clothesMax = 2500;
const clothesWeight = 2;
const clothesSwish = 0.1;
const healthMin = 100;
const healthMax = 1400;
const healthWeight = 2;
const healthSwish = 0.25;
const serviceMin = 45;
const serviceMax = 1100;
const serviceWeight = 2;
const serviceSwish = 0.35;

const cardCategories = [
    {
        min: foodMin, max: foodMax, weight: foodWeight, swish: 0,
        names: ['ICA Maxi', 'Angereds Frukt', 'Johans Fisk']
    },
    {
        min: restaurangMin, max: restaurangMax, weight: restaurangWeight, swish: restaurangSwish,
        names: ['Angereds Sushi', 'Bueno', 'Döner King', 'Hawler Bakeshop', 'Hilal Kolgrill',
            'Juventus Pizza', 'Orient Food', 'Restaurang Chung Hwa', 'Shawarma House', 'Som Café']
    },
    {
        min: clothesMin, max: clothesMax, weight: clothesWeight, swish: clothesSwish,
        names: ['Kappahl', 'Deichmann', 'Ur & Penn', 'Damas Juveler', 'Trend Outlet', 'Arabesq',
            'B&B Galleri', 'Angereds Orienthall', 'Orient Center']
    },
    {
        min: healthMin, max: healthMax, weight: healthWeight, swish: healthSwish,
        names: ['Apotek Hjärtat', 'Kronans Apotek', 'Nordic Wellness', 'Angered Barbershop',
            'Beauty Hair Salong', 'Beauty Cuts', 'Salong Hair', 'Sunset Frisör', 'Shiny Days']
    },
    {
        min: serviceMin, max: serviceMax, weight: serviceWeight, swish: serviceSwish,
        names: ['Angereds Kemtvätt', 'Fix & Go', 'Fonus', 'Skomakeri och Nyckelservice',
            'Pressbyrån', 'Resebyrå', 'Jerkstrands']
    }
];

function totalCategoryWeight() {
    let total = 0;
    for (const category of cardCategories) {
        total += category.weight;
    }
    return total;
}

/* viktad dragning (en slinga, ett returvärde) */
function pickCategoryByTicket() {
    const total = totalCategoryWeight();
    let ticket = random() * total;
    let chosen = cardCategories[cardCategories.length - 1];
    let decided = false;
    for (const category of cardCategories) {
        ticket -= category.weight;
        if (0 >= ticket && !decided) {
            chosen = category;
            decided = true;
        }
    }
    return chosen;
}

/* ---------- fasta kostnader ---------- */
const rentDay = 1;
const rentMinRatio = 0.26;
const rentMaxRatio = 0.32;
const rentRounding = 50;
const elDay = 28;
const elMin = 280;
const elMax = 900;
const telenorDay = 20;
const telenorMin = 249;
const telenorMax = 429;
const boxerDay = 15;
const boxerMin = 299;
const boxerMax = 449;

function defaultFixedCosts(config) {
    return [
        {day: elDay, name: 'Göteborgs El', amount: 0},
        {day: telenorDay, name: 'Telenor', amount: Math.round(randomBetween(telenorMin, telenorMax))},
        {day: boxerDay, name: 'Boxer', amount: Math.round(randomBetween(boxerMin, boxerMax))}
    ];
}

function resolveFixedCosts(config) {
    let list = config.fixedCosts;
    if (0 === config.fixedCosts.length) {
        list = defaultFixedCosts(config);
    }
    return list;
}

/* ---------- lönedagar ---------- */
function buildPaydays(config) {
    const paydays = [];
    const startYear = config.from.getUTCFullYear();
    const startMonth = config.from.getUTCMonth();
    let offset = -1;
    let done = false;
    while (!done) {
        const first = utcDate(startYear, startMonth + offset, 1);
        const year = first.getUTCFullYear();
        const month = first.getUTCMonth();
        const wanted = Math.min(config.day, daysInMonth(year, month));
        const wantedDate = utcDate(year, month, wanted);
        paydays.push(previousBusinessDay(wantedDate));
        if (first > config.to) {
            done = true;
        }
        offset += 1;
    }
    return paydays;
}

/* ---------- generering per cykel ---------- */
const budgetLowFactor = 0.92;
const budgetHighFactor = 1.04;
const budgetSpendTarget = 0.95;
const maxPurchasesPerCycle = 60;
const idealLow = 0.5;
const idealHigh = 1.5;
const jitterLow = 0.78;
const jitterHigh = 1;
const minAmountFactor = 0.8;
const weekendBookChance = 0.25;
const incomingSwishChance = 0.3;
const minCycleDaysForSwish = 2;
const incomingMin = 100;
const incomingMax = 900;
const fillRoundStep = 100;
const fillJitterMax = 800;
const topUpMin = 200;
const topUpMax = 1200;

const incomeJitterLow = 0.98;
const incomeJitterHigh = 1.02;
const akassaMaxDays = 300;

function isAkassa(desc) {
    const text = String(desc).toLowerCase();
    return text.indexOf('arbetslöshet') !== -1 ||
           text.indexOf('a-kassa') !== -1 ||
           text.indexOf('akassa') !== -1;
}

function pushIncome(context, cycleStart) {
    if (cycleStart >= context.config.from) {
        if (context.akassaLimit && cycleStart > context.akassaLimit) {
            return;
        }
        const jittered = context.config.income * randomBetween(incomeJitterLow, incomeJitterHigh);
        const income = roundKronor(jittered);
        context.rows.push({
            t: cycleStart, b: cycleStart, v: cycleStart,
            ref: '', desc: truncateName(context.config.desc),
            amount: income
        });
        context.balance += income;
    }
}

function fixedAmountFor(cost) {
    let amount = cost.amount;
    if (0 >= cost.amount) {
        amount = Math.round(randomBetween(elMin, elMax));
    }
    return amount;
}

function pushFixedForMonth(context, year, month, segStart, segEnd) {
    const monthDays = daysInMonth(year, month);
    for (const cost of context.fixedCosts) {
        const amount = fixedAmountFor(cost);
        const wanted = Math.min(cost.day, monthDays);
        const rawDate = utcDate(year, month, wanted);
        const chargeDate = nextBusinessDay(rawDate);
        if (chargeDate >= segStart && chargeDate < segEnd) {
            const name = truncateName(cost.name);
            context.rows.push({t: chargeDate, b: chargeDate, v: chargeDate, ref: name, desc: name, amount: -amount});
            context.balance -= amount;
        }
    }
}

function monthsInRange(segStart, segEnd) {
    const months = [];
    let cursor = utcDate(segStart.getUTCFullYear(), segStart.getUTCMonth(), 1);
    while (cursor < segEnd) {
        const year = cursor.getUTCFullYear();
        const month = cursor.getUTCMonth();
        months.push({year: year, month: month});
        cursor = utcDate(year, month + 1, 1);
    }
    return months;
}

function pushFixedCosts(context, segStart, segEnd) {
    const months = monthsInRange(segStart, segEnd);
    for (const entry of months) {
        pushFixedForMonth(context, entry.year, entry.month, segStart, segEnd);
    }
}

function topUpIfBelowPreSalary(context, segStart) {
    if (context.balance < context.config.preSalary) {
        const target = context.config.preSalary - context.balance + randomBetween(0, fillJitterMax);
        const steps = Math.ceil(target / fillRoundStep);
        const fill = steps * fillRoundStep;
        context.rows.push({
            t: segStart, b: segStart, v: segStart,
            ref: context.savings, desc: truncateName('Överföring v'), amount: fill
        });
        context.balance += fill;
    }
}

function cycleBudget(context) {
    const raw = (context.balance - context.config.preSalary) * randomBetween(budgetLowFactor, budgetHighFactor);
    let budget = raw;
    if (0 > raw) {
        budget = 0;
    }
    return budget;
}

function bookingDay(transactionDay) {
    let booking = nextBusinessDay(transactionDay);
    if (isBusinessDay(transactionDay)) {
        const roll = random();
        if (roll < weekendBookChance) {
            booking = nextBusinessDay(addDays(transactionDay, 1));
        } else {
            booking = transactionDay;
        }
    }
    return booking;
}

/* Bokföringsdag inom angiven period. Om beräknad bokföringsdag hamnar
   efter maxDate återgår vi till transaktionsdagen, men bara om den är
   en bankdag; annars hoppas raden över. */
function clampedBookingDay(transactionDay, maxDate) {
    if (transactionDay > maxDate) {
        return null;
    }
    let booking = bookingDay(transactionDay);
    if (booking > maxDate) {
        if (isBusinessDay(transactionDay)) {
            return transactionDay;
        }
        return null;
    }
    return booking;
}

function purchaseAmount(category, remaining) {
    let ceiling = Math.min(category.max - 0.01, Math.max(category.min + 1, remaining));
    if (ceiling <= category.min) {
        ceiling = category.min + 1;
    }
    const range = ceiling - category.min;
    /* Skev fördelning: flera små köp, färre stora. pow(random, 1.6)
       ger fler värden nära category.min än nära category.max. */
    const skew = Math.pow(random(), 1.6);
    const target = category.min + range * skew;
    const jittered = target * randomBetween(0.8, 1.2);
    const floor = category.min * minAmountFactor;
    let amount = roundKronor(Math.max(floor, Math.min(ceiling, jittered)));
    /* Undvik perfekt runda belopp som 1 100,00 eller 1 300,00 */
    if (amount > 0 && amount % 100 === 0) {
        amount = roundKronor(amount + (random() < 0.5 ? -0.37 : 0.63));
    }
    return amount;
}

function pushPurchases(context, segStart, segEnd, budget) {
    const cycleDays = Math.round((segEnd - segStart) / msPerDay);
    const maxDate = context.config.to;
    let spent = 0;
    let made = 0;
    while (spent < budget * budgetSpendTarget && made < maxPurchasesPerCycle) {
        const category = pickCategoryByTicket();
        const merchant = choose(category.names);
        const remaining = budget - spent;
        const amount = purchaseAmount(category, remaining);
        const offset = randomInt(0, Math.max(0, cycleDays - 1));
        const transactionDay = addDays(segStart, offset);
        const booking = clampedBookingDay(transactionDay, maxDate);
        if (!booking) {
            made += 1;
            continue;
        }
        const asSwish = context.config.swish && random() < category.swish;
        let desc = truncateName(merchant);
        if (asSwish) {
            desc = truncateName('Swish ' + merchant);
        }
        context.rows.push({
            t: transactionDay, b: booking, v: booking,
            ref: truncateName(merchant), desc: desc, amount: -amount
        });
        context.balance -= amount;
        spent += amount;
        made += 1;
    }
}

function maybeIncomingSwish(context, segStart, segEnd) {
    if (!context.config.swish) {
        return;
    }
    const cycleDays = Math.round((segEnd - segStart) / msPerDay);
    const roll = random();
    if (roll < incomingSwishChance && cycleDays > minCycleDaysForSwish) {
        const offset = randomInt(1, cycleDays - 1);
        const day = nextBusinessDay(addDays(segStart, offset));
        const amount = Math.round(randomBetween(incomingMin, incomingMax));
        if (day < segEnd) {
            context.rows.push({t: day, b: day, v: day, ref: swishPhone(), desc: 'Swish mottag', amount: amount});
            context.balance += amount;
        }
    }
}

function fillCycle(context, cycleStart, cycleEnd) {
    let segStart = cycleStart;
    if (cycleStart < context.config.from) {
        segStart = context.config.from;
    }
    let segEnd = cycleEnd;
    if (cycleEnd >= context.periodEnd) {
        segEnd = context.periodEnd;
    }
    if (segStart < segEnd) {
        pushIncome(context, cycleStart);
        pushFixedCosts(context, segStart, segEnd);
        topUpIfBelowPreSalary(context, segStart);
        const budget = cycleBudget(context);
        pushPurchases(context, segStart, segEnd, budget);
        maybeIncomingSwish(context, segStart, segEnd);
    }
}

function fillAllCycles(context, paydays) {
    let index = 0;
    while (index < paydays.length - 1) {
        fillCycle(context, paydays[index], paydays[index + 1]);
        index += 1;
    }
}

/* ---------- efterbearbetning ---------- */
function rowsInPeriod(rows, config) {
    const kept = [];
    for (const row of rows) {
        if (row.b >= config.from && row.b <= config.to) {
            kept.push(row);
        }
    }
    return kept;
}

function compareRows(a, b) {
    return (a.b - b.b) || (a.t - b.t) || (a.amount - b.amount);
}

function makeTopUp(row, savings, balance) {
    return {
        t: row.b, b: row.b, v: row.b,
        ref: savings, desc: truncateName('Överföring v'),
        amount: 0, saldo: balance, fill: true
    };
}

function applyBalanceChain(rows, config, savings) {
    const out = [];
    let balance = config.startBalance;
    const floor = config.preSalary;
    for (const row of rows) {
        if (floor > balance + row.amount) {
            const deficit = -(balance + row.amount) + floor + randomBetween(topUpMin, topUpMax);
            const steps = Math.ceil(deficit / fillRoundStep);
            const need = steps * fillRoundStep;
            balance = roundKronor(balance + need);
            const topUp = makeTopUp(row, savings, balance);
            topUp.amount = need;
            out.push(topUp);
        }
        balance = roundKronor(balance + row.amount);
        if (balance < 0) {
            balance = 0;
        }
        row.saldo = balance;
        out.push(row);
    }
    return {rows: out, finalBalance: balance};
}

function generate(config) {
    seedRandom(config.seed);
    const context = {
        config: config,
        rows: [],
        balance: config.startBalance,
        savings: randomDigits(accountDigits),
        fixedCosts: resolveFixedCosts(config),
        periodEnd: config.to
    };
    if (isAkassa(config.desc)) {
        context.akassaLimit = addBusinessDays(config.from, akassaMaxDays);
    }
    const paydays = buildPaydays(config);
    fillAllCycles(context, paydays);
    const inPeriod = rowsInPeriod(context.rows, config);
    inPeriod.sort(compareRows);
    const chained = applyBalanceChain(inPeriod, config, context.savings);
    chained.rows.reverse();
    return {rows: chained.rows, finalBalance: chained.finalBalance};
}

/* ---------- DOM-hjälpare (samma skelett och tabellstruktur som mallen) ---------- */
function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    if (undefined !== text) {
        element.textContent = text;
    }
    return element;
}

const headers = ['Referens', 'Bokföringsdag', 'Transaktionsdag', 'Valutadag', 'Beskrivning'];

function makeHead() {
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    for (const label of headers) {
        tr.appendChild(makeElement('th', null, label));
    }
    const amountHead = makeElement('th', 'r');
    amountHead.appendChild(document.createTextNode('Belopp'));
    amountHead.appendChild(document.createElement('br'));
    amountHead.appendChild(document.createTextNode('SEK'));
    tr.appendChild(amountHead);
    tr.appendChild(makeElement('th', 'r', 'Bokfört saldo'));
    thead.appendChild(tr);
    return thead;
}

/* ---------- redigering med direkt omräkning ---------- */
const hideDelayMs = 400;
const ctlOffsetLeft = 48;
const ctlOffsetTop = 2;

let stateConfig = null;
let stateRows = null;
let saldoCells = [];
let finalSaldoCell = null;

/* saldokedjan räknas om från ingående saldo, äldsta raden först */
function recalc() {
    let balance = stateConfig.startBalance;
    let i = stateRows.length - 1;
    while (0 <= i) {
        balance = roundKronor(balance + stateRows[i].amount);
        stateRows[i].saldo = balance;
        saldoCells[i].textContent = formatSek(balance);
        i -= 1;
    }
    finalSaldoCell.textContent = formatSek(balance);
}

function editableCell(className, text) {
    const td = makeElement('td', className, text);
    td.contentEditable = 'true';
    td.spellcheck = false;
    return td;
}

function makeSummaryRow(label, rightText) {
    const tr = document.createElement('tr');
    let empty = 0;
    while (empty < headers.length - 1) {
        tr.appendChild(makeElement('td', null, ''));
        empty += 1;
    }
    tr.appendChild(makeElement('td', null, label));
    tr.appendChild(makeElement('td', 'r', ''));
    tr.appendChild(makeElement('td', 'r', rightText));
    return tr;
}

function ensureCells(row) {
    if (!row.c) {
        row.c = [row.ref, isoDate(row.b), isoDate(row.t), isoDate(row.v), row.desc];
    }
    return row.c;
}

function amountText(row) {
    let text = formatSek(row.amount);
    if (row.blank && 0 === row.amount) {
        text = '';
    }
    return text;
}

function makeDataRow(row, index) {
    const cells = ensureCells(row);
    const tr = document.createElement('tr');
    let col = 0;
    for (const value of cells) {
        const td = editableCell(null, value);
        td.setAttribute('data-idx', String(index));
        td.setAttribute('data-col', String(col));
        tr.appendChild(td);
        col += 1;
    }
    const amount = editableCell('r', amountText(row));
    amount.setAttribute('data-amt', String(index));
    tr.appendChild(amount);
    const saldo = makeElement('td', 'r', formatSek(row.saldo));
    saldoCells.push(saldo);
    tr.appendChild(saldo);
    tr.setAttribute('data-row', String(index));
    return tr;
}

function buildRowElements(config, result) {
    const elements = [];
    const topRow = makeSummaryRow('Saldo   ' + isoDate(config.to), formatSek(result.finalBalance));
    finalSaldoCell = topRow.lastChild;
    topRow.setAttribute('data-row', '-1');
    elements.push(topRow);
    let index = 0;
    for (const row of stateRows) {
        elements.push(makeDataRow(row, index));
        index += 1;
    }
    const startRow = makeSummaryRow('Ingående saldo   ' + isoDate(config.from), '');
    const startCell = editableCell('r', formatSek(config.startBalance));
    startCell.setAttribute('data-start', '1');
    startRow.replaceChild(startCell, startRow.lastChild);
    elements.push(startRow);
    return elements;
}

function makePageControls(pageIndex) {
    const controls = makeElement('div', 'page-ctl');
    const addButton = makeElement('button', null, '+ Lägg till sida');
    addButton.type = 'button';
    addButton.setAttribute('data-add', String(pageIndex));
    controls.appendChild(addButton);
    const removeButton = makeElement('button', null, 'Ta bort sida');
    removeButton.type = 'button';
    removeButton.setAttribute('data-del', String(pageIndex));
    controls.appendChild(removeButton);
    return controls;
}

function makeWatermark() {
    const watermark = makeElement('div', 'wm');
    watermark.appendChild(makeElement('span', null, 'EXEMPEL – SYNTETISK TESTDATA'));
    return watermark;
}

function makeNote(config) {
    const note = makeElement('div', 'gen-note');
    note.appendChild(makeElement('span', null,
        'Syntetisk testdata för bokföringsövning – motsvarar ingen verklig bank, person eller kontohistorik.'));
    note.appendChild(makeElement('span', null, 'Period ' + isoDate(config.from) + ' – ' + isoDate(config.to)));
    return note;
}

function makePage(config, pageIndex, rowsForPage) {
    const page = makeElement('div', 'page');
    page.appendChild(makePageControls(pageIndex));
    const table = makeElement('table', 'tx');
    table.appendChild(makeHead());
    const tbody = document.createElement('tbody');
    for (const tr of rowsForPage) {
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    page.appendChild(table);
    page.appendChild(makeWatermark());
    page.appendChild(makeNote(config));
    return page;
}

function clearChildren(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function render(config, result) {
    stateConfig = config;
    stateRows = result.rows;
    saldoCells = [];
    const container = document.getElementById('pages');
    clearChildren(container);
    const elements = buildRowElements(config, result);
    let start = 0;
    while (start < elements.length) {
        const pageIndex = start / rowsPerPage;
        const slice = elements.slice(start, start + rowsPerPage);
        container.appendChild(makePage(config, pageIndex, slice));
        start += rowsPerPage;
    }
}

/* ---------- rendering i en befintlig Swedbank-mall ---------- */
function makeTemplateDataRow(row) {
    const tr = document.createElement('tr');
    const values = [row.ref, isoDate(row.b), isoDate(row.t), isoDate(row.v), row.desc];
    let col = 0;
    for (const value of values) {
        const td = document.createElement('td');
        td.textContent = value;
        tr.appendChild(td);
        col += 1;
    }
    const amount = document.createElement('td');
    amount.className = 'r';
    amount.textContent = formatSek(row.amount);
    tr.appendChild(amount);
    const saldo = document.createElement('td');
    saldo.className = 'r';
    saldo.textContent = formatSek(row.saldo);
    tr.appendChild(saldo);
    return tr;
}

function makeTemplateSummaryRow(label, value) {
    const tr = document.createElement('tr');
    for (let i = 0; i < 4; i += 1) {
        tr.appendChild(document.createElement('td'));
    }
    const desc = document.createElement('td');
    desc.innerHTML = label;
    tr.appendChild(desc);
    const empty = document.createElement('td');
    empty.className = 'r';
    tr.appendChild(empty);
    const amount = document.createElement('td');
    amount.className = 'r';
    amount.textContent = value;
    tr.appendChild(amount);
    return tr;
}

function swedbankDateTimeString() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const h = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return y + '-' + m + '-' + d + ' ' + h + ':' + min + ' CEST';
}

function renderIntoTemplate(config, result) {
    const pages = Array.from(document.querySelectorAll('.page'));
    if (0 === pages.length) return;

    const cleanTemplate = pages[0].cloneNode(true);
    const exportNode = cleanTemplate.querySelector('.export');
    if (exportNode) {
        exportNode.parentNode.removeChild(exportNode);
    }

    const needed = Math.max(1, Math.ceil(result.rows.length / rowsPerPage));
    while (pages.length < needed) {
        const addition = cleanTemplate.cloneNode(true);
        pages[pages.length - 1].parentNode.insertBefore(addition, pages[pages.length - 1].nextSibling);
        pages.push(addition);
    }
    while (pages.length > needed) {
        const last = pages.pop();
        last.parentNode.removeChild(last);
    }

    const created = swedbankDateTimeString();

    /* Enhetligt blanketnummer i sidfoten på alla sidor */
    const firstFoot = pages[0].querySelector('.foot');
    const footText = firstFoot ? firstFoot.textContent : '';
    for (let i = 1; i < pages.length; i += 1) {
        const foot = pages[i].querySelector('.foot');
        if (foot && footText) {
            foot.textContent = footText;
        }
    }

    for (let i = 0; i < pages.length; i += 1) {
        const page = pages[i];
        const tbody = page.querySelector('table.tx tbody');
        if (!tbody) continue;
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }

        const start = i * rowsPerPage;
        const end = Math.min(start + rowsPerPage, result.rows.length);
        const slice = result.rows.slice(start, end);

        if (0 === i) {
            tbody.appendChild(makeTemplateSummaryRow('Saldo &nbsp; ' + isoDate(config.to), formatSek(result.finalBalance)));
        }
        for (const row of slice) {
            tbody.appendChild(makeTemplateDataRow(row));
        }
        if (i === pages.length - 1) {
            tbody.appendChild(makeTemplateSummaryRow('Ingående saldo &nbsp; ' + isoDate(config.from), formatSek(config.startBalance)));
        }

        const metaSpans = page.querySelectorAll('.head-right .meta span');
        if (metaSpans[0]) {
            metaSpans[0].innerHTML = 'Skapad &nbsp; ' + created;
        }
        if (metaSpans[1]) {
            metaSpans[1].innerHTML = 'Sida &nbsp; ' + (i + 1);
        }

        /* Uppdatera exportperioden i sidhuvudet så den matchar inställningarna */
        const exportNode = page.querySelector('.export');
        const exportHead = exportNode ? exportNode.querySelector('.h') : null;
        if (exportHead) {
            exportNode.innerHTML = '';
            exportNode.appendChild(exportHead);
            exportNode.appendChild(document.createTextNode('Alla insättningar och uttag'));
            exportNode.appendChild(document.createElement('br'));
            exportNode.appendChild(document.createTextNode(isoDate(config.from) + ' till ' + isoDate(config.to)));
        }
    }
}

/* ---------- formulär ---------- */
const defaultPerMonth = 14;
const defaultPreSalary = 2000;
const minDay = 1;
const maxDay = 31;
const hashPrime = 31;

function parseDateInput(id) {
    const value = document.getElementById(id).value;
    let result = null;
    if (value) {
        const parts = value.split('-');
        result = utcDate(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    return result;
}

function isValidFixedCost(day, name, amount) {
    const dayOk = day >= minDay && day <= maxDay;
    const amountOk = 0 < amount;
    return Boolean(name) && dayOk && amountOk;
}

function readFixedCosts() {
    const list = [];
    const wrap = document.getElementById('f-fixed');
    for (const rowNode of wrap.children) {
        const day = parseInt(rowNode.children[0].value, 10);
        const name = rowNode.children[1].value.trim();
        const amount = parseFloat(rowNode.children[2].value);
        if (isValidFixedCost(day, name, amount)) {
            list.push({day: day, name: name, amount: roundKronor(amount)});
        }
    }
    return list;
}

function buildSignature(values, fixedCosts) {
    let signature = values;
    for (const cost of fixedCosts) {
        signature += cost.day + cost.name + cost.amount;
    }
    return signature;
}

function hashString(seed, text) {
    let mix = seed;
    for (const ch of text) {
        mix = (mix * hashPrime + ch.charCodeAt(0)) % lcgModulus;
    }
    return mix;
}

function fingerprintSeed(seed, values, fixedCosts) {
    const signature = buildSignature(values, fixedCosts);
    return hashString(seed, signature);
}

function dateError(from, to) {
    let message = '';
    if (!from || !to) {
        message = 'Ange både start- och slutdatum.';
    } else if (from > to) {
        message = 'Startdatum måste ligga före slutdatum.';
    }
    return message;
}

function amountError(income, day) {
    const incomeValid = 0 < income;
    const dayValid = day >= minDay && day <= maxDay;
    let message = '';
    if (!incomeValid) {
        message = 'Ange en inkomst större än 0.';
    } else if (!dayValid) {
        message = 'Inkomstdag måste vara 1–31.';
    }
    return message;
}

function validationError(from, to, income, day) {
    return dateError(from, to) || amountError(income, day);
}

function fieldNumber(id) {
    return parseFloat(document.getElementById(id).value);
}

function readConfig() {
    const from = parseDateInput('f-from');
    const to = parseDateInput('f-to');
    const income = fieldNumber('f-income');
    const day = parseInt(document.getElementById('f-day').value, 10);
    const descRaw = document.getElementById('f-desc').value.trim();
    const desc = descRaw || 'Lön';
    const fixedCosts = readFixedCosts();

    const error = validationError(from, to, income, day);
    if (error) {
        return {err: error};
    }

    let startBalance = fieldNumber('f-start');
    if (isNaN(startBalance)) {
        startBalance = 0;
    }
    let perMonth = parseInt(document.getElementById('f-count').value, 10);
    if (isNaN(perMonth) || 0 > perMonth) {
        perMonth = defaultPerMonth;
    }
    let seed = parseInt(document.getElementById('f-seed').value, 10);
    if (!(1 <= seed)) {
        seed = 1;
    }
    let preSalary = fieldNumber('f-pre');
    if (isNaN(preSalary) || 0 > preSalary) {
        preSalary = defaultPreSalary;
    }
    const swishBox = document.getElementById('f-swish');
    const swish = swishBox ? swishBox.checked : false;

    const values = isoDate(from) + isoDate(to) + income + day + preSalary;
    const mixedSeed = fingerprintSeed(seed, values, fixedCosts);

    return {
        from: from, to: to, income: roundKronor(income), day: day, desc: desc,
        startBalance: roundKronor(startBalance), perMonth: perMonth, seed: mixedSeed,
        preSalary: roundKronor(preSalary), fixedCosts: fixedCosts, swish: swish
    };
}

/* ---------- lägga till / ta bort rader och sidor ---------- */
function blankRow() {
    return {blank: true, amount: 0, saldo: 0, c: ['', '', '', '', '']};
}

function rerender() {
    render(stateConfig, {rows: stateRows, finalBalance: 0});
    recalc();
}

function addPageAfter(pageIndex) {
    const at = Math.min(stateRows.length, Math.max(0, (pageIndex + 1) * rowsPerPage - 1));
    const blanks = [];
    let made = 0;
    while (made < rowsPerPage) {
        blanks.push(blankRow());
        made += 1;
    }
    stateRows.splice(at, 0, ...blanks);
    rerender();
}

function deletePage(pageIndex) {
    const from = Math.max(0, pageIndex * rowsPerPage - 1);
    const to = Math.min(stateRows.length, (pageIndex + 1) * rowsPerPage - 1);
    if (to > from) {
        stateRows.splice(from, to - from);
    }
    rerender();
}

function keepExistingChecked() {
    const box = document.getElementById('f-keep');
    return box ? box.checked : false;
}

/* sorteringsnyckel: bokföringsdatum, nyast först. Rader utan datum hamnar sist */
function rowDateKey(row) {
    if (row && row.b instanceof Date) {
        return row.b.getTime();
    }
    return Number.MIN_SAFE_INTEGER;
}

function normalizeDesc(text) {
    return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function rowMatchKey(row) {
    return normalizeDesc(row.desc) + '|' + isoDate(row.b);
}

/* Slår ihop gamla och nya rader. Om en ny rad har samma beskrivning
   och bokföringsdatum som en gammal, ersätts den gamla raden — förutom
   Hyra, som aldrig ersätts och inte heller läggs till på nya månader
   när befintliga rader behålls. */
function mergeRows(existing, generated, keepExisting) {
    const index = {};
    const merged = [];
    for (const row of existing) {
        if (row.b instanceof Date) {
            index[rowMatchKey(row)] = merged.length;
        }
        merged.push(row);
    }
    for (const row of generated) {
        if (keepExisting && normalizeDesc(row.desc) === 'hyra') {
            continue;
        }
        const key = rowMatchKey(row);
        if (key in index) {
            const existingRow = merged[index[key]];
            if (normalizeDesc(existingRow.desc) === 'hyra') {
                continue;
            }
            merged[index[key]] = row;
        } else {
            index[key] = merged.length;
            merged.push(row);
        }
    }
    merged.sort(function (a, b) {
        return rowDateKey(b) - rowDateKey(a);
    });
    return merged;
}

/* räkna om saldokedjan från ingående saldo, äldsta raden sist */
function recalcMergedRows(rows, config) {
    let balance = config.startBalance;
    let i = rows.length - 1;
    while (0 <= i) {
        balance = roundKronor(balance + rows[i].amount);
        rows[i].saldo = balance;
        i -= 1;
    }
    return {rows: rows, finalBalance: balance};
}

function generateAndRender() {
    const errorNode = document.getElementById('f-err');
    const config = readConfig();
    if (config.err) {
        if (errorNode) {
            errorNode.textContent = config.err;
        }
        return;
    }
    if (errorNode) {
        errorNode.textContent = '';
    }
    const result = generate(config);
    let output = result;
    const keepExisting = keepExistingChecked();
    if (keepExisting && stateRows && stateRows.length > 0 && document.getElementById('pages')) {
        const merged = mergeRows(stateRows, result.rows, keepExisting);
        output = recalcMergedRows(merged, config);
    }
    if (document.getElementById('pages')) {
        render(config, output);
    } else if (document.querySelector('.page table.tx')) {
        renderIntoTemplate(config, output);
    }
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

/* ---------- rader i listan "Fasta kostnader" ---------- */
function makeNumberInput(className, placeholder, min, max) {
    const input = document.createElement('input');
    input.type = 'number';
    input.className = className;
    input.placeholder = placeholder;
    input.min = min;
    if (max) {
        input.max = max;
    }
    return input;
}

function onRemoveFixedRow(ev) {
    const button = ev.currentTarget;
    const row = button.parentNode;
    row.parentNode.removeChild(row);
}

function addFixedCostRow() {
    const row = makeElement('div', 'fixed-row');
    row.appendChild(makeNumberInput('fc-day', 'Dag', String(minDay), String(maxDay)));
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.maxLength = truncateLength;
    nameInput.placeholder = 'Namn';
    nameInput.className = 'fc-name';
    row.appendChild(nameInput);
    row.appendChild(makeNumberInput('fc-amount', 'Belopp', String(minDay), ''));
    const remove = makeElement('button', null, '✕');
    remove.type = 'button';
    remove.title = 'Ta bort';
    remove.addEventListener('click', onRemoveFixedRow);
    row.appendChild(remove);
    document.getElementById('f-fixed').appendChild(row);
}

/* ---------- händelsehanterare ---------- */
function onAmountInput(td) {
    const text = td.textContent;
    let value = 0;
    if ('' !== text.trim()) {
        value = parseAmount(text);
    }
    if (null !== value) {
        stateRows[Number(td.getAttribute('data-amt'))].amount = value;
        recalc();
    }
}

function onStartInput(td) {
    const value = parseAmount(td.textContent);
    if (null !== value) {
        stateConfig.startBalance = value;
        recalc();
    }
}

function onTextInput(td) {
    const index = Number(td.getAttribute('data-idx'));
    const col = Number(td.getAttribute('data-col'));
    stateRows[index].c[col] = td.textContent;
}

function onPagesInput(ev) {
    const td = ev.target;
    if (!stateRows || !td || !td.getAttribute) {
        return;
    }
    if (null !== td.getAttribute('data-amt')) {
        onAmountInput(td);
    } else if (null !== td.getAttribute('data-start')) {
        onStartInput(td);
    } else if (null !== td.getAttribute('data-col')) {
        onTextInput(td);
    }
}

function onPagesFocusOut(ev) {
    const td = ev.target;
    if (!stateRows || !td || !td.getAttribute) {
        return;
    }
    const isAmount = null !== td.getAttribute('data-amt');
    const isStart = null !== td.getAttribute('data-start');
    if ('' === td.textContent.trim() && (isAmount || isStart)) {
        return;
    }
    if (isAmount) {
        td.textContent = formatSek(stateRows[Number(td.getAttribute('data-amt'))].amount);
    } else if (isStart) {
        td.textContent = formatSek(stateConfig.startBalance);
    }
}

function onPagesClick(ev) {
    const button = ev.target;
    if (!stateRows || !button || !button.getAttribute) {
        return;
    }
    const add = button.getAttribute('data-add');
    const del = button.getAttribute('data-del');
    if (null !== add) {
        addPageAfter(Number(add));
    } else if (null !== del && window.confirm('Ta bort sida ' + (Number(del) + 1) + '?')) {
        deletePage(Number(del));
    }
}

/* ---------- radknappar: "+" ny rad under, "×" ta bort raden ---------- */
let rowControl = null;
let rowControlDelete = null;
let rowControlIndex = -1;
let rowControlTimer = null;

function hideRowControl() {
    if (rowControl) {
        rowControl.style.display = 'none';
    }
}

function scheduleHideRowControl() {
    clearTimeout(rowControlTimer);
    rowControlTimer = setTimeout(hideRowControl, hideDelayMs);
}

function onRowAdd() {
    stateRows.splice(rowControlIndex + 1, 0, blankRow());
    hideRowControl();
    rerender();
}

function onRowDelete() {
    if (0 > rowControlIndex) {
        return;
    }
    stateRows.splice(rowControlIndex, 1);
    hideRowControl();
    rerender();
}

function keepRowControl() {
    clearTimeout(rowControlTimer);
}

function ensureRowControl() {
    if (rowControl) {
        return rowControl;
    }
    rowControl = makeElement('div', 'row-ctl');
    const add = makeElement('button', null, '+');
    add.type = 'button';
    add.title = 'Lägg till rad under';
    add.addEventListener('click', onRowAdd);
    rowControl.appendChild(add);
    rowControlDelete = makeElement('button', null, '✕');
    rowControlDelete.type = 'button';
    rowControlDelete.title = 'Ta bort rad';
    rowControlDelete.addEventListener('click', onRowDelete);
    rowControl.appendChild(rowControlDelete);
    rowControl.addEventListener('mouseenter', keepRowControl);
    rowControl.addEventListener('mouseleave', scheduleHideRowControl);
    document.body.appendChild(rowControl);
    return rowControl;
}

function rowAncestor(node) {
    let cursor = node;
    while (cursor && 'TR' !== cursor.tagName) {
        cursor = cursor.parentNode;
    }
    return cursor;
}

function onPagesMouseOver(ev) {
    if (!stateRows) {
        return;
    }
    const tr = rowAncestor(ev.target);
    if (!tr || !tr.getAttribute || null === tr.getAttribute('data-row')) {
        return;
    }
    rowControlIndex = Number(tr.getAttribute('data-row'));
    const control = ensureRowControl();
    clearTimeout(rowControlTimer);
    let deleteDisplay = '';
    if (0 > rowControlIndex) {
        deleteDisplay = 'none';
    }
    rowControlDelete.style.display = deleteDisplay;
    const rect = tr.getBoundingClientRect();
    control.style.display = 'flex';
    control.style.top = (rect.top + window.scrollY - ctlOffsetTop) + 'px';
    control.style.left = (rect.left + window.scrollX - ctlOffsetLeft) + 'px';
}

/* ---------- statisk utskrift av transaktioner (t.ex. Swedbank-utdrag) ---------- */
const statementTranslations = {
    'Transaktioner': 'Транзакции',
    'Skapad': 'Создано',
    'Sida': 'Стр.',
    'Kontohavare': 'Владелец счёта',
    'Privatkonto (SEK)': 'Личный счёт (SEK)',
    'Exporten inkluderar': 'Экспорт включает',
    'Alla insättningar och uttag': 'Все зачисления и списания',
    'Referens': 'Референс',
    'Bokföringsdag': 'Дата проводки',
    'Transaktionsdag': 'Дата операции',
    'Valutadag': 'Дата валют.',
    'Beskrivning': 'Описание',
    'Belopp\nSEK': 'Сумма\nSEK',
    'Bokfört saldo': 'Учтённый остаток',
    'Saldo': 'Остаток',
    'Ingående saldo': 'Входящий остаток'
};

let statementPanel = null;
let statementInRussian = false;

function translateExact(node, toRussian) {
    const text = node.textContent.trim();
    const original = node.getAttribute('data-sv') || text;
    if (!node.getAttribute('data-sv')) {
        node.setAttribute('data-sv', original);
    }
    if (toRussian && statementTranslations[original]) {
        node.textContent = statementTranslations[original];
    } else {
        node.textContent = original;
    }
}

function translateHeader(th, toRussian) {
    const originalHtml = th.getAttribute('data-sv') || th.innerHTML;
    if (!th.getAttribute('data-sv')) {
        th.setAttribute('data-sv', originalHtml);
    }
    const text = th.textContent.trim();
    if (toRussian && statementTranslations[text]) {
        th.innerHTML = statementTranslations[text].replace('\n', '<br>');
    } else {
        th.innerHTML = originalHtml;
    }
}

function translateMetaSpans(toRussian) {
    for (const span of document.querySelectorAll('.head-right .meta span')) {
        const original = span.getAttribute('data-sv') || span.innerHTML;
        if (!span.getAttribute('data-sv')) {
            span.setAttribute('data-sv', original);
        }
        let html = original;
        if (toRussian) {
            html = html.replace('Skapad', 'Создано').replace('Sida', 'Стр.');
        } else {
            html = html.replace('Создано', 'Skapad').replace('Стр.', 'Sida');
        }
        span.innerHTML = html;
    }
}

function translateSummaryRows(toRussian) {
    for (const td of document.querySelectorAll('table.tx tbody td:nth-child(5)')) {
        const text = td.textContent.trim();
        if (!text) continue;
        const original = td.getAttribute('data-sv') || text;
        if (!td.getAttribute('data-sv')) {
            td.setAttribute('data-sv', original);
        }
        let result = original;
        if (toRussian) {
            result = result.replace('Ingående saldo', 'Входящий остаток').replace('Saldo', 'Остаток');
        } else {
            result = result.replace('Входящий остаток', 'Ingående saldo').replace('Остаток', 'Saldo');
        }
        if (result !== td.textContent) {
            td.textContent = result;
        }
    }
}

function translateStaticPage(toRussian) {
    for (const node of document.querySelectorAll('.head-right .title')) {
        translateExact(node, toRussian);
    }
    translateMetaSpans(toRussian);
    for (const node of document.querySelectorAll('.acct .k, .export .h')) {
        translateExact(node, toRussian);
    }
    for (const th of document.querySelectorAll('table.tx th')) {
        translateHeader(th, toRussian);
    }
    translateSummaryRows(toRussian);
    statementInRussian = toRussian;
    updateStatementPanel();
}

function collectStaticAmounts() {
    const amounts = [];
    for (const table of document.querySelectorAll('table.tx')) {
        for (const tr of table.querySelectorAll('tbody tr')) {
            const tds = tr.querySelectorAll('td');
            if (tds.length < 7) continue;
            const isSummary = !tds[0].textContent.trim() &&
                !tds[1].textContent.trim() &&
                !tds[2].textContent.trim() &&
                !tds[3].textContent.trim();
            if (isSummary) continue;
            const value = parseAmount(tds[5].textContent);
            if (value !== null) {
                amounts.push(value);
            }
        }
    }
    return amounts;
}

function updateStatementPanel() {
    if (!statementPanel) return;
    const amounts = collectStaticAmounts();
    let income = 0;
    let expense = 0;
    for (const value of amounts) {
        if (value > 0) income += value;
        else expense += value;
    }
    const net = income + expense;
    const labels = statementInRussian
        ? { in: 'Поступления', out: 'Списания', net: 'Итого' }
        : { in: 'Insättningar', out: 'Uttag', net: 'Netto' };
    statementPanel.innerHTML =
        '<div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">' +
        '<button type="button" data-lang="sv" style="padding:2px 8px;font-size:11px;cursor:pointer;">SV</button>' +
        '<button type="button" data-lang="ru" style="padding:2px 8px;font-size:11px;cursor:pointer;">RU</button>' +
        '<button type="button" data-close style="padding:2px 8px;font-size:11px;cursor:pointer;margin-left:auto;">×</button>' +
        '</div>' +
        '<div style="font-size:11px;line-height:1.5;">' +
        '<div>' + labels.in + ': <strong>' + formatSek(income) + '</strong></div>' +
        '<div>' + labels.out + ': <strong>' + formatSek(expense) + '</strong></div>' +
        '<div>' + labels.net + ': <strong>' + formatSek(net) + '</strong></div>' +
        '</div>';
}

function onStatementPanelClick(ev) {
    const button = ev.target;
    if (!button.getAttribute) return;
    const lang = button.getAttribute('data-lang');
    const close = button.getAttribute('data-close');
    if (lang) {
        translateStaticPage(lang === 'ru');
    } else if (close !== null) {
        if (statementPanel) {
            statementPanel.style.display = 'none';
        }
    }
}

function createStatementPanel() {
    if (statementPanel) return statementPanel;
    statementPanel = document.createElement('div');
    statementPanel.className = 'statement-panel no-print';
    statementPanel.style.cssText =
        'position:fixed;top:10px;right:10px;z-index:9999;' +
        'background:#fff;border:1px solid #999;border-radius:4px;' +
        'padding:8px 10px;box-shadow:0 2px 8px rgba(0,0,0,.2);' +
        'font-family:Arial,Helvetica,sans-serif;color:#000;';
    statementPanel.addEventListener('click', onStatementPanelClick);
    document.body.appendChild(statementPanel);

    if (!document.getElementById('stmt-panel-print-rule')) {
        const style = document.createElement('style');
        style.id = 'stmt-panel-print-rule';
        style.textContent = '@media print{.statement-panel,.no-print{display:none!important;}}';
        document.head.appendChild(style);
    }

    updateStatementPanel();
    return statementPanel;
}

function initStaticStatement() {
    if (!document.querySelector('table.tx')) {
        return;
    }
    createStatementPanel();
}

/* ---------- init ---------- */
const defaultMonthsBack = 12;

function openModal() {
    document.getElementById('modal').classList.remove('hidden');
}

function printPage() {
    window.print();
}

function init() {
    const btnAddFixed = document.getElementById('btn-add-fixed');
    const btnGenerate = document.getElementById('btn-generate');
    const btnEdit = document.getElementById('btn-edit');
    const btnPrint = document.getElementById('btn-print');
    const pages = document.getElementById('pages');
    const fFrom = document.getElementById('f-from');
    const fTo = document.getElementById('f-to');

    if (btnAddFixed) btnAddFixed.addEventListener('click', addFixedCostRow);
    if (btnGenerate) btnGenerate.addEventListener('click', generateAndRender);
    if (btnEdit) btnEdit.addEventListener('click', openModal);
    if (btnPrint) btnPrint.addEventListener('click', printPage);

    if (pages) {
        pages.addEventListener('input', onPagesInput);
        pages.addEventListener('focusout', onPagesFocusOut);
        pages.addEventListener('click', onPagesClick);
        pages.addEventListener('mouseover', onPagesMouseOver);
        pages.addEventListener('mouseleave', scheduleHideRowControl);
    }

    if (fFrom && fTo) {
        const today = new Date();
        const end = addDays(utcDate(today.getFullYear(), today.getMonth(), today.getDate()), -1);
        const start = utcDate(today.getFullYear(), today.getMonth() - defaultMonthsBack, today.getDate());
        fFrom.value = isoDate(start);
        fTo.value = isoDate(end);
    }
}

init();
initStaticStatement();
