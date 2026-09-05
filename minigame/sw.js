/* ============================================================================
 * 小英雄小遊戲 — 獨立 Service Worker(minigame/sw.js)v1.5.0(2026-09-05)
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
var MINI_VERSION = 'v1.5.0';
var SHELL = 'lxps-mini-shell-v1.5.0';
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
