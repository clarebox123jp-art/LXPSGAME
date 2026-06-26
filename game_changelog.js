// ════════════════════════════════════════════════════════════════════════
//  game_changelog.js  —  LXPSGAME 更新日誌
//  最後更新:2026-06-26  / 目前主程式版本:v3.16.30(待審查凍結機制:圖鑑審查不符英雄先進「審查中」由老師確認)
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
  // v3.16.30 — 待審查凍結機制:圖鑑審查勾「這是我的」但雲端查不到取得紀錄的英雄先進「審查中」凍結,由老師通過/不通過
  {
    ver: 'v3.16.30',
    date: '2026-06-26',
    brief: [
      '🔍【英雄圖鑑審查升級·交給老師確認】當你在圖鑑審查按「這是我的」、但雲端查不到你自己的取得紀錄時,這隻英雄不會直接被鎖掉,而是先進入「🔺審查中」狀態交給老師確認。審查中的英雄你可以照常出戰、裝備至寶,只是暫時不能升級、投資能力、提升技能或升級極限爆發(戰鬥中的極限爆發照常使用)。',
      '✅ 老師確認「通過」→ 正式解鎖、變回正常顏色;若「不通過」→ 轉為灰色未收錄(可逆——之後你重抽/自選/冒險再次解鎖,就會自動正式解鎖)。老師審查完成後會通知你「請重新整理,確認你的英雄圖鑑」。',
      '🛟 另外:登入時若帳號裡有「查不到來源」的英雄,會先做一次圖鑑審查(完全乾淨的帳號會自動跳過);你也可以隨時到「📨 會員帳號與救援申請」→「🔍 重新申請圖鑑審查」自己重新檢查(一天一次)。',
    ],
    items: [
      '★ v3.16.30【待審查凍結·玩家端】圖鑑審查送出時,勾「這是我的」但與雲端 _heroUnlockHistory 不符的英雄 → 加入 players/{uid}._auditPendingHeroes(window._fbMarkAuditPending·arrayUnion)進入「🔺審查中」凍結:7 養成閘門(addHeroExp 靜默 return 0、investStat、upgradeSkill、upgradeBurst、三本經驗書)全擋下並提示「要等老師審查結束」,戰鬥極限爆發照常、可裝至寶;圖鑑一覽卡片左上加 🔺審查中徽章、詳情頁加紅框說明。',
      '★ v3.16.30【強制登入審查·雲端感知】_maybeShowAccountAuditOnLogin 改 async:先本機鐵證快篩(_advHasHardEvidence),完全乾淨者自動封存跳過;有疑似者再查雲端 _fbGetCloudUnlockHistory 逐隻核對自己 uid 紀錄——雲端有紀錄者一律封存不打擾、雲端讀取失敗則不強制不封存(5 秒重試最多 6 次),確實查無紀錄者才彈出審查。致歉文案改寫(共用 iPad 污染說明);「📨 會員帳號與救援申請」hub 新增「🔍 重新申請圖鑑審查」(每日一次·清完成旗標重開)。',
      '★ v3.16.30【GM 審核·老師端 admin_panel.js】「📨 帳號救援申請審核」卡偵測 claims.contestedHeroes → 摘要「🔺待審查英雄 N 隻」晶片 + 核對詳情列出 +「✅ 全部通過(正式解鎖)」「❌ 全部不通過(轉灰)」兩鈕:通過 → window._fbAdminApproveAuditHeroes(清 _auditPendingHeroes 解凍 + 寫 admin_grant 合法紀錄 + 蓋 _authoritativeRestoreAt 重載生效);不通過 → window._fbAdminRejectAuditHeroes(移出雲端 unlockedHeroes 轉灰 + 標 audit_error_recovered·可逆≠admin_delete·六補回路徑不復活);兩者皆標記救援申請已處理 + 通知玩家「GM已審查完畢,請重新整理,確認你的英雄圖鑑」。',
      '★ v3.16.30【範圍/版本】index.html(凍結基建 + 7 閘門 + 🔺標記 + 強制登入 + 致歉/重審入口 + 2 個 GM 後端)+ admin_panel.js(GM 通過/不通過卡)+ game_changelog.js 三檔;三點 _GAME_LOADED_VERSION + _vers[index.html/game_changelog.js] + ADMIN_PANEL_VERSION/_vers[admin_panel.js] → v3.16.30(hero_db.js 維持 v3.16.22)。所有新增可儲存欄位(_auditPendingHeroes 等)皆綁 uid。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.9)。',
    ],
  },
  // v3.16.29 — 英雄圖鑑自我審查改「視覺鎖·鐵證判定」:停用等級判定改鐵證·進圖鑑逐隻確認·這是我的核對雲端紀錄
  {
    ver: 'v3.16.29',
    date: '2026-06-26',
    brief: [
      '🔍【英雄圖鑑自我審查升級】進入英雄圖鑑時,如果你帳號裡有「查不到取得來源」的英雄,會跳出一份「待審核圖鑑」,把這些英雄列出來讓你一隻一隻確認:是你自己抽到/解鎖/練過的就按「這是我的」(系統會立刻核對雲端紀錄,符合就解鎖、變回正常顏色);不是你的就按「不是我的」,離開時會把它鎖回未解鎖。每一隻都要選、全部選完才能離開。',
      '✅ 有自己取得紀錄、投資過(加過素質點/技能/天賦/爆發)、裝過至寶、或是起始 8 隻角色的,都會自動通過、不會列出來,你只要確認真正可疑的那幾隻就好。',
      '🛟 按「這是我的」但雲端查不到你的紀錄時,會幫你送老師查證(不會直接鎖掉);誤鎖了也可以到「📨 帳號救援申請 →🔓 我遺失的英雄要回來」請老師補回(等級會還原)。',
    ],
    items: [
      '★ v3.16.29【停用等級判定·改鐵證】_openAccountAudit/_maybeShowAccountAuditOnLogin 不再用「等級/用過」判定英雄是不是你的(共用 iPad co-op 借用污染的英雄本來就帶等級·用等級判定會把污染當成你的)。改用「借用做不到的鐵證」(= _advHasHardEvidence):初始 8 隻 / 自己本機解鎖紀錄 / 投資過(素質點·技能·天賦·爆發) / 裝至寶。有鐵證=✅自動通過不列出;查無本機鐵證的持有英雄=待審核逐隻確認。',
      '★ v3.16.29【視覺鎖·必勾才能離開】_openAccountAudit 重寫成逐隻 toggle:每張待審卡有「這是我的/不是我的」兩鈕(可自由切換·即時視覺回饋·不寫雲端),全部選完前底部「✅ 完成審查並離開」鈕停用(顯示還有 N 隻未確認)。離開時一次提交:不是我的→_fbStudentDisownHeroes 鎖回(移出雲端 unlockedHeroes·補 audit_error_recovered 守門紀錄·可逆·GM 一鍵復原·本機同步清養成防自癒復活);符合記錄→鏡像補回本機帳本(source=audit_verified·下次不再列入);無待審核→顯示「圖鑑審查通過」並標記完成。',
      '★ v3.16.29【這是我的·核對雲端 uid】新增 window._fbGetCloudUnlockHistory(uid) 讀 players/{uid}._heroUnlockHistory;按「這是我的」即時核對雲端「自己 uid 真正解鎖紀錄」(排除 admin_delete/migration_seal/audit_error_recovered):符合→當作有鐵證·解鎖變正常色;不符→留在解鎖清單但送老師查證(_fbSubmitAccountRescueRequest·claims.contestedHeroes + meta.auditVerify=true·供後台篩選)。雲端帳本比共用 iPad 本機帳本不易被跨帳號污染·故當權威依據。',
      '★ v3.16.29【範圍/版本】三點版本同步 → v3.16.29(hero_db.js 維持 v3.16.22·admin_panel.js 維持 v3.16.19)。本輪只改 index.html + game_changelog.js。後台「只顯示不符」篩選卡、至寶審查、GM 即時通知為後續輪次。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.8)。',
    ],
  },
  // v3.16.28 — 停止系統「自動判定有證據=你的」(紀錄被跨帳號污染判定不準);改點進圖鑑自動彈出由玩家逐隻確認
  {
    ver: 'v3.16.28',
    date: '2026-06-26',
    brief: [
      '🛑【重要調整·停止系統自動判定】系統原本會自動判斷「哪些英雄有證據、是你的」並據此自動保留或回收——但因為英雄的取得紀錄會跨帳號互相影響、判定幾乎都不準(可能把別人的當成你的留著、也可能把你紀錄遺失的真角色誤回收)。所以即日起停止這個自動判定與自動回收,改成完全交給最清楚的你來確認。',
      '🔍【點進英雄圖鑑自動彈出確認】只要你帳號裡有「起始 8 隻角色以外」的英雄,點進英雄圖鑑時會自動跳出「英雄來源自我審查」,把這些角色列出來讓你逐一確認:是你自己抽到/打到/練過的就留著不要動(預設保留);不是你的(沒印象、從沒用過)就按「不是我的」+「✅ 確認移除」,立刻清掉、之後不會再跑回來。',
      '🛟 起始的 8 隻角色一定是你的、不會列出來;誤移除可到「📨 帳號救援申請 →🔓 我遺失的英雄要回來」請老師補回(等級會還原)。',
    ],
    items: [
      '★ v3.16.28【停用自動回收】_lxpsRecoverAuditErrorHeroes 協調器原本登入時逐隻用 _advHasGenuineUnlock(證據判定)把「無證據」者自動回收 → 因解鎖紀錄跨帳號污染,該判定會把污染當證據保留、把紀錄遺失的真角色當無證據誤回收。改為函式開頭直接 return 全面停用;清污染改全由學生自助確認。',
      '★ v3.16.28【自我審查停用證據分類】_openAccountAudit 的 B1/B2 不再用 _advHasHardEvidence/_advHasGenuineUnlock 判定:B1(✅免處理·不顯示)只認「起始 8 隻 _ARENA_INITIAL_HEROES」(建帳號即贈·全帳號相同·不可能跨帳號污染);其餘持有英雄一律列入 B2「請確認是不是你的」(預設保留·勾「不是我的」才走 v3.16.27 _fbStudentDisownHeroes 當場移除+守門不復活)。綠色「已確認是你的」整區隱藏(只列預計刪除)。',
      '★ v3.16.28【圖鑑開啟自動彈】_openHeroPage_doRender 末尾掛 _maybeShowAccountAuditOnLogin(延 350ms);彈出條件由「有查無硬證據英雄」改為「有起始 8 隻以外的英雄」(per-uid 一次性·擁有<8 或有其他彈窗自動重試)。登入後 4200ms 仍保留一次後援觸發。',
      '★ v3.16.28【卡片提示校正】B2 卡片移除舊版「曾被移除/你沒有取得紀錄」誤導文字(現含有紀錄英雄·紀錄不可盡信);只在紀錄明確顯示別人 uid 時給輕量提醒,其餘交玩家辨認。',
      '★ v3.16.28【版本/範圍】三點版本同步 → v3.16.28(hero_db.js 維持 v3.16.22)。本輪只改 index.html + game_changelog.js。_advHasGenuineUnlock/_advHasHardEvidence 仍保留定義但不再驅動任何自動保留/回收。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.7)。',
    ],
  },
  // v3.16.27 — 英雄自我審查升級:查無證據的「不是我的」按確認當場移除·之後不再跑回來;有證據自動保留
  {
    ver: 'v3.16.27',
    date: '2026-06-26',
    brief: [
      '🧹【重大修復·清掉不是你的英雄】之前就算把「不是你的」英雄移除,下次登入又會自己跑回來(系統的自動修復網會把練過的角色從等級表撈回解鎖清單)——這個根因已修好。現在到英雄圖鑑「🔍 英雄來源自我審查」,把確定不是你的按「不是我的」+「✅ 確認移除」,就會立刻清掉、而且之後不會再回來。',
      '✅ 系統已確認是你的(自己抽到/打到、初始角色、裝過至寶、或投資過素質點)會用綠框標示、自動保留、免處理;你只要看「🟡 需要你確認」的幾隻就好。',
      '🛟 誤移除了也別擔心:到「📨 帳號救援申請 →🔓 我遺失的英雄要回來」勾選送出,老師核對後可一鍵幫你補回(等級會還原)。登入時若帳號有「查不到取得來源」的英雄,會自動跳出這個審查提醒你清理(看過一次後就不再自動跳)。',
    ],
    items: [
      '★ v3.16.27【根因·自癒復活】advGetUnlockedHeroes 的「自癒 v3.13.28」會把 _heroLevels 內等級>0 的英雄無條件補回 unlockedHeroes(只擋 admin_delete/audit_error_recovered 與活動限定英雄)→ 一般 SSR/SR 的練過污染移除後每次載入又被撈回=「多出一直回來」。修法:學生自助移除走守門機制(見下),被移除者帳本最新一筆=audit_error_recovered → 自癒/紀錄救援/出口過濾/phantom 等六補回路徑全認得、不再復活。',
      '★ v3.16.27【當場移除·_fbStudentDisownHeroes】學生在自我審查按「不是我的」+確認 → 立即從雲端 unlockedHeroes 移除 + 清該英雄六養成表 _s+heroExp+heroTraitLevel(杜絕 desync/採信舊 _s 復活)+ 至寶解裝保留本體 + 帳本補 audit_error_recovered(disownedByStudent 標記)守門紀錄;暫存原等級到 _auditRecoveredLevels 供 GM 一鍵復原。刻意不寫 _authoritativeRestoreAt(不重載·本機同步即時更新)、不寫一次性旗標(可隨時再清)。本機同步:adv_unlocked_heroes 移除 + 記憶體養成清除 + 本機帳本補守門紀錄。',
      '★ v3.16.27【有證據自動保留·分類】新增 _advHasHardEvidence(=_advHasGenuineUnlock 略過「練過 lv>1」分支·只認 自己解鎖紀錄/初始8/裝至寶/投資過);自我審查 B1(✅免處理)/B2(🟡需確認)改用硬證據分類 → 初始 8 隻、投資過、裝過至寶的不再被誤列「需確認」,只有真正查無證據(含練過卻查無紀錄的污染)才落入 B2 由學生決定。',
      '★ v3.16.27【登入自動提示】新增 _maybeShowAccountAuditOnLogin:登入後若帳號有「持有但查無硬證據」的英雄才自動開審查(per-uid 一次性·擁有<8 或有其他彈窗時自動重試)。送出/關閉皆標記一次性,不再每次登入打擾;學生仍可從圖鑑自行開啟。',
      '★ v3.16.27【版本/範圍】三點版本同步 → v3.16.27(hero_db.js 維持 v3.16.22·本輪未動)。本輪只改 index.html + game_changelog.js。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.6)。',
    ],
  },
  // v3.16.26 — 帳號英雄修復:練過的英雄一律保留(誤回收的自動補回);只清「沒練過又查無紀錄」的純污染
  {
    ver: 'v3.16.26',
    date: '2026-06-26',
    brief: [
      '🛡️【重大修復·英雄解鎖】上個版本(v3.16.19)為了清掉跨帳號殘留的污染角色,把「你練過(等級>1)、但剛好查不到取得紀錄、也沒投資過素質點」的角色誤判成污染收走了,造成很多同學「練過的英雄突然不見」。本版改回「只要你練過(等級>1)就一定是你的、一律保留」,並在登入時自動把先前被誤收的『練過英雄』連同等級補回你的帳號。',
      '📌 重要:被補回的英雄「等級」會還原,但當初被清掉的「技能/天賦/極限爆發的升級」無法復原(那部分在上個版本收回當下就被刪掉、沒有備份),需要再用書本重新升級。造成的不便非常抱歉。',
      '🧹 仍會自動清掉的只剩:「沒練過(等級 1)且完全查不到任何取得紀錄、沒裝至寶、不是初始角色」的純污染。若有你真的擁有、卻被收回的,到「📨 帳號救援申請」→「🔓 我遺失的英雄要回來」勾選送出,老師核對後補回。',
    ],
    items: [
      '★ v3.16.26【判定改回·_advHasGenuineUnlock】推翻 v3.16.19「投資證據版」:於 admin_delete 檢查之後、其餘判定之前加回「等級>1 → 一律保留」分支(讀全域 _heroLevels),練過的英雄一律視為擁有(覆蓋「別人 uid 紀錄」判定,唯一例外是老師明確刪除 admin_delete);另修正自有解鎖紀錄 uid 比對改 slice(0,12)(舊紀錄若存完整 28 字 uid 也能正確認領,避免自己的紀錄被誤判成別人的)。改完 orchestrator 只會回收「等級 1 且無任何解鎖證據」的純污染。',
      '★ v3.16.26【自動補回·_fbRestoreLeveledAuditRecovered + _lxpsRestoreLeveledOnLogin】登入後一次性:讀雲端 _auditRecoveredLevels(v3.16.19 回收時暫存的原等級),只把「暫存等級>1(練過)」的英雄加回 unlockedHeroes + 還原等級(只升不降)+ 補一筆合法紀錄 audit_auto_restored(蓋過 audit_error_recovered → 不再被出口過濾隱藏);沒練過(等級 1)的暫存維持回收=正確清掉的污染。雲端旗標 _auditLeveledRestoreV1 + 本機旗標雙重防重跑;刻意不寫 _authoritativeRestoreAt(不觸發重載)、改記憶體/本機同步即時顯示;排程在 Lv1 污染回收(orchestrator)之前。',
      '★ v3.16.26【版本／範圍】三點版本同步 _GAME_LOADED_VERSION + _vers[index.html／game_changelog.js] → v3.16.26(hero_db.js 維持 v3.16.22·本輪未動)。本輪改 index.html + game_changelog.js(sw.js 圖片修正 v3.5.89 隨 v3.16.25 一併上傳)。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.5)。',
    ],
  },
  // v3.16.25 — 修正 iPad 安裝版 R 卡(及多數英雄)圖片讀不到:資源圖快取根治(SW 改 CORS·只快取確認 200·清中毒快取)
  {
    ver: 'v3.16.25',
    date: '2026-06-26',
    brief: [
      '🛠️【緊急修正·圖片】iPad 安裝版上,除了少數幾隻(主角小力／機關王／田徑隊／直笛團／籃球隊)以外,英雄圖片大量讀不到、變成破圖的問題已修正。重開遊戲後會自動重抓正確圖片(第一次可能稍慢,之後恢復正常)。',
    ],
    items: [
      '★ v3.16.25【根因】Service Worker(sw.js v3.5.88)抓圖失敗時,fallback 用 no-cors 方式抓 → 回應是 opaque(讀不到狀態碼),程式卻把它當成功圖片快取下來。當共用網路同 IP 多人同時撞 GitHub raw 被限流(429)、或 CDN 回 403 等錯誤時,那個壞掉的錯誤回應被永久快取 → 該英雄圖從此破圖。只有最早最常載入的主角／機關王／初始三隊在被限流前就先把正確圖快取住,所以只有那幾隻正常。',
      '★ v3.16.25【修法·sw.js v3.5.89】① 抓圖 fallback 全改 CORS(讀得到狀態碼),只快取確認 200 的回應,任何錯誤(403／429／404)一律不快取 → 根治破圖中毒。② 來源四重備援:raw webp → jsDelivr webp → raw png → jsDelivr png 依序試到出圖。③ cacheFirstAsset 改雙 key 查詢(webp 未命中再查 png),預載的圖也能被新機命中。④ 預載(precache)路徑同步去除同一 opaque bug、改 CORS。',
      '★ v3.16.25【清中毒】圖片快取庫 ASSET_CACHE 一次性 v1→v2,把先前被當成功存進去的破圖快取整批清掉(這是「ASSET_CACHE 永不改」鐵則的單次例外);每台裝置改完後下次只會重抓用到的圖一次,之後不再重抓。',
      '★ v3.16.25【版本／範圍】三點版本同步 _GAME_LOADED_VERSION + _vers[index.html／game_changelog.js] → v3.16.25(hero_db.js 維持 v3.16.22·本輪未動)。本輪改 sw.js + index.html + game_changelog.js。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.4)。',
    ],
  },
  // v3.16.24 — 修正「老師更新了你的帳號資料,正在重新載入」無限重載卡死(權威 restore 基線持久化+斷路器)
  {
    ver: 'v3.16.24',
    date: '2026-06-25',
    brief: [
      '🛠️【緊急修正·卡死】部分帳號(尤其電腦安裝版)開啟遊戲後,畫面不斷跳出「🎁 老師更新了你的帳號資料,正在重新載入以套用最新進度…」一直重開、卡死進不去的問題已修正。現在最多自動重整一次套用最新進度,就能正常進入遊戲。',
    ],
    items: [
      '★ v3.16.24【根因】v3.16.5「權威 restore 保護」的重載機制(_checkSnapData)會比較「雲端主檔 _authoritativeRestoreAt」>「本 session 載入時的基線 _mySessionRestoreSeen」來決定是否重載套用老師的最新操作;但基線只在 _applySafeData 從 data._authoritativeRestoreAt 設定於「記憶體」(一重載就消失),而某些載入路徑的 data 未可靠帶到此欄 → 基線=0 → 每次載入都 _cloudRA>0 觸發重載,且既有守門 _authoritativeReloadTriggered 一重載就重置、跨重載無效 → 無限重載。',
      '★ v3.16.24【修法·雙保險】① 持久基線:_onAuthoritativeRestore 重載前把已處理的 restoreAt 寫進 localStorage(_lxpsAuthRestoreSeen·已全域命名空間化自動綁 @@uid·跨重載與關閉皆保存);_checkSnapData 計算基線時折入 max(記憶體值, localStorage 持久值)→ 同一個 restoreAt 處理過後不再重載(老師之後若有更新=更大的 restoreAt 仍會觸發一次,權威保護完全不變)。② 分頁斷路器:同一分頁同帳號(sessionStorage _lxpsAuthReloadCnt_<uid>)權威重載達 3 次後一律不再重載(硬性防呆任何殘留迴圈,寧可請玩家手動重整也不卡死)。兩者皆只會減少重載,絕不影響權威保護或存檔安全。',
      '★ v3.16.24【版本/範圍】三點版本同步 _GAME_LOADED_VERSION + _vers[index.html/game_changelog.js] → v3.16.24(hero_db.js 維持 v3.16.22·本輪未動)。本輪只改 index.html + game_changelog.js。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.3)。',
    ],
  },
  // v3.16.23 — 修正 iPad「英雄來源自我審查」底部關閉/確認按鈕點不到卡死(overlay 佈局改 flex)
  {
    ver: 'v3.16.23',
    date: '2026-06-25',
    brief: [
      '🛠️【修正·iPad／平板】點開「🔍 英雄來源自我審查」後,下方的「關閉」與「✅ 確認並封存」按鈕按不到、點了沒反應、整個卡住的問題已修正。現在這兩個按鈕固定在畫面最底端、一定點得到,中間的英雄清單可以正常上下捲動。',
    ],
    items: [
      '★ v3.16.23【根因】_openAccountAudit 的全螢幕 overlay(#_audit-ov)本身設了 overflow-y:auto(自己就是滾動容器),底部按鈕列 #_au-bar 卻用 position:fixed;bottom:0 且是它的子元素 → 在 iOS Safari／iPadOS「position:fixed 元素位於 overflow:auto 祖先內」會觸發命中測試(hit-test)失效,或把 fixed 定位算到「滾動內容底端」而非視窗底端,導致按鈕點不到、或滾到底也碰不到。',
      '★ v3.16.23【修法】#_audit-ov 由 overflow-y:auto+padding-bottom:96px 改為 display:flex;flex-direction:column(自身不再滾動);內容改包進新增的 #_au-scroll(flex:1 1 auto·overflow-y:auto·-webkit-overflow-scrolling:touch 負責捲動);#_au-bar 由 position:fixed;bottom:0 改為 flex:0 0 auto(正常流·永遠貼在 flex 直欄底部=視窗底部·必可點);「關閉」與「確認並封存」鈕加 touch-action:manipulation。純佈局重構,所有事件 handler 與 #_au-cancel／#_au-submit／#_au-count／._au-act ID 全不變,零邏輯改動。',
      '★ v3.16.23【版本／範圍】三點版本同步 _GAME_LOADED_VERSION + _vers[index.html／game_changelog.js] → v3.16.23(hero_db.js 維持 v3.16.22·本輪未動)。本輪只改 index.html + game_changelog.js。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.2)。',
    ],
  },
  // v3.16.22 — 英雄「小鬼貓與兔」改版:天賦惡作劇(對手用技能/爆發反噬能量消耗×50)+ S1/S2 第2擊
  {
    ver: 'v3.16.22',
    date: '2026-06-25',
    brief: [
      '⚔️【英雄調整·小鬼貓與兔大改】① 天賦「惡作劇」全新效果:每當對手使用「技能或極限爆發」時,有 30% 機率反噬對手,造成「該招式能量消耗 ×50」的固定傷害(大招消耗越高、反噬越痛;極限爆發以滿能量計 → 反噬 500 點;對 BOSS 一樣有效並受傷害上限保護;觸發機率隨天賦升級提升)。',
      '🐱【小鬼貓與兔 S1／S2 連擊】② S1「烈日貓抓」與 S2「月影兔咬」兩招都新增:有 30% 機率對「隨機目標」追加第 2 次相同屬性的傷害(機率隨技能升級提升)。原本的傷害、失明、中毒效果全部保留。',
      'ℹ️【小提醒】天賦「惡作劇」只在對手「使用技能或大絕招」時才會觸發,對手普通攻擊不會觸發(這是和舊版最大的不同)。世界 BOSS 自己的招式不受此天賦影響。',
    ],
    items: [
      '★ v3.16.22【天賦改版】小鬼貓與兔「惡作劇」由「對手普攻時反彈該次傷害(execAtk hook)」改為「對手使用技能/極限爆發時反噬固定傷害」:新增 top-level helper _kgMischiefOnSkill(actor,cost)→ 取 actor 對側存活的小鬼貓與兔逐隻擲 0.30+天賦級×0.05(Lv1=30%·Lv10=75%)→ 命中對 actor 造成 cost×50 固傷。掛載點同科學發明家「靈感」:execSkill 頂部(!sk.p 主動技·傳 a,cost)+ aiUseSkill 頂部(傳 a,cost)+ _runBurst 頂部(傳 h,10·爆發以滿能量條計)。doDmg 用 fixedDmg/mustHit/ignoreBuffs/ignoreEvasion/noGuard/noHidden/noCrit/noCounter(不暴擊·不受屬性·無視有利),不加 bypassShield → 龍王元素護盾與 5000 上限在固傷路徑仍生效(鐵律1.31)。execAtk 內舊「對手普攻反彈」hook 移除。',
      '★ v3.16.22【S1/S2 第 2 擊】烈日貓抓/月影兔咬 execSkill(玩家)+ aiUseSkill(AI)雙路徑(鐵律1.128)各於主傷+附加狀態後新增:0.30+技能級×0.05 機率 → 對隨機 1 名存活敵方造成同 _kS1Dmg/_kS2Dmg、同屬性(light/dark)的純傷害(不附加狀態)。沿用既有 SKILL_UPGRADE_DEF{cat:dmg}(技能傷害 +5%/級照舊),第 2 擊機率同步隨技能等級 +5%/級。',
      '★ v3.16.22【資料層 hero_db.js + 版本】HERO_DB s1/s2 d+fd 加「30% 第 2 擊」(鐵律1.160 圖鑑只寫 Lv1 base 30%)·HERO_TRAIT desc/fd 改寫(能量消耗×50)·_TRAIT_LV_INFO 改 base30%/+5%天賦級/max75%(Lv10)·HERO_LORE 更新。四點版本同步 _GAME_LOADED_VERSION + _vers[index.html/game_changelog.js/hero_db.js] → v3.16.22。⚠ 世界 BOSS 自身招式走 world-boss.js 專屬 AI(非 execSkill/aiUseSkill/_runBurst),故世界 BOSS 戰中 BOSS 出招不觸發此天賦(同靈感限制)。本輪改 index.html + hero_db.js + game_changelog.js。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.1)。',
    ],
  },
  // v3.16.21 — 帳號救援審核不再把「初始 8 隻起始角色」誤列查無紀錄(永久免審查)
  {
    ver: 'v3.16.21',
    date: '2026-06-25',
    brief: [
      '🛠️【老師後台修正·一般玩家無感】「帳號救援申請審核」以前會把每位同學一定都有的「初始 8 隻起始角色」(電腦繪圖師/程式設計師/弦樂團員/小劇團員/田徑隊員/直笛團員/籃球隊員/動物學家)誤標成「帳本查無紀錄·需人工確認」。其實這 8 隻是建立帳號時就贈送的基底角色,本來就沒有抽取/解鎖紀錄,屬於正常 → 現在不再列入審查清單,也不會被當成可疑角色。',
    ],
    items: [
      '★ v3.16.21【根因】GM「📨 帳號救援申請審核」按「🔍 核對並準備救援」會跑 window._fbRebuildAccountFromLedgers(uid),其幻影偵測迴圈把「現有 unlockedHeroes 中、帳本查無解鎖紀錄」者收進 _extraNoRecord(diff.extraNoRecordHeroes)供老師人工審核。初始 8 隻起始角色(_ARENA_INITIAL_HEROES)是帳號建立即贈、從不經召喚/解鎖寫帳本 → 每個帳號都會把這 8 隻誤列「查無紀錄」。',
      '★ v3.16.21【修法】_extraNoRecord 計算迴圈在 admin_delete / no-record 判定前加一道 (window._ARENA_INITIAL_HEROES||[]).indexOf(n)>=0 → return 排除:初始 8 隻永久免審查、既不列「查無紀錄」、也不會被當幻影移除(_extraDeleted)。與玩家端自助審查 _rareSrcCat 旁「initial 非 pollution」判定(v3.13.52)同口徑對齊。只動 _extraNoRecord 收集邏輯,缺漏英雄/至寶/水晶/幣 反推全不變,零回歸風險。',
      '★ v3.16.21【版本/範圍】三點同步 _GAME_LOADED_VERSION + _vers[index.html / game_changelog.js] → v3.16.21;本輪只改 index.html + game_changelog.js(admin_panel.js 維持 v3.16.19·無需改:救援卡只讀 diff.extraNoRecordHeroes 渲染·源頭排除即不再顯示這 8 隻)。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.0)。',
    ],
  },
  // v3.16.20 — 取消啟動強制練習營 + 取消每次問設定二段密碼 + 二段密碼設定移到會員 hub
  {
    ver: 'v3.16.20',
    date: '2026-06-25',
    brief: [
      '🎒【取消「課堂練習營」開場強制彈出】登入遊戲時不再自動跳出全螢幕的「課堂練習營」答題視窗,會直接進入遊戲。',
      '🔐【不再每次詢問要不要設定第二段密碼】以前每次登入都會問「要不要設定第二段密碼」,現在取消這個提醒了。想保護帳號的人,改到關卡頁下方「📨 會員帳號與救援申請」→「🔐 二段密碼設置」自己設定即可。',
      '🔑【已經設過密碼的帳號不受影響】如果你之前已經設定過第二段密碼,登入時仍然會照常跳出「請輸入第二段密碼」,保護不變。',
    ],
    items: [
      '★ v3.16.20【取消啟動練習營】window._CAMP_ENABLED 預設值由 true 改 false → _campStart(user) 入口的 if(!window._CAMP_ENABLED) return 直接早退;onAuth 仍會呼叫但不再蓋上覆蓋層。練習營全部程式碼保留(零刪除),GM 需要時可手動 window._CAMP_ENABLED=true 重啟。',
      '★ v3.16.20【取消每次問設定二段密碼】_lxpsRunSecondPwGate 讀 _fbGetMyPwState:已設密碼(sp.hash)→ 維持 _showVerifyForm 彈出輸入(不變);未設密碼分支由原本 _showSetupPrompt(_finish)「詢問是否設定」改為直接 _finish()(設 sessionStorage 通過旗標 + resolve 放行進遊戲),不再彈設定提示。',
      '★ v3.16.20【二段密碼設定入口移到會員 hub】_openMemberAccountHub 在「✏️ 編輯會員資料」鈕下方新增「🔐 二段密碼設置」鈕(_mh-pw)→ onclick 呼叫既有 window._lxpsOpenSecondPwSetup(未設密碼直接開設定表單·已設密碼先驗證舊密碼再改)。後端 _fbSetMyPw/_fbVerifyMyPw/_fbGetMyPwState 與設定·驗證 UI 全部沿用,零後端改動。',
      '★ v3.16.20【版本/範圍】三點同步 _GAME_LOADED_VERSION + _vers[index.html / game_changelog.js] → v3.16.20;本輪只改 index.html + game_changelog.js(admin_panel.js 維持 v3.16.19·world-boss*/hero_db/arena/sw 等皆未動)。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.99)。',
    ],
  },
  // v3.16.19 — 系統審核誤判英雄「投資證據版」回收 + 道歉公告列出清單 + 救援申請加「我遺失的英雄要回來」
  {
    ver: 'v3.16.19',
    date: '2026-06-25',
    brief: [
      '⚖️【公平性修復:把不是你的角色收回上鎖】先前「自我審查」的缺陷,曾把一些你<b>在多人世界王借用過好友、但其實沒有真正抽到</b>的角色,誤判成你的而解鎖。這一版把這類「<b>借來才出現、沒有真正投資過(沒加素質點/技能/天賦/爆發)、也查不到取得紀錄</b>」的角色<b>收回上鎖</b>,讓大家公平。',
      '✅【你真正的角色一個都不會少】只要是你<b>真正抽到、解鎖過、投資過、或身上裝著至寶</b>的角色,全部完整保留。這次<b>只調整「角色解鎖清單」,完全不動你原本的存檔</b>——其他角色的等級、至寶、知識幣、關卡進度通通都在。',
      '📢【登入會告訴你收回了哪些】登入後若你有被收回的角色,會彈出一次公告<b>列出被收回的角色名單</b>與原因。',
      '🔓【真的是你的被收回了?可以要回來】到關卡頁底部「📨 帳號救援申請」→ 新增的「<b>🔓 我遺失的英雄要回來</b>」勾選你確實擁有卻被收回的角色送出,老師核對紀錄後會補回給你。',
    ],
    items: [
      '★ v3.16.19【判定標準收緊·老師裁示】老師指示「不讓學生平白獲得原本不屬於他們的英雄」→ 保留標準由 v3.16.17「練過(等級>1)即保留」改為「有真正投資證據才算他的」。依據(handoff 鐵證):好友借用只會領 EXP/等級,絕不會把素質點/技能/天賦/爆發投資到借來的角色上 → 故「光有等級/經驗」不再算擁有證據。_advHasGenuineUnlock 移除 lv>1 保留分支;保留=初始8 / 自己解鎖紀錄(來源非 migration_seal 非 admin_delete,uid 屬本帳號或無 uid 舊紀錄)/ 裝至寶 / 投資過(heroStatInvested>0 或 技能·爆發·天賦等級>1)。另加 uid 空字串 fail-safe(uid 未設定一律判為自己=保留,只漏不誤刪)。',
      '★ v3.16.19【回收機制·繞守門可逆】orchestrator window._lxpsRecoverAuditErrorHeroes:uid 已設定 + 雲端載完(擁有≥8)+ 本機/雲端一次性旗標 + 任何例外→回收0(只漏不誤刪);逐隻用記憶體 _advHasGenuineUnlock(證據集 ⊇ 雲端,含本地未同步投資)判定無證據者 → 交 window._fbApplyAuditErrorRecover 直接 updateDoc(繞存檔倒退守門,因回收「大量英雄」必觸發 _hardRegression 而被擋,故走 GM 同款直寫)。回收寫:filter unlockedHeroes + 清齊 heroLevels/heroStatInvested/heroStatPoints/heroSkillLevels/heroBurstLevels 各 map+_s + heroExp + heroTraitLevel(杜絕載入採信舊_s/desync自癒/phantom lv>1 復活)+ 至寶解裝保留本體 + 帳本標 source=audit_error_recovered(可逆,≠admin_delete 永久刪)+ 寫 _auditRecoverDoneV1 雲端一次性旗標 + _authoritativeRestoreAt(由既有 piece3 機制乾淨重載入,避免記憶體手術;重載後因旗標早退不重跑)。',
      '★ v3.16.19【六補回路徑全認得回收標記】audit_error_recovered 在所有「補回/保留」邏輯中視同 admin_delete(不復活):① advGetUnlockedHeroes 出口過濾(唯讀·純來源字串判定無 uid 比對→無 v3.16.14~17 時序災因·不寫回 localStorage)② v3.16.9 帳本權威自癒(_del/_own 兩處)③ v3.13.93 紀錄救援(_isDel)④ phantom rescue _rec82(裝至寶/lv>1)⑤ phantom rescue _phantomRecovered82(雲端 heroLevels lv>1)⑥ _isLegitLocalHero(最高優先丟,即使本地練過)。',
      '★ v3.16.19【道歉公告 + 救援清單】① _showApologyNotice 改為從帳本算出「本帳號最新來源=audit_error_recovered」的角色,實際列出被收回角色名(無受影響者不彈);文案改「已收回」完成語氣 + 指向「我遺失的英雄要回來」。② _openRescueReq 新增「🔓 我遺失的英雄要回來」勾選清單(列被回收角色)→ _rescueReqSubmit 收進 claims.lostHeroes(同 extraHeroes 模式,塞既有 claims 物件免改 firestore.rules)送老師人工審。',
      '★ v3.16.19【版本】三點同步 _GAME_LOADED_VERSION + _vers[index.html / game_changelog.js] → v3.16.19;本輪改 index.html + game_changelog.js + admin_panel.js(救援審核卡接一鍵永久復原閉環)。admin_panel.js 同步 bump v3.16.19(⚠ 順帶修正:先前 index.html 記 admin=v3.16.10 但 GitHub 實際 v3.16.5 的版本不一致,以實際 v3.16.5 為底改後對齊)。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.98)。',
      '★ v3.16.19【救援閉環】學生送「🔓 我遺失的英雄要回來」(claims.lostHeroes)→ GM 後台「📨 帳號救援申請審核」卡:摘要列「🔓 遺失英雄要回來 N 隻」晶片、核對詳情列出學生要求復原的英雄、按「🛟 一鍵永久復原這些英雄」→ window._fbAdminRestoreLostHeroes(uid,names):加回 unlockedHeroes + 從回收時暫存的 _auditRecoveredLevels 無損還原原等級 + 帳本補 source=admin_grant 合法紀錄(最新一筆非 audit_error_recovered → 出口過濾不再隱藏、_advHasGenuineUnlock 判合法、之後再跑審查/重建都不再被回收)+ 附 auditRestored 稽核標記 + 蓋 _authoritativeRestoreAt(學生下次登入 piece3 乾淨套用)→ 標記 resolved + 通知玩家。一鍵永久解決,不需再走學生補償工具。',
    ],
  },
  // v3.16.18 — 緊急復原 v3.16.14~17 災情(停用自動剔除 + 修審查判定)
  {
    ver: 'v3.16.18',
    date: '2026-06-25',
    brief: [
      '🚨【緊急復原】上一版的自動判定有嚴重 bug:在某些時機會把你自己的角色誤判成「別人的」而剔除、卻把污染留下,而且會覆蓋雲端造成永久消失。本版緊急復原:① 完全停用自動剔除——系統不再主動移除任何角色,你練過的角色會從等級自動救回 ② 修正自我審查的判定——之前封存過的污染不再被當成「合法是你的」,會正確歸到可清除的那一類。你的等級/至寶/知識幣/進度一律完全不動。',
    ],
    items: [
      '★ v3.16.18【災情根因】① window._gUserId 時序:出口過濾(v3.16.14~17)可能在 _gUserId 尚未設定時被調用 → 自己前12碼 uid 對不上空字串 → 你自己的角色被判成別人的而 filter 剔除,且寫回 localStorage + 覆蓋雲端 → 永久消失;污染(lv>1 無紀錄)反而因 lv>1 被保留。② 審查 ownLegit 未排除 migration_seal → 之前封存洗白的污染被當合法塞進 B1(清不掉)= 「判定是他的很多不是他的」。',
      '★ v3.16.18【復原措施】① advGetUnlockedHeroes 出口過濾「全面停用」(直接 return,不再 filter 剔除任何角色)。② phantom rescue 移除 v3.16.14 的 genuine 守門 → 回到 lv>1 無條件補回,從 _heroLevels 救回被誤刪的練過角色(既有救援都是「只補不刪」,同樣時序問題下只會漏補、無害,不會誤刪)。③ 審查 ownLegit/otherUid 排除 migration_seal + uid 前12碼相容 → 封存污染落入可清的 B2、真正角色(summon 等紀錄)正確歸 B1。',
      '★ v3.16.18【現狀】回到「不缺少(練過/有紀錄的角色都救回保留)」的安全基線;污染(借來練過、封存殘留)會暫時保留(多出),改由學生自我審查勾「不是我的」或 GM 後台工具清除,不再自動判定剔除(避免再次誤刪)。_advHasGenuineUnlock 保留定義但已無調用點(死碼),待 uid 時序問題徹底解決後才考慮重啟自動判定。',
      '★ v3.16.18【版本】三點同步 → v3.16.18;本輪僅改 index.html + game_changelog.js。',
    ],
  },
  // v3.16.17 — 原有的都保留、不再多出沒有的(角色保留規則最終平衡)
  {
    ver: 'v3.16.17',
    date: '2026-06-25',
    brief: [
      '✅【原有的都保留、不再多出沒有的】重新調整角色保留規則:① 你練過的角色(等級>1)一律保留,不會再因為「沒有解鎖紀錄」被收走——這修好了「有練的角色不見了」② 同時清掉真正多出來的:被老師刪過的、帳本顯示是別人帳號的、以及你既沒抽也沒練過卻冒出來的幻影角色。你的等級/至寶/知識幣/進度一律完全不動。',
    ],
    items: [
      '★ v3.16.17【判定大改·不多出+不缺少】_advHasGenuineUnlock 重排優先序:① 初始8隻→留 ② 裝至寶→留 ③ 投資過(素質/技能/天賦/爆發)→留 ④ 最新紀錄=admin_delete→移除(被刪不復活·最高優先) ⑤ 自己 uid 真正解鎖紀錄→留 ⑥ 只有別人 uid 真正紀錄(無自己證據)→移除(別人的·即使練過) ⑦ 查無任何紀錄但練過(lv>1)→留(很可能 v3.11.10 前未記帳本時自己練的;不缺少他們認定有的) ⑧ lv≤1 又無任何紀錄/投資/至寶→移除(純幻影)。',
      '★ v3.16.17【相對 v3.16.14~16 的調整】v3.16.14 把「lv>1 但無紀錄無投資」一律上鎖→造成「有練的角色不見了」;本版改為這類一律保留(賭是自己 v3.11.10 前練的),只精準清掉「被刪/別人 uid/純幻影」三種真正不該有的。源頭 co-op 借用領 EXP 早在 v3.14.12 堵住,不再新增污染。',
      '★ v3.16.17【殘留說明】唯一無法自動分辨的:純 borrow 殘留(無紀錄·lv>1)與「v3.11.10 前自己練的」資料完全相同 → 從寬保留(優先不缺少);學生若不認可在「自我審查」勾「不是我的」自助清除。時序保護:存檔未載入(_heroLevels 全空)時出口過濾整段跳過,不誤刪。',
      '★ v3.16.17【版本】三點同步 → v3.16.17;本輪僅改 index.html + game_changelog.js。',
    ],
  },
  // v3.16.16 — 修「多出別人的角色」(uid 漏洞) + 有練角色救回說明
  {
    ver: 'v3.16.16',
    date: '2026-06-25',
    brief: [
      '🔧【修「多出別人的角色」】修正一個漏洞:判斷角色是不是你的時候,之前沒檢查解鎖紀錄是不是「你自己」的。共用 iPad 上別人的解鎖紀錄會留在這台機器、被誤認成你的,讓你多出沒抽過的角色。現在只認你自己帳號的紀錄,別人留下的不算 → 多出的角色會自動收回。你原本的等級/至寶/知識幣/進度一樣完全不動。',
    ],
    items: [
      '★ v3.16.16【多出別人角色·uid 漏洞修復】_advHasGenuineUnlock 的「解鎖紀錄」判定原只排除 migration_seal/admin_delete、沒檢查 uid → 共用 iPad 上別人 uid 的真正解鎖紀錄殘留本機帳本(adv_hero_unlock_history)被當成自己 genuine → 出口過濾不收 → 多出沒抽過的角色。修法:紀錄判定加 (沒有 uid 或 uid===自己前12碼),與審查 UI ownLegit 的 uid 邏輯一致;別人 uid 的殘留紀錄不再算數,出口過濾會收回多出的角色。',
      '★ v3.16.16【「有練的角色沒了」說明】v3.16.15 的投資證據(素質點/技能/天賦/爆發任一)已救回「有投入資源練過」的角色;co-op 借用領 EXP 的源頭早在 v3.14.12 已堵(借用英雄排除領 EXP),不再產生新污染,殘留屬舊存量。仍可能被鎖的只剩:純升等級、完全沒做過任何投資、又無解鎖紀錄無裝至寶的角色(與 co-op 借用存量資料完全相同、無法自動分辨)→ 這類用「📨 帳號救援申請」勾「這是我的、要回來」送老師核對補發。',
      '★ v3.16.16【版本】三點同步 → v3.16.16;本輪僅改 index.html + game_changelog.js。',
    ],
  },
  // v3.16.15 — 修 v3.16.14 上鎖誤傷:投資證據=擁有鐵證 + 出口過濾時序保護
  {
    ver: 'v3.16.15',
    date: '2026-06-25',
    brief: [
      '💚【救回修復】聽到有同學說「自己練過的英雄被收走、又沒辦法在審核裡救回」,老師加上更聰明的判斷:只要你曾經幫一隻角色加過素質點、升過技能、升過天賦或爆發,就算系統沒有你的解鎖紀錄,也會認定那是你真正擁有的角色而自動保留,不會再被收走。你的角色等級、至寶、知識幣、進度一樣完全不動。',
    ],
    items: [
      '★ v3.16.15【投資證據=擁有鐵證】_advHasGenuineUnlock 新增第③類證據:_heroStatInvested(素質點·初始空)任一>0、或 _heroSkillLevels 任一槽>1、或 _heroBurstLevels>1、或 _heroTraitLevel>1 → 判定真正擁有。理由:co-op 借用好友英雄只會領到 EXP(_heroLevels 升等),玩家絕不會把自己的點數/技能資源投資到借來的角色 → 投資=真正擁有,與「裝至寶」同級鐵證。大幅修正 v3.16.14「只有等級、無紀錄、無至寶」的真正擁有英雄被誤上鎖的災情。',
      '★ v3.16.15【出口過濾時序保護】advGetUnlockedHeroes 出口過濾新增閘:有非初始英雄但 _heroLevels 完全空(疑似存檔尚未載入)→ 跳過過濾,避免投資/等級判定在資料就緒前失效而誤刪;_heroLevels 與投資 map 同在 _applySafeData 載入,有值即代表投資已就緒,新玩家(僅初始8隻)不受影響。',
      '★ v3.16.15【殘留與救回】仍可能被上鎖的極少數:既無解鎖紀錄、又沒裝至寶、也完全沒做過任何投資(純靠等級存在)的舊角色 —— 這類學生可用「📨 帳號救援申請」勾「這是我的、要回來」送老師核對補發(審核 UI 與送審流程本身正常,未受影響)。',
      '★ v3.16.15【版本】三點同步 → v3.16.15;本輪僅改 index.html + game_changelog.js。',
    ],
  },
  // v3.16.14 — SSR 污染上鎖治本(自我審查缺陷修復)+ 道歉公告
  {
    ver: 'v3.16.14',
    date: '2026-06-25',
    brief: [
      '🔒【重要修復】修正「自我審查」功能的缺陷:原本可能讓你在多人世界王借用過的好友角色,被誤判成你的而解鎖。現已把這些「借來才出現、不是你真正擁有」的角色收回上鎖。你真正抽到/解鎖/身上裝著至寶的角色都完整保留,角色等級、至寶、知識幣、關卡進度通通不動。登入會看到老師的道歉說明。',
    ],
    items: [
      '★ v3.16.14【SSR 污染上鎖·治本】根因:co-op 借用好友 SSR 領 EXP → _heroLevels>1 → v3.15.82 幻影救回每次登入無條件補回;v3.16.9 自我審查封存又把這些寫成 migration_seal 紀錄洗白 → 幾乎全員誤解鎖全 SSR。',
      '★ v3.16.14【真正擁有判定 _advHasGenuineUnlock】一隻角色屬本帳號當且僅當:① 初始 8 隻基礎角色 ② 有真正解鎖紀錄(source 非 migration_seal、非 admin_delete)③ 身上裝著至寶(鐵證,co-op 借用不會把自己的至寶裝到借來的角色上)。',
      '★ v3.16.14【五處修復】① advGetUnlockedHeroes 出口統一過濾無證據污染角色(上鎖·寫回 localStorage·出錯保守保留不誤刪)② _applySafeData phantom rescue「等級>1」加 genuine 守門(裝至寶仍放行)③ 封存全面停寫 migration_seal(_sealNames 恆空,移除污染源)④ 封存提醒停用 ⑤ 登入彈道歉公告(per-uid 一次性)。',
      '★ v3.16.14【不動原本存檔】只調整角色解鎖清單,完全不碰 heroLevels(等級)/至寶/知識幣/關卡進度;雲端靠載入過濾 + 存檔整包覆蓋逐漸清乾淨。誤傷僅限「v3.11.10 前解鎖、無解鎖紀錄、又沒裝至寶、純靠等級存在」的舊角色,可用 GM 後台個案補發救回。',
      '★ v3.16.14【版本】三點同步 _GAME_LOADED_VERSION + _vers[index.html / game_changelog.js] → v3.16.14;本輪僅改 index.html + game_changelog.js;hero_db.js(v3.15.90)/sw.js/sw-light.js/main.css 等未動。GAME_CHANGELOG 維持 20 筆。',
    ],
  },
  // v3.16.13 — 素材全統一至單一倉(整併 Game 與舊倉'-') + 全資源壓縮優化 + SW webp-aware
  {
    ver: 'v3.16.13',
    date: '2026-06-25',
    brief: [
      '🚀【啟動加速】遊戲圖片改用 WebP、背景音樂與動畫做了壓縮優化,啟動和登入更快、更省流量(畫質與音質幾乎沒有差別)。新款 iPad 會自動用更小的圖,舊款 iPad 照常顯示、不受影響。',
      '🔧【素材整併】把原本分散在三個來源(主倉 + 另一帳號 + 一個舊倉)的圖片音效全部整合到單一倉庫,更穩定好維護、不再依賴外部帳號或舊倉。',
      '🔔 十連抽的「敲鑼」音效因原檔遺失,改用主倉現有的「擎天爆閃」音效。',
    ],
    items: [
      '★ v3.16.13【素材大搬家·三倉統一】原素材分散三處:主倉 clarebox123jp-art/LXPSGAME、同帳號舊倉 clarebox123jp-art/-(補搬 68 檔:26 圖+22 音樂+20 動畫)、第二帳號 ChrisRaelGameMaster/Game(37 檔:36 音效+1 圖,其中敲鑼遺失已替代)。全部搬入 LXPSGAME 單一倉;index.html 101 處 + hero_db.js 45 處 + main.css 7 處外部 URL 統一改為 raw.githubusercontent.com 指向 LXPSGAME/main(涵蓋 Game 的 raw/blob/jsDelivr 三式 + 舊倉 - 的 raw 兩式);兩 SW 的 CDN_REPOS 移除 - 與 Game、只留 LXPSGAME。不再依賴第二帳號或舊倉(避免失聯則素材 404)。',
      '★ v3.16.13【遺失音效替代】敲鑼.mp3 三倉皆不存在 → 十連抽召喚之鐘 sfx-gong 改指向主倉現有「擎天爆閃音效.m4a」(連播三次漸弱的儀式感維持);播放邏輯未動,只換 src。',
      '★ v3.16.13【資源壓縮·不改邏輯】全倉 PNG→WebP(q82·約 335 張)、BGM/音效降至 128kbps(約 136 個音檔)、高 fps GIF 降至 15fps(約 77 個);合計減少數百 MB 的新機傳輸量。皆為「未下載過的新機」優化,舊 iPad 與已快取裝置行為不變。WebP 為新增(原 PNG 保留作舊機 fallback),音樂/GIF 同檔名覆蓋。',
      '★ v3.16.13【SW webp-aware】sw.js v3.5.88 + sw-light.js v3.11.3:支援的瀏覽器抓 .png 時自動改抓同名 .webp(Accept 含 image/webp)、舊 iPad 或 webp 不存在(404)自動退回原 .png;PWA icon 維持 png;cache key 改用實際抓取 URL。',
      '★ v3.16.13【版本鏈】本輪改 index.html + hero_db.js + main.css + game_changelog.js + sw.js + sw-light.js 並上傳全部優化素材。三點同步 _GAME_LOADED_VERSION + _vers[index.html / game_changelog.js] → v3.16.13;_vers[hero_db.js] → v3.15.90;sw.js v3.5.88、sw-light.js v3.11.3(不在 _vers);admin_panel.js(v3.16.10)/world-boss*/arena.js 未改。GAME_CHANGELOG 維持 20 筆。',
    ],
  },
  // v3.16.11 — 封存去重(idempotent):重複按「確認並封存」不再寫重複帳本紀錄
  {
    ver: 'v3.16.11',
    date: '2026-06-24',
    brief: [
      '🛠️【封存小修】「✅ 確認並封存」現在可重複按而不會產生重複的封存紀錄(idempotent)。對玩家體驗無感,純穩定性。',
    ],
    items: [
      '★ v3.16.11(審查殘餘風險4修正)封存寫入前先掃描帳本,排除「已有自己 uid 非 admin_delete 紀錄(含先前 migration_seal 封存)」的英雄 → 只對真正還沒紀錄的英雄補寫;送審失敗重按、或同帳號重開審查再封存,皆不再累積重複 migration_seal 紀錄。本地讀一次重用(不增讀寫),300 筆上限不變。',
      '★ v3.16.11【安全/範圍】只動 index.html 封存 handler(_openAccountAudit 內),純去重、不改封存判定/帳本權威自癒/移除流程;封存仍只「加帳本紀錄、不刪任何英雄/資源」。三點 _GAME_LOADED_VERSION + _vers[index.html/game_changelog.js] → v3.16.11(admin_panel.js 本輪未動維持 v3.16.10)。GAME_CHANGELOG trim 至 20。',
    ],
  },
  // v3.16.10 — 「幫英雄上鎖(封存)」一次性登入提醒(老師開關控制)
  {
    ver: 'v3.16.10',
    date: '2026-06-24',
    brief: [
      '🛡️【全體封存提醒·老師開關控制】老師清完帳號後,在後台「📨 帳號救援申請審核」卡頂打開「全體玩家封存提醒」開關 → 全體學生登入時會自動看到一次「幫英雄上鎖」提示,引導他們去封存英雄(每位學生只彈一次)。沒打開前不會彈。',
    ],
    items: [
      '★ v3.16.10【玩家端】新增 window._maybeShowSealPrompt:登入到關卡頁後延 3200ms 觸發(排在會員首登 2200ms、救援說明 2500ms 之後),三道守門才彈——① GM 開關 gameConfig/sealPrompt.enabled===true(讀不到/未開→不彈)② per-uid 完成旗標 lxps_seal_prompt_done_<uid>(只彈一次)③ 防疊加(續戰/練習營/會員/救援/圖鑑審查/新手指引彈窗在場則跳過);_showSealPrompt 綠色彈窗三鈕:「✅ 現在就去封存」→ 標記完成 + 開 _openAccountAudit、「知道了等一下」→ 不標記(下次登入再提醒)、「我已封存過不用再提醒」→ 標記完成。',
      '★ v3.16.10【老師端 admin_panel.js】救援審核卡頂新增「🛡️ 全體玩家封存提醒」開關(✅開啟 / ⛔關閉 + 即時狀態顯示),寫 gameConfig/sealPrompt {enabled,updatedAt,updatedBy}(window._fbAdminSetSealPrompt / _fbAdminGetSealPrompt);開啟前 confirm 提醒「請先清完髒帳號再開,否則未清幻影會被學生封存成合法」。',
      '★ v3.16.10【安全/順序】GM 開關預設關 → 部署後不會自動彈任何人;務必先清完 backlog(救援審查 + GM 工具)再開啟;封存每人只彈一次、idempotent;gameConfig 為 GM-only 寫、登入可讀 → 不需改 firestore.rules。',
      '★ v3.16.10【範圍/版本】index.html(封存提醒 client + onAuth 觸發)四點同步 _GAME_LOADED_VERSION + _vers[index.html/game_changelog.js/admin_panel.js] → v3.16.10;admin_panel.js ADMIN_PANEL_VERSION → v3.16.10(本檔同時含 v3.16.7 救援卡回收補償/復原/爭議分流,首次上傳即一併生效)。GAME_CHANGELOG trim 至 20。',
    ],
  },
];
