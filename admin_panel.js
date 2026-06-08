// ════════════════════════════════════════════════════════════════════════════
// admin_panel.js — LXPSGAME 管理員後台功能(獨立模組,lazy load)
// ────────────────────────────────────────────────────────────────────────────
// 抽出版本: v3.5.45(2026-05-23)首次抽出
// 改動歷史: v3.5.47(2026-05-23) — 套用 v3.5.44 GM 後台改版
//             • 標題改為「🛠️ 遊戲管理員(GM)專用功能選單」
//             • PC 版(寬≥1024 高≥900)放大 200% + 置中
//             • 14 個區段依重要性 flex order 重排,7 個無 id 區段補上 id
//           v3.12.2(2026-05-30) — 同步主版本戳
//             • 加 window.ADMIN_PANEL_VERSION,讓健康檢查能讀到實際載入的版本
//             • _LXPS_FILE_VERSIONS['admin_panel.js'] 改為含「v3-12-2」字串
// ════════════════════════════════════════════════════════════════════════════

// ★ v3.12.2(2026-05-30) — 自我版本標記,給 index.html 健康檢查使用
//   index.html 的 _runVersionStampHealthCheck() 會比對:
//     window.ADMIN_PANEL_VERSION === _LXPS_FILE_VERSIONS['admin_panel.js']
//   若不一致 → console.warn 警告。同步兩邊以消除告警。
window.ADMIN_PANEL_VERSION = 'v3.13.81';   // ★ v3.13.81 — 版本同步(本版集中於 index.html:商店新商品/防迴圈卡死,GM 面板功能無異動)｜前版 v3.13.80
// 為什麼抽出: 完整面板 ~4,380 行 / 240 KB,但只有老師會用到。從 index.html
//             抽出後,玩家初次載入省 240 KB,管理員第一次按 Shift+F10 才下載。
//
// 載入方式:
//   index.html 內呼叫 await window._ensureAdminPanelLoaded() 動態 fetch 本檔
//   首次載入會把 window._showAdminStatsPanelImpl 等實作掛到 global,
//   之後再開後台就直接從記憶體執行,不會重新下載。
//
// 注意事項:
//   - 本檔依賴 window 上多個 Firebase API(_fbDiagnoseAllSlots 等),
//     這些在 index.html 內 <script type="module"> 已自動掛到 window
//   - 本檔依賴的全域: HERO_DB(hero_db.js 載入)、_customConfirm/_showSimpleToast
//     (function declaration 自動上 window)、_gUserId、_fbAuth、_isAdminUser、_showGmBroadcast 等
//   - 本檔內原本 _showAdminStatsPanel 函式被 rename 為 _showAdminStatsPanelImpl,
//     由 index.html 的 stub 呼叫
//
// 部署:
//   1. 上傳到 GitHub 同一資料夾,跟 game_changelog.js 同層
//   2. 改動本檔後 index.html 不用改,但 ?v=YYYYMMDD 版本參數要更新
//   3. 改動本檔時可順便升 index.html 內的 _GAME_LOADED_VERSION,
//      讓玩家收到「老師更新了」通知
// ════════════════════════════════════════════════════════════════════════════

// 不用 IIFE,直接讓 _showAdminStatsPanelImpl 成為頂層函式宣告,
// 這樣自動掛到 window 上,index.html 的 stub 可直接呼叫
// (用 IIFE 的話 function declaration 會被困在 IIFE 內,反而要再多一行 expose)

// ════════════════════════════════════════════════════════════════════
// ★ v3.5.58 — 管理員後台統一玩家標籤 helper(本檔內部用)
//   薄包裝 window._getAdminPlayerLabel,加上容錯 fallback
//   用法: _adminLabel(email, displayName) → '5324蔣同學(王小明)' 或原 displayName
//   若 index.html 還沒部署 v3.5.58 → 自動退回原 displayName,不會掛掉
//
// ★ v3.5.68(2026-05-24) — 老師明確指示「管理員控制台一律顯示學生全名」
//   一律帶 adminShowReal:true,讓底層函式不做真名保護替換
//   呼叫範圍:下載權限、可疑帳號、Lv1 救援、補償、世界 BOSS 榜、小博士榜 等所有後台功能
//   學生看的世界 BOSS 排行榜不走這條(直接呼叫 _getAdminPlayerLabel 帶 protectIfNoEmail:true)
// ════════════════════════════════════════════════════════════════════
function _adminLabel(email, displayName){
  try{
    if(typeof window._getAdminPlayerLabel === 'function'){
      return window._getAdminPlayerLabel(email, displayName, { adminShowReal: true });
    }
  }catch(_){}
  // fallback:index.html 未部署 v3.5.58
  return displayName || email || '(無)';
}
// 也掛到 window 給外部 console 用
try{ window._adminLabel = _adminLabel; }catch(_){}

async function _showAdminStatsPanelImpl(){
  // 若已開啟則不重開
  if(document.getElementById('_admin-stats-panel')) return;

  const pop = document.createElement('div');
  pop.id = '_admin-stats-panel';
  pop.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.85);'
    + 'display:flex;align-items:center;justify-content:center;font-family:inherit;'
    + 'padding:20px;box-sizing:border-box;';
  pop.innerHTML = `
    <style>
      /* ★ v3.10.11 — 兩欄式 GM 後台:左 sidebar 30% / 右 content 70%
         捲軸統一樣式;所有 section 預設隱藏,點 sidebar 才顯示對應 section */

      /* === 捲軸 === */
      #_admin-stats-panel ::-webkit-scrollbar { width: 8px; }
      #_admin-stats-panel ::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); border-radius: 4px; }
      #_admin-stats-panel ::-webkit-scrollbar-thumb { background: rgba(212,168,67,0.5); border-radius: 4px; }
      #_admin-stats-panel ::-webkit-scrollbar-thumb:hover { background: rgba(212,168,67,0.8); }

      /* === 所有功能 section 預設隱藏 (重點! 點 sidebar 才會切顯隱) === */
      #_admin-stats-panel [id^="_admin-"][id$="-section"] { display: none; }

      /* sidebar 項目按鈕 */
      #_admin-stats-panel .admin-sidebar-item {
        display: block;
        width: 100%;
        text-align: left;
        padding: 12px 14px;
        margin-bottom: 4px;
        background: rgba(40,50,80,0.35);
        border: 1.5px solid rgba(212,168,67,0.25);
        color: #d8d8d8;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
        line-height: 1.4;
        transition: background 0.12s, border-color 0.12s, color 0.12s, transform 0.08s;
      }
      #_admin-stats-panel .admin-sidebar-item:hover {
        background: rgba(80,100,160,0.45);
        border-color: rgba(212,168,67,0.55);
        color: #fff;
      }
      #_admin-stats-panel .admin-sidebar-item:active { transform: scale(0.98); }
      #_admin-stats-panel .admin-sidebar-item.active {
        background: linear-gradient(135deg, rgba(212,168,67,0.45), rgba(180,140,50,0.55));
        border-color: #ffcc44;
        color: #fff;
        box-shadow: 0 2px 12px rgba(212,168,67,0.35), inset 0 0 0 1px rgba(255,220,140,0.5);
      }
      #_admin-stats-panel .admin-sidebar-item ._si-num {
        display: inline-block;
        min-width: 22px;
        color: #888;
        font-size: 12px;
        font-weight: 700;
        margin-right: 6px;
      }
      #_admin-stats-panel .admin-sidebar-item.active ._si-num { color: #ffe9a0; }

      /* === 關閉按鈕 hover === */
      #_admin-stats-panel #_admin-close:hover {
        background: rgba(100,50,50,0.7) !important;
        border-color: #aa6666 !important;
        color: #fff !important;
      }

      /* === 響應式:窄視窗(< 760px)疊成上下兩段 === */
      @media (max-width: 760px) {
        #_admin-stats-panel ._admin-stats-card {
          flex-direction: column !important;
          height: calc(100vh - 16px) !important;
        }
        #_admin-stats-panel #_admin-sidebar {
          flex: 0 0 auto !important;
          max-width: none !important;
          min-width: 0 !important;
          width: 100% !important;
          max-height: 38vh;
          border-right: none !important;
          border-bottom: 2px solid rgba(212,168,67,0.4);
        }
        #_admin-stats-panel #_admin-content { padding: 18px 18px !important; }
        #_admin-stats-panel #_admin-current-title { font-size: 19px !important; }
      }

      /* === 大螢幕(≥ 1024px 且 ≥ 900px 高):字體放大 === */
      @media (min-width: 1024px) and (min-height: 900px) {
        #_admin-stats-panel ._admin-stats-card {
          width: min(1400px, 96vw) !important;
          height: min(960px, calc(100vh - 32px)) !important;
        }
        #_admin-stats-panel #_admin-sidebar { max-width: 380px; min-width: 300px; }
        #_admin-stats-panel #_admin-sidebar > div:first-child { padding: 24px 20px 18px !important; }
        #_admin-stats-panel .admin-sidebar-item { font-size: 16px !important; padding: 15px 16px !important; }
        #_admin-stats-panel #_admin-content { padding: 32px 40px !important; }
        #_admin-stats-panel #_admin-current-title { font-size: 28px !important; }
      }
    </style>
    <!-- ★ v3.10.11 — 改為左 sidebar(30%)+ 右 content(70%)兩欄式;保留所有 section DOM,只切顯隱 -->
    <div class="_admin-stats-card" style="background:linear-gradient(135deg,rgba(20,30,50,0.98),rgba(10,15,30,0.99));
      border:3px solid rgba(212,168,67,0.7);border-radius:20px;
      width:min(1200px, 98vw);height:min(860px, calc(100vh - 32px));
      box-sizing:border-box;color:#eee;margin:0 auto;
      display:flex;flex-direction:row;overflow:hidden;">

      <!-- ============ 左側 SIDEBAR (30%) ============ -->
      <div id="_admin-sidebar" style="flex:0 0 30%;max-width:340px;min-width:240px;
        background:linear-gradient(180deg,rgba(15,20,40,0.95),rgba(8,12,24,0.98));
        border-right:2px solid rgba(212,168,67,0.4);
        display:flex;flex-direction:column;overflow:hidden;">

        <!-- sidebar 標題 -->
        <div style="padding:20px 18px 14px;border-bottom:1.5px solid rgba(212,168,67,0.25);">
          <div style="font-size:19px;font-weight:900;color:#ffcc44;text-align:center;letter-spacing:1.5px;line-height:1.35;">
            🛠️ GM 功能選單
          </div>
          <div style="font-size:11px;color:#888;text-align:center;margin-top:6px;">
            點選左側項目 →
          </div>
        </div>

        <!-- 項目清單(可捲動) -->
        <div id="_admin-sidebar-list" style="flex:1;overflow-y:auto;padding:10px 8px;">
          <!-- 由 JS 動態填入 -->
        </div>

        <!-- 底部關閉按鈕 -->
        <div style="padding:12px 14px;border-top:1.5px solid rgba(212,168,67,0.25);">
          <button id="_admin-close" style="width:100%;padding:11px;font-size:15px;font-weight:700;
            background:rgba(60,60,80,0.7);border:1.5px solid #666;color:#ddd;
            border-radius:8px;cursor:pointer;font-family:inherit;transition:all 0.15s;">
            ✕ 關閉
          </button>
        </div>
      </div>

      <!-- ============ 右側 CONTENT (70%) ============ -->
      <div id="_admin-content" style="flex:1;overflow-y:auto;padding:28px 32px;
        background:linear-gradient(180deg,rgba(20,30,50,0.4),rgba(10,15,30,0.3));">

        <div class="_admin-stats-title" id="_admin-current-title" style="font-size:24px;font-weight:900;color:#ffcc44;margin-bottom:8px;letter-spacing:1.5px;">
          🛠️ 遊戲管理員(GM)專用功能選單
        </div>
        <div class="_admin-stats-subtitle" style="font-size:14px;color:#aaa;margin-bottom:22px;line-height:1.6;">
          點選左側項目開始使用。所有操作會直接覆寫 Firestore 中的資料,請謹慎使用。
        </div>

        <!-- 預設提示(沒選任何項目時顯示) -->
        <div id="_admin-welcome" style="background:rgba(40,50,80,0.3);border:1.5px dashed rgba(212,168,67,0.4);border-radius:12px;padding:28px;text-align:center;color:#bbb;font-size:15px;line-height:1.8;">
          <div style="font-size:48px;margin-bottom:14px;">👈</div>
          請從左側選擇要使用的管理功能<br>
          <span style="font-size:13px;color:#888;">所有功能與舊版完全相同,只是改成側邊選單樣式。</span>
        </div>


      <div id="_admin-maint-section" style="background:rgba(60,20,20,0.4);border:2px solid rgba(255,100,100,0.6);border-radius:10px;padding:16px;margin-bottom:14px;">
        <div style="font-size:18px;font-weight:700;color:#ff8888;margin-bottom:8px;">🔧 0. 維修模式（非管理員登入封鎖）</div>
        <div style="font-size:14px;color:#ccc;margin-bottom:10px;line-height:1.55;">
          開啟後，<b>非管理員帳號無法登入</b>遊戲，正在遊戲中的其他玩家也會被自動登出，避免修補 bug 期間繼續產生資料損失。管理員帳號不受限制。
        </div>
        <div id="_admin-maint-status" style="font-size:14px;color:#ffcc66;margin-bottom:10px;padding:8px 12px;background:rgba(0,0,0,0.4);border-radius:6px;">
          載入中...
        </div>
        <!-- ★ v1.0.20260428.3660 — 預計開機時間輸入欄(替換 {TIME} 預留位置) -->
        <div style="margin-bottom:10px;">
          <label style="font-size:13px;color:#ffcc88;display:block;margin-bottom:4px;font-weight:700;">
            ⏰ 預計開機時間 <span style="font-size:11px;color:#888;font-weight:400;">(會自動填入下方公告中的 {TIME})</span>
          </label>
          <input id="_admin-maint-time" type="text" placeholder="例: 今晚 22:00 / 明天早上 8:30 / 1 小時後"
            style="width:100%;padding:9px 12px;font-size:14px;background:rgba(20,20,30,0.9);
            border:1.5px solid rgba(255,200,100,0.5);color:#fff;border-radius:6px;font-family:inherit;
            box-sizing:border-box;">
        </div>
        <textarea id="_admin-maint-msg" placeholder="維修公告訊息（會顯示給被擋下的玩家）"
          style="width:100%;min-height:60px;padding:10px;font-size:14px;background:rgba(20,20,30,0.9);
          border:1.5px solid rgba(255,100,100,0.4);color:#fff;border-radius:8px;font-family:inherit;
          box-sizing:border-box;margin-bottom:10px;resize:vertical;">系統維修中，正在修復重大 bug，預計 {TIME} 重新開放，請屆時再回來嘗試。</textarea>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button id="_admin-maint-on" style="flex:1;min-width:140px;padding:11px 20px;font-size:15px;font-weight:800;
            background:rgba(255,80,80,0.25);border:2px solid #ff6666;color:#ffaaaa;
            border-radius:8px;cursor:pointer;font-family:inherit;">
            🔒 開啟維修模式
          </button>
          <button id="_admin-maint-off" style="flex:1;min-width:140px;padding:11px 20px;font-size:15px;font-weight:800;
            background:rgba(80,255,80,0.2);border:2px solid #66dd66;color:#aaffaa;
            border-radius:8px;cursor:pointer;font-family:inherit;">
            🔓 解除維修模式
          </button>
        </div>
        <div id="_admin-maint-result" style="margin-top:10px;font-size:14px;"></div>
      </div>

      <!-- ★ v1.0.20260428.3750 — GM 公告系統(對所有在線玩家發彈幕/banner/彈窗) -->
      <div id="_admin-gm-section" style="background:rgba(40,30,0,0.4);border:2px solid rgba(255,200,80,0.6);border-radius:10px;padding:16px;margin-bottom:14px;">
        <div style="font-size:18px;font-weight:700;color:#ffcc44;margin-bottom:8px;">📢 0b. GM 公告(對所有在線玩家廣播)</div>
        <div style="font-size:14px;color:#ccc;margin-bottom:10px;line-height:1.55;">
          發送後,所有目前在線的玩家會立即看到。每位玩家對同一公告只會看到一次(用 localStorage 記錄)。
        </div>
        <textarea id="_admin-gm-text" placeholder="公告內容(例:🎉 慶祝開服一週年!登入即送 1000 知識幣!)"
          style="width:100%;min-height:60px;padding:10px;font-size:14px;background:rgba(20,20,30,0.9);
          border:1.5px solid rgba(255,200,80,0.4);color:#fff;border-radius:8px;font-family:inherit;
          box-sizing:border-box;margin-bottom:10px;resize:vertical;"></textarea>
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:8px;">
          <span style="font-size:12px;color:#888;margin-right:4px;">📋 範本:</span>
          <button class="_admin-gm-tmpl-btn" data-tmpl="maint10" type="button" title="維修前 10 分鐘預告" style="padding:5px 11px;font-size:11px;font-weight:700;background:rgba(255,200,80,0.18);border:1.5px solid #ffcc44;color:#ffe8a0;border-radius:5px;cursor:pointer;font-family:inherit;">⏰ 維修預告 10 分</button>
          <button class="_admin-gm-tmpl-btn" data-tmpl="maint5" type="button" title="維修前 5 分鐘預告" style="padding:5px 11px;font-size:11px;font-weight:700;background:rgba(255,160,60,0.2);border:1.5px solid #ff9933;color:#ffd0a0;border-radius:5px;cursor:pointer;font-family:inherit;">⏰ 維修預告 5 分</button>
          <button class="_admin-gm-tmpl-btn" data-tmpl="maintNow" type="button" title="維修開始" style="padding:5px 11px;font-size:11px;font-weight:700;background:rgba(255,100,80,0.2);border:1.5px solid #ff6644;color:#ffccbb;border-radius:5px;cursor:pointer;font-family:inherit;">🔧 維修中</button>
          <button class="_admin-gm-tmpl-btn" data-tmpl="maintDone" type="button" title="維修完成" style="padding:5px 11px;font-size:11px;font-weight:700;background:rgba(120,220,120,0.2);border:1.5px solid #66cc44;color:#aaeeaa;border-radius:5px;cursor:pointer;font-family:inherit;">✅ 維修完成</button>
          <button class="_admin-gm-tmpl-btn" data-tmpl="bug" type="button" title="BUG 異常解鎖回收(老師親自擬的長文)" style="padding:5px 11px;font-size:11px;font-weight:700;background:rgba(255,100,80,0.2);border:1.5px solid #ff8866;color:#ffccbb;border-radius:5px;cursor:pointer;font-family:inherit;">📜 BUG 異常回收</button>
          <button class="_admin-gm-tmpl-btn" data-tmpl="pollutionRecycle" type="button" title="帳號汙染回收溫馨公告(不定期掃描+回收+補償,搭配 🔬 稀有暴增稽核)" style="padding:5px 11px;font-size:11px;font-weight:700;background:rgba(255,150,200,0.2);border:1.5px solid #ff88bb;color:#ffaad0;border-radius:5px;cursor:pointer;font-family:inherit;">💖 汙染回收公告</button>
          <button class="_admin-gm-tmpl-btn" data-tmpl="bugFixed" type="button" title="緊急 BUG 修補完成" style="padding:5px 11px;font-size:11px;font-weight:700;background:rgba(120,200,255,0.2);border:1.5px solid #66aaff;color:#aaccff;border-radius:5px;cursor:pointer;font-family:inherit;">🛠 緊急修補完成</button>
          <button class="_admin-gm-tmpl-btn" data-tmpl="newFeat" type="button" title="新功能上線" style="padding:5px 11px;font-size:11px;font-weight:700;background:rgba(150,200,255,0.2);border:1.5px solid #88aaff;color:#bbccff;border-radius:5px;cursor:pointer;font-family:inherit;">🎉 新功能上線</button>
          <button class="_admin-gm-tmpl-btn" data-tmpl="eventStart" type="button" title="活動開始(雙倍經驗等)" style="padding:5px 11px;font-size:11px;font-weight:700;background:rgba(255,180,80,0.2);border:1.5px solid #ffaa33;color:#ffddaa;border-radius:5px;cursor:pointer;font-family:inherit;">🎊 活動開始</button>
          <button class="_admin-gm-tmpl-btn" data-tmpl="eventEnd" type="button" title="活動最後一天提醒" style="padding:5px 11px;font-size:11px;font-weight:700;background:rgba(255,140,80,0.2);border:1.5px solid #ff9966;color:#ffccaa;border-radius:5px;cursor:pointer;font-family:inherit;">⏳ 活動快結束</button>
          <button class="_admin-gm-tmpl-btn" data-tmpl="reward" type="button" title="全體玩家發補償/獎勵" style="padding:5px 11px;font-size:11px;font-weight:700;background:rgba(150,220,120,0.2);border:1.5px solid #88cc66;color:#bbeeaa;border-radius:5px;cursor:pointer;font-family:inherit;">🎁 全體發獎勵</button>
          <button class="_admin-gm-tmpl-btn" data-tmpl="tip" type="button" title="重要提醒(卡關自救/小撇步)" style="padding:5px 11px;font-size:11px;font-weight:700;background:rgba(200,170,255,0.2);border:1.5px solid #bb99ff;color:#ddccff;border-radius:5px;cursor:pointer;font-family:inherit;">💡 玩法小提醒</button>
          <button class="_admin-gm-tmpl-btn" data-tmpl="report" type="button" title="鼓勵玩家回報 BUG" style="padding:5px 11px;font-size:11px;font-weight:700;background:rgba(180,200,255,0.2);border:1.5px solid #99bbff;color:#ccddff;border-radius:5px;cursor:pointer;font-family:inherit;">📣 回報 BUG 鼓勵</button>
          <button class="_admin-gm-tmpl-btn" data-tmpl="holiday" type="button" title="節慶/長假問候" style="padding:5px 11px;font-size:11px;font-weight:700;background:rgba(255,150,200,0.2);border:1.5px solid #ff88bb;color:#ffaacc;border-radius:5px;cursor:pointer;font-family:inherit;">🎄 節慶問候</button>
          <button class="_admin-gm-tmpl-btn" data-tmpl="exam" type="button" title="期中/期末考前" style="padding:5px 11px;font-size:11px;font-weight:700;background:rgba(200,180,140,0.2);border:1.5px solid #ccaa66;color:#eeddaa;border-radius:5px;cursor:pointer;font-family:inherit;">📚 考試加油</button>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:8px;">
          <label style="font-size:13px;color:#ddd;display:flex;align-items:center;gap:4px;">
            <span>樣式:</span>
            <select id="_admin-gm-type" style="padding:6px 10px;font-size:13px;background:rgba(20,20,30,0.9);border:1.5px solid rgba(255,200,80,0.4);color:#fff;border-radius:6px;font-family:inherit;">
              <option value="marquee">跑馬燈彈幕(從右往左飄)</option>
              <option value="banner">頂部 banner(從上滑下停留)</option>
              <option value="modal">強制彈窗(玩家須點確認)</option>
            </select>
          </label>
          <label style="font-size:13px;color:#ddd;display:flex;align-items:center;gap:4px;">
            <span>顏色:</span>
            <select id="_admin-gm-color" style="padding:6px 10px;font-size:13px;background:rgba(20,20,30,0.9);border:1.5px solid rgba(255,200,80,0.4);color:#fff;border-radius:6px;font-family:inherit;">
              <option value="#ffcc44">🟡 金色(一般公告)</option>
              <option value="#ff6644">🔴 紅色(警告/維護)</option>
              <option value="#88ff88">🟢 綠色(慶祝/活動)</option>
              <option value="#88ccff">🔵 藍色(資訊)</option>
              <option value="#ff88cc">🟣 粉色(節慶)</option>
            </select>
          </label>
          <label style="font-size:13px;color:#ddd;display:flex;align-items:center;gap:4px;">
            <span>持續秒數:</span>
            <input id="_admin-gm-duration" type="number" min="3" max="30" value="8"
              style="width:60px;padding:6px 8px;font-size:13px;background:rgba(20,20,30,0.9);border:1.5px solid rgba(255,200,80,0.4);color:#fff;border-radius:6px;font-family:inherit;">
            <span style="font-size:11px;color:#888;">(modal 樣式無此設定)</span>
          </label>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button id="_admin-gm-preview" style="flex:0 0 auto;padding:10px 18px;font-size:14px;font-weight:700;
            background:rgba(80,140,200,0.25);border:2px solid #88ccff;color:#aaddff;
            border-radius:8px;cursor:pointer;font-family:inherit;">👁 預覽(只你自己看)</button>
          <button id="_admin-gm-send" style="flex:1;min-width:200px;padding:11px 20px;font-size:15px;font-weight:800;
            background:rgba(255,180,40,0.25);border:2px solid #ffcc44;color:#ffe8a0;
            border-radius:8px;cursor:pointer;font-family:inherit;">
            📢 發送給所有玩家
          </button>
        </div>
        <div id="_admin-gm-result" style="margin-top:10px;font-size:14px;"></div>
      </div>

      <div id="_admin-backfill-players-section" style="background:rgba(0,0,0,0.4);border:1px solid rgba(255,200,50,0.3);border-radius:10px;padding:16px;margin-bottom:14px;">
        <div style="font-size:18px;font-weight:700;color:#ffd966;margin-bottom:8px;">📊 1. 回填總玩家數</div>
        <div style="font-size:14px;color:#ccc;margin-bottom:12px;line-height:1.55;">
          掃描 Firestore 的 <code style="color:#88ccff;">/players</code> 集合中所有文件，把總數設定為 <code style="color:#88ccff;">totalPlayers</code>。
          適合計數系統上線前已有玩家的情況（會覆寫現有值為絕對數量）。
        </div>
        <button id="_admin-backfill-players" style="padding:10px 24px;font-size:16px;font-weight:700;
          background:rgba(100,180,100,0.25);border:2px solid #77cc77;color:#aaffaa;
          border-radius:8px;cursor:pointer;font-family:inherit;">
          ▶ 執行回填
        </button>
        <div id="_admin-backfill-result" style="margin-top:10px;font-size:14px;color:#88ff88;"></div>
      </div>

      <div id="_admin-set-players-section" style="background:rgba(0,0,0,0.4);border:1px solid rgba(100,220,255,0.3);border-radius:10px;padding:16px;margin-bottom:14px;">
        <div style="font-size:18px;font-weight:700;color:#88ddff;margin-bottom:8px;">👥 1b. 手動設定總玩家數</div>
        <div style="font-size:14px;color:#ccc;margin-bottom:12px;line-height:1.55;">
          直接設定 <code style="color:#88ccff;">totalPlayers</code> 的絕對值（非累加）。
          適合回填因權限無法掃描 <code style="color:#88ccff;">/players</code> 集合時使用。
        </div>
        <div style="display:flex;gap:10px;align-items:center;">
          <input id="_admin-players-input" type="number" min="0" step="1" placeholder="請輸入玩家總數"
            style="flex:1;padding:10px 14px;font-size:16px;background:rgba(20,20,30,0.9);
            border:2px solid rgba(100,220,255,0.4);color:#fff;border-radius:8px;font-family:inherit;">
          <button id="_admin-set-players" style="padding:10px 20px;font-size:16px;font-weight:700;
            background:rgba(100,180,255,0.2);border:2px solid #77bbff;color:#aaddff;
            border-radius:8px;cursor:pointer;font-family:inherit;white-space:nowrap;">
            ▶ 設定
          </button>
        </div>
        <div id="_admin-players-result" style="margin-top:10px;font-size:14px;color:#88ccff;"></div>
      </div>

      <div id="_admin-set-adv-section" style="background:rgba(0,0,0,0.4);border:1px solid rgba(255,150,200,0.3);border-radius:10px;padding:16px;margin-bottom:22px;">
        <div style="font-size:18px;font-weight:700;color:#ff99cc;margin-bottom:8px;">⚔️ 2. 手動設定累計冒險次數</div>
        <div style="font-size:14px;color:#ccc;margin-bottom:12px;line-height:1.55;">
          直接設定 <code style="color:#88ccff;">totalAdventures</code> 的絕對值（非累加）。
          適合補登過去的冒險次數估計值。
        </div>
        <div style="display:flex;gap:10px;align-items:center;">
          <input id="_admin-adv-input" type="number" min="0" step="1" placeholder="請輸入總次數"
            style="flex:1;padding:10px 14px;font-size:16px;background:rgba(20,20,30,0.9);
            border:2px solid rgba(255,150,200,0.4);color:#fff;border-radius:8px;font-family:inherit;">
          <button id="_admin-set-adventures" style="padding:10px 20px;font-size:16px;font-weight:700;
            background:rgba(255,100,180,0.2);border:2px solid #ff77bb;color:#ffaacc;
            border-radius:8px;cursor:pointer;font-family:inherit;white-space:nowrap;">
            ▶ 設定
          </button>
        </div>
        <div id="_admin-adv-result" style="margin-top:10px;font-size:14px;color:#ff99cc;"></div>
      </div>

      <!-- ★ v3.13.15(2026-06-02) — 鬥技場預設陣容管理(系統 5 套保底敵手) -->
      <!--   功能 A:讀取/編輯/儲存到 Firestore arenaSystemTeams/main -->
      <!--   功能 B:每套可改隊名(走鬥技場專屬詞庫下拉) + 4 個英雄 + 4 個元素 -->
      <!--   功能 C:即時生效(arena.js _arenaApplySystemTeamsFromCloud 寫入記憶體) -->
      <div id="_admin-arena-preset-section" style="background:rgba(40,30,55,0.5);border:2px solid rgba(180,120,255,0.6);border-radius:10px;padding:16px;margin-bottom:22px;">
        <div style="font-size:18px;font-weight:800;color:#cc99ff;margin-bottom:8px;">⚔️ 鬥技場預設陣容管理</div>
        <div style="font-size:13px;color:#ccc;margin-bottom:12px;line-height:1.6;">
          管理鬥技場系統 5 套保底陣容(玩家對戰池子空時用)。玩家看到的隊名前綴是
          <code style="color:#ffcc66;">[鬥技場預設]</code>,代表這是系統陣容。<br>
          <span style="color:#aaa;font-size:12px;">
            雲端儲存於 <code>arenaSystemTeams/main</code>;每次 GM 儲存後立即生效到所有玩家(下次抽取時即套用)。
          </span>
        </div>

        <!-- 載入按鈕 -->
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px;">
          <button id="_admin-arena-load" style="padding:9px 18px;font-size:13px;font-weight:800;
            background:linear-gradient(135deg,#6633aa,#4422aa);border:2px solid #cc99ff;color:#fff;
            border-radius:7px;cursor:pointer;font-family:inherit;">
            📥 從雲端載入(若無則用本機預設)
          </button>
          <button id="_admin-arena-reset" style="padding:9px 16px;font-size:13px;font-weight:700;
            background:rgba(100,40,40,0.4);border:1.5px solid rgba(200,100,100,0.5);color:#ffaaaa;
            border-radius:7px;cursor:pointer;font-family:inherit;">
            🔄 還原為內建預設(5 套經典)
          </button>
          <span id="_admin-arena-status" style="font-size:12px;color:#aaa;"></span>
        </div>

        <!-- 5 套陣容編輯區 -->
        <div id="_admin-arena-editor" style="margin-top:6px;">
          <!-- 動態 render:5 個卡片區塊 -->
        </div>

        <!-- 儲存按鈕 -->
        <div style="margin-top:14px;text-align:center;">
          <button id="_admin-arena-save" style="padding:12px 36px;font-size:16px;font-weight:900;
            background:linear-gradient(135deg,#7755cc,#5533aa);border:2.5px solid #cc99ff;color:#fff;
            border-radius:9px;cursor:pointer;font-family:inherit;letter-spacing:1px;
            box-shadow:0 0 12px rgba(180,120,255,0.4);">
            💾 儲存到雲端(對所有玩家即時生效)
          </button>
        </div>
        <div id="_admin-arena-save-result" style="margin-top:10px;font-size:13px;color:#cc99ff;text-align:center;"></div>
      </div>

      <!-- ★ v3.13.20(2026-06-02) — 鬥技場入口開關(GM 一鍵關閉/開啟全站鬥技場) -->
      <!--   Firestore gameConfig/arenaSwitch { enabled, updatedAt, updatedBy } -->
      <!--   關閉時:首頁按鈕變灰 + 玩家按按鈕會被 _arenaStartFromMenu 擋下提示維修中 -->
      <div id="_admin-arena-switch-section" style="background:rgba(50,20,40,0.5);border:2px solid rgba(255,140,200,0.6);border-radius:10px;padding:16px;margin-bottom:22px;">
        <div style="font-size:18px;font-weight:800;color:#ff99cc;margin-bottom:8px;">⚔ 鬥技場入口開關</div>
        <div style="font-size:13px;color:#ccc;margin-bottom:12px;line-height:1.6;">
          一鍵關閉全站鬥技場(緊急維修、BUG 處理時用)。<br>
          關閉後玩家首頁按鈕變灰、按下會被擋下提示;雲端啟動時拉一次,變更後其他玩家下次按按鈕即生效。<br>
          <span style="color:#aaa;font-size:12px;">
            雲端儲存於 <code>gameConfig/arenaSwitch</code>;預設 enabled=true(雲端查不到也預設開)。
          </span>
        </div>

        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:12px;">
          <button id="_admin-arena-switch-load" style="padding:9px 16px;font-size:13px;font-weight:700;
            background:rgba(180,120,200,0.25);border:1.5px solid rgba(255,150,220,0.5);color:#ffaadd;
            border-radius:6px;cursor:pointer;font-family:inherit;">
            📥 載入目前狀態
          </button>
          <span id="_admin-arena-switch-status" style="font-size:13px;color:#aaa;">尚未載入</span>
        </div>

        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:6px;">
          <button id="_admin-arena-switch-on" style="padding:12px 28px;font-size:15px;font-weight:900;
            background:linear-gradient(135deg,#22aa55,#118844);border:2.5px solid #66dd88;color:#fff;
            border-radius:8px;cursor:pointer;font-family:inherit;letter-spacing:1px;">
            ✅ 開啟鬥技場
          </button>
          <button id="_admin-arena-switch-off" style="padding:12px 28px;font-size:15px;font-weight:900;
            background:linear-gradient(135deg,#aa2244,#882244);border:2.5px solid #ff6688;color:#fff;
            border-radius:8px;cursor:pointer;font-family:inherit;letter-spacing:1px;">
            ⛔ 關閉鬥技場
          </button>
        </div>
        <div id="_admin-arena-switch-result" style="margin-top:10px;font-size:13px;color:#ff99cc;text-align:center;"></div>
      </div>

      <!-- ★ v3.13.74 — 課堂獎勵發放:勾選要發的獎勵(8 項)+ 填數量 → 貼學生名單 → 比對發放 → 記錄到 gmGiftLog -->
      <div id="_admin-classreward-section" style="background:rgba(30,45,30,0.5);border:2px solid rgba(140,220,120,0.6);border-radius:10px;padding:16px;margin-bottom:22px;">
        <div style="font-size:18px;font-weight:800;color:#aaffaa;margin-bottom:8px;">🎁 課堂獎勵發放</div>
        <div style="font-size:13px;color:#ccc;margin-bottom:10px;line-height:1.6;">
          先<b style="color:#ffe066;">勾選要發的獎勵</b>並填數量,再貼上學生(一行一個;支援中文姓名 / 學號 / 班級碼 / uid)。
          系統比對帳號後對每位發放所勾選的獎勵(<b style="color:#9fd6ff;">union 合併,不會降級已有資料</b>),並寫入<b style="color:#ffcc66;">送禮記錄</b>。
          <span style="color:#aaa;font-size:12px;"><b style="color:#ffcc66;">同名多筆者會被列出並跳過</b>,請改用學號 / uid 個別補發,避免 UR 發錯人。</span>
        </div>
        <!-- 勾選獎勵清單 -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:8px 16px;background:rgba(0,0,0,0.28);border:1px solid rgba(140,220,120,0.3);border-radius:8px;padding:12px;margin-bottom:12px;">
          <label style="display:flex;align-items:center;gap:7px;font-size:14px;color:#fff;cursor:pointer;">
            <input type="checkbox" id="_cr-item-clair" checked style="width:17px;height:17px;cursor:pointer;">🌟 UR 藝天使．克雷爾
          </label>
          <label style="display:flex;align-items:center;gap:7px;font-size:14px;color:#fff;cursor:pointer;">
            <input type="checkbox" id="_cr-item-iliya" style="width:17px;height:17px;cursor:pointer;">🗡️ UR 魔劍姬‧伊莉雅
          </label>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#fff;cursor:pointer;">
            <input type="checkbox" id="_cr-item-ssrpick" style="width:17px;height:17px;cursor:pointer;">🌟 SSR 自選召喚卷 ×
            <input type="number" id="_cr-qty-ssrpick" value="1" min="1" max="99" style="width:50px;padding:3px 5px;background:rgba(0,0,0,0.5);border:1px solid rgba(140,220,120,0.4);color:#fff;border-radius:5px;font-family:inherit;">
          </label>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#fff;cursor:pointer;">
            <input type="checkbox" id="_cr-item-srpick" style="width:17px;height:17px;cursor:pointer;">✨ SR 自選召喚卷 ×
            <input type="number" id="_cr-qty-srpick" value="1" min="1" max="99" style="width:50px;padding:3px 5px;background:rgba(0,0,0,0.5);border:1px solid rgba(140,220,120,0.4);color:#fff;border-radius:5px;font-family:inherit;">
          </label>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#fff;cursor:pointer;">
            <input type="checkbox" id="_cr-item-ssrrand" style="width:17px;height:17px;cursor:pointer;">🌈 隨機 SSR 召喚卷 ×
            <input type="number" id="_cr-qty-ssrrand" value="1" min="1" max="99" style="width:50px;padding:3px 5px;background:rgba(0,0,0,0.5);border:1px solid rgba(140,220,120,0.4);color:#fff;border-radius:5px;font-family:inherit;">
          </label>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#fff;cursor:pointer;">
            <input type="checkbox" id="_cr-item-srrand" style="width:17px;height:17px;cursor:pointer;">⭐ 隨機 SR 召喚卷 ×
            <input type="number" id="_cr-qty-srrand" value="1" min="1" max="99" style="width:50px;padding:3px 5px;background:rgba(0,0,0,0.5);border:1px solid rgba(140,220,120,0.4);color:#fff;border-radius:5px;font-family:inherit;">
          </label>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#fff;cursor:pointer;">
            <input type="checkbox" id="_cr-item-crystal" style="width:17px;height:17px;cursor:pointer;">🔮 召喚水晶 ×
            <input type="number" id="_cr-qty-crystal" value="10" min="1" max="99" style="width:50px;padding:3px 5px;background:rgba(0,0,0,0.5);border:1px solid rgba(140,220,120,0.4);color:#fff;border-radius:5px;font-family:inherit;">
          </label>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#fff;cursor:pointer;">
            <input type="checkbox" id="_cr-item-coins" style="width:17px;height:17px;cursor:pointer;">💰 知識幣 ×
            <input type="number" id="_cr-qty-coins" value="100000" min="1" max="9999999" step="1000" style="width:90px;padding:3px 5px;background:rgba(0,0,0,0.5);border:1px solid rgba(140,220,120,0.4);color:#fff;border-radius:5px;font-family:inherit;">
          </label>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#fff;cursor:pointer;">
            <input type="checkbox" id="_cr-item-fruit" style="width:17px;height:17px;cursor:pointer;">🍑 超越極限果實 ×
            <input type="number" id="_cr-qty-fruit" value="1" min="1" max="99" style="width:50px;padding:3px 5px;background:rgba(0,0,0,0.5);border:1px solid rgba(140,220,120,0.4);color:#fff;border-radius:5px;font-family:inherit;">
          </label>
        </div>
        <textarea id="_admin-classreward-names" placeholder="王小明&#10;陳大文&#10;5324蔣同學 ..." style="width:100%;min-height:110px;padding:10px 12px;font-size:14px;background:rgba(0,0,0,0.5);border:1.5px solid rgba(140,220,120,0.4);color:#fff;border-radius:8px;font-family:inherit;line-height:1.6;box-sizing:border-box;resize:vertical;"></textarea>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:10px;">
          <button id="_admin-classreward-preview" style="padding:10px 20px;font-size:14px;font-weight:800;
            background:rgba(120,180,100,0.3);border:1.5px solid rgba(160,230,130,0.6);color:#cfffcf;
            border-radius:7px;cursor:pointer;font-family:inherit;">🔍 比對名單(預覽)</button>
          <button id="_admin-classreward-send" disabled style="padding:10px 22px;font-size:14px;font-weight:900;
            background:linear-gradient(135deg,#2a8a3a,#1d7a2a);border:2px solid #66dd88;color:#fff;
            border-radius:8px;cursor:pointer;font-family:inherit;letter-spacing:1px;opacity:0.5;">🎁 確認發放</button>
        </div>
        <div id="_admin-classreward-result" style="margin-top:12px;font-size:13px;color:#cfe;"></div>
        <!-- 送禮記錄檢視器 -->
        <div style="margin-top:16px;padding-top:12px;border-top:1px dashed rgba(140,220,120,0.35);">
          <button id="_admin-classreward-loglist" style="padding:8px 16px;font-size:13px;font-weight:700;
            background:rgba(90,130,90,0.3);border:1.5px solid rgba(160,230,130,0.45);color:#cfffcf;
            border-radius:6px;cursor:pointer;font-family:inherit;">📜 查看送禮記錄(最近 80 筆)</button>
          <div id="_admin-classreward-log" style="margin-top:10px;font-size:12px;color:#cfe;"></div>
        </div>
      </div>

      <!-- ★ v3.13.72 — 鬥技場「排名發獎」開關(每週排名獎勵自動結算發放的總閘門) -->
      <!--   寫 stats/global.arenaRankRewardEnabled;開啟後玩家登入自動結算上週排名並領獎。 -->
      <!--   排行榜「顯示」隨時可看、不受此旗標影響;此開關只控制「發不發獎」。 -->
      <div id="_admin-arena-rankreward-section" style="background:rgba(40,32,18,0.5);border:2px solid rgba(255,200,100,0.6);border-radius:10px;padding:16px;margin-bottom:22px;">
        <div style="font-size:18px;font-weight:800;color:#ffcc66;margin-bottom:8px;">🏆 鬥技場排名發獎開關</div>
        <div style="font-size:13px;color:#ccc;margin-bottom:12px;line-height:1.6;">
          開啟後,每週一 08:00(台灣)結算上週「鬥技之證」排名,玩家登入時<b style="color:#ffe066;">自動領取</b>對應名次獎勵。<br>
          獎勵階梯(已設定):1 名 💎15/證15/幣30000・2-5 名 💎10/證10/幣20000・6-10 名 💎5/證5/幣10000・11 名以後 💎2/證2/幣5000。<br>
          <span style="color:#aaa;font-size:12px;">雲端儲存於 <code>stats/global.arenaRankRewardEnabled</code>;預設「關」。排行榜顯示不受此開關影響。</span>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:12px;">
          <button id="_admin-arena-rankreward-load" style="padding:9px 16px;font-size:13px;font-weight:700;
            background:rgba(200,160,80,0.25);border:1.5px solid rgba(255,200,100,0.5);color:#ffd88a;
            border-radius:6px;cursor:pointer;font-family:inherit;">📥 載入目前狀態</button>
          <span id="_admin-arena-rankreward-status" style="font-size:13px;color:#aaa;">尚未載入</span>
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:6px;">
          <button id="_admin-arena-rankreward-on" style="padding:12px 28px;font-size:15px;font-weight:900;
            background:linear-gradient(135deg,#22aa55,#118844);border:2.5px solid #66dd88;color:#fff;
            border-radius:8px;cursor:pointer;font-family:inherit;letter-spacing:1px;">✅ 開啟排名發獎</button>
          <button id="_admin-arena-rankreward-off" style="padding:12px 28px;font-size:15px;font-weight:900;
            background:linear-gradient(135deg,#aa2244,#882244);border:2.5px solid #ff6688;color:#fff;
            border-radius:8px;cursor:pointer;font-family:inherit;letter-spacing:1px;">⛔ 關閉排名發獎</button>
        </div>
        <div id="_admin-arena-rankreward-result" style="margin-top:10px;font-size:13px;color:#ffcc66;text-align:center;"></div>
      </div>

      <!-- ★ v3.13.27(2026-06-03) — GitHub 線上版本檢查(老師指示) -->
      <!--   啟動遊戲時自動 fetch GitHub raw 比對 4 個檔案版本(boot 8 秒後跑) -->
      <!--   這個 section 提供 GM 手動重跑入口,以及顯示最近一次檢查結果 -->
      <div id="_admin-github-check-section" style="background:rgba(20,40,50,0.5);border:2px solid rgba(100,200,255,0.6);border-radius:10px;padding:16px;margin-bottom:22px;">
        <div style="font-size:18px;font-weight:800;color:#88ccff;margin-bottom:8px;">🌐 GitHub 線上版本檢查</div>
        <div style="font-size:13px;color:#ccc;margin-bottom:12px;line-height:1.6;">
          檢查玩家瀏覽器吃到的檔案版本 vs 老師最新上傳到 GitHub 的版本是否一致。<br>
          啟動遊戲時會自動跑一次(boot 8 秒後),5 分鐘內不重複跑(防 GitHub rate limit)。<br>
          <span style="color:#aaa;font-size:12px;">
            檢查 4 個檔案:index.html / admin_panel.js / arena.js / game_changelog.js<br>
            版本不對齊時,GM 才會看到右下角紅色 toast(學生看不到任何 UI 干擾)
          </span>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px;">
          <button id="_admin-github-check-now" style="padding:9px 18px;font-size:13px;font-weight:800;
            background:linear-gradient(135deg,#225577,#114466);border:2px solid #88ccff;color:#fff;
            border-radius:7px;cursor:pointer;font-family:inherit;">
            🔄 立即重新檢查(繞過 5 分鐘冷卻)
          </button>
          <button id="_admin-github-check-show" style="padding:9px 14px;font-size:13px;font-weight:700;
            background:rgba(100,180,220,0.2);border:1.5px solid rgba(150,200,255,0.5);color:#aaccff;
            border-radius:6px;cursor:pointer;font-family:inherit;">
            👁 顯示上次檢查結果
          </button>
        </div>
        <div id="_admin-github-check-result" style="margin-top:6px;padding:10px;background:rgba(0,0,0,0.35);
          border:1px solid rgba(100,200,255,0.3);border-radius:6px;font-size:12px;color:#aaccff;
          line-height:1.7;white-space:pre-wrap;font-family:'M PLUS Rounded 1c',sans-serif;min-height:30px;">
          <span style="color:#888;">尚未執行;按上面按鈕重新檢查,或等待遊戲啟動 8 秒後自動執行。</span>
        </div>
      </div>

      <!-- ★ v3.13.27(2026-06-03) — 龍王 HP 救援(老師指示) -->
      <!--   用途:被 BUG 秒殺的龍王,GM 可以恢復他被秒殺前的血量 -->
      <!--   寫入 stats/global.worldBossHp,所有玩家 30 秒內自動同步 -->
      <div id="_admin-wb-rescue-section" style="background:rgba(55,25,15,0.55);border:2px solid rgba(255,140,80,0.7);border-radius:10px;padding:16px;margin-bottom:22px;">
        <div style="font-size:18px;font-weight:800;color:#ffaa66;margin-bottom:8px;">🐉 龍王 HP 救援(被 BUG 秒殺後恢復血量)</div>
        <div style="font-size:13px;color:#ccc;margin-bottom:12px;line-height:1.6;">
          當龍王被 BUG / 異常傷害秒殺,可以在這裡恢復血量。<br>
          設定後寫入雲端 <code style="color:#aaccff;">stats/global.worldBossHp</code>,所有玩家 30 秒內自動同步看到新血量。<br>
          <span style="color:#9fe0a0;font-size:12px;">
            ✅ v3.13.28:還血(HP&gt;0)時會自動把「倒下時間戳 + 該輪 roundKey」一併清掉 →
            被 BUG 打死的這一輪當沒發生過,獎勵<b>不會提前用髒排行榜結算</b>,改等龍王「下次真正倒下」後隔天 08:00 才結算。
          </span><br>
          <span style="color:#aaa;font-size:12px;">
            💡 建議先到「⚔ 鬥技場戰鬥記錄審核」找出 BUG 傷害的場次並刪除,再回來這裡還血。<br>
            🔒 滿血 = 5,000,000(5 百萬);單次扣血上限 5,000;單場上限 100,000。
          </span>
        </div>
        <div id="_admin-wb-rescue-status" style="padding:10px 14px;background:rgba(0,0,0,0.4);border-radius:8px;
          margin-bottom:12px;font-size:13px;color:#ffe0a0;font-weight:700;">
          📡 載入中…
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px;">
          <label style="font-size:13px;color:#ccc;font-weight:700;">目標 HP:</label>
          <input id="_admin-wb-rescue-input" type="number" placeholder="例:5000000(滿血)" min="0" max="5000000"
            style="padding:8px 12px;font-size:14px;background:rgba(20,20,30,0.9);
            border:1.5px solid rgba(255,180,80,0.5);color:#fff;border-radius:6px;font-family:inherit;
            width:200px;">
          <button id="_admin-wb-rescue-write" style="padding:9px 20px;font-size:14px;font-weight:800;
            background:linear-gradient(135deg,#cc4422,#882211);border:2px solid #ff6644;color:#fff;
            border-radius:7px;cursor:pointer;font-family:inherit;">
            💉 寫入指定 HP
          </button>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:10px;">
          <span style="font-size:12px;color:#aaa;font-weight:700;">快捷:</span>
          <button class="_admin-wb-rescue-preset" data-hp="5000000" style="padding:7px 14px;font-size:12px;font-weight:700;
            background:rgba(255,200,80,0.2);border:1.5px solid #ffcc66;color:#ffd88a;
            border-radius:5px;cursor:pointer;font-family:inherit;">
            ❤️ 滿血(5,000,000)
          </button>
          <button class="_admin-wb-rescue-preset" data-hp="3750000" style="padding:7px 14px;font-size:12px;font-weight:700;
            background:rgba(180,220,100,0.18);border:1.5px solid #aacc66;color:#cce0a0;
            border-radius:5px;cursor:pointer;font-family:inherit;">
            🟢 75%(3,750,000)
          </button>
          <button class="_admin-wb-rescue-preset" data-hp="2500000" style="padding:7px 14px;font-size:12px;font-weight:700;
            background:rgba(180,180,80,0.18);border:1.5px solid #cccc66;color:#dddd88;
            border-radius:5px;cursor:pointer;font-family:inherit;">
            🟡 50%(2,500,000)
          </button>
          <button class="_admin-wb-rescue-preset" data-hp="1250000" style="padding:7px 14px;font-size:12px;font-weight:700;
            background:rgba(255,140,80,0.18);border:1.5px solid #ff9966;color:#ffbb88;
            border-radius:5px;cursor:pointer;font-family:inherit;">
            🟠 25%(1,250,000)
          </button>
          <button class="_admin-wb-rescue-preset" data-hp="500000" style="padding:7px 14px;font-size:12px;font-weight:700;
            background:rgba(255,80,80,0.18);border:1.5px solid #ff6666;color:#ff9999;
            border-radius:5px;cursor:pointer;font-family:inherit;">
            🔴 10%(500,000)
          </button>
          <button id="_admin-wb-rescue-refresh" style="padding:7px 14px;font-size:12px;font-weight:700;
            background:rgba(100,180,220,0.18);border:1.5px solid #66aaff;color:#aaccff;
            border-radius:5px;cursor:pointer;font-family:inherit;">
            🔄 重讀當前 HP
          </button>
        </div>
        <div id="_admin-wb-rescue-result" style="margin-top:10px;padding:8px 12px;font-size:13px;text-align:center;
          background:rgba(0,0,0,0.3);border-radius:6px;color:#ffcc88;min-height:18px;"></div>
      </div>

      <!-- ★ v3.13.20(2026-06-02) — 鬥技場戰鬥記錄審核(GM 異常傷害偵測) -->
      <!--   讀 Firestore arenaBattles collection 最近 N 筆,排序顯示「平均單回合傷害」 -->
      <!--   功能:排序、篩玩家、刪除單筆異常記錄、清空所有/指定玩家 -->
      <!-- ★ v3.13.31(2026-06-03) — 新增「刪除+補償 1 張入場券」原子動作(老師需求 #4) -->
      <div id="_admin-arena-battles-section" style="background:rgba(40,30,55,0.5);border:2px solid rgba(255,180,80,0.6);border-radius:10px;padding:16px;margin-bottom:22px;">
        <div style="font-size:18px;font-weight:800;color:#ffcc66;margin-bottom:8px;">⚔ 鬥技場戰鬥記錄審核</div>
        <div style="font-size:13px;color:#ccc;margin-bottom:12px;line-height:1.6;">
          列出最近的鬥技場戰鬥記錄,按「平均單回合傷害」排序,異常高的(&gt; 800/回合)會被標紅。<br>
          <b style="color:#ffaa66;">🎫 刪除+補償 1 券:</b>判定為 BUG 異常戰鬥時用 — 刪除記錄 + 補償 1 張鬥技場入場券。<br>
          <b style="color:#ffaaaa;">🗑️ 純刪除:</b>單純刪除記錄,不補償(極端作弊行為使用)。<br>
          <span style="color:#aaa;font-size:12px;">
            雲端儲存於 <code>arenaBattles/{uid_ts}</code>;每場結算後上傳。
            排行榜由此 collection 即時聚合,刪除記錄 = 該玩家的鬥技之證從排行榜減去
            (勝 -3 / 平 -2 / 敗 -1)。<br>
            入場券寫到 <code>players/{uid}.playerBackpack.arena_entry_ticket</code>(上限 5 張)。
            週一 08:00 結算前 GM 可自由處理 BUG 異常戰鬥,玩家側使用入場券下版本實作。
          </span>
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px;">
          <button id="_admin-arena-battles-load" style="padding:9px 16px;font-size:13px;font-weight:700;
            background:rgba(255,180,80,0.25);border:1.5px solid #ffcc66;color:#ffe0a0;
            border-radius:6px;cursor:pointer;font-family:inherit;">
            📥 載入最近 500 筆
          </button>
          <label style="font-size:13px;color:#ccc;">
            排序:
            <select id="_admin-arena-battles-sort" style="padding:5px 8px;font-size:13px;background:rgba(20,20,30,0.9);
              border:1.5px solid rgba(255,180,80,0.4);color:#fff;border-radius:5px;font-family:inherit;">
              <option value="avg_desc">平均單回合傷害(高 → 低)</option>
              <option value="avg_asc">平均單回合傷害(低 → 高)</option>
              <option value="total_desc">總傷害(高 → 低)</option>
              <option value="ts_desc">時間(新 → 舊)</option>
              <option value="rounds_asc">回合數(少 → 多)</option>
            </select>
          </label>
          <input id="_admin-arena-battles-filter" type="text" placeholder="篩玩家(uid/姓名/座號)"
            style="flex:1;min-width:140px;padding:6px 10px;font-size:13px;background:rgba(20,20,30,0.9);
            border:1.5px solid rgba(255,180,80,0.4);color:#fff;border-radius:5px;font-family:inherit;">
          <span id="_admin-arena-battles-count" style="font-size:12px;color:#aaa;"></span>
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
          <button id="_admin-arena-battles-clear-all" style="padding:7px 14px;font-size:12px;font-weight:700;
            background:rgba(200,60,60,0.3);border:1.5px solid #cc6666;color:#ffaaaa;
            border-radius:5px;cursor:pointer;font-family:inherit;">
            🗑️ 清空全部記錄(危險)
          </button>
          <button id="_admin-arena-battles-clear-old" style="padding:7px 14px;font-size:12px;font-weight:700;
            background:rgba(120,80,80,0.3);border:1.5px solid #aa7777;color:#ddbbbb;
            border-radius:5px;cursor:pointer;font-family:inherit;">
            🧹 清除 30 天前的舊記錄
          </button>
        </div>

        <div id="_admin-arena-battles-list" style="max-height:480px;overflow-y:auto;
          background:rgba(0,0,0,0.4);border:1px solid rgba(255,180,80,0.3);border-radius:6px;
          padding:8px;font-size:12px;color:#ccc;line-height:1.7;">
          <div style="color:#888;padding:14px;text-align:center;">尚未載入,請按「📥 載入最近 500 筆」</div>
        </div>
        <div id="_admin-arena-battles-result" style="margin-top:10px;font-size:13px;color:#ffcc66;text-align:center;"></div>
      </div>

      <div id="_admin-rescue-section" style="background:rgba(40,20,50,0.4);border:2px solid rgba(200,120,255,0.5);border-radius:10px;padding:16px;margin-bottom:22px;">
        <div style="font-size:18px;font-weight:700;color:#cc99ff;margin-bottom:8px;">🚑 3. 玩家資料急救工具</div>
        <div style="font-size:13px;color:#ccc;margin-bottom:12px;line-height:1.55;">
          用於救援被 1.0.20260419.1930 之前 bug 誤清空的玩家資料。輸入受害玩家 uid,診斷殘存資料後可自訂補償。<br>
          <span style="color:#cc99ff;">留空 uid 欄位會預設套用<b>目前登入帳號</b>(也就是你自己)。</span>
        </div>

        <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap;">
          <input id="_admin-rescue-uid" type="text" placeholder="玩家 uid (留空=自己)"
            style="flex:1;min-width:160px;padding:8px 12px;font-size:13px;background:rgba(20,20,30,0.9);
            border:1.5px solid rgba(200,120,255,0.4);color:#fff;border-radius:6px;font-family:monospace;">
          <button id="_admin-rescue-diagnose" style="padding:8px 18px;font-size:14px;font-weight:700;
            background:rgba(180,120,255,0.2);border:2px solid #aa88ff;color:#ddaaff;
            border-radius:6px;cursor:pointer;font-family:inherit;white-space:nowrap;">
            🔍 診斷
          </button>
        </div>

        <div id="_admin-rescue-diag" style="font-size:13px;color:#ccc;margin-bottom:10px;padding:10px;background:rgba(0,0,0,0.4);border-radius:6px;display:none;line-height:1.7;"></div>

        <div id="_admin-rescue-form" style="display:none;background:rgba(80,40,120,0.2);border:1px dashed rgba(200,120,255,0.4);border-radius:8px;padding:12px;margin-bottom:10px;">
          <div style="font-size:14px;font-weight:700;color:#ddaaff;margin-bottom:10px;">補償參數(可調整後再送出):</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
            <label style="font-size:13px;color:#ccc;">補償知識幣
              <input id="_admin-rescue-coins" type="number" min="0" value="10000"
                style="width:100%;padding:6px 10px;margin-top:4px;background:rgba(20,20,30,0.9);border:1px solid rgba(200,120,255,0.4);color:#fff;border-radius:4px;font-family:inherit;">
            </label>
            <label style="font-size:13px;color:#ccc;">英雄預設等級(每位)
              <input id="_admin-rescue-hero-lv" type="number" min="0" max="10" value="5"
                style="width:100%;padding:6px 10px;margin-top:4px;background:rgba(20,20,30,0.9);border:1px solid rgba(200,120,255,0.4);color:#fff;border-radius:4px;font-family:inherit;">
            </label>
            <label style="font-size:13px;color:#ccc;">經驗之書
              <input id="_admin-rescue-exp-book" type="number" min="0" max="99" value="30"
                style="width:100%;padding:6px 10px;margin-top:4px;background:rgba(20,20,30,0.9);border:1px solid rgba(200,120,255,0.4);color:#fff;border-radius:4px;font-family:inherit;">
            </label>
            <label style="font-size:13px;color:#ccc;">技能升級書
              <input id="_admin-rescue-skill-book" type="number" min="0" max="99" value="15"
                style="width:100%;padding:6px 10px;margin-top:4px;background:rgba(20,20,30,0.9);border:1px solid rgba(200,120,255,0.4);color:#fff;border-radius:4px;font-family:inherit;">
            </label>
            <label style="font-size:13px;color:#ccc;">素質之書
              <input id="_admin-rescue-stat-book" type="number" min="0" max="99" value="5"
                style="width:100%;padding:6px 10px;margin-top:4px;background:rgba(20,20,30,0.9);border:1px solid rgba(200,120,255,0.4);color:#fff;border-radius:4px;font-family:inherit;">
            </label>
            <label style="font-size:13px;color:#ccc;">極限爆發之果
              <input id="_admin-rescue-burst-book" type="number" min="0" max="99" value="3"
                style="width:100%;padding:6px 10px;margin-top:4px;background:rgba(20,20,30,0.9);border:1px solid rgba(200,120,255,0.4);color:#fff;border-radius:4px;font-family:inherit;">
            </label>
          </div>
          <button id="_admin-rescue-apply" style="width:100%;padding:11px;font-size:15px;font-weight:800;
            background:rgba(200,120,255,0.3);border:2px solid #cc99ff;color:#eebbff;
            border-radius:8px;cursor:pointer;font-family:inherit;">
            🚑 執行還原(保留已有 representativeHero / unlockedHeroes / medals)
          </button>
        </div>

        <div id="_admin-rescue-result" style="margin-top:8px;font-size:13px;color:#ddaaff;"></div>
      </div>

      <!-- ★ v1.0.20260511.6100 — 學生補償工具(進階版) -->
      <!--
        放在 3 號急救工具之後、4 號測試工具之前,因為它跟急救同類別。
        為避免改動老師熟悉的編號,新區塊編為 3.5(不擠到後面的 4/5)。
        關鍵差異 vs 3 號:
          - 支援用 email 直接查學生 (3 號只能輸 uid)
          - 可手動指定要補的角色 + 各自等級 (老師憑學生回憶)
          - 採「保留現有資料再覇上去」策略 (3 號是還原式,清空後重建)
          - 自動記錄補償次數 + 歷史 (寫 _compensationHistory 欄位)
      -->
      <div id="_admin-comp-section" style="background:rgba(50,30,20,0.45);border:2px solid rgba(255,180,100,0.6);border-radius:10px;padding:16px;margin-bottom:22px;">
        <div style="font-size:18px;font-weight:700;color:#ffbb66;margin-bottom:8px;">🎁 3.5 學生補償工具(指定信箱)</div>
        <div style="font-size:13px;color:#ccc;margin-bottom:12px;line-height:1.55;">
          憑學生回憶補發角色與資源。<b style="color:#ffcc88;">保留現有資料再加上去</b>(取最大值合併),不會弄丟任何已有的角色或進度。<br>
          <span style="color:#ffaa66;">⚠ 每次補償會自動記錄次數與時間,避免被同學重複申請。</span>
        </div>

        <!-- 學生查詢區塊 -->
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap;">
          <input id="_admin-comp-email" type="text" placeholder="學生 email (如 lsps110176@stu.lsps.tp.edu.tw)"
            style="flex:2;min-width:200px;padding:8px 12px;font-size:13px;background:rgba(20,20,30,0.9);
            border:1.5px solid rgba(255,180,100,0.4);color:#fff;border-radius:6px;font-family:monospace;">
          <span style="color:#888;font-size:12px;">或</span>
          <input id="_admin-comp-uid" type="text" placeholder="直接輸入 uid"
            style="flex:1.3;min-width:160px;padding:8px 12px;font-size:13px;background:rgba(20,20,30,0.9);
            border:1.5px solid rgba(255,180,100,0.4);color:#fff;border-radius:6px;font-family:monospace;">
          <button id="_admin-comp-find" style="padding:8px 18px;font-size:14px;font-weight:700;
            background:rgba(255,180,100,0.2);border:2px solid #ffaa66;color:#ffcc88;
            border-radius:6px;cursor:pointer;font-family:inherit;white-space:nowrap;">
            🔍 查找學生
          </button>
        </div>

        <!-- 查詢結果顯示 -->
        <div id="_admin-comp-info" style="font-size:13px;color:#ccc;margin-bottom:10px;padding:10px;background:rgba(0,0,0,0.4);border-radius:6px;display:none;line-height:1.7;"></div>

        <!-- 補償面板(查到玩家後展開) -->
        <div id="_admin-comp-form" style="display:none;background:rgba(80,50,30,0.25);border:1px dashed rgba(255,180,100,0.45);border-radius:8px;padding:14px;margin-bottom:10px;">

          <!-- 角色補償 -->
          <div style="margin-bottom:14px;">
            <div style="font-size:14px;font-weight:700;color:#ffcc88;margin-bottom:6px;">
              🦸 補發角色(學生說有哪些就填哪些,等級依學生回憶)
            </div>
            <div style="display:flex;gap:8px;align-items:flex-end;margin-bottom:8px;flex-wrap:wrap;">
              <label style="font-size:12px;color:#ccc;flex:2;min-width:160px;">選角色
                <select id="_admin-comp-hero-select"
                  style="width:100%;padding:6px 8px;margin-top:4px;background:rgba(20,20,30,0.9);
                  border:1px solid rgba(255,180,100,0.4);color:#fff;border-radius:4px;font-family:inherit;font-size:13px;">
                  <option value="">-- 選擇英雄 --</option>
                </select>
              </label>
              <label style="font-size:12px;color:#ccc;width:100px;">等級 (1-50)
                <input id="_admin-comp-hero-lv" type="number" min="1" max="50" value="10"
                  style="width:100%;padding:6px 8px;margin-top:4px;background:rgba(20,20,30,0.9);border:1px solid rgba(255,180,100,0.4);color:#fff;border-radius:4px;font-family:inherit;box-sizing:border-box;">
              </label>
              <button id="_admin-comp-hero-add" style="padding:8px 16px;font-size:13px;font-weight:700;
                background:rgba(100,200,150,0.25);border:2px solid #66cc99;color:#aaffcc;
                border-radius:6px;cursor:pointer;font-family:inherit;white-space:nowrap;">
                + 加入清單
              </button>
            </div>
            <div id="_admin-comp-hero-list" style="margin-top:8px;padding:8px;background:rgba(0,0,0,0.3);border-radius:6px;min-height:40px;font-size:13px;color:#bbb;">
              <span style="color:#666;font-style:italic;">尚未加入任何角色</span>
            </div>
          </div>

          <!-- 資源補償 -->
          <div style="margin-bottom:14px;border-top:1px dashed rgba(255,180,100,0.3);padding-top:12px;">
            <div style="font-size:14px;font-weight:700;color:#ffcc88;margin-bottom:8px;">
              💰 補發資源 (數量 = 在現有基礎上 +N)
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              <label style="font-size:13px;color:#ccc;">知識幣 (+N)
                <input id="_admin-comp-coins" type="number" min="0" value="0" placeholder="0=不補"
                  style="width:100%;padding:6px 10px;margin-top:4px;background:rgba(20,20,30,0.9);border:1px solid rgba(255,180,100,0.4);color:#fff;border-radius:4px;font-family:inherit;box-sizing:border-box;">
              </label>
              <label style="font-size:13px;color:#ccc;">經驗之書 (+N, 上限 99)
                <input id="_admin-comp-exp-book" type="number" min="0" max="99" value="0"
                  style="width:100%;padding:6px 10px;margin-top:4px;background:rgba(20,20,30,0.9);border:1px solid rgba(255,180,100,0.4);color:#fff;border-radius:4px;font-family:inherit;box-sizing:border-box;">
              </label>
              <label style="font-size:13px;color:#ccc;">技能升級書 (+N)
                <input id="_admin-comp-skill-book" type="number" min="0" max="99" value="0"
                  style="width:100%;padding:6px 10px;margin-top:4px;background:rgba(20,20,30,0.9);border:1px solid rgba(255,180,100,0.4);color:#fff;border-radius:4px;font-family:inherit;box-sizing:border-box;">
              </label>
              <label style="font-size:13px;color:#ccc;">素質重置書 (+N)
                <input id="_admin-comp-stat-book" type="number" min="0" max="99" value="0"
                  style="width:100%;padding:6px 10px;margin-top:4px;background:rgba(20,20,30,0.9);border:1px solid rgba(255,180,100,0.4);color:#fff;border-radius:4px;font-family:inherit;box-sizing:border-box;">
              </label>
              <label style="font-size:13px;color:#ccc;">極限爆發果實 (+N)
                <input id="_admin-comp-burst-fruit" type="number" min="0" max="99" value="0"
                  style="width:100%;padding:6px 10px;margin-top:4px;background:rgba(20,20,30,0.9);border:1px solid rgba(255,180,100,0.4);color:#fff;border-radius:4px;font-family:inherit;box-sizing:border-box;">
              </label>
              <label style="font-size:13px;color:#ccc;">爆發重置秘藥 (+N)
                <input id="_admin-comp-burst-reset" type="number" min="0" max="99" value="0"
                  style="width:100%;padding:6px 10px;margin-top:4px;background:rgba(20,20,30,0.9);border:1px solid rgba(255,180,100,0.4);color:#fff;border-radius:4px;font-family:inherit;box-sizing:border-box;">
              </label>
            </div>
            <div style="font-size:11px;color:#888;margin-top:6px;line-height:1.5;">
              💡 升級素質點數會依英雄等級自動補發(每升 1 級 = 1 點),不需要手動填。
            </div>
          </div>

          <!-- 補償原因(稽核用) -->
          <div style="margin-bottom:12px;border-top:1px dashed rgba(255,180,100,0.3);padding-top:12px;">
            <label style="font-size:13px;color:#ccc;">📝 補償原因(稽核紀錄,必填)
              <input id="_admin-comp-reason" type="text" placeholder="例:雲端資料異常導致角色遺失,憑回憶補發"
                style="width:100%;padding:8px 10px;margin-top:4px;background:rgba(20,20,30,0.9);
                border:1px solid rgba(255,180,100,0.4);color:#fff;border-radius:4px;font-family:inherit;box-sizing:border-box;">
            </label>
          </div>

          <!-- 執行按鈕 -->
          <button id="_admin-comp-apply" style="width:100%;padding:12px;font-size:15px;font-weight:800;
            background:rgba(255,180,100,0.3);border:2px solid #ffaa66;color:#ffddaa;
            border-radius:8px;cursor:pointer;font-family:inherit;">
            🎁 執行補償(保留現有資料,僅加上去)
          </button>
        </div>

        <div id="_admin-comp-result" style="margin-top:8px;font-size:13px;color:#ffcc88;line-height:1.6;"></div>
      </div>

      <!-- ★ v3.10.2(2026-05-26) — 設計師英雄一鍵補發 -->
      <!--
        老師需求(2026-05-26):管理員可一鍵補發所有「應該拿到但實際沒有」設計師英雄
        略過判定(同時滿足才略過):
          ① unlockedHeroes 已含設計者英雄
          ② 任一槽位的 heroLevels[hero] >= 2,或 lv=1 且 heroExp > 0(已開始培養)
        補發判定:沒英雄,或有英雄但 lv=1 且 exp=0(代表沒在用)
        從未登入:無法補(沒 player 文件),學生首次登入後 _grantStudentDesignerHero 會接手
      -->
      <div id="_admin-designer-grant-section" style="background:rgba(40,30,60,0.5);border:2px solid rgba(180,140,255,0.65);border-radius:10px;padding:16px;margin-bottom:22px;">
        <div style="font-size:18px;font-weight:700;color:#c8a8ff;margin-bottom:8px;">🎨 3.6 設計師英雄一鍵補發</div>
        <div style="font-size:13px;color:#ccc;margin-bottom:12px;line-height:1.55;">
          掃描所有 <b style="color:#ffcc88;">STUDENT_DESIGNER_HEROES</b> 名冊中的設計師,
          自動補發「沒有英雄」或「有英雄但從沒培養過」的學生。<br>
          <b style="color:#aaffcc;">已收到且開始培養(任一槽 Lv≥2 或 Lv1 + exp&gt;0)的學生會自動略過</b>,
          不會重複發、也不會降低已有等級。<br>
          <span style="color:#ffaa88;">⚠ 建議先點「📝 預覽會補誰」確認,再點「🎁 實際補發」執行。</span>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;">
          <button id="_admin-designer-grant-preview" style="flex:1;min-width:160px;padding:11px;font-size:14px;font-weight:700;
            background:rgba(180,140,255,0.18);border:2px solid #c8a8ff;color:#dcc8ff;
            border-radius:6px;cursor:pointer;font-family:inherit;">
            📝 預覽會補誰(不寫入)
          </button>
          <button id="_admin-designer-grant-apply" style="flex:1;min-width:160px;padding:11px;font-size:14px;font-weight:800;
            background:linear-gradient(135deg,rgba(180,140,255,0.35),rgba(140,100,220,0.35));
            border:2px solid #c8a8ff;color:#e8d8ff;
            border-radius:6px;cursor:pointer;font-family:inherit;
            box-shadow:0 0 14px rgba(180,140,255,0.3);">
            🎁 實際補發(寫入雲端)
          </button>
        </div>
        <div id="_admin-designer-grant-result" style="font-size:13px;color:#ddd;line-height:1.65;padding:10px;
          background:rgba(0,0,0,0.4);border-radius:6px;display:none;max-height:300px;overflow-y:auto;"></div>
      </div>

      <!-- ★ v3.10.3(2026-05-26) — 撤銷學生「裝置信任」 -->
      <!--
        用途:某學生反映「公用平板被勾了信任,要清掉」、或學生裝置遺失/借走時用。
        撤銷後該學生所有信任裝置失效,下次任何裝置都要重新登入。
      -->
      <div id="_admin-trust-revoke-section" style="background:rgba(30,40,60,0.5);border:2px solid rgba(120,180,255,0.65);border-radius:10px;padding:16px;margin-bottom:22px;">
        <div style="font-size:18px;font-weight:700;color:#88bbff;margin-bottom:8px;">🔐 3.7 撤銷學生「裝置信任」</div>
        <div style="font-size:13px;color:#ccc;margin-bottom:12px;line-height:1.55;">
          當學生反映「公用平板自動進到我的帳號」或「裝置遺失/借走」時,用此工具清空該學生<b style="color:#ffcc88;">所有已信任的裝置</b>。<br>
          撤銷後該學生在任何裝置都要重新登入。<span style="color:#aaffcc;">不影響玩家本人或帳號資料,只清「信任名單」。</span><br>
          <span style="color:#888;font-size:12px;">學生本人也可在 PWA 首頁右下角點「已信任此裝置」自行取消(只清那一台)。</span>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;">
          <input id="_admin-trust-email" type="text" placeholder="學生 email (如 lsps110176@stu.lsps.tp.edu.tw)"
            style="flex:1;min-width:240px;padding:8px 12px;font-size:13px;background:rgba(20,20,30,0.9);
            border:1.5px solid rgba(120,180,255,0.5);color:#fff;border-radius:6px;font-family:monospace;">
          <button id="_admin-trust-check" style="padding:8px 16px;font-size:13px;font-weight:700;
            background:rgba(120,180,255,0.2);border:2px solid #88bbff;color:#aaccff;
            border-radius:6px;cursor:pointer;font-family:inherit;white-space:nowrap;">
            🔍 查信任裝置
          </button>
          <button id="_admin-trust-revoke" style="padding:8px 16px;font-size:13px;font-weight:800;
            background:rgba(255,150,150,0.2);border:2px solid #ff8888;color:#ffaaaa;
            border-radius:6px;cursor:pointer;font-family:inherit;white-space:nowrap;">
            ❌ 撤銷全部
          </button>
        </div>
        <div id="_admin-trust-result" style="font-size:13px;color:#ddd;line-height:1.65;padding:10px;
          background:rgba(0,0,0,0.4);border-radius:6px;display:none;max-height:200px;overflow-y:auto;"></div>
      </div>

      <!-- ★ v3.13.39(2026-06-04) — 帳號汙染掃描:暴增 SSR 收回(老師指定) -->
      <div id="_admin-inflated-section" style="background:rgba(45,20,40,0.55);border:2px solid rgba(255,120,180,0.6);border-radius:10px;padding:16px;margin-bottom:22px;">
        <div style="font-size:18px;font-weight:800;color:#ff99cc;margin-bottom:8px;">🧹 帳號汙染掃描(暴增 SSR 收回)</div>
        <div style="font-size:13px;color:#ffd6e8;margin-bottom:12px;line-height:1.65;">
          掃描全校玩家,找出「<b>因共用平板被上一位學生汙染、瞬間多出一大票 SSR</b>」的帳號。<br>
          判定:roster 內的 SSR 之中「<b>查無合法解鎖紀錄</b>」(跨帳號 union 不會留下解鎖事件)的數量 ≥ 門檻。<br>
          <span style="color:#ffcc88;">⚠ 這是啟發式偵測:v3.11.10 之前解鎖的舊 SSR 也可能無紀錄而被列入。<b>收回前請務必看英雄名單確認</b>(你最清楚那位學生本來有沒有這些 SSR)。</span><br>
          <span style="color:#aaffcc;">收回會清掉那些英雄並寫反污染信號,學生下次開遊戲會自動以雲端為準、清掉本地殘留。</span>
        </div>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap;">
          <label style="font-size:13px;color:#ffd6e8;">疑似 SSR ≥
            <input id="_admin-inflated-threshold" type="number" min="1" max="40" value="5"
              style="width:64px;padding:6px 8px;margin-left:4px;background:rgba(20,20,30,0.9);border:1.5px solid rgba(255,120,180,0.5);color:#fff;border-radius:6px;font-family:inherit;">
          </label>
          <button id="_admin-inflated-scan" style="padding:8px 20px;font-size:14px;font-weight:800;
            background:linear-gradient(135deg,#cc4488,#992266);border:2px solid #ff77bb;color:#fff;
            border-radius:8px;cursor:pointer;font-family:inherit;white-space:nowrap;box-shadow:0 0 12px rgba(255,120,180,0.3);">
            🔍 掃描全校
          </button>
          <span id="_admin-inflated-status" style="font-size:12px;color:#ccc;"></span>
        </div>
        <div id="_admin-inflated-result" style="margin-top:6px;font-size:13px;color:#ffd6e8;line-height:1.6;max-height:560px;overflow-y:auto;"></div>
      </div>

      <!-- ★ v3.13.41(2026-06-04) — 稀有暴增稽核:SSR+SR、分四類來源、逐隻勾選收回(老師指定強化版) -->
      <div id="_admin-rare-audit-section" style="background:rgba(30,18,48,0.6);border:2px solid rgba(180,140,255,0.6);border-radius:10px;padding:16px;margin-bottom:22px;">
        <div style="font-size:18px;font-weight:800;color:#cbb3ff;margin-bottom:8px;">🔬 稀有暴增稽核(SSR / SR・分來源・逐隻勾選收回)</div>
        <div style="font-size:13px;color:#e6dcff;margin-bottom:12px;line-height:1.65;">
          掃描全校玩家,找出「<b>一天內暴增 SSR / SR</b>」的帳號,並把每隻稀有英雄依<b>獲得方式</b>分四類:<br>
          <span style="color:#ff9a9a;">🟥 不明汙染</span>(roster 內有、查無任何解鎖紀錄 → 跨帳號汙染指紋) ・
          <span style="color:#ffd27a;">🟧 BOSS 解鎖</span> ・
          <span style="color:#9ad0ff;">🟦 召喚</span> ・
          <span style="color:#9af0b0;">🟩 GM 補償</span> ・
          <span style="color:#cccccc;">⬜ 其他/未標記</span><br>
          <span style="color:#ffcc88;">⚠ 啟發式:v3.11.10(5/28)之前解鎖的舊稀有英雄沒有紀錄,也會被列到「不明汙染」。<b>收回前請看名單確認</b>(你最清楚那位學生本來有沒有)。</span><br>
          <span style="color:#aaffcc;">預設只勾選「🟥 不明汙染」;合法取得(BOSS / 召喚 / GM)不預勾。收回會清掉該英雄(含等級/技能/爆發)並寫反污染信號,學生下次開遊戲自動以雲端為準。</span>
        </div>
        <div style="display:flex;gap:10px;align-items:center;margin-bottom:10px;flex-wrap:wrap;">
          <label style="font-size:13px;color:#e6dcff;">暴增時間窗
            <select id="_admin-rare-window" style="margin-left:4px;padding:6px 10px;background:rgba(20,16,30,0.9);border:1.5px solid rgba(180,140,255,0.5);color:#fff;border-radius:6px;font-family:inherit;">
              <option value="3600000">最近 1 小時</option>
              <option value="21600000">最近 6 小時</option>
              <option value="86400000" selected>最近 1 天</option>
              <option value="259200000">最近 3 天</option>
              <option value="604800000">最近 7 天</option>
            </select>
          </label>
          <label style="font-size:13px;color:#e6dcff;">門檻 ≥
            <input id="_admin-rare-threshold" type="number" min="1" max="60" value="5"
              style="width:64px;padding:6px 8px;margin-left:4px;background:rgba(20,16,30,0.9);border:1.5px solid rgba(180,140,255,0.5);color:#fff;border-radius:6px;font-family:inherit;">
          </label>
          <button id="_admin-rare-scan" style="padding:8px 20px;font-size:14px;font-weight:800;
            background:linear-gradient(135deg,#7a4ec2,#4e2c8c);border:2px solid #b388ff;color:#fff;
            border-radius:8px;cursor:pointer;font-family:inherit;white-space:nowrap;box-shadow:0 0 12px rgba(180,140,255,0.3);">
            🔍 掃描全校
          </button>
          <span id="_admin-rare-status" style="font-size:12px;color:#ccc;"></span>
        </div>
        <div id="_admin-rare-result" style="margin-top:6px;font-size:13px;color:#e6dcff;line-height:1.6;max-height:640px;overflow-y:auto;"></div>
      </div>

      <!-- ★ v3.13.47 — 同台 iPad 汙染分組偵測(依重複性 + 班級座號 + 原始/被汙染) -->
      <div id="_admin-pollution-cluster-section" style="background:rgba(30,16,40,0.62);border:2px solid rgba(255,120,160,0.6);border-radius:10px;padding:16px;margin-bottom:22px;">
        <div style="font-size:18px;font-weight:800;color:#ffaad0;margin-bottom:8px;">🔁 同台 iPad 汙染分組(SSR/SR・依重複性・原始 vs 被汙染)</div>
        <div style="font-size:13px;color:#ffe0ec;margin-bottom:12px;line-height:1.65;">
          全校掃描,把「<b>SSR/SR 解鎖序列相同</b>」的玩家分到同一組,重複性高的優先列出。<br>
          用每筆解鎖紀錄的<b>建立者 uid</b> 分辨:紀錄 uid=自己 → <span style="color:#9af0b0;">🟢 原始解鎖者</span>;uid=別人 → <span style="color:#ff9a9a;">🔴 被汙染(整份複製來的)</span>。<br>
          <span style="color:#ffd27a;">🔴 鐵證群</span>=序列相同且(時間戳完全相同 或 紀錄 uid 指向同一人) ・ <span style="color:#cfe3ff;">🔷 疑似群</span>=只有序列相同。<br>
          <span style="color:#ffcc88;">⚠ uid 反查只對 5/28 之後、且 history 被一起複製的汙染有效;請搭配「班級座號相鄰=同台 iPad」自行確認。預設只預勾 🔴,收回沿用稀有稽核流程(清等級/技能/爆發+反汙染信號)。</span>
        </div>
        <div style="display:flex;gap:10px;align-items:center;margin-bottom:10px;flex-wrap:wrap;">
          <label style="font-size:13px;color:#ffe0ec;">序列至少
            <input id="_admin-cluster-minseq" type="number" min="1" max="20" value="2"
              style="width:56px;padding:6px 8px;margin-left:4px;background:rgba(26,14,30,0.9);border:1.5px solid rgba(255,120,160,0.5);color:#fff;border-radius:6px;font-family:inherit;"> 隻
          </label>
          <label style="font-size:13px;color:#ffe0ec;">至少
            <input id="_admin-cluster-minmembers" type="number" min="2" max="20" value="2"
              style="width:56px;padding:6px 8px;margin-left:4px;background:rgba(26,14,30,0.9);border:1.5px solid rgba(255,120,160,0.5);color:#fff;border-radius:6px;font-family:inherit;"> 人共用
          </label>
          <button id="_admin-cluster-scan" style="padding:8px 20px;font-size:14px;font-weight:800;
            background:linear-gradient(135deg,#c24e8c,#8c2c5e);border:2px solid #ff88bb;color:#fff;
            border-radius:8px;cursor:pointer;font-family:inherit;white-space:nowrap;box-shadow:0 0 12px rgba(255,120,160,0.3);">
            🔍 掃描全校分組
          </button>
          <span id="_admin-cluster-status" style="font-size:12px;color:#ccc;"></span>
        </div>
        <div id="_admin-cluster-result" style="margin-top:6px;font-size:13px;color:#ffe0ec;line-height:1.6;max-height:680px;overflow-y:auto;"></div>
      </div>

      <!-- ★ v3.13.47 — 皮膚(英雄肖像)復原 / 稽核工具 -->
      <div id="_admin-skin-recovery-section" style="background:rgba(18,30,44,0.62);border:2px solid rgba(120,200,255,0.6);border-radius:10px;padding:16px;margin-bottom:22px;">
        <div style="font-size:18px;font-weight:800;color:#9fd6ff;margin-bottom:8px;">🎨 皮膚復原 / 稽核(查玩家買過哪些皮膚・跨槽復原・手動補發)</div>
        <div style="font-size:13px;color:#dff0ff;margin-bottom:12px;line-height:1.65;">
          輸入 email / uid / 姓名 / 班級座號 查玩家,顯示<b>每位英雄目前擁有的皮膚</b>,並標示:
          <span style="color:#9af0b0;">🟢 商店購買</span>(花知識幣) ・ <span style="color:#cfe3ff;">🔷 等級解鎖</span> ・ <span style="color:#ddd;">⬜ 其他</span>。<br>
          會比對 <b>main / live / safe 三槽</b>,有人被汙染掉的皮膚常常還躺在某一槽 → 按「<b>一鍵跨槽復原</b>」聯集回三槽(只增不減,連同<b>玩家選用的皮膚</b>一起還原)。<br>
          三槽都查無、但學生有合理憑證的,可用下方「<b>手動補發</b>」逐隻補。
        </div>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap;">
          <input id="_admin-skin-query" type="text" placeholder="email / uid / 姓名 / 班級座號(如 5324)"
            style="flex:1;min-width:240px;padding:8px 12px;background:rgba(14,22,30,0.9);border:1.5px solid rgba(120,200,255,0.5);color:#fff;border-radius:7px;font-family:inherit;font-size:14px;">
          <button id="_admin-skin-search" style="padding:8px 20px;font-size:14px;font-weight:800;
            background:linear-gradient(135deg,#3e87c2,#2c5e8c);border:2px solid #88bbff;color:#fff;
            border-radius:8px;cursor:pointer;font-family:inherit;white-space:nowrap;">🔍 查皮膚</button>
          <span id="_admin-skin-status" style="font-size:12px;color:#ccc;"></span>
        </div>
        <div id="_admin-skin-result" style="margin-top:6px;font-size:13px;color:#dff0ff;line-height:1.6;max-height:680px;overflow-y:auto;"></div>
      </div>

      <!-- ★ FIX 20260519(v7) — 帳號完全重置 + 重建工具 -->
      <!--
        放在 3.5 之後、4 號之前,因為它是「最徹底」的玩家資料修補工具。
        用法:當學生帳號被其他學生資料污染,3 / 3.5 都救不回(保留現有策略反而保下污染)
        時,用此工具完全清空帳號 → 指定角色 + 等級 + 資源 → 從零重建。
        危險度:**不可逆**,清掉的資料不會自動還原。要求雙重確認。
      -->
      <div id="_admin-reset-section" style="background:rgba(60,15,15,0.55);border:3px solid rgba(255,80,80,0.7);border-radius:10px;padding:16px;margin-bottom:22px;">
        <div style="font-size:18px;font-weight:800;color:#ff7777;margin-bottom:8px;">⚠ 3.9 帳號完全重置 + 重建(危險)</div>
        <div style="font-size:13px;color:#ffcccc;margin-bottom:12px;line-height:1.6;">
          <b style="color:#ff9999;">用於救援被其他帳號資料污染的玩家。</b><br>
          會<b style="color:#ff7777;">徹底清空</b>該玩家所有資料(角色/等級/技能/勳章/背包/補償紀錄/世界戰歷史),
          只保留登入身份(email + displayName),然後寫入你指定的角色、等級、資源。<br>
          <span style="color:#ffaa66;">⚠ 此操作<b>不可逆</b>。需要雙重確認。重置歷史會記在 <code>_resetHistory</code> 欄位供事後稽核。</span>
        </div>

        <!-- 學生查詢 -->
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap;">
          <input id="_admin-reset-email" type="text" placeholder="學生 email (如 lsps110176@stu.lsps.tp.edu.tw)"
            style="flex:2;min-width:200px;padding:8px 12px;font-size:13px;background:rgba(20,20,30,0.9);
            border:1.5px solid rgba(255,100,100,0.5);color:#fff;border-radius:6px;font-family:monospace;">
          <span style="color:#888;font-size:12px;">或</span>
          <input id="_admin-reset-uid" type="text" placeholder="直接輸入 uid"
            style="flex:1.3;min-width:160px;padding:8px 12px;font-size:13px;background:rgba(20,20,30,0.9);
            border:1.5px solid rgba(255,100,100,0.5);color:#fff;border-radius:6px;font-family:monospace;">
          <button id="_admin-reset-find" style="padding:8px 18px;font-size:14px;font-weight:700;
            background:rgba(255,100,100,0.2);border:2px solid #ff8888;color:#ffaaaa;
            border-radius:6px;cursor:pointer;font-family:inherit;white-space:nowrap;">
            🔍 查找學生
          </button>
        </div>

        <!-- 查詢結果(查到後展開) -->
        <div id="_admin-reset-info" style="font-size:13px;color:#ccc;margin-bottom:10px;padding:10px;background:rgba(0,0,0,0.4);border-radius:6px;display:none;line-height:1.7;"></div>

        <!-- 重建表單(查到玩家後展開) -->
        <div id="_admin-reset-form" style="display:none;background:rgba(80,20,20,0.3);border:1px dashed rgba(255,100,100,0.45);border-radius:8px;padding:14px;margin-bottom:10px;">

          <!-- 角色重建 -->
          <div style="margin-bottom:14px;">
            <div style="font-size:14px;font-weight:700;color:#ffaaaa;margin-bottom:6px;">
              🦸 重建角色(學生說有哪些就填哪些,等級依學生回憶)
            </div>
            <div style="display:flex;gap:8px;align-items:flex-end;margin-bottom:8px;flex-wrap:wrap;">
              <label style="font-size:12px;color:#ccc;flex:2;min-width:160px;">選角色
                <select id="_admin-reset-hero-select"
                  style="width:100%;padding:6px 8px;margin-top:4px;background:rgba(20,20,30,0.9);
                  border:1px solid rgba(255,100,100,0.4);color:#fff;border-radius:4px;font-family:inherit;font-size:13px;">
                  <option value="">-- 選擇英雄 --</option>
                </select>
              </label>
              <label style="font-size:12px;color:#ccc;width:100px;">等級 (1-50)
                <input id="_admin-reset-hero-lv" type="number" min="1" max="50" value="10"
                  style="width:100%;padding:6px 8px;margin-top:4px;background:rgba(20,20,30,0.9);border:1px solid rgba(255,100,100,0.4);color:#fff;border-radius:4px;font-family:inherit;box-sizing:border-box;">
              </label>
              <button id="_admin-reset-hero-add" style="padding:8px 16px;font-size:13px;font-weight:700;
                background:rgba(100,200,150,0.25);border:2px solid #66cc99;color:#aaffcc;
                border-radius:6px;cursor:pointer;font-family:inherit;white-space:nowrap;">
                ➕ 加入
              </button>
            </div>
            <div id="_admin-reset-hero-list" style="margin-top:8px;padding:8px;background:rgba(0,0,0,0.3);border-radius:6px;min-height:40px;font-size:13px;color:#bbb;">
              <span style="color:#666;">尚未加入任何角色...</span>
            </div>
          </div>

          <!-- 資源重建 -->
          <div style="margin-bottom:14px;">
            <div style="font-size:14px;font-weight:700;color:#ffaaaa;margin-bottom:6px;">💰 重建資源</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              <label style="font-size:12px;color:#ccc;">知識幣
                <input id="_admin-reset-coins" type="number" min="0" value="0" placeholder="0=不給"
                  style="width:100%;padding:6px 10px;margin-top:4px;background:rgba(20,20,30,0.9);border:1px solid rgba(255,100,100,0.4);color:#fff;border-radius:4px;font-family:inherit;box-sizing:border-box;">
              </label>
              <label style="font-size:12px;color:#ccc;">經驗之書
                <input id="_admin-reset-exp-book" type="number" min="0" max="99" value="0"
                  style="width:100%;padding:6px 10px;margin-top:4px;background:rgba(20,20,30,0.9);border:1px solid rgba(255,100,100,0.4);color:#fff;border-radius:4px;font-family:inherit;box-sizing:border-box;">
              </label>
              <label style="font-size:12px;color:#ccc;">技能升級書
                <input id="_admin-reset-skill-book" type="number" min="0" max="99" value="0"
                  style="width:100%;padding:6px 10px;margin-top:4px;background:rgba(20,20,30,0.9);border:1px solid rgba(255,100,100,0.4);color:#fff;border-radius:4px;font-family:inherit;box-sizing:border-box;">
              </label>
              <label style="font-size:12px;color:#ccc;">素質之書
                <input id="_admin-reset-stat-book" type="number" min="0" max="99" value="0"
                  style="width:100%;padding:6px 10px;margin-top:4px;background:rgba(20,20,30,0.9);border:1px solid rgba(255,100,100,0.4);color:#fff;border-radius:4px;font-family:inherit;box-sizing:border-box;">
              </label>
              <label style="font-size:12px;color:#ccc;">極限爆發果實
                <input id="_admin-reset-burst-fruit" type="number" min="0" max="99" value="0"
                  style="width:100%;padding:6px 10px;margin-top:4px;background:rgba(20,20,30,0.9);border:1px solid rgba(255,100,100,0.4);color:#fff;border-radius:4px;font-family:inherit;box-sizing:border-box;">
              </label>
              <label style="font-size:12px;color:#ccc;">爆發重置秘藥
                <input id="_admin-reset-burst-reset" type="number" min="0" max="99" value="0"
                  style="width:100%;padding:6px 10px;margin-top:4px;background:rgba(20,20,30,0.9);border:1px solid rgba(255,100,100,0.4);color:#fff;border-radius:4px;font-family:inherit;box-sizing:border-box;">
              </label>
            </div>
          </div>

          <!-- 重置原因 -->
          <div style="margin-bottom:14px;">
            <label style="font-size:13px;font-weight:700;color:#ffaaaa;">📝 重置原因(必填,會記入稽核紀錄)
              <input id="_admin-reset-reason" type="text" placeholder="例:雲端資料被同學帳號污染,經學生確認後完全重置"
                style="width:100%;padding:8px 12px;font-size:13px;margin-top:4px;background:rgba(20,20,30,0.9);
                border:1.5px solid rgba(255,100,100,0.4);color:#fff;border-radius:6px;font-family:inherit;box-sizing:border-box;">
            </label>
          </div>

          <button id="_admin-reset-apply" style="width:100%;padding:14px;font-size:15px;font-weight:800;
            background:rgba(255,80,80,0.25);border:3px solid #ff7777;color:#ffcccc;
            border-radius:8px;cursor:pointer;font-family:inherit;">
            ⚠ 執行完全重置 + 重建(會清空所有資料,不可逆)
          </button>
        </div>

        <div id="_admin-reset-result" style="margin-top:8px;font-size:13px;color:#ffaaaa;line-height:1.6;"></div>
      </div>

      <!-- ★ v3.5.37 — 3.7 Lv1 救援工具(專為「帳號變回 Lv1」場景設計) -->
      <!--
        ⚠ 為什麼需要這個工具(跟 3 號急救工具的差異)?
          - 3 號急救工具只看主文件 players/{uid},看不到救命的 saves/safe 子集合
          - 學生「變回 Lv1」常見根因:雲端 live 槽被空白資料覆蓋,但 safe 槽通常還在
          - 3.7 號讀三個地方(main / live / safe)並推薦最豐富的當還原來源
          - 用「整槽複製」方式還原,不需要憑學生回憶手動填資源數量
      -->
      <div id="_admin-lv1-section" style="background:rgba(60,20,30,0.55);border:2px solid rgba(255,120,150,0.7);border-radius:10px;padding:16px;margin-bottom:22px;">
        <div style="font-size:18px;font-weight:700;color:#ff99bb;margin-bottom:8px;">🆘 3.7 救援工具(雲端三槽救援 + 反污染保護)</div>
        <div style="font-size:13px;color:#ddd;margin-bottom:12px;line-height:1.55;">
          專為「<b style="color:#ffcc88;">學生帳號變回 Lv1 / 進度被本地汙染版覆蓋</b>」的場景。<br>
          會掃描三個地方:① 主文件 ② live 槽 ③ <b style="color:#88ff88;">safe 槽(救命槽,每 5 分鐘備份一次)</b>,<br>
          推薦最豐富的槽當還原來源,<b style="color:#ffaa88;">直接整槽複製,不需要憑學生回憶填寫資源</b>。<br>
          <span style="color:#aaffcc;">🛡 v3.5.39 反污染保護:救援會寫入信號,學生下次開遊戲時自動清除本地殘留並強吃雲端版,autosave 暫停 30 秒。</span><br>
          <span style="color:#ff8899;">⚠ 救援完成後請告知學生:重新整理頁面或重新登入即可生效。</span>
        </div>

        <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;flex-wrap:wrap;">
          <input id="_admin-lv1-email" type="text" placeholder="玩家 email(較常見,輸入後按右邊「📧 查 uid」自動填入下方)"
            style="flex:1;min-width:220px;padding:8px 12px;font-size:13px;background:rgba(20,20,30,0.9);
            border:1.5px solid rgba(255,200,150,0.5);color:#fff;border-radius:6px;font-family:monospace;">
          <button id="_admin-lv1-find-uid" style="padding:8px 14px;font-size:13px;font-weight:700;
            background:rgba(255,200,100,0.25);border:2px solid #ffcc66;color:#ffddaa;
            border-radius:6px;cursor:pointer;font-family:inherit;white-space:nowrap;">
            📧 查 uid
          </button>
        </div>

        <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap;">
          <input id="_admin-lv1-uid" type="text" placeholder="玩家 uid(留空=自己 / 從 3.5 工具帶過來也可 / email 反查自動填入)"
            style="flex:1;min-width:200px;padding:8px 12px;font-size:13px;background:rgba(20,20,30,0.9);
            border:1.5px solid rgba(255,120,150,0.5);color:#fff;border-radius:6px;font-family:monospace;">
          <button id="_admin-lv1-scan" style="padding:8px 18px;font-size:14px;font-weight:700;
            background:rgba(255,120,150,0.25);border:2px solid #ff99bb;color:#ffbbcc;
            border-radius:6px;cursor:pointer;font-family:inherit;white-space:nowrap;">
            🔍 三槽深度掃描
          </button>
          <button id="_admin-lv1-auto" style="padding:8px 18px;font-size:14px;font-weight:800;
            background:linear-gradient(135deg,rgba(100,255,150,0.35),rgba(50,200,100,0.35));
            border:2px solid #66dd99;color:#aaffcc;
            border-radius:6px;cursor:pointer;font-family:inherit;white-space:nowrap;
            box-shadow:0 0 14px rgba(100,255,150,0.3);">
            ✨ 一鍵自動還原最豐富版本
          </button>
        </div>

        <div id="_admin-lv1-diag" style="font-size:13px;color:#ccc;margin-bottom:10px;padding:10px;background:rgba(0,0,0,0.4);border-radius:6px;display:none;line-height:1.7;"></div>

        <div id="_admin-lv1-restore-panel" style="display:none;background:rgba(60,30,40,0.3);border:1px dashed rgba(255,150,180,0.5);border-radius:8px;padding:14px;">
          <div style="font-size:14px;color:#ffbbcc;margin-bottom:10px;font-weight:700;">手動指定還原來源(進階):</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
            <button id="_admin-lv1-restore-safe" style="flex:1;min-width:160px;padding:11px;font-size:13px;font-weight:800;
              background:rgba(100,255,150,0.25);border:2px solid #66dd99;color:#aaffcc;
              border-radius:8px;cursor:pointer;font-family:inherit;">
              🛡 從 safe 槽還原(推薦)
            </button>
            <button id="_admin-lv1-restore-live" style="flex:1;min-width:160px;padding:11px;font-size:13px;font-weight:800;
              background:rgba(100,180,255,0.2);border:2px solid #6699dd;color:#aaccff;
              border-radius:8px;cursor:pointer;font-family:inherit;">
              📡 從 live 槽還原
            </button>
            <button id="_admin-lv1-restore-main" style="flex:1;min-width:160px;padding:11px;font-size:13px;font-weight:800;
              background:rgba(200,180,100,0.2);border:2px solid #cc9966;color:#ffddaa;
              border-radius:8px;cursor:pointer;font-family:inherit;">
              📄 從主文件還原
            </button>
          </div>
          <div style="font-size:11px;color:#aaa;line-height:1.5;">
            💡 救援會把選定槽的資料寫到「主文件 + live 槽」,確保學生下次登入時無論主程式選哪槽都能拿到救援後的資料。<br>
            💡 safe 槽不會被動到(因為它可能就是來源,動了反而會破壞)。
          </div>
        </div>

        <div id="_admin-lv1-result" style="margin-top:8px;font-size:13px;color:#ffbbcc;line-height:1.6;"></div>
      </div>

      <!-- ★ v3.5.72 — 3.8 寄送「污染檢查提醒」(學生自己決定要不要用雲端覆蓋本地) -->
      <div id="_admin-pollution-check-section" style="background:rgba(40,30,60,0.45);border:2px solid rgba(180,150,255,0.55);border-radius:10px;padding:16px;margin-bottom:22px;">
        <div style="font-size:18px;font-weight:700;color:#cc99ff;margin-bottom:8px;">📢 3.8 寄送「進度污染提醒」(學生自己決定)</div>
        <div style="font-size:13px;color:#ccc;margin-bottom:12px;line-height:1.55;">
          跟 <b>3.7 救援工具</b>不同 —
          <span style="color:#ffcc66;">這個工具不會強制覆蓋學生的存檔</span>,只會在學生下次開遊戲時
          <b style="color:#ddccff;">彈出對比視窗</b>(左邊本地、右邊雲端),讓學生<b style="color:#aaffcc;">自己決定</b>。<br>
          <span style="color:#aaa;font-size:12px;">適合「不確定學生本地是不是真的被污染」的曖昧情境 — 讓學生看資料自己判斷比較安全。</span><br>
          <span style="color:#ff9999;font-size:12px;">⚠ 不論學生選哪邊,接下來 24 小時內這個帳號發出的「解鎖英雄倒退」自動 BUG 回報會自動 mute,避免你的後台被洗版。</span>
        </div>

        <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap;">
          <input id="_admin-pc-email" type="text" placeholder="玩家 email(優先,留空才用下方 uid)"
            style="flex:1;min-width:220px;padding:8px 12px;font-size:13px;background:rgba(20,20,30,0.9);
            border:1.5px solid rgba(200,150,255,0.5);color:#fff;border-radius:6px;font-family:monospace;">
          <input id="_admin-pc-uid" type="text" placeholder="或 uid"
            style="flex:1;min-width:160px;padding:8px 12px;font-size:13px;background:rgba(20,20,30,0.9);
            border:1.5px solid rgba(200,150,255,0.3);color:#fff;border-radius:6px;font-family:monospace;">
        </div>

        <div style="margin-bottom:10px;">
          <label style="font-size:13px;color:#ccc;">提醒原因(顯示給學生看,可選):</label>
          <input id="_admin-pc-reason" type="text"
            placeholder="例如:「老師發現你的英雄突然少了 8 隻,可能是共用平板殘留」"
            style="width:100%;box-sizing:border-box;margin-top:4px;padding:8px 12px;font-size:13px;
            background:rgba(20,20,30,0.9);border:1.5px solid rgba(200,150,255,0.3);color:#fff;
            border-radius:6px;font-family:inherit;">
        </div>

        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <button id="_admin-pc-send" style="flex:1;min-width:200px;padding:11px 18px;font-size:14px;font-weight:800;
            background:linear-gradient(135deg,rgba(180,120,255,0.4),rgba(120,80,200,0.4));
            border:2px solid #cc99ff;color:#e6ccff;border-radius:8px;cursor:pointer;font-family:inherit;
            box-shadow:0 0 14px rgba(180,120,255,0.3);">
            📤 寄送污染檢查提醒給學生
          </button>
          <button id="_admin-pc-preview" style="padding:11px 16px;font-size:13px;font-weight:700;
            background:rgba(100,100,140,0.3);border:1.5px solid rgba(200,180,255,0.5);
            color:#ccccff;border-radius:8px;cursor:pointer;font-family:inherit;white-space:nowrap;">
            👀 先預覽學生會看到的視窗
          </button>
        </div>

        <div id="_admin-pc-result" style="margin-top:10px;font-size:13px;color:#ddccff;line-height:1.7;padding:8px 12px;
          background:rgba(0,0,0,0.4);border-radius:6px;display:none;"></div>
      </div>

      <div id="_admin-test-batch-section" style="background:rgba(20,40,60,0.45);border:2px solid rgba(100,200,255,0.55);border-radius:10px;padding:16px;margin-bottom:22px;">
        <div style="font-size:18px;font-weight:700;color:#88ddff;margin-bottom:8px;">🧪 4. 測試工具：批次設定數值</div>
        <div style="font-size:13px;color:#ccc;margin-bottom:12px;line-height:1.55;">
          只修改你<b>自己</b>的存檔(本地+雲端)，方便快速測試遊戲內容。<br>
          <span style="color:#ffee88;">留空欄位=不修改</span>。英雄等級會套用到 <b>所有 HERO_DB 中的英雄</b>(含尚未獲得者也會加入並設為該等級)。
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
          <label style="font-size:13px;color:#ccc;">所有英雄等級 (1-50)
            <input id="_admin-test-hero-lv" type="number" min="1" max="50" placeholder="留空=不改"
              style="width:100%;padding:6px 10px;margin-top:4px;background:rgba(20,20,30,0.9);border:1px solid rgba(100,200,255,0.4);color:#fff;border-radius:4px;font-family:inherit;box-sizing:border-box;">
          </label>
          <label style="font-size:13px;color:#ccc;">知識幣 (≥0)
            <input id="_admin-test-coins" type="number" min="0" placeholder="留空=不改"
              style="width:100%;padding:6px 10px;margin-top:4px;background:rgba(20,20,30,0.9);border:1px solid rgba(100,200,255,0.4);color:#fff;border-radius:4px;font-family:inherit;box-sizing:border-box;">
          </label>
          <label style="font-size:13px;color:#ccc;">技能升級書 (0-99)
            <input id="_admin-test-skill-book" type="number" min="0" max="99" placeholder="留空=不改"
              style="width:100%;padding:6px 10px;margin-top:4px;background:rgba(20,20,30,0.9);border:1px solid rgba(100,200,255,0.4);color:#fff;border-radius:4px;font-family:inherit;box-sizing:border-box;">
          </label>
          <label style="font-size:13px;color:#ccc;">極限爆發果實 (0-99)
            <input id="_admin-test-burst-fruit" type="number" min="0" max="99" placeholder="留空=不改"
              style="width:100%;padding:6px 10px;margin-top:4px;background:rgba(20,20,30,0.9);border:1px solid rgba(100,200,255,0.4);color:#fff;border-radius:4px;font-family:inherit;box-sizing:border-box;">
          </label>
          <label style="font-size:13px;color:#ccc;">技能重置書 (0-99)
            <input id="_admin-test-skill-reset" type="number" min="0" max="99" placeholder="留空=不改"
              style="width:100%;padding:6px 10px;margin-top:4px;background:rgba(20,20,30,0.9);border:1px solid rgba(100,200,255,0.4);color:#fff;border-radius:4px;font-family:inherit;box-sizing:border-box;">
          </label>
          <label style="font-size:13px;color:#ccc;">極限重置秘藥 (0-99)
            <input id="_admin-test-burst-reset" type="number" min="0" max="99" placeholder="留空=不改"
              style="width:100%;padding:6px 10px;margin-top:4px;background:rgba(20,20,30,0.9);border:1px solid rgba(100,200,255,0.4);color:#fff;border-radius:4px;font-family:inherit;box-sizing:border-box;">
          </label>
        </div>
        <button id="_admin-test-apply" style="width:100%;padding:11px;font-size:15px;font-weight:800;
          background:rgba(100,200,255,0.25);border:2px solid #66bbff;color:#aaddff;
          border-radius:8px;cursor:pointer;font-family:inherit;">
          🧪 套用測試數值（並雲端儲存）
        </button>
        <div id="_admin-test-result" style="margin-top:8px;font-size:13px;color:#aaddff;line-height:1.6;"></div>
        <!-- ★ v1.0.20260428 — 清除已答對題目紀錄(讓題庫從零開始) -->
        <div style="margin-top:14px;padding-top:12px;border-top:1px dashed rgba(100,200,255,0.25);">
          <div style="font-size:13px;color:#aaa;margin-bottom:6px;line-height:1.5;">
            🗑️ 清除「跨關卡已答對題目」紀錄,讓題庫重置從零開始(會雲端儲存)
          </div>
          <button id="_admin-clear-correct" style="width:100%;padding:9px;font-size:14px;font-weight:700;
            background:rgba(255,150,80,0.2);border:1.5px solid #ff9966;color:#ffbb88;
            border-radius:6px;cursor:pointer;font-family:inherit;">
            🗑️ 清除已答對題目紀錄
          </button>
          <div id="_admin-clear-correct-result" style="margin-top:6px;font-size:12px;color:#ffbb88;"></div>
        </div>
      </div>

      <!-- ★ v1.0.20260510.5760 — 接收錯誤回報區塊 -->
      <!-- ★ v3.3.2 — 回報內容現在含玩家描述 + 戰鬥快照 + 最近 300 條 console -->
      <!-- ★ v3.4.6 — 加入「回信給玩家」textarea,玩家可在 BUG 回報視窗的「管理員回信」分頁看到 -->
      <div id="_admin-bug-section" style="background:rgba(60,20,40,0.5);border:2px solid rgba(255,140,200,0.6);border-radius:10px;padding:16px;margin-bottom:14px;">
        <div style="font-size:18px;font-weight:700;color:#ffaadd;margin-bottom:8px;">📥 接收錯誤回報</div>
        <div style="font-size:14px;color:#ccc;margin-bottom:10px;line-height:1.55;">
          顯示玩家送出的「卡死或 BUG 回報」清單(最新 200 筆,按時間倒序)。<br>
          每筆顯示玩家信箱、來源頁面、回報內容與時間。<br>
          <span style="color:#aaffcc;font-weight:700;">💡 每筆回報已自動附帶玩家當下的 console 紀錄 + 戰鬥狀態快照,按「📋 複製給 Claude」可直接貼給 AI 偵錯。</span><br>
          <span style="color:#aaccff;font-weight:700;">📨 每張卡片下方有「👨‍🏫 老師回信給玩家」欄位,輸入回覆後按「💾 儲存回覆」,玩家會在 BUG 回報視窗的「📬 管理員回信」分頁看到。</span>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">
          <button id="_admin-bug-refresh" style="flex:1;min-width:140px;padding:11px 20px;font-size:15px;font-weight:800;
            background:rgba(255,140,200,0.25);border:2px solid #ff99cc;color:#ffccdd;
            border-radius:8px;cursor:pointer;font-family:inherit;">
            🔄 重新整理回報清單
          </button>
          <span id="_admin-bug-count" style="font-size:14px;color:#ffaadd;font-weight:700;">尚未載入</span>
        </div>
        <div id="_admin-bug-list" style="max-height:400px;overflow-y:auto;padding:4px;
          background:rgba(0,0,0,0.35);border:1px solid rgba(255,140,200,0.25);border-radius:8px;">
          <div style="padding:14px;color:#aaa;font-size:13px;text-align:center;">
            尚未載入,請按上方「🔄 重新整理回報清單」
          </div>
        </div>
      </div>

      <!-- ★ v1.0.20260510.5820 — 解除冷卻 / 每日次數限制(管理員測試用) -->
      <div id="_admin-bypass-section" style="background:rgba(20,40,60,0.55);border:2px solid rgba(120,200,255,0.65);border-radius:10px;padding:16px;margin-bottom:14px;">
        <div style="font-size:18px;font-weight:700;color:#88ccff;margin-bottom:8px;">🔓 5. 解除冷卻 / 每日次數限制(測試用)</div>
        <div style="font-size:13px;color:#ccc;margin-bottom:10px;line-height:1.6;">
          下列功能在一般玩家身上都有冷卻或每日次數限制,測試遊戲時常因為已用完而無法重複驗證。<br>
          按下對應按鈕可立即解除限制(只影響你自己的帳號 / 本機,不會動到其他玩家)。
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <button id="_admin-bypass-king" style="padding:10px 14px;font-size:14px;font-weight:800;text-align:left;
            background:rgba(255,210,80,0.18);border:1.5px solid #ffd066;color:#ffe699;
            border-radius:7px;cursor:pointer;font-family:inherit;">
            👑 重置「今日知識王挑戰」<span style="font-size:12px;color:#ddd;font-weight:500;">(可立即再挑戰一次)</span>
          </button>
          <button id="_admin-bypass-preview" style="padding:10px 14px;font-size:14px;font-weight:800;text-align:left;
            background:rgba(120,255,160,0.16);border:1.5px solid #88dd99;color:#bbffcc;
            border-radius:7px;cursor:pointer;font-family:inherit;">
            🎯 重置「預習練習答題每日 500 幣上限」<span style="font-size:12px;color:#ddd;font-weight:500;">(日本關 + 台灣關)</span>
          </button>
          <button id="_admin-bypass-cloudsync" style="padding:10px 14px;font-size:14px;font-weight:800;text-align:left;
            background:rgba(120,180,255,0.16);border:1.5px solid #88aaff;color:#bbccff;
            border-radius:7px;cursor:pointer;font-family:inherit;">
            ☁️ 重置「手動雲端同步」冷卻 + 每日 50 次計數
          </button>
          <button id="_admin-bypass-bugreport" style="padding:10px 14px;font-size:14px;font-weight:800;text-align:left;
            background:rgba(255,150,180,0.16);border:1.5px solid #ff99bb;color:#ffccdd;
            border-radius:7px;cursor:pointer;font-family:inherit;">
            🐛 重置「錯誤回報 10 分鐘冷卻」
          </button>
          <button id="_admin-bypass-friendarena" style="padding:10px 14px;font-size:14px;font-weight:800;text-align:left;
            background:rgba(200,150,255,0.16);border:1.5px solid #bb99ee;color:#ddccff;
            border-radius:7px;cursor:pointer;font-family:inherit;">
            🤝 清除「好友互動每日次數」localStorage 計數
          </button>
          <button id="_admin-bypass-all" style="padding:11px 14px;font-size:14px;font-weight:900;text-align:center;
            background:rgba(255,160,80,0.22);border:2px solid #ffaa66;color:#ffd9b3;
            border-radius:7px;cursor:pointer;font-family:inherit;margin-top:4px;">
            ⚡ 一鍵解除以上全部限制
          </button>
        </div>
        <div id="_admin-bypass-result" style="margin-top:10px;font-size:13px;color:#88ddff;min-height:18px;line-height:1.55;"></div>
      </div>

      <!-- ★ v3.5.0 — 下載權限管理區塊 -->
      <div id="_admin-dlperm-section" style="background:rgba(20,40,30,0.5);border:2px solid rgba(120,255,180,0.5);border-radius:10px;padding:16px;margin-bottom:14px;">
        <div style="font-size:18px;font-weight:700;color:#aaffcc;margin-bottom:8px;">⬇️ 4. 下載安裝權限管理</div>
        <div style="font-size:13px;color:#ccc;margin-bottom:10px;line-height:1.55;">
          玩家可申請下載完整遊戲到裝置(PWA),需管理員批准。批准後 <b style="color:#ffd066;">24 小時</b>內可下載,逾時自動失效。
          <br>下方列表即時同步,點「✅ 批准」核發 24 小時權限,點「🚫 撤銷」立即取消。
        </div>
        <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;align-items:center;">
          <button id="_admin-dlperm-refresh" style="padding:8px 14px;font-size:13px;font-weight:700;
            background:rgba(40,100,80,0.5);border:1.5px solid rgba(120,200,160,0.6);color:#aaffcc;
            border-radius:7px;cursor:pointer;font-family:inherit;">
            🔄 立即重新整理
          </button>
          <label style="font-size:12px;color:#aaa;display:flex;align-items:center;gap:4px;">
            <input type="checkbox" id="_admin-dlperm-onlypending" style="accent-color:#88ffbb;">
            僅顯示「待審核」
          </label>
          <span id="_admin-dlperm-count" style="font-size:12px;color:#88ccff;margin-left:auto;"></span>
        </div>
        <div id="_admin-dlperm-list" style="max-height:240px;overflow-y:auto;background:rgba(0,0,0,0.35);border-radius:8px;padding:6px;">
          <div style="text-align:center;color:#888;padding:20px;font-size:13px;">載入中…</div>
        </div>
      </div>

      <!-- ★ v3.5.0 — 可疑帳號偵測區塊 -->
      <div id="_admin-sus-section" style="background:rgba(50,20,30,0.5);border:2px solid rgba(255,120,140,0.5);border-radius:10px;padding:16px;margin-bottom:14px;">
        <div style="font-size:18px;font-weight:700;color:#ff99bb;margin-bottom:8px;">🕵️ 5. 可疑帳號偵測</div>
        <div style="font-size:13px;color:#ccc;margin-bottom:10px;line-height:1.55;">
          自動偵測:① <b>知識幣/等級/解鎖英雄短時間爆衝</b>(對比 _dataSummary 前後快照)、
          ② <b>能力值投資超過該英雄等級允許上限</b>(疑似改本機 JS 變數後寫雲端)。
          <br>下方列表即時同步,可點「🚫 停權」阻止該帳號登入,或「✅ 解除」恢復正常。
        </div>
        <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;align-items:center;">
          <button id="_admin-sus-scan" style="padding:8px 14px;font-size:13px;font-weight:700;
            background:rgba(120,40,60,0.5);border:1.5px solid rgba(255,120,140,0.7);color:#ffbbcc;
            border-radius:7px;cursor:pointer;font-family:inherit;">
            🔍 全玩家批次掃描
          </button>
          <button id="_admin-sus-toggle-watch" style="padding:8px 14px;font-size:13px;font-weight:700;
            background:rgba(80,40,120,0.5);border:1.5px solid rgba(180,140,255,0.7);color:#ddccff;
            border-radius:7px;cursor:pointer;font-family:inherit;">
            📡 啟用即時監聽
          </button>
          <span id="_admin-sus-status" style="font-size:12px;color:#aaa;margin-left:auto;"></span>
        </div>
        <div id="_admin-sus-list" style="max-height:280px;overflow-y:auto;background:rgba(0,0,0,0.35);border-radius:8px;padding:6px;">
          <div style="text-align:center;color:#888;padding:20px;font-size:13px;">尚未掃描。點上方「全玩家批次掃描」或「啟用即時監聽」開始檢測。</div>
        </div>
      </div>

      <!-- ════════════════════════════════════════════════════════════ -->
      <!-- ★ v3.11.34(2026-05-29) — 異常解鎖偵測完整 flow                -->
      <!--                                                                -->
      <!-- 用途:掃描短時間大量解鎖英雄/至寶的玩家,可逐項清除 + 補償 + 告知 -->
      <!--   ⚠ 階段 4 會升級「同 battleId 多解鎖」精準偵測規則              -->
      <!-- ════════════════════════════════════════════════════════════ -->
      <div id="_admin-abnormal-unlock-section" style="background:rgba(40,15,45,0.5);border:2px solid rgba(255,160,200,0.55);border-radius:10px;padding:16px;margin-bottom:14px;">
        <div style="font-size:18px;font-weight:800;color:#ffaadd;margin-bottom:8px;">🔍 異常解鎖偵測(英雄 / 至寶)</div>
        <div style="font-size:13px;color:#e8c8d8;margin-bottom:12px;line-height:1.65;">
          掃描短時間內大量解鎖英雄/至寶的玩家。可單獨對選定的玩家:<br>
          ① 勾選異常英雄/至寶 → 清除 ② 自動發送通知 + 補償 ③ 嚴重時停權帳號<br>
          <span style="color:#ffaa66;">⚠ 紅框「同場戰鬥多解鎖」= 1 場 BOSS 戰超過 1 隻新英雄,鐵證異常(階段 4 升級為主規則)</span>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">
          <label style="font-size:13px;color:#e8c8d8;">時間窗:
            <select id="_admin-abnormal-window" style="margin-left:6px;padding:5px 10px;background:rgba(0,0,0,0.5);color:#fff;border:1px solid #886;border-radius:6px;font-family:inherit;">
              <option value="3600000">最近 1 小時</option>
              <option value="21600000">最近 6 小時</option>
              <option value="86400000" selected>最近 24 小時</option>
              <option value="259200000">最近 3 天</option>
              <option value="604800000">最近 7 天</option>
            </select>
          </label>
          <label style="font-size:13px;color:#e8c8d8;">英雄門檻:
            <select id="_admin-abnormal-threshold" style="margin-left:6px;padding:5px 10px;background:rgba(0,0,0,0.5);color:#fff;border:1px solid #886;border-radius:6px;font-family:inherit;">
              <option value="3">≥ 3 隻</option>
              <option value="5" selected>≥ 5 隻</option>
              <option value="10">≥ 10 隻</option>
            </select>
          </label>
          <button id="_admin-abnormal-scan" style="padding:9px 20px;font-size:14px;font-weight:800;
                  background:linear-gradient(135deg,#bb3377,#661a4a);color:#fff;border:none;border-radius:8px;cursor:pointer;
                  box-shadow:0 3px 10px rgba(200,80,150,0.5);">
            🔍 立即掃描
          </button>
        </div>
        <div id="_admin-abnormal-status" style="font-size:12px;color:#aaa;margin-bottom:8px;"></div>
        <div id="_admin-abnormal-list" style="max-height:520px;overflow-y:auto;background:rgba(0,0,0,0.35);border-radius:8px;padding:8px;">
          <div style="text-align:center;color:#888;padding:20px;font-size:13px;">尚未掃描。點上方「立即掃描」開始。</div>
        </div>
      </div>

      <!-- ════════════════════════════════════════════════════════════ -->
      <!-- ★ v3.13.1(2026-05-31)— 老師需求 3:全員獎章補發掃描          -->
      <!-- 用途:掃描登入玩家本人的 _medalStats、英雄等級、至寶、預習等   -->
      <!-- 反推「邏輯上已達成但未解鎖」的獎章,補發 + 自動發水晶/幣。   -->
      <!-- 注意:此工具只對「目前登入帳號」生效(不會跑遍全校),GM 用    -->
      <!--      於自己測試 / 老師個人帳號的歷史獎章補正。學生用戶平時    -->
      <!--      不需要按 — 登入時 _checkMedalsOnLogin 已自動跑一次。     -->
      <!-- ════════════════════════════════════════════════════════════ -->
      <div id="_admin-medal-scan-section" style="background:rgba(40,30,15,0.5);border:2px solid rgba(255,210,100,0.55);border-radius:10px;padding:16px;margin-bottom:14px;">
        <div style="font-size:18px;font-weight:800;color:#ffd066;margin-bottom:8px;">🏅 全員獎章補發掃描</div>
        <div style="font-size:13px;color:#e8d8a8;margin-bottom:12px;line-height:1.65;">
          掃描目前登入帳號的所有獎章達成條件,對「邏輯上已達成但未解鎖」的獎章補發,
          並自動發放對應的水晶+知識幣獎勵(已領過的不會重發)。<br>
          <span style="color:#ffaa66;">⚠ 此工具只對目前登入帳號生效。若想對某學生補發,請該學生自己登入後跑掃描。</span><br>
          <span style="color:#aaffaa;">✅ 涵蓋:日本/台灣關 BOSS 擊敗、預習進度、世界 BOSS 戰績、小博士累計、至寶收藏、英雄等級、技能熟練、答題連擊等。</span><br>
          <span style="color:#ffaaaa;">❌ 不涵蓋(歷史資料沒記):單場 S 評、10 回合速通、單場全英雄不倒等 — 玩家需重新達成。</span>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">
          <button id="_admin-medal-scan-btn" style="padding:9px 20px;font-size:14px;font-weight:800;
                  background:linear-gradient(135deg,#cc9933,#8b6420);color:#fff;border:none;border-radius:8px;cursor:pointer;
                  box-shadow:0 3px 10px rgba(220,170,40,0.5);">
            🔍 立即掃描 + 補發
          </button>
        </div>
        <div id="_admin-medal-scan-status" style="font-size:12px;color:#aaa;margin-bottom:8px;"></div>
        <div id="_admin-medal-scan-result" style="max-height:420px;overflow-y:auto;background:rgba(0,0,0,0.35);border-radius:8px;padding:10px;display:none;font-size:13px;color:#e8d8a8;line-height:1.65;"></div>
      </div>

      <!-- ════════════════════════════════════════════════════════════ -->
      <!-- ★ v3.11.35 階段 4c(2026-05-29) — 玩家活動記錄查詢               -->
      <!--   ★ v3.11.35+(2026-05-29 晚場) — 新增「姓名」查詢                -->
      <!-- 用途:輸入 email / uid / 姓名,完整查看玩家所有英雄解鎖、至寶   -->
      <!-- 解鎖、戰鬥紀錄、知識幣帳目。以 battleId 為單位偵測異常(同一場 -->
      <!-- 戰鬥多次解鎖 = 異常)。逐項可刪除、強制覆寫。                   -->
      <!-- ════════════════════════════════════════════════════════════ -->
      <div id="_admin-activity-section" style="background:rgba(20,30,50,0.5);border:2px solid rgba(140,180,255,0.6);border-radius:10px;padding:16px;margin-bottom:14px;">
        <div style="font-size:18px;font-weight:800;color:#aaccff;margin-bottom:8px;">📜 玩家活動記錄查詢</div>
        <div style="font-size:13px;color:#cce0ff;margin-bottom:12px;line-height:1.65;">
          輸入玩家 <b>email</b>、<b>uid</b>、<b>學號(如 lsps110046)</b>或 <b>中文姓名</b>查看完整活動紀錄。<br>
          <span style="color:#aaccff;font-size:12px;">姓名可只輸入部分(如「王同學」),系統會列出候選讓你點選;純 6 位數字也可當學號。</span><br>
          <span style="color:#ffcc66;">⚠ 英雄/至寶分頁上方為「目前擁有」明細(含取得來源);<b style="color:#ff8888;">來源不明=跨帳號汙染,會標紅</b>,可逐隻清除+補償+通知。</span>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">
          <input id="_admin-activity-query" type="text" placeholder="email / uid / 學號(lsps110046) / 姓名(王同學、5324王同學)"
                 style="flex:1;min-width:240px;padding:8px 12px;font-size:13px;background:rgba(0,0,0,0.5);color:#fff;border:1px solid #668;border-radius:6px;font-family:inherit;">
          <button id="_admin-activity-search" style="padding:9px 20px;font-size:14px;font-weight:800;
                  background:linear-gradient(135deg,#3366bb,#1a4a88);color:#fff;border:none;border-radius:8px;cursor:pointer;
                  box-shadow:0 3px 10px rgba(80,140,220,0.5);">
            🔍 查詢
          </button>
          <button id="_admin-activity-scan-anomaly" style="padding:9px 20px;font-size:13px;font-weight:800;
                  background:linear-gradient(135deg,#cc5544,#882211);color:#fff;border:none;border-radius:8px;cursor:pointer;
                  box-shadow:0 3px 10px rgba(220,120,80,0.5);" title="同 battleId 多解鎖鐵證掃描(全 200 位玩家)">
            ⚡ 掃描異常
          </button>
        </div>
        <div id="_admin-activity-status" style="font-size:12px;color:#aaa;margin-bottom:8px;min-height:18px;"></div>
        <div id="_admin-activity-player-card" style="display:none;background:rgba(0,0,0,0.5);border-radius:8px;padding:14px;margin-bottom:10px;border-left:4px solid #88aaff;">
          <!-- 玩家基本卡 - 動態生成 -->
        </div>
        <div id="_admin-activity-tabs" style="display:none;margin-bottom:10px;border-bottom:2px solid rgba(140,180,255,0.3);flex-wrap:wrap;">
          <button class="_aa-tab" data-tab="hero" style="padding:8px 14px;font-size:13px;font-weight:700;background:transparent;color:#aaccff;border:none;border-bottom:3px solid transparent;cursor:pointer;margin-right:2px;">🦸 英雄</button>
          <button class="_aa-tab" data-tab="treasure" style="padding:8px 14px;font-size:13px;font-weight:700;background:transparent;color:#aaccff;border:none;border-bottom:3px solid transparent;cursor:pointer;margin-right:2px;">💎 至寶</button>
          <button class="_aa-tab" data-tab="battle" style="padding:8px 14px;font-size:13px;font-weight:700;background:transparent;color:#aaccff;border:none;border-bottom:3px solid transparent;cursor:pointer;margin-right:2px;">⚔ 戰鬥</button>
          <button class="_aa-tab" data-tab="coin" style="padding:8px 14px;font-size:13px;font-weight:700;background:transparent;color:#aaccff;border:none;border-bottom:3px solid transparent;cursor:pointer;margin-right:2px;">💰 知識幣</button>
          <button class="_aa-tab" data-tab="fruit" style="padding:8px 14px;font-size:13px;font-weight:700;background:transparent;color:#aaccff;border:none;border-bottom:3px solid transparent;cursor:pointer;margin-right:2px;">🍑 果實</button>
          <button class="_aa-tab" data-tab="full" style="padding:8px 14px;font-size:13px;font-weight:700;background:transparent;color:#ffd966;border:none;border-bottom:3px solid transparent;cursor:pointer;">📋 完整資料</button>
        </div>
        <div id="_admin-activity-content" style="background:rgba(0,0,0,0.35);border-radius:8px;padding:8px;max-height:560px;overflow-y:auto;">
          <div style="text-align:center;color:#888;padding:20px;font-size:13px;">輸入 email / uid / 姓名 後點「查詢」開始</div>
        </div>
      </div>

      <!-- ★ v3.12.17(2026-05-31) — 世界 BOSS 補償券系統(GM 後台工具) -->
      <!--   功能 A:🔍 掃描重複戰績 + 一鍵刪除 + 自動恢復進場 -1 -->
      <!--   功能 B:🎫 補 1 次進場機會(隔天用,玩家錯過今天機會時) -->
      <!--   功能 C:📋 查某玩家的補償券清單(已發 / 已用) -->
      <div id="_admin-bonus-section" style="background:rgba(50,40,20,0.5);border:2px solid rgba(255,200,100,0.65);border-radius:10px;padding:16px;margin-bottom:14px;">
        <div style="font-size:18px;font-weight:800;color:#ffcc66;margin-bottom:8px;">🎫 6.5 世界 BOSS 補償券管理</div>
        <div style="font-size:13px;color:#ccc;margin-bottom:12px;line-height:1.6;">
          當遊戲 BUG 害玩家被多算 1 場時,GM 可以
          <b style="color:#ffcc66;">①刪除錯誤場次 + 恢復進場機會 -1</b>;
          若該玩家當天沒上線錯過機會,GM 可以
          <b style="color:#ffaa66;">②隔天補 1 次進場</b>(限額 2 變 3)。<br>
          <span style="color:#aaa;font-size:12px;">補償場次的傷害仍計入排行榜總傷(BOSS 跨天累積打,維持均等公平);排行榜會顯示「(含 N 場補償)」,所有玩家可見。</span>
        </div>

        <!-- 區段 A:掃描重複戰績 -->
        <div style="background:rgba(60,40,30,0.35);border:1.5px dashed rgba(255,180,80,0.45);border-radius:8px;padding:12px;margin-bottom:14px;">
          <div style="font-size:14px;font-weight:700;color:#ffbb66;margin-bottom:8px;">
            🔍 A. 掃描全校重複戰績(BUG 害多算的場次)
          </div>
          <div style="font-size:12px;color:#bbb;margin-bottom:10px;line-height:1.6;">
            掃描所有玩家的戰績歷史,找出
            <b style="color:#ffcc66;">時間差 60 秒內 + 傷害完全相同</b>的重複組(race condition 雙寫鐵證)。<br>
            <span style="color:#ff9999;">每組會顯示「保留 vs 刪除」按鈕,刪除時自動把該玩家當天 wbDailyCount -1(恢復 1 次進場)。</span>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px;">
            <button id="_admin-bonus-scan-dup" style="padding:9px 18px;font-size:13px;font-weight:800;
              background:linear-gradient(135deg,#cc8833,#996622);border:2px solid #ffaa55;color:#fff;
              border-radius:7px;cursor:pointer;font-family:inherit;
              box-shadow:0 0 10px rgba(255,170,80,0.3);">
              🔍 掃描所有玩家的重複戰績
            </button>
            <span id="_admin-bonus-scan-status" style="font-size:12px;color:#aaa;"></span>
          </div>
          <div id="_admin-bonus-scan-result" style="margin-top:10px;max-height:480px;overflow-y:auto;
            background:rgba(0,0,0,0.4);border-radius:6px;padding:0;font-size:12px;line-height:1.55;display:none;">
            <!-- 動態:每組重複戰績一張卡片 + 「保留 X 刪除 Y」按鈕 -->
          </div>
        </div>

        <!-- 區段 B:手動補 1 次進場機會 -->
        <div style="background:rgba(50,30,40,0.35);border:1.5px dashed rgba(255,150,180,0.45);border-radius:8px;padding:12px;margin-bottom:14px;">
          <div style="font-size:14px;font-weight:700;color:#ffaadd;margin-bottom:8px;">
            🎫 B. 手動發 1 張補償券(玩家錯過今天機會時用)
          </div>
          <div style="font-size:12px;color:#bbb;margin-bottom:10px;line-height:1.6;">
            <b style="color:#ffcc88;">使用情境</b>:玩家因 BUG 損失 1 場(老師刪了重複那筆),但
            <b style="color:#ffaa66;">該玩家當天沒上線</b>,過了今天就沒了 → 隔天 GM 用此工具補 1 場給他。<br>
            <span style="color:#ffaaaa;">⚠ 補償券「生效日」預設為明天(玩家明天起可多打 1 場);也可改成「今天」立即生效。</span>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px;">
            <input id="_admin-bonus-grant-email" type="text" placeholder="玩家 email"
              style="flex:1.5;min-width:200px;padding:8px 12px;font-size:13px;background:rgba(20,20,30,0.9);
              border:1.5px solid rgba(255,150,180,0.4);color:#fff;border-radius:6px;font-family:monospace;">
            <span style="color:#888;font-size:12px;">或</span>
            <input id="_admin-bonus-grant-uid" type="text" placeholder="uid"
              style="flex:1;min-width:140px;padding:8px 12px;font-size:13px;background:rgba(20,20,30,0.9);
              border:1.5px solid rgba(255,150,180,0.4);color:#fff;border-radius:6px;font-family:monospace;">
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px;">
            <input id="_admin-bonus-grant-reason" type="text" placeholder="原因(GM 看得到,如「5/31 BUG 重複計次補償」)"
              style="flex:2;min-width:200px;padding:8px 12px;font-size:13px;background:rgba(20,20,30,0.9);
              border:1.5px solid rgba(255,150,180,0.4);color:#fff;border-radius:6px;font-family:inherit;">
            <label style="font-size:12px;color:#ccc;display:flex;align-items:center;gap:4px;cursor:pointer;">
              <input id="_admin-bonus-grant-today" type="checkbox" style="cursor:pointer;">
              今天立即生效(預設明天)
            </label>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
            <button id="_admin-bonus-grant-btn" style="padding:9px 18px;font-size:13px;font-weight:800;
              background:linear-gradient(135deg,#cc4488,#882266);border:2px solid #ff88bb;color:#fff;
              border-radius:7px;cursor:pointer;font-family:inherit;
              box-shadow:0 0 10px rgba(255,136,187,0.3);">
              🎫 發放 1 張補償券
            </button>
            <button id="_admin-bonus-query-btn" style="padding:9px 16px;font-size:13px;font-weight:700;
              background:rgba(100,80,100,0.4);border:1.5px solid rgba(200,150,200,0.5);color:#ffcce6;
              border-radius:7px;cursor:pointer;font-family:inherit;">
              📋 查該玩家的補償券歷史
            </button>
            <span id="_admin-bonus-grant-status" style="font-size:12px;color:#aaa;"></span>
          </div>
          <div id="_admin-bonus-grant-result" style="margin-top:10px;font-size:12px;color:#ddccaa;line-height:1.65;
            padding:0 8px;display:none;"></div>
        </div>
      </div>

      <!-- ★ v3.13.7(2026-05-31)— 世界 BOSS 挑戰入場券系統(GM 後台工具) -->
      <!--   入場券跟「補償券」是完全不同的東西: -->
      <!--     - 補償券(_admin-bonus-section):GM 因 BUG 補償的額外進場機會(粉色標籤) -->
      <!--     - 入場券(此 section):昨日未用完場次自動轉換(綠色標籤),GM 可手動補/清/查 -->
      <!--   功能 A:🎟️ 手動補發 N 張(玩家因 BUG 雲端資料異常導致沒拿到券時用) -->
      <!--   功能 B:📋 查某玩家目前持有的入場券數 -->
      <!--   功能 C:🧹 清空某玩家的入場券(處理異常時用,謹慎使用) -->
      <div id="_admin-ticket-section" style="background:rgba(20,50,40,0.5);border:2px solid rgba(102,221,170,0.65);border-radius:10px;padding:16px;margin-bottom:14px;">
        <div style="font-size:18px;font-weight:800;color:#88ffcc;margin-bottom:8px;">🎟️ 6.6 世界 BOSS 挑戰入場券管理</div>
        <div style="font-size:13px;color:#ccc;margin-bottom:12px;line-height:1.6;">
          <b style="color:#88ffcc;">入場券</b>是玩家昨日「沒用完的世界 BOSS 場次」自動轉換而來(每日 08:00 發放,
          上限持有 5 張)。當天場次用完時,可在「場次用完」彈窗使用 1 張換 1 次額外進場,本場結算會在排行榜
          標記「🎟️ 入場券場次」(綠色,跟 GM 補償粉色區分)。<br>
          <span style="color:#aaa;font-size:12px;">資料路徑:<code>players/{uid}.playerBackpack.wb_entry_ticket</code>。入場券場次傷害仍計入排行榜總傷。</span>
        </div>

        <!-- 區段 A:手動補發 -->
        <div style="background:rgba(20,50,40,0.35);border:1.5px dashed rgba(102,221,170,0.45);border-radius:8px;padding:12px;margin-bottom:14px;">
          <div style="font-size:14px;font-weight:700;color:#88ffcc;margin-bottom:8px;">
            🎟️ A. 手動補發入場券
          </div>
          <div style="font-size:12px;color:#bbb;margin-bottom:10px;line-height:1.6;">
            <b style="color:#88ffcc;">使用情境</b>:玩家昨天有剩場次但因 BUG 雲端資料異常今早沒拿到券,
            或回報雲端守門誤判導致發券失敗時,GM 用此補發。
            <br><span style="color:#ffaaaa;">⚠ 補發後玩家持有上限仍是 5 張,超過會自動截斷。</span>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px;">
            <input id="_admin-ticket-grant-email" type="text" placeholder="玩家 email"
              style="flex:1.5;min-width:200px;padding:8px 12px;font-size:13px;background:rgba(20,20,30,0.9);
              border:1.5px solid rgba(102,221,170,0.4);color:#fff;border-radius:6px;font-family:monospace;">
            <span style="color:#888;font-size:12px;">或</span>
            <input id="_admin-ticket-grant-uid" type="text" placeholder="uid"
              style="flex:1;min-width:140px;padding:8px 12px;font-size:13px;background:rgba(20,20,30,0.9);
              border:1.5px solid rgba(102,221,170,0.4);color:#fff;border-radius:6px;font-family:monospace;">
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px;">
            <label style="font-size:13px;color:#ccc;display:flex;align-items:center;gap:6px;">
              補發張數:
              <input id="_admin-ticket-grant-n" type="number" min="1" max="5" value="1"
                style="width:60px;padding:6px 8px;font-size:13px;background:rgba(20,20,30,0.9);
                border:1.5px solid rgba(102,221,170,0.4);color:#fff;border-radius:6px;font-family:monospace;text-align:center;">
              張(1~5)
            </label>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
            <button id="_admin-ticket-grant-btn" style="padding:9px 18px;font-size:13px;font-weight:800;
              background:linear-gradient(135deg,#2a8a5a,#55cc88);border:2px solid #88ffcc;color:#fff;
              border-radius:7px;cursor:pointer;font-family:inherit;
              box-shadow:0 0 10px rgba(85,200,140,0.4);">
              🎟️ 補發入場券
            </button>
            <button id="_admin-ticket-query-btn" style="padding:9px 16px;font-size:13px;font-weight:700;
              background:rgba(60,100,80,0.4);border:1.5px solid rgba(150,220,180,0.5);color:#aaffcc;
              border-radius:7px;cursor:pointer;font-family:inherit;">
              📋 查持有數
            </button>
            <button id="_admin-ticket-clear-btn" style="padding:9px 16px;font-size:13px;font-weight:700;
              background:rgba(120,40,40,0.4);border:1.5px solid rgba(220,120,120,0.5);color:#ffaaaa;
              border-radius:7px;cursor:pointer;font-family:inherit;">
              🧹 清空(慎用)
            </button>
            <span id="_admin-ticket-status" style="font-size:12px;color:#aaa;"></span>
          </div>
          <div id="_admin-ticket-result" style="margin-top:10px;font-size:12px;color:#aaffcc;line-height:1.65;
            padding:0 8px;display:none;"></div>
        </div>
      </div>

      <!-- ★ v3.5.20 — 世界 BOSS 排行榜管理區塊(老師 2026-05-22 需求) -->
      <div id="_admin-wblb-section" style="background:rgba(40,30,50,0.5);border:2px solid rgba(200,140,255,0.5);border-radius:10px;padding:16px;margin-bottom:14px;">
        <div style="font-size:18px;font-weight:700;color:#ddaaff;margin-bottom:8px;">🏆 6. 世界 BOSS 排行榜管理</div>
        <div style="font-size:13px;color:#ccc;margin-bottom:10px;line-height:1.55;">
          清除目前世界 BOSS(維蘇威火山龍王)的全班累積排行榜紀錄。
          <br>⚠️ <b style="color:#ffaa66;">此操作不可逆!</b>建議在每學期/新一輪開始前清除一次,讓學生重新累積戰績。
        </div>
        <div id="_admin-wblb-info" style="font-size:13px;color:#bbb;background:rgba(0,0,0,0.35);border-radius:8px;padding:10px 12px;margin-bottom:10px;line-height:1.65;min-height:22px;">
          載入中…
        </div>
        <div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap;">
          <button id="_admin-wblb-refresh" style="padding:8px 14px;font-size:13px;font-weight:700;
            background:rgba(60,40,90,0.5);border:1.5px solid rgba(180,140,220,0.6);color:#ddaaff;
            border-radius:7px;cursor:pointer;font-family:inherit;">
            🔄 重新整理
          </button>
          <button id="_admin-wblb-clear-vesuvius" style="flex:1;padding:8px 14px;font-size:14px;font-weight:800;
            background:linear-gradient(135deg,rgba(140,60,180,0.6),rgba(90,30,140,0.8));
            border:2px solid #bb88ff;color:#fff;border-radius:8px;cursor:pointer;font-family:inherit;">
            🗑️ 清除「維蘇威火山龍王」排行榜
          </button>
        </div>
        <!-- ★ v3.5.22(2026-05-22) — 指定刪除異常紀錄(處理 BUG 不均衡傷害) -->
        <div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap;">
          <button id="_admin-wblb-detail" style="flex:1;padding:8px 14px;font-size:14px;font-weight:800;
            background:linear-gradient(135deg,rgba(60,140,200,0.55),rgba(40,80,160,0.85));
            border:2px solid #88ccff;color:#fff;border-radius:8px;cursor:pointer;font-family:inherit;">
            🔍 查看明細・指定刪除異常紀錄
          </button>
        </div>
        <div style="font-size:12px;color:#999;line-height:1.55;">
          💡 想清空所有 BOSS 排行(目前只有維蘇威):console 跑 <code style="color:#aaccff;">_wbHpSync.clearLeaderboard()</code>
        </div>
      </div>

      <!-- ★ v3.5.67(2026-05-23) — 小博士獎勵補發區塊(老師需求:手動結算 + 補發) -->
      <div id="_admin-wq-section" style="background:rgba(20,40,50,0.5);border:2px solid rgba(140,220,255,0.5);border-radius:10px;padding:16px;margin-bottom:14px;">
        <div style="font-size:18px;font-weight:700;color:#88ccff;margin-bottom:8px;">📊 7. 本週小博士排行榜管理</div>
        <div style="font-size:13px;color:#ccc;margin-bottom:10px;line-height:1.55;">
          自動結算「每週一 08:00」由第一個登入玩家觸發,寫入每位上榜玩家的 weeklyQuizPendingAward。
          <br>⚠️ 若 Firestore Rules 未開放跨玩家寫入,自動結算會失敗 → 用此處<b style="color:#ffcc66;">手動補發</b>。
        </div>
        <div id="_admin-wq-info" style="font-size:13px;color:#bbb;background:rgba(0,0,0,0.35);border-radius:8px;padding:10px 12px;margin-bottom:10px;line-height:1.65;min-height:22px;">
          載入中…
        </div>
        <!-- 主功能:查看本週 + 上週排名 -->
        <div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap;">
          <button id="_admin-wq-refresh" style="padding:8px 14px;font-size:13px;font-weight:700;
            background:rgba(40,70,90,0.5);border:1.5px solid rgba(140,200,255,0.6);color:#88ccff;
            border-radius:7px;cursor:pointer;font-family:inherit;">
            🔄 重新整理
          </button>
          <button id="_admin-wq-view-this" style="flex:1;padding:8px 14px;font-size:14px;font-weight:800;
            background:linear-gradient(135deg,rgba(40,140,200,0.5),rgba(30,90,160,0.7));
            border:2px solid #88ccff;color:#fff;border-radius:8px;cursor:pointer;font-family:inherit;">
            👀 查看本週前 10 名
          </button>
          <button id="_admin-wq-view-last" style="flex:1;padding:8px 14px;font-size:14px;font-weight:800;
            background:linear-gradient(135deg,rgba(200,140,40,0.5),rgba(160,90,30,0.7));
            border:2px solid #ffcc66;color:#fff;border-radius:8px;cursor:pointer;font-family:inherit;">
            📜 查看上週前 10 名 + 結算狀態
          </button>
        </div>
        <!-- 手動結算 -->
        <div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap;">
          <button id="_admin-wq-manual-settle" style="flex:1;padding:10px 14px;font-size:14px;font-weight:800;
            background:linear-gradient(135deg,rgba(140,180,80,0.55),rgba(80,140,40,0.8));
            border:2px solid #aaff66;color:#fff;border-radius:8px;cursor:pointer;font-family:inherit;">
            🎁 手動結算上週並補發前 10 名獎勵
          </button>
        </div>
        <!-- 補發單一玩家 -->
        <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;align-items:center;">
          <span style="font-size:13px;color:#aaa;">補發給單一玩家:</span>
          <input id="_admin-wq-uid" type="text" placeholder="貼上玩家 uid" 
            style="flex:1;min-width:200px;padding:6px 10px;font-size:13px;background:rgba(0,0,0,0.5);
            border:1px solid rgba(140,200,255,0.4);color:#fff;border-radius:6px;font-family:monospace;">
          <select id="_admin-wq-rank" style="padding:6px 10px;font-size:13px;background:rgba(0,0,0,0.5);
            border:1px solid rgba(140,200,255,0.4);color:#fff;border-radius:6px;font-family:inherit;">
            <option value="1">🥇 第 1 名(50000幣+10水晶+10書)</option>
            <option value="3">🥈 第 2-5 名(35000幣+6水晶+6書)</option>
            <option value="8">🥉 第 6-10 名(20000幣+3水晶+3書)</option>
          </select>
          <button id="_admin-wq-give" style="padding:8px 14px;font-size:13px;font-weight:800;
            background:linear-gradient(135deg,rgba(220,140,80,0.6),rgba(180,90,30,0.85));
            border:2px solid #ffaa66;color:#fff;border-radius:7px;cursor:pointer;font-family:inherit;">
            💰 補發
          </button>
        </div>
        <!-- ★ v3.6.10(2026-05-24) — 老師需求:刪除自己或異常的小博士排名 -->
        <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;align-items:center;
          padding-top:10px;border-top:1.5px dashed rgba(255,100,100,0.35);">
          <span style="font-size:13px;color:#ff9999;font-weight:700;">🗑️ 刪除排名:</span>
          <select id="_admin-wq-del-week" style="padding:6px 10px;font-size:13px;background:rgba(0,0,0,0.5);
            border:1px solid rgba(255,140,140,0.4);color:#fff;border-radius:6px;font-family:inherit;">
            <option value="this">📅 本週</option>
            <option value="last">📜 上週</option>
          </select>
          <input id="_admin-wq-del-uid" type="text" placeholder="貼上要刪除的玩家 uid" 
            style="flex:1;min-width:200px;padding:6px 10px;font-size:13px;background:rgba(0,0,0,0.5);
            border:1px solid rgba(255,140,140,0.4);color:#fff;border-radius:6px;font-family:monospace;">
          <button id="_admin-wq-del-btn" style="padding:8px 14px;font-size:13px;font-weight:800;
            background:linear-gradient(135deg,rgba(220,80,80,0.6),rgba(180,40,40,0.85));
            border:2px solid #ff6666;color:#fff;border-radius:7px;cursor:pointer;font-family:inherit;">
            🗑️ 刪除
          </button>
        </div>
        <div style="font-size:12px;color:#cc8888;line-height:1.55;margin-bottom:10px;
          padding:6px 10px;background:rgba(80,30,30,0.3);border-left:3px solid rgba(255,100,100,0.5);border-radius:4px;">
          ⚠️ 刪除後該玩家本週累計題數歸零(不影響歷史獎勵)。也可在「查看前 30 名」清單中點 🗑️ 直接刪除某玩家。
        </div>
        <div style="font-size:12px;color:#999;line-height:1.55;">
          💡 操作 API(F12 console):
          <br>&nbsp;&nbsp;<code style="color:#aaccff;">_weeklyQuiz.getTopN(50)</code> — 本週排名
          <br>&nbsp;&nbsp;<code style="color:#aaccff;">_weeklyQuiz.trySettleLastWeek()</code> — 嘗試結算上週
          <br>&nbsp;&nbsp;<code style="color:#aaccff;">_weeklyQuizSettlementFailed</code> — 自動結算失敗清單(若有的話)
        </div>
      </div>

            </div><!-- /#_admin-content -->
    </div><!-- /._admin-stats-card -->
  `;
  document.body.appendChild(pop);

  // ★ v3.5.0 — 面板區域性 state(關閉時要清掉)
  const _adminPanelState = {
    dlpermUnsub: null,
    susUnsub: null,
    dlpermList: [],
    susList: [],
    // ★ v3.5.20 — 排行榜事件監聽 abort controller
    wblbAbort: null,
    // ★ v3.5.22 — 排行榜明細 modal 的關閉函式(關後台時順手關掉)
    wblbDetailClose: null,
    // ★ v3.5.67 — 小博士補發區段事件監聽 abort controller
    wqAbort: null,
    // ★ v3.5.67 — 上週排名顯示彈窗的關閉函式
    wqDetailClose: null,
  };
  function _closeAdminPanel(){
    try {
      if(_adminPanelState.dlpermUnsub){
        try { _adminPanelState.dlpermUnsub(); } catch(_){}
        _adminPanelState.dlpermUnsub = null;
      }
      if(_adminPanelState.susUnsub){
        try { _adminPanelState.susUnsub(); } catch(_){}
        _adminPanelState.susUnsub = null;
      }
      // ★ v3.5.20 — 清掉排行榜事件監聽
      if(_adminPanelState.wblbAbort){
        try { _adminPanelState.wblbAbort.abort(); } catch(_){}
        _adminPanelState.wblbAbort = null;
      }
      // ★ v3.5.22 — 清掉明細 modal(如果還開著)
      if(typeof _adminPanelState.wblbDetailClose === 'function'){
        try { _adminPanelState.wblbDetailClose(); } catch(_){}
        _adminPanelState.wblbDetailClose = null;
      }
      // ★ v3.5.67 — 清掉小博士補發區段事件監聽
      if(_adminPanelState.wqAbort){
        try { _adminPanelState.wqAbort.abort(); } catch(_){}
        _adminPanelState.wqAbort = null;
      }
      // ★ v3.5.67 — 關掉上週排名顯示彈窗(如果還開著)
      if(typeof _adminPanelState.wqDetailClose === 'function'){
        try { _adminPanelState.wqDetailClose(); } catch(_){}
        _adminPanelState.wqDetailClose = null;
      }
    } catch(_){}
    pop.remove();
  }

  document.getElementById('_admin-close').onclick = _closeAdminPanel;
  pop.onclick = (ev) => { if(ev.target === pop) _closeAdminPanel(); };

  // ════════════════════════════════════════════════════════════════════
  // ★ v3.10.11 — Sidebar 渲染 + section 切換邏輯
  // ════════════════════════════════════════════════════════════════════
  (function _renderAdminSidebar(){
    // sidebar 項目定義(依目前重要性排序;對應到 DOM 內已存在的 section id)
    // ★ v3.11.35 階段 4d(2026-05-29) — 玩家活動記錄查詢插入第 3 位(老師指示)
    const SIDEBAR_ITEMS = [
      { sec: '_admin-maint-section',            label: '🔧 維修模式',              hint: '非管理員登入封鎖' },
      { sec: '_admin-gm-section',               label: '📢 GM 公告',                hint: '對所有在線玩家廣播' },
      { sec: '_admin-activity-section',         label: '📜 玩家活動記錄查詢',      hint: 'email/uid/姓名 查英雄/至寶/戰鬥/幣帳' },
      { sec: '_admin-bug-section',              label: '📥 接收錯誤回報',          hint: '查看玩家提交的 bug' },
      { sec: '_admin-lv1-section',              label: '🆘 Lv1 救援',              hint: '雲端三槽 + 反污染保護' },
      { sec: '_admin-pollution-check-section',  label: '📢 污染檢查提醒',          hint: '寄送進度污染提醒' },
      { sec: '_admin-rescue-section',           label: '🚑 玩家資料急救工具',      hint: '修復異常資料' },
      { sec: '_admin-comp-section',             label: '🎁 學生補償工具',          hint: '指定信箱發放補償' },
      { sec: '_admin-designer-grant-section',   label: '🦸 設計師英雄補發',        hint: '一鍵補發學生設計英雄' },
      { sec: '_admin-trust-revoke-section',     label: '🔒 撤銷信任裝置',          hint: '撤銷學生 PWA 信任裝置' },
      { sec: '_admin-dlperm-section',           label: '⬇️ 下載安裝權限',          hint: '管理 PWA 安裝授權' },
      // ★ v3.13.55 — 汙染工具合併:移除重疊/不安全(可直接收回、看不到 creatorUid 證據)的 4 個面板
      //   (🕵️可疑帳號偵測 / 🔍異常解鎖偵測 / 🧹帳號汙染掃描 / 🔬稀有暴增稽核),
      //   統一走唯一安全流程:🧹 汙染清查(掃描)→ 🔬 查活動頁(看 creatorUid 證據)→
      //   📢 發刪除預告(玩家可保留1、可復原、自動補償)。被移除的 section HTML/handler 變成無入口的死碼(無害)。
      { sec: '_admin-pollution-cluster-section', label: '🧹 汙染清查（掃描可疑帳號）', hint: 'SSR/SR序列分組找可疑帳號 → 🔴鐵證快速清單一鍵處理 + 🟡無紀錄者依豐富度(含至寶/獎章)推測原主 → 查活動頁刪汙染英雄/至寶(可復原+補償+玩家留1)' },
      { sec: '_admin-skin-recovery-section',    label: '🎨 皮膚復原/稽核',          hint: '查玩家買過哪些皮膚・跨槽復原・手動補發' },
      { sec: '_admin-medal-scan-section',        label: '🏅 全員獎章補發掃描',     hint: '反推未領獎章 + 補發水晶/幣' },
      { sec: '_admin-wblb-section',             label: '🏆 世界 BOSS 排行榜',      hint: '查看 / 清除排行' },
      { sec: '_admin-bonus-section',            label: '🎫 世界 BOSS 補償券',      hint: '掃描重複戰績 + 補進場機會' },
      { sec: '_admin-ticket-section',           label: '🎟️ 世界 BOSS 入場券',      hint: '補發/查詢/清空挑戰入場券' },
      { sec: '_admin-wq-section',               label: '📊 本週小博士排行榜',      hint: '結算 / 補發 / 刪除' },
      { sec: '_admin-bypass-section',           label: '🔓 解除冷卻 / 每日上限',   hint: '測試用' },
      { sec: '_admin-test-batch-section',       label: '🧪 批次設定數值',          hint: '測試工具' },
      { sec: '_admin-backfill-players-section', label: '📊 回填總玩家數',          hint: '統計校正' },
      { sec: '_admin-set-players-section',      label: '👥 手動設定總玩家數',      hint: '統計校正' },
      { sec: '_admin-set-adv-section',          label: '⚔️ 設定累計冒險次數',      hint: '統計校正' },
      // ★ v3.13.15(2026-06-02) — 鬥技場預設陣容管理(系統 5 套保底敵手)
      { sec: '_admin-arena-preset-section',     label: '⚔️ 鬥技場預設陣容',       hint: '管理系統 5 套保底敵手(玩家池空時用)' },
      // ★ v3.13.20(2026-06-02) — 鬥技場入口開關 + 戰鬥記錄審核
      { sec: '_admin-arena-switch-section',     label: '⚔ 鬥技場入口開關',       hint: '一鍵關閉/開啟全站鬥技場入口' },
      // ★ v3.13.72 — 課堂獎勵發放 + 鬥技場排名發獎開關
      { sec: '_admin-classreward-section',      label: '🎁 課堂獎勵發放',         hint: '勾選獎勵(克雷爾/自選券/隨機券/水晶/幣/果實)+貼名單→比對發放,寫送禮記錄' },
      { sec: '_admin-arena-rankreward-section', label: '🏆 鬥技場排名發獎開關',   hint: '一鍵開啟/關閉每週排名獎勵自動發放' },
      // ★ v3.13.27(2026-06-03) — GitHub 線上版本檢查
      { sec: '_admin-github-check-section',     label: '🌐 GitHub 版本檢查',      hint: '啟動時自動比對 4 個檔案;手動重跑入口' },
      // ★ v3.13.27(2026-06-03) — 龍王 HP 救援
      { sec: '_admin-wb-rescue-section',        label: '🐉 龍王 HP 救援',         hint: '被 BUG 秒殺後可恢復龍王血量' },
      { sec: '_admin-arena-battles-section',    label: '⚔ 鬥技場戰鬥記錄審核',   hint: '依平均單回合傷害排序,偵測異常 BUG 傷害' },
      { sec: '_admin-reset-section',            label: '⚠️ 帳號完全重置+重建',     hint: '危險!不可逆,最後手段' },
    ];

    const sidebarList = document.getElementById('_admin-sidebar-list');
    const welcome = document.getElementById('_admin-welcome');
    const titleEl = document.getElementById('_admin-current-title');

    if(!sidebarList){
      console.error('[v3.10.11] 找不到 #_admin-sidebar-list,sidebar 無法渲染');
      return;
    }

    // ★ v3.13.63 — 任務2:29 個項目併成 8 個可摺疊群組(只改側欄導覽;各工具 section 區塊完全不動)
    //   SIDEBAR_ITEMS 保持原樣(_switchAdminSection 仍靠它查標題/預設選第一個),只改渲染方式。
    const SIDEBAR_GROUPS = [
      { label:'🛠 系統管理',       secs:['_admin-maint-section','_admin-gm-section','_admin-github-check-section','_admin-dlperm-section','_admin-trust-revoke-section'] },
      { label:'🔎 玩家查詢與回報', secs:['_admin-activity-section','_admin-bug-section'] },
      { label:'🧹 帳號汙染處理',   secs:['_admin-pollution-cluster-section','_admin-pollution-check-section'] },
      { label:'🚑 資料救援與重置', secs:['_admin-lv1-section','_admin-rescue-section','_admin-reset-section'] },
      { label:'🎁 補償與補發',     secs:['_admin-comp-section','_admin-classreward-section','_admin-designer-grant-section','_admin-medal-scan-section','_admin-skin-recovery-section'] },
      { label:'🐉 世界 BOSS',      secs:['_admin-wblb-section','_admin-bonus-section','_admin-ticket-section','_admin-wb-rescue-section'] },
      { label:'⚔ 鬥技場',         secs:['_admin-arena-preset-section','_admin-arena-switch-section','_admin-arena-rankreward-section','_admin-arena-battles-section'] },
      { label:'📊 統計校正與測試', secs:['_admin-wq-section','_admin-backfill-players-section','_admin-set-players-section','_admin-set-adv-section','_admin-bypass-section','_admin-test-batch-section'] },
    ];
    const _secToItem = {};
    SIDEBAR_ITEMS.forEach(it => { _secToItem[it.sec] = it; });
    // 安全網:任何沒被分到群組的項目 → 自動歸到「🔧 其他」,保證沒有工具消失
    const _grouped = new Set();
    SIDEBAR_GROUPS.forEach(g => g.secs.forEach(s => _grouped.add(s)));
    const _ungrouped = SIDEBAR_ITEMS.filter(it => !_grouped.has(it.sec)).map(it => it.sec);
    const _renderGroups = _ungrouped.length ? SIDEBAR_GROUPS.concat([{ label:'🔧 其他', secs:_ungrouped }]) : SIDEBAR_GROUPS;

    // 渲染 sidebar(群組標題可收合;預設只展開第一組,其餘收合 → 把 29 項濃縮成 8 個標題)
    let _runIdx = 0;
    sidebarList.innerHTML = _renderGroups.map((g, gi) => {
      const _itemsHtml = g.secs.map(sec => {
        const it = _secToItem[sec];
        if(!it) return '';
        _runIdx++;
        return `<button class="admin-sidebar-item" data-sec="${it.sec}" title="${(it.hint || '').replace(/"/g,'&quot;')}">
           <span class="_si-num">${String(_runIdx).padStart(2, '0')}</span>${it.label}
         </button>`;
      }).join('');
      const _open = (gi === 0);
      return `<div class="admin-sidebar-group" data-gi="${gi}">
        <button type="button" class="admin-sidebar-group-header" data-gi="${gi}" style="width:100%;text-align:left;padding:9px 12px;margin:6px 0 2px;font-size:26px;font-weight:900;color:#aacdff;background:rgba(120,120,200,0.18);border:1px solid rgba(150,150,255,0.35);border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:7px;font-family:inherit;">
          <span class="_grp-arrow" style="font-size:11px;width:12px;">${_open?'▾':'▸'}</span>
          <span style="flex:1;">${g.label}</span>
          <span style="font-size:11px;color:#bbc;font-weight:700;">${g.secs.length}</span>
        </button>
        <div class="admin-sidebar-group-items" data-gi="${gi}" style="display:${_open?'block':'none'};padding-left:4px;">${_itemsHtml}</div>
      </div>`;
    }).join('');

    // 切換函式(全部走顯隱,DOM 不動)
    function _switchAdminSection(secId){
      // 1. 隱藏歡迎頁
      if(welcome) welcome.style.display = 'none';
      // 2. 隱藏所有 section
      const allSections = pop.querySelectorAll('[id^="_admin-"][id$="-section"]');
      allSections.forEach(el => { el.style.display = 'none'; });
      // 3. 顯示目標 section(inline style 強制覆蓋 CSS 的 display:none)
      const target = document.getElementById(secId);
      if(target){
        target.style.display = 'block';
      } else {
        console.warn('[v3.10.11] 切換 section 失敗,找不到:', secId);
      }
      // 4. 高亮按鈕
      sidebarList.querySelectorAll('.admin-sidebar-item').forEach(b => {
        b.classList.toggle('active', b.dataset.sec === secId);
      });
      // ★ v3.13.63 — 確保被選中項目所屬群組是展開的(程式化切換時也適用,如汙染掃描→活動頁)
      const _activeBtn = sidebarList.querySelector('.admin-sidebar-item.active');
      if(_activeBtn){
        const _box = _activeBtn.closest('.admin-sidebar-group-items');
        if(_box && _box.style.display === 'none'){
          _box.style.display = 'block';
          const _hdr = _box.previousElementSibling;
          const _arrow = _hdr && _hdr.querySelector('._grp-arrow');
          if(_arrow) _arrow.textContent = '▾';
        }
        try{ _activeBtn.scrollIntoView({ block:'nearest' }); }catch(_){}
      }
      // 5. 更新右側標題
      const item = SIDEBAR_ITEMS.find(x => x.sec === secId);
      if(item && titleEl){
        titleEl.textContent = item.label + (item.hint ? '  —  ' + item.hint : '');
      }
      // 6. 右側內容滑回頂部
      const contentEl = document.getElementById('_admin-content');
      if(contentEl) contentEl.scrollTop = 0;
    }

    // 綁定點擊
    sidebarList.addEventListener('click', (ev) => {
      // ★ v3.13.63 — 群組標題:展開/收合
      const hdr = ev.target.closest('.admin-sidebar-group-header');
      if(hdr){
        const gi = hdr.dataset.gi;
        const box = sidebarList.querySelector('.admin-sidebar-group-items[data-gi="'+gi+'"]');
        const arrow = hdr.querySelector('._grp-arrow');
        if(box){
          const _show = (box.style.display === 'none');
          box.style.display = _show ? 'block' : 'none';
          if(arrow) arrow.textContent = _show ? '▾' : '▸';
        }
        return;
      }
      const btn = ev.target.closest('.admin-sidebar-item');
      if(!btn) return;
      const secId = btn.dataset.sec;
      if(!secId) return;
      _switchAdminSection(secId);
    });

    // 預設選第一個(維修模式)
    setTimeout(() => {
      _switchAdminSection(SIDEBAR_ITEMS[0].sec);
    }, 0);

    // 暴露切換 API(方便外部或 debug 用)
    window._switchAdminSection = _switchAdminSection;

    console.log('[v3.10.11] ✅ GM 後台 sidebar 已渲染 (' + SIDEBAR_ITEMS.length + ' 個項目)');
  })();

  // ════════════════════════════════════════════════════════════════════
  // ★ v3.13.39(2026-06-04) — 帳號汙染掃描(暴增 SSR 收回)事件綁定
  //   後端在 index.html(window):_fbAdminScanInflatedRosters / _fbAdminBulkRemoveHeroes
  // ════════════════════════════════════════════════════════════════════
  (function _bindInflatedScan(){
    const _esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const _confirm = (msg) => (typeof window._customConfirm === 'function') ? window._customConfirm(msg) : Promise.resolve(window.confirm(msg));
    const _scanBtn  = document.getElementById('_admin-inflated-scan');
    const _thresEl  = document.getElementById('_admin-inflated-threshold');
    const _statusEl = document.getElementById('_admin-inflated-status');
    const _resultEl = document.getElementById('_admin-inflated-result');
    if(!_scanBtn || !_resultEl) return;

    function _rowHtml(p){
      const _names = (p.suspected || []).map(_esc).join('、');
      return '<div class="_inflated-row" data-uid="'+_esc(p.uid)+'" style="border:1px solid rgba(255,120,180,0.3);border-radius:8px;padding:10px 12px;margin-bottom:8px;background:rgba(0,0,0,0.35);">'
        + '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;align-items:center;">'
        +   '<div style="min-width:200px;"><b style="color:#fff;font-size:14px;">'+_esc(p.name||'(無名稱)')+'</b>'
        +     '<span style="color:#aac;font-size:11px;font-family:monospace;"> '+_esc(p.email||'')+'</span></div>'
        +   '<div style="font-size:12px;color:#ddd;">疑似 <b style="color:#ff88bb;font-size:15px;">'+p.suspectedCount+'</b> 隻'
        +     ' &nbsp;|&nbsp; SSR 共 '+p.ssrInRoster+'(有紀錄 '+p.ssrWithHistory+')'
        +     ' &nbsp;|&nbsp; 全英雄 '+p.totalUnlocked+' &nbsp;|&nbsp; 💰'+p.knowledgeCoins+' &nbsp;⭐Lv'+p.maxHeroLv+'</div>'
        + '</div>'
        + '<div style="margin-top:6px;font-size:12px;color:#ffd6e8;line-height:1.7;"><b>疑似汙染 SSR:</b>'+_names+'</div>'
        + '<div style="margin-top:8px;">'
        +   '<button class="_inflated-remove" data-uid="'+_esc(p.uid)+'" style="padding:7px 16px;font-size:13px;font-weight:800;'
        +     'background:rgba(255,80,80,0.22);border:2px solid #ff7777;color:#ffbbbb;border-radius:7px;cursor:pointer;font-family:inherit;">'
        +     '🗑 收回這 '+p.suspectedCount+' 隻 SSR</button>'
        +   '<span class="_inflated-rowmsg" style="margin-left:10px;font-size:12px;color:#aaffaa;"></span>'
        + '</div></div>';
    }

    let _lastPlayers = [];
    _scanBtn.onclick = async () => {
      const _thr = parseInt(_thresEl && _thresEl.value, 10) || 5;
      _statusEl.textContent = '⏳ 掃描全校玩家中(可能要幾秒)...';
      _resultEl.innerHTML = '';
      if(typeof window._fbAdminScanInflatedRosters !== 'function'){
        _statusEl.textContent = '';
        _resultEl.innerHTML = '<span style="color:#ff8888;">❌ _fbAdminScanInflatedRosters 未載入,請重新整理</span>';
        return;
      }
      try{
        const _r = await window._fbAdminScanInflatedRosters({ threshold: _thr });
        if(!_r || !_r.ok){
          _statusEl.textContent = '';
          _resultEl.innerHTML = '<span style="color:#ff8888;">❌ 掃描失敗:'+_esc((_r&&_r.reason)||'未知')+'</span>';
          return;
        }
        _lastPlayers = _r.players || [];
        _statusEl.textContent = '✅ 命中 ' + _r.count + ' 個帳號(疑似 SSR ≥ ' + _thr + ')';
        if(!_lastPlayers.length){
          _resultEl.innerHTML = '<div style="color:#aaffaa;padding:10px;">🎉 沒有符合條件的帳號,目前看起來乾淨。</div>';
          return;
        }
        _resultEl.innerHTML = _lastPlayers.map(_rowHtml).join('');
        _resultEl.querySelectorAll('._inflated-remove').forEach(btn => {
          btn.onclick = async () => {
            const _uid = btn.dataset.uid;
            const _p = _lastPlayers.find(x => x.uid === _uid);
            if(!_p) return;
            const _msg = btn.parentElement.querySelector('._inflated-rowmsg');
            const _ok = await _confirm('確定要從【' + (_p.name||_uid) + '】收回以下 ' + _p.suspectedCount
              + ' 隻疑似汙染 SSR 嗎?\n\n' + (_p.suspected||[]).join('、')
              + '\n\n收回後學生下次開遊戲會以雲端為準。此動作會記入稽核紀錄。');
            if(!_ok) return;
            btn.disabled = true; if(_msg){ _msg.style.color='#ccc'; _msg.textContent='收回中...'; }
            try{
              const _res = await window._fbAdminBulkRemoveHeroes(_uid, _p.suspected, { reason: '帳號汙染暴增 SSR 收回(GM 掃描)' });
              if(_res && _res.ok){
                if(_msg){ _msg.style.color='#aaffaa'; _msg.textContent = '✅ 已收回 ' + _res.removed + ' 隻,剩 ' + _res.remaining + ' 隻英雄。請告知學生重新整理。'; }
                btn.textContent = '✅ 已收回';
              } else {
                btn.disabled = false;
                if(_msg){ _msg.style.color='#ff8888'; _msg.textContent = '❌ 失敗:' + _esc((_res&&_res.reason)||'未知'); }
              }
            }catch(e){
              btn.disabled = false;
              if(_msg){ _msg.style.color='#ff8888'; _msg.textContent = '❌ 失敗:' + _esc(e.message||e); }
            }
          };
        });
      }catch(e){
        _statusEl.textContent = '';
        _resultEl.innerHTML = '<span style="color:#ff8888;">❌ 掃描失敗:'+_esc(e.message||e)+'</span>';
      }
    };
  })();

  // ════════════════════════════════════════════════════════════════════
  // ★ v3.13.41(2026-06-04) — 稀有暴增稽核(SSR+SR・分來源・逐隻勾選收回)事件綁定
  //   後端在 index.html(window):_fbAdminScanRareSpikes / _fbAdminBulkRemoveHeroes
  // ════════════════════════════════════════════════════════════════════
  (function _bindRareAudit(){
    const _esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const _confirm = (msg) => (typeof window._customConfirm === 'function') ? window._customConfirm(msg) : Promise.resolve(window.confirm(msg));
    const _scanBtn  = document.getElementById('_admin-rare-scan');
    const _winEl    = document.getElementById('_admin-rare-window');
    const _thresEl  = document.getElementById('_admin-rare-threshold');
    const _statusEl = document.getElementById('_admin-rare-status');
    const _resultEl = document.getElementById('_admin-rare-result');
    if(!_scanBtn || !_resultEl) return;

    // 來源分類 → 徽章樣式
    const _CAT_BADGE = {
      pollution: { txt:'🟥 不明汙染', bg:'rgba(255,80,80,0.22)',  bd:'#ff7777', fg:'#ffbbbb' },
      initial:   { txt:'🎒 初始角色', bg:'rgba(120,220,140,0.16)',bd:'#66cc88', fg:'#a8e8bf' },
      boss:      { txt:'🟧 BOSS解鎖', bg:'rgba(255,170,60,0.18)', bd:'#ffaa33', fg:'#ffd9a0' },
      summon:    { txt:'🟦 召喚',     bg:'rgba(100,170,255,0.18)',bd:'#66aaff', fg:'#aaccff' },
      gm:        { txt:'🟩 GM補償',   bg:'rgba(120,220,140,0.18)',bd:'#66cc88', fg:'#aaeebb' },
      other:     { txt:'⬜ 其他/未標記',bg:'rgba(180,180,180,0.15)',bd:'#999',   fg:'#ddd' },
    };
    function _catBadge(cat, source){
      const c = _CAT_BADGE[cat] || _CAT_BADGE.other;
      const _srcHint = (cat === 'other' && source) ? ('(' + _esc(source) + ')') : '';
      return '<span style="display:inline-block;padding:1px 7px;border-radius:5px;font-size:11px;font-weight:700;'
        + 'background:' + c.bg + ';border:1px solid ' + c.bd + ';color:' + c.fg + ';white-space:nowrap;">'
        + c.txt + _srcHint + '</span>';
    }
    function _rarBadge(rar){
      if(rar === 'SSR'){
        return '<span style="display:inline-block;padding:1px 6px;border-radius:5px;font-size:11px;font-weight:800;'
          + 'background:linear-gradient(135deg,#ff66cc,#ffcc33,#66ccff);color:#3a1a2a;white-space:nowrap;">🌈SSR</span>';
      }
      return '<span style="display:inline-block;padding:1px 6px;border-radius:5px;font-size:11px;font-weight:800;'
        + 'background:linear-gradient(135deg,#ffd33b,#e8a623);color:#3a2200;white-space:nowrap;">⭐SR</span>';
    }
    function _fmtTime(at){
      if(!at) return '<span style="color:#888;">—(無紀錄)</span>';
      try{ return '<span style="color:#bbb;">' + new Date(at).toLocaleString('zh-TW') + '</span>'; }
      catch(_){ return '<span style="color:#bbb;">' + at + '</span>'; }
    }

    function _heroRow(h){
      const _checked = (h.cat === 'pollution') ? ' checked' : '';
      return '<label class="_rare-hero-row" style="display:flex;align-items:center;gap:8px;padding:5px 6px;border-radius:6px;'
        + 'background:rgba(0,0,0,0.25);margin-bottom:4px;cursor:pointer;flex-wrap:wrap;">'
        + '<input type="checkbox" class="_rare-hero-cb" data-name="' + _esc(h.name) + '" data-cat="' + _esc(h.cat) + '"' + _checked
        + ' style="width:18px;height:18px;cursor:pointer;flex:0 0 auto;">'
        + _rarBadge(h.rarity)
        + '<b style="color:#fff;font-size:13px;min-width:96px;">' + _esc(h.name) + '</b>'
        + _catBadge(h.cat, h.source)
        + '<span style="font-size:11px;margin-left:auto;">' + _fmtTime(h.at) + '</span>'
        + '</label>';
    }

    function _cardHtml(p){
      const _cc = p.catCounts || {};
      const _short = _esc((p.uid || '').slice(0, 14));
      return '<div class="_rare-card" data-uid="' + _esc(p.uid) + '" style="border:1px solid rgba(180,140,255,0.35);border-radius:8px;padding:11px 13px;margin-bottom:10px;background:rgba(0,0,0,0.32);">'
        + '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;align-items:center;">'
        +   '<div style="min-width:200px;"><b style="color:#fff;font-size:14px;">' + _esc(p.name || '(無名稱)') + '</b>'
        +     '<span style="color:#aac;font-size:11px;font-family:monospace;"> ' + _esc(p.email || '') + ' · ' + _short + '…</span></div>'
        +   '<div style="font-size:12px;color:#ddd;">'
        +     '🌈SSR <b style="color:#ffccff;">' + p.ssrTotal + '</b> · ⭐SR <b style="color:#ffe066;">' + p.srTotal + '</b>'
        +     ' &nbsp;|&nbsp; <span style="color:#ff9a9a;">🟥汙染 ' + p.pollutionCount + '</span>'
        +     ' &nbsp; <span style="color:#ffd27a;">本窗新增 ' + p.recentCount + '</span>'
        +     ' &nbsp;|&nbsp; 💰' + p.knowledgeCoins + ' ⭐Lv' + p.maxHeroLv + '</div>'
        + '</div>'
        + '<div style="margin-top:5px;font-size:11px;color:#bb9;">'
        +   '分類:🟥' + (_cc.pollution||0) + ' · 🟧' + (_cc.boss||0) + ' · 🟦' + (_cc.summon||0) + ' · 🟩' + (_cc.gm||0) + ' · ⬜' + (_cc.other||0)
        + '</div>'
        + '<div style="margin-top:7px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">'
        +   '<button class="_rare-sel-pollution" type="button" style="padding:4px 11px;font-size:12px;font-weight:700;background:rgba(255,80,80,0.18);border:1.5px solid #ff7777;color:#ffbbbb;border-radius:6px;cursor:pointer;font-family:inherit;">只勾🟥不明汙染</button>'
        +   '<button class="_rare-sel-none" type="button" style="padding:4px 11px;font-size:12px;font-weight:700;background:rgba(150,150,150,0.15);border:1.5px solid #999;color:#ddd;border-radius:6px;cursor:pointer;font-family:inherit;">全部取消</button>'
        +   '<span style="font-size:12px;color:#cbb3ff;">已勾選 <b class="_rare-count" style="color:#fff;">0</b> 隻</span>'
        + '</div>'
        + '<div class="_rare-heroes" style="margin-top:7px;max-height:340px;overflow-y:auto;padding-right:4px;">'
        +   p.heroes.map(_heroRow).join('')
        + '</div>'
        + '<div style="margin-top:9px;">'
        +   '<button class="_rare-remove" type="button" style="padding:7px 16px;font-size:13px;font-weight:800;'
        +     'background:rgba(255,80,80,0.22);border:2px solid #ff7777;color:#ffbbbb;border-radius:7px;cursor:pointer;font-family:inherit;">'
        +     '🗑 收回勾選的英雄</button>'
        +   '<span class="_rare-rowmsg" style="margin-left:10px;font-size:12px;color:#aaffaa;"></span>'
        + '</div></div>';
    }

    function _wireCard(card, p){
      const _cbs = () => Array.prototype.slice.call(card.querySelectorAll('._rare-hero-cb'));
      const _countEl = card.querySelector('._rare-count');
      const _updateCount = () => { if(_countEl) _countEl.textContent = _cbs().filter(cb => cb.checked).length; };
      _cbs().forEach(cb => { cb.onchange = _updateCount; });
      _updateCount();
      const _selP = card.querySelector('._rare-sel-pollution');
      const _selN = card.querySelector('._rare-sel-none');
      if(_selP) _selP.onclick = () => { _cbs().forEach(cb => { cb.checked = (cb.dataset.cat === 'pollution'); }); _updateCount(); };
      if(_selN) _selN.onclick = () => { _cbs().forEach(cb => { cb.checked = false; }); _updateCount(); };
      const _rmBtn = card.querySelector('._rare-remove');
      const _msg   = card.querySelector('._rare-rowmsg');
      if(_rmBtn) _rmBtn.onclick = async () => {
        const _names = _cbs().filter(cb => cb.checked).map(cb => cb.dataset.name);
        if(!_names.length){ if(_msg){ _msg.style.color = '#ffcc66'; _msg.textContent = '⚠ 還沒勾選任何英雄'; } return; }
        const _ok = await _confirm('確定要從【' + (p.name || p.uid) + '】收回以下 ' + _names.length + ' 隻稀有英雄嗎?\n\n'
          + _names.join('、')
          + '\n\n⚠ 連同這些英雄的等級/技能/爆發都會一併清除。\n收回後學生下次開遊戲會以雲端為準。此動作會記入稽核紀錄。');
        if(!_ok) return;
        _rmBtn.disabled = true; if(_msg){ _msg.style.color = '#ccc'; _msg.textContent = '收回中...'; }
        try{
          const _res = await window._fbAdminBulkRemoveHeroes(p.uid, _names, { reason: '稀有暴增稽核收回(GM 勾選)' });
          if(_res && _res.ok){
            if(_msg){ _msg.style.color = '#aaffaa'; _msg.textContent = '✅ 已收回 ' + _res.removed + ' 隻,剩 ' + _res.remaining + ' 隻英雄。請告知學生重新整理。'; }
            _rmBtn.textContent = '✅ 已收回 ' + _res.removed + ' 隻';
            // 收回成功:把已勾選的列灰掉並停用
            _cbs().forEach(cb => { if(cb.checked){ cb.checked = false; cb.disabled = true; const row = cb.closest('._rare-hero-row'); if(row){ row.style.opacity = '0.4'; row.style.textDecoration = 'line-through'; } } });
            _updateCount();
          } else {
            _rmBtn.disabled = false;
            if(_msg){ _msg.style.color = '#ff8888'; _msg.textContent = '❌ 失敗:' + _esc((_res && _res.reason) || '未知'); }
          }
        }catch(e){
          _rmBtn.disabled = false;
          if(_msg){ _msg.style.color = '#ff8888'; _msg.textContent = '❌ 失敗:' + _esc(e.message || e); }
        }
      };
    }

    let _lastPlayers = [];
    _scanBtn.onclick = async () => {
      const _winMs = parseInt(_winEl && _winEl.value, 10) || 86400000;
      const _thr   = parseInt(_thresEl && _thresEl.value, 10) || 5;
      _statusEl.textContent = '⏳ 掃描全校玩家中(可能要幾秒)...';
      _resultEl.innerHTML = '';
      if(typeof window._fbAdminScanRareSpikes !== 'function'){
        _statusEl.textContent = '';
        _resultEl.innerHTML = '<span style="color:#ff8888;">❌ _fbAdminScanRareSpikes 未載入,請重新整理</span>';
        return;
      }
      try{
        const _r = await window._fbAdminScanRareSpikes({ windowMs: _winMs, threshold: _thr });
        if(!_r || !_r.ok){
          _statusEl.textContent = '';
          _resultEl.innerHTML = '<span style="color:#ff8888;">❌ 掃描失敗:' + _esc((_r && _r.reason) || '未知') + '</span>';
          return;
        }
        _lastPlayers = _r.players || [];
        const _winTxt = (_winEl && _winEl.options[_winEl.selectedIndex] && _winEl.options[_winEl.selectedIndex].text) || '';
        _statusEl.textContent = '✅ 命中 ' + _r.count + ' 個帳號(門檻 ≥ ' + _thr + ',時間窗 ' + _winTxt + ')';
        if(!_lastPlayers.length){
          _resultEl.innerHTML = '<div style="color:#aaffaa;padding:10px;">🎉 沒有符合條件的帳號,目前看起來乾淨。</div>';
          return;
        }
        _resultEl.innerHTML = _lastPlayers.map(_cardHtml).join('');
        _resultEl.querySelectorAll('._rare-card').forEach(card => {
          const _p = _lastPlayers.find(x => x.uid === card.dataset.uid);
          if(_p) _wireCard(card, _p);
        });
      }catch(e){
        _statusEl.textContent = '';
        _resultEl.innerHTML = '<span style="color:#ff8888;">❌ 掃描失敗:' + _esc(e.message || e) + '</span>';
      }
    };
  })();

  // ════════════════════════════════════════════════════════════════════
  // ★ v3.13.47 — 同台 iPad 汙染分組(SSR/SR 序列相同 + 班級座號 + 原始/被汙染)
  // ════════════════════════════════════════════════════════════════════
  (function _bindPollutionClusters(){
    const _esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const _confirm = (msg) => (typeof window._customConfirm === 'function') ? window._customConfirm(msg) : Promise.resolve(window.confirm(msg));
    const _scanBtn  = document.getElementById('_admin-cluster-scan');
    const _minSeqEl = document.getElementById('_admin-cluster-minseq');
    const _minMemEl = document.getElementById('_admin-cluster-minmembers');
    const _statusEl = document.getElementById('_admin-cluster-status');
    const _resultEl = document.getElementById('_admin-cluster-result');
    if(!_scanBtn || !_resultEl) return;

    function _classSeat(email){
      try{
        const r = (typeof window._getRosterEntry==='function') ? window._getRosterEntry((email||'').toLowerCase()) : null;
        if(!r) return '';
        const m = String(r.class||'').match(/(\d+)\s*年\s*(\d+)\s*班/);
        const code = m ? (m[1]+m[2]+String(r.seatNo||'').padStart(2,'0')) : '';
        return code + (r.surname||'') + '同學';
      }catch(_){ return ''; }
    }
    const _rar = (r) => r==='SSR' ? '🌈' : '⭐';
    function _roleBadge(role){
      if(role==='original') return '<span style="padding:1px 7px;border-radius:5px;font-size:11px;font-weight:800;background:rgba(120,220,140,0.2);border:1px solid #66cc88;color:#aaeebb;">🟢 原始解鎖者(鐵證)</span>';
      if(role==='polluted') return '<span style="padding:1px 7px;border-radius:5px;font-size:11px;font-weight:800;background:rgba(255,80,80,0.2);border:1px solid #ff7777;color:#ffbbbb;">🔴 被汙染(鐵證)</span>';
      if(role==='likely_original') return '<span style="padding:1px 7px;border-radius:5px;font-size:11px;font-weight:800;background:rgba(230,200,80,0.18);border:1px solid #ddcc55;color:#ffe89a;" title="無 creatorUid 鐵證, 依豐富度(英雄等級+解鎖數+至寶+獎章+知識幣)推測為原主">🟡 推測原主(依豐富度)</span>';
      if(role==='likely_polluted') return '<span style="padding:1px 7px;border-radius:5px;font-size:11px;font-weight:800;background:rgba(240,150,70,0.18);border:1px solid #ee9944;color:#ffcc99;" title="無 creatorUid 鐵證, 依豐富度推測為被汙染(較不豐富)">🟠 推測被汙染(依豐富度)</span>';
      return '<span style="padding:1px 7px;border-radius:5px;font-size:11px;font-weight:800;background:rgba(180,180,180,0.15);border:1px solid #999;color:#ddd;">⬜ 待確認</span>';
    }
    // ★ v3.13.49b — 最佳身分顯示:名冊真名 → 暱稱 → 班級座號 → email → uid
    function _who(m){
      return (m.rosterName||'').trim() || (m.name||'').trim() || _classSeat(m.email) || (m.email||'') || (m.uid||'') || '(未知)';
    }
    // ★ v3.13.51 — 同台 iPad 判斷:年級+座號(忽略班級)。例「5年1班1號」與「5年2班1號」→ 同 key "5-1" = 共用同一台
    function _ipadKey(m){
      try{
        const r = (typeof window._getRosterEntry==='function') ? window._getRosterEntry((m.email||'').toLowerCase()) : null;
        if(!r || r.seatNo==null || r.seatNo==='') return null;
        const mm = String(r.class||'').match(/(\d+)\s*年\s*(\d+)\s*班/);
        if(!mm) return null;
        return mm[1] + '-' + String(r.seatNo);   // 年級-座號
      }catch(_){ return null; }
    }
    function _seatCode(m){
      try{
        const r = (typeof window._getRosterEntry==='function') ? window._getRosterEntry((m.email||'').toLowerCase()) : null;
        if(!r) return '';
        const mm = String(r.class||'').match(/(\d+)\s*年\s*(\d+)\s*班/);
        return mm ? (mm[1]+'年'+mm[2]+'班'+String(r.seatNo||'')+'號') : '';
      }catch(_){ return ''; }
    }
    function _memberHtml(m, sharedKeys){
      sharedKeys = sharedKeys || new Set();
      const ssr = (m.ssrList||[]).map(s => {
        const own = (s.creatorUid && s.creatorUid===m.ownUid);
        const uHint = !s.creatorUid ? '<span style="color:#888;">無紀錄</span>'
          : own ? '<span style="color:#9af0b0;">本人建立</span>'
          : '<span style="color:#ff9a9a;">複製自 '+_esc(s.creatorUid)+'…</span>';
        const lvStr = '<span style="color:#ffe066;font-weight:800;">Lv.'+(s.lv||0)+'</span>';
        return '<div style="display:flex;gap:6px;align-items:center;padding:2px 5px;font-size:11px;flex-wrap:wrap;">'
          + _rar(s.rarity)+' <b style="color:#fff;">'+_esc(s.name)+'</b> '+lvStr+' '+uHint
          + '</div>';
      }).join('');
      // ★ v3.13.63 — 鐵證至寶(creatorUid 為他人 / cat=pollution)獨立一行,方便老師看到「至寶」也被汙染
      const _ironTre = (m.ironTreasures||[]);
      const _treHtml = _ironTre.length
        ? '<div style="margin-top:4px;padding:3px 6px;font-size:11px;color:#ffb3b3;background:rgba(255,80,80,0.1);border-radius:5px;">💎 鐵證至寶:'
          + _ironTre.map(t => '<b style="color:#fff;">'+_esc(t.name)+'</b> Lv.'+(t.lv||1)+(t.creatorUid?('（<span style="color:#ff9a9a;">複製自 '+_esc(t.creatorUid)+'…</span>）'):'（查無紀錄）')).join('、')
          + '</div>'
        : '';
      const _dispName = (m.name||'').trim();
      const _nick = (_dispName && _dispName !== _who(m)) ? ' <span style="color:#9ab;font-size:11px;">暱稱:'+_esc(_dispName)+'</span>' : '';
      const _isGuest = !(m.email||'').trim() && !(m.rosterName||'').trim() && !_dispName;
      const _guestBadge = _isGuest ? ' <span style="padding:1px 6px;border-radius:5px;font-size:10px;background:rgba(150,150,160,0.2);border:1px solid #889;color:#cdd;" title="無 email/暱稱/名冊資料 — 多為未登入或訪客帳號">🔓 訪客/未註冊</span>' : '';
      // 座號 / 同台 iPad 標籤(僅名冊內學生有)
      const _sc = _seatCode(m);
      const _ik = _ipadKey(m);
      let _seatBadge = '';
      if(_sc){
        const _shared = _ik && sharedKeys.has(_ik);
        _seatBadge = _shared
          ? ' <span style="padding:1px 7px;border-radius:5px;font-size:11px;font-weight:800;background:rgba(255,90,90,0.22);border:1px solid #ff7777;color:#ffbbbb;" title="與本組其他人座號相同=共用同一台 iPad">🪧 同台iPad '+_esc(_sc)+'</span>'
          : ' <span style="padding:1px 6px;border-radius:5px;font-size:10px;background:rgba(120,160,255,0.15);border:1px solid #6699cc;color:#cfe3ff;">🪧 '+_esc(_sc)+'</span>';
      }
      const _idLine = '<div style="font-size:10px;color:#8a90a0;font-family:monospace;margin-top:3px;word-break:break-all;">🆔 帳號:<span style="user-select:all;background:rgba(255,255,255,0.06);padding:1px 4px;border-radius:3px;">'+_esc(m.uid||'(無)')+'</span>'+(m.email?(' ・ ✉ <span style="user-select:all;">'+_esc(m.email)+'</span>'):'')+'</div>';
      return '<div class="_cl-member" data-uid="'+_esc(m.uid)+'" style="border:1px solid rgba(255,120,160,0.25);border-radius:7px;padding:8px 10px;margin-bottom:7px;background:rgba(0,0,0,0.25);">'
        + '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">'
        + _roleBadge(m.role)
        + ' <b style="color:#fff;font-size:14px;">'+_esc(_who(m))+'</b>'
        + _guestBadge + _seatBadge + _nick
        + ' <span style="color:#bbb;font-size:11px;margin-left:auto;">本人建立 '+(m.selfCreated||0)+' · 複製 '+(m.foreignCreated||0)+' · 總解鎖 '+m.totalUnlocked+' · ⭐最高Lv'+m.maxHeroLv+' · <span style="color:#ffe066;">稀有Lv總和 '+(m.clusterHeroLvSum||0)+'</span> · 💎至寶 '+(m.treasureCount||0)+' · 🏅獎章 '+(m.medalCount||0)+' · <span style="color:#9fe0ff;" title="豐富度分數 = 稀有Lv總和×5 + 全英雄Lv + 最高Lv×3 + 解鎖×10 + 至寶×30 + 獎章×20 + 知識幣/100。數字越高越可能是原主。">豐富度 '+(m.richnessScore||0)+'</span></span>'
        + '</div>'
        + _idLine
        + '<div style="margin-top:5px;max-height:200px;overflow-y:auto;">'+ssr+'</div>'
        + _treHtml
        + '<div style="margin-top:8px;">'
        + '<button class="_cl-open-activity" type="button" style="padding:8px 18px;font-size:13px;font-weight:800;background:linear-gradient(135deg,#ff8a3d,#e0632a);color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:inherit;box-shadow:0 2px 8px rgba(255,120,50,0.4);">🔬 查此帳號活動頁 → 挑選汙染英雄/至寶刪除</button>'
        + '<span class="_cl-msg" style="margin-left:10px;font-size:12px;color:#aaffaa;"></span>'
        + '</div></div>';
    }
    function _clusterHtml(c){
      let tag, tagCss;
      if(c.isPollution){ tag='🔴 鐵證群'; tagCss='background:rgba(255,80,80,0.22);border:1.5px solid #ff7777;color:#ffbbbb;'; }
      else if(c.hasCreatorEvidence){ tag='🔷 疑似群'; tagCss='background:rgba(120,170,255,0.18);border:1.5px solid #6699ff;color:#cfe3ff;'; }
      else { tag='🟡 待人工判斷群'; tagCss='background:rgba(230,200,80,0.18);border:1.5px solid #ddcc55;color:#ffe89a;'; }
      const exact = c.exactTimeMatch ? ' <span style="color:#ff9a9a;font-size:11px;">⏱時間戳完全相同</span>' : '';
      let evNote = '';
      if(c.evidence==='creatorUid') evNote = '⚠ creatorUid 顯示有「跨帳號複製」(鐵證)→ 紅色「被汙染」者可直接處理。';
      else if(c.evidence==='exactTime') evNote = '⏱ 解鎖時間戳完全相同(同一次解鎖被整份複製, 鐵證)。';
      else if(c.evidence==='creatorUid_no_foreign') evNote = '✓ 有解鎖紀錄、creatorUid 都是本人 — 較可能是「撞序列/活動」而非汙染, 刪前務必再確認。';
      else evNote = '⚠ 此組稀有英雄全為「無紀錄」(多為 2026/5/28 前的舊英雄)→ 沒有 creatorUid 鐵證。系統已用「豐富度」(英雄等級+解鎖數+至寶+獎章+知識幣)推測 🟡原主 / 🟠被汙染(分數越高越可能是原主),但這是推測非鐵證 — 請搭配下方「🪧 同台 iPad(座號相同)」人工判斷;建議用「發刪除預告」(玩家可保留+可復原), 不要直接收回。';
      const evCss = c.isPollution ? 'color:#ffbbbb;' : 'color:#ffe89a;';
      // ★ v3.13.51 — 同台 iPad 偵測:組內「年級+座號」相同者 = 共用同一台 iPad(忽略班級)
      const _members = c.members || [];
      const _ipadGroups = {};
      _members.forEach(m => { const k=_ipadKey(m); if(k){ (_ipadGroups[k]=_ipadGroups[k]||[]).push(m); } });
      const _sharedKeys = new Set(Object.keys(_ipadGroups).filter(k => _ipadGroups[k].length >= 2));
      let _ipadNote = '';
      if(_sharedKeys.size){
        const _parts = Array.from(_sharedKeys).map(k => '年級'+k.split('-')[0]+' 座號'+k.split('-')[1]+'('+_ipadGroups[k].length+'人)');
        _ipadNote = '<div style="font-size:11px;line-height:1.5;margin-bottom:7px;padding:6px 9px;border-radius:6px;background:rgba(255,90,90,0.14);color:#ffcaca;border:1px solid rgba(255,120,120,0.5);">🪧 <b>同台 iPad(座號相同)</b>:'+_parts.join('、')+' → 這些人共用同一台平板, <b>汙染可能性高</b>。請判斷誰是真正擁有者, 對另一位按下方按鈕發刪除預告。</div>';
      }
      return '<div class="_cl-group" style="border:2px solid rgba(255,120,160,0.4);border-radius:9px;padding:11px 13px;margin-bottom:14px;background:rgba(0,0,0,0.32);">'
        + '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:5px;">'
        + '<span style="padding:2px 9px;border-radius:6px;font-size:12px;font-weight:800;'+tagCss+'">'+tag+'</span>'+exact
        + ' <b style="color:#fff;font-size:13px;">'+c.memberCount+' 人共用</b>'
        + ' <span style="color:#ddd;font-size:12px;">序列 '+c.seqLen+' 隻:'+_esc(c.orderSig)+'</span>'
        + '</div>'
        + '<div style="font-size:11px;line-height:1.5;margin-bottom:7px;padding:5px 8px;border-radius:6px;background:rgba(0,0,0,0.3);'+evCss+'">'+evNote+'</div>'
        + _ipadNote
        + _members.map(m => _memberHtml(m, _sharedKeys)).join('')
        + '</div>';
    }
    function _wire(){
      _resultEl.querySelectorAll('._cl-member').forEach(card => {
        const uid = card.dataset.uid;
        const openBtn = card.querySelector('._cl-open-activity');
        const msg = card.querySelector('._cl-msg');
        if(openBtn) openBtn.onclick = () => {
          if(!uid){ if(msg){ msg.style.color='#ffcc66'; msg.textContent='⚠ 無帳號 ID,無法開啟'; } return; }
          try{
            // 1) 切到「玩家活動記錄查詢」section
            if(typeof window._switchAdminSection === 'function') window._switchAdminSection('_admin-activity-section');
            // 2) 帶入此帳號 uid + 送出查詢（等 section 顯示後）
            setTimeout(()=>{
              try{
                const _q = document.getElementById('_admin-activity-query');
                const _searchBtn = document.getElementById('_admin-activity-search');
                if(_q) _q.value = uid;
                const _sec = document.getElementById('_admin-activity-section');
                if(_sec) _sec.scrollIntoView({ behavior:'smooth', block:'start' });
                if(_searchBtn) _searchBtn.click();
              }catch(_e2){ console.warn('[汙染分組→活動頁] 送出查詢失敗', _e2); }
            }, 140);
            openBtn.textContent = '✅ 已開啟活動頁（按「發出刪除預告」挑選刪除）';
            openBtn.disabled = true; openBtn.style.opacity = '0.7';
          }catch(e){ if(msg){ msg.style.color='#ff8888'; msg.textContent='❌ '+_esc(e.message||e); } }
        };
      });
    }
    // ★ v3.13.63 — (A) 鐵證快速清單:跨所有組,凡帶 creatorUid 鐵證(英雄/至寶從別帳號複製來)的帳號集中一張表
    function _ironPanelHtml(ironList){
      ironList = Array.isArray(ironList) ? ironList : [];
      if(!ironList.length){
        return '<div style="margin-bottom:14px;padding:9px 12px;border-radius:8px;background:rgba(120,220,140,0.12);border:1px solid #66cc88;color:#bfeccb;font-size:12px;line-height:1.5;">✅ <b>鐵證快速清單</b>:本次掃描沒有任何帶 creatorUid 鐵證(英雄/至寶確定從別帳號複製)的帳號。下方分組多為 5/28 前「無紀錄」舊資料 → 已用豐富度推測原主, 仍請人工判斷。</div>';
      }
      const _totalHero = ironList.reduce((s,a)=>s+(a.heroCount||0),0);
      const _totalTre  = ironList.reduce((s,a)=>s+(a.treasureCount||0),0);
      const _rows = ironList.map(a => {
        const _heroStr = (a.heroes||[]).map(h => _rar(h.rarity)+' <b style="color:#fff;">'+_esc(h.name)+'</b> Lv.'+(h.lv||0)+'<span style="color:#ff9a9a;font-size:10px;">(複製自 '+_esc(h.creatorUid)+'…)</span>').join('、') || '<span style="color:#888;">—</span>';
        const _treStr  = (a.treasures||[]).map(t => '💎 <b style="color:#fff;">'+_esc(t.name)+'</b> Lv.'+(t.lv||1)+(t.creatorUid?('<span style="color:#ff9a9a;font-size:10px;">(複製自 '+_esc(t.creatorUid)+'…)</span>'):'<span style="color:#caa;font-size:10px;">(查無紀錄)</span>')).join('、');
        return '<div class="_iron-row" data-uid="'+_esc(a.uid)+'" style="border:1px solid rgba(255,90,90,0.35);border-radius:7px;padding:8px 10px;margin-bottom:7px;background:rgba(0,0,0,0.25);">'
          + '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:4px;">'
          + _roleBadge(a.role)
          + ' <b style="color:#fff;font-size:13px;">'+_esc(_who(a))+'</b>'
          + ' <span style="color:#ffbbbb;font-size:11px;">鐵證英雄 '+(a.heroCount||0)+' 隻'+(a.treasureCount?(' · 鐵證至寶 '+a.treasureCount+' 件'):'')+'</span>'
          + '<span class="_iron-msg" style="margin-left:auto;font-size:11px;color:#aaffaa;"></span>'
          + '</div>'
          + '<div style="font-size:11px;line-height:1.6;color:#ffe;">'+_heroStr+(_treStr?('<br>'+_treStr):'')+'</div>'
          + '<div style="margin-top:7px;">'
          + '<button class="_iron-open-activity" type="button" style="padding:7px 15px;font-size:12px;font-weight:800;background:linear-gradient(135deg,#ff5a5a,#c83030);color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:inherit;">🔬 處理此帳號(查活動頁 → 汙染項目已自動勾選 → 逐帳號確認後刪)</button>'
          + '</div></div>';
      }).join('');
      return '<div style="margin-bottom:16px;border:2px solid #ff7777;border-radius:10px;padding:12px 13px;background:rgba(255,60,60,0.1);">'
        + '<div style="font-size:14px;font-weight:900;color:#ffd0d0;margin-bottom:6px;">🔴 鐵證快速清單(建議優先處理)</div>'
        + '<div style="font-size:11px;color:#ffcaca;margin-bottom:9px;line-height:1.55;">以下 <b>'+ironList.length+'</b> 個帳號帶有 creatorUid <b>鐵證</b>(英雄/至寶確定是從別帳號複製來),共 '+_totalHero+' 隻英雄 / '+_totalTre+' 件至寶。點按鈕跳到該帳號活動頁 →「發出刪除預告」時汙染項目<b>已自動勾選</b>,逐帳號確認後即可刪(自動補償+通知+可復原+玩家至少留 1 隻)。</div>'
        + _rows
        + '</div>';
    }
    function _wireIron(){
      _resultEl.querySelectorAll('._iron-open-activity').forEach(btn => {
        const row = btn.closest('._iron-row');
        const uid = row && row.dataset.uid;
        const msg = row && row.querySelector('._iron-msg');
        btn.onclick = () => {
          if(!uid){ if(msg){ msg.style.color='#ffcc66'; msg.textContent='⚠ 無帳號 ID'; } return; }
          try{
            if(typeof window._switchAdminSection === 'function') window._switchAdminSection('_admin-activity-section');
            setTimeout(()=>{
              try{
                const _q = document.getElementById('_admin-activity-query');
                const _searchBtn = document.getElementById('_admin-activity-search');
                if(_q) _q.value = uid;
                const _sec = document.getElementById('_admin-activity-section');
                if(_sec) _sec.scrollIntoView({ behavior:'smooth', block:'start' });
                if(_searchBtn) _searchBtn.click();
              }catch(_e2){ console.warn('[鐵證清單→活動頁] 送出查詢失敗', _e2); }
            }, 140);
            btn.textContent = '✅ 已開啟活動頁（發出刪除預告 → 汙染已勾選 → 套用刪除）';
            btn.disabled = true; btn.style.opacity = '0.7';
          }catch(e){ if(msg){ msg.style.color='#ff8888'; msg.textContent='❌ '+_esc(e.message||e); } }
        };
      });
    }
    _scanBtn.onclick = async () => {
      const minSeq = parseInt(_minSeqEl && _minSeqEl.value,10)||2;
      const minMem = parseInt(_minMemEl && _minMemEl.value,10)||2;
      if(_statusEl){ _statusEl.style.color='#aaccff'; _statusEl.textContent='⏳ 掃描全校中(可能要幾秒)...'; }
      _resultEl.innerHTML='';
      if(typeof window._fbAdminScanPollutionClusters!=='function'){ if(_statusEl) _statusEl.textContent=''; _resultEl.innerHTML='<span style="color:#ff8888;">❌ _fbAdminScanPollutionClusters 未載入,請重新整理</span>'; return; }
      try{
        const r = await window._fbAdminScanPollutionClusters({ minSeq:minSeq, minMembers:minMem });
        if(!r || !r.ok){ if(_statusEl) _statusEl.textContent=''; _resultEl.innerHTML='<span style="color:#ff8888;">❌ '+_esc((r&&r.reason)||'失敗')+'</span>'; return; }
        const cl = r.clusters||[];
        const _ironN = (r.ironList||[]).length;
        if(_statusEl){ _statusEl.style.color='#88ddaa'; _statusEl.textContent='✅ '+cl.length+' 組(掃 '+r.totalPlayers+' 位有 SSR/SR 的玩家)'+(_ironN?(' ・ 🔴 鐵證帳號 '+_ironN+' 個'):''); }
        if(!cl.length){ _resultEl.innerHTML='<div style="color:#aaffaa;padding:10px;">🎉 沒有發現序列相同的分組,目前看起來乾淨。</div>'; return; }
        _resultEl.innerHTML = _ironPanelHtml(r.ironList) + cl.map(_clusterHtml).join('');
        _wire(); _wireIron();
      }catch(e){ if(_statusEl) _statusEl.textContent=''; _resultEl.innerHTML='<span style="color:#ff8888;">❌ '+_esc(e.message||e)+'</span>'; }
    };
  })();

  // ════════════════════════════════════════════════════════════════════
  // ★ v3.13.47 — 皮膚復原 / 稽核(查擁有皮膚・跨槽復原・手動補發)
  // ════════════════════════════════════════════════════════════════════
  (function _bindSkinRecovery(){
    const _esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const _confirm = (msg) => (typeof window._customConfirm === 'function') ? window._customConfirm(msg) : Promise.resolve(window.confirm(msg));
    const _queryEl  = document.getElementById('_admin-skin-query');
    const _searchBtn= document.getElementById('_admin-skin-search');
    const _statusEl = document.getElementById('_admin-skin-status');
    const _resultEl = document.getElementById('_admin-skin-result');
    if(!_searchBtn || !_resultEl) return;

    function _classSeat(email){
      try{
        const r = (typeof window._getRosterEntry==='function') ? window._getRosterEntry((email||'').toLowerCase()) : null;
        if(!r) return '';
        const m = String(r.class||'').match(/(\d+)\s*年\s*(\d+)\s*班/);
        const code = m ? (m[1]+m[2]+String(r.seatNo||'').padStart(2,'0')) : '';
        return code + (r.surname||'') + '同學';
      }catch(_){ return ''; }
    }
    // 皮膚目錄(商店 / 等級 / 名稱);延遲建立以確保資料常數已載入
    let _cat = null;
    function _C(){
      if(_cat) return _cat;
      const paid = {}, level = {}, nameOf = {};
      try{ if(typeof BACKPACK_ITEM_DEF !== 'undefined') Object.keys(BACKPACK_ITEM_DEF).forEach(k => { const it=BACKPACK_ITEM_DEF[k]; if(it && it.type==='portrait' && it.heroName && it.portraitId) paid[it.portraitId]={hero:it.heroName, productName:it.name||k}; }); }catch(_){}
      try{ if(typeof _LV_UNLOCK_PORTRAITS !== 'undefined') Object.keys(_LV_UNLOCK_PORTRAITS).forEach(h => { const d=_LV_UNLOCK_PORTRAITS[h]; ((d&&d.ids)||[]).forEach(id => { level[id]=h; }); }); }catch(_){}
      try{ if(typeof HERO_PORTRAIT_LIBRARY !== 'undefined') Object.keys(HERO_PORTRAIT_LIBRARY).forEach(h => { (HERO_PORTRAIT_LIBRARY[h]||[]).forEach(p => { if(p&&p.id) nameOf[h+'|'+p.id]=p.name||p.id; }); }); }catch(_){}
      _cat = { paid, level, nameOf }; return _cat;
    }
    const _classify = (id) => { const c=_C(); return c.paid[id] ? 'shop' : (c.level[id] ? 'level' : 'other'); };

    async function _resolveUid(input){
      const s = String(input||'').trim();
      if(!s) throw new Error('請輸入 email / uid / 姓名 / 班級座號');
      if(s.includes('@')){
        if(typeof window._fbAdminFindPlayerByEmail!=='function') throw new Error('_fbAdminFindPlayerByEmail 未載入');
        const f = await window._fbAdminFindPlayerByEmail(s);
        if(!f || !f.uid) throw new Error('找不到此 email 對應的玩家'); return f.uid;
      }
      if(/^[A-Za-z0-9-]{20,}$/.test(s)) return s;
      // 班級碼 / 學號:後端 _fbAdminFindPlayerByEmail 已擴充支援單一命中
      if(typeof window._fbAdminFindPlayerByEmail==='function'){
        try{ const f = await window._fbAdminFindPlayerByEmail(s); if(f && f.uid) return f.uid; }catch(_){}
      }
      if(typeof window._fbAdminFindPlayersByName==='function'){
        const r = await window._fbAdminFindPlayersByName(s);
        const ps = (r && r.players) || [];
        if(!ps.length) throw new Error('找不到「'+s+'」對應的玩家');
        if(ps.length===1) return ps[0].uid;
        const e = new Error('多筆'); e._multi=true; e.candidates=ps; throw e;
      }
      throw new Error('查無玩家');
    }

    function _slotMark(audit, hero, id){
      const has = (slot) => { const p=(audit.slots[slot]&&audit.slots[slot].portraits)||{}; return Array.isArray(p[hero]) && p[hero].includes(id); };
      return (has('main')?'主':'·')+'/'+(has('live')?'live':'·')+'/'+(has('safe')?'safe':'·');
    }
    function _grantPickerHtml(){
      const c=_C(); const byHero={};
      Object.keys(c.paid).forEach(id => { const o=c.paid[id]; (byHero[o.hero]=byHero[o.hero]||[]).push({id, name:o.productName}); });
      const opts = Object.keys(byHero).sort().map(h => byHero[h].map(s => '<option value="'+_esc(h)+'|'+_esc(s.id)+'">'+_esc(h)+' — '+_esc((c.nameOf[h+'|'+s.id])||s.name||s.id)+'</option>').join('')).join('');
      return '<div style="border:1px dashed rgba(120,200,255,0.4);border-radius:8px;padding:10px 12px;margin-top:8px;background:rgba(0,0,0,0.25);">'
        + '<div style="font-size:13px;font-weight:700;color:#9fd6ff;margin-bottom:6px;">➕ 手動補發皮膚(三槽都查無、但學生有憑證時)</div>'
        + '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">'
        + '<select id="_skin-grant-pick" style="flex:1;min-width:240px;padding:7px 10px;background:rgba(14,22,30,0.9);border:1.5px solid rgba(120,200,255,0.5);color:#fff;border-radius:6px;font-family:inherit;font-size:13px;"><option value="">— 選一個商店皮膚 —</option>'+opts+'</select>'
        + '<button id="_skin-grant-btn" style="padding:7px 16px;font-size:13px;font-weight:800;background:rgba(120,200,255,0.2);border:2px solid #88bbff;color:#cfe3ff;border-radius:7px;cursor:pointer;font-family:inherit;">補發</button>'
        + '<span id="_skin-grant-msg" style="font-size:12px;color:#aaffaa;align-self:center;"></span>'
        + '</div></div>';
    }
    function _render(audit){
      const c=_C();
      const _union = audit.unionPortraits || {};
      const _choice = audit.choice || {};
      const heroes = Object.keys(_union).filter(h => (_union[h]||[]).length);
      let shopN=0, levelN=0, otherN=0;
      heroes.forEach(h => (_union[h]||[]).forEach(id => { const k=_classify(id); if(k==='shop') shopN++; else if(k==='level') levelN++; else otherN++; }));
      const histMap = {}; (audit.skinHistory||[]).forEach(e => { if(e&&e.hero&&e.id) histMap[e.hero+'|'+e.id]=e; });
      let html = '<div style="border:1px solid rgba(120,200,255,0.35);border-radius:8px;padding:11px 13px;margin-bottom:10px;background:rgba(0,0,0,0.3);">'
        + '<div style="font-size:14px;color:#fff;"><b>'+_esc(audit.name||'(無名稱)')+'</b> '
        + '<span style="color:#9fd6ff;font-size:12px;font-weight:700;">'+_esc(_classSeat(audit.email))+'</span> '
        + '<span style="color:#aac;font-size:11px;font-family:monospace;">'+_esc(audit.email||'')+'</span></div>'
        + '<div style="margin-top:5px;font-size:12px;color:#ddd;">皮膚合計 <b style="color:#fff;">'+(shopN+levelN+otherN)+'</b> 個 — '
        + '<span style="color:#9af0b0;">🟢 商店 '+shopN+'</span> · <span style="color:#cfe3ff;">🔷 等級 '+levelN+'</span> · <span style="color:#ddd;">⬜ 其他 '+otherN+'</span></div>'
        + '<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">'
        + '<button id="_skin-recover-btn" style="padding:7px 16px;font-size:13px;font-weight:800;background:rgba(80,180,120,0.22);border:2px solid #66cc88;color:#aaeebb;border-radius:7px;cursor:pointer;font-family:inherit;">🛟 一鍵跨槽復原皮膚(含選用)</button>'
        + '<span id="_skin-recover-msg" style="font-size:12px;color:#aaffaa;align-self:center;"></span></div></div>';
      html += heroes.sort().map(h => {
        const ids = _union[h]||[];
        const rows = ids.map(id => {
          const k=_classify(id);
          const badge = k==='shop' ? '<span style="color:#9af0b0;">🟢商店</span>' : k==='level' ? '<span style="color:#cfe3ff;">🔷等級</span>' : '<span style="color:#ddd;">⬜其他</span>';
          const nm = (c.nameOf[h+'|'+id]) || id;
          const chosen = (_choice[h]===id) ? ' <span style="color:#ffe066;">★使用中</span>' : '';
          const hist = histMap[h+'|'+id];
          const histTxt = hist ? (' <span style="color:#888;font-size:10px;">['+_esc(hist.source||'')+(hist.at?(' '+new Date(hist.at).toLocaleDateString('zh-TW')):'')+']</span>') : '';
          return '<div style="display:flex;gap:8px;align-items:center;padding:3px 6px;font-size:12px;flex-wrap:wrap;">'
            + badge+' <b style="color:#fff;">'+_esc(nm)+'</b> <span style="color:#789;font-size:10px;">'+_esc(id)+'</span>'+chosen+histTxt
            + ' <span style="margin-left:auto;color:#9ab;font-size:10px;">槽:'+_esc(_slotMark(audit,h,id))+'</span></div>';
        }).join('');
        return '<div style="border:1px solid rgba(120,200,255,0.2);border-radius:7px;padding:7px 10px;margin-bottom:6px;background:rgba(0,0,0,0.22);">'
          + '<div style="font-size:13px;font-weight:700;color:#9fd6ff;margin-bottom:3px;">'+_esc(h)+' <span style="color:#789;font-size:11px;">('+ids.length+')</span></div>'+rows+'</div>';
      }).join('');
      html += _grantPickerHtml();
      _resultEl.innerHTML = html;
      _wire(audit);
    }
    function _wire(audit){
      const rb = document.getElementById('_skin-recover-btn');
      const rm = document.getElementById('_skin-recover-msg');
      if(rb) rb.onclick = async () => {
        const ok = await _confirm('確定把【'+(audit.name||audit.uid)+'】三槽的皮膚聯集後復原回三槽嗎?\n(只增不減,連同玩家選用的皮膚一起還原;學生下次開遊戲生效)');
        if(!ok) return;
        rb.disabled=true; if(rm){ rm.style.color='#ccc'; rm.textContent='復原中...'; }
        try{
          const r = await window._fbAdminRecoverSkins(audit.uid);
          if(r && r.ok){ if(rm){ rm.style.color='#aaffaa'; rm.textContent='✅ 已聯集復原 '+r.portraitCount+' 個皮膚到三槽。請告知學生重新整理。'; } rb.textContent='✅ 已復原'; }
          else { rb.disabled=false; if(rm){ rm.style.color='#ff8888'; rm.textContent='❌ '+_esc((r&&r.reason)||'失敗'); } }
        }catch(e){ rb.disabled=false; if(rm){ rm.style.color='#ff8888'; rm.textContent='❌ '+_esc(e.message||e); } }
      };
      const gb = document.getElementById('_skin-grant-btn');
      const gp = document.getElementById('_skin-grant-pick');
      const gm = document.getElementById('_skin-grant-msg');
      if(gb) gb.onclick = async () => {
        const v = gp && gp.value; if(!v){ if(gm){ gm.style.color='#ffcc66'; gm.textContent='⚠ 先選一個皮膚'; } return; }
        const parts = v.split('|'); const hero=parts[0], id=parts[1];
        const ok = await _confirm('補發皮膚「'+hero+' — '+((_C().nameOf[hero+'|'+id])||id)+'」給【'+(audit.name||audit.uid)+'】?');
        if(!ok) return;
        gb.disabled=true; if(gm){ gm.style.color='#ccc'; gm.textContent='補發中...'; }
        try{
          const r = await window._fbAdminGrantSkins(audit.uid, [{hero:hero, id:id}]);
          if(r && r.ok){ if(gm){ gm.style.color='#aaffaa'; gm.textContent='✅ 已補發(新增 '+r.added+' 個)。可再按「查皮膚」確認。'; } gb.disabled=false; }
          else { gb.disabled=false; if(gm){ gm.style.color='#ff8888'; gm.textContent='❌ '+_esc((r&&r.reason)||'失敗'); } }
        }catch(e){ gb.disabled=false; if(gm){ gm.style.color='#ff8888'; gm.textContent='❌ '+_esc(e.message||e); } }
      };
    }
    async function _doQuery(){
      const input = (_queryEl && _queryEl.value || '').trim();
      if(!input){ if(_statusEl){ _statusEl.style.color='#ffaa66'; _statusEl.textContent='請先輸入'; } return; }
      if(_statusEl){ _statusEl.style.color='#aaccff'; _statusEl.textContent='查詢中...'; }
      _searchBtn.disabled=true; _resultEl.innerHTML='';
      try{
        if(typeof window._fbAdminAuditSkins!=='function') throw new Error('_fbAdminAuditSkins 未載入,請重新整理');
        const uid = await _resolveUid(input);
        const a = await window._fbAdminAuditSkins(uid);
        if(!a || !a.ok) throw new Error((a&&a.reason)||'查詢失敗');
        _render(a);
        if(_statusEl){ _statusEl.style.color='#88ddaa'; _statusEl.textContent='✅ uid='+uid.slice(0,12)+'…'; }
      }catch(e){
        if(e && e._multi && Array.isArray(e.candidates)){
          if(_statusEl){ _statusEl.style.color='#ffcc66'; _statusEl.textContent='多筆候選,請點選'; }
          _resultEl.innerHTML = e.candidates.map(cnd =>
            '<button class="_skin-cand" data-uid="'+_esc(cnd.uid)+'" style="display:block;width:100%;text-align:left;margin-bottom:5px;padding:8px 12px;background:rgba(120,200,255,0.12);border:1px solid rgba(120,200,255,0.4);color:#dff0ff;border-radius:7px;cursor:pointer;font-family:inherit;">'
            + _esc(cnd.displayName||cnd.name||'(無名稱)')+' <span style="color:#9fd6ff;">'+_esc(_classSeat(cnd.email))+'</span> <span style="color:#789;font-size:11px;">'+_esc(cnd.email||'')+'</span></button>'
          ).join('');
          _resultEl.querySelectorAll('._skin-cand').forEach(b => b.onclick = async () => {
            _searchBtn.disabled=true; if(_statusEl){ _statusEl.style.color='#aaccff'; _statusEl.textContent='查詢中...'; }
            try{ const a = await window._fbAdminAuditSkins(b.dataset.uid); _render(a); if(_statusEl){ _statusEl.style.color='#88ddaa'; _statusEl.textContent='✅'; } }
            catch(err){ if(_statusEl){ _statusEl.style.color='#ff8888'; _statusEl.textContent='❌ '+_esc(err.message||err); } }
            finally{ _searchBtn.disabled=false; }
          });
        } else {
          if(_statusEl){ _statusEl.style.color='#ff8888'; _statusEl.textContent='❌ '+_esc(e.message||e); }
        }
      } finally { _searchBtn.disabled=false; }
    }
    _searchBtn.onclick = _doQuery;
    if(_queryEl) _queryEl.addEventListener('keydown', e => { if(e.key==='Enter'){ e.preventDefault(); _doQuery(); } });
  })();

  // ★ v1.0.20260510.5820 — 解除冷卻 / 每日次數限制按鈕
  //   每個按鈕對應一種限制,按下後執行重置並顯示結果訊息(累積在 _admin-bypass-result)
  (function _bindAdminBypassButtons(){
    const _resultEl = document.getElementById('_admin-bypass-result');
    if(!_resultEl) return;
    const _log = (msg, ok) => {
      const _color = (ok === false) ? '#ff8888' : '#aaffcc';
      const _line = document.createElement('div');
      _line.style.cssText = 'color:' + _color + ';margin-bottom:3px;';
      _line.textContent = msg;
      _resultEl.appendChild(_line);
      // 自動捲到面板底部讓使用者看到訊息
      try{ _resultEl.scrollIntoView({ block:'nearest', behavior:'smooth' }); }catch(_){}
    };
    const _resetKing = () => {
      try{
        const _kc = window._kingChallenge;
        if(!_kc){ _log('⚠️ 知識王資料尚未載入', false); return false; }
        _kc._todayClaimed = false;
        _kc._snapshot = null;
        _kc._isPlaying = false;
        try{ if(typeof _kingSaveToCloud === 'function') _kingSaveToCloud(); }catch(_){}
        try{ if(typeof _kingUpdateFloatBtn === 'function') _kingUpdateFloatBtn(); }catch(_){}
        _log('✅ 已重置「今日知識王挑戰」(_todayClaimed=false, 清除快照)');
        return true;
      }catch(e){ _log('❌ 知識王重置失敗:' + (e && e.message), false); return false; }
    };
    const _resetPreview = () => {
      try{
        if(typeof _medalStats !== 'object' || !_medalStats){ _log('⚠️ _medalStats 尚未載入', false); return false; }
        _medalStats.previewTodayJpCoins = 0;
        _medalStats.previewTodayTwCoins = 0;
        try{ if(typeof _saveMedals === 'function') _saveMedals(); }catch(_){}
        _log('✅ 已重置預習練習答題每日上限(日本關 + 台灣關 = 0/500)');
        return true;
      }catch(e){ _log('❌ 預習練習重置失敗:' + (e && e.message), false); return false; }
    };
    const _resetCloudSync = () => {
      try{
        // 移除 cooldown 變數
        try{ window._manualCloudSyncCooldown = 0; }catch(_){}
        // 清除 localStorage 中當日次數計數(掃描所有 lxps_manual_cloudsync_count_ 開頭的 key)
        let _removed = 0;
        try{
          const _keys = [];
          for(let i = 0; i < localStorage.length; i++){
            const _k = localStorage.key(i);
            if(_k && (_k.indexOf('lxps_manual_cloudsync_count_') === 0 || _k.indexOf('manualCloudSyncCount_') === 0)) _keys.push(_k);
          }
          _keys.forEach(k => { try{ localStorage.removeItem(k); _removed++; }catch(_){} });
        }catch(_){}
        _log('✅ 已重置雲端同步:清除 cooldown 與每日 50 次計數(刪了 ' + _removed + ' 筆 localStorage)');
        return true;
      }catch(e){ _log('❌ 雲端同步重置失敗:' + (e && e.message), false); return false; }
    };
    const _resetBugReport = () => {
      try{
        // 掃描所有 bug 回報相關 key,以 lxps_bugreport / lxps_lastbugreport 開頭都重置
        let _removed = 0;
        try{
          const _keys = [];
          for(let i = 0; i < localStorage.length; i++){
            const _k = localStorage.key(i);
            if(_k && (_k.indexOf('lxps_bugreport') === 0 || _k.indexOf('lxps_lastbug') === 0 || _k.indexOf('bugreport_lastSent') === 0)) _keys.push(_k);
          }
          _keys.forEach(k => { try{ localStorage.removeItem(k); _removed++; }catch(_){} });
        }catch(_){}
        _log('✅ 已重置錯誤回報冷卻(刪了 ' + _removed + ' 筆 localStorage 紀錄)');
        return true;
      }catch(e){ _log('❌ 錯誤回報冷卻重置失敗:' + (e && e.message), false); return false; }
    };
    const _resetFriendArena = () => {
      try{
        let _removed = 0;
        try{
          const _keys = [];
          for(let i = 0; i < localStorage.length; i++){
            const _k = localStorage.key(i);
            // 好友互動每日上限相關的 key 通常是 lxps_friend_xxx_count_yyyy-mm-dd
            if(_k && (_k.indexOf('lxps_friend_') === 0 || _k.indexOf('friendArena') === 0 || _k.indexOf('friend_help_count_') === 0 || _k.indexOf('friend_visit_count_') === 0)) _keys.push(_k);
          }
          _keys.forEach(k => { try{ localStorage.removeItem(k); _removed++; }catch(_){} });
        }catch(_){}
        _log('✅ 已清除好友互動每日次數(刪了 ' + _removed + ' 筆 localStorage)');
        return true;
      }catch(e){ _log('❌ 好友互動計數清除失敗:' + (e && e.message), false); return false; }
    };
    const _bind = (id, fn) => {
      const _btn = document.getElementById(id);
      if(_btn) _btn.onclick = () => fn();
    };
    _bind('_admin-bypass-king', _resetKing);
    _bind('_admin-bypass-preview', _resetPreview);
    _bind('_admin-bypass-cloudsync', _resetCloudSync);
    _bind('_admin-bypass-bugreport', _resetBugReport);
    _bind('_admin-bypass-friendarena', _resetFriendArena);
    const _allBtn = document.getElementById('_admin-bypass-all');
    if(_allBtn){
      _allBtn.onclick = () => {
        _resultEl.innerHTML = '';
        _log('⚡ 開始一鍵解除...');
        _resetKing();
        _resetPreview();
        _resetCloudSync();
        _resetBugReport();
        _resetFriendArena();
        _log('━━━━━━━━━━ 全部完成 ━━━━━━━━━━');
      };
    }
  })();

  const _refreshBugBtn = document.getElementById('_admin-bug-refresh');
  const _bugListEl     = document.getElementById('_admin-bug-list');
  const _bugCountEl    = document.getElementById('_admin-bug-count');

  // ★ HTML 跳脫,避免玩家送出 <script> 之類的內容造成 admin panel 注入
  const _escHtml = (s) => {
    if(s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  // 來源頁面標籤(英文 → 中文)
  const _pageLabel = (p) => {
    if(p === 'battle')        return '🎮 戰鬥中';
    if(p === 'stage_select')  return '🗺 關卡選擇頁';
    return '📍 ' + (p || '其他');
  };

  const _renderBugList = (list) => {
    if(!_bugListEl) return;
    if(!Array.isArray(list) || list.length === 0){
      _bugListEl.innerHTML = '<div style="padding:14px;color:#aaa;font-size:13px;text-align:center;">'
        + '🎉 目前沒有任何錯誤回報' + '</div>';
      if(_bugCountEl) _bugCountEl.textContent = '共 0 筆';
      return;
    }
    if(_bugCountEl) _bugCountEl.textContent = '共 ' + list.length + ' 筆';
    // ★ v1.0.20260512.6310 — 內容預覽長度;v6210 自動診斷報告動輒數千字,
    //   全部直接渲染會把清單撐爆,改成預設只秀前 _PREVIEW_LEN 字,加「展開全文」。
    const _PREVIEW_LEN = 280;
    // 把每筆完整 content 暫存到一個 map,展開/複製時用,避免一次塞超大 HTML
    const _fullContentMap = {};
    let _html = '';
    list.forEach((item) => {
      const _id      = _escHtml(item.id);
      const _email   = _escHtml(item.email || '(訪客)');
      const _rawContent = (item.content || '(空)').toString();
      _fullContentMap[item.id] = _rawContent;
      const _isLong = _rawContent.length > _PREVIEW_LEN;
      const _previewRaw = _isLong ? _rawContent.slice(0, _PREVIEW_LEN) + '…' : _rawContent;
      const _previewEsc = _escHtml(_previewRaw);
      const _time    = _escHtml(item.time || '?');
      const _ver     = _escHtml(item.version || '?');
      const _page    = _escHtml(_pageLabel(item.page));
      // ★ v3.4.6 — 管理員既有回覆(若有)
      const _adminReplyRaw = (item.adminReply || '').toString();
      const _adminReplyEsc = _escHtml(_adminReplyRaw);
      const _adminReplyTime = _escHtml(item.adminReplyTime || '');
      const _hasReply = !!_adminReplyRaw.trim();
      // ★ v3.5.42 — 玩家勾選的 BUG 分類(若有)
      const _CAT_DISPLAY = {
        dead_lock:         { ic: '🛑', lbl: '對手不動卡死',           color: '#ff8866' },
        skill_no_response: { ic: '⚡', lbl: '技能/爆發沒反應',          color: '#ffaa66' },
        data_incorrect:    { ic: '📋', lbl: '英雄/資產/解鎖不正確',    color: '#ff6699' },
        quiz_error:        { ic: '❓', lbl: '題目錯誤',                color: '#aacc66' },
        crash_quit:        { ic: '💥', lbl: '跳出遊戲',                color: '#cc6666' },
        battle_lost:       { ic: '⚔',  lbl: '戰鬥沒繼續',              color: '#cc99ff' },
        other:             { ic: '📝', lbl: '其他',                    color: '#aaaaaa' },
      };
      const _cats = Array.isArray(item.categories) ? item.categories : [];
      const _catTagsHtml = _cats.length > 0
        ? _cats.map(c => {
            const _d = _CAT_DISPLAY[c] || { ic: '🏷', lbl: c, color: '#aaa' };
            return '<span style="display:inline-block;padding:2px 8px;margin:2px 4px 2px 0;'
              + 'font-size:11px;font-weight:700;border-radius:10px;'
              + 'background:rgba(255,255,255,0.06);border:1px solid ' + _d.color + ';'
              + 'color:' + _d.color + ';">' + _d.ic + ' ' + _escHtml(_d.lbl) + '</span>';
          }).join('')
        : '';
      _html +=
        '<div data-bug-id="' + _id + '" style="margin-bottom:8px;padding:10px 12px;border-radius:8px;text-align:left;'
        + 'background:rgba(255,140,200,0.06);border:1px solid rgba(255,140,200,0.25);position:relative;">'
        +   '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:4px;">'
        +     '<div style="font-size:13px;font-weight:700;color:#ffaadd;flex:1;word-break:break-all;">'
        +       '📧 ' + _email
        +     '</div>'
        +     '<div style="display:flex;gap:5px;flex:0 0 auto;">'
        +       '<button class="_bug-lookup-btn" data-uid="' + _escHtml(item.uid || '') + '" data-email="' + _escHtml(item.email || '') + '" '
        +         'style="padding:4px 10px;font-size:12px;font-weight:800;cursor:pointer;'
        +         'background:linear-gradient(135deg,rgba(200,150,255,0.35),rgba(150,100,220,0.35));'
        +         'border:1.5px solid #cc99ee;color:#e0c0ff;'
        +         'border-radius:5px;font-family:inherit;'
        +         'box-shadow:0 0 6px rgba(200,150,255,0.3);">🔬 查此學生資料</button>'
        +       '<button class="_bug-copy-btn" data-id="' + _id + '" '
        +         'style="padding:4px 10px;font-size:12px;font-weight:800;cursor:pointer;'
        +         'background:linear-gradient(135deg,rgba(120,200,255,0.35),rgba(80,160,220,0.35));'
        +         'border:1.5px solid #66bbff;color:#ddf0ff;'
        +         'border-radius:5px;font-family:inherit;'
        +         'box-shadow:0 0 6px rgba(120,200,255,0.3);">📋 複製給 Claude</button>'
        +       '<button class="_bug-del-btn" data-id="' + _id + '" '
        +         'style="padding:3px 8px;font-size:12px;font-weight:700;cursor:pointer;'
        +         'background:rgba(255,80,80,0.2);border:1px solid #ff6666;color:#ffaaaa;'
        +         'border-radius:5px;font-family:inherit;">🗑 刪除</button>'
        +     '</div>'
        +   '</div>'
        +   '<div style="font-size:11px;color:#888;margin-bottom:6px;">'
        +     '🕐 ' + _time + ' &nbsp;|&nbsp; ' + _page + ' &nbsp;|&nbsp; ' + _ver
        +     ' &nbsp;|&nbsp; <span style="color:#aaa;">' + _rawContent.length + ' 字</span>'
        +     (_hasReply ? ' &nbsp;|&nbsp; <span style="color:#88ccff;font-weight:700;">✓ 已回覆</span>' : '')
        +   '</div>'
        // ★ v3.5.42 — 分類標籤(玩家勾選的 BUG 類型)
        +   (_catTagsHtml ? '<div style="margin-bottom:6px;">' + _catTagsHtml + '</div>' : '')
        +   '<div class="_bug-content" data-id="' + _id + '" data-expanded="0" '
        +       'style="font-size:13px;color:#ddd;line-height:1.55;padding-left:8px;'
        +       'border-left:2px solid rgba(255,140,200,0.5);white-space:pre-wrap;word-break:break-word;'
        +       'font-family:ui-monospace,Menlo,Consolas,monospace;">'
        +     _previewEsc
        +   '</div>'
        +   (_isLong
            ? '<button class="_bug-toggle-btn" data-id="' + _id + '" '
              + 'style="margin-top:6px;padding:4px 12px;font-size:12px;font-weight:700;cursor:pointer;'
              + 'background:rgba(255,200,100,0.15);border:1px solid #ffcc66;color:#ffdd99;'
              + 'border-radius:5px;font-family:inherit;">📖 展開全文(' + _rawContent.length + ' 字)</button>'
            : '')
        // ★ v3.4.6 — 管理員回覆區塊:textarea + 儲存按鈕
        +   '<div style="margin-top:10px;padding:10px 12px;background:rgba(80,140,200,0.10);'
        +       'border:1px solid rgba(120,200,255,0.4);border-left:3px solid #66bbff;border-radius:6px;">'
        +     '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">'
        +       '<div style="font-size:12px;font-weight:800;color:#aaccff;letter-spacing:1px;">'
        +         '👨‍🏫 老師回信給玩家'
        +         (_hasReply ? ' <span style="font-weight:400;color:#88aabb;font-size:10px;margin-left:6px;">上次回覆:' + _adminReplyTime + '</span>' : '')
        +       '</div>'
        +       '<button class="_bug-reply-save-btn" data-id="' + _id + '" '
        +           'style="padding:4px 12px;font-size:12px;font-weight:800;cursor:pointer;'
        +           'background:linear-gradient(135deg,rgba(120,200,255,0.4),rgba(80,160,220,0.4));'
        +           'border:1.5px solid #66bbff;color:#fff;border-radius:5px;font-family:inherit;'
        +           'box-shadow:0 0 6px rgba(120,200,255,0.3);">'
        +         '💾 儲存回覆'
        +       '</button>'
        +     '</div>'
        +     '<textarea class="_bug-reply-textarea" data-id="' + _id + '" maxlength="4000" '
        +         'placeholder="輸入給玩家的回覆(例:已修正,請更新後重試 / 此情況屬於設計,並非 bug...)" '
        +         'style="width:100%;min-height:60px;padding:8px 10px;font-size:13px;'
        +         'background:rgba(0,0,0,0.4);border:1px solid rgba(120,200,255,0.4);'
        +         'color:#e8f4ff;border-radius:6px;font-family:inherit;line-height:1.5;'
        +         'resize:vertical;box-sizing:border-box;outline:none;">' + _adminReplyEsc + '</textarea>'
        +     '<div class="_bug-reply-status" data-id="' + _id + '" style="margin-top:4px;font-size:11px;color:#88aabb;min-height:14px;text-align:right;"></div>'
        +   '</div>'
        + '</div>';
    });
    _bugListEl.innerHTML = _html;
    // 暫存,讓 toggle/copy handler 取得完整內容
    _bugListEl._fullContentMap = _fullContentMap;

    // ★ v3.5.30 / ★ v3.13.49(2026-06-05)— 綁定「🔬 查此學生資料」按鈕
    //   v3.13.49 改向:點下後直接開「📜 玩家活動記錄查詢」頁(取代舊的「填補償工具」),
    //   自動帶入 uid/email 並送出 → 老師收到 BUG 回報後一鍵看到該學生「完整」雲端資料
    //   (英雄 owned-centric + 來源/汙染 + 裝備至寶 + 至寶/戰鬥/幣帳/勳章/背包/寵物/答題等全記錄)。
    _bugListEl.querySelectorAll('._bug-lookup-btn').forEach(btn => {
      btn.onclick = (ev) => {
        ev.stopPropagation();
        const _uid = btn.getAttribute('data-uid') || '';
        const _email = btn.getAttribute('data-email') || '';
        try{
          const _val = _uid || _email;   // 優先用 uid(更穩)
          if(!_val){ alert('此回報沒有 uid 與 email,無法自動查詢'); return; }
          // 1) 切到「玩家活動記錄查詢」section
          if(typeof window._switchAdminSection === 'function'){
            window._switchAdminSection('_admin-activity-section');
          }
          // 2) 帶入查詢字串 + 送出(等 section 顯示後)
          setTimeout(()=>{
            try{
              const _q = document.getElementById('_admin-activity-query');
              const _searchBtn = document.getElementById('_admin-activity-search');
              if(_q) _q.value = _val;
              const _sec = document.getElementById('_admin-activity-section');
              if(_sec) _sec.scrollIntoView({ behavior:'smooth', block:'start' });
              if(_searchBtn) _searchBtn.click();
            }catch(_e2){ console.warn('[bug lookup] 送出查詢失敗', _e2); }
          }, 120);
          // 3) 視覺回饋
          btn.textContent = '✅ 已開啟活動查詢';
          setTimeout(()=>{ btn.innerHTML = '🔬 查此學生資料'; }, 1600);
        }catch(eL){
          console.error('[bug lookup] 失敗', eL);
          alert('查詢失敗:' + (eL.message || eL));
        }
      };
    });

    // 綁定每張卡片的刪除按鈕
    _bugListEl.querySelectorAll('._bug-del-btn').forEach(btn => {
      btn.onclick = async (ev) => {
        ev.stopPropagation();
        const _id = btn.getAttribute('data-id');
        if(!_id) return;
        if(typeof window._fbDeleteBugReport !== 'function'){
          alert('刪除功能尚未就緒');
          return;
        }
        btn.disabled = true;
        btn.textContent = '刪除中...';
        const _ok = await window._fbDeleteBugReport(_id);
        if(_ok){
          // 直接從 DOM 移除,免重新拉
          const _card = btn.closest('[data-bug-id]');
          if(_card) _card.remove();
          // 更新計數
          const _remaining = _bugListEl.querySelectorAll('[data-bug-id]').length;
          if(_bugCountEl) _bugCountEl.textContent = '共 ' + _remaining + ' 筆';
          if(_remaining === 0){
            _bugListEl.innerHTML = '<div style="padding:14px;color:#aaa;font-size:13px;text-align:center;">'
              + '🎉 目前沒有任何錯誤回報' + '</div>';
          }
        } else {
          btn.disabled = false;
          btn.textContent = '🗑 刪除';
          alert('刪除失敗,請查 console');
        }
      };
    });

    // 綁定「展開/收合」按鈕
    _bugListEl.querySelectorAll('._bug-toggle-btn').forEach(btn => {
      btn.onclick = (ev) => {
        ev.stopPropagation();
        const _id = btn.getAttribute('data-id');
        if(!_id) return;
        const _full = (_bugListEl._fullContentMap || {})[_id] || '';
        const _contentEl = _bugListEl.querySelector('._bug-content[data-id="' + CSS.escape(_id) + '"]');
        if(!_contentEl) return;
        const _expanded = _contentEl.getAttribute('data-expanded') === '1';
        if(_expanded){
          // 收合
          const _preview = _full.length > _PREVIEW_LEN ? _full.slice(0, _PREVIEW_LEN) + '…' : _full;
          _contentEl.textContent = _preview;
          _contentEl.setAttribute('data-expanded', '0');
          btn.textContent = '📖 展開全文(' + _full.length + ' 字)';
        } else {
          // 展開
          _contentEl.textContent = _full;
          _contentEl.setAttribute('data-expanded', '1');
          btn.textContent = '📕 收合';
        }
      };
    });

    // 綁定「複製」按鈕
    _bugListEl.querySelectorAll('._bug-copy-btn').forEach(btn => {
      btn.onclick = async (ev) => {
        ev.stopPropagation();
        const _id = btn.getAttribute('data-id');
        if(!_id) return;
        const _full = (_bugListEl._fullContentMap || {})[_id] || '';
        const _origText = btn.textContent;
        try{
          if(navigator.clipboard && navigator.clipboard.writeText){
            await navigator.clipboard.writeText(_full);
          } else {
            // 備援:textarea + execCommand
            const _ta = document.createElement('textarea');
            _ta.value = _full;
            _ta.style.position = 'fixed';
            _ta.style.opacity = '0';
            document.body.appendChild(_ta);
            _ta.select();
            document.execCommand('copy');
            document.body.removeChild(_ta);
          }
          btn.textContent = '✅ 已複製';
          setTimeout(() => { btn.textContent = _origText; }, 1500);
        }catch(e){
          console.error('[BUG 回報] 複製失敗', e);
          btn.textContent = '❌ 失敗';
          setTimeout(() => { btn.textContent = _origText; }, 1500);
        }
      };
    });

    // ★ v3.4.6 — 綁定「儲存回覆」按鈕
    _bugListEl.querySelectorAll('._bug-reply-save-btn').forEach(btn => {
      btn.onclick = async (ev) => {
        ev.stopPropagation();
        const _id = btn.getAttribute('data-id');
        if(!_id) return;
        if(typeof window._fbUpdateBugReportAdminReply !== 'function'){
          alert('回覆功能尚未就緒(Firebase 未載入完畢)');
          return;
        }
        const _ta = _bugListEl.querySelector('._bug-reply-textarea[data-id="' + CSS.escape(_id) + '"]');
        const _statusEl = _bugListEl.querySelector('._bug-reply-status[data-id="' + CSS.escape(_id) + '"]');
        if(!_ta) return;
        const _replyText = (_ta.value || '').trim();
        if(!_replyText){
          if(_statusEl){
            _statusEl.textContent = '⚠ 請先輸入回覆內容';
            _statusEl.style.color = '#ffaa66';
          }
          return;
        }
        const _origLabel = btn.textContent;
        btn.disabled = true;
        btn.textContent = '⏳ 儲存中...';
        if(_statusEl){
          _statusEl.textContent = '☁ 正在儲存到雲端...';
          _statusEl.style.color = '#88ccff';
        }
        const _ok = await window._fbUpdateBugReportAdminReply(_id, _replyText);
        btn.disabled = false;
        if(_ok){
          btn.textContent = '✅ 已儲存';
          if(_statusEl){
            _statusEl.textContent = '✅ 回覆已儲存 (' + new Date().toLocaleString('zh-TW') + ')';
            _statusEl.style.color = '#88ffaa';
          }
          // 同時更新卡片 header 的「✓ 已回覆」標記
          const _card = btn.closest('[data-bug-id]');
          if(_card){
            const _meta = _card.querySelector('div[style*="font-size:11px"]');
            if(_meta && !_meta.innerHTML.includes('✓ 已回覆')){
              _meta.innerHTML += ' &nbsp;|&nbsp; <span style="color:#88ccff;font-weight:700;">✓ 已回覆</span>';
            }
          }
          setTimeout(() => { btn.textContent = _origLabel; }, 1800);
        } else {
          btn.textContent = '❌ 失敗';
          if(_statusEl){
            _statusEl.textContent = '❌ 儲存失敗,請檢查 console';
            _statusEl.style.color = '#ff7766';
          }
          setTimeout(() => { btn.textContent = _origLabel; }, 1800);
        }
      };
    });
  };

  if(_refreshBugBtn){
    _refreshBugBtn.onclick = async () => {
      if(typeof window._fbListBugReports !== 'function'){
        if(_bugListEl) _bugListEl.innerHTML = '<div style="padding:14px;color:#ff8866;font-size:13px;text-align:center;">❌ Firebase 尚未就緒</div>';
        return;
      }
      _refreshBugBtn.disabled = true;
      _refreshBugBtn.textContent = '⏳ 載入中...';
      try{
        const _list = await window._fbListBugReports();
        _renderBugList(_list);
      }catch(e){
        if(_bugListEl) _bugListEl.innerHTML = '<div style="padding:14px;color:#ff8866;font-size:13px;text-align:center;">❌ 載入失敗:' + _escHtml(e.message || String(e)) + '</div>';
      }
      _refreshBugBtn.disabled = false;
      _refreshBugBtn.textContent = '🔄 重新整理回報清單';
    };
    // 開啟面板時自動載入一次
    _refreshBugBtn.onclick();
  }

  // ★★★ 維修模式(v1.0.20260419.1930) ★★★
  // 讀取目前狀態並更新顯示
  const _updateMaintStatus = async () => {
    const statusEl = document.getElementById('_admin-maint-status');
    if(!statusEl) return;
    if(!window._fbGetMaintenance){ statusEl.textContent = '❌ Firebase 尚未就緒'; return; }
    try {
      const m = await window._fbGetMaintenance();
      if(m && m.enabled) {
        const when = m.startedAt ? new Date(m.startedAt).toLocaleString('zh-TW') : '未知';
        statusEl.innerHTML = '<span style="color:#ff8888;">🔴 目前：<b>維修中</b></span>'
          + '<div style="font-size:12px;color:#aaa;margin-top:4px;">開始於 ' + when + ' / 由 ' + (m.startedBy||'?') + '</div>'
          + (m.message ? '<div style="font-size:12px;color:#ffcc88;margin-top:4px;border-left:2px solid #ffaa44;padding-left:6px;">訊息：' + m.message + '</div>' : '');
        // 填入訊息輸入框
        const ta = document.getElementById('_admin-maint-msg');
        if(ta && m.message) ta.value = m.message;
      } else {
        statusEl.innerHTML = '<span style="color:#88ff88;">🟢 目前：<b>正常運作</b></span>';
      }
    } catch(e) {
      statusEl.textContent = '❌ 讀取狀態失敗：' + (e.message || e);
    }
  };
  _updateMaintStatus();

  // 開啟維修
  document.getElementById('_admin-maint-on').onclick = async () => {
    const btn = document.getElementById('_admin-maint-on');
    const res = document.getElementById('_admin-maint-result');
    let msg = (document.getElementById('_admin-maint-msg').value || '').trim();
    // ★ v1.0.20260428.3660 — 把 {TIME} 預留位置換成「預計開機時間」輸入值
    const _maintTime = (document.getElementById('_admin-maint-time').value || '').trim();
    if(msg.includes('{TIME}')){
      if(!_maintTime){
        res.style.color = '#ff6666';
        res.textContent = '❌ 訊息中有 {TIME} 預留位置,請先填入「預計開機時間」(或自行從訊息中刪除 {TIME})';
        return;
      }
      msg = msg.split('{TIME}').join(_maintTime);
    }
    if(!msg) {
      res.style.color = '#ff6666';
      res.textContent = '❌ 請先輸入維修公告訊息';
      return;
    }
    if(!confirm('確定開啟維修模式嗎？\n\n所有非管理員玩家都會：\n• 無法再登入遊戲\n• 目前正在遊戲中的也會被強制登出\n• 看到你輸入的維修訊息\n\n管理員（你）不受影響。\n\n最終訊息:\n' + msg)) return;
    btn.disabled = true;
    btn.textContent = '開啟中...';
    try {
      const email = (window._fbUser && window._fbUser.email) || 'unknown';
      await window._fbSetMaintenance(true, msg, email);
      // ★ v3.12.14(2026-05-31)— 開啟維修同時自動清掉所有公開房,避免殭屍房殘留
      let _cleanupNote = '';
      try{
        if(typeof window._wbAdminCleanupAllPublicRooms === 'function'){
          const _cr = await window._wbAdminCleanupAllPublicRooms();
          if(_cr && _cr.ok){
            _cleanupNote = '(同時清空 ' + _cr.count + ' 間公開房)';
          }
        }
      }catch(_eCu){ console.warn('[維修+清房] 清房失敗(維修仍生效)', _eCu); }
      res.style.color = '#ff8888';
      res.textContent = '🔒 維修模式已開啟,非管理員已被阻擋登入' + _cleanupNote;
      _updateMaintStatus();
    } catch(e) {
      res.style.color = '#ff6666';
      res.textContent = '❌ 失敗：' + (e && e.code || e.message || '未知錯誤');
    } finally {
      btn.disabled = false;
      btn.textContent = '🔒 開啟維修模式';
    }
  };

  // 解除維修
  document.getElementById('_admin-maint-off').onclick = async () => {
    const btn = document.getElementById('_admin-maint-off');
    const res = document.getElementById('_admin-maint-result');
    if(!confirm('確定解除維修模式嗎？玩家就可以正常登入了。')) return;
    btn.disabled = true;
    btn.textContent = '解除中...';
    try {
      const email = (window._fbUser && window._fbUser.email) || 'unknown';
      await window._fbSetMaintenance(false, '', email);
      res.style.color = '#88ff88';
      res.textContent = '🔓 維修模式已解除,玩家可正常登入';
      _updateMaintStatus();
    } catch(e) {
      res.style.color = '#ff6666';
      res.textContent = '❌ 失敗：' + (e && e.code || e.message || '未知錯誤');
    } finally {
      btn.disabled = false;
      btn.textContent = '🔓 解除維修模式';
    }
  };

  // ★ v1.0.20260428.3750 — GM 公告:預覽
  const _gmPreviewBtn = document.getElementById('_admin-gm-preview');
  if(_gmPreviewBtn){
    _gmPreviewBtn.onclick = () => {
      const _text = (document.getElementById('_admin-gm-text').value || '').trim();
      if(!_text){
        const r = document.getElementById('_admin-gm-result');
        r.style.color = '#ff6666';
        r.textContent = '❌ 請先輸入公告內容';
        return;
      }
      const _type = document.getElementById('_admin-gm-type').value;
      const _color = document.getElementById('_admin-gm-color').value;
      const _dur  = (parseInt(document.getElementById('_admin-gm-duration').value, 10) || 8) * 1000;
      // 預覽用 fake id 確保只你自己看到、且每次預覽都重新顯示
      try{
        window._showGmBroadcast({
          id: 'preview_' + Date.now(),
          text: _text, color: _color, type: _type, durationMs: _dur,
          sender: 'preview', timestamp: Date.now(),
        });
      }catch(e){ console.error('[GM 預覽] 失敗', e); }
    };
  }
  // GM 公告:發送
  const _gmSendBtn = document.getElementById('_admin-gm-send');
  if(_gmSendBtn){
    _gmSendBtn.onclick = async () => {
      const _btn = _gmSendBtn;
      const _res = document.getElementById('_admin-gm-result');
      const _text = (document.getElementById('_admin-gm-text').value || '').trim();
      if(!_text){
        _res.style.color = '#ff6666';
        _res.textContent = '❌ 請先輸入公告內容';
        return;
      }
      const _type = document.getElementById('_admin-gm-type').value;
      const _color = document.getElementById('_admin-gm-color').value;
      const _dur  = (parseInt(document.getElementById('_admin-gm-duration').value, 10) || 8) * 1000;
      const _typeName = _type === 'modal' ? '強制彈窗' : _type === 'banner' ? '頂部 banner' : '跑馬燈彈幕';
      if(!confirm('確定要發送這則 GM 公告嗎?\n\n樣式:' + _typeName + '\n內容:\n' + _text + '\n\n所有目前在線的玩家都會立即看到。')) return;
      if(!window._fbSendGmBroadcast){
        _res.style.color = '#ff6666';
        _res.textContent = '❌ Firebase 尚未就緒,請稍後再試';
        return;
      }
      _btn.disabled = true;
      _btn.textContent = '發送中...';
      try {
        const _email = (window._fbUser && window._fbUser.email) || 'unknown';
        const _result = await window._fbSendGmBroadcast({
          text: _text, color: _color, type: _type, durationMs: _dur, sender: _email,
        });
        _res.style.color = '#88ff88';
        _res.textContent = '✅ 已發送!所有在線玩家會立即看到。(ID: ' + (_result.id || 'N/A') + ')';
        // 自己也馬上看一次(因為 onSnapshot 會把自己的請求回傳,localStorage 可能會擋掉)
      } catch(e) {
        _res.style.color = '#ff6666';
        _res.textContent = '❌ 發送失敗:' + (e && e.code || e.message || '未知錯誤');
      } finally {
        _btn.disabled = false;
        _btn.textContent = '📢 發送給所有玩家';
      }
    };
  }

  // ★ v3.11.35f(2026-05-29) — GM 公告範本庫(主要玩家是小學生,稱呼「小英雄」)
  //   每個範本回傳 { text, type, color },按下對應按鈕一鍵填入公告區
  const _GM_TEMPLATES = {
    // ── 維修系列 ──
    maint10: {
      text: '⏰ 維修預告\n\n各位小英雄注意!遊戲將在 10 分鐘後進入維修。\n請趕快回到關卡選擇頁讓進度存檔,維修期間將無法登入。\n預計維修時間:約 10~20 分鐘,請耐心等候喔!',
      type: 'banner',
      color: '#ffcc44',
    },
    maint5: {
      text: '⏰ 最後提醒!遊戲將在 5 分鐘後進入維修\n\n各位小英雄,正在打 BOSS 的請趕快結束戰鬥,正在抽英雄的請趕快用完。\n5 分鐘後進度可能會丟失喔!請小英雄們先存檔再離開。',
      type: 'modal',
      color: '#ff9933',
    },
    maintNow: {
      text: '🔧 遊戲維修中\n\n各位小英雄抱歉,遊戲目前正在進行維修中。\n請先離開遊戲休息一下,等管理員修好就會通知大家回來繼續冒險!\n造成不便深感抱歉。',
      type: 'modal',
      color: '#ff6644',
    },
    maintDone: {
      text: '✅ 維修完成!歡迎小英雄回來!\n\n遊戲已經修好可以正常遊玩了!\n請小英雄們重新整理頁面(按 F5 或下拉重新整理)讓新版本載入。\n感謝各位的耐心等候,繼續冒險吧!',
      type: 'banner',
      color: '#66cc44',
    },
    // ── BUG 異常與修補系列 ──
    bug: {
      text: '🌟 重要的話想告訴所有小英雄\n\n'
        + '最近系統有個小錯誤,讓部分小英雄在打 BOSS 後一次解鎖了太多 SSR 英雄。\n'
        + 'SSR 英雄是遊戲世界裡最珍貴的存在,每一隻都該靠勇氣、運氣與緣分才能相遇。\n'
        + '如果可以靠 BUG 大量得到,那 SSR 英雄就不再是 SSR 了。\n\n'
        + '為了守護這份珍貴,管理員會幫每場戰鬥裡多出來的英雄找回他們原本的世界\n'
        + '(每場戰鬥只保留你第一隻遇到的那一位 — 因為「第一次相遇」最有意義)。\n'
        + '被回收英雄裡你投入過的等級、技能、爆發,管理員都會原數補回給你。\n\n'
        + '📣 致沒有受影響的小英雄:\n'
        + '這是好事!代表你一直在用正常方式累積實力 ✨\n'
        + '也想拜託大家:未來如果在遊戲裡看到怪怪的事(突然得到很多東西、戰鬥當掉),\n'
        + '請用「🐛 回報錯誤」告訴管理員。每一次回報都是讓遊戲變更好的關鍵。\n\n'
        + '讓我們一起守護這座知識的冒險世界 🗺\n'
        + '— LXPSGAME 管理員',
      type: 'modal',
      color: '#ff6644',
    },
    bugFixed: {
      text: '🛠 緊急 BUG 已修復!\n\n各位小英雄好,剛剛影響大家的問題已經修補完成。\n請小英雄重新整理頁面(按 F5 或下拉重新整理)讓修補生效。\n感謝小英雄的回報和耐心,如果還有遇到任何問題請繼續告訴管理員!',
      type: 'banner',
      color: '#66aaff',
    },
    // ── 新功能/活動系列 ──
    newFeat: {
      text: '🎉 新功能上線啦!\n\n各位小英雄久等了,新功能已經上線可以使用!\n請重新整理頁面(按 F5)讓新版本載入。\n快進去探索看看,有任何問題或建議都可以告訴管理員喔!',
      type: 'modal',
      color: '#88aaff',
    },
    eventStart: {
      text: '🎊 限時活動開始!\n\n各位小英雄注意!活動已經開始囉!\n活動期間,打 BOSS 取得的經驗值與知識幣會 ×2!\n小英雄們快把握機會升級你的英雄,把握 SSR 英雄解鎖機會!\n活動時間:即日起至本週日晚上 23:59',
      type: 'modal',
      color: '#ffaa33',
    },
    eventEnd: {
      text: '⏳ 活動最後 24 小時!\n\n各位小英雄注意!限時活動將在今晚 23:59 結束。\n還沒衝完進度的小英雄,把握最後機會喔!\n錯過要等下次活動才能享受加倍獎勵!',
      type: 'banner',
      color: '#ff9966',
    },
    // ── 獎勵系列 ──
    reward: {
      text: '🎁 全體小英雄獎勵發放!\n\n為了感謝各位小英雄一直以來的支持,管理員發送大家補償!\n請至背包查看,登入後會自動收到。\n如果沒收到,請告訴管理員(透過遊戲內的 🐛 回報錯誤)。',
      type: 'modal',
      color: '#88cc66',
    },
    // ── 玩法/提醒系列 ──
    tip: {
      text: '💡 玩法小提醒\n\n各位小英雄,如果遇到戰鬥卡住,可以試試:\n  1. 按右上角「🔄 重新開始」回首頁\n  2. 重新整理頁面(F5 或下拉)\n  3. 還是不行就用「🐛 回報錯誤」告訴管理員\n\n不要害怕嘗試,保持冒險的心!',
      type: 'banner',
      color: '#bb99ff',
    },
    report: {
      text: '📣 鼓勵小英雄回報 BUG!\n\n各位小英雄,如果在遊戲中發現怪怪的事情(英雄突然不見、獎勵領太多、戰鬥當掉...),請第一時間告訴管理員!\n  ・遊戲內按「🐛 回報錯誤」即可\n  ・每位主動回報的小英雄都會收到管理員的補償!\n讓我們一起把遊戲變得更好玩!',
      type: 'modal',
      color: '#99bbff',
    },
    // ── 節慶/季節性問候 ──
    holiday: {
      text: '🎄 節慶問候\n\n各位小英雄,節日快樂!\n趁著假日好好放鬆,也別忘了回來陪英雄們冒險喔!\n管理員特別發送節日禮包,請小英雄到背包查看!',
      type: 'modal',
      color: '#ff88bb',
    },
    exam: {
      text: '📚 考試加油!\n\n各位小英雄,考試期間請以課業為重!\n回來玩遊戲時要記得先寫完作業、複習完功課喔!\n知識本身就是最強的爆發技!\n考完試大家再回來繼續冒險,管理員為小英雄加油!💪',
      type: 'banner',
      color: '#ccaa66',
    },
    // ── 帳號汙染回收(立志又溫馨,老師指定 v3.13.41)──
    pollutionRecycle: {
      text: '🌟 給每一位小英雄的悄悄話\n\n'
        + '在我們這座知識冒險的世界裡,每一隻英雄都是靠你自己的努力、勇氣\n'
        + '和一點點運氣,才一個一個遇見的。正因為「得來不易」,他們才這麼珍貴 ✨\n\n'
        + '因為很多小英雄是共用平板登入的,偶爾會有一個小狀況:\n'
        + '上一位同學的英雄,不小心被帶進了你的帳號裡。\n'
        + '那些英雄其實「本來不屬於你」,他們也想回到原本主人的身邊 🏠\n\n'
        + '所以管理員會「不定期」幫大家檢查帳號,\n'
        + '把這些跑錯家的英雄溫柔地送回去。\n'
        + '而你在他們身上投入過的等級、技能、爆發,管理員都會原數補回給你,\n'
        + '也會額外送上一份小禮物,當作打擾你的補償 🎁\n\n'
        + '📣 想告訴所有小英雄:\n'
        + '真正的強大,從來不是一次擁有很多英雄,\n'
        + '而是靠自己一場一場戰鬥、一題一題答對,慢慢變強的過程。\n'
        + '那份實力,才是只屬於你、誰也拿不走的 💪\n\n'
        + '如果你發現帳號裡多了奇怪的東西,或遇到任何怪事,\n'
        + '請用「🐛 回報錯誤」告訴管理員 — 每一次回報,都讓這個世界更好。\n\n'
        + '讓我們一起守護這座乾乾淨淨、公平又溫暖的冒險世界 🗺\n'
        + '— LXPSGAME 管理員 敬上',
      type: 'modal',
      color: '#ff99cc',
    },
  };

  // 統一綁定所有範本按鈕
  document.querySelectorAll('._admin-gm-tmpl-btn').forEach(function(btn){
    btn.onclick = function(){
      const _key = btn.dataset.tmpl;
      const _tmpl = _GM_TEMPLATES[_key];
      if(!_tmpl){ console.warn('[GM 範本] 找不到 key=' + _key); return; }
      const _textEl = document.getElementById('_admin-gm-text');
      const _typeEl = document.getElementById('_admin-gm-type');
      const _colorEl = document.getElementById('_admin-gm-color');
      if(!_textEl) return;
      if(_textEl.value.trim() && !confirm('公告內容欄目前有文字,要覆蓋成此範本嗎?')) return;
      _textEl.value = _tmpl.text;
      if(_typeEl && _tmpl.type) _typeEl.value = _tmpl.type;
      if(_colorEl && _tmpl.color) _colorEl.value = _tmpl.color;
      const _res = document.getElementById('_admin-gm-result');
      if(_res){
        _res.style.color = '#aaccff';
        _res.textContent = '✅ 已填入範本「' + btn.textContent.trim() + '」— 確認後可微調內容,然後按「📢 發送給所有玩家」';
      }
      _textEl.focus();
    };
  });

  // 回填總玩家數
  document.getElementById('_admin-backfill-players').onclick = async () => {
    const btn = document.getElementById('_admin-backfill-players');
    const res = document.getElementById('_admin-backfill-result');
    if(!window._fbBackfillTotalPlayers){
      res.style.color = '#ff6666';
      res.textContent = '❌ Firebase 尚未就緒，請稍後再試';
      return;
    }
    btn.disabled = true;
    btn.textContent = '掃描中...';
    res.style.color = '#88ccff';
    res.textContent = '正在掃描 /players 集合...';
    try {
      const count = await window._fbBackfillTotalPlayers();
      res.style.color = '#88ff88';
      res.textContent = `✅ 完成！共找到 ${count} 位歷史玩家，已寫入 totalPlayers。`;
    } catch(e){
      res.style.color = '#ff6666';
      res.textContent = '❌ 失敗：' + (e && e.code || e.message || '未知錯誤');
    } finally {
      btn.disabled = false;
      btn.textContent = '▶ 執行回填';
    }
  };

  // 設定冒險次數
  document.getElementById('_admin-set-adventures').onclick = async () => {
    const input = document.getElementById('_admin-adv-input');
    const btn = document.getElementById('_admin-set-adventures');
    const res = document.getElementById('_admin-adv-result');
    const val = parseInt(input.value, 10);
    if(isNaN(val) || val < 0){
      res.style.color = '#ff6666';
      res.textContent = '❌ 請輸入 0 或以上的整數';
      return;
    }
    if(!window._fbSetAdventureTotal){
      res.style.color = '#ff6666';
      res.textContent = '❌ Firebase 尚未就緒，請稍後再試';
      return;
    }
    if(!confirm(`確定要把「累計冒險次數」設定為 ${val} 嗎？這會覆寫現有值。`)) return;
    btn.disabled = true;
    btn.textContent = '設定中...';
    try {
      await window._fbSetAdventureTotal(val);
      res.style.color = '#ff99cc';
      res.textContent = `✅ 已設定 totalAdventures = ${val}`;
    } catch(e){
      res.style.color = '#ff6666';
      res.textContent = '❌ 失敗：' + (e && e.code || e.message || '未知錯誤');
    } finally {
      btn.disabled = false;
      btn.textContent = '▶ 設定';
    }
  };

  // ════════════════════════════════════════════════════════════════
  // ★ v3.13.15(2026-06-02) — 鬥技場預設陣容管理(系統 5 套保底敵手)
  // ────────────────────────────────────────────────────────────────
  // Firestore 結構:arenaSystemTeams/main {teams: [{id,name,heroes:[4],elements:[4],desc?}×5], updatedAt, updatedBy}
  // 流程:GM 點「載入」→ 從雲端讀 + 渲染 → 編輯每套(隊名/英雄/元素)→ 點「儲存」→ 寫回 Firestore
  // 即時生效:儲存後玩家下次抽取(arena.js _arenaFetchTeamPool 觸發時)就會套用
  // ════════════════════════════════════════════════════════════════

  // 內建 5 套陣容(後備,當雲端沒資料時用,跟 arena.js 內 ARENA_AI_TEAMS_DEFAULT 對齊)
  // ★ v3.13.27(2026-06-03)— 老師指定組合更新(跟 arena.js 同步)
  const _ARENA_PRESET_DEFAULT = [
    { id:'sys_1', name:'[鬥技場預設] 神殿守護隊', heroes:['聖騎士','占星師','天神宙斯','祭司'],   elements:['light','dark','wind','grass'] },
    { id:'sys_2', name:'[鬥技場預設] 雷霆控場隊', heroes:['雷法師','守衛','玉藻前','救醫馬'],   elements:['wind','light','fire','grass'] },
    { id:'sys_3', name:'[鬥技場預設] 舞動陣勢隊', heroes:['舞者','直笛團員','吟遊詩人','弦樂團員'], elements:['earth','wind','grass','light'] },
    { id:'sys_4', name:'[鬥技場預設] 快攻刺客隊', heroes:['刺客','田徑隊員','武器精靈','神槍手'],   elements:['dark','wind','light','fire'] },
    { id:'sys_5', name:'[鬥技場預設] 元素法團隊', heroes:['火法師','冰法師','雷法師','菇女'],   elements:['fire','water','wind','grass'] },
  ];
  // 工作狀態:當前編輯中的 5 套陣容
  let _arenaPresetWorking = JSON.parse(JSON.stringify(_ARENA_PRESET_DEFAULT));

  // 取得可選英雄名單(從 HERO_DB 排除 BOSS / 日本菁英小怪 / 活動限定)
  // ★ v3.13.27(2026-06-03) — 根因修補(老師反映「所有 BOSS 和菁英都在裡面」):
  //   原本只讀 window.BOSS_NAMES / window.JAPAN_ARENA_EXCLUDE,但 const 不掛 window
  //   → 永遠 undefined → 過濾完全失效。現補上 typeof 雙重 fallback + 加 EVENT_ONLY_HEROES 第三層。
  //   白名單:JAPAN_BOSS_HEROES(大天狗/酒吞童子/玉藻前)— 三妖怪英雄版可作為鬥技場選項
  function _arenaGetSelectableHeroes(){
    try{
      // HERO_DB 雙重 fallback
      const _heroDb = (typeof window.HERO_DB !== 'undefined' && window.HERO_DB)
        || (typeof HERO_DB !== 'undefined' ? HERO_DB : null);
      if(!_heroDb) return [];
      // BOSS_NAMES 雙重 fallback
      const _bossArr = (typeof window.BOSS_NAMES !== 'undefined' && Array.isArray(window.BOSS_NAMES))
        ? window.BOSS_NAMES
        : (typeof BOSS_NAMES !== 'undefined' && Array.isArray(BOSS_NAMES) ? BOSS_NAMES : []);
      const _bossSet = new Set(_bossArr);
      // JAPAN_ARENA_EXCLUDE 雙重 fallback
      const _japExc = (typeof window.JAPAN_ARENA_EXCLUDE !== 'undefined' && window.JAPAN_ARENA_EXCLUDE instanceof Set)
        ? window.JAPAN_ARENA_EXCLUDE
        : (typeof JAPAN_ARENA_EXCLUDE !== 'undefined' && JAPAN_ARENA_EXCLUDE instanceof Set ? JAPAN_ARENA_EXCLUDE : new Set());
      // EVENT_ONLY_HEROES 雙重 fallback(v3.13.27 新增:擋小力/幼兒園小孩/巫女)
      const _evtOnly = (typeof window.EVENT_ONLY_HEROES !== 'undefined' && window.EVENT_ONLY_HEROES instanceof Set)
        ? window.EVENT_ONLY_HEROES
        : (typeof EVENT_ONLY_HEROES !== 'undefined' && EVENT_ONLY_HEROES instanceof Set ? EVENT_ONLY_HEROES : new Set());
      // JAPAN_BOSS_HEROES 白名單(三妖怪英雄版可選)
      const _jpBossWL = (typeof window.JAPAN_BOSS_HEROES !== 'undefined' && window.JAPAN_BOSS_HEROES instanceof Set)
        ? window.JAPAN_BOSS_HEROES
        : (typeof JAPAN_BOSS_HEROES !== 'undefined' && JAPAN_BOSS_HEROES instanceof Set ? JAPAN_BOSS_HEROES : new Set());
      const _result = Object.keys(_heroDb).filter(n => {
        if(_jpBossWL.has(n)) return true;       // 白名單放行
        if(_bossSet.has(n))  return false;      // 擋第 1 層 BOSS_NAMES
        if(_japExc.has(n))   return false;      // 擋第 2 層 JAPAN_ARENA_EXCLUDE
        if(_evtOnly.has(n))  return false;      // 擋第 3 層 EVENT_ONLY_HEROES
        return true;
      }).sort();
      try{ console.log('[admin v3.13.27] 鬥技場可選英雄數: ' + _result.length
        + '(總 ' + Object.keys(_heroDb).length + ' 隻,排除 BOSS ' + _bossSet.size
        + ' + 日本菁英 ' + _japExc.size + ' + 活動限定 ' + _evtOnly.size + ' - 白名單 ' + _jpBossWL.size + ')'); }catch(_){}
      return _result;
    }catch(e){ console.warn('[admin _arenaGetSelectableHeroes 例外]', e); return []; }
  }
  const _ARENA_ELEMENT_KEYS = [
    {k:'water', label:'💧 水'}, {k:'fire', label:'🔥 火'}, {k:'wind', label:'🪽 風'},
    {k:'grass', label:'🌿 草'}, {k:'earth', label:'⛰ 土'}, {k:'light', label:'✨ 光'},
    {k:'dark', label:'🌑 暗'},
  ];

  // 渲染 5 套陣容編輯區
  function _arenaRenderEditor(){
    const editor = document.getElementById('_admin-arena-editor');
    if(!editor) return;
    const heroes = _arenaGetSelectableHeroes();

    let html = '';
    for(let i=0; i<5; i++){
      const team = _arenaPresetWorking[i] || _ARENA_PRESET_DEFAULT[i];
      html += `<div style="background:rgba(20,15,40,0.5);border:1.5px solid rgba(180,120,255,0.4);
        border-radius:8px;padding:12px;margin-bottom:10px;">
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;">
          <span style="font-size:14px;font-weight:800;color:#cc99ff;flex-shrink:0;">第 ${i+1} 套</span>
          <input id="_arena-tn-${i}" value="${(team.name||'').replace(/"/g,'&quot;')}" placeholder="[鬥技場預設] 隊名"
            style="flex:1;padding:6px 10px;font-size:13px;background:rgba(20,20,35,0.95);
            border:1.5px solid rgba(180,120,255,0.5);color:#ddc0ff;border-radius:6px;font-family:inherit;">
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">`;
      for(let j=0; j<4; j++){
        const hSel = (team.heroes && team.heroes[j]) || '';
        const eSel = (team.elements && team.elements[j]) || '';
        html += `<div style="display:flex;flex-direction:column;gap:4px;">
          <select id="_arena-th-${i}-${j}" style="padding:5px;font-size:12px;background:rgba(20,20,35,0.95);
            border:1px solid rgba(180,120,255,0.4);color:#ddc0ff;border-radius:5px;font-family:inherit;cursor:pointer;">
            <option value="">(選英雄)</option>
            ${heroes.map(n => `<option value="${n}" ${n===hSel?'selected':''}>${n}</option>`).join('')}
          </select>
          <select id="_arena-te-${i}-${j}" style="padding:5px;font-size:12px;background:rgba(20,20,35,0.95);
            border:1px solid rgba(180,120,255,0.4);color:#ddc0ff;border-radius:5px;font-family:inherit;cursor:pointer;">
            <option value="">(選元素)</option>
            ${_ARENA_ELEMENT_KEYS.map(e => `<option value="${e.k}" ${e.k===eSel?'selected':''}>${e.label}</option>`).join('')}
          </select>
        </div>`;
      }
      html += `</div></div>`;
    }
    editor.innerHTML = html;
  }

  // 收集編輯區當前內容 → 寫入 _arenaPresetWorking
  function _arenaCollectFromEditor(){
    for(let i=0; i<5; i++){
      const nm = document.getElementById('_arena-tn-' + i);
      if(!nm) continue;
      const team = _arenaPresetWorking[i] || (_arenaPresetWorking[i] = {});
      team.id = team.id || ('sys_' + (i+1));
      team.name = (nm.value || '').trim() || ('[鬥技場預設] 第 ' + (i+1) + ' 套');
      team.heroes = [];
      team.elements = [];
      for(let j=0; j<4; j++){
        const hsel = document.getElementById('_arena-th-' + i + '-' + j);
        const esel = document.getElementById('_arena-te-' + i + '-' + j);
        team.heroes.push(hsel ? hsel.value : '');
        team.elements.push(esel ? esel.value : '');
      }
    }
  }

  // 載入按鈕:從 Firestore arenaSystemTeams/main 讀
  const _arenaLoadBtn = document.getElementById('_admin-arena-load');
  if(_arenaLoadBtn) _arenaLoadBtn.onclick = async () => {
    const status = document.getElementById('_admin-arena-status');
    status.textContent = '載入中…';
    status.style.color = '#aaa';
    try{
      if(!window._fbDb){ throw new Error('Firestore 未就緒'); }
      const { getDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const snap = await getDoc(doc(window._fbDb, 'arenaSystemTeams', 'main'));
      if(snap.exists()){
        const data = snap.data();
        if(Array.isArray(data.teams) && data.teams.length){
          _arenaPresetWorking = JSON.parse(JSON.stringify(data.teams.slice(0,5)));
          while(_arenaPresetWorking.length < 5){
            _arenaPresetWorking.push(JSON.parse(JSON.stringify(_ARENA_PRESET_DEFAULT[_arenaPresetWorking.length])));
          }
          status.textContent = '✅ 已從雲端載入 ' + data.teams.length + ' 套(更新於 '
            + (data.updatedAt ? new Date(data.updatedAt).toLocaleString() : '未知') + ')';
          status.style.color = '#88ccff';
        } else {
          _arenaPresetWorking = JSON.parse(JSON.stringify(_ARENA_PRESET_DEFAULT));
          status.textContent = '⚠️ 雲端資料格式異常,已載入內建預設';
          status.style.color = '#ffaa66';
        }
      } else {
        _arenaPresetWorking = JSON.parse(JSON.stringify(_ARENA_PRESET_DEFAULT));
        status.textContent = '📭 雲端無資料,顯示內建預設;編輯後按「儲存」即會首次寫入';
        status.style.color = '#ffaa66';
      }
      _arenaRenderEditor();
    }catch(e){
      console.error('[admin arena load]', e);
      status.textContent = '❌ 載入失敗:' + (e && e.message || '未知錯誤') + ' — 已載入內建預設';
      status.style.color = '#ff8866';
      _arenaPresetWorking = JSON.parse(JSON.stringify(_ARENA_PRESET_DEFAULT));
      _arenaRenderEditor();
    }
  };

  // 還原內建預設按鈕
  const _arenaResetBtn = document.getElementById('_admin-arena-reset');
  if(_arenaResetBtn) _arenaResetBtn.onclick = () => {
    if(!confirm('確定還原為內建 5 套經典陣容?目前編輯中的內容會消失(尚未儲存到雲端的話)。')) return;
    _arenaPresetWorking = JSON.parse(JSON.stringify(_ARENA_PRESET_DEFAULT));
    _arenaRenderEditor();
    const status = document.getElementById('_admin-arena-status');
    if(status){ status.textContent = '🔄 已還原內建預設,記得按「儲存」才會生效'; status.style.color = '#ffaa66'; }
  };

  // 儲存按鈕:寫到 Firestore + 即時套用到當前記憶體
  const _arenaSaveBtn = document.getElementById('_admin-arena-save');
  if(_arenaSaveBtn) _arenaSaveBtn.onclick = async () => {
    const btn = document.getElementById('_admin-arena-save');
    const res = document.getElementById('_admin-arena-save-result');
    btn.disabled = true;
    btn.textContent = '⏳ 儲存中…';
    try{
      // 收集當前編輯內容
      _arenaCollectFromEditor();
      // 驗證:每套必須有 4 英雄(不可空)
      for(let i=0; i<5; i++){
        const t = _arenaPresetWorking[i];
        if(!t.name || !t.name.trim()){ throw new Error('第 ' + (i+1) + ' 套隊名為空'); }
        const emptyHero = t.heroes.findIndex(h => !h);
        if(emptyHero >= 0){ throw new Error('第 ' + (i+1) + ' 套第 ' + (emptyHero+1) + ' 位英雄未選'); }
      }
      // ★ v3.13.27(2026-06-03) — 儲存前三層黑名單嚴驗(防止 GM 不慎存了 BOSS/菁英到雲端)
      const _selectable = new Set(_arenaGetSelectableHeroes());
      for(let i=0; i<5; i++){
        const t = _arenaPresetWorking[i];
        for(let j=0; j<4; j++){
          const hname = t.heroes[j];
          if(!_selectable.has(hname)){
            throw new Error('第 ' + (i+1) + ' 套第 ' + (j+1) + ' 位「' + hname + '」是 BOSS / 菁英 / 活動限定,不可用於鬥技場');
          }
        }
      }
      // 寫到 Firestore
      if(!window._fbDb){ throw new Error('Firestore 未就緒'); }
      // ★ v3.13.27 — 守門:必須是 GM 才能寫(雙保險,Firestore Rules 應該也有擋)
      if(typeof window._isAdminUser !== 'function' || !window._isAdminUser()){
        throw new Error('權限不足:需要 GM 身份(請確認登入 email 在 ADMIN 名單)');
      }
      const { setDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const payload = {
        teams: _arenaPresetWorking,
        updatedAt: Date.now(),
        updatedBy: (window._fbUser && window._fbUser.email) || 'unknown',
      };
      // ★ v3.13.27 — 把 payload 印到 console,方便 debug(如果 Firestore 拒絕,可看到實際送什麼)
      try{ console.log('[admin arena save v3.13.27] payload:', JSON.parse(JSON.stringify(payload))); }catch(_){}
      await setDoc(doc(window._fbDb, 'arenaSystemTeams', 'main'), payload);
      // 立即套用到記憶體(讓 GM 自己當下開鬥技場就能看到效果)
      if(typeof window._arenaApplySystemTeamsFromCloud === 'function'){
        window._arenaApplySystemTeamsFromCloud(_arenaPresetWorking);
      }
      res.style.color = '#88ccff';
      res.textContent = '✅ 已儲存到雲端!所有玩家下次抽取鬥技場對手時會套用最新版本。';
    }catch(e){
      // ★ v3.13.27 — 改善錯誤訊息:Firestore 錯誤特別處理
      console.error('[admin arena save]', e);
      let _msg = (e && e.message) || (e && e.code) || '未知錯誤';
      // Firestore permission-denied 特別提示
      if(e && (e.code === 'permission-denied' || /permission/i.test(_msg))){
        _msg = '🔒 Firestore 規則拒絕寫入(權限不足)\n'
             + '原因:目前帳號可能不在 GM 名單(雲端規則層),或 arenaSystemTeams/main 的寫入規則沒開放\n'
             + '解法:確認登入 email 在 ADMIN 名單,或檢查 Firestore Rules 是否含「match /arenaSystemTeams/main { allow write: if isAdmin() }」';
      } else if(e && (e.code === 'unauthenticated' || /unauthenticated/i.test(_msg))){
        _msg = '🔒 未登入或登入逾期,請重新登入後再試';
      } else if(e && (e.code === 'unavailable' || /network|offline/i.test(_msg))){
        _msg = '📡 網路問題,Firestore 連線失敗,請檢查網路再試';
      }
      res.style.color = '#ff6666';
      res.style.whiteSpace = 'pre-wrap';  // ★ v3.13.27 — 允許多行錯誤訊息
      res.textContent = '❌ 儲存失敗:' + _msg;
    }finally{
      btn.disabled = false;
      btn.textContent = '💾 儲存到雲端(對所有玩家即時生效)';
    }
  };

  // 初始渲染(用內建預設填一次,GM 進來就看得到 UI)
  _arenaRenderEditor();
  // ── 鬥技場預設陣容管理 結束 ──

  // ════════════════════════════════════════════════════════════════════════════
  // ★ v3.13.20(2026-06-02) — 鬥技場入口開關 init
  //   Firestore gameConfig/arenaSwitch { enabled, updatedAt, updatedBy }
  //   讀取/儲存後立即更新 window._arenaSwitchEnabled 並套用首頁 UI
  // ════════════════════════════════════════════════════════════════════════════
  (function _initArenaSwitchSection(){
    const loadBtn = document.getElementById('_admin-arena-switch-load');
    const onBtn   = document.getElementById('_admin-arena-switch-on');
    const offBtn  = document.getElementById('_admin-arena-switch-off');
    const statusEl= document.getElementById('_admin-arena-switch-status');
    const resEl   = document.getElementById('_admin-arena-switch-result');
    if(!loadBtn || !onBtn || !offBtn){
      console.warn('[admin arena switch] DOM 元素缺失,跳過初始化');
      return;
    }
    // 取得 Firestore SDK 函式
    async function _getSdk(){
      try{
        // ★ v3.13.20 — 優先用 index.html 統一掛載的 window._fbFns
        if(window._fbFns && window._fbFns.setDoc){
          return {
            getDoc: window._fbFns.getDoc,
            setDoc: window._fbFns.setDoc,
            doc:    window._fbFns.doc,
          };
        }
        // fallback:動態 import
        const m = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
        return { getDoc: m.getDoc, setDoc: m.setDoc, doc: m.doc };
      }catch(e){
        console.warn('[admin arena switch] SDK 取得失敗', e);
        return null;
      }
    }

    async function _loadSwitch(){
      statusEl.textContent = '載入中...';
      statusEl.style.color = '#aaa';
      try{
        if(!window._fbDb){ throw new Error('Firestore 未就緒'); }
        const sdk = await _getSdk();
        if(!sdk || !sdk.getDoc || !sdk.doc){ throw new Error('Firestore SDK 未就緒'); }
        const snap = await sdk.getDoc(sdk.doc(window._fbDb, 'gameConfig', 'arenaSwitch'));
        if(snap && snap.exists()){
          const data = snap.data();
          const enabled = (data && data.enabled !== false);
          const updatedAt = data && data.updatedAt ? new Date(data.updatedAt).toLocaleString() : '(無記錄)';
          const updatedBy = data && data.updatedBy ? data.updatedBy : '(無記錄)';
          if(enabled){
            statusEl.style.color = '#66dd88';
            statusEl.textContent = '✅ 目前:開啟 (最後更新:' + updatedAt + ' by ' + updatedBy + ')';
          } else {
            statusEl.style.color = '#ff6688';
            statusEl.textContent = '⛔ 目前:關閉 (最後更新:' + updatedAt + ' by ' + updatedBy + ')';
          }
          window._arenaSwitchEnabled = enabled;
        } else {
          statusEl.style.color = '#88ccff';
          statusEl.textContent = '☁ 雲端無此設定 → 預設開啟';
          window._arenaSwitchEnabled = true;
        }
      }catch(e){
        statusEl.style.color = '#ff6666';
        statusEl.textContent = '❌ 載入失敗:' + (e && e.message || e);
      }
    }

    async function _setSwitch(enabled){
      const btn = enabled ? onBtn : offBtn;
      const labelOK = enabled ? '✅ 已開啟鬥技場(所有玩家下次按按鈕即生效)' : '⛔ 已關閉鬥技場(所有玩家按按鈕會被擋下)';
      btn.disabled = true;
      const orig = btn.textContent;
      btn.textContent = '處理中...';
      resEl.textContent = '';
      try{
        if(!window._fbDb){ throw new Error('Firestore 未就緒'); }
        const sdk = await _getSdk();
        if(!sdk || !sdk.setDoc || !sdk.doc){ throw new Error('Firestore SDK 未就緒'); }
        const me = (window._fbAuth && window._fbAuth.currentUser) || null;
        const updatedBy = me ? (me.email || me.uid.slice(0,10)) : 'unknown';
        await sdk.setDoc(sdk.doc(window._fbDb, 'gameConfig', 'arenaSwitch'), {
          enabled: !!enabled,
          updatedAt: Date.now(),
          updatedBy: updatedBy,
        });
        window._arenaSwitchEnabled = !!enabled;
        // 套用 UI 到首頁按鈕(若 GM 自己也看得到首頁)
        try{ if(typeof window._arenaApplySwitchUI === 'function') window._arenaApplySwitchUI(!!enabled); }catch(_){}
        resEl.style.color = enabled ? '#66dd88' : '#ff8888';
        resEl.textContent = labelOK;
        // 重載狀態顯示
        setTimeout(_loadSwitch, 300);
      }catch(e){
        console.error('[admin arena switch set]', e);
        resEl.style.color = '#ff6666';
        resEl.textContent = '❌ 設定失敗:' + (e && e.message || '未知錯誤');
      }finally{
        btn.disabled = false;
        btn.textContent = orig;
      }
    }

    loadBtn.onclick = _loadSwitch;
    onBtn.onclick   = () => _setSwitch(true);
    offBtn.onclick  = () => _setSwitch(false);
    // 進入面板時自動載一次當前狀態
    setTimeout(_loadSwitch, 100);
  })();
  // ── 鬥技場入口開關 結束 ──

  // ════════════════════════════════════════════════════════════════════════════
  // ★ v3.13.72 — 課堂獎勵發放 init
  //   貼整批學生姓名 → _fbAdminFindPlayersByName 對照帳號 → 預覽(可發/同名多筆跳過/查無)
  //   → 確認後逐一 _fbCompensatePlayer 發固定整包(UR克雷爾 + SSR卷×1 + 水晶×10 + 幣10萬,union 合併)
  // ════════════════════════════════════════════════════════════════════════════
  (function _initClassRewardSection(){
    const namesEl = document.getElementById('_admin-classreward-names');
    const prevBtn = document.getElementById('_admin-classreward-preview');
    const sendBtn = document.getElementById('_admin-classreward-send');
    const resEl   = document.getElementById('_admin-classreward-result');
    const logBtn  = document.getElementById('_admin-classreward-loglist');
    const logEl   = document.getElementById('_admin-classreward-log');
    if(!namesEl || !prevBtn || !sendBtn){
      console.warn('[admin classreward] DOM 元素缺失,跳過初始化');
      return;
    }
    let _matched = [];   // [{name, uid, label, email}]
    function _esc(s){
      return String(s == null ? '' : s)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }
    function _parseNames(raw){
      return (raw||'').split(/[\n,，、;；\s]+/).map(s => s.trim()).filter(Boolean);
    }
    function _chk(id){ const e = document.getElementById(id); return !!(e && e.checked); }
    function _qty(id, def){ const e = document.getElementById(id); const v = e ? parseInt(e.value, 10) : def; return (isNaN(v) || v < 1) ? def : v; }
    // ★ v3.13.74 — 依勾選動態組出 compensation payload + 給 gmGiftLog 用的 items 文字陣列
    function _buildReward(){
      const reward = {};
      const items = [];               // 文字標籤(送禮記錄用)
      const unlockedHeroes = [];
      const backpack = {};
      if(_chk('_cr-item-clair')){ unlockedHeroes.push('藝天使．克雷爾'); items.push('🌟UR藝天使克雷爾'); }
      if(_chk('_cr-item-iliya')){ unlockedHeroes.push('魔劍姬‧伊莉雅'); items.push('🗡️UR魔劍姬伊莉雅'); }
      if(_chk('_cr-item-ssrpick')){ const q=_qty('_cr-qty-ssrpick',1); backpack['summon_ticket_ssr_pick']=(backpack['summon_ticket_ssr_pick']||0)+q; items.push('🌟SSR自選券×'+q); }
      if(_chk('_cr-item-srpick')){  const q=_qty('_cr-qty-srpick',1);  backpack['summon_ticket_sr_pick'] =(backpack['summon_ticket_sr_pick']||0)+q;  items.push('✨SR自選券×'+q); }
      if(_chk('_cr-item-ssrrand')){ const q=_qty('_cr-qty-ssrrand',1); backpack['summon_ticket_ssr']=(backpack['summon_ticket_ssr']||0)+q; items.push('🌈隨機SSR券×'+q); }
      if(_chk('_cr-item-srrand')){  const q=_qty('_cr-qty-srrand',1);  backpack['summon_ticket_sr'] =(backpack['summon_ticket_sr']||0)+q;  items.push('⭐隨機SR券×'+q); }
      if(_chk('_cr-item-crystal')){ const q=_qty('_cr-qty-crystal',10); backpack['summon_crystal']=(backpack['summon_crystal']||0)+q; items.push('🔮召喚水晶×'+q); }
      if(_chk('_cr-item-fruit')){   const q=_qty('_cr-qty-fruit',1);   backpack['burst_upgrade_fruit']=(backpack['burst_upgrade_fruit']||0)+q; items.push('🍑超越極限果實×'+q); }
      if(_chk('_cr-item-coins')){   const q=_qty('_cr-qty-coins',100000); reward.coins=q; reward.coinsMode='add'; items.push('💰知識幣×'+q); }
      if(unlockedHeroes.length) reward.unlockedHeroes = unlockedHeroes;
      if(Object.keys(backpack).length) reward.backpack = backpack;
      return { reward, items };
    }
    function _setSendEnabled(on){
      sendBtn.disabled = !on;
      sendBtn.style.opacity = on ? '1' : '0.5';
    }
    async function _preview(){
      const { items } = _buildReward();
      if(!items.length){ resEl.innerHTML = '<span style="color:#ff8866;">請先勾選至少一項要發的獎勵</span>'; _setSendEnabled(false); return; }
      const names = _parseNames(namesEl.value);
      if(!names.length){ resEl.innerHTML = '<span style="color:#ff8866;">請先貼上學生姓名 / 學號 / uid</span>'; _setSendEnabled(false); return; }
      if(typeof window._fbAdminFindPlayersByName !== 'function'){
        resEl.innerHTML = '<span style="color:#ff6666;">_fbAdminFindPlayersByName 未載入,請重新整理頁面</span>'; return;
      }
      prevBtn.disabled = true; const _old = prevBtn.textContent; prevBtn.textContent = '比對中...';
      _setSendEnabled(false);
      _matched = [];
      const _ok = [], _none = [], _multi = [];
      const _seenUid = new Set();
      for(const nm of names){
        try{
          const r = await window._fbAdminFindPlayersByName(nm);
          const players = (r && r.players) || [];
          if(!players.length){ _none.push(nm); }
          else if(players.length > 1){ _multi.push({ name: nm, count: players.length }); }
          else {
            const p = players[0];
            if(_seenUid.has(p.uid)) continue;   // 同一人重複貼,去重
            _seenUid.add(p.uid);
            const label = (typeof window._adminLabel === 'function') ? window._adminLabel(p.email, p.name) : ((p.name || nm) + (p.email ? (' <' + p.email + '>') : ''));
            _matched.push({ name: nm, uid: p.uid, label, email: p.email || '' });
            _ok.push(label);
          }
        }catch(e){ _none.push(nm + '(查詢失敗)'); }
      }
      let html = '<div style="text-align:left;font-size:13px;line-height:1.7;">';
      html += '<div style="color:#ffe066;font-weight:800;margin-bottom:4px;">📦 將發放:' + items.map(_esc).join('、') + '</div>';
      html += '<div style="color:#88ff88;font-weight:800;">✅ 可發放 ' + _ok.length + ' 人</div>';
      if(_ok.length) html += '<div style="color:#cfe;margin:2px 0 6px;">' + _ok.map(x => '・' + _esc(x)).join('<br>') + '</div>';
      if(_multi.length){
        html += '<div style="color:#ffcc44;">⚠ 同名多筆(' + _multi.length + ')→ 已跳過,請改用學號 / uid 個別補發:</div>';
        html += '<div style="color:#ffe;margin:2px 0 6px;">' + _multi.map(m => '・' + _esc(m.name) + '(' + m.count + ' 筆)').join('<br>') + '</div>';
      }
      if(_none.length){
        html += '<div style="color:#ff8866;">❌ 查無此人(' + _none.length + '):' + _none.map(_esc).join('、') + '</div>';
      }
      html += '</div>';
      resEl.innerHTML = html;
      _setSendEnabled(_matched.length > 0);
      prevBtn.disabled = false; prevBtn.textContent = _old;
    }
    async function _send(){
      if(!_matched.length) return;
      const { reward, items } = _buildReward();
      if(!items.length){ resEl.innerHTML = '<span style="color:#ff8866;">沒有勾選任何獎勵</span>'; _setSendEnabled(false); return; }
      if(typeof window._fbCompensatePlayer !== 'function'){
        resEl.innerHTML = '<span style="color:#ff6666;">_fbCompensatePlayer 未載入,請重新整理頁面</span>'; return;
      }
      if(!confirm('確認對 ' + _matched.length + ' 位學生發放?\n\n' + items.join('\n') + '\n\n(union 合併,不會降級已有資料)')) return;
      sendBtn.disabled = true; const _old = sendBtn.textContent; sendBtn.textContent = '發放中...';
      const _adminEmail = (window._fbUser && window._fbUser.email) || 'admin';
      const _summary = items.join(' + ');
      let _done = 0; const _fail = [];
      for(const m of _matched){
        try{
          await window._fbCompensatePlayer(m.uid, Object.assign({}, reward, {
            reason: '課堂獎勵發放',
            summary: '課堂獎勵:' + _summary,
            by: _adminEmail
          }));
          _done++; sendBtn.textContent = '發放中... ' + _done + '/' + _matched.length;
          // ★ v3.13.74 — 寫送禮記錄(失敗不影響發獎)
          if(typeof window._fbWriteGmGiftLog === 'function'){
            try{ await window._fbWriteGmGiftLog({ uid:m.uid, label:m.label, email:m.email, items:items, by:_adminEmail }); }
            catch(_eLog){ console.warn('[課堂獎勵] 送禮記錄寫入失敗', _eLog); }
          }
        }catch(e){ _fail.push(m.label + ':' + (e && e.message || e)); }
      }
      let html = '<div style="text-align:left;font-size:13px;line-height:1.7;">';
      html += '<div style="color:#88ff88;font-weight:800;">✅ 已發放 ' + _done + '/' + _matched.length + ' 人(' + _esc(_summary) + ')</div>';
      if(_fail.length) html += '<div style="color:#ff6666;">❌ 失敗 ' + _fail.length + ':<br>' + _fail.map(x => '・' + _esc(x)).join('<br>') + '</div>';
      html += '<div style="color:#aaa;margin-top:4px;">(已清空待發名單,如要再發請重新比對;記錄可按下方「查看送禮記錄」)</div>';
      html += '</div>';
      resEl.innerHTML = html;
      sendBtn.textContent = _old;
      _matched = []; _setSendEnabled(false);   // 發完清空,避免重複發
    }
    // ★ v3.13.74 — 送禮記錄檢視器
    async function _showLog(){
      if(!logEl) return;
      if(typeof window._fbReadGmGiftLog !== 'function'){
        logEl.innerHTML = '<span style="color:#ff6666;">_fbReadGmGiftLog 未載入,請重新整理頁面</span>'; return;
      }
      logEl.innerHTML = '<span style="color:#aaa;">讀取中...</span>';
      try{
        const _list = await window._fbReadGmGiftLog(80);
        if(!_list.length){ logEl.innerHTML = '<span style="color:#aaa;">尚無送禮記錄(或 gmGiftLog 規則尚未部署)</span>'; return; }
        let html = '<div style="max-height:280px;overflow-y:auto;border:1px solid rgba(140,220,120,0.25);border-radius:6px;padding:8px;background:rgba(0,0,0,0.3);">';
        html += '<div style="color:#9fd6ff;margin-bottom:6px;">共 ' + _list.length + ' 筆(新→舊):</div>';
        _list.forEach(r => {
          const _t = r.at ? new Date(r.at).toLocaleString('zh-TW', { hour12:false }) : '?';
          html += '<div style="padding:5px 0;border-bottom:1px dashed rgba(120,180,120,0.18);">'
            + '<span style="color:#fff;font-weight:700;">' + _esc(r.label || r.email || r.uid) + '</span> '
            + '<span style="color:#ffe066;">' + _esc((r.items||[]).join('、')) + '</span><br>'
            + '<span style="color:#789;font-size:11px;">' + _esc(_t) + ' ・ by ' + _esc(r.by||'') + '</span>'
            + '</div>';
        });
        html += '</div>';
        logEl.innerHTML = html;
      }catch(e){
        logEl.innerHTML = '<span style="color:#ff6666;">讀取失敗:' + _esc(e && e.message || e) + '(可能 gmGiftLog 規則尚未部署)</span>';
      }
    }
    prevBtn.onclick = _preview;
    sendBtn.onclick = _send;
    if(logBtn) logBtn.onclick = _showLog;
  })();
  // ── 課堂獎勵發放 結束 ──

  // ════════════════════════════════════════════════════════════════════════════
  // ★ v3.13.72 — 鬥技場排名發獎開關 init
  //   呼叫 index.html 既有 window._fbGetArenaFlags / window._fbSetArenaRankReward
  //   (寫 stats/global.arenaRankRewardEnabled;排行榜顯示不受此旗標影響)
  // ════════════════════════════════════════════════════════════════════════════
  (function _initArenaRankRewardSection(){
    const loadBtn = document.getElementById('_admin-arena-rankreward-load');
    const onBtn   = document.getElementById('_admin-arena-rankreward-on');
    const offBtn  = document.getElementById('_admin-arena-rankreward-off');
    const statusEl= document.getElementById('_admin-arena-rankreward-status');
    const resEl   = document.getElementById('_admin-arena-rankreward-result');
    if(!loadBtn || !onBtn || !offBtn){
      console.warn('[admin arena rankreward] DOM 元素缺失,跳過初始化');
      return;
    }
    async function _load(){
      statusEl.textContent = '載入中...'; statusEl.style.color = '#aaa';
      try{
        if(typeof window._fbGetArenaFlags !== 'function') throw new Error('_fbGetArenaFlags 未載入,請重新整理');
        const f = await window._fbGetArenaFlags();
        const on = !!(f && f.arenaRankRewardEnabled);
        statusEl.style.color = on ? '#66dd88' : '#ff6688';
        statusEl.textContent = on ? '✅ 目前:排名發獎「開啟」' : '⛔ 目前:排名發獎「關閉」';
      }catch(e){ statusEl.style.color = '#ff6666'; statusEl.textContent = '❌ 載入失敗:' + (e && e.message || e); }
    }
    async function _set(enabled){
      const btn = enabled ? onBtn : offBtn; const _old = btn.textContent;
      btn.disabled = true; btn.textContent = '處理中...';
      try{
        if(typeof window._fbSetArenaRankReward !== 'function') throw new Error('_fbSetArenaRankReward 未載入,請重新整理');
        await window._fbSetArenaRankReward(enabled);
        resEl.style.color = enabled ? '#66dd88' : '#ffcc66';
        resEl.textContent = enabled
          ? '✅ 已開啟排名發獎(玩家下次登入會自動結算上週排名並領獎)'
          : '⛔ 已關閉排名發獎(暫停每週結算發放;排行榜仍可查看)';
        await _load();
      }catch(e){ resEl.style.color = '#ff6666'; resEl.textContent = '❌ 設定失敗:' + (e && e.message || e); }
      finally{ btn.disabled = false; btn.textContent = _old; }
    }
    loadBtn.onclick = _load;
    onBtn.onclick = () => _set(true);
    offBtn.onclick = () => _set(false);
    setTimeout(_load, 120);
  })();
  // ── 鬥技場排名發獎開關 結束 ──

  // ════════════════════════════════════════════════════════════════════════════
  // ★ v3.13.27(2026-06-03) — GitHub 線上版本檢查 init
  //   按鈕 1:立即重新檢查(繞過 5 分鐘冷卻)
  //   按鈕 2:顯示上次檢查結果(從 window._lxpsGitHubVersionStatus 讀)
  // ════════════════════════════════════════════════════════════════════════════
  (function _initGithubCheckSection(){
    const resEl = document.getElementById('_admin-github-check-result');
    if(!resEl) return;

    function _renderResult(result){
      if(!result){
        resEl.innerHTML = '<span style="color:#888;">尚未執行任何檢查。</span>';
        return;
      }
      const _ok = result.ok;
      const _ts = new Date(result.timestamp || Date.now()).toLocaleString();
      let _html = '<div style="margin-bottom:8px;color:' + (_ok ? '#88ff88' : '#ff8866') + ';font-weight:800;font-size:13px;">'
                + (_ok ? '✅ 4 個檔案全部對齊' : '⚠️ 發現 ' + result.issues.length + ' 個版本不同步')
                + '<span style="color:#888;font-weight:400;font-size:11px;margin-left:8px;">(' + _ts + ')</span>'
                + '</div>';
      (result.checks || []).forEach(c => {
        if(c.error){
          _html += '<div style="color:#ffaa88;margin-top:4px;">❌ ' + c.file + ': ' + c.error + '</div>';
        } else {
          const _mark = c.aligned ? '✅' : '⚠️';
          const _col = c.aligned ? '#aaffaa' : '#ffaa88';
          _html += '<div style="color:' + _col + ';margin-top:4px;">'
                + _mark + ' <b>' + c.file + '</b>'
                + (c.aligned
                    ? ' &nbsp;對齊:' + (c.local || '')
                    : '<br>　　GitHub: <b style="color:#fff;">' + (c.github || '') + '</b>'
                      + '<br>　　本機:  <b style="color:#fff;">' + (c.local || '') + '</b>')
                + '</div>';
        }
      });
      if(!_ok){
        _html += '<div style="margin-top:10px;padding:6px 10px;background:rgba(255,150,80,0.15);'
              + 'border-left:3px solid #ffaa66;color:#ffd0a0;font-size:11px;line-height:1.5;">'
              + '💡 建議:玩家請按 <b>Ctrl + F5</b>(強制重新整理破快取);<br>'
              + '若 GitHub 顯示「(抓不到)」可能是檔案還沒推上去或路徑改了'
              + '</div>';
      }
      resEl.innerHTML = _html;
    }

    // 按鈕 1:立即重新檢查
    const _nowBtn = document.getElementById('_admin-github-check-now');
    if(_nowBtn){
      _nowBtn.onclick = async () => {
        _nowBtn.disabled = true;
        _nowBtn.textContent = '⏳ 檢查中…';
        resEl.innerHTML = '<span style="color:#88ccff;">📡 正在 fetch 4 個檔案,請稍候…</span>';
        try{
          if(typeof window._lxpsCheckGithubVersions !== 'function'){
            throw new Error('_lxpsCheckGithubVersions 未就緒(請重新整理頁面)');
          }
          const _r = await window._lxpsCheckGithubVersions({ force: true, showOkToast: true });
          _renderResult(_r);
        }catch(e){
          resEl.innerHTML = '<span style="color:#ff8866;">❌ 檢查失敗:' + (e.message || e) + '</span>';
        }finally{
          _nowBtn.disabled = false;
          _nowBtn.textContent = '🔄 立即重新檢查(繞過 5 分鐘冷卻)';
        }
      };
    }

    // 按鈕 2:顯示上次檢查結果
    const _showBtn = document.getElementById('_admin-github-check-show');
    if(_showBtn){
      _showBtn.onclick = () => {
        const _last = window._lxpsGitHubVersionStatus;
        if(!_last){
          resEl.innerHTML = '<span style="color:#aaa;">📭 還沒有任何檢查結果(請等 boot 8 秒後自動跑、或按「🔄 立即重新檢查」)</span>';
        } else {
          _renderResult(_last);
        }
      };
    }

    // 初始就顯示一次(若已有結果)
    if(window._lxpsGitHubVersionStatus){
      _renderResult(window._lxpsGitHubVersionStatus);
    }
  })();
  // ── GitHub 版本檢查 結束 ──

  // ════════════════════════════════════════════════════════════════════════════
  // ★ v3.13.27(2026-06-03) — 龍王 HP 救援 init
  //   被 BUG 秒殺後恢復血量。走 _wbHpSync.resetHp(BOSS_ID, newHp) 寫雲端,
  //   subscribeWbHp 會自動推送給所有玩家。
  // ════════════════════════════════════════════════════════════════════════════
  (function _initWbRescueSection(){
    const BOSS_ID  = 'vesuvius_fire_dragon';
    const MAX_HP   = 5000000;
    const statusEl = document.getElementById('_admin-wb-rescue-status');
    const inputEl  = document.getElementById('_admin-wb-rescue-input');
    const writeBtn = document.getElementById('_admin-wb-rescue-write');
    const resEl    = document.getElementById('_admin-wb-rescue-result');
    const refreshBtn = document.getElementById('_admin-wb-rescue-refresh');
    if(!statusEl) return;  // section 不存在(可能尚未注入),跳過

    function _fmt(n){ return (typeof n === 'number') ? n.toLocaleString() : String(n); }

    // 讀取當前 HP 並更新狀態顯示
    function _refreshStatus(){
      try{
        if(!window._wbHpSync || typeof window._wbHpSync.getCurrentHp !== 'function'){
          statusEl.innerHTML = '<span style="color:#ff8866;">⚠ _wbHpSync 模組未就緒(請等遊戲完全載入)</span>';
          return;
        }
        const _cur = window._wbHpSync.getCurrentHp(BOSS_ID);
        if(_cur == null){
          statusEl.innerHTML = '<span style="color:#aaa;">📡 雲端尚未有此 BOSS 的 HP 紀錄(視為滿血 ' + _fmt(MAX_HP) + ')</span>';
          return;
        }
        const _pct = Math.round((_cur / MAX_HP) * 100);
        const _color = _cur === 0 ? '#ff6666' : (_cur < MAX_HP * 0.3 ? '#ffaa66' : (_cur < MAX_HP * 0.7 ? '#ffcc66' : '#aaffaa'));
        const _label = _cur === 0 ? '💀 已倒下' : (_cur >= MAX_HP ? '❤️ 滿血' : `❤️ 剩 ${_pct}%`);
        statusEl.innerHTML =
          '<span style="color:' + _color + ';">' + _label + '</span>'
          + ' &nbsp;<span style="color:#ddd;">當前 HP: <b style="font-size:15px;">' + _fmt(_cur) + '</b> / ' + _fmt(MAX_HP) + '</span>';
        // 把當前值填入 input 方便修改
        try{ inputEl.value = _cur; }catch(_){}
      }catch(e){
        statusEl.innerHTML = '<span style="color:#ff8866;">❌ 讀取失敗:' + (e.message || e) + '</span>';
      }
    }

    // 寫入 HP
    async function _writeHp(newHp){
      try{
        if(typeof newHp !== 'number' || isNaN(newHp) || newHp < 0 || newHp > MAX_HP){
          throw new Error('HP 必須在 0 ~ ' + _fmt(MAX_HP) + ' 之間');
        }
        if(!window._wbHpSync || typeof window._wbHpSync.resetHp !== 'function'){
          throw new Error('_wbHpSync.resetHp 模組未就緒');
        }
        // GM 守門
        if(typeof window._isAdminUser !== 'function' || !window._isAdminUser()){
          throw new Error('權限不足:需要 GM 身份');
        }
        writeBtn.disabled = true;
        writeBtn.textContent = '⏳ 寫入中…';
        resEl.style.color = '#ffcc88';
        resEl.textContent = '📡 正在寫入雲端…';
        const _ok = await window._wbHpSync.resetHp(BOSS_ID, newHp);
        if(_ok){
          resEl.style.color = '#88ff88';
          resEl.textContent = '✅ 已寫入雲端!HP = ' + _fmt(newHp) + '(所有玩家 30 秒內看到新血量)'
            + (newHp > 0 ? ' ・已重置結算計時:這一輪當沒發生,改等龍王「下次真正倒下」後隔天 8:00 才結算' : '');
          // 1 秒後重讀狀態(_cachedGlobalStats 約 1 秒會更新)
          setTimeout(_refreshStatus, 1500);
        } else {
          throw new Error('resetHp 回傳 false(請看 console 詳細錯誤)');
        }
      }catch(e){
        console.error('[WB 救援]', e);
        resEl.style.color = '#ff8866';
        resEl.textContent = '❌ ' + (e.message || e);
      }finally{
        writeBtn.disabled = false;
        writeBtn.textContent = '💉 寫入指定 HP';
      }
    }

    // 寫入按鈕
    if(writeBtn){
      writeBtn.onclick = async () => {
        const _hp = parseInt(inputEl.value, 10);
        if(isNaN(_hp)){ resEl.style.color = '#ff8866'; resEl.textContent = '❌ 請輸入有效的數字'; return; }
        // 二次確認
        const _cur = (window._wbHpSync && window._wbHpSync.getCurrentHp) ? window._wbHpSync.getCurrentHp(BOSS_ID) : null;
        const _curStr = (_cur == null) ? '(雲端無紀錄,視為滿血)' : _fmt(_cur);
        const _msg = '⚠ 確定要把龍王 HP 寫成 ' + _fmt(_hp) + ' 嗎?\n\n'
                   + '當前 HP:' + _curStr + '\n'
                   + '新 HP:  ' + _fmt(_hp) + '\n\n'
                   + '此操作會立即同步給所有玩家。';
        if(!confirm(_msg)) return;
        await _writeHp(_hp);
      };
    }

    // 快捷按鈕
    document.querySelectorAll('._admin-wb-rescue-preset').forEach(btn => {
      btn.onclick = async () => {
        const _hp = parseInt(btn.getAttribute('data-hp'), 10);
        if(isNaN(_hp)) return;
        inputEl.value = _hp;
        const _cur = (window._wbHpSync && window._wbHpSync.getCurrentHp) ? window._wbHpSync.getCurrentHp(BOSS_ID) : null;
        const _curStr = (_cur == null) ? '(雲端無紀錄)' : _fmt(_cur);
        const _msg = '⚠ 確定要把龍王 HP 寫成 ' + _fmt(_hp) + ' 嗎?\n\n'
                   + '當前 HP:' + _curStr + '\n'
                   + '新 HP:  ' + _fmt(_hp);
        if(!confirm(_msg)) return;
        await _writeHp(_hp);
      };
    });

    // 重讀按鈕
    if(refreshBtn){
      refreshBtn.onclick = () => {
        resEl.style.color = '#aaccff';
        resEl.textContent = '🔄 重讀中…';
        _refreshStatus();
        setTimeout(() => { resEl.textContent = ''; }, 1500);
      };
    }

    // 初始載入(延遲 500ms 等 _wbHpSync 就緒)
    setTimeout(_refreshStatus, 500);
  })();
  // ── 龍王 HP 救援 結束 ──

  // ════════════════════════════════════════════════════════════════════════════
  // ★ v3.13.20(2026-06-02) — 鬥技場戰鬥記錄審核 init
  //   讀 Firestore arenaBattles collection 最近 500 筆
  //   排序、篩玩家、刪除單筆、清空全部、清舊資料
  // ════════════════════════════════════════════════════════════════════════════
  (function _initArenaBattlesSection(){
    const loadBtn   = document.getElementById('_admin-arena-battles-load');
    const sortSel   = document.getElementById('_admin-arena-battles-sort');
    const filterIn  = document.getElementById('_admin-arena-battles-filter');
    const countEl   = document.getElementById('_admin-arena-battles-count');
    const listEl    = document.getElementById('_admin-arena-battles-list');
    const resEl     = document.getElementById('_admin-arena-battles-result');
    const clearAllBtn = document.getElementById('_admin-arena-battles-clear-all');
    const clearOldBtn = document.getElementById('_admin-arena-battles-clear-old');
    if(!loadBtn || !listEl){
      console.warn('[admin arena battles] DOM 元素缺失,跳過初始化');
      return;
    }

    let _battles = [];  // 快取的記錄陣列

    async function _getSdk(){
      try{
        // ★ v3.13.20 — 優先用 index.html 統一掛載的 window._fbFns
        if(window._fbFns && window._fbFns.collection){
          return {
            collection: window._fbFns.collection,
            getDocs:    window._fbFns.getDocs,
            query:      window._fbFns.query,
            orderBy:    window._fbFns.orderBy,
            limit:      window._fbFns.limit,
            deleteDoc:  window._fbFns.deleteDoc,
            doc:        window._fbFns.doc,
            where:      window._fbFns.where,
          };
        }
        // fallback:動態 import
        const m = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
        return {
          collection: m.collection,
          getDocs: m.getDocs,
          query: m.query,
          orderBy: m.orderBy,
          limit: m.limit,
          deleteDoc: m.deleteDoc,
          doc: m.doc,
          where: m.where,
        };
      }catch(e){
        console.warn('[admin arena battles] SDK 取得失敗', e);
        return null;
      }
    }

    async function _loadBattles(){
      listEl.innerHTML = '<div style="color:#888;padding:14px;text-align:center;">載入中...</div>';
      resEl.textContent = '';
      try{
        if(!window._fbDb) throw new Error('Firestore 未就緒');
        const sdk = await _getSdk();
        if(!sdk || !sdk.collection || !sdk.getDocs) throw new Error('Firestore SDK 未就緒');
        // 依時間倒序拉最近 500 筆
        let q;
        try{
          q = sdk.query(sdk.collection(window._fbDb, 'arenaBattles'),
                        sdk.orderBy('ts','desc'), sdk.limit(500));
        }catch(_eQ){
          // 若 query/orderBy/limit 不可用 → fallback 直接 collection
          q = sdk.collection(window._fbDb, 'arenaBattles');
        }
        const snap = await sdk.getDocs(q);
        _battles = [];
        snap.forEach(d => {
          const data = d.data() || {};
          _battles.push({
            _docId: d.id,
            uid: data.uid || '',
            email: data.email || '',
            displayLabel: data.displayLabel || '',
            teamName: data.teamName || '(無)',
            heroes: Array.isArray(data.heroes) ? data.heroes : [],
            elements: Array.isArray(data.elements) ? data.elements : [],
            rounds: data.rounds || 1,
            totalDmg: data.totalDmg || 0,
            avgDmgPerRound: data.avgDmgPerRound || Math.floor((data.totalDmg||0) / (data.rounds||1)),
            result: data.result || '',
            ts: data.ts || 0,
          });
        });
        _renderList();
      }catch(e){
        console.error('[admin arena battles load]', e);
        listEl.innerHTML = '<div style="color:#ff6666;padding:14px;text-align:center;">❌ 載入失敗:' + (e && e.message || '未知錯誤') + '</div>';
      }
    }

    function _renderList(){
      const sortVal   = sortSel ? sortSel.value : 'avg_desc';
      const filterVal = (filterIn && filterIn.value || '').trim().toLowerCase();

      let view = _battles.slice();
      // 篩選
      if(filterVal){
        view = view.filter(b => {
          const blob = (b.uid + ' ' + b.email + ' ' + b.displayLabel).toLowerCase();
          return blob.indexOf(filterVal) !== -1;
        });
      }
      // 排序
      const cmpMap = {
        avg_desc:    (a,b) => (b.avgDmgPerRound||0) - (a.avgDmgPerRound||0),
        avg_asc:     (a,b) => (a.avgDmgPerRound||0) - (b.avgDmgPerRound||0),
        total_desc:  (a,b) => (b.totalDmg||0)       - (a.totalDmg||0),
        ts_desc:     (a,b) => (b.ts||0)             - (a.ts||0),
        rounds_asc:  (a,b) => (a.rounds||0)         - (b.rounds||0),
      };
      view.sort(cmpMap[sortVal] || cmpMap.avg_desc);

      countEl.textContent = '共 ' + _battles.length + ' 筆,顯示 ' + view.length + ' 筆';

      if(view.length === 0){
        listEl.innerHTML = '<div style="color:#888;padding:14px;text-align:center;">(無資料 — 等玩家打鬥技場後會自動上傳)</div>';
        return;
      }

      const ABNORMAL_THRESHOLD = 800;  // 平均單回合 > 800 視為異常(老師可調)

      const rows = view.map(b => {
        const isAbn = (b.avgDmgPerRound || 0) > ABNORMAL_THRESHOLD;
        const resultIcon = b.result === 'win' ? '🏆 勝' : (b.result === 'lose' ? '☠ 敗' : (b.result === 'draw' ? '🤝 平' : '❓'));
        const tsStr = b.ts ? new Date(b.ts).toLocaleString('zh-TW',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}) : '(無)';
        const heroesStr = (b.heroes || []).join('、') || '(無)';
        const playerStr = b.displayLabel || b.email || (b.uid && b.uid.slice(0,10)) || '(未知)';
        return '<div data-docid="' + _escapeAttr(b._docId) + '" style="'
          + 'background:' + (isAbn ? 'rgba(200,40,40,0.2)' : 'rgba(40,40,60,0.4)') + ';'
          + 'border:1px solid ' + (isAbn ? '#cc6666' : 'rgba(255,180,80,0.2)') + ';'
          + 'border-radius:5px;padding:7px 10px;margin-bottom:6px;'
          + 'display:flex;flex-wrap:wrap;align-items:center;gap:10px;font-size:12px;">'
          + '<span style="font-weight:800;color:' + (isAbn ? '#ff8888' : '#ffcc99') + ';min-width:70px;">'
          + (isAbn ? '⚠ ' : '') + '平均 ' + (b.avgDmgPerRound || 0) + '</span>'
          + '<span style="color:#bbb;min-width:90px;">總傷 ' + (b.totalDmg || 0) + ' / ' + (b.rounds || 0) + '回</span>'
          + '<span style="color:#ddd;min-width:60px;">' + resultIcon + '</span>'
          + '<span style="color:#fff;font-weight:700;min-width:120px;">' + _escapeHtml(playerStr) + '</span>'
          + '<span style="color:#aaa;flex:1;min-width:140px;">「' + _escapeHtml(b.teamName) + '」 ' + _escapeHtml(heroesStr) + '</span>'
          + '<span style="color:#888;font-size:11px;min-width:90px;">' + tsStr + '</span>'
          + '<button class="_admin-arena-battles-del" data-docid="' + _escapeAttr(b._docId) + '" '
          + 'style="padding:3px 8px;font-size:11px;background:rgba(200,60,60,0.3);'
          + 'border:1px solid #cc6666;color:#ffaaaa;border-radius:4px;cursor:pointer;'
          + 'font-family:inherit;">🗑️ 純刪除</button>'
          // ★ v3.13.31(2026-06-03)— 老師需求 #4:刪除異常戰鬥 + 補償 1 張鬥技場入場券
          + '<button class="_admin-arena-battles-del-comp" data-docid="' + _escapeAttr(b._docId) + '" '
          + 'data-uid="' + _escapeAttr(b.uid) + '" '
          + 'data-label="' + _escapeAttr(playerStr) + '" '
          + 'style="padding:3px 8px;font-size:11px;background:rgba(255,160,80,0.3);'
          + 'border:1px solid #ffaa66;color:#ffd699;border-radius:4px;cursor:pointer;'
          + 'font-family:inherit;font-weight:700;">🎫 刪除+補償 1 券</button>'
          + '<button class="_admin-arena-battles-clear-user" data-uid="' + _escapeAttr(b.uid) + '" '
          + 'data-label="' + _escapeAttr(playerStr) + '" '
          + 'style="padding:3px 8px;font-size:11px;background:rgba(120,80,80,0.3);'
          + 'border:1px solid #aa7777;color:#ddbbbb;border-radius:4px;cursor:pointer;'
          + 'font-family:inherit;">🧹 清此玩家</button>'
          + '</div>';
      });

      listEl.innerHTML = rows.join('');

      // 綁定刪除單筆事件
      listEl.querySelectorAll('._admin-arena-battles-del').forEach(btn => {
        btn.onclick = () => _deleteOne(btn.dataset.docid);
      });
      // ★ v3.13.31(2026-06-03)— 刪除 + 補償入場券 button(老師需求 #4)
      listEl.querySelectorAll('._admin-arena-battles-del-comp').forEach(btn => {
        btn.onclick = () => _deleteAndCompensate(btn.dataset.docid, btn.dataset.uid, btn.dataset.label);
      });
      listEl.querySelectorAll('._admin-arena-battles-clear-user').forEach(btn => {
        btn.onclick = () => _clearByUid(btn.dataset.uid, btn.dataset.label);
      });
    }

    async function _deleteOne(docId){
      if(!docId) return;
      const ok = window._customConfirm
        ? await window._customConfirm('確定要刪除這筆鬥技場戰鬥記錄?', '⚠️ 確認刪除')
        : confirm('確定要刪除這筆鬥技場戰鬥記錄?');
      if(!ok) return;
      try{
        const sdk = await _getSdk();
        if(!sdk || !sdk.deleteDoc || !sdk.doc) throw new Error('Firestore SDK 未就緒');
        await sdk.deleteDoc(sdk.doc(window._fbDb, 'arenaBattles', docId));
        _battles = _battles.filter(b => b._docId !== docId);
        _renderList();
        resEl.style.color = '#66dd88';
        resEl.textContent = '✅ 已刪除 1 筆記錄';
        setTimeout(()=>{ resEl.textContent=''; }, 4000);
      }catch(e){
        console.error('[admin arena battles delete]', e);
        resEl.style.color = '#ff6666';
        resEl.textContent = '❌ 刪除失敗:' + (e && e.message || '未知錯誤');
      }
    }

    // ════════════════════════════════════════════════════════════════════
    // ★ v3.13.31(2026-06-03)— 老師需求 #4:刪除 + 補償鬥技場入場券
    //   原子單次 GM 動作:
    //     1. 確認玩家身份與要刪除的記錄
    //     2. 先補發 1 張入場券到 players/{uid}.playerBackpack.arena_entry_ticket
    //     3. 再刪除 arenaBattles/{docId} 記錄
    //     4. UI 顯示「✅ 已刪除 N 筆,並補償 X 張入場券」
    //   背後呼叫 arena.js 的 window._arenaAdminDeleteAndCompensate(docId, n)
    //   注意:鬥技之證的「扣除」是隱性的 — 排行榜 _fetchLeaderboard 從 arenaBattles 即時聚合,
    //         刪掉這筆 → 該玩家的 zheng 自動減 (3/2/1)。本機 localStorage 數字不動,但排行榜會正確。
    // ════════════════════════════════════════════════════════════════════
    async function _deleteAndCompensate(docId, uid, label){
      if(!docId) return;
      const _label = label || (uid && uid.slice(0,10)) || '(未知玩家)';
      const ok = window._customConfirm
        ? await window._customConfirm(
            '確定要對「' + _label + '」執行:\n\n'
            + '  1. 刪除此筆鬥技場戰鬥記錄(排行榜的鬥技之證自動扣除)\n'
            + '  2. 補償 1 張「鬥技場入場券」到該玩家持有上限 5 張內\n\n'
            + '⚠ 玩家本機顯示的鬥技之證數字不會即時更新,但排行榜聚合會反映扣除。',
            '⚠ 確認:刪除 + 補償 1 張入場券')
        : confirm('對「' + _label + '」刪除此筆記錄並補償 1 張入場券?');
      if(!ok) return;
      try{
        if(typeof window._arenaAdminDeleteAndCompensate !== 'function'){
          throw new Error('_arenaAdminDeleteAndCompensate API 未掛載(arena.js 版本過舊?)');
        }
        const _r = await window._arenaAdminDeleteAndCompensate(docId, 1);
        if(_r && _r.ok){
          // 從本機快取移掉這筆,重渲染列表
          _battles = _battles.filter(b => b._docId !== docId);
          _renderList();
          const _tk = _r.ticket || {};
          resEl.style.color = '#66dd88';
          resEl.innerHTML = '✅ 已刪除 1 筆記錄,並補償 ' + (_tk.granted || 0)
            + ' 張入場券給「' + _escapeHtml(_label) + '」'
            + '(現持有 <b>' + (_tk.total || 0) + '/' + (_tk.max || 5) + '</b> 張)';
          setTimeout(()=>{ resEl.textContent=''; resEl.innerHTML=''; }, 8000);
        } else {
          const _why = (_r && _r.reason) || 'unknown';
          // partial=ticket_granted:券補了但記錄沒刪 → 提示 GM 手動再刪
          const _partial = (_r && _r.partial) || '';
          let _msg = '❌ 失敗:' + _why;
          if(_partial === 'ticket_granted'){
            _msg += '(已補發入場券但刪除記錄失敗 — 請再按一次「🗑️ 純刪除」)';
          }
          resEl.style.color = '#ff6666';
          resEl.textContent = _msg;
        }
      }catch(e){
        console.error('[admin arena battles del+compensate]', e);
        resEl.style.color = '#ff6666';
        resEl.textContent = '❌ 例外:' + (e && e.message || '未知錯誤');
      }
    }

    async function _clearByUid(uid, label){
      if(!uid) return;
      const ok = window._customConfirm
        ? await window._customConfirm('確定要清除「' + (label||uid) + '」的所有鬥技場戰鬥記錄?',
            '⚠️ 確認清除整位玩家的戰鬥記錄')
        : confirm('確定要清除「' + (label||uid) + '」的所有戰鬥記錄?');
      if(!ok) return;
      try{
        const sdk = await _getSdk();
        if(!sdk || !sdk.deleteDoc || !sdk.doc) throw new Error('Firestore SDK 未就緒');
        const toDelete = _battles.filter(b => b.uid === uid);
        let success = 0;
        for(const b of toDelete){
          try{
            await sdk.deleteDoc(sdk.doc(window._fbDb, 'arenaBattles', b._docId));
            success++;
          }catch(_eD){ console.warn('[admin arena battles clear uid] 刪除失敗', b._docId, _eD); }
        }
        _battles = _battles.filter(b => b.uid !== uid);
        _renderList();
        resEl.style.color = '#66dd88';
        resEl.textContent = '✅ 已清除「' + (label||uid) + '」的 ' + success + ' 筆記錄';
      }catch(e){
        console.error('[admin arena battles clear uid]', e);
        resEl.style.color = '#ff6666';
        resEl.textContent = '❌ 清除失敗:' + (e && e.message || '未知錯誤');
      }
    }

    async function _clearAll(){
      const ok = window._customConfirm
        ? await window._customConfirm('⚠️ 確定要清空目前載入的 ' + _battles.length + ' 筆鬥技場記錄?\n\n此動作不可復原!',
            '⚠️ 危險:清空全部記錄')
        : confirm('清空目前 ' + _battles.length + ' 筆?不可復原!');
      if(!ok) return;
      try{
        const sdk = await _getSdk();
        if(!sdk || !sdk.deleteDoc || !sdk.doc) throw new Error('Firestore SDK 未就緒');
        let success = 0;
        for(const b of _battles){
          try{
            await sdk.deleteDoc(sdk.doc(window._fbDb, 'arenaBattles', b._docId));
            success++;
          }catch(_eD){ console.warn('[admin arena battles clear all] 刪除失敗', b._docId, _eD); }
        }
        _battles = [];
        _renderList();
        resEl.style.color = '#66dd88';
        resEl.textContent = '✅ 已清空 ' + success + ' 筆記錄';
      }catch(e){
        console.error('[admin arena battles clear all]', e);
        resEl.style.color = '#ff6666';
        resEl.textContent = '❌ 清空失敗:' + (e && e.message || '未知錯誤');
      }
    }

    async function _clearOld(){
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const toDelete = _battles.filter(b => (b.ts || 0) < cutoff);
      if(toDelete.length === 0){
        resEl.style.color = '#aaa';
        resEl.textContent = '(目前載入的記錄中,沒有 30 天前的舊資料)';
        return;
      }
      const ok = window._customConfirm
        ? await window._customConfirm('共找到 ' + toDelete.length + ' 筆 30 天前的舊記錄,確定要刪除嗎?',
            '清除舊記錄')
        : confirm('清除 ' + toDelete.length + ' 筆 30 天前舊記錄?');
      if(!ok) return;
      try{
        const sdk = await _getSdk();
        if(!sdk || !sdk.deleteDoc || !sdk.doc) throw new Error('Firestore SDK 未就緒');
        let success = 0;
        for(const b of toDelete){
          try{
            await sdk.deleteDoc(sdk.doc(window._fbDb, 'arenaBattles', b._docId));
            success++;
          }catch(_eD){ console.warn('[admin arena battles clear old] 刪除失敗', b._docId, _eD); }
        }
        _battles = _battles.filter(b => (b.ts || 0) >= cutoff);
        _renderList();
        resEl.style.color = '#66dd88';
        resEl.textContent = '✅ 已清除 ' + success + ' 筆舊記錄';
      }catch(e){
        console.error('[admin arena battles clear old]', e);
        resEl.style.color = '#ff6666';
        resEl.textContent = '❌ 清除失敗:' + (e && e.message || '未知錯誤');
      }
    }

    // HTML 轉義工具
    function _escapeHtml(s){
      return String(s == null ? '' : s)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }
    function _escapeAttr(s){
      return _escapeHtml(s);
    }

    loadBtn.onclick      = _loadBattles;
    if(sortSel)   sortSel.onchange   = _renderList;
    if(filterIn)  filterIn.oninput   = _renderList;
    if(clearAllBtn) clearAllBtn.onclick = _clearAll;
    if(clearOldBtn) clearOldBtn.onclick = _clearOld;
  })();
  // ── 鬥技場戰鬥記錄審核 結束 ──

  document.getElementById('_admin-set-players').onclick = async () => {
    const input = document.getElementById('_admin-players-input');
    const btn = document.getElementById('_admin-set-players');
    const res = document.getElementById('_admin-players-result');
    const val = parseInt(input.value, 10);
    if(isNaN(val) || val < 0){
      res.style.color = '#ff6666';
      res.textContent = '❌ 請輸入 0 或以上的整數';
      return;
    }
    if(!window._fbSetTotalPlayers){
      res.style.color = '#ff6666';
      res.textContent = '❌ Firebase 尚未就緒，請稍後再試';
      return;
    }
    if(!confirm(`確定要把「總玩家數」設定為 ${val} 嗎？這會覆寫現有值。`)) return;
    btn.disabled = true;
    btn.textContent = '設定中...';
    try {
      await window._fbSetTotalPlayers(val);
      res.style.color = '#88ccff';
      res.textContent = `✅ 已設定 totalPlayers = ${val}`;
    } catch(e){
      res.style.color = '#ff6666';
      res.textContent = '❌ 失敗：' + (e && e.code || e.message || '未知錯誤');
    } finally {
      btn.disabled = false;
      btn.textContent = '▶ 設定';
    }
  };

  // ★★★ 玩家資料急救工具(v1.0.20260419.1930) ★★★
  let _rescueDiagData = null;  // 暫存最近一次診斷結果

  // 診斷
  document.getElementById('_admin-rescue-diagnose').onclick = async () => {
    const uidInput = document.getElementById('_admin-rescue-uid');
    const diag = document.getElementById('_admin-rescue-diag');
    const form = document.getElementById('_admin-rescue-form');
    const res = document.getElementById('_admin-rescue-result');
    res.textContent = '';
    form.style.display = 'none';
    diag.style.display = 'block';
    diag.innerHTML = '<span style="color:#aaa;">診斷中...</span>';
    const uid = (uidInput.value || '').trim() || window._gUserId;
    if(!uid){
      diag.innerHTML = '<span style="color:#ff6666;">❌ 無法取得 uid（未登入且未輸入）</span>';
      return;
    }
    if(!window._fbDiagnosePlayer){
      diag.innerHTML = '<span style="color:#ff6666;">❌ Firebase 尚未就緒</span>';
      return;
    }
    try {
      const d = await window._fbDiagnosePlayer(uid);
      _rescueDiagData = d;
      if(!d.exists){
        diag.innerHTML = '<span style="color:#ffaa66;">⚠️ 此 uid 在 Firestore 無文件紀錄,可能是尚未遊玩過的新玩家。</span>';
        return;
      }
      const savedStr = d.savedAt ? new Date(d.savedAt).toLocaleString('zh-TW') : '(無)';
      const statusColor = d.looksDamaged ? '#ff6666' : '#88ff88';
      const statusText = d.looksDamaged ? '⚠️ 疑似受損（有代表英雄/解鎖名單但主資料空白）' : '✅ 看起來正常';
      diag.innerHTML = ''
        + '<div style="color:' + statusColor + ';font-weight:700;margin-bottom:6px;">' + statusText + '</div>'
        + '<div><b>uid:</b> <code style="color:#88ccff;">' + uid + '</code></div>'
        + '<div><b>email:</b> ' + (d.email || '(無)') + '</div>'
        + '<div><b>學生:</b> ' + _adminLabel(d.email, d.displayName) + '</div>'
        + '<div><b>最後存檔:</b> ' + savedStr + '</div>'
        + '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:6px 0;">'
        + '<div>💰 知識幣: <b style="color:' + (d.knowledgeCoins === 0 && d.looksDamaged ? '#ff8888' : '#ffee88') + ';">' + d.knowledgeCoins + '</b></div>'
        + '<div>🦸 英雄等級紀錄: <b>' + d.heroLevelsCount + '</b> 位</div>'
        + '<div>🎒 背包物品: <b>' + d.backpackCount + '</b> 種</div>'
        + '<div>⚔️ 已解鎖英雄: <b>' + d.unlockedCount + '</b> 位</div>'
        + '<div>👤 代表英雄: <b>' + (d.hasRepHero ? (d.representativeHero.name + ' Lv' + (d.representativeHero.level||'?')) : '(無)') + '</b></div>';
      // 若受損,顯示還原表單
      if(d.looksDamaged){
        form.style.display = 'block';
        // 預設:若有代表英雄等級,預填為英雄預設等級
        if(d.hasRepHero && d.representativeHero.level){
          document.getElementById('_admin-rescue-hero-lv').value = Math.max(5, d.representativeHero.level - 2);
        }
      }
    } catch(e){
      diag.innerHTML = '<span style="color:#ff6666;">❌ 診斷失敗：' + (e.code || e.message || e) + '</span>';
    }
  };

  // 執行還原
  document.getElementById('_admin-rescue-apply').onclick = async () => {
    const btn = document.getElementById('_admin-rescue-apply');
    const res = document.getElementById('_admin-rescue-result');
    if(!_rescueDiagData || !_rescueDiagData.exists){
      res.style.color = '#ff6666';
      res.textContent = '❌ 請先診斷';
      return;
    }
    const coins = parseInt(document.getElementById('_admin-rescue-coins').value, 10) || 0;
    const heroLv = Math.max(0, Math.min(10, parseInt(document.getElementById('_admin-rescue-hero-lv').value, 10) || 0));
    const expBook = Math.max(0, Math.min(99, parseInt(document.getElementById('_admin-rescue-exp-book').value, 10) || 0));
    const skillBook = Math.max(0, Math.min(99, parseInt(document.getElementById('_admin-rescue-skill-book').value, 10) || 0));
    const statBook = Math.max(0, Math.min(99, parseInt(document.getElementById('_admin-rescue-stat-book').value, 10) || 0));
    const burstBook = Math.max(0, Math.min(99, parseInt(document.getElementById('_admin-rescue-burst-book').value, 10) || 0));

    const uid = _rescueDiagData.uid;
    const rep = _rescueDiagData.representativeHero;
    const unlocked = _rescueDiagData.unlockedHeroes || [];

    // 組出還原用 payload
    const heroLevels = {};
    const heroExp = {};
    unlocked.forEach(name => {
      if(rep && rep.name === name){
        // 代表英雄用其自身等級(若有),沒有則用預設
        heroLevels[name] = (rep.level && rep.level > 0) ? rep.level : (heroLv || 1);
      } else {
        heroLevels[name] = heroLv;
      }
      heroExp[name] = 0;
    });

    // 代表英雄的 skillLevels / statInvested 可保留
    const heroSkillLevels = {};
    const heroStatInvested = {};
    const heroBurstLevels = {};
    if(rep && rep.name){
      if(rep.skillLevels) heroSkillLevels[rep.name] = rep.skillLevels;
      if(rep.statInvested) heroStatInvested[rep.name] = rep.statInvested;
      if(typeof rep.burstLevel === 'number') heroBurstLevels[rep.name] = rep.burstLevel;
    }

    const heroStatPoints = {};
    let _totalStatPointsGiven = 0;
    unlocked.forEach(name => {
      const lv = heroLevels[name] || 1;
      const earned = Math.max(0, lv - 1);
      const inv = heroStatInvested[name] || {};
      const investedTotal = (inv.hp||0) + (inv.atk||0) + (inv.sp||0) + (inv.spd||0);
      const freePts = Math.max(0, earned - investedTotal);
      if(freePts > 0){
        heroStatPoints[name] = freePts;
        _totalStatPointsGiven += freePts;
      }
    });

    const playerBackpack = {
      hero_exp_book: expBook,
      skill_upgrade_book: skillBook,
      stat_reset_book: statBook,
      burst_upgrade_fruit: burstBook
    };

    const payload = {
      v: 2,
      savedAt: Date.now(),
      knowledgeCoins: coins,
      heroLevels,
      heroExp,
      heroSkillLevels,
      heroSkillLevels_s: JSON.stringify(heroSkillLevels),
      heroStatInvested,
      heroStatInvested_s: JSON.stringify(heroStatInvested),
      heroStatPoints,  // ★ v1.0.20260420.1030 — 補回被救援英雄應有的素質點數
      heroBurstLevels,
      playerBackpack,
      playerBackpack_s: JSON.stringify(playerBackpack),
      unlockedHeroes: unlocked,  // 保留解鎖名單
      _rescuedAt: Date.now(),
      _rescuedBy: (window._fbUser && window._fbUser.email) || 'admin'
    };

    const summary = '將寫入:\n'
      + '• 知識幣 ' + coins + '\n'
      + '• ' + unlocked.length + ' 位英雄設為 Lv' + heroLv + '(代表英雄 ' + (rep && rep.name) + ' 保持 Lv' + (heroLevels[rep.name]||'?') + ')\n'
      + '• 💎 素質點數:共補發 ' + _totalStatPointsGiven + ' 點(依每位英雄等級,每升1級=1點)\n'
      + '• 經驗書×' + expBook + ' 技能書×' + skillBook + ' 素質書×' + statBook + ' 爆發果×' + burstBook + '\n\n此操作無法復原,確定嗎？';
    if(!confirm(summary)) return;

    btn.disabled = true;
    btn.textContent = '還原中...';
    try {
      await window._fbRestorePlayer(uid, payload);
      res.style.color = '#88ff88';
      res.textContent = '✅ 已成功還原 ' + uid + ' 的資料。請該玩家重新整理頁面或重新登入。';
      // 若救的是自己,提示重整
      if(uid === window._gUserId){
        res.innerHTML += '<br><b style="color:#ffee88;">(您救的是自己的帳號,請<u>重新整理頁面</u>來載入還原後的資料)</b>';
      }
    } catch(e){
      res.style.color = '#ff6666';
      res.textContent = '❌ 還原失敗：' + (e.code || e.message || e);
    } finally {
      btn.disabled = false;
      btn.textContent = '🚑 執行還原(保留已有 representativeHero / unlockedHeroes / medals)';
    }
  };

  (function _initStudentCompensationTool(){
    const _getCompensatableHeroes = function(){
      try {
        if(typeof HERO_DB !== 'object' || !HERO_DB) return [];
        const _bossSet = new Set(typeof BOSS_NAMES !== 'undefined' ? BOSS_NAMES : []);
        // ★ 巫女例外:雖在 EVENT_ONLY_HEROES,但補償清單要含;'小力'/'幼兒園小孩'也是學生可獲得,放最後
        const _eventOnly = (typeof EVENT_ONLY_HEROES !== 'undefined') ? Array.from(EVENT_ONLY_HEROES) : [];
        // ★ v6520 — 日本三主 BOSS 夥伴英雄白名單(雖在 BOSS_NAMES,但要放行給補償用)
        const _japanBossHeroes = (typeof JAPAN_BOSS_HEROES !== 'undefined') ? JAPAN_BOSS_HEROES : new Set();
        // 注意:這裡不再用 _eventOnly 排除,而是用「分組排序」的方式呈現
        return Object.keys(HERO_DB).filter(name => {
          // ★ v6520 — 日本三主 BOSS(大天狗/酒吞童子/玉藻前)是夥伴英雄,白名單優先放行
          if(_japanBossHeroes.has(name)) return true;
          if(_bossSet.has(name)) return false;
          // BOSS_NAMES 排除掉的就是所有冒險 BOSS(含八岐大蛇),不會出現
          return true;
        });
      } catch(e) {
        console.warn('[_getCompensatableHeroes] 取得名單失敗', e);
        return [];
      }
    };

    // ★ v3.13.71 — GM特別獎勵英雄清單(UR/限定,只送不抽,僅由 GM 透過此工具發放)。
    //   未來新增 UR 或限定英雄,只要加進這個陣列就會自動出現在下方「🌟 GM特別獎勵」分組。
    //   發放走既有流程:查找學生(email/uid/班級碼/中文名)→ 選此英雄 → 套用 → window._fbCompensatePlayer(union 合併,不會降級)。
    const _GM_SPECIAL_REWARDS = ['藝天使．克雷爾', '魔劍姬‧伊莉雅'];
    // ★ v1.0.20260512.6210 — 補償英雄分組定義(讓老師依類型快速找)
    //   未列入任何組的英雄會自動歸到「💼 其他」最末
    const _HERO_GROUPS = [
      // ★ v3.13.71 — GM特別獎勵置頂(UR/限定)。在此組的英雄會被標記為已使用,不會再落入「💼 其他」,凸顯其特別性。
      {
        label: '🌟 GM特別獎勵(UR・限定)',
        heroes: _GM_SPECIAL_REWARDS
      },
      {
        label: '⚔️ 31 隻基本英雄',
        heroes: ['劍士','祭司','聖騎士','火法師','冰法師','雷法師','光法師','暗法師',
                 '神射手','神偷','刺客','守衛','吟遊詩人','舞者','警長','煉金術師',
                 '武鬥家','軍師','占星師','大力士','凡人','木靈使','機械師','動物學家',
                 '武士','陰陽師','吸血鬼','學者','時空法師','小力','幼兒園小孩']
      },
      {
        label: '🎓 7 隻校園英雄',
        heroes: ['籃球隊員','直笛團員','田徑隊員','電腦繪圖師','程式設計師','弦樂團員','小劇團員']
      },
      {
        label: '🗾 日本主 BOSS 解鎖系',
        heroes: ['大天狗','酒吞童子','玉藻前','巫女']
      },
      {
        label: '🎨 學生設計英雄',
        heroes: ['窮奇','科技生化人','鋁合金暴龍','超鬼神王','雙星姊妹','暗魔將·血','死靈法師','布奶鳥獸','炸彈客','紅色玩家','地府酋長','救醫馬','水狐','米鈴','學霸(轉學生)','天神宙斯','維京海盜船長','武器精靈','神槍手','火柴人']
      },
    ];

    // 填角色 select(用 optgroup 分組)
    const _populateHeroSelect = function(){
      const sel = document.getElementById('_admin-comp-hero-select');
      if(!sel) return;
      sel.innerHTML = '<option value="">-- 選擇英雄 --</option>';
      const _avail = new Set(_getCompensatableHeroes());
      const _used = new Set();
      // 依分組逐一加 optgroup
      _HERO_GROUPS.forEach(grp => {
        const _members = grp.heroes.filter(n => _avail.has(n));
        if(_members.length === 0) return;
        const og = document.createElement('optgroup');
        og.label = grp.label;
        _members.forEach(n => {
          const opt = document.createElement('option');
          opt.value = n;
          opt.textContent = n;
          og.appendChild(opt);
          _used.add(n);
        });
        sel.appendChild(og);
      });
      // 未列入任何組的(未來新增英雄)歸到「其他」末段
      const _orphans = [..._avail].filter(n => !_used.has(n)).sort();
      if(_orphans.length > 0){
        const og = document.createElement('optgroup');
        og.label = '💼 其他';
        _orphans.forEach(n => {
          const opt = document.createElement('option');
          opt.value = n;
          opt.textContent = n;
          og.appendChild(opt);
        });
        sel.appendChild(og);
      }
    };
    _populateHeroSelect();

    // 補償清單(暫存,執行時才寫雲端)
    // 結構:{ [heroName]: level }
    let _compHeroes = {};
    // 查到的玩家資料快取
    let _compTarget = null; // { uid, email, data }

    // 重渲補償英雄清單
    const _renderHeroList = function(){
      const wrap = document.getElementById('_admin-comp-hero-list');
      if(!wrap) return;
      const names = Object.keys(_compHeroes);
      if(names.length === 0){
        wrap.innerHTML = '<span style="color:#666;font-style:italic;">尚未加入任何角色</span>';
        return;
      }
      wrap.innerHTML = names.map(name => {
        const lv = _compHeroes[name];
        return '<div style="display:inline-flex;align-items:center;gap:6px;background:rgba(100,200,150,0.18);'
          + 'border:1px solid rgba(120,220,170,0.45);border-radius:6px;padding:4px 8px;margin:2px;font-size:12px;">'
          + '<span style="color:#aaffcc;font-weight:700;">' + name + '</span>'
          + '<span style="color:#ffee88;">Lv' + lv + '</span>'
          + '<button data-rm="' + name + '" style="margin-left:4px;background:none;border:none;color:#ff8888;cursor:pointer;font-size:14px;padding:0 2px;line-height:1;">×</button>'
          + '</div>';
      }).join('');
      // 綁定移除按鈕
      wrap.querySelectorAll('button[data-rm]').forEach(b => {
        b.onclick = function(){
          const n = this.getAttribute('data-rm');
          delete _compHeroes[n];
          _renderHeroList();
        };
      });
    };

    // 加入英雄到補償清單
    const _addBtn = document.getElementById('_admin-comp-hero-add');
    if(_addBtn) _addBtn.onclick = function(){
      const sel = document.getElementById('_admin-comp-hero-select');
      const lvInput = document.getElementById('_admin-comp-hero-lv');
      const name = (sel.value || '').trim();
      const lv = Math.max(1, Math.min(50, parseInt(lvInput.value, 10) || 1));
      if(!name){
        alert('請先選擇要補的英雄');
        return;
      }
      _compHeroes[name] = lv;
      _renderHeroList();
      // 重置 select 方便連續加
      sel.value = '';
    };

    // 查找學生(email 或 uid 擇一)
    const _findBtn = document.getElementById('_admin-comp-find');
    if(_findBtn) _findBtn.onclick = async function(){
      const emailInput = document.getElementById('_admin-comp-email');
      const uidInput = document.getElementById('_admin-comp-uid');
      const info = document.getElementById('_admin-comp-info');
      const form = document.getElementById('_admin-comp-form');
      const res = document.getElementById('_admin-comp-result');
      res.textContent = '';
      form.style.display = 'none';
      info.style.display = 'block';
      info.innerHTML = '<span style="color:#aaa;">查詢中...</span>';
      _compTarget = null;

      const email = (emailInput.value || '').trim().toLowerCase();
      const uid   = (uidInput.value || '').trim();
      if(!email && !uid){
        info.innerHTML = '<span style="color:#ff6666;">❌ 請輸入 email 或 uid 至少一個</span>';
        return;
      }

      try {
        let _targetUid = uid;
        let _foundData = null;

        // 路徑 A:有 uid 直接走 diagnose
        if(uid){
          if(!window._fbDiagnosePlayer){
            info.innerHTML = '<span style="color:#ff6666;">❌ Firebase 尚未就緒</span>';
            return;
          }
          const d = await window._fbDiagnosePlayer(uid);
          if(!d.exists){
            info.innerHTML = '<span style="color:#ffaa66;">⚠ 此 uid 在 Firestore 無紀錄。可能尚未登入過。</span>';
            return;
          }
          _foundData = d.rawData || {};
          _targetUid = uid;
        }
        // 路徑 B:有 email → 用 _fbAdminFindPlayerByEmail
        else if(email){
          if(!window._fbAdminFindPlayerByEmail){
            info.innerHTML = '<span style="color:#ff6666;">❌ Firebase API 未載入,請改用 uid 查詢</span>';
            return;
          }
          let r;
          try {
            r = await window._fbAdminFindPlayerByEmail(email);
          } catch(eFind){
            if(eFind._isPermissionDenied){
              info.innerHTML = '<div style="color:#ff8866;line-height:1.6;">'
                + '⚠ <b>Firestore 規則拒絕 email 查詢</b>(管理員身分也無 list 權限)<br>'
                + '解決方法:<br>'
                + '① 請該學生用此 email 登入一次後再試<br>'
                + '② 或從 Firebase Console 找到該學生的 uid,改用「直接輸入 uid」欄位<br>'
                + '<span style="color:#888;font-size:11px;">技術原因:' + (eFind.message || eFind.code) + '</span>'
                + '</div>';
              return;
            }
            throw eFind;
          }
          if(!r.found){
            info.innerHTML = '<span style="color:#ffaa66;">⚠ 找不到 email 為 <code>' + email + '</code> 的學生。<br>'
              + '可能原因:① 學生從未登入過 ② email 拼錯 ③ 該學生用了不同 Google 帳號</span>';
            return;
          }
          _foundData = r.data;
          _targetUid = r.uid;
        }

        _compTarget = { uid: _targetUid, email: _foundData.email || email, data: _foundData };

        // 顯示診斷資訊
        const savedStr = _foundData.savedAt ? new Date(_foundData.savedAt).toLocaleString('zh-TW') : '(無)';
        const _heroLvCount = Object.keys(_foundData.heroLevels || {}).length;
        const _bpCount = Object.keys(_foundData.playerBackpack || {}).length;
        const _unlockedCount = (_foundData.unlockedHeroes || []).length;
        const _coins = _foundData.knowledgeCoins || 0;
        const _compCount = _foundData._compensationCount || 0;
        const _lastComp = _foundData._lastCompensatedAt
          ? new Date(_foundData._lastCompensatedAt).toLocaleString('zh-TW')
          : null;

        // 補償次數警示色
        const _compWarnColor = _compCount >= 3 ? '#ff6666' : (_compCount >= 1 ? '#ffaa66' : '#88ff88');
        const _compWarnText = _compCount >= 3 ? '⚠ 已補償多次,請審慎評估' :
                              _compCount >= 1 ? '此玩家曾被補償過' :
                              '此玩家從未被補償';

        info.innerHTML = ''
          + '<div style="color:#88ff88;font-weight:700;margin-bottom:6px;">✅ 已找到玩家</div>'
          + '<div><b>uid:</b> <code style="color:#88ccff;">' + _targetUid + '</code></div>'
          + '<div><b>email:</b> ' + (_foundData.email || '(無)') + '</div>'
          + '<div><b>學生:</b> ' + _adminLabel(_foundData.email, _foundData.displayName) + '</div>'
          + '<div><b>最後存檔:</b> ' + savedStr + '</div>'
          + '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:6px 0;">'
          + '<div>💰 現有知識幣: <b style="color:#ffee88;">' + _coins + '</b></div>'
          + '<div>🦸 已記錄等級的英雄: <b>' + _heroLvCount + '</b> 位</div>'
          + '<div>🎒 背包物品種類: <b>' + _bpCount + '</b> 種</div>'
          + '<div>⚔ 已解鎖英雄: <b>' + _unlockedCount + '</b> 位</div>'
          + '<hr style="border:none;border-top:1px solid rgba(255,200,100,0.25);margin:6px 0;">'
          + '<div style="color:' + _compWarnColor + ';font-weight:700;">'
            + '🎁 補償紀錄:已補償 <b>' + _compCount + '</b> 次 — ' + _compWarnText
          + '</div>'
          + (_lastComp ? '<div style="color:#aaa;font-size:12px;">最近一次:' + _lastComp + '</div>' : '');

        try {
          const _esc = function(s){
            return String(s == null ? '' : s)
              .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
              .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
          };

          // (A) 代表英雄
          const _rep = _foundData.representativeHero;
          let _repHtml;
          if(_rep && _rep.name){
            _repHtml = '<div style="margin:4px 0 8px;">'
              + '<b>🏆 代表英雄:</b> ' + _esc(_rep.name)
              + (_rep.level ? ' <span style="color:#ffcc88;">Lv' + _rep.level + '</span>' : '')
              + (_rep.portrait ? ' <span style="color:#888;font-size:11px;">(肖像:' + _esc(_rep.portrait) + ')</span>' : '')
              + '</div>';
          } else {
            _repHtml = '<div style="margin:4px 0 8px;color:#888;"><b>🏆 代表英雄:</b> (未設定)</div>';
          }

          // (B) 已解鎖角色清單(unlockedHeroes ∪ heroLevels 的所有 key)
          const _hLv = (_foundData.heroLevels && typeof _foundData.heroLevels === 'object') ? _foundData.heroLevels : {};
          const _unlSet = new Set([
            ...((Array.isArray(_foundData.unlockedHeroes) ? _foundData.unlockedHeroes : [])),
            ...Object.keys(_hLv)
          ]);
          const _heroes = Array.from(_unlSet).map(name => ({
            name: name,
            lv: parseInt(_hLv[name], 10) || 1
          })).sort((a,b) => b.lv - a.lv || a.name.localeCompare(b.name, 'zh-Hant'));
          let _heroHtml;
          if(_heroes.length === 0){
            _heroHtml = '<div style="color:#888;margin:6px 0;">(無)</div>';
          } else {
            _heroHtml = '<div style="display:flex;flex-wrap:wrap;gap:4px 8px;margin:6px 0;max-height:200px;overflow-y:auto;'
              + 'padding:6px;background:rgba(0,0,0,0.3);border-radius:4px;">'
              + _heroes.map(h => '<span style="display:inline-block;padding:2px 8px;background:rgba(120,80,40,0.5);'
                  + 'border:1px solid rgba(255,200,100,0.3);border-radius:10px;font-size:12px;">'
                  + _esc(h.name) + ' <b style="color:#ffcc88;">Lv' + h.lv + '</b></span>').join('')
              + '</div>'
              + '<div style="color:#aaa;font-size:11px;">共 <b>' + _heroes.length + '</b> 位</div>';
          }

          // (C) 至寶清單(從 taiwanTreasureData 讀)
          const _ttd = (_foundData.taiwanTreasureData && typeof _foundData.taiwanTreasureData === 'object') ? _foundData.taiwanTreasureData : {};
          const _treasIds = Object.keys(_ttd);
          let _treasHtml;
          if(_treasIds.length === 0){
            _treasHtml = '<div style="color:#888;margin:6px 0;">(無)</div>';
          } else {
            _treasHtml = '<div style="display:flex;flex-direction:column;gap:3px;margin:6px 0;max-height:180px;overflow-y:auto;'
              + 'padding:6px;background:rgba(0,0,0,0.3);border-radius:4px;">'
              + _treasIds.map(id => {
                  const rec = _ttd[id] || {};
                  let _name = id;
                  let _icon = '💎';
                  try {
                    if(typeof TAIWAN_TREASURES !== 'undefined' && TAIWAN_TREASURES[id]){
                      _name = TAIWAN_TREASURES[id].name || id;
                      _icon = TAIWAN_TREASURES[id].icon || '💎';
                    }
                  } catch(_){}
                  const _equip = rec.equippedTo
                    ? '<span style="color:#88ccff;">裝於 ' + _esc(rec.equippedTo) + '</span>'
                    : '<span style="color:#888;">未裝備</span>';
                  return '<div style="font-size:12px;">' + _icon + ' ' + _esc(_name)
                    + ' <b style="color:#ffcc88;">Lv' + (rec.lv || 1) + '</b>'
                    + ' <span style="color:#888;">·</span> ' + _equip
                    + '</div>';
                }).join('')
              + '</div>'
              + '<div style="color:#aaa;font-size:11px;">共 <b>' + _treasIds.length + '</b> 件</div>';
          }

          // (D) 背包清單(從 playerBackpack 讀)
          const _bp = (_foundData.playerBackpack && typeof _foundData.playerBackpack === 'object') ? _foundData.playerBackpack : {};
          const _bpEntries = Object.keys(_bp)
            .filter(k => k && (_bp[k]|0) > 0)
            .map(k => ({ id:k, qty: _bp[k]|0 }))
            .sort((a,b) => b.qty - a.qty || a.id.localeCompare(b.id));
          let _bpHtml;
          if(_bpEntries.length === 0){
            _bpHtml = '<div style="color:#888;margin:6px 0;">(無)</div>';
          } else {
            _bpHtml = '<div style="display:flex;flex-wrap:wrap;gap:4px 6px;margin:6px 0;max-height:180px;overflow-y:auto;'
              + 'padding:6px;background:rgba(0,0,0,0.3);border-radius:4px;">'
              + _bpEntries.map(e => {
                  let _name = e.id;
                  let _icon = '📦';
                  try {
                    if(typeof BACKPACK_ITEM_DEF !== 'undefined' && BACKPACK_ITEM_DEF[e.id]){
                      _name = BACKPACK_ITEM_DEF[e.id].name || e.id;
                      _icon = BACKPACK_ITEM_DEF[e.id].icon || '📦';
                    }
                  } catch(_){}
                  return '<span style="display:inline-block;padding:2px 8px;background:rgba(40,60,40,0.5);'
                    + 'border:1px solid rgba(120,200,120,0.3);border-radius:10px;font-size:12px;">'
                    + _icon + ' ' + _esc(_name) + ' <b style="color:#aaffaa;">×' + e.qty + '</b></span>';
                }).join('')
              + '</div>'
              + '<div style="color:#aaa;font-size:11px;">共 <b>' + _bpEntries.length + '</b> 種</div>';
          }

          // (E) 最近補償歷史(取最後 3 筆,倒序)
          const _hist = Array.isArray(_foundData._compensationHistory) ? _foundData._compensationHistory : [];
          let _histHtml;
          if(_hist.length === 0){
            _histHtml = '<div style="color:#888;margin:6px 0;">(無補償紀錄)</div>';
          } else {
            const _last3 = _hist.slice(-3).reverse();
            _histHtml = '<div style="display:flex;flex-direction:column;gap:6px;margin:6px 0;">'
              + _last3.map((h, idx) => {
                  const _t = h.at ? new Date(h.at).toLocaleString('zh-TW') : '(時間不詳)';
                  const _by = h.by || '(不詳)';
                  const _reason = h.reason || '(無)';
                  const _summary = h.summary || '';
                  // ★ v1.0.20260513.6450 — 把 diff 攤成人話摘要(舊資料沒 diff 就略過)
                  let _diffHtml = '';
                  if(h.diff && typeof h.diff === 'object'){
                    const _hd = h.diff;
                    const _parts = [];
                    const _added = Array.isArray(_hd.unlockedHeroesAdded) ? _hd.unlockedHeroesAdded.length : 0;
                    const _raised = (_hd.heroLevelsRaised && typeof _hd.heroLevelsRaised === 'object')
                                      ? Object.keys(_hd.heroLevelsRaised).length : 0;
                    if(_added > 0)  _parts.push('🆕 新解鎖 <b>' + _added + '</b> 位');
                    if(_raised > 0) _parts.push('⬆ 升級 <b>' + _raised + '</b> 位');
                    if(typeof _hd.coinsDelta === 'number' && _hd.coinsDelta > 0){
                      _parts.push('💰 知識幣 <b>+' + _hd.coinsDelta + '</b>');
                    }
                    const _bpAdded = (_hd.backpackAdded && typeof _hd.backpackAdded === 'object')
                                       ? Object.keys(_hd.backpackAdded).length : 0;
                    if(_bpAdded > 0) _parts.push('🎒 背包 <b>' + _bpAdded + '</b> 種');
                    if(_parts.length > 0){
                      _diffHtml = '<div style="color:#88ff88;margin-top:3px;font-size:11px;">'
                        + '實際生效:' + _parts.join(' · ')
                        + '</div>';
                      // 列出實際新解鎖/升級的角色名(讓老師可看到具體是誰)
                      const _names = [];
                      if(Array.isArray(_hd.unlockedHeroesAdded)){
                        _hd.unlockedHeroesAdded.forEach(n => _names.push('🆕 ' + n));
                      }
                      if(_hd.heroLevelsRaised && typeof _hd.heroLevelsRaised === 'object'){
                        Object.keys(_hd.heroLevelsRaised).forEach(n => {
                          // 已在「新解鎖」清單的就不重複顯示
                          if(!_names.includes('🆕 ' + n)){
                            const r = _hd.heroLevelsRaised[n] || {};
                            _names.push('⬆ ' + n + ' Lv' + (r.from || 0) + '→' + (r.to || 0));
                          } else {
                            // 同時新解鎖 + 升級:把等級資訊塞進原 tag
                            const _idx = _names.indexOf('🆕 ' + n);
                            const r = _hd.heroLevelsRaised[n] || {};
                            _names[_idx] = '🆕 ' + n + ' Lv' + (r.to || 0);
                          }
                        });
                      }
                      if(_names.length > 0){
                        _diffHtml += '<div style="color:#aaffaa;font-size:11px;margin-top:2px;">'
                          + _names.map(s => _esc(s)).join(' · ')
                          + '</div>';
                      }
                    } else {
                      _diffHtml = '<div style="color:#ffaa66;margin-top:3px;font-size:11px;">'
                        + '⚠ 實際生效:無(所有項目都被「保留高等級」規則擋下)'
                        + '</div>';
                    }
                  }
                  return '<div style="padding:6px 8px;background:rgba(0,0,0,0.3);border-left:3px solid #ffaa66;border-radius:0 4px 4px 0;font-size:12px;">'
                    + '<div style="color:#ffcc88;font-weight:700;">#' + (_hist.length - idx) + ' · ' + _esc(_t) + '</div>'
                    + '<div style="color:#aaa;">老師:' + _esc(_by) + '</div>'
                    + '<div>原因:' + _esc(_reason) + '</div>'
                    + (_summary ? '<div style="color:#bbb;white-space:pre-wrap;margin-top:2px;font-size:11px;">摘要:' + _esc(_summary) + '</div>' : '')
                    + _diffHtml
                    + '</div>';
                }).join('')
              + '</div>'
              + (_hist.length > 3 ? '<div style="color:#888;font-size:11px;">(只顯示最近 3 筆,總共 ' + _hist.length + ' 筆)</div>' : '');
          }

          // ════════════════════════════════════════════════════════════
          // ★ v3.5.30(2026-05-22) — 補上完整資料區塊(救援帳號用)
          //   原本只看到 A~E,新增 F~L:技能/素質/爆發/至寶投資/獎章/寵物/原始 JSON
          // ════════════════════════════════════════════════════════════

          // (F) 技能等級(每個英雄的 s1/s2 等級加成)
          const _skLv = (_foundData.heroSkillLevels && typeof _foundData.heroSkillLevels === 'object')
            ? _foundData.heroSkillLevels : {};
          const _skEntries = Object.keys(_skLv)
            .filter(n => { const r = _skLv[n] || {}; return (r.s1 || 0) > 0 || (r.s2 || 0) > 0; })
            .sort();
          let _skHtml;
          if(_skEntries.length === 0){
            _skHtml = '<div style="color:#888;margin:6px 0;">(無)</div>';
          } else {
            _skHtml = '<div style="display:flex;flex-wrap:wrap;gap:4px;margin:6px 0;max-height:160px;overflow-y:auto;'
              + 'padding:6px;background:rgba(0,0,0,0.3);border-radius:4px;">'
              + _skEntries.map(n => {
                  const r = _skLv[n] || {};
                  return '<span style="display:inline-block;padding:2px 8px;background:rgba(80,50,120,0.5);'
                    + 'border:1px solid rgba(180,140,255,0.4);border-radius:10px;font-size:12px;">'
                    + _esc(n) + ' <b style="color:#ccaaff;">'
                    + 's1+' + (r.s1 || 0) + ' s2+' + (r.s2 || 0) + '</b></span>';
                }).join('')
              + '</div>'
              + '<div style="color:#aaa;font-size:11px;">共 <b>' + _skEntries.length + '</b> 位英雄升過技能</div>';
          }

          // (G) 素質投資(每個英雄的 hp/atk/sp/spd 加成點)
          const _siInv = (_foundData.heroStatInvested && typeof _foundData.heroStatInvested === 'object')
            ? _foundData.heroStatInvested : {};
          const _siEntries = Object.keys(_siInv)
            .filter(n => {
              const r = _siInv[n] || {};
              return (r.hp||0) + (r.atk||0) + (r.sp||0) + (r.spd||0) > 0;
            })
            .sort();
          let _siHtml;
          if(_siEntries.length === 0){
            _siHtml = '<div style="color:#888;margin:6px 0;">(無)</div>';
          } else {
            _siHtml = '<div style="display:flex;flex-direction:column;gap:3px;margin:6px 0;max-height:160px;overflow-y:auto;'
              + 'padding:6px;background:rgba(0,0,0,0.3);border-radius:4px;">'
              + _siEntries.map(n => {
                  const r = _siInv[n] || {};
                  const _tot = (r.hp||0) + (r.atk||0) + (r.sp||0) + (r.spd||0);
                  return '<div style="font-size:12px;color:#ddd;">'
                    + '<b style="color:#ffcc88;">' + _esc(n) + '</b> '
                    + '<span style="color:#888;">(總 ' + _tot + ' 點)</span> '
                    + '<span style="color:#ff8888;">❤️+' + (r.hp || 0) + '</span> '
                    + '<span style="color:#ffaa88;">⚔+' + (r.atk || 0) + '</span> '
                    + '<span style="color:#88ccff;">✨+' + (r.sp || 0) + '</span> '
                    + '<span style="color:#aaffaa;">💨+' + (r.spd || 0) + '</span>'
                    + '</div>';
                }).join('')
              + '</div>'
              + '<div style="color:#aaa;font-size:11px;">共 <b>' + _siEntries.length + '</b> 位英雄投資過素質</div>';
          }

          // (H) 極限爆發等級
          const _brLv = (_foundData.heroBurstLevels && typeof _foundData.heroBurstLevels === 'object')
            ? _foundData.heroBurstLevels : {};
          const _brEntries = Object.keys(_brLv).filter(n => (_brLv[n] || 0) > 0).sort();
          let _brHtml;
          if(_brEntries.length === 0){
            _brHtml = '<div style="color:#888;margin:6px 0;">(無)</div>';
          } else {
            _brHtml = '<div style="display:flex;flex-wrap:wrap;gap:4px;margin:6px 0;max-height:140px;overflow-y:auto;'
              + 'padding:6px;background:rgba(0,0,0,0.3);border-radius:4px;">'
              + _brEntries.map(n => {
                  const _lv = _brLv[n] || 0;
                  return '<span style="display:inline-block;padding:2px 8px;background:rgba(150,80,40,0.5);'
                    + 'border:1px solid rgba(255,180,100,0.45);border-radius:10px;font-size:12px;">'
                    + '🔥 ' + _esc(n) + ' <b style="color:#ffcc88;">Lv' + _lv + '</b></span>';
                }).join('')
              + '</div>'
              + '<div style="color:#aaa;font-size:11px;">共 <b>' + _brEntries.length + '</b> 位英雄升過爆發</div>';
          }

          // (I) 至寶投資能力(每件至寶各別投資了多少 hp/atk/sp/spd)
          //     從 taiwanTreasureData.{id}.invested 讀(若有)
          const _ttiEntries = [];
          Object.keys(_ttd).forEach(id => {
            const rec = _ttd[id] || {};
            const inv = rec.invested || rec.investedStats || null;
            if(inv && ((inv.hp||0) + (inv.atk||0) + (inv.sp||0) + (inv.spd||0)) > 0){
              let _name = id;
              let _icon = '💎';
              try {
                if(typeof TAIWAN_TREASURES !== 'undefined' && TAIWAN_TREASURES[id]){
                  _name = TAIWAN_TREASURES[id].name || id;
                  _icon = TAIWAN_TREASURES[id].icon || '💎';
                }
              } catch(_){}
              _ttiEntries.push({ id, name:_name, icon:_icon, lv:(rec.lv||1), inv });
            }
          });
          let _ttiHtml;
          if(_ttiEntries.length === 0){
            _ttiHtml = '<div style="color:#888;margin:6px 0;">(無至寶有投資紀錄)</div>';
          } else {
            _ttiHtml = '<div style="display:flex;flex-direction:column;gap:3px;margin:6px 0;max-height:160px;overflow-y:auto;'
              + 'padding:6px;background:rgba(0,0,0,0.3);border-radius:4px;">'
              + _ttiEntries.map(t => {
                  const i = t.inv;
                  const _tot = (i.hp||0)+(i.atk||0)+(i.sp||0)+(i.spd||0);
                  return '<div style="font-size:12px;color:#ddd;">'
                    + t.icon + ' <b style="color:#ffcc88;">' + _esc(t.name) + ' Lv' + t.lv + '</b> '
                    + '<span style="color:#888;">(總投 ' + _tot + ' 點)</span> '
                    + '<span style="color:#ff8888;">❤️+' + (i.hp || 0) + '</span> '
                    + '<span style="color:#ffaa88;">⚔+' + (i.atk || 0) + '</span> '
                    + '<span style="color:#88ccff;">✨+' + (i.sp || 0) + '</span> '
                    + '<span style="color:#aaffaa;">💨+' + (i.spd || 0) + '</span>'
                    + '</div>';
                }).join('')
              + '</div>';
          }

          // (J) 獎章資料
          const _medals = (_foundData.playerMedals && typeof _foundData.playerMedals === 'object')
            ? _foundData.playerMedals : {};
          const _medalCount = Object.keys(_medals).length;
          const _medalStats = _foundData.medalStats || {};
          const _jpKills = (_medalStats.jpBossKills && typeof _medalStats.jpBossKills === 'object')
            ? _medalStats.jpBossKills : {};
          const _maokongClears = _medalStats.maokongClears || 0;
          let _medalHtml = '<div style="font-size:12px;color:#ddd;margin:6px 0;line-height:1.8;">'
            + '🏅 已解鎖獎章數:<b style="color:#ffcc88;">' + _medalCount + '</b><br>'
            + '🐉 日本 BOSS 擊敗:<span style="color:#ddaaff;">'
              + '大天狗 ' + (_jpKills.tengu || 0) + ' · '
              + '酒吞童子 ' + (_jpKills.shuten || 0) + ' · '
              + '玉藻前 ' + (_jpKills.tamamo || 0) + ' · '
              + '八岐大蛇 ' + (_jpKills.yamata || 0)
            + '</span><br>'
            + '🚲 木柵 S 級通關:<b style="color:#aaffcc;">' + _maokongClears + '</b> 次'
            + '</div>';
          if(_medalCount > 0){
            // 列出獎章 ID(只列名字、避免太大)
            const _mList = Object.keys(_medals).sort();
            _medalHtml += '<div style="display:flex;flex-wrap:wrap;gap:3px;margin:4px 0;max-height:120px;overflow-y:auto;'
              + 'padding:6px;background:rgba(0,0,0,0.3);border-radius:4px;">'
              + _mList.map(id => '<span style="display:inline-block;padding:1px 6px;background:rgba(180,140,40,0.4);'
                + 'border:1px solid rgba(255,200,100,0.3);border-radius:8px;font-size:11px;color:#ffd699;">'
                + _esc(id) + '</span>').join('')
              + '</div>';
          }

          // (K) 寵物 + 已解鎖肖像
          const _pets = Array.isArray(_foundData.petsEverCollected) ? _foundData.petsEverCollected : [];
          const _portraits = (_foundData.heroPortraitUnlocked && typeof _foundData.heroPortraitUnlocked === 'object')
            ? _foundData.heroPortraitUnlocked : {};
          const _portraitCount = Object.keys(_portraits).reduce((s,k) => {
            const v = _portraits[k];
            return s + (Array.isArray(v) ? v.length : (v ? 1 : 0));
          }, 0);
          let _collectionHtml = '<div style="font-size:12px;color:#ddd;margin:6px 0;line-height:1.8;">'
            + '🐾 已收集寵物:<b style="color:#aaffcc;">' + _pets.length + '</b> 隻'
            + (_pets.length > 0 ? '<br><span style="color:#aaa;font-size:11px;">'
                + _pets.slice(0, 30).map(p => _esc(p)).join('、')
                + (_pets.length > 30 ? ' ...(共' + _pets.length + '隻)' : '')
              + '</span>' : '')
            + '<br>🎨 已解鎖肖像:<b style="color:#ffaaee;">' + _portraitCount + '</b> 個'
            + '</div>';

          // (L) 完整原始 JSON 下載 + 摘要
          const _rawJson = JSON.stringify(_foundData, null, 2);
          const _jsonSizeKb = (_rawJson.length / 1024).toFixed(1);
          const _jsonHtml = '<div style="font-size:12px;color:#ddd;margin:6px 0;line-height:1.7;">'
            + '完整存檔大小:<b style="color:#ffcc88;">' + _jsonSizeKb + ' KB</b>'
            + '<button id="_admin-comp-dl-raw" style="margin-left:10px;padding:4px 12px;font-size:12px;font-weight:700;'
              + 'background:rgba(100,150,200,0.3);border:1.5px solid #66aaee;color:#aadfff;'
              + 'border-radius:5px;cursor:pointer;font-family:inherit;">💾 下載完整 JSON</button>'
            + '<button id="_admin-comp-copy-raw" style="margin-left:6px;padding:4px 12px;font-size:12px;font-weight:700;'
              + 'background:rgba(150,100,200,0.3);border:1.5px solid #cc99ee;color:#e0c0ff;'
              + 'border-radius:5px;cursor:pointer;font-family:inherit;">📋 複製給 Claude</button>'
            + '</div>'
            + '<div style="color:#aaa;font-size:11px;margin-top:4px;">'
            + '💡 完整 JSON 包含所有欄位(技能/素質/至寶投資/獎章/寵物/肖像...),若上面顯示不夠細,可下載查看或複製給 Claude 分析'
            + '</div>';

          info.innerHTML += ''
            + '<hr style="border:none;border-top:1px solid rgba(255,200,100,0.25);margin:8px 0;">'
            + '<details style="margin-top:4px;">'
            + '<summary style="cursor:pointer;color:#ffcc88;font-weight:700;padding:6px;background:rgba(80,50,30,0.5);'
            + 'border-radius:4px;user-select:none;">📋 展開詳細持有清單(角色 / 至寶 / 背包 / 補償歷史)</summary>'
            + '<div style="padding:8px 4px 4px;">'
              + _repHtml
              + '<div style="color:#ffcc88;font-weight:700;margin-top:10px;">🦸 已解鎖角色:</div>'
              + _heroHtml
              + '<div style="color:#ffcc88;font-weight:700;margin-top:10px;">💎 已獲得至寶:</div>'
              + _treasHtml
              + '<div style="color:#ffcc88;font-weight:700;margin-top:10px;">🎒 背包物品:</div>'
              + _bpHtml
              + '<div style="color:#ffcc88;font-weight:700;margin-top:10px;">📜 最近補償歷史:</div>'
              + _histHtml
            + '</div>'
            + '</details>'
            // ★ v3.5.30(2026-05-22) — 第二個摺疊區塊:完整存檔資料
            //   救援/補償重要參考,包含 F~L 全部新增資料
            + '<details style="margin-top:6px;">'
            + '<summary style="cursor:pointer;color:#ccaaff;font-weight:700;padding:6px;background:rgba(60,40,90,0.5);'
            + 'border-radius:4px;user-select:none;">'
            + '🔬 展開完整存檔資料(技能 / 素質 / 爆發 / 至寶投資 / 獎章 / 寵物 / 原始 JSON)</summary>'
            + '<div style="padding:8px 4px 4px;">'
              + '<div style="color:#ccaaff;font-weight:700;margin-top:4px;">⚡ 技能等級:</div>'
              + _skHtml
              + '<div style="color:#ccaaff;font-weight:700;margin-top:10px;">📊 素質投資:</div>'
              + _siHtml
              + '<div style="color:#ccaaff;font-weight:700;margin-top:10px;">🔥 極限爆發等級:</div>'
              + _brHtml
              + '<div style="color:#ccaaff;font-weight:700;margin-top:10px;">💎 至寶投資能力:</div>'
              + _ttiHtml
              + '<div style="color:#ccaaff;font-weight:700;margin-top:10px;">🏅 獎章與里程碑:</div>'
              + _medalHtml
              + '<div style="color:#ccaaff;font-weight:700;margin-top:10px;">🐾 寵物與肖像:</div>'
              + _collectionHtml
              + '<hr style="border:none;border-top:1px dashed rgba(200,150,255,0.3);margin:10px 0;">'
              + '<div style="color:#ccaaff;font-weight:700;">📦 原始存檔資料:</div>'
              + _jsonHtml
            + '</div>'
            + '</details>';

          // ★ v3.5.30 — 綁定下載 JSON / 複製給 Claude 按鈕
          //   使用 setTimeout 確保 innerHTML 已渲染、按鈕已存在於 DOM
          setTimeout(() => {
            const _dlBtn = document.getElementById('_admin-comp-dl-raw');
            if(_dlBtn){
              _dlBtn.onclick = () => {
                try{
                  const _blob = new Blob([_rawJson], { type: 'application/json;charset=utf-8' });
                  const _url = URL.createObjectURL(_blob);
                  const _a = document.createElement('a');
                  _a.href = _url;
                  const _safeEmail = (_foundData.email || _targetUid).replace(/[^a-zA-Z0-9.@_-]/g, '_');
                  const _ts = new Date().toISOString().slice(0, 10);
                  _a.download = 'lxps_save_' + _safeEmail + '_' + _ts + '.json';
                  document.body.appendChild(_a);
                  _a.click();
                  document.body.removeChild(_a);
                  setTimeout(() => URL.revokeObjectURL(_url), 1000);
                  _dlBtn.textContent = '✅ 已下載';
                  setTimeout(() => { _dlBtn.innerHTML = '💾 下載完整 JSON'; }, 2000);
                }catch(eDL){
                  console.error('[admin] 下載 JSON 失敗', eDL);
                  alert('下載失敗:' + (eDL.message || eDL));
                }
              };
            }
            const _cpBtn = document.getElementById('_admin-comp-copy-raw');
            if(_cpBtn){
              _cpBtn.onclick = async () => {
                try{
                  // 給 Claude 用的格式:加 markdown 標頭 + 完整 JSON
                  const _claudeText = '# 學生雲端資料完整快照\n\n'
                    + '**Email:** ' + (_foundData.email || '(無)') + '\n'
                    + '**UID:** ' + _targetUid + '\n'
                    + '**最後存檔:** ' + (_foundData.savedAt ? new Date(_foundData.savedAt).toLocaleString('zh-TW') : '(無)') + '\n'
                    + '**資料大小:** ' + _jsonSizeKb + ' KB\n\n'
                    + '## 完整資料 (JSON)\n\n```json\n' + _rawJson + '\n```\n';
                  if(navigator.clipboard && navigator.clipboard.writeText){
                    await navigator.clipboard.writeText(_claudeText);
                  } else {
                    // 備援:textarea + execCommand
                    const _ta = document.createElement('textarea');
                    _ta.value = _claudeText;
                    _ta.style.position = 'fixed'; _ta.style.opacity = '0';
                    document.body.appendChild(_ta);
                    _ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(_ta);
                  }
                  _cpBtn.textContent = '✅ 已複製';
                  setTimeout(() => { _cpBtn.innerHTML = '📋 複製給 Claude'; }, 2000);
                }catch(eCP){
                  console.error('[admin] 複製 JSON 失敗', eCP);
                  alert('複製失敗:' + (eCP.message || eCP));
                }
              };
            }
          }, 50);
        } catch(eDetail){
          console.warn('[admin compensate find] 詳細清單組裝失敗(不影響主功能)', eDetail);
        }

        // 清空之前的補償清單 + 展開表單
        _compHeroes = {};
        _renderHeroList();
        form.style.display = 'block';
      } catch(e){
        console.error('[admin compensate find]', e);
        info.innerHTML = '<span style="color:#ff6666;">❌ 查詢失敗:' + (e.code || e.message || e) + '</span>';
      }
    };

    // 執行補償
    const _applyBtn = document.getElementById('_admin-comp-apply');
    if(_applyBtn) _applyBtn.onclick = async function(){
      const res = document.getElementById('_admin-comp-result');
      if(!_compTarget || !_compTarget.uid){
        res.style.color = '#ff6666';
        res.textContent = '❌ 請先查找學生';
        return;
      }
      const reason = (document.getElementById('_admin-comp-reason').value || '').trim();
      if(!reason){
        res.style.color = '#ff6666';
        res.textContent = '❌ 請填寫補償原因(稽核需要)';
        return;
      }

      const _readNum = (id, max) => {
        const v = parseInt(document.getElementById(id).value, 10) || 0;
        return Math.max(0, max ? Math.min(max, v) : v);
      };
      const coins      = _readNum('_admin-comp-coins');
      const expBook    = _readNum('_admin-comp-exp-book', 99);
      const skillBook  = _readNum('_admin-comp-skill-book', 99);
      const statBook   = _readNum('_admin-comp-stat-book', 99);
      const burstFruit = _readNum('_admin-comp-burst-fruit', 99);
      const burstReset = _readNum('_admin-comp-burst-reset', 99);

      const heroNames = Object.keys(_compHeroes);
      if(heroNames.length === 0 && coins === 0 && expBook === 0 && skillBook === 0
         && statBook === 0 && burstFruit === 0 && burstReset === 0){
        res.style.color = '#ff6666';
        res.textContent = '❌ 沒有指定任何補償內容';
        return;
      }

      // 組 heroLevels
      const _heroLv = {};
      heroNames.forEach(n => { _heroLv[n] = _compHeroes[n]; });

      // 組背包(加總式合併由後端處理,這裡只傳要加的數量)
      const _bp = {};
      if(expBook    > 0) _bp.hero_exp_book       = expBook;
      if(skillBook  > 0) _bp.skill_upgrade_book  = skillBook;
      if(statBook   > 0) _bp.stat_reset_book     = statBook;
      if(burstFruit > 0) _bp.burst_upgrade_fruit = burstFruit;
      if(burstReset > 0) _bp.burst_reset_potion  = burstReset;

      // 組摘要
      const _summary = '英雄 ' + heroNames.length + ' 位'
        + (coins      ? ', 知識幣 +' + coins      : '')
        + (expBook    ? ', 經驗書 +' + expBook    : '')
        + (skillBook  ? ', 技能書 +' + skillBook  : '')
        + (statBook   ? ', 素質書 +' + statBook   : '')
        + (burstFruit ? ', 爆發果 +' + burstFruit : '')
        + (burstReset ? ', 爆發秘藥 +' + burstReset : '');

      // 確認
      const _confirmTxt = '即將對 ' + (_compTarget.email || _compTarget.uid) + ' 進行補償:\n\n'
        + (heroNames.length ? '🦸 補發角色:\n' + heroNames.map(n => '  ・' + n + ' Lv' + _heroLv[n]).join('\n') + '\n\n' : '')
        + '💰 資源:\n'
        + (coins      ? '  ・知識幣 +'   + coins + '\n' : '')
        + (expBook    ? '  ・經驗之書 +' + expBook + '\n' : '')
        + (skillBook  ? '  ・技能升級書 +' + skillBook + '\n' : '')
        + (statBook   ? '  ・素質重置書 +' + statBook + '\n' : '')
        + (burstFruit ? '  ・極限爆發果實 +' + burstFruit + '\n' : '')
        + (burstReset ? '  ・爆發重置秘藥 +' + burstReset + '\n' : '')
        + '\n原因:' + reason + '\n\n'
        + '⚠ 此操作會記錄在該帳號補償歷史中,確定執行嗎?';

      if(!confirm(_confirmTxt)) return;

      _applyBtn.disabled = true;
      _applyBtn.textContent = '補償中...';
      try {
        const _adminEmail = (window._fbUser && window._fbUser.email) || 'admin';
        const result = await window._fbCompensatePlayer(_compTarget.uid, {
          unlockedHeroes: heroNames,
          heroLevels: _heroLv,
          coins: coins,
          coinsMode: 'add',
          backpack: _bp,
          reason: reason,
          summary: _summary,
          by: _adminEmail
        });

        res.style.color = '#88ff88';

        // ★ v1.0.20260513.6450 — 把「補償成功」改成完整對照表:你想補的 vs 系統實際變動
        //   讓老師立刻看出哪些有生效、哪些被「保留高等級」規則擋下沒升級
        const _diff = (result && result.diff) || {};
        const _req = (result && result.requested) || {};
        const _before = (result && result.before) || {};
        const _esc2 = function(s){
          return String(s == null ? '' : s)
            .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
        };

        // 組對照表的列
        const _rows = [];

        // (A) 角色列:每位想補的角色一行
        const _reqHeroes = Array.isArray(_req.unlockedHeroes) ? _req.unlockedHeroes : [];
        const _reqLevels = (_req.heroLevels && typeof _req.heroLevels === 'object') ? _req.heroLevels : {};
        const _raised = (_diff.heroLevelsRaised && typeof _diff.heroLevelsRaised === 'object') ? _diff.heroLevelsRaised : {};
        const _added = new Set(Array.isArray(_diff.unlockedHeroesAdded) ? _diff.unlockedHeroesAdded : []);
        const _beforeLv = (_before.heroLevels && typeof _before.heroLevels === 'object') ? _before.heroLevels : {};

        _reqHeroes.forEach(name => {
          const _wantLv = _reqLevels[name] || 1;
          const _oldLv = _beforeLv[name] || 0;
          const _isNewlyAdded = _added.has(name);
          const _isRaised = !!_raised[name];
          let _status;
          if(_isNewlyAdded && _isRaised){
            _status = '<span style="color:#88ff88;">✅ 新解鎖,Lv ' + _oldLv + '→' + _raised[name].to + '</span>';
          } else if(_isRaised){
            _status = '<span style="color:#88ff88;">✅ 升級 Lv ' + _oldLv + '→' + _raised[name].to + '</span>';
          } else if(_isNewlyAdded){
            _status = '<span style="color:#88ff88;">✅ 新解鎖 Lv ' + _wantLv + '</span>';
          } else {
            // 想補但完全沒變(原本等級已 >= 補償等級)
            _status = '<span style="color:#ffaa66;">⚠ 已存在 Lv' + _oldLv + ',未變動(保留較高等級)</span>';
          }
          _rows.push('<tr><td style="padding:3px 6px;color:#fff;">' + _esc2(name) + ' Lv' + _wantLv + '</td><td style="padding:3px 6px;">' + _status + '</td></tr>');
        });

        // (B) 知識幣列
        if(typeof _req.coins === 'number' && _req.coins > 0){
          const _coinsDelta = (typeof _diff.coinsDelta === 'number') ? _diff.coinsDelta : 0;
          const _coinsBefore = (typeof _diff.coinsBefore === 'number') ? _diff.coinsBefore : 0;
          const _coinsAfter = (typeof _diff.coinsAfter === 'number') ? _diff.coinsAfter : 0;
          let _coinsStatus;
          if(_coinsDelta > 0){
            _coinsStatus = '<span style="color:#88ff88;">✅ ' + _coinsBefore + ' → ' + _coinsAfter + '(+' + _coinsDelta + ')</span>';
          } else {
            _coinsStatus = '<span style="color:#ffaa66;">⚠ 未變動(' + _coinsBefore + ')</span>';
          }
          _rows.push('<tr><td style="padding:3px 6px;color:#fff;">知識幣 +' + _req.coins + '</td><td style="padding:3px 6px;">' + _coinsStatus + '</td></tr>');
        }

        // (C) 背包列
        const _reqBp = (_req.backpack && typeof _req.backpack === 'object') ? _req.backpack : {};
        const _addedBp = (_diff.backpackAdded && typeof _diff.backpackAdded === 'object') ? _diff.backpackAdded : {};
        const _beforeBp = (_before.backpack && typeof _before.backpack === 'object') ? _before.backpack : {};
        Object.keys(_reqBp).forEach(itemId => {
          const _want = _reqBp[itemId] || 0;
          if(_want <= 0) return;
          const _wasQty = _beforeBp[itemId] || 0;
          const _addedQty = _addedBp[itemId] || 0;
          let _itemName = itemId;
          try {
            if(typeof BACKPACK_ITEM_DEF !== 'undefined' && BACKPACK_ITEM_DEF[itemId]){
              _itemName = (BACKPACK_ITEM_DEF[itemId].icon || '') + ' ' + (BACKPACK_ITEM_DEF[itemId].name || itemId);
            }
          } catch(_){}
          let _bpStatus;
          if(_addedQty >= _want){
            _bpStatus = '<span style="color:#88ff88;">✅ ' + _wasQty + ' → ' + (_wasQty + _addedQty) + '(+' + _addedQty + ')</span>';
          } else if(_addedQty > 0){
            _bpStatus = '<span style="color:#ffaa66;">⚠ ' + _wasQty + ' → ' + (_wasQty + _addedQty) + '(+' + _addedQty + ',被 99 上限擋)</span>';
          } else {
            _bpStatus = '<span style="color:#ff8888;">❌ 未變動(已達 99 上限)</span>';
          }
          _rows.push('<tr><td style="padding:3px 6px;color:#fff;">' + _esc2(_itemName) + ' ×' + _want + '</td><td style="padding:3px 6px;">' + _bpStatus + '</td></tr>');
        });

        // 統計:幾項生效、幾項沒生效
        const _heroEffective = _reqHeroes.filter(n => _added.has(n) || _raised[n]).length;
        const _heroBlocked = _reqHeroes.length - _heroEffective;
        const _coinsEffective = (typeof _diff.coinsDelta === 'number' && _diff.coinsDelta > 0) ? 1 : 0;
        const _bpEffective = Object.keys(_addedBp).length;

        res.innerHTML = '<div style="font-weight:700;font-size:15px;margin-bottom:6px;">✅ 補償執行完畢</div>'
          + '<div style="font-size:12px;color:#ddd;margin-bottom:8px;">'
          + '・帳號:' + _esc2(_compTarget.email || _compTarget.uid) + '<br>'
          + '・此玩家累計補償次數:<b style="color:#ffcc88;">' + result.count + '</b> 次'
          + (_heroBlocked > 0 ? ' <span style="color:#ffaa66;">(⚠ 有 ' + _heroBlocked + ' 項想補但被規則擋下未變動)</span>' : '')
          + '</div>'
          + (_rows.length > 0
              ? '<table style="width:100%;border-collapse:collapse;font-size:12px;background:rgba(0,0,0,0.3);border-radius:4px;overflow:hidden;">'
                + '<thead><tr style="background:rgba(80,50,30,0.7);">'
                + '<th style="padding:5px 6px;text-align:left;color:#ffcc88;border-bottom:1px solid rgba(255,200,100,0.3);">你想補的</th>'
                + '<th style="padding:5px 6px;text-align:left;color:#ffcc88;border-bottom:1px solid rgba(255,200,100,0.3);">系統實際變動</th>'
                + '</tr></thead>'
                + '<tbody>' + _rows.join('') + '</tbody>'
                + '</table>'
              : '<div style="color:#aaa;font-size:12px;">(沒有任何補償項目)</div>')
          + '<div style="margin-top:8px;color:#ffee88;font-size:12px;">'
          + '📊 生效統計:角色 ' + _heroEffective + '/' + _reqHeroes.length
          + ' · 知識幣 ' + (typeof _req.coins === 'number' && _req.coins > 0 ? _coinsEffective + '/1' : '0/0')
          + ' · 背包 ' + _bpEffective + '/' + Object.keys(_reqBp).length
          + '</div>'
          + '<div style="margin-top:6px;color:#ffee88;font-size:12px;">請該學生重新整理頁面或重新登入以載入新資料</div>';

        // 重置補償清單方便下次使用
        _compHeroes = {};
        _renderHeroList();
        document.getElementById('_admin-comp-coins').value      = '0';
        document.getElementById('_admin-comp-exp-book').value   = '0';
        document.getElementById('_admin-comp-skill-book').value = '0';
        document.getElementById('_admin-comp-stat-book').value  = '0';
        document.getElementById('_admin-comp-burst-fruit').value = '0';
        document.getElementById('_admin-comp-burst-reset').value = '0';
        document.getElementById('_admin-comp-reason').value = '';
        // 重新查詢一次,讓資訊區顯示新的補償次數
        try { document.getElementById('_admin-comp-find').click(); } catch(_){}
      } catch(e){
        console.error('[admin compensate apply]', e);
        res.style.color = '#ff6666';
        res.textContent = '❌ 補償失敗:' + (e.code || e.message || e);
      } finally {
        _applyBtn.disabled = false;
        _applyBtn.textContent = '🎁 執行補償(保留現有資料,僅加上去)';
      }
    };
  })();

  (function _initAdminResetTool(){
    if(!document.getElementById('_admin-reset-find')) return;  // UI 未渲染就跳過

    const _getResetableHeroes = function(){
      try {
        if(typeof HERO_DB !== 'object' || !HERO_DB) return [];
        const _bossSet = new Set(typeof BOSS_NAMES !== 'undefined' ? BOSS_NAMES : []);
        const _japanBossHeroes = (typeof JAPAN_BOSS_HEROES !== 'undefined') ? JAPAN_BOSS_HEROES : new Set();
        return Object.keys(HERO_DB).filter(name => {
          // 日本三主 BOSS(大天狗/酒吞童子/玉藻前)是夥伴英雄,白名單優先放行
          if(_japanBossHeroes.has(name)) return true;
          if(_bossSet.has(name)) return false;
          return true;
        });
      } catch(e) {
        console.warn('[_getResetableHeroes] 取得名單失敗', e);
        return [];
      }
    };

    // ★ v1.0.20260519.7100 — 重建工具同步用「補償工具」的分組結構(避免維護兩份名單)
    //   未列入任何組的英雄會自動歸到「💼 其他」最末
    const _RESET_HERO_GROUPS = [
      {
        label: '⚔️ 31 隻基本英雄',
        heroes: ['劍士','祭司','聖騎士','火法師','冰法師','雷法師','光法師','暗法師',
                 '神射手','神偷','刺客','守衛','吟遊詩人','舞者','警長','煉金術師',
                 '武鬥家','軍師','占星師','大力士','凡人','木靈使','機械師','動物學家',
                 '武士','陰陽師','吸血鬼','學者','時空法師','小力','幼兒園小孩']
      },
      {
        label: '🎓 7 隻校園英雄',
        heroes: ['籃球隊員','直笛團員','田徑隊員','電腦繪圖師','程式設計師','弦樂團員','小劇團員']
      },
      {
        label: '🗾 日本主 BOSS 解鎖系',
        heroes: ['大天狗','酒吞童子','玉藻前','巫女']
      },
      {
        label: '🎨 學生設計英雄',
        heroes: ['窮奇','科技生化人','鋁合金暴龍','超鬼神王','雙星姊妹','暗魔將·血','死靈法師','布奶鳥獸','炸彈客','紅色玩家','地府酋長','救醫馬','水狐','米鈴','學霸(轉學生)','天神宙斯','維京海盜船長','武器精靈','神槍手','火柴人']
      },
    ];

    const _populateResetSelect = function(){
      const sel = document.getElementById('_admin-reset-hero-select');
      if(!sel) return;
      sel.innerHTML = '<option value="">-- 選擇英雄 --</option>';
      const _avail = new Set(_getResetableHeroes());
      const _used = new Set();
      // 依分組逐一加 optgroup
      _RESET_HERO_GROUPS.forEach(grp => {
        const _members = grp.heroes.filter(n => _avail.has(n));
        if(_members.length === 0) return;
        const og = document.createElement('optgroup');
        og.label = grp.label;
        _members.forEach(n => {
          const opt = document.createElement('option');
          opt.value = n;
          opt.textContent = n;
          og.appendChild(opt);
          _used.add(n);
        });
        sel.appendChild(og);
      });
      // 未列入任何組的(未來新增英雄)歸到「其他」末段
      const _orphans = [..._avail].filter(n => !_used.has(n)).sort();
      if(_orphans.length > 0){
        const og = document.createElement('optgroup');
        og.label = '💼 其他';
        _orphans.forEach(n => {
          const opt = document.createElement('option');
          opt.value = n;
          opt.textContent = n;
          og.appendChild(opt);
        });
        sel.appendChild(og);
      }
    };
    _populateResetSelect();

    // 重建角色暫存({heroName: level})
    let _resetHeroes = {};
    // 查到的玩家資料快取
    let _resetTarget = null;  // { uid, email, data }

    // 重渲重建英雄清單
    const _renderResetHeroList = function(){
      const wrap = document.getElementById('_admin-reset-hero-list');
      if(!wrap) return;
      const names = Object.keys(_resetHeroes);
      if(names.length === 0){
        wrap.innerHTML = '<span style="color:#666;font-style:italic;">尚未加入任何角色...</span>';
        return;
      }
      wrap.innerHTML = names.map(name => {
        const lv = _resetHeroes[name];
        return '<div style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,150,150,0.18);'
          + 'border:1px solid rgba(255,150,150,0.45);border-radius:6px;padding:4px 8px;margin:2px;font-size:12px;">'
          + '<span style="color:#ffaaaa;font-weight:700;">' + name + '</span>'
          + '<span style="color:#ffee88;">Lv' + lv + '</span>'
          + '<button data-rm="' + name + '" style="margin-left:4px;background:none;border:none;color:#ff8888;cursor:pointer;font-size:14px;padding:0 2px;line-height:1;">×</button>'
          + '</div>';
      }).join('');
      wrap.querySelectorAll('button[data-rm]').forEach(b => {
        b.onclick = function(){
          const n = this.getAttribute('data-rm');
          delete _resetHeroes[n];
          _renderResetHeroList();
        };
      });
    };

    // 加角色
    const _addBtn = document.getElementById('_admin-reset-hero-add');
    if(_addBtn) _addBtn.onclick = function(){
      const sel = document.getElementById('_admin-reset-hero-select');
      const lvInput = document.getElementById('_admin-reset-hero-lv');
      const name = (sel.value || '').trim();
      const lv = Math.max(1, Math.min(50, parseInt(lvInput.value, 10) || 1));
      if(!name){ alert('請先選擇要重建的英雄'); return; }
      _resetHeroes[name] = lv;
      _renderResetHeroList();
      sel.value = '';
    };

    // 查找學生(email 或 uid)
    const _findBtn = document.getElementById('_admin-reset-find');
    if(_findBtn) _findBtn.onclick = async function(){
      const emailInput = document.getElementById('_admin-reset-email');
      const uidInput = document.getElementById('_admin-reset-uid');
      const info = document.getElementById('_admin-reset-info');
      const form = document.getElementById('_admin-reset-form');
      const res = document.getElementById('_admin-reset-result');
      res.textContent = '';
      form.style.display = 'none';
      info.style.display = 'block';
      info.innerHTML = '<span style="color:#aaa;">查詢中...</span>';
      _resetTarget = null;

      const email = (emailInput.value || '').trim().toLowerCase();
      const uid   = (uidInput.value || '').trim();
      if(!email && !uid){
        info.innerHTML = '<span style="color:#ff6666;">❌ 請輸入 email 或 uid 至少一個</span>';
        return;
      }

      try {
        let _targetUid = uid;
        let _foundData = null;
        if(uid){
          if(!window._fbDiagnosePlayer){
            info.innerHTML = '<span style="color:#ff6666;">❌ Firebase 尚未就緒</span>';
            return;
          }
          const d = await window._fbDiagnosePlayer(uid);
          if(!d.exists){
            info.innerHTML = '<span style="color:#ffaa66;">⚠ 此 uid 在 Firestore 無紀錄。</span>';
            return;
          }
          _foundData = d.rawData || {};
          _targetUid = uid;
        } else {
          if(!window._fbAdminFindPlayerByEmail){
            info.innerHTML = '<span style="color:#ff6666;">❌ Firebase API 未載入,請改用 uid 查詢</span>';
            return;
          }
          let r;
          try { r = await window._fbAdminFindPlayerByEmail(email); }
          catch(eFind){
            if(eFind._isPermissionDenied){
              info.innerHTML = '<div style="color:#ff8866;">⚠ Firestore 規則拒絕 email 查詢,請改用 uid。</div>';
              return;
            }
            throw eFind;
          }
          if(!r.found){
            info.innerHTML = '<span style="color:#ffaa66;">⚠ 找不到 email 為 <code>' + email + '</code> 的學生。</span>';
            return;
          }
          _foundData = r.data;
          _targetUid = r.uid;
        }

        _resetTarget = { uid: _targetUid, email: _foundData.email || email, data: _foundData };

        // 顯示「即將被清掉的資料」摘要
        const _esc = function(s){
          return String(s == null ? '' : s)
            .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        };
        const savedStr = _foundData.savedAt ? new Date(_foundData.savedAt).toLocaleString('zh-TW') : '(無)';
        const _heroLvCount = Object.keys(_foundData.heroLevels || {}).length;
        const _bpCount = Object.keys(_foundData.playerBackpack || {}).length;
        const _unlockedCount = (_foundData.unlockedHeroes || []).length;
        const _coins = _foundData.knowledgeCoins || 0;
        const _medalCount = Array.isArray(_foundData.medalsUnlocked) ? _foundData.medalsUnlocked.length : 0;
        const _compCount = _foundData._compensationCount || 0;
        const _resetCount = _foundData._resetCount || 0;

        info.innerHTML = ''
          + '<div style="color:#ffaaaa;font-weight:700;margin-bottom:6px;">⚠ 已找到玩家(以下資料將被<u>完全清空</u>)</div>'
          + '<div><b>uid:</b> <code style="color:#88ccff;">' + _esc(_targetUid) + '</code></div>'
          + '<div><b>email:</b> ' + _esc(_foundData.email || '(無)') + '</div>'
          + '<div><b>學生:</b> ' + _esc(_adminLabel(_foundData.email, _foundData.displayName)) + '</div>'
          + '<div><b>最後存檔:</b> ' + _esc(savedStr) + '</div>'
          + '<hr style="border:none;border-top:1px solid rgba(255,100,100,0.25);margin:6px 0;">'
          + '<div>💰 知識幣: <b style="color:#ffee88;">' + _coins + '</b> <span style="color:#ff8888;">→ 將被清空</span></div>'
          + '<div>🦸 已記錄等級的英雄: <b>' + _heroLvCount + '</b> 位 <span style="color:#ff8888;">→ 將被清空</span></div>'
          + '<div>🎒 背包物品種類: <b>' + _bpCount + '</b> 種 <span style="color:#ff8888;">→ 將被清空</span></div>'
          + '<div>⚔ 已解鎖英雄: <b>' + _unlockedCount + '</b> 位 <span style="color:#ff8888;">→ 將被清空</span></div>'
          + '<div>🏅 已獲得勳章: <b>' + _medalCount + '</b> 個 <span style="color:#ff8888;">→ 將被清空</span></div>'
          + (_compCount > 0 ? '<div>🎁 過往補償紀錄: <b>' + _compCount + '</b> 次 <span style="color:#ff8888;">→ 將被清空</span></div>' : '')
          + '<hr style="border:none;border-top:1px solid rgba(255,200,100,0.25);margin:6px 0;">'
          + '<div style="color:' + (_resetCount > 0 ? '#ff6666' : '#88ff88') + ';font-weight:700;">'
            + '🔁 過去重置次數: <b>' + _resetCount + '</b>'
            + (_resetCount > 0 ? ' ⚠ 此玩家曾被重置過,請審慎評估' : '')
          + '</div>';

        form.style.display = 'block';

        // 清掉上次留下的設定
        _resetHeroes = {};
        _renderResetHeroList();
        document.getElementById('_admin-reset-coins').value = '0';
        document.getElementById('_admin-reset-exp-book').value = '0';
        document.getElementById('_admin-reset-skill-book').value = '0';
        document.getElementById('_admin-reset-stat-book').value = '0';
        document.getElementById('_admin-reset-burst-fruit').value = '0';
        document.getElementById('_admin-reset-burst-reset').value = '0';
        document.getElementById('_admin-reset-reason').value = '';
      } catch(e){
        console.error('[admin reset find]', e);
        info.innerHTML = '<span style="color:#ff6666;">❌ 查詢失敗:' + (e.code || e.message || e) + '</span>';
      }
    };

    // 執行重置
    const _applyBtn = document.getElementById('_admin-reset-apply');
    if(_applyBtn) _applyBtn.onclick = async function(){
      const res = document.getElementById('_admin-reset-result');
      res.style.color = '#ffaaaa';
      res.textContent = '';
      if(!_resetTarget || !_resetTarget.uid){
        res.style.color = '#ff6666';
        res.textContent = '❌ 請先查找玩家';
        return;
      }
      const reason = (document.getElementById('_admin-reset-reason').value || '').trim();
      if(!reason || reason.length < 5){
        res.style.color = '#ff6666';
        res.textContent = '❌ 請填寫重置原因(至少 5 字),會記入稽核紀錄';
        return;
      }

      const _heroes = Object.keys(_resetHeroes);
      const _heroLevels = Object.assign({}, _resetHeroes);
      const _coins = Math.max(0, parseInt(document.getElementById('_admin-reset-coins').value, 10) || 0);
      const _bp = {};
      const _expBook   = Math.max(0, parseInt(document.getElementById('_admin-reset-exp-book').value, 10) || 0);
      const _skillBook = Math.max(0, parseInt(document.getElementById('_admin-reset-skill-book').value, 10) || 0);
      const _statBook  = Math.max(0, parseInt(document.getElementById('_admin-reset-stat-book').value, 10) || 0);
      const _burstFr   = Math.max(0, parseInt(document.getElementById('_admin-reset-burst-fruit').value, 10) || 0);
      const _burstRs   = Math.max(0, parseInt(document.getElementById('_admin-reset-burst-reset').value, 10) || 0);
      if(_expBook)   _bp['hero_exp_book']       = _expBook;
      if(_skillBook) _bp['skill_upgrade_book']  = _skillBook;
      if(_statBook)  _bp['stat_reset_book']     = _statBook;
      if(_burstFr)   _bp['burst_upgrade_fruit'] = _burstFr;
      if(_burstRs)   _bp['burst_reset_potion']  = _burstRs;

      // 摘要
      const _summary = '重置並重建:角色 ' + _heroes.length + ' 位、知識幣 ' + _coins
        + (Object.keys(_bp).length > 0 ? '、物品 ' + Object.keys(_bp).length + ' 種' : '');

      // ── 雙重確認 ──────────────────────────────────────
      const _step1 = '⚠ 警告:即將「完全重置」以下玩家的帳號\n\n'
        + '帳號:' + (_resetTarget.email || _resetTarget.uid) + '\n'
        + 'uid: ' + _resetTarget.uid + '\n\n'
        + '此操作會:\n'
        + '  ❌ 清空所有英雄、等級、技能、勳章、背包\n'
        + '  ❌ 清空世界 BOSS 戰歷史、補償紀錄\n'
        + '  ❌ 清空關卡進度\n'
        + '  ✅ 保留 email 與 displayName(讓玩家還能登入)\n'
        + '  ✅ 寫入你指定的:' + _heroes.length + ' 位角色、' + _coins + ' 知識幣、' + Object.keys(_bp).length + ' 種物品\n\n'
        + '此操作【不可逆】,確定繼續嗎?';
      if(!confirm(_step1)) return;

      const _step2 = '🔴 最終確認\n\n再次確認對【' + (_resetTarget.email || _resetTarget.uid) + '】執行完全重置?\n\n'
        + '原因:' + reason + '\n\n'
        + '按「確定」立即執行,按「取消」中止。';
      if(!confirm(_step2)) return;

      _applyBtn.disabled = true;
      _applyBtn.textContent = '重置中,請稍候...';
      try {
        if(!window._fbResetAndRebuildPlayer){
          throw new Error('_fbResetAndRebuildPlayer 未載入');
        }
        const _adminEmail = (window._fbUser && window._fbUser.email) || 'admin';
        const result = await window._fbResetAndRebuildPlayer(_resetTarget.uid, {
          unlockedHeroes: _heroes,
          heroLevels: _heroLevels,
          coins: _coins,
          backpack: _bp,
          email: _resetTarget.email,
          reason: reason,
          summary: _summary,
          by: _adminEmail
        });
        res.style.color = '#88ff88';
        res.innerHTML = '✅ <b>重置完成!</b><br>'
          + '・帳號:' + (_resetTarget.email || _resetTarget.uid) + '<br>'
          + '・第 <b>' + result.resetCount + '</b> 次重置<br>'
          + '・新解鎖角色: ' + (result.rebuilt.unlockedHeroes.length) + ' 位<br>'
          + '・新知識幣: ' + result.rebuilt.coins + '<br>'
          + '・新背包物品: ' + Object.keys(result.rebuilt.backpack).length + ' 種<br>'
          + '<span style="color:#ffaa66;">注意:玩家下次登入時雲端會載入這份新資料,本地舊資料會被覆蓋。</span>';

        // 清空表單
        _resetHeroes = {};
        _renderResetHeroList();
        document.getElementById('_admin-reset-coins').value = '0';
        document.getElementById('_admin-reset-exp-book').value = '0';
        document.getElementById('_admin-reset-skill-book').value = '0';
        document.getElementById('_admin-reset-stat-book').value = '0';
        document.getElementById('_admin-reset-burst-fruit').value = '0';
        document.getElementById('_admin-reset-burst-reset').value = '0';
        document.getElementById('_admin-reset-reason').value = '';
        // 重新查詢一次,讓資訊區顯示新狀態
        try { document.getElementById('_admin-reset-find').click(); } catch(_){}
      } catch(e){
        console.error('[admin reset apply]', e);
        res.style.color = '#ff6666';
        res.textContent = '❌ 重置失敗:' + (e.code || e.message || e);
      } finally {
        _applyBtn.disabled = false;
        _applyBtn.textContent = '⚠ 執行完全重置 + 重建(會清空所有資料,不可逆)';
      }
    };
  })();

  // ★★★ v3.10.2(2026-05-26) — 3.6 設計師英雄一鍵補發 JS 邏輯 ★★★
  //
  // 後端 API:window._adminGrantAllMissingDesignerHeroes({ dryRun, reason })
  //   - 已寫在 index.html(v3.10.2)
  //   - 內部會走 STUDENT_DESIGNER_HEROES 名冊,對每位:
  //       email → uid → 讀 safe/live/main 三槽
  //       判定「已收到且已培養」(任一槽 lv≥2 / lv=1 且 exp>0)→ 略過
  //       其他 → 用 _fbCompensatePlayer 補發(union 邏輯,不降已有等級)
  (function _initDesignerGrantTool(){
    const _resultBox = document.getElementById('_admin-designer-grant-result');
    const _previewBtn = document.getElementById('_admin-designer-grant-preview');
    const _applyBtn   = document.getElementById('_admin-designer-grant-apply');
    if(!_resultBox || !_previewBtn || !_applyBtn) return;

    const _esc = function(s){
      return String(s == null ? '' : s)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    };

    // 渲染結果(預覽或實際補發共用)
    function _renderResults(res, isDryRun){
      if(!res || typeof res !== 'object'){
        _resultBox.style.display = 'block';
        _resultBox.innerHTML = '<span style="color:#ff8888;">❌ 無回傳資料或執行失敗</span>';
        return;
      }
      if(res.ok === false){
        _resultBox.style.display = 'block';
        _resultBox.innerHTML = '<span style="color:#ff8888;">❌ 失敗:' + _esc(res.reason || '未知原因') + '</span>';
        return;
      }
      const _granted     = res.granted || [];
      const _grantedDry  = res.granted_dry || [];
      const _skipped     = res.skipped_already_trained || [];
      const _neverLogged = res.never_logged_in || [];
      const _failed      = res.failed || [];

      const _renderRow = function(r, color){
        return '<div style="padding:6px 10px;background:rgba(0,0,0,0.25);border-radius:5px;margin-bottom:3px;'
          + 'border-left:3px solid ' + color + ';">'
          + '<b style="color:' + color + ';">' + _esc(r.class) + _esc(r.name) + '</b>'
          + ' <span style="color:#aaa;">(' + _esc(r.email) + ')</span>'
          + '<br><span style="color:#ddd;">設計英雄:<b style="color:#ffcc88;">' + _esc(r.hero) + '</b></span>'
          + ' <span style="color:#888;font-size:11px;">— ' + _esc(r.reason) + '</span>'
          + '</div>';
      };

      let html = '';
      // 標題列
      html += '<div style="font-size:14px;font-weight:700;color:' + (isDryRun ? '#c8a8ff' : '#aaffcc') + ';margin-bottom:8px;">'
            + (isDryRun ? '📝 預覽結果(不寫入)' : '🎁 補發完成')
            + '</div>';
      // 統計
      html += '<div style="margin-bottom:10px;padding:8px 12px;background:rgba(40,30,60,0.55);border-radius:6px;font-size:13px;line-height:1.7;">';
      html += '<div>⏩ 已收到且培養中(略過):<b style="color:#aaffcc;">' + _skipped.length + '</b> 位</div>';
      if(isDryRun){
        html += '<div>📝 預覽將補發:<b style="color:#c8a8ff;">' + _grantedDry.length + '</b> 位</div>';
      } else {
        html += '<div>🎁 已補發:<b style="color:#ffcc88;">' + _granted.length + '</b> 位</div>';
      }
      html += '<div>❓ 從未登入(無法補):<b style="color:#888;">' + _neverLogged.length + '</b> 位</div>';
      if(_failed.length > 0){
        html += '<div>🚨 失敗:<b style="color:#ff8888;">' + _failed.length + '</b> 位</div>';
      }
      html += '</div>';

      // 需要補發/已補發清單
      const _grantList = isDryRun ? _grantedDry : _granted;
      if(_grantList.length > 0){
        html += '<div style="font-size:13px;color:#c8a8ff;margin-bottom:4px;font-weight:700;">'
              + (isDryRun ? '🎯 將補發以下學生:' : '✅ 已補發以下學生:') + '</div>';
        _grantList.forEach(r => { html += _renderRow(r, isDryRun ? '#c8a8ff' : '#aaffcc'); });
      }
      // 從未登入清單
      if(_neverLogged.length > 0){
        html += '<div style="font-size:13px;color:#888;margin:8px 0 4px;font-weight:700;">'
              + '❓ 從未登入(待學生首次登入後系統自動補):</div>';
        _neverLogged.forEach(r => { html += _renderRow(r, '#888'); });
      }
      // 失敗清單
      if(_failed.length > 0){
        html += '<div style="font-size:13px;color:#ff8888;margin:8px 0 4px;font-weight:700;">'
              + '🚨 失敗清單(請查 console 詳情):</div>';
        _failed.forEach(r => { html += _renderRow(r, '#ff8888'); });
      }
      // 略過清單(摺疊,避免太長)
      if(_skipped.length > 0){
        html += '<details style="margin-top:8px;">'
              + '<summary style="cursor:pointer;font-size:13px;color:#88aabb;padding:4px 0;">'
              + '⏩ 已收到且培養中的 ' + _skipped.length + ' 位(點擊展開)</summary>'
              + '<div style="margin-top:4px;">';
        _skipped.forEach(r => { html += _renderRow(r, '#88aabb'); });
        html += '</div></details>';
      }

      _resultBox.style.display = 'block';
      _resultBox.innerHTML = html;
    }

    async function _runGrant(isDryRun){
      const _btn = isDryRun ? _previewBtn : _applyBtn;
      const _origText = _btn.textContent;
      _btn.disabled = true;
      _btn.textContent = isDryRun ? '掃描中...' : '補發中...';
      _resultBox.style.display = 'block';
      _resultBox.innerHTML = '<span style="color:#aaa;">⏳ 處理中,請稍候(視設計師人數可能 5~30 秒)...</span>';

      if(typeof window._adminGrantAllMissingDesignerHeroes !== 'function'){
        _resultBox.innerHTML = '<span style="color:#ff8888;">❌ 後端 API _adminGrantAllMissingDesignerHeroes 未載入</span>';
        _btn.disabled = false;
        _btn.textContent = _origText;
        return;
      }

      if(!isDryRun){
        // 實際補發前確認
        const _ok = confirm('確定要對所有需要補發的學生執行實際補發嗎?\n\n'
          + '已收到且開始培養的學生會自動略過,不會降低任何已有等級。\n'
          + '建議:先點「預覽」確認名單後再執行此動作。');
        if(!_ok){
          _btn.disabled = false;
          _btn.textContent = _origText;
          _resultBox.style.display = 'none';
          return;
        }
      }

      try{
        const _res = await window._adminGrantAllMissingDesignerHeroes({
          dryRun: isDryRun,
          reason: isDryRun
            ? '管理員後台預覽(不寫入)'
            : '管理員後台一鍵補發(設計師英雄)',
        });
        _renderResults(_res, isDryRun);
      }catch(e){
        console.error('[3.6 設計師英雄補發] 例外', e);
        _resultBox.innerHTML = '<span style="color:#ff8888;">❌ 例外:' + _esc(e && e.message || String(e)) + '</span>';
      }finally{
        _btn.disabled = false;
        _btn.textContent = _origText;
      }
    }

    _previewBtn.onclick = function(){ _runGrant(true); };
    _applyBtn.onclick   = function(){ _runGrant(false); };
  })();

  // ★★★ v3.10.3(2026-05-26) — 3.7 撤銷學生「裝置信任」JS 邏輯 ★★★
  (function _initTrustRevokeTool(){
    const _emailInput = document.getElementById('_admin-trust-email');
    const _checkBtn   = document.getElementById('_admin-trust-check');
    const _revokeBtn  = document.getElementById('_admin-trust-revoke');
    const _resultBox  = document.getElementById('_admin-trust-result');
    if(!_emailInput || !_checkBtn || !_revokeBtn || !_resultBox) return;

    const _esc = function(s){
      return String(s == null ? '' : s)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    };

    let _curUid = null;
    let _curTrustedDevices = null;

    // 查信任裝置清單
    _checkBtn.onclick = async function(){
      const _e = (_emailInput.value || '').trim().toLowerCase();
      if(!_e){
        alert('請輸入學生 email');
        return;
      }
      _checkBtn.disabled = true;
      _checkBtn.textContent = '查詢中...';
      _resultBox.style.display = 'block';
      _resultBox.innerHTML = '<span style="color:#aaa;">⏳ 查詢中...</span>';

      try{
        if(typeof window._fbFindByEmail !== 'function'){
          throw new Error('_fbFindByEmail 未就緒');
        }
        const _player = await window._fbFindByEmail(_e);
        if(!_player || !_player.uid){
          _resultBox.innerHTML = '<span style="color:#ff8888;">❌ 找不到此 email 對應的玩家</span>';
          _curUid = null;
          _curTrustedDevices = null;
          return;
        }
        _curUid = _player.uid;
        const _td = _player.trustedDevices || {};
        _curTrustedDevices = _td;
        const _activeDevices = Object.keys(_td).filter(k => _td[k] && _td[k].trusted === true);
        const _allCount = Object.keys(_td).length;
        if(_activeDevices.length === 0){
          _resultBox.innerHTML =
            '<div style="color:#aabbcc;">'
            + '✅ 此學生<b style="color:#aaffcc;">目前沒有任何信任裝置</b>(無需撤銷)<br>'
            + '<span style="font-size:12px;color:#888;">'
            + (_allCount > 0 ? '(歷史紀錄:' + _allCount + ' 筆,皆已撤銷)' : '(從未啟用過信任)')
            + '</span>'
            + '</div>';
          return;
        }
        // 列出每台信任裝置
        let html = '<div style="color:#aaccff;font-weight:700;margin-bottom:6px;">'
                 + '🔐 目前有 <b style="color:#ffcc88;">' + _activeDevices.length + '</b> 台信任裝置:'
                 + '</div>';
        _activeDevices.forEach(function(devId, idx){
          const _info = _td[devId] || {};
          const _ts = _info.trustedAt ? new Date(_info.trustedAt).toLocaleString('zh-TW') : '(未知)';
          html += '<div style="padding:8px 12px;background:rgba(0,0,0,0.3);border-radius:6px;margin-bottom:4px;border-left:3px solid #66aaff;">'
                + '<div><b style="color:#aaccff;">' + (idx+1) + '. ' + _esc(_info.label || '裝置(未命名)') + '</b></div>'
                + '<div style="font-size:11px;color:#888;font-family:monospace;">deviceId: ' + _esc(devId) + '</div>'
                + '<div style="font-size:11px;color:#aabbcc;">信任時間:' + _esc(_ts) + '</div>'
                + '</div>';
        });
        _resultBox.innerHTML = html;
      }catch(e){
        console.error('[3.7 查信任裝置]', e);
        _resultBox.innerHTML = '<span style="color:#ff8888;">❌ 查詢失敗:' + _esc(e && e.message || String(e)) + '</span>';
        _curUid = null;
      }finally{
        _checkBtn.disabled = false;
        _checkBtn.textContent = '🔍 查信任裝置';
      }
    };

    // 撤銷全部信任
    _revokeBtn.onclick = async function(){
      if(!_curUid){
        alert('請先點「查信任裝置」找到玩家');
        return;
      }
      if(!confirm('確定要撤銷此學生「所有」信任裝置嗎?\n\n'
        + '撤銷後該學生下次在任何裝置都要重新登入。\n'
        + '不會影響玩家本人或帳號資料,只清「信任名單」。')){
        return;
      }
      _revokeBtn.disabled = true;
      _revokeBtn.textContent = '撤銷中...';
      try{
        if(!window._lxpsDeviceTrust || !window._lxpsDeviceTrust.revokeAllTrustedDevices){
          throw new Error('_lxpsDeviceTrust 模組未就緒');
        }
        const _ok = await window._lxpsDeviceTrust.revokeAllTrustedDevices(_curUid);
        if(_ok){
          _resultBox.innerHTML = '<span style="color:#aaffcc;">✅ 已撤銷該學生所有信任裝置,'
                              + '下次任何裝置都要重新登入</span>';
          _curTrustedDevices = null;
        } else {
          _resultBox.innerHTML = '<span style="color:#ff8888;">❌ 撤銷失敗,請查 console 詳情</span>';
        }
      }catch(e){
        console.error('[3.7 撤銷信任]', e);
        _resultBox.innerHTML = '<span style="color:#ff8888;">❌ 撤銷例外:' + _esc(e && e.message || String(e)) + '</span>';
      }finally{
        _revokeBtn.disabled = false;
        _revokeBtn.textContent = '❌ 撤銷全部';
      }
    };
  })();

  // ★★★ v3.5.37 — 3.7 Lv1 救援工具 JS 邏輯 ★★★
  (function _initLv1RescueTool(){
    let _lv1DiagData = null;

    // 共用:把摘要渲染成 HTML
    function _renderSlot(title, key, slot, scores, bestKey){
      if(!slot || !slot.exists){
        return '<div style="padding:8px 12px;background:rgba(80,30,30,0.3);border-radius:6px;margin-bottom:6px;border-left:3px solid #ff6666;">'
          + '<b style="color:#ff8888;">' + title + ':</b> <span style="color:#aaa;">不存在</span>'
          + (slot && slot.error ? ' <span style="color:#ff8888;">(' + slot.error + ')</span>' : '')
          + '</div>';
      }
      const _color = (function(){
        if(scores[key] <= 0) return '#ff8888';
        if(key === bestKey) return '#88ff88';
        return '#ffcc66';
      })();
      const _label = (function(){
        if(scores[key] <= 0) return '⚠ 受損/空白';
        if(key === bestKey) return '🛡 推薦來源';
        return '👀 有資料';
      })();
      const _saved = slot.savedAt ? new Date(slot.savedAt).toLocaleString('zh-TW') : '(無存檔時間)';
      return '<div style="padding:10px 12px;background:rgba(40,40,60,0.4);border-radius:6px;margin-bottom:6px;border-left:3px solid ' + _color + ';">'
        + '<div style="color:' + _color + ';font-weight:700;margin-bottom:4px;">'
          + title + ' &nbsp;[' + _label + '] &nbsp;<small style="color:#888;">分數=' + (scores[key] || 0) + '</small>'
        + '</div>'
        + '<div style="font-size:12px;color:#bbb;">最後存檔: ' + _saved + '</div>'
        + '<div style="font-size:13px;color:#ddd;margin-top:4px;">'
        + '💰 知識幣 <b style="color:#ffee88;">' + (slot.knowledgeCoins || 0).toLocaleString() + '</b> | '
        + '⚔ 解鎖英雄 <b>' + (slot.unlockedCount || 0) + '</b> 位 | '
        + '🎯 最高 Lv<b>' + (slot.maxHeroLv || 0) + '</b> | '
        + '📊 等級總和 <b>' + (slot.totalHeroLv || 0) + '</b>'
        + '</div>'
        + '</div>';
    }

    // 共用:渲染診斷結果到 UI
    function _renderDiag(d, uid){
      const diag = document.getElementById('_admin-lv1-diag');
      const panel = document.getElementById('_admin-lv1-restore-panel');

      const _bestKey = d.recommendation && d.recommendation !== 'all_damaged'
        ? d.recommendation.replace('use_', '') : null;

      let html = '<div style="margin-bottom:8px;"><b>uid:</b> <code style="color:#88ccff;">' + uid + '</code></div>';
      if(d.mainDoc && d.mainDoc.exists){
        html += '<div style="font-size:12px;color:#aaa;margin-bottom:8px;">'
          + '學生: ' + _adminLabel(d.mainDoc.email, d.mainDoc.displayName)
          + '</div>';
      }
      html += _renderSlot('① 主文件 (players/' + uid.slice(0,8) + '...)', 'main', d.mainDoc, d.scores, _bestKey);
      html += _renderSlot('② live 槽 (.../saves/live)', 'live', d.liveSlot, d.scores, _bestKey);
      html += _renderSlot('③ safe 槽 (.../saves/safe) 🛡 救命槽', 'safe', d.safeSlot, d.scores, _bestKey);

      if(d.recommendation === 'all_damaged'){
        html += '<div style="margin-top:10px;padding:10px;background:rgba(120,30,30,0.4);border:1px solid #ff6666;border-radius:6px;color:#ff8888;font-weight:700;">'
          + '❌ 三個地方都看不到有效資料 → 建議改用 <b>3.5 學生補償工具</b>(憑學生回憶手動補)'
          + '</div>';
      } else {
        const _which = d.recommendation.replace('use_', '');
        const _label = _which === 'safe' ? 'safe 槽(救命槽)' : (_which === 'live' ? 'live 槽' : '主文件');
        html += '<div style="margin-top:10px;padding:10px;background:rgba(30,80,40,0.4);border:1px solid #66dd99;border-radius:6px;color:#aaffcc;font-weight:700;">'
          + '✅ 推薦從 <b>' + _label + '</b> 還原(分數最高 = 資料最豐富)'
          + '</div>';
      }

      diag.innerHTML = html;
      diag.style.display = 'block';
      panel.style.display = 'block';

      // 重新啟用按鈕
      ['_admin-lv1-restore-safe', '_admin-lv1-restore-live', '_admin-lv1-restore-main']
        .forEach(id => { const b = document.getElementById(id); if(b){ b.disabled = false; b.style.opacity = '1'; }});

      // 不存在的槽對應按鈕變灰
      if(!d.safeSlot || !d.safeSlot.exists){
        const b = document.getElementById('_admin-lv1-restore-safe');
        if(b){ b.disabled = true; b.title = 'safe 槽不存在'; b.style.opacity = '0.4'; }
      }
      if(!d.liveSlot || !d.liveSlot.exists){
        const b = document.getElementById('_admin-lv1-restore-live');
        if(b){ b.disabled = true; b.title = 'live 槽不存在'; b.style.opacity = '0.4'; }
      }
      if(!d.mainDoc || !d.mainDoc.exists){
        const b = document.getElementById('_admin-lv1-restore-main');
        if(b){ b.disabled = true; b.title = '主文件不存在'; b.style.opacity = '0.4'; }
      }
    }

    function _getUid(){
      const v = (document.getElementById('_admin-lv1-uid').value || '').trim();
      return v || window._gUserId;
    }

    // ─── ★ v3.5.72 — 按鈕 0:📧 從 email 反查 uid 並自動填入下方 ───
    const _btnFindUid = document.getElementById('_admin-lv1-find-uid');
    if(_btnFindUid){
      _btnFindUid.onclick = async () => {
        const _emailInput = document.getElementById('_admin-lv1-email');
        const _uidInput = document.getElementById('_admin-lv1-uid');
        const diag = document.getElementById('_admin-lv1-diag');
        const email = (_emailInput.value || '').trim().toLowerCase();
        if(!email){
          diag.style.display = 'block';
          diag.innerHTML = '<span style="color:#ff6666;">❌ 請先輸入 email</span>';
          return;
        }
        if(!window._fbAdminFindPlayerByEmail){
          diag.style.display = 'block';
          diag.innerHTML = '<span style="color:#ff6666;">❌ _fbAdminFindPlayerByEmail API 尚未就緒</span>';
          return;
        }
        diag.style.display = 'block';
        diag.innerHTML = '<span style="color:#aaa;">⏳ 查詢 ' + email + ' 中...</span>';
        try{
          const _r = await window._fbAdminFindPlayerByEmail(email);
          if(!_r.found){
            diag.innerHTML = '<span style="color:#ff6666;">❌ 找不到這個 email 的玩家:</span> <code style="color:#ffcc66;">' + email + '</code>'
              + '<br><span style="color:#aaa;font-size:12px;">學生可能還沒登入過遊戲、或 email 拼錯</span>';
            return;
          }
          // 自動填入 uid 欄位
          _uidInput.value = _r.uid;
          const _name = _r.data.displayName || '(未設暱稱)';
          const _lastSavedRaw = _r.data.savedAt || _r.data._lastUpdateTs || 0;
          const _lastSaved = _lastSavedRaw ? new Date(_lastSavedRaw).toLocaleString('zh-TW') : '(無)';
          diag.innerHTML = '<span style="color:#aaffcc;">✅ 找到玩家!已自動填入 uid:</span> <code style="color:#88ccff;">' + _r.uid + '</code>'
            + '<br><span style="color:#aaa;font-size:12px;">暱稱:<b style="color:#ffcc66;">' + _name + '</b> | 主文件最後更新:' + _lastSaved + '</span>'
            + '<br><span style="color:#aaffcc;font-size:13px;margin-top:6px;display:inline-block;">👉 按右邊「🔍 三槽深度掃描」或「✨ 一鍵自動還原」</span>';
        }catch(e){
          diag.innerHTML = '<span style="color:#ff6666;">❌ 查詢失敗:</span> ' + (e.code || e.message || e);
        }
      };
    }

    // ─── 按鈕 1:三槽深度掃描 ───
    const _btnScan = document.getElementById('_admin-lv1-scan');
    if(_btnScan){
      _btnScan.onclick = async () => {
        const diag = document.getElementById('_admin-lv1-diag');
        const panel = document.getElementById('_admin-lv1-restore-panel');
        const res = document.getElementById('_admin-lv1-result');
        res.textContent = '';
        panel.style.display = 'none';
        diag.style.display = 'block';
        diag.innerHTML = '<span style="color:#aaa;">⏳ 正在從 Firestore 深度掃描三個地方,請稍候...</span>';

        const uid = _getUid();
        if(!uid){
          diag.innerHTML = '<span style="color:#ff6666;">❌ 無法取得 uid(未登入且未輸入)</span>';
          return;
        }
        if(!window._fbDiagnoseAllSlots){
          diag.innerHTML = '<span style="color:#ff6666;">❌ _fbDiagnoseAllSlots API 尚未就緒</span>';
          return;
        }
        try {
          const d = await window._fbDiagnoseAllSlots(uid);
          _lv1DiagData = d;
          _renderDiag(d, uid);
        } catch(e){
          diag.innerHTML = '<span style="color:#ff6666;">❌ 掃描失敗:' + (e.code || e.message || e) + '</span>';
        }
      };
    }

    // ─── 按鈕 2:✨ 一鍵自動還原最豐富版本(主要功能)───
    const _btnAuto = document.getElementById('_admin-lv1-auto');
    if(_btnAuto){
      _btnAuto.onclick = async () => {
        const diag = document.getElementById('_admin-lv1-diag');
        const panel = document.getElementById('_admin-lv1-restore-panel');
        const res = document.getElementById('_admin-lv1-result');
        res.textContent = '';
        panel.style.display = 'none';
        diag.style.display = 'block';
        diag.innerHTML = '<span style="color:#aaa;">⏳ 掃描三槽中,並自動選最豐富版本還原...</span>';

        const uid = _getUid();
        if(!uid){
          diag.innerHTML = '<span style="color:#ff6666;">❌ 無法取得 uid(未登入且未輸入)</span>';
          return;
        }
        if(!window._fbDiagnoseAllSlots || !window._fbAutoRestoreBestSlot){
          diag.innerHTML = '<span style="color:#ff6666;">❌ 自動還原 API 尚未就緒</span>';
          return;
        }

        try {
          // 先掃描,讓使用者看到三槽狀態
          const d = await window._fbDiagnoseAllSlots(uid);
          _lv1DiagData = d;
          _renderDiag(d, uid);

          // 三槽都壞 → 直接結束,不執行還原
          if(d.recommendation === 'all_damaged'){
            res.style.color = '#ff8888';
            res.innerHTML = '❌ 三槽都受損,無法自動還原。請改用 <b>3.5 學生補償工具</b> 手動補。';
            return;
          }

          // ★ v3.5.40 — 二次確認改用左右對比視窗(本地 vs 雲端救援來源)
          const _which = d.recommendation.replace('use_', '');
          const _whichLabel = _which === 'safe' ? '🛡 safe 槽(救命槽)' : (_which === 'live' ? '📡 live 槽' : '📄 主文件');
          // 救援來源的完整 rawData
          const _bestRaw = _which === 'safe' ? (d.safeSlot && d.safeSlot.rawData) || d.safeSlot
                         : (_which === 'live' ? (d.liveSlot && d.liveSlot.rawData) || d.liveSlot : (d.mainDoc && d.mainDoc.rawData) || d.mainDoc);
          // 目前主文件當作「現狀」(老師可能在救別人,本地不一定是該學生的)
          const _currentMainRaw = (d.mainDoc && d.mainDoc.rawData) || d.mainDoc;

          let _confirmed = false;
          if(typeof window._showDataCompareDialog === 'function'){
            const _leftSummary = window._extractDataSummaryForCompare(
              _currentMainRaw, '🔴 學生目前主檔(可能被汙染)');
            const _rightSummary = window._extractDataSummaryForCompare(
              _bestRaw, '🛡 救援來源:' + _whichLabel);
            _confirmed = await window._showDataCompareDialog({
              title: '🆘 老師救援:請確認復原內容',
              subtitle: '學生 uid: ' + (uid || '').slice(0,8) + '... — 救援來源 = ' + _whichLabel,
              leftLabel: '🔴 學生目前主檔',
              leftData: _leftSummary,
              rightLabel: '🛡 救援來源 ' + _whichLabel,
              rightData: _rightSummary,
              winner: 'right',
              confirmText: '✅ 確認套用右邊(' + _whichLabel + ')',
              cancelText: '❌ 取消(不寫雲端)',
              extraNote:
                '📋 <b>按下確認後將自動執行:</b><br>' +
                '&nbsp;&nbsp;① 寫入主文件 + live 槽<br>' +
                (_which !== 'safe' ? '&nbsp;&nbsp;② 同步寫入 safe 槽(若更健康)<br>' : '') +
                '&nbsp;&nbsp;★ 寫入「救援信號」<b>_adminRescueSignal</b><br>' +
                '<br>🛡 <b>學生端反污染保護(v3.5.39):</b><br>' +
                '&nbsp;&nbsp;學生下次開遊戲時,系統會自動偵測救援信號,先彈出「左右對比視窗」讓學生再確認一次<br>' +
                '&nbsp;&nbsp;然後強清本地殘留 + 跳過 union/merge + 暫停 autosave 30 秒'
            });
          } else {
            // fallback:沒有對比視窗就用原本 confirm
            const _bestSlot = _which === 'safe' ? d.safeSlot : (_which === 'live' ? d.liveSlot : d.mainDoc);
            const _msg = '✨ 將從「' + _whichLabel + '」自動還原以下資料:\n\n'
              + '• 知識幣: ' + (_bestSlot.knowledgeCoins || 0).toLocaleString() + '\n'
              + '• 解鎖英雄: ' + (_bestSlot.unlockedCount || 0) + ' 位\n'
              + '• 最高等級: Lv' + (_bestSlot.maxHeroLv || 0) + '\n'
              + '• 等級總和: ' + (_bestSlot.totalHeroLv || 0) + '\n\n確定執行?';
            _confirmed = confirm(_msg);
          }

          if(!_confirmed){
            res.style.color = '#aaa';
            res.textContent = '已取消還原';
            return;
          }

          // 執行還原
          _btnAuto.disabled = true;
          _btnAuto.textContent = '⏳ 還原中...';
          const _result = await window._fbAutoRestoreBestSlot(uid);

          if(_result.ok){
            res.style.color = '#88ff88';
            res.innerHTML = '✅ 已成功從 <b style="color:#aaffcc;">' + _result.restoredFrom + ' 槽</b>還原資料!<br>'
              + '<br>📋 <b>已自動執行的雲端動作:</b><br>'
              + '&nbsp;&nbsp;① 寫入 main 主文件<br>'
              + '&nbsp;&nbsp;② 寫入 live 槽<br>'
              + (_result.restoredFrom !== 'safe' ? '&nbsp;&nbsp;③ 同步寫入 safe 槽(若更健康)<br>' : '')
              + '&nbsp;&nbsp;<b style="color:#aaffcc;">★ 寫入「救援信號」標記(_adminRescueSignal)</b><br>'
              + '<br>🛡 <b style="color:#ffcc88;">學生端反污染保護(v3.5.39+40):</b><br>'
              + '&nbsp;&nbsp;學生下次開遊戲時,系統會自動偵測救援信號:<br>'
              + '&nbsp;&nbsp;• <b>先彈出「左右對比視窗」</b>讓學生再確認一次(v3.5.40 新增)<br>'
              + '&nbsp;&nbsp;• 確認後強制清除本地殘留(lxps_progress、adv_unlocked_heroes 等)<br>'
              + '&nbsp;&nbsp;• 跳過所有 union/merge 邏輯,完全以雲端為準<br>'
              + '&nbsp;&nbsp;• 暫停 autosave 30 秒,避免舊資料反推回去<br>'
              + '<br>📣 <b>請告知學生:</b>重新整理頁面 / 關閉再開 App 即可看到救援結果。<br>'
              + (uid === window._gUserId
                ? '<br><b style="color:#ffee88;">(您救的是自己的帳號,建議現在就重新整理頁面)</b>'
                : '');
            // 重新掃描顯示新狀態
            try {
              const _newD = await window._fbDiagnoseAllSlots(uid);
              _lv1DiagData = _newD;
              _renderDiag(_newD, uid);
            }catch(_){}
          } else {
            res.style.color = '#ff8888';
            res.innerHTML = '❌ 自動還原失敗:' + _result.message;
          }
        } catch(e){
          res.style.color = '#ff6666';
          res.innerHTML = '❌ 自動還原失敗:' + (e.code || e.message || e);
        } finally {
          _btnAuto.disabled = false;
          _btnAuto.innerHTML = '✨ 一鍵自動還原最豐富版本';
        }
      };
    }

    // ─── 按鈕 3-5:手動指定 safe / live / main 槽還原 ───
    async function _doManualRestore(slotName, btn, btnLabel){
      const res = document.getElementById('_admin-lv1-result');
      if(!_lv1DiagData){
        res.style.color = '#ff8888';
        res.textContent = '❌ 請先按「三槽深度掃描」';
        return;
      }
      const uid = _lv1DiagData.uid;
      const _slot = slotName === 'safe' ? _lv1DiagData.safeSlot
                  : (slotName === 'live' ? _lv1DiagData.liveSlot : _lv1DiagData.mainDoc);
      if(!_slot || !_slot.exists){
        res.style.color = '#ff8888';
        res.textContent = '❌ ' + slotName + ' 槽不存在,無法從這槽還原';
        return;
      }

      const _msg = '從「' + slotName + ' 槽」還原以下資料:\n\n'
        + '• 知識幣: ' + (_slot.knowledgeCoins || 0).toLocaleString() + '\n'
        + '• 解鎖英雄: ' + (_slot.unlockedCount || 0) + ' 位\n'
        + '• 最高等級: Lv' + (_slot.maxHeroLv || 0) + '\n'
        + '• 等級總和: ' + (_slot.totalHeroLv || 0) + '\n\n'
        + '會寫入「主文件 + live 槽」,確定?';
      if(!confirm(_msg)) return;

      btn.disabled = true;
      const _origText = btn.textContent;
      btn.textContent = '⏳ 還原中...';
      try {
        await window._fbRestoreFromSlot(uid, slotName);
        res.style.color = '#88ff88';
        res.innerHTML = '✅ 已從 <b>' + slotName + ' 槽</b>還原資料!請告知學生重新整理頁面。'
          + (uid === window._gUserId
            ? '<br><b style="color:#ffee88;">(您救的是自己的帳號,建議現在就重新整理)</b>'
            : '');
        // 重新掃描顯示新狀態
        try {
          const _newD = await window._fbDiagnoseAllSlots(uid);
          _lv1DiagData = _newD;
          _renderDiag(_newD, uid);
        }catch(_){}
      } catch(e){
        res.style.color = '#ff6666';
        res.innerHTML = '❌ 還原失敗:' + (e.code || e.message || e);
      } finally {
        btn.disabled = false;
        btn.textContent = _origText;
      }
    }

    const _btnSafe = document.getElementById('_admin-lv1-restore-safe');
    if(_btnSafe) _btnSafe.onclick = () => _doManualRestore('safe', _btnSafe, '🛡 從 safe 槽還原(推薦)');

    const _btnLive = document.getElementById('_admin-lv1-restore-live');
    if(_btnLive) _btnLive.onclick = () => _doManualRestore('live', _btnLive, '📡 從 live 槽還原');

    const _btnMain = document.getElementById('_admin-lv1-restore-main');
    if(_btnMain) _btnMain.onclick = () => _doManualRestore('main', _btnMain, '📄 從主文件還原');

    console.log('[3.7 Lv1 救援工具 v3.5.37] JS 邏輯已掛載');
  })();

  // ★★★ v3.5.72 — 3.8 寄送「污染檢查提醒」工具 JS 邏輯 ★★★
  (function _initPollutionCheckTool(){
    function _resolveUid(){
      // 先 email 反查,再退回 uid 欄位
      return new Promise(async (resolve, reject) => {
        const _emailInput = document.getElementById('_admin-pc-email');
        const _uidInput = document.getElementById('_admin-pc-uid');
        const email = (_emailInput.value || '').trim().toLowerCase();
        const uidIn = (_uidInput.value || '').trim();
        if(email){
          if(!window._fbAdminFindPlayerByEmail){
            reject(new Error('_fbAdminFindPlayerByEmail API 尚未就緒'));
            return;
          }
          try{
            const _r = await window._fbAdminFindPlayerByEmail(email);
            if(!_r.found){
              reject(new Error('找不到 email = ' + email + ' 的玩家'));
              return;
            }
            resolve({ uid: _r.uid, email: email, displayName: _r.data.displayName || '(未設暱稱)' });
          }catch(e){ reject(e); }
        } else if(uidIn){
          resolve({ uid: uidIn, email: '(直接輸入 uid)', displayName: '?' });
        } else {
          reject(new Error('請輸入 email 或 uid'));
        }
      });
    }

    // ─── 按鈕:📤 寄送污染檢查提醒 ───
    const _btnSend = document.getElementById('_admin-pc-send');
    if(_btnSend){
      _btnSend.onclick = async () => {
        const _res = document.getElementById('_admin-pc-result');
        const _reasonInput = document.getElementById('_admin-pc-reason');
        _res.style.display = 'block';
        _res.innerHTML = '<span style="color:#aaa;">⏳ 處理中...</span>';
        let _target = null;
        try{
          _target = await _resolveUid();
        }catch(e){
          _res.innerHTML = '<span style="color:#ff6666;">❌ ' + (e.message || e) + '</span>';
          return;
        }
        if(!window._fbSendPollutionCheckSignal){
          _res.innerHTML = '<span style="color:#ff6666;">❌ _fbSendPollutionCheckSignal API 尚未就緒</span>';
          return;
        }
        const _reason = (_reasonInput.value || '').trim();
        // 二次確認
        const _confirmMsg = '確認要寄送污染檢查提醒給:\n\n'
          + 'email: ' + _target.email + '\n'
          + 'uid: ' + _target.uid + '\n'
          + 'displayName: ' + _target.displayName + '\n\n'
          + (_reason ? ('原因:' + _reason + '\n\n') : '')
          + '學生下次開遊戲時會看到對比視窗自己決定。\n'
          + '不論選哪邊,接下來 24 小時內這個帳號「解鎖英雄倒退」類自動 BUG 回報會被 mute。';
        // 用 confirm 或 _customConfirm
        const _ok = await new Promise((resolve) => {
          if(typeof window._customConfirm === 'function'){
            window._customConfirm(_confirmMsg, () => resolve(true), () => resolve(false));
          } else {
            resolve(window.confirm(_confirmMsg));
          }
        });
        if(!_ok){
          _res.innerHTML = '<span style="color:#aaa;">已取消</span>';
          return;
        }
        _res.innerHTML = '<span style="color:#aaa;">⏳ 寄送中...</span>';
        try{
          const _r = await window._fbSendPollutionCheckSignal(_target.uid,
            _reason ? { reason: _reason } : {});
          _res.innerHTML =
            '<div style="color:#aaffcc;font-weight:700;">✅ 已成功寄送污染檢查提醒</div>'
            + '<div style="font-size:12px;color:#ccc;margin-top:4px;">'
            + 'email: <code style="color:#ffcc66;">' + _target.email + '</code><br>'
            + 'uid: <code style="color:#88ccff;">' + _target.uid + '</code><br>'
            + '信號 ts: <code style="color:#bbb;">' + new Date(_r.signal.ts).toLocaleString('zh-TW') + '</code><br>'
            + '<br>📣 <b>請告知學生:</b>下次開遊戲(或重新整理頁面)就會看到對比視窗,讓他自己選。<br>'
            + '<span style="color:#ffcc99;">💡 學生選擇後,接下來 24 小時內「解鎖英雄倒退」自動 BUG 回報會 mute。</span>'
            + '</div>';
        }catch(e){
          _res.innerHTML = '<span style="color:#ff6666;">❌ 寄送失敗:' + (e.code || e.message || e) + '</span>';
        }
      };
    }

    // ─── 按鈕:👀 預覽學生會看到的視窗 ───
    const _btnPreview = document.getElementById('_admin-pc-preview');
    if(_btnPreview){
      _btnPreview.onclick = async () => {
        if(typeof window._showDataCompareDialog !== 'function'){
          alert('_showDataCompareDialog 未載入');
          return;
        }
        const _reasonInput = document.getElementById('_admin-pc-reason');
        const _reason = (_reasonInput.value || '').trim() || '老師偵測到帳號可能被共用平板殘留污染';
        // 假資料示範
        const _fakeLeft = {
          sourceLabel: '🟡 你現在看到的(本地)',
          unlockedCount: 11, maxHeroLv: 18, totalHeroLv: 141,
          knowledgeCoins: 118259, treasures: [],
        };
        const _fakeRight = {
          sourceLabel: '☁️ 雲端最後資料',
          unlockedCount: 19, maxHeroLv: 20, totalHeroLv: 122,
          knowledgeCoins: 132245, treasures: [],
        };
        await window._showDataCompareDialog({
          title: '📢 [預覽] 老師提醒你檢查進度',
          subtitle: _reason,
          leftLabel: '🟡 你現在看到的(本地)',
          leftData: _fakeLeft,
          rightLabel: '☁️ 雲端最後資料',
          rightData: _fakeRight,
          confirmText: '✅ 用雲端資料覆蓋我目前的進度',
          cancelText: '📵 保留我目前的進度不動',
          extraNote:
            '<b style="color:#ffd699;">👀 請仔細看左右兩邊的差異!</b><br>' +
            '<span style="color:#ccc;">老師寄這個提醒是因為偵測到你的帳號可能不小心混到別人在共用平板上的資料。<br>' +
            '<b style="color:#aaffcc;">如果右邊「雲端最後資料」看起來才像你真正的進度</b>(英雄比較多、等級比較高)→ 按「✅ 用雲端覆蓋」<br>' +
            '<b style="color:#ffcc99;">如果左邊「本地」才是你真正的進度</b>(雲端可能是別人的)→ 按「📵 保留本地」<br>' +
            '<span style="color:#ff9999;">⚠ [預覽模式] 這是給老師看的範例,實際傳給學生的視窗一樣長這個樣子,但兩邊會是學生真實的資料</span></span>'
        });
      };
    }

    console.log('[3.8 污染檢查提醒工具 v3.5.72] JS 邏輯已掛載');
  })();

  // ★★★ 4. 測試工具:批次設定數值 ★★★
  document.getElementById('_admin-test-apply').onclick = async () => {
    const btn = document.getElementById('_admin-test-apply');
    const res = document.getElementById('_admin-test-result');
    const _readNum = (id) => {
      const v = (document.getElementById(id).value || '').trim();
      if(v === '') return null;
      const n = parseInt(v, 10);
      return isNaN(n) ? null : n;
    };
    const heroLv     = _readNum('_admin-test-hero-lv');
    const coins      = _readNum('_admin-test-coins');
    const skillBook  = _readNum('_admin-test-skill-book');
    const burstFruit = _readNum('_admin-test-burst-fruit');
    const skillReset = _readNum('_admin-test-skill-reset');
    const burstReset = _readNum('_admin-test-burst-reset');

    const tasks = [];
    if(heroLv     !== null) tasks.push('所有英雄等級 = ' + Math.max(1, Math.min(50, heroLv)));
    if(coins      !== null) tasks.push('知識幣 = ' + Math.max(0, coins));
    if(skillBook  !== null) tasks.push('技能升級書 = ' + Math.max(0, Math.min(99, skillBook)));
    if(burstFruit !== null) tasks.push('極限爆發果實 = ' + Math.max(0, Math.min(99, burstFruit)));
    if(skillReset !== null) tasks.push('技能重置書 = ' + Math.max(0, Math.min(99, skillReset)));
    if(burstReset !== null) tasks.push('極限重置秘藥 = ' + Math.max(0, Math.min(99, burstReset)));

    if(tasks.length === 0){
      res.style.color = '#ff8888';
      res.textContent = '❌ 沒有任何欄位填寫,無事可做';
      return;
    }

    if(!confirm('將進行以下變更：\n\n' + tasks.join('\n') + '\n\n確定執行嗎？')) return;

    btn.disabled = true;
    btn.textContent = '套用中...';
    try {
      // 1) 所有英雄等級(套用至 HERO_DB 全部英雄)
      if(heroLv !== null){
        const lv = Math.max(1, Math.min(50, heroLv));
        if(typeof _heroLevels !== 'object' || !_heroLevels) window._heroLevels = _heroLevels = {};
        // 既有的全部設為 lv
        Object.keys(_heroLevels).forEach(name => { _heroLevels[name] = lv; });
        // HERO_DB 中所有英雄也都加入並設為 lv
        try{
          if(typeof HERO_DB === 'object' && HERO_DB){
            Object.keys(HERO_DB).forEach(name => { _heroLevels[name] = lv; });
          }
        }catch(_){}
        // ★ v1.0.20260428 — 升級後立即補發 Lv10/Lv20 自動解鎖肖像
        try{
          if(typeof _scanAllLvUnlockPortraits === 'function'){
            const _newPortraits = _scanAllLvUnlockPortraits();
            if(_newPortraits > 0){
              console.log('[admin test] 自動解鎖 ' + _newPortraits + ' 個 Lv10/Lv20 肖像');
            }
          }
        }catch(e){ console.warn('[admin test] 補發肖像失敗', e); }
        // ★ v1.0.20260428 — 升級後補發素質點數(每升 1 級 = 1 點)
        try{
          if(!_heroStatPoints || typeof _heroStatPoints !== 'object') window._heroStatPoints = _heroStatPoints = {};
          if(!_heroStatInvested || typeof _heroStatInvested !== 'object') window._heroStatInvested = _heroStatInvested = {};
          let _statHealed = 0;
          Object.keys(_heroLevels).forEach(name => {
            const _lv = _heroLevels[name] || 1;
            if(_lv <= 1) return;
            const _expected = _lv - 1;
            const _inv = _heroStatInvested[name] || {};
            const _investedTotal = (_inv.hp||0) + (_inv.atk||0) + (_inv.sp||0) + (_inv.spd||0);
            const _currFree = _heroStatPoints[name] || 0;
            const _shouldAdd = _expected - _investedTotal - _currFree;
            if(_shouldAdd > 0){
              _heroStatPoints[name] = _currFree + _shouldAdd;
              _statHealed += _shouldAdd;
            }
          });
          if(_statHealed > 0){
            console.log('[admin test] 補發 ' + _statHealed + ' 點素質點數');
          }
        }catch(e){ console.warn('[admin test] 補發素質點數失敗', e); }
      }
      // 2) 知識幣(絕對值)
      if(coins !== null){
        _knowledgeCoins = Math.max(0, coins);
        try{ if(typeof _syncCoinsDisplay === 'function') _syncCoinsDisplay(); }catch(_){}
      }
      // 3) 背包物品(絕對值,0=刪除)
      if(typeof _playerBackpack !== 'object' || !_playerBackpack) window._playerBackpack = _playerBackpack = {};
      const _setBp = (id, n) => {
        const v = Math.max(0, Math.min(99, n));
        if(v === 0) delete _playerBackpack[id];
        else _playerBackpack[id] = v;
      };
      if(skillBook  !== null) _setBp('skill_upgrade_book',  skillBook);
      if(burstFruit !== null) _setBp('burst_upgrade_fruit', burstFruit);
      if(skillReset !== null) _setBp('skill_reset_book',    skillReset);
      if(burstReset !== null) _setBp('burst_reset_potion',  burstReset);

      // 4) 雲端儲存
      if(typeof gameCloudSave === 'function'){
        try{ await gameCloudSave(); }catch(e){ console.warn('[admin test] cloud save failed', e); }
      }

      // 5) 重新渲染 UI(各個函式有就呼叫,沒有就跳過)
      try{ if(typeof _renderBackpackMain === 'function') _renderBackpackMain(); }catch(_){}
      try{ if(typeof _renderHeroPage === 'function') _renderHeroPage(); }catch(_){}
      try{ if(typeof updateUI === 'function') updateUI(); }catch(_){}

      res.style.color = '#88ff88';
      res.innerHTML = '✅ 已套用：' + tasks.map(t => '<br>・' + t).join('')
        + '<br><span style="color:#ffee88;">已即時雲端儲存</span>';
    } catch(e) {
      res.style.color = '#ff6666';
      res.textContent = '❌ 套用失敗：' + (e && e.message || e);
      console.error('[admin test apply]', e);
    } finally {
      btn.disabled = false;
      btn.textContent = '🧪 套用測試數值（並雲端儲存）';
    }
  };

  // ★ v1.0.20260428 — 清除「跨關卡已答對題目」紀錄
  const _clearBtn = document.getElementById('_admin-clear-correct');
  if(_clearBtn){
    _clearBtn.onclick = async () => {
      const _resEl = document.getElementById('_admin-clear-correct-result');
      // 統計目前累積數量
      let _totalSubjects = 0, _totalQuestions = 0;
      try{
        if(_persistentCorrectQuestions && typeof _persistentCorrectQuestions === 'object'){
          Object.keys(_persistentCorrectQuestions).forEach(s => {
            const cnt = Object.keys(_persistentCorrectQuestions[s]||{}).length;
            if(cnt > 0){ _totalSubjects++; _totalQuestions += cnt; }
          });
        }
      }catch(_){}
      if(_totalQuestions === 0){
        _resEl.style.color = '#aaa';
        _resEl.textContent = 'ℹ️ 目前沒有累積任何已答對紀錄,無需清除';
        return;
      }
      if(!confirm('確定清除已答對題目紀錄嗎?\n\n當前共 ' + _totalSubjects + ' 個科目,累積 ' + _totalQuestions + ' 題已答對\n\n清除後下次抽題會從整個題庫重新開始(已答對的題目會再次出現)')) return;
      _clearBtn.disabled = true;
      _clearBtn.textContent = '清除中...';
      try{
        window._persistentCorrectQuestions = _persistentCorrectQuestions = {};
        if(typeof gameCloudSave === 'function'){
          try{ await gameCloudSave(); }catch(e){ console.warn('[admin clear correct] cloud save failed', e); }
        }
        _resEl.style.color = '#88ff88';
        _resEl.textContent = '✅ 已清除 ' + _totalSubjects + ' 個科目共 ' + _totalQuestions + ' 題的答對紀錄,已雲端儲存';
      }catch(e){
        _resEl.style.color = '#ff6666';
        _resEl.textContent = '❌ 清除失敗:' + (e && e.message || e);
      }finally{
        _clearBtn.disabled = false;
        _clearBtn.textContent = '🗑️ 清除已答對題目紀錄';
      }
    };
  }

  // ════════════════════════════════════════════════════════════════
  // ★ v3.5.0 — 下載權限管理區塊綁定
  // ════════════════════════════════════════════════════════════════
  (function _bindDlPermSection(){
    const _listEl = document.getElementById('_admin-dlperm-list');
    const _refreshBtn = document.getElementById('_admin-dlperm-refresh');
    const _onlyPendingCb = document.getElementById('_admin-dlperm-onlypending');
    const _countEl = document.getElementById('_admin-dlperm-count');
    if(!_listEl) return;

    const _esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const _fmtTime = (ms) => {
      if(!ms) return '—';
      try { return new Date(ms).toLocaleString(); } catch(_){ return '—'; }
    };
    const _statusBadge = (status) => {
      const _map = {
        pending:  ['rgba(120,90,30,0.5)', '#ffd066', '⏳ 待審核'],
        approved: ['rgba(30,100,60,0.5)', '#88ffbb', '✅ 已批准'],
        expired:  ['rgba(80,80,80,0.5)',  '#aaaaaa', '⏰ 已過期'],
        revoked:  ['rgba(120,40,40,0.5)', '#ff8888', '🚫 已撤銷'],
      };
      const _m = _map[status] || _map.expired;
      return '<span style="display:inline-block;padding:2px 8px;background:' + _m[0] +
        ';color:' + _m[1] + ';border-radius:6px;font-size:11px;font-weight:700;">' + _m[2] + '</span>';
    };

    const _renderList = (list) => {
      const _onlyPending = _onlyPendingCb && _onlyPendingCb.checked;
      const _filtered = _onlyPending
        ? list.filter(p => p._displayStatus === 'pending')
        : list;
      if(_countEl){
        const _pCount = list.filter(p => p._displayStatus === 'pending').length;
        const _aCount = list.filter(p => p._displayStatus === 'approved').length;
        _countEl.textContent = '待審核 ' + _pCount + ' / 已批准 ' + _aCount + ' / 共 ' + list.length;
      }
      if(_filtered.length === 0){
        _listEl.innerHTML = '<div style="text-align:center;color:#888;padding:20px;font-size:13px;">' +
          (_onlyPending ? '🎉 沒有待審核的申請' : '暫無申請紀錄') + '</div>';
        return;
      }
      const _adminEmail = (window._fbUser && window._fbUser.email) || 'admin';
      let _html = '';
      _filtered.forEach(p => {
        const _remainingTxt = (p._displayStatus === 'approved' && p.expiresAt)
          ? '剩餘 ' + Math.floor((p.expiresAt - Date.now()) / 60000) + ' 分鐘'
          : '';
        _html += '<div style="background:rgba(20,30,40,0.7);border:1px solid rgba(120,180,160,0.3);border-radius:8px;padding:10px 12px;margin-bottom:6px;">' +
          '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px;">' +
            _statusBadge(p._displayStatus) +
            '<span style="font-size:14px;color:#fff;font-weight:700;">' + _esc(_adminLabel(p.email, p.displayName)) + '</span>' +
            '<span style="font-size:12px;color:#aaa;">' + _esc(p.email || '') + '</span>' +
          '</div>' +
          '<div style="font-size:11px;color:#888;margin-bottom:6px;">' +
            'uid: <code style="color:#88ccff;">' + _esc((p.uid || '').slice(0,12)) + '...</code> ' +
            '・申請時間 ' + _fmtTime(p.requestedAt) +
            (p.grantedAt ? '・批准 ' + _fmtTime(p.grantedAt) : '') +
            (p.expiresAt ? '・到期 ' + _fmtTime(p.expiresAt) + (_remainingTxt ? '(' + _remainingTxt + ')' : '') : '') +
          '</div>' +
          '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
            (p._displayStatus !== 'approved' || (p.expiresAt && p.expiresAt < Date.now())
              ? '<button class="_dlperm-approve" data-uid="' + _esc(p.uid) + '" style="padding:5px 12px;font-size:12px;font-weight:700;' +
                'background:rgba(40,120,80,0.5);border:1.5px solid #66cc99;color:#aaffcc;border-radius:6px;cursor:pointer;font-family:inherit;">' +
                '✅ 批准 24 小時</button>'
              : '') +
            (p._displayStatus === 'approved'
              ? '<button class="_dlperm-extend" data-uid="' + _esc(p.uid) + '" style="padding:5px 12px;font-size:12px;font-weight:700;' +
                'background:rgba(60,80,160,0.5);border:1.5px solid #88aaff;color:#ccddff;border-radius:6px;cursor:pointer;font-family:inherit;">' +
                '⏱ 重新核發 24 小時</button>'
              : '') +
            (p._displayStatus === 'approved' || p._displayStatus === 'pending'
              ? '<button class="_dlperm-revoke" data-uid="' + _esc(p.uid) + '" style="padding:5px 12px;font-size:12px;font-weight:700;' +
                'background:rgba(120,40,40,0.5);border:1.5px solid #ff8888;color:#ffcccc;border-radius:6px;cursor:pointer;font-family:inherit;">' +
                '🚫 撤銷</button>'
              : '') +
          '</div>' +
          (p.note ? '<div style="font-size:11px;color:#888;margin-top:4px;font-style:italic;">備註:' + _esc(p.note) + '</div>' : '') +
        '</div>';
      });
      _listEl.innerHTML = _html;

      // 綁定按鈕
      _listEl.querySelectorAll('._dlperm-approve, ._dlperm-extend').forEach(btn => {
        btn.onclick = async function(){
          const _uid = this.dataset.uid;
          this.disabled = true;
          this.textContent = '處理中…';
          try {
            await window._fbGrantDownloadPermission(_uid, _adminEmail, 24, '管理員批准');
            // onSnapshot 會自動刷新
          } catch(e){
            alert('批准失敗:' + (e && e.message || e));
            this.disabled = false;
          }
        };
      });
      _listEl.querySelectorAll('._dlperm-revoke').forEach(btn => {
        btn.onclick = async function(){
          if(!confirm('確定撤銷此玩家的下載權限嗎?')) return;
          const _uid = this.dataset.uid;
          this.disabled = true;
          this.textContent = '處理中…';
          try {
            await window._fbRevokeDownloadPermission(_uid, _adminEmail, '管理員撤銷');
          } catch(e){
            alert('撤銷失敗:' + (e && e.message || e));
            this.disabled = false;
          }
        };
      });
    };

    // 啟動即時監聽
    if(typeof window._fbWatchAllDownloadPermissions === 'function'){
      _adminPanelState.dlpermUnsub = window._fbWatchAllDownloadPermissions((list) => {
        _adminPanelState.dlpermList = list;
        _renderList(list);
      });
    } else {
      // fallback:用一次性讀取
      window._fbListDownloadPermissions().then(list => {
        _adminPanelState.dlpermList = list;
        _renderList(list);
      }).catch(e => {
        _listEl.innerHTML = '<div style="color:#ff8888;padding:14px;">讀取失敗:' + _esc(e.message || e) + '</div>';
      });
    }

    if(_refreshBtn){
      _refreshBtn.onclick = async function(){
        this.disabled = true;
        this.textContent = '讀取中…';
        try {
          const _list = await window._fbListDownloadPermissions();
          _adminPanelState.dlpermList = _list;
          _renderList(_list);
        } catch(e){
          alert('讀取失敗:' + (e && e.message || e));
        } finally {
          this.disabled = false;
          this.textContent = '🔄 立即重新整理';
        }
      };
    }
    if(_onlyPendingCb){
      _onlyPendingCb.onchange = () => _renderList(_adminPanelState.dlpermList);
    }
  })();

  // ════════════════════════════════════════════════════════════════
  // ★ v3.5.0 — 可疑帳號偵測區塊綁定
  // ════════════════════════════════════════════════════════════════
  (function _bindSusSection(){
    const _listEl = document.getElementById('_admin-sus-list');
    const _scanBtn = document.getElementById('_admin-sus-scan');
    const _watchBtn = document.getElementById('_admin-sus-toggle-watch');
    const _statusEl = document.getElementById('_admin-sus-status');
    if(!_listEl) return;

    const _esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const _adminEmail = (window._fbUser && window._fbUser.email) || 'admin';

    const _severityBadge = (sev) => {
      if(sev === 'alert'){
        return '<span style="display:inline-block;padding:2px 8px;background:rgba(150,30,30,0.6);' +
          'color:#ffaaaa;border-radius:6px;font-size:11px;font-weight:800;">🚨 嚴重</span>';
      }
      return '<span style="display:inline-block;padding:2px 8px;background:rgba(120,90,30,0.6);' +
        'color:#ffd066;border-radius:6px;font-size:11px;font-weight:700;">⚠️ 警告</span>';
    };

    const _renderList = (list) => {
      if(_statusEl){
        const _alertN = list.filter(x => x.severity === 'alert' && !x._suspended).length;
        const _warnN = list.filter(x => x.severity === 'warn' && !x._suspended).length;
        const _susN = list.filter(x => x._suspended).length;
        _statusEl.textContent = '嚴重 ' + _alertN + ' / 警告 ' + _warnN + ' / 已停權 ' + _susN;
      }
      if(list.length === 0){
        _listEl.innerHTML = '<div style="text-align:center;color:#88ffbb;padding:20px;font-size:14px;">🎉 目前沒有可疑帳號</div>';
        return;
      }
      let _html = '';
      list.forEach(p => {
        const _ds = p._dataSummary || {};
        _html += '<div style="background:' + (p._suspended ? 'rgba(40,20,20,0.7)' : 'rgba(40,30,30,0.7)') +
          ';border:1.5px solid ' + (p.severity === 'alert' ? 'rgba(255,120,120,0.5)' : 'rgba(255,200,100,0.4)') +
          ';border-radius:8px;padding:10px 12px;margin-bottom:6px;">' +
          '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px;">' +
            _severityBadge(p.severity) +
            (p._suspended ? '<span style="font-size:11px;padding:2px 8px;background:rgba(80,40,80,0.6);color:#ffaaff;border-radius:6px;font-weight:700;">已停權</span>' : '') +
            '<span style="font-size:14px;color:#fff;font-weight:700;">' + _esc(_adminLabel(p.email, p.displayName)) + '</span>' +
            '<span style="font-size:12px;color:#aaa;">' + _esc(p.email || '') + '</span>' +
          '</div>' +
          '<div style="font-size:12px;color:#ddcc99;line-height:1.6;margin-bottom:6px;background:rgba(0,0,0,0.3);padding:6px 8px;border-radius:5px;">' +
            p.reasons.map(r => '• ' + _esc(r)).join('<br>') +
          '</div>' +
          '<div style="font-size:11px;color:#888;margin-bottom:6px;">' +
            'uid: <code style="color:#88ccff;">' + _esc((p.uid || '').slice(0,12)) + '...</code>' +
            (_ds.coins != null ? ' ・知識幣 ' + _ds.coins.toLocaleString() : '') +
            (_ds.maxHeroLv != null ? ' ・最高等級 Lv' + _ds.maxHeroLv : '') +
            (_ds.unlockedCount != null ? ' ・解鎖 ' + _ds.unlockedCount + ' 隻' : '') +
          '</div>' +
          '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
            (p._suspended
              ? '<button class="_sus-unsuspend" data-uid="' + _esc(p.uid) + '" style="padding:5px 12px;font-size:12px;font-weight:700;' +
                'background:rgba(40,120,80,0.5);border:1.5px solid #66cc99;color:#aaffcc;border-radius:6px;cursor:pointer;font-family:inherit;">' +
                '✅ 解除停權</button>'
              : '<button class="_sus-suspend" data-uid="' + _esc(p.uid) + '" data-name="' + _esc(_adminLabel(p.email, p.displayName)) + '" style="padding:5px 12px;font-size:12px;font-weight:700;' +
                'background:rgba(120,40,40,0.5);border:1.5px solid #ff8888;color:#ffcccc;border-radius:6px;cursor:pointer;font-family:inherit;">' +
                '🚫 停權此帳號</button>') +
            '<button class="_sus-inspect" data-uid="' + _esc(p.uid) + '" style="padding:5px 12px;font-size:12px;font-weight:700;' +
              'background:rgba(60,60,100,0.5);border:1.5px solid #8899cc;color:#ccddff;border-radius:6px;cursor:pointer;font-family:inherit;">' +
              '🔍 詳細資料</button>' +
          '</div>' +
        '</div>';
      });
      _listEl.innerHTML = _html;

      _listEl.querySelectorAll('._sus-suspend').forEach(btn => {
        btn.onclick = async function(){
          const _uid = this.dataset.uid;
          const _name = this.dataset.name || _uid;
          const _reason = prompt('確定停權「' + _name + '」嗎?\n停權後此帳號無法登入遊戲。\n\n請輸入停權原因(將顯示給玩家):',
            '帳號資料偵測異常,已暫停存取。請聯絡管理員老師。');
          if(_reason === null) return; // 取消
          this.disabled = true;
          this.textContent = '處理中…';
          try {
            await window._fbSuspendPlayer(_uid, _adminEmail, _reason || '');
          } catch(e){
            alert('停權失敗:' + (e && e.message || e));
            this.disabled = false;
          }
        };
      });
      _listEl.querySelectorAll('._sus-unsuspend').forEach(btn => {
        btn.onclick = async function(){
          const _uid = this.dataset.uid;
          if(!confirm('確定解除此帳號的停權?')) return;
          this.disabled = true;
          this.textContent = '處理中…';
          try {
            await window._fbUnsuspendPlayer(_uid, _adminEmail);
          } catch(e){
            alert('解除失敗:' + (e && e.message || e));
            this.disabled = false;
          }
        };
      });
      _listEl.querySelectorAll('._sus-inspect').forEach(btn => {
        btn.onclick = function(){
          const _uid = this.dataset.uid;
          const _p = list.find(x => x.uid === _uid);
          if(!_p) return;
          alert(
            '【可疑帳號詳細】\n' +
            'uid: ' + _p.uid + '\n' +
            '學生: ' + _adminLabel(_p.email, _p.displayName) + '\n' +
            '信箱: ' + (_p.email || '(無)') + '\n' +
            '嚴重度: ' + (_p.severity === 'alert' ? '嚴重' : '警告') + '\n' +
            '\n偵測原因:\n' + _p.reasons.map(r => '・' + r).join('\n') +
            '\n\n資料摘要:\n' + JSON.stringify(_p._dataSummary, null, 2) +
            (_p.details && _p.details.deltas ? '\n\n短時間變化量:\n' + JSON.stringify(_p.details.deltas, null, 2) : '') +
            (_p.details && _p.details.overInvested ? '\n\n超量投資英雄:\n' + _p.details.overInvested.join('\n') : '')
          );
        };
      });
    };

    if(_scanBtn){
      _scanBtn.onclick = async function(){
        this.disabled = true;
        this.textContent = '掃描中…';
        _listEl.innerHTML = '<div style="text-align:center;color:#aaa;padding:20px;font-size:13px;">⏳ 正在掃描全部玩家…</div>';
        try {
          const _list = await window._fbScanSuspiciousPlayers();
          _adminPanelState.susList = _list;
          _renderList(_list);
        } catch(e){
          _listEl.innerHTML = '<div style="color:#ff8888;padding:14px;">掃描失敗:' + _esc(e.message || e) + '</div>';
        } finally {
          this.disabled = false;
          this.textContent = '🔍 全玩家批次掃描';
        }
      };
    }

    if(_watchBtn){
      _watchBtn.onclick = function(){
        if(_adminPanelState.susUnsub){
          // 已啟用 → 關閉
          try { _adminPanelState.susUnsub(); } catch(_){}
          _adminPanelState.susUnsub = null;
          this.textContent = '📡 啟用即時監聽';
          this.style.background = 'rgba(80,40,120,0.5)';
          if(_statusEl) _statusEl.textContent += ' ・ 監聽已停';
          return;
        }
        // 啟用
        this.textContent = '⏸ 停止即時監聽';
        this.style.background = 'rgba(120,80,160,0.7)';
        if(typeof window._fbWatchAllPlayersForSuspicious === 'function'){
          _adminPanelState.susUnsub = window._fbWatchAllPlayersForSuspicious((list, err) => {
            if(err){
              _listEl.innerHTML = '<div style="color:#ff8888;padding:14px;">即時監聽錯誤:' + _esc(err.message || err) + '<br>(可能是 Firestore 規則未允許 list/players)</div>';
              return;
            }
            _adminPanelState.susList = list;
            _renderList(list);
          });
        }
      };
    }
  })();

  // ════════════════════════════════════════════════════════════════
  // ★ v3.11.34(2026-05-29) — 異常解鎖偵測區塊綁定
  //   完整 flow:掃描 → 列表 → 勾選清除 → 補償+通知 → 停權
  //   ⚠ 階段 4 會升級「同 battleId 多解鎖」精準偵測(目前已先把資料抓出來標紅)
  // ════════════════════════════════════════════════════════════════
  (function _bindAbnormalUnlockSection(){
    const _listEl = document.getElementById('_admin-abnormal-list');
    const _statusEl = document.getElementById('_admin-abnormal-status');
    const _scanBtn = document.getElementById('_admin-abnormal-scan');
    const _windowSel = document.getElementById('_admin-abnormal-window');
    const _thresholdSel = document.getElementById('_admin-abnormal-threshold');
    if(!_listEl || !_scanBtn) return;

    const _esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const _fmtTime = (ts) => {
      if(!ts) return '?';
      try{
        const d = new Date(ts);
        const pad = n => String(n).padStart(2,'0');
        return `${d.getMonth()+1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }catch(_){ return '?'; }
    };
    const _adminLabel = (window._adminLabel || function(em,nm){ return (nm||em||'?'); });

    let _lastResult = null;  // 暫存最近一次掃描結果

    // 渲染玩家卡片
    function _renderPlayerCard(player){
      const heroRows = (player.heroes || []).map((h, idx) => {
        const _isMulti = player.multiBattleHeroSet && player.multiBattleHeroSet.has(h.name);
        return `<label style="display:flex;align-items:center;gap:8px;padding:4px 6px;font-size:12px;color:#e8c8d8;background:${_isMulti ? 'rgba(180,40,80,0.18)' : 'rgba(0,0,0,0.2)'};border-radius:4px;margin-bottom:2px;cursor:pointer;">
          <input type="checkbox" class="_abn-hero-cb" data-name="${_esc(h.name)}" ${_isMulti ? 'checked' : ''}>
          <span style="min-width:90px;color:${_isMulti ? '#ff99bb' : '#fff'};font-weight:${_isMulti ? '700' : '500'};">${_esc(h.name)}</span>
          <span style="color:#aaa;font-size:11px;">${_fmtTime(h.at)}</span>
          <span style="color:#888;font-size:11px;">${_esc(h.source)}</span>
          ${h.battleId ? `<span style="color:#777;font-size:10px;" title="battleId">${_esc(String(h.battleId).slice(-12))}</span>` : ''}
        </label>`;
      }).join('');

      const treasureRows = (player.treasures || []).map(t => {
        const _isMulti = player.multiBattleTreasureSet && player.multiBattleTreasureSet.has(t.id);
        return `<label style="display:flex;align-items:center;gap:8px;padding:4px 6px;font-size:12px;color:#e8c8d8;background:${_isMulti ? 'rgba(180,40,80,0.18)' : 'rgba(0,0,0,0.2)'};border-radius:4px;margin-bottom:2px;cursor:pointer;">
          <input type="checkbox" class="_abn-tr-cb" data-id="${_esc(t.id)}" ${_isMulti ? 'checked' : ''}>
          <span style="min-width:90px;color:${_isMulti ? '#ff99bb' : '#fff'};">${_esc(t.id)}</span>
          <span style="color:#aaa;font-size:11px;">${_fmtTime(t.at)}</span>
          <span style="color:#888;font-size:11px;">${_esc(t.source)}</span>
          ${t.battleId ? `<span style="color:#777;font-size:10px;">${_esc(String(t.battleId).slice(-12))}</span>` : ''}
        </label>`;
      }).join('');

      const multiBattleNote = (player.multiBattleEntries && player.multiBattleEntries.length > 0)
        ? `<div style="margin-top:6px;padding:8px 10px;background:rgba(180,40,80,0.25);border-left:3px solid #ff5577;border-radius:4px;font-size:11px;color:#ffcccc;">
            🚨 同場戰鬥多解鎖(鐵證異常):${player.multiBattleEntries.map(b =>
              `battleId=${_esc(String(b.battleId).slice(-12))} 同場 ${b.count} 個`).join(' / ')}
          </div>` : '';

      return `<div class="_abn-player-card" data-uid="${_esc(player.uid)}" style="background:rgba(40,15,40,0.6);border:1.5px solid rgba(255,140,180,0.4);border-radius:8px;padding:10px 12px;margin-bottom:8px;">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px;">
          <span style="font-size:13px;font-weight:800;color:#fff;">${_esc(_adminLabel(player.email, player.displayName))}</span>
          <span style="font-size:11px;color:#aaa;">${_esc(player.email || '?')}</span>
          <span style="font-size:11px;color:#888;">uid: <code style="color:#88ccff;">${_esc((player.uid||'').slice(0,12))}...</code></span>
          <span style="margin-left:auto;font-size:12px;padding:2px 8px;background:rgba(180,40,80,0.55);border-radius:5px;color:#ffe;font-weight:700;">
            英雄 ${player.heroes ? player.heroes.length : 0} / 至寶 ${player.treasures ? player.treasures.length : 0}
          </span>
        </div>
        ${multiBattleNote}
        ${player.heroes && player.heroes.length ? `<div style="margin-top:6px;font-size:11px;color:#ccaadd;font-weight:700;">▼ 異常英雄(預設勾選同場多解鎖):</div>${heroRows}` : ''}
        ${player.treasures && player.treasures.length ? `<div style="margin-top:6px;font-size:11px;color:#ccaadd;font-weight:700;">▼ 異常至寶(預設勾選同場多解鎖):</div>${treasureRows}` : ''}
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;">
          <button class="_abn-clear-btn" data-uid="${_esc(player.uid)}" style="padding:5px 12px;font-size:12px;font-weight:700;background:rgba(120,40,40,0.5);border:1.5px solid #ff8888;color:#ffcccc;border-radius:6px;cursor:pointer;font-family:inherit;">🗑 清除勾選</button>
          <button class="_abn-notify-btn" data-uid="${_esc(player.uid)}" data-email="${_esc(player.email || '')}" style="padding:5px 12px;font-size:12px;font-weight:700;background:rgba(40,80,120,0.5);border:1.5px solid #88aaff;color:#aaccff;border-radius:6px;cursor:pointer;font-family:inherit;">💌 告知+補償</button>
          <button class="_abn-suspend-btn" data-uid="${_esc(player.uid)}" data-name="${_esc(_adminLabel(player.email, player.displayName))}" style="padding:5px 12px;font-size:12px;font-weight:700;background:rgba(80,40,80,0.5);border:1.5px solid #ff66ff;color:#ffaaff;border-radius:6px;cursor:pointer;font-family:inherit;">🚫 停權帳號</button>
          <button class="_abn-detail-btn" data-uid="${_esc(player.uid)}" style="padding:5px 12px;font-size:12px;font-weight:700;background:rgba(60,60,100,0.5);border:1.5px solid #8899cc;color:#ccddff;border-radius:6px;cursor:pointer;font-family:inherit;">🔍 完整活動記錄</button>
        </div>
      </div>`;
    }

    // 套合併:同玩家英雄+至寶異常合併成一張卡
    function _mergePlayerResults(heroResult, treasureResult){
      const _map = {};
      (heroResult.abnormal || []).forEach(p => {
        _map[p.uid] = {
          uid: p.uid, email: p.email, displayName: p.displayName,
          heroes: p.heroes || [], treasures: [],
          multiBattleEntries: (p.multiPerBattle || []).map(b => ({ battleId: b.battleId, count: b.count })),
        };
        // 同場多解鎖的英雄名 → Set
        const _multiSet = new Set();
        (p.multiPerBattle || []).forEach(b => (b.heroes || []).forEach(n => _multiSet.add(n)));
        _map[p.uid].multiBattleHeroSet = _multiSet;
      });
      (treasureResult.abnormal || []).forEach(p => {
        if(!_map[p.uid]){
          _map[p.uid] = {
            uid: p.uid, email: p.email, displayName: p.displayName,
            heroes: [], treasures: p.treasures || [],
            multiBattleEntries: (p.multiPerBattle || []).map(b => ({ battleId: b.battleId, count: b.count })),
            multiBattleHeroSet: new Set(),
          };
        } else {
          _map[p.uid].treasures = p.treasures || [];
          (p.multiPerBattle || []).forEach(b =>
            _map[p.uid].multiBattleEntries.push({ battleId: b.battleId, count: b.count }));
        }
        const _multiTSet = new Set();
        (p.multiPerBattle || []).forEach(b => (b.treasures || []).forEach(n => _multiTSet.add(n)));
        _map[p.uid].multiBattleTreasureSet = _multiTSet;
      });
      // 依異常數排序
      return Object.values(_map).sort((a, b) =>
        (b.heroes.length + b.treasures.length) - (a.heroes.length + a.treasures.length));
    }

    // 掃描按鈕
    _scanBtn.onclick = async function(){
      _scanBtn.disabled = true;
      _scanBtn.textContent = '⏳ 掃描中...';
      _statusEl.textContent = '正在掃描全玩家解鎖紀錄...';
      _listEl.innerHTML = '<div style="text-align:center;color:#aaa;padding:20px;">📡 掃描中,請稍候...</div>';
      try{
        const windowMs = parseInt(_windowSel.value, 10);
        const threshold = parseInt(_thresholdSel.value, 10);
        if(!window._fbAdminScanAbnormalUnlocks || !window._fbAdminScanAbnormalTreasures){
          _listEl.innerHTML = '<div style="text-align:center;color:#ff8888;padding:20px;">❌ API 未載入,請重新整理</div>';
          _statusEl.textContent = '';
          return;
        }
        const [heroResult, treasureResult] = await Promise.all([
          window._fbAdminScanAbnormalUnlocks(windowMs, threshold),
          window._fbAdminScanAbnormalTreasures(windowMs, Math.max(2, Math.floor(threshold * 0.6))),  // 至寶門檻較低
        ]);
        const merged = _mergePlayerResults(heroResult, treasureResult);
        _lastResult = { merged, heroResult, treasureResult };

        if(merged.length === 0){
          _listEl.innerHTML = '<div style="text-align:center;color:#88ffbb;padding:20px;">🎉 沒有偵測到異常解鎖玩家</div>';
          _statusEl.textContent = '掃描完成:全部正常';
        } else {
          _listEl.innerHTML = merged.map(_renderPlayerCard).join('');
          const _multiCount = merged.filter(p => p.multiBattleEntries.length > 0).length;
          _statusEl.textContent = `掃描完成:${merged.length} 位異常玩家(其中 ${_multiCount} 位有「同場戰鬥多解鎖」鐵證)`;
        }
        _attachCardEvents();
      }catch(e){
        console.error('[異常解鎖偵測] 掃描失敗', e);
        _listEl.innerHTML = '<div style="text-align:center;color:#ff8888;padding:20px;">❌ 掃描失敗:' + _esc(e && e.message) + '</div>';
        _statusEl.textContent = '';
      }finally{
        _scanBtn.disabled = false;
        _scanBtn.textContent = '🔍 立即掃描';
      }
    };

    // 卡片事件
    function _attachCardEvents(){
      // 清除勾選
      _listEl.querySelectorAll('._abn-clear-btn').forEach(btn => {
        btn.onclick = async function(){
          const uid = btn.dataset.uid;
          const card = btn.closest('._abn-player-card');
          if(!card) return;
          const heroes = Array.from(card.querySelectorAll('._abn-hero-cb:checked')).map(cb => cb.dataset.name);
          const treasures = Array.from(card.querySelectorAll('._abn-tr-cb:checked')).map(cb => cb.dataset.id);
          if(heroes.length === 0 && treasures.length === 0){ alert('請先勾選要清除的項目'); return; }
          const _summary = (heroes.length ? '英雄 ' + heroes.length + ' 隻(' + heroes.slice(0,3).join('、') + (heroes.length > 3 ? '...' : '') + ')' : '')
            + (heroes.length && treasures.length ? '、' : '')
            + (treasures.length ? '至寶 ' + treasures.length + ' 件' : '');
          if(!confirm('確定要清除以下異常項目?\n\n' + _summary + '\n\n此操作會寫入 audit log,玩家本地下次登入會被雲端覆蓋。')) return;

          btn.disabled = true;
          btn.textContent = '⏳ 清除中...';
          let _okHero = 0, _okTreasure = 0, _failed = [];
          for(const h of heroes){
            try{ await window._fbAdminDeleteUnlockedHero(uid, h, { reason: '異常解鎖清除' }); _okHero++; }
            catch(e){ _failed.push('英雄 ' + h + ':' + (e.message || e)); }
          }
          for(const t of treasures){
            try{ await window._fbAdminDeleteTreasure(uid, t, { reason: '異常獲取清除' }); _okTreasure++; }
            catch(e){ _failed.push('至寶 ' + t + ':' + (e.message || e)); }
          }
          btn.disabled = false;
          btn.textContent = '🗑 清除勾選';
          alert('清除完成:\n英雄 ' + _okHero + '/' + heroes.length + '\n至寶 ' + _okTreasure + '/' + treasures.length
            + (_failed.length ? '\n\n失敗:\n' + _failed.join('\n') : ''));
        };
      });

      // 告知+補償(打開補償工具自動填好對象)
      _listEl.querySelectorAll('._abn-notify-btn').forEach(btn => {
        btn.onclick = function(){
          const uid = btn.dataset.uid;
          const email = btn.dataset.email;
          // 開補償 modal:直接跳到「玩家補償工具」並自動填好 uid
          const _compEmail = document.getElementById('_admin-comp-email');
          const _compUid = document.getElementById('_admin-comp-uid');
          if(_compEmail) _compEmail.value = email || '';
          if(_compUid) _compUid.value = uid || '';
          // 滾動到補償區段,展開 sidebar
          const _compSec = document.getElementById('_admin-comp-section');
          if(_compSec){
            _compSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // 提示:還要記得發通知!
            setTimeout(() => alert('已自動填好補償對象 ' + (email || uid) + '。\n\n填好補償內容後送出,然後請手動執行:\n\nwindow._fbAdminSendNotificationToPlayer("' + uid + '", {\n  title: "管理員通知",\n  body: "你的帳號因發現異常解鎖被清除部分項目,已補償...",\n  type: "compensation"\n})\n\n(階段 4 會自動串接此通知)'), 500);
          } else {
            alert('找不到補償工具區段。請手動發送通知:\nwindow._fbAdminSendNotificationToPlayer("' + uid + '", {...})');
          }
        };
      });

      // 停權
      _listEl.querySelectorAll('._abn-suspend-btn').forEach(btn => {
        btn.onclick = async function(){
          const uid = btn.dataset.uid;
          const name = btn.dataset.name;
          const reason = prompt('停權「' + name + '」(' + uid.slice(0,12) + '...) 的原因?', '異常解鎖大量稀有英雄/至寶');
          if(!reason) return;
          if(!confirm('確定停權「' + name + '」?\n原因:' + reason)) return;
          if(!window._fbSuspendPlayer){ alert('停權 API 未載入'); return; }
          btn.disabled = true;
          btn.textContent = '⏳ 停權中...';
          try{
            const _adminEm = (window._fbUser && window._fbUser.email) || 'admin';
            await window._fbSuspendPlayer(uid, _adminEm, reason);
            btn.textContent = '✅ 已停權';
            btn.style.opacity = '0.6';
          }catch(e){
            alert('停權失敗:' + (e.message || e));
            btn.disabled = false;
            btn.textContent = '🚫 停權帳號';
          }
        };
      });

      // 完整活動記錄(階段 4 才完整實作,目前提示)
      _listEl.querySelectorAll('._abn-detail-btn').forEach(btn => {
        btn.onclick = function(){
          const uid = btn.dataset.uid;
          alert('🚧 完整活動記錄查詢功能將於下一階段(v3.11.35)上線。\n\n目前可用 console 查:\n' +
            '\nconst snap = await window._fbAdminFindPlayerByEmail("玩家 email");\n' +
            'console.log(snap.data);  // 完整玩家資料\n' +
            'console.log(snap.data._heroUnlockHistory);  // 英雄解鎖歷史\n' +
            'console.log(snap.data._treasureUnlockHistory);  // 至寶解鎖歷史\n\n' +
            '此玩家 uid: ' + uid);
        };
      });
    }
  })();

  // ════════════════════════════════════════════════════════════════
  // ★ v3.11.35 階段 4c(2026-05-29) — 玩家活動記錄查詢
  //   輸入 email / uid 查看完整活動(英雄/至寶/戰鬥/幣帳),逐筆可刪。
  //   ⚠ 新規則:同 battleId 多解鎖 = 異常,卡片頂部紅框警示。
  // ════════════════════════════════════════════════════════════════
  (function _bindActivitySection(){
    const _queryInput = document.getElementById('_admin-activity-query');
    const _searchBtn  = document.getElementById('_admin-activity-search');
    const _scanBtn    = document.getElementById('_admin-activity-scan-anomaly');
    const _statusEl   = document.getElementById('_admin-activity-status');
    const _playerCard = document.getElementById('_admin-activity-player-card');
    const _tabsEl     = document.getElementById('_admin-activity-tabs');
    const _contentEl  = document.getElementById('_admin-activity-content');
    if(!_queryInput || !_searchBtn || !_contentEl) return;

    const _esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const _fmtTime = (ts) => {
      if(!ts) return '—';
      try{
        const d = new Date(ts);
        const pad = n => String(n).padStart(2,'0');
        return `${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }catch(_){ return '?'; }
    };
    // ★ v3.11.35h — 用 _formatBattleId 解析回人類可讀,新格式自動顯示「BOSS 名 #序號 (月/日 時:分)」
    //   老格式 fallback 顯示後 12 字
    const _shortBid = (b) => {
      if(!b) return '—';
      if(typeof window._formatBattleId === 'function'){
        try{ return window._formatBattleId(b); }catch(_){}
      }
      const s = String(b);
      return s.length > 16 ? s.slice(-16) : s;
    };

    // 當前查詢結果(供 tab 切換 / 刪除後重新渲染)
    let _curData = null;
    let _curUid = null;
    let _curTab = 'hero';
    // ★ v3.13.68 — 異常清單導航狀態(讓玩家詳情頁可「返回清單/上一位/下一位」,不必重掃 Firebase)
    let _anomalyCtx = null;    // { result, handled, opts } — 最後一次掃描/快取的完整結果(供返回清單純記憶體重繪)
    let _anomalyOrder = [];    // 異常 uid 依清單順序 [uid0, uid1, ...]
    let _curAnomalyIdx = -1;   // 當前查看玩家在 _anomalyOrder 的索引(-1 = 非來自清單,不顯示導航條)
    let _navSkipHandled = false; // 「下一位/上一位」是否只跳未處理(與清單「只看未處理」連動)

    function _setStatus(msg, color){
      if(_statusEl){
        _statusEl.textContent = msg || '';
        _statusEl.style.color = color || '#aaa';
      }
    }

    // ── 判斷輸入類型:email / uid / 姓名 ──
    //   email:含 @
    //   uid:不含 @ 且 長度 >= 20 全 ASCII 英數(Firebase Auth uid 通常 28 字元)
    //   其他:視為姓名
    function _detectInputType(s){
      const _s = String(s || '').trim();
      if(!_s) return null;
      if(_s.includes('@')) return 'email';
      // uid 啟發式:純英數 + dash,長度 >= 20
      if(/^[A-Za-z0-9-]{20,}$/.test(_s)) return 'uid';
      return 'name';
    }

    // ── 解析輸入 → uid ──
    //   姓名命中多筆時,throw 特殊 error 物件 { _multi: true, candidates: [] }
    async function _resolveUid(input){
      const s = String(input || '').trim();
      if(!s) throw new Error('請輸入 email / uid / 姓名');
      const _type = _detectInputType(s);
      if(_type === 'email'){
        if(typeof window._fbAdminFindPlayerByEmail !== 'function'){
          throw new Error('_fbAdminFindPlayerByEmail 未載入');
        }
        const _find = await window._fbAdminFindPlayerByEmail(s);
        if(!_find || !_find.uid) throw new Error('找不到此 email 對應的玩家');
        return _find.uid;
      }
      if(_type === 'uid'){
        return s;
      }
      // ── 姓名路徑 ──
      if(typeof window._fbAdminFindPlayersByName !== 'function'){
        throw new Error('_fbAdminFindPlayersByName 未載入,請重新整理');
      }
      const _r = await window._fbAdminFindPlayersByName(s);
      const _players = (_r && _r.players) || [];
      if(!_players.length) throw new Error('找不到姓名包含「' + s + '」的玩家');
      if(_players.length === 1){
        // 唯一命中,直接用
        return _players[0].uid;
      }
      // 多筆候選 — 用特殊 error 傳出來,讓 _doQuery 渲染選單
      const _err = new Error('多筆候選');
      _err._multi = true;
      _err.candidates = _players;
      _err.truncated = !!_r.truncated;
      _err.totalCount = _r.count;
      _err.scanned = _r.scanned || 0;
      throw _err;
    }

    // ── 主查詢 ──
    async function _doQuery(){
      const _input = (_queryInput.value || '').trim();
      if(!_input){ _setStatus('請先輸入 email 或 uid', '#ffaa66'); return; }
      _setStatus('查詢中...', '#aaccff');
      _searchBtn.disabled = true;
      try{
        const uid = await _resolveUid(_input);
        _curUid = uid;
        if(typeof window._fbAdminQueryPlayerActivity !== 'function'){
          throw new Error('_fbAdminQueryPlayerActivity 未載入,請重新整理');
        }
        const _r = await window._fbAdminQueryPlayerActivity(uid);
        _curData = _r;
        _renderPlayerCard(_r);
        _showTabs();
        _switchTab(_curTab);
        _setStatus(`✅ 查詢完成 — uid=${uid}`, '#88ddaa');
      }catch(e){
        // ── 姓名多筆候選 → 列出候選讓老師點選 ──
        if(e && e._multi && Array.isArray(e.candidates)){
          if(_playerCard) _playerCard.style.display = 'none';
          if(_tabsEl) _tabsEl.style.display = 'none';
          _renderCandidateList(e.candidates, e);
          _setStatus(`找到 ${e.totalCount} 位同/類似姓名玩家,請點選`
            + (e.truncated ? `(僅顯示前 ${e.candidates.length} 位)` : ''),
            '#ffcc66');
          return;
        }
        _setStatus('❌ ' + (e.message || e), '#ff8866');
        if(_playerCard) _playerCard.style.display = 'none';
        if(_tabsEl) _tabsEl.style.display = 'none';
        _contentEl.innerHTML = `<div style="text-align:center;color:#888;padding:20px;font-size:13px;">${_esc(e.message || e)}</div>`;
      }finally{
        _searchBtn.disabled = false;
      }
    }

    // ── 候選清單(姓名命中多筆時) ──
    function _renderCandidateList(candidates, info){
      const _typeLabel = {
        exact: '完全相符',
        contains: '名稱包含',
        no_prefix_contains: '去座號後包含',
        reverse_contains: '輸入較長',
        no_prefix_reverse: '去座號反向',
      };
      const _rows = candidates.map((p, i) => {
        const _tl = _typeLabel[p.matchType] || p.matchType || '';
        return `<div class="_aa-candidate" data-uid="${_esc(p.uid)}" style="
          display:flex;justify-content:space-between;align-items:center;
          padding:10px 14px;margin:4px 0;
          background:rgba(60,80,140,0.25);border:1px solid rgba(140,180,255,0.3);
          border-radius:6px;cursor:pointer;transition:background 0.15s;"
          onmouseover="this.style.background='rgba(80,120,200,0.4)';"
          onmouseout="this.style.background='rgba(60,80,140,0.25)';">
          <div style="flex:1;min-width:0;">
            <div style="font-size:14px;font-weight:700;color:#ffe;">
              <span style="color:#aac;font-size:11px;margin-right:6px;">${i + 1}.</span>
              ${_esc(p.name || '(無姓名)')}
            </div>
            <div style="font-size:11px;color:#aac;margin-top:2px;">
              ${_esc(p.email || '(無 email)')}
              <span style="color:#778;margin-left:8px;font-family:monospace;">uid: ${_esc(String(p.uid).slice(0, 16))}…</span>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:14px;font-size:11px;">
            <span style="color:#aac;">🦸 ${p.unlockedCount || 0}</span>
            <span style="color:#ffdd66;">💰 ${p.knowledgeCoins || 0}</span>
            <span style="color:#88aaff;font-size:10px;background:rgba(80,120,200,0.3);padding:2px 8px;border-radius:10px;">${_esc(_tl)}</span>
            <span style="color:#ffe;font-size:14px;">→</span>
          </div>
        </div>`;
      }).join('');
      const _hint = (info && info.scanned)
        ? `<div style="font-size:11px;color:#778;padding:6px 4px;">(從 ${info.scanned} 位玩家中找到)</div>`
        : '';
      _contentEl.innerHTML = `
        <div style="margin-bottom:8px;font-size:13px;color:#ffcc88;font-weight:700;">
          👇 點選要查詢的玩家
        </div>
        ${_hint}
        ${_rows}
      `;
      // 綁定點擊
      _contentEl.querySelectorAll('._aa-candidate').forEach(el => {
        el.onclick = async function(){
          const _uid = el.dataset.uid;
          if(!_uid) return;
          _curAnomalyIdx = -1;  // ★ v3.13.68 姓名候選點選不算清單導航
          // 把 uid 填回 input,然後重跑 _doQuery
          _queryInput.value = _uid;
          await _doQuery();
        };
      });
    }

    // ── BOSS 來源白名單(與 index.html _analyzeBattleAnomalySingle 同步) ──
    const BOSS_SOURCES = new Set([
      'darkorb_5pct', 'japan_boss_5pct', 'maokong_50pct', 'yamata_miko_5pct',
      'taiwan_clear', 'japan_clear', 'boss_drop',
    ]);
    const _isBossSource = (s) => !s || BOSS_SOURCES.has(s);
    const TIME_WINDOW_MS = 3 * 60 * 1000;  // 3 分鐘(v3.11.35g 從 1 分鐘擴大,老師指示)
    const TIME_HERO_THRESHOLD = 2;      // > 2 隻 = 異常(3 隻起)
    const TIME_TRE_THRESHOLD = 2;

    // ── 共用 helper:算時間窗異常 cluster ──
    function _findTimeClustersLocal(entries, threshold, idField){
      const _boss = (entries || [])
        .filter(e => e && e.source !== 'admin_delete' && e.source !== 'admin_grant'
                  && _isBossSource(e.source) && e.at)
        .sort((a,b) => (a.at || 0) - (b.at || 0));
      const _clusters = [];
      const _consumed = new Set();
      for(let i = 0; i < _boss.length; i++){
        const _seed = _boss[i];
        const _key0 = _seed.at + '|' + (_seed[idField] || '');
        if(_consumed.has(_key0)) continue;
        const _window = [];
        for(let j = i; j < _boss.length; j++){
          const _e = _boss[j];
          if((_e.at || 0) - (_seed.at || 0) > TIME_WINDOW_MS) break;
          _window.push(_e);
        }
        if(_window.length > threshold){
          _clusters.push({
            startAt: _seed.at,
            endAt: _window[_window.length - 1].at,
            durationMs: _window[_window.length - 1].at - _seed.at,
            entries: _window,
            count: _window.length,
          });
          _window.forEach(_e => _consumed.add(_e.at + '|' + (_e[idField] || '')));
        }
      }
      return _clusters;
    }

    // ── 共用:把時間窗 cluster 內的 entry key 都收進 Set,用來在表格標紅 ──
    function _buildTimeClusterKeySet(clusters, idField){
      const _set = new Set();
      (clusters || []).forEach(c => {
        (c.entries || []).forEach(e => {
          _set.add((e.at || 0) + '|' + (e[idField] || ''));
        });
      });
      return _set;
    }

    // ★ v3.13.68 — 返回異常清單(純記憶體重繪,零 Firebase 讀取)
    function _backToAnomalyList(){
      if(!_anomalyCtx){ _setStatus('沒有可返回的清單,請先按「⚡ 掃描異常」', '#ffaa66'); return; }
      _curAnomalyIdx = -1;
      if(_playerCard) _playerCard.style.display = 'none';
      if(_tabsEl) _tabsEl.style.display = 'none';
      _renderAnomalyCards(_anomalyCtx.result, _anomalyCtx.handled, _anomalyCtx.opts);
    }
    // ★ v3.13.68 — 跳到清單上/下一位(offset=±1);skipHandled=true 時略過已處理者
    async function _gotoAnomalyByOffset(offset, skipHandled){
      if(!_anomalyOrder.length){ _setStatus('清單為空', '#ffaa66'); return; }
      let idx = _curAnomalyIdx;
      for(let step = 0; step < _anomalyOrder.length; step++){
        idx += offset;
        if(idx < 0 || idx >= _anomalyOrder.length){
          _setStatus(offset > 0 ? '已經是最後一位了' : '已經是第一位了', '#ffaa66');
          return;
        }
        const uid = _anomalyOrder[idx];
        if(skipHandled && _anomalyCtx && _anomalyCtx.handled && _anomalyCtx.handled[uid]) continue; // 略過已處理
        _curAnomalyIdx = idx;
        _queryInput.value = uid;
        await _doQuery();
        return;
      }
      _setStatus('沒有更多未處理的玩家了', '#ffaa66');
    }

    function _renderPlayerCard(r){
      if(!_playerCard || !r) return;
      const p = r.player || {};
      _playerCard.style.display = 'block';
      // ── 算規則 1:battleId 衝突 ──
      const heroByBid = {}; const treByBid = {};
      (r.heroUnlockHistory || []).forEach(e => {
        if(!e || !e.battleId || e.source === 'admin_delete' || e.source === 'admin_grant') return;
        (heroByBid[e.battleId] = heroByBid[e.battleId] || []).push(e);
      });
      (r.treasureUnlockHistory || []).forEach(e => {
        if(!e || !e.battleId || e.source === 'admin_delete' || e.source === 'admin_grant') return;
        (treByBid[e.battleId] = treByBid[e.battleId] || []).push(e);
      });
      const heroBidConflicts = Object.values(heroByBid).filter(l => l.length > 1).length;
      const treBidConflicts = Object.values(treByBid).filter(l => l.length > 1).length;
      // ── 算規則 2:時間窗異常(★ 新主規則) ──
      const heroTimeClusters = _findTimeClustersLocal(r.heroUnlockHistory, TIME_HERO_THRESHOLD, 'name');
      const treTimeClusters  = _findTimeClustersLocal(r.treasureUnlockHistory, TIME_TRE_THRESHOLD, 'id');
      const totalConflicts = heroBidConflicts + treBidConflicts
        + heroTimeClusters.length + treTimeClusters.length;

      // 詳細描述
      let _detailLines = [];
      if(heroTimeClusters.length){
        const _totalHeroes = heroTimeClusters.reduce((s,c) => s + c.count, 0);
        _detailLines.push(`<b>⏱ 3 分鐘窗:英雄 ${heroTimeClusters.length} 群(共 ${_totalHeroes} 隻)</b>`);
      }
      if(treTimeClusters.length){
        const _totalTres = treTimeClusters.reduce((s,c) => s + c.count, 0);
        _detailLines.push(`<b>⏱ 3 分鐘窗:至寶 ${treTimeClusters.length} 群(共 ${_totalTres} 個)</b>`);
      }
      if(heroBidConflicts) _detailLines.push(`battleId:英雄 ${heroBidConflicts} 場`);
      if(treBidConflicts)  _detailLines.push(`battleId:至寶 ${treBidConflicts} 場`);

      const anomalyHtml = totalConflicts > 0
        ? `<div style="margin-top:8px;padding:10px 14px;background:rgba(200,40,40,0.25);border-left:4px solid #ff6644;border-radius:6px;color:#ffcccc;font-size:13px;">
             ⚠ <b>偵測到 ${totalConflicts} 筆異常</b>(規則:3 分鐘內打 BOSS 解鎖 > 2 隻 OR 同 battleId 多解鎖):<br>
             <span style="font-size:12px;color:#ffe;">${_detailLines.join('・')}</span>
           </div>`
        : `<div style="margin-top:8px;padding:6px 12px;background:rgba(40,120,80,0.2);border-left:4px solid #66cc88;border-radius:6px;color:#aaddbb;font-size:12px;">
             ✅ 無異常
           </div>`;
      // ★ v3.13.68 — 來自異常清單時,玩家卡頂部顯示導航條(返回/上下位/第X/N位/只跳未處理)
      let _navBar = '';
      if(_curAnomalyIdx >= 0 && _anomalyOrder.length){
        const _total = _anomalyOrder.length;
        const _pos = _curAnomalyIdx + 1;
        const _btnS = 'padding:6px 12px;font-size:12px;font-weight:700;border:none;border-radius:6px;cursor:pointer;';
        _navBar = `
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px;padding-bottom:10px;border-bottom:1px dashed rgba(140,180,255,0.3);">
            <button id="_aa-nav-back" style="${_btnS}background:linear-gradient(135deg,#5577cc,#3355aa);color:#fff;">← 返回清單</button>
            <button id="_aa-nav-prev" style="${_btnS}background:rgba(100,120,160,0.5);color:#dde;">← 上一位</button>
            <span style="font-size:12px;color:#aaccff;">異常清單 第 <b style="color:#ffe;">${_pos}</b> / ${_total} 位</span>
            <button id="_aa-nav-next" style="${_btnS}background:rgba(100,120,160,0.5);color:#dde;">下一位 →</button>
            <label style="font-size:11px;color:#bbccdd;cursor:pointer;user-select:none;margin-left:4px;">
              <input type="checkbox" id="_aa-nav-skiphandled" ${_navSkipHandled ? 'checked' : ''} style="vertical-align:middle;margin-right:3px;cursor:pointer;">只跳未處理
            </label>
          </div>`;
      }
      _playerCard.innerHTML = _navBar + `
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;">
          <div style="flex:1;min-width:220px;">
            <div style="font-size:16px;font-weight:800;color:#fff;margin-bottom:4px;">${_esc(_adminLabel(p.email, p.name))}</div>
            <div style="font-size:12px;color:#aac;">${_esc(p.email || '(無 email)')}</div>
            <div style="font-size:11px;color:#778;margin-top:2px;font-family:monospace;">uid: ${_esc(p.uid)}</div>
          </div>
          <div style="display:flex;gap:14px;flex-wrap:wrap;font-size:13px;">
            <div><span style="color:#aac;">💰 知識幣</span> <b style="color:#ffdd66;">${p.knowledgeCoins || 0}</b></div>
            <div><span style="color:#aac;">🦸 已解鎖</span> <b style="color:#ffdd66;">${p.unlockedCount || 0}</b> 隻</div>
            <div><span style="color:#aac;">⬆ 總等級</span> <b style="color:#ffdd66;">${p.totalHeroLv || 0}</b></div>
            <div><span style="color:#aac;">⭐ 最高 Lv</span> <b style="color:#ffdd66;">${p.maxHeroLv || 0}</b></div>
            <div><span style="color:#aac;">💎 至寶</span> <b style="color:#ffdd66;">${p.treasureCount || 0}</b></div>
          </div>
        </div>
        ${anomalyHtml}
      `;
      // ★ v3.13.68 — 綁定導航條按鈕(返回清單純記憶體;上下位走 _doQuery)
      if(_curAnomalyIdx >= 0){
        const _navBack = document.getElementById('_aa-nav-back');
        if(_navBack) _navBack.onclick = _backToAnomalyList;
        const _navPrev = document.getElementById('_aa-nav-prev');
        if(_navPrev) _navPrev.onclick = function(){ const _sk = document.getElementById('_aa-nav-skiphandled'); _gotoAnomalyByOffset(-1, !!(_sk && _sk.checked)); };
        const _navNext = document.getElementById('_aa-nav-next');
        if(_navNext) _navNext.onclick = function(){ const _sk = document.getElementById('_aa-nav-skiphandled'); _gotoAnomalyByOffset(1, !!(_sk && _sk.checked)); };
        const _navSkip = document.getElementById('_aa-nav-skiphandled');
        if(_navSkip) _navSkip.onchange = function(){ _navSkipHandled = this.checked; };
      }
    }

    function _showTabs(){
      if(_tabsEl) _tabsEl.style.display = 'block';
    }

    function _switchTab(tab){
      _curTab = tab;
      // 高亮按鈕
      const btns = _tabsEl ? _tabsEl.querySelectorAll('._aa-tab') : [];
      btns.forEach(b => {
        const active = b.dataset.tab === tab;
        b.style.color = active ? '#ffe' : '#aaccff';
        b.style.borderBottomColor = active ? '#88aaff' : 'transparent';
        b.style.background = active ? 'rgba(140,180,255,0.1)' : 'transparent';
      });
      // 渲染內容
      if(!_curData){
        _contentEl.innerHTML = `<div style="text-align:center;color:#888;padding:20px;">尚無資料</div>`;
        return;
      }
      if(tab === 'hero') _renderHeroTab(_curData.heroUnlockHistory || []);
      else if(tab === 'treasure') _renderTreasureTab(_curData.treasureUnlockHistory || []);
      else if(tab === 'battle') _renderBattleTab(_curData.battleHistory || []);
      else if(tab === 'coin') _renderCoinTab(_curData.coinTransactions || []);
      else if(tab === 'fruit') _renderFruitTab(_curData.fruitHistory || []);
      else if(tab === 'full') _renderFullTab((_curData && _curData.full) || {});
    }

    // 找出異常 entry 的 key Set(用於表格標紅)— v3.11.35c 升級雙規則
    //   規則 1:同 battleId 多解鎖(精確,需要新資料才有 battleId)
    //   規則 2:3 分鐘內打 BOSS 解鎖 > 2 隻(主規則,適用老資料)
    function _buildMultiBattleSet(list, idField){
      const conflictKeys = new Set();
      // 規則 1:battleId
      const byBid = {};
      list.forEach(e => {
        if(!e || !e.battleId) return;
        if(e.source === 'admin_delete' || e.source === 'admin_grant') return;
        (byBid[e.battleId] = byBid[e.battleId] || []).push(e);
      });
      Object.keys(byBid).forEach(bid => {
        const list2 = byBid[bid];
        if(list2.length > 1){
          list2.forEach(e => { conflictKeys.add((e.at||0) + '|' + (e[idField]||'')); });
        }
      });
      // 規則 2:時間窗(★ 新增)
      const _threshold = (idField === 'name') ? TIME_HERO_THRESHOLD : TIME_TRE_THRESHOLD;
      const _clusters = _findTimeClustersLocal(list, _threshold, idField);
      const _timeKeys = _buildTimeClusterKeySet(_clusters, idField);
      _timeKeys.forEach(k => conflictKeys.add(k));
      return conflictKeys;
    }

    function _renderHeroTab(list){
      // ★ v3.13.49 — owned-centric:上方先列「目前擁有英雄」明細(來源/汙染/裝備至寶)+ 汙染刪除預告控制
      const _full = (_curData && _curData.full) || {};
      const _ownedHtml = _buildOwnedHeroesSection(_full);
      // 下方保留原本「解鎖紀錄 + 異常偵測 + 清除」(完整不動)
      let _historyHtml;
      let _conflictKeysForBind = null;
      let _listForBind = list;
      if(!list || !list.length){
        _historyHtml = `<div style="text-align:center;color:#888;padding:16px;font-size:13px;">尚無英雄解鎖紀錄</div>`;
      }else{
        const _r = _buildHeroHistoryHtml(list);
        _historyHtml = _r.html;
        _conflictKeysForBind = _r.conflictKeys;
      }
      _contentEl.innerHTML = _ownedHtml
        + `<div style="margin:14px 0 6px;border-top:2px dashed rgba(140,180,255,0.3);padding-top:10px;font-size:13px;font-weight:800;color:#aaccff;">📜 英雄解鎖紀錄(原始 + 異常偵測)</div>`
        + _historyHtml;
      // 綁定:owned 區塊(汙染預告) + 既有歷史表
      _bindOwnedHeroSection(_full);
      if(_listForBind && _listForBind.length){
        _bindHeroRowButtons();
        const _cleanupBtn = document.getElementById('_aa-cleanup-compensate');
        if(_cleanupBtn) _cleanupBtn.onclick = function(){ _openCleanupPreview(_listForBind, _conflictKeysForBind); };
      }
    }

    // ── owned-centric 顯示小工具 ──
    function _treName(id){
      try{ const t = window.TAIWAN_TREASURES && window.TAIWAN_TREASURES[id]; if(t && (t.name||t.label)) return t.name||t.label; }catch(_){}
      return id;
    }
    function _rarityBadge(r){
      const c = ({ SSR:'#ffcc44', SR:'#cc88ff', R:'#88bbcc' })[r] || '#8899aa';
      return `<span style="background:${c};color:#1a1018;font-weight:800;font-size:10px;padding:1px 6px;border-radius:4px;">${_esc(r||'?')}</span>`;
    }
    function _catBadge(cat){
      const m = { summon:['召喚','#88bbff'], gm:['GM補發','#cc99ff'], boss:['BOSS掉落','#ffaa66'], other:['其他','#99aabb'], initial:['🎒 初始角色','#88dd99'], pollution:['⚠ 來源不明','#ff7777'] };
      const e = m[cat] || ['其他','#99aabb'];
      return `<span style="color:${e[1]};font-weight:${cat==='pollution'?'800':'600'};">${e[0]}</span>`;
    }
    function _investedTotal(inv){
      if(inv == null) return 0;
      if(typeof inv === 'number') return inv;
      if(typeof inv === 'object') return (inv.hp||0)+(inv.atk||0)+(inv.sp||0)+(inv.spd||0);
      return 0;
    }
    function _fmtSkillLv(sk){
      if(sk == null) return '-';
      if(typeof sk === 'number') return sk ? ('Lv'+sk) : '-';
      if(typeof sk === 'object'){ const s1=sk.s1||0, s2=sk.s2||0; return (s1||s2) ? ('S1·'+s1+' S2·'+s2) : '-'; }
      return '-';
    }

    // 目前擁有英雄區塊(含汙染刪除預告狀態 + 控制按鈕)
    function _buildOwnedHeroesSection(full){
      const _owned = Array.isArray(full.ownedHeroes) ? full.ownedHeroes : [];
      if(!_owned.length && !full.pendingPollutionPurge && !(full.pollutionPurgeLog||[]).length){
        return `<div style="text-align:center;color:#888;padding:14px;font-size:13px;">此玩家目前沒有擁有任何英雄資料</div>`;
      }
      const _pollution = _owned.filter(h => h && h.cat === 'pollution');
      const _ownUid12B = (_curUid || '').slice(0, 12);
      const _ownedTreB = Array.isArray(full.ownedTreasures) ? full.ownedTreasures : [];
      const _polTreB = _ownedTreB.filter(t => t && ((t.cat === 'pollution') || (t.creatorUid && t.creatorUid !== _ownUid12B)));
      const _pp = full.pendingPollutionPurge;
      const _hasActivePurge = _pp && (_pp.status === 'pending' || _pp.status === 'acknowledged');
      // 預告狀態 + 刪除記錄
      const _statusHtml = _purgeStatusHtml(full);
      // 汙染 banner(有汙染英雄 或 汙染至寶, 且無進行中預告才顯示「發預告」)
      let _banner = '';
      if((_pollution.length || _polTreB.length) && !_hasActivePurge){
        const _bParts = [];
        if(_pollution.length) _bParts.push(_pollution.length + ' 隻英雄');
        if(_polTreB.length) _bParts.push(_polTreB.length + ' 件至寶');
        _banner = `<div style="background:linear-gradient(135deg,rgba(200,60,40,0.3),rgba(140,40,80,0.2));border:2px solid #ff6644;border-radius:8px;padding:12px 14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
          <div style="flex:1;min-width:200px;">
            <div style="font-size:14px;font-weight:800;color:#ffaaaa;">⚠ 偵測到 ${_bParts.join(' + ')}「來源不明」(疑似跨帳號汙染)</div>
            <div style="font-size:11px;color:#ffcccc;margin-top:3px;">不直接刪 — 改發「刪除預告」:玩家登入會看到緣由/補償並可分別保留 1 隻英雄 + 1 件至寶,之後你再套用刪除(刪前存快照,可復原)。</div>
          </div>
          <button id="_pp-notice-btn" style="padding:9px 20px;font-size:13px;font-weight:800;background:linear-gradient(135deg,#ff6644,#cc3322);color:#fff;border:none;border-radius:8px;cursor:pointer;box-shadow:0 3px 10px rgba(255,80,60,0.45);">📢 發出刪除預告</button>
        </div>`;
      }
      // 擁有英雄表
      const _rows = _owned.map(h => {
        const _isPol = (h.cat === 'pollution');
        const _bg = _isPol ? 'background:rgba(200,40,40,0.16);' : '';
        const _tre = (h.equippedTreasures||[]).map(id => _esc(_treName(id))).join('、') || '<span style="color:#667;">—</span>';
        const _invT = _investedTotal(h.invested);
        return `<tr style="${_bg}border-bottom:1px solid rgba(255,255,255,0.06);">
          <td style="padding:5px 4px;text-align:center;"><input type="checkbox" class="_aa-own-hero-cb" data-name="${_esc(h.name)}" style="width:15px;height:15px;cursor:pointer;accent-color:#ff6644;"></td>
          <td style="padding:5px 7px;font-size:12px;color:#ffe;font-weight:700;white-space:nowrap;">${_esc(h.name)} ${_rarityBadge(h.rarity)}</td>
          <td style="padding:5px 7px;font-size:11px;color:#aac;text-align:center;">Lv.${h.lv||1}</td>
          <td style="padding:5px 7px;font-size:11px;color:#9bd;text-align:center;" title="已配點 ${_invT} / 未用點 ${h.freePts||0}">${_invT}/${h.freePts||0}</td>
          <td style="padding:5px 7px;font-size:11px;color:#bcd;text-align:center;">${_fmtSkillLv(h.skill)}</td>
          <td style="padding:5px 7px;font-size:11px;color:#bcd;text-align:center;">${(h.burst!=null&&h.burst!=='')?('Lv'+(typeof h.burst==='object'?(h.burst.lv||0):h.burst)):'-'}</td>
          <td style="padding:5px 7px;font-size:11px;color:#bcd;text-align:center;">${(h.trait!=null&&h.trait!=='')?('Lv'+(typeof h.trait==='object'?(h.trait.lv||0):h.trait)):'-'}</td>
          <td style="padding:5px 7px;font-size:11px;color:#dca;">${_tre}</td>
          <td style="padding:5px 7px;font-size:11px;">${_catBadge(h.cat)}${h.source?`<span style="color:#778;font-size:10px;margin-left:4px;">(${_esc(String(h.source).slice(0,16))})</span>`:''}</td>
          <td style="padding:5px 7px;font-size:10px;color:#889;white-space:nowrap;">${h.at?_fmtTime(h.at):'<span style="color:#a66;">無紀錄</span>'}</td>
        </tr>`;
      }).join('');
      const _countLine = `<div style="margin-bottom:6px;font-size:12px;color:#aac;">目前擁有 <b style="color:#ffe;">${_owned.length}</b> 隻${_pollution.length?` (<span style="color:#ff8888">${_pollution.length} 隻來源不明</span>)`:''}</div>`;
      const _batchBar = _owned.length ? `
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;padding:8px 10px;background:rgba(60,40,40,0.4);border:1px solid rgba(255,140,120,0.3);border-radius:6px;">
          <button id="_aa-own-hero-all" style="padding:4px 10px;font-size:11px;background:rgba(120,180,120,0.3);border:1px solid #66cc66;color:#aaddaa;border-radius:4px;cursor:pointer;">全選</button>
          <button id="_aa-own-hero-none" style="padding:4px 10px;font-size:11px;background:rgba(120,120,120,0.3);border:1px solid #888;color:#ccc;border-radius:4px;cursor:pointer;">全不選</button>
          <span id="_aa-own-hero-selinfo" style="font-size:12px;color:#bbccdd;">已選 0 隻</span>
          <button id="_aa-own-hero-batch-btn" style="padding:6px 14px;font-size:12px;font-weight:800;background:linear-gradient(135deg,#ff5544,#cc2211);border:none;color:#fff;border-radius:6px;cursor:pointer;margin-left:auto;box-shadow:0 2px 8px rgba(255,80,60,0.4);">🗑 刪除選取的英雄 + 退補償 + 通知</button>
        </div>` : '';
      const _table = _owned.length ? `
        ${_countLine}
        ${_batchBar}
        <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:12px;min-width:760px;">
          <thead><tr style="background:rgba(140,180,255,0.15);">
            <th style="padding:5px 4px;text-align:center;color:#cce;width:28px;">✓</th>
            <th style="padding:5px 7px;text-align:left;color:#cce;">英雄</th>
            <th style="padding:5px 7px;color:#cce;">等級</th>
            <th style="padding:5px 7px;color:#cce;" title="已配點/未用點">配點</th>
            <th style="padding:5px 7px;color:#cce;">技能</th>
            <th style="padding:5px 7px;color:#cce;">爆發</th>
            <th style="padding:5px 7px;color:#cce;">天賦</th>
            <th style="padding:5px 7px;text-align:left;color:#cce;">裝備至寶</th>
            <th style="padding:5px 7px;text-align:left;color:#cce;">取得來源</th>
            <th style="padding:5px 7px;text-align:left;color:#cce;">取得時間</th>
          </tr></thead>
          <tbody>${_rows}</tbody>
        </table></div>` : '';
      return `<div style="font-size:13px;font-weight:800;color:#aaccff;margin-bottom:8px;">🦸 目前擁有英雄</div>${_statusHtml}${_banner}${_table}`;
    }

    // 預告狀態 + 刪除記錄 HTML
    function _purgeStatusHtml(full){
      const pp = full.pendingPollutionPurge;
      const log = Array.isArray(full.pollutionPurgeLog) ? full.pollutionPurgeLog : [];
      const _cnt = (h,t) => { const _p=[]; if(h) _p.push(h+' 隻英雄'); if(t) _p.push(t+' 件至寶'); return _p.join(' + ') || '0'; };
      let html = '';
      if(pp && pp.status === 'pending'){
        html += `<div style="background:rgba(80,80,200,0.18);border:2px solid #6688ff;border-radius:8px;padding:10px 12px;margin-bottom:8px;">
          <div style="font-size:13px;font-weight:800;color:#aaccff;">⏳ 刪除預告已發出(${_cnt((pp.heroes||[]).length,(pp.treasures||[]).length)})— 等待玩家登入確認</div>
          <div style="font-size:11px;color:#bcd;margin-top:3px;">緣由:${_esc(pp.reason||'')}　|　發出:${_fmtTime(pp.createdAt)}</div>
          <button class="_pp-cancel-btn" style="margin-top:8px;padding:6px 14px;font-size:12px;background:#665;color:#fff;border:none;border-radius:6px;cursor:pointer;">✖ 撤銷預告</button>
        </div>`;
      } else if(pp && pp.status === 'acknowledged'){
        const _keep = []; if(pp.playerKeptHero) _keep.push('英雄「'+_esc(pp.playerKeptHero)+'」'); if(pp.playerKeptTreasure) _keep.push('至寶「'+_esc(pp.playerKeptTreasure)+'」');
        html += `<div style="background:rgba(80,160,80,0.18);border:2px solid #66cc66;border-radius:8px;padding:10px 12px;margin-bottom:8px;">
          <div style="font-size:13px;font-weight:800;color:#88dd88;">✅ 玩家已確認預告(${_cnt((pp.heroes||[]).length,(pp.treasures||[]).length)})— 可套用刪除</div>
          <div style="font-size:11px;color:#cdc;margin-top:3px;">保留:${_keep.length?('<b style="color:#ffe066;">'+_keep.join('、')+'</b>(不刪不補償)'):'(玩家未保留任何一個)'}　|　確認:${_fmtTime(pp.playerRespondedAt)}</div>
          <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
            <button class="_pp-apply-btn" style="padding:7px 16px;font-size:13px;font-weight:800;background:linear-gradient(135deg,#cc4444,#992222);color:#fff;border:none;border-radius:6px;cursor:pointer;">🗑 套用刪除(含補償+通知)</button>
            <button class="_pp-cancel-btn" style="padding:7px 14px;font-size:12px;background:#665;color:#fff;border:none;border-radius:6px;cursor:pointer;">✖ 撤銷預告</button>
          </div>
        </div>`;
      }
      const _appliedLogs = log.filter(e => e && !e.restored);
      const _restoredLogs = log.filter(e => e && e.restored);
      if(_appliedLogs.length){
        html += _appliedLogs.map(e => {
          const _hN=(e.deletedHeroes||[]).length, _tN=(e.deletedTreasures||[]).length;
          const _names=[ (e.deletedHeroes||[]).map(h=>_esc(h.name)).join('、'), (e.deletedTreasures||[]).map(t=>'💎'+_esc(t.name||t.id)).join('、') ].filter(Boolean).join(' / ');
          const _kept=[]; if(e.keptHero) _kept.push(_esc(e.keptHero)); if(e.keptTreasure) _kept.push('💎'+_esc(e.keptTreasure));
          const _itemsStr = (e.compGranted&&e.compGranted.items) ? Object.keys(e.compGranted.items).map(k=>k+'×'+e.compGranted.items[k]).join('、') : '';
          return `<div style="background:rgba(150,90,40,0.15);border:1px solid #aa7744;border-radius:8px;padding:8px 12px;margin-bottom:6px;">
            <div style="font-size:12px;color:#ffcc99;">🗑 已移除 ${_cnt(_hN,_tN)}(${_names})${_kept.length?(' / 保留 '+_kept.join('、')):''}</div>
            <div style="font-size:10px;color:#cba;margin-top:2px;">補償 💰${(e.compGranted&&e.compGranted.coins)||0}${_itemsStr?(' + '+_esc(_itemsStr)):''}　|　${_fmtTime(e.appliedAt)}</div>
            <button class="_pp-restore-btn" data-purge="${_esc(e.purgeId)}" style="margin-top:6px;padding:5px 12px;font-size:11px;background:#4466aa;color:#fff;border:none;border-radius:5px;cursor:pointer;">↩ 復原這批(英雄+至寶)</button>
          </div>`;
        }).join('');
      }
      if(_restoredLogs.length){
        html += `<div style="font-size:11px;color:#8aa;margin-bottom:6px;">↩ 已復原記錄:${_restoredLogs.length} 筆(${_restoredLogs.map(e=>_cnt((e.deletedHeroes||[]).length,(e.deletedTreasures||[]).length)).join(' ; ')})</div>`;
      }
      return html;
    }

    // 綁定 owned 區塊的汙染預告控制按鈕
    function _bindOwnedHeroSection(full){
      const _owned = Array.isArray(full.ownedHeroes) ? full.ownedHeroes : [];
      const _pollution = _owned.filter(h => h && h.cat === 'pollution');
      const _noticeBtn = document.getElementById('_pp-notice-btn');
      if(_noticeBtn) _noticeBtn.onclick = function(){ _openPollutionPurgeNoticeModal(_pollution); };
      // ★ v3.13.68 — 英雄擁有區批次勾選刪除 + 退補償 + 通知
      const _heroSelInfo = document.getElementById('_aa-own-hero-selinfo');
      function _updHeroSelInfo(){
        const _n = _contentEl.querySelectorAll('._aa-own-hero-cb:checked').length;
        if(_heroSelInfo) _heroSelInfo.textContent = '已選 ' + _n + ' 隻';
      }
      _contentEl.querySelectorAll('._aa-own-hero-cb').forEach(cb => { cb.onchange = _updHeroSelInfo; });
      const _heroAllB = document.getElementById('_aa-own-hero-all');
      const _heroNoneB = document.getElementById('_aa-own-hero-none');
      if(_heroAllB) _heroAllB.onclick = function(){ _contentEl.querySelectorAll('._aa-own-hero-cb').forEach(cb => { cb.checked = true; }); _updHeroSelInfo(); };
      if(_heroNoneB) _heroNoneB.onclick = function(){ _contentEl.querySelectorAll('._aa-own-hero-cb').forEach(cb => { cb.checked = false; }); _updHeroSelInfo(); };
      const _heroBatchB = document.getElementById('_aa-own-hero-batch-btn');
      if(_heroBatchB) _heroBatchB.onclick = function(){
        const _names = Array.from(_contentEl.querySelectorAll('._aa-own-hero-cb:checked')).map(cb => cb.dataset.name);
        if(!_names.length){ alert('請先勾選要刪除的英雄'); return; }
        const _sel = _names.map(n => _owned.find(h => h && h.name === n)).filter(Boolean);
        _openBatchCleanup('hero', _sel);
      };
      _contentEl.querySelectorAll('._pp-cancel-btn').forEach(btn => {
        btn.onclick = async function(){
          if(!confirm('撤銷這筆刪除預告?\n\n玩家就不會再看到刪除通知,英雄保持原狀。')) return;
          btn.disabled = true; btn.textContent = '⏳';
          try{
            await window._fbAdminCancelPollutionPurgeNotice(_curUid);
            _setStatus('✅ 已撤銷預告,重新查詢中...', '#88ddaa');
            await _doQuery();
          }catch(e){ _setStatus('❌ 撤銷失敗:' + (e.message||e), '#ff8866'); btn.disabled=false; btn.textContent='✖ 撤銷預告'; }
        };
      });
      _contentEl.querySelectorAll('._pp-apply-btn').forEach(btn => {
        btn.onclick = async function(){
          if(!confirm('套用刪除?\n\n會刪除預告中(玩家未保留)的英雄與至寶,自動發補償(知識幣+道具/至寶經驗卷軸)+通知,並留下可復原的刪除記錄。\n\n⚠ 此步驟才會真的動到玩家資料(刪前已存快照,可隨時復原)。')) return;
          btn.disabled = true; btn.textContent = '⏳ 套用中...';
          try{
            const _r = await window._fbAdminApplyPollutionPurge(_curUid, {});
            const _tParts=[]; if(_r.deleted) _tParts.push('英雄 '+_r.deleted+' 隻'); if(_r.deletedTreasures) _tParts.push('至寶 '+_r.deletedTreasures+' 件');
            const _kParts=[]; if(_r.kept) _kParts.push('英雄「'+_r.kept+'」'); if(_r.keptTreasure) _kParts.push('至寶「'+_r.keptTreasure+'」');
            _setStatus(`✅ 已套用:移除 ${_tParts.join(' / ')||'0'}${_kParts.length?(' / 保留 '+_kParts.join('、')):''},已補償+通知。重新查詢中...`, '#88ddaa');
            await _doQuery();
          }catch(e){ _setStatus('❌ 套用失敗:' + (e.message||e), '#ff8866'); btn.disabled=false; btn.textContent='🗑 套用刪除(含補償+通知)'; }
        };
      });
      _contentEl.querySelectorAll('._pp-restore-btn').forEach(btn => {
        btn.onclick = async function(){
          const _pid = btn.dataset.purge;
          if(!confirm('復原這批被刪資料?\n\n會把當初刪掉的英雄(等級/技能/爆發/天賦/裝備至寶)與至寶(等級/exp/裝備/投資)原樣加回玩家帳號。')) return;
          btn.disabled = true; btn.textContent = '⏳';
          try{
            const _r = await window._fbAdminRestorePurgedHeroes(_curUid, _pid);
            const _rParts=[]; if(_r.restored) _rParts.push('英雄 '+_r.restored+' 隻'); if(_r.restoredTreasures) _rParts.push('至寶 '+_r.restoredTreasures+' 件');
            _setStatus(`✅ 已復原 ${_rParts.join(' / ')||'0'}。重新查詢中...`, '#88ddaa');
            await _doQuery();
          }catch(e){ _setStatus('❌ 復原失敗:' + (e.message||e), '#ff8866'); btn.disabled=false; btn.textContent='↩ 復原這批被刪資料'; }
        };
      });
    }

    // 「發出刪除預告」preview modal:設定緣由/證據 + 勾選要列入的汙染英雄 + 各自補償
    function _openPollutionPurgeNoticeModal(pollutionHeroes){
      if(!_curData || !_curUid){ alert('請先成功查詢玩家'); return; }
      pollutionHeroes = Array.isArray(pollutionHeroes) ? pollutionHeroes : [];
      const _heroDetails = _curData.heroDetails || {};
      const _full = (_curData && _curData.full) || {};
      const _ownUid12 = (_curUid || '').slice(0, 12);
      const _ITEM_LABELS = { skill_upgrade_book:'技能升級書', burst_upgrade_fruit:'超越極限果實', hero_exp_book_premium:'豪華典藏版經驗之書', summon_ticket_ssr:'SSR召喚卷', hero_exp_book:'英雄經驗之書', treasure_exp_scroll:'至寶經驗卷軸' };
      // 各汙染英雄預計補償
      const _detail = pollutionHeroes.map(h => {
        const _c = _computeCompensationForHero(h.name, _heroDetails);
        return { name:h.name, rarity:h.rarity||'', lv:h.lv||(_c.meta&&_c.meta.lv)||1, source:h.source||null, cat:h.cat||'pollution', creatorUid:h.creatorUid||'', comp:{ coins:_c.coins||0, items:_c.items||{} } };
      });
      // ★ v3.13.49b — 汙染至寶候選(查無紀錄 cat='pollution' 或 creatorUid 為他人)
      const _ownedTre = Array.isArray(_full.ownedTreasures) ? _full.ownedTreasures : [];
      const _polTre = _ownedTre.filter(t => t && ((t.cat === 'pollution') || (t.creatorUid && t.creatorUid !== _ownUid12)));
      const _treDetail = _polTre.map(t => {
        const _c = _computeCompensationForTreasure(t.id, _ownedTre);
        return { id:t.id, name:t.name||t.id, lv:t.lv||1, source:t.source||null, cat:t.cat||'pollution', creatorUid:t.creatorUid||'', comp:{ coins:_c.coins||0, items:_c.items||{} } };
      });
      if(!_detail.length && !_treDetail.length){ alert('沒有來源不明的英雄或至寶可發預告'); return; }
      const _rows = _detail.map((d,i) => {
        const _itemsStr = Object.keys(d.comp.items).map(k=>(_ITEM_LABELS[k]||k)+'×'+d.comp.items[k]).join('、');
        return `<tr style="border-bottom:1px solid rgba(255,255,255,0.08);">
          <td style="padding:6px;text-align:center;"><input type="checkbox" class="_ppn-chk" data-i="${i}" checked style="width:16px;height:16px;cursor:pointer;"></td>
          <td style="padding:6px;font-size:12px;color:#ffe;">${_esc(d.name)} ${_rarityBadge(d.rarity)}</td>
          <td style="padding:6px;font-size:11px;color:#aac;">Lv.${d.lv}</td>
          <td style="padding:6px;font-size:11px;color:#88dd99;">💰${d.comp.coins}${_itemsStr?(' + '+_esc(_itemsStr)):''}</td>
          <td style="padding:6px;font-size:10px;color:#a88;font-family:monospace;" title="解鎖紀錄建立者 uid 前 12 碼(若非本人 = 從別人複製來)">${d.creatorUid?_esc(d.creatorUid):'(無紀錄)'}</td>
        </tr>`;
      }).join('');
      const _treRows = _treDetail.map((d,i) => {
        const _itemsStr = Object.keys(d.comp.items).map(k=>(_ITEM_LABELS[k]||k)+'×'+d.comp.items[k]).join('、');
        return `<tr style="border-bottom:1px solid rgba(255,255,255,0.08);">
          <td style="padding:6px;text-align:center;"><input type="checkbox" class="_ppn-tre-chk" data-i="${i}" checked style="width:16px;height:16px;cursor:pointer;"></td>
          <td style="padding:6px;font-size:12px;color:#ffe;">💎 ${_esc(d.name)}</td>
          <td style="padding:6px;font-size:11px;color:#aac;">Lv.${d.lv}</td>
          <td style="padding:6px;font-size:11px;color:#88dd99;">💰${d.comp.coins}${_itemsStr?(' + '+_esc(_itemsStr)):''}</td>
          <td style="padding:6px;font-size:10px;color:#a88;font-family:monospace;" title="解鎖紀錄建立者 uid 前 12 碼(若非本人 = 從別人複製來)">${d.creatorUid?_esc(d.creatorUid):'(無紀錄)'}</td>
        </tr>`;
      }).join('');
      const _heroTableHtml = _detail.length ? `
          <div style="font-size:12px;color:#ffcc88;margin-bottom:4px;">🦸 將列入的英雄(取消勾選可排除):</div>
          <table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
            <thead><tr style="background:rgba(255,100,60,0.18);">
              <th style="padding:6px;font-size:11px;color:#ffd;">列入</th><th style="padding:6px;font-size:11px;color:#ffd;text-align:left;">英雄</th><th style="padding:6px;font-size:11px;color:#ffd;text-align:left;">等級</th><th style="padding:6px;font-size:11px;color:#ffd;text-align:left;">移除後補償</th><th style="padding:6px;font-size:11px;color:#ffd;text-align:left;">紀錄建立者</th>
            </tr></thead><tbody>${_rows}</tbody>
          </table>` : '';
      const _treTableHtml = _treDetail.length ? `
          <div style="font-size:12px;color:#9cf;margin-bottom:4px;">💎 將列入的至寶(取消勾選可排除):</div>
          <table style="width:100%;border-collapse:collapse;margin-bottom:14px;">
            <thead><tr style="background:rgba(100,150,255,0.18);">
              <th style="padding:6px;font-size:11px;color:#ffd;">列入</th><th style="padding:6px;font-size:11px;color:#ffd;text-align:left;">至寶</th><th style="padding:6px;font-size:11px;color:#ffd;text-align:left;">等級</th><th style="padding:6px;font-size:11px;color:#ffd;text-align:left;">移除後補償</th><th style="padding:6px;font-size:11px;color:#ffd;text-align:left;">紀錄建立者</th>
            </tr></thead><tbody>${_treRows}</tbody>
          </table>` : '';
      const _autoEvidence = '查無合法解鎖紀錄(unlockedHeroes/taiwanTreasureData 有此項目, 但解鎖歷史找不到對應的合法取得紀錄)→ 研判為共用平板上從其他帳號帶入。';
      const _ov = document.createElement('div');
      _ov.id = '_ppn-modal';
      _ov.style.cssText = 'position:fixed;inset:0;z-index:200001;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;padding:18px;backdrop-filter:blur(6px);font-family:"M PLUS Rounded 1c","Nunito",sans-serif;overflow-y:auto;';
      _ov.innerHTML = `
        <div style="max-width:760px;width:100%;background:linear-gradient(160deg,#241818,#160c0c);border:2.5px solid #ff6644;border-radius:14px;padding:22px 26px;color:#fff;box-shadow:0 0 40px rgba(255,80,60,0.5);max-height:92vh;overflow-y:auto;">
          <div style="font-size:21px;font-weight:800;color:#ff8866;margin-bottom:6px;">📢 發出「汙染英雄／至寶刪除預告」</div>
          <div style="font-size:12px;color:#ffcccc;line-height:1.6;margin-bottom:14px;">
            這一步<b style="color:#ffe066;">不會刪除任何東西</b>,只會在玩家帳號寫一則「刪除預告」。玩家下次登入會看到:緣由、說明、被列英雄/至寶清單、各自移除後的補償,並可<b>分別保留 1 隻英雄 + 1 件至寶</b>。之後你再到此頁按「套用刪除」才會真的刪(刪前自動存快照,可復原)。
          </div>
          <label style="display:block;font-size:12px;color:#ffd;margin-bottom:4px;font-weight:700;">緣由(玩家會看到):</label>
          <textarea id="_ppn-reason" rows="2" style="width:100%;padding:8px;font-size:13px;background:rgba(0,0,0,0.5);color:#fff;border:1px solid #885;border-radius:6px;font-family:inherit;margin-bottom:10px;box-sizing:border-box;">清除來源不明(疑似在共用平板上從其他帳號帶入)的英雄與至寶,讓帳號乾淨公平。</textarea>
          <label style="display:block;font-size:12px;color:#ffd;margin-bottom:4px;font-weight:700;">汙染證據/說明(玩家會看到,可留空):</label>
          <textarea id="_ppn-evidence" rows="2" style="width:100%;padding:8px;font-size:12px;background:rgba(0,0,0,0.5);color:#fff;border:1px solid #885;border-radius:6px;font-family:inherit;margin-bottom:12px;box-sizing:border-box;">${_esc(_autoEvidence)}</textarea>
          ${_heroTableHtml}
          ${_treTableHtml}
          <div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;">
            <button id="_ppn-cancel" style="padding:10px 20px;font-size:13px;background:#444;color:#ccc;border:none;border-radius:8px;cursor:pointer;">取消</button>
            <button id="_ppn-confirm" style="padding:10px 24px;font-size:14px;font-weight:800;background:linear-gradient(135deg,#ff6644,#cc3322);color:#fff;border:none;border-radius:8px;cursor:pointer;box-shadow:0 3px 12px rgba(255,80,60,0.5);">📢 確認發出預告</button>
          </div>
        </div>`;
      document.body.appendChild(_ov);
      const _close = ()=>{ try{ _ov.remove(); }catch(_){} };
      document.getElementById('_ppn-cancel').onclick = _close;
      document.getElementById('_ppn-confirm').onclick = async function(){
        const _selected = [];
        _ov.querySelectorAll('._ppn-chk').forEach(chk => { if(chk.checked){ const _i=parseInt(chk.dataset.i,10); if(_detail[_i]) _selected.push(_detail[_i]); } });
        const _selectedTre = [];
        _ov.querySelectorAll('._ppn-tre-chk').forEach(chk => { if(chk.checked){ const _i=parseInt(chk.dataset.i,10); if(_treDetail[_i]) _selectedTre.push(_treDetail[_i]); } });
        if(!_selected.length && !_selectedTre.length){ alert('請至少勾選 1 個英雄或至寶'); return; }
        const _reason = (document.getElementById('_ppn-reason').value||'').trim();
        const _evidence = (document.getElementById('_ppn-evidence').value||'').trim();
        const _btn = document.getElementById('_ppn-confirm');
        _btn.disabled = true; _btn.textContent = '⏳ 發出中...';
        try{
          await window._fbAdminCreatePollutionPurgeNotice(_curUid, _selected, { reason:_reason, evidence:_evidence, treasures:_selectedTre });
          _close();
          _setStatus(`✅ 已發出刪除預告(英雄 ${_selected.length} / 至寶 ${_selectedTre.length}),玩家下次登入會看到。重新查詢中...`, '#88ddaa');
          await _doQuery();
        }catch(e){
          _btn.disabled=false; _btn.textContent='📢 確認發出預告';
          alert('發出預告失敗:' + (e.message||e));
        }
      };
    }

    // 既有「解鎖紀錄」表(原 _renderHeroTab 內容, 改成回傳 HTML + conflictKeys 供綁定)
    function _buildHeroHistoryHtml(list){
      const conflictKeys = _buildMultiBattleSet(list, 'name');
      const rows = list.map(e => {
        const k = (e.at || 0) + '|' + (e.name || '');
        const isConflict = conflictKeys.has(k);
        const isAdminAction = (e.source === 'admin_delete' || e.source === 'admin_grant');
        const rowBg = isConflict ? 'background:rgba(200,40,40,0.18);' : (isAdminAction ? 'background:rgba(140,100,200,0.15);' : '');
        const srcTag = e.source === 'admin_delete' ? '<span style="color:#ff8888">🗑 admin_delete</span>'
                     : e.source === 'admin_grant' ? '<span style="color:#cc88ff">➕ admin_grant</span>'
                     : `<span style="color:#aac;">${_esc(e.source || 'other')}</span>`;
        return `<tr style="${rowBg}border-bottom:1px solid rgba(255,255,255,0.06);">
          <td style="padding:6px 8px;font-size:12px;color:#ffe;">${_esc(e.name || '?')}</td>
          <td style="padding:6px 8px;font-size:11px;color:#aac;">${_fmtTime(e.at)}</td>
          <td style="padding:6px 8px;font-size:11px;">${srcTag}</td>
          <td style="padding:6px 8px;font-size:11px;color:${isConflict ? '#ffaaaa' : '#778'};" title="${_esc(e.battleId || '')}">${_shortBid(e.battleId)}${isConflict ? ' ⚠' : ''}</td>
          <td style="padding:6px 8px;text-align:right;">
            <button class="_aa-del-hero" data-at="${e.at}" data-name="${_esc(e.name || '')}"
              style="padding:4px 10px;font-size:11px;background:#882233;color:#fff;border:none;border-radius:4px;cursor:pointer;">🗑 刪</button>
            <button class="_aa-del-hero-full" data-name="${_esc(e.name || '')}"
              style="padding:4px 10px;font-size:11px;background:#cc3344;color:#fff;border:none;border-radius:4px;cursor:pointer;margin-left:4px;" title="清除英雄實體(等級/技能/天賦/紀錄全清)">🚫 整隻刪</button>
          </td>
        </tr>`;
      }).join('');
      let _fruitAnomalyCount = 0;
      try{
        const _fruitH = (_curData && _curData.fruitHistory) || [];
        const _fAb = _detectFruitAnomalies(_fruitH);
        _fruitAnomalyCount = _fAb.totalCount;
      }catch(_){}
      const _hasAnyAnomaly = (conflictKeys.size > 0 || _fruitAnomalyCount > 0);
      const _batchBanner = _hasAnyAnomaly ? `
        <div style="background:linear-gradient(135deg,rgba(200,60,40,0.35),rgba(140,40,80,0.25));border:2px solid #ff6644;border-radius:8px;padding:12px 14px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
          <div style="flex:1;min-width:200px;">
            <div style="font-size:14px;font-weight:800;color:#ffe;">🎁 異常批次處理(同 battleId / 時間窗多解鎖)</div>
            <div style="font-size:11px;color:#ffcccc;margin-top:3px;">
              偵測到 ${conflictKeys.size > 0 ? `<b>${conflictKeys.size} 筆英雄異常</b>` : ''}${conflictKeys.size > 0 && _fruitAnomalyCount > 0 ? ' + ' : ''}${_fruitAnomalyCount > 0 ? `<b>${_fruitAnomalyCount} 顆異常果實</b>` : ''} → 點按鈕勾選刪除並計算補償
            </div>
          </div>
          <button id="_aa-cleanup-compensate" style="padding:9px 22px;font-size:13px;font-weight:800;background:linear-gradient(135deg,#ff6644,#cc3322);color:#fff;border:none;border-radius:8px;cursor:pointer;box-shadow:0 3px 10px rgba(255,80,60,0.5);">📦 開啟勾選清除介面</button>
        </div>` : '';
      const html = `
        ${_batchBanner}
        <div style="margin-bottom:6px;font-size:12px;color:#aac;">共 ${list.length} 筆 ${conflictKeys.size > 0 ? `(<span style="color:#ff8888">${conflictKeys.size} 筆異常</span>)` : ''}</div>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead><tr style="background:rgba(140,180,255,0.15);">
            <th style="padding:6px 8px;text-align:left;color:#cce;">英雄</th>
            <th style="padding:6px 8px;text-align:left;color:#cce;">時間</th>
            <th style="padding:6px 8px;text-align:left;color:#cce;">來源</th>
            <th style="padding:6px 8px;text-align:left;color:#cce;min-width:200px;">場次 (BOSS / 時間)</th>
            <th style="padding:6px 8px;text-align:right;color:#cce;">動作</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>`;
      return { html, conflictKeys };
    }

    function _renderHeroTab_OLD_UNUSED(list){
      if(!list.length){
        _contentEl.innerHTML = `<div style="text-align:center;color:#888;padding:20px;font-size:13px;">尚無英雄解鎖紀錄</div>`;
        return;
      }
      const conflictKeys = _buildMultiBattleSet(list, 'name');
      const rows = list.map(e => {
        const k = (e.at || 0) + '|' + (e.name || '');
        const isConflict = conflictKeys.has(k);
        const isAdminAction = (e.source === 'admin_delete' || e.source === 'admin_grant');
        const rowBg = isConflict ? 'background:rgba(200,40,40,0.18);' : (isAdminAction ? 'background:rgba(140,100,200,0.15);' : '');
        const srcTag = e.source === 'admin_delete' ? '<span style="color:#ff8888">🗑 admin_delete</span>'
                     : e.source === 'admin_grant' ? '<span style="color:#cc88ff">➕ admin_grant</span>'
                     : `<span style="color:#aac;">${_esc(e.source || 'other')}</span>`;
        return `<tr style="${rowBg}border-bottom:1px solid rgba(255,255,255,0.06);">
          <td style="padding:6px 8px;font-size:12px;color:#ffe;">${_esc(e.name || '?')}</td>
          <td style="padding:6px 8px;font-size:11px;color:#aac;">${_fmtTime(e.at)}</td>
          <td style="padding:6px 8px;font-size:11px;">${srcTag}</td>
          <td style="padding:6px 8px;font-size:11px;color:${isConflict ? '#ffaaaa' : '#778'};" title="${_esc(e.battleId || '')}">${_shortBid(e.battleId)}${isConflict ? ' ⚠' : ''}</td>
          <td style="padding:6px 8px;text-align:right;">
            <button class="_aa-del-hero" data-at="${e.at}" data-name="${_esc(e.name || '')}"
              style="padding:4px 10px;font-size:11px;background:#882233;color:#fff;border:none;border-radius:4px;cursor:pointer;">🗑 刪</button>
            <button class="_aa-del-hero-full" data-name="${_esc(e.name || '')}"
              style="padding:4px 10px;font-size:11px;background:#cc3344;color:#fff;border:none;border-radius:4px;cursor:pointer;margin-left:4px;" title="清除英雄實體(等級/技能/天賦/紀錄全清)">🚫 整隻刪</button>
          </td>
        </tr>`;
      }).join('');
      // ★ v3.11.35e — 一鍵清除異常按鈕(英雄/果實任一異常都顯示)
      // 預先偵測果實異常數量,讓 banner 顯示更完整
      let _fruitAnomalyCount = 0;
      try{
        const _fruitH = (_curData && _curData.fruitHistory) || [];
        const _fAb = _detectFruitAnomalies(_fruitH);
        _fruitAnomalyCount = _fAb.totalCount;
      }catch(_){}
      const _hasAnyAnomaly = (conflictKeys.size > 0 || _fruitAnomalyCount > 0);
      const _batchBanner = _hasAnyAnomaly ? `
        <div style="background:linear-gradient(135deg,rgba(200,60,40,0.35),rgba(140,40,80,0.25));border:2px solid #ff6644;border-radius:8px;padding:12px 14px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
          <div style="flex:1;min-width:200px;">
            <div style="font-size:14px;font-weight:800;color:#ffe;">🎁 異常批次處理</div>
            <div style="font-size:11px;color:#ffcccc;margin-top:3px;">
              偵測到 ${conflictKeys.size > 0 ? `<b>${conflictKeys.size} 筆英雄異常</b>` : ''}${conflictKeys.size > 0 && _fruitAnomalyCount > 0 ? ' + ' : ''}${_fruitAnomalyCount > 0 ? `<b>${_fruitAnomalyCount} 顆異常果實</b>` : ''} → 點按鈕可勾選要刪除的項目並計算補償
            </div>
          </div>
          <button id="_aa-cleanup-compensate" style="padding:9px 22px;font-size:13px;font-weight:800;
                  background:linear-gradient(135deg,#ff6644,#cc3322);color:#fff;border:none;border-radius:8px;cursor:pointer;
                  box-shadow:0 3px 10px rgba(255,80,60,0.5);">
            📦 開啟勾選清除介面
          </button>
        </div>
      ` : '';
      _contentEl.innerHTML = `
        ${_batchBanner}
        <div style="margin-bottom:6px;font-size:12px;color:#aac;">共 ${list.length} 筆 ${conflictKeys.size > 0 ? `(<span style="color:#ff8888">${conflictKeys.size} 筆異常 — 同 battleId 或 3 分鐘內打 BOSS 多解鎖</span>)` : ''}</div>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead><tr style="background:rgba(140,180,255,0.15);">
            <th style="padding:6px 8px;text-align:left;color:#cce;">英雄</th>
            <th style="padding:6px 8px;text-align:left;color:#cce;">時間</th>
            <th style="padding:6px 8px;text-align:left;color:#cce;">來源</th>
            <th style="padding:6px 8px;text-align:left;color:#cce;min-width:200px;">場次 (BOSS / 時間)</th>
            <th style="padding:6px 8px;text-align:right;color:#cce;">動作</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `;
      _bindHeroRowButtons();
      // 綁定一鍵按鈕
      const _cleanupBtn = document.getElementById('_aa-cleanup-compensate');
      if(_cleanupBtn){
        _cleanupBtn.onclick = function(){ _openCleanupPreview(list, conflictKeys); };
      }
    }

    function _bindHeroRowButtons(){
      _contentEl.querySelectorAll('._aa-del-hero').forEach(btn => {
        btn.onclick = async function(){
          const at = parseInt(btn.dataset.at, 10);
          const name = btn.dataset.name;
          if(!confirm(`刪除這筆英雄解鎖紀錄?\n\n英雄: ${name}\n時間: ${_fmtTime(at)}\n\n⚠ 只刪「紀錄」,不會把已擁有的英雄拿掉。\n  若要連英雄一起刪,請按「🚫 整隻刪」。`)) return;
          btn.disabled = true; btn.textContent = '⏳';
          try{
            await window._fbAdminDeletePlayerActivityEntry(_curUid, 'hero_history', { at, name }, { reason: 'GM 後台 → 玩家活動記錄查詢' });
            _setStatus('✅ 已刪除英雄解鎖紀錄,重新查詢中...', '#88ddaa');
            await _doQuery();
          }catch(e){
            _setStatus('❌ 刪除失敗: ' + (e.message || e), '#ff8866');
            btn.disabled = false; btn.textContent = '🗑 刪';
          }
        };
      });
      _contentEl.querySelectorAll('._aa-del-hero-full').forEach(btn => {
        btn.onclick = async function(){
          const name = btn.dataset.name;
          if(!confirm(`🚫 整隻刪除「${name}」?\n\n會清掉:\n  - unlockedHeroes 移除\n  - heroLevels 刪除\n  - heroStatInvested / Points 刪除\n  - heroSkillLevels / heroBurstLevels 刪除\n  - 寫 admin_delete audit 紀錄\n\n⚠ 不可逆!`)) return;
          btn.disabled = true; btn.textContent = '⏳';
          try{
            await window._fbAdminDeleteUnlockedHero(_curUid, name, { reason: 'GM 後台 → 玩家活動記錄查詢 整隻刪' });
            _setStatus(`✅ 已整隻刪除 ${name},重新查詢中...`, '#88ddaa');
            await _doQuery();
          }catch(e){
            _setStatus('❌ 刪除失敗: ' + (e.message || e), '#ff8866');
            btn.disabled = false; btn.textContent = '🚫 整隻刪';
          }
        };
      });
    }

    // ★ v3.13.49(2026-06-05)— owned-centric 至寶區塊(目前擁有的至寶:名稱/等級/裝備在誰/投資)
    function _buildOwnedTreasuresHtml(){
      const _full = (_curData && _curData.full) || {};
      const _owned = Array.isArray(_full.ownedTreasures) ? _full.ownedTreasures : [];
      const _DB = (typeof window.TAIWAN_TREASURES === 'object' && window.TAIWAN_TREASURES) ? window.TAIWAN_TREASURES : {};
      if(!_owned.length){
        return `<div style="margin-bottom:10px;padding:10px;background:rgba(30,30,50,0.4);border-radius:8px;font-size:12px;color:#9ab;">💎 目前擁有至寶:<b>0</b> 個</div>`;
      }
      const _ownUid12 = (_curUid || '').slice(0, 12);
      // 來源分類:🔴 他人複製(creatorUid≠本人)/ 🟡 無紀錄(cat=pollution)/ 🟢 正常
      function _treSrc(t){
        if(t.creatorUid && t.creatorUid !== _ownUid12) return { html:`<span style="color:#ff9a9a;font-weight:700;">🔴 複製自 ${_esc(t.creatorUid)}…</span>`, pol:true, bg:'background:rgba(200,40,40,0.16);' };
        if(t.cat === 'pollution') return { html:`<span style="color:#ffcc66;font-weight:700;">🟡 無紀錄</span>`, pol:true, bg:'background:rgba(200,160,40,0.13);' };
        return { html:`<span style="color:#9af0b0;">🟢 正常${t.source?(' <span style="color:#778;font-size:10px;">('+_esc(String(t.source).slice(0,14))+')</span>'):''}</span>`, pol:false, bg:'' };
      }
      let _polCount = 0;
      const _rows = _owned.map(t => {
        const _info = _DB[t.id] || {};
        const _nm = _info.name ? (_esc(_info.icon ? _info.icon + ' ' : '') + _esc(_info.name)) : _esc(t.id);
        const _eq = t.equippedTo ? `<span style="color:#88ddaa;">${_esc(t.equippedTo)}</span>` : '<span style="color:#778;">未裝備</span>';
        let _inv = '—';
        if(t.invested && typeof t.invested === 'object'){
          const _sum = (t.invested.hp||0)+(t.invested.atk||0)+(t.invested.sp||0)+(t.invested.spd||0);
          if(_sum>0) _inv = _sum + ' 點';
        }
        const _src = _treSrc(t);
        if(_src.pol) _polCount++;
        return `<tr style="${_src.bg}border-bottom:1px solid rgba(255,255,255,0.06);">
          <td style="padding:5px 4px;text-align:center;"><input type="checkbox" class="_aa-own-tre-cb" data-id="${_esc(t.id)}" style="width:15px;height:15px;cursor:pointer;accent-color:#ff6644;"></td>
          <td style="padding:5px 8px;font-size:12px;color:#ffe;">${_nm}</td>
          <td style="padding:5px 8px;font-size:11px;color:#aac;font-family:monospace;">${_esc(t.id)}</td>
          <td style="padding:5px 8px;font-size:12px;color:#ffe066;text-align:center;">Lv.${parseInt(t.lv,10)||1}</td>
          <td style="padding:5px 8px;font-size:11px;">${_eq}</td>
          <td style="padding:5px 8px;font-size:11px;color:#cda;text-align:center;">${_inv}</td>
          <td style="padding:5px 8px;font-size:11px;">${_src.html}</td>
        </tr>`;
      }).join('');
      // 汙染 banner(有汙染至寶 且無進行中預告)→ 同一顆按鈕開「英雄/至寶」合併預告
      const _pp = _full.pendingPollutionPurge;
      const _hasActive = _pp && (_pp.status === 'pending' || _pp.status === 'acknowledged');
      let _treBanner = '';
      if(_polCount && !_hasActive){
        _treBanner = `<div style="background:linear-gradient(135deg,rgba(200,60,40,0.28),rgba(140,40,80,0.18));border:2px solid #ff6644;border-radius:8px;padding:11px 13px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
          <div style="flex:1;min-width:200px;">
            <div style="font-size:13px;font-weight:800;color:#ffaaaa;">⚠ 偵測到 ${_polCount} 件「來源不明」至寶(🔴=他人複製 / 🟡=無紀錄)</div>
            <div style="font-size:11px;color:#ffcccc;margin-top:3px;">點下方按鈕發「刪除預告」(會一併列出汙染英雄);玩家可保留 1 件至寶,套用前存快照可復原。</div>
          </div>
          <button id="_pp-tre-notice-btn" style="padding:9px 18px;font-size:13px;font-weight:800;background:linear-gradient(135deg,#ff6644,#cc3322);color:#fff;border:none;border-radius:8px;cursor:pointer;box-shadow:0 3px 10px rgba(255,80,60,0.45);">📢 發出刪除預告</button>
        </div>`;
      }
      const _treBatchBar = `
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;padding:8px 10px;background:rgba(60,40,40,0.4);border:1px solid rgba(255,140,120,0.3);border-radius:6px;">
          <button id="_aa-own-tre-all" style="padding:4px 10px;font-size:11px;background:rgba(120,180,120,0.3);border:1px solid #66cc66;color:#aaddaa;border-radius:4px;cursor:pointer;">全選</button>
          <button id="_aa-own-tre-none" style="padding:4px 10px;font-size:11px;background:rgba(120,120,120,0.3);border:1px solid #888;color:#ccc;border-radius:4px;cursor:pointer;">全不選</button>
          <span id="_aa-own-tre-selinfo" style="font-size:12px;color:#bbccdd;">已選 0 件</span>
          <button id="_aa-own-tre-batch-btn" style="padding:6px 14px;font-size:12px;font-weight:800;background:linear-gradient(135deg,#ff5544,#cc2211);border:none;color:#fff;border-radius:6px;cursor:pointer;margin-left:auto;box-shadow:0 2px 8px rgba(255,80,60,0.4);">🗑 刪除選取的至寶 + 退補償 + 通知</button>
        </div>`;
      return `
        ${_treBanner}
        <div style="margin-bottom:6px;font-size:13px;font-weight:700;color:#aaccff;">💎 目前擁有至寶 共 ${_owned.length} 個${_polCount?` (<span style="color:#ff8888;">${_polCount} 件來源不明</span>)`:''}</div>
        ${_treBatchBar}
        <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:12px;min-width:680px;">
          <thead><tr style="background:rgba(140,180,255,0.15);">
            <th style="padding:5px 4px;text-align:center;color:#cce;width:28px;">✓</th>
            <th style="padding:5px 8px;text-align:left;color:#cce;">至寶</th>
            <th style="padding:5px 8px;text-align:left;color:#cce;">ID</th>
            <th style="padding:5px 8px;text-align:center;color:#cce;">等級</th>
            <th style="padding:5px 8px;text-align:left;color:#cce;">裝備在</th>
            <th style="padding:5px 8px;text-align:center;color:#cce;">投資</th>
            <th style="padding:5px 8px;text-align:left;color:#cce;">來源</th>
          </tr></thead><tbody>${_rows}</tbody>
        </table></div>`;
    }

    function _renderTreasureTab(list){
      list = Array.isArray(list) ? list : [];
      const _ownedHtml = _buildOwnedTreasuresHtml();
      if(!list.length){
        _contentEl.innerHTML = _ownedHtml
          + `<div style="border-top:1px dashed rgba(140,180,255,0.25);padding-top:8px;text-align:center;color:#888;font-size:13px;">尚無至寶解鎖紀錄</div>`;
        _bindTreNoticeBtn();
        return;
      }
      const conflictKeys = _buildMultiBattleSet(list, 'id');
      const rows = list.map(e => {
        const k = (e.at || 0) + '|' + (e.id || '');
        const isConflict = conflictKeys.has(k);
        const isAdminAction = (e.source === 'admin_delete' || e.source === 'admin_grant');
        const rowBg = isConflict ? 'background:rgba(200,40,40,0.18);' : (isAdminAction ? 'background:rgba(140,100,200,0.15);' : '');
        const srcTag = e.source === 'admin_delete' ? '<span style="color:#ff8888">🗑 admin_delete</span>'
                     : e.source === 'admin_grant' ? '<span style="color:#cc88ff">➕ admin_grant</span>'
                     : `<span style="color:#aac;">${_esc(e.source || 'other')}</span>`;
        return `<tr style="${rowBg}border-bottom:1px solid rgba(255,255,255,0.06);">
          <td style="padding:6px 8px;font-size:12px;color:#ffe;font-family:monospace;">${_esc(e.id || '?')}</td>
          <td style="padding:6px 8px;font-size:11px;color:#aac;">${_fmtTime(e.at)}</td>
          <td style="padding:6px 8px;font-size:11px;">${srcTag}</td>
          <td style="padding:6px 8px;font-size:11px;color:${isConflict ? '#ffaaaa' : '#778'};" title="${_esc(e.battleId || '')}">${_shortBid(e.battleId)}${isConflict ? ' ⚠' : ''}</td>
          <td style="padding:6px 8px;text-align:right;">
            <button class="_aa-del-tre" data-at="${e.at}" data-id="${_esc(e.id || '')}"
              style="padding:4px 10px;font-size:11px;background:#882233;color:#fff;border:none;border-radius:4px;cursor:pointer;">🗑 刪</button>
            <button class="_aa-del-tre-full" data-id="${_esc(e.id || '')}"
              style="padding:4px 10px;font-size:11px;background:#cc3344;color:#fff;border:none;border-radius:4px;cursor:pointer;margin-left:4px;" title="清除至寶實體 + 紀錄">🚫 整個刪</button>
          </td>
        </tr>`;
      }).join('');
      _contentEl.innerHTML = `
        ${_ownedHtml}
        <div style="border-top:1px dashed rgba(140,180,255,0.25);padding-top:8px;margin-bottom:6px;font-size:12px;color:#aac;">至寶解鎖紀錄 共 ${list.length} 筆 ${conflictKeys.size > 0 ? `(<span style="color:#ff8888">${conflictKeys.size} 筆異常 — 同 battleId 或 3 分鐘內打 BOSS 多解鎖</span>)` : ''}</div>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead><tr style="background:rgba(140,180,255,0.15);">
            <th style="padding:6px 8px;text-align:left;color:#cce;">至寶 ID</th>
            <th style="padding:6px 8px;text-align:left;color:#cce;">時間</th>
            <th style="padding:6px 8px;text-align:left;color:#cce;">來源</th>
            <th style="padding:6px 8px;text-align:left;color:#cce;min-width:200px;">場次 (BOSS / 時間)</th>
            <th style="padding:6px 8px;text-align:right;color:#cce;">動作</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `;
      _bindTreasureRowButtons();
    }

    // ★ v3.13.49b — 至寶頁「發出刪除預告」按鈕(開英雄/至寶合併預告 modal)
    function _bindTreNoticeBtn(){
      const _b = document.getElementById('_pp-tre-notice-btn');
      if(_b) _b.onclick = function(){
        const _full = (_curData && _curData.full) || {};
        const _polHeroes = (Array.isArray(_full.ownedHeroes) ? _full.ownedHeroes : []).filter(h => h && h.cat === 'pollution');
        _openPollutionPurgeNoticeModal(_polHeroes);
      };
    }

    function _bindTreasureRowButtons(){
      _bindTreNoticeBtn();
      // ★ v3.13.68 — 至寶擁有區批次勾選刪除 + 退補償 + 通知
      const _treOwned = ((_curData && _curData.full && _curData.full.ownedTreasures) || []);
      const _treSelInfo = document.getElementById('_aa-own-tre-selinfo');
      function _updTreSelInfo(){
        const _n = _contentEl.querySelectorAll('._aa-own-tre-cb:checked').length;
        if(_treSelInfo) _treSelInfo.textContent = '已選 ' + _n + ' 件';
      }
      _contentEl.querySelectorAll('._aa-own-tre-cb').forEach(cb => { cb.onchange = _updTreSelInfo; });
      const _treAllB = document.getElementById('_aa-own-tre-all');
      const _treNoneB = document.getElementById('_aa-own-tre-none');
      if(_treAllB) _treAllB.onclick = function(){ _contentEl.querySelectorAll('._aa-own-tre-cb').forEach(cb => { cb.checked = true; }); _updTreSelInfo(); };
      if(_treNoneB) _treNoneB.onclick = function(){ _contentEl.querySelectorAll('._aa-own-tre-cb').forEach(cb => { cb.checked = false; }); _updTreSelInfo(); };
      const _treBatchB = document.getElementById('_aa-own-tre-batch-btn');
      if(_treBatchB) _treBatchB.onclick = function(){
        const _ids = Array.from(_contentEl.querySelectorAll('._aa-own-tre-cb:checked')).map(cb => cb.dataset.id);
        if(!_ids.length){ alert('請先勾選要刪除的至寶'); return; }
        const _sel = _ids.map(id => _treOwned.find(t => t && t.id === id) || { id: id, lv: 1 });
        _openBatchCleanup('treasure', _sel);
      };
      _contentEl.querySelectorAll('._aa-del-tre').forEach(btn => {
        btn.onclick = async function(){
          const at = parseInt(btn.dataset.at, 10);
          const id = btn.dataset.id;
          if(!confirm(`刪除這筆至寶解鎖紀錄?\n\n至寶: ${id}\n時間: ${_fmtTime(at)}\n\n⚠ 只刪「紀錄」,不會把已擁有的至寶拿掉。`)) return;
          btn.disabled = true; btn.textContent = '⏳';
          try{
            await window._fbAdminDeletePlayerActivityEntry(_curUid, 'treasure_history', { at, id }, { reason: 'GM 後台 → 玩家活動記錄查詢' });
            _setStatus('✅ 已刪除至寶解鎖紀錄,重新查詢中...', '#88ddaa');
            await _doQuery();
          }catch(e){
            _setStatus('❌ 刪除失敗: ' + (e.message || e), '#ff8866');
            btn.disabled = false; btn.textContent = '🗑 刪';
          }
        };
      });
      _contentEl.querySelectorAll('._aa-del-tre-full').forEach(btn => {
        btn.onclick = async function(){
          const id = btn.dataset.id;
          if(!confirm(`🚫 整個刪除至寶「${id}」?\n\n會清掉 taiwanTreasureData[${id}] + 寫 admin_delete audit。\n\n⚠ 不可逆!`)) return;
          btn.disabled = true; btn.textContent = '⏳';
          try{
            await window._fbAdminDeleteTreasure(_curUid, id, { reason: 'GM 後台 → 玩家活動記錄查詢 整個刪' });
            _setStatus(`✅ 已整個刪除至寶 ${id},重新查詢中...`, '#88ddaa');
            await _doQuery();
          }catch(e){
            _setStatus('❌ 刪除失敗: ' + (e.message || e), '#ff8866');
            btn.disabled = false; btn.textContent = '🚫 整個刪';
          }
        };
      });
    }

    function _renderBattleTab(list){
      if(!list.length){
        _contentEl.innerHTML = `<div style="text-align:center;color:#888;padding:20px;font-size:13px;">尚無戰鬥紀錄</div>`;
        return;
      }
      const rows = list.map(e => {
        const t = e.type || 'boss_battle';
        const typeLabel = t === 'world_boss' ? '🌍 世界 BOSS' : t === 'boss_loss' ? '💀 失敗' : '⚔ BOSS 戰';
        const winColor = e.win === false ? '#ff8866' : '#88ddaa';
        const winText = e.win === false ? '✗ 失敗' : '✓ 勝利';
        const r = e.rewards || {};
        const heroes = (r.heroes || []).join(', ') || '—';
        const tres = (r.treasures || []).join(', ') || '—';
        const heroBadge = (r.heroes || []).length > 1 ? `<span style="color:#ff8866;">⚠ ${r.heroes.length}</span>` : `<span style="color:#aac;">${(r.heroes || []).length}</span>`;
        const treBadge = (r.treasures || []).length > 1 ? `<span style="color:#ff8866;">⚠ ${r.treasures.length}</span>` : `<span style="color:#aac;">${(r.treasures || []).length}</span>`;
        return `<tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
          <td style="padding:6px 8px;font-size:11px;color:#aac;">${_fmtTime(e.at)}</td>
          <td style="padding:6px 8px;font-size:11px;color:#cce;">${typeLabel}</td>
          <td style="padding:6px 8px;font-size:12px;color:#ffe;">${_esc(e.bossName || '—')}</td>
          <td style="padding:6px 8px;font-size:11px;color:${winColor};">${winText}${e.grade ? ' (' + _esc(e.grade) + ')' : ''}</td>
          <td style="padding:6px 8px;font-size:11px;text-align:center;">🦸${heroBadge}</td>
          <td style="padding:6px 8px;font-size:11px;text-align:center;">💎${treBadge}</td>
          <td style="padding:6px 8px;font-size:11px;color:#778;font-family:monospace;" title="${_esc(e.battleId)}">${_shortBid(e.battleId)}</td>
          <td style="padding:6px 8px;text-align:right;">
            <button class="_aa-del-battle" data-bid="${_esc(e.battleId)}" data-type="${_esc(t)}"
              style="padding:4px 10px;font-size:11px;background:#882233;color:#fff;border:none;border-radius:4px;cursor:pointer;">🗑</button>
          </td>
        </tr>`;
      }).join('');
      _contentEl.innerHTML = `
        <div style="margin-bottom:6px;font-size:12px;color:#aac;">共 ${list.length} 場(最近 50)</div>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead><tr style="background:rgba(140,180,255,0.15);">
            <th style="padding:6px 8px;text-align:left;color:#cce;">時間</th>
            <th style="padding:6px 8px;text-align:left;color:#cce;">類型</th>
            <th style="padding:6px 8px;text-align:left;color:#cce;">BOSS</th>
            <th style="padding:6px 8px;text-align:left;color:#cce;">結果</th>
            <th style="padding:6px 8px;text-align:center;color:#cce;">新英雄</th>
            <th style="padding:6px 8px;text-align:center;color:#cce;">新至寶</th>
            <th style="padding:6px 8px;text-align:left;color:#cce;min-width:200px;">場次 (BOSS / 時間)</th>
            <th style="padding:6px 8px;text-align:right;color:#cce;"></th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `;
      _contentEl.querySelectorAll('._aa-del-battle').forEach(btn => {
        btn.onclick = async function(){
          const bid = btn.dataset.bid; const type = btn.dataset.type;
          if(!confirm(`刪除這筆戰鬥紀錄?\n\nbattleId: ${bid}\ntype: ${type}\n\n⚠ 只刪紀錄,不會回滾獎勵。`)) return;
          btn.disabled = true; btn.textContent = '⏳';
          try{
            await window._fbAdminDeletePlayerActivityEntry(_curUid, 'battle_history', { battleId: bid, type }, { reason: 'GM 後台 → 戰鬥紀錄' });
            _setStatus('✅ 已刪除,重新查詢中...', '#88ddaa');
            await _doQuery();
          }catch(e){
            _setStatus('❌ 刪除失敗: ' + (e.message || e), '#ff8866');
            btn.disabled = false; btn.textContent = '🗑';
          }
        };
      });
    }

    function _renderCoinTab(list){
      // ★ v3.13.48 — 跨槽「歷史最高持有」查詢面板(回答「他真的持有過多少錢」)
      const _peakHtml = `
        <div style="background:rgba(20,40,30,0.45);border-left:4px solid #66cc88;padding:12px;border-radius:8px;margin-bottom:14px;">
          <div style="font-size:13px;color:#aaeebb;font-weight:700;margin-bottom:6px;">🔎 查歷史最高持有(跨 main / live / safe 三槽 + 帳本)</div>
          <button id="_aa-coin-peak-btn" style="padding:7px 16px;font-size:13px;font-weight:700;background:#2c8c5e;color:#fff;border:none;border-radius:6px;cursor:pointer;font-family:inherit;">查跨槽歷史最高</button>
          <span style="font-size:11px;color:#9b9;margin-left:8px;">帳本 v3.13.48 起才記;更早高峰只能從三槽快照推估</span>
          <div id="_aa-coin-peak-result" style="margin-top:8px;font-size:12px;color:#dfe;line-height:1.6;"></div>
        </div>`;
      function _wirePeak(){
        const pkBtn = _contentEl.querySelector('#_aa-coin-peak-btn');
        const pkRes = _contentEl.querySelector('#_aa-coin-peak-result');
        if(!pkBtn) return;
        pkBtn.onclick = async function(){
          if(!_curUid){ if(pkRes){ pkRes.style.color='#ffcc66'; pkRes.textContent='請先查詢玩家'; } return; }
          if(typeof window._fbAdminAuditCoins !== 'function'){ if(pkRes){ pkRes.style.color='#ff8866'; pkRes.textContent='❌ _fbAdminAuditCoins 未載入,請重新整理'; } return; }
          pkBtn.disabled=true; if(pkRes){ pkRes.style.color='#ccc'; pkRes.textContent='查詢中...'; }
          try{
            const r = await window._fbAdminAuditCoins(_curUid);
            if(!r || !r.ok){ if(pkRes){ pkRes.style.color='#ff8866'; pkRes.textContent='❌ '+_esc((r&&r.reason)||'失敗'); } pkBtn.disabled=false; return; }
            const sn = (r.snapshots||[]).map(s => '・'+_esc(s.slot)+':目前 '+(s.knowledgeCoins||0).toLocaleString()
              + (s.summaryCoins!=null?(' / 摘要 '+s.summaryCoins.toLocaleString()):'')
              + (s.prevSummaryCoins!=null?(' / 前次 '+s.prevSummaryCoins.toLocaleString()):'')).join('<br>');
            if(pkRes){ pkRes.style.color='#dfe'; pkRes.innerHTML =
              '<b style="color:#ffe066;font-size:15px;">歷史可證最高:'+(r.maxObserved||0).toLocaleString()+' 知識幣</b><br>'
              + '目前餘額(各槽最大):'+(r.currentCoins||0).toLocaleString()+'<br>'+sn
              + '<br><span style="color:#9b9;">帳本筆數:'+(r.ledgerCount||0)+'(下方表格顯示明細)</span>'; }
            pkBtn.disabled=false;
          }catch(e){ if(pkRes){ pkRes.style.color='#ff8866'; pkRes.textContent='❌ '+_esc(e.message||e); } pkBtn.disabled=false; }
        };
      }
      if(!list.length){
        _contentEl.innerHTML = _peakHtml + `
          <div style="text-align:center;color:#888;padding:20px;font-size:13px;">
            尚無知識幣帳目紀錄<br>
            <span style="font-size:11px;color:#665;">(帳本已於 v3.13.48 啟用;玩家有金流變動、且該帳號重新上線同步後就會出現)</span>
          </div>
          <div style="background:rgba(40,30,60,0.4);border-left:4px solid #cc88ff;padding:12px;border-radius:8px;margin-top:14px;">
            <div style="font-size:13px;color:#ddccff;margin-bottom:8px;font-weight:700;">💰 手動調整知識幣餘額</div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
              <input id="_aa-coin-new" type="number" placeholder="新餘額" style="padding:6px 10px;width:140px;background:rgba(0,0,0,0.5);color:#fff;border:1px solid #886;border-radius:4px;font-family:inherit;">
              <input id="_aa-coin-reason" type="text" placeholder="原因(必填)" style="padding:6px 10px;flex:1;min-width:160px;background:rgba(0,0,0,0.5);color:#fff;border:1px solid #886;border-radius:4px;font-family:inherit;">
              <button id="_aa-coin-set" style="padding:7px 16px;font-size:13px;font-weight:700;background:#aa44cc;color:#fff;border:none;border-radius:6px;cursor:pointer;">強制覆寫</button>
            </div>
          </div>
        `;
        _bindCoinSetBtn();
        _wirePeak();
        return;
      }
      const rows = list.map(e => {
        const inout = (e.amount || 0) >= 0 ? `<span style="color:#88ddaa">+${e.amount}</span>` : `<span style="color:#ff8866">${e.amount}</span>`;
        return `<tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
          <td style="padding:6px 8px;font-size:11px;color:#aac;">${_fmtTime(e.at)}</td>
          <td style="padding:6px 8px;font-size:12px;text-align:right;font-weight:700;">${inout}</td>
          <td style="padding:6px 8px;font-size:11px;color:#cce;">${_esc(e.reason || '—')}</td>
          <td style="padding:6px 8px;font-size:11px;color:#ffdd66;text-align:right;">${e.balance != null ? e.balance : '—'}</td>
          <td style="padding:6px 8px;text-align:right;">
            <button class="_aa-del-coin" data-at="${e.at}" data-id="${_esc(e.id || '')}"
              style="padding:4px 10px;font-size:11px;background:#882233;color:#fff;border:none;border-radius:4px;cursor:pointer;">🗑</button>
          </td>
        </tr>`;
      }).join('');
      _contentEl.innerHTML = _peakHtml + `
        <div style="margin-bottom:6px;font-size:12px;color:#aac;">共 ${list.length} 筆</div>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead><tr style="background:rgba(140,180,255,0.15);">
            <th style="padding:6px 8px;text-align:left;color:#cce;">時間</th>
            <th style="padding:6px 8px;text-align:right;color:#cce;">變動</th>
            <th style="padding:6px 8px;text-align:left;color:#cce;">原因</th>
            <th style="padding:6px 8px;text-align:right;color:#cce;">餘額</th>
            <th style="padding:6px 8px;text-align:right;color:#cce;"></th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="background:rgba(40,30,60,0.4);border-left:4px solid #cc88ff;padding:12px;border-radius:8px;margin-top:14px;">
          <div style="font-size:13px;color:#ddccff;margin-bottom:8px;font-weight:700;">💰 手動調整知識幣餘額</div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <input id="_aa-coin-new" type="number" placeholder="新餘額" style="padding:6px 10px;width:140px;background:rgba(0,0,0,0.5);color:#fff;border:1px solid #886;border-radius:4px;font-family:inherit;">
            <input id="_aa-coin-reason" type="text" placeholder="原因(必填)" style="padding:6px 10px;flex:1;min-width:160px;background:rgba(0,0,0,0.5);color:#fff;border:1px solid #886;border-radius:4px;font-family:inherit;">
            <button id="_aa-coin-set" style="padding:7px 16px;font-size:13px;font-weight:700;background:#aa44cc;color:#fff;border:none;border-radius:6px;cursor:pointer;">強制覆寫</button>
          </div>
        </div>
      `;
      _contentEl.querySelectorAll('._aa-del-coin').forEach(btn => {
        btn.onclick = async function(){
          const at = parseInt(btn.dataset.at, 10);
          const id = btn.dataset.id;
          if(!confirm(`刪除這筆幣帳紀錄?\n\n時間: ${_fmtTime(at)}\n\n⚠ 只刪紀錄,實際幣值不會變。若要改餘額請用下方「強制覆寫」。`)) return;
          btn.disabled = true; btn.textContent = '⏳';
          try{
            await window._fbAdminDeletePlayerActivityEntry(_curUid, 'coin_tx', { at, id }, { reason: 'GM 後台 → 幣帳' });
            _setStatus('✅ 已刪除,重新查詢中...', '#88ddaa');
            await _doQuery();
          }catch(e){
            _setStatus('❌ 刪除失敗: ' + (e.message || e), '#ff8866');
            btn.disabled = false; btn.textContent = '🗑';
          }
        };
      });
      _bindCoinSetBtn();
      _wirePeak();
    }

    // ★ v3.13.49(2026-06-05)— 🍑 果實分頁:目前持有 + 取得來源歷史 + 異常標紅
    function _renderFruitTab(list){
      list = Array.isArray(list) ? list : [];
      const _cur = parseInt((_curData && _curData.currentFruitCount), 10) || 0;
      let _ab = { entries: [], totalCount: 0 };
      try{ _ab = _detectFruitAnomalies(list); }catch(_){}
      // 異常 entry 的 key set(標紅)
      const _abKeys = new Set();
      (_ab.entries || []).forEach(a => { if(a && a.entry){ _abKeys.add((a.entry.at||0) + '|' + (a.entry.source||'')); } });
      const _abReason = {};
      (_ab.entries || []).forEach(a => { if(a && a.entry){ _abReason[(a.entry.at||0) + '|' + (a.entry.source||'')] = a.reason || ''; } });
      const _sorted = list.slice().sort((a,b)=>(b.at||0)-(a.at||0));
      const _rows = _sorted.map(e => {
        const _k = (e.at||0) + '|' + (e.source||'');
        const _isAb = _abKeys.has(_k);
        const _isAdmin = (e.source === 'admin_delete' || e.source === 'admin_grant');
        const _bg = _isAb ? 'background:rgba(200,40,40,0.18);' : (_isAdmin ? 'background:rgba(140,100,200,0.13);' : '');
        const _src = e.source === 'admin_delete' ? '<span style="color:#ff8888">🗑 admin_delete</span>'
                   : e.source === 'admin_grant' ? '<span style="color:#cc88ff">➕ admin_grant</span>'
                   : `<span style="color:#aac;">${_esc(e.source || 'other')}</span>`;
        return `<tr style="${_bg}border-bottom:1px solid rgba(255,255,255,0.06);">
          <td style="padding:6px 8px;font-size:11px;color:#aac;">${_fmtTime(e.at)}</td>
          <td style="padding:6px 8px;font-size:11px;">${_src}</td>
          <td style="padding:6px 8px;font-size:12px;color:#ffe;text-align:center;">${parseInt(e.count,10)||1}</td>
          <td style="padding:6px 8px;font-size:11px;color:${_isAb?'#ffaaaa':'#778'};">${_isAb ? ('⚠ ' + _esc(_abReason[_k]||'異常')) : ''}</td>
        </tr>`;
      }).join('');
      _contentEl.innerHTML = `
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px;">
          <div style="flex:1;min-width:160px;background:rgba(30,40,20,0.5);border-left:4px solid #cc4;border-radius:8px;padding:12px;">
            <div style="font-size:12px;color:#dd8;">🍑 目前持有超越極限果實</div>
            <div style="font-size:26px;font-weight:900;color:#ffe066;">${_cur}</div>
          </div>
          <div style="flex:1;min-width:160px;background:rgba(40,20,20,0.5);border-left:4px solid ${_ab.totalCount>0?'#ff6644':'#556'};border-radius:8px;padding:12px;">
            <div style="font-size:12px;color:#fbb;">⚠ 偵測異常果實(BOSS 同場多顆)</div>
            <div style="font-size:26px;font-weight:900;color:${_ab.totalCount>0?'#ff8866':'#8a8'};">${_ab.totalCount}</div>
          </div>
        </div>
        ${_ab.totalCount>0 ? `<div style="font-size:12px;color:#ffcc99;margin-bottom:8px;line-height:1.5;">💡 異常果實清除 + 補償請到「🦸 英雄」分頁上方的「📦 開啟勾選清除介面」一併處理(同場保留 1 顆,其餘視為異常)。</div>` : ''}
        <div style="margin-bottom:6px;font-size:12px;color:#aac;">果實取得紀錄 共 ${list.length} 筆</div>
        ${list.length ? `<table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead><tr style="background:rgba(180,180,80,0.15);">
            <th style="padding:6px 8px;text-align:left;color:#ee9;">時間</th>
            <th style="padding:6px 8px;text-align:left;color:#ee9;">來源</th>
            <th style="padding:6px 8px;text-align:center;color:#ee9;">數量</th>
            <th style="padding:6px 8px;text-align:left;color:#ee9;">異常</th>
          </tr></thead><tbody>${_rows}</tbody></table>`
        : `<div style="text-align:center;color:#888;padding:16px;font-size:13px;">尚無果實取得紀錄</div>`}
      `;
    }

    // ★ v3.13.49(2026-06-05)— 📋 完整資料分頁(老師「全加」需求):一頁看完玩家其餘所有雲端記錄(read-only)
    //   背包 / 勳章 / 寵物 / 皮膚 / 答題進度 / 知識王 / 陣容 / 日本進度 / 好友送禮 / 每日商店 / 進度快照 / 健康度摘要 / 管理員最後動作 / 設定
    function _renderFullTab(full){
      full = full || {};
      const _num = (n) => (parseInt(n,10)||0).toLocaleString();
      // 小工具:可摺疊區塊
      const _sec = (icon, title, innerHtml, openByDefault) => `
        <details ${openByDefault ? 'open' : ''} style="margin-bottom:8px;background:rgba(255,255,255,0.03);border:1px solid rgba(140,180,255,0.18);border-radius:8px;overflow:hidden;">
          <summary style="cursor:pointer;padding:9px 12px;font-size:13px;font-weight:700;color:#bcdcff;background:rgba(140,180,255,0.08);list-style:none;">${icon} ${title}</summary>
          <div style="padding:10px 12px;font-size:12px;color:#dde;line-height:1.6;">${innerHtml || '<span style="color:#888;">(無資料)</span>'}</div>
        </details>`;
      // key-value 物件 → 表格(item: qty)
      const _kvTable = (obj, kLabel, vLabel, fmtV) => {
        const _ks = Object.keys(obj || {});
        if(!_ks.length) return '<span style="color:#888;">(無)</span>';
        const _rows = _ks.map(k => {
          let _v = obj[k];
          if(fmtV) _v = fmtV(_v, k);
          else if(_v && typeof _v === 'object') _v = _esc(JSON.stringify(_v));
          else _v = _esc(String(_v));
          return `<tr><td style="padding:3px 8px;border-bottom:1px solid rgba(255,255,255,0.06);color:#cce;">${_esc(k)}</td><td style="padding:3px 8px;border-bottom:1px solid rgba(255,255,255,0.06);color:#ffe;text-align:right;">${_v}</td></tr>`;
        }).join('');
        return `<table style="width:100%;border-collapse:collapse;font-size:12px;"><thead><tr style="color:#9ab;"><th style="padding:3px 8px;text-align:left;">${kLabel||'項目'}</th><th style="padding:3px 8px;text-align:right;">${vLabel||'數量/值'}</th></tr></thead><tbody>${_rows}</tbody></table>`;
      };
      const _chips = (arr) => {
        const _a = Array.isArray(arr) ? arr : [];
        if(!_a.length) return '<span style="color:#888;">(無)</span>';
        return _a.map(x => `<span style="display:inline-block;background:rgba(140,180,255,0.12);border:1px solid rgba(140,180,255,0.3);border-radius:10px;padding:2px 9px;margin:2px;font-size:11px;color:#cdf;">${_esc(typeof x==='object'?JSON.stringify(x):String(x))}</span>`).join('');
      };
      const _jsonBlock = (obj) => {
        try{
          const _s = JSON.stringify(obj, null, 1);
          if(!_s || _s === '{}' || _s === '[]' || _s === 'null') return '<span style="color:#888;">(無)</span>';
          return `<pre style="white-space:pre-wrap;word-break:break-word;background:rgba(0,0,0,0.35);border-radius:6px;padding:8px;max-height:240px;overflow:auto;font-size:11px;color:#bcd;">${_esc(_s)}</pre>`;
        }catch(_){ return '<span style="color:#888;">(無法顯示)</span>'; }
      };

      // ── 勳章 ──
      const _medals = full.playerMedals || {};
      const _medalStats = full.medalStats || {};
      const _medalCount = Object.keys(_medals).length;
      const _medalHtml = (_medalCount ? `<div style="margin-bottom:6px;color:#ffd966;">已獲得勳章:<b>${_medalCount}</b> 枚</div>${_chips(Object.keys(_medals))}` : '<span style="color:#888;">(無勳章)</span>')
        + (Object.keys(_medalStats).length ? `<div style="margin-top:8px;color:#9ab;">統計欄位:</div>${_kvTable(_medalStats,'統計','值')}` : '');

      // ── 背包 ──
      const _bp = full.playerBackpack || {};
      const _bpHtml = _kvTable(_bp, '道具 ID', '數量', (v)=> _num(v));

      // ── 皮膚 ──
      const _skins = full.heroPortraitUnlocked || {};
      const _skinKeys = Object.keys(_skins);
      const _skinHistN = Array.isArray(full.skinUnlockHistory) ? full.skinUnlockHistory.length : 0;
      const _skinHtml = (_skinKeys.length ? `<div style="margin-bottom:6px;">已解鎖皮膚的英雄:<b>${_skinKeys.length}</b></div>` + _skinKeys.map(h => `<div style="margin:2px 0;color:#cde;"><b>${_esc(h)}</b>:${_chips(Array.isArray(_skins[h])?_skins[h]:[_skins[h]])}</div>`).join('') : '<span style="color:#888;">(無自訂皮膚)</span>')
        + `<div style="margin-top:6px;color:#9ab;">皮膚購買紀錄:${_skinHistN} 筆</div>`;

      // ── 答題進度 / 知識王 ──
      const _pcq = full.persistentCorrectQuestions || {};
      const _pcqCount = Object.keys(_pcq).length;
      const _king = full.kingChallenge || {};
      const _quizHtml = `<div style="color:#cde;">累計答對(去重)題數:<b>${_num(_pcqCount)}</b></div>`
        + (Object.keys(_king).length ? `<div style="margin-top:6px;color:#9ab;">知識王挑戰:</div>${_jsonBlock(_king)}` : '');

      // ── 陣容 ──
      const _teamHtml = `<div style="color:#9ab;">鬥技場預設陣容:</div>${_jsonBlock(full.arenaPresetTeams)}<div style="margin-top:6px;color:#9ab;">冒險預設陣容:</div>${_jsonBlock(full.advPresetTeams)}`;

      // ── 進度快照 / 健康度摘要 ──
      const _ds = full.dataSummary || {};
      const _pds = full.prevDataSummary || {};
      const _summaryHtml = `<div style="color:#9ab;">最新健康度摘要(_dataSummary):</div>${_jsonBlock(_ds)}<div style="margin-top:6px;color:#9ab;">前一次摘要(_prevDataSummary):</div>${_jsonBlock(_pds)}<div style="margin-top:6px;color:#9ab;">冒險快照摘要(advSnapshot,僅顯示存在與否):</div><div style="color:#cde;">${full.advSnapshot ? '✅ 有快照' : '—'}</div>`;

      _contentEl.innerHTML = `
        <div style="font-size:12px;color:#9bf;margin-bottom:10px;line-height:1.6;">📋 此頁彙整玩家「其餘所有」雲端記錄(唯讀);英雄/至寶/戰鬥/幣/果實請看各自分頁。</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;">
          <div style="background:rgba(20,40,30,0.5);border-radius:8px;padding:8px 14px;font-size:12px;color:#cde;">💰 知識幣 <b style="color:#ffe066;">${_num(full.knowledgeCoins)}</b></div>
          <div style="background:rgba(40,20,40,0.5);border-radius:8px;padding:8px 14px;font-size:12px;color:#cde;">❤ 友情點 <b style="color:#ff99cc;">${_num(full.friendshipHeart)}</b></div>
          <div style="background:rgba(20,30,50,0.5);border-radius:8px;padding:8px 14px;font-size:12px;color:#cde;">🦸 擁有英雄 <b>${(Array.isArray(full.unlockedHeroes)?full.unlockedHeroes.length:0)}</b></div>
          <div style="background:rgba(30,30,20,0.5);border-radius:8px;padding:8px 14px;font-size:12px;color:#cde;">⚔ 冒險最佳分 <b>${_num(full.advBestScore)}</b></div>
        </div>
        ${_sec('📦','背包道具', _bpHtml, true)}
        ${_sec('🏅','勳章 / 成就', _medalHtml)}
        ${_sec('🐾','寵物(曾收集)', _chips(full.petsEverCollected))}
        ${_sec('🎨','皮膚 / 肖像', _skinHtml)}
        ${_sec('📚','答題進度 / 知識王', _quizHtml)}
        ${_sec('⚔','預設陣容', _teamHtml)}
        ${_sec('🗾','日本三神器進度', _jsonBlock(full.japanProgress))}
        ${_sec('🎁','好友送禮紀錄', _jsonBlock(full.giftHistory))}
        ${_sec('🛒','每日商店資料', _jsonBlock(full.shopDailyData))}
        ${_sec('📸','進度快照 / 健康度摘要', _summaryHtml)}
        ${_sec('🔧','管理員最後動作', _jsonBlock(full.adminLastAction))}
        ${_sec('⚙','遊戲設定', _jsonBlock(full.settings))}
      `;
    }

    function _bindCoinSetBtn(){
      const setBtn = document.getElementById('_aa-coin-set');
      if(!setBtn) return;
      setBtn.onclick = async function(){
        const v = parseInt((document.getElementById('_aa-coin-new')||{}).value, 10);
        const reason = ((document.getElementById('_aa-coin-reason')||{}).value || '').trim();
        if(isNaN(v) || v < 0) { alert('請輸入有效新餘額(>= 0)'); return; }
        if(!reason) { alert('請填寫原因'); return; }
        if(!confirm(`強制覆寫知識幣餘額為 ${v}?\n\n原因: ${reason}\n\n⚠ 不可逆!`)) return;
        setBtn.disabled = true;
        try{
          await window._fbAdminOverwritePlayerData(_curUid, { knowledgeCoins: v }, { reason });
          _setStatus(`✅ 已覆寫知識幣為 ${v}`, '#88ddaa');
          await _doQuery();
        }catch(e){
          _setStatus('❌ 覆寫失敗: ' + (e.message || e), '#ff8866');
        }finally{
          setBtn.disabled = false;
        }
      };
    }

    // ════════════════════════════════════════════════════════════════
    // ★ v3.11.35d(2026-05-29) — 一鍵清除異常 + 自動補償 + 個人通知
    //
    //   邏輯:
    //     1. 找出所有衝突 cluster(battleId + 時間窗)
    //     2. 每個 cluster 按 at 排序,保留第 1 隻,第 2 隻起列入刪除
    //     3. 計算每隻被刪英雄的補償(查 _curData.heroDetails)
    //     4. 顯示預覽 modal → 老師確認 → 呼叫 _fbAdminCleanupAndCompensate
    //
    //   ⚠ 個人通知**只說自己被清了什麼、補償了什麼**(不夾大公告)
    //   ⚠ 大公告請走 GM 公告區的「📜 BUG 修補公告範本」按鈕,給所有玩家看
    // ════════════════════════════════════════════════════════════════

    // 補償公式:每隻被刪英雄回饋多少
    function _computeCompensationForHero(heroName, heroDetails){
      heroDetails = heroDetails || {};
      const _lv = parseInt((heroDetails.heroLevels || {})[heroName], 10) || 1;
      const _skill = (heroDetails.heroSkillLevels || {})[heroName] || {};
      const _s1 = parseInt(_skill.s1, 10) || 0;
      const _s2 = parseInt(_skill.s2, 10) || 0;
      const _burst = parseInt((heroDetails.heroBurstLevels || {})[heroName], 10) || 0;
      const _invObj = (heroDetails.heroStatInvested || {})[heroName] || {};
      const _invTotal = (_invObj.hp || 0) + (_invObj.atk || 0) + (_invObj.sp || 0) + (_invObj.spd || 0);
      const _freePoints = parseInt((heroDetails.heroStatPoints || {})[heroName], 10) || 0;
      const _isSSR = (typeof window._getHeroRarity === 'function')
        ? (window._getHeroRarity(heroName) === 'SSR')
        : true;
      // 公式(只賠回玩家自己投入的資源,不額外給 SSR 召喚卷):
      //   - 知識幣 = 等級 × 1000(賠回升級成本)
      //   - skill_upgrade_book = s1Lv + s2Lv(賠回升級書)
      //   - burst_upgrade_fruit = burst level(每顆貴重)
      //   - hero_exp_book_premium = 1(基本心意)
      //   ⚠ 不補 SSR 召喚卷 — 老師明確指示:他們本來就不該多那隻 SSR,
      //     補卷等於變相鼓勵刷 BUG,回收要乾淨。
      const _comp = {
        coins: _lv * 1000,
        items: {},
        meta: { hero: heroName, lv: _lv, s1: _s1, s2: _s2, burst: _burst,
                investedPts: _invTotal, freePts: _freePoints, isSSR: _isSSR },
      };
      if(_s1 + _s2 > 0) _comp.items.skill_upgrade_book = _s1 + _s2;
      if(_burst > 0) _comp.items.burst_upgrade_fruit = _burst;
      _comp.items.hero_exp_book_premium = 1;
      return _comp;
    }

    // ★ v3.13.49b — 至寶補償:知識幣(升級累積花費)+ 至寶經驗卷軸(升級累積用量)
    //   至寶 Lv L→L+1 需 (10000+L*5000) 幣;每張卷軸 +10 EXP;累積 EXP 表 [0,10,30,...,550](Lv10)
    function _computeCompensationForTreasure(treasureId, ownedTreasures){
      let _lv = 1;
      try{
        const _t = (Array.isArray(ownedTreasures) ? ownedTreasures : []).find(x => x && x.id === treasureId);
        if(_t) _lv = parseInt(_t.lv, 10) || 1;
      }catch(_){}
      const _CUM = [0,10,30,60,100,150,210,280,360,450,550];
      const _lvC = Math.max(0, Math.min(10, _lv));
      const _scrolls = Math.round((_CUM[_lvC] || 0) / 10);  // 升到此級用掉的卷軸數
      let _coins = 0; for(let i=0;i<_lvC;i++){ _coins += (10000 + i*5000); }
      const _comp = { coins:_coins, items:{}, meta:{ treasure:treasureId, lv:_lvC } };
      if(_scrolls > 0) _comp.items.treasure_exp_scroll = Math.min(99, _scrolls);
      return _comp;
    }

    // 計算「保留第 1 隻 / 刪除其餘」清單
    function _computeDeleteList(heroList){
      const _toDelete = [];        // [{name, at, clusterKey, clusterReason}]
      const _kept = [];            // [{name, at, clusterKey}]
      // 規則 1:battleId 衝突 — 同 battleId 多筆,保留 at 最小
      const _byBid = {};
      const _hUsable = (heroList || []).filter(e =>
        e && e.source !== 'admin_delete' && e.source !== 'admin_grant');
      _hUsable.forEach(e => {
        if(!e.battleId) return;
        (_byBid[e.battleId] = _byBid[e.battleId] || []).push(e);
      });
      const _consumed = new Set();
      Object.keys(_byBid).forEach(bid => {
        const _group = _byBid[bid].sort((a,b) => (a.at||0) - (b.at||0));
        if(_group.length <= 1) return;
        _group.forEach((e, i) => {
          _consumed.add((e.at||0) + '|' + (e.name||''));
          if(i === 0){
            _kept.push({ name: e.name, at: e.at, clusterReason: 'battleId ' + bid.slice(-12), keptAsFirst: true });
          } else {
            _toDelete.push({ name: e.name, at: e.at, clusterReason: 'battleId ' + bid.slice(-12) });
          }
        });
      });
      // 規則 2:時間窗 — _findTimeClustersLocal 已實作
      const _timeClusters = _findTimeClustersLocal(_hUsable, TIME_HERO_THRESHOLD, 'name');
      _timeClusters.forEach(c => {
        // 過濾掉已被 battleId 規則處理過的 entry
        const _fresh = c.entries.filter(e => !_consumed.has((e.at||0) + '|' + (e.name||'')));
        if(_fresh.length <= 1) return;
        _fresh.sort((a,b) => (a.at||0) - (b.at||0));
        _fresh.forEach((e, i) => {
          _consumed.add((e.at||0) + '|' + (e.name||''));
          const _t = new Date(e.at || 0);
          const _label = '時間窗 ' + (_t.getMonth()+1) + '/' + _t.getDate() + ' '
            + String(_t.getHours()).padStart(2,'0') + ':' + String(_t.getMinutes()).padStart(2,'0');
          if(i === 0){
            _kept.push({ name: e.name, at: e.at, clusterReason: _label, keptAsFirst: true });
          } else {
            _toDelete.push({ name: e.name, at: e.at, clusterReason: _label });
          }
        });
      });
      // 去重(同隻英雄可能被多個 cluster 各列一次 — 取 at 最小那筆當代表)
      const _dedupMap = new Map();
      _toDelete.forEach(d => {
        const _ex = _dedupMap.get(d.name);
        if(!_ex || (d.at||0) < (_ex.at||0)) _dedupMap.set(d.name, d);
      });
      return {
        toDelete: Array.from(_dedupMap.values()),
        kept: _kept,
      };
    }

    // ── 偵測果實異常 cluster(專屬果實的時間窗 / battleId 規則) ──
    // 規則:同 battleId > 1 顆 / 3 分鐘內 BOSS 來源 > 1 顆 = 異常
    // 排除 admin_delete / admin_grant
    function _detectFruitAnomalies(fruitHistory){
      const _list = (fruitHistory || []).filter(e =>
        e && e.source !== 'admin_delete' && e.source !== 'admin_grant'
        && _isBossSource(e.source) && typeof e.at === 'number');
      // 按時間排序
      _list.sort((a,b) => (a.at||0) - (b.at||0));
      const _abnormalEntries = [];  // 被標為異常的 entries(扣除「每場保留 1 顆」)
      const _consumed = new Set();
      // 規則 1:同 battleId > 1 顆 → 第 1 顆保留、其餘標
      const _byBid = {};
      _list.forEach(e => {
        if(!e.battleId) return;
        (_byBid[e.battleId] = _byBid[e.battleId] || []).push(e);
      });
      Object.keys(_byBid).forEach(bid => {
        const _g = _byBid[bid].sort((a,b) => (a.at||0) - (b.at||0));
        if(_g.length <= 1) return;
        _g.forEach((e, i) => {
          _consumed.add(e.at + '|' + (e.source||''));
          if(i > 0) _abnormalEntries.push({ entry: e, reason: 'battleId ' + bid.slice(-12) });
        });
      });
      // 規則 2:3 分鐘窗 > 1 顆 → 第 1 顆保留、其餘標
      for(let i = 0; i < _list.length; i++){
        const _seed = _list[i];
        const _k0 = _seed.at + '|' + (_seed.source||'');
        if(_consumed.has(_k0)) continue;
        const _w = [];
        for(let j = i; j < _list.length; j++){
          const _e = _list[j];
          if((_e.at||0) - (_seed.at||0) > TIME_WINDOW_MS) break;
          _w.push(_e);
        }
        if(_w.length > 1){
          _w.forEach((e, idx) => {
            _consumed.add(e.at + '|' + (e.source||''));
            if(idx > 0){
              const _t = new Date(e.at);
              const _label = '時間窗 ' + (_t.getMonth()+1) + '/' + _t.getDate() + ' '
                + String(_t.getHours()).padStart(2,'0') + ':' + String(_t.getMinutes()).padStart(2,'0');
              _abnormalEntries.push({ entry: e, reason: _label });
            }
          });
        }
      }
      // 加總要扣的果實數(每筆 entry.count,通常都是 1)
      let _totalAbnormalCount = 0;
      _abnormalEntries.forEach(a => { _totalAbnormalCount += (parseInt(a.entry.count, 10) || 1); });
      return { entries: _abnormalEntries, totalCount: _totalAbnormalCount };
    }

    // ★ v3.11.35i — 擬真渲染玩家端通知 modal(完全照 index.html 的 _showNotificationModal 樣式)
    //   讓老師按下「👁 預覽玩家會看到什麼」時,看到跟玩家一樣的 UI(綠色 compensation 樣式)
    function _renderPlayerNotificationPreview(noteData){
      const _ITEM_LABELS = {
        skill_upgrade_book: '技能升級書',
        burst_upgrade_fruit: '超越極限果實',
        hero_exp_book_premium: '豪華典藏版經驗之書',
        hero_exp_book_deluxe: '豪華版經驗之書',
        hero_exp_book: '經驗之書',
        summon_crystal: '召喚水晶',
        summon_ticket_ssr: 'SSR 召喚卷',
        treasure_exp_scroll: '至寶經驗之書',
      };
      const _escP = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

      // 把舊預覽蓋掉(避免重複疊)
      const _exist = document.getElementById('_aa-player-preview-ov');
      if(_exist) _exist.remove();

      const _type = noteData.type || 'info';
      const _typeStyle = _type === 'warning'
        ? { color: '#ff8866', bg: 'linear-gradient(160deg,#2a1812,#180a08)', border: '#ff6644', icon: '⚠' }
        : _type === 'compensation'
          ? { color: '#88dd66', bg: 'linear-gradient(160deg,#1a2818,#0e180c)', border: '#66cc44', icon: '🎁' }
          : { color: '#88aaff', bg: 'linear-gradient(160deg,#181a28,#0c0e18)', border: '#5588dd', icon: '📢' };

      // 補償摘要
      let _compHtml = '';
      if(noteData.compensation && typeof noteData.compensation === 'object'){
        const c = noteData.compensation;
        const parts = [];
        if(c.knowledgeCoins) parts.push(`💰 知識幣 +${Number(c.knowledgeCoins).toLocaleString()}`);
        if(c.crystals) parts.push(`💎 水晶 +${c.crystals}`);
        if(Array.isArray(c.items) && c.items.length){
          c.items.forEach(it => {
            const _label = _ITEM_LABELS[it.id] || it.id;
            parts.push(`📦 ${_label} ×${it.count}`);
          });
        }
        if(parts.length){
          _compHtml = `<div style="background:rgba(120,220,120,0.12);border-left:4px solid #66cc44;padding:12px 14px;border-radius:8px;margin:14px 0;">
            <div style="font-size:14px;font-weight:700;color:#aaddaa;margin-bottom:6px;">🎁 補償內容</div>
            <div style="font-size:14px;color:#e0ffe0;line-height:1.8;">${parts.map(_escP).join('<br>')}</div>
          </div>`;
        }
      }

      // removedItems 摘要
      let _removedHtml = '';
      if(noteData.removedItems && typeof noteData.removedItems === 'object'){
        const r = noteData.removedItems;
        const parts = [];
        if(Array.isArray(r.heroes) && r.heroes.length) parts.push(`🦸 英雄(${r.heroes.length} 隻):${r.heroes.map(_escP).join('、')}`);
        if(Array.isArray(r.treasures) && r.treasures.length) parts.push(`💎 至寶(${r.treasures.length} 個):${r.treasures.map(_escP).join('、')}`);
        if(r.fruits && r.fruits > 0) parts.push(`🍑 超越極限果實 ×${r.fruits} 顆`);
        if(parts.length){
          _removedHtml = `<div style="background:rgba(200,80,80,0.12);border-left:4px solid #cc6644;padding:12px 14px;border-radius:8px;margin:14px 0;">
            <div style="font-size:14px;font-weight:700;color:#ffaa88;margin-bottom:6px;">🗑 已清除項目</div>
            <div style="font-size:13px;color:#ffe0d0;line-height:1.7;">${parts.join('<br>')}</div>
          </div>`;
        }
      }

      const _ov = document.createElement('div');
      _ov.id = '_aa-player-preview-ov';
      // z-index 比 _aa-cleanup-modal 高一點,蓋在預覽 modal 上
      _ov.style.cssText = 'position:fixed;inset:0;z-index:200005;background:rgba(0,0,0,0.92);'
        + 'display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(6px);'
        + 'font-family:"M PLUS Rounded 1c","Nunito",sans-serif;overflow-y:auto;';
      _ov.innerHTML = `
        <div style="max-width:660px;width:100%;">
          <div style="background:rgba(255,200,80,0.15);border:1.5px dashed #ffcc44;border-radius:10px;padding:10px 14px;margin-bottom:14px;color:#ffe8a0;font-size:13px;text-align:center;">
            👁 預覽模式 — 這是玩家下次登入會看到的通知 modal,不會真的發送。
            <br><span style="font-size:11px;color:#ddccaa;">關掉這個預覽不會影響上一層的清除/補償勾選</span>
          </div>
          <div style="background:${_typeStyle.bg};border:2px solid ${_typeStyle.border};border-radius:14px;padding:28px 32px;box-shadow:0 0 40px ${_typeStyle.border}66;color:#fff;max-height:75vh;overflow-y:auto;">
            <div style="font-size:24px;font-weight:800;color:${_typeStyle.color};margin-bottom:12px;letter-spacing:1px;">
              ${_typeStyle.icon} ${_escP(noteData.title || '管理員通知')}
            </div>
            <div style="font-size:15px;color:#ddd;line-height:1.75;white-space:pre-wrap;">${_escP(noteData.body || '')}</div>
            ${_compHtml}
            ${_removedHtml}
            <div style="font-size:11px;color:#778;margin-top:14px;border-top:1px solid rgba(255,255,255,0.1);padding-top:10px;">
              來自: ${_escP(noteData.createdBy || '管理員')}
              ${noteData.createdAt ? '・' + new Date(noteData.createdAt).toLocaleString('zh-TW') : ''}
            </div>
            <div style="text-align:center;margin-top:18px;">
              <button id="_aa-player-preview-close" style="padding:10px 36px;font-size:15px;font-weight:800;background:${_typeStyle.color};color:#000;border:none;border-radius:8px;cursor:pointer;letter-spacing:2px;">
                我知道了(預覽,不會送出)
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(_ov);
      document.getElementById('_aa-player-preview-close').onclick = function(){ _ov.remove(); };
      // 點背景關閉
      _ov.addEventListener('click', function(ev){
        if(ev.target === _ov) _ov.remove();
      });
    }

    function _openCleanupPreview(heroList, conflictKeys){
      if(!_curData || !_curUid){ alert('請先成功查詢玩家'); return; }
      const { toDelete, kept } = _computeDeleteList(heroList);
      // 果實異常偵測
      const _fruitH = _curData.fruitHistory || [];
      const _curFruitCount = parseInt(_curData.currentFruitCount, 10) || 0;
      const _fruitAb = _detectFruitAnomalies(_fruitH);
      // 若都沒異常 → 沒事可做
      if(toDelete.length === 0 && _fruitAb.totalCount === 0){
        alert('沒有需要處理的異常');
        return;
      }
      const _heroDetails = _curData.heroDetails || {};

      // 物品中文標籤
      const _ITEM_LABELS = {
        skill_upgrade_book: '技能升級書',
        burst_upgrade_fruit: '超越極限果實',
        hero_exp_book_premium: '豪華典藏版經驗之書',
        summon_ticket_ssr: 'SSR 英雄召喚卷',
        hero_exp_book: '英雄經驗之書',
      };

      // 每隻英雄預先計算補償
      const _detailRows = toDelete.map(d => {
        const _c = _computeCompensationForHero(d.name, _heroDetails);
        return {
          name: d.name,
          at: d.at,
          clusterReason: d.clusterReason,
          meta: _c.meta,
          coins: _c.coins,
          items: _c.items,
        };
      });

      // ── 渲染 modal(含 checkbox) ──
      const _ov = document.createElement('div');
      _ov.id = '_aa-cleanup-modal';
      _ov.style.cssText = 'position:fixed;inset:0;z-index:200001;background:rgba(0,0,0,0.85);'
        + 'display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(6px);'
        + 'font-family:"M PLUS Rounded 1c","Nunito",sans-serif;overflow-y:auto;';
      // 果實扣除預覽:實扣 = min(勾選數, _curFruitCount)
      const _fruitActualRemove = Math.min(_fruitAb.totalCount, _curFruitCount);
      const _fruitNote = (_fruitAb.totalCount > _curFruitCount)
        ? `<span style="color:#ffaa66;">(玩家手上只剩 ${_curFruitCount} 顆,實扣到 0 為止)</span>`
        : '';
      _ov.innerHTML = `
        <div style="max-width:820px;width:100%;background:linear-gradient(160deg,#241818,#180c0c);
          border:2.5px solid #ff6644;border-radius:14px;padding:24px 28px;color:#fff;
          box-shadow:0 0 40px rgba(255,80,60,0.5);max-height:90vh;overflow-y:auto;">
          <div style="font-size:22px;font-weight:800;color:#ff8866;margin-bottom:8px;">
            📦 一鍵清除異常 + 自動補償 + 通知玩家
          </div>
          <div style="font-size:13px;color:#ffcccc;margin-bottom:14px;line-height:1.6;">
            預設勾選所有偵測到的異常項目 — 你可以取消勾選想保留的英雄/果實,補償總計會即時更新。<br>
            <span style="color:#ffaa66;">⚠ 大公告請另外走「GM 公告」分頁的「📜 BUG 修補公告範本」</span>
          </div>

          ${toDelete.length > 0 ? `
          <div style="background:rgba(40,30,30,0.6);border:1px solid rgba(255,140,120,0.3);border-radius:8px;padding:12px;margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px;">
              <div style="font-size:13px;color:#ffcc88;font-weight:700;">
                🗑 異常英雄(共 ${toDelete.length} 隻,預設全勾)
              </div>
              <div style="display:flex;gap:6px;">
                <button id="_aa-hero-all" style="padding:4px 10px;font-size:11px;background:rgba(120,180,120,0.3);border:1px solid #66cc66;color:#aaddaa;border-radius:4px;cursor:pointer;">全選</button>
                <button id="_aa-hero-none" style="padding:4px 10px;font-size:11px;background:rgba(120,120,120,0.3);border:1px solid #888;color:#ccc;border-radius:4px;cursor:pointer;">全不選</button>
              </div>
            </div>
            <div style="max-height:300px;overflow-y:auto;background:rgba(0,0,0,0.4);border-radius:6px;padding:6px;">
              <table style="width:100%;font-size:11px;">
                <thead><tr style="color:#bbb;background:rgba(255,255,255,0.05);">
                  <th style="padding:4px 6px;width:32px;text-align:center;">✓</th>
                  <th style="padding:4px 6px;text-align:left;">英雄</th>
                  <th style="padding:4px 6px;text-align:left;">Lv</th>
                  <th style="padding:4px 6px;text-align:left;">技能</th>
                  <th style="padding:4px 6px;text-align:left;">爆發</th>
                  <th style="padding:4px 6px;text-align:left;">能力點</th>
                  <th style="padding:4px 6px;text-align:left;">補償</th>
                  <th style="padding:4px 6px;text-align:left;">原因</th>
                </tr></thead>
                <tbody>
                  ${_detailRows.map((r, i) => `
                    <tr class="_aa-hero-row" data-idx="${i}" style="border-bottom:1px solid rgba(255,255,255,0.05);">
                      <td style="padding:4px 6px;text-align:center;">
                        <input type="checkbox" class="_aa-hero-cb" data-idx="${i}" checked
                          style="width:16px;height:16px;cursor:pointer;accent-color:#ff6644;">
                      </td>
                      <td style="padding:4px 6px;color:#ffe;">${_esc(r.name)}${r.meta.isSSR ? ' <span style="color:#ff88cc;font-size:9px;">SSR</span>' : ''}</td>
                      <td style="padding:4px 6px;color:#ffdd66;">Lv${r.meta.lv}</td>
                      <td style="padding:4px 6px;color:#aaccff;">s1+${r.meta.s1}/s2+${r.meta.s2}</td>
                      <td style="padding:4px 6px;color:#ff88aa;">${r.meta.burst}</td>
                      <td style="padding:4px 6px;color:#88ddaa;">${r.meta.investedPts}+${r.meta.freePts}</td>
                      <td style="padding:4px 6px;color:#ffcc66;">${r.coins} 幣${Object.keys(r.items).map(k => '・'+(_ITEM_LABELS[k]||k)+'×'+r.items[k]).join('')}</td>
                      <td style="padding:4px 6px;color:#aac;font-size:10px;">${_esc(r.clusterReason)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
          ` : '<div style="background:rgba(40,60,40,0.3);border-left:4px solid #66cc88;padding:8px 12px;border-radius:6px;margin-bottom:14px;font-size:12px;color:#aaddbb;">✅ 沒有偵測到異常英雄</div>'}

          ${_fruitAb.totalCount > 0 ? `
          <div style="background:rgba(50,30,40,0.6);border:1px solid rgba(255,180,140,0.4);border-radius:8px;padding:12px;margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <div style="font-size:13px;color:#ffaa66;font-weight:700;">
                🍑 異常果實(共 ${_fruitAb.totalCount} 顆,玩家手上 ${_curFruitCount} 顆)
              </div>
              <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:#ffcc88;cursor:pointer;">
                <input type="checkbox" id="_aa-fruit-cb" checked style="width:16px;height:16px;cursor:pointer;accent-color:#ff8866;">
                <span>清除果實 ${_fruitActualRemove} 顆 ${_fruitNote}</span>
              </label>
            </div>
            <div style="max-height:140px;overflow-y:auto;background:rgba(0,0,0,0.4);border-radius:6px;padding:6px;font-size:11px;color:#eed;">
              ${_fruitAb.entries.slice(0, 30).map(a => `
                <div style="padding:3px 4px;border-bottom:1px solid rgba(255,255,255,0.04);">
                  <span style="color:#ffe;">🍑 ×${a.entry.count || 1}</span>
                  <span style="color:#aac;margin-left:8px;">${_fmtTime(a.entry.at)}</span>
                  <span style="color:#ffaa88;margin-left:8px;">${_esc(a.entry.source || '?')}</span>
                  <span style="color:#aac;margin-left:8px;font-size:10px;">${_esc(a.reason)}</span>
                </div>
              `).join('')}
              ${_fruitAb.entries.length > 30 ? `<div style="color:#888;padding:3px 4px;">... 還有 ${_fruitAb.entries.length - 30} 筆</div>` : ''}
            </div>
          </div>
          ` : ''}

          <div style="background:rgba(40,60,40,0.4);border-left:4px solid #66cc44;border-radius:6px;padding:12px 14px;margin-bottom:14px;">
            <div style="font-size:14px;color:#aaddaa;font-weight:700;margin-bottom:6px;">
              🎁 補償總計(依勾選即時更新)
            </div>
            <div id="_aa-comp-summary" style="font-size:14px;color:#e0ffe0;line-height:1.7;">
              <!-- 動態填入 -->
            </div>
          </div>

          <div style="margin-bottom:14px;">
            <label style="font-size:13px;color:#ddccaa;font-weight:700;display:block;margin-bottom:6px;">
              📩 個人通知文字(依勾選即時更新,可手動修改)
            </label>
            <textarea id="_aa-cleanup-note" style="width:100%;min-height:160px;padding:10px;
              font-size:13px;background:rgba(20,20,30,0.9);border:1.5px solid rgba(255,200,80,0.4);
              color:#fff;border-radius:6px;font-family:inherit;box-sizing:border-box;
              line-height:1.6;resize:vertical;"></textarea>
          </div>

          <div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;">
            <button id="_aa-cleanup-preview" style="padding:10px 18px;font-size:13px;font-weight:700;
              background:rgba(120,180,220,0.25);border:1.5px solid #66aacc;color:#aaddff;
              border-radius:6px;cursor:pointer;" title="模擬玩家下次登入會看到的通知 modal(完全擬真)">
              👁 預覽玩家會看到什麼
            </button>
            <button id="_aa-cleanup-cancel" style="padding:10px 20px;font-size:13px;font-weight:700;
              background:rgba(120,120,120,0.3);border:1.5px solid #888;color:#ccc;
              border-radius:6px;cursor:pointer;">取消</button>
            <button id="_aa-cleanup-confirm" style="padding:11px 24px;font-size:14px;font-weight:800;
              background:linear-gradient(135deg,#cc3322,#882211);border:none;color:#fff;
              border-radius:6px;cursor:pointer;box-shadow:0 3px 10px rgba(200,60,40,0.5);">
              ✅ 確認執行
            </button>
          </div>

          <div id="_aa-cleanup-status" style="margin-top:10px;font-size:12px;color:#aac;min-height:16px;"></div>
        </div>
      `;
      document.body.appendChild(_ov);

      // ── 依勾選即時重算 ──
      let _userEditedNote = false;  // 老師手動編輯過通知文字後就不再覆蓋
      function _getSelected(){
        const _selHeroIdx = Array.from(_ov.querySelectorAll('._aa-hero-cb:checked'))
          .map(cb => parseInt(cb.dataset.idx, 10));
        const _selHeroRows = _selHeroIdx.map(i => _detailRows[i]);
        const _fruitCb = _ov.querySelector('#_aa-fruit-cb');
        const _fruitChecked = _fruitCb ? _fruitCb.checked : false;
        const _fruitsToRemove = _fruitChecked ? _fruitActualRemove : 0;
        // 累加補償(果實清除不補)
        let _coins = 0;
        const _items = {};
        _selHeroRows.forEach(r => {
          _coins += r.coins;
          Object.keys(r.items).forEach(k => { _items[k] = (_items[k] || 0) + r.items[k]; });
        });
        return { selHeroRows: _selHeroRows, fruitsToRemove: _fruitsToRemove, coins: _coins, items: _items };
      }
      function _refreshSummary(){
        const sel = _getSelected();
        // 補償摘要
        const _itemSummary = Object.keys(sel.items).map(k =>
          `${_ITEM_LABELS[k] || k} ×${sel.items[k]}`).join('・');
        const _summaryEl = document.getElementById('_aa-comp-summary');
        if(_summaryEl){
          _summaryEl.innerHTML = `
            🗑 將刪除 <b style="color:#ffe;">${sel.selHeroRows.length}</b> 隻英雄
            ${sel.fruitsToRemove > 0 ? `・🍑 扣除 <b style="color:#ffaa66;">${sel.fruitsToRemove}</b> 顆果實` : ''}
            <br>
            💰 補償知識幣 <b style="color:#ffdd66;">+${sel.coins.toLocaleString()}</b>
            ${Object.keys(sel.items).length ? '<br>📦 ' + _itemSummary : ''}
          `;
        }
        // 通知文字(老師沒動過就自動更新)
        if(!_userEditedNote){
          const _noteEl = document.getElementById('_aa-cleanup-note');
          if(_noteEl){
            const _ssrCount = sel.selHeroRows.filter(r => r.meta.isSSR).length;
            // ★ v3.11.35j(2026-05-29) — 重寫安撫版通知文字,強調 SSR 緣分與稀有性
            //   設計重點:不用「BUG/異常/回收」冰冷詞,改用故事感語氣
            let _body = '小英雄,有件事想跟你說 💗\n\n'
              + '最近系統有個小錯誤,讓 BOSS 戰偶爾會一次送出太多 SSR 英雄。\n'
              + 'SSR 英雄是傳說中的存在,本來每一隻都要靠你勇敢挑戰、運氣與緣分才能相遇。\n'
              + '如果可以這麼簡單就大量擁有,那他們就不再特別了 — 對你、對其他小英雄都不公平。\n\n';

            if(sel.selHeroRows.length > 0){
              _body += `於是,管理員小心地把你帳號內 ${sel.selHeroRows.length} 隻意外多得的英雄,送回他們的世界。\n`;
              if(_ssrCount > 0){
                _body += `其中有 ${_ssrCount} 隻是 SSR — 我知道,捨不得是正常的。但請相信我:\n`
                  + `真正屬於你的 SSR 英雄,還會在未來的冒險中,與你重逢。\n\n`;
              } else {
                _body += `\n`;
              }
              _body += `至於那段時間裡,你花在他們身上的努力 — 升級、訓練、強化技能,\n`
                + `管理員一份都不會虧待你,全部用資源原樣補回給你 👇\n`;
            }

            if(sel.coins > 0 || Object.keys(sel.items).length > 0){
              _body += `\n💰 知識幣 +${sel.coins.toLocaleString()}\n`;
              if(Object.keys(sel.items).length){
                _body += Object.keys(sel.items).map(k =>
                  `📦 ${_ITEM_LABELS[k] || k} ×${sel.items[k]}`).join('\n') + '\n';
              }
            }

            if(sel.fruitsToRemove > 0){
              _body += `\n另外管理員也清掉了 ${sel.fruitsToRemove} 顆多得的「超越極限果實」(同樣是 BUG 多出來的)。\n`
                + `別擔心,你已經用過、升級過的部分,管理員不會動。\n`;
            }

            _body += `\n📌 重新出發小提醒:\n`
              + `每打贏一次 BOSS,SSR 英雄出現的機率才會啟動。\n`
              + `慢慢打、慢慢相遇,那一刻的感動才會是最真實的。\n`
              + `你跟每一位 SSR 英雄結識,都是一段可歌可泣的戰鬥 ⚔\n\n`
              + `— LXPSGAME 管理員 敬上`;

            _noteEl.value = _body;
          }
        }
      }
      // 初次填入
      _refreshSummary();

      // ── 綁定事件 ──
      // checkbox 變化重算
      _ov.querySelectorAll('._aa-hero-cb').forEach(cb => {
        cb.onchange = _refreshSummary;
      });
      const _fruitCbEl = _ov.querySelector('#_aa-fruit-cb');
      if(_fruitCbEl) _fruitCbEl.onchange = _refreshSummary;
      // 全選/全不選
      const _heroAll = _ov.querySelector('#_aa-hero-all');
      const _heroNone = _ov.querySelector('#_aa-hero-none');
      if(_heroAll) _heroAll.onclick = function(){
        _ov.querySelectorAll('._aa-hero-cb').forEach(cb => { cb.checked = true; });
        _refreshSummary();
      };
      if(_heroNone) _heroNone.onclick = function(){
        _ov.querySelectorAll('._aa-hero-cb').forEach(cb => { cb.checked = false; });
        _refreshSummary();
      };
      // 老師手動編輯通知文字 → 不再自動覆寫
      const _noteEl0 = document.getElementById('_aa-cleanup-note');
      if(_noteEl0) _noteEl0.oninput = function(){ _userEditedNote = true; };

      // ★ v3.11.35i — 預覽玩家會看到什麼(完全擬真玩家端 modal)
      document.getElementById('_aa-cleanup-preview').onclick = function(){
        const _noteText = (document.getElementById('_aa-cleanup-note').value || '').trim();
        const sel = _getSelected();
        if(sel.selHeroRows.length === 0 && sel.fruitsToRemove === 0){
          alert('沒勾選任何項目,無法預覽');
          return;
        }
        // 構造跟實際發送一模一樣的 noteData 結構
        const _items = Object.keys(sel.items).map(k => ({ id: k, count: sel.items[k] }));
        const _removed = {};
        if(sel.selHeroRows.length > 0) _removed.heroes = sel.selHeroRows.map(r => r.name);
        if(sel.fruitsToRemove > 0) _removed.fruits = sel.fruitsToRemove;
        const _noteData = {
          title: '⚠ BUG 異常資源回收 + 補償通知',
          body: _noteText || '(通知文字為空)',
          type: 'compensation',
          compensation: {
            knowledgeCoins: sel.coins,
            items: _items,
          },
          removedItems: _removed,
          createdBy: (window._fbUser && window._fbUser.email) || '管理員',
          createdAt: Date.now(),
        };
        _renderPlayerNotificationPreview(_noteData);
      };

      document.getElementById('_aa-cleanup-cancel').onclick = function(){ _ov.remove(); };
      document.getElementById('_aa-cleanup-confirm').onclick = async function(){
        const _statusEl2 = document.getElementById('_aa-cleanup-status');
        const _confirmBtn = document.getElementById('_aa-cleanup-confirm');
        const _noteText = (document.getElementById('_aa-cleanup-note').value || '').trim();
        const sel = _getSelected();
        if(sel.selHeroRows.length === 0 && sel.fruitsToRemove === 0){
          _statusEl2.style.color = '#ff8866';
          _statusEl2.textContent = '⚠ 沒勾選任何項目要處理';
          return;
        }
        if(!_noteText){
          _statusEl2.style.color = '#ff8866';
          _statusEl2.textContent = '⚠ 通知文字不可為空';
          return;
        }
        if(!confirm(`確認執行?\n\n刪除 ${sel.selHeroRows.length} 隻英雄`
          + (sel.fruitsToRemove > 0 ? ` + 扣除 ${sel.fruitsToRemove} 顆果實` : '')
          + `\n補償知識幣 +${sel.coins.toLocaleString()}\n\n⚠ 不可逆!`)) return;
        _confirmBtn.disabled = true;
        _confirmBtn.textContent = '⏳ 執行中...';
        _statusEl2.style.color = '#aaccff';
        _statusEl2.textContent = '執行中,請稍候...';
        try{
          const _compPayload = {
            coins: sel.coins,
            backpack: Object.assign({}, sel.items),
            summary: `處理 ${sel.selHeroRows.length} 隻英雄`
              + (sel.fruitsToRemove > 0 ? ` + ${sel.fruitsToRemove} 顆果實` : ''),
          };
          const _r = await window._fbAdminCleanupAndCompensate(
            _curUid,
            sel.selHeroRows.map(d => ({ name: d.name, at: d.at })),
            _compPayload,
            {
              title: '⚠ BUG 異常資源回收 + 補償通知',
              body: _noteText,
            },
            {
              reason: 'GM 後台一鍵清除異常 + 自動補償',
              fruitsToRemove: sel.fruitsToRemove,
            }
          );
          const _successDel = (_r.deleted || []).filter(d => d.ok).length;
          const _failedDel = (_r.deleted || []).filter(d => !d.ok);
          const _fruitMsg = _r.fruitsRemoved
            ? ` 果實:${_r.fruitsRemoved.beforeCount} → ${_r.fruitsRemoved.afterCount}(扣 ${_r.fruitsRemoved.actualRemove})`
            : '';
          _statusEl2.style.color = '#88ddaa';
          _statusEl2.innerHTML = `✅ 完成 — 刪除 ${_successDel}/${sel.selHeroRows.length} 隻、`
            + _fruitMsg
            + (_r.compensationApplied ? '、補償已套用' : '')
            + (_r.notificationTs ? '、通知已寄出' : '、通知未寄出')
            + (_failedDel.length ? `<br>⚠ ${_failedDel.length} 筆失敗:${_failedDel.map(d => d.name + '(' + d.error + ')').join('、')}` : '');
          setTimeout(async () => {
            _ov.remove();
            _setStatus('✅ 批次清除+補償完成,重新查詢中...', '#88ddaa');
            await _doQuery();
          }, 2500);
        }catch(e){
          console.error('[_fbAdminCleanupAndCompensate] 失敗', e);
          _statusEl2.style.color = '#ff8866';
          _statusEl2.textContent = '❌ 失敗: ' + (e.message || e);
          _confirmBtn.disabled = false;
          _confirmBtn.textContent = '✅ 確認執行';
        }
      };
    }

    // ════════════════════════════════════════════════════════════════
    // ★ v3.13.68 — 各分頁批次勾選清除(英雄/至寶)+ 退補償 + 發訊息告知玩家
    //   與「📦 一鍵清除異常」(_openCleanupPreview)不同:這裡刪「GM 任意勾選」
    //   的項目,不限系統偵測到的異常。
    //     英雄:走原子 API _fbAdminCleanupAndCompensate(刪+補+通知一次完成)
    //     至寶:組合 _fbAdminDeleteTreasure×N + _fbCompensatePlayer + _fbAdminSendNotificationToPlayer
    //   modal id 一律用 _aabatch- 前綴,與 _openCleanupPreview(_aa-cleanup-)區隔不衝突。
    // ════════════════════════════════════════════════════════════════
    function _batchDefaultNote(kind, rows, coins, items){
      const _isHero = (kind === 'hero');
      const _itemLine = Object.keys(items).length
        ? Object.keys(items).map(k => `📦 ${_BATCH_ITEM_LABELS[k] || k} ×${items[k]}`).join('\n') + '\n'
        : '';
      let _body = '小英雄你好 💗\n\n';
      if(_isHero){
        const _ssr = rows.filter(r => r.isSSR).length;
        _body += `管理員整理了你的帳號,把下列 ${rows.length} 隻英雄送回了他們的世界:\n`
          + rows.map(r => '・' + r.label).join('\n') + '\n';
        if(_ssr > 0){
          _body += `\n其中有 ${_ssr} 隻是 SSR — 我知道捨不得是正常的,但真正屬於你的 SSR,還會在未來的冒險中與你重逢。\n`;
        }
        _body += `\n你花在他們身上的升級、訓練、強化,管理員一份都不會虧待,全部用資源原樣補回給你 👇\n`;
      } else {
        _body += `管理員整理了你的帳號,移除了下列 ${rows.length} 件至寶:\n`
          + rows.map(r => '・' + r.label).join('\n') + '\n'
          + `\n你投入在這些至寶上的養成,管理員會用資源補回給你 👇\n`;
      }
      if(coins > 0 || Object.keys(items).length){
        _body += `\n💰 知識幣 +${coins.toLocaleString()}\n` + _itemLine;
      }
      _body += `\n如果有任何疑問,歡迎在遊戲裡找管理員 💬\n\n— LXPSGAME 管理員 敬上`;
      return _body;
    }

    const _BATCH_ITEM_LABELS = {
      skill_upgrade_book: '技能升級書',
      burst_upgrade_fruit: '超越極限果實',
      hero_exp_book_premium: '豪華典藏版經驗之書',
      summon_ticket_ssr: 'SSR 英雄召喚卷',
      hero_exp_book: '英雄經驗之書',
      treasure_exp_scroll: '至寶經驗卷軸',
    };

    function _openBatchCleanup(kind, items){
      if(!_curData || !_curUid){ alert('請先成功查詢玩家'); return; }
      items = Array.isArray(items) ? items : [];
      if(!items.length){ alert('請先勾選要刪除的項目'); return; }
      const _isHero = (kind === 'hero');
      const _heroDetails = _curData.heroDetails || {};
      const _ownedTre = ((_curData.full && _curData.full.ownedTreasures) || []);
      const _treDB = (typeof window.TAIWAN_TREASURES === 'object' && window.TAIWAN_TREASURES) ? window.TAIWAN_TREASURES : {};

      // 預先算每項補償
      const _detailRows = items.map(it => {
        if(_isHero){
          const _c = _computeCompensationForHero(it.name, _heroDetails);
          return { key:it.name, label:it.name, sub:'Lv'+(_c.meta.lv||it.lv||1), isSSR:!!_c.meta.isSSR, coins:_c.coins||0, items:_c.items||{}, at:it.at||0 };
        } else {
          const _c = _computeCompensationForTreasure(it.id, _ownedTre);
          const _info = _treDB[it.id] || {};
          const _nm = (_info.icon ? _info.icon + ' ' : '') + (_info.name || it.id);
          return { key:it.id, label:_nm, sub:'Lv'+(_c.meta.lv||it.lv||1), isSSR:false, coins:_c.coins||0, items:_c.items||{}, at:it.at||0 };
        }
      });

      const _title = _isHero ? '🦸 批次清除選取英雄' : '💎 批次清除選取至寶';
      const _kindWord = _isHero ? '英雄' : '至寶';
      let _userEdited = false;

      const _ov = document.createElement('div');
      _ov.id = '_aabatch-modal';
      _ov.style.cssText = 'position:fixed;inset:0;z-index:200002;background:rgba(0,0,0,0.85);'
        + 'display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(6px);'
        + 'font-family:"M PLUS Rounded 1c","Nunito",sans-serif;overflow-y:auto;';
      _ov.innerHTML = `
        <div style="max-width:780px;width:100%;background:linear-gradient(160deg,#241818,#180c0c);
          border:2.5px solid #ff6644;border-radius:14px;padding:22px 26px;color:#fff;
          box-shadow:0 0 40px rgba(255,80,60,0.5);max-height:90vh;overflow-y:auto;">
          <div style="font-size:21px;font-weight:800;color:#ff8866;margin-bottom:8px;">
            🗑 ${_title} + 退補償 + 通知玩家
          </div>
          <div style="font-size:13px;color:#ffcccc;margin-bottom:14px;line-height:1.6;">
            預設勾選你剛才選的 ${_detailRows.length} 個${_kindWord} — 可在這裡再取消勾選想保留的,補償總計會即時更新。<br>
            <span style="color:#ffaa66;">⚠ 這是直接刪除(不可逆),會同時退補償並寄通知給玩家。</span>
          </div>
          <div style="background:rgba(40,30,30,0.6);border:1px solid rgba(255,140,120,0.3);border-radius:8px;padding:12px;margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px;">
              <div style="font-size:13px;color:#ffcc88;font-weight:700;">🗑 選取的${_kindWord}(共 ${_detailRows.length} 個)</div>
              <div style="display:flex;gap:6px;">
                <button id="_aabatch-all" style="padding:4px 10px;font-size:11px;background:rgba(120,180,120,0.3);border:1px solid #66cc66;color:#aaddaa;border-radius:4px;cursor:pointer;">全選</button>
                <button id="_aabatch-none" style="padding:4px 10px;font-size:11px;background:rgba(120,120,120,0.3);border:1px solid #888;color:#ccc;border-radius:4px;cursor:pointer;">全不選</button>
              </div>
            </div>
            <div style="max-height:280px;overflow-y:auto;background:rgba(0,0,0,0.4);border-radius:6px;padding:6px;">
              <table style="width:100%;font-size:11px;">
                <thead><tr style="color:#bbb;background:rgba(255,255,255,0.05);">
                  <th style="padding:4px 6px;width:32px;text-align:center;">✓</th>
                  <th style="padding:4px 6px;text-align:left;">${_kindWord}</th>
                  <th style="padding:4px 6px;text-align:left;">等級</th>
                  <th style="padding:4px 6px;text-align:left;">補償</th>
                </tr></thead>
                <tbody>
                  ${_detailRows.map((r, i) => `
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                      <td style="padding:4px 6px;text-align:center;">
                        <input type="checkbox" class="_aabatch-cb" data-idx="${i}" checked
                          style="width:16px;height:16px;cursor:pointer;accent-color:#ff6644;">
                      </td>
                      <td style="padding:4px 6px;color:#ffe;">${_esc(r.label)}${r.isSSR ? ' <span style="color:#ff88cc;font-size:9px;">SSR</span>' : ''}</td>
                      <td style="padding:4px 6px;color:#ffdd66;">${_esc(r.sub)}</td>
                      <td style="padding:4px 6px;color:#ffcc66;">${r.coins} 幣${Object.keys(r.items).map(k => '・'+(_BATCH_ITEM_LABELS[k]||k)+'×'+r.items[k]).join('')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
          <div style="background:rgba(30,40,30,0.5);border-left:4px solid #66cc88;border-radius:6px;padding:10px 14px;margin-bottom:14px;font-size:13px;color:#cce;">
            <div id="_aabatch-summary"></div>
          </div>
          <div style="margin-bottom:6px;font-size:13px;font-weight:700;color:#aaccff;">💬 給玩家的通知(可自行編輯)</div>
          <textarea id="_aabatch-note" rows="9" style="width:100%;padding:10px;font-size:12px;line-height:1.55;
            background:rgba(0,0,0,0.5);color:#fff;border:1px solid #885;border-radius:8px;font-family:inherit;
            box-sizing:border-box;margin-bottom:6px;white-space:pre-wrap;"></textarea>
          <div id="_aabatch-status" style="font-size:12px;min-height:16px;margin-bottom:10px;"></div>
          <div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;">
            <button id="_aabatch-preview" style="padding:9px 18px;font-size:13px;font-weight:700;background:rgba(80,120,200,0.4);border:1px solid #5588cc;color:#cce;border-radius:8px;cursor:pointer;">👁 預覽玩家收到的通知</button>
            <button id="_aabatch-cancel" style="padding:9px 18px;font-size:13px;font-weight:700;background:rgba(120,120,120,0.4);border:1px solid #888;color:#ddd;border-radius:8px;cursor:pointer;">取消</button>
            <button id="_aabatch-confirm" style="padding:9px 22px;font-size:14px;font-weight:800;background:linear-gradient(135deg,#ff5544,#cc2211);border:none;color:#fff;border-radius:8px;cursor:pointer;box-shadow:0 3px 10px rgba(255,80,60,0.5);">✅ 確認執行</button>
          </div>
        </div>`;
      document.body.appendChild(_ov);

      function _getSel(){
        const _selIdx = Array.from(_ov.querySelectorAll('._aabatch-cb:checked')).map(cb => parseInt(cb.dataset.idx, 10));
        const _selRows = _selIdx.map(i => _detailRows[i]);
        let _coins = 0; const _items = {};
        _selRows.forEach(r => {
          _coins += r.coins;
          Object.keys(r.items).forEach(k => { _items[k] = (_items[k] || 0) + r.items[k]; });
        });
        return { rows:_selRows, coins:_coins, items:_items };
      }
      function _refresh(){
        const sel = _getSel();
        const _itemSummary = Object.keys(sel.items).map(k => `${_BATCH_ITEM_LABELS[k] || k} ×${sel.items[k]}`).join('・');
        const _sumEl = document.getElementById('_aabatch-summary');
        if(_sumEl){
          _sumEl.innerHTML = `🗑 將刪除 <b style="color:#ffe;">${sel.rows.length}</b> 個${_kindWord}<br>`
            + `💰 補償知識幣 <b style="color:#ffdd66;">+${sel.coins.toLocaleString()}</b>`
            + (Object.keys(sel.items).length ? '<br>📦 ' + _itemSummary : '');
        }
        if(!_userEdited){
          const _noteEl = document.getElementById('_aabatch-note');
          if(_noteEl) _noteEl.value = _batchDefaultNote(kind, sel.rows, sel.coins, sel.items);
        }
      }
      _refresh();

      _ov.querySelectorAll('._aabatch-cb').forEach(cb => { cb.onchange = _refresh; });
      const _allBtn = document.getElementById('_aabatch-all');
      const _noneBtn = document.getElementById('_aabatch-none');
      if(_allBtn) _allBtn.onclick = function(){ _ov.querySelectorAll('._aabatch-cb').forEach(cb => { cb.checked = true; }); _refresh(); };
      if(_noneBtn) _noneBtn.onclick = function(){ _ov.querySelectorAll('._aabatch-cb').forEach(cb => { cb.checked = false; }); _refresh(); };
      const _noteEl0 = document.getElementById('_aabatch-note');
      if(_noteEl0) _noteEl0.oninput = function(){ _userEdited = true; };

      document.getElementById('_aabatch-preview').onclick = function(){
        const sel = _getSel();
        if(sel.rows.length === 0){ alert('沒勾選任何項目,無法預覽'); return; }
        const _noteText = (document.getElementById('_aabatch-note').value || '').trim();
        const _removed = _isHero ? { heroes: sel.rows.map(r => r.label) } : { treasures: sel.rows.map(r => r.label) };
        _renderPlayerNotificationPreview({
          title: _isHero ? '🦸 英雄調整 + 補償通知' : '💎 至寶調整 + 補償通知',
          body: _noteText || '(通知文字為空)',
          type: 'compensation',
          compensation: { knowledgeCoins: sel.coins, items: Object.keys(sel.items).map(k => ({ id:k, count:sel.items[k] })) },
          removedItems: _removed,
          createdBy: (window._fbUser && window._fbUser.email) || '管理員',
          createdAt: Date.now(),
        });
      };

      document.getElementById('_aabatch-cancel').onclick = function(){ _ov.remove(); };
      document.getElementById('_aabatch-confirm').onclick = async function(){
        const _statusEl2 = document.getElementById('_aabatch-status');
        const _confirmBtn = document.getElementById('_aabatch-confirm');
        const _noteText = (document.getElementById('_aabatch-note').value || '').trim();
        const sel = _getSel();
        if(sel.rows.length === 0){ _statusEl2.style.color = '#ff8866'; _statusEl2.textContent = '⚠ 沒勾選任何項目要刪除'; return; }
        if(!_noteText){ _statusEl2.style.color = '#ff8866'; _statusEl2.textContent = '⚠ 通知文字不可為空'; return; }
        if(!confirm(`確認刪除 ${sel.rows.length} 個${_kindWord} + 補償知識幣 +${sel.coins.toLocaleString()} 並通知玩家?\n\n⚠ 不可逆!`)) return;
        _confirmBtn.disabled = true; _confirmBtn.textContent = '⏳ 執行中...';
        _statusEl2.style.color = '#aaccff'; _statusEl2.textContent = '執行中,請稍候...';
        try{
          const _reason = 'GM 後台 → ' + (_isHero ? '英雄' : '至寶') + '批次清除 + 補償';
          if(_isHero){
            const _r = await window._fbAdminCleanupAndCompensate(
              _curUid,
              sel.rows.map(r => ({ name: r.key, at: r.at })),
              { coins: sel.coins, backpack: Object.assign({}, sel.items), summary: `批次清除 ${sel.rows.length} 隻英雄` },
              { title: '🦸 英雄調整 + 補償通知', body: _noteText },
              { reason: _reason }
            );
            const _ok = (_r.deleted || []).filter(d => d.ok).length;
            const _fail = (_r.deleted || []).filter(d => !d.ok);
            _statusEl2.style.color = '#88ddaa';
            _statusEl2.innerHTML = `✅ 完成 — 刪除 ${_ok}/${sel.rows.length} 隻`
              + (_r.compensationApplied ? '、補償已套用' : '')
              + (_r.notificationTs ? '、通知已寄出' : '、通知未寄出')
              + (_fail.length ? `<br>⚠ ${_fail.length} 筆失敗:${_fail.map(d => d.name + '(' + d.error + ')').join('、')}` : '');
          } else {
            let _delOk = 0; const _delFail = [];
            for(const r of sel.rows){
              try{ await window._fbAdminDeleteTreasure(_curUid, r.key, { reason: _reason }); _delOk++; }
              catch(eDel){ _delFail.push(r.label + '(' + (eDel.message || eDel) + ')'); }
            }
            let _compApplied = false;
            if(sel.coins > 0 || Object.keys(sel.items).length){
              try{
                await window._fbCompensatePlayer(_curUid, { coins: sel.coins, coinsMode: 'add', backpack: Object.assign({}, sel.items) });
                _compApplied = true;
              }catch(eComp){ console.error('[batch tre comp]', eComp); }
            }
            let _noteTs = null;
            try{
              const _nr = await window._fbAdminSendNotificationToPlayer(_curUid, {
                title: '💎 至寶調整 + 補償通知',
                body: _noteText,
                type: 'compensation',
                compensation: { knowledgeCoins: sel.coins, items: Object.keys(sel.items).map(k => ({ id:k, count:sel.items[k] })) },
                removedItems: { treasures: sel.rows.map(r => r.label) },
              });
              _noteTs = _nr && _nr.ts;
            }catch(eNote){ console.warn('[batch tre note]', eNote); }
            _statusEl2.style.color = '#88ddaa';
            _statusEl2.innerHTML = `✅ 完成 — 刪除 ${_delOk}/${sel.rows.length} 件`
              + (_compApplied ? '、補償已套用' : '')
              + (_noteTs ? '、通知已寄出' : '、通知未寄出')
              + (_delFail.length ? `<br>⚠ ${_delFail.length} 筆失敗:${_delFail.join('、')}` : '');
          }
          setTimeout(async () => {
            _ov.remove();
            _setStatus('✅ 批次清除+補償完成,重新查詢中...', '#88ddaa');
            await _doQuery();
          }, 2500);
        }catch(e){
          console.error('[_openBatchCleanup] 失敗', e);
          _statusEl2.style.color = '#ff8866';
          _statusEl2.textContent = '❌ 失敗: ' + (e.message || e);
          _confirmBtn.disabled = false; _confirmBtn.textContent = '✅ 確認執行';
        }
      };
    }

    // ════════════════════════════════════════════════════════════════
    // ★ v3.13.30(2026-06-03) — 異常掃描快取(Firestore 共用,GM 跨裝置同步)
    //   解決:掃描 300+ 位玩家吃 Firestore 額度,每次點都重掃浪費。
    //   設計(老師裁示):
    //     ① 掃描結果與處理狀態都存 gameConfig/anomaly_scan_cache(共用,跨 GM 同步)
    //     ② 開面板自動載入上次的快取(顯示「上次掃描:N 分鐘前 by xxx」)
    //     ③ 每筆卡片右上「✓ 已處理 / ↩ 取消」按鈕,標記後卡片變灰留在列表
    //     ④ 頂部 toggle「只看未處理」可隱藏已處理
    //   Firestore schema(gameConfig/anomaly_scan_cache):
    //     { ts, scannedBy, scanned, abnormal[], totalPlayersMismatch,
    //       actualPlayerCount, statsTotalPlayers,
    //       handled: { [uid]: { at: ts, by: email } } }
    //   merge:true 寫入時不會清掉 handled(該欄位由標記時 updateDoc 單欄更新)
    // ════════════════════════════════════════════════════════════════
    async function _loadAnomalyScanCache(){
      try{
        const { getDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        const snap = await getDoc(doc(window._fbDb, 'gameConfig', 'anomaly_scan_cache'));
        if(snap.exists()) return snap.data();
      }catch(e){ console.warn('[anomaly cache load]', e); }
      return null;
    }
    async function _saveAnomalyScanCache(r){
      try{
        const { setDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        const me = (window._fbUser && window._fbUser.email)
                 || (window._fbUser && window._fbUser.uid && String(window._fbUser.uid).slice(0,10))
                 || 'unknown';
        await setDoc(doc(window._fbDb, 'gameConfig', 'anomaly_scan_cache'), {
          ts:                   Date.now(),
          scannedBy:            me,
          scanned:              r.scanned || 0,
          abnormal:             r.abnormal || [],
          totalPlayersMismatch: !!r.totalPlayersMismatch,
          actualPlayerCount:    r.actualPlayerCount || 0,
          statsTotalPlayers:    (r.statsTotalPlayers === undefined) ? null : r.statsTotalPlayers,
        }, { merge: true });  // merge → 不會清掉既有 handled
        return true;
      }catch(e){ console.warn('[anomaly cache save]', e); return false; }
    }
    async function _toggleAnomalyHandled(uid, isHandled){
      try{
        const { updateDoc, doc, deleteField } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        const me = (window._fbUser && window._fbUser.email)
                 || (window._fbUser && window._fbUser.uid && String(window._fbUser.uid).slice(0,10))
                 || 'unknown';
        const payload = {};
        payload['handled.' + uid] = isHandled ? { at: Date.now(), by: me } : deleteField();
        await updateDoc(doc(window._fbDb, 'gameConfig', 'anomaly_scan_cache'), payload);
        return true;
      }catch(e){ console.warn('[anomaly handled toggle]', e); return false; }
    }

    // ★ v3.13.30 — 共用渲染:掃描完成與自動載入快取都用這個函式
    function _renderAnomalyCards(r, handled, opts){
      opts = opts || {};
      handled = handled || {};
      const ab = r.abnormal || [];
      // ★ v3.13.68 — 記住本次清單供詳情頁導航(返回/上下位)用,純記憶體零額度
      _anomalyCtx = { result: r, handled: handled, opts: opts };
      _anomalyOrder = ab.map(p => p.uid);

      if(_playerCard) _playerCard.style.display = 'none';
      if(_tabsEl) _tabsEl.style.display = 'none';

      // ── 頂部快取資訊條(僅 fromCache 顯示)──
      let _cacheBlock = '';
      if(opts.fromCache && opts.scannedAt){
        const _agoMin = Math.round((Date.now() - opts.scannedAt) / 60000);
        const _agoTxt = _agoMin < 1 ? '剛才' : (_agoMin < 60 ? (_agoMin + ' 分鐘前') : (Math.round(_agoMin/60) + ' 小時前'));
        _cacheBlock =
          '<div style="background:rgba(60,90,140,0.25);border-left:4px solid #6699cc;border-radius:4px;padding:8px 12px;margin-bottom:10px;font-size:12px;color:#bbddff;">'
          + '📂 上次掃描:' + _agoTxt + '(' + _fmtTime(opts.scannedAt) + ') by <b>' + _esc(opts.scannedBy || '?') + '</b>'
          + '|按右上「⚡ 掃描異常」可重新掃描'
          + '</div>';
      }

      // ── totalPlayers 對比提示(沿用 v3.11.35g)──
      let _statsBlock = '';
      if(r.totalPlayersMismatch){
        _statsBlock = `
          <div style="background:rgba(200,140,60,0.25);border:2px solid #ffaa44;border-radius:8px;padding:12px 14px;margin-bottom:12px;">
            <div style="font-size:13px;font-weight:800;color:#ffdd88;margin-bottom:6px;">
              ⚠ 玩家數不一致 — 首頁顯示與 Firebase 實際不同
            </div>
            <div style="font-size:12px;color:#ffe;line-height:1.7;">
              Firebase <b>/players</b> 集合實際:<b style="color:#ffdd66;">${r.actualPlayerCount}</b> 位<br>
              首頁顯示(<b>stats/global.totalPlayers</b>):<b style="color:#ff8866;">${r.statsTotalPlayers}</b> 位<br>
              <span style="color:#aac;font-size:11px;">→ 差距 ${Math.abs(r.actualPlayerCount - r.statsTotalPlayers)} 位</span>
            </div>
            <button id="_aa-sync-totalplayers" style="margin-top:8px;padding:7px 16px;font-size:12px;font-weight:700;
              background:linear-gradient(135deg,#ff9933,#cc6611);border:none;color:#fff;border-radius:6px;cursor:pointer;
              box-shadow:0 2px 6px rgba(255,120,40,0.4);">
              🔄 同步首頁總玩家數為 ${r.actualPlayerCount}
            </button>
          </div>
        `;
      } else if(r.statsTotalPlayers !== null && r.statsTotalPlayers !== undefined){
        _statsBlock = `
          <div style="background:rgba(60,120,80,0.2);border-left:4px solid #66cc88;border-radius:4px;padding:8px 12px;margin-bottom:10px;font-size:12px;color:#aaddbb;">
            ✓ 玩家數同步正常(Firebase 實際 = 首頁顯示 = ${r.actualPlayerCount} 位)
          </div>
        `;
      }

      // ── 沒異常 → 綠色提示 ──
      if(!ab.length){
        _contentEl.innerHTML = _cacheBlock + _statsBlock
          + `<div style="text-align:center;color:#88ddaa;padding:30px;font-size:14px;">✅ 已掃描 ${r.scanned} 位玩家,沒有發現異常</div>`;
        _setStatus(`✅ 掃描完成 — ${r.scanned} 位玩家正常`, '#88ddaa');
        _bindSyncTotalPlayersBtn(r);
        return;
      }

      // 處理筆數統計
      const _unhandledCount = ab.filter(p => !handled[p.uid]).length;
      const _handledCount = ab.length - _unhandledCount;

      // ── 處理狀態 toggle ──
      const _toggleBlock =
        '<div style="display:flex;align-items:center;justify-content:space-between;background:rgba(50,60,90,0.4);border-radius:6px;padding:8px 12px;margin-bottom:8px;flex-wrap:wrap;gap:6px;">'
        +   '<div style="font-size:12px;color:#ccddff;">'
        +     '📊 共 <b style="color:#ff8866;">' + ab.length + '</b> 位 — '
        +     '未處理 <b style="color:#ffaa66;">' + _unhandledCount + '</b> / '
        +     '已處理 <b style="color:#888;">' + _handledCount + '</b>'
        +   '</div>'
        +   '<label style="font-size:12px;color:#bbccdd;cursor:pointer;user-select:none;' + (_handledCount===0?'opacity:0.5;':'') + '">'
        +     '<input type="checkbox" id="_aa-toggle-unhandled-only" ' + (_handledCount===0?'disabled':'')
        +     ' style="vertical-align:middle;margin-right:4px;cursor:' + (_handledCount===0?'not-allowed':'pointer') + ';" />'
        +     '只看未處理'
        +   '</label>'
        + '</div>';

      // 時間格式化 helper(短)
      const _fmtSec = (ms) => {
        if(!ms || ms < 1000) return '<1s';
        if(ms < 60000) return Math.round(ms/1000) + 's';
        return Math.round(ms/60000) + 'm' + Math.round((ms%60000)/1000) + 's';
      };

      // ── cards ──
      const cards = ab.map(p => {
        const _isHandled = !!handled[p.uid];
        const _hInfo = handled[p.uid] || {};
        // 規則 1:battleId 衝突
        const heroBidBlocks = (p.conflictsHero || []).map(c => `
          <div style="background:rgba(200,40,40,0.18);border-left:3px solid #ff6644;border-radius:4px;padding:6px 10px;margin:4px 0;font-size:11px;">
            <b style="color:#ffaaaa;">battleId ${_shortBid(c.battleId)}</b> 同場 ${c.entries.length} 隻英雄:
            <span style="color:#ffe;">${c.entries.map(e => _esc(e.name)).join('、')}</span>
          </div>`).join('');
        const treBidBlocks = (p.conflictsTreasure || []).map(c => `
          <div style="background:rgba(200,40,40,0.18);border-left:3px solid #ff6644;border-radius:4px;padding:6px 10px;margin:4px 0;font-size:11px;">
            <b style="color:#ffaaaa;">battleId ${_shortBid(c.battleId)}</b> 同場 ${c.entries.length} 個至寶:
            <span style="color:#ffe;">${c.entries.map(e => _esc(e.id)).join('、')}</span>
          </div>`).join('');
        // 規則 2:時間窗 cluster
        const heroTimeBlocks = (p.timeClustersHero || []).map(c => `
          <div style="background:rgba(220,60,30,0.28);border-left:4px solid #ff4422;border-radius:4px;padding:6px 10px;margin:4px 0;font-size:11px;">
            <b style="color:#ffcccc;">⏱ ${_fmtTime(c.startAt)} 起 ${_fmtSec(c.durationMs)} 內</b>
            連刷 <b style="color:#ffaa66;">${c.count} 隻英雄</b>:
            <span style="color:#ffe;">${c.entries.map(e => _esc(e.name)).join('、')}</span>
          </div>`).join('');
        const treTimeBlocks = (p.timeClustersTreasure || []).map(c => `
          <div style="background:rgba(220,60,30,0.28);border-left:4px solid #ff4422;border-radius:4px;padding:6px 10px;margin:4px 0;font-size:11px;">
            <b style="color:#ffcccc;">⏱ ${_fmtTime(c.startAt)} 起 ${_fmtSec(c.durationMs)} 內</b>
            連刷 <b style="color:#ffaa66;">${c.count} 個至寶</b>:
            <span style="color:#ffe;">${c.entries.map(e => _esc(e.id)).join('、')}</span>
          </div>`).join('');

        // 規則 3:汙染偵查(★ v3.13.67)— 可疑 SSR/SR/至寶/知識幣異常
        const ssrBlocks3 = (p.suspiciousSSR || []).map(h => `
          <div style="background:rgba(200,40,160,0.22);border-left:4px solid #ff55cc;border-radius:4px;padding:6px 10px;margin:4px 0;font-size:11px;">
            <b style="color:#ffbbee;">👑 可疑 SSR</b>
            <span style="color:#ffe;">${_esc(h.name)}</span>
            <span style="color:#ddaaff;">(來源:${_esc(h.source||'(空)')}・${_fmtTime(h.at)})</span>
          </div>`).join('');
        const srBlocks3 = (p.suspiciousSRClusters || []).map(c => `
          <div style="background:rgba(170,60,200,0.2);border-left:4px solid #bb66ee;border-radius:4px;padding:6px 10px;margin:4px 0;font-size:11px;">
            <b style="color:#e0bbff;">💜 10 分鐘內 ${c.length} 隻可疑 SR</b>:
            <span style="color:#ffe;">${c.map(e => _esc(e.name) + '(' + _esc(e.source||'空') + ')').join('、')}</span>
          </div>`).join('');
        const treBlocks3 = (p.suspiciousTreasureClusters || []).map(c => `
          <div style="background:rgba(80,140,220,0.2);border-left:4px solid #5599ee;border-radius:4px;padding:6px 10px;margin:4px 0;font-size:11px;">
            <b style="color:#bbddff;">💎 10 分鐘內 ${c.length} 個可疑至寶</b>:
            <span style="color:#ffe;">${c.map(e => _esc(e.id) + '(' + _esc(e.source||'空') + ')').join('、')}</span>
          </div>`).join('');
        const coinBlocks3 = (p.coinAnomalies || []).map(a => {
          if(a.kind === 'tamper'){
            return `<div style="background:rgba(220,80,40,0.22);border-left:4px solid #ff7733;border-radius:4px;padding:6px 10px;margin:4px 0;font-size:11px;">
              <b style="color:#ffccaa;">🪙 知識幣對帳跳變(疑似竄改)</b>:
              <span style="color:#ffe;">${(a.amount>0?'+':'') + a.amount} 幣</span>
              <span style="color:#ffbb99;">(餘額 ${a.balance}・${_fmtTime(a.at)})</span>
            </div>`;
          }
          const _lbl = a.kind === 'spree' ? '🛒 短時間大量購買(疑似盜登亂買)' : '💱 短時間大量賣出(疑似盜登賤賣貴重物)';
          const _det = (a.entries||[]).slice(0,6).map(e => _esc(e.reason) + ' ' + (e.amount>0?'+':'') + e.amount).join('、');
          return `<div style="background:rgba(220,150,40,0.2);border-left:4px solid #eeaa33;border-radius:4px;padding:6px 10px;margin:4px 0;font-size:11px;">
            <b style="color:#ffe0aa;">${_lbl}</b>
            <span style="color:#ffcc88;">15 分鐘內 ${a.count} 筆 / 共 ${a.sum} 幣</span>:
            <span style="color:#ffe;">${_det}${(a.entries&&a.entries.length>6)?' …':''}</span>
          </div>`;
        }).join('');
        const _rule3HasAny = !!(ssrBlocks3 || srBlocks3 || treBlocks3 || coinBlocks3);
        const _rule3Note = _rule3HasAny
          ? '<div style="font-size:10px;color:#ccaadd;margin:6px 0 2px;border-top:1px dashed rgba(200,150,255,0.3);padding-top:5px;">🔍 汙染偵查(非召喚/非BOSS等正常管道)— ⚠ SSR 含 5/28 前無來源舊資料可能誤報,請對照同台 iPad 人工判斷</div>'
          : '';

        const _cardStyle = _isHandled
          ? 'background:rgba(40,40,50,0.35);border:1px solid rgba(120,120,140,0.35);border-radius:8px;padding:10px;margin-bottom:8px;opacity:0.5;'
          : 'background:rgba(40,15,30,0.5);border:1px solid rgba(255,120,140,0.4);border-radius:8px;padding:10px;margin-bottom:8px;';
        const _handledLabel = _isHandled
          ? '<span style="color:#aabbcc;font-size:11px;margin-left:8px;background:rgba(80,100,120,0.4);padding:2px 6px;border-radius:3px;">✓ 已處理 by ' + _esc(_hInfo.by||'?') + ' (' + _fmtTime(_hInfo.at) + ')</span>'
          : '';
        const _handleBtn = _isHandled
          ? '<button class="_aa-unmark" data-uid="' + _esc(p.uid) + '" style="padding:5px 10px;font-size:11px;background:#666;color:#fff;border:none;border-radius:4px;cursor:pointer;margin-right:4px;">↩ 取消已處理</button>'
          : '<button class="_aa-mark" data-uid="' + _esc(p.uid) + '" style="padding:5px 10px;font-size:11px;background:#44aa66;color:#fff;border:none;border-radius:4px;cursor:pointer;margin-right:4px;">✓ 已處理</button>';

        return '<div class="_aa-card" data-uid="' + _esc(p.uid) + '" data-handled="' + (_isHandled?'1':'0') + '" style="' + _cardStyle + '">'
          + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;flex-wrap:wrap;gap:6px;">'
          +   '<div style="flex:1;min-width:0;">'
          +     '<b style="color:#ffe;">' + _esc(p.name || '(無名稱)') + '</b>'
          +     '<span style="color:#aac;margin-left:8px;font-size:11px;">' + _esc(p.email || p.uid) + '</span>'
          +     '<span style="color:#ff8866;margin-left:8px;font-size:11px;">共 ' + p.totalConflicts + ' 筆異常</span>'
          +     _handledLabel
          +   '</div>'
          +   '<div style="flex-shrink:0;">'
          +     _handleBtn
          +     '<button class="_aa-jump" data-uid="' + _esc(p.uid) + '" style="padding:5px 12px;font-size:11px;background:#3366bb;color:#fff;border:none;border-radius:4px;cursor:pointer;">→ 查看詳情</button>'
          +   '</div>'
          + '</div>'
          + heroTimeBlocks + treTimeBlocks + heroBidBlocks + treBidBlocks
          + _rule3Note + ssrBlocks3 + srBlocks3 + treBlocks3 + coinBlocks3
          + '</div>';
      }).join('');

      _contentEl.innerHTML = _cacheBlock + _statsBlock + _toggleBlock
        + `<div style="margin-bottom:8px;font-size:13px;color:#ffaaaa;">⚠ 共 ${ab.length} 位玩家有異常(掃 ${r.scanned} 位)— ⏱ 紅框=3 分鐘內連刷;battleId 標籤=同場戰鬥多解鎖;👑💜💎🪙 紫/橘框=汙染偵查(非正常管道大量新增 SSR/SR/至寶 或 知識幣竄改/盜刷/盜賣)</div>`
        + cards;

      // ── 事件綁定 ──
      _contentEl.querySelectorAll('._aa-jump').forEach(btn => {
        btn.onclick = async function(){
          _curAnomalyIdx = _anomalyOrder.indexOf(btn.dataset.uid);  // ★ v3.13.68 記住在清單位置
          _queryInput.value = btn.dataset.uid;
          await _doQuery();
        };
      });
      _contentEl.querySelectorAll('._aa-mark').forEach(btn => {
        btn.onclick = async function(){
          const _uid = btn.dataset.uid;
          btn.disabled = true;
          const _orig = btn.textContent;
          btn.textContent = '⏳';
          const ok = await _toggleAnomalyHandled(_uid, true);
          if(ok){
            const me = (window._fbUser && window._fbUser.email)
                     || (window._fbUser && window._fbUser.uid && String(window._fbUser.uid).slice(0,10))
                     || 'unknown';
            handled[_uid] = { at: Date.now(), by: me };
            _renderAnomalyCards(r, handled, opts);   // 重渲染套用已處理樣式
          }else{
            btn.disabled = false;
            btn.textContent = _orig;
            alert('標記失敗,請重試(可能網路問題或權限不足)');
          }
        };
      });
      _contentEl.querySelectorAll('._aa-unmark').forEach(btn => {
        btn.onclick = async function(){
          const _uid = btn.dataset.uid;
          btn.disabled = true;
          const _orig = btn.textContent;
          btn.textContent = '⏳';
          const ok = await _toggleAnomalyHandled(_uid, false);
          if(ok){
            delete handled[_uid];
            _renderAnomalyCards(r, handled, opts);
          }else{
            btn.disabled = false;
            btn.textContent = _orig;
            alert('取消失敗,請重試');
          }
        };
      });
      // toggle「只看未處理」
      const _toggleEl = document.getElementById('_aa-toggle-unhandled-only');
      if(_toggleEl){
        _toggleEl.onclick = function(){
          const _hide = _toggleEl.checked;
          _contentEl.querySelectorAll('._aa-card').forEach(card => {
            card.style.display = (_hide && card.dataset.handled === '1') ? 'none' : '';
          });
        };
      }

      _bindSyncTotalPlayersBtn(r);
      _setStatus(`⚠ 找到 ${ab.length} 位異常玩家(${_unhandledCount} 位待處理)`, _unhandledCount === 0 ? '#88ddaa' : '#ffaa66');
    }

    // ── 全掃異常(battleId + 時間窗雙規則) ──
    async function _doScanAnomaly(){
      if(!confirm('掃描全部玩家的異常?\n\n規則:\n  ① 同 battleId 多解鎖(精確)\n  ② 3 分鐘內打 BOSS 解鎖 > 2 隻(主規則,適用老資料)\n  ③ 汙染偵查(★ v3.13.67):非召喚/非擊敗BOSS等正常管道而短時間大量新增\n     ・可疑 SSR 出現即標、可疑 SR 10 分鐘內 ≥3、可疑至寶 ≥2\n     ・知識幣:對帳跳變(竄改)/ 短時間大量購買(盜登亂買)/ 短時間大量賣出貴重物(盜登賤賣)\n\n300 位玩家約 15-30 秒,請耐心等候。')) return;
      _setStatus('掃描中...這可能要 15-30 秒', '#aaccff');
      _scanBtn.disabled = true;
      try{
        if(typeof window._fbAdminScanBattleAnomaly !== 'function'){
          throw new Error('_fbAdminScanBattleAnomaly 未載入');
        }
        // ★ v3.11.35g — 不傳 limit = 掃全部
        const r = await window._fbAdminScanBattleAnomaly({});
        // ★ v3.13.30 — 掃完寫快取(merge:true 保留 handled),併讀回既有 handled 一起渲染
        try{ await _saveAnomalyScanCache(r); }catch(_eSv){ console.warn('[anomaly cache save fail, continue rendering]', _eSv); }
        let _handled = {};
        try{ const _c = await _loadAnomalyScanCache(); _handled = (_c && _c.handled) || {}; }catch(_eL){}
        _renderAnomalyCards(r, _handled, { fromCache: false });
      }catch(e){
        _setStatus('❌ 掃描失敗: ' + (e.message || e), '#ff8866');
      }finally{
        _scanBtn.disabled = false;
      }
    }

    // ★ v3.11.35g — 同步首頁總玩家數按鈕綁定
    function _bindSyncTotalPlayersBtn(scanResult){
      const _btn = document.getElementById('_aa-sync-totalplayers');
      if(!_btn) return;
      _btn.onclick = async function(){
        if(!confirm(`確認把首頁顯示的總玩家數從 ${scanResult.statsTotalPlayers} 改成 ${scanResult.actualPlayerCount}?\n\n這會覆寫 stats/global.totalPlayers,所有玩家首頁的數字會立即更新。`)) return;
        _btn.disabled = true;
        _btn.textContent = '⏳ 同步中...';
        try{
          if(typeof window._fbBackfillTotalPlayers !== 'function'){
            throw new Error('_fbBackfillTotalPlayers 未載入');
          }
          const _newCount = await window._fbBackfillTotalPlayers();
          _btn.textContent = `✅ 已同步為 ${_newCount} — 請按上方掃描異常重新確認`;
          _btn.style.background = 'linear-gradient(135deg,#66cc44,#338822)';
          _setStatus(`✅ 總玩家數已同步為 ${_newCount}`, '#88ddaa');
        }catch(e){
          _btn.disabled = false;
          _btn.textContent = '❌ 同步失敗,點此重試';
          _setStatus('❌ 同步失敗: ' + (e.message || e), '#ff8866');
        }
      };
    }

    // ── 事件綁定 ──
    _searchBtn.onclick = function(){ _curAnomalyIdx = -1; _doQuery(); };  // ★ v3.13.68 手動查詢清除清單位置(不顯示導航條)
    _queryInput.onkeydown = (ev) => { if(ev.key === 'Enter'){ _curAnomalyIdx = -1; _doQuery(); } };
    if(_scanBtn) _scanBtn.onclick = _doScanAnomaly;

    // ★ v3.13.30(2026-06-03) — 自動載入上次的異常掃描快取
    //   GM 開面板就看到上次結果與處理狀態,無需重掃 Firestore(節省額度)
    //   注意:這只在 admin_panel.js init 時跑一次(每次 GM 開面板都會 init)
    (async function _autoLoadAnomalyCache(){
      try{
        const cache = await _loadAnomalyScanCache();
        if(cache && cache.ts && Array.isArray(cache.abnormal)){
          _renderAnomalyCards({
            abnormal:             cache.abnormal,
            scanned:              cache.scanned || 0,
            totalPlayersMismatch: !!cache.totalPlayersMismatch,
            actualPlayerCount:    cache.actualPlayerCount || 0,
            statsTotalPlayers:    cache.statsTotalPlayers,
          }, cache.handled || {}, { fromCache: true, scannedAt: cache.ts, scannedBy: cache.scannedBy });
        }
      }catch(e){ console.warn('[anomaly cache auto-load]', e); }
    })();

    if(_tabsEl){
      _tabsEl.querySelectorAll('._aa-tab').forEach(b => {
        b.onclick = () => _switchTab(b.dataset.tab);
      });
    }
  })();

  // ════════════════════════════════════════════════════════════════
  // ★ v3.13.1(2026-05-31)— 老師需求 3:全員獎章補發掃描 — 按鈕綁定
  //   呼叫 window._adminScanAllMedals 跑三階段補發:
  //     (1) _checkMedalsOnLogin → 明確規則(等級/技能/答題等)
  //     (2) _inferMissedMedals  → 推論規則(v3.13.1 大幅擴充)
  //     (3) _grantRetroactiveMedalRewards → 對未領獎勵的獎章發水晶+幣
  // ════════════════════════════════════════════════════════════════
  (function _bindMedalScanSection(){
    const _btn = document.getElementById('_admin-medal-scan-btn');
    const _statusEl = document.getElementById('_admin-medal-scan-status');
    const _resultEl = document.getElementById('_admin-medal-scan-result');
    if(!_btn || !_statusEl || !_resultEl) return;

    const _esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

    _btn.onclick = async function(){
      if(_btn.disabled) return;
      if(typeof window._adminScanAllMedals !== 'function'){
        _statusEl.style.color = '#ff6666';
        _statusEl.textContent = '❌ _adminScanAllMedals API 未就緒(主程式版本太舊?)';
        return;
      }
      _btn.disabled = true;
      _btn.style.opacity = '0.55';
      _btn.textContent = '⏳ 掃描中...';
      _statusEl.style.color = '#ffcc88';
      _statusEl.textContent = '⏳ 正在掃描所有獎章達成條件,請稍候...';
      _resultEl.style.display = 'none';

      try{
        const _r = await window._adminScanAllMedals();
        if(_r && _r.ok){
          const _inferred = Array.isArray(_r.inferred) ? _r.inferred : [];
          const _newCount = _r.newUnlockedCount || 0;
          const _totalUnlocked = _r.totalUnlocked || 0;
          _statusEl.style.color = '#aaffaa';
          _statusEl.textContent = '✅ 掃描完成!此次補發 ' + _newCount + ' 枚,目前共擁有 ' + _totalUnlocked + ' 枚獎章';

          // 詳細結果
          let _html = '<div style="font-weight:800;color:#ffd066;margin-bottom:8px;">📊 掃描結果</div>';
          _html += '<div style="color:#cce0ff;margin-bottom:6px;">• 此次新解鎖獎章數:<b style="color:#aaffaa;">' + _newCount + '</b></div>';
          _html += '<div style="color:#cce0ff;margin-bottom:6px;">• 目前總獎章數:<b style="color:#ffd066;">' + _totalUnlocked + '</b></div>';
          _html += '<div style="color:#cce0ff;margin-bottom:10px;">• 推論補解項目:<b style="color:#aaffaa;">' + _inferred.length + '</b> 枚</div>';

          if(_inferred.length > 0){
            _html += '<div style="margin-top:10px;padding:8px;background:rgba(180,140,40,0.18);border-radius:6px;">';
            _html += '<div style="font-weight:700;color:#ffe066;margin-bottom:6px;">本次推論補解的獎章 ID:</div>';
            _html += '<div style="font-family:monospace;font-size:12px;line-height:1.7;word-break:break-all;color:#aaffcc;">';
            _html += _inferred.map(id => _esc(id)).join(', ');
            _html += '</div></div>';
          } else {
            _html += '<div style="margin-top:10px;padding:8px;background:rgba(60,60,80,0.3);border-radius:6px;color:#aaa;">無新補解項目(該帳號的獎章已經完整)</div>';
          }

          _html += '<div style="margin-top:10px;color:#aaa;font-size:11px;">💡 已自動發放對應的水晶+知識幣獎勵。詳細獎勵內容請見彈出的「補發通知」。若沒看到通知代表沒有新獎章可補。</div>';
          _resultEl.innerHTML = _html;
          _resultEl.style.display = 'block';
        } else {
          _statusEl.style.color = '#ff6666';
          _statusEl.textContent = '❌ 掃描失敗:' + ((_r && _r.reason) || '未知錯誤');
        }
      }catch(e){
        console.error('[獎章掃描] 例外', e);
        _statusEl.style.color = '#ff6666';
        _statusEl.textContent = '❌ 例外:' + ((e && e.message) || String(e));
      }
      _btn.disabled = false;
      _btn.style.opacity = '1';
      _btn.textContent = '🔍 立即掃描 + 補發';
    };
  })();

  // ════════════════════════════════════════════════════════════════
  // ★ v3.5.20 — 世界 BOSS 排行榜管理區塊綁定(老師 2026-05-22 需求)
  // ════════════════════════════════════════════════════════════════
  (function _bindWblbSection(){
    const _infoEl = document.getElementById('_admin-wblb-info');
    const _refreshBtn = document.getElementById('_admin-wblb-refresh');
    const _clearVesuviusBtn = document.getElementById('_admin-wblb-clear-vesuvius');
    // ★ v3.5.22 — 查看明細・指定刪除
    const _detailBtn = document.getElementById('_admin-wblb-detail');
    if(!_infoEl || !_clearVesuviusBtn) return;

    const BOSS_ID = 'vesuvius_fire_dragon';  // ★ v3.5.21 修正:之前誤用 'vesuvius',真實 ID 是這個(world-boss-ui.html line 3624)

    function _renderInfo(){
      try{
        // 從 _cachedGlobalStats 讀目前排行榜
        const _gs = window._cachedGlobalStats;
        const _lbMap = (_gs && _gs.worldBossLeaderboard) || {};
        const _list = Array.isArray(_lbMap[BOSS_ID]) ? _lbMap[BOSS_ID] : [];
        const _totalBattles = _list.reduce(function(s, e){ return s + (e.battles || 0); }, 0);
        const _topTeam = _list.length > 0
          ? _list.slice().sort(function(a,b){ return (b.totalDmg||0) - (a.totalDmg||0); })[0]
          : null;
        const _topNames = _topTeam && Array.isArray(_topTeam.teamNames)
          ? _topTeam.teamNames.filter(Boolean).join(', ')
          : '—';
        _infoEl.innerHTML =
          '🐉 BOSS:<b style="color:#ffd066;">維蘇威火山龍王</b>(bossId=' + BOSS_ID + ')<br>' +
          '📊 排行榜紀錄:<b style="color:#88ccff;">' + _list.length + ' 隊伍</b> · ' +
          '累積 <b style="color:#88ccff;">' + _totalBattles + ' 場戰鬥</b><br>' +
          '🥇 目前第 1 名:' + (_topTeam
            ? '<b style="color:#aaffcc;">' + _topNames + '</b>(總傷 ' +
              (_topTeam.totalDmg || 0).toLocaleString() + ')'
            : '尚無紀錄');
      }catch(e){
        _infoEl.innerHTML = '<span style="color:#ff8888;">⚠️ 讀取失敗:' + (e && e.message || e) + '</span>';
      }
    }

    function _refresh(){
      _renderInfo();
      // 順便觸發雲端同步(雖然 subscribeWbHp 應該已即時更新,但手動 refresh 可保險)
      // 不主動讀 Firestore,只刷新 UI(資料靠 onSnapshot 自動更新)
    }

    _refresh();
    // 監聽雲端排行榜更新事件(在 line ~5052 廣播的)
    // ★ 用 AbortController 確保 _closeAdminPanel 觸發時自動解綁,避免事件監聽 leak
    const _wblbAbortCtrl = new AbortController();
    _adminPanelState.wblbAbort = _wblbAbortCtrl;  // 讓 _closeAdminPanel 能 abort 它
    document.addEventListener('wbLeaderboardSynced', function(){ _refresh(); },
                              { signal: _wblbAbortCtrl.signal });

    if(_refreshBtn) _refreshBtn.onclick = _refresh;

    if(_clearVesuviusBtn) _clearVesuviusBtn.onclick = async function(){
      // 二次確認(避免誤觸)
      const _confirmMsg = '⚠️ 確定要清除「維蘇威火山龍王」全班累積排行榜紀錄嗎?\n\n'
                       + '此操作不可逆。已存的隊伍排名、累積傷害、戰鬥場次都會歸零。\n\n'
                       + '請再確認一次,要清除嗎?';
      if(typeof _customConfirm === 'function'){
        _customConfirm(_confirmMsg.replace(/\n/g, '<br>'), async function(){
          await _doClear();
        });
      } else {
        if(!confirm(_confirmMsg)) return;
        await _doClear();
      }
    };

    async function _doClear(){
      _clearVesuviusBtn.disabled = true;
      const _origText = _clearVesuviusBtn.textContent;
      _clearVesuviusBtn.textContent = '清除中…';
      try{
        if(!window._wbHpSync || typeof window._wbHpSync.clearLeaderboard !== 'function'){
          throw new Error('_wbHpSync.clearLeaderboard API 不存在(模組未掛載?)');
        }
        const result = await window._wbHpSync.clearLeaderboard(BOSS_ID);
        if(!result){
          throw new Error('清除失敗(API 回 null)');
        }
        const _msg = '✅ 已清除維蘇威火山龍王排行榜!\n' +
                     '・移除 ' + (result.removed || 0) + ' 筆紀錄\n' +
                     (result.kept > 0 ? '・保留其他 BOSS ' + result.kept + ' 筆紀錄' : '');
        if(typeof _showSimpleToast === 'function'){
          _showSimpleToast(_msg, 'ok');
        } else {
          alert(_msg);
        }
        _refresh();
      }catch(e){
        console.error('[排行榜清除] 失敗', e);
        if(typeof _showSimpleToast === 'function'){
          _showSimpleToast('❌ 清除失敗:' + (e && e.message || e), 'err');
        } else {
          alert('清除失敗:' + (e && e.message || e));
        }
      }finally{
        _clearVesuviusBtn.disabled = false;
        _clearVesuviusBtn.textContent = _origText;
      }
    }

    // ════════════════════════════════════════════════════════════════
    // ★ v3.5.22(2026-05-22) — 查看明細・指定刪除異常紀錄
    //   用途:某次戰鬥因 BUG/異常造成爆量傷害,只想刪那一筆而非整個排行榜全清
    //   設計:
    //     - 從 _cachedGlobalStats 讀目前 BOSS_ID 的排行榜
    //     - 用 modal 列出每筆,顯示總傷/戰鬥數/單場平均/英雄+等級/最後更新時間
    //     - 單場平均 > 5000 自動標紅(提醒老師可能是異常)
    //     - 每筆有 checkbox,勾選後按下方「刪除已勾選 N 筆」
    //     - 走 _wbHpSync.clearLeaderboardEntries(BOSS_ID, teamKeys) transaction 刪
    //   清理:modal 關閉時把節點移除 + 結束 escape/click-outside 監聽
    // ════════════════════════════════════════════════════════════════
    let _detailModal = null;  // 同一時間只允許一個 modal

    function _formatTime(ts){
      if(!ts || typeof ts !== 'number') return '—';
      try{
        const d = new Date(ts);
        const pad = function(n){ return n < 10 ? '0'+n : ''+n; };
        return (d.getMonth()+1) + '/' + d.getDate() + ' ' +
               pad(d.getHours()) + ':' + pad(d.getMinutes());
      }catch(_){ return '—'; }
    }

    function _renderHeroChips(teamHeroes, teamNames){
      // 優先用 teamHeroes (有 lv),fallback 用 teamNames
      if(Array.isArray(teamHeroes) && teamHeroes.length > 0){
        return teamHeroes.map(function(h){
          const _n = (h && h.name) || '?';
          const _lv = (h && h.lv) || 1;
          return '<span style="display:inline-block;padding:2px 7px;margin:1px 3px 1px 0;' +
                 'background:rgba(80,60,120,0.5);border:1px solid rgba(160,140,220,0.4);' +
                 'border-radius:10px;font-size:11px;color:#ddd;">' +
                 _n + ' <span style="color:#ffd066;">Lv' + _lv + '</span></span>';
        }).join('');
      }
      if(Array.isArray(teamNames) && teamNames.length > 0){
        return teamNames.filter(Boolean).map(function(n){
          // ★ v3.5.68(2026-05-24) — 老師需求:管理員後台一律顯示完整真實姓名
          //   拿掉 protectIfNoEmail,直接原樣顯示玩家輸入的 name(可能是真名)
          //   老師會自行判斷截圖前要不要馬賽克
          return '<span style="display:inline-block;padding:2px 7px;margin:1px 3px 1px 0;' +
                 'background:rgba(80,60,120,0.5);border:1px solid rgba(160,140,220,0.4);' +
                 'border-radius:10px;font-size:11px;color:#ddd;">' + n + '</span>';
        }).join('');
      }
      return '<span style="color:#888;">（無英雄資料）</span>';
    }

    // ★ v3.5.43 — 彈出某筆紀錄的「最近一場傷害來源明細」視窗
    //   entry.lastDmgSources: [{heroName, heroLv, skill, skillLv, totalDmg, hits, isFixed}, ...]
    function _showDmgSourcesDialog(entry){
      const _old = document.getElementById('_wblb-sources-overlay');
      if(_old) _old.remove();

      const _sources = Array.isArray(entry.lastDmgSources) ? entry.lastDmgSources : [];
      // 按總傷排序(已在 world-boss.js 排好,但這裡保險再排一次)
      _sources.sort(function(a, b){ return (b.totalDmg||0) - (a.totalDmg||0); });

      // 統計
      let _totalReal = 0, _totalFixed = 0;
      _sources.forEach(function(s){
        if(s.isFixed) _totalFixed += (s.totalDmg||0);
        else _totalReal += (s.totalDmg||0);
      });
      const _grandTotal = _totalReal + _totalFixed;

      // 玩家暱稱顯示 — ★ v3.5.68(2026-05-24) — 老師需求:管理員後台一律顯示完整真實姓名
      //   拿掉 protectIfNoEmail,直接原樣顯示
      const _nameStr = Array.isArray(entry.teamNames)
        ? entry.teamNames.filter(Boolean).join(' / ') : '?';
      // 最近一場戰鬥時間 + 傷害
      const _lastBattleTime = entry.lastBattleAt
        ? new Date(entry.lastBattleAt).toLocaleString('zh-TW')
        : '(無時間)';
      const _lastBattleDmg = entry.lastBattleDmg || 0;

      // 渲染明細列(分 fixedDmg / 真實技能 兩區)
      const _renderSource = function(s, idx){
        const _ratio = _grandTotal > 0 ? ((s.totalDmg / _grandTotal) * 100).toFixed(1) : '0';
        const _bg = s.isFixed
          ? 'background:rgba(180,140,60,0.18);border-left:3px solid #ffaa44;'
          : 'background:rgba(60,140,200,0.15);border-left:3px solid #66bbff;';
        const _badge = s.isFixed
          ? '<span style="font-size:10px;color:#ffcc66;background:rgba(180,140,40,0.3);padding:1px 6px;border-radius:8px;margin-left:4px;">固定傷害(不列個人評比)</span>'
          : '';
        return '<div style="' + _bg + 'padding:8px 12px;margin-bottom:4px;border-radius:6px;' +
               'display:flex;align-items:center;gap:10px;font-size:13px;">' +
                 '<span style="color:#888;font-size:11px;width:24px;flex:0 0 auto;">#' + (idx+1) + '</span>' +
                 '<div style="flex:1;min-width:0;">' +
                   '<div style="color:#fff;font-weight:700;">' +
                     '<span style="color:#aaccff;">' + (s.heroName||'?') +
                     ' <span style="font-size:11px;color:#ffd066;">Lv.' + (s.heroLv||1) + '</span></span>' +
                     ' · <span style="color:#ddd;">' + (s.skill||'?') +
                     (s.skillLv > 0 ? ' <span style="font-size:11px;color:#aaa;">Lv.' + s.skillLv + '</span>' : '') +
                     '</span>' +
                     _badge +
                   '</div>' +
                   '<div style="font-size:11px;color:#999;margin-top:2px;">' +
                     '命中 ' + (s.hits||1) + ' 次' +
                     ' · 平均 ' + Math.round((s.totalDmg||0) / (s.hits||1)).toLocaleString() + '/次' +
                   '</div>' +
                 '</div>' +
                 '<div style="text-align:right;flex:0 0 auto;">' +
                   '<div style="color:#ffd066;font-size:15px;font-weight:800;">' +
                     (s.totalDmg||0).toLocaleString() + '</div>' +
                   '<div style="color:#888;font-size:10px;">' + _ratio + '%</div>' +
                 '</div>' +
               '</div>';
      };

      const _bodyHtml = _sources.length === 0
        ? '<div style="padding:40px 20px;text-align:center;color:#888;">本場無傷害明細資料<br>' +
          '<span style="font-size:11px;color:#666;">(可能是 v3.5.43 之前的舊紀錄)</span></div>'
        : _sources.map(_renderSource).join('');

      const _overlay = document.createElement('div');
      _overlay.id = '_wblb-sources-overlay';
      // ★ v3.11.19 — 此子 modal 由排行榜明細(現 100050)再開,z-index 從 100001 提到 100060 才不會被蓋。
      _overlay.style.cssText =
        'position:fixed;left:0;top:0;width:100vw;height:100vh;' +
        'background:rgba(0,0,0,0.82);z-index:100060;display:flex;' +
        'align-items:center;justify-content:center;padding:20px;box-sizing:border-box;';

      _overlay.innerHTML =
        '<div style="background:linear-gradient(135deg,rgba(35,25,60,0.98),rgba(20,15,40,0.98));' +
          'border:2px solid rgba(170,140,220,0.7);border-radius:12px;' +
          'width:100%;max-width:720px;max-height:88vh;display:flex;flex-direction:column;' +
          'box-shadow:0 10px 50px rgba(0,0,0,0.7);">' +

          // header
          '<div style="padding:14px 18px;border-bottom:1px solid rgba(170,140,220,0.35);' +
                'display:flex;align-items:center;gap:10px;">' +
            '<div style="font-size:16px;font-weight:800;color:#ddaaff;flex:1;">' +
              '📜 傷害來源明細 · <span style="color:#fff;">' + _nameStr + '</span></div>' +
            '<button id="_wblb-sources-close" style="padding:6px 14px;font-size:13px;' +
                  'background:rgba(80,60,100,0.5);border:1px solid #777;color:#ccc;' +
                  'border-radius:6px;cursor:pointer;font-family:inherit;">關閉 ✕</button>' +
          '</div>' +

          // 摘要區
          '<div style="padding:12px 18px;background:rgba(60,40,90,0.3);' +
                'border-bottom:1px solid rgba(120,80,160,0.25);font-size:12px;color:#bbb;line-height:1.8;">' +
            '🕒 最近一場:' + _lastBattleTime + ' · 該場傷害 <b style="color:#ffd066;">' +
              _lastBattleDmg.toLocaleString() + '</b><br>' +
            '📊 明細總計:<b style="color:#fff;">' + _grandTotal.toLocaleString() + '</b>' +
            ' = 真實技能 <b style="color:#aaccff;">' + _totalReal.toLocaleString() + '</b>' +
            ' + 固定傷害 <b style="color:#ffcc66;">' + _totalFixed.toLocaleString() + '</b>' +
            '<br><span style="color:#888;font-size:11px;">' +
              '⚠ 個人評比(四英雄冠軍)只計入「真實技能」傷害,排除答題獎勵和聯手爆發 5000 傷害。' +
              '<br>整隊累積傷害 totalDmg 兩種都算(完整反映 BOSS 扣血)。' +
            '</span>' +
          '</div>' +

          // 明細
          '<div style="flex:1;overflow-y:auto;padding:12px 18px;">' + _bodyHtml + '</div>' +

          // 底部
          '<div style="padding:12px 18px;border-top:1px solid rgba(170,140,220,0.35);' +
                'font-size:11px;color:#888;text-align:center;">' +
            '本明細僅顯示「最近一場」戰鬥,該隊伍累積歷史不會全部留存(避免 Firestore 配額爆掉)。' +
            '若需要逐場保存,請另外開 console 自行匯出。' +
          '</div>' +
        '</div>';

      document.body.appendChild(_overlay);

      // 關閉按鈕 + 點背景關閉
      const _close = function(){ try{ _overlay.remove(); }catch(_){} };
      _overlay.querySelector('#_wblb-sources-close').onclick = _close;
      _overlay.onclick = function(ev){ if(ev.target === _overlay) _close(); };
    }

    // ════════════════════════════════════════════════════════════════
    // ★ v3.13.3(2026-05-31)— 場次標墓碑 modal(老師需求 2)
    // ────────────────────────────────────────────────────────────────
    // 用途:GM 對某隊伍的具體某「場」(battleHistory[idx])標 BUG 墓碑
    //   - 留紀錄(全員看到「BUG 數據已刪除」紅字)
    //   - 該場 dmg 從 totalDmg 扣回
    //   - 對該場每位玩家發 1 張補償券(隔天可用)
    //
    // 設計:
    //   - 列出該隊伍所有 battleHistory 場次(新到舊)
    //   - 已標墓碑的場次:disable + 灰色顯示「已標墓碑」
    //   - 未標墓碑的場次:checkbox 可勾,顯示傷害/時間/單場異常標記(>5000 警告)
    //   - 工具列:全選 / 全不選 / 只勾異常(單場 > 5000)
    //   - 按下「標記墓碑 + 發補償券」→ 二段確認(輸入原因)→ 執行
    //
    // 執行流程(逐筆):
    //   1. window._wbHpSync.markBattleAsDeleted(BOSS_ID, teamKey, idx, reason)
    //   2. 對該場 _teamKey 的每位 uid 呼叫 window._wbDailyLimit.grantBonusByUid({uid, reason:'BUG補償:...', ...})
    //   3. 全部跑完 → close + refresh
    // ════════════════════════════════════════════════════════════════
    function _showTombModal(entry){
      const _old = document.getElementById('_wblb-tomb-overlay');
      if(_old) _old.remove();
      if(!entry || !Array.isArray(entry.battleHistory)){
        alert('該隊伍無 battleHistory 可標');
        return;
      }
      const _pad = function(n){ return n < 10 ? '0'+n : ''+n; };
      const _fmt = function(n){
        if(typeof n !== 'number' || isNaN(n) || n <= 0) return '0';
        if(n >= 10000) return (n/10000).toFixed(1) + ' 萬';
        return n.toLocaleString();
      };
      const _teamKey = entry.teamKey || '';
      const _teamNames = Array.isArray(entry.teamNames) ? entry.teamNames.filter(Boolean).join(' / ') : '?';
      // ★ v3.13.4(2026-05-31)— 場次清單同時記住「該日第 N/總 場」編號(跟玩家戰績歷史一致)
      //   原邏輯:「第 N 場」用 origIdx+1(陣列儲存索引)→ 跟玩家戰績歷史的「第 N/總 場」對不上
      //   新邏輯:按「日期 + at 升序」算「該日第 N/該日總場數」,跟 world-boss-ui 1619 行算法一致
      const _hist = entry.battleHistory.map(function(b, idx){
        return { b: b, origIdx: idx };
      });
      // 先按日期分組,算出每場「該日第 N/總場」
      const _dayCounts = {};        // dateStr → 該日總場數
      const _dayNoMap = new Map();  // entry 物件 → 「該日第 N/該日總場」字串
      {
        const _byDay = {};
        _hist.forEach(function(item){
          const _t = new Date(item.b.at || 0);
          const _dk = _t.getFullYear() + '-' + (_t.getMonth()+1) + '-' + _t.getDate();
          if(!_byDay[_dk]) _byDay[_dk] = [];
          _byDay[_dk].push(item);
        });
        Object.keys(_byDay).forEach(function(_dk){
          const _arr = _byDay[_dk].slice().sort(function(a,b){ return (a.b.at||0) - (b.b.at||0); });
          _dayCounts[_dk] = _arr.length;
          _arr.forEach(function(item, i){
            _dayNoMap.set(item, { dayNo: i+1, dayTotal: _arr.length, dateKey: _dk });
          });
        });
      }
      // 顯示走「新到舊」
      _hist.sort(function(a, b){ return (b.b.at||0) - (a.b.at||0); });

      let _rowsHtml = '';
      if(_hist.length === 0){
        _rowsHtml = '<div style="padding:30px;text-align:center;color:#888;">該隊伍尚無戰績</div>';
      } else {
        _rowsHtml = _hist.map(function(item, vi){
          const b = item.b;
          const _isDeleted = !!b._deletedAt;
          const _t = new Date(b.at || Date.now());
          // ★ v3.13.4 — 顯示完整時間到「秒」,讓兩場同分鐘的也能區分
          const _timeStr = (_t.getMonth()+1) + '/' + _t.getDate() + ' ' +
                           _pad(_t.getHours()) + ':' + _pad(_t.getMinutes()) + ':' + _pad(_t.getSeconds());
          // ★ v3.13.4(2026-05-31)— 異常判定改為「該場平均/回合 > 5000」
          //   單擊上限就是 5000,所以平均/回合 > 5000 才是異常
          const _bDmg = (b.dmg || 0);
          const _bTurns = (b.turns || 0);
          const _bAvgPerTurn = _bTurns > 0 ? Math.round(_bDmg / _bTurns) : 0;
          const _isAbnormal = !_isDeleted && _bAvgPerTurn > 5000;
          const _dmg = _isDeleted ? (b._origDmg || 0) : _bDmg;
          const _dmgColor = _isDeleted ? '#888' : (_isAbnormal ? '#ff6666' : '#ffd066');
          const _bg = _isDeleted ? 'rgba(120,40,40,0.2)' : (_isAbnormal ? 'rgba(80,30,30,0.35)' : 'rgba(30,25,40,0.6)');
          const _border = _isDeleted ? 'rgba(180,80,80,0.4)' : (_isAbnormal ? '#ff5555' : 'rgba(140,100,180,0.35)');
          const _label = _isDeleted
            ? '<span style="color:#ff6666;font-size:11px;font-weight:700;margin-left:6px;">🚫 已標墓碑</span>'
            : (_isAbnormal ? '<span style="color:#ff8888;font-size:11px;font-weight:700;margin-left:6px;">⚠️ 異常</span>' : '');
          const _chk = _isDeleted
            ? '<span style="display:inline-block;width:18px;flex:0 0 auto;color:#666;">🚫</span>'
            : '<input type="checkbox" class="_wblb-tomb-chk" data-orig-idx="' + item.origIdx + '" ' +
              'style="margin-top:3px;transform:scale(1.3);cursor:pointer;flex-shrink:0;">';
          // ★ v3.13.4 — 「該日第 N/總 場」編號(跟玩家戰績歷史完全一致)
          const _no = _dayNoMap.get(item);
          const _dayNoStr = _no
            ? ((_t.getMonth()+1) + '/' + _t.getDate() + ' 第 ' + _no.dayNo + '/' + _no.dayTotal + ' 場')
            : ('第 ' + (item.origIdx+1) + ' 場');
          // ★ v3.13.4 — 加聯手爆發 / MVP 顯示(讓老師能對得起玩家戰績歷史)
          const _tbCnt = (b.tb || 0);
          const _mvpStr = (b.mvp && b.mvp.name)
            ? '<span style="color:#ff8866;">MVP <b>' + (b.mvp.name) + '</b> Lv' + (b.mvp.lv||1) +
              ' 傷 ' + _fmt(b.mvp.dmg||0) + '</span>'
            : '';
          return '<label class="_wblb-tomb-row" data-orig-idx="' + item.origIdx + '" style="' +
                 'display:flex;align-items:flex-start;gap:10px;padding:8px 12px;margin-bottom:5px;' +
                 'background:' + _bg + ';border:1.5px solid ' + _border + ';border-radius:6px;' +
                 (_isDeleted ? 'opacity:0.6;cursor:not-allowed;' : 'cursor:pointer;') + '">' +
                   _chk +
                   '<div style="flex:1;min-width:0;font-size:13px;">' +
                     '<div style="font-weight:700;">' +
                       '<span style="color:#aaccff;">' + _dayNoStr + '</span> ' +
                       '<span style="color:#aabbdd;font-size:12px;">🕒 ' + _timeStr + '</span>' +
                       _label +
                     '</div>' +
                     '<div style="margin-top:3px;font-size:12px;color:#bbb;">' +
                       '傷害 <b style="color:' + _dmgColor + ';">' + _fmt(_dmg) + '</b>' +
                       ' · ' + (_bTurns||'—') + ' 回合 · ' + (b.qc||0) + ' 題' +
                       ' · 💥 <b style="color:#ffaa66;">聯手爆發 ' + _tbCnt + ' 次</b>' +
                       (_bAvgPerTurn > 0
                         ? ' · <span style="color:' + (_bAvgPerTurn > 5000 ? '#ff6666' : '#88ccdd') + ';">' +
                           '平均 ' + _bAvgPerTurn.toLocaleString() + '/回</span>'
                         : '') +
                       (b._isBonus ? ' · 🎫 補償場次' : '') +
                       (_mvpStr ? '<br>' + _mvpStr : '') +
                       (_isDeleted ? '<br><span style="color:#ff7777;font-size:11px;">原因:' + (b._deletedReason || '(無)') + '</span>' : '') +
                     '</div>' +
                   '</div>' +
                 '</label>';
        }).join('');
      }

      const _overlay = document.createElement('div');
      _overlay.id = '_wblb-tomb-overlay';
      _overlay.style.cssText =
        'position:fixed;left:0;top:0;width:100vw;height:100vh;' +
        'background:rgba(0,0,0,0.82);z-index:100060;display:flex;' +
        'align-items:center;justify-content:center;padding:20px;box-sizing:border-box;';
      _overlay.innerHTML =
        '<div style="background:linear-gradient(135deg,rgba(45,25,40,0.98),rgba(30,15,30,0.98));' +
          'border:2px solid rgba(220,100,100,0.7);border-radius:12px;' +
          'width:100%;max-width:720px;max-height:88vh;display:flex;flex-direction:column;' +
          'box-shadow:0 10px 50px rgba(0,0,0,0.7);">' +
          // header
          '<div style="padding:14px 18px;border-bottom:1px solid rgba(220,100,100,0.35);' +
                'display:flex;align-items:center;gap:10px;">' +
            '<div style="font-size:16px;font-weight:800;color:#ffaaaa;flex:1;">' +
              '🚫 場次標 BUG · <span style="color:#fff;">' + _teamNames + '</span></div>' +
            '<button id="_wblb-tomb-close" style="padding:6px 14px;font-size:13px;' +
                  'background:rgba(80,60,60,0.5);border:1px solid #877;color:#ccc;' +
                  'border-radius:6px;cursor:pointer;font-family:inherit;">關閉 ✕</button>' +
          '</div>' +
          // 說明
          '<div style="padding:10px 18px;font-size:12px;color:#ddd;background:rgba(80,30,30,0.3);' +
                'border-bottom:1px solid rgba(140,60,60,0.25);line-height:1.6;">' +
            '💡 <b style="color:#ffaa66;">墓碑模式</b>:勾選要標記為 BUG 的場次,執行後:<br>' +
            '<span style="color:#aaffaa;">✅ 留紀錄</span>(玩家展開戰績看到「🚫 BUG 數據已刪除」紅字)<br>' +
            '<span style="color:#aaffaa;">✅ 該場傷害從總傷扣回</span>(維護排行榜公平)<br>' +
            '<span style="color:#aaffaa;">✅ 自動對該場參戰玩家發補償券 ×1</span>(隔天可用)<br>' +
            '<span style="color:#ffcc88;">💡 場次編號與「玩家戰績歷史」的「第 N/總 場」完全一致,' +
            '可比對聯手爆發次數確認是同一場。</span>' +
          '</div>' +
          // 工具列
          '<div style="padding:8px 18px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;' +
                'border-bottom:1px solid rgba(140,60,60,0.25);">' +
            '<button id="_wblb-tomb-selall" style="padding:5px 12px;font-size:12px;' +
                  'background:rgba(60,80,120,0.5);border:1px solid #779;color:#cde;' +
                  'border-radius:5px;cursor:pointer;font-family:inherit;">全選(未標)</button>' +
            '<button id="_wblb-tomb-selnone" style="padding:5px 12px;font-size:12px;' +
                  'background:rgba(60,80,120,0.5);border:1px solid #779;color:#cde;' +
                  'border-radius:5px;cursor:pointer;font-family:inherit;">全不選</button>' +
            '<button id="_wblb-tomb-selab" style="padding:5px 12px;font-size:12px;' +
                  'background:rgba(120,60,40,0.5);border:1px solid #c87;color:#fcb;' +
                  'border-radius:5px;cursor:pointer;font-family:inherit;">⚠️ 只勾異常(平均每回合&gt;5000)</button>' +
            '<span id="_wblb-tomb-count" style="margin-left:auto;font-size:12px;color:#ccc;">已選 0 筆</span>' +
          '</div>' +
          // 列表
          '<div id="_wblb-tomb-list" style="flex:1;overflow-y:auto;padding:12px 18px;">' +
            _rowsHtml +
          '</div>' +
          // 底部
          '<div id="_wblb-tomb-footer" style="padding:12px 18px;border-top:1px solid rgba(220,100,100,0.35);' +
                'display:flex;gap:10px;align-items:center;">' +
            '<span style="font-size:12px;color:#aaa;flex:1;">⚠️ 已標墓碑無法復原。</span>' +
            '<button id="_wblb-tomb-go" style="padding:9px 18px;font-size:14px;font-weight:800;' +
                  'background:linear-gradient(135deg,rgba(180,60,60,0.7),rgba(120,30,30,0.9));' +
                  'border:2px solid #ff8888;color:#fff;border-radius:8px;cursor:pointer;' +
                  'font-family:inherit;opacity:0.5;" disabled>' +
              '🚫 標墓碑 + 發補償券(0 筆)</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(_overlay);

      const _listBox = _overlay.querySelector('#_wblb-tomb-list');
      const _countEl = _overlay.querySelector('#_wblb-tomb-count');
      const _footer = _overlay.querySelector('#_wblb-tomb-footer');
      const _updateCount = function(){
        const _chks = _listBox.querySelectorAll('._wblb-tomb-chk:checked');
        const _n = _chks.length;
        _countEl.textContent = '已選 ' + _n + ' 筆';
        const _btn = _overlay.querySelector('#_wblb-tomb-go');
        if(_btn){
          _btn.textContent = '🚫 標墓碑 + 發補償券(' + _n + ' 筆)';
          _btn.disabled = (_n === 0);
          _btn.style.opacity = (_n === 0) ? '0.5' : '1';
        }
      };
      _listBox.addEventListener('change', function(ev){
        if(ev.target && ev.target.classList && ev.target.classList.contains('_wblb-tomb-chk')){
          _updateCount();
        }
      });

      _overlay.querySelector('#_wblb-tomb-close').onclick = function(){
        try{ _overlay.remove(); }catch(_){}
      };
      _overlay.querySelector('#_wblb-tomb-selall').onclick = function(){
        _listBox.querySelectorAll('._wblb-tomb-chk').forEach(function(c){ c.checked = true; });
        _updateCount();
      };
      _overlay.querySelector('#_wblb-tomb-selnone').onclick = function(){
        _listBox.querySelectorAll('._wblb-tomb-chk').forEach(function(c){ c.checked = false; });
        _updateCount();
      };
      _overlay.querySelector('#_wblb-tomb-selab').onclick = function(){
        // ★ v3.13.4(2026-05-31)— 改用「該場平均每回合 > 5000」判定
        //   單擊上限 5000,平均/回合 > 5000 才是真異常
        _listBox.querySelectorAll('._wblb-tomb-chk').forEach(function(c){
          const _oi = parseInt(c.getAttribute('data-orig-idx'), 10);
          const _b = entry.battleHistory[_oi];
          if(!_b || _b._deletedAt){ c.checked = false; return; }
          const _bDmg = _b.dmg || 0;
          const _bTurns = _b.turns || 0;
          const _bAvgPerTurn = _bTurns > 0 ? (_bDmg / _bTurns) : 0;
          c.checked = (_bAvgPerTurn > 5000);
        });
        _updateCount();
      };

      // 二段確認 → 執行
      // ★ v3.13.3 — 把 normal footer renderer 抽出來,避免在 onclick 內用 arguments.callee(嚴格模式禁用)
      const _renderNormalFooter = function(){
        _footer.innerHTML =
          '<span style="font-size:12px;color:#aaa;flex:1;">⚠️ 已標墓碑無法復原。</span>' +
          '<button id="_wblb-tomb-go" style="padding:9px 18px;font-size:14px;font-weight:800;' +
                'background:linear-gradient(135deg,rgba(180,60,60,0.7),rgba(120,30,30,0.9));' +
                'border:2px solid #ff8888;color:#fff;border-radius:8px;cursor:pointer;' +
                'font-family:inherit;opacity:0.5;" disabled>' +
            '🚫 標墓碑 + 發補償券(0 筆)</button>';
        // 重新綁 _wblb-tomb-go
        const _newGo = _overlay.querySelector('#_wblb-tomb-go');
        if(_newGo) _newGo.onclick = _onGoClick;
        _updateCount();
      };
      const _onGoClick = function(){
        const _chks = _listBox.querySelectorAll('._wblb-tomb-chk:checked');
        if(_chks.length === 0) return;
        const _origIdxs = Array.from(_chks).map(function(c){ return parseInt(c.getAttribute('data-orig-idx'), 10); });

        // 切到二段確認(輸入原因)
        _footer.innerHTML =
          '<input id="_wblb-tomb-reason" type="text" placeholder="原因(玩家不會看到細節,但留 GM 紀錄)" ' +
            'style="flex:1;padding:7px 10px;font-size:13px;background:rgba(20,15,30,0.8);' +
            'border:1.5px solid #c66;color:#fff;border-radius:6px;font-family:inherit;">' +
          '<button id="_wblb-tomb-confirm" style="padding:9px 16px;font-size:13px;font-weight:800;' +
            'background:#cc3333;border:2px solid #ff8888;color:#fff;border-radius:8px;cursor:pointer;' +
            'font-family:inherit;">✅ 確認執行(' + _chks.length + ')</button>' +
          '<button id="_wblb-tomb-cancel" style="padding:9px 16px;font-size:13px;' +
            'background:rgba(80,60,60,0.5);border:1px solid #877;color:#ccc;border-radius:6px;cursor:pointer;' +
            'font-family:inherit;">取消</button>';
        const _reasonInput = _overlay.querySelector('#_wblb-tomb-reason');
        if(_reasonInput) _reasonInput.focus();
        _overlay.querySelector('#_wblb-tomb-cancel').onclick = function(){
          _renderNormalFooter();
        };
        _overlay.querySelector('#_wblb-tomb-confirm').onclick = async function(){
          const _reason = (_reasonInput && _reasonInput.value || '').trim().slice(0, 200);
          if(!_reason){
            if(!confirm('未填寫原因,確定要執行嗎?')){
              return;
            }
          }
          const _confirmBtn = _overlay.querySelector('#_wblb-tomb-confirm');
          if(_confirmBtn){
            _confirmBtn.disabled = true;
            _confirmBtn.textContent = '⏳ 處理中… (0/' + _origIdxs.length + ')';
          }

          // 收集該 teamKey 的所有 uid(可能有 4 個合作 uid,也可能單人 ×4 同 uid)
          const _uidsRaw = (_teamKey || '').split('|').filter(Boolean);
          const _uniqueUids = Array.from(new Set(_uidsRaw));

          let _markedCount = 0;
          let _grantedCount = 0;
          const _failedMarks = [];
          const _failedGrants = [];

          // 逐筆標墓碑(必須順序執行;markBattleAsDeleted 是 transaction,並行可能衝突)
          for(let i = 0; i < _origIdxs.length; i++){
            const _oi = _origIdxs[i];
            try{
              if(!window._wbHpSync || typeof window._wbHpSync.markBattleAsDeleted !== 'function'){
                throw new Error('_wbHpSync.markBattleAsDeleted API 不存在');
              }
              const _r = await window._wbHpSync.markBattleAsDeleted(BOSS_ID, _teamKey, _oi, _reason || '(未填)');
              if(_r && _r.ok){
                _markedCount++;
              } else {
                _failedMarks.push({ idx: _oi, reason: _r && _r.reason });
              }
              if(_confirmBtn){
                _confirmBtn.textContent = '⏳ 處理中… (' + (i+1) + '/' + _origIdxs.length + ')';
              }
            }catch(eM){
              console.warn('[墓碑模式] markBattleAsDeleted 失敗', _oi, eM);
              _failedMarks.push({ idx: _oi, reason: eM && eM.message });
            }
          }

          // 對該場參戰玩家發補償券:1 場標墓碑 → 每個 uid 發 1 張
          for(const _uid of _uniqueUids){
            for(let i = 0; i < _markedCount; i++){
              try{
                if(!window._wbDailyLimit || typeof window._wbDailyLimit.grantBonusByUid !== 'function'){
                  throw new Error('_wbDailyLimit.grantBonusByUid API 不存在');
                }
                const _gr = await window._wbDailyLimit.grantBonusByUid({
                  uid: _uid,
                  reason: 'BUG 數據墓碑補償:' + (_reason || '(未填)'),
                });
                if(_gr && _gr.ok){
                  _grantedCount++;
                } else {
                  _failedGrants.push({ uid: _uid, reason: _gr && _gr.reason });
                }
              }catch(eG){
                console.warn('[墓碑模式] grantBonusByUid 失敗', _uid, eG);
                _failedGrants.push({ uid: _uid, reason: eG && eG.message });
              }
            }
          }

          // 顯示結果
          let _msg = '✅ 已標墓碑 ' + _markedCount + '/' + _origIdxs.length + ' 筆';
          _msg += '\n💰 已發補償券 ' + _grantedCount + ' 張(' + _uniqueUids.length + ' 位玩家 × ' + _markedCount + ' 場)';
          if(_failedMarks.length > 0){
            _msg += '\n⚠️ ' + _failedMarks.length + ' 筆標墓碑失敗:'
              + _failedMarks.map(function(f){ return '#' + f.idx + '(' + (f.reason||'?') + ')'; }).join(', ');
          }
          if(_failedGrants.length > 0){
            _msg += '\n⚠️ ' + _failedGrants.length + ' 張補償券發放失敗(可用 GM 後台手動補)';
          }
          alert(_msg);

          // 關閉所有 modal + refresh 排行榜明細
          try{ _overlay.remove(); }catch(_){}
          try{ if(typeof _closeDetailModal === 'function') _closeDetailModal(); }catch(_){}
          try{ _refresh(); }catch(_){}
        };
      };
      _overlay.querySelector('#_wblb-tomb-go').onclick = _onGoClick;

      _updateCount();
    }

    function _openDetailModal(){
      // 已開就先關掉(避免疊加)
      if(_detailModal){ _closeDetailModal(); }

      // 讀目前排行榜
      const _gs = window._cachedGlobalStats;
      const _lbMap = (_gs && _gs.worldBossLeaderboard) || {};
      const _list = Array.isArray(_lbMap[BOSS_ID]) ? _lbMap[BOSS_ID].slice() : [];
      // 排序:按總傷由高到低(和正式排行榜一致)
      _list.sort(function(a, b){ return (b.totalDmg||0) - (a.totalDmg||0); });

      const _overlay = document.createElement('div');
      _overlay.id = '_admin-wblb-detail-overlay';
      // ★ v3.11.19 — z-index 從 99999 提到 100050:GM 面板 pop 本身就是 99999,
      //   同值時 DOM 順序/stacking context 會讓側欄蓋住此 modal(老師回報「圖層階級太低被 GM 選單蓋住」)。
      //   提到 100050(> 99999 面板、> 100001/100002 既有子 modal)確保排行榜明細永遠在最上層。
      _overlay.style.cssText =
        'position:fixed;left:0;top:0;width:100vw;height:100vh;' +
        'background:rgba(0,0,0,0.78);z-index:100050;display:flex;' +
        'align-items:center;justify-content:center;padding:20px;box-sizing:border-box;';

      let _rowsHtml = '';
      if(_list.length === 0){
        _rowsHtml = '<div style="padding:40px 20px;text-align:center;color:#888;font-size:14px;">' +
                    '目前沒有任何排行榜紀錄</div>';
      } else {
        _rowsHtml = _list.map(function(e, idx){
          const _dmg = e.totalDmg || 0;
          const _bt = e.battles || 0;
          const _avg = _bt > 0 ? Math.round(_dmg / _bt) : 0;
          // ★ v3.13.4(2026-05-31)— 異常判定改為「平均每回合」
          //   老師:1.5 萬/場看起來大,但若用了 11 回合,平均 1364/回合 → 正常
          //   只有「平均/回合 > 5000」才是真的開外掛(單擊上限 5000)
          //   公式:totalDmg / Σ(每場 turns)。若沒有 battleHistory 退回單場估算
          let _avgPerTurn = 0;
          let _totalTurns = 0;
          try{
            if(Array.isArray(e.battleHistory) && e.battleHistory.length > 0){
              e.battleHistory.forEach(function(b){
                if(b && !b._deletedAt){
                  _totalTurns += (b.turns || 0);
                }
              });
              if(_totalTurns > 0) _avgPerTurn = Math.round(_dmg / _totalTurns);
            } else {
              // 退化路徑:用 tiebreaker.turns × battles 估算
              const _approxTurns = ((e.tiebreaker && e.tiebreaker.turns) || 11) * _bt;
              if(_approxTurns > 0) _avgPerTurn = Math.round(_dmg / _approxTurns);
            }
          }catch(_){}
          const _isAbnormalRow = _avgPerTurn > 5000;
          const _avgColor = _isAbnormalRow ? '#ff6666' : (_avgPerTurn > 3000 ? '#ffaa55' : '#aaccff');
          const _avgWarn = _isAbnormalRow ? ' ⚠️' : '';
          const _heroes = _renderHeroChips(e.teamHeroes, e.teamNames);
          const _tb = e.tiebreaker || {};

          // ★ v3.5.43 — 渲染四個冠軍 chip(個人評比,已排除答題獎勵+聯手爆發)
          //   注意:即使該欄位是 null(英雄沒打出該類傷害),也顯示「-」讓老師知道
          const _cs = e.championStats || {};
          const _chip = function(icon, color, ttl, top){
            if(!top || !top.name){
              return '<span style="display:inline-flex;align-items:center;gap:3px;padding:2px 8px;' +
                'background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);' +
                'border-radius:10px;font-size:11px;color:#666;">' +
                icon + ' ' + ttl + ' <span style="color:#555;">-</span></span>';
            }
            const _v = (top.value || 0).toLocaleString();
            return '<span style="display:inline-flex;align-items:center;gap:3px;padding:2px 8px;' +
              'background:rgba(255,255,255,0.05);border:1px solid ' + color + '55;' +
              'border-radius:10px;font-size:11px;color:#ddd;">' +
              icon + ' ' + ttl + ' <b style="color:' + color + ';">' + top.name +
              ' <span style="font-size:10px;color:#888;">Lv.' + (top.lv||1) + '</span></b> ' +
              '<span style="color:#aaa;">(' + _v + ')</span></span>';
          };
          const _ctrlDetail = _cs.topCtrl_detail
            ? ' <span style="color:#999;font-size:10px;">' + (_cs.topCtrl_detail.count||0) +
              '次·' + (_cs.topCtrl_detail.turnSum||0) + '回合</span>'
            : '';
          const _championRow =
            '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:5px;padding:5px 7px;' +
                  'background:rgba(0,0,0,0.25);border-radius:6px;border-left:3px solid #cc99ee;">' +
              _chip('🗡', '#ff8866', '傷害', _cs.topDmg) +
              _chip('💚', '#66dd99', '治療', _cs.topHeal) +
              _chip('🛡', '#88aaff', '肉盾', _cs.topTank) +
              _chip('🎯', '#ffcc66', '控場', _cs.topCtrl) +
              (_ctrlDetail ? '<span style="font-size:11px;color:#bbb;">' + _ctrlDetail + '</span>' : '') +
            '</div>';

          // ★ v3.5.43 — 「📜 查看傷害來源」按鈕(該場完整明細)
          const _hasSources = Array.isArray(e.lastDmgSources) && e.lastDmgSources.length > 0;
          const _sourcesBtn = _hasSources
            ? '<button class="_wblb-sources-btn" data-teamkey="' + (e.teamKey||'').replace(/"/g,'&quot;') + '" ' +
              'style="padding:3px 9px;font-size:11px;font-weight:700;cursor:pointer;' +
              'background:linear-gradient(135deg,rgba(140,90,200,0.4),rgba(100,60,160,0.4));' +
              'border:1.5px solid #aa88dd;color:#e0d0ff;border-radius:6px;font-family:inherit;' +
              'margin-left:6px;flex:0 0 auto;">📜 傷害明細(' + e.lastDmgSources.length + ')</button>'
            : '<span style="font-size:10px;color:#666;margin-left:6px;">(本場無明細)</span>';

          // ★ v3.13.3(2026-05-31)— 「🚫 場次標 BUG」按鈕(墓碑模式單場)
          //   點開後彈出該隊伍所有場次,GM 勾選具體場次標墓碑(留紀錄+扣總傷+全員可見)
          const _hasBattleHistory = Array.isArray(e.battleHistory) && e.battleHistory.length > 0;
          // 算「未標記」場次數(已標墓碑的不再算入可標)
          const _undeletedCount = _hasBattleHistory
            ? e.battleHistory.filter(function(b){ return b && !b._deletedAt; }).length
            : 0;
          const _tombBtn = _hasBattleHistory && _undeletedCount > 0
            ? '<button class="_wblb-tomb-btn" data-teamkey="' + (e.teamKey||'').replace(/"/g,'&quot;') + '" ' +
              'style="padding:3px 9px;font-size:11px;font-weight:700;cursor:pointer;' +
              'background:linear-gradient(135deg,rgba(180,60,60,0.4),rgba(140,40,40,0.5));' +
              'border:1.5px solid #ee7777;color:#ffdddd;border-radius:6px;font-family:inherit;' +
              'margin-left:6px;flex:0 0 auto;" title="GM 對單場標墓碑(留紀錄+扣總傷+退補償券)">' +
              '🚫 場次標 BUG(' + _undeletedCount + ')</button>'
            : '';

          return '<label class="_wblb-row" data-teamkey="' + (e.teamKey||'').replace(/"/g,'&quot;') + '" style="' +
                 'display:block;padding:10px 12px;margin-bottom:6px;' +
                 'background:rgba(30,25,40,0.6);border:1.5px solid rgba(140,100,180,0.35);' +
                 'border-radius:8px;cursor:pointer;transition:background 0.15s;">' +
                 '<div style="display:flex;align-items:flex-start;gap:10px;">' +
                   '<input type="checkbox" class="_wblb-chk" style="margin-top:3px;transform:scale(1.3);cursor:pointer;flex-shrink:0;">' +
                   '<div style="flex:1;min-width:0;">' +
                     '<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-bottom:5px;">' +
                       '<span style="color:#ddd;font-size:13px;font-weight:700;">#' + (idx+1) + '</span>' +
                       '<span style="color:#ffd066;font-size:14px;font-weight:800;">' +
                          _dmg.toLocaleString() + ' 傷</span>' +
                       '<span style="color:#bbb;font-size:12px;">· ' + _bt + ' 場</span>' +
                       '<span style="color:' + _avgColor + ';font-size:12px;font-weight:700;">' +
                          '· 平均 ' + _avg.toLocaleString() + '/場 · ' +
                          (_avgPerTurn > 0 ? _avgPerTurn.toLocaleString() + '/回' : '?/回') +
                          _avgWarn + '</span>' +
                       _sourcesBtn +
                       _tombBtn +
                       '<span style="color:#888;font-size:11px;margin-left:auto;">' +
                          '🕒 ' + _formatTime(e.lastUpdated) + '</span>' +
                     '</div>' +
                     '<div style="margin-bottom:4px;">' + _heroes + '</div>' +
                     _championRow +
                     '<div style="font-size:11px;color:#888;">' +
                       '回合 ' + (_tb.turns||'—') + ' · 答對 ' + (_tb.quizCorrect||0) +
                       ' · 存活 ' + (_tb.aliveCount||0) +
                       ' · key:<code style="color:#777;">' + (e.teamKey||'—').substring(0,40) + '</code>' +
                     '</div>' +
                   '</div>' +
                 '</div>' +
                 '</label>';
        }).join('');
      }

      _overlay.innerHTML =
        '<div style="background:linear-gradient(135deg,rgba(40,25,60,0.98),rgba(25,20,45,0.98));' +
        'border:2px solid rgba(180,140,220,0.6);border-radius:12px;' +
        'width:100%;max-width:780px;max-height:90vh;display:flex;flex-direction:column;' +
        'box-shadow:0 10px 40px rgba(0,0,0,0.6);">' +
          // header
          '<div style="padding:14px 18px;border-bottom:1px solid rgba(180,140,220,0.35);' +
                      'display:flex;align-items:center;gap:10px;">' +
            '<div style="font-size:17px;font-weight:800;color:#ddaaff;flex:1;">' +
              '🔍 維蘇威火山龍王・排行榜明細(' + _list.length + ' 筆)</div>' +
            '<button id="_admin-wblb-detail-close" style="padding:6px 14px;font-size:13px;' +
                    'background:rgba(80,60,100,0.5);border:1px solid #777;color:#ccc;' +
                    'border-radius:6px;cursor:pointer;font-family:inherit;">關閉 ✕</button>' +
          '</div>' +
          // 提示
          '<div style="padding:8px 18px;font-size:12px;color:#bbb;background:rgba(60,40,80,0.3);' +
                      'border-bottom:1px solid rgba(120,80,160,0.25);line-height:1.5;">' +
            '💡 勾選要刪除的紀錄(整筆,含累積傷害&戰鬥數)。<b style="color:#ffaa66;">' +
            '單場平均每回合 &gt; 5000 標紅</b>,通常代表 BUG/異常傷害。(單擊上限 5000)' +
          '</div>' +
          // 工具列
          '<div style="padding:8px 18px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;' +
                      'border-bottom:1px solid rgba(120,80,160,0.25);">' +
            '<button id="_admin-wblb-detail-selall" style="padding:5px 12px;font-size:12px;' +
                    'background:rgba(60,80,120,0.5);border:1px solid #779;color:#cde;' +
                    'border-radius:5px;cursor:pointer;font-family:inherit;">全選</button>' +
            '<button id="_admin-wblb-detail-selnone" style="padding:5px 12px;font-size:12px;' +
                    'background:rgba(60,80,120,0.5);border:1px solid #779;color:#cde;' +
                    'border-radius:5px;cursor:pointer;font-family:inherit;">全不選</button>' +
            '<button id="_admin-wblb-detail-selabnormal" style="padding:5px 12px;font-size:12px;' +
                    'background:rgba(120,60,40,0.5);border:1px solid #c87;color:#fcb;' +
                    'border-radius:5px;cursor:pointer;font-family:inherit;">⚠️ 只勾異常(平均每回合&gt;5000)</button>' +
            '<span id="_admin-wblb-detail-selcount" style="margin-left:auto;font-size:12px;color:#ccc;">已選 0 筆</span>' +
          '</div>' +
          // 列表
          '<div id="_admin-wblb-detail-list" style="flex:1;overflow-y:auto;padding:12px 18px;">' +
            _rowsHtml +
          '</div>' +
          // 底部 (★ v3.5.22 修補 — 用 id 包住,讓刪除/確認/刪除中 三狀態可切換)
          '<div id="_admin-wblb-detail-footer" style="padding:12px 18px;border-top:1px solid rgba(180,140,220,0.35);' +
                      'display:flex;gap:10px;align-items:center;">' +
            '<span style="font-size:12px;color:#888;flex:1;">⚠️ 刪除不可逆。</span>' +
            '<button id="_admin-wblb-detail-delete" style="padding:9px 18px;font-size:14px;font-weight:800;' +
                    'background:linear-gradient(135deg,rgba(180,60,60,0.7),rgba(120,30,30,0.9));' +
                    'border:2px solid #ff8888;color:#fff;border-radius:8px;cursor:pointer;' +
                    'font-family:inherit;opacity:0.5;" disabled>' +
              '🗑️ 刪除已勾選 0 筆</button>' +
          '</div>' +
        '</div>';

      document.body.appendChild(_overlay);
      _detailModal = _overlay;

      // 綁定:選擇變化 → 更新計數
      const _listBox = _overlay.querySelector('#_admin-wblb-detail-list');
      const _countEl = _overlay.querySelector('#_admin-wblb-detail-selcount');
      // ★ v3.5.22 修補 — _delBtn 改動態查找(底部 innerHTML 會在二段確認時重設,舊參考會失效)
      const _updateSelCount = function(){
        const _checked = _listBox.querySelectorAll('._wblb-chk:checked');
        const _n = _checked.length;
        _countEl.textContent = '已選 ' + _n + ' 筆';
        // 動態查目前還在 DOM 裡的刪除按鈕(可能在第 1 階段 normal,確認/中間狀態時不存在)
        const _curDelBtn = _overlay.querySelector('#_admin-wblb-detail-delete');
        if(_curDelBtn){
          _curDelBtn.textContent = '🗑️ 刪除已勾選 ' + _n + ' 筆';
          _curDelBtn.disabled = (_n === 0);
          _curDelBtn.style.opacity = (_n === 0) ? '0.5' : '1';
        }
        // 順便高亮已勾選的列
        _listBox.querySelectorAll('._wblb-row').forEach(function(row){
          const chk = row.querySelector('._wblb-chk');
          if(chk && chk.checked){
            row.style.background = 'rgba(120,40,40,0.45)';
            row.style.borderColor = 'rgba(255,120,120,0.55)';
          } else {
            row.style.background = 'rgba(30,25,40,0.6)';
            row.style.borderColor = 'rgba(140,100,180,0.35)';
          }
        });
      };
      // 第一次抓初始的 _delBtn 給後面 _onDeleteClick 註冊用
      const _delBtn = _overlay.querySelector('#_admin-wblb-detail-delete');
      _listBox.addEventListener('change', function(ev){
        if(ev.target && ev.target.classList && ev.target.classList.contains('_wblb-chk')){
          _updateSelCount();
        }
      });

      // ★ v3.5.43 — 「📜 查看傷害來源」按鈕處理(委派到 listBox)
      _listBox.addEventListener('click', function(ev){
        const _btn = ev.target.closest && ev.target.closest('._wblb-sources-btn');
        if(!_btn) return;
        ev.preventDefault();
        ev.stopPropagation();
        const _tk = _btn.getAttribute('data-teamkey');
        const _entry = _list.find(function(x){ return x.teamKey === _tk; });
        if(!_entry){
          alert('找不到對應的紀錄');
          return;
        }
        _showDmgSourcesDialog(_entry);
      });

      // ★ v3.13.3(2026-05-31)— 「🚫 場次標 BUG」按鈕處理(委派到 listBox)
      _listBox.addEventListener('click', function(ev){
        const _btn = ev.target.closest && ev.target.closest('._wblb-tomb-btn');
        if(!_btn) return;
        ev.preventDefault();
        ev.stopPropagation();
        const _tk = _btn.getAttribute('data-teamkey');
        const _entry = _list.find(function(x){ return x.teamKey === _tk; });
        if(!_entry){
          alert('找不到對應的隊伍紀錄');
          return;
        }
        _showTombModal(_entry);
      });

      // 全選/全不選/只勾異常
      _overlay.querySelector('#_admin-wblb-detail-selall').onclick = function(){
        _listBox.querySelectorAll('._wblb-chk').forEach(function(c){ c.checked = true; });
        _updateSelCount();
      };
      _overlay.querySelector('#_admin-wblb-detail-selnone').onclick = function(){
        _listBox.querySelectorAll('._wblb-chk').forEach(function(c){ c.checked = false; });
        _updateSelCount();
      };
      _overlay.querySelector('#_admin-wblb-detail-selabnormal').onclick = function(){
        // ★ v3.13.4(2026-05-31)— 重新算「平均每回合 > 5000」的列並勾起(改用 turns 為分母)
        _list.forEach(function(e){
          let _totalTurns = 0;
          try{
            if(Array.isArray(e.battleHistory) && e.battleHistory.length > 0){
              e.battleHistory.forEach(function(b){
                if(b && !b._deletedAt) _totalTurns += (b.turns || 0);
              });
            } else {
              _totalTurns = ((e.tiebreaker && e.tiebreaker.turns) || 11) * (e.battles || 0);
            }
          }catch(_){}
          const _avgPerTurn = _totalTurns > 0 ? Math.round((e.totalDmg||0) / _totalTurns) : 0;
          if(_avgPerTurn > 5000){
            const _row = _listBox.querySelector('._wblb-row[data-teamkey="' + (e.teamKey||'').replace(/"/g,'\\"') + '"]');
            if(_row){
              const _chk = _row.querySelector('._wblb-chk');
              if(_chk) _chk.checked = true;
            }
          }
        });
        _updateSelCount();
      };

      // 關閉
      const _closeBtn = _overlay.querySelector('#_admin-wblb-detail-close');
      _closeBtn.onclick = _closeDetailModal;

      // ESC 關閉(用 AbortController 統一清理)
      const _modalAbort = new AbortController();
      _detailModal._abortCtrl = _modalAbort;
      document.addEventListener('keydown', function(ev){
        if(ev.key === 'Escape') _closeDetailModal();
      }, { signal: _modalAbort.signal });
      // 點背景關閉
      _overlay.addEventListener('click', function(ev){
        if(ev.target === _overlay) _closeDetailModal();
      }, { signal: _modalAbort.signal });

      // 刪除按鈕(改成 inline 二段確認,避免 z-index 衝突 — v3.5.22 修補)
      //   第 1 階段:顯示底部正常工具列(已勾選 N 筆 / 紅色刪除按鈕)
      //   第 2 階段:按下刪除 → 底部變成「⚠️ 輸入刪除原因 + [確認] [取消]」
      //   ★ v3.12.10(2026-05-30) — 補償機制:刪除排行榜紀錄時,自動對隊伍中每位玩家:
      //     1. 重置今日 wbDailyCount(可重新挑戰 2 場)
      //     2. 寫 players/{uid}.wbAbnormalRemoval(下次登入彈視窗告知原因)
      //   不用 _customConfirm,因為它 z-index 99990 < 明細 modal 99999 → 看起來像沒反應
      const _footerBox = _overlay.querySelector('#_admin-wblb-detail-footer');

      // ★ v3.12.10 — 從 teamKeys 收集所有受影響 uid(去重,因為同一人可開 4 隻 = 1 個 uid 出現 4 次)
      const _collectAffectedUids = function(_teamKeys){
        const _set = new Set();
        for(const _tk of _teamKeys){
          if(!_tk) continue;
          const _parts = String(_tk).split('|');
          for(const _u of _parts){
            if(_u && _u.length > 0) _set.add(_u);
          }
        }
        return Array.from(_set);
      };

      const _doDelete = async function(_teamKeys, _reason){
        // 先算出受影響 uid(刪除前;刪除後 teamKey 就沒了)
        const _affectedUids = _collectAffectedUids(_teamKeys);

        // 切到「刪除中…」狀態
        _footerBox.innerHTML =
          '<span style="font-size:13px;color:#ffcc88;flex:1;">刪除中… 請稍候(共補償 ' + _affectedUids.length + ' 位玩家)</span>';
        try{
          if(!window._wbHpSync || typeof window._wbHpSync.clearLeaderboardEntries !== 'function'){
            throw new Error('_wbHpSync.clearLeaderboardEntries API 不存在(模組未掛載?)');
          }
          // 步驟 1:刪除排行榜紀錄
          const result = await window._wbHpSync.clearLeaderboardEntries(BOSS_ID, _teamKeys);
          if(!result){
            throw new Error('刪除失敗(API 回 null)');
          }

          // 步驟 2:補償受影響玩家(逐個處理,個別失敗不影響整體流程)
          //   ① 寫 wbAbnormalRemoval 通知記錄(玩家登入時會彈視窗)
          //   ② 重置 wbDailyCount(今天可以再打 2 場)
          let _compensatedCount = 0;
          const _failedUids = [];
          if(_affectedUids.length > 0){
            // 動態 import Firestore 寫入 API(走主程式既有路徑,跟其他 GM 工具一致)
            const _hasFb = window._fbDb && window._adminWriteWbCompensation;
            if(!_hasFb){
              console.warn('[排行榜刪除補償] window._adminWriteWbCompensation 未就緒,跳過補償');
            } else {
              for(const _uid of _affectedUids){
                try{
                  await window._adminWriteWbCompensation(_uid, {
                    reason: String(_reason || '').slice(0, 200) || '(GM 未填寫原因)',
                    boss: '維蘇威火山龍王',
                    removedAt: Date.now(),
                  });
                  // 重置 wbDailyCount(已存在的 API)
                  if(typeof window._fbResetWbDailyByUid === 'function'){
                    await window._fbResetWbDailyByUid(_uid);
                  }
                  _compensatedCount++;
                }catch(_eUid){
                  console.warn('[排行榜刪除補償] uid=' + _uid + ' 失敗', _eUid);
                  _failedUids.push(_uid);
                }
              }
            }
          }

          let _okMsg = '✅ 已刪除 ' + (result.removed || 0) + ' 筆排行榜紀錄(剩餘 ' + (result.kept || 0) + ' 筆)';
          if(_compensatedCount > 0){
            _okMsg += '\n💰 已補償 ' + _compensatedCount + ' 位玩家(進場次數已重置 + 登入時會收到通知)';
          }
          if(_failedUids.length > 0){
            _okMsg += '\n⚠️ ' + _failedUids.length + ' 位玩家補償失敗,uid:\n' + _failedUids.join(', ');
            console.warn('[排行榜刪除補償] 失敗的 uid:', _failedUids);
          }
          if(typeof _showSimpleToast === 'function') _showSimpleToast(_okMsg, _failedUids.length > 0 ? 'warn' : 'ok');
          else alert(_okMsg);
          _closeDetailModal();
          _refresh();
        }catch(e){
          console.error('[排行榜指定刪除] 失敗', e);
          if(typeof _showSimpleToast === 'function'){
            _showSimpleToast('❌ 刪除失敗:' + (e && e.message || e), 'err');
          } else {
            alert('刪除失敗:' + (e && e.message || e));
          }
          // 失敗就回到第 1 階段,讓老師重試或關閉
          _renderFooterNormal();
        }
      };

      function _renderFooterNormal(){
        // ★ v3.12.10 — 從 confirm 切回 normal 時把 footer flex 排版還原(避免殘留)
        _footerBox.style.flexDirection = '';
        _footerBox.style.alignItems = '';
        _footerBox.innerHTML =
          '<span style="font-size:12px;color:#888;flex:1;">⚠️ 刪除不可逆,但會自動補償受影響玩家進場次數。</span>' +
          '<button id="_admin-wblb-detail-delete" style="padding:9px 18px;font-size:14px;font-weight:800;' +
                  'background:linear-gradient(135deg,rgba(180,60,60,0.7),rgba(120,30,30,0.9));' +
                  'border:2px solid #ff8888;color:#fff;border-radius:8px;cursor:pointer;' +
                  'font-family:inherit;opacity:0.5;" disabled>' +
            '🗑️ 刪除已勾選 0 筆</button>';
        // 重新抓 delBtn(因為 innerHTML 重寫了)+ 套上點擊處理
        const _newDelBtn = _footerBox.querySelector('#_admin-wblb-detail-delete');
        _newDelBtn.onclick = _onDeleteClick;
        _updateSelCount();  // 重新計算數量、按鈕啟用狀態
      }

      function _renderFooterConfirm(_teamKeys){
        // ★ v3.12.10 — 從 teamKeys 算出受影響玩家數(去重)
        const _affectedUids = _collectAffectedUids(_teamKeys);
        // 改為兩列佈局:第一列輸入原因,第二列按鈕
        _footerBox.style.flexDirection = 'column';
        _footerBox.style.alignItems = 'stretch';
        _footerBox.innerHTML =
          // 第一列:警示文 + 補償人數
          '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">' +
            '<span style="font-size:13px;color:#ff9988;flex:1;font-weight:700;">' +
              '⚠️ 將刪除 ' + _teamKeys.length + ' 筆紀錄(不可復原),補償 <b style="color:#ffd066;">' +
              _affectedUids.length + '</b> 位玩家進場次數' +
            '</span>' +
          '</div>' +
          // 第二列:輸入原因 textarea
          '<div style="margin-bottom:8px;">' +
            '<label style="font-size:12px;color:#bbb;display:block;margin-bottom:4px;">' +
              '📝 刪除原因(玩家會在登入時看到):' +
            '</label>' +
            '<textarea id="_admin-wblb-detail-reason" rows="2" maxlength="200" ' +
                      'placeholder="例如:傷害異常(平均 > 5000)、利用 BUG 刷分、誤觸發等" ' +
                      'style="width:100%;padding:7px 10px;font-size:13px;background:rgba(20,15,30,0.8);' +
                      'border:1.5px solid rgba(180,140,220,0.5);border-radius:6px;color:#eee;' +
                      'font-family:inherit;resize:vertical;box-sizing:border-box;"></textarea>' +
            '<div style="font-size:11px;color:#888;margin-top:3px;">不填則會顯示「(GM 未填寫原因)」給玩家</div>' +
          '</div>' +
          // 第三列:取消 + 確認
          '<div style="display:flex;gap:10px;align-items:center;">' +
            '<span style="flex:1;"></span>' +
            '<button id="_admin-wblb-detail-cancel" style="padding:8px 14px;font-size:13px;' +
                    'background:rgba(80,80,100,0.5);border:1.5px solid #889;color:#ccc;' +
                    'border-radius:6px;cursor:pointer;font-family:inherit;">取消</button>' +
            '<button id="_admin-wblb-detail-confirm" style="padding:9px 18px;font-size:14px;font-weight:800;' +
                    'background:linear-gradient(135deg,rgba(220,60,60,0.95),rgba(160,20,20,1));' +
                    'border:2px solid #ff8888;color:#fff;border-radius:8px;cursor:pointer;' +
                    'font-family:inherit;box-shadow:0 0 12px rgba(255,80,80,0.5);">' +
              '✓ 確認刪除並補償</button>' +
          '</div>';
        _footerBox.querySelector('#_admin-wblb-detail-cancel').onclick = function(){
          // ★ v3.12.10 — 還原 footer 排版
          _footerBox.style.flexDirection = '';
          _footerBox.style.alignItems = '';
          _renderFooterNormal();
        };
        _footerBox.querySelector('#_admin-wblb-detail-confirm').onclick = function(){
          const _reasonEl = _footerBox.querySelector('#_admin-wblb-detail-reason');
          const _reason = _reasonEl ? _reasonEl.value.trim() : '';
          // 還原 footer 排版(進入「刪除中」狀態前)
          _footerBox.style.flexDirection = '';
          _footerBox.style.alignItems = '';
          _doDelete(_teamKeys, _reason);
        };
        // 讓 textarea 自動 focus
        try{ _footerBox.querySelector('#_admin-wblb-detail-reason').focus(); }catch(_){}
      }

      function _onDeleteClick(){
        const _checked = Array.from(_listBox.querySelectorAll('._wblb-chk:checked'));
        const _teamKeys = _checked.map(function(c){
          const row = c.closest('._wblb-row');
          return row && row.getAttribute('data-teamkey');
        }).filter(Boolean);
        if(_teamKeys.length === 0) return;
        // 切換到 inline 確認區
        _renderFooterConfirm(_teamKeys);
      }

      // 首次掛上點擊
      _delBtn.onclick = _onDeleteClick;
    }

    function _closeDetailModal(){
      if(!_detailModal) return;
      try{
        if(_detailModal._abortCtrl) _detailModal._abortCtrl.abort();
      }catch(_){}
      try{ _detailModal.remove(); }catch(_){}
      _detailModal = null;
    }

    // ★ v3.5.22 — 註冊到 _adminPanelState,讓 _closeAdminPanel 可一併關掉
    _adminPanelState.wblbDetailClose = _closeDetailModal;

    if(_detailBtn) _detailBtn.onclick = _openDetailModal;
  })();

  // ════════════════════════════════════════════════════════════════
  // ★ v3.12.17(2026-05-31) — 世界 BOSS 補償券區塊綁定
  // ────────────────────────────────────────────────────────────────
  // 三個功能:
  //   A. 🔍 掃描全校重複戰績 → 列出每組重複,逐筆「刪除 + 恢復進場」
  //   B. 🎫 手動發 1 張補償券給某玩家(隔天用)
  //   C. 📋 查某玩家的補償券歷史
  // ════════════════════════════════════════════════════════════════
  (function _bindBonusSection(){
    const _scanBtn = document.getElementById('_admin-bonus-scan-dup');
    const _scanResultEl = document.getElementById('_admin-bonus-scan-result');
    const _scanStatusEl = document.getElementById('_admin-bonus-scan-status');
    const _grantBtn = document.getElementById('_admin-bonus-grant-btn');
    const _queryBtn = document.getElementById('_admin-bonus-query-btn');
    const _grantStatusEl = document.getElementById('_admin-bonus-grant-status');
    const _grantResultEl = document.getElementById('_admin-bonus-grant-result');
    if(!_scanBtn || !_grantBtn) return;

    const BOSS_ID = 'vesuvius_fire_dragon';  // ★ 對齊 _bindWblbSection 用的 ID
    const DEDUP_WINDOW_MS = 60 * 1000;       // 60 秒內 = 重複

    // ── A. 掃描全校重複戰績 ──
    _scanBtn.onclick = async function(){
      _scanStatusEl.textContent = '⏳ 讀取雲端資料中...';
      _scanResultEl.style.display = 'none';
      _scanResultEl.innerHTML = '';
      try{
        const _fbDb = window._fbDb;
        if(!_fbDb){ throw new Error('Firestore 未就緒'); }
        const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        const _ref = doc(_fbDb, 'stats', 'global');
        const _snap = await getDoc(_ref);
        if(!_snap.exists()){ throw new Error('stats/global 不存在'); }
        const _data = _snap.data() || {};
        const _list = (_data.worldBossLeaderboard || {})[BOSS_ID] || [];
        if(!Array.isArray(_list) || !_list.length){
          _scanStatusEl.textContent = '✅ 排行榜為空,無重複可掃';
          return;
        }
        _scanStatusEl.textContent = '⏳ 分析 ' + _list.length + ' 個隊伍紀錄...';

        // 找出每隊的重複組:battleHistory 內「時間差<60秒 + 傷害一樣」
        const _dupRows = [];
        _list.forEach(function(entry, _entryIdx){
          if(!entry || !Array.isArray(entry.battleHistory)) return;
          const _bh = entry.battleHistory;
          // 排序:由新到舊
          const _sorted = _bh.slice().sort(function(a,b){ return (b.at || 0) - (a.at || 0); });
          // 兩兩比對找重複(只比相鄰兩個就好,因為相同時間應該連續)
          for(let i = 0; i < _sorted.length - 1; i++){
            const _a = _sorted[i];
            const _b = _sorted[i + 1];
            if(!_a || !_b) continue;
            if(_a.dmg === _b.dmg
               && Math.abs((_a.at || 0) - (_b.at || 0)) < DEDUP_WINDOW_MS){
              _dupRows.push({
                entryIdx: _entryIdx,
                teamKey: entry.teamKey,
                teamNames: entry.teamNames || [],
                teamEmails: entry.teamEmails || [],
                recordA: _a,
                recordB: _b,
              });
            }
          }
        });

        if(!_dupRows.length){
          _scanStatusEl.textContent = '✅ 掃描完成,沒有發現重複戰績';
          return;
        }

        _scanStatusEl.textContent = '⚠ 發現 ' + _dupRows.length + ' 組重複戰績';
        _scanResultEl.style.display = 'block';

        // 渲染每組重複的卡片
        let _html = '<div style="padding:8px;">';
        _dupRows.forEach(function(row, _rowIdx){
          const _displayName = (row.teamNames[0] || '?');
          const _displayEmail = (row.teamEmails[0] || '');
          const _atA = new Date(row.recordA.at || 0).toLocaleString('zh-TW', { hour12: false });
          const _atB = new Date(row.recordB.at || 0).toLocaleString('zh-TW', { hour12: false });
          const _tbA = row.recordA.tb || 0;
          const _tbB = row.recordB.tb || 0;
          _html += '<div style="background:rgba(60,30,30,0.45);border:1.5px solid rgba(255,120,120,0.55);'
                + 'border-radius:8px;padding:10px;margin-bottom:10px;" data-row-idx="' + _rowIdx + '">'
                + '<div style="font-weight:700;color:#ffaa66;margin-bottom:4px;">'
                +   '🔁 ' + _displayName + ' (' + _displayEmail + ')'
                + '</div>'
                + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px;">'
                +   '<div style="background:rgba(0,0,0,0.4);padding:8px;border-radius:5px;border-left:3px solid #88cc88;">'
                +     '<div style="color:#88cc88;font-weight:700;margin-bottom:3px;">A 筆(較新)</div>'
                +     '<div>時間: ' + _atA + '</div>'
                +     '<div>傷害: ' + row.recordA.dmg + '</div>'
                +     '<div>回合: ' + row.recordA.turns + ', 答題: ' + row.recordA.qc + ', 聯手: ' + _tbA + '</div>'
                +     '<button class="_bonus-del-btn" data-row-idx="' + _rowIdx + '" data-side="A" '
                +       'style="margin-top:6px;width:100%;padding:6px;font-size:11px;font-weight:700;'
                +       'background:#cc4444;color:#fff;border:none;border-radius:4px;cursor:pointer;">'
                +       '🗑️ 刪除 A 筆 + 恢復進場 -1'
                +     '</button>'
                +   '</div>'
                +   '<div style="background:rgba(0,0,0,0.4);padding:8px;border-radius:5px;border-left:3px solid #88aacc;">'
                +     '<div style="color:#88aacc;font-weight:700;margin-bottom:3px;">B 筆(較舊)</div>'
                +     '<div>時間: ' + _atB + '</div>'
                +     '<div>傷害: ' + row.recordB.dmg + '</div>'
                +     '<div>回合: ' + row.recordB.turns + ', 答題: ' + row.recordB.qc + ', 聯手: ' + _tbB + '</div>'
                +     '<button class="_bonus-del-btn" data-row-idx="' + _rowIdx + '" data-side="B" '
                +       'style="margin-top:6px;width:100%;padding:6px;font-size:11px;font-weight:700;'
                +       'background:#cc4444;color:#fff;border:none;border-radius:4px;cursor:pointer;">'
                +       '🗑️ 刪除 B 筆 + 恢復進場 -1'
                +     '</button>'
                +   '</div>'
                + '</div>'
                + '<div style="font-size:11px;color:#ffaa88;margin-top:6px;">'
                +   '💡 建議:保留聯手爆發次數高的那筆(資料較完整),刪掉較低那筆。'
                + '</div>'
                + '</div>';
        });
        _html += '</div>';
        _scanResultEl.innerHTML = _html;

        // 綁定每個刪除按鈕
        _scanResultEl.querySelectorAll('._bonus-del-btn').forEach(function(_btn){
          _btn.onclick = async function(){
            const _rowIdx = parseInt(_btn.getAttribute('data-row-idx'), 10);
            const _side = _btn.getAttribute('data-side');
            const _row = _dupRows[_rowIdx];
            if(!_row){ alert('找不到對應紀錄'); return; }
            const _toDelete = (_side === 'A') ? _row.recordA : _row.recordB;
            const _displayName = _row.teamNames[0] || '?';
            const _email = _row.teamEmails[0] || '';
            if(!confirm('確定刪除這筆嗎?\n\n玩家:' + _displayName + ' (' + _email + ')\n'
                      + '時間:' + new Date(_toDelete.at).toLocaleString('zh-TW') + '\n'
                      + '傷害:' + _toDelete.dmg + '\n\n同時會把該玩家當天 wbDailyCount -1(恢復 1 次進場)')){
              return;
            }

            _btn.disabled = true;
            _btn.textContent = '⏳ 處理中...';

            try{
              const { doc, getDoc, setDoc, runTransaction } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
              // 1. 從 stats/global 移除該筆 battleHistory
              const _statsRef = doc(_fbDb, 'stats', 'global');
              await runTransaction(_fbDb, async function(tx){
                const _s = await tx.get(_statsRef);
                if(!_s.exists()) throw new Error('stats/global 不存在');
                const _d = _s.data() || {};
                const _lb = _d.worldBossLeaderboard || {};
                const _l = Array.isArray(_lb[BOSS_ID]) ? _lb[BOSS_ID].slice() : [];
                const _ei = _l.findIndex(function(e){ return e && e.teamKey === _row.teamKey; });
                if(_ei < 0) throw new Error('找不到隊伍紀錄');
                const _entry = Object.assign({}, _l[_ei]);
                _entry.battleHistory = (_entry.battleHistory || []).filter(function(b){
                  return !(b && b.at === _toDelete.at && b.dmg === _toDelete.dmg && b.tb === _toDelete.tb);
                });
                // battles 也 -1
                _entry.battles = Math.max(0, (_entry.battles || 1) - 1);
                // 該場若是 isBonus 也要把 bonusBattleCount -1
                if(_toDelete._isBonus){
                  _entry.bonusBattleCount = Math.max(0, (_entry.bonusBattleCount || 1) - 1);
                }
                // totalDmg 也要 -1(維持資料一致)
                _entry.totalDmg = Math.max(0, (_entry.totalDmg || 0) - (_toDelete.dmg || 0));
                _l[_ei] = _entry;
                _lb[BOSS_ID] = _l;
                tx.set(_statsRef, { worldBossLeaderboard: _lb }, { merge: true });
              });

              // 2. 對「擁有這個 teamKey 的所有 uid」呼叫 _decreaseCountByUid
              //    (teamKey = 4 個 uid 排序 join,我們從 teamKey 解析回 uid)
              //    對單人開房,4 個都是同 uid,所以只需要呼叫一次
              const _uids = (_row.teamKey || '').split('|').filter(Boolean);
              const _uniqueUids = Array.from(new Set(_uids));
              const _decreaseResults = [];
              for(const _uid of _uniqueUids){
                if(typeof window._wbDailyLimit._decreaseCountByUid === 'function'){
                  const _r = await window._wbDailyLimit._decreaseCountByUid(_uid, '掃描重複戰績,刪除錯誤計次');
                  _decreaseResults.push({ uid: _uid, ok: _r && _r.ok, old: _r && _r.oldCount, new: _r && _r.newCount });
                }
              }

              _btn.textContent = '✅ 已刪除 + 恢復進場';
              _btn.style.background = '#448844';
              // 更新狀態列
              const _decStr = _decreaseResults.map(function(r){
                return r.uid.slice(0,8) + '(' + r.old + '→' + r.new + ')';
              }).join(', ');
              console.log('[v3.12.17 補償工具] 刪除完成 +' + _uniqueUids.length + ' 位玩家恢復進場:', _decStr);
            } catch(e){
              console.error('[v3.12.17 補償工具] 刪除失敗', e);
              _btn.disabled = false;
              _btn.textContent = '❌ 失敗,點此重試';
              _btn.style.background = '#cc4444';
              alert('❌ 刪除失敗:' + (e && e.message));
            }
          };
        });

      }catch(e){
        console.error('[v3.12.17 補償工具] 掃描失敗', e);
        _scanStatusEl.textContent = '❌ 掃描失敗:' + (e && e.message);
      }
    };

    // ── B. 手動發補償券 ──
    _grantBtn.onclick = async function(){
      const _email = (document.getElementById('_admin-bonus-grant-email').value || '').trim().toLowerCase();
      const _uidIn = (document.getElementById('_admin-bonus-grant-uid').value || '').trim();
      const _reason = (document.getElementById('_admin-bonus-grant-reason').value || '').trim();
      const _today = document.getElementById('_admin-bonus-grant-today').checked;

      if(!_email && !_uidIn){
        alert('請輸入 email 或 uid'); return;
      }
      if(!_reason){
        if(!confirm('未填寫原因確定要發?(建議填寫,未來查紀錄會比較清楚)')) return;
      }

      _grantStatusEl.textContent = '⏳ 處理中...';
      _grantResultEl.style.display = 'none';

      try{
        let _uid = _uidIn;
        if(!_uid && _email){
          // 用 email 找 uid:呼叫主程式的 _fbAdminFindPlayerByEmail
          if(typeof window._fbAdminFindPlayerByEmail !== 'function'){
            throw new Error('_fbAdminFindPlayerByEmail 未就緒,請改填 uid');
          }
          const _p = await window._fbAdminFindPlayerByEmail(_email);
          if(!_p || !_p.uid) throw new Error('找不到該玩家 (email=' + _email + ')');
          _uid = _p.uid;
        }
        if(!_uid) throw new Error('未找到 uid');

        // 算生效日字串
        let _grantedDateStr = null;
        if(_today){
          // 今天立即生效:用 _wbDailyLimit._todayStr
          _grantedDateStr = window._wbDailyLimit._todayStr();
        }
        // 不傳就是預設「明天」

        const _r = await window._wbDailyLimit.grantBonusByUid({
          uid: _uid,
          reason: _reason,
          grantedDateStr: _grantedDateStr,
        });

        if(_r && _r.ok){
          _grantStatusEl.textContent = '✅ 已發放 1 張(總共 ' + _r.grantsCount + ' 張)';
          _grantResultEl.style.display = 'block';
          _grantResultEl.innerHTML = '<div style="padding:6px;color:#aaffaa;">'
            + '✅ 發放成功!<br>'
            + 'uid: <code>' + _uid + '</code><br>'
            + '生效日: <b>' + _r.grantedDateStr + '</b>(' + (_today ? '今天' : '明天') + '起可用)<br>'
            + '玩家總共有 <b>' + _r.grantsCount + '</b> 張補償券<br>'
            + '原因: ' + (_reason || '(未填寫)')
            + '</div>';
          console.log('[v3.12.17 補償券] 發放成功 uid=' + _uid + ', date=' + _r.grantedDateStr);
        }else{
          throw new Error(_r && _r.reason || '未知錯誤');
        }
      }catch(e){
        console.error('[v3.12.17 補償券] 發放失敗', e);
        _grantStatusEl.textContent = '❌ 失敗:' + (e && e.message);
      }
    };

    // ── C. 查補償券歷史 ──
    _queryBtn.onclick = async function(){
      const _email = (document.getElementById('_admin-bonus-grant-email').value || '').trim().toLowerCase();
      const _uidIn = (document.getElementById('_admin-bonus-grant-uid').value || '').trim();
      if(!_email && !_uidIn){
        alert('請輸入 email 或 uid'); return;
      }

      _grantStatusEl.textContent = '⏳ 讀取中...';
      try{
        let _uid = _uidIn;
        if(!_uid && _email){
          const _p = await window._fbAdminFindPlayerByEmail(_email);
          if(!_p || !_p.uid) throw new Error('找不到該玩家');
          _uid = _p.uid;
        }
        const _grants = await window._wbDailyLimit.getBonusByUid(_uid);
        _grantStatusEl.textContent = '';
        _grantResultEl.style.display = 'block';
        if(!_grants || !_grants.length){
          _grantResultEl.innerHTML = '<div style="padding:6px;color:#ccc;">該玩家無補償券紀錄(uid=' + _uid + ')</div>';
          return;
        }
        let _html = '<div style="padding:6px;color:#ddccaa;">'
          + '<b>uid:</b> <code>' + _uid + '</code><br>'
          + '<b>總共:</b> ' + _grants.length + ' 張<br>'
          + '<b>未用:</b> ' + _grants.filter(function(g){ return g && !g.usedAt; }).length + ' 張<br><br>'
          + '<div style="max-height:240px;overflow-y:auto;">';
        _grants.forEach(function(g, _i){
          const _isUsed = !!g.usedAt;
          _html += '<div style="background:' + (_isUsed ? 'rgba(60,40,40,0.4)' : 'rgba(40,60,40,0.4)')
                + ';padding:6px 8px;margin-bottom:4px;border-radius:4px;border-left:3px solid '
                + (_isUsed ? '#aa4444' : '#44aa44') + ';">'
                + '<div style="font-weight:700;color:' + (_isUsed ? '#ffaaaa' : '#aaffaa') + ';">'
                +   '#' + (_i+1) + ' ' + (_isUsed ? '✅ 已使用' : '🎫 未使用')
                + '</div>'
                + '<div style="font-size:11px;color:#bbb;">'
                +   '發放日:' + (g.grantedDateStr || '?') + ' · '
                +   '發放時間:' + (g.grantedAt ? new Date(g.grantedAt).toLocaleString('zh-TW',{hour12:false}) : '?')
                + '</div>'
                + (_isUsed
                    ? '<div style="font-size:11px;color:#bbb;">使用日:' + (g.usedDateStr || '?')
                       + ' · 使用時間:' + new Date(g.usedAt).toLocaleString('zh-TW',{hour12:false}) + '</div>'
                    : '')
                + '<div style="font-size:11px;color:#aaa;">原因:' + (g.reason || '(未填)') + '</div>'
                + '</div>';
        });
        _html += '</div></div>';
        _grantResultEl.innerHTML = _html;
      }catch(e){
        _grantStatusEl.textContent = '❌ 失敗:' + (e && e.message);
        console.error('[v3.12.17 補償券] 查詢失敗', e);
      }
    };

    console.log('[v3.12.17 補償券] ✅ 補償券區塊綁定完成');
  })();

  // ════════════════════════════════════════════════════════════════
  // ★ v3.13.7(2026-05-31) — 世界 BOSS 挑戰入場券區塊綁定
  // ────────────────────────────────────────────────────────────────
  // 三個功能:
  //   A. 🎟️ 手動補發入場券(GM 用,當玩家因 BUG 沒拿到券時)
  //   B. 📋 查某玩家目前持有的入場券數
  //   C. 🧹 清空某玩家的入場券(處理異常時用,謹慎)
  //
  // 重要前置:_wbDailyLimit.grantTicketByUid / getTicketByUid / clearTicketByUid
  //          API 在 index.html line ~11590 起定義
  // ════════════════════════════════════════════════════════════════
  (function _bindTicketSection(){
    const _grantBtn  = document.getElementById('_admin-ticket-grant-btn');
    const _queryBtn  = document.getElementById('_admin-ticket-query-btn');
    const _clearBtn  = document.getElementById('_admin-ticket-clear-btn');
    const _statusEl  = document.getElementById('_admin-ticket-status');
    const _resultEl  = document.getElementById('_admin-ticket-result');
    const _emailIn   = document.getElementById('_admin-ticket-grant-email');
    const _uidIn     = document.getElementById('_admin-ticket-grant-uid');
    const _nIn       = document.getElementById('_admin-ticket-grant-n');
    if(!_grantBtn || !_queryBtn || !_clearBtn) return;

    // 從 email 找 uid
    // ★ v3.13.24(2026-06-02) — 對齊補償券的成熟做法,改用 _fbAdminFindPlayerByEmail(鐵律 1.157)
    //   原本 v3.13.7 寫了「先查 stats/global.userIndex,fallback _adminResolveUidByEmail」,
    //   但兩個 fallback 在主程式都不存在/沒索引 → 老師在左邊 email 欄位永遠拿到「找不到對應 uid」,
    //   被迫把 email 填到右邊 uid 欄位試;右邊直接當 uid 用,查 players/{email} 不存在回 0/5 不報錯,
    //   形成「右邊填 email 才查得到」的錯覺(其實查的是錯的東西)。
    async function _resolveUid(){
      const _uid = (_uidIn.value || '').trim();
      const _email = (_emailIn.value || '').trim().toLowerCase();
      if(_uid) return _uid;
      if(!_email){
        throw new Error('請輸入玩家 email 或 uid');
      }
      if(typeof window._fbAdminFindPlayerByEmail !== 'function'){
        throw new Error('_fbAdminFindPlayerByEmail 未就緒,請改填 uid');
      }
      const _p = await window._fbAdminFindPlayerByEmail(_email);
      if(!_p || !_p.uid){
        throw new Error('找不到該玩家 (email=' + _email + '),請改填 uid');
      }
      return _p.uid;
    }

    function _showResult(html, color){
      _resultEl.style.display = 'block';
      _resultEl.style.color = color || '#aaffcc';
      _resultEl.innerHTML = html;
    }

    // ── A. 補發 ──
    _grantBtn.onclick = async function(){
      _statusEl.textContent = '⏳ 處理中...';
      _resultEl.style.display = 'none';
      try{
        if(!window._wbDailyLimit || typeof window._wbDailyLimit.grantTicketByUid !== 'function'){
          throw new Error('_wbDailyLimit.grantTicketByUid API 未掛載');
        }
        const _uid = await _resolveUid();
        const _n = Math.max(1, Math.min(5, parseInt(_nIn.value, 10) || 1));
        const _r = await window._wbDailyLimit.grantTicketByUid(_uid, _n);
        if(_r && _r.ok){
          _statusEl.textContent = '✅ 完成';
          _showResult(
            '🎟️ <b>補發成功</b><br>' +
            '・玩家 uid:<code>' + _uid + '</code><br>' +
            '・申請補發:' + _n + ' 張<br>' +
            '・實際入帳:<b style="color:#88ffcc;">' + _r.granted + '</b> 張(夾在 5 張上限內)<br>' +
            '・補發後持有:<b style="color:#ffe066;">' + _r.total + ' / 5</b>',
            '#aaffcc'
          );
        } else {
          const _reason = (_r && _r.reason) || 'unknown';
          throw new Error('補發失敗:' + _reason);
        }
      }catch(e){
        _statusEl.textContent = '❌ 失敗:' + (e && e.message);
        _showResult('❌ ' + (e && e.message), '#ffaaaa');
        console.error('[v3.13.7 入場券] 補發失敗', e);
      }
    };

    // ── B. 查持有數 ──
    _queryBtn.onclick = async function(){
      _statusEl.textContent = '⏳ 查詢中...';
      _resultEl.style.display = 'none';
      try{
        if(!window._wbDailyLimit || typeof window._wbDailyLimit.getTicketByUid !== 'function'){
          throw new Error('_wbDailyLimit.getTicketByUid API 未掛載');
        }
        const _uid = await _resolveUid();
        const _n = await window._wbDailyLimit.getTicketByUid(_uid);
        _statusEl.textContent = '✅ 完成';
        _showResult(
          '📋 <b>持有查詢</b><br>' +
          '・玩家 uid:<code>' + _uid + '</code><br>' +
          '・目前持有:<b style="font-size:18px;color:' + (_n >= 1 ? '#88ffcc' : '#aaaacc') + ';">' +
            _n + ' / 5</b> 張' +
          (_n === 0 ? '<br><span style="color:#aaa;font-size:11px;">(無券。換日登入若昨日有剩場次會自動補發)</span>' : ''),
          '#aaffcc'
        );
      }catch(e){
        _statusEl.textContent = '❌ 失敗:' + (e && e.message);
        _showResult('❌ ' + (e && e.message), '#ffaaaa');
        console.error('[v3.13.7 入場券] 查詢失敗', e);
      }
    };

    // ── C. 清空(慎用)──
    _clearBtn.onclick = async function(){
      _statusEl.textContent = '⏳ 等待確認...';
      _resultEl.style.display = 'none';
      try{
        if(!window._wbDailyLimit || typeof window._wbDailyLimit.clearTicketByUid !== 'function'){
          throw new Error('_wbDailyLimit.clearTicketByUid API 未掛載');
        }
        const _uid = await _resolveUid();
        const _ok = window.confirm('⚠️ 確定要清空 uid「' + _uid + '」的所有入場券?\n\n此操作不可逆,且不會自動退還對應的「昨日剩餘場次」。');
        if(!_ok){
          _statusEl.textContent = '⏸ 已取消';
          return;
        }
        const _r = await window._wbDailyLimit.clearTicketByUid(_uid);
        if(_r && _r.ok){
          _statusEl.textContent = '✅ 已清空';
          _showResult(
            '🧹 <b>清空完成</b><br>' +
            '・玩家 uid:<code>' + _uid + '</code><br>' +
            '・已扣除:<b style="color:#ffaaaa;">' + (_r.removed || 0) + '</b> 張<br>' +
            '・目前持有:<b>0 / 5</b>',
            '#ffccaa'
          );
        } else {
          const _reason = (_r && _r.reason) || 'unknown';
          throw new Error('清空失敗:' + _reason);
        }
      }catch(e){
        _statusEl.textContent = '❌ 失敗:' + (e && e.message);
        _showResult('❌ ' + (e && e.message), '#ffaaaa');
        console.error('[v3.13.7 入場券] 清空失敗', e);
      }
    };

    console.log('[v3.13.7 入場券] ✅ 入場券區塊綁定完成');
  })();

  // ════════════════════════════════════════════════════════════════
  // ★ v3.5.67(2026-05-23) — 小博士獎勵補發區段綁定
  //
  //   提供功能:
  //     1. 顯示本週/上週排名概況
  //     2. 查看本週 / 上週前 10 名(modal)
  //     3. 手動觸發 trySettleLastWeek(繞過自動結算 / Rules 失敗 fallback)
  //     4. 手動補發單一玩家獎勵(指定 uid + 排名)
  //
  //   注意:寫入別人的 players/{uid}.weeklyQuizPendingAward 需要 Firestore Rules 允許
  //         若 rules 沒設,console 會 permission-denied,
  //         此時只能用「直接 setDoc + merge」方式 — 但仍會被擋。
  //         真正解法:老師到 Firebase Console 加 rules(已在 v3.5.67 註解詳述)
  // ════════════════════════════════════════════════════════════════
  (function _bindWqSection(){
    const _infoEl = document.getElementById('_admin-wq-info');
    const _refreshBtn = document.getElementById('_admin-wq-refresh');
    const _viewThisBtn = document.getElementById('_admin-wq-view-this');
    const _viewLastBtn = document.getElementById('_admin-wq-view-last');
    const _manualSettleBtn = document.getElementById('_admin-wq-manual-settle');
    const _giveBtn = document.getElementById('_admin-wq-give');
    const _uidInput = document.getElementById('_admin-wq-uid');
    const _rankSelect = document.getElementById('_admin-wq-rank');
    if(!_infoEl || !_manualSettleBtn) return;

    // 安全 HTML escape
    const _esc = function(s){
      return String(s == null ? '' : s)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    };

    // ★ v3.5.68(2026-05-24) — 老師需求:管理員後台一律顯示完整學生資訊
    //   走 _adminLabel(自動帶 adminShowReal:true),底層 _getAdminPlayerLabel 不做真名替換
    //     ① email 在名冊 + 有暱稱(真名或合法) → 「5324蔣同學(王小明)」(底層全顯示)
    //     ② email 在名冊 + 無暱稱 → 「5324蔣同學」
    //     ③ 沒名冊 + 有暱稱 → 「暱稱」原樣
    //     ④ 都沒 → 「玩家+uid 前 4 碼」
    //   老師會自行判斷截圖前要不要馬賽克
    const _formatName = function(entry){
      try{
        const _email = (entry.email || '').toLowerCase().trim();
        const _disp = (entry.name || '').trim();
        // 優先用 _adminLabel(走 _getAdminPlayerLabel + adminShowReal:true)
        if(_email || _disp){
          const _label = _adminLabel(_email, _disp);
          if(_label && _label !== '(無)') return _label;
        }
        if(entry.uid) return '玩家' + String(entry.uid).slice(0, 4);
        return '玩家';
      }catch(e){
        return entry.name || '玩家';
      }
    };

    // ── 渲染概況 ──
    function _renderInfo(){
      try{
        if(!window._weeklyQuiz){
          _infoEl.innerHTML = '<span style="color:#ff8888;">⚠️ _weeklyQuiz 模組未掛載</span>';
          return;
        }
        const _thisKey = window._weeklyQuiz.getWeekKey();
        const _lastKey = window._weeklyQuiz.getLastWeekKey();
        const _range = window._weeklyQuiz.getWeekRange();
        const _thisTop = window._weeklyQuiz.getTopN(50) || [];
        const _failedInfo = window._weeklyQuizSettlementFailed;

        // 從 _cachedGlobalStats 看上週是否已結算
        const _gs = window._cachedGlobalStats || {};
        const _settlement = (_gs.weeklyQuizSettlement && _gs.weeklyQuizSettlement[_lastKey]) || null;

        let _settleStatus = '';
        if(_settlement){
          if(_settlement.empty){
            _settleStatus = '<span style="color:#888;">上週無人上榜(已標記)</span>';
          } else {
            const _awardCount = _settlement.awards ? Object.keys(_settlement.awards).length : 0;
            const _settledAt = _settlement.settledAt
              ? new Date(_settlement.settledAt).toLocaleString('zh-TW')
              : '?';
            _settleStatus = '<span style="color:#88ff99;">✅ 已結算('
              + _awardCount + ' 人 / ' + _settledAt + ')</span>';
          }
        } else {
          _settleStatus = '<span style="color:#ffcc66;">⚠ 上週尚未結算</span>';
        }

        let _failedBanner = '';
        if(_failedInfo && _failedInfo.failedUids && _failedInfo.failedUids.length > 0){
          _failedBanner = '<div style="margin-top:6px;padding:6px 10px;background:rgba(160,40,40,0.3);'
            + 'border:1px solid #ff8866;border-radius:6px;color:#ffaa88;">'
            + '⚠ 自動結算有 ' + _failedInfo.failedUids.length + ' 位玩家發獎失敗('
            + _failedInfo.weekKey + '),請手動補發或設定 Firestore Rules</div>';
        }

        const _fmtDate = function(d){
          if(!d) return '?';
          const m = d.getMonth()+1, day = d.getDate(), h = d.getHours(), mm = d.getMinutes();
          return m + '/' + day + ' ' + (h<10?'0':'') + h + ':' + (mm<10?'0':'') + mm;
        };

        _infoEl.innerHTML =
          '🗓 <b style="color:#88ddff;">本週 ' + _thisKey + '</b>('
          + _fmtDate(_range.start) + ' ~ ' + _fmtDate(_range.end) + ')<br>'
          + '📊 目前上榜玩家:<b style="color:#aaffcc;">' + _thisTop.length + ' 人</b>'
          + (_thisTop.length > 0
              ? '   🥇 領先:<b style="color:#ffe066;">' + _esc(_formatName(_thisTop[0])) + '</b>('
                + _thisTop[0].correct + ' 題)' : '') + '<br>'
          + '📜 上週(' + _lastKey + ') 結算狀態:' + _settleStatus
          + _failedBanner;
      }catch(e){
        _infoEl.innerHTML = '<span style="color:#ff8888;">⚠️ 讀取失敗:' + (e && e.message || e) + '</span>';
      }
    }

    _renderInfo();
    // 訂閱即時同步(weeklyQuizSynced 在 _setupWeeklyQuizV2 內廣播)
    const _wqAbortCtrl = new AbortController();
    _adminPanelState.wqAbort = _wqAbortCtrl;
    document.addEventListener('weeklyQuizSynced', function(){ _renderInfo(); },
                              { signal: _wqAbortCtrl.signal });

    if(_refreshBtn) _refreshBtn.onclick = _renderInfo;

    // ── 查看本週/上週前 10 名 modal ──
    function _showWeekDetail(weekKey, title){
      // 清除舊 modal
      if(_adminPanelState.wqDetailClose){
        try{ _adminPanelState.wqDetailClose(); }catch(_){}
      }

      // 從 _cachedGlobalStats 讀指定週 key 的資料
      const _gs = window._cachedGlobalStats || {};
      const _wq = _gs.weeklyQuiz || {};
      const _weekMap = _wq[weekKey] || {};
      const _list = [];
      for(const _uid in _weekMap){
        const _e = _weekMap[_uid];
        if(_e && (_e.correct || 0) > 0){
          _list.push({ uid: _uid, name: _e.name||'', email: _e.email||'', correct: _e.correct||0, lastAt: _e.lastAt||0 });
        }
      }
      _list.sort(function(a,b){
        if(a.correct !== b.correct) return b.correct - a.correct;
        return (a.lastAt||0) - (b.lastAt||0);
      });

      // 看是否已結算(僅上週需要)
      const _settlement = (_gs.weeklyQuizSettlement && _gs.weeklyQuizSettlement[weekKey]) || null;

      let _rows = '';
      if(_list.length === 0){
        _rows = '<div style="padding:30px;text-align:center;color:#888;font-style:italic;">本週還沒有人答對題目</div>';
      } else {
        _list.slice(0, 30).forEach(function(e, i){
          const rank = i + 1;
          const isTop10 = rank <= 10;
          const settled = _settlement && _settlement.awards && _settlement.awards[e.uid];
          let icon = '#' + rank;
          if(rank === 1) icon = '🥇';
          else if(rank === 2) icon = '🥈';
          else if(rank === 3) icon = '🥉';

          let award = '';
          if(rank === 1) award = '50000幣+10水晶+10書';
          else if(rank <= 5) award = '35000幣+6水晶+6書';
          else if(rank <= 10) award = '20000幣+3水晶+3書';

          _rows += '<div style="display:grid;grid-template-columns:50px 1fr 80px 180px 38px;align-items:center;gap:10px;padding:6px 10px;background:rgba(0,0,0,' + (i%2===0?'0.25':'0.4') + ');border-radius:6px;font-size:13px;">'
            + '<div style="font-weight:900;color:' + (rank<=3?'#ffe066':'#aaa') + ';">' + icon + '</div>'
            + '<div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#fff;font-weight:700;">'
            +   _esc(_formatName(e))
            +   '<br><span style="font-size:11px;color:#888;font-weight:400;font-family:monospace;">'
            +   _esc(e.uid.slice(0,16)) + '...</span></div>'
            + '<div style="text-align:right;font-weight:800;color:#88ff99;">' + e.correct + ' 題</div>'
            + '<div style="font-size:11px;color:' + (settled ? '#88ff99' : (isTop10 ? '#ffcc66' : '#666')) + ';text-align:right;">'
            +   (isTop10
                  ? (settled
                      ? '✅ 已結算 ' + (settled.claimedAt ? '(已領)' : '(未領)')
                      : '⚠ ' + award + ' 待發')
                  : '(未進前 10)')
            + '</div>'
            // ★ v3.6.10 — 每列加垃圾桶按鈕(用 data-* 帶 uid,讓後續 bind onclick)
            + '<button class="_admin-wq-row-del" data-uid="' + _esc(e.uid)
            +   '" data-name="' + _esc(_formatName(e))
            +   '" data-week="' + _esc(weekKey)
            +   '" title="刪除此玩家排名" '
            +   'style="padding:4px 0;font-size:15px;background:rgba(80,20,20,0.4);'
            +   'border:1.5px solid rgba(255,100,100,0.5);color:#ff8888;border-radius:5px;'
            +   'cursor:pointer;font-family:inherit;line-height:1;width:32px;">🗑️</button>'
            + '</div>';
        });
      }

      const _modal = document.createElement('div');
      // ★ v3.11.27 — z-index 從 25000 → 100000。修「點查看本週前10名沒反應」:
      //   GM 後台面板 _admin-stats-panel 是 z-index:99999,modal 25000 會開在後台底下被蓋住看不到。
      _modal.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(0,0,16,0.82);'
        + 'display:flex;align-items:center;justify-content:center;padding:20px;';
      _modal.innerHTML =
        '<div style="background:linear-gradient(160deg,#1a1232,#0a0815);border:2.5px solid rgba(180,120,255,0.65);'
        + 'border-radius:14px;padding:20px 24px;max-width:min(96vw,700px);width:100%;max-height:90vh;'
        + 'display:flex;flex-direction:column;">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">'
        + '<div style="font-size:22px;font-weight:900;color:#ffe066;">' + _esc(title) + '</div>'
        + '<button id="_wq-modal-close" style="padding:6px 14px;font-size:14px;background:rgba(60,10,10,0.4);'
        +   'border:1.5px solid #e84040;color:#e84040;border-radius:6px;cursor:pointer;">✕ 關閉</button>'
        + '</div>'
        + '<div style="font-size:13px;color:#aaa;margin-bottom:10px;">'
        +   '週 key:<code style="color:#88ccff;">' + _esc(weekKey) + '</code> · 共 ' + _list.length + ' 人上榜'
        + '</div>'
        + '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;display:flex;flex-direction:column;gap:4px;">'
        + _rows + '</div>'
        + '</div>';
      _modal.addEventListener('click', function(e){
        if(e.target === _modal) _closeModal();
      });
      document.body.appendChild(_modal);

      function _closeModal(){
        try{ _modal.remove(); }catch(_){}
        _adminPanelState.wqDetailClose = null;
      }
      document.getElementById('_wq-modal-close').onclick = _closeModal;
      _adminPanelState.wqDetailClose = _closeModal;

      // ★ v3.6.10(2026-05-24) — 綁定每列垃圾桶按鈕
      try{
        _modal.querySelectorAll('._admin-wq-row-del').forEach(function(btn){
          btn.onclick = function(){
            const _uid = btn.getAttribute('data-uid') || '';
            const _name = btn.getAttribute('data-name') || _uid.slice(0, 8);
            const _wk = btn.getAttribute('data-week') || weekKey;
            if(!_uid) return;
            _doDeleteWqEntry(_wk, _uid, _name, function _afterDel(){
              // 刪除成功後關掉本 modal,讓 _renderInfo 看到最新數字
              try{ _closeModal(); }catch(_){}
              try{ _renderInfo(); }catch(_){}
            });
          };
        });
      }catch(_){}
    }

    if(_viewThisBtn) _viewThisBtn.onclick = function(){
      const _thisKey = window._weeklyQuiz.getWeekKey();
      _showWeekDetail(_thisKey, '👀 本週前 30 名');
    };
    if(_viewLastBtn) _viewLastBtn.onclick = function(){
      const _lastKey = window._weeklyQuiz.getLastWeekKey();
      _showWeekDetail(_lastKey, '📜 上週前 30 名 + 結算狀態');
    };

    // ── 手動結算上週 ──
    if(_manualSettleBtn) _manualSettleBtn.onclick = async function(){
      if(!window._weeklyQuiz || typeof window._weeklyQuiz.trySettleLastWeek !== 'function'){
        try{ _showSimpleToast('❌ _weeklyQuiz.trySettleLastWeek 不可用', 3000); }catch(_){ alert('❌ _weeklyQuiz.trySettleLastWeek 不可用'); }
        return;
      }
      const _confirmMsg = '🎁 確定要手動結算上週小博士排行榜嗎?<br><br>'
        + '系統會:<br>'
        + '① 用 transaction 搶結算鎖(若已結算過會跳過)<br>'
        + '② 把獎勵 pendingAward 寫入前 10 名玩家的雲端存檔<br>'
        + '③ 玩家下次登入會自動領取<br><br>'
        + '⚠ 若 Firestore Rules 未開放跨玩家寫入,部分寫入會失敗,失敗清單會顯示在控制台。';

      const _doSettle = async function(){
        _manualSettleBtn.disabled = true;
        _manualSettleBtn.textContent = '🔄 結算中...';
        try{
          const _result = await window._weeklyQuiz.trySettleLastWeek();
          if(_result === true){
            const _failedInfo = window._weeklyQuizSettlementFailed;
            if(_failedInfo && _failedInfo.failedUids && _failedInfo.failedUids.length > 0){
              try{ _showSimpleToast('⚠ 部分發放失敗(' + _failedInfo.failedUids.length + ' 人),請用「補發給單一玩家」補上', 5000); }
              catch(_){ alert('⚠ 部分發放失敗('+_failedInfo.failedUids.length+' 人),請用「補發給單一玩家」補上'); }
            } else {
              try{ _showSimpleToast('✅ 結算完成', 3000); }catch(_){ alert('✅ 結算完成'); }
            }
          } else {
            try{ _showSimpleToast('上週已結算過,跳過(或無人上榜)', 3000); }catch(_){ alert('上週已結算過,跳過(或無人上榜)'); }
          }
          _renderInfo();
        }catch(e){
          console.error('[手動結算] 失敗', e);
          try{ _showSimpleToast('❌ 結算失敗:' + (e && e.message || e), 5000); }catch(_){ alert('❌ 結算失敗:'+(e && e.message || e)); }
        }
        _manualSettleBtn.disabled = false;
        _manualSettleBtn.innerHTML = '🎁 手動結算上週並補發前 10 名獎勵';
      };

      if(typeof _customConfirm === 'function'){
        _customConfirm(_confirmMsg, _doSettle);
      } else {
        if(confirm(_confirmMsg.replace(/<br>/g, '\n'))) await _doSettle();
      }
    };

    // ── 補發給單一玩家 ──
    if(_giveBtn) _giveBtn.onclick = async function(){
      const _uid = (_uidInput.value || '').trim();
      if(!_uid){
        try{ _showSimpleToast('請輸入 uid', 2000); }catch(_){ alert('請輸入 uid'); }
        return;
      }
      const _rank = parseInt(_rankSelect.value, 10);
      let _coins, _crystals, _books;
      if(_rank === 1){ _coins = 50000; _crystals = 10; _books = 10; }
      else if(_rank === 3){ _coins = 35000; _crystals = 6; _books = 6; } // 用 3 代表 2-5 名
      else if(_rank === 8){ _coins = 20000; _crystals = 3; _books = 3; } // 用 8 代表 6-10 名
      else {
        try{ _showSimpleToast('排名選項異常', 2000); }catch(_){ alert('排名選項異常'); }
        return;
      }

      const _confirmMsg = '💰 確定要補發給以下玩家?<br><br>'
        + 'uid: <code style="font-size:12px;">' + _esc(_uid) + '</code><br>'
        + '排名:' + (_rank === 1 ? '🥇 第 1 名' : _rank === 3 ? '🥈 第 2-5 名' : '🥉 第 6-10 名') + '<br>'
        + '獎勵:' + _coins + ' 幣 + ' + _crystals + ' 水晶 + ' + _books + ' 本豪華典藏經驗書';

      const _doGive = async function(){
        _giveBtn.disabled = true;
        _giveBtn.textContent = '🔄 補發中...';
        try{
          // 取 Firestore SDK 需要的 setDoc / doc 函式
          //   注意:這些是 ES Module import 進來的,放在 window._fbDb 物件相關 API 內
          const _fbDb = window._fbDb;
          if(!_fbDb){
            throw new Error('window._fbDb 不可用');
          }
          // ★ v3.11.29 — 優先用 index.html 暴露的同版 Firestore 函式(window._fbFns)
          let _doc, _setDoc;
          if(window._fbFns && window._fbFns.doc && window._fbFns.setDoc){
            _doc = window._fbFns.doc;
            _setDoc = window._fbFns.setDoc;
          } else {
            const _firestoreMod = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
            _doc = _firestoreMod.doc;
            _setDoc = _firestoreMod.setDoc;
          }

          const _lastKey = window._weeklyQuiz.getLastWeekKey();
          await _setDoc(_doc(_fbDb, 'players', _uid), {
            weeklyQuizPendingAward: {
              weekKey: _lastKey,
              rank: _rank,
              coins: _coins,
              crystals: _crystals,
              books: _books,
              correct: 0,
              createdAt: Date.now(),
              claimedAt: null,
              manual: true,  // ★ 標記為手動補發
              manualBy: window._gUserId || '',
            }
          }, { merge: true });
          console.log('[手動補發] ✅ uid=' + _uid + ' rank=' + _rank);
          try{ _showSimpleToast('✅ 補發成功,玩家下次登入會自動領取', 3000); }catch(_){ alert('✅ 補發成功,玩家下次登入會自動領取'); }
          _uidInput.value = '';
        }catch(e){
          console.error('[手動補發] 失敗', e);
          const _code = e && e.code;
          let _msg = '❌ 補發失敗:';
          if(_code === 'permission-denied'){
            _msg += '\nFirestore Rules 沒開放跨玩家寫入。\n\n請到 Firebase Console 設定 Rules:\n'
              + 'match /players/{playerUid} {\n'
              + '  allow read: if request.auth != null && request.auth.uid == playerUid;\n'
              + '  allow write: if request.auth != null && (\n'
              + '    request.auth.uid == playerUid\n'
              + '    || request.resource.data.diff(resource.data).affectedKeys()\n'
              + '       .hasOnly([\'weeklyQuizPendingAward\'])\n'
              + '  );\n'
              + '}';
          } else {
            _msg += (e && e.message || e);
          }
          try{ _showSimpleToast(_msg.replace(/\n/g, ' '), 6000); }catch(_){ alert(_msg); }
        }
        _giveBtn.disabled = false;
        _giveBtn.innerHTML = '💰 補發';
      };

      if(typeof _customConfirm === 'function'){
        _customConfirm(_confirmMsg, _doGive);
      } else {
        if(confirm(_confirmMsg.replace(/<br>/g, '\n').replace(/<[^>]+>/g, ''))) await _doGive();
      }
    };

    // ════════════════════════════════════════════════════════════════
    // ★ v3.6.10(2026-05-24) — 刪除小博士排名(老師需求:刪自己 / 異常帳號)
    // ────────────────────────────────────────────────────────────────
    // 用 runTransaction 讀 → 移除 → 寫回,跟 _weeklyQuiz.flushNow 完全一致
    // 路徑:stats/global.weeklyQuiz[週key] map 內移除指定 uid
    // 同時記下審計痕跡:stats/global.weeklyQuizDeletionLog[週key]_<uid> = {by, at, correct}
    //
    // 觸發點:
    //   ① 第 7 區「🗑️ 刪除」按鈕(可指定本週/上週 + uid)
    //   ② 「查看本週/上週前 30 名」modal 內每列的垃圾桶
    // ════════════════════════════════════════════════════════════════
    async function _doDeleteWqEntry(weekKey, uid, displayName, afterDelete){
      uid = String(uid || '').trim();
      if(!weekKey || !uid){
        try{ _showSimpleToast('❌ 缺週 key 或 uid', 2500); }catch(_){ alert('❌ 缺週 key 或 uid'); }
        return;
      }
      const _shortUid = uid.slice(0, 12) + (uid.length > 12 ? '…' : '');
      const _confirmMsg = '⚠️ 確定要刪除以下小博士排名嗎?<br><br>'
        + '玩家:<b style="color:#ffe066;">' + _esc(displayName || '玩家') + '</b><br>'
        + 'uid:<code style="font-size:12px;color:#88ccff;">' + _esc(_shortUid) + '</code><br>'
        + '週 key:<code style="color:#88ccff;">' + _esc(weekKey) + '</code><br><br>'
        + '<span style="color:#ff8888;">刪除後該玩家本週累計題數歸零</span>(不影響歷史獎勵)。<br>'
        + '操作會留下審計痕跡(weeklyQuizDeletionLog)。';

      const _doDelete = async function(){
        try{
          const _fbDb = window._fbDb;
          if(!_fbDb){
            throw new Error('window._fbDb 不可用');
          }
          // ★ v3.11.33(2026-05-29) — 真正修法:改用 updateDoc + dot path + deleteField()。
          //   原 BUG:tx.set({...}, {merge:true}) 對 nested map 是「深層合併」不是「替換」,
          //          所以「移除 uid 後重建的 weekMap」寫回時,Firestore 會把舊 uid 合併回來,
          //          造成「顯示成功但排行榜還在」(老師 2026-05-29 回報)。
          //   新法:用 updateDoc 配 dot notation key + deleteField() 精準刪除 nested key,
          //         完全不動其他欄位(同 line ~7554 worldBossLeaderboard 刪除模式)。
          let _doc, _updateDoc, _deleteField, _getDoc;
          if(window._fbFns && window._fbFns.doc && window._fbFns.updateDoc && window._fbFns.deleteField && window._fbFns.getDoc){
            _doc = window._fbFns.doc;
            _updateDoc = window._fbFns.updateDoc;
            _deleteField = window._fbFns.deleteField;
            _getDoc = window._fbFns.getDoc;
          } else {
            const _firestoreMod = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
            _doc = _firestoreMod.doc;
            _updateDoc = _firestoreMod.updateDoc;
            _deleteField = _firestoreMod.deleteField;
            _getDoc = _firestoreMod.getDoc;
          }

          const _statsRef = _doc(_fbDb, 'stats', 'global');

          // 先讀一次當前 entry(留快照給審計 log,並驗證真有這筆)
          const _snap = await _getDoc(_statsRef);
          const _data = _snap.exists() ? (_snap.data() || {}) : {};
          const _weekMap = (_data.weeklyQuiz && _data.weeklyQuiz[weekKey]) || {};
          if(!_weekMap[uid]){
            throw new Error('該玩家在「' + weekKey + '」沒有上榜記錄(可能已被刪除或從未答題)');
          }
          const _deletedEntry = _weekMap[uid];
          const _logKey = weekKey + '__' + uid;

          // 用 dot notation + deleteField() 精準刪除單一 nested key
          const _updates = {};
          _updates['weeklyQuiz.' + weekKey + '.' + uid] = _deleteField();
          _updates['weeklyQuizDeletionLog.' + _logKey] = {
            weekKey: weekKey,
            uid: uid,
            correct: _deletedEntry.correct || 0,
            name: _deletedEntry.name || '',
            email: _deletedEntry.email || '',
            deletedBy: window._gUserId || '',
            deletedAt: Date.now(),
          };
          await _updateDoc(_statsRef, _updates);

          console.log('[刪除小博士排名 v3.11.33] ✅ 週=' + weekKey + ' uid=' + uid + ' 原題數=' + (_deletedEntry.correct || 0));

          // ★ v3.11.33(2026-05-29) — 手動同步本機 cache,避免 onSnapshot round-trip 期間 UI 仍顯示舊資料
          //   onSnapshot 通常 100~500ms 內會自動更新 _cachedGlobalStats,但用戶感受上可能太慢。
          //   主動先在本機 mirror 掉,UI 立刻看到正確結果;之後 onSnapshot 回來會再 overwrite(冪等)。
          try{
            if(window._cachedGlobalStats && window._cachedGlobalStats.weeklyQuiz
               && window._cachedGlobalStats.weeklyQuiz[weekKey]){
              delete window._cachedGlobalStats.weeklyQuiz[weekKey][uid];
              // 廣播,讓訂閱 weeklyQuizSynced 的 UI 重渲(玩家端排行榜頁 + admin 後台)
              try{ document.dispatchEvent(new CustomEvent('weeklyQuizSynced')); }catch(_){}
            }
          }catch(_eCache){ console.warn('[刪除小博士排名] 本機 cache 同步失敗(已寫雲端,onSnapshot 會補)', _eCache); }

          // 如果是刪除「自己」且為本週 → 同步把本機 lxps_wq_local_<uid> 也清掉,
          // 不然玩家下次答題會把本機累計推回雲端
          try{
            const _selfUid = window._gUserId || '';
            const _isSelf = (uid === _selfUid);
            const _isThisWeek = window._weeklyQuiz && (weekKey === window._weeklyQuiz.getWeekKey());
            if(_isSelf && _isThisWeek){
              try{ localStorage.removeItem('lxps_wq_local_' + _selfUid); }catch(_){}
              // 同時重置 _weeklyQuiz 內部累計(若 API 提供)
              if(window._weeklyQuiz && typeof window._weeklyQuiz.resetLocalCount === 'function'){
                try{ window._weeklyQuiz.resetLocalCount(); }catch(_){}
              }
              console.log('[刪除小博士排名] 🧹 已清本機 lxps_wq_local_' + _selfUid);
            }
          }catch(_){}

          try{ _showSimpleToast('✅ 已刪除「' + (displayName || _shortUid) + '」的小博士排名', 3500); }
          catch(_){ alert('✅ 已刪除小博士排名'); }
          if(typeof afterDelete === 'function'){
            try{ afterDelete(); }catch(_){}
          } else {
            try{ _renderInfo(); }catch(_){}
          }
        }catch(e){
          console.error('[刪除小博士排名] 失敗', e);
          const _code = e && e.code;
          let _msg = '❌ 刪除失敗:';
          if(_code === 'permission-denied'){
            _msg += '\nFirestore Rules 沒開放管理員寫 stats/global.weeklyQuiz。\n\n'
              + '請到 Firebase Console 確認管理員 email('
              + (window._fbAuth && window._fbAuth.currentUser && window._fbAuth.currentUser.email || '')
              + ')可寫 stats/global。';
          } else {
            _msg += (e && e.message || e);
          }
          try{ _showSimpleToast(_msg.replace(/\n/g, ' '), 6000); }catch(_){ alert(_msg); }
        }
      };

      if(typeof _customConfirm === 'function'){
        _customConfirm(_confirmMsg, _doDelete);
      } else {
        if(confirm(_confirmMsg.replace(/<br>/g, '\n').replace(/<[^>]+>/g, ''))) await _doDelete();
      }
    }

    // 第 7 區「🗑️ 刪除」按鈕綁定
    const _delBtn = document.getElementById('_admin-wq-del-btn');
    const _delUidInput = document.getElementById('_admin-wq-del-uid');
    const _delWeekSelect = document.getElementById('_admin-wq-del-week');
    if(_delBtn) _delBtn.onclick = async function(){
      const _uid = (_delUidInput && _delUidInput.value || '').trim();
      if(!_uid){
        try{ _showSimpleToast('請輸入要刪除的玩家 uid', 2500); }catch(_){ alert('請輸入要刪除的玩家 uid'); }
        return;
      }
      const _which = (_delWeekSelect && _delWeekSelect.value) || 'this';
      const _weekKey = (_which === 'last')
        ? window._weeklyQuiz.getLastWeekKey()
        : window._weeklyQuiz.getWeekKey();

      // 從快取查名字(若查不到就用 uid 短碼)
      let _displayName = _uid.slice(0, 8) + '…';
      try{
        const _gs = window._cachedGlobalStats || {};
        const _wq = _gs.weeklyQuiz || {};
        const _wm = _wq[_weekKey] || {};
        const _ent = _wm[_uid];
        if(_ent){
          _displayName = _formatName({ uid: _uid, name: _ent.name, email: _ent.email });
        }
      }catch(_){}

      _delBtn.disabled = true;
      _delBtn.textContent = '🔄 刪除中...';
      await _doDeleteWqEntry(_weekKey, _uid, _displayName, function(){
        _delBtn.disabled = false;
        _delBtn.innerHTML = '🗑️ 刪除';
        if(_delUidInput) _delUidInput.value = '';
        _renderInfo();
      });
      // 防呆:若 transaction 是 throw error 提早跑掉,按鈕也要還原
      _delBtn.disabled = false;
      _delBtn.innerHTML = '🗑️ 刪除';
    };
  })();
}

// 確保函式被掛到 window(function declaration 在 script 頂層會自動掛,但顯式寫一次更穩)
window._showAdminStatsPanelImpl = _showAdminStatsPanelImpl;

// 模組載入完成標記(讓 _ensureAdminPanelLoaded 知道載完了)
window._adminPanelLoaded = true;
