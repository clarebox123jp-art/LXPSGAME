/* ============================================================
 * 小英雄大對抗 — Service Worker (sw.js)
 * 版本: v3.4.15 (與 window._GAME_LOADED_VERSION 同步)
 *
 * 設計重點(iPad 友善):
 *   1. 資源清單由 client 端 postMessage 傳入,SW 不寫死 URL → 老師之後加資源不用改 sw.js
 *   2. 批次下載 (iPad 限制並行 3, 桌機 8) → 避免 iOS 記憶體壓力
 *   3. 單一資源失敗不影響整體 → 跨域 GitHub raw 用 no-cors
 *   4. 快取分層: shell (核心檔案, 隨版本更新) + assets (圖片/音訊, 永久保留)
 *   5. 進度回報給 client → 顯示安裝讀條
 *   6. ★ v3.4.15 — ASSET_CACHE 不再綁版本 (固定為 'lxps-assets-v1')
 *      圖片/音訊以 URL 為 key, GitHub raw 上的素材不會原地改, 沒理由因版本升級
 *      就砍光重抓。這修復了「每次更新都顯示首次安裝+0% 重新下載」的 bug。
 *
 * 更新方式:
 *   每次老師發新版,改下面 SW_VERSION (例 'v3.4.14' → 'v3.4.15') + 改 index.html 內的
 *   window._GAME_LOADED_VERSION 即可。舊版的 SHELL_CACHE 會被清掉(取得新 index.html/JS/CSS),
 *   但 ASSET_CACHE 保留,圖片音訊不會重抓。
 * ============================================================ */

const SW_VERSION = 'v3.5.31';
const SHELL_CACHE = 'lxps-shell-' + SW_VERSION;
// ★ v3.4.15 — ASSET_CACHE 固定不綁版本, 避免每次更新都把圖片音訊砍光重抓
const ASSET_CACHE = 'lxps-assets-v1';

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

// ═══════════════════════════════════════════════════════════════════════
// ★ v3.4.15 — CDN 鏡像改寫 (繞過 GitHub raw 對未認證 IP 的 429 限流)
// ───────────────────────────────────────────────────────────────────────
// 背景: GitHub 在 2025/5/8 對 raw.githubusercontent.com 加上未認證限流。
//       學校所有師生共用同 NAT IP, 一節課 30+ 人同步首裝 PWA 會大量 429 失敗。
//       解法: 把 GitHub raw URL 改抓 jsDelivr CDN, 但快取 key 仍用原 URL,
//       這樣 source code 完全不用改, 切換 / 回退都很簡單。
//
// 使用方式:
//   USE_CDN_REWRITE = false (預設)  → 仍直接抓 GitHub, 跟舊版行為一樣
//   USE_CDN_REWRITE = true          → 自動改抓 jsDelivr
//
// 切換步驟 (老師務必先驗證 jsDelivr 對「-」repo 解析正常後再開啟):
//
//   【方法 1: 從瀏覽器 console 測試 (不必改 sw.js, 立刻生效, 適合先驗證)】
//     a) 開遊戲, F12 console 跑:
//        navigator.serviceWorker.controller.postMessage({
//          type:'TEST_CDN',
//          testPath:'manifest.json'
//        });
//     b) 等 console 出現 [SW] TEST_CDN 結果。若 ok=true → CDN 可用
//     c) 跑下行讓本次 session 切換到 CDN:
//        navigator.serviceWorker.controller.postMessage({type:'SET_CDN_REWRITE', enabled:true});
//     d) 觀察一陣子, 確認穩定後再走方法 2 永久開啟
//
//   【方法 2: 永久開啟 (改 sw.js, 推 GitHub)】
//     a) 把下面 USE_CDN_REWRITE 改為 true
//     b) 升 SW_VERSION 一個小版號 (例 v3.4.15 → v3.4.16) + 對應升 index.html 的版號
//     c) push GitHub → 玩家下次開遊戲自動切換
//
//   萬一 jsDelivr 出狀況: 改回 false → 再升版號 → push → 玩家拿到舊邏輯
// ═══════════════════════════════════════════════════════════════════════
// 用 let 而非 const, 是為了允許從 client 動態切換 (見上方方法 1)
let USE_CDN_REWRITE = false; // ★ 老師驗證後改 true
const GITHUB_USER = 'clarebox123jp-art';
const GITHUB_REPO = '-';
const GITHUB_BRANCH = 'main';

// 把 GitHub raw URL 改寫成 jsDelivr URL (若失敗回傳 null, caller 抓原 URL)
//   支援的格式:
//     https://github.com/{user}/{repo}/raw/{branch}/{path}
//     https://raw.githubusercontent.com/{user}/{repo}/{branch}/{path}
//     https://raw.githubusercontent.com/{user}/{repo}/refs/heads/{branch}/{path}
function rewriteToJsDelivr(originalUrl){
  if(!USE_CDN_REWRITE) return null;
  try {
    var u = new URL(originalUrl);
    var path = null;
    if(u.hostname === 'github.com'){
      // /{user}/{repo}/raw/{branch}/{...path}
      var m = u.pathname.match(/^\/([^\/]+)\/([^\/]+)\/raw\/([^\/]+)\/(.+)$/);
      if(m && m[1] === GITHUB_USER && m[2] === GITHUB_REPO) path = m[4];
    } else if(u.hostname === 'raw.githubusercontent.com'){
      // /{user}/{repo}/{branch}/{...path}  或  /{user}/{repo}/refs/heads/{branch}/{...path}
      var m1 = u.pathname.match(/^\/([^\/]+)\/([^\/]+)\/refs\/heads\/([^\/]+)\/(.+)$/);
      var m2 = m1 ? null : u.pathname.match(/^\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)$/);
      var m = m1 || m2;
      if(m && m[1] === GITHUB_USER && m[2] === GITHUB_REPO) path = m[4];
    }
    if(!path) return null;
    // 注意: path 內可能含 URL-encoded 中文檔名, 不要再 encode/decode 一次
    return 'https://cdn.jsdelivr.net/gh/' + GITHUB_USER + '/' + GITHUB_REPO
         + '@' + GITHUB_BRANCH + '/' + path;
  } catch(_) {
    return null;
  }
}

// 抓 URL (有 CDN 鏡像時優先抓鏡像, 失敗 fallback 回原 URL)
// 注意: 給 caller 的 Response 不會帶 url, caller 仍用原 URL 當 cache key
function fetchWithCdnFallback(originalUrl, fetchOpts){
  var cdnUrl = rewriteToJsDelivr(originalUrl);
  if(!cdnUrl){
    return fetch(originalUrl, fetchOpts);
  }
  return fetch(cdnUrl, fetchOpts).then(function(res){
    // 200 OK 或 opaque (no-cors 的跨域 response) 都當成功
    if(res && (res.ok || res.type === 'opaque')) return res;
    // CDN 回了 4xx/5xx — fallback 回原 URL (jsDelivr 對單字符 repo 不支援的情況)
    console.warn('[SW] CDN miss, fallback to GitHub:', originalUrl, 'CDN status:', res && res.status);
    return fetch(originalUrl, fetchOpts);
  }).catch(function(err){
    console.warn('[SW] CDN fetch error, fallback to GitHub:', originalUrl, err && err.message);
    return fetch(originalUrl, fetchOpts);
  });
}

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
// activate: 清除舊版 SHELL 快取 (ASSET 快取保留, 因為它不綁版本)
// ─────────────────────────────────────────────
self.addEventListener('activate', function(event){
  console.log('[SW] activate', SW_VERSION);
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(key){
        // ★ v3.4.15 — 保留當前版本的 SHELL_CACHE 和固定的 ASSET_CACHE
        // 舊版的 lxps-shell-vX.X.X 會被清掉, 但 lxps-assets-v1 永遠保留
        // 同時清掉 v3.4.15 之前的舊 lxps-assets-vX.X.X (一次性遷移)
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
    // ★ v3.4.15 — 跨域請求 (GitHub raw 等) 走 CDN 改寫; 同源照舊
    var fetchPromise;
    if(sameOrigin){
      fetchPromise = fetch(req);
    } else {
      var noCorsOpts = { mode: 'no-cors', credentials: 'omit' };
      fetchPromise = fetchWithCdnFallback(req.url, noCorsOpts);
    }

    return fetchPromise.then(function(res){
      // 即使 opaque 也存(讀不到 status 但能用)
      if(res && (res.ok || res.type === 'opaque')){
        var resClone = res.clone();
        caches.open(ASSET_CACHE).then(function(cache){
          // 用原始 req 當 cache key, 這樣下次 <img src="github..."> 能 hit
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

  // ★ v3.4.15 — 動態切換 CDN 改寫 (僅本次 SW lifetime 有效, SW 重啟後恢復 USE_CDN_REWRITE 的初始值)
  if(data.type === 'SET_CDN_REWRITE'){
    USE_CDN_REWRITE = !!data.enabled;
    console.log('[SW] USE_CDN_REWRITE set to', USE_CDN_REWRITE);
    if(event.source){
      event.source.postMessage({ type: 'CDN_REWRITE_STATE', enabled: USE_CDN_REWRITE });
    }
    return;
  }

  // ★ v3.4.15 — 測試 jsDelivr CDN 是否可達 (不影響 USE_CDN_REWRITE 狀態)
  // 傳入 {type:'TEST_CDN', testPath:'manifest.json'} 即可
  if(data.type === 'TEST_CDN'){
    var testPath = data.testPath || 'manifest.json';
    var testUrl = 'https://cdn.jsdelivr.net/gh/' + GITHUB_USER + '/' + GITHUB_REPO
                + '@' + GITHUB_BRANCH + '/' + testPath;
    fetch(testUrl, { mode: 'cors', credentials: 'omit' }).then(function(res){
      var result = { type: 'TEST_CDN_RESULT', url: testUrl, ok: res.ok, status: res.status };
      console.log('[SW] TEST_CDN', result);
      if(event.source) event.source.postMessage(result);
    }).catch(function(err){
      var result = { type: 'TEST_CDN_RESULT', url: testUrl, ok: false, error: err.message };
      console.warn('[SW] TEST_CDN error', result);
      if(event.source) event.source.postMessage(result);
    });
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
          // ★ v3.4.15 — 跨域走 CDN 改寫 (繞 GitHub 429), 同源照舊
          var fetchPromise;
          if(sameOrigin){
            fetchPromise = fetch(new Request(url, { credentials: 'omit' }));
          } else {
            fetchPromise = fetchWithCdnFallback(url, { mode: 'no-cors', credentials: 'omit' });
          }

          return fetchPromise.then(function(res){
            if(res && (res.ok || res.type === 'opaque')){
              // 用原始 url 當 cache key (不論實際是從 GitHub 還是 CDN 抓的)
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
