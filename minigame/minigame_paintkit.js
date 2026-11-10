/* ══ 🎨 小英雄 共用繪圖工具包 MGPK(minigame_paintkit.js)══
   ★ v1.0.0(2026-11-10・老師「創藝工坊所有手繪關卡(包括解鎖後的美術設計師)新增
     1 油漆桶一鍵填滿(按住顏色拖到包圍的線條內自動填滿,可調臨界值)
     2 手繪線條長按不放 2 秒自動變成向量直線、圓、幾何
     3 圖層都要顯示、圖層名稱可編輯、色彩選擇器統一用外圍環型色相+內圈明度彩度三角形
     4 剪刀工具:把包圍起來的區塊剪下、拖曳移到指定圖層
     5 變形工具」)
   創藝工坊畫布(minigame_art.js canvasOpen)與遊戲美術設計師(minigame_designer.js)共用這一支:
   · 演算法(填色遮罩、手繪辨識成幾何、套索剪下、變形四角/扭曲網格)不碰任何畫面狀態,兩邊各自接自己的復原/存檔。
   · 介面小零件(環形色相+三角形明度彩度、拖顏色、臨界值條、變形工具列)用 inline style,不依賴任何一邊的 CSS 類名。
   ES5(小遊戲鐵律):不用箭頭函式、樣板字面值、let/const、可選串連。 */
(function(){
'use strict';
var K = { ver: 'v1.0.0' };
function clamp(v, a, b){ return v < a ? a : (v > b ? b : v); }
function now(){ return Date.now(); }

/* ── 顏色 ── */
K.hsv2hex = function(h, s, v){ h = ((h % 360) + 360) % 360; var c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c, r = 0, g = 0, b = 0;
  if(h < 60){ r = c; g = x; } else if(h < 120){ r = x; g = c; } else if(h < 180){ g = c; b = x; } else if(h < 240){ g = x; b = c; } else if(h < 300){ r = x; b = c; } else { r = c; b = x; }
  function hx(n){ return ('0' + Math.round(clamp(n + m, 0, 1) * 255).toString(16)).slice(-2); } return '#' + hx(r) + hx(g) + hx(b); };
K.hex2rgb = function(hex){ hex = String(hex || '#000000'); if(hex.length === 4) hex = '#' + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2) + hex.charAt(3) + hex.charAt(3);
  return [parseInt(hex.substr(1, 2), 16) || 0, parseInt(hex.substr(3, 2), 16) || 0, parseInt(hex.substr(5, 2), 16) || 0]; };
K.hex2hsv = function(hex){ var c = K.hex2rgb(hex), r = c[0] / 255, g = c[1] / 255, b = c[2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, h = 0;
  if(d){ if(mx === r) h = 60 * (((g - b) / d) % 6); else if(mx === g) h = 60 * ((b - r) / d + 2); else h = 60 * ((r - g) / d + 4); }
  if(h < 0) h += 360; return { h: h, s: mx ? d / mx : 0, v: mx }; };

/* ══ 1 油漆桶:在「看得到的整張圖」上找相連的同色區(臨界值 0~100),畫進作用圖層 ══
   src = ImageData(建議先鋪白底再疊所有看得到的圖層,空白紙才是同一種顏色)
   回傳 { m: 遮罩, x0,y0,x1,y1(含), n } ;外擴 grow 像素蓋住線條邊緣的半透明鋸齒(不然線條旁會留一圈白邊) */
K.fillMask = function(src, sx, sy, tol, grow){
  var w = src.width, h = src.height, d = src.data, m, x, y, o, r0, g0, b0, a0, lim, st, n = 0, x0 = w, y0 = h, x1 = -1, y1 = -1, xl, xr, up, dn, i, j;
  sx = Math.floor(sx); sy = Math.floor(sy);
  if(sx < 0 || sy < 0 || sx >= w || sy >= h) return null;
  m = new Uint8Array(w * h); o = (sy * w + sx) * 4; r0 = d[o]; g0 = d[o + 1]; b0 = d[o + 2]; a0 = d[o + 3];
  lim = clamp(tol == null ? 32 : tol, 0, 100) * 2.55 + 0.5;
  function ok(p){ var q = p * 4; return !m[p] && Math.abs(d[q] - r0) <= lim && Math.abs(d[q + 1] - g0) <= lim && Math.abs(d[q + 2] - b0) <= lim && Math.abs(d[q + 3] - a0) <= lim; }
  st = [sx, sy];
  while(st.length){
    y = st.pop(); x = st.pop(); if(!ok(y * w + x)) continue;
    xl = x; while(xl > 0 && ok(y * w + xl - 1)) xl--;
    xr = x; while(xr < w - 1 && ok(y * w + xr + 1)) xr++;
    up = false; dn = false;
    for(i = xl; i <= xr; i++){ m[y * w + i] = 1; n++;
      if(y > 0){ if(ok((y - 1) * w + i)){ if(!up){ st.push(i, y - 1); up = true; } } else up = false; }
      if(y < h - 1){ if(ok((y + 1) * w + i)){ if(!dn){ st.push(i, y + 1); dn = true; } } else dn = false; } }
    if(xl < x0) x0 = xl; if(xr > x1) x1 = xr; if(y < y0) y0 = y; if(y > y1) y1 = y;
  }
  grow = grow == null ? 2 : grow;
  if(grow > 0 && n){   /* 外擴:往外長 grow 圈(只長到看得到的整張圖「不是白紙」的地方也可以,線條底下被蓋住沒關係) */
    var gx0 = Math.max(0, x0 - grow), gy0 = Math.max(0, y0 - grow), gx1 = Math.min(w - 1, x1 + grow), gy1 = Math.min(h - 1, y1 + grow), pass, m2;
    for(pass = 0; pass < grow; pass++){ m2 = new Uint8Array(m);
      for(j = gy0; j <= gy1; j++){ for(i = gx0; i <= gx1; i++){ o = j * w + i; if(m[o]) continue;
        if((i > 0 && m[o - 1]) || (i < w - 1 && m[o + 1]) || (j > 0 && m[o - w]) || (j < h - 1 && m[o + w])){ m2[o] = 1; n++; } } }
      m = m2; }
    x0 = gx0; y0 = gy0; x1 = gx1; y1 = gy1;
  }
  return { m: m, w: w, h: h, x0: x0, y0: y0, x1: x1, y1: y1, n: n };
};
/* 把遮罩用某個顏色畫到 ctx(畫布座標 = 遮罩座標 × k;k 給「取樣圖比畫布小」時用) */
K.fillPaint = function(ctx, F, hex, alpha, k, comp){
  if(!F || !F.n) return null;
  var bw = F.x1 - F.x0 + 1, bh = F.y1 - F.y0 + 1, c = document.createElement('canvas'), x, id, dd, i, j, o, q, col = K.hex2rgb(hex);
  k = k || 1; c.width = bw; c.height = bh; x = c.getContext('2d'); id = x.createImageData(bw, bh); dd = id.data;
  for(j = 0; j < bh; j++){ for(i = 0; i < bw; i++){ if(!F.m[(j + F.y0) * F.w + i + F.x0]) continue; q = (j * bw + i) * 4; dd[q] = col[0]; dd[q + 1] = col[1]; dd[q + 2] = col[2]; dd[q + 3] = 255; } }
  x.putImageData(id, 0, 0);
  ctx.save(); ctx.globalCompositeOperation = comp || 'source-over'; ctx.globalAlpha = alpha == null ? 1 : alpha;   /* comp = 'source-atop' ⇒ 阿爾法鎖定:只塗在本來就有顏色的地方 */
  if(k !== 1){ ctx.imageSmoothingEnabled = false; ctx.drawImage(c, F.x0 * k, F.y0 * k, bw * k, bh * k); } else ctx.drawImage(c, F.x0, F.y0);
  ctx.restore();
  return { x: F.x0 * k, y: F.y0 * k, w: bw * k, h: bh * k };
};

/* ══ 2 手繪辨識:長按 2 秒把剛畫的線條變成 直線/折線/圓/橢圓/三角形/四邊形/長方形/正方形/多邊形 ══ */
function dist(a, b){ var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }
function plen(p){ var s = 0, i; for(i = 1; i < p.length; i++) s += dist(p[i - 1], p[i]); return s; }
function resample(p, n){ var L = plen(p), I = L / (n - 1), D = 0, out = [{ x: p[0].x, y: p[0].y }], i, d, q, a = p.slice();
  if(!(L > 0)) return out;
  for(i = 1; i < a.length; i++){ d = dist(a[i - 1], a[i]);
    if(D + d >= I && d > 0){ q = { x: a[i - 1].x + (I - D) / d * (a[i].x - a[i - 1].x), y: a[i - 1].y + (I - D) / d * (a[i].y - a[i - 1].y) }; out.push(q); a.splice(i, 0, q); D = 0; }
    else D += d; }
  while(out.length < n) out.push({ x: p[p.length - 1].x, y: p[p.length - 1].y });
  return out; }
function segDist(p, a, b){ var dx = b.x - a.x, dy = b.y - a.y, l = dx * dx + dy * dy, t; if(!l) return dist(p, a); t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / l, 0, 1); return dist(p, { x: a.x + t * dx, y: a.y + t * dy }); }
function dp(p, eps){ if(p.length < 3) return p.slice(); var md = 0, mi = 0, i, d, a, b;
  for(i = 1; i < p.length - 1; i++){ d = segDist(p[i], p[0], p[p.length - 1]); if(d > md){ md = d; mi = i; } }
  if(md > eps){ a = dp(p.slice(0, mi + 1), eps); b = dp(p.slice(mi), eps); return a.slice(0, -1).concat(b); }
  return [p[0], p[p.length - 1]]; }
function centroid(p){ var x = 0, y = 0, i; for(i = 0; i < p.length; i++){ x += p[i].x; y += p[i].y; } return { x: x / p.length, y: y / p.length }; }
/* 角度太平(接近一直線)的轉角拿掉 */
function prune(v, closed, minDeg){ var ch = true, i, a, b, c, ang, n;
  while(ch && v.length > (closed ? 3 : 2)){ ch = false; n = v.length;
    for(i = closed ? 0 : 1; i < (closed ? n : n - 1); i++){ a = v[(i - 1 + n) % n]; b = v[i]; c = v[(i + 1) % n];
      ang = Math.abs(Math.atan2(a.y - b.y, a.x - b.x) - Math.atan2(c.y - b.y, c.x - b.x)) * 180 / Math.PI; if(ang > 180) ang = 360 - ang;
      if(ang > 180 - minDeg){ v.splice(i, 1); ch = true; break; } } }
  return v; }
K.recog = function(raw){
  if(!raw || raw.length < 4) return null;
  var L = plen(raw), p, c, i, closed, diag, mnx = 1e9, mny = 1e9, mxx = -1e9, mxy = -1e9, sxx = 0, syy = 0, sxy = 0, dx, dy, th, ux, uy, a, b, err, v, e2, ce, ang, sh;
  if(L < 24) return null;
  p = resample(raw, 72);
  for(i = 0; i < p.length; i++){ if(p[i].x < mnx) mnx = p[i].x; if(p[i].y < mny) mny = p[i].y; if(p[i].x > mxx) mxx = p[i].x; if(p[i].y > mxy) mxy = p[i].y; }
  diag = Math.sqrt((mxx - mnx) * (mxx - mnx) + (mxy - mny) * (mxy - mny)) || 1;
  closed = dist(p[0], p[p.length - 1]) < Math.max(18, diag * 0.22);
  if(!closed){
    /* 直線:每一點離頭尾連線都很近 */
    var md = 0; for(i = 0; i < p.length; i++){ e2 = segDist(p[i], p[0], p[p.length - 1]); if(e2 > md) md = e2; }
    if(md < Math.max(6, dist(p[0], p[p.length - 1]) * 0.07)) return { k: 'line', a: { x: raw[0].x, y: raw[0].y }, b: { x: raw[raw.length - 1].x, y: raw[raw.length - 1].y }, n: '直線' };
    v = prune(dp(p, diag * 0.06), false, 25);
    if(v.length >= 3 && v.length <= 6) return { k: 'poly', pts: v, closed: false, n: '折線' };
    /* 弧線:用圓去套 */
    c = centroid(p); return null;
  }
  /* 封閉:先用主軸(PCA)套橢圓,誤差小就是圓/橢圓;不然找轉角當多邊形 */
  c = centroid(p);
  for(i = 0; i < p.length; i++){ dx = p[i].x - c.x; dy = p[i].y - c.y; sxx += dx * dx; syy += dy * dy; sxy += dx * dy; }
  th = 0.5 * Math.atan2(2 * sxy, sxx - syy); ux = Math.cos(th); uy = Math.sin(th);
  a = 0; b = 0; var pa = [], pb = [];
  for(i = 0; i < p.length; i++){ dx = p[i].x - c.x; dy = p[i].y - c.y; pa.push(dx * ux + dy * uy); pb.push(-dx * uy + dy * ux); }
  for(i = 0; i < p.length; i++){ a = Math.max(a, Math.abs(pa[i])); b = Math.max(b, Math.abs(pb[i])); }
  /* 用平均半徑比較穩(手畫的圓常常一邊凸出) */
  var ra = 0, rb = 0; for(i = 0; i < p.length; i++){ ra += Math.abs(pa[i]); rb += Math.abs(pb[i]); }
  ra = ra / p.length * Math.PI / 2; rb = rb / p.length * Math.PI / 2;
  a = (a + ra) / 2; b = (b + rb) / 2;
  err = 0; for(i = 0; i < p.length; i++){ ce = Math.sqrt(pa[i] * pa[i] / (a * a || 1) + pb[i] * pb[i] / (b * b || 1)); err += Math.abs(ce - 1); } err /= p.length;
  v = prune(dp(p.slice(0, p.length - 1), diag * 0.07), true, 28);
  /* 頭尾重疊時第一點常常是假轉角 */
  if(v.length > 3 && dist(v[0], v[v.length - 1]) < diag * 0.12) v.splice(v.length - 1, 1);
  var perr = 0; if(v.length >= 3){ for(i = 0; i < p.length; i++){ var best = 1e9, j; for(j = 0; j < v.length; j++){ e2 = segDist(p[i], v[j], v[(j + 1) % v.length]); if(e2 < best) best = e2; } perr += best; } perr /= p.length * (diag || 1); } else perr = 1;
  if(err < 0.12 && (v.length > 6 || perr > 0.018 || err < 0.06)){
    if(Math.min(a, b) / Math.max(a, b) > 0.82){ var r = (a + b) / 2; return { k: 'ellipse', cx: c.x, cy: c.y, rx: r, ry: r, rot: 0, n: '圓形' }; }
    return { k: 'ellipse', cx: c.x, cy: c.y, rx: a, ry: b, rot: th, n: '橢圓' };
  }
  if(v.length < 3) return null;
  if(v.length === 3) return { k: 'poly', pts: v, closed: true, n: '三角形' };
  if(v.length === 4){
    /* 四個角都接近直角 ⇒ 長方形(用主軸方向拉正);邊長差不多 ⇒ 正方形 */
    var rt = true; for(i = 0; i < 4; i++){ var A = v[(i + 3) % 4], B = v[i], C = v[(i + 1) % 4]; ang = Math.abs(Math.atan2(A.y - B.y, A.x - B.x) - Math.atan2(C.y - B.y, C.x - B.x)) * 180 / Math.PI; if(ang > 180) ang = 360 - ang; if(Math.abs(ang - 90) > 22) rt = false; }
    if(rt){ var e0 = { x: v[1].x - v[0].x, y: v[1].y - v[0].y }, rot = Math.atan2(e0.y, e0.x), cr = Math.cos(rot), sr = Math.sin(rot), lx0 = 1e9, lx1 = -1e9, ly0 = 1e9, ly1 = -1e9, q;
      /* 角度吸到水平/垂直(差 8 度以內) */
      var deg = rot * 180 / Math.PI, snapd = Math.round(deg / 90) * 90; if(Math.abs(deg - snapd) < 8){ rot = snapd * Math.PI / 180; cr = Math.cos(rot); sr = Math.sin(rot); }
      for(i = 0; i < p.length; i++){ dx = p[i].x - c.x; dy = p[i].y - c.y; q = dx * cr + dy * sr; if(q < lx0) lx0 = q; if(q > lx1) lx1 = q; q = -dx * sr + dy * cr; if(q < ly0) ly0 = q; if(q > ly1) ly1 = q; }
      var hw = (lx1 - lx0) / 2 * 0.94, hh = (ly1 - ly0) / 2 * 0.94, mx = c.x + ((lx0 + lx1) / 2) * cr - ((ly0 + ly1) / 2) * sr, my = c.y + ((lx0 + lx1) / 2) * sr + ((ly0 + ly1) / 2) * cr, sq = Math.min(hw, hh) / Math.max(hw, hh) > 0.86;
      if(sq){ hw = hh = (hw + hh) / 2; }
      function P(u, w2){ return { x: mx + u * cr - w2 * sr, y: my + u * sr + w2 * cr }; }
      return { k: 'poly', pts: [P(-hw, -hh), P(hw, -hh), P(hw, hh), P(-hw, hh)], closed: true, n: sq ? '正方形' : '長方形' }; }
    return { k: 'poly', pts: v, closed: true, n: '四邊形' };
  }
  return { k: 'poly', pts: v, closed: true, n: v.length === 5 ? '五邊形' : v.length === 6 ? '六邊形' : '多邊形' };
};
K.shapeCopy = function(s){ var o = {}, k, i; for(k in s){ if(s.hasOwnProperty(k)) o[k] = s[k]; } if(s.pts){ o.pts = []; for(i = 0; i < s.pts.length; i++) o.pts.push({ x: s.pts[i].x, y: s.pts[i].y }); } if(s.a) o.a = { x: s.a.x, y: s.a.y }; if(s.b) o.b = { x: s.b.x, y: s.b.y }; return o; };
/* 沿著形狀走一圈的點(給各自的筆刷照原本的質感重畫一次) */
K.shapePts = function(s, step){
  var o = [], i, j, n, a, b, t, c, cs, sn, pts;
  step = step || 3;
  if(s.k === 'line'){ n = Math.max(2, Math.ceil(dist(s.a, s.b) / step)); for(i = 0; i <= n; i++) o.push({ x: s.a.x + (s.b.x - s.a.x) * i / n, y: s.a.y + (s.b.y - s.a.y) * i / n }); return o; }
  if(s.k === 'ellipse'){ n = Math.max(24, Math.ceil(Math.PI * (s.rx + s.ry) / step)); cs = Math.cos(s.rot || 0); sn = Math.sin(s.rot || 0);
    for(i = 0; i <= n; i++){ t = i / n * Math.PI * 2; a = Math.cos(t) * s.rx; b = Math.sin(t) * s.ry; o.push({ x: s.cx + a * cs - b * sn, y: s.cy + a * sn + b * cs }); } return o; }
  pts = s.pts.slice(); if(s.closed) pts.push(pts[0]);
  for(j = 1; j < pts.length; j++){ a = pts[j - 1]; b = pts[j]; n = Math.max(1, Math.ceil(dist(a, b) / step)); for(i = (j === 1 ? 0 : 1); i <= n; i++) o.push({ x: a.x + (b.x - a.x) * i / n, y: a.y + (b.y - a.y) * i / n }); }
  return o;
};
K.shapeCenter = function(s){ if(s.k === 'line') return { x: (s.a.x + s.b.x) / 2, y: (s.a.y + s.b.y) / 2 }; if(s.k === 'ellipse') return { x: s.cx, y: s.cy }; return centroid(s.pts); };
/* 辨識完手還沒放開:繼續拖可以調整 — 直線拉另一端;圓/橢圓放大縮小;多邊形放大縮小+轉方向(以中心為準) */
K.shapeAdjust = function(s0, p0, p){
  var s = K.shapeCopy(s0), c = K.shapeCenter(s0), d0 = dist(p0, c), d1 = dist(p, c), f = d0 > 4 ? clamp(d1 / d0, 0.1, 10) : 1, r, i, cs, sn, dx, dy;
  if(s.k === 'line'){ s.b = { x: p.x, y: p.y }; return s; }
  if(s.k === 'ellipse'){ s.rx = s0.rx * f; s.ry = s0.ry * f; return s; }
  r = d0 > 4 ? Math.atan2(p.y - c.y, p.x - c.x) - Math.atan2(p0.y - c.y, p0.x - c.x) : 0; cs = Math.cos(r); sn = Math.sin(r);
  for(i = 0; i < s.pts.length; i++){ dx = (s0.pts[i].x - c.x) * f; dy = (s0.pts[i].y - c.y) * f; s.pts[i] = { x: c.x + dx * cs - dy * sn, y: c.y + dx * sn + dy * cs }; }
  return s;
};
/* 長按偵測器:筆畫中一直呼叫 move(x,y);同一個地方(半徑 tolPx)停住 ms 毫秒就呼叫 fire()。progress() 給畫面畫倒數圈 */
K.holdTimer = function(ms, tolPx, fire){
  var H = { x: 0, y: 0, t: 0, on: false, done: false, tm: 0 };
  H.move = function(x, y, tol){ var t2 = tol || tolPx; if(H.done) return; if(!H.on || Math.abs(x - H.x) + Math.abs(y - H.y) > t2){ H.x = x; H.y = y; H.t = now(); H.on = true; clearTimeout(H.tm); H.tm = setTimeout(function(){ if(H.on && !H.done){ H.done = true; fire(H.x, H.y); } }, ms); } };
  H.stop = function(){ clearTimeout(H.tm); H.on = false; };
  H.reset = function(){ clearTimeout(H.tm); H.on = false; H.done = false; };
  H.progress = function(){ return H.on && !H.done ? clamp((now() - H.t) / ms, 0, 1) : 0; };
  return H;
};
/* 畫倒數圈(畫面座標系已經是畫布座標;r 是畫布單位) */
K.drawHold = function(ctx, x, y, pr, r){ if(pr < 0.2) return; ctx.save(); ctx.lineWidth = r * 0.28; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#ff7a59'; ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (pr - 0.2) / 0.8); ctx.stroke(); ctx.restore(); };

/* ══ 4 剪刀:用套索圈起來的範圍從圖層剪下來,變成可以拖曳/變形的「浮動圖片」 ══ */
K.pathOf = function(ctx, pts){ var i; ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); for(i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y); ctx.closePath(); };
function opaqueBox(c, x0, y0, w, h){ var d, i, j, o, mx0 = w, my0 = h, mx1 = -1, my1 = -1; if(w < 1 || h < 1) return null;
  try{ d = c.getContext('2d').getImageData(x0, y0, w, h).data; }catch(e){ return null; }
  for(j = 0; j < h; j++){ for(i = 0; i < w; i++){ o = (j * w + i) * 4 + 3; if(d[o] > 6){ if(i < mx0) mx0 = i; if(i > mx1) mx1 = i; if(j < my0) my0 = j; if(j > my1) my1 = j; } } }
  return mx1 < 0 ? null : { x: x0 + mx0, y: y0 + my0, w: mx1 - mx0 + 1, h: my1 - my0 + 1 }; }
K.lassoCut = function(layer, pts){
  if(!pts || pts.length < 3) return null;
  var W = layer.width, H = layer.height, i, x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, bx, by, bw, bh, tmp, tx, ob, pc, lx, orig;
  for(i = 0; i < pts.length; i++){ if(pts[i].x < x0) x0 = pts[i].x; if(pts[i].y < y0) y0 = pts[i].y; if(pts[i].x > x1) x1 = pts[i].x; if(pts[i].y > y1) y1 = pts[i].y; }
  bx = clamp(Math.floor(x0) - 1, 0, W); by = clamp(Math.floor(y0) - 1, 0, H); bw = clamp(Math.ceil(x1) + 1, 0, W) - bx; bh = clamp(Math.ceil(y1) + 1, 0, H) - by;
  if(bw < 2 || bh < 2) return null;
  tmp = document.createElement('canvas'); tmp.width = bw; tmp.height = bh; tx = tmp.getContext('2d');
  tx.save(); tx.translate(-bx, -by); K.pathOf(tx, pts); tx.clip(); tx.drawImage(layer, 0, 0); tx.restore();
  ob = opaqueBox(tmp, 0, 0, bw, bh); if(!ob) return null;
  pc = document.createElement('canvas'); pc.width = ob.w; pc.height = ob.h; pc.getContext('2d').drawImage(tmp, ob.x, ob.y, ob.w, ob.h, 0, 0, ob.w, ob.h);
  orig = document.createElement('canvas'); orig.width = bw; orig.height = bh; orig.getContext('2d').drawImage(layer, bx, by, bw, bh, 0, 0, bw, bh);
  lx = layer.getContext('2d'); lx.save(); lx.globalCompositeOperation = 'destination-out'; K.pathOf(lx, pts); lx.fill(); lx.restore();
  return { F: K.floatMk(pc, bx + ob.x, by + ob.y), orig: { c: orig, x: bx, y: by } };
};
/* ══ 5 變形:把整個圖層(畫到的範圍)拿起來 ══ */
K.liftLayer = function(layer){
  var W = layer.width, H = layer.height, ob = opaqueBox(layer, 0, 0, W, H), pc, orig, lx;
  if(!ob) return null;
  pc = document.createElement('canvas'); pc.width = ob.w; pc.height = ob.h; pc.getContext('2d').drawImage(layer, ob.x, ob.y, ob.w, ob.h, 0, 0, ob.w, ob.h);
  orig = document.createElement('canvas'); orig.width = ob.w; orig.height = ob.h; orig.getContext('2d').drawImage(pc, 0, 0);
  lx = layer.getContext('2d'); lx.clearRect(ob.x, ob.y, ob.w, ob.h);
  return { F: K.floatMk(pc, ob.x, ob.y), orig: { c: orig, x: ob.x, y: ob.y } };
};
/* 浮動圖片 F:c=圖、w/h、中心 tx/ty、sx/sy(負的 = 翻面)、rot(弧度);q = 扭曲後的四個角 [左上,右上,右下,左下](null = 沒扭曲) */
K.floatMk = function(c, x, y){ return { c: c, w: c.width, h: c.height, tx: x + c.width / 2, ty: y + c.height / 2, sx: 1, sy: 1, rot: 0, q: null }; };
K.floatCorners = function(F){ if(F.q) return F.q; var cs = Math.cos(F.rot), sn = Math.sin(F.rot), hw = F.w / 2 * F.sx, hh = F.h / 2 * F.sy, a = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]], o = [], i;
  for(i = 0; i < 4; i++) o.push({ x: F.tx + a[i][0] * cs - a[i][1] * sn, y: F.ty + a[i][0] * sn + a[i][1] * cs }); return o; };
K.floatBox = function(F){ var q = K.floatCorners(F), i, x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for(i = 0; i < 4; i++){ x0 = Math.min(x0, q[i].x); y0 = Math.min(y0, q[i].y); x1 = Math.max(x1, q[i].x); y1 = Math.max(y1, q[i].y); } return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }; };
function mid2(a, b){ return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }
function rotHandle(F, hs){ var q = K.floatCorners(F), t = mid2(q[0], q[1]), c = mid2(mid2(q[0], q[2]), mid2(q[1], q[3])), dx = t.x - c.x, dy = t.y - c.y, l = Math.sqrt(dx * dx + dy * dy) || 1; return { x: t.x + dx / l * hs * 2.6, y: t.y + dy / l * hs * 2.6, bx: t.x, by: t.y }; }
function inQuad(p, q){ var i, s = 0, a, b, cr, pos = 0, neg = 0; for(i = 0; i < 4; i++){ a = q[i]; b = q[(i + 1) % 4]; cr = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x); if(cr > 0) pos++; else if(cr < 0) neg++; } return !(pos && neg); }
/* 點到哪個把手:'c0'~'c3' 四角、'e0'~'e3' 四邊中點(上右下左)、'rot' 旋轉、'in' 裡面;hs = 把手半徑(畫布單位) */
K.floatHit = function(F, p, hs, mode){
  var q = K.floatCorners(F), i, r = rotHandle(F, hs), e;
  if(dist(p, r) < hs * 1.4 && mode !== 'dist') return 'rot';
  for(i = 0; i < 4; i++){ if(dist(p, q[i]) < hs * 1.5) return 'c' + i; }
  if(mode === 'free'){ for(i = 0; i < 4; i++){ e = mid2(q[i], q[(i + 1) % 4]); if(dist(p, e) < hs * 1.3) return 'e' + i; } }
  if(inQuad(p, q)) return 'in';
  return null;
};
K.floatDragStart = function(F, kind, p){ return { k: kind, p0: { x: p.x, y: p.y }, F0: { tx: F.tx, ty: F.ty, sx: F.sx, sy: F.sy, rot: F.rot, q: F.q ? F.q.map(function(o){ return { x: o.x, y: o.y }; }) : null }, Q0: K.floatCorners(F).map(function(o){ return { x: o.x, y: o.y }; }) }; };
K.floatDrag = function(F, st, p, mode){
  var F0 = st.F0, dx = p.x - st.p0.x, dy = p.y - st.p0.y, i, k = st.k, ci, O, cs, sn, du, dv, du0, dv0, f, c0, a0, a1, Q;
  if(k === 'in'){ if(F0.q){ F.q = F0.q.map(function(o){ return { x: o.x + dx, y: o.y + dy }; }); } else { F.tx = F0.tx + dx; F.ty = F0.ty + dy; } return; }
  if(k === 'rot'){ c0 = F0.q ? centroid(F0.q) : { x: F0.tx, y: F0.ty }; a0 = Math.atan2(st.p0.y - c0.y, st.p0.x - c0.x); a1 = Math.atan2(p.y - c0.y, p.x - c0.x); f = a1 - a0;
    var deg = (F0.rot + f) * 180 / Math.PI, sd = Math.round(deg / 45) * 45; if(!F0.q && Math.abs(deg - sd) < 4) f = sd * Math.PI / 180 - F0.rot;   /* 接近 0/45/90 度自動吸過去 */
    if(F0.q){ cs = Math.cos(f); sn = Math.sin(f); F.q = F0.q.map(function(o){ var x = o.x - c0.x, y = o.y - c0.y; return { x: c0.x + x * cs - y * sn, y: c0.y + x * sn + y * cs }; }); } else F.rot = F0.rot + f; return; }
  if(mode === 'dist' && k.charAt(0) === 'c'){ ci = +k.charAt(1); F.q = st.Q0.map(function(o){ return { x: o.x, y: o.y }; }); F.q[ci] = { x: st.Q0[ci].x + dx, y: st.Q0[ci].y + dy }; return; }
  if(F0.q) return;   /* 已經扭曲過:只能移動/旋轉/再拉角 */
  cs = Math.cos(F0.rot); sn = Math.sin(F0.rot); Q = st.Q0;
  if(k.charAt(0) === 'c'){ ci = +k.charAt(1); O = Q[(ci + 2) % 4];
    du0 = (Q[ci].x - O.x) * cs + (Q[ci].y - O.y) * sn; dv0 = -(Q[ci].x - O.x) * sn + (Q[ci].y - O.y) * cs;
    du = (p.x - O.x) * cs + (p.y - O.y) * sn; dv = -(p.x - O.x) * sn + (p.y - O.y) * cs;
    if(mode === 'free'){ f = du / (du0 || 1); var g = dv / (dv0 || 1); if(Math.abs(f) < 0.03) f = f < 0 ? -0.03 : 0.03; if(Math.abs(g) < 0.03) g = g < 0 ? -0.03 : 0.03; F.sx = F0.sx * f; F.sy = F0.sy * g; }
    else { f = (du * du0 + dv * dv0) / ((du0 * du0 + dv0 * dv0) || 1); if(f < 0.03) f = 0.03; F.sx = F0.sx * f; F.sy = F0.sy * f; du = du0 * f; dv = dv0 * f; }
    if(mode === 'free'){ du = du0 * (F.sx / F0.sx); dv = dv0 * (F.sy / F0.sy); }
    F.tx = O.x + (du * cs - dv * sn) / 2; F.ty = O.y + (du * sn + dv * cs) / 2; return; }
  if(k.charAt(0) === 'e'){ ci = +k.charAt(1); var a = Q[ci], b = Q[(ci + 1) % 4], m = mid2(a, b), oa = Q[(ci + 2) % 4], ob = Q[(ci + 3) % 4], om = mid2(oa, ob), ax = m.x - om.x, ay = m.y - om.y, al = Math.sqrt(ax * ax + ay * ay) || 1, pr = ((p.x - om.x) * ax + (p.y - om.y) * ay) / al;
    f = pr / al; if(Math.abs(f) < 0.03) f = f < 0 ? -0.03 : 0.03;
    if(ci % 2 === 0) F.sy = F0.sy * f; else F.sx = F0.sx * f;
    F.tx = om.x + ax / al * pr / 2; F.ty = om.y + ay / al * pr / 2; }
};
K.floatFlip = function(F, axis){ var q;
  if(F.q){ q = F.q; F.q = axis === 'h' ? [q[1], q[0], q[3], q[2]] : [q[3], q[2], q[1], q[0]]; return; }
  if(axis === 'h') F.sx = -F.sx; else F.sy = -F.sy; };
K.floatRot90 = function(F){ if(F.q){ var c = centroid(F.q); F.q = F.q.map(function(o){ return { x: c.x - (o.y - c.y), y: c.y + (o.x - c.x) }; }); return; } F.rot += Math.PI / 2; };
/* 三角形 s → d 的仿射對應,畫一塊(稍微外擴半個像素避免接縫) */
function triDraw(ctx, img, s0, s1, s2, d0, d1, d2){
  var den = s0.x * (s1.y - s2.y) + s1.x * (s2.y - s0.y) + s2.x * (s0.y - s1.y), a, b, c, d, e, f, cx, cy, k = 1.02;
  if(Math.abs(den) < 1e-6) return;
  a = (d0.x * (s1.y - s2.y) + d1.x * (s2.y - s0.y) + d2.x * (s0.y - s1.y)) / den;
  b = (d0.y * (s1.y - s2.y) + d1.y * (s2.y - s0.y) + d2.y * (s0.y - s1.y)) / den;
  c = (d0.x * (s2.x - s1.x) + d1.x * (s0.x - s2.x) + d2.x * (s1.x - s0.x)) / den;
  d = (d0.y * (s2.x - s1.x) + d1.y * (s0.x - s2.x) + d2.y * (s1.x - s0.x)) / den;
  e = (d0.x * (s1.x * s2.y - s2.x * s1.y) + d1.x * (s2.x * s0.y - s0.x * s2.y) + d2.x * (s0.x * s1.y - s1.x * s0.y)) / den;
  f = (d0.y * (s1.x * s2.y - s2.x * s1.y) + d1.y * (s2.x * s0.y - s0.x * s2.y) + d2.y * (s0.x * s1.y - s1.x * s0.y)) / den;
  cx = (d0.x + d1.x + d2.x) / 3; cy = (d0.y + d1.y + d2.y) / 3;
  ctx.save(); ctx.beginPath();
  ctx.moveTo(cx + (d0.x - cx) * k, cy + (d0.y - cy) * k); ctx.lineTo(cx + (d1.x - cx) * k, cy + (d1.y - cy) * k); ctx.lineTo(cx + (d2.x - cx) * k, cy + (d2.y - cy) * k); ctx.closePath(); ctx.clip();
  ctx.transform(a, b, c, d, e, f); ctx.drawImage(img, 0, 0); ctx.restore(); }
function bil(q, u, v){ var tx = q[0].x + (q[1].x - q[0].x) * u, ty = q[0].y + (q[1].y - q[0].y) * u, bx = q[3].x + (q[2].x - q[3].x) * u, by = q[3].y + (q[2].y - q[3].y) * u; return { x: tx + (bx - tx) * v, y: ty + (by - ty) * v }; }
/* 把浮動圖片畫到 ctx(ctx 目前的座標系 = 畫布座標);fine = 交出去時用細一點的網格 */
K.floatDraw = function(ctx, F, fine, alpha){
  ctx.save(); if(alpha != null) ctx.globalAlpha = alpha;
  if(!F.q){ ctx.translate(F.tx, F.ty); ctx.rotate(F.rot); ctx.scale(F.sx, F.sy); ctx.drawImage(F.c, -F.w / 2, -F.h / 2); ctx.restore(); return; }
  var q = F.q, n = fine ? 14 : 7, i, j, u0, u1, v0, v1, A, B, C, D, w = F.w, h = F.h;
  /* 剛好是平行四邊形 ⇒ 一次畫完(沒有接縫) */
  if(Math.abs(q[0].x + q[2].x - q[1].x - q[3].x) < 0.5 && Math.abs(q[0].y + q[2].y - q[1].y - q[3].y) < 0.5){
    ctx.transform((q[1].x - q[0].x) / w, (q[1].y - q[0].y) / w, (q[3].x - q[0].x) / h, (q[3].y - q[0].y) / h, q[0].x, q[0].y); ctx.drawImage(F.c, 0, 0); ctx.restore(); return; }
  for(j = 0; j < n; j++){ v0 = j / n; v1 = (j + 1) / n;
    for(i = 0; i < n; i++){ u0 = i / n; u1 = (i + 1) / n; A = bil(q, u0, v0); B = bil(q, u1, v0); C = bil(q, u1, v1); D = bil(q, u0, v1);
      triDraw(ctx, F.c, { x: u0 * w, y: v0 * h }, { x: u1 * w, y: v0 * h }, { x: u1 * w, y: v1 * h }, A, B, C);
      triDraw(ctx, F.c, { x: u0 * w, y: v0 * h }, { x: u1 * w, y: v1 * h }, { x: u0 * w, y: v1 * h }, A, C, D); } }
  ctx.restore();
};
/* 把手(hs = 半徑,畫布單位) */
K.floatHandles = function(ctx, F, hs, mode, hot){
  var q = K.floatCorners(F), i, r = rotHandle(F, hs), e, lw = hs * 0.22;
  ctx.save(); ctx.lineWidth = lw; ctx.strokeStyle = '#2f7de1'; if(ctx.setLineDash) ctx.setLineDash([hs * 0.7, hs * 0.5]);
  ctx.beginPath(); ctx.moveTo(q[0].x, q[0].y); for(i = 1; i < 4; i++) ctx.lineTo(q[i].x, q[i].y); ctx.closePath(); ctx.stroke();
  if(ctx.setLineDash) ctx.setLineDash([]);
  if(mode !== 'dist'){ ctx.beginPath(); ctx.moveTo(r.bx, r.by); ctx.lineTo(r.x, r.y); ctx.stroke(); ctx.fillStyle = '#ffd93b'; ctx.beginPath(); ctx.arc(r.x, r.y, hs * 0.85, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#2b2335'; ctx.font = 'bold ' + (hs * 1.1) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('⟳', r.x, r.y + hs * 0.05); }
  for(i = 0; i < 4; i++){ ctx.fillStyle = hot === 'c' + i ? '#ff7a59' : (mode === 'dist' ? '#a36bff' : '#fff'); ctx.beginPath(); ctx.arc(q[i].x, q[i].y, hs * 0.8, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  if(mode === 'free'){ for(i = 0; i < 4; i++){ e = mid2(q[i], q[(i + 1) % 4]); ctx.fillStyle = hot === 'e' + i ? '#ff7a59' : '#e9f2ff'; ctx.fillRect(e.x - hs * 0.55, e.y - hs * 0.55, hs * 1.1, hs * 1.1); ctx.strokeRect(e.x - hs * 0.55, e.y - hs * 0.55, hs * 1.1, hs * 1.1); } }
  ctx.restore();
};
/* 套索路徑(畫的過程中) */
K.lassoDraw = function(ctx, pts, s){ if(!pts || pts.length < 2) return; var i; ctx.save(); ctx.lineWidth = 2.2 / s; ctx.strokeStyle = '#000'; if(ctx.setLineDash) ctx.setLineDash([7 / s, 5 / s]);
  ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); for(i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke();
  ctx.strokeStyle = '#fff'; ctx.lineDashOffset = 6 / s; ctx.stroke(); if(pts.length > 2){ ctx.globalAlpha = 0.12; ctx.fillStyle = '#2f7de1'; ctx.closePath(); ctx.fill(); } ctx.restore(); };

/* ══ 3 色彩選擇器:外圍環 = 色相、裡面三角形 = 明度+彩度(白/黑/純色三個角)══
   K.wheel(parent, { size, hex, onChange(hex, final), gray:false })
   回傳 { set(hex), get(), el, destroy() };正在拖的時候外面 set 不會打斷手指 */
K.wheel = function(parent, o){
  o = o || {};
  var W = { h: 0, s: 1, v: 1, drag: null, dead: false }, cv = document.createElement('canvas'), x, N, dpr = Math.min(2, window.devicePixelRatio || 1), ring = null, R0, R1, RT, cx, cy;
  cv.style.cssText = 'display:block;width:100%;aspect-ratio:1/1;touch-action:none;cursor:crosshair;max-width:' + (o.max || 260) + 'px;margin:0 auto';
  parent.appendChild(cv); W.el = cv;
  function size(){ var w = cv.clientWidth || o.size || 180; N = Math.max(80, Math.round(w * dpr)); if(cv.width !== N){ cv.width = N; cv.height = N; ring = null; } cx = N / 2; cy = N / 2; R1 = N / 2 - 1; R0 = R1 * 0.80; RT = R0 * 0.93; x = cv.getContext('2d'); }
  function mkRing(){ var c = document.createElement('canvas'), rx, id, d, i, j, dx, dy, r, h, col, q; c.width = N; c.height = N; rx = c.getContext('2d'); id = rx.createImageData(N, N); d = id.data;
    for(j = 0; j < N; j++){ for(i = 0; i < N; i++){ dx = i + 0.5 - cx; dy = j + 0.5 - cy; r = Math.sqrt(dx * dx + dy * dy); if(r < R0 - 1 || r > R1 + 1) continue;
      h = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360; col = K.hex2rgb(K.hsv2hex(h, 1, 1)); q = (j * N + i) * 4; d[q] = col[0]; d[q + 1] = col[1]; d[q + 2] = col[2];
      d[q + 3] = Math.round(255 * clamp(Math.min(r - R0 + 1, R1 + 1 - r), 0, 1)); } }
    rx.putImageData(id, 0, 0); ring = c; }
  function verts(){ var a = W.h * Math.PI / 180; return [{ x: cx + Math.cos(a) * RT, y: cy + Math.sin(a) * RT }, { x: cx + Math.cos(a + 2.0944) * RT, y: cy + Math.sin(a + 2.0944) * RT }, { x: cx + Math.cos(a + 4.18879) * RT, y: cy + Math.sin(a + 4.18879) * RT }]; }   /* 純色、白、黑 */
  function bary(p, V){ var a = V[0], b = V[1], c = V[2], den = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y), l1 = ((b.y - c.y) * (p.x - c.x) + (c.x - b.x) * (p.y - c.y)) / den, l2 = ((c.y - a.y) * (p.x - c.x) + (a.x - c.x) * (p.y - c.y)) / den; return [l1, l2, 1 - l1 - l2]; }
  function triImg(){ var V = verts(), mnx = Math.floor(Math.min(V[0].x, V[1].x, V[2].x)), mxx = Math.ceil(Math.max(V[0].x, V[1].x, V[2].x)), mny = Math.floor(Math.min(V[0].y, V[1].y, V[2].y)), mxy = Math.ceil(Math.max(V[0].y, V[1].y, V[2].y)),
      w = mxx - mnx + 1, h = mxy - mny + 1, id = x.createImageData(w, h), d = id.data, i, j, b, hc = K.hex2rgb(K.hsv2hex(W.h, 1, 1)), q, e, al;
    for(j = 0; j < h; j++){ for(i = 0; i < w; i++){ b = bary({ x: mnx + i + 0.5, y: mny + j + 0.5 }, V); e = Math.min(b[0], b[1], b[2]); if(e < -0.012) continue;
      al = clamp((e + 0.012) / 0.012, 0, 1); b[0] = Math.max(0, b[0]); b[1] = Math.max(0, b[1]); b[2] = Math.max(0, b[2]); var sm = b[0] + b[1] + b[2]; b[0] /= sm; b[1] /= sm;
      q = (j * w + i) * 4; d[q] = Math.round(hc[0] * b[0] + 255 * b[1]); d[q + 1] = Math.round(hc[1] * b[0] + 255 * b[1]); d[q + 2] = Math.round(hc[2] * b[0] + 255 * b[1]); d[q + 3] = Math.round(255 * al); } }
    var c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').putImageData(id, 0, 0); return { c: c, x: mnx, y: mny }; }
  function paint(){ if(W.dead) return; size(); if(!ring) mkRing(); x.clearRect(0, 0, N, N); x.drawImage(ring, 0, 0);
    var T = triImg(), V = verts(), a = W.h * Math.PI / 180, rm = (R0 + R1) / 2, px, py, lw = Math.max(2, N / 90);
    x.drawImage(T.c, T.x, T.y);
    x.lineWidth = lw; x.strokeStyle = '#fff'; x.beginPath(); x.arc(cx + Math.cos(a) * rm, cy + Math.sin(a) * rm, (R1 - R0) * 0.52, 0, Math.PI * 2); x.stroke(); x.strokeStyle = 'rgba(0,0,0,.6)'; x.lineWidth = lw * 0.5; x.stroke();
    px = V[0].x * W.v * W.s + V[1].x * W.v * (1 - W.s) + V[2].x * (1 - W.v); py = V[0].y * W.v * W.s + V[1].y * W.v * (1 - W.s) + V[2].y * (1 - W.v);
    x.lineWidth = lw; x.strokeStyle = W.v > 0.55 && W.s < 0.6 ? '#222' : '#fff'; x.beginPath(); x.arc(px, py, N / 30, 0, Math.PI * 2); x.stroke(); }
  function pos(e){ var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * N / (r.width || 1), y: (e.clientY - r.top) * N / (r.height || 1) }; }
  function svAt(p){ var V = verts(), b = bary(p, V), sm, v, s;
    b[0] = Math.max(0, b[0]); b[1] = Math.max(0, b[1]); b[2] = Math.max(0, b[2]); sm = b[0] + b[1] + b[2] || 1; b[0] /= sm; b[1] /= sm; b[2] /= sm;
    v = clamp(b[0] + b[1], 0, 1); s = v > 0.001 ? clamp(b[0] / v, 0, 1) : 0; W.s = s; W.v = v; }
  function emit(fin){ if(o.onChange) o.onChange(K.hsv2hex(W.h, W.s, W.v), !!fin); }
  function act(e, fin){ var p = pos(e); if(W.drag === 'h'){ W.h = (Math.atan2(p.y - cy, p.x - cx) * 180 / Math.PI + 360) % 360; if(W.s < 0.02 && W.v > 0.98){ W.s = 1; } } else svAt(p); paint(); emit(fin); }
  cv.addEventListener('pointerdown', function(e){ e.preventDefault(); e.stopPropagation(); size(); var p = pos(e), r = Math.sqrt((p.x - cx) * (p.x - cx) + (p.y - cy) * (p.y - cy));
    W.drag = r >= R0 - N * 0.02 ? 'h' : 'sv'; try{ cv.setPointerCapture(e.pointerId); }catch(_){} act(e, false); });
  cv.addEventListener('pointermove', function(e){ if(!W.drag) return; e.preventDefault(); act(e, false); });
  function up(e){ if(!W.drag) return; act(e, true); W.drag = null; }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', function(){ W.drag = null; });
  W.set = function(hex){ if(W.drag) return; var hv = K.hex2hsv(hex); if(hv.s > 0.01 && hv.v > 0.01) W.h = hv.h; W.s = hv.s; W.v = hv.v; paint(); };
  W.get = function(){ return K.hsv2hex(W.h, W.s, W.v); };
  W.paint = paint;
  W.destroy = function(){ W.dead = true; if(cv.parentNode) cv.parentNode.removeChild(cv); };
  W.set(o.hex || '#2e6fd8');
  setTimeout(paint, 0); setTimeout(paint, 120);
  return W;
};
/* 彈出式色彩選擇器(美術設計師的形狀填色/外框色等用):K.wheelPop(hex, cb(hex), title) */
K.wheelPop = function(hex, cb, title, anchor){
  var m = document.createElement('div'), box, w, cur = hex, sw;
  m.style.cssText = 'position:fixed;inset:0;z-index:99990;background:rgba(20,16,30,.45);display:flex;align-items:safe center;justify-content:center';
  m.innerHTML = '<div style="background:#fff9ef;color:#2b2335;border:.5vmin solid #3a2f45;border-radius:2vmin;padding:2vmin;width:min(46vmin,86vw);max-height:min(92dvh,92vh);overflow-y:auto;box-sizing:border-box;font:900 clamp(13px,2.2vmin,20px) sans-serif;text-align:center">'
    + '<div style="margin-bottom:1vmin">' + (title || '🎨 選顏色') + '</div><div class="pkw"></div><div style="display:flex;gap:1vmin;align-items:center;justify-content:center;margin-top:1vmin"><span class="pksw" style="width:5vmin;height:5vmin;border-radius:1vmin;border:.3vmin solid #3a2f45;display:inline-block"></span><span class="pkhx"></span></div>'
    + '<div style="display:flex;gap:1.4vmin;justify-content:center;margin-top:1.4vmin"><button class="pkno" style="font:inherit;padding:1vmin 2.4vmin;border-radius:1.4vmin;border:.35vmin solid #3a2f45;background:#fff">取消</button><button class="pkok" style="font:inherit;padding:1vmin 2.4vmin;border-radius:1.4vmin;border:.35vmin solid #3a2f45;background:#7be07b">✅ 用這個顏色</button></div></div>';
  document.body.appendChild(m);
  box = m.querySelector('.pkw'); sw = m.querySelector('.pksw');
  function show(){ sw.style.background = cur; m.querySelector('.pkhx').textContent = cur; }
  w = K.wheel(box, { hex: hex, onChange: function(h){ cur = h; show(); } }); show();
  function close(){ w.destroy(); if(m.parentNode) m.parentNode.removeChild(m); }
  m.querySelector('.pkno').onclick = function(e){ e.stopPropagation(); close(); };
  m.querySelector('.pkok').onclick = function(e){ e.stopPropagation(); close(); cb(cur); };
  m.addEventListener('pointerdown', function(e){ if(e.target === m) close(); });
  return m;
};

/* ══ 1 拖顏色:按住色票拖到畫布上放開 = 油漆桶;拖到畫布上停住不放 0.5 秒 ⇒ 先預覽,左右滑動改臨界值,放開才定案 ══
   K.colorDrag({ root, colorOf(el)→hex 或 null, over(cx,cy)→true/false, preview(cx,cy,hex,tol), adjust(tol), drop(cx,cy,hex,tol,held), cancel(), tol()→目前臨界值 })
   短按(沒拖動)照舊是點選顏色(不攔 click);有拖動才把接下來那一下 click 吃掉 */
K.colorDrag = function(o){
  var D = null, ghost = null, lab = null, eat = false;
  function mkGhost(hex){ ghost = document.createElement('div'); ghost.style.cssText = 'position:fixed;z-index:99995;width:7vmin;height:7vmin;margin:-3.5vmin 0 0 -3.5vmin;border-radius:50%;border:.5vmin solid #fff;box-shadow:0 0 0 .3vmin #3a2f45,0 .8vmin 2vmin rgba(0,0,0,.4);pointer-events:none;background:' + hex;
    lab = document.createElement('div'); lab.style.cssText = 'position:fixed;z-index:99995;pointer-events:none;transform:translate(-50%,-190%);background:#2b2335;color:#fff;font:900 clamp(12px,2vmin,18px) sans-serif;padding:.4vmin 1.2vmin;border-radius:1vmin;white-space:nowrap';
    lab.textContent = '🪣 拖到要填色的地方'; document.body.appendChild(ghost); document.body.appendChild(lab); }
  function place(x, y){ if(!ghost) return; ghost.style.left = x + 'px'; ghost.style.top = y + 'px'; lab.style.left = x + 'px'; lab.style.top = y + 'px'; }
  function clean(){ if(ghost && ghost.parentNode) ghost.parentNode.removeChild(ghost); if(lab && lab.parentNode) lab.parentNode.removeChild(lab); ghost = lab = null; if(D) clearTimeout(D.ht); D = null; }
  function down(e){ var t = e.target, hex = null; while(t && t !== o.root && hex == null){ hex = o.colorOf(t); t = t.parentNode; }
    if(!hex) return; D = { id: e.pointerId, sx: e.clientX, sy: e.clientY, hex: hex, on: false, held: false, tol0: o.tol(), x: e.clientX, y: e.clientY }; }
  function move(e){ if(!D || e.pointerId !== D.id) return; D.x = e.clientX; D.y = e.clientY;
    if(!D.on){ if(Math.abs(e.clientX - D.sx) + Math.abs(e.clientY - D.sy) < 12) return; D.on = true; mkGhost(D.hex); }
    if(e.cancelable) e.preventDefault();
    place(e.clientX, e.clientY);
    var ov = o.over(e.clientX, e.clientY);
    if(D.held){ var tol = clamp(Math.round(D.tol0 + (e.clientX - D.hx) / 3), 0, 100); if(tol !== D.tol){ D.tol = tol; o.adjust(tol); } lab.textContent = '↔ 臨界值 ' + tol + '%(放開就填好)'; return; }
    lab.textContent = ov ? '🪣 放開就填色(停住不動可以先預覽)' : '🪣 拖到要填色的地方';
    clearTimeout(D.ht);
    if(ov){ var cx = e.clientX, cy = e.clientY; D.ht = setTimeout(function(){ if(!D || D.held || !o.over(D.x, D.y) || Math.abs(D.x - cx) + Math.abs(D.y - cy) > 10) return; D.held = true; D.hx = D.x; D.tol = D.tol0; if(o.preview(D.x, D.y, D.hex, D.tol) === false){ D.held = false; return; } lab.textContent = '↔ 左右滑動調臨界值 ' + D.tol + '%'; }, 500); } }
  function up(e){ if(!D || e.pointerId !== D.id) return; var d = D;
    if(d.on){ eat = true; setTimeout(function(){ eat = false; }, 80);
      if(d.held) o.drop(e.clientX, e.clientY, d.hex, d.tol, true); else if(o.over(e.clientX, e.clientY)) o.drop(e.clientX, e.clientY, d.hex, d.tol0, false); }
    clean(); }
  function cancel(e){ if(!D || e.pointerId !== D.id) return; if(D.held && o.cancel) o.cancel(); clean(); }
  o.root.addEventListener('pointerdown', down, true);
  window.addEventListener('pointermove', move, { passive: false }); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', cancel);
  o.root.addEventListener('click', function(e){ if(eat){ e.stopPropagation(); e.preventDefault(); eat = false; } }, true);
  return { destroy: function(){ clean(); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', cancel); } };
};

/* ══ 浮動小工具列(臨界值條、變形工具列)— 掛在畫布區上方 ══ */
var BTN = 'font:900 clamp(12px,2vmin,18px) sans-serif;padding:.5vmin 1.1vmin;border-radius:1.2vmin;border:.3vmin solid #3a2f45;background:#fff;color:#2b2335;cursor:pointer;white-space:nowrap;touch-action:manipulation';
function bar(parent){ var b = document.createElement('div'); b.style.cssText = 'position:absolute;left:50%;top:1vmin;transform:translateX(-50%);z-index:30;display:flex;flex-wrap:wrap;gap:.6vmin;align-items:center;justify-content:center;max-width:96%;background:rgba(255,249,239,.97);border:.4vmin solid #3a2f45;border-radius:1.6vmin;padding:.6vmin 1vmin;box-shadow:0 .6vmin 1.6vmin rgba(0,0,0,.3);font:900 clamp(12px,2vmin,18px) sans-serif;color:#2b2335';
  b.addEventListener('pointerdown', function(e){ e.stopPropagation(); }); parent.appendChild(b); return b; }
/* 臨界值條:K.tolBar(parent, tol, onInput(tol), onDone()) */
K.tolBar = function(parent, tol, onInput, onDone){
  var b = bar(parent);
  b.innerHTML = '<span>🪣 臨界值</span><input type="range" min="0" max="100" value="' + tol + '" style="width:min(28vmin,40vw);touch-action:none"><span class="v" style="min-width:3.6em">' + tol + '%</span><span style="font-weight:700;opacity:.75;font-size:.85em">越大填越多</span><button style="' + BTN + ';background:#7be07b">✓ 好了</button>';
  var r = b.querySelector('input'), v = b.querySelector('.v'), T = { el: b };
  r.oninput = function(){ v.textContent = r.value + '%'; onInput(+r.value); };
  b.querySelector('button').onclick = function(e){ e.stopPropagation(); T.close(); };
  T.close = function(){ if(b.parentNode) b.parentNode.removeChild(b); if(onDone) onDone(); onDone = null; };
  T.set = function(t){ r.value = t; v.textContent = t + '%'; };
  return T;
};
/* 變形工具列:K.xformBar(parent, { mode, layers:[{i,n}], target, cut:true/false, onMode, onFlip, onRot, onTarget, onNew, onOk, onCancel }) */
K.xformBar = function(parent, o){
  var b = bar(parent), X = { el: b };
  function paint(){ var h = '<span>' + (o.cut ? '✂️ 剪下來了' : '⤡ 變形') + '</span>', i, M = [['uni', '等比'], ['free', '自由'], ['dist', '扭曲']];
    for(i = 0; i < M.length; i++) h += '<button data-xm="' + M[i][0] + '" style="' + BTN + (o.mode === M[i][0] ? ';background:#ffd93b;box-shadow:0 0 0 .3vmin #ff7a59' : '') + '">' + M[i][1] + '</button>';
    h += '<button data-xa="fh" style="' + BTN + '" title="左右翻面">↔</button><button data-xa="fv" style="' + BTN + '" title="上下翻面">↕</button><button data-xa="r90" style="' + BTN + '" title="轉 90 度">⟳90°</button>';
    h += '<span style="margin-left:.6vmin">放到 📚</span>';
    for(i = 0; i < o.layers.length; i++) h += '<button data-xt="' + o.layers[i].i + '" style="' + BTN + (o.target === o.layers[i].i ? ';background:#9fd3ff;box-shadow:0 0 0 .3vmin #2f7de1' : '') + '">' + String(o.layers[i].n).replace(/</g, '&lt;') + '</button>';
    if(o.onNew) h += '<button data-xa="new" style="' + BTN + '">＋新圖層</button>';
    h += '<button data-xa="no" style="' + BTN + ';background:#ffd0d0">✖ 取消</button><button data-xa="ok" style="' + BTN + ';background:#7be07b">✅ 完成</button>';
    b.innerHTML = h; }
  b.onclick = function(e){ var t = e.target, k; while(t && t !== b && !(t.getAttribute && (t.getAttribute('data-xm') || t.getAttribute('data-xa') || t.getAttribute('data-xt') != null))) t = t.parentNode; if(!t || t === b) return; e.stopPropagation();
    if(t.getAttribute('data-xm')){ o.mode = t.getAttribute('data-xm'); paint(); if(o.onMode) o.onMode(o.mode); return; }
    if(t.getAttribute('data-xt') != null){ o.target = +t.getAttribute('data-xt'); paint(); if(o.onTarget) o.onTarget(o.target); return; }
    k = t.getAttribute('data-xa');
    if(k === 'fh' || k === 'fv'){ if(o.onFlip) o.onFlip(k === 'fh' ? 'h' : 'v'); } else if(k === 'r90'){ if(o.onRot) o.onRot(); } else if(k === 'new'){ if(o.onNew) o.onNew(); } else if(k === 'no'){ if(o.onCancel) o.onCancel(); } else if(k === 'ok'){ if(o.onOk) o.onOk(); } };
  X.set = function(k, v){ o[k] = v; paint(); };
  X.close = function(){ if(b.parentNode) b.parentNode.removeChild(b); };
  paint();
  return X;
};
/* 拖到圖層列上:回傳指到的圖層編號(元素要有 attr 屬性),沒有就 null */
K.layerAt = function(cx, cy, attr){ var el = document.elementFromPoint ? document.elementFromPoint(cx, cy) : null; while(el && el.getAttribute){ if(el.getAttribute(attr) != null) return +el.getAttribute(attr); el = el.parentNode; } return null; };

/* ══ 圖層「⋯」選單的說明(老師 18:44「圖層新增右側功能鍵可開啟下拉視窗:透明度、參照、阿爾法鎖定。都有 ? 可開啟說明視窗。參考 procreate」)══ */
K.layerHelp = {
  op: { t: '🔅 透明度', c: '讓這一整個圖層變淡。拉到左邊越透明,看得到下面的圖層;拉回 100% 就恢復。圖層裡畫的東西不會被改掉,隨時可以調回來。小技巧:把草稿圖層調淡,在上面新增一個圖層描出乾淨的線條。',
        p: '調整整個圖層的不透明度,數值越低越透明,可透出下方圖層;僅改變顯示與合成,不會改變圖層內容,可隨時調回。常用於將草稿圖層調淡後於上方描線。' },
  ref: { t: '🎯 參照', c: '把線稿圖層設成「參照」後,用 🪣 油漆桶填色時,電腦只看這個圖層的線條來決定要填的範圍,但顏色會塗在你目前選的圖層。這樣就能把線條和顏色分開放:線條在上面一層、顏色在下面一層,塗錯也不會弄髒線條。同時只能有一個參照圖層。',
         p: '將線稿圖層設為「參照」後,油漆桶將僅依此圖層的線條判斷填色範圍,顏色則填入目前選取的圖層,可將線稿與上色分層處理。同一時間僅能有一個參照圖層。' },
  lk: { t: '🔒 阿爾法鎖定', c: '打開後,這個圖層只能畫在「本來就有顏色的地方」,空白的地方畫不上去。很適合幫畫好的形狀換顏色、加陰影或花紋,完全不會塗出界!鎖定時不能用橡皮擦;想再畫到外面,把鎖打開就好。',
        p: '開啟後僅能在圖層既有像素上繪製,透明區域不受影響,適合為既有形狀改色、加陰影或紋理而不超出邊界;鎖定期間無法使用橡皮擦。' }
};
K.helpHtml = function(k, style){ var h = K.layerHelp[k]; if(!h) return ''; return '<h3>' + h.t + '</h3><p style="line-height:1.7">' + (style === 'p' ? h.p : h.c) + '</p>'; };
window.MGPK = K;
})();
