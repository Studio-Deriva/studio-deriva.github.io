/* Scroll choreography shared by every page. Everything degrades to a static,
   fully readable page when a feature is missing or motion is reduced. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Every page opens at its top (or at its #anchor), never at the scroll
  // position left over from the previous page.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  function startAtTop() {
    var target = location.hash && /^#[\w.~-]+$/.test(location.hash) ? document.getElementById(location.hash.slice(1)) : null;
    if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
    else window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }
  startAtTop();
  window.addEventListener('load', startAtTop);
  window.addEventListener('pageshow', function (e) { if (e.persisted) startAtTop(); });

  var header = document.querySelector('.site-header');

  // Phone menu: the header's links are hidden below 860px, so a toggle opens them full screen.
  (function () {
    var nav = header && header.querySelector('.nav');
    var links = nav && nav.querySelector('.nav-links');
    if (!links) return;
    var cta = nav.querySelector('.btn-primary');
    var end = document.createElement('div');
    end.className = 'nav-end';
    if (cta) { nav.insertBefore(end, cta); end.appendChild(cta); } else nav.appendChild(end);
    var toggle = document.createElement('button');
    toggle.type = 'button'; toggle.className = 'menu-toggle';
    toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-controls', 'mobile-menu'); toggle.setAttribute('aria-label', 'Menu');
    toggle.innerHTML = '<span></span>';
    end.appendChild(toggle);

    var menu = document.createElement('div');
    menu.className = 'mobile-menu'; menu.id = 'mobile-menu'; menu.hidden = true;
    var list = links.cloneNode(true);
    list.className = '';
    Array.prototype.forEach.call(list.children, function (li, i) { li.style.setProperty('--i', i); });
    menu.appendChild(list);
    if (cta) { var c = cta.cloneNode(true); c.textContent = 'Join the Discord'; menu.appendChild(c); }
    document.body.appendChild(menu);

    var wasSolid = false;
    function setOpen(open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
      document.body.classList.toggle('menu-open', open);
      if (open) {
        wasSolid = header.classList.contains('solid');
        header.classList.add('solid');
        menu.hidden = false;
        requestAnimationFrame(function () { menu.classList.add('open'); });
      } else {
        menu.classList.remove('open');
        if (!wasSolid && !header.classList.contains('always') && window.scrollY <= 40) header.classList.remove('solid');
        setTimeout(function () { if (toggle.getAttribute('aria-expanded') === 'false') menu.hidden = true; }, 250);
      }
    }
    toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 860 && toggle.getAttribute('aria-expanded') === 'true') setOpen(false); });
  })();

  // Split scroll-lit statements into words once.
  document.querySelectorAll('[data-words]').forEach(function (el) {
    var html = '';
    el.textContent.trim().split(/\s+/).forEach(function (w) { html += '<span class="w">' + w + '</span> '; });
    el.innerHTML = html;
  });

  var tracks = Array.prototype.slice.call(document.querySelectorAll('[data-progress]'));
  var ticking = false;

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function update() {
    ticking = false;
    var vh = window.innerHeight;
    if (header && !header.classList.contains('always')) header.classList.toggle('solid', window.scrollY > 40);
    tracks.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var mode = el.getAttribute('data-progress');
      var p;
      if (mode === 'leave') p = clamp(-r.top / (r.height * 0.9));
      else p = clamp(-r.top / Math.max(1, r.height - vh));
      el.style.setProperty('--p', p.toFixed(4));
      var words = el.querySelectorAll('.w');
      if (words.length) {
        var lit = Math.round(p * 1.25 * words.length);
        for (var i = 0; i < words.length; i++) words[i].classList.toggle('on', i < lit);
      }
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

  if (reduce) {
    tracks.forEach(function (el) { el.style.setProperty('--p', el.getAttribute('data-progress') === 'leave' ? 0 : 1); });
    document.querySelectorAll('.w').forEach(function (w) { w.classList.add('on'); });
    if (header && !header.classList.contains('always')) {
      window.addEventListener('scroll', function () { header.classList.toggle('solid', window.scrollY > 40); }, { passive: true });
    }
  } else {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  // Count-up numbers. The final value is in the HTML, so nothing is lost without JS.
  var counters = document.querySelectorAll('[data-count]');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target, end = +el.getAttribute('data-count'), t0 = 0;
        function step(now) {
          if (!t0) t0 = now;
          var k = Math.min(1, (now - t0) / 1400);
          el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { io.observe(c); });
  }

  // Copy buttons
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var src = document.getElementById(btn.getAttribute('data-copy'));
      function selectIt() {
        var r = document.createRange(); r.selectNodeContents(src);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        btn.textContent = 'Selected';
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(src.textContent).then(function () { btn.textContent = 'Copied'; }, selectIt);
      } else selectIt();
      setTimeout(function () { btn.textContent = 'Copy'; }, 2000);
    });
  });
})();
