/* ============================================================================
 * 小英雄小遊戲 — 獨立 Service Worker(minigame/sw.js)v1.34.0(2026-09-08)
 * ★ v1.34.0(2026-09-08・老師四項需求):①爆發技能視覺特效放大至全螢幕(#bt-burstfx img.gif 由
 *   70vw×58vh 改 100vw×100vh)②新增爆發技能使用時/爆發充滿可用時兩支專屬音效(sfx-burst-use・
 *   sfx-burst-ready,取代原沿用的 sfx-enter/sfx-recharge)③被擊倒時換播戰鬥失敗 BGM(bgm-lose,
 *   沿用主程式同一支「戰鬥失敗.mp3」)④迷宮探險王地圖走法改為每次隨機生成(mgMazeGenRandom,
 *   6×6 格逐步隨機加牆+BFS 連通性檢查,保證一定走得通;內容題庫/提示文字完全不動,只有路線隨機)。
 *   本檔僅版號同步(SHELL 改名讓舊快取失效)。邏輯全在 index.html(本輪需重傳)。
 * ★ v1.33.1(2026-09-08・老師截圖回報)— 台灣飛飛飛(map)嘉義火雞肉飯題,簡單風問法「嘉義最有名的
 *   小吃是?」跟點地圖答題的機制對不起來(答案該是地名,這樣問卻要學生答小吃名),改成「哪個城市的
 *   火雞肉飯最有名?」與精緻風、遊戲機制一致;順手掃過 map 其餘 65 題確認無同型問題。另修
 *   index.html 載入 minigame_db.js 的版本查詢字串卡在 v1.30.0 沒跟著版號走(快取風險),改用當前版號。
 *   本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.33.0(2026-09-08・老師三項需求):①橫式戰鬥卡片改回佔左欄格線列(不再貼底,填滿計時條下方到答題區
 *   之間的左下空間,直向大卡格式與直式相同)②回復型第二效果基準值調整為 +5(原 +3,後續全面個別化時採
 *   5~8 區間)③64 隻 SSR 的爆發第二效果全部改成逐英雄設計(取自各自在大對抗的真實爆發技能特色,不再是
 *   4 大類共用同一組數值)。本檔僅版號同步(SHELL 改名讓舊快取失效)。邏輯全在 index.html／minigame_db.js
 *   (本輪皆需重傳)。
 * ★ v1.32.2(2026-09-08・老師需求「就是依照大對抗的極限爆發那種呈現方式」):爆發鍵充滿時文字由招式名
 *   改為通用「⚡ 極限爆發」召喚字樣(比照大對抗按鈕慣例),搭配既有金色脈動發光;充能中仍顯示招式名預告,
 *   只套用玩家自己可按的鈕、NPC 卡維持純資訊顯示。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.32.1(2026-09-08・老師需求):戰鬥打擊感升級(受擊三件套:震動+閃紅+立繪頓挫、出手方輕頓挫、
 *   爆發火花放大)+攻擊型爆發改直接傷害(玩家10/NPC20)+易傷第二效果訂正(原誤標中毒,數值3→5)。
 *   本檔僅版號同步(SHELL 改名讓舊快取失效)。邏輯全在 index.html／minigame_db.js(本輪皆需重傳)。
 * ★ v1.31.0(2026-09-08・老師多項需求):①四型爆發各追加第二效果(回復/護盾/攻擊/控場)②爆發演出立繪
 *   改逐英雄裁切位置置中(取自主程式 HERO_IMG_POS,無資料者改 contain 完整顯示)③已登入時過濾成只能選
 *   已解鎖 SSR、訪客不受限(唯讀 players/{uid}.unlockedHeroes)④換英雄選單 z-index 修正(不再被關卡
 *   說明蓋住)⑤選角視窗篩選跳版問題修正(.hm-list 改固定高度)+英雄圖片/文字/視窗放大⑥戰鬥卡片改版
 *   (直式=大對抗式直向大卡只留立繪/HP/爆發技能+效果說明,橫式維持 v1.29.0 貼底小卡)。
 *   本檔僅版號同步(SHELL 改名讓舊快取失效)。邏輯與資料全在 index.html／minigame_db.js(本輪皆需重傳)。
 * ★ v1.37.0(2026-09-08・老師需求)：爆發鈕新增兩顆星星次數指示(比照充能點同一套呈現邏輯)；本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.36.0(2026-09-08・老師需求)：受擊音效/特效比照大對抗普攻+新增seal/confuse/revive三型爆發第二效果
 *   +爆發滿槽卡片橘色橫幅視覺；本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.35.0(2026-09-08・老師需求「64隻角色技能平衡」):HP 100→200/CHARGE 3→5/新增爆發上限2次/64隻eff2重新分配
 *   (shield擴大到4隻shd職能、drain·charge統一v:2)/電磁鐵題目邏輯修正;本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.30.0(2026-09-08・老師需求):戰鬥卡片改貼底橫向大卡+爆發完整立繪演出+15 款各換不同戰鬥曲+首頁文案改英雄對戰;本檔僅版號同步(SHELL 改名讓舊快取失效)。
 *   邏輯與資料全在 index.html／minigame_db.js(本輪皆需重傳)。
 * ★ v1.29.0(2026-09-08・老師需求):戰鬥模式「英雄卡 VS NPC + HP + 極限爆發」;本檔僅版號同步(SHELL 改名讓舊快取失效)。
 *   邏輯在 index.html、英雄/爆發資料表 MG_HEROES/MG_BURST_DEF 在 minigame_db.js(本輪需重傳)。
 * ★ v1.28.0(2026-09-08・老師三項需求):①算數大進擊連續答錯3次⇒5秒射擊冷卻、連續答對5次
 *   ⇒「時間暫停」鈕亮起可用一次(凍結畫面3秒) ②視窗切到背景(縮到最小)時所有音效/BGM 靜音，
 *   回到前景自動恢復(比照大對抗 visibilitychange 設計)。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.12.0:版號同步(txw 遞迴 BUG 修正 + 英文專有名詞附中文,邏輯全在 index.html)。⚠⚠ 本檔只能放在 minigame/ 目錄;2026-09-06 曾被誤傳到根目錄覆蓋主程式 sw.js,造成主程式「首次安裝」卡 0%。
 * ★ v1.11.0:版號同步(語系切換)
 * ★ v1.10.4:版號同步(卡片科目標籤)
 * ★ v1.10.3:版號同步(專注模式相關關卡才亮;題庫搬移在 minigame_db.js)
 * ★ v1.10.2:版號同步(專注複習勾單元自動啟用)
 * ★ v1.10.1:版號同步(排排站題卡/專注複習視窗防呆;SHELL 改名讓舊 db 快取失效)
 * ★ v1.10.0:版號同步(每週排行榜獎勵面板/彈窗在 index.html)
 * ★ v1.9.8:版號同步(排排站小達人改為真正的先後順序題,內容在 minigame_db.js)
 * ★ v1.9.7:版號同步(算數大進擊煙火/爆炸音效/50%、mgBins、課堂複習題全面混入)
 * ★ v1.9.6:版號同步(迷宮跨領域題組在 minigame_db.js)
 * ★ v1.9.5:版號同步(算數大進擊射擊特效在 index.html)
 * ★ v1.9.4:版號同步(連連看殘留圖層修正在 index.html)
 * ★ v1.9.3:版號同步(俗諺連連看在 index.html/minigame_db.js)
 * ★ v1.9.2:版號同步(缺圖名單誤記根治在 index.html;題圖快取策略與 MG_IMG_VER 不動,不重抓)
 * ★ v1.9.0:/minigame/img/ 題圖改 cache-first(URL 帶 ?v=MG_IMG_VER 破快取),其餘 shell 仍 network-first
 *
 * ★ scope 只在 /minigame/,比主程式 sw.js 的 './' 更具體
 *   ⇒ 瀏覽器自動讓本 SW 接管本目錄,不需要改主程式的 fetch 邏輯。
 *
 * ★ 快取名稱一律 'lxps-mini-' 前綴:
 *     - 主程式 sw.js 的 activate 已加白名單,不會把它清掉(v5.140.0 一行修正)
 *     - 本 SW 反過來也「只清自己前綴」的舊版本,絕不碰主程式的 lxps-shell / lxps-assets
 *   ⚠ CacheStorage 是整個 origin 共用的,這兩道白名單缺一不可。
 *
 * ★ 策略:
 *     - shell(本目錄檔案)= network-first + 2.5 秒逾時退回快取
 *       (更新即時生效;校網很慢或離線時仍然一定進得去 —— 這正是本小程式的存在目的)
 *     - 跨域素材(音效等)= cache-first,只存成功回應
 * ============================================================================ */
var MINI_VERSION = 'v1.37.0';
var SHELL = 'lxps-mini-shell-v1.37.0';
var ASSET = 'lxps-mini-assets-v1';

var SHELL_URLS = [
  './',
  './index.html',
  './minigame_db.js',
  './manifest.json',
  './title.webp',
  './icon-192.png',
  './icon-180.png'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(SHELL).then(function(c){
      // 逐一抓取,單一檔失敗不讓整個 install 失敗
      return Promise.all(SHELL_URLS.map(function(u){
        return fetch(u, { cache: 'reload' }).then(function(r){
          if(r && r.ok) return c.put(u, r);
        })['catch'](function(){});
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        // ★ 只清「自己前綴」的舊版本;主程式的快取一律不動
        if(k.indexOf('lxps-mini-') === 0 && k !== SHELL && k !== ASSET){
          return caches['delete'](k);
        }
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

function timeoutAfter(ms){
  return new Promise(function(_, rej){
    setTimeout(function(){ rej(new Error('timeout')); }, ms);
  });
}

self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return;

  var url;
  try{ url = new URL(req.url); }catch(err){ return; }

  var sameOrigin = (url.origin === self.location.origin);
  var inScope = sameOrigin && url.pathname.indexOf('/minigame/') >= 0;

  // ── ★ v1.9.0 優化①:題圖 /minigame/img/ 一律 cache-first ──
  //    URL 已帶 ?v=MG_IMG_VER(素材更新只改那個數字 ⇒ 新 URL 自然重抓),所以不需要 network-first;
  //    舊寫法每題都重新下載(校網慢時先卡 2.5s 才退快取)。404 不進快取(index.html 另有缺圖名單擋重打)。
  if(sameOrigin && url.pathname.indexOf('/minigame/img/') >= 0){
    e.respondWith(
      caches.match(req).then(function(hit){
        if(hit) return hit;
        return fetch(req).then(function(res){
          if(res && res.ok){
            var copy = res.clone();
            caches.open(ASSET).then(function(c){ c.put(req, copy); })['catch'](function(){});
          }
          return res;
        })['catch'](function(){ return new Response('', { status: 504 }); });
      })
    );
    return;
  }
  // ── 本目錄 shell:network-first(2.5s 逾時)→ 快取 ──
  if(inScope || req.mode === 'navigate'){
    e.respondWith(
      Promise.race([ fetch(req), timeoutAfter(2500) ])
        .then(function(res){
          if(res && res.ok){
            var copy = res.clone();
            caches.open(SHELL).then(function(c){ c.put(req, copy); })['catch'](function(){});
          }
          return res;
        })['catch'](function(){
          return caches.match(req).then(function(hit){
            if(hit) return hit;
            // 導覽請求退回首頁,避免離線時出現瀏覽器錯誤頁
            if(req.mode === 'navigate') return caches.match('./index.html');
            return new Response('', { status: 504 });
          });
        })
    );
    return;
  }

  // ── 跨域素材(音效等):cache-first ──
  if(!sameOrigin){
    e.respondWith(
      caches.match(req).then(function(hit){
        if(hit) return hit;
        return fetch(req).then(function(res){
          if(res && res.ok){
            var copy = res.clone();
            caches.open(ASSET).then(function(c){ c.put(req, copy); })['catch'](function(){});
          }
          return res;
        })['catch'](function(){ return new Response('', { status: 504 }); });
      })
    );
  }
});
