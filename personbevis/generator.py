#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Skapar personbevisen som HTML på svenska (SV/), engelska (EN/) och iriska (GA/).
Kör:  python3 generator.py          -> bara HTML
      python3 generator.py --pdf    -> HTML + PDF via Google Chrome
Skriv ut HTML-filerna direkt från webbläsaren (Ctrl/Cmd+P, A4, inga marginaler)."""
import base64, pathlib, subprocess, sys

HERE = pathlib.Path(__file__).parent
LOGO = "data:image/png;base64," + base64.b64encode((HERE / "skatteverket_logo.png").read_bytes()).decode()
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
MAKE_PDF = "--pdf" in sys.argv

DATE = "2026-08-23"; PNR = "19880715-7758"; NAME = "Ahmad Baroudi"
ADDR1 = "Köpmansgatan 3 B LGH 1101"; ADDR2 = "294 31 Sölvesborg"

T = {
 "sv": dict(
  tel="Telefon", title="Personbevis", date="Datum", obs="OBS!",
  obs_txt="Personbevis är endast ett intyg om vad som är registrerat i folkbokföringsdatabasen och kan inte användas som ID-handling.",
  purpose="Ändamål", h2="Följande uppgifter är registrerade i folkbokföringsdatabasen", mid="* markerar mellannamn",
  pnr="Personnummer", name="Namn", addr="Bostadsadress", reg="Folkbokföring", regd="Folkbokförd 2026-03-02",
  lan="Län", kommun="Kommun", parish="Församling", prev="Tidigare folkbokföring de senaste två åren",
  citizen="Medborgare i", syria="Syrien", civil="Civilstånd", married="Gift 2023-05-28", maiden="Namn som ogift",
  birth="Födelseort", damascus="Damaskus", country="Land", migr="Flyttning från/till Sverige", frm="Från:", to="Till:",
  right="Uppehållsrätt vid invandring", no="Nej", home="Hemort år 2026", end="SLUT PÅ UTSKRIFT",
  more="Ytterligare uppgifter:",
  more1="Personbevis visar uppgifter som finns registrerade för en person i folkbokföringsdatabasen hos Skatteverket.",
  more2="Personbevis för den som är avregistrerad från folkbokföringen (utvandrad eller avliden) aktualiseras som regel inte och avser därför normalt förhållanden vid tidpunkten för avregistreringen.",
  tn="", code="sv",
  purposes=dict(Personbevis="Adress", pb_anställning="Anställning", pb_folkbockföring="Utdrag om folkbokföringsuppgifter",
   pb_fonder="Fondansökan/Stipendium", pb_hemort="Hemortsbevis", pb_id_kort="ID-kort", pb_inbjudan="Inbjudan",
   pb_pass="Pass", pb_studie="Studier", pb_yrkesledegimation="Yrkeslegitimation")),
 "en": dict(
  tel="Telephone", title="Population registration certificate", date="Date", obs="NOTE!",
  obs_txt="A population registration certificate is only a certificate of what is registered in the population register database and cannot be used as an identity document.",
  purpose="Purpose", h2="The following information is registered in the population register database", mid="* indicates middle name",
  pnr="Personal identity number", name="Name", addr="Residential address", reg="Population registration", regd="Registered 2026-03-02",
  lan="County", kommun="Municipality", parish="Parish", prev="Previous population registration in the last two years",
  citizen="Citizen of", syria="Syria", civil="Marital status", married="Married 2023-05-28", maiden="Name when unmarried",
  birth="Place of birth", damascus="Damascus", country="Country", migr="Migration from/to Sweden", frm="From:", to="To:",
  right="Right of residence at immigration", no="No", home="Domicile year 2026", end="END OF PRINTOUT",
  more="Additional information:",
  more1="A population registration certificate shows the information registered for a person in the population register database at the Swedish Tax Agency (Skatteverket).",
  more2="A population registration certificate for a person who has been deregistered from the population register (emigrated or deceased) is as a rule not updated and therefore normally refers to the circumstances at the time of deregistration.",
  tn="Translation from Swedish / Översättning från svenska", code="en",
  purposes=dict(Personbevis="Address", pb_anställning="Employment", pb_folkbockföring="Extract of population registration data",
   pb_fonder="Fund application/Scholarship", pb_hemort="Certificate of domicile", pb_id_kort="ID card", pb_inbjudan="Invitation",
   pb_pass="Passport", pb_studie="Studies", pb_yrkesledegimation="Professional licence")),
 "ga": dict(
  tel="Teileafón", title="Deimhniú clárúcháin daonra", date="Dáta", obs="AIRE!",
  obs_txt="Níl sa deimhniú clárúcháin daonra ach teastas ar a bhfuil cláraithe i mbunachar sonraí chlár an daonra agus ní féidir é a úsáid mar dhoiciméad aitheantais.",
  purpose="Cuspóir", h2="Tá na sonraí seo a leanas cláraithe i mbunachar sonraí chlár an daonra", mid="* léiríonn sé an lárainm",
  pnr="Uimhir phearsanta", name="Ainm", addr="Seoladh cónaithe", reg="Clárú daonra", regd="Cláraithe 2026-03-02",
  lan="Contae", kommun="Bardas", parish="Paróiste", prev="Clárú daonra roimhe seo le dhá bhliain anuas",
  citizen="Saoránach de", syria="An tSiria", civil="Stádas sibhialta", married="Pósta 2023-05-28", maiden="Ainm neamhphósta",
  birth="Áit bhreithe", damascus="An Damaisc", country="Tír", migr="Imirce ó/go dtí an tSualainn", frm="Ó:", to="Go:",
  right="Ceart cónaithe tráth na hinimirce", no="Níl", home="Áit chónaithe sa bhliain 2026", end="DEIREADH AN ASPHRIONTA",
  more="Faisnéis bhreise:",
  more1="Taispeánann an deimhniú clárúcháin daonra na sonraí atá cláraithe do dhuine i mbunachar sonraí chlár an daonra ag Skatteverket.",
  more2="De ghnáth ní nuashonraítear deimhniú clárúcháin daonra do dhuine atá díchláraithe ó chlár an daonra (ar eisimirce nó básaithe) agus dá bhrí sin is gnách go mbaineann sé leis na cúinsí tráth an díchláraithe.",
  tn="Aistriúchán ón tSualainnis / Översättning från svenska", code="ga",
  purposes=dict(Personbevis="Seoladh", pb_anställning="Fostaíocht", pb_folkbockföring="Sliocht as sonraí chlár an daonra",
   pb_fonder="Iarratas ar chiste/Scoláireacht", pb_hemort="Deimhniú áite cónaithe", pb_id_kort="Cárta aitheantais",
   pb_inbjudan="Cuireadh", pb_pass="Pas", pb_studie="Staidéar", pb_yrkesledegimation="Ceadúnas gairmiúil")),
}

def build_body(t, stem):
    W = max(23, max(len(t[k]) for k in ("pnr","name","addr","reg","lan","kommun","citizen","civil","maiden","birth","country")) + 2)
    r = lambda k, v: f"{k:<{W}}{v}"
    base = [r(t["pnr"], PNR), r(t["name"], NAME), "", r(t["addr"], ADDR1), r("", ADDR2), "",
            r(t["reg"], t["regd"]), r(t["lan"], "Blekinge"), r(t["kommun"], "Sölvesborg")]
    cit = ["", r(t["citizen"], t["syria"])]
    birth = ["", r(t["birth"], t["damascus"]), r(t["country"], t["syria"])]
    migr = ["", t["migr"], f"{t['frm']:<17}{t['to']:<15}{t['right']}", f"{'---':<17}{'2016-11-29':<15}{t['no']}"]
    if stem == "Personbevis": return base
    if stem == "pb_inbjudan": return base + cit + migr
    if stem == "pb_hemort":
        return base + ["", t["home"], r(t["lan"], "10 Blekinge"), r(t["kommun"], "82 Karlshamn"), r(t["parish"], "---")]
    if stem == "pb_folkbockföring":
        return (base + ["", t["prev"], f"{t['date']:<{W}}{t['kommun']:<23}{t['parish']}", f"{'2023-10-20':<{W}}{'Karlshamn':<23}---"]
                + cit + ["", r(t["civil"], t["married"]), r(t["maiden"], "Baroudi")] + birth + migr)
    return base + cit + birth

TEMPLATE = """<!DOCTYPE html>
<html lang="{code}"><head><meta charset="utf-8"><title>{title} – {purpose_val}</title>
<style>
@page {{ size: A4; margin: 0; }}
html,body {{ margin:0; padding:0; background:#fff; color:#000; }}
body {{ width:210mm; height:297mm; position:relative; font-family: Arial, Helvetica, sans-serif; font-size:9pt; }}
.mono {{ font-family: "Courier New", Courier, monospace; font-size:9.5pt; white-space:pre; line-height:1.45; }}
.logo {{ position:absolute; left:15mm; top:6mm; width:45mm; }}
.tel {{ position:absolute; left:15mm; top:16.5mm; }}
.title {{ position:absolute; left:105mm; top:11mm; font-weight:bold; font-size:14pt; }}
.date-l {{ position:absolute; left:105mm; top:17.5mm; font-size:7pt; }}
.date {{ position:absolute; left:105mm; top:20mm; }}
.obs {{ position:absolute; left:15mm; top:22mm; width:58mm; border:1px solid #000; border-radius:3px; padding:1.5mm 2mm; font-size:7.5pt; line-height:1.35; }}
.obs b {{ display:block; }}
.purpose {{ position:absolute; left:15mm; top:48mm; }}
.purpose b {{ font-size:10.5pt; margin-right:2mm; }}
.h2 {{ position:absolute; left:15mm; top:58mm; font-weight:bold; font-size:10.5pt; }}
.h2 small {{ display:block; font-weight:normal; font-size:6.5pt; margin-top:0.5mm; }}
.body {{ position:absolute; left:15mm; top:68mm; right:15mm; }}
.side {{ position:absolute; left:5mm; top:196mm; transform:rotate(-90deg); transform-origin:left top; font-size:7pt; letter-spacing:0.3px; white-space:pre; }}
.more {{ position:absolute; left:15mm; right:15mm; top:232mm; border:1px solid #000; border-radius:3px; padding:2mm 2.5mm; font-size:7pt; line-height:1.5; display:flex; }}
.more > div {{ flex:1; }}
.more > div + div {{ border-left:1px solid #000; padding-left:2.5mm; margin-left:2.5mm; }}
.more b {{ display:block; }}
.web {{ position:absolute; left:15mm; top:270mm; font-weight:bold; font-size:8.5pt; }}
.tn {{ position:absolute; right:15mm; top:6mm; font-size:6.5pt; color:#555; font-style:italic; }}
@media print {{ .tn {{ color:#555; }} }}
</style></head><body>
<div class="tn">{tn}</div>
<img class="logo" src="{logo}" alt="Skatteverket">
<div class="tel mono">{tel}: 0771-567 567</div>
<div class="title">{title}</div>
<div class="date-l">{date}</div>
<div class="date mono">{date_val}</div>
<div class="obs"><b>{obs}</b>{obs_txt}</div>
<div class="purpose"><b>{purpose}</b><span class="mono">{purpose_val}</span></div>
<div class="h2">{h2}<small>{mid}</small></div>
<div class="body mono">{body}
{dash}
{end}</div>
<div class="side">SKV   7780      09   {code}      00     05     1</div>
<div class="more"><div><b>{more}</b>{more1}</div><div>{more2}</div></div>
<div class="web">www.skatteverket.se</div>
</body></html>
"""

for lang, t in T.items():
    outdir = HERE / lang.upper(); outdir.mkdir(exist_ok=True)
    for stem, purpose_val in t["purposes"].items():
        html = TEMPLATE.format(**t, purpose_val=purpose_val, body="\n".join(build_body(t, stem)),
                               dash="-" * 73, date_val=DATE, logo=LOGO)
        out = outdir / f"{stem}_{lang.upper()}.html"
        out.write_text(html, encoding="utf-8")
        if MAKE_PDF and pathlib.Path(CHROME).exists():
            subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
                            f"--print-to-pdf={out.with_suffix('.pdf')}", out.as_uri()], check=True, capture_output=True)
    print("ok", lang, len(t["purposes"]), "filer ->", outdir.name)
