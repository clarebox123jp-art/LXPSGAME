/* ============================================================
 * 小英雄大對抗 — Service Worker (sw.js)
 * 版本: v3.4.13 (與 window._GAME_LOADED_VERSION 同步)
 *
 * 設計重點(iPad 友善):
 *   1. 資源清單由 client 端 postMessage 傳入,SW 不寫死 URL → 老師之後加資源不用改 sw.js
 *   2. 批次下載 (iPad 限制並行 3, 桌機 8) → 避免 iOS 記憶體壓力
 *   3. 單一資源失敗不影響整體 → 跨域 GitHub raw 用 no-cors
 *   4. 快取分層: shell (核心檔案) + assets (圖片/音訊)
 *   5. 進度回報給 client → 顯示安裝讀條
 *   6. 版本更新時保留舊 asset cache 直到新版下載完, 避免戰鬥中斷線
 *
 * 更新方式:
 *   每次老師發新版,改下面 SW_VERSION (例 'v3.4.13' → 'v3.4.14') + 改 index.html 內的
 *   window._GAME_LOADED_VERSION 即可,舊版快取會自動清理,新版資源背景下載。
 * ============================================================ */

const SW_VERSION = 'v3.4.13';
const SHELL_CACHE = 'lxps-shell-' + SW_VERSION;
const ASSET_CACHE = 'lxps-assets-' + SW_VERSION;

// 同層核心檔案 — SW 安裝時自動抓 (這些一定要快取)
const SHELL_URLS = [
  './',
  './index.html',
  './main.css',
  './adv_quiz_db.js',
  './hero_db.js',
  './world-boss.js',
  './world-boss-ui.html',
  './game_changelog.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png',
  './icon-152.png'
];

// 偵測 iPad/iOS — 限制並行 3 (桌機 8)
// (SW 內 navigator.userAgent 仍可用, 但要保守)
const IS_IOS_LIKE = /iPad|iPhone|iPod|Macintosh/i.test(self.navigator.userAgent || '');
const CONCURRENT = IS_IOS_LIKE ? 3 : 8;

// ─────────────────────────────────────────────
// install: 抓核心 shell
// ─────────────────────────────────────────────
self.addEventListener('install', function(event){
  console.log('[SW] install', SW_VERSION);
  event.waitUntil(
    caches.open(SHELL_CACHE).then(function(cache){
      // 用 addAll 但允許部分失敗 — 改用 Promise.allSettled
      return Promise.allSettled(
        SHELL_URLS.map(function(url){
          return fetch(url, { cache: 'reload' }).then(function(res){
            if(res && (res.ok || res.type === 'opaque')){
              return cache.put(url, res);
            }
          }).catch(function(err){
            console.warn('[SW] shell failed:', url, err);
          });
        })
      );
    }).then(function(){
      // 不自動 skipWaiting — 由 client 發訊息決定 (避免戰鬥中斷線)
      console.log('[SW] shell installed');
    })
  );
});

// ─────────────────────────────────────────────
// activate: 清除舊版快取
// ─────────────────────────────────────────────
self.addEventListener('activate', function(event){
  console.log('[SW] activate', SW_VERSION);
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(key){
        // 保留當前版本的兩個 cache, 刪除其他舊版
        if(key !== SHELL_CACHE && key !== ASSET_CACHE){
          console.log('[SW] delete old cache:', key);
          return caches.delete(key);
        }
      }));
    }).then(function(){
      return self.clients.claim();
    })
  );
});

// ─────────────────────────────────────────────
// fetch: cache-first 策略 (圖片/音訊優先吃快取)
//        network-first 策略 (HTML/JS/CSS — 但離線時 fallback 到快取)
// ─────────────────────────────────────────────
self.addEventListener('fetch', function(event){
  var req = event.request;

  // 只處理 GET
  if(req.method !== 'GET') return;

  var url = new URL(req.url);

  // 跳過 Firebase / WebSocket / chrome-extension 等
  if(url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if(url.hostname.indexOf('firestore.googleapis.com') !== -1) return;
  if(url.hostname.indexOf('firebaseinstallations') !== -1) return;
  if(url.hostname.indexOf('identitytoolkit') !== -1) return;
  if(url.hostname.indexOf('securetoken') !== -1) return;
  if(url.hostname.indexOf('google-analytics') !== -1) return;
  if(url.hostname.indexOf('googletagmanager') !== -1) return;

  // 判斷是圖片/音訊資源 → cache-first
  var isAsset = /\.(png|jpg|jpeg|gif|webp|svg|mp3|m4a|wav|ogg|woff2?|ttf|otf)(\?|$)/i.test(req.url);

  if(isAsset){
    event.respondWith(cacheFirstAsset(req));
  } else {
    // HTML/JS/CSS — stale-while-revalidate
    // (先回快取, 同時背景更新, 下次訪問就是新的)
    event.respondWith(staleWhileRevalidate(req));
  }
});

// cache-first: 優先回快取, miss 才抓網路並存入
function cacheFirstAsset(req){
  return caches.match(req, { ignoreSearch: false }).then(function(cached){
    if(cached) return cached;

    // 同網域 vs 跨網域處理不同
    var sameOrigin = (new URL(req.url)).origin === self.location.origin;
    var fetchReq = sameOrigin ? req : new Request(req.url, { mode: 'no-cors', credentials: 'omit' });

    return fetch(fetchReq).then(function(res){
      // 即使 opaque 也存(讀不到 status 但能用)
      if(res && (res.ok || res.type === 'opaque')){
        var resClone = res.clone();
        caches.open(ASSET_CACHE).then(function(cache){
          cache.put(req, resClone).catch(function(){});
        });
      }
      return res;
    }).catch(function(){
      // 完全離線且沒快取 — 回 fallback (對音訊回空 audio, 圖片回 1x1 透明)
      return new Response('', { status: 504, statusText: 'Offline' });
    });
  });
}

// stale-while-revalidate: shell 用,先回快取讓使用者秒開,背景更新
function staleWhileRevalidate(req){
  return caches.open(SHELL_CACHE).then(function(cache){
    return cache.match(req).then(function(cached){
      var fetchPromise = fetch(req).then(function(res){
        if(res && res.ok){
          cache.put(req, res.clone()).catch(function(){});
        }
        return res;
      }).catch(function(){
        return cached; // 網路失敗就用快取
      });

      return cached || fetchPromise;
    });
  });
}

// ─────────────────────────────────────────────
// message: 接收 client 指令
//   - {type:'SKIP_WAITING'} → 立即啟用新 SW
//   - {type:'PRECACHE_URLS', urls:[...], batchId:'xxx'} → 預載資源(批次回報進度)
//   - {type:'CHECK_CACHED_COUNT'} → 回傳已快取資源數
//   - {type:'GET_VERSION'} → 回傳 SW 版本
// ─────────────────────────────────────────────
self.addEventListener('message', function(event){
  var data = event.data || {};

  if(data.type === 'SKIP_WAITING'){
    self.skipWaiting();
    return;
  }

  if(data.type === 'GET_VERSION'){
    event.source.postMessage({ type: 'VERSION', version: SW_VERSION });
    return;
  }

  if(data.type === 'CHECK_CACHED_COUNT'){
    caches.open(ASSET_CACHE).then(function(cache){
      return cache.keys();
    }).then(function(keys){
      event.source.postMessage({ type: 'CACHED_COUNT', count: keys.length });
    });
    return;
  }

  if(data.type === 'PRECACHE_URLS'){
    var urls = data.urls || [];
    var batchId = data.batchId || 'default';
    var client = event.source;

    precacheUrlsInBatches(urls, client, batchId);
    return;
  }
});

// 批次下載 — 每批 CONCURRENT 個並行, 跑完一批回報進度
function precacheUrlsInBatches(urls, client, batchId){
  var total = urls.length;
  var done = 0;
  var failed = 0;

  function sendProgress(){
    if(client){
      client.postMessage({
        type: 'PRECACHE_PROGRESS',
        batchId: batchId,
        done: done,
        failed: failed,
        total: total
      });
    }
  }

  function sendComplete(){
    if(client){
      client.postMessage({
        type: 'PRECACHE_COMPLETE',
        batchId: batchId,
        done: done,
        failed: failed,
        total: total
      });
    }
  }

  if(total === 0){
    sendComplete();
    return;
  }

  caches.open(ASSET_CACHE).then(function(cache){
    // 先過濾掉已快取的 (避免重複下載)
    return Promise.all(urls.map(function(url){
      return cache.match(url, { ignoreSearch: false }).then(function(hit){
        return hit ? null : url; // 已有快取 → null, 需要抓 → url
      });
    })).then(function(filtered){
      var toFetch = filtered.filter(function(u){ return u !== null; });
      var alreadyCached = total - toFetch.length;
      done = alreadyCached;
      sendProgress();

      // 批次處理
      function processBatch(){
        if(toFetch.length === 0){
          sendComplete();
          return;
        }
        var batch = toFetch.splice(0, CONCURRENT);
        return Promise.all(batch.map(function(url){
          var sameOrigin = (new URL(url)).origin === self.location.origin;
          var fetchReq = sameOrigin
            ? new Request(url, { credentials: 'omit' })
            : new Request(url, { mode: 'no-cors', credentials: 'omit' });

          return fetch(fetchReq).then(function(res){
            if(res && (res.ok || res.type === 'opaque')){
              return cache.put(url, res).then(function(){
                done++;
              }).catch(function(err){
                console.warn('[SW] cache.put failed:', url, err);
                failed++;
              });
            } else {
              failed++;
            }
          }).catch(function(err){
            console.warn('[SW] fetch failed:', url, err);
            failed++;
          });
        })).then(function(){
          sendProgress();
          // iPad 間隔: 每批之間休 100ms 喘口氣
          return new Promise(function(r){ setTimeout(r, IS_IOS_LIKE ? 150 : 50); });
        }).then(processBatch);
      }

      return processBatch();
    });
  }).catch(function(err){
    console.error('[SW] precache fatal:', err);
    sendComplete();
  });
}
