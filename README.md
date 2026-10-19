# studio-deriva.github.io

The website of Studio Deriva, a Minecraft modding studio. Free and open source, like everything we make.

Live at **https://studio-deriva.github.io**

Plain HTML, CSS and JavaScript, no build step. Open `index.html` in a browser to run it locally. The staff page and the mod pages load JSON with `fetch`, so for those serve the folder instead (for example `python3 -m http.server`).

## Pages

- `index.html` — home page
- `mods.html` — our mods, with the BetterTrades trade screen playable in the browser
- `carves-and-crafts.html` — Carves & Crafts: description, changelog and versions
- `staff.html` — the staff, read from the Discord server
- `404.html` — page not found

## Scripts and styles

- `assets/site.js`, `assets/site.css` — shared scroll effects and styles, header and footer
- `assets/i18n.js` — English / Italian switch. The pages are written in English; to translate a new text, add it to the list in this file
- `assets/field.js` — the interactive character field behind the hero (WebGL, with a 2D canvas fallback)
- `assets/trade-demo.js` — the BetterTrades demo on `mods.html`, using the mod's own GUI textures in `assets/mods/bettertrades-gui/`
- `assets/mod-page.js`, `assets/mod-page.css` — mod pages; the changelog and versions come from `data/mods/<slug>.json`
- `assets/staff.js` — renders `data/staff.json` on `staff.html`

When you change a CSS or JS file, bump its `?v=` number in the pages that load it, or browsers keep the old copy.

## Staff sync

`.github/workflows/sync-staff.yml` runs `tools/sync-staff.mjs` every six hours. The script reads the server's members through a Discord bot and rewrites `data/staff.json`; when it changes, the workflow commits it and starts a Pages build.

- Which roles count as staff, and how they are grouped, is set in `staff.config.json`.
- The bot token lives in the `DISCORD_BOT_TOKEN` repository secret, never in the site. The bot needs the Server Members intent.
- Because the workflow commits to `main`, pull before you push.

## Search engines

`sitemap.xml` lists the pages and `robots.txt` points to it. Add new pages to the sitemap.
