// ════════════════════════════════════════════════════════════════════════
//  game_changelog.js  —  LXPSGAME 更新日誌
//  最後更新:2026-06-30  / 目前主程式版本:v3.16.93(自選召喚卷挑英雄強制寫雲端權威記錄防消失+存檔倒退守門豁免GM收回過度補償/學生自助刪除的英雄)
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
];
