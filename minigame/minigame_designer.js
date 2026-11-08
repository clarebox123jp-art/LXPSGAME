/* ══════════════════════════════════════════════════════════════════════════
 * 🎨 遊戲美術設計師 引擎 minigame_designer.js(ES5 only — 無箭頭函式/let/const/樣板字面值/?.)
 * 由 minigame_index.html?mode=designer 直入時才載入;登入/Firebase/音效透過 window.MG_ART_BRIDGE(與創藝工坊共用)。
 * 設計書:claude/遊戲美術設計師_設計書.md;交接:claude/遊戲美術設計師_MEMORY_HANDOFF.md
 *
 * ★ v1.0.0(2026-11-07・老師「依建議」+ 13:29 補充)第一階段:
 *   ①設計器:角色皮膚(4 體型+對齊部件 8 類+武器/寵物/配件/飾品自由擺放)、荒島裝飾(荒島裝飾/動物/小物/工具組合)、
 *     🔤 文字貼片(招牌/旗幟/服裝印字/武器刻字,打字就檢查不雅字)、🖌 畫筆層、復原/重做 30 步
 *   ②存檔:本機 IndexedDB(自動)+ 每 5 分鐘備份雲端 Storage designDrafts/{uid}/;「💾 存檔」與「📤 確認繳交」是兩顆鈕
 *   ③基本品質門檻(達標才能繳交,清楚列出差在哪):操作 ≥100 次、圖案範圍 ≥70%、上色比例、顏色數;皮膚不可光頭
 *   ④規範提醒卡 → 智慧審核(不雅字詞+全校同學姓名、Cloud Vision SafeSearch+文字辨識:招牌/旗幟/服裝/刻字以外不可有字)
 *     → 沒通過不上傳、寫 designFlags 給老師;老師「☑ 當面確認通過」= designPass,該版本即可繳交
 *   ⑤繳交:每人每月 1 件(designSubmit/{YYYYMM}_{uid},月份=伺服器 UTC 月 = 台北每月 1 日 08:00 換月);繳交後鎖定,
 *     老師退件(附建議)才能改、再繳交;老師台 📦 倉庫 通過上架 → designShopItems(貨架在第二/三階段)
 * 共用平板:身分只認 Firebase uid;草稿鍵 <uid>|<id>;每次寫雲端前比對目前登入 uid;別人 7 天前的草稿自動清(只清草稿)。
 * ══════════════════════════════════════════════════════════════════════════ */
(function(){
'use strict';
if(window.DSGW) return;
var VER = 'v1.0.3';   /* ★ v1.0.3(2026-11-08 11:03)手繪原創:皮膚只留畫筆+動作骨架、荒島裝飾素材收進參考圖片(描圖層不進作品)、預設畫筆、回工作室先命名、作品集可改名 */ void 'v1.0.2';   /* ★ v1.0.2(2026-11-08 10:51)操作次數算「增加、變色」,且改完要跟原本不一樣(見 endOp/opKey) */ void 'v1.0.1';   /* ★ v1.0.1(2026-11-08)操作次數只算「增加」的動作(見 endOp) */ void 'v1.0.0';
var D = window.DSG_DB;
var B = window.MG_ART_BRIDGE || {};
var S = { on: false, uid: '', guest: true, cfg: null, vkey: '', xwords: [], names: null, style: 'c', ed: null, gmTab: 'flag' };

/* ── 小工具 ── */
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function toast(m){ try{ if(B.toast) B.toast(m); }catch(e){} }
function sfx(id, v){ try{ if(B.sfx) B.sfx(id, v); }catch(e){} }
function user(){ try{ return B.user ? B.user() : null; }catch(e){ return null; } }
function uName(u){ var n = ''; if(!u) return ''; try{ if(window.mgPlayerFull) n = window.mgPlayerFull(u) || ''; }catch(e){} return n || u.displayName || u.email || ''; }
function isGm(){ var u = user(); return !!(u && u.email && D.GM_EMAILS.indexOf(String(u.email).toLowerCase()) >= 0); }
function T(o){ if(!o) return ''; if(typeof o === 'string') return o; return (S.style === 'p' && o.p) ? o.p : (o.c || o.p || ''); }
function now(){ return Date.now(); }
function clamp(v, a, b){ return v < a ? a : (v > b ? b : v); }
function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }
function fb(){ try{ return B.fbNow ? B.fbNow() : null; }catch(e){ return null; } }
function FV(){ try{ return window.firebase.firestore.FieldValue; }catch(e){ return null; } }
function ownerOk(){ var u = user(); return !S.guest && !!(u && u.uid === S.uid); }
function rid(){ return 'w' + now().toString(36) + Math.random().toString(36).slice(2, 6); }
function loadJs(src, cb){ var s = document.createElement('script'), fin = false; function f(ok){ if(fin) return; fin = true; cb(ok); } s.src = src; s.async = true; s.onload = function(){ f(true); }; s.onerror = function(){ f(false); }; document.head.appendChild(s); setTimeout(function(){ f(false); }, 15000); }

/* ── 伺服器時間(HTTP Date 標頭對時,與創藝工坊同法;不信平板時鐘) ── */
var SRV = { off: 0, ok: false, at: 0 };
try{ (function(){ var o = JSON.parse(localStorage.getItem('art_srv_off') || 'null'); if(o && typeof o.off === 'number' && Date.now() - o.at < 6 * 3600000){ SRV.off = o.off; SRV.ok = true; SRV.at = o.at; } })(); }catch(_so){}
function srvNow(){ return now() + SRV.off; }
function srvSync(cb){
  var fin = false, t0 = now(), x;
  function done(){ if(fin) return; fin = true; if(cb) cb(SRV.ok); }
  if(SRV.ok && now() - SRV.at < 6 * 3600000){ done(); return; }
  try{
    x = new XMLHttpRequest(); x.open('HEAD', 'minigame_designer_db.js?srv=' + t0, true); x.timeout = 4000;
    x.onload = function(){ var d = Date.parse(x.getResponseHeader('Date') || ''), t1 = now();
      if(d > 1.6e12){ SRV.off = Math.round(d + 500 - (t0 + t1) / 2); SRV.ok = true; SRV.at = t1; lsSet('art_srv_off', JSON.stringify({ off: SRV.off, at: t1 })); } done(); };
    x.onerror = x.ontimeout = done; x.send();
  }catch(e){ done(); }
}
/* 月份鍵:伺服器時間的 UTC 年月(台北每月 1 日 08:00 = UTC 1 日 00:00 ⇒ 剛好在老師要的時間換月) */
function ymOf(t){ var d = new Date(t || srvNow()); return String(d.getUTCFullYear() * 100 + d.getUTCMonth() + 1); }
function resetInfo(){ var d = new Date(srvNow()), nx = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1), m = new Date(nx).getUTCMonth() + 1, left = nx - srvNow();
  return { m: m, days: Math.floor(left / 86400000), hrs: Math.floor((left % 86400000) / 3600000) }; }
function ymLabel(ym){ ym = String(ym || ''); return ym.length === 6 ? (ym.slice(0, 4) + ' 年 ' + (+ym.slice(4)) + ' 月') : ym; }

/* ── GM 開關 gameConfig/designerAccess {open, guest, q:{skin:{…},deco:{…}}, vth:{…}} ── */
var ACC_KEY = 'lxps_dsg_access_cache';
function accCache(){ var o = null; try{ o = JSON.parse(lsGet(ACC_KEY) || 'null'); }catch(e){} return (o && o.at && now() - o.at < 14 * 86400000) ? o.c : null; }
function accCfg(){ return S.cfg || accCache() || {}; }
function dsgOpen(){ var c = accCfg(); return (typeof c.open === 'boolean') ? c.open : !!D.OPEN; }
function qOf(kind){ var b = D.QUALITY[kind], c = (accCfg().q || {})[kind] || {}, o = {}, k; for(k in b){ if(b.hasOwnProperty(k)) o[k] = (typeof c[k] === 'number') ? c[k] : b[k]; } return o; }
function vth(){ var c = accCfg().vth || {}, o = {}, k; for(k in D.VTH_DEF){ if(D.VTH_DEF.hasOwnProperty(k)) o[k] = (c[k] >= 2 && c[k] <= 5) ? c[k] : D.VTH_DEF[k]; } return o; }
function accFetch(cb){
  var f = fb(), n = 0, done = false, t;
  function fin(){ if(done) return; done = true; clearTimeout(t); cb(); }
  function one(){ n--; if(n <= 0) fin(); }
  if(!f || !f.db || !user()){ fin(); return; }
  t = setTimeout(fin, 3500); n = 3;
  try{
    f.db.collection('gameConfig').doc('designerAccess').get().then(function(d){ if(d && d.exists){ S.cfg = d.data() || {}; lsSet(ACC_KEY, JSON.stringify({ at: now(), c: S.cfg })); } one(); })['catch'](one);
    f.db.collection('gameConfig').doc('designerVision').get().then(function(d){ S.vkey = (d && d.exists && d.data().key) ? String(d.data().key) : ''; one(); })['catch'](one);
    f.db.collection('gameConfig').doc('designerWords').get().then(function(d){ var l = (d && d.exists && d.data().list) || []; S.xwords = (l && l.length) ? l.slice(0, 2000) : []; one(); })['catch'](one);
  }catch(e){ fin(); }
}

/* ══ 本機草稿 IndexedDB lxps_dsg / d,鍵 <uid>|<id>(訪客 guest|) ══ */
var IDB = null;
function idb(cb){
  if(IDB){ cb(IDB); return; }
  try{ var r = indexedDB.open('lxps_dsg', 1);
    r.onupgradeneeded = function(){ try{ r.result.createObjectStore('d'); }catch(e){} };
    r.onsuccess = function(){ IDB = r.result; cb(IDB); }; r.onerror = function(){ cb(null); };
  }catch(e){ cb(null); }
}
function idbPut(k, v, cb){ idb(function(db){ if(!db){ if(cb) cb(false); return; } try{ var tx = db.transaction('d', 'readwrite'); tx.objectStore('d').put(v, k); tx.oncomplete = function(){ if(cb) cb(true); }; tx.onerror = function(){ if(cb) cb(false); }; }catch(e){ if(cb) cb(false); } }); }
function idbDel(k, cb){ idb(function(db){ if(!db){ if(cb) cb(); return; } try{ var tx = db.transaction('d', 'readwrite'); tx.objectStore('d')['delete'](k); tx.oncomplete = function(){ if(cb) cb(); }; tx.onerror = function(){ if(cb) cb(); }; }catch(e){ if(cb) cb(); } }); }
function idbAll(cb){ idb(function(db){ var out = []; if(!db){ cb(out); return; } try{ var tx = db.transaction('d', 'readonly'), cur = tx.objectStore('d').openCursor();
  cur.onsuccess = function(){ var c = cur.result; if(c){ out.push({ k: String(c.key), v: c.value }); c['continue'](); } else cb(out); }; cur.onerror = function(){ cb(out); }; }catch(e){ cb(out); } }); }
function myKey(id){ return (S.guest ? 'guest' : S.uid) + '|' + id; }
function myDrafts(cb){ var pre = (S.guest ? 'guest' : S.uid) + '|'; idbAll(function(a){ var o = [], i; for(i = 0; i < a.length; i++){ if(a[i].k.indexOf(pre) === 0 && a[i].v && a[i].v.d) o.push(a[i].v); } o.sort(function(x, y){ return (y.at || 0) - (x.at || 0); }); cb(o); }); }
/* 別人的草稿 7 天沒動就清掉(只清草稿,素材快取完全不碰) */
function idbSweep(){ var pre = (S.guest ? 'guest' : S.uid) + '|'; idbAll(function(a){ var i; for(i = 0; i < a.length; i++){ if(a[i].k.indexOf(pre) !== 0 && a[i].v && now() - (a[i].v.at || 0) > 7 * 86400000) idbDel(a[i].k); } }); }

/* ══ Firebase Storage(作品圖、草稿雲端備份) ══ */
function sto(cb){
  var f = fb();
  if(!f || !f.app || !window.firebase){ cb(null); return; }
  if(S.sto){ cb(S.sto); return; }
  function mk(){ try{ S.sto = window.firebase.storage(f.app); }catch(e){ S.sto = null; } cb(S.sto); }
  if(window.firebase.storage) mk(); else loadJs((B.fbBase ? B.fbBase() : 'https://www.gstatic.com/firebasejs/10.12.0/') + 'firebase-storage-compat.js', function(ok){ if(ok && window.firebase.storage) mk(); else cb(null); });
}

/* ══ 名冊(全校同學全名 → 不可出現在作品文字裡;班級給老師台看) ══ */
function rosterLoad(cb){
  if(window._STUDENT_ROSTER){ rosterNames(); if(cb) cb(); return; }
  if(S.rosterTried){ if(cb) cb(); return; } S.rosterTried = true;
  loadJs('../student_roster.js?v=' + ymOf(), function(){ rosterNames(); if(cb) cb(); });
}
function rosterNames(){ var R = window._STUDENT_ROSTER, k, n, o = []; if(!R || S.names) return; for(k in R){ if(R.hasOwnProperty(k) && R[k] && R[k].fullName){ n = norm(R[k].fullName).c; if(n.length >= 2) o.push(n); } } S.names = o; }
function clsOf(){ var u = user(), R = window._STUDENT_ROSTER, r = null; try{ r = R && u && u.email ? R[String(u.email).toLowerCase()] : null; }catch(e){} return r && r['class'] ? String(r['class']) : ''; }

/* ══ 文字審核(任何語言):正規化 → CJK 子字串/拉丁整字/同學全名 ══ */
var LATIN = {}, i0; for(i0 = 0; i0 < D.WORDS_LATIN.length; i0++) LATIN[D.WORDS_LATIN[i0]] = 1;
var LATIN_STRONG = ['fuck', 'shit', 'bitch', 'cunt', 'porn', 'penis', 'vagina', 'nigger', 'nigga', 'asshole', 'pussy'];
function norm(s){
  var a = String(s || ''), o = '', i, c, ch;
  for(i = 0; i < a.length; i++){ c = a.charCodeAt(i);
    if(c >= 0xFF01 && c <= 0xFF5E) c -= 0xFEE0;
    if(c === 0x3000) c = 32;
    ch = String.fromCharCode(c).toLowerCase();
    if(D.S2T[ch]) ch = D.S2T[ch];
    o += ch; }
  return { s: o, c: o.replace(/[^0-9a-z぀-ヿ㄀-ㄯ㐀-鿿豈-﫿가-힯]/g, '') };
}
function wordHits(str){
  var n = norm(str), hits = [], i, w, toks, xw = S.xwords || [], nm = S.names || [];
  if(!n.c) return hits;
  for(i = 0; i < D.WORDS_CJK.length; i++){ if(n.c.indexOf(D.WORDS_CJK[i]) >= 0) hits.push(D.WORDS_CJK[i]); }
  toks = n.s.split(/[^0-9a-z]+/);
  for(i = 0; i < toks.length; i++){ if(toks[i] && LATIN[toks[i]]) hits.push(toks[i]); }
  for(i = 0; i < LATIN_STRONG.length; i++){ if(n.c.indexOf(LATIN_STRONG[i]) >= 0 && hits.indexOf(LATIN_STRONG[i]) < 0) hits.push(LATIN_STRONG[i]); }
  for(i = 0; i < xw.length; i++){ w = norm(xw[i]).c; if(!w) continue;
    if(/^[0-9a-z]+$/.test(w)){ if(toks.indexOf(w) >= 0) hits.push(w); } else if(n.c.indexOf(w) >= 0) hits.push(w); }
  for(i = 0; i < nm.length; i++){ if(n.c.indexOf(nm[i]) >= 0){ hits.push('〔同學姓名〕'); break; } }
  return hits;
}

/* ══ 圖片 ══ */
function srcUrl(src){
  var p = String(src).split(':'), k = p.slice(1).join(':');
  if(p[0] === 'av') return '../avatar_parts/' + encodeURIComponent(k) + '.png';
  if(p[0] === 'isl'){ try{ if(window.mgPicUrl) return window.mgPicUrl('island_' + k + '.png'); }catch(e){} return 'img/island_' + encodeURIComponent(k) + '.png'; }
  return '';
}
var IMG = {};
function imgGet(src, cb){
  var o = IMG[src];
  if(o && o.ok){ cb(o.im); return; }
  if(o){ o.q.push(cb); return; }
  o = IMG[src] = { ok: false, q: [cb], im: new Image() };
  o.im.onload = function(){ o.ok = true; var q = o.q; o.q = []; for(var i = 0; i < q.length; i++) q[i](o.im); };
  o.im.onerror = function(){ var q = o.q; o.q = []; delete IMG[src]; for(var i = 0; i < q.length; i++) q[i](null); };
  o.im.src = srcUrl(src);
}
/* 色調(與 CSS hue-rotate + brightness 同一套矩陣;舊 iPad 的 canvas 沒有 ctx.filter,所以匯出時自己算) */
function tintCv(im, h, b){
  var c = document.createElement('canvas'), x, d, i, r, g, bl, cs, sn, m;
  c.width = im.naturalWidth || im.width; c.height = im.naturalHeight || im.height;
  x = c.getContext('2d'); x.drawImage(im, 0, 0);
  if(!h && (b == null || b === 1)) return c;
  d = x.getImageData(0, 0, c.width, c.height);
  cs = Math.cos((h || 0) * Math.PI / 180); sn = Math.sin((h || 0) * Math.PI / 180); b = b == null ? 1 : b;
  m = [0.213 + cs * 0.787 - sn * 0.213, 0.715 - cs * 0.715 - sn * 0.715, 0.072 - cs * 0.072 + sn * 0.928,
       0.213 - cs * 0.213 + sn * 0.143, 0.715 + cs * 0.285 + sn * 0.140, 0.072 - cs * 0.072 - sn * 0.283,
       0.213 - cs * 0.213 - sn * 0.787, 0.715 - cs * 0.715 + sn * 0.715, 0.072 + cs * 0.928 + sn * 0.072];
  for(i = 0; i < d.data.length; i += 4){ if(!d.data[i + 3]) continue; r = d.data[i]; g = d.data[i + 1]; bl = d.data[i + 2];
    d.data[i] = clamp((m[0] * r + m[1] * g + m[2] * bl) * b, 0, 255); d.data[i + 1] = clamp((m[3] * r + m[4] * g + m[5] * bl) * b, 0, 255); d.data[i + 2] = clamp((m[6] * r + m[7] * g + m[8] * bl) * b, 0, 255); }
  x.putImageData(d, 0, 0); return c;
}
function hashStr(s){ var h1 = 0x811c9dc5, h2 = 0x01000193 ^ 0x5bd1e995, i, c; for(i = 0; i < s.length; i++){ c = s.charCodeAt(i); h1 ^= c; h1 = Math.imul ? Math.imul(h1, 16777619) : (h1 * 16777619) | 0; h2 ^= c; h2 = Math.imul ? Math.imul(h2, 2246822519 | 0) : (h2 * 2246822519) | 0; }
  return ('0000000' + (h1 >>> 0).toString(16)).slice(-8) + ('0000000' + (h2 >>> 0).toString(16)).slice(-8); }

/* ══ CSS(三平台:PC 預設、iPad、手機橫向最後) ══ */
var CSS = [
'#dsg-root{position:fixed;inset:0;z-index:8000;background:linear-gradient(160deg,#2b2335,#3d2f57 60%,#1f3a4f);color:#fff;font-family:"PingFang TC","Microsoft JhengHei",sans-serif;overflow:hidden;-webkit-user-select:none;user-select:none}',
'#dsg-root *{box-sizing:border-box}',
'html.dsg-mode #toast{z-index:9900 !important}html.dsg-mode #loading{z-index:9850 !important}html.dsg-mode #page-home,html.dsg-mode #topbar{display:none !important}',
'#dsg-root button,.dsg-m button{font-family:inherit;cursor:pointer;touch-action:manipulation}',
'.dsg-b{border:0;border-radius:1.4vmin;padding:1.1vmin 2vmin;font-size:2.3vmin;font-weight:900;background:#fff;color:#3d2f57;box-shadow:0 .5vmin 0 rgba(0,0,0,.25)}',
'.dsg-b:active{transform:translateY(.4vmin);box-shadow:0 .1vmin 0 rgba(0,0,0,.25)}',
'.dsg-b.go{background:linear-gradient(#ffd45a,#ff9f2a);color:#4a2a00}.dsg-b.blue{background:linear-gradient(#7fd0ff,#3b8fe0);color:#fff}.dsg-b.red{background:#e85a5a;color:#fff}.dsg-b.ghost{background:rgba(255,255,255,.18);color:#fff}',
'.dsg-b[disabled]{opacity:.45;pointer-events:none}',
/* 大廳 */
'#dsg-hub{position:absolute;inset:0;overflow-y:auto;padding:2.4vmin 3vmin calc(3vmin + env(safe-area-inset-bottom));-webkit-overflow-scrolling:touch}',
'#dsg-hub h1{margin:0 0 1.4vmin;font-size:4.2vmin}#dsg-hub .top{display:flex;gap:1.2vmin;align-items:center;flex-wrap:wrap}#dsg-hub .sp{flex:1}',
'.dsg-card{background:rgba(255,255,255,.12);border:.3vmin solid rgba(255,255,255,.25);border-radius:2vmin;padding:1.8vmin 2.2vmin;margin:1.4vmin 0;font-size:2.3vmin;line-height:1.5}',
'.dsg-card b{color:#ffe08a}.dsg-chip{display:inline-block;padding:.3vmin 1.2vmin;border-radius:2vmin;font-weight:900;font-size:2vmin;background:#fff;color:#333;margin-right:.6vmin}',
'.dsg-chip.pend{background:#ffd45a}.dsg-chip.back{background:#ff9f9f}.dsg-chip.live{background:#7be38a}.dsg-chip.flag{background:#ffb36b}.dsg-chip.none{background:#ddd}',
'.dsg-new{display:grid;grid-template-columns:1fr 1fr;gap:2vmin;margin:1.6vmin 0}',
'.dsg-new button{border:0;border-radius:2.4vmin;padding:2.6vmin;font-size:3.4vmin;font-weight:900;color:#fff;background:linear-gradient(135deg,#ff7aa8,#8a5cf0);box-shadow:0 .7vmin 0 rgba(0,0,0,.3);text-align:left}',
'.dsg-new button+button{background:linear-gradient(135deg,#43c59e,#2a7fd4)}.dsg-new small{display:block;font-size:2vmin;font-weight:700;opacity:.9;margin-top:.6vmin}',
'.dsg-drafts{display:grid;grid-template-columns:repeat(auto-fill,minmax(22vmin,1fr));gap:1.6vmin}',
'.dsg-dr{position:relative;background:rgba(255,255,255,.14);border-radius:1.8vmin;padding:1vmin;font-size:1.9vmin;text-align:center}',
'.dsg-dr .th{height:22vmin;border-radius:1.2vmin;background:#fff url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27%3E%3Crect width=%278%27 height=%278%27 fill=%27%23eee%27/%3E%3Crect x=%278%27 y=%278%27 width=%278%27 height=%278%27 fill=%27%23eee%27/%3E%3C/svg%3E");display:flex;align-items:center;justify-content:center;overflow:hidden}',
'.dsg-dr .x.rn{right:auto;left:.4vmin;background:rgba(40,90,200,.75)}.dsg-dr .th img{max-width:100%;max-height:100%}.dsg-dr .x{position:absolute;right:.4vmin;top:.4vmin;border:0;border-radius:50%;width:4.4vmin;height:4.4vmin;background:rgba(0,0,0,.55);color:#fff;font-size:2.2vmin}',
/* 編輯器 */
'#dsg-ed{position:absolute;inset:0;display:grid;grid-template-rows:auto 1fr;grid-template-columns:28vw 1fr 22vw}',
'#dsg-ed .bar{grid-column:1/4;display:flex;gap:1vmin;align-items:center;padding:1vmin calc(1.4vmin + env(safe-area-inset-right)) 1vmin calc(1.4vmin + env(safe-area-inset-left));background:rgba(0,0,0,.28)}',
'#dsg-ed .bar .t{font-weight:900;font-size:2.4vmin;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:26vw}#dsg-ed .bar .sp{flex:1}#dsg-ed .bar .ops{font-size:2vmin;opacity:.9;white-space:nowrap}',
'#dsg-ed .bar .dsg-b{font-size:2vmin;padding:.9vmin 1.4vmin}',
'#dsg-ed .lib{overflow:hidden;display:flex;flex-direction:column;background:rgba(0,0,0,.18);padding-left:env(safe-area-inset-left)}',
'#dsg-ed .tabs{display:flex;flex-wrap:wrap;gap:.6vmin;padding:1vmin}#dsg-ed .tabs button{border:0;border-radius:1.2vmin;padding:.8vmin 1vmin;font-size:1.9vmin;font-weight:900;background:rgba(255,255,255,.18);color:#fff}',
'#dsg-ed .tabs button.on{background:#ffd45a;color:#4a2a00}',
'#dsg-ed .lbody{flex:1;overflow-y:auto;padding:0 1vmin 2vmin;-webkit-overflow-scrolling:touch}',
'.dsg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(11vmin,1fr));gap:.8vmin}',
'.dsg-it{background:rgba(255,255,255,.9);border-radius:1.2vmin;height:11vmin;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#333;font-size:1.5vmin;overflow:hidden;padding:.4vmin}',
'.dsg-it img{max-width:90%;max-height:7.4vmin;pointer-events:none}.dsg-it span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}',
'.dsg-sec{font-weight:900;font-size:2vmin;margin:1.2vmin 0 .6vmin;color:#ffe08a}',
'.dsg-chips{display:flex;flex-wrap:wrap;gap:.6vmin}.dsg-chips button{border:0;border-radius:1.2vmin;padding:.7vmin 1.1vmin;font-size:1.8vmin;font-weight:800;background:rgba(255,255,255,.85);color:#333}',
'.dsg-chips button.on{background:#ffd45a;color:#4a2a00;box-shadow:0 0 0 .3vmin #fff inset}',
'#dsg-ed .mid{position:relative;overflow:hidden;touch-action:none}',
'#dsg-stage{position:absolute;left:0;top:0;transform-origin:0 0;background:#fff url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724%27 height=%2724%27%3E%3Crect width=%2712%27 height=%2712%27 fill=%27%23e9e9e9%27/%3E%3Crect x=%2712%27 y=%2712%27 width=%2712%27 height=%2712%27 fill=%27%23e9e9e9%27/%3E%3C/svg%3E");box-shadow:0 1vmin 3vmin rgba(0,0,0,.45);overflow:hidden}',
'#dsg-stage .ly{position:absolute;inset:0}#dsg-stage .ly>*{position:absolute;transform-origin:50% 50%}#dsg-stage .ly .slot{left:0;top:0;pointer-events:none;transform:none}',
'#dsg-stage .ly img{-webkit-user-drag:none;user-select:none}',
'#dsg-stage .txt{white-space:nowrap;line-height:1;text-align:center}',
'#dsg-paint{position:absolute;left:0;top:0;pointer-events:none}#dsg-stage.painting #dsg-paint{pointer-events:auto;cursor:crosshair}',
/* ★ 老師 13:35:三種創作風格(自由手繪/像素點陣/向量繪圖)+ 功能名稱標籤可隱藏 */
'#dsg-grid{position:absolute;left:0;top:0;pointer-events:none;display:none}#dsg-stage.pixmode #dsg-grid{display:block}',
'#dsg-guide{position:absolute;left:0;top:0;pointer-events:none}.dsg-ref{margin:.6vmin 0;background:rgba(255,255,255,.08);border-radius:1.2vmin;padding:.4vmin .8vmin}.dsg-ref summary{cursor:pointer;font-weight:900;font-size:2.1vmin;padding:.8vmin .2vmin}.dsg-it.on{outline:.5vmin solid #ffd23f}',   /* ★ v1.0.3 動作骨架/參考圖片(描圖用,不進作品) */
'#dsg-stage.vecmode{cursor:crosshair}#dsg-stage .ly svg{overflow:visible}',
'#dsg-stage.painting .ly{pointer-events:none}#dsg-stage.pbelow #dsg-paint{z-index:0}#dsg-stage.pbelow .ly{z-index:1}#dsg-grid{z-index:2}#dsg-sel{z-index:3}',
'.dsg-pm{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.6vmin;margin-bottom:1vmin}.dsg-pm button{border:0;border-radius:1.2vmin;padding:1vmin .4vmin;font-size:1.8vmin;font-weight:900;background:rgba(255,255,255,.18);color:#fff}.dsg-pm button.on{background:#ffd45a;color:#4a2a00}.dsg-pm b{display:block;font-size:3.4vmin}',
'#dsg-root.nolb .lb{display:none}#dsg-root.nolb .dsg-pm b{font-size:4vmin}',
'.dsg-tip{font-size:1.8vmin;opacity:.85;margin-top:1vmin}',
'@media (orientation:landscape) and (max-height:520px){.dsg-tip{font-size:2.7vmin}.dsg-pm button{font-size:2.7vmin}.dsg-pm b{font-size:4.4vmin}#dsg-ed .prop label{font-size:2.8vmin}}',
'#dsg-sel{position:absolute;border:3px dashed #ff3d8a;pointer-events:none;display:none;transform-origin:50% 50%}',
'#dsg-sel i{position:absolute;right:-22px;bottom:-22px;width:44px;height:44px;border-radius:50%;background:#ff3d8a;border:4px solid #fff;pointer-events:auto;touch-action:none;box-shadow:0 2px 6px rgba(0,0,0,.4)}',
'#dsg-ed .prop{overflow-y:auto;background:rgba(0,0,0,.18);padding:1.2vmin calc(1.2vmin + env(safe-area-inset-right)) 2vmin 1.2vmin;font-size:2vmin;-webkit-overflow-scrolling:touch}',
'#dsg-ed .prop label{display:block;margin:1vmin 0 .3vmin;font-weight:800}#dsg-ed .prop input[type=range]{width:100%;height:4vmin}',
'#dsg-ed .prop .row{display:flex;flex-wrap:wrap;gap:.6vmin;margin-top:1vmin}#dsg-ed .prop .row .dsg-b{font-size:1.8vmin;padding:.8vmin 1vmin}',
'#dsg-ed input[type=text],.dsg-m input[type=text],.dsg-m textarea,.dsg-m select,#dsg-ed select{font-size:2.2vmin;padding:.8vmin;border-radius:1vmin;border:0;width:100%;font-family:inherit}',
'.dsg-sw{display:inline-block;width:4.6vmin;height:4.6vmin;border-radius:50%;border:.4vmin solid #fff;margin:.3vmin}.dsg-sw.on{box-shadow:0 0 0 .5vmin #ffd45a}',
'#dsg-ed.locked .lib,#dsg-ed.locked .prop{opacity:.55;pointer-events:none}',
'.dsg-lockbar{position:absolute;left:50%;bottom:calc(2vmin + env(safe-area-inset-bottom));transform:translateX(-50%);background:rgba(0,0,0,.72);padding:1vmin 2vmin;border-radius:2vmin;font-size:2.1vmin;font-weight:800;white-space:nowrap;z-index:3}',
/* 視窗 */
'.dsg-m{position:fixed;inset:0;z-index:9500;background:rgba(10,6,20,.6);display:flex;align-items:safe center;justify-content:center;padding:2vmin}',
'.dsg-m .box{background:#fff;color:#2b2335;border-radius:2.4vmin;padding:2.6vmin 3vmin;width:min(92vw,110vmin);max-height:min(92dvh,92vh);overflow-y:auto;font-size:2.3vmin;line-height:1.55;box-sizing:border-box;-webkit-overflow-scrolling:touch}',
'.dsg-m h3{margin:0 0 1.2vmin;font-size:3.2vmin}.dsg-m .btns{display:flex;gap:1.2vmin;justify-content:flex-end;flex-wrap:wrap;margin-top:2vmin}',
'.dsg-m .dsg-b{font-size:2.3vmin}.dsg-m .dsg-b.ghost{background:#eee;color:#555}',
'.dsg-m .rl{display:flex;gap:1.2vmin;align-items:center;background:#fff4f4;border-radius:1.4vmin;padding:.9vmin 1.4vmin;margin:.6vmin 0}.dsg-m .rl b{color:#c0392b}',
'.dsg-m .qk{display:flex;gap:1vmin;align-items:flex-start;padding:.8vmin 0;border-bottom:1px dashed #ddd}.dsg-m .qk .ic{font-size:3vmin}.dsg-m .qk small{display:block;color:#7a6f86}',
'.dsg-m .ck{display:flex;gap:1.2vmin;align-items:center;font-weight:900;margin-top:1.4vmin;font-size:2.4vmin}.dsg-m .ck input{width:4vmin;height:4vmin}',
'.dsg-m.premium .box{background:linear-gradient(#0f1d3a,#1b2d55);color:#f3e7c4;border:.4vmin solid #c9a44c}.dsg-m.premium .rl{background:rgba(255,255,255,.06)}',
/* 老師台 */
'.dsg-gm .tabs{display:flex;gap:1vmin;margin-bottom:1.4vmin;flex-wrap:wrap}.dsg-gm .tabs button{border:0;border-radius:1.2vmin;padding:1vmin 1.6vmin;font-size:2.1vmin;font-weight:900;background:#eee}.dsg-gm .tabs button.on{background:#3d2f57;color:#fff}',
'.dsg-gl{display:grid;grid-template-columns:repeat(auto-fill,minmax(36vmin,1fr));gap:1.4vmin}',
'.dsg-gc{border:.3vmin solid #ddd;border-radius:1.6vmin;padding:1.2vmin;font-size:1.9vmin}.dsg-gc .im{height:30vmin;background:#f3f3f3;border-radius:1vmin;display:flex;align-items:center;justify-content:center;overflow:hidden}.dsg-gc .im img{max-width:100%;max-height:100%}',
'.dsg-gc .row{display:flex;gap:.8vmin;flex-wrap:wrap;margin-top:.8vmin}.dsg-gc .dsg-b{font-size:1.8vmin;padding:.7vmin 1.1vmin}',
'.dsg-gate{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2vmin;font-size:3vmin;text-align:center;padding:4vmin}',
/* iPad(較高的畫面):左右欄稍窄 */
'@media (min-aspect-ratio:4/3) and (max-aspect-ratio:3/2){#dsg-ed{grid-template-columns:30vw 1fr 23vw}}',
/* 手機橫向(矮螢幕):字放大、兩側欄加寬(鐵律〇之二;放最後) */
'@media (orientation:landscape) and (max-height:520px){#dsg-ed{grid-template-columns:31vw 1fr 25vw}#dsg-ed .bar .dsg-b{font-size:3vmin;padding:1vmin 1.6vmin}#dsg-ed .bar .t{font-size:3.2vmin}#dsg-ed .bar .ops{font-size:2.8vmin}',
' #dsg-ed .tabs button{font-size:2.8vmin;padding:1vmin 1.3vmin}.dsg-grid{grid-template-columns:repeat(auto-fill,minmax(15vmin,1fr))}.dsg-it{height:15vmin;font-size:2.3vmin}.dsg-it img{max-height:10vmin}',
' .dsg-chips button{font-size:2.7vmin}.dsg-sec{font-size:2.9vmin}#dsg-ed .prop{font-size:2.9vmin}#dsg-ed .prop .row .dsg-b{font-size:2.7vmin}',
' .dsg-card{font-size:3.2vmin}.dsg-b{font-size:3.2vmin}.dsg-new button{font-size:4.4vmin}.dsg-new small{font-size:2.9vmin}.dsg-dr{font-size:2.8vmin}#dsg-hub h1{font-size:5.2vmin}',
' .dsg-m .box{font-size:3.2vmin}.dsg-m h3{font-size:4.2vmin}.dsg-m .dsg-b{font-size:3.2vmin}.dsg-chip{font-size:2.8vmin}.dsg-gc{font-size:2.8vmin}.dsg-lockbar{font-size:3vmin}}'
].join('\n');
function injectCss(){ if($('dsg-css')) return; var s = document.createElement('style'); s.id = 'dsg-css'; s.textContent = CSS; document.head.appendChild(s); }

/* ══ 視窗(遊戲內,不用瀏覽器 alert/confirm) ══ */
function modal(html, btns, opt){
  modalClose();
  var m = document.createElement('div'), row, i;
  m.className = 'dsg-m' + (S.style === 'p' ? ' premium' : '') + (opt && opt.cls ? ' ' + opt.cls : ''); m.id = 'dsg-modal';
  m.innerHTML = '<div class="box">' + html + '<div class="btns"></div></div>';
  row = m.querySelector('.btns');
  btns = btns || [{ t: '好' }];
  for(i = 0; i < btns.length; i++){ (function(bd){
    var b = document.createElement('button'); b.className = 'dsg-b ' + (bd.cls || 'go'); b.innerHTML = bd.t;
    b.onclick = function(ev){ ev.stopPropagation(); if(b._t && now() - b._t < 400) return; b._t = now(); sfx('sfx-tap', 0.3); if(bd.keep){ if(bd.cb) bd.cb(m); return; } modalClose(); if(bd.cb) bd.cb(m); };
    row.appendChild(b); })(btns[i]); }
  document.body.appendChild(m);
  if(opt && opt.onOpen) opt.onOpen(m);
  return m;
}
function modalClose(){ var m = $('dsg-modal'); if(m && m.parentNode) m.parentNode.removeChild(m); }
function confirmBox(msg, cb, okT){ modal('<p>' + msg + '</p>', [{ t: '取消', cls: 'ghost', cb: function(){ cb(false); } }, { t: okT || '確定', cb: function(){ cb(true); } }]); }
function busy(on, msg){ var b = $('dsg-busy'); if(!on){ if(b) b.parentNode.removeChild(b); return; }
  if(!b){ b = document.createElement('div'); b.id = 'dsg-busy'; b.className = 'dsg-m'; b.style.zIndex = 9800; document.body.appendChild(b); }
  b.innerHTML = '<div class="box" style="text-align:center;width:auto">⏳ ' + esc(msg || '請稍等…') + '</div>'; }

/* ══ 進場 ══ */
function enter(){
  injectCss();
  var root = $('dsg-root');
  if(!root){ root = document.createElement('div'); root.id = 'dsg-root'; document.body.appendChild(root); }
  document.documentElement.classList.add('dsg-mode');
  S.on = true; S.style = lsGet('dsg_style') === 'p' ? 'p' : 'c';
  root.classList.toggle('nolb', lsGet('dsg_nolb') === '1');
  root.innerHTML = '<div class="dsg-gate">🎨<div>正在進入美術設計師工作室…</div></div>';
  try{ if(B.veilOff) B.veilOff(); }catch(e){}
  bindUser(user());
  srvSync(function(){});
  accFetch(function(){
    var u = user();
    if(!(u && isGm()) && !dsgOpen()){ gate('closed'); return; }
    rosterLoad();
    hub();
    setTimeout(idbSweep, 4000);
  });
  if(!S.tick) S.tick = setInterval(backupTick, 30000);
  document.addEventListener('visibilitychange', function(){ if(document.hidden && S.ed){ saveLocal(false); backupNow(false); } });
  window.addEventListener('pagehide', function(){ if(S.ed) saveLocal(false); });
  window.addEventListener('resize', function(){ if(S.ed) fitStage(); });
}
function bindUser(u){ S.uid = u ? u.uid : ''; S.guest = !u; }
function onUser(u){
  var nu = u ? u.uid : '';
  if(!S.on) return;
  if(nu === S.uid && !!u === !S.guest) return;
  /* 換帳號:前一位的草稿先存好(仍以前一位 uid 為鍵),畫面關掉,換新的人重讀 */
  if(S.ed){ try{ saveLocal(false); }catch(e){} S.ed = null; }
  modalClose(); bindUser(u); S.cfg = null; S.vkey = ''; S.xwords = [];
  accFetch(function(){ if(!(u && isGm()) && !dsgOpen()){ gate('closed'); return; } hub(); });
}
function gate(k){
  var root = $('dsg-root');
  root.innerHTML = '<div class="dsg-gate"><div style="font-size:9vmin">🎨</div><div><b>遊戲美術設計師</b></div><div>' + (k === 'closed' ? '最後測試中,敬請期待!' : '請先登入') + '</div><button class="dsg-b go" id="dsg-gx">🔙 回去</button></div>';
  $('dsg-gx').onclick = exitNow;
}
function exitNow(){
  if(S.ed){ saveLocal(false); backupNow(false); }
  modalClose();
  try{ if(B.handoff) B.handoff(); }catch(e){}
  try{ if(B.loading) B.loading(true); }catch(e2){}
  setTimeout(function(){ S.on = false; try{ location.href = /[?&]from=art\b/.test(location.search) ? 'minigame_index.html?mode=art' : '../'; }catch(e3){} }, 600);
}

/* ══ 大廳 ══ */
function hub(){
  var root = $('dsg-root'), u = user(), ri = resetInfo(), h = '';
  S.ed = null; S.screen = 'hub';
  try{ if(B.bgm) B.bgm('bgm-avatar-card'); }catch(e){}
  h += '<div id="dsg-hub"><div class="top"><h1>🎨 遊戲美術設計師工作室</h1><div class="sp"></div>';
  h += '<button class="dsg-b ghost" data-k="who">' + (u ? '👤 ' + esc(String(uName(u)).slice(0, 12)) : '👤 訪客(登入才能繳交)') + '</button>';
  if(isGm()) h += '<button class="dsg-b blue" data-k="gm">🧑‍🏫 老師台</button>';
  h += '<button class="dsg-b ghost" data-k="rules">📖 規範</button><button class="dsg-b ghost" data-k="how">❓ 怎麼玩</button><button class="dsg-b ghost" data-k="style">' + (S.style === 'p' ? '🌸 簡單風' : '✨ 精緻風') + '</button><button class="dsg-b ghost" data-k="exit">🚪 離開</button></div>';
  h += '<div class="dsg-card" id="dsg-month">📅 <b>' + ymLabel(ymOf()) + '</b> 的作品:' + (S.guest ? '登入後才能繳交' : '讀取中…') + '<br><small>每人每月 1 件,' + ri.m + ' 月 1 日早上 8:00 換新的月份(還有 ' + ri.days + ' 天 ' + ri.hrs + ' 小時)</small></div>';
  h += '<div class="dsg-new"><button data-k="new-skin">🦸 新的角色皮膚<small>' + esc(T(D.KINDS.skin.d)) + '</small></button><button data-k="new-deco">🏝 新的荒島裝飾<small>' + esc(T(D.KINDS.deco.d)) + '</small></button></div>';
  h += '<div class="top"><div class="dsg-sec" style="font-size:2.6vmin">📁 我的作品</div><div class="sp"></div>' + (S.guest ? '' : '<button class="dsg-b ghost" data-k="cloud">☁ 從雲端找回</button>') + '</div><div class="dsg-drafts" id="dsg-drafts">讀取中…</div></div>';
  root.innerHTML = h;
  root.onclick = function(ev){
    var t = ev.target, k = null, did = null, dx = null, drn = null;
    while(t && t !== root){ if(t.getAttribute){ k = k || t.getAttribute('data-k'); did = did || t.getAttribute('data-d'); dx = dx || t.getAttribute('data-x'); drn = drn || t.getAttribute('data-rn'); } t = t.parentNode; }
    if(dx){ sfx('sfx-tap', 0.3); delDraft(dx); return; }
    if(drn){ sfx('sfx-tap', 0.3); renameDraft(drn); return; }   /* ★ v1.0.3 ✏️ 改作品名稱 */
    if(did){ sfx('sfx-tap', 0.3); openDraft(did); return; }
    if(!k) return; sfx('sfx-tap', 0.3);
    if(k === 'new-skin') newWork('skin'); else if(k === 'new-deco') newWork('deco');
    else if(k === 'rules') rulesCard(null); else if(k === 'how') howto('hub'); else if(k === 'exit') exitNow();
    else if(k === 'gm') gmOpen(); else if(k === 'cloud') cloudRestore();
    else if(k === 'who'){ if(B.login) B.login(); }
    else if(k === 'style'){ S.style = S.style === 'p' ? 'c' : 'p'; lsSet('dsg_style', S.style); hub(); }
  };
  draftsPaint();
  monthRefresh();
  if(!lsGet('dsg_tut_' + (S.uid || 'guest'))){ lsSet('dsg_tut_' + (S.uid || 'guest'), '1'); setTimeout(function(){ if(S.screen === 'hub') howto('hub'); }, 500); }
}
function draftsPaint(){
  myDrafts(function(a){
    var el = $('dsg-drafts'), h = '', i, r, st;
    if(!el) return;
    S.drafts = a;
    if(!a.length){ el.innerHTML = '<div style="opacity:.8;font-size:2.2vmin">還沒有作品,按上面的按鈕開始設計吧!</div>'; return; }
    for(i = 0; i < a.length; i++){ r = a[i];
      st = r.lock === 'sub' ? '<span class="dsg-chip pend">⏳ 已繳交・等老師審核</span>' : r.lock === 'live' ? '<span class="dsg-chip live">✅ 老師通過</span>' : (r.back ? '<span class="dsg-chip back">↩ 老師退件・可修改</span>' : '<span class="dsg-chip none">✏️ 編輯中</span>');
      h += '<div class="dsg-dr" data-d="' + esc(r.id) + '"><div class="th">' + (r.th ? '<img src="' + r.th + '">' : D.KINDS[r.kind].e) + '</div><div>' + D.KINDS[r.kind].e + ' ' + esc(r.title || D.KINDS[r.kind].n) + '</div><div>' + st + '</div><div style="opacity:.75">操作 ' + ((r.d && r.d.ops) | 0) + ' 次</div>' + (r.lock ? '' : '<button class="x" data-x="' + esc(r.id) + '">✕</button><button class="x rn" data-rn="' + esc(r.id) + '" title="改名字">✏️</button>') + '</div>'; }
    el.innerHTML = h;
  });
}
/* 本月狀態 + 已繳交作品的審核結果(老師退件 ⇒ 解鎖並帶回建議;通過 ⇒ 鎖住) */
function monthRefresh(){
  var f = fb(), el;
  if(S.guest || !f || !f.db) return;
  f.db.collection('designSubmit').doc(ymOf() + '_' + S.uid).get().then(function(d){
    var x = d && d.exists ? d.data() : null; S.monthDoc = x;
    el = $('dsg-month'); if(!el) return;
    var ri = resetInfo();
    el.innerHTML = '📅 <b>' + ymLabel(ymOf()) + '</b> 的作品:' + (x ? subChip(x.st) + ' ' + esc(x.title || '') : '<span class="dsg-chip none">還沒繳交</span> 這個月還可以繳交 1 件') +
      (x && x.st === 'back' && x.gm ? '<br>📝 老師的建議:<b>' + esc(x.gm.tip || '') + '</b>' + (x.gm.why && x.gm.why.length ? '(' + esc(x.gm.why.join('、')) + ')' : '') : '') +
      '<br><small>每人每月 1 件,' + ri.m + ' 月 1 日早上 8:00 換新的月份(還有 ' + ri.days + ' 天 ' + ri.hrs + ' 小時)</small>';
  })['catch'](function(){ el = $('dsg-month'); if(el) el.innerHTML = '📅 本月狀態讀不到(請老師確認規則已發布)'; });
  myDrafts(function(a){ var i; for(i = 0; i < a.length; i++){ if(a[i].sub && a[i].sub.id) (function(r){
    f.db.collection('designSubmit').doc(r.sub.id).get().then(function(d){ if(!d || !d.exists) return; var x = d.data(), ch = false;
      if(x.did && x.did !== r.id) return;
      if(x.st === 'back' && (r.lock || !r.back || r.back.at !== (x.gm && x.gm.at))){ r.lock = ''; r.back = { why: (x.gm && x.gm.why) || [], tip: (x.gm && x.gm.tip) || '', at: x.gm && x.gm.at }; ch = true; }
      else if(x.st === 'live' && r.lock !== 'live'){ r.lock = 'live'; r.back = null; ch = true; }
      else if(x.st === 'pend' && r.lock !== 'sub'){ r.lock = 'sub'; ch = true; }
      if(ch) idbPut(myKey(r.id), r, function(){ if(S.screen === 'hub') draftsPaint(); });
    })['catch'](function(){}); })(a[i]); } });
}
function subChip(st){ return st === 'pend' ? '<span class="dsg-chip pend">⏳ 等老師審核</span>' : st === 'back' ? '<span class="dsg-chip back">↩ 老師退件,請照建議修改</span>' : st === 'live' ? '<span class="dsg-chip live">✅ 老師通過,成為商品!</span>' : '<span class="dsg-chip none">' + esc(st || '') + '</span>'; }
function howto(k){ var a = (S.style === 'p' ? D.HOWTO[k].p : D.HOWTO[k].c), h = '<h3>❓ 怎麼玩</h3><ol>', i; for(i = 0; i < a.length; i++) h += '<li>' + esc(a[i]) + '</li>'; modal(h + '</ol>'); }
function rulesCard(cb){
  var h = '<h3>📖 作品規範</h3><p>' + (S.style === 'p' ? '下列內容一律不得出現:' : '這些東西不可以畫喔:') + '</p>', i, r;
  for(i = 0; i < D.RULES.length; i++){ r = D.RULES[i]; h += '<div class="rl"><span style="font-size:3.4vmin">' + r.e + '</span><div><b>' + esc(r.n) + '</b>:' + esc(S.style === 'p' ? r.p : r.c) + '</div></div>'; }
  h += '<div class="rl"><span style="font-size:3.4vmin">🔤</span><div>' + esc(T(D.RULE_TEXT)) + '</div></div>';
  h += '<p>' + (S.style === 'p' ? '違反規範的作品無法繳交;系統會先自動審核。' : '違反規範的作品不能繳交;電腦會先自動檢查喔!') + '</p>';
  if(!cb){ modal(h); return; }
  h += '<label class="ck"><input type="checkbox" id="dsg-agree"> 我確認我的作品沒有這些內容</label>';
  modal(h, [{ t: '取消', cls: 'ghost' }, { t: '下一步 ▶', keep: true, cb: function(m){ if(!$('dsg-agree').checked){ toast('請先勾選「我確認」'); return; } modalClose(); cb(); } }]);
}

/* ★ v1.0.3(2026-11-08 11:03・老師「回工作室按下時先彈出幫作品命名的輸入視窗,也可以在我的作品集修改作品名稱」)
   名字最多 16 字、不能空白、會過不雅字詞檢查(wordHits);鎖住(已繳交/已通過)的作品不能改名。 */
var TITLE_MAX = 16;
function titleCheck(v){ v = String(v || '').replace(/\s+/g, ' ').replace(/^ | $/g, ''); if(!v) return { e: '請幫作品取一個名字' }; if(v.length > TITLE_MAX) v = v.slice(0, TITLE_MAX); if(wordHits(v).length) return { e: '名字裡有不適合的字詞,請換一個' }; return { v: v }; }
function nameAsk(cur, cb, okT){
  var h = '<h3>✏️ 幫作品取名字</h3><p style="font-size:2vmin;opacity:.85">' + esc(T({ c: '取一個好名字,老師和同學看作品時就會看到它!(最多 ' + TITLE_MAX + ' 個字)', p: '請為作品命名(最多 ' + TITLE_MAX + ' 字),審核與上架時會顯示此名稱。' })) + '</p>' +
    '<input type="text" id="dsg-title" maxlength="' + TITLE_MAX + '" value="' + esc(cur || '') + '" placeholder="例如:火焰魔法少年" style="width:100%;box-sizing:border-box;font-size:2.6vmin;padding:1vmin;border-radius:1vmin;border:0"><div id="dsg-titlem" style="min-height:2.6vmin;color:#ffb0b0;font-size:1.9vmin"></div>';
  modal(h, [{ t: '取消', cls: 'ghost' }, { t: okT || '💾 存好回工作室', keep: true, cb: function(m){ var r = titleCheck($('dsg-title').value); if(r.e){ $('dsg-titlem').textContent = '⚠ ' + r.e; return; } modalClose(); cb(r.v); } }],
    { onOpen: function(m){ var ip = $('dsg-title'); if(ip){ setTimeout(function(){ try{ ip.focus(); ip.select(); }catch(e){} }, 80); ip.onkeydown = function(ev){ if(ev.keyCode === 13){ var bs = m.querySelectorAll('.btns button'); if(bs[1]) bs[1].click(); } }; } } });
}
function renameDraft(id){
  var a = S.drafts || [], i, r = null; for(i = 0; i < a.length; i++){ if(a[i].id === id) r = a[i]; }
  if(!r) return;
  if(r.lock){ toast('🔒 已繳交或已通過的作品不能改名字'); return; }
  nameAsk(r.title || '', function(v){ r.title = v; idbPut(myKey(r.id), JSON.parse(JSON.stringify(r)), function(ok){ toast(ok ? '✏️ 改好名字了' : '改名失敗,請再試一次'); draftsPaint(); }); }, '✏️ 改好了');
}

/* ══ 新作品/打開/刪除 ══ */
function blankDesign(kind){ var K = D.KINDS[kind]; return { v: 1, kind: kind, W: K.W, H: K.H, bt: 'boy', slots: {}, tint: {}, items: [], ops: 0, hd: 1, guide: kind === 'skin' ? { t: 'pose', id: 'stand', on: 1 } : null }; }   /* ★ v1.0.3 手繪原創:新作品是一張白紙(hd=1 不畫人物底座);角色皮膚預設開「站好」骨架參考 */
function newWork(kind){
  myDrafts(function(a){
    var n = 0, i; for(i = 0; i < a.length; i++){ if(!a[i].lock) n++; }
    if(n >= D.DRAFT_MAX){ modal('<p>編輯中的作品最多 ' + D.DRAFT_MAX + ' 件,先刪掉不要的再開新的喔。</p>'); return; }
    var r = { id: rid(), uid: S.guest ? 'guest' : S.uid, kind: kind, at: now(), title: '', d: blankDesign(kind), paint: '', th: '', lock: '', sub: null, back: null };
    editorOpen(r);
  });
}
function openDraft(id){ var a = S.drafts || [], i; for(i = 0; i < a.length; i++){ if(a[i].id === id){ editorOpen(JSON.parse(JSON.stringify(a[i]))); return; } } }
function delDraft(id){ confirmBox('刪掉這件作品?刪掉就找不回來了(雲端備份也會刪)。', function(ok){ if(!ok) return; idbDel(myKey(id), draftsPaint);
  if(!S.guest && ownerOk()) sto(function(s){ if(s) try{ s.ref('designDrafts/' + S.uid + '/' + id + '.json')['delete']().then(function(){}, function(){}); }catch(e){} }); }, '刪掉'); }

/* ══ 編輯器 ══ */
function editorOpen(r){
  var root = $('dsg-root'), K = D.KINDS[r.kind], h = '', i0;
  for(i0 = 0; r.d && r.d.items && i0 < r.d.items.length; i0++) delete r.d.items[i0].im;
  S.screen = 'ed';
  S.ed = { r: r, d: r.d, sel: -1, tab: D.TABS[r.kind][0].id, undo: [], redo: [], k: 1, dirty: false, cloudDirty: false, lastCloud: now(), paintStr: r.paint || '', brush: { c: '#1b1b1b', w: 12, er: false }, tk: 'sign', font: 'hei',
    pm: lsGet('dsg_pm') || 'free', px: { n: +(lsGet('dsg_pxn') || 32), tool: 'pen' }, vec: { sh: 'rect', fill: '#ffd23f', st: '#1b1b1b', sw: 6 } };
  h += '<div id="dsg-ed"' + (r.lock ? ' class="locked"' : '') + '><div class="bar"><button class="dsg-b ghost" data-k="back">🔙<span class="lb"> 回工作室</span></button><div class="t">' + K.e + ' ' + esc(r.title || K.n) + '</div>';
  h += '<button class="dsg-b ghost" data-k="undo">↶<span class="lb"> 復原</span></button><button class="dsg-b ghost" data-k="redo">↷<span class="lb"> 重做</span></button><div class="ops" id="dsg-ops"></div><div class="sp"></div>';
  h += '<button class="dsg-b ghost" data-k="lbl" title="顯示/隱藏功能名稱">🏷<span class="lb"> 名稱</span></button><button class="dsg-b ghost" data-k="how">❓<span class="lb"> 怎麼玩</span></button><button class="dsg-b blue" data-k="save">💾<span class="lb"> 存檔</span></button><button class="dsg-b go" data-k="submit">📤<span class="lb"> 確認繳交</span></button></div>';
  h += '<div class="lib"><div class="tabs" id="dsg-tabs"></div><div class="lbody" id="dsg-lib"></div></div>';
  h += '<div class="mid" id="dsg-mid"><div id="dsg-stage" style="width:' + K.W + 'px;height:' + K.H + 'px"><div class="ly" id="dsg-ly"></div><canvas id="dsg-guide" width="' + K.W + '" height="' + K.H + '" style="width:' + K.W + 'px;height:' + K.H + 'px"></canvas><canvas id="dsg-paint" width="' + K.W + '" height="' + K.H + '" style="width:' + K.W + 'px;height:' + K.H + 'px"></canvas><canvas id="dsg-grid" width="' + K.W + '" height="' + K.H + '" style="width:' + K.W + 'px;height:' + K.H + 'px"></canvas><div id="dsg-sel"><i data-h="1"></i></div></div>';
  if(r.lock) h += '<div class="dsg-lockbar">' + (r.lock === 'live' ? '✅ 老師已通過,這件作品不能再改了' : '🔒 已繳交,等老師審核;老師退件後才能修改') + '</div>';
  h += '</div><div class="prop" id="dsg-prop"></div></div>';
  root.innerHTML = h;
  root.onclick = function(ev){ var t = ev.target, k = null; while(t && t !== root){ if(t.getAttribute) k = k || t.getAttribute('data-k'); t = t.parentNode; } if(!k) return; sfx('sfx-tap', 0.3); barCmd(k); };
  if(r.paint){ var im = new Image(); im.onload = function(){ try{ $('dsg-paint').getContext('2d').drawImage(im, 0, 0); }catch(e){} }; im.src = r.paint; }
  tabsPaint(); libPaint(); layersPaint(); propPaint(); opsPaint(); stageBind(); pmApply(); fitStage(); guideDraw();
  setTimeout(fitStage, 60);
  if(r.back && r.back.tip) modal('<h3>↩ 老師退件了</h3><p>📝 老師的建議:<b>' + esc(r.back.tip) + '</b></p>' + (r.back.why && r.back.why.length ? '<p>原因:' + esc(r.back.why.join('、')) + '</p>' : '') + '<p>照建議改好後,再按「📤 確認繳交」。</p>');
}
function locked(){ return !!(S.ed && S.ed.r.lock); }
function barCmd(k){
  var E = S.ed; if(!E) return;
  if(k === 'back'){ if(locked()){ saveLocal(true); backupNow(false); hub(); return; } nameAsk(E.r.title || '', function(v){ E.r.title = v; var tt = $('dsg-root') && $('dsg-root').querySelector('#dsg-ed .bar .t'); if(tt) tt.textContent = D.KINDS[E.r.kind].e + ' ' + v; dirty(); saveLocal(true, function(){ backupNow(false); hub(); }); }); }   /* ★ v1.0.3 回工作室前先幫作品取名字 */
  else if(k === 'undo') undo(); else if(k === 'redo') redo();
  else if(k === 'how') howto('editor');
  else if(k === 'lbl'){ var off = lsGet('dsg_nolb') !== '1'; lsSet('dsg_nolb', off ? '1' : '0'); $('dsg-root').classList.toggle('nolb', off); toast(off ? '🏷 功能名稱已隱藏(只留圖示)' : '🏷 功能名稱已顯示'); setTimeout(fitStage, 30); }
  else if(k === 'save'){ if(locked()){ toast('🔒 這件作品已鎖定'); return; } saveLocal(true, function(ok){ toast(ok ? '💾 存好了(這台平板)' : '存檔失敗,請再試一次'); }); backupNow(true); }
  else if(k === 'submit') submitStart();
}
function opsPaint(){ var el = $('dsg-ops'), q = qOf(S.ed.r.kind); if(el) el.textContent = '✋ 操作 ' + (S.ed.d.ops | 0) + '/' + q.ops; }
function fitStage(){
  var E = S.ed, mid = $('dsg-mid'), st = $('dsg-stage'), W, H, k;
  if(!E || !mid || !st) return;
  W = E.d.W; H = E.d.H; k = Math.min(mid.clientWidth / W, mid.clientHeight / H) * 0.94; if(!(k > 0)) k = 1;
  E.k = k; E.ox = (mid.clientWidth - W * k) / 2; E.oy = (mid.clientHeight - H * k) / 2;
  st.style.transform = 'translate(' + E.ox + 'px,' + E.oy + 'px) scale(' + k + ')';
  selPaint();
}
/* 一次操作完成:記復原、計次數、存本機 */
function snapNow(){ var E = S.ed; return { d: JSON.stringify(E.d), p: E.paintStr }; }
function beginOp(){ var E = S.ed; E.undo.push(snapNow()); if(E.undo.length > 30) E.undo.shift(); E.redo = []; E._bk = opKey(); }
/* ★ v1.0.1(2026-11-08・老師「拖曳、縮放、往前、往後都不列入操作步驟。只有『增加』性質的操作才列入」)
   endOp(add):每個動作照樣記復原、標 dirty;只有 add 為 true(放素材/文字/形狀、畫一筆、像素點/填色、複製一份、選人物部件)才 +1。
   不算:拖曳、縮放旋轉、往前/往後、翻轉、刪除、換色/滑桿、橡皮擦、換體型、清畫布、換字型字色。 */
/* ★ v1.0.2(2026-11-08 10:51・老師「只有『增加、變色』性質的操作才列入,且修正後不可跟原本的一樣」)
   ① 變色也算:人物部件換色(色相滑桿)、形狀填色/外框色、文字顏色、物件色相/亮度滑桿 ⇒ endOp(true)。
   ② 改完要跟原本不一樣:每次操作前(beginOp)與完成後各算一次「畫面指紋」opKey()= 設計內容(不含 ops/oh)+ 手繪筆跡;
      指紋沒變(選同一色、拉了又拉回)不算;指紋出現過也不算 ⇒ A 色→B 色→換回 A、復原再重做、加了又刪再加回同一個,都不會重複計次。
      算過的指紋存在 d.oh(最多 600 個,跟著草稿存),換平板/重開草稿一樣有效。 */
function opHash(s){ var h = 2166136261, i; s = String(s || ''); for(i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; } return h.toString(36) + '.' + s.length.toString(36); }
function opKey(){ var E = S.ed, o = E.d.ops, oh = E.d.oh, gd = E.d.guide, s; E.d.ops = 0; E.d.oh = null; E.d.guide = null; try{ s = JSON.stringify(E.d); }catch(x){ s = ''; } E.d.ops = o; E.d.oh = oh; E.d.guide = gd; return opHash(s) + '|' + opHash(E.paintStr || ''); }
function endOp(add){ var E = S.ed, k, oh;
  if(add){ k = opKey(); oh = E.d.oh = (E.d.oh && E.d.oh.push) ? E.d.oh : [];
    if(E._bk && oh.indexOf(E._bk) < 0) oh.push(E._bk);   /* 改之前的樣子也記下來:之後換回原本的樣子不算 */
    if(k !== E._bk && oh.indexOf(k) < 0){ oh.push(k); E.d.ops = (E.d.ops | 0) + 1; }
    while(oh.length > 600) oh.shift(); }
  E._bk = null; opsPaint(); dirty(); }
function restore(sn){ var E = S.ed, cv, im; E.d = JSON.parse(sn.d); E.r.d = E.d;
  if(sn.p !== E.paintStr){ E.paintStr = sn.p; cv = $('dsg-paint'); cv.getContext('2d').clearRect(0, 0, cv.width, cv.height); if(sn.p){ im = new Image(); im.onload = function(){ cv.getContext('2d').drawImage(im, 0, 0); }; im.src = sn.p; } }
  E.sel = -1; layersPaint(); libPaint(); propPaint(); dirty(); }
function undo(){ var E = S.ed; if(locked() || !E.undo.length){ return; } var cur = snapNow(), ops = E.d.ops, oh = E.d.oh; E.redo.push(cur); restore(E.undo.pop()); E.d.ops = ops; E.d.oh = oh; opsPaint(); }   /* ★ v1.0.2 算過的畫面指紋 oh 也不跟著復原 */
function redo(){ var E = S.ed; if(locked() || !E.redo.length) return; var ops = E.d.ops, oh = E.d.oh; E.undo.push(snapNow()); restore(E.redo.pop()); E.d.ops = ops; E.d.oh = oh; opsPaint(); }   /* 復原不扣操作次數(做過的努力都算) */
var dT = null;
function dirty(){ var E = S.ed; if(!E) return; E.dirty = true; E.cloudDirty = true; clearTimeout(dT); dT = setTimeout(function(){ saveLocal(false); }, 1500); }

/* ── 存檔:本機(自動/手動)+ 雲端備份(每 5 分鐘;手動存檔時立刻) ── */
function saveLocal(withThumb, cb){
  var E = S.ed; if(!E){ if(cb) cb(false); return; }
  var r = E.r; r.d = E.d; r.paint = E.paintStr; r.at = now();
  function put(){ idbPut((r.uid || 'guest') + '|' + r.id, JSON.parse(JSON.stringify(r)), function(ok){ E.dirty = false; if(cb) cb(ok); }); }
  if(r.uid !== (S.guest ? 'guest' : S.uid)){ if(cb) cb(false); return; }   /* 帳號已換人:不寫到別人名下 */
  if(withThumb) renderComposite(false, 200, function(cv){ try{ r.th = cv.toDataURL('image/png'); }catch(e){} put(); }); else put();
}
function backupTick(){ var E = S.ed; if(E && E.cloudDirty && now() - E.lastCloud >= D.CLOUD_BACKUP_MS) backupNow(false); }
function backupNow(say){
  var E = S.ed; if(!E || S.guest || !ownerOk()) return;
  var r = E.r, uid = S.uid, body;
  if(r.uid !== uid) return;
  r.d = E.d; r.paint = E.paintStr;
  body = JSON.stringify({ id: r.id, uid: uid, kind: r.kind, at: now(), title: r.title, d: r.d, paint: r.paint, th: r.th, lock: r.lock, sub: r.sub, back: r.back, ver: VER });
  E.cloudDirty = false; E.lastCloud = now();
  sto(function(s){ if(!s || S.uid !== uid){ E.cloudDirty = true; return; }
    try{ s.ref('designDrafts/' + uid + '/' + r.id + '.json').putString(body, 'raw', { contentType: 'application/json' }).then(function(){ if(say) toast('☁ 雲端備份好了'); }, function(){ E.cloudDirty = true; if(say) toast('☁ 雲端備份失敗(平板上的存檔還在)'); }); }catch(e){ E.cloudDirty = true; } });
}
function cloudRestore(){
  if(S.guest){ toast('登入後才有雲端備份'); return; }
  var uid = S.uid; toast('☁ 正在找雲端備份…');
  sto(function(s){ if(!s){ toast('☁ 雲端備份目前連不上'); return; }
    s.ref('designDrafts/' + uid).listAll().then(function(res){
      myDrafts(function(local){ var have = {}, i, todo = [], got = 0, bad = 0; for(i = 0; i < local.length; i++) have[local[i].id] = local[i].at || 0;
        res.items.forEach(function(it){ var id = it.name.replace(/\.json$/, ''); if(!have[id]) todo.push(it); });
        if(!todo.length){ toast('☁ 雲端的作品這台都有了'); return; }
        todo.forEach(function(it){ it.getDownloadURL().then(function(u){ return fetch(u); }).then(function(x){ return x.json(); }).then(function(r){ if(r && r.uid === uid && r.id && r.d){ idbPut(uid + '|' + r.id, r, function(){}); got++; } else bad++; })['catch'](function(){ bad++; })
          .then(function(){ if(got + bad === todo.length){ toast(got ? '☁ 找回 ' + got + ' 件作品' : '☁ 下載不到(老師要先開 Storage 的 CORS)'); if(S.screen === 'hub') draftsPaint(); } }); });
      });
    })['catch'](function(){ toast('☁ 雲端備份讀不到(請老師確認 storage.rules 已發布)'); });
  });
}

/* ── 左欄:分頁與素材 ── */
function tabsPaint(){ var E = S.ed, a = D.TABS[E.r.kind], h = '', i; for(i = 0; i < a.length; i++) h += '<button data-tab="' + a[i].id + '"' + (a[i].id === E.tab ? ' class="on"' : '') + '>' + a[i].e + '<span class="lb"> ' + esc(a[i].n) + '</span></button>';
  var el = $('dsg-tabs'); el.innerHTML = h; el.onclick = function(ev){ var n = ev.target, t = null; while(n && n !== el && !t){ t = n.getAttribute ? n.getAttribute('data-tab') : null; n = n.parentNode; } if(!t) return;   /* 按鈕裡有名稱標籤 <span>,要往上找 */ ev.stopPropagation(); sfx('sfx-sel', 0.3); E.tab = t; pmApply(); tabsPaint(); libPaint(); }; }
/* ★ 三種創作風格:自由手繪(畫筆層)、像素點陣(格子對齊上色+油漆桶)、向量繪圖(拖曳畫形狀,形狀是可再移動/縮放/改色的物件) */
function pmApply(){ var E = S.ed, st = $('dsg-stage'), on = E.tab === 'paint'; if(!st) return;
  st.classList.toggle('painting', on && E.pm !== 'vector'); st.classList.toggle('pixmode', on && E.pm === 'pixel'); st.classList.toggle('vecmode', on && E.pm === 'vector'); st.classList.toggle('pbelow', !!E.d.pb);
  if(on && E.pm === 'pixel') gridDraw(); }
function gridDraw(){ var E = S.ed, g = $('dsg-grid'), x, n = E.px.n, c = E.d.W / n, i; if(!g) return; x = g.getContext('2d'); x.clearRect(0, 0, g.width, g.height); x.strokeStyle = 'rgba(80,80,160,.28)'; x.lineWidth = 1;
  for(i = 0; i * c <= E.d.W + 0.5; i++){ x.beginPath(); x.moveTo(Math.round(i * c) + 0.5, 0); x.lineTo(Math.round(i * c) + 0.5, E.d.H); x.stroke(); }
  for(i = 0; i * c <= E.d.H + 0.5; i++){ x.beginPath(); x.moveTo(0, Math.round(i * c) + 0.5); x.lineTo(E.d.W, Math.round(i * c) + 0.5); x.stroke(); } }
function avName(f){ var p = f.split('_'), i, n = []; for(i = 0; i < p.length; i++){ if(D.AV_WORD[p[i]]) n.push(D.AV_WORD[p[i]]); } return n.join('') || f; }
/* ★ v1.0.3 描圖參考層 #dsg-guide(在畫筆層下面、pointer-events:none;renderComposite 不會畫它 ⇒ 不進作品、不進縮圖、不進審核) */
function guideDraw(){
  var E = S.ed, cv = $('dsg-guide'), g, x, W, H, P, i, j, k, b, im;
  if(!E || !cv) return;
  x = cv.getContext('2d'); W = cv.width; H = cv.height; x.clearRect(0, 0, W, H);
  g = E.d.guide; if(!g || !g.on) return;
  cv.style.opacity = String(g.a || 0.35);
  if(g.t === 'pose'){
    for(i = 0; i < D.POSES.length; i++){ if(D.POSES[i].id === g.id) P = D.POSES[i].j; }
    if(!P) return;
    var pt = function(n){ return [P[n][0] * W, P[n][1] * H]; };
    x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = '#2f7de1'; x.fillStyle = '#2f7de1';
    x.lineWidth = Math.max(8, W * 0.022);
    for(i = 0; i < D.POSE_BONES.length; i++){ b = D.POSE_BONES[i]; var a0 = pt(b[0]), a1 = pt(b[1]); x.beginPath(); x.moveTo(a0[0], a0[1]); x.lineTo(a1[0], a1[1]); x.stroke(); }
    var hd = pt('h'), r = W * 0.075; x.beginPath(); x.arc(hd[0], hd[1], r, 0, Math.PI * 2); x.lineWidth = Math.max(6, W * 0.016); x.stroke();
    for(k in P){ if(P.hasOwnProperty(k) && k !== 'h'){ j = pt(k); x.beginPath(); x.arc(j[0], j[1], W * 0.014, 0, Math.PI * 2); x.fill(); } }
    return;
  }
  if(g.t === 'ref' && g.src){
    im = new Image(); im.onload = function(){ if(!S.ed || S.ed.d.guide !== g) return; var k2 = Math.min(W * 0.9 / im.naturalWidth, H * 0.9 / im.naturalHeight), w2 = im.naturalWidth * k2, h2 = im.naturalHeight * k2; x.clearRect(0, 0, W, H); x.drawImage(im, (W - w2) / 2, (H - h2) / 2, w2, h2); };
    im.src = srcUrl(g.src);
  }
}
function itemGrid(list, pre){ var h = '<div class="dsg-grid">', i; for(i = 0; i < list.length; i++) h += '<div class="dsg-it" data-add="' + esc(pre + list[i][0]) + '"><img loading="lazy" src="' + esc(srcUrl(pre + list[i][0])) + '"><span>' + esc(list[i][1] || '') + '</span></div>'; return h + '</div>'; }
function libPaint(){
  var E = S.ed, el = $('dsg-lib'), h = '', i, j, f, sl, a, bt = E.d.bt, tk, fo;
  if(E.tab === 'person'){
    h += '<div class="dsg-sec">🧍 體型</div><div class="dsg-chips">'; for(i = 0; i < D.BT.length; i++) h += '<button data-bt="' + D.BT[i].id + '"' + (bt === D.BT[i].id ? ' class="on"' : '') + '>' + esc(D.BT[i].n) + '</button>'; h += '</div>';
    for(j = 0; j < D.SLOTS.length; j++){ sl = D.SLOTS[j]; a = [];
      for(i = 0; i < D.AV_FILES.length; i++){ f = D.AV_FILES[i]; if(D.slotOf(f, bt) === sl.id) a.push(f); }
      if(!a.length) continue;
      h += '<div class="dsg-sec">' + sl.e + ' ' + esc(sl.n) + (sl.d ? ' <small style="opacity:.75">' + esc(sl.d) + '</small>' : '') + '</div><div class="dsg-chips"><button data-slot="' + sl.id + '" data-f=""' + (!E.d.slots[sl.id] ? ' class="on"' : '') + '>不要</button>';
      var seenN = {}, nmA;
      for(i = 0; i < a.length; i++){ nmA = avName(a[i]); seenN[nmA] = (seenN[nmA] | 0) + 1; if(seenN[nmA] > 1) nmA += ' ' + ['', '', '②', '③', '④'][Math.min(4, seenN[nmA])];
        h += '<button data-slot="' + sl.id + '" data-f="' + a[i] + '"' + (E.d.slots[sl.id] === a[i] ? ' class="on"' : '') + '>' + esc(nmA) + '</button>'; }
      h += '</div>';
      if(E.d.slots[sl.id] && sl.id !== 'eye') h += '<div style="font-size:1.7vmin;display:flex;gap:1vmin;align-items:center">🎨 顏色 <input type="range" min="-180" max="180" step="5" value="' + ((E.d.tint[sl.id] || [0, 1])[0]) + '" data-th="' + sl.id + '" style="flex:1"></div>';
    }
  } else if(E.tab === 'wp') h += itemGrid(D.LIB_WP, 'isl:');
  else if(E.tab === 'pet') h += itemGrid(D.LIB_PET, 'isl:');
  else if(E.tab === 'deco') h += itemGrid(D.LIB_DECO, 'isl:');
  else if(E.tab === 'item') h += itemGrid(D.LIB_ACC, 'isl:');
  else if(E.tab === 'acc'){
    for(j = 0; j < D.FREE_AV.length; j++){ a = []; for(i = 0; i < D.AV_FILES.length; i++){ f = D.AV_FILES[i]; if(D.FREE_AV[j].re.test(f)) a.push([f, D.HAT_WORD[f.replace(/^(hat|macc|gls|mask)_/, '')] || f.replace(/^mask_/, '面具 ')]); }
      h += '<div class="dsg-sec">' + D.FREE_AV[j].e + ' ' + esc(D.FREE_AV[j].n) + '</div>' + itemGrid(a, 'av:'); }
  } else if(E.tab === 'text'){
    h += '<div class="dsg-sec">🔤 文字貼片</div><div style="font-size:1.8vmin;opacity:.9;margin-bottom:.8vmin">' + esc(T(D.RULE_TEXT)) + '</div>';
    h += '<div class="dsg-sec">放在哪裡</div><div class="dsg-chips">'; for(i = 0; i < D.TEXT_KINDS.length; i++){ tk = D.TEXT_KINDS[i]; h += '<button data-tk="' + tk.id + '"' + (E.tk === tk.id ? ' class="on"' : '') + '>' + tk.e + ' ' + esc(tk.n) + '</button>'; } h += '</div>';
    h += '<div class="dsg-sec">字型</div><div class="dsg-chips">'; for(i = 0; i < D.FONTS.length; i++){ fo = D.FONTS[i]; h += '<button data-font="' + fo.id + '"' + (E.font === fo.id ? ' class="on"' : '') + ' style="font-family:' + esc(fo.css) + '">' + esc(fo.n) + '</button>'; } h += '</div>';
    h += '<div class="dsg-sec">文字(最多 ' + D.TEXT_MAX + ' 個字)</div><input type="text" id="dsg-tx" maxlength="' + D.TEXT_MAX + '" placeholder="例如:小英雄商店"><div id="dsg-txm" style="font-size:1.8vmin;min-height:2.4vmin;color:#ffb0b0"></div>';
    h += '<button class="dsg-b go" data-addtext="1" style="margin-top:1vmin">➕ 放進畫面</button>';
  } else if(E.tab === 'pose'){   /* ★ v1.0.3 🦴 人物動作骨架 */
    var gp = E.d.guide && E.d.guide.t === 'pose' ? E.d.guide : null;
    h += '<div class="dsg-sec">🦴 動作骨架</div><div style="font-size:1.8vmin;opacity:.9;margin-bottom:.8vmin">' + esc(T({ c: '選一個姿勢,淡淡的骨架會出現在畫布上。照著它畫出身體比例和動作;骨架不會出現在作品裡。', p: '選擇姿勢後,骨架以淡色顯示於畫布作為比例與動作參考,不會納入作品。' })) + '</div><div class="dsg-chips">';
    for(i = 0; i < D.POSES.length; i++) h += '<button data-gp="' + D.POSES[i].id + '"' + (gp && gp.on && gp.id === D.POSES[i].id ? ' class="on"' : '') + '>' + D.POSES[i].e + ' ' + esc(D.POSES[i].n) + '</button>';
    h += '<button data-gp=""' + (!gp || !gp.on ? ' class="on"' : '') + '>🙈 不顯示</button></div>';
    h += '<div style="font-size:1.8vmin;display:flex;gap:1vmin;align-items:center;margin-top:1vmin">👁 濃淡 <input type="range" min="10" max="80" value="' + Math.round(((E.d.guide && E.d.guide.a) || 0.35) * 100) + '" id="dsg-ga" style="flex:1"></div>';
    h += '<button class="dsg-b go" data-tab2="paint" style="margin-top:1.2vmin">🖌 開始畫</button>';
  } else if(E.tab === 'ref'){   /* ★ v1.0.3 🖼 參考圖片(荒島裝飾):四組收合 */
    var gr = E.d.guide && E.d.guide.t === 'ref' && E.d.guide.on ? E.d.guide.src : '';
    h += '<div class="dsg-sec">🖼 參考圖片</div><div style="font-size:1.8vmin;opacity:.9;margin-bottom:.8vmin">' + esc(T({ c: '點一張圖,它會淡淡地放在畫布下面讓你看著畫。參考圖片不會放進作品裡,要自己畫出來喔!', p: '點選圖片即置於畫布下方作為描繪參考;參考圖片不會納入作品,請以手繪完成創作。' })) + '</div>';
    if(gr) h += '<div class="dsg-chips"><button data-gr="">🙈 收起參考圖片</button></div><div style="font-size:1.8vmin;display:flex;gap:1vmin;align-items:center;margin:.6vmin 0">👁 濃淡 <input type="range" min="10" max="80" value="' + Math.round(((E.d.guide && E.d.guide.a) || 0.35) * 100) + '" id="dsg-ga" style="flex:1"></div>';
    for(j = 0; j < D.REF_GROUPS.length; j++){ a = D[D.REF_GROUPS[j].lib] || [];
      h += '<details class="dsg-ref"' + (E.refOpen === D.REF_GROUPS[j].id ? ' open' : '') + ' data-rg="' + D.REF_GROUPS[j].id + '"><summary>' + D.REF_GROUPS[j].e + ' ' + esc(D.REF_GROUPS[j].n) + ' <small style="opacity:.7">(' + a.length + ')</small></summary><div class="dsg-grid">';
      for(i = 0; i < a.length; i++) h += '<div class="dsg-it' + (gr === 'isl:' + a[i][0] ? ' on' : '') + '" data-gr="isl:' + esc(a[i][0]) + '"><img loading="lazy" src="' + esc(srcUrl('isl:' + a[i][0])) + '"><span>' + esc(a[i][1] || '') + '</span></div>';
      h += '</div></details>'; }
    h += '<button class="dsg-b go" data-tab2="paint" style="margin-top:1.2vmin">🖌 開始畫</button>';
  } else if(E.tab === 'paint'){
    h += '<div class="dsg-pm"><button data-pm="free"' + (E.pm === 'free' ? ' class="on"' : '') + '><b>✍️</b><span class="lb">自由手繪</span></button><button data-pm="pixel"' + (E.pm === 'pixel' ? ' class="on"' : '') + '><b>👾</b><span class="lb">像素點陣</span></button><button data-pm="vector"' + (E.pm === 'vector' ? ' class="on"' : '') + '><b>🔷</b><span class="lb">向量繪圖</span></button></div>';
    h += pmPanel();
  } else if(E.tab === 'paint-old'){
    h += '<div class="dsg-sec">🖌 畫筆(在最上層畫)</div><div>'; for(i = 0; i < D.PAINT_COLORS.length; i++) h += '<span class="dsg-sw' + (!E.brush.er && E.brush.c === D.PAINT_COLORS[i] ? ' on' : '') + '" data-pc="' + D.PAINT_COLORS[i] + '" style="background:' + D.PAINT_COLORS[i] + '"></span>'; h += '</div>';
    h += '<div style="display:flex;gap:1vmin;align-items:center;margin-top:1vmin">🎨 <input type="color" id="dsg-pcol" value="' + E.brush.c + '"></div>';
    h += '<label style="display:block;margin-top:1vmin">粗細 <b id="dsg-bwv">' + E.brush.w + '</b></label><input type="range" min="2" max="60" value="' + E.brush.w + '" id="dsg-bw" style="width:100%">';
    h += '<div class="dsg-chips" style="margin-top:1vmin"><button data-pe="0"' + (!E.brush.er ? ' class="on"' : '') + '>🖌 畫筆</button><button data-pe="1"' + (E.brush.er ? ' class="on"' : '') + '>🧽 橡皮擦</button><button data-pclr="1">🗑 清掉畫的</button></div>';
    h += '<div class="dsg-tip">⚠ 不要在圖上寫說明文字或名字;要寫字請用「🔤 文字貼片」。</div>';
  }
  el.innerHTML = h;
  el.onclick = libClick;
  el.oninput = function(ev){ var t = ev.target, sid = t.getAttribute('data-th');
    if(t.id === 'dsg-ga'){ if(E.d.guide){ E.d.guide.a = (+t.value) / 100; guideDraw(); dirty(); } return; }   /* ★ v1.0.3 參考濃淡 */
    if(sid){ if(!E._tintOp){ beginOp(); E._tintOp = 1; } E.d.tint[sid] = [+t.value, 1]; layersPaint(); }
    if(t.id === 'dsg-bw'){ E.brush.w = +t.value; $('dsg-bwv').textContent = t.value; }
    if(t.id === 'dsg-pcol'){ E.brush.c = t.value; E.brush.er = false; if(E.px.tool === 'er') E.px.tool = 'pen'; }
    if(t.id === 'dsg-vsw'){ E.vec.sw = +t.value; $('dsg-vswv').textContent = t.value; }
    if(t.id === 'dsg-tx'){ var hs = wordHits(t.value); $('dsg-txm').textContent = hs.length ? '⚠ 這段文字有不適合的字詞,請換別的說法' : ''; } };
  el.onchange = function(ev){ if(ev.target.getAttribute('data-th') && E._tintOp){ E._tintOp = 0; endOp(true); } };   /* ★ v1.0.2 人物部件換色 = 變色,算一次(拉回原色不算) */
}
function swatches(cur, attr){ var h = '<div>', i; for(i = 0; i < D.PAINT_COLORS.length; i++) h += '<span class="dsg-sw' + (cur === D.PAINT_COLORS[i] ? ' on' : '') + '" ' + attr + '="' + D.PAINT_COLORS[i] + '" style="background:' + D.PAINT_COLORS[i] + '"></span>'; return h + '</div>'; }
function pmPanel(){
  var E = S.ed, h = '', i, sh = [['rect', '⬛', '方形'], ['ellipse', '⚪', '圓形'], ['tri', '🔺', '三角形'], ['star', '⭐', '星星'], ['heart', '❤️', '愛心'], ['line', '➖', '直線']], ns = [16, 24, 32, 48, 64];
  if(E.pm === 'free'){
    h += '<div class="dsg-sec">✍️ <span class="lb">自由手繪(在最上層畫)</span></div>' + swatches(E.brush.er ? '' : E.brush.c, 'data-pc');
    h += '<div style="display:flex;gap:1vmin;align-items:center;margin-top:1vmin">🎨 <input type="color" id="dsg-pcol" value="' + E.brush.c + '"></div>';
    h += '<label style="display:block;margin-top:1vmin">📏 <span class="lb">粗細</span> <b id="dsg-bwv">' + E.brush.w + '</b></label><input type="range" min="2" max="60" value="' + E.brush.w + '" id="dsg-bw" style="width:100%">';
    h += '<div class="dsg-chips" style="margin-top:1vmin"><button data-pe="0"' + (!E.brush.er ? ' class="on"' : '') + '>🖌<span class="lb"> 畫筆</span></button><button data-pe="1"' + (E.brush.er ? ' class="on"' : '') + '>🧽<span class="lb"> 橡皮擦</span></button><button data-pclr="1">🗑<span class="lb"> 清掉畫的</span></button></div>';
  } else if(E.pm === 'pixel'){
    h += '<div class="dsg-sec">👾 <span class="lb">像素點陣(格子對齊)</span></div>' + swatches(E.px.tool === 'er' ? '' : E.brush.c, 'data-pc');
    h += '<div style="display:flex;gap:1vmin;align-items:center;margin-top:1vmin">🎨 <input type="color" id="dsg-pcol" value="' + E.brush.c + '"></div>';
    h += '<div class="dsg-sec"><span class="lb">格子數(橫向)</span></div><div class="dsg-chips">'; for(i = 0; i < ns.length; i++) h += '<button data-pxn="' + ns[i] + '"' + (E.px.n === ns[i] ? ' class="on"' : '') + '>' + ns[i] + '</button>'; h += '</div>';
    h += '<div class="dsg-chips" style="margin-top:1vmin"><button data-pxt="pen"' + (E.px.tool === 'pen' ? ' class="on"' : '') + '>✏️<span class="lb"> 點格子</span></button><button data-pxt="fill"' + (E.px.tool === 'fill' ? ' class="on"' : '') + '>🪣<span class="lb"> 油漆桶</span></button><button data-pxt="er"' + (E.px.tool === 'er' ? ' class="on"' : '') + '>🧽<span class="lb"> 擦掉</span></button><button data-pclr="1">🗑<span class="lb"> 清掉畫的</span></button></div>';
  } else {
    h += '<div class="dsg-sec">🔷 <span class="lb">向量繪圖:在畫面上拖曳畫出形狀</span></div><div class="dsg-chips">'; for(i = 0; i < sh.length; i++) h += '<button data-vsh="' + sh[i][0] + '"' + (E.vec.sh === sh[i][0] ? ' class="on"' : '') + '>' + sh[i][1] + '<span class="lb"> ' + sh[i][2] + '</span></button>'; h += '</div>';
    h += '<div class="dsg-sec">🎨 <span class="lb">填色</span></div>' + swatches(E.vec.fill, 'data-vf') + '<div class="dsg-chips"><button data-vf="none"' + (E.vec.fill === 'none' ? ' class="on"' : '') + '>🚫<span class="lb"> 不填色</span></button></div>';
    h += '<div class="dsg-sec">🖊 <span class="lb">外框</span></div>' + swatches(E.vec.st, 'data-vs');
    h += '<label style="display:block;margin-top:1vmin">📏 <span class="lb">外框粗細</span> <b id="dsg-vswv">' + E.vec.sw + '</b></label><input type="range" min="0" max="30" value="' + E.vec.sw + '" id="dsg-vsw" style="width:100%">';
    h += '<div class="dsg-tip">畫好的形狀可以像其他素材一樣點選、移動、縮放、旋轉;選到後右邊可以改顏色。</div>';
  }
  if(E.pm !== 'vector') h += '<div class="dsg-sec">🗂 <span class="lb">畫的東西放在</span></div><div class="dsg-chips"><button data-pb="0"' + (!E.d.pb ? ' class="on"' : '') + '>⬆<span class="lb"> 最上層</span></button><button data-pb="1"' + (E.d.pb ? ' class="on"' : '') + '>⬇<span class="lb"> 最下層(當背景)</span></button></div>';
  h += '<div class="dsg-tip">⚠ 不要在圖上寫說明文字或名字;要寫字請用「🔤 文字貼片」。</div>';
  return h;
}
function libClick(ev){
  var E = S.ed, t = ev.target, a = null, v;
  if(locked()) return;
  /* ★ v1.0.3 描圖參考:🦴 骨架(data-gp)/🖼 參考圖片(data-gr)/🖌 開始畫(data-tab2)/參考組收合(summary)。只改 d.guide,不記復原、不算操作次數 */
  var g0 = t, gk = null, gv = null;
  while(g0 && g0 !== this && !gk){ if(g0.getAttribute){ if(g0.hasAttribute('data-gp')){ gk = 'gp'; gv = g0.getAttribute('data-gp'); } else if(g0.hasAttribute('data-gr')){ gk = 'gr'; gv = g0.getAttribute('data-gr'); } else if(g0.hasAttribute('data-tab2')){ gk = 'tab'; gv = g0.getAttribute('data-tab2'); } else if(g0.tagName === 'SUMMARY'){ gk = 'sum'; gv = g0.parentNode.getAttribute('data-rg'); } } g0 = g0.parentNode; }
  if(gk === 'sum'){ setTimeout(function(){ var dd = $('dsg-lib') && $('dsg-lib').querySelector('details[data-rg="' + gv + '"]'); E.refOpen = dd && dd.open ? gv : (E.refOpen === gv ? null : E.refOpen); }, 0); return; }
  if(gk === 'tab'){ sfx('sfx-sel', 0.3); E.tab = gv; pmApply(); tabsPaint(); libPaint(); return; }
  if(gk === 'gp' || gk === 'gr'){ sfx('sfx-sel', 0.3); var oa = (E.d.guide && E.d.guide.a) || 0.35;
    E.d.guide = gv ? (gk === 'gp' ? { t: 'pose', id: gv, on: 1, a: oa } : { t: 'ref', src: gv, on: 1, a: oa }) : null;
    guideDraw(); libPaint(); dirty(); if(gv) toast(gk === 'gp' ? '🦴 骨架放好了,按「🖌 開始畫」照著畫吧!' : '🖼 參考圖片放在畫布下面了,看著它自己畫出來吧!'); return; }
  while(t && t !== this){ if(t.getAttribute && !a){ if(t.getAttribute('data-add')) a = ['add', t.getAttribute('data-add')]; else if(t.getAttribute('data-slot')) a = ['slot', t.getAttribute('data-slot'), t.getAttribute('data-f')];
      else if(t.getAttribute('data-bt')) a = ['bt', t.getAttribute('data-bt')]; else if(t.getAttribute('data-tk')) a = ['tk', t.getAttribute('data-tk')]; else if(t.getAttribute('data-font')) a = ['font', t.getAttribute('data-font')];
      else if(t.getAttribute('data-addtext')) a = ['text']; else if(t.getAttribute('data-pc')) a = ['pc', t.getAttribute('data-pc')]; else if(t.getAttribute('data-pe')) a = ['pe', t.getAttribute('data-pe')]; else if(t.getAttribute('data-pclr')) a = ['pclr'];
      else if(t.getAttribute('data-pb')) a = ['pb', t.getAttribute('data-pb')];
      else if(t.getAttribute('data-pm')) a = ['pm', t.getAttribute('data-pm')]; else if(t.getAttribute('data-pxn')) a = ['pxn', t.getAttribute('data-pxn')]; else if(t.getAttribute('data-pxt')) a = ['pxt', t.getAttribute('data-pxt')];
      else if(t.getAttribute('data-vsh')) a = ['vsh', t.getAttribute('data-vsh')]; else if(t.getAttribute('data-vf')) a = ['vf', t.getAttribute('data-vf')]; else if(t.getAttribute('data-vs')) a = ['vs', t.getAttribute('data-vs')]; }
    t = t.parentNode; }
  if(!a) return;
  ev.stopPropagation(); sfx('sfx-gentle', 0.35);
  if(a[0] === 'add') addImg(a[1]);
  else if(a[0] === 'slot'){ beginOp(); if(a[2]) E.d.slots[a[1]] = a[2]; else delete E.d.slots[a[1]]; if(a[1] === 'full' && a[2]){ delete E.d.slots.body; delete E.d.slots.btm; delete E.d.slots.head; delete E.d.slots.hair; } if((a[1] === 'head' || a[1] === 'hair') && a[2]) delete E.d.slots.full; endOp(!!a[2]); layersPaint(); libPaint(); }
  else if(a[0] === 'bt'){ if(a[1] === E.d.bt) return; confirmBox('換體型會清掉目前選的人物部件(武器、寵物等不變),確定?', function(ok){ if(!ok) return; beginOp(); E.d.bt = a[1]; E.d.slots = { hair: 'hair_short_' + a[1], eye: 'eye_smile_' + a[1] }; E.d.tint = {}; endOp(); layersPaint(); libPaint(); }); }
  else if(a[0] === 'tk'){ E.tk = a[1]; libPaint(); if(E.sel >= 0 && E.d.items[E.sel].t === 'text'){ beginOp(); E.d.items[E.sel].tk = a[1]; endOp(true); layersPaint(); } }   /* ★ v1.0.2 文字換顏色 = 變色 */
  else if(a[0] === 'font'){ E.font = a[1]; libPaint(); if(E.sel >= 0 && E.d.items[E.sel].t === 'text'){ beginOp(); E.d.items[E.sel].font = a[1]; endOp(); layersPaint(); } }
  else if(a[0] === 'text'){ v = String(($('dsg-tx') || {}).value || '').replace(/\s+/g, ' ').trim().slice(0, D.TEXT_MAX);
    if(!v){ toast('先打字再放進畫面'); return; }
    if(wordHits(v).length){ toast('⚠ 有不適合的字詞,不能放'); return; }
    beginOp(); E.d.items.push({ t: 'text', txt: v, tk: E.tk, font: E.font, fs: 54, x: E.d.W / 2, y: E.d.H * 0.3, s: 1, r: 0, fx: 1, a: 1 }); E.sel = E.d.items.length - 1; endOp(true); layersPaint(); propPaint(); $('dsg-tx').value = ''; }
  else if(a[0] === 'pc'){ E.brush.c = a[1]; E.brush.er = false; if(E.px.tool === 'er') E.px.tool = 'pen'; libPaint(); }
  else if(a[0] === 'pm'){ E.pm = a[1]; lsSet('dsg_pm', a[1]); E.sel = -1; pmApply(); libPaint(); propPaint(); selPaint(); }
  else if(a[0] === 'pxn'){ E.px.n = +a[1]; lsSet('dsg_pxn', a[1]); gridDraw(); libPaint(); }
  else if(a[0] === 'pxt'){ E.px.tool = a[1]; libPaint(); }
  else if(a[0] === 'pb'){ beginOp(); E.d.pb = a[1] === '1'; endOp(); pmApply(); libPaint(); }
  else if(a[0] === 'vsh'){ E.vec.sh = a[1]; libPaint(); }
  else if(a[0] === 'vf' || a[0] === 'vs'){ if(a[0] === 'vf') E.vec.fill = a[1]; else E.vec.st = a[1];
    if(E.sel >= 0 && E.d.items[E.sel] && E.d.items[E.sel].t === 'shape'){ beginOp(); if(a[0] === 'vf') E.d.items[E.sel].fill = a[1]; else E.d.items[E.sel].st = a[1]; endOp(true); layersPaint(); }   /* ★ v1.0.2 形狀填色/外框色 = 變色 */
    libPaint(); }
  else if(a[0] === 'pe'){ E.brush.er = a[1] === '1'; libPaint(); }
  else if(a[0] === 'pclr'){ if(!E.paintStr) return; confirmBox('清掉所有畫的筆跡?(可以按 ↶ 復原)', function(ok){ if(!ok) return; beginOp(); var cv = $('dsg-paint'); cv.getContext('2d').clearRect(0, 0, cv.width, cv.height); E.paintStr = ''; endOp(); }); }
}
function addImg(src){
  var E = S.ed;
  imgGet(src, function(im){
    if(!im){ toast('這個素材還沒下載好,請稍後再試'); return; }
    var big = Math.max(im.naturalWidth, im.naturalHeight) || 1, s = Math.min(E.d.W, E.d.H) * 0.42 / big;
    beginOp();
    E.d.items.push({ t: 'img', src: src, x: E.d.W / 2 + (Math.random() - 0.5) * 60, y: E.d.H / 2 + (Math.random() - 0.5) * 60, s: +s.toFixed(3), r: 0, fx: 1, h: 0, b: 1, a: 1 });
    E.sel = E.d.items.length - 1; endOp(true); layersPaint(); propPaint();
  });
}

/* ── 畫面圖層 ── */
function tkDef(id){ var i; for(i = 0; i < D.TEXT_KINDS.length; i++){ if(D.TEXT_KINDS[i].id === id) return D.TEXT_KINDS[i]; } return D.TEXT_KINDS[0]; }
function fontDef(id){ var i; for(i = 0; i < D.FONTS.length; i++){ if(D.FONTS[i].id === id) return D.FONTS[i]; } return D.FONTS[0]; }
function itemTf(it){ return 'translate(-50%,-50%) rotate(' + (it.r || 0) + 'deg) scale(' + ((it.s || 1) * (it.fx || 1)) + ',' + (it.s || 1) + ')'; }
function filt(h, b){ return (h ? 'hue-rotate(' + h + 'deg) ' : '') + (b != null && b !== 1 ? 'brightness(' + b + ')' : '') || 'none'; }
function textStyle(it){ var k = tkDef(it.tk), f = fontDef(it.font), fs = it.fs || 54;
  return 'font-family:' + f.css.replace(/"/g, "'") + ';font-weight:' + f.w + ';font-size:' + fs + 'px;color:' + k.fg + ';padding:' + Math.round(fs * k.pad) + 'px ' + Math.round(fs * k.pad * 1.4) + 'px;' +
    (k.bg ? 'background:' + k.bg + ';border:' + Math.max(3, Math.round(fs * 0.08)) + 'px solid ' + k.bd + ';border-radius:' + Math.round(fs * k.r * 2) + 'px;' : '') + (k.st ? '-webkit-text-stroke:' + Math.max(2, Math.round(fs * 0.06)) + 'px ' + k.st + ';paint-order:stroke fill;' : ''); }
/* 向量形狀:同一條路徑字串給 SVG(畫面)與 Path2D(匯出)用,兩邊長得一樣 */
function shapePath(sh, w, h){ var i, a, r, p = [], f = function(n){ return Math.round(n * 10) / 10; };
  if(sh === 'rect') return 'M0 0H' + f(w) + 'V' + f(h) + 'H0Z';
  if(sh === 'ellipse') return 'M0 ' + f(h / 2) + 'A' + f(w / 2) + ' ' + f(h / 2) + ' 0 1 0 ' + f(w) + ' ' + f(h / 2) + 'A' + f(w / 2) + ' ' + f(h / 2) + ' 0 1 0 0 ' + f(h / 2) + 'Z';
  if(sh === 'tri') return 'M' + f(w / 2) + ' 0L' + f(w) + ' ' + f(h) + 'L0 ' + f(h) + 'Z';
  if(sh === 'line') return 'M0 ' + f(h / 2) + 'L' + f(w) + ' ' + f(h / 2);
  if(sh === 'heart') return 'M' + f(w / 2) + ' ' + f(h) + 'C' + f(-w * 0.1) + ' ' + f(h * 0.55) + ' ' + f(w * 0.05) + ' ' + f(-h * 0.1) + ' ' + f(w / 2) + ' ' + f(h * 0.25) + 'C' + f(w * 0.95) + ' ' + f(-h * 0.1) + ' ' + f(w * 1.1) + ' ' + f(h * 0.55) + ' ' + f(w / 2) + ' ' + f(h) + 'Z';
  for(i = 0; i < 10; i++){ a = -Math.PI / 2 + i * Math.PI / 5; r = i % 2 ? 0.4 : 1; p.push((i ? 'L' : 'M') + f(w / 2 + Math.cos(a) * r * w / 2) + ' ' + f(h / 2 + Math.sin(a) * r * h / 2)); }
  return p.join('') + 'Z'; }
function shapeSvg(it, i){ var p = (it.sw || 0) / 2 + 2, w = it.w, h = it.h, fl = it.sh === 'line' ? 'none' : (it.fill || 'none');
  return '<svg data-i="' + i + '" width="' + (w + 2 * p) + '" height="' + (h + 2 * p) + '" viewBox="' + (-p) + ' ' + (-p) + ' ' + (w + 2 * p) + ' ' + (h + 2 * p) + '" style="left:' + it.x + 'px;top:' + it.y + 'px;transform:' + itemTf(it) + ';opacity:' + (it.a == null ? 1 : it.a) + '">' +
    '<path d="' + shapePath(it.sh, w, h) + '" fill="' + esc(fl) + '" stroke="' + esc(it.sw ? it.st : 'none') + '" stroke-width="' + (it.sw || 0) + '" stroke-linejoin="round" stroke-linecap="round"/></svg>'; }
function slotList(d){ var a = [], i, sl, f; if(d.kind !== 'skin' || d.hd) return a;   /* ★ v1.0.3 手繪作品沒有人物底座 */
  if(!d.slots.full) a.push(['body_' + d.bt, null]);
  for(i = 0; i < D.SLOTS.length; i++){ sl = D.SLOTS[i].id; f = d.slots[sl]; if(f) a.push([f, d.tint[sl] || null]); }
  return a; }
function layersPaint(){
  var E = S.ed, d = E.d, h = '', sl = slotList(d), i, it;
  for(i = 0; i < sl.length; i++) h += '<img class="slot" src="' + esc(srcUrl('av:' + sl[i][0])) + '" style="width:' + d.W + 'px;height:' + d.H + 'px;filter:' + (sl[i][1] ? filt(sl[i][1][0], sl[i][1][1]) : 'none') + '">';
  for(i = 0; i < d.items.length; i++){ it = d.items[i];
    if(it.t === 'img') h += '<img data-i="' + i + '" src="' + esc(srcUrl(it.src)) + '" style="left:' + it.x + 'px;top:' + it.y + 'px;transform:' + itemTf(it) + ';opacity:' + (it.a == null ? 1 : it.a) + ';filter:' + filt(it.h, it.b) + '">';
    else if(it.t === 'shape') h += shapeSvg(it, i);
    else if(it.t === 'text') h += '<div class="txt" data-i="' + i + '" style="left:' + it.x + 'px;top:' + it.y + 'px;transform:' + itemTf(it) + ';opacity:' + (it.a == null ? 1 : it.a) + ';' + textStyle(it) + '">' + esc(it.txt) + '</div>'; }
  $('dsg-ly').innerHTML = h;
  var ims = $('dsg-ly').querySelectorAll('img[data-i]'); for(i = 0; i < ims.length; i++) ims[i].onload = selPaint;
  selPaint();
}
function itemEl(i){ return $('dsg-ly') ? $('dsg-ly').querySelector('[data-i="' + i + '"]') : null; }
function itemSize(i){ var el = itemEl(i), it = S.ed.d.items[i], w = 0, h = 0; if(!el) return [0, 0];
  if(it.t === 'img'){ w = el.naturalWidth || el.width; h = el.naturalHeight || el.height; } else if(it.t === 'shape'){ w = it.w + (it.sw || 0) + 4; h = it.h + (it.sw || 0) + 4; } else { w = el.offsetWidth; h = el.offsetHeight; }
  return [w * (it.s || 1), h * (it.s || 1)]; }
function selPaint(){
  var E = S.ed, b = $('dsg-sel'), it, sz;
  if(!E || !b) return;
  if(E.sel < 0 || !E.d.items[E.sel] || locked()){ b.style.display = 'none'; return; }
  it = E.d.items[E.sel]; sz = itemSize(E.sel);
  b.style.display = 'block'; b.style.left = (it.x - sz[0] / 2) + 'px'; b.style.top = (it.y - sz[1] / 2) + 'px'; b.style.width = sz[0] + 'px'; b.style.height = sz[1] + 'px'; b.style.transform = 'rotate(' + (it.r || 0) + 'deg)';
  b.style.borderWidth = Math.max(2, 3 / E.k) + 'px';
  var hd = b.firstChild, hs = 44 / E.k; hd.style.width = hd.style.height = hs + 'px'; hd.style.right = hd.style.bottom = (-hs / 2) + 'px'; hd.style.borderWidth = (4 / E.k) + 'px';
}
function itemUpd(i){ var el = itemEl(i), it = S.ed.d.items[i]; if(!el) return; el.style.left = it.x + 'px'; el.style.top = it.y + 'px'; el.style.transform = itemTf(it); el.style.opacity = it.a == null ? 1 : it.a; if(it.t === 'img') el.style.filter = filt(it.h, it.b); selPaint(); }

/* ── 右欄:選到的東西 ── */
function propPaint(){
  var E = S.ed, el = $('dsg-prop'), h = '', it, nm;
  if(!el) return;
  if(E.sel < 0 || !E.d.items[E.sel]){
    h += '<div class="dsg-sec">💡 小提示</div><div>' + (E.r.kind === 'skin' ? '用 🖌 畫筆從白紙開始畫;不知道怎麼畫身體,打開「🦴 動作骨架」照著姿勢畫。' : '用 🖌 畫筆畫出你的裝飾;想看荒島的東西長怎樣,打開「🖼 參考圖片」看著畫。') + '</div><div style="margin-top:1vmin">文字貼片和形狀可以點一下選它,拖曳移動、拉粉紅圓點放大縮小和轉方向。</div>';   /* ★ v1.0.3 手繪原創提示 */
    h += '<div class="dsg-sec">📏 繳交標準</div>' + qualityMini();
    el.innerHTML = h; el.onclick = null; el.oninput = null; return;
  }
  it = E.d.items[E.sel]; nm = it.t === 'text' ? '🔤 ' + it.txt : it.t === 'shape' ? '🔷 形狀' : (it.src.indexOf('isl:') === 0 ? '🖼 素材' : '🎩 配件');
  h += '<div class="dsg-sec">' + esc(nm) + '</div>';
  h += '<label>大小</label><input type="range" min="5" max="400" value="' + Math.round((it.s || 1) * 100) + '" data-p="s">';
  h += '<label>角度</label><input type="range" min="-180" max="180" value="' + Math.round(it.r || 0) + '" data-p="r">';
  if(it.t === 'img'){ h += '<label>顏色</label><input type="range" min="-180" max="180" step="5" value="' + (it.h || 0) + '" data-p="h">'; h += '<label>亮度</label><input type="range" min="40" max="160" value="' + Math.round((it.b || 1) * 100) + '" data-p="b">'; }
  else if(it.t === 'shape'){ h += '<div style="display:flex;gap:1.4vmin;margin-top:1vmin;align-items:center">' + (it.sh !== 'line' ? '填色 <input type="color" data-p="fill" value="' + (it.fill && it.fill !== 'none' ? it.fill : '#ffffff') + '">' : '') + ' 外框 <input type="color" data-p="st" value="' + (it.st || '#000000') + '"></div>';
    h += '<label>外框粗細</label><input type="range" min="0" max="30" value="' + (it.sw | 0) + '" data-p="sw">'; }
  else h += '<label>字的大小</label><input type="range" min="20" max="140" value="' + (it.fs || 54) + '" data-p="fs">';
  h += '<label>透明度</label><input type="range" min="30" max="100" value="' + Math.round((it.a == null ? 1 : it.a) * 100) + '" data-p="a">';
  h += '<div class="row"><button class="dsg-b ghost" data-c="flip">↔ 翻面</button><button class="dsg-b ghost" data-c="up">⬆ 往前</button><button class="dsg-b ghost" data-c="down">⬇ 往後</button><button class="dsg-b ghost" data-c="dup">⧉ 複製</button><button class="dsg-b red" data-c="del">🗑 刪除</button><button class="dsg-b ghost" data-c="none">✓ 取消選取</button></div>';
  el.innerHTML = h;
  el.oninput = function(ev){ var p = ev.target.getAttribute('data-p'), v = +ev.target.value, it2 = E.d.items[E.sel]; if(!p || !it2 || locked()) return;
    if(!E._pOp){ beginOp(); E._pOp = 1; E._pCol = 0; }
    if(p === 'h' || p === 'b' || p === 'fill' || p === 'st') E._pCol = 1;   /* ★ v1.0.2 色相/亮度/填色/外框色滑桿 = 變色;大小、旋轉、透明度、粗細、字級不算 */
    if(p === 's') it2.s = v / 100; else if(p === 'r') it2.r = v; else if(p === 'h') it2.h = v; else if(p === 'b') it2.b = v / 100; else if(p === 'a') it2.a = v / 100;
    else if(p === 'fs'){ it2.fs = v; layersPaint(); return; }
    else if(p === 'fill' || p === 'st'){ it2[p] = ev.target.value; layersPaint(); return; }
    else if(p === 'sw'){ it2.sw = v; layersPaint(); return; }
    itemUpd(E.sel); };
  el.onchange = function(ev){ if(ev.target.getAttribute('data-p') && E._pOp){ E._pOp = 0; endOp(!!E._pCol); E._pCol = 0; } };
  el.onclick = function(ev){ var c = ev.target.getAttribute && ev.target.getAttribute('data-c'), a = E.d.items, i = E.sel, tmp; if(!c || locked()) return; ev.stopPropagation(); sfx('sfx-tap', 0.3);
    if(c === 'none'){ E.sel = -1; propPaint(); selPaint(); return; }
    beginOp();
    if(c === 'flip') a[i].fx = -(a[i].fx || 1);
    else if(c === 'up' && i < a.length - 1){ tmp = a[i]; a[i] = a[i + 1]; a[i + 1] = tmp; E.sel = i + 1; }
    else if(c === 'down' && i > 0){ tmp = a[i]; a[i] = a[i - 1]; a[i - 1] = tmp; E.sel = i - 1; }
    else if(c === 'dup'){ tmp = JSON.parse(JSON.stringify(a[i])); tmp.x += 30; tmp.y += 30; a.push(tmp); E.sel = a.length - 1; }
    else if(c === 'del'){ a.splice(i, 1); E.sel = -1; }
    endOp(c === 'dup'); layersPaint(); propPaint(); };   /* 只有「複製一份」算增加;翻轉/往前/往後/刪除不算 */
}

/* ── 畫面手勢:選取/拖曳/縮放旋轉/畫筆 ── */
function stageBind(){
  var E = S.ed, st = $('dsg-stage'), cv = $('dsg-paint'), g = null, ctx = cv.getContext('2d');
  function pt(e){ var rc = st.getBoundingClientRect(); return { x: (e.clientX - rc.left) / E.k, y: (e.clientY - rc.top) / E.k }; }
  st.onpointerdown = function(e){
    if(locked()) return;
    var t = e.target, p = pt(e), i, it, rc;
    if(E.tab === 'paint' && E.pm === 'pixel'){ e.preventDefault(); beginOp(); g = { m: 'px', pid: e.pointerId };
      try{ cv.setPointerCapture(e.pointerId); }catch(x){}
      if(E.px.tool === 'fill'){ pxFill(p); g.done = true; } else pxDot(p); return; }
    if(E.tab === 'paint' && E.pm === 'vector'){
      var hit = t; while(hit && hit !== st && !(hit.getAttribute && (hit.getAttribute('data-i') != null || hit.getAttribute('data-h')))) hit = hit.parentNode;
      if(!hit || hit === st){ e.preventDefault(); g = { m: 'vec', pid: e.pointerId, x0: p.x, y0: p.y, made: false }; try{ st.setPointerCapture(e.pointerId); }catch(x){} return; }
      t = hit; }
    if(E.tab === 'paint' && E.pm !== 'vector'){ e.preventDefault(); beginOp(); g = { m: 'paint', pid: e.pointerId, lx: p.x, ly: p.y };
      try{ cv.setPointerCapture(e.pointerId); }catch(x){}
      ctx.globalCompositeOperation = E.brush.er ? 'destination-out' : 'source-over'; ctx.strokeStyle = E.brush.c; ctx.fillStyle = E.brush.c; ctx.lineWidth = E.brush.w; ctx.lineCap = ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.arc(p.x, p.y, E.brush.w / 2, 0, Math.PI * 2); ctx.fill(); return; }
    if(t.getAttribute && t.getAttribute('data-h') && E.sel >= 0){ e.preventDefault(); it = E.d.items[E.sel];
      g = { m: 'rs', pid: e.pointerId, s0: it.s || 1, r0: it.r || 0, d0: Math.max(10, Math.sqrt((p.x - it.x) * (p.x - it.x) + (p.y - it.y) * (p.y - it.y))), a0: Math.atan2(p.y - it.y, p.x - it.x), moved: false };
      try{ st.setPointerCapture(e.pointerId); }catch(x){} return; }
    while(t && t !== st && t.parentNode && !(t.getAttribute && t.getAttribute('data-i') != null) && t.id !== 'dsg-ly') t = t.parentNode;   /* 向量形狀的 <path> 往上找到 <svg data-i> */
    i = t && t.getAttribute ? t.getAttribute('data-i') : null;
    if(i == null){ if(E.sel >= 0){ E.sel = -1; propPaint(); selPaint(); } return; }
    e.preventDefault(); i = +i; if(E.sel !== i){ E.sel = i; propPaint(); } it = E.d.items[i];
    g = { m: 'mv', pid: e.pointerId, ox: it.x - p.x, oy: it.y - p.y, moved: false }; selPaint();
    try{ st.setPointerCapture(e.pointerId); }catch(x){}
  };
  st.onpointermove = function(e){
    if(!g || e.pointerId !== g.pid) return;
    var p = pt(e), it, d;
    if(g.m === 'paint'){ ctx.beginPath(); ctx.moveTo(g.lx, g.ly); ctx.lineTo(p.x, p.y); ctx.stroke(); g.lx = p.x; g.ly = p.y; g.moved = true; return; }
    if(g.m === 'px'){ if(!g.done) pxDot(p); return; }
    if(g.m === 'vec'){ var w = Math.abs(p.x - g.x0), hh = Math.abs(p.y - g.y0);
      if(!g.made){ if(w < 8 && hh < 8) return; beginOp(); g.made = true; E.d.items.push({ t: 'shape', sh: E.vec.sh, w: 10, h: 10, fill: E.vec.fill, st: E.vec.st, sw: E.vec.sw, x: g.x0, y: g.y0, s: 1, r: 0, fx: 1, a: 1 }); E.sel = E.d.items.length - 1; }
      it = E.d.items[E.sel]; if(E.vec.sh === 'line'){ it.w = Math.max(10, Math.round(Math.sqrt(w * w + hh * hh))); it.h = 10; it.r = Math.round(Math.atan2(p.y - g.y0, p.x - g.x0) * 180 / Math.PI); it.x = (g.x0 + p.x) / 2; it.y = (g.y0 + p.y) / 2; }
      else { it.w = Math.max(10, Math.round(w)); it.h = Math.max(10, Math.round(hh)); it.x = (g.x0 + p.x) / 2; it.y = (g.y0 + p.y) / 2; }
      layersPaint(); return; }
    it = E.d.items[E.sel]; if(!it) return;
    if(!g.moved){ g.moved = true; beginOp(); }
    if(g.m === 'mv'){ it.x = clamp(Math.round(p.x + g.ox), -100, E.d.W + 100); it.y = clamp(Math.round(p.y + g.oy), -100, E.d.H + 100); }
    else { d = Math.sqrt((p.x - it.x) * (p.x - it.x) + (p.y - it.y) * (p.y - it.y)); it.s = clamp(+(g.s0 * d / g.d0).toFixed(3), 0.05, 6); it.r = Math.round(g.r0 + (Math.atan2(p.y - it.y, p.x - it.x) - g.a0) * 180 / Math.PI); if(it.r > 180) it.r -= 360; if(it.r < -180) it.r += 360; }
    itemUpd(E.sel);
  };
  st.onpointerup = st.onpointercancel = function(e){
    if(!g || e.pointerId !== g.pid) return;
    if(g.m === 'paint' || g.m === 'px'){ ctx.globalCompositeOperation = 'source-over'; try{ E.paintStr = cv.toDataURL('image/png'); }catch(x){} endOp(g.m === 'paint' ? !E.brush.er : E.px.tool !== 'er'); }   /* 畫一筆/點格子/填色算增加,橡皮擦不算 */
    else if(g.m === 'vec'){ if(!g.made){ beginOp(); E.d.items.push({ t: 'shape', sh: E.vec.sh, w: 120, h: E.vec.sh === 'line' ? 10 : 120, fill: E.vec.fill, st: E.vec.st, sw: E.vec.sw, x: g.x0, y: g.y0, s: 1, r: 0, fx: 1, a: 1 }); E.sel = E.d.items.length - 1; layersPaint(); }
      endOp(true); propPaint(); }   /* 畫出一個新形狀 = 增加 */
    else if(g.moved){ endOp(); propPaint(); }
    g = null;
  };
}

/* ── 像素點陣:畫在同一張畫筆層,但一律對齊格子;油漆桶以格子為單位填滿相連同色區 ── */
function pxCell(p){ var E = S.ed, c = E.d.W / E.px.n; return { c: c, ix: Math.floor(p.x / c), iy: Math.floor(p.y / c) }; }
function pxDot(p){ var E = S.ed, q = pxCell(p), x = $('dsg-paint').getContext('2d'), X = Math.round(q.ix * q.c), Y = Math.round(q.iy * q.c), Wd = Math.round((q.ix + 1) * q.c) - X, Hd = Math.round((q.iy + 1) * q.c) - Y;
  if(q.ix < 0 || q.iy < 0 || X >= E.d.W || Y >= E.d.H) return;
  if(E.px.tool === 'er') x.clearRect(X, Y, Wd, Hd); else { x.fillStyle = E.brush.c; x.fillRect(X, Y, Wd, Hd); } }
function pxFill(p){
  var E = S.ed, q = pxCell(p), cv = $('dsg-paint'), x = cv.getContext('2d'), n = E.px.n, rows = Math.ceil(E.d.H / q.c), dt = x.getImageData(0, 0, cv.width, cv.height).data, seen = {}, st = [[q.ix, q.iy]], key, cur, k0, cnt = 0;
  function col(ix, iy){ var px = Math.min(cv.width - 1, Math.floor((ix + 0.5) * q.c)), py = Math.min(cv.height - 1, Math.floor((iy + 0.5) * q.c)), o = (py * cv.width + px) * 4; return dt[o + 3] < 20 ? 'none' : dt[o] + ',' + dt[o + 1] + ',' + dt[o + 2]; }
  if(q.ix < 0 || q.iy < 0 || q.ix >= n || q.iy >= rows) return;
  k0 = col(q.ix, q.iy); x.fillStyle = E.brush.c;
  while(st.length && cnt < 6000){ cur = st.pop(); key = cur[0] + '_' + cur[1];
    if(seen[key] || cur[0] < 0 || cur[1] < 0 || cur[0] >= n || cur[1] >= rows || col(cur[0], cur[1]) !== k0) continue;
    seen[key] = 1; cnt++;
    x.fillRect(Math.round(cur[0] * q.c), Math.round(cur[1] * q.c), Math.round((cur[0] + 1) * q.c) - Math.round(cur[0] * q.c), Math.round((cur[1] + 1) * q.c) - Math.round(cur[1] * q.c));
    st.push([cur[0] + 1, cur[1]], [cur[0] - 1, cur[1]], [cur[0], cur[1] + 1], [cur[0], cur[1] - 1]); }
}

/* ══ 合成整張圖(匯出/縮圖/品質檢查/審核共用) ══ */
function renderComposite(flat, maxSide, cb){
  var E = S.ed, d = E.d, W = d.W, H = d.H, sc = maxSide ? Math.min(1, maxSide / Math.max(W, H)) : 1, cv = document.createElement('canvas'), x, list = [], i, it, n = 0;
  cv.width = Math.round(W * sc); cv.height = Math.round(H * sc); x = cv.getContext('2d');
  if(flat){ x.fillStyle = '#ffffff'; x.fillRect(0, 0, cv.width, cv.height); }
  var sl = slotList(d);
  for(i = 0; i < sl.length; i++) list.push({ slot: 1, src: 'av:' + sl[i][0], tint: sl[i][1] });
  for(i = 0; i < d.items.length; i++){ it = JSON.parse(JSON.stringify(d.items[i])); delete it.im; list.push(it); }   /* 複本:圖片物件不可以寫回作品資料(會被存檔、算進指紋) */
  function draw(){
    var j, o, c, pc = $('dsg-paint');
    x.setTransform(sc, 0, 0, sc, 0, 0);
    if(d.pb && pc) x.drawImage(pc, 0, 0, W, H);   /* 畫的東西放最下層(當背景) */
    for(j = 0; j < list.length; j++){ o = list[j];
      if(o.slot){ if(o.im){ c = o.tint ? tintCv(o.im, o.tint[0], o.tint[1]) : o.im; x.drawImage(c, 0, 0, W, H); } continue; }
      x.save(); x.globalAlpha = o.a == null ? 1 : o.a; x.translate(o.x, o.y); x.rotate((o.r || 0) * Math.PI / 180); x.scale((o.s || 1) * (o.fx || 1), o.s || 1);
      if(o.t === 'img' && o.im){ c = (o.h || (o.b != null && o.b !== 1)) ? tintCv(o.im, o.h, o.b) : o.im; x.drawImage(c, -c.width / 2, -c.height / 2); }
      else if(o.t === 'text') drawText(x, o);
      else if(o.t === 'shape' && window.Path2D){ x.translate(-o.w / 2, -o.h / 2); c = new Path2D(shapePath(o.sh, o.w, o.h));
        if(o.sh !== 'line' && o.fill && o.fill !== 'none'){ x.fillStyle = o.fill; x.fill(c); }
        if(o.sw){ x.lineWidth = o.sw; x.strokeStyle = o.st; x.lineJoin = 'round'; x.lineCap = 'round'; x.stroke(c); } }
      x.restore(); }
    if(!d.pb && pc) x.drawImage(pc, 0, 0, W, H);
    x.setTransform(1, 0, 0, 1, 0, 0);
    cb(cv);
  }
  /* 先數完再載:已快取的圖會「同步」回呼,邊數邊載會在還沒數完時就提早畫(舊平板/第二次打開作品時會出錯) */
  for(i = 0; i < list.length; i++){ if(list[i].src) n++; }
  n++;
  for(i = 0; i < list.length; i++){ it = list[i]; if(it.src){ (function(o){ imgGet(o.src, function(im){ o.im = im; n--; if(n === 0) draw(); }); })(it); } }
  n--; if(n === 0) draw();
}
function textBox(x, o){ var k = tkDef(o.tk), f = fontDef(o.font), fs = o.fs || 54, tw; x.font = f.w + ' ' + fs + 'px ' + f.css; tw = x.measureText(o.txt).width; return { k: k, fs: fs, w: tw + fs * k.pad * 2.8, h: fs * (1 + 2 * k.pad) }; }
function drawText(x, o){
  var b = textBox(x, o), k = b.k, w = b.w, h = b.h, r = k.r * h, lw;
  if(k.bg){ lw = Math.max(3, Math.round(b.fs * 0.08)); x.beginPath(); x.moveTo(-w / 2 + r, -h / 2); x.lineTo(w / 2 - r, -h / 2); x.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); x.lineTo(w / 2, h / 2 - r); x.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); x.lineTo(-w / 2 + r, h / 2); x.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); x.lineTo(-w / 2, -h / 2 + r); x.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2); x.closePath();
    x.fillStyle = k.bg; x.fill(); x.lineWidth = lw; x.strokeStyle = k.bd; x.stroke(); }
  x.textAlign = 'center'; x.textBaseline = 'middle';
  if(k.st){ x.lineWidth = Math.max(2, Math.round(b.fs * 0.12)); x.strokeStyle = k.st; x.lineJoin = 'round'; x.strokeText(o.txt, 0, 0); }
  x.fillStyle = k.fg; x.fillText(o.txt, 0, 0);
}

/* ══ 基本品質門檻(老師:達標才能繳交,告訴學生哪裡不足) ══ */
function qualityStats(cv){
  var x = cv.getContext('2d'), w = cv.width, h = cv.height, d = x.getImageData(0, 0, w, h).data, i, px, minX = w, minY = h, maxX = -1, maxY = -1, n = 0, bins = {}, r, g, b, mx, mn, s, v, hh, k, cnt = 0, kk;
  for(i = 0; i < d.length; i += 4){ if(d[i + 3] < 40) continue; px = (i / 4) | 0; var X = px % w, Y = (px / w) | 0;
    if(X < minX) minX = X; if(X > maxX) maxX = X; if(Y < minY) minY = Y; if(Y > maxY) maxY = Y; n++;
    r = d[i] / 255; g = d[i + 1] / 255; b = d[i + 2] / 255; mx = Math.max(r, g, b); mn = Math.min(r, g, b); v = mx; s = mx ? (mx - mn) / mx : 0;
    if(s < 0.18 || v < 0.15) k = 'g' + Math.min(4, (v * 5) | 0);
    else { if(mx === r) hh = ((g - b) / (mx - mn) + 6) % 6; else if(mx === g) hh = (b - r) / (mx - mn) + 2; else hh = (r - g) / (mx - mn) + 4; k = 'c' + (((hh * 2) | 0) % 12); }
    bins[k] = (bins[k] | 0) + 1; }
  for(kk in bins){ if(bins.hasOwnProperty(kk) && bins[kk] >= n * 0.01) cnt++; }
  return { bbox: maxX < 0 ? 0 : ((maxX - minX + 1) * (maxY - minY + 1)) / (w * h), fill: n / (w * h), colors: cnt };
}
function qualityCheck(cb){
  var E = S.ed, q = qOf(E.r.kind);
  renderComposite(false, 360, function(cv){
    var st = qualityStats(cv), a = [], d = E.d, bald = false;
    a.push({ ok: (d.ops | 0) >= q.ops, ic: '✋', n: '操作次數', have: (d.ops | 0) + ' 次', need: q.ops + ' 次以上', tip: '只有「增加」和「變色」的動作才算:放素材、放文字、畫形狀、用畫筆或像素筆加細節(每一筆都算)、複製一份、選人物部件、換顏色;而且改完要跟原本不一樣(選回同一個顏色、換回原本的樣子不算)。拖曳、縮放、旋轉、往前往後不算' });
    a.push({ ok: st.bbox >= q.bbox, ic: '📐', n: '圖案範圍', have: Math.round(st.bbox * 100) + '%', need: Math.round(q.bbox * 100) + '% 以上', tip: d.kind === 'skin' ? '只有人物太窄了:讓角色拿武器、帶寵物站旁邊,或加上特效,讓作品撐滿畫面' : '把裝飾放大、多擺幾樣東西,讓作品撐滿畫面' });
    a.push({ ok: st.fill >= q.fill, ic: '🖍', n: '上色比例', have: Math.round(st.fill * 100) + '%', need: Math.round(q.fill * 100) + '% 以上', tip: '空白太多了:把東西放大一點,或用畫筆把空的地方補上圖案' });
    a.push({ ok: st.colors >= q.colors, ic: '🌈', n: '顏色數量', have: st.colors + ' 種', need: q.colors + ' 種以上', tip: '顏色太少了:換不同顏色的衣服、用 🎨 顏色滑桿改色,或用畫筆加顏色' });
    if(d.kind === 'skin'){ bald = !d.slots.full && !d.slots.head && !d.slots.hair; a.push({ ok: !bald, ic: '💇', n: '有頭髮', have: bald ? '沒有' : '有', need: '有', tip: '在「🧍 人物」選一個髮型、頭部造型或整套造型' }); }
    cb(a, st);
  });
}
function qualityMini(){ var E = S.ed, q = qOf(E.r.kind); return '<div class="dsg-tip" style="line-height:1.6;opacity:1">✋ 操作 ' + (E.d.ops | 0) + '/' + q.ops + ' 次<br>📐 圖案範圍 ' + Math.round(q.bbox * 100) + '% 以上<br>🖍 上色 ' + Math.round(q.fill * 100) + '% 以上<br>🌈 顏色 ' + q.colors + ' 種以上</div><button class="dsg-b ghost" data-qk="1" style="margin-top:1vmin;font-size:1.8vmin" onclick="window.DSGW.qShow()">🔍 檢查我的作品</button>'; }
function qShow(cb){
  qualityCheck(function(a){
    var h = '<h3>📏 繳交標準檢查</h3>', i, ok = true;
    for(i = 0; i < a.length; i++){ if(!a[i].ok) ok = false; h += '<div class="qk"><span class="ic">' + (a[i].ok ? '✅' : '❌') + '</span><div><b>' + a[i].ic + ' ' + esc(a[i].n) + '</b>:現在 ' + esc(a[i].have) + '(要 ' + esc(a[i].need) + ')' + (a[i].ok ? '' : '<small>💡 ' + esc(a[i].tip) + '</small>') + '</div></div>'; }
    h += '<p>' + (ok ? '🎉 全部達標,可以繳交了!' : '還有 ❌ 的項目沒達到,改好才能繳交喔。') + '</p>';
    if(cb) cb(ok, h); else modal(h);
  });
}

/* ══ 繳交流程 ══
   ①登入/鎖定/本月額度 ②基本標準 ③規範提醒卡 ④作品名與筆名 ⑤「繳交後就不能改」確認 ⑥智慧審核 ⑦上傳+鎖定 */
function submitStart(){
  var E = S.ed, r = E.r, f = fb();
  if(locked()){ modal(r.lock === 'live' ? '<p>✅ 這件作品老師已經通過了!</p>' : '<p>🔒 已經繳交,等老師審核中。老師退件後才能修改。</p>'); return; }
  if(S.guest){ modal('<p>要登入帳號才能繳交作品喔!</p>', [{ t: '取消', cls: 'ghost' }, { t: '🔑 登入', cb: function(){ saveLocal(false); if(B.login) B.login(); } }]); return; }
  if(!ownerOk()){ toast('帳號已經換人了,請重新進入'); return; }
  if(!f || !f.db){ toast('連不上雲端,請檢查網路'); return; }
  saveLocal(true); busy(true, '確認本月繳交狀態…');
  srvSync(function(){
    var ym = ymOf(), resub = !!(r.sub && r.back), id = resub ? r.sub.id : ym + '_' + S.uid;
    f.db.collection('designSubmit').doc(id).get().then(function(d){
      busy(false);
      var x = d && d.exists ? d.data() : null;
      if(x && !(resub && x.did === r.id && x.st === 'back')){ modal('<p>這個月已經繳交過「' + esc(x.title || '') + '」了(' + subChip(x.st) + ')。</p><p>每人每月 1 件,下個月 1 日早上 8:00 就可以再繳交。</p>'); return; }
      E.subId = id; E.resub = resub;
      qShow(function(ok, h){ if(!ok){ modal(h); return; } rulesCard(function(){ titleForm(); }); });
    })['catch'](function(){ busy(false); modal('<p>讀不到繳交狀態,請老師確認規則已發布,或稍後再試。</p>'); });
  });
}
function titleForm(){
  var E = S.ed, r = E.r, h = '<h3>📝 作品資料</h3>', i, A = D.TITLE_A, Bs = D.TITLE_B[r.kind], pen = lsGet('dsg_pen_' + S.uid) || '';
  h += '<label>作品名</label><div style="display:flex;gap:1vmin"><select id="dsg-ta">'; for(i = 0; i < A.length; i++) h += '<option>' + esc(A[i]) + '</option>'; h += '</select><select id="dsg-tb">'; for(i = 0; i < Bs.length; i++) h += '<option>' + esc(Bs[i]) + '</option>'; h += '</select></div>';
  h += '<label style="display:block;margin-top:1.4vmin">筆名(2~8 個字,上架時顯示;老師看得到你的真名)</label><input type="text" id="dsg-pen" maxlength="8" value="' + esc(pen) + '"><div id="dsg-penm" style="color:#c0392b;min-height:2.6vmin"></div>';
  modal(h, [{ t: '取消', cls: 'ghost' }, { t: '下一步 ▶', keep: true, cb: function(){
    var p = String($('dsg-pen').value || '').trim();
    if(p.length < 2){ $('dsg-penm').textContent = '筆名要 2~8 個字'; return; }
    if(wordHits(p).length){ $('dsg-penm').textContent = '筆名有不適合的字詞(也不能用同學的名字),請換一個'; return; }
    r.title = $('dsg-ta').value + $('dsg-tb').value; r.pen = p; lsSet('dsg_pen_' + S.uid, p); modalClose();
    confirmBox('<b>確認繳交「' + esc(r.title) + '」?</b><br>繳交後作品就<b>鎖住不能修改</b>了;要等老師審核,老師退件(會附上修改建議)才能再改。', function(ok){ if(ok) moderate(); }, '📤 確認繳交');
  } }]);
}
/* ⑥ 智慧審核 */
function textItemsBoxes(){ var E = S.ed, a = [], i, it, cx = document.createElement('canvas').getContext('2d'), b, w, h, c, s, ex, ey;
  for(i = 0; i < E.d.items.length; i++){ it = E.d.items[i]; if(it.t !== 'text') continue; b = textBox(cx, it); w = b.w * (it.s || 1); h = b.h * (it.s || 1); c = Math.abs(Math.cos((it.r || 0) * Math.PI / 180)); s = Math.abs(Math.sin((it.r || 0) * Math.PI / 180));
    ex = (w * c + h * s) / 2 * 1.15; ey = (w * s + h * c) / 2 * 1.15; a.push({ x0: it.x - ex, x1: it.x + ex, y0: it.y - ey, y1: it.y + ey, t: it.txt }); }
  return a; }
function moderate(){
  var E = S.ed, r = E.r, f = fb(), d = E.d, txt = [r.title, r.pen], i, hits, hash;
  for(i = 0; i < d.items.length; i++){ if(d.items[i].t === 'text') txt.push(d.items[i].txt); }
  hits = wordHits(txt.join(' '));
  hash = hashStr(JSON.stringify(d) + '|' + E.paintStr);
  E.hash = hash;
  busy(true, '電腦正在檢查作品…');
  renderComposite(false, 0, function(png){
    renderComposite(true, 1024, function(flat){
      E.png = png.toDataURL('image/png'); E.th = (function(){ var c = document.createElement('canvas'), k = 240 / Math.max(png.width, png.height); c.width = Math.round(png.width * k); c.height = Math.round(png.height * k); var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(png, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', 0.8); })();
      f.db.collection('designPass').doc(S.uid + '_' + hash).get().then(function(p){
        if(p && p.exists){ busy(false); uploadWork({ v: 'teacher' }); return; }
        visionCheck(flat, function(res){
          busy(false);
          if(res.err){ modal('<p>⚠ 檢查系統暫時連不上,請等一下再按一次「📤 確認繳交」。</p>'); return; }
          var why = [], det = { s: res.s || {}, w: hits.concat(res.w || []).slice(0, 12), lab: res.lab || 0 };
          if(hits.length || (res.w && res.w.length)) why.push('text');
          if(res.lab) why.push('label');
          if(res.bad && res.bad.length) why.push('img');
          if(res.nokey) why.push('nokey');
          if(!why.length){ uploadWork({ v: 'ai', s: res.s || {} }); return; }
          flagWrite(why, det);
        });
      })['catch'](function(){ busy(false); modal('<p>讀不到審核資料,請稍後再試。</p>'); });
    });
  });
}
function visionCheck(flat, cb){
  if(!S.vkey){ cb({ nokey: true }); return; }
  var b64 = flat.toDataURL('image/jpeg', 0.85).split(',')[1], x, sc = flat.width / S.ed.d.W, boxes = textItemsBoxes(), th = vth();
  try{
    x = new XMLHttpRequest(); x.open('POST', 'https://vision.googleapis.com/v1/images:annotate?key=' + encodeURIComponent(S.vkey), true); x.timeout = 20000; x.setRequestHeader('Content-Type', 'application/json');
    x.onload = function(){
      var j = null, a, s, k, out = { s: {}, bad: [], w: [], lab: 0 }, t, i, v, cx, cy, in_, m, tok;
      try{ j = JSON.parse(x.responseText); }catch(e){}
      a = j && j.responses && j.responses[0];
      if(x.status !== 200 || !a || a.error){ cb({ err: true }); return; }
      s = a.safeSearchAnnotation || {};
      for(k in D.VCAT){ if(D.VCAT.hasOwnProperty(k)){ v = D.VLEVEL[s[k]] || 0; out.s[k] = v; if(v >= th[k]) out.bad.push(k); } }
      t = a.textAnnotations || [];
      if(t.length) out.w = wordHits(t[0].description || '');
      for(i = 1; i < t.length; i++){ tok = norm(t[i].description || '').c; if(!tok || (/^[0-9a-z]$/.test(tok))) continue;
        m = (t[i].boundingPoly && t[i].boundingPoly.vertices) || []; if(m.length < 4) continue;
        cx = (((m[0].x || 0) + (m[2].x || 0)) / 2) / sc; cy = (((m[0].y || 0) + (m[2].y || 0)) / 2) / sc; in_ = false;
        for(v = 0; v < boxes.length; v++){ if(cx >= boxes[v].x0 && cx <= boxes[v].x1 && cy >= boxes[v].y0 && cy <= boxes[v].y1){ in_ = true; break; } }
        if(!in_) out.lab++; }
      cb(out);
    };
    x.onerror = x.ontimeout = function(){ cb({ err: true }); };
    x.send(JSON.stringify({ requests: [{ image: { content: b64 }, features: [{ type: 'SAFE_SEARCH_DETECTION' }, { type: 'TEXT_DETECTION' }], imageContext: { languageHints: ['zh-Hant', 'en', 'ja', 'ko'] } }] }));
  }catch(e){ cb({ err: true }); }
}
/* 沒通過:不上傳;寫一筆給老師看(designFlags/{月}_{uid}_{指紋},同一版本重按只累加次數) */
function flagWrite(why, det){
  var E = S.ed, r = E.r, f = fb(), u = user(), F = FV(), id = ymOf() + '_' + S.uid + '_' + E.hash, o;
  if(!ownerOk()) return;
  o = { uid: S.uid, ym: ymOf(), hash: E.hash, kind: r.kind, did: r.id, title: r.title || '', pen: r.pen || '', nm: String(uName(u)).slice(0, 60), cls: clsOf(), th: E.th, why: why, det: det, st: 'flag', at: F ? F.serverTimestamp() : now(), n: F ? F.increment(1) : 1 };
  f.db.collection('designFlags').doc(id).set(o, { merge: true }).then(function(){}, function(){});
  sfx('sfx-ng', 0.4);
  modal('<h3>🙋 請找老師確認</h3><p>電腦檢查後,覺得作品' + (why.indexOf('nokey') >= 0 && why.length === 1 ? '需要老師親自看過' : '可能有不符合規範的地方') + ',所以<b>這次不能繳交</b>。</p><p>請帶著平板<b>主動找老師</b>看看你的作品;老師同意後,再按一次「📤 確認繳交」就可以了。</p><p style="opacity:.75">作品還在,沒有被刪掉,也還可以繼續修改。</p>');
}
/* ⑦ 上傳到 GM 倉庫 + 鎖定 */
function uploadWork(mod){
  var E = S.ed, r = E.r, f = fb(), u = user(), F = FV(), uid = S.uid, ym = ymOf(), id = E.subId, path = 'designWarehouse/' + (E.resub ? r.sub.ym : ym) + '/' + uid + '_' + E.hash;
  if(!ownerOk()){ toast('帳號已經換人了'); return; }
  busy(true, '正在繳交作品…');
  sto(function(s){
    if(!s){ busy(false); modal('<p>作品圖上傳不了(雲端儲存還沒開),請告訴老師。</p>'); return; }
    s.ref(path + '.png').putString(E.png, 'data_url', { contentType: 'image/png' }).then(function(){
      return s.ref(path + '.json').putString(JSON.stringify({ d: E.d, paint: E.paintStr, ver: VER }), 'raw', { contentType: 'application/json' });
    }).then(function(){
      var ref = f.db.collection('designSubmit').doc(id);
      return f.db.runTransaction(function(tx){ return tx.get(ref).then(function(d){
        var x = d.exists ? d.data() : null, o;
        if(x && !(x.did === r.id && x.st === 'back')) throw new Error('taken');
        o = { uid: uid, ym: x ? x.ym : ym, did: r.id, kind: r.kind, bt: r.kind === 'skin' ? E.d.bt : '', title: r.title, pen: r.pen, nm: String(uName(u)).slice(0, 60), cls: clsOf(), hash: E.hash, path: path + '.png', th: E.th,
          ops: E.d.ops | 0, mod: mod, st: 'pend', n: (x ? (x.n | 0) : 0) + 1, at: F ? F.serverTimestamp() : now(), ver: VER };
        if(x) tx.update(ref, o); else tx.set(ref, o);
      }); });
    }).then(function(){
      f.db.collection('designSubmit').doc(id).collection('log').add({ uid: uid, k: 'submit', hash: E.hash, mod: mod.v, at: F ? F.serverTimestamp() : now() }).then(function(){}, function(){});
      r.lock = 'sub'; r.sub = { id: id, ym: id.slice(0, 6) }; r.back = null; r.th = E.png.length < 400000 ? E.png : E.th;
      saveLocal(false, function(){}); backupNow(false);
      busy(false); sfx('sfx-clap', 0.5);
      modal('<h3>📤 繳交成功!</h3><p>「' + esc(r.title) + '」已經送到老師的倉庫。</p><p>作品現在鎖住了,等老師審核:通過就會變成遊戲商品;退件的話老師會寫建議,你就可以再修改。</p>', [{ t: '回工作室', cb: hub }]);
    })['catch'](function(e){ busy(false); modal(String(e && e.message) === 'taken' ? '<p>這個月已經繳交過別的作品了。</p>' : '<p>繳交失敗(' + esc(e && (e.code || e.message) || '') + '),作品還在平板上,請稍後再試或告訴老師。</p>'); });
  });
}

/* ══ 🧑‍🏫 老師台(GM 限定):🚩 智慧審核未通過 / 📦 倉庫 / ⚙ 設定 ══ */
function gmOpen(){ if(!isGm()) return; gmPaint(); }
function gmPaint(){
  var h = '<div class="dsg-gm"><h3>🧑‍🏫 美術設計師 老師台</h3><div class="tabs"><button data-g="flag"' + (S.gmTab === 'flag' ? ' class="on"' : '') + '>🚩 智慧審核未通過</button><button data-g="wh"' + (S.gmTab === 'wh' ? ' class="on"' : '') + '>📦 倉庫</button><button data-g="set"' + (S.gmTab === 'set' ? ' class="on"' : '') + '>⚙ 設定</button></div><div id="dsg-gmb">讀取中…</div></div>';
  var m = modal(h, [{ t: '關閉', cls: 'ghost' }], { cls: 'dsg-gmw' });
  m.querySelector('.box').style.width = 'min(96vw,150vmin)';
  m.querySelector('.tabs').onclick = function(ev){ var g = ev.target.getAttribute('data-g'); if(!g) return; S.gmTab = g; gmPaint(); };
  if(S.gmTab === 'flag') gmFlags(); else if(S.gmTab === 'wh') gmWh(S.gmYm || ymOf()); else gmSet();
}
function gmBody(h){ var b = $('dsg-gmb'); if(b) b.innerHTML = h; return b; }
function tsMs(t){ try{ return t && t.toMillis ? t.toMillis() : (+t || 0); }catch(e){ return 0; } }
function fmtT(t){ var d = new Date(tsMs(t) + 8 * 3600000); return (d.getUTCMonth() + 1) + '/' + d.getUTCDate() + ' ' + ('0' + d.getUTCHours()).slice(-2) + ':' + ('0' + d.getUTCMinutes()).slice(-2); }
function whyText(w, det){ var o = [], i, k; for(i = 0; i < (w || []).length; i++){
    if(w[i] === 'text') o.push('不雅字詞/同學姓名:' + esc((det && det.w || []).join('、')));
    else if(w[i] === 'label') o.push('招牌/旗幟/服裝以外有字(' + ((det && det.lab) | 0) + ' 處)');
    else if(w[i] === 'img'){ var s = (det && det.s) || {}, a = []; for(k in s){ if(s.hasOwnProperty(k) && s[k] >= 3) a.push(D.VCAT[k] + ' ' + ['', '極低', '低', '可能', '很可能', '非常可能'][s[k]]); } o.push('圖像:' + esc(a.join('、'))); }
    else if(w[i] === 'nokey') o.push('智慧審核金鑰還沒設定(⚙ 設定)'); }
  return o.join('<br>'); }
function gmFlags(){
  var f = fb();
  f.db.collection('designFlags').where('st', '==', 'flag').limit(200).get().then(function(q){
    var a = [], h = '', i, x;
    q.forEach(function(d){ var o = d.data(); o._id = d.id; a.push(o); });
    a.sort(function(p, q2){ return tsMs(q2.at) - tsMs(p.at); });
    S.gmFl = a;
    if(!a.length){ gmBody('<p>✅ 目前沒有未通過的作品。</p>'); return; }
    h += '<p>學生當面給你看過、確認沒問題,就按「☑ 當面確認通過」:學生再按一次「📤 確認繳交」就能交(只放行這一個版本,改過圖要重新檢查)。</p><div class="dsg-gl">';
    for(i = 0; i < a.length; i++){ x = a[i];
      h += '<div class="dsg-gc"><div class="im"><img src="' + esc(x.th || '') + '"></div><b>' + esc(x.nm || '') + '</b> ' + esc(x.cls || '') + '<br>' + D.KINDS[x.kind].e + ' ' + esc(x.title || '') + '(筆名 ' + esc(x.pen || '') + ')<br>🕒 ' + fmtT(x.at) + ' ・ 第 ' + (x.n | 0) + ' 次被擋<br><span style="color:#c0392b">' + whyText(x.why, x.det) + '</span>';
      h += '<div class="row"><button class="dsg-b go" data-fo="' + i + '">☑ 當面確認通過</button><button class="dsg-b ghost" data-fn="' + i + '">✖ 維持不通過</button></div></div>'; }
    var b = gmBody(h + '</div>');
    b.onclick = function(ev){ var t = ev.target, fo = t.getAttribute('data-fo'), fn = t.getAttribute('data-fn'), x2, F = FV(), u = user(), bt;
      if(fo == null && fn == null) return;
      x2 = S.gmFl[+(fo != null ? fo : fn)];
      if(fo != null){ bt = f.db.batch(); bt.set(f.db.collection('designPass').doc(x2.uid + '_' + x2.hash), { uid: x2.uid, hash: x2.hash, by: u.email, at: F.serverTimestamp() }); bt.update(f.db.collection('designFlags').doc(x2._id), { st: 'ok', by: u.email, okAt: F.serverTimestamp() });
        bt.commit().then(function(){ toast('☑ 已放行,請學生再按一次繳交'); gmFlags(); }, function(e){ toast('寫入失敗:' + (e && e.code)); }); }
      else f.db.collection('designFlags').doc(x2._id).update({ st: 'no', by: u.email, okAt: F.serverTimestamp() }).then(function(){ toast('已標記維持不通過'); gmFlags(); }, function(e){ toast('寫入失敗:' + (e && e.code)); });
    };
  })['catch'](function(e){ gmBody('<p>讀取失敗(' + esc(e && e.code) + '),請確認 firestore.rules 補丁已發布。</p>'); });
}
function ymPrev(ym, n){ var y = +ym.slice(0, 4), m = +ym.slice(4) - n; while(m < 1){ m += 12; y--; } return String(y * 100 + m); }
function gmWh(ym){
  var f = fb(), h = '<div style="display:flex;gap:1vmin;flex-wrap:wrap;margin-bottom:1vmin">', i, y;
  S.gmYm = ym;
  for(i = 0; i < 6; i++){ y = ymPrev(ymOf(), i); h += '<button class="dsg-b ' + (y === ym ? 'blue' : 'ghost') + '" data-ym="' + y + '">' + ymLabel(y) + '</button>'; }
  h += '</div><div id="dsg-whl">讀取中…</div>';
  var b = gmBody(h);
  b.onclick = function(ev){ var t = ev.target, k; if(t.getAttribute('data-ym')){ gmWh(t.getAttribute('data-ym')); return; }
    k = t.getAttribute('data-ok'); if(k != null){ gmApprove(S.gmWl[+k]); return; }
    k = t.getAttribute('data-bk'); if(k != null){ gmBack(S.gmWl[+k]); return; } };
  f.db.collection('designSubmit').where('ym', '==', ym).get().then(function(q){
    var a = [], h2 = '', x, st = { pend: 0, back: 0, live: 0 };
    q.forEach(function(d){ var o = d.data(); o._id = d.id; a.push(o); });
    a.sort(function(p, q2){ var r = { pend: 0, back: 1, live: 2 }; return (r[p.st] - r[q2.st]) || (tsMs(q2.at) - tsMs(p.at)); });
    S.gmWl = a;
    for(i = 0; i < a.length; i++){ x = a[i]; st[x.st] = (st[x.st] | 0) + 1;
      h2 += '<div class="dsg-gc"><div class="im"><img data-path="' + esc(x.path) + '" src="' + esc(x.th || '') + '"></div>' + subChip(x.st) + '<br><b>' + esc(x.nm || '') + '</b> ' + esc(x.cls || '') + '<br>' + D.KINDS[x.kind].e + ' ' + esc(x.title || '') + '(筆名 ' + esc(x.pen || '') + ')<br>🕒 ' + fmtT(x.at) + ' ・ 第 ' + (x.n | 0) + ' 次繳交 ・ 操作 ' + (x.ops | 0) + ' 次<br>審核:' + (x.mod && x.mod.v === 'teacher' ? '老師當面放行' : '智慧審核通過') +
        (x.st === 'back' && x.gm ? '<br>↩ 退件建議:' + esc(x.gm.tip || '') : '') + (x.st === 'live' && x.gm ? '<br>🛒 ' + esc(x.gm.hero ? '英雄皮膚:' + x.gm.hero : '') + ' ★' + (x.gm.star | 0) : '');
      if(x.st === 'pend') h2 += '<div class="row"><button class="dsg-b go" data-ok="' + i + '">✅ 通過上架</button><button class="dsg-b ghost" data-bk="' + i + '">↩ 退件並寫建議</button></div>';
      h2 += '</div>'; }
    $('dsg-whl').innerHTML = '<p>待審 ' + (st.pend | 0) + ' ・ 退件中 ' + (st.back | 0) + ' ・ 已上架 ' + (st.live | 0) + '</p>' + (a.length ? '<div class="dsg-gl">' + h2 + '</div>' : '<p>這個月還沒有作品。</p>');
    gmFullImgs();
  })['catch'](function(e){ $('dsg-whl').innerHTML = '<p>讀取失敗(' + esc(e && e.code) + ')</p>'; });
}
function gmFullImgs(){ sto(function(s){ if(!s) return; var ims = document.querySelectorAll('#dsg-whl img[data-path]'), i; for(i = 0; i < ims.length; i++) (function(im){ try{ s.ref(im.getAttribute('data-path')).getDownloadURL().then(function(u){ im.src = u; }, function(){}); }catch(e){} })(ims[i]); }); }
function gmApprove(x){
  var h = '<h3>✅ 通過上架:' + esc(x.title) + '</h3>', i;
  h += x.kind === 'skin' ? '<label>給哪一位英雄當皮膚(或寫「主角」)</label><input type="text" id="dsg-hero" maxlength="20" placeholder="例如:趙雲、主角"><label class="ck" style="font-size:2.1vmin"><input type="checkbox" id="dsg-isl" checked> 也用在荒島名片/營地站姿</label>'
    : '<label>荒島舒適度</label><select id="dsg-cf"><option>1</option><option selected>2</option><option>3</option><option>4</option><option>5</option></select><label class="ck" style="font-size:2.1vmin"><input type="checkbox" id="dsg-out" checked> 戶外裝飾(可放小木屋後院)</label>';
  h += '<label>稀有度</label><select id="dsg-star"><option value="1">★1</option><option value="2" selected>★2</option><option value="3">★3</option></select>';
  h += '<div style="display:flex;gap:1vmin"><div style="flex:1"><label>大對抗 知識幣</label><input type="text" id="dsg-pc" value="' + D.PRICE[2].coin + '"></div><div style="flex:1"><label>荒島 貝幣</label><input type="text" id="dsg-ps" value="' + D.PRICE[2].shell + '"></div></div>';
  h += '<label>限量(0 = 不限量)</label><input type="text" id="dsg-lim" value="0">';
  modal(h, [{ t: '取消', cls: 'ghost', cb: gmPaint }, { t: '✅ 上架', keep: true, cb: function(){
    var f = fb(), F = FV(), u = user(), star = +$('dsg-star').value, g = { by: u.email, at: now(), star: star, price: { coin: Math.max(0, parseInt($('dsg-pc').value, 10) || 0), shell: Math.max(0, parseInt($('dsg-ps').value, 10) || 0) }, lim: Math.max(0, parseInt($('dsg-lim').value, 10) || 0) }, it, bt;
    if(x.kind === 'skin'){ g.hero = String($('dsg-hero').value || '').trim().slice(0, 20); g.isl = $('dsg-isl').checked; if(!g.hero){ toast('請寫要給哪位英雄'); return; } }
    else { g.comfort = +$('dsg-cf').value; g.out = $('dsg-out').checked; }
    it = { uid: x.uid, ym: x.ym, kind: x.kind, bt: x.bt || '', title: x.title, pen: x.pen, path: x.path, hash: x.hash, star: g.star, price: g.price, lim: g.lim, hero: g.hero || '', isl: !!g.isl, comfort: g.comfort || 0, out: !!g.out, on: true, sold: 0, at: F.serverTimestamp(), by: u.email, ver: VER };
    bt = f.db.batch();
    bt.set(f.db.collection('designShopItems').doc(x._id), it);
    bt.update(f.db.collection('designSubmit').doc(x._id), { st: 'live', liveHash: x.hash, gm: g });
    bt.set(f.db.collection('designSubmit').doc(x._id).collection('log').doc(), { uid: x.uid, k: 'live', hash: x.hash, by: u.email, at: F.serverTimestamp() });
    bt.commit().then(function(){ toast('✅ 已上架成商品'); gmPaint(); }, function(e){ toast('寫入失敗:' + (e && e.code)); });
  } }]);
}
function gmBack(x){
  var h = '<h3>↩ 退件:' + esc(x.title) + '</h3><p>勾原因,並寫下具體的修改建議(學生會看到):</p><div class="dsg-chips" id="dsg-bw">', i;
  for(i = 0; i < D.BACK_REASONS.length; i++) h += '<button data-w="' + esc(D.BACK_REASONS[i]) + '" style="background:#eee">' + esc(D.BACK_REASONS[i]) + '</button>';
  h += '</div><label style="display:block;margin-top:1.2vmin">修改建議(必填,200 字內)</label><textarea id="dsg-tip" rows="4" maxlength="200" placeholder="例如:背景的空白有點多,可以在旁邊加一隻寵物,再把劍放大一點。"></textarea>';
  var sel = {};
  modal(h, [{ t: '取消', cls: 'ghost', cb: gmPaint }, { t: '↩ 退件', keep: true, cb: function(){
    var tip = String($('dsg-tip').value || '').trim().slice(0, 200), why = [], k, f = fb(), F = FV(), u = user(), bt;
    for(k in sel){ if(sel.hasOwnProperty(k) && sel[k]) why.push(k); }
    if(tip.length < 4){ toast('請寫修改建議'); return; }
    bt = f.db.batch();
    bt.update(f.db.collection('designSubmit').doc(x._id), { st: 'back', gm: { by: u.email, at: now(), why: why, tip: tip } });
    bt.set(f.db.collection('designSubmit').doc(x._id).collection('log').doc(), { uid: x.uid, k: 'back', hash: x.hash, by: u.email, tip: tip, at: F.serverTimestamp() });
    bt.commit().then(function(){ toast('↩ 已退件,學生下次進工作室會看到建議'); gmPaint(); }, function(e){ toast('寫入失敗:' + (e && e.code)); });
  } }], { onOpen: function(m){ m.querySelector('#dsg-bw').onclick = function(ev){ var w = ev.target.getAttribute('data-w'); if(!w) return; sel[w] = !sel[w]; ev.target.style.background = sel[w] ? '#ffd45a' : '#eee'; }; } });
}
function gmSet(){
  var c = accCfg(), q = c.q || {}, th = vth(), h = '', k, kind, qq;
  h += '<label class="ck"><input type="checkbox" id="dsg-sopen"' + (dsgOpen() ? ' checked' : '') + '> 開放給登入的學生(沒勾 = 只有 GM 能進)</label>';
  h += '<div class="dsg-sec" style="color:#3d2f57">🔑 智慧審核(Google Cloud Vision API 金鑰)</div><input type="text" id="dsg-skey" placeholder="' + (S.vkey ? '已設定(要換才填)' : '貼上 API 金鑰') + '"><small>金鑰請在 Google Cloud 限制為「只能用 Cloud Vision API」且「只能從遊戲網址使用」,並設每日用量上限。沒設定時,所有作品都會進「🚩 未通過」等老師看。</small>';
  h += '<div class="dsg-sec" style="color:#3d2f57">🛡 圖像門檻(數字越小越嚴:3 可能、4 很可能、5 非常可能)</div><div style="display:flex;gap:1vmin;flex-wrap:wrap">';
  for(k in D.VCAT){ if(D.VCAT.hasOwnProperty(k)) h += '<label>' + esc(D.VCAT[k]) + ' <select data-vth="' + k + '"><option' + (th[k] === 3 ? ' selected' : '') + '>3</option><option' + (th[k] === 4 ? ' selected' : '') + '>4</option><option' + (th[k] === 5 ? ' selected' : '') + '>5</option></select></label>'; }
  h += '</div><div class="dsg-sec" style="color:#3d2f57">📏 繳交基本標準</div>';
  for(kind in D.QUALITY){ if(!D.QUALITY.hasOwnProperty(kind)) continue; qq = qOf(kind);
    h += '<div>' + D.KINDS[kind].e + ' ' + D.KINDS[kind].n + ':操作 <input type="text" style="width:8vmin" data-q="' + kind + '.ops" value="' + qq.ops + '"> 次、範圍 <input type="text" style="width:8vmin" data-q="' + kind + '.bbox" value="' + Math.round(qq.bbox * 100) + '">%、上色 <input type="text" style="width:8vmin" data-q="' + kind + '.fill" value="' + Math.round(qq.fill * 100) + '">%、顏色 <input type="text" style="width:8vmin" data-q="' + kind + '.colors" value="' + qq.colors + '"> 種</div>'; }
  h += '<div class="dsg-sec" style="color:#3d2f57">🚫 另外要擋的字詞(一行一個;全校同學全名會自動擋)</div><textarea id="dsg-sw" rows="5">' + esc((S.xwords || []).join('\n')) + '</textarea>';
  h += '<div class="btns"><button class="dsg-b go" id="dsg-ssave">💾 儲存設定</button></div>';
  var b = gmBody(h);
  $('dsg-ssave').onclick = function(){
    var f = fb(), F = FV(), u = user(), nq = {}, nv = {}, ins = b.querySelectorAll('[data-q]'), sels = b.querySelectorAll('[data-vth]'), i, p, v, key = String($('dsg-skey').value || '').trim(), words, jobs = [];
    for(i = 0; i < ins.length; i++){ p = ins[i].getAttribute('data-q').split('.'); v = parseFloat(ins[i].value); if(!(v >= 0)) continue; nq[p[0]] = nq[p[0]] || {}; nq[p[0]][p[1]] = (p[1] === 'bbox' || p[1] === 'fill') ? clamp(v, 0, 100) / 100 : Math.round(clamp(v, 0, 1000)); }
    for(i = 0; i < sels.length; i++) nv[sels[i].getAttribute('data-vth')] = +sels[i].value;
    words = String($('dsg-sw').value || '').split(/\n+/).map(function(s){ return s.trim(); }).filter(function(s){ return s; }).slice(0, 2000);
    S.cfg = { open: $('dsg-sopen').checked, guest: false, q: nq, vth: nv, updatedAt: now(), updatedBy: u.email }; lsSet(ACC_KEY, JSON.stringify({ at: now(), c: S.cfg }));
    jobs.push(f.db.collection('gameConfig').doc('designerAccess').set(S.cfg));
    jobs.push(f.db.collection('gameConfig').doc('designerWords').set({ list: words, updatedAt: now(), updatedBy: u.email })); S.xwords = words;
    if(key){ jobs.push(f.db.collection('gameConfig').doc('designerVision').set({ key: key, updatedAt: now(), updatedBy: u.email })); S.vkey = key; }
    Promise.all(jobs).then(function(){ toast('💾 設定已儲存'); gmPaint(); }, function(e){ toast('儲存失敗:' + (e && e.code)); });
  };
}

window.DSGW = { ver: VER, enter: enter, onUser: onUser, isOn: function(){ return S.on; }, qShow: function(){ qShow(); },
  _t: { S: S, wordHits: wordHits, qualityStats: qualityStats, renderComposite: renderComposite, ymOf: ymOf, norm: norm } };
})();
