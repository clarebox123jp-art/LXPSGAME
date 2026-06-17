// ════════════════════════════════════════════════════════════════════════
//  game_changelog.js  —  LXPSGAME 更新日誌
//  最後更新:2026-06-15  / 目前主程式版本:v3.15.16(地府酋長天賦改%疊層+刀山火海全體分攤;14個全體傷害爆發統一改基礎×4全體分攤,杏花妖/黑暗球BOSS不改)
//
//  ★ 維護注意事項(老師請務必看):
//    1. 這個檔案必須是「合法的 JS」,結尾要有 `];` 把陣列關起來
//    2. 新增版本條目時:在 GAME_CHANGELOG = [ ... ] 內最上方插入新物件
//    3. 每個條目欄位必須用 `ver`(不是 version)、`items` 或 `brief`
//    4. 編輯完上傳 GitHub 後,index.html 內 _GAME_LOADED_VERSION 改新版本
//       會自動觸發瀏覽器破快取(?v=版本號)
//    5. 千萬不要只貼「補丁區塊」就上傳 — 那會讓整個檔案語法錯誤
// ════════════════════════════════════════════════════════════════════════

window.GAME_CHANGELOG = [
  // ════════════════════════════════════════════════════════════════════
  // v3.15.26(2026-06-17)— 🎟️ 新功能:虛寶序號兌換(老師發序號,學生輸入領獎勵)
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.26',
    date: '2026-06-17',
    brief: [
      '🎟️【全新功能:虛寶序號兌換】',
      '   ・主選單新增「<b>🎟️ 序號兌換</b>」按鈕!老師會給你<b>虛寶序號</b>,在這裡輸入就能領取獎勵。',
      '   ・獎勵可能包含 UR 英雄、各種召喚卷、召喚水晶、知識幣、超越極限果實等等。',
      '   ・<b>每個序號只能用一次</b>:已被別人領走的序號再輸入,會顯示「此序號已被使用」喔!',
      '   ・領到的獎勵會直接加進你的帳號,<b>不會蓋掉你原有的東西</b>。',
    ],
    items: [
      '★ v3.15.26【虛寶序號系統 新增 index.html + admin_panel.js】老師需求:GM 選單新增「虛寶序號」,可直接發課堂獎勵的序號讓學生輸入兌換。設計:一序號=一次性兌換券(每序號限用一次,誰先輸入誰得,兌過即失效)',
      '★ v3.15.26【GM 端 admin_panel.js】「🎁 補償與補發」群組新增「🎟️ 虛寶序號」卡片(課堂獎勵發放下方):勾選獎勵(鏡像課堂獎勵 12 項)+數量 → 設定產生組數(1~200)/有效期(永久或到期日)/備註 → 批量產生序號 → 產出含獎勵名稱的可複製清單(可整段貼給其他老師);另可查看序號清單(未兌/已兌by誰/過期/停用)、單一刪除。三點同步(SIDEBAR_ITEMS+GROUPS+卡片+handler),無 ?. 相容舊 Safari',
      '★ v3.15.26【學生端 index.html】主選單(冒險地圖頁底部功能列 + 手機版底部導覽)新增「🎟️ 序號兌換」按鈕 → openRedeemDialog 彈窗輸入序號 → _fbRedeemCode 兌換。發獎複用 _fbCompensatePlayer(union 合併不降級),走玩家寫自己 doc 路徑(payload 全非停權欄位,rule 放行)',
      '★ v3.15.26【後端 index.html】_lxpsGenRedeemCode(12碼大寫英數,排除易混淆 0/O/1/I/L)、_fbGenerateRedeemCodes(GM 批量產生,runTransaction 防撞號)、_fbListRedeemCodes(GM 列清單)、_fbAdminDeleteRedeemCode(GM 刪)、_fbRedeemCode(學生兌換:先讀檢查 → runTransaction 原子標記 redeemed → 發獎;先標記再發獎,寧可偶爾漏發也不可重複刷)。資料結構 redeemCodes/{CODE}={code,reward,itemsLabel,redeemed,redeemedBy,redeemedByLabel,redeemedAt,expiresAt,batchId,note,createdAt,createdBy,enabled}',
      '★ v3.15.26【安全 firestore.rules ⚠需老師手動部署】redeemCodes 規則:get 任何登入者(兌換需讀)、list/create/delete 限 GM、update 僅允許「redeemed:false→true 且 redeemedBy==自己 且只動 redeemed/redeemedBy/redeemedByLabel/redeemedAt」→ 玩家動不了 reward/有效期/啟用旗標,兌過的序號他人再寫被 rule 擋(transaction 之外的雙重保險)。未部署前產生/兌換都會失敗',
      '★ v3.15.26【版本鏈】3 主同步點 v3.15.25→v3.15.26;admin_panel.js v3.15.23→v3.15.26(ADMIN_PANEL_VERSION + _vers 同步)。world-boss-ui.html 維持 v3.15.21、hero_db.js/world-boss.js 維持 v3.15.17。上傳順序:game_changelog.js → admin_panel.js → index.html(最後)',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.25(2026-06-17)— 🔁 戰鬥題目出完自動循環不卡死 ＋ ⚖️ 法老王BOSS恢復/復活下修
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.25',
    date: '2026-06-17',
    brief: [
      '🔁【戰鬥答題:題目出完自動循環,不再卡死】',
      '   ・修正某些情況下,戰鬥中題目<b>全部出完後會卡住、題目一直跳不出來</b>的問題。',
      '   ・現在題目出完會<b>自動從頭重新循環出題</b>,戰鬥不會再卡死。',
      '⚖️【埃及王關:法老王(BOSS)恢復與復活下修】',
      '   ・法老王 BOSS 的大招<b>全體回血量降低 50%</b>(25%→12.5%),<b>復活量也一起調低</b>',
      '     (大招復活倒下同伴、以及和埃及豔后「互相復活」喚回法老王的血量都從 25% 降為 12.5%)。',
      '   ・<b>你自己招募的法老王不受影響</b>;埃及豔后被喚回的血量也維持原本數值。',
    ],
    items: [
      '★ v3.15.25【戰鬥題目出完循環卡死 根治 index.html advPickQuestion】老師需求:戰鬥中題目出完後要自動從第一題循環、避免卡死。根因:題庫整輪出完時 BOSS 戰回傳 { __needRepick:true } → advShowQuiz 隔 150ms 用 _advTriggerQuizSafely 重觸發再抽;但若 _advSessionQuestions 此時是空陣列(某些路徑沒初始化/被清掉),重觸發後 advPickQuestion 清空 used 後 pool 仍空 → 又回傳 __needRepick → 150ms 無限重觸發、題目永遠不出 → 卡死',
      '★ v3.15.25【修法 index.html】advPickQuestion 預設分支與 catch 分支同步改:只在「_advSessionQuestions 非空(剛清完 used、重觸發保證抽得到)」時才走 __needRepick 重觸發;session 為空時不再回傳 __needRepick,改用 ADV_QUIZ_DB 洗牌兜底補回 _advSessionQuestions、當場往下走隨機抽題 → 保證有題可出、從頭循環、永不無限重觸發',
      '★ v3.15.25【法老王 BOSS 恢復量降 50% index.html 太陽神的審判】爆發「全體回 HP」原 BOSS 版固定 25%(招募版 25%→45% 隨爆發升級)。老師需求:BOSS 版恢復量降 50% → _healPct = h.isEgyptBoss ? 0.125 : (招募版維持 0.25~0.45)。只動 BOSS 版,招募版不變',
      '★ v3.15.25【法老王 BOSS 復活量也降低 index.html】(a)爆發「太陽神的審判」復活倒下友方:_revPct = h.isEgyptBoss ? 0.125 : 0.25(BOSS 25%→12.5%,招募版維持 25%);(b)埃及雙王天賦「互相復活」喚回法老王:_phK.curHp 由最大HP×0.25 → ×0.125(兩處 hook:startTurn 行動前 + checkWin 全滅判定前皆改)。埃及豔后被喚回維持 ×0.25(老師需求僅針對法老王)',
      '★ v3.15.25【版本鏈】3 主同步點 v3.15.24→v3.15.25(本輪改 index.html + game_changelog.js)。admin_panel.js 維持 v3.15.23、world-boss-ui.html 維持 v3.15.21、hero_db.js 未改。上傳順序:game_changelog.js → admin_panel.js → index.html(最後)',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.24(2026-06-17)— 🐛 兩項戰鬥修正:世界BOSS妖怪等級、冒險第三場卡死
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.24',
    date: '2026-06-17',
    brief: [
      '⚔️【世界BOSS龍王戰:妖怪英雄等級修正】',
      '   ・修正帶「<b>大天狗 / 酒吞童子 / 玉藻前</b>」(以及埃及「<b>法老王 / 埃及豔后</b>」)上場打世界BOSS龍王時,',
      '     <b>隊伍確認顯示正確、一進戰鬥卻變回 1 級</b>的問題。現在這些英雄會正確帶著你培養的等級與能力上場了!',
      '🗺️【冒險第三關:劇情卡死修正】',
      '   ・修正第三場劇情演到一半,<b>只剩背景畫面 + 右邊法寶欄、進不了小怪戰</b>的卡死。',
      '   ・原因是過場背景沒被收起來、<b>蓋住了其實已經開始的戰鬥</b>。現在會自動把背景收掉、露出戰鬥畫面,不用再手動自救了。',
    ],
    items: [
      '★ v3.15.24【世界BOSS妖怪變Lv1 根治 index.html _wbSetupAdvForBattle】老師回報:世界BOSS龍王戰的大天狗/酒吞/玉藻前沒讀到參與玩家等級能力,隊伍確認顯示正確、進戰鬥變Lv1。根因:該函式的「二重保險」(防妖怪誤帶BOSS版高素質)原用固定 h.hp>=100 判定,但世界BOSS獨立入口傳進來的 G.p1 已套過「等級(冒險+2%/級,Lv上限50)+素質投資(HP自由50+膠囊20)」加成 → 英雄弱化版滿等(酒吞童子91基底→(91+70)×1.98≈319)早超過100 → 合法高等妖怪被誤判成BOSS版、強制打回 JP_BOSS_HERO_STATS 基底=Lv1',
      '★ v3.15.24【時序差異說明】主程式 confirmHeroPick 的同款二重保險跑在「套等級之前」的基底值(大天狗75/酒吞91/玉藻74,皆<100)故不誤觸;世界BOSS的跑在「已套等級+投資」的隊伍上(滿等≈319>100)才誤觸 → 只有世界BOSS出問題,與老師觀察一致',
      '★ v3.15.24【修法 index.html】兩處世界BOSS二重保險(妖怪 + 埃及雙王)門檻 h.hp>=100 → 改用「HERO_DB BOSS版基礎HP × 0.5」(妖怪 900×0.5=450、埃及 11500/10500×0.5=5750/5250):弱化版滿等≤319 遠低於450不誤傷;真誤帶BOSS版(900/11500)才還原。主程式兩處(跑在基底、判定正確)不動',
      '★ v3.15.24【冒險第三場卡死 根治 index.html advStartMiniBattle】老師回報+新假設:第三場劇情到一半只剩背景+法寶卡死,自救存檔→確認→關視窗,背景圖消失後就看到戰鬥畫面 → 是不是被覆蓋?確認屬實:過場層 adv-cutscene-overlay(z-index 620,內含 adv-scene-bg 背景圖 + adv-treasure-bar 法寶欄)蓋在已起的戰場上沒掀掉,玩家只看到背景+法寶、誤以為沒戰鬥(且此時 _advMiniBattleActive 已 true、原 watchdog 不再介入)',
      '★ v3.15.24【修法① index.html】進小怪戰 setTimeout 的「第一件事」就先隱藏 adv-cutscene-overlay(原本只在後段隱藏,若中段組怪/抽牌/狀態重置任一拋例外就會在隱藏前中斷、過場層永遠蓋住戰場)→ 確保後面任何步驟出錯都不會蓋住戰鬥',
      '★ v3.15.24【修法②(獨立保險)index.html】另排一個與主 setTimeout 互不影響的計時器:以 _advCurrentBattleId 綁定本場戰鬥,於「開場演出(_introDelay)後 +1500ms」檢查「本場小怪戰仍在進行 + 過場層仍蓋著」→ 強制掀掉過場層 + 清其他可能遮擋的過場彈窗(boss-detail/intro/quiz/reward/result),露出戰場。綁 battleId 確保不會誤掀之後新一場戰鬥的開場演出',
      '★ v3.15.24【版本鏈】3 主同步點 v3.15.23→v3.15.24(本輪改 index.html + game_changelog.js)。admin_panel.js 維持 v3.15.23(本輪未動),world-boss-ui.html 維持 v3.15.21,hero_db.js 未改(只讀數值)。上傳順序:game_changelog.js → admin_panel.js → index.html(最後)',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.23(2026-06-17)— 🔧 後台維護:補回 GM「🔐 二次密碼管理」工具(老師管理用,非玩家功能)
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.23',
    date: '2026-06-17',
    brief: [
      '🔧【後台維護(老師管理工具)】',
      '   ・修復老師後台「🔐 二次密碼管理」工具(查詢 / 解鎖 / 移除學生忘記的第二段密碼)。',
      '   ・<b>此為老師管理功能,不影響一般遊玩</b>;忘記第二段密碼的同學,請<b>本人</b>聯絡老師協助重置。',
    ],
    items: [
      '★ v3.15.23【補回 GM 二次密碼管理 UI admin_panel.js】老師回報:GM 選單「幫玩家移除二次密碼」功能不見了。調查:後端三函式(window._fbAdminPeekPwByEmail 查詢 / _fbAdminUnlockPwByEmail 解鎖 / _fbAdminClearPwByEmail 移除=secondPassword:deleteField())一直都在 index.html 且完好,但全 index.html + admin_panel.js 皆無任何呼叫點 → GM 後台 UI 整個遺失,三函式無入口可觸發',
      '★ v3.15.23【三點同步補回 admin_panel.js】鏡像既有 trust-revoke(撤銷信任裝置)工具寫法,在「🛠 系統管理」群組補回卡片:① SIDEBAR_ITEMS 加 {sec:_admin-pw-section, 🔐 二次密碼管理} ② SIDEBAR_GROUPS 系統管理群加入 _admin-pw-section ③ 卡片 template(email 輸入 + 🔍查詢狀態 / 🔓解鎖[保留密碼] / 🗑移除密碼 三鈕 + result div)④ _initSecondPwTool() handler IIFE 綁三鈕。缺任一 = 卡片永久隱藏(鐵律1.47/1.140)',
      '★ v3.15.23【三功能行為 admin_panel.js】🔍查詢:_fbAdminPeekPwByEmail → 顯示是否已設定/設定時間/錯誤次數/是否鎖定+自動解鎖時間。🔓解鎖:_fbAdminUnlockPwByEmail → 清錯誤次數與10分鐘鎖定、密碼保留(學生想起來還能用),含 confirm。🗑移除:_fbAdminClearPwByEmail → 整組清除(雜湊儲存無法還原原碼故只能清),學生下次登入重新引導自設,含 confirm。皆 try/catch + email 小寫正規化',
      '★ v3.15.23【相容性 admin_panel.js】全程字串串接、不使用 ?. 可選串連(相容學校舊版 Safari iPad,符合 admin_panel.js 既有規範);typeof 守門確認三後端函式就緒才呼叫',
      '★ v3.15.23【版本鏈】admin_panel.js 內 ADMIN_PANEL_VERSION 與 index.html _LXPS_FILE_VERSIONS[admin_panel.js] 同步 v3.15.9→v3.15.23(原本 v3.15.9/v3.15.14 不一致一併校正);3 主同步點 _GAME_LOADED_VERSION + _vers[index.html] + _vers[game_changelog.js] v3.15.22→v3.15.23。本輪改 admin_panel.js + index.html + game_changelog.js;world-boss-ui.html 維持 v3.15.21。上傳順序:game_changelog.js → admin_panel.js →(world-boss-ui.html 若尚未部署)→ index.html(最後)',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.22(2026-06-17)— 👑 知識王持之以恆「達標立刻發券」 + 🔮 召喚星空新增「召喚紀錄」
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.22',
    date: '2026-06-17',
    brief: [
      '👑🎁【知識王「持之以恆」達標,馬上拿到召喚卷!】',
      '   ・修正累積<b>5 天 ≥80 分</b>(SR 卷)、<b>10 天 ≥90 分</b>(SSR 卷)達標後,要自己手動點「領取」才有卷的問題。',
      '   ・現在<b>一達標就自動發卷</b>到背包(挑戰結算當下、或打開知識王視窗時都會自動補發),不必再手動領取。之前已達標還沒領的同學,打開知識王視窗就會自動補發!',
      '🔮📜【召喚星空:新增「召喚紀錄」!】',
      '   ・召喚星空右上角新增 <b>📜 召喚紀錄</b> 按鈕,可查看<b>最近 60 次召喚抽到的結果</b>(含每日免費抽、連抽、召喚卷)。',
      '   ・(此紀錄存在你目前使用的這台裝置上。)',
    ],
    items: [
      '★ v3.15.22【知識王持之以恆 達標立刻發券 index.html】老師回報:累積 5 天 ≥80 / 10 天 ≥90 達標後,沒有立刻拿到 SR/SSR 召喚卷。根因:原設計達標後需玩家自己到知識王彈窗點「🎁 領取」才發卷(_kingClaimPersistReward 由按鈕觸發),非自動。修法:新增 _kingAutoClaimPersistRewards() 複用既有 _kingClaimPersistReward(內含 _have>=need 守門+發卷 backpackAdd+天數歸0+防連點+待領帳本+雲端多段重試,最穩固),只要任一條累積天數 >= 門檻就自動領取',
      '★ v3.15.22【兩個觸發點 index.html】① _kingClaimRewards 累加持之以恆天數後立刻呼叫 → 達標那一刻即發;② _kingShowEntryPopup 開頭呼叫 → 開啟知識王彈窗時補發「之前已達標卻還沒領」的舊帳(含本次改版前已累積達標者)。90 分同時推進 SR/SSR 兩條 → 兩條各自達標各自發;發券後該條歸 0 重新累積(維持原設計)。兩 tier 防連點旗標獨立,連續呼叫不互擋',
      '★ v3.15.22【召喚星空 召喚紀錄 index.html】老師需求:召喚頁面新增召喚結果紀錄。新增 _recordSummonHistory(results,isFree)(依 uid 寫 localStorage lxps_summon_history_<uid>,保留最近 60 批,記錄稀有度標籤 SSR/SR/至寶/稀有)+ _showSummonHistory()(右上「📜 召喚紀錄」按鈕開啟彈窗,逐批列出時間/單抽或連抽/免費標記/各獎勵 chip)。掛點:doSummon(主抽:單抽/10+1/免費)+ _showSummonTicketResult(英雄召喚卷:隨機+自選)+ _showTreasureTicketResult(至寶召喚卷:隨機+自選)',
      '★ v3.15.22【召喚紀錄 設計取捨 index.html】純本地 localStorage 紀錄(不進雲端存檔)→ 換裝置/清快取後可能不見,但同一台裝置會保留;依 uid 分鍵,共用平板上不同學生互不干擾。英雄/至寶「本體」的雲端持久化由 v3.15.21 _lxpsCloudInstantUnlock 負責,與此顯示用紀錄無關',
      '★ v3.15.22【版本鏈】_GAME_LOADED_VERSION + _LXPS_FILE_VERSIONS index.html + game_changelog.js → v3.15.22。本輪只改 index.html + game_changelog.js;world-boss-ui.html 維持 v3.15.21(上一版已改、若尚未部署需一起上傳)。其餘未改:hero_db.js/world-boss.js v3.15.17、admin_panel.js v3.15.14、arena.js v3.13.94。上傳順序:game_changelog.js →(world-boss-ui.html 若尚未部署)→ index.html(最後)',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.21(2026-06-17)— 🐉 世界BOSS搶先看改地龍王 + 🔮 抽到/解鎖的英雄·至寶防「得到又消失」
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.21',
    date: '2026-06-17',
    brief: [
      '🔮🛡【重要修正:抽到/解鎖的英雄、至寶不會再「得到又消失」!】',
      '   ・修正少數同學<b>抽到角色(或打 BOSS 解鎖)後,圖鑑卻沒有解鎖</b>的問題。',
      '   ・現在不論是召喚抽到、還是 BOSS 戰解鎖的<b>英雄與至寶,都會在當下立刻存到雲端</b>,並留下可查的解鎖紀錄 — 換平板、換帳號都不會再不見。',
      '🐉🪨【世界 BOSS:下一隻「搶先看」換成 山岳地龍王(地龍王)】',
      '   ・世界 BOSS 頁面的「下一隻世界 BOSS・搶先看」已更新為下一棒<b>山岳地龍王(土屬性)</b>,介紹牠的山崩落石、四元素護盾與唯一弱點(劇毒)。',
      '   ・(圖鑑整理:地龍王原本誤出現在英雄圖鑑,現已正確歸到<b>魔物圖鑑的世界 BOSS 區</b>。)',
    ],
    items: [
      '★ v3.15.21【抽到/解鎖 英雄·至寶 即時 targeted 雲端寫入 index.html _lxpsCloudInstantUnlock】老師回報三例(110164 武士、110003 幽幽+風術士、110103 死靈法師)抽到沒解鎖。根因(共用平板):正常解鎖只靠 gameCloudSave(全文重寫)寫雲端,而它 ①_progressLoaded=false(剛登入就抽卡/打關)第一行即 return false ②整份大文件寫入,課堂 Wi-Fi 壅塞易 resource-exhausted ③失敗只能靠本地 pending/紀錄「下次登入 reconcile」補,但學生離開後下一位登入會清掉前者 localStorage → 本地救援沒了+雲端從未收到 → 永久消失',
      '★ v3.15.21【修法 index.html】新增 _lxpsCloudInstantUnlock(patch,label):解鎖當下對 players/{uid} 做一次「最小、只增不刪、冪等」targeted updateDoc。英雄:unlockedHeroes 用 arrayUnion(只增、自動去重)+ _heroUnlockHistory arrayUnion 同一筆 _entry;至寶:taiwanTreasureData.<id> dotted-path(只動該至寶鍵、寫實際當前紀錄避免覆蓋已升級者)+ _treasureUnlockHistory arrayUnion。掛在 advSaveUnlockedHero(_isNew)與 _advSaveTreasureUnlockHistory 內,涵蓋召喚/貓空/日本/埃及/世界BOSS 排名所有解鎖路徑',
      '★ v3.15.21【為什麼安全 index.html】arrayUnion 只能加不能刪/縮減且去重(GM 已刪英雄不會被重加,_isNew 守門);dotted-path 只影響單一至寶鍵;「擁有權 + 解鎖紀錄」同一次原子寫入 → 不會出現「有擁有權卻查無解鎖紀錄」被 GM 異常掃描誤判為跨帳號汙染而刪;這些皆非停權欄位、Firestore 規則允許 owner 更新自己 players/{uid} → 無需改 rules。寫入比 gameCloudSave 輕(較不觸 resource-exhausted)+繞過就緒守門+解鎖當下落地雲端(撐過切帳號);失敗自動重試 2 次(間隔 5s),仍敗交既有 reconcile/gameCloudSave/_lxpsInstantPersist 多重兜底',
      '★ v3.15.21【世界BOSS「下一隻搶先看」改地龍王 world-boss-ui.html】大廳靜態預告卡(.wb-boss-preview)由翠綠森龍王(草)改為山岳地龍王(地龍王,土):立繪改 地龍王.png、配色改土黃/棕、能力描述改(山崩落石/天動地裂、第3/5/7/9回合四元素護盾草破土·水破火·光破暗·火破草、單次傷害上限5000+全傷-40%+50%反彈、弱點劇poison固定大傷無視上限)、結尾改「打倒翠綠森龍王之後甦醒」。輪替序 火→草→土(地龍王)→風→水→暗→光→幻,當前為草龍王故下一隻正確為地龍王',
      '★ v3.15.21【地龍王 英雄圖鑑SR移除→魔物圖鑑BOSS index.html】根因:v3.15.17 漏把「山岳地龍王」加進 BOSS_NAMES → 牠(★5、在 HERO_DB)跑去英雄圖鑑 SR 區。修法:BOSS_NAMES 翠綠森龍王後補「山岳地龍王」→ 英雄圖鑑/鬥技場自動排除、改在魔物圖鑑「世界 BOSS」區顯示(_buildMonsterPage 內 WORLD_BOSS_LIST/MONSTER_AVTR 早已含,本次補上排除即完成搬移),並讓靠 BOSS_NAMES.includes() 的尊嚴/秒殺守門對地龍王生效',
      '★ v3.15.21【同根因·世界BOSS秒殺防護 index.html】把「山岳地龍王」加進 _ZEUS_TRUE_BOSSES(原僅火/草龍王)。死神收割(HP<30% curHp=0)與大嘴吸入吞噬的即死防護只靠此名單、無上游 _isWorldBossTarget 守門 → 地龍王缺席會被一招秒殺 500 萬血世界 BOSS。同翠綠森龍王處理。不動 _mainBosses(慢動作KO,翠綠森龍王也不在,保持一致)',
      '★ v3.15.21【版本鏈】_GAME_LOADED_VERSION + _LXPS_FILE_VERSIONS index.html + game_changelog.js → v3.15.21;world-boss-ui.html v3.15.0 → v3.15.21(本輪改)。其餘未改:hero_db.js/world-boss.js v3.15.17、admin_panel.js v3.15.14、arena.js v3.13.94。本輪改動檔 = game_changelog.js + world-boss-ui.html + index.html。上傳順序:game_changelog.js → world-boss-ui.html → index.html(最後)',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.20(2026-06-16)— 🦅 修正埃及雙重行動寵物(荷魯斯之鷹)無限連續行動/每回合卡死
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.20',
    date: '2026-06-16',
    brief: [
      '🦅🛠【修正:埃及雙重行動寵物(荷魯斯之鷹)攻擊停不下來、每回合卡住】',
      '   ・修正在埃及關卡,裝備「<b>荷魯斯之鷹</b>」的英雄會一直重複行動、停不下來,每回合都卡住、只能靠「卡死自救」才能跳到下一回合的問題。',
      '   ・現在荷魯斯之鷹會穩定地讓主人<b>每回合行動 2 次</b>(不多不少),行動完正常換下一位,不再卡住。',
    ],
    items: [
      '★ v3.15.20【埃及荷魯斯之鷹 無限連續行動/每回合卡死 根治 index.html endAction 荷魯斯 hook】根因:v3.15.17 的守門/觸發用「本回合鎖 _horusActedThisTurn」,但該鎖在 startTurn(G.p2/G.p1 forEach)「每次輪到任何單位」就被重置成 false;而 startTurn 是「每單位行動前」呼叫、非每回合一次 → 荷魯斯主人重開行動(acted=false,400ms 後)被「再次輪到」時 startTurn 又把鎖清掉 → endAction 守門再次通過 → 無限再行動 → 玩家回合永不結束 → 每回合卡(只能卡死自救跳下一回合)。v3.15.17 修法錯誤假設 startTurn 同回合不重複呼叫',
      '★ v3.15.20【修法 index.html】守門/觸發鎖改綁 G.round(回合計數,只在 nextRound +1、同回合內穩定、startTurn 不重置它)。新欄位 _horusActedRound:守門改成「_horusActedRound 不等於目前 G.round」(G 未定義時退化為 -1);觸發時記 _horusActedRound = G.round(保留 _reActCount 加 1 / _traitReAct / 400ms acted=false 重開行動)。機制:首次觸發後 _horusActedRound 即等於 G.round → 同回合守門恆不通過 → 不再觸發(剛好 2 個動作);下回合 round +1 → 再觸發 1 次。startTurn 兩處 _horusActedThisTurn 重置已退役成無害死碼(已無人讀)',
      '★ v3.15.20【鐵律 候選】「每回合一次性、且角色會在同回合重開行動(acted=false)」的天賦/裝備,守門絕不可用會被 startTurn「每次輪到單位」重置的旗標(_horusActedThisTurn / 裸 _reActCount / _sellThisTurn);必須改用 G.round 比對(某回合旗標 不等於 G.round)。startTurn = 每單位行動前呼叫,G.round 只在 nextRound +1。沿用既有 _gaReActRound(雅典娜女神權能)同款做法',
      '★ v3.15.20【版本鏈】_GAME_LOADED_VERSION + _LXPS_FILE_VERSIONS index.html + game_changelog.js → v3.15.20(其餘未改:hero_db.js / world-boss.js v3.15.17、admin_panel.js v3.15.14、arena.js v3.13.94)。本輪改動檔 = index.html + game_changelog.js(本檔)。上傳順序:game_changelog.js → index.html(最後)',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.19(2026-06-16)— 🐛 修正貓空/日本冒險第三場景偶爾卡死
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.19',
    date: '2026-06-16',
    brief: [
      '🗺️🛠【修正:貓空/日本冒險「第三場」偶爾卡住】',
      '   ・修正在貓空、日本冒險關卡走到第三場時,偶爾會卡在背景畫面、沒有出現對話或下一場戰鬥的問題,現在會正常進入第三場戰鬥。',
      '   ・(小提醒:過場對話一句一句點就好,太快連點也不會再卡住了。)',
    ],
    items: [
      '★ v3.15.19【貓空/日本第三場景隨機事件卡死 根治+保險 index.html】根因:第三場景隨機事件(野生動物/寶箱/裂縫)用 _tgShowDialog,每段對白完成會把 dialog.onclick 還原成 advNextDialog;玩家在「某步完成、下一步(對白/答題/戰鬥)未渲染」空檔快速連點 → 觸發 advNextDialog 自我修復 reset _advSceneChoiceDone → 重複觸發隨機事件與進行中步驟衝突 → 對話框消失/無戰鬥永久卡死(畫面只剩第三場景背景+右邊法寶)。埃及第三場是 japan_auto 直接開戰、無 _tgShowDialog 事件,故不受影響(與老師「貓空+日本才卡、埃及不卡」觀察一致)',
      '★ v3.15.19【修法①根治 index.html advNextDialog】隨機事件進行中(_advEventInProgress=true)時 advNextDialog 直接 return;事件本身用自己的 _tgShowDialog onclick=step 推進對白,根本不需 advNextDialog → 連點不再重複觸發事件。_advEventInProgress 於 advShowChoicePanel 觸發 random_event 時設,於進入小怪戰(advStartMiniBattle)或載入新場景(advLoadScene)時清',
      '★ v3.15.19【修法②保險 index.html _advTgEventForceProceeed / _advTgEventArmWatchdog】事件逾時(120s,每翻一行對白重新計時)自我驗證 watchdog:逾時仍卡在第三場景(過場顯示中 + 非小怪戰 + _advSceneIdx 未變)才介入 → 清理殘留 UI(寵物聚光/接受框/答題視窗/法寶彈窗)+ 重置旗標 + 強制 advStartMiniBattle(_advSceneIdx+1),保證永不永久卡死',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.18(2026-06-16)— 🐛 知識王答錯不扣分 + 貓空黑暗球卡死修復 + 畢業帳號轉移修正
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.18',
    date: '2026-06-16',
    brief: [
      '👑【知識王挑戰:答錯不再扣分!】',
      '   ・知識王挑戰答錯題目<b>不再扣分</b>了!現在只算答對加分(每題 +5,滿分 100),答錯不會倒扣,可以更放心作答。',
      '🌑🛠【修正:貓空黑暗球打倒後卡住、領不到獎勵】',
      '   ・修正在貓空打倒「<b>黑暗球‧希望型態</b>」之後,偶爾會卡在戰鬥畫面、無法結束、也領不到過關獎勵的嚴重問題,現在能正常結算並拿到獎勵。',
    ],
    items: [
      '★ v3.15.18【知識王答錯不扣分 index.html _kingPickAnswer】移除答錯 _kc._curScore -= 5(改為不動分數,只做視覺標記+答錯音效);規則顯示「❌ 答錯 -5 分」→「❌ 答錯不扣分」;分數註解同步。滿分仍 100 = 20 題 × 答對 +5(答錯不倒扣)',
      '★ v3.15.18【貓空黑暗球卡死 根治 index.html advStartBattle ~L74698】根因:_wbResultExecuting 只在世界 BOSS 戰開場(_wbSetupAdvForBattle)reset,從不在一般冒險戰開場 reset → 前場世界 BOSS 殘留的 _wbResultExecuting=true 漏進貓空黑暗球戰 → advShowBattleResult / advStartWinSequence 的 _wbCtx 世界 BOSS 守門誤判 → 冒險結算被擋 → 無限 watchdog 迴圈卡死。修法:一般冒險戰開打時除既有 _wbJustFinishedRaid 外,一併清 _wbResultExecuting / _wbConnectedHostMode / _wbConnectedClientMode',
      '★ v3.15.18【貓空黑暗球卡死 防線 index.html advShowBattleResult + advStartWinSequence 兩處 _wbCtx 守門】加例外 _advBossNotWb:stage≠worldboss + p2 含「黑暗球‧希望型態」+ p2 無任何龍王(_isWorldBossTarget) → 判定為真正冒險 BOSS 戰,改 if(_wbCtx && !_advBossNotWb) 才擋。不影響「打完龍王殘留 timer」原始保護(該情境 p2 不含黑暗球)',
      '★ v3.15.18【畢業帳號轉移修正 index.html _fbMigrateAccountData】根因:主檔整份複製把舊帳號停權狀態帶進新帳號(舊帳號在複製當下已停權時)→ 新帳號一誕生就被登入停權閘門擋下、學生無法用新帳號登入。修法:複製主檔時剝除停權6欄位(_suspended/_suspendedAt/_suspendedBy/_suspendReason/_unsuspendedAt/_unsuspendedBy)+ 連線 session 2 欄位(activeSession/sessionAt),新帳號永遠以未停權誕生',
      '★ v3.15.18【版本鏈】_GAME_LOADED_VERSION + _LXPS_FILE_VERSIONS index.html + game_changelog.js → v3.15.18(其餘未改:hero_db.js / world-boss.js v3.15.17、admin_panel.js v3.15.14)。本輪改動檔 = index.html + game_changelog.js(本檔)。上傳順序:game_changelog.js → index.html(最後)',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.17(2026-06-15)— 🐉 第三隻世界 BOSS「山岳地龍王(土)」登場 + 地龍王之麟開放
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.17',
    date: '2026-06-15',
    brief: [
      '🐉⛰【世界 BOSS 第三彈:山岳地龍王 登場!】',
      '   ・第三隻世界王「<b>山岳地龍王</b>」(土屬性)正式加入龍王輪替!盤踞地核億萬年的太古土龍,岩甲堅不可摧。',
      '   ・技能:「<b>山崩落石</b>」全體土屬性大傷 + 60% 機率暈眩;「<b>震天龍吼</b>」全體無屬性傷害 + <b>全體強力暈眩</b>!',
      '   ・爆發:「<b>天動地裂</b>」全體土屬性大傷(無視有利狀態)+ 隨機 2 名強力暈眩 + 1 名強力易傷!',
      '   ・天賦「<b>山岳之意志</b>」:單次受傷上限 5,000、第 3/5/7/9 回合啟動四元素護盾(草破土 / 水破火 / 光破暗 / 火破草)、<b>受到所有傷害再減 40%</b>、且<b>有 50% 機率反彈受到傷害的一半</b>給攻擊者!攻擊牠要小心被反震。',
      '   ・💡 <b>弱點:畏懼劇毒!</b>對牠下毒會變成大量固定傷害(普通中毒每回合 -1,500、猛毒每回合 -3,000),而且<b>無視上限、護盾與減傷</b>——<b>用毒隊是擊敗牠最有效的方法!</b>',
      '🪨✨【新排名至寶:地龍王之麟】',
      '   ・打贏山岳地龍王並進入隊伍排名,即可獲得專屬至寶「<b>地龍王之麟</b>」!',
      '   ・能力:HP +15、受土屬性傷害 -10%(每級 +3%)、對風屬性敵人傷害 +10%(每級 +3%)、<b>免疫暈眩與能力下降</b>、<b>每回合減傷 +5%</b>(上限 +30%,撐越久越硬)!',
      '🎵🌋【新音效與特效】山岳地龍王有專屬戰鬥 BGM;爆發「天動地裂」搭配地震 + 爆炸音效與全畫面碎石特效!',
      '⚔️【部分英雄爆發強化/調整】武器精靈「銀齒迴力鏢旋風」改 (攻+特)×500% 全體分攤、施放後回 5 能量;死靈法師「亡靈怨念一擊」改 特技300%×倒下數;埃及豔后、陰陽師爆發改全體分攤。<b>敵人越多每人受越少、敵人越少越集中!</b>',
      '🐛【問題修正】① 埃及寵物「<b>荷魯斯之鷹</b>」會無限連續行動的問題已修復;② <b>BOSS 血量剩 1 時全體攻擊都打 0(打不死)</b>的問題已修復,現在補刀就能擊殺;③ 埃及關小怪與雙王 BOSS 已收進「👹 魔物圖鑑」;④ 荷魯斯之鷹/托特聖鳥寵物圖片已更新。',
    ],
    items: [
      '★ v3.15.17【山岳地龍王 完整實裝 world-boss.js】_wbInstallHeroData 掛 HERO_DB(s1 山崩落石 c6 特技150%全體土+60%暈 / s2 震天龍吼 c4 特技75%全體無屬+全體強暈)+ BURST_DB(天動地裂 特技180%全體土無視有利+隨機2強暈1回+隨機1強易傷2回)+ HERO_TRAIT(山岳之意志)+ LORE/BIO/IMGS(地龍王.png)/MONSTER_AVTR🐉/MONSTER_ELEMENT earth;咆哮 _WB_BOSS_ROAR_LINES/COLOR(土黃 #d9a866);_WB_BATTLE_BGM_MAP→bgm-wb-shanyue-battle;_WB_DRAGON_TREASURE_MAP→dragon_scale_earth;_WORLD_BOSS_DROPS(土龍鱗甲/土龍之角);_WB_FX_URLS burst_earth→護盾碎石.gif;專屬AI _wbEarthBossS1/S2/Burst(爆發音效 sfx-earthquake+sfx-explode 疊放)+ 3處分派',
      '★ v3.15.17【強力減傷+中毒繞cap world-boss.js _wbApplyBossDmgCap】山岳地龍王:cap 5000 後 ×0.6(額外-40%);中毒/猛毒帶 _dotBypassBossCap 旗標時提前 return 原始值(繞 cap+減傷+護盾)。順序:中毒繞過 → cap5000 → ×0.6 → 護盾×0.2',
      '★ v3.15.17【大地反擊 index.html doDmg】山岳地龍王 50% 機率反彈 rawDmg(對龍王 cap+減傷後值)×50% 給攻擊者(土屬性,isRebound 防循環 / ignoreEvasion / noGuard),仿黑暗失控,排除 confused/isRebound/isTraitShare/isChaos/同隊',
      '★ v3.15.17【弱點畏毒 index.html 中毒tick】h.name===山岳地龍王 時 _amt 改固定 _strong?3000:1500,doDmg 帶 _dotBypassBossCap:true,log 加「(畏毒弱點!)」',
      '★ v3.15.17【地龍王之麟 至寶 index.html】移除 comingSoon;baseStats hp:15;specialEffects earthDmgReduce:10/windDmgBonus:10/immuneStun:1/immuneStatDown:1/dmgReduceRampPerRound:5;doDmg 新增 FT6(受土減免,仿FT3)/FT7(對風加成,仿FT4,target.element==wind)/FT8(每回合減傷+5%上限30%,仿FT5但作用受傷方);addStatus 入口加 immuneStun(擋stun)/immuneStatDown(擋 spddown/slow/breakDef/dmgVuln);標籤表×2 + flagSkip Set×4 同步',
      '★ v3.15.17【audio index.html】新增 <audio id=bgm-wb-shanyue-battle>(地龍王戰BGM.m4a)+ <audio id=sfx-earthquake>(地震.mp3)',
      '★ v3.15.17【4 爆發改基礎傷害 hero_db.js BURST_DB + index.html execBurst】武器精靈 銀齒迴力鏢旋風:(攻+特+速)×800%→(攻+特)×500% 全體分攤,移除單體2段,回3→回5能量;死靈法師 亡靈怨念一擊:特技120%→300%×倒下數(保底3)每隻→全體分攤(保留傷害轉治療),fd-renderer regex 修正(原含「的」no-op);埃及豔后 尼羅河的詛咒:特技200%每隻→150%全體分攤(保留減6能量/強力查封);陰陽師 四聖降臨:特技40%×4每隻隨機屬性→160%×4(水火風土各1次)全體分攤(保留召喚/debuff)+新增 fd-renderer 專屬 case(只縮放特技160%,避免 HP×150%/+50% 被通用縮放誤縮)',
      '★ v3.15.17【反擊乙案 index.html doDmg】山岳地龍王大地反擊上限改 = 攻擊者最大HP×50%;且反彈不致死(預先 clamp 到最多扣到剩1HP + 保險:若易傷放大跌破1則拉回1),老師需求「反彈後最低HP為1」',
      '★ v3.15.17【荷魯斯無限行動根治 index.html】根因:endAction 荷魯斯 hook 守門用 _reActCount<1,但 L48883「每次輪到玩家單位行動時 next._reActCount=0」會在荷魯斯重開行動(acted=false)再次被輪到時歸零→守門永遠通過→無限。修法:改用 _horusActedThisTurn 本回合鎖(只在 startTurn 重置,不被 L48883 清零),荷魯斯 hook 守門改判此旗標',
      '★ v3.15.17【BOSS 剩1全體打0 修正 index.html _applyBossLifelineProtection】第二段(1HP)鎖血移除 target._lifelineImmuneRound=_llRoundNow(不再設本回合免疫)。第一段(50%)免疫已足以擋同回合多段連轟;第二段必在後續回合觸發(同回合都被第一段免疫成0),1HP 是最後一絲血,補刀擊殺屬正常(保證不卡死),不應整回合免疫擋成0',
      '★ v3.15.17【埃及怪物入魔物圖鑑 index.html _buildMonsterPage】新增 EG_BOSS_LIST(法老王/埃及豔后)/EG_MOB_LIST(木乃伊貓/流沙眼鏡蛇/卡諾卜壇怪/神秘圖騰/沙漠毒蠍/仙人掌怪)/EG_RARE_LIST(聖甲蟲)+局部 MONSTER_AVTR 加埃及9隻+山岳地龍王 emoji+「🏜 埃及金字塔」section(BOSS/路邊/稀有)+_monsterDetailList 加埃及;WORLD_BOSS_LIST 加山岳地龍王',
      '★ v3.15.17【寵物圖片重新載入 index.html】荷魯斯之鷹/托特聖䴉 petImg 維持名配名(老師已在 GitHub 重傳正確圖,不對調)+ 加 ?v=20260615 破快取參數讓遊戲重新載入一次',
      '★ v3.15.17【版本鏈】_LXPS_FILE_VERSIONS index.html/world-boss.js/game_changelog.js/hero_db.js → v3.15.17(world-boss-ui.html 維持 v3.15.0 因 UI 動態渲染自動顯示新龍王);_GAME_LOADED_VERSION → v3.15.17',
      '★ v3.15.17 註:本輪改動檔 = game_changelog.js(本檔)、hero_db.js(v3.15.16→v3.15.17)、world-boss.js(v3.15.0→v3.15.17)、index.html(v3.15.16→v3.15.17)。world-boss-ui.html 七龍王表為動態渲染,無需改。上傳順序:game_changelog.js → hero_db.js → world-boss.js → index.html(最後)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.16(2026-06-15)— ⚖️ 地府酋長改版 + 多個全體爆發改「群體分攤」
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.16',
    date: '2026-06-15',
    brief: [
      '⚖️✨【地府酋長 強化】',
      '   ・天賦「<b>亡魂積怨</b>」升級:場上每有目標倒下,自身特技改為 <b>+10%</b>(原本固定 +2),最多疊 5 層;而且<b>自己倒下也不會清空</b>了!(天賦每升 1 級每層再 +2%,滿級每層 +18%、滿 5 層共 +90% 特技。)',
      '   ・爆發「<b>刀山火海</b>」改版:改為<b>特技 800% 全體「分攤」傷害</b> + 指定 1 名追加特技 100% 且強制禁動 1 回合。<b>敵人越少,每隻被打越痛</b>(單挑 BOSS 最高 800%)!',
      '💥🌟【多個爆發改「群體分攤」更會打 BOSS】',
      '   ・以下英雄的「全體傷害」爆發,通通改成<b>「基礎傷害 ×4,再由敵人平分」</b>:打滿 4 隻敵人時跟以前一樣,但<b>敵人越少、每隻吃越多</b>,單挑大魔王時威力大增!',
      '   ・名單:火法師、冰法師、光法師、暗法師、神射手、直笛團員、田徑隊員、窮奇、科技生化人、鋁合金暴龍、超鬼神王、暗魔將·血、青炎龍王、武器精靈。',
      '   ・(治療、復活、集中單體追擊、附加狀態等效果都<b>維持不變</b>;杏花妖、黑暗球是頭目,不調整。)',
    ],
    items: [
      '★ v3.15.16【地府酋長 天賦 亡魂積怨 改 %疊層 index.html doDmg 死亡分支】原本每層固定 +2 特技(+0.75/天賦級)、自身倒下會把 _hellChieftainStackBonus 從 sp 扣回並清空。改為:每層 = 首次疊層前特技值 × (10% + 天賦Lv×2%)(Lv1=10%、Lv5=18%/層),以 _hellChieftainBaseSp 鎖定基準避免複利;最多 5 層(滿層 Lv1=+50%、Lv5=+90%)。★ 移除自身倒下清空邏輯 → 倒下/復活皆保留疊層與加成,新戰鬥因 newHero 全新物件自然歸零(=重置)。',
      '★ v3.15.16【刀山火海 爆發改全體分攤 index.html execBurst + BURST_UPGRADE_DEF + _renderBurstFdWithLv】主傷害由「每隻特技200%~260%×_burstMult」改為「總量特技800%~1040%×_burstMult 由存活敵人均分」(_mainPctTable ×4=[8.00..10.40],_mainTotal/_foes.length);對 4 敵每隻仍 200%~260%(同舊值),敵越少越集中。指定 1 名追加特技100%(+禁動,Lv5達2回合)維持不變。BURST_DB/BURST_UPGRADE_DEF rows/fd-renderer 同步顯示 800%全體分攤(鐵律1.160 圖鑑只寫 Lv1 基礎)。',
      '★ v3.15.16【14 個全體傷害爆發統一改「基礎×4 全體分攤」index.html execBurst】轉換規則:取原「每隻」倍率表達式整體 ×4 為「分攤總量」,再由存活敵人均分(max(foeN,total)/foeN,空敵防呆 foeN>0?:0)→ 對 4 敵每隻同舊值,敵越少越集中(單體≈4倍)。清單與倍率:火法師烈焰爆發 特技200→800%(追加10%隨分攤後每隻計)/冰法師冰封末日 200→800%/光法師審判光束 150→600%(治療不變)/暗法師毀滅禁咒 全體180→720%(集中單體280%不變)/神射手流星箭雨 170→680%/直笛團員天籟之音 傷害150→600%(治療150%不變)/田徑隊員極速閃燃 速度200→800%(閃燃buff不變)/窮奇召喚上古四凶獸 攻擊200→800%/科技生化人輻射核砲 (攻+特)130→520%/鋁合金暴龍死神龍王登場 攻擊170→680%(收割追加仍以單體_mainDmg×50%計、不稀釋)/超鬼神王大嘴吸入 特技140→560%(吞噬追加同理保留)/暗魔將·血血劍·爆破 全體150→600%(集火單體300%不變)/青炎龍王青炎之舞 特技200→800%(復活/迴避不變)/武器精靈銀齒迴力鏢旋風 (攻+特+速)200→800%(保留單體2段=總量/2、全體每隻=總量/敵數)。',
      '★ v3.15.16【圖鑑/升級顯示同步 hero_db.js BURST_DB + index.html BURST_UPGRADE_DEF rows / _renderBurstFdWithLv】14 個 BURST_DB d/fd 改「X×4% 全體分攤(敵人越多每人受越少)」(Lv1 基礎 鐵律1.160);科技生化人/鋁合金暴龍/超鬼神王/暗魔將·血 4 個 BURST_UPGRADE_DEF rows ×4;9 個 _renderBurstFdWithLv case(冰封末日/審判光束/流星箭雨/毀滅禁咒/召喚上古四凶獸/輻射核砲/死神龍王登場/大嘴吸入/血劍·爆破)改 ×4 基數並修正 regex 比對新 fd 文字(部分舊 regex 含「的」本為 no-op,一併修正使升級預覽正確)。',
      '★ v3.15.16 註(技術備註):杏花妖(千年絕美)、黑暗球(黑暗爆破)為 BOSS,老師指定不改。多段/彈跳爆發(九尾/弦樂團/鳳凰/大天狗/八岐/布奶/菇女/玉藻前/神槍手)、固定值(炸彈客)、已是分攤(萬物創生/同生共死暗星/太陽神/超級射線/諸神黃昏)不在本次範圍。⚠ 副作用:作為敵方時(青炎龍王/窮奇/鋁合金暴龍/超鬼神王 等),殘隊玩家會被集中打、略增難度(老師選丙已知並接受);鬥技場 ×0.25 縮放於分攤後每隻傷害照常套用。本輪改動檔 = game_changelog.js、hero_db.js(v3.15.9→v3.15.16)、index.html(v3.15.15→v3.15.16);admin_panel.js/world-boss.js/sw.js 未改、版本不動。CURRENT_BOOT_VER 不變。上傳順序:game_changelog.js → hero_db.js → index.html(最後)。本版含 v3.15.15 黑暗球打倒卡死根治(累積)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.15(2026-06-15)— 🌑 黑暗球打倒後戰鬥卡死「徹底根治」
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.15',
    date: '2026-06-15',
    brief: [
      '🔧🌑【BUG 修正】',
      '   ・⚔️ 修正「<b>打倒黑暗球後,戰鬥畫面卡住、沒有結算、無法結束戰鬥</b>」的問題,已徹底根治!打倒後會穩定跳出勝利結算。',
      '   ・✨ 這次同時讓<b>所有頭目戰</b>(九尾、杏花妖、日本、台灣、埃及…)的「擊倒→結算」更穩定,不再偶爾卡住。',
      '   ・🌑 黑暗球的「分身」被打倒時,不會再誤跳「擊倒 黑暗球!」的勝利特效(那是分身,不是本體)。',
    ],
    items: [
      '★ v3.15.15【結算慢動作「去重豁免」失效 — 根治 BOSS 打倒後卡死 index.html】根因:_showResultWithDrama 入口有 60 秒「同 battleId 去重守門」,原意要放行慢動作的合法重呼叫(用 if(!_bossKillResultDelayed) 包住去重區塊)。但延遲重呼叫(慢動作結束後 setTimeout 2100ms)在 setTimeout 內「先把 window._bossKillResultDelayed 設回 false 才呼叫本函式」→ 重呼叫進來時旗標已是 false → 不再被豁免 → 被當「同 ID 重入」直接 return → 結算頁永遠不顯示,只能靠脆弱的 1.2s/5s 兜底救援(競態下常失敗 → 玩家永久卡在戰場結束不了)。修法:重呼叫期間保持 _bossKillResultDelayed=true,讓它同時跳過去重守門與延遲守門(該 if 的 !_bossKillResultDelayed 為 false,不會無限再延遲),通過兩道守門後才統一清回 false → 結算約 2.1 秒穩定顯示。⚠ 通用修正,對所有會觸發擊倒慢動作的 BOSS(九尾空貓怪/杏花妖/大天狗/酒吞童子/玉藻前/八岐大蛇/台灣10王/埃及雙王)皆生效;先前 v3.13.57(battleId 二次判定)/v3.14.0(全滅 watchdog)是治標,本版才是治本。',
      '★ v3.15.15【黑暗球分身排除擊倒慢動作 index.html _isBossForSlowmo】黑暗球本場首次跌破 50% 撕裂 3 個分身,分身由 newHero(boss.name) 生成 → 與本尊同名且 side=p2。舊版 _isBossForSlowmo 只比對名字 → 每打倒一個分身都觸發「擊倒 黑暗球!」慢動作+橫幅(文案錯誤),且讓 window._bossKillSlowmoActive 撐 2 秒,加劇本尊死亡時結算重入的競態。修正:_isBossForSlowmo 開頭加 if(target._isBossClone) return false → 只認非分身的本尊才播擊倒慢動作。(BOSS_CLONE_DEF 中僅黑暗球 cloneCount=3 有同名分身;九尾/杏花妖 cloneCount=0 不受影響。)',
      '★ v3.15.15【checkWin 空值防呆 index.html,adminOnly】冒險主 BOSS 投降判定 G.p2.find(h=>...) / forEach(h=>if(h.curHp>0)) / 全滅 every(h=>h.curHp<=0) 三處補 h && 與 !h ||(對齊 watchdog 既有的 !h || 寫法),防止 G.p2 含 null 時 checkWin 拋例外中斷結算鏈(防禦性硬化;黑暗球分身亡後 G.p2 仍為實體陣列,此為保險)。',
      '★ v3.15.15 註:本輪改動檔 = game_changelog.js(本檔)、index.html(v3.15.14→v3.15.15)。hero_db.js(維持 v3.15.9)/admin_panel.js(維持 v3.15.14)/world-boss.js/world-boss-ui.html/sw.js 未改、版本不動。CURRENT_BOOT_VER 不變。上傳順序:game_changelog.js → index.html(最後)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.14(2026-06-15)— 🔧 登入逾時誤登出修正 + GM 龍王HP救援修正
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.14',
    date: '2026-06-15',
    brief: [
      '🔧✨【BUG 修正】',
      '   ・🚪 修正「<b>明明剛登入卻馬上跳出「逾時 30 分鐘,已自動登出」要重新登入</b>」的問題!現在只要打開遊戲就會從當下重新計時,不會再因為上次玩的時間隔太久而一進來被踢出。',
      '   ・🐉 (GM 後台)修正「龍王 HP 救援」讀不到當前龍王血量的問題。',
    ],
    items: [
      '★ v3.15.14【登入閒置自動登出誤判修正 index.html】_idleAutoLogoutStart 原本(v3.14.7)有「跨 reload 過期檢查」:讀 localStorage[lxps_idle_ts_<uid>](上次活躍時間戳),若距今 ≥ IDLE_TIMEOUT_MS(30 分鐘)→ setTimeout 觸發 _doAutoLogout(stale_session) 立刻登出。問題:此邏輯無法區分「iOS 殺 context 自動重開」與「玩家主動登入」,玩家隔一段時間(下課/午休/隔天)重新登入時,因 localStorage 殘留 30+ 分鐘前的舊時間戳被立刻判「閒置過久」踢出。修正:移除 stale 立刻登出 +「_lastActivityTs=_stored 往前推」分支,改為玩家登入時 localStorage.removeItem 清舊戳記 + _lastActivityTs=_now() 從現在重新計時 30 分鐘。登入後若真的 30 分鐘無操作,計時器(_tick)仍會正常觸發登出,原本的閒置保護不受影響;BOSS 戰中不倒數的保護(_adventureMode && G.round>=1)也不受影響。',
      '★ v3.15.14【GM 龍王HP救援 當前龍王不同步修正 admin_panel.js,adminOnly】_initWbRescueSection 原本寫死 const BOSS_ID=vesuvius_fire_dragon + MAX_HP=5000000。但龍王輪替系統(v3.14.21)當前龍王走 _wbGetCurrentBossId(),維蘇威(首發)早已倒下 HP=0 → GM 救援讀的永遠是維蘇威(已倒下),重讀無效,也無法救援當前活著的龍王。修正:BOSS_ID/MAX_HP 改 let + 新增 _syncCurBoss()(讀 _wbGetCurrentBossId()/_wbGetCurrentBoss() 動態取當前龍王 id/maxHp/name),在 _refreshStatus/_writeHp/寫入按鈕/快捷按鈕 每次操作前呼叫 → 永遠對當前龍王讀寫;狀態列加顯示「🐉 當前龍王:<名稱>」。(8 隻龍王 maxHp 皆 500 萬,快捷鍵 data-hp 不需改。)',
      '★ v3.15.14 註:本輪改動檔 = game_changelog.js(本檔)、admin_panel.js(v3.15.9→v3.15.14)、index.html(v3.15.13→v3.15.14)。hero_db.js/world-boss.js/world-boss-ui.html/sw.js 未改。CURRENT_BOOT_VER 不變。上傳順序:game_changelog.js → admin_panel.js → index.html(最後)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.13(2026-06-15)— 🦁 動物學家爆發/守護強化 + 剋制埃及豔后
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.13',
    date: '2026-06-15',
    brief: [
      '🦁🌊【動物學家 大強化 + 剋制埃及豔后!】',
      '   ・🦅 爆發技「動物大軍」追加效果:<b>呼喚寵物的同時,驅逐敵方全體攜帶的寵物</b>!',
      '   ・🛡️ 「動物守護(S2)」和「動物大軍」的保護現在<b>真正保護能量與物品</b>:被保護的 2 回合內,<b>完全免疫埃及豔后的減能量(蛇瞳魅影、尼羅河詛咒)與強力查封</b>!',
      '   ・🕊️ 召喚寵物時若不想裝備,點「<b>放生</b>」可<b>直接把寵物換成能量</b>(埃及寵物換 5 能量,隊伍能量上限 10)!',
    ],
    items: [
      '★ v3.15.13【動物大軍爆發追加驅逐敵方全體寵物 index.html】execBurst 動物學家分支(AI 路徑 + 玩家路徑)在召喚 4 寵物+保護後、推進回合前新增:遍歷敵方側 filter(curHp>0 && equip) → 每隻 equip.onRemove(若有)+ equip=null + banner「🦁 寵物被驅離!」+ renderCard。AI 路徑插在「動物大軍!呼喚4隻寵物並保護友方」log 前;玩家路徑插在 _showBurstEquipSequence 前。',
      '★ v3.15.13【動物守護/動物大軍 資產保護真正生效 index.html】_assetGuard 原本只設 =2 從未被檢查(動物守護宣稱「保護能量/物品」是空殼)。本輪:(1) nextRound 開頭新增 _assetGuard 逐回合遞減(p1/p2 各 -1,歸 0 刪除),保護期 2 回合。(2) 埃及豔后蛇瞳魅影 startTurn 減 3 能量:_eqGuarded=_assetGuard[對手]>0 → 不減 + log「🦁 守護擋下能量竊取」。(3) 尼羅河詛咒爆發減 6 能量:_nileGuarded 同理。(4) 尼羅河詛咒強力查封(nosell):_assetGuard[對手]>0 → 改 banner「🦁 物品守護」不施加查封。→ 動物守護 S2 + 動物大軍爆發 2 回合內完全免疫埃及豔后減能量/查封。',
      '★ v3.15.13【放生多餘寵物換能量 index.html】_showBurstEquipSequence 的「跳過這件」鈕改為「放生（換 N 能量）」(N=該寵物 EQUIP_DB.sell,埃及寵物=5)。onclick:G.energy[side]=min(10, +sell) + showPopup + log「🕊️ 放生 X,獲得 N 能量」+ sndEnergy + updateUI;能量已滿時 log 提示。解決全隊已滿寵物時多出寵物的去向。',
      '★ v3.15.13 註:動物學家天賦升級視窗(_TRAIT_LV_INFO「動物學家」驅除機率 Lv1~5=50/60/70/80/90%)已於 v3.15.12 完成,本輪沿用(hero_db.js 未改、維持 v3.15.9)。本輪僅改 index.html + game_changelog.js。admin_panel.js/world-boss.js/world-boss-ui.html/sw.js 未改。CURRENT_BOOT_VER 不變。上傳順序:game_changelog.js → index.html。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.12(2026-06-15)— 🦁 動物學家天賦「獸盟」改版 + 埃及 4 寵物獸盟強化
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.12',
    date: '2026-06-15',
    brief: [
      '🦁✨【動物學家天賦「獸盟」大改版!】',
      '   ・🏜️ 動物學家在<b>埃及關</b>使用爆發時,<b>必定召喚埃及的 4 種寵物</b>(荷魯斯之鷹、阿努比斯胡狼、聖䗴神蟲、托特聖䴉)!',
      '   ・⚔️ 天賦「獸盟」更新:不再隨等級提升寵物數值,改成<b>「行動前有機率驅除對手 1 隻攜帶的寵物」</b>(機率隨天賦升級提升,詳見天賦升級視窗)!',
      '   ・💪 只要<b>隊上有動物學家(獸盟生效)</b>,埃及 4 寵物的能力會<b>大幅強化</b>:',
      '   ・　🦅 荷魯斯之鷹:行動 2 次之外,<b>回合開始還會解除自己所有不利狀態</b>!',
      '   ・　🐺 阿努比斯胡狼:普攻命中回 <b>4 能量</b>、目標<b>減療 2 回合</b>!',
      '   ・　🪲 聖䗴神蟲:致命傷<b>以 100% HP 重生</b>、受傷 <b>-40%</b>、休息<b>額外 +2 能量</b>!',
      '   ・　🐦 托特聖䴉:答對幫 HP 最低隊友回 <b>40% HP</b>、主人下個技能 <b>-4 能量</b>!',
    ],
    items: [
      '★ v3.15.12【動物學家在埃及召喚埃及四寵物 index.html】確認:execBurst 動物學家召喚分支用 window._getEquipPoolForStage()(埃及關自動回傳 _stage===egypt 的 4 隻),sort 隨機後 slice(0,4) → 埃及池正好 4 隻 = 必定召喚全部四種。召喚邏輯無需修改,已自動成立。(_getTaiwanEquipPool 僅定義無使用,不影響。)',
      '★ v3.15.12【動物學家天賦移除隨等級 + 改驅除對手寵物 index.html】(1) getCraftsmanBonus(side):移除「2 + _tl*0.1」(舊版 Lv0=2.0~Lv5=2.5 隨等級遞增),改固定 return 2(友方寵物效果固定 +100%);台灣/日本寵物效果改固定 ×2。(2) startTurn 行動者(next)hook 區(荷魯斯獸盟淨化 hook 之前)新增:next.name===動物學家 && curHp>0 && !confused → _zlChance=min(0.90, 0.50 + _getTraitLv(動物學家)*0.10)(顯示 Lv1~5=50/60/70/80/90%)→ Math.random()<_zlChance → 從對手側 filter(curHp>0 && equip) 隨機選 1 隻 → 該英雄 equip.onRemove(若有)+ equip=null + banner + renderCard。',
      '★ v3.15.12【動物學家圖鑑天賦說明去數字 hero_db.js,鐵律1.160】HERO_TRAIT[動物學家] desc=「自己存活時友方寵物效果提升;行動前有機率驅除對手1隻寵物」、fd=「…效果提升 100%;且每次行動前有機率驅除隨機 1 名對手攜帶的寵物(驅除機率隨天賦升級提升,詳見升級視窗)」。不寫任何「每升X%/LvN/50~90」數字。',
      '★ v3.15.12【動物學家天賦升級視窗逐級 hero_db.js】_TRAIT_LV_INFO 新增「動物學家」:{base:50%驅除, bonus:+10%/天賦級, max:90%（Lv5）, effect:行動前驅除對手1隻寵物的機率}。_showTraitLvPopup 解析 base+bonus → Lv1(i=0)=50、Lv2=60、Lv3=70、Lv4=80、Lv5(i=4)=90;isProbability(base含%+effect含「機率」)→ cap 100。與 hook 機率(traitLv 0~4 → 50~90%)對應。',
      '★ v3.15.12【獸盟(動物學家在場)強化 4 埃及寵物 index.html】判斷一律用二元 getCraftsmanBonus(side)>1(動物學家存活且非confused)。(a)荷魯斯:startTurn 主人裝備荷魯斯 + 獸盟 → _clairClearAllBad(next) 解除所有不利(含強力版)+ banner。(b)阿努比斯 execAtk:_beastA → 4 能量/減療 2 回合,基礎 2/1。(c)聖䗴 onDmg:移除屬性式 dmgReducePct,改 onDmg 內二元減傷(_beastS?40%:20%)+ 致命傷重生(_beastS?100%:50%);doRest:_beastRest → +2,基礎 +1。(d)托特 advShowReward:_beastT(以 p1 是否有動物學家)→ 回 40%,基礎 20%;每主人記 _thothBeast,skillCost 折扣 c-(_thothBeast?4:2)、max(1,..)。',
      '★ v3.15.12【EQUIP_DB 4 寵物 d 文字補獸盟強化說明 index.html】4 隻 d 末段加「獸盟（隊上有動物學家）強化為…」對應數值(荷魯斯加解除不利、阿努比斯 4 能量/減療2、聖䗴 100%/-40%/+2、托特 40%/-4),讓玩家於寵物詳情了解強化效果。',
      '★ v3.15.12 註:本輪改動檔 = game_changelog.js(本檔)、hero_db.js(HERO_TRAIT+_TRAIT_LV_INFO,v3.15.8→v3.15.9)、index.html(getCraftsmanBonus+startTurn驅除/荷魯斯淨化 hook+4寵物獸盟強化+d文字,→v3.15.12)。admin_panel.js/world-boss.js/world-boss-ui.html/sw.js 未改。CURRENT_BOOT_VER 不變。⚠ 4 張寵物圖仍需上傳。上傳順序:game_changelog.js → hero_db.js → index.html(最後)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.11(2026-06-15)— 🐾 埃及 4 隻寵物能力重新修正
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.11',
    date: '2026-06-15',
    brief: [
      '🐾✨【埃及 4 隻寵物能力大改版!】',
      '   ・根據實際遊玩,把 4 隻埃及寵物的能力重新調整,讓牠們更實用、更有特色!',
      '   ・🦅 <b>荷魯斯之鷹</b>:主人的<b>「行動」變成 2 次</b>(普攻、技能、休息都能做兩次)!且<b>不會再被其他「再行動」效果疊加</b>,穩定強力。',
      '   ・🐺 <b>阿努比斯胡狼</b>:主人<b>普通攻擊命中敵人時,恢復 2 能量</b>,並讓<b>目標「減療」1 回合</b>(被打的敵人受到的治療減半)!',
      '   ・🪲 <b>聖䗴神蟲</b>:保留<b>致命傷 50% 重生</b>(每場一次)+<b>受傷 -20%</b>,再加上<b>休息時額外恢復 1 能量</b>!',
      '   ・🐦 <b>托特聖䴉</b>:<b>答對題目時,幫「HP 最低的隊友」恢復 20% HP</b>,而且<b>主人下一個技能能量 -2</b>!',
    ],
    items: [
      '★ v3.15.11【荷魯斯之鷹 改為「行動變 2 次」index.html】移除 v3.15.10 的 execAtk 普攻雙擊+必中 hook;改在 endAction 的女神權能 hook 之前新增荷魯斯再行動 hook:!noFinish && a.curHp>0 && !a._traitReAct && (a._reActCount||0)<1 && getEquip(a).petHorusDoubleAtk → _reActCount++ + _traitReAct=true + _pSetTimeout 400ms 後 acted=false 重開行動(p1 顯示 action-panel / AI 走 aiAct)。機制沿用劍士連斬/女神權能。放女神 hook 之前 → 荷魯斯主人優先用自身再行動;_reActCount<1 守門保證整回合最多 2 動作(故「不受其他再行動效果疊加」)。涵蓋普攻/技能/休息所有行動。',
      '★ v3.15.11【阿努比斯胡狼 改為「普攻命中回能+減療」index.html】移除 v3.15.10 的 doDmg 致死 on-kill 全隊回血 hook;改在 execAtk doDmg 之後新增:target && target.side!==actor.side && getEquip(actor).petAnubisOnAtk → G.energy[actor.side]+2(cap10,showPopup +2E)+ target.curHp>0 時 addStatus(target,healReduced,1)(減療=既有狀態,線上 doHeal hook 自動×0.5)+ banner。旗標 petAnubisOnKill → petAnubisOnAtk。',
      '★ v3.15.11【聖䗴神蟲 加「休息額外+1能量」index.html】保留 onDmg 致命傷 50% 重生(_scarabRevived 每場一次)+ dmgReducePct:0.20。新增屬性旗標 petScarabRestEnergy:true;doRest 在「G.energy[a.side]=min(10,+1)」後新增:getEquip(a).petScarabRestEnergy → G.energy[a.side] 再 +1(cap10,showPopup +1E)。',
      '★ v3.15.11【托特聖䴉 改為「答對救援+省能2」index.html】advShowReward hook 改寫:篩出 G.p1 中裝備 petThothQuiz 的存活主人;若有 → 取全隊存活者 HP 比例(curHp/hp)最低者 doHeal 其 maxHP 20% + banner;每位主人設 _thothDiscount=true。skillCost 確定性折扣由 c-1 改 c-2(actor._thothDiscount → c=max(1,c-2),!displayOnly 才清旗標)。(原:主人自身回 12% + 下技能 -1。)',
      '★ v3.15.11【EQUIP_DB 4 寵物 d 文字 + 旗標 + _EQUIP_SHORT 同步 index.html】荷魯斯 d=「行動次數變為 2 次(不會受到其他再行動效果疊加)」、阿努比斯 d=「普攻命中敵人時恢復 2 能量並使目標減療 1 回合」+ 旗標 petAnubisOnAtk、聖䗴 d 末加「休息時額外恢復 1 能量」+ 旗標 petScarabRestEnergy、托特 d=「答對幫 HP 比例最低隊友回 20% + 主人下技能 -2」。_EQUIP_SHORT:行動2次 / 重生+減傷+休息能量 / 攻擊回能+減療 / 答對救援+省能。PET_KNOWLEDGE 科普(真實動物)不受能力改動影響,未改。',
      '★ v3.15.11 註:本輪改動檔 = game_changelog.js(本檔)、index.html。hero_db.js / admin_panel.js / world-boss.js / world-boss-ui.html / sw.js 未改、版本不動。CURRENT_BOOT_VER 不變。⚠ 4 張寵物圖(荷魯斯之鷹 / 聖䗴神蟲 / 阿努比斯胡狼 / 托特聖䴉.png)仍需老師上傳。上傳順序:game_changelog.js → index.html(最後)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.10(2026-06-15)— 🐾 埃及 4 隻全新寵物 + 📚 埃及知識預習頁
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.10',
    date: '2026-06-15',
    brief: [
      '🎉🏜️🐾【埃及寵物登場 ＋ 埃及知識預習】',
      '🐾【埃及四隻全新寵物現身埃及關!】',
      '   ・在<b>埃及冒險</b>途中答對野生動物的問題,就有機會收服 <b>4 隻全新的埃及神獸寵物</b>,每一隻都有<b>和台灣 / 日本完全不同的特殊能力</b>!',
      '   ・🦅 <b>荷魯斯之鷹</b>:主人的<b>普通攻擊變成連續攻擊 2 次,而且必中</b>(無視敵人迴避)!',
      '   ・🪲 <b>聖䗴神蟲</b>(聖甲蟲):主人<b>受到致命傷害時會以 50% HP 重生</b>(每場戰鬥一次);平時<b>受到的傷害也 -20%</b>。',
      '   ・🐺 <b>阿努比斯胡狼</b>:每當主人<b>擊倒敵人,全隊回復 10% HP 並補充 1 能量</b>!',
      '   ・🐦 <b>托特聖䴉</b>:每次<b>答對題目,主人回復 12% HP,而且下一個技能能量 -1</b>!',
      '   ・<b>寵物圖鑑</b>新增「🏜️ 埃及寵物」專區,收服後可查看牠們的<b>神話故事與生態科普</b>。',
      '📚【埃及關也能「知識預習」了!】',
      '   ・<b>埃及關的關卡介紹頁新增「📚 知識預習」按鈕</b>!出發前可先讀<b>古埃及小百科</b>(尼羅河、法老、眾神、金字塔、神聖動物 5 大主題),還能<b>練習埃及題目</b>、領知識幣。',
      '   ・先預習再冒險,打 BOSS 答題更有把握喔!',
    ],
    items: [
      '★ v3.15.10【埃及寵物 — EQUIP_DB 4 隻全新能力 index.html】在日本寵物 IIFE 後、_getEquipPoolForStage 前新增埃及寵物 IIFE,push 4 entry(_stage:egypt):荷魯斯之鷹(petHorusDoubleAtk)、聖䗴神蟲(dmgReducePct:0.20 + onDmg 致命傷以 50%HP 重生、_scarabRevived 每場一次)、阿努比斯胡狼(petAnubisOnKill)、托特聖䴉(petThothQuiz);petImg 用 EG_BASE + encodeURIComponent(中文檔名)。同步 EQUIP_NAMES.add + _EQUIP_SHORT 4 短描述。能力全為全新設計,未複製台灣/日本寵物(台灣是 onEquip 屬性%/healBonus/reflect/energyRegen 那套)。',
      '★ v3.15.10【埃及寵物池 index.html _getEquipPoolForStage / _getTaiwanEquipPool】_getEquipPoolForStage 在 japan 分支後加 egypt 分支(inAdv && stage===egypt → filter _stage===egypt);else 與動物學家專用池改為排除 japan+egypt(_stage!==japan && _stage!==egypt),確保非埃及關不會抽到埃及寵物。敵方野生寵物 advTgEvent_petEncounter 用 _getEquipPoolForStage(),自動依埃及池抽取,無需另改。',
      '★ v3.15.10【荷魯斯之鷹 hook — execAtk index.html】普攻 doDmg(target,_finalDmg,…) 處:doDmg 前判 getEquip(actor).petHorusDoubleAtk(!opts._horus2nd 守門)→ _atkOptsH.mustHit=true(必中無視迴避);doDmg 後若 target 存活 → _pSetTimeout 260ms 後 execAtk(actor,target,actor.atk,{_horus2nd:true,mustHit:true}) 打第二擊(走完整普攻流程含特效;_horus2nd 旗標防無限遞迴)。',
      '★ v3.15.10【阿努比斯胡狼 hook — doDmg 致死 index.html】「💀 倒下」log 後(old>0 守門防重複):若 opts.actor(擊殺者,side≠target.side)裝備 petAnubisOnKill → 該側全隊存活者各 doHeal 10% maxHP + G.energy[側]+1(cap 10)+ banner。沿用 doHeal/showPopup,通用於冒險/世界BOSS/鬥技場。',
      '★ v3.15.10【托特聖䴉 hook — advShowReward + skillCost index.html】(1) advShowReward 開頭(答對題顯示獎勵時):遍歷 G.p1 存活者,裝備 petThothQuiz 者 doHeal 12% maxHP + 設 h._thothDiscount=true + banner。(2) skillCost 在 skillCostSave 區塊後新增確定性折扣:actor._thothDiscount → c=max(1,c-1),!displayOnly 時才清旗標(UI 顯示也套用,實際使用才消耗)。',
      '★ v3.15.10【埃及寵物科普 + 圖鑑分區 index.html】PET_KNOWLEDGE 在日本「變化狸」後加 4 埃及 entry(神話+真實動物混合:sci/alias/region/food/enemy/habit/reproduce)。_buildPetPage 加 egPets=filter(_stage===egypt)+collectedEg,el.innerHTML 末尾加 renderSection(「🏜️ 埃及寵物」,#ffd86b,egPets,collectedEg)。',
      '★ v3.15.10【埃及知識預習 index.html】新增 EGYPT_PREVIEW_CONTENT(TAIWAN_PREVIEW_CONTENT 後;intro + 5 sections:尼羅河與沙漠/法老與古文明/眾神與神話/金字塔與木乃伊/沙漠神聖動物,每章 3 paragraphs(含<b>)+ 6~7 facts)。_showPreviewPage 接 egypt:stage 正規化允許 egypt、題庫 ADV_QUIZ_DB.filter(subject===埃及)、stageLabel/Color/Icon(古埃及/#ffd86b/🏜️)、contentData/coins/seenSet/todayKey×2 皆加埃及分支。_previewMarkSeen + _previewCheckDailyReset + _medalStats 加 previewEgSeen / previewTodayEgCoins。關卡介紹頁預習按鈕顯示條件加 key===egypt(標籤「🏜️ 埃及關」)。',
      '★ v3.15.10 註:本輪改動檔 = game_changelog.js(本檔)、index.html(埃及寵物資料+4 能力 hook+寵物圖鑑/科普埃及分區+埃及知識預習頁與接線)。hero_db.js / admin_panel.js / world-boss.js / world-boss-ui.html / sw.js 本輪未改、版本不動。CURRENT_BOOT_VER 不變。⚠ 老師需另上傳 4 張寵物圖:荷魯斯之鷹.png / 聖䗴神蟲.png / 阿努比斯胡狼.png / 托特聖䴉.png(否則寵物缺圖但功能正常)。上傳順序:game_changelog.js → index.html(最後)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.9(2026-06-14)— 🐉 龍王名稱即時校正 + 🏜️ 埃及小怪題庫修正 + 👑 埃及雙王開場白 + 🌙 伺服器休息/開機排程
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.9',
    date: '2026-06-14',
    brief: [
      '🎉🏜️【埃及關正式開放!】',
      '   ・<b>環遊世界冒險第二站「古埃及」正式對全體開放!</b>當你有<b>4 名英雄達到 Lv.25</b>,就能踏入金字塔,挑戰守護寶藏的法老王與埃及豔后雙王!',
      '⚔️【埃及雙王戰修正】',
      '   ・修正打倒雙王後<b>結算、升級完卻沒回首頁、反而又自動重開一場全新雙王戰</b>的嚴重問題;現在會正常結算並回到關卡。',
      '   ・修正<b>豔后/法老沒有「立刻」復活對方</b>的問題:現在一王倒下,另一王會<b>立刻</b>耗自身生命把它救回(復活到 25% HP)。<b>唯有用一次攻擊同時把雙王打倒才能真正獲勝</b>——記得帶足全體爆發喔!',
      '🌟【答題獎勵「淨化光芒 / 破滅吹拂」強化】',
      '   ・答對題目的<b>「淨化光芒」現在能清除「強力版」不利狀態</b>(強力查封、強力失明、魅惑、暈眩等限制行動的狀態),不再被雙王的強力封鎖卡死。',
      '   ・<b>「破滅吹拂」現在能完整清除對手的無敵、迴避、減傷、免死等有利狀態(含強力版)</b>。',
      '🐉【龍王名稱顯示修正】',
      '   ・修正關卡頁的世界 BOSS<b>一進去會先顯示「火山炎龍王」、切換畫面回來才變成真正龍王</b>的問題。現在<b>一進關卡頁就直接顯示目前真正開放挑戰的龍王名稱</b>,不會再誤導大家囉!',
      '🏜️【埃及關修正】',
      '   ・修正<b>埃及關打小怪時,題目沒有換成埃及題庫</b>(原本會出到自然科題目)的問題;現在埃及小怪戰會<b>正確出埃及主題的題目</b>。(BOSS 戰原本就正常。)',
      '   ・埃及雙王 BOSS 戰的<b>開場白換成「法老王 + 埃及豔后」的專屬登場台詞</b>,更有古埃及氣氛!',
      '🌙【新增:伺服器休息 / 開機時間】',
      '   ・老師可以設定伺服器的<b>每日休息時間</b>(例如晚上)和<b>開機時間</b>(例如早上)。',
      '   ・時間一到休息,遊戲會<b>先自動幫你存檔</b>,再顯示<b>「休息中」的夜空畫面</b>(上面會倒數距離開機還有多久);<b>開機時間一到會自動回到遊戲</b>,不用自己重整。',
      '   ・💡 看到休息畫面別擔心,先去<b>睡覺、看書或運動一下</b>,等天亮(開機時間)再回來玩吧!休息前還會<b>提前提醒</b>你把這場打完並同步進度喔。',
    ],
    items: [
      '★ v3.15.9【龍王名稱即時校正 index.html】根因:關卡頁入口 .wb-curboss-nm 寫死預設「火山炎龍王」,校正函式 _wbApplyCurrentBossSkin 定義在「點按鈕才 lazy load」的 world-boss-ui.html(L119197),初次進關卡頁時尚未注入 → stats/global 的 worldBossHp onSnapshot(L11197 區)那句 skin 呼叫被 typeof===「function」 守門擋成 no-op → 名稱停在火山,要切畫面回來(觸發後續 skin)才修正。修法:在該 onSnapshot 設好 _cachedGlobalStats.wbCurrentBossId 後,改用「啟動即定義」的 eager 函式 _wbGetCurrentBoss()(world-boss.js)直接 querySelectorAll(.wb-curboss-nm) 更新 textContent,首次 snapshot 一回來就立刻顯示真正開放龍王;原 _wbApplyCurrentBossSkin 呼叫保留(載入後仍負責立繪/背景/HP 條等完整換皮)。',
      '★ v3.15.9【埃及小怪戰題庫修正 index.html _advMiniGetQuizPool】根因:小怪戰出題走 _advMiniQuizAsk → _advMiniGetQuizPool(與 BOSS 戰的 advGetQuizPool 不同路徑),函式開頭 subject = _advPlayerSubject || 「自然」;過場 advStartCutscene 會把 _advPlayerSubject 清空,而本函式只有日本/台灣有「|| _adventureStage===egypt」這類分支、獨缺埃及 → 埃及小怪掉到最末段 ADV_QUIZ_DB.filter(subject===「自然」) 出自然題。(v3.15.2 只修了 BOSS 戰的 _advSessionQuestions。)修法:比照日本關,在 Japan 分支後、最末 fallback 前補埃及分支:subject===「埃及」 或 _adventureStage===「egypt」 → 取 ADV_QUIZ_DB 埃及 30 題,_miniQuizUsedIds 去重 + _filterPersistentMini(…,「埃及」)。',
      '★ v3.15.9【埃及雙王 BOSS 開場白 index.html getAdvBossIntroLines + advShowBossIntro】根因:兩函式判斷主 BOSS 名時,埃及雙王(法老王/埃及豔后)不在 japan/taiwan/木柵 的偵測清單 → getAdvBossIntroLines 落到 fallback 九尾空貓怪、advShowBossIntro 落到 🐱 預設。修法:(1) getAdvBossIntroLines 在台灣偵測後、_mainBossName fallback 前加埃及偵測(_adventureStage===「egypt」 且 G.p2 含法老王/埃及豔后 → 指定該名);並在 _TW_BOSS_INTROS 之後加 _EGYPT_BOSS_INTROS(法老王/埃及豔后兩 key 指向同一段 3 行雙王對白:法老王自石棺甦醒→豔后自王座起身接話→兩王以尼羅河+黃沙立誓)。(2) advShowBossIntro 在 _mainBoss fallback 前加埃及偵測 → _mainBoss={name:「法老王 & 埃及豔后」, _egyptDual:true},icon 解析加 _egyptDual → 👑。',
      '★ v3.15.9【伺服器休息/開機排程 — 後端 index.html(firebase IIFE 內)】新增 window._fbGetRestSchedule()(讀 gameConfig/restSchedule,失敗保守回 {enabled:false} 避免誤鎖)+ window._fbWatchRestSchedule(callback)(onSnapshot,同維修 _fbWatchMaintenance 模式)。儲存於 gameConfig/restSchedule { enabled, startHHMM, endHHMM, warnMin, restMessage, warnMessage, updatedAt, updatedBy };gameConfig = GM-only 寫 / 登入可讀(同 arenaSwitch),不需改 firestore.rules、無安全漏洞;與維修模式(stats/global.maintenance)各自獨立。',
      '★ v3.15.9【伺服器休息/開機排程 — 客戶端 index.html】純函式 _restEvalState(schedule, now) 用 minutes-of-day(0-1439)circular 判 open/warn/rest(跨夜 startMin>endMin 用「nowMin>=start 或 nowMin<end」;start==end 或格式無效一律視為 open 防 24h 鎖死;回傳 bootAtMs=下一個 endMin 的實際時鐘時刻)。_showRestOverlay 夜空主題獨立 #restOverlay(z-index 999998,與 #_maint-overlay 不同),含 1 秒倒數;歸零 → 鎖 _restBootingNow → 顯示「☀️ 早安!」→ 3 秒後 location.reload()(決策3)。_showRestWarnBanner 提前預告 banner(localStorage 當日 key 去重,14 秒自動關)。_startRestScheduleWatcher:_fbWatchRestSchedule onSnapshot + 本機 20 秒 ticker(抓時鐘跨點但雲端沒變)共同呼叫 _restApply。_restApply:管理員(_REST_DEV_EMAILS)永不受限(隱藏 overlay);rest 狀態首次進入先 _lxpsInstantPersist 存檔(決策2:先存後擋)再蓋 overlay;warn 跳 banner;open 收 overlay。DOM ready 後 2.6 秒自動啟動 watcher。',
      '★ v3.15.9【伺服器休息/開機排程 — 登入閘 index.html onAuth】維修閘之後、停權檢查之前,加非管理員休息閘:await _fbGetRestSchedule → _restEvalState === rest → 先 gameCloudSave → _fbSignOut → _showRestOverlay 後 return(同維修「先存後擋」);讀失敗一律放行避免誤鎖。',
      '★ v3.15.9【伺服器休息/開機排程 — GM 後台 admin_panel.js】系統管理群組、維修模式下方新增「🌙 伺服器休息/開機排程」卡片(鐵律 1.47 三同步:#_admin-restsched-section div HTML + SIDEBAR_ITEMS 一筆 + SIDEBAR_GROUPS「🛠 系統管理」加入)。欄位:休息開始(input time)/開機(input time)/提前預告分鐘(number,預設10)/休息畫面訊息/預告訊息 + 載入/啟用/停用鈕。handler _initRestScheduleSection 比照 arenaSwitch 用 window._fbFns + window._fbDb 讀寫 gameConfig/restSchedule;啟用前嚴驗 HH:MM 格式 + 開始≠開機(防 24h 鎖死)。ADMIN_PANEL_VERSION v3.15.6→v3.15.9。',
      '★ v3.15.9【埃及雙王 BUG1 甲:即時互救】index.html checkWin 開頭(我方全滅判負後、主BOSS投降清單前)新增埃及雙王互救:_adventureStage===egypt 且 G.p2 含法老王+埃及豔后,偵測「一王 curHp≤0、另一王存活」→ 存活者立刻耗自身最大 HP 5%、復活倒下者至最大 HP 25%(沿用 startTurn 既有耗血/復活量)後「不 return」續跑(此時兩王皆活,下方 G.p2.every 全滅=false→回 false 戰鬥繼續)→ 玩家「打死一王」當下即見復活,不必等下一個 startTurn。雙王同時 HP≤0 則不互救 → 落到全滅判定走正規勝利。startTurn 既有互救 hook 保留兜底(冪等)。',
      '★ v3.15.9【埃及雙王 BUG2 乙:勝利誤判重開 根因修復】index.html checkWin「G.p2.every(curHp≤0) 全滅」分支內的 BOSS 防呆,原用「各自維護、漏了雙王」的硬編碼 _BOSS_SET 判 _hasBoss → 兩王同時擊殺時 _hasBoss=false → 觸發防呆強制 _advMiniBattleActive=true + advFinishMiniBattle(true)(小怪戰結算)→ 推進 scene 重新生成滿血(11500/10500)雙王戰(老師回報「升級完又重開全新雙王」;玩家 G 快照雙王滿血、round 13、豔后 acted=true 佐證)。改用單一真相來源 _ZEUS_TRUE_BOSSES(鐵律 1.135;已含全部 BOSS + 雙王)判 _hasBoss,fallback 保守視為有 BOSS。修後兩王同時擊殺 → _hasBoss=true → 跳過防呆 → 走既有 _showResultWithDrama(true)(與日本/台灣關完全相同的 BOSS 勝利路徑:回首頁、發 BOSS 獎勵、跑雙王 S 評價收服)。',
      '★ v3.15.9【答題獎勵 淨化光芒(cleanse)清友方含強力版】index.html advApplyReward id===cleanse:原 clearBadStatus 故意保留 strongTaunt/_youyouNightmare/s._strong(強力版)→ 對雙王的強力查封(nosell _strong)/強力失明(forecast _strong)束手無策。改用 _clairClearAllBad(只看狀態 type、不看 _strong 旗標,並 _restoreStatDebuffOnRemove 還原數值類 debuff),一併清掉 stun/charm/nosell/forecast 等限制行動的不利(含強力版)。',
      '★ v3.15.9【答題獎勵 破滅吹拂(remove_buff)清敵方含強力版 + status 免疫類】index.html advApplyReward id===remove_buff:原僅 t.buffs=[](雖已含 immune/shield/evasion/halfDmg/deathimmune/dmgup 等強力有利 buff),但 statusImmune/ctrlImmune 等是用 addStatus 掛在 status 陣列 → 清 buffs 漏掉、敵方仍免疫不利。新增「再濾掉 status 裡的有利免疫類」(_GOOD_IMMUNE_STATUS=[statusImmune,ctrlImmune,badimmune,magicImmune,deathimmune,immune,evasion]),只移除明確有利免疫類、不動敵方其他不利狀態。',
      '★ v3.15.9【埃及關正式對全體開放】index.html _egyptTrySelect:把 v3.15.0「僅管理員測試」閘門(非管理員一律 _egyptShowComingSoon)改為比照台灣關的「4 名英雄達 Lv.25」解鎖(管理員仍可跳過);未達標顯示既有 _egyptShowLockedModal 解鎖進度視窗。_egyptShowComingSoon 保留定義但不再被呼叫(無孤兒參照)。',
      '★ v3.15.9 註:本輪改動檔 = game_changelog.js(本檔)、admin_panel.js(休息排程卡片,v3.15.6→v3.15.9)、index.html(龍王名稱/埃及小怪題庫/埃及雙王開場白/伺服器休息排程/埃及雙王 BUG1甲+BUG2乙/答題獎勵 cleanse+remove_buff 強化/埃及關開放)。hero_db.js / world-boss.js / world-boss-ui.html / main.css / sw.js 本輪未改、版本不動。CURRENT_BOOT_VER 不變。上傳順序:game_changelog.js → admin_panel.js → index.html(最後)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.8(2026-06-14)— 🧹 首頁工具列精簡 + 📖 圖鑑天賦/爆發說明與升級視窗分離 + 👑 法老王技能強化 + 🐍 埃及豔后天賦/爆發改版
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.8',
    date: '2026-06-14',
    brief: [
      '🧹【首頁更清爽 + 關卡視窗變高】',
      '   ・移除了「檢查我的進度」與「檢查遊戲版本」兩顆按鈕。<b>「立即同步雲端」現在按下去會先自動幫你檢查是不是最新版本,再上傳進度</b>(偵測到新版本會在同步完成後提醒你更新;不管版本新舊,<b>進度一定會先存起來</b>,不用擔心)。',
      '   ・「立即同步雲端 / 卡死或 BUG 回報 / 遊戲指引」三顆按鈕<b>並排成一行</b>,商店往下靠近;這樣<b>關卡選擇視窗變得更高</b>,滑動點擊更輕鬆。',
      '👑【法老王 技能強化】',
      '   ・S1<b>「王權法杖」</b>:原本的「擊退行動條」改為更強的<b>「暈眩、無法行動 1 回合」</b>。',
      '   ・S2<b>「黃沙風暴」</b>:在原本的全體傷害+減速之外,<b>追加「失明 2 回合」</b>(失明會讓對手行動成功率減半)。',
      '🐍【埃及豔后 天賦與爆發改版】',
      '   ・天賦<b>「蛇瞳魅影」新增效果</b>:輪到豔后行動時,有機率<b>使對手減少 3 能量</b>(天賦越高機率越高)。',
      '   ・爆發<b>「尼羅河的詛咒」改版</b>:傷害屬性改為<b>水屬性</b>,並<b>使對手減少 6 能量 + 全體強力查封物品 2 回合</b>(查封改為必中)。',
      '📖【英雄圖鑑說明整理】',
      '   ・法老王、埃及豔后的天賦與爆發說明<b>不再寫一堆升級數字</b>;升級後的實際數值改到<b>「天賦升級視窗 / 爆發升級欄位」逐級顯示</b>,看起來更清楚。(神槍手、風術士、朱玥、小鬼貓與兔等也一併整理。)',
      '   ・💡 提醒:埃及雙王 BOSS 戰會因為法老王/豔后也使用上述新技能與天賦而<b>變得更有挑戰性</b>,記得帶好隊伍喔!',
    ],
    items: [
      '★ v3.15.8【首頁工具列精簡 index.html #adv-bottom-tools】移除 adv-manual-check-btn(檢查我的進度;GM 後台已有同功能)與 adv-version-check-btn(檢查遊戲版本),連同三顆「?」說明鈕與同步鈕的「?」一併移除;遊戲指引由獨立整列移入與「立即同步雲端/卡死回報」並列一行(三鈕 flex:1、字級 clamp(14,1.7,21))。商店維持整列在上。被移除按鈕的 onclick 函式(_manualCheckCloudVsLocal/_manualCheckGameVersion/_showVersionCheckHelp/_showManualCheckHelp/_showManualCloudSyncHelp)保留定義(console/GM 可呼叫,無孤兒參照)。',
      '★ v3.15.8【關卡視窗自動加高,不動 main.css】#adv-left-panel 為 flex column、#adv-stage-list-wrap/#adv-stage-list-area 為 flex:1 1 0、#adv-bottom-tools 為 flex-shrink:0(只佔內容高);底部由 4 列縮為 2 列(商店 + 三鈕)後,關卡視窗自動長高。版面 CSS 全在 main.css(未改、維持 v3.14.5)。',
      '★ v3.15.8【版本檢查整併進同步 _manualCloudSync】同步前做「輕量」版本比對(fetch location.pathname?_syncVerChk=,_lxpsParseFileVersions 解析伺服器 _LXPS_FILE_VERSIONS + regex 抓 _GAME_LOADED_VERSION,與本地逐檔比對)。★資料安全優先:無論版本是否最新,gameCloudSave 一律照常執行(絕不因版本舊而擋存檔);fetch 失敗則靜默略過版本檢查直接同步。同步成功後若偵測到差異 → 既有 _showVersionCheckResultDialog(更新提示);否則顯示「已是最新版」。不跑原本的逐檔動畫 modal(那留給 console 的 _manualCheckGameVersion)。',
      '★ v3.15.8【法老王 S1 王權法杖】index.html handler:移除「擊退行動條」(原 addStatus spddown 1) → 改 addStatus(t,\'stun\',1)「暈眩無法行動 1 回合」+ banner 暈眩。hero_db.js s1 d/fd 同步改寫(去擊退、寫暈眩)。',
      '★ v3.15.8【法老王 S2 黃沙風暴】index.html handler:全體在原 spddown 2 之外追加 addStatus(e,\'forecast\',2)「失明 2 回合」(forecast=失明,行動成功率減半)+ banner 失明 + log 補述。hero_db.js s2 d/fd 同步追加失明 2 回合。',
      '★ v3.15.8【埃及豔后 天賦 蛇瞳魅影 新增「回合開始減能量」】index.html 回合開始 hook(緊接法老威儀疊層 hook 之後,nextRound 前的 startTurn 區):next.name===\'埃及豔后\' 時擲機率(BOSS版 isEgyptBoss 固定 0.5;招募版 Math.min(0.90, 0.5 + _getTraitLv×0.10) = 50%→90%,每級 +10%),命中則 G.energy[對手 side]=Math.max(0, -3)(能量為隊伍共用池)+ showPopup -3E + sndEnergy + log/banner。★鐵律 1.160:此升級機率「不寫進天賦說明」,只登錄 _TRAIT_LV_INFO 升級視窗。',
      '★ v3.15.8【埃及豔后 爆發 尼羅河的詛咒 改版】index.html _runBurst handler:屬性 dark→\'water\'(doDmg element:\'water\';BURST_ELEM 屬性表 尼羅河的詛咒 dark→water);新增「使對手隊伍減少 6 能量」(G.energy[_opp] -6,固定不隨等級,一次性)+ showPopup -6E + sndEnergy;強力查封物品由「50%~70% 機率」改為「必中」(移除 _sealChance 擲骰,全體必上 nosell _strong dur:2);傷害仍隨爆發等級 spv×200%×_burstMult(200%→280%)。banner/flash 改水藍色。',
      '★ v3.15.8【圖鑑說明 vs 升級視窗分離(鐵律 1.160,老師反覆強調)】依鐵律把升級數字一律移出說明、改進升級視窗逐級顯示。本輪處理:(法老王)HERO_TRAIT 法老威儀 desc/fd 去「天賦每升1級此機率-5%(Lv5僅30%)」、BURST_DB 太陽神的審判 d/fd 去「爆發每強化1級恢復量+5%,Lv4達45%」;補 _TRAIT_LV_INFO 法老王(以「保住威儀機率 50%→70%」正向框架呈現,避開 _showTraitLvPopup 解析器不支援遞減 bonus 的限制)+ BURST_UPGRADE_DEF 法老王(逐級 900%→1260% + 復活25% + 回HP 25%→45%)。(埃及豔后)HERO_TRAIT/BURST_DB 同步去升級語言;_TRAIT_LV_INFO 埃及豔后以「減能量機率 50%→90%(+10%/級)」為主顯示、effect 同時敘述魅惑 50%→70%(+5%/級);BURST_UPGRADE_DEF 埃及豔后逐級 200%→280% 水屬性+減6能量+強力查封(必中)。',
      '★ v3.15.8【全英雄圖鑑天賦/爆發說明稽核】爆發(主 90 隻)經掃描 0 多寫(鐵律 1.28 執行良好)。天賦多寫順修 4 隻(desc/fd 內嵌升級數字、但 _TRAIT_LV_INFO 皆已存在 → 移除重複安全):神槍手(fd 去「Lv1+3/.../Lv5+15」、_TRAIT_LV_INFO effect 修正速度「+3永久」→「+3~+15 隨天賦」)、風術士(fd 去「+6%~+14%/15%~35%(隨天賦等級)」)、魔界花使‧朱玥(desc/fd 去「每升1級+2%/名,Lv5達12%/名」)、小鬼貓與兔(desc/fd 去「每升1級+5%,Lv5達45%」)。天賦漏寫補 1 隻:學霸(轉學生)實作 _scProc=0.40+_scTl×0.05(機率 40%→60% 隨天賦)卻無 _TRAIT_LV_INFO → 補登。米鈴為誤報(「(隨機」非「隨天賦」);其餘 11 隻漏寫候選皆 BOSS/小怪固定天賦(0 次 _getTraitLv),正確無條目。',
      '★ v3.15.8 註:本檔(game_changelog.js / index.html)已累積含 v3.15.7/v3.15.6/v3.15.5 全部變更;hero_db.js 本輪有改(法老王/豔后 技能·天賦·爆發說明 + 稽核順修),破快取字串 v3.15.5→v3.15.8。admin_panel.js 本輪未改、維持 v3.15.6,不需重新上傳。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.7(2026-06-14)— 🎵 埃及關小怪戰 BGM 兩首輪播修正(開場觸發點)+ admin_panel.js 破快取字串補跟
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.7',
    date: '2026-06-14',
    brief: [
      '🎵【埃及關小怪戰 BGM 修正】',
      '   ・修正埃及關打小怪時,背景音樂沒有照原本設計<b>兩首輪流播放</b>的問題。現在每打一場小怪戰會<b>交替播放</b>兩首專屬小怪戰 BGM,而且同一場戰鬥中<b>不會中途換歌</b>。',
    ],
    items: [
      '★ v3.15.7 埃及小怪戰 BGM 開場觸發修正(index.html advStartMiniBattle 一般小怪 else 分支,約 L107541):原本寫死 bgmFadeTo(bgm-egypt-battle)——那是「埃及探索曲」、不在輪播清單 EGYPT_BATTLE_BGM_LIST=[bgm-egypt-mob01, bgm-egypt-mob02] 內,導致兩首小怪戰 BGM 開場永遠播不到(只能靠 bgmEnsureSceneBgm 中途重判才換、又違反戰中穩定)。改為與解析器 _detectCurrentBgm 完全相同的算式 EGYPT_BATTLE_BGM_LIST[(_egyptMobBattleCount||0)%length];_egyptMobBattleCount 已於本函式前段遞增,開場與解析器讀同一值 → 每場交替且戰中不重切。保留三處刻意用 bgm-egypt-battle 之處不動(L82085 英雄相遇場景、L107529 聖甲蟲登場、L56728 解析器防呆 fallback)。',
      '★ v3.15.7 admin_panel.js 破快取字串補跟(index.html _LXPS_FILE_VERSIONS 的 admin_panel.js 由 v3.15.3→v3.15.6,對齊檔內 ADMIN_PANEL_VERSION):原停在 v3.15.3 漏跟,曾在 v3.15.3 時期用過後台的 GM 瀏覽器可能仍快取舊後台 → 重抓同一網址拿到舊版、缺 v3.15.6 帳號資料轉移卡片。補回後強制重抓最新後台。純 GM 部署修正,完全不影響學生(學生有守門不載入 admin_panel.js);admin_panel.js 檔案本身不變(維持 v3.15.6),本輪不需重新上傳 admin_panel.js。',
      '★ 註:本檔(game_changelog.js / index.html)已累積含 v3.15.6(帳號資料轉移)+ v3.15.5(森龍王綠葉特效 + 阿蘇隨機 5~9 段)全部變更;若尚未上傳前面版本,直接上傳這批 v3.15.7 即涵蓋。hero_db.js 本輪未改、維持 v3.15.5。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.6(2026-06-14)— 📨 畢業帳號資料轉移(實名制 GM 審核)+ 好友「此帳號畢業已停用」徽章
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.6',
    date: '2026-06-14',
    brief: [
      '📨【新功能:畢業生「帳號資料轉移」】',
      '   ・畢業後想用<b>新的 Google 帳號</b>繼續玩,又捨不得舊帳號辛苦養成的英雄和進度嗎?現在可以申請把<b>舊學生帳號</b>的進度搬到新帳號了!',
      '   ・做法:用<b>新帳號</b>登入 → 在登入頁帳號那一排點<b>「📨 申請帳號資料轉移」</b> → 填寫真實姓名、畢業年度、班級座號、原學生信箱 → 送出後告訴老師,等老師審核搬移。',
      '   ・🔒 放心:搬移只是<b>複製</b>,舊帳號的資料會<b>保留、不會弄丟</b>。搬好後老師會通知你,記得<b>登出再重新登入</b>就能看到完整進度囉!',
      '👥【好友清單小提示】',
      '   ・如果好友是<b>已畢業停用</b>的舊帳號,清單上會顯示<b>「⚠ 此帳號畢業已停用」</b>,方便你知道對方已經換到新帳號了。',
    ],
    items: [
      '★ v3.15.6 畢業帳號資料轉移(實名制 GM 審核;整套架構比照既有「下載權限申請」downloadPermissions):新增 collection accountTransferRequests/{新uid}。firestore.rules 比照 downloadPermissions——get 本人或 GM、list 限 GM、create 限本人 pending 且 newUid==auth.uid 且禁塞 oldUid/resolvedAt/resolvedBy/migratedAt、update 限本人 pending 不能動 GM 欄位、delete 限 GM(list/實名資訊讀取限 GM,保護學生姓名/班級座號個資)。',
      '★ v3.15.6 學生端(index.html):登入頁帳號列 google-user-info 新增「📨 申請帳號資料轉移」按鈕(緊鄰 📩 申請下載權限,登入後即可見);_showAccountTransferModal 實名 modal(姓名/畢業年度/班級座號/原學生信箱四欄必填 + oldEmail 含@且≠新帳號;開啟時查既有申請顯示 pending/approved banner);後端 _fbSubmitAccountTransferRequest 寫入 + _fbGetMyAccountTransferRequest。',
      '★ v3.15.6 GM 端遷移/復原 API(index.html module scope,★只讀舊寫新、絕不改舊帳號):_fbListAccountTransferRequests、_fbAccountSnapshot(回 知識幣/解鎖數/最高Lv/總Lv/暱稱/是否停權 供新舊比較)、_fbBackupNewAccountBeforeMigration(players 主檔+saves/live+safe → _premig_* 備份槽)、_fbRestoreNewAccountPreMigration、_fbMigrateAccountData(全搬:players 主檔 + saves/live + saves/safe + arenaTeams[改 uid 欄] + wbDamageDetail[改 uid 欄];舊主檔不存在則丟錯)、_fbResolveAccountTransfer、_fbDeleteAccountTransferRequest(deleteDoc)。',
      '★ v3.15.6 GM 後台卡片(admin_panel.js,鐵律 1.47 三同步:HTML section #_admin-acctxfer-section + SIDEBAR_ITEMS + SIDEBAR_GROUPS「🛠 系統管理」組;ADMIN_PANEL_VERSION→v3.15.6):_bindAcctxferSection 事件委派(list 容器單一 click listener 讀 data-action/data-newuid/data-oldemail 分派)——🔍 反查舊帳號(oldEmail→oldUid via _fbAdminFindPlayerByEmail + 抓新舊 _fbAccountSnapshot 顯示比較)、✅ 核准並遷移(覆蓋前 confirm 比較 → _fbBackupNewAccountBeforeMigration → _fbMigrateAccountData → 驗證新主檔存在 → 最後才 _fbSuspendPlayer 停權舊帳號 → _fbResolveAccountTransfer approved → _fbAdminSendNotificationToPlayer 通知學生重登)、🚫 拒絕、↩ 取消停權(救回舊帳號)、↩ 還原新帳號到遷移前、🗑 刪除申請。沿用 admin_panel 慣例不用 ?. 可選鏈(舊 Safari 相容)。',
      '★ v3.15.6 好友清單「此帳號畢業已停用」徽章(index.html 兩處渲染 _renderFriendPanelImpl[8 空格縮排] + _refreshFriendListInner[6 空格縮排]):_fbLoadFriend 回傳整份 players doc(含 _suspended),好友渲染處 fd._suspended===true 即在暱稱旁顯示紅色「⚠ 此帳號畢業已停用」徽章。',
      '★ v3.15.6 復原後路(老師需求「萬一搬移失敗、也回不去舊帳號」5 道防線):①遷移只讀舊寫新 → 舊資料永久母本(就算舊信箱被學校停用,GM 仍能讀舊 uid 重搬)②停權是最後一步、複製驗證成功才做 ③覆蓋新帳號前 _premig_* 備份、可一鍵還原 ④GM 兩顆復原鈕(取消停權救舊帳號/還原新帳號到遷移前)⑤完成用通知彈窗請學生重登。',
      '★ 註:本檔(game_changelog.js / index.html)已累積含 v3.15.5(森龍王綠葉特效 + 阿蘇隨機 5~9 段)全部變更;若尚未上傳 v3.15.5,直接上傳這批 v3.15.6 即涵蓋。hero_db.js 本輪未改、維持 v3.15.5。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.5(2026-06-14)— 🐉 翠綠森龍王戰背景改綠葉特效 + 🌋 阿蘇火山龍王爆發段數改隨機5~9段
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.5',
    date: '2026-06-14',
    brief: [
      '🐉【翠綠森龍王 戰鬥背景特效更新】',
      '   ・進入<b>翠綠森龍王</b>世界 BOSS 戰時,背景特效由火焰改為<b>不斷飄升的綠葉</b>,更符合森林巨龍的氣息!(火山炎龍王維持熔岩火焰)',
      '🌋【阿蘇火山龍王 爆發技調整】',
      '   ・爆發<b>「超光速衝擊波」</b>的連段砲擊次數改為<b>隨機 5～9 段</b>(原本約 8～9 段);自身 HP 低於 15% 時仍會提早收手。',
    ],
    items: [
      '★ v3.15.5 龍王戰背景粒子「依屬性切換」(index.html advStartBattle worldboss 分支):屬性來源 window.WORLD_BOSS_LINEUP[].element(火山炎龍王=fire、翠綠森龍王=grass),加硬保底對照表 _WB_ELEM_FALLBACK 防 world-boss.js 延遲載入 race。火屬性沿用既有 main.css 火焰(wb-flame-particle);草屬性 inline 注入綠葉樣式(wb-leaf-particle,綠色 radial 漸層+葉形 border-radius+wbLeafRise/wbLeafRiseTop 上升搖曳動畫,id 守門只注入一次)。未列屬性 fallback 火焰。完全不動 main.css。',
      '★ v3.15.5 阿蘇爆發段數改隨機(index.html _runBurst 超光速衝擊波):_asMaxSeg 由固定 12 → 5 + Math.floor(Math.random()*5) = 隨機 5~9 段;_asMaxSeg 上移至 log 之前避 TDZ;HP<15% 停止條件(_asStopHp)保留(兩者先到先停);戰鬥 log 顯示擲出的最大段數。hero_db.js BURST_DB「超光速衝擊波」d/fd 改「連轟隨機 5~9 段」;順修一處 v3.15.3 漏改的開發註解(傷害 自損×20→×10、特技 100%→50%、約10段→隨機5~9)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.4(2026-06-14)— 👑 法老王/埃及豔后 爆發技能新增專屬動畫 + 音效 + 法老王爆發新增復活效果
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.4',
    date: '2026-06-14',
    brief: [
      '👑【法老王 / 埃及豔后 爆發技能 大升級】(管理員測試中)',
      '   ・<b>法老王「太陽神的審判」</b>:新增專屬<b>爆發動畫</b>(太陽火球)與<b>大爆炸音效</b>;並<b>新增「復活」效果</b>——施放時會先<b>復活已倒下的友方</b>(以 25% HP 復活),再恢復全體 HP!',
      '   ・<b>埃及豔后「尼羅河的詛咒」</b>:新增專屬<b>爆發動畫</b>(深海大漩渦)與<b>河水暴漲音效</b>。',
      '   ・💡 提醒:埃及關目前仍<b>僅開放管理員(老師)測試</b>,正式對全班開放後即可體驗雙王的華麗爆發!',
    ],
    items: [
      '★ v3.15.4 雙王爆發動畫/音效(hero_db.js BURST_GIF_DB + index.html):新增 BURST_GIF_DB 兩條——太陽神的審判→太陽火球.gif(sfx-pharaoh-burst,金光 tint)、尼羅河的詛咒→深海大漩渦.gif(sfx-cleopatra-burst,暗水藍 tint);爆發流程 _showBurstGif(bd.n) 於過場字幕後自動播放對應 GIF+音效。index.html 新增 2 個 <audio>:sfx-pharaoh-burst(大爆炸.mp3)、sfx-cleopatra-burst(河水暴漲.mp3,老師連結把「漲」打成「漩」,實際檔名為 河水暴漲.mp3 已確認 200)。兩爆發 body 移除舊的 playSfx(sfx-holy/sfx-curse),改由 GIF 音效統一播放(老師指定音效)。',
      '★ v3.15.4 法老王爆發新增復活(index.html _runBurst 太陽神的審判):傷害結算後、全體治療前,先以 doRevive(dead,0.25) 復活我方所有倒下友方(25% 最大HP,acted=false 可再行動,bannerFX「☀️ 拉神復活!」);復活對 BOSS 版(寶庫王座雙王)與招募版同樣生效——BOSS 版讓法老王爆發即可救回埃及豔后(配合天賦回合開始互相復活,雙王更難纏);招募版則為 UR/SSR 級隊伍復活利器。hero_db.js BURST_DB「太陽神的審判」desc/fd 同步補上復活說明(圖鑑一致)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.3(2026-06-14)— 🌋 阿蘇火山龍王技能調整 + ⚔️ 貓空/日本小怪 HP×2 + 🐉 森龍王戰背景修復 + 🛠 GM 工具(異常門檻/奧汀/解鎖至寶)
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.3',
    date: '2026-06-14',
    brief: [
      '🌋【阿蘇火山龍王 技能調整】',
      '   ・<b>S1「龍神分身術」</b>能量消耗 6 → <b>7</b>。',
      '   ・<b>S2「火山噴發」</b>傷害改以 <b>(特技+速度)×250%</b> 計算(原為「攻擊+速度」),與龍王以「特技」為主力的定位一致。',
      '   ・<b>爆發「超光速衝擊波」</b>每段傷害的特技加成由 100% → <b>50%</b>(圖鑑說明同步更正:每段傷害 = 失去的 HP×10 + 特技 50%;原圖鑑誤植「×20」,已更正為實際的「×10」)。',
      '   ・<b>天賦「頑強」</b>覺醒時的「不死」狀態由 2 回合 → <b>1 回合</b>(技能升至滿級為 2 回合)。',
      '⚔️【貓空、日本關卡小怪 強化】',
      '   ・貓空與日本關卡的<b>所有路邊小怪 HP 全部加倍</b>,戰鬥更有挑戰性,記得善用技能與隊形!',
      '🐉【翠綠森龍王 世界 BOSS 戰背景修復】',
      '   ・修復<b>翠綠森龍王(草龍王)</b>世界 BOSS 戰時<b>背景全黑</b>的問題,現在會正確顯示龍王立繪。',
    ],
    items: [
      '★ v3.15.3 阿蘇火山龍王調整(hero_db.js + index.html):S1 龍神分身術 c:6→7;S2 火山噴發 execSkill+aiUseSkill 傷害 atkv(a)→spv(a),即(特技+速度)×250%×(1+s2Lv×5%);爆發超光速衝擊波每段 (_asCost×10 + spvOf(h)) → (_asCost×10 + Math.floor(spvOf(h)×0.5))(特技 100%→50%);天賦頑強 _tnDur 2+(Lv4?1:0) → 1+(Lv4?1:0)(不死 1 回合,MAX 2);圖鑑(BURST_DB desc/fd + 爆發升級表 rows[0] + 程式註解)「自損×20」更正為實際的「自損×10」+ 特技 50%(老師回報圖鑑與實際不符)。',
      '★ v3.15.3 沙漠路邊小怪 ×2(hero_db.js + index.html;鐵律1.128 怪物只需 aiUseSkill):新增沙漠毒蠍(hp340/atk24/sp10/spd8;S1 致命毒螫 c4=使目標立即倒下,乙版:會被無敵/不死/死亡免疫/不倒再生擋下,對真BOSS改當前HP20%毒傷上限Lv×10鐵律1.31;S2 瞬間休眠 c3=自身 immune 1回合)、仙人掌怪(hp380/atk12/sp38/spd9;S1 針狀葉 c2=被動受擊反彈50%[doDmg on-hit hook 置 let dmg 後鐵律1.110]+主動 halfDmg 1回合;S2 千本針 c4=攻擊100%全體土屬性);加入 MINI_MONSTERS_EG 出怪池、小怪屬性表(土)、MONSTER_DROPS、EGYPT_ALL_CHARACTERS(鬥技場排除)、BOSS_NAMES(不入可解鎖圖鑑)、_ELEM_BY_SKILL(千本針土)、HERO_IMGS 立繪。',
      '★ v3.15.3 貓空/日本小怪 HP×2(hero_db.js):MINI_MONSTERS 4 隻(偷摘花妖精 42→84/鳥人哈維 40→80/竹筍哥布林 45→90/茶史萊姆 30→60)+ MINI_MONSTERS_JP 4 隻(河童 36→72/二口女 50→100/雪女 50→100/獨眼小僧 60→120);稀有小怪寶箱怪/小惡魔未動(屬稀有怪,非標準小怪池)。',
      '★ v3.15.3 埃及「小怪出現」開場白修正(index.html):MINI_BATTLE_INTROS 原缺 egypt-* key → fallback 到貓空 river(老師回報埃及戰開場白仍是貓空版);新增 egypt-desert/egypt-entrance/egypt-inner 三組埃及主題開場白(融入流沙眼鏡蛇/沙漠毒蠍/仙人掌怪/卡諾卜壇怪/木乃伊貓/神秘圖騰+雙王)。',
      '★ v3.15.3 翠綠森龍王 BOSS 戰背景修復(index.html advStartBattle worldboss 分支):背景圖原直連 `${boss名}.png`,但火山炎龍王/翠綠森龍王實際檔名不同(維蘇威火山龍王.png / 草龍王.png)→兩者皆 404 導致背景全黑;改用 window.HERO_IMGS[boss名] 解析 + 已知龍王硬保底對照表(防 world-boss.js 延遲載入 race),最後才退回名稱.png。',
      '★ v3.15.3 _PLAYER_HERO_NAMES 補漏(index.html):法老王/埃及豔后/主神奧汀先前漏列 → GM 工具 _cleanseHeroLevelsByEmail 會把不在白名單的 heroLevels 鍵刪除,恐誤刪正版持有者英雄;已補進白名單(防患未然)。',
      '★ v3.15.3 GM 後台(admin_panel.js):①龍王戰異常傷害判定門檻「平均每回合 > 5000」→「> 20000」(5 處判定式 _isAbnormal/紅字/墓碑勾選/排行榜紅旗/明細重勾 + UI 按鈕/說明/註解;單擊上限 5000 與聯手爆發 5000 為事實保留,明細收集天然不含聯手爆發)。②課堂獎勵發放新增「⚡ UR 主神奧汀」勾選(_cr-item-odin → unlockedHeroes 聯集發放)。③新增「💠 解鎖全部至寶(自己帳號)」GM 卡片(測試用,冪等掃 TAIWAN_TREASURES 寫 window._taiwanTreasureData + 雲端儲存;HTML section + SIDEBAR_ITEMS + SIDEBAR_GROUPS 三同步,鐵律1.47)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.2(2026-06-14)— 🔺 埃及探險關(管理員測試):雙王平衡坦向化 + 天賦/爆發升級效果 + 聖甲蟲/題庫/BGM/對白修正 ｜ 🐉 龍王雙動作 + 📊 排行榜傷害總表
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.2',
    date: '2026-06-14',
    brief: [
      '🔺【環遊世界第二關 ── 埃及探險 即將登場！】',
      '   ・繼貓空、台灣、日本之後,環遊世界冒險來到神祕的<b>古埃及</b>!穿越熾熱沙漠、深入金字塔,在寶庫王座挑戰守護寶藏的雙王。',
      '   ・關卡分為<b>沙漠 → 金字塔入口 → 金字塔內部</b>三幕場景,每幕都有一場小怪戰,最後在王座迎戰<b>法老王與埃及豔后</b>雙王!',
      '   ・在沙漠可以選擇<b>挑戰難度</b>(沒自信 / 普通 / 我很會),難度只影響雙王 BOSS 的 HP(+0% / +25% / +50%),題目一律是 30 題古埃及主題知識(地理 / 歷史 / 神話 / 神獸)。',
      '   ・埃及小怪有 5 種(木乃伊貓、流沙眼鏡蛇、卡諾卜壇怪、神秘圖騰、聖甲蟲),每場戰鬥有 <b>12% 機率出現稀有的「🪲 聖甲蟲」</b>,打倒牠每位英雄可得<b>大量經驗值(3000~5000)</b>!埃及小怪掉落的經驗書全程都是<b>精裝版</b>。',
      '   ・以 <b>S 評價</b>同時擊敗雙王,有機會<b>收服法老王或埃及豔后</b>(各自獨立 15% 機率)加入你的隊伍!',
      '   ・💡 本次<b>先開放管理員(老師)進行測試</b>,一般玩家點選埃及關會看到「即將開放」,正式對全班開放後即可挑戰,敬請期待!',
      '🌬️ 新角色登場介紹 ── 👑 法老王(光屬性 SSR)',
      '   ・<b>天賦「法老威儀」</b>:每個回合開始累積 1 層威儀(造成傷害 +10%,最多 10 層);每次受傷有機率被削減 1 層,基礎 50%、<b>天賦每升 1 級此機率 -5%</b>(滿級僅 30%,威儀更穩固)。當埃及豔后倒下時,法老王會耗費自身<b>最大 HP 5%</b>把她復活到 25% HP(不限次數)。',
      '   ・<b>S1「王權法杖」</b>:以攻擊+特技 150% 重擊 1 名對手,並把它的行動順序<b>擊退到最後</b>。',
      '   ・<b>S2「黃沙風暴」</b>:以攻擊+特技 80% 對全體連續攻擊 2 次,並使全體<b>速度下降</b> 2 回合。',
      '   ・<b>爆發「太陽神的審判」</b>:召喚拉神烈日,以特技 900%「群體分攤」的巨大光屬性傷害轟炸全場(敵人越多每人受越少),施放後<b>我方全體回復 25% HP</b>(<b>爆發每強化 1 級恢復量 +5%</b>,滿級達 45%)。',
      '🌬️ 新角色登場介紹 ── 🐍 埃及豔后(暗屬性 SSR)',
      '   ・<b>天賦「蛇瞳魅影」</b>:受到傷害時有機率使攻擊者陷入<b>強力魅惑</b> 1 回合(會攻擊自己的同伴),基礎 50%、<b>天賦每升 1 級此機率 +5%</b>(滿級達 70%)。當法老王倒下時,埃及豔后會耗費自身<b>最大 HP 5%</b>把他復活到 25% HP(不限次數)。',
      '   ・<b>S1「魅惑之吻」</b>:以特技 200% 傷害 1 名對手,並使其<b>魅惑</b> 2 回合。',
      '   ・<b>S2「蛇與蜜」</b>:回復我方全體 35% HP,並提升我方全體特技 50% 共 2 回合。',
      '   ・<b>爆發「尼羅河的詛咒」</b>:喚醒千年詛咒淹沒戰場,以特技 200% 對全體造成暗屬性巨大傷害,並各有 50% 機率<b>查封物品</b> 2 回合(<b>爆發每強化 1 級此機率 +5%</b>,滿級達 70%)。',
      '   ・⚠ 提醒:法老王與埃及豔后會「互相復活」,唯有<b>同一時間同時擊殺雙王</b>才能真正終結戰鬥!',
      '   ・⚖ <b>雙王定位</b>:法老王與埃及豔后是<b>高生存的坦克／輔助型</b>雙核(攻擊偏低、生存與控場極強),適合靠威儀疊層、互相復活與全體治療打持久消耗戰。',
      '🐉【世界 BOSS 龍王 ── 雙動作確認 + 隨時查看任一龍王能力】',
      '   ・確認<b>翠綠森龍王(草龍王)和火山炎龍王一樣每回合會行動兩次</b>:第一次是技能/爆發/普攻,第二次固定追擊一次普攻;追擊普攻現在會<b>鎖定當前 HP 最少的玩家</b>。',
      '   ・「元素龍系列」輪流表的<b>每一隻龍王下方都新增「📖 詳細能力」按鈕</b>,可隨時點開查看那隻龍王的招式、天賦與護盾(尚未實裝的龍王顯示「🔒 能力即將解放」)。',
    ],
    items: [
      // ── 埃及關 ──
      '★ v3.15.2 雙王平衡(index.html + hero_db.js):①數值改坦向(法老王 58/18/18/6、豔后 54/18/18/10,和=100;招募版攻30→18/特34→18 換高生存+控場)。②天賦/爆發升級+BOSS守門:法老威儀減層機率=isEgyptBoss?50%:max(30%,50%-天賦Lv×5%)、蛇瞳魅影魅惑=isEgyptBoss?50%:min(70%,50%+天賦Lv×5%)(內部Lv0~4=顯示Lv1~5,受傷 on-hit hook 內層化、鐵律1.110);太陽神恢復=isEgyptBoss?25%:min(45%,25%+爆發Lv×5%)、尼羅河查封=isEgyptBoss?50%:min(70%,50%+爆發Lv×5%)(_runBurst,爆發Lv0~4)。③互相復活耗血「當前HP10%」→「固定最大HP5%」(復活量25%不變,isEgyptBoss BOSS-only)。④雙王加入 _ZEUS_TRUE_BOSSES → 取得尊嚴鎖血(50%/1HP)+強制爆發反擊(無視能量;鐵律1.135;招募版 side!==p2 不受影響、秒殺技對BOSS改比例鐵律1.31)。',
      '★ v3.15.2 埃及其他修正(index.html + hero_db.js):⑤聖甲蟲聖光治癒/黃金護甲補 bannerFX/log/renderCard 視覺回饋 + 護盾30→60 + buffs守門(原本無回饋,玩家誤以為沒作用)。⑥埃及小怪戰題庫修正:advPrepareSessionQuestions 原只在 BOSS 戰前呼叫→小怪戰沿用殘留非埃及題池;新增 _advSessionSubject 追蹤,advStartMiniBattle 偵測「埃及關但題池科目≠埃及/池空」→重建(不過度重置)。①BGM 埃及小怪戰兩首輪播(EGYPT_BATTLE_BGM_LIST + _egyptMobBattleCount%2,每場交替戰中穩定)。④三場景對白重寫(沙漠/金字塔入口/內部,小怪各具性格+融入吉薩/尼羅河/拉神/卡諾卜罈史地)。②介紹頁 4→5 星 + 沙漠背景 + 選關切埃及首頁 BGM。預習頁(EGYPT_PREVIEW_CONTENT)延後下一批。',
      '埃及關場景流程(index.html):新增 _EG_BG(沙漠/金字塔入口/金字塔內部/寶庫王座 raw 連結)+ ADV_SCENES.egypt(3 幕:egypt-desert choiceType=difficulty 沿用貓空 _advBossHpMult 0/+25/+50%、egypt-entrance/egypt-inner choiceType=japan_auto);流程=沙漠選難度→小怪戰→入口→小怪戰→內部→小怪戰→advFinishCutscene→雙王 BOSS(共 3 場小怪戰 + 雙王)。startAdventureGame egypt 區塊(subject/grade=埃及,難度由沙漠選擇覆蓋);advGetQuizPool egypt 兜底(subject===埃及||_adventureStage===egypt → 30 題,過場清空 subject 也命中)。',
      '埃及小怪(index.html):MINI_MONSTERS_EG=[木乃伊貓/流沙眼鏡蛇/卡諾卜壇怪/神秘圖騰](正常 4 隻池);advStartMiniBattle 每場 12% 機率注入聖甲蟲(替換隨機一隻,同小惡魔/座敷童子稀有怪設計);MINI_MONSTER_ELEM(木乃伊貓暗/流沙眼鏡蛇土/卡諾卜壇怪土/神秘圖騰暗/聖甲蟲光);MONSTER_DROPS 五怪(精裝經驗書;聖甲蟲 EXP 3000~5000);advFinishMiniBattle 聖甲蟲掉落區塊(每位非好友英雄 addHeroExp 3000~5000 + 2% 果實 + 50% 技能書/精裝書);_RARE_MOB_LINES + _showRareMobIntro/_showRareMobDefeat 聖甲蟲金色(🪲 #ffd700)登場/退場對白;5 怪加入 BOSS_NAMES(魔物圖鑑/瀕死守門/鬥技場排除)。',
      '埃及背景/BGM(index.html):新增 3 個 <audio>(bgm-egypt-menu 首頁BGM / bgm-egypt-battle 冒險BGM / bgm-egypt-boss 法老王BOSS戰BGM);場景與戰鬥背景採 inline backgroundImage(_EG_BG,不依賴 main.css 的 .bg-egypt-*);BGM 接線涵蓋 advStartCutscene/advLoadScene(過場 menu)、mini 戰鬥(battle/聖甲蟲)、advStartBattle+advFinishCutscene+_detectCurrentBgm(雙王 boss)、mini 結算→下一場景、相遇 BGM 共 9 處。',
      '埃及雙王 BOSS(hero_db.js 批一已建,本批接線/天賦補完):_buildEgyptBossTeam 回傳法老王(光 isEgyptBoss)+埃及豔后(暗 isEgyptBoss),getBossTeam 5 處接線;雙王 s1/s2(王權法杖/黃沙風暴/魅惑之吻/蛇與蜜)execSkill 玩家路徑 + aiUseSkill AI 路徑雙路徑(鐵律 1.128);爆發(太陽神的審判 群體分攤900%+我方回25% / 尼羅河的詛咒 全體暗200%+50%查封)_runBurst 實作。',
      '埃及雙王天賦(index.html):法老威儀傷害加成(doDmg let dmg=rawDmg 後 +10%/層,鐵律 1.110)+ 疊層(startTurn 回合開始 +1,上限 10)+ 受傷減 1 層(doDmg 受傷 hook;機率見 v3.15.2 升級);蛇瞳魅影(豔后受傷使攻擊者強力魅惑 1 回合;機率見 v3.15.2 升級);互相復活(startTurn 行動前檢查,一王倒下另一王存活→耗自身最大 HP5%(v3.15.2 由當前HP10%改)復活倒下者至最大 HP25%;雙王同時陣亡不觸發=必須同時擊殺;以 isEgyptBoss 守門僅 BOSS 版觸發)。',
      '埃及招募 + 防呆 + 圖鑑(index.html):打雙王 S 評價時對法老王/埃及豔后各自獨立 15% 機率收服(未擁有+非借用,advSaveUnlockedHero source=egypt_boss_clear,已加入 BOSS_SOURCES/_LEGIT_SOURCES 白名單避免異常誤報);防呆 6 處(newHero/newHero_replace/focusHero/_renderHeroDetail/G.p1 二重保險×2)讀 EGYPT_BOSS_HERO_STATS 弱化版(法老王 hp48/atk30/sp14/spd8、豔后 hp38/atk12/sp34/spd16,避免招募版誤用 11500/10500 BOSS HP);_advGetHeroPoolForStage egypt 分支(法老王/埃及豔后 2 位)。',
      '埃及雙王稀有度(index.html):加入 SUMMON_RARE_HEROES 取得 SSR 稀有度,但為「埃及 BOSS 戰限定收服」→ 從 SSR 召喚抽取(rare_ssr/legacy rare_hero)與自選券(_summonTicketUnrecorded)以 EGYPT_EXCLUSIVE_HEROES 排除(不可召喚/不可自選,只能打 BOSS 收服);加入 ADMIN_ALL_HEROES(GM 可發放);_nonStudentInRare 加雙王(學生設計計數準確)。',
      '埃及入口閘門(index.html _egyptTrySelect):本版【僅開放管理員測試】(老師指示)——非管理員(含已達 4 名 Lv25 者)一律顯示「即將開放」彈窗不進入;唯管理員 _isAdminUser() 可進入 selectAdvStage(egypt)。日後正式開放只要把此閘門改回 4 名 Lv25 解鎖判斷即可。ADV_STAGES.egypt 介紹頁 + EGYPT 過濾 Set(EGYPT_BOSS_HEROES/EGYPT_EXCLUSIVE_HEROES/EGYPT_ALL_CHARACTERS/EGYPT_ARENA_EXCLUDE)批一已建。',
      '埃及獎章(index.html MEDAL_DEFS):新增「埃及關」分類 5 枚(egypt_unlock 金字塔之鑰 / egypt_first_clear 雙王伏誅 / egypt_s_clear 尼羅河的榮光 / egypt_scarab 黃金聖蟲 / egypt_recruit_king 王者結盟);定義 _checkEgyptUnlockMedal / _checkEgyptClearMedal(grade) / _checkEgyptRecruitMedal;_checkMedalDefeat 加聖甲蟲→egypt_scarab;_egyptHardSClear 旗標(S 評價通關埋未來隱藏終局 gate hook,本版只埋不實作)。',
      '埃及題庫(adv_quiz_db.js 批一已完成):末尾追加 30 題古埃及主題(id 3171-3200,grade/subject=埃及,22 普通+8 我很會),戰鬥題庫 filter subject===埃及,無撞號。',
      // ── 世界 BOSS 龍王 ──
      '龍王雙動作確認 + 追擊鎖血(world-boss.js):確認 _safeBossEndAction 的「主行動 + 追擊普攻」雙動作邏輯為「所有世界 BOSS 龍王」共用(以 _wbActionCount 計數,非火龍王專屬)→ 火山炎龍王與翠綠森龍王行為一致。_wbAdvBossNormalAtk 新增 targetLowest 參數:追擊普攻(第 2 次行動)傳 true → 鎖定當前 HP 最少的存活玩家;主行動的 20% AI 普攻維持隨機目標。',
      '龍王輪流表詳細能力鈕(world-boss-ui.html):_wbAdvOpenBossInfoPopup 重構接受 bossIdArg → 可查看「任一龍王」能力(HP/atk/sp/spd 優先讀 HERO_DB,其次 lineup maxHp);_wbRenderLineup 每隻龍王下方加按鈕——已實裝(HERO_DB 有資料,火/草)顯示「📖 詳細能力」開該龍王彈窗,未實裝 6 隻顯示「🔒 能力即將解放」佔位。',
      // ── 排行榜 ──
      '龍王排行榜逐回合明細新增「各英雄傷害來源總表」(admin_panel.js _wbShowRoundDetailModal/_renderBattles):每一場明細頂部加總本場每回合各英雄傷害並由高到低排序,附占比長條;單一英雄占比 ≥ 60% 標紅 ⚠ 警示,讓 GM 一眼看出哪隻英雄傷害異常(疑似 BUG/作弊)。資料源沿用既有 wbDamageDetail/{uid}(不含聯手爆發 5000),不改寫入端。',
    ],
    adminOnly: false,
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.14.27(2026-06-13)— 🦅 第三隻 UR「主神奧汀」實裝 + 🦊 玉藻前爆發改 + 🐉 八龍王正名重排+至寶頁
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.14.27',
    date: '2026-06-13',
    brief: [
      '🦅【第三隻 UR ── 主神奧汀 登場！】',
      '   ・繼藝天使、魔劍姬之後,第三隻最高稀有度「UR」降臨!北歐神話的眾神之父,手持永恆之槍的<b>最強反擊坦克</b>。',
      '   ・👁️ 天賦「奧汀之眼」:每回合替最脆弱的同伴(含自己)附上「注視」,被注視的人受傷會<b>免疫並由奧汀反擊</b>;而且對手的單體攻擊大多會<b>轉移到奧汀身上</b>替隊友擋下。',
      '   ・🔱 S1「岡格尼爾的制裁」:必中、必爆、無視一切庇護的一槍重擊,並讓對手<b>強力麻痺 1 回合</b>。',
      '   ・🛡️ S2「英靈殿的守望者」:號令<b>全場敵人只能攻擊奧汀</b> 1 回合,同時自己受傷大幅減少(對 BOSS 各有 50% 機率失效)。',
      '   ・🌅 爆發「諸神的黃昏」:主動發動會讓全隊化為彈藥傾力一擊;而且當<b>全隊倒下時會自動發動一次</b>,讓眾人浴火重生並反擊全場!(每場限 1 次)',
      '   ・取得方式同前兩隻 UR:<b>無法抽取</b>,只能靠考試優異或特殊優良表現由老師頒發(僅用於冒險,鬥技場不可使用)。',
      '🦊【玉藻前 爆發技改版】',
      '   ・爆發「禍世邪魅」改成<b>火屬性特技 200%、隨機攻擊 4 次</b>(打到的目標若倒下會自動轉移到別的對手),命中更兇猛、目標更靈活。',
      '🐉【八隻世界龍王正名 + 順序整理】',
      '   ・八隻龍王全部正名,並讓「元素龍系列」頁面最下方的<b>排序與當前龍王標記</b>對齊實際輪替順序:🔥火山炎龍王 → 🌿翠綠森龍王 → 🪨山岳地龍王 → 🌪風暴雷龍王 → 💧深淵海龍王 → ⚫邪骨暗龍王 → ☀神聖光龍王 → 🌌星辰幻龍王。',
      '   ・每隻龍王的<b>所在區域</b>也都標示出來了。',
      '💎【八龍王專屬至寶 全數進入至寶圖鑑】',
      '   ・對應正名,「火龍王之牙→<b>炎龍王之牙</b>」、「草龍王之鬚→<b>森龍王之鬚</b>」。',
      '   ・另外 6 隻龍王的專屬至寶(地龍王之麟、雷龍王之翼、海龍王之爪、暗龍王之骸、光龍王之羽、幻龍王之角)<b>已先放進至寶圖鑑</b>,目前顯示「🔒 尚未開放」,能力之後會陸續公開,敬請期待!',
    ],
    items: [
      // ── 主神奧汀 ──
      '主神奧汀(第三隻 UR)資料層:hero_db.js 新增 HERO_DB/AVATARS(🦅)/HERO_IMGS(主神奧汀.png)/HERO_PORTRAIT_LIBRARY/HERO_IMG_POS/HERO_THUMB_POS/HERO_BIO/BURST_DB(諸神的黃昏)/HERO_LORE/HERO_TRAIT(奧汀之眼 👁️)/BURST_GIF_DB(太陽火球.gif)/HERO_CATEGORIES_OVERRIDE([dmg,ctrl])/HERO_HEX_OVERRIDE/_TRAIT_LV_INFO/_v384HpFix(108);加入 _RARITY_UR_HEROES 與 ADMIN_ALL_HEROES。',
      '主神奧汀引擎層(index.html):天賦「奧汀之眼」於 startTurn 對最低 HP% 友方(含自己)施加「注視」_odinGaze(配額 1+天賦Lv,上限 4,每人最多 2 層);doDmg 兩段 hook —(ODIN-1)對手單體直接攻擊非奧汀友方時 75%+天賦Lv×5%(上限 95%)轉移由奧汀承受(_odinRedirect 防遞迴);(ODIN-2)被注視者受對手直接攻擊時免疫該次傷害並消耗 1 層、由奧汀以攻擊 100%+10%/天賦級反擊(奧汀倒下則不觸發)。皆置於 doDmg 頂部、僅用 rawDmg/target/opts(鐵律 1.110),AoE/DoT/反擊/治療不觸發。',
      '主神奧汀 S1「岡格尼爾的制裁」(execSkill+aiUseSkill 雙路徑,鐵律 1.128):攻擊 300%(每級 +5%)+ 目標最大 HP 20% 對 1 名對手,必中、無視有利、必定暴擊(forceCritRate),命中後強力麻痺 1 回合(直接 push para dur:1 _strong,對齊天神宙斯慣例);走 doDmg → 世界 BOSS 5000/下上限自動生效。',
      '主神奧汀 S2「英靈殿的守望者」(execSkill+aiUseSkill):全體對手強力挑釁(strongTaunt dur:2)只能普攻奧汀 + 自身 _odinGuard 受傷 -30%(每級 +3pp,上限 60%,doDmg 讀 _pct 減傷);_tauntImmuneCheck 排除八岐大蛇等,對 BOSS(BOSS_NAMES)各 50% 機率失效。',
      '主神奧汀爆發「諸神的黃昏」:(主動,_runBurst)全體存活友方(含奧汀)降 HP1,以全隊 4 槽最大 HP 總和 ×500%(每升 +10% _burstMult)對敵平分(必中無視有利);(被動,checkWin 頂部 hook)奧汀在隊且全隊倒下且對手有活口且本場未用過時,自動 1 次:徹底清結算守門旗標(鐵律 1.145)後全隊 HP1 復活 + 無敵 1 回合,以全隊最大 HP 總和 ×1000% 對敵平分。C=全 PvE 含世界 BOSS,每場限 1 次(_odinRagnarokUsed);鬥技場禁用 UR 不會誤觸。',
      '主神奧汀技能升級:SKILL_UPGRADE_DEF 註冊 special_odin_s1(放大攻擊 300% 乘算)/special_odin_s2(放大受傷 -30% 加法 +3pp/級);BURST_UPGRADE_DEF 加奧汀「諸神的黃昏」每升 +10% rows;newHero 初始化 _odinRagnarokUsed=false;圖鑑「近期活動與新角色」UR 主題改為三位 UR(克雷爾/伊莉雅/奧汀)三圖三段,新增 buildOdinDebutSection 金白聖光介紹卡(資料驅動)。',
      // ── 玉藻前 ──
      '玉藻前爆發「禍世邪魅」改版(hero_db.js BURST_DB + index.html _runBurst):移除原魅惑/吸血,改為以特技 200% 火屬性、隨機攻擊 4 次(每次重選目標,目標倒下自動轉移),doDmg 帶 elem:fire/isSkill;舊魅惑吸血 hook 成 inert dead code 無害保留。',
      // ── 龍王正名 ──
      '八龍王正名(只改顯示名,id 全保留 → 玩家已領至寶/排行榜/雲端當前龍王 wbCurrentBossId 全相容,零存檔風險):維蘇威火山龍王→火山炎龍王、翠玉草龍王→翠綠森龍王、深海冰龍王→深淵海龍王(element 仍 water)、風雷雲龍王→風暴雷龍王、山岳土龍王→山岳地龍王、不死骨龍王→邪骨暗龍王;神聖光龍王/星辰幻龍王不變。同步更新 WORLD_BOSS_LINEUP.name 及 HERO_DB/BURST_DB/HERO_TRAIT/HERO_LORE/HERO_BIO/HERO_IMGS 對應 key 與全部 UI/by-name 邏輯字串(world-boss.js/index.html/world-boss-ui.html/admin_panel.js/本檔)。⚠ 火龍王立繪圖檔仍沿用原始檔名「維蘇威火山龍王.png」(GitHub 實檔),改名只動 key 不動圖檔名以免 404。',
      '龍王列表排序修正(world-boss-ui.html _wbRenderLineup):原本照 WORLD_BOSS_LINEUP 陣列序顯示且寫死 i===0 為「當前」→ 改為照 _WB_BOSS_ROTATION(火→草→土→風→水→暗→光→幻)排列、「當前」標記改依 _wbGetCurrentBossId() 動態判定,並顯示每隻龍王的所在區域(scene)。',
      // ── 至寶 ──
      '龍王至寶正名 + 補齊(index.html TAIWAN_TREASURES):dragon_fang_fire name 火龍王之牙→炎龍王之牙、dragon_whisker_grass name 草龍王之鬚→森龍王之鬚(僅改 .name 顯示,id/圖檔名/specialEffects/bossId 全不動,效果以 id+effect-flag 判定不受影響)。新增 6 個龍王至寶定義 dragon_scale_earth(地龍王之麟)/dragon_wing_thunder(雷龍王之翼)/dragon_claw_sea(海龍王之爪)/dragon_bone_dark(暗龍王之骸)/dragon_feather_light(光龍王之羽)/dragon_horn_omni(幻龍王之角),圖檔用老師指定檔名(土/風/冰/骨/光/幻龍王之XX.png),baseStats 全 0、specialEffects 空、abilityText「尚未開放」、comingSoon:true;全部加進 _TAIWAN_TREASURE_ORDER(照龍王輪替序)。',
      '至寶圖鑑灰色佔位(_renderTaiwanTreasureGrid):comingSoon 至寶顯示灰階圖 + 右上「🔒 尚未開放」徽章 + 狀態「🔒 尚未開放/敬請期待」,點擊顯示提示而非進詳細頁(避免顯示誤導的取得管道)。6 個新至寶暫不接入排名領獎映射(_WB_DRAGON_TREASURE_MAP/_WB_DRAGON_T_MAP 維持只有 vesuvius/cuiyu)→ 不會發放空能力至寶,符合「尚未開放」;日後啟用某龍王至寶時:填 baseStats/specialEffects/abilityText、移除 comingSoon、並在兩張映射表補該 boss→至寶。',
    ],
    adminOnly: false,
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.14.26(2026-06-13)— 💎 草龍王之鬚補進至寶圖鑑(v3.14.24 漏列,圖鑑看不到)
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.14.26',
    date: '2026-06-13',
    brief: [
      '💎【草龍王之鬚進入至寶圖鑑】',
      '   ・打草龍王世界 BOSS 排名拿到的專屬至寶「🌿 草龍王之鬚」,現在會<b>正確出現在「💎 至寶圖鑑」裡</b>了(之前圖鑑漏列,只看得到火龍王之牙)。',
    ],
    items: [
      '草龍王之鬚補進至寶圖鑑:dragon_whisker_grass 的完整定義(name/icon/特效/abilityText)早在 v3.13.73 就有、排名獎勵發放也正常,但 v3.14.24 漏把它加進 _TAIWAN_TREASURE_ORDER —— 至寶圖鑑 _renderTaiwanTreasureGrid 正是以此陣列 forEach 生成卡片,故圖鑑跳過未顯示。已在 dragon_fang_fire(火龍王之牙)之後補上 dragon_whisker_grass。此陣列同時供至寶修復 / 卸下 / 同槽排序使用,補入後草龍王之鬚在這些邏輯也一併被正確涵蓋,無副作用。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.14.25(2026-06-13)— 👊 普攻顯示屬性 + 🐉 選完寵物 BOSS 卡頓修復 + 🔥 鳳凰爆發強化 + 📖 草龍王能力介紹修正
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.14.25',
    date: '2026-06-13',
    brief: [
      '👊【普通攻擊顯示屬性】',
      '   ・行動面板上的「普通攻擊」按鈕,拳頭圖示改成<b>該英雄目前的元素屬性圖示</b>(🔥火 / 💧水 / 🌿草 / 🪽風 / 🪨土 / ⭐光 / 🌙暗),一眼就知道自己普攻是什麼屬性的傷害。',
      '🐉【世界 BOSS 戰:選完寵物不再卡住】',
      '   ・在世界 BOSS 戰答對題目、選到「獲得寵物」並選好英雄後,<b>BOSS 會立刻接著行動</b>,不會再卡一陣子才動了。',
      '🔥【鳳凰爆發強化】',
      '   ・鳳凰的爆發技「神炎之翼」<b>基本傷害 130% → 180%</b>;附加的「熾羽」灼燒每層傷害,從固定 15 HP 提升為 <b>15 HP + 最大HP 3%</b>(疊滿 5 層威力更可觀)。',
      '📖【草龍王能力介紹修正】',
      '   ・世界 BOSS 大廳點「📖 BOSS 能力詳細介紹」,打草龍王時終於會顯示<b>草龍王自己的招式、天賦與護盾屬性</b>(之前還是顯示火龍王的業火灼燒 / 炎之意志)。大廳預覽卡的描述與屬性也一併修正。',
    ],
    items: [
      '普攻按鈕元素圖示:b-atk 按鈕內新增 <span id="b-atk-elem">,顯示玩家行動面板時讀 ELEMENT_DB[a.element].icon 動態替換原本寫死的 👊(英雄無 element 時後備 👊)。此更新區每次英雄行動都會重跑,切換英雄時圖示即時更新。',
      '選完寵物 BOSS 卡頓根治:根因為 advRewardConfirmUse 的 BOSS 路徑對 get_pet(會開「寵物選擇器」、設 _advRewardPendingPetPicker=true 並 return)仍提前呼叫 _advFinishRoundQuiz → 把 _advRoundQuizPending 設 false 並排一個 200ms 後的 startTurn,但該 startTurn 撞上仍開著的寵物選擇器 overlay 而 return 且不重排;待玩家選完寵物走 advOnQuizSkip(靠 _resumeTimers 推 _pendingTimers queue)卻找不到那個真 setTimeout → BOSS 卡住,只能等 15 秒 watchdog 或 iPad 回前台 nudge。修法:get_pet 開了選擇器時 advRewardConfirmUse 不提前收尾,改由 _advFinishPetPick 在玩家選完寵物後依 _advRoundQuizPending 呼叫 _advFinishRoundQuiz(BOSS 戰新回合答題,排 startTurn 推進對手)或 advOnQuizSkip(其他情境)。小怪戰走獨立 mini 路徑(_advMiniApplyReward + onDone),不受影響。',
      '鳳凰爆發「神炎之翼」數值(老師調整):基本傷害倍率 1.30→1.80(基礎 180%,等級加成保留每級 +10%,滿級 230%);熾羽 DoT 每層由 15 HP 改為 15 + Math.floor(最大HP×3%),N 層 = (15 + 最大HP×3%) × N(a.hp 為最大 HP)。hero_db.js BURST_DB 鳳凰文字同步。熾羽仍走 fixedDmg → 世界 BOSS 戰自動受 5000 單次上限保護。',
      '草龍王 BOSS 能力詳細介紹改資料驅動(world-boss-ui.html _wbAdvOpenBossInfoPopup):原本整段寫死火龍王(業火灼燒 / 龍吼震懾 / 天崩之炎 / 炎之意志 / 火風土暗護盾 / 火紅配色)→ 改為依當前龍王讀 HERO_DB[名].s1/s2、BURST_DB[名]、HERO_TRAIT[名] + lineup 的 element/shieldElements/shieldLayers,護盾元素 / 破盾元素(用 ELEMENT_DB 剋制表 vs_dis 動態算)/ 主題配色全部動態。大廳預覽卡(wb-boss-preview)的描述與屬性加 class 由 _wbApplyCurrentBossSkin 統一動態更新。火龍王顯示不變(讀回自己的資料),草龍王正確顯示劇毒藤縛 / 萬刃落葉 / 翠龍·萬藤絞殺 / 翠之意志 / 草盾×2+水+光,破盾火/風/暗。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.14.24(2026-06-13)— 🐉 草龍王完整可玩:專屬至寶正名 + 個性開場白/氣話 + 燃燒平衡 + 龍王機制凌駕確認
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.14.24',
    date: '2026-06-13',
    brief: [
      '🐉【草龍王(翠綠森龍王)完整可玩】',
      '   ・進入草龍王世界 BOSS 戰會正確顯示<b>草龍王立繪</b>並播放<b>專屬背景音樂</b>。',
      '   ・草龍王的排名專屬至寶正名為 <b>🐉 草龍王之鬚</b>(之前各處誤顯示「火龍王之牙」)。',
      '   ・草龍王擁有<b>自己的開場白與戰鬥對話</b>,不再講火龍王的台詞。',
      '⚖【平衡微調】草龍王的「燃燒」在<b>護盾啟動期間改為一樣吃 80% 減傷</b>(對齊天賦說明:火仍是牠的剋星,但護盾期間燃燒威力會被壓低)。',
      '🛡【龍王機制更穩固】再次確認:任何「無視天賦 / 穿透護盾 / 封印」類技能都<b>無法繞過龍王的受傷上限與元素護盾</b>,龍王的天賦凌駕於一切技能之上。',
    ],
    items: [
      '燃燒乙(老師裁示):移除草龍王燃燒 tick 的 _dotIgnoreShield → 護盾期間燃燒固定值改吃 80% 減傷(普通 -300→-60、強力 -600→-120),與天賦文字一致。中毒/猛毒維持「無視護盾減傷」(仍受 5000 單次上限),為其專屬設計、不在本次調整範圍。',
      '排名至寶正名:world-boss.js 新增 _WB_DRAGON_TREASURE_MAP + _wbGetCurrentDragonTreasureId/_wbGetCurrentDragonTreasureName();world-boss-ui.html 排名獎勵清單與 index.html _wbShowDragonTreasureInfo(? 彈窗、icon alt、副標)改依當前龍王動態顯示(翠玉草=草龍王之鬚 dragon_whisker_grass)。⚠ 與 index.html 領獎發放的 _WB_DRAGON_T_MAP 為兩份對照表,內容須同步(目前皆 vesuvius/cuiyu 兩筆)。',
      '龍王機制凌駕(確認,無程式變更):受傷上限 5000 + 元素護盾 80% 減傷在 doDmg 的 worldboss 分支「無條件」套用(無 ignoreBuffs/fixedDmg 例外閘);神槍手「穿透護盾」只穿一般 target.shield,不影響龍王的 _wbShields;天賦(上限/護盾/免疫)為被動、依龍王名判定觸發,無「封印天賦」狀態可關閉它(seal/sealall 只封技能使用)。經逐一檢查 _dotIgnoreShield 全檔僅剩中毒/猛毒一處(燃燒乙後),其餘一切傷害皆吃護盾減傷+5000 上限。',
      '每隻龍王專屬開場白:_wbBossOpeningRoar 改用 _WB_BOSS_ROAR_LINES(維蘇威=火紅三句 / 翠玉草=綠林三句)+ _WB_BOSS_ROAR_COLOR(咆哮字色配元素),依當前龍王挑,後備維蘇威。',
      '每隻龍王專屬戰鬥氣話:_ADV_BOSS_SKIP_LINES_MAP 新增「火山炎龍王」(火,6 句)與「翠綠森龍王」(草,6 句);並把翠綠森龍王加入 _SKIP_MAIN_BOSS_SET 讓挑選正確命中。',
      '首頁世界 BOSS 卡副標:原本寫死「🐉 火山炎龍王・全伺服器累積排名」,把龍王名包進 <span class="wb-curboss-nm"> → 由換皮 _wbApplyCurrentBossSkin 統一更新成當前龍王(配合 v3.14.23 onSnapshot 補快取 wbCurrentBossId,重整後也正確)。',
    ],
  },
];

// 通知 index.html 載入完成(可選,但建議保留)
try {
  if (typeof window._onChangelogReady === 'function') {
    window._onChangelogReady();
  }
} catch (e) { /* ignore */ }


// ════════════════════════════════════════════════════════════════════════
// ⏸ 尚未上線的「草稿」版本條目(2026-05-29 同步時由主陣列移到這裡暫存)
//   原因:線上實際最新版是 v3.11.24 / v3.11.25(玩家畫面右下角顯示 v3.11.24)。
//         以下 v3.11.31 / 30 / 27 的功能(編組頁「圖鑑整備」按鈕、網路駭客 #71、
//         幽幽 #70)尚【未】實際部署到線上,所以先放進這個「不會被顯示」的草稿陣列,
//         避免玩家在 v3.11.25 卻看到 v3.11.31 的更新內容。
//   ★ 等這些功能真的部署上線後:把對應的物件從本陣列「剪下」,貼回上方
//      window.GAME_CHANGELOG 陣列的「最上方」,即可恢復顯示(記得同步改檔頭版本號)。
//   ★ changelog 顯示程式只讀 window.GAME_CHANGELOG,不會讀這個陣列。
// ════════════════════════════════════════════════════════════════════════
window.GAME_CHANGELOG_DRAFT_UNRELEASED = [
  // ════════════════════════════════════════════════════════════════════
  // v3.11.31(2026-05-29)— 編組頁「圖鑑整備」按鈕 + 裝置信任小卡只在首頁
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.11.31',
    date: '2026-05-29',
    brief: [
      '📖 隊伍編組右側預覽:名稱旁新增「圖鑑整備」按鈕!',
      '   ・直接打開該英雄的圖鑑頁,進行至寶切換、能力加點、技能升級',
      '   ・關閉圖鑑後一鍵回到編組頁,不用重新邀約隊員',
      '',
      '🔧 右下角「已信任此裝置」小卡改為只在首頁顯示',
      '   ・進入關卡、編組、圖鑑、商店等畫面時自動隱藏',
      '   ・避免擋住右下角的功能按鈕,回到首頁時自動恢復',
    ],
    items: [
      '編組預覽(focusHero)名稱右側加「📖 圖鑑整備」按鈕 → _openHeroCodexFromTeam(name,idx):開 hero-page-overlay 後 openHeroDetail(name),設 _heroDetailReturnToTeam 旗標。',
      'closeHeroDetail 偵測旗標:收掉 hero-page-overlay + 重新 focusHero(idx,name) 套用剛剛的至寶/加點/技能變更,不觸發邀約;BGM 用 bgmEnsureSceneBgm 還原。',
      '裝置信任小卡 _updateTrustBadge 加 _isOnHomepageForBadge() 守門:任一主要 overlay 可見(adventure/hero-pick/hero-page/equip/shop/taiwan-map…)或戰鬥中(G.p2.length)即不顯示。',
      'uid 輪詢 interval 加首頁狀態追蹤:離開首頁立即移除 badge、回首頁重新渲染。',
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.11.30(2026-05-29)— 新英雄「網路駭客」(第 71 號,5 年 1 班 高同學設計)
  //   + 護盾值改為 HP 條藍色覆蓋層呈現 + 火爆女技能說明對齊
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.11.30',
    date: '2026-05-29',
    brief: [
      '🤖 新英雄登場:「網路駭客」(5 年 1 班 高同學設計,第 71 號英雄)!',
      '   ・玩遊戲玩膩了就在網路上搞高端惡作劇的程式天才',
      '   ・加入水晶召喚池(學生設計英雄)',
      '',
      '🐛 天賦「BUG 疊加」',
      '   ・開場竊取對手最高攻擊 + 最高特技值加到自己(持續 4 回合)',
      '   ・這份加成無法被消除、奪取或交換',
      '   ・每個新回合對隨機對手散播亂碼(附加隨機不利狀態)',
      '',
      '🔥 S1「攻陷防火牆」',
      '   ・消除對手全部有利狀態,每消除一個就獲得 20 護盾(最多 5 層)',
      '',
      '🐛 S2「強化 BUG」',
      '   ・把全體對手身上隨機 3 個不利狀態升級為強力版並延長 2 回合',
      '',
      '💻 爆發「超極密檔案 GET!」',
      '   ・奪取對手有利狀態(強力優先,無視不可奪取規則)',
      '   ・特技 150% 連續狙擊 3 次(從血量最低打到最高)',
      '   ・把造成的傷害轉化為治療,回復我方 3 次',
      '',
      '🛡 全新護盾呈現',
      '   ・護盾值改成顯示在 HP 條上的「藍色區塊」(靠左)',
      '   ・例:100 HP + 50 護盾 → 顯示 100+50/100,藍條佔 50%',
      '   ・受傷時先扣藍色護盾,藍條即時縮短,打光才扣綠色 HP',
    ],
    items: [
      '第 71 號英雄「網路駭客」,能力 58/11/15/16(總和 100),5 年 1 班 高同學設計。',
      '天賦「BUG 疊加」:戰開竊取對手最高攻+最高特(平衡上限 5+英雄等級),持續 4T(+1/級,不可消除/奪取/交換);每回合對隨機 N 名對手(1+級,上限 4)各附 1 個隨機不利狀態。到期由 tickStatus 還原 atk/sp。',
      'S1「攻陷防火牆」c5:clearGoodBuffs 消除全敵有利狀態,每消除 1 個 +20 護盾(上限 5 層;每級 +5/層),用 numeric h.shield 欄位(doDmg 會吸收)。',
      'S2「強化 BUG」c4:全敵隨機 3 個不利狀態升 _strong(不可淨化)並延長 2T;升至 4/7/10 級各 +1 升級數量。',
      '爆發「超極密檔案 GET!」:奪增益(強力優先,基礎 1 +1/級上限 5)→ 特技 150%(每級 ×1.10)三連 HP 低→高 → 傷害總和 /3 治療我方 3 次(HP 低優先)。傷害走 doDmg,世界 BOSS 5000 上限自動生效。',
      '護盾 HP 條呈現:renderCard 在綠色 HP 上疊藍色 .card-hp-shield2(width=護盾/最大HP),顯示護盾 = numeric h.shield + bigshield._hp(兩者皆 doDmg 會消費)。doDmg 扣盾後即時 renderCard,藍條同步縮短。CSS 同時寫進 main.css 與 index.html 內嵌 style(快取保險)。',
      '火爆女技能說明對齊:確認 S1 一擊必殺 / S2 超級射線 / 爆發 三刀射擊(玩家版+AI 版皆已實作),HERO_LORE 補上原本漏列的 S2「超級射線」。',
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.11.27(2026-05-28)— 新英雄「幽幽」(第 70 號,5 年 4 班 高同學設計)
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.11.27',
    date: '2026-05-28',
    brief: [
      '👻 新英雄登場:「幽幽」(5 年 4 班 高同學設計,第 70 號英雄)!',
      '   ・神秘又可愛的幽靈,惡鬼之軀卻有顆柔軟的心',
      '   ・加入水晶召喚池(學生設計英雄)',
      '',
      '🌫 天賦「幽魂體質」',
      '   ・用「特技值」代替攻擊出手,且免疫所有普通攻擊',
      '   ・不怕暗:受到暗屬性傷害減少(隨天賦等級最多 -50%)',
      '   ・怕光:受到光屬性傷害增加(隨天賦等級弱點漸減)',
      '',
      '🦷 S1「惡鬼撲食」',
      '   ・一口把對手咬到只剩一半血,並標記「等吞食」3 回合',
      '   ・對 BOSS/菁英改用特技 300% 造成傷害',
      '   ・吞食擊殺帶標記的對手 → 隊友回血,滿血溢出再轉成護盾',
      '',
      '🌑 S2「暗行」',
      '   ・潛入暗影 2 回合:完全免疫所有傷害與不利狀態',
      '   ・期間出手必中,而且傷害 +100%',
      '',
      '👻 爆發「惡夢遊魂」',
      '   ・全體敵人陷入「惡夢」:受到的傷害翻倍(隨等級更高)',
      '   ・全體隊友化為「遊魂」:受到的傷害大幅降低',
      '   ・兩個狀態都無法被消除、奪取或交換',
    ],
    items: [
      '第 70 號英雄「幽幽」,能力 55/0/20/25(總和 100),5 年 4 班第 8 位設計師(高同學)。',
      '天賦「幽魂體質」:普攻改用特技值 + 免疫普攻;受暗 -30%(每級 -5%,Lv4 -50%)、受光 +30%(每級增幅 -5%)。',
      'S1「惡鬼撲食」c4:非 BOSS 扣至剩 50% HP;BOSS/菁英改特技 300%(走 5000 上限保護)。附「等吞食」3T,吞食擊殺者回血(目標最大 HP 100%)溢出轉護盾(上限自身 HP×100%,每級 +5%)。',
      'S2「暗行」c5:自身 2T(每級 +1)免疫所有傷害與不利,期間必中且傷害 +100%(每級 +5%)。',
      '爆發「惡夢遊魂」:全敵惡夢 2T(受傷 ×2.0~2.8)、全友遊魂 2T(受傷 -70~90%),兩狀態不可消除/奪取/交換。惡夢倍率乘算且在 BOSS 5000 上限前套用,不破上限。',
      '友傷防呆:S1 玩家版鎖敵方/AI 版用引擎敵方目標;吞食回血僅幽幽同陣營擊殺者觸發;惡夢/遊魂不影響治療。'
    ]
  },
];