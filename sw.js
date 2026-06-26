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

const SW_VERSION = 'v3.5.89';   // ★ v3.5.89 — 資源圖快取根治:fallback 全改 CORS(讀得到 status)、只快取確認 200、錯誤(403/429)一律不快取;修掉 v3.5.88「no-cors opaque 錯誤被當成功圖快取」造成的永久壞圖(只有高頻載入的主角/機關王/初始隊先存到正確圖才正常);ASSET_CACHE 一次性 v1→v2 清中毒快取;cacheFirstAsset 雙 key 查詢(webp 未命中再查 png,讓 precache 不再白做);precache 同步去 opaque-bug 改 CORS｜前版 v3.5.88 — WebP 自動改寫(cacheFirstAsset:支援的瀏覽器 png→webp·舊 iPad 與 /icon-*.png 維持 png·webp 404 自動退回 png)，新機圖片傳輸大減、舊機與離線行為不變；cache key 改用實際抓取 URL(webp/png 各存各的)｜前版 v3.5.87(對應遊戲 v3.15.94)— 載入可靠性強化:SHELL_CACHE 改固定不綁版本(跨版本保留「上次成功版」當 fallback)→ 解決「改版後新 shell 快取尚未填好、慢校網撈不到 fallback 而卡住進不去」;networkFirstShell 逾時 5s→2.5s + fallback 改全快取庫比對(caches.match)→ 慢網更快回快取、回頭裝置幾乎一定進得去。仍為 network-first(線上先抓最新,更新即時生效不變)｜前版 v3.5.86 jsDelivr CDN 改寫
// ★ v3.5.87 — SHELL_CACHE 改「固定不綁版本」(原 'lxps-shell-'+SW_VERSION):
//   原設計每次 bump SW_VERSION → 新 SHELL_CACHE 是空的,activate 又把舊版 shell 快取刪掉,
//   慢校網下 networkFirstShell 逾時想 fallback 時「新快取空、舊快取已刪」→ 撈不到 → 卡住下載不完。
//   改固定 'lxps-shell-v1' 後:install 會以 cache:'reload' 重抓 SHELL_URLS 覆蓋成最新(改版仍即時),
//   但快取本身跨版本保留 →「上次成功完整載入」永遠在,逾時/離線一定有 fallback,回頭裝置幾乎 100% 進得去。
const SHELL_CACHE = 'lxps-shell-v1';
// ★ v3.4.15 — ASSET_CACHE 固定不綁版本, 避免每次更新都把圖片音訊砍光重抓
// ★ v3.5.89 — 一次性 v1→v2:清掉 v3.5.88 opaque-bug 寫進來的「壞圖快取」(403/429 被當成功)。
//   這是「ASSET_CACHE 永不改」鐵則的單次例外;改完每台裝置下次只重抓「用到的」圖一次,
//   有 raw + jsDelivr 雙來源 × webp/png 共四重備援,校網短暫 429 也會自己救回。日後不再動此名。
const ASSET_CACHE = 'lxps-assets-v2';

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
let USE_CDN_REWRITE = true; // ★ v3.5.86 正式開啟(繞 GitHub raw 429);jsDelivr 抓不到會自動回退 GitHub raw,不會壞圖

// ★ v3.5.86 — 改寫白名單:遊戲實際用到的「全部」素材 repo。
//   原本只認 '-'(42檔),漏了 LXPSGAME(80檔,最大宗)和 ChrisRaelGameMaster/Game(37檔),
//   導致 117/159 個素材仍直撞 GitHub raw 429。這裡補齊三個 repo。
//   ★ 未來若新增素材 repo,只要在這個陣列加一筆即可(其餘程式完全不用動)。
const CDN_REPOS = [
  { user: 'clarebox123jp-art',   repo: 'LXPSGAME', branch: 'main' }
  // ★ v3.16.12 — 已移除舊倉 '-' 與 ChrisRaelGameMaster/Game(素材全統一至 LXPSGAME 單一倉)
];

// TEST_CDN 工具的預設測試目標(僅供 console 驗證用,不影響改寫邏輯)
const GITHUB_USER = 'clarebox123jp-art';
const GITHUB_REPO = '-';
const GITHUB_BRANCH = 'main';

// 判斷 {user,repo} 是否在改寫白名單內
function _isCdnRepo(user, repo){
  for(var i = 0; i < CDN_REPOS.length; i++){
    if(CDN_REPOS[i].user === user && CDN_REPOS[i].repo === repo) return true;
  }
  return false;
}

// 把 GitHub raw URL 改寫成 jsDelivr URL (若不在白名單或解析失敗回傳 null, caller 抓原 URL)
//   支援的格式:
//     https://github.com/{user}/{repo}/raw/{branch}/{path}
//     https://raw.githubusercontent.com/{user}/{repo}/{branch}/{path}
//     https://raw.githubusercontent.com/{user}/{repo}/refs/heads/{branch}/{path}
function rewriteToJsDelivr(originalUrl){
  if(!USE_CDN_REWRITE) return null;
  try {
    var u = new URL(originalUrl);
    var user = null, repo = null, branch = null, path = null;
    if(u.hostname === 'github.com'){
      // /{user}/{repo}/raw/{branch}/{...path}
      var m = u.pathname.match(/^\/([^\/]+)\/([^\/]+)\/raw\/([^\/]+)\/(.+)$/);
      if(m){ user = m[1]; repo = m[2]; branch = m[3]; path = m[4]; }
    } else if(u.hostname === 'raw.githubusercontent.com'){
      // /{user}/{repo}/{branch}/{...path}  或  /{user}/{repo}/refs/heads/{branch}/{...path}
      var m1 = u.pathname.match(/^\/([^\/]+)\/([^\/]+)\/refs\/heads\/([^\/]+)\/(.+)$/);
      var m2 = m1 ? null : u.pathname.match(/^\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)$/);
      var m = m1 || m2;
      if(m){ user = m[1]; repo = m[2]; branch = m[3]; path = m[4]; }
    }
    // ★ v3.5.86 — 只改寫白名單內的 repo;其餘(cdnjs、Google Fonts、未知 repo)維持原樣
    if(!path || !_isCdnRepo(user, repo)) return null;
    // 注意: path 內可能含 URL-encoded 中文檔名, 不要再 encode/decode 一次
    return 'https://cdn.jsdelivr.net/gh/' + user + '/' + repo + '@' + branch + '/' + path;
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
// fetch:
//   圖片/音訊/字型 → cache-first (URL 為 key, 不會原地改, 永久快取)
//   HTML/JS/CSS/其餘 → ★ v3.5.34 network-first (帶 5 秒逾時 fallback 快取)
// ─────────────────────────────────────────────
// ★★★ v3.5.34(2026-06-05)— 根治「版本更新不完全, 玩家玩到舊版 bug」★★★
//   舊版 bug: 此處 HTML/JS/CSS 走 staleWhileRevalidate(先回「舊」快取、背景才更新),
//             所以玩家「這次」開啟一定拿到舊 index.html / 舊 JS → 已修好的 bug 又出現,
//             要再開一次才會套到新版。共用 iPad「開一下就關 / 換人」→ 新版常常永遠套不上,
//             連帶老師做的所有「防汙染 / 防訪客」修正都送不到那些玩家手上。
//   修法: 程式碼類(HTML/JS/CSS)改 network-first — 線上一律先抓最新, 抓到就更新快取;
//          5 秒逾時或離線才 fallback 用快取(維持可離線玩)。圖片/音訊維持 cache-first 不變
//          (素材不會原地改, 沒理由每次重抓, 也不踩 GitHub raw 429)。
//   安全: 不自動 skipWaiting(避免「舊頁面 + 新 lazy chunk」版本錯位); 新 SW 由 banner /
//          下次完整重開 / client 端開機自癒 接管。network-first 一旦生效, 往後每次開啟都最新。
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
    // ★ v3.5.34 — HTML/JS/CSS 改 network-first(線上一律最新, 逾時/離線 fallback 快取)
    event.respondWith(networkFirstShell(req));
  }
});

// ★ v3.5.88 — WebP 自動改寫 helper：支援 webp 的瀏覽器(Accept 含 image/webp)抓 .png 時,
//   把目標改成同名 .webp；PWA icon(/icon-*.png) 維持 png(WebP 當不了 icon)。
//   舊 iPad(iOS<14·Accept 不含 image/webp) 與 .gif/.mp3/.m4a 等一律回原 URL → 行為不變。
function _lxpsPickAssetUrl(req){
  try{
    var url = req.url;
    var accept = (req.headers && req.headers.get && req.headers.get('Accept')) || '';
    if(/\.png(\?|$)/i.test(url)
       && accept.indexOf('image/webp') !== -1
       && !/\/icon-[^\/]*\.png(\?|$)/i.test(url)){
      return url.replace(/\.png(\?|$)/i, '.webp$1');
    }
  }catch(e){}
  return req.url;
}

// cache-first: 優先回快取, miss 才抓網路並存入
// ★ v3.5.88 — webp-aware：png 請求在支援的瀏覽器改抓 .webp(cors,可讀 status)，
//   webp 不存在(404/別帳號 repo/舊機) 自動退回原 .png；cache key 用實際抓取的 URL(wantUrl)，
//   新機存 webp、舊 iPad 存 png，互不干擾、對遊戲端完全無感(瀏覽器依實際 bytes 解碼)。
// ★ v3.5.89 — CORS 驗證抓取:一律用 cors(讀得到 status),只回「確認 200」的回應;
//   raw 失敗(429/404/網路/cors 拒絕)自動改試 jsDelivr 鏡像;兩者皆非 200 回 null。
//   ★ 根治 v3.5.88 bug:no-cors 的 opaque 回應讀不到 status,403/429 錯誤頁會被當成「成功圖」
//   快取下來造成永久壞圖。改用 cors 後可辨識錯誤、絕不快取壞回應(壞了下次還能重試)。
//   raw.githubusercontent.com 與 cdn.jsdelivr.net 對成功與 404 皆帶 access-control-allow-origin:*。
function _lxpsCorsFetchVerified(url){
  function corsGet(u){
    return fetch(u, { mode: 'cors', credentials: 'omit' }).then(function(r){
      return (r && r.ok) ? r : null;
    }).catch(function(){ return null; });
  }
  return corsGet(url).then(function(r){
    if(r) return r;
    var cdn = rewriteToJsDelivr(url);
    if(!cdn) return null;
    return corsGet(cdn);
  });
}

function cacheFirstAsset(req){
  var wantUrl = _lxpsPickAssetUrl(req);
  var triedWebp = (wantUrl !== req.url);
  var _pngUrl = req.url;
  // ★ v3.5.89 — 雙 key 查詢:先 webp key,未命中再查 png key(讓 precache 存的 png 也能被 webp 機命中)
  return caches.match(wantUrl, { ignoreSearch: false }).then(function(c1){
    if(c1) return c1;
    if(wantUrl === _pngUrl) return null;
    return caches.match(_pngUrl, { ignoreSearch: false });
  }).then(function(cached){
    if(cached) return cached;

    // 抓原 png：同網域直連、跨域走既有 CDN fallback(no-cors) — 與 v3.5.87 完全相同
    function fetchPng(){
      return _lxpsCorsFetchVerified(req.url);
    }

    // 主 fetch：要 webp 就先用 cors 抓 webp(能讀 status 判斷有無)，失敗/404 退回 png
    var mainFetch;
    if(triedWebp){
      mainFetch = _lxpsCorsFetchVerified(wantUrl).then(function(r){
        if(r && r.ok) return r;       // webp 存在 → 用它
        return fetchPng();            // webp 404 → 退回 png
      }).catch(function(){
        return fetchPng();            // webp 抓失敗(cors/網路) → 退回 png
      });
    } else {
      mainFetch = fetchPng();
    }

    return mainFetch.then(function(res){
      // ★ v3.5.89 — 只快取「確認 200」(cors 可讀 status);no-cors opaque 一律不進此分支,根治壞圖中毒
      if(res && res.ok){
        var resClone = res.clone();
        caches.open(ASSET_CACHE).then(function(cache){
          // 用 wantUrl 當 cache key：webp/png 各存各的，下次能 hit
          cache.put(wantUrl, resClone).catch(function(){});
        });
      }
      if(res) return res;
      // ★ v3.5.89 — cors 全失敗 → 最後 no-cors 嘗試「顯示但不快取」(非 CORS 來源仍能出圖;
      //   讀不到 status 故絕不快取,壞了下次重試,不會永久中毒)
      return fetch(req.url, { mode: 'no-cors', credentials: 'omit' }).then(function(rr){
        return rr || new Response('', { status: 504, statusText: 'asset unavailable' });
      }).catch(function(){
        return new Response('', { status: 504, statusText: 'asset unavailable' });
      });
    }).catch(function(){
      // 完全離線且沒快取 — 回 fallback (對音訊回空 audio, 圖片回 1x1 透明)
      return new Response('', { status: 504, statusText: 'Offline' });
    });
  });
}

// ★ v3.5.34 — network-first(程式碼類):線上一律先抓最新, 抓到就更新快取;
//   逾時或網路失敗才 fallback 用快取(維持可離線玩、慢校網不卡死)。
// ★ v3.5.87 — 逾時 5s→2.5s(慢網更快回快取);fallback 改先查本 shell 快取、再退而求其次查「全快取庫」
//   (caches.match)→ 即使本 shell 快取剛好沒有,任何歷史快取(含舊版殘留/asset)也能頂上,絕不卡死。
function networkFirstShell(req){
  var TIMEOUT_MS = 2500; // 慢校網的安全網:逾時就先給快取(背景仍會更新快取供下次用)
  function fallbackCached(cache){
    // 先本 shell 快取,再退而求其次查全快取庫(belt-and-suspenders)
    return cache.match(req).then(function(c){
      if(c) return c;
      return caches.match(req).then(function(c2){ return c2 || null; });
    });
  }
  return caches.open(SHELL_CACHE).then(function(cache){
    return new Promise(function(resolve){
      var settled = false;
      function finish(res){ if(!settled){ settled = true; resolve(res); } }
      // 逾時保險:超過 TIMEOUT_MS 還沒回 → 若有快取先給快取(網路 promise 仍會繼續更新快取)
      var timer = setTimeout(function(){
        fallbackCached(cache).then(function(cached){ if(cached) finish(cached); });
      }, TIMEOUT_MS);
      fetch(req).then(function(res){
        clearTimeout(timer);
        // 成功且 200 → 更新快取(即使逾時已先給快取, 這次更新也讓「下次開啟」拿到最新)
        if(res && res.ok){
          try{ cache.put(req, res.clone()); }catch(_){}
        }
        finish(res);
      }).catch(function(){
        // 網路失敗(離線)→ fallback 快取; 連快取都沒有才回 504
        clearTimeout(timer);
        fallbackCached(cache).then(function(cached){
          finish(cached || new Response('', { status: 504, statusText: 'Offline' }));
        });
      });
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
          // ★ v3.5.89 — 改 CORS 驗證抓取:只快取確認 200,不再把 no-cors opaque 錯誤當成功圖存
          var fetchPromise = _lxpsCorsFetchVerified(url);

          return fetchPromise.then(function(res){
            if(res && res.ok){
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
