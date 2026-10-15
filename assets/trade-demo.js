/* BetterTrades, playable in the browser.
   A faithful copy of the mod's trade screen: the same textures, the same slot grid
   (vanilla GENERIC_9X6: slot c,r at x = 8 + 18c, y = 30 + 18r on the texture), the same
   buttons and the same rules. The other player is simulated. */
(function () {
  var root = document.getElementById('trade-demo');
  if (!root) return;

  var TEX = 'assets/mods/bettertrades-gui/';
  var GUI_W = 176, GUI_H = 234, PANEL_W = 79, GAP = 6;
  var MAX_OFFER = 8;
  var COUNTDOWN_MS = 3000, CANCEL_FRAMES = 8;
  var THEM = 'Mira';

  // ------------------------------------------------------------------ pixel art
  // Our own 16x16 icons: shapes are masks, shaded from the top left, with a dark outline.
  function icon(mask, base, light, dark, line, extra) {
    var c = document.createElement('canvas'); c.width = c.height = 16;
    var x = c.getContext('2d');
    var m = [];
    for (var j = 0; j < 16; j++) for (var i = 0; i < 16; i++) m[j * 16 + i] = mask(i, j);
    function inside(i, j) { return i >= 0 && j >= 0 && i < 16 && j < 16 && m[j * 16 + i]; }
    for (var j2 = 0; j2 < 16; j2++) for (var i2 = 0; i2 < 16; i2++) {
      if (!inside(i2, j2)) continue;
      var edge = !inside(i2 - 1, j2) || !inside(i2 + 1, j2) || !inside(i2, j2 - 1) || !inside(i2, j2 + 1);
      var col = edge ? line : (i2 + j2 < 13 ? light : (i2 + j2 > 18 ? dark : base));
      if (typeof base === 'function') col = edge ? line : base(i2, j2);
      x.fillStyle = col; x.fillRect(i2, j2, 1, 1);
    }
    if (extra) extra(x);
    return c.toDataURL();
  }
  function px(x, col, pts) { x.fillStyle = col; for (var k = 0; k < pts.length; k += 2) x.fillRect(pts[k], pts[k + 1], 1, 1); }
  function ball(top, band) {
    return icon(function (i, j) { var dx = i - 7.5, dy = j - 7.5; return dx * dx + dy * dy <= 42; },
      function (i, j) {
        if (j === 7 || j === 8) return '#2b2b33';
        if (j < 7) return (i + j < 8) ? '#ffffff' : top;
        return (i + j > 20) ? '#c9ccd6' : '#f4f5f8';
      }, null, null, '#1d1d24', function (x) {
        if (band) px(x, band, [4, 4, 11, 4]);
        x.fillStyle = '#1d1d24'; x.fillRect(6, 6, 4, 4);
        x.fillStyle = '#f4f5f8'; x.fillRect(7, 7, 2, 2);
      });
  }
  function face(skin, hair, eyes, shirt) {
    var c = document.createElement('canvas'); c.width = c.height = 16;
    var x = c.getContext('2d');
    x.fillStyle = skin; x.fillRect(0, 0, 16, 16);
    x.fillStyle = hair; x.fillRect(0, 0, 16, 4); x.fillRect(0, 4, 2, 4); x.fillRect(14, 4, 2, 4);
    x.fillStyle = '#ffffff'; x.fillRect(2, 8, 4, 2); x.fillRect(10, 8, 4, 2);
    x.fillStyle = eyes; x.fillRect(4, 8, 2, 2); x.fillRect(10, 8, 2, 2);
    x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(6, 12, 4, 2);
    x.fillStyle = shirt; x.fillRect(0, 15, 16, 1);
    return c.toDataURL();
  }

  var ICON = {
    diamond: icon(function (i, j) { return Math.abs(i - 7.5) + Math.abs(j - 7.5) * 1.15 <= 7; }, '#4ee0d2', '#c8fff8', '#1b9c95', '#0b4f4b'),
    emerald: icon(function (i, j) { return Math.abs(i - 7.5) * 1.6 + Math.abs(j - 7.5) <= 8 && Math.abs(j - 7.5) < 7; }, '#2ccf5f', '#a6ffbd', '#14843a', '#0a3f1d'),
    gold: icon(function (i, j) { return j >= 5 && j <= 11 && i >= 1 + (11 - j) / 2 && i <= 14 - (11 - j) / 2; }, '#f6c53b', '#fff3a8', '#c58a14', '#6b4508'),
    iron: icon(function (i, j) { return j >= 5 && j <= 11 && i >= 1 + (11 - j) / 2 && i <= 14 - (11 - j) / 2; }, '#d6d9de', '#ffffff', '#8f949c', '#4a4d54'),
    apple: icon(function (i, j) { var dx = i - 7.5, dy = j - 8.5; return dx * dx + dy * dy <= 34; }, '#e0302f', '#ff8c7a', '#99151d', '#4d0a0e', function (x) { px(x, '#5b3a1e', [8, 1, 8, 2, 7, 3]); px(x, '#3fae3a', [9, 1, 10, 1, 10, 2, 11, 2]); }),
    pearl: icon(function (i, j) { var dx = i - 7.5, dy = j - 7.5; return dx * dx + dy * dy <= 30; }, '#1f6d66', '#7fe0cf', '#0e3b38', '#06201e', function (x) { x.fillStyle = '#0a2a27'; x.fillRect(6, 6, 4, 4); }),
    candy: icon(function (i, j) { var dx = i - 7.5, dy = j - 7.5; return (dx * dx + dy * dy <= 20) || (Math.abs(dy) <= 2 && Math.abs(dx) <= 7.5); }, '#9b59d6', '#e0b6ff', '#5c2a8a', '#2c1047', function (x) { px(x, '#ffffff', [6, 6, 7, 6]); }),
    book: icon(function (i, j) { return i >= 2 && i <= 13 && j >= 2 && j <= 14; }, function (i, j) { return i <= 3 ? '#6b3d1e' : (j >= 12 ? '#efe6cf' : '#a0522d'); }, null, null, '#3a1f0e'),
    bread: icon(function (i, j) { var dx = (i - 7.5) / 7, dy = (j - 9) / 4; return dx * dx + dy * dy <= 1; }, '#d39a45', '#f6d08a', '#9b6420', '#4f300c', function (x) { px(x, '#9b6420', [5, 7, 8, 7, 11, 7]); }),
    poke: ball('#e63b3b'), great: ball('#3b6fe6', '#e63b3b'), ultra: ball('#2b2b33', '#f2c230'), premier: ball('#f4f5f8', '#e63b3b'),
    headYou: face('#c68b62', '#3b2a1e', '#2743F4', '#2743F4'),
    headThem: face('#e8b48f', '#b8492f', '#2f8f5b', '#6ABCAE'),
    pokeButton: ball('#e63b3b')
  };

  var ITEMS = {
    diamond: { name: 'Diamond', icon: 'diamond', color: 'b' },
    emerald: { name: 'Emerald', icon: 'emerald', color: 'a' },
    gold: { name: 'Gold Ingot', icon: 'gold', color: 'f' },
    iron: { name: 'Iron Ingot', icon: 'iron', color: 'f' },
    apple: { name: 'Apple', icon: 'apple', color: 'f' },
    pearl: { name: 'Ender Pearl', icon: 'pearl', color: 'f' },
    candy: { name: 'Rare Candy', icon: 'candy', color: 'd' },
    book: { name: 'Book', icon: 'book', color: 'f' },
    bread: { name: 'Bread', icon: 'bread', color: 'f' }
  };
  function mon(name, lv, ball, opts) { opts = opts || {}; return { name: name, lv: lv, ball: ball, shiny: !!opts.shiny, tradeable: opts.tradeable !== false, id: name + lv + Math.random().toString(36).slice(2, 6) }; }

  // ------------------------------------------------------------------ state
  var S;
  function fresh() {
    var inv = new Array(36).fill(null);
    var start = [['diamond', 12], ['emerald', 30], ['gold', 21], ['iron', 64], ['apple', 9], ['pearl', 16], ['candy', 4], ['book', 3], ['bread', 48]];
    start.forEach(function (s, i) { inv[i < 4 ? 27 + i : i - 4] = { id: s[0], count: s[1] }; });
    return {
      screen: 'trade', stage: 'offering', lockAt: 0, version: 0,
      inv: inv, balance: 1250, theirBalance: 4000,
      mine: { entries: [], money: 0, ready: false },
      theirs: { entries: [{ mon: mon('Charmander', 14, 'poke') }, { item: { id: 'candy', count: 3 } }, { item: { id: 'gold', count: 8 } }], money: 0, ready: false },
      party: [mon('Pikachu', 25, 'poke'), mon('Eevee', 18, 'great', { shiny: true }), mon('Bulbasaur', 12, 'poke'), mon('Gengar', 41, 'ultra', { tradeable: false }), null, null],
      boxes: [
        [mon('Magikarp', 8, 'poke'), mon('Zubat', 11, 'poke'), mon('Psyduck', 16, 'great'), null, mon('Geodude', 13, 'poke'), mon('Abra', 9, 'ultra'), null, null, mon('Ponyta', 22, 'great')].concat(new Array(21).fill(null)),
        [mon('Dratini', 15, 'ultra'), null, mon('Snorlax', 30, 'premier')].concat(new Array(27).fill(null))
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

  function el(tag, cls, x, y, w, h) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    e.style.left = 'calc(var(--s) * ' + x + 'px)'; e.style.top = 'calc(var(--s) * ' + y + 'px)';
    if (w) e.style.width = 'calc(var(--s) * ' + w + 'px)';
    if (h) e.style.height = 'calc(var(--s) * ' + h + 'px)';
    return e;
  }
  function tex(parent, name, x, y, w, h) {
    var i = el('img', 'mc-tex', x, y, w, h); i.src = TEX + name + '.png'; i.alt = ''; i.draggable = false;
    parent.appendChild(i); return i;
  }
  function slotXY(i) { return [8 + 18 * (i % 9), 30 + 18 * Math.floor(i / 9)]; }

  // A clickable 16x16 slot, optionally with an item icon, a count and a tooltip.
  function slot(parent, x, y, opts) {
    var b = el('button', 'mc-slot', x, y, 16, 16);
    b.type = 'button';
    if (opts.icon) { var im = document.createElement('img'); im.src = opts.icon; im.alt = ''; im.draggable = false; b.appendChild(im); }
    if (opts.count > 1) { var n = document.createElement('span'); n.className = 'mc-count'; n.textContent = opts.count; b.appendChild(n); }
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
    tex(parent, art, p[0] - off, p[1] - off, canvas, canvas).classList.add('mc-btnart');
    return slot(parent, p[0], p[1], { tip: tipLines, onClick: onClick });
  }
  function text(parent, x, y, str, cls) {
    var t = el('span', 'mc-text ' + (cls || ''), x, y);
    t.innerHTML = fmt(str); parent.appendChild(t); return t;
  }

  // Minecraft colour codes (&a, &7 ...) to spans.
  var CODES = { '0': '#000000', '1': '#0000AA', '2': '#00AA00', '3': '#00AAAA', '4': '#AA0000', '5': '#AA00AA', '6': '#FFAA00', '7': '#AAAAAA', '8': '#555555', '9': '#5555FF', a: '#55FF55', b: '#55FFFF', c: '#FF5555', d: '#FF55FF', e: '#FFFF55', f: '#FFFFFF' };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(s) {
    var out = '', color = null, parts = String(s).split(/&([0-9a-fr])/);
    for (var k = 0; k < parts.length; k++) {
      if (k % 2) { color = parts[k] === 'r' ? null : CODES[parts[k]]; continue; }
      if (parts[k]) out += color ? '<span style="color:' + color + '">' + esc(parts[k]) + '</span>' : esc(parts[k]);
    }
    return out;
  }
  function strip(s) { return String(s).replace(/&[0-9a-fr]/g, ''); }

  // ------------------------------------------------------------------ rules
  function changed() {
    // "Any change to an offer clears this."
    S.mine.ready = false; S.theirs.ready = false; S.version++;
  }
  function say(msg) { log.innerHTML = fmt(msg); }

  function itemTip(st, extra) {
    var it = ITEMS[st.id];
    return ['&' + it.color + it.name + (st.count > 1 ? ' &7×' + st.count : '')].concat(extra || []);
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
      [{ mon: mon('Lapras', 28, 'ultra') }]
    ];
    var o = offers[Math.floor(Math.random() * offers.length)];
    S.theirs = { entries: o, money: Math.random() < 0.5 ? 150 : 0, ready: false };
    S.done = null; S.screen = 'trade'; changed();
    say('&b' + THEM + '&7 opened a new trade.');
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
    tex(gui, 'background', 0, 0, GUI_W, GUI_H);
    tex(gui, S.mine.ready ? 'head_frame_ready' : 'head_frame_idle', 22, 26, 24, 24);
    tex(gui, S.theirs.ready ? 'head_frame_ready' : 'head_frame_idle', 130, 26, 24, 24);
    slot(gui, 26, 30, { icon: ICON.headYou, tip: ['&aYou', S.mine.ready ? '&aConfirmed' : '&7Has not confirmed yet'] });
    slot(gui, 134, 30, { icon: ICON.headThem, tip: ['&b' + THEM, S.theirs.ready ? '&aConfirmed' : '&7Has not confirmed yet'] });
    text(gui, 7, 54, '&fYou');
    var them = text(gui, 0, 54, '&fThem'); them.style.left = 'auto'; them.style.right = 'calc(var(--s) * ' + (GUI_W - 169) + 'px)';

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
    [3, 5].forEach(function (i) { var p = slotXY(i); slot(gui, p[0], p[1], { tip: null, onClick: function () { (S.stage === 'locked' ? cancelCountdown : confirm)(); } }); });

    button(gui, 47, 'btn_trash', 32, ['&cEmpty your offer', '&7Takes back everything you offered,', '&7money included, and clears both', '&7confirmations.'], trash);
    var pb = slotXY(49);
    slot(gui, pb[0], pb[1], { icon: ICON.pokeButton, tip: ['&dAdd a Pokemon', '&7Opens your party and your PC boxes.'], onClick: function () { if (S.stage !== 'offering') return; S.screen = 'picker'; render(); } });
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
    tex(w, 'money_panel', 0, 0, PANEL_W, 102);
    var t = text(w, 0, 3, '&8Money'); t.classList.add('mc-center'); t.style.width = 'calc(var(--s) * ' + PANEL_W + 'px)';
    text(w, 8, 39, '&fYou: &e' + S.mine.money.toLocaleString('en'));
    text(w, 8, 76, '&f' + THEM + ': &e' + S.theirs.money.toLocaleString('en'));
    text(w, 6, 104, '&7Balance: &f' + S.balance.toLocaleString('en'), 'mc-under');
  }

  function renderDone() {
    var d = S.done;
    var o = el('div', 'mc-overlay', 0, 0, GUI_W, GUI_H);
    var lines = ['&aTrade complete', '', '&7You gave:'];
    d.gave.forEach(function (e) { lines.push('&f ' + (e.item ? ITEMS[e.item.id].name + ' ×' + e.item.count : e.mon.name + ' Lv.' + e.mon.lv)); });
    if (d.gaveMoney) lines.push('&e ' + d.gaveMoney + ' money');
    lines.push('', '&7You got:');
    d.got.forEach(function (e) { lines.push('&f ' + (e.item ? ITEMS[e.item.id].name + ' ×' + e.item.count : e.mon.name + ' Lv.' + e.mon.lv)); });
    if (d.gotMoney) lines.push('&e ' + d.gotMoney + ' money');
    o.innerHTML = '<div class="mc-done">' + lines.map(function (l) { return '<p>' + (fmt(l) || '&nbsp;') + '</p>'; }).join('') + '</div>';
    var b = document.createElement('button'); b.type = 'button'; b.className = 'mc-again'; b.textContent = 'Trade again';
    b.addEventListener('click', again);
    o.firstChild.appendChild(b);
    gui.appendChild(o);
  }

  function renderPicker() {
    tex(gui, 'picker_background', 0, 0, GUI_W, GUI_H);
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
    tex(gui, 'money_input', 0, 0, GUI_W, 174);
    var field = el('input', 'mc-input', 61, 29, 106, 13);
    field.type = 'text'; field.inputMode = 'numeric'; field.maxLength = 9; field.value = S.moneyDraft; field.placeholder = '0';
    field.setAttribute('aria-label', 'Amount of money to offer');
    field.addEventListener('input', function () { field.value = field.value.replace(/[^0-9]/g, ''); S.moneyDraft = field.value; updateConfirmTip(); });
    field.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { S.screen = 'trade'; render(); } });
    gui.appendChild(field); input = field;
    var conf = button(gui, -1, 'btn_money_confirm', 32, [], submit, [133, 54]);
    function updateConfirmTip() { var a = parseInt(S.moneyDraft || '0', 10); conf._tip = ['&aOffer ' + a, '&7Click to confirm the amount.', '&7Whole numbers only. 0 removes the offer.', '&7Balance: ' + S.balance]; }
    updateConfirmTip();
    button(gui, -1, 'btn_money_back', 32, ['&cBack to the trade'], function () { S.screen = 'trade'; render(); }, [75, 54]);
    function submit() {
      var a = parseInt(S.moneyDraft || '0', 10);
      if (isNaN(a) || a < 0) { say('&cThat is not a whole number.'); return; }
      if (a > S.balance) { say('&cYou only have ' + S.balance + '.'); return; }
      if (a !== S.mine.money) { S.mine.money = a; changed(); }
      say(a ? '&7You offer &e' + a + '&7. Only the difference moves, in one atomic transfer.' : '&7Money offer removed.');
      S.screen = 'trade'; render();
    }
    renderInventory(92, 150);
    setTimeout(function () { if (input) input.focus({ preventScroll: true }); }, 0);
  }

  // ------------------------------------------------------------------ tooltip
  function showTip(b, e) {
    if (!b || !b._tip || !b._tip.length) { hideTip(); return; }
    tip.innerHTML = b._tip.map(function (l, i) { return '<p' + (i === 0 ? ' class="t"' : '') + '>' + (fmt(l) || '&nbsp;') + '</p>'; }).join('');
    tip.hidden = false;
    var r = stage.getBoundingClientRect();
    var x = e.clientX - r.left + 14, y = e.clientY - r.top - 18;
    var tw = tip.offsetWidth, th = tip.offsetHeight;
    if (x + tw > r.width) x = e.clientX - r.left - tw - 14;
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

  // ------------------------------------------------------------------ scale
  // Integer scale only, like Minecraft's GUI scale, so every texture pixel stays square.
  function fit() {
    var w = root.querySelector('.mc-fit').clientWidth;
    var both = Math.floor(w / (GUI_W + GAP + PANEL_W));
    var s = both >= 2 ? Math.min(4, both) : Math.max(1, Math.min(4, Math.floor(w / GUI_W)));
    stage.style.setProperty('--s', s);
    stage.classList.toggle('stacked', both < 2);
  }
  window.addEventListener('resize', fit);
  fit();
  render();
  say('&7Click an item in your inventory to offer it. &b' + THEM + '&7 has already made an offer.');
})();
