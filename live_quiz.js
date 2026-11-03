/* ════════════════════════════════════════════════════════════════════
 *  live_quiz.js — ⚡ 搶答擂台(連線搶答模式)v5.332.0
 *  ★ v5.332.0(2026-11-03・老師「許多學生沒有成功輸入到答案,卡在『本題未作答』無法進到下一題;讓網速慢或斷線的學生也能接續遊玩」)
 *    SDK 即時連線在學校 wifi 塞車時會「卡住但不報錯」⇒ 加 Firestore REST 備援通道(見 roomStage/restGetRoom/studentWatch/sendAnswer):
 *    甲 房間看門狗(安靜 4/9 秒就讀雲端,雲端較新直接接上下一題並重接監聽、必要時 SDK 斷網重連);
 *    乙 作答雙通道(SDK 2.5 秒沒回應 ⇒ REST 送同一筆,文件 id 固定只算一次);丙 心跳 5 秒沒回應 ⇒ REST 補 lastSeen。
 *    房間監聽收到比畫面舊的狀態一律忽略。不需改 firestore.rules。
 *  ★ v5.325.0(2026-11-02・老師「比賽結束時,要按確認發送獎勵才真正發送。如果是測試場或是有出現爭議,老師可以不發該場獎勵」)
 *    「🎁 頒發獎勵」→ confirmGrant 確認視窗(各級人數＋內容)→「確認發送」才 hostGrant;還沒發出任何一份時可「🚫 本場不發獎勵」
 *    (askNoAward:測試場/有爭議/其他＋說明)→ setNoAward 寫 room meta.noAward/noAwardReason/noAwardAt＋liveQuizHistory noAward*,移出看板;
 *    可「↺ 改回要發獎勵」;已發出部分則不能改成不發;hostGrant 遇 noAward 直接擋;學生結束頁/擂台紀錄顯示不發獎勵。
 *  ★ v5.324.0(2026-11-02・老師「接續之前未結束的房間,要有清除功能」)— hostHome 每場加 🗑、多場時「🧹 全部清除」;
 *    clearRooms():未結束的房間寫 meta.status='ended'＋meta.cleared=true＋endedAt,再 boardRemove;已結束(待頒獎)的只移出看板;作答紀錄不刪。
 *    學生端 studentEnded 遇 cleared 且無 final ⇒「老師已經關閉這一場了」＋加入新的擂台,並清本機紀錄。
 *  ★ v5.323.0(2026-11-02・老師「思考如何穩定全班27人連線」→ 採甲＋乙＋丁)
 *    甲 連線診斷:學生心跳順帶 rtt(上次心跳來回 ms)/lag(10 秒內最大畫面卡頓 ms)/dev(裝置標籤,舊 iPad=1080×810);主持台 👥 參加者 視窗下方
 *       「📶 連線診斷」表(最差排最上、每人斷線次數 H.dcN、中位數/最慢、舊 iPad 統計);playerWrite 三段相容(新規則→v5.318→v5.317)
 *    乙 比賽專心模式:擂台開著時 body.lq-focus ⇒ #_gc_wrapper 隱藏＋動畫暫停;window._lxpsLiveQuizFocus 旗標
 *    丁 作答自動重送(截止後 4 秒內 0.6～2 秒重送,保留原 ms);主持台時間到後有在線同學沒收到答案就多等,最多 +4.5 秒;規則作答寬限 3→6 秒
 *  ★ v5.322.0(2026-11-02・老師「學生無法離開前一場,請修成學生可以退出前一場,重新進老師開的新場次」)
 *    studentTryResume:上一場已結束/不存在/被踢 ⇒ 清本機紀錄不拉回;同一位主持人看板上有比上一場新的房 ⇒ 不自動拉回、輸入房號畫面顯示「↩ 回到上一場」;
 *    studentQuit():送離線記號＋清本機紀錄＋回輸入房號;等候室下方房號＋「🚪 退出這一場」;✕ 改三選項(取消/暫時離開/退出這一場);結束頁「🚀 加入新的擂台」
 *  ★ v5.321.0(2026-11-02・老師「右邊排名看不到完整班級座號,請修改字體大小」)— 主持台公布畫面右側前五名(.lq-hside .lq-top5)
 *    字體 clamp(14px,1.7u,24px)、名字可換行不截斷、分數排到第二行
 *  ★ v5.320.0(2026-11-02・老師「學生平板顯示登入,老師電腦顯示離線,同步沒有即時;學生一直自動斷線又連線」「主持人選擇題庫時不要顯示答案」)
 *    ① 心跳/加入帶 syncAt 被雲端規則拒絕時自動改用不帶 syncAt 的寫法(playerWrite)——規則沒重新發布也不會變成永遠斷線
 *    ② 所有即時監聽改走 live():出錯自動重新監聽(原本錯誤被吞、監聽永久停止 ⇒ 不同步)
 *    ③ 學生切走 App 的離線記號持續 6 秒才算斷線(AWAY_GRACE_MS);心跳門檻 25→30 秒;心跳失敗 3 秒後補送
 *    ④ 主持台自己網路卡住(fromCache 或全班同時沒心跳)⇒ 不跳「斷線了」,上方顯示「主持台網路不穩」
 *    ⑤ 學生右上角顯示「網路不穩,重新連線中…」;⑥ 主持人選題清單不再顯示答案
 *  ★ v5.318.0(2026-11-01・老師「用甲案。沒用一個法寶+5%分,最多兩個法寶都沒用+10%」)— 計分改為 500＋速度分＋法寶保留加成(見 computeTally)
 *  ★ 2026-11-01 老師需求:小英雄首頁新增連線搶答模式(類似 KAHOOT),GM 主持題庫,
 *    學生登入後名稱和帳號出現在參加者列表,一題一題快問快答,結束直接看積分排名,
 *    依排名頒發 GM 獎勵到獲獎學生帳號,參加學生有參加獎。
 *  設計書:專案知識庫 claude/連線搶答模式_設計書.md(v1.2 含老師全部裁定)
 *  老師裁定摘要:
 *    Q1 甲 學生端顯示題目全文 ｜ Q2 甲(★ v5.318.0 老師改裁:答對 500＋速度最多 500;沒用一個法寶總分 +5%,兩個都沒用 +10%,即時算入排名)
 *       同分再比答對題數→答對題累計秒數(v5.317.0 原本是 Q2 乙「只看答對題數」)
 *    Q3 乙 開始後可加入,參加獎門檻=加入後題數的一半 ｜ Q5 乙 首頁三顆入口上方橫幅
 *    Q4 第1～5名 10萬知識幣+10水晶+豪華典藏書×5;第6～10名 6萬+6+3;參加獎 3萬+3+1(前 10 名不另給)
 *    Q6 甲 四選一＋是非題 ｜ Q7 乙 GM 匯入主持人名單 ｜ Q8 甲 參加獎次數不限
 *    Q9 甲 主持人照固定獎勵表直接發(雲端規則鎖死三級數量)
 *    Q10 甲 用法寶答對照算;法寶每場各一次(🗡️ 刪掉一個錯的、💡 偷偷告訴你答案)
 *    補充:每題最多 20 秒;全員作答完立刻公布並計分;公布時同畫面顯示前五名;音樂音效沿用知識王
 *  ⚠ 本檔由首頁橫幅/GM 選單點擊時才載入(window._lqOpen),開機零負擔。
 *  ⚠ Firestore 走 window._fbDb + 動態 import 同一份 firebase-firestore 模組(與 game_cloud.js 同網址 ⇒ 同一個實體,
 *    serverTimestamp 才能用;game_cloud.js 不必改)。
 *  ⚠ 共用 iPad 防汙染:身分一律 Firebase uid;每 2 秒比對登入者,換人/登出就立刻離房;
 *    獎勵只寫進 gmClassRewards 收件箱,本人登入主動領取才入帳(沿用既有防汙染管線)。
 * ════════════════════════════════════════════════════════════════════ */
(function(){
'use strict';
if(window._LQ && window._LQ._v) return;
var LQ = window._LQ = { _v: 'v5.332.0' };

/* ───────────── 常數 ───────────── */
var FS_URL = 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
var MAX_SEC = 20;                       /* 老師:每題最多 20 秒 */
var SEC_OPTIONS = [10, 15, 20];
var MAX_Q = 30, MIN_Q = 3;
var HEARTBEAT_MS = 10000;              /* ★ v5.318.0 心跳改 10 秒,斷線能更快顯示 */
var AWAY_GRACE_MS = 6000;               /* ★ v5.320.0 學生切走 App 的離線記號持續這麼久才算斷線 */
var OFFLINE_MS = 30000;                 /* ★ v5.320.0 25→30 秒(心跳 10 秒,容許漏 2 次)。主持台這麼久沒收到心跳 ⇒ 視為斷線(不列入「全員作答」);以主持台本機收到時間計,不受學生時鐘影響 */
var LAT_COMP_MS = 3000;                 /* 慢網路補償上限 3 秒 */
var BOARD_DOC = 'live';
var BOARD_TTL = 4 * 3600 * 1000;
var KING_BGM = ['bgm-king-challenge', 'bgm-king-challenge-2'];
var OPT_LETTER = ['A', 'B', 'C', 'D'];
var OPT_CLASS = ['lq-o0', 'lq-o1', 'lq-o2', 'lq-o3'];
/* 老師裁定 Q4 —— ⚠ 數字與 firestore.rules 的 lqHostRewardOk 三組固定表逐字一致,改這裡一定要同步改規則 */
/* ★ v5.318.0(老師 21:56 獎勵修正)— 前 5 名另加 SSR 自選命星＋SR 自選命星各 1;第 6～10 名另加 SSR 虛無的命星 2＋SR 虛無的命星 2;
   第 11 名以後(參加獎)另加 SSR 虛無的命星 1＋SR 虛無的命星 1(老師:「無主的命星就是虛無的命星」;3 顆虛無的命星可在召喚星空「✨ 命星工坊」合成 1 顆同稀有度自選命星)。
   命星沿用 GM 發獎既有格式 reward.cstStars=[{k,n}](_fbCompensatePlayer→_fbCstGrantMany)。
   ⚠ 這三組 reward 與 firestore.rules 的 lqHostRewardOk 逐字一致(含 cstStars 的順序),改一邊一定要同步改另一邊。 */
var TIERS = {
  A: { name: '第 1～5 名', short: '前五名',
       reward: { coins: 100000, coinsMode: 'add', backpack: { summon_crystal: 10, hero_exp_book_premium: 5 },
                 cstStars: [{ k: '#pick_SSR', n: 1 }, { k: '#pick_SR', n: 1 }] },
       mini: '💰10萬・🔮10・📚5・✨SSR自選1・✨SR自選1',
       items: ['💰知識幣×100000', '🔮召喚水晶×10', '📚豪華典藏版經驗之書×5', '✨SSR 自選命星×1', '✨SR 自選命星×1'] },
  B: { name: '第 6～10 名', short: '第6～10名',
       reward: { coins: 60000, coinsMode: 'add', backpack: { summon_crystal: 6, hero_exp_book_premium: 3 },
                 cstStars: [{ k: '#void_SSR', n: 2 }, { k: '#void_SR', n: 2 }] },
       mini: '💰6萬・🔮6・📚3・🌑SSR虛無2・🌑SR虛無2',
       items: ['💰知識幣×60000', '🔮召喚水晶×6', '📚豪華典藏版經驗之書×3', '🌑SSR 虛無的命星×2', '🌑SR 虛無的命星×2'] },
  P: { name: '第 11 名以後(參加獎)', short: '參加獎',
       reward: { coins: 30000, coinsMode: 'add', backpack: { summon_crystal: 3, hero_exp_book_premium: 1 },
                 cstStars: [{ k: '#void_SSR', n: 1 }, { k: '#void_SR', n: 1 }] },
       mini: '💰3萬・🔮3・📚1・🌑SSR虛無1・🌑SR虛無1',
       items: ['💰知識幣×30000', '🔮召喚水晶×3', '📚豪華典藏版經驗之書×1', '🌑SSR 虛無的命星×1', '🌑SR 虛無的命星×1'] }
};
var BASE_PTS = 500, SPEED_PTS = 500, POWER_BONUS_PCT = 5;   /* ★ v5.318.0 計分(老師裁定甲案＋法寶保留加成) */
function fmtPts(n){ return String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
var ADV_GRADES = ['低年級', '中年級', '高年級'];
var ADV_DIFFS = ['沒自信', '普通', '我很會'];

/* ───────────── 小工具 ───────────── */
function cute(){ try{ return (typeof _artStyle === 'undefined') || _artStyle === 'cute'; }catch(_){ return true; } }
function T(c, p){ return cute() ? c : p; }      /* 鐵律 1.232 雙版文字 */
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
function $(id){ return document.getElementById(id); }
function now(){ return Date.now(); }
function pnow(){ return (window.performance && performance.now) ? performance.now() : Date.now(); }
function sfx(id, v){ try{ if(typeof playSfx === 'function') playSfx(id, v == null ? 0.6 : v); }catch(_){} }
/* ───────── ★ v5.318.0 比賽趣味感:音效表 / 震動 / 畫面特效(全部用遊戲既有的音效檔,不新增素材) ───────── */
var SND = {
  join: 'sfx-confirm',            /* 學生加入成功 */
  newPlayer: 'sfx-friend-login',  /* 主持台:有同學進等候室 */
  qStart: 'sfx-gong',             /* 新題目開始 */
  tick: 'sfx-sel',                /* 主持台最後 5 秒倒數 */
  timeUp: 'sfx-powerdown',        /* 時間到 */
  pick: 'sfx-ok',                 /* 學生按下答案 */
  allIn: 'sfx-action-confirm',    /* 全員作答完畢 */
  cut: 'sfx-sword', hint: 'sfx-goddess',
  correct: 'sfx-quiz-correct', wrong: 'sfx-quiz-wrong',
  streak: 'sfx-statup', rankUp: 'sfx-powerup',
  reveal: 'sfx-reward-energy',
  dc: 'sfx-gm-message',           /* 老師:有人斷線播放提醒音效 */
  back: 'sfx-friend-login',
  pod: 'sfx-summon-reveal', champ: 'sfx-medal-unlock', applause: 'sfx-applause', fanfare: 'sfx-level-up',
  coin: 'sfx-coin', thanks: 'sfx-reward-keep'
};
function snd(k, v){ sfx(SND[k] || k, v); }
function muted(){ try{ return typeof _sfxMuted !== 'undefined' && !!_sfxMuted; }catch(_){ return false; } }
/* 震動回饋:手機/Android 平板用 Vibration API;iPad/iPhone 的 Safari 不支援震動 ⇒ 改用畫面震一下(fxShake)當回饋 */
function vib(p){ try{ if(!muted() && navigator.vibrate) navigator.vibrate(p); }catch(_){} }
function fxShake(kind){
  var b = $('lq-body'); if(!b) return;
  var c = kind === 'good' ? 'lq-fx-pulse' : 'lq-fx-shake';
  b.classList.remove('lq-fx-pulse', 'lq-fx-shake'); void b.offsetWidth; b.classList.add(c);
  setTimeout(function(){ b.classList.remove(c); }, 650);
}
function fxLayer(){
  var l = $('lq-fx'); if(l) return l;
  l = document.createElement('div'); l.id = 'lq-fx'; document.body.appendChild(l); return l;
}
/* 彩帶:n 片、dur 毫秒內陸續落下;big=頒獎等級 */
function fxConfetti(n, big){
  try{
    var l = fxLayer(), cols = ['#ffd166', '#ef476f', '#06d6a0', '#118ab2', '#c77dff', '#ffffff', '#ff9f1c'], em = ['⭐', '✨', '🎉', '🏆', '💎'];
    n = Math.min(n || 60, 160);
    for(var i = 0; i < n; i++){
      var d = document.createElement('i');
      var isEm = big && Math.random() < 0.18;
      d.className = 'lq-cf' + (isEm ? ' em' : '');
      if(isEm) d.textContent = em[i % em.length]; else d.style.background = cols[i % cols.length];
      d.style.left = (Math.random() * 100) + 'vw';
      d.style.animationDuration = (2.2 + Math.random() * 2.2) + 's';
      d.style.animationDelay = (Math.random() * (big ? 1.6 : 0.6)) + 's';
      d.style.setProperty('--dx', ((Math.random() - 0.5) * 30) + 'vw');
      d.style.setProperty('--rot', (Math.random() * 1080 - 540) + 'deg');
      l.appendChild(d);
      (function(el){ setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 5200); })(d);
    }
  }catch(_){}
}
/* 大字彈出(+873、3 連對!、名次上升…) */
function fxPop(txt, color){
  try{
    var l = fxLayer(), d = document.createElement('div');
    d.className = 'lq-pop'; d.textContent = txt; if(color) d.style.color = color;
    l.appendChild(d); setTimeout(function(){ if(d.parentNode) d.parentNode.removeChild(d); }, 1700);
  }catch(_){}
}
function fxFlash(color){
  try{
    var l = fxLayer(), d = document.createElement('div');
    d.className = 'lq-flash'; d.style.background = color || 'rgba(255,255,255,.55)';
    l.appendChild(d); setTimeout(function(){ if(d.parentNode) d.parentNode.removeChild(d); }, 700);
  }catch(_){}
}
function fxClear(){ var l = $('lq-fx'); if(l) l.innerHTML = ''; }
/* 頂端大字提醒橫幅(斷線/回來);新的會取代舊的 */
function fxAlert(msg, kind, ms){
  try{
    var l = fxLayer(), d = $('lq-alert');
    if(!d){ d = document.createElement('div'); d.id = 'lq-alert'; l.appendChild(d); }
    d.className = 'lq-alert ' + (kind || '');
    d.textContent = msg; void d.offsetWidth; d.classList.add('on');
    clearTimeout(fxAlert._h); fxAlert._h = setTimeout(function(){ d.classList.remove('on'); }, ms || 4000);
  }catch(_){}
}
function shuffle(a){ var b = a.slice(), i, j, t; for(i = b.length - 1; i > 0; i--){ j = Math.floor(Math.random() * (i + 1)); t = b[i]; b[i] = b[j]; b[j] = t; } return b; }
function fmtSec(ms){ return (Math.round(ms / 100) / 10).toFixed(1); }
function me(){ try{ var u = window._fbUser; if(u && u.uid && String(window._gUserId || '') === u.uid) return u; }catch(_){ } return null; }
function isAdmin(){ try{ return typeof window._isAdminUser === 'function' && window._isAdminUser(); }catch(_){ return false; } }
function myEmail(){ var u = me(); return u ? String(u.email || '').toLowerCase() : ''; }
function myLabel(){
  var u = me(); if(!u) return '';
  var em = String(u.email || '').toLowerCase(), out = '';
  try{
    var e = typeof window._getRosterEntry === 'function' ? window._getRosterEntry(em) : null;
    if(e){
      var code = typeof window._formatRosterLabel === 'function' ? window._formatRosterLabel(e) : '';
      if(e.fullName && /^\d{4}/.test(code)) out = code.slice(0, 4) + e.fullName;
      else out = code;
    }
  }catch(_){}
  if(!out){ try{ out = localStorage.getItem('lxps_nickname_' + u.uid) || ''; }catch(_){} }
  if(!out) out = u.displayName || em.split('@')[0] || '玩家';
  return String(out).slice(0, 24);
}
function myAccount(){ return myEmail().split('@')[0].slice(0, 40); }
function toast(msg, ms){
  var t = $('lq-toast'); if(!t) return;
  t.textContent = msg; t.classList.add('on');
  clearTimeout(toast._h); toast._h = setTimeout(function(){ t.classList.remove('on'); }, ms || 2600);
}
function tsMs(v){ try{ if(!v) return 0; if(typeof v.toMillis === 'function') return v.toMillis(); if(typeof v === 'number') return v; }catch(_){} return 0; }
function bgmKing(){
  try{
    var cur = (typeof _curBgm !== 'undefined') ? _curBgm : '';
    if(KING_BGM.indexOf(cur) >= 0) return;
    var id = KING_BGM[Math.floor(Math.random() * KING_BGM.length)];
    if(typeof bgmFadeTo === 'function') bgmFadeTo(id, 500); else if(typeof bgmPlay === 'function') bgmPlay(id);
  }catch(_){}
}
function bgmBack(){
  try{
    var cur = (typeof _curBgm !== 'undefined') ? _curBgm : '';
    if(KING_BGM.indexOf(cur) < 0 && cur !== 'bgm-win') return;
    if(typeof bgmPlayMenu === 'function') bgmPlayMenu(); else if(typeof bgmStop === 'function') bgmStop();
  }catch(_){}
}
/* ★ v5.318.0 遊戲結束音樂:沿用冒險模式勝利曲 bgm-win(播一次,不循環) */
function bgmWin(){
  try{
    var cur = (typeof _curBgm !== 'undefined') ? _curBgm : '';
    if(cur === 'bgm-win') return;
    if(typeof bgmFadeTo === 'function') bgmFadeTo('bgm-win', 600); else if(typeof bgmPlay === 'function') bgmPlay('bgm-win');
  }catch(_){}
}

/* ───────────── Firestore ───────────── */
var F = null;
async function fs(){
  if(F) return F;
  if(!window._fbDb) throw new Error(T('雲端還沒準備好,等一下再試', '雲端模組尚未就緒'));
  var m = await import(FS_URL);
  if(!m || !m.serverTimestamp) throw new Error('雲端模組載入失敗');
  F = m; return F;
}
function db(){ return window._fbDb; }
/* ★ v5.320.0 老師回報「同步沒有即時、學生一直斷線又連線」— 根因之一:即時監聽一出錯(網路斷線、權限暫時失敗)就永久停止,
   原本錯誤處理是空函式 ⇒ 之後畫面再也不會更新。改成出錯自動重新監聽(1→2→4→8 秒),回傳的函式可取消。 */
function live(ref, opts, onNext){
  var dead = false, un = null, tries = 0, tm = null;
  function go(){
    if(dead) return;
    try{
      un = F.onSnapshot(ref, opts || {}, function(s){ tries = 0; try{ onNext(s); }catch(e){ try{ console.warn('[LQ] snapshot handler', e); }catch(_){} } },
        function(err){
          try{ console.warn('[LQ] 監聽中斷,自動重連', err && (err.code || err.message)); }catch(_){}
          try{ if(un) un(); }catch(_){} un = null;
          if(dead) return;
          tm = setTimeout(go, Math.min(8000, 1000 * Math.pow(2, tries++)));
        });
    }catch(_){ tm = setTimeout(go, 3000); }
  }
  go();
  return function(){ dead = true; if(tm) clearTimeout(tm); try{ if(un) un(); }catch(_){} };
}
/* ═════════════════════════════════════════════════════════════════
 * ★ v5.332.0(2026-11-03・老師「有許多學生沒有成功輸入到答案,就卡在『本題未作答』的畫面,無法繼續進到下一個題目畫面。
 *   請檢查並修正,讓網速慢或斷線的學生也能順利的接續遊玩」)
 *   根因:iPad 在學校 wifi 塞車時,Firestore 的即時連線常常「卡住但不報錯」——
 *     ① 房間監聽不再收到新狀態、也不觸發錯誤 ⇒ v5.320.0 的自動重新監聽不會啟動,學生永遠停在上一題的公布畫面;
 *     ② setDoc 送作答時,連線卡住的 Promise 不會失敗也不會成功 ⇒ v5.323.0 的自動重送迴圈根本跑不到,
 *        直到超時才清掉答案 ⇒「本題未作答」;心跳也一樣卡住 ⇒ 主持台把他看成斷線。
 *   修法(學生端,不需改雲端規則):走一條「跟 SDK 長連線無關」的備援通道 —— Firestore REST(一般 HTTPS 請求,用同一個登入憑證,
 *     雲端規則照樣檢查):
 *     甲 房間看門狗:房間文件安靜太久就用 REST 讀一次;雲端進度比畫面新 ⇒ 直接用雲端那份畫下一題/公布/結束,並重接 SDK 監聽,
 *        連續卡住就讓 SDK 斷網重連一次(30 秒最多一次)。
 *     乙 作答雙通道:SDK 2.5 秒沒回應 ⇒ 同時用 REST 送同一筆答案(文件 id 固定、只能建立一次,不會重複計分);
 *        被擋時讀回自己的作答確認是不是其實已經送到。
 *     丙 心跳備援:SDK 心跳 5 秒沒回應 ⇒ 用 REST 補送 lastSeen,主持台不會誤判斷線而不等他作答。
 *   房間監聽收到「比畫面還舊」的狀態一律忽略(避免卡住的連線事後吐出舊資料把畫面倒回去)。
 * ═════════════════════════════════════════════════════════════════ */
function roomStage(r){
  try{
    if(!r || !r.meta) return -1;
    var st = r.meta.status, q = (r.current && typeof r.current.qIndex === 'number') ? r.current.qIndex : -1;
    if(st === 'ended') return 1e6 + (r.final ? 2 : 0) + (r.meta.cleared ? 1 : 0);
    if(st === 'question') return 10 + q * 4;
    if(st === 'reveal') return 10 + q * 4 + ((r.reveal && r.reveal.qIndex === q) ? 2 : 1);
    return 0;
  }catch(_){ return -1; }
}
function restProject(){ var p = ''; try{ p = db().app.options.projectId; }catch(_){} return p || 'lxpsgame'; }
function restDocName(path){ return 'projects/' + restProject() + '/databases/(default)/documents/' + path; }
function restUrl(path){ return 'https://firestore.googleapis.com/v1/' + restDocName(path); }
function restVal(v){
  if(!v || typeof v !== 'object') return null;
  if('nullValue' in v) return null;
  if('booleanValue' in v) return !!v.booleanValue;
  if('integerValue' in v) return Number(v.integerValue);
  if('doubleValue' in v) return Number(v.doubleValue);
  if('stringValue' in v) return v.stringValue;
  if('timestampValue' in v){ var t = Date.parse(v.timestampValue); return isNaN(t) ? 0 : t; }   /* tsMs() 收數字 */
  if('mapValue' in v) return restFields((v.mapValue || {}).fields);
  if('arrayValue' in v) return ((v.arrayValue || {}).values || []).map(restVal);
  if('referenceValue' in v) return v.referenceValue;
  return null;
}
function restFields(f){ var o = {}; Object.keys(f || {}).forEach(function(k){ o[k] = restVal(f[k]); }); return o; }
function restFetch(url, opt, ms){
  return new Promise(function(resolve, reject){
    var u = me();
    if(!u || typeof u.getIdToken !== 'function'){ reject(new Error('no-auth')); return; }
    var ctl = null; try{ ctl = new AbortController(); }catch(_){}
    var tm = setTimeout(function(){ try{ if(ctl) ctl.abort(); }catch(_){} reject(new Error('timeout')); }, ms || 6000);
    u.getIdToken().then(function(tok){
      var o = { method: opt.method || 'GET', headers: { 'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json' }, cache: 'no-store' };
      if(opt.body) o.body = JSON.stringify(opt.body);
      if(ctl) o.signal = ctl.signal;
      return fetch(url, o);
    }).then(function(res){
      return res.text().then(function(txt){ var j = null; try{ j = txt ? JSON.parse(txt) : null; }catch(_){} clearTimeout(tm); resolve({ status: res.status, json: j }); });
    }).catch(function(e){ clearTimeout(tm); reject(e); });
  });
}
/* 讀房間:回傳房間資料(跟 SDK 的 s.data() 同形狀,時間欄位換成毫秒數字);房間不存在回 null */
function restGetRoom(pin){
  return restFetch(restUrl('liveQuizRooms/' + pin), {}, 6000).then(function(r){
    if(r.status === 404) return null;
    if(r.status !== 200 || !r.json) throw new Error('http ' + r.status);
    return restFields(r.json.fields);
  });
}
/* 讀自己這題的作答文件是否已在雲端(規則允許本人讀自己的作答) */
function restMine(pin, uid, q){
  return restFetch(restUrl('liveQuizRooms/' + pin + '/answers/' + uid + '_' + q), {}, 5000)
    .then(function(r){ return r.status === 200; }).catch(function(){ return false; });
}
/* 送作答:'ok' 已建立 | 'exists' 已經有了 | 'denied' 被規則擋(可能已存在或逾時) | 'net' 網路失敗 */
function restAnswer(pin, uid, q, c, ms){
  var body = { writes: [{
    update: { name: restDocName('liveQuizRooms/' + pin + '/answers/' + uid + '_' + q),
              fields: { uid: { stringValue: uid }, q: { integerValue: String(q) }, c: { integerValue: String(c) }, ms: { integerValue: String(Math.round(ms)) } } },
    updateTransforms: [{ fieldPath: 'at', setToServerValue: 'REQUEST_TIME' }],
    currentDocument: { exists: false }
  }] };
  return restFetch('https://firestore.googleapis.com/v1/projects/' + restProject() + '/databases/(default)/documents:commit', { method: 'POST', body: body }, 7000)
    .then(function(r){
      if(r.status === 200) return 'ok';
      var st = (r.json && r.json.error && r.json.error.status) || '';
      if(r.status === 409 || st === 'ALREADY_EXISTS' || st === 'FAILED_PRECONDITION') return 'exists';
      if(r.status === 403 || st === 'PERMISSION_DENIED') return 'denied';
      return 'net';
    }).catch(function(){ return 'net'; });
}
/* 心跳備援:只改 lastSeen(規則允許本人只改這個欄位) */
function restBeat(pin, uid){
  return restFetch(restUrl('liveQuizRooms/' + pin + '/players/' + uid) + '?updateMask.fieldPaths=lastSeen&currentDocument.exists=true',
    { method: 'PATCH', body: { fields: { lastSeen: { integerValue: String(now()) } } } }, 6000)
    .then(function(r){ return r.status === 200; }).catch(function(){ return false; });
}
/* SDK 長連線卡住 ⇒ 讓 SDK 斷網再重連一次(排隊中的寫入不會遺失);30 秒最多一次 */
function sdkKick(why){
  if(!F || typeof F.disableNetwork !== 'function' || typeof F.enableNetwork !== 'function') return;
  if(now() - (ST.kickAt || 0) < 30000) return;
  ST.kickAt = now();
  try{ console.warn('[LQ] 雲端連線卡住,重新連線(' + why + ')'); }catch(_){}
  var d = db();
  F.disableNetwork(d).catch(function(){}).then(function(){ return F.enableNetwork(d); }).catch(function(){
    setTimeout(function(){ try{ F.enableNetwork(d).catch(function(){}); }catch(_){} }, 1500);
  });
}
function roomRef(pin){ return F.doc(db(), 'liveQuizRooms', pin); }
function sub(pin, col, id){ return F.doc(db(), 'liveQuizRooms', pin, col, id); }
function subCol(pin, col){ return F.collection(db(), 'liveQuizRooms', pin, col); }

/* 主持人資格:GM 或 GM 匯入的主持人名單 */
var _hostCache = {};
async function amHost(){
  var u = me(); if(!u) return false;
  if(isAdmin()) return true;
  if(_hostCache[u.uid] != null) return _hostCache[u.uid];
  try{
    await fs();
    var s = await F.getDoc(F.doc(db(), 'liveQuizHosts', myEmail()));
    _hostCache[u.uid] = s.exists();
  }catch(_){ _hostCache[u.uid] = false; }
  return _hostCache[u.uid];
}

/* ───────────── 版面 ───────────── */
var CSS = [
'#lq-root{position:fixed;inset:0;z-index:99990;background:radial-gradient(ellipse at 50% 0%,#20407a 0%,#0c1a33 60%,#070f20 100%);color:#fff;',
'  font-family:"Noto Sans TC","PingFang TC","M PLUS Rounded 1c",sans-serif;display:flex;flex-direction:column;overflow:hidden;-webkit-user-select:none;user-select:none;',
'  --u:min(1vw,1.7vh);touch-action:manipulation;}',
'#lq-root *{box-sizing:border-box;}',
'#lq-root button{font-family:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent;}',
'.lq-top{flex:0 0 auto;display:flex;align-items:center;gap:10px;padding:8px 14px;background:rgba(0,0,0,.35);border-bottom:2px solid rgba(255,209,102,.35);min-height:52px;}',
'.lq-top .lq-ttl{font-weight:900;font-size:clamp(17px,calc(var(--u)*2.2),28px);color:#ffd166;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1 1 auto;}',
'.lq-top .lq-chip{flex:0 0 auto;font-weight:800;font-size:clamp(14px,calc(var(--u)*1.7),22px);background:rgba(255,255,255,.12);border-radius:999px;padding:4px 12px;white-space:nowrap;}',
'.lq-x{flex:0 0 auto;width:44px;height:44px;border-radius:12px;border:2px solid rgba(255,255,255,.4);background:rgba(255,255,255,.08);color:#fff;font-size:22px;font-weight:900;}',
'.lq-body{flex:1 1 auto;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:14px;display:flex;flex-direction:column;align-items:center;}',
'.lq-card{width:min(96%,980px);background:rgba(10,25,50,.78);border:2px solid rgba(120,180,255,.45);border-radius:20px;padding:16px 18px;box-shadow:0 8px 30px rgba(0,0,0,.45);}',
'.lq-h1{font-size:clamp(22px,calc(var(--u)*3.2),44px);font-weight:900;text-align:center;margin:6px 0 10px;}',
'.lq-p{font-size:clamp(15px,calc(var(--u)*1.9),24px);line-height:1.6;text-align:center;opacity:.92;}',
'.lq-btn{border:none;border-radius:14px;padding:12px 22px;font-weight:900;font-size:clamp(16px,calc(var(--u)*2),26px);color:#fff;',
'  background:linear-gradient(135deg,#2e8bff,#1a5fd0);box-shadow:0 4px 0 rgba(0,0,0,.35);}',
'.lq-btn:active{transform:translateY(3px);box-shadow:0 1px 0 rgba(0,0,0,.35);}',
'.lq-btn.gold{background:linear-gradient(135deg,#ffcc4d,#e09a12);color:#3a2400;}',
'.lq-btn.green{background:linear-gradient(135deg,#34c77b,#1e9256);}',
'.lq-btn.red{background:linear-gradient(135deg,#ff6b6b,#c93a3a);}',
'.lq-btn.gray{background:rgba(255,255,255,.16);}',
'.lq-btn[disabled]{opacity:.45;pointer-events:none;}',
'.lq-row{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;align-items:center;margin-top:12px;}',
/* 房號輸入 */
'.lq-pin{display:flex;gap:8px;justify-content:center;margin:10px 0 14px;}',
'.lq-pin span{width:clamp(38px,calc(var(--u)*6.5),70px);height:clamp(50px,calc(var(--u)*8.5),90px);border-radius:12px;background:#fff;color:#123;',
'  font-size:clamp(28px,calc(var(--u)*5.2),56px);font-weight:900;display:flex;align-items:center;justify-content:center;box-shadow:inset 0 -4px 0 rgba(0,0,0,.15);}',
'.lq-pin span.cur{outline:4px solid #ffd166;}',
'.lq-pad{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:min(100%,420px);margin:0 auto;}',
'.lq-join{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:12px 28px;}',
'.lq-join-l{flex:1 1 300px;min-width:0;}',
'.lq-join .lq-pad{flex:0 1 420px;margin:0;}',
'.lq-pad button{height:clamp(46px,calc(var(--u)*7),78px);border-radius:12px;border:2px solid rgba(255,255,255,.35);background:rgba(255,255,255,.1);color:#fff;',
'  font-size:clamp(22px,calc(var(--u)*3.4),36px);font-weight:900;}',
'.lq-pad button:active{background:rgba(255,209,102,.35);}',
/* 題目與選項 */
'.lq-q{width:min(98%,1200px);font-size:clamp(19px,calc(var(--u)*3.1),46px);font-weight:900;line-height:1.45;text-align:center;',
'  background:rgba(255,255,255,.95);color:#13213a;border-radius:18px;padding:clamp(10px,calc(var(--u)*1.6),22px) clamp(12px,calc(var(--u)*2.2),30px);',
'  box-shadow:0 6px 0 rgba(0,0,0,.3);word-break:break-word;}',
'.lq-opts{width:min(98%,1200px);display:grid;grid-template-columns:1fr 1fr;gap:clamp(8px,calc(var(--u)*1.2),16px);margin-top:clamp(10px,calc(var(--u)*1.4),18px);}',
'.lq-opt{position:relative;display:flex;align-items:center;gap:10px;min-height:clamp(58px,15vh,150px);border-radius:16px;border:none;padding:10px 14px;color:#fff;',
'  font-size:clamp(17px,calc(var(--u)*2.5),36px);font-weight:900;text-align:left;line-height:1.3;box-shadow:0 5px 0 rgba(0,0,0,.35);word-break:break-word;}',
'.lq-opt b{flex:0 0 auto;width:clamp(32px,calc(var(--u)*4.6),56px);height:clamp(32px,calc(var(--u)*4.6),56px);border-radius:50%;background:rgba(255,255,255,.28);',
'  display:flex;align-items:center;justify-content:center;font-size:.9em;}',
'.lq-opt span{flex:1 1 auto;}',
'.lq-o0{background:linear-gradient(135deg,#ef5a64,#c43846);}',
'.lq-o1{background:linear-gradient(135deg,#3f8efc,#2463c9);}',
'.lq-o2{background:linear-gradient(135deg,#f6b92b,#d68c06);color:#2b1a00;}',
'.lq-o3{background:linear-gradient(135deg,#33c47e,#1c8f55);}',
'.lq-opt.dim{opacity:.22;filter:grayscale(1);}',
'.lq-opt.cut{opacity:.18;filter:grayscale(1);pointer-events:none;}',
'.lq-opt.cut::after{content:"✂";position:absolute;right:12px;top:8px;font-size:1.1em;}',
'.lq-opt.pick{outline:5px solid #fff;outline-offset:-5px;}',
'.lq-opt.hint{animation:lqGlow 0.9s ease-in-out infinite alternate;}',
'.lq-opt.right{outline:6px solid #fff;outline-offset:-6px;}',
'.lq-opt.right::after{content:"✔";position:absolute;right:14px;top:6px;font-size:1.3em;}',
'.lq-opt .lq-bar{position:absolute;left:0;bottom:0;height:7px;border-radius:0 0 0 16px;background:rgba(255,255,255,.75);}',
'.lq-opt .lq-cnt{flex:0 0 auto;font-size:.85em;background:rgba(0,0,0,.25);border-radius:999px;padding:2px 10px;}',
'@keyframes lqGlow{from{box-shadow:0 0 0 0 rgba(255,255,140,.9),0 5px 0 rgba(0,0,0,.35);}to{box-shadow:0 0 30px 10px rgba(255,255,140,.95),0 5px 0 rgba(0,0,0,.35);}}',
'.lq-hintflag{position:absolute;left:50%;top:-14px;transform:translateX(-50%);background:#fff7a8;color:#5a3d00;border-radius:999px;padding:2px 12px;font-size:.6em;white-space:nowrap;}',
'.lq-pw{display:flex;gap:10px;justify-content:center;margin-top:clamp(8px,calc(var(--u)*1.2),14px);flex-wrap:wrap;}',
'.lq-pw button{border-radius:999px;border:2px solid rgba(255,230,150,.7);background:rgba(255,210,90,.18);color:#ffe9a8;font-weight:900;',
'  font-size:clamp(14px,calc(var(--u)*1.8),22px);padding:7px 16px;}',
'.lq-pw button[disabled]{opacity:.35;border-color:rgba(255,255,255,.3);color:#bbb;background:transparent;}',
/* 倒數 */
'.lq-timer{font-variant-numeric:tabular-nums;}',
'.lq-timer.warn{color:#ff8080;}',
/* 結果 */
'.lq-big{font-size:clamp(42px,calc(var(--u)*9),110px);font-weight:900;text-align:center;line-height:1.1;}',
'.lq-ok{color:#7dffb0;text-shadow:0 0 22px rgba(80,255,150,.6);}',
'.lq-ng{color:#ff9d9d;}',
'.lq-top5{width:min(96%,720px);margin:10px auto 0;}',
'.lq-top5 .r{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.1);border-radius:12px;padding:7px 12px;margin:6px 0;',
'  font-size:clamp(15px,calc(var(--u)*2),26px);font-weight:800;animation:lqIn .35s ease-out both;}',
'.lq-top5 .r .n{flex:0 0 auto;width:1.8em;text-align:center;font-size:1.15em;}',
'.lq-top5 .r .nm{flex:1 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
'.lq-top5 .r .sc{flex:0 0 auto;color:#ffd166;}',
'.lq-top5 .r.mine{background:rgba(255,209,102,.3);outline:2px solid #ffd166;}',
/* ★ v5.323.0 乙 比賽專心模式:背後的遊戲本體不繪製、動畫暫停 */
'body.lq-focus #_gc_wrapper{visibility:hidden !important;}',
'body.lq-focus #_gc_wrapper *{animation-play-state:paused !important;}',
/* ★ v5.323.0 甲 連線診斷表 */
'.lq-diag{width:100%;border-collapse:collapse;font-size:clamp(12px,1.5vmin,15px);}',
'.lq-diag th,.lq-diag td{padding:4px 6px;border-bottom:1px solid rgba(255,255,255,.12);text-align:center;white-space:nowrap;}',
'.lq-diag th{position:sticky;top:0;background:#17364b;color:#ffd166;}',
'.lq-diag td.nm{text-align:left;white-space:normal;}',
/* ★ v5.321.0 老師:主持台公布畫面右側前五名看不到完整班級座號 ⇒ 側欄字體縮小、名字可換行不再被「…」截掉,分數改排在名字下一行 */
'.lq-hside .lq-top5{width:100%;margin-top:0;}',
'.lq-hside .lq-top5 .r{flex-wrap:wrap;gap:2px 8px;padding:6px 10px;font-size:clamp(14px,calc(var(--u)*1.7),24px);}',
'.lq-hside .lq-top5 .r .n{width:1.5em;}',
'.lq-hside .lq-top5 .r .nm{flex:1 1 0;min-width:0;white-space:normal;overflow:visible;text-overflow:clip;overflow-wrap:anywhere;line-height:1.25;}',
'.lq-hside .lq-top5 .r .sc{flex:1 0 100%;padding-left:calc(1.5em + 8px);font-size:.85em;line-height:1.25;}',
'@keyframes lqIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}',
/* 主持台 */
'.lq-hgrid{width:100%;display:flex;gap:14px;align-items:stretch;flex:1 1 auto;min-height:0;}',
'.lq-hmain{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;min-width:0;}',
'.lq-hside{flex:0 0 clamp(170px,22vw,320px);display:flex;flex-direction:column;gap:10px;}',
'.lq-stat{background:rgba(0,0,0,.35);border-radius:16px;padding:10px;text-align:center;}',
'.lq-stat .v{font-size:clamp(34px,calc(var(--u)*6),84px);font-weight:900;line-height:1.05;}',
'.lq-stat .k{font-size:clamp(13px,calc(var(--u)*1.5),19px);opacity:.8;}',
'.lq-ctl{flex:0 0 auto;display:flex;flex-wrap:wrap;gap:8px;justify-content:center;padding:8px 12px;background:rgba(0,0,0,.4);border-top:2px solid rgba(255,209,102,.3);}',
'.lq-ctl .lq-btn{padding:9px 16px;font-size:clamp(14px,calc(var(--u)*1.7),20px);}',
'.lq-bigpin{font-size:clamp(54px,calc(var(--u)*13),170px);font-weight:900;letter-spacing:.12em;color:#ffd166;text-shadow:0 6px 0 rgba(0,0,0,.35);text-align:center;line-height:1;}',
'.lq-wall{width:min(98%,1300px);display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:12px;}',
'.lq-tag{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.12);border:1.5px solid rgba(255,255,255,.3);border-radius:12px;padding:6px 10px;',
'  font-size:clamp(14px,calc(var(--u)*1.7),22px);font-weight:800;animation:lqIn .3s ease-out both;}',
'.lq-tag small{font-weight:600;opacity:.7;font-size:.75em;}',
'.lq-tag .k{border:none;background:rgba(255,80,80,.3);color:#fff;border-radius:8px;width:28px;height:28px;font-weight:900;}',
'.lq-tag.off{opacity:.45;}',
'.lq-tag .pw{font-size:.9em;}',
/* ★ v5.318.0 應到名單座號格:暗=未到、亮=已加入、橘=斷線、灰虛線=請假 */
'.lq-tag.lq-rs.no{background:rgba(0,0,0,.35);border-color:rgba(255,255,255,.15);color:rgba(255,255,255,.38);cursor:pointer;animation:none;}',
'.lq-tag.lq-rs.in{background:linear-gradient(180deg,#4fe08a,#22a85b);border-color:#b6ffd2;color:#fff;box-shadow:0 0 10px rgba(80,255,150,.55);}',
'.lq-tag.lq-rs.dc{opacity:1;background:rgba(255,150,40,.35);border-color:#ffb35c;color:#ffe2bf;animation:lqBlink 1.2s ease-in-out infinite;}',
'.lq-tag.lq-rs.lv{background:rgba(120,120,140,.3);border:1.5px dashed rgba(255,255,255,.35);color:rgba(255,255,255,.55);cursor:pointer;text-decoration:line-through;animation:none;}',
'.lq-tag.lq-rs.lv small{text-decoration:none;display:inline-block;}',
'.lq-tag.lq-rs.kicked{opacity:.35;animation:none;}',
'.lq-tag.lq-rs.me{outline:3px solid #ffd166;outline-offset:2px;}',
'.lq-chip[data-warn]{background:rgba(255,140,40,.45);border-color:#ffb35c;}',
'@keyframes lqBlink{50%{box-shadow:0 0 12px rgba(255,170,60,.8);}}',
'.lq-noanim .lq-tag{animation:none;}.lq-noanim .lq-tag.lq-rs.dc{animation:lqBlink 1.2s ease-in-out infinite;}',
'.lq-cls{display:flex;flex-wrap:wrap;gap:6px;}',
'.lq-cls label{display:flex;align-items:center;gap:4px;background:rgba(255,255,255,.1);border:1.5px solid rgba(255,255,255,.25);border-radius:10px;padding:4px 10px;font-weight:800;cursor:pointer;}',
'.lq-cls label.on{background:rgba(255,209,102,.3);border-color:#ffd166;}',
'.lq-form{width:min(98%,1100px);display:grid;gap:12px;}',
'.lq-fs{background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.18);border-radius:14px;padding:10px 12px;}',
'.lq-fs h3{margin:0 0 8px;font-size:clamp(16px,calc(var(--u)*2),24px);color:#ffd166;}',
'.lq-fs label{display:inline-flex;align-items:center;gap:6px;margin:4px 10px 4px 0;font-size:clamp(14px,calc(var(--u)*1.6),19px);}',
'.lq-fs input[type=text],.lq-fs select,.lq-fs textarea{font-family:inherit;font-size:16px;border-radius:10px;border:1.5px solid rgba(255,255,255,.35);',
'  background:rgba(0,0,0,.35);color:#fff;padding:8px 10px;}',
'.lq-fs textarea{width:100%;min-height:120px;}',
'.lq-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;}',
'.lq-tabs button{border-radius:10px;border:1.5px solid rgba(255,255,255,.35);background:rgba(255,255,255,.08);color:#fff;font-weight:800;padding:7px 12px;font-size:15px;}',
'.lq-tabs button.on{background:#ffd166;color:#3a2400;border-color:#ffd166;}',
'.lq-qlist{max-height:40vh;overflow-y:auto;}',
'.lq-qi{display:flex;gap:8px;align-items:flex-start;padding:6px 4px;border-bottom:1px dashed rgba(255,255,255,.15);font-size:15px;}',
'.lq-qi .no{flex:0 0 2.2em;color:#ffd166;font-weight:900;}',
'.lq-qi .tx{flex:1 1 auto;}',
'.lq-qi .tx small{display:block;opacity:.65;}',
'.lq-qi button{flex:0 0 auto;border:none;border-radius:8px;background:rgba(255,80,80,.35);color:#fff;font-weight:900;width:30px;height:30px;}',
'.lq-table{width:min(98%,1000px);border-collapse:collapse;margin-top:10px;font-size:clamp(14px,calc(var(--u)*1.6),20px);}',
'.lq-table th,.lq-table td{padding:6px 8px;border-bottom:1px solid rgba(255,255,255,.12);text-align:center;}',
'.lq-table td.nm{text-align:left;}',
'.lq-table tr.ne td{opacity:.5;}',
'.lq-badge{display:inline-block;border-radius:999px;padding:1px 9px;font-weight:900;font-size:.85em;}',
'.lq-dbtn{border:1.5px solid rgba(255,255,255,.4);background:rgba(255,255,255,.1);color:#fff;border-radius:8px;padding:3px 9px;font-size:16px;cursor:pointer;font-family:inherit;}',
'.lq-rules{flex:0 0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,400px),1fr));gap:10px;width:min(98%,1600px);}',
'.lq-rules .lq-fs{font-size:clamp(14px,calc(var(--u)*1.75),24px);line-height:1.55;padding:8px 12px;}',
'.lq-rules .lq-fs h3{font-size:clamp(17px,calc(var(--u)*2.2),30px);margin-bottom:4px;}',
'.lq-rwall{flex:0 0 auto;width:min(98%,1600px);display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:6px 0 10px;max-height:max(96px,24vh);overflow-y:auto;}',
'.lq-rwall .lq-tag{font-size:clamp(13px,calc(var(--u)*1.5),20px);padding:4px 8px;}',
'.lq-badge.A{background:#ffd166;color:#3a2400;}.lq-badge.B{background:#9ad0ff;color:#06264a;}.lq-badge.P{background:rgba(255,255,255,.25);}',
/* ★ v5.318.0 特效層 */
'#lq-fx{position:fixed;inset:0;z-index:99992;pointer-events:none;overflow:hidden;}',
'.lq-cf{position:absolute;top:-4vh;width:10px;height:16px;border-radius:2px;opacity:.95;animation:lqFall linear both;}',
'.lq-cf.em{width:auto;height:auto;background:none;font-size:clamp(18px,3.2vmin,34px);font-style:normal;}',
'@keyframes lqFall{0%{transform:translate(0,0) rotate(0);}100%{transform:translate(var(--dx),110vh) rotate(var(--rot));opacity:.9;}}',
'.lq-pop{position:absolute;left:50%;top:42%;transform:translate(-50%,-50%);font-family:"Noto Sans TC",sans-serif;font-weight:900;white-space:nowrap;',
'  font-size:clamp(30px,7vmin,88px);color:#ffd166;text-shadow:0 5px 0 rgba(0,0,0,.4),0 0 24px rgba(255,220,120,.7);animation:lqPop 1.6s ease-out both;}',
'@keyframes lqPop{0%{opacity:0;transform:translate(-50%,-30%) scale(.4);}18%{opacity:1;transform:translate(-50%,-50%) scale(1.15);}30%{transform:translate(-50%,-50%) scale(1);}80%{opacity:1;}100%{opacity:0;transform:translate(-50%,-90%) scale(1);}}',
'.lq-flash{position:absolute;inset:0;animation:lqFlash .6s ease-out both;}',
'.lq-alert{position:absolute;left:50%;top:calc(env(safe-area-inset-top,0px) + 68px);transform:translate(-50%,-20px);opacity:0;transition:opacity .25s,transform .25s;max-width:94vw;',
'  padding:10px 26px;border-radius:16px;font-family:"Noto Sans TC",sans-serif;font-weight:900;font-size:clamp(18px,3.4vmin,40px);text-align:center;color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.45);}',
'.lq-alert.on{opacity:1;transform:translate(-50%,0);}',
'.lq-alert.dc{background:linear-gradient(90deg,#d9480f,#f08c00);border:3px solid #ffd8a8;animation:lqBlink 1s ease-in-out 3;}',
'.lq-alert.back{background:linear-gradient(90deg,#2b8a3e,#37b24d);border:3px solid #b2f2bb;}',
'@keyframes lqFlash{from{opacity:1;}to{opacity:0;}}',
'.lq-fx-shake{animation:lqShake .5s ease-in-out;}',
'@keyframes lqShake{0%,100%{transform:none;}20%{transform:translateX(-12px);}40%{transform:translateX(10px);}60%{transform:translateX(-7px);}80%{transform:translateX(4px);}}',
'.lq-fx-pulse{animation:lqPulse .55s ease-out;}',
'@keyframes lqPulse{0%{transform:scale(1);}35%{transform:scale(1.035);}100%{transform:scale(1);}}',
'.lq-qin{animation:lqQin .55s cubic-bezier(.2,1.4,.4,1) both;}',
'@keyframes lqQin{from{opacity:0;transform:scale(.6);}to{opacity:1;transform:none;}}',
'.lq-timer.warn{animation:lqTk .5s ease-out;}',
'@keyframes lqTk{0%{transform:scale(1.5);}100%{transform:scale(1);}}',
'.lq-streak{display:inline-block;margin-top:6px;padding:3px 14px;border-radius:999px;background:linear-gradient(90deg,#ff7a18,#ffd166);color:#3a1600;font-weight:900;animation:lqQin .5s both;}',
/* 結算名單 */
'.lq-final{width:min(98%,1100px);}',
'.lq-final td.cd{font-weight:900;color:#ffd166;letter-spacing:.04em;}',
'.lq-final td.rw{text-align:left;font-size:.88em;line-height:1.45;}',
'.lq-final tr.top td{background:rgba(255,209,102,.12);}',
'.lq-final tr.mine td{background:rgba(80,255,150,.18);}',
'.lq-final tr{animation:lqIn .35s ease-out both;}',
/* 班級排行榜 */
'.lq-bar{height:14px;border-radius:7px;background:linear-gradient(90deg,#06d6a0,#ffd166);min-width:2px;}',
'.lq-barw{background:rgba(255,255,255,.1);border-radius:7px;width:100%;min-width:80px;}',
'.lq-clsrow{cursor:pointer;}.lq-clsrow:hover td{background:rgba(255,255,255,.08);}',
/* 頒獎台 */
'.lq-podium{display:flex;align-items:flex-end;justify-content:center;gap:clamp(8px,2vw,30px);margin:10px 0 6px;min-height:clamp(170px,38vh,420px);}',
'.lq-pod{display:flex;flex-direction:column;align-items:center;width:clamp(100px,20vw,260px);opacity:0;animation:lqUp .7s cubic-bezier(.2,1.4,.4,1) forwards;}',
'.lq-pod .who{font-size:clamp(15px,calc(var(--u)*2.2),30px);font-weight:900;text-align:center;margin-bottom:6px;word-break:break-all;}',
'.lq-pod .who small{display:block;font-size:.7em;color:#ffd166;}',
'.lq-pod .blk{width:100%;border-radius:14px 14px 0 0;display:flex;align-items:flex-start;justify-content:center;padding-top:8px;',
'  font-size:clamp(30px,calc(var(--u)*6),80px);font-weight:900;box-shadow:inset 0 -10px 0 rgba(0,0,0,.2);}',
'.lq-pod.p1 .blk{height:clamp(110px,24vh,260px);background:linear-gradient(#ffd75e,#e0a419);color:#5a3d00;}',
'.lq-pod.p2 .blk{height:clamp(80px,17vh,190px);background:linear-gradient(#e6eef8,#a9b8cc);color:#2a3646;}',
'.lq-pod.p3 .blk{height:clamp(60px,12vh,140px);background:linear-gradient(#f2b27a,#c27a3c);color:#4a2400;}',
'@keyframes lqUp{from{opacity:0;transform:translateY(60px) scale(.8);}to{opacity:1;transform:none;}}',
'#lq-toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%) translateY(30px);opacity:0;z-index:99995;background:rgba(20,20,30,.94);color:#fff;',
'  border:2px solid #ffd166;border-radius:14px;padding:10px 18px;font-weight:800;font-size:17px;transition:all .25s;pointer-events:none;max-width:92vw;text-align:center;}',
'#lq-toast.on{opacity:1;transform:translateX(-50%) translateY(0);}',
'.lq-modal{position:fixed;inset:0;z-index:99993;background:rgba(0,0,0,.6);display:flex;align-items:safe center;justify-content:center;padding:14px;}',
'.lq-modal > div{width:min(94vw,640px);max-height:min(92dvh,92vh);overflow-y:auto;box-sizing:border-box;background:linear-gradient(160deg,#0f2a3c,#17364b);',
'  border:3px solid #5fb3d9;border-radius:20px;padding:18px 20px;color:#fff;font-family:"Noto Sans TC","PingFang TC","M PLUS Rounded 1c",sans-serif;}',
'.lq-modal *{box-sizing:border-box;}',
'.lq-modal button{font-family:inherit;cursor:pointer;}',
/* 平板/電腦:主持台側欄;手機橫向:縮小、側欄移到下方 */
'@media (max-width:900px){.lq-hgrid{flex-direction:column;}.lq-hside{flex:0 0 auto;flex-direction:row;}.lq-hside .lq-stat{flex:1 1 0;}}',
'@media (orientation:landscape) and (max-height:520px){',
'  .lq-top{min-height:40px;padding:4px 10px;}.lq-x{width:36px;height:36px;font-size:18px;}',
'  .lq-body{padding:6px 10px;}',
'  .lq-q{font-size:clamp(15px,4.4vh,22px);padding:6px 12px;border-radius:12px;}',
'  .lq-opts{margin-top:6px;gap:6px;}',
'  .lq-opt{min-height:clamp(46px,19vh,84px);font-size:clamp(14px,4.4vh,20px);padding:6px 10px;border-radius:12px;}',
'  .lq-opt b{width:28px;height:28px;}',
'  .lq-pw{margin-top:6px;}.lq-pw button{padding:4px 12px;font-size:14px;}',
'  .lq-pin span{width:36px;height:46px;font-size:26px;}.lq-pad{width:min(100%,330px);}.lq-join .lq-pad{flex-basis:330px;}.lq-pad button{height:40px;font-size:20px;}',
'  .lq-join{flex-wrap:nowrap;}.lq-join-l{flex-basis:260px;}',
'  .lq-big{font-size:44px;}.lq-h1{font-size:20px;margin:2px 0 4px;}.lq-p{font-size:14px;}',
'  .lq-podium{min-height:150px;}.lq-pod.p1 .blk{height:80px;}.lq-pod.p2 .blk{height:58px;}.lq-pod.p3 .blk{height:42px;}',
'  .lq-hside{flex-direction:row;}.lq-stat .v{font-size:28px;}',
'}'
].join('\n');

function ensureRoot(){
  if(!$('lq-style')){ var st = document.createElement('style'); st.id = 'lq-style'; st.textContent = CSS; document.head.appendChild(st); }
  var r = $('lq-root');
  if(!r){
    r = document.createElement('div'); r.id = 'lq-root';
    r.innerHTML = '<div class="lq-top" id="lq-top"></div><div class="lq-body" id="lq-body"></div><div id="lq-ctl"></div>';
    document.body.appendChild(r);
    var t = document.createElement('div'); t.id = 'lq-toast'; document.body.appendChild(t);
  }
  r.style.display = 'flex';
  focusMode(true);
  return r;
}
/* ★ v5.323.0 乙 比賽專心模式:擂台開著時,把後面的冒險遊戲畫面隱藏、動畫暫停(舊 iPad 不用再一邊畫背後的首頁/關卡動畫),
   關掉擂台立刻恢復。只動 #_gc_wrapper(遊戲本體);閒置登出提醒、登入視窗等掛在 body 的彈窗不受影響。
   window._lxpsLiveQuizFocus = true 供主遊戲其他背景工作日後判斷要不要暫停。 */
function focusMode(on){
  try{
    window._lxpsLiveQuizFocus = !!on;
    document.body.classList.toggle('lq-focus', !!on);
  }catch(_){}
}
function setTop(title, chips, onClose){
  var h = '<div class="lq-ttl">' + esc(title) + '</div>';
  (chips || []).forEach(function(c){ h += '<div class="lq-chip" ' + (c.id ? 'id="' + c.id + '"' : '') + (c.html ? '' : ' style="display:none"') + (c.warn ? ' data-warn="1"' : '') + '>' + c.html + '</div>'; });
  h += '<button class="lq-x" id="lq-close" aria-label="關閉">✕</button>';
  $('lq-top').innerHTML = h;
  $('lq-close').onclick = onClose || function(){ LQ.close(); };
}
function setBody(html){ var b = $('lq-body'); b.innerHTML = html; b.scrollTop = 0; return b; }
function setCtl(html){ var c = $('lq-ctl'); c.className = html ? 'lq-ctl' : ''; c.innerHTML = html || ''; return c; }
function modal(html){
  closeModal();
  var m = document.createElement('div'); m.className = 'lq-modal'; m.id = 'lq-modal';
  m.innerHTML = '<div>' + html + '</div>';
  document.body.appendChild(m); return m;
}
function closeModal(){ var m = $('lq-modal'); if(m) m.remove(); }
function confirmBox(msg, okTxt, cb){
  var m = modal('<div class="lq-p" style="text-align:left">' + msg + '</div><div class="lq-row"><button class="lq-btn gray" id="lq-cf-no">取消</button><button class="lq-btn gold" id="lq-cf-ok">' + esc(okTxt || '確定') + '</button></div>');
  $('lq-cf-no').onclick = closeModal;
  $('lq-cf-ok').onclick = function(){ closeModal(); cb(); };
  return m;
}

/* ═════════════════════════════════════════════════════════════════
 *  入口
 * ═════════════════════════════════════════════════════════════════ */
LQ.open = async function(mode){
  ensureRoot();
  ST.reset(); H.reset(); _lqLvl = 0;
  var u = me();
  if(!u){ return screenNeedLogin(); }
  try{ await fs(); }catch(e){ return screenError(e.message); }
  startAuthWatch();
  if(mode === 'host'){ if(await amHost()) return hostHome(); return screenError(T('只有老師可以主持喔', '你的帳號沒有主持權限')); }
  if(mode === 'hosts'){ if(isAdmin()) return hostManager(); return screenError('只有 GM 可以管理主持人'); }
  if(mode === 'classes'){ if(await amHost()){ await hostHome(); CB.arr = null; return showClassBoard(); } return screenError(T('只有老師可以看班級排行榜喔', '你的帳號沒有主持權限')); }
  var host = await amHost();
  var resumed = await studentTryResume();
  if(resumed) return;
  if(host) return screenChooseRole();
  return studentJoinScreen();
};
LQ.close = function(force){
  if(H.pin && H.status && H.status !== 'ended' && !force){
    return confirmBox(T('擂台還在進行中喔!<br>關掉之後可以從首頁「⚡ 搶答擂台」→「我要主持」回到這一場。',
                       '擂台仍在進行。<br>關閉主持台不會結束擂台,可從首頁「⚡ 搶答擂台」→「我要主持」接續。'), '先關掉', function(){ LQ.close(true); });
  }
  if(ST.pin && ST.room && ST.room.meta && ST.room.meta.status !== 'ended' && !force){
    /* ★ v5.321.0 三個選項:取消/暫時離開(會自動回來)/退出這一場(換到老師開的新場次) */
    modal('<div class="lq-p" style="text-align:left">' + T('要離開擂台嗎?<br>・<b>暫時離開</b>:再點「⚡ 搶答擂台」會自動回到這一場,分數保留。<br>・<b>退出這一場</b>:不再回到這一場,可以輸入老師給的新房號。',
                                                         '確定離開?<br>・<b>暫時離開</b>:重新進入時自動回到本場,成績保留。<br>・<b>退出本場</b>:不再自動回到本場,可加入新的擂台。') + '</div>'
      + '<div class="lq-row"><button class="lq-btn gray" id="lq-cf-no">取消</button><button class="lq-btn" id="lq-cf-away">' + T('暫時離開', '暫時離開') + '</button>'
      + '<button class="lq-btn gold" id="lq-cf-quit">' + T('退出這一場', '退出本場') + '</button></div>');
    $('lq-cf-no').onclick = closeModal;
    $('lq-cf-away').onclick = function(){ closeModal(); LQ.close(true); };
    $('lq-cf-quit').onclick = function(){ closeModal(); studentQuit(); };
    return;
  }
  studentAway();   /* ★ v5.318.0 學生中途離開 ⇒ 主持台立刻顯示斷線 */
  ST.stop(); H.stop(); stopAuthWatch(); closeModal(); bgmBack(); fxClear();
  ST.pin = null;
  var r = $('lq-root'); if(r){ r.style.display = 'none'; $('lq-body').innerHTML = ''; }
  focusMode(false);
};
var _authH = null, _authUid = null;
function startAuthWatch(){
  stopAuthWatch();
  var u = me(); _authUid = u ? u.uid : null;
  _authH = setInterval(function(){
    var v = me(); var id = v ? v.uid : null;
    if(id !== _authUid){
      /* 共用 iPad:換人/登出 ⇒ 立刻離房,下一位同學看不到上一位的畫面 */
      try{ ST.stop(); H.stop(); }catch(_){}
      stopAuthWatch(); closeModal(); bgmBack();
      var r = $('lq-root'); if(r) r.style.display = 'none';
      focusMode(false);
    }
  }, 2000);
}
function stopAuthWatch(){ if(_authH){ clearInterval(_authH); _authH = null; } }

function screenNeedLogin(){
  setTop('⚡ ' + T('搶答大挑戰', '英雄搶答擂台'));
  setCtl('');
  setBody('<div class="lq-card"><div class="lq-h1">🔑 ' + T('先登入自己的帳號喔', '請先登入帳號') + '</div>'
    + '<div class="lq-p">' + T('搶答擂台要用<b>自己的帳號</b>參加,名字才會出現在老師的螢幕上,得到的獎勵也會送到你的帳號!',
                             '搶答擂台需以個人帳號參加,名稱與帳號將顯示於參加者列表,獎勵直接寄送至該帳號。') + '</div>'
    + '<div class="lq-row"><button class="lq-btn gray" id="lq-nl-no">取消</button><button class="lq-btn gold" id="lq-nl-go">🔑 先登入帳號</button></div></div>');
  $('lq-nl-no').onclick = function(){ LQ.close(true); };
  $('lq-nl-go').onclick = function(){
    LQ.close(true);
    try{ window._lxpsMarkPendingEntry('lq'); }catch(_){}
    try{ if(window._isMobileDevice && window._isMobileDevice() && window._enterMobileFullscreenLandscape) window._enterMobileFullscreenLandscape(); }catch(_){}
    try{ if(typeof window.showLoginGate === 'function') window.showLoginGate(); }catch(_){}
  };
}
function screenError(msg){
  setTop('⚡ ' + T('搶答大挑戰', '英雄搶答擂台')); setCtl('');
  setBody('<div class="lq-card"><div class="lq-h1">😵 ' + esc(msg) + '</div><div class="lq-row"><button class="lq-btn" id="lq-er-ok">知道了</button></div></div>');
  $('lq-er-ok').onclick = function(){ LQ.close(true); };
}
function screenChooseRole(){
  setTop('⚡ ' + T('搶答大挑戰', '英雄搶答擂台')); setCtl('');
  setBody('<div class="lq-card"><div class="lq-h1">' + T('要做什麼呢?', '選擇身分') + '</div>'
    + '<div class="lq-row"><button class="lq-btn green" id="lq-r-play">🙋 我要參加</button><button class="lq-btn gold" id="lq-r-host">🎤 我要主持</button>'
    + (isAdmin() ? '<button class="lq-btn gray" id="lq-r-hosts">👥 主持人管理</button>' : '') + '</div></div>');
  $('lq-r-play').onclick = studentJoinScreen;
  $('lq-r-host').onclick = hostHome;
  if($('lq-r-hosts')) $('lq-r-hosts').onclick = hostManager;
}

/* ═════════════════════════════════════════════════════════════════
 *  學生端
 * ═════════════════════════════════════════════════════════════════ */
var ST = {
  reset: function(){ this.stop(); this.pin = null; this.room = null; this.uid = null; this.curQ = -1; this.choice = null; this.pending = false;
    this.recvAt = 0; this.waitMs = 0; this.cutRm = -1; this.hintA = -1; this.used = { cut: false, hint: false }; this.pwWait = null;
    this.sfxQ = -1; this.streak = 0; this.priv = null; this.ans = {}; this.correctN = 0; this.lastStatus = ''; this.kicked = false;
    this.offset = null; this.syncRtt = 1e9; this.syncS = 0; this.syncPend = null; this.timeUp = false;
    this.endFx = false; this.lastRank = null; this.lastLeft = 99; this.lastOk = 0; this.netBad = false; this.beatBusy = false; this.prevPin = null; this.rtt = 0; this.lagMax = 0; this.tickAt = 0;
    this.snapAt = 0; this.pollAt = 0; this.polling = false; this.staleN = 0; this.beatAt = 0; this.roomUn = null; },
  stop: function(){ (this.unsubs || []).forEach(function(f){ try{ f(); }catch(_){} }); this.unsubs = [];
    if(this.hb){ clearInterval(this.hb); this.hb = null; } if(this.tick){ clearInterval(this.tick); this.tick = null; }
    if(this.beatRetry){ clearTimeout(this.beatRetry); this.beatRetry = null; } this.beatBusy = false; },
  unsubs: [], hb: null, tick: null
};
function lsKey(k){ return 'lxps_lq_' + k + '_' + (ST.uid || ''); }
function saveLocal(){
  try{
    localStorage.setItem(lsKey('room'), ST.pin + '|' + now());
    localStorage.setItem(lsKey('st') + '_' + ST.pin, JSON.stringify({ ans: ST.ans, used: ST.used }));
  }catch(_){}
}
function loadLocal(pin){
  try{ var o = JSON.parse(localStorage.getItem(lsKey('st') + '_' + pin) || '{}'); ST.ans = o.ans || {}; ST.used = o.used || { cut: false, hint: false }; }catch(_){ ST.ans = {}; }
}
function clearLocal(){ try{ localStorage.removeItem(lsKey('room')); localStorage.removeItem(lsKey('st') + '_' + ST.pin); }catch(_){} }

async function studentTryResume(){
  var u = me(); ST.uid = u.uid;
  var raw = null; try{ raw = localStorage.getItem(lsKey('room')); }catch(_){}
  if(!raw) return false;
  var p = raw.split('|'), pin = p[0], ts = +p[1] || 0;
  if(!/^\d{6}$/.test(pin) || now() - ts > 12 * 3600 * 1000) return false;
  /* ★ v5.321.0(老師「學生無法離開前一場,請修成學生可以退出前一場,重新進老師開的新場次」)
     原本:只要本機記著上一場,一點「⚡ 搶答擂台」就硬拉回上一場(已結束的也會拉回 2 小時)⇒ 老師開了新場次,學生進不去。
     改成:① 上一場已結束 ⇒ 不再拉回,直接到輸入房號;② 同一位老師已經開了比上一場新的房間(首頁看板)⇒ 不自動拉回,
     改到輸入房號畫面並顯示「回到上一場」按鈕讓學生自己選;③ 其餘(上一場還在進行、沒有更新的場次)照舊自動回到上一場,分數保留。 */
  try{
    var s = await F.getDoc(roomRef(pin));
    if(!s.exists()){ clearLocalPin(pin); return false; }
    var r = s.data();
    if(!r.meta || r.meta.status === 'ended'){ clearLocalPin(pin); return false; }
    var ps = await F.getDoc(sub(pin, 'players', u.uid));
    if(!ps.exists() || ps.data().kicked){ clearLocalPin(pin); return false; }
    var newer = null;
    try{
      var b = await F.getDoc(F.doc(db(), 'liveQuizBoard', BOARD_DOC));
      var rooms = (b.exists() && b.data().rooms) || {};
      var mine = rooms[pin];
      if(mine && mine.st === 'ended'){ clearLocalPin(pin); return false; }
      Object.keys(rooms).forEach(function(k){
        var e = rooms[k];
        if(k === pin || !e || e.st === 'ended' || now() - (e.at || 0) > BOARD_TTL) return;
        if(e.hostUid === r.meta.hostUid && (e.at || 0) > (r.meta.createdAt || 0)) newer = k;
      });
    }catch(_){}
    if(newer){ ST.prevPin = pin; return false; }   /* 老師開新場了 ⇒ 讓學生自己選 */
    await studentEnter(pin, r, true);
    return true;
  }catch(_){ return false; }
}
function clearLocalPin(pin){ try{ localStorage.removeItem(lsKey('room')); localStorage.removeItem(lsKey('st') + '_' + pin); }catch(_){} }
/* ★ v5.321.0 學生主動「退出這一場」:告訴主持台離開、清掉本機紀錄(之後不會再自動拉回),直接回到輸入房號畫面 */
function studentQuit(){
  var pin = ST.pin;
  studentAway();
  ST.stop(); closeModal(); bgmBack(); fxClear();
  if(pin) clearLocalPin(pin);
  ST.reset();
  toast(T('已經退出上一場,輸入老師給的新房號吧!', '已退出上一場,請輸入新房號'));
  studentJoinScreen();
}

function studentJoinScreen(){
  var u = me(); ST.uid = u.uid;
  var code = '';
  setTop('⚡ ' + T('搶答大挑戰', '英雄搶答擂台'), [{ html: '🙋 ' + esc(myLabel()) }]);
  setCtl('');
  function draw(){
    var boxes = '';
    for(var i = 0; i < 6; i++) boxes += '<span class="' + (i === code.length ? 'cur' : '') + '">' + (code[i] || '') + '</span>';
    $('lq-pinbox').innerHTML = boxes;
    $('lq-join-go').disabled = code.length !== 6;
  }
  var pad = '';
  ['1','2','3','4','5','6','7','8','9','⌫','0','🆗'].forEach(function(k){ pad += '<button data-k="' + k + '">' + k + '</button>'; });
  setBody('<div class="lq-card lq-join"><div class="lq-join-l"><div class="lq-h1">' + T('輸入老師給的房號', '輸入房號') + '</div>'
    + '<div class="lq-p" style="font-size:clamp(14px,1.8vmin,20px)">' + T('看大螢幕上的 6 個數字', '請輸入大螢幕上顯示的 6 碼房號') + '</div>'
    + '<div class="lq-pin" id="lq-pinbox"></div>'
    + '<div class="lq-row"><button class="lq-btn gold" id="lq-join-go" disabled>🚀 ' + T('加入擂台', '加入') + '</button></div>'
    + (ST.prevPin ? '<div class="lq-p" style="font-size:clamp(13px,1.6vmin,18px);opacity:.9">' + T('老師開了新的擂台喔!你上一場(房號 ' + esc(ST.prevPin) + ')還沒結束。', '主持人已開新場次;上一場(房號 ' + esc(ST.prevPin) + ')尚未結束。')
        + '<br><button class="lq-btn gray" id="lq-join-prev" style="margin-top:6px">↩ ' + T('回到上一場', '回到上一場') + '</button></div>' : '')
    + '</div>'
    + '<div class="lq-pad" id="lq-pad">' + pad + '</div></div>');
  $('lq-pad').onclick = function(e){
    var b = e.target.closest('button'); if(!b) return;
    var k = b.getAttribute('data-k');
    if(k === '⌫') code = code.slice(0, -1);
    else if(k === '🆗'){ if(code.length === 6) go(); return; }
    else if(code.length < 6) code += k;
    sfx('sfx-gentle', 0.25); draw();
  };
  $('lq-join-go').onclick = go;
  if($('lq-join-prev')) $('lq-join-prev').onclick = function(){ code = ST.prevPin; draw(); go(); };   /* ★ v5.321.0 學生自己選要回上一場 */
  draw();
  async function go(){
    var btn = $('lq-join-go'); btn.disabled = true; btn.textContent = '…';
    try{
      var s = await F.getDoc(roomRef(code));
      if(!s.exists()) throw new Error(T('找不到這個房號,再看一次大螢幕', '查無此房號'));
      var r = s.data();
      if(r.meta.status === 'ended') throw new Error(T('這場擂台已經結束了', '本場擂台已結束'));
      await studentEnter(code, r, false);
    }catch(e){
      toast((e && e.code === 'permission-denied') ? T('老師已經鎖住房間了', '房間已上鎖或無法加入') : (e.message || '加入失敗'));
      btn.disabled = false; btn.textContent = '🚀 ' + T('加入擂台', '加入'); code = ''; draw();
    }
  }
}

async function studentEnter(pin, room, resumed){
  var u = me(); ST.uid = u.uid; ST.pin = pin; ST.room = room;
  loadLocal(pin);
  var pref = sub(pin, 'players', u.uid);
  var ps = await F.getDoc(pref);
  /* ★ v5.318.0 甲:每次寫自己的參加者文件都順便帶 syncAt=伺服器時間 ⇒ 讀回後估出「本機時鐘 − 雲端時鐘」的差,
     倒數改用雲端時間算,畫面上的 0 秒＝真正截止(不會出現「我還有 1 秒卻不算」)。取來回時間最短的那次估計。 */
  var t0 = now();
  if(ps.exists()){
    if(ps.data().kicked) throw new Error(T('老師請你先離開這個房間', '你已被主持人移出本房'));
    await playerWrite(pref, { lastSeen: now(), name: myLabel() }, false);
  }else{
    if(room.meta.locked) throw new Error(T('老師已經鎖住房間了', '房間已上鎖'));
    await playerWrite(pref, { uid: u.uid, name: myLabel(), account: myAccount(), email: myEmail(), joinedAt: now(), lastSeen: now(), kicked: false }, true);
  }
  ST.syncPend = { t0: t0, t1: now() };
  ST.lastOk = now(); ST.netBad = false;
  saveLocal();
  snd('join', 0.5); vib(30);
  if(resumed) toast(T('回到擂台了!分數都還在', '已回到進行中的擂台'));
  ST.hb = setInterval(studentBeat, HEARTBEAT_MS);
  bindAway();
  ST.snapAt = now();
  studentListenRoom();
  ST.unsubs.push(function(){ if(ST.roomUn){ try{ ST.roomUn(); }catch(_){} ST.roomUn = null; } });
  ST.unsubs.push(live(pref, null, function(s){
    if(!s.exists()) return;
    var d = s.data();
    if(d.kicked && !ST.kicked){ ST.kicked = true; studentKicked(); }
    try{
      var S = tsMs(d.syncAt), P = ST.syncPend;
      if(S && P && !(s.metadata && s.metadata.hasPendingWrites) && S !== ST.syncS){
        ST.syncS = S;
        var rtt = Math.max(0, P.t1 - P.t0);
        if(ST.offset == null || rtt <= ST.syncRtt + 80){ ST.offset = S - (P.t0 + P.t1) / 2; ST.syncRtt = rtt; }
      }
    }catch(_){}
  }));
  ST.unsubs.push(live(sub(pin, 'private', u.uid), null, function(s){ ST.priv = s.exists() ? s.data() : null; applyPrivate(); }));
  ST.tick = setInterval(studentTick, 250);
  studentRender();
}
/* ★ v5.332.0 房間監聽(可單獨重接);收到比畫面舊的狀態一律忽略 */
function studentListenRoom(){
  if(ST.roomUn){ try{ ST.roomUn(); }catch(_){} ST.roomUn = null; }
  var pin = ST.pin;
  ST.roomUn = live(roomRef(pin), null, function(s){
    if(ST.pin !== pin || !s.exists()) return;
    if(!(s.metadata && s.metadata.fromCache)) ST.snapAt = now();
    var d = s.data();
    if(roomStage(d) < roomStage(ST.room)) return;
    ST.room = d; studentRender();
  });
}
/* ★ v5.332.0 甲 房間看門狗(studentTick 每 250ms 呼叫,內部自己節流):
   等公布/等下一題/等結算時房間文件安靜 4 秒,或任何時候安靜 9 秒 ⇒ 用 REST 讀一次雲端;雲端比畫面新就直接接上。 */
function studentWatch(){
  if(!ST.pin || ST.kicked || ST.polling) return;
  var r = ST.room; if(!r || !r.meta) return;
  if(r.meta.status === 'ended' && (r.final || r.meta.cleared)) return;
  if(document.visibilityState === 'hidden') return;
  var t = now(), quiet = t - (ST.snapAt || 0);
  var st = r.meta.status;
  var waiting = st === 'reveal' || st === 'ended' || (st === 'question' && (ST.timeUp || ST.choice != null || studentLeftMs(r) <= 0));
  if(quiet < (waiting ? 4000 : 9000)) return;
  if(t - (ST.pollAt || 0) < (waiting ? 4000 : 8000)) return;
  ST.pollAt = t; ST.polling = true;
  var pin = ST.pin;
  restGetRoom(pin).then(function(d){
    ST.polling = false;
    if(ST.pin !== pin || !d) return;
    ST.lastOk = now(); netChip();
    if(roomStage(d) > roomStage(ST.room)){
      try{ console.warn('[LQ] 即時連線落後,改用雲端最新狀態', roomStage(ST.room), '→', roomStage(d)); }catch(_){}
      ST.room = d; ST.staleN = (ST.staleN || 0) + 1;
      studentRender();
      if(ST.staleN >= 2) sdkKick('房間監聽落後'); else studentListenRoom();
    }else{
      ST.staleN = 0;
    }
  }).catch(function(e){
    ST.polling = false;
    try{ console.warn('[LQ] 看門狗讀取失敗', e && e.message); }catch(_){}
  });
}
/* ★ v5.318.0 斷線即時顯示:心跳 10 秒一次;平板切走/鎖屏/關 App ⇒ 立刻送 lastSeen=0(主持台馬上顯示「某某斷線了」);
   切回來 ⇒ 立刻補一次心跳(主持台顯示「回來了」)。 */
/* ★ v5.320.0 根因:v5.318.0 心跳多帶了 syncAt 欄位,雲端規則若還是 v5.317.0 版(players 只准改 lastSeen/name),
   每一次心跳都被拒絕、而且錯誤被吞掉 ⇒ 學生畫面顯示已加入,主持台 25 秒後就看成「斷線」,永遠回不來。
   改成:帶 syncAt 被拒(permission-denied)就自動改用不帶 syncAt 的寫法,本場之後都不再帶;不論規則有沒有重新發布都能運作。 */
/* ★ v5.323.0 擴充成三段相容:0=對時＋連線診斷(rtt/lag/dev,需 v5.323.0 規則) → 1=只帶對時(v5.318.0 規則) → 2=最基本(v5.317.0 規則)。
   被雲端規則拒絕就往下降一段重送,本次開啟擂台期間記住(每次 LQ.open 重設回 0)。 */
var _lqLvl = 0;
function playerWrite(ref, data, create, diag){
  function attempt(lvl){
    var d = {}; Object.keys(data).forEach(function(k){ d[k] = data[k]; });
    if(lvl <= 1) d.syncAt = F.serverTimestamp();
    if(lvl === 0 && diag && !create) Object.keys(diag).forEach(function(k){ d[k] = diag[k]; });
    return create ? F.setDoc(ref, d) : F.updateDoc(ref, d);
  }
  function go(lvl){
    return attempt(lvl).catch(function(e){
      if(e && e.code === 'permission-denied' && lvl < 2){
        var nx = lvl + 1;
        if(nx === 1 && !(diag && !create)) nx = 2;   /* 這次本來就沒帶診斷 ⇒ 第 1 段和第 0 段一樣,直接跳到最基本 */
        if(create) return go(nx);   /* 加入被拒可能是房間上鎖/已結束,不代表規則舊 ⇒ 不記住降級 */
        _lqLvl = Math.max(_lqLvl, nx);
        try{ console.warn('[LQ] 雲端規則較舊,改用相容寫法 L' + _lqLvl + '(建議發布新版 firestore.rules)'); }catch(_){}
        return go(_lqLvl);
      }
      throw e;
    });
  }
  return go(_lqLvl);
}
/* ★ v5.323.0 甲 連線診斷:裝置標籤(老師分辨新舊 iPad 用)。2019 iPad(第 7～9 代 10.2 吋)畫面 1080×810;新款 1180×820。 */
var _lqDev = null;
function devLabel(){
  if(_lqDev) return _lqDev;
  try{
    var ua = navigator.userAgent || '', w = Math.max(screen.width, screen.height), h = Math.min(screen.width, screen.height);
    var ipad = /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    var ios = (/OS (\d+)[_.]/.exec(ua) || [])[1] || ((/Version\/(\d+)/.exec(ua) || [])[1]) || '';
    var kind = ipad ? 'iPad' : (/iPhone/.test(ua) ? 'iPhone' : (/Android/.test(ua) ? 'Android' : 'PC'));
    _lqDev = (kind + ' ' + w + '×' + h + (ios && kind !== 'PC' && kind !== 'Android' ? ' iOS' + ios : '')).slice(0, 40);
  }catch(_){ _lqDev = '?'; }
  return _lqDev;
}
function studentBeat(){
  if(!ST.pin || !ST.uid || ST.kicked) return;
  if(document.visibilityState === 'hidden') return;   /* 切到別的 App/分頁時,背景計時器不要把自己又標回「在線」 */
  /* ★ v5.332.0 丙:SDK 連線卡住時 Promise 永遠不回來,beatBusy 會一直是 true ⇒ 之後再也不送心跳。超過 20 秒就當作卡住,不再擋。 */
  if(ST.beatBusy && now() - (ST.beatAt || 0) < 20000) return;
  ST.beatBusy = true; ST.beatAt = now();
  var a = now(), pin = ST.pin, uid0 = ST.uid;
  /* ★ v5.332.0 丙:5 秒沒回應 ⇒ 用 REST 補送 lastSeen,主持台才不會把他當斷線、不等他作答;卡超過 12 秒就讓 SDK 重新連線 */
  setTimeout(function(){
    if(ST.pin !== pin || ST.beatAt !== a || !ST.beatBusy) return;
    restBeat(pin, uid0).then(function(ok){ if(ok && ST.pin === pin){ ST.lastOk = now(); netChip(); } });
  }, 5000);
  setTimeout(function(){ if(ST.pin === pin && ST.beatAt === a && ST.beatBusy) sdkKick('心跳卡住'); }, 12000);
  /* ★ v5.323.0 甲:順便回報上一次心跳來回毫秒、這 10 秒內畫面最大卡頓毫秒、裝置型號 */
  var diag = { rtt: Math.round(ST.rtt || 0), lag: Math.round(ST.lagMax || 0), dev: devLabel() };
  ST.lagMax = 0;
  playerWrite(sub(pin, 'players', ST.uid), { lastSeen: now() }, false, diag).then(function(){
    ST.beatBusy = false;
    if(ST.pin !== pin) return;
    ST.rtt = now() - a;
    if(_lqLvl <= 1) ST.syncPend = { t0: a, t1: now() };
    ST.lastOk = now(); netChip();
  }).catch(function(e){
    ST.beatBusy = false;
    if(ST.pin !== pin) return;
    try{ console.warn('[LQ] 心跳失敗', e && (e.code || e.message)); }catch(_){}
    netChip();
    /* ★ v5.320.0 失敗不等 10 秒,3 秒後再補一次,網路一恢復主持台就馬上看到 */
    if(ST.beatRetry) clearTimeout(ST.beatRetry);
    ST.beatRetry = setTimeout(function(){ ST.beatRetry = null; studentBeat(); }, 3000);
  });
}
/* ★ v5.320.0 學生畫面右上角顯示自己的連線狀態:超過 25 秒沒有成功送達雲端 ⇒「📶 重新連線中…」(不再只看本機以為已加入) */
function netChip(){
  if(!ST.pin) return;
  var bad = ST.lastOk && now() - ST.lastOk > OFFLINE_MS - 5000;
  if(bad === ST.netBad && $('lq-s-net')) return;
  ST.netBad = bad;
  var top = $('lq-top'); if(!top) return;
  var el = $('lq-s-net');
  if(!el){ el = document.createElement('div'); el.id = 'lq-s-net'; el.className = 'lq-chip'; var x = $('lq-close'); if(x) top.insertBefore(el, x); else top.appendChild(el); }
  el.style.display = bad ? '' : 'none';
  el.setAttribute('data-warn', '1');
  el.innerHTML = '📶 ' + T('網路不穩,重新連線中…', '連線不穩,重新連線中…');
}
function studentAway(){
  if(!ST.pin || !ST.uid || ST.kicked || !ST.room || !ST.room.meta || ST.room.meta.status === 'ended') return;
  try{ F.updateDoc(sub(ST.pin, 'players', ST.uid), { lastSeen: 0 }).catch(function(){}); }catch(_){}
}
var _awayBound = false;
function bindAway(){
  if(_awayBound) return; _awayBound = true;
  document.addEventListener('visibilitychange', function(){ if(document.visibilityState === 'hidden') studentAway(); else studentBeat(); });
  window.addEventListener('pagehide', studentAway);
  window.addEventListener('pageshow', function(){ studentBeat(); });
}
function studentKicked(){
  clearLocal(); ST.stop(); bgmBack();
  setTop('⚡ ' + T('搶答大挑戰', '英雄搶答擂台')); setCtl('');
  setBody('<div class="lq-card"><div class="lq-h1">👋 ' + T('老師請你先離開這個房間', '你已被主持人移出本房') + '</div>'
    + '<div class="lq-row"><button class="lq-btn" id="lq-k-ok">知道了</button></div></div>');
  $('lq-k-ok').onclick = function(){ LQ.close(true); };
}
function applyPrivate(){
  var p = ST.priv; if(!p) return;
  if(p.cut){ ST.used.cut = true; if(p.cut.q === ST.curQ && ST.cutRm !== p.cut.rm){ ST.cutRm = p.cut.rm; pwDone('cut'); } }
  if(p.hint){ ST.used.hint = true; if(p.hint.q === ST.curQ && ST.hintA !== p.hint.a){ ST.hintA = p.hint.a; pwDone('hint'); } }
  saveLocal();
  if(ST.room && ST.room.meta.status === 'question') drawStudentQuestion();
}
function pwDone(kind){
  var wasWaiting = !!ST.pwWait;
  if(ST.pwWait){ ST.waitMs += Math.max(0, pnow() - ST.pwWait); ST.pwWait = null; }
  if(!wasWaiting) return;   /* 重整回房時只是還原狀態,不重播特效 */
  snd(kind === 'hint' ? 'hint' : 'cut', 0.6); vib([20, 30, 20]);
  fxFlash(kind === 'hint' ? 'rgba(255,240,150,.45)' : 'rgba(255,120,120,.35)');
}

function studentChips(){
  var r = ST.room, c = [];
  if(r && r.current && r.meta.status !== 'lobby' && r.meta.status !== 'ended') c.push({ html: '第 ' + (r.current.qIndex + 1) + ' / ' + r.meta.qCount + ' 題' });
  if(r && r.meta.status === 'question') c.push({ id: 'lq-s-timer', html: '⏱ <span class="lq-timer">--</span>' });
  c.push({ html: '🙋 ' + esc(myLabel()) });
  return c;
}
function studentRender(){
  var r = ST.room; if(!r || ST.kicked) return;
  var st = r.meta.status;
  if(st === 'question'){
    var q = r.current.qIndex;
    if(q !== ST.curQ){
      ST.curQ = q; ST.choice = (ST.ans[q] != null) ? ST.ans[q] : null; ST.pending = false; ST.recvAt = pnow(); ST.waitMs = 0;
      ST.cutRm = -1; ST.hintA = -1; ST.pwWait = null; ST.timeUp = false;
      if(ST.priv){ if(ST.priv.cut && ST.priv.cut.q === q) ST.cutRm = ST.priv.cut.rm; if(ST.priv.hint && ST.priv.hint.q === q) ST.hintA = ST.priv.hint.a; }
      ST.lastLeft = 99;
      bgmKing();
      if(ST.choice == null){ snd('qStart', 0.45); vib(40); }
    }
    if(ST.lastStatus !== 'question' || $('lq-s-q') == null || +$('lq-s-q').getAttribute('data-q') !== q){
      setTop('⚡ ' + (r.meta.title || T('搶答大挑戰', '英雄搶答擂台')), studentChips());
      setCtl('');
      setBody('<div class="lq-q lq-qin" id="lq-s-q" data-q="' + q + '"></div><div class="lq-opts" id="lq-s-opts"></div><div class="lq-pw" id="lq-s-pw"></div><div class="lq-p" id="lq-s-msg" style="margin-top:10px"></div>');
    }
    ST.lastStatus = st;
    drawStudentQuestion();
    return;
  }
  ST.lastStatus = st;
  if($('lq-pw-confirm')) closeModal();   /* ★ v5.318.0 作答時間結束 ⇒ 還開著的法寶確認視窗一併關掉 */
  if(st === 'lobby') return studentLobby();
  if(st === 'reveal') return studentReveal();
  if(st === 'ended') return studentEnded();
}
function studentLobby(){
  var r = ST.room;
  /* 已經在等候室畫面 ⇒ 只更新座號牆(房間文件每次變動都會進來,不整頁重畫、不跳回頂端) */
  var lw = $('lq-s-lobwall');
  if(lw){ setHtmlIfChanged(lw, studentLobbyWall(r)); return; }
  setTop('⚡ ' + (r.meta.title || T('搶答大挑戰', '英雄搶答擂台')), studentChips());
  /* ★ v5.321.0 等候室下方顯示目前房號＋「退出這一場」:跑錯房間/老師換新場次時,學生自己就能換 */
  setCtl('<span style="font-weight:800;opacity:.85">🔑 ' + T('房號', '房號') + ' ' + esc(ST.pin) + ' ・ ' + T('不是老師現在這一場?', '非目前場次?') + '</span>'
    + '<button class="lq-btn gray" id="lq-s-quit">🚪 ' + T('退出這一場', '退出本場') + '</button>');
  $('lq-s-quit').onclick = function(){ confirmBox(T('確定要退出房號 <b>' + esc(ST.pin) + '</b> 這一場嗎?<br>退出後可以輸入老師給的新房號。', '確定退出房號 <b>' + esc(ST.pin) + '</b>?<br>退出後可加入新的擂台。'), T('退出這一場', '退出本場'), studentQuit); };
  setBody('<div class="lq-card"><div class="lq-h1">✅ ' + T('加入成功!', '已加入擂台') + '</div>'
    + '<div class="lq-p">' + T('看看大螢幕,你的名字已經出現囉!<br>等老師按開始~', '你的名稱已顯示在參加者列表。<br>等待主持人啟動擂台…') + '</div>'
    + '<div id="lq-s-lobwall" style="width:100%;display:flex;flex-direction:column;align-items:center">' + studentLobbyWall(r) + '</div>'
    + '<div class="lq-p" style="font-size:15px;opacity:.85;line-height:1.7">'
    + T('答對得 500 分,答得越快再加分(最多 +500)!<br>每人有 2 個法寶:🗡️ 刪掉一個錯的、💡 偷偷告訴你答案,每場各能用一次。<br>⭐ 沒用掉的法寶每個讓總分 +5%,兩個都不用 +10%!',
        '答對 500 分＋速度分最多 500 分。<br>法寶每場各一次:🗡️ 斬卻(消去一個錯誤選項)、💡 天啟(揭示正解)。<br>⭐ 每保留一個未使用的法寶,總分 +5%(最多 +10%)。') + '</div></div>');
}
/* ★ v5.318.0 學生等候室:只顯示班級座號(4 碼,不顯示姓名/帳號),暗=還沒來、亮=已加入、灰=請假 */
function studentLobbyWall(r){
  var L = r.lobby;
  if(!L || !(L.exp || []).length)
    return '<div class="lq-big" style="font-size:clamp(30px,6vmin,64px);margin-top:10px">👥 ' + (r.meta.lobbyCount || 1) + '</div>';
  var inn = {}, off = {}, lv = {};
  (L.in || []).forEach(function(c){ inn[c] = 1; }); (L.off || []).forEach(function(c){ off[c] = 1; }); (L.lv || []).forEach(function(c){ lv[c] = 1; });
  var here = 0, need = L.exp.length - (L.lv || []).length;
  var mine = (/^(\d{4})/.exec(myLabel()) || [])[1] || '';
  var h = L.exp.map(function(c){
    var cls = inn[c] ? 'in' : (off[c] ? 'dc' : (lv[c] ? 'lv' : 'no'));
    if(inn[c]) here++;
    return '<div class="lq-tag lq-rs ' + cls + (c === mine ? ' me' : '') + '" style="cursor:default">' + esc(c) + (lv[c] ? ' <small>請假</small>' : '') + (c === mine ? ' <small>' + T('我', '我') + '</small>' : '') + '</div>';
  }).join('');
  (L.ex || []).forEach(function(c){ h += '<div class="lq-tag lq-rs ' + (off[c] && !inn[c] ? 'dc' : 'in') + (c === mine ? ' me' : '') + '" style="cursor:default">' + esc(c) + '</div>'; });
  return '<div class="lq-p" style="font-weight:900;margin-top:8px">⏳ ' + T('等待所有玩家加入…', '等待所有玩家加入…') + ' '
    + T('已到', '已到') + ' <b style="color:#7dffb0">' + here + '</b> / ' + T('應到', '應到') + ' ' + need + '</div>'
    + '<div class="lq-wall lq-rwall" style="max-height:34vh">' + h + '</div>';
}
function drawStudentQuestion(){
  var r = ST.room; if(!r || r.meta.status !== 'question') return;
  var c = r.current, q = c.qIndex, n = c.options.length;
  var qEl = $('lq-s-q'); if(!qEl) return;
  if(qEl.getAttribute('data-txt') !== c.text){ qEl.textContent = c.text; qEl.setAttribute('data-txt', c.text); }
  var answered = ST.choice != null, locked = answered || ST.timeUp;
  var h = '';
  for(var i = 0; i < n; i++){
    var cls = 'lq-opt ' + OPT_CLASS[i];
    if(i === ST.cutRm) cls += ' cut';
    if(answered){ cls += (i === ST.choice ? ' pick' : ' dim'); }
    else if(ST.timeUp) cls += ' dim';
    else if(i === ST.hintA) cls += ' hint';
    h += '<button class="' + cls + '" data-i="' + i + '"' + (locked || i === ST.cutRm ? ' disabled' : '') + '>'
      + (i === ST.hintA && !answered ? '<span class="lq-hintflag">💡 ' + T('就是這個!', '天啟指引') + '</span>' : '')
      + '<b>' + OPT_LETTER[i] + '</b><span>' + esc(c.options[i]) + '</span></button>';
  }
  var o = $('lq-s-opts');
  o.style.gridTemplateColumns = n === 2 ? '1fr 1fr' : '';
  o.innerHTML = h;
  o.onclick = function(e){ var b = e.target.closest('button'); if(!b || b.disabled) return; studentAnswer(+b.getAttribute('data-i')); };
  var pw = '';
  if(!locked){
    var cutOk = !ST.used.cut && c.kind !== 'tf';
    pw += '<button id="lq-pw-cut"' + (cutOk && !ST.pwWait ? '' : ' disabled') + '>🗡️ ' + (ST.used.cut ? T('已用過', '已使用') : (c.kind === 'tf' ? T('是非題用不到', '是非題不適用') : T('刪掉一個錯的', '斬卻'))) + '</button>';
    pw += '<button id="lq-pw-hint"' + (!ST.used.hint && !ST.pwWait ? '' : ' disabled') + '>💡 ' + (ST.used.hint ? T('已用過', '已使用') : T('偷偷告訴你答案', '天啟')) + '</button>';
    var keep = (ST.used.cut ? 0 : 1) + (ST.used.hint ? 0 : 1);
    if(keep) pw += '<span style="align-self:center;font-size:clamp(12px,1.5vmin,16px);color:#ffe9a8;opacity:.85">⭐ ' + T('不用法寶總分 +', '保留加成 +') + (keep * POWER_BONUS_PCT) + '%</span>';
  }
  $('lq-s-pw').innerHTML = pw;
  if($('lq-pw-cut')) $('lq-pw-cut').onclick = function(){ askPower('cut'); };
  if($('lq-pw-hint')) $('lq-pw-hint').onclick = function(){ askPower('hint'); };
  var msg = '';
  if(ST.pwWait) msg = '✨ ' + T('法寶發動中…', '法寶連線中…');
  else if(answered) msg = ST.pending ? T('送出中…', '傳送中…') : ('✅ ' + T('答好了!等大家作答完就公布', '已作答,等待公布'));
  else if(ST.timeUp) msg = '⏰ ' + T('時間到!等老師公布答案', '作答時間結束');
  $('lq-s-msg').innerHTML = msg;
}
/* ★ v5.318.0 甲:剩餘毫秒 —— 有雲端時差估計時以「雲端開題時間＋限時」為準;還沒估到就退回「收到題目起算」 */
function studentLeftMs(r){
  var lim = r.current.timeLimit * 1000, st = tsMs(r.current.startAt);
  if(st && ST.offset != null){
    var left = st + lim - (now() + ST.offset);
    return Math.max(0, Math.min(lim, left));
  }
  return Math.max(0, lim - (pnow() - ST.recvAt));
}
function studentTick(){
  /* ★ v5.323.0 甲:本來每 250ms 跑一次,實際間隔越長＝平板越卡(舊 iPad 記憶體吃緊時會明顯變大) */
  var tp = pnow(); if(ST.tickAt){ var lg = tp - ST.tickAt - 250; if(lg < 5000 && lg > (ST.lagMax || 0)) ST.lagMax = lg;   /* 超過 5 秒＝切到背景被系統暫停,不算卡頓 */ } ST.tickAt = tp;
  netChip();
  studentWatch();   /* ★ v5.332.0 甲 */
  var r = ST.room; if(!r || r.meta.status !== 'question') return;
  var ms = studentLeftMs(r);
  if(ms <= 0 && !ST.timeUp && ST.choice == null){
    ST.timeUp = true;
    if($('lq-pw-confirm')) closeModal();
    snd('timeUp', 0.5); vib(120); fxShake('bad');
    drawStudentQuestion();
  }
  var el = document.querySelector('#lq-s-timer .lq-timer'); if(!el) return;
  var left = Math.ceil(ms / 1000);
  /* 最後 3 秒還沒作答 ⇒ 每秒輕震一下提醒(不出聲,避免 30 台平板一起嗶) */
  if(left !== ST.lastLeft){ ST.lastLeft = left; if(left > 0 && left <= 3 && ST.choice == null && !ST.timeUp) vib(18); if(left <= 5){ el.classList.remove('warn'); void el.offsetWidth; } }
  el.textContent = left; el.classList.toggle('warn', left <= 5);
  if(ST.pwWait && pnow() - ST.pwWait > 8000){ ST.pwWait = null; toast(T('法寶好像卡住了,先自己作答吧', '法寶回應逾時')); drawStudentQuestion(); }
}
async function studentAnswer(i){
  var r = ST.room; if(!r || r.meta.status !== 'question' || ST.choice != null || ST.timeUp) return;
  var q = r.current.qIndex;
  ST.choice = i; ST.pending = true; ST.ans[q] = i; saveLocal();
  snd('pick', 0.55); vib(25); drawStudentQuestion();
  var ms = Math.max(0, Math.round(pnow() - ST.recvAt - ST.waitMs));
  /* ★ v5.323.0 丁 作答自動重送:網路忙碌時不用學生再按一次,在本題截止後 4 秒內每 0.6～2 秒自動重送同一個答案
     (作答秒數用按下當下量的 ms,重送不會被算得比較慢);被雲端規則拒絕(已答過/真的逾時)才停。 */
  var give = pnow() + Math.max(0, studentLeftMs(r)) + 4000, pin = ST.pin;
  /* ★ v5.332.0 乙 作答雙通道:原本只等 SDK 的 setDoc —— 連線卡住時它不會失敗也不會成功,重送迴圈根本跑不到,
     等到逾時就把答案清掉 ⇒ 學生明明按了卻顯示「本題未作答」。改成 SDK 送出的同時計時,2.5 秒沒回應就用 REST 再送同一筆
     (文件 id 固定＝自己+題號、規則只准建立一次 ⇒ 兩條路都到也只算一次,作答秒數仍用按下當下量的 ms)。 */
  var res = await sendAnswer(pin, ST.uid, q, i, ms, give);
  if(ST.pin !== pin) return;
  ST.pending = false;
  if(res === 'denied'){
    if(ST.room && ST.room.meta.status === 'question' && ST.room.current.qIndex === q) toast(T('這題已經答過或時間到了', '本題已作答或已逾時'));
  }else if(res === 'fail'){
    ST.choice = null; delete ST.ans[q]; saveLocal();
    toast(T('網路太忙,這題沒有送到 😢', '網路壅塞,本題未能送出'));
  }
  drawStudentQuestion();
}
/* 回傳 'ok' 已送到 | 'denied' 雲端拒收(已答過或逾時) | 'fail' 到期限都沒送到 | 'gone' 已離開這一場 */
function sendAnswer(pin, uid, q, c, ms, give){
  return new Promise(function(resolve){
    var done = false, restBusy = false, tries = 0, nextAt = 0, warned = false, finalCheck = false, t0 = pnow(), iv = null;
    function fin(v){ if(done) return; done = true; if(iv) clearInterval(iv); resolve(v); }
    function deniedCheck(){ restMine(pin, uid, q).then(function(ex){ fin(ex ? 'ok' : 'denied'); }); }
    try{
      F.setDoc(sub(pin, 'answers', uid + '_' + q), { uid: uid, q: q, c: c, at: F.serverTimestamp(), ms: ms })
        .then(function(){ fin('ok'); })
        .catch(function(e){
          if(done) return;
          /* 被擋:可能是 REST 那條已經先送到(第二次寫入變成「修改」被拒),讀回確認 */
          if(e && e.code === 'permission-denied') deniedCheck();
          /* 其他錯誤交給下面的 REST 重送 */
        });
    }catch(_){}
    iv = setInterval(function(){
      if(done) return;
      if(ST.pin !== pin){ fin('gone'); return; }
      var open = ST.room && ST.room.current && ST.room.current.qIndex === q && ST.room.meta.status === 'question';
      if(pnow() > give || (!open && pnow() - t0 > 3000)){
        if(finalCheck) return;
        finalCheck = true;
        restMine(pin, uid, q).then(function(ex){ fin(ex ? 'ok' : 'fail'); });
        return;
      }
      if(pnow() - t0 < 2500 || restBusy || pnow() < nextAt) return;
      restBusy = true; tries++;
      if(!warned){ warned = true; toast(T('網路有點忙,自動幫你重送中…', '網路忙碌,自動重送中…'), 2500); }
      restAnswer(pin, uid, q, c, ms).then(function(rr){
        restBusy = false;
        if(done) return;
        if(rr === 'ok' || rr === 'exists'){ ST.lastOk = now(); fin('ok'); }
        else if(rr === 'denied') deniedCheck();
        else nextAt = pnow() + Math.min(2000, 600 * tries);
      });
    }, 300);
  });
}
/* ★ v5.318.0(老師「使用法寶前要有影響總分的確認說明」)— 先跳確認,講清楚用了之後總分加成會變多少;
   ⚠ 確認期間倒數照走(那是學生自己的思考時間);題目時間到會自動關掉這個視窗。 */
function askPower(kind){
  var r = ST.room; if(!r || r.meta.status !== 'question' || ST.choice != null || ST.used[kind] || ST.pwWait) return;
  if(kind === 'cut' && r.current.kind === 'tf') return;
  var keep = (ST.used.cut ? 0 : 1) + (ST.used.hint ? 0 : 1), after = keep - 1;
  var nameC = kind === 'cut' ? '🗡️ 刪掉一個錯的' : '💡 偷偷告訴你答案';
  var nameP = kind === 'cut' ? '🗡️ 斬卻' : '💡 天啟';
  var what = kind === 'cut' ? T('會幫你刪掉一個錯的選項', '消去一個錯誤選項') : T('會讓正確答案發光(還是要自己按下去)', '揭示正解(仍需自行作答)');
  var m = modal('<div id="lq-pw-confirm"><div class="lq-h1" style="font-size:clamp(20px,3.6vmin,30px)">' + T('要使用「' + nameC + '」嗎?', '確定使用「' + nameP + '」?') + '</div>'
    + '<div class="lq-p" style="text-align:left;line-height:1.8">'
    + '✨ ' + what + '。<br>'
    + '⭐ ' + T('沒用的法寶會讓總分加分。', '未使用的法寶提供總分加成。')
    + T('現在總分加成 ', '目前加成 ') + '<b style="color:#7dffb0">+' + (keep * POWER_BONUS_PCT) + '%</b>,'
    + T('用了之後會變成 ', '使用後降為 ') + '<b style="color:#ff9d9d">+' + (after * POWER_BONUS_PCT) + '%</b>。<br>'
    + '📌 ' + T('不管什麼時候用,最後都是整場總分一起少 5%。每個法寶每場只能用一次。', '加成於結算時套用於整場總分,與使用時機無關;每種法寶每場限用一次。')
    + '</div><div class="lq-row"><button class="lq-btn gray" id="lq-pw-no">' + T('先不要', '取消') + '</button>'
    + '<button class="lq-btn gold" id="lq-pw-yes">' + T('確定使用', '確定使用') + '</button></div></div>');
  $('lq-pw-no').onclick = closeModal;
  $('lq-pw-yes').onclick = function(){ closeModal(); usePower(kind); };
  return m;
}
async function usePower(kind){
  var r = ST.room; if(!r || r.meta.status !== 'question' || ST.choice != null || ST.used[kind] || ST.pwWait) return;
  if(kind === 'cut' && r.current.kind === 'tf') return;
  ST.used[kind] = true; ST.pwWait = pnow(); saveLocal(); drawStudentQuestion();
  try{
    await F.setDoc(sub(ST.pin, 'powerups', ST.uid + '_' + kind), { uid: ST.uid, kind: kind, q: r.current.qIndex, at: F.serverTimestamp() });
  }catch(e){
    ST.pwWait = null;
    if(e && e.code === 'permission-denied') toast(T('這個法寶這場已經用過了', '本場已使用過此法寶'));
    else { ST.used[kind] = false; toast(T('網路忙碌,再按一次', '傳送失敗,請重試')); }
    saveLocal(); drawStudentQuestion();
  }
}
function studentReveal(){
  var r = ST.room, rv = r.reveal;
  setTop('⚡ ' + (r.meta.title || T('搶答大挑戰', '英雄搶答擂台')), studentChips());
  setCtl('');
  if(!rv || rv.qIndex !== r.current.qIndex){
    setBody('<div class="lq-card"><div class="lq-h1">⏳ ' + T('時間到!公布答案中…', '計分中…') + '</div></div>');
    return;
  }
  var q = rv.qIndex, mine = ST.ans[q], ok = mine != null && mine === rv.answer;
  var rk = rv.ranks && rv.ranks[ST.uid];
  if(ST.sfxQ !== q){
    /* ★ v5.318.0 公布特效(每題只播一次;房間文件其他欄位更新時重畫畫面不會重播) */
    ST.sfxQ = q;
    ST.streak = ok ? (ST.streak || 0) + 1 : 0;
    var prevRank = ST.lastRank; ST.lastRank = rk ? rk[0] : null;
    if(ok){
      snd('correct', 0.7); vib([30, 40, 30]); fxShake('good');
      fxPop('+' + fmtPts(rk ? rk[3] : BASE_PTS), '#7dffb0');
      fxConfetti(ST.streak >= 3 ? 50 : 22, false);
      if(ST.streak >= 3) setTimeout(function(){ snd('streak', 0.6); fxPop('🔥 ' + ST.streak + T(' 連對!', ' 連續答對'), '#ffb347'); }, 900);
    }else{
      snd('wrong', 0.6); vib(mine == null ? 60 : [80, 60, 80]); fxShake('bad');
    }
    if(prevRank && rk && rk[0] < prevRank && !(ok && ST.streak >= 3)){
      setTimeout(function(){ snd('rankUp', 0.5); fxPop('⬆ ' + T('第 ' + rk[0] + ' 名!', '升至第 ' + rk[0] + ' 名'), '#ffd166'); }, ok ? 1000 : 300);
    }
  }
  var head = mine == null ? '<div class="lq-big lq-ng">⌛</div><div class="lq-h1">' + T('這題沒有作答', '本題未作答') + '</div>'
    : (ok ? '<div class="lq-big lq-ok">✔</div><div class="lq-h1">' + T('答對了!好厲害!', '正確!') + '</div>'
          : '<div class="lq-big lq-ng">✘</div><div class="lq-h1">' + T('差一點點,下一題加油!', '未命中') + '</div>');
  var ans = '<div class="lq-p">' + T('正確答案', '正解') + ':<b style="color:#ffd166">' + OPT_LETTER[rv.answer] + '. ' + esc(r.current.options[rv.answer]) + '</b></div>';
  /* ★ v5.318.0 乙:讓學生看到自己這題的秒數與得分 */
  var secTxt = (rk && rk[5] != null && rk[5] >= 0) ? ('⏱ ' + T('這題用了 ', '本題作答 ') + fmtSec(rk[5]) + ' ' + T('秒', '秒') + '・') : '';
  var gain = rk && mine != null ? '<div class="lq-p" style="font-size:1.35em;font-weight:900;color:' + (ok ? '#7dffb0' : '#ffb3b3') + '">' + secTxt
      + (ok ? '+' + fmtPts(rk[3]) + ' ' + T('分', '分') : T('答錯 0 分', '答錯 0 分')) + '</div>'
      + (ok ? '<div class="lq-p" style="font-size:13px;opacity:.7">' + T('答對 500 分＋速度分 ', '基本 500＋速度 ') + fmtPts(Math.max(0, (rk[3] || 0) - BASE_PTS)) + '</div>' : '') : '';
  var my = rk ? '<div class="lq-p" style="margin-top:6px">' + T('你現在是第', '目前排名第') + ' <b style="color:#ffd166;font-size:1.3em">' + rk[0] + '</b> ' + T('名', '名')
      + (rk[2] != null ? '・' + T('總分', '總分') + ' <b style="color:#ffd166">' + fmtPts(rk[2]) + '</b>' : '') + '・' + T('答對', '答對') + ' <b>' + rk[1] + '</b> ' + T('題', '題')
      + (rk[4] ? '<br><small style="color:#ffe9a8">' + T('🗡️💡 沒用法寶加成 +', '法寶保留加成 +') + rk[4] + '%</small>' : '') + '</div>' : '';
  var stk = ok && ST.streak >= 2 ? '<div><span class="lq-streak">🔥 ' + ST.streak + T(' 連對中!', ' 連續答對') + '</span></div>' : '';
  setBody('<div class="lq-card">' + head + stk + gain + ans + my + '</div>' + top5Html(rv.top5, ST.uid));
}
function top5Html(list, mineUid){
  if(!list || !list.length) return '';
  var medal = ['🥇', '🥈', '🥉', '4', '5'];
  var h = '<div class="lq-top5"><div class="lq-p" style="font-weight:900;color:#ffd166">🏆 ' + T('現在的前五名', '目前前五名') + '</div>';
  list.forEach(function(e, i){
    h += '<div class="r' + (e.uid === mineUid ? ' mine' : '') + '" style="animation-delay:' + (i * 0.08) + 's"><span class="n">' + medal[i] + '</span><span class="nm">' + esc(e.name)
      + '</span><span class="sc">' + (e.score != null ? (fmtPts(e.score) + ' 分<small style="opacity:.75;font-weight:700"> · 答對' + e.correct + (e.bonus ? ' · +' + e.bonus + '%' : '') + '</small>')
                                                     : (e.correct + ' 題 · ' + fmtSec(e.sec) + 's')) + '</span></div>';
  });
  return h + '</div>';
}
function studentEnded(){
  var r = ST.room, fin = r.final;
  if(!fin) bgmBack();
  setTop('⚡ ' + (r.meta.title || T('搶答大挑戰', '英雄搶答擂台')), [{ html: '🙋 ' + esc(myLabel()) }]);
  setCtl('');
  if(!fin && r.meta.cleared){   /* ★ v5.324.0 老師在主持台清除了這一場 */
    clearLocalPin(ST.pin);
    setBody('<div class="lq-card"><div class="lq-h1">👋 ' + T('老師已經關閉這一場了', '主持人已關閉本場') + '</div>'
      + '<div class="lq-p">' + T('這一場不會繼續,請輸入老師給的新房號。', '本場已關閉,請加入新的擂台。') + '</div>'
      + '<div class="lq-row"><button class="lq-btn" id="lq-cl-home">' + T('回首頁', '離開') + '</button><button class="lq-btn gold" id="lq-cl-new">🚀 ' + T('加入新的擂台', '加入新擂台') + '</button></div></div>');
    $('lq-cl-home').onclick = function(){ LQ.close(true); };
    $('lq-cl-new').onclick = studentQuit;
    return;
  }
  if(!fin){ setBody('<div class="lq-card"><div class="lq-h1">🏁 ' + T('比賽結束!老師正在統計…', '擂台結束,統計中…') + '</div></div>'); return; }
  var mine = null; (fin.list || []).forEach(function(e){ if(e.uid === ST.uid) mine = e; });
  var h = '<div class="lq-card">';
  if(!mine){ h += '<div class="lq-h1">🏁 ' + T('比賽結束了!', '擂台結束') + '</div>'; }
  else{
    if(mine.rank && mine.rank <= 3) h += '<div class="lq-big">' + ['🥇', '🥈', '🥉'][mine.rank - 1] + '</div>';
    h += '<div class="lq-h1">' + (mine.rank ? (T('你是第 ', '最終排名 第 ') + mine.rank + T(' 名!', ' 名')) : T('謝謝你參加!', '感謝參與')) + '</div>';
    if(mine.score != null) h += '<div class="lq-p" style="font-size:1.3em">' + T('總分', '總分') + ' <b style="color:#ffd166">' + fmtPts(mine.score) + '</b> ' + T('分', '分')
      + (mine.bonus ? '<small style="color:#ffe9a8">(' + T('沒用法寶加成 +', '法寶保留加成 +') + mine.bonus + '%)</small>' : '') + '</div>';
    h += '<div class="lq-p">' + T('答對', '答對') + ' <b style="color:#ffd166">' + mine.correct + '</b> / ' + (r.meta.played || r.meta.qCount) + ' ' + T('題', '題') + '</div>';
    if(r.meta.noAward){   /* ★ v5.325.0 老師決定本場不發獎勵(測試場/有爭議) */
      h += '<div class="lq-p" style="margin-top:10px;color:#ffd166">🚫 ' + T('這一場老師決定不發獎勵', '本場不發放獎勵')
        + (r.meta.noAwardReason ? '<br><small style="opacity:.85">(' + esc(r.meta.noAwardReason) + ')</small>' : '') + '</div>';
      clearLocal();
    }else if(mine.tier){
      var t = TIERS[mine.tier];
      h += '<div class="lq-p" style="margin-top:10px">🎁 ' + t.name + ':' + t.items.join('、') + '</div>';
      var got = r.awarded && r.awarded[ST.uid];
      h += '<div class="lq-p" style="margin-top:6px;color:' + (got ? '#7dffb0' : '#ffd166') + '">'
        + (got ? T('獎勵已經送到你的帳號了!到冒險模式的「🎁 GM獎勵」按確認領取喔!', '獎勵已寄送,請至冒險模式「🎁 GM獎勵」確認領取。')
               : T('老師正在頒發獎勵,等一下下~', '主持人頒發中…')) + '</div>';
      if(got){ clearLocal(); }
    }else{
      h += '<div class="lq-p" style="margin-top:10px;opacity:.8">' + T('這次作答的題數還不夠一半,下次要多搶答喔!', '本場作答題數未達一半,未符合參加獎資格。') + '</div>';
      clearLocal();
    }
  }
  h += '<div class="lq-row"><button class="lq-btn" id="lq-e-ok">' + T('回首頁', '離開') + '</button>'
    + '<button class="lq-btn gold" id="lq-e-new">🚀 ' + T('加入新的擂台', '加入新擂台') + '</button></div></div>';   /* ★ v5.321.0 結束後可直接輸入老師新開的房號 */
  /* ★ v5.318.0 老師:結束時的排行榜顯示「名次、班級座號、獲得獎勵」 */
  h += '<div class="lq-card lq-final" style="margin-top:12px"><div class="lq-h1" style="font-size:clamp(18px,3vmin,26px)">🏆 ' + T('全班排行榜', '最終排行榜') + '</div>'
    + finalTableHtml(fin.list || [], { mine: ST.uid }) + '</div>';
  var sc = $('lq-body') ? $('lq-body').scrollTop : 0;
  setBody(h);
  if(ST.endFx) $('lq-body').scrollTop = sc;   /* 頒獎狀態更新時重畫,不要跳回頂端 */
  $('lq-e-ok').onclick = function(){ LQ.close(true); };
  $('lq-e-new').onclick = studentQuit;
  /* 遊戲結束特效與音樂(只播一次) */
  if(!ST.endFx){
    ST.endFx = true;
    bgmWin();
    if(mine && mine.tier === 'A'){ snd('champ', 0.7); vib([60, 50, 60, 50, 160]); fxConfetti(110, true); setTimeout(function(){ snd('applause', 0.5); }, 700); fxPop(mine.rank <= 3 ? ['🥇', '🥈', '🥉'][mine.rank - 1] + ' ' + T('第 ' + mine.rank + ' 名!', '第 ' + mine.rank + ' 名') : '🏅 ' + T('前五名!', '前五名'), '#ffd166'); }
    else if(mine && mine.tier === 'B'){ snd('fanfare', 0.6); vib([40, 40, 80]); fxConfetti(60, true); fxPop('🎖 ' + T('第 ' + mine.rank + ' 名!', '第 ' + mine.rank + ' 名'), '#9ad0ff'); }
    else if(mine && mine.tier){ snd('thanks', 0.6); vib(50); fxConfetti(30, false); }
    else { snd('thanks', 0.5); }
  }
}
/* ★ v5.318.0 結算排行榜表格(學生端/主持端共用):名次、班級座號、名字、總分、答對、獲得獎勵 */
function finalTableHtml(list, o){
  o = o || {};
  var rows = list.map(function(e, i){
    var cc = entryCode(e), aw = o.awarded && o.awarded[e.uid];
    var medal = e.rank === 1 ? '🥇' : (e.rank === 2 ? '🥈' : (e.rank === 3 ? '🥉' : (e.rank || '—')));
    var rw = e.tier ? '<span class="lq-badge ' + e.tier + '">' + TIERS[e.tier].short + '</span> ' + esc(TIERS[e.tier].mini) : '<small style="opacity:.7">' + T('作答未達一半', '未達參加門檻') + '</small>';
    return '<tr class="' + (e.rank ? (e.rank <= 5 ? 'top' : '') : 'ne') + (e.uid === o.mine ? ' mine' : '') + '" style="animation-delay:' + Math.min(i * 0.04, 1.6) + 's">'
      + '<td><b>' + medal + '</b></td><td class="cd">' + esc(cc.c || '—') + '</td><td class="nm">' + esc(nameNoCode(e.name)) + (o.host ? ' <small style="opacity:.55">' + esc(e.account || '') + '</small>' : '') + '</td>'
      + '<td><b>' + (e.score != null ? fmtPts(e.score) : '—') + '</b>' + (e.bonus ? '<small style="color:#ffe9a8"> +' + e.bonus + '%</small>' : '') + '</td>'
      + '<td>' + e.correct + ' / ' + (e.avail || e.answered) + '</td>'
      + '<td class="rw">' + rw + '</td>'
      + (o.host ? '<td>' + (aw ? '✅' : (e.tier ? '…' : '')) + '</td><td>' + (e.d ? '<button class="lq-dbtn" data-detail="' + e.uid + '">📋</button>' : '') + '</td>' : '')
      + '</tr>';
  }).join('');
  return '<div style="overflow-x:auto;width:100%"><table class="lq-table lq-final" style="width:100%"><tr><th>' + T('名次', '名次') + '</th><th>' + T('班級座號', '班級座號') + '</th><th>' + T('名字', '姓名') + '</th><th>' + T('總分', '總分') + '</th><th>' + T('答對', '答對') + '</th><th>' + T('獲得獎勵', '獲得獎勵') + '</th>'
    + (o.host ? '<th>已發</th><th>明細</th>' : '') + '</tr>' + rows + '</table></div>';
}

/* ═════════════════════════════════════════════════════════════════
 *  主持端(GM / 主持人)
 * ═════════════════════════════════════════════════════════════════ */
var H = {
  reset: function(){ this.stop(); this.pin = null; this.room = null; this.status = null; this.qs = []; this.players = {}; this.joinQ = {};
    this.answers = {}; this.startAt = {}; this.power = {}; this.qIndex = -1; this.revealing = false; this.auto = false; this.autoH = null;
    this.qLocal = 0; this.createdAt = 0; this.title = ''; this.timeLimit = MAX_SEC; this.final = null; this.awarded = {}; this.granting = false;
    this.seen = {}; this.onl = {}; this.zeroAt = {}; this.lastAny = 0; this.netCache = false; this.dcN = {}; this.noAward = false; this.noAwardReason = ''; this.roster = []; this.leave = {}; this.lobbyKey = ''; this.onlT = 0; this.onlInit = false; this.gap = {};
    this.draft = this.draft || { qs: [], title: '', sec: MAX_SEC, shuf: true, classes: [] }; },
  stop: function(){ (this.unsubs || []).forEach(function(f){ try{ f(); }catch(_){} }); this.unsubs = [];
    (this.qUnsubs || []).forEach(function(f){ try{ f(); }catch(_){} }); this.qUnsubs = [];
    if(this.tick){ clearInterval(this.tick); this.tick = null; } if(this.autoH){ clearTimeout(this.autoH); this.autoH = null; }
    if(this.saveH){ clearTimeout(this.saveH); this.saveH = null; } if(this.cntH){ clearTimeout(this.cntH); this.cntH = null; }
    (this.endT || []).forEach(function(t){ clearTimeout(t); }); this.endT = []; },
  unsubs: [], qUnsubs: [], tick: null, draft: null
};

async function hostHome(){
  H.stop();
  setTop('🎤 ' + T('搶答擂台・主持台', '擂台主持台'));
  setCtl('');
  setBody('<div class="lq-card"><div class="lq-p">讀取中…</div></div>');
  var mine = [];
  try{
    var b = await F.getDoc(F.doc(db(), 'liveQuizBoard', BOARD_DOC));
    var rooms = (b.exists() && b.data().rooms) || {};
    var u = me();
    Object.keys(rooms).forEach(function(pin){ var e = rooms[pin]; if(e && e.hostUid === u.uid) mine.push({ pin: pin, e: e }); });
  }catch(_){}
  var h = '';
  if(mine.length){
    /* ★ v5.324.0(老師「接續之前未結束的房間,要有清除功能」)— 每一場旁邊加 🗑 清除,另有「🧹 全部清除」 */
    h += '<div class="lq-card" style="margin-bottom:12px"><div class="lq-h1" style="font-size:22px">↩️ ' + T('回到你還沒關掉的擂台', '接續未關閉的擂台') + '</div>'
      + '<div class="lq-p" style="font-size:14px;opacity:.85">' + T('按房號回到那一場;不要的舊房間按 🗑 清除(學生就不會再被拉回去)', '點選房號接續;不需要的舊場次可按 🗑 清除') + '</div><div class="lq-row">';
    mine.sort(function(a, b){ return (b.e.at || 0) - (a.e.at || 0); }).forEach(function(m){
      h += '<span style="display:inline-flex;gap:4px;align-items:center"><button class="lq-btn green" data-pin="' + m.pin + '">' + m.pin + '・' + esc(m.e.title || '') + (m.e.st === 'ended' ? '(待頒獎/關閉)' : '') + '</button>'
        + '<button class="lq-btn gray" data-clr="' + m.pin + '" title="清除這一場" style="padding-left:12px;padding-right:12px">🗑</button></span>';
    });
    h += '</div>' + (mine.length > 1 ? '<div class="lq-row"><button class="lq-btn gray" id="lq-clr-all">🧹 ' + T('全部清除', '全部清除') + '(' + mine.length + ')</button></div>' : '') + '</div>';
  }
  setBody(h + '<div id="lq-setup"></div>');
  Array.prototype.forEach.call(document.querySelectorAll('#lq-body [data-pin]'), function(b){
    b.onclick = function(){ hostResume(b.getAttribute('data-pin')); };
  });
  Array.prototype.forEach.call(document.querySelectorAll('#lq-body [data-clr]'), function(b){
    var pin = b.getAttribute('data-clr'), m = mine.filter(function(x){ return x.pin === pin; })[0];
    b.onclick = function(){
      confirmBox(T('要清除房號 <b>' + pin + '</b>「' + esc((m && m.e.title) || '') + '」嗎?', '確定清除房號 <b>' + pin + '</b>?')
        + '<br><small>' + T('還在這一場的同學會看到「老師已經關閉這一場」,可以改加入新的擂台。', '仍在本場的參加者會收到關閉通知,可改加入新擂台。')
        + (m && m.e.st === 'ended' ? '<br>⚠ ' + T('這一場已經結束但可能還沒頒完獎,清除後就不能從這裡繼續頒獎。', '本場可能尚未頒獎完畢,清除後無法在此繼續頒獎。') : '') + '</small>',
        T('清除', '清除'), function(){ clearRooms([m]); });
    };
  });
  if($('lq-clr-all')) $('lq-clr-all').onclick = function(){
    var notAw = mine.filter(function(x){ return x.e.st === 'ended'; }).length;
    confirmBox(T('要清除全部 <b>' + mine.length + '</b> 個沒關掉的擂台嗎?', '確定清除全部 <b>' + mine.length + '</b> 個未關閉場次?')
      + '<br><small>' + T('還在這些房間的同學會看到「老師已經關閉這一場」。', '仍在這些場次的參加者會收到關閉通知。')
      + (notAw ? '<br>⚠ ' + T('其中 ' + notAw + ' 場已結束但可能還沒頒完獎,清除後就不能從這裡繼續頒獎。', '其中 ' + notAw + ' 場可能尚未頒獎完畢。') : '') + '</small>',
      T('全部清除', '全部清除'), function(){ clearRooms(mine); });
  };
  hostSetup();
}
/* ★ v5.324.0 清除舊房間:還沒結束的場次 ⇒ 房間標成已結束＋cleared(學生端改顯示「老師已經關閉這一場」、不會再被自動拉回);
   再從首頁看板移除(首頁橫幅不再發亮、這裡也不再列出)。成績、作答紀錄不刪(雲端永久保留原則)。 */
async function clearRooms(list){
  var ok = 0, fail = 0;
  for(var i = 0; i < list.length; i++){
    var m = list[i]; if(!m) continue;
    try{
      var s = await F.getDoc(roomRef(m.pin));
      if(s.exists() && s.data().meta && s.data().meta.status !== 'ended'){
        await F.updateDoc(roomRef(m.pin), { 'meta.status': 'ended', 'meta.endedAt': now(), 'meta.cleared': true });
      }
      await boardRemove(m.pin);
      ok++;
    }catch(e){ fail++; try{ console.warn('[LQ] 清除失敗', m.pin, e && (e.code || e.message)); }catch(_){} }
  }
  toast(fail ? T('清除了 ' + ok + ' 個,' + fail + ' 個失敗(網路不穩?再試一次)', '已清除 ' + ok + ' 個,失敗 ' + fail + ' 個') : T('已清除 ' + ok + ' 個舊擂台', '已清除 ' + ok + ' 個場次'));
  hostHome();
}

/* ───────── 選題 ───────── */
/* ★ v5.318.0(老師「搶答擂台可以選擇小英雄中所有的題庫」)— 把主程式裡所有「選擇題型」題庫整理成一份目錄:
   📘 低/中/高年級學科(ADV_QUIZ_DB,含 GM 動態擴充題)、🗺 關卡題庫(中國關/日本關/埃及/關島交流/木柵動物園/台灣環島…)、
   🔬 自然單元題庫(五下/六上各單元)、🎯 主題題庫(照顧幼兒/領養狗狗/機關王大賽/遊戲知識基礎篇);📝 考試複習另一個分頁。
   ⚠ 不收:音樂互動題(聽音/簡譜/拍子/QTE)與圖片題(老師裁定 Q6 甲,第一版只做文字選擇題);小遊戲/荒島的題目是互動玩法,不是選擇題,也不收。
   兩個選項的題目(例如台灣環島部分題)當成二選一,和是非題一樣不能用「刪掉一個錯的」。 */
var BANK_GROUPS = [
  { id: 'g低年級', name: '📘 低年級學科' }, { id: 'g中年級', name: '📘 中年級學科' }, { id: 'g高年級', name: '📘 高年級學科' },
  { id: 'stage', name: '🗺 關卡題庫' }, { id: 'unit', name: '🔬 自然單元題庫' }, { id: 'theme', name: '🎯 主題題庫' }, { id: 'other', name: '📦 其他' }
];
var _bank = null;
function bankAll(){
  if(_bank) return _bank;
  var out = [], seen = {};
  /* const 全域(各 classic script 共用的語彙範圍)逐一明寫取用,不用 eval */
  var G = {
    ADV_QUIZ_DB:            function(){ return typeof ADV_QUIZ_DB !== 'undefined' ? ADV_QUIZ_DB : null; },
    TAIWAN_QUIZ_DB:         function(){ return typeof TAIWAN_QUIZ_DB !== 'undefined' ? TAIWAN_QUIZ_DB : null; },
    ADV_QUIZ_5S_MIDTERM:    function(){ return typeof ADV_QUIZ_5S_MIDTERM !== 'undefined' ? ADV_QUIZ_5S_MIDTERM : null; },
    ADV_QUIZ_5S_U3_ANIMAL:  function(){ return typeof ADV_QUIZ_5S_U3_ANIMAL !== 'undefined' ? ADV_QUIZ_5S_U3_ANIMAL : null; },
    ADV_QUIZ_5S_U4_SOUND:   function(){ return typeof ADV_QUIZ_5S_U4_SOUND !== 'undefined' ? ADV_QUIZ_5S_U4_SOUND : null; },
    ADV_QUIZ_6S_U1_WEATHER: function(){ return typeof ADV_QUIZ_6S_U1_WEATHER !== 'undefined' ? ADV_QUIZ_6S_U1_WEATHER : null; },
    ADV_QUIZ_6S_U2_HEAT:    function(){ return typeof ADV_QUIZ_6S_U2_HEAT !== 'undefined' ? ADV_QUIZ_6S_U2_HEAT : null; },
    ADV_QUIZ_6S_U3_LAND:    function(){ return typeof ADV_QUIZ_6S_U3_LAND !== 'undefined' ? ADV_QUIZ_6S_U3_LAND : null; },
    ADV_QUIZ_6S_U4_EM:      function(){ return typeof ADV_QUIZ_6S_U4_EM !== 'undefined' ? ADV_QUIZ_6S_U4_EM : null; },
    ADV_QUIZ_CARE_INFANT:   function(){ return typeof ADV_QUIZ_CARE_INFANT !== 'undefined' ? ADV_QUIZ_CARE_INFANT : null; },
    ADV_QUIZ_DOG_CARE:      function(){ return typeof ADV_QUIZ_DOG_CARE !== 'undefined' ? ADV_QUIZ_DOG_CARE : null; },
    ADV_QUIZ_GREENMECH:     function(){ return typeof ADV_QUIZ_GREENMECH !== 'undefined' ? ADV_QUIZ_GREENMECH : null; },
    SPECIAL_CHALLENGE_QUIZ: function(){ return typeof SPECIAL_CHALLENGE_QUIZ !== 'undefined' ? SPECIAL_CHALLENGE_QUIZ : null; }
  };
  function g(name){ try{ return G[name] ? G[name]() : null; }catch(_){ return null; } }
  function add(list, grp, setOf, tag){
    if(!Array.isArray(list)) return;
    for(var i = 0; i < list.length; i++){
      var q = list[i];
      if(!q || typeof q.question !== 'string' || !Array.isArray(q.options)) continue;
      if(q.ear || q.notes || q.seq || q.type || q.pic || q.img) continue;
      var n = q.options.length; if(n < 2 || n > 4) continue;
      var ai = 'ABCD'.indexOf(String(q.answer == null ? '' : q.answer).toUpperCase());
      if(ai < 0 && typeof q.answer === 'number') ai = q.answer;
      if(ai < 0 || ai >= n) continue;
      var key = (tag || '') + (q.id != null ? q.id : q.question);
      var tk = q.question + '|' + q.options.join('|');
      if(seen[tk]) continue; seen[tk] = 1;
      var set = setOf(q);
      out.push({ grp: typeof grp === 'function' ? grp(q) : grp, set: set, diff: q.difficulty || '', t: q.question, o: q.options.map(String), a: ai,
                 kind: n === 2 ? 'tf' : 'mc', src: set, why: q.hint || q.why || '', key: 'b' + key });
    }
  }
  var std = { '低年級': 1, '中年級': 1, '高年級': 1 };
  var stageGrades = { '中國關': 1, '日本關': 1, '埃及': 1, '關島交流': 1, '木柵動物園': 1, '台灣環島': 1 };
  add(g('ADV_QUIZ_DB'), function(q){ return std[q.grade] ? 'g' + q.grade : (stageGrades[q.grade] ? 'stage' : 'other'); },
      function(q){ return std[q.grade] ? q.subject : (q.grade === q.subject || !q.subject ? q.grade : q.grade + '・' + q.subject); }, 'a');
  add(g('TAIWAN_QUIZ_DB'), 'stage', function(q){ return q.subject || '台灣環島'; }, 't');
  ['ADV_QUIZ_5S_MIDTERM', 'ADV_QUIZ_5S_U3_ANIMAL', 'ADV_QUIZ_5S_U4_SOUND', 'ADV_QUIZ_6S_U1_WEATHER', 'ADV_QUIZ_6S_U2_HEAT', 'ADV_QUIZ_6S_U3_LAND', 'ADV_QUIZ_6S_U4_EM']
    .forEach(function(nm){ add(g(nm), 'unit', function(q){ return q.subject || nm; }, nm); });
  ['ADV_QUIZ_CARE_INFANT', 'ADV_QUIZ_DOG_CARE', 'ADV_QUIZ_GREENMECH'].forEach(function(nm){ add(g(nm), 'theme', function(q){ return q.subject || nm; }, nm); });
  add(g('SPECIAL_CHALLENGE_QUIZ'), 'theme', function(){ return '遊戲知識基礎篇'; }, 'sc');
  _bank = out;
  return out;
}
function bankSets(grp){
  var c = {}, order = [];
  bankAll().forEach(function(q){ if(q.grp !== grp) return; if(!c[q.set]){ c[q.set] = 0; order.push(q.set); } c[q.set]++; });
  return order.map(function(s){ return { name: s, n: c[s] }; });
}
function bankPool(grp, sets, diff){
  var all = bankAll().filter(function(q){ return q.grp === grp && (!sets.length || sets.indexOf(q.set) >= 0); });
  if(diff){ var f = all.filter(function(q){ return q.diff === diff; }); if(f.length) return f; }
  return all;
}
function ensureExam(cb){
  if(window.ExamCore){ setupExam(); cb(true); return; }
  var s = document.createElement('script'); s.src = 'exam/exam_core.js?v=20261023';
  s.onload = function(){ setupExam(); cb(!!window.ExamCore); }; s.onerror = function(){ cb(false); };
  document.head.appendChild(s);
}
function setupExam(){
  try{
    var C = window.ExamCore; if(!C || C._lqInit) return;
    if(!C.base) C.init({ base: 'exam/' });
    try{ C.setTerms(window._reviewBoostCfg || null); }catch(_){}
    try{ if(window._lxpsExamByBook) C.setSchoolMap(window._lxpsExamByBook); }catch(_){}
    C._lqInit = true;
  }catch(_){}
}
function parseCustom(text){
  var out = [], bad = 0;
  String(text || '').split(/\r?\n/).forEach(function(line){
    line = line.trim(); if(!line) return;
    var p = line.split(/\t|｜|\|/).map(function(s){ return s.trim(); }).filter(function(s, i, a){ return s !== '' || i < a.length - 1; });
    if(p.length === 4 || p.length === 6){
      var opts = p.slice(1, p.length - 1), ans = p[p.length - 1].toUpperCase(), ai = -1;
      if(/^[1-4]$/.test(ans)) ai = +ans - 1;
      else if(/^[A-D]$/.test(ans)) ai = 'ABCD'.indexOf(ans);
      else { for(var k = 0; k < opts.length; k++) if(opts[k].toUpperCase() === ans) ai = k; }
      if(p.length === 4 && /^(O|○|◯|對|是)$/i.test(ans)) ai = 0;
      if(p.length === 4 && /^(X|✕|×|錯|否)$/i.test(ans)) ai = 1;
      if(ai >= 0 && ai < opts.length && p[0]){
        out.push({ t: p[0].slice(0, 200), o: opts.map(function(s){ return s.slice(0, 60); }), a: ai, kind: opts.length === 2 ? 'tf' : 'mc', src: '自訂', why: '', key: 'c' + out.length + '_' + p[0].slice(0, 20) });
        return;
      }
    }
    bad++;
  });
  return { list: out, bad: bad };
}

function hostSetup(){
  var D = H.draft;
  if(!D.title){ var d = new Date(); D.title = (d.getMonth() + 1) + '/' + d.getDate() + ' ' + T('搶答擂台', '英雄搶答擂台'); }
  var box = $('lq-setup');
  var secOpts = SEC_OPTIONS.map(function(s){ return '<option value="' + s + '"' + (s === D.sec ? ' selected' : '') + '>' + s + ' 秒</option>'; }).join('');
  box.innerHTML = '<div class="lq-form">'
    + '<div class="lq-fs"><h3>① 場次名稱與規則</h3>'
    + '<label>名稱 <input type="text" id="lq-f-title" maxlength="30" value="' + esc(D.title) + '" style="width:min(70vw,380px)"></label>'
    + '<label>每題 <select id="lq-f-sec">' + secOpts + '</select></label>'
    + '<label><input type="checkbox" id="lq-f-shuf"' + (D.shuf ? ' checked' : '') + '> 選項順序打亂</label>'
    + '<div style="font-size:14px;opacity:.75;margin-top:4px">全員作答完會立刻公布並計分。計分:答對 500 分＋速度分最多 500 分;每保留一個沒用的法寶總分 +5%(兩個都沒用 +10%)。同分比答對題數、再比秒數。法寶每人每場各 1 次。</div></div>'
    + '<div class="lq-fs"><h3>② 加入題目(可混合三種來源)</h3>'
    + '<div class="lq-tabs" id="lq-f-tabs"><button data-t="adv" class="on">📚 小英雄題庫</button><button data-t="exam">📝 考試複習</button><button data-t="custom">✍️ 自訂題目</button></div>'
    + '<div id="lq-f-src"></div></div>'
    + '<div class="lq-fs"><h3>③ 本場題目 <span id="lq-f-cnt"></span></h3><div class="lq-qlist" id="lq-f-list"></div>'
    + '<div class="lq-row"><button class="lq-btn gray" id="lq-f-clear">清空</button><button class="lq-btn gray" id="lq-f-save">💾 存成題組</button><button class="lq-btn gray" id="lq-f-sets">📂 我的題組</button><button class="lq-btn gray" id="lq-f-hist">📜 擂台紀錄</button><button class="lq-btn gray" id="lq-f-cb">🏫 班級排行榜</button>'
    + (isAdmin() ? '<button class="lq-btn gray" id="lq-f-hosts">👥 主持人管理</button>' : '') + '</div></div>'
    + '<div class="lq-fs"><h3>④ 應到名單(勾選參賽班級)<span id="lq-f-clsn" style="font-size:.8em;opacity:.8"></span></h3><div class="lq-cls" id="lq-f-cls"></div>'
    + '<div style="font-size:14px;opacity:.75;margin-top:4px">勾了班級,等候室會先列出全班座號(暗色),同學加入就會亮起來;沒來的可以點一下標「請假」。不勾也可以開房,就只顯示已加入的人。</div></div>'
    + '<div class="lq-row" style="margin-bottom:20px"><button class="lq-btn gold" id="lq-f-open" style="font-size:24px;padding:14px 34px">🚪 開房!</button></div>'
    + '</div>';
  $('lq-f-title').oninput = function(){ D.title = this.value; };
  $('lq-f-sec').onchange = function(){ D.sec = Math.min(MAX_SEC, +this.value || MAX_SEC); };
  $('lq-f-shuf').onchange = function(){ D.shuf = this.checked; };
  $('lq-f-tabs').onclick = function(e){
    var b = e.target.closest('button'); if(!b) return;
    Array.prototype.forEach.call(this.children, function(x){ x.classList.toggle('on', x === b); });
    srcTab(b.getAttribute('data-t'));
  };
  $('lq-f-clear').onclick = function(){ D.qs = []; drawList(); };
  $('lq-f-save').onclick = saveSet;
  $('lq-f-sets').onclick = loadSets;
  $('lq-f-hist').onclick = showHistory;
  $('lq-f-cb').onclick = function(){ CB.arr = null; showClassBoard(); };
  if($('lq-f-hosts')) $('lq-f-hosts').onclick = hostManager;
  $('lq-f-open').onclick = hostCreate;
  srcTab('adv'); drawList(); drawCls();

  function drawCls(){
    var el = $('lq-f-cls'); if(!el) return;
    D.classes = D.classes || [];
    var all = rosterClasses();
    if(!all.length){
      el.innerHTML = '<span style="opacity:.7;font-size:14px">' + T('找不到學生名冊(名單還沒載入),可以不勾直接開房', '學生名冊尚未載入,仍可直接開房') + '</span>';
      drawCls.retry = (drawCls.retry || 0) + 1;
      if(drawCls.retry <= 5) setTimeout(function(){ if($('lq-f-cls')) drawCls(); }, 2000);
      return;
    }
    D.classes = D.classes.filter(function(c){ return all.indexOf(c) >= 0; });
    /* 只剩「入學年對不上的舊帳號」的班級(名冊殘留,如 3年6班)不列出來,避免老師勾到幽靈班 */
    if(!drawCls.cnt){
      drawCls.cnt = {};
      all.forEach(function(c){ var r = buildRoster([c]); if(r.some(function(x){ return x.f > 0; })) drawCls.cnt[c] = r.length; });
    }
    all = all.filter(function(c){ return drawCls.cnt[c] != null; });
    el.innerHTML = all.map(function(c){ var on = D.classes.indexOf(c) >= 0; return '<label class="' + (on ? 'on' : '') + '"><input type="checkbox" data-cls="' + esc(c) + '"' + (on ? ' checked' : '') + '> ' + esc(c) + ' <small style="opacity:.6">' + (drawCls.cnt[c] || 0) + '</small></label>'; }).join('');
    var n = buildRoster(D.classes).length;
    $('lq-f-clsn').textContent = D.classes.length ? '  → 應到 ' + n + ' 人' : '';
    el.onchange = function(e){
      var c = e.target && e.target.getAttribute('data-cls'); if(!c) return;
      var i = D.classes.indexOf(c);
      if(e.target.checked && i < 0) D.classes.push(c); else if(!e.target.checked && i >= 0) D.classes.splice(i, 1);
      drawCls();
    };
  }

  function addQs(list, n){
    var have = {}; D.qs.forEach(function(q){ have[q.key] = 1; });
    var pick = shuffle(list.filter(function(q){ return !have[q.key]; }));
    var room = MAX_Q - D.qs.length, k = Math.min(n, room, pick.length);
    for(var i = 0; i < k; i++) D.qs.push(pick[i]);
    if(!k) toast(room <= 0 ? '最多 ' + MAX_Q + ' 題' : '沒有更多符合條件的題目了');
    else toast('加入 ' + k + ' 題');
    drawList();
  }
  function nSel(id){ return '<label>抽 <select id="' + id + '">' + [5, 10, 15, 20].map(function(n){ return '<option' + (n === 10 ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select> 題</label>'; }
  function srcTab(t){
    var s = $('lq-f-src');
    if(t === 'adv'){
      var grps = BANK_GROUPS.filter(function(gp){ return bankSets(gp.id).length; });
      s.innerHTML = '<div><label>題庫 <select id="lq-a-g">' + grps.map(function(gp){ var n = 0; bankSets(gp.id).forEach(function(x){ n += x.n; }); return '<option value="' + gp.id + '">' + gp.name + '(' + n + ' 題)</option>'; }).join('') + '</select></label>'
        + '<label>難度 <select id="lq-a-d"><option value="">全部</option>' + ADV_DIFFS.map(function(d){ return '<option>' + d + '</option>'; }).join('') + '</select></label></div>'
        + '<div id="lq-a-subs" style="margin:6px 0"></div><div>' + nSel('lq-a-n') + ' <button class="lq-btn" id="lq-a-add" style="padding:8px 16px;font-size:16px">➕ 加入</button> <span id="lq-a-info" style="opacity:.7;font-size:14px"></span></div>';
      var subs = function(){
        var g = $('lq-a-g').value;
        $('lq-a-subs').innerHTML = bankSets(g).map(function(sj){ return '<label><input type="checkbox" value="' + esc(sj.name) + '"> ' + esc(sj.name) + ' <small style="opacity:.6">' + sj.n + '</small></label>'; }).join('') || '<span style="opacity:.7">題庫還沒載入</span>';
        info();
      };
      var sel = function(){ return Array.prototype.map.call(document.querySelectorAll('#lq-a-subs input:checked'), function(x){ return x.value; }); };
      var info = function(){ $('lq-a-info').textContent = '符合 ' + bankPool($('lq-a-g').value, sel(), $('lq-a-d').value).length + ' 題(沒勾＝這個題庫全部)'; };
      $('lq-a-g').onchange = subs; $('lq-a-d').onchange = info; $('lq-a-subs').onchange = info;
      $('lq-a-add').onclick = function(){ addQs(bankPool($('lq-a-g').value, sel(), $('lq-a-d').value), +$('lq-a-n').value); };
      subs();
    }else if(t === 'exam'){
      s.innerHTML = '<div class="lq-p" style="font-size:15px">載入考試複習題庫…</div>';
      ensureExam(function(ok){
        if(!ok){ s.innerHTML = '<div class="lq-p">考試複習題庫載入失敗,請檢查網路</div>'; return; }
        var C = window.ExamCore;
        C.loadIndex(function(ok2){
          if(!ok2){ s.innerHTML = '<div class="lq-p">考試複習目錄載入失敗</div>'; return; }
          var books = Object.keys((window.EXAM_INDEX && window.EXAM_INDEX.books) || {});
          var order = ['三上自然','三上社會','四上自然','四上社會','五上自然','五上社會','六上自然','六上社會','三下自然','三下社會','四下自然','四下社會','五下自然','五下社會','六下自然','六下社會'];
          books.sort(function(a, b){ return (order.indexOf(a) < 0 ? 99 : order.indexOf(a)) - (order.indexOf(b) < 0 ? 99 : order.indexOf(b)); });
          s.innerHTML = '<div><label>冊別 <select id="lq-e-b">' + books.map(function(b){ return '<option>' + esc(b) + '</option>'; }).join('') + '</select></label>'
            + '<label>版本 <select id="lq-e-v"><option>南一</option><option>翰林</option><option>康軒</option></select></label>'
            + '<button class="lq-btn gray" id="lq-e-term" style="padding:6px 12px;font-size:15px">⭐ 套用本次評量範圍</button></div>'
            + '<div id="lq-e-units" style="margin:6px 0"></div><div>' + nSel('lq-e-n') + ' <button class="lq-btn" id="lq-e-add" style="padding:8px 16px;font-size:16px">➕ 加入</button> <span id="lq-e-info" style="opacity:.7;font-size:14px"></span></div>';
          var units = function(){
            var b = $('lq-e-b').value, v = $('lq-e-v').value;
            $('lq-e-units').innerHTML = C.units(b, v).map(function(u){ return '<label><input type="checkbox" value="' + u.u + '"> 第' + u.u + '單元 ' + esc(u.t) + '</label>'; }).join('');
            $('lq-e-info').textContent = '';
          };
          var setVer = function(){ try{ var sv = C.schoolVer($('lq-e-b').value); if(sv) $('lq-e-v').value = sv; }catch(_){} units(); };
          $('lq-e-b').onchange = setVer; $('lq-e-v').onchange = units;
          $('lq-e-term').onclick = function(){
            var b = $('lq-e-b').value, terms = (C.bookActiveTerms && C.bookActiveTerms(b)) || [];
            if(!terms.length){ toast('這一冊目前沒有勾選中的評量範圍'); return; }
            var us = C.termUnits(terms[0]);
            Array.prototype.forEach.call(document.querySelectorAll('#lq-e-units input'), function(x){ x.checked = us.indexOf(+x.value) >= 0; });
            toast('已勾選「' + C.termLabel(terms[0]) + '」範圍');
          };
          $('lq-e-add').onclick = function(){
            var b = $('lq-e-b').value, v = $('lq-e-v').value;
            var us = Array.prototype.map.call(document.querySelectorAll('#lq-e-units input:checked'), function(x){ return +x.value; });
            $('lq-e-info').textContent = '下載題目中…';
            C.loadBook(b, function(ok3){
              if(!ok3){ $('lq-e-info').textContent = '下載失敗'; return; }
              var pool = C.pool({ book: b, vers: [v], units: us }).filter(function(q){ return !q.pic && q.o && q.o.length === 4 && q.o.every(function(x){ return x !== '' && x != null; }); });
              $('lq-e-info').textContent = '符合 ' + pool.length + ' 題';
              addQs(pool.map(function(q){ return { t: q.q, o: q.o.map(String), a: q.a, kind: 'mc', src: q.range, why: q.why || '', key: 'ex' + b + q.id }; }), +$('lq-e-n').value);
            });
          };
          setVer();
        });
      });
    }else{
      s.innerHTML = '<div style="font-size:14px;line-height:1.6;opacity:.85">一行一題,用 <b>｜</b> 或 <b>|</b> 或 Tab 分隔(可直接從試算表複製貼上):<br>'
        + '四選一:<code>題目｜選項A｜選項B｜選項C｜選項D｜答案(A~D 或 1~4)</code><br>是非:<code>題目｜O｜X｜O 或 X</code></div>'
        + '<textarea id="lq-c-txt" placeholder="臺灣最高的山是哪一座?｜玉山｜雪山｜合歡山｜阿里山｜A&#10;水在攝氏 100 度會沸騰。｜O｜X｜O"></textarea>'
        + '<div class="lq-row" style="justify-content:flex-start"><button class="lq-btn" id="lq-c-add" style="padding:8px 16px;font-size:16px">➕ 全部加入</button><span id="lq-c-info" style="opacity:.75;font-size:14px"></span></div>';
      $('lq-c-add').onclick = function(){
        var r = parseCustom($('lq-c-txt').value);
        $('lq-c-info').textContent = '可用 ' + r.list.length + ' 題' + (r.bad ? ',格式不對 ' + r.bad + ' 行' : '');
        if(r.list.length){
          var room = MAX_Q - D.qs.length; D.qs = D.qs.concat(r.list.slice(0, Math.max(0, room)));
          if(r.list.length > room) toast('最多 ' + MAX_Q + ' 題,多的沒有加入');
          drawList();
        }
      };
    }
  }
  function drawList(){
    $('lq-f-cnt').textContent = '(' + D.qs.length + ' / ' + MAX_Q + ' 題)';
    $('lq-f-list').innerHTML = D.qs.map(function(q, i){
      return '<div class="lq-qi"><span class="no">' + (i + 1) + '.</span><span class="tx">' + esc(q.t) + '<small>' + esc(q.src) + (q.kind === 'tf' ? '|是非題' : '|選擇題') + '</small></span><button data-i="' + i + '">✕</button></div>';   /* ★ v5.320.0 老師:主持人選題時不顯示答案 */
    }).join('') || '<div class="lq-p" style="font-size:15px;opacity:.7">還沒有題目,從上面加入吧</div>';
    $('lq-f-list').onclick = function(e){ var b = e.target.closest('button'); if(!b) return; D.qs.splice(+b.getAttribute('data-i'), 1); drawList(); };
    $('lq-f-open').disabled = D.qs.length < MIN_Q;
  }
  async function saveSet(){
    if(!D.qs.length){ toast('先加入題目'); return; }
    var name = prompt('題組名稱', D.title); if(!name) return;
    try{
      var u = me(), id = u.uid.slice(0, 10) + '_' + now();
      await F.setDoc(F.doc(db(), 'liveQuizSets', id), { ownerUid: u.uid, ownerEmail: myEmail(), name: String(name).slice(0, 40), qs: D.qs.map(packQ), at: now() });
      toast('已存成題組「' + name + '」');
    }catch(e){ toast('儲存失敗:' + (e.code || e.message)); }
  }
  async function loadSets(){
    var m = modal('<div class="lq-h1" style="font-size:22px">📂 我的題組</div><div id="lq-sets" class="lq-p">讀取中…</div><div class="lq-row"><button class="lq-btn gray" id="lq-sets-x">關閉</button></div>');
    $('lq-sets-x').onclick = closeModal;
    try{
      var u = me();
      var qq = F.query(F.collection(db(), 'liveQuizSets'), F.where('ownerUid', '==', u.uid));
      var ss = await F.getDocs(qq), arr = [];
      ss.forEach(function(d){ arr.push({ id: d.id, d: d.data() }); });
      arr.sort(function(a, b){ return (b.d.at || 0) - (a.d.at || 0); });
      $('lq-sets').innerHTML = arr.length ? arr.map(function(x){
        return '<div class="lq-qi" style="font-size:16px"><span class="tx">' + esc(x.d.name) + '<small>' + (x.d.qs || []).length + ' 題・' + new Date(x.d.at).toLocaleDateString() + '</small></span>'
          + '<button class="lq-btn" style="width:auto;height:auto;padding:6px 12px;font-size:15px" data-load="' + x.id + '">載入</button>'
          + '<button data-del="' + x.id + '">✕</button></div>';
      }).join('') : '還沒有存過題組';
      $('lq-sets').onclick = async function(e){
        var b = e.target.closest('button'); if(!b) return;
        var id = b.getAttribute('data-load') || b.getAttribute('data-del');
        var x = arr.filter(function(y){ return y.id === id; })[0]; if(!x) return;
        if(b.hasAttribute('data-load')){
          D.qs = (x.d.qs || []).map(unpackQ).slice(0, MAX_Q); D.title = x.d.name || D.title;
          closeModal(); hostSetup(); toast('已載入「' + x.d.name + '」');
        }else if(confirm('刪除題組「' + x.d.name + '」?')){
          try{ await F.deleteDoc(F.doc(db(), 'liveQuizSets', id)); b.closest('.lq-qi').remove(); }catch(err){ toast('刪除失敗'); }
        }
      };
    }catch(e){ $('lq-sets').textContent = '讀取失敗:' + (e.code || e.message); }
  }
}
function packQ(q){ return { t: q.t, o: q.o, a: q.a, k: q.kind, s: q.src || '', w: q.why || '', y: q.key || '' }; }
function unpackQ(q){ return { t: q.t, o: q.o, a: q.a, kind: q.k || (q.o.length === 2 ? 'tf' : 'mc'), src: q.s || '', why: q.w || '', key: q.y || ('r' + Math.random()) }; }

/* ───────── 開房 ───────── */
async function hostCreate(){
  var D = H.draft, u = me();
  if(D.qs.length < MIN_Q){ toast('至少要 ' + MIN_Q + ' 題'); return; }
  var btn = $('lq-f-open'); btn.disabled = true; btn.textContent = '開房中…';
  try{
    var qs = D.qs.map(function(q){
      if(!D.shuf || q.kind === 'tf') return { t: q.t, o: q.o.slice(), a: q.a, kind: q.kind, src: q.src, why: q.why };
      var idx = shuffle([0, 1, 2, 3].slice(0, q.o.length));
      return { t: q.t, o: idx.map(function(i){ return q.o[i]; }), a: idx.indexOf(q.a), kind: q.kind, src: q.src, why: q.why };
    });
    var pin = null;
    for(var k = 0; k < 8 && !pin; k++){
      var c = String(100000 + Math.floor(Math.random() * 900000));
      var s = await F.getDoc(roomRef(c));
      if(!s.exists()) pin = c;   /* 只用沒被用過的房號(舊場次保留作紀錄,雲端規則也不允許覆蓋別人的房間) */
    }
    if(!pin) throw new Error('房號產生失敗,再試一次');
    var createdAt = now();
    var title = String(D.title || '').trim().slice(0, 30) || T('搶答擂台', '英雄搶答擂台');
    var sec = Math.min(MAX_SEC, D.sec || MAX_SEC);
    var roster = buildRoster(D.classes || []);   /* ★ v5.318.0 老師「甲」:開房勾班級 ⇒ 應到名單(email 只存房主私有文件) */
    await F.setDoc(roomRef(pin), {
      meta: { hostUid: u.uid, hostEmail: myEmail(), hostName: myLabel(), title: title, status: 'lobby', locked: false,
              createdAt: createdAt, endedAt: 0, qCount: qs.length, timeLimit: sec, lobbyCount: 0, version: 1, classes: (D.classes || []).slice(0, 20) },
      lobby: { exp: roster.map(function(r){ return r.c; }), in: [], off: [], lv: [], ex: [] },
      current: null, reveal: null, final: null, awarded: {}
    });
    await F.setDoc(sub(pin, 'host', 'secret'), { qs: qs.map(packQ), startAt: {}, joinQ: {}, power: {}, createdAt: createdAt, roster: roster, leave: {} });
    await boardSet(pin, { title: title, hostName: myLabel(), hostUid: u.uid, at: now(), st: 'lobby' });
    H.reset(); H.draft = D;
    H.pin = pin; H.qs = qs; H.createdAt = createdAt; H.title = title; H.timeLimit = sec; H.status = 'lobby';
    H.roster = roster; H.leave = {};
    hostAttach();
    sfx('sfx-confirm', 0.5);
  }catch(e){
    toast('開房失敗:' + (e.code || e.message)); btn.disabled = false; btn.textContent = '🚪 開房!';
  }
}
async function boardSet(pin, entry){
  var o = {}; o[pin] = entry;
  try{ await F.setDoc(F.doc(db(), 'liveQuizBoard', BOARD_DOC), { rooms: o, updatedAt: now() }, { merge: true }); }catch(_){}
}
async function boardRemove(pin){
  try{ var o = { updatedAt: now() }; o['rooms.' + pin] = F.deleteField(); await F.updateDoc(F.doc(db(), 'liveQuizBoard', BOARD_DOC), o); }catch(_){}
}

async function hostResume(pin){
  try{
    var s = await F.getDoc(roomRef(pin));
    if(!s.exists()){ await boardRemove(pin); toast('這個房間已經不在了'); return hostHome(); }
    var r = s.data();
    var sec = await F.getDoc(sub(pin, 'host', 'secret'));
    if(!sec.exists()) throw new Error('找不到題目資料');
    var sd = sec.data();
    H.reset();
    H.pin = pin; H.room = r; H.status = r.meta.status; H.createdAt = r.meta.createdAt; H.title = r.meta.title; H.timeLimit = r.meta.timeLimit || MAX_SEC;
    H.qs = (sd.qs || []).map(unpackQ); H.startAt = sd.startAt || {}; H.joinQ = sd.joinQ || {}; H.power = sd.power || {};
    H.roster = sd.roster || []; H.leave = sd.leave || {};
    H.final = r.final || null; H.awarded = r.awarded || {};
    H.qIndex = r.current ? r.current.qIndex : -1;
    var as = await F.getDocs(subCol(pin, 'answers'));
    as.forEach(function(d){ var a = d.data(); (H.answers[a.q] = H.answers[a.q] || {})[a.uid] = { c: a.c, at: tsMs(a.at), ms: a.ms }; });
    hostAttach();
    toast('已回到擂台 ' + pin);
  }catch(e){ toast('接續失敗:' + (e.code || e.message)); }
}

function hostAttach(){
  var pin = H.pin;
  H.unsubs.push(live(roomRef(pin), null, function(s){
    if(!s.exists()) return;
    H.room = s.data();
    if(H.room.current && H.room.meta.status === 'question'){
      var q = H.room.current.qIndex, sa = H.room.current.startAt;
      if(sa && !s.metadata.hasPendingWrites && !H.startAt[q]){
        H.startAt[q] = tsMs(sa); saveSecret();
        /* ★ v5.318.0 甲:主持台也用雲端開題時間對時,截止時間跟學生畫面的 0 秒一致 */
        if(H.askT && H.askT.q === q){ var off = H.startAt[q] - (H.askT.t0 + H.askT.t1) / 2; H.qLocal = H.startAt[q] - off; }
      }
    }
    H.awarded = H.room.awarded || {};
  }));
  /* ★ v5.320.0 參加者監聽帶 includeMetadataChanges:可得知主持台自己是不是在用離線快取(fromCache) ⇒ 主持台網路卡住時不誤判全班斷線 */
  H.unsubs.push(live(subCol(pin, 'players'), { includeMetadataChanges: true }, function(ss){
    var wasCache = H.netCache;
    H.netCache = !!(ss.metadata && ss.metadata.fromCache);
    if(wasCache && !H.netCache){ var tr = now(); Object.keys(H.seen).forEach(function(k){ if(H.onl[k]) H.seen[k] = Math.max(H.seen[k], tr - HEARTBEAT_MS); }); }   /* 主持台剛恢復連線:給大家一個心跳的時間回報,不立刻判斷線 */
    var changed = false;
    ss.docChanges().forEach(function(ch){
      var d = ch.doc.data();
      if(ch.type === 'removed'){ delete H.players[d.uid]; changed = true; return; }
      if(!H.players[d.uid]){
        changed = true;
        /* ★ v5.318.0 有同學進等候室 ⇒ 叮一聲(主持台重開第一次載入不播;多人同時進來 0.3 秒內只播一次) */
        if(H.onlInit && !d.kicked && now() - (H.joinSnd || 0) > 300){ H.joinSnd = now(); snd('newPlayer', 0.5); }
      }
      /* ★ v5.318.0 斷線偵測:用「主持台收到這位同學心跳的本機時間」判斷,不比對學生平板時鐘(各台時鐘可能不準) */
      var prev = H.players[d.uid];
      if(!prev || prev.lastSeen !== d.lastSeen || tsMs(prev.syncAt) !== tsMs(d.syncAt)){
        var tn = now();
        /* 記錄心跳間隔:舊版快取(30 秒心跳)的平板也不會被誤判斷線 ⇒ 每人的斷線門檻 = max(25 秒, 2.2×實測心跳間隔),上限 80 秒 */
        if(prev && H.seen[d.uid] && prev.lastSeen > 0 && d.lastSeen > 0){ var gap = tn - H.seen[d.uid]; if(gap > 3000 && gap < 40000) H.gap[d.uid] = gap; }
        H.seen[d.uid] = tn;
        if(d.lastSeen > 0) H.lastAny = tn;   /* ★ v5.320.0 任何一位同學的心跳到達時間 ⇒ 判斷「是主持台自己卡住,還是學生真的斷線」 */
        if(d.lastSeen === 0){ if(!prev || prev.lastSeen !== 0) H.zeroAt[d.uid] = (!prev && !H.onlInit) ? tn - 60000 : tn; } else delete H.zeroAt[d.uid];
        /* 主持台重開時第一次讀到:學生自己記的最後心跳已是 3 分鐘以前 ⇒ 直接當作離線(不先顯示在線 25 秒) */
        if(!prev && !H.onlInit && d.lastSeen > 0 && tn - d.lastSeen > 180000) H.seen[d.uid] = tn - 600000;
      }
      if(prev && prev.kicked !== d.kicked) changed = true;
      H.players[d.uid] = d;
      var em = String(d.email || '').toLowerCase();
      var slot = rosterSlotOf(em);
      if(slot && H.leave[slot.e] && !d.kicked){ delete H.leave[slot.e]; saveSecret(); }   /* 請假的同學其實來了 ⇒ 自動取消請假 */
      if(H.joinQ[d.uid] == null){
        H.joinQ[d.uid] = H.status === 'lobby' ? 0 : (H.status === 'question' ? H.qIndex : H.qIndex + 1);
        saveSecret();
      }
    });
    if(changed) pushLobby();
    checkOnline(!H.onlInit); H.onlInit = true;   /* 第一次載入名單不提示(避免主持台重開時洗版),之後的上下線變化都即時提示 */
    hostRefreshPlayers();
  }));
  H.tick = setInterval(hostTick, 250);
  if(H.status === 'lobby') hostLobby();
  else if(H.status === 'question') hostListenQ(H.qIndex, true);
  else if(H.status === 'reveal') hostRevealScreen();
  else if(H.status === 'ended') hostEndScreen();
}
function saveSecret(){
  if(H.saveH) return;
  H.saveH = setTimeout(function(){
    H.saveH = null;
    F.updateDoc(sub(H.pin, 'host', 'secret'), { startAt: H.startAt, joinQ: H.joinQ, power: H.power, leave: H.leave }).catch(function(){});
  }, 1500);
}
/* ───────── ★ v5.318.0 應到名單 / 請假 / 斷線 ───────── */
function rosterOf(email){
  try{
    var e = typeof window._getRosterEntry === 'function' ? window._getRosterEntry(String(email || '').toLowerCase()) : null;
    if(!e) return null;
    var lab = typeof window._formatRosterLabel === 'function' ? window._formatRosterLabel(e) : '';
    var m = /^(\d{4})/.exec(lab); if(!m) return null;
    return { c: m[1], n: m[1] + (e.fullName || ((e.surname || '') + '同學')), cls: e.class || '' };
  }catch(_){ return null; }
}
function rosterClasses(){
  var R = window._STUDENT_ROSTER || {}, set = {}, out = [];
  Object.keys(R).forEach(function(em){ var e = R[em]; if(e && e.class && !set[e.class]){ set[e.class] = 1; out.push(e.class); } });
  out.sort(function(a, b){
    var ma = /^(\d+)年(\d+)班$/.exec(a), mb = /^(\d+)年(\d+)班$/.exec(b);
    if(ma && mb) return (+ma[1] - +mb[1]) || (+ma[2] - +mb[2]);
    return a < b ? -1 : 1;
  });
  return out;
}
/* ★ v5.318.0 名冊裡有「舊帳號沒更新」的情況(同一班同一座號掛 2 個帳號,實測 178 組) ⇒ 同座號合成一格:
   - 格子顯示「入學年份對得上這個年級」的那個帳號名字(lsps113xxx = 113 學年入學 = 115 學年的 3 年級)
   - 這格的任何一個帳號加入都會亮起來,不會出現兩個一樣的座號、也不會有永遠到不了的幽靈名字 */
function rocSchoolYear(){ var d = new Date(); return d.getFullYear() - 1911 - (d.getMonth() < 7 ? 1 : 0); }
function buildRoster(classes){
  if(!classes || !classes.length) return [];
  var R = window._STUDENT_ROSTER || {}, slots = {}, sy = rocSchoolYear();
  Object.keys(R).forEach(function(em){
    var e = R[em]; if(!e || classes.indexOf(e.class) < 0) return;
    var r = rosterOf(em); if(!r) return;
    var g = +((/^(\d+)年/.exec(e.class) || [])[1] || 0), m = /^lsps(\d{3})/i.exec(em);
    /* 2=入學年對得上、1=看不出入學年(非 lspsNNN 帳號)、0=入學年對不上(多半是沒更新的舊帳號) */
    var fit = !(g && m) ? 1 : (+m[1] === sy - g + 1 ? 2 : 0);
    var s = slots[r.c];
    if(!s){ slots[r.c] = { e: em.toLowerCase(), es: [em.toLowerCase()], c: r.c, n: r.n, fit: fit }; return; }
    s.es.push(em.toLowerCase());
    if(fit > s.fit){ s.e = em.toLowerCase(); s.n = r.n; s.fit = fit; }
  });
  var out = Object.keys(slots).map(function(k){ var s = slots[k]; return { e: s.e, es: s.es, c: s.c, n: s.n, f: s.fit }; });
  out.sort(function(a, b){ return a.c < b.c ? -1 : (a.c > b.c ? 1 : 0); });
  return out;
}
function rosterSlotOf(em){
  em = String(em || '').toLowerCase(); if(!em) return null;
  var hit = null; (H.roster || []).forEach(function(r){ if(!hit && (r.es || [r.e]).indexOf(em) >= 0) hit = r; });
  return hit;
}
/* 這格目前對應的參加者:優先在線的、再來是沒被請出的 */
function rosterPlayer(r){
  var es = r.es || [r.e], best = null, score = -1;
  Object.keys(H.players).forEach(function(k){
    var p = H.players[k]; if(es.indexOf(String(p.email || '').toLowerCase()) < 0) return;
    var sc = p.kicked ? 0 : (isOnline(p) ? 2 : 1);
    if(sc > score){ best = p; score = sc; }
  });
  return best;
}
/* ★ v5.320.0 主持台自己網路卡住(監聽在用離線快取,或 ≥2 人在線卻全班同時超過門檻沒有任何心跳進來)
   ⇒ 是老師這台的問題,不是學生斷線:維持原本的上線狀態、不跳「某某斷線了」,改在上方顯示「主持台網路不穩」。 */
function hostStalled(){
  if(H.netCache) return true;
  var ks = Object.keys(H.onl).filter(function(k){ return H.onl[k] && H.players[k] && !H.players[k].kicked; });
  return ks.length >= 2 && H.lastAny > 0 && now() - H.lastAny > OFFLINE_MS;
}
function isOnline(p){
  if(!p || p.kicked) return false;
  /* ★ v5.320.0 學生切走 App 送出的離線記號,要持續 6 秒才算斷線(拉下控制中心、跳出系統通知一下就回來,不再閃「斷線了／回來了」) */
  if(p.lastSeen === 0) return !(now() - (H.zeroAt[p.uid] || 0) > AWAY_GRACE_MS);
  if(H.onl[p.uid] != null && hostStalled()) return H.onl[p.uid];
  var lim = Math.min(80000, Math.max(OFFLINE_MS, 2.2 * (H.gap[p.uid] || 0)));
  return now() - (H.seen[p.uid] || 0) < lim;
}
function inRosterP(p){ return !!rosterSlotOf(p && p.email); }
/* ★ v5.318.0 班級座號:優先查名冊,查不到就從名稱開頭 4 碼推(舊紀錄也適用);回傳 {c:'5302', cls:'5年3班'} */
function codeFromName(name){ var m = /^(\d)(\d)(\d{2})/.exec(String(name || '')); return m ? { c: m[0], cls: m[1] + '年' + m[2] + '班' } : { c: '', cls: '' }; }
function codeOf(p){
  var r = rosterOf(p && p.email);
  if(r){ var m = /^(\d)(\d)/.exec(r.c); return { c: r.c, cls: r.cls || (m ? m[1] + '年' + m[2] + '班' : '') }; }
  return codeFromName(p && p.name);
}
function entryCode(e){ return e.code ? { c: e.code, cls: e.cls || codeFromName(e.code).cls } : codeFromName(e.name); }
function nameNoCode(n){ return String(n || '').replace(/^\d{4}/, '') || String(n || ''); }
function lobbyState(){
  var exp = [], inn = [], off = [], lv = [], ex = [];
  (H.roster || []).forEach(function(r){
    exp.push(r.c);
    var p = rosterPlayer(r);
    if(p && !p.kicked){ (isOnline(p) ? inn : off).push(r.c); }
    else if(H.leave[r.e]) lv.push(r.c);
  });
  Object.keys(H.players).forEach(function(k){
    var p = H.players[k]; if(p.kicked || inRosterP(p)) return;
    var r = rosterOf(p.email); var tag = r ? r.c : T('訪客', '來賓');
    ex.push(tag); (isOnline(p) ? inn : off).push(tag);
  });
  return { exp: exp, in: inn, off: off, lv: lv, ex: ex };
}
function pushLobby(){
  if(H.cntH) return;
  H.cntH = setTimeout(function(){
    H.cntH = null;
    if(!H.pin) return;
    var inLobby = H.status === 'lobby';
    var L = inLobby ? lobbyState() : null, n = activePlayers().length;   /* 座號牆只在等候室需要,比賽中不一直改房間文件 */
    var key = (inLobby ? JSON.stringify(L) : '-') + '|' + n;
    if(key === H.lobbyKey) return;
    H.lobbyKey = key;
    var upd = { 'meta.lobbyCount': n }; if(inLobby) upd.lobby = L;
    F.updateDoc(roomRef(H.pin), upd).catch(function(){ H.lobbyKey = ''; });
  }, 1200);
}
var pushLobbyCount = pushLobby;
function activePlayers(onlineOnly){
  return Object.keys(H.players).map(function(k){ return H.players[k]; }).filter(function(p){
    return !p.kicked && (!onlineOnly || isOnline(p));
  });
}
/* 每 2 秒檢查一次誰斷線/回來,大螢幕立即提示(老師:「遊戲中會立即顯示某某斷線了」) */
function checkOnline(silent){
  var changed = false, dn = [], up = [];
  Object.keys(H.players).forEach(function(k){
    var p = H.players[k]; if(p.kicked) return;
    var on = isOnline(p), was = H.onl[k];
    if(was == null){ H.onl[k] = on; return; }
    if(on !== was){ H.onl[k] = on; changed = true; (on ? up : dn).push(p.name); if(!on) H.dcN[k] = (H.dcN[k] || 0) + 1; }   /* ★ v5.323.0 甲:記每人斷線次數 */
  });
  /* 同時好幾個人上下線 ⇒ 合成一則提示,不會只看到最後一個 */
  if(!silent && H.status !== 'ended' && (dn.length || up.length)){
    var msg = [];
    if(dn.length) msg.push('⚠ ' + nameList(dn) + T(' 斷線了,等他回來…', ' 已斷線'));
    if(up.length) msg.push('✅ ' + nameList(up) + T(' 回來了!', ' 已連線'));
    fxAlert(msg.join('   '), dn.length ? 'dc' : 'back', dn.length ? 6000 : 3500);   /* 大螢幕上方大字橫幅,全班都看得到 */
    /* ★ v5.318.0 老師:有人斷線時播放提醒音效(回來時播上線音) */
    if(dn.length){ snd('dc', 0.8); fxFlash('rgba(255,150,40,.25)'); } else snd('back', 0.6);
  }
  if(changed){ pushLobby(); hostRefreshPlayers(); }
}
function setHtmlIfChanged(el, html){
  if(el._lqH === html) return false;
  if(el._lqH != null) el.classList.add('lq-noanim');   /* 第一次出現有進場動畫,之後更新就不再整面重播 */
  el._lqH = html; el.innerHTML = html; return true;
}
function nameList(a){ return a.length > 3 ? a.slice(0, 3).join('、') + ' 等 ' + a.length + ' 人' : a.join('、'); }
/* ★ v5.320.0 上方警示:主持台自己網路卡住時顯示「主持台網路不穩」,否則顯示斷線人數 */
function offChipHtml(){
  if(H.pin && hostStalled()) return '📶 ' + T('主持台網路不穩,重新連線中…', '主持台連線不穩,重新連線中…');
  var n = offlineCount(); return n ? '⚠ ' + n + T(' 人斷線', ' 人離線') : '';
}
function updOffChip(){ var oc = $('lq-h-offc'); if(!oc) return; var h = offChipHtml(); if(oc._lqH !== h){ oc._lqH = h; oc.innerHTML = h; } oc.style.display = h ? '' : 'none'; }
function offlineCount(){ var n = 0; Object.keys(H.players).forEach(function(k){ var p = H.players[k]; if(!p.kicked && !isOnline(p)) n++; }); return n; }
function hostChips(){
  var c = [{ html: '🔑 ' + H.pin }];
  if(H.status !== 'lobby' && H.status !== 'ended') c.push({ html: '第 ' + (H.qIndex + 1) + ' / ' + H.qs.length + ' 題' });
  c.push({ id: 'lq-h-pc', html: '👥 ' + activePlayers(true).length });
  var oc = offlineCount();
  c.push({ id: 'lq-h-offc', html: offChipHtml(), warn: 1 });
  return c;
}
/* 等候室名單:有應到名單 ⇒ 全班座號(暗=還沒來、亮=已加入、橘=斷線、灰底=請假,點暗色的那格可標請假);沒有 ⇒ 只列已加入的人 */
function rosterWallHtml(){
  if(!(H.roster && H.roster.length)){
    var list = activePlayers().sort(function(a, b){ return (a.joinedAt || 0) - (b.joinedAt || 0); });
    return list.map(function(p){ return playerTag(p, true); }).join('') || '<div class="lq-p" style="opacity:.7">' + T('還沒有人加入…', '等待參加者加入…') + '</div>';
  }
  var h = '';
  H.roster.forEach(function(r){
    var p = rosterPlayer(r);
    if(p && !p.kicked){ h += playerTag(p, true, String(p.email || '').toLowerCase() === r.e ? r.n : (p.name || r.n)); return; }
    if(p && p.kicked){ h += '<div class="lq-tag lq-rs kicked">' + esc(r.n) + ' <small>已請出</small><button class="k" style="background:rgba(80,200,120,.4)" data-unkick="' + p.uid + '" title="恢復">↺</button></div>'; return; }
    var lv = !!H.leave[r.e];
    h += '<div class="lq-tag lq-rs ' + (lv ? 'lv' : 'no') + '" data-leave="' + esc(r.e) + '" title="' + (lv ? '點一下取消請假' : '點一下標記請假') + '">' + esc(r.n)
      + (lv ? ' <small>請假</small>' : '') + '</div>';
  });
  Object.keys(H.players).forEach(function(k){ var p = H.players[k]; if(!p.kicked && !inRosterP(p)) h += playerTag(p, true, p.name || T('同學', '參加者')); });
  return h;
}
function rosterCountHtml(){
  if(!(H.roster && H.roster.length)) return T('已加入 ', '已加入 ') + activePlayers().length + ' 人';
  var L = lobbyState(), need = L.exp.length - L.lv.length, here = 0;
  H.roster.forEach(function(r){ var p = rosterPlayer(r); if(p && !p.kicked && isOnline(p)) here++; });
  return T('已到 ', '已到 ') + '<b style="color:#7dffb0">' + here + '</b> / ' + T('應到 ', '應到 ') + need + (L.lv.length ? '(' + T('請假 ', '請假 ') + L.lv.length + ')' : '')
    + (L.ex.length ? '・' + T('名單外 ', '名單外 ') + L.ex.length : '');
}
function playerTag(p, canKick, label){
  var on = isOnline(p);
  var pw = H.power[p.uid] || {};
  return '<div class="lq-tag' + (on ? (label ? ' lq-rs in' : '') : ' off lq-rs dc') + '">' + esc(label || p.name) + (label ? '' : ' <small>' + esc(p.account || '') + '</small>')
    + (on ? '' : ' <small>' + T('斷線', '離線') + '</small>')
    + (pw.cut != null ? '<span class="pw" title="斬卻 第' + (pw.cut + 1) + '題">🗡️</span>' : '') + (pw.hint != null ? '<span class="pw" title="天啟 第' + (pw.hint + 1) + '題">💡</span>' : '')
    + (canKick ? '<button class="k" data-kick="' + p.uid + '" title="請出房間">✕</button>' : '') + '</div>';
}
function hostRefreshPlayers(){
  var pc = $('lq-h-pc'); if(pc) pc.innerHTML = '👥 ' + activePlayers(true).length;
  updOffChip();
  var w = $('lq-h-wall');
  if(w){
    /* 每 10 秒會收到每位同學的心跳 ⇒ 名單內容沒變就不重畫(避免整面名牌一直閃動畫) */
    setHtmlIfChanged(w, rosterWallHtml());
    var rn = $('lq-h-rules-n'); if(rn) setHtmlIfChanged(rn, rosterCountHtml());
  }
  var dl = $('lq-h-drawer-list');
  if(dl){
    setHtmlIfChanged(dl, Object.keys(H.players).map(function(k){ return H.players[k]; }).sort(function(a, b){ return (a.joinedAt || 0) - (b.joinedAt || 0); }).map(function(p){
      return p.kicked ? '<div class="lq-tag off">' + esc(p.name) + ' <small>' + esc(p.account || '') + '・已請出</small><button class="k" style="background:rgba(80,200,120,.4)" data-unkick="' + p.uid + '">↺</button></div>' : playerTag(p, true);
    }).join(''));
  }
  updDiag();
  if(H.status === 'question') updateAnswered();
}
/* ★ v5.323.0 甲 連線診斷:每位同學最後回報幾秒前、網路來回毫秒、畫面卡頓、裝置、斷線次數;最差的排最上面。
   看法:全班一起變慢＝教室網路;只有特定幾台＝那幾台平板(多半是舊 iPad)。 */
function updDiag(){
  var dg = $('lq-h-diag'); if(!dg) return;
  var sc = dg.querySelector('div[data-sc]'), top = sc ? sc.scrollTop : 0;   /* 每秒重畫時保留老師捲到的位置 */
  if(setHtmlIfChanged(dg, diagHtml())){ sc = dg.querySelector('div[data-sc]'); if(sc) sc.scrollTop = top; }
}
function diagHtml(){
  var tn = now(), rows = [], rtts = [], oldN = 0, oldDc = 0, newDc = 0;
  Object.keys(H.players).forEach(function(k){
    var p = H.players[k]; if(p.kicked) return;
    var on = isOnline(p), age = H.seen[k] ? Math.round((tn - H.seen[k]) / 1000) : null;
    var old = /iPad 1080×810/.test(p.dev || '');
    if(old){ oldN++; oldDc += H.dcN[k] || 0; } else newDc += H.dcN[k] || 0;
    if(p.rtt > 0) rtts.push(p.rtt);
    var bad = (!on ? 1000 : 0) + (H.dcN[k] || 0) * 50 + (p.rtt || 0) / 100 + (p.lag || 0) / 200;
    rows.push({ bad: bad, html: '<tr' + (on ? '' : ' style="color:#ffb05a"') + '><td class="nm">' + esc(p.name) + '</td>'
      + '<td>' + (on ? (age == null ? '—' : age + ' 秒前') : '斷線') + '</td>'
      + '<td' + ((p.rtt || 0) > 1500 ? ' style="color:#ff8080"' : '') + '>' + (p.rtt ? p.rtt + ' ms' : '—') + '</td>'
      + '<td' + ((p.lag || 0) > 800 ? ' style="color:#ff8080"' : '') + '>' + (p.lag != null ? (p.lag / 1000).toFixed(1) + ' 秒' : '—') + '</td>'
      + '<td>' + (H.dcN[k] || 0) + '</td><td style="font-size:.85em">' + esc(p.dev || '—') + (old ? ' <b style="color:#ffd166">舊</b>' : '') + '</td></tr>' });
  });
  if(!rows.length) return '';
  rows.sort(function(a, b){ return b.bad - a.bad; });
  rtts.sort(function(a, b){ return a - b; });
  var med = rtts.length ? rtts[Math.floor(rtts.length / 2)] : 0, mx = rtts.length ? rtts[rtts.length - 1] : 0;
  var anyDiag = Object.keys(H.players).some(function(k){ return H.players[k].dev; });
  return '<div class="lq-p" style="font-size:14px;text-align:left;margin:4px 0">📶 <b>連線診斷</b>:網路來回 中位數 ' + (med || '—') + ' ms・最慢 ' + (mx || '—') + ' ms'
    + (oldN ? '・舊 iPad ' + oldN + ' 台(斷線 ' + oldDc + ' 次)・其他斷線 ' + newDc + ' 次' : '')
    + (anyDiag ? '' : '<br><small style="opacity:.8">⚠ 還沒收到診斷資料:請到 Firebase 主控台發布新版 firestore.rules(沒發布也能比賽,只是看不到這張表的數字)</small>') + '</div>'
    + '<div data-sc="1" style="max-height:40vh;overflow:auto"><table class="lq-diag"><tr><th>同學</th><th>最後回報</th><th>網路來回</th><th>畫面卡頓</th><th>斷線</th><th>裝置</th></tr>'
    + rows.map(function(r){ return r.html; }).join('') + '</table></div>';
}
/* ★ v5.318.0 點「還沒來」的座號 ⇒ 標記/取消請假(請假不算進應到人數) */
document.addEventListener('click', function(e){
  var b = e.target && e.target.closest && e.target.closest('[data-leave]');
  if(!b || !H.pin || H.status === 'ended') return;
  var em = b.getAttribute('data-leave'); if(!em) return;
  if(H.leave[em]) delete H.leave[em]; else H.leave[em] = 1;
  saveSecret(); pushLobby(); hostRefreshPlayers();
}, true);
document.addEventListener('click', function(e){
  var b = e.target && e.target.closest && e.target.closest('[data-kick],[data-unkick]');
  if(!b || !H.pin) return;
  var uid = b.getAttribute('data-kick') || b.getAttribute('data-unkick'), p = H.players[uid]; if(!p) return;
  if(b.hasAttribute('data-kick')){
    confirmBox('把「' + esc(p.name) + '」請出房間?<br><small>被請出的同學不能再加入,也不會拿到獎勵(可以再恢復)。</small>', '請出', function(){
      F.updateDoc(sub(H.pin, 'players', uid), { kicked: true }).catch(function(err){ toast('失敗:' + (err.code || err.message)); });
    });
  }else{
    F.updateDoc(sub(H.pin, 'players', uid), { kicked: false }).catch(function(err){ toast('失敗:' + (err.code || err.message)); });
  }
}, true);

function hostLobby(){
  H.status = 'lobby';
  setTop('🎤 ' + H.title, hostChips(), function(){ LQ.close(); });
  var locked = H.room && H.room.meta && H.room.meta.locked;
  setBody('<div class="lq-p" style="margin-top:4px">' + T('打開小英雄首頁 → 點「⚡ 搶答擂台」→ 輸入房號', '首頁點選「⚡ 搶答擂台」並輸入下方房號') + '</div>'
    + '<div class="lq-bigpin">' + H.pin + '</div>'
    + '<div class="lq-p" style="font-size:clamp(14px,1.7vmin,20px);opacity:.8">' + H.qs.length + ' 題・每題 ' + H.timeLimit + ' 秒・' + T('每人法寶 🗡️💡 各一次', '法寶 🗡️ 斬卻 / 💡 天啟 各一次') + '</div>'
    + '<div class="lq-p" style="font-weight:900;font-size:clamp(14px,1.9vmin,22px)">⏳ ' + T('等待所有玩家加入…', '等待所有玩家加入…') + ' <span id="lq-h-rules-n"></span></div>'
    + (H.roster && H.roster.length ? '<div class="lq-p" style="font-size:clamp(12px,1.4vmin,16px);opacity:.75">' + T('暗色＝還沒來・亮色＝已加入・橘色＝斷線;點暗色的座號可以標「請假」', '暗＝未到・亮＝已加入・橘＝離線;點未到者可標記請假') + '</div>' : '')
    + '<div class="lq-wall" id="lq-h-wall"></div>');
  setCtl('<button class="lq-btn gray" id="lq-h-lock">' + (locked ? '🔓 解除鎖房' : '🔒 鎖房') + '</button>'
    + '<button class="lq-btn red" id="lq-h-cancel">取消這場</button>'
    + '<button class="lq-btn" id="lq-h-rules">📖 ' + T('遊戲說明', '規則說明') + '</button>'
    + '<button class="lq-btn gold" id="lq-h-start" style="font-size:22px">▶ ' + T('比賽開始!', '比賽開始') + '</button>');
  $('lq-h-rules').onclick = hostRules;
  $('lq-h-lock').onclick = function(){
    var v = !(H.room && H.room.meta && H.room.meta.locked);
    F.updateDoc(roomRef(H.pin), { 'meta.locked': v }).then(function(){ toast(v ? '已鎖房,新同學不能加入' : '已解除鎖房'); hostLobby(); }).catch(function(err){ toast('失敗:' + (err.code || err.message)); });
  };
  $('lq-h-cancel').onclick = function(){
    confirmBox('取消這場擂台?(不會頒發任何獎勵)', '取消擂台', async function(){
      try{ await F.updateDoc(roomRef(H.pin), { 'meta.status': 'ended', 'meta.endedAt': now(), final: { list: [], at: now(), canceled: true } }); }catch(_){}
      await boardRemove(H.pin);
      LQ.close(true);
    });
  };
  $('lq-h-start').onclick = hostStartGame;
  hostRefreshPlayers();
}
/* ★ v5.318.0 按「比賽開始」:應到的人還沒到齊 ⇒ 先提醒(老師可以先標請假,或直接開始;晚到的同學仍可加入) */
function hostStartGame(){
  if(!activePlayers().length){ toast('還沒有人加入'); return; }
  var miss = [];
  (H.roster || []).forEach(function(r){ var p = rosterPlayer(r); if(H.leave[r.e]) return; if(!p || p.kicked || !isOnline(p)) miss.push(r.n); });
  activePlayers().forEach(function(p){ if(!inRosterP(p) && !isOnline(p)) miss.push(p.name); });
  if(!miss.length) return hostAsk(0);
  confirmBox(T('還有 <b>' + miss.length + '</b> 位同學沒到或斷線:', '尚有 <b>' + miss.length + '</b> 位未到或離線:')
    + '<br><small>' + esc(miss.slice(0, 12).join('、')) + (miss.length > 12 ? '…' : '') + '</small>'
    + '<br><small>' + T('請假的話先點他的座號標「請假」。晚到的同學比賽中還是可以加入。', '請假者可先點座號標記。比賽中仍可晚到加入。') + '</small>',
    T('直接開始', '直接開始'), function(){ hostAsk(0); });
}
/* ★ v5.318.0(老師「新增搶答擂台的遊戲說明視窗,讓老師主持時可以說明;同時顯示加入等候室的玩家名稱」)
   投影用的大字說明頁:房號、六張規則卡、下方即時名單(沿用 #lq-h-wall,名單更新由 hostRefreshPlayers 處理)。 */
function hostRules(){
  var lim = H.timeLimit, ex = 5, exPts = ptsFor(ex * 1000);
  setTop('📖 ' + T('搶答擂台怎麼玩?', '搶答擂台規則說明'), hostChips(), function(){ LQ.close(); });
  var card = function(t, h){ return '<div class="lq-fs"><h3>' + t + '</h3>' + h + '</div>'; };
  setBody('<div class="lq-p" style="font-size:clamp(16px,2.4vmin,28px)">' + T('首頁點「⚡ 搶答擂台」,輸入房號', '首頁「⚡ 搶答擂台」輸入房號') + ' <b style="color:#ffd166;font-size:1.6em;letter-spacing:.1em">' + H.pin + '</b></div>'
    + '<div class="lq-p" style="font-weight:900;color:#ffd166;font-size:clamp(14px,1.9vmin,22px)">👥 ' + T('等候室', '等候室名單') + ' <span id="lq-h-rules-n"></span></div>'
    + '<div class="lq-wall lq-rwall" id="lq-h-wall"></div>'
    + '<div class="lq-rules">'
    + card('① ' + T('怎麼加入', '加入方式'), T('用<b>自己的帳號</b>登入 → 首頁點「⚡ 搶答擂台」→ 輸入大螢幕上的 6 個數字。名字出現在上面就成功了!',
                                           '以個人帳號登入,於首頁「⚡ 搶答擂台」輸入 6 碼房號;名稱出現在上方名單即完成加入。'))
    + card('② ' + T('怎麼作答', '作答規則'), T('每題最多 <b>' + lim + ' 秒</b>,看題目按一個答案,<b>按了就不能改</b>。全班都答完會馬上公布答案;平板上的倒數到 0 就不能再按。',
                                           '每題限時 ' + lim + ' 秒,每題僅能作答一次;全員作答完畢即公布,倒數歸零後不再受理。'))
    + card('③ ' + T('怎麼計分', '計分方式'), T('答對得 <b>500 分</b>,答得越快再加分,最多 <b>+500</b>;答錯或沒答 0 分。<br>例:第 ' + ex + ' 秒答對 = <b>' + fmtPts(exPts) + ' 分</b>。',
                                           '答對 500 分＋速度分(最高 500,依剩餘時間比例);答錯或未答 0 分。<br>例:第 ' + ex + ' 秒答對 = ' + fmtPts(exPts) + ' 分。'))
    + card('④ ' + T('兩個法寶', '法寶'), T('🗡️ <b>刪掉一個錯的</b>(是非題不能用)<br>💡 <b>偷偷告訴你答案</b>(還是要自己按)<br>每場各能用一次。<b>沒用掉的法寶每個讓總分 +5%</b>,兩個都不用 +10%!',
                                           '🗡️ 斬卻:消去一個錯誤選項(是非題不適用)<br>💡 天啟:揭示正解(仍需自行作答)<br>每場各一次;每保留一個未使用法寶,總分 +5%(最多 +10%)。'))
    + card('⑤ ' + T('名次與獎勵', '名次與獎勵'), T('看<b>總分</b>排名;一樣分數比答對題數,再比誰快。<br>🥇 第 1～5 名:知識幣 10 萬＋水晶 10＋豪華典藏書 5＋<b>自選 SSR 命星 1＋自選 SR 命星 1</b><br>🥈 第 6～10 名:知識幣 6 萬＋水晶 6＋書 3＋<b>SSR 虛無的命星 2＋SR 虛無的命星 2</b><br>🎁 第 11 名以後:知識幣 3 萬＋水晶 3＋書 1＋<b>SSR 虛無的命星 1＋SR 虛無的命星 1</b>(要答滿加入後題數的一半)<br>🌑 3 個虛無的命星可以合成 1 個自選命星!',
                                           '依總分排名,同分比答對題數與作答秒數。<br>第 1～5 名:10 萬知識幣＋10 水晶＋豪華典藏書×5＋自選 SSR／SR 命星各 1<br>第 6～10 名:6 萬＋6＋3＋SSR／SR 虛無的命星各 2<br>第 11 名以後:3 萬＋3＋1＋SSR／SR 虛無的命星各 1(作答數達加入後題數一半)<br>虛無的命星 3 枚可合成 1 枚自選命星。'))
    + card('⑥ ' + T('小提醒', '注意事項'), T('🔁 平板當機或不小心關掉,大螢幕會顯示「某某斷線了」;再點一次「⚡ 搶答擂台」就回到同一場,分數都在,老師會等你回來再按下一題。<br>📬 獎勵送到冒險模式「🎁 GM獎勵」,要自己按確認領取。<br>📶 網路慢不用怕,系統會自動補時間。',
                                           '斷線或關閉後重新進入即回到本場,成績保留。<br>獎勵寄至冒險模式「🎁 GM獎勵」,本人確認領取後入帳。<br>網路延遲由系統自動補償(最多 3 秒)。'))
    + '</div>');
  setCtl('<button class="lq-btn gray" id="lq-hr-lobby">⬅ ' + T('回等候室', '返回等候室') + '</button>'
    + '<button class="lq-btn gold" id="lq-hr-start" style="font-size:22px">▶ ' + T('比賽開始!', '比賽開始') + '</button>');
  $('lq-hr-lobby').onclick = hostLobby;
  $('lq-hr-start').onclick = hostStartGame;
  hostRefreshPlayers();
}

/* ───────── 出題 ───────── */
async function hostAsk(q){
  if(q >= H.qs.length) return hostEnd();
  if(H.autoH){ clearTimeout(H.autoH); H.autoH = null; }
  var Q = H.qs[q];
  H.qIndex = q; H.status = 'question'; H.revealing = false;
  var t0 = now();
  try{
    await F.updateDoc(roomRef(H.pin), {
      'meta.status': 'question',
      current: { qIndex: q, text: Q.t, options: Q.o, kind: Q.kind, timeLimit: H.timeLimit, startAt: F.serverTimestamp() },
      reveal: null
    });
  }catch(e){ toast('出題失敗:' + (e.code || e.message)); H.status = q ? 'reveal' : 'lobby'; return; }
  H.askT = { q: q, t0: t0, t1: now() };
  boardSet(H.pin, { title: H.title, hostName: myLabel(), hostUid: me().uid, at: now(), st: 'live' });
  hostListenQ(q, false);
  bgmKing();
  snd('qStart', 0.6); H.lastLeft = 99;
}
function hostListenQ(q, resumed){
  (H.qUnsubs || []).forEach(function(f){ try{ f(); }catch(_){} }); H.qUnsubs = [];
  H.qLocal = resumed && H.startAt[q] ? (now() - Math.min(H.timeLimit * 1000, Math.max(0, now() - H.startAt[q]))) : now();
  H.answers[q] = H.answers[q] || {};
  H.qUnsubs.push(live(F.query(subCol(H.pin, 'answers'), F.where('q', '==', q)), null, function(ss){
    ss.forEach(function(d){ var a = d.data(); if(a.at) H.answers[q][a.uid] = { c: a.c, at: tsMs(a.at), ms: a.ms }; });
    updateAnswered();
  }));
  H.qUnsubs.push(live(F.query(subCol(H.pin, 'powerups'), F.where('q', '==', q)), null, function(ss){
    ss.docChanges().forEach(function(ch){ if(ch.type === 'added') servePower(ch.doc.data()); });
  }));
  hostQuestionScreen();
}
function servePower(p){
  var q = p.q, Q = H.qs[q]; if(!Q || q !== H.qIndex) return;
  var rec = H.power[p.uid] = H.power[p.uid] || {};
  if(rec[p.kind] != null) return;                       /* 已服務過(重新接續時避免重寫) */
  rec[p.kind] = q; saveSecret();
  var o = {};
  if(p.kind === 'cut'){
    var wrong = []; for(var i = 0; i < Q.o.length; i++) if(i !== Q.a) wrong.push(i);
    o.cut = { q: q, rm: wrong[Math.floor(Math.random() * wrong.length)] };
  }else if(p.kind === 'hint'){
    o.hint = { q: q, a: Q.a };
  }else return;
  F.setDoc(sub(H.pin, 'private', p.uid), o, { merge: true }).catch(function(){ rec[p.kind] = null; });
  hostRefreshPlayers();
}
function hostQuestionScreen(){
  var q = H.qIndex, Q = H.qs[q];
  setTop('🎤 ' + H.title, hostChips(), function(){ LQ.close(); });
  var opts = Q.o.map(function(o, i){ return '<div class="lq-opt ' + OPT_CLASS[i] + '"><b>' + OPT_LETTER[i] + '</b><span>' + esc(o) + '</span></div>'; }).join('');
  setBody('<div class="lq-hgrid"><div class="lq-hmain"><div class="lq-q lq-qin">' + esc(Q.t) + '</div><div class="lq-opts"' + (Q.o.length === 2 ? ' style="grid-template-columns:1fr 1fr"' : '') + '>' + opts + '</div></div>'
    + '<div class="lq-hside"><div class="lq-stat"><div class="v lq-timer" id="lq-h-timer">' + H.timeLimit + '</div><div class="k">' + T('剩下秒數', '剩餘秒數') + '</div></div>'
    + '<div class="lq-stat"><div class="v" id="lq-h-ans">0</div><div class="k" id="lq-h-ans-k">' + T('已作答', '已作答') + '</div></div></div></div>');
  setCtl('<button class="lq-btn gray" id="lq-h-pl">👥 參加者</button><button class="lq-btn" id="lq-h-now">⏩ ' + T('現在公布', '立即公布') + '</button><button class="lq-btn red" id="lq-h-stop">🏁 提早結束</button>');
  $('lq-h-pl').onclick = playerDrawer;
  $('lq-h-now').onclick = function(){ hostReveal(); };
  $('lq-h-stop').onclick = earlyEnd;
  updateAnswered();
}
function playerDrawer(){
  modal('<div class="lq-h1" style="font-size:22px">👥 參加者</div><div class="lq-p" style="font-size:14px;opacity:.8">灰色＝目前離線;✕ 請出房間、↺ 恢復</div><div class="lq-wall" id="lq-h-drawer-list"></div>'
    + '<div id="lq-h-diag"></div>'   /* ★ v5.323.0 甲 連線診斷表 */
    + '<div class="lq-row"><button class="lq-btn gray" id="lq-dr-x">關閉</button></div>');
  var mm = $('lq-modal'); if(mm && mm.firstChild) mm.firstChild.style.width = 'min(96vw,900px)';
  if(H.drawerT) clearInterval(H.drawerT);
  H.drawerT = setInterval(function(){ if(!$('lq-h-diag')){ clearInterval(H.drawerT); H.drawerT = null; return; } updDiag(); }, 1000);   /* 「幾秒前」每秒更新 */
  $('lq-dr-x').onclick = closeModal;
  hostRefreshPlayers();
}
function earlyEnd(){
  confirmBox('提早結束擂台?<br><small>已公布的題目照常計分;這一題會作廢不計。參加獎門檻改用「已進行的題數」計算。</small>', '結束並結算', function(){ hostEnd(true); });
}
function updateAnswered(){
  if(H.status !== 'question') return;
  var q = H.qIndex, got = H.answers[q] || {}, act = activePlayers(true), n = 0;
  act.forEach(function(p){ if(got[p.uid]) n++; });
  var el = $('lq-h-ans'); if(el) el.textContent = Object.keys(got).length;
  var k = $('lq-h-ans-k'); if(k) k.textContent = '/ ' + act.length + ' ' + T('人已作答', '人已作答');
  /* 老師:全員作答完 ⇒ 立刻公布並計分 */
  if(act.length && n >= act.length && !H.revealing){ H.revealing = true; snd('allIn', 0.6); fxPop('🙌 ' + T('全員作答!', '全員作答完畢'), '#7dffb0'); setTimeout(function(){ hostReveal(); }, 700); }
}
function hostTick(){
  if(H.pin && now() - (H.onlT || 0) > 2000){ H.onlT = now(); checkOnline(false); updOffChip(); }
  if(H.status === 'question'){
    var left = Math.max(0, Math.ceil((H.timeLimit * 1000 - (now() - H.qLocal)) / 1000));
    var el = $('lq-h-timer'); if(el){ el.textContent = left; el.classList.toggle('warn', left <= 5); }
    /* ★ v5.318.0 大螢幕最後 5 秒滴答聲、歸零播時間到 */
    if(left !== H.lastLeft){
      H.lastLeft = left;
      if(left > 0 && left <= 5 && !H.revealing){ snd('tick', 0.45 + (5 - left) * 0.08); if(el){ el.classList.remove('warn'); void el.offsetWidth; el.classList.add('warn'); } }
      if(left === 0 && !H.revealing) snd('timeUp', 0.6);
    }
    /* ★ v5.323.0 丁:時間到後,還有在線同學沒收到答案 ⇒ 多等最多 4.5 秒(全班一起送時網路會塞車,晚到的答案還在路上);全收齊就立刻公布 */
    var over = now() - H.qLocal - H.timeLimit * 1000;
    if(over > 1500 && !H.revealing){
      var got = H.answers[H.qIndex] || {}, waiting = activePlayers(true).some(function(p){ return !got[p.uid]; });
      if(!waiting || over > 4500){ H.revealing = true; hostReveal(); }
    }
  }
}

/* ───────── 公布 ───────── */
function scoreOf(q, a){
  var st = H.startAt[q] || 0, server = st ? Math.max(0, a.at - st) : (a.ms || 0);
  var lim = H.timeLimit * 1000;
  var ms = Math.max(server - LAT_COMP_MS, Math.min(server, a.ms == null ? server : a.ms));  /* 慢網路補償最多 3 秒 */
  return Math.max(0, Math.min(lim, ms));
}
/* ★ v5.318.0 老師裁定「用甲案」:答對 500 分＋速度分最多 500 分(越快越多);
   「沒用一個法寶 +5% 分,兩個都沒用 +10%」⇒ 總分 = 基本分 ×(1 + 未用法寶數 × 5%),即時算進每題的排名。 */
function ptsFor(ms){
  var lim = H.timeLimit * 1000;
  return BASE_PTS + Math.round(SPEED_PTS * (1 - Math.min(lim, Math.max(0, ms)) / lim));
}
function powersUsed(uid, uptoQ){
  var p = H.power[uid] || {}, n = 0;
  if(p.cut != null && p.cut <= uptoQ) n++;
  if(p.hint != null && p.hint <= uptoQ) n++;
  return n;
}
function computeTally(uptoQ){
  var t = {};
  Object.keys(H.players).forEach(function(uid){ t[uid] = { uid: uid, correct: 0, answered: 0, sec: 0, last: 0, streak: 0, base: 0, gain: 0, used: 0, bonus: 0, score: 0, qms: -1, d: [] }; });
  for(var q = 0; q <= uptoQ; q++){
    var A = H.answers[q] || {}, Q = H.qs[q]; if(!Q) continue;
    Object.keys(t).forEach(function(uid){
      var a = A[uid], r = t[uid];
      if(q === uptoQ){ r.gain = 0; r.qms = -1; }
      if(!a){ r.streak = 0; r.d.push(null); return; }
      r.answered++;
      var ms = scoreOf(q, a), pts = 0;
      if(a.c === Q.a){
        pts = ptsFor(ms);
        r.correct++; r.sec += ms; r.streak++; r.last = ms; r.base += pts;
        if(q === uptoQ) r.gain = pts;
      } else { r.streak = 0; }
      if(q === uptoQ) r.qms = Math.round(ms);
      r.d.push({ c: a.c, s: Math.round(ms), p: pts });   /* ★ v5.318.0 丙:每題明細(作答選項/秒數毫秒/得分) */
    });
  }
  Object.keys(t).forEach(function(uid){
    var r = t[uid];
    r.used = powersUsed(uid, uptoQ);
    r.bonus = (2 - r.used) * POWER_BONUS_PCT;
    r.score = Math.round(r.base * (1 + r.bonus / 100));
  });
  return t;
}
function rankList(tally){
  return Object.keys(tally).map(function(k){ return tally[k]; }).filter(function(r){ var p = H.players[r.uid]; return p && !p.kicked; })
    .sort(function(a, b){ return (b.score - a.score) || (b.correct - a.correct) || (a.sec - b.sec) || (b.answered - a.answered) || (a.last - b.last); });
}
async function hostReveal(){
  if(H.status !== 'question') return;
  H.revealing = true;
  var q = H.qIndex, Q = H.qs[q];
  H.status = 'reveal';
  try{ await F.updateDoc(roomRef(H.pin), { 'meta.status': 'reveal' }); }catch(e){ toast('公布失敗,再按一次'); H.status = 'question'; H.revealing = false; return; }
  (H.qUnsubs || []).forEach(function(f){ try{ f(); }catch(_){} }); H.qUnsubs = [];
  /* 狀態先切 reveal(雲端規則從此拒收作答)⇒ 再從伺服器讀這題的全部作答,保證計分完整 */
  try{
    var ss = await F.getDocsFromServer(F.query(subCol(H.pin, 'answers'), F.where('q', '==', q)));
    H.answers[q] = {};
    ss.forEach(function(d){ var a = d.data(); H.answers[q][a.uid] = { c: a.c, at: tsMs(a.at), ms: a.ms }; });
  }catch(_){}
  var dist = Q.o.map(function(){ return 0; });
  Object.keys(H.answers[q]).forEach(function(uid){ var c = H.answers[q][uid].c; if(c >= 0 && c < dist.length) dist[c]++; });
  var list = rankList(computeTally(q)), ranks = {};
  list.forEach(function(r, i){ ranks[r.uid] = [i + 1, r.correct, r.score, r.gain, r.bonus, r.qms]; });
  var top5 = list.slice(0, 5).map(function(r){ return { uid: r.uid, name: (H.players[r.uid] || {}).name || '', correct: r.correct, sec: Math.round(r.sec), score: r.score, bonus: r.bonus }; });
  H.lastReveal = { qIndex: q, answer: Q.a, dist: dist, answered: Object.keys(H.answers[q]).length, top5: top5, why: (Q.why || '').slice(0, 200) };
  try{
    await F.updateDoc(roomRef(H.pin), { reveal: { qIndex: q, answer: Q.a, dist: dist, answered: H.lastReveal.answered, top5: top5, ranks: ranks } });
  }catch(e){ toast('寫入結果失敗:' + (e.code || e.message)); }
  snd('correct', 0.6); setTimeout(function(){ snd('reveal', 0.45); }, 350);
  fxFlash('rgba(125,255,176,.25)'); fxConfetti(28, false);
  hostRevealScreen();
}
function hostRevealScreen(){
  H.status = 'reveal';
  var q = H.qIndex, Q = H.qs[q], R = H.lastReveal;
  if(!R || R.qIndex !== q){
    var rv = H.room && H.room.reveal;
    R = rv && rv.qIndex === q ? { qIndex: q, answer: rv.answer, dist: rv.dist || [], answered: rv.answered || 0, top5: rv.top5 || [], why: Q.why || '' } : null;
    if(!R){ /* 中途接續剛好卡在公布前 */ H.status = 'question'; H.revealing = false; return hostReveal(); }
    H.lastReveal = R;
  }
  var tot = Math.max(1, R.answered);
  setTop('🎤 ' + H.title, hostChips(), function(){ LQ.close(); });
  var opts = Q.o.map(function(o, i){
    var n = R.dist[i] || 0;
    return '<div class="lq-opt ' + OPT_CLASS[i] + (i === R.answer ? ' right' : ' dim') + '"><b>' + OPT_LETTER[i] + '</b><span>' + esc(o) + '</span><span class="lq-cnt">' + n + ' 人</span>'
      + '<i class="lq-bar" style="width:' + Math.round(n / tot * 100) + '%"></i></div>';
  }).join('');
  var last = q >= H.qs.length - 1;
  setBody('<div class="lq-hgrid"><div class="lq-hmain"><div class="lq-q">' + esc(Q.t) + '</div><div class="lq-opts"' + (Q.o.length === 2 ? ' style="grid-template-columns:1fr 1fr"' : '') + '>' + opts + '</div>'
    + (R.why ? '<div class="lq-p" style="margin-top:8px;font-size:clamp(14px,1.7vmin,20px)">💬 ' + esc(R.why) + '</div>' : '') + '</div>'
    + '<div class="lq-hside" style="flex-basis:clamp(220px,30vw,420px)">' + top5Html(R.top5, null) + '</div></div>');
  setCtl('<button class="lq-btn gray" id="lq-h-pl">👥 參加者</button>'
    + '<label style="display:flex;align-items:center;gap:6px;font-weight:800"><input type="checkbox" id="lq-h-auto"' + (H.auto ? ' checked' : '') + '> 8 秒後自動下一題</label>'
    + '<button class="lq-btn red" id="lq-h-stop">🏁 提早結束</button>'
    + '<button class="lq-btn gold" id="lq-h-next" style="font-size:22px">' + (last ? '🏆 ' + T('看最後結果!', '公布最終排名') : '▶ ' + T('繼續下一題', '繼續下一題')) + '</button>');
  $('lq-h-pl').onclick = playerDrawer;
  $('lq-h-stop').onclick = function(){ confirmBox('現在結束擂台並結算?', '結束並結算', function(){ hostEnd(true); }); };
  $('lq-h-next').onclick = function(){
    if(H.autoH){ clearTimeout(H.autoH); H.autoH = null; }
    /* ★ v5.318.0 有人斷線 ⇒ 先提醒老師(老師:「只要不按繼續下一題就可以等他加入回來」) */
    var off = activePlayers().filter(function(p){ return !isOnline(p); }).map(function(p){ return p.name; });
    if(off.length && !last){
      return confirmBox(T('還有 <b>' + off.length + '</b> 位同學斷線中:', '尚有 <b>' + off.length + '</b> 位離線:') + '<br><small>' + esc(nameList(off)) + '</small><br><small>'
        + T('要等他回來,就先不要按;他重新輸入房號就會回來,分數都還在。', '可稍候其重新進入(成績保留),或直接繼續。') + '</small>',
        T('不等了,繼續', '直接繼續'), function(){ hostAsk(q + 1); });
    }
    hostAsk(q + 1);
  };
  $('lq-h-auto').onchange = function(){ H.auto = this.checked; schedAuto(); };
  schedAuto();
  function schedAuto(){
    if(H.autoH){ clearTimeout(H.autoH); H.autoH = null; }
    if(H.auto && !last) H.autoH = setTimeout(function(){
      if(H.status !== 'reveal' || H.qIndex !== q) return;
      if(offlineCount()){ toast(T('有同學斷線,先暫停自動下一題,等他回來或請老師按「繼續下一題」', '有參加者離線,已暫停自動換題'), 5000); H.autoH = null; return; }
      hostAsk(q + 1);
    }, 8000);
  }
}

/* ───────── 結算 ───────── */
async function hostEnd(early){
  if(H.autoH){ clearTimeout(H.autoH); H.autoH = null; }
  (H.qUnsubs || []).forEach(function(f){ try{ f(); }catch(_){} }); H.qUnsubs = [];
  /* 提早結束:題目還在作答中 ⇒ 這題作廢;已公布的題目照算 */
  var lastQ = H.status === 'question' ? H.qIndex - 1 : H.qIndex;
  var played = lastQ + 1;
  if(played <= 0){
    try{ await F.updateDoc(roomRef(H.pin), { 'meta.status': 'ended', 'meta.endedAt': now(), final: { list: [], at: now(), canceled: true } }); }catch(_){}
    await boardRemove(H.pin); toast('還沒有公布任何一題,這場不計分'); return LQ.close(true);
  }
  var tally = computeTally(lastQ);
  var list = rankList(tally);
  var elig = [], ne = [];
  list.forEach(function(r){
    var jq = H.joinQ[r.uid] || 0, avail = played - jq;
    /* 老師裁定 Q3 乙:參加獎門檻＝加入後題數的一半 */
    var ok = avail > 0 && r.answered >= Math.ceil(avail / 2);
    (ok ? elig : ne).push(r);
  });
  var out = [];
  elig.forEach(function(r, i){
    var p = H.players[r.uid] || {}, rank = i + 1, cc = codeOf(p);
    out.push({ uid: r.uid, name: p.name || '', account: p.account || '', email: p.email || '', code: cc.c, cls: cc.cls, avail: played - (H.joinQ[r.uid] || 0), correct: r.correct, answered: r.answered,
               sec: Math.round(r.sec), score: r.score, base: r.base, bonus: r.bonus, used: r.used, d: r.d, pw: H.power[r.uid] || {}, joinQ: H.joinQ[r.uid] || 0,
               rank: rank, tier: rank <= 5 ? 'A' : (rank <= 10 ? 'B' : 'P') });
  });
  ne.forEach(function(r){
    var p = H.players[r.uid] || {}, cc = codeOf(p);
    out.push({ uid: r.uid, name: p.name || '', account: p.account || '', email: p.email || '', code: cc.c, cls: cc.cls, avail: played - (H.joinQ[r.uid] || 0), correct: r.correct, answered: r.answered, sec: Math.round(r.sec),
               score: r.score, base: r.base, bonus: r.bonus, used: r.used, d: r.d, pw: H.power[r.uid] || {}, joinQ: H.joinQ[r.uid] || 0, rank: 0, tier: '' });
  });
  H.final = { list: out, at: now(), played: played };
  H.status = 'ended';
  try{
    await F.updateDoc(roomRef(H.pin), { 'meta.status': 'ended', 'meta.endedAt': now(), 'meta.played': played, final: H.final });
  }catch(e){ toast('結算寫入失敗:' + (e.code || e.message)); H.status = 'reveal'; return; }
  boardSet(H.pin, { title: H.title, hostName: myLabel(), hostUid: me().uid, at: now(), st: 'ended' });
  try{
    await F.setDoc(F.doc(db(), 'liveQuizHistory', H.pin + '_' + H.createdAt), {
      pin: H.pin, createdAt: H.createdAt, endedAt: now(), title: H.title, hostUid: me().uid, hostEmail: myEmail(), hostName: myLabel(),
      qCount: H.qs.length, played: played, timeLimit: H.timeLimit,
      questions: H.qs.slice(0, played).map(function(Q){ return { t: Q.t, o: Q.o, a: Q.a, s: Q.src || '' }; }),
      list: out, power: H.power, awarded: {},
      /* ★ v5.318.0 應到名單紀錄(班級、應到、請假、缺席座號),日後查詢用 */
      classes: (H.room && H.room.meta && H.room.meta.classes) || [],
      roster: (H.roster || []).map(function(r){
        var p = rosterPlayer(r);
        return { c: r.c, n: r.n, st: p && !p.kicked ? 'in' : (p && p.kicked ? 'kicked' : (H.leave[r.e] ? 'leave' : 'absent')) };
      })
    });
  }catch(_){}
  hostEndScreen(true);
}
function hostEndScreen(anim){
  H.status = 'ended';
  var fin = H.final || (H.room && H.room.final) || { list: [] };
  H.final = fin;
  var list = fin.list || [];
  var top = list.filter(function(e){ return e.rank; });
  setTop('🏆 ' + H.title, [{ html: '🔑 ' + H.pin }, { html: '👥 ' + list.length }], function(){ LQ.close(); });
  var pod = '';
  [2, 1, 3].forEach(function(rk){
    var e = top[rk - 1]; if(!e) { pod += '<div class="lq-pod p' + rk + '" style="visibility:hidden"></div>'; return; }
    var delay = anim ? (rk === 3 ? 0.3 : (rk === 2 ? 1.3 : 2.4)) : 0;
    pod += '<div class="lq-pod p' + rk + '" style="animation-delay:' + delay + 's"><div class="who">' + esc(e.name) + '<small>' + (e.score != null ? fmtPts(e.score) + ' 分・' : '') + T('答對 ', '答對 ') + e.correct + ' 題</small></div><div class="blk">' + rk + '</div></div>';
  });
  var cnt = { A: 0, B: 0, P: 0 }, done = 0, need = 0;
  list.forEach(function(e){ if(e.tier){ cnt[e.tier]++; need++; if(H.awarded[e.uid]) done++; } });
  var sc0 = anim ? 0 : ($('lq-body') ? $('lq-body').scrollTop : 0);
  setBody('<div class="lq-podium">' + pod + '</div>'
    + '<div class="lq-final" style="margin-top:4px"><div class="lq-h1" style="font-size:clamp(18px,2.6vmin,28px)">🏆 ' + T('最終排行榜', '最終排行榜') + '</div>'
    + finalTableHtml(list, { host: true, awarded: H.awarded }) + '</div>'
    + '<div class="lq-card" style="width:min(98%,1000px);margin-top:12px"><div class="lq-p" style="font-weight:900;color:#ffd166">🎁 ' + T('獎勵', '頒獎') + ':'
    + TIERS.A.name + ' ' + cnt.A + ' 人・' + TIERS.B.name + ' ' + cnt.B + ' 人・' + TIERS.P.name + ' ' + cnt.P + ' 人'
    + '<br><small style="color:#fff;opacity:.75">' + TIERS.A.name + ':' + TIERS.A.items.join('、') + '<br>' + TIERS.B.name + ':' + TIERS.B.items.join('、') + '<br>' + TIERS.P.name + ':' + TIERS.P.items.join('、')
    + '<br>參加獎門檻:作答題數達加入後題數的一半;前 10 名不另給參加獎。獎勵會送進學生的「🎁 GM獎勵」收件箱,學生本人登入按確認領取才入帳。</small></div>'
    + '<div class="lq-p" id="lq-h-aw">' + (need ? ('已頒發 ' + done + ' / ' + need + ' 人') : '沒有符合獎勵資格的同學') + '</div></div>'
    + (classSummaryHtml(list) || '') + '<div style="height:20px"></div>');
  if(sc0) $('lq-body').scrollTop = sc0;   /* 頒獎後重畫維持原捲動位置 */
  /* ★ v5.318.0 遊戲結束特效與音樂:第 3 名 → 第 2 名 → 冠軍依序登台,冠軍出場放勝利曲＋掌聲＋彩帶 */
  if(anim){
    bgmBack();
    (H.endT || []).forEach(clearTimeout); H.endT = [];
    var at = function(ms, f){ H.endT.push(setTimeout(function(){ if(H.status === 'ended') f(); }, ms)); };
    if(top[2]) at(300, function(){ snd('pod', 0.55); });
    if(top[1]) at(1300, function(){ snd('pod', 0.6); });
    at(top[0] ? 2400 : 400, function(){
      bgmWin(); snd('champ', 0.75); fxFlash('rgba(255,230,140,.5)'); fxConfetti(150, true);
      if(top[0]) fxPop('🏆 ' + nameNoCode(top[0].name), '#ffd166');
    });
    at(top[0] ? 3000 : 1000, function(){ snd('applause', 0.6); });
    at(5200, function(){ fxConfetti(80, true); });
  }
  $('lq-body').onclick = function(ev){
    var b = ev.target.closest && ev.target.closest('[data-detail]'); if(!b) return;
    var uid = b.getAttribute('data-detail'), e = null;
    list.forEach(function(x){ if(x.uid === uid) e = x; });
    if(e) showDetail(e, H.qs, H.timeLimit, null);
  };
  /* ★ v5.325.0(老師「比賽結束時,要按確認發送獎勵才真正發送。如果是測試場或是有出現爭議,老師可以不發該場獎勵」)
     ① 按「🎁 頒發獎勵」先跳確認(各級人數＋內容),按「確認發送」才真的寫進學生收件箱;
     ② 還沒發出任何一份時可選「🚫 本場不發獎勵」(測試場/有爭議/其他＋可補充說明),記在房間與永久紀錄,學生端顯示老師決定不發;
        發出前都可以「↺ 改回要發獎勵」。已經發出部分獎勵的場次不能再改成不發(已送出的不會自動收回)。 */
  var nA = (H.room && H.room.meta && H.room.meta.noAward) || H.noAward;
  if(nA){
    var why = (H.room && H.room.meta && H.room.meta.noAwardReason) || H.noAwardReason || '';
    var aw = $('lq-h-aw'); if(aw) aw.innerHTML = '🚫 <b>本場不發獎勵</b>' + (why ? '(' + esc(why) + ')' : '');
    setCtl('<button class="lq-btn" id="lq-h-undo">↺ 改回要發獎勵</button><button class="lq-btn gray" id="lq-h-closeroom">🚪 關閉擂台</button>');
    $('lq-h-undo').onclick = function(){ setNoAward(false, ''); };
  }else{
    setCtl('<button class="lq-btn gold" id="lq-h-grant" style="font-size:22px"' + (need && done < need ? '' : ' disabled') + '>🎁 ' + (done ? '繼續頒發' : '頒發獎勵') + '</button>'
      + (need && !done ? '<button class="lq-btn gray" id="lq-h-noaward">🚫 本場不發獎勵</button>' : '')
      + '<button class="lq-btn gray" id="lq-h-closeroom">🚪 關閉擂台</button>');
    $('lq-h-grant').onclick = function(){ confirmGrant(cnt, need - done, done); };
    if($('lq-h-noaward')) $('lq-h-noaward').onclick = askNoAward;
  }
  $('lq-h-closeroom').onclick = function(){
    var left = nA ? 0 : need - done;
    var go = async function(){ await boardRemove(H.pin); LQ.close(true); };
    if(left > 0) confirmBox('還有 ' + left + ' 位同學的獎勵沒發,確定關閉?<br><small>之後可從「📜 擂台紀錄」重新開啟這場繼續頒發;不打算發的話請先按「🚫 本場不發獎勵」。</small>', '關閉', go);
    else go();
  };
}
/* ★ v5.325.0 頒獎確認視窗 */
function confirmGrant(cnt, left, done){
  var line = function(k){ return cnt[k] ? '<div style="margin:4px 0"><b>' + TIERS[k].name + ' ' + cnt[k] + ' 人</b><br><small style="opacity:.85">' + TIERS[k].items.join('、') + '</small></div>' : ''; };
  confirmBox('<div class="lq-h1" style="font-size:22px">🎁 確認發送獎勵?</div>'
    + (done ? '<div>已發出 ' + done + ' 人,這次會發剩下的 <b>' + left + '</b> 人。</div>' : '<div>這次會發給 <b>' + left + '</b> 位同學:</div>')
    + line('A') + line('B') + line('P')
    + '<small>按「確認發送」後,獎勵會立刻送進學生的「🎁 GM獎勵」收件箱(學生本人按確認領取才入帳)。送出後無法從這裡收回;測試場或有爭議請改按「🚫 本場不發獎勵」。</small>',
    '確認發送', hostGrant);
}
/* ★ v5.325.0 不發獎勵:選原因 */
function askNoAward(){
  modal('<div class="lq-h1" style="font-size:22px">🚫 本場不發獎勵</div>'
    + '<div class="lq-p" style="text-align:left">這一場的名次和成績照樣保留在紀錄裡,只是不發獎勵。學生畫面會顯示「這一場老師決定不發獎勵」。<br>原因:</div>'
    + '<div class="lq-row" id="lq-na-why"><button class="lq-btn gold" data-why="測試場">🧪 測試場</button><button class="lq-btn" data-why="有爭議">⚖️ 有爭議</button><button class="lq-btn" data-why="其他">📝 其他</button></div>'
    + '<input id="lq-na-note" maxlength="60" placeholder="補充說明(可不填)" style="width:100%;font-size:17px;padding:8px 10px;border-radius:10px;border:2px solid #5fb3d9;background:#0c2233;color:#fff;margin-top:6px">'
    + '<div class="lq-row"><button class="lq-btn gray" id="lq-na-no">取消</button><button class="lq-btn gold" id="lq-na-ok">確定不發</button></div>');
  var pick = '測試場';
  $('lq-na-why').onclick = function(e){
    var b = e.target.closest('[data-why]'); if(!b) return; pick = b.getAttribute('data-why');
    Array.prototype.forEach.call(document.querySelectorAll('#lq-na-why [data-why]'), function(x){ x.className = 'lq-btn' + (x === b ? ' gold' : ''); });
  };
  $('lq-na-no').onclick = closeModal;
  $('lq-na-ok').onclick = function(){
    var note = String(($('lq-na-note') || {}).value || '').trim().slice(0, 60);
    closeModal(); setNoAward(true, pick + (note ? ':' + note : ''));
  };
}
async function setNoAward(on, reason){
  if(on && Object.keys(H.awarded || {}).length){ toast('已經發出部分獎勵,不能改成不發'); return; }
  var o = { 'meta.noAward': !!on, 'meta.noAwardReason': on ? reason : '', 'meta.noAwardAt': on ? now() : 0 };
  try{ await F.updateDoc(roomRef(H.pin), o); }catch(e){ toast('設定失敗:' + (e.code || e.message)); return; }
  F.updateDoc(F.doc(db(), 'liveQuizHistory', H.pin + '_' + H.createdAt), { noAward: !!on, noAwardReason: on ? reason : '', noAwardAt: on ? now() : 0, noAwardBy: myEmail().slice(0, 60) }).catch(function(){});
  H.noAward = !!on; H.noAwardReason = on ? reason : '';
  if(H.room && H.room.meta){ H.room.meta.noAward = !!on; H.room.meta.noAwardReason = H.noAwardReason; }
  /* 不發獎勵 ⇒ 首頁看板直接移除(不用再提醒老師待頒獎);改回要發 ⇒ 放回「待頒獎」 */
  if(on) boardRemove(H.pin); else boardSet(H.pin, { title: H.title, hostName: myLabel(), hostUid: me().uid, at: now(), st: 'ended' });
  toast(on ? '🚫 本場不發獎勵(' + reason + ')' : '↺ 已改回要發獎勵', 3500);
  hostEndScreen(false);
}
/* ★ v5.318.0 丙(老師「甲+乙+丙」)— 老師端成績明細:每題作答選項/對錯/秒數/得分/法寶,學生有疑問時可直接查 */
function showDetail(e, qs, limit, back){
  var d = e.d || [], jq = e.joinQ || 0, pw = e.pw || {};
  var rows = '';
  for(var q = 0; q < d.length; q++){
    var Q = qs[q] || {}, x = d[q];
    var tool = (pw.cut === q ? '🗡️' : '') + (pw.hint === q ? '💡' : '');
    var ans = (Q.o && Q.a != null) ? (OPT_LETTER[Q.a] + '. ' + esc(Q.o[Q.a])) : '';
    if(q < jq){ rows += '<tr class="ne"><td>' + (q + 1) + '</td><td class="nm">' + esc(String(Q.t || '').slice(0, 40)) + '</td><td colspan="4"><small>尚未加入</small></td><td></td></tr>'; continue; }
    if(!x){ rows += '<tr class="ne"><td>' + (q + 1) + '</td><td class="nm">' + esc(String(Q.t || '').slice(0, 40)) + '<br><small style="opacity:.6">正解 ' + ans + '</small></td><td>—</td><td>沒作答</td><td>—</td><td>0</td><td>' + tool + '</td></tr>'; continue; }
    var ok = x.c === Q.a;
    rows += '<tr><td>' + (q + 1) + '</td><td class="nm">' + esc(String(Q.t || '').slice(0, 40)) + '<br><small style="opacity:.6">正解 ' + ans + '</small></td>'
      + '<td>' + (OPT_LETTER[x.c] || '?') + '</td><td style="color:' + (ok ? '#7dffb0' : '#ff9d9d') + '">' + (ok ? '✔ 對' : '✘ 錯') + '</td>'
      + '<td>' + fmtSec(x.s) + ' 秒</td><td>' + (x.p ? '+' + fmtPts(x.p) : '0') + '</td><td>' + tool + '</td></tr>';
  }
  var m = modal('<div class="lq-h1" style="font-size:22px">📋 ' + esc(e.name) + ' <small style="opacity:.6;font-size:.6em">' + esc(e.account || '') + '</small></div>'
    + '<div class="lq-p" style="font-size:15px;line-height:1.7">總分 <b style="color:#ffd166">' + fmtPts(e.score) + '</b> = 基本分 ' + fmtPts(e.base)
    + ' × (1 + 法寶保留加成 ' + (e.bonus || 0) + '%)・答對 ' + e.correct + ' / 作答 ' + e.answered + (jq ? '・第 ' + (jq + 1) + ' 題才加入' : '')
    + '<br><small style="opacity:.75">每題答對 = 500 + 500 ×(1 − 秒數 ÷ ' + limit + ' 秒);秒數以學生平板量測、雲端時間核對,網路延遲最多補 3 秒</small></div>'
    + '<div style="overflow-x:auto"><table class="lq-table" style="width:100%;font-size:14px"><tr><th>題</th><th>題目</th><th>作答</th><th>結果</th><th>秒數</th><th>得分</th><th>法寶</th></tr>' + rows + '</table></div>'
    + '<div class="lq-row">' + (back ? '<button class="lq-btn gray" id="lq-dt-back">⬅ 返回</button>' : '') + '<button class="lq-btn gray" id="lq-dt-x">關閉</button></div>');
  m.firstChild.style.width = 'min(96vw,980px)';
  $('lq-dt-x').onclick = closeModal;
  if(back) $('lq-dt-back').onclick = back;
}
async function hostGrant(){
  if(H.granting) return;
  if(H.noAward || (H.room && H.room.meta && H.room.meta.noAward)){ toast('本場已設定不發獎勵'); return; }   /* ★ v5.325.0 */
  H.granting = true;
  var btn = $('lq-h-grant'); if(btn){ btn.disabled = true; btn.textContent = '頒發中…'; }
  var list = (H.final && H.final.list) || [], rid = 'lq_' + H.pin + '_' + H.createdAt, u = me();
  var ok = 0, fail = 0, total = 0, done = 0;
  list.forEach(function(e){ if(e.tier) total++; });
  for(var i = 0; i < list.length; i++){
    var e = list[i]; if(!e.tier) continue;
    if(H.awarded[e.uid]){ done++; continue; }
    var t = TIERS[e.tier];
    var merit = (e.tier === 'P' ? ('⚡搶答擂台參加獎｜' + H.title) : ('⚡搶答擂台｜' + H.title + '｜第' + e.rank + '名／共' + list.length + '人')).slice(0, 120);
    var ref = F.doc(db(), 'gmClassRewards', e.uid, 'items', rid);
    try{
      if(isAdmin()){ var ex = await F.getDoc(ref); if(ex.exists()){ await markAwarded(e.uid, e.tier); ok++; done++; continue; } }
      await F.setDoc(ref, { uid: e.uid, label: String(e.name || '').slice(0, 80), email: String(e.email || '').slice(0, 80),
        reward: JSON.parse(JSON.stringify(t.reward)), itemsLabel: t.items.slice(), merit: merit, by: myEmail().slice(0, 60), at: now(), enabled: true, lq: H.pin });
      await markAwarded(e.uid, e.tier);
      if(isAdmin() && typeof window._fbWriteGmGiftLog === 'function'){
        window._fbWriteGmGiftLog({ uid: e.uid, label: e.name, email: e.email, items: t.items, by: myEmail(), merit: merit, rewardId: rid, kind: 'liveQuiz' }).catch(function(){});
      }
      ok++; done++;
    }catch(err){
      /* 主持人:同一筆已存在時規則會拒絕(只准建立)⇒ 視為已發過 */
      if(err && err.code === 'permission-denied' && !isAdmin()){
        try{ await markAwarded(e.uid, e.tier); done++; ok++; continue; }catch(_){}
      }
      fail++; console.warn('[搶答擂台] 頒獎失敗', e.uid, err);
    }
    var el = $('lq-h-aw'); if(el) el.textContent = '頒發中… ' + done + ' / ' + total;
  }
  H.granting = false;
  toast(fail ? ('完成 ' + ok + ' 人,失敗 ' + fail + ' 人,可再按「繼續頒發」') : ('🎉 已頒發 ' + ok + ' 人'), 4000);
  hostEndScreen(false);
  if(ok){ snd('coin', 0.7); setTimeout(function(){ snd('fanfare', 0.5); }, 250); fxConfetti(60, true); }
}
async function markAwarded(uid, tier){
  H.awarded[uid] = tier;
  var o = {}; o['awarded.' + uid] = tier;
  await F.updateDoc(roomRef(H.pin), o);
  F.updateDoc(F.doc(db(), 'liveQuizHistory', H.pin + '_' + H.createdAt), o).catch(function(){});
}

/* ───────── 擂台紀錄 ───────── */
async function showHistory(){
  modal('<div class="lq-h1" style="font-size:22px">📜 擂台紀錄</div><div id="lq-hist" class="lq-p" style="text-align:left">讀取中…</div><div class="lq-row"><button class="lq-btn gray" id="lq-hi-x">關閉</button></div>');
  $('lq-hi-x').onclick = closeModal;
  try{
    var u = me(), qq = isAdmin() ? F.query(F.collection(db(), 'liveQuizHistory'), F.orderBy('createdAt', 'desc'), F.limit(40))
                                 : F.query(F.collection(db(), 'liveQuizHistory'), F.where('hostUid', '==', u.uid));
    var ss = await F.getDocs(qq), arr = [];
    ss.forEach(function(d){ arr.push(d.data()); });
    arr.sort(function(a, b){ return (b.createdAt || 0) - (a.createdAt || 0); });
    $('lq-hist').innerHTML = arr.length ? arr.slice(0, 40).map(function(h){
      var need = (h.list || []).filter(function(e){ return e.tier; }).length, got = Object.keys(h.awarded || {}).length;
      var top3 = (h.list || []).filter(function(e){ return e.rank && e.rank <= 3; }).map(function(e){ return ['🥇', '🥈', '🥉'][e.rank - 1] + esc(e.name); }).join(' ');
      return '<div class="lq-qi" style="font-size:15px"><span class="tx"><b>' + esc(h.title) + '</b>(' + h.pin + ')<small>' + new Date(h.createdAt).toLocaleString() + '・' + esc(h.hostName || '') + '・'
        + (h.list || []).length + ' 人・' + (h.played || h.qCount) + ' 題・' + (h.noAward ? '🚫 不發獎勵' + (h.noAwardReason ? '(' + esc(h.noAwardReason) + ')' : '') : '頒獎 ' + got + '/' + need) + '</small><small>' + top3 + '</small></span>'
        + '<button class="lq-btn gray" style="width:auto;height:auto;padding:5px 10px;font-size:14px" data-hres="' + h.pin + '_' + h.createdAt + '">📋 成績</button>'
        + (got < need && !h.noAward && h.hostUid === u.uid ? '<button class="lq-btn" style="width:auto;height:auto;padding:5px 10px;font-size:14px" data-reopen="' + h.pin + '">繼續頒發</button>' : '') + '</div>';
    }).join('') : '還沒有紀錄';
    $('lq-hist').onclick = function(e){
      var r = e.target.closest('[data-hres]');
      if(r){ var key = r.getAttribute('data-hres'), h = null; arr.forEach(function(x){ if(x.pin + '_' + x.createdAt === key) h = x; }); if(h) histResult(h); return; }
      var b = e.target.closest('[data-reopen]'); if(!b) return; closeModal(); hostResume(b.getAttribute('data-reopen'));
    };
  }catch(e){ $('lq-hist').textContent = '讀取失敗:' + (e.code || e.message); }
}

/* ═════════ ★ v5.318.0 老師:「GM 可以開啟每個班的排行榜紀錄,進行班級間的比較」 ═════════
   資料來源:liveQuizHistory(每場永久紀錄;GM 看全校、主持人看自己主持的場次)。
   公平比較用「答對率」＝答對題數 ÷ 加入後的題數,和「平均每題得分」＝基本分 ÷ 加入後題數(不含法寶加成),
   不受每場題數多寡影響。舊紀錄沒有班級欄位 ⇒ 由名稱開頭 4 碼(年級＋班級＋座號)推算。 */
function eAvail(e, played){ return Math.max(1, e.avail || ((played || 0) - (e.joinQ || 0)) || e.answered || 1); }
function classAgg(list, played){
  var m = {};
  (list || []).forEach(function(e){
    var cls = entryCode(e).cls || T('其他', '其他');
    var a = m[cls] || (m[cls] = { cls: cls, n: 0, correct: 0, avail: 0, base: 0, top5: 0, champ: 0, best: 0 });
    var av = eAvail(e, played);
    a.n++; a.correct += e.correct || 0; a.avail += av; a.base += (e.base != null ? e.base : (e.score || 0));
    if(e.rank && e.rank <= 5) a.top5++;
    if(e.rank === 1) a.champ++;
    if(e.rank && (!a.best || e.rank < a.best)) a.best = e.rank;
  });
  return Object.keys(m).map(function(k){ var a = m[k]; a.rate = a.avail ? a.correct / a.avail : 0; a.ppq = a.avail ? a.base / a.avail : 0; return a; })
    .sort(function(x, y){ return (y.rate - x.rate) || (y.ppq - x.ppq); });
}
function pct(x){ return Math.round(x * 1000) / 10 + '%'; }
function barHtml(x){ return '<div class="lq-barw"><div class="lq-bar" style="width:' + Math.max(1, Math.round(x * 100)) + '%"></div></div>'; }
/* 同一場有 2 個班以上 ⇒ 結算畫面/紀錄下方附「班級對照」(同一份題目,比較最公平) */
function classSummaryHtml(list, played){
  var A = classAgg(list, played || (H.final && H.final.played));
  if(A.length < 2) return '';
  return '<div class="lq-card lq-final" style="margin-top:12px"><div class="lq-h1" style="font-size:clamp(17px,2.4vmin,24px)">🏫 ' + T('這一場的班級對照', '本場班級對照') + '</div>'
    + '<div style="overflow-x:auto;width:100%"><table class="lq-table" style="width:100%"><tr><th>#</th><th>班級</th><th>人數</th><th>答對率</th><th></th><th>平均每題得分</th><th>前五名</th><th>最佳名次</th></tr>'
    + A.map(function(a, i){ return '<tr><td>' + (i + 1) + '</td><td><b>' + esc(a.cls) + '</b></td><td>' + a.n + '</td><td><b>' + pct(a.rate) + '</b></td><td style="width:30%">' + barHtml(a.rate) + '</td><td>' + Math.round(a.ppq) + '</td><td>' + a.top5 + '</td><td>' + (a.best || '—') + '</td></tr>'; }).join('')
    + '</table></div></div>';
}
var CB = { arr: null, period: 'all', grade: '' };
async function loadHistAll(){
  var u = me();
  var qq = isAdmin() ? F.query(F.collection(db(), 'liveQuizHistory'), F.orderBy('createdAt', 'desc'), F.limit(300))
                     : F.query(F.collection(db(), 'liveQuizHistory'), F.where('hostUid', '==', u.uid));
  var ss = await F.getDocs(qq), arr = [];
  ss.forEach(function(d){ var x = d.data(); if(x && (x.list || []).length) arr.push(x); });
  arr.sort(function(a, b){ return (b.createdAt || 0) - (a.createdAt || 0); });
  return arr;
}
function cbFiltered(){
  var t = now(), from = 0, d = new Date();
  if(CB.period === '7') from = t - 7 * 864e5;
  else if(CB.period === '30') from = t - 30 * 864e5;
  else if(CB.period === 'term'){ var y = d.getFullYear(), mo = d.getMonth(); from = (mo >= 7 ? new Date(y, 7, 1) : (mo >= 1 ? new Date(y, 1, 1) : new Date(y - 1, 7, 1))).getTime(); }
  return (CB.arr || []).filter(function(h){ return (h.createdAt || 0) >= from; });
}
function cbAggregate(){
  var hs = cbFiltered(), C = {};
  hs.forEach(function(h){
    var key = h.pin + '_' + h.createdAt;
    (h.list || []).forEach(function(e){
      var cc = entryCode(e), cls = cc.cls || '其他';
      if(CB.grade && cls.charAt(0) !== CB.grade) return;
      var c = C[cls] || (C[cls] = { cls: cls, ses: {}, n: 0, correct: 0, avail: 0, base: 0, top5: 0, champ: 0, stu: {}, games: [] });
      var av = eAvail(e, h.played);
      if(!c.ses[key]){ c.ses[key] = { h: h, n: 0, correct: 0, avail: 0, best: 0 }; c.games.push(c.ses[key]); }
      var g = c.ses[key]; g.n++; g.correct += e.correct || 0; g.avail += av; if(e.rank && (!g.best || e.rank < g.best)) g.best = e.rank;
      c.n++; c.correct += e.correct || 0; c.avail += av; c.base += (e.base != null ? e.base : (e.score || 0));
      if(e.rank && e.rank <= 5) c.top5++;
      if(e.rank === 1) c.champ++;
      var sk = e.uid || cc.c || e.name;
      var s = c.stu[sk] || (c.stu[sk] = { code: cc.c, name: nameNoCode(e.name), games: 0, correct: 0, avail: 0, base: 0, best: 0, top5: 0, champ: 0 });
      s.games++; s.correct += e.correct || 0; s.avail += av; s.base += (e.base != null ? e.base : (e.score || 0));
      if(e.rank && (!s.best || e.rank < s.best)) s.best = e.rank;
      if(e.rank && e.rank <= 5) s.top5++;
      if(e.rank === 1) s.champ++;
      if(cc.c) s.code = cc.c;
    });
  });
  return Object.keys(C).map(function(k){
    var c = C[k]; c.nses = c.games.length; c.rate = c.avail ? c.correct / c.avail : 0; c.ppq = c.avail ? c.base / c.avail : 0; return c;
  }).sort(function(a, b){ return (b.rate - a.rate) || (b.ppq - a.ppq); });
}
function csvDownload(name, rows){
  try{
    var s = '﻿' + rows.map(function(r){ return r.map(function(v){ v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([s], { type: 'text/csv;charset=utf-8' })); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }catch(e){ toast('下載失敗:' + e.message); }
}
async function showClassBoard(){
  var m = modal('<div class="lq-h1" style="font-size:22px">🏫 ' + T('班級排行榜', '班級排行榜') + '</div><div id="lq-cb" class="lq-p" style="text-align:left">讀取中…</div>'
    + '<div class="lq-row"><button class="lq-btn gray" id="lq-cb-x">關閉</button></div>');
  m.firstChild.style.width = 'min(97vw,1100px)';
  $('lq-cb-x').onclick = closeModal;
  try{ if(!CB.arr) CB.arr = await loadHistAll(); }catch(e){ $('lq-cb').textContent = '讀取失敗:' + (e.code || e.message); return; }
  cbDraw();
}
function cbDraw(){
  var box = $('lq-cb'); if(!box) return;
  var A = cbAggregate(), nH = cbFiltered().length;
  var sel = function(id, opts, v){ return '<select id="' + id + '">' + opts.map(function(o){ return '<option value="' + o[0] + '"' + (o[0] === v ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>'; };
  var h = '<div class="lq-row" style="justify-content:flex-start;gap:10px;margin:4px 0 8px">'
    + '<label>期間 ' + sel('lq-cb-p', [['all', '全部'], ['term', '本學期'], ['30', '近 30 天'], ['7', '近 7 天']], CB.period) + '</label>'
    + '<label>年級 ' + sel('lq-cb-g', [['', '全部'], ['1', '一年級'], ['2', '二年級'], ['3', '三年級'], ['4', '四年級'], ['5', '五年級'], ['6', '六年級']], CB.grade) + '</label>'
    + '<button class="lq-btn gray" id="lq-cb-csv" style="width:auto;height:auto;padding:6px 12px;font-size:15px">📥 CSV</button>'
    + '<button class="lq-btn gray" id="lq-cb-re" style="width:auto;height:auto;padding:6px 12px;font-size:15px">🔄 重新讀取</button></div>'
    + '<div style="font-size:13px;opacity:.75;margin-bottom:6px">' + (isAdmin() ? '全校' : '你主持的') + ' ' + nH + ' 場擂台。依「答對率」排序(答對題數 ÷ 加入後的題數,不受題數多寡影響);點班級看全班名單與每場成績。'
    + '<br>⚠ 不同場次的題目難度不同,最公平的比較是「同一場多個班一起比」——在「📜 擂台紀錄 → 📋 成績」最下方有該場的班級對照。</div>';
  if(!A.length) h += '<div class="lq-p" style="opacity:.7">這段期間還沒有紀錄</div>';
  else h += '<div style="overflow-x:auto"><table class="lq-table" style="width:100%"><tr><th>#</th><th>班級</th><th>場次</th><th>參賽人次</th><th>答對率</th><th style="width:26%"></th><th>平均每題得分</th><th>前五名人次</th><th>冠軍</th></tr>'
    + A.map(function(c, i){
        return '<tr class="lq-clsrow" data-cls="' + esc(c.cls) + '"><td>' + (i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1) + '</td><td><b>' + esc(c.cls) + '</b></td><td>' + c.nses + '</td><td>' + c.n + '</td>'
          + '<td><b>' + pct(c.rate) + '</b></td><td>' + barHtml(c.rate) + '</td><td>' + Math.round(c.ppq) + '</td><td>' + c.top5 + '</td><td>' + (c.champ || '—') + '</td></tr>';
      }).join('') + '</table></div>';
  box.innerHTML = h;
  $('lq-cb-p').onchange = function(){ CB.period = this.value; cbDraw(); };
  $('lq-cb-g').onchange = function(){ CB.grade = this.value; cbDraw(); };
  $('lq-cb-re').onclick = async function(){ box.textContent = '讀取中…'; try{ CB.arr = await loadHistAll(); }catch(e){ box.textContent = '讀取失敗:' + (e.code || e.message); return; } cbDraw(); };
  $('lq-cb-csv').onclick = function(){
    csvDownload('搶答擂台_班級比較.csv', [['排名', '班級', '場次', '參賽人次', '答對率', '平均每題得分', '前五名人次', '冠軍次數']].concat(A.map(function(c, i){ return [i + 1, c.cls, c.nses, c.n, pct(c.rate), Math.round(c.ppq), c.top5, c.champ]; })));
  };
  box.onclick = function(e){ var r = e.target.closest && e.target.closest('[data-cls]'); if(!r) return; var c = null; A.forEach(function(x){ if(x.cls === r.getAttribute('data-cls')) c = x; }); if(c) cbClass(c); };
}
function cbClass(c){
  var box = $('lq-cb'); if(!box) return;
  var S = Object.keys(c.stu).map(function(k){ var s = c.stu[k]; s.rate = s.avail ? s.correct / s.avail : 0; s.ppq = s.avail ? s.base / s.avail : 0; return s; })
    .sort(function(a, b){ return (b.rate - a.rate) || (b.ppq - a.ppq) || (b.games - a.games); });
  var G = c.games.slice().sort(function(a, b){ return (b.h.createdAt || 0) - (a.h.createdAt || 0); });
  box.innerHTML = '<div class="lq-row" style="justify-content:flex-start;gap:10px"><button class="lq-btn gray" id="lq-cb-back" style="width:auto;height:auto;padding:6px 12px;font-size:15px">⬅ 班級比較</button>'
    + '<button class="lq-btn gray" id="lq-cb-csv2" style="width:auto;height:auto;padding:6px 12px;font-size:15px">📥 CSV</button></div>'
    + '<div class="lq-h1" style="font-size:20px;margin-top:6px">🏫 ' + esc(c.cls) + ' ' + T('排行榜', '排行榜') + '</div>'
    + '<div style="font-size:14px;opacity:.85">' + c.nses + ' 場・參賽 ' + c.n + ' 人次・全班答對率 <b style="color:#ffd166">' + pct(c.rate) + '</b>・前五名 ' + c.top5 + ' 人次</div>'
    + '<div style="overflow-x:auto;margin-top:6px"><table class="lq-table lq-final" style="width:100%"><tr><th>#</th><th>班級座號</th><th>名字</th><th>參加場次</th><th>答對率</th><th>平均每題得分</th><th>最佳名次</th><th>前五名次數</th></tr>'
    + S.map(function(s, i){ return '<tr' + (i < 3 ? ' class="top"' : '') + '><td>' + (i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1) + '</td><td class="cd">' + esc(s.code || '—') + '</td><td class="nm">' + esc(s.name) + '</td><td>' + s.games + '</td><td><b>' + pct(s.rate) + '</b></td><td>' + Math.round(s.ppq) + '</td><td>' + (s.best || '—') + '</td><td>' + (s.top5 || '—') + '</td></tr>'; }).join('')
    + '</table></div>'
    + '<div class="lq-h1" style="font-size:18px;margin-top:12px">📅 ' + T('每場成績', '各場次表現') + '</div>'
    + '<div style="overflow-x:auto"><table class="lq-table" style="width:100%"><tr><th>日期</th><th>場次</th><th>本班人數</th><th>本班答對率</th><th>本班最佳名次</th><th></th></tr>'
    + G.map(function(g){ var h = g.h; return '<tr><td>' + new Date(h.createdAt).toLocaleDateString() + '</td><td class="nm">' + esc(h.title || '') + ' <small style="opacity:.6">' + esc(h.hostName || '') + '</small></td><td>' + g.n + ' / ' + (h.list || []).length + '</td><td><b>' + pct(g.avail ? g.correct / g.avail : 0) + '</b></td><td>' + (g.best || '—') + '</td>'
      + '<td><button class="lq-dbtn" data-hres="' + h.pin + '_' + h.createdAt + '">📋</button></td></tr>'; }).join('')
    + '</table></div>';
  $('lq-cb-back').onclick = cbDraw;
  $('lq-cb-csv2').onclick = function(){
    csvDownload('搶答擂台_' + c.cls + '.csv', [['排名', '班級座號', '名字', '參加場次', '答對率', '平均每題得分', '最佳名次', '前五名次數']].concat(S.map(function(s, i){ return [i + 1, s.code, s.name, s.games, pct(s.rate), Math.round(s.ppq), s.best || '', s.top5]; })));
  };
  box.onclick = function(e){
    var b = e.target.closest && e.target.closest('[data-hres]'); if(!b) return;
    var h = null; (CB.arr || []).forEach(function(x){ if(x.pin + '_' + x.createdAt === b.getAttribute('data-hres')) h = x; });
    if(h) histResult(h, function(){ showClassBoard().then(function(){ cbClass(c); }); });
  };
}

/* ★ v5.318.0 丙:擂台紀錄 → 某一場的成績表(可再點每位學生的明細) */
/* ★ v5.318.0 紀錄裡的應到名單:班級、出席、請假、缺席 */
function histRosterHtml(h){
  var R = h.roster || []; if(!R.length) return '';
  var g = { in: [], leave: [], absent: [], kicked: [] };
  R.forEach(function(x){ (g[x.st] || g.absent).push(x.n); });
  var line = function(t, a){ return a.length ? '<div><b>' + t + ' ' + a.length + '</b>:' + esc(a.join('、')) + '</div>' : ''; };
  return '<div class="lq-p" style="text-align:left;font-size:14px;line-height:1.7;margin-top:8px;opacity:.9">'
    + '<div>🏫 ' + esc((h.classes || []).join('、')) + '・應到 ' + R.length + ' 人・出席 ' + g.in.length + ' 人</div>'
    + line('🏖 請假', g.leave) + line('❌ 缺席', g.absent) + line('🚫 請出', g.kicked) + '</div>';
}
function histResult(h, back){
  var list = h.list || [];
  var m = modal('<div class="lq-h1" style="font-size:22px">📋 ' + esc(h.title) + '(' + h.pin + ')</div>'
    + '<div class="lq-p" style="font-size:14px;opacity:.75">' + new Date(h.createdAt).toLocaleString() + '・' + esc(h.hostName || '') + '・' + list.length + ' 人・' + (h.played || h.qCount) + ' 題・每題 ' + (h.timeLimit || MAX_SEC) + ' 秒</div>'
    + finalTableHtml(list, { host: true, awarded: h.awarded || {} })
    + classSummaryHtml(list, h.played || h.qCount)
    + histRosterHtml(h)
    + '<div class="lq-row"><button class="lq-btn gray" id="lq-hr-back">⬅ ' + (back ? '返回' : '擂台紀錄') + '</button><button class="lq-btn gray" id="lq-hr-x">關閉</button></div>');
  m.firstChild.style.width = 'min(97vw,1100px)';
  $('lq-hr-x').onclick = closeModal;
  $('lq-hr-back').onclick = back || showHistory;
  m.onclick = function(ev){
    var b = ev.target.closest && ev.target.closest('[data-detail]'); if(!b) return;
    var e = null; list.forEach(function(x){ if(x.uid === b.getAttribute('data-detail')) e = x; });
    if(e) showDetail(e, h.questions || [], h.timeLimit || MAX_SEC, function(){ histResult(h, back); });
  };
}

/* ───────── 主持人管理(GM 專用)───────── */
async function hostManager(){
  if(!isAdmin()){ toast('只有 GM 可以管理主持人'); return; }
  H.stop();
  setTop('👥 ' + T('搶答擂台・主持人管理', '主持人名單管理'), [], function(){ LQ.close(true); });
  setCtl('<button class="lq-btn gray" id="lq-m-back">⬅ 回主持台</button>');
  $('lq-m-back').onclick = hostHome;
  setBody('<div class="lq-form"><div class="lq-fs"><h3>匯入主持人帳號</h3>'
    + '<div style="font-size:14px;opacity:.8;margin-bottom:6px">貼上老師的 Google 帳號 email(可多筆,換行或逗號分隔)。名單存在雲端,換裝置也有效。主持人可以開房、出題、主持、照固定獎勵表頒獎;不能改獎勵數量、不能管理名單。</div>'
    + '<textarea id="lq-m-in" placeholder="teacher1@lsps.tp.edu.tw&#10;teacher2@gmail.com"></textarea>'
    + '<div class="lq-row" style="justify-content:flex-start"><button class="lq-btn green" id="lq-m-add">➕ 匯入</button><span id="lq-m-info" style="font-size:14px;opacity:.8"></span></div></div>'
    + '<div class="lq-fs"><h3>目前主持人</h3><div id="lq-m-list">讀取中…</div></div></div>');
  $('lq-m-add').onclick = async function(){
    var arr = String($('lq-m-in').value || '').split(/[\s,，;；]+/).map(function(s){ return s.trim().toLowerCase(); }).filter(function(s){ return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s); });
    if(!arr.length){ toast('沒有找到正確的 email'); return; }
    var ok = 0;
    for(var i = 0; i < arr.length; i++){
      try{ await F.setDoc(F.doc(db(), 'liveQuizHosts', arr[i]), { email: arr[i], addedBy: myEmail(), addedAt: now() }); ok++; }catch(e){ console.warn(e); }
    }
    $('lq-m-info').textContent = '已匯入 ' + ok + ' / ' + arr.length + ' 筆';
    $('lq-m-in').value = ''; drawHosts();
  };
  drawHosts();
  async function drawHosts(){
    try{
      var ss = await F.getDocs(F.collection(db(), 'liveQuizHosts')), arr = [];
      ss.forEach(function(d){ arr.push(d.data()); });
      arr.sort(function(a, b){ return (b.addedAt || 0) - (a.addedAt || 0); });
      $('lq-m-list').innerHTML = arr.length ? arr.map(function(h){
        return '<div class="lq-qi" style="font-size:16px"><span class="tx">' + esc(h.email) + '<small>' + (h.addedAt ? new Date(h.addedAt).toLocaleDateString() : '') + ' 由 ' + esc(h.addedBy || '') + ' 加入</small></span><button data-del="' + esc(h.email) + '">✕</button></div>';
      }).join('') : '<span style="opacity:.7">目前只有 GM 能主持</span>';
      $('lq-m-list').onclick = function(e){
        var b = e.target.closest('[data-del]'); if(!b) return;
        var em = b.getAttribute('data-del');
        confirmBox('移除主持人「' + esc(em) + '」?', '移除', async function(){
          try{ await F.deleteDoc(F.doc(db(), 'liveQuizHosts', em)); drawHosts(); }catch(err){ toast('移除失敗:' + (err.code || err.message)); }
        });
      };
    }catch(e){ $('lq-m-list').textContent = '讀取失敗:' + (e.code || e.message); }
  }
}

/* 測試用掛勾(沙盒驗證計分) */
LQ._test = { computeTally: computeTally, rankList: rankList, scoreOf: scoreOf, parseCustom: parseCustom, TIERS: TIERS, H: H, ST: ST, hostEnd: hostEnd, fs: fs, showClassBoard: function(){ CB.arr = null; return showClassBoard(); }, classAgg: classAgg, buildRoster: buildRoster };

window._LXPS_MOD_OK = window._LXPS_MOD_OK || {};
window._LXPS_MOD_OK['live_quiz.js'] = true;
})();
