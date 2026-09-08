/* ============================================================================
 * 小英雄小遊戲 — 獨立 Service Worker(minigame/sw.js)v1.27.0(2026-09-08)
 * ★ v1.27.0(2026-09-08・老師回報「25 台 iPad 同時登入很困難」，修完主程式後接著修小遊戲):
 *   登入流程瘦身全在 index.html（SDK 併發下載＋開機閒置背景預載＋登入時週排行榜文件改用既有
 *   60 秒快取不重複強讀），本檔僅版號同步（SHELL 改名讓舊 index.html 快取失效）。
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
var MINI_VERSION = 'v1.27.0';
var SHELL = 'lxps-mini-shell-v1.27.0';
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
