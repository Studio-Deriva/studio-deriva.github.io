"""Writes modscan-tags.html and prints the i18n entries it needs (JSON lines)."""
import html, json, sys
sys.path.insert(0, sys.argv[1])
from tags_data import GROUPS

SITE = sys.argv[2]
T = {}  # english -> italian, in page order


def t(en, it):
    T.setdefault(en, it)
    return html.escape(en, quote=False)


def tag_card(tid, w, kind, ten, tit, den, dit):
    k = t("Strong", "Forte") if kind == "strong" else t("Signal", "Segnale")
    return (f'          <div class="tag {kind}" id="{tid}">\n'
            f'            <div class="tag-head"><code>{tid}</code><b class="w">+{w}</b><span class="kind">{k}</span></div>\n'
            f'            <h4>{t(ten, tit)}</h4>\n'
            f'            <p>{t(den, dit)}</p>\n'
            f'          </div>\n')


# Groups whose tags come from an app version that is not out yet: listed in tags_data.py, kept off the page
# until that version ships (then remove the id here and regenerate).
UNRELEASED = {"dive"}

groups_html = ""
toc = ""
for gid, gen, git, den, dit, tags in GROUPS:
    if gid in UNRELEASED:
        continue
    toc += f'        <a href="#g-{gid}">{t(gen, git)}</a>\n'
    groups_html += f'      <section class="group" id="g-{gid}">\n'
    groups_html += f'        <div class="group-head"><h3>{t(gen, git)}</h3>'
    if den:
        groups_html += f'<p>{t(den, dit)}</p>'
    groups_html += '</div>\n        <div class="tags">\n'
    for tag in tags:
        groups_html += tag_card(*tag)
    groups_html += '        </div>\n      </section>\n'

page = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>modscan tags</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="{t("Every tag modscan can give a file, what it means, how much it weighs and how to tell if a mod is dangerous.", "Tutti i tag che modscan può dare a un file: cosa significano, quanto pesano e come capire se una mod è pericolosa.")}">
<meta property="og:title" content="modscan tags">
<meta property="og:type" content="website">
<meta property="og:url" content="{SITE}modscan-tags.html">
<meta property="og:description" content="Every tag modscan can give a file, what it means, how much it weighs and how to tell if a mod is dangerous.">
<meta property="og:site_name" content="Studio Deriva">
<meta property="og:locale" content="en_US">
<meta property="og:locale:alternate" content="it_IT">
<meta property="og:image" content="{SITE}assets/modscan.png">
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="#05081C">
<link rel="icon" href="assets/modscan.png" type="image/png">
<link rel="canonical" href="{SITE}modscan-tags.html">
<link rel="alternate" hreflang="en" href="{SITE}modscan-tags.html">
<link rel="alternate" hreflang="it" href="{SITE}it/modscan-tags.html">
<link rel="alternate" hreflang="x-default" href="{SITE}modscan-tags.html">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="assets/site.css?v=202610190900">
<style>
/* modscan tags: every rule id the engine can report, with its weight and kind. Weights and the strong / signal
   split are copied from the engine (Rules.java / rules.py); change them here when they change there. */
.scan {{
  --bg: #0E1332; --bg-2: #151C45; --fg: #E3E7FA; --muted: #98A1CF; --line: #262F68;
  --accent: #8394FF; --low: #7AD5A1; --medium: #F2B774; --high: #F29393; --undet: #C9A7F5;
  color: var(--fg); background: linear-gradient(180deg, #151C45 0%, #0E1332 30%, #0A0F2A 100%);
}}
.intro {{ padding-block: calc(56px + clamp(3rem, 7vw, 5rem)) clamp(2.5rem, 5vw, 4rem); }}
.intro h1 {{ font-size: clamp(3.4rem, 10vw, 8rem); font-weight: 900; font-stretch: 120%; letter-spacing: -.035em; margin-block: 1rem 1.4rem; }}
.subtabs {{ display: inline-flex; gap: .3rem; padding: .35rem; border-radius: 100px; background: var(--deep); margin-bottom: 1.6rem; }}
.subtabs a {{ padding: .55rem 1.1rem; border-radius: 100px; text-decoration: none; font-weight: 600; font-size: .95rem; color: var(--mist); }}
.subtabs a:hover {{ color: var(--frost); }}
.subtabs a[aria-current="page"] {{ background: var(--cobalt); color: #fff; }}

.block {{ padding-block: clamp(3rem, 7vw, 5rem) 0; }}
.block .wrap {{ display: grid; gap: 2rem; }}
.block h2 {{ font-size: clamp(2rem, 4.5vw, 3.2rem); font-weight: 900; font-stretch: 115%; }}
.block .lede {{ color: var(--muted); }}
.cards {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr)); gap: 1rem; }}
.card {{ background: var(--bg-2); border: 1px solid var(--line); border-radius: 22px; padding: 1.4rem 1.4rem; display: grid; gap: .5rem; align-content: start; }}
.card h3 {{ font-size: 1.15rem; font-stretch: 108%; }}
.card p {{ color: var(--muted); font-size: .95rem; }}
.lv {{ justify-self: start; font: 600 .8rem/1 var(--f-mono); padding: .45rem .8rem; border-radius: 100px; background: color-mix(in srgb, var(--c) 16%, transparent); color: var(--c); border: 1px solid color-mix(in srgb, var(--c) 40%, transparent); }}
.formula {{ font: 500 clamp(1rem, 2vw, 1.25rem)/1.5 var(--f-mono); background: var(--bg-2); border: 1px solid var(--line); border-radius: 18px; padding: 1.1rem 1.3rem; overflow-wrap: anywhere; }}
.formula b {{ color: var(--accent); font-weight: 500; }}
.steps {{ list-style: none; margin: 0; padding: 0; display: grid; gap: .8rem; counter-reset: s; }}
.steps li {{ counter-increment: s; display: grid; grid-template-columns: auto 1fr; gap: .2rem 1rem; background: var(--bg-2); border: 1px solid var(--line); border-left: 4px solid var(--c, var(--accent)); border-radius: 18px; padding: 1.1rem 1.3rem; }}
.steps li::before {{ content: counter(s); grid-row: span 2; font: 900 1.6rem/1 var(--f-display); color: var(--c, var(--accent)); }}
.steps b {{ font-weight: 700; }}
.steps span {{ color: var(--muted); font-size: .95rem; }}

.finder {{ position: sticky; top: 56px; z-index: 5; padding-block: .9rem; background: color-mix(in srgb, #0E1332 92%, transparent); backdrop-filter: blur(8px); border-bottom: 1px solid var(--line); }}
.finder .wrap {{ display: flex; flex-wrap: wrap; gap: .8rem; align-items: center; }}
.finder input {{ flex: 1 1 240px; min-width: 0; font: 500 1rem/1 var(--f-body); color: var(--fg); background: var(--bg-2); border: 1px solid var(--line); border-radius: 100px; padding: .8rem 1.1rem; }}
.finder input:focus {{ outline: 2px solid var(--accent); outline-offset: 1px; }}
.toc {{ display: flex; flex-wrap: wrap; gap: .4rem; }}
.toc a {{ font-size: .82rem; font-weight: 600; text-decoration: none; color: var(--muted); padding: .35rem .7rem; border-radius: 100px; border: 1px solid var(--line); }}
.toc a:hover {{ color: var(--fg); border-color: var(--accent); }}
@media (max-width: 760px) {{
  .finder {{ position: static; }}
  .toc {{ flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; margin-inline: -16px; padding-inline: 16px; }}
  .toc a {{ white-space: nowrap; }}
  .group, .tag {{ scroll-margin-top: 72px; }}
}}

.groups {{ padding-block: 2rem clamp(4rem, 8vw, 6rem); }}
.groups .wrap {{ display: grid; gap: clamp(2.5rem, 6vw, 4rem); }}
.group {{ display: grid; gap: 1.1rem; scroll-margin-top: 140px; }}
.group-head {{ display: grid; gap: .4rem; }}
.group-head h3 {{ font-size: clamp(1.5rem, 3vw, 2.1rem); font-weight: 900; font-stretch: 112%; }}
.group-head p {{ color: var(--muted); max-width: 70ch; }}
.tags {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); gap: .8rem; }}
.tag {{ background: var(--bg-2); border: 1px solid var(--line); border-radius: 18px; padding: 1.1rem 1.2rem; display: grid; gap: .45rem; align-content: start; scroll-margin-top: 140px; }}
.tag:target {{ border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 30%, transparent); }}
.tag-head {{ display: flex; align-items: center; gap: .6rem; flex-wrap: wrap; }}
.tag code {{ font: 600 .95rem/1 var(--f-mono); color: var(--fg); background: rgba(131, 148, 255, .14); padding: .35rem .55rem; border-radius: 8px; }}
.tag .w {{ font: 600 .9rem/1 var(--f-mono); color: var(--accent); }}
.tag.strong .w {{ color: var(--high); }}
.tag .kind {{ margin-left: auto; font: 600 .7rem/1 var(--f-mono); letter-spacing: .08em; text-transform: uppercase; padding: .35rem .6rem; border-radius: 100px; color: var(--muted); border: 1px solid var(--line); }}
.tag.strong .kind {{ color: var(--high); border-color: color-mix(in srgb, var(--high) 40%, transparent); }}
.tag h4 {{ margin: 0; font: 700 1.02rem/1.3 var(--f-body); }}
.tag p {{ color: var(--muted); font-size: .92rem; }}
.none {{ color: var(--muted); }}
[hidden] {{ display: none !important; }}

.next {{ background: var(--ink); text-align: center; }}
.next .wrap {{ display: grid; gap: 1.4rem; justify-items: center; }}
.next h2 {{ font-weight: 900; font-stretch: 118%; }}
.actions {{ display: flex; flex-wrap: wrap; gap: .8rem; }}
</style>
</head>
<body>

<header class="site-header always">
  <div class="wrap nav">
    <a class="brand" href="index.html"><img src="assets/logo.svg" alt="" width="17" height="25">Studio Deriva</a>
    <ul class="nav-links">
      <li><a href="mods.html">Mods</a></li>
      <li><a href="staff.html">Staff</a></li>
      <li><a href="modscan.html" aria-current="page">modscan</a></li>
      <li><a href="index.html#open-source">Open source</a></li>
      <li><a href="index.html#commissions">Commissions</a></li>
      <li><a href="index.html#ideas">Ideas</a></li>
      <li><a href="index.html#team">Join the team</a></li>
    </ul>
    <a class="btn btn-primary" href="https://discord.gg/pQPWr7vfHu" target="_blank" rel="noopener">Discord</a>
  </div>
</header>

<main class="scan">
  <div class="intro">
    <div class="wrap">
      <nav class="subtabs" aria-label="{t("modscan sections", "Sezioni di modscan")}">
        <a href="modscan.html">{t("Overview", "Panoramica")}</a>
        <a href="modscan-tags.html" aria-current="page">{t("Tags", "Tag")}</a>
      </nav>
      <p class="eyebrow">{t("modscan · every finding explained", "modscan · ogni risultato spiegato")}</p>
      <h1>{t("Tags", "Tag")}</h1>
      <p class="lede">{t("Every finding in a modscan report has a tag, like WEBHOOK or CHAINDROP, and a weight. Here is what each one means, how much it counts, and how to tell whether a mod is dangerous.", "Ogni risultato in un report di modscan ha un tag, come WEBHOOK o CHAINDROP, e un peso. Qui trovi cosa significa ciascuno, quanto conta e come capire se una mod è pericolosa.")}</p>
    </div>
  </div>

  <section class="block" id="score">
    <div class="wrap">
      <h2>{t("How a score is made", "Come nasce un punteggio")}</h2>
      <p class="formula">{t("score", "punteggio")} = <b>{t("strong tags", "tag forti")}</b> + <b>{t("signals", "segnali")}</b> ({t("at most 30", "al massimo 30")}), {t("up to 100", "fino a 100")}</p>
      <div class="cards">
        <div class="card"><span class="lv" style="--c: var(--high)">{t("Strong", "Forte")}</span><h3>{t("Strong tags count in full", "I tag forti contano per intero")}</h3><p>{t("Indicators that normal mods almost never have: a webhook, a stealer chain, a disguised executable. One is often enough for HIGH.", "Indicatori che le mod normali non hanno quasi mai: un webhook, una catena da stealer, un eseguibile travestito. Spesso ne basta uno per HIGH.")}</p></div>
        <div class="card"><span class="lv" style="--c: var(--accent)">{t("Signal", "Segnale")}</span><h3>{t("Signals add up to 30 at most", "I segnali sommati arrivano al massimo a 30")}</h3><p>{t("Single behaviours that plenty of normal mods have: network, reflection, starting a program. However many there are, they never make a file HIGH on their own.", "Comportamenti singoli che hanno tantissime mod normali: rete, reflection, avviare un programma. Per quanti siano, da soli non rendono mai un file HIGH.")}</p></div>
      </div>
      <div class="cards">
        <div class="card"><span class="lv" style="--c: var(--low)">LOW · 0–14</span><p>{t("Nothing suspicious found. Not a guarantee: static analysis cannot see everything.", "Niente di sospetto trovato. Non è una garanzia: l'analisi statica non vede tutto.")}</p></div>
        <div class="card"><span class="lv" style="--c: var(--medium)">MEDIUM · 15–39</span><p>{t("Something worth a look. Often signals that a normal mod has too; read the tags.", "Qualcosa da guardare. Spesso sono segnali che ha anche una mod normale; leggi i tag.")}</p></div>
        <div class="card"><span class="lv" style="--c: var(--high)">HIGH · 40+</span><p>{t("At least one strong indicator or a chain. Do not launch it until you know why.", "Almeno un indicatore forte o una catena. Non avviarla finché non sai perché.")}</p></div>
        <div class="card"><span class="lv" style="--c: var(--undet)">{t("Cannot be judged", "Non giudicabile")}</span><p>{t("The code the file runs is not in the file: downloaded or decrypted later, unreadable classes, or another archive format. No score can clear it.", "Il codice che il file esegue non è nel file: scaricato o decifrato dopo, classi illeggibili o un altro formato di archivio. Nessun punteggio può assolverlo.")}</p></div>
      </div>
      <p class="lede">{t("Files verified by Modrinth are left out of the result. Only SIGNATURE, IOC and INDEXPATH are still checked on them.", "I file verificati da Modrinth restano fuori dal risultato. Su di loro vengono controllati solo SIGNATURE, IOC e INDEXPATH.")}</p>
    </div>
  </section>

  <section class="block" id="dangerous">
    <div class="wrap">
      <h2>{t("Is this mod dangerous?", "Questa mod è pericolosa?")}</h2>
      <ol class="steps">
        <li style="--c: var(--high)"><b>{t('HIGH with a "looks like" line', 'HIGH con una riga "sembra"')}</b><span>{t("If the report says it looks like a stealer, a dropper, a loader or a hidden payload, or shows SIGNATURE or IOC: do not launch it, delete it, and tell us on Discord.", "Se il report dice che sembra uno stealer, un dropper, un loader o un payload nascosto, o mostra SIGNATURE o IOC: non avviarla, cancellala e diccelo su Discord.")}</span></li>
        <li style="--c: var(--medium)"><b>{t("HIGH from CHAINDROP on a well-known mod", "HIGH da CHAINDROP su una mod famosa")}</b><span>{t("Updaters and installers really download and run programs. Download the mod again from its official page and scan that copy: if it is verified by Modrinth, it drops out of the result.", "Updater e installer scaricano ed eseguono davvero dei programmi. Riscarica la mod dalla sua pagina ufficiale e scansiona quella copia: se è verificata da Modrinth, esce dal risultato.")}</span></li>
        <li style="--c: var(--medium)"><b>{t("MEDIUM made only of signals", "MEDIUM fatto solo di segnali")}</b><span>{t("NET, REFLECT, EXEC, NATIVE, DYNLOAD and similar are everyday behaviour. Check where you got the file rather than the score.", "NET, REFLECT, EXEC, NATIVE, DYNLOAD e simili sono comportamenti di tutti i giorni. Più del punteggio, controlla da dove hai preso il file.")}</span></li>
        <li style="--c: var(--undet)"><b>{t("Cannot be judged", "Non giudicabile")}</b><span>{t("modscan cannot see the code that will run. Launch it only if you trust whoever made it.", "modscan non può vedere il codice che verrà eseguito. Avviala solo se ti fidi di chi l'ha fatta.")}</span></li>
        <li style="--c: var(--low)"><b>LOW</b><span>{t("Nothing suspicious was found. Getting mods from Modrinth or the author's page is still the best protection.", "Non è stato trovato niente di sospetto. Prendere le mod da Modrinth o dalla pagina dell'autore resta la protezione migliore.")}</span></li>
      </ol>
      <div class="card">
        <h3>{t("Real mods that trigger strong tags", "Mod vere che fanno scattare tag forti")}</h3>
        <p>{t('Distant Horizons\' updater and the ffmpeg installers of FancyMenu and Almanac get CHAINDROP, because they really download and run a program. Xaero\'s updater gets CHAINUPDATE. Essential\'s loader gets CHAINLOAD and is "cannot be judged". The official copies of these mods are verified by Modrinth, so they are left out of the result.', 'L\'updater di Distant Horizons e gli installer di ffmpeg di FancyMenu e Almanac prendono CHAINDROP, perché scaricano ed eseguono davvero un programma. L\'updater di Xaero prende CHAINUPDATE. Il loader di Essential prende CHAINLOAD ed è "non giudicabile". Le copie ufficiali di queste mod sono verificate da Modrinth, quindi restano fuori dal risultato.')}</p>
      </div>
    </div>
  </section>

  <div class="finder" id="all">
    <div class="wrap">
      <input type="search" id="tag-filter" placeholder="{t("Find a tag: WEBHOOK, token, download…", "Cerca un tag: WEBHOOK, token, download…")}" aria-label="{t("Find a tag", "Cerca un tag")}" autocomplete="off">
      <nav class="toc" aria-label="{t("Tag groups", "Gruppi di tag")}">
{toc}      </nav>
    </div>
  </div>

  <div class="groups">
    <div class="wrap">
{groups_html}      <p class="none" id="tag-none" hidden>{t("No tag matches your search.", "Nessun tag corrisponde alla ricerca.")}</p>
    </div>
  </div>

  <section class="next">
    <div class="wrap">
      <p class="eyebrow">{t("Found something?", "Hai trovato qualcosa?")}</p>
      <h2>{t("Tell us about it.", "Faccelo sapere.")}</h2>
      <p class="lede">{t("A false positive, a bug, or a mod that looks suspicious: send it to us on Discord and we will look into it.", "Un falso positivo, un bug o una mod che sembra sospetta: mandacela su Discord e ci diamo un'occhiata.")}</p>
      <div class="actions" style="justify-content:center">
        <a class="btn btn-primary" href="https://discord.gg/pQPWr7vfHu" target="_blank" rel="noopener">{t("Report it on Discord", "Segnalalo su Discord")}</a>
        <a class="btn btn-ghost" href="modscan.html#download">{t("Download modscan", "Scarica modscan")}</a>
      </div>
    </div>
  </section>
</main>

<footer>
  <div class="wrap foot">
    <p class="legal">Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft.</p>
    <span>© 2026 Studio Deriva · modscan is free to use, not open source</span>
    <nav>
      <a href="index.html">Home</a>
      <a href="mods.html">Mods</a>
      <a href="staff.html">Staff</a>
      <a href="https://github.com/Studio-Deriva" target="_blank" rel="noopener">GitHub</a>
      <a href="https://discord.gg/pQPWr7vfHu" target="_blank" rel="noopener">Discord</a>
      <a href="mailto:StudioDeriva@proton.me">Email</a>
    </nav>
  </div>
</footer>

<script src="assets/i18n.js?v=202611250010"></script>
<script src="assets/site.js?v=202610161900"></script>
<script>
/* Tag finder: hides the tags (and empty groups) whose id, title and text do not contain every typed word. */
(function () {{
  var input = document.getElementById('tag-filter');
  var groups = Array.prototype.slice.call(document.querySelectorAll('.group'));
  var none = document.getElementById('tag-none');
  function norm(s) {{ return s.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, ''); }}
  var tags = Array.prototype.slice.call(document.querySelectorAll('.tag')).map(function (el) {{
    return {{ el: el, text: norm(el.textContent) }};
  }});
  input.addEventListener('input', function () {{
    var words = norm(input.value).split(/\\s+/).filter(Boolean);
    var shown = 0;
    tags.forEach(function (t) {{
      var ok = words.every(function (w) {{ return t.text.indexOf(w) !== -1; }});
      t.el.hidden = !ok;
      if (ok) shown++;
    }});
    groups.forEach(function (g) {{ g.hidden = !g.querySelector('.tag:not([hidden])'); }});
    none.hidden = shown > 0;
  }});
}})();
</script>
</body>
</html>
'''
open(SITE_PATH := sys.argv[3], 'w', encoding='utf-8').write(page)
for en, it in T.items():
    print(json.dumps([en, it], ensure_ascii=False))
