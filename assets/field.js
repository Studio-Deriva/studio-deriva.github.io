/* Character field behind the hero, drawn on the GPU.
   Glyphs slide slowly right to left under drifting waves of visibility; the
   cursor lights a ragged pool that leaves a slowly fading trail; a click sends
   out a ripple that paints them in one of the studio's colours.
   The CPU only tracks the light per cell; the shader draws every glyph. */
(function () {
  var host = document.querySelector('[data-field]');
  if (!host) return;
  var canvas = host.querySelector('canvas');
  var gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: false });
  if (!gl) { canvas.remove(); return; }
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var CW = 9, CH = 15;           // css px per glyph cell
  var FONT_PX = 13;
  var RADIUS = 230;              // light radius around the cursor
  var TRAIL = 1.5;               // trail fade rate (higher = shorter trail)
  var RISE = 9;                  // how fast a cell brightens when the light reaches it
  var DRIFT = reduce ? 0 : 11;   // glyphs slide right to left, px per second
  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var NG = GLYPHS.length;
  var MAX_RIPPLES = 6;
  // cobalt, BetterTrades teal, BetterTrades amber, pumpkin orange, frost
  var TINTS = ['#3D5BFF', '#6ABCAE', '#DFB35D', '#F66B38', '#B9C4FF'];

  function rgb(hex) { var n = parseInt(hex.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }

  var VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  var FS = [
    'precision highp float;',
    'uniform vec2 uRes;uniform float uDpr;uniform vec2 uCell;uniform float uScroll;uniform float uTime;uniform float uDrift;',
    'uniform sampler2D uHeat;uniform vec2 uGrid;uniform sampler2D uAtlas;uniform float uNG;',
    'uniform vec3 uLamp;uniform vec3 uHot;',
    'uniform vec4 uRip[' + MAX_RIPPLES + '];uniform vec3 uRipC[' + MAX_RIPPLES + '];',
    'float hash(vec2 p){p=mod(p,4096.);return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
    'void main(){',
    '  vec2 p=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr;',
    '  float wx=p.x+uScroll;',
    '  float col=floor(wx/uCell.x);float row=floor(p.y/uCell.y);',
    '  vec2 local=vec2(wx-col*uCell.x,p.y-row*uCell.y)/uCell;',
    '  float glyph=floor(hash(vec2(col,row))*uNG);',
    '  float grain=hash(vec2(col*1.7+31.,row*2.3+7.));',
    '  float m=texture2D(uAtlas,vec2((glyph+local.x)/uNG,local.y)).a;',
    '  if(m<.01){gl_FragColor=vec4(0.);return;}',
    '  vec2 cc=vec2((col+.5)*uCell.x,(row+.5)*uCell.y);',
    // ambient waves
    '  float ax=cc.x+uTime*uDrift;float ay=cc.y;float t=uTime;',
    '  float w=sin(ax*.0055+t*.22+sin(ay*.0042+t*.07)*2.2)*sin(ay*.0085-t*.13+ax*.0021)+.45*sin((ax+ay)*.0031+t*.17);',
    '  w=(w+1.45)/2.9;float k=clamp((w-.52)/.4,0.,1.);',
    '  float amb=k<grain*.55?0.:k*k*.24;',
    // cursor light
    '  float hc=mod(col,uGrid.x);',
    '  float hv=texture2D(uHeat,vec2((hc+.5)/uGrid.x,(row+.5)/uGrid.y)).r;',
    '  vec3 c=uLamp*(amb+hv*.6)+uHot*(hv*hv*hv*.7);float a=amb+hv*.6+hv*hv*hv*.7;',
    // ripples
    '  vec2 sc=vec2(cc.x-uScroll,cc.y);',
    '  for(int i=0;i<' + MAX_RIPPLES + ';i++){',
    '    vec4 r=uRip[i];if(r.w<=0.)continue;',
    '    float front=r.z;float dist=distance(sc,r.xy);',
    '    if(dist>front+uCell.y)continue;',
    '    float life=r.w;float behind=front-dist;',
    '    float wake=exp(-behind/200.)*life*life*(.2+grain*.5);',
    '    float e=max(0.,1.-abs(behind)/22.)*life*.75;',
    '    c+=uRipC[i]*wake+uHot*e;a+=wake+e;',
    '  }',
    '  a=min(a,1.);c=min(c,vec3(1.));',
    '  gl_FragColor=vec4(c*m,a*m);',
    '}'
  ].join('\n');

  function sh(type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  var prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (err) { canvas.remove(); return; }
  gl.useProgram(prog);
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var aLoc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(aLoc); gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
  var U = {};
  ['uRes', 'uDpr', 'uCell', 'uScroll', 'uTime', 'uDrift', 'uHeat', 'uGrid', 'uAtlas', 'uNG', 'uLamp', 'uHot', 'uRip', 'uRipC'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
  gl.uniform3fv(U.uLamp, rgb('#8E9DF0'));
  gl.uniform3fv(U.uHot, rgb('#E8ECFF'));
  gl.uniform2f(U.uCell, CW, CH);
  gl.uniform1f(U.uNG, NG);
  gl.uniform1f(U.uDrift, DRIFT);
  gl.uniform1i(U.uHeat, 0); gl.uniform1i(U.uAtlas, 1);
  gl.disable(gl.DEPTH_TEST);

  var heatTex = gl.createTexture(), atlasTex = gl.createTexture();
  function texParams(filter) {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

  var dpr = 1, W = 0, H = 0, gcols = 0, rows = 0;
  var heat = null, lit = null, bytes = null, grain = null;
  var scroll = 0, time = 0, last = 0, raf = 0, visible = true, firstCol = 0;
  var ripples = [], nextTint = 0;
  var ripData = new Float32Array(MAX_RIPPLES * 4), ripCol = new Float32Array(MAX_RIPPLES * 3);
  var ptr = { x: 0, y: 0, px: 0, py: 0, on: false };

  function buildAtlas() {
    var gw = Math.round(CW * dpr), gh = Math.round(CH * dpr);
    var a = document.createElement('canvas');
    a.width = gw * NG; a.height = gh;
    var x = a.getContext('2d');
    x.font = '400 ' + (FONT_PX * dpr) + 'px "JetBrains Mono", ui-monospace, Menlo, monospace';
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#fff';
    for (var g = 0; g < NG; g++) x.fillText(GLYPHS[g], g * gw + gw / 2, gh / 2 + dpr * 0.5);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, atlasTex);
    texParams(gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, a);
  }

  function resize() {
    var rect = host.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width; H = rect.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);
    // the light grid is a ring of columns in world space, so the light stays on
    // the glyphs it touched while they slide left
    var nc = Math.ceil(W / CW) + 3, nr = Math.ceil(H / CH) + 1;
    if (nc !== gcols || nr !== rows) {
      gcols = nc; rows = nr;
      heat = new Float32Array(gcols * rows); lit = new Float32Array(gcols * rows);
      bytes = new Uint8Array(gcols * rows); grain = new Float32Array(gcols * rows);
      for (var i = 0; i < grain.length; i++) grain[i] = Math.random();
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, heatTex);
      texParams(gl.NEAREST);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, gcols, rows, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, bytes);
    }
    gl.uniform2f(U.uRes, W, H);
    gl.uniform1f(U.uDpr, dpr);
    gl.uniform2f(U.uGrid, gcols, rows);
    buildAtlas();
    render();
  }

  function ring(wc) { return ((wc % gcols) + gcols) % gcols; }

  // Mark how much light the cursor puts on each cell this frame.
  function lamp(x, y) {
    var wx = x + scroll;
    var c0 = Math.floor((wx - RADIUS) / CW), c1 = Math.floor((wx + RADIUS) / CW);
    var r0 = Math.max(0, Math.floor((y - RADIUS) / CH)), r1 = Math.min(rows - 1, Math.floor((y + RADIUS) / CH));
    for (var wc = c0; wc <= c1; wc++) {
      var dx = (wc + 0.5) * CW - wx, rc = ring(wc);
      for (var r = r0; r <= r1; r++) {
        var dy = (r + 0.5) * CH - y;
        var d = Math.sqrt(dx * dx + dy * dy) / RADIUS;
        if (d >= 1) continue;
        var i = r * gcols + rc;
        var k = 1 - d;
        k = k * k * (3 - 2 * k);
        k *= 0.5 + grain[i] * 0.6;               // ragged, but soft
        if (k > lit[i]) lit[i] = k > 1 ? 1 : k;
      }
    }
  }

  function step(dt) {
    if (!reduce) {
      time += dt;
      scroll += DRIFT * dt;
      // columns that wrap round to the right side start dark
      var fc = Math.floor(scroll / CW);
      while (firstCol < fc) {
        firstCol++;
        var rc = ring(firstCol + gcols - 1);
        for (var r = 0; r < rows; r++) heat[r * gcols + rc] = 0;
      }
    }
    lit.fill(0);
    if (ptr.on) {
      var dx = ptr.x - ptr.px, dy = ptr.y - ptr.py;
      var n = Math.max(1, Math.ceil(Math.sqrt(dx * dx + dy * dy) / 16));
      for (var s = 1; s <= n; s++) lamp(ptr.px + dx * s / n, ptr.py + dy * s / n);
      ptr.px = ptr.x; ptr.py = ptr.y;
    }
    var rise = 1 - Math.exp(-dt * RISE);
    var decay = Math.exp(-dt * (reduce ? 6 : TRAIL));
    for (var i = 0; i < heat.length; i++) {
      var t = lit[i], hv = heat[i];
      if (t > hv) hv += (t - hv) * rise;
      else if (hv > 0) { hv *= decay; if (hv < 0.004) hv = 0; }
      heat[i] = hv;
      bytes[i] = hv * 255;
    }
    for (var q = ripples.length - 1; q >= 0; q--) {
      ripples[q].age += dt;
      if (ripples[q].age > ripples[q].life) ripples.splice(q, 1);
    }
  }

  function render() {
    if (!heat) return;
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, heatTex);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gcols, rows, gl.LUMINANCE, gl.UNSIGNED_BYTE, bytes);
    gl.uniform1f(U.uScroll, Math.round(scroll * dpr) / dpr);
    gl.uniform1f(U.uTime, time);
    ripData.fill(0);
    for (var i = 0; i < ripples.length && i < MAX_RIPPLES; i++) {
      var rp = ripples[i];
      ripData[i * 4] = rp.x; ripData[i * 4 + 1] = rp.y;
      ripData[i * 4 + 2] = rp.age * rp.speed; ripData[i * 4 + 3] = 1 - rp.age / rp.life;
      ripCol.set(rp.color, i * 3);
    }
    gl.uniform4fv(U.uRip, ripData);
    gl.uniform3fv(U.uRipC, ripCol);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function frame(now) {
    raf = 0;
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    step(dt);
    render();
    schedule();
  }

  function busy() {
    if (ptr.on || ripples.length) return true;
    for (var i = 0; i < heat.length; i += 5) if (heat[i] > 0) return true;
    return false;
  }
  function schedule() {
    if (visible && !document.hidden && !raf && (!reduce || busy())) raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) last = 0;
  }

  function ripple(x, y) {
    ripples.push({ x: x, y: y, age: 0, speed: reduce ? 4000 : 560, life: 4, color: rgb(TINTS[nextTint]) });
    host.style.setProperty('--tint', TINTS[nextTint]);
    nextTint = (nextTint + 1) % TINTS.length;
    if (ripples.length > MAX_RIPPLES) ripples.shift();
    schedule();
  }

  function local(e) { var r = host.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  host.addEventListener('pointerdown', function (e) {
    if (e.target.closest('a, button')) return;
    var p = local(e); ripple(p.x, p.y);
  });
  host.addEventListener('pointermove', function (e) {
    var p = local(e);
    if (!ptr.on) { ptr.px = p.x; ptr.py = p.y; }
    ptr.on = true; ptr.x = p.x; ptr.y = p.y;
    schedule();
  });
  host.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') ptr.on = false; });
  host.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') ptr.on = false; });
  host.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target === host) { e.preventDefault(); ripple(W / 2, H * 0.42); }
  });

  canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); if (raf) cancelAnimationFrame(raf); raf = 0; visible = false; });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; schedule(); }).observe(host);
  }
  document.addEventListener('visibilitychange', schedule);
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 120); });

  resize();
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { buildAtlas(); render(); });
  schedule();
  // one ripple from the logo on load, so people see what a click does
  setTimeout(function () { ripple(W / 2, H * 0.36); }, 700);
})();
