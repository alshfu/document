/**
 * Renders Inkomstdeklaration 1 (7 A4 pages) into HTML.
 */
(function (global) {
  'use strict';

  function stamp(n) {
    return '<!-- stamp-page:start --><div class="stamp" role="note">' +
      'DEMOVERSION · ENDAST FÖR UTBILDNING · EJ GILTIG HANDLING<br>' +
      '<small>ДЕМО · Только для обучения · Sida ' + n + ' av 7</small>' +
      '</div><!-- stamp-page:end -->';
  }

  function logo() {
    return '<div class="logo"><img src="skatteverket_logo.svg" alt="Skatteverket">' +
      '<span class="name">Skatteverket</span></div>';
  }

  function render(person, tax) {
    var F = DeklarationTax.fmt;
    var FN = DeklarationTax.fmtNeg;
    var FS = DeklarationTax.fmtSats;
    var pnr = person.personnummer;
    var namn = person.name;
    var addr = person.addressHtml;
    var kommun = person.kommunNamn || '';
    var tillbaka = tax.diff >= 0;
    var diffAbs = Math.abs(tax.diff);
    var diffLabel = tillbaka
      ? 'Beräknat belopp att få tillbaka (exkl. räntor, egen inbetalning, debiterad preliminär skatt)'
      : 'Beräknat belopp att betala (exkl. räntor, egen inbetalning, debiterad preliminär skatt)';
    var page1Refund = tillbaka
      ? 'Utifrån uppgifterna i din deklaration har Skatteverket beräknat att du ska få tillbaka ' + F(diffAbs) + ' kr.'
      : 'Utifrån uppgifterna i din deklaration har Skatteverket beräknat att du ska betala ' + F(diffAbs) + ' kr.';
    var akassaText = tax.redAkassa > 0
      ? 'Du har fått skattereduktion med 25 % av avgiften till arbetslöshetskassa (' + F(tax.redAkassa) +
        ' kr). Skattereduktionen får du automatiskt och du behöver inte göra något.'
      : 'I skatteuträkningen är skattereduktionen för avgift till arbetslöshetskassa 0 kr.';

    var pages = [];

    // ---- PAGE 1 ----
    pages.push(
'<div class="page">' + stamp(1) +
'  <div class="skv-top">' +
'    <div>' + logo() +
'      <div class="agency">Skatteverket<br>205 30 Malmö</div>' +
'    </div>' +
'    <div style="min-width:300px">' +
'      <div class="pageof">1 (1)</div>' +
'      <div class="doctitle">Information om inkomstdeklaration 1</div>' +
'      <div class="yearbox">' +
'        <div class="c"><div class="k">Inkomstår</div><div class="v">2025</div></div>' +
'        <div class="c"><div class="k">Person-/samordningsnummer</div><div class="v">' + pnr + '</div></div>' +
'      </div>' +
'    </div>' +
'  </div>' +
'  <div class="recipient">' + namn + '<br>' + addr + '</div>' +
'  <h2 class="sec">Dags att deklarera</h2>' +
'  <p class="body">Här kommer din deklaration för inkomståret 2025. Du kan deklarera från 17 mars 2026. Sista dagen att deklarera är 4 maj 2026.</p>' +
'  <p class="body">I specifikationen till deklarationen hittar du information om hur du kan deklarera.</p>' +
'  <h2 class="sec">' + (tillbaka ? 'Så här mycket får du tillbaka' : 'Så här mycket ska du betala') + '</h2>' +
'  <p class="body">' + page1Refund + '</p>' +
'  <p class="body">Tänk på att om du ändrar eller lägger till uppgifter i deklarationen kan det beräknade beloppet komma att ändras.</p>' +
'  <p class="body">Skatteverket sätter in pengarna på det bankkonto som är anmält hos oss i samband med slutskattebeskedet.</p>' +
'  <p class="body">Aktuellt saldo på ditt skattekonto hittar du genom att logga in på <u>skatteverket.se/minasidor</u>.</p>' +
'  <h2 class="sec">Mer information</h2>' +
'  <p class="body">På <u>skatteverket.se/deklaration</u> hittar du mer information om deklarationen och när du tidigast kan få ditt besked om slutlig skatt.</p>' +
'  <p class="body">På <u>skatteverket.se/betalakvarskatt</u> finns information om när du ska betala eventuell kvarskatt och hur du i så fall gör.</p>' +
'  <h2 class="sec">Om du behöver kontakta oss</h2>' +
'  <p class="body">På <u>skatteverket.se/kontaktaoss</u> hittar du på vilka sätt du kan komma i kontakt med oss.</p>' +
'  <h2 class="sec">Är du folkbokförd där du bor?</h2>' +
'  <p class="body">Om inte, gör din flyttanmälan på <u>skatteverket.se/minadress</u></p>' +
'  <h2 class="sec">Med det här brevet får du också följande:</h2>' +
'  <p class="body">- Preliminär skatteberäkning<br>- Specifikation till Inkomstdeklaration 1<br>- Kontroll- och inkomstuppgifter<br>- Inkomstdeklaration 1</p>' +
'  <div class="sideid">SKV 4015 04 sv 00 01</div>' +
'  <div class="skv-foot"><span><b>www.skatteverket.se</b></span><span>Skatteupplysningen <b>0771-567 567</b></span><span>E-post via « Kontakta oss » på <b>www.skatteverket.se</b></span></div>' +
'</div>');

    // ---- PAGE 2 skatteuträkning ----
    pages.push(
'<div class="page">' + stamp(2) +
'  <div class="skv-top">' + logo() +
'    <div style="min-width:300px">' +
'      <div class="pageof">1 (1)</div>' +
'      <div class="doctitle">Preliminär skatteuträkning</div>' +
'      <div class="yearbox"><div class="c"><div class="k">Inkomstår</div><div class="v">2025</div></div></div>' +
'    </div>' +
'  </div>' +
'  <div class="infobox">' +
'    <div class="r">' +
'      <div class="cell" style="flex:1"><div class="k">Namn</div><div class="v">' + namn + '</div></div>' +
'      <div class="cell" style="flex:1"><div class="k">Person-/organisationsnummer</div><div class="v">' + pnr + '</div></div>' +
'    </div>' +
'    <div class="r">' +
'      <div class="cell" style="flex:1"><div class="k">Hemortskommun den 1 november 2024</div><div class="v">' + kommun + '</div></div>' +
'      <div class="cell" style="width:120px"><div class="k">Kommunalskattesats %</div><div class="v">' + FS(tax.kommunalSats) + '</div></div>' +
'      <div class="cell" style="width:120px"><div class="k">Begravningsavgift %</div><div class="v">' + FS(tax.begravningSats) + '</div></div>' +
'      <div class="cell" style="width:120px"><div class="k">Avgift till trossamfund %</div><div class="v">0</div></div>' +
'    </div>' +
'  </div>' +
'  <table class="calc">' +
'    <tr class="head"><td>Dina inkomster</td><td class="amt">Belopp</td></tr>' +
'    <tr><td>Inkomster av anställning</td><td class="amt">' + F(tax.inkomst) + '</td></tr>' +
'    <tr><td>Fastställd förvärvsinkomst</td><td class="amt">' + F(tax.ffi) + '</td></tr>' +
'    <tr><td>Grundavdrag</td><td class="amt">' + FN(tax.grundavdrag) + '</td></tr>' +
'    <tr class="sum"><td>Beskattningsbar förvärvsinkomst</td><td class="amt">' + F(tax.bfi) + '</td></tr>' +
'    <tr><td>Ränteutgifter (punkterna 8.1 och 8.8)</td><td class="amt">' + F(tax.rantor) + '</td></tr>' +
'    <tr class="sum"><td>Underskott av kapital</td><td class="amt">' + F(tax.underskott) + '</td></tr>' +
'    <tr class="head"><td>Dina skatter och avgifter</td><td></td></tr>' +
'    <tr><td>Kommunal inkomstskatt ' + FS(tax.kommunalSats) + ' %</td><td class="amt">' + F(tax.kommunal) + '</td></tr>' +
(tax.statlig ? '    <tr><td>Statlig inkomstskatt 20 %</td><td class="amt">' + F(tax.statlig) + '</td></tr>' : '') +
'    <tr><td>Allmän pensionsavgift (anställning)</td><td class="amt">' + F(tax.pension) + '</td></tr>' +
'    <tr><td>Begravningsavgift ' + FS(tax.begravningSats) + ' %</td><td class="amt">' + F(tax.begravning) + '</td></tr>' +
'    <tr><td>Public service-avgift</td><td class="amt">' + F(tax.publicservice) + '</td></tr>' +
'    <tr class="sum"><td>Summa skatter och avgifter</td><td class="amt">' + F(tax.summaSkatt) + '</td></tr>' +
'    <tr class="head"><td>Skattereduktioner och andra poster som minskar din skatt</td><td></td></tr>' +
'    <tr><td>Skattereduktion för allmän pensionsavgift</td><td class="amt">' + FN(tax.redPension) + '</td></tr>' +
'    <tr><td>Jobbskatteavdrag</td><td class="amt">' + FN(tax.jobbskatteavdrag) + '</td></tr>' +
'    <tr><td>Skattereduktion för förvärvsinkomst</td><td class="amt">' + FN(tax.redForvarv) + '</td></tr>' +
'    <tr><td>Skattereduktion för underskott av kapital</td><td class="amt">' + FN(tax.redUnderskott) + '</td></tr>' +
'    <tr><td>Skattereduktion för arbetslöshetskassa</td><td class="amt">' + FN(tax.redAkassa) + '</td></tr>' +
'    <tr class="sum"><td>Summa skattereduktioner och andra poster som minskar din skatt</td><td class="amt">' + FN(tax.summaRed) + '</td></tr>' +
'    <tr class="head"><td>Din slutliga skatt för inkomståret 2025</td><td></td></tr>' +
'    <tr><td>Summa skatter och avgifter</td><td class="amt">' + F(tax.summaSkatt) + '</td></tr>' +
'    <tr><td>Summa skattereduktioner och andra poster som minskar din skatt</td><td class="amt">' + FN(tax.summaRed) + '</td></tr>' +
'    <tr class="sum"><td>Din slutliga skatt (preliminär)</td><td class="amt">' + F(tax.slutlig) + '</td></tr>' +
'    <tr class="head"><td>Uträkning av belopp att betala / få tillbaka</td><td></td></tr>' +
'    <tr><td>Din slutliga skatt (preliminär)</td><td class="amt">' + F(tax.slutlig) + '</td></tr>' +
'    <tr><td>Preliminär skatt</td><td class="amt">' + FN(tax.avdragen) + '</td></tr>' +
'    <tr class="sum"><td>' + diffLabel + '</td><td class="amt">' + F(diffAbs) + '</td></tr>' +
'  </table>' +
'  <div class="sideid">SKV 4010 07 sv 00 01</div>' +
'</div>');

    // ---- PAGE 3 specifikationen 1 ----
    pages.push(
'<div class="page">' + stamp(3) +
'  <div class="skv-top">' + logo() +
'    <div style="min-width:300px">' +
'      <div class="pageof">1 (2)</div>' +
'      <div class="doctitle">Specifikation till inkomstdeklaration 1</div>' +
'      <div class="yearbox">' +
'        <div class="c"><div class="k">Inkomstår</div><div class="v">2025</div></div>' +
'        <div class="c"><div class="k">Person-/samordningsnummer</div><div class="v">' + pnr + '</div></div>' +
'      </div>' +
'    </div>' +
'  </div>' +
'  <h2 class="sec">Så här deklarerar du</h2>' +
'  <p class="body">Deklarera på något av följande sätt:</p>' +
'  <h2 class="sec" style="font-size:12px">E-tjänst</h2>' +
'  <p class="body">Deklarera via e-tjänsten Inkomstdeklaration 1 på <u>skatteverket.se/deklaration</u> med e-legitimation eller dina koder.</p>' +
'  <p class="body">Om du använder e-legitimation kan du godkänna din deklaration eller ändra/lägga till uppgifter.</p>' +
'  <h2 class="sec" style="font-size:12px">Med sms</h2>' +
'  <p class="body">Deklarera genom att skicka ditt personnummer eller motsvarande och koden för underskrift som står i deklarationen till 711 44.</p>' +
'  <h2 class="sec" style="font-size:12px">Med telefon</h2>' +
'  <p class="body">Deklarera genom att ringa 020-567 100 (från utlandet +46 8 764 92 40).</p>' +
'  <h2 class="sec" style="font-size:12px">Pappersdeklaration</h2>' +
'  <p class="body">Deklarera genom att skriva under och posta din pappersdeklaration. Posta så att den kommer fram senast den 4 maj 2026.</p>' +
'  <p class="body">Skatteverket<br>Inläsningscentralen<br>Inkomstdeklaration 1<br>FE 8000<br>107 75 Stockholm</p>' +
'  <h2 class="sec">Upplysningar om din preliminära skatteuträkning</h2>' +
'  <p class="body"><b>Skattereduktion för avgift till arbetslöshetskassa</b></p>' +
'  <p class="body">' + akassaText + '</p>' +
'  <p class="body">Mer information om skattereduktioner finns på <u>skatteverket.se/skattereduktioner</u>.</p>' +
'  <h2 class="sec">Uppgifter som redan finns i din inkomstdeklaration</h2>' +
'  <p class="body"><b>8 Avdrag – Kapital</b><br><b>Ränteutgifter</b><br>För inkomståret 2025 gäller nya regler för lån utan säkerhet. På grund av de nya reglerna</p>' +
'  <div class="sideid">SKV 4015 04 sv 00 01</div>' +
'  <div class="skv-foot"><span><b>www.skatteverket.se</b></span><span>Skatteupplysningen <b>0771-567 567</b></span><span>E-post via « Kontakta oss » på <b>www.skatteverket.se</b></span></div>' +
'</div>');

    // ---- PAGE 4 specifikationen 2 ----
    pages.push(
'<div class="page">' + stamp(4) +
'  <div class="skv-top">' + logo() +
'    <div style="min-width:300px">' +
'      <div class="pageof">2 (2)</div>' +
'      <div class="doctitle">Specifikation till inkomstdeklaration 1</div>' +
'      <div class="yearbox">' +
'        <div class="c"><div class="k">Inkomstår</div><div class="v">2025</div></div>' +
'        <div class="c"><div class="k">Person-/samordningsnummer</div><div class="v">' + pnr + '</div></div>' +
'      </div>' +
'    </div>' +
'  </div>' +
'  <p class="body" style="margin-top:24px">finns det två olika rutor i deklarationen. Skatteverket har fyllt i dina ränteutgifter enligt de kontrolluppgifter vi har fått.</p>' +
'  <p class="body"><b>8.1 Ränteutgifter på lån med säkerhet</b></p>' +
'  <p class="body">Lån som uppfyller kraven på säkerhet, till exempel lån på bostad, fritidsbostad och fordon. Du får avdrag för hela beloppet.</p>' +
'  <p class="body"><b>8.8 Ränteutgifter på lån utan säkerhet</b></p>' +
'  <p class="body">Lån som inte uppfyller kraven på säkerhet. Du deklarerar hela beloppet; Skatteverket beräknar ditt avdrag till hälften av beloppet.</p>' +
'  <p class="body">Mer information finns på <u>skatteverket.se/ränteavdrag</u>.</p>' +
'  <div class="sideid">SKV 4015 04 sv 00 01</div>' +
'  <div class="skv-foot"><span><b>www.skatteverket.se</b></span><span>Skatteupplysningen <b>0771-567 567</b></span><span>E-post via « Kontakta oss » på <b>www.skatteverket.se</b></span></div>' +
'</div>');

    // ---- PAGE 5 kontrolluppgifter ----
    pages.push(
'<div class="page">' + stamp(5) +
'  <div class="skv-top">' + logo() +
'    <div style="min-width:300px">' +
'      <div class="pageof">1 (1)</div>' +
'      <div class="doctitle">Kontrolluppgifter och inkomstuppgifter</div>' +
'      <div class="yearbox"><div class="c"><div class="k">Inkomstår</div><div class="v">2025</div></div></div>' +
'    </div>' +
'  </div>' +
'  <div class="namebox">' +
'    <div class="c" style="flex:1"><div class="k">Namn</div><div>' + namn + '</div></div>' +
'    <div class="c" style="flex:1"><div class="k">Person-/organisationsnummer</div><div>' + pnr + '</div></div>' +
'  </div>' +
'  <table class="ctrl">' +
'    <tr class="hdr"><td>ANSTÄLLNING</td><td class="amt">Belopp</td><td class="amt">Preliminär skatt</td></tr>' +
'    <tr class="grp"><td>Inkomster – Anställning</td><td></td><td></td></tr>' +
'    <tr class="sub"><td>1.1 Lön, förmåner, sjukpenning m.m.</td><td></td><td></td></tr>' +
'    <tr class="item"><td>' + tax.utbetalare + '</td><td class="amt">' + F(tax.inkomst) + '</td><td class="amt">' + F(tax.avdragen) + '</td></tr>' +
'    <tr class="tot"><td>Totalt</td><td class="amt">' + F(tax.inkomst) + '</td><td class="amt">' + F(tax.avdragen) + '</td></tr>' +
'    <tr class="hdr"><td>KAPITAL &nbsp;&nbsp;&nbsp; <span style="font-weight:normal">Namn/Beteckning</span></td><td class="amt">Belopp</td><td class="amt">Preliminär skatt</td></tr>' +
'    <tr class="grp"><td>Avdrag – Kapital</td><td></td><td></td></tr>' +
'    <tr class="sub"><td>8.1 / 8.8 Ränteutgifter med / utan säkerhet</td><td></td><td></td></tr>' +
'    <tr class="item"><td>Ränteutgifter</td><td class="amt">' + F(tax.rantor) + '</td><td></td></tr>' +
'    <tr class="tot"><td>Totalt</td><td class="amt">' + F(tax.rantor) + '</td><td></td></tr>' +
'    <tr class="hdr"><td>ÖVRIGA KONTROLLUPPGIFTER</td><td></td><td class="amt">Belopp</td></tr>' +
'    <tr class="grp"><td>Arbetslöshetskassa</td><td></td><td></td></tr>' +
'    <tr class="item"><td>Avgift till arbetslöshetskassa</td><td></td><td class="amt">' + F(tax.akassa) + '</td></tr>' +
'    <tr class="tot"><td>Summa preliminär skatt</td><td></td><td class="amt">' + F(tax.avdragen) + '</td></tr>' +
'  </table>' +
'  <div class="sideid">SKV 4008 06 sv 00 01</div>' +
'</div>');

    // ---- PAGE 6 yellow form front ----
    pages.push(
'<div class="page form">' + stamp(6) +
'  <div class="fmast">' +
'    <div class="fmast-left">' +
'      Skatteverket<br>Inläsningscentralen<br>Inkomstdeklaration 1<br>FE 8000<br>107 75 Stockholm<br><br>Skatteupplysningen<br>0771-567 567<br><br>På www.skatteverket.se får du<br>svar på de flesta av dina frågor.' +
'    </div>' +
'    <div class="fcircle">Deklarera senast den 4 maj</div>' +
'    <div class="fmast-mid">' +
'      <div class="fnote">Kontrollera de angivna beloppen. Gör ändringar/tillägg i den vita rutan. Vid tillägg, ange totalbeloppet i den vita rutan.<br><b>Ange beloppen i hela kronor.</b></div>' +
'      <div class="forgbox"><div class="k">Person-/organisationsnummer</div><div class="v">' + pnr + '</div></div>' +
'    </div>' +
'    <div class="fmast-right">' +
'      <div class="ftitle">Inkomstdeklaration 1 <span class="fyear">2026</span></div>' +
'      <div class="fsub">Inkomstår 2025</div>' +
'      <div class="frecip">' + namn + '<br>' + addr + '</div>' +
'    </div>' +
'  </div>' +
'  <div class="fcols">' +
'    <div class="fcol">' +
'      <div class="fhead">1 Inkomster – Anställning <span class="fh-note">Ange beloppet i hela kronor</span></div>' +
'      <div class="frow"><div class="fl"><b>1.1</b> Lön, förmåner, sjukpenning m.m.</div><div class="fbox filled">' + F(tax.inkomst) + '</div></div>' +
'      <div class="frow"><div class="fl"><b>1.2</b> Kostersättningar</div><div class="fbox"></div></div>' +
'      <div class="frow"><div class="fl"><b>1.3</b> Allmän pension och tjänstepension m.m.</div><div class="fbox"></div></div>' +
'      <div class="frow"><div class="fl"><b>1.4</b> Privat pension och livränta</div><div class="fbox"></div></div>' +
'      <div class="frow"><div class="fl"><b>1.5</b> Andra inkomster som inte ger pensionsrätt</div><div class="fbox"></div></div>' +
'      <div class="frow"><div class="fl"><b>1.6</b> Inkomster, t.ex. hobby, där du själv ska betala egenavgifter</div><div class="fbox"></div></div>' +
'      <div class="frow"><div class="fl"><b>1.7</b> Inkomst från bilaga K10, K10A och K13</div><div class="fbox"></div></div>' +
'      <div class="fhead">2 Avdrag – Anställning</div>' +
'      <div class="frow"><div class="fl"><b>2.1</b> Resor till och från arbetet</div><div class="fbox"></div></div>' +
'      <div class="frow"><div class="fl"><b>2.2</b> Tjänsteresor</div><div class="fbox"></div></div>' +
'      <div class="frow"><div class="fl"><b>2.3</b> Tillfälligt arbete, dubbel bosättning och hemresor</div><div class="fbox"></div></div>' +
'      <div class="frow"><div class="fl"><b>2.4</b> Övriga utgifter i arbetet</div><div class="fbox"></div></div>' +
'      <div class="fhead">3 Allmänna avdrag</div>' +
'      <div class="frow"><div class="fl"><b>3.1</b> Socialavgifter enligt EU-förordning m.m.</div><div class="fbox"></div></div>' +
'      <div class="fhead">4 Underlag för skattereduktioner</div>' +
'      <div class="frow"><div class="fl"><b>4.1</b> Rotarbete</div><div class="fbox"></div></div>' +
'      <div class="frow"><div class="fl"><b>4.2</b> Rutarbete</div><div class="fbox"></div></div>' +
'      <div class="frow"><div class="fl"><b>4.3</b> Förnybar el</div><div class="fbox"></div></div>' +
'      <div class="frow"><div class="fl"><b>4.4</b> Gåva</div><div class="fbox"></div></div>' +
'      <div class="frow"><div class="fl"><b>4.5</b> Installation av grön teknik</div><div class="fbox"></div></div>' +
'    </div>' +
'    <div class="fcol">' +
'      <div class="fhead">7 Inkomster – Kapital</div>' +
'      <div class="frow"><div class="fl"><b>7.1</b> Schablonintäkter</div><div class="fbox"></div></div>' +
'      <div class="frow"><div class="fl"><b>7.2</b> Ränteinkomster, utdelningar m.m.</div><div class="fbox"></div></div>' +
'      <div class="frow"><div class="fl"><b>7.3</b> Överskott vid uthyrning av privatbostad</div><div class="fbox"></div></div>' +
'      <div class="frow"><div class="fl"><b>7.4</b> Vinst på fondandelar m.m.</div><div class="fbox"></div></div>' +
'      <div class="fhead">8 Avdrag – Kapital</div>' +
'      <div class="frow"><div class="fl"><b>8.1</b> Ränteutgifter på lån med säkerhet</div><div class="fbox"></div></div>' +
'      <div class="frow"><div class="fl"><b>8.8</b> Ränteutgifter på lån utan säkerhet</div><div class="fbox' +
        (tax.rantor ? ' filled">' + F(tax.rantor) : '">') + '</div></div>' +
'      <div class="fhead">9 Utländsk försäkring – Avkastningsskatt</div>' +
'      <div class="frow"><div class="fl"><b>9.1</b> Skatteunderlag för kapitalförsäkring</div><div class="fbox"></div></div>' +
'      <div class="frow"><div class="fl"><b>9.2</b> Skatteunderlag för pensionsförsäkring</div><div class="fbox"></div></div>' +
'    </div>' +
'  </div>' +
'  <div class="sideid">SKV 2000 35 sv 00 05 &nbsp; Inkomstdeklaration enligt SFS 2011:1244</div>' +
'</div>');

    // ---- PAGE 7 yellow form back ----
    pages.push(
'<div class="page form">' + stamp(7) +
'  <div class="forgbox" style="float:right;margin-top:2mm"><div class="k">Person-/organisationsnummer</div><div class="v">' + pnr + ' &nbsp;&nbsp; <b>2026</b></div></div>' +
'  <div style="clear:both"></div>' +
'  <div class="fbusiness">Punkterna 10–16 avser endast näringsverksamhet</div>' +
'  <div class="fcols">' +
'    <div class="fcol">' +
'      <div class="fhead">10 Näringsverksamhet</div>' +
'      <div class="frow"><div class="fl"><b>10.1</b> Överskott av aktiv näringsverksamhet</div><div class="fbox"></div></div>' +
'      <div class="frow"><div class="fl"><b>10.2</b> Underskott av aktiv näringsverksamhet</div><div class="fbox"></div></div>' +
'      <div class="fhead">11 Räntefördelning</div>' +
'      <div class="frow"><div class="fl"><b>11.1</b> Positiv räntefördelning</div><div class="fbox"></div></div>' +
'      <div class="frow"><div class="fl"><b>11.2</b> Negativ räntefördelning</div><div class="fbox"></div></div>' +
'      <div class="fhead">12 Underlag för expansionsfondsskatt</div>' +
'      <div class="frow"><div class="fl"><b>12.1</b> Ökning av expansionsfond</div><div class="fbox"></div></div>' +
'      <div class="frow"><div class="fl"><b>12.2</b> Minskning av expansionsfond</div><div class="fbox"></div></div>' +
'    </div>' +
'    <div class="fcol">' +
'      <div class="fhead">14 Allmänna avdrag (näringsverksamhet)</div>' +
'      <div class="frow"><div class="fl"><b>14.1</b> Underskott av aktiv näringsverksamhet</div><div class="fbox"></div></div>' +
'      <div class="fchk"><span class="cb"></span> Kryssa här om din näringsverksamhet har upphört under 2025.</div>' +
'    </div>' +
'  </div>' +
'  <div class="fhead2">17 Övriga upplysningar</div>' +
'  <div class="fbox-wide">' +
'    <div class="frow2"><div style="flex:1"><span class="cb"></span> Kryssa här om du har haft utländska inkomster</div></div>' +
'  </div>' +
'  <div class="fovrigt">Övrigt</div>' +
'  <div class="fbox-blank"></div>' +
'  <div class="ftwo" style="margin-top:6px">' +
'    <div class="fbox-half sig"><b>18 Underskrift</b><div class="sigline"></div><div class="fi">Underskrift</div></div>' +
'    <div class="fbox-half sig"><div class="fi" style="margin-top:14px">Telefonnummer (frivilligt)</div><div class="sigline"></div></div>' +
'  </div>' +
'  <div class="sideid">SKV 2000 35 sv 00 05 &nbsp; Samråd enligt SFS 1982:668 har skett med Näringslivets Regelnämnd.</div>' +
'</div>');

    return pages.join('\n');
  }

  global.DeklarationRender = { render: render };
})(typeof window !== 'undefined' ? window : globalThis);
