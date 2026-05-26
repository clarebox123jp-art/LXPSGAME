// ════════════════════════════════════════════════════════════════════════════
// admin_panel.js — LXPSGAME 管理員後台功能(獨立模組,lazy load)
// ────────────────────────────────────────────────────────────────────────────
// 抽出版本: v3.5.45(2026-05-23)首次抽出
// 改動歷史: v3.5.47(2026-05-23) — 套用 v3.5.44 GM 後台改版
//             • 標題改為「🛠️ 遊戲管理員(GM)專用功能選單」
//             • PC 版(寬≥1024 高≥900)放大 200% + 置中
//             • 14 個區段依重要性 flex order 重排,7 個無 id 區段補上 id
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

      <!-- ★ FIX 20260519(v7) — 帳號完全重置 + 重建工具 -->
      <!--
        放在 3.5 之後、4 號之前,因為它是「最徹底」的玩家資料修補工具。
        用法:當學生帳號被其他學生資料污染,3 / 3.5 都救不回(保留現有策略反而保下污染)
        時,用此工具完全清空帳號 → 指定角色 + 等級 + 資源 → 從零重建。
        危險度:**不可逆**,清掉的資料不會自動還原。要求雙重確認。
      -->
      <div style="background:rgba(60,15,15,0.55);border:3px solid rgba(255,80,80,0.7);border-radius:10px;padding:16px;margin-bottom:22px;">
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

        <!-- ★ v3.10.13(2026-05-26) — 世界 BOSS 今日次數查詢/重置(老師需求) -->
        <div style="margin-top:14px;padding-top:14px;border-top:1px dashed rgba(200,140,255,0.4);">
          <div style="font-size:15px;font-weight:700;color:#ffd066;margin-bottom:6px;">
            🎯 個別玩家今日場次處理
          </div>
          <div style="font-size:12px;color:#bbb;margin-bottom:8px;line-height:1.55;">
            查詢學生今日已上榜場次;或重置(連同 teamKey 整筆排行榜紀錄一起清掉,
            讓他可重新挑戰)。<b style="color:#ffaa66;">⚠ 重置會清掉該 teamKey 整筆排行榜紀錄,連帶其他隊友的歷史也會清。</b>
          </div>
          <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap;align-items:center;">
            <input id="_admin-wbreset-email" type="text" placeholder="輸入學生 email"
              style="flex:1;min-width:200px;padding:7px 10px;font-size:13px;
              background:rgba(0,0,0,0.4);border:1.5px solid rgba(255,200,100,0.5);
              border-radius:7px;color:#fff;font-family:inherit;" />
            <button id="_admin-wbreset-peek" style="padding:7px 12px;font-size:13px;font-weight:700;
              background:rgba(40,60,90,0.5);border:1.5px solid rgba(140,200,255,0.6);color:#88ccff;
              border-radius:7px;cursor:pointer;font-family:inherit;">
              🔍 查詢
            </button>
            <button id="_admin-wbreset-do" style="padding:7px 12px;font-size:13px;font-weight:800;
              background:linear-gradient(135deg,rgba(200,100,60,0.6),rgba(160,60,30,0.85));
              border:2px solid #ffaa66;color:#fff;border-radius:7px;cursor:pointer;font-family:inherit;">
              🗑️ 重置今日次數
            </button>
          </div>
          <div id="_admin-wbreset-result" style="font-size:13px;color:#bbb;background:rgba(0,0,0,0.35);
            border-radius:8px;padding:8px 12px;line-height:1.6;min-height:20px;display:none;"></div>
          <div style="font-size:12px;color:#888;margin-top:6px;line-height:1.55;">
            💡 想對自己操作(老師也受限),可在 console 跑 <code style="color:#aaccff;">_myResetWbDailyToday()</code>
          </div>
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
    const SIDEBAR_ITEMS = [
      { sec: '_admin-maint-section',            label: '🔧 維修模式',              hint: '非管理員登入封鎖' },
      { sec: '_admin-gm-section',               label: '📢 GM 公告',                hint: '對所有在線玩家廣播' },
      { sec: '_admin-bug-section',              label: '📥 接收錯誤回報',          hint: '查看玩家提交的 bug' },
      { sec: '_admin-lv1-section',              label: '🆘 Lv1 救援',              hint: '雲端三槽 + 反污染保護' },
      { sec: '_admin-pollution-check-section',  label: '📢 污染檢查提醒',          hint: '寄送進度污染提醒' },
      { sec: '_admin-rescue-section',           label: '🚑 玩家資料急救工具',      hint: '修復異常資料' },
      { sec: '_admin-comp-section',             label: '🎁 學生補償工具',          hint: '指定信箱發放補償' },
      { sec: '_admin-dlperm-section',           label: '⬇️ 下載安裝權限',          hint: '管理 PWA 安裝授權' },
      { sec: '_admin-sus-section',              label: '🕵️ 可疑帳號偵測',          hint: '檢查資料異常的玩家' },
      { sec: '_admin-wblb-section',             label: '🏆 世界 BOSS 排行榜',      hint: '查看 / 清除排行' },
      { sec: '_admin-wq-section',               label: '📊 本週小博士排行榜',      hint: '結算 / 補發 / 刪除' },
      { sec: '_admin-bypass-section',           label: '🔓 解除冷卻 / 每日上限',   hint: '測試用' },
      { sec: '_admin-test-batch-section',       label: '🧪 批次設定數值',          hint: '測試工具' },
      { sec: '_admin-backfill-players-section', label: '📊 回填總玩家數',          hint: '統計校正' },
      { sec: '_admin-set-players-section',      label: '👥 手動設定總玩家數',      hint: '統計校正' },
      { sec: '_admin-set-adv-section',          label: '⚔️ 設定累計冒險次數',      hint: '統計校正' },
    ];

    const sidebarList = document.getElementById('_admin-sidebar-list');
    const welcome = document.getElementById('_admin-welcome');
    const titleEl = document.getElementById('_admin-current-title');

    if(!sidebarList){
      console.error('[v3.10.11] 找不到 #_admin-sidebar-list,sidebar 無法渲染');
      return;
    }

    // 渲染 sidebar 按鈕
    sidebarList.innerHTML = SIDEBAR_ITEMS.map((it, i) =>
      `<button class="admin-sidebar-item" data-sec="${it.sec}" data-idx="${i}" title="${it.hint || ''}">
         <span class="_si-num">${String(i + 1).padStart(2, '0')}</span>${it.label}
       </button>`
    ).join('');

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

    // ★ v3.5.30 — 綁定「🔬 查此學生資料」按鈕
    //   點下後自動把學生 email/uid 填到「3.5 學生補償工具」的查詢欄位並送出,
    //   老師收到 BUG 回報後一鍵就能看到該學生完整雲端資料,直接處理或補償
    _bugListEl.querySelectorAll('._bug-lookup-btn').forEach(btn => {
      btn.onclick = (ev) => {
        ev.stopPropagation();
        const _uid = btn.getAttribute('data-uid') || '';
        const _email = btn.getAttribute('data-email') || '';
        try{
          const _emInput = document.getElementById('_admin-comp-email');
          const _uiInput = document.getElementById('_admin-comp-uid');
          // 優先用 uid(更穩),沒有再用 email
          if(_uid){
            if(_uiInput) _uiInput.value = _uid;
            if(_emInput) _emInput.value = '';
          } else if(_email){
            if(_emInput) _emInput.value = _email;
            if(_uiInput) _uiInput.value = '';
          } else {
            alert('此回報沒有 uid 與 email,無法自動查詢');
            return;
          }
          // 滾動到補償工具區塊
          const _compSection = document.getElementById('_admin-comp-find');
          if(_compSection){
            _compSection.scrollIntoView({ behavior:'smooth', block:'center' });
            // 0.4 秒後自動點查詢按鈕
            setTimeout(()=>{ try{ _compSection.click(); }catch(_){} }, 400);
            // 提示視覺回饋
            btn.textContent = '✅ 已帶入查詢';
            setTimeout(()=>{ btn.innerHTML = '🔬 查此學生資料'; }, 1500);
          }
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
      res.style.color = '#ff8888';
      res.textContent = '🔒 維修模式已開啟,非管理員已被阻擋登入';
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

  // 手動設定總玩家數（avoid scan permission）
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

    // ★ v1.0.20260512.6210 — 補償英雄分組定義(讓老師依類型快速找)
    //   未列入任何組的英雄會自動歸到「💼 其他」最末
    const _HERO_GROUPS = [
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
    // ★ v3.10.13(2026-05-26) — 個別玩家今日場次查詢/重置
    // ────────────────────────────────────────────────────────────────
    // 兩顆按鈕共用 input 與 result 區
    //   🔍 查詢 → _adminPeekWbDailyByEmail(email)
    //   🗑️ 重置 → _adminResetWbDailyByEmail(email)(整筆 teamKey 砍掉)
    // ════════════════════════════════════════════════════════════════
    const _wbResetEmailInput = document.getElementById('_admin-wbreset-email');
    const _wbResetPeekBtn = document.getElementById('_admin-wbreset-peek');
    const _wbResetDoBtn = document.getElementById('_admin-wbreset-do');
    const _wbResetResultEl = document.getElementById('_admin-wbreset-result');

    function _wbResetShowResult(html, type){
      if(!_wbResetResultEl) return;
      _wbResetResultEl.style.display = 'block';
      const _color = (type === 'err') ? '#ff8888' : (type === 'ok') ? '#aaffcc' : '#ddd';
      _wbResetResultEl.innerHTML = '<span style="color:' + _color + ';">' + html + '</span>';
    }

    function _wbResetGetEmail(){
      if(!_wbResetEmailInput) return '';
      const _v = (_wbResetEmailInput.value || '').trim().toLowerCase();
      return _v;
    }

    if(_wbResetPeekBtn) _wbResetPeekBtn.onclick = async function(){
      const _email = _wbResetGetEmail();
      if(!_email){
        _wbResetShowResult('⚠️ 請輸入 email', 'err');
        return;
      }
      if(typeof window._adminPeekWbDailyByEmail !== 'function'){
        _wbResetShowResult('⚠️ API 未掛載(_adminPeekWbDailyByEmail)', 'err');
        return;
      }
      _wbResetPeekBtn.disabled = true;
      const _orig = _wbResetPeekBtn.textContent;
      _wbResetPeekBtn.textContent = '查詢中…';
      _wbResetShowResult('查詢中…', 'info');
      try{
        const _r = await window._adminPeekWbDailyByEmail(_email);
        if(!_r){
          _wbResetShowResult('❌ 找不到此 email 的玩家', 'err');
          return;
        }
        const _todayBattles = Array.isArray(_r.todayBattles) ? _r.todayBattles : [];
        const _battlesHtml = _todayBattles.length === 0
          ? '<div style="color:#888;margin-top:4px;">  · (今天還沒上榜任何場次)</div>'
          : _todayBattles.map(function(b, i){
              const _t = new Date(b.at);
              const _hh = _t.getHours();
              const _mm = _t.getMinutes();
              const _pad = function(n){ return n < 10 ? '0' + n : '' + n; };
              const _mvp = b.mvp ? (b.mvp.name + ' Lv' + b.mvp.lv) : '—';
              return '<div style="margin-top:3px;color:#ddd;">  · 第 ' + (i+1) + ' 場 ' +
                     _pad(_hh) + ':' + _pad(_mm) + ' · 傷害 ' + (b.dmg || 0).toLocaleString() +
                     ' · MVP ' + _mvp + '</div>';
            }).join('');
        _wbResetShowResult(
          '✅ <b>' + _email + '</b><br>' +
          'uid: <code style="color:#aaccff;">' + _r.uid + '</code><br>' +
          '今天日期:' + _r.todayStr + '<br>' +
          '今日已上榜場次:<b style="color:#ffd066;">' + (_r.countToday || 0) + ' 場</b>' +
          ' / 上限 2 場<br>' +
          '今日累計傷害:<b style="color:#ffaa66;">' + (_r.todayDmgSum || 0).toLocaleString() + '</b><br>' +
          '含此玩家的隊伍 (teamKey) 數:<b>' + (_r.myTeamKeys ? _r.myTeamKeys.length : 0) + '</b>' +
          _battlesHtml,
          'ok'
        );
      }catch(e){
        _wbResetShowResult('❌ 查詢失敗:' + (e && e.message || e), 'err');
      }finally{
        _wbResetPeekBtn.disabled = false;
        _wbResetPeekBtn.textContent = _orig;
      }
    };

    if(_wbResetDoBtn) _wbResetDoBtn.onclick = async function(){
      const _email = _wbResetGetEmail();
      if(!_email){
        _wbResetShowResult('⚠️ 請輸入 email', 'err');
        return;
      }
      if(typeof window._adminResetWbDailyByEmail !== 'function'){
        _wbResetShowResult('⚠️ API 未掛載(_adminResetWbDailyByEmail)', 'err');
        return;
      }
      // 二次確認
      const _confirmMsg = '⚠️ 確定要重置 <b>' + _email + '</b> 的世界 BOSS 今日次數嗎?<br><br>' +
                         '這會把「所有含此玩家的 teamKey」整筆排行榜紀錄砍掉,<br>' +
                         '<b style="color:#ffaa66;">連帶其他隊友的累積戰績一起清掉</b>,<br>' +
                         '操作不可逆。確認嗎?';
      const _doReset = async function(){
        _wbResetDoBtn.disabled = true;
        const _orig = _wbResetDoBtn.textContent;
        _wbResetDoBtn.textContent = '重置中…';
        _wbResetShowResult('重置中…', 'info');
        try{
          const _ok = await window._adminResetWbDailyByEmail(_email);
          if(_ok){
            _wbResetShowResult(
              '✅ 已重置 <b>' + _email + '</b> 的世界 BOSS 今日次數<br>' +
              '<span style="color:#aaa;">(已砍掉所有含此玩家的 teamKey 排行榜紀錄)</span><br>' +
              '<span style="color:#88ddff;">學生請「重新整理」或「重新登入」,即可再開始打世界 BOSS</span>',
              'ok'
            );
            // 順手更新排行榜資訊
            _refresh();
          } else {
            _wbResetShowResult('❌ 重置失敗(可能找不到 email,看 console)', 'err');
          }
        }catch(e){
          _wbResetShowResult('❌ 重置失敗:' + (e && e.message || e), 'err');
        }finally{
          _wbResetDoBtn.disabled = false;
          _wbResetDoBtn.textContent = _orig;
        }
      };
      if(typeof _customConfirm === 'function'){
        _customConfirm(_confirmMsg, _doReset);
      } else {
        if(!confirm(_confirmMsg.replace(/<br>/g, '\n').replace(/<[^>]+>/g, ''))) return;
        await _doReset();
      }
    };

    // Enter 鍵在 input 內等於按「查詢」(快速體驗)
    if(_wbResetEmailInput){
      _wbResetEmailInput.addEventListener('keydown', function(e){
        if(e.key === 'Enter' && _wbResetPeekBtn && !_wbResetPeekBtn.disabled){
          _wbResetPeekBtn.click();
        }
      });
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
      _overlay.style.cssText =
        'position:fixed;left:0;top:0;width:100vw;height:100vh;' +
        'background:rgba(0,0,0,0.82);z-index:100001;display:flex;' +
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
      _overlay.style.cssText =
        'position:fixed;left:0;top:0;width:100vw;height:100vh;' +
        'background:rgba(0,0,0,0.78);z-index:99999;display:flex;' +
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
          // 單場平均 > 5000 標紅(世界 BOSS 單次傷害上限 5000,平均超過就奇怪)
          const _avgColor = _avg > 5000 ? '#ff6666' : (_avg > 3000 ? '#ffaa55' : '#aaccff');
          const _avgWarn = _avg > 5000 ? ' ⚠️' : '';
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
                          '· 平均 ' + _avg.toLocaleString() + '/場' + _avgWarn + '</span>' +
                       _sourcesBtn +
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
            '單場平均 &gt; 5000 標紅</b>,通常代表 BUG/異常傷害。' +
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
                    'border-radius:5px;cursor:pointer;font-family:inherit;">⚠️ 只勾異常(平均&gt;5000)</button>' +
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
        // 重新算「平均 > 5000」的列並勾起
        _list.forEach(function(e){
          const _avg = (e.battles||0) > 0 ? Math.round((e.totalDmg||0) / e.battles) : 0;
          if(_avg > 5000){
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
      //   第 2 階段:按下刪除 → 底部變成「⚠️ 真的要刪除? [確認刪除] [取消]」
      //   不用 _customConfirm,因為它 z-index 99990 < 明細 modal 99999 → 看起來像沒反應
      const _footerBox = _overlay.querySelector('#_admin-wblb-detail-footer');
      const _doDelete = async function(_teamKeys){
        // 切到「刪除中…」狀態
        _footerBox.innerHTML =
          '<span style="font-size:13px;color:#ffcc88;flex:1;">刪除中… 請稍候</span>';
        try{
          if(!window._wbHpSync || typeof window._wbHpSync.clearLeaderboardEntries !== 'function'){
            throw new Error('_wbHpSync.clearLeaderboardEntries API 不存在(模組未掛載?)');
          }
          const result = await window._wbHpSync.clearLeaderboardEntries(BOSS_ID, _teamKeys);
          if(!result){
            throw new Error('刪除失敗(API 回 null)');
          }
          const _okMsg = '✅ 已刪除 ' + (result.removed || 0) + ' 筆排行榜紀錄(剩餘 ' + (result.kept || 0) + ' 筆)';
          if(typeof _showSimpleToast === 'function') _showSimpleToast(_okMsg, 'ok');
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
        _footerBox.innerHTML =
          '<span style="font-size:12px;color:#888;flex:1;">⚠️ 刪除不可逆。</span>' +
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
        _footerBox.innerHTML =
          '<span style="font-size:13px;color:#ff9988;flex:1;font-weight:700;">' +
            '⚠️ 真的要刪除這 ' + _teamKeys.length + ' 筆嗎?(不可復原)' +
          '</span>' +
          '<button id="_admin-wblb-detail-cancel" style="padding:8px 14px;font-size:13px;' +
                  'background:rgba(80,80,100,0.5);border:1.5px solid #889;color:#ccc;' +
                  'border-radius:6px;cursor:pointer;font-family:inherit;">取消</button>' +
          '<button id="_admin-wblb-detail-confirm" style="padding:9px 18px;font-size:14px;font-weight:800;' +
                  'background:linear-gradient(135deg,rgba(220,60,60,0.95),rgba(160,20,20,1));' +
                  'border:2px solid #ff8888;color:#fff;border-radius:8px;cursor:pointer;' +
                  'font-family:inherit;box-shadow:0 0 12px rgba(255,80,80,0.5);">' +
            '✓ 確認刪除 ' + _teamKeys.length + ' 筆</button>';
        _footerBox.querySelector('#_admin-wblb-detail-cancel').onclick = _renderFooterNormal;
        _footerBox.querySelector('#_admin-wblb-detail-confirm').onclick = function(){
          _doDelete(_teamKeys);
        };
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
      _modal.style.cssText = 'position:fixed;inset:0;z-index:25000;background:rgba(0,0,16,0.82);'
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
          // 動態載入 Firestore SDK
          const _firestoreMod = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
          const _doc = _firestoreMod.doc;
          const _setDoc = _firestoreMod.setDoc;

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
          // 動態載入 Firestore SDK
          const _firestoreMod = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
          const _doc = _firestoreMod.doc;
          const _runTransaction = _firestoreMod.runTransaction;

          const _statsRef = _doc(_fbDb, 'stats', 'global');
          let _deletedEntry = null;

          await _runTransaction(_fbDb, async function(tx){
            const _snap = await tx.get(_statsRef);
            const _data = _snap.exists() ? (_snap.data() || {}) : {};
            const _wq = _data.weeklyQuiz || {};
            const _weekMap = _wq[weekKey] || {};
            if(!_weekMap[uid]){
              throw new Error('該玩家在「' + weekKey + '」沒有上榜記錄(可能已被刪除或從未答題)');
            }
            _deletedEntry = _weekMap[uid];  // 留個快照,寫進審計 log
            // 用 spread 重建 map,排除目標 uid
            const _newWeekMap = {};
            for(const _u in _weekMap){
              if(_u !== uid) _newWeekMap[_u] = _weekMap[_u];
            }
            const _newWq = Object.assign({}, _wq);
            _newWq[weekKey] = _newWeekMap;
            // 審計 log:用「週key__uid」當 key,內含被刪當下的快照 + 操作者
            const _logKey = weekKey + '__' + uid;
            const _delLog = _data.weeklyQuizDeletionLog || {};
            const _newLog = Object.assign({}, _delLog);
            _newLog[_logKey] = {
              weekKey: weekKey,
              uid: uid,
              correct: _deletedEntry.correct || 0,
              name: _deletedEntry.name || '',
              email: _deletedEntry.email || '',
              deletedBy: window._gUserId || '',
              deletedAt: Date.now(),
            };
            tx.set(_statsRef, {
              weeklyQuiz: _newWq,
              weeklyQuizDeletionLog: _newLog,
            }, { merge: true });
          });

          console.log('[刪除小博士排名] ✅ 週=' + weekKey + ' uid=' + uid + ' 原題數=' + (_deletedEntry && _deletedEntry.correct || 0));

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
