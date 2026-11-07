/* ══════════════════════════════════════════════════════════════════════════
 * 🎨 創藝工坊 引擎 minigame_art.js(ES5 only — 無箭頭函式/let/const/樣板字面值/?.)
 * 由 minigame_index.html?mode=art 直入時「才」載入(不進小遊戲大廳、不拖慢荒島與 15 款小遊戲)。
 * 小遊戲本體的登入/Firebase/對話框透過 window.MG_ART_BRIDGE 取得(本體程式在 IIFE 裡,不直接碰 MG)。
 * 設計書:claude/視覺藝術合作遊戲_設計書.md v0.9;交接:claude/創藝工坊_MEMORY_HANDOFF.md
 *
 * ★ v1.1.1(2026-11-04・老師「音樂音效流暢度都做好了嗎?」→「找現有適合的來用就好」)— 借用小遊戲現有 BGM:村子 寵物小屋、關卡 知識王問答、
 *   畫布 自訂角色名片、比賽 知識王問答(1)、過關 Win(⚙ 可關,音量跟小遊戲設定);音效補:建造 能力上升/煙火、大師卡與每日挑戰 成就獎章、
 *   選筆刷 選擇中、回工坊 取消、教學卡 知識化為力量、比賽開始 進入戰鬥畫面、最後 10 秒倒數、自動交件、公布結果 煙火;
 *   省電模式再加:畫布不用 2 倍解析度、村子停常駐動畫。
 * ★ v1.1.0(2026-11-04・老師「優化清單開始全部做」22 項)
 *   存檔:①永久帳本 artPlayers/{uid}/ledger(create-only)②「今天」改用伺服器時間(HTTP Date 對時+寫入帶 serverTimestamp)
 *         ③作品/草稿備份到 Firebase Storage artWorks/{uid}/ ④每日積分改每台裝置分格 pd[日][裝置] 再加總
 *   流暢:⑤舊平板自動開省電畫布 ⑥非作用圖層預先合成上下兩張快取 ⑦復原只記筆畫範圍(步數 40/省電 20)⑧村子彩色/黑白兩張疊圖淡入
 *   回饋:⑨拖曳落點亮框 ⑩看圖判斷答錯兩次淡掉錯的+教學卡 ⑪星星逐顆亮/資源跳數字/建造處閃光 ⑫按壓效果+防連點
 *   公平:⑬題目與選項打亂 ⑭rules 擋異常(另附補丁)⑮比賽限時用伺服器時間、評分先隱藏作者 ⑯沒主角最多 2★ ⑰班級榜最低人數
 *   耐玩:⑱關卡內容隨機 ⑲每日挑戰 ⑳每週主題+作品牆 ㉑大師卡/貼紙/特殊筆刷/裝飾/擺設 ㉒四座新工坊(媒材/鑑賞/藝術史/大師)
 * ★ v1.0.3(2026-11-04・老師「每個關卡和主題都寫遊玩說明…」「刪除圖層、調整圖層順序也改成能復原」)— 各關第一次自動跳遊玩說明(tut.h_<關卡>)、關卡/工坊/畫布右上 ❓;
 *   畫布復原改成動作紀錄(筆畫/刪圖層/調順序/新增圖層都能復原、重做)。
 * ★ v1.0.2(2026-11-04・老師「GM 也設創藝工坊開關和相關設定」)— 讀雲端 gameConfig/artAccess {open,guest,allWs,dailyCap}(主程式 GM 選單「🎨 創藝工坊 開放設定」寫入);
 *   共用快取 lxps_art_access_cache(同 origin,主程式首頁入口也讀);讀不到雲端與快取才退回 D.OPEN。
 * ★ v1.0.1(2026-11-04・老師「有變動才寫、合併存檔」)— 雲端只在有變動時才寫(A.dv/A.cleanDv);過關/建造/教學 8 秒內合併成一次寫入;切背景/離開沒變動就不寫。
 * ★ v1.0.0(2026-11-04)第一階段「單人可玩」:
 *   藝術村(個人恢復度)+四座工坊 22 關(10 種玩法)+創作畫布基本版(PC 繪圖板/滑鼠/快捷鍵)+
 *   星數/資源/藝術積分+雲端存檔 artPlayers/{uid}+新手教學前三段。
 *
 * 共用平板安全(設計書第十七節):
 *   ①身分只認 Firebase uid(bridge.user().uid);每次寫雲端前比對 A.uid,不一致就擋。
 *   ②存檔合併:星數取最大、建造/教學已讀取聯集、每日積分取最大 ⇒ 家裡/學校兩台互不覆蓋;
 *     資源不另存,一律由「星數推算 − 建造花費」⇒ 不會因為合併而變多或變少。
 *   ③本機快取以 uid 為鍵(art_save_<uid>),只在雲端寫入成功後標記 synced;
 *     登出時已同步的快取刪掉,沒同步的留著等同一位學生下次登入再補送;絕不讀別人 uid 的快取。
 *   ④訪客(未登入)只存本機 art_save_guest,永不匯入帳號、不上雲。
 *   ⑤畫布草稿存 IndexedDB,鍵帶 uid;畫室只列出目前 uid 的作品。
 * ══════════════════════════════════════════════════════════════════════════ */
(function(){
'use strict';
if(window.ARTW) return;
var ART_VER = 'v1.1.4';   /* ★ v1.1.4(2026-11-07)— 下方 dock 多一顆「✏️ 設計師」:存好進度後前往遊戲美術設計師工作室(?mode=designer&from=art,離開時回創藝工坊) */   void 'v1.1.3';   /* ★ v1.1.3(2026-11-05・老師「改好後也幫我自動更新到Repo」)— 修檢查報告 v1.1.1:轉盤換題卡死、拖曳殘影、長按吸到白色、草稿壞圖層、答對連點跳題、滑桿看不到、縮放多蓋貼紙、教學蓋確認框、背景視窗蓋視窗、安全區、名牌圈太近、畫室草稿、擺設被重畫、構圖物件互疊、pointercancel、Shift 橡皮擦 */   void 'v1.1.2';   /* ★ v1.1.2(2026-11-05・老師「班級座號還是舊版的」)— 名字一律用目前名冊班級座號(小遊戲本體 mgPlayerFull,名冊讀不到退回 Google 帳號名) */
var D = window.ART_DB;
var B = window.MG_ART_BRIDGE || {};
var A = { on: false, uid: '', guest: true, save: null, screen: 'hub', style: 'c', lite: false, wt: 0, syncing: false, lv: null, cv: null, led: [], evs: [], gm: null };

/* ── 小工具 ── */
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function toast(m){ try{ if(B.toast) B.toast(m); }catch(e){} }
function sfx(id, v){ try{ if(B.sfx) B.sfx(id, v); }catch(e){} }
function user(){ try{ return B.user ? B.user() : null; }catch(e){ return null; } }
function uName(u){ var n = ''; if(!u) return ''; try{ if(window.mgPlayerFull) n = window.mgPlayerFull(u) || ''; }catch(e){} return n || u.displayName || u.email || ''; }   /* ★ v1.1.2 目前班級座號+姓名 */
/* ★ v1.1.1(老師「找現有適合的來用就好」)— 背景音樂借用小遊戲現有曲目(音量跟著學生在小遊戲設定的音樂音量;⚙ 可單獨關)
   村子=寵物小屋 BGM(溫和)、關卡=知識王問答、畫布=自訂角色名片(安靜適合畫畫)、比賽=知識王問答(1)(較緊湊)、過關=Win 一次 */
var BGM = { hub: 'bgm-pet-house', lv: 'bgm-play', cv: 'bgm-avatar-card', contest: 'bgm-king-challenge-2', win: 'bgm-result' };
function musicOn(){ return lsGet('art_bgm') !== '0'; }
function music(k){ if(!musicOn()){ try{ if(B.bgmStop) B.bgmStop(); }catch(e){} return; } A.mus = k; try{ if(B.bgm) B.bgm(BGM[k], null, k === 'win'); }catch(e2){} }
function musicStop(){ A.mus = ''; try{ if(B.bgmStop) B.bgmStop(); }catch(e){} }
function isGm(){ var u = user(); return !!(u && u.email && D.GM_EMAILS.indexOf(String(u.email).toLowerCase()) >= 0); }
function T(o){ if(!o) return ''; if(typeof o === 'string') return o; return (A.style === 'p' && o.p) ? o.p : (o.c || o.p || ''); }
function now(){ return Date.now(); }
/* ★ v1.1.0 第 2 項:「今天」用伺服器時間判斷,不信平板時鐘。
   對時來源:同網站 HEAD 請求的 HTTP Date 標頭(不花 Firestore 讀取);每 6 小時重對一次,快取在 art_srv_off。
   另外雲端存檔一律帶 srv: serverTimestamp()、帳本 at: serverTimestamp(),rules 再檢查每日積分只能寫在伺服器的這幾天。 */
var SRV = { off: 0, ok: false, at: 0 };
try{ (function(){ var o = JSON.parse(localStorage.getItem('art_srv_off') || 'null'); if(o && typeof o.off === 'number' && Date.now() - o.at < 6 * 3600000){ SRV.off = o.off; SRV.ok = true; SRV.at = o.at; } })(); }catch(_so){}
function srvNow(){ return now() + SRV.off; }
function srvSync(cb, force){
  var fin = false, t0 = now(), x;
  function done(){ if(fin) return; fin = true; if(cb) cb(SRV.ok); }
  if(SRV.ok && !force && now() - SRV.at < 6 * 3600000){ done(); return; }
  try{
    x = new XMLHttpRequest(); x.open('HEAD', 'minigame_art_db.js?srv=' + t0, true); x.timeout = 4000;
    x.onload = function(){ var d = Date.parse(x.getResponseHeader('Date') || ''), t1 = now();
      if(d > 1.6e12){ SRV.off = Math.round(d + 500 - (t0 + t1) / 2); SRV.ok = true; SRV.at = t1; try{ localStorage.setItem('art_srv_off', JSON.stringify({ off: SRV.off, at: t1 })); }catch(e){} } done(); };
    x.onerror = x.ontimeout = done; x.send();
  }catch(e){ done(); }
}
/* ★ v1.1.0 第 4 項:裝置編號(每台平板一個,與帳號無關);每日積分 pd[日][裝置] 分格記再加總 */
var DEV = (function(){ var k = 'art_dev', v = null; try{ v = localStorage.getItem(k); }catch(e){} if(!v || !/^d[0-9a-z]{6,10}$/.test(v)){ v = 'd' + Math.random().toString(36).slice(2, 9); try{ localStorage.setItem(k, v); }catch(e2){} } return v; })();
function dayKey(t){ var d = new Date((t || srvNow()) + 8 * 3600000); return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate(); }
function dayAdd(k, n){ var y = Math.floor(k / 10000), m = Math.floor(k / 100) % 100, d = k % 100; return dayKey(Date.UTC(y, m - 1, d, 4) + n * 86400000); }   /* UTC 04:00 = 台北中午,前後挪 n 天都不會跨錯日 */
/* 週鍵:以週一 08:00(台北)為一週開始(與小博士/祈願同一個結算點) */
function weekKey(t){ var d = new Date(t || srvNow()), dow = (d.getUTCDay() + 6) % 7, mon = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - dow)); return mon.getUTCFullYear() * 10000 + (mon.getUTCMonth() + 1) * 100 + mon.getUTCDate(); }   /* 台北週一 08:00 = UTC 週一 00:00,所以直接用 UTC 日期找週一 */
function clamp(v, a, b){ return v < a ? a : (v > b ? b : v); }
function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }
function lsDel(k){ try{ localStorage.removeItem(k); }catch(e){} }
function wsDef(id){ var i; for(i = 0; i < D.WORKSHOPS.length; i++){ if(D.WORKSHOPS[i].id === id) return D.WORKSHOPS[i]; } return null; }
function buildDef(id){ var i; for(i = 0; i < D.BUILDS.length; i++){ if(D.BUILDS[i].id === id) return D.BUILDS[i]; } return null; }

/* ══ 存檔 ══ */
/* ★ v1.1.0 新欄位:
   pd  { 日: { 裝置: 分 } }   每台裝置分格的每日積分(第 4 項);pts[日] = min(5000, Σ 各裝置) 與舊版 pts 取大
   dq  { '日_挑戰id': 1 }     每日挑戰完成(第 19 項,永久保留 ⇒ 資源推算穩定);dp { 日: { 挑戰id: 進度 } } 只留 3 天
   ev  { 活動id: 積分 }        比賽/每週主題領到的積分(不受每日上限);ej { 活動id: 1 } 交過件的活動(回來領獎用)
   pos { 裝飾id: [x, y, t] }   村子擺設位置(第 21 項,時間新的勝);pen { n: 筆名, t: 時間 } */
function blank(uid){ return { uid: uid, v: 0, at: 0, stars: {}, first: {}, builds: {}, tut: {}, pts: {}, pd: {}, dq: {}, dp: {}, ev: {}, ej: {}, pos: {}, pen: { n: '', t: 0 } }; }
function isObj(o){ return !!o && typeof o === 'object'; }
function norm(s, uid){
  var o = blank(uid), k, k2, today = dayKey(), keepPd = dayAdd(today, -14), keepDp = dayAdd(today, -3), n;
  if(!isObj(s)) return o;
  o.v = s.v | 0; o.at = +s.at || 0;
  for(k in (s.stars || {})){ if(s.stars.hasOwnProperty(k) && D.LEVELS[k]) o.stars[k] = clamp(s.stars[k] | 0, 0, 3); }
  for(k in (s.first || {})){ if(s.first.hasOwnProperty(k)) o.first[k] = +s.first[k] || 1; }
  for(k in (s.builds || {})){ if(s.builds.hasOwnProperty(k) && buildDef(k)) o.builds[k] = +s.builds[k] || 1; }
  for(k in (s.tut || {})){ if(s.tut.hasOwnProperty(k)) o.tut[k] = 1; }
  for(k in (s.pts || {})){ if(s.pts.hasOwnProperty(k) && /^\d{8}$/.test(k)) o.pts[k] = clamp(s.pts[k] | 0, 0, 5000); }
  if(isObj(s.pd)) for(k in s.pd){ if(!s.pd.hasOwnProperty(k) || !/^\d{8}$/.test(k) || +k < keepPd || !isObj(s.pd[k])) continue; o.pd[k] = {};
    for(k2 in s.pd[k]){ if(s.pd[k].hasOwnProperty(k2) && /^d[0-9a-z]{6,10}$/.test(k2)) o.pd[k][k2] = clamp(s.pd[k][k2] | 0, 0, 5000); } }
  if(isObj(s.dq)) for(k in s.dq){ if(s.dq.hasOwnProperty(k) && /^\d{8}_[a-z0-9]+$/.test(k)) o.dq[k] = 1; }
  if(isObj(s.dp)) for(k in s.dp){ if(!s.dp.hasOwnProperty(k) || !/^\d{8}$/.test(k) || +k < keepDp || !isObj(s.dp[k])) continue; o.dp[k] = {};
    for(k2 in s.dp[k]){ if(s.dp[k].hasOwnProperty(k2)) o.dp[k][k2] = clamp(s.dp[k][k2] | 0, 0, 99); } }
  if(isObj(s.ev)) for(k in s.ev){ if(s.ev.hasOwnProperty(k) && /^e\d{8}[a-z0-9]{3,8}$/.test(k)) o.ev[k] = clamp(s.ev[k] | 0, 0, 200); }
  if(isObj(s.ej)) for(k in s.ej){ if(s.ej.hasOwnProperty(k) && /^e\d{8}[a-z0-9]{3,8}$/.test(k)) o.ej[k] = 1; }
  if(isObj(s.pos)) for(k in s.pos){ if(s.pos.hasOwnProperty(k) && buildDef(k) && s.pos[k] && s.pos[k].length === 3) o.pos[k] = [clamp(+s.pos[k][0] || 0, 20, 1580), clamp(+s.pos[k][1] || 0, 120, 880), +s.pos[k][2] || 0]; }
  if(isObj(s.pen) && typeof s.pen.n === 'string') o.pen = { n: penOk(s.pen.n) ? s.pen.n : '', t: +s.pen.t || 0 };
  for(k in o.pd){ if(o.pd.hasOwnProperty(k)){ n = pdSum(o.pd[k]); if(n > (o.pts[k] | 0)) o.pts[k] = n; } }
  return o;
}
function pdSum(m){ var t = 0, k; for(k in m){ if(m.hasOwnProperty(k)) t += m[k] | 0; } return Math.min(5000, t); }
/* 兩份存檔合併(順序無關、可重複套用):家裡與學校兩台同時玩也不會互相蓋掉
   ★ v1.1.0 每日積分不再取兩邊最大值(會少算另一台的),改成「各裝置取最大、再加總」 */
function merge(a, b, uid){
  var o = blank(uid), k, k2, src = [a, b], i, s, n;
  for(i = 0; i < 2; i++){ s = src[i]; if(!s) continue;
    o.v = Math.max(o.v, s.v | 0); o.at = Math.max(o.at, +s.at || 0);
    for(k in s.stars){ if(s.stars.hasOwnProperty(k)) o.stars[k] = Math.max(o.stars[k] || 0, s.stars[k] | 0); }
    for(k in s.first){ if(s.first.hasOwnProperty(k)) o.first[k] = o.first[k] ? Math.min(o.first[k], s.first[k]) : s.first[k]; }
    for(k in s.builds){ if(s.builds.hasOwnProperty(k)) o.builds[k] = o.builds[k] ? Math.min(o.builds[k], s.builds[k]) : s.builds[k]; }
    for(k in s.tut){ if(s.tut.hasOwnProperty(k)) o.tut[k] = 1; }
    for(k in s.pts){ if(s.pts.hasOwnProperty(k)) o.pts[k] = Math.max(o.pts[k] || 0, s.pts[k] | 0); }
    for(k in (s.pd || {})){ if(!s.pd.hasOwnProperty(k)) continue; if(!o.pd[k]) o.pd[k] = {}; for(k2 in s.pd[k]){ if(s.pd[k].hasOwnProperty(k2)) o.pd[k][k2] = Math.max(o.pd[k][k2] || 0, s.pd[k][k2] | 0); } }
    for(k in (s.dq || {})){ if(s.dq.hasOwnProperty(k)) o.dq[k] = 1; }
    for(k in (s.dp || {})){ if(!s.dp.hasOwnProperty(k)) continue; if(!o.dp[k]) o.dp[k] = {}; for(k2 in s.dp[k]){ if(s.dp[k].hasOwnProperty(k2)) o.dp[k][k2] = Math.max(o.dp[k][k2] || 0, s.dp[k][k2] | 0); } }
    for(k in (s.ev || {})){ if(s.ev.hasOwnProperty(k)) o.ev[k] = Math.max(o.ev[k] || 0, s.ev[k] | 0); }
    for(k in (s.ej || {})){ if(s.ej.hasOwnProperty(k)) o.ej[k] = 1; }
    for(k in (s.pos || {})){ if(s.pos.hasOwnProperty(k) && (!o.pos[k] || s.pos[k][2] > o.pos[k][2])) o.pos[k] = s.pos[k].slice(); }
    if(s.pen && (+s.pen.t || 0) >= o.pen.t && s.pen.n) o.pen = { n: s.pen.n, t: +s.pen.t || 0 };
  }
  for(k in o.pd){ if(o.pd.hasOwnProperty(k)){ n = pdSum(o.pd[k]); if(n > (o.pts[k] | 0)) o.pts[k] = n; } }
  return o;
}
/* ★ v1.1.0 加積分(每日上限由「全部裝置加總」判斷,記在本機裝置那一格) */
function ptsAdd(n){
  var today = String(dayKey()), s = A.save, room, add;
  if(!s.pd[today]) s.pd[today] = {};
  room = Math.max(0, capNow() - (s.pts[today] | 0)); add = Math.min(Math.max(0, n | 0), room);
  if(add <= 0) return 0;
  s.pd[today][DEV] = (s.pd[today][DEV] | 0) + add;
  s.pts[today] = Math.max(s.pts[today] | 0, pdSum(s.pd[today]));
  return add;
}
function dailyDef(id){ var i; for(i = 0; i < D.DAILY.length; i++){ if(D.DAILY[i].id === id) return D.DAILY[i]; } return null; }
/* 資源 = 各關最佳星數推算 + 每日挑戰獎勵 − 建造花費 */
function resEarned(s){
  var r = { paint: 0, idea: 0, mat: 0 }, k, L, W, j, n, dd, c;
  for(k in s.stars){ if(!s.stars.hasOwnProperty(k)) continue; L = D.LEVELS[k]; if(!L) continue; W = wsDef(L.ws); if(!W) continue; n = (s.stars[k] | 0) * L.diff * D.RES_K;
    for(j = 0; j < W.res.length; j++) r[W.res[j]] += n; }
  for(k in (s.dq || {})){ if(!s.dq.hasOwnProperty(k)) continue; dd = dailyDef(k.split('_')[1]); if(!dd) continue; for(c in dd.r){ if(dd.r.hasOwnProperty(c)) r[c] += dd.r[c]; } }
  return r;
}
function resNow(){
  var s = A.save, r = resEarned(s), k, b, c;
  for(k in s.builds){ if(!s.builds.hasOwnProperty(k)) continue; b = buildDef(k); if(!b) continue; for(c in b.cost){ if(b.cost.hasOwnProperty(c)) r[c] -= b.cost[c]; } }
  return r;
}
function restorePct(){ var s = A.save, p = 0, k, b; for(k in s.builds){ if(s.builds.hasOwnProperty(k)){ b = buildDef(k); if(b) p += b.pct; } } return clamp(p, 0, 100); }
function weekPts(s){ var wk = weekKey(), k, t = 0, d, y; s = s || A.save; for(k in s.pts){ if(!s.pts.hasOwnProperty(k)) continue; d = parseInt(k, 10); y = Math.floor(d / 10000);
    if(weekKey(Date.UTC(y, Math.floor(d / 100) % 100 - 1, d % 100, 4)) === wk) t += s.pts[k]; }
  for(k in (s.ev || {})){ if(!s.ev.hasOwnProperty(k)) continue; d = parseInt(k.slice(1, 9), 10); y = Math.floor(d / 10000);   /* ★ v1.1.0 比賽/主題獎勵(活動 id 帶開始日期)算進那一週 */
    if(weekKey(Date.UTC(y, Math.floor(d / 100) % 100 - 1, d % 100, 4)) === wk) t += s.ev[k]; }
  return t; }
function totalStars(s){ var t = 0, k; s = s || A.save; for(k in s.stars){ if(s.stars.hasOwnProperty(k)) t += s.stars[k] | 0; } return t; }
/* 大師卡:那座工坊每一關都 3★ */
function hasCard(ws, s){ var a = D.WS_LEVELS[ws] || [], i; s = s || A.save; if(!a.length) return false; for(i = 0; i < a.length; i++){ if((s.stars[a[i]] | 0) < 3) return false; } return true; }
function cardCount(){ var n = 0, k; for(k in D.CARDS){ if(D.CARDS.hasOwnProperty(k) && hasCard(k)) n++; } return n; }
function penOk(n){ var i, j; for(i = 0; i < D.PEN_A.length; i++){ for(j = 0; j < D.PEN_B.length; j++){ if(String(n).indexOf(D.PEN_A[i] + D.PEN_B[j]) === 0 && /^\d{2}$/.test(String(n).slice((D.PEN_A[i] + D.PEN_B[j]).length))) return true; } } return false; }
function hashStr(s){ var h = 2166136261, i; s = String(s); for(i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul ? Math.imul(h, 16777619) : (h * 16777619) | 0; } return h >>> 0; }
function rng(seed){ var x = seed >>> 0 || 1; return function(){ x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
function penOf(s){ s = s || A.save; if(s && s.pen && s.pen.n) return s.pen.n; var h = hashStr(A.uid || 'guest'); return D.PEN_A[h % D.PEN_A.length] + D.PEN_B[(h >>> 5) % D.PEN_B.length] + (10 + (h >>> 9) % 90); }
function clearedIn(ws){ var a = D.WS_LEVELS[ws] || [], i, n = 0; for(i = 0; i < a.length; i++){ if((A.save.stars[a[i]] | 0) > 0) n++; } return n; }
function wsOpen(W){ if(isGm()) return true; var _c = accCfg(); if(_c && _c.allWs === true) return true; if(!W.need) return true; return clearedIn(W.need.ws) >= W.need.n; }

/* ══ ★ v1.0.2 GM 開關與設定:gameConfig/artAccess = { open, guest, allWs, dailyCap, updatedAt, updatedBy } ══
   open    true=開放給學生(false=只有 GM);guest true=未登入訪客也能玩(進度只存這台)
   allWs   true=四座工坊直接全開(不用依序過關);dailyCap 每日排行積分上限(50~5000,沒設=ART_DB.DAILY_CAP)
   ⚠ 讀不到雲端(未登入訪客沒有讀取權限/離線)⇒ 用快取(14 天)⇒ 再沒有才用 D.OPEN(預設關),寧可多擋。 */
var ART_ACC_KEY = 'lxps_art_access_cache', ART_ACC_TTL = 14 * 86400000;
function accCacheRead(){ try{ var o = JSON.parse(lsGet(ART_ACC_KEY) || 'null'); if(o && o.cfg && typeof o.cfg === 'object' && o.at && now() - o.at < ART_ACC_TTL) return o.cfg; }catch(e){} return null; }
function accCacheWrite(c){ try{ if(c && typeof c === 'object') lsSet(ART_ACC_KEY, JSON.stringify({ cfg: c, at: now() })); }catch(e){} }
function accCfg(){ return A.cfg || accCacheRead(); }
function artOpen(){ var c = accCfg(); if(c && typeof c.open === 'boolean') return c.open; return !!D.OPEN; }
function guestOk(){ var c = accCfg(); return !!(c && c.guest === true); }
function capNow(){ var c = accCfg(), v = c ? +c.dailyCap : 0; return (v >= 50 && v <= 5000) ? Math.round(v) : D.DAILY_CAP; }
/* 進場前讀一次雲端(最多等 3 秒;讀不到就用快取/預設,不卡學生) */
function accFetch(cb){
  var fb = B.fbNow ? B.fbNow() : null, done = false, t;
  function fin(){ if(done) return; done = true; clearTimeout(t); cb(); }
  if(!fb || !fb.db){ fin(); return; }
  t = setTimeout(fin, 3000);
  try{ fb.db.collection('gameConfig').doc('artAccess').get().then(function(d){ if(d && d.exists){ A.cfg = d.data() || null; accCacheWrite(A.cfg); } fin(); })['catch'](function(){ fin(); }); }catch(e){ fin(); }
}
/* 'ok' / 'closed'(只有 GM)/ 'login'(開放但不收訪客) */
function accessCheck(u){ if(u && isGm()) return 'ok'; if(!artOpen()) return 'closed'; if(!u && !guestOk()) return 'login'; return 'ok'; }
function localKey(uid){ return 'art_save_' + (uid || 'guest'); }
function localLoad(uid){ var o = null; try{ o = JSON.parse(lsGet(localKey(uid)) || 'null'); }catch(e){} if(!o || (o.uid && o.uid !== uid)) return null; return o; }
function localWrite(synced){ if(!A.save) return; var o = JSON.parse(JSON.stringify(A.save)); o.synced = synced ? 1 : 0; lsSet(localKey(A.uid), JSON.stringify(o)); }
function ownerOk(){ if(A.guest) return !user(); var u = user(); return !!(u && u.uid === A.uid); }

function cloudRef(uid){ var fb = B.fbNow ? B.fbNow() : null; return fb ? fb.db.collection('artPlayers').doc(uid) : null; }
/* 雲端寫入:transaction 讀 → 合併 → 寫回(v+1)。只在本人登入中才寫。 */
/* ★ v1.0.1(老師「有變動才寫、合併存檔」)— 節省 Firestore 寫入:
   A.dv = 本機變動計數(markDirty 加 1)、A.cleanDv = 已確定寫上雲端時的計數;兩者相等 = 沒有新變動 ⇒ 不寫。
   過關/建造/教學已讀都走 saveSoon:先寫本機,8 秒內連續的變動合併成一次雲端寫入;
   切到背景、離開、換人前的 flush 只在有變動時才寫。 */
var SAVE_MERGE_MS = 8000;
function markDirty(){ A.dv = (A.dv | 0) + 1; }
function isDirty(){ return (A.dv | 0) !== (A.cleanDv | 0); }
/* ══ ★ v1.1.0 第 1 項:永久帳本 artPlayers/{uid}/ledger/{自動id}(create-only,連 GM 都不能改/刪)
   每次過關/建造/每日挑戰/活動領獎都排一頁,和存檔「同一個 transaction」寫上去(要嘛一起成功、要嘛一起重來);
   頁面 at = serverTimestamp()(rules 檢查 == request.time)⇒ 時間無法偽造。排隊中的頁存本機 art_led_<uid>,換人不混。 */
var LED_MAX = 300, LED_PER_TX = 20;
function ledKey(uid){ return 'art_led_' + (uid || A.uid); }
function ledLoad(){ A.led = []; if(A.guest) return; try{ var a = JSON.parse(lsGet(ledKey()) || '[]'); if(a && a.length) A.led = a; }catch(e){} }
function ledSave(){ if(!A.guest && A.uid) lsSet(ledKey(), JSON.stringify(A.led || [])); }
function ledAdd(k, o){
  if(A.guest || !A.uid) return;
  o = o || {};
  var e = { k: k, id: String(o.id || '').slice(0, 40), st: clamp(o.st | 0, 0, 3), g: clamp(o.g | 0, -5000, 5000), r: {}, day: String(o.day || dayKey()), cl: now() }, c;
  for(c in (o.r || {})){ if(o.r.hasOwnProperty(c) && D.RES[c]) e.r[c] = o.r[c] | 0; }
  A.led.push(e); if(A.led.length > LED_MAX) A.led.splice(0, A.led.length - LED_MAX);
  ledSave();
}
function FV(){ try{ return window.firebase.firestore.FieldValue; }catch(e){ return null; } }
/* rules 只接受伺服器日期的「前 7 天~後 1 天」這幾格每日積分被改動;其他格沿用雲端原值(離線很久的平板也不會卡住存檔) */
function ptsWindow(){ var t = dayKey(), a = [], i; for(i = -7; i <= 1; i++) a.push(String(dayAdd(t, i))); return a; }
function ptsSanitize(m, cloud){
  var w = ptsWindow(), k, cv;
  for(k in m.pts){ if(!m.pts.hasOwnProperty(k)) continue; cv = cloud && cloud.pts.hasOwnProperty(k) ? cloud.pts[k] : null;
    if(cv === m.pts[k]) continue;
    if(w.indexOf(String(k)) < 0){ if(cv == null) delete m.pts[k]; else m.pts[k] = cv; } }
}
/* 給雲端的版本:只留 rules 白名單欄位 */
function cloudDoc(m, uid){
  var u = user(), o = { uid: uid, v: m.v | 0, at: now(), name: String(uName(u)).slice(0, 60), ver: ART_VER,
    stars: m.stars, first: m.first, builds: m.builds, tut: m.tut, pts: m.pts, pd: m.pd, dq: m.dq, dp: m.dp, ev: m.ev, ej: m.ej, pos: m.pos, pen: m.pen }, f = FV();
  if(f) o.srv = f.serverTimestamp();
  return o;
}
/* 班級(排行用):讀主程式名冊 ../student_roster.js 的 class 欄位;只拿班級字串,不顯示任何個資。快取在 art_cls_<uid> */
function clsOf(){ var u = user(), em = u && u.email ? String(u.email).toLowerCase() : '', r, c = lsGet('art_cls_' + A.uid);
  if(c != null) return c;
  try{ r = window._STUDENT_ROSTER && window._STUDENT_ROSTER[em]; }catch(e){}
  if(r && r.class){ c = String(r.class).replace(/[\/\s]/g, '').slice(0, 12); lsSet('art_cls_' + A.uid, c); return c; }
  return window._STUDENT_ROSTER ? '' : null; }
function rosterLoad(){ if(window._STUDENT_ROSTER || A.rosterTried) return; A.rosterTried = true; loadJs('../student_roster.js?v=' + dayKey(), function(){}); }
function loadJs(src, cb){ var s = document.createElement('script'), fin = false; function f(ok){ if(fin) return; fin = true; cb(ok); } s.src = src; s.async = true; s.onload = function(){ f(true); }; s.onerror = function(){ f(false); }; document.head.appendChild(s); setTimeout(function(){ f(false); }, 15000); }
function cloudSync(cb){
  if(A.guest || !A.uid){ if(cb) cb(true); return; }
  if(!isDirty() && !(A.led && A.led.length)){ if(cb) cb(true); return; }   /* 沒有新變動:不讀不寫 */
  if(!ownerOk()){ toast('帳號已經換人了,創藝工坊不會把進度寫到別人的帳號'); if(cb) cb(false); return; }
  var ref = cloudRef(A.uid), fb = B.fbNow ? B.fbNow() : null, uid = A.uid;
  if(!ref || !fb){ localWrite(false); if(cb) cb(false); return; }
  if(A.syncing){ A.syncAgain = true; if(cb) cb(true); return; }
  A.syncing = true;
  srvSync(function(){   /* ★ v1.1.0 先對時(6 小時內對過就直接過) */
  if(A.uid !== uid){ A.syncing = false; if(cb) cb(false); return; }
  var dvAt = A.dv | 0, lq = (A.led || []).slice(0, LED_PER_TX), f = FV(), wk = String(weekKey()), wp = weekPts(), cls = clsOf(), rankSent = lsGet('art_rk_' + uid + '_' + wk);
  fb.db.runTransaction(function(tx){
    return tx.get(ref).then(function(doc){
      var cloud = doc.exists ? norm(doc.data(), uid) : null, m = merge(A.save, cloud, uid), i, e, d;
      m.v = (m.v | 0) + 1;
      ptsSanitize(m, cloud);
      d = cloudDoc(m, uid);
      if(A.txLite === 2){ d = { uid: uid, v: d.v, at: d.at, name: d.name, ver: d.ver, stars: d.stars, first: d.first, builds: d.builds, tut: d.tut, pts: d.pts }; }   /* 舊版規則:只寫 v1.0 欄位(新欄位留在本機,規則更新後自動補上) */
      tx.set(ref, d);
      if(A.txLite){ lq = []; return m; }   /* 帳本/排行的規則還沒發布 ⇒ 這次只存主檔,存檔本身不受影響 */
      for(i = 0; i < lq.length && f; i++){ e = lq[i];
        tx.set(ref.collection('ledger').doc(), { uid: uid, at: f.serverTimestamp(), dev: DEV, ver: ART_VER, k: e.k, id: e.id, st: e.st, g: e.g, r: e.r, day: e.day, cl: e.cl }); }
      /* ★ v1.1.0 排行(第 17 項):本週積分有變才寫 artRank/{週}/u/{uid};有班級再寫 artRank/{週}/c/{班級}.m.{uid} */
      wp = weekPts(m);
      if(f && String(wp) !== rankSent){
        tx.set(fb.db.collection('artRank').doc(wk).collection('u').doc(uid), { uid: uid, w: wk, pen: penOf(m), cls: cls || '', p: wp, at: f.serverTimestamp() });
        if(cls){ var cm = {}; cm[uid] = wp; tx.set(fb.db.collection('artRank').doc(wk).collection('c').doc(cls), { w: wk, c: cls, at: f.serverTimestamp(), m: cm }, { merge: true }); }
      }
      return m;
    });
  }).then(function(m){
    A.syncing = false;
    if(A.uid !== uid) return;   /* 期間換帳號:結果不套到新的人身上 */
    A.save = merge(A.save, m, uid); A.save.v = m.v;
    if((A.dv | 0) === dvAt) A.cleanDv = dvAt;   /* 寫的期間又有新變動 ⇒ 仍算 dirty,等下一次 */
    if(lq.length){ A.led.splice(0, lq.length); ledSave(); }
    if(!A.txLite) lsSet('art_rk_' + uid + '_' + wk, String(wp));
    localWrite(!isDirty() && A.txLite !== 2);   /* 舊規則模式:新欄位只在本機,不可標成已同步(換人時才不會被清掉) */
    if(A.syncAgain || (A.led && A.led.length)){ A.syncAgain = false; if(isDirty() || A.led.length) saveSoon(true); }
    if(cb) cb(true);
  })['catch'](function(e){
    A.syncing = false; localWrite(false);
    try{ console.warn('[art sync]', e && e.message); }catch(_){}
    if(e && /permission/i.test(String(e.code || e.message)) && (A.txLite | 0) < 2 && A.uid === uid){ A.txLite = (A.txLite | 0) + 1; setTimeout(function(){ cloudSync(cb); }, 600); return; }   /* 先退一步:①不帶帳本/排行 ②只寫舊版欄位,存檔本身不會因為規則沒更新就停擺 */
    if(e && /permission/i.test(String(e.code || e.message)) && !A.permWarned){ A.permWarned = true; toast('☁ 雲端存檔被擋下了,進度先存在這台平板(請老師確認規則已更新)'); }
    if(cb) cb(false);
  });
  });
}
function saveSoon(noMark){ if(!noMark) markDirty(); localWrite(!isDirty()); var t = now(); if(!A.wt0) A.wt0 = t; clearTimeout(A.wt); A.wt = setTimeout(function(){ A.wt0 = 0; cloudSync(); }, Math.max(0, Math.min(SAVE_MERGE_MS, A.wt0 + 30000 - t))); }   /* 合併等待最多 30 秒(連續一直過關也會定期寫上去) */
function saveNow(){ clearTimeout(A.wt); A.wt0 = 0; localWrite(!isDirty()); cloudSync(); }   /* 只在有變動時才真的寫(cloudSync 內判斷) */

/* 讀檔:本機(同 uid)+ 雲端 合併 */
function loadFor(u, cb){
  A.guest = !u; A.uid = u ? u.uid : 'guest';
  var loc = localLoad(A.uid), uid = A.uid;
  A.save = norm(loc, uid);
  A.dv = (loc && !loc.synced) ? 1 : 0; A.cleanDv = 0;   /* 本機有上次沒送到的 ⇒ 算 dirty */
  A.txLite = 0; A.permWarned = false; ledLoad();   /* ★ v1.1.0 帳本排隊頁(只讀這個 uid 的) */
  if(A.guest){ cb(); return; }
  rosterLoad();
  var ref = cloudRef(uid);
  if(!ref){ cb(); return; }
  var done = false, wt = setTimeout(function(){ if(done) return; done = true; toast('📶 雲端還沒回應,先用這台的進度,連上後會自動合併'); cb(); }, 8000);
  ref.get().then(function(doc){
    if(done || A.uid !== uid){ return; }
    done = true; clearTimeout(wt);
    if(doc.exists) A.save = merge(A.save, norm(doc.data(), uid), uid);
    if(isDirty() || A.led.length) saveNow();   /* 上次沒送到的補送(含帳本) */
    cb();
  })['catch'](function(){ if(done) return; done = true; clearTimeout(wt); cb(); });
}

/* 帳號切換(小遊戲本體 onUser 呼叫):先把舊的人本機落地,已同步的快取刪掉,再換人重讀 */
function onUser(u){
  if(!A.on) return;
  var newUid = u ? u.uid : 'guest';
  if(newUid === A.uid) return;
  try{ if(A.save && A.uid){ var old = localLoad(A.uid); if(old && old.synced && !A.guest) lsDel(localKey(A.uid)); } }catch(e){}
  try{ if(A.cv && A.cv.close) A.cv.close(true); }catch(e){}
  try{ lvClose(true); }catch(e){}
  modalClose();
  A.save = null;
  var _st = accessCheck(u); if(_st !== 'ok'){ gate(_st); return; }   /* ★ v1.0.2 */
  A.evs = []; A.gm = null; A.dl = null; A.dlKey = '';
  loadFor(u, function(){ paintHub(); toast(u ? ('🎨 歡迎 ' + uName(u)) : '目前是訪客:進度只存在這台平板'); afterEnter(); });
}

/* ══ 樣式 ══ */
var CSS = [
'#art-root{position:fixed;inset:0;z-index:9000;overflow:hidden;background:#1d1828;color:#2b2335;font-family:"M PLUS Rounded 1c","Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;touch-action:manipulation}',
'#art-root,#art-modal,#art-tut,#art-cv{--line:#3a2f45;--paper:#fff9ef;--accent:#ff7a59;--yellow:#ffd93b}',
'#art-modal .abtn,#art-tut .abtn{border:.45vmin solid #3a2f45;border-radius:2.2vmin;padding:1vmin 2.2vmin;font-weight:900;font-size:2.5vmin;background:#fff;box-shadow:0 .5vmin 0 rgba(0,0,0,.3);cursor:pointer;color:#2b2335;font-family:inherit}#art-modal .abtn.go,#art-tut .abtn.go{background:#ffd93b}#art-modal .abtn.ghost,#art-tut .abtn.ghost{background:#efe9f3}#art-modal .abtn:disabled{opacity:.45}',
'#art-modal,#art-tut{font-family:"M PLUS Rounded 1c","Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif}',
'#art-root *{box-sizing:border-box}',
'html.art-mode #toast{z-index:9900 !important;font-size:max(17px,2.6vmin)}html.art-mode #loading{z-index:9800 !important}html.art-mode #page-home,html.art-mode #topbar{display:none !important}',
'#art-root .vil{position:absolute;inset:0}',
/* ★ v1.1.4 藝術村地圖首頁(三平台:contain 等比,兩側模糊補邊;入口標籤字級隨地圖寬) */
'#art-root .vmap{background:#2b2335 center/cover no-repeat}#art-root .vmap::before{content:"";position:absolute;inset:0;backdrop-filter:blur(14px) brightness(.55);-webkit-backdrop-filter:blur(14px) brightness(.55)}',
'#art-root .vmw{position:absolute;left:50%;top:50%;width:min(100vw,177.68vh);height:min(56.28vw,100vh);transform:translate(-50%,-50%);container-type:inline-size}',
'#art-root .vmw img{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;pointer-events:none;-webkit-user-drag:none}#art-root .vmw .mg{filter:grayscale(1) brightness(.92)}#art-root .vmw .mc{transition:opacity 1.6s ease}',
'#art-root .spot{position:absolute;transform:translate(-50%,-50%);border:.3vmin solid #fff;border-radius:3vmin;background:rgba(43,35,53,.82);color:#fff;font-weight:900;font-size:clamp(13px,1.45cqw,26px);padding:.35em .7em;display:flex;align-items:center;gap:.3em;white-space:nowrap;box-shadow:0 .5vmin 1.2vmin rgba(0,0,0,.4);cursor:pointer;touch-action:manipulation;font-family:inherit}',
'#art-root .spot:active{transform:translate(-50%,-50%) scale(.94)}#art-root .spot.lk{background:rgba(90,90,90,.8)}#art-root .spot.hot{background:linear-gradient(135deg,#ff7aa8,#8a5cf0)}',
'#art-root .vmap~.ghostm{left:62%;top:44%}',   /* 地圖模式:褪色魔飄在噴泉右邊,不擋工坊 */
'#art-root .vmap.nolb .spot .lb{display:none}#art-root .vmap.nolb .spot{font-size:clamp(18px,2.2cqw,34px);padding:.25em .4em}',
'@media (orientation:landscape) and (max-height:520px){#art-root .spot{font-size:clamp(12px,1.9cqw,20px)}}',
'#art-root .vil svg{width:100%;height:100%;display:block}',
/* ★ v1.1.0 第 8 項:黑白底圖+彩色圖疊上去,用透明度淡入(不再整張 SVG 套灰階濾鏡,舊平板不卡) */
'#art-root .vil .vg,#art-root .vil .vc{position:absolute;inset:0}#art-root .vil .vc{transition:opacity 1.6s ease;will-change:opacity}',
'.art-flash{transform-box:fill-box;transform-origin:center;animation:artFlash 1.1s ease-out 3;pointer-events:none}@keyframes artFlash{0%{transform:scale(.4);opacity:1}100%{transform:scale(2.4);opacity:0}}',
/* ★ v1.1.0 第 9 項:拖曳到可放的位置亮框 */
'#art-root [data-wi].drop{stroke:#ff7a59 !important;stroke-width:7px !important}#art-root [data-bowl].drop,#art-root [data-spot].drop,#art-root [data-mt].drop{box-shadow:0 0 0 .7vmin #ff7a59,0 0 3vmin #ffd93b !important}',
/* ★ v1.1.0 第 10/11/12 項 */
'.art-opt.fade{opacity:.22;pointer-events:none;filter:grayscale(1)}',
'.st-a{display:inline-block;opacity:.15;transform:scale(.3);animation:artStar .5s cubic-bezier(.3,1.7,.5,1) forwards}@keyframes artStar{to{opacity:1;transform:scale(1)}}',
'.res-pop{display:inline-block;animation:artPop .7s cubic-bezier(.3,1.7,.5,1) both}@keyframes artPop{0%{transform:translateY(1.6vmin) scale(.5);opacity:0}100%{transform:none;opacity:1}}',
'#art-root,#art-modal,#art-tut{-webkit-tap-highlight-color:transparent}',
'#art-modal .abtn:active,#art-tut .abtn:active,.art-opt:active,#art-root .achip.btn:active,#art-cv .cvb:active,#art-cv .mini:active,#art-cv .abtn:active,#art-modal .mini:active{transform:translateY(.3vmin) scale(.97);box-shadow:0 .15vmin 0 rgba(0,0,0,.3)}',
'#art-root .achip.ev{background:#ffe9a8;cursor:pointer}#art-root .achip.ev.hot{background:#ffc2c2;animation:artBeat 1s ease-in-out infinite}@keyframes artBeat{50%{transform:scale(1.05)}}',
'#art-root .arr-bar{position:absolute;left:50%;bottom:12vmin;transform:translateX(-50%);z-index:6;background:#fff9ef;border:.45vmin solid var(--line);border-radius:2.4vmin;padding:1vmin 1.6vmin;display:flex;gap:1.4vmin;align-items:center;font-weight:900;font-size:2.4vmin;box-shadow:0 .6vmin 0 rgba(0,0,0,.3)}',
'#art-root.lite .ghostm,#art-root.lite .achip.ev.hot{animation:none}#art-root.lite .vil .vc{will-change:auto}',   /* ★ v1.1.1 省電:村子不跑常駐動畫 */
'#art-root.arrange{touch-action:none}#art-root.arrange .deco{cursor:grab}#art-root.arrange .deco text{filter:drop-shadow(0 0 6px #ffd93b)}',
'.art-mt{display:flex;align-items:center;gap:1vmin;background:#fff;border:.4vmin solid var(--line);border-radius:1.8vmin;padding:.8vmin 1.2vmin;min-height:7vmin;font-weight:800;font-size:2.3vmin}.art-mt .slot{flex:none;min-width:16vmin;min-height:5.4vmin;border:.45vmin dashed #ff7a59;border-radius:1.4vmin;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.5)}',
'#art-modal .wall{display:grid;grid-template-columns:repeat(auto-fill,minmax(26vmin,1fr));gap:1.4vmin;margin-top:1vmin}#art-modal .wcard{background:#fff;border:.35vmin solid var(--line);border-radius:1.6vmin;padding:.8vmin;font-size:2vmin}#art-modal .wcard img{width:100%;aspect-ratio:4/3;object-fit:contain;background:#fff;border-radius:1vmin;display:block}',
'#art-modal .tabs{display:flex;gap:1vmin;margin:0 0 1.2vmin;flex-wrap:wrap}#art-modal select,#art-modal input[type=text]{box-sizing:border-box;font-size:2.4vmin;padding:.6vmin 1vmin;border:.35vmin solid #3a2f45;border-radius:1.2vmin;font-family:inherit;max-width:100%}',
'#art-modal .mini{border:.3vmin solid #3a2f45;border-radius:1vmin;background:#fff;font-size:2vmin;font-weight:900;padding:.4vmin .9vmin;cursor:pointer;font-family:inherit;color:#2b2335}#art-modal .mini.on{background:#ffd93b}',
'#art-modal .card8{display:grid;grid-template-columns:repeat(4,1fr);gap:1.2vmin}#art-modal .mcard{background:linear-gradient(160deg,#fff6d8,#ffe2ef);border:.4vmin solid var(--line);border-radius:1.8vmin;padding:1vmin;text-align:center;font-size:2vmin;font-weight:800}#art-modal .mcard.off{background:#e9e4ee;color:#9a90a6}#art-modal .mcard .e{font-size:5.4vmin;line-height:1.2}',
'#art-root .hud{position:absolute;left:1.6vmin;right:1.6vmin;top:1.6vmin;display:flex;gap:1.2vmin;align-items:center;z-index:5;flex-wrap:wrap}',
'#art-root .achip{background:#fff;border:.4vmin solid var(--line);border-radius:3vmin;padding:.6vmin 1.6vmin;font-weight:900;font-size:2.4vmin;display:flex;gap:.8vmin;align-items:center;box-shadow:0 .5vmin 0 rgba(0,0,0,.25);white-space:nowrap}',
'#art-root .achip.btn{cursor:pointer}',
'#art-root .restore{flex:1;min-width:30vmin;max-width:60vmin}',
'#art-root .bar{flex:1;height:2.2vmin;border-radius:2vmin;background:#e6e1ea;overflow:hidden;border:.3vmin solid var(--line)}',
'#art-root .bar i{display:block;height:100%;background:linear-gradient(90deg,#ff5d5d,#ffa53b,#ffd93b,#4fcf7a,#4aa3ff,#a36bff);transition:width 1s}',
'#art-root .sp{flex:1}',
'#art-root .dock{position:absolute;right:1.6vmin;bottom:1.6vmin;display:flex;gap:1.2vmin;z-index:5}',
'#art-root .dock button,#art-root .abtn{border:.45vmin solid var(--line);border-radius:2.2vmin;padding:1vmin 2.2vmin;font-weight:900;font-size:2.5vmin;background:#fff;box-shadow:0 .5vmin 0 rgba(0,0,0,.3);cursor:pointer;color:#2b2335;font-family:inherit}',
'#art-root .abtn.go,#art-root .dock button.go{background:var(--yellow)}',
'#art-root .abtn.ghost{background:#efe9f3}',
'#art-root .abtn:disabled{opacity:.45;cursor:default}',
'#art-root .abtn:active,#art-root .dock button:active{transform:translateY(.3vmin);box-shadow:0 .2vmin 0 rgba(0,0,0,.3)}',
'#art-root .bld{cursor:pointer}',
'#art-root .bld:hover .wall{filter:brightness(1.06)}',
'#art-root .ghostm{position:absolute;left:50%;margin-left:-6.5vmin;top:13%;width:13vmin;height:15vmin;border-radius:50% 50% 30% 30%;background:radial-gradient(circle at 35% 35%,#7a7a86,#3d3d48);box-shadow:0 0 4vmin #222;transition:opacity 1s,transform 1s;animation:artFloat 3s ease-in-out infinite;pointer-events:none}',
'#art-root .ghostm::before,#art-root .ghostm::after{content:"";position:absolute;top:38%;width:2vmin;height:2.6vmin;border-radius:50%;background:#fff}',
'#art-root .ghostm::before{left:28%}#art-root .ghostm::after{right:28%}',
'@keyframes artFloat{50%{transform:translateY(-1.6vmin)}}',
/* 對話框/模態 */
'#art-modal{position:fixed;inset:0;z-index:9500;display:flex;align-items:safe center;justify-content:center;background:rgba(20,14,30,.6);padding:2vmin}',
'#art-modal .acard{background:var(--paper);border:.6vmin solid var(--line);border-radius:3vmin;box-shadow:0 1.2vmin 0 rgba(0,0,0,.3);padding:2.6vmin 3vmin;width:min(92vw,110vmin);max-height:min(92dvh,92vh);overflow-y:auto;font-size:2.6vmin;line-height:1.55;color:#2b2335}',
'#art-modal h3{font-size:3.4vmin;margin:0 0 1.4vmin}',
'#art-modal .btns{display:flex;gap:1.4vmin;justify-content:center;margin-top:2vmin;flex-wrap:wrap}',
'#art-root .lvcard,#art-modal .lvcard{display:flex;align-items:center;gap:1.6vmin;background:#fff;border:.4vmin solid var(--line);border-radius:2vmin;padding:1.2vmin 1.6vmin;margin:1vmin 0}',
'#art-modal .lvcard .nm{flex:1;font-weight:900}',
'#art-modal .lvcard .st{color:#f5a623;font-size:2.8vmin;letter-spacing:.2vmin}',
'#art-modal .lvcard .asub{font-size:2vmin;color:#6b6178;font-weight:700}',
'#art-modal .cost{font-size:2.1vmin;color:#6b6178}',
'#art-modal .acard .ok{color:#1f9d55}#art-modal .acard .bad{color:#c0392b}',
'#art-modal .scard{background:#fff;border:.35vmin solid var(--line);border-radius:2vmin;padding:1vmin 1.6vmin;margin:.8vmin 0;font-size:2.4vmin}',
/* 教學 */
'#art-tut{position:fixed;inset:0;z-index:9600;pointer-events:auto}',
'#art-tut .spot{position:fixed;border-radius:2.4vmin;box-shadow:0 0 0 200vmax rgba(20,14,30,.62);outline:.6vmin dashed #fff;outline-offset:.6vmin;animation:artPulse 1.4s ease-in-out infinite;pointer-events:none;transition:all .35s}',
'#art-tut .dim{position:fixed;inset:0;background:rgba(20,14,30,.62)}',
'@keyframes artPulse{50%{outline-color:#ffd93b}}',
'#art-tut .dlg{position:fixed;left:3vmin;right:3vmin;display:flex;align-items:flex-end;gap:2vmin}',
'#art-tut .dlg.bottom{bottom:3vmin}#art-tut .dlg.top{top:3vmin}',
'#art-tut .sprite{flex:none;width:16vmin;height:19vmin;position:relative}',
'#art-tut .bubble{flex:1;background:var(--paper);border:.6vmin solid var(--line);border-radius:3vmin;padding:2.2vmin 3vmin 1.8vmin;box-shadow:0 1vmin 0 rgba(0,0,0,.3);position:relative;font-size:2.9vmin;line-height:1.55;font-weight:700;color:#2b2335}',
'#art-tut .bubble b{color:#d9433b}',
'#art-tut .who{position:absolute;top:-2.6vmin;left:3vmin;background:var(--accent);color:#fff;border:.45vmin solid var(--line);border-radius:2vmin;padding:.2vmin 1.8vmin;font-weight:900;font-size:2.1vmin}',
'#art-tut .foot{display:flex;gap:1.4vmin;align-items:center;margin-top:1.2vmin}',
'#art-tut .foot .dots{flex:1;display:flex;gap:.8vmin}',
'#art-tut .foot .dots i{width:1.4vmin;height:1.4vmin;border-radius:50%;background:#d8cfe0}',
'#art-tut .foot .dots i.on{background:var(--accent);width:3.4vmin;border-radius:1vmin}',
'#art-root .sprite-pen,#art-tut .sprite-pen{position:absolute;inset:0}',
/* 精緻風 */
'#art-root.premium .achip,#art-modal.premium .acard,#art-tut.premium .bubble{background:#14213d;color:#f4e9c8;border-color:#c9a227}',
'#art-modal.premium .lvcard,#art-modal.premium .scard{background:#1d2c4f;color:#f4e9c8;border-color:#c9a227}',
'#art-tut.premium .bubble b{color:#ffd166}',
/* 關卡畫面 */
'#art-lv{position:absolute;inset:0;z-index:20;background:linear-gradient(160deg,#fff3dc,#ffe6f0);display:flex;flex-direction:column}',
'#art-lv .top{display:flex;align-items:center;gap:1.4vmin;padding:1.4vmin 1.8vmin;background:#fff;border-bottom:.45vmin solid var(--line)}',
'#art-lv .top .tt{flex:1;font-weight:900;font-size:3vmin}',
'#art-lv .body{flex:1;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:1.6vmin}',
'#art-lv .foot{display:flex;align-items:center;gap:1.6vmin;padding:1.4vmin 1.8vmin;background:#fff;border-top:.45vmin solid var(--line)}',
'#art-lv .foot .ask{flex:1;font-weight:900;font-size:2.7vmin}',
'#art-lv .prog{font-weight:900;font-size:2.4vmin;color:#6b6178}',
'.art-tile{border:.45vmin solid var(--line);border-radius:1.6vmin;box-shadow:0 .5vmin 0 rgba(0,0,0,.25);cursor:grab;touch-action:none;display:flex;align-items:center;justify-content:center;font-weight:900}',
'.art-tile.drop{outline:.6vmin dashed #ff7a59;outline-offset:.4vmin}',
'.art-drag{position:fixed;z-index:9999;pointer-events:none;opacity:.92;transform:translate(-50%,-50%) scale(1.08)}',
'.art-label{background:#fff;border:.4vmin solid var(--line);border-radius:2vmin;padding:.6vmin 1.6vmin;font-weight:900;font-size:2.4vmin;cursor:grab;touch-action:none;white-space:nowrap;box-shadow:0 .4vmin 0 rgba(0,0,0,.25)}',
'.art-opt{border:.5vmin solid var(--line);border-radius:2vmin;background:#fff;cursor:pointer;padding:1vmin;box-shadow:0 .6vmin 0 rgba(0,0,0,.25);font-weight:900;font-size:2.6vmin;font-family:inherit;color:#2b2335}',
'.art-opt.right{background:#c9f7d6;border-color:#1f9d55}.art-opt.wrong{background:#ffd6d6;border-color:#c0392b}',
'.art-frame{position:relative;background:linear-gradient(#cfe9ff 0 40%,#bfe6a8 40% 100%);border:.6vmin solid var(--line);border-radius:1.4vmin;overflow:hidden;touch-action:none}',
'.art-frame .g{position:absolute;background:rgba(255,255,255,.75)}',
'.art-obj{position:absolute;transform:translate(-50%,-50%);cursor:grab;touch-action:none;line-height:1;filter:drop-shadow(0 .4vmin .3vmin rgba(0,0,0,.3))}',
/* 手機橫向(矮螢幕):整體字放大(鐵律〇之二) */
'@media (orientation:landscape) and (max-height:520px){#art-modal .abtn,#art-tut .abtn{font-size:3.4vmin}#art-modal .asub,#art-modal .cost,#art-modal .acard [style*="font-size:2"]{font-size:3vmin !important}#art-modal .acard [style*="minmax(24vmin"]{grid-template-columns:repeat(auto-fill,minmax(38vmin,1fr)) !important}#art-modal .lvcard .st{font-size:3.6vmin}#art-root .achip{font-size:3.4vmin}#art-root .dock button,#art-root .abtn{font-size:3.6vmin}#art-modal .acard{font-size:3.6vmin}#art-modal h3{font-size:4.4vmin}#art-tut .bubble{font-size:3.8vmin}#art-lv .top .tt,#art-lv .foot .ask{font-size:3.8vmin}.art-opt{font-size:3.6vmin}.art-label{font-size:3.4vmin}#art-tut .sprite{width:12vmin;height:14vmin}}',
/* ★ v1.1.3(檢查報告第 10 項):無 Home 鍵 iPad/手機的安全區 — 下緣按鈕離開 Home 手勢條、左右按鈕避開瀏海圓角(沒有安全區的機器 env() = 0,位置不變) */
'#art-root .dock{right:calc(1.6vmin + env(safe-area-inset-right));bottom:calc(1.6vmin + env(safe-area-inset-bottom))}#art-root .lchips{left:calc(1.6vmin + env(safe-area-inset-left)) !important;bottom:calc(1.6vmin + env(safe-area-inset-bottom)) !important}#art-root .hud{left:calc(1.6vmin + env(safe-area-inset-left));right:calc(1.6vmin + env(safe-area-inset-right));top:calc(1.6vmin + env(safe-area-inset-top))}',
'#art-lv .top{padding-left:calc(1.8vmin + env(safe-area-inset-left));padding-right:calc(1.8vmin + env(safe-area-inset-right));padding-top:calc(1.4vmin + env(safe-area-inset-top))}#art-lv .foot{padding-left:calc(1.8vmin + env(safe-area-inset-left));padding-right:calc(1.8vmin + env(safe-area-inset-right));padding-bottom:calc(1.4vmin + env(safe-area-inset-bottom))}',
/* ★ v1.1.0 新畫面的手機橫向版(放最後,鐵律〇之二) */
'@media (orientation:landscape) and (max-height:520px){#art-modal .scard{font-size:3.1vmin}#art-modal .wall{grid-template-columns:repeat(auto-fill,minmax(36vmin,1fr))}#art-modal .wcard{font-size:2.8vmin}#art-modal .mini{font-size:2.9vmin}#art-modal select,#art-modal input[type=text]{font-size:3.4vmin}#art-modal .mcard{font-size:2.8vmin}#art-root .arr-bar{font-size:3.4vmin;bottom:14vmin}.art-mt{font-size:3.2vmin}.art-mt .slot{min-width:22vmin}#art-root .dock{gap:.8vmin}#art-root .dock button{padding:.8vmin 1.4vmin}}'
].join('\n');
function injectCss(){ if($('art-css')) return; var s = document.createElement('style'); s.id = 'art-css'; s.textContent = CSS; document.head.appendChild(s); }

/* ══ 模態視窗(遊戲內,不用瀏覽器 alert/confirm) ══ */
function modal(html, btns, opt){
  modalClose();
  var m = document.createElement('div'), i, b, row;
  m.id = 'art-modal'; if(A.style === 'p') m.className = 'premium';
  m.innerHTML = '<div class="acard">' + html + '<div class="btns"></div></div>';
  row = m.querySelector('.btns');
  btns = btns || [{ t: '好' }];
  for(i = 0; i < btns.length; i++){ (function(bd){
    b = document.createElement('button'); b.className = 'abtn ' + (bd.cls || 'go'); b.innerHTML = bd.t; b.disabled = !!bd.dis;
    b.onclick = function(ev){ ev.stopPropagation(); sfx('sfx-tap', 0.3); if(!bd.keep) modalClose(); if(bd.cb) bd.cb(); if(!bd.keep) modalNext(); };
    row.appendChild(b);
  })(btns[i]); }
  if(opt && opt.onOpen) opt.onOpen(m);
  document.body.appendChild(m);
  A.modalAt = now();
  return m;
}
/* ★ v1.1.0 第 12 項:防連點 — 同一顆按鈕 0.35 秒內只算一次;視窗剛跳出 0.25 秒內點到的(上一下點擊的餘波)不算 */
document.addEventListener('click', function(e){
  if(!A.on) return;
  var t = e.target, b = null, inArt = false, k;
  while(t && t !== document){ if(!b && t.tagName && (t.tagName === 'BUTTON' || (t.className && typeof t.className === 'string' && /\b(achip btn|art-opt|lvcard)\b/.test(t.className)))) b = t;
    if(t.id === 'art-root' || t.id === 'art-modal' || t.id === 'art-tut') inArt = true; t = t.parentNode; }
  if(!b || !inArt) return;
  k = now();
  if((b._artT && k - b._artT < 350) || (A.modalAt && k - A.modalAt < 250 && $('art-modal') && $('art-modal').contains(b))){ e.stopPropagation(); e.preventDefault(); return; }
  b._artT = k;
}, true);
function modalClose(){ var m = $('art-modal'); if(m && m.parentNode) m.parentNode.removeChild(m); }
/* ★ v1.1.3(檢查報告第 9 項):背景跑完才跳的視窗(雲端找回、交件成功、過關結算)不可蓋掉學生正在看的視窗 ⇒ 有視窗開著就排隊,關掉後再出來 */
var MQ = [];
function modalLater(html, btns, opt){ if($('art-modal') || $('art-tut')){ MQ.push([html, btns, opt]); return null; } return modal(html, btns, opt); }
function modalNext(){ setTimeout(function(){ if(!MQ.length || $('art-modal') || $('art-tut') || !A.on) return; var q = MQ.shift(); modal(q[0], q[1], q[2]); }, 0); }
function confirmBox(msg, cb){ modal('<p>' + msg + '</p>', [{ t: '取消', cls: 'ghost', cb: function(){ cb(false); } }, { t: '確定', cb: function(){ cb(true); } }]); }

/* ══ 彩筆精靈(GPT 圖到位前的程式畫替身) ══ */
function spriteSvg(){
  return '<svg class="sprite-pen" viewBox="0 0 100 120"><defs><linearGradient id="artpg" x1="0" x2="1"><stop offset="0" stop-color="#ff5d5d"/><stop offset=".33" stop-color="#ffd93b"/><stop offset=".66" stop-color="#4fcf7a"/><stop offset="1" stop-color="#4aa3ff"/></linearGradient></defs>'
    + '<ellipse cx="50" cy="114" rx="26" ry="5" fill="rgba(0,0,0,.25)"/>'
    + '<rect x="30" y="22" width="40" height="70" rx="18" fill="url(#artpg)" stroke="#3a2f45" stroke-width="4"/>'
    + '<path d="M36 92 L50 112 L64 92 Z" fill="#ffe1b0" stroke="#3a2f45" stroke-width="4"/><path d="M46 106 L50 112 L54 106 Z" fill="#3a2f45"/>'
    + '<circle cx="42" cy="50" r="5" fill="#fff" stroke="#3a2f45" stroke-width="2"/><circle cx="58" cy="50" r="5" fill="#fff" stroke="#3a2f45" stroke-width="2"/><circle cx="43" cy="51" r="2.2" fill="#3a2f45"/><circle cx="59" cy="51" r="2.2" fill="#3a2f45"/>'
    + '<path d="M43 62 Q50 68 57 62" stroke="#3a2f45" stroke-width="3" fill="none" stroke-linecap="round"/>'
    + '<path d="M50 22 Q48 8 60 4" stroke="#3a2f45" stroke-width="3" fill="none"/><circle cx="62" cy="4" r="4" fill="#ffd93b" stroke="#3a2f45" stroke-width="2"/></svg>';
}

/* ══ 新手教學:分段、聚光燈自動避開(目標在下半部 ⇒ 對話框放上面) ══ */
function tutRun(key, done, force){
  var steps = D.TUT[key], i = 0, el;
  if(!steps || (!force && A.save && A.save.tut[key])){ if(done) done(); return; }
  el = document.createElement('div'); el.id = 'art-tut'; if(A.style === 'p') el.className = 'premium';
  document.body.appendChild(el);
  function finish(){ if(el.parentNode) el.parentNode.removeChild(el); if(A.save && !A.save.tut[key]){ A.save.tut[key] = 1; saveSoon(); } if(done) done(); modalNext(); }
  function show(){
    var st = steps[i], tgt = st.spot ? document.querySelector(st.spot) : null, r, h = '', dots = '', j, pos = 'bottom';
    for(j = 0; j < steps.length; j++) dots += '<i class="' + (j === i ? 'on' : '') + '"></i>';
    if(tgt){ r = tgt.getBoundingClientRect(); if(r.width > 0){ h += '<div class="spot" style="left:' + (r.left - 6) + 'px;top:' + (r.top - 6) + 'px;width:' + (r.width + 12) + 'px;height:' + (r.height + 12) + 'px"></div>'; if(r.top + r.height / 2 > window.innerHeight * 0.5) pos = 'top'; } else h += '<div class="dim"></div>'; }
    else h += '<div class="dim"></div>';
    h += '<div class="dlg ' + pos + '"><div class="sprite">' + spriteSvg() + '</div><div class="bubble"><span class="who">彩筆精靈</span>' + T(st)
      + '<div class="foot"><div class="dots">' + dots + '</div><button class="abtn ghost" data-k="skip" style="font-size:2vmin">跳過</button><button class="abtn go" data-k="next">' + (i === steps.length - 1 ? '開始!' : '下一步 ▶') + '</button></div></div></div>';
    el.innerHTML = h;
    el.querySelector('[data-k=next]').onclick = function(ev){ ev.stopPropagation(); sfx('sfx-tap', 0.3); i++; if(i >= steps.length) finish(); else show(); };
    el.querySelector('[data-k=skip]').onclick = function(ev){ ev.stopPropagation(); finish(); };
  }
  setTimeout(show, 60);
}

/* ══ 藝術村(大廳) ══ */
/* ★ v1.1.0 八座工坊:前排四座(原位置)+後排四座(縮小 0.55,畫在前排後面) */
var BPOS = { sketch: [230, 500, 1], color: [620, 465, 1], beauty: [1000, 490, 1], comp: [1370, 465, 1],
             media: [380, 200, 0.55], appre: [680, 200, 0.55], history: [980, 200, 0.55], masters: [1280, 200, 0.55] };
var DPOS = { sk2: [118, 405, 54, '🏮'], easel: [270, 800, 84], co2: [508, 400, 54, '✨'], fountain: [800, 790, 110], flower: [470, 815, 70], be2: [888, 425, 54, '✨'],
             statue: [1190, 760, 90], windmill: [1520, 300, 110], cm2: [1258, 400, 54, '✨'], mural: [820, 520, 96], kiln: [1330, 805, 84], gallery: [190, 265, 96],
             bench: [600, 820, 70], flag: [830, 300, 80], arch: [430, 690, 110], lamp: [1060, 820, 70], master: [1565, 600, 90], pond: [370, 868, 70] };
/* 黑白圖層用:把 #rrggbb 換成同亮度的灰 */
function grayHex(c){ if(!/^#[0-9a-f]{6}$/i.test(c)) return c; var r = parseInt(c.substr(1, 2), 16), g = parseInt(c.substr(3, 2), 16), b = parseInt(c.substr(5, 2), 16), l = Math.round(0.299 * r + 0.587 * g + 0.114 * b), x = ('0' + l.toString(16)).slice(-2); return '#' + x + x + x; }
function bldSvg(W, x, y, locked, stars, total, sc, gray){
  var c = gray ? grayHex(W.roof) : W.roof, h = '', G = gray ? grayHex : function(v){ return v; };
  h += '<g class="bld"' + (gray ? '' : ' id="art-b-' + W.id + '" data-ws="' + W.id + '"') + ' transform="translate(' + x + ',' + y + ') scale(' + (sc || 1) + ')"' + (locked ? ' opacity=".55"' : '') + '>';
  h += '<ellipse cx="0" cy="150" rx="150" ry="22" fill="rgba(0,0,0,.18)"/>';
  h += '<rect x="-120" y="0" width="240" height="150" rx="8" fill="' + G('#fff3dc') + '" stroke="#3a2f45" stroke-width="8"/>';
  h += '<path d="M-150 6 L0 -120 L150 6 Z" fill="' + c + '" stroke="#3a2f45" stroke-width="8" stroke-linejoin="round"/>';
  h += '<rect x="-30" y="70" width="60" height="80" rx="6" fill="' + G('#b07a4f') + '" stroke="#3a2f45" stroke-width="6"/>';
  h += '<rect x="-100" y="30" width="50" height="44" rx="6" fill="' + G('#cfe9ff') + '" stroke="#3a2f45" stroke-width="6"/><rect x="50" y="30" width="50" height="44" rx="6" fill="' + G('#cfe9ff') + '" stroke="#3a2f45" stroke-width="6"/>';
  h += '<text x="0" y="-30" font-size="72" text-anchor="middle" dominant-baseline="middle"' + (gray ? ' filter="url(#artgf)"' : '') + '>' + W.e + '</text>';
  h += '<g transform="translate(0,190)"><rect x="-130" y="-30" width="260" height="60" rx="30" fill="#fff" stroke="#3a2f45" stroke-width="6"/>'
     + '<text x="0" y="2" font-size="34" font-weight="900" text-anchor="middle" dominant-baseline="middle" fill="#2b2335">' + esc(W.n) + (locked ? ' 🔒' : '') + '</text></g>';
  h += '<g transform="translate(0,240)"><text x="0" y="0" font-size="30" font-weight="900" text-anchor="middle" fill="#fff" stroke="#3a2f45" stroke-width="7" paint-order="stroke">⭐ ' + stars + '/' + total + '</text></g>';
  h += '</g>';
  return h;
}
/* ★ v1.1.0 八座工坊擠得下:螢幕比較「方」(iPad 4:3)時,SVG 兩側會被裁掉 ⇒ 依可見寬度把建築往中間收、前排稍微縮小 */
function vk(){ var a = (window.innerWidth || 1600) / Math.max(1, window.innerHeight || 900); return clamp((900 * a - 140) / 1480, 0.6, 1); }
function mapX(x){ return Math.round(800 + (x - 800) * vk()); }
function decoPos(k){ var p = DPOS[k] || [800, 600, 80], o = A.save.pos[k]; return o ? [o[0], o[1], p[2], p[3]] : [mapX(p[0]), p[1], p[2], p[3]]; }
function villageSvg(gray){
  var h = '', i, W, k, p, b, tot, st, a, j, G = gray ? grayHex : function(v){ return v; }, sid = gray ? 'artskyg' : 'artskyc', ord = [];
  h += '<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">';
  h += '<defs><linearGradient id="' + sid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + G('#9fd6ff') + '"/><stop offset="1" stop-color="' + G('#e8f6ff') + '"/></linearGradient>'
     + (gray ? '<filter id="artgf"><feColorMatrix type="saturate" values="0"/></filter>' : '') + '</defs>';
  h += '<rect width="1600" height="900" fill="url(#' + sid + ')"/>';
  h += '<circle cx="1450" cy="110" r="70" fill="' + G('#ffd93b') + '" stroke="' + G('#ffb703') + '" stroke-width="10"/>';
  h += '<g fill="#fff" opacity=".9"><ellipse cx="300" cy="120" rx="110" ry="36"/><ellipse cx="370" cy="100" rx="80" ry="40"/><ellipse cx="900" cy="90" rx="120" ry="34"/><ellipse cx="980" cy="70" rx="70" ry="36"/></g>';
  h += '<path d="M0 470 Q200 330 420 440 Q640 330 860 430 Q1100 320 1320 430 Q1480 360 1600 420 L1600 900 L0 900 Z" fill="' + G('#8fd38a') + '"/>';
  h += '<rect x="0" y="560" width="1600" height="340" fill="' + G('#bfe6a8') + '"/>';
  h += '<path d="M0 760 Q400 720 800 760 T1600 750 L1600 820 Q1200 800 800 830 T0 830 Z" fill="' + G('#e9d5a8') + '" stroke="' + G('#d2b880') + '" stroke-width="6"/>';
  /* 工坊:後排(小)先畫,前排後畫 */
  for(i = 0; i < D.WORKSHOPS.length; i++) ord.push(D.WORKSHOPS[i]);
  ord.sort(function(x, y){ return (BPOS[x.id] ? BPOS[x.id][1] : 0) - (BPOS[y.id] ? BPOS[y.id][1] : 0); });
  for(i = 0; i < ord.length; i++){ W = ord[i]; if(!BPOS[W.id]) continue; a = D.WS_LEVELS[W.id]; st = 0; for(j = 0; j < a.length; j++) st += (A.save.stars[a[j]] | 0);
    tot = a.length * 3; h += bldSvg(W, mapX(BPOS[W.id][0]), BPOS[W.id][1], !wsOpen(W), st, tot, BPOS[W.id][2] === 1 ? Math.min(1, Math.max(0.8, vk() + 0.08)) : BPOS[W.id][2], gray); }
  /* 已建造的裝飾(可拖曳擺位置,第 21 項)*/
  for(k in A.save.builds){ if(!A.save.builds.hasOwnProperty(k)) continue; b = buildDef(k); if(!b) continue; p = decoPos(k);
    h += '<g class="deco" ' + (gray ? 'data-dkg' : 'data-dk') + '="' + k + '" transform="translate(' + Math.round(p[0]) + ',' + Math.round(p[1]) + ')">'
       + (!gray && A.flash === k ? '<circle class="art-flash" r="' + Math.round(p[2] * 0.75) + '" fill="none" stroke="#ffd93b" stroke-width="10"/>' : '')
       + '<text x="0" y="0" font-size="' + p[2] + '" text-anchor="middle" dominant-baseline="middle"' + (gray ? ' filter="url(#artgf)"' : '') + '>' + (p[3] || b.e) + '</text></g>'; }
  h += '</svg>';
  return h;
}
/* ══ ★ v1.1.4 藝術村地圖首頁:GPT 圖(D.MAP.img)整張等比放進畫面(contain,兩側模糊補邊),入口=地圖上的標籤鈕(D.MAP.spots,% 座標)
   恢復度沿用:底圖黑白、上面疊彩色同一張圖,彩色層透明度 = 恢復度(與 SVG 村子同一個 #art-vc,建造後一樣淡入)。
   擺設裝飾(✋)時暫時切回 SVG 村子;地圖圖片載入失敗也自動退回 SVG。名稱標籤可在右上 🏷 隱藏(art_nolb)。 */
function mapOn(){ return !!(D.MAP && D.MAP.img && A.mapBad !== true && !A.arrange); }
function mapUrl(){ try{ if(window.mgPicUrl) return window.mgPicUrl(D.MAP.img); }catch(e){} return 'img/' + D.MAP.img; }
function mapHtml(op){
  var h = '', i, s, W, lk, u = mapUrl(), nolb = lsGet('art_nolb') === '1';
  h += '<div class="vil vmap' + (nolb ? ' nolb' : '') + '" id="art-vil" style="background-image:url(\'' + esc(u) + '\')"><div class="vmw">';
  h += '<img class="mg" src="' + esc(u) + '" alt="" onerror="window.ARTW&&window.ARTW._mapBad()"><img class="mc" id="art-vc" src="' + esc(u) + '" alt="" style="opacity:' + (op / 100).toFixed(3) + '">';
  for(i = 0; i < D.MAP.spots.length; i++){ s = D.MAP.spots[i]; lk = false;
    if(s.k === 'ws'){ W = wsDef(s.id); if(!W) continue; lk = !wsOpen(W); h += '<button class="spot' + (lk ? ' lk' : '') + '" data-ws="' + s.id + '" style="left:' + s.x + '%;top:' + s.y + '%">' + (lk ? '🔒' : W.e) + '<span class="lb">' + esc(W.n) + '</span></button>'; }
    else h += '<button class="spot' + (s.k === 'dsg' ? ' hot' : '') + '" data-k="' + s.k + '" style="left:' + s.x + '%;top:' + s.y + '%">' + s.e + '<span class="lb">' + esc(s.n) + '</span></button>'; }
  return h + '</div></div>';
}
function boardPanel(){
  var h = '<h3>📌 比賽活動看板</h3>', i, ev;
  if(!A.evs.length) h += '<p>現在沒有進行中的比賽或每週主題,老師開了就會貼在這裡!</p>';
  for(i = 0; i < A.evs.length; i++){ ev = A.evs[i]; h += '<div class="scard" data-ev="' + esc(ev.id) + '" style="cursor:pointer">' + (ev.type === 'contest' ? '⚔️ 比賽:' : '🗓 本週主題:') + esc(String(ev.title || '')) + '</div>'; }
  modal(h, [{ t: '📅 今日挑戰', cls: 'ghost', cb: dailyPanel }, { t: '好' }], { onOpen: function(m){ m.onclick = function(e){ var t = upFind(e.target, 'data-ev'); if(!t) return; modalClose(); evOpen(t.getAttribute('data-ev')); }; } });
}
function hubHtml(){
  var u = user(), r = resNow(), pct = restorePct(), g = 1 - pct / 100, h = '', op = A.flashFrom != null ? A.flashFrom : pct, dl = dailyList(), dn = 0, i, ev;
  for(i = 0; i < dl.length; i++){ if(A.save.dq[dayKey() + '_' + dl[i].id]) dn++; }
  if(mapOn()) h += mapHtml(op);   /* ★ v1.1.4 老師:進入後先顯示藝術村背景地圖首頁(GPT 繪製),各項目入口放在地圖上 */
  else h += '<div class="vil" id="art-vil"><div class="vg">' + villageSvg(true) + '</div><div class="vc" id="art-vc" style="opacity:' + (op / 100).toFixed(3) + '">' + villageSvg(false) + '</div></div>';
  if(pct < 100) h += '<div class="ghostm" style="opacity:' + (0.35 + 0.65 * g).toFixed(2) + ';transform:scale(' + (0.6 + 0.4 * g).toFixed(2) + ')"><div></div></div>';
  h += '<div class="hud">';
  h += '<div class="achip btn" data-k="who">' + (u ? '👤 ' + esc(String(uName(u)).slice(0, 10)) : '👤 訪客 🔑') + '</div>';
  h += '<div class="achip restore" id="art-restore">🌈 <div class="bar"><i style="width:' + pct + '%"></i></div> ' + pct + '%</div>';
  h += '<div class="achip" title="顏料" id="art-r-paint">' + D.RES.paint.e + ' ' + Math.max(0, r.paint) + '</div><div class="achip" title="靈感" id="art-r-idea">' + D.RES.idea.e + ' ' + Math.max(0, r.idea) + '</div><div class="achip" title="畫材" id="art-r-mat">' + D.RES.mat.e + ' ' + Math.max(0, r.mat) + '</div>';
  h += '<div class="achip" title="本週藝術積分">⭐ ' + weekPts() + '</div>';
  h += '<div class="sp"></div>' + (mapOn() ? '<div class="achip btn" data-k="lbl" title="顯示/隱藏地圖名稱">🏷</div>' : '') + (isGm() ? '<div class="achip btn" data-k="gm" title="老師台">🧑‍🏫</div>' : '') + '<div class="achip btn" data-k="set">⚙</div>';
  h += '</div>';
  /* 左下:每日挑戰+進行中的比賽/每週主題 */
  h += '<div class="lchips" style="position:absolute;left:1.6vmin;bottom:1.6vmin;display:flex;flex-direction:column;gap:1vmin;align-items:flex-start;z-index:5">';
  for(i = 0; i < A.evs.length; i++){ ev = A.evs[i]; h += '<div class="achip btn ev' + (ev.type === 'contest' ? ' hot' : '') + '" data-ev="' + esc(ev.id) + '">' + (ev.type === 'contest' ? '⚔️ 比賽:' : '🗓 本週主題:') + esc(String(ev.title || '').slice(0, 10)) + ' <span data-evt="' + esc(ev.id) + '">' + evLeftTxt(ev) + '</span></div>'; }
  h += '<div class="achip btn" data-k="daily" id="art-daily">📅 今日挑戰 ' + dn + '/' + dl.length + '</div></div>';
  h += '<div class="dock"><button data-k="build" class="go">🏗 建造</button><button data-k="studio">🎨 畫室</button><button data-k="coll">📒 收藏</button><button data-k="rank">🏆 排行</button><button data-k="help">📖 說明</button><button data-k="dsg">✏️ 設計師</button><button data-k="exit">🚪 離開</button></div>';   /* ★ v1.1.4 遊戲美術設計師工作室入口(獨立專案,?mode=designer) */
  if(A.arrange) h += '<div class="arr-bar">✋ 拖曳裝飾換位置 <button class="abtn ghost" data-k="arrReset">↺ 預設位置</button><button class="abtn go" data-k="arrDone">✅ 擺好了</button></div>';
  return h;
}
function paintHub(){
  var root = $('art-root'); if(!root || !A.save) return;
  A.screen = 'hub';
  if(!$('art-lv') && !$('art-cv')) music('hub');   /* ★ v1.1.1 */
  root.className = (A.style === 'p' ? 'premium' : '') + (A.arrange ? ' arrange' : '') + (A.lite ? ' lite' : '');
  root.innerHTML = hubHtml();
  if(A.flashFrom != null){ A.flashFrom = null; setTimeout(function(){ var vc = $('art-vc'); if(vc) vc.style.opacity = (restorePct() / 100).toFixed(3); }, 60); }   /* ★ v1.1.0 第 11 項:建造後彩色圖慢慢淡入到新的恢復度 */
  if(A.flash){ setTimeout(function(){ A.flash = null; }, 50); }
  root.onclick = function(ev){
    var t = ev.target, k = null, ws = null, ei = null;
    if(A.arrange && !upFind(t, 'data-k')) return;
    while(t && t !== root){ if(t.getAttribute){ k = k || t.getAttribute('data-k'); ws = ws || t.getAttribute('data-ws'); ei = ei || t.getAttribute('data-ev'); } t = t.parentNode; }
    if(ws){ sfx('sfx-tap', 0.3); wsOpenPanel(ws); return; }
    if(ei){ sfx('sfx-tap', 0.3); evOpen(ei); return; }
    if(!k) return;
    sfx('sfx-tap', 0.3);
    if(k === 'build') buildPanel();
    else if(k === 'studio') studioOpen();
    else if(k === 'rank') rankPanel();
    else if(k === 'help') helpPanel();
    else if(k === 'exit') exitAsk();
    else if(k === 'dsg') exitNow('minigame_index.html?mode=designer&from=art');   /* ★ v1.1.4 */
    else if(k === 'board') boardPanel();
    else if(k === 'lbl'){ lsSet('art_nolb', lsGet('art_nolb') === '1' ? '0' : '1'); paintHub(); toast(lsGet('art_nolb') === '1' ? '🏷 地圖名稱已隱藏' : '🏷 地圖名稱已顯示'); }
    else if(k === 'set') setPanel();
    else if(k === 'daily') dailyPanel();
    else if(k === 'coll') collPanel();
    else if(k === 'gm') gmPanel();
    else if(k === 'arrDone'){ A.arrange = false; paintHub(); toast('✅ 擺設存好了'); }
    else if(k === 'arrReset'){ var kk; for(kk in A.save.pos){ if(A.save.pos.hasOwnProperty(kk)) delete A.save.pos[kk]; } saveSoon(); paintHub(); }
    else if(k === 'who'){ if(B.login) B.login(); }
  };
  if(A.arrange) arrangeBind(root); else root.onpointerdown = root.onpointermove = root.onpointerup = root.onpointercancel = null;
}
/* ★ v1.1.0 第 21 項:村子擺設 — 拖曳裝飾,位置存 save.pos(時間新的勝,兩台裝置不互蓋) */
function arrangeBind(root){
  var svg = root.querySelector('.vc svg'), drag = null;
  if(!svg || !svg.getScreenCTM) return;
  function toSvg(x, y){ var m = svg.getScreenCTM(), p; if(!m) return null; p = svg.createSVGPoint(); p.x = x; p.y = y; p = p.matrixTransform(m.inverse()); return p; }
  root.onpointerdown = function(e){ var g = upFind(e.target, 'data-dk'); if(!g) return; e.preventDefault(); drag = { k: g.getAttribute('data-dk'), g: g, gg: root.querySelector('[data-dkg="' + g.getAttribute('data-dk') + '"]'), pid: e.pointerId }; try{ root.setPointerCapture(e.pointerId); }catch(_){} };
  root.onpointermove = function(e){ if(!drag || e.pointerId !== drag.pid) return; var p = toSvg(e.clientX, e.clientY); if(!p) return; drag.x = clamp(p.x, 40, 1560); drag.y = clamp(p.y, 140, 870);
    var tr = 'translate(' + Math.round(drag.x) + ',' + Math.round(drag.y) + ')'; drag.g.setAttribute('transform', tr); if(drag.gg) drag.gg.setAttribute('transform', tr); };
  root.onpointerup = root.onpointercancel = function(e){ if(!drag || e.pointerId !== drag.pid) return; if(drag.x != null){ A.save.pos[drag.k] = [Math.round(drag.x), Math.round(drag.y), now()]; saveSoon(); sfx('sfx-gentle', 0.4); } drag = null; };
}
function wsOpenPanel(id){
  var W = wsDef(id), a = D.WS_LEVELS[id], h = '', i, L, st, n;
  if(!W) return;
  if(!wsOpen(W)){ n = W.need ? wsDef(W.need.ws) : null; modal('<h3>' + W.e + ' ' + esc(W.n) + ' 🔒</h3><p>先在 <b>' + (n ? n.e + ' ' + esc(n.n) : '') + '</b> 過 ' + (W.need ? W.need.n : 0) + ' 關,這裡就會打開!</p>'); return; }
  h += '<h3>' + W.e + ' ' + esc(W.n) + '</h3><p style="margin:0 0 1vmin;color:#6b6178">' + esc(T(W.d)) + '</p>';
  for(i = 0; i < a.length; i++){ L = D.LEVELS[a[i]]; st = A.save.stars[a[i]] | 0;
    h += '<div class="lvcard"><span style="font-size:4vmin">' + typeIcon(L.type) + '</span><span class="nm">' + (i + 1) + '. ' + esc(L.n) + '<div class="asub">' + typeName(L.type) + '・難度 ' + '●●●'.slice(0, L.diff) + '</div></span><span class="st">' + '★★★'.slice(0, st) + '<span style="opacity:.25">' + '★★★'.slice(0, 3 - st) + '</span></span><button class="abtn go" data-lv="' + a[i] + '">' + (st ? '再玩' : '開始') + '</button></div>'; }
  modal(h, [{ t: '❓ 這座工坊怎麼玩', cls: 'ghost', keep: true, cb: function(){ wsHow(id); } }, { t: '回村子', cls: 'ghost' }], { onOpen: function(m){
    var bs = m.querySelectorAll('[data-lv]'), j;
    for(j = 0; j < bs.length; j++) bs[j].onclick = function(ev){ ev.stopPropagation(); sfx('sfx-enter', 0.4); modalClose(); lvStart(this.getAttribute('data-lv')); };
  } });
}
/* ★ v1.0.3 工坊(主題)遊玩說明:這座學什麼、有哪些玩法、怎麼解鎖下一座 */
function wsHow(id){
  var W = wsDef(id), a = D.WS_LEVELS[id], seen = {}, h = '', i, L, H, nx = null;
  h += '<h3>' + W.e + ' ' + esc(W.n) + ' — 怎麼玩</h3><div class="scard">📚 <b>這座學什麼</b>:' + esc(T(W.d)) + '</div>';
  for(i = 0; i < a.length; i++){ L = D.LEVELS[a[i]]; if(seen[L.type]) continue; seen[L.type] = 1; H = D.HOWTO && D.HOWTO[L.type]; if(H) h += '<div class="scard">' + H.e + ' <b>' + esc(H.n) + '</b><br>' + nl2br(T(H)) + '</div>'; }
  for(i = 0; i < D.WORKSHOPS.length; i++){ if(D.WORKSHOPS[i].need && D.WORKSHOPS[i].need.ws === id) nx = D.WORKSHOPS[i]; }
  h += '<div class="scard">🔓 ' + (nx ? '在這裡過 ' + nx.need.n + ' 關,就會打開 ' + nx.e + ' <b>' + esc(nx.n) + '</b>。' : '這是目前最後一座工坊,全部 3 顆星挑戰看看!') + '<br>' + esc(T(D.STAR_RULE)) + '<br>過關拿到的資源回村子按 🏗 建造,村子就會恢復顏色。</div>';
  modal(h, [{ t: '回工坊', cb: function(){ wsOpenPanel(id); } }]);
}
function typeIcon(t){ return { sort: '↔️', wheel: '🎡', pickWheel: '🎯', mix: '🧪', label: '🏷', shadow: '💡', quiz: '❓', odd: '🔍', compose: '🖼', draw: '✍️' }[t] || '🎨'; }
function typeName(t){ return { sort: '拖曳排序', wheel: '色相環', pickWheel: '色彩轉盤', mix: '混色', label: '貼名牌', shadow: '光與影', quiz: '看圖判斷', odd: '找不同', compose: '構圖擺放', draw: '畫畫題' }[t] || ''; }

/* ★ v1.1.0 裝飾的解鎖條件(第 21 項) */
function needOk(nd){ if(!nd) return true; if(nd.stars && totalStars() < nd.stars) return false; if(nd.card && !hasCard(nd.card)) return false; if(nd.cards && cardCount() < nd.cards) return false; return true; }
function needTxt(nd){ if(!nd) return ''; if(nd.stars) return '🔒 總星數 ' + totalStars() + '/' + nd.stars; if(nd.card) return '🔒 需要' + D.CARDS[nd.card].e + D.CARDS[nd.card].n; if(nd.cards) return '🔒 大師卡 ' + cardCount() + '/' + nd.cards; return ''; }
function buildPanel(){
  var r = resNow(), h = '<h3>🏗 修復藝術村</h3><p style="margin:0;color:#6b6178">用過關拿到的資源蓋東西,村子就會恢復顏色。蓋好的裝飾可以按 <b>✋ 擺設</b> 換位置。</p>', i, b, k, ok, c, lk, sec = '';
  for(i = 0; i < D.BUILDS.length; i++){ b = D.BUILDS[i]; ok = true; c = ''; lk = !needOk(b.need);
    if(b.deco && sec !== 'deco'){ sec = 'deco'; h += '<h3 style="margin:2vmin 0 .4vmin">🎀 村子裝飾(收集獎勵)</h3>'; }
    for(k in b.cost){ if(!b.cost.hasOwnProperty(k)) continue; if(r[k] < b.cost[k]) ok = false; c += D.RES[k].e + b.cost[k] + ' '; }
    if(lk) ok = false;
    h += '<div class="lvcard"><span style="font-size:4.4vmin">' + b.e + '</span><span class="nm">' + esc(b.n) + ' <span class="asub">' + (b.pct ? '+' + b.pct + '% 顏色' : '裝飾') + '</span><div class="cost">' + esc(b.d) + '<br>' + c + (lk ? ' ' + needTxt(b.need) : '') + '</div></span>'
      + (A.save.builds[b.id] ? '<b class="ok">✅ 已完成</b>' : '<button class="abtn ' + (ok ? 'go' : 'ghost') + '" data-b="' + b.id + '"' + (ok ? '' : ' disabled') + '>蓋</button>') + '</div>'; }
  modal(h, [{ t: '✋ 擺設', cls: 'ghost', cb: function(){ A.arrange = true; paintHub(); } }, { t: '關閉', cls: 'ghost' }], { onOpen: function(m){
    var bs = m.querySelectorAll('[data-b]'), j;
    for(j = 0; j < bs.length; j++) bs[j].onclick = function(ev){ ev.stopPropagation(); doBuild(this.getAttribute('data-b')); };
  } });
}
function doBuild(id){
  var b = buildDef(id), r = resNow(), k;
  if(!b || A.save.builds[id]) return;
  if(!ownerOk()){ toast('帳號已經換人了,請重新進入創藝工坊'); return; }
  if(!needOk(b.need)){ toast(needTxt(b.need)); return; }
  for(k in b.cost){ if(b.cost.hasOwnProperty(k) && r[k] < b.cost[k]){ toast('資源不夠'); return; } }
  A.flashFrom = restorePct(); A.flash = id;   /* ★ v1.1.0 第 11 項:蓋好的那一塊閃一下,彩色圖從舊的恢復度淡入新的 */
  A.save.builds[id] = now();
  ledAdd('build', { id: id, r: (function(){ var o = {}, c; for(c in b.cost){ if(b.cost.hasOwnProperty(c)) o[c] = -b.cost[c]; } return o; })() });
  dailyHit('build', {});
  sfx(b.deco ? 'sfx-fantasy' : 'sfx-statup', 0.5); setTimeout(function(){ sfx('sfx-clap', 0.4); }, 350); toast(b.e + ' ' + b.n + ' 完成!' + (b.pct ? '村子顏色 +' + b.pct + '%' : '可以按 ✋ 擺設換位置'));
  saveSoon(); modalClose(); paintHub();   /* ★ v1.0.1 建造也合併存檔 */
  if(restorePct() >= 100) setTimeout(function(){ modal('<h3>🌈 藝術村完全恢復顏色了!</h3><p>褪色魔被你的創作趕跑了!接下來可以到 🎨 畫室自由創作。<br>(第二階段:全班一起蓋班級村子、排行榜與獎勵)</p>'); }, 900);
}
/* ★ v1.1.0 排行(第 17 項):個人榜 artRank/{週}/u 前 20 名;班級榜 artRank/{週}/c,以「參加同學的平均積分」排名,
   參加人數未達門檻(GM 設定 gameConfig/artGm.minClass,預設 5 人)的班級列在下面、不給名次 ⇒ 少數人刷分的小班不會霸榜 */
function minClass(){ var v = A.gm && +A.gm.minClass; return (v >= 1 && v <= 30) ? Math.round(v) : D.CLASS_MIN; }
function rankPanel(tab){
  var fb = B.fbNow ? B.fbNow() : null, wk = String(weekKey()), h = '<h3>🏆 藝術積分排行(本週)</h3>', t;
  tab = tab || 'me';
  h += '<div class="tabs">';
  t = [['me', '⭐ 我的積分'], ['u', '🎨 個人榜'], ['c', '🏘 班級榜']];
  for(var i = 0; i < t.length; i++) h += '<button class="mini' + (tab === t[i][0] ? ' on' : '') + '" data-tab="' + t[i][0] + '">' + t[i][1] + '</button>';
  h += '</div><div id="art-rank-body">';
  if(tab === 'me'){
    h += '<p>本週你的藝術積分:<b>⭐ ' + weekPts() + '</b><br>今天:<b>' + (A.save.pts[dayKey()] | 0) + ' / ' + capNow() + '</b>(每天最多計 ' + capNow() + ' 分,所有平板加起來算;重玩只算比上次多的星星)</p>';
    h += '<div class="scard">🖋 你的筆名:<b>' + esc(penOf()) + '</b>(排行和作品牆只顯示筆名,到 ⚙ 設定可以換)</div>';
    h += '<div class="scard">⚔️ 比賽、🗓 每週主題得到的積分另外算,不受每日上限。每週一 08:00 重新計算。</div>';
  } else h += '<p style="color:#6b6178">' + (A.guest || !fb ? '登入學校帳號才看得到排行榜。' : '讀取中…') + '</p>';
  h += '</div>';
  modal(h, [{ t: '關閉', cls: 'ghost' }], { onOpen: function(m){
    var bs = m.querySelectorAll('[data-tab]'), j;
    for(j = 0; j < bs.length; j++) bs[j].onclick = function(ev){ ev.stopPropagation(); rankPanel(this.getAttribute('data-tab')); };
  } });
  if(tab === 'me' || A.guest || !fb) return;
  var col = fb.db.collection('artRank').doc(wk).collection(tab === 'u' ? 'u' : 'c'), q = tab === 'u' ? col.orderBy('p', 'desc').limit(20) : col.limit(80);
  q.get().then(function(snap){
    var el = $('art-rank-body'), rows = [], o = '', k, n, s, mn = minClass(), r = 0;
    if(!el) return;
    snap.forEach(function(d){ rows.push(d.data() || {}); });
    if(tab === 'u'){
      if(!rows.length){ el.innerHTML = '<p>本週還沒有人上榜,快去拿第一名!</p>'; return; }
      for(k = 0; k < rows.length; k++){ s = rows[k]; o += '<div class="lvcard"' + (s.uid === A.uid ? ' style="background:#fff3b0"' : '') + '><b style="width:6vmin;text-align:center">' + (k < 3 ? ['🥇', '🥈', '🥉'][k] : (k + 1)) + '</b><span class="nm">' + esc(s.pen || '小畫家') + '<div class="asub">' + esc(s.cls || '') + '</div></span><b>⭐ ' + (s.p | 0) + '</b></div>'; }
    } else {
      for(k = 0; k < rows.length; k++){ s = rows[k]; n = 0; var sum = 0, u2; for(u2 in (s.m || {})){ if(s.m.hasOwnProperty(u2) && (s.m[u2] | 0) > 0){ n++; sum += s.m[u2] | 0; } } s._n = n; s._avg = n ? Math.round(sum / n) : 0; s._ok = n >= mn; }
      rows.sort(function(a, b){ return (b._ok - a._ok) || (b._avg - a._avg); });
      if(!rows.length){ el.innerHTML = '<p>本週還沒有班級上榜。</p>'; return; }
      o += '<p style="font-size:2.1vmin;color:#6b6178">班級分數 = 參加同學的平均積分;參加人數要 <b>' + mn + ' 人以上</b>才排名次。</p>';
      for(k = 0; k < rows.length; k++){ s = rows[k]; if(s._ok) r++;
        o += '<div class="lvcard"' + (s._ok ? '' : ' style="opacity:.55"') + '><b style="width:6vmin;text-align:center">' + (s._ok ? (r <= 3 ? ['🥇', '🥈', '🥉'][r - 1] : r) : '—') + '</b><span class="nm">' + esc(s.c || '') + '<div class="asub">' + s._n + ' 人參加' + (s._ok ? '' : '(未達 ' + mn + ' 人,不列名次)') + '</div></span><b>⭐ ' + s._avg + '</b></div>'; }
    }
    el.innerHTML = o;
  })['catch'](function(){ var el = $('art-rank-body'); if(el) el.innerHTML = '<p>排行榜暫時讀不到(請老師確認雲端規則已更新)。</p>'; });
}
function helpPanel(){
  var h = '<h3>📖 創藝工坊說明書</h3>';
  h += '<div class="scard">🌈 <b>故事</b>:褪色魔吸走了藝術村的顏色。到工坊過關拿資源,回村子 🏗 建造,村子就會變回彩色。</div>';
  h += '<div class="scard">✋ <b>操作</b>:拖曳、點一下、長按看說明。電腦用滑鼠或繪圖板。</div>';
  h += '<div class="scard">⭐ <b>星星與積分</b>:星星越多資源越多;每天最多計 ' + capNow() + ' 積分,重玩只算比上次多的星星。</div>';
  h += '<div class="scard">❓ <b>忘記怎麼玩</b>:每座工坊、每一關、畫布的右上角都有 <b>❓ 怎麼玩</b>,隨時打開看。</div>';
  h += '<div class="scard">📅 <b>今日挑戰</b>:每天 3 個小任務(左下角),完成拿額外資源和積分。⚔️ <b>比賽</b>、🗓 <b>每週主題</b>開放時也會出現在左下角。</div>';
  h += '<div class="scard">📒 <b>收藏</b>:一座工坊全部 ⭐⭐⭐ 就拿到那位大師的卡;大師卡會解鎖特殊筆刷,星星越多貼紙越多,還能蓋村子裝飾、按 ✋ 擺設換位置。</div>';
  h += '<div class="scard">🎨 <b>畫布</b>:平板兩指捏縮放、兩指點一下復原、三指點一下重做、手指在畫好的顏色上按住不動吸色。電腦:B 筆刷、E 橡皮擦、I 吸管、[ ] 粗細、Ctrl+Z 復原、空白鍵拖曳平移、滾輪縮放、Shift 畫直線、? 看快捷鍵。</div>';
  modal(h, [{ t: '重看新手教學', cls: 'ghost', cb: function(){ tutRun('welcome', null, true); } }, { t: '看懂了' }]);
}
function setPanel(){
  var u = user(), h = '<h3>⚙ 設定</h3>';
  h += '<div class="lvcard"><span class="nm">說明文字風格</span><button class="abtn ' + (A.style === 'c' ? 'go' : 'ghost') + '" data-s="c">簡單風</button><button class="abtn ' + (A.style === 'p' ? 'go' : 'ghost') + '" data-s="p">精緻風</button></div>';
  h += '<div class="lvcard"><span class="nm">省電畫布(舊平板建議開)<div class="asub">畫布變小、復原 20 步' + (liteMode() === 'auto' ? '・目前「自動」:' + (A.lite ? '這台偵測為舊平板,已自動開' : '這台夠快,不用開') : '') + '</div></span><button class="abtn ' + (A.lite ? 'go' : 'ghost') + '" data-l="1">' + (A.lite ? '開' : '關') + '</button>' + (liteMode() !== 'auto' ? '<button class="abtn ghost" data-l="auto">自動</button>' : '') + '</div>';
  h += '<div class="lvcard"><span class="nm">🎵 背景音樂<div class="asub">音量跟小遊戲的音樂音量設定一樣;這裡只管創藝工坊開或關</div></span><button class="abtn ' + (musicOn() ? 'go' : 'ghost') + '" data-mu="1">' + (musicOn() ? '開' : '關') + '</button></div>';
  h += '<div class="lvcard"><span class="nm">🖋 筆名<div class="asub">排行榜和作品牆只顯示筆名(老師看得到真名)</div></span><b>' + esc(penOf()) + '</b><button class="abtn ghost" data-pen="1"' + (A.guest ? ' disabled' : '') + '>🎲 換一個</button></div>';
  h += '<div class="lvcard"><span class="nm">帳號<div class="asub">' + (u ? esc(u.email || u.displayName || '') : '訪客(進度只存在這台)') + '</div></span><button class="abtn ghost" data-k2="login">' + (u ? '登出' : '登入') + '</button></div>';
  h += '<p style="font-size:2vmin;color:#8a7e95">創藝工坊 ' + ART_VER + '・資料 ' + D.VER + (isGm() ? '・GM' : '') + '</p>';
  modal(h, [{ t: '關閉', cls: 'ghost' }], { onOpen: function(m){
    var a = m.querySelectorAll('[data-s]'), j;
    for(j = 0; j < a.length; j++) a[j].onclick = function(ev){ ev.stopPropagation(); A.style = this.getAttribute('data-s'); lsSet('art_style', A.style); modalClose(); paintHub(); setPanel(); };
    m.querySelector('[data-l="1"]').onclick = function(ev){ ev.stopPropagation(); A.lite = !A.lite; lsSet('art_lite', A.lite ? '1' : '0'); modalClose(); setPanel(); };
    if(m.querySelector('[data-l="auto"]')) m.querySelector('[data-l="auto"]').onclick = function(ev){ ev.stopPropagation(); lsDel('art_lite'); A.lite = liteAuto(); modalClose(); setPanel(); };
    m.querySelector('[data-mu]').onclick = function(ev){ ev.stopPropagation(); lsSet('art_bgm', musicOn() ? '0' : '1'); if(musicOn()) music('hub'); else musicStop(); modalClose(); setPanel(); };
    m.querySelector('[data-pen]').onclick = function(ev){ ev.stopPropagation(); if(A.guest) return; var r0 = Math.random(), n = D.PEN_A[Math.floor(r0 * D.PEN_A.length)] + D.PEN_B[Math.floor(Math.random() * D.PEN_B.length)] + (10 + Math.floor(Math.random() * 90)); A.save.pen = { n: n, t: now() }; saveSoon(); modalClose(); setPanel(); };
    m.querySelector('[data-k2=login]').onclick = function(ev){ ev.stopPropagation(); modalClose(); if(B.login) B.login(); };
  } });
}
function gate(kind){
  musicStop();
  var root = $('art-root'); if(root){ root.innerHTML = '<div class="vil" style="filter:grayscale(1)">' + villageSvgEmpty() + '</div>'; }
  modal(kind === 'login' ? '<h3>🎨 創藝工坊</h3><p>創藝工坊要<b>登入學校帳號</b>才能玩,這樣你的作品和積分才會存在自己的帳號裡喔!</p>' : '<h3>🎨 創藝工坊</h3><p>藝術村正在最後測試中,老師開放後就可以進來玩了,敬請期待!</p>', [{ t: '回首頁', cb: function(){ exitNow(); } }].concat(user() ? [] : [{ t: '🔑 登入', cls: 'ghost', keep: true, cb: function(){ modalClose(); if(B.login) B.login(); } }]));
}
function villageSvgEmpty(){ return '<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%"><rect width="1600" height="900" fill="#cfd6dc"/><path d="M0 470 Q400 340 800 450 T1600 420 L1600 900 L0 900 Z" fill="#9aa39a"/></svg>'; }
function exitAsk(){ confirmBox('離開創藝工坊?進度已經存好了。', function(ok){ if(ok) exitNow(); }); }
function exitNow(toUrl){
  musicStop();
  try{ if(A.save && !A.guest && ownerOk()) saveNow(); else if(A.save) localWrite(false); }catch(e){}
  try{ if(A.cv && A.cv.close) A.cv.close(true); }catch(e2){}
  modalClose();
  try{ if(B.handoff) B.handoff(); }catch(e3){}
  if(B.loading) B.loading(true);
  setTimeout(function(){ A.on = false; try{ location.href = (typeof toUrl === 'string' && toUrl) ? toUrl : '../'; }catch(e4){} }, 700);   /* 與荒島 islExitNow 相同:讓雲端寫入有 700ms 送出,回主程式首頁(★ v1.1.4 也可指定去處:美術設計師工作室) */
}

/* ══ 進入 ══ */
function enter(){
  if(A.on) return;
  if(!D){ toast('創藝工坊資料載入失敗,請重新整理'); return; }
  A.on = true;
  try{ document.documentElement.classList.add('art-mode'); }catch(e0){}
  A.style = lsGet('art_style') === 'p' ? 'p' : 'c';
  A.lite = liteMode() === 'auto' ? liteAuto() : (liteMode() === 'on');   /* ★ v1.1.0 第 5 項:沒手動設定過 ⇒ 舊平板自動開 */
  injectCss();
  var root = $('art-root');
  if(!root){ root = document.createElement('div'); root.id = 'art-root'; document.body.appendChild(root); }
  try{ document.title = '小英雄 — 🎨 創藝工坊'; }catch(e){}
  try{ if(B.veilOff) B.veilOff(); }catch(e5){}
  if(B.loading) B.loading(true);
  accFetch(function(){   /* ★ v1.0.2 先讀 GM 開關(最多 3 秒) */
  var u = user(), st = accessCheck(u);
  if(st !== 'ok'){ if(B.loading) B.loading(false); gate(st); return; }
  srvSync(null);
  loadFor(u, function(){
    if(B.loading) B.loading(false);
    paintHub();
    tutRun('welcome', function(){ liteNotice(); });
    afterEnter();
  });
  });
}
/* ★ v1.1.0 第 5 項:舊平板自動開省電畫布(比照大對抗 v5.340.0「平板自動流暢模式」)
   平板 + (CPU 小測速偏慢 或 記憶體 ≤3GB)⇒ 自動開;任何裝置測速很慢也開。學生手動切過就以手動為準(⚙ 可改回「自動」)。 */
function liteMode(){ var v = lsGet('art_lite'); return v === '1' ? 'on' : (v === '0' ? 'off' : 'auto'); }
function liteBench(){ if(A.benchMs != null) return A.benchMs; var best = 1e9, r, t0, x = 0, i, t1, P = window.performance && performance.now ? function(){ return performance.now(); } : now;
  for(r = 0; r < 3; r++){ t0 = P(); for(i = 0; i < 300000; i++) x += Math.sqrt(i) * 1.0001 % 7; t1 = P(); if(t1 - t0 < best) best = t1 - t0; }   /* 跑三次取最快,避免剛開機的偶發卡頓誤判 */
  A.benchMs = Math.max(0, best) + (x > 1e15 ? 1 : 0); return A.benchMs; }
function isTablet(){ var ua = navigator.userAgent || ''; return /iPad/.test(ua) || (/Macintosh/.test(ua) && (navigator.maxTouchPoints || 0) > 1) || (/Android/i.test(ua) && !/Mobile/i.test(ua)); }
function liteAuto(){
  var tab = isTablet(), mem = navigator.deviceMemory || 0, b = liteBench();
  return (tab && (b > 4 || (mem && mem <= 3))) || b > 20;
}
function liteNotice(){
  if(liteMode() !== 'auto' || !A.lite || lsGet('art_lite_told')) return;
  lsSet('art_lite_told', '1');
  modal('<h3>🔋 已自動開啟「省電畫布」</h3><p>' + (A.style === 'p' ? '偵測到此裝置效能較低,已自動縮小畫布並減少復原步數以維持流暢。' : (isTablet() ? '這台平板比較舊' : '這台電腦比較慢') + ',為了畫畫時不卡,已經自動把畫布調小一點。') + '</p><p style="font-size:2.2vmin;color:#6b6178">想要大畫布:按右上角 <b>⚙ 設定</b> → 省電畫布 → 關。</p>');
}
/* 進村子之後才做的事(不擋畫面):讀 GM 設定、列出進行中的比賽/主題、領取已公布的活動獎勵 */
function afterEnter(){
  var fb = B.fbNow ? B.fbNow() : null;
  if(!fb || !fb.db || !user()) return;
  try{ fb.db.collection('gameConfig').doc('artGm').get().then(function(d){ if(d && d.exists) A.gm = d.data() || null; })['catch'](function(){}); }catch(e){}
  evRefresh();
  evClaim();
  clearInterval(A.evTimer); A.evTimer = setInterval(function(){ if(!A.on) return; if(A.screen === 'hub' && !$('art-lv') && !$('art-cv')) evTick(); }, 1000);
}
/* ★ v1.1.0 轉向/視窗大小改變 ⇒ 村子重新排位置(只在村子畫面、沒有開視窗時) */
var _hubRz = 0; window.addEventListener('resize', function(){ clearTimeout(_hubRz); _hubRz = setTimeout(function(){ if(A.on && A.save && A.screen === 'hub' && !A.arrange && !$('art-lv') && !$('art-cv') && $('art-vil')){ var vc = $('art-vc'), op = vc ? vc.style.opacity : null; paintHub(); } }, 300); });
document.addEventListener('visibilitychange', function(){ if(document.hidden && A.on && A.save && isDirty()){ clearTimeout(A.wt); A.wt0 = 0; localWrite(false); if(!A.guest && ownerOk()) cloudSync(); } });   /* ★ v1.0.1 切背景只有在有變動時才寫 */
window.addEventListener('pagehide', function(){ if(A.on && A.save && isDirty()){ localWrite(false); if(!A.guest && ownerOk()) cloudSync(); } });

/* ══════════════════════════════════════════════════════════════════════════
   ★ v1.1.0 第 19 項:📅 每日挑戰(每人每天 3 個;種子 = uid|伺服器日期 ⇒ 同一天換平板也是同 3 個)
   ══════════════════════════════════════════════════════════════════════════ */
function dailyList(){
  if(!A.save) return [];
  var dk = dayKey(), key = (A.uid || 'guest') + '|' + dk, r, pool = [], out = [], i, d, W, any = false, k;
  if(A.dlKey === key && A.dl) return A.dl;
  for(k in A.save.stars){ if(A.save.stars.hasOwnProperty(k) && (A.save.stars[k] | 0) > 0 && (A.save.stars[k] | 0) < 3) any = true; }
  for(i = 0; i < D.DAILY.length; i++){ d = D.DAILY[i];
    if(d.t === 'ws'){ W = wsDef(d.ws); if(!W || !wsOpen(W)) continue; }
    if(d.t === 'improve' && !any) continue;
    if(d.t === 'build' && restorePct() >= 100 && !D.BUILDS.filter(function(b){ return !A.save.builds[b.id] && needOk(b.need); }).length) continue;
    pool.push(d); }
  r = rng(hashStr(key));
  while(out.length < 3 && pool.length) out.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
  A.dlKey = key; A.dl = out;
  return out;
}
function dailyHit(type, info){
  if(!A.save) return;
  var dl = dailyList(), dk = String(dayKey()), i, d, hit, pr;
  for(i = 0; i < dl.length; i++){ d = dl[i]; if(A.save.dq[dk + '_' + d.id]) continue; hit = false;
    if(type === 'clear' && info.stars > 0){
      if(d.t === 'clear') hit = true;
      else if(d.t === 'star3' && info.stars === 3) hit = true;
      else if(d.t === 'nomiss' && info.miss === 0) hit = true;
      else if(d.t === 'ws' && info.ws === d.ws) hit = true;
      else if(d.t === 'improve' && info.old > 0 && info.stars > info.old) hit = true;
    } else if(type === 'build' && d.t === 'build') hit = true;
    else if(type === 'paint' && d.t === 'paint'){
      if(d.k === 'cool') hit = info.colored > 0.05 && info.cool >= 0.7;
      else if(d.k === 'warm') hit = info.colored > 0.05 && info.warm >= 0.7;
      else if(d.k === 'layers') hit = info.layers >= (d.n || 3);
      else if(d.k === 'gray') hit = info.cover > 0.05 && info.colored < 0.03 && info.grays >= 4;
    }
    if(!hit) continue;
    if(!A.save.dp[dk]) A.save.dp[dk] = {};
    pr = A.save.dp[dk][d.id] = (A.save.dp[dk][d.id] | 0) + 1;
    if(pr >= (d.t === 'paint' ? 1 : (d.n || 1))) dailyDone(d);
  }
  saveSoon();
}
function dailyDone(d){
  var dk = String(dayKey()), g, c, s = '';
  A.save.dq[dk + '_' + d.id] = 1;
  g = ptsAdd(D.DAILY_PTS);
  ledAdd('dq', { id: d.id, g: g, r: d.r });
  for(c in d.r){ if(d.r.hasOwnProperty(c)) s += D.RES[c].e + '+' + d.r[c] + ' '; }
  sfx('sfx-medal', 0.5); toast('📅 今日挑戰完成:' + T(d) + '  ' + s + (g ? '⭐+' + g : ''));
  var ch = $('art-daily'); if(ch){ var dl = dailyList(), n = 0, i; for(i = 0; i < dl.length; i++){ if(A.save.dq[dk + '_' + dl[i].id]) n++; } ch.textContent = '📅 今日挑戰 ' + n + '/' + dl.length; }
}
function dailyPanel(){
  var dl = dailyList(), dk = String(dayKey()), h = '<h3>📅 今日挑戰</h3><p style="margin:0 0 1vmin;color:#6b6178">每天換 3 個小任務(伺服器時間 00:00 換),完成就拿額外資源和 ⭐' + D.DAILY_PTS + ' 積分。</p>', i, d, ok, pr, c, rw;
  for(i = 0; i < dl.length; i++){ d = dl[i]; ok = !!A.save.dq[dk + '_' + d.id]; pr = (A.save.dp[dk] && A.save.dp[dk][d.id]) | 0; rw = '';
    for(c in d.r){ if(d.r.hasOwnProperty(c)) rw += D.RES[c].e + d.r[c] + ' '; }
    h += '<div class="lvcard"' + (ok ? ' style="background:#d9f7e2"' : '') + '><span style="font-size:4vmin">' + (ok ? '✅' : '🎯') + '</span><span class="nm">' + esc(T(d)) + '<div class="asub">獎勵 ' + rw + '⭐' + D.DAILY_PTS + (d.n > 1 && !ok ? '・進度 ' + Math.min(pr, d.n) + '/' + d.n : '') + '</div></span></div>'; }
  if(!dl.length) h += '<p>今天的挑戰都完成了!</p>';
  modal(h, [{ t: '好', cls: 'go' }]);
}
/* 畫室作品分析(每日挑戰用):寒/暖色比例、圖層數、灰階層數 */
function paintInfo(img){
  var d = img.d.data, n = img.w * img.h, i, r, g, b, mx, mn, sat, hh, col = 0, cool = 0, warm = 0, painted = 0, bins = [0, 0, 0, 0, 0, 0, 0, 0, 0], lv = 0, lum;
  for(i = 0; i < n; i++){ r = d[i * 4]; g = d[i * 4 + 1]; b = d[i * 4 + 2]; if(r > 244 && g > 244 && b > 244) continue; painted++;
    mx = Math.max(r, g, b); mn = Math.min(r, g, b); sat = mx ? (mx - mn) / mx : 0; lum = 0.299 * r + 0.587 * g + 0.114 * b; bins[Math.min(8, Math.floor(lum / 256 * 9))]++;
    if(sat > 0.25 && mx > 50){ col++; hh = hex2hsv('#' + ('0' + r.toString(16)).slice(-2) + ('0' + g.toString(16)).slice(-2) + ('0' + b.toString(16)).slice(-2)).h;
      if(hh >= 90 && hh < 300) cool++; else if(hh < 70 || hh >= 330) warm++; } }
  for(i = 0; i < 9; i++){ if(bins[i] >= Math.max(8, painted * 0.025)) lv++; }
  return { cover: painted / n, colored: painted ? col / painted : 0, cool: col ? cool / col : 0, warm: col ? warm / col : 0, layers: img.layers, grays: lv };
}

/* ══ ★ v1.1.0 第 21 項:📒 收藏冊(大師卡、貼紙、特殊筆刷、裝飾) ══ */
function stickersOwned(){ var a = [], i, j, ts = totalStars(), k; for(i = 0; i < D.STICKERS.length; i++){ if(ts >= D.STICKERS[i].need) for(j = 0; j < D.STICKERS[i].e.length; j++) a.push(D.STICKERS[i].e[j]); }
  for(k in D.CARDS){ if(D.CARDS.hasOwnProperty(k) && hasCard(k)) a.push(D.CARDS[k].e); } return a; }
function brushesOwned(){ var a = [], k; for(k in D.CARDS){ if(D.CARDS.hasOwnProperty(k) && D.CARDS[k].brush && hasCard(k)) a.push(D.CARDS[k].brush); } return a; }
function collPanel(){
  var h = '<h3>📒 收藏冊</h3>', k, C, a, n, i, j, own = stickersOwned(), ts = totalStars(), next = null, bo = brushesOwned(), dn = 0, dt = 0;
  h += '<div class="scard">🃏 <b>大師卡</b>:一座工坊每一關都拿到 ⭐⭐⭐,就得到那位大師的卡(集滿 8 張,第二階段可換限定藝術系英雄)。</div><div class="card8">';
  for(k in D.CARDS){ if(!D.CARDS.hasOwnProperty(k)) continue; C = D.CARDS[k]; a = D.WS_LEVELS[k] || []; n = 0; for(i = 0; i < a.length; i++){ if((A.save.stars[a[i]] | 0) >= 3) n++; }
    h += '<div class="mcard' + (hasCard(k) ? '' : ' off') + '" title="' + esc(T(C)) + '"><div class="e">' + (hasCard(k) ? C.e : '❔') + '</div>' + esc(C.n) + '<div style="font-size:.85em;font-weight:700">' + (wsDef(k) ? wsDef(k).e + ' ' : '') + n + '/' + a.length + ' 關 3★</div></div>'; }
  h += '</div>';
  for(i = 0; i < D.STICKERS.length; i++){ if(ts < D.STICKERS[i].need){ next = D.STICKERS[i]; break; } }
  h += '<div class="scard">🏷 <b>貼紙</b>(畫布的 🏷 印章工具):' + own.join(' ') + (next ? '<br><span class="asub">總星數 ' + ts + '/' + next.need + ' 解鎖下一包 ' + next.e.join('') + '</span>' : '') + '</div>';
  h += '<div class="scard">🖌 <b>特殊筆刷</b>(畫室與比賽可用):';
  for(k in D.SPECIAL_BRUSH){ if(D.SPECIAL_BRUSH.hasOwnProperty(k)) h += '<br>' + (bo.indexOf(k) >= 0 ? '✅ ' : '🔒 ') + esc(D.SPECIAL_BRUSH[k]); }
  h += '</div>';
  for(j = 0; j < D.BUILDS.length; j++){ if(D.BUILDS[j].deco){ dt++; if(A.save.builds[D.BUILDS[j].id]) dn++; } }
  h += '<div class="scard">🎀 <b>村子裝飾</b>:' + dn + '/' + dt + ' 已蓋好(到 🏗 建造看解鎖條件,蓋好後可按 ✋ 擺設換位置)</div>';
  modal(h, [{ t: '好', cls: 'go' }]);
}

/* ══ ★ v1.1.0 第 3 項:作品/草稿備份到 Firebase Storage artWorks/{uid}/(平板清資料也找得回來) ══
   ⚠ 從雲端「下載回平板」要讀 JSON,需要 Storage bucket 開 CORS(補丁說明裡有一行指令);沒開也不影響上傳與縮圖顯示。 */
var FB_STO = 'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage-compat.js';
function sto(cb){
  var fb = B.fbNow ? B.fbNow() : null;
  if(!fb || !fb.app || !window.firebase){ cb(null); return; }
  if(A.sto){ cb(A.sto); return; }
  function mk(){ try{ A.sto = window.firebase.storage(fb.app); }catch(e){ A.sto = null; } cb(A.sto); }
  if(window.firebase.storage) mk(); else loadJs((B.fbBase ? B.fbBase() : 'https://www.gstatic.com/firebasejs/10.12.0/') + 'firebase-storage-compat.js', function(ok){ if(ok && window.firebase.storage) mk(); else cb(null); });
}
function cloudWorkPut(rec, isDraft){
  if(A.guest || !A.uid || !ownerOk() || !rec) return;
  var uid = A.uid, base = 'artWorks/' + uid + '/' + rec.id;
  sto(function(s){ if(!s || A.uid !== uid) return;
    try{
      s.ref(base + '.json').putString(JSON.stringify(rec), 'raw', { contentType: 'application/json' }).then(function(){ if(!isDraft) A.cloudOk = true; })['catch'](function(e){ try{ console.warn('[art sto]', e && e.code); }catch(_){} });
      if(rec.thumb && !isDraft) s.ref(base + '.jpg').putString(rec.thumb, 'data_url').then(function(){}, function(){});
    }catch(e){}
  });
}
function cloudWorkDel(id){ if(A.guest || !A.uid) return; var uid = A.uid; sto(function(s){ if(!s) return; try{ s.ref('artWorks/' + uid + '/' + id + '.json')['delete']().then(function(){}, function(){}); s.ref('artWorks/' + uid + '/' + id + '.jpg')['delete']().then(function(){}, function(){}); }catch(e){} }); }
var cdT = {};
function cloudDraftSoon(rec){ if(A.guest) return; clearTimeout(cdT[rec.id]); cdT[rec.id] = setTimeout(function(){ cloudWorkPut(rec, true); }, 20000); }   /* 草稿 20 秒合併一次上傳 */
function cloudRestore(){
  if(A.guest){ toast('登入後才有雲端備份'); return; }
  var uid = A.uid;
  toast('☁ 正在找雲端備份…');
  sto(function(s){
    if(!s){ toast('☁ 雲端備份目前連不上'); return; }
    s.ref('artWorks/' + uid).listAll().then(function(res){
      idbList(uid + '|', function(local){
        var have = {}, i, todo = [], got = 0, bad = 0;
        for(i = 0; i < local.length; i++) have[local[i].id] = 1;
        res.items.forEach(function(it){ var nm = it.name; if(/\.json$/.test(nm) && !have[nm.replace(/\.json$/, '')]) todo.push(it); });
        if(!todo.length){ toast('☁ 雲端的作品這台都有了'); return; }
        todo.forEach(function(it){ it.getDownloadURL().then(function(u){ return fetch(u); }).then(function(r){ return r.json(); }).then(function(rec){
            if(rec && rec.uid === uid && rec.id){ idbPut(uid + '|' + rec.id, rec, function(){}); got++; } else bad++; })['catch'](function(){ bad++; })
          .then(function(){ if(got + bad === todo.length){ toast(got ? '☁ 找回 ' + got + ' 件作品/草稿' : '☁ 下載不到(老師要先開 Storage 的 CORS,見補丁說明)'); if(got && !$('art-cv') && !$('art-modal') && !$('art-tut') && !$('art-lv')) studioOpen(); } }); });
      });
    })['catch'](function(){ toast('☁ 雲端備份讀不到(請老師確認 storage.rules 已發布)'); });
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   ★ v1.1.0 第 15、20 項:⚔️ 比賽(限時,伺服器時間)與 🗓 每週主題(全校交件+作品牆)
   artEvents/{e日期亂碼} = { type:'contest'|'week', title, task, ask, ratio, mins, code, state:'open'|'review'|'done', revealed, by, at, startAt, endAt }
     /entries/{uid} = { uid, pen, cls, sys, st, card, url, th, at, n }(學生;rules 檢查 at == 伺服器時間、截止前 90 秒寬限)
                     + { adj, tags, hidden, final, rank, award }(老師)
     /who/{uid}     = { uid, nm, em, at }(真名,只有本人與 GM 讀得到 ⇒ 老師評分時先隱藏作者,公布後才顯示)
   ══════════════════════════════════════════════════════════════════════════ */
function evLeft(ev){ return (ev.endMs || 0) - srvNow(); }
function evLeftTxt(ev){ var ms = evLeft(ev), s, m; if(ms <= 0) return '已截止'; if(ms > 86400000) return '剩 ' + Math.ceil(ms / 86400000) + ' 天'; s = Math.floor(ms / 1000); m = Math.floor(s / 60);
  return (m >= 60 ? Math.floor(m / 60) + ':' + ('0' + (m % 60)).slice(-2) : m) + ':' + ('0' + (s % 60)).slice(-2); }
function evFromDoc(d){ var o = d.data() || {}; o.id = d.id; o.endMs = o.endAt && o.endAt.toMillis ? o.endAt.toMillis() : (+o.endAt || 0); o.startMs = o.startAt && o.startAt.toMillis ? o.startAt.toMillis() : 0; return o; }
function evRefresh(){
  var fb = B.fbNow ? B.fbNow() : null; if(!fb || !fb.db || !user()) return;
  A.evAt = now();
  fb.db.collection('artEvents').where('state', '==', 'open').limit(10).get().then(function(snap){
    var a = [];
    snap.forEach(function(d){ var o = evFromDoc(d); if(o.endMs > srvNow() - 60000) a.push(o); });
    a.sort(function(x, y){ return (x.type === 'contest' ? 0 : 1) - (y.type === 'contest' ? 0 : 1) || x.endMs - y.endMs; });
    var sig = a.map(function(o){ return o.id; }).join(), old = A.evs.map(function(o){ return o.id; }).join();
    A.evs = a;
    if(sig !== old && A.screen === 'hub' && $('art-root') && !$('art-lv') && !$('art-cv') && !A.arrange) paintHub();
  })['catch'](function(){});
}
function evTick(){
  var i, el, ev;
  for(i = 0; i < A.evs.length; i++){ ev = A.evs[i]; el = document.querySelector('[data-evt="' + ev.id + '"]'); if(el) el.textContent = evLeftTxt(ev); }
  if(now() - (A.evAt || 0) > 60000) evRefresh();
}
function evById(id){ var i; for(i = 0; i < A.evs.length; i++){ if(A.evs[i].id === id) return A.evs[i]; } return null; }
function evTaskName(t){ return { free: '自由主題', gray5: '明暗五階', complement: '互補色招牌', thirds: '三分法構圖', media3: '三種筆觸', dots: '點描' }[t] || t; }
function evOpen(id){
  var ev = evById(id), h, R, sent;
  if(!ev) return;
  sent = !!A.save.ej[id];
  R = D.RUBRIC[ev.task] || D.RUBRIC.free;
  h = '<h3>' + (ev.type === 'contest' ? '⚔️ 比賽' : '🗓 本週主題') + ':' + esc(ev.title || '') + '</h3>';
  h += '<div class="scard">🎯 <b>題目</b>:' + esc(ev.ask || ev.title || '') + '<br>📐 畫布 ' + esc(ev.ratio || '4:3') + '・🧩 評分項目:' + evTaskName(ev.task) + '<br>⏱ ' + (ev.type === 'contest' ? '剩 ' : '') + evLeftTxt(ev) + '(以伺服器時間為準,時間到自動交件)</div>';
  h += '<div class="scard">📋 <b>系統怎麼評分</b>(老師看完會再加減分)<br>' + nl2br(T(R)) + '</div>';
  if(ev.type === 'contest' && ev.code && !(A.evCode && A.evCode[id])) h += '<div class="scard">🔢 請輸入老師給的 <b>4 碼比賽代碼</b>:<input type="text" id="art-evcode" inputmode="numeric" maxlength="4" style="width:14vmin;text-align:center"></div>';
  if(sent) h += '<p class="ok">✅ 你已經交過件了,截止前還可以重新交(會蓋掉上一張)。</p>';
  if(A.guest) h += '<p class="bad">要登入學校帳號才能參加。</p>';
  modal(h, [{ t: '取消', cls: 'ghost' }, { t: sent ? '🎨 重新創作' : '🎨 開始創作', dis: A.guest || evLeft(ev) <= 0, keep: true, cb: function(){
    var ci = $('art-evcode');
    if(ci){ if(String(ci.value).replace(/\D/g, '') !== String(ev.code)){ toast('代碼不對,問問老師喔'); shake(ci); return; } A.evCode = A.evCode || {}; A.evCode[id] = 1; }
    modalClose(); if(ev.type === 'contest') sfx('sfx-battlescreen', 0.45); evCanvas(ev);
  } }]);
}
function evCanvas(ev){
  var all = ['pencil', 'charcoal', 'marker', 'water', 'air', 'eraser'].concat(brushesOwned());
  canvasOpen({ task: ev.task || 'free', draftId: 'ev_' + ev.id, title: (ev.type === 'contest' ? '⚔️ ' : '🗓 ') + (ev.title || ''), ask: ev.ask || ev.title, ratio: ev.ratio || '4:3', brushes: ev.task === 'gray5' ? ['pencil', 'charcoal', 'eraser'] : all, gray: ev.task === 'gray5', grid: ev.task === 'thirds', stickers: ev.task !== 'gray5' && ev.task !== 'dots', endMs: ev.endMs, submitLabel: '📤 交件',
    onSubmit: function(img, cv, auto){ evSubmit(ev, img, cv, auto); } });
}
function evSubmit(ev, img, cv, auto){
  var fb = B.fbNow ? B.fbNow() : null, f = FV(), uid = A.uid, r, sys, big, th, u = user(), cls = clsOf() || '';
  if(!fb || !f || A.guest || !ownerOk()){ toast('要登入、連上網路才能交件'); return; }
  if(A.evBusy) return; A.evBusy = true;
  r = evalDraw(ev.task && ev.task !== 'free' ? ev.task : 'free', img);
  sys = clamp(Math.round(r.stars * 25 + completeScore(img)), 0, 100);
  big = cv.flatten(1200).toDataURL('image/jpeg', 0.85); th = cv.flatten(240).toDataURL('image/jpeg', 0.72);
  toast('📤 交件中…');
  function writeDocs(url){
    var er = fb.db.collection('artEvents').doc(ev.id).collection('entries').doc(uid), wr = fb.db.collection('artEvents').doc(ev.id).collection('who').doc(uid), bt = fb.db.batch();
    bt.set(er, { uid: uid, pen: penOf(), cls: cls, sys: sys, st: r.stars, card: (r.card || []).slice(0, 8).map(function(c){ return { ok: c.ok ? 1 : 0, t: String(c.t).slice(0, 80) }; }), url: url || '', th: th, at: f.serverTimestamp(), n: ((A.evN && A.evN[ev.id]) | 0) + 1 });
    bt.set(wr, { uid: uid, nm: String(uName(u)).slice(0, 60), em: String((u && u.email) || '').slice(0, 80), at: f.serverTimestamp() });
    return bt.commit();
  }
  sto(function(s){
    var p = s ? s.ref('artEvents/' + ev.id + '/' + uid + '.jpg').putString(big, 'data_url', { contentType: 'image/jpeg' }).then(function(){ return 'artEvents/' + ev.id + '/' + uid + '.jpg'; })['catch'](function(){ return ''; }) : Promise.resolve('');
    p.then(function(url){ return writeDocs(url); }).then(function(){
      A.evBusy = false; A.evN = A.evN || {}; A.evN[ev.id] = ((A.evN[ev.id]) | 0) + 1;
      A.save.ej[ev.id] = 1; saveSoon();
      idbDel(A.uid + '|draft_ev_' + ev.id);
      sfx('sfx-clap', 0.5);
      cv.close(true);
      modalLater('<h3 style="text-align:center">📤 交件成功!</h3><div style="text-align:center"><img src="' + th + '" style="max-width:60%;border:.4vmin solid #3a2f45;border-radius:1.4vmin"></div><p style="text-align:center">系統初評:<b>' + sys + ' 分</b> ' + '★★★'.slice(0, r.stars) + '</p>'
        + (r.card || []).map(function(c){ return '<div class="scard">' + (c.ok ? '✅ ' : '💡 ') + esc(c.t) + '</div>'; }).join('') + '<p style="font-size:2.2vmin;color:#6b6178;text-align:center">老師看完作品會再加減分,公布後到 🎨 畫室 → 🖼 作品牆 看結果' + (ev.type === 'week' ? ';截止前還可以重新交件' : '') + '。</p>', [{ t: '回村子', cb: function(){ paintHub(); } }]);
    })['catch'](function(e){
      A.evBusy = false;
      try{ console.warn('[art ev]', e && e.message); }catch(_){}
      toast(evLeft(ev) <= -90000 ? '⏰ 已經超過截止時間,交件沒有成功' : '📶 交件失敗,畫還在畫布上,請再按一次交件');
    });
  });
}
/* 自由題的完成度(0~25):塗滿比例+筆畫數+圖層 */
function completeScore(img){ var p = paintInfo(img); return Math.min(25, Math.round(p.cover * 30) + Math.min(6, Math.floor((img.strokes || 0) / 15)) + Math.min(4, (img.layers || 1) * 1)); }
/* 學生回來領獎:交過件、老師已公布的活動 ⇒ 讀自己那張 entries,把 award 記進存檔 ev(+帳本) */
function evClaim(){
  var fb = B.fbNow ? B.fbNow() : null, k, list = [];
  if(!fb || A.guest) return;
  for(k in A.save.ej){ if(A.save.ej.hasOwnProperty(k) && !A.save.ev.hasOwnProperty(k)) list.push(k); }
  list.slice(0, 6).forEach(function(eid){
    fb.db.collection('artEvents').doc(eid).collection('entries').doc(A.uid).get().then(function(d){
      var o = d && d.exists ? d.data() : null;
      if(!o || !(o.award > 0) || A.save.ev.hasOwnProperty(eid)) return;
      A.save.ev[eid] = clamp(o.award | 0, 0, 200); ledAdd('ev', { id: eid, g: A.save.ev[eid] }); saveSoon();
      sfx('sfx-medal', 0.5); toast('🏅 活動結果公布了!第 ' + (o.rank | 0) + ' 名,藝術積分 +' + A.save.ev[eid]);
      if(A.screen === 'hub' && !$('art-lv') && !$('art-cv') && !A.arrange) paintHub();   /* ★ v1.1.3 第 15 項:擺設中不重畫(拖到一半的裝飾才不會丟) */
    })['catch'](function(){});
  });
}
/* 🖼 作品牆:已公布的活動,顯示筆名、分數、老師貼紙(老師隱藏的不顯示) */
function wallList(){
  var fb = B.fbNow ? B.fbNow() : null;
  if(!fb || A.guest){ modal('<h3>🖼 作品牆</h3><p>登入學校帳號才看得到作品牆。</p>'); return; }
  modal('<h3>🖼 作品牆</h3><div id="art-wl"><p>讀取中…</p></div>', [{ t: '回畫室', cls: 'ghost', cb: studioOpen }]);
  fb.db.collection('artEvents').where('revealed', '==', true).limit(30).get().then(function(snap){
    var a = [], h = '', el = $('art-wl');
    snap.forEach(function(d){ a.push(evFromDoc(d)); });
    a.sort(function(x, y){ return y.endMs - x.endMs; });
    if(!el) return;
    if(!a.length){ el.innerHTML = '<p>還沒有公布的比賽或主題。</p>'; return; }
    a.slice(0, 12).forEach(function(ev){ h += '<div class="lvcard"><span style="font-size:4vmin">' + (ev.type === 'contest' ? '⚔️' : '🗓') + '</span><span class="nm">' + esc(ev.title || '') + '<div class="asub">' + evTaskName(ev.task) + '</div></span><button class="abtn go" data-wl="' + esc(ev.id) + '">看作品</button></div>'; });
    el.innerHTML = h;
    el.onclick = function(e){ var t = upFind(e.target, 'data-wl'), i; if(!t) return; for(i = 0; i < a.length; i++){ if(a[i].id === t.getAttribute('data-wl')) wallShow(a[i], false); } };
  })['catch'](function(){ var el = $('art-wl'); if(el) el.innerHTML = '<p>作品牆暫時讀不到(請老師確認雲端規則已更新)。</p>'; });
}
function wallShow(ev, gm){
  var fb = B.fbNow ? B.fbNow() : null;
  modal('<h3>🖼 ' + esc(ev.title || '') + '</h3><div id="art-wall"><p>讀取中…</p></div>', [{ t: '返回', cls: 'ghost', cb: gm ? function(){ gmPanel('list'); } : wallList }]);
  fb.db.collection('artEvents').doc(ev.id).collection('entries').get().then(function(snap){
    var a = [], el = $('art-wall'), h = '';
    snap.forEach(function(d){ var o = d.data() || {}; o.uid = d.id; a.push(o); });
    if(!gm) a = a.filter(function(o){ return !o.hidden; });
    a.sort(function(x, y){ return ((x.rank | 0) || 999) - ((y.rank | 0) || 999); });
    if(!el) return;
    if(!a.length){ el.innerHTML = '<p>沒有作品。</p>'; return; }
    h = '<div class="wall">';
    a.forEach(function(o){ h += '<div class="wcard"' + (o.uid === A.uid ? ' style="background:#fff3b0"' : '') + '><img src="' + esc(o.th || '') + '" alt=""><b>' + (o.rank && o.rank <= 3 ? ['🥇', '🥈', '🥉'][o.rank - 1] + ' ' : '') + esc(o.pen || '') + '</b><br>' + (o.final != null ? '⭐ ' + (o.final | 0) + ' 分' : '') + (o.tags && o.tags.length ? '<br>' + o.tags.map(esc).join(' ') : '') + '</div>'; });
    el.innerHTML = h + '</div>';
  })['catch'](function(){ var el = $('art-wall'); if(el) el.innerHTML = '<p>讀不到作品。</p>'; });
}

/* ══ 🧑‍🏫 老師台(只有 GM 看得到):開比賽/出每週主題、截止、匿名評分、公布、班級榜門檻 ══ */
function gmPanel(tab){
  if(!isGm()) return;
  var fb = B.fbNow ? B.fbNow() : null, h = '<h3>🧑‍🏫 創藝工坊 老師台</h3><div class="tabs">', t = [['new', '➕ 開新活動'], ['list', '📋 活動列表'], ['set', '⚙ 設定']], i;
  tab = tab || 'list';
  for(i = 0; i < t.length; i++) h += '<button class="mini' + (tab === t[i][0] ? ' on' : '') + '" data-gt="' + t[i][0] + '">' + t[i][1] + '</button>';
  h += '</div><div id="art-gm">';
  if(tab === 'new'){
    h += '<div class="scard">類型:<select id="gm-type"><option value="contest">⚔️ 比賽(限時、要代碼)</option><option value="week">🗓 每週主題(全校交件)</option></select></div>';
    h += '<div class="scard">標題:<input type="text" id="gm-title" maxlength="20" placeholder="例:我的夢想小屋"></div>';
    h += '<div class="scard">題目說明:<input type="text" id="gm-ask" maxlength="60" style="width:100%" placeholder="例:用互補色畫一間會讓人想走進去的店"></div>';
    h += '<div class="scard">系統評分項目:<select id="gm-task"><option value="free">自由主題(只評完成度)</option><option value="gray5">明暗五階</option><option value="complement">互補色</option><option value="thirds">三分法構圖</option><option value="media3">三種筆觸</option><option value="dots">點描</option></select>'
       + ' 畫布:<select id="gm-ratio"><option>4:3</option><option>1:1</option><option>3:4</option><option>16:9</option></select></div>';
    h += '<div class="scard">時間:<select id="gm-mins"><option value="5">5 分鐘</option><option value="10">10 分鐘</option><option value="15" selected>15 分鐘</option><option value="20">20 分鐘</option><option value="30">30 分鐘</option><option value="4320">3 天</option><option value="7200">5 天</option><option value="10080">7 天</option></select>'
       + '<div class="asub">比賽建議 5~30 分鐘;每週主題建議 5~7 天。截止時間以伺服器時間計算,學生改平板時鐘沒有用。</div></div>';
    h += '<button class="abtn go" id="gm-create">✅ 建立並開始</button>';
  } else if(tab === 'set'){
    h += '<div class="scard">🏘 班級榜最低參加人數:<input type="text" id="gm-min" inputmode="numeric" maxlength="2" style="width:10vmin;text-align:center" value="' + minClass() + '"> 人<div class="asub">參加人數未達門檻的班級不給名次(第 17 項)。</div></div><button class="abtn go" id="gm-save">💾 儲存設定</button>';
  } else h += '<p>讀取中…</p>';
  h += '</div>';
  modal(h, [{ t: '關閉', cls: 'ghost' }], { onOpen: function(m){
    var bs = m.querySelectorAll('[data-gt]'), j;
    for(j = 0; j < bs.length; j++) bs[j].onclick = function(ev){ ev.stopPropagation(); gmPanel(this.getAttribute('data-gt')); };
    if(m.querySelector('#gm-type')) m.querySelector('#gm-type').onchange = function(){ m.querySelector('#gm-mins').value = this.value === 'week' ? '10080' : '15'; };
    if(m.querySelector('#gm-create')) m.querySelector('#gm-create').onclick = function(ev){ ev.stopPropagation(); gmCreate(m); };
    if(m.querySelector('#gm-save')) m.querySelector('#gm-save').onclick = function(ev){ ev.stopPropagation(); var v = clamp(parseInt(m.querySelector('#gm-min').value, 10) || D.CLASS_MIN, 1, 30), u = user(), f = FV();
      fb.db.collection('gameConfig').doc('artGm').set({ minClass: v, updatedAt: f ? f.serverTimestamp() : now(), updatedBy: String((u && u.email) || '') }, { merge: true }).then(function(){ A.gm = A.gm || {}; A.gm.minClass = v; toast('💾 已儲存:班級榜至少 ' + v + ' 人'); })['catch'](function(){ toast('儲存失敗'); }); };
  } });
  if(tab === 'list' && fb) gmList();
}
function gmCreate(m){
  var fb = B.fbNow ? B.fbNow() : null, f = FV(), u = user(), type = m.querySelector('#gm-type').value, title = String(m.querySelector('#gm-title').value || '').trim().slice(0, 20), ask = String(m.querySelector('#gm-ask').value || '').trim().slice(0, 60),
      task = m.querySelector('#gm-task').value, ratio = m.querySelector('#gm-ratio').value, mins = clamp(parseInt(m.querySelector('#gm-mins').value, 10) || 15, 1, 20160), id, code, TS;
  if(!title){ toast('請輸入標題'); return; }
  if(!fb || !f){ toast('要連上網路'); return; }
  TS = window.firebase.firestore.Timestamp;
  srvSync(function(){
    id = 'e' + dayKey() + Math.random().toString(36).slice(2, 7).replace(/[^a-z0-9]/g, 'x');
    code = type === 'contest' ? String(1000 + Math.floor(Math.random() * 9000)) : '';
    fb.db.collection('artEvents').doc(id).set({ type: type, title: title, ask: ask || title, task: task, ratio: ratio, mins: mins, code: code, state: 'open', revealed: false,
      by: String((u && u.email) || ''), at: f.serverTimestamp(), startAt: f.serverTimestamp(), endAt: TS.fromMillis(srvNow() + mins * 60000) }).then(function(){
      sfx('sfx-clap', 0.4);
      modal('<h3>✅ 已開始</h3><p>' + (type === 'contest' ? '⚔️ 比賽「' + esc(title) + '」,請把<b>比賽代碼</b>告訴學生:</p><div style="text-align:center;font-size:12vmin;font-weight:900;letter-spacing:2vmin">' + code + '</div>' : '🗓 每週主題「' + esc(title) + '」已發布,全校學生在村子左下角都看得到。</p>'), [{ t: '到活動列表', cb: function(){ gmPanel('list'); } }]);
      evRefresh();
    })['catch'](function(e){ toast('建立失敗:' + ((e && e.code) || '')); });
  }, true);
}
function gmList(){
  var fb = B.fbNow ? B.fbNow() : null;
  fb.db.collection('artEvents').orderBy('at', 'desc').limit(15).get().then(function(snap){
    var a = [], h = '', el = $('art-gm');
    snap.forEach(function(d){ a.push(evFromDoc(d)); });
    if(!el) return;
    if(!a.length){ el.innerHTML = '<p>還沒有活動,按「➕ 開新活動」。</p>'; return; }
    a.forEach(function(ev){ var st = ev.state === 'open' ? (evLeft(ev) > 0 ? '🟢 收件中・' + evLeftTxt(ev) : '🟡 時間到') : (ev.state === 'review' ? '🟡 評分中' : '🔵 已公布');
      h += '<div class="lvcard"><span style="font-size:4vmin">' + (ev.type === 'contest' ? '⚔️' : '🗓') + '</span><span class="nm">' + esc(ev.title || '') + (ev.code ? ' <span class="asub">代碼 ' + esc(ev.code) + '</span>' : '') + '<div class="asub">' + st + '・' + evTaskName(ev.task) + '</div></span>'
        + (ev.state === 'open' ? '<button class="mini" data-ga="stop" data-id="' + ev.id + '">⏹ 截止</button>' : '')
        + '<button class="mini" data-ga="wall" data-id="' + ev.id + '">🖼 ' + (ev.state === 'done' ? '結果' : '評分') + '</button>'
        + (ev.state !== 'done' ? '<button class="mini" data-ga="pub" data-id="' + ev.id + '">📣 公布</button>' : '') + '</div>'; });
    el.innerHTML = h;
    el.onclick = function(e){ var t = upFind(e.target, 'data-ga'), ev = null, i; if(!t) return; for(i = 0; i < a.length; i++){ if(a[i].id === t.getAttribute('data-id')) ev = a[i]; } if(!ev) return;
      var act = t.getAttribute('data-ga');
      if(act === 'stop') confirmBox('截止「' + esc(ev.title) + '」的收件?', function(ok){ if(!ok){ gmPanel('list'); return; } fb.db.collection('artEvents').doc(ev.id).update({ state: 'review' }).then(function(){ toast('⏹ 已截止,可以開始評分'); gmPanel('list'); evRefresh(); }); });
      else if(act === 'wall') gmWall(ev);
      else if(act === 'pub') confirmBox('公布「' + esc(ev.title) + '」的結果?<br>公布後學生看得到分數與作品牆,並自動發積分(第 1 名 +' + D.EV_AWARD[ev.type === 'contest' ? 'contest' : 'week'][0] + ',完成作品 +' + D.EV_AWARD.done + ')。', function(ok){ if(ok) gmPublish(ev); else gmPanel('list'); });
    };
  })['catch'](function(){ var el = $('art-gm'); if(el) el.innerHTML = '<p>讀不到活動(請確認雲端規則已更新)。</p>'; });
}
/* 老師評分牆:公布前作者一律隱藏(「作品 1、2、3…」,順序用活動 id 打亂),公布後才顯示筆名與真名 */
function gmWall(ev){
  var fb = B.fbNow ? B.fbNow() : null;
  modal('<h3>🖼 ' + esc(ev.title || '') + (ev.revealed ? '(已公布)' : '(作者隱藏中)') + '</h3><div id="art-gw"><p>讀取中…</p></div>', [{ t: '返回', cls: 'ghost', cb: function(){ gmPanel('list'); } }]);
  var who = {};
  function paint(a){
    var el = $('art-gw'), h = '<div class="wall">';
    if(!el) return;
    if(!a.length){ el.innerHTML = '<p>還沒有人交件。</p>'; return; }
    a.forEach(function(o, i){ var adj = o.adj | 0;
      h += '<div class="wcard"' + (o.hidden ? ' style="opacity:.45"' : '') + '><img src="' + esc(o.th || '') + '" alt="" data-big="' + esc(o.url || '') + '" style="cursor:zoom-in"><b>' + (ev.revealed ? esc(o.pen || '') + (who[o.uid] ? '<br><span class="asub">' + esc(who[o.uid]) + '</span>' : '') : '作品 ' + (i + 1)) + '</b><br>系統 ' + (o.sys | 0) + ' 分 ' + '★★★'.slice(0, o.st | 0)
        + '<br>老師 <b>' + (adj > 0 ? '+' : '') + adj + '</b> = <b>' + clamp((o.sys | 0) + adj, 0, 120) + '</b>' + (o.rank ? '・第 ' + o.rank + ' 名' : '') + '<div>';
      [-10, -5, 5, 10, 20].forEach(function(v){ h += '<button class="mini" data-adj="' + v + '" data-u="' + o.uid + '">' + (v > 0 ? '+' : '') + v + '</button>'; });
      h += '<button class="mini" data-adj="0" data-u="' + o.uid + '">歸零</button></div><div>';
      D.EV_TAGS.forEach(function(tg, ti){ h += '<button class="mini' + (o.tags && o.tags.indexOf(tg) >= 0 ? ' on' : '') + '" data-tag="' + ti + '" data-u="' + o.uid + '">' + tg + '</button>'; });
      h += '<button class="mini' + (o.hidden ? ' on' : '') + '" data-hide="1" data-u="' + o.uid + '">🙈 隱藏</button></div></div>'; });
    el.innerHTML = h + '</div>';
    el.onclick = function(e){
      var t = e.target, u, o = null, j, upd = {}, ref, tg;
      if(t.getAttribute && t.getAttribute('data-big') != null){ if(t.getAttribute('data-big')) sto(function(s){ if(s) s.ref(t.getAttribute('data-big')).getDownloadURL().then(function(url){ window.open(url, '_blank'); }, function(){ toast('大圖讀不到'); }); }); return; }
      t = upFind(t, 'data-u'); if(!t) return; u = t.getAttribute('data-u'); for(j = 0; j < a.length; j++){ if(a[j].uid === u) o = a[j]; } if(!o) return;
      if(t.getAttribute('data-adj') != null){ var v = +t.getAttribute('data-adj'); o.adj = v === 0 ? 0 : clamp((o.adj | 0) + v, -10, 20); upd.adj = o.adj; }
      else if(t.getAttribute('data-tag') != null){ tg = D.EV_TAGS[+t.getAttribute('data-tag')]; o.tags = (o.tags || []).slice(); if(o.tags.indexOf(tg) >= 0) o.tags.splice(o.tags.indexOf(tg), 1); else o.tags.push(tg); upd.tags = o.tags; }
      else if(t.getAttribute('data-hide') != null){ o.hidden = !o.hidden; upd.hidden = o.hidden; }
      ref = fb.db.collection('artEvents').doc(ev.id).collection('entries').doc(u);
      ref.update(upd).then(function(){}, function(){ toast('寫入失敗'); });
      sfx('sfx-tap', 0.25); paint(a);
    };
  }
  fb.db.collection('artEvents').doc(ev.id).collection('entries').get().then(function(snap){
    var a = [], r = rng(hashStr(ev.id));
    snap.forEach(function(d){ var o = d.data() || {}; o.uid = d.id; o._k = r(); a.push(o); });
    a.sort(function(x, y){ return ev.revealed ? (((x.rank | 0) || 999) - ((y.rank | 0) || 999)) : (x._k - y._k); });
    if(ev.revealed) fb.db.collection('artEvents').doc(ev.id).collection('who').get().then(function(s2){ s2.forEach(function(d){ var w = d.data() || {}; who[d.id] = w.nm || w.em || ''; }); paint(a); }, function(){ paint(a); });
    else paint(a);
  })['catch'](function(){ var el = $('art-gw'); if(el) el.innerHTML = '<p>讀不到作品。</p>'; });
}
function gmPublish(ev){
  var fb = B.fbNow ? B.fbNow() : null, f = FV(), tbl = D.EV_AWARD[ev.type === 'contest' ? 'contest' : 'week'];
  fb.db.collection('artEvents').doc(ev.id).collection('entries').get().then(function(snap){
    var a = [], bts = [], bt = null, rk = 0, nOps = 0;
    function op(){ if(!bt || nOps >= 400){ bt = fb.db.batch(); bts.push(bt); nOps = 0; } nOps++; return bt; }   /* 一批最多 500 筆,全校主題要分批 */
    snap.forEach(function(d){ var o = d.data() || {}; o.uid = d.id; o.final = clamp((o.sys | 0) + (o.adj | 0), 0, 120); a.push(o); });
    a.sort(function(x, y){ return (x.hidden ? 1 : 0) - (y.hidden ? 1 : 0) || y.final - x.final; });
    a.forEach(function(o){ var award = 0, rank = 0; if(!o.hidden){ rk++; rank = rk; award = rank <= tbl.length ? tbl[rank - 1] : D.EV_AWARD.done; }
      op().update(fb.db.collection('artEvents').doc(ev.id).collection('entries').doc(o.uid), { final: o.final, rank: rank, award: award }); });
    var p = Promise.resolve();
    bts.forEach(function(b){ p = p.then(function(){ return b.commit(); }); });
    return p.then(function(){ return fb.db.collection('artEvents').doc(ev.id).update({ state: 'done', revealed: true, doneAt: f ? f.serverTimestamp() : now() }); }).then(function(){ ev.revealed = true; ev.state = 'done'; sfx('sfx-fanfare', 0.5); toast('📣 已公布 ' + a.length + ' 件作品的結果,積分會在學生下次進村子時自動入帳'); gmWall(ev); evRefresh(); });
  })['catch'](function(e){ toast('公布失敗:' + ((e && e.code) || '')); });
}

/* 第二階段才開放的入口(先說清楚,不做假按鈕) */
function phase2(what){ modal('<h3>🚧 ' + what + '</h3><p>這個功能在第二階段開放(合作房、老師開房、排行榜與獎勵、作品上傳與上架)。</p>'); }

/* ══ 關卡框架 ══ */
function shuffle(a){ var i, j, t; for(i = a.length - 1; i > 0; i--){ j = Math.floor(Math.random() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function starsByMiss(miss, rounds){ var r = Math.max(1, rounds || 1); if(miss <= 0) return 3; if(miss <= Math.ceil(r / 3)) return 2; return 1; }
/* 通用拖曳:浮動複本跟著手指/滑鼠/筆;放開時用 elementFromPoint 找落點。長按不動 ⇒ onLong(看說明) */
function dragify(el, opt){
  el.addEventListener('pointerdown', function(e){
    if(e.button > 0) return;
    e.preventDefault();
    var pid = e.pointerId, sx = e.clientX, sy = e.clientY, ghost = null, moved = false, lt = 0, hot = null;
    /* ★ v1.1.0 第 9 項:拖到「可以放」的位置 ⇒ 那一格亮框(.drop) */
    function hotSet(x, y){ if(!opt.dropAttr) return; var t = document.elementFromPoint(x, y), d = t ? upFind(t, opt.dropAttr) : null; if(d === el) d = null; if(d && opt.dropOk && !opt.dropOk(d)) d = null;
      if(d === hot) return; try{ if(hot) hot.classList.remove('drop'); if(d) d.classList.add('drop'); }catch(_){} hot = d; }
    function mkGhost(){ ghost = el.cloneNode(true); ghost.className += ' art-drag'; ghost.removeAttribute('id'); ghost.style.width = el.offsetWidth + 'px'; ghost.style.height = el.offsetHeight + 'px'; ghost.style.left = sx + 'px'; ghost.style.top = sy + 'px'; ghost.style.position = 'fixed'; document.body.appendChild(ghost); el.style.opacity = '.35'; }
    if(opt.onLong) lt = setTimeout(function(){ if(!moved){ cleanup(); opt.onLong(); } }, 550);
    try{ el.setPointerCapture(pid); }catch(_){}
    function mv(ev){ if(ev.pointerId !== pid) return; if(!moved && Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) > 8){ moved = true; clearTimeout(lt); if(!opt.live) mkGhost(); if(opt.onStart) opt.onStart(); }
      if(!moved) return;
      if(ghost){ ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px'; }
      hotSet(ev.clientX, ev.clientY);
      if(opt.onMove) opt.onMove(ev.clientX, ev.clientY); }
    /* ★ v1.1.3(檢查報告第 2、17 項):監聽改掛 window ⇒ 被拖的那塊中途被重畫(innerHTML 換掉)也收得到放開,浮動複本一定會清掉;
       pointercancel / 失去捕捉 = 取消(不算放下);被拖的那塊已經不在畫面上 ⇒ 只清掉、不放下 */
    function cleanup(){ clearTimeout(lt); try{ if(hot) hot.classList.remove('drop'); }catch(_){} hot = null; window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', cancel); el.removeEventListener('lostpointercapture', lost); if(ghost && ghost.parentNode) ghost.parentNode.removeChild(ghost); ghost = null; el.style.opacity = ''; var q = DRAGS.indexOf(cleanup); if(q >= 0) DRAGS.splice(q, 1); }
    function up(ev){ if(ev.pointerId !== pid) return; var wasMoved = moved, alive = document.body.contains(el); cleanup(); if(!alive) return; if(!wasMoved){ if(opt.onTap) opt.onTap(); return; } var t = document.elementFromPoint(ev.clientX, ev.clientY); if(opt.onDrop) opt.onDrop(ev.clientX, ev.clientY, t); }
    function cancel(ev){ if(ev.pointerId !== pid) return; cleanup(); }
    function lost(ev){ if(ev.pointerId !== pid) return; setTimeout(function(){ if(DRAGS.indexOf(cleanup) >= 0 && !document.body.contains(el)) cleanup(); }, 0); }
    DRAGS.push(cleanup);
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', cancel); el.addEventListener('lostpointercapture', lost);
  });
}
var DRAGS = [];
function dragsClear(){ var a = DRAGS.slice(), i; for(i = 0; i < a.length; i++){ try{ a[i](); }catch(_){} } DRAGS = []; var g = document.querySelectorAll('.art-drag'); for(i = 0; i < g.length; i++){ if(g[i].parentNode) g[i].parentNode.removeChild(g[i]); } }
window.addEventListener('blur', dragsClear);
document.addEventListener('visibilitychange', function(){ if(document.hidden) dragsClear(); });
function upFind(t, attr){ while(t && t.getAttribute){ if(t.getAttribute(attr) != null) return t; t = t.parentNode; } return null; }
function shake(el){ if(!el || !el.animate) return; try{ el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-1.2vmin)' }, { transform: 'translateX(1.2vmin)' }, { transform: 'translateX(0)' }], { duration: 300 }); }catch(e){} }

function lvStart(id){
  var L = D.LEVELS[id], root = $('art-root'), el, ctx;
  if(!L || !root) return;
  lvClose(true);
  A.lv = { id: id, L: L, miss: 0, done: false };
  music('lv');   /* ★ v1.1.1 */
  el = document.createElement('div'); el.id = 'art-lv';
  el.innerHTML = '<div class="top"><button class="abtn ghost" data-k="back">← 回工坊</button><span class="tt">' + typeIcon(L.type) + ' ' + esc(L.n) + '</span><span class="prog" id="art-lv-prog"></span><button class="abtn" id="art-lv-how" data-k="how">❓ 怎麼玩</button><button class="abtn" id="art-lv-tip" data-k="tip">💡 小提示</button></div>'
    + '<div class="body" id="art-lv-body"></div>'
    + '<div class="foot"><span class="ask" id="art-lv-ask"></span><button class="abtn go" id="art-lv-act" style="display:none"></button></div>';
  root.appendChild(el);
  el.querySelector('[data-k=back]').onclick = function(){ sfx('sfx-cancel', 0.3); var ws = L.ws; lvClose(); wsOpenPanel(ws); };
  el.querySelector('[data-k=how]').onclick = function(){ sfx('sfx-tap', 0.3); howShow(id); };
  el.querySelector('[data-k=tip]').onclick = function(){ sfx('sfx-tap', 0.3); modal('<h3>💡 ' + esc(L.n) + '</h3><p>' + esc(T(L.tip)) + '</p>'); };
  ctx = {
    body: el.querySelector('#art-lv-body'),
    ask: function(s){ $('art-lv-ask').innerHTML = s; },
    prog: function(s){ $('art-lv-prog').textContent = s || ''; },
    act: function(label, cb){ var b = $('art-lv-act'); if(!label){ b.style.display = 'none'; return; } b.style.display = ''; b.innerHTML = label; b.onclick = function(){ sfx('sfx-tap', 0.3); cb(); }; },
    miss: function(){ A.lv.miss++; sfx('sfx-ng', 0.35); },
    win: function(stars, card){ if(!ctx.alive()) return; lvFinish(stars, card); },
    alive: function(){ return !!(A.lv && A.lv.id === id && !A.lv.done && document.body.contains(ctx.body)); }   /* ★ v1.1.3 延遲回呼先確認還在同一關 */
  };
  ctx.ask(esc(L.ask || ''));
  (R[L.type] || R.quiz)(L, ctx);
  /* ★ v1.0.3 每關第一次進來先看遊玩說明(看過記在存檔 tut.h_<關卡>,換平板不重跳),之後右上 ❓ 隨時可看 */
  if(!A.save.tut['h_' + id]) howShow(id, function(){ A.save.tut['h_' + id] = 1; saveSoon(); tutRun('level'); });
  else tutRun('level');
}
/* ══ ★ v1.0.3 遊玩說明(老師「每個關卡和主題都寫遊玩說明,忘記時也可以開啟角落的遊玩提示」)══ */
function nl2br(s){ return String(s || '').split('\n').join('<br>'); }
function howHtml(id){
  var L = D.LEVELS[id], H = (D.HOWTO && D.HOWTO[L.type]) || null, h = '', R;
  h += '<h3>' + typeIcon(L.type) + ' ' + esc(L.n) + ' — 怎麼玩</h3>';
  h += '<div class="scard">🎯 <b>這關要做什麼</b>:' + esc(L.goal ? T(L.goal) : (L.ask || '')) + '</div>';
  if(H) h += '<div class="scard">' + H.e + ' <b>' + esc(H.n) + '的玩法</b><br>' + nl2br(T(H)) + '</div>';
  if(L.how) h += '<div class="scard">📌 ' + nl2br(T(L.how)) + '</div>';
  if(L.type === 'draw' && D.RUBRIC && (R = D.RUBRIC[L.task])) h += '<div class="scard">📋 <b>系統怎麼評分</b>(先告訴你,照著做就能拿 3 顆星)<br>' + nl2br(T(R)) + '</div>';
  else if(D.STAR_RULE) h += '<div class="scard" style="font-size:.9em">' + esc(T(D.STAR_RULE)) + '</div>';
  h += '<p style="font-size:.85em;color:#8a7e95;margin:.6vmin 0 0">忘記了隨時按右上角 <b>❓ 怎麼玩</b> 再看一次;想學知識按 <b>💡 小提示</b>。</p>';
  return h;
}
function howShow(id, done){ modal(howHtml(id), [{ t: done ? '我知道了,開始!' : '好', cb: done || null }]); }
function lvClose(silent){ dragsClear(); var el = $('art-lv'); if(el && el.parentNode) el.parentNode.removeChild(el); if(!silent){ A.lv = null; if(A.on) music('hub'); } }
function lvFinish(stars, card){
  var lv = A.lv, L, id, old, gain = 0, cap, today, k, W, res = {}, j, h, next, a, i;
  if(!lv || lv.done) return;
  lv.done = true; id = lv.id; L = lv.L; stars = clamp(stars | 0, 0, 3);
  old = A.save.stars[id] | 0;
  var hadCard = hasCard(L.ws), counted = 0;
  if(stars > 0 && ownerOk()){
    if(stars > old){ gain += (stars - old) * L.diff * D.PTS_STAR; W = wsDef(L.ws); for(j = 0; j < W.res.length; j++) res[W.res[j]] = (stars - old) * L.diff * D.RES_K; A.save.stars[id] = stars; }
    if(!A.save.first[id]){ A.save.first[id] = now(); gain += D.PTS_FIRST; }
    if(gain > 0){ counted = ptsAdd(gain); ledAdd('clear', { id: id, st: stars, g: counted, r: res }); saveSoon(); }   /* ★ v1.1.0 每台裝置分格記+帳本;星數沒變多就不存 */
    dailyHit('clear', { id: id, stars: stars, miss: lv.miss, old: old, ws: L.ws });
  }
  sfx(stars ? 'sfx-clap' : 'sfx-ng', 0.5);
  if(stars) music('win');   /* ★ v1.1.1 過關曲播一次;按下一關/回村子會換回對應的曲子 */
  /* ★ v1.1.0 第 11 項:星星一顆一顆亮、資源數字跳出來 */
  h = '<h3 style="text-align:center">' + (stars ? '🎉 過關!' : '再試一次!') + '</h3><div style="text-align:center;font-size:7vmin;color:#f5a623;letter-spacing:1vmin">';
  for(i = 0; i < 3; i++) h += i < stars ? '<span class="st-a" style="animation-delay:' + (0.25 + i * 0.35).toFixed(2) + 's">★</span>' : '<span style="opacity:.25">★</span>';
  h += '</div>';
  if(card && card.length){ for(i = 0; i < card.length; i++) h += '<div class="scard">' + (card[i].ok ? '✅ ' : '💡 ') + esc(card[i].t) + '</div>'; }
  if(stars){
    h += '<p style="text-align:center">';
    j = 0; for(k in res){ if(res.hasOwnProperty(k)){ h += '<span class="res-pop" style="animation-delay:' + (0.3 + stars * 0.35 + j * 0.2).toFixed(2) + 's">' + D.RES[k].e + ' +<b data-cnt="' + res[k] + '">' + res[k] + '</b></span>　'; j++; } }
    h += (gain ? '<span class="res-pop" style="animation-delay:' + (0.5 + stars * 0.35 + j * 0.2).toFixed(2) + 's">⭐ 藝術積分 +<b data-cnt="' + (counted || gain) + '">' + (counted || gain) + '</b></span>' : (stars <= old ? '(星星沒有比上次多,這次不加資源)' : '')) + '</p>';
    if(gain && counted < gain && !A.guest) h += '<p style="text-align:center;font-size:2.2vmin;color:#8a7e95">今天的排行積分已達 ' + capNow() + ' 上限(所有平板加起來),明天再繼續累積!</p>';
    if(A.guest) h += '<p style="text-align:center;font-size:2.2vmin;color:#8a7e95">訪客的進度只存在這台平板,登入後才會上雲端、參加排行。</p>';
    if(!hadCard && hasCard(L.ws) && D.CARDS[L.ws]) h += '<div class="scard" style="text-align:center;background:#fff3b0">🃏 <b>得到大師卡:' + D.CARDS[L.ws].e + ' ' + esc(D.CARDS[L.ws].n) + '</b><br>' + esc(T(D.CARDS[L.ws])) + (D.CARDS[L.ws].brush ? '<br>🖌 解鎖特殊筆刷:' + esc(D.SPECIAL_BRUSH[D.CARDS[L.ws].brush]) : '') + '</div>';
  }
  a = D.WS_LEVELS[L.ws]; next = a[a.indexOf(id) + 1];
  modalLater(h, [{ t: '🔁 再玩一次', cls: 'ghost', cb: function(){ lvStart(id); } }].concat(next && stars ? [{ t: '下一關 ▶', cb: function(){ lvStart(next); } }] : []).concat([{ t: '回村子', cls: 'ghost', cb: function(){ lvClose(); paintHub(); } }]), { onOpen: function(m){
    var bs = m.querySelectorAll('[data-cnt]'), q;
    for(q = 0; q < bs.length; q++) (function(b, n, dl){ b.textContent = '0'; var t0 = 0, iv = setTimeout(function(){ t0 = now(); var it = setInterval(function(){ var p = Math.min(1, (now() - t0) / 600); b.textContent = String(Math.round(n * p)); if(p >= 1) clearInterval(it); }, 40); }, dl); })(bs[q], +bs[q].getAttribute('data-cnt'), 400 + stars * 350 + q * 200);
    for(q = 0; q < stars; q++) (function(k2){ setTimeout(function(){ sfx('sfx-coin', 0.35); }, 250 + k2 * 350); })(q);
    if(m.querySelector('.scard[style*="fff3b0"]')) setTimeout(function(){ sfx('sfx-medal', 0.5); }, 400 + stars * 350);   /* ★ v1.1.1 拿到大師卡 */
  } });
}

/* ══ 小圖產生器(程式畫,顏色精準、可互動;GPT 圖到位前也不缺圖) ══ */
function svgHatch(gap, layers){
  var h = '<svg viewBox="0 0 120 120" width="100%" height="100%"><rect width="120" height="120" fill="#fff"/>', x, l;
  for(l = 0; l < layers; l++){ for(x = -120; x < 240; x += gap){
    if(l === 0) h += '<line x1="' + x + '" y1="120" x2="' + (x + 120) + '" y2="0" stroke="#222" stroke-width="1.6"/>';
    else if(l === 1) h += '<line x1="' + x + '" y1="0" x2="' + (x + 120) + '" y2="120" stroke="#222" stroke-width="1.6"/>';
    else h += '<line x1="' + (x + 60) + '" y1="0" x2="' + (x + 60) + '" y2="120" stroke="#222" stroke-width="1.6"/>'; } }
  return h + '</svg>';
}
function svgPrinciple(k){
  var h = '<svg viewBox="0 0 240 150" width="100%" height="100%"><rect width="240" height="150" fill="#fffdf6"/>', i, x;
  if(k === 'repeat'){ for(i = 0; i < 5; i++) h += '<text x="' + (30 + i * 45) + '" y="85" font-size="40" text-anchor="middle">⭐</text>'; }
  else if(k === 'gradation'){ for(i = 0; i < 6; i++) h += '<circle cx="' + (22 + i * 40) + '" cy="75" r="' + (6 + i * 4) + '" fill="hsl(210,70%,' + (80 - i * 10) + '%)"/>'; }
  else if(k === 'symmetry'){ h += '<line x1="120" y1="10" x2="120" y2="140" stroke="#bbb" stroke-dasharray="4 4"/><path d="M120 75 C90 20 40 25 50 70 C40 110 90 125 120 80 C150 125 200 110 190 70 C200 25 150 20 120 75 Z" fill="#a36bff" stroke="#3a2f45" stroke-width="3"/><circle cx="80" cy="62" r="9" fill="#ffd93b"/><circle cx="160" cy="62" r="9" fill="#ffd93b"/>'; }
  else if(k === 'contrast'){ for(i = 0; i < 18; i++){ if(i === 8) continue; h += '<circle cx="' + (25 + (i % 6) * 38) + '" cy="' + (35 + Math.floor(i / 6) * 40) + '" r="9" fill="#b9b9c2"/>'; } h += '<circle cx="177" cy="75" r="22" fill="#e8302f" stroke="#3a2f45" stroke-width="3"/>'; }
  else if(k === 'balance'){ h += '<line x1="20" y1="120" x2="220" y2="120" stroke="#3a2f45" stroke-width="4"/><path d="M120 120 L110 140 L130 140 Z" fill="#3a2f45"/><circle cx="60" cy="78" r="38" fill="#4aa3ff"/><circle cx="160" cy="100" r="16" fill="#ff7a59"/><circle cx="190" cy="100" r="16" fill="#ff7a59"/><circle cx="175" cy="72" r="16" fill="#ff7a59"/>'; }
  else if(k === 'rhythm'){ for(i = 0; i < 9; i++){ x = 18 + i * 26; h += '<circle cx="' + x + '" cy="' + (75 - Math.sin(i * 0.8) * 40) + '" r="' + (6 + (i % 3) * 5) + '" fill="#4fcf7a" stroke="#3a2f45" stroke-width="2"/>'; } }
  else if(k === 'unity'){ h += '<rect x="25" y="45" width="50" height="50" rx="10" fill="#4aa3ff"/><circle cx="120" cy="70" r="27" fill="#5bb0ff"/><path d="M170 95 L195 42 L220 95 Z" fill="#3a8fe8"/>'; }
  else if(k === 'simple'){ h += '<circle cx="160" cy="70" r="20" fill="#e8302f"/>'; }
  else if(k === 'harmony'){ var hs = ['#f9e11e', '#d6e024', '#a6d22e', '#6fc23a', '#3bb54a']; for(i = 0; i < 5; i++) h += '<rect x="' + (20 + i * 40) + '" y="30" width="40" height="90" fill="' + hs[i] + '"/>'; }
  else if(k === 'proportion'){ h += '<rect x="25" y="20" width="190" height="117" fill="#fff3dc" stroke="#3a2f45" stroke-width="3"/><line x1="142" y1="20" x2="142" y2="137" stroke="#3a2f45" stroke-width="3"/><line x1="142" y1="92" x2="215" y2="92" stroke="#3a2f45" stroke-width="3"/><path d="M142 137 A117 117 0 0 1 25 20" fill="none" stroke="#ff7a59" stroke-width="3"/><text x="80" y="85" font-size="16" text-anchor="middle" fill="#6b6178">1.6</text><text x="178" y="62" font-size="16" text-anchor="middle" fill="#6b6178">1</text>'; }
  return h + '</svg>';
}
function svgComp(k){
  var h = '<svg viewBox="0 0 240 150" width="100%" height="100%">';
  if(k === 'triangle'){ h += '<rect width="240" height="150" fill="#cfe9ff"/><rect y="110" width="240" height="40" fill="#bfe6a8"/><path d="M120 22 L60 112 L180 112 Z" fill="#7d8c99" stroke="#3a2f45" stroke-width="3"/><path d="M120 22 L104 46 L136 46 Z" fill="#fff"/><text x="40" y="118" font-size="30" text-anchor="middle">🌲</text><text x="200" y="118" font-size="30" text-anchor="middle">🌲</text>'; }
  else if(k === 'scurve'){ h += '<rect width="240" height="150" fill="#bfe6a8"/><rect width="240" height="40" fill="#cfe9ff"/><path d="M110 40 C150 60 60 80 120 100 C190 120 60 140 100 150 L150 150 C110 140 230 118 150 100 C90 82 180 60 122 40 Z" fill="#4aa3ff"/>'; }
  else if(k === 'frame'){ h += '<rect width="240" height="150" fill="#8a6a4f"/><rect x="40" y="22" width="160" height="106" fill="#cfe9ff"/><rect x="40" y="95" width="160" height="33" fill="#8fd38a"/><circle cx="160" cy="50" r="12" fill="#ffd93b"/><line x1="120" y1="22" x2="120" y2="128" stroke="#8a6a4f" stroke-width="8"/><line x1="40" y1="75" x2="200" y2="75" stroke="#8a6a4f" stroke-width="8"/>'; }
  else if(k === 'space'){ h += '<rect width="240" height="150" fill="#e9f3fb"/><rect y="105" width="240" height="45" fill="#cfe2f0"/><text x="185" y="108" font-size="24" text-anchor="middle">⛵</text>'; }
  return h + '</svg>';
}
function wheelSvg(opt){
  /* 12 等分色相環,紅在正上方順時針;opt.blank{i:1}、opt.mark{i:cls};每塊 data-wi */
  var h = '<svg viewBox="-110 -110 220 220" width="100%" height="100%">', i, a0, a1, p, c, R1 = 100, R0 = 42, cx, cy;
  for(i = 0; i < 12; i++){
    a0 = (-90 - 15 + i * 30) * Math.PI / 180; a1 = (-90 + 15 + i * 30) * Math.PI / 180;
    p = 'M' + (R0 * Math.cos(a0)).toFixed(1) + ' ' + (R0 * Math.sin(a0)).toFixed(1) + ' L' + (R1 * Math.cos(a0)).toFixed(1) + ' ' + (R1 * Math.sin(a0)).toFixed(1)
      + ' A' + R1 + ' ' + R1 + ' 0 0 1 ' + (R1 * Math.cos(a1)).toFixed(1) + ' ' + (R1 * Math.sin(a1)).toFixed(1)
      + ' L' + (R0 * Math.cos(a1)).toFixed(1) + ' ' + (R0 * Math.sin(a1)).toFixed(1) + ' A' + R0 + ' ' + R0 + ' 0 0 0 ' + (R0 * Math.cos(a0)).toFixed(1) + ' ' + (R0 * Math.sin(a0)).toFixed(1) + ' Z';
    c = (opt.blank && opt.blank[i]) ? '#fff' : D.WHEEL[i].c;
    h += '<path data-wi="' + i + '" d="' + p + '" fill="' + c + '" stroke="' + ((opt.mark && opt.mark[i]) ? '#3a2f45' : '#fff') + '" stroke-width="' + ((opt.mark && opt.mark[i]) ? 5 : 2) + '"' + ((opt.blank && opt.blank[i]) ? ' stroke-dasharray="5 4"' : '') + ' style="cursor:pointer"/>';
    if(opt.mark && opt.mark[i]){ cx = 72 * Math.cos((-90 + i * 30) * Math.PI / 180); cy = 72 * Math.sin((-90 + i * 30) * Math.PI / 180); h += '<text x="' + cx.toFixed(1) + '" y="' + cy.toFixed(1) + '" font-size="20" text-anchor="middle" dominant-baseline="middle" pointer-events="none">' + opt.mark[i] + '</text>'; }
  }
  return h + '<circle r="38" fill="#fffdf6" stroke="#3a2f45" stroke-width="3"/></svg>';
}

/* ══ 十種玩法 ══ */
var R = {};
/* ↔️ 拖曳排序(灰階/明度/形的漸層):拖一塊到另一塊上 ⇒ 交換 */
R.sort = function(L, ctx){
  var n = L.items.length, ord = [], i, row, txt = !!L.items[0].t, w = txt ? Math.min(19, 96 / n) : Math.min(11, 84 / n);   /* ★ v1.1.0 文字方塊版(時間軸、步驟排序) */
  for(i = 0; i < n; i++) ord.push(i);
  do { shuffle(ord); } while(ord.join() === Array.apply(null, Array(n)).map(function(_, k){ return k; }).join());
  function paint(){
    row = '<div style="display:flex;gap:1.2vmin;align-items:flex-end;justify-content:center;flex-wrap:nowrap">';
    for(i = 0; i < n; i++){ var it = L.items[ord[i]];
      row += '<div class="art-tile" data-p="' + i + '" style="width:' + w + 'vmin;height:' + (txt ? 14 : (L.shape ? w * 1.4 : w * 1.6)) + 'vmin;background:' + (it.c || (txt ? '#fff9ef' : '#fff')) + (txt ? ';font-size:2.3vmin;padding:.8vmin;text-align:center;line-height:1.3' : '') + '">'
        + (txt ? esc(it.t) : '') + (L.shape ? '<div style="width:' + (it.s * 0.16) + 'vmin;height:' + (it.s * 0.16) + 'vmin;border-radius:50%;background:#4aa3ff;border:.3vmin solid #3a2f45"></div>' : '') + '</div>'; }
    row += '</div><div style="display:flex;justify-content:space-between;width:' + (n * (w + 1.2)) + 'vmin;margin:1.4vmin auto 0;font-weight:900;color:#6b6178;font-size:2.4vmin"><span>◀ ' + (L.ends ? L.ends[0] : (L.shape ? '最小' : '最亮')) + '</span><span>' + (L.ends ? L.ends[1] : (L.shape ? '最大' : '最暗')) + ' ▶</span></div>';
    ctx.body.innerHTML = '<div>' + row + '</div>';
    var ts = ctx.body.querySelectorAll('[data-p]'), j;
    for(j = 0; j < ts.length; j++) (function(t){ dragify(t, { dropAttr: 'data-p', onDrop: function(x, y, tg){ var d = upFind(tg, 'data-p'); if(!d || d === t) return; var a = +t.getAttribute('data-p'), b = +d.getAttribute('data-p'), tmp = ord[a]; ord[a] = ord[b]; ord[b] = tmp; sfx('sfx-tap', 0.25); paint(); } }); })(ts[j]);
  }
  paint();
  ctx.act('✔ 檢查', function(){
    var bad = [], k;
    for(k = 0; k < n; k++){ if(ord[k] !== k) bad.push(k); }
    if(!bad.length){ ctx.act(''); ctx.win(starsByMiss(A.lv.miss, 3)); return; }
    ctx.miss(); toast('還有 ' + bad.length + ' 塊位置不對,再看看!');
    for(k = 0; k < bad.length; k++) shake(ctx.body.querySelector('[data-p="' + bad[k] + '"]'));
  });
};
/* 🎡 補完色相環:把色票拖到空格 */
R.wheel = function(L, ctx){
  var blank = {}, left = [], i, all = [], nb = L.blanks.length, pick;
  /* ★ v1.1.0 第 18 項:空格每次隨機(數量照關卡設定),不會每次都是同一組 */
  for(i = 0; i < 12; i++) all.push(i);
  pick = shuffle(all).slice(0, nb);
  for(i = 0; i < pick.length; i++){ blank[pick[i]] = 1; left.push(pick[i]); }
  shuffle(left);
  var total = left.length;
  function paint(){
    var h = '<div style="display:flex;gap:4vmin;align-items:center;justify-content:center;width:100%;height:100%;flex-wrap:wrap"><div style="width:min(56vmin,60vw);height:min(56vmin,60vw)">' + wheelSvg({ blank: blank }) + '</div><div style="display:grid;grid-template-columns:repeat(3,auto);gap:1.4vmin">';
    for(i = 0; i < left.length; i++) h += '<div class="art-tile" data-c="' + left[i] + '" style="width:11vmin;height:11vmin;background:' + D.WHEEL[left[i]].c + ';color:#fff;font-size:2.2vmin;text-shadow:0 0 .4vmin #000">' + D.WHEEL[left[i]].n + '</div>';
    ctx.body.innerHTML = h + '</div></div>';
    ctx.prog('還剩 ' + left.length + ' 格');
    var ts = ctx.body.querySelectorAll('[data-c]'), j;
    for(j = 0; j < ts.length; j++) (function(t){ dragify(t, { dropAttr: 'data-wi', dropOk: function(d){ return !!blank[+d.getAttribute('data-wi')]; }, onDrop: function(x, y, tg){ var w = upFind(tg, 'data-wi'), ci = +t.getAttribute('data-c'), wi; if(!w) return; wi = +w.getAttribute('data-wi');
      if(!blank[wi]) return;
      if(wi === ci){ delete blank[wi]; left.splice(left.indexOf(ci), 1); sfx('sfx-ok', 0.35); paint(); if(!left.length) setTimeout(function(){ ctx.win(starsByMiss(A.lv.miss, total)); }, 400); }   /* ctx.win 內已檢查 ctx.alive */
      else { ctx.miss(); toast(D.WHEEL[ci].n + ' 應該放在 ' + D.WHEEL[(ci + 11) % 12].n + ' 和 ' + D.WHEEL[(ci + 1) % 12].n + ' 中間喔'); shake(t); } } }); })(ts[j]);
  }
  paint();
};
/* 🎯 色彩關係轉盤:點出相近色(兩個)/互補色/對比色 */
R.pickWheel = function(L, ctx){
  var ri = 0, bases = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]), RD = shuffle(L.rounds.map(function(r, k){ return { rel: r.rel, base: bases[k % 12] }; }));   /* ★ v1.1.0 第 13/18 項:題目順序與基準色每次都不一樣 */
  L = { rounds: RD };
  var tok = 0, busy = false;   /* ★ v1.1.3(檢查報告第 1 項):換題中鎖住;舊題的延遲重畫看回合編號,換題後不再蓋掉新題 */
  function round(){
    var rd = L.rounds[ri], base = rd.base, need, mark = {}, got = {}, nm = D.WHEEL[base].n, txt, my = ++tok;
    busy = false;
    if(rd.rel === 'comp'){ need = [(base + 6) % 12]; txt = '點出 <b>' + nm + '</b> 的 <b>互補色</b>(正對面)'; }
    else if(rd.rel === 'near'){ need = [(base + 1) % 12, (base + 11) % 12]; txt = '點出 <b>' + nm + '</b> 的兩個 <b>相近色</b>(左右鄰居)'; }
    else { need = [(base + 4) % 12, (base + 8) % 12, (base + 5) % 12, (base + 7) % 12]; txt = '點出 <b>' + nm + '</b> 的一個 <b>對比色</b>(相隔約 120°~150°)'; }
    mark[base] = '⭐';
    function paint(){
      ctx.body.innerHTML = '<div style="width:min(62vmin,70vw);height:min(62vmin,70vw)">' + wheelSvg({ mark: mark }) + '</div>';
      ctx.ask(txt); ctx.prog('第 ' + (ri + 1) + '/' + L.rounds.length + ' 題');
      var ps = ctx.body.querySelectorAll('[data-wi]'), j;
      for(j = 0; j < ps.length; j++) ps[j].onclick = function(){
        var wi = +this.getAttribute('data-wi'), k, gn = 0;
        if(busy || my !== tok || wi === base || got[wi] || mark[wi] === '✖') return;
        if(need.indexOf(wi) >= 0){ got[wi] = 1; mark[wi] = '✔'; sfx('sfx-ok', 0.35);
          for(k in got){ if(got.hasOwnProperty(k)) gn++; }
          if((rd.rel === 'near' && gn >= 2) || (rd.rel !== 'near' && gn >= 1)){ busy = true; paint(); ri++; setTimeout(function(){ if(my !== tok || !ctx.alive()) return; if(ri >= L.rounds.length) ctx.win(starsByMiss(A.lv.miss, L.rounds.length)); else round(); }, 650); return; }
          paint();
        } else { ctx.miss(); mark[wi] = '✖'; paint(); setTimeout(function(){ if(my !== tok) return; delete mark[wi]; paint(); }, 600); toast(rd.rel === 'comp' ? '互補色在正對面喔' : (rd.rel === 'near' ? '相近色是緊鄰的左右兩格' : '對比色隔開 4~5 格')); }
      };
    }
    paint();
  }
  round();
};
/* 🧪 混色:把兩罐顏料拖進調色碗 */
R.mix = function(L, ctx){
  var ri = 0, bowl = [];
  if(D.MIX_POOL) L = { rounds: shuffle(D.MIX_POOL.slice()).slice(0, L.rounds.length) };   /* ★ v1.1.0 第 18 項:混色目標每次從 9 色題庫抽 */
  function hex2(c){ return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]; }
  function avg(a, b){ var x = hex2(a), y = hex2(b), i, o = '#'; for(i = 0; i < 3; i++) o += ('0' + Math.round((x[i] + y[i]) / 2).toString(16)).slice(-2); return o; }
  function round(){
    var rd = L.rounds[ri], h, k, bc, lock = false;   /* ★ v1.1.3:兩罐倒進去之後到換題/洗碗前鎖住 */
    bowl = [];
    function paint(){
      bc = bowl.length === 2 ? ((bowl.slice().sort().join() === rd.a.slice().sort().join()) ? rd.c : avg(D.PAINTS[bowl[0]].c, D.PAINTS[bowl[1]].c)) : (bowl.length ? D.PAINTS[bowl[0]].c : '#f4efe6');
      h = '<div style="display:flex;flex-direction:column;align-items:center;gap:3vmin;width:100%">';
      h += '<div style="display:flex;gap:5vmin;align-items:center"><div style="text-align:center;font-weight:900">目標:' + rd.t + '<div style="width:14vmin;height:14vmin;border-radius:50%;background:' + rd.c + ';border:.5vmin solid #3a2f45;margin:1vmin auto"></div></div>'
        + '<div style="font-size:6vmin">➜</div><div id="art-bowl" data-bowl="1" style="width:22vmin;height:14vmin;border-radius:0 0 11vmin 11vmin;border:.6vmin solid #3a2f45;background:' + bc + ';display:flex;align-items:center;justify-content:center;font-weight:900;font-size:2.4vmin;color:#3a2f45">' + (bowl.length ? bowl.map(function(p){ return D.PAINTS[p].n; }).join(' + ') : '拖顏料進來') + '</div></div>';
      h += '<div style="display:flex;gap:2.4vmin">';
      for(k in D.PAINTS){ if(D.PAINTS.hasOwnProperty(k)) h += '<div class="art-tile" data-pt="' + k + '" style="width:12vmin;height:15vmin;background:' + D.PAINTS[k].c + ';color:' + (k === 'black' || k === 'blue' || k === 'red' ? '#fff' : '#3a2f45') + ';font-size:3vmin;border-radius:2vmin 2vmin 3vmin 3vmin">' + D.PAINTS[k].n + '</div>'; }
      ctx.body.innerHTML = h + '</div></div>';
      ctx.prog('第 ' + (ri + 1) + '/' + L.rounds.length + ' 色'); ctx.ask('調出「' + rd.t + '」:把兩罐顏料拖進碗裡');
      var ts = ctx.body.querySelectorAll('[data-pt]'), j;
      for(j = 0; j < ts.length; j++) (function(t){ dragify(t, { dropAttr: 'data-bowl', onDrop: function(x, y, tg){ if(lock || !upFind(tg, 'data-bowl')) return; var p = t.getAttribute('data-pt'); if(bowl.length >= 2) bowl = []; if(bowl.indexOf(p) >= 0) return; bowl.push(p); sfx('sfx-tap', 0.3); paint();
        if(bowl.length === 2){ lock = true; if(bowl.slice().sort().join() === rd.a.slice().sort().join()){ sfx('sfx-ok', 0.4); toast('🎨 ' + D.PAINTS[bowl[0]].n + ' + ' + D.PAINTS[bowl[1]].n + ' = ' + rd.t + '!'); ri++; setTimeout(function(){ if(!ctx.alive()) return; if(ri >= L.rounds.length) ctx.win(starsByMiss(A.lv.miss, L.rounds.length)); else round(); }, 900); }
          else { ctx.miss(); toast('變成另一個顏色了,碗洗乾淨再試一次'); setTimeout(function(){ if(!ctx.alive()) return; lock = false; bowl = []; paint(); }, 1000); } } } }); })(ts[j]);
    }
    paint();
  }
  round();
};
/* 🏷 貼名牌:把五調子名牌拖到球上 */
R.label = function(L, ctx){
  var placed = {}, i, left = shuffle(L.labels.slice());
  function paint(){
    var h = '<div style="display:flex;gap:3vmin;align-items:center;justify-content:center;width:100%;flex-wrap:wrap"><div class="art-frame" style="width:min(64vmin,62vw);height:min(64vmin,62vw);background:#f4efe6">';
    h += '<svg viewBox="0 0 100 100" width="100%" height="100%" style="position:absolute;inset:0"><defs><radialGradient id="artsph" cx="35%" cy="35%" r="75%"><stop offset="0" stop-color="#ffffff"/><stop offset=".18" stop-color="#e2e2e2"/><stop offset=".4" stop-color="#a8a8a8"/><stop offset=".58" stop-color="#4a4a4a"/><stop offset=".66" stop-color="#363636"/><stop offset=".82" stop-color="#666666"/><stop offset="1" stop-color="#8c8c8c"/></radialGradient><radialGradient id="artcast" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#2a2a2a" stop-opacity=".85"/><stop offset="1" stop-color="#2a2a2a" stop-opacity="0"/></radialGradient></defs>'
      + '<rect y="72" width="100" height="28" fill="#e2dccf"/><ellipse cx="74" cy="82" rx="26" ry="8" fill="url(#artcast)"/><circle cx="46" cy="46" r="30" fill="url(#artsph)"/><text x="8" y="12" font-size="10">💡</text></svg>';
    for(i = 0; i < L.spots.length; i++){ var s = L.spots[i];
      h += '<div data-spot="' + i + '" style="position:absolute;left:' + s.x + '%;top:' + s.y + '%;transform:translate(-50%,-50%);' + (placed[i] ? '' : 'width:6vmin;height:6vmin;border:.5vmin dashed #ff7a59;border-radius:50%;background:rgba(255,255,255,.35)') + '">' + (placed[i] ? '<span class="art-label" style="cursor:default;background:#c9f7d6">' + esc(s.a) + '</span>' : '') + '</div>'; }
    h += '</div><div style="display:flex;flex-direction:column;gap:1.6vmin">';
    for(i = 0; i < left.length; i++) h += '<span class="art-label" data-lb="' + esc(left[i]) + '">' + esc(left[i]) + '</span>';
    ctx.body.innerHTML = h + '</div></div>';
    ctx.prog('還剩 ' + left.length + ' 個');
    var ts = ctx.body.querySelectorAll('[data-lb]'), j;
    for(j = 0; j < ts.length; j++) (function(t){ var nm = t.getAttribute('data-lb'); dragify(t, { dropAttr: 'data-spot', dropOk: function(d){ return !placed[+d.getAttribute('data-spot')]; },
      onLong: function(){ modal('<h3>🏷 ' + esc(nm) + '</h3><p>' + esc(D.GLOSS[nm] || '') + '</p>'); },
      onDrop: function(x, y, tg){ var sp = upFind(tg, 'data-spot'), si, q, r, d2, best = 1e9, sps;
        /* ★ v1.1.3 第 11 項:靠很近的兩圈(明暗交界線/反光)改成「放開的點離哪個沒貼的圈心最近」;放在圈外附近也算,太遠才提示 */
        sps = ctx.body.querySelectorAll('[data-spot]'); sp = null;
        for(q = 0; q < sps.length; q++){ if(placed[+sps[q].getAttribute('data-spot')]) continue; r = sps[q].getBoundingClientRect(); d2 = Math.pow(x - (r.left + r.width / 2), 2) + Math.pow(y - (r.top + r.height / 2), 2); if(d2 < best){ best = d2; sp = sps[q]; } }
        if(!sp || best > Math.pow(Math.min(window.innerWidth, window.innerHeight) * 0.07, 2)){ toast('把名牌放到球上的虛線圈裡喔'); return; }
        si = +sp.getAttribute('data-spot'); if(placed[si]) return;
        if(L.spots[si].a === nm){ placed[si] = 1; left.splice(left.indexOf(nm), 1); sfx('sfx-ok', 0.35); paint(); if(!left.length) setTimeout(function(){ ctx.win(starsByMiss(A.lv.miss, L.spots.length)); }, 500); }
        else { ctx.miss(); toast('不是這裡喔:「' + nm + '」是' + (D.GLOSS[nm] || '')); } } }); })(ts[j]);
  }
  paint();
};
/* 💡 光從哪裡來:看燈的位置,選出正確的影子 */
R.shadow = function(L, ctx){
  var ri = 0, LIGHTS = [{ n: '左上', x: 12, y: 12, sx: 1 }, { n: '右上', x: 88, y: 12, sx: -1 }, { n: '左邊低處', x: 8, y: 52, sx: 1.8 }, { n: '右邊低處', x: 92, y: 52, sx: -1.8 }];
  function pic(lx, ly, sx, showLamp){ return '<svg viewBox="0 0 100 80" width="100%" height="100%"><rect width="100" height="80" fill="#f4efe6"/><rect y="56" width="100" height="24" fill="#e2dccf"/>'
      + '<ellipse cx="' + (50 + sx * 16) + '" cy="62" rx="' + (12 + Math.abs(sx) * 7) + '" ry="4" fill="#333" opacity=".6"/><circle cx="50" cy="44" r="14" fill="#b0b0b0" stroke="#3a2f45" stroke-width="1.5"/>'
      + (showLamp ? '<text x="' + lx + '" y="' + ly + '" font-size="12" text-anchor="middle" dominant-baseline="middle">💡</text>' : '') + '</svg>'; }
  function round(){
    var lt = LIGHTS[Math.floor(Math.random() * LIGHTS.length)], opts = [lt.sx, -lt.sx, 0], h, i;
    shuffle(opts);
    h = '<div style="display:flex;flex-direction:column;align-items:center;gap:2vmin;width:100%"><div style="width:min(44vmin,46vw);height:min(35vmin,37vw);border:.5vmin solid #3a2f45;border-radius:1.4vmin;overflow:hidden">'
      + '<svg viewBox="0 0 100 80" width="100%" height="100%"><rect width="100" height="80" fill="#f4efe6"/><rect y="56" width="100" height="24" fill="#e2dccf"/><circle cx="50" cy="44" r="14" fill="#b0b0b0" stroke="#3a2f45" stroke-width="1.5"/><text x="' + lt.x + '" y="' + lt.y + '" font-size="12" text-anchor="middle" dominant-baseline="middle">💡</text><text x="50" y="72" font-size="6" text-anchor="middle" fill="#6b6178">影子在哪裡?</text></svg></div><div style="display:flex;gap:2.4vmin">';
    for(i = 0; i < 3; i++) h += '<button class="art-opt" data-o="' + i + '" style="width:min(26vmin,28vw);height:min(21vmin,23vw);padding:0;overflow:hidden">' + pic(lt.x, lt.y, opts[i], false) + '</button>';
    ctx.body.innerHTML = h + '</div></div>';
    ctx.ask('燈在 <b>' + lt.n + '</b>,球的影子會落在哪裡?點正確的那一張');
    ctx.prog('第 ' + (ri + 1) + '/' + L.rounds + ' 題');
    var bs = ctx.body.querySelectorAll('[data-o]'), j;
    var lock = false;   /* ★ v1.1.3 第 5 項:答對後到下一題前鎖住(不會跳題、不會誤扣分);同一個錯的選項只扣一次 */
    for(j = 0; j < bs.length; j++) bs[j].onclick = function(){ var o = +this.getAttribute('data-o');
      if(lock || this.className.indexOf('wrong') >= 0) return;
      if(opts[o] === lt.sx){ lock = true; this.className += ' right'; sfx('sfx-ok', 0.35); ri++; setTimeout(function(){ if(!ctx.alive()) return; if(ri >= L.rounds) ctx.win(starsByMiss(A.lv.miss, L.rounds)); else round(); }, 700); }
      else { this.className += ' wrong'; ctx.miss(); toast(opts[o] === 0 ? '影子不會躲在球正下方,光是斜斜照過來的' : '影子在光的「相反邊」喔'); } };
  }
  round();
};
/* ❓ 看圖判斷 */
/* ★ v1.1.0 第 13 項:題目順序(有前後關係的關卡 noShuffleQ 除外)與選項每次打亂;第 10 項:同一題錯兩次 ⇒ 其他錯的選項淡掉+跳教學卡 */
function quizShuffle(L){
  var qs = L.qs.map(function(q){ var o = JSON.parse(JSON.stringify(q)), n = (o.opts || o.sw || (typeof o.svg !== 'string' ? o.svg : null) || []).length, p = [], k, key;
    for(k = 0; k < n; k++) p.push(k);
    shuffle(p);
    key = o.opts ? 'opts' : (o.sw ? 'sw' : 'svg');
    if(n > 1 && o[key] && typeof o[key] !== 'string'){ o[key] = p.map(function(ix){ return q[key][ix]; }); o.a = p.indexOf(q.a); }
    return o; });
  return L.noShuffleQ ? qs : shuffle(qs);
}
R.quiz = function(L, ctx){
  var qi = 0, qs = quizShuffle(L);
  function round(){
    var q = qs[qi], h = '<div style="display:flex;flex-direction:column;align-items:center;gap:2.4vmin;width:100%;max-width:120vmin">', i, n, wrong = 0;
    h += '<div style="font-weight:900;font-size:3vmin;text-align:center">' + esc(q.q) + '</div>';
    if(q.svg && typeof q.svg === 'string') h += '<div style="width:min(60vmin,64vw);height:min(37vmin,40vw);border:.5vmin solid #3a2f45;border-radius:1.4vmin;overflow:hidden;background:#fff">' + (q.svg.indexOf('pr:') === 0 ? svgPrinciple(q.svg.slice(3)) : (q.svg.indexOf('st:') === 0 ? svgStyle(q.svg.slice(3)) : svgComp(q.svg.slice(3)))) + '</div>';
    h += '<div style="display:flex;gap:2vmin;flex-wrap:wrap;justify-content:center">';
    if(q.svg && typeof q.svg !== 'string'){ for(i = 0; i < q.svg.length; i++){ var p = q.svg[i].split(':'); h += '<button class="art-opt" data-o="' + i + '" style="width:min(28vmin,30vw);height:min(28vmin,30vw);padding:.6vmin">' + svgHatch(+p[1], +p[2]) + '</button>'; } }
    else if(q.sw){ for(i = 0; i < q.sw.length; i++){ h += '<button class="art-opt" data-o="' + i + '" style="display:flex;gap:.8vmin;padding:1.4vmin">'; for(n = 0; n < q.sw[i].length; n++) h += '<span style="width:10vmin;height:10vmin;border-radius:1.4vmin;border:.35vmin solid #3a2f45;background:' + q.sw[i][n] + '"></span>'; h += '</button>'; } }
    else { for(i = 0; i < q.opts.length; i++) h += '<button class="art-opt" data-o="' + i + '" style="min-width:22vmin;padding:1.6vmin 2.4vmin">' + esc(q.opts[i]) + '</button>'; }
    ctx.body.innerHTML = h + '</div></div>';
    ctx.ask(''); ctx.prog('第 ' + (qi + 1) + '/' + qs.length + ' 題');
    var bs = ctx.body.querySelectorAll('[data-o]'), j, lock = false;   /* ★ v1.1.3 第 5 項 */
    for(j = 0; j < bs.length; j++) bs[j].onclick = function(){ var o = +this.getAttribute('data-o');
      if(lock || this.className.indexOf('wrong') >= 0) return;
      if(o === q.a){ lock = true; this.className += ' right'; sfx('sfx-ok', 0.35); ctx.ask('✅ ' + esc(q.why)); qi++; setTimeout(function(){ if(!ctx.alive()) return; if(qi >= qs.length) ctx.win(starsByMiss(A.lv.miss, qs.length)); else round(); }, 1500); }
      else { this.className += ' wrong'; ctx.miss(); wrong++;
        if(wrong >= 2){ var k2; for(k2 = 0; k2 < bs.length; k2++){ if(+bs[k2].getAttribute('data-o') !== q.a && bs[k2].className.indexOf('wrong') < 0) bs[k2].className += ' fade'; }
          ctx.ask('💡 只剩下一個答案了,先看看小提示');
          sfx('sfx-knowledge', 0.4);
          modal('<h3>📘 小提示</h3><div class="scard">' + esc(T(L.tip)) + '</div><p style="font-size:2.3vmin;color:#6b6178">錯的選項已經變淡了,想一想再選剩下的那一個。</p>', [{ t: '我懂了' }]);
        } else ctx.ask('💡 再想想看'); } };
  }
  round();
};
/* 🔍 誰破壞了統一 */
R.odd = function(L, ctx){
  var ri = 0, KINDS = shuffle(['color', 'shape', 'size', 'outline']), COLS = shuffle(['#4aa3ff', '#ff7a59', '#4fcf7a', '#a36bff', '#f5b700']);   /* ★ v1.1.0 第 18 項:種類順序、顏色、位置都隨機 */
  function round(){
    var kind = KINDS[ri % KINDS.length], n = 12, odd = Math.floor(Math.random() * n), h = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:2vmin;width:min(70vmin,80vw)">', i, base = COLS[ri % COLS.length], st;
    for(i = 0; i < n; i++){
      st = 'width:9vmin;height:9vmin;border-radius:50%;background:' + base + ';border:.4vmin solid #3a2f45;margin:auto';
      if(i === odd){
        if(kind === 'color') st = st.replace(base, base === '#ff7a59' ? '#4aa3ff' : '#ff7a59');
        else if(kind === 'shape') st = st.replace('border-radius:50%', 'border-radius:.6vmin');
        else if(kind === 'size') st = st.replace('width:9vmin;height:9vmin', 'width:5.4vmin;height:5.4vmin');
        else st = st.replace('background:' + base, 'background:transparent');
      }
      h += '<button class="art-opt" data-o="' + i + '" style="height:13vmin;display:flex;align-items:center;justify-content:center"><span style="display:block;' + st + '"></span></button>';
    }
    ctx.body.innerHTML = h + '</div>';
    ctx.ask('哪一個破壞了「統一」?點它!'); ctx.prog('第 ' + (ri + 1) + '/' + L.rounds + ' 題');
    var bs = ctx.body.querySelectorAll('[data-o]'), j, lock = false;   /* ★ v1.1.3 第 5 項 */
    for(j = 0; j < bs.length; j++) bs[j].onclick = function(){ var o = +this.getAttribute('data-o');
      if(lock || this.className.indexOf('wrong') >= 0) return;
      if(o === odd){ lock = true; this.className += ' right'; sfx('sfx-ok', 0.35); toast({ color: '顏色不一樣!', shape: '形狀不一樣!', size: '大小不一樣!', outline: '只有它是空心的!' }[kind]); ri++; setTimeout(function(){ if(!ctx.alive()) return; if(ri >= L.rounds) ctx.win(starsByMiss(A.lv.miss, L.rounds)); else round(); }, 700); }
      else { this.className += ' wrong'; ctx.miss(); } };
  }
  round();
};
/* 🖼 構圖擺放:在畫框裡拖東西,系統依構圖規則量位置 */
R.compose = function(L, ctx){
  var objs = JSON.parse(JSON.stringify(L.objs)), fr, i, guide = '', PT = [[33.33, 33.33, '左上'], [66.66, 33.33, '右上'], [33.33, 66.66, '左下'], [66.66, 66.66, '右下']], tgt = PT[Math.floor(Math.random() * 4)];
  var fw = 'min(86vmin,74vw)', fh = 'min(64.5vmin,55.5vw)';
  /* ★ v1.1.0 第 18 項:物件起始位置隨機(避開目標);三分法每次指定一個交叉點 */
  /* ★ v1.1.3(檢查報告第 16 項):真的避開目標點、物件彼此不疊在一起(最多試 40 次,試不到就用最後一次) */
  for(i = 0; i < objs.length; i++) objs[i].x = null;
  objs.slice().sort(function(a, b){ return (b.main ? 1 : 0) - (a.main ? 1 : 0); }).forEach(function(o){ (function(o){ var t, k, ok, q;
    if(L.rule === 'thirds' && o.main){ o.x = 50 + (Math.random() - 0.5) * 8; o.y = 50 + (Math.random() - 0.5) * 8; return; }
    for(t = 0; t < 40; t++){ o.x = clamp(Math.round(12 + Math.random() * 76), 8, 92); o.y = clamp(Math.round(14 + Math.random() * 72), 10, 90); ok = true;
      if(L.rule === 'thirds' && Math.abs(o.x - tgt[0]) + Math.abs(o.y - tgt[1]) < 16) ok = false;
      for(k = 0; ok && k < objs.length; k++){ q = objs[k]; if(q === o || q.x == null) continue; if(Math.abs(q.x - o.x) < 14 && Math.abs(q.y - o.y) < 16) ok = false; }
      if(ok) break; } })(o); });
  if(L.rule === 'thirds') ctx.ask('把主角「🏠 房子」拖到 <b>' + tgt[2] + '</b> 的三分線交叉點');
  if(L.rule === 'thirds') guide = '<div class="g" style="left:33.33%;top:0;bottom:0;width:.3vmin"></div><div class="g" style="left:66.66%;top:0;bottom:0;width:.3vmin"></div><div class="g" style="top:33.33%;left:0;right:0;height:.3vmin"></div><div class="g" style="top:66.66%;left:0;right:0;height:.3vmin"></div>';
  else if(L.rule === 'symmetry') guide = '<div class="g" style="left:50%;top:0;bottom:0;width:.3vmin;opacity:.6"></div>';
  else if(L.rule === 'persp') guide = '<div class="g" style="top:' + L.horizon + '%;left:0;right:0;height:.4vmin;background:rgba(58,47,69,.45)"></div>';
  if(L.rule === 'thirds') guide += '<div style="position:absolute;left:' + tgt[0] + '%;top:' + tgt[1] + '%;width:5vmin;height:5vmin;margin:-2.5vmin 0 0 -2.5vmin;border:.5vmin dashed #ff7a59;border-radius:50%;pointer-events:none"></div>';
  ctx.body.innerHTML = '<div class="art-frame" id="art-fr" style="width:' + fw + ';height:' + fh + (L.rule === 'persp' ? ';background:linear-gradient(#cfe9ff 0 ' + L.horizon + '%,#bfe6a8 ' + L.horizon + '% 100%)' : '') + '">' + guide + '</div>';
  fr = $('art-fr');
  for(i = 0; i < objs.length; i++) (function(o, k){
    var e = document.createElement('div'); e.className = 'art-obj'; e.textContent = o.e; e.style.fontSize = o.s + 'vmin'; e.style.left = o.x + '%'; e.style.top = o.y + '%';
    fr.appendChild(e);
    dragify(e, { live: true, onMove: function(x, y){ var r = fr.getBoundingClientRect(); o.x = clamp((x - r.left) / r.width * 100, 4, 96); o.y = clamp((y - r.top) / r.height * 100, 6, 94); e.style.left = o.x + '%'; e.style.top = o.y + '%'; } });
  })(objs[i], i);
  ctx.act('✔ 檢查構圖', function(){
    var res = judge();
    if(res.stars){ ctx.act(''); ctx.win(Math.max(1, Math.min(res.stars, starsByMiss(A.lv.miss, 4) + 1)), res.card); }
    else { ctx.miss(); toast(res.msg); }
  });
  function judge(){
    var m, d, best = 99, pts = [[33.33, 33.33], [66.66, 33.33], [33.33, 66.66], [66.66, 66.66]], j, a, b, c, k1, k2, k3;
    if(L.rule === 'thirds'){
      for(j = 0; j < objs.length; j++) if(objs[j].main) m = objs[j];
      best = Math.sqrt(Math.pow(m.x - tgt[0], 2) + Math.pow((m.y - tgt[1]) * 0.75, 2));
      for(j = 0; j < 4; j++){ d = Math.sqrt(Math.pow(m.x - pts[j][0], 2) + Math.pow((m.y - pts[j][1]) * 0.75, 2)); if(d < 8 && pts[j][0] !== tgt[0] || d < 8 && pts[j][1] !== tgt[1]){ if(d < best) return { stars: 0, msg: '這是另一個交叉點喔,題目要的是「' + tgt[2] + '」那一個' }; } }
      if(best <= 6) return { stars: 3, card: [{ ok: 1, t: '房子剛好在' + tgt[2] + '的三分線交叉點上,畫面很生動!' }] };
      if(best <= 10) return { stars: 2, card: [{ ok: 1, t: '房子靠近交叉點了。' }, { ok: 0, t: '再對準交叉點一點點會更好。' }] };
      return { stars: 0, msg: Math.abs(m.x - 50) < 8 && Math.abs(m.y - 50) < 8 ? '房子放在正中間了,試試看移到' + tgt[2] + '的交叉點(虛線圈)' : '把房子拖到' + tgt[2] + '的交叉點(虛線圈)' };
    }
    if(L.rule === 'symmetry'){
      a = null; b = []; for(j = 0; j < objs.length; j++){ if(objs[j].main) a = objs[j]; else b.push(objs[j]); }
      c = Math.abs(a.x - 50) + Math.abs(b[0].x + b[1].x - 100) + Math.abs(b[0].y - b[1].y);
      if(Math.abs(b[0].x - b[1].x) < 20) return { stars: 0, msg: '兩棵樹要分開放在左右兩邊' };
      if(Math.abs(a.x - 50) > 7) return { stars: 0, msg: '城堡要放在中間那條線上' };
      if(c <= 10) return { stars: 3, card: [{ ok: 1, t: '左右完全對稱,畫面很穩重!' }] };
      if(c <= 18) return { stars: 2, card: [{ ok: 1, t: '已經是對稱構圖了。' }, { ok: 0, t: '兩棵樹離中線的距離、高度再一致一點。' }] };
      return { stars: 0, msg: '兩棵樹離中線要一樣遠、高度一樣' };
    }
    if(L.rule === 'persp'){
      for(j = 0; j < objs.length; j++){ if(objs[j].k === 1) k1 = objs[j]; if(objs[j].k === 2) k2 = objs[j]; if(objs[j].k === 3) k3 = objs[j]; }
      if(!(k1.y < k2.y - 4 && k2.y < k3.y - 4)) return { stars: 0, msg: '最大的樹放最下面(近),最小的放最上面(遠)' };
      if(k1.y < L.horizon - 4) return { stars: 0, msg: '樹不會長在天空裡,最遠的樹放在地平線上' };
      d = Math.abs(k1.y - L.horizon - 4);
      if(d <= 8) return { stars: 3, card: [{ ok: 1, t: '近大遠小,最遠的樹貼著地平線,很有深度!' }] };
      return { stars: 2, card: [{ ok: 1, t: '大小與上下順序都對了。' }, { ok: 0, t: '最小的樹再靠近地平線,距離感會更強。' }] };
    }
    if(L.rule === 'diagonal'){
      a = objs.slice().sort(function(p, q){ return p.x - q.x; });
      var mx = 0, my = 0, sxx = 0, sxy = 0, slope, res = 0;
      for(j = 0; j < a.length; j++){ mx += a[j].x; my += a[j].y; } mx /= a.length; my /= a.length;
      for(j = 0; j < a.length; j++){ sxx += (a[j].x - mx) * (a[j].x - mx); sxy += (a[j].x - mx) * (a[j].y - my); }
      if(a[a.length - 1].x - a[0].x < 40) return { stars: 0, msg: '鳥要從畫面左邊排到右邊' };
      slope = sxy / sxx;
      for(j = 0; j < a.length; j++) res = Math.max(res, Math.abs(a[j].y - (my + slope * (a[j].x - mx))));
      if(slope > -0.35) return { stars: 0, msg: slope > 0.35 ? '方向反了:要從左下排到右上' : '太平了,要斜斜地往右上排' };
      if(res <= 6) return { stars: 3, card: [{ ok: 1, t: '鳥排成一條漂亮的斜線,畫面很有衝勁!' }] };
      if(res <= 11) return { stars: 2, card: [{ ok: 1, t: '對角線的方向對了。' }, { ok: 0, t: '中間有一隻偏離斜線,排直一點更好。' }] };
      return { stars: 0, msg: '四隻鳥要排在同一條斜線上' };
    }
    return { stars: 1 };
  }
};
/* 🔗 ★ v1.1.0 配對(媒材特性、鑑賞步驟、藝術家名片):把左邊名牌拖到右邊對應的句子 */
R.match = function(L, ctx){
  var rows = shuffle(L.pairs.map(function(p, k){ return { a: p.a, b: p.b, k: k }; })), left = shuffle(L.pairs.map(function(p){ return p.a; })), done = {};
  function paint(){
    var h = '<div style="display:flex;gap:3vmin;align-items:center;justify-content:center;width:100%;height:100%"><div style="display:flex;flex-direction:column;gap:1.4vmin">', i, r;
    for(i = 0; i < left.length; i++) h += '<span class="art-label" data-lb="' + esc(left[i]) + '">' + esc(left[i]) + '</span>';
    h += '</div><div style="display:flex;flex-direction:column;gap:1.1vmin;flex:1;max-width:96vmin">';
    for(i = 0; i < rows.length; i++){ r = rows[i]; h += '<div class="art-mt" data-mt="' + i + '"><span class="slot">' + (done[i] ? '<span class="art-label" style="cursor:default;background:#c9f7d6">' + esc(r.a) + '</span>' : '?') + '</span><span>' + esc(r.b) + '</span></div>'; }
    ctx.body.innerHTML = h + '</div></div>';
    ctx.prog('還剩 ' + left.length + ' 個');
    var ts = ctx.body.querySelectorAll('[data-lb]'), j;
    for(j = 0; j < ts.length; j++) (function(t){ var nm = t.getAttribute('data-lb'); dragify(t, { dropAttr: 'data-mt', dropOk: function(d){ return !done[+d.getAttribute('data-mt')]; },
      onLong: function(){ modal('<h3>🔗 ' + esc(nm) + '</h3><p>' + esc(T(L.tip)) + '</p>'); },
      onDrop: function(x, y, tg){ var m = upFind(tg, 'data-mt'), mi; if(!m) return; mi = +m.getAttribute('data-mt'); if(done[mi]) return;
        if(rows[mi].a === nm){ done[mi] = 1; left.splice(left.indexOf(nm), 1); sfx('sfx-ok', 0.35); paint(); if(!left.length) setTimeout(function(){ ctx.win(starsByMiss(A.lv.miss, rows.length)); }, 500); }
        else { ctx.miss(); shake(m); toast('「' + nm + '」不是這一句,再想想看'); } } }); })(ts[j]);
  }
  paint();
};
/* 🖼 ★ v1.1.0 風格示範圖(全部程式畫的原創小圖,不重製任何名作;著作權原則見設計書第六節) */
function svgStyle(k){
  var h = '<svg viewBox="0 0 240 150" width="100%" height="100%">', i, j, x, y, c, r2 = rng(hashStr('st' + k));
  function R(a, b){ return a + Math.floor(r2() * (b - a + 1)); }
  if(k === 'cave'){ h += '<rect width="240" height="150" fill="#c9a27a"/>'; for(i = 0; i < 40; i++) h += '<circle cx="' + R(0, 240) + '" cy="' + R(0, 150) + '" r="' + R(4, 14) + '" fill="#b88d63" opacity=".5"/>';
    h += '<path d="M40 80 Q60 55 95 62 Q120 60 128 72 L134 70 L130 84 Q120 92 100 92 L96 112 L90 112 L88 94 L62 94 L58 112 L52 112 L50 92 Q38 88 40 80 Z" fill="#7a3b1e"/><path d="M128 72 L140 60 L138 74" stroke="#7a3b1e" stroke-width="4" fill="none"/>';
    h += '<path d="M160 100 L170 80 L180 100 M170 80 L170 60 M162 68 L178 68" stroke="#3a2a1a" stroke-width="4" fill="none"/><circle cx="170" cy="54" r="6" fill="#3a2a1a"/>';
    for(i = 0; i < 5; i++) h += '<path d="M' + (190 + i * 8) + ' 120 l4 -14 l4 14" stroke="#7a3b1e" stroke-width="3" fill="none"/>'; }
  else if(k === 'egypt'){ h += '<rect width="240" height="150" fill="#f0dca0"/><rect x="0" y="0" width="240" height="14" fill="#2e6fd8"/><rect x="0" y="136" width="240" height="14" fill="#2e6fd8"/>';
    for(i = 0; i < 2; i++){ x = 70 + i * 100; h += '<g transform="translate(' + x + ',0)"><path d="M-6 40 Q-2 28 10 30 Q18 32 16 44 L20 46 L14 50 Q12 58 4 58 L0 70 L-14 70 L-10 58 Q-10 48 -6 40 Z" fill="#c8844e"/><path d="M-10 30 Q0 22 14 30 L12 40 L-12 46 Z" fill="#222"/><ellipse cx="9" cy="42" rx="4" ry="2.4" fill="#fff"/><circle cx="9" cy="42" r="1.6" fill="#222"/>'
      + '<rect x="-16" y="70" width="34" height="34" fill="#c8844e"/><path d="M-20 104 L22 104 L18 128 L-16 128 Z" fill="#fff"/><path d="M-12 128 l-6 8 h12 Z M8 128 l12 8 h-12 Z" fill="#c8844e"/><path d="M18 76 L40 66" stroke="#c8844e" stroke-width="6"/></g>'; }
    h += '<path d="M14 30 h22 M14 40 h22 M14 50 h22 M204 30 v28 M196 38 h16" stroke="#8a5a2b" stroke-width="3"/><circle cx="204" cy="24" r="6" fill="none" stroke="#8a5a2b" stroke-width="3"/>'; }
  else if(k === 'glass'){ h += '<rect width="240" height="150" fill="#222"/><path d="M60 150 L60 50 Q120 -10 180 50 L180 150 Z" fill="#111"/>'; c = ['#e8302f', '#2e6fd8', '#f9e11e', '#3bb54a', '#8e3fb5', '#1aa6a0'];
    for(i = 0; i < 6; i++){ for(j = 0; j < 4; j++){ x = 64 + i * 19; y = 52 + j * 24; h += '<rect x="' + x + '" y="' + y + '" width="17" height="22" fill="' + c[(i + j * 2) % 6] + '" stroke="#111" stroke-width="3"/>'; } }
    h += '<circle cx="120" cy="38" r="20" fill="#f9e11e" stroke="#111" stroke-width="3"/><path d="M120 18 L120 58 M100 38 L140 38" stroke="#111" stroke-width="3"/>'; }
  else if(k === 'impress' || k === 'scene'){ h += '<rect width="240" height="150" fill="' + (k === 'scene' ? '#ffb27a' : '#bcd8f0') + '"/>';
    for(i = 0; i < (k === 'scene' ? 0 : 90); i++){ y = R(0, 75); h += '<rect x="' + R(0, 236) + '" y="' + y + '" width="9" height="3" rx="1.5" fill="' + ['#f6c6a6', '#cfe3f6', '#ffe7a8', '#b4cde8'][R(0, 3)] + '" transform="rotate(' + R(-20, 20) + ' 120 ' + y + ')"/>'; }
    if(k === 'scene'){ h += '<rect y="0" width="240" height="40" fill="#ff8f6b"/><rect y="40" width="240" height="40" fill="#ffc07a"/><circle cx="150" cy="80" r="22" fill="#ffdf5e"/>'; }
    h += '<rect y="80" width="240" height="70" fill="' + (k === 'scene' ? '#4b5fb5' : '#5f8fc4') + '"/>';
    for(i = 0; i < 110; i++){ x = R(0, 236); y = R(82, 148); h += '<rect x="' + x + '" y="' + y + '" width="' + R(6, 12) + '" height="2.6" rx="1.3" fill="' + (k === 'scene' ? ['#ffdf5e', '#7a6fd0', '#38489a', '#ff9f6b'][R(0, 3)] : ['#ffffff', '#8fb8e2', '#3f6ea8', '#ffe7a8'][R(0, 3)]) + '"/>'; }
    if(k === 'scene'){ h += '<path d="M70 104 L102 104 L96 112 L76 112 Z" fill="#3a2f45"/><path d="M86 104 L86 86 L98 102 Z" fill="#fff"/><rect x="200" y="54" width="12" height="44" fill="#fff" stroke="#3a2f45" stroke-width="2"/><rect x="200" y="54" width="12" height="10" fill="#e8302f"/><path d="M196 54 L216 54 L206 44 Z" fill="#3a2f45"/>';
      h += '<path d="M40 40 q5 -5 10 0 q5 -5 10 0 M60 26 q4 -4 8 0 q4 -4 8 0 M120 30 q4 -4 8 0 q4 -4 8 0" stroke="#3a2f45" stroke-width="2" fill="none"/>'; } }
  else if(k === 'pointil'){ h += '<rect width="240" height="150" fill="#fffdf6"/>';
    for(i = 0; i < 700; i++){ x = R(2, 238); y = R(2, 148); c = y < 70 ? ['#8fc4ef', '#c7e4ff', '#ffe9a8'][R(0, 2)] : (y < 100 ? ['#3bb54a', '#a6d22e', '#2e6fd8'][R(0, 2)] : ['#f7931e', '#f9e11e', '#3bb54a'][R(0, 2)]);
      if(Math.pow(x - 170, 2) + Math.pow(y - 60, 2) < 280) c = ['#e8302f', '#f05a28'][R(0, 1)]; h += '<circle cx="' + x + '" cy="' + y + '" r="2.2" fill="' + c + '"/>'; } }
  else if(k === 'vangogh'){ h += '<rect width="240" height="150" fill="#1e3c8c"/>';
    for(i = 0; i < 4; i++){ x = 34 + i * 48; y = 42 + (i % 2) * 22; for(j = 0; j < 3; j++){ var sp = '', tt, rr; for(tt = 0; tt <= 3.2 * Math.PI; tt += 0.3){ rr = 2 + tt * (2.2 + j * 0.5); sp += (sp ? ' L' : 'M') + (x + rr * Math.cos(tt + j)).toFixed(1) + ' ' + (y + rr * Math.sin(tt + j) * 0.7).toFixed(1); }
      h += '<path d="' + sp + '" stroke="' + ['#cfe3ff', '#f9e11e', '#7fb2ff'][j] + '" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; } }   /* 旋渦筆觸 */
    for(i = 0; i < 6; i++) h += '<circle cx="' + R(10, 230) + '" cy="' + R(8, 30) + '" r="2.5" fill="#ffe25e"/>';
    h += '<circle cx="205" cy="28" r="14" fill="#ffe25e"/><circle cx="205" cy="28" r="20" fill="none" stroke="#ffd03a" stroke-width="3"/><path d="M0 120 Q60 100 120 118 T240 112 L240 150 L0 150 Z" fill="#203060"/><path d="M40 150 Q30 90 46 40 Q52 90 60 150 Z" fill="#14281a"/>'; }
  else if(k === 'fauve'){ h += '<rect width="240" height="150" fill="#ff8a00"/><rect x="0" y="0" width="120" height="150" fill="#e8302f"/><circle cx="160" cy="70" r="36" fill="#3bb54a"/><path d="M146 66 q4 -4 8 0 M168 66 q4 -4 8 0" stroke="#5b4bc4" stroke-width="4" fill="none"/><path d="M150 86 q10 8 20 0" stroke="#c8338a" stroke-width="5" fill="none"/><path d="M124 38 Q160 8 196 38" stroke="#2e6fd8" stroke-width="10" fill="none"/><path d="M30 150 L30 60 M30 80 Q60 40 80 70 M30 70 Q0 40 10 30" stroke="#1aa6a0" stroke-width="8" fill="none"/><circle cx="60" cy="40" r="18" fill="#f9e11e"/>'; }
  else if(k === 'cubism'){ h += '<rect width="240" height="150" fill="#c9b79c"/>'; c = ['#8a7a64', '#b39b74', '#6f6252', '#d8c8a8', '#9a8a70'];
    for(i = 0; i < 16; i++) h += '<polygon points="' + R(20, 220) + ',' + R(10, 140) + ' ' + R(20, 220) + ',' + R(10, 140) + ' ' + R(20, 220) + ',' + R(10, 140) + '" fill="' + c[i % 5] + '" stroke="#3a2f45" stroke-width="2" opacity=".9"/>';
    h += '<path d="M100 40 L130 30 L140 70 L120 110 L96 90 Z" fill="#e2d3b4" stroke="#3a2f45" stroke-width="3"/><circle cx="114" cy="56" r="5" fill="#3a2f45"/><path d="M128 50 l8 4 l-8 4 Z" fill="#3a2f45"/>'; }
  else if(k === 'surreal'){ h += '<rect width="240" height="150" fill="#9fd0ff"/><rect y="100" width="240" height="50" fill="#f0d79a"/><path d="M150 100 L150 40 L180 40 L180 100 Z" fill="#8b5a2b" stroke="#3a2f45" stroke-width="3"/><circle cx="174" cy="72" r="3" fill="#f9e11e"/><rect x="152" y="42" width="26" height="56" fill="#cfe9ff" opacity=".5"/>'
      + '<path d="M40 40 Q60 26 80 40 Q60 54 40 40 Z M80 40 L92 30 L92 50 Z" fill="#f7931e" stroke="#3a2f45" stroke-width="2"/><circle cx="52" cy="38" r="2" fill="#3a2f45"/><path d="M90 70 Q104 62 118 70 Q104 78 90 70 Z M118 70 L126 64 L126 76 Z" fill="#c8338a" stroke="#3a2f45" stroke-width="2"/><ellipse cx="60" cy="118" rx="26" ry="6" fill="#d8bf7f"/><path d="M50 116 L60 80 L70 116" fill="#fff" stroke="#3a2f45" stroke-width="2"/>'; }
  else if(k === 'pop'){ c = [['#f9e11e', '#e8302f'], ['#3bb54a', '#c8338a'], ['#2e6fd8', '#f7931e'], ['#ff8fb0', '#1aa6a0']];
    for(i = 0; i < 4; i++){ x = (i % 2) * 120; y = Math.floor(i / 2) * 75; h += '<rect x="' + x + '" y="' + y + '" width="120" height="75" fill="' + c[i][0] + '"/>';
      for(j = 0; j < 30; j++) h += '<circle cx="' + (x + 6 + (j % 10) * 12) + '" cy="' + (y + 8 + Math.floor(j / 10) * 26) + '" r="2" fill="#fff" opacity=".6"/>';
      h += '<path d="M' + (x + 40) + ' ' + (y + 60) + ' Q' + (x + 60) + ' ' + (y + 10) + ' ' + (x + 80) + ' ' + (y + 60) + ' Z" fill="' + c[i][1] + '" stroke="#111" stroke-width="3"/><circle cx="' + (x + 60) + '" cy="' + (y + 32) + '" r="8" fill="#fff" stroke="#111" stroke-width="3"/>'; } }
  else if(k === 'ink'){ h += '<rect width="240" height="150" fill="#f4efe2"/><path d="M0 120 Q40 50 70 80 Q100 20 140 70 Q170 40 200 80 Q220 70 240 90 L240 150 L0 150 Z" fill="#9a9a9a" opacity=".55"/><path d="M0 130 Q50 80 90 110 Q130 70 170 110 Q210 90 240 120 L240 150 L0 150 Z" fill="#4a4a4a" opacity=".8"/>'
      + '<path d="M160 40 Q190 10 220 40" stroke="#222" stroke-width="1.5" fill="none" opacity=".4"/><path d="M30 140 L30 100 M30 110 Q40 98 50 102 M30 118 Q20 108 12 112" stroke="#222" stroke-width="3" fill="none"/><rect x="196" y="16" width="14" height="22" fill="#c8302f"/>'; }
  else if(k === 'baroque'){ h += '<defs><radialGradient id="artbq" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#ffe2a8"/><stop offset=".35" stop-color="#8a5a2b"/><stop offset="1" stop-color="#140c06"/></radialGradient></defs><rect width="240" height="150" fill="url(#artbq)"/>'
      + '<ellipse cx="100" cy="64" rx="24" ry="30" fill="#f2c79a"/><path d="M100 34 Q124 34 124 64 Q124 94 100 94 Z" fill="#3a2414" opacity=".75"/><path d="M60 150 Q66 100 100 96 Q134 100 140 150 Z" fill="#5a1e10"/><path d="M60 150 Q66 100 100 96 L100 150 Z" fill="#a8461f" opacity=".7"/><path d="M76 40 Q100 14 126 42 L122 50 Q100 30 80 50 Z" fill="#2a1a0c"/>'; }
  return h + '</svg>';
}
/* ✍️ 畫畫題:開創作畫布,交件後系統評分 */
R.draw = function(L, ctx){
  ctx.body.innerHTML = '<div style="text-align:center;max-width:110vmin"><div style="font-size:8vmin">✍️</div><p style="font-weight:900;font-size:3vmin">' + esc(L.ask) + '</p><p style="color:#6b6178;font-size:2.4vmin">' + esc(T(L.tip)) + '</p></div>';
  ctx.ask('準備好就打開畫布');
  ctx.act('🎨 打開畫布', function(){
    canvasOpen({ task: L.task, title: L.n, ask: L.ask, brushes: L.brushes, gray: L.gray, grid: L.grid, ratio: '4:3',
      onSubmit: function(img, cv){ var r = evalDraw(L.task, img); if(r.stars){ cv.close(true); ctx.win(r.stars, r.card); } else { ctx.miss(); modal('<h3>再畫一下!</h3>' + r.card.map(function(c){ return '<div class="scard">' + (c.ok ? '✅ ' : '💡 ') + esc(c.t) + '</div>'; }).join('')); } } });
  });
};

/* ══ IndexedDB(作品與草稿;鍵一律以 uid 開頭) ══ */
function idb(cb){ if(A.db){ cb(A.db); return; } try{ var r = indexedDB.open('lxps_art', 1); r.onupgradeneeded = function(){ try{ r.result.createObjectStore('works'); }catch(e){} }; r.onsuccess = function(){ A.db = r.result; cb(A.db); }; r.onerror = function(){ cb(null); }; }catch(e){ cb(null); } }
function idbPut(k, v, cb){ idb(function(db){ if(!db){ if(cb) cb(false); return; } try{ var tx = db.transaction('works', 'readwrite'); tx.objectStore('works').put(v, k); tx.oncomplete = function(){ if(cb) cb(true); }; tx.onerror = function(){ if(cb) cb(false); }; }catch(e){ if(cb) cb(false); } }); }
function idbGet(k, cb){ idb(function(db){ if(!db){ cb(null); return; } try{ var q = db.transaction('works').objectStore('works').get(k); q.onsuccess = function(){ cb(q.result || null); }; q.onerror = function(){ cb(null); }; }catch(e){ cb(null); } }); }
function idbDel(k, cb){ idb(function(db){ if(!db){ if(cb) cb(); return; } try{ var tx = db.transaction('works', 'readwrite'); tx.objectStore('works')['delete'](k); tx.oncomplete = function(){ if(cb) cb(); }; }catch(e){ if(cb) cb(); } }); }
function idbList(prefix, cb){ idb(function(db){ var out = []; if(!db){ cb(out); return; } try{ var q = db.transaction('works').objectStore('works').openCursor(); q.onsuccess = function(){ var c = q.result; if(c){ if(String(c.key).indexOf(prefix) === 0) out.push(c.value); c['continue'](); } else cb(out); }; q.onerror = function(){ cb(out); }; }catch(e){ cb(out); } }); }
/* 共用平板:別人留在這台的「草稿」7 天後清掉(只清草稿,不碰素材快取、不碰作品) */
function idbSweep(){ idb(function(db){ if(!db) return; try{ var lim = now() - 7 * 86400000, q = db.transaction('works', 'readwrite').objectStore('works').openCursor(); q.onsuccess = function(){ var c = q.result; if(!c) return; var k = String(c.key); if(k.indexOf(A.uid + '|') !== 0 && k.indexOf('|draft_') > 0 && c.value && c.value.t < lim) c['delete'](); c['continue'](); }; }catch(e){} }); }

/* ══ 🎨 創作畫布(基本版:5 種筆刷、粗細、不透明度、調色盤+長按吸管、4 圖層、復原、雙指縮放、比例、三分法格線;PC 繪圖板/滑鼠/快捷鍵) ══ */
var BRUSH = {
  pencil:   { n: '鉛筆',   e: '✏️', size: 4,  mode: 'line' },
  charcoal: { n: '炭筆',   e: '🖤', size: 14, mode: 'dab', alpha: 0.28, jitter: 0.5, soft: 0 },
  marker:   { n: '麥克筆', e: '🖊', size: 14, mode: 'line' },
  water:    { n: '水彩',   e: '💧', size: 30, mode: 'dab', alpha: 0.07, soft: 1 },
  air:      { n: '噴槍',   e: '💨', size: 46, mode: 'dab', alpha: 0.04, soft: 1 },
  eraser:   { n: '橡皮擦', e: '🧽', size: 24, mode: 'erase' },
  /* ★ v1.1.0 第 21 項:大師卡解鎖的特殊筆刷 + 貼紙印章 */
  pastel:   { n: '粉彩',   e: '🖍', size: 22, mode: 'dab', alpha: 0.16, jitter: 0.35, soft: 1 },
  rainbow:  { n: '彩虹筆', e: '🌈', size: 14, mode: 'line', rainbow: 1 },
  mirror:   { n: '對稱筆', e: '🦋', size: 8,  mode: 'line', mirror: 1 },
  neon:     { n: '霓虹筆', e: '✨', size: 10, mode: 'line', glow: 1 },
  stamp:    { n: '貼紙',   e: '🏷', size: 70, mode: 'stamp' }
};
var RATIOS = { '1:1': [1000, 1000], '4:3': [1200, 900], '3:4': [900, 1200], '16:9': [1280, 720] };
var GRAYS = ['#ffffff', '#e0e0e0', '#c2c2c2', '#a3a3a3', '#858585', '#666666', '#474747', '#292929', '#0a0a0a'];
function hsv2hex(h, s, v){ var c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c, r = 0, g = 0, b = 0;
  if(h < 60){ r = c; g = x; } else if(h < 120){ r = x; g = c; } else if(h < 180){ g = c; b = x; } else if(h < 240){ g = x; b = c; } else if(h < 300){ r = x; b = c; } else { r = c; b = x; }
  function hx(n){ return ('0' + Math.round((n + m) * 255).toString(16)).slice(-2); } return '#' + hx(r) + hx(g) + hx(b); }
function hex2hsv(hex){ var r = parseInt(hex.substr(1, 2), 16) / 255, g = parseInt(hex.substr(3, 2), 16) / 255, b = parseInt(hex.substr(5, 2), 16) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, h = 0;
  if(d){ if(mx === r) h = 60 * (((g - b) / d) % 6); else if(mx === g) h = 60 * ((b - r) / d + 2); else h = 60 * ((r - g) / d + 4); }
  if(h < 0) h += 360; return { h: h, s: mx ? d / mx : 0, v: mx }; }

function canvasOpen(opt){
  /* ★ v1.1.0 第 7 項:復原只記筆畫範圍 ⇒ 步數提高到 40(省電 20) */
  var root = $('art-root'), wrap, cv, W, H, scale = A.lite ? 0.8 : 1, maxL = 4, undoMax = A.lite ? 20 : 40;
  var ratio = RATIOS[opt.ratio] ? opt.ratio : '4:3';
  W = Math.round(RATIOS[ratio][0] * scale); H = Math.round(RATIOS[ratio][1] * scale);
  var S = { tool: opt.gray ? 'pencil' : (opt.brushes && opt.brushes[0]) || 'pencil', size: {}, op: 1, color: opt.gray ? '#292929' : '#2e6fd8', prev: '#ffffff', recent: [], layers: [], li: 0, undo: [], redo: [], view: { s: 1, x: 0, y: 0 }, grid: !!opt.grid,
            ptr: {}, stroke: null, gest: null, penSeen: false, space: false, dirty: 0, strokes: 0, eyedrop: false, rafq: false, closed: false, used: {}, lid: 0, ck: '', sticker: '⭐' };
  var k; for(k in BRUSH){ if(BRUSH.hasOwnProperty(k)) S.size[k] = BRUSH[k].size; }
  /* 畫室自由創作:基本筆刷+已解鎖的特殊筆刷+貼紙;關卡畫畫題照關卡限制(評分公平) */
  var allowed = (opt.brushes || ['pencil', 'charcoal', 'marker', 'water', 'air', 'eraser'].concat(brushesOwned())).slice();
  if((opt.stickers || (!opt.task && !opt.gray)) && allowed.indexOf('stamp') < 0) allowed.push('stamp');
  function mkC(){ var c = document.createElement('canvas'); c.width = W; c.height = H; return c; }
  function addLayer(img){ if(S.layers.length >= maxL){ toast('圖層最多 ' + maxL + ' 層'); return; } var c = mkC(); if(img) c.getContext('2d').drawImage(img, 0, 0, W, H); S.layers.splice(S.li + (S.layers.length ? 1 : 0), 0, { c: c, vis: true, a: 1, n: '圖層 ' + (S.layers.length + 1), id: ++S.lid }); S.li = S.layers.indexOf(S.layers.filter(function(l){ return l.c === c; })[0]); }
  var sc = mkC(), scx = sc.getContext('2d');
  /* ★ v1.1.0 第 6 項:作用圖層以外的圖層預先合成成「下面一張+上面一張」,每次重畫只畫 3 張(原本 4 層全畫)
     ★ 第 7 項:筆畫開始前把作用圖層拍一張(重複使用同一張,不另外配記憶體),筆畫結束只把「畫到的範圍」切下來存成復原 */
  var cBelow = mkC(), cAbove = mkC(), snap = mkC(), snx = snap.getContext('2d');
  function cacheKey(){ var a = [S.li], i; for(i = 0; i < S.layers.length; i++) a.push(S.layers[i].id + (S.layers[i].vis ? 'v' : 'h') + S.layers[i].a); return a.join('|'); }
  function cacheBuild(){
    var xb = cBelow.getContext('2d'), xa = cAbove.getContext('2d'), i, L;
    xb.clearRect(0, 0, W, H); xa.clearRect(0, 0, W, H);
    for(i = 0; i < S.layers.length; i++){ L = S.layers[i]; if(!L.vis || i === S.li) continue; (i < S.li ? xb : xa).globalAlpha = L.a; (i < S.li ? xb : xa).drawImage(L.c, 0, 0); }
    xb.globalAlpha = 1; xa.globalAlpha = 1; S.ck = cacheKey();
  }
  function cacheDirty(){ S.ck = ''; }
  function bbReset(){ S.bb = [1e9, 1e9, -1e9, -1e9]; }
  function bbAdd(x, y, r){ r = (r || 1) + 3; if(x - r < S.bb[0]) S.bb[0] = x - r; if(y - r < S.bb[1]) S.bb[1] = y - r; if(x + r > S.bb[2]) S.bb[2] = x + r; if(y + r > S.bb[3]) S.bb[3] = y + r; }
  function snapTake(li){ snx.clearRect(0, 0, W, H); snx.drawImage(S.layers[li].c, 0, 0); bbReset(); }
  function undoFromSnap(L){
    var b = S.bb, x0 = Math.max(0, Math.floor(b[0])), y0 = Math.max(0, Math.floor(b[1])), x1 = Math.min(W, Math.ceil(b[2])), y1 = Math.min(H, Math.ceil(b[3])), c;
    if(x1 <= x0 || y1 <= y0) return;
    c = document.createElement('canvas'); c.width = x1 - x0; c.height = y1 - y0; c.getContext('2d').drawImage(snap, x0, y0, x1 - x0, y1 - y0, 0, 0, x1 - x0, y1 - y0);
    opPush({ t: 'px', L: L, x: x0, y: y0, c: c });
  }

  wrap = document.createElement('div'); wrap.id = 'art-cv';
  wrap.style.cssText = 'position:absolute;inset:0;z-index:40;background:#2b2335;display:flex;flex-direction:column;touch-action:none';
  var bh = '';
  for(k = 0; k < allowed.length; k++) bh += '<button class="cvb" data-tool="' + allowed[k] + '" title="' + BRUSH[allowed[k]].n + ({ pencil: ' (B)', eraser: ' (E)' }[allowed[k]] || '') + '">' + BRUSH[allowed[k]].e + '<small>' + BRUSH[allowed[k]].n + '</small></button>';
  bh += '<button class="cvb" data-tool="eyedrop" title="吸管 (I)">🧪<small>吸管</small></button>';
  wrap.innerHTML = '<style>#art-cv .cvtop{display:flex;align-items:center;gap:1vmin;padding:1vmin 1.4vmin;background:#fff9ef;border-bottom:.45vmin solid #3a2f45}'
    + '#art-cv .cvtop .tt{flex:1;font-weight:900;font-size:2.3vmin;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}'
    + '#art-cv .cvmain{flex:1;display:flex;min-height:0}'
    + '#art-cv .cvl,#art-cv .cvr{background:#fff9ef;display:flex;flex-direction:column;gap:.8vmin;padding:1vmin;overflow-y:auto}'
    + '#art-cv .cvl{width:11vmin;align-items:center;border-right:.45vmin solid #3a2f45}#art-cv .cvr{width:24vmin;border-left:.45vmin solid #3a2f45}'
    + '#art-cv .cvb{width:9vmin;border:.35vmin solid #3a2f45;border-radius:1.4vmin;background:#fff;font-size:3.6vmin;line-height:1.1;padding:.6vmin 0;cursor:pointer;display:flex;flex-direction:column;align-items:center;font-family:inherit;color:#2b2335}'
    + '#art-cv .cvb small{font-size:1.6vmin;font-weight:900}#art-cv .cvb.on{background:#ffd93b;box-shadow:0 0 0 .4vmin #ff7a59}'
    + '#art-cv .vsl{writing-mode:vertical-lr;direction:rtl;width:4vmin;height:18vmin;-webkit-appearance:slider-vertical;appearance:slider-vertical}'
    + '#art-cv .slab{font-size:1.6vmin;font-weight:900;text-align:center}'
    + '#art-cv .srow{display:flex;align-items:center;gap:.6vmin}#art-cv .hsl{flex:1;min-width:0;width:100%;margin:0;height:4.4vmin;touch-action:none}#art-cv .srow .sv{min-width:4.2vmin;text-align:right}#art-cv .cvl{overflow-x:hidden}'
    + '#art-cv .cvtop{padding-left:calc(1.4vmin + env(safe-area-inset-left));padding-right:calc(1.4vmin + env(safe-area-inset-right))}#art-cv .cvmain{padding-bottom:env(safe-area-inset-bottom)}#art-cv .cvl{padding-left:calc(1vmin + env(safe-area-inset-left))}#art-cv .cvr{padding-right:calc(1vmin + env(safe-area-inset-right))}'
    + '#art-cv .stage{flex:1;position:relative;overflow:hidden;touch-action:none;cursor:crosshair}'
    + '#art-cv .stage canvas{position:absolute;left:0;top:0;width:100%;height:100%}'
    + '#art-cv .sw{width:4.6vmin;height:4.6vmin;border-radius:1vmin;border:.3vmin solid #3a2f45;cursor:pointer;display:inline-block;margin:.3vmin}'
    + '#art-cv .lyr{display:flex;align-items:center;gap:.6vmin;border:.3vmin solid #3a2f45;border-radius:1vmin;padding:.4vmin;background:#fff;font-size:1.9vmin;font-weight:900;cursor:pointer}'
    + '#art-cv .lyr.on{background:#ffd93b}#art-cv .lyr img{width:6vmin;height:4.5vmin;object-fit:contain;background:#fff;border:.2vmin solid #ccc}'
    + '#art-cv .mini{border:.3vmin solid #3a2f45;border-radius:1vmin;background:#fff;font-size:1.9vmin;font-weight:900;padding:.3vmin .8vmin;cursor:pointer;font-family:inherit}'
    + '#art-cv .ctx{position:fixed;z-index:60;background:#fff;border:.4vmin solid #3a2f45;border-radius:1.4vmin;padding:.6vmin;display:flex;flex-direction:column;gap:.4vmin}'
    + '#art-cv .cvtimer{font-weight:900;font-size:2.6vmin;padding:.4vmin 1.2vmin;border-radius:1.4vmin;background:#ffe9a8;border:.35vmin solid #3a2f45;white-space:nowrap}#art-cv .cvtimer.red{background:#ff8a8a;animation:artBeat .8s ease-in-out infinite}'
    + '#art-cv .stk{font-size:3.6vmin;cursor:pointer;display:inline-block;padding:.2vmin .5vmin;border-radius:1vmin}#art-cv .stk.on{background:#ffd93b;box-shadow:0 0 0 .3vmin #ff7a59}'
    + '@media (orientation:landscape) and (max-height:520px){#art-cv .cvl{width:13vmin}#art-cv .cvb{width:11vmin;font-size:4.4vmin}#art-cv .cvb small{font-size:2.2vmin}#art-cv .cvr{width:28vmin}#art-cv .cvtop .tt{font-size:3.2vmin}#art-cv .lyr,#art-cv .mini{font-size:2.6vmin}#art-cv .cvtimer{font-size:3.4vmin}#art-cv .stk{font-size:4.6vmin}}</style>'
    + '<div class="cvtop"><button class="abtn ghost" data-c="x">← 離開</button><span class="tt">🎨 ' + esc(opt.title || '創作畫布') + (opt.ask ? ':' + esc(opt.ask) : '') + '</span>'
    + (opt.endMs ? '<span class="cvtimer" id="art-cv-timer">⏱</span>' : '')
    + '<button class="abtn" data-c="undo" title="復原 (Ctrl+Z)">↶</button><button class="abtn" data-c="redo" title="重做 (Ctrl+Shift+Z)">↷</button><button class="abtn" data-c="grid" title="三分法格線">#️⃣</button><button class="abtn" data-c="fit" title="置中 (Ctrl+0)">⤢</button><button class="abtn" data-c="keys" title="快捷鍵 (?)">⌨</button><button class="abtn" data-c="how" title="怎麼玩">❓</button>'
    + (opt.task ? '<button class="abtn go" id="art-cv-done" data-c="done">' + (opt.submitLabel || '✅ 交件') + '</button>' : '<button class="abtn go" id="art-cv-done" data-c="save">💾 儲存</button>') + '</div>'
    + '<div class="cvmain"><div class="cvl" id="art-cv-left">' + bh + '</div>'
    + '<div class="stage" id="art-cv-stage"><canvas id="art-cv-c"></canvas></div>'
    + '<div class="cvr" id="art-cv-right"><div style="display:flex;align-items:center;gap:1vmin"><span class="sw" id="art-cv-cur" style="width:7vmin;height:7vmin"></span><span class="slab" id="art-cv-hex"></span></div>'
    /* ★ v1.1.3(檢查報告第 6 項):粗細/透明度從左欄(工具多時要捲才看得到)搬到右欄最上面,改成橫向滑桿,三種平台都一眼看得到 */
    + '<div class="srow"><span class="slab">粗細</span><input class="hsl" type="range" min="1" max="100" id="art-cv-size"><span class="slab sv" id="art-cv-sizev"></span></div>'
    + '<div class="srow"><span class="slab">透明</span><input class="hsl" type="range" min="5" max="100" id="art-cv-op"><span class="slab sv" id="art-cv-opv"></span></div>' + '<div class="slab" style="text-align:left;margin-top:.6vmin">📚 圖層</div><div id="art-cv-lyr"></div><div style="display:flex;gap:.6vmin;flex-wrap:wrap"><button class="mini" data-c="ladd">＋新增</button><button class="mini" data-c="lup">▲</button><button class="mini" data-c="ldn">▼</button><button class="mini" data-c="ldel">🗑</button></div>'   /* ★ v1.1.3:圖層區移到調色盤上面,不用捲到底才找得到 */
    + (allowed.indexOf('stamp') >= 0 ? '<div class="slab" style="text-align:left">🏷 貼紙</div><div id="art-cv-stk"></div>' : '') + '<div class="slab" style="text-align:left">🕘 最近</div><div id="art-cv-rec"></div><div class="slab" style="text-align:left">🎨 調色盤</div><div id="art-cv-pal"></div></div></div>';
  root.appendChild(wrap);
  var stage = $('art-cv-stage'), dc = $('art-cv-c'), dx = dc.getContext('2d'), dpr = A.lite ? 1 : Math.min(2, window.devicePixelRatio || 1);   /* ★ v1.1.1 省電:螢幕畫布不用 2 倍解析度(Retina iPad 每幀像素少 3/4) */
  /* 舊作品的圖層:全部載完再「照順序」放回去(原本誰先載完誰先放,順序可能亂掉) */
  if(opt.layers && opt.layers.length){ (function(){ var n = 0, i, ims = []; function fin(){ var j; S.layers = []; S.li = 0; for(j = 0; j < ims.length; j++){ if(ims[j]) addLayer(ims[j]); } if(!S.layers.length) addLayer(); S.li = S.layers.length - 1; cacheDirty(); paintLayers(); fit(); }
    for(i = 0; i < opt.layers.length; i++) (function(src, ix){ var im = new Image(); im.onload = function(){ ims[ix] = im; n++; if(n === opt.layers.length) fin(); }; im.onerror = function(){ n++; if(n === opt.layers.length) fin(); }; im.src = src; })(opt.layers[i], i); })(); }
  else { addLayer(); addLayer(); S.li = 1; }

  /* ── 繪製 ── */
  function resize(){ var r = stage.getBoundingClientRect(); dc.width = Math.max(1, Math.round(r.width * dpr)); dc.height = Math.max(1, Math.round(r.height * dpr)); req(); }
  function fit(){ var r = stage.getBoundingClientRect(), s = Math.min(r.width / W, r.height / H) * 0.94; S.view.s = s; S.view.x = (r.width - W * s) / 2; S.view.y = (r.height - H * s) / 2; req(); }
  function req(){ if(S.rafq) return; S.rafq = true; requestAnimationFrame(render); }
  function render(){
    S.rafq = false; if(S.closed) return;
    var v = S.view, i, L;
    dx.setTransform(1, 0, 0, 1, 0, 0); dx.fillStyle = '#3d3449'; dx.fillRect(0, 0, dc.width, dc.height);
    dx.setTransform(dpr * v.s, 0, 0, dpr * v.s, dpr * v.x, dpr * v.y);
    dx.shadowColor = 'rgba(0,0,0,.4)'; dx.shadowBlur = 12; dx.fillStyle = '#fff'; dx.fillRect(0, 0, W, H); dx.shadowBlur = 0;
    if(S.ck !== cacheKey()) cacheBuild();
    dx.drawImage(cBelow, 0, 0);
    L = S.layers[S.li];
    if(L && L.vis){ dx.globalAlpha = L.a; dx.drawImage(L.c, 0, 0);
      if(S.stroke && S.stroke.li === S.li && S.stroke.mode !== 'erase'){ dx.globalAlpha = L.a * S.op; dx.drawImage(sc, 0, 0); } }
    dx.globalAlpha = 1;
    dx.drawImage(cAbove, 0, 0);
    if(S.grid){ dx.strokeStyle = 'rgba(255,90,60,.7)'; dx.lineWidth = 2 / v.s; dx.beginPath(); dx.moveTo(W / 3, 0); dx.lineTo(W / 3, H); dx.moveTo(W * 2 / 3, 0); dx.lineTo(W * 2 / 3, H); dx.moveTo(0, H / 3); dx.lineTo(W, H / 3); dx.moveTo(0, H * 2 / 3); dx.lineTo(W, H * 2 / 3); dx.stroke(); }
    if(S.tool === 'mirror'){ dx.save(); dx.strokeStyle = 'rgba(163,107,255,.55)'; dx.lineWidth = 2 / v.s; if(dx.setLineDash) dx.setLineDash([10 / v.s, 8 / v.s]); dx.beginPath(); dx.moveTo(W / 2, 0); dx.lineTo(W / 2, H); dx.stroke(); dx.restore(); }   /* 對稱筆的中線 */
    if(S.hover && S.ptrType !== 'touch'){ var bs = S.size[S.tool] || 10; dx.strokeStyle = 'rgba(0,0,0,.55)'; dx.lineWidth = 1.2 / v.s; dx.beginPath(); dx.arc(S.hover.x, S.hover.y, Math.max(1, bs / 2), 0, Math.PI * 2); dx.stroke(); }
  }
  function toWorld(cx, cy){ var r = stage.getBoundingClientRect(); return { x: (cx - r.left - S.view.x) / S.view.s, y: (cy - r.top - S.view.y) / S.view.s }; }
  /* ★ v1.0.3(老師「刪除圖層、調整圖層順序也改成能復原」)— 復原紀錄改成「動作」:
     px=筆畫(記那個圖層物件+畫之前的樣子)、del=刪圖層(記圖層物件與原位置)、move=調順序、add=新增圖層。
     記的是圖層「物件」不是索引 ⇒ 刪除/調順序之後,更早的筆畫照樣能正確復原到對的圖層。 */
  function opPush(op){ S.undo.push(op); if(S.undo.length > undoMax) S.undo.shift(); S.redo = []; }
  /* px 動作只存「範圍」{x,y,c(小畫布)};復原/重做時把那一塊換回來,再把換掉的那塊存起來給重做用 */
  function swapPx(op){ var w = op.c.width, h = op.c.height, cur = document.createElement('canvas'), x; cur.width = w; cur.height = h; cur.getContext('2d').drawImage(op.L.c, op.x, op.y, w, h, 0, 0, w, h);
    x = op.L.c.getContext('2d'); x.clearRect(op.x, op.y, w, h); x.drawImage(op.c, op.x, op.y); op.c = cur; }
  function applyOp(op, back){
    var i;
    if(op.t === 'px'){ swapPx(op); i = S.layers.indexOf(op.L); if(i >= 0) S.li = i; }
    else if(op.t === 'del'){ if(back){ S.layers.splice(Math.min(op.i, S.layers.length), 0, op.L); S.li = S.layers.indexOf(op.L); } else { i = S.layers.indexOf(op.L); if(i >= 0) S.layers.splice(i, 1); S.li = Math.max(0, Math.min(S.li, S.layers.length - 1)); } }
    else if(op.t === 'add'){ if(back){ i = S.layers.indexOf(op.L); if(i >= 0) S.layers.splice(i, 1); S.li = Math.max(0, Math.min(S.li, S.layers.length - 1)); } else { S.layers.splice(Math.min(op.i, S.layers.length), 0, op.L); S.li = S.layers.indexOf(op.L); } }
    else if(op.t === 'move'){ i = S.layers.indexOf(op.L); var to = back ? op.from : op.to; if(i >= 0){ S.layers.splice(i, 1); S.layers.splice(to, 0, op.L); S.li = to; } }
  }
  var OPN = { px: '筆畫', del: '刪除圖層', add: '新增圖層', move: '調整圖層順序' };
  function undo(){ var u = S.undo.pop(); if(!u){ toast('沒有可以復原的了'); return; } applyOp(u, true); S.redo.push(u); if(u.t !== 'px') toast('↶ 復原:' + OPN[u.t]); cacheDirty(); req(); paintLayers(); }
  function redo(){ var u = S.redo.pop(); if(!u){ toast('沒有可以重做的了'); return; } applyOp(u, false); S.undo.push(u); if(u.t !== 'px') toast('↷ 重做:' + OPN[u.t]); cacheDirty(); req(); paintLayers(); }
  function dab(ctx, x, y, r, b){ var g; if(b.soft){ g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, S.color); g.addColorStop(1, S.color + '00'); ctx.fillStyle = g; } else ctx.fillStyle = S.color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); bbAdd(x, y, r); }
  function lineSeg(ctx, b, x0, y0, x1, y1, w, st){
    var col = S.color;
    if(b.rainbow){ st.hue = ((st.hue || 0) + Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0)) * 0.9) % 360; col = 'hsl(' + Math.round(st.hue) + ',90%,55%)'; }
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if(b.glow){ ctx.save(); ctx.shadowColor = S.color; ctx.shadowBlur = w * 2; ctx.strokeStyle = S.color; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = Math.max(1, w * 0.35); }
    else { ctx.strokeStyle = col; ctx.lineWidth = w; }
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    bbAdd(x0, y0, w * (b.glow ? 3 : 0.5)); bbAdd(x1, y1, w * (b.glow ? 3 : 0.5));
  }
  function seg(p0, p1){
    var st = S.stroke, b = BRUSH[st.tool], w0 = st.w(p0.p), w1 = st.w(p1.p), d, n, i, t, x, y, r, ctx;
    if(st.mode === 'erase'){ ctx = S.layers[st.li].c.getContext('2d'); ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.globalAlpha = S.op; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = (w0 + w1) / 2; ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke(); ctx.restore(); bbAdd(p0.x, p0.y, ctx.lineWidth / 2); bbAdd(p1.x, p1.y, ctx.lineWidth / 2); return; }
    if(b.mode === 'line'){ lineSeg(scx, b, p0.x, p0.y, p1.x, p1.y, (w0 + w1) / 2, st); if(b.mirror) lineSeg(scx, b, W - p0.x, p0.y, W - p1.x, p1.y, (w0 + w1) / 2, st); return; }
    d = Math.sqrt((p1.x - p0.x) * (p1.x - p0.x) + (p1.y - p0.y) * (p1.y - p0.y)); n = Math.max(1, Math.ceil(d / Math.max(1, w1 * 0.22)));
    scx.globalAlpha = b.alpha;
    for(i = 1; i <= n; i++){ t = i / n; x = p0.x + (p1.x - p0.x) * t; y = p0.y + (p1.y - p0.y) * t; r = (w0 + (w1 - w0) * t) / 2;
      if(b.jitter){ x += (Math.random() - 0.5) * r * b.jitter * 2; y += (Math.random() - 0.5) * r * b.jitter * 2; r *= 0.5 + Math.random() * 0.5; }
      dab(scx, x, y, r, b); }
    scx.globalAlpha = 1;
  }
  /* 🏷 貼紙印章:點一下就把貼紙蓋在作用圖層上(可復原) */
  function stampAt(e){
    var p = toWorld(e.clientX, e.clientY), L = S.layers[S.li], sz = S.size.stamp || 70, x;
    if(!L || !L.vis){ toast('這個圖層隱藏中,先打開眼睛 👁'); return; }
    if(p.x < 0 || p.y < 0 || p.x > W || p.y > H) return;
    snapTake(S.li);
    x = L.c.getContext('2d'); x.save(); x.globalAlpha = S.op; x.font = sz + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(S.sticker, p.x, p.y); x.restore();
    bbAdd(p.x, p.y, sz * 0.75); undoFromSnap(L);
    S.used.stamp = 1; S.strokes++; S.dirty++; sfx('sfx-gentle', 0.35); req(); paintLayersSoon(); draftSoon();
  }
  function strokeStart(e, tool){
    var p = toWorld(e.clientX, e.clientY), L = S.layers[S.li], base = S.size[tool] || 10, pen = e.pointerType === 'pen';
    if(!L){ return; }
    if(!L.vis){ toast('這個圖層隱藏中,先打開眼睛 👁'); return; }
    if(BRUSH[tool].mode === 'stamp'){ stampAt(e); return; }
    snapTake(S.li);
    S.stroke = { li: S.li, tool: tool, mode: BRUSH[tool].mode === 'erase' ? 'erase' : 'paint', last: { x: p.x, y: p.y, p: e.pressure || 0.5 }, start: { x: p.x, y: p.y }, shift: !!e.shiftKey, pid: e.pointerId, hue: Math.random() * 360,
      w: function(pr){ return pen && pr > 0 ? Math.max(1, base * (0.25 + 0.75 * pr)) : base; } };
    scx.clearRect(0, 0, W, H);
    seg(S.stroke.last, { x: p.x + 0.01, y: p.y, p: S.stroke.last.p });
    req();
  }
  function strokeMove(e){
    var st = S.stroke, evs = (e.getCoalescedEvents && e.getCoalescedEvents()) || [e], i, p, q;
    if(!st) return;
    if(st.shift){ /* Shift:直線(每次重畫) */ p = toWorld(e.clientX, e.clientY);
      if(st.mode === 'erase'){ /* ★ v1.1.3 第 19 項:Shift+橡皮擦也能擦直線 — 每次先把圖層還原成下筆前,再擦一條 */ var ex = S.layers[st.li].c.getContext('2d'); ex.clearRect(0, 0, W, H); ex.drawImage(snap, 0, 0); seg({ x: st.start.x, y: st.start.y, p: 0.6 }, { x: p.x, y: p.y, p: 0.6 }); st.end = p; req(); return; }
      scx.clearRect(0, 0, W, H); seg({ x: st.start.x, y: st.start.y, p: 0.6 }, { x: p.x, y: p.y, p: 0.6 }); st.end = p; req(); return; }
    if(!evs.length) evs = [e];
    for(i = 0; i < evs.length; i++){ p = toWorld(evs[i].clientX, evs[i].clientY); q = { x: p.x, y: p.y, p: evs[i].pressure || st.last.p }; seg(st.last, q); st.last = q; }
    req();
  }
  function strokeEnd(){
    var st = S.stroke, L; if(!st) return;
    if(st.shift && st.mode === 'erase' && st.end){ }
    L = S.layers[st.li];
    if(st.mode !== 'erase'){ var x = L.c.getContext('2d'); x.globalAlpha = S.op; x.drawImage(sc, 0, 0); x.globalAlpha = 1; scx.clearRect(0, 0, W, H); }
    undoFromSnap(L);   /* ★ v1.1.0 只存畫到的範圍 */
    S.used[st.tool] = 1;
    S.stroke = null; S.strokes++; S.dirty++; req(); paintLayersSoon(); draftSoon();
  }
  function cancelStroke(){ if(!S.stroke) return; scx.clearRect(0, 0, W, H); if(S.stroke.mode === 'erase'){ var x = S.layers[S.stroke.li].c.getContext('2d'); x.clearRect(0, 0, W, H); x.drawImage(snap, 0, 0); } S.stroke = null; req(); }
  /* ★ v1.1.3(檢查報告第 3 項):fromLong = 手指長按吸色;按在空白紙上不吸(原本會吸到白色,之後畫的都看不見) */
  function pick(cx, cy, fromLong){
    var p = toWorld(cx, cy), c = document.createElement('canvas'), x, i, d, L, a, al = 0;
    if(p.x < 0 || p.y < 0 || p.x >= W || p.y >= H) return false;
    c.width = 1; c.height = 1; x = c.getContext('2d');
    for(i = 0; i < S.layers.length; i++){ L = S.layers[i]; if(!L.vis) continue; x.globalAlpha = L.a; x.drawImage(L.c, Math.floor(p.x), Math.floor(p.y), 1, 1, 0, 0, 1, 1); }
    al = x.getImageData(0, 0, 1, 1).data[3];
    if(fromLong && al < 8) return false;
    x.globalAlpha = 1; x.clearRect(0, 0, 1, 1); x.fillStyle = '#fff'; x.fillRect(0, 0, 1, 1);
    for(i = 0; i < S.layers.length; i++){ L = S.layers[i]; if(!L.vis) continue; x.globalAlpha = L.a; x.drawImage(L.c, Math.floor(p.x), Math.floor(p.y), 1, 1, 0, 0, 1, 1); }
    d = x.getImageData(0, 0, 1, 1).data; a = '#' + ('0' + d[0].toString(16)).slice(-2) + ('0' + d[1].toString(16)).slice(-2) + ('0' + d[2].toString(16)).slice(-2);
    if(opt.gray){ var lum = Math.round(0.299 * d[0] + 0.587 * d[1] + 0.114 * d[2]), h2 = ('0' + lum.toString(16)).slice(-2); a = '#' + h2 + h2 + h2; }
    setColor(a); sfx('sfx-tap', 0.25); toast(al < 8 || /^#f[a-f0-9]f[a-f0-9]f[a-f0-9]$/i.test(a) ? '🧪 吸到白色 ' + a + ':畫在白紙上會看不見,記得換顏色喔' : '🧪 吸到顏色 ' + a);
    if(S.eyedrop){ S.eyedrop = false; paintTools(); }
    return true;
  }

  /* ── 指標事件:筆/滑鼠/觸控 ── */
  function pts(){ var a = [], k2; for(k2 in S.ptr){ if(S.ptr.hasOwnProperty(k2)) a.push(S.ptr[k2]); } return a; }
  stage.addEventListener('contextmenu', function(e){ e.preventDefault(); });
  stage.addEventListener('pointerdown', function(e){
    e.preventDefault();
    try{ stage.setPointerCapture(e.pointerId); }catch(_){}
    S.ptrType = e.pointerType;
    if(e.pointerType === 'pen') S.penSeen = true;
    S.ptr[e.pointerId] = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: now(), type: e.pointerType };
    var touches = pts().filter(function(p){ return p.type === 'touch'; });
    if(e.pointerType === 'touch' && touches.length >= 2){ cancelStroke(); clearTimeout(S.lp); S.stampPend = null; S.gest = { n: touches.length, t: now(), moved: false, d0: dist(touches[0], touches[1]), c0: mid(touches[0], touches[1]), v0: { s: S.view.s, x: S.view.x, y: S.view.y } }; return; }
    if(e.pointerType === 'touch' && S.penSeen) return;   /* 防手掌誤觸:用過筆之後,手指只負責手勢 */
    if(e.pointerType === 'mouse' && e.button === 2){ ctxMenu(e.clientX, e.clientY); return; }
    if(S.space || e.button === 1){ S.pan = { x: e.clientX, y: e.clientY, vx: S.view.x, vy: S.view.y }; return; }
    if(S.eyedrop || e.altKey || (e.pointerType === 'pen' && (e.buttons & 2))){ pick(e.clientX, e.clientY); return; }
    var tool = S.tool;
    if(e.pointerType === 'pen' && (e.button === 5 || (e.buttons & 32))) tool = allowed.indexOf('eraser') >= 0 ? 'eraser' : tool;   /* 筆尾橡皮擦 */
    /* ★ v1.1.3 第 7 項:手指蓋貼紙改成「放開才蓋」,中途變成兩指縮放就取消(原本每縮放一次多一張貼紙) */
    if(e.pointerType === 'touch' && BRUSH[tool] && BRUSH[tool].mode === 'stamp'){ S.stampPend = { id: e.pointerId, clientX: e.clientX, clientY: e.clientY, sx: e.clientX, sy: e.clientY }; return; }
    strokeStart(e, tool);
    /* ★ v1.1.3 第 3 項:長按吸色只給手指(筆停下來想一下不再吸色),要按住 0.8 秒且幾乎沒動;按在空白紙上不吸、照常畫 */
    if(e.pointerType === 'touch' && S.stroke){ clearTimeout(S.lp); S.lp = setTimeout(function(){ var p0 = S.ptr[e.pointerId]; if(p0 && S.stroke && S.stroke.pid === e.pointerId && Math.abs(p0.x - p0.sx) + Math.abs(p0.y - p0.sy) < 8){ if(pick(p0.x, p0.y, true)){ cancelStroke(); S.lpDone = e.pointerId; } } }, 800); }
  });
  stage.addEventListener('pointermove', function(e){
    var p = S.ptr[e.pointerId], ts;
    if(e.pointerType !== 'touch'){ S.hover = toWorld(e.clientX, e.clientY); S.ptrType = e.pointerType; if(!S.stroke) req(); }
    if(!p) return;
    p.x = e.clientX; p.y = e.clientY;
    if(S.gest){ ts = pts().filter(function(q){ return q.type === 'touch'; }); if(ts.length >= 2){ var d = dist(ts[0], ts[1]), c = mid(ts[0], ts[1]), r = stage.getBoundingClientRect(), s = clamp(S.gest.v0.s * d / Math.max(1, S.gest.d0), 0.15, 8), wx, wy;
        if(Math.abs(d - S.gest.d0) > 10 || Math.abs(c.x - S.gest.c0.x) + Math.abs(c.y - S.gest.c0.y) > 10) S.gest.moved = true;
        wx = (S.gest.c0.x - r.left - S.gest.v0.x) / S.gest.v0.s; wy = (S.gest.c0.y - r.top - S.gest.v0.y) / S.gest.v0.s;
        S.view.s = s; S.view.x = c.x - r.left - wx * s; S.view.y = c.y - r.top - wy * s; req(); } return; }
    if(S.pan){ S.view.x = S.pan.vx + e.clientX - S.pan.x; S.view.y = S.pan.vy + e.clientY - S.pan.y; req(); return; }
    if(S.stampPend && S.stampPend.id === e.pointerId){ S.stampPend.clientX = e.clientX; S.stampPend.clientY = e.clientY; if(Math.abs(e.clientX - S.stampPend.sx) + Math.abs(e.clientY - S.stampPend.sy) > 24) S.stampPend = null; return; }
    if(S.stroke && S.stroke.pid === e.pointerId){ if(Math.abs(p.x - p.sx) + Math.abs(p.y - p.sy) >= 8) clearTimeout(S.lp); strokeMove(e); }
  });
  function upH(e){
    var p = S.ptr[e.pointerId], g = S.gest;
    delete S.ptr[e.pointerId]; clearTimeout(S.lp);
    if(g){ if(!pts().filter(function(q){ return q.type === 'touch'; }).length){ S.gest = null; if(!g.moved && now() - g.t < 350){ if(g.n === 2) undo(); else if(g.n >= 3) redo(); } } return; }
    if(S.pan){ S.pan = null; return; }
    if(S.stampPend && S.stampPend.id === e.pointerId){ var sp = S.stampPend; S.stampPend = null; if(e.type === 'pointerup') stampAt(sp); return; }
    if(S.lpDone === e.pointerId){ S.lpDone = null; return; }
    if(S.stroke && S.stroke.pid === e.pointerId) strokeEnd();
  }
  stage.addEventListener('pointerup', upH); stage.addEventListener('pointercancel', upH);
  stage.addEventListener('pointerleave', function(){ S.hover = null; req(); });
  stage.addEventListener('wheel', function(e){ e.preventDefault(); var r = stage.getBoundingClientRect(), f = e.deltaY < 0 ? 1.12 : 1 / 1.12, s = clamp(S.view.s * f, 0.15, 8), wx = (e.clientX - r.left - S.view.x) / S.view.s, wy = (e.clientY - r.top - S.view.y) / S.view.s; S.view.s = s; S.view.x = e.clientX - r.left - wx * s; S.view.y = e.clientY - r.top - wy * s; req(); }, { passive: false });
  function dist(a, b){ return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y)); }
  function mid(a, b){ return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }
  function ctxMenu(x, y){ var m = document.createElement('div'); m.className = 'ctx'; m.style.left = x + 'px'; m.style.top = y + 'px';
    m.innerHTML = '<button class="mini" data-m="eye">🧪 吸管</button><button class="mini" data-m="undo">↶ 復原</button><button class="mini" data-m="redo">↷ 重做</button><button class="mini" data-m="fit">⤢ 置中</button>';
    wrap.appendChild(m);
    m.onclick = function(ev){ var t = upFind(ev.target, 'data-m'); if(t){ var a = t.getAttribute('data-m'); if(a === 'eye'){ S.eyedrop = true; paintTools(); } else if(a === 'undo') undo(); else if(a === 'redo') redo(); else fit(); } if(m.parentNode) m.parentNode.removeChild(m); };
    setTimeout(function(){ document.addEventListener('pointerdown', function rm(ev2){ if(!m.contains(ev2.target)){ if(m.parentNode) m.parentNode.removeChild(m); } document.removeEventListener('pointerdown', rm, true); }, true); }, 0); }

  /* ── 鍵盤快捷鍵(PC) ── */
  function onKey(e){
    if(S.closed || !$('art-cv')) return;
    var k2 = e.key, ctrl = e.ctrlKey || e.metaKey;
    if(e.type === 'keyup'){ if(k2 === ' '){ S.space = false; stage.style.cursor = 'crosshair'; } return; }
    if(e.target && /INPUT|TEXTAREA/.test(e.target.tagName) && e.target.type !== 'range') return;
    if(k2 === ' '){ S.space = true; stage.style.cursor = 'grab'; e.preventDefault(); return; }
    if(ctrl && (k2 === 'z' || k2 === 'Z')){ e.preventDefault(); if(e.shiftKey) redo(); else undo(); return; }
    if(ctrl && (k2 === 'y' || k2 === 'Y')){ e.preventDefault(); redo(); return; }
    if(ctrl && k2 === '0'){ e.preventDefault(); fit(); return; }
    if(ctrl) return;
    if(k2 === 'b' || k2 === 'B'){ var nb = S.lastBrush || allowed[0]; if(nb === 'eraser') nb = allowed[0]; setTool(nb); }
    else if((k2 === 'e' || k2 === 'E') && allowed.indexOf('eraser') >= 0) setTool('eraser');
    else if(k2 === 'i' || k2 === 'I'){ S.eyedrop = !S.eyedrop; paintTools(); }
    else if(k2 === '['){ setSize(S.size[S.tool] - Math.max(1, Math.round(S.size[S.tool] * 0.15))); }
    else if(k2 === ']'){ setSize(S.size[S.tool] + Math.max(1, Math.round(S.size[S.tool] * 0.15))); }
    else if(/^[0-9]$/.test(k2)){ setOp(k2 === '0' ? 100 : (+k2) * 10); }
    else if(k2 === 'x' || k2 === 'X'){ var t = S.color; setColor(S.prev); S.prev = t; }
    else if(k2 === '?'){ keysHelp(); }
    else return;
    e.preventDefault();
  }
  document.addEventListener('keydown', onKey); document.addEventListener('keyup', onKey);
  /* ★ v1.0.3 畫布的遊玩說明:題目+評分標準(畫畫題)+畫布操作 */
  function cvHow(){
    var h = '<h3>🎨 ' + esc(opt.title || '創作畫布') + ' — 怎麼玩</h3>', R = opt.task && D.RUBRIC ? D.RUBRIC[opt.task] : null;
    if(opt.ask) h += '<div class="scard">🎯 <b>題目</b>:' + esc(opt.ask) + '</div>';
    if(R) h += '<div class="scard">📋 <b>系統怎麼評分</b><br>' + nl2br(T(R)) + '</div>';
    h += '<div class="scard">🖌 左邊選筆刷,兩條滑桿調<b>粗細</b>和<b>透明度</b>;右邊選顏色、管理<b>圖層</b>(👁 隱藏、▲▼ 調順序、🗑 刪除)。</div>';
    h += '<div class="scard">↶ <b>復原</b>:平板兩指點一下/電腦 Ctrl+Z;↷ <b>重做</b>:三指點一下/Ctrl+Shift+Z。畫筆、刪圖層、調順序、新增圖層都能復原(最多 ' + undoMax + ' 步)。</div>';
    h += '<div class="scard">🧪 按 🧪 吸管、或手指在畫好的顏色上按住不動,可以吸取顏色(Apple Pencil 用吸管鈕;電腦 Alt+點一下);兩指捏放大縮小;#️⃣ 開三分法格線;⤢ 把畫布放回中間。</div>';
    h += '<div class="scard">' + (opt.task ? '✅ 畫好按右上角 <b>交件</b>,系統給評分卡;沒過關可以繼續修改。畫到一半離開,下次會問你要不要接著畫。' : '💾 按右上角 <b>儲存</b> 存到你的畫室。') + '</div>';
    modal(h, [{ t: '好', cls: 'go' }, { t: '⌨ 電腦快捷鍵', cls: 'ghost', cb: keysHelp }]);
  }
  function keysHelp(){ modal('<h3>⌨ 快捷鍵</h3><div class="scard">B 筆刷・E 橡皮擦・I 吸管・[ ] 粗細・1~9、0 透明度・X 換回上一個顏色</div><div class="scard">Ctrl+Z 復原・Ctrl+Shift+Z / Ctrl+Y 重做・Ctrl+0 置中</div><div class="scard">空白鍵+拖曳 平移・滾輪 縮放・Shift+拖曳 畫直線・Alt+點擊 吸色・右鍵 快捷選單</div><div class="scard">🖊 繪圖板:筆壓控制粗細、筆尾自動變橡皮擦、筆側鍵=吸管。平板:兩指捏縮放、兩指點一下復原、三指點一下重做、長按吸色</div>'); }

  /* ── 工具列 / 調色盤 / 圖層 ── */
  function setTool(t){ if(t !== 'eraser') S.lastBrush = t; S.tool = t; S.eyedrop = false; paintTools(); req(); }
  function setSize(v){ S.size[S.tool] = clamp(Math.round(v), 1, 100); paintTools(); req(); }
  function setOp(v){ S.op = clamp(v, 5, 100) / 100; paintTools(); }
  function setColor(c){ if(c !== S.color){ S.prev = S.color; } S.color = c; var i = S.recent.indexOf(c); if(i >= 0) S.recent.splice(i, 1); S.recent.unshift(c); if(S.recent.length > 8) S.recent.pop(); paintColor(); }
  function paintTools(){
    if(S.closed || !$('art-cv-size')) return;
    var bs = wrap.querySelectorAll('[data-tool]'), i, t;
    for(i = 0; i < bs.length; i++){ t = bs[i].getAttribute('data-tool'); bs[i].className = 'cvb' + ((t === 'eyedrop' ? S.eyedrop : (!S.eyedrop && t === S.tool)) ? ' on' : ''); }
    $('art-cv-size').value = S.size[S.tool] || 10; $('art-cv-sizev').textContent = S.size[S.tool] || 10;
    $('art-cv-op').value = Math.round(S.op * 100); $('art-cv-opv').textContent = Math.round(S.op * 100) + '%';
  }
  function paintColor(){
    var h = '', hv = hex2hsv(S.color), i;
    if(S.closed || !$('art-cv-cur')) return;
    $('art-cv-cur').style.background = S.color; $('art-cv-hex').textContent = S.color;
    if(opt.gray){ for(i = 0; i < GRAYS.length; i++) h += '<span class="sw" data-sw="' + GRAYS[i] + '" style="background:' + GRAYS[i] + '"></span>'; $('art-cv-pal').innerHTML = '<div class="slab" style="text-align:left">只用黑白灰</div>' + h; }
    else {
      h += '<canvas id="art-cv-sv" width="160" height="120" style="width:100%;border:.3vmin solid #3a2f45;border-radius:1vmin;touch-action:none;cursor:crosshair"></canvas>';
      h += '<input type="range" id="art-cv-hue" min="0" max="359" value="' + Math.round(hv.h) + '" style="width:100%;height:3.4vmin;-webkit-appearance:none;appearance:none;background:linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00);border-radius:1vmin">';
      h += '<div>'; for(i = 0; i < D.WHEEL.length; i++) h += '<span class="sw" data-sw="' + D.WHEEL[i].c + '" title="' + D.WHEEL[i].n + '" style="width:3.6vmin;height:3.6vmin;background:' + D.WHEEL[i].c + '"></span>';
      h += '<span class="sw" data-sw="#ffffff" style="width:3.6vmin;height:3.6vmin;background:#fff"></span><span class="sw" data-sw="#222222" style="width:3.6vmin;height:3.6vmin;background:#222"></span></div>';
      h += '<button class="mini" data-c="rel" style="margin-top:.6vmin">🎡 這個顏色的相近色/互補色/對比色</button>';
      $('art-cv-pal').innerHTML = h;
      var sv = $('art-cv-sv'), sx = sv.getContext('2d'), g;
      sx.fillStyle = hsv2hex(hv.h, 1, 1); sx.fillRect(0, 0, 160, 120);
      g = sx.createLinearGradient(0, 0, 160, 0); g.addColorStop(0, '#fff'); g.addColorStop(1, 'rgba(255,255,255,0)'); sx.fillStyle = g; sx.fillRect(0, 0, 160, 120);
      g = sx.createLinearGradient(0, 0, 0, 120); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, '#000'); sx.fillStyle = g; sx.fillRect(0, 0, 160, 120);
      sx.strokeStyle = hv.v > 0.5 ? '#000' : '#fff'; sx.lineWidth = 2; sx.beginPath(); sx.arc(hv.s * 160, (1 - hv.v) * 120, 6, 0, Math.PI * 2); sx.stroke();
      function svPick(ev){ var r = sv.getBoundingClientRect(), s = clamp((ev.clientX - r.left) / r.width, 0, 1), v = clamp(1 - (ev.clientY - r.top) / r.height, 0, 1); setColor(hsv2hex(+$('art-cv-hue').value, s, v)); }
      sv.onpointerdown = function(ev){ ev.preventDefault(); try{ sv.setPointerCapture(ev.pointerId); }catch(_){} svPick(ev); sv.onpointermove = svPick; };
      sv.onpointerup = sv.onpointercancel = function(){ sv.onpointermove = null; };
      $('art-cv-hue').oninput = function(){ var h2 = hex2hsv(S.color); setColor(hsv2hex(+this.value, Math.max(0.05, h2.s), Math.max(0.05, h2.v))); };
    }
    h = ''; for(i = 0; i < S.recent.length; i++) h += '<span class="sw" data-sw="' + S.recent[i] + '" style="width:3.6vmin;height:3.6vmin;background:' + S.recent[i] + '"></span>';
    $('art-cv-rec').innerHTML = h || '<span class="slab">(還沒有)</span>';
  }
  function relHelp(){
    var best = 0, bd = 1e9, i, a = parseInt(S.color.substr(1, 2), 16), b = parseInt(S.color.substr(3, 2), 16), c = parseInt(S.color.substr(5, 2), 16), d, h = '';
    for(i = 0; i < 12; i++){ var w = D.WHEEL[i].c; d = Math.pow(a - parseInt(w.substr(1, 2), 16), 2) + Math.pow(b - parseInt(w.substr(3, 2), 16), 2) + Math.pow(c - parseInt(w.substr(5, 2), 16), 2); if(d < bd){ bd = d; best = i; } }
    function sw(ix, lab){ return '<span style="display:inline-flex;flex-direction:column;align-items:center;margin:.6vmin"><span class="sw" data-rsw="' + D.WHEEL[ix].c + '" style="background:' + D.WHEEL[ix].c + ';width:8vmin;height:8vmin;cursor:pointer"></span><small>' + lab + ' ' + D.WHEEL[ix].n + '</small></span>'; }
    h = '<h3>🎡 ' + D.WHEEL[best].n + ' 的色彩關係</h3><p>點一個顏色直接拿來用</p>' + sw(best, '目前') + sw((best + 11) % 12, '相近') + sw((best + 1) % 12, '相近') + sw((best + 6) % 12, '互補') + sw((best + 4) % 12, '對比') + sw((best + 8) % 12, '對比');
    modal(h, [{ t: '關閉', cls: 'ghost' }], { onOpen: function(m){ m.onclick = function(ev){ var t = upFind(ev.target, 'data-rsw'); if(t){ setColor(t.getAttribute('data-rsw')); modalClose(); } }; } });
  }
  function paintLayers(){
    var h = '', i, L;
    if(S.closed || !$('art-cv-lyr')) return;
    for(i = S.layers.length - 1; i >= 0; i--){ L = S.layers[i]; var th = ''; try{ th = L.c.toDataURL('image/png'); }catch(e){}
      h += '<div class="lyr' + (i === S.li ? ' on' : '') + '" data-li="' + i + '"><button class="mini" data-vis="' + i + '">' + (L.vis ? '👁' : '🚫') + '</button><img src="' + th + '" alt=""><span style="flex:1">' + esc(L.n) + '</span></div>'; }
    $('art-cv-lyr').innerHTML = h;
  }
  var plT = 0; function paintLayersSoon(){ clearTimeout(plT); plT = setTimeout(paintLayers, 400); }
  /* 草稿自動存(IndexedDB,鍵帶 uid;畫到一半被閒置登出也不會讓下一位看到) */
  var dId = opt.draftId || opt.task, dT = 0, draftKey = opt.task ? (A.uid + '|draft_' + dId) : (opt.workId ? (A.uid + '|' + opt.workId) : '');
  /* ★ v1.1.0 第 3 項:草稿除了存這台(IndexedDB),登入時也每 20 秒備份到雲端 Storage */
  /* ★ v1.1.3(檢查報告第 13 項):畫室自由創作也自動存草稿(鍵 uid|sdraft,只存這台,不進作品清單);按 💾 儲存或確定離開才清掉 */
  var sKey = (!opt.task && A.uid) ? (A.uid + '|sdraft') : '';
  function sDraftNow(){ if(!sKey || !S.dirty) return; try{ idbPut(sKey, { uid: A.uid, id: 'sdraft', t: now(), ratio: ratio, title: opt.title || '', workId: opt.workId || '', layers: S.layers.map(function(l){ return l.c.toDataURL('image/png'); }) }); }catch(e){} }
  function sDraftSoon(){ clearTimeout(dT); dT = setTimeout(function(){ if(!S.closed) sDraftNow(); }, 2500); }
  function onHide(){ if(document.hidden && !S.closed && sKey){ clearTimeout(dT); sDraftNow(); } }   /* 切背景/睡眠前先存 */
  document.addEventListener('visibilitychange', onHide);
  function draftSoon(){ if(sKey){ sDraftSoon(); return; } if(!opt.task || !draftKey) return; clearTimeout(dT); dT = setTimeout(function(){ if(S.closed) return; var rec = { uid: A.uid, id: 'draft_' + dId, t: now(), ratio: ratio, layers: S.layers.map(function(l){ return l.c.toDataURL('image/png'); }) }; idbPut(draftKey, rec); cloudDraftSoon(rec); }, 2500); }
  /* 貼紙列 */
  function paintStk(){ var el = $('art-cv-stk'), a = stickersOwned(), h = '', i; if(!el) return; if(a.indexOf(S.sticker) < 0) S.sticker = a[0] || '⭐';
    for(i = 0; i < a.length; i++) h += '<span class="stk' + (a[i] === S.sticker ? ' on' : '') + '" data-stk="' + a[i] + '">' + a[i] + '</span>'; el.innerHTML = h; }
  /* ⏱ 比賽倒數(伺服器時間);剩 1 分鐘變紅,時間到自動交件 */
  var tmr = 0;
  if(opt.endMs){ tmr = setInterval(function(){ var el = $('art-cv-timer'), ms = opt.endMs - srvNow(), s; if(S.closed){ clearInterval(tmr); return; } if(!el) return;
    s = Math.max(0, Math.ceil(ms / 1000)); el.textContent = '⏱ ' + (s >= 3600 ? Math.floor(s / 86400) + ' 天 ' + Math.floor((s % 86400) / 3600) + ' 時' : Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2));
    el.className = 'cvtimer' + (ms < 60000 ? ' red' : '');
    if(ms > 0 && ms <= 10000 && s !== S.lastTick){ S.lastTick = s; sfx('sfx-sel', 0.35); }   /* ★ v1.1.1 最後 10 秒每秒提醒一聲 */
    if(ms <= 0 && !S.autoSent){ S.autoSent = true; clearInterval(tmr); if(S.strokes > 0 && opt.onSubmit){ sfx('sfx-confirm', 0.5); toast('⏰ 時間到,自動交件!'); opt.onSubmit(analyzeImg(), cvObj, true); } else { toast('⏰ 時間到了'); close(); } } }, 500); }

  wrap.addEventListener('click', function(e){
    var t = upFind(e.target, 'data-c') || upFind(e.target, 'data-tool') || upFind(e.target, 'data-sw') || upFind(e.target, 'data-vis') || upFind(e.target, 'data-li') || upFind(e.target, 'data-stk'), a;
    if(!t) return;
    if(t.getAttribute('data-tool')){ a = t.getAttribute('data-tool'); sfx('sfx-sel', 0.3); if(a === 'eyedrop'){ S.eyedrop = !S.eyedrop; paintTools(); } else setTool(a); return; }
    if(t.getAttribute('data-stk')){ S.sticker = t.getAttribute('data-stk'); setTool('stamp'); paintStk(); sfx('sfx-tap', 0.2); return; }
    if(t.getAttribute('data-sw')){ setColor(t.getAttribute('data-sw')); sfx('sfx-tap', 0.15); return; }
    if(t.getAttribute('data-vis') != null){ var vi = +t.getAttribute('data-vis'); S.layers[vi].vis = !S.layers[vi].vis; sfx('sfx-tap', 0.2); paintLayers(); req(); return; }
    if(t.getAttribute('data-li') != null){ S.li = +t.getAttribute('data-li'); sfx('sfx-tap', 0.15); paintLayers(); req(); return; }
    a = t.getAttribute('data-c'); sfx('sfx-tap', 0.25);
    if(a === 'x'){ if(S.dirty && !opt.task){ confirmBox('還沒儲存,確定離開畫布?(這張畫會丟掉)', function(ok){ if(ok){ S.dirty = 0; clearTimeout(dT); if(sKey) idbDel(sKey); close(); } }); } else close(); }
    else if(a === 'undo') undo(); else if(a === 'redo') redo();
    else if(a === 'grid'){ S.grid = !S.grid; req(); }
    else if(a === 'fit') fit(); else if(a === 'keys') keysHelp();
    else if(a === 'how') cvHow();
    else if(a === 'rel') relHelp();
    else if(a === 'ladd'){ var _n0 = S.layers.length; addLayer(); if(S.layers.length > _n0) opPush({ t: 'add', L: S.layers[S.li], i: S.li }); paintLayers(); }
    else if(a === 'lup' && S.li < S.layers.length - 1){ var t1 = S.layers[S.li]; S.layers[S.li] = S.layers[S.li + 1]; S.layers[S.li + 1] = t1; opPush({ t: 'move', L: t1, from: S.li, to: S.li + 1 }); S.li++; paintLayers(); req(); }
    else if(a === 'ldn' && S.li > 0){ var t2 = S.layers[S.li]; S.layers[S.li] = S.layers[S.li - 1]; S.layers[S.li - 1] = t2; opPush({ t: 'move', L: t2, from: S.li, to: S.li - 1 }); S.li--; paintLayers(); req(); }
    else if(a === 'ldel'){ if(S.layers.length <= 1){ toast('至少要留一個圖層'); return; } var _dl = S.layers[S.li], _di = S.li; S.layers.splice(_di, 1); opPush({ t: 'del', L: _dl, i: _di }); S.li = Math.max(0, _di - 1); paintLayers(); req(); toast('🗑 刪掉「' + _dl.n + '」了,按 ↶ 復原可以救回來'); }
    else if(a === 'done'){ if(S.strokes < 3 && !opt.layers){ toast('先畫一點東西再交件喔'); return; } if(opt.onSubmit) opt.onSubmit(analyzeImg(), cvObj); }
    else if(a === 'save'){ saveWork(); }
  });
  $('art-cv-size').oninput = function(){ setSize(+this.value); };
  $('art-cv-op').oninput = function(){ setOp(+this.value); };
  function flatten(maxSide){ var s = Math.min(1, (maxSide || 99999) / Math.max(W, H)), c = document.createElement('canvas'), x, i, L; c.width = Math.round(W * s); c.height = Math.round(H * s); x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); for(i = 0; i < S.layers.length; i++){ L = S.layers[i]; if(!L.vis) continue; x.globalAlpha = L.a; x.drawImage(L.c, 0, 0, c.width, c.height); } return c; }
  function analyzeImg(){ var c = flatten(160), used = 0, i, x = c.getContext('2d'), tl = 0, k2; for(i = 0; i < S.layers.length; i++){ if(layerUsed(S.layers[i].c)) used++; }
    for(k2 in S.used){ if(S.used.hasOwnProperty(k2) && k2 !== 'eraser' && k2 !== 'stamp') tl++; }
    return { d: x.getImageData(0, 0, c.width, c.height), w: c.width, h: c.height, strokes: S.strokes, layers: used, tools: tl }; }
  function layerUsed(c){ var t = document.createElement('canvas'), x, d, i; t.width = 40; t.height = 30; x = t.getContext('2d'); x.drawImage(c, 0, 0, 40, 30); d = x.getImageData(0, 0, 40, 30).data; for(i = 3; i < d.length; i += 4){ if(d[i] > 10) return true; } return false; }
  function saveWork(){
    if(!opt.workId) opt.workId = 'w' + now().toString(36);
    var th = flatten(320).toDataURL('image/jpeg', 0.82), rec = { uid: A.uid, id: opt.workId, t: now(), title: opt.title || '我的作品', ratio: ratio, thumb: th, layers: S.layers.map(function(l){ return l.c.toDataURL('image/png'); }) };
    idbPut(A.uid + '|' + opt.workId, rec, function(ok){ if(ok){ S.dirty = 0; clearTimeout(dT); if(sKey) idbDel(sKey); sfx('sfx-coin', 0.4); toast(A.guest ? '💾 已存到你的畫室(這台平板)' : '💾 已存到你的畫室,也備份到雲端 ☁'); } else toast('儲存失敗:這台平板的空間可能不夠'); });
    cloudWorkPut(rec);   /* ★ v1.1.0 第 3 項 */
    try{ dailyHit('paint', paintInfo(analyzeImg())); }catch(e){}   /* ★ v1.1.0 第 19 項:畫室作品類的每日挑戰 */
  }
  function close(silent){ if(S.closed) return; clearTimeout(dT); sDraftNow(); document.removeEventListener('visibilitychange', onHide); S.closed = true; clearInterval(tmr); clearTimeout(plT); clearTimeout(S.lp); document.removeEventListener('keydown', onKey); document.removeEventListener('keyup', onKey); window.removeEventListener('resize', resize); if(wrap.parentNode) wrap.parentNode.removeChild(wrap); if(A.cv === cvObj) A.cv = null; if(A.on) music($('art-lv') ? 'lv' : 'hub'); if(!silent && opt.onClose) opt.onClose(); }
  var cvObj = { close: close, flatten: flatten };
  music(opt.endMs ? 'contest' : 'cv');   /* ★ v1.1.1 畫畫用安靜的曲子;比賽用緊湊的 */
  A.cv = cvObj;
  window.addEventListener('resize', resize);
  paintTools(); paintColor(); paintLayers(); paintStk();
  /* ★ v1.1.3(檢查報告第 8 項):有草稿要問「接著畫嗎?」時,新手教學等問完再出來(原本教學蓋在確認框上) */
  var draftAsk = !!(opt.task && !opt.layers && draftKey);
  setTimeout(function(){ resize(); fit(); if(!draftAsk) tutRun('canvas'); }, 30);
  function tutAfter(){ if(!S.closed) tutRun('canvas'); }
  /* 有沒交件的草稿 ⇒ 問要不要接著畫(只找本人 uid 的) */
  if(draftAsk) idbGet(draftKey, function(r){ if(S.closed) return; if(!r || r.uid !== A.uid || !r.layers || !r.layers.length){ tutAfter(); return; }
    confirmBox('上次這題還沒交件的畫,要接著畫嗎?', function(ok){ if(!ok){ idbDel(draftKey); tutAfter(); return; } draftLoad(r.layers, function(){ S.strokes = 3; }); tutAfter(); }); });
  /* ★ v1.1.3(檢查報告第 4 項):草稿圖層全部載完(成功或壞掉)才一起換上,壞掉的略過;全壞 ⇒ 留一張新畫紙。原本壞一層整張畫布每幀出錯、畫不出來 */
  function draftLoad(srcs, after){ var n = 0, i, ims = [], bad = 0;
    function fin(){ var j, c, ly = []; if(S.closed) return;
      for(j = 0; j < ims.length; j++){ if(!ims[j]) continue; c = mkC(); c.getContext('2d').drawImage(ims[j], 0, 0, W, H); ly.push({ c: c, vis: true, a: 1, n: '圖層 ' + (ly.length + 1), id: ++S.lid }); }
      if(!ly.length){ toast('😢 草稿讀不出來,先用新的畫紙'); return; }
      S.layers = ly; S.li = ly.length - 1; S.undo = []; S.redo = []; if(after) after();
      if(bad) toast('有 ' + bad + ' 個圖層讀不出來,已經略過');
      cacheDirty(); paintLayers(); req(); }
    for(i = 0; i < srcs.length; i++) (function(src, ix){ var im = new Image(); im.onload = function(){ ims[ix] = im; n++; if(n === srcs.length) fin(); }; im.onerror = function(){ bad++; n++; if(n === srcs.length) fin(); }; im.src = src; })(srcs[i], i); }
  if(opt.fromDraft){ S.dirty = 1; }
  return cvObj;
}

/* ══ 畫畫題評分(系統只評量得到的技法;評分卡先說優點、再給一個最重要的改進) ══ */
function evalDraw(task, img){
  var d = img.d.data, n = img.w * img.h, i, r, g, b, mx, mn, lum, sat, painted = 0, card = [], stars = 0;
  var bins = [0, 0, 0, 0, 0, 0, 0, 0, 0], satSum = 0, wh = [], k;
  for(i = 0; i < 12; i++) wh.push(0);
  function nearestWheel(r2, g2, b2){ var best = 0, bd = 1e9, j, c, dd; for(j = 0; j < 12; j++){ c = D.WHEEL[j].c; dd = Math.pow(r2 - parseInt(c.substr(1, 2), 16), 2) + Math.pow(g2 - parseInt(c.substr(3, 2), 16), 2) + Math.pow(b2 - parseInt(c.substr(5, 2), 16), 2); if(dd < bd){ bd = dd; best = j; } } return best; }
  var colored = 0, wx = 0, wy = 0, wsum = 0, ws = [], meanW = 0;
  for(i = 0; i < n; i++){
    r = d[i * 4]; g = d[i * 4 + 1]; b = d[i * 4 + 2]; mx = Math.max(r, g, b); mn = Math.min(r, g, b); lum = 0.299 * r + 0.587 * g + 0.114 * b; sat = mx ? (mx - mn) / mx : 0;
    var isBg = r > 244 && g > 244 && b > 244, w = isBg ? 0 : ((255 - lum) / 255 + sat * 0.8);
    ws.push(w); meanW += w;
    if(isBg) continue;
    painted++; satSum += sat;
    bins[Math.min(8, Math.floor(lum / 256 * 9))]++;
    if(sat > 0.35 && mx > 64){ colored++; wh[nearestWheel(r, g, b)]++; }
  }
  meanW /= n;
  var cover = painted / n;
  if(task === 'gray5'){
    var lv = 0, lo = 9, hi = -1;
    for(k = 0; k < 9; k++){ if(bins[k] >= painted * 0.025 && bins[k] > 8){ lv++; if(k < lo) lo = k; if(k > hi) hi = k; } }
    if(cover < 0.06) return { stars: 0, card: [{ ok: 0, t: '畫面幾乎是空白的,多畫一點再交件。' }] };
    stars = lv >= 5 ? 3 : (lv === 4 ? 2 : (lv === 3 ? 1 : 0));
    if(lv >= 3) card.push({ ok: 1, t: '你畫出了 ' + lv + ' 種深淺不同的灰,明暗有層次!' });
    if(lo > 2) card.push({ ok: 0, t: '畫面裡還沒有很暗的地方,加一點最暗的投影或交界線會更立體。' });
    else if(lv < 5) card.push({ ok: 0, t: '下筆再分輕重:很輕、輕、中、重、很重,把中間的灰也畫出來。' });
    if(stars === 0) card.push({ ok: 0, t: '目前只看得出 ' + lv + ' 種灰,至少要 3 種才算過關。' });
  } else if(task === 'complement'){
    var top = -1, tv = 0, sec = -1, sv2 = 0, dd2, a2;
    for(k = 0; k < 12; k++){ a2 = wh[k] + wh[(k + 1) % 12] * 0.5 + wh[(k + 11) % 12] * 0.5; if(a2 > tv){ tv = a2; top = k; } }
    for(k = 0; k < 12; k++){ dd2 = Math.min(Math.abs(k - top), 12 - Math.abs(k - top)); if(dd2 < 3) continue; a2 = wh[k] + wh[(k + 1) % 12] * 0.5 + wh[(k + 11) % 12] * 0.5; if(a2 > sv2){ sv2 = a2; sec = k; } }
    if(colored < n * 0.15) return { stars: 0, card: [{ ok: 0, t: '彩色的部分太少了,招牌要塗滿一點(現在大部分是白的或灰的)。' }] };
    dd2 = sec < 0 ? 0 : Math.min(Math.abs(sec - top), 12 - Math.abs(sec - top));
    var ratio2 = sec < 0 ? 0 : sv2 / Math.max(1, tv);
    if(dd2 >= 6 - 1 && ratio2 >= 0.12){ stars = (dd2 === 6 && ratio2 >= 0.2 && colored >= n * 0.35) ? 3 : 2; card.push({ ok: 1, t: '你用了 ' + D.WHEEL[top].n + ' 和 ' + D.WHEEL[sec].n + ',' + (dd2 === 6 ? '正好是互補色' : '幾乎是互補色') + ',非常醒目!' }); if(stars < 3) card.push({ ok: 0, t: ratio2 < 0.2 ? '其中一個顏色面積太小,放大一點會更醒目。' : '把招牌塗得更滿、顏色更純,會更搶眼。' }); }
    else if(dd2 >= 4 && ratio2 >= 0.1){ stars = 1; card.push({ ok: 1, t: D.WHEEL[top].n + ' 和 ' + D.WHEEL[sec].n + ' 是對比色,有一點醒目了。' }); card.push({ ok: 0, t: '換成正對面的「互補色」(例:' + D.WHEEL[top].n + ' 配 ' + D.WHEEL[(top + 6) % 12].n + ')會最醒目。' }); }
    else { stars = 0; card.push({ ok: 0, t: sec < 0 ? '畫面主要只有 ' + D.WHEEL[top].n + ' 一種顏色,再加上它的互補色 ' + D.WHEEL[(top + 6) % 12].n + '。' : '目前的顏色在色相環上離得不夠遠,試試 ' + D.WHEEL[top].n + ' 配 ' + D.WHEEL[(top + 6) % 12].n + '。' }); }
  } else if(task === 'thirds'){
    if(cover < 0.08) return { stars: 0, card: [{ ok: 0, t: '畫面幾乎是空白的,先畫出你的主角。' }] };
    for(i = 0; i < n; i++){ var w2 = Math.max(0, ws[i] - meanW * 1.1); w2 = w2 * w2; wx += (i % img.w) * w2; wy += Math.floor(i / img.w) * w2; wsum += w2; }
    if(wsum <= 0) return { stars: 0, card: [{ ok: 0, t: '看不出主角在哪裡,讓主角顏色比背景更重、更鮮豔。' }] };
    var cx = wx / wsum / img.w, cy = wy / wsum / img.h, best = 9, P = [[1 / 3, 1 / 3], [2 / 3, 1 / 3], [1 / 3, 2 / 3], [2 / 3, 2 / 3]], dq;
    for(k = 0; k < 4; k++){ dq = Math.sqrt(Math.pow(cx - P[k][0], 2) + Math.pow((cy - P[k][1]) * 0.75, 2)); if(dq < best) best = dq; }
    stars = best <= 0.08 ? 3 : (best <= 0.13 ? 2 : (best <= 0.19 ? 1 : 0));
    if(stars >= 2) card.push({ ok: 1, t: '畫面的重心落在三分線交叉點附近,構圖很生動!' });
    if(stars === 1) card.push({ ok: 1, t: '主角已經離開正中間了。' });
    if(stars < 3) card.push({ ok: 0, t: Math.abs(cx - 0.5) < 0.08 && Math.abs(cy - 0.5) < 0.08 ? '主角在正中間,試著移到井字的交叉點上(打開 #️⃣ 格線對準)。' : '把最顯眼、顏色最重的主角再靠近一個交叉點。' });
  } else if(task === 'media3'){   /* ★ v1.1.0 媒材工作室:用了幾種筆刷 */
    if(cover < 0.06) return { stars: 0, card: [{ ok: 0, t: '畫面幾乎是空白的,多畫一點再交件。' }] };
    k = img.tools | 0; stars = k >= 3 ? 3 : (k === 2 ? 2 : (k === 1 ? 1 : 0));
    if(k >= 2) card.push({ ok: 1, t: '你用了 ' + k + ' 種不同的筆刷,畫面的質感很豐富!' });
    if(k < 3) card.push({ ok: 0, t: '再換一種筆刷(例如水彩或噴槍)畫一部分,感受不同的筆觸。' });
  } else if(task === 'dots'){   /* ★ v1.1.0 大師畫廊:點描 — 數「分開的小色塊」 */
    var dr = dotCount(img); k = dr.n;
    if(dr.lines > 0.35) return { stars: 0, card: [{ ok: 0, t: '畫面裡有很多連在一起的線條,點描要「一點一點」分開點喔。' }] };
    stars = k >= 40 ? 3 : (k >= 20 ? 2 : (k >= 10 ? 1 : 0));
    if(stars && dr.hues < 3){ stars = Math.min(stars, 2); card.push({ ok: 0, t: '再多用一兩種顏色(至少 3 種),點描會更有秀拉的感覺。' }); }
    if(k >= 10) card.push({ ok: 1, t: '你點了大約 ' + k + ' 個小色點,有點描的味道了!' });
    if(stars < 3 && dr.hues >= 3) card.push({ ok: 0, t: '再多點一些小點(40 個以上),遠看畫面會更完整。' });
    if(!stars) card.push({ ok: 0, t: '目前只數到 ' + k + ' 個分開的小點,至少要 10 個。' });
  } else if(task === 'free'){   /* 比賽/主題的自由題:系統只看完成度 */
    if(cover < 0.05) return { stars: 0, card: [{ ok: 0, t: '畫面幾乎是空白的。' }] };
    stars = cover >= 0.35 && img.strokes >= 25 ? 3 : (cover >= 0.15 ? 2 : 1);
    card.push({ ok: 1, t: '作品完成了,畫面塗了約 ' + Math.round(cover * 100) + '%。' });
    if(stars < 3) card.push({ ok: 0, t: '畫面還有很多空白,背景也畫一畫會更完整。' });
  }
  /* ★ v1.1.0 第 16 項:系統評分防取巧 — 要有「主角」(明暗有變化、形狀有變化)才給 3★;
     只塗幾條色帶/幾塊方塊(例如五條灰、兩塊互補色)最多 2★,剩下交給老師加減分 */
  if(stars === 3 && task !== 'dots' && task !== 'media3'){ var sj = subjectCheck(img); if(!sj.ok){ stars = 2; card.push({ ok: 0, t: sj.why }); } }
  if(img.layers >= 2) card.push({ ok: 1, t: '用了 ' + img.layers + ' 個圖層分開畫,很有規劃!' });
  return { stars: stars, card: card };
}
/* 主角檢查:Sobel 邊緣方向要夠多樣(不能只有直線/橫線的色帶或方塊)、明暗至少跨 3 個區間 */
function subjectCheck(img){
  var w = img.w, h = img.h, d = img.d.data, L = new Array(w * h), i, x, y, gx, gy, m, ang, bins = [0, 0, 0, 0], edges = 0, lmin = 255, lmax = 0, bg = 0, nb = 0;
  for(i = 0; i < w * h; i++){ L[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]; if(L[i] < 244){ if(L[i] < lmin) lmin = L[i]; if(L[i] > lmax) lmax = L[i]; } }
  for(y = 1; y < h - 1; y++){ for(x = 1; x < w - 1; x++){ i = y * w + x;
    gx = L[i - w + 1] + 2 * L[i + 1] + L[i + w + 1] - L[i - w - 1] - 2 * L[i - 1] - L[i + w - 1];
    gy = L[i + w - 1] + 2 * L[i + w] + L[i + w + 1] - L[i - w - 1] - 2 * L[i - w] - L[i - w + 1];
    m = Math.abs(gx) + Math.abs(gy); if(m < 60) continue; edges++;
    ang = Math.atan2(gy, gx); if(ang < 0) ang += Math.PI; bins[Math.min(3, Math.floor((ang + Math.PI / 8) % Math.PI / (Math.PI / 4)))]++; } }
  for(i = 0; i < 4; i++){ if(bins[i] >= edges * 0.1) nb++; }
  bg = lmax - lmin;
  if(edges < w * h * 0.01) return { ok: false, why: '畫面裡看不太出形狀,畫一個清楚的主角(有輪廓、有明暗)會更好。' };
  if(nb < 3) return { ok: false, why: '畫面大多是直直橫橫的色帶或方塊,畫一個有形狀變化的主角(像蘋果、房子、人物)才能拿 3 顆星。' };
  if(bg < 70) return { ok: false, why: '主角的明暗變化不夠,加一點亮面和暗面,主角會更突出。' };
  return { ok: true };
}
/* 點描:把畫面縮小後,數「分開的小色塊」(連通區);太大的連通區當成線條 */
function dotCount(img){
  var w = img.w, h = img.h, d = img.d.data, seen = new Array(w * h), i, n = 0, big = 0, painted = 0, st, p, cnt, x, y, hues = {}, r, g, b, mx, mn, hh;
  function isP(k){ return !(d[k * 4] > 235 && d[k * 4 + 1] > 235 && d[k * 4 + 2] > 235); }
  for(i = 0; i < w * h; i++){ if(seen[i] || !isP(i)) continue;
    st = [i]; seen[i] = 1; cnt = 0; var bestP = i, bestS = -1, ss;
    while(st.length){ p = st.pop(); cnt++; x = p % w; y = (p - x) / w;
      ss = Math.max(d[p * 4], d[p * 4 + 1], d[p * 4 + 2]) - Math.min(d[p * 4], d[p * 4 + 1], d[p * 4 + 2]); if(ss > bestS){ bestS = ss; bestP = p; }   /* 用這一點裡最鮮豔的像素判斷顏色(邊緣反鋸齒比較淡) */
      if(x > 0 && !seen[p - 1] && isP(p - 1)){ seen[p - 1] = 1; st.push(p - 1); } if(x < w - 1 && !seen[p + 1] && isP(p + 1)){ seen[p + 1] = 1; st.push(p + 1); }
      if(y > 0 && !seen[p - w] && isP(p - w)){ seen[p - w] = 1; st.push(p - w); } if(y < h - 1 && !seen[p + w] && isP(p + w)){ seen[p + w] = 1; st.push(p + w); } }
    painted += cnt;
    if(cnt >= 2 && cnt <= 60){ n++; r = d[bestP * 4]; g = d[bestP * 4 + 1]; b = d[bestP * 4 + 2]; mx = Math.max(r, g, b); mn = Math.min(r, g, b); if(mx - mn > 40){ hh = hex2hsv('#' + ('0' + r.toString(16)).slice(-2) + ('0' + g.toString(16)).slice(-2) + ('0' + b.toString(16)).slice(-2)).h; hues[Math.floor(((hh + 15) % 360) / 30)] = 1; } }
    else if(cnt > 60) big += cnt; }
  return { n: n, lines: painted ? big / painted : 0, hues: Object.keys(hues).length };
}

/* ══ 🎨 個人畫室 ══ */
function studioOpen(){
  idbGet(A.uid + '|sdraft', function(sd){ studioOpen2(sd && sd.uid === A.uid && sd.layers && sd.layers.length ? sd : null); });
}
function studioOpen2(sd){
  idbList(A.uid + '|w', function(list){
    var h = '<h3>🎨 我的畫室</h3><p style="margin:0;color:#6b6178;font-size:2.2vmin">' + (A.guest ? '訪客的作品只存在這台平板。' : '作品存在這台平板,也會自動備份到雲端 ☁(平板被清掉也找得回來);只有你登入時看得到。') + '</p>', i, w;
    h += '<div style="display:flex;gap:1vmin;flex-wrap:wrap;margin-top:1vmin"><button class="abtn ghost" data-wall="1" style="font-size:2.2vmin">🖼 作品牆</button>' + (A.guest ? '' : '<button class="abtn ghost" data-cloud="1" style="font-size:2.2vmin">☁ 從雲端找回作品</button>') + '</div>';
    list.sort(function(a, b){ return b.t - a.t; });
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(24vmin,1fr));gap:1.4vmin;margin-top:1.4vmin">';
    if(sd) h += '<div class="scard" style="grid-column:1/-1;background:#fff3b0;display:flex;align-items:center;gap:1.4vmin;flex-wrap:wrap">🩹 <b>上次還沒儲存的畫</b>(' + new Date(sd.t).toLocaleString() + ')<span style="flex:1"></span><button class="abtn go" data-sdr="1" style="font-size:2.2vmin">接著畫</button><button class="abtn ghost" data-sdx="1" style="font-size:2.2vmin">丟掉</button></div>';   /* ★ v1.1.3 第 13 項 */
    h += '<button class="abtn go" data-new="1" style="min-height:18vmin;font-size:3vmin">＋ 新畫布</button>';
    for(i = 0; i < list.length; i++){ w = list[i]; if(w.uid !== A.uid) continue;
      h += '<div class="lvcard" style="flex-direction:column;align-items:stretch;margin:0"><img src="' + w.thumb + '" style="width:100%;aspect-ratio:4/3;object-fit:contain;background:#fff;border-radius:1vmin" alt=""><div style="display:flex;gap:.8vmin;margin-top:.8vmin"><button class="abtn go" data-open="' + w.id + '" style="flex:1;font-size:2.2vmin">開啟</button><button class="abtn ghost" data-sub="' + w.id + '" style="font-size:2.2vmin">📤</button><button class="abtn ghost" data-del="' + w.id + '" style="font-size:2.2vmin">🗑</button></div></div>'; }
    h += '</div>';
    modal(h, [{ t: '回村子', cls: 'ghost' }], { onOpen: function(m){
      m.onclick = function(ev){ if(sd && upFind(ev.target, 'data-sdr')){ modalClose(); canvasOpen({ title: sd.title || '我的作品', ratio: sd.ratio, layers: sd.layers, workId: sd.workId || '', fromDraft: true, onClose: studioOpen }); return; }
        if(sd && upFind(ev.target, 'data-sdx')){ confirmBox('丟掉這張還沒儲存的畫?(不能復原)', function(ok){ if(ok) idbDel(A.uid + '|sdraft', function(){ studioOpen(); }); else studioOpen(); }); return; }
        var t = upFind(ev.target, 'data-new') || upFind(ev.target, 'data-open') || upFind(ev.target, 'data-del') || upFind(ev.target, 'data-sub') || upFind(ev.target, 'data-wall') || upFind(ev.target, 'data-cloud'), id, j, rec = null;
        if(!t) return;
        if(t.getAttribute('data-wall')){ wallList(); return; }
        if(t.getAttribute('data-cloud')){ modalClose(); cloudRestore(); return; }
        if(t.getAttribute('data-new')){ modalClose(); ratioPick(); return; }
        if((id = t.getAttribute('data-sub'))){ phase2('📤 投稿到創藝畫廊'); return; }
        if((id = t.getAttribute('data-del'))){ confirmBox('刪掉這件作品?(這台和雲端備份都會刪掉,不能復原)', function(ok){ if(ok){ cloudWorkDel(id); idbDel(A.uid + '|' + id, function(){ studioOpen(); }); } else studioOpen(); }); return; }
        id = t.getAttribute('data-open'); for(j = 0; j < list.length; j++) if(list[j].id === id) rec = list[j];
        if(rec && rec.uid === A.uid){ modalClose(); canvasOpen({ title: rec.title, ratio: rec.ratio, layers: rec.layers, workId: rec.id, onClose: studioOpen }); } };
    } });
  });
}
function ratioPick(){
  var h = '<h3>新畫布:選畫布比例</h3><div style="display:flex;gap:2vmin;justify-content:center;flex-wrap:wrap">', k, r;
  for(k in RATIOS){ if(!RATIOS.hasOwnProperty(k)) continue; r = RATIOS[k]; h += '<button class="abtn" data-r="' + k + '" style="display:flex;flex-direction:column;align-items:center;gap:1vmin"><span style="display:block;width:' + (r[0] / 80) + 'vmin;height:' + (r[1] / 80) + 'vmin;border:.4vmin solid #3a2f45;background:#fff"></span>' + k + ({ '1:1': ' 正方', '4:3': ' 橫式', '3:4': ' 直式(人像)', '16:9': ' 寬螢幕(風景)' }[k] || '') + '</button>'; }
  modal(h + '</div>', [{ t: '取消', cls: 'ghost', cb: studioOpen }], { onOpen: function(m){ m.onclick = function(ev){ var t = upFind(ev.target, 'data-r'); if(t){ modalClose(); canvasOpen({ title: '自由創作', ratio: t.getAttribute('data-r'), onClose: studioOpen }); } }; } });
}

/* ══ 對外 ══ */
window.ARTW = { ver: ART_VER, enter: function(){ enter(); setTimeout(idbSweep, 4000); }, onUser: onUser, isOn: function(){ return A.on; },
  _mapBad: function(){ if(A.mapBad) return; A.mapBad = true; try{ if(A.screen === 'hub' && !$('art-modal')) paintHub(); }catch(e){} },   /* ★ v1.1.4 地圖圖片載不到 ⇒ 退回 SVG 村子 */
  _test: { merge: merge, norm: norm, resEarned: resEarned, evalDraw: evalDraw, weekKey: weekKey, dayKey: dayKey, dayAdd: dayAdd, A: A, SRV: SRV, DEV: DEV, ptsAdd: ptsAdd, ptsSanitize: ptsSanitize, cloudDoc: cloudDoc,
    dailyList: dailyList, dailyHit: dailyHit, subjectCheck: subjectCheck, dotCount: dotCount, paintInfo: paintInfo, quizShuffle: quizShuffle, liteAuto: liteAuto, hasCard: hasCard, weekPts: weekPts, srvNow: srvNow, cloudSync: cloudSync, evRefresh: evRefresh, svgStyle: svgStyle } };
})();
