// ════════════════════════════════════════════════════════════════════════
//  game_changelog.js  —  LXPSGAME 更新日誌
//  最後更新:2026-06-29  / 目前主程式版本:v3.16.85(過度補回稽查與回收「掃全體」版 + 救援記錄預設全列;GM 專屬)
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
  // v3.16.79 — 成績獎勵搜尋反向模糊比對收緊 + 全體獎勵 UR 廣播二次確認(GM 後台·玩家無感)
  {
    ver: 'v3.16.79',
    date: '2026-06-29',
    adminOnly: true,
    brief: [
      '🛠【GM 後台·發獎發錯人根治】修正成績獎勵只輸入某帳號(如 clarebox123jp)卻把獎勵發到不相干學生(jlu1201 解鎖 UR)的問題;玩家端無感。',
    ],
    items: [
      '★ v3.16.79【根因】玩家搜尋 _fbAdminFindPlayersByName 的反向模糊比對 reverse_contains(輸入字串「包含」某玩家暱稱·暱稱長度大於等於 2 即命中)過鬆:輸入信箱帳號字串 clarebox123jp(13 字)時·任何暱稱剛好是其子字串(box／clare／123 等)的學生都被誤命中→若成為唯一命中就自動入收件清單→UR 發錯到該學生。',
      '★ v3.16.79【修法·index.html】reverse_contains 與 no_prefix_reverse 兩條反向分支加守門 _norm.length 小於等於 6(僅真名／部分中文名才允許反向)·長信箱帳號字串不再反向誤命中學生暱稱;本尊仍由 email_contains(信箱含輸入·安全方向)正確找到·中文部分名搜尋照常。此函式多處共用·收緊等於搜尋更精準·無回歸。',
      '★ v3.16.79【乙·admin_panel.js】全體玩家獎勵廣播工具勾到任一 UR(克雷爾／伊莉雅／奧汀)時·送出前硬性打字確認(需輸入四個字 發給全校)·防手滑把 UR 廣播給全校約 900 人;UR 單發給某帳號改用 GM 獎勵 per-uid 工具(綁 gmClassRewards 該 uid·已驗證不外洩)。',
      '★ v3.16.79【清理】已誤發的 UR 用 GM 英雄／至寶持有者審查掃全體逐人刪除。',
      '★ v3.16.79【驗證／版本】index.html 20 個 inline script node --check 全過、0 lone surrogate;admin_panel.js node --check 過、0 個真正可選串接。七點版本同步 → v3.16.79。GAME_CHANGELOG 維持 20 筆(移除最舊 v3.16.59)。本輪改 index.html(搜尋)+admin_panel.js(廣播護欄)+game_changelog.js;hero_db.js 僅 manifest 版號免重傳。',
    ],
  },
  // v3.16.78 — 「📨 帳號救援申請審核」逐項處理不互架、狀態永久保留
  {
    ver: 'v3.16.78',
    date: '2026-06-29',
    brief: [
      '📨【帳號救援審核逐項處理】修正老師後台「📨 帳號救援申請審核」：以前一筆申請內若同時有英雄審查和至寶審查，只要處理其中一項（按通過／刷除／補回）整筆就被關閉，導致另一項沒辦法處理。現在改為「逐項處理互不影響」：每項處理完會顯示 ✅ 已審查完畢（含時間）、該項按鈕收起，其他項目的按鈕繼續保留可繼續處理；狀態寫雲端永久保留，重新整理也看得到哪些已審查、哪些待確認。整筆只由「✔ 標記已處理／✖ 駁回」關閉。(玩家端無感)',
    ],
    items: [
      '★ v3.16.78【根因】救援審核卡 _analyze 內所有審查區塊的按鈕都 append 到同一個 actionsEl，而每個逐項 handler 結尾 actionsEl.innerHTML 設空字串會清掉「全部」按鈕；加上每個 handler 都呼 _fbResolveAccountRescueRequest(resolved) 關閉整筆 → 處理一項就不能處理另一項。',
      '★ v3.16.78【後端·index.html】新增 window._fbMarkRescueItemHandled(uid, itemKey, note)：只寫 accountRescueRequests/{uid}._handledItems[itemKey] = {at,by,note}(merge:true 對 nested map 子鍵安全·不洗掉其他已處理項)·不改 status。整筆關閉仍走 _fbResolveAccountRescueRequest(由 ✔標記已處理／✖駁回 觸發)。GM 寫同一 doc·沒有新 collection·免新增 firestore.rules。',
      '★ v3.16.78【面板·admin_panel.js】_analyze 加 handled 參數(傳 _r._handledItems)+新增 _appendActionOrDone(key,label,btns)：已處理項顯示 ✅已審查完畢+時間+備註、不再出鈕；未處理才出鈕。六區塊(遺失英雄復原／污染英雄刷除／污染至寶刷除／遺失至寶補回／英雄審查／至寶審查)各綁一個 handledKey(lostHeroes／disownHeroes／disownTreasures／lostTreasures／auditHeroes／auditTreasures)。',
      '★ v3.16.78【8 個逐項 handler】_restoreLost／_disownRemove／_approveAudit／_rejectAudit／_approveAuditTreasures／_rejectAuditTreasures／_disownRemoveTre／_restoreLostTre 都加 (claims, handled) 參數，動作後改呼 _fbMarkRescueItemHandled(只標單項) + handled[key]=... + 重呼 _analyze 重渲(保留其他區塊按鈕)、不再清空或關閉整筆。「✔ 標記已處理／✖ 駁回」(_confirmRescue／_reject)維持關閉整筆不變。無 ?.。',
      '★ v3.16.78【驗證／版本】index.html 20 個 inline script node --check 全過、0 lone surrogate；admin_panel.js node --check 過、0 個真正可選串接；逐項 resolve 殘留=0(只剩整筆 _confirmRescue／_reject)、markHandled=8。七點版本同步 → v3.16.78。GAME_CHANGELOG 維持 20 筆（移除最舊 v3.16.58）。本輪改 index.html(後端 helper)+admin_panel.js(救援卡)+game_changelog.js；hero_db.js 僅 manifest 版號免重傳。',
    ],
  },
  // v3.16.77 — 「🔍 持有者審查」勾選清單補齊 UR／SR／R（含答題解鎖）
  {
    ver: 'v3.16.77',
    date: '2026-06-29',
    brief: [
      '🔍【持有者審查勾選清單補齊】老師後台「🔍 英雄／至寶持有者審查」原本勾選清單只有 SSR 英雄，現在補齊為四大稀有度分組：👑 UR／SSR／SR／R（R 含答題解鎖的 小力／幼兒園小孩／機關王雙人組），全稀有度都查得到了。(玩家端無感)',
    ],
    items: [
      '★ v3.16.77【全稀有度勾選清單·index.html+admin_panel.js】原 _buildPicker 只讀 window.SUMMON_RARE_HEROES(=SSR 母體)。修法：① index.html 在 _getHeroRarity 旁暴露 window._LXPS_RARITY_UR = Array.from(_RARITY_UR_HEROES)、window._LXPS_RARITY_R = Array.from(_RARITY_R_HEROES)（SSR=SUMMON_RARE_HEROES、SR=SUMMON_SR_HEROES 早已暴露）。② admin_panel.js _buildPicker 改為四稀有度分組 👑UR／🟧SSR／🟪SR／🟦R（_heroGroup 逐組標題+計數+到 _seen 去重），同一搜尋框篩選。R 組含答題解鎖 小力／幼兒園小孩／機關王雙人組(原本在 _RARITY_R_HEROES Set 裡)。查詢／刷除／補償邏輯不變。無 ?. 可選串接。',
      '★ v3.16.77【驗證／版本】index.html 20 個 inline script node --check 全過、0 lone surrogate；hero_db.js／admin_panel.js／game_changelog.js node --check 過、admin_panel.js 0 個真正可選串接。七點版本同步 → v3.16.77。GAME_CHANGELOG 維持 20 筆（移除最舊 v3.16.57）。本輪改 index.html(UR／R 暴露)+admin_panel.js(_buildPicker 四分組)+game_changelog.js；hero_db.js 僅 manifest 版號免重傳。',
    ],
  },
  // v3.16.76 — 老師後台新增「🔍 英雄／至寶持有者審查」工具
  {
    ver: 'v3.16.76',
    date: '2026-06-29',
    brief: [
      '🔍【老師後台：英雄／至寶持有者審查】老師在管理面板「🧹 帳號污染處理」新增一個工具：勾選任意英雄／至寶 → 查出全班「誰持有這些英雄／至寶」，並顯示每人的取得來源與取得時間，方便審查是否為不正常取得。來源查無紀錄／未標記的會排在最前面。可直接對單一玩家刷除該英雄／至寶或發放補償。(玩家端無感)',
    ],
    items: [
      '★ v3.16.76【持有者審查·後端·index.html】新增 window._fbAdminScanItemOwners(heroNames, treasureIds)：一次 getDocs(players) 全玩家掃描，逐人取 unlockedHeroes ∩ 所選英雄 + taiwanTreasureData key ∩ 所選至寶；來源／時間取自 _heroUnlockHistory／_treasureUnlockHistory 每名「最新一筆」帳本紀錄，等級讀 heroLevels／taiwanTreasureData[id].lv；回傳 {scanned, owners:[{uid,email,displayName,heroes:[{name,source,at,lv}],treasures:[{id,name,source,at,lv}]}]}，來源空白／admin_delete(可疑)排最前、其次依名稱。唯讀不寫。',
      '★ v3.16.76【持有者審查·面板·admin_panel.js】新增 GM 區塊 #_admin-item-owner-section(🧹 帳號污染處理群組)：可搜尋的英雄(讀 window.SUMMON_RARE_HEROES)／至寶(讀 window.TAIWAN_TREASURES)勾選清單 + 「🔍 查詢持有者」鈕 → 呼 window._fbAdminScanItemOwners → 逐位列玩家（名／uid／信箱）+ 每項英雄／至寶的來源白話標籤 + 時間。每列「🗑 券除」(英雄走 window._fbAdminBulkRemoveHeroes 寫三槽+admin_delete 不復活；至寶走 window._fbAdminRejectAuditTreasures 移出)，「🎁 補償」(輸入知識幣／召喚水晶數量→ window._fbCompensatePlayer)。三點同步(SIDEBAR_ITEMS+SIDEBAR_GROUPS+卡片+_initItemOwnerSection IIFE)；_buildPicker 載入競態守門(globals 未就緒 1.5s 重試)；_esc 跳脫；無 ?. 可選串接。',
      '★ v3.16.76【影響／安全】新增純屬 GM 審查工具，玩家端零改動、不碰存檔／載入／同步核心。查詢為一次性讀取所有玩家文件(配額消耗大·僅手動點查詢時)；刷除走既有 admin_delete 三槽守門不復活·補償走既有帳本。本輪改 index.html(后端 helper)+admin_panel.js(卡片+IIFE+三點同步)+game_changelog.js；hero_db.js 僅 manifest 版號免重傳。',
      '★ v3.16.76【驗證／版本】index.html 20 個 inline script node --check 全過、0 lone surrogate；hero_db.js／admin_panel.js／game_changelog.js node --check 過、admin_panel.js 0 個真正可選串接。七點版本同步 → v3.16.76。GAME_CHANGELOG 維持 20 筆（移除最舊 v3.16.56）。同輪並含 v3.16.75 鬥技場主頁排版(視窗加寬 50%+排名獎勵各名次獨立一行)。',
    ],
  },
  // v3.16.75 — 鬥技場主頁內容視窗加寬 50% + 排名獎勵各名次獨立一行
  {
    ver: 'v3.16.75',
    date: '2026-06-29',
    brief: [
      '🏟️【鬥技場主頁排版優化】① 中央內容視窗加寬約 50%，鬥技場介紹、戰鬥模式、排名獎勵等文字不再被擠到第二行、看得更整齊。② 排名獎勵改成「每個名次各自一行」（第 1 名／第 2-5 名／第 6-10 名／第 11 名以後 分行列出），不再擠在一起亂換行。',
    ],
    items: [
      '★ v3.16.75【內容視窗加寬·index.html】#arenaLobbyOverlay .al-body 的 max-width 由 900px 改 1350px（+50%）：配合 v3.16.72 介紹／獎勵文字放大 200%，寬螢幕用更多橫向空間讓單行文字不跨第二行；保留 width:100% 故窄螢幕（手機／直式）仍不溢出、margin:0 auto 維持置中。純 CSS 一處。',
      '★ v3.16.75【排名獎勵分行·index.html】#arenaLobbyOverlay 排名獎勵區 .al-reward-text 四個名次原以全形空白「　」兩兩併在同一行（第 1 名＋第 2-5 名一行、第 6-10 名＋第 11 名以後一行），放大字級後擠在一起亂換行；改為每名次各自獨立一行（🥇第 1 名 ／ 🥈第 2-5 名 ／ 🥉第 6-10 名 ／ 🎀第 11 名以後 共 4 行），獎勵數值內容完全不變。純文字排版一處。',
      '★ v3.16.75【驗證／版本】index.html 20 個 inline script node --check 全過、0 lone surrogate；hero_db.js／admin_panel.js／game_changelog.js node --check 過、admin_panel.js 0 個真正可選串接。七點版本同步 _GAME_LOADED_VERSION + _vers[index.html／hero_db.js／admin_panel.js／game_changelog.js] + ADMIN_PANEL_VERSION + changelog 頂部 ver → v3.16.75。GAME_CHANGELOG 維持 20 筆（移除最舊 v3.16.55）。本輪僅改 index.html 2 處（鬥技場 CSS+文字排版），admin_panel.js 與 game_changelog.js 僅版號對齊／新增條目、hero_db.js 僅 manifest 版號免重傳。',
    ],
  },
  // v3.16.74 — 鬥技場上方場次統計欄底色改透明深藍(字看得更清楚)
  {
    ver: 'v3.16.74',
    date: '2026-06-29',
    brief: [
      '🏟️【鬥技場統計欄看得更清楚】鬥技場上方「今日剩餘/總勝場/總平手/總敗場/鬥技之證/入場券」那一排的底色,由原本很淡的金色改成透明深藍色,在明亮的天空背景下數字和文字都清楚多了。'
    ],
    items: [
      '★ v3.16.74【鬥技場統計欄底色·index.html】#arenaLobbyOverlay .al-stats-bar 背景由 rgba(255,200,80,0.12)(淡金·在明亮天空動態背景下對比不足→金色數字+白色標籤看不清)改 rgba(14,30,72,0.82)透明深藍,邊框由淡金 rgba(255,200,80,0.3)改淺藍 rgba(120,170,255,0.45)使面板協調;金色數字(.al-stats-num #ffd07b)維持→深藍底上對比更強。純 CSS 一處,JS/結構/版號邏輯不動。',
      '★ v3.16.74【驗證/版本】index.html 20 個 inline script node --check 全過、0 lone surrogate;hero_db.js/admin_panel.js/game_changelog.js node --check 過、admin_panel.js 0 個可選串接。七點版本同步 → v3.16.74。GAME_CHANGELOG 維持 20 筆(移除最舊 v3.16.54)。本輪僅改 index.html 1 處 CSS,admin_panel.js 與 game_changelog.js 僅版號對齊、hero_db.js 僅 manifest 版號免重傳。'
    ],
  },
  // v3.16.73 — 修正放棄戰鬥回關卡主頁左下 SOS 求救鈕殘留
  {
    ver: 'v3.16.73',
    date: '2026-06-29',
    brief: [
      '🆘【修正左下 SOS 求救鈕殘留】放棄戰鬥回到關卡主頁後,左下角紅色「🆘 求救(SOS)」鈕沒有隱藏(它只該在戰鬥中出現)。現在任何路徑回到冒險選關頁都會把它正確隱藏,不再殘留在主頁。'
    ],
    items: [
      '★ v3.16.73【SOS 求救鈕殘留修正·index.html】症狀:放棄戰鬥(toast「已放棄上次戰鬥,可以開始新的冒險!」)回到關卡主頁後,左下角 #adv-battle-help-fab(🆘 求救/SOS·v3.16.46 整併鈕)仍顯示。根因:該 FAB 顯示由戰鬥 watchdog(_lxpsBattleRescueBtnWatchdog·每 1.5s)在 _inBattle() 為真時強制 display:block 並 reparent 到 body,但 watchdog 只負責「戰鬥中顯示」、離開戰鬥(放棄/勝/敗)時並不負責隱藏;_hideDeadlockRescueButton 也刻意不改其 display(註「顯隱交給 watchdog」)→ 離開戰鬥後 FAB 維持戰鬥中的 display:block 殘留。放棄函式已把 _adventureMode=false / G.p1=[] / _advBattleResultShown=true 全清(故 _inBattle() 回 false→watchdog 提早 return 不再碰它),但沒有任何點把它設回 none。修法:在 openAdventureOverlay(冒險選關頁進入點·所有回選關頁路徑皆經過)既有「強制隱藏 🔄回溯/❓教學 戰鬥專用鈕」處,補上把 #adv-battle-help-fab 設 display:none + 解除可能殘留的紅光 alert 樣式(dataset.state 清空·animation:none)。選關頁 _inBattle() 為 false→watchdog 不會再把它顯示回來,修正穩定。',
      '★ v3.16.73【影響範圍/安全】只動 openAdventureOverlay 一處(以 try/catch 包覆·取不到元素即靜默略過),不碰戰鬥 watchdog 全域邏輯、不碰 _hideDeadlockRescueButton、不影響戰鬥中該鈕的常駐顯示與卡死自救紅光提醒、不影響結算/過場/首頁/其他模式。本輪僅改 index.html(此修正在此),admin_panel.js 與 game_changelog.js 僅版號對齊/新增條目、hero_db.js 僅 manifest 版號免重傳。',
      '★ v3.16.73【驗證/版本】index.html 20 個 inline script node --check 全過、0 lone surrogate;hero_db.js/admin_panel.js/game_changelog.js node --check 過、admin_panel.js 0 個可選串接。七點版本同步 _GAME_LOADED_VERSION + _vers[index.html/hero_db.js/admin_panel.js/game_changelog.js] + ADMIN_PANEL_VERSION + changelog 頂部 ver → v3.16.73。GAME_CHANGELOG 維持 20 筆(移除最舊 v3.16.53)。'
    ],
  },
  // v3.16.72 — 鬥技場主頁(動態背景固定+字放大+底色加深) + 場景圖延遲載入策略(登入只載必要圖·冒險點進去才載·PWA 安裝版仍完整預載)
  {
    ver: 'v3.16.72',
    date: '2026-06-29',
    brief: [
      '🏟️【鬥技場主頁優化】①動態背景影片改成固定不隨內容捲動(跟原本的靜態圖一樣穩定)②鬥技場介紹說明與排行榜的字體放大一倍、看得更清楚 ③文字框底色加深,字更清晰好讀。',
      '⚡【登入更快‧不卡載入】登入時只先下載必要的圖(首頁/關卡主頁/每日召喚/每日商店/背包),冒險各關卡的場景圖改成「點進冒險才邊看貓咪讀取中、邊慢慢下載」。這樣全班同時登入時不會再卡在載入畫面、也不會一直重複載入失敗;載入太久時點一下讀取畫面就能直接進入,絕不卡住。',
      '📥【完整安裝版照樣完整】如果是「加入主畫面」的完整安裝版(老師授權版),仍然會在安裝時把所有關卡場景圖先存進手機/平板,離線或網路不好時各頁面都不會卡載入。'
    ],
    items: [
      '★ v3.16.72【鬥技場主頁·index.html】①動態影片背景固定:#arenaLobbyOverlay 移除自身 overflow-y:auto,捲動容器改到 .al-body(flex:1+min-height:0+overflow-y:auto+-webkit-overflow-scrolling:touch)→ #arena-bg-video(position:absolute 相對非捲動的 overlay)像原靜態鬥技場.png 一樣固定(仿 v3.16.23 audit overlay 佈局,避免 iOS position:fixed 在 overflow 容器內抖動);影片元素本身未動 ②文字放大×2:.al-rules-list 16→32 / .al-rule-key min-width 110→200 / .al-rank-table 15→30 / th 14→28 / 載入空狀態 15→30 / 排名獎勵說明 16→32 / 結算徽章 15→28 / 介紹段落內聯 15→30;窄螢幕@max-width480 同步放大 ③.al-section 底色 rgba(0,0,0,0.55→0.74)加深。純 CSS/內聯,JS 未動。',
      '★ v3.16.72【場景圖延遲載入策略·index.html】老師最高準則:①絕不卡登入/不連續載入失敗 ②不碰存檔與帳號同步(純資源預載,結構上不可能造成同裝置污染)。作法:【A 工具】新增 window._lxpsShowLoading/_lxpsHideLoading(貓咪讀取中.gif 全螢幕遮罩,三重防卡死:頁面一律先顯示在遮罩下方=非阻塞、點一下遮罩可強制關閉、12 秒自動關閉安全網,貓咪圖 onerror 不破圖)+ window._lxpsPreloadResources(urls,opts)(批次預載圖片,回傳 Promise 永不 reject,每張 8s/整批逾時都 resolve→頁面一定進得去)。【B boot loader】場景圖拆 _priorityImages(11 張:首頁/關卡主頁/元素選擇/每日召喚可愛+精美/超商/背包/精美首頁+校門+自然教室)與 _lazyImages(23 張:貓空/日本/台灣/精美版冒險場景),boot 首次模式只預載 _priorityImages(原 34→11)→ 下載尖峰大降、失敗率更易 <30% 而寫 done 旗標→下次走快速模式不再重抓→不卡登入;兩陣列在 sessionStorage 早退前就掛 window(回頭分頁也讀得到);boot BGM 等待清單縮成只等選單 BGM(戰鬥/冒險 BGM 進場時自然載入,不動 <audio> 標籤故播放時機不變)。',
      '★ v3.16.72【延遲載入接點·index.html】①鬥技場 openArenaLobby:pending-battle 守門後加非阻塞預載鬥技場.png(_lxpsShowLoading→_lxpsPreloadResources→_lxpsHideLoading,主頁照常顯示在遮罩下方)②冒險 openAdventureOverlay 成功路徑(所有登入/雲端守門通過後、_setAdventureOverlayBg 前)加 _lxpsAdvScenesPreloaded 一次性守門:首次進選關頁才批次預載全部 _lazyImages(打完一場回選關頁不再重跳=已快取);兩處皆遮罩逾時/可點穿過→絕不卡頁。',
      '★ v3.16.72【PWA 完整安裝版精準預載·index.html】collectAllResourceUrls 第 7 步補入 window._LXPS_ALL_SCENE_IMAGES(優先+延遲全部;這些 URL 由 _gB+字串 串接組成→第 6 步全文 regex 抓不到)→ 完整安裝版(管理員/已授權/已安裝)precacheAllAssets 一定把所有關卡場景圖存進 cache,保證安裝版離線/弱網各頁面不卡載入;web 版未授權學生不走本函式(走 sw-light 執行期快取),故完全不受影響、登入照樣輕量。',
      '★ v3.16.72【驗證/版本】index.html 20 個 inline script node --check 全過、0 lone surrogate;hero_db.js/admin_panel.js/game_changelog.js node --check 過、admin_panel.js 0 個可選串接。七點版本同步 _GAME_LOADED_VERSION + _vers[index.html/hero_db.js/admin_panel.js/game_changelog.js] + ADMIN_PANEL_VERSION + changelog 頂部 ver → v3.16.72。GAME_CHANGELOG 維持 20 筆(移除最舊 v3.16.52)。本輪改 index.html(鬥技場主頁 + 延遲載入策略全在此),admin_panel.js 與 game_changelog.js 僅版號對齊、hero_db.js 僅 manifest 版號免重傳。完全未動存檔/載入/帳號同步路徑。'
    ],
  },
  // v3.16.71 — 素質四欄兩行排版 + 四說明視窗字放大 + 技能/爆發升級即開窗
  {
    ver: 'v3.16.71',
    date: '2026-06-28',
    brief: [
      '🧩【素質欄位排版修正】英雄圖鑑詳情頁的 HP/攻擊/特技/速度 四個欄位排版修正：字體放大後不再擠成一團或破版，改成「項目名稱和 ? 說明」放第一行、「數值和加減按鈕」放第二行，看得更清楚。',
      '🔍【四個說明視窗字放大一倍】圖鑑裡四個說明視窗的字體放大一倍，看得更清楚：①點四項素質旁的「?」說明視窗 ②點六邊形雷達圖各頂點的說明視窗 ③天賦的「查看升級表」視窗 ④最下面爆發技的「升級效果一覽」表格。',
      '⚡【技能/爆發升級不再卡頓】技能、爆發技按下「升級」後，升級視窗現在會立刻打開（原本要等好幾秒）；按下時不再播音效，改成按「確定升級」時才播放升級音效，操作更順暢。'
    ],
    items: [
      '★ v3.16.71【素質四欄兩行排版·index.html】_renderHeroDetail(L≈110642) 的 HP/攻擊/特技/速度 素質卡由水平 flex(項目在左、數值在右、加減鈕)改為直向 flex-direction:column：第一行=圖示+名稱+ ? 說明(toggleStatPopup span，加 line-height:1.25)；第二行=新 wrapper div(flex+space-between+flex-wrap)放「數值與加成」span(加 white-space:nowrap)與「待分配/加減按鈕」IIFE。字級放大後不再換行破版；所有 ? 與 ± 的 onclick(toggleStatPopup/adjustPendingStat)完整保留。',
      '★ v3.16.71【四說明視窗字放大×2·index.html】①圖鑑素質 ? 說明：toggleStatPopup 在圖鑑的呼叫點(L≈110643)第三參數 24→48(其餘呼叫點 L61571/61580/61584/61588/28397 維持不動；此 popup 掛到 #gc 不被 _codexScaleFontSizes 縮放故需直接放大)②六邊形雷達 _showRadarLabelInfo(L≈128186)：標題 22→44/說明 18→36/關閉 14→28/padding 16px22px→24px32px/max-width 340→560/定位上移 py-190→py-330 ③天賦升級表 _showTraitLvPopup(L≈122739)：標題 22→44/效果 17→34/分級列 18→36/footer 15→30/固定效果 32/max-width 380→620/popW 400→640/top clamp 1080-400→1080-760 與 ey-80→ey-160 ④爆發升級效果一覽(_renderHeroDetail 底部 ⚡極限爆發 #_hut-anchor-burst 表格)：cell 由 clamp(13px,1.8vw,22px)改 font-size:24px → 經 _codexScaleFontSizes ×1.6 放大成 38px(與爆發說明字級一致；原 clamp 寫法被縮放工具略過故顯示偏小)。',
      '★ v3.16.71【技能/爆發升級即開窗+音效改點·index.html】根因：upgradeSkill(L≈111327)同步建構確認視窗(無 await)，但開窗 onclick 串接兩個音效(按下 sfx-statup + 開窗 sfx-sel)造成 iOS 音訊卡頓、體感「等好幾秒」。修正：①技能升級鈕(L≈110975)移除 onclick 的按下音效 → 視窗即時開啟 ②技能開窗音效(L≈111393 原 sfx-sel)移除 ③技能確認鈕 _upg_yes2(L≈111395)首行補播 sfx-statup(0.7)(原成功音 sfx-powerup 0.7 保留)④爆發升級鈕(L≈111004)移除 onclick 按下音效 ⑤爆發確認鈕 _burst_yes(L≈111072)首行補播 sfx-statup(0.7)(原成功音 sfx-powerup 0.8 保留)。技能與爆發一致：開窗無聲即時開、按下確定升級才播音效。',
      '★ v3.16.71【驗證/版本】index.html 20 個 inline script node --check 全過、0 lone surrogate；hero_db.js 與 admin_panel.js node --check 過、admin_panel.js 0 個可選串接。七點版本同步 _GAME_LOADED_VERSION + _vers[index.html/hero_db.js/admin_panel.js/game_changelog.js] + ADMIN_PANEL_VERSION + changelog 頂部 ver → v3.16.71。GAME_CHANGELOG 維持 20 筆(移除最舊 v3.16.51)。本輪只改 index.html(三項修正全在此)，admin_panel.js 與 game_changelog.js 僅版號對齊、hero_db.js 僅 manifest 版號免重傳。'
    ],
  },
  // v3.16.70 — 英雄圖鑑放大改版(取代上一版失敗的整體縮放)
  {
    ver: 'v3.16.70',
    date: '2026-06-28',
    brief: [
      '🔍【英雄圖鑑放大·更清楚】英雄圖鑑的字體整體放大,看得更清楚;同時修正上一版「整體縮放」造成的電腦版排版跑掉、裝備至寶文字變成一個字一行、天賦欄變得超長,以及平板上「只有六邊形雷達放大、其餘字沒變大」的問題。裝備至寶選單的字也一起放大、原本顯示英文的龍王至寶效果改回中文。英雄名維持原本大小。天賦下方的 S1/S2/爆發技能排版維持不變。',
      '🔓【未收錄英雄也能申請救回】英雄圖鑑裡「還沒擁有(未收錄)」的英雄,大圖下方新增「🔓 要救回」按鈕——如果那隻其實是你的、卻不見了,可送老師人工審查;送出後顯示「⏳ GM 審查中」、審查期間不能再按,老師核可補回後會標示「✅ 救回申請已通過(日期)」並移除按鈕。',
      '🎁【GM 獎勵視窗左右兩區】「🎁 GM 獎勵」視窗改成左右兩區:左邊是老師發的獎勵、右邊是序號兌換,兩區可各自上下捲動互不干擾(手機等窄螢幕會自動上下排)。',
      '✅【辨識按鈕自動消失】英雄/至寶只要有了「正常解鎖紀錄」(你正常抽到/打到/兌換而來、綁你的帳號存到雲端),圖鑑就會自動移除「✅ 確認是我的 / 🗑 不是我的 / 🔓 要救回」按鈕——這些按鈕只保留給「查不到來源(來源不明)」的英雄/至寶;換裝置或重新登入也一致(雲端紀錄會合併回本機)。',
    ],
    items: [
      '★ v3.16.70【取代縮放改真字級放大·index.html】移除英雄圖鑑右側內容的 zoom:1.8(電腦版排版被壓垮、平板上 zoom 對文字不可靠的根因),改用 _codexScaleFontSizes 把右側內容的「行內 px 字級」乘上倍率 _CODEX_FONT_SCALE(預設 1.6,老師可一鍵調整);雷達圖(SVG)與英雄名(data-noscale)不放大;所有重繪都經 _renderHeroDetail 出口套用,吃經驗書/投資能力/裝至寶/升技能後仍維持放大。',
      '★ v3.16.70【雙欄響應式排版·index.html】左欄(屬性+裝備至寶+天賦)移除 max-width:52%(原本在縮放下被壓到極窄,是裝備至寶逐字換行、天賦超長的元兇),改 flex 基準+min-width;外層加 flex-wrap、右欄(雷達+素質效果)加 flex 基準與 min-width,電腦/平板橫向維持左右雙欄、窄螢幕才自動上下堆疊。',
      '★ v3.16.70【英雄名固定 + 裝備至寶選單放大 + 龍王至寶中文化·index.html】英雄名字級還原 56px(縮放前的視覺大小)且不被放大;💎裝備至寶選擇視窗套用同一放大工具;補上龍王至寶效果旗標的中文(原顯示 immuneNoatk/atkRampPerRound 等英文,改為 免疫無法攻擊/每回合攻擊力遞增 等)。',
      '★ v3.16.70【未收錄英雄救回 + GM 審查狀態機·index.html】_renderHeroCodexUnlockBar 解除「未擁有不顯示」閘門:未收錄英雄改渲染新 _codexLostRescueBarHtml(僅「🔓 要救回」路徑);送出 lost 申請時加寫持久 pending 標記(lxps_codex_lostpending_<uid>_hero_<name>·與每日限額分離)→ 顯示「⏳ GM 審查中」且按鈕消失(防重複送出);偵測「曾 pending + 現已擁有(GM 經 _fbAdminRestoreLostHeroes 核可補回)」=通過 → 清 pending、標 passed 日期,已擁有帶顯示「✅ 救回申請已通過(日期)」並移除所有按鈕。★帳號完整性:全程不自動發放/刪除,GM 仍為唯一權威;不碰載入路徑/存檔倒退守門。',
      '★ v3.16.70【GM 獎勵視窗左右兩區·index.html】#redeem-overlay 由上下單欄改左右兩區:外卡改 flex-column(🎁標題固定)、內含左區「🎁 老師發的獎勵」(#gmcr-inbox)+右區「🎟️ 序號兌換」(虛線分隔),兩區各自 overflow-y:auto 獨立捲動、flex-wrap 窄螢幕自動堆疊;保留 #gmcr-inbox/#redeem-input/#redeem-submit-btn/#redeem-result 與 closeRedeemDialog/_doRedeem 全不變,字級維持放大略修以容兩欄。',
      '★ v3.16.70【有正常解鎖紀錄就移除辨識按鈕·index.html】_codexUnlockBarHtml 按鈕顯示條件由「known(有正常解鎖紀錄)|| pollution(來源不明)」收斂為「只 pollution」:有自己 uid 的合法正常解鎖紀錄(known·初始/已確認亦同)一律不顯示 ✅確認是我的/🗑不是我的/🔓要救回,只顯示來源標;英雄+至寶共用此函式故同時生效。判定依據綁 uid 上雲端既有完備:advSaveUnlockedHero/_advSaveTreasureUnlockHistory 正常解鎖即寫綁 uid 本機紀錄 + _lxpsCloudInstantUnlock arrayUnion 雲端 _heroUnlockHistory/_treasureUnlockHistory,_applySafeData 載入時雲端 ∪ 本機去重寫回 → 換裝置/重登一致;未收錄英雄被正常解鎖後自動進已擁有帶且無按鈕。',
      '★ v3.16.70【版本/範圍】七點版本同步 → v3.16.70;本輪只改 index.html(圖鑑放大+雙欄RWD+至寶旗標中文 + 未收錄英雄救回審查 + GM獎勵左右兩區 + 有正常解鎖紀錄自動移除辨識按鈕),admin_panel.js + game_changelog.js 僅版號對齊、hero_db.js 僅 manifest 版號免重傳。GAME_CHANGELOG 維持 20 筆(移除最舊 v3.16.50)。',
    ],
  },
  // v3.16.69 — 英雄圖鑑字級放大(左下方來源帶 + 右側內容區)
  {
    ver: 'v3.16.69',
    date: '2026-06-28',
    brief: [
      '🔍【英雄圖鑑字放大】英雄圖鑑左側大圖下方的「解鎖來源/時間」標示與「✅ 確認是我的 / 🗑 不是我的 / 🔓 要救回」按鈕字級放大一倍;右側的能力數值、極限膠囊、裝備至寶、素質點數效果、天賦技能說明等(英雄名除外)也整體放大,更清楚好讀。',
    ],
    items: [
      '★ v3.16.69【英雄圖鑑來源帶字級放大·index.html】_codexUnlockBarHtml 的 compact 模式(英雄左側大圖底部·_renderHeroCodexUnlockBar 用)字級 + padding 約放大 2 倍:來源標籤 12.5→25、🕐 時間 11→22、三鈕(確認是我的/不是我的/要救回)11.5→23(padding 5px8px→10px16px)、今天已申請提示 11→22。至寶圖鑑(non-compact)維持不變。',
      '★ v3.16.69【英雄圖鑑右側內容放大·index.html】#hero-detail-content 加 zoom:1.8 整體放大右側內容(維持排版比例·不含獨立疊加的雷達圖);英雄名 font-size 56→31 反向抵消 zoom 維持原大小,其餘(Lv/能力卡/極限膠囊/裝備至寶/素質點數效果/天賦技能說明)皆放大。純字級/縮放、不動邏輯與 id。',
      '★ v3.16.69【版本/範圍】七點版本同步 → v3.16.69;本輪只改 index.html(字級+zoom),admin_panel.js + game_changelog.js 僅版號對齊、hero_db.js 僅 manifest 版號免重傳。GAME_CHANGELOG 維持 20 筆(移除最舊 v3.16.49)。',
    ],
  },
  // v3.16.68 — GM獎勵視窗字級再放大
  {
    ver: 'v3.16.68',
    date: '2026-06-28',
    brief: [
      '🔍【「🎁 GM獎勵」視窗字放大】關卡頁「🎁 GM獎勵」視窗(序號兌換 + 課堂獎勵收件區)裡的字再放大一倍,標題、獎項、表現優良事蹟、確認領取鈕、已領取紀錄都更大更好讀。',
    ],
    items: [
      '★ v3.16.68【GM獎勵視窗字級放大·index.html】#redeem-overlay 視窗內所有文字字級約放大 2 倍:標題 40→72、序號兌換區、收件卡(🏅 事蹟/🎁 獎項/✅ 確認領取鈕)、無待領提示、已領取紀錄(標題/事蹟/獎項/時間)、領取成功/已領過/失敗訊息;序號輸入框字級取 ~×1.4 防溢出。靜態 HTML + _renderGmClassRewardInbox 動態渲染 + _claimGmClassRewardFromInbox 結果訊息全放大。純字級調整、不動邏輯與 id。',
      '★ v3.16.68【版本/範圍】七點版本同步 → v3.16.68;本輪只改 index.html(字級),admin_panel.js + game_changelog.js 僅版號對齊、hero_db.js 僅 manifest 版號免重傳。GAME_CHANGELOG 維持 20 筆(移除最舊 v3.16.48)。',
    ],
  },
  // v3.16.67 — 圖鑑標示UID解鎖來源 + 自助辨識快捷鈕 + 至寶投資跨帳號修復 + 按鍵音效
  {
    ver: 'v3.16.67',
    date: '2026-06-28',
    brief: [
      '🔍【圖鑑大圖直接看「這隻是怎麼來的」】打開英雄/至寶圖鑑時,大圖下方會直接標示它的「解鎖來源」和「取得時間」(像是 ✨召喚/合成、⚔冒險挑戰、🛒商店兌換、🏆龍王戰排名、🎁活動補償、💝好友贈送、🛡老師核可…);如果是共用平板上別人帶進來的、查不到你自己的取得紀錄,會用紅色標「⚠ 來源不明」,一眼就能分辨哪些是你的、哪些可疑。',
      '🛠️【在圖鑑就能自己處理】每隻英雄/至寶下方都有三顆鈕:「✅ 確認是我的」(確定是自己的→永久標記、把擁有證明存進雲端,之後不會再被誤判,按了就不再顯示這些鈕)、「🗑 不是我的」(送老師審核移除)、「🔓 要救回」(其實是你的卻被鎖住/誤判→送老師確認補回)。連「來源不明」被鎖住的也能直接申請;每隻一天限按一次,隔天還能再調整。',
      '💎【修正:至寶投資點數切帳號後歸零】之前在共用平板上 A 帳號把至寶投資點數點完、切到 B 再切回 A,投資點數會變回「尚未投資」。這個資料合併的漏洞已修好,投資點數會正確保留。',
      '🔊【按鍵音效回饋】投資至寶屬性、打開英雄技能升級視窗時,都會有按鍵音效,操作更有反饋感。',
    ],
    items: [
      '★ v3.16.67【圖鑑解鎖來源標示】英雄圖鑑左側大圖底部 / 至寶圖鑑主圖正下方,顯示該英雄/至寶的解鎖來源(召喚合成/冒險挑戰/商店/龍王戰排名/補償/好友贈送/老師核可…)+ 解鎖時間;查無自己 UID 合法紀錄或只有回收紀錄→「⚠ 來源不明」(紅);初始 8 隻→「🎒 初始角色」。資料讀本地 adv_hero_unlock_history / adv_treasure_unlock_history(載入時雲端已合併寫回本地),零雲端讀取、即時。',
      '★ v3.16.67【圖鑑自助辨識快捷鈕】來源不明/一般取得的英雄/至寶顯示三鈕:✅ 確認是我的(寫 player_confirmed 解鎖紀錄到三槽+雲端·永久標記·之後不再被污染判定誤刪、永久移除這些鈕)、🗑 不是我的(送 disownHeroes/disownTreasures 審核)、🔓 要救回(送 lostHeroes/lostTreasures 老師確認);每英雄/至寶「申請」一天限一次,確認是我的為永久即時。',
      '★ v3.16.67【GM 端閉環】老師「📨 帳號救援申請審核」卡新增至寶兩區塊:🗑 刪除至寶(走 _fbAdminRejectAuditTreasures·移出+_s整包覆蓋·不復活)、🛟 補回至寶(走新增 _fbAdminRestoreLostTreasures·不存在補 Lv1/已存在保留等級投資+寫 admin_grant);英雄的 disown/lost 沿用 v3.16.66 / v3.16.19 既有閉環。',
      '★ v3.16.67【修正:至寶投資點數跨帳號丟失】根因:三槽合併 _lxpsMergeSlots 的 taiwanTreasureData 合併(_twAcc),同一至寶在多槽都有時走的 else 分支只重建 lv/exp/equippedTo,漏掉 invested(投資點數)→ 切帳號回來投資歸零。修法:else 分支比照 _applySafeData 對 invested 逐項取 max 保留,並保住其他子欄位。',
      '★ v3.16.67【按鍵音效】至寶投資加點、開啟英雄技能升級確認視窗新增按鍵音效;技能升級確認鈕本就有音效。',
      '★ v3.16.67【版本／範圍】本輪改 index.html + admin_panel.js + game_changelog.js;hero_db.js 僅版號對齊免重傳。新增的「確認是我的」走自我寫入、disown/lost 走既有 accountRescueRequests、GM 至寶操作走 players 自身 isAdmin → 皆不需新增 firestore.rules。七點版本同步 → v3.16.67;GAME_CHANGELOG 維持 20 筆(移除最舊 v3.16.47)。',
    ],
  },
  // v3.16.66 — GM獎勵領完有紀錄 + 學生自助申請移除不是我的英雄
  {
    ver: 'v3.16.66',
    date: '2026-06-28',
    brief: [
      '🎁【領過的 GM 獎勵看得到了】以前在「🎁 GM獎勵」按了確認領取後,收件區就變空白,讓人懷疑到底有沒有領到。現在領取後下半會出現「✅ 已領取紀錄」,清楚列出你領過哪些獎項、表現優良事蹟、還有領取時間,不會再有「我明明領了卻沒紀錄」的情況。',
      '🗑【不是我的英雄,可以自己申請移除】在「📨 會員帳號與救援申請」裡新增「🗑 申請移除不是我的英雄」:會列出你目前擁有的全部英雄,並標示哪些「來源不明」(共用平板上別人帶進來的)。你只要勾選不是自己的、送出申請,老師審核確認後才會移除——你只是申請、不會馬上被刪,安心又公平。',
    ],
    items: [
      '★ v3.16.66【GM 獎勵領取紀錄】領取時把獎項/事蹟/領取時間寫進帳號,「🎁 GM獎勵」收件區下半新增「✅ 已領取紀錄」區;待領領完後不再空白,根治「學生領完不認帳」。老師後台「📜 玩家活動記錄查詢」新增「🎁 GM獎勵紀錄」鈕,可查任一學生領過哪些獎勵與精確領取時間(讀認領文件·權威)。',
      '★ v3.16.66【學生自助申請移除污染英雄】「📨 會員帳號與救援申請」新增「🗑 申請移除不是我的英雄」:列全部擁有英雄+來源標(來源不明標紅·初始角色保護提示),學生勾選送審(只送申請·不即時刪,避免誤按倒退);老師「📨 帳號救援申請審核」卡新增「🗑 一鍵刪除」,確認後永久移除(寫三槽+清養成資料+標記·不會再污染或復活)。',
      '★ v3.16.66【版本／範圍】本輪改 index.html + admin_panel.js + game_changelog.js;hero_db.js 僅版號對齊免重傳。兩塊皆沿用既有 firestore.rules(不需新增規則);需求 B 依賴 v3.16.65 的 gmClassRewards / gmClassRewardClaims 規則已部署。七點版本同步 → v3.16.66;GAME_CHANGELOG 維持 20 筆(移除最舊 v3.16.46)。',
    ],
  },
];
