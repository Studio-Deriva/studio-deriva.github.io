/* English / Italian switch.
   The pages are written in English. tools/build-it.mjs uses the list below to write an Italian copy
   of each page in it/, so search engines find both; those copies are marked <html lang="it">.
   An English page that has an Italian copy (a <link rel="alternate" hreflang="it">) sends Italian
   readers there. Any other page, like 404.html, is translated here in the browser: every text node
   (and alt, aria-label, title, placeholder) whose English text is a key below is swapped for its
   translation, before the other scripts run. The choice is kept in localStorage and in the ?lang=
   parameter; without one, the browser's language decides. Scripts that write their own text read
   window.SD_LANG and use window.SD_t(english) for the strings listed here.
   To translate a new text: add "English text exactly as on the page": "Testo italiano" below. */
(function () {
  var IT = {
    // ---- header, menu, footer
    "Open source": "Open source",
    "Commissions": "Commissioni",
    "Ideas": "Idee",
    "Join the team": "Unisciti al team",
    "Join the Discord": "Entra nel Discord",
    "Home": "Home",
    "© 2026 Studio Deriva · Free and open source · MIT": "© 2026 Studio Deriva · Gratis e open source · MIT",
    "Menu": "Menu",
    "Close menu": "Chiudi menu",

    // ---- home
    "Minecraft mods. Free, open source, source included.": "Mod di Minecraft. Gratis, open source, sorgente compreso.",
    "See the mods": "Guarda le mod",
    "Commission work": "Commissiona un lavoro",
    "Move the cursor · click anywhere": "Muovi il cursore · clicca ovunque",
    "We make Minecraft mods. All of them free. All of them open source, source included. No premium version, no ad wall, ever.": "Facciamo mod di Minecraft. Tutte gratis. Tutte open source, sorgente compreso. Niente versioni premium, niente pubblicità per scaricare, mai.",
    "What we've shipped": "Cosa abbiamo pubblicato",
    "Our mods": "Le nostre mod",
    "Cut and paint pumpkins pixel by pixel, then light them up.": "Intaglia e dipingi zucche pixel per pixel, poi accendile.",
    "Learn more": "Scopri di più",
    "Pokémon, items and money in one safe, server-side trade.": "Pokémon, oggetti e soldi in un solo scambio sicuro, lato server.",
    "All mods, specs and audits": "Tutte le mod, specifiche e audit",
    "mods shipped, both under the MIT licence": "mod pubblicate, entrambe con licenza MIT",
    "unit tests you can run with": "test automatici che puoi lanciare con",
    "bugs found in our own audits, written up and published": "bug trovati nei nostri audit, documentati e pubblicati",
    "premium versions, paywalls or ad-wall downloads": "versioni premium, paywall o download dietro pubblicità",
    "Open source first": "Prima di tutto open source",
    "Free forever. Credit where it's due.": "Gratis per sempre. E i meriti a chi spettano.",
    "Every mod and every line of code we make is free, for everyone.": "Ogni mod e ogni riga di codice che scriviamo è gratis, per tutti.",
    "Source included, no paywall, no premium version.": "Sorgente compreso, niente paywall, niente versione premium.",
    "Read it, learn from it, fork it and build on it.": "Leggilo, impara, fanne un fork e costruiscici sopra.",
    "The one exception is private commissioned work. Code someone asked and paid us to write belongs to them, so it stays theirs to publish or not.": "L'unica eccezione sono i lavori su commissione. Il codice che qualcuno ci ha chiesto e pagato è suo, e decide lui se pubblicarlo.",
    "Code": "Codice",
    "Java and Kotlin, Fabric and NeoForge": "Java e Kotlin, Fabric e NeoForge",
    "Models": "Modelli",
    "Blockbench and Blender, built for the game": "Blockbench e Blender, pensati per il gioco",
    "Textures": "Texture",
    "Art that holds up at 16x and 64x": "Grafica che regge a 16x e a 64x",
    "Animation": "Animazione",
    "Rigging and motion for mobs, items, effects": "Rigging e movimento per mob, oggetti, effetti",
    "Private work": "Lavori privati",
    "Need a mod, a feature or an asset that only you will have? The team that builds our public mods builds yours, and what you pay for belongs to you.": "Ti serve una mod, una funzione o un asset solo tuo? Lo stesso team che fa le nostre mod pubbliche fa la tua, e quello che paghi è tuo.",
    "Custom mods": "Mod su misura",
    "Content, mechanics and server-side systems for Fabric or NeoForge, in Java or Kotlin.": "Contenuti, meccaniche e sistemi lato server per Fabric o NeoForge, in Java o Kotlin.",
    "3D models": "Modelli 3D",
    "Blocks, items and mobs modelled in Blockbench or Blender, ready for the game.": "Blocchi, oggetti e mob modellati in Blockbench o Blender, pronti per il gioco.",
    "Textures & animation": "Texture e animazioni",
    "Texture work at the resolution you need, plus rigging and animation.": "Texture alla risoluzione che ti serve, più rigging e animazioni.",
    "Tooling & web": "Strumenti e web",
    "Tools, sites and databases around your server, in whatever fits the job.": "Strumenti, siti e database per il tuo server, con il linguaggio giusto per il lavoro.",
    "Open an order ticket": "Apri un ticket d'ordine",
    "On our Discord, choose": "Sul nostro Discord, scegli",
    ". It's private between you and the staff.": ". È privato tra te e lo staff.",
    "Describe what you need": "Descrivi cosa ti serve",
    "Version, loader, what it should do. We come back with a quote.": "Versione, loader, cosa deve fare. Ti rispondiamo con un preventivo.",
    "Agree the terms": "Concordate i termini",
    "Everything is written in the ticket, where the staff can see it.": "Tutto viene scritto nel ticket, dove lo staff può vederlo.",
    "Get your code": "Ricevi il codice",
    "Delivered and yours. Publish it or keep it private, your call.": "Consegnato e tuo. Pubblicalo o tienilo privato, decidi tu.",
    "Paid work is arranged only through an order ticket. Deals struck in DMs are between you and the other person, and we can't mediate them when they go wrong.": "I lavori a pagamento si concordano solo tramite ticket d'ordine. Gli accordi presi in DM restano tra te e l'altra persona, e se vanno male non possiamo fare da mediatori.",
    "Ask for a quote on Discord": "Chiedi un preventivo su Discord",
    "Suggestions": "Suggerimenti",
    "Your ideas actually ship.": "Le tue idee diventano davvero mod.",
    "Most of what we've shipped began as somebody's message in our suggestions channel. Write yours down, even if it sounds small. An idea with the why filled in gets built far more often than a one-liner.": "Quasi tutto quello che abbiamo pubblicato è nato da un messaggio nel canale dei suggerimenti. Scrivi la tua idea, anche se ti sembra piccola. Un'idea che spiega il perché viene realizzata molto più spesso di una riga buttata lì.",
    "If your idea ships, your name goes in the credits of the mod and in the release notes.": "Se la tua idea viene pubblicata, il tuo nome finisce nei crediti della mod e nelle note di rilascio.",
    "If it turns into something big, we go further, and we tell you before the release, not after.": "Se diventa qualcosa di grosso, facciamo di più, e te lo diciamo prima dell'uscita, non dopo.",
    "One idea per message. Five ideas in one post get answered as zero.": "Un'idea per messaggio. Cinque idee in un post contano come zero.",
    "Scroll first. If it's already there, react to it instead of posting it again.": "Prima scorri. Se c'è già, mettici una reazione invece di riscriverla.",
    "What gets built stays free and open source, like everything else we make.": "Quello che viene realizzato resta gratis e open source, come tutto quello che facciamo.",
    "Copy": "Copia",
    "Copied": "Copiato",
    "Selected": "Selezionato",
    "Read": "Letto",
    "Under discussion": "In discussione",
    "We're building it": "Lo stiamo facendo",
    "Shipped": "Pubblicato",
    "Not for us": "Non fa per noi",
    "Always with a reason. No today isn't no forever.": "Sempre con un motivo. Un no oggi non è un no per sempre.",
    "What the staff reactions mean": "Cosa significano le reazioni dello staff",
    "Volunteer team": "Team di volontari",
    "We're always short of hands. Pick what you'd do and fill in the form on Discord. It takes two minutes and opens a private channel with the reviewers.": "Ci servono sempre mani in più. Scegli cosa vorresti fare e compila il modulo su Discord. Ci vogliono due minuti e si apre un canale privato con chi valuta le candidature.",
    "Apprentice": "Apprendista",
    "New to this? Learn by building, next to people who have already shipped mods.": "Alle prime armi? Impara facendo, accanto a chi ha già pubblicato mod.",
    "Mod Developer": "Sviluppatore di mod",
    "Java or Kotlin, Fabric or NeoForge. Bring code we can read.": "Java o Kotlin, Fabric o NeoForge. Porta codice che si possa leggere.",
    "3D Modeler": "Modellatore 3D",
    "Blockbench, Blender. Models that end up in game.": "Blockbench, Blender. Modelli che finiscono nel gioco.",
    "Texture Artist": "Texture artist",
    "Textures and item art that hold up at 16x and at 64x.": "Texture e grafiche degli oggetti che reggono a 16x e a 64x.",
    "Animator": "Animatore",
    "Rigging and animation for mobs, items and effects.": "Rigging e animazioni per mob, oggetti ed effetti.",
    "Moderator": "Moderatore",
    "Keeping the server readable. Patience required, tools provided.": "Tenere il server in ordine. Serve pazienza, gli strumenti li diamo noi.",
    "What we write in": "In cosa scriviamo",
    "Java and Kotlin where Minecraft lives, systems languages for the tooling, and the web stack for everything with a web face. Coloured the way GitHub colours them.": "Java e Kotlin dove vive Minecraft, linguaggi di sistema per gli strumenti e il web per tutto quello che ha una pagina. Con i colori che usa GitHub.",
    "Support": "Supporto",
    "Need something from us?": "Ti serve qualcosa da noi?",
    "Open a ticket on Discord. One channel per request, a transcript when it closes, and staff who claim a ticket so two people don't answer over each other.": "Apri un ticket su Discord. Un canale per ogni richiesta, una trascrizione quando si chiude, e lo staff che prende in carico il ticket così due persone non rispondono una sopra l'altra.",
    "General Support": "Supporto generale",
    "Questions, help, anything else.": "Domande, aiuto, tutto il resto.",
    "Product Support": "Supporto prodotti",
    "Trouble with something you bought or use.": "Problemi con qualcosa che hai comprato o usi.",
    "Report a Bug": "Segnala un bug",
    "Something is broken or behaves wrong.": "Qualcosa è rotto o si comporta male.",
    "Report a User": "Segnala un utente",
    "Handled privately.": "Gestito in privato.",
    "Order a Product": "Order a Product",
    "Ask for a quote or place an order.": "Chiedi un preventivo o fai un ordine.",
    "A bug report we can fix has:": "Una segnalazione che possiamo risolvere ha:",
    "Minecraft version": "versione di Minecraft",
    "loader + version": "loader + versione",
    "mod version": "versione della mod",
    "steps to trigger it": "passi per riprodurlo",
    "log on mclo.gs or a gist": "log su mclo.gs o in un gist",
    "Write the one you'd want to play.": "Scrivi quella che vorresti giocare.",
    "Ideas, bug reports, applications and orders all start in the same place.": "Idee, segnalazioni, candidature e ordini partono tutti dallo stesso posto.",
    "Join Studio Deriva on Discord": "Entra nel Discord di Studio Deriva",
    "Or write to": "Oppure scrivi a",
    "Character field. Move the cursor to light it, click to colour it.": "Campo di caratteri. Muovi il cursore per illuminarlo, clicca per colorarlo.",
    "Studio Deriva logo, a blue octahedron": "Logo di Studio Deriva, un ottaedro blu",
    "Carves & Crafts logo, a pixel-art carved pumpkin face": "Logo di Carves & Crafts, una zucca intagliata in pixel art",
    "BetterTrades logo, a teal and an amber arrow pointing opposite ways": "Logo di BetterTrades, una freccia verde acqua e una ambra in direzioni opposte",

    // ---- mods page
    "Free · MIT · source included": "Gratis · MIT · sorgente compreso",
    "Two so far. Each one ships with its full source, its tests, and a written account of every bug we found before release and how we closed it.": "Due, per ora. Ognuna esce con il sorgente completo, i suoi test e il resoconto scritto di ogni bug trovato prima dell'uscita e di come l'abbiamo chiuso.",
    "Jump to a mod": "Vai a una mod",
    "Pumpkin carving, pixel by pixel.": "Intaglio di zucche, pixel per pixel.",
    "Changelog & versions ›": "Changelog e versioni ›",
    "Changelog & versions": "Changelog e versioni",
    "A carving bench where you cut and paint pumpkins pixel by pixel.": "Un banco da intaglio dove tagli e dipingi le zucche pixel per pixel.",
    "Cuts go all the way through the wall, and a torch or a candle turns the finished pumpkin into a lantern that glows in the colour of its flame.": "I tagli attraversano tutta la parete, e una torcia o una candela trasformano la zucca finita in una lanterna che brilla del colore della sua fiamma.",
    "Try the bench": "Prova il banco",
    "Carve this one.": "Intaglia questa.",
    "Drag on the pumpkin to cut through the skin, paint it, then light it. In the mod the knife loses one durability per cut pixel and the brush one charge per painted pixel.": "Trascina sulla zucca per tagliare la buccia, dipingila, poi accendila. Nella mod il coltello perde un punto di durabilità per ogni pixel tagliato e il pennello una carica per ogni pixel dipinto.",
    "Carving tools": "Attrezzi da intaglio",
    "Knife": "Coltello",
    "Patch": "Ripara",
    "Paint cobalt": "Dipingi di cobalto",
    "Paint teal": "Dipingi di verde acqua",
    "Paint cream": "Dipingi di crema",
    "Paint dark plum": "Dipingi di prugna scuro",
    "Light it with a torch": "Accendila con una torcia",
    "Take the torch out": "Togli la torcia",
    "Reset": "Ricomincia",
    "Knife:": "Coltello:",
    "durability used": "durabilità usata",
    "Brush:": "Pennello:",
    "charges used": "cariche usate",
    "Pumpkin face you can carve": "Faccia di zucca da intagliare",
    "Nine models": "Nove modelli",
    "Every pumpkin its own shape": "Ogni zucca con la sua forma",
    "Classic, White, Blue, Cinderella, Mini Yellow, Warty, Butternut, Kabocha and Turban. Warts, stems and leaves stay; the body is what you carve.": "Classic, White, Blue, Cinderella, Mini Yellow, Warty, Butternut, Kabocha e Turban. Bitorzoli, gambi e foglie restano; si intaglia il corpo.",
    "Real holes": "Buchi veri",
    "Cut through the wall": "Tagli che attraversano la parete",
    "A cut pixel shows the flesh, the hole's sides and the cavity behind it. Warts sitting over a cut disappear with it.": "Un pixel tagliato mostra la polpa, i lati del buco e la cavità dietro. I bitorzoli sopra un taglio spariscono con lui.",
    "Any colour": "Qualsiasi colore",
    "A real paint editor": "Un vero editor di pittura",
    "Full RGB with hex field, HSV picker, dye swatches, fill, eyedropper, mirror, undo and redo, zoom and pan. Canvas at x1, x2 or x4.": "RGB completo con campo esadecimale, selettore HSV, campioni di tinture, riempimento, contagocce, specchio, annulla e ripeti, zoom e spostamento. Tela a x1, x2 o x4.",
    "Lanterns": "Lanterne",
    "Light that matches the flame": "Luce del colore della fiamma",
    "Torch, soul torch, copper torch, redstone torch or any candle. Vanilla light level, glowing inside in its colour.": "Torcia, torcia delle anime, torcia di rame, torcia di redstone o qualsiasi candela. Livello di luce vanilla, con l'interno che brilla del suo colore.",
    "Schematics": "Schemi",
    "Save, copy, share": "Salva, copia, condividi",
    "Keep a library per world, export designs to": "Tieni una libreria per ogni mondo, esporta i disegni in file",
    "files, import your friends'. Data packs can ship presets.": ", importa quelli dei tuoi amici. I data pack possono includere preset.",
    "Farming": "Coltivazione",
    "Seeds and wild patches": "Semi e campi selvatici",
    "Field Pumpkin, Heirloom Pumpkin and Winter Squash seeds, each growing a weighted mix of models. Wild patches spawn in matching biomes.": "Semi di Field Pumpkin, Heirloom Pumpkin e Winter Squash, ognuno fa crescere un mix di modelli. I campi selvatici compaiono nei biomi adatti.",
    "Version": "Versione",
    "Install on": "Da installare su",
    "Client and server": "Client e server",
    "Works with": "Compatibile con",
    "Tests": "Test",
    "64 unit tests": "64 test automatici",
    "15 unit tests": "15 test automatici",
    "Findings in the audit behind 1.0.3: network abuse, oversized chunk data, player data loss, unbounded libraries, render cache. What each was, what changed, and the one that is only partly closed are all in": "Problemi trovati nell'audit della 1.0.3: abusi di rete, dati dei chunk troppo grandi, perdita dei dati dei giocatori, librerie senza limiti, cache di render. Cosa era ognuno, cosa è cambiato e quello chiuso solo in parte sono tutti in",
    "Source on GitHub": "Sorgente su GitHub",
    "Read the audit": "Leggi l'audit",
    "Trading for Cobblemon, done safely.": "Scambi per Cobblemon, fatti in sicurezza.",
    "Alpha testing": "In alpha testing",
    "Server-side player trading for Cobblemon.": "Scambi tra giocatori per Cobblemon, lato server.",
    "Pokémon, items and money in the same offer, a full history in a database, and no client mod required: vanilla clients see a normal container.": "Pokémon, oggetti e soldi nella stessa offerta, lo storico completo in un database, e nessuna mod sul client: i client vanilla vedono un normale contenitore.",
    "Try a trade": "Prova uno scambio",
    "The real trade screen, in your browser.": "La vera schermata di scambio, nel tuo browser.",
    "The mod's own GUI textures and slot grid, with Minecraft's and Cobblemon's item textures and Minecraft's font. Offer items, Pokémon and money, confirm, and watch the three second countdown. The other player, Alex, is played by the page.": "Le texture e la griglia della GUI della mod, con le texture degli oggetti di Minecraft e Cobblemon e il font di Minecraft. Offri oggetti, Pokémon e soldi, conferma e guarda il conto alla rovescia di tre secondi. L'altro giocatore, Alex, lo gioca la pagina.",
    "Click: whole stack · Right click: one · Shift click: half · Hover for details": "Clic: tutto lo stack · Clic destro: uno · Shift+clic: metà · Passa sopra per i dettagli",
    "Reset the trade": "Ricomincia lo scambio",
    "How a trade stays safe": "Come uno scambio resta sicuro",
    "Nothing moves until everything checks out.": "Non si muove niente finché tutto non torna.",
    "A trading mod moves other people's items, Pokémon and money. A duplication bug ends a server's economy, so every step is built to fail closed.": "Una mod di scambi muove oggetti, Pokémon e soldi di altre persone. Un bug di duplicazione distrugge l'economia di un server, quindi ogni passo è fatto per bloccarsi in caso di dubbio.",
    "Offer": "Offerta",
    "Up to eight slots per side: items, Pokémon and money together. Opened from Cobblemon's own interaction wheel.": "Fino a otto slot per lato: oggetti, Pokémon e soldi insieme. Si apre dalla ruota di interazione di Cobblemon.",
    "Escrow": "Escrow",
    "Offered items leave the inventory at once and are recorded in a local database. Crash mid-trade, and they come back at next login.": "Gli oggetti offerti lasciano subito l'inventario e vengono registrati in un database locale. Se il server crasha a metà scambio, tornano al login successivo.",
    "Fingerprint": "Impronta",
    "Pokémon never move early. They're fingerprinted on offer and re-checked at commit; if anything changed, the trade is cancelled.": "I Pokémon non si muovono mai prima del tempo. Quando vengono offerti se ne prende l'impronta, ricontrollata alla conferma; se qualcosa è cambiato, lo scambio viene annullato.",
    "Commit": "Conferma",
    "Only the money difference moves, in one atomic Impactor operation. Trade evolutions and Cobblemon's events still fire.": "Si sposta solo la differenza di soldi, in un'unica operazione atomica di Impactor. Le evoluzioni per scambio e gli eventi di Cobblemon funzionano ancora.",
    "No client mod": "Nessuna mod sul client",
    "Built with Polymer and sgui": "Fatto con Polymer e sgui",
    "The screen is server-side. Players just need the resource pack, which Polymer can host for you.": "La schermata è lato server. Ai giocatori serve solo il resource pack, che Polymer può distribuire per te.",
    "History": "Storico",
    "Every trade, stored": "Ogni scambio, salvato",
    "A normalised schema on MariaDB or MySQL, with automatic SQLite fallback and replay when the remote database comes back.": "Uno schema normalizzato su MariaDB o MySQL, con ripiego automatico su SQLite e recupero quando il database remoto torna disponibile.",
    "Blacklist": "Blacklist",
    "Down to species and form": "Fino a specie e forma",
    "Block items and Pokémon by species, form and aspects, editable in game with": "Blocca oggetti e Pokémon per specie, forma e aspetti, modificabile in gioco con",
    "Read-only, for other mods": "Sola lettura, per altre mod",
    "Per-mod keys and two levels: history queries, or queries plus cancellable pre-trade events.": "Chiavi per ogni mod e due livelli: consultare lo storico, oppure anche eventi pre-scambio annullabili.",
    "Your words": "Le tue parole",
    "Every message is a file": "Ogni messaggio è un file",
    "English and Italian ship with the mod. Rewrite any line, colour codes included, and reload with": "Inglese e italiano sono inclusi nella mod. Riscrivi qualsiasi riga, codici colore compresi, e ricarica con",
    "See and stop trades": "Vedi e ferma gli scambi",
    "lists trades in progress,": "elenca gli scambi in corso,",
    "stops one,": "ne ferma uno,",
    "shows anyone's past trades.": "mostra gli scambi passati di chiunque.",
    "Requires": "Richiede",
    "Optional": "Facoltativi",
    "Server only": "Solo server",
    "Findings across three audit rounds, all closed: duplication, item loss, race conditions, economy, lifecycle. The file also says plainly what has not been verified. Worth reading before trusting any trading mod with your economy, this one included.": "Problemi trovati in tre giri di audit, tutti chiusi: duplicazione, perdita di oggetti, race condition, economia, ciclo di vita. Il file dice chiaramente anche cosa non è stato verificato. Vale la pena leggerlo prima di affidare la tua economia a qualsiasi mod di scambi, compresa questa.",
    "What's next": "Cosa viene dopo",
    "The next mod might be yours.": "La prossima mod potrebbe essere la tua.",
    "Post an idea in our suggestions channel. If it ships, your name goes in the credits and the release notes.": "Scrivi un'idea nel canale dei suggerimenti. Se viene pubblicata, il tuo nome va nei crediti e nelle note di rilascio.",
    "Suggest a mod on Discord": "Proponi una mod su Discord",
    "Or commission one": "Oppure commissionane una",
    "Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft. Item textures and font from Minecraft, © Mojang; Poké Ball and candy textures from": "Non è un prodotto ufficiale di Minecraft. Non è approvato né associato a Mojang o Microsoft. Texture degli oggetti e font di Minecraft, © Mojang; texture di Poké Ball e caramelle da",
    "(MPL-2.0). Pokémon is a trademark of Nintendo, Creatures and Game Freak.": "(MPL-2.0). Pokémon è un marchio di Nintendo, Creatures e Game Freak.",
    "Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft.": "Non è un prodotto ufficiale di Minecraft. Non è approvato né associato a Mojang o Microsoft.",

    // ---- staff
    "The people behind the mods": "Le persone dietro le mod",
    "Developers, artists and moderators who keep Studio Deriva running, most of them in their spare time. Find them on our Discord; for help, open a ticket rather than a DM.": "Sviluppatori, artisti e moderatori che mandano avanti Studio Deriva, quasi tutti nel tempo libero. Li trovi sul nostro Discord; per avere aiuto apri un ticket invece di scrivere in DM.",
    "Straight from Discord": "Direttamente da Discord",
    "The staff list is on its way.": "L'elenco dello staff sta arrivando.",
    "This page is filled from our Discord server: everyone with a staff role, their avatar and their roles. It refreshes every six hours, so new staff show up on their own.": "Questa pagina si riempie dal nostro server Discord: chiunque abbia un ruolo staff, con avatar e ruoli. Si aggiorna ogni sei ore, quindi i nuovi membri compaiono da soli.",
    "Meet them on Discord": "Conoscili su Discord",
    "Want your name here?": "Vuoi il tuo nome qui?",
    "Applications are open for developers, modelers, texture artists, animators and moderators.": "Le candidature sono aperte per sviluppatori, modellatori, texture artist, animatori e moderatori.",
    "See the open roles": "Guarda i ruoli aperti",
    "Discord profile": "Profilo Discord",
    "Roles": "Ruoli",
    "See less": "Mostra meno",

    // ---- mod page
    "Pumpkin carving for Fabric 1.21.11. Free and open source.": "Intaglio di zucche per Fabric 1.21.11. Gratis e open source.",
    "Download soon on": "Presto scaricabile su",
    "Download on": "Scarica su",
    "Versions": "Versioni",
    "Channel": "Canale",
    "Name": "Nome",
    "Game version": "Versione del gioco",
    "Platform": "Piattaforma",
    "Published": "Pubblicata",
    "Downloads": "Download",
    "Compatibility": "Compatibilità",
    "Platforms": "Piattaforme",
    "Supported environments": "Ambienti supportati",
    "Details": "Dettagli",
    "License": "Licenza",
    "Updated": "Aggiornata",
    "Status": "Stato",
    "Pending approval on Modrinth": "In attesa di approvazione su Modrinth",
    "Published on Modrinth": "Pubblicata su Modrinth",
    "Project sections": "Sezioni del progetto",
    "Soon on Modrinth": "Presto su Modrinth",
    "Download": "Scarica",
    "Waiting for Modrinth approval": "In attesa dell'approvazione di Modrinth",
    "The changelog could not be loaded. Try again in a moment.": "Non è stato possibile caricare il changelog. Riprova tra un momento.",

    // ---- 404
    "This block isn't here.": "Questo blocco non c'è.",
    "The page you were looking for moved, never existed, or was mined by someone else.": "La pagina che cercavi è stata spostata, non è mai esistita, o l'ha minata qualcun altro.",
    "Back to the home page": "Torna alla home",

    // ---- page titles
    "Studio Deriva Mods": "Studio Deriva · Mod",
    "Page not found · Studio Deriva": "Pagina non trovata · Studio Deriva",
    "Studio Deriva Staff": "Staff di Studio Deriva",

    // ---- descriptions for search engines and link previews (the <head> of each page)
    "Studio Deriva": "Studio Deriva",
    "Carves & Crafts": "Carves & Crafts",
    "Studio Deriva makes Minecraft mods. All of them free, all of them open source, source included. Private commissions on request.": "Studio Deriva crea mod per Minecraft. Tutte gratis, tutte open source, sorgente compreso. Commissioni private su richiesta.",
    "Carves & Crafts and BetterTrades: free, open-source Minecraft mods by Studio Deriva, with their specs and published audits.": "Carves & Crafts e BetterTrades: mod per Minecraft gratuite e open source di Studio Deriva, con specifiche e audit pubblicati.",
    "The staff of Studio Deriva: developers, artists and moderators, with their roles and Discord profiles.": "Lo staff di Studio Deriva: sviluppatori, artisti e moderatori, con i loro ruoli e i profili Discord.",
    "Carves & Crafts: pumpkin carving for Fabric 1.21.11. Changelog, versions and details. Free and open source by Studio Deriva.": "Carves & Crafts: intaglio di zucche per Fabric 1.21.11. Changelog, versioni e dettagli. Gratis e open source, di Studio Deriva."
  };

  var KEY = 'sd-lang';
  // An Italian copy written by tools/build-it.mjs: already translated, and always Italian.
  var copy = document.documentElement.lang === 'it';
  var hasCopy = !copy && !!document.querySelector('link[rel="alternate"][hreflang="it"]');
  // The same page in the other language: it/<page> from the English one, ../<page> back.
  function twin() {
    var page = location.pathname.split('/').pop();
    var url = new URL((copy ? '../' : 'it/') + page, location.href);
    url.search = ''; url.hash = location.hash;
    return url.toString();
  }
  var lang = null;
  try {
    var q = new URLSearchParams(location.search).get('lang');
    if (q === 'it' || q === 'en') { lang = q; localStorage.setItem(KEY, q); }
    else lang = localStorage.getItem(KEY);
  } catch (e) { /* storage blocked: fall back to the browser's language */ }
  if (lang !== 'it' && lang !== 'en') lang = (navigator.language || '').toLowerCase().indexOf('it') === 0 ? 'it' : 'en';
  if (copy) lang = 'it';
  else if (lang === 'it' && hasCopy) { location.replace(twin()); return; }

  window.SD_LANG = lang;
  window.SD_t = function (en) { return lang === 'it' && Object.prototype.hasOwnProperty.call(IT, en) ? IT[en] : en; };
  document.documentElement.lang = lang;

  // ---- swap the page's own text
  if (lang === 'it' && !copy) {
    var SKIP = 'script,style,pre,code,svg,textarea,[data-no-i18n]';
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) { return n.parentElement && !n.parentElement.closest(SKIP) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; }
    });
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var raw = node.nodeValue, key = raw.replace(/\s+/g, ' ').trim();
      if (!key || !Object.prototype.hasOwnProperty.call(IT, key)) return;
      var lead = /^\s/.test(raw) ? ' ' : '', trail = /\s$/.test(raw) ? ' ' : '';
      // A translation that starts with punctuation sticks to the previous word.
      if (/^[.,;:]/.test(IT[key])) lead = '';
      node.nodeValue = lead + IT[key] + trail;
    });
    document.querySelectorAll('[alt],[aria-label],[title],[placeholder]').forEach(function (el) {
      ['alt', 'aria-label', 'title', 'placeholder'].forEach(function (a) {
        var v = el.getAttribute(a);
        if (v && Object.prototype.hasOwnProperty.call(IT, v)) el.setAttribute(a, IT[v]);
      });
    });
    if (Object.prototype.hasOwnProperty.call(IT, document.title)) document.title = IT[document.title];
  }

  // ---- the switch, in the bottom right corner
  var css = document.createElement('style');
  css.textContent =
    '.lang-switch{position:fixed;z-index:18;right:calc(14px + env(safe-area-inset-right,0px));bottom:calc(14px + env(safe-area-inset-bottom,0px));display:flex;padding:3px;gap:2px;border-radius:100px;' +
    'background:rgba(5,8,28,.82);border:1px solid rgba(156,166,217,.25);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 8px 24px rgba(0,0,0,.35)}' +
    '.lang-switch button{font:600 .78rem/1 "JetBrains Mono",ui-monospace,monospace;letter-spacing:.06em;color:#9CA6D9;background:transparent;border:0;padding:.5rem .7rem;border-radius:100px;cursor:pointer;transition:background .2s,color .2s}' +
    '.lang-switch button:hover{color:#E8ECFF}' +
    '.lang-switch button[aria-pressed="true"]{background:#2743F4;color:#fff;cursor:default}' +
    '.lang-switch button:focus-visible{outline:2px solid #E8ECFF;outline-offset:1px}' +
    'body.menu-open .lang-switch{z-index:21}';
  document.head.appendChild(css);
  var box = document.createElement('div');
  box.className = 'lang-switch';
  box.setAttribute('role', 'group');
  box.setAttribute('aria-label', lang === 'it' ? 'Lingua' : 'Language');
  [['en', 'EN', 'English'], ['it', 'IT', 'Italiano']].forEach(function (o) {
    var b = document.createElement('button');
    b.type = 'button'; b.textContent = o[1]; b.title = o[2]; b.lang = o[0];
    b.setAttribute('aria-pressed', o[0] === lang ? 'true' : 'false');
    b.addEventListener('click', function () {
      if (o[0] === lang) return;
      try { localStorage.setItem(KEY, o[0]); } catch (e) {}
      if (copy || hasCopy) { location.href = twin(); return; }
      var url = new URL(location.href);
      url.searchParams.set('lang', o[0]);
      location.replace(url.toString());
    });
    box.appendChild(b);
  });
  document.body.appendChild(box);
})();
