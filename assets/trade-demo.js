/* BetterTrades, playable in the browser.
   A faithful copy of the mod's trade screen: the mod's own GUI textures, the same slot grid
   (vanilla GENERIC_9X6: slot c,r at x = 8 + 18c, y = 30 + 18r on the texture), the same
   buttons and the same rules. Items, heads and text use Minecraft's and Cobblemon's own
   textures, and the text is drawn with Minecraft's bitmap font. The other player is simulated. */
(function () {
  var root = document.getElementById('trade-demo');
  if (!root) return;

  var TEX = 'assets/mods/bettertrades-gui/';
  var MC = TEX + 'minecraft/', CB = TEX + 'cobblemon/';
  var GUI_W = 176, GUI_H = 234, PANEL_W = 79, GAP = 6;
  var MAX_OFFER = 8;
  var COUNTDOWN_MS = 3000, CANCEL_FRAMES = 8;
  var THEM = 'Alex';

  var ICON = {
    diamond: MC + 'diamond.png', emerald: MC + 'emerald.png', gold: MC + 'gold_ingot.png', iron: MC + 'iron_ingot.png',
    apple: MC + 'apple.png', pearl: MC + 'ender_pearl.png', book: MC + 'book.png', bread: MC + 'bread.png',
    candy: CB + 'rare_candy.png', expcandy: CB + 'exp_candy_m.png',
    poke: CB + 'poke_ball.png', great: CB + 'great_ball.png', ultra: CB + 'ultra_ball.png', premier: CB + 'premier_ball.png', master: CB + 'master_ball.png',
    headYou: MC + 'head_you.png', headThem: MC + 'head_them.png'
  };
  var ITEMS = {
    diamond: { name: 'Diamond', icon: 'diamond', color: 'b' },
    emerald: { name: 'Emerald', icon: 'emerald', color: 'a' },
    gold: { name: 'Gold Ingot', icon: 'gold', color: 'f' },
    iron: { name: 'Iron Ingot', icon: 'iron', color: 'f' },
    apple: { name: 'Apple', icon: 'apple', color: 'f' },
    pearl: { name: 'Ender Pearl', icon: 'pearl', color: 'f' },
    candy: { name: 'Rare Candy', icon: 'candy', color: 'd' },
    expcandy: { name: 'Exp. Candy M', icon: 'expcandy', color: 'f' },
    book: { name: 'Book', icon: 'book', color: 'f' },
    bread: { name: 'Bread', icon: 'bread', color: 'f' }
  };
  function mon(name, lv, ball, opts) { opts = opts || {}; return { name: name, lv: lv, ball: ball, shiny: !!opts.shiny, tradeable: opts.tradeable !== false, id: name + lv + Math.random().toString(36).slice(2, 6) }; }

  // ------------------------------------------------------------------ Minecraft's bitmap font
  // ascii.png is a 16x16 grid of 8x8 glyphs. Each glyph is as wide as its rightmost opaque
  // column, plus one pixel of spacing; a space is 4. Shadows are the text colour at a quarter.
  var CODES = { '0': '#000000', '1': '#0000AA', '2': '#00AA00', '3': '#00AAAA', '4': '#AA0000', '5': '#AA00AA', '6': '#FFAA00', '7': '#AAAAAA', '8': '#555555', '9': '#5555FF', a: '#55FF55', b: '#55FFFF', c: '#FF5555', d: '#FF55FF', e: '#FFFF55', f: '#FFFFFF' };
  var font = { img: null, adv: [], tinted: {} };
  function loadFont(done) {
    var img = new Image();
    img.onload = function () {
      var c = document.createElement('canvas'); c.width = c.height = 128;
      var x = c.getContext('2d'); x.drawImage(img, 0, 0);
      var d = null;
      try { d = x.getImageData(0, 0, 128, 128).data; } catch (e) { /* opened from disk: fall back to 5px glyphs */ }
      for (var ch = 0; ch < 256; ch++) {
        if (!d) { font.adv[ch] = ch === 32 ? 4 : 6; continue; }
        var gx = (ch % 16) * 8, gy = Math.floor(ch / 16) * 8, w = 0;
        for (var col = 7; col >= 0 && !w; col--) for (var row = 0; row < 8; row++) if (d[((gy + row) * 128 + gx + col) * 4 + 3] > 0) { w = col + 1; break; }
        font.adv[ch] = ch === 32 ? 4 : w + 1;
      }
      font.img = c; done();
    };
    img.src = MC + 'ascii.png';
  }
  function tinted(color) {
    if (font.tinted[color]) return font.tinted[color];
    var c = document.createElement('canvas'); c.width = c.height = 128;
    var x = c.getContext('2d');
    x.drawImage(font.img, 0, 0);
    x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, 128, 128);
    return (font.tinted[color] = c);
  }
  function shade(hex) {
    var n = parseInt(hex.slice(1), 16);
    return '#' + [n >> 16 & 255, n >> 8 & 255, n & 255].map(function (v) { return ('0' + (v >> 2).toString(16)).slice(-2); }).join('');
  }
  function runs(str, base) {
    var out = [], color = base || '#FFFFFF', parts = String(str).split(/&([0-9a-fr])/);
    for (var k = 0; k < parts.length; k++) {
      if (k % 2) { color = parts[k] === 'r' ? (base || '#FFFFFF') : CODES[parts[k]]; continue; }
      if (parts[k]) out.push({ t: parts[k], c: color });
    }
    return out;
  }
  function code(ch) { var c = ch.charCodeAt(0); return c < 256 ? c : 63; }
  function width(str) {
    var w = 0; runs(str).forEach(function (r) { for (var i = 0; i < r.t.length; i++) w += font.adv[code(r.t[i])]; });
    return Math.max(0, w - 1);
  }
  function drawText(ctx, str, x, y, opts) {
    opts = opts || {};
    var shadow = opts.shadow !== false;
    runs(str, opts.color).forEach(function (r) {
      for (var i = 0; i < r.t.length; i++) {
        var ch = code(r.t[i]);
        if (ch !== 32) {
          var sx = (ch % 16) * 8, sy = Math.floor(ch / 16) * 8;
          if (shadow) ctx.drawImage(tinted(shade(r.c)), sx, sy, 8, 8, x + 1, y + 1, 8, 8);
          ctx.drawImage(tinted(r.c), sx, sy, 8, 8, x, y, 8, 8);
        }
        x += font.adv[ch];
      }
    });
  }
  // A line of text as an element placed in texture pixels.
  function textCanvas(str, opts) {
    var c = document.createElement('canvas');
    c.width = Math.max(1, width(str) + 2); c.height = 9;
    drawText(c.getContext('2d'), str, 0, 0, opts);
    c.className = 'mc-px';
    c.style.width = 'calc(var(--s) * ' + c.width + 'px)'; c.style.height = 'calc(var(--s) * ' + c.height + 'px)';
    return c;
  }
  function strip(s) { return String(s).replace(/&[0-9a-fr]/g, ''); }

  // ------------------------------------------------------------------ state
  var S;
  function fresh() {
    var inv = new Array(36).fill(null);
    var start = [['diamond', 12], ['emerald', 30], ['gold', 21], ['iron', 64], ['apple', 9], ['pearl', 16], ['candy', 4], ['book', 3], ['bread', 48], ['expcandy', 6]];
    start.forEach(function (s, i) { inv[i < 4 ? 27 + i : i - 4] = { id: s[0], count: s[1] }; });
    return {
      screen: 'trade', stage: 'offering', lockAt: 0, version: 0,
      inv: inv, balance: 1250,
      mine: { entries: [], money: 0, ready: false },
      theirs: { entries: [{ mon: mon('Charmander', 14, 'poke') }, { item: { id: 'candy', count: 3 } }, { item: { id: 'gold', count: 8 } }], money: 0, ready: false },
      party: [mon('Pikachu', 25, 'poke'), mon('Eevee', 18, 'great', { shiny: true }), mon('Bulbasaur', 12, 'poke'), mon('Gengar', 41, 'ultra', { tradeable: false }), null, null],
      boxes: [
        [mon('Magikarp', 8, 'poke'), mon('Zubat', 11, 'poke'), mon('Psyduck', 16, 'great'), null, mon('Geodude', 13, 'poke'), mon('Abra', 9, 'ultra'), null, null, mon('Ponyta', 22, 'great')].concat(new Array(21).fill(null)),
        [mon('Dratini', 15, 'ultra'), null, mon('Snorlax', 30, 'premier'), null, null, mon('Mewtwo', 70, 'master', { tradeable: false })].concat(new Array(24).fill(null))
      ],
      box: 0, moneyDraft: '', done: null
    };
  }
  S = fresh();

  // ------------------------------------------------------------------ dom
  var stage = root.querySelector('.mc-stage');
  var gui = root.querySelector('.mc-gui');
  var side = root.querySelector('.mc-side');
  var tip = root.querySelector('.mc-tip');
  var log = root.querySelector('.mc-log');
  var input = null;

  function place(e, x, y, w, h) {
    e.style.left = 'calc(var(--s) * ' + x + 'px)'; e.style.top = 'calc(var(--s) * ' + y + 'px)';
    if (w) e.style.width = 'calc(var(--s) * ' + w + 'px)';
    if (h) e.style.height = 'calc(var(--s) * ' + h + 'px)';
    return e;
  }
  function el(tag, cls, x, y, w, h) { var e = document.createElement(tag); if (cls) e.className = cls; return place(e, x, y, w, h); }
  function tex(parent, src, x, y, w, h) {
    var i = el('img', 'mc-px', x, y, w, h); i.src = src; i.alt = ''; i.draggable = false;
    parent.appendChild(i); return i;
  }
  function slotXY(i) { return [8 + 18 * (i % 9), 30 + 18 * Math.floor(i / 9)]; }

  // A clickable 16x16 slot, optionally with an item icon, a count and a tooltip.
  function slot(parent, x, y, opts) {
    var b = el('button', 'mc-slot', x, y, 16, 16);
    b.type = 'button';
    if (opts.icon) { var im = document.createElement('img'); im.src = opts.icon; im.alt = ''; im.draggable = false; b.appendChild(im); }
    if (opts.count > 1) {
      // vanilla: the count ends 1px right of the slot and sits on its bottom edge
      var n = textCanvas(String(opts.count));
      place(n, 17 - width(String(opts.count)), 9); n.classList.add('mc-count');
      b.appendChild(n);
    }
    if (opts.shiny) b.classList.add('shiny');
    b.setAttribute('aria-label', strip(opts.tip ? opts.tip[0] : 'Empty slot'));
    if (opts.tip) b._tip = opts.tip;
    if (opts.onClick) {
      b.addEventListener('click', function (e) { opts.onClick(e.shiftKey ? 'shift' : 'left'); });
      b.addEventListener('contextmenu', function (e) { e.preventDefault(); opts.onClick('right'); });
    } else b.disabled = !opts.tip;
    parent.appendChild(b);
    return b;
  }
  // Buttons are items whose art sits on a 32 or 64px canvas centred on the slot, as in the mod.
  function button(parent, i, art, canvas, tipLines, onClick, at) {
    var p = at || slotXY(i);
    var off = (canvas - 16) / 2;
    tex(parent, TEX + art + '.png', p[0] - off, p[1] - off, canvas, canvas);
    return slot(parent, p[0], p[1], { tip: tipLines, onClick: onClick });
  }
  function text(parent, x, y, str, align) {
    var c = textCanvas(str);
    var w = width(str);
    place(c, align === 'right' ? x - w : align === 'center' ? x - Math.floor(w / 2) : x, y);
    parent.appendChild(c); return c;
  }

  // The status line under the screen uses the page's own type, with the same colour codes.
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var LOG_COLORS = { a: '#7EE787', b: '#6ABCAE', c: '#FF7B72', d: '#D2A8FF', e: '#DFB35D', f: '#E6F2EF', '6': '#DFB35D', '7': '#9DB8B3', '8': '#6E8580' };
  function say(msg) {
    var out = '', color = null, parts = String(msg).split(/&([0-9a-fr])/);
    for (var k = 0; k < parts.length; k++) {
      if (k % 2) { color = LOG_COLORS[parts[k]] || null; continue; }
      if (parts[k]) out += color ? '<span style="color:' + color + '">' + esc(parts[k]) + '</span>' : esc(parts[k]);
    }
    log.innerHTML = out;
  }

  // ------------------------------------------------------------------ rules
  function changed() {
    // "Any change to an offer clears this."
    S.mine.ready = false; S.theirs.ready = false; S.version++;
  }
  function itemTip(st, extra) {
    var it = ITEMS[st.id];
    return ['&' + it.color + it.name + (st.count > 1 ? ' &7x' + st.count : '')].concat(extra || []);
  }
  function monTip(m, extra) {
    var l = [(m.shiny ? '&6' : '&f') + m.name + ' &7Lv.' + m.lv];
    if (m.shiny) l.push('&6Shiny');
    if (!m.tradeable) l.push('&cCannot be traded');
    return l.concat(extra || []);
  }
  function offeredIds() { return S.mine.entries.filter(function (e) { return e.mon; }).map(function (e) { return e.mon.id; }); }

  function offerFromInventory(index, how) {
    if (S.stage !== 'offering') return;
    var st = S.inv[index]; if (!st) return;
    if (S.mine.entries.length >= MAX_OFFER) { say('&cYour offer is full: eight slots per side.'); return; }
    var n = how === 'right' ? 1 : how === 'shift' ? Math.max(1, Math.floor(st.count / 2)) : st.count;
    st.count -= n; if (st.count <= 0) S.inv[index] = null;
    S.mine.entries.push({ item: { id: st.id, count: n } });
    changed();
    say('&7' + ITEMS[st.id].name + ' ×' + n + ' left your inventory and is held in &bescrow&7.');
    render();
  }
  function giveBack(st) {
    for (var i = 0; i < 36 && st.count > 0; i++) {
      var s = S.inv[i];
      if (s && s.id === st.id && s.count < 64) { var m = Math.min(64 - s.count, st.count); s.count += m; st.count -= m; }
    }
    var order = [27, 28, 29, 30, 31, 32, 33, 34, 35]; for (var k = 0; k < 27; k++) order.push(k);
    for (var o = 0; o < order.length && st.count > 0; o++) {
      if (!S.inv[order[o]]) { S.inv[order[o]] = { id: st.id, count: Math.min(64, st.count) }; st.count -= S.inv[order[o]].count; }
    }
  }
  function takeBack(index) {
    if (S.stage !== 'offering') return;
    var e = S.mine.entries[index]; if (!e) return;
    S.mine.entries.splice(index, 1);
    if (e.item) giveBack({ id: e.item.id, count: e.item.count });
    changed();
    say('&7Taken back: ' + (e.item ? ITEMS[e.item.id].name : e.mon.name) + '.');
    render();
  }
  function trash() {
    if (S.stage !== 'offering') return;
    if (!S.mine.entries.length && !S.mine.money) { say('&7Your offer is already empty.'); return; }
    S.mine.entries.forEach(function (e) { if (e.item) giveBack({ id: e.item.id, count: e.item.count }); });
    S.mine.entries = []; S.mine.money = 0;
    changed();
    say('&7Everything came back from escrow. Both confirmations were cleared.');
    render();
  }
  function confirm() {
    if (S.stage === 'locked') { cancelCountdown(); return; }
    S.mine.ready = !S.mine.ready;
    if (!S.mine.ready) { S.theirs.ready = false; S.version++; say('&7You took your confirmation back.'); render(); return; }
    say('&aYou confirmed.&7 Waiting for ' + THEM + '...');
    render();
    var v = S.version;
    setTimeout(function () {
      if (v !== S.version || !S.mine.ready || S.stage !== 'offering' || S.screen === 'done') return;
      if (!S.mine.entries.length && !S.mine.money) { say('&b' + THEM + '&7: "You haven\'t offered anything yet."'); return; }
      S.theirs.ready = true;
      say('&b' + THEM + '&a confirmed.&7 Three seconds to change your mind.');
      lock();
    }, 1100);
  }
  function lock() {
    S.stage = 'locked'; S.lockAt = performance.now(); S.screen = 'trade';
    render();
    tick();
  }
  function frameNow() { return Math.min(CANCEL_FRAMES - 1, Math.floor((performance.now() - S.lockAt) / COUNTDOWN_MS * CANCEL_FRAMES)); }
  var lastFrame = -1;
  function tick() {
    if (S.stage !== 'locked') return;
    if (performance.now() - S.lockAt >= COUNTDOWN_MS) { commit(); return; }
    var f = frameNow();
    if (f !== lastFrame) { lastFrame = f; render(); }
    requestAnimationFrame(tick);
  }
  function cancelCountdown() {
    S.stage = 'offering'; changed(); lastFrame = -1;
    say('&cTrade stopped.&7 Nothing moved: offers are still in escrow.');
    render();
  }
  function commit() {
    var gave = S.mine.entries.slice(), got = S.theirs.entries.slice();
    var gaveMoney = S.mine.money, gotMoney = S.theirs.money;
    var ids = offeredIds();
    S.party = S.party.map(function (m) { return m && ids.indexOf(m.id) >= 0 ? null : m; });
    S.boxes = S.boxes.map(function (b) { return b.map(function (m) { return m && ids.indexOf(m.id) >= 0 ? null : m; }); });
    got.forEach(function (e) {
      if (e.item) giveBack({ id: e.item.id, count: e.item.count });
      if (e.mon) {
        var p = S.party.indexOf(null);
        if (p >= 0) S.party[p] = e.mon; else { var b = S.boxes[0].indexOf(null); if (b >= 0) S.boxes[0][b] = e.mon; }
      }
    });
    S.balance += gotMoney - gaveMoney;
    S.done = { gave: gave, got: got, gaveMoney: gaveMoney, gotMoney: gotMoney };
    S.mine = { entries: [], money: 0, ready: false };
    S.theirs = { entries: [], money: 0, ready: false };
    S.stage = 'offering'; S.screen = 'done'; lastFrame = -1;
    say('&aTrade complete.&7 Saved to the history: &f/bt history&7.');
    render();
  }
  function again() {
    var offers = [
      [{ mon: mon('Squirtle', 16, 'great') }, { item: { id: 'emerald', count: 12 } }],
      [{ item: { id: 'diamond', count: 5 } }, { item: { id: 'pearl', count: 8 } }],
      [{ mon: mon('Lapras', 28, 'ultra') }, { item: { id: 'expcandy', count: 10 } }]
    ];
    var o = offers[Math.floor(Math.random() * offers.length)];
    S.theirs = { entries: o, money: Math.random() < 0.5 ? 150 : 0, ready: false };
    S.done = null; S.screen = 'trade'; changed();
    say('&b' + THEM + '&7 opened a new trade.');
    render();
  }
  function reset() {
    S = fresh(); lastFrame = -1;
    say('&7Trade reset: inventory, party, money and both offers are back to the start.');
    render();
  }

  // ------------------------------------------------------------------ screens
  function render() {
    hideTip();
    gui.innerHTML = ''; side.innerHTML = ''; input = null;
    if (S.screen === 'picker') renderPicker();
    else if (S.screen === 'money') renderMoney();
    else renderTrade();
    root.dataset.screen = S.screen;
  }

  function renderInventory(rowY, hotY) {
    for (var i = 0; i < 36; i++) {
      var x = 8 + 18 * (i % 9), y = i < 27 ? rowY + 18 * Math.floor(i / 9) : hotY;
      (function (index) {
        var st = S.inv[index];
        slot(gui, x, y, st ? {
          icon: ICON[ITEMS[st.id].icon], count: st.count,
          tip: itemTip(st, S.screen === 'trade' && S.stage === 'offering' ? ['&7Click: offer the stack', '&7Right click: offer one', '&7Shift click: offer half'] : []),
          onClick: S.screen === 'trade' ? function (how) { offerFromInventory(index, how); } : null
        } : {});
      })(i);
    }
  }

  function renderTrade() {
    tex(gui, TEX + 'background.png', 0, 0, GUI_W, GUI_H);
    tex(gui, TEX + (S.mine.ready ? 'head_frame_ready' : 'head_frame_idle') + '.png', 22, 26, 24, 24);
    tex(gui, TEX + (S.theirs.ready ? 'head_frame_ready' : 'head_frame_idle') + '.png', 130, 26, 24, 24);
    slot(gui, 26, 30, { icon: ICON.headYou, tip: ['&aYou', S.mine.ready ? '&aConfirmed' : '&7Has not confirmed yet'] });
    slot(gui, 134, 30, { icon: ICON.headThem, tip: ['&b' + THEM, S.theirs.ready ? '&aConfirmed' : '&7Has not confirmed yet'] });
    // The mod writes the names on the line 36px below the title, which sits at y = 18.
    text(gui, 7, 54, '&fYou');
    text(gui, 169, 54, '&fThem', 'right');

    var mySlots = [18, 19, 20, 21, 27, 28, 29, 30], theirSlots = [23, 24, 25, 26, 32, 33, 34, 35];
    mySlots.forEach(function (sl, k) {
      var e = S.mine.entries[k], p = slotXY(sl);
      if (!e) { slot(gui, p[0], p[1], {}); return; }
      var lore = S.stage === 'offering' ? ['&7Click to take it back.'] : [];
      slot(gui, p[0], p[1], e.item
        ? { icon: ICON[ITEMS[e.item.id].icon], count: e.item.count, tip: itemTip(e.item, lore), onClick: function () { takeBack(k); } }
        : { icon: ICON[e.mon.ball], shiny: e.mon.shiny, tip: monTip(e.mon, lore), onClick: function () { takeBack(k); } });
    });
    theirSlots.forEach(function (sl, k) {
      var e = S.theirs.entries[k], p = slotXY(sl);
      if (!e) { slot(gui, p[0], p[1], {}); return; }
      slot(gui, p[0], p[1], e.item
        ? { icon: ICON[ITEMS[e.item.id].icon], count: e.item.count, tip: itemTip(e.item) }
        : { icon: ICON[e.mon.ball], shiny: e.mon.shiny, tip: monTip(e.mon) });
    });

    // Confirm, or the fading Cancel during the countdown. The art spans slots 3..5.
    if (S.stage === 'locked') {
      button(gui, 4, 'btn_cancel_' + (frameNow() + 1), 64, ['&fCancel', '&7The trade goes through in a moment.', '&7Click to stop it while you still can.'], cancelCountdown);
    } else {
      button(gui, 4, S.mine.ready ? 'btn_confirm_done' : 'btn_confirm', 64,
        [S.mine.ready ? '&fConfirmed' : '&fConfirm', '&7When you both confirm, a three second', '&7window opens before the trade happens.', '&7Any change to an offer clears this.'], confirm);
    }
    [3, 5].forEach(function (i) { var p = slotXY(i); var b = slot(gui, p[0], p[1], { onClick: function () { (S.stage === 'locked' ? cancelCountdown : confirm)(); } }); b.setAttribute('aria-label', S.stage === 'locked' ? 'Cancel' : 'Confirm'); b.tabIndex = -1; });

    button(gui, 47, 'btn_trash', 32, ['&cEmpty your offer', '&7Takes back everything you offered,', '&7money included, and clears both', '&7confirmations.'], trash);
    var pb = slotXY(49);
    slot(gui, pb[0], pb[1], { icon: ICON.poke, tip: ['&dAdd a Pokemon', '&7Opens your party and your PC boxes.'], onClick: function () { if (S.stage !== 'offering') return; S.screen = 'picker'; render(); } });
    button(gui, 51, 'btn_money', 32, ['&6Add money', '&fYour offer: ' + S.mine.money, '&b' + THEM + ': ' + S.theirs.money, '&7Money stays yours until the trade happens.'], function () {
      if (S.stage !== 'offering') return; S.moneyDraft = String(S.mine.money || ''); S.screen = 'money'; render();
    });

    renderInventory(152, 210);
    renderSide();

    if (S.screen === 'done') renderDone();
  }

  function renderSide() {
    var w = el('div', 'mc-panel', 0, 0, PANEL_W, 102);
    side.appendChild(w);
    tex(w, TEX + 'money_panel.png', 0, 0, PANEL_W, 102);
    text(w, 40, 4, '&8Money', 'center');
    text(w, 7, 40, '&fYou: &e' + S.mine.money.toLocaleString('en'));
    text(w, 7, 77, '&f' + THEM + ': &e' + S.theirs.money.toLocaleString('en'));
    text(w, 2, 106, '&7Balance: &f' + S.balance.toLocaleString('en'));
  }

  function renderDone() {
    var d = S.done;
    var o = el('div', 'mc-overlay', 0, 0, GUI_W, GUI_H);
    var lines = ['&aTrade complete', '', '&7You gave:'];
    d.gave.forEach(function (e) { lines.push('&f' + (e.item ? ITEMS[e.item.id].name + ' x' + e.item.count : e.mon.name + ' Lv.' + e.mon.lv)); });
    if (d.gaveMoney) lines.push('&e' + d.gaveMoney + ' money');
    lines.push('', '&7You got:');
    d.got.forEach(function (e) { lines.push('&f' + (e.item ? ITEMS[e.item.id].name + ' x' + e.item.count : e.mon.name + ' Lv.' + e.mon.lv)); });
    if (d.gotMoney) lines.push('&e' + d.gotMoney + ' money');
    var top = Math.max(10, Math.floor((GUI_H - (lines.length * 10 + 30)) / 2));
    lines.forEach(function (l, i) { if (l) text(o, GUI_W / 2, top + i * 10, l, 'center'); });
    var by = top + lines.length * 10 + 8;
    var b = el('button', 'mc-again', 48, by, 80, 20); b.type = 'button';
    b.appendChild(place(textCanvas('Trade again'), 40 - Math.floor(width('Trade again') / 2), 6));
    b.setAttribute('aria-label', 'Trade again');
    b.addEventListener('click', again);
    o.appendChild(b);
    gui.appendChild(o);
  }

  function renderPicker() {
    tex(gui, TEX + 'picker_background.png', 0, 0, GUI_W, GUI_H);
    var ids = offeredIds();
    for (var i = 0; i < 6; i++) pickSlot(i, S.party[i], 'Party', ids);
    var box = S.boxes[S.box];
    for (var k = 0; k < 30; k++) pickSlot(9 + k, box[k], 'Box ' + (S.box + 1), ids);
    button(gui, 45, 'btn_box_previous', 32, ['&ePrevious box'], function () { S.box = (S.box + S.boxes.length - 1) % S.boxes.length; render(); });
    button(gui, 53, 'btn_box_next', 32, ['&eNext box'], function () { S.box = (S.box + 1) % S.boxes.length; render(); });
    button(gui, 48, 'btn_picker_back', 32, ['&cBack to the trade'], function () { S.screen = 'trade'; render(); });
    var lp = slotXY(49); slot(gui, lp[0], lp[1], { tip: ['&fBox ' + (S.box + 1) + ' of ' + S.boxes.length] });
    renderInventory(152, 210);
  }
  function pickSlot(i, m, where, ids) {
    var p = slotXY(i);
    if (!m) { slot(gui, p[0], p[1], { tip: [i < 6 ? '&8Party: empty slot' : '&8Empty'] }); return; }
    var offered = ids.indexOf(m.id) >= 0;
    var b = slot(gui, p[0], p[1], {
      icon: ICON[m.ball], shiny: m.shiny,
      tip: monTip(m, ['&8' + where].concat(offered ? ['&7Already in your offer'] : [])),
      onClick: function () {
        if (offered) return;
        if (!m.tradeable) { say('&c' + m.name + ' cannot be traded.'); return; }
        if (S.mine.entries.length >= MAX_OFFER) { say('&cYour offer is full: eight slots per side.'); return; }
        S.mine.entries.push({ mon: m }); changed(); S.screen = 'trade';
        say('&7' + m.name + ' was fingerprinted. It stays in your ' + (where === 'Party' ? 'party' : 'PC') + ' until the trade happens.');
        render();
      }
    });
    if (offered) b.classList.add('dim');
  }

  function renderMoney() {
    tex(gui, TEX + 'money_input.png', 0, 0, GUI_W, 174);
    // The typed amount is drawn with the bitmap font, like the anvil's own field;
    // a transparent input on top takes the keys and brings up the number pad on phones.
    var shown = el('div', 'mc-field', 62, 31, 104, 9);
    gui.appendChild(shown);
    var field = el('input', 'mc-input', 60, 27, 108, 16);
    field.type = 'text'; field.inputMode = 'numeric'; field.maxLength = 9; field.value = S.moneyDraft;
    field.setAttribute('aria-label', 'Amount of money to offer');
    field.autocomplete = 'off';
    gui.appendChild(field); input = field;
    var conf = button(gui, -1, 'btn_money_confirm', 32, [], submit, [133, 54]);
    button(gui, -1, 'btn_money_back', 32, ['&cBack to the trade'], function () { S.screen = 'trade'; render(); }, [75, 54]);
    var blink = 0;
    function draw() {
      shown.innerHTML = '';
      var focused = document.activeElement === field;
      var str = (S.moneyDraft || '') + (focused && blink % 2 === 0 ? '_' : '');
      if (!S.moneyDraft && !focused) str = '&80';
      if (str) shown.appendChild(place(textCanvas(str.indexOf('&') === 0 ? str : '&f' + str), 0, 0));
      var a = parseInt(S.moneyDraft || '0', 10);
      conf._tip = ['&aOffer ' + a, '&7Click to confirm the amount.', '&7Whole numbers only. 0 removes the offer.', '&7Balance: ' + S.balance];
    }
    var timer = setInterval(function () { if (!document.body.contains(field)) { clearInterval(timer); return; } blink++; draw(); }, 400);
    field.addEventListener('input', function () { field.value = field.value.replace(/[^0-9]/g, ''); S.moneyDraft = field.value; blink = 0; draw(); });
    field.addEventListener('focus', draw); field.addEventListener('blur', draw);
    field.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { S.screen = 'trade'; render(); } });
    function submit() {
      var a = parseInt(S.moneyDraft || '0', 10);
      if (isNaN(a) || a < 0) { say('&cThat is not a whole number.'); return; }
      if (a > S.balance) { say('&cYou only have ' + S.balance + '.'); return; }
      if (a !== S.mine.money) { S.mine.money = a; changed(); }
      say(a ? '&7You offer &e' + a + '&7. Only the difference moves, in one atomic transfer.' : '&7Money offer removed.');
      S.screen = 'trade'; render();
    }
    draw();
    renderInventory(92, 150);
    setTimeout(function () { if (input) input.focus({ preventScroll: true }); }, 0);
  }

  // ------------------------------------------------------------------ tooltip
  // Drawn like vanilla: dark purple fill, a two-tone border, title line set 2px apart.
  function tooltipCanvas(lines) {
    var w = 0; lines.forEach(function (l) { w = Math.max(w, width(l)); });
    var h = lines.length * 10 + (lines.length > 1 ? 2 : 0) - 2;
    var c = document.createElement('canvas'); c.width = w + 8; c.height = h + 8;
    var x = c.getContext('2d');
    x.fillStyle = 'rgba(16,0,16,.94)';
    x.fillRect(1, 0, w + 6, h + 8); x.fillRect(0, 1, w + 8, h + 6);
    var g = x.createLinearGradient(0, 1, 0, h + 7); g.addColorStop(0, 'rgba(80,0,255,.5)'); g.addColorStop(1, 'rgba(40,0,127,.5)');
    x.fillStyle = g;
    x.fillRect(1, 1, w + 6, 1); x.fillRect(1, h + 6, w + 6, 1); x.fillRect(1, 1, 1, h + 6); x.fillRect(w + 6, 1, 1, h + 6);
    var y = 4;
    lines.forEach(function (l, i) { if (l) drawText(x, l, 4, y); y += 10 + (i === 0 && lines.length > 1 ? 2 : 0); });
    c.className = 'mc-px';
    return c;
  }
  function showTip(b, e) {
    if (!b || !b._tip || !b._tip.length) { hideTip(); return; }
    tip.innerHTML = '';
    var c = tooltipCanvas(b._tip);
    var s = parseInt(getComputedStyle(stage).getPropertyValue('--s'), 10) || 2;
    var ts = Math.max(1, s - 1);
    c.style.width = c.width * ts + 'px'; c.style.height = c.height * ts + 'px';
    tip.appendChild(c);
    tip.hidden = false;
    var r = stage.getBoundingClientRect();
    var x = e.clientX - r.left + 12, y = e.clientY - r.top - 12;
    var tw = c.width * ts, th = c.height * ts;
    if (x + tw > r.width) x = e.clientX - r.left - tw - 12;
    if (x < 0) x = 0;
    if (y + th > r.height) y = r.height - th;
    tip.style.left = x + 'px'; tip.style.top = Math.max(0, y) + 'px';
  }
  function hideTip() { tip.hidden = true; }
  stage.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    showTip(e.target.closest('.mc-slot'), e);
  });
  stage.addEventListener('pointerleave', hideTip);

  var resetBtn = root.querySelector('[data-trade-reset]');
  if (resetBtn) resetBtn.addEventListener('click', reset);

  // ------------------------------------------------------------------ scale
  // Integer scale only, like Minecraft's GUI scale, so every texture pixel stays square.
  function fit() {
    var w = root.querySelector('.mc-fit').clientWidth;
    var both = Math.floor(w / (GUI_W + GAP + PANEL_W));
    var s = both >= 2 ? Math.min(4, both) : Math.min(4, Math.floor(w / GUI_W));
    // On narrow phones whole-number scales jump from 2 straight to 1, so fill the width instead.
    if (s < 2) s = Math.max(1, Math.floor(w / GUI_W * 100) / 100);
    stage.style.setProperty('--s', s);
    stage.classList.toggle('stacked', both < 2);
  }
  window.addEventListener('resize', fit);
  fit();
  loadFont(function () {
    render();
    say('&7Click an item in your inventory to offer it. &b' + THEM + '&7 has already made an offer.');
  });
})();
