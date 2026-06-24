// ════════════════════════════════════════════════════════════════════════
//  sw-light.js — LXPSGAME 輕量級圖片快取 Service Worker(v3.11.3)
// ════════════════════════════════════════════════════════════════════════
//
//  目的:給「沒申請下載授權」的學生使用,讓圖片/音效/字型「看過一次就存起來」,
//        不用每次重開遊戲都從 GitHub raw 重新抓,大幅省流量並加快載入。
//
//  跟 sw.js 的差別:
//    - sw.js          → 主動預載 350MB(老師授權後才跑)
//    - sw-light.js    → 不預載,只在玩家「看到」資源時順手存下來(runtime cache)
//
//  cache 容量上限:約 200MB(iOS Safari 友善),用 LRU 機制淘汰最舊的
//
//  攔截範圍:
//    - GitHub raw / jsdelivr 上的 .png .jpg .jpeg .gif .webp .svg
//    - GitHub raw / jsdelivr 上的 .mp3 .m4a .wav .ogg
//    - 不攔截 Firestore / Firebase / Google APIs(避免破壞登入/雲端同步)
//
//  策略:Cache First + 背景更新(stale-while-revalidate)
//    1. 玩家請求圖片 → 先看 cache 有沒有
//    2. 有 → 立刻回 cache 版本(瞬間)
//    3. 同時背景重新 fetch 新版本,更新 cache(下次才生效)
//
//  失敗安全:任何 cache 操作出錯 → 直接走網路,不擋遊戲
// ════════════════════════════════════════════════════════════════════════

'use strict';

const CACHE_NAME = 'lxpsgame-light-v1';
const MAX_CACHE_ENTRIES = 400;  // 圖片/音效約 250 個,留 150 個緩衝
const ASSET_EXT_RE = /\.(png|jpg|jpeg|gif|webp|svg|mp3|m4a|wav|ogg|woff|woff2)(\?|$)/i;
const CACHEABLE_HOSTS = [
  'raw.githubusercontent.com',
  'github.com',
  'cdn.jsdelivr.net',
  'cdnjs.cloudflare.com'
];

// ════════════════════════════════════════════════════════════════════════
// ★ v3.11.2 — jsDelivr CDN 改寫(與 sw.js 同邏輯,繞 GitHub raw 429)
//   未授權學生(走 sw-light.js)原本直連 GitHub raw,26 人同時看圖一樣會被
//   GitHub 對學校 NAT IP 限流(429)→ 破圖。改抓 jsDelivr 全球 CDN 即可避開。
//   重點:cache key 一律用「原始 req」,只是實際去抓 jsDelivr;jsDelivr 失敗
//        會自動回退原 GitHub URL,絕不壞圖。
//   未來新增素材 repo → 在 CDN_REPOS 加一筆即可。
// ════════════════════════════════════════════════════════════════════════
const CDN_REPOS = [
  { user: 'clarebox123jp-art',   repo: 'LXPSGAME', branch: 'main' }
  // ★ v3.11.3 — 已移除舊倉 '-' 與 ChrisRaelGameMaster/Game(素材全統一至 LXPSGAME 單一倉)
];
function _isCdnRepo(user, repo){
  for(let i = 0; i < CDN_REPOS.length; i++){
    if(CDN_REPOS[i].user === user && CDN_REPOS[i].repo === repo) return true;
  }
  return false;
}
function rewriteToJsDelivr(originalUrl){
  try{
    const u = new URL(originalUrl);
    let user = null, repo = null, branch = null, path = null;
    if(u.hostname === 'github.com'){
      const m = u.pathname.match(/^\/([^\/]+)\/([^\/]+)\/raw\/([^\/]+)\/(.+)$/);
      if(m){ user = m[1]; repo = m[2]; branch = m[3]; path = m[4]; }
    } else if(u.hostname === 'raw.githubusercontent.com'){
      const m1 = u.pathname.match(/^\/([^\/]+)\/([^\/]+)\/refs\/heads\/([^\/]+)\/(.+)$/);
      const m2 = m1 ? null : u.pathname.match(/^\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)$/);
      const m = m1 || m2;
      if(m){ user = m[1]; repo = m[2]; branch = m[3]; path = m[4]; }
    }
    if(!path || !_isCdnRepo(user, repo)) return null;
    return 'https://cdn.jsdelivr.net/gh/' + user + '/' + repo + '@' + branch + '/' + path;
  }catch(_){ return null; }
}
// 抓資源:優先 jsDelivr,失敗回退原 req。opts 例:{cache:'no-cache'}
async function cdnFetch(req, opts){
  const cdnUrl = rewriteToJsDelivr(req.url);
  if(!cdnUrl) return fetch(req, opts);
  try{
    const res = await fetch(cdnUrl, opts); // jsDelivr 有送 CORS,可讀
    if(res && (res.ok || res.type === 'opaque')) return res;
    return fetch(req, opts);               // CDN 4xx/5xx → 回退原 URL
  }catch(_){
    return fetch(req, opts);               // CDN 連線失敗 → 回退原 URL
  }
}

// ★ v3.11.3 — WebP 自動改寫(同 sw.js)：支援 webp 的瀏覽器(Accept 含 image/webp)抓 .png 改抓同名 .webp；
//   PWA icon(/icon-*.png) 與舊 iPad(Accept 不含 webp) 及非 png 一律回原 URL → 行為不變。
function pickAssetUrl(req){
  try{
    const url = req.url;
    const accept = (req.headers && req.headers.get && req.headers.get('Accept')) || '';
    if(/\.png(\?|$)/i.test(url)
       && accept.indexOf('image/webp') !== -1
       && !/\/icon-[^\/]*\.png(\?|$)/i.test(url)){
      return url.replace(/\.png(\?|$)/i, '.webp$1');
    }
  }catch(_){}
  return req.url;
}
// 抓資源(webp-aware)：要 webp 先用 cors 抓 webp(可讀 status)，404/失敗退回原 png(走既有 cdnFetch，含 jsDelivr)
async function assetFetch(req, wantUrl, opts){
  if(wantUrl !== req.url){
    try{
      const r = await fetch(wantUrl, Object.assign({ mode: 'cors', credentials: 'omit' }, opts || {}));
      if(r && r.ok) return r;          // webp 存在 → 用它
    }catch(_){}
    return cdnFetch(req, opts);        // webp 404/失敗 → 原 png 流程
  }
  return cdnFetch(req, opts);          // 非 png/舊機 → 原樣
}

// ─── 判斷此請求是否該被快取 ───
function shouldCache(url){
  try{
    const u = new URL(url);
    // 必須是 GET(下方在 fetch event 已過濾,這裡再加保險)
    if(!CACHEABLE_HOSTS.includes(u.hostname)) return false;
    // 副檔名必須是資源類型
    if(!ASSET_EXT_RE.test(u.pathname)) return false;
    return true;
  }catch(_){
    return false;
  }
}

// ─── LRU 淘汰:cache 超過上限時刪最舊的 ───
async function trimCache(){
  try{
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    if(keys.length <= MAX_CACHE_ENTRIES) return;
    // 刪掉最前面(最舊)的 50 個,一次清足以避免每次都跑
    const toDelete = keys.slice(0, keys.length - MAX_CACHE_ENTRIES + 50);
    await Promise.all(toDelete.map(k => cache.delete(k)));
    console.log('[SW-Light] LRU 淘汰 ' + toDelete.length + ' 個舊資源');
  }catch(e){
    console.warn('[SW-Light] trimCache 失敗', e);
  }
}

// ─── install:立即進入 active,不等其他 SW ───
self.addEventListener('install', (event) => {
  console.log('[SW-Light v3.11.3] 安裝中(輕量圖片快取模式)');
  self.skipWaiting();
});

// ─── activate:接管控制權,清掉舊版 cache ───
self.addEventListener('activate', (event) => {
  console.log('[SW-Light v3.11.3] 啟動,接管所有頁面');
  event.waitUntil((async () => {
    try{
      const names = await caches.keys();
      await Promise.all(names.map(n => {
        // 留下自己的 cache,其他 light 版本 cache 都清掉
        if(n.startsWith('lxpsgame-light-') && n !== CACHE_NAME){
          console.log('[SW-Light] 清理舊版 cache:' + n);
          return caches.delete(n);
        }
      }));
    }catch(e){
      console.warn('[SW-Light] activate cleanup 失敗', e);
    }
    await self.clients.claim();
  })());
});

// ─── fetch:cache-first + 背景更新 ───
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // 只處理 GET
  if(req.method !== 'GET') return;

  // 只處理符合條件的資源
  if(!shouldCache(req.url)) return;

  event.respondWith((async () => {
    try{
      const cache = await caches.open(CACHE_NAME);
      const wantUrl = pickAssetUrl(req);           // ★ v3.11.3 webp-aware
      const cached = await cache.match(wantUrl);   // ★ key 用實際抓取 URL(webp/png 各存各的)

      if(cached){
        // ─── 有 cache → 立刻回,背景更新 ───
        event.waitUntil((async () => {
          try{
            const fresh = await assetFetch(req, wantUrl, { cache: 'no-cache' }); // ★ v3.11.3 webp→png fallback
            if(fresh && (fresh.ok || fresh.type === 'opaque')){
              await cache.put(wantUrl, fresh.clone());
              // 定期 trim(每 20 次更新跑一次,避免每次都跑)
              if(Math.random() < 0.05) trimCache();
            }
          }catch(_){
            // 網路失敗無所謂,反正用 cache 版本
          }
        })());
        return cached;
      }

      // ─── 沒 cache → 抓網路(優先 webp,再 CDN),成功則存 cache ───
      const network = await assetFetch(req, wantUrl);   // ★ v3.11.3 webp→png fallback
      if(network && (network.ok || network.type === 'opaque')){
        // clone 因為 Response body 只能讀一次
        cache.put(wantUrl, network.clone()).then(() => {
          if(Math.random() < 0.05) trimCache();
        }).catch(e => console.warn('[SW-Light] cache.put 失敗', e));
      }
      return network;
    }catch(e){
      // 連 cache.open 都炸了 → 直接走網路
      console.warn('[SW-Light] fetch handler 失敗,fallback 直連', e);
      return fetch(req);
    }
  })());
});

// ─── 對外訊息:讓主程式可以查 cache 統計 / 手動清快取 ───
self.addEventListener('message', (event) => {
  const data = event.data || {};

  if(data.type === 'SW_LIGHT_STATS'){
    (async () => {
      try{
        const cache = await caches.open(CACHE_NAME);
        const keys = await cache.keys();
        // 估算 cache 大小(從 navigator.storage.estimate,但這在 SW 內也可呼叫)
        let usageMB = 0;
        try{
          if(self.navigator && self.navigator.storage && self.navigator.storage.estimate){
            const est = await self.navigator.storage.estimate();
            usageMB = ((est.usage || 0) / 1024 / 1024).toFixed(1);
          }
        }catch(_){}
        event.ports[0] && event.ports[0].postMessage({
          type: 'SW_LIGHT_STATS_RESULT',
          count: keys.length,
          usageMB: usageMB,
          cacheName: CACHE_NAME
        });
      }catch(e){
        event.ports[0] && event.ports[0].postMessage({
          type: 'SW_LIGHT_STATS_RESULT',
          error: String(e)
        });
      }
    })();
  }

  if(data.type === 'SW_LIGHT_CLEAR'){
    (async () => {
      try{
        await caches.delete(CACHE_NAME);
        event.ports[0] && event.ports[0].postMessage({
          type: 'SW_LIGHT_CLEAR_RESULT',
          ok: true
        });
      }catch(e){
        event.ports[0] && event.ports[0].postMessage({
          type: 'SW_LIGHT_CLEAR_RESULT',
          ok: false,
          error: String(e)
        });
      }
    })();
  }
});

console.log('[SW-Light v3.11.3] script loaded — 等待 install/activate');
