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
var VER = 'v1.1.0';   /* ★ v1.1.0(2026-11-10・老師)圖層(可改名、⋯ 透明度/參照/阿爾法鎖定)、選色器+圖層常駐右欄、環形色相+三角形選色器、7 種畫筆(鉛筆/水彩/蠟筆/毛筆/圓頭麥克筆/平頭麥克筆/向量筆)、油漆桶(拖顏色+臨界值)、長按 2 秒變向量形狀、剪刀剪下移到指定圖層、變形、小提示與繳交標準收進「怎麼玩」、存檔時間標記、每月繳交 皮膚 1 件+荒島裝飾 1 件分開計算 */ void 'v1.0.7';   /* ★ v1.0.7(2026-11-09)有條件解鎖(創藝工坊全部關卡 ≥2★,unlockCheck/gate('stars'))+ 作品集/設定自動雙向雲端同步(MG_CSYNC;「☁ 立即同步」= 手動保險) */ void 'v1.0.6';   /* ★ v1.0.6(2026-11-08 18:07)雙指捏合縮放/挪動畫布(PC 滾輪、空白鍵/中鍵拖曳)、手機平板直式版面、◧ 面板收合 */ void 'v1.0.5';   /*★ v1.0.5(2026-11-08 13:06~13:24)動作骨架改成 3D 關節人偶:拖關節擺姿勢、拖空白處轉視角、範本當起手式;脊椎 3 節、頭部球體+十字線定位眼鼻(fc 臉方向點)、立體圓柱四肢與關節球;骨架功能鍵 復原/重做/向前/向後/拉近/拉遠;我的姿勢命名儲存(見 pzDraw/pzDragTo/pzNudge/pzCmd) */ void 'v1.0.4';   /* ★ v1.0.4(2026-11-08 11:27)作品名不可與已上架商品同名(nameAsk/繳交都查)、角色皮膚繳交存透明全身圖 th→上架複製成 designShopItems.img、老師台「🛒 上架商品」改價/上下架/分紅比例 */ void 'v1.0.3';   /* ★ v1.0.3(2026-11-08 11:03)手繪原創:皮膚只留畫筆+動作骨架、荒島裝飾素材收進參考圖片(描圖層不進作品)、預設畫筆、回工作室先命名、作品集可改名 */ void 'v1.0.2';   /* ★ v1.0.2(2026-11-08 10:51)操作次數算「增加、變色」,且改完要跟原本不一樣(見 endOp/opKey) */ void 'v1.0.1';   /* ★ v1.0.1(2026-11-08)操作次數只算「增加」的動作(見 endOp) */ void 'v1.0.0';
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
function subIdOf(ym, kind){ return ym + '_' + S.uid + '_' + (kind === 'deco' ? 'deco' : 'skin'); }   /* ★ v1.1.0 皮膚、荒島裝飾各自每月 1 件 */
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
'#dsg-guide{position:absolute;left:0;top:0;pointer-events:none}#dsg-stage.posing #dsg-guide{pointer-events:auto;z-index:6;touch-action:none;cursor:grab}#dsg-stage.posing #dsg-sel{display:none!important}.dsg-pzrow{display:flex;flex-wrap:wrap;gap:.6vmin;margin:.5vmin 0}.dsg-pzrow button{flex:1 1 auto}.dsg-pzv{font-size:1.7vmin;opacity:.8;margin-top:.4vmin}.dsg-ref{margin:.6vmin 0;background:rgba(255,255,255,.08);border-radius:1.2vmin;padding:.4vmin .8vmin}.dsg-ref summary{cursor:pointer;font-weight:900;font-size:2.1vmin;padding:.8vmin .2vmin}.dsg-it.on{outline:.5vmin solid #ffd23f}',   /* ★ v1.0.3 動作骨架/參考圖片(描圖用,不進作品) */
'#dsg-stage.vecmode{cursor:crosshair}#dsg-stage .ly svg{overflow:visible}',
'#dsg-stage.painting .ly{pointer-events:none}#dsg-grid{z-index:80}#dsg-sel{z-index:85}',
/* ★ v1.1.0 圖層畫布(z-index = 圖層順序 1~)、一筆草稿層、效果層(剪刀/變形/倒數圈)、描圖參考在最下面 */
'#dsg-stage canvas.dsg-pl,#dsg-scr,#dsg-fx{position:absolute;left:0;top:0;pointer-events:none}#dsg-scr{display:none}#dsg-fx{z-index:70}#dsg-guide{z-index:0}#dsg-stage.posing #dsg-guide{z-index:90}',
'.dsg-brs{display:grid;grid-template-columns:repeat(auto-fill,minmax(8.4vmin,1fr));gap:.6vmin}.dsg-brs button{border:0;border-radius:1.2vmin;padding:.6vmin .2vmin;font-size:1.55vmin;font-weight:900;background:rgba(255,255,255,.85);color:#333;line-height:1.15}.dsg-brs button b{display:block;font-size:3.2vmin}.dsg-brs button.on{background:#ffd45a;color:#4a2a00;box-shadow:0 0 0 .3vmin #fff inset}',
'#dsg-root.nolb .dsg-brs b{font-size:3.8vmin}',
'.dsg-curc{display:flex;align-items:center;gap:1vmin;margin-bottom:.6vmin}.dsg-curc .dsg-sw{width:6vmin;height:6vmin;border-radius:1.4vmin;touch-action:none;cursor:grab}.dsg-curc b{font-size:1.8vmin}#dsg-wheel{margin:.4vmin 0}.dsg-qsw .dsg-sw{width:3.8vmin;height:3.8vmin;touch-action:none;cursor:pointer}',
'.dsg-lyr{display:flex;align-items:center;gap:.6vmin;background:rgba(255,255,255,.14);border:.3vmin solid transparent;border-radius:1.2vmin;padding:.4vmin;margin:.4vmin 0;cursor:pointer;font-size:1.8vmin;font-weight:800}',
'.dsg-lyr.on{background:rgba(255,212,90,.35);border-color:#ffd45a}.dsg-lyr.tg,.dsg-lyr.hot{border-color:#7fd0ff;box-shadow:0 0 0 .4vmin #3b8fe0}.dsg-lyr img,.dsg-lyr .lic{width:5vmin;height:5vmin;object-fit:contain;background:#fff;border-radius:.6vmin;flex:0 0 auto;display:flex;align-items:center;justify-content:center;color:#333;font-size:2.6vmin}',
'.dsg-lyr .nm{flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.dsg-lyr button{border:0;border-radius:.8vmin;background:rgba(255,255,255,.85);font-size:1.8vmin;padding:.3vmin .6vmin;flex:0 0 auto}.dsg-lyr .tags{font-size:1.5vmin;opacity:.85}',
'.dsg-lmn{background:rgba(0,0,0,.32);border:.3vmin solid #ffd45a;border-radius:1.2vmin;padding:.6vmin .8vmin;margin:-.2vmin 0 .6vmin;font-size:1.8vmin;font-weight:800}.dsg-lmn .r{display:flex;align-items:center;gap:.8vmin;margin:.4vmin 0}.dsg-lmn input[type=range]{flex:1;min-width:0}.dsg-lmn label{flex:1;display:flex;align-items:center;gap:.6vmin}.dsg-lmn input[type=checkbox]{width:3vmin;height:3vmin}.dsg-lmn button{border:0;border-radius:50%;width:3.6vmin;height:3.6vmin;background:#7fd0ff;color:#123;font-weight:900;font-size:1.9vmin;flex:0 0 auto}',
'.dsg-lyb{display:flex;gap:.6vmin;margin:.4vmin 0}.dsg-lyb button{flex:1;border:0;border-radius:1vmin;background:rgba(255,255,255,.85);font-size:1.8vmin;font-weight:900;padding:.6vmin 0}.dsg-lya{display:flex;align-items:center;gap:.8vmin;font-size:1.8vmin}.dsg-lya input{flex:1}',
'.dsg-stamp{position:absolute;right:calc(1vmin + env(safe-area-inset-right));bottom:calc(1vmin + env(safe-area-inset-bottom));z-index:7;background:rgba(0,0,0,.55);border-radius:1.6vmin;padding:.4vmin 1.2vmin;font-size:max(12px,1.7vmin);font-weight:800;pointer-events:none}',
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
' .dsg-m .box{font-size:3.2vmin}.dsg-m h3{font-size:4.2vmin}.dsg-m .dsg-b{font-size:3.2vmin}.dsg-chip{font-size:2.8vmin}.dsg-gc{font-size:2.8vmin}.dsg-lockbar{font-size:3vmin}}',
/* ★ v1.0.6(2026-11-08・老師「讓手機和平板都可以直式進行繪圖。面板優化讓繪圖區更寬敞」+ 雙指縮放)
   ① 直式:上=工具列、中=畫布(佔滿整個寬度)、下=左右兩塊面板(工具|屬性),面板高約三分之一;手機直式字級比照手機橫式(以畫面短邊 vmin 計)。
   ② ◧ 面板:收起兩側(直式是下方)面板 ⇒ 畫布最大;記在這台(dsg_pc)。
   ③ 縮放比例鈕 #dsg-zb:放大/縮小/挪動過才出現在畫布左上角,點一下回到原本大小。
   ④ 設計師模式不再出現「請把裝置轉成橫的」遮罩(index 也有同一條,這裡是保險)。放最後(鐵律〇之二)。 */
'html.dsg-mode #mg-rotate-overlay,html.dsg-mode #rotate-overlay{display:none !important}',
'.dsg-zb{position:absolute;left:calc(1vmin + env(safe-area-inset-left));top:1vmin;z-index:7;border:0;border-radius:2vmin;padding:.7vmin 1.4vmin;font-size:max(13px,1.9vmin);font-weight:900;background:rgba(0,0,0,.62);color:#fff;box-shadow:0 .3vmin .8vmin rgba(0,0,0,.35)}',
'#dsg-ed.pc{grid-template-columns:0 1fr 0 !important}#dsg-ed.pc .lib,#dsg-ed.pc .prop{display:none}',
'#dsg-ed .bar{flex-wrap:wrap;row-gap:.6vmin}',
'@media (orientation:portrait){#dsg-ed{grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);grid-template-rows:auto minmax(0,1fr) 34vh}',
' #dsg-ed .bar{grid-column:1/3;grid-row:1}#dsg-ed .mid{grid-column:1/3;grid-row:2}#dsg-ed .lib{grid-column:1;grid-row:3;border-top:.4vmin solid rgba(255,255,255,.22);padding-left:0}#dsg-ed .prop{grid-column:2;grid-row:3;border-top:.4vmin solid rgba(255,255,255,.22);padding-bottom:calc(2vmin + env(safe-area-inset-bottom))}',
' #dsg-ed .lbody{padding-bottom:calc(2vmin + env(safe-area-inset-bottom))}#dsg-ed .bar .t{max-width:40vw}',
' #dsg-ed.pc{grid-template-columns:1fr 1fr !important;grid-template-rows:auto minmax(0,1fr) 0}.dsg-lockbar{white-space:normal;text-align:center;width:90%}}',
'@media (orientation:portrait) and (max-width:600px){#dsg-ed{grid-template-rows:auto minmax(0,1fr) 38vh}#dsg-ed .bar .lb{display:none}#dsg-ed .bar .dsg-b{font-size:4.2vmin;padding:1.4vmin 2.2vmin}#dsg-ed .bar .t{font-size:3.8vmin;max-width:34vw}#dsg-ed .bar .ops{font-size:3.4vmin}',
' #dsg-ed .tabs button{font-size:3.3vmin;padding:1.3vmin 1.6vmin}.dsg-grid{grid-template-columns:repeat(auto-fill,minmax(15vmin,1fr))}.dsg-it{height:15vmin;font-size:2.6vmin}.dsg-it img{max-height:10vmin}',
' .dsg-chips button{font-size:3.2vmin}.dsg-sec{font-size:3.4vmin}#dsg-ed .prop{font-size:3.3vmin}#dsg-ed .prop .row .dsg-b{font-size:3.2vmin}#dsg-ed .prop label{font-size:3.3vmin}#dsg-ed .prop input[type=range]{height:6vmin}',
' .dsg-tip{font-size:3.1vmin}.dsg-pm button{font-size:3.1vmin}.dsg-pm b{font-size:5vmin}.dsg-pzv{font-size:3vmin}.dsg-sw{width:7vmin;height:7vmin}#dsg-ed input[type=text],#dsg-ed select{font-size:3.6vmin}',
' .dsg-card{font-size:3.6vmin}.dsg-b{font-size:3.6vmin}.dsg-new{grid-template-columns:1fr}.dsg-new button{font-size:5vmin}.dsg-new small{font-size:3.3vmin}.dsg-dr{font-size:3.2vmin}.dsg-drafts{grid-template-columns:repeat(auto-fill,minmax(40vmin,1fr))}.dsg-dr .th{height:40vmin}.dsg-dr .x{width:7vmin;height:7vmin;font-size:3.4vmin}#dsg-hub h1{font-size:6vmin}',
' .dsg-m .box{font-size:3.7vmin}.dsg-m h3{font-size:4.8vmin}.dsg-m .dsg-b{font-size:3.7vmin}.dsg-chip{font-size:3.2vmin}.dsg-gc{font-size:3.2vmin}.dsg-lockbar{font-size:3.4vmin}.dsg-zb{font-size:13px}}',
/* ★ v1.1.0 新面板(畫筆格、圖層列、選色器)手機橫放/直放字級(放最後,鐵律〇之二) */
'@media (orientation:landscape) and (max-height:520px){.dsg-brs{grid-template-columns:repeat(auto-fill,minmax(12vmin,1fr))}.dsg-brs button{font-size:2.3vmin}.dsg-brs button b{font-size:4.4vmin}.dsg-lyr,.dsg-lyr button,.dsg-lyb button,.dsg-lya{font-size:2.7vmin}.dsg-lyr img,.dsg-lyr .lic{width:7vmin;height:7vmin}.dsg-curc b{font-size:2.6vmin}.dsg-curc .dsg-sw{width:8vmin;height:8vmin}.dsg-qsw .dsg-sw{width:5.4vmin;height:5.4vmin}.dsg-lmn{font-size:2.7vmin}.dsg-lmn button{width:5.4vmin;height:5.4vmin;font-size:2.8vmin}.dsg-lmn input[type=checkbox]{width:4.4vmin;height:4.4vmin}}',
'@media (orientation:portrait) and (max-width:600px){.dsg-brs{grid-template-columns:repeat(auto-fill,minmax(13vmin,1fr))}.dsg-brs button{font-size:2.6vmin}.dsg-brs button b{font-size:5vmin}.dsg-lyr,.dsg-lyr button,.dsg-lyb button,.dsg-lya{font-size:3.1vmin}.dsg-lyr img,.dsg-lyr .lic{width:8vmin;height:8vmin}.dsg-curc b{font-size:3vmin}.dsg-qsw .dsg-sw{width:6vmin;height:6vmin}.dsg-lmn{font-size:3.1vmin}.dsg-lmn button{width:6vmin;height:6vmin;font-size:3.2vmin}.dsg-lmn input[type=checkbox]{width:5vmin;height:5vmin}}'
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
    unlockCheck(function(o){   /* ★ v1.0.7 有條件解鎖:創藝工坊全部關卡都 ≥2★ */
      if(!o.open){ gate('stars', o); return; }
      rosterLoad();
      hub();
      setTimeout(idbSweep, 4000);
    });
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
  modalClose(); bindUser(u); S.cfg = null; S.vkey = ''; S.xwords = []; if(S.cs) S.cs.reset();
  accFetch(function(){ if(!(u && isGm()) && !dsgOpen()){ gate('closed'); return; } unlockCheck(function(o){ if(!o.open){ gate('stars', o); return; } hub(); }); });
}
/* ★ v1.0.7(2026-11-09・老師「遊戲美術設計師改成有條件解鎖,至少要玩過所有關卡並且全部獲得至少 2 星」)
   直接打網址 ?mode=designer 也擋。判斷用 ART_DB.dsgUnlock(index 會先載 minigame_art_db.js,與創藝工坊同一份)。
   星數 = 這台的創藝工坊本機存檔 art_save_<uid> 與雲端 artPlayers/{uid} 取大;GM 不受限。 */
function unlockCheck(cb){
  var AD = window.ART_DB, u = user(), uid = u ? u.uid : 'guest', st = {}, done = false, t, f = fb();
  if(u && isGm()){ cb({ open: true }); return; }
  if(!AD || !AD.dsgUnlock){ cb({ open: false, err: 1, total: 0, ok: 0, miss: [] }); return; }
  function add(s){ var k; if(!s || typeof s !== 'object') return; for(k in s){ if(s.hasOwnProperty(k)) st[k] = Math.max(st[k] | 0, s[k] | 0); } }
  try{ var lo = JSON.parse(lsGet('art_save_' + uid) || 'null'); if(lo && (!lo.uid || lo.uid === uid)) add(lo.stars); }catch(e){}
  function fin(){ if(done) return; done = true; clearTimeout(t); cb(AD.dsgUnlock(st)); }
  if(!u || !f || !f.db){ fin(); return; }
  t = setTimeout(fin, 5000);
  try{ f.db.collection('artPlayers').doc(uid).get().then(function(d){ if(d && d.exists && user() && user().uid === uid) add((d.data() || {}).stars); fin(); })['catch'](fin); }catch(e2){ fin(); }
}
function gate(k, o){
  var root = $('dsg-root'), h, i, m, g = {}, ord = [], pct;
  if(k === 'stars'){
    o = o || { total: 0, ok: 0, miss: [], need: 2 };
    pct = o.total ? Math.round(o.ok * 100 / o.total) : 0;
    h = '<div class="dsg-gate" style="overflow-y:auto;max-height:100%;box-sizing:border-box;padding:3vmin"><div style="font-size:9vmin">🔒</div><div><b>遊戲美術設計師 還沒解鎖</b></div>';
    if(o.err) h += '<div>讀不到創藝工坊的進度,請檢查網路後重新整理。</div>';
    else {
      h += '<div style="max-width:90vw">' + esc(T({ c: '把創藝工坊的「全部 ' + o.total + ' 關」都玩過,而且每一關都拿到 ⭐⭐ 以上,就能進來當遊戲美術設計師!', p: '完成創藝工坊全部 ' + o.total + ' 關,且每關皆達 ' + (o.need || 2) + ' 星以上,即可解鎖。' })) + '</div>';
      h += '<div style="width:min(70vmin,86vw);background:rgba(255,255,255,.25);border-radius:1vmin;overflow:hidden;height:2.4vmin"><i style="display:block;height:100%;width:' + pct + '%;background:linear-gradient(90deg,#ffb347,#ff6f91)"></i></div><div>目前 ' + o.ok + ' / ' + o.total + ' 關達成</div>';
      for(i = 0; i < o.miss.length; i++){ m = o.miss[i]; if(!g[m.ws]){ g[m.ws] = []; ord.push(m); } g[m.ws].push(m); }
      h += '<div style="text-align:left;font-size:2.1vmin;max-width:min(110vmin,92vw)">';
      for(i = 0; i < ord.length; i++){ m = ord[i]; h += '<div style="margin:.6vmin 0">' + m.we + ' <b>' + esc(m.wn) + '</b>:' + g[m.ws].map(function(x){ return esc(x.n) + (x.st ? ' ' + new Array(x.st + 1).join('⭐') : '(還沒玩)'); }).join('、') + '</div>'; }
      h += '</div>';
    }
    h += '<div style="display:flex;gap:1.4vmin;flex-wrap:wrap;justify-content:center"><button class="dsg-b go" id="dsg-gart">🎨 去創藝工坊</button><button class="dsg-b ghost" id="dsg-gx">🔙 回去</button></div></div>';
    root.innerHTML = h;
    $('dsg-gx').onclick = exitNow;
    $('dsg-gart').onclick = function(){ try{ if(B.handoff) B.handoff(); }catch(e){} try{ if(B.loading) B.loading(true); }catch(e2){} setTimeout(function(){ S.on = false; location.href = 'minigame_index.html?mode=art'; }, 300); };
    return;
  }
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
  h += '<div class="dsg-card" id="dsg-month">📅 <b>' + ymLabel(ymOf()) + '</b> 的作品:' + (S.guest ? '登入後才能繳交' : '讀取中…') + '<br><small>每人每月 🦸 角色皮膚 1 件、🏝 荒島裝飾 1 件,' + ri.m + ' 月 1 日早上 8:00 換新的月份(還有 ' + ri.days + ' 天 ' + ri.hrs + ' 小時)</small></div>';
  h += '<div class="dsg-new"><button data-k="new-skin">🦸 新的角色皮膚<small>' + esc(T(D.KINDS.skin.d)) + '</small></button><button data-k="new-deco">🏝 新的荒島裝飾<small>' + esc(T(D.KINDS.deco.d)) + '</small></button></div>';
  h += '<div class="top"><div class="dsg-sec" style="font-size:2.6vmin">📁 我的作品</div><div class="sp"></div>' + (S.guest ? '' : '<span id="dsg-cs" style="font-size:1.9vmin;opacity:.8;margin-right:1vmin">' + esc((csNow() && S.cs.status().msg) || '') + '</span><button class="dsg-b ghost" data-k="cloud">☁ 立即同步</button>') + '</div><div class="dsg-drafts" id="dsg-drafts">讀取中…</div></div>';   /* ★ v1.0.7 自動同步;按鈕 = 手動保險 */
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
  if(!S.guest && csNow()) setTimeout(function(){ if(S.cs && S.screen === 'hub') S.cs.sync(false); }, 400);   /* ★ v1.0.7 回到工作室就自動同步(15 秒內不重複) */
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
      h += '<div class="dsg-dr" data-d="' + esc(r.id) + '"><div class="th">' + (r.th ? '<img src="' + r.th + '">' : D.KINDS[r.kind].e) + '</div><div>' + D.KINDS[r.kind].e + ' ' + esc(r.title || D.KINDS[r.kind].n) + '</div><div>' + st + '</div><div style="opacity:.85">💾 ' + esc(r.stamp || fmtStamp(r.at)) + '</div><div style="opacity:.75">操作 ' + ((r.d && r.d.ops) | 0) + ' 次' + (S.guest || !S.cs ? '' : (S.cs.synced(r) ? '・☁ 已同步' : '・⏳ 等待上傳')) + '</div>' + (r.lock ? '' : '<button class="x" data-x="' + esc(r.id) + '">✕</button><button class="x rn" data-rn="' + esc(r.id) + '" title="改名字">✏️</button>') + '</div>'; }
    el.innerHTML = h;
  });
}
/* 本月狀態 + 已繳交作品的審核結果(老師退件 ⇒ 解鎖並帶回建議;通過 ⇒ 鎖住) */
function monthRefresh(){
  var f = fb(), el;
  if(S.guest || !f || !f.db) return;
  function g1(id){ return f.db.collection('designSubmit').doc(id).get().then(function(d){ return d && d.exists ? d.data() : null; }, function(){ return null; }); }
  Promise.all([g1(subIdOf(ymOf(), 'skin')), g1(subIdOf(ymOf(), 'deco')), g1(ymOf() + '_' + S.uid)]).then(function(rs){
    var X = { skin: rs[0], deco: rs[1] }, lg = rs[2], h = '', ks = ['skin', 'deco'], i, x;
    if(lg && !X[lg.kind || 'skin']) X[lg.kind || 'skin'] = lg;   /* 舊格式 */
    S.monthDoc = X;
    el = $('dsg-month'); if(!el) return;
    var ri = resetInfo();
    for(i = 0; i < 2; i++){ x = X[ks[i]];
      h += '<br>' + D.KINDS[ks[i]].e + ' ' + esc(D.KINDS[ks[i]].n) + ':' + (x ? subChip(x.st) + ' ' + esc(x.title || '') : '<span class="dsg-chip none">還沒繳交</span> 這個月還可以繳交 1 件') +
        (x && x.st === 'back' && x.gm ? '<br>📝 老師的建議:<b>' + esc(x.gm.tip || '') + '</b>' + (x.gm.why && x.gm.why.length ? '(' + esc(x.gm.why.join('、')) + ')' : '') : ''); }
    el.innerHTML = '📅 <b>' + ymLabel(ymOf()) + '</b> 的作品' + h +
      '<br><small>每人每月 🦸 角色皮膚 1 件、🏝 荒島裝飾 1 件,' + ri.m + ' 月 1 日早上 8:00 換新的月份(還有 ' + ri.days + ' 天 ' + ri.hrs + ' 小時)</small>';
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
/* ★ v1.1.0 老師 18:26「右側小提示和繳交標準變成一個說明視窗收合到右上方『怎麼玩』」:編輯器的 ❓ = 小提示 + 新工具 + 操作說明 + 繳交標準(可直接檢查) */
function howEditor(){
  var E = S.ed, a = (S.style === 'p' ? D.HOWTO.editor.p : D.HOWTO.editor.c), h = '<h3>❓ 怎麼玩</h3>', i;
  h += '<div class="dsg-sec" style="color:#8a5cf0">💡 小提示</div><p style="margin:.4vmin 0">' + esc(E && E.r.kind === 'skin' ? T({ c: '用 🖌 畫筆從白紙開始畫;不知道怎麼畫身體,打開「🦴 動作骨架」拖關節擺出 3D 姿勢,再照著畫。', p: '以畫筆從空白畫布創作;可開啟「動作骨架」擺出 3D 姿勢作為描繪參考。' }) : T({ c: '用 🖌 畫筆畫出你的裝飾;想看荒島的東西長怎樣,打開「🖼 參考圖片」看著畫。', p: '以畫筆繪製裝飾;可開啟「參考圖片」作為描繪參考。' })) + ' ' + esc(T({ c: '文字貼片和形狀可以點一下選它,拖曳移動、拉粉紅圓點放大縮小和轉方向。', p: '文字貼片與形狀可點選後拖曳、縮放、旋轉。' })) + '</p>';
  if(D.HOWTO.tools) h += '<div class="dsg-sec" style="color:#8a5cf0">🧰 ' + esc(T({ c: '新工具', p: '工具' })) + '</div><ul style="margin:.4vmin 0;padding-left:2.4vmin">' + (S.style === 'p' ? D.HOWTO.tools.p : D.HOWTO.tools.c).map(function(s){ return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>';
  h += '<div class="dsg-sec" style="color:#8a5cf0">📖 ' + esc(T({ c: '操作說明', p: '操作說明' })) + '</div><ol style="margin:.4vmin 0;padding-left:2.4vmin">'; for(i = 0; i < a.length; i++) h += '<li>' + esc(a[i]) + '</li>'; h += '</ol>';
  if(E){ var q = qOf(E.r.kind); h += '<div class="dsg-sec" style="color:#8a5cf0">📏 ' + esc(T({ c: '繳交標準', p: '繳交標準' })) + '</div><p style="margin:.4vmin 0;line-height:1.7">✋ 操作 ' + (E.d.ops | 0) + '/' + q.ops + ' 次<br>📐 圖案範圍 ' + Math.round(q.bbox * 100) + '% 以上<br>🖍 上色 ' + Math.round(q.fill * 100) + '% 以上<br>🌈 顏色 ' + q.colors + ' 種以上</p>'; }
  modal(h, E ? [{ t: '🔍 檢查我的作品', cls: 'ghost', cb: function(){ qShow(); } }, { t: '好' }] : [{ t: '好' }]);
}
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
  modal(h, [{ t: '取消', cls: 'ghost' }, { t: okT || '💾 存好回工作室', keep: true, cb: function(m){ var r = titleCheck($('dsg-title').value); if(r.e){ $('dsg-titlem').textContent = '⚠ ' + r.e; return; }
    $('dsg-titlem').textContent = ''; if(m._chk) return; m._chk = 1;
    shopTitleTaken(r.v, function(tk){ m._chk = 0; if(!$('dsg-title')) return; if(tk){ var mm = $('dsg-titlem'); if(mm) mm.textContent = '⚠ 已經有上架的作品叫「' + tk + '」了,作品名稱不能重複,請換一個名字'; return; } modalClose(); cb(r.v); });   /* ★ v1.0.4 不可與已上架商品同名 */
  } }],
    { onOpen: function(m){ var ip = $('dsg-title'); if(ip){ setTimeout(function(){ try{ ip.focus(); ip.select(); }catch(e){} }, 80); ip.onkeydown = function(ev){ if(ev.keyCode === 13){ var bs = m.querySelectorAll('.btns button'); if(bs[1]) bs[1].click(); } }; } } });
}
/* ★ v1.0.4(2026-11-08・老師「作品名稱如果和已經上架的商品重複必須提醒玩家進行修改,不可重複」)
   比對 designShopItems(所有已上架商品,含已下架的)的作品名;去掉空白、英文不分大小寫。讀一次快取 60 秒;讀不到(訪客/規則/網路)就不擋。 */
function titleNorm(v){ return String(v || '').replace(/\s+/g, '').toLowerCase(); }
function shopTitles(cb, force){
  var f = fb();
  if(!force && S.shopT && now() - S.shopT.at < 60000){ cb(S.shopT.m); return; }
  if(!f || !f.db || !user()){ cb(null); return; }
  f.db.collection('designShopItems').get().then(function(q){ var m = {}; q.forEach(function(d){ var o = d.data() || {}; if(o.title) m[titleNorm(o.title)] = { t: o.title, id: d.id }; }); S.shopT = { at: now(), m: m }; cb(m); }, function(){ cb(null); });
}
function shopTitleTaken(v, cb, exceptId, force){ shopTitles(function(m){ var o = m && m[titleNorm(v)]; cb(o && o.id !== exceptId ? o.t : ''); }, force); }
function renameDraft(id){
  var a = S.drafts || [], i, r = null; for(i = 0; i < a.length; i++){ if(a[i].id === id) r = a[i]; }
  if(!r) return;
  if(r.lock){ toast('🔒 已繳交或已通過的作品不能改名字'); return; }
  nameAsk(r.title || '', function(v){ r.title = v; idbPut(myKey(r.id), JSON.parse(JSON.stringify(r)), function(ok){ toast(ok ? '✏️ 改好名字了' : '改名失敗,請再試一次'); draftsPaint(); }); }, '✏️ 改好了');
}

/* ══ 新作品/打開/刪除 ══ */
function blankDesign(kind){ var K = D.KINDS[kind]; return { v: 1, kind: kind, W: K.W, H: K.H, bt: 'boy', slots: {}, tint: {}, items: [], ops: 0, hd: 1, layers: [{ id: 'p1', k: 'p', n: '圖層 1', vis: 1, a: 1 }, { id: 'o', k: 'o', n: '物件層', vis: 1, a: 1 }], guide: kind === 'skin' ? { t: 'pose', id: 'stand', on: 1 } : null }; }   /* ★ v1.0.3 手繪原創:新作品是一張白紙(hd=1 不畫人物底座);角色皮膚預設開「站好」骨架參考 */
function newWork(kind){
  myDrafts(function(a){
    var n = 0, i; for(i = 0; i < a.length; i++){ if(!a[i].lock) n++; }
    if(n >= D.DRAFT_MAX){ modal('<p>編輯中的作品最多 ' + D.DRAFT_MAX + ' 件,先刪掉不要的再開新的喔。</p>'); return; }
    var r = { id: rid(), uid: S.guest ? 'guest' : S.uid, kind: kind, at: now(), title: '', d: blankDesign(kind), paint: '', th: '', lock: '', sub: null, back: null };
    editorOpen(r);
  });
}
function openDraft(id){ var a = S.drafts || [], i; for(i = 0; i < a.length; i++){ if(a[i].id === id){ editorOpen(JSON.parse(JSON.stringify(a[i]))); return; } } }
function delDraft(id){ confirmBox('刪掉這件作品?刪掉就找不回來了(雲端和其他平板上的也會一起刪)。', function(ok){ if(!ok) return; idbDel(myKey(id), draftsPaint);
  if(!S.guest && ownerOk() && csNow()) S.cs.del(id); }, '刪掉'); }   /* ★ v1.0.7 雲端刪除+墓碑(別台平板開啟時一起刪) */

/* ══ 編輯器 ══ */
function editorOpen(r){
  var root = $('dsg-root'), K = D.KINDS[r.kind], h = '', i0;
  for(i0 = 0; r.d && r.d.items && i0 < r.d.items.length; i0++) delete r.d.items[i0].im;
  S.screen = 'ed';
  S.ed = { z: 1, panX: 0, panY: 0, r: r, d: r.d, sel: -1, tab: D.TABS[r.kind][0].id, undo: [], redo: [], k: 1, dirty: false, cloudDirty: false, lastCloud: now(), pls: {}, al: '', tol: 32, brush: { c: '#1b1b1b', w: 12, er: false, t: BRUSH[lsGet('dsg_br')] ? lsGet('dsg_br') : 'mround', op: 1 }, tk: 'sign', font: 'hei',
    pm: lsGet('dsg_pm') || 'free', px: { n: +(lsGet('dsg_pxn') || 32), tool: 'pen' }, vec: { sh: 'rect', fill: '#ffd23f', st: '#1b1b1b', sw: 6 } };
  h += '<div id="dsg-ed" class="' + (r.lock ? 'locked' : '') + (lsGet('dsg_pc') === '1' ? ' pc' : '') + '"><div class="bar"><button class="dsg-b ghost" data-k="back">🔙<span class="lb"> 回工作室</span></button><div class="t">' + K.e + ' ' + esc(r.title || K.n) + '</div>';
  h += '<button class="dsg-b ghost" data-k="undo">↶<span class="lb"> 復原</span></button><button class="dsg-b ghost" data-k="redo">↷<span class="lb"> 重做</span></button><div class="ops" id="dsg-ops"></div><div class="sp"></div>';
  h += '<button class="dsg-b ghost" data-k="pnl" title="收合/展開工具面板">◧<span class="lb"> 面板</span></button>';   /* ★ v1.0.6 老師「面板優化讓繪圖區更寬敞」:收起兩側(直式是下方)面板 */
  h += '<button class="dsg-b ghost" data-k="lbl" title="顯示/隱藏功能名稱">🏷<span class="lb"> 名稱</span></button><button class="dsg-b ghost" data-k="how">❓<span class="lb"> 怎麼玩</span></button><button class="dsg-b blue" data-k="save">💾<span class="lb"> 存檔</span></button><button class="dsg-b go" data-k="submit">📤<span class="lb"> 確認繳交</span></button></div>';
  h += '<div class="lib"><div class="tabs" id="dsg-tabs"></div><div class="lbody" id="dsg-lib"></div></div>';
  h += '<div class="mid" id="dsg-mid"><div id="dsg-stage" style="width:' + K.W + 'px;height:' + K.H + 'px"><div class="ly" id="dsg-ly"></div><canvas id="dsg-guide" width="' + K.W + '" height="' + K.H + '" style="width:' + K.W + 'px;height:' + K.H + 'px"></canvas><canvas id="dsg-scr" width="' + K.W + '" height="' + K.H + '" style="width:' + K.W + 'px;height:' + K.H + 'px"></canvas><canvas id="dsg-fx" width="' + K.W + '" height="' + K.H + '" style="width:' + K.W + 'px;height:' + K.H + 'px"></canvas><canvas id="dsg-grid" width="' + K.W + '" height="' + K.H + '" style="width:' + K.W + 'px;height:' + K.H + 'px"></canvas><div id="dsg-sel"><i data-h="1"></i></div></div><button class="dsg-zb" id="dsg-zb" data-k="zreset" title="回到原本大小"></button>';   /* ★ v1.0.6 縮放比例鈕(放大/縮小時才出現,點一下回到原本大小) */
  if(r.stamp) h += '<div class="dsg-stamp" id="dsg-stamp">💾 ' + esc(r.stamp) + '</div>';
  if(r.lock) h += '<div class="dsg-lockbar">' + (r.lock === 'live' ? '✅ 老師已通過,這件作品不能再改了' : '🔒 已繳交,等老師審核;老師退件後才能修改') + '</div>';
  /* ★ v1.1.0 老師「常駐選色器、圖層在畫布的右側」:右欄 = 🎨 選色器 + 📚 圖層(一直都在)+ 選到物件時的屬性 */
  h += '</div><div class="prop" id="dsg-prop"><div id="dsg-pcol"></div><div class="dsg-sec">📚 <span class="lb">圖層</span></div><div id="dsg-lys"></div><div id="dsg-pitem"></div></div></div>';
  root.innerHTML = h;
  root.onclick = function(ev){ var t = ev.target, k = null; while(t && t !== root){ if(t.getAttribute) k = k || t.getAttribute('data-k'); t = t.parentNode; } if(!k) return; sfx('sfx-tap', 0.3); barCmd(k); };
  lyInit(r); plsBuild();
  $('dsg-lys').onclick = lyClick;
  $('dsg-lys').oninput = function(ev){ var li = ev.target.getAttribute('data-lmo'), L = li != null ? lyList()[+li] : null, b; if(!L || locked()) return; if(!S.ed._laOp){ beginOp(); S.ed._laOp = 1; } L.a = (+ev.target.value) / 100; b = ev.target.nextSibling; if(b) b.textContent = ev.target.value + '%'; plsBuild(); };
  $('dsg-lys').onchange = function(ev){ if(ev.target.getAttribute('data-lmo') != null && S.ed._laOp){ S.ed._laOp = 0; endOp(false); lyPanel(); } };
  $('dsg-pcol').onclick = function(ev){ var t = ev.target; if(t.getAttribute && t.getAttribute('data-pc')){ ev.stopPropagation(); if(locked()) return; sfx('sfx-tap', 0.2); colorSet(t.getAttribute('data-pc'), false, true); } };
  /* 🪣 按住顏色拖到畫布上 = 油漆桶(停住 0.5 秒先預覽、左右滑動調臨界值) */
  if(window.MGPK){ if(S.cdrag) S.cdrag.destroy(); S.cdrag = window.MGPK.colorDrag({ root: $('dsg-ed'),
    colorOf: function(el){ if(!el.getAttribute || locked()) return null; if(el.id === 'dsg-cur') return S.ed.brush.c; return el.getAttribute('data-pc'); },
    over: function(cx, cy){ var E = S.ed, st = $('dsg-stage'), r; if(!E || E.float || !st) return false; r = $('dsg-mid').getBoundingClientRect(); if(cx < r.left || cx > r.right || cy < r.top || cy > r.bottom) return false; r = st.getBoundingClientRect(); return cx >= r.left && cy >= r.top && cx < r.right && cy < r.bottom; },
    tol: function(){ return S.ed.tol; },
    preview: function(cx, cy, hex, tol){ var r = $('dsg-stage').getBoundingClientRect(); colorSet(hex, false, false); bucketAt({ x: (cx - r.left) / S.ed.k, y: (cy - r.top) / S.ed.k }, hex, tol, false); return true; },
    adjust: function(t){ S.ed.tol = t; bucketRe(t); },
    drop: function(cx, cy, hex, tol, held){ var r = $('dsg-stage').getBoundingClientRect(); if(held){ S.ed.tol = tol; S.ed.lastFill = null; libPaintSoon(); return; } colorSet(hex, false, true); bucketAt({ x: (cx - r.left) / S.ed.k, y: (cy - r.top) / S.ed.k }, hex, tol, true); },
    cancel: function(){ if(S.ed && S.ed.lastFill){ undo(); S.ed.redo.pop(); } } }); }
  colorPanel(); lyPanel();
  tabsPaint(); libPaint(); layersPaint(); propPaint(); opsPaint(); stageBind(); pzBind(); zoomBind(); pmApply(); fitStage(); guideDraw();
  setTimeout(fitStage, 60);
  if(r.back && r.back.tip) modal('<h3>↩ 老師退件了</h3><p>📝 老師的建議:<b>' + esc(r.back.tip) + '</b></p>' + (r.back.why && r.back.why.length ? '<p>原因:' + esc(r.back.why.join('、')) + '</p>' : '') + '<p>照建議改好後,再按「📤 確認繳交」。</p>');
}
function locked(){ return !!(S.ed && S.ed.r.lock); }
function barCmd(k){
  var E = S.ed; if(!E) return;
  if(k === 'back'){ if(locked()){ saveLocal(true); backupNow(false); hub(); return; } nameAsk(E.r.title || '', function(v){ E.r.title = v; var tt = $('dsg-root') && $('dsg-root').querySelector('#dsg-ed .bar .t'); if(tt) tt.textContent = D.KINDS[E.r.kind].e + ' ' + v; dirty(); saveLocal(true, function(){ backupNow(false); hub(); }); }); }   /* ★ v1.0.3 回工作室前先幫作品取名字 */
  else if(k === 'undo') undo(); else if(k === 'redo') redo();
  else if(k === 'how') howEditor();
  else if(k === 'zreset'){ zoomSet(1, 0, 0); toast('🔍 回到原本大小'); }   /* ★ v1.0.6 */
  else if(k === 'pnl'){ var ed = $('dsg-ed'), pc = !(ed && ed.classList.contains('pc')); if(ed) ed.classList.toggle('pc', pc); lsSet('dsg_pc', pc ? '1' : '0'); toast(pc ? T({ c: '◧ 面板收起來了,畫畫的地方變大!再按一次「◧」打開', p: '◧ 已收合工具面板;再按一次即可展開' }) : T({ c: '◧ 面板打開了', p: '◧ 已展開工具面板' })); setTimeout(fitStage, 30); }   /* ★ v1.0.6 */
  else if(k === 'lbl'){ var off = lsGet('dsg_nolb') !== '1'; lsSet('dsg_nolb', off ? '1' : '0'); $('dsg-root').classList.toggle('nolb', off); toast(off ? '🏷 功能名稱已隱藏(只留圖示)' : '🏷 功能名稱已顯示'); setTimeout(fitStage, 30); }
  else if(k === 'save'){ if(locked()){ toast('🔒 這件作品已鎖定'); return; } saveLocal(true, function(ok){ toast(ok ? '💾 存好了(這台平板)・' + (E.r.stamp || '') : '存檔失敗,請再試一次'); }); backupNow(true); }
  else if(k === 'submit') submitStart();
}
function opsPaint(){ var el = $('dsg-ops'), q = qOf(S.ed.r.kind); if(el) el.textContent = '✋ 操作 ' + (S.ed.d.ops | 0) + '/' + q.ops; }
function fitStage(){
  var E = S.ed, mid = $('dsg-mid'), st = $('dsg-stage'), W, H, k;
  if(!E || !mid || !st) return;
  W = E.d.W; H = E.d.H; k = Math.min(mid.clientWidth / W, mid.clientHeight / H) * 0.94; if(!(k > 0)) k = 1;
  E.k0 = k; k = k * (E.z || 1);   /* ★ v1.0.6 E.k = 剛好放得下的大小 × 手指縮放倍率;pt() 換算座標都用 E.k,所以畫筆/拖曳/關節不必另外改 */
  zoomClampPan(W * k, H * k, mid.clientWidth, mid.clientHeight);
  E.k = k; E.ox = (mid.clientWidth - W * k) / 2 + (E.panX || 0); E.oy = (mid.clientHeight - H * k) / 2 + (E.panY || 0);
  st.style.transform = 'translate(' + E.ox + 'px,' + E.oy + 'px) scale(' + k + ')';
  zoomBadge();
  selPaint(); if(pzEditing()) guideDraw();   /* ★ v1.0.5 關節把手大小跟著畫面縮放 */
  fxDraw();   /* ★ v1.1.0 變形把手大小跟著畫面縮放 */
}
/* ══ ★ v1.0.6(2026-11-08・老師「角色設計和荒島裝飾設計中,新增可以利用使用者食指和拇指滑動進行放大、縮小畫布檢視的功能」)
   兩指捏合:放大縮小(0.6~6 倍)+兩指一起移動 = 挪畫布;手指中間那一點下面的畫面跟著手指走。PC:滑鼠滾輪(觸控板雙指捏合也會送滾輪)以游標為中心縮放;按住空白鍵或滑鼠中鍵拖曳 = 挪畫布。
   第一根手指放下時已經開始畫(不延遲,畫筆手感不變);第二根手指放下 ⇒ 剛開始的那一筆(按下 0.35 秒內)整筆取消、不算操作、不留復原紀錄;
   畫比較久的那一筆就照常收筆保留。拖物件/縮放物件/骨架拖關節同理(stage 的 E.gCancel、骨架的 E.pzCancel)。
   捏合結束後還留在畫面上的那根手指不會開始畫,全部手指離開才恢復。只改「看的大小」:作品座標、存檔、縮圖、審核全部不受影響。 */
var ZMIN = 0.6, ZMAX = 6;
function zoomClampPan(sw, sh, cw, ch){ var E = S.ed, mx = Math.max(0, (sw + cw) / 2 - Math.min(sw, cw) * 0.3), my = Math.max(0, (sh + ch) / 2 - Math.min(sh, ch) * 0.3);   /* 畫布至少留三成在畫面裡,不會挪到找不到 */
  E.panX = clamp(E.panX || 0, -mx, mx); E.panY = clamp(E.panY || 0, -my, my); }
function zoomBadge(){ var b = $('dsg-zb'), E = S.ed; if(!b || !E) return; var z = E.z || 1, on = Math.abs(z - 1) > 0.01 || Math.abs(E.panX || 0) > 1 || Math.abs(E.panY || 0) > 1;
  b.style.display = on ? '' : 'none'; if(on) b.innerHTML = '🔍 ' + Math.round(z * 100) + '% <span class="lb">↺</span>'; }
function zoomSet(z, px, py){ var E = S.ed; if(!E) return; E.z = clamp(z, ZMIN, ZMAX); E.panX = px; E.panY = py; fitStage(); }
/* 以畫面上 (cx,cy)(相對 #dsg-mid)為中心,把倍率改成 z1:那一點下面的作品座標保持不動 */
function zoomAt(z1, cx, cy){ var E = S.ed, mid = $('dsg-mid'); if(!E || !mid) return; z1 = clamp(z1, ZMIN, ZMAX);
  var k1 = E.k0 * z1, sx = (cx - E.ox) / E.k, sy = (cy - E.oy) / E.k;
  E.z = z1; E.panX = cx - sx * k1 - (mid.clientWidth - E.d.W * k1) / 2; E.panY = cy - sy * k1 - (mid.clientHeight - E.d.H * k1) / 2; fitStage(); }
function zoomBind(){
  var E = S.ed, mid = $('dsg-mid'), T0 = {}, pin = null, hold = false, raf = 0, pan = null;
  if(!mid) return;
  function cnt(){ var n = 0, k; for(k in T0){ if(T0.hasOwnProperty(k)) n++; } return n; }
  function two(){ var a = [], k; for(k in T0){ if(T0.hasOwnProperty(k)) a.push(T0[k]); } return a.slice(0, 2); }
  function rel(e){ var rc = mid.getBoundingClientRect(); return { x: e.clientX - rc.left, y: e.clientY - rc.top }; }
  function startPinch(){ var a = two(), dx = a[1].x - a[0].x, dy = a[1].y - a[0].y;
    try{ if(E.gCancel) E.gCancel(); }catch(x1){} try{ if(E.pzCancel) E.pzCancel(); }catch(x2){}
    pin = { d0: Math.max(20, Math.sqrt(dx * dx + dy * dy)), z0: E.z || 1, mx: (a[0].x + a[1].x) / 2, my: (a[0].y + a[1].y) / 2, k0: E.k, ox: E.ox, oy: E.oy }; hold = true; }
  function movePinch(){ if(!pin) return; if(raf) return;
    raf = (window.requestAnimationFrame || function(f){ return setTimeout(f, 16); })(function(){ raf = 0; if(!pin || cnt() < 2) return;
      var a = two(), dx = a[1].x - a[0].x, dy = a[1].y - a[0].y, d = Math.max(20, Math.sqrt(dx * dx + dy * dy)), z1 = clamp(pin.z0 * d / pin.d0, ZMIN, ZMAX), mx = (a[0].x + a[1].x) / 2, my = (a[0].y + a[1].y) / 2, k1 = E.k0 * z1,
        sx = (pin.mx - pin.ox) / pin.k0, sy = (pin.my - pin.oy) / pin.k0;   /* 捏合開始時兩指中間那一點的作品座標 ⇒ 永遠跟著兩指中間走 */
      E.z = z1; E.panX = mx - sx * k1 - (mid.clientWidth - E.d.W * k1) / 2; E.panY = my - sy * k1 - (mid.clientHeight - E.d.H * k1) / 2; fitStage(); }); }
  function block(e){ e.stopPropagation(); if(e.cancelable) e.preventDefault(); }
  mid.addEventListener('pointerdown', function(e){
    if(pan || (e.pointerType !== 'touch' && (e.button === 1 || S.spaceDown))){   /* PC:中鍵或按住空白鍵拖曳 = 挪畫布 */
      if(!pan){ pan = { id: e.pointerId, x: e.clientX, y: e.clientY, px: E.panX || 0, py: E.panY || 0 }; try{ mid.setPointerCapture(e.pointerId); }catch(x){} }
      block(e); return; }
    if(e.pointerType !== 'touch') return;
    T0[e.pointerId] = rel(e);
    if(cnt() >= 2){ block(e); if(!pin) startPinch(); else { var a = two(); pin.d0 = Math.max(20, Math.sqrt((a[1].x - a[0].x) * (a[1].x - a[0].x) + (a[1].y - a[0].y) * (a[1].y - a[0].y))); pin.z0 = E.z; pin.mx = (a[0].x + a[1].x) / 2; pin.my = (a[0].y + a[1].y) / 2; pin.k0 = E.k; pin.ox = E.ox; pin.oy = E.oy; } return; }
    if(hold) block(e);   /* 捏合後還有手指沒離開:不開始畫 */
  }, true);
  mid.addEventListener('pointermove', function(e){
    if(pan && e.pointerId === pan.id){ E.panX = pan.px + e.clientX - pan.x; E.panY = pan.py + e.clientY - pan.y; fitStage(); block(e); return; }
    if(e.pointerType !== 'touch' || !T0[e.pointerId]) return;
    T0[e.pointerId] = rel(e);
    if(pin){ block(e); movePinch(); }
  }, true);
  function up(e){
    if(pan && e.pointerId === pan.id){ pan = null; block(e); return; }
    if(e.pointerType !== 'touch') return;
    var had = !!T0[e.pointerId]; delete T0[e.pointerId];
    if(pin && cnt() < 2){ pin = null; }
    if(hold){ if(had) block(e); if(!cnt()) hold = false; }
  }
  mid.addEventListener('pointerup', up, true); mid.addEventListener('pointercancel', up, true);
  mid.addEventListener('wheel', function(e){ if(e.cancelable) e.preventDefault(); var p = rel(e), f = Math.exp(-clamp(e.deltaY, -120, 120) * (e.ctrlKey ? 0.012 : 0.0022)); zoomAt((E.z || 1) * f, p.x, p.y); }, { passive: false });
  mid.addEventListener('gesturestart', function(e){ if(e.cancelable) e.preventDefault(); });   /* iOS Safari:不讓整頁跟著縮放 */
  mid.addEventListener('gesturechange', function(e){ if(e.cancelable) e.preventDefault(); });
  if(!S.spaceBound){ S.spaceBound = 1;
    document.addEventListener('keydown', function(e){ if(e.keyCode === 32 && S.ed && !/^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || '')){ S.spaceDown = true; if(e.cancelable) e.preventDefault(); } });
    document.addEventListener('keyup', function(e){ if(e.keyCode === 32) S.spaceDown = false; }); }
}
/* 一次操作完成:記復原、計次數、存本機 */
function snapNow(){ var E = S.ed, p = {}, k; for(k in E.pls){ if(E.pls.hasOwnProperty(k)) p[k] = E.pls[k]; } return { d: JSON.stringify(E.d), p: p }; }   /* ★ v1.1.0 各圖層 PNG 字串(同一份字串共用,不多佔記憶體) */
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
function opKey(){ var E = S.ed, o = E.d.ops, oh = E.d.oh, gd = E.d.guide, s; E.d.ops = 0; E.d.oh = null; E.d.guide = null; try{ s = JSON.stringify(E.d); }catch(x){ s = ''; } E.d.ops = o; E.d.oh = oh; E.d.guide = gd; return opHash(s) + '|' + opHash(plsJoin()); }   /* ★ v1.1.0 所有圖層的筆跡 */
function endOp(add){ var E = S.ed, k, oh;
  if(add){ k = opKey(); oh = E.d.oh = (E.d.oh && E.d.oh.push) ? E.d.oh : [];
    if(E._bk && oh.indexOf(E._bk) < 0) oh.push(E._bk);   /* 改之前的樣子也記下來:之後換回原本的樣子不算 */
    if(k !== E._bk && oh.indexOf(k) < 0){ oh.push(k); E.d.ops = (E.d.ops | 0) + 1; }
    while(oh.length > 600) oh.shift(); }
  E._bk = null; opsPaint(); dirty(); }
function restore(sn){ var E = S.ed, k, gd = E.d.guide; E.d = JSON.parse(sn.d); E.d.guide = gd; E.r.d = E.d;   /* ★ v1.0.5 復原/重做作品時,骨架姿勢維持現在的樣子(骨架有自己的上一步) */
  E.pls = {}; for(k in sn.p){ if(sn.p.hasOwnProperty(k)) E.pls[k] = sn.p[k]; }   /* ★ v1.1.0 每個圖層各自換回來(內容一樣的不重畫) */
  if(!lyGet(E.al) || lyGet(E.al).k !== 'p'){ var a = lyList(), i; for(i = a.length - 1; i >= 0; i--){ if(a[i].k === 'p'){ E.al = a[i].id; break; } } }
  plsBuild(); lyPanel();
  E.sel = -1; layersPaint(); libPaint(); propPaint(); dirty(); }
function undo(){ var E = S.ed; if(E && E.float){ flCancel(); return; } tolClose(); if(locked() || !E.undo.length){ return; } var cur = snapNow(), ops = E.d.ops, oh = E.d.oh; E.redo.push(cur); restore(E.undo.pop()); E.d.ops = ops; E.d.oh = oh; opsPaint(); }   /* ★ v1.0.2 算過的畫面指紋 oh 也不跟著復原 */
function redo(){ var E = S.ed; if(E && E.float){ toast('先按 ✅ 完成或 ✖ 取消'); return; } tolClose(); if(locked() || !E.redo.length) return; var ops = E.d.ops, oh = E.d.oh; E.undo.push(snapNow()); restore(E.redo.pop()); E.d.ops = ops; E.d.oh = oh; opsPaint(); }   /* 復原不扣操作次數(做過的努力都算) */
var dT = null;
function dirty(){ var E = S.ed; if(!E) return; E.dirty = true; E.cloudDirty = true; clearTimeout(dT); dT = setTimeout(function(){ saveLocal(false); }, 1500); }

/* ── 存檔:本機(自動/手動)+ 雲端備份(每 5 分鐘;手動存檔時立刻) ── */
function saveLocal(withThumb, cb){
  var E = S.ed; if(!E){ if(cb) cb(false); return; }
  var r = E.r; r.d = E.d; r.pls = plsCopy(); r.paint = mergedPaint(); r.at = now(); r.stamp = fmtStamp(r.at); stampShow(r.stamp);   /* ★ v1.1.0 各圖層 pls;paint = 合併後的畫筆層(給還沒更新的舊版本看);stamp = 存檔時間 */
  function put(){ idbPut((r.uid || 'guest') + '|' + r.id, JSON.parse(JSON.stringify(r)), function(ok){ E.dirty = false; if(cb) cb(ok); }); }
  if(r.uid !== (S.guest ? 'guest' : S.uid)){ if(cb) cb(false); return; }   /* 帳號已換人:不寫到別人名下 */
  if(withThumb) renderComposite(false, 200, function(cv){ try{ r.th = cv.toDataURL('image/png'); }catch(e){} put(); }); else put();
}
function backupTick(){ var E = S.ed; if(E && E.cloudDirty && now() - E.lastCloud >= D.CLOUD_BACKUP_MS) backupNow(false); }
/* ★ v1.0.7(2026-11-09・老師「作品集、自定義設定都自動保持雲端同步,不需要玩家自己手動上傳下載(玩家仍可手動做一個保險)」)
   改用 index 的共用引擎 MG_CSYNC:作品雙向同步(新的贏)、刪除留墓碑、設定(說明風格/名稱標籤/面板收合/畫風/像素格數/筆名/我的姿勢)跟著帳號走。
   自動時機:進工作室/換人、回工作室、每 3 分鐘、回到前景、編輯中每 5 分鐘與存檔當下、設定一改。「☁ 立即同步」= 手動保險。 */
var CS_SET = ['dsg_style', 'dsg_nolb', 'dsg_pc', 'dsg_pm', 'dsg_pxn'];
function csNow(){
  if(S.cs || !window.MG_CSYNC) return S.cs;
  S.cs = window.MG_CSYNC({ pfx: 'dsgcs',
    uid: function(){ return S.guest ? '' : (S.uid || ''); },
    ok: function(){ return S.on && ownerOk(); },
    base: function(u){ return 'designDrafts/' + u; },
    sto: sto,
    recT: function(r){ return +r.at || 0; },
    listLocal: function(cb){ myDrafts(function(a){ var o = [], i; for(i = 0; i < a.length; i++){ if(a[i].uid === S.uid && a[i].id) o.push(a[i]); } cb(o); }); },
    putLocal: function(r, cb){ if(!r.d){ cb(false); return; } r.uid = S.uid; idbPut(S.uid + '|' + r.id, r, cb); },
    delLocal: function(id, cb){ idbDel(S.uid + '|' + id, cb); },
    openId: function(){ return S.ed ? S.ed.r.id : ''; },
    setKeys: function(u){ return CS_SET.concat(['dsg_pen_' + u, 'dsg_tut_' + u, 'dsg_poses_' + u]); },
    onSet: function(){ S.style = lsGet('dsg_style') === 'p' ? 'p' : 'c'; var rt = $('dsg-root'); if(rt) rt.classList.toggle('nolb', lsGet('dsg_nolb') === '1'); if(S.screen === 'hub' && !$('dsg-modal')) hub(); },
    onStatus: function(st){ var el = $('dsg-cs'); if(el) el.textContent = st.msg || ''; },
    onPulled: function(n){ if(n) toast('☁ 從雲端同步了 ' + n + ' 件作品'); if(S.screen === 'hub') draftsPaint(); }
  });
  return S.cs;
}
function backupNow(say){
  var E = S.ed; if(!E || S.guest || !ownerOk() || !csNow()) return;
  var r = E.r, uid = S.uid;
  if(r.uid !== uid) return;
  r.d = E.d; r.pls = plsCopy(); r.paint = mergedPaint(); r.stamp = fmtStamp(r.at);
  E.cloudDirty = false; E.lastCloud = now();
  S.cs.put(JSON.parse(JSON.stringify(r)), function(okk){ if(!okk){ E.cloudDirty = true; if(say) toast('☁ ' + (S.cs.status().msg || '雲端備份失敗') + '(平板上的存檔還在)'); } else if(say) toast('☁ 雲端備份好了'); });
}
function cloudRestore(){
  if(S.guest){ toast('登入後才有雲端備份'); return; }
  if(csNow()){ toast('☁ 正在和雲端同步…'); S.cs.sync(true, function(okk){ toast(okk ? '☁ 同步完成,這台和雲端一樣了' : ('☁ ' + (S.cs.status().msg || '同步沒有成功'))); if(S.screen === 'hub') draftsPaint(); }); return; }   /* ★ v1.0.7 手動保險 = 立刻雙向同步 */
  var uid = S.uid; toast('☁ 正在找雲端備份…');
  sto(function(s){ if(!s){ toast('☁ 雲端備份目前連不上'); return; }
    s.ref('designDrafts/' + uid).listAll().then(function(res){
      myDrafts(function(local){ var have = {}, i, todo = [], got = 0, bad = 0; for(i = 0; i < local.length; i++) have[local[i].id] = local[i].at || 0;
        res.items.forEach(function(it){ var id = it.name.replace(/\.json$/, '');
          if(id.charAt(0) === '_'){ if(id === '_poses') it.getDownloadURL().then(function(u){ return fetch(u); }).then(function(x){ return x.json(); }).then(function(o){ if(o && o.uid === uid && uid === S.uid){ var n = pzMineMerge(o.poses); if(n) toast('☁ 找回 ' + n + ' 個我的姿勢'); } })['catch'](function(){}); return; }   /* ★ v1.0.5 _poses.json = 我的姿勢,不是作品 */
          if(!have[id]) todo.push(it); });
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
  st.classList.toggle('posing', pzEditing());   /* ★ v1.0.5 🦴 分頁:人偶浮到最上層可以拖 */
  if(E.tab !== 'pose') E.pj = null;
  if(on && E.pm === 'pixel') gridDraw();
  guideDraw(); }
function gridDraw(){ var E = S.ed, g = $('dsg-grid'), x, n = E.px.n, c = E.d.W / n, i; if(!g) return; x = g.getContext('2d'); x.clearRect(0, 0, g.width, g.height); x.strokeStyle = 'rgba(80,80,160,.28)'; x.lineWidth = 1;
  for(i = 0; i * c <= E.d.W + 0.5; i++){ x.beginPath(); x.moveTo(Math.round(i * c) + 0.5, 0); x.lineTo(Math.round(i * c) + 0.5, E.d.H); x.stroke(); }
  for(i = 0; i * c <= E.d.H + 0.5; i++){ x.beginPath(); x.moveTo(0, Math.round(i * c) + 0.5); x.lineTo(E.d.W, Math.round(i * c) + 0.5); x.stroke(); } }
function avName(f){ var p = f.split('_'), i, n = []; for(i = 0; i < p.length; i++){ if(D.AV_WORD[p[i]]) n.push(D.AV_WORD[p[i]]); } return n.join('') || f; }
/* ══ ★ v1.0.5(2026-11-08 13:06・老師「骨架改成有關節,可以 3D 拖曳調整人物姿勢」)3D 關節人偶 ══
   資料:d.guide = { t:'pose', id:起手範本, on, a:濃淡, j:{關節:[x,y,z]}(畫布像素,z 朝鏡頭為正), yw:左右轉角度, pt:上下俯仰角度 }
   · 舊草稿只有 {t:'pose', id} ⇒ pzEnsure 從範本推出 3D(站好量骨長;畫面上變短的骨頭 = 朝鏡頭伸出)。
   · 拖關節:在「目前視角」的空間裡,把被拖的那節骨頭轉向手指(骨長不變;手指比骨頭近 ⇒ 剩下的長度往前或往後伸,沿用原本那一側),
     下面接著的關節一起轉(拖肩/髖 = 兩邊肩膀或兩邊髖一起轉;拖腰 = 整個人移動)。拖空白處 = 轉視角(只改看的角度,不改姿勢)。
   · 只當描圖參考:只改 d.guide,不記作品復原、不算操作次數、renderComposite 不畫;人偶自己有「↶ 上一步」(最多 30 步,不存檔)。
   · 🦴 分頁開著時人偶浮到最上層可以拖(#dsg-stage.posing);切到 🖌 畫筆就回到畫筆層下面、照濃淡淡淡顯示。 */
function pzEditing(){ var E = S.ed, g = E && E.d.guide; return !!(E && E.tab === 'pose' && g && g.t === 'pose' && g.on && !locked()); }
function pzPreset(id){ var i; for(i = 0; i < D.POSES.length; i++){ if(D.POSES[i].id === id) return D.POSES[i]; } return D.POSES[0]; }
/* 範本只有 15 個關節:脊椎 s1~s3 在腰與頸之間平均補(★ 13:19 脊椎多 3 節);臉方向點 fc 放在頭球正前方 */
function pzP2(id){ var P = pzPreset(id).j, o = {}, k, i, t; for(k in P){ if(P.hasOwnProperty(k)) o[k] = P[k]; }
  for(i = 1; i <= 3; i++){ t = i / 4; if(!o['s' + i]) o['s' + i] = [P.p[0] + (P.n[0] - P.p[0]) * t, P.p[1] + (P.n[1] - P.p[1]) * t]; } return o; }
function pzHeadR(W){ return W * 0.075; }
/* 身體前方(視角或世界都可用):(左肩−右肩)×(頸−胸椎下) */
function pzFwd(J){ var a = v3sub(J.ls, J.rs), b = v3sub(J.n, J.s2 || J.p), f = v3cross(a, b), l = v3len(f) || 1; return [f[0] / l, f[1] / l, f[2] / l]; }
function pzFixFc(j, W){ var f = pzFwd(j), R = pzHeadR(W); j.fc = [j.h[0] + f[0] * R, j.h[1] + f[1] * R, j.h[2] + f[2] * R]; }
function pzFrom(id, W, H){
  var R = pzP2('stand'), P = pzP2(id), zb = D.POSE_ZB[id] || {}, o = {}, i, k, pa, dx, dy, d, L, s, z;
  o.p = [P.p[0] * W, P.p[1] * H, 0];
  for(i = 1; i < D.POSE_ORD.length; i++){ k = D.POSE_ORD[i]; pa = D.POSE_PAR[k]; if(k === 'fc') continue;
    L = Math.sqrt(Math.pow((R[k][0] - R[pa][0]) * W, 2) + Math.pow((R[k][1] - R[pa][1]) * H, 2));
    dx = (P[k][0] - P[pa][0]) * W; dy = (P[k][1] - P[pa][1]) * H; d = Math.sqrt(dx * dx + dy * dy);
    if(d >= L - 0.5 || d < 0.01){ s = d < 0.01 ? 0 : L / d; z = d < 0.01 ? L : 0; } else { s = 1; z = Math.sqrt(L * L - d * d); }
    if(zb[k]) z = -z;
    o[k] = [o[pa][0] + dx * s, o[pa][1] + dy * s, o[pa][2] + z]; }
  pzFixFc(o, W);
  return o;
}
function pzEnsure(g, W, H){ var k, ok = !!(g.j && g.j.p && g.j.p.length === 3 && g.j.n && g.j.h), i, t;
  if(ok){ for(i = 1; i <= 3; i++){ t = i / 4; if(!(g.j['s' + i] && g.j['s' + i].length === 3)) g.j['s' + i] = [g.j.p[0] + (g.j.n[0] - g.j.p[0]) * t, g.j.p[1] + (g.j.n[1] - g.j.p[1]) * t, g.j.p[2] + (g.j.n[2] - g.j.p[2]) * t]; }
    if(!(g.j.fc && g.j.fc.length === 3)) pzFixFc(g.j, W);
    for(k in D.POSE_PAR){ if(D.POSE_PAR.hasOwnProperty(k) && !(g.j[k] && g.j[k].length === 3)) ok = false; } }
  if(!ok) g.j = pzFrom(g.id || 'stand', W, H);
  if(typeof g.yw !== 'number') g.yw = 0; if(typeof g.pt !== 'number') g.pt = 0; if(!(g.zm > 0)) g.zm = 1; }
/* 視角:以腰 p 為中心,先左右轉 yw、再上下俯仰 pt、再拉近拉遠 zm;正交投影(畫面 x,y = 視角空間 x,y)。zm 只改看的大小,不改姿勢 */
function pzVw(g){
  var a = g.yw * Math.PI / 180, b = g.pt * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b), c = g.j.p, m = g.zm > 0 ? g.zm : 1;
  return {
    f: function(w){ var x = w[0] - c[0], y = w[1] - c[1], z = w[2] - c[2], x1 = x * ca + z * sa, z1 = -x * sa + z * ca; return [x1 * m + c[0], (y * cb - z1 * sb) * m + c[1], (y * sb + z1 * cb) * m + c[2]]; },
    inv: function(v){ var x1 = (v[0] - c[0]) / m, y2 = (v[1] - c[1]) / m, z2 = (v[2] - c[2]) / m, y = y2 * cb + z2 * sb, z1 = -y2 * sb + z2 * cb; return [x1 * ca - z1 * sa + c[0], y + c[1], x1 * sa + z1 * ca + c[2]]; } };
}
function pzAll(g){ var vw = pzVw(g), V = {}, k; for(k in g.j){ if(g.j.hasOwnProperty(k)) V[k] = vw.f(g.j[k]); } return V; }
function pzBack(g, V){ var vw = pzVw(g), k, w; for(k in V){ if(V.hasOwnProperty(k)){ w = vw.inv(V[k]); g.j[k] = [Math.round(w[0] * 100) / 100, Math.round(w[1] * 100) / 100, Math.round(w[2] * 100) / 100]; } } }
function pzKids(k){ var o = [], i, q, c; for(i = 0; i < D.POSE_ORD.length; i++){ q = D.POSE_ORD[i]; c = q; while(c && c !== k) c = D.POSE_PAR[c]; if(c === k) o.push(q); } return o; }
/* 拖某個關節時:繞哪個點轉(piv)、哪些關節跟著動(set) */
function pzRig(k){
  if(k === 'ls' || k === 'rs') return { piv: 'n', set: pzKids('ls').concat(pzKids('rs')) };
  if(k === 'lp' || k === 'rp') return { piv: 'p', set: pzKids('lp').concat(pzKids('rp')) };
  return { piv: D.POSE_PAR[k], set: pzKids(k) };
}
function v3sub(a, b){ return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function v3len(a){ return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]); }
function v3cross(a, b){ return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
/* 把 V[set] 繞 V[piv] 轉,讓 u 方向轉到 v 方向(Rodrigues) */
function pzTurn(V, piv, set, u, v){
  var lu = v3len(u), lv = v3len(v), ax, la, cs, sn, i, q, P = V[piv], r, kx, d;
  if(lu < 1e-6 || lv < 1e-6) return;
  ax = v3cross(u, v); la = v3len(ax); cs = (u[0] * v[0] + u[1] * v[1] + u[2] * v[2]) / (lu * lv);
  if(la < 1e-9) return;
  sn = la / (lu * lv); ax = [ax[0] / la, ax[1] / la, ax[2] / la];
  for(i = 0; i < set.length; i++){ q = set[i]; r = v3sub(V[q], P); kx = v3cross(ax, r); d = ax[0] * r[0] + ax[1] * r[1] + ax[2] * r[2];
    V[q] = [P[0] + r[0] * cs + kx[0] * sn + ax[0] * d * (1 - cs), P[1] + r[1] * cs + kx[1] * sn + ax[1] * d * (1 - cs), P[2] + r[2] * cs + kx[2] * sn + ax[2] * d * (1 - cs)]; }
}
/* 拖關節 k 到畫面點 (tx,ty) */
function pzDragTo(g, k, tx, ty){
  var V = pzAll(g), rg, P, u, L, dx, dy, d2, v, i, q;
  if(k === 'p'){ dx = tx - V.p[0]; dy = ty - V.p[1]; for(q in V){ if(V.hasOwnProperty(q)){ V[q][0] += dx; V[q][1] += dy; } }
    var vw0 = pzVw(g), np = vw0.inv(V.p); /* 整個人平移:世界座標直接加上同樣的位移(視角中心跟著腰走) */
    var dw = v3sub(np, g.j.p); for(q in g.j){ if(g.j.hasOwnProperty(q)) g.j[q] = [Math.round((g.j[q][0] + dw[0]) * 10) / 10, Math.round((g.j[q][1] + dw[1]) * 10) / 10, Math.round((g.j[q][2] + dw[2]) * 10) / 10]; }
    return; }
  rg = pzRig(k); P = V[rg.piv]; u = v3sub(V[k], P); L = v3len(u);
  dx = tx - P[0]; dy = ty - P[1]; d2 = dx * dx + dy * dy; if(d2 < 1 || L < 1) return;
  if(d2 >= L * L){ i = L / Math.sqrt(d2); v = [dx * i, dy * i, 0]; } else v = [dx, dy, (u[2] >= 0 ? 1 : -1) * Math.sqrt(L * L - d2)];
  pzTurn(V, rg.piv, rg.set, u, v); pzBack(g, V);
}
/* 把向量 r 繞單位軸 ax 轉 ang(弧度) */
function v3rot(r, ax, ang){ var cs = Math.cos(ang), sn = Math.sin(ang), kx = v3cross(ax, r), d = ax[0] * r[0] + ax[1] * r[1] + ax[2] * r[2];
  return [r[0] * cs + kx[0] * sn + ax[0] * d * (1 - cs), r[1] * cs + kx[1] * sn + ax[1] * d * (1 - cs), r[2] * cs + kx[2] * sn + ax[2] * d * (1 - cs)]; }
/* ★ 13:20 向前/向後:選到的那一節往鏡頭(前)或遠離鏡頭(後)轉 15°;選到 ✥ 腰 = 整個人往前/往後傾 */
function pzNudge(g, k, fwd){
  var V = pzAll(g), ang = 15 * Math.PI / 180, rg, P, u, ax, la, a1, a2, v1, v2, set, i, q, r, pick;
  if(k === 'p'){ P = V.p; set = []; for(q in V){ if(V.hasOwnProperty(q) && q !== 'p') set.push(q); }
    ax = [1, 0, 0]; v1 = v3rot(v3sub(V.h, P), ax, ang); pick = (v1[2] > (V.h[2] - P[2])) === !!fwd ? ang : -ang;
    for(i = 0; i < set.length; i++){ q = set[i]; r = v3rot(v3sub(V[q], P), ax, pick); V[q] = [P[0] + r[0], P[1] + r[1], P[2] + r[2]]; }
    pzBack(g, V); return true; }
  rg = pzRig(k); P = V[rg.piv]; u = v3sub(V[k], P);
  ax = v3cross(u, [0, 0, 1]); la = v3len(ax); if(la < 1e-6){ ax = [1, 0, 0]; } else ax = [ax[0] / la, ax[1] / la, ax[2] / la];
  v1 = v3rot(u, ax, ang); v2 = v3rot(u, ax, -ang); a1 = fwd ? v1[2] : -v1[2]; a2 = fwd ? v2[2] : -v2[2];
  if(Math.max(a1, a2) <= (fwd ? u[2] : -u[2]) + 1e-6) return false;   /* 已經正對(或背對)鏡頭了 */
  pzTurn(V, rg.piv, rg.set, u, a1 >= a2 ? v1 : v2); pzBack(g, V); return true;
}
function pzMirror(g){ var cx = g.j.p[0], o = {}, k, s;
  for(k in g.j){ if(g.j.hasOwnProperty(k)){ s = k.charAt(0) === 'l' ? 'r' + k.slice(1) : (k.charAt(0) === 'r' ? 'l' + k.slice(1) : k); o[s] = [2 * cx - g.j[k][0], g.j[k][1], g.j[k][2]]; } }
  g.j = o; g.yw = -g.yw; }
/* 畫人偶:遠的先畫、近的後畫;左半邊藍、右半邊橘,讓轉身時分得出左右;近的粗一點、遠的淡一點;頭上的眼睛標出臉朝哪 */
function pzDraw(x, g, W, H, edit){
  var V = pzAll(g), items = [], i, b, a0, a1, zc = V.p[2], dep, it, k, ZM = g.zm > 0 ? g.zm : 1, R = pzHeadR(W) * ZM;
  var TH = { s1: 0.05, s2: 0.05, s3: 0.05, n: 0.04, h: 0.03, ls: 0.026, rs: 0.026, le: 0.034, re: 0.034, lh: 0.028, rh: 0.028, lp: 0.03, rp: 0.03, lk: 0.046, rk: 0.046, lf: 0.038, rf: 0.038, sh: 0.03 };
  function col(k){ return k.charAt(0) === 'l' ? '#2f7de1' : (k.charAt(0) === 'r' ? '#f0811f' : '#7a5cd6'); }
  function dsc(z){ return Math.max(0.75, Math.min(1.3, 1 + (z - zc) / (H * 1.4))); }
  function shade(z){ return Math.max(0.45, Math.min(1, 0.75 + (z - zc) / (H * 0.8))); }
  /* 地面影子:腳底高度的一圈 */
  var gy = Math.max(g.j.lf[1], g.j.rf[1]) + W * 0.02, vw = pzVw(g), gp = [], n;
  for(n = 0; n < 28; n++) gp.push(vw.f([g.j.p[0] + Math.cos(n / 28 * Math.PI * 2) * W * 0.26, gy, g.j.p[2] + Math.sin(n / 28 * Math.PI * 2) * W * 0.26]));
  x.save(); x.beginPath(); x.moveTo(gp[0][0], gp[0][1]); for(n = 1; n < gp.length; n++) x.lineTo(gp[n][0], gp[n][1]); x.closePath();
  x.fillStyle = 'rgba(40,40,90,.10)'; x.fill(); x.strokeStyle = 'rgba(40,40,90,.22)'; x.lineWidth = 2; x.setLineDash([8, 8]); x.stroke(); x.restore();
  /* 身體板:胸(兩肩 → 胸椎下)、腰臀(腰椎 → 兩髖),脊椎彎時兩塊跟著彎 */
  /* ★ 13:24 老師「骨架模型用 3D 建模」:四肢 = 有明暗的圓柱(垂直骨頭方向的漸層,光從左上來)、關節 = 立體球、身體 = 有明暗的軀幹塊 */
  function pal(k){ var c = k.charAt(0); return c === 'l' ? ['#1b4c96', '#3d8af0', '#cfe3ff'] : (c === 'r' ? ['#9a4a08', '#f28a2a', '#ffe0c2'] : ['#45308f', '#8467e0', '#e6ddff']); }
  function ball(P, r, k, zz){ items.push({ z: zz + 0.01, f: function(){ var p3 = pal(k), gb = x.createRadialGradient(P[0] - r * 0.4, P[1] - r * 0.45, r * 0.1, P[0], P[1], r);
    gb.addColorStop(0, p3[2]); gb.addColorStop(0.5, p3[1]); gb.addColorStop(1, p3[0]); x.globalAlpha = shade(zz); x.beginPath(); x.arc(P[0], P[1], r, 0, Math.PI * 2); x.fillStyle = gb; x.fill(); x.globalAlpha = 1; } }); }
  function plate(pts, zz, al){ items.push({ z: zz, f: function(){ var q, mnx = 1e9, mny = 1e9, mxx = -1e9, mxy = -1e9, gp2;
    for(q = 0; q < pts.length; q++){ mnx = Math.min(mnx, pts[q][0]); mny = Math.min(mny, pts[q][1]); mxx = Math.max(mxx, pts[q][0]); mxy = Math.max(mxy, pts[q][1]); }
    gp2 = x.createLinearGradient(mnx, mny, mxx, mxy); gp2.addColorStop(0, 'rgba(230,221,255,' + (al + 0.25) + ')'); gp2.addColorStop(0.55, 'rgba(132,103,224,' + (al + 0.15) + ')'); gp2.addColorStop(1, 'rgba(69,48,143,' + (al + 0.2) + ')');
    x.globalAlpha = shade(zz); x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for(q = 1; q < pts.length; q++) x.lineTo(pts[q][0], pts[q][1]); x.closePath(); x.fillStyle = gp2; x.fill();
    x.lineWidth = Math.max(2, W * 0.004); x.strokeStyle = 'rgba(69,48,143,.55)'; x.stroke(); x.globalAlpha = 1; } }); }
  var hs = [(V.ls[0] - V.rs[0]) / 2, (V.ls[1] - V.rs[1]) / 2, (V.ls[2] - V.rs[2]) / 2], hp = [(V.lp[0] - V.rp[0]) / 2, (V.lp[1] - V.rp[1]) / 2, (V.lp[2] - V.rp[2]) / 2];
  plate([V.ls, V.rs, [V.s2[0] - hs[0] * 0.75, V.s2[1] - hs[1] * 0.75], [V.s2[0] + hs[0] * 0.75, V.s2[1] + hs[1] * 0.75]], (V.ls[2] + V.rs[2] + V.s2[2] * 2) / 4, 0.17);
  plate([[V.s1[0] + hp[0] * 0.95, V.s1[1] + hp[1] * 0.95], [V.s1[0] - hp[0] * 0.95, V.s1[1] - hp[1] * 0.95], V.rp, V.lp], (V.lp[2] + V.rp[2] + V.s1[2] * 2) / 4, 0.14);
  for(i = 0; i < D.POSE_BONES3.length; i++){ b = D.POSE_BONES3[i];
    (function(p0, p1){ var kk = D.POSE_PAR[p0] === p1 ? p0 : (D.POSE_PAR[p1] === p0 ? p1 : p0), zz = (V[p0][2] + V[p1][2]) / 2;
      if((p0 === 'ls' && p1 === 'rs') || (p0 === 'lp' && p1 === 'rp')) kk = 'sh';
      var ck = kk.charAt(0) === 'l' || kk.charAt(0) === 'r' ? kk : 'm';
      items.push({ z: zz, f: function(){ var w = W * (TH[kk] || 0.03) * dsc(zz) * ZM, A = V[p0], B = V[p1], dx = B[0] - A[0], dy = B[1] - A[1], ln = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / ln, ny = dx / ln, gc, p3 = pal(ck), mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
        if(nx + ny > 0){ nx = -nx; ny = -ny; }   /* 亮面朝左上 */
        gc = x.createLinearGradient(mx + nx * w / 2, my + ny * w / 2, mx - nx * w / 2, my - ny * w / 2);
        gc.addColorStop(0, p3[2]); gc.addColorStop(0.35, p3[1]); gc.addColorStop(1, p3[0]);
        x.globalAlpha = shade(zz); x.lineCap = 'round'; x.strokeStyle = gc; x.lineWidth = w;
        x.beginPath(); x.moveTo(A[0], A[1]); x.lineTo(B[0], B[1]); x.stroke(); x.globalAlpha = 1; } }); })(b[0], b[1]);
  }
  /* 關節球(肩/肘/腕/髖/膝/踝/脊椎/頸) */
  for(k in V){ if(!V.hasOwnProperty(k) || k === 'h' || k === 'fc' || k === 'p') continue; ball(V[k], W * (TH[k] || 0.035) * 0.62 * dsc(V[k][2]) * ZM, k.charAt(0) === 'l' || k.charAt(0) === 'r' ? k : 'm', V[k][2]); }
  ball(V.p, W * 0.04 * dsc(V.p[2]) * ZM, 'm', V.p[2]);
  /* ★ 13:19 頭 = 球體 + 十字定位線(Loomis 畫法):
     臉方向 fw = 頭心→fc;上方 up = 頸→頭(扣掉 fw 分量);右方 rt = up×fw。
     直線 = 臉的中線(通過 up、fw 的大圓),橫線 = 眼睛線(通過 fw、rt 的大圓),兩線交點 = 臉正中央(鼻樑)。
     面向鏡頭那半球的線畫實線、背面畫淡虛線 ⇒ 轉頭時看得出球的透視;眼睛在橫線上左右 28°,鼻子從交點往前下方凸出。 */
  items.push({ z: V.h[2], f: function(){ var r = R, c = V.h, fw = v3sub(V.fc, c), lf = v3len(fw) || 1, up = v3sub(V.h, V.n), d0, lu, rt, t, n2, o, pts, vis, s2, ea, ez, ex, ey, nt, gr;
    fw = [fw[0] / lf, fw[1] / lf, fw[2] / lf]; d0 = up[0] * fw[0] + up[1] * fw[1] + up[2] * fw[2]; up = [up[0] - fw[0] * d0, up[1] - fw[1] * d0, up[2] - fw[2] * d0]; lu = v3len(up) || 1; up = [up[0] / lu, up[1] / lu, up[2] / lu];
    rt = v3cross(up, fw);
    x.globalAlpha = shade(c[2]);
    gr = x.createRadialGradient(c[0] - r * 0.38, c[1] - r * 0.42, r * 0.08, c[0], c[1], r);
    gr.addColorStop(0, 'rgba(255,255,255,.85)'); gr.addColorStop(0.55, 'rgba(176,156,240,.45)'); gr.addColorStop(1, 'rgba(92,64,190,.55)');
    x.beginPath(); x.arc(c[0], c[1], r, 0, Math.PI * 2); x.fillStyle = gr; x.fill(); x.lineWidth = Math.max(4, W * 0.012 * ZM); x.strokeStyle = '#7a5cd6'; x.stroke();
    /* 大圓:沿 A cos t + B sin t;z ≥ 0 的點在前半球 */
    function ring(A, B, colr, wd){ var seg = 48, q, prev = null, pv = null, P2;
      for(q = 0; q <= seg; q++){ t = q / seg * Math.PI * 2; o = [A[0] * Math.cos(t) + B[0] * Math.sin(t), A[1] * Math.cos(t) + B[1] * Math.sin(t), A[2] * Math.cos(t) + B[2] * Math.sin(t)];
        P2 = [c[0] + o[0] * r, c[1] + o[1] * r]; vis = o[2] >= 0;
        if(prev){ x.beginPath(); x.moveTo(prev[0], prev[1]); x.lineTo(P2[0], P2[1]); if(vis && pv){ x.setLineDash([]); x.globalAlpha = shade(c[2]); x.strokeStyle = colr; x.lineWidth = wd; } else { x.setLineDash([4, 5]); x.globalAlpha = shade(c[2]) * 0.35; x.strokeStyle = colr; x.lineWidth = wd * 0.6; } x.stroke(); }
        prev = P2; pv = vis; }
      x.setLineDash([]); x.globalAlpha = shade(c[2]); }
    ring(up, fw, '#3b2a80', Math.max(2.5, W * 0.0065 * ZM));   /* 直線:臉的中線 */
    ring(fw, rt, '#d6336c', Math.max(2.5, W * 0.0065 * ZM));   /* 橫線:眼睛線 */
    /* 眼睛:橫線上左右 28°,在前半球才畫,越側面越扁 */
    for(s2 = -1; s2 <= 1; s2 += 2){ ea = 28 * Math.PI / 180 * s2;
      o = [fw[0] * Math.cos(ea) + rt[0] * Math.sin(ea), fw[1] * Math.cos(ea) + rt[1] * Math.sin(ea), fw[2] * Math.cos(ea) + rt[2] * Math.sin(ea)];
      ez = o[2]; if(ez <= 0.05) continue; ex = c[0] + o[0] * r; ey = c[1] + o[1] * r;
      x.save(); x.translate(ex, ey); x.rotate(Math.atan2(o[1], o[0])); x.scale(Math.max(0.3, ez), 1);   /* 球面上的圓投影:沿半徑方向壓扁 = 朝鏡頭的程度 */
      x.beginPath(); x.arc(0, 0, r * 0.12, 0, Math.PI * 2); x.fillStyle = '#ffffff'; x.fill(); x.lineWidth = Math.max(2, r * 0.04); x.strokeStyle = '#3b2a80'; x.stroke();
      x.beginPath(); x.arc(0, 0, r * 0.06, 0, Math.PI * 2); x.fillStyle = '#3b2a80'; x.fill(); x.restore(); }
    /* 鼻子:十字交點往前下方凸出 */
    n2 = [c[0] + fw[0] * r, c[1] + fw[1] * r]; nt = [c[0] + (fw[0] * 1.22 - up[0] * 0.28) * r, c[1] + (fw[1] * 1.22 - up[1] * 0.28) * r];
    if(fw[2] > -0.15){ x.beginPath(); x.moveTo(n2[0], n2[1]); x.lineTo(nt[0], nt[1]); x.lineWidth = Math.max(3, W * 0.009 * ZM); x.strokeStyle = '#3b2a80'; x.lineCap = 'round'; x.stroke();
      x.beginPath(); x.arc(n2[0], n2[1], Math.max(2.5, r * 0.07), 0, Math.PI * 2); x.fillStyle = '#d6336c'; x.fill(); }
    x.globalAlpha = 1; } });
  items.sort(function(p, q){ return p.z - q.z; });
  x.save(); x.lineJoin = 'round'; for(i = 0; i < items.length; i++) items[i].f(); x.restore();
  /* 可拖的關節把手(只有 🦴 分頁開著時) */
  if(edit){ var E = S.ed, hr = Math.min(W * 0.045, Math.max(W * 0.024, 15 / (E.k || 1)));
    x.save();
    for(k in V){ if(!V.hasOwnProperty(k)) continue; it = V[k]; dep = shade(it[2]);
      x.globalAlpha = Math.max(0.6, dep); x.lineWidth = Math.max(3, hr * 0.28); x.strokeStyle = '#ffffff';
      x.fillStyle = E.pj === k ? '#ffd23f' : (k === 'p' ? '#7a5cd6' : col(k));
      if(k === 'p'){ x.beginPath(); x.rect(it[0] - hr * 1.15, it[1] - hr * 1.15, hr * 2.3, hr * 2.3); x.fill(); x.stroke();
        x.fillStyle = '#fff'; x.font = 'bold ' + Math.round(hr * 1.4) + 'px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('✥', it[0], it[1] + 1); }
      else if(k === 'h'){ it = pzHandleAt(V, 'h', R); x.beginPath(); x.arc(it[0], it[1], hr * 0.7, 0, Math.PI * 2); x.lineWidth = Math.max(3, hr * 0.22); x.strokeStyle = E.pj === k ? '#ffd23f' : '#7a5cd6'; x.stroke(); }   /* 頭:空心圈,不蓋住十字線 */
      else if(k === 'fc'){ x.beginPath(); x.arc(it[0], it[1], hr * 0.62, 0, Math.PI * 2); x.fillStyle = E.pj === k ? '#ffd23f' : '#d6336c'; x.globalAlpha = it[2] >= V.h[2] ? 1 : 0.45; x.fill(); x.stroke(); }   /* 臉方向點(轉頭) */
      else { x.beginPath(); x.arc(it[0], it[1], k.charAt(0) === 's' ? hr * 0.75 : hr, 0, Math.PI * 2); x.fill(); x.stroke(); } }
    x.restore(); }
}
/* 把手位置:頭的把手放在頭頂(拖它 = 脖子彎、歪頭點頭),其餘就在關節上;臉方向點 fc 在鼻樑(拖它 = 轉頭) */
function pzHandleAt(V, k, R){ if(k !== 'h') return V[k]; var u = v3sub(V.h, V.n), l = v3len(u) || 1; return [V.h[0] + u[0] / l * R * 0.95, V.h[1] + u[1] / l * R * 0.95, V.h[2] + u[2] / l * R * 0.95]; }
function pzHit(g, px, py){ var V = pzAll(g), E = S.ed, best = null, bd = 1e9, k, d, hp, R = pzHeadR(E.d.W) * (g.zm > 0 ? g.zm : 1), lim = Math.min(E.d.W * 0.11, Math.max(E.d.W * 0.05, 30 / (E.k || 1)));
  for(k in V){ if(!V.hasOwnProperty(k)) continue; hp = pzHandleAt(V, k, R); d = Math.sqrt(Math.pow(hp[0] - px, 2) + Math.pow(hp[1] - py, 2)) - (k === 'p' ? 4 : 0) - (k === 'fc' ? 3 : 0); if(d < bd){ bd = d; best = k; } }
  return bd <= lim ? best : null; }
/* 骨架自己的復原/重做(不存檔,最多 30 步;有新動作就清掉重做) */
function pzPush(s){ var E = S.ed; E.pzU = E.pzU || []; E.pzU.push(s); if(E.pzU.length > 30) E.pzU.shift(); E.pzR = []; }
function pzSnap(){ var E = S.ed, g = E.d.guide; if(!g || g.t !== 'pose') return; pzPush(JSON.stringify(g)); }
function pzApply(g, o){ g.j = o.j; g.yw = o.yw || 0; g.pt = o.pt || 0; g.zm = o.zm > 0 ? o.zm : 1; if(o.id) g.id = o.id; }
/* ★ 13:19 我的姿勢:玩家自己存、自己命名;存在這台平板(依帳號分開),登入時另備份到雲端 designDrafts/{uid}/_poses.json(「☁ 從雲端找回」會一起找回) */
function pzMineKey(){ return 'dsg_poses_' + (S.guest ? 'guest' : S.uid); }
function pzMine(){ var a; try{ a = JSON.parse(lsGet(pzMineKey()) || '[]'); }catch(e){ a = []; } return a && a.push ? a : []; }
function pzMineSet(a, cloud){ lsSet(pzMineKey(), JSON.stringify(a)); if(cloud && csNow() && S.cs.setCheck()) S.cs.sync(true); }   /* ★ v1.0.7 我的姿勢改成「設定」一起自動同步(_sync.json),不再單獨傳 _poses.json */
function pzMineMerge(list){ var a = pzMine(), i, j, hit; if(!list || !list.push) return 0; var add = 0;
  for(i = 0; i < list.length; i++){ if(!list[i] || !list[i].n || !list[i].j) continue; hit = -1; for(j = 0; j < a.length; j++){ if(a[j].n === list[i].n) hit = j; }
    if(hit < 0){ a.push(list[i]); add++; } else if((list[i].at || 0) > (a[hit].at || 0)) a[hit] = list[i]; }
  while(a.length > D.POSE_MINE_MAX) a.shift(); pzMineSet(a, false); return add; }
function pzBind(){
  var E = S.ed, cv = $('dsg-guide'), st = $('dsg-stage'), g0 = null;
  if(!cv) return;
  function pt(e){ var rc = st.getBoundingClientRect(); return { x: (e.clientX - rc.left) / E.k, y: (e.clientY - rc.top) / E.k }; }
  cv.onpointerdown = function(e){ var g = E.d.guide, p, k;
    if(!pzEditing() || g0) return; e.preventDefault(); e.stopPropagation(); p = pt(e); pzEnsure(g, E.d.W, E.d.H); k = pzHit(g, p.x, p.y);
    g0 = { pid: e.pointerId, k: k, x: p.x, y: p.y, yw: g.yw, pt: g.pt, moved: false, sn: JSON.stringify(g) };
    if(k){ g0.ox = pzAll(g)[k][0] - p.x; g0.oy = pzAll(g)[k][1] - p.y; if(E.pj !== k){ E.pj = k; libPaint(); } sfx('sfx-sel', 0.25); }
    try{ cv.setPointerCapture(e.pointerId); }catch(x){}
    guideDraw(); };
  cv.onpointermove = function(e){ var g = E.d.guide, p;
    if(!g0 || e.pointerId !== g0.pid) return; e.preventDefault(); p = pt(e);
    if(!g0.moved){ if(Math.abs(p.x - g0.x) + Math.abs(p.y - g0.y) < 3) return; g0.moved = true; pzPush(g0.sn); }
    if(g0.k) pzDragTo(g, g0.k, p.x + g0.ox, p.y + g0.oy);
    else { g.yw = Math.round((g0.yw + (p.x - g0.x) * 0.6) % 360); if(g.yw > 180) g.yw -= 360; if(g.yw < -180) g.yw += 360; g.pt = Math.round(clamp(g0.pt - (p.y - g0.y) * 0.35, -70, 70)); }
    guideDraw(); };
  cv.onpointerup = cv.onpointercancel = function(e){
    if(!g0 || e.pointerId !== g0.pid) return; var mv = g0.moved, wasView = !g0.k; g0 = null; if(mv){ dirty(); if(wasView) libPaint(); } };   /* 轉完視角:左欄視角按鈕與角度讀數跟著更新 */
  /* ★ v1.0.6 第二根手指放下(要捏合縮放)⇒ 剛剛這一下拖關節/轉視角收回,姿勢回到按下前 */
  E.pzCancel = function(){ if(!g0) return; var g = E.d.guide, sn = g0.sn, mv = g0.moved; g0 = null;
    if(mv && g){ try{ pzApply(g, JSON.parse(sn)); }catch(x){} if(E.pzU && E.pzU.length) E.pzU.pop(); }
    guideDraw(); };
}
function pzViewTxt(){ var g = S.ed.d.guide; if(!g || g.t !== 'pose') return ''; return '↔ ' + Math.round(g.yw || 0) + '°  ↕ ' + Math.round(-(g.pt || 0)) + '°  🔍 ' + Math.round((g.zm || 1) * 100) + '%'; }
/* 🦴 分頁的按鈕:data-pz = 視角 v:id、mirror、big、small、flip、undo、reset */
function pzCmd(c){
  var E = S.ed, g = E.d.guide, i, msg = '';
  if(!g || g.t !== 'pose'){ E.d.guide = g = { t: 'pose', id: 'stand', on: 1, a: (g && g.a) || 0.35 }; }
  g.on = 1; pzEnsure(g, E.d.W, E.d.H);
  var cur = JSON.stringify(g), o, a, nm, hs, j2;
  if(c === 'undo' || c === 'redo'){ var from = c === 'undo' ? (E.pzU = E.pzU || []) : (E.pzR = E.pzR || []), to = c === 'undo' ? (E.pzR = E.pzR || []) : E.pzU;
    if(!from.length){ toast(c === 'undo' ? '🦴 沒有上一步了' : '🦴 沒有可以重做的'); return; }
    to.push(cur); pzApply(g, JSON.parse(from.pop())); msg = c === 'undo' ? '↶ 復原' : '↷ 重做'; }
  else if(c === 'save'){   /* 💾 存成我的姿勢 */
    hs = $('dsg-pzn'); nm = String((hs && hs.value) || E.pzName || '').replace(/^\s+|\s+$/g, '');
    if(!nm){ toast(T({ c: '先幫這個姿勢取個名字', p: '請輸入姿勢名稱' })); if(hs) hs.focus(); return; }
    if(nm.length > 10){ toast('名字最多 10 個字'); return; }
    if(wordHits(nm).length){ toast('⚠ 這個名字有不適合的字詞,請換一個'); return; }
    a = pzMine(); j2 = -1; for(i = 0; i < a.length; i++){ if(a[i].n === nm) j2 = i; }
    if(j2 < 0 && a.length >= D.POSE_MINE_MAX){ toast('我的姿勢最多存 ' + D.POSE_MINE_MAX + ' 個,先刪掉不要的'); return; }
    o = { n: nm, j: JSON.parse(JSON.stringify(g.j)), yw: g.yw, pt: g.pt, zm: g.zm, at: now() };
    if(j2 >= 0) a[j2] = o; else a.push(o);
    pzMineSet(a, true); E.pzName = ''; sfx('sfx-sel', 0.3); libPaint(); toast(j2 >= 0 ? '💾 「' + nm + '」更新好了' : '💾 存好了:「' + nm + '」'); return; }
  else if(c.indexOf('ld:') === 0 || c.indexOf('del:') === 0){
    a = pzMine(); i = +c.split(':')[1]; if(!a[i]) return;
    if(c.indexOf('del:') === 0){ nm = a[i].n; confirmBox('刪掉姿勢「' + esc(nm) + '」?', function(ok){ if(!ok) return; var b2 = pzMine(), q; for(q = 0; q < b2.length; q++){ if(b2[q].n === nm){ b2.splice(q, 1); break; } } pzMineSet(b2, true); libPaint(); toast('🗑 刪掉了'); }, '刪掉'); return; }
    pzPush(cur); pzApply(g, a[i]); msg = '📂 換成「' + a[i].n + '」'; }
  else { pzPush(cur);
    if(c.indexOf('v:') === 0){ for(i = 0; i < D.POSE_VIEWS.length; i++){ if(D.POSE_VIEWS[i].id === c.slice(2)){ g.yw = D.POSE_VIEWS[i].y; g.pt = D.POSE_VIEWS[i].p; } } }
    else if(c === 'mirror'){ pzMirror(g); msg = '🪞 左右換過來了'; }
    else if(c === 'zin' || c === 'zout'){ var z0 = g.zm || 1, z1 = Math.round(clamp(c === 'zin' ? z0 * 1.15 : z0 / 1.15, 0.5, 2.5) * 100) / 100;
      if(z1 === z0){ E.pzU.pop(); toast(c === 'zin' ? '已經最近了' : '已經最遠了'); return; } g.zm = z1; }
    else if(c === 'fwd' || c === 'back'){ if(!E.pj){ E.pzU.pop(); toast(T({ c: '先點一個圓點(手、手肘、膝蓋、腳、頭、脊椎…),再按向前/向後', p: '請先選取關節,再調整前後' })); return; }
      if(!pzNudge(g, E.pj, c === 'fwd')){ E.pzU.pop(); toast(c === 'fwd' ? '這一節已經正對著你了' : '這一節已經背對著你了'); return; } }
    else if(c === 'reset'){ g.j = pzFrom(g.id || 'stand', E.d.W, E.d.H); g.yw = 0; g.pt = 0; g.zm = 1; msg = '↺ 回到範本的樣子'; }
  }
  sfx('sfx-sel', 0.3); guideDraw(); libPaint(); dirty(); if(msg) toast(msg);
}
/* ★ v1.0.3 描圖參考層 #dsg-guide(在畫筆層下面、pointer-events:none;renderComposite 不會畫它 ⇒ 不進作品、不進縮圖、不進審核) */
function guideDraw(){
  var E = S.ed, cv = $('dsg-guide'), g, x, W, H, P, i, j, k, b, im;
  if(!E || !cv) return;
  x = cv.getContext('2d'); W = cv.width; H = cv.height; x.clearRect(0, 0, W, H);
  g = E.d.guide; if(!g || !g.on) return;
  cv.style.opacity = String(pzEditing() ? 0.92 : (g.a || 0.35));
  if(g.t === 'pose'){ pzEnsure(g, W, H); pzDraw(x, g, W, H, pzEditing()); return; }   /* ★ v1.0.5 3D 關節人偶 */
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
    /* ★ v1.0.5 3D 關節人偶:範本只是起手式,關節可以拖、視角可以轉 */
    h += '<div class="dsg-sec">🦴 3D 動作骨架</div><div style="font-size:1.8vmin;opacity:.9;margin-bottom:.8vmin">' + esc(T({ c: '拖圓點彎手腳和頭,拖中間的 ✥ 方塊移動整個人,拖空白的地方把人偶轉一圈看。擺好了按「🖌 開始畫」照著畫;骨架不會出現在作品裡。', p: '拖曳圓點調整關節、拖曳 ✥ 移動人偶、拖曳空白處旋轉 3D 視角;完成後按「開始畫」描繪。骨架不會納入作品。' })) + '</div>';
    h += '<div class="dsg-sec">① ' + esc(T({ c: '先選一個起手姿勢', p: '起手範本' })) + '</div><div class="dsg-chips">';
    for(i = 0; i < D.POSES.length; i++) h += '<button data-gp="' + D.POSES[i].id + '"' + (gp && gp.on && gp.id === D.POSES[i].id ? ' class="on"' : '') + '>' + D.POSES[i].e + '<span class="lb"> ' + esc(D.POSES[i].n) + '</span></button>';
    h += '<button data-gp=""' + (!gp || !gp.on ? ' class="on"' : '') + '>🙈<span class="lb"> 不顯示</span></button></div>';
    if(gp && gp.on && !locked()){
      h += '<div class="dsg-sec">② ' + esc(T({ c: '轉個角度看', p: '視角' })) + '</div><div class="dsg-chips dsg-pzrow">';
      for(i = 0; i < D.POSE_VIEWS.length; i++) h += '<button data-pz="v:' + D.POSE_VIEWS[i].id + '"' + (Math.round(gp.yw || 0) === D.POSE_VIEWS[i].y && Math.round(gp.pt || 0) === D.POSE_VIEWS[i].p ? ' class="on"' : '') + '>' + D.POSE_VIEWS[i].e + '<span class="lb"> ' + esc(D.POSE_VIEWS[i].n) + '</span></button>';
      h += '</div><div class="dsg-pzv" id="dsg-pzv">' + esc(pzViewTxt()) + '</div>';
      /* ★ 13:20 老師「骨架調整視窗新增 復原、向前、向後、拉近、拉遠 等基礎功能鍵」 */
      var pjOk = !!E.pj, pjN = pjOk ? (D.POSE_JN[E.pj] || E.pj) : '';
      h += '<div class="dsg-sec">③ ' + esc(T({ c: '調整人偶', p: '調整' })) + (pjOk ? ' <small style="opacity:.85">— 選到:' + esc(pjN) + '</small>' : '') + '</div><div class="dsg-chips dsg-pzrow">';
      h += '<button data-pz="undo">↶<span class="lb"> 復原</span></button><button data-pz="redo">↷<span class="lb"> 重做</span></button>';
      h += '<button data-pz="fwd"' + (pjOk ? '' : ' style="opacity:.5"') + '>⏫<span class="lb"> 向前</span></button><button data-pz="back"' + (pjOk ? '' : ' style="opacity:.5"') + '>⏬<span class="lb"> 向後</span></button>';
      h += '<button data-pz="zin">🔍<span class="lb"> 拉近</span></button><button data-pz="zout">🔭<span class="lb"> 拉遠</span></button>';
      h += '<button data-pz="mirror">🪞<span class="lb"> 左右相反</span></button><button data-pz="reset">↺<span class="lb"> 回到範本</span></button></div>';
      h += '<div class="dsg-tip">' + esc(T({ c: '💡 點一個圓點選好關節,按「⏫ 向前 / ⏬ 向後」它就往你這邊或往後轉一點(選 ✥ 是整個人前傾/後仰)。頭頂的圈 = 歪頭點頭,鼻子的紅點 = 轉頭;頭上的十字線交叉的地方就是臉的正中間。', p: '選取關節後以「向前/向後」調整前後角度(選取 ✥ 為全身前傾/後仰);頭頂圈調整頸部,鼻樑紅點調整面向;十字線交點即臉部中心。' })) + '</div>';
      /* ★ 13:19/13:24 老師「玩家可以自己儲存調整好的姿勢並命名」 */
      var mine = pzMine();
      h += '<div class="dsg-sec">④ ' + esc(T({ c: '我的姿勢', p: '我的姿勢庫' })) + ' <small style="opacity:.75">(' + mine.length + '/' + D.POSE_MINE_MAX + ')</small></div>';
      h += '<div style="display:flex;gap:.8vmin;align-items:center"><input type="text" id="dsg-pzn" maxlength="10" placeholder="' + esc(T({ c: '幫姿勢取名字', p: '姿勢名稱' })) + '" value="' + esc(E.pzName || '') + '" style="flex:1;min-width:0;font-size:2vmin;padding:.8vmin;border-radius:1vmin;border:0"><button class="dsg-b go" data-pz="save" style="white-space:nowrap">💾<span class="lb"> 儲存</span></button></div>';
      if(mine.length){ h += '<div class="dsg-chips dsg-pzrow" style="margin-top:.6vmin">'; for(i = 0; i < mine.length; i++) h += '<span style="display:inline-flex;gap:.3vmin"><button data-pz="ld:' + i + '">📂 ' + esc(mine[i].n) + '</button><button data-pz="del:' + i + '" title="刪掉" style="flex:0 0 auto">🗑</button></span>'; h += '</div>'; }
      else h += '<div class="dsg-pzv">' + esc(T({ c: '擺好喜歡的姿勢,取個名字按 💾,下次就能一鍵叫出來。', p: '儲存命名後可隨時載入。' })) + '</div>';
    }
    h += '<div style="font-size:1.8vmin;display:flex;gap:1vmin;align-items:center;margin-top:1vmin">👁 ' + esc(T({ c: '畫畫時的濃淡', p: '描繪時濃淡' })) + ' <input type="range" min="10" max="80" value="' + Math.round(((E.d.guide && E.d.guide.a) || 0.35) * 100) + '" id="dsg-ga" style="flex:1"></div>';
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
  var pzn = $('dsg-pzn'); if(pzn) pzn.onkeydown = function(ev){ if(ev.keyCode === 13){ ev.preventDefault(); pzCmd('save'); } };   /* 姿勢名稱按 Enter = 儲存 */
  el.oninput = function(ev){ var t = ev.target, sid = t.getAttribute('data-th');
    if(t.id === 'dsg-ga'){ if(E.d.guide){ E.d.guide.a = (+t.value) / 100; guideDraw(); dirty(); } return; }   /* ★ v1.0.3 參考濃淡 */
    if(t.id === 'dsg-pzn'){ E.pzName = t.value; return; }   /* 我的姿勢名稱(重畫面板不會不見) */
    if(sid){ if(!E._tintOp){ beginOp(); E._tintOp = 1; } E.d.tint[sid] = [+t.value, 1]; layersPaint(); }
    if(t.id === 'dsg-bw'){ E.brush.w = +t.value; $('dsg-bwv').textContent = t.value; }
    if(t.id === 'dsg-bo'){ E.brush.op = (+t.value) / 100; $('dsg-bov').textContent = t.value + '%'; }   /* ★ v1.1.0 筆刷透明度 */
    if(t.id === 'dsg-tol'){ E.tol = +t.value; $('dsg-tolv').textContent = t.value + '%'; }   /* ★ v1.1.0 油漆桶臨界值 */
    if(t.id === 'dsg-pcol'){ E.brush.c = t.value; E.brush.er = false; if(E.px.tool === 'er') E.px.tool = 'pen'; }
    if(t.id === 'dsg-vsw'){ E.vec.sw = +t.value; $('dsg-vswv').textContent = t.value; }
    if(t.id === 'dsg-tx'){ var hs = wordHits(t.value); $('dsg-txm').textContent = hs.length ? '⚠ 這段文字有不適合的字詞,請換別的說法' : ''; } };
  el.onchange = function(ev){ if(ev.target.getAttribute('data-th') && E._tintOp){ E._tintOp = 0; endOp(true); } };   /* ★ v1.0.2 人物部件換色 = 變色,算一次(拉回原色不算) */
}
function swatches(cur, attr){ var h = '<div>', i; for(i = 0; i < D.PAINT_COLORS.length; i++) h += '<span class="dsg-sw' + (cur === D.PAINT_COLORS[i] ? ' on' : '') + '" ' + attr + '="' + D.PAINT_COLORS[i] + '" style="background:' + D.PAINT_COLORS[i] + '"></span>'; return h + '</div>'; }
function pmPanel(){
  var E = S.ed, h = '', i, sh = [['rect', '⬛', '方形'], ['ellipse', '⚪', '圓形'], ['tri', '🔺', '三角形'], ['star', '⭐', '星星'], ['heart', '❤️', '愛心'], ['line', '➖', '直線']], ns = [16, 24, 32, 48, 64];
  var PKon = !!window.MGPK, bt = E.brush.t, k2;
  if(E.pm === 'free'){
    /* ★ v1.1.0 老師 18:26:自由手繪畫筆 鉛筆、水彩、蠟筆、毛筆、圓頭麥克筆、平頭麥克筆、向量筆 + 橡皮擦、油漆桶、剪刀、變形;顏色在右邊常駐選色器 */
    h += '<div class="dsg-sec">✍️ <span class="lb">畫筆</span></div><div class="dsg-brs">';
    for(i = 0; i < BR_ORDER.length; i++){ k2 = BR_ORDER[i]; h += '<button data-br="' + k2 + '"' + (bt === k2 ? ' class="on"' : '') + '><b>' + BRUSH[k2].e + '</b><span class="lb">' + BRUSH[k2].n + '</span></button>'; }
    h += '<button data-br="eraser"' + (bt === 'eraser' ? ' class="on"' : '') + '><b>🧽</b><span class="lb">橡皮擦</span></button>';
    if(PKon) h += '<button data-br="bucket"' + (bt === 'bucket' ? ' class="on"' : '') + '><b>🪣</b><span class="lb">油漆桶</span></button><button data-br="lasso"' + (bt === 'lasso' ? ' class="on"' : '') + '><b>✂️</b><span class="lb">剪刀</span></button><button data-xf="1"><b>⤡</b><span class="lb">變形</span></button>';
    h += '</div>';
    if(bt === 'bucket') h += '<label style="display:block;margin-top:1vmin">🪣 <span class="lb">臨界值(越大填越多)</span> <b id="dsg-tolv">' + E.tol + '%</b></label><input type="range" min="0" max="100" value="' + E.tol + '" id="dsg-tol" style="width:100%">';
    else if(bt !== 'lasso') h += '<label style="display:block;margin-top:1vmin">📏 <span class="lb">粗細</span> <b id="dsg-bwv">' + E.brush.w + '</b></label><input type="range" min="2" max="60" value="' + E.brush.w + '" id="dsg-bw" style="width:100%">';
    if(bt !== 'eraser' && bt !== 'lasso') h += '<label style="display:block;margin-top:.6vmin">🔅 <span class="lb">透明度</span> <b id="dsg-bov">' + Math.round((E.brush.op || 1) * 100) + '%</b></label><input type="range" min="10" max="100" value="' + Math.round((E.brush.op || 1) * 100) + '" id="dsg-bo" style="width:100%">';
    h += '<div class="dsg-chips" style="margin-top:1vmin"><button data-pclr="1">🗑<span class="lb"> 清掉這個圖層</span></button></div>';
    h += '<div class="dsg-tip">' + esc(T({ c: '📐 畫完一筆,筆先不要拿起來停 2 秒,會變成工整的直線、圓、三角形、長方形(向量形狀)。', p: '📐 筆畫結束停留 2 秒即自動轉為向量幾何形狀。' })) + '</div>';
  } else if(E.pm === 'pixel'){
    h += '<div class="dsg-sec">👾 <span class="lb">像素點陣(格子對齊)</span></div>';
    h += '<div class="dsg-sec"><span class="lb">格子數(橫向)</span></div><div class="dsg-chips">'; for(i = 0; i < ns.length; i++) h += '<button data-pxn="' + ns[i] + '"' + (E.px.n === ns[i] ? ' class="on"' : '') + '>' + ns[i] + '</button>'; h += '</div>';
    h += '<div class="dsg-chips" style="margin-top:1vmin"><button data-pxt="pen"' + (E.px.tool === 'pen' ? ' class="on"' : '') + '>✏️<span class="lb"> 點格子</span></button><button data-pxt="fill"' + (E.px.tool === 'fill' ? ' class="on"' : '') + '>🪣<span class="lb"> 油漆桶</span></button><button data-pxt="er"' + (E.px.tool === 'er' ? ' class="on"' : '') + '>🧽<span class="lb"> 擦掉</span></button>' + (PKon ? '<button data-xf="1">⤡<span class="lb"> 變形</span></button>' : '') + '<button data-pclr="1">🗑<span class="lb"> 清掉這個圖層</span></button></div>';
    h += '<div class="dsg-tip">' + esc(T({ c: '顏色在右邊的選色器選。', p: '顏色請於右側選色器選取。' })) + '</div>';
  } else {
    h += '<div class="dsg-sec">🔷 <span class="lb">向量繪圖:在畫面上拖曳畫出形狀</span></div><div class="dsg-chips">'; for(i = 0; i < sh.length; i++) h += '<button data-vsh="' + sh[i][0] + '"' + (E.vec.sh === sh[i][0] ? ' class="on"' : '') + '>' + sh[i][1] + '<span class="lb"> ' + sh[i][2] + '</span></button>'; h += '</div>';
    h += '<div class="dsg-sec">🎨 <span class="lb">填色</span></div>' + swatches(E.vec.fill, 'data-vf') + '<div class="dsg-chips"><button data-vf="none"' + (E.vec.fill === 'none' ? ' class="on"' : '') + '>🚫<span class="lb"> 不填色</span></button>' + (PKon ? '<button data-vpop="f">🎨<span class="lb"> 其他顏色</span></button>' : '') + '</div>';
    h += '<div class="dsg-sec">🖊 <span class="lb">外框</span></div>' + swatches(E.vec.st, 'data-vs') + (PKon ? '<div class="dsg-chips"><button data-vpop="s">🎨<span class="lb"> 其他顏色</span></button></div>' : '');
    h += '<label style="display:block;margin-top:1vmin">📏 <span class="lb">外框粗細</span> <b id="dsg-vswv">' + E.vec.sw + '</b></label><input type="range" min="0" max="30" value="' + E.vec.sw + '" id="dsg-vsw" style="width:100%">';
    h += '<div class="dsg-tip">畫好的形狀可以像其他素材一樣點選、移動、縮放、旋轉;選到後右邊可以改顏色。形狀都放在「🔷 物件層」。</div>';
  }
  h += '<div class="dsg-tip">⚠ 不要在圖上寫說明文字或名字;要寫字請用「🔤 文字貼片」。</div>';
  return h;
}
function libClick(ev){
  var E = S.ed, t = ev.target, a = null, v;
  if(locked()) return;
  /* ★ v1.0.3 描圖參考:🦴 骨架(data-gp)/🖼 參考圖片(data-gr)/🖌 開始畫(data-tab2)/參考組收合(summary)。只改 d.guide,不記復原、不算操作次數 */
  var g0 = t, gk = null, gv = null;
  while(g0 && g0 !== this && !gk){ if(g0.getAttribute){ if(g0.hasAttribute('data-pz')){ gk = 'pz'; gv = g0.getAttribute('data-pz'); } else if(g0.hasAttribute('data-gp')){ gk = 'gp'; gv = g0.getAttribute('data-gp'); } else if(g0.hasAttribute('data-gr')){ gk = 'gr'; gv = g0.getAttribute('data-gr'); } else if(g0.hasAttribute('data-tab2')){ gk = 'tab'; gv = g0.getAttribute('data-tab2'); } else if(g0.tagName === 'SUMMARY'){ gk = 'sum'; gv = g0.parentNode.getAttribute('data-rg'); } } g0 = g0.parentNode; }
  if(gk === 'pz'){ pzCmd(gv); return; }   /* ★ v1.0.5 3D 骨架按鈕 */
  if(gk === 'sum'){ setTimeout(function(){ var dd = $('dsg-lib') && $('dsg-lib').querySelector('details[data-rg="' + gv + '"]'); E.refOpen = dd && dd.open ? gv : (E.refOpen === gv ? null : E.refOpen); }, 0); return; }
  if(gk === 'tab'){ sfx('sfx-sel', 0.3); E.tab = gv; pmApply(); tabsPaint(); libPaint(); return; }
  if(gk === 'gp' || gk === 'gr'){ sfx('sfx-sel', 0.3); var oa = (E.d.guide && E.d.guide.a) || 0.35, og = E.d.guide && E.d.guide.t === 'pose' ? E.d.guide : null;
    if(gk === 'gp' && og) pzSnap();   /* ★ v1.0.5 換範本前記一步,按「↶ 骨架上一步」可以回來 */
    E.d.guide = gv ? (gk === 'gp' ? { t: 'pose', id: gv, on: 1, a: oa, j: pzFrom(gv, E.d.W, E.d.H), yw: og ? (og.yw || 0) : 0, pt: og ? (og.pt || 0) : 0 } : { t: 'ref', src: gv, on: 1, a: oa }) : null;
    E.pj = null; pmApply(); libPaint(); dirty(); if(gv) toast(gk === 'gp' ? T({ c: '🦴 人偶擺好了!拖圓點彎手腳,拖空白處轉一圈看', p: '🦴 已載入範本:拖曳關節調整姿勢,拖曳空白處旋轉視角' }) : '🖼 參考圖片放在畫布下面了,看著它自己畫出來吧!'); return; }
  while(t && t !== this){ if(t.getAttribute && !a){ if(t.getAttribute('data-add')) a = ['add', t.getAttribute('data-add')]; else if(t.getAttribute('data-slot')) a = ['slot', t.getAttribute('data-slot'), t.getAttribute('data-f')];
      else if(t.getAttribute('data-bt')) a = ['bt', t.getAttribute('data-bt')]; else if(t.getAttribute('data-tk')) a = ['tk', t.getAttribute('data-tk')]; else if(t.getAttribute('data-font')) a = ['font', t.getAttribute('data-font')];
      else if(t.getAttribute('data-addtext')) a = ['text']; else if(t.getAttribute('data-pc')) a = ['pc', t.getAttribute('data-pc')]; else if(t.getAttribute('data-pe')) a = ['pe', t.getAttribute('data-pe')]; else if(t.getAttribute('data-pclr')) a = ['pclr'];
      else if(t.getAttribute('data-pb')) a = ['pb', t.getAttribute('data-pb')];
      else if(t.getAttribute('data-br')) a = ['br', t.getAttribute('data-br')]; else if(t.getAttribute('data-xf')) a = ['xf']; else if(t.getAttribute('data-vpop')) a = ['vpop', t.getAttribute('data-vpop')];
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
  else if(a[0] === 'pc'){ colorSet(a[1], false, true); libPaint(); }
  else if(a[0] === 'vpop'){ var vk = a[1]; window.MGPK.wheelPop(vk === 'f' ? (E.vec.fill !== 'none' ? E.vec.fill : '#ffd23f') : E.vec.st, function(hx){ if(vk === 'f') E.vec.fill = hx; else E.vec.st = hx;
      if(E.sel >= 0 && E.d.items[E.sel] && E.d.items[E.sel].t === 'shape'){ beginOp(); if(vk === 'f') E.d.items[E.sel].fill = hx; else E.d.items[E.sel].st = hx; endOp(true); layersPaint(); } libPaint(); }, vk === 'f' ? '🎨 形狀填色' : '🖊 外框顏色'); }
  else if(a[0] === 'pm'){ E.pm = a[1]; lsSet('dsg_pm', a[1]); E.sel = -1; pmApply(); libPaint(); propPaint(); selPaint(); }
  else if(a[0] === 'pxn'){ E.px.n = +a[1]; lsSet('dsg_pxn', a[1]); gridDraw(); libPaint(); }
  else if(a[0] === 'pxt'){ E.px.tool = a[1]; libPaint(); }
  else if(a[0] === 'pb'){ beginOp(); E.d.pb = a[1] === '1'; endOp(); pmApply(); libPaint(); }
  else if(a[0] === 'vsh'){ E.vec.sh = a[1]; libPaint(); }
  else if(a[0] === 'vf' || a[0] === 'vs'){ if(a[0] === 'vf') E.vec.fill = a[1]; else E.vec.st = a[1];
    if(E.sel >= 0 && E.d.items[E.sel] && E.d.items[E.sel].t === 'shape'){ beginOp(); if(a[0] === 'vf') E.d.items[E.sel].fill = a[1]; else E.d.items[E.sel].st = a[1]; endOp(true); layersPaint(); }   /* ★ v1.0.2 形狀填色/外框色 = 變色 */
    libPaint(); }
  else if(a[0] === 'pe'){ E.brush.er = a[1] === '1'; libPaint(); }
  else if(a[0] === 'pclr'){ var cl = lyGet(E.al); if(!cl || cl.k !== 'p'){ toast('先在右邊選一個一般圖層'); return; } confirmBox('清掉「' + esc(cl.n) + '」畫的東西?(可以按 ↶ 復原)', function(ok){ if(!ok) return; var cv = plCv(cl.id); if(!cv) return; beginOp(); cv.getContext('2d').clearRect(0, 0, cv.width, cv.height); plSave(cv); endOp(); }); }   /* ★ v1.1.0 只清目前選的圖層 */
  else if(a[0] === 'br'){ E.brush.t = a[1]; if(BRUSH[a[1]]){ E.lastBr = a[1]; lsSet('dsg_br', a[1]); } E.brush.er = a[1] === 'eraser'; if(a[1] !== 'bucket') tolClose(); libPaint();
    if(a[1] === 'lasso') toast(T({ c: '✂️ 把要剪下來的地方圈起來', p: '✂️ 圈選要剪下的範圍' })); else if(a[1] === 'bucket') toast(T({ c: '🪣 點一下要填色的地方,或把右邊的顏色拖進線條圍起來的地方', p: '🪣 點擊填色,或將右側色票拖曳至封閉區域' })); }
  else if(a[0] === 'xf'){ xformStart(); }
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
function shapePath(sh, w, h, pts){ var i, a, r, p = [], f = function(n){ return Math.round(n * 10) / 10; };
  /* ★ v1.1.0 長按變形狀/向量筆:poly = 封閉多邊形、pl = 折線、path = 平滑曲線(向量筆);pts = 物件內的座標 [[x,y],…] */
  if((sh === 'poly' || sh === 'pl') && pts && pts.length){ for(i = 0; i < pts.length; i++) p.push((i ? 'L' : 'M') + f(pts[i][0]) + ' ' + f(pts[i][1])); return p.join('') + (sh === 'poly' ? 'Z' : ''); }
  if(sh === 'path' && pts && pts.length){ p.push('M' + f(pts[0][0]) + ' ' + f(pts[0][1])); if(pts.length < 3){ for(i = 1; i < pts.length; i++) p.push('L' + f(pts[i][0]) + ' ' + f(pts[i][1])); return p.join(''); }
    for(i = 1; i < pts.length - 1; i++) p.push('Q' + f(pts[i][0]) + ' ' + f(pts[i][1]) + ' ' + f((pts[i][0] + pts[i + 1][0]) / 2) + ' ' + f((pts[i][1] + pts[i + 1][1]) / 2));
    p.push('L' + f(pts[pts.length - 1][0]) + ' ' + f(pts[pts.length - 1][1])); return p.join(''); }
  if(sh === 'rect') return 'M0 0H' + f(w) + 'V' + f(h) + 'H0Z';
  if(sh === 'ellipse') return 'M0 ' + f(h / 2) + 'A' + f(w / 2) + ' ' + f(h / 2) + ' 0 1 0 ' + f(w) + ' ' + f(h / 2) + 'A' + f(w / 2) + ' ' + f(h / 2) + ' 0 1 0 0 ' + f(h / 2) + 'Z';
  if(sh === 'tri') return 'M' + f(w / 2) + ' 0L' + f(w) + ' ' + f(h) + 'L0 ' + f(h) + 'Z';
  if(sh === 'line') return 'M0 ' + f(h / 2) + 'L' + f(w) + ' ' + f(h / 2);
  if(sh === 'heart') return 'M' + f(w / 2) + ' ' + f(h) + 'C' + f(-w * 0.1) + ' ' + f(h * 0.55) + ' ' + f(w * 0.05) + ' ' + f(-h * 0.1) + ' ' + f(w / 2) + ' ' + f(h * 0.25) + 'C' + f(w * 0.95) + ' ' + f(-h * 0.1) + ' ' + f(w * 1.1) + ' ' + f(h * 0.55) + ' ' + f(w / 2) + ' ' + f(h) + 'Z';
  for(i = 0; i < 10; i++){ a = -Math.PI / 2 + i * Math.PI / 5; r = i % 2 ? 0.4 : 1; p.push((i ? 'L' : 'M') + f(w / 2 + Math.cos(a) * r * w / 2) + ' ' + f(h / 2 + Math.sin(a) * r * h / 2)); }
  return p.join('') + 'Z'; }
function shapeOpen(sh){ return sh === 'line' || sh === 'pl' || sh === 'path'; }   /* ★ v1.1.0 不封閉的形狀不填色 */
function shapeSvg(it, i){ var p = (it.sw || 0) / 2 + 2, w = it.w, h = it.h, fl = shapeOpen(it.sh) ? 'none' : (it.fill || 'none');
  return '<svg data-i="' + i + '" width="' + (w + 2 * p) + '" height="' + (h + 2 * p) + '" viewBox="' + (-p) + ' ' + (-p) + ' ' + (w + 2 * p) + ' ' + (h + 2 * p) + '" style="left:' + it.x + 'px;top:' + it.y + 'px;transform:' + itemTf(it) + ';opacity:' + (it.a == null ? 1 : it.a) + '">' +
    '<path d="' + shapePath(it.sh, w, h, it.pts) + '" fill="' + esc(fl) + '" stroke="' + esc(it.sw ? it.st : 'none') + '" stroke-width="' + (it.sw || 0) + '" stroke-linejoin="round" stroke-linecap="round"/></svg>'; }
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
  var E = S.ed, el = $('dsg-pitem'), h = '', it, nm;
  if(!el) return;
  if(E.sel < 0 || !E.d.items[E.sel]){
    /* ★ v1.1.0 老師 18:26「右側小提示和繳交標準變成一個說明視窗收合到右上方『怎麼玩』」 */
    el.innerHTML = '<div class="dsg-tip" style="margin-top:1.4vmin">❓ ' + esc(T({ c: '小提示和繳交標準在右上角「怎麼玩」', p: '操作提示與繳交標準請見右上角「怎麼玩」' })) + '</div>'; el.onclick = null; el.oninput = null; return;
  }
  it = E.d.items[E.sel]; nm = it.t === 'text' ? '🔤 ' + it.txt : it.t === 'shape' ? '🔷 形狀' : (it.src.indexOf('isl:') === 0 ? '🖼 素材' : '🎩 配件');
  h += '<div class="dsg-sec">' + esc(nm) + '</div>';
  h += '<label>大小</label><input type="range" min="5" max="400" value="' + Math.round((it.s || 1) * 100) + '" data-p="s">';
  h += '<label>角度</label><input type="range" min="-180" max="180" value="' + Math.round(it.r || 0) + '" data-p="r">';
  if(it.t === 'img'){ h += '<label>顏色</label><input type="range" min="-180" max="180" step="5" value="' + (it.h || 0) + '" data-p="h">'; h += '<label>亮度</label><input type="range" min="40" max="160" value="' + Math.round((it.b || 1) * 100) + '" data-p="b">'; }
  else if(it.t === 'shape'){ h += '<div style="display:flex;gap:1.4vmin;margin-top:1vmin;align-items:center;flex-wrap:wrap">' + (!shapeOpen(it.sh) ? '填色 <span class="dsg-sw" data-pp="fill" style="background:' + (it.fill && it.fill !== 'none' ? it.fill : '#ffffff') + '"></span>' + (it.fill && it.fill !== 'none' ? '<button class="dsg-b ghost" data-c="nofill" style="font-size:1.7vmin;padding:.4vmin .8vmin">🚫</button>' : '') : '') + ' 外框 <span class="dsg-sw" data-pp="st" style="background:' + (it.st || '#000000') + '"></span></div>';   /* ★ v1.1.0 改用環形選色器 */
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
  el.onclick = function(ev){ var c = ev.target.getAttribute && ev.target.getAttribute('data-c'), pp = ev.target.getAttribute && ev.target.getAttribute('data-pp'), a = E.d.items, i = E.sel, tmp;
    if(pp && !locked() && window.MGPK){ ev.stopPropagation(); var it3 = a[i]; window.MGPK.wheelPop(it3[pp] && it3[pp] !== 'none' ? it3[pp] : '#ffffff', function(hx){ if(!E.d.items[i]) return; beginOp(); E.d.items[i][pp] = hx; endOp(true); layersPaint(); propPaint(); }, pp === 'fill' ? '🎨 填色' : '🖊 外框顏色'); return; }
    if(!c || locked()) return; ev.stopPropagation(); sfx('sfx-tap', 0.3);
    if(c === 'none'){ E.sel = -1; propPaint(); selPaint(); return; }
    if(c === 'nofill'){ beginOp(); a[i].fill = 'none'; endOp(); layersPaint(); propPaint(); return; }
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
  var E = S.ed, st = $('dsg-stage'), cv = null, g = null, ctx = null, PK = window.MGPK;
  function pt(e){ var rc = st.getBoundingClientRect(); return { x: (e.clientX - rc.left) / E.k, y: (e.clientY - rc.top) / E.k }; }
  /* ★ v1.0.6 捏合縮放用:按下時先記「復原的下一步清單」與時間 */
  st.onpointerdown = function(e){
    if(locked() || g) return;
    var rd0 = E.redo.slice(), t0 = now();
    downG(e);
    if(g){ g.rd = rd0; g.t0 = t0; }
  };
  function cap(e){ try{ st.setPointerCapture(e.pointerId); }catch(x){} }
  function endG(){
    var q = g; g = null; if(!q) return;
    if(q.hold) q.hold.stop();
    if(q.m === 'paint') brushEnd(q);
    else if(q.m === 'qs'){ endOp(true); layersPaint(); propPaint(); }
    else if(q.m === 'px'){ plSave(cv); endOp(E.px.tool !== 'er'); }   /* 點格子/填色算增加,擦掉不算 */
    else if(q.m === 'bk') bucketAt(q.p, E.brush.c, E.tol, true);
    else if(q.m === 'lasso'){ E.lassoPts = null; lassoEnd(q.pts); }
    else if(q.m === 'fl') flUp(q);
    else if(q.m === 'vec'){ if(!q.made){ beginOp(); E.d.items.push({ t: 'shape', sh: E.vec.sh, w: 120, h: E.vec.sh === 'line' ? 10 : 120, fill: E.vec.fill, st: E.vec.st, sw: E.vec.sw, x: q.x0, y: q.y0, s: 1, r: 0, fx: 1, a: 1 }); E.sel = E.d.items.length - 1; layersPaint(); }
      endOp(true); propPaint(); }   /* 畫出一個新形狀 = 增加 */
    else if(q.moved){ endOp(); propPaint(); }
  }
  E.gCancel = function(){
    if(!g) return; var q = g; g = null;
    if(q.hold) q.hold.stop();
    if(q.m === 'paint'){ if(now() - q.t0 < 350){ brushAbort(q); E.undo.pop(); E.redo = q.rd || []; E._bk = null; return; } g = q; endG(); return; }   /* 畫了比較久的那一筆:照常收筆保留 */
    if(q.m === 'px'){ if(q.snap && now() - q.t0 < 350){ try{ ctx.putImageData(q.snap, 0, 0); }catch(x){} E.undo.pop(); E.redo = q.rd || []; E._bk = null; return; } g = q; endG(); return; }
    if(q.m === 'qs'){ restore(E.undo.pop()); E.redo = q.rd || []; E._bk = null; return; }
    if(q.m === 'bk' || q.m === 'lasso' || q.m === 'fl'){ E.lassoPts = null; if(E.float) E.float.hot = null; fxDraw(); return; }
    if(q.m === 'vec'){ if(q.made){ restore(E.undo.pop()); E.redo = q.rd || []; E._bk = null; } return; }
    if(q.moved){ restore(E.undo.pop()); E.redo = q.rd || []; E._bk = null; } else selPaint();
  };
  /* ══ ★ v1.1.0 自由手繪的 7 種畫筆(老師 18:26:鉛筆、水彩、蠟筆、毛筆、圓頭麥克筆、平頭麥克筆、向量筆)══
     一筆先畫在「草稿層」#dsg-scr(疊在作用圖層正上方),放開才用筆刷的透明度合進圖層 ⇒ 麥克筆同一筆重疊不會一塊深一塊淺。
     向量筆:放開後把整筆變成平滑的向量曲線物件(放在物件層,可以再點選改顏色、粗細、大小)。
     長按 2 秒(老師:手繪線條長按不放 2 秒自動變成向量直線、圓、幾何):筆停住出現倒數圈 ⇒ 變成工整的向量形狀,手先別放開可以拖一拖調大小。 */
  function brushStart(p, e){
    var b = E.brush, t = b.t, q = { m: 'paint', pid: e.pointerId, t: t, last: { x: p.x, y: p.y }, pts: [{ x: p.x, y: p.y }], w: b.w, c: b.c, pr: e.pressure || 0.5, cw: 0, er: t === 'eraser' };
    if(q.er){ try{ q.snap = ctx.getImageData(0, 0, cv.width, cv.height); }catch(x){} ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(p.x, p.y, b.w / 2, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    else { q.x = scrOn(cv, (BRUSH[t] ? BRUSH[t].a : 1) * (b.op || 1)); bseg(q, p, { x: p.x + 0.01, y: p.y }); }
    if(PK && !q.er) q.hold = PK.holdTimer(2000, 8, function(){ qsFire(q); });
    return q;
  }
  function brushMove(q, e){
    var evs = (e.getCoalescedEvents && e.getCoalescedEvents()) || [e], i, p;
    if(!evs.length) evs = [e];
    for(i = 0; i < evs.length; i++){ p = pt(evs[i]); if(evs[i].pressure) q.pr = evs[i].pressure;
      if(q.er){ ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.lineCap = ctx.lineJoin = 'round'; ctx.lineWidth = q.w; ctx.beginPath(); ctx.moveTo(q.last.x, q.last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); ctx.restore(); }
      else bseg(q, q.last, p);
      q.last = { x: p.x, y: p.y }; if(q.pts.length < 4000) q.pts.push(q.last); }
    if(q.hold){ q.hold.move(q.last.x, q.last.y, 8 / E.k); holdAnim(q); }
  }
  function bseg(q, a, b){
    var X = q.x, t = q.t, w = q.w, dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy), n, i, k, u, x0, y0, r;
    X.fillStyle = X.strokeStyle = q.c; X.lineCap = X.lineJoin = 'round'; X.globalAlpha = 1;
    if(t === 'pencil'){ X.globalAlpha = 0.85; X.lineWidth = Math.max(1, w * 0.4 * (0.6 + 0.8 * q.pr)); X.beginPath(); X.moveTo(a.x, a.y); X.lineTo(b.x, b.y); X.stroke();
      n = Math.ceil(d / 3); for(i = 0; i < n; i++){ if(Math.random() < 0.35){ u = Math.random(); X.globalAlpha = 0.25; X.fillRect(a.x + dx * u + (Math.random() - 0.5) * w * 0.5, a.y + dy * u + (Math.random() - 0.5) * w * 0.5, 1.2, 1.2); } } X.globalAlpha = 1; return; }
    if(t === 'water'){ n = Math.max(1, Math.ceil(d / Math.max(1, w * 0.22))); for(i = 1; i <= n; i++){ u = i / n; x0 = a.x + dx * u; y0 = a.y + dy * u; r = w * 0.6;
        var gr = X.createRadialGradient(x0, y0, 0, x0, y0, r); gr.addColorStop(0, q.c); gr.addColorStop(1, q.c + '00'); X.globalAlpha = 0.14; X.fillStyle = gr; X.beginPath(); X.arc(x0, y0, r, 0, Math.PI * 2); X.fill(); } X.globalAlpha = 1; return; }
    if(t === 'crayon'){ n = Math.max(1, Math.ceil(d / Math.max(1, w * 0.18))); for(i = 1; i <= n; i++){ u = i / n; x0 = a.x + dx * u; y0 = a.y + dy * u;
        for(k = 0; k < 7; k++){ var ang = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * w / 2, s2 = w * (0.08 + Math.random() * 0.12); X.globalAlpha = 0.45 + Math.random() * 0.5; X.fillRect(x0 + Math.cos(ang) * rr - s2 / 2, y0 + Math.sin(ang) * rr - s2 / 2, s2, s2); } } X.globalAlpha = 1; return; }
    if(t === 'ink'){   /* 毛筆:畫得快變細、慢變粗,起筆漸粗 */
      var tw = w * (1.25 - Math.min(1, d / Math.max(4, w * 1.4)) * 0.85) * (0.55 + 0.9 * q.pr); if(!q.cw) q.cw = w * 0.35; var w0 = q.cw; q.cw = q.cw + (tw - q.cw) * 0.35;
      n = Math.max(1, Math.ceil(d / Math.max(0.8, Math.min(w0, q.cw) * 0.25))); for(i = 1; i <= n; i++){ u = i / n; r = Math.max(0.6, (w0 + (q.cw - w0) * u) / 2); X.beginPath(); X.arc(a.x + dx * u, a.y + dy * u, r, 0, Math.PI * 2); X.fill(); } return; }
    if(t === 'mflat'){   /* 平頭麥克筆:斜 45° 的扁筆頭掃過去 */
      var vx = Math.cos(-Math.PI / 4) * w / 2, vy = Math.sin(-Math.PI / 4) * w / 2, h2 = w * 0.12;
      X.beginPath(); X.moveTo(a.x + vx, a.y + vy); X.lineTo(b.x + vx, b.y + vy); X.lineTo(b.x - vx, b.y - vy); X.lineTo(a.x - vx, a.y - vy); X.closePath(); X.fill();
      X.lineWidth = h2; X.lineCap = 'butt'; X.beginPath(); X.moveTo(b.x + vx, b.y + vy); X.lineTo(b.x - vx, b.y - vy); X.stroke(); return; }
    X.lineWidth = t === 'vec' ? Math.max(2, w * 0.6) : w; X.beginPath(); X.moveTo(a.x, a.y); X.lineTo(b.x, b.y); X.stroke();   /* 圓頭麥克筆、向量筆(預覽) */
  }
  function brushAbort(q){ if(q.er){ if(q.snap){ try{ ctx.putImageData(q.snap, 0, 0); }catch(x){} } } else scrOff(); }
  function brushEnd(q){
    if(q.er){ plSave(cv); endOp(false); return; }   /* 橡皮擦不算操作次數 */
    if(q.t === 'vec'){ scrOff(); var it = pathItem(q.pts, q.c, Math.max(2, Math.round(q.w * 0.6))); if(!it){ E.undo.pop(); E.redo = q.rd || []; E._bk = null; return; }
      objPush(it); endOp(true); layersPaint(); propPaint(); return; }
    scrMerge(cv, (BRUSH[q.t] ? BRUSH[q.t].a : 1) * (E.brush.op || 1)); plSave(cv); endOp(true);
  }
  function qsFire(q){
    if(g !== q || q.m !== 'paint') return;
    var sh = PK.recog(q.pts), it;
    if(!sh){ toast(T({ c: '📐 認不出是什麼形狀,再畫清楚一點試試', p: '📐 無法辨識形狀,請再試一次' })); fxDraw(); return; }
    scrOff();
    it = shapeItem(sh, q.c, Math.max(2, Math.round(q.t === 'vec' ? q.w * 0.6 : q.w * (q.t === 'pencil' ? 0.4 : 1))));
    objPush(it); layersPaint();
    q.m = 'qs'; q.qs = { s0: sh, p0: { x: q.last.x, y: q.last.y }, idx: E.sel, c: it.st, w: it.sw };
    sfx('sfx-gentle', 0.4); fxDraw();
    toast(T({ c: '📐 變成向量' + sh.n + '了(放在物件層,之後可以點它改顏色)!手先別放開,拖一拖可以調大小', p: '📐 已轉為向量' + sh.n + '(位於物件層);拖曳可調整大小,放開完成' }));
  }
  function qsAdjust(q, p){ var s = PK.shapeAdjust(q.qs.s0, q.qs.p0, p), it = shapeItem(s, q.qs.c, q.qs.w); E.d.items[q.qs.idx] = it; layersPaint(); }
  function holdAnim(q){ if(E.hAnim) return; E.hAnim = 1; (function tk(){ if(g !== q || q.m !== 'paint' || !q.hold || !q.hold.on){ E.hAnim = 0; E.holdQ = null; fxDraw(); return; } E.holdQ = q; fxDraw(); setTimeout(tk, 60); })(); }
  function downG(e){
    var t = e.target, p = pt(e), i, it, rc, tl;
    if(E.float){ e.preventDefault(); var hk = PK.floatHit(E.float.F, p, 14 / E.k, E.xmode); if(!hk) return; g = { m: 'fl', pid: e.pointerId, k: hk, st: PK.floatDragStart(E.float.F, hk, p) }; E.float.hot = hk; cap(e); fxDraw(); return; }   /* ★ v1.1.0 剪下/變形中只操作浮動圖片 */
    if(E.tab === 'paint' && E.pm === 'pixel'){ cv = apc(); if(!cv) return; ctx = cv.getContext('2d'); if(!plVisOk()) return; e.preventDefault(); beginOp(); g = { m: 'px', pid: e.pointerId };
      if(e.pointerType === 'touch'){ try{ g.snap = ctx.getImageData(0, 0, cv.width, cv.height); }catch(x0){} }
      cap(e);
      if(E.px.tool === 'fill'){ pxFill(p); g.done = true; } else pxDot(p); return; }
    if(E.tab === 'paint' && E.pm !== 'vector' && PK){ tl = E.brush.t;
      if(tl === 'bucket'){ e.preventDefault(); g = { m: 'bk', pid: e.pointerId, p: p }; return; }
      if(tl === 'lasso'){ e.preventDefault(); tolClose(); g = { m: 'lasso', pid: e.pointerId, pts: [p] }; E.lassoPts = g.pts; cap(e); return; } }
    if(E.tab === 'paint' && E.pm !== 'vector'){ cv = apc(); if(!cv) return; ctx = cv.getContext('2d'); if(!plVisOk()) return; e.preventDefault();
      if(E.brush.t === 'eraser' && lkOn()){ toast(T({ c: '🔒 這個圖層開了阿爾法鎖定,不能擦(在圖層 ⋯ 裡關掉)', p: '🔒 阿爾法鎖定中無法使用橡皮擦' })); return; }
      tolClose(); beginOp(); g = brushStart(p, e); cap(e); return; }
    if(E.tab === 'paint' && E.pm === 'vector'){
      var hit = t; while(hit && hit !== st && !(hit.getAttribute && (hit.getAttribute('data-i') != null || hit.getAttribute('data-h')))) hit = hit.parentNode;
      if(!hit || hit === st){ e.preventDefault(); g = { m: 'vec', pid: e.pointerId, x0: p.x, y0: p.y, made: false }; try{ st.setPointerCapture(e.pointerId); }catch(x){} return; }
      t = hit; }
    if(t.getAttribute && t.getAttribute('data-h') && E.sel >= 0){ e.preventDefault(); it = E.d.items[E.sel];
      g = { m: 'rs', pid: e.pointerId, s0: it.s || 1, r0: it.r || 0, d0: Math.max(10, Math.sqrt((p.x - it.x) * (p.x - it.x) + (p.y - it.y) * (p.y - it.y))), a0: Math.atan2(p.y - it.y, p.x - it.x), moved: false };
      try{ st.setPointerCapture(e.pointerId); }catch(x){} return; }
    while(t && t !== st && t.parentNode && !(t.getAttribute && t.getAttribute('data-i') != null) && t.id !== 'dsg-ly') t = t.parentNode;   /* 向量形狀的 <path> 往上找到 <svg data-i> */
    i = t && t.getAttribute ? t.getAttribute('data-i') : null;
    if(i == null){ if(E.sel >= 0){ E.sel = -1; propPaint(); selPaint(); } return; }
    e.preventDefault(); i = +i; if(E.sel !== i){ E.sel = i; propPaint(); } it = E.d.items[i];
    g = { m: 'mv', pid: e.pointerId, ox: it.x - p.x, oy: it.y - p.y, moved: false }; selPaint();
    try{ st.setPointerCapture(e.pointerId); }catch(x){}
  }
  st.onpointermove = function(e){
    if(!g || e.pointerId !== g.pid) return;
    var p = pt(e), it, d;
    if(g.m === 'paint'){ brushMove(g, e); return; }
    if(g.m === 'qs'){ qsAdjust(g, p); return; }
    if(g.m === 'px'){ if(!g.done) pxDot(p); return; }
    if(g.m === 'bk') return;
    if(g.m === 'lasso'){ var lq = g.pts[g.pts.length - 1]; if(Math.abs(p.x - lq.x) + Math.abs(p.y - lq.y) > 2 / E.k && g.pts.length < 5000){ g.pts.push(p); fxDraw(); } return; }
    if(g.m === 'fl'){ flMove(g, p, e); return; }
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
  st.onpointerup = function(e){
    if(!g || e.pointerId !== g.pid) return;
    endG();   /* ★ v1.0.6 收筆邏輯搬進 endG(捏合時畫比較久的那一筆也走同一條) */
  };
  st.onpointercancel = function(e){ if(!g || e.pointerId !== g.pid) return; if(g.m === 'bk' || g.m === 'lasso'){ E.gCancel(); return; } endG(); };
  /* ── ★ v1.1.0 剪下/變形的浮動圖片:拖曳(拖到右邊圖層列上 = 放進那個圖層) ── */
  function flMove(q, p, e){
    var r = st.parentNode.getBoundingClientRect(), inS = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if(q.k === 'in'){ q.over = inS ? null : PK.layerAt(e.clientX, e.clientY, 'data-dl'); lyHot(q.over); if(!inS) return; }
    PK.floatDrag(E.float.F, q.st, p, E.xmode); fxDraw();
  }
  function flUp(q){
    if(E.float) E.float.hot = null; lyHot(null);
    if(q.k === 'in' && q.over != null && E.float){ var L = E.d.layers[q.over]; if(L && L.k === 'p'){ E.float.tgt = L.id; flCommit(); return; } if(L) toast(T({ c: '物件層不能放畫的東西,請拖到一般圖層', p: '物件層無法放入點陣圖,請拖至一般圖層' })); }
    fxDraw();
  }
}

/* ══ ★ v1.1.0(2026-11-10・老師「美術設計師竟然沒有圖層要補上。圖層名稱可編輯」)圖層 ══
   d.layers = 由下到上 [{ id, k:'p' 一般圖層(畫筆/像素) | 'o' 物件層(人物部件/素材/文字/形狀,只有一個), n 名稱, vis, a 透明度 }]
   每個一般圖層一張 <canvas class="dsg-pl" data-lid>,內容存 E.pls[id] = PNG 字串(跟著作品存檔、復原快照、雲端同步)。
   舊作品:只有一張畫筆層 r.paint + d.pb(畫的東西在最下層) ⇒ 自動轉成 [圖層 1, 物件層] 或 [物件層, 圖層 1]。 */
var BRUSH = {
  pencil: { n: '鉛筆', e: '✏️', a: 0.9 }, water: { n: '水彩', e: '💧', a: 0.8 }, crayon: { n: '蠟筆', e: '🖍', a: 0.95 }, ink: { n: '毛筆', e: '🖌', a: 1 },
  mround: { n: '圓頭麥克筆', e: '🖊', a: 0.88 }, mflat: { n: '平頭麥克筆', e: '🖋', a: 0.8 }, vec: { n: '向量筆', e: '✒️', a: 1 }
};
var BR_ORDER = ['pencil', 'water', 'crayon', 'ink', 'mround', 'mflat', 'vec'];
var PL_MAX = 6;
function fmtStamp(t){ var d = new Date(+t || now()); function z(n){ return (n < 10 ? '0' : '') + n; } return d.getFullYear() + '/' + z(d.getMonth() + 1) + '/' + z(d.getDate()) + ' ' + z(d.getHours()) + ':' + z(d.getMinutes()); }   /* ★ v1.1.0 老師「存檔自動標記年月日+幾點幾分(24 小時制)」 */
function lyList(){ return (S.ed && S.ed.d.layers) || []; }
function lyIdx(id){ var a = lyList(), i; for(i = 0; i < a.length; i++){ if(a[i].id === id) return i; } return -1; }
function lyGet(id){ var i = lyIdx(id); return i >= 0 ? lyList()[i] : null; }
function lyInit(r){
  var d = r.d, E = S.ed, k, a, i;
  if(!d.layers || !d.layers.length){ var P = { id: 'p1', k: 'p', n: '圖層 1', vis: 1, a: 1 }, O = { id: 'o', k: 'o', n: '物件層', vis: 1, a: 1 }; d.layers = r.pls ? [P, O] : (d.pb ? [P, O] : [O, P]); }
  E.pls = {}; if(r.pls){ for(k in r.pls){ if(r.pls.hasOwnProperty(k)) E.pls[k] = r.pls[k]; } } else if(r.paint) E.pls.p1 = r.paint;
  a = d.layers; E.al = ''; for(i = a.length - 1; i >= 0; i--){ if(a[i].k === 'p'){ E.al = a[i].id; break; } }
}
function plCv(id){ var st = $('dsg-stage'); return st ? st.querySelector('canvas.dsg-pl[data-lid="' + id + '"]') : null; }
function apc(){ var E = S.ed, L = lyGet(E.al), a = lyList(), i;
  if(!L || L.k !== 'p'){ for(i = a.length - 1; i >= 0; i--){ if(a[i].k === 'p'){ if(L && L.k === 'o') toast(T({ c: '物件層不能直接畫,幫你換到「' + a[i].n + '」', p: '物件層無法直接繪製,已切換至「' + a[i].n + '」' })); E.al = a[i].id; lyPanel(); break; } } }
  return plCv(E.al); }
function plVisOk(){ var L = lyGet(S.ed.al); if(L && !L.vis){ toast('「' + L.n + '」隱藏中,先打開眼睛 👁'); return false; } return true; }
function plLoad(c, src){ var x = c.getContext('2d'); c._src = src || ''; x.clearRect(0, 0, c.width, c.height); if(!src) return; var im = new Image(); im.onload = function(){ if(c._src !== src) return; x.clearRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0); }; im.src = src; }
function plSave(c){ if(!c) return; var id = c.getAttribute('data-lid'), s = ''; try{ s = c.toDataURL('image/png'); }catch(e){} S.ed.pls[id] = s; c._src = s; }
function stampShow(s){ var b = $('dsg-stamp'), m = $('dsg-mid'); if(!m) return; if(!b){ b = document.createElement('div'); b.className = 'dsg-stamp'; b.id = 'dsg-stamp'; m.appendChild(b); } b.textContent = '💾 ' + s; }
function plsCopy(){ var o = {}, k, P = S.ed.pls; for(k in P){ if(P.hasOwnProperty(k)) o[k] = P[k]; } return o; }
function plsJoin(){ var a = lyList(), o = [], i; for(i = 0; i < a.length; i++){ if(a[i].k === 'p') o.push(a[i].id + ':' + (S.ed.pls[a[i].id] || '')); } return o.join('|'); }
/* 圖層畫布照順序擺好(z-index = 圖層位置);內容跟 E.pls 不一樣的才重新載入 */
function plsBuild(){
  var E = S.ed, st = $('dsg-stage'), a = lyList(), have = {}, i, c, L, ly = $('dsg-ly'), all, W = E.d.W, H = E.d.H;
  if(!st) return;
  all = st.querySelectorAll('canvas.dsg-pl'); for(i = 0; i < all.length; i++) have[all[i].getAttribute('data-lid')] = all[i];
  for(i = 0; i < a.length; i++){ L = a[i];
    if(L.k === 'o'){ if(ly){ ly.style.zIndex = i + 1; ly.style.display = L.vis ? '' : 'none'; ly.style.opacity = L.a == null ? 1 : L.a; } continue; }
    c = have[L.id]; delete have[L.id];
    if(!c){ c = document.createElement('canvas'); c.className = 'dsg-pl'; c.setAttribute('data-lid', L.id); c.width = W; c.height = H; c.style.width = W + 'px'; c.style.height = H + 'px'; c._src = null; st.appendChild(c); }
    c.style.zIndex = i + 1; c.style.display = L.vis ? '' : 'none'; c.style.opacity = L.a == null ? 1 : L.a;
    if(c._src !== (E.pls[L.id] || '')) plLoad(c, E.pls[L.id] || ''); }
  for(i in have){ if(have.hasOwnProperty(i) && have[i].parentNode) have[i].parentNode.removeChild(have[i]); }
}
/* 一筆的草稿層:疊在作用圖層正上方,透明度 = 筆刷透明度 */
function lkOn(id){ var L = lyGet(id || S.ed.al); return !!(L && L.k === 'p' && L.lk); }   /* ★ v1.1.0 阿爾法鎖定:只畫在已經有顏色的地方(source-atop) */
function scrOn(c, al){ var s = $('dsg-scr'), x, m = '', src; s.style.zIndex = c.style.zIndex; if(c.nextSibling !== s) c.parentNode.insertBefore(s, c.nextSibling); s.style.opacity = al; s.style.display = 'block';
  if(lkOn(c.getAttribute('data-lid'))){ src = S.ed.pls[c.getAttribute('data-lid')] || ''; m = src ? 'url(' + src + ')' : 'linear-gradient(transparent,transparent)'; }   /* 鎖定時預覽也只顯示在有顏色的地方 */
  s.style.webkitMaskImage = m; s.style.maskImage = m; s.style.webkitMaskSize = s.style.maskSize = m ? '100% 100%' : '';
  x = s.getContext('2d'); x.clearRect(0, 0, s.width, s.height); return x; }
function scrOff(){ var s = $('dsg-scr'); if(!s) return; s.getContext('2d').clearRect(0, 0, s.width, s.height); s.style.display = 'none'; }
function scrMerge(c, al){ var s = $('dsg-scr'), x = c.getContext('2d'); x.save(); x.globalAlpha = al; if(lkOn(c.getAttribute('data-lid'))) x.globalCompositeOperation = 'source-atop'; x.drawImage(s, 0, 0); x.restore(); scrOff(); }
function mergedPaint(){ var E = S.ed, a = lyList(), c = document.createElement('canvas'), x, i, p; if(!$('dsg-stage')) return E.r.paint || ''; c.width = E.d.W; c.height = E.d.H; x = c.getContext('2d');
  for(i = 0; i < a.length; i++){ if(a[i].k !== 'p' || !a[i].vis) continue; p = plCv(a[i].id); if(p){ x.globalAlpha = a[i].a == null ? 1 : a[i].a; x.drawImage(p, 0, 0); } }
  try{ return c.toDataURL('image/png'); }catch(e){ return ''; } }
/* 物件層加一個東西(物件層隱藏中就打開) */
function objPush(it){ var E = S.ed, O = lyGet('o'); E.d.items.push(it); E.sel = E.d.items.length - 1; if(O && !O.vis){ O.vis = 1; plsBuild(); lyPanel(); } }
/* 辨識出來的形狀 → 向量形狀物件 */
function shapeItem(s, col, sw){
  var o = { t: 'shape', fill: 'none', st: col, sw: sw, s: 1, fx: 1, a: 1, r: 0 }, i, x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, dx, dy;
  if(s.k === 'line'){ dx = s.b.x - s.a.x; dy = s.b.y - s.a.y; o.sh = 'line'; o.w = Math.max(10, Math.round(Math.sqrt(dx * dx + dy * dy))); o.h = 10; o.x = (s.a.x + s.b.x) / 2; o.y = (s.a.y + s.b.y) / 2; o.r = Math.round(Math.atan2(dy, dx) * 180 / Math.PI); return o; }
  if(s.k === 'ellipse'){ o.sh = 'ellipse'; o.w = Math.max(10, Math.round(s.rx * 2)); o.h = Math.max(10, Math.round(s.ry * 2)); o.x = s.cx; o.y = s.cy; o.r = Math.round((s.rot || 0) * 180 / Math.PI); return o; }
  for(i = 0; i < s.pts.length; i++){ x0 = Math.min(x0, s.pts[i].x); y0 = Math.min(y0, s.pts[i].y); x1 = Math.max(x1, s.pts[i].x); y1 = Math.max(y1, s.pts[i].y); }
  o.sh = s.closed ? 'poly' : 'pl'; o.w = Math.max(10, Math.round(x1 - x0)); o.h = Math.max(10, Math.round(y1 - y0));
  var ox = (o.w - (x1 - x0)) / 2, oy = (o.h - (y1 - y0)) / 2; o.pts = [];
  for(i = 0; i < s.pts.length; i++) o.pts.push([Math.round((s.pts[i].x - x0 + ox) * 10) / 10, Math.round((s.pts[i].y - y0 + oy) * 10) / 10]);
  o.x = (x0 + x1) / 2; o.y = (y0 + y1) / 2; return o;
}
/* 向量筆:整筆簡化成平滑曲線 */
function pathItem(raw, col, sw){
  if(!raw || raw.length < 2) return null;
  var p = [raw[0]], i, x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, o, d2;
  for(i = 1; i < raw.length; i++){ d2 = Math.abs(raw[i].x - p[p.length - 1].x) + Math.abs(raw[i].y - p[p.length - 1].y); if(d2 >= 5 || i === raw.length - 1) p.push(raw[i]); }
  if(p.length > 160){ var q = [], st2 = p.length / 160; for(i = 0; i < 160; i++) q.push(p[Math.floor(i * st2)]); q.push(p[p.length - 1]); p = q; }
  for(i = 0; i < p.length; i++){ x0 = Math.min(x0, p[i].x); y0 = Math.min(y0, p[i].y); x1 = Math.max(x1, p[i].x); y1 = Math.max(y1, p[i].y); }
  if(x1 - x0 < 2 && y1 - y0 < 2){ p = [{ x: x0 - 2, y: y0 }, { x: x0 + 2, y: y0 }]; x0 -= 2; x1 = x0 + 4; }
  o = { t: 'shape', sh: 'path', fill: 'none', st: col, sw: sw, s: 1, fx: 1, a: 1, r: 0, w: Math.max(10, Math.round(x1 - x0)), h: Math.max(10, Math.round(y1 - y0)), pts: [] };
  var ox = (o.w - (x1 - x0)) / 2, oy = (o.h - (y1 - y0)) / 2;
  for(i = 0; i < p.length; i++) o.pts.push([Math.round((p[i].x - x0 + ox) * 10) / 10, Math.round((p[i].y - y0 + oy) * 10) / 10]);
  o.x = (x0 + x1) / 2; o.y = (y0 + y1) / 2; return o;
}
/* 效果層 #dsg-fx:剪刀路徑、浮動圖片+把手、長按倒數圈 */
function fxDraw(){
  var E = S.ed, c = $('dsg-fx'), x, PK = window.MGPK; if(!E || !c || !PK) return;
  x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height);
  if(E.float){ PK.floatDraw(x, E.float.F, false); PK.floatHandles(x, E.float.F, 14 / E.k, E.xmode, E.float.hot); }
  if(E.lassoPts) PK.lassoDraw(x, E.lassoPts, E.k);
  if(E.holdQ && E.holdQ.hold){ var hp = E.holdQ.hold.progress(); if(hp > 0.2) PK.drawHold(x, E.holdQ.last.x, E.holdQ.last.y, hp, 24 / E.k); }
}
/* ── 🪣 油漆桶(看得到的整張圖當取樣,填進作用圖層)── */
function tolClose(keep){ var E = S.ed; if(!E) return; if(E.tolBar){ var b = E.tolBar; E.tolBar = null; b.close(); } if(!keep) E.lastFill = null; }
function bucketAt(p, hex, tol, showBar, cb){
  var E = S.ed, PK = window.MGPK, cv = apc(), x, W = E.d.W, H = E.d.H;
  if(!PK || !cv || p.x < 0 || p.y < 0 || p.x >= W || p.y >= H){ if(cb) cb(false); return; }
  if(!plVisOk()){ if(cb) cb(false); return; }
  tolClose();
  /* ★ v1.1.0 🎯 有「參照」圖層 ⇒ 只看那一層的線條決定範圍(白紙+參照層) */
  var refL = null, li2, LY2 = lyList(); for(li2 = 0; li2 < LY2.length; li2++){ if(LY2[li2].k === 'p' && LY2[li2].ref && LY2[li2].vis) refL = LY2[li2]; }
  function refComp(cb2){ var c2 = document.createElement('canvas'), x2, rc = plCv(refL.id); c2.width = W; c2.height = H; x2 = c2.getContext('2d'); x2.fillStyle = '#fff'; x2.fillRect(0, 0, W, H); if(rc) x2.drawImage(rc, 0, 0); cb2(c2); }
  (refL ? refComp : function(cb2){ renderComposite(true, 0, cb2); })(function(comp){
    var src = comp.getContext('2d').getImageData(0, 0, W, H), rd = E.redo.slice(), f;
    x = cv.getContext('2d');
    f = { cv: cv, x: p.x, y: p.y, hex: hex, tol: tol, src: src, bak: x.getImageData(0, 0, W, H) };
    beginOp();
    if(!fillDo(f)){ E.undo.pop(); E.redo = rd; E._bk = null; if(cb) cb(false); return; }
    E.lastFill = f; endOp(true); sfx('sfx-gentle', 0.4);
    if(f.n > W * H * 0.96) toast(T({ c: '🪣 整張都填滿了:線條沒有圍起來(有缺口),或臨界值太大', p: '🪣 已填滿整張:請確認線條是否封閉,或調低臨界值' }));
    if(showBar) tolShow();
    if(cb) cb(true);
  });
}
function fillDo(f){ var PK = window.MGPK, M = PK.fillMask(f.src, f.x, f.y, f.tol, 2); if(!M || !M.n) return false; PK.fillPaint(f.cv.getContext('2d'), M, f.hex, S.ed.brush.op || 1, 1, lkOn(f.cv.getAttribute('data-lid')) ? 'source-atop' : ''); plSave(f.cv); f.n = M.n; return true; }
function bucketRe(tol){ var E = S.ed, f = E && E.lastFill; if(!f) return; f.tol = tol; f.cv.getContext('2d').putImageData(f.bak, 0, 0); fillDo(f); dirty(); }   /* 調臨界值:同一點重新填,不另外多一步復原 */
function tolShow(){ var E = S.ed, PK = window.MGPK; if(!E.lastFill) return; tolClose(true); E.tolBar = PK.tolBar($('dsg-mid'), E.lastFill.tol, function(t){ E.tol = t; bucketRe(t); }, function(){ E.tolBar = null; E.lastFill = null; }); }
/* ── ✂️ 剪刀 / ⤡ 變形 ── */
function lassoEnd(pts){
  var E = S.ed, PK = window.MGPK, cv, rd, r, L;
  fxDraw(); if(!pts || pts.length < 6) return;
  cv = apc(); if(!cv || !plVisOk()) return; L = lyGet(E.al);
  rd = E.redo.slice(); beginOp();
  r = PK.lassoCut(cv, pts);
  if(!r){ E.undo.pop(); E.redo = rd; E._bk = null; toast('✂️ 圈起來的地方在「' + (L ? L.n : '') + '」沒有畫東西(剪刀只剪目前選的圖層)'); return; }
  flStart(r, true, rd);
}
function xformStart(){
  var E = S.ed, PK = window.MGPK, cv, rd, r, L;
  if(!PK || locked()) return; if(E.float){ toast('先按 ✅ 完成或 ✖ 取消'); return; }
  cv = apc(); if(!cv || !plVisOk()) return; L = lyGet(E.al);
  rd = E.redo.slice(); beginOp();
  r = PK.liftLayer(cv);
  if(!r){ E.undo.pop(); E.redo = rd; E._bk = null; toast('「' + (L ? L.n : '') + '」還沒有畫東西,選一個有畫的圖層再按 ⤡'); return; }
  flStart(r, false, rd);
}
function flLayers(){ var a = lyList(), o = [], i; for(i = a.length - 1; i >= 0; i--){ if(a[i].k === 'p') o.push({ i: i, n: a[i].n }); } return o; }
function flStart(r, cut, rd){
  var E = S.ed, PK = window.MGPK;
  tolClose(); E.sel = -1; selPaint(); propPaint();
  E.float = { F: r.F, orig: r.orig, src: E.al, tgt: E.al, cut: cut, rd: rd, hot: null };
  if(!E.xmode || E.xmode === 'dist') E.xmode = 'uni';
  E.xbar = PK.xformBar($('dsg-mid'), { mode: E.xmode, cut: cut, layers: flLayers(), target: lyIdx(E.al),
    onMode: function(m){ E.xmode = m; fxDraw(); }, onFlip: function(ax){ PK.floatFlip(E.float.F, ax); fxDraw(); }, onRot: function(){ PK.floatRot90(E.float.F); fxDraw(); },
    onTarget: function(i){ var L = lyList()[i]; if(L && L.k === 'p'){ E.float.tgt = L.id; lyPanel(); } },
    onNew: function(){ var nl = lyAdd(true); if(nl){ E.float.tgt = nl.id; E.xbar.set('layers', flLayers()); E.xbar.set('target', lyIdx(nl.id)); lyPanel(); } },
    onOk: flCommit, onCancel: flCancel });
  fxDraw(); lyPanel();
  toast(cut ? T({ c: '✂️ 剪下來了!拖它移動,拖到右邊的圖層上 = 放進那個圖層', p: '✂️ 已剪下:拖曳移動,拖到右側圖層即放入該圖層' }) : T({ c: '⤡ 拉四個角放大縮小,拉 ⟳ 旋轉,好了按 ✅', p: '⤡ 拖曳角點縮放、⟳ 旋轉,完成後按 ✅' }));
}
function flClose(){ var E = S.ed; E.float = null; if(E.xbar){ E.xbar.close(); E.xbar = null; } }
function flCommit(){
  var E = S.ed, f = E.float, PK = window.MGPK, sc, tc; if(!f) return;
  flClose(); sc = plCv(f.src); tc = plCv(f.tgt) || sc;
  if(tc) PK.floatDraw(tc.getContext('2d'), f.F, true);
  if(sc) plSave(sc); if(tc && tc !== sc) plSave(tc);
  E.al = tc ? tc.getAttribute('data-lid') : E.al;
  endOp(false); sfx('sfx-gentle', 0.4);
  if(f.tgt !== f.src){ var L = lyGet(f.tgt); if(L) toast('📚 放到「' + L.n + '」了'); }
  fxDraw(); lyPanel();
}
function flCancel(){
  var E = S.ed, f = E.float, sc, x; if(!f) return;
  flClose(); sc = plCv(f.src);
  if(sc){ x = sc.getContext('2d'); x.clearRect(f.orig.x, f.orig.y, f.orig.c.width, f.orig.c.height); x.drawImage(f.orig.c, f.orig.x, f.orig.y); }
  restore(E.undo.pop()); E.redo = f.rd || []; E._bk = null;
  toast('✖ 取消了,恢復原狀'); fxDraw(); lyPanel();
}
/* ── 圖層面板(右欄,常駐)── */
function lyAdd(silent){
  var E = S.ed, a = lyList(), n = 0, i, id, nl, at = lyIdx(E.al);
  for(i = 0; i < a.length; i++){ if(a[i].k === 'p') n++; }
  if(n >= PL_MAX){ toast('一般圖層最多 ' + PL_MAX + ' 層'); return null; }
  i = 1; while(lyGet('p' + i)) i++; id = 'p' + i;
  nl = { id: id, k: 'p', n: '圖層 ' + i, vis: 1, a: 1 };
  if(!silent) beginOp();
  a.splice(at >= 0 ? at + 1 : a.length, 0, nl); E.pls[id] = '';
  if(!silent){ E.al = id; endOp(false); } else dirty();
  plsBuild(); return nl;
}
function lyPanel(){
  var E = S.ed, el = $('dsg-lys'), a = lyList(), h = '', i, L, th, act = lyGet(E.al), tg = E.float ? E.float.tgt : '';
  if(!el) return;
  for(i = a.length - 1; i >= 0; i--){ L = a[i];
    th = L.k === 'o' ? '<span class="lic">🔷</span>' : (E.pls[L.id] ? '<img src="' + E.pls[L.id] + '" alt="">' : '<span class="lic"></span>');
    var tags = (L.a != null && L.a < 1 ? '🔅' : '') + (L.ref ? '🎯' : '') + (L.lk ? '🔒' : '');
    h += '<div class="dsg-lyr' + (L.id === E.al ? ' on' : '') + (tg && L.id === tg ? ' tg' : '') + '" data-dl="' + i + '"><button data-lv="' + i + '" title="顯示/隱藏">' + (L.vis ? '👁' : '🚫') + '</button>' + th + '<span class="nm">' + esc(L.n) + (tags ? ' <span class="tags">' + tags + '</span>' : '') + '</span><button data-lr="' + i + '" title="改名字">✏️</button><button data-lm="' + i + '" title="透明度/參照/阿爾法鎖定"' + (E.lmenu === L.id ? ' style="background:#ffd45a"' : '') + '>⋯</button></div>';
    /* ★ v1.1.0(老師 18:44「圖層新增右側功能鍵可開啟下拉視窗:透明度、參照、阿爾法鎖定。都有 ? 可開啟說明視窗。參考 procreate」) */
    if(E.lmenu === L.id) h += '<div class="dsg-lmn"><div class="r">🔅 透明度 <input type="range" min="10" max="100" value="' + Math.round((L.a == null ? 1 : L.a) * 100) + '" data-lmo="' + i + '"><b>' + Math.round((L.a == null ? 1 : L.a) * 100) + '%</b><button data-lmh="op">?</button></div>'
      + (L.k === 'p' ? '<div class="r"><label><input type="checkbox" data-lmr="' + i + '"' + (L.ref ? ' checked' : '') + '> 🎯 參照</label><button data-lmh="ref">?</button></div><div class="r"><label><input type="checkbox" data-lmk="' + i + '"' + (L.lk ? ' checked' : '') + '> 🔒 阿爾法鎖定</label><button data-lmh="lk">?</button></div>' : '<div class="r" style="opacity:.75;font-size:.9em">' + esc(T({ c: '物件層放文字和向量形狀,只能調透明度', p: '物件層僅能調整透明度' })) + '</div>') + '</div>'; }
  h += '<div class="dsg-lyb"><button data-lk="add" title="新增圖層">＋<span class="lb">新增</span></button><button data-lk="up" title="往上">▲</button><button data-lk="dn" title="往下">▼</button><button data-lk="del" title="刪除圖層">🗑</button></div>';
  el.innerHTML = h;
}
function lyHot(i){ var rows = document.querySelectorAll('#dsg-lys .dsg-lyr'), j, v; for(j = 0; j < rows.length; j++){ v = +rows[j].getAttribute('data-dl'); rows[j].classList.toggle('hot', i != null && v === i); } }
function lyRename(i){
  var E = S.ed, L = lyList()[i]; if(!L || locked()) return;
  modal('<h3>✏️ 圖層名稱</h3><p style="margin:.4vmin 0;opacity:.8">最多 12 個字,例如「線稿」「上色」「背景」</p><input type="text" id="dsg-lrn" maxlength="12" value="' + esc(L.n) + '">',
    [{ t: '取消', cls: 'ghost' }, { t: '✅ 改好了', cb: function(m){ var v = String((m.querySelector('#dsg-lrn') || {}).value || '').replace(/\s+/g, ' ').replace(/^ | $/g, '').slice(0, 12);
      if(!v || v === L.n) return; if(wordHits(v).length){ toast('名字裡有不適合的字詞,請換一個'); return; } beginOp(); L.n = v; endOp(false); lyPanel(); if(E.xbar) E.xbar.set('layers', flLayers()); } }],
    { onOpen: function(m){ var inp = m.querySelector('#dsg-lrn'); setTimeout(function(){ try{ inp.focus(); inp.select(); }catch(e){} }, 80); inp.onkeydown = function(ev){ if(ev.keyCode === 13){ ev.preventDefault(); m.querySelectorAll('.btns button')[1].click(); } }; } });
}
function lyClick(ev){
  var E = S.ed, t = ev.target, a = lyList(), i, k, L, tmp;
  if(ev.target.tagName === 'INPUT' && ev.target.type === 'range') return;
  while(t && t.id !== 'dsg-lys' && !(t.getAttribute && (t.getAttribute('data-lv') != null || t.getAttribute('data-lr') != null || t.getAttribute('data-lk') || t.getAttribute('data-dl') != null || t.getAttribute('data-lm') != null || t.getAttribute('data-lmh') || t.getAttribute('data-lmr') != null || t.getAttribute('data-lmk') != null))) t = t.parentNode;
  if(!t || t.id === 'dsg-lys') return;
  if(t.getAttribute('data-lmh')){ ev.stopPropagation(); sfx('sfx-tap', 0.25); if(window.MGPK) modal(window.MGPK.helpHtml(t.getAttribute('data-lmh'), S.style)); return; }   /* ? 說明視窗(鎖定的作品也能看) */
  if(locked()) return;
  ev.stopPropagation(); sfx('sfx-tap', 0.25);
  if(t.getAttribute('data-lm') != null){ L = a[+t.getAttribute('data-lm')]; if(!L) return; E.lmenu = E.lmenu === L.id ? '' : L.id; lyPanel(); return; }
  if(t.getAttribute('data-lmr') != null){ L = a[+t.getAttribute('data-lmr')]; if(!L) return; var on = !L.ref; beginOp(); for(i = 0; i < a.length; i++) a[i].ref = 0; L.ref = on ? 1 : 0; endOp(false); lyPanel();
    toast(on ? T({ c: '🎯「' + L.n + '」變成參照了:油漆桶只看這層的線條,顏色塗在你選的圖層', p: '🎯 已設為參照圖層' }) : '🎯 取消參照'); return; }
  if(t.getAttribute('data-lmk') != null){ L = a[+t.getAttribute('data-lmk')]; if(!L) return; beginOp(); L.lk = L.lk ? 0 : 1; endOp(false); lyPanel();
    toast(L.lk ? T({ c: '🔒「' + L.n + '」阿爾法鎖定:只能畫在已經有顏色的地方', p: '🔒 已開啟阿爾法鎖定' }) : '🔓 解除阿爾法鎖定'); return; }
  if(t.getAttribute('data-lr') != null){ lyRename(+t.getAttribute('data-lr')); return; }
  if(t.getAttribute('data-lv') != null){ L = a[+t.getAttribute('data-lv')]; if(!L) return; beginOp(); L.vis = L.vis ? 0 : 1; endOp(false); plsBuild(); lyPanel(); return; }
  if(t.getAttribute('data-dl') != null){ L = a[+t.getAttribute('data-dl')]; if(!L) return;
    if(E.float){ if(L.k === 'p'){ E.float.tgt = L.id; if(E.xbar) E.xbar.set('target', lyIdx(L.id)); lyPanel(); toast('📚 完成後會放到「' + L.n + '」'); } else toast(T({ c: '物件層不能放畫的東西', p: '物件層無法放入點陣圖' })); return; }
    E.al = L.id; if(L.k === 'o') toast(T({ c: '🔷 物件層:放文字貼片、向量形狀的地方(點畫面上的物件就能移動、改顏色)', p: '🔷 物件層:文字貼片與向量形狀所在圖層' })); lyPanel(); return; }
  k = t.getAttribute('data-lk'); if(E.float){ toast('先按 ✅ 完成或 ✖ 取消'); return; }
  i = lyIdx(E.al);
  if(k === 'add'){ if(lyAdd(false)) lyPanel(); return; }
  if(k === 'up' && i >= 0 && i < a.length - 1){ beginOp(); tmp = a[i]; a[i] = a[i + 1]; a[i + 1] = tmp; endOp(false); plsBuild(); lyPanel(); return; }
  if(k === 'dn' && i > 0){ beginOp(); tmp = a[i]; a[i] = a[i - 1]; a[i - 1] = tmp; endOp(false); plsBuild(); lyPanel(); return; }
  if(k === 'del'){ L = a[i]; if(!L) return; if(L.k === 'o'){ toast(T({ c: '物件層不能刪(要刪文字或形狀,點它再按 🗑)', p: '物件層無法刪除' })); return; }
    var np = 0, j; for(j = 0; j < a.length; j++){ if(a[j].k === 'p') np++; } if(np <= 1){ toast('至少要留一個一般圖層'); return; }
    beginOp(); a.splice(i, 1); delete E.pls[L.id]; for(j = Math.min(i, a.length - 1); j >= 0; j--){ if(a[j].k === 'p'){ E.al = a[j].id; break; } } if(!lyGet(E.al) || lyGet(E.al).k !== 'p'){ for(j = 0; j < a.length; j++){ if(a[j].k === 'p'){ E.al = a[j].id; break; } } }
    endOp(false); plsBuild(); lyPanel(); toast('🗑 刪掉「' + L.n + '」了,按 ↶ 復原可以救回來'); }
}
/* ── 🎨 選色器(右欄,常駐;外圈色相+內三角形明度彩度)── */
function colorPanel(){
  var E = S.ed, el = $('dsg-pcol'), PK = window.MGPK, h, i;
  if(!el) return;
  h = '<div class="dsg-sec">🎨 <span class="lb">顏色</span></div><div class="dsg-curc"><span class="dsg-sw on" id="dsg-cur" style="background:' + E.brush.c + '" title="按住拖到畫布上 = 油漆桶"></span><b id="dsg-curx">' + esc(E.brush.c) + '</b></div><div id="dsg-wheel"></div><div class="dsg-qsw">';
  for(i = 0; i < D.PAINT_COLORS.length; i++) h += '<span class="dsg-sw" data-pc="' + D.PAINT_COLORS[i] + '" style="background:' + D.PAINT_COLORS[i] + '"></span>';
  el.innerHTML = h + '</div>';
  if(E.wheel){ try{ E.wheel.destroy(); }catch(e){} E.wheel = null; }
  if(PK) E.wheel = PK.wheel($('dsg-wheel'), { hex: E.brush.c, max: 230, onChange: function(hx, fin){ colorSet(hx, true, fin); } });
}
function colorSet(hx, fromWheel, fin){
  var E = S.ed, c = $('dsg-cur'), x = $('dsg-curx'), it;
  E.brush.c = hx; if(E.brush.t === 'eraser') E.brush.t = E.lastBr || 'mround'; if(E.px.tool === 'er') E.px.tool = 'pen';
  if(E.pm === 'vector') E.vec.fill = hx;
  if(c) c.style.background = hx; if(x) x.textContent = hx;
  if(!fromWheel && E.wheel) E.wheel.set(hx);
  if(fin !== false && E.tab === 'paint' && E.pm === 'vector' && E.sel >= 0 && (it = E.d.items[E.sel]) && it.t === 'shape' && !shapeOpen(it.sh) && it.fill !== hx){ beginOp(); it.fill = hx; endOp(true); layersPaint(); }   /* 向量繪圖:選到形狀時直接換填色 */
  if(fin !== false && E.tab === 'paint') libPaintSoon();
}
var lpT = 0; function libPaintSoon(){ clearTimeout(lpT); lpT = setTimeout(function(){ if(S.ed && S.screen === 'ed') libPaint(); }, 250); }

/* ── 像素點陣:畫在同一張畫筆層,但一律對齊格子;油漆桶以格子為單位填滿相連同色區 ── */
function pxCell(p){ var E = S.ed, c = E.d.W / E.px.n; return { c: c, ix: Math.floor(p.x / c), iy: Math.floor(p.y / c) }; }
function pxDot(p){ var E = S.ed, q = pxCell(p), x = apc().getContext('2d'), X = Math.round(q.ix * q.c), Y = Math.round(q.iy * q.c), Wd = Math.round((q.ix + 1) * q.c) - X, Hd = Math.round((q.iy + 1) * q.c) - Y;
  if(q.ix < 0 || q.iy < 0 || X >= E.d.W || Y >= E.d.H) return;
  var lk = lkOn();
  if(E.px.tool === 'er'){ if(!lk) x.clearRect(X, Y, Wd, Hd); } else { x.save(); if(lk) x.globalCompositeOperation = 'source-atop'; x.fillStyle = E.brush.c; x.fillRect(X, Y, Wd, Hd); x.restore(); } }   /* ★ v1.1.0 阿爾法鎖定 */
function pxFill(p){
  var E = S.ed, q = pxCell(p), cv = apc(), x = cv.getContext('2d'), n = E.px.n, rows = Math.ceil(E.d.H / q.c), dt = x.getImageData(0, 0, cv.width, cv.height).data, seen = {}, st = [[q.ix, q.iy]], key, cur, k0, cnt = 0;
  function col(ix, iy){ var px = Math.min(cv.width - 1, Math.floor((ix + 0.5) * q.c)), py = Math.min(cv.height - 1, Math.floor((iy + 0.5) * q.c)), o = (py * cv.width + px) * 4; return dt[o + 3] < 20 ? 'none' : dt[o] + ',' + dt[o + 1] + ',' + dt[o + 2]; }
  if(q.ix < 0 || q.iy < 0 || q.ix >= n || q.iy >= rows) return;
  k0 = col(q.ix, q.iy); x.fillStyle = E.brush.c; x.globalCompositeOperation = lkOn() ? 'source-atop' : 'source-over';
  while(st.length && cnt < 6000){ cur = st.pop(); key = cur[0] + '_' + cur[1];
    if(seen[key] || cur[0] < 0 || cur[1] < 0 || cur[0] >= n || cur[1] >= rows || col(cur[0], cur[1]) !== k0) continue;
    seen[key] = 1; cnt++;
    x.fillRect(Math.round(cur[0] * q.c), Math.round(cur[1] * q.c), Math.round((cur[0] + 1) * q.c) - Math.round(cur[0] * q.c), Math.round((cur[1] + 1) * q.c) - Math.round(cur[1] * q.c));
    st.push([cur[0] + 1, cur[1]], [cur[0] - 1, cur[1]], [cur[0], cur[1] + 1], [cur[0], cur[1] - 1]); }
  x.globalCompositeOperation = 'source-over';
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
    var j, o, c, li, LY = lyList();
    x.setTransform(sc, 0, 0, sc, 0, 0);
    /* ★ v1.1.0 照圖層順序合成:一般圖層(畫筆)與物件層(人物部件/素材/文字/形狀);隱藏的圖層不進作品 */
    for(li = 0; li < LY.length; li++){ if(!LY[li].vis) continue;
      if(LY[li].k === 'p'){ c = plCv(LY[li].id); if(c){ x.globalAlpha = LY[li].a == null ? 1 : LY[li].a; x.drawImage(c, 0, 0, W, H); x.globalAlpha = 1; } continue; }
    var oa = LY[li].a == null ? 1 : LY[li].a; x.globalAlpha = oa;   /* 物件層透明度 */
    for(j = 0; j < list.length; j++){ o = list[j]; x.globalAlpha = oa;
      if(o.slot){ if(o.im){ c = o.tint ? tintCv(o.im, o.tint[0], o.tint[1]) : o.im; x.drawImage(c, 0, 0, W, H); } continue; }
      x.save(); x.globalAlpha = (o.a == null ? 1 : o.a) * oa; x.translate(o.x, o.y); x.rotate((o.r || 0) * Math.PI / 180); x.scale((o.s || 1) * (o.fx || 1), o.s || 1);
      if(o.t === 'img' && o.im){ c = (o.h || (o.b != null && o.b !== 1)) ? tintCv(o.im, o.h, o.b) : o.im; x.drawImage(c, -c.width / 2, -c.height / 2); }
      else if(o.t === 'text') drawText(x, o);
      else if(o.t === 'shape' && window.Path2D){ x.translate(-o.w / 2, -o.h / 2); c = new Path2D(shapePath(o.sh, o.w, o.h, o.pts));
        if(!shapeOpen(o.sh) && o.fill && o.fill !== 'none'){ x.fillStyle = o.fill; x.fill(c); }
        if(o.sw){ x.lineWidth = o.sw; x.strokeStyle = o.st; x.lineJoin = 'round'; x.lineCap = 'round'; x.stroke(c); } }
      x.restore(); }
    x.globalAlpha = 1; }
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
    /* ★ v1.1.0(老師 18:46「每月繳交上限改成分開:角色立繪(皮膚)1 件、荒島裝飾 1 件」)— 文件 designSubmit/{月}_{uid}_{skin|deco};
       舊格式 {月}_{uid}(v1.1.0 以前繳的)同一種類也算這個月已繳 */
    var ym = ymOf(), resub = !!(r.sub && r.back), id = resub ? r.sub.id : subIdOf(ym, r.kind), legacy = resub ? null : f.db.collection('designSubmit').doc(ym + '_' + S.uid).get().then(function(d){ return d; }, function(){ return null; });
    Promise.all([f.db.collection('designSubmit').doc(id).get(), legacy]).then(function(rs){
      busy(false);
      var d = rs[0], x = d && d.exists ? d.data() : null, lg = rs[1] && rs[1].exists ? rs[1].data() : null;
      if(!x && lg && (lg.kind || 'skin') === r.kind) x = lg;
      if(x && !(resub && x.did === r.id && x.st === 'back')){ modal('<p>這個月的' + D.KINDS[r.kind].e + ' ' + esc(D.KINDS[r.kind].n) + '已經繳交過「' + esc(x.title || '') + '」了(' + subChip(x.st) + ')。</p><p>每人每月 🦸 角色皮膚 1 件、🏝 荒島裝飾 1 件,下個月 1 日早上 8:00 就可以再繳交。</p>'); return; }
      E.subId = id; E.resub = resub;
      qShow(function(ok, h){ if(!ok){ modal(h); return; } rulesCard(function(){ titleForm(); }); });
    })['catch'](function(){ busy(false); modal('<p>讀不到繳交狀態,請老師確認規則已發布,或稍後再試。</p>'); });
  });
}
function titleForm(){
  var E = S.ed, r = E.r, h = '<h3>📝 作品資料</h3>', i, A = D.TITLE_A, Bs = D.TITLE_B[r.kind], pen = lsGet('dsg_pen_' + S.uid) || '';
  /* ★ v1.0.4 作品名改成可以自己打字(預設帶入回工作室時取的名字);下拉選字只是幫忙想名字;繳交前檢查不可和已上架商品同名 */
  h += '<label>作品名(最多 ' + TITLE_MAX + ' 個字,不能和已上架的作品同名)</label><input type="text" id="dsg-tt" maxlength="' + TITLE_MAX + '" value="' + esc(r.title || '') + '" placeholder="例如:火焰魔法少年"><div id="dsg-ttm" style="color:#c0392b;min-height:2.6vmin"></div>';
  h += '<div style="display:flex;gap:1vmin;align-items:center;font-size:2vmin">想不到?用詞組:<select id="dsg-ta">'; for(i = 0; i < A.length; i++) h += '<option>' + esc(A[i]) + '</option>'; h += '</select><select id="dsg-tb">'; for(i = 0; i < Bs.length; i++) h += '<option>' + esc(Bs[i]) + '</option>'; h += '</select><button type="button" class="dsg-b ghost" id="dsg-tuse" style="font-size:1.9vmin">⬆ 放進作品名</button></div>';
  h += '<label style="display:block;margin-top:1.4vmin">筆名(2~8 個字,上架時顯示;老師看得到你的真名)</label><input type="text" id="dsg-pen" maxlength="8" value="' + esc(pen) + '"><div id="dsg-penm" style="color:#c0392b;min-height:2.6vmin"></div>';
  modal(h, [{ t: '取消', cls: 'ghost' }, { t: '下一步 ▶', keep: true, cb: function(m){
    if(m._chk) return;
    var p = String($('dsg-pen').value || '').trim(), tc = titleCheck($('dsg-tt').value);
    $('dsg-ttm').textContent = ''; $('dsg-penm').textContent = '';
    if(tc.e){ $('dsg-ttm').textContent = tc.e; return; }
    if(p.length < 2){ $('dsg-penm').textContent = '筆名要 2~8 個字'; return; }
    if(wordHits(p).length){ $('dsg-penm').textContent = '筆名有不適合的字詞(也不能用同學的名字),請換一個'; return; }
    m._chk = 1;
    shopTitleTaken(tc.v, function(tk){
      m._chk = 0; if(!$('dsg-tt')) return;
      if(tk){ var mm = $('dsg-ttm'); if(mm) mm.textContent = '已經有上架的作品叫「' + tk + '」了,作品名稱不能重複,請換一個名字'; return; }
      r.title = tc.v; r.pen = p; lsSet('dsg_pen_' + S.uid, p); modalClose();
      confirmBox('<b>確認繳交「' + esc(r.title) + '」?</b><br>繳交後作品就<b>鎖住不能修改</b>了;要等老師審核,老師退件(會附上修改建議)才能再改。', function(ok){ if(ok) moderate(); }, '📤 確認繳交');
    }, null, true);
  } }], { onOpen: function(m){ var bu = $('dsg-tuse'); if(bu) bu.onclick = function(){ var ip = $('dsg-tt'); if(ip) ip.value = ($('dsg-ta').value + $('dsg-tb').value).slice(0, TITLE_MAX); }; } });
}
/* ★ v1.0.4(2026-11-08・老師「冒險模式的主角造型工坊可以套用玩家在設計師工作室通過老師審核的圖片」)
   繳交時的 th:角色皮膚改存「透明背景、盡量接近原尺寸 504×720」的圖(webp,不支援 webp 的平板退 png),
   縮到 data URL ≤ 140,000 字(規則上限 150,000);老師通過上架時整張複製進 designShopItems.img,大對抗不必連 Storage 就能顯示。
   荒島裝飾維持舊做法(白底 jpeg 240px 縮圖)。 */
function thumbFor(png, kind){
  var k, c, x, u, i, sz = [1, 0.85, 0.72, 0.6, 0.5, 0.42, 0.35];
  function mk(sc, white, fmt, q){ c = document.createElement('canvas'); c.width = Math.max(1, Math.round(png.width * sc)); c.height = Math.max(1, Math.round(png.height * sc)); x = c.getContext('2d'); if(white){ x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); } x.drawImage(png, 0, 0, c.width, c.height); try{ return c.toDataURL(fmt, q); }catch(e){ return ''; } }
  if(kind === 'skin'){
    for(i = 0; i < sz.length; i++){
      u = mk(sz[i], false, 'image/webp', 0.82);
      if(u.indexOf('data:image/webp') !== 0) u = mk(sz[i], false, 'image/png');
      if(u && u.length <= 140000) return u;
    }
  }
  k = 240 / Math.max(png.width, png.height);
  return mk(k, true, 'image/jpeg', 0.8);
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
  hash = hashStr(JSON.stringify(d) + '|' + plsJoin());
  E.hash = hash;
  busy(true, '電腦正在檢查作品…');
  renderComposite(false, 0, function(png){
    renderComposite(true, 1024, function(flat){
      E.png = png.toDataURL('image/png'); E.th = thumbFor(png, r.kind);   /* ★ v1.0.4 角色皮膚:存近原尺寸透明圖(上架後給大對抗造型工房直接用) */
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
      return s.ref(path + '.json').putString(JSON.stringify({ d: E.d, paint: mergedPaint(), pls: plsCopy(), ver: VER }), 'raw', { contentType: 'application/json' });
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
    })['catch'](function(e){ busy(false); modal(String(e && e.message) === 'taken' ? '<p>這個月的' + esc(D.KINDS[r.kind].n) + '已經繳交過別的作品了。</p>' : '<p>繳交失敗(' + esc(e && (e.code || e.message) || '') + '),作品還在平板上,請稍後再試或告訴老師。</p>'); });
  });
}

/* ══ 🧑‍🏫 老師台(GM 限定):🚩 智慧審核未通過 / 📦 倉庫 / ⚙ 設定 ══ */
function gmOpen(){ if(!isGm()) return; gmPaint(); }
function gmPaint(){
  var h = '<div class="dsg-gm"><h3>🧑‍🏫 美術設計師 老師台</h3><div class="tabs"><button data-g="flag"' + (S.gmTab === 'flag' ? ' class="on"' : '') + '>🚩 智慧審核未通過</button><button data-g="wh"' + (S.gmTab === 'wh' ? ' class="on"' : '') + '>📦 倉庫</button><button data-g="shop"' + (S.gmTab === 'shop' ? ' class="on"' : '') + '>🛒 上架商品</button><button data-g="set"' + (S.gmTab === 'set' ? ' class="on"' : '') + '>⚙ 設定</button></div><div id="dsg-gmb">讀取中…</div></div>';
  var m = modal(h, [{ t: '關閉', cls: 'ghost' }], { cls: 'dsg-gmw' });
  m.querySelector('.box').style.width = 'min(96vw,150vmin)';
  m.querySelector('.tabs').onclick = function(ev){ var g = ev.target.getAttribute('data-g'); if(!g) return; S.gmTab = g; gmPaint(); };
  if(S.gmTab === 'flag') gmFlags(); else if(S.gmTab === 'wh') gmWh(S.gmYm || ymOf()); else if(S.gmTab === 'shop') gmShop(); else gmSet();
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
  h += '<div id="dsg-dupw" style="color:#c0392b;font-weight:900;min-height:2.4vmin"></div><div style="font-size:1.9vmin;opacity:.75">知識幣是大對抗「👤 主角造型工房」的售價,上架後可以隨時在「🛒 上架商品」修改。</div>';
  shopTitleTaken(x.title, function(tk){ var w = $('dsg-dupw'); if(w && tk) w.textContent = '⚠ 已經有上架的作品也叫「' + tk + '」(作品名不可重複),建議先退件請學生改名。'; }, x._id, true);   /* ★ v1.0.4 */
  modal(h, [{ t: '取消', cls: 'ghost', cb: gmPaint }, { t: '✅ 上架', keep: true, cb: function(){
    var f = fb(), F = FV(), u = user(), star = +$('dsg-star').value, g = { by: u.email, at: now(), star: star, price: { coin: Math.max(0, parseInt($('dsg-pc').value, 10) || 0), shell: Math.max(0, parseInt($('dsg-ps').value, 10) || 0) }, lim: Math.max(0, parseInt($('dsg-lim').value, 10) || 0) }, it, bt;
    if(x.kind === 'skin'){ g.hero = String($('dsg-hero').value || '').trim().slice(0, 20); g.isl = $('dsg-isl').checked; if(!g.hero){ toast('請寫要給哪位英雄'); return; } }
    else { g.comfort = +$('dsg-cf').value; g.out = $('dsg-out').checked; }
    it = { uid: x.uid, ym: x.ym, kind: x.kind, bt: x.bt || '', title: x.title, pen: x.pen, path: x.path, hash: x.hash, star: g.star, price: g.price, lim: g.lim, hero: g.hero || '', isl: !!g.isl, comfort: g.comfort || 0, out: !!g.out, on: true, sold: 0, at: F.serverTimestamp(), by: u.email, ver: VER, img: x.th || '' };   /* ★ v1.0.4 img = 繳交時的透明全身圖(大對抗主角造型工房用) */
    bt = f.db.batch();
    bt.set(f.db.collection('designShopItems').doc(x._id), it);
    bt.update(f.db.collection('designSubmit').doc(x._id), { st: 'live', liveHash: x.hash, gm: g });
    bt.set(f.db.collection('designSubmit').doc(x._id).collection('log').doc(), { uid: x.uid, k: 'live', hash: x.hash, by: u.email, at: F.serverTimestamp() });
    bt.commit().then(function(){ toast('✅ 已上架成商品'); gmPaint(); }, function(e){ toast('寫入失敗:' + (e && e.code)); });
  } }]);
}
/* ★ v1.0.4(2026-11-08・老師「商品價格由 GM 來定,價格也可以隨時修正調整」「給設計者一部分」)
   🛒 上架商品:列出 designShopItems → 改知識幣/貝幣售價、上架/下架、補全身圖(舊商品沒有 img 時從 designSubmit.th 複製);
   設計者分紅比例 gameConfig/designerShop.roy(%,預設 20,0~50)。已售件數 = designSales 筆數(規則沒發布時顯示「—」)。 */
function gmShop(){
  var f = fb();
  if(!f || !f.db){ gmBody('<p>連不上雲端</p>'); return; }
  gmBody('<p>讀取中…</p>');
  f.db.collection('gameConfig').doc('designerShop').get().then(function(c){ return c.exists ? (c.data() || {}) : {}; }, function(){ return {}; }).then(function(cfg){
    S.gmShopCfg = cfg;
    return f.db.collection('designShopItems').get().then(function(q){
      var a = [];
      q.forEach(function(d){ var o = d.data(); o._id = d.id; a.push(o); });
      a.sort(function(p, q2){ return tsMs(q2.at) - tsMs(p.at); });
      S.gmShopL = a;
      return f.db.collection('designSales').get().then(function(q2){ var n = {}; q2.forEach(function(d){ var o = d.data() || {}; n[o.item] = (n[o.item] | 0) + 1; }); return n; }, function(){ return null; });
    }).then(function(sold){ gmShopPaint(sold); });
  })['catch'](function(e){ gmBody('<p>讀取失敗(' + esc(e && e.code) + ')</p>'); });
}
function gmShopPaint(sold){
  var a = S.gmShopL || [], cfg = S.gmShopCfg || {}, roy = (cfg.roy == null ? 20 : (cfg.roy | 0)), h = '', i, x, pr;
  h += '<div style="display:flex;flex-wrap:wrap;gap:1vmin;align-items:center;margin-bottom:1.4vmin;padding:1vmin 1.4vmin;background:#f6f1ff;border-radius:1.4vmin">💰 設計者分紅:別人買下作品時,原設計者拿售價的 <input type="text" id="dsg-roy" value="' + roy + '" style="width:8vmin;text-align:center"> %(0~50,登入大對抗自動入帳) <button class="dsg-b go" data-sroy="1">💾 存</button></div>';
  if(!a.length){ gmBody(h + '<p>還沒有上架的作品。到「📦 倉庫」按「✅ 通過上架」。</p>'); return; }
  h += '<div class="dsg-gl">';
  for(i = 0; i < a.length; i++){ x = a[i]; pr = x.price || {};
    h += '<div class="dsg-gc"' + (x.on === false ? ' style="opacity:.6"' : '') + '><div class="im">' + (x.img ? '<img src="' + esc(x.img) + '">' : '<span style="font-size:1.8vmin;color:#c0392b">沒有全身圖</span>') + '</div>' +
      '<b>' + D.KINDS[x.kind].e + ' ' + esc(x.title || '') + '</b><br>筆名 ' + esc(x.pen || '') + ' ・ ★' + (x.star | 0) + ' ・ 已售 ' + (sold ? (sold[x._id] | 0) : '—') + (x.lim ? ' / 限量 ' + x.lim : '') + '<br>' +
      (x.on === false ? '<span style="color:#c0392b">⛔ 已下架</span>' : '<span style="color:#1e8449">🟢 上架中</span>') +
      '<div style="display:flex;gap:.8vmin;margin-top:.8vmin;align-items:center;font-size:2vmin">💰<input type="text" data-pc="' + i + '" value="' + (pr.coin | 0) + '" style="width:12vmin">' + (x.kind === 'deco' ? '🐚<input type="text" data-ps="' + i + '" value="' + (pr.shell | 0) + '" style="width:9vmin">' : '') + '</div>' +
      '<div class="row"><button class="dsg-b go" data-sp="' + i + '">💾 改價格</button><button class="dsg-b ghost" data-on="' + i + '">' + (x.on === false ? '🟢 重新上架' : '⛔ 下架') + '</button>' + (!x.img && x.kind === 'skin' ? '<button class="dsg-b ghost" data-fix="' + i + '">📥 補全身圖</button>' : '') + '</div></div>'; }
  h += '</div>';
  var b = gmBody(h);
  if(!b) return;
  b.onclick = function(ev){
    var t = ev.target, f = fb(), F = FV(), u = user(), k, x2, n, n2, ref;
    if(!t || !t.getAttribute || !f) return;
    if(t.getAttribute('data-sroy')){ n = parseInt($('dsg-roy').value, 10); if(!(n >= 0 && n <= 50)){ toast('分紅要 0~50'); return; }
      f.db.collection('gameConfig').doc('designerShop').set({ roy: n, updatedAt: now(), updatedBy: u.email }, { merge: true }).then(function(){ S.gmShopCfg.roy = n; toast('✅ 分紅改成 ' + n + '%'); }, function(e){ toast('寫入失敗:' + (e && e.code)); }); return; }
    k = t.getAttribute('data-sp'); if(k != null){ x2 = S.gmShopL[+k]; n = parseInt((b.querySelector('[data-pc="' + k + '"]') || {}).value, 10); n2 = b.querySelector('[data-ps="' + k + '"]');
      if(!(n >= 0 && n <= 9999999)){ toast('價格要是 0 以上的整數'); return; }
      var up = { 'price.coin': n, prAt: F.serverTimestamp(), prBy: u.email }; if(n2){ up['price.shell'] = Math.max(0, parseInt(n2.value, 10) || 0); }
      f.db.collection('designShopItems').doc(x2._id).update(up).then(function(){ x2.price = x2.price || {}; x2.price.coin = n; toast('✅ 「' + x2.title + '」改成 ' + n + ' 知識幣'); }, function(e){ toast('寫入失敗:' + (e && e.code)); }); return; }
    k = t.getAttribute('data-on'); if(k != null){ x2 = S.gmShopL[+k]; n = x2.on === false;
      f.db.collection('designShopItems').doc(x2._id).update({ on: n }).then(function(){ x2.on = n; gmShopPaint(sold); toast(n ? '🟢 已重新上架' : '⛔ 已下架(買過的同學照樣可以穿)'); }, function(e){ toast('寫入失敗:' + (e && e.code)); }); return; }
    k = t.getAttribute('data-fix'); if(k != null){ x2 = S.gmShopL[+k];
      f.db.collection('designSubmit').doc(x2._id).get().then(function(d){ var th = d.exists ? (d.data() || {}).th : ''; if(!th){ toast('找不到繳交時的圖'); return null; } return f.db.collection('designShopItems').doc(x2._id).update({ img: th }).then(function(){ x2.img = th; gmShopPaint(sold); toast('✅ 補好了(這是舊版縮圖,比較小;要清楚的全身圖請學生重新繳交)'); }); })['catch'](function(e){ toast('失敗:' + (e && e.code)); }); return; }
  };
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
  _t: { S: S, wordHits: wordHits, qualityStats: qualityStats, renderComposite: renderComposite, ymOf: ymOf, norm: norm, newWork: newWork, editorOpen: editorOpen, plsJoin: plsJoin, subIdOf: subIdOf } };
})();
