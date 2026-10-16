/* Mod pages: switches between Description, Changelog and Versions, and fills the last two
   from data/mods/<slug>.json. When the project is live on Modrinth, that file can be
   regenerated from Modrinth's public API; the page itself does not change. */
(function () {
  var IT = window.SD_LANG === 'it';
  var t = window.SD_t || function (s) { return s; };
  var main = document.querySelector('[data-mod]');
  if (!main) return;
  var slug = main.getAttribute('data-mod');
  var tabs = document.querySelectorAll('[data-tab]');
  var panels = document.querySelectorAll('[data-panel]');

  // ---------------------------------------------------------------- tabs
  function show(name) {
    var found = false;
    panels.forEach(function (p) { var on = p.getAttribute('data-panel') === name; p.hidden = !on; if (on) found = true; });
    if (!found) return show('changelog');
    tabs.forEach(function (t) {
      if (t.getAttribute('data-tab') === name) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
    });
  }
  function fromHash() { show((location.hash || '#changelog').slice(1)); }
  window.addEventListener('hashchange', function () { fromHash(); window.scrollTo({ top: 0, behavior: 'instant' }); });
  fromHash();

  // ---------------------------------------------------------------- markdown
  // Enough Markdown for a changelog: headings, bullets, paragraphs, **bold**, `code` and links.
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function inline(s) {
    return esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }
  function markdown(md) {
    var out = [], list = false;
    md.split(/\n/).forEach(function (line) {
      var t = line.trim();
      var item = /^[-*]\s+(.*)/.exec(t);
      if (!item && list) { out.push('</ul>'); list = false; }
      if (!t) return;
      var h = /^(#{1,3})\s+(.*)/.exec(t);
      if (h) { var lv = Math.max(2, h[1].length); out.push('<h' + lv + '>' + inline(h[2]) + '</h' + lv + '>'); return; }
      if (item) { if (!list) { out.push('<ul>'); list = true; } out.push('<li>' + inline(item[1]) + '</li>'); return; }
      out.push('<p>' + inline(t) + '</p>');
    });
    if (list) out.push('</ul>');
    return out.join('');
  }

  // ---------------------------------------------------------------- data
  var DL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var FABRIC = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14 14 4l6 6-10 10zM9 9l6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
  function date(iso) { return new Date(iso + 'T12:00:00Z').toLocaleDateString(IT ? 'it-IT' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  function ago(iso) {
    var days = Math.round((Date.now() - new Date(iso + 'T12:00:00Z').getTime()) / 86400000);
    if (IT) {
      if (days < 1) return 'oggi';
      if (days < 2) return 'ieri';
      if (days < 7) return days + ' giorni fa';
      if (days < 14) return 'settimana scorsa';
      if (days < 31) return Math.round(days / 7) + ' sett. fa';
      return date(iso);
    }
    if (days < 1) return 'today';
    if (days < 2) return 'yesterday';
    if (days < 7) return days + ' days ago';
    if (days < 14) return 'last wk.';
    if (days < 31) return Math.round(days / 7) + ' wks. ago';
    return date(iso);
  }
  function letter(ch) { return ch === 'release' ? 'R' : ch === 'beta' ? 'B' : 'A'; }

  function render(data) {
    var versions = data.versions || [];
    var link = data.modrinth;
    var dlLink = function (v) {
      return link
        ? '<a class="entry-dl" style="color:var(--mr-green)" href="' + esc(link + '/version/' + v.number) + '" target="_blank" rel="noopener">' + DL + t('Download') + '</a>'
        : '<span class="entry-dl soon" title="' + t('Waiting for Modrinth approval') + '">' + DL + t('Soon on Modrinth') + '</span>';
    };

    document.querySelector('[data-changelog]').innerHTML = versions.map(function (v) {
      return '<li class="entry ' + esc(v.channel) + '">' +
        '<div class="entry-head"><h2>' + esc(v.name) + '<span>' + (IT ? 'il ' : 'on ') + date(v.published) + '</span></h2>' + dlLink(v) + '</div>' +
        '<div class="entry-body">' + markdown((IT && v.changelog_it) || v.changelog || '') + '</div></li>';
    }).join('');

    document.querySelector('[data-versions]').innerHTML = versions.map(function (v) {
      return '<tr>' +
        '<td><span class="badge ' + esc(v.channel) + '" title="' + esc(v.channel) + '">' + letter(v.channel) + '</span></td>' +
        '<td class="vname">' + esc(v.number) + '</td>' +
        '<td>' + v.minecraft.map(function (m) { return '<span class="pill">' + esc(m) + '</span>'; }).join(' ') + '</td>' +
        '<td>' + v.loaders.map(function (l) { return '<span class="pill ' + esc(l.toLowerCase()) + '">' + (l === 'Fabric' ? FABRIC : '') + esc(l) + '</span>'; }).join(' ') + '</td>' +
        '<td title="' + date(v.published) + '">' + ago(v.published) + '</td>' +
        '<td>' + (v.downloads || 0).toLocaleString('en') + '</td>' +
        '</tr>';
    }).join('');

    // The big button: orange "Download soon" until the project is live, then a green link.
    var btn = document.querySelector('[data-download]');
    if (btn && link) {
      var a = document.createElement('a');
      a.className = 'mr-btn live'; a.href = link; a.target = '_blank'; a.rel = 'noopener';
      a.innerHTML = btn.innerHTML;
      a.querySelector('[data-download-kicker]').textContent = t('Download on');
      btn.replaceWith(a);
    }
    var dates = versions.map(function (v) { return v.published; }).sort();
    if (dates.length) {
      document.querySelector('[data-first-published]').textContent = date(dates[0]);
      document.querySelector('[data-last-updated]').textContent = date(dates[dates.length - 1]);
    }
    if (data.status) document.querySelector('[data-status]').textContent = t(data.status);
  }

  fetch('data/mods/' + slug + '.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(render)
    .catch(function () {
      document.querySelector('[data-changelog]').innerHTML = '<li class="entry"><p class="entry-body">' + t('The changelog could not be loaded. Try again in a moment.') + '</p></li>';
    });
})();
