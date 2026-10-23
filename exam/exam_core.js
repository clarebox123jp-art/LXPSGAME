/* ═══════════════════════════════════════════════════════════════════
 * exam_core.js — 考試複習題庫 共用核心(大對抗冒險關卡／小遊戲／荒島求生 三模式共用)
 * ───────────────────────────────────────────────────────────────────
 *  ★ ES5 only(小遊戲端鐵律:無箭頭/樣板字面值/let-const/optional chaining)。
 *  ★ 純資料+選單,不碰任何 Firebase:GM 預設版本由各模式自己讀雲端後呼叫 ExamCore.setGmDefault();
 *    玩家勾選由各模式提供 loadPref/savePref(寫進各自帳號存檔),核心另在 localStorage 按 uid 備份一份。
 *  ★ 題庫按「冊」分檔(exam/q_<冊碼>.js),開選單選了那一冊才下載,開機零負擔。
 *  ★ 題目格式(壓縮陣列,省流量):
 *      [id, 版本碼, 單元, 活動, 難度碼, 題幹, 選項1, 選項2, 選項3, 選項4, 正解索引0~3, 解說, 圖片(可省)]
 *      版本碼 N=南一 H=翰林 K=康軒;難度碼 1=沒自信 2=普通 3=我很會
 * ═══════════════════════════════════════════════════════════════════ */
(function(){
  if(window.ExamCore && window.ExamCore._v) return;
  var VER_NAME = { N:'南一', H:'翰林', K:'康軒' };
  var VER_CODE = { '南一':'N', '翰林':'H', '康軒':'K' };
  var DIFF_NAME = { 1:'沒自信', 2:'普通', 3:'我很會' };
  var BOOK_ORDER = ['三上自然','三上社會','四上自然','四上社會','五上自然','五上社會','六上自然','六上社會',
                    '三下自然','三下社會','四下自然','四下社會','五下自然','五下社會','六下自然','六下社會'];

  var C = {
    _v: 'v1.3.0',
    base: '',                 /* 題庫資料夾網址前綴,大對抗 'exam/'、小遊戲 '../exam/' */
    gmDefault: '',            /* GM 全校預設版本('南一'/'翰林'/'康軒'/'') */
    hooks: { uid:null, loadPref:null, savePref:null },
    _loading: {},
    _pref: null
  };

  /* ── 設定 ── */
  C.init = function(opt){
    opt = opt || {};
    if(opt.base != null) C.base = opt.base;
    if(opt.uid) C.hooks.uid = opt.uid;
    if(opt.loadPref) C.hooks.loadPref = opt.loadPref;
    if(opt.savePref) C.hooks.savePref = opt.savePref;
    C._pref = null;
    return C;
  };
  /* ── ★ v1.1.0 評量複習加成(GM 在「🎓 課堂獎勵加成」勾選;資料在 gameConfig/reviewBoost.examTerms/examTermUnits) ── */
  var TERM_KEYS = ['1mid', '1final', '2mid', '2final'];
  var TERM_NAME = { '1mid':'上學期期中評量', '1final':'上學期期末評量', '2mid':'下學期期中評量', '2final':'下學期期末評量' };
  var TERM_DEF_UNITS = { '1mid':[1,2], '1final':[3,4,5,6], '2mid':[1,2], '2final':[3,4,5,6] };
  C.TERM_KEYS = TERM_KEYS; C.TERM_NAME = TERM_NAME; C.TERM_DEF_UNITS = TERM_DEF_UNITS;
  C.terms = null;   /* { active:{ '1mid':true }, units:{ '1mid':[1,2] } } */
  C.setTerms = function(cfg){
    var t = { active: {}, units: {} }, i, k, u;
    try{
      for(i = 0; i < TERM_KEYS.length; i++){
        k = TERM_KEYS[i];
        if(cfg && cfg.examTerms && cfg.examTerms[k] === true) t.active[k] = true;
        u = cfg && cfg.examTermUnits && cfg.examTermUnits[k];
        t.units[k] = (u instanceof Array && u.length) ? u.slice() : TERM_DEF_UNITS[k].slice();
      }
    }catch(e){}
    C.terms = t; return t;
  };
  C.termUnits = function(k){ return (C.terms && C.terms.units[k]) || TERM_DEF_UNITS[k] || []; };
  C.termLabel = function(k){ return TERM_NAME[k] || ''; };
  C.activeTerms = function(){ var o = [], i; if(!C.terms) return o; for(i = 0; i < TERM_KEYS.length; i++){ if(C.terms.active[TERM_KEYS[i]]) o.push(TERM_KEYS[i]); } return o; };
  C.bookSem = function(book){ var c = String(book || '').charAt(1); return c === '上' ? '1' : (c === '下' ? '2' : ''); };
  /* 這一冊目前開著的評量加成(依學期) */
  C.bookActiveTerms = function(book){ var a = C.activeTerms(), o = [], i, sem = C.bookSem(book); for(i = 0; i < a.length; i++){ if(a[i].charAt(0) === sem) o.push(a[i]); } return o; };
  /* 選擇範圍是否落在某個開啟中的評量範圍:有勾單元且每個勾的單元都在範圍內 ⇒ 回傳該評量鍵,否則 '' */
  C.selBoostTerm = function(sel){
    if(!sel || !sel.book || !sel.units || !sel.units.length) return '';
    var ts = C.bookActiveTerms(sel.book), i, j, ok, n, allow;
    for(i = 0; i < ts.length; i++){
      allow = C.termUnits(ts[i]); ok = true;
      for(j = 0; j < sel.units.length; j++){ n = parseInt(String(sel.units[j]).replace(/^[NHK]/, ''), 10); if(allow.indexOf(n) < 0){ ok = false; break; } }
      if(ok) return ts[i];
    }
    return '';
  };
  C.setGmDefault = function(v){ C.gmDefault = (v === '南一' || v === '翰林' || v === '康軒') ? v : ''; };
  /* ★ v1.2.0 學校版本依「年級+科目」分別設定(上下冊共用),鍵如 '五社會';GM 寫 gameConfig/examReview.byBook,沒寫用各模式給的預設 */
  C.schoolMap = null;
  C.setSchoolMap = function(m){
    var o = {}, k, ok = false;
    if(m && typeof m === 'object'){ for(k in m){ if(m.hasOwnProperty(k) && (m[k] === '南一' || m[k] === '翰林' || m[k] === '康軒')){ o[k] = m[k]; ok = true; } } }
    C.schoolMap = ok ? o : null;
  };
  C.schoolVer = function(book){
    var b = String(book || ''), k = b.charAt(0) + b.slice(2);   /* '五上社會' → '五社會' */
    return (C.schoolMap && C.schoolMap[k]) || C.gmDefault || '';
  };
  C.verName = function(c){ return VER_NAME[c] || c; };
  C.books = function(){
    var ix = window.EXAM_INDEX, out = [], i;
    if(!ix || !ix.books) return out;
    for(i = 0; i < BOOK_ORDER.length; i++){ if(ix.books[BOOK_ORDER[i]]) out.push(BOOK_ORDER[i]); }
    return out;
  };

  /* ── 玩家偏好:{ vers:['南一'], book:'六上自然', units:[1,2] } ── */
  function _uid(){ try{ return (C.hooks.uid && C.hooks.uid()) || 'guest'; }catch(e){ return 'guest'; } }
  C.getPref = function(){
    if(C._pref) return C._pref;
    var p = null;
    try{ if(C.hooks.loadPref) p = C.hooks.loadPref(); }catch(e){}
    if(!p){ try{ p = JSON.parse(localStorage.getItem('lxps_exam_pref_' + _uid()) || 'null'); }catch(e2){ p = null; } }
    if(!p || typeof p !== 'object') p = {};
    if(!(p.vers instanceof Array) || !p.vers.length){ var _sv = p.book ? C.schoolVer(p.book) : C.gmDefault; p.vers = _sv ? [_sv] : ['南一','翰林','康軒']; }
    C._pref = p;
    return p;
  };
  C.setPref = function(p){
    C._pref = p;
    try{ localStorage.setItem('lxps_exam_pref_' + _uid(), JSON.stringify(p)); }catch(e){}
    try{ if(C.hooks.savePref) C.hooks.savePref(p); }catch(e2){}
  };
  C.resetPrefCache = function(){ C._pref = null; };

  /* ── 載入索引與冊檔 ── */
  function _script(src, cb){
    var s = document.createElement('script'), done = false;
    s.src = src; s.async = true;
    s.onload = function(){ if(done) return; done = true; cb(true); };
    s.onerror = function(){ if(done) return; done = true; cb(false); };
    document.head.appendChild(s);
  }
  C.loadIndex = function(cb){
    if(window.EXAM_INDEX){ cb(true); return; }
    if(C._loading.__index){ C._loading.__index.push(cb); return; }
    C._loading.__index = [cb];
    var tryLoad = function(n){
      _script(C.base + 'exam_index.js', function(ok){   /* 不帶查詢字串:SW 走 network-first + no-cache 重新驗證,改版即時生效且不會堆積快取 */
        if(!ok && n < 2){ setTimeout(function(){ tryLoad(n + 1); }, 800 * (n + 1)); return; }
        var q = C._loading.__index; C._loading.__index = null;
        for(var i = 0; i < q.length; i++){ try{ q[i](!!window.EXAM_INDEX); }catch(e){} }
      });
    };
    tryLoad(0);
  };
  C.loadBook = function(book, cb){
    window.EXAM_Q = window.EXAM_Q || {};
    if(window.EXAM_Q[book]){ cb(true); return; }
    C.loadIndex(function(ok){
      var bk = ok && window.EXAM_INDEX.books[book];
      if(!bk){ cb(false); return; }
      if(C._loading[book]){ C._loading[book].push(cb); return; }
      C._loading[book] = [cb];
      var tryLoad = function(n){
        _script(C.base + bk.file + '?v=' + (bk.v || window.EXAM_INDEX.v || '1'), function(ok2){
          if(!ok2 && n < 2){ setTimeout(function(){ tryLoad(n + 1); }, 800 * (n + 1)); return; }
          var q = C._loading[book]; C._loading[book] = null;
          for(var i = 0; i < q.length; i++){ try{ q[i](!!window.EXAM_Q[book]); }catch(e){} }
        });
      };
      tryLoad(0);
    });
  };

  /* ── 單元資訊(依版本) ── */
  C.units = function(book, verName){
    var ix = window.EXAM_INDEX, bk = ix && ix.books[book], c = VER_CODE[verName];
    return (bk && bk.units && bk.units[c]) || [];   /* [{u:1,t:'名稱',n:100}] */
  };
  C.unitTitle = function(book, verName, u){
    var a = C.units(book, verName), i;
    for(i = 0; i < a.length; i++){ if(a[i].u === u) return a[i].t; }
    return '';
  };

  /* ── 取題:sel = { book, units:[1,2] (空=全部), vers:['南一'] (空=全部), diff:'普通'(可省) } ── */
  C.pool = function(sel){
    var raw = (window.EXAM_Q || {})[sel.book] || [], out = [], i, r, vn, uSet = null, vSet = null, dn;
    /* 單元鍵 = 版本碼+單元序號(例 'N1' 南一第1單元);純數字則所有版本的該單元都算 */
    if(sel.units && sel.units.length){ uSet = {}; for(i = 0; i < sel.units.length; i++) uSet[String(sel.units[i])] = 1; }
    if(sel.vers && sel.vers.length){ vSet = {}; for(i = 0; i < sel.vers.length; i++) vSet[VER_CODE[sel.vers[i]] || sel.vers[i]] = 1; }
    for(i = 0; i < raw.length; i++){
      r = raw[i];
      if(vSet && !vSet[r[1]]) continue;
      if(uSet && !uSet[r[1] + r[2]] && !uSet[String(r[2])]) continue;
      vn = VER_NAME[r[1]] || r[1]; dn = DIFF_NAME[r[4]] || '普通';
      out.push({
        id: r[0], v: vn, b: sel.book, u: r[2], ut: C.unitTitle(sel.book, vn, r[2]), act: r[3], d: dn,
        q: r[5], o: [r[6], r[7], r[8], r[9]], a: r[10], why: r[11] || '', pic: r[12] || '',
        range: sel.book + '｜' + vn + '｜第' + r[2] + '單元 ' + C.unitTitle(sel.book, vn, r[2])
      });
    }
    if(sel.diff){
      var f = [], k;
      for(k = 0; k < out.length; k++){ if(out[k].d === sel.diff) f.push(out[k]); }
      if(f.length >= 10) out = f;   /* 該難度題目太少就不篩 */
    }
    return out;
  };
  C.shuffle = function(a){
    var b = a.slice(), i, j, t;
    for(i = b.length - 1; i > 0; i--){ j = Math.floor(Math.random() * (i + 1)); t = b[i]; b[i] = b[j]; b[j] = t; }
    return b;
  };
  C.selLabel = function(sel){
    if(!sel || !sel.book) return '';
    var u = (sel.units && sel.units.length) ? (sel.units.length + ' 個單元') : '全部單元';
    var v = (sel.vers && sel.vers.length && sel.vers.length < 3) ? sel.vers.join('/') : '三版本';
    return sel.book + '｜' + v + '｜' + u;
  };

  /* ═════ 選單 UI(掛 body 直下,避開各模式的 scale/zoom 容器) ═════ */
  var CSS = ''
    + '.exr-ov{position:fixed;inset:0;z-index:2147483000;background:rgba(5,10,25,.82);display:flex;align-items:safe center;justify-content:center;padding:12px;box-sizing:border-box;font-family:inherit}'
    + '.exr-card{width:min(860px,96vw);max-height:min(92dvh,92vh);overflow-y:auto;-webkit-overflow-scrolling:touch;box-sizing:border-box;background:linear-gradient(160deg,#1d2a4a,#141c33);border:2px solid #ffd84d;border-radius:18px;padding:18px 20px;color:#f3f0e6;box-shadow:0 10px 40px rgba(0,0,0,.6)}'
    + '.exr-h{font-size:24px;font-weight:800;color:#ffd84d;margin:0 0 4px}'
    + '.exr-sub{font-size:14px;color:#b9c4dc;margin-bottom:10px;line-height:1.5}'
    + '.exr-sec{margin:12px 0 6px;font-size:16px;font-weight:700;color:#9fd3ff}'
    + '.exr-row{display:flex;flex-wrap:wrap;gap:8px}'
    + '.exr-b{appearance:none;-webkit-appearance:none;border:2px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:#f3f0e6;border-radius:12px;padding:9px 14px;font-size:17px;font-weight:700;cursor:pointer;min-height:44px;line-height:1.25;text-align:left}'
    + '.exr-b.on{border-color:#ffd84d;background:rgba(255,216,77,.22);color:#fff6c8}'
    + '.exr-b.off{opacity:.35;pointer-events:none}'
    + '.exr-b small{display:block;font-size:12px;font-weight:400;color:#b9c4dc}'
    + '.exr-u{flex:1 1 calc(50% - 8px);min-width:220px}'
    + '.exr-foot{display:flex;gap:10px;justify-content:flex-end;margin-top:16px;flex-wrap:wrap;position:sticky;bottom:-18px;padding:10px 0 4px;background:linear-gradient(180deg,rgba(20,28,51,0),#141c33 35%)}'
    + '.exr-go{background:linear-gradient(135deg,#ffd84d,#ffb020);color:#3a2600;border-color:#ffd84d;font-size:19px;padding:10px 26px;text-align:center}'
    + '.exr-x{text-align:center}'
    + '.exr-msg{font-size:15px;color:#ffb3a7;margin-top:8px;min-height:20px}'
    + '.exr-tag{display:inline-block;font-size:12px;padding:1px 8px;border-radius:8px;background:rgba(159,211,255,.18);color:#cfe8ff;margin-left:6px;vertical-align:middle}'
    /* 手機橫向(矮) */
    + '@media (orientation:landscape) and (max-height:520px){.exr-card{padding:10px 12px;border-radius:12px}.exr-h{font-size:18px}.exr-sub{font-size:12px;margin-bottom:4px}.exr-sec{font-size:14px;margin:6px 0 4px}.exr-b{font-size:14px;padding:6px 10px;min-height:36px}.exr-b small{font-size:11px}.exr-u{min-width:180px}.exr-go{font-size:16px;padding:7px 18px}.exr-foot{margin-top:4px;bottom:-10px;padding:6px 0 2px}.exr-msg{min-height:0}}'
    /* 直向窄螢幕 */
    + '@media (max-width:560px){.exr-u{flex-basis:100%}}'
    /* iPad 以上:字再大一點 */
    + '@media (min-width:1000px) and (min-height:700px){.exr-b{font-size:19px}.exr-h{font-size:28px}}';
  function _css(){
    if(document.getElementById('exr-style')) return;
    var st = document.createElement('style'); st.id = 'exr-style'; st.textContent = CSS;
    document.head.appendChild(st);
  }
  function _esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }

  /* opts: { title, sub, onPick(sel, pool), onCancel(), sfx(name) , minQ, extraLabel, onExtra() } */
  C.openPicker = function(opts){
    opts = opts || {};
    _css();
    var ov = document.createElement('div'); ov.className = 'exr-ov';
    ov.innerHTML = '<div class="exr-card"><div class="exr-h">' + _esc(opts.title || '📝 考試複習') + '</div>'
      + '<div class="exr-sub">' + _esc(opts.sub || (opts.cute ? '選課本、年級、單元,就開始複習!' : '選擇年級冊、單元與課本版本,只會出你選定範圍內的題目。')) + '</div>'
      + '<div class="exr-body"><div class="exr-sub">題庫載入中…</div></div></div>';
    document.body.appendChild(ov);
    var body = ov.querySelector('.exr-body');
    var sfx = function(n){ try{ if(opts.sfx) opts.sfx(n); }catch(e){} };
    var close = function(){ try{ ov.parentNode.removeChild(ov); }catch(e){} };
    var pref = C.getPref();
    var st = { book: pref.book || '', units: [], vers: pref.vers.slice() }, _pu = pref.units || [], _z;
    for(_z = 0; _z < _pu.length; _z++){ if(typeof _pu[_z] === 'string' && /^[NHK]\d+$/.test(_pu[_z])) st.units.push(_pu[_z]); }
    /* 依評量範圍一鍵勾單元(只勾目前版本裡真的有的單元) */
    var pickTerm = function(k){
      var allow = C.termUnits(k), out = [], i, j, us;
      for(i = 0; i < st.vers.length; i++){ us = C.units(st.book, st.vers[i]); for(j = 0; j < us.length; j++){ if(allow.indexOf(us[j].u) >= 0) out.push(VER_CODE[st.vers[i]] + us[j].u); } }
      st.units = out.sort();
    };
    if(opts.preTerm && st.book && C.bookSem(st.book) === String(opts.preTerm).charAt(0)) pickTerm(opts.preTerm);

    var render = function(){
      var books = C.books(), h = '', i, b, bk, cnt, vs = ['南一','翰林','康軒'], us, j, on, have;
      h += '<div class="exr-sec">' + (opts.cute ? '① 你的課本是哪一家?' : '① 課本版本(可複選)') + '</div><div class="exr-row">';
      for(i = 0; i < vs.length; i++){
        on = st.vers.indexOf(vs[i]) >= 0;
        h += '<button class="exr-b exr-x' + (on ? ' on' : '') + '" data-ver="' + vs[i] + '">' + (on ? '☑ ' : '☐ ') + vs[i]
           + ((st.book ? C.schoolVer(st.book) : C.gmDefault) === vs[i] ? '<span class="exr-tag">' + (opts.cute ? '學校用的' : '學校版本') + '</span>' : '') + '</button>';
      }
      h += '</div><div class="exr-sec">' + (opts.cute ? '② 選年級' : '② 年級冊') + '</div><div class="exr-row">';
      for(i = 0; i < books.length; i++){
        b = books[i]; bk = window.EXAM_INDEX.books[b]; cnt = 0;
        for(j = 0; j < st.vers.length; j++){ us = C.units(b, st.vers[j]); for(var k = 0; k < us.length; k++) cnt += us[k].n; }
        h += '<button class="exr-b' + (st.book === b ? ' on' : '') + (cnt ? '' : ' off') + '" data-book="' + _esc(b) + '">' + _esc(b) + '<small>' + cnt + ' 題</small></button>';
      }
      if(!books.length) h += '<div class="exr-sub">目前還沒有題庫。</div>';
      h += '</div>';
      if(st.book){
        /* ★ v1.1.0 評量複習加成:一鍵勾範圍 + 目前是否符合 */
        var _ts = C.bookActiveTerms(st.book);
        if(_ts.length){
          h += '<div class="exr-sec" style="color:#ffcf5a">' + (opts.cute ? '⭐ 考試範圍加碼!' : '⭐ 評量複習加成(老師開放中)') + '</div><div class="exr-row">';
          for(i = 0; i < _ts.length; i++){
            h += '<button class="exr-b exr-x" data-term="' + _ts[i] + '" style="border-color:#ffcf5a;color:#ffe9a8">⭐ ' + (opts.cute ? '選' : '一鍵選') + C.termLabel(_ts[i])
               + '範圍<small>第 ' + C.termUnits(_ts[i]).join('、') + ' 單元</small></button>';
          }
          var _bt = C.selBoostTerm({ book: st.book, units: st.units });
          h += '</div><div class="exr-sub" style="color:' + (_bt ? '#ffe27a' : '#b9c4dc') + '">'
             + (_bt ? ('⭐ 這個範圍是「' + C.termLabel(_bt) + '」複習,' + (opts.cute ? '獎勵再多 +25%!' : '冒險結算獎勵再 +25%(每天一次)。'))
                    : (opts.cute ? '只勾考試範圍裡的單元,獎勵會再多 +25% 喔。' : '只勾選評量範圍內的單元,才享有再 +25% 加成。'))
             + '</div>';
        }
        h += '<div class="exr-sec">' + (opts.cute ? '③ 選單元(都不選就是全部)' : '③ 單元(可複選,不選 = 全部單元)') + '</div><div class="exr-row">';
        /* 依版本列出各自的單元名;同單元序號不同版本名稱不同,分版本列 */
        for(i = 0; i < st.vers.length; i++){
          us = C.units(st.book, st.vers[i]);
          for(j = 0; j < us.length; j++){
            on = st.units.indexOf(VER_CODE[st.vers[i]] + us[j].u) >= 0;
            h += '<button class="exr-b exr-u' + (on ? ' on' : '') + '" data-unit="' + VER_CODE[st.vers[i]] + us[j].u + '">' + (on ? '☑ ' : '☐ ')
               + '第' + us[j].u + '單元 ' + _esc(us[j].t) + '<small>' + _esc(st.vers[i]) + '・' + us[j].n + ' 題</small></button>';
          }
        }
        h += '</div>';
      }
      h += '<div class="exr-msg"></div><div class="exr-foot">'
         + (opts.offLabel ? '<button class="exr-b exr-x" data-act="off" style="margin-right:auto;border-color:rgba(255,150,150,.6);color:#ffd0d0;">' + _esc(opts.offLabel) + '</button>' : '')
         + (opts.extraLabel ? '<button class="exr-b exr-x" data-act="extra" style="' + (opts.offLabel ? '' : 'margin-right:auto;') + 'border-color:#ffd84d;color:#ffe9a8;">' + _esc(opts.extraLabel) + '</button>' : '')
         + '<button class="exr-b exr-x" data-act="cancel">取消</button>'
         + '<button class="exr-b exr-go" data-act="go">' + (opts.cute ? '出發!▶' : '開始複習 ▶') + '</button></div>';
      body.innerHTML = h;
    };
    var msg = function(t){ var m = body.querySelector('.exr-msg'); if(m) m.textContent = t || ''; };

    body.onclick = function(ev){
      var t = ev.target; while(t && t !== body && t.tagName !== 'BUTTON') t = t.parentNode;
      if(!t || t === body) return;
      var v = t.getAttribute('data-ver'), bk = t.getAttribute('data-book'), u = t.getAttribute('data-unit'), a = t.getAttribute('data-act'), ix;
      if(v){
        sfx('tap'); ix = st.vers.indexOf(v);
        if(ix >= 0){ if(st.vers.length > 1) st.vers.splice(ix, 1); } else st.vers.push(v);
        /* 取消的版本,其單元勾選一併移除 */
        var keep = [], z; for(z = 0; z < st.units.length; z++){ if(st.vers.indexOf(VER_NAME[st.units[z].charAt(0)]) >= 0) keep.push(st.units[z]); }
        st.units = keep; render(); return;
      }
      if(bk){ sfx('tap'); st.book = bk; st.units = []; var _sv2 = C.schoolVer(bk); if(_sv2) st.vers = [_sv2]; render(); return; }   /* 選冊就自動切到該冊的學校版本(玩家仍可改勾) */
      if(u){ sfx('tap'); ix = st.units.indexOf(u); if(ix >= 0) st.units.splice(ix, 1); else st.units.push(u); st.units.sort(); render(); return; }
      var tk = t.getAttribute('data-term');
      if(tk){ sfx('tap'); pickTerm(tk); render(); return; }
      if(a === 'cancel'){ sfx('cancel'); close(); if(opts.onCancel) opts.onCancel(); return; }
      if(a === 'off'){ sfx('cancel'); close(); if(opts.onOff) opts.onOff(); return; }
      if(a === 'extra'){ sfx('tap'); close(); if(opts.onCancel) opts.onCancel(); if(opts.onExtra) opts.onExtra(); return; }   /* ★ v1.3.0 額外按鈕(大對抗:🏆 考試複習挑戰) */
      if(a === 'go'){
        if(!st.book){ msg('請先選年級冊。'); return; }
        msg('題目下載中…');
        C.loadBook(st.book, function(ok){
          if(!ok){ msg('題庫下載失敗,請確認網路後再試一次。'); return; }
          var sel = { book: st.book, units: st.units.slice(), vers: st.vers.slice() };
          var pool = C.pool(sel);
          if(pool.length < (opts.minQ || 5)){ msg('這個範圍的題目太少,請多選幾個單元或版本。'); return; }
          C.setPref({ vers: sel.vers, book: sel.book, units: sel.units });
          sfx('ok'); close();
          if(opts.onPick) opts.onPick(sel, pool);
        });
      }
    };
    C.loadIndex(function(ok){
      if(!ok){ body.innerHTML = '<div class="exr-msg">題庫目錄下載失敗,請確認網路後再試一次。</div><div class="exr-foot"><button class="exr-b exr-x" data-act="cancel">關閉</button></div>'; return; }
      render();
    });
    return { close: close };
  };

  window.ExamCore = C;
})();
