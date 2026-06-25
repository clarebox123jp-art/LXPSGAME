// ════════════════════════════════════════════════════════════════════════
//  game_changelog.js  —  LXPSGAME 更新日誌
//  最後更新:2026-06-21  / 目前主程式版本:v3.15.67(新增學生設計英雄「科學發明家」5年4班楊寓如,SSR,新發明物品卡子系統6卡＋6選3即刻發明＋靈感被動＋醫學界的發明奇蹟爆發)
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
  // v3.16.9 — 全體玩家自助「確認並封存」英雄 + 帳本權威自癒:徹底解決「角色不見」
  {
    ver: 'v3.16.9',
    date: '2026-06-24',
    brief: [
      '🛡️【新增:確認並封存我的英雄】到「📨 帳號救援申請 → 🔍 我的英雄來源自我審查」,看過自己的英雄後按「✅ 確認並封存」,系統會把你的英雄鎖定保護——<b>以後就算暫時不見,下次登入也會自動回來</b>。這是為了徹底解決「角色不見」。',
      '   ・綠框 ✅ 已確認是你的、🟡 需要你確認(不是你的可按「不是我的」回收換補償)、🔒 可能遺失的可救回——處理完按「確認並封存」一次搞定。',
    ],
    items: [
      '★ v3.16.9【A·玩家自助封存】_openAccountAudit 送出鈕改「✅ 確認並封存」:對「目前持有 + 沒勾不是我的 + 查無任何解鎖紀錄 + 通過活動英雄守門(_advHasEventUnlockEvidence)」的英雄,補寫 source=migration_seal 的「自己 uid」帳本紀錄(本地 adv_hero_unlock_history + 雲端 _heroUnlockHistory via _lxpsCloudInstantUnlock arrayUnion 批次),填補帳本缺口;★ 他人 uid 的疑似幻影「不」封存(仍可被回收);旗標(回收 extraHeroes / 復原 restoreHeroes / 爭議 contestedHeroes)續送老師核對。封存為純「補帳本紀錄」不新增/不移除英雄 → 安全。',
      '★ v3.16.9【B·帳本權威自癒】advGetUnlockedHeroes 自癒升級:一次解析帳本得兩集合 _del(最新一筆 admin_delete→不自癒)與 _own(有自己 uid 非 admin_delete 紀錄,含封存 migration_seal→且最新非 admin_delete);對 _own 中「不在清單」的英雄自動補回。★ 只認自己 uid → 跨帳號殘留(別人 uid 的紀錄)永遠無法被認領;活動限定英雄仍經解鎖證據守門。封存後帳本完整 → 合法英雄掉了下次登入自動回來。',
      '★ v3.16.9【治本鏈完成】本機 @@uid 命名空間(v3.13.19 已擋「同 iPad 讀到別人本機資料」)+ 封存補齊帳本 + 帳本權威自癒(只認自己 uid)三者合起來:合法英雄結構上「掉不掉、會自己回來」,跨帳號殘留「認不回、可回收」→ 收斂「角色不見」與「多別人角色」。誤刪仍留 admin_delete 軌跡可一鍵還原。',
      '★ v3.16.9【誠實邊界】極端情境(解鎖那一刻紀錄尚未落地、裝置又剛好被清)理論上仍可能,但靠「本機帳本先寫 + 自動補同步 + 封存後自癒完整 + 誤刪可逆 + 學生一鍵自救」壓到實務等於零、且自動/一鍵修復。需先清完 backlog 再請全體封存。',
      '★ v3.16.9【範圍/版本】只動 index.html(封存 + 自癒,純玩家端);三點 _GAME_LOADED_VERSION + _vers[index.html/game_changelog.js] → v3.16.9;admin_panel.js 維持 v3.16.7(GM 爭議審核沿用)。GAME_CHANGELOG trim 至 20。',
    ],
  },
  // v3.16.8 — 修正「遊戲指引 > 戰鬥系統」四種行動按鈕排版(擠成窄條 → 自適應卡片)
  {
    ver: 'v3.16.8',
    date: '2026-06-24',
    brief: [
      '🛠️【修正遊戲指引排版】「📚 遊戲指引 → ② 戰鬥系統 → 四種行動按鈕」原本全部擠成左側一條很難看,已改成整齊的卡片格(普通攻擊 / 技能 S1 / 技能 S2 / 極限爆發 各一張卡,自動填滿寬度、手機/平板會自動換行)。',
    ],
    items: [
      '★ v3.16.8【根因】該區塊 HTML 有壞標籤:「…逆轉戰局！</span></div<div…」少一個「>」(</div< 把關閉標籤與下一個 <div 黏在一起)→ 少關一層 div(實測該段 <div 11 個、</div> 只有 10 個)→ DOM 結構錯亂,加上側邊縮圖把行動列擠進窄欄,四個按鈕被壓成一直線長條。另有「</div></div>></div>」多一個「>」。',
      '★ v3.16.8【修法】把整個「四種行動按鈕」區塊重寫成乾淨的自適應四卡格 grid-template-columns:repeat(auto-fit,minmax(210px,1fr)),每張卡=按鈕 + 說明,移除會擠壓版面的側邊縮圖;同步修掉壞標籤、補齊 div(新區塊 <div/</div> 9=9 平衡)。「💡 主動技能 vs 被動技能」說明框內容保留不變。',
      '★ v3.16.8【範圍】只動 index.html 的 _showNewbieGuide 第②章 render 字串(純前端版面),不影響任何遊戲邏輯/存檔;三點同步 _GAME_LOADED_VERSION + _vers[index.html/game_changelog.js] → v3.16.8(admin_panel.js 本輪未動維持 v3.16.7)。GAME_CHANGELOG trim 至 20。',
    ],
  },
  // v3.16.7 — 帳號自我審查(圖鑑卡片版):看清每隻英雄來源、回收不是自己的(換補償)、申請救回遺失
  {
    ver: 'v3.16.7',
    date: '2026-06-24',
    brief: [
      '🔍【新增:我的英雄來源自我審查(圖鑑卡片版)】打開「📨 帳號救援申請」→「🔍 我的英雄來源自我審查」,用圖鑑卡片一眼看出每隻英雄是「怎麼來的、什麼時候得到的」。',
      '   ・<b>綠框 ✅</b> = 系統已從你的遊戲記錄確認是你的,免處理(包含「自己抽到 / 打到」和「曾被汙染」並存的情況,仍算你的)。',
      '   ・<b>🟡 需要你確認</b> = 你持有、但查無你自己的取得紀錄。認得就不用動;<b>不是你的</b>按「不是我的」回收 → 老師核准後會<b>發給你投資補償(知識幣)</b>,讓帳號變乾淨。',
      '   ・<b>🔒 可能遺失的英雄</b> = 有你的紀錄或練過痕跡卻不在身上,可按「這是我的、要回來」申請救回。',
      '   ・早期沒有紀錄、但你確定曾擁有的,也可以申請,老師會人工核對(之前同場連刷出很多 SSR 的 BUG 英雄不在復原範圍)。',
    ],
    items: [
      '★ v3.16.7【學生端 _openAccountAudit】client 端讀 adv_hero_unlock_history + advGetUnlockedHeroes + _heroLevels + uid 即時三桶分類:桶1 已擁有且有自己合法紀錄(own-uid 或無 uid 舊資料、非 admin_delete,含雙紀錄)→ 綠卡免動;桶2 已擁有但查無自己合法紀錄(無紀錄 / 只有他人 uid / 只有 admin_delete)→ 黃卡;桶3 未擁有但有自己紀錄或等級>1 → 可救回;桶3b 未擁有且查無紀錄 → 次級「其他英雄」可申請。圖鑑卡片用 HERO_IMGS 頭像 + 稀有度邊框(SSR金/SR紫/其他藍)+ 來源時間字幕,未擁有灰階。',
      '★ v3.16.7【預設信任、只標例外】絕不做「沒勾就刪」;移除只對學生明確按「不是我的」動作。桶2 他人 uid / 查無紀錄者可同時按「這是我的」→ 標記爭議送 GM 人工判(對應老師裁示)。',
      '★ v3.16.7【投資補償預覽】桶2 按「不是我的」即顯示「回收補償 ≈ min(30000,max(800,等級×600)) 幣(老師核准後發放)」,鼓勵把不屬於自己的角色回收換乾淨帳號。',
      '★ v3.16.7【送審】三類分開收進既有 claims 物件(extraHeroes 回收 / restoreHeroes 有證據復原 / contestedHeroes 爭議)→ 沿用 _fbSubmitAccountRescueRequest,免改 helper / firestore.rules;_openRescueReq 既有文字清單改為啟動圖鑑審查的按鈕。',
      '★ v3.16.7【GM 端 admin_panel.js】救援審核卡清楚分流:🚩 不是我的 → 一鍵移除 +（v3.16.7）回收後經 _fbCompensatePlayer 正規發放補償;🟢 無爭議可自動復原(有證據)→ 一鍵 union 加回;🔍 需你判斷的爭議(學生堅持但帳本顯示他人 / 查無紀錄)明顯標出 + 提醒核對召喚紀錄、BUG 連刷英雄不復原 → 你手動決定。_fbAdminBulkRemoveHeroes 加 opts.compensate 回傳補償金額。',
      '★ v3.16.7【版本鏈】index.html + admin_panel.js + game_changelog.js 同步 v3.16.7;承接 v3.16.6(幻影復活根治)。本輪做學生端英雄審查 + GM 審核分流;至寶圖鑑審查與「沒爭議全自動批次」為下一輪。GAME_CHANGELOG trim 至 20。',
    ],
  },
  // v3.16.6 — 幻影角色復活根治 + 帳號救援可看英雄來源、標記「不是我的」
  {
    ver: 'v3.16.6',
    date: '2026-06-24',
    brief: [
      '🛡️【根治「被移除的英雄又自己跑回來」】先前少數同學遇到「老師幫忙移除某隻角色後、隔天登入它又出現」的狀況,這版徹底修好,移除後不會再復活。',
      '🔍【帳號救援申請升級】打開「📨 帳號救援申請」,現在可以看到「你每一隻英雄是幾月幾日、用什麼方式得到的(召喚 / 打王 / 老師補發…)」;若有「不是你抽到 / 打到的」或「查無紀錄又完全不認得」的,勾選後送出,老師核對遊戲記錄後會幫你移除。',
    ],
    items: [
      '★ v3.16.6【甲·源頭清殘留】GM 兩支選擇性移除工具(_fbAdminDeleteUnlockedHero 單刪 / _fbAdminBulkRemoveHeroes 批量收回)補清 heroExp / heroTraitLevel 殘留:此二表無 _s 字串版,原本刪英雄只清 5 表、漏 heroExp → 殘留會被 desync 修復重建等級。',
      '★ v3.16.6【乙①·機制治本】_lxpsRepairLevelExpDesync 改為「只修已在 _heroLevels 有正等級的英雄、絕不從 heroExp-only 殘留創造新等級鍵」;合法英雄解鎖時已 seed _heroLevels=1,故零影響合法英雄、只擋幻影。',
      '★ v3.16.6【乙②·機制治本】advGetUnlockedHeroes 自癒網對「帳本最新一筆 = admin_delete」的英雄不自癒(原本只擋活動限定英雄、普通 SSR/SR 一律放行 → 被刪英雄循 desync→自癒→雲端復活);比照 _applySafeData v3.15.82 在地救回早有的 admin_delete 守門補齊。',
      '★ v3.16.6【復活鏈】GM 刪英雄→heroLevels_s 清乾淨但 heroExp 殘留→登入 desync 用 heroExp 重建 _heroLevels→自癒網 union 回 unlockedHeroes→存雲端→復活。甲清存量、乙堵機制 → 結構上不再復活。',
      '★ v3.16.6【Q2·來源顯示】學生端 _openRescueReq 新增「🔍 我的英雄是怎麼來的」清單:讀本地 adv_hero_unlock_history 顯示每隻英雄來源 + 時間、查無紀錄標❓;每隻附「不是我的」勾選 → _rescueReqSubmit 收進 claims.extraHeroes(塞既有 claims 物件、免改 helper / firestore.rules)。',
      '★ v3.16.6【Q2·GM 端】admin_panel.js 救援審核卡新增 _extraBlock 顯示學生標記「不是我的」英雄晶片 + 「🗑 移除學生標記的不是我的英雄」鈕(走 _fbAdminBulkRemoveHeroes,本版已根治復活 → 移除後不再回來)。',
      '★ v3.16.6【版本鏈】index.html + admin_panel.js + game_changelog.js 同步 v3.16.6;補回先前漏上傳的 v3.16.4 / v3.16.5 玩家公告;GAME_CHANGELOG trim 至 20(移除最舊 v3.15.83 / 84 / 85)。',
    ],
  },
  // v3.16.5 — 帳號污染完美保護:過時分頁不再蓋更新 + 一鍵重建移除幻影 + 載入更一致
  {
    ver: 'v3.16.5',
    date: '2026-06-24',
    brief: [
      '🛡️【帳號污染完美保護】① 老師更新你的帳號後,舊分頁不再蓋掉更新(會自動重新載入套用最新)。',
      '   ② 後台「一鍵帳號重建」會自動移除「明明被刪、卻又冒出來」的幻影角色。',
      '   ③ 養成資料載入更一致、更防污染。',
    ],
    items: [
      '★ v3.16.5【piece3】GM 補償 / 還原 / 重建 / 收回 / 重置 / 強制還原 6 處主檔寫 _authoritativeRestoreAt;_applySafeData 載入擷取 session 基線,onSnapshot 偵測雲端戳記比基線新 → 鎖存 + 1.8s 重載;gameCloudSave 保護層 1.6 拒存過時 session → 不再蓋掉老師的補償。',
      '★ v3.16.5【piece2】_fbRebuildAccountFromLedgers 偵測 unlockedHeroes 中帳本判定不該有者:類(a)帳本最近 = admin_delete(被刪卻又出現)→ 自動移除;類(b)帳本查無紀錄 → 僅報告供老師人工審核、絕不自動移除。',
      '★ v3.16.5【piece1】_LXPS_PREFER_S 納入 heroStatInvested / heroSkillLevels,與 _applySafeData 早已採信此二者 _s 對齊,消除三槽合併路徑不一致。',
    ],
  },
  // v3.16.4 — 後台修正:GM 清除/重置/復原後,清除結果不再被學生下次登入的舊資料蓋回
  {
    ver: 'v3.16.4',
    date: '2026-06-24',
    brief: [
      '🔧【後台修正】老師「清除異常英雄 / 重置 / 復原帳號」後,清除結果有時會在學生下次登入時被舊資料蓋回的問題已修正(讓老師的操作真正生效、不再被『復原』)。',
    ],
    items: [
      '★ v3.16.4【根因】_applySafeData 載入時已優先採信 heroStatInvested_s / heroSkillLevels_s,但 4 支 GM 工具(刪英雄 / 批量收回 / 重置 / 污染清除復原)寫了乾淨 map 卻沒寫對應 _s → 學生一登入採信舊髒 _s 把清除『復原』= 污染又回來。',
      '★ v3.16.4【修法】四處 _patch 補寫 heroStatInvested_s / heroStatPoints_s / heroSkillLevels_s / heroBurstLevels_s(污染清除復原工具連 heroLevels_s 一併補)。純加欄位、零回歸風險。',
    ],
  },
  // v3.16.3 — 帳號修復:校正「等級異常偏低但經驗很多」的英雄
  {
    ver: 'v3.16.3',
    date: '2026-06-24',
    brief: [
      '🔧【修正英雄等級顯示異常】少數英雄出現「等級變得很低(例如 Lv1)、但其實累積了很多經驗值」的狀況,這版會自動修好。',
      '   ・登入後系統會依照英雄「累積的經驗值」自動把等級校正回正確值。',
      '   ・<b>只會調高、不會調低</b>:已經正常的英雄完全不受影響,不會有人被降級。',
    ],
    items: [
      '★ v3.16.3【根因】getHeroLevel 直讀 _heroLevels[name];舊版存檔污染/Firebase merge 幻影把它弄成 1,但 _heroExp[name] 仍保留大量經驗 → 顯示「Lv1 卻有幾萬經驗」的 desync。',
      '★ v3.16.3【修法】新增 window._lxpsRepairLevelExpDesync():對每隻有經驗的英雄,用遊戲既有 _expForLevel 曲線(與 addHeroExp 同一道升級迴圈,但「不」重發素質點/天賦/獎章 → 避免雙重獎勵)把超額經驗排空成等級;只升不降、無超額經驗者不動 → 完全 idempotent。在兩個主載入點 _applySafeData(data) 之後呼叫。',
      '★ v3.16.3【安全】只改記憶體 _heroLevels/_heroExp(下次存檔由 heroLevels_s 寫回校正值持久化),完全不碰 _s 字串權威 / 三槽合併 / GM 清污染工具 → 零回歸風險。',
      '★ v3.16.3【後續(高風險,本輪未做)】帳號污染「完美保護」的 _s 全採信(PREFER_S 擴展)+ GM 帳本重建升級為「移除幻影角色」屬高風險:GM 清污染工具目前寫乾淨 map 但不寫 _s、_applySafeData 已採信 _s 但三槽合併沒採信(路徑不一致),盲目開啟會把 GM 已清的污染復活 → 需先補 GM 工具寫 _s + 一次性遷移 + 先測 110082,排在後續分段交付。',
      '★ v3.16.3【版本鏈】只改 index.html + game_changelog.js;_GAME_LOADED_VERSION + _vers[index.html / game_changelog.js] → v3.16.3;承接 v3.16.2(卡死全校根治)。GAME_CHANGELOG trim 至 20(移除最舊 v3.15.82)。',
    ],
  },
  // v3.16.2 — 緊急修正:貓空打完 BOSS 後卡在確認獎勵視窗/戰鬥畫面無法結束
  {
    ver: 'v3.16.2',
    date: '2026-06-24',
    brief: [
      '🚑【緊急修正:打完 BOSS 後卡住的嚴重問題】先前有同學反映「貓空打完 BOSS、出現評分獎勵、按了確認後卻卡在獎勵視窗或戰鬥畫面、離不開」,這版已根治!',
      '   ・現在按下「✅ 確認」會「立刻」收掉獎勵視窗、離開戰鬥畫面,不論網路快慢都不會再卡住。',
      '   ・敗北後選「回學校休整」也一併修正,不會再卡在戰鬥畫面。',
    ],
    items: [
      '★ v3.16.2【根因】結算「✅ 確認」鈕 onclick 會先把自己 disabled 再呼叫 advStartWinSequence;舊流程函式中段 await gameCloudSave() 在校園慢網/壅塞時長時間卡住 → 原本排在其「之後」的「隱藏結算 overlay(L≈87901)+ 清戰鬥畫面 class(L≈87911)」遲遲不執行,而鈕已 disabled 無法再按 → 玩家卡在確認獎勵視窗(離不開)兼卡在戰鬥畫面(結束不了),幾乎所有學生都會踩到。',
      '★ v3.16.2【修法①】把「隱藏結算 overlay + 清戰鬥畫面 class + 清行動順序條」提到 advStartWinSequence 入口(worldboss 守門後、重入守門前),讓 UI 轉場與後續存檔/獎勵計算完全脫鉤——無論網路多慢、無論後續是否殘留 await,確認後一定能立刻離開;後續 L≈87901/87911 同款隱藏/清除保留為冗餘雙保險。讀評分/分數是讀 DOM textContent,移除 show 只是視覺隱藏不影響計算。',
      '★ v3.16.2【修法②】敗北「回學校休整」advGoRestAtSchool 內、隱藏戰鬥畫面 class 之前的 await gameCloudSave() 改 Promise.resolve(gameCloudSave()).catch(...) fire-and-forget(原本同樣會在慢網阻塞戰鬥畫面收起);進度另有 autosave + 中斷快照兜底。',
      '★ v3.16.2【未動範圍】只調整「UI 轉場時機」,不改發獎/解鎖/EXP/存檔內容;BOSS 戰結算發獎、英雄加入、升級演出邏輯皆不變。承接 v3.16.1(好友借用+召喚卷/貓空 fire-and-forget)。',
      '★ v3.16.2【版本鏈】只改 index.html + game_changelog.js;_GAME_LOADED_VERSION + _vers[index.html / game_changelog.js] → v3.16.2;world-boss.js(v3.15.98)/admin_panel.js(v3.15.90)/hero_db.js(v3.15.89)/sw.js(v3.5.87) 未改。GAME_CHANGELOG trim 至 20(移除最舊 v3.15.81)。',
    ],
  },
  // v3.16.1 — 體驗修正(好友借用套用最高等級+至寶、召喚卷/貓空解鎖升級畫面立即出現)
  {
    ver: 'v3.16.1',
    date: '2026-06-24',
    brief: [
      '⚡【三項體驗修正,讓遊戲更順手】',
      '   ・<b>邀請好友借用英雄</b>:現在會正確套用好友英雄的「最高等級」與「裝備的至寶」!(以前只會用到對方「設定代表英雄那一刻」的狀態,之後升級或換至寶都沒更新到)',
      '   ・<b>使用 SSR / SR 召喚卷、自選卷、至寶卷</b>:解鎖到的角色或至寶畫面會「立刻」出現,不用再等很久(原本網路慢時要乾等 8~30 秒)。',
      '   ・<b>貓空打完 BOSS</b>:按下「確認」領獎後,英雄升級畫面會「立刻」出現,不再卡住 8~30 秒才跳出來。',
    ],
    items: [
      '★ v3.16.1【好友借用根治】representativeHero 原僅在 _selectRepHero(設定代表英雄)當下擷取一次快照(等級/statInvested/skillLevels/burstLevel/裝備至寶),之後升級/換至寶/投資點都不更新雲端 → 好友邀請讀 fd.representativeHero 拿到舊快照。根因:_refreshMyRepHeroCloud 全程零呼叫點。修法:gameCloudSave 雲端寫入成功後接 _refreshMyRepHeroCloud()(內建 1.5s 防抖 + 只在有代表英雄時寫 + 重讀 live 等級/至寶),任何進度存檔後自動刷新雲端代表英雄快照。注意:已設代表英雄但修正上線後尚未再玩者,其雲端快照要等下次存檔才更新(自癒)。',
      '★ v3.16.1【召喚卷顯示前存檔改 fire-and-forget】SSR/SR 隨機卷 + SSR/SR 自選卷 + 隨機/自選至寶卷 共 4 條流程,原本在顯示解鎖結果動畫「之前」await gameCloudSave → 校園 wifi 慢時阻塞 UI 8~30 秒。解鎖已即時寫 localStorage 解鎖清單 + reconcile 下次登入補雲端,await 純多餘 → 改 Promise.resolve(gameCloudSave()).catch(...) 背景化,結果畫面立即出現。',
      '★ v3.16.1【貓空 BOSS 顯示前存檔改 fire-and-forget】advStartWinSequence(L≈87896)在收結算畫面與出升級視窗「之前」await gameCloudSave 阻塞 8~30 秒。獎勵(書/幣/水晶)、EXP、升級清單此時已套進記憶體,存檔純持久化不需擋 UI;另有 grantBattleExp 的 fire-and-forget 存檔 + autosave + 中斷快照三重兜底 → 改 fire-and-forget。三處皆只動「顯示視窗前的存檔時機」,不改發獎/解鎖/存檔內容。',
      '★ v3.16.1【版本鏈】本輪疊在 v3.15.99 會員資料 + v3.16.0 累積答對之上,只改 index.html + game_changelog.js。版本同步點 _GAME_LOADED_VERSION + _vers[index.html / game_changelog.js] → v3.16.1;world-boss.js(v3.15.98)/admin_panel.js(v3.15.90)/hero_db.js(v3.15.89)/sw.js(v3.5.87) 未改。GAME_CHANGELOG trim 至 20(移除最舊 v3.15.80)。',
    ],
  },
  // v3.16.0 — 答題解鎖門檻放寬(累積答對 20 題,答錯不再歸零)
  {
    ver: 'v3.16.0',
    date: '2026-06-24',
    brief: [
      '🎯【「小力 / 幼兒園小孩 / 機關王雙人組」更容易獲得了!】這三隻活動英雄原本要在專屬題庫「連續答對 20 題」、只要答錯一題就整個歸零重來;現在改成「累積答對 20 題」——可以慢慢累積,答錯也不會把進度清空!',
      '   ・<b>小力</b>:在「領養與照顧狗狗」題庫累積答對 20 題即可獲得。',
      '   ・<b>幼兒園小孩</b>:在「照顧與陪伴幼兒」題庫累積答對 20 題即可獲得。',
      '   ・<b>機關王雙人組</b>:在「世界機關王大賽」題庫累積答對 20 題即可獲得。',
      '   ・<b>答錯不再歸零</b>:答錯只是那一題沒拿到進度,已經累積的答對題數會永久保留,可以分很多次慢慢完成,不用怕一錯就重來。',
    ],
    items: [
      '★ v3.16.0【累積制核心】_resetUnlockHeroProgressOnWrong 不再於答錯時重置 streak(careInfantStreak/dogCareStreak/greenMechStreak)或清空已用題庫,改為僅顯示鼓勵橫幅;_trackUnlockHeroProgress 答對 +1、滿 20 解鎖的累積邏輯不動 → 由「連續答對(答錯歸零)」變「累積答對(進度永久保留)」。',
      '★ v3.16.0【文案同步】所有玩家可見文字由「連續答對 / 答錯歸零」改「累積答對」:特殊題庫進度條、冒險戰鬥橫幅、迷你戰鬥橫幅、英雄解鎖標籤×2、圖鑑機關王說明+卡片副標、詳情頁解鎖條件三分支、獎章「機關王挑戰者」(unlock_gm)描述、解鎖原因記錄×2、解鎖慶祝 toast 與 log。',
      '★ v3.16.0【未動範圍】戰鬥內「連續答對連擊」(currentStreak / 獎章 streak_3·5·10)與「台灣關連續答對」(twQuizStreak)是另一套系統,完全未更動。',
      '★ v3.16.0【版本鏈】本輪改 index.html + game_changelog.js(疊在 v3.15.99 會員資料之上)。版本同步點 _GAME_LOADED_VERSION + _vers[index.html / game_changelog.js] → v3.16.0;world-boss.js(v3.15.98)/admin_panel.js(v3.15.90)/hero_db.js(v3.15.89)/sw.js(v3.5.87) 未改。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.79)。',
    ],
  },
  // v3.15.99 — 小英雄會員資料(首登建立 + 編輯同步雲端)
  {
    ver: 'v3.15.99',
    date: '2026-06-24',
    brief: [
      '🪪【新增「小英雄會員資料」】第一次登入時會跳出「會員資料建立」視窗,填寫你的基本資料,方便老師辨識並照顧每一位小英雄(這些資料只有老師看得到)。',
      '   ・<b>填寫欄位</b>:會員暱稱、E-mail 信箱、玩家身分(可複選)、出生年份、在學就讀年級(選填)、真實性別、主要遊玩平台(可複選)。',
      '   ・<b>填好就送禮</b>:完整填寫並送出,即可獲得 🔮召喚水晶 ×10 + 💰知識幣 20,000 + 🌈SSR 隨機召喚卷 ×1(每個帳號限領一次)!',
      '   ・<b>之後也能改</b>:資料填過一次就不會再自動跳出;想修改隨時點關卡頁下方「📨 會員帳號與救援申請」→「✏️ 編輯會員資料」即可(原本的「帳號救援申請」也在同一個地方)。',
    ],
    items: [
      '★ v3.15.99【會員資料系統】首次登入(memberProfileComplete 未設)→ 關卡頁延 2200ms 自動彈「會員資料建立」表單(7 欄:會員暱稱[GM 私密識別,與遊戲內公開暱稱無關]/E-mail/玩家身分多選/出生西元年/在學年級選填/真實性別/主要平台多選);送出寫玩家自己 players/{uid}.memberProfile + memberProfileComplete/Rewarded,走既有「玩家自己 self-write」規則,無需新增 firestore.rules。',
      '★ v3.15.99【一次性獎勵】未領過(memberProfileRewarded 雲端旗標)才發 🔮×10 + 💰20000 + 🌈SSR隨機召喚卷×1;旗標先寫雲端、再本地 backpackAdd/addKnowledgeCoins 發獎 + gameCloudSave → at-most-once(編輯既有資料不再發)。',
      '★ v3.15.99【入口整合】關卡頁底部「📨 帳號救援申請」鈕改名「📨 會員帳號與救援申請」→ 開 hub(✏️ 編輯會員資料 / 📨 帳號救援申請);block#02 新增 _fbGetMemberProfile/_fbSaveMemberProfile + _MEMBER_IDENTITY/GRADE/GENDER/PLATFORM_OPTS;UI _openMemberAccountHub/_openMemberProfileForm(first 首登有獎可稍後再填·點背景不關 / edit 編輯無獎)/_memberProfileSubmit/_maybeShowMemberProfileFirstLogin;救援說明彈窗加會員彈窗防疊加守門。',
      '★ v3.15.99【版本鏈】本輪改 index.html + game_changelog.js。版本同步點 _GAME_LOADED_VERSION + _vers[index.html / game_changelog.js] → v3.15.99;world-boss.js(v3.15.98)/admin_panel.js(v3.15.90)/hero_db.js(v3.15.89)/sw.js(v3.5.87) 未改。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.78)。',
    ],
  },
];
