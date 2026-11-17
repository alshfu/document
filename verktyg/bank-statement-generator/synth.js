/* Transaction synthesis engine — extracted from bank/nordea/Kontohandelser.html */
(function (global) {
'use strict';

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

    /* Företagen som får förekomma bland utbetalningar */
    const defaultCompanies = [
        'Hemköp Huddinge Centrum', 'ICA Supermarket Kvarnen', 'Maxi ICA Stormarknad Flemingsberg',
        'Lidl Flemingsberg', 'Kappahl', 'Specsavers', 'Akademibokhandeln', 'Guldfynd',
        'Dressmann', 'Intersport', 'Pressbyrån', 'Salong Mold', 'Grodan & Co',
        'Visättra Salong Andraus', 'Henning and Friends', 'Franska Klipperiet',
        'ATTEVALL HAIR', 'Salong UpGrade', 'Sjödalssalongen', 'Studio Unique'
    ];

    const cardCategories = [
        {
            min: foodMin, max: foodMax, weight: foodWeight, swish: 0,
            names: ['Hemköp Huddinge Centrum', 'ICA Supermarket Kvarnen',
                'Maxi ICA Stormarknad Flemingsberg', 'Lidl Flemingsberg']
        },
        {
            min: restaurangMin, max: restaurangMax, weight: restaurangWeight, swish: restaurangSwish,
            names: ['Pressbyrån', 'Akademibokhandeln', 'Guldfynd', 'Specsavers']
        },
        {
            min: clothesMin, max: clothesMax, weight: clothesWeight, swish: clothesSwish,
            names: ['Kappahl', 'Dressmann', 'Intersport']
        },
        {
            min: healthMin, max: healthMax, weight: healthWeight, swish: healthSwish,
            names: ['Salong Mold', 'Visättra Salong Andraus', 'Franska Klipperiet',
                'ATTEVALL HAIR', 'Salong UpGrade', 'Sjödalssalongen', 'Studio Unique',
                'Henning and Friends', 'Grodan & Co']
        },
        {
            min: serviceMin, max: serviceMax, weight: serviceWeight, swish: serviceSwish,
            names: ['Pressbyrån', 'Specsavers', 'Akademibokhandeln', 'Guldfynd']
        }
    ];

    function getCardCategories(config) {
        const companies = config && config.companies && config.companies.length > 0
            ? config.companies
            : null;
        if (!companies) {
            return cardCategories;
        }
        const categories = JSON.parse(JSON.stringify(cardCategories));
        for (const cat of categories) {
            cat.names = [];
        }
        for (let i = 0; i < companies.length; i += 1) {
            categories[i % categories.length].names.push(companies[i]);
        }
        for (let i = 0; i < categories.length; i += 1) {
            if (categories[i].names.length === 0) {
                categories[i].names = cardCategories[i].names.slice();
            }
        }
        return categories;
    }

    function totalCategoryWeight(categories) {
        let total = 0;
        for (const category of categories) {
            total += category.weight;
        }
        return total;
    }

    /* viktad dragning (en slinga, ett returvärde) */
    function pickCategoryByTicket(categories) {
        const total = totalCategoryWeight(categories);
        let ticket = random() * total;
        let chosen = categories[categories.length - 1];
        let decided = false;
        for (const category of categories) {
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
            {day: elDay, name: 'Vattenfall', amount: 0},
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
        const incomes = config.incomes && config.incomes.length > 0
            ? config.incomes
            : [{amount: config.income, day: config.day}];
        const startYear = config.from.getUTCFullYear();
        const startMonth = config.from.getUTCMonth();
        let offset = -1;
        let done = false;
        while (!done) {
            const first = utcDate(startYear, startMonth + offset, 1);
            const year = first.getUTCFullYear();
            const month = first.getUTCMonth();
            for (const income of incomes) {
                const wanted = Math.min(income.day, daysInMonth(year, month));
                const wantedDate = utcDate(year, month, wanted);
                paydays.push({d: previousBusinessDay(wantedDate), inc: income});
            }
            if (first > config.to) {
                done = true;
            }
            offset += 1;
        }
        return paydays.sort(function (a, b) {
            return a.d - b.d;
        });
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

    function pushIncome(context, cycleStart, incomeConfig) {
        if (cycleStart >= context.config.from) {
            if (context.akassaLimit && cycleStart > context.akassaLimit) {
                return;
            }
            if (!incomeConfig) {
                const incomes = context.config.incomes && context.config.incomes.length > 0
                    ? context.config.incomes
                    : [{amount: context.config.income, day: context.config.day}];
                incomeConfig = incomes[0];
            }
            let income = roundKronor(incomeConfig.amount);
            if (!incomeConfig.exact) {
                income = roundKronor(incomeConfig.amount * randomBetween(incomeJitterLow, incomeJitterHigh));
            }
            context.rows.push({
                t: cycleStart, b: cycleStart, v: cycleStart,
                ref: '', desc: truncateName(incomeConfig.desc || context.config.desc),
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
                context.rows.push({
                    t: chargeDate,
                    b: chargeDate,
                    v: chargeDate,
                    ref: name,
                    desc: name,
                    amount: -amount
                });
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

    function cycleBudget(context, segStart, segEnd) {
        if (context.config.monthlySpend > 0 && segStart && segEnd) {
            const cycleDays = Math.max(1, Math.round((segEnd - segStart) / msPerDay));
            const daysInMonthApprox = 30;
            const raw = context.config.monthlySpend * (cycleDays / daysInMonthApprox) * randomBetween(budgetLowFactor, budgetHighFactor);
            return Math.max(0, raw);
        }
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
        const categories = getCardCategories(context.config);
        const cycleDays = Math.round((segEnd - segStart) / msPerDay);
        const maxDate = context.config.to;
        let spent = 0;
        let made = 0;
        while (spent < budget * budgetSpendTarget && made < maxPurchasesPerCycle) {
            const category = pickCategoryByTicket(categories);
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

    function fillCycle(context, payday, nextPayday) {
        const cycleStart = payday.d;
        const cycleEnd = nextPayday.d;
        pushIncome(context, cycleStart, payday.inc);
        let segStart = cycleStart;
        if (cycleStart < context.config.from) {
            segStart = context.config.from;
        }
        let segEnd = cycleEnd;
        if (cycleEnd >= context.periodEnd) {
            segEnd = context.periodEnd;
        }
        if (segStart < segEnd) {
            pushFixedCosts(context, segStart, segEnd);
            topUpIfBelowPreSalary(context, segStart);
            const budget = cycleBudget(context, segStart, segEnd);
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

global.BankSynth = {
  generate: generate,
  formatSek: formatSek,
  isoDate: isoDate,
  parseDateString: typeof parseDateString === 'function' ? parseDateString : function (text) {
    const parts = String(text).split('-');
    if (parts.length === 3) return utcDate(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return utcDate(2025, 6, 1);
  },
  utcDate: utcDate,
  roundKronor: roundKronor
};
})(typeof window !== 'undefined' ? window : globalThis);
