// ════════════════════════════════════════════════════════════════════════
//  game_changelog.js  —  LXPSGAME 更新日誌
//  最後更新:2026-06-30  / 目前主程式版本:v3.16.99(玩家端登入自動回收「GM 錯誤補發批次」:白名單日期[6/25]內、無真實解鎖紀錄的 compensation 英雄→彈告知清單→玩家確認→可逆回收+二次確認;判定沿用 v3.16.98 GM 工具·學生自己抽過/解鎖過絕不誤刪)
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
  // v3.16.86 — 過度補回改「學生自我審核」:老師發起→學生登入逐項勾是我的綁定/不是我的移除+補償
  {
    ver: 'v3.16.86',
    date: '2026-06-29',
    brief: [
      '🛡【英雄／至寶歸屬確認·登入會跳出】如果老師發現你的帳號裡有「可能不是你的」英雄或至寶(其實是別位同學帳號的、被系統不小心補錯進來的),你登入時會跳出一個「自我審核視窗」,把它們一個一個列出來,讓你自己判斷:勾「✅ 是我的」→ 永久綁定給你、以後不會再被問;勾「🗑 不是我的」→ 幫你移除掉,而且如果你已經練過它,還會補償你練功的心力(💰知識幣+🔮召喚水晶)。★ 勾「不是我的」時如果那隻已經練了很多級,會再跳一次確認,避免你手滑按錯;就算真的不小心移除了,老師後台也救得回來。判斷權完全交給你自己!',
      '📨【GM·改派發學生自審】後台「過度補回稽查」掃全體的回收按鈕,由「GM 直接刪」改成「📨 通知學生自審」:GM 不再直接刪除任何角色,而是把清單派發給學生本人,由學生登入後逐項確認(✅是我的綁 UID 永久 / 🗑不是我的可逆移除+補償)。GM「🔍 逐項審查」彈窗仍保留(你自己很確定時可直接刪/救回)。',
    ],
    items: [
      '★ v3.16.86【派發後端·index.html】新增 window._fbAdminQueueOverRestoreReview(uid,英雄,至寶):把過度補回清單(名稱+等級)寫成一筆 pendingAdminNotifications/{uid}/items/{ts}(type=overRestoreReview)→ 學生下次登入彈自審視窗。沿用既有 pendingAdminNotifications 集合與規則(create 限管理員→學生偽造不了清單·補償依 GM 記錄等級算→改本機等級也沒用)→ 免新增 firestore.rules。',
      '★ v3.16.86【學生自審視窗·index.html】新增 window._showOverRestoreReviewModal(uid,data):全螢幕逐項勾選視窗(✅是我的/🗑不是我的·每筆不預設·全部選完才能送出);勾「不是我的」且該英雄已練(Lv>1)→ 彈「再確認」子視窗(z-index 2147483640 > 主視窗 2147483600·階層保證絕不被蓋·老師明確要求)。送出:是我的→_lxpsConfirmOwnHero/_lxpsConfirmOwnTreasure 綁 UID 永久(player_confirmed 三槽);不是我的→可逆移除+補償(不是我的·已練英雄·每等級 500 幣+每隻 2 水晶上限 20·與 GM 回收公式一致);完成後重整。掛在既有登入 pendingAdminNotifications 讀取迴圈(type 分流)·處理完寫本地 hide 旗標+deleteDoc 雙保險防重複彈。',
      '★ v3.16.86【學生端至寶可逆移除·index.html】新增 window._fbStudentDisownTreasures(uid,ids)(鏡像 _fbStudentDisownHeroes):從 taiwanTreasureData 移除指定鍵(整包覆蓋+_s 防 Firebase merge 殘留)、暫存原始至寶資料(_auditRecoveredTreasureData 供 GM 精確復原)、帳本寫可逆標記 audit_error_recovered(disownedByStudent)→ GM 後台可由帳號救援補回。',
      '★ v3.16.86【掃全體卡改派發·admin_panel.js】「過度補回稽查與回收(掃全體)」卡的「🔄 回收這位玩家」/「🔄 全部一鍵回收」按鈕,改為「📨 通知學生自審」/「📨 全部通知學生自審」(走 _fbAdminQueueOverRestoreReview 派發·GM 不直接刪);卡片標題 🔴→🔵、說明改派發語意+防刷說明。「🔍 逐項審查」彈窗(GM 直接刪/救回·不經學生)保留為 GM 備用。無 ?.。',
      '★ v3.16.86【設計理念·老師裁示①乙②乙③甲】把「這是不是我的」判斷權交給最清楚自己練過誰的學生本人,GM 不再替學生猜、不再直接刪;不是我的走可逆移除(GM 後台「🛟 審查誤刪英雄批次救回」可還原)→ 即使學生按錯也救得回;已練英雄勾不是我的會二次確認且階層正確不被蓋。三槽存檔不再質疑學生確認過的英雄。',
      '★ v3.16.86【版本／範圍】本輪改 index.html + admin_panel.js + game_changelog.js;hero_db.js 內容未改僅 manifest 版號·免重傳。沿用既有 pendingAdminNotifications 規則 → 免新增 firestore.rules。七點版本同步 → v3.16.86;GAME_CHANGELOG 維持 20 筆(移除最舊 v3.16.66)。',
    ],
  },
  // v3.16.85 — GM:過度補回稽查與回收「掃全體」版 + 救援記錄預設全列(GM 專屬)
  {
    ver: 'v3.16.85',
    date: '2026-06-29',
    adminOnly: true,
    brief: [
      '🔴【GM·過度補回掃全體】後台「🧹 帳號汙染處理」新增「🔴 過度補回稽查與回收(掃全體)」卡:一鍵掃描所有玩家,找出先前「沒審 uid 的舊救援『確認救援並補回』」誤補進來的別位同學英雄/至寶(帳本有別人 uid 真實紀錄、但本帳號自己無紀錄/未自確認),逐位或全部一鍵回收。回收前都會先用「權威三槽」重判一次、只回收確認者(不誤刪);已練過(等級>1)的英雄自動補償知識幣+召喚水晶,並寄道歉登入彈窗給學生。★ 每位玩家可開「🔍 逐項審查」彈窗,逐一看每隻英雄/至寶的名稱·等級·解鎖來源·時間,各別勾選後分別「刪除(回收)」或「救回(確認是這位學生的)」。原本逐帳號版(輸入單一帳號查)仍保留。',
      '📨【GM·救援記錄預設全列】「📨 帳號救援申請審核」卡的「僅顯示待處理」改成預設不勾選 → 一打開就列出所有救援記錄(待處理/已處理/已駁回·含狀態徽章);要只看待處理時再勾起來即可。',
    ],
    items: [
      '★ v3.16.85【掃全體後端·index.html】新增 window._fbAdminScanAllOverRestored():一次 getDocs(players),用與逐帳號版相同的「過度補回簽章」直接從「頂層 player doc」判(頂層 doc 已含 _heroUnlockHistory/_treasureUnlockHistory/unlockedHeroes/heroLevels·_treasureUnlockHistory 由 _advSaveTreasureUnlockHistory + _lxpsCloudInstantUnlock 寫·每筆帶 uid)→ 不逐人讀三槽=便宜(一次查詢);回傳受影響玩家(uid/email/暱稱 + 誤補英雄[名+Lv]/至寶[名] + 已練數·計數)按數量排序。新增 helper _computeOverRestoredFromDoc(d,uid) 共用簽章。簽章:某英雄/至寶帳本有別人 uid 真實解鎖紀錄(非 seal/delete)但本帳號自己無紀錄、也未 player_confirmed → 舊救援沒審 uid 誤補;初始 8 隻/自己有紀錄/已自確認一律排除。',
      '★ v3.16.85【掃全體 UI·admin_panel.js】「🧹 帳號汙染處理」群組新增「🔴 過度補回稽查與回收(掃全體)」卡(鏡像「🛟 英雄誤刪救回」):🔍 掃描全體 → 列玩家(誤補英雄/至寶晶片)→ 每位「🔄 回收這位玩家」或「🔄 全部一鍵回收」。★ 安全:每位回收前都先呼 window._fbAdminScanOverRestoredForUid(權威三槽合併重判)→ 只把三槽確認者交 window._fbAdminReclaimOverRestoredForUid 回收 → 絕不因「頂層 doc 快篩與三槽差異」誤刪;回收=GM 手動+確認(非自動);已練英雄補償+寄道歉通知沿用既有回收函式。三點同步(SIDEBAR_ITEMS+SIDEBAR_GROUPS+卡片+_initOverRestoreSection IIFE)·無 ?.。',
      '★ v3.16.85【逐項審查彈窗·index.html+admin_panel.js】掃全體每位玩家列新增「🔍 逐項審查」鈕 → 開 window._fbShowOverRestoredAudit(uid) 升級版彈窗:逐一列出每隻誤補英雄/至寶的「名稱·等級·🔓解鎖來源(中文)·🕐解鎖時間·⚠別帳號解鎖標記」,每筆附勾選框 + 全選/全不選,GM 核對後可分別「🗑 刪除勾選的(回收·走 _fbAdminReclaimOverRestoredForUid 子集·已練補償+道歉通知)」或「🛟 救回勾選的(確認是這位學生的·走 _fbAdminRestoreLostHeroes / _fbAdminRestoreLostTreasures 寫合法 admin_grant 紀錄+還原等級→之後不再被判過度補回+通知玩家)」。_fbAdminScanOverRestoredForUid 同步擴充每筆回傳 source/at/byUid(取觸發旗標的別人 uid 紀錄·additive 不影響既有回收/補償呼叫)。',
      '★ v3.16.85【救援記錄預設全列·admin_panel.js】「📨 帳號救援申請審核」卡「僅顯示待處理」checkbox 預設由「勾選」改「不勾選」→ 預設列出全部救援記錄(_fbListAccountRescueRequests 本就抓全部·_render 依 checkbox 過濾);label 加註「取消勾選＝顯示全部」;仍可隨時勾回只看待處理。純預設值與文案·無邏輯變動。',
      '★ v3.16.85【版本／範圍】本輪改 index.html + admin_panel.js + game_changelog.js;hero_db.js 內容未改僅 manifest 版號·免重傳。掃全體只讀玩家集合、回收走既有 isAdmin 路徑 → 不需新增 firestore.rules。七點版本同步 → v3.16.85;GAME_CHANGELOG 維持 20 筆(移除最舊 v3.16.65)。',
    ],
  },
  // v3.16.84 — 帳號救援/圖鑑認定全面綁 UID + 舊英雄憑培養證據自動歸屬並補蓋 UID(GM 專屬)
  {
    ver: 'v3.16.84',
    date: '2026-06-29',
    adminOnly: true,
    brief: [
      '🛡【GM·救援/審查綁 UID 防誤判】帳號救援的「帳本核對補回英雄」改為只認本帳號 UID 的解鎖紀錄,根治共用 iPad 跨帳號污染害「補回一堆不是學生的英雄」;沒有 UID 紀錄但練過(等級>1)/裝過至寶/投資過的舊英雄,一律直接歸屬該玩家(玩家下次登入自動補蓋 UID 永久認定),不再被當污染。',
      '🔍【GM·過度補回稽查與回收】新增工具(玩家活動記錄查詢卡):輸入學生帳號 → 查出之前「沒審 uid 的舊救援『確認救援並補回』」誤補進來的別位同學英雄/至寶 → 一鍵全數回收;已練的英雄自動補償(知識幣+召喚水晶),並寄道歉通知讓學生登入時看到收回了哪些、補了什麼。學生自己按「這是我的」確認的英雄,等級與培養記錄一併鎖進雲端三槽,不再被誤刪或回溯成 Lv1。',
    ],
    items: [
      '★ v3.16.84【救援帳本核對綁 UID·index.html】_fbRebuildAccountFromLedgers「應該擁有英雄」改只認 _heroUnlockHistory 中 uid=本帳號前 12 碼的解鎖紀錄(advSaveUnlockedHero/_advSaveTreasureUnlockHistory 每筆都寫自己 uid;共用平板別人留下的帶別人 uid)→ 別帳號殘留的解鎖事件不再被當「該補回」,根治老師回報「補回英雄錯很多·學生說都不是他們的」。退回類來源(admin_delete/audit_error_recovered)一律不補回。至寶帳本同步只認本帳號 uid。',
      '★ v3.16.84【舊英雄歸屬·grandfather·index.html】救援核對對「現有但無自己 uid 紀錄」的英雄:若練過(lv>1)/裝至寶/投資過(素質·技能·天賦·爆發,皆從載入合併後資料 _cur+_s 算)→ 列為「✅ 已歸屬本帳號的舊英雄」(diff.grandfatheredHeroes),不列污染清單、不移除;真的查無紀錄又沒任何培養證據者才列「帳本查無紀錄」供人工確認(仍不自動移除)。★ 關鍵拆分:對「有別位同學 uid 真實解鎖紀錄、但本帳號自己無紀錄」者(舊救援沒審 uid 誤補進來的別人英雄)單獨列為 diff.crossAccountHeroes,不當 grandfather 歸屬(否則會把別人的英雄變成學生的)→ 改導引去「🔍 過度補回稽查與回收」回收+補償+道歉。玩家端自動補蓋 UID 亦同步排除「有別人 uid 紀錄」者,避免在 GM 回收前先把它合法化。',
      '★ v3.16.84【玩家端自動補蓋 UID·止 churn·index.html】登入協調器 _lxpsRecoverAuditErrorHeroes(原 v3.16.28 已全停用·絕不回收任何角色)改作「舊英雄補蓋 UID 歸屬」:對「擁有但無自己 uid 解鎖紀錄」且練過/裝至寶/投資過的英雄,補寫一筆 legacy_grandfather 自己 uid 紀錄(本機 adv_hero_unlock_history + fire-and-forget arrayUnion 雲端 _heroUnlockHistory)→ 永久歸屬本帳號,圖鑑審查/救援不再反覆把它當「查無紀錄污染」重判。純加紀錄·不刪不改任何英雄/等級(載入路徑神聖·只增不減);idempotent(已有自己紀錄即跳過)·初始 8 隻免紀錄略過·擁有<8 視為雲端未載完輕量重試。',
      '★ v3.16.84【圖鑑認定·沿用既有 UID 綁定】英雄圖鑑「這是我的」自助審查自 v3.16.29 起即核對雲端 _heroUnlockHistory 自己 uid、v3.16.67 圖鑑大圖下方標示每隻 UID 解鎖來源,本就綁 UID;_advHasGenuineUnlock 亦已保留練過/裝至寶/投資/自己 uid 紀錄者。配合本輪玩家端自動補蓋 UID,練過的舊英雄會取得自己 uid 紀錄 → 圖鑑認定全面綁 UID 一致,無需再改判定。',
      '★ v3.16.84【GM 選單同步·admin_panel.js】「📨 帳號救援申請審核」卡與「🔧 一鍵帳號重建」卡的核對結果皆新增「✅ 已歸屬本帳號的舊英雄 N 隻」綠晶片區塊(讀 diff.grandfatheredHeroes),讓老師清楚看到哪些舊英雄已被自動認定為學生的、無需處理。純顯示·無邏輯/同步變動·無 ?.;免三點同步。',
      '★ v3.16.84【過度補回稽查與回收·後端·index.html】新增 window._fbAdminScanOverRestoredForUid(uid)(讀三槽合併·列出「有別位同學 uid 真實解鎖紀錄但本帳號自己無紀錄、也未 player_confirmed」的英雄[名+等級]與至寶=舊救援沒審 uid 誤補的別人項目)+ window._fbAdminReclaimOverRestoredForUid(uid,英雄,至寶):①對已練(lv>1)者先補償(每等級 500 知識幣 + 每隻練過 2 召喚水晶上限 20·走 _fbCompensatePlayer add)②回收英雄(走既有 _fbAdminBulkRemoveHeroes 寫三槽+admin_delete+清養成_s·不復活)+ 至寶(_fbAdminRejectAuditTreasures)③寄道歉通知(_fbAdminSendNotificationToPlayer·type compensation·列回收項目+補償·玩家登入彈窗)。根治老師回報「舊『確認救援並補回』按鈕沒審 uid 過度補回」災難。',
      '★ v3.16.84【過度補回稽查·GM UI·index.html+admin_panel.js】index.html 加 window._fbShowOverRestoredAudit(email/uid/學號)(解析帳號→掃描→彈窗列誤補的英雄[Lv·已練標🔥]/至寶→「🔄 全部回收並補償+發道歉通知」鈕·confirm 後執行+結果回報);admin_panel.js「📜 玩家活動記錄查詢」卡新增「🔍 過度補回稽查與回收」鈕(讀查詢框 email/uid/學號→開該彈窗)+「📨 帳號救援申請審核」卡核對結果加 diff.crossAccountHeroes 紅晶片區塊(導引去稽查工具)。無 ?.·免三點同步。',
      '★ v3.16.84【確認「這是我的」鎖等級·index.html】_lxpsConfirmOwnHero(圖鑑「✅ 確認是我的」)在寫 player_confirmed 自己 uid 紀錄後,gameCloudSave 立即同步+加 2.5s 延遲重試 → 把該英雄目前等級+培養記錄(heroLevels_s/各養成 _s)確實寫上雲端三槽(合併優先採信 _s·v3.15.96)→ 學生確認過的英雄不會再被誤刪、也不會回溯成 Lv1(涵蓋首登 _progressLoaded 尚未就緒時第一次存檔被略過的情況)。',
      '★ v3.16.84【版本/範圍/尚未上傳堆疊】本輪改 index.html + admin_panel.js + game_changelog.js;hero_db.js 內容未改僅 manifest 版號·免重傳。七點版本同步 → v3.16.84。GAME_CHANGELOG 維持 20 筆(移除最舊 v3.16.64)。⚠ 本版含尚未上傳的 v3.16.82(埃及雙王開放 SSR 卷+戰鬥中延後套用)與 v3.16.83(GM 誤發獎勵刪除連帶清收件箱),請老師直接上傳最新 v3.16.84(已涵蓋全部)。',
    ],
  },
  // v3.16.83 — GM:誤發 GM 獎勵刪除時連帶清除學生收件箱紀錄(GM 專屬)
  {
    ver: 'v3.16.83',
    date: '2026-06-29',
    adminOnly: true,
    brief: [
      '🎁【GM·誤發獎勵清紀錄】後台「🎁 GM獎勵紀錄」彈窗每筆新增「🗑 刪除此筆」鈕:誤發的 GM 獎勵刪除後,會一併把學生「🎁 GM 獎勵」收件箱的待領項與已領取紀錄清乾淨。',
    ],
    items: [
      '★ v3.16.83【GM刪除誤發獎勵·index.html】新增 window._fbAdminDeleteGmClassReward(uid,rewardId):清 ① 收件箱 items doc(gmClassRewards/items;規則不允許刪除時退而 enabled:false 隱藏待領)② 認領文件 claim doc(gmClassRewardClaims)③ 玩家主檔 _gmcrClaimLog(收件箱「✅ 已領取紀錄」顯示來源·GM 對 players 全權必能寫)。_gmcrClaimed 待領抑制快取刻意保留(即使 items 沒刪成功也不會讓該筆又冒出來變待領)。「🎁 GM獎勵紀錄」彈窗每列加 data-rid 的「🗑 刪除此筆」鈕,確認後呼叫此函式並隱藏該列。⚠ 只刪「紀錄」,不自動扣回已入帳的獎勵/英雄(收回另用學生補償負值/污染英雄刪除工具)。⚠ items/claim 兩 collection 刪除需部署 firestore.rules 允許 isAdmin delete(Console 權威);_gmcrClaimLog 清除不受規則影響必生效。',
      '★ v3.16.83【調查·無程式改動】另兩項學生回報經查:①「每天登入莫名得 10 顆召喚水晶」——全部 10 顆水晶來源(會員資料獎勵/特別挑戰30題/小博士+世界BOSS排名/全體獎勵/審查道歉補償)守門皆正確(雲端旗標/認領文件 transaction/claimedAt),靜態無法重現,需老師提供「受影響學生是否同時得到幣/SSR券、登入時有無彈窗」以精準定位,故本輪不貿然改發獎邏輯。②「圖鑑稀有度篩選對部分人無效」——圖鑑(heroFilterClick)與編組(hpickFilterClick)兩套篩選+_getHeroRarity 代碼皆正確且對所有人一致,「有些人正常」研判為舊版快取;本次版號 bump 會破快取,請受影響學生更新到最新版(清快取/重新整理/重裝)。',
      '★ v3.16.83【版本/範圍】七點版本同步 → v3.16.83。本輪只改 index.html(GM 刪除誤發獎勵);admin_panel.js 純版號對齊·hero_db.js 內容未改僅 manifest 版號·免重傳。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.63)。本版含尚未上傳的 v3.16.82(埃及雙王開放 SSR 卷 + 戰鬥中老師更新資料改打完再套用)。',
    ],
  },
  // v3.16.82 — 埃及雙王開放 SSR 召喚卷取得 + 戰鬥中老師更新資料改打完再套用(不再中斷回溯)
  {
    ver: 'v3.16.82',
    date: '2026-06-29',
    brief: [
      '🏜【埃及雙王開放召喚卷】法老王與埃及豔后現在也能用「SSR 自選召喚卷」直接挑、或用「SSR 隨機召喚卷」抽到了(原本只能在埃及關卡機率收服);星空召喚仍維持不會抽到雙王。',
      '🛡【戰鬥中老師更新資料·改打完再套用】老師更新你的帳號資料時,如果你正在戰鬥中,系統不再立刻重新載入(避免打到一半的進度被中斷回溯);會先提示「打完本場戰鬥、回到關卡選擇後自動套用」,等你回到非戰鬥畫面才重新載入吃最新進度。',
    ],
    items: [
      '★ v3.16.82【埃及雙王開放 SSR 卷·index.html】_summonTicketUnrecorded 的 SSR 分支移除埃及雙王過濾(原 not _egExcl.has(n))→ 法老王/埃及豔后(EGYPT_EXCLUSIVE_HEROES)現可進入 SSR 自選卷可選池與 SSR 隨機卷產出池;星空召喚池仍以 _egSummonExcl/_egSummonExcl2 排除雙王(維持星空抽不到),兩條互不影響。',
      '★ v3.16.82【戰鬥中延後權威重載·index.html】_onAuthoritativeRestore(GM 補償/還原/重建偵測後的重新載入)改為:先立即停止本機所有寫雲端(unsub session listener + 清安全槽定時存檔)並落地「已處理 restoreAt」基線/計數;若此刻 _isInBattleNow() 為真→不硬重載,改提示「打完回關卡選擇自動套用」並每 1.5 秒輪詢,回到非戰鬥畫面(或最長 15 分鐘保險逾時)才 location.reload();非戰鬥則照舊 1.8 秒重載。比照既有「即時版本更新」延後機制(_isInBattleNow + _flushPendingUpdateIfAny)。★ 延後期間存檔已被擋(上述 unsub+清定時 + _authoritativeReloadTriggered 保護層),過時進度不會反向覆蓋老師改動;110082「補了又消失」防護不變。',
      '★ v3.16.82【課堂獎勵 UR 天使預設不勾·admin_panel.js】GM「課堂獎勵發放」工具的「UR 藝天使．克雷爾」勾選框移除預設勾選 → 改為預設不勾,避免老師批次發課堂獎勵時誤把 UR 天使一起發出去(廣播/序號兌換工具本就無預設勾選,此次對齊)。',
      '★ v3.16.82【版本/範圍】七點版本同步 → v3.16.82。本輪改 index.html + admin_panel.js + game_changelog.js;hero_db.js 內容未改·僅 manifest 版號對齊·免重傳。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.62)。',
    ],
  },
  // v3.16.81 — 學生 GM 獎勵視窗改外層單一捲動·底部領取／兌換鈕保證點得到
  {
    ver: 'v3.16.81',
    date: '2026-06-29',
    brief: [
      '🎁【修正·GM 獎勵視窗可捲動】學生「🎁 GM 獎勵」視窗（老師發的獎勵＋序號兌換）現在整個視窗都能上下捲動,內容再長也能捲到最底,確實點到每張獎勵的「✅ 確認領取」與「✨ 兌換」按鈕(先前直式 iPad 上下兩區堆疊時,底部按鈕會被裁切點不到)。',
    ],
    items: [
      '★ v3.16.81【捲動修正·index.html】redeem-overlay 卡片內改用外層單一捲動容器(flex 1 1 auto·min-height 0·overflow-y auto·-webkit-overflow-scrolling touch)包住左右兩區。根因:原 v3.16.70 雙欄各自捲動依賴 flex-wrap wrap 換行後的欄位高度約束·但直式 iPad 兩區堆疊時 wrapped 欄位失去高度上界→內層 overflow-y auto 不生效→內容溢出被卡片 overflow hidden 於 max-height 92vh 裁掉→底部確認鈕點不到。改外層捲動為標準可靠 iOS 模式(卡片 flex column＋max-height 92vh→外層取得受限高度可靠捲動)·任何裝置／直式都能捲到底。',
      '★ v3.16.81【純佈局·零邏輯】只改 index.html 視窗結構與副標文案(各自捲動→往下捲看全部)·收件區渲染與認領／兌換邏輯(_renderGmClassRewardInbox／_claimGmClassRewardFromInbox／_doRedeem)完全不動·event handler 與 id 全不變。七點版本同步 → v3.16.81·admin_panel.js 僅版號·hero_db.js 免重傳。',
    ],
  },
  // v3.16.80 — 新增 UR 自選召喚卷(可自選一隻 UR 英雄)+ GM 發獎可發放
  {
    ver: 'v3.16.80',
    date: '2026-06-29',
    brief: [
      '👑【新道具·UR 自選召喚卷】新增「UR 自選召喚卷」!持有後到召喚星空使用,可從尚未收錄的 UR 英雄(藝天使．克雷爾／魔劍姬‧伊莉雅／主神奧汀)中親自挑選一名解鎖(若 UR 已全收錄則保留以後再用)。老師可透過發獎工具發放。',
    ],
    items: [
      '★ v3.16.80【新道具·index.html】BACKPACK_ITEM_DEF 新增 summon_ticket_ur_pick(UR 自選召喚卷·👑·type:use·前往召喚星空使用)·完全比照 summon_ticket_ssr_pick。',
      '★ v3.16.80【使用流程·index.html】沿用既有 tier 參數化自選券機制加 UR tier:_summonTicketUnrecorded 加 UR 分支(讀 window._LXPS_RARITY_UR 三隻 UR 中尚未收錄者)·_openSummonTicketModal 面板加 UR 自選券卡(張數+剩餘可選數)·_openSummonTicketPickModal 與 _useSummonTicketPick 的 _ticketId/_accent 加 UR 對應(summon_ticket_ur_pick·色 ff5e9c)·背包道具使用鈕路由加 summon_ticket_ur_pick 開召喚卷面板。解鎖/防重入/結果動畫全沿用既有路徑·不改機率表。',
      '★ v3.16.80【GM 發獎·admin_panel.js】三支發獎工具(成績獎勵 _cr／全體玩家獎勵 _gr／虛寶序號 _rc)各於 UR 三隻下方新增 UR 自選召喚卷數量勾選列·_buildReward/_grBuildReward/_rcBuildReward 各加 backpack.summon_ticket_ur_pick 入袋(比照 SSR 自選券)。全體玩家獎勵廣播的 UR 打字確認守門(v3.16.79)同步納入 _gr-item-urpick→廣播 UR 自選券一樣需輸入發給全校。',
      '★ v3.16.80【驗證／版本】index.html 20 個 inline script node --check 全過、0 lone surrogate;admin_panel.js node --check 過、0 個真正可選串接。七點版本同步 → v3.16.80。GAME_CHANGELOG 維持 20 筆(移除最舊 v3.16.60)。本輪改 index.html(道具+使用流程)+admin_panel.js(GM 發獎勾選)+game_changelog.js;hero_db.js 僅 manifest 版號免重傳。',
    ],
  },
];
