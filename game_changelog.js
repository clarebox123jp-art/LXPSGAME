// ════════════════════════════════════════════════════════════════════════
//  game_changelog.js  —  LXPSGAME 更新日誌
//  最後更新:2026-07-01  / 目前主程式版本:v3.17.6(GM 送禮三合一:送禮記錄查詢[姓名/獎項]+GM 發放召喚卷獨立區分並顯示發放理由時間+安全補發遺失獎勵[雙權威防重複])
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
  // v3.17.6 — GM 送禮三合一:①送禮記錄查詢(姓名/獎項)②GM 發放召喚卷獨立區分+背包顯示發放理由時間 ③安全補發遺失獎勵(雙權威防重複)
  {
    ver: 'v3.17.6',
    date: '2026-07-01',
    brief: [
      '🎁【老師發放的召喚卷,現在一眼就分得出來】以後老師發給你的召喚卷(UR/SSR/SR 自選卷、隨機卷、至寶卷)都會標成「GM獎勵…召喚卷」,和你自己合成/獲得的分開放:背包最上方的召喚卷總覽會多一區「🎁 老師發放的召喚卷」,在召喚星空的使用畫面也會獨立一區「🎁 老師發放的召喚卷」,而且每張卷還會顯示老師發放的理由(你的優良事蹟)和時間,永遠不會再和自己合成的搞混。',
      '🛟【遺失的獎勵,老師可以安全補發、不會重複】如果你確定老師發過某個獎勵、但你雲端查不到有領到,老師可以幫你安全補發;系統會先用兩道權威記錄把關,只有確認你真的沒領過才會補發,已經領過或用過的絕對不會再補一次,讓每一份獎勵都可信、不重複。',
      '⚔️【鬥技場按鈕字放大】鬥技場「單人挑戰／雙人決鬥」按鈕文字加大加粗,更好按。',
      '🐛【問題回報冷卻縮短】回報問題後的等待時間由 10 分鐘縮短為 1 分鐘,遇到狀況能更快回報給老師。',
    ],
    items: [
      '★ v3.17.6【GM 發放召喚卷獨立道具·index.html+admin_panel.js】老師發放的召喚卷改為 7 種獨立道具 gm_summon_ticket_*(BACKPACK_ITEM_DEF 新增·_gmReward/_base 標記),與自己合成的 summon_ticket_* 永久區分。三獎勵產生器(課堂/全體/序號 _buildReward)改發 gm_ 變體+標籤「GM獎勵…」。召喚星空面板 _openSummonTicketModal 新增「🎁 老師發放的召喚卷」專區(按鈕呼 _useGmTicket);背包總覽 _bagTicketOverviewHtml 拆「自己獲得」+「🎁 老師發放的召喚卷」兩區並顯示理由時間;背包物品說明 gm_ 卷附發放理由+時間。',
      '★ v3.17.6【使用不動核心引擎·零回歸】_useGmTicket(gmId):消耗 1 張 gm_ 卷 → 暫時實體化 1 張對應 base 卷(window._suppressTicketLedger 抑制帳本)→ 呼叫既有 base 卷使用流程(_useSummonTicket/_openSummonTicketPickModal/_useTreasureTicket/_openTreasureTicketPickModal)。核心召喚/揭曉/機率完全沿用原碼未動;最壞情況(自選卷取消挑選)僅把 gm_ 卷轉成一般 base 卷,價值不減。_GM_TICKET_BASE/_GM_TICKET_OF 映射;useBackpackItem 加 gm_ 分支導召喚星空。',
      '★ v3.17.6【發放理由+時間中繼】認領成功時 _recordGmTicketMeta(uid,reward.backpack,merit,at) 把事蹟+時間記到本機(lxps_gm_ticket_meta_{uid}·綁 uid)·供背包/星空/總覽顯示「🎁 老師發放理由…（時間）」;_fbClaimGmClassReward 入帳成功後呼叫,純顯示用不影響存檔。',
      '★ v3.17.6【送禮記錄查詢·需求1·admin_panel.js+index.html】「課堂獎勵發放」卡「查看送禮記錄」升級為「🔍 送禮記錄查詢(姓名/信箱/uid/獎項/事蹟關鍵字)」:後端 _fbAdminGiftAudit(keyword) 讀 gmGiftLog 關鍵字過濾 + 交叉比對 gmClassRewardClaims 認領文件,每筆標 ✅已領取(UID權威·含領取時間)/❌未領取/❔未知;_fbWriteGmGiftLog 加 merit/rewardId/kind,_send 帶入供比對。',
      '★ v3.17.6【安全補發·需求3·index.html+admin_panel.js】_fbAdminResendLostGift(uid,rewardId):補發前用兩道權威訊號把關——①gmClassRewardClaims 認領文件存在=已入帳→擋 ②玩家主檔 _gmcrClaimed 含本筆(領取入帳前就標記·rollback 會移除)→擋。雙雙查無才補:停用原收件箱該筆 enabled:false(避免同時領原筆+補發筆)+寫新一筆收件箱(新 rewardId·create-only 認領規則天然防重複領)→補發即權威化不重複。查詢結果每筆「❌未領取」附「🔁 安全補發」鈕。',
      '★ v3.17.6【範圍/驗證】本輪改 index.html + admin_panel.js + game_changelog.js;hero_db.js 內容未改僅 manifest 版號·免重傳。新道具 gm_ 卷走 playerBackpack 自寫、gmGiftLog 新欄位/補發走既有 isAdmin 路徑 → 免新增 firestore.rules(上輪 ticketLedger 區塊仍待部署)。七點版本同步 → v3.17.6。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.86)。',
    ],
  },
  // v3.17.5 — 英雄圖鑑來源標示更精準(全94隻標籤+日期·汙染/未收錄區分·未收錄不顯示按鈕)+ 召喚到超越極限果實專屬金色光圈動畫
  {
    ver: 'v3.17.5',
    date: '2026-07-01',
    brief: [
      '📖【英雄圖鑑來源標示更清楚】每隻英雄圖鑑左下角現在會正確顯示「怎麼得到的＋日期」:🎒初始角色／📝答題獎勵英雄／🗺冒險關卡解鎖／🌌召喚星空／🎫隨機召喚卷／🎯自選召喚卷／🎁老師發放／🎨學生設計英雄,全部 94 隻都標示清楚。',
      '🔎【看得到證據,該留就留、該收回就收回】若某隻是「⚠ 非你解鎖·來自其他帳號的資料」會清楚標示「待收回」;若只是「❓ 來源不明」也會請你自行確認。你可以自己按「✅ 確認是我的」或「🗑 不是我的」決定。',
      '🔒【真正沒有的英雄不再有按鈕】完全查不到取得紀錄的英雄(例如老師根本沒發過的 UR),圖鑑顯示「尚未擁有(未收錄)」、不再出現任何按鈕;只有「你曾經解鎖過卻不見了」的英雄才會出現「🔓 要救回」鈕。',
      '🍑【召喚到超越極限果實有專屬動畫】在召喚星空抽到「超越極限果實」時,改播金色光圈特效,和抽到角色的召喚動畫做區別,一眼就看得出抽到的是果實。',
    ],
  },
  // v3.17.4 — 救英雄工具收斂成一個:一鍵涵蓋所有被回收/刪除途徑、連原等級從存檔救回(治本:GM 不再自動判定刪英雄)
  {
    ver: 'v3.17.4',
    date: '2026-06-30',
    brief: [
      '🛟【被弄丟的英雄,老師會連同你練的等級一起救回】之前清理重複英雄時,因為系統的「取得紀錄」天生不完整,造成少數同學自己練過的英雄被誤刪、又難以復原,非常抱歉。老師已經把救回工具整合成「一個按鈕救回全部」:不管你的英雄是被哪一種清理弄丟的,只要你練過它,老師都能從你的雲端存檔把它連同原本的等級、技能、天賦完整還給你。如果你發現有英雄不見了,登入後留意老師的道歉與還原通知即可。',
    ],
    items: [
      '★ v3.17.4【救英雄工具收斂·index.html+admin_panel.js】根因盤點:GM 後台原有 6 個「救英雄」工具(誤刪救回/補償批次回收救回/帳號救援審核/一鍵帳號重建/審查誤刪救回/遺失英雄復原),各只管一種弄丟途徑→老師「不知道按哪個」。把 v3.17.2「🛟 一鍵無損救回」的鎖定判定 _gmcrIsCompReclaimed 由「只認 admin_delete 且 reason 含『補償批次回收』」放寬為「任何 admin_delete 或 audit_error_recovered」→ 一個工具涵蓋所有回收/刪除途徑(補償批次回收/查無紀錄回收/GM 手動刪污染/帳號重建移除幻影/玩家端登入自動回收/學生圖鑑自審 disown),全部從存檔(saves/live·safe)還原原等級救回、寫 admin_grant 永久免疫。掃描/救回兩處共用同一判定故一併放寬;救回前對最新雲端權威重判仍在。',
      '★ v3.17.4【UI 文案·admin_panel.js】「🛟 補償批次回收·一鍵無損救回」改名「🛟 一鍵救回被誤收/誤刪的英雄(連同原等級·這是你唯一需要的救英雄工具)」,說明改為「涵蓋所有弄丟途徑·只要練過就掃得出·寧可多救也不漏(刻意符合誤刪是大忌鐵律·會把當初該刪的污染也一起救回)·清污染之後只靠學生自己按不是我的」;掃描鈕/空狀態/計數文字一併對齊。免三點同步(沿用既有卡與後端)。',
      '★ v3.17.4【治本主軸確立】污染↔救援拉鋸的真正解法=「GM/系統絕不自動判定學生英雄該不該刪」,因為判定依據(活動記錄/帳本)天生不完整、任何自動判定都會誤傷。已落實:(一)v3.17.3 發放當下寫 admin_grant·永不被當 compensation 誤收;(二)v3.17.3 玩家端登入自動回收永久停用;(三)v3.17.3 移除 GM「補償批次回收」工具;(四)本版救回工具放寬到一鍵救回全部。建議下一步(待裁示):移除僅存的「🩹 查無紀錄過度補償收回」工具,污染清理只保留「學生自己按不是我的」(學生主動·可逆)+ GM 手動到活動頁看個案;救援審核改以「存檔三槽 union」為權威而非帳本反推(根治復原失敗)。',
      '★ v3.17.4【範圍/驗證】本輪改 index.html(_gmcrIsCompReclaimed 放寬 + 5 處版號)+admin_panel.js(救回 UI 文案 + 版號)+game_changelog.js;hero_db.js 內容未改免重傳;不涉新 firestore 集合/欄位(GM 走 isAdmin 既有路徑)。七點版本同步→v3.17.4。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.84)。',
    ],
  },
  // v3.17.3 — 根治:老師正式發放的英雄永久合法(發放即寫 admin_grant) + 下架「補償批次回收」帳本不全工具
  {
    ver: 'v3.17.3',
    date: '2026-06-30',
    brief: [
      '🛡【「正當取得的英雄被誤收」問題,老師已從源頭修好】之前老師清理重複補發的英雄時,因為早期的「取得紀錄」沒寫齊,曾把少數同學自己努力取得的英雄也一起收走。這一版老師從根本修好了:以後凡是老師發放給你的英雄(課堂獎勵、序號、全班獎勵、補償救援),系統都會「當下就把它永久記成是你的」,從此不會再被任何清理工具誤收;同時把會誤判的舊「自動回收」也整個關掉了。如果你先前有英雄被誤收,老師會用「無損救回」工具連同原本的等級幫你還回來,請留意登入後的道歉通知。',
    ],
    items: [
      '★ v3.17.3【根治·index.html】污染↔救援拉鋸的真正病根=_fbCompensatePlayer 發英雄時寫 source:\'compensation\'(會被「補償批次回收/查無紀錄回收」當待收目標)、但同函式發至寶卻早就寫 source:\'admin_grant\'(永久合法)→ 英雄與至寶兩套標準不一致。修法:英雄補償紀錄(L≈10599)改寫 source:\'admin_grant\'+adminAction:true+uid(對齊至寶 L≈10629)→ 凡老師正式發放的英雄(課堂獎勵領取/虛寶序號/全體獎勵/學生補償/救援補回/練習營結算·全走此函式)當下即永久合法、永不被任何回收工具當 compensation 誤收。歷史已發的(已是 compensation)不變·配合「🛟 一鍵無損救回」補救。',
      '★ v3.17.3【下架帳本不全工具·admin_panel.js】移除 GM「🎁 補償批次回收(依日期·無真實解鎖紀錄即收·含已練)」整支工具(HTML 子區塊 + _initCompBatchReclaimSection wiring 129 行)→ 留碑文。原因:它的判定壓在「帳本紀錄寫得齊」這個前提上,而紀錄當初就沒寫齊(=根治前的病根)→ 前提不成立·留著下次還會誤收已練的正當英雄。後端 _computeCompBatchesFromDoc/_fbAdminScanAllCompBatches/_fbAdminReclaimCompBatchForUid 保留為 dead code(無 UI 入口·不再被呼叫)·不貿然刪以免動到依賴鏈。',
      '★ v3.17.3【關閉玩家端自動回收·index.html】_GMCR_AUTO_RECLAIM_ENABLED 由 true 改 false(永久停用)。玩家端登入自動回收(v3.16.99)沿用同一套有缺陷的 _computeCompBatchesFromDoc 判定·對白名單日期的 compensation 英雄自動回收→同屬「帳本不全會誤收」風險·與 GM UI 一併下架。閘門 L≈115642 if(!_GMCR_AUTO_RECLAIM_ENABLED) return 早退·不動任何資料。',
      '★ v3.17.3【保留/範圍/驗證】保留 v3.17.2「🛟 補償批次回收·一鍵無損救回」(救回既有誤收·從存檔還原原等級+寫 admin_grant 永久免疫)。v3.16.92「查無紀錄」工具(只收 Lv1 沒練·風險低)暫留·老師可視需要再決定移除。本輪改 index.html(根治發放紀錄+關自動回收+5處版號)+admin_panel.js(移除補償批次回收 UI/wiring+版號)+game_changelog.js;hero_db.js 內容未改免重傳;不涉新 firestore 集合/欄位。七點版本同步→v3.17.3。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.83)。',
    ],
  },
  // v3.17.2 — GM 補償批次回收·一鍵無損救回(從存檔還原等級/養成 + 寫 admin_grant 永久免疫)
  {
    ver: 'v3.17.2',
    date: '2026-06-30',
    brief: [
      '🛟【英雄被誤收的同學,老師會連同原等級幫你還回來】先前老師在清理「重複補發的英雄」時,因為早期的取得紀錄沒有寫齊,可能不小心把少數同學自己努力取得、甚至已經練到高等的英雄也一起收走了,非常抱歉!老師後台已新增「無損救回」工具:會從你的雲端存檔讀回那些英雄原本的等級與技能/天賦/爆發/素質,完整地還給你(不是退回 1 級重練),而且還回來的英雄之後不會再被任何清理工具誤收。如果你發現有英雄不見了,登入後留意老師的道歉與還原通知即可。',
    ],
    items: [
      '★ v3.17.2【補償批次回收·一鍵無損救回·index.html+admin_panel.js】根治「v3.16.98 補償批次回收誤收正當英雄、且現成救回工具會還原成 Lv1」:根因 _fbAdminBulkRemoveHeroes 收回時把等級+5養成表+經驗整批 _clean 清掉、且未暫存原等級(不像 v3.16.19 存 _auditRecoveredLevels)→ 舊救回工具讀不到原等級只能補 Lv1。救星=回收只 updateDoc 主檔、完全沒碰三槽存檔(saves/live、saves/safe),回收前完整等級/養成原封不動留在存檔槽 → 從那裡讀回 = 無損還原。',
      '★ v3.17.2【三後端函式·index.html】新增 _fbReadHeroGrowthFromSaves(讀主檔+saves/live+saves/safe,對每隻英雄取等級最高那槽整包回傳養成)+ _fbAdminScanCompReclaimedHeroes(掃全體,鎖定「最新一筆=admin_delete 且 reason 含『補償批次回收』、且現已不在 unlockedHeroes」的英雄,並從存檔讀回原等級供核對·只對候選玩家讀存檔)+ _fbAdminRestoreCompReclaimedForUid(權威重判→從存檔還原等級/養成只升不降→寫 admin_grant[auditRestored]永久免疫任何回收→寄道歉通知)。',
      '★ v3.17.2【GM UI·admin_panel.js】「🔴 過度補回稽查與回收」卡內、「🎁 補償批次回收」子區塊下方新增「🛟 補償批次回收·一鍵無損救回」子區塊:🔍 掃描列出每位被誤收英雄(晶片標「LvN 可還原」或「存檔無料只能Lv1」)→「🛟 救回這位」或「🛟 全部一鍵救回」(走 _fbAdminRestoreCompReclaimedForUid·救回前再判一次)。無 ?.·免三點同步(加在既有卡內)。',
      '★ v3.17.2【取捨/安全/範圍】帳本當初沒寫真實解鎖紀錄→分不出純污染 vs 正當取得→一律救回(合「誤刪是大忌、保守漏收可接受」鐵律);少數連 safe 槽都被覆蓋者只還原本體(Lv1·會標示·可另循帳號救援個案處理)。鎖定 admin_delete+「補償批次回收」reason→不誤救正常手動刪/暴增收回。建議救回後停用「補償批次回收」工具(其判定壓在帳本紀錄完整性、前提不成立);根治方向=發放當下就把 ticket/admin_grant 紀錄寫進帳本。本輪改 index.html+admin_panel.js+game_changelog.js;hero_db.js 內容未改免重傳;不涉新 firestore 集合/欄位(GM 走 isAdmin 既有路徑)。七點版本同步→v3.17.2。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.82)。',
    ],
  },
  // v3.17.1 — 更新流程友善化:不打斷戰鬥/知識王·黃色通知10秒自動隱藏·回關卡首頁才重整·重整前先同步雲端(玩家公告)
  {
    ver: 'v3.17.1',
    date: '2026-06-30',
    brief: [
      '🔄【更新程式時更友善:不會打斷你的戰鬥與知識王】以前老師一更新遊戲,有時會在你戰鬥中、或做知識王挑戰時,突然要你重新整理、打斷進行到一半的進度。現在改成:偵測到新版本時,如果你正在「戰鬥中、做知識王挑戰、或打世界 BOSS」,系統絕對不會打斷你;會一直等到你回到關卡選擇首頁、而且沒有正在進行的對戰時,才自動幫你套用新版本。',
      '⏱️【上方黃色更新通知 10 秒會自動收起】畫面最上方那條黃色的「老師更新了遊戲」通知,現在最多顯示 10 秒就會自動收起來,不會一直卡在畫面上;右上角的「🔄 重新整理」按鈕仍然會亮著提醒你有更新,你也可以隨時自己按它立刻套用。',
      '☁️【重新整理前一定先幫你存到雲端】系統在自動重新整理、套用新版本「之前」,一定會先把你目前的存檔同步到雲端(以雲端為準)再重整,確保你的等級與進度不會因為更新而遺失。',
    ],
    items: [
      '★ v3.17.1【更新流程友善化·index.html】老師需求:更新程式時(一)不打斷正在戰鬥/做知識王/打世界BOSS的玩家;(二)黃色置頂更新通知最久顯示10秒就自動隱藏;(三)等玩家回到關卡選擇首頁才強制重新整理;(四)重整前務必先把存檔自動同步到雲端。',
      '★ v3.17.1【新增三 helper·index.html】_lxpsBusyNoReload()=戰鬥中(_isInBattleNow)||世界BOSS(_wbInWorldBossMode/_wbSoloPracticeMode)||知識王挑戰流程中(king-question-popup/king-start-popup/king-challenge-popup/king-result-popup/king-today-result-popup 任一開著);_lxpsSafeToForceReloadNow()=不忙 且 雲端已載完(_cloudLoadDone) 且 adventure-overlay 顯示中(=回到關卡選擇首頁且閒置才算可安全強制硬刷);_lxpsSyncThenHardRefresh(reason)=先 await gameCloudSave()(v3.17.0 已容錯化、localStorage 爆滿不再中斷雲端寫入)再 _hardRefreshForPWAUpdate(),加 6 秒逾時兜底防校園慢網卡住 await、單次旗標 _lxpsSyncRefreshInFlight 防重入。',
      '★ v3.17.1【改三入口·index.html】_lxpsTriggerForcedUpdate:偵測到更新時若非「安全可重整」(戰鬥/知識王/世界BOSS/非關卡首頁)一律延後→設 _pendingForcedUpdate + 發 banner(雲端載入中只記旗標不彈 banner 打擾),僅在關卡首頁閒置才走防硬刷迴圈計數→同步雲端後硬刷(原「非戰鬥即直接硬刷」收斂);_showUpdateAvailableBanner 加 10 秒 setTimeout 自動淡出隱藏(gmBannerSlideUp·保留 _pendingForcedUpdate 與右上🔄按鈕亮起);_flushPendingUpdateIfAny(回關卡頁 L71584 hook + 雲端同步完成 L123838 hook)改用 _lxpsSafeToForceReloadNow 判定(取代原 _isInBattleNow·涵蓋知識王/世界BOSS/非首頁/載入中)、硬刷前改走 _lxpsSyncThenHardRefresh。_hardRefreshForPWAUpdate 只清 Cache Storage + 卸 SW、不碰 localStorage/Firestore → 已先同步雲端故重整無損;其戰鬥中二次確認分支不受影響(本流程只在非戰鬥+首頁呼叫)。',
      '★ v3.17.1【驗證/版本/範圍】index.html 19 個非 module inline script + 1 個 Firebase module 全數語法檢查通過、三檔 0 lone surrogate;admin_panel.js 語法過、0 個真正可選串接(?.);game_changelog.js node --check 過、維持 20 筆(移除最舊 v3.16.81)。七點版本同步 → v3.17.1。本輪疊在 v3.17.0 之上(逃走小怪逃光卡死 + 無法同步/英雄等級倒退 兩根因修復已含其中),改 index.html(版本更新系統 4 區塊)+ game_changelog.js;admin_panel.js 僅版號對齊;hero_db.js 內容未改免重傳。注意:玩家停在關卡首頁不動時靠每 90 秒偵測輪詢觸發;知識王作答完關閉彈窗後若未經過回關卡頁 hook,亦由 90 秒輪詢兜底套用。⚠ 仍未動「INDEX 登入優化(約 900 人同時登入)」高風險任務,建議單獨一輪做+單獨測。',
    ],
  },
  // v3.17.0 — 逃走小怪逃光後卡死修復 + 無法同步/英雄等級倒退修復(玩家公告)
  {
    ver: 'v3.17.0',
    date: '2026-06-30',
    brief: [
      '⚔️【逃走的小怪逃光後卡住、戰鬥結束不了 → 修好了】寶箱怪、小惡魔這類「會逃跑」的小怪,如果牠們是場上最後的敵人、全部逃光之後,原本會卡在戰鬥畫面動彈不得(沒有敵人可以打、戰鬥又不會結束)。現在敵人全部逃光時,戰鬥會正確判定為「清場」、自動結束並離開戰鬥,不再卡死。(聖甲蟲那種「留在場上變灰」的逃跑本來就正常,不受影響)',
      '☁️【一直「無法同步雲端」、英雄等級莫名變低 → 找到根本原因修好了】少數同學(特別是共用 iPad)遇到「手動同步雲端一直失敗、試很多次都不行」,甚至「英雄等級打完一場後莫名倒退變低」。根本原因是:共用平板上累積了很多人的存檔備份,把瀏覽器的本機儲存空間塞爆了 → 導致存檔程序在「還沒寫到雲端之前」就中斷 → 雲端一直沒更新到你的新進度 → 重新整理就讀回比較舊(較低)的等級。現在已修好:本機空間塞爆時,系統會自動清掉「別人帳號的舊備份、以及過期的備份」釋放空間;而且就算本機真的寫不進去,也一定會照常把資料同步到雲端(以雲端為準),不再卡同步、也不再倒退。',
    ],
    items: [
      '★ v3.17.0【逃走小怪卡死·index.html·checkWin】根因:寶箱怪/小惡魔逃跑會把自己從 G.p2 用 splice 移除 → p2 變成空陣列;v3.11.4 防呆見「空 p2」即 return false 不判勝利(原為擋黑暗球 init 失敗、p2 從沒生成卻直接戰鬥勝利的漏洞),卻誤把「敵人全逃光」也當成 init 失敗 → 戰鬥永不結束、玩家卡死(回報1 maokong mini 戰 round3 p2 空·回報4 同源)。修法:checkWin 開頭設 G._everHadEnemies(敵人存活時設 true);空 p2 防呆改判 if(!G._everHadEnemies) 才擋(從頭到尾沒出現過敵人=init 失敗),否則落到下方正常結算(mini 戰 _advMiniBattleActive→advFinishMiniBattle(true)、一般戰→_showResultWithDrama(true))。聖甲蟲 v3.15.72 已改「留場變灰」不 splice·本就不受影響;逃跑兩路徑(主動技能箱底抹油 + 被動)既有 if(checkWin())return 現會正確 return true 結束。',
      '★ v3.17.0【無法同步/等級倒退·index.html·gameCloudSave】根因(回報「手動同步雲端失敗·試八次」「學霸 22→8 倒退」):共用 iPad 累積多位學生 lxps_{uid}_progress 整包存檔鏡像 → localStorage(約 5MB)爆滿 → gameCloudSave 本地鏡像 localStorage.setItem 拋 QuotaExceededError 往上炸、整個函式中斷在「雲端寫入(_fbSaveLive/_fbSave)之前」→ 雲端永遠寫不進去(同步失敗八次)、本地練的新等級沒上雲 → 重整讀回舊雲端 = 等級倒退。這是被誤當 merge/載入問題追了很多版的真兇。修法:① 本地鏡像 setItem 包 try-catch,即使寫不進去也照常往下做雲端寫入(雲端權威);② 新增 _lxpsFreeLocalStorageQuota(currentUid):爆滿時安全清「其他帳號的 lxps_{別人uid}_progress 鏡像(雲端權威)+ 過期備份(任何 *_expiresAt 時間戳已過)」釋放空間後重試一次,絕不動當前帳號資料或未過期備份 → 零誤刪風險。',
      '★ v3.17.0【驗證/版本】index.html 19 個非 module inline script + 1 個 Firebase module 全數語法檢查通過、0 lone surrogate;admin_panel.js/game_changelog.js 語法過、admin_panel.js 0 個真正可選串接(?.)。七點版本同步 → v3.17.0。GAME_CHANGELOG 維持 20 筆(移除最舊 v3.16.80)。本輪改 index.html(checkWin 3 處 + gameCloudSave 2 處)+ game_changelog.js;admin_panel.js 僅版號對齊;hero_db.js 內容未改免重傳。⚠ 仍未動「INDEX 登入優化(約 900 人同時登入)」高風險任務,建議單獨一輪做+單獨測。',
    ],
  },
  // v3.16.99 — 登入自動整理「老師誤補發的英雄」+ 二次確認(玩家公告)
  {
    ver: 'v3.16.99',
    date: '2026-06-30',
    brief: [
      '🙇【老師的更正通知·自動整理誤補的英雄】之前的「帳號救援」因系統設定問題,把一些你原本沒有的英雄誤補進了帳號。現在登入時,系統會自動找出「老師在特定日期(目前是 6/25)誤補發、而你查不到自己真正取得紀錄」的英雄,跳出「🙇 老師的更正通知」列出清單 → 你按「✅ 好,整理我的圖鑑」就會把這些誤發的整理掉,圖鑑回到原本乾淨的狀態(之後也可以重新用自選召喚卷抽你真正想要的)。',
      '✅【你自己的英雄完全不受影響】只要是你自己抽到、解鎖過的英雄,都不會出現在清單、完全不動;若有整理錯的,到關卡頁「📨 帳號救援申請」→「🔓 我遺失的英雄要回來」勾選送出,老師核對後補回。整理完會再出現一次「確認是不是我的角色」勾選,這時清單只剩沒被整理掉的英雄,讓你再確認一次。',
    ],
    items: [
      '★ v3.16.99【玩家端自動回收·階段1·index.html】新增日期白名單 _GMCR_BAD_COMP_DATES(目前含 2026-06-25·老師可加錯誤批次日期·正常補發日期絕不放)+總開關 _GMCR_AUTO_RECLAIM_ENABLED(出問題即時關)。登入序列 4000ms hook 呼叫 _lxpsAutoReclaimBadCompHeroes:總開關/白名單空/uid空/GM救援中(_adminRescueInProgress)/防重入/雲端未載完(擁有<8 輕量重試)皆不動作=只漏不誤刪;呼叫 _fbScanMyBadCompHeroes(讀自己 getDocFromServer doc·跑 v3.16.98 _computeCompBatchesFromDoc·取白名單日期內無真實解鎖的 compensation 英雄)→ 讀取失敗重試→ 已對此白名單版本跑過早退→ 空名單寫旗標不重載→ 有清單彈 _gmcrShowReclaimNotice 告知。',
      '★ v3.16.99【回收引擎·index.html】_fbApplyBadCompReclaim(uid,names,verTag):鏡像 v3.16.19 _fbApplyAuditErrorRecover 但用「獨立旗標 _gmcrAutoReclaimVer」(綁白名單版本字串·不碰 v3.16.19 的 _auditRecoverDoneV1→跑過自我審查的玩家也能回收 6/25 批)。只回收雲端確實擁有者→標可逆 audit_error_recovered(GM 一鍵永久復原/救援卡 _fbAdminRestoreLostHeroes 可還原)→至寶解裝保留本體→清 unlockedHeroes+6 養成表全 _s→暫存原等級 _auditRecoveredLevels→蓋 _authoritativeRestoreAt 乾淨重載。告知 UI 點確認→回收成功→設 localStorage _gmcrPostReclaimAudit_{uid}→1.5s 重載。',
      '★ v3.16.99【階段2·二次確認·index.html】_maybeShowAccountAuditOnLogin 開頭改:僅「剛回收帳號(localStorage _gmcrPostReclaimAudit_{uid} 在)」解除 v3.16.31 早退、走原有「本機+雲端都查無自己 uid 紀錄才開 _openAccountAudit」審查(此時清單只剩沒被回收的)+消耗旗標+清封存旗標讓審查能跑;其餘帳號維持 v3.16.31 止血不彈(不影響全校)。可逆:二次確認「不是我的」走既有 disown(GM 可一鍵救回)。',
      '★ v3.16.99【驗證/版本】index.html 20 個 inline script node --check 全過、0 lone surrogate;admin_panel.js/game_changelog.js node --check 過、admin_panel.js 0 可選串接。七點版本同步 → v3.16.99。GAME_CHANGELOG 維持 20 筆(移除最舊 v3.16.79)。本輪改 index.html(自動回收引擎+掃描+orchestrator+告知UI+階段2串接+登入hook)+game_changelog.js;v3.16.98 GM 補償批次回收 admin_panel.js UI 一併輸出;hero_db.js 僅 manifest 版號免重傳。⚠ 載入路徑+自動回收=高風險區·建議老師先用測試帳號實測階段1(該收的收/不該收不出現)+階段2再放心全校。',
    ],
  },
  // v3.16.98 — GM「補償批次回收」(後台工具·依台灣日期·無真實解鎖紀錄即收·含已練)
  {
    ver: 'v3.16.98',
    date: '2026-06-30',
    adminOnly: true,
    brief: [
      '🎁【後台·GM 補償批次回收】老師後台「🔴 過度補回稽查與回收」卡新增「🎁 GM 補償批次回收(依日期·無真實解鎖紀錄即收·含已練)」:把某次救援大量補進、但學生自己查無真實解鎖紀錄的 compensation 英雄,依台灣補償日期整批列出、逐批或逐位回收(即使已練到高等也收;學生自己抽到/解鎖/老師正式補發/起始角一律保留不誤刪)。受影響學生會收到「老師的更正通知」登入彈窗。(玩家端一般無感)',
    ],
    items: [
      '★ v3.16.98【判定·index.html】新增 _computeCompBatchesFromDoc(d,uid):讀「完整」_heroUnlockHistory 逐筆,以「自己 uid(或無 uid 早期)·source」分類 → realUnlock = source 不在 SUSPECT{compensation,legacy_grandfather,migration_seal,admin_delete,audit_error_recovered}(故 summon_rare/ticket_*/maokong/admin_grant/initial/player_confirmed/空字串 = 真實 → 永久保護);compDates = source==compensation 的台灣日期集合(_twDateKeyForComp 用 +8 偏移+getUTC*+手動補零·不依賴執行時區)。候選 = 非初始8(_ARENA_INITIAL_HEROES)且 無 realUnlock 且 有自己 compensation 紀錄 → 依日期分組。★ legacy_grandfather 刻意算 SUSPECT(突破 v3.16.84「練過自動補蓋 UID」洗白),故拘留者 Lv.36 等已練但無真實解鎖者收得回(v3.16.92 effort 閘門收不回)。',
      '★ v3.16.98【掃描/回收·index.html】_fbAdminScanAllCompBatches():getDocs 全體 → 依台灣日期聚合 batches[{date,ownerCount,totalHeroes,owners[{uid,email,displayName,heroes[{name,lv}]}]}](日期新→舊)。_fbAdminReclaimCompBatchForUid(uid,dateStr,heroNames):getDocFromServer 權威重判 → 只收「仍是該日 compensation 且無真實解鎖」∩ 傳入名單 → 走既有 _fbAdminBulkRemoveHeroes(清 unlockedHeroes+6 養成表+全 _s+至寶解裝保留本體·寫 admin_delete 可逆不復活·蓋 _authoritativeRestoreAt 乾淨重載)·不帶 compensate=不補償·寄 type=comp_batch_reclaim 更正通知。',
      '★ v3.16.98【面板·admin_panel.js】「🔴 過度補回稽查與回收」卡內新增子區塊 _initCompBatchReclaimSection:🔍 掃描 → 每日期批次卡(header 日期/N位/M隻 +「🗑 回收此整批」+ 逐位列玩家英雄晶片[Lv/⚠已練]+「🗑 收回這位」)。逐批 _reclaimBatch、逐位 _reclaimOne,皆 confirm 警告含已練、權威重判、進度顯示。6/25 21:25+21:31 聚成同一「2026-06-25」批一鍵收·6/22 另成一批不誤收。無 ?.、_esc HTML 跳脫。與 v3.16.92「查無紀錄」工具並存(保守只收 Lv1 vs 放寬收已練)。',
      '★ v3.16.98【驗證/版本】index.html 20 個 inline script node --check 全過、0 lone surrogate;admin_panel.js/game_changelog.js node --check 過、admin_panel.js 0 個真正可選串接(?.)。七點版本同步 → v3.16.98。GAME_CHANGELOG 維持 20 筆(移除最舊 v3.16.78)。本輪改 index.html(3 後端函式)+admin_panel.js(子區塊 HTML+JS)+game_changelog.js;hero_db.js 僅 manifest 版號免重傳。另:任務1「INDEX 登入優化」本輪未動(全體 900 學生命脈·高風險·建議單獨一輪做+單獨測·見文字簡述)。',
    ],
  },
  // v3.16.97 — 課堂獎勵「自選召喚卷」領了卻沒拿到 → 徹底修復 + 自動補發
  {
    ver: 'v3.16.97',
    date: '2026-06-30',
    brief: [
      '🎁【老師發的「自選召喚卷」沒收到 → 自動補發】少數同學反映:老師發的 UR／SSR／自選至寶召喚卷,按了「確認領取」卻沒出現在背包裡。已徹底修好:① 現在按下「確認領取」後,獎勵會「立刻」進到你的背包(不必等重新整理),不會再被存檔覆蓋掉;② 之前已經領過、卻實際沒拿到券的同學,「下次登入會自動補發」漏掉的卷,並跳出「🎁 老師補發了你漏領的…」提示。',
      '🔒【絕不重複拿】系統會精準比對「老師發了幾張、你已經用掉幾張、背包還有幾張」,只補真正漏掉的那幾張;已經拿到或已經用掉的不會再給,不會重複發放。',
    ],
  },
  // v3.16.96 — BOSS 擊敗離不開戰鬥畫面徹底根治 + 黑暗球獎勵回關卡頁誤判「戰鬥未完成」修復
  {
    ver: 'v3.16.96',
    date: '2026-06-30',
    brief: [
      '⚔️【打倒 BOSS 後卡在戰鬥畫面·徹底根治】少數同學回報「打倒 BOSS 後,求救鈕(SOS)消失了、卻還是離不開戰鬥畫面、回不了關卡頁」—— 已徹底修好:現在不論任何情況,按下「✅ 確認」當下會立刻清乾淨戰鬥畫面並返回,不會再卡住。',
      '🌑【黑暗球獎勵不再憑空消失】之前打倒貓空「黑暗球」明明顯示拿到 SSR 碎片,回到關卡頁卻跳出「戰鬥未完成、是否繼續」,選了放棄後碎片就不見了 —— 已修好:打完 BOSS 的勝利結算期間不會再被誤判成「戰鬥未完成」,辛苦打贏拿到的獎勵會正常保留。',
    ],
    items: [
      '★ v3.16.96【BOSS 擊敗離不開戰鬥畫面·徹底根治·index.html】advStartWinSequence 入口順序 bug:v3.16.2 雖把「收結算 overlay + 清戰鬥畫面 class(gc 的 adv-battle)+ 清行動條」提到入口,但放在「世界 BOSS 守門 _wbCtx」的 return 之後 → 若一般 BOSS 殘留 _wbJustFinishedRaid/_wbResultExecuting 等旗標、或 _isWorldBossTarget 誤判而觸發守門 → 提早 return → 跳過清戰鬥畫面 → 結算視窗被守門收了、但戰鬥畫面 class 沒清 → 卡住(SOS 因 _advBattleResultShown 已 true 而消失)。修法:把「收 UI + 清 adv-battle class + 清 turn-bar + 隱 SOS」提到函式「最最前面」(所有 return 之前),覆蓋 _wbCtx 守門 return / 重入守衛 return / 正常發獎三路徑;純 UI 轉場不發任何獎勵,對世界 BOSS 結算(走 _wbShowAdvBattleResult)無影響。',
      '★ v3.16.96【黑暗球獎勵回關卡頁誤判未完成·index.html】根因:advStartWinSequence 在 _advClearCrashSnapshot 清掉中斷快照(adv_battle_snap/adv_crash_snapshot)後,黑暗球勝利序列流程長(碎片+升級演出),期間若 _advBattleResultShown 被某 reset 點設回 false(在 _adventureMode 仍 true 的空檔),「每回合 _saveBattleRoundSnapshot / 每 30 秒 _forceSaveBattleSnapshotAndSync」watchdog 會趁隙重寫 adv_battle_snap → 回關卡頁 _advCheckCrashRecovery 誤判未完成 → 玩家放棄時回滾掉剛得的 SSR 碎片。修法:新增勝利序列「存快照抑制鎖」window._advSuppressSnapSave(不依賴 _advBattleResultShown 時序):advStartWinSequence 入口上鎖;兩個存快照守門各加 || _advSuppressSnapSave 一律不存;解鎖=① 新 BOSS 戰開始(L≈83918 同步清鎖·涵蓋打完黑暗球再打 BOSS)② 15 秒 setTimeout 兜底(屆時通常已回關卡頁·_adventureMode=false·守門自然擋)。',
      '★ v3.16.96【驗證/版本】index.html 20 個 inline script node --check 全過、0 lone surrogate;admin_panel.js/game_changelog.js node --check 過、admin_panel.js 0 可選串接(?.)。七點版本同步 → v3.16.96。GAME_CHANGELOG 維持 20 筆(移除最舊 v3.16.76)。本輪僅改 index.html(問題2+問題4·純戰鬥勝利序列收尾);admin_panel.js + game_changelog.js 版號對齊、hero_db.js 僅 manifest 版號免重傳。另:玩家回報「使用至寶重置卷後第一隻英雄(布奶鳥獸)不斷 +500EXP 一直升級」已縮小範圍(backpackAdd 確認乾淨·cap99 無溢出轉換)、待下一輪深入定位修復。',
    ],
  },
  // v3.16.95 — 商店每日購買次數沒刷新修復 + 至寶重置靈水退回內容修正
  {
    ver: 'v3.16.95',
    date: '2026-06-30',
    brief: [
      '🛒【商店每日次數修復】有同學「今天第一次開商店,召喚水晶/極限爆發果實等卻顯示已買完、無法購買」—— 現在已修好:跨日後每日限購次數會正確歸零刷新,大家都能正常購買當天的份額。(受影響的同學登入後會自動恢復可購)',
      '💧【至寶重置靈水退回修正】之前「至寶重置靈水」退回的內容完全錯誤(退一把 Lv.5 至寶竟給超過 99 張卷軸、又沒退知識幣)—— 現在改為正確退回:升級時實際花掉的「至寶經驗卷軸 + 知識幣」全額退回(例如 Lv.5 退回 14 張卷軸 + 90,000 知識幣)。',
    ],
    items: [
      '★ v3.16.95【商店每日購買次數沒刷新根治·index.html】根因同 playerBackpack_s/heroLevels_s:Firebase set(merge:true) 對 shopDailyData(map)深度合併殘留昨天計數子鍵 → 跨日後今天買 A 商品時 _shopDailyData reset 成 {date:今天,A:1}、存檔 merge 後雲端深合併昨天的 B:1 殘留 → 下次載入 date===today 成立 → _shopDailyBought(B) 回殘留值 → 顯示「今日剩 0/X」沒刷新。修法(對齊既有 _s 鐵律):①_buildSafeData 加 shopDailyData_s/shopWeeklyData_s 字串版(整包覆蓋·免疫 merge 深合併)②_applySafeData 載入優先採信 _s(雲端 map 版即使殘留也忽略)③一次性清空遷移旗標 _shopDailyResetV1(部署後存檔即帶·載入時無此旗標→清空 merge 殘留·當前受影響學生立即恢復可購)。讀取/渲染/重置/今日計算邏輯本就正確(_shopDailyBought/_getShopDailyKey/_lxpsGetGameDayKey 台灣8:00界),病灶純在雲端 merge 殘留。',
      '★ v3.16.95【至寶重置靈水退回內容修正·index.html】_doTreasureReset 退回計算三重錯誤根治:原 _refund=(lv-1)*lv/2*10+exp 對 Lv.5=100 → ①公式算錯總EXP(用 1+2+3+4 而非實際每級 (curLv+1)*10 的 2+3+4+5=140)②把「總EXP」當「卷軸張數」直接退(應 ÷10=14 張·100>99 即老師回報症狀)③完全沒退知識幣。修法:從 Lv1 用 _getTaiwanTreasureExpForNextLv/_getTaiwanTreasureCoinForNextLv 逐級加總實際投入 → 退回卷軸張數=總EXP÷10(每張10EXP)+ 全額知識幣(addKnowledgeCoins);Lv.5 正確退 14 張卷軸 + 90,000 知識幣。modal 卡片/toast/商店與背包道具描述同步更正。⚠ 另有「第一隻英雄不斷+500EXP」回報:程式碼中 +500EXP 來源(精裝經驗書 hero_exp_book_deluxe)皆為正常單次使用、_backpackOpenHeroSelect 無重入,靜態查無「不斷」迴圈,待現場資訊定位。',
      '★ v3.16.95【驗證/版本】index.html 20 個 inline script node --check 全過、0 lone surrogate;admin_panel.js/game_changelog.js node --check 過、admin_panel.js 0 可選串接(?.)。七點版本同步 → v3.16.95。GAME_CHANGELOG 維持 20 筆(移除最舊)。本輪改 index.html(問題1+問題3退回)+ game_changelog.js;admin_panel.js 僅版號對齊、hero_db.js 僅 manifest 版號免重傳。',
    ],
  },
  // v3.16.94 — GM獎勵領取空轉修復 + 登入後原本有練的英雄變低等/不見修復(+ 後台過度補償掃描升級)
  {
    ver: 'v3.16.94',
    date: '2026-06-30',
    brief: [
      '🎁【GM 獎勵領取修復】老師發給你的「課堂自製科學玩具」等 GM 獎勵(含 SSR 自選召喚卷),之前有人按了「確認領取」卻一直轉圈、收件區也不會消失、獎勵沒進帳 —— 現在已修好:領取會正常入帳、收件卡會正常消失,而且同一份獎勵只會領一次(不會重複)。',
      '🦸【練過的英雄不再變低等/不見】之前少數同學重新登入後,原本練過的某些英雄會「等級變低」或「整隻不見」—— 現在登入時會以雲端最完整的資料為準,把「你有練過(升過級/投資過素質技能/裝過至寶)」的英雄等級與進度保底補回來,不會再被洗掉或降等。(注意:這只會補回「你真的練過」的英雄,不會憑空多出沒練過的角色。)',
    ],
    items: [
      '★ v3.16.94【GM獎勵領取空轉根治·index.html】_fbClaimGmClassReward 重構:改以「玩家自己的主檔 _gmcrClaimed 標記」為領取主閘門(玩家對自己 players/{uid} 的自寫一定成功),不再卡在 gmClassRewardClaims transaction(該集合 firestore 規則若未部署會被拒→原本先 return→收件區不消失+鈕 re-enable=無限空轉);新流程:①先讀主檔 _gmcrClaimed 若已含本筆→擋重複;②transaction 降為「最佳努力」(catch 靜默·規則部署後才生效·belt-and-suspenders 跨裝置去重);③發獎前先 read-modify-write 標記 _gmcrClaimed(+競態重讀)再呼 _fbCompensatePlayer 入帳;④入帳失敗→從 _gmcrClaimed 移除該 rewardId 回滾(可再領);⑤補 _gmcrClaimLog。自選券 backpack key=summon_ticket_ssr_pick。',
      '★ v3.16.94【練英雄保底·登入權威下載·index.html】新增 window._lxpsHeroFloorOntoMain(main, slots, cutoff):v3.16.87/90 的登入「權威下載」多數情況直接採主檔(不合併)→ 若某存檔槽有「主檔沒有、但你已練過」的英雄(或主檔該英雄等級偏低、槽裡等級高),會被靜默丟失或降等。修法:主檔權威為底,只把「有投資證據(等級>1/投資過素質‧技能‧天賦‧爆發‧膠囊‧點數‧經驗/裝過至寶)且未被 admin_delete(GM 收回)/audit_error_recovered(自助刪除)、且來自 reset 之後(savedAt > _lastResetAt)的槽」的英雄,union 補回 unlockedHeroes + 逐鍵 max 養成(純加不減),同步重寫 _s 與 _dataSummary;全程 try-catch,任何錯誤回原主檔。只在權威分支套用(合併保底分支本就有自己的 removal-aware union);知識幣/至寶/背包一律仍採主檔。',
      '★ v3.16.94【過度補償掃描升級·後台·index.html + admin_panel.js】GM「🩹 6/24~6/25 救援查無紀錄過度補償收回」工具強化:_computeOverRestoredFromDoc 補第二趟掃描 extraNoRecordHeroes/Detail(=「compensation 補償發放、或帳本完全查無解鎖紀錄」、且「沒有任何投資證據」的英雄;有真實取得來源 admin_grant/summon_rare/initial 等 或 有投資證據者→永久保護不收回);_fbAdminScanAllNoRecordOverComp 回傳每位玩家 detail + 依補償日期(台灣時間)聚合的 batches;admin 端加「📅 補償批次摘要」與每隻英雄來源/日期顯示(🎁補償 YYYY-MM-DD / ❓查無紀錄)。收回前對最新雲端權威重判、只收回仍查無紀錄者、寄更正通知 —— 與你的遊戲體驗無關,純後台工具。',
      '★ v3.16.94【驗證/版本】index.html 20 個 inline script node --check 全過、0 lone surrogate;hero_db.js/admin_panel.js/game_changelog.js node --check 過、admin_panel.js 0 個可選串接(?.)。七點版本同步 → v3.16.94。GAME_CHANGELOG 維持 20 筆(移除最舊 v3.16.74)。本輪改 index.html(問題1+2+3)+ admin_panel.js(問題2 後台 UI);hero_db.js 僅 manifest 版號免重傳。GM 獎勵跨裝置去重(gmClassRewards/gmClassRewardClaims)firestore 規則建議部署(非必要·主檔自寫去重已生效)。',
    ],
  },
  // v3.16.93 — 自選召喚卷挑英雄強制寫雲端權威記錄(防登入後消失) + 存檔倒退守門豁免「GM收回過度補償/學生自助刪除」的英雄
  {
    ver: 'v3.16.93',
    date: '2026-06-30',
    brief: [
      '👑【自選召喚卷修復】用 UR／SSR／SR 自選召喚卷挑選英雄後,現在會立刻把這位英雄寫進雲端最高權威記錄 —— 避免重新登入後英雄又不見了(特別根治老師發「UR 自選召喚卷」、挑了 UR 卻沒拿到的狀況)。',
      '🛡️【存檔保護優化】被老師「收回的過度補償英雄」或你「自己申請刪除的英雄」,現在不會再被誤判成「資料倒退」而卡住存檔 —— 你的遊戲進度可以正常更新、正常存檔了。',
    ],
    items: [
      '★ v3.16.93【自選召喚卷發放強制權威寫入·index.html】_useSummonTicketPick:解鎖來源三元式補 UR 分支(原本 UR 會落到 ticket_sr_pick 的 else 分支)→ ticket_ur_pick;發英雄後「無條件」再呼一次 window._lxpsCloudInstantUnlock 寫 unlockedHeroes(arrayUnion)+ _heroUnlockHistory(帶本帳號 uid),補上 advSaveUnlockedHero 受 _isNew 閘門可能略過的權威寫 → UR／SSR／SR 自選券皆保險(根治 GM 發 UR 自選券、玩家挑 UR 後沒拿到/又消失);挑選視窗標題補 UR 分支(原本只認 SSR／SR)。',
      '★ v3.16.93【存檔倒退守門·稽核感知豁免·index.html】三道存檔守門 _fbSave(主檔)、_fbSaveLive(live 槽)、_suspectRegression(gameCloudSave 對本機備份)一致新增豁免:凡「最近一筆解鎖紀錄=admin_delete(GM 收回過度補償)或 audit_error_recovered(學生自助『不是我的』disown)」的英雄,視為已合法移除 —— 用既有 _lxpsLatestDeletedMap(本版加掛 window 供 gameCloudSave 跨 script block 取用)算出移除集合,從倒退比較的擁有數扣除 + 不被聯集(union)復活 → GM 收回 / 學生自審刪除的英雄能正常從存檔減少,不再卡「⛔ 存檔保護啟動·偵測到資料倒退」與「解鎖英雄倒退 X 隻」。',
      '★ v3.16.93【安全性】只豁免上述兩種「明確合法移除」來源;latest-entry-wins:玩家若之後重新抽到/老師補發(更新的解鎖紀錄,at 更大)則自然恢復擁有;真正的資料遺失(非此兩來源)仍照舊擋下,不影響原有防薄資料覆蓋保護。',
      '★ v3.16.93【範圍/相容】只改 index.html;admin_panel.js 僅版號對齊;hero_db.js 僅 manifest 版號免重傳。免新增 firestore.rules。七點版本同步 → v3.16.93;GAME_CHANGELOG 維持 20 筆(移除最舊 v3.16.73)。',
    ],
  },
  // v3.16.92 — 自選/隨機至寶券獲得後強制寫雲端權威記錄(防登入後消失) + iPad 審查視窗送出鈕點不到 + GM 查無紀錄過度補償收回工具
  {
    ver: 'v3.16.92',
    date: '2026-06-30',
    brief: [
      '💠【至寶券修復】使用「自選至寶召喚卷」或「隨機至寶召喚卷」獲得至寶後,現在會立刻把這件至寶寫進雲端最高權威記錄 —— 避免之後重新登入時這件至寶又不見了。',
      '📱【iPad 審查視窗修復】「請確認這些是不是你的」審查視窗,在 iPad 上最下面的「送出」按鈕被系統列擋住、按不到的問題已修正(視窗改用動態視窗高度 + 底部留安全距離,送出鈕一定點得到)。',
    ],
    items: [
      '★ v3.16.92【至寶券發放強制權威寫入·index.html】_useTreasureTicketPick(自選券)與 _useTreasureTicket(隨機券)在 _grantTaiwanTreasure 後「無條件」再呼一次 window._advSaveTreasureUnlockHistory(treasure_pick_ticket / treasure_random_ticket):根因 _grantTaiwanTreasure 內的權威寫入被 if(!_taiwanTreasureData[id]) 守門,跨 script block 的 _taiwanTreasureData 參照不同步時該守門可能被略過 → 權威寫入沒觸發 → 登入權威下載(v3.16.87/90)把只在本機的至寶洗掉。現改在發放後強制呼叫(內部 _lxpsCloudInstantUnlock 以 dotted-path 原子寫主檔 taiwanTreasureData.<id> + 解鎖紀錄)→ 不再消失。',
      '★ v3.16.92【iPad 審查視窗送出鈕點不到·index.html】_showOverRestoreReviewModal 外框 _box 高度 height:100% 加 height:100dvh(動態視窗高度·讓底部按鈕列落在 iPad Safari 動態工具列之上)+ 底部按鈕列 _bar 底部 padding 改 calc(14px + env(safe-area-inset-bottom))(避開 home indicator 觸控死區);純 CSS 兩處,送出鈕一定點得到。',
      '★ v3.16.92【GM 查無紀錄過度補償收回工具·index.html + admin_panel.js】「🔴 過度補回稽查與回收(掃全體)」卡內新增子區塊「🩹 6/24~6/25 救援查無紀錄過度補償 → GM 直接收回」:🔍 window._fbAdminScanAllNoRecordOverComp 掃全體列出「6/24-6/25 舊救援自動補進、帳本完全查無解鎖紀錄、Lv1 沒練/沒投資/沒裝至寶」的英雄(已練/投資/裝至寶者被 v3.16.84 legacy_grandfather 補蓋 UID 歸屬·絕不在此清單·絕不誤收)→ 逐位/全部「🗑 收回」(window._fbAdminReclaimNoRecordForUid 收回前對最新雲端 doc 權威重判·只收回仍查無紀錄者·防玩家掃描後已練誤刪·Lv1 不補償·寄更正通知)。加在既有卡內免三點同步·無 ?.。',
      '★ v3.16.92【範圍/相容】改 index.html + admin_panel.js;沿用既有 pendingAdminNotifications 規則(GM 收回更正通知),免新增 firestore.rules。hero_db.js 僅 manifest 版號免重傳。七點版本同步 → v3.16.92;GAME_CHANGELOG 維持 20 筆(移除最舊 v3.16.72)。',
    ],
  },
  // v3.16.91 — 過度補回自審視窗:頂部顯示目前登入帳號 + 不是本人可切換帳號重登再審查
  {
    ver: 'v3.16.91',
    date: '2026-06-29',
    brief: [
      '🛡️【審查前先確認帳號】「請確認這些是不是你的」審查視窗,最上方現在會清楚顯示「目前登入的帳號」是誰(班級座號+姓名 + email)。共用平板上如果發現登到的不是你本人的帳號,可以直接按「🔄 這不是我的帳號,切換帳號重新登入」登出、改登自己的帳號後再審查——避免幫別人的帳號做錯判斷。',
    ],
    items: [
      '★ v3.16.91【審查視窗加帳號身分橫幅·index.html】_showOverRestoreReviewModal 頂部新增帳號橫幅:用 window._fbAuth.currentUser.email + window._getRosterEntry/_formatRosterLabel 顯示「目前登入的帳號」(班級座號姓名「5324王同學」+ email);讀不到時提示重新整理。明確提醒學生先確認是本人帳號再往下審查。',
      '★ v3.16.91【切換帳號重登·index.html】橫幅內「🔄 這不是我的帳號,切換帳號重新登入」鈕 → 呼叫 window._fbSignOut()(含 iPad Safari IndexedDB firebaseLocalStorageDb 清理)登出回登入頁;學生改登自己帳號後,該帳號若有待審 pending 會自動再跳出審查。',
      '★ v3.16.91【切換不消化此帳號審查·防呆關鍵·index.html】切換時 modal resolve({switched:true});_doFetchAdminNotifications 讀取迴圈收到 switched → break,且「不寫本地 hide 旗標、不 deleteDoc」→ 此帳號的待審 pending 不被誤消化 → 下次正確學生登入此帳號時審查會再出現(根治「在別人帳號上把審查做完、真正本人卻再也看不到」)。',
      '★ v3.16.91【範圍/相容】只改 index.html(審查視窗 + 登入通知讀取迴圈);沿用既有 pendingAdminNotifications 集合與 GM 派發(掃全體 scan-all → queue),免新增 firestore.rules。admin_panel.js + game_changelog.js 僅版號對齊、hero_db.js 僅 manifest 版號免重傳。七點版本同步 → v3.16.91;GAME_CHANGELOG 維持 20 筆(移除最舊 v3.16.71)。',
    ],
  },
  // v3.16.90 — 登入權威下載「零風險」完善:加主檔存檔時間地板,杜絕登入弄丟未同步進度
  {
    ver: 'v3.16.90',
    date: '2026-06-29',
    brief: [
      '🔒【登入存檔保護升級·零風險】把「登入以雲端最完整存檔為準」做到零風險:登入會比對雲端主檔與備援槽的「存檔時間」,只有主檔是最新(或同時)存的才直接採用;萬一你上一手進度還沒完整同步到主檔(網路延遲等),系統會自動改用「只增不減的合併」把所有進度(英雄/等級/知識幣/至寶…)完整保留,絕不會因為登入而弄丟任何進度。',
    ],
    items: [
      '★ v3.16.90【登入權威下載·零風險地板·index.html】_readRichest 採權威條件由「_gmFresh || !_anySlotRicher」收緊為「_gmFresh || (_mainTimeFresh && !_anySlotRicher)」。新增 _mainTimeFresh = 主檔 savedAt ≥ 兩槽最新 savedAt(主檔每次存檔由 _buildSafeData 寫 savedAt,與兩槽同一份 data)。根因:原 _anySlotRicher 只比英雄數/最高等級,量不到 知識幣/至寶/小幅升級等維度;若某槽存得比主檔新但沒多英雄,會誤採過時主檔而「靜默遺失」那些進度。',
      '★ v3.16.90【修法·絕不遺失】只要某槽 savedAt > 主檔 savedAt(代表該次主檔寫入延遲/失敗、槽卻成功 → 主檔可能過時)→ 一律改走合併保底 _lxpsMergeSlots(union/max 只增不減)→ 任何維度(英雄/等級/知識幣/至寶/投資…)的新進度都不會被過時主檔蓋掉,真正零遺失。正常乾淨帳號(主檔與槽同時存·_mainTimeFresh 成立)照舊直接採權威。',
      '★ v3.16.90【不削弱污染杜絕/GM 即時生效】_gmFresh(主檔 _authoritativeRestoreAt 比兩槽新·GM 清污染/補償/重置剛寫過主檔)仍優先採權威 → GM 清污染照舊立即生效、三槽歸一(C)照舊把乾淨主檔覆寫 live/safe 槽。本次只把「主檔可能過時」的情況從『直接採權威(會遺失)』改為『合併保底(零遺失)』,純加強安全、不動污染杜絕邏輯。',
      '★ v3.16.90【範圍/相容】只改 index.html 的 _readRichest 判斷(加 _mainTimeFresh 1 訊號 + 收緊採權威條件 + 診斷日誌 + 註解);存檔流程/三槽歸一/_applySafeData/戰鬥救援快照 全不動。admin_panel.js + game_changelog.js 僅版號對齊、hero_db.js 僅 manifest 版號免重傳。不需新增 firestore.rules。七點版本同步 → v3.16.90;GAME_CHANGELOG 維持 20 筆(移除最舊 v3.16.70)。本版與 v3.16.87 登入權威下載一起上線——87 至此為「零風險完美版」。',
    ],
  },
  // v3.16.89 — 自動戰鬥治療 AI 調整:HP<75% 才治療 + 2 名以上低血優先群體治療
  {
    ver: 'v3.16.89',
    date: '2026-06-29',
    brief: [
      '🩹【自動戰鬥治療更聰明】自動戰鬥時,AI 不再對「血量還很滿」的隊友空放治療技能/物品了!現在只有當有隊友 HP 低於 75% 時,才會使用恢復 HP 的治療技能或物品;而且當同時有 2 名以上隊友 HP 低於 75% 時,會優先使用「群體治療」技能或物品(例如 全體治療、治癒之風、療癒香水…),讓治療更有效率、不浪費回合。',
    ],
    items: [
      '★ v3.16.89【AI治療門檻 75%·index.html】_realAiAct 的 needsHeal() 治療門檻由「治療職 85%／非治療職 60%」統一改為 75%:只有友方 HP<75% 才回傳治療目標,否則回 null(該回合不放治療技能/物品)→ 根治「對接近滿血(如 84%)友方反覆空放治療」。倒下友方仍優先復活(dead 短路不變)。',
      '★ v3.16.89【群體治療優先·技能·index.html】優先1治療新增 _woundedCount(存活且 HP<75% 的友方數);≥2 時 healSks 排序把「群體治療技能」排最前(GROUP_HEAL_SKILLS=全體治療/治癒之風/天堂樂章/餘音繞樑/雙小提琴協奏曲/一壺鐵觀音/流浪者之歌/天籟之音/BUG修復/神籤·皆恢復多名或全體友方);<2 或無群體技能時沿用估算治療量排序(單體治療照常)。',
      '★ v3.16.89【群體治療優先·物品·index.html】≥2 友方<75% 時 healItems 排序把「群體治療物品」(target a3·恢復全體友方·療癒香水 hp15／木柵鐵觀音 hp30)排最前;且 AI 使用 a3 群體治療物品時改對「全體存活友方」各施用(applyItemOnTarget 預設僅單體·此處展開全體·鏡像物品系統既有 a3 處理·道具仍只消耗 1 次)→ 群體治療物品真正惠及全隊。',
      '★ v3.16.89【相容性／範圍】只動 p1 自動戰鬥的「治療選擇」邏輯,敵方 p2 與關卡/世界 BOSS 平衡完全不受影響;與 v3.16.58「每位英雄 AI 行動設定」相容(設定關閉治療仍不治療·本次只精修「允許治療」情況下的時機/對象)。本輪只改 index.html(needsHeal 1 處＋優先1治療 4 處);admin_panel.js + game_changelog.js 僅版號對齊、hero_db.js 僅 manifest 版號免重傳。不需新增 firestore.rules。七點版本同步 → v3.16.89;GAME_CHANGELOG 維持 20 筆(移除最舊 v3.16.69)。',
    ],
  },
  // v3.16.88 — 召喚卷儀式感:SSR/SR/UR 召喚卷改走星空抽同款角色揭曉視窗+特效(取代純文字)
  {
    ver: 'v3.16.88',
    date: '2026-06-29',
    brief: [
      '✨【召喚卷儀式感升級】使用 SSR／SR／UR 召喚卷(隨機卷與自選卷)時,不再只是冒一行文字了!現在會跟在「召喚星空」抽到新角色一樣:播放召喚開場特效、角色登場的光芒與三段慶祝音效,並彈出大張的「角色登場視窗」(立繪＋技能＋極限爆發介紹),讓每一次用卷都更有儀式感、更值得期待。',
      '🎟【連續使用更順手】看完角色登場視窗、按下「確認」後,會自動回到召喚卷面板,方便你接著使用下一張卷。你抽到的英雄一樣會記入召喚紀錄。',
    ],
    items: [
      '★ v3.16.88【召喚卷儀式感·index.html】_showSummonTicketResult(SSR/SR/UR 隨機卷＋自選卷共用)由「直接冒文字結果」改走星空抽同款儀式:單抽開場特效 _playSummon1xFx → 角色 reveal _playSummonRevealFx(三層慶祝音)→ _showSummonResults(內含 _showSummonRareHeroPreview 大張角色登場視窗:立繪＋S1/S2＋極限爆發)。組同款 results 物件 {kind:rare_hero,heroName,icon,qty:1,isRare:true,_rarityTier};UR 補正確圖示 👑＋粉色強調色(原僅 SSR🌈/SR⭐)。',
      '★ v3.16.88【後備保護·index.html】召喚卷一律在「召喚星空」頁使用(背包使用→openSummonOverlay→召喚卷面板·summon-fx-layer 為該頁靜態元素)故必定走完整儀式;萬一不在召喚星空頁(無 fx 層)→ 自動退回原純文字結果,確保玩家一定看得到抽到的英雄、不會白按(防呆雙保險)。',
      '★ v3.16.88【連續使用體驗保留·index.html】用卷儀式以 window._summonTicketCeremony 旗標標記;結果視窗按「確認」(_dismissSummonResults)關閉後自動重開召喚卷面板(沿用舊版「連續用卷」體驗)。doSummon 開頭清旗標 → 正常星空抽結束不會誤開召喚卷面板。召喚紀錄(_recordSummonHistory)記錄行為不變。',
      '★ v3.16.88【偵探編組圖位·index.html】英雄編組頁「偵探」左側縮圖與右側預覽大圖的圖片垂直位置 Y 上移 20%(_teamFormAdjustObjPos _ADJ 表新增 偵探:{grid:-20,preview:-20},與拘留者/科學發明家同款),露出更多上半身/頭部;純 object-position 微調,不影響戰鬥卡/圖鑑。',
      '★ v3.16.88【版本／範圍】本輪只改 index.html(召喚卷結果展示路徑·3 處 + 偵探編組圖位 1 處);admin_panel.js + game_changelog.js 僅版號對齊、hero_db.js 僅 manifest 版號免重傳。不需新增 firestore.rules。七點版本同步 → v3.16.88;GAME_CHANGELOG 維持 20 筆(移除最舊 v3.16.68)。完全不影響召喚機率/解鎖/存檔,僅改變召喚卷結果的「呈現方式」。本版與 v3.16.87(登入權威下載)一起上線。',
    ],
  },
  // v3.16.87 — 登入權威下載:優先採用雲端最新權威存檔,杜絕殘槽舊資料回流(清掉的又跑回來)
  {
    ver: 'v3.16.87',
    date: '2026-06-29',
    brief: [
      '🛡【存檔保護再升級·登入更穩】登入讀取存檔的方式再強化:現在會「優先採用雲端最新的權威存檔」。老師幫你清理過或補償過的資料,會更穩定地生效,也更不容易出現「明明清掉的舊資料、過幾天又自己跑回來」的情況。你實際擁有的英雄、等級、至寶、知識幣、進度都完整保留、不受影響——這是純背景的保護強化,你不用做任何事。',
      '💾【更安全的雙保險】萬一某次存檔沒成功,系統仍會自動比對你各個存檔備份、以「資料最完整」的那份為準補齊,不會讓你的英雄或資源憑空變少。',
    ],
    items: [
      '★ v3.16.87【登入權威下載·index.html】gameCloudLoad 的 _readRichest 由「一律三槽 union/max 合併」改「主檔權威 + 資料遺失地板」:主檔 _authoritativeRestoreAt 比兩槽 savedAt 都新(GM/學生稽核剛寫過主檔)→ 直接採主檔不合併;否則比對豐富度,只有「某槽英雄數比主檔多≥1 或最高等級高≥3」(疑似主檔該次存檔失敗)才退回合併保底(union/max 只增不減不遺失),其餘情況一律採主檔。結構上殘槽幻影(高Lv幻影/別人的角色/已 disown 的污染)無法再被 union 復活。_dataSummary 優先、無摘要時退回解析 unlockedHeroes/heroLevels。',
      '★ v3.16.87【三槽歸一·index.html】偵測到「GM/學生稽核剛清過主檔」時,載入後把乾淨主檔整包覆寫回 live/safe 槽({merge:false} 蓋掉殘留子鍵)→ 三槽一致,日後存檔不會再把舊髒資料 max-merge 撿回(「清完又回來」根治)。只在這種情況才寫(正常遊玩各槽本就一致)、fire-and-forget 不阻塞登入、失敗無妨(下次存檔自癒)。記憶體基線已防重載迴圈,不動既有重載斷路器。',
      '★ v3.16.87【合併稽核擴充·index.html】三槽合併的「已移除」判定,由只認 admin_delete(GM 刪)擴充為同時認 audit_error_recovered(學生自助「不是我的」disown)→ 學生 disown 的污染英雄/至寶不會被殘槽 union 復活;以「最近一筆紀錄」為準,日後重新抽到/老師補發(更新紀錄)會自然恢復擁有,不影響合法再取得。',
      '★ v3.16.87【設計理念·老師裁示】主檔=權威真相。多數情況直接採主檔→殘槽幻影無法復活;只在「主檔疑似存檔失敗(某槽顯著更豐富、且非剛被清理)」才合併保底→真資料絕不遺失。新玩家/離線/退化路徑皆不受影響。',
      '★ v3.16.87【版本／範圍】本輪只改 index.html(登入載入路徑 + 合併稽核);admin_panel.js + game_changelog.js 僅版號對齊、hero_db.js 僅 manifest 版號免重傳。不需新增 firestore.rules(沿用既有 players/saves 自身寫入)。七點版本同步 → v3.16.87;GAME_CHANGELOG 維持 20 筆(移除最舊 v3.16.67)。★ 高風險變更:建議先以 110082 / 110170 兩帳號實測再廣推。',
    ],
  },
];
