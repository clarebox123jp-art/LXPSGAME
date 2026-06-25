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
  // v3.15.98 — 第五隻世界 BOSS 深淵海龍王(水)完整實裝
  {
    ver: 'v3.15.98',
    date: '2026-06-24',
    brief: [
      '🐉【新世界 BOSS:深淵海龍王(水)登場】第五隻龍王「深淵海龍王」正式上線——蛰伏於太平洋最深處的太古冰龍,以絕對零度冰封全場。',
      '   ・<b>招牌「封技」</b>:牠每回合會隨機封鎖一名英雄的<b>技能與極限爆發</b>(仍可普攻/休息),爆發時更會對全體封技,務必分散依賴、別把希望全押在單一輸出。',
      '   ・<b>冰封打法</b>:招式「絕對零度」「萬丈寒淵」全體水傷並施加冰凍;弱點是<b>被冰凍時受傷 +30%</b>——帶<b>冰法師</b>等能冰凍牠的英雄是最佳剋星。',
      '   ・<b>但冰封有代價</b>:牠被冰封住的那回合<b>每受到一次攻擊會回復 1 點能量</b>(加速牠放爆發),而且<b>對牠的冰凍每次只持續 1 回合、冰層碎裂後 1 回合免疫冰凍</b>,無法連續凍結——要抓準冰封的短暫空檔集中火力,小心反而餵飽牠的大絕。',
    ],
    items: [
      '★ v3.15.98【深淵海龍王 資料層】world-boss.js:HERO_DB(ATK47/SP50/SPD18·HP500萬·水·s1 絕對零度 c5 特技130%全體水+50%冰凍1回/s2 萬丈寒淵 c6 特技150%全體水+隨機2強力冰凍2回)、BURST_DB(絕對零度·冰封終焉:特技150%全體水傷[無視有利/迴避/反射/減傷·護盾仍80%]+全體冰凍1回+隨機1強力冰凍2回+全體封技1回)、HERO_TRAIT(深淵之意志:cap5000+護盾水/風/光/草[破風/土/暗/火]+每回合隨機封技1人2回+冰凍三段弱點)、HERO_LORE/HERO_BIO 去「設計中」、舊「查封」文案改「封技」。',
      '★ v3.15.98【深淵海龍王 AI + 機制】① 三支專屬 AI(_wbWaterBossS1/S2/Burst,仿草/土結構走 doDmg→世界BOSS 5000 cap;爆發 setTimeout 包+_wbActionCount=2 不再追擊普攻)。② dispatcher 三路由(_wbAdvBossS1/S2/Burst 各加「深淵海龍王」分支)。③ 天賦每回合封技掛 BOSS 主行動 hook(_wbActionCount===1):隨機 1 名 addStatus seal(無法用技能)+_burstSeal(無法爆發)各 1 回合〔老師①甲:沿用現成狀態組合,零引擎風險〕。④ 冰凍三段弱點:_wbApplyBossDmgCap 內「海龍王身上有 freeze」→ 最終傷害×1.3(突破 5000/1000 上限)+每受擊 G.energy.p2+1(冰中吸能加速爆發)+標記 _wbWasFrozen;BOSS 主行動 hook 結算「_wbWasFrozen 且已解凍→設 _wbIceImmuneTurns=1(冰層碎裂免疫1回)」+免疫回合遞減。',
      '★ v3.15.98【index.html addStatus 冰凍攔截】對海龍王本體施加 freeze 時:若 _wbIceImmuneTurns>0 → 免疫不上(碎裂冷卻);否則 dur 強制壓成 1 回合(即使強力/長時冰凍)。僅針對 name==「深淵海龍王」,對玩家英雄的冰凍維持 1~2 回合不受影響。',
      '★ v3.15.98【背景圖】海龍王戰場立繪 水龍王.png(world-boss.js bossId→圖檔映射既有),沿用與其他龍王相同的通用顯示(--wb-boss-bg + center 10%/cover),高度對齊一致;_wbApplyCurrentBossSkin/_wbApplyNextBossPreview 資料驅動自動套用。',
      '★ v3.15.98【特效/音效/BGM】① 爆發特效:_WB_FX_URLS 加 burst_water=冰椎爆裂.gif(_wbWaterBossBurst 呼叫 _wbPlayFullscreenFx(burst_water))。② 爆發音效:結冰 sfx-ice1(單體冰凍.mp3)鋪底 + 260ms 後碎冰爆破 sfx-burst(爆發技能.mp3),呼應「冰椎爆裂」。③ 戰鬥 BGM:_WB_BATTLE_BGM_MAP 加 shenhai_water_dragon→bgm-wb-shenhai-battle;index.html 新增 <audio id=bgm-wb-shenhai-battle src=海龍王BGM.m4a loop>(仿地龍王戰BGM)。GIF/BGM 走 network 不進 sw cache(對齊既有龍王特效/BGM)。',
      '★ v3.15.98【版本鏈】本輪改 world-boss.js + index.html + game_changelog.js。版本同步點 _GAME_LOADED_VERSION + _vers[index.html / game_changelog.js / world-boss.js] 全 → v3.15.98;sw.js(v3.5.87)/admin_panel.js(v3.15.90)/hero_db.js(v3.15.89)/world-boss-ui.html(v3.15.69) 未改。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.76)。',
    ],
  },
  // v3.15.97 — 日本三神器不再誤佔至寶 + 練習營三修 + 強化教學畫面飄移根治
  {
    ver: 'v3.15.97',
    date: '2026-06-23',
    brief: [
      '💎【日本三神器不再被誤算成台灣至寶】草薙劍、八尺瓊勾玉、八咫鏡這三件「日本三神器」其實是解鎖隱藏關卡(八岐大蛇)的<b>任務物品</b>,並不是台灣至寶。先前它們會被誤寫進至寶資料、<b>佔用你的至寶數量</b>,連帶讓「帳號救援」誤把它們當成缺漏的至寶補回。',
      '   ・這版已修正:三神器不再計入台灣至寶。<b>已受影響的帳號只要登入,系統會自動把誤算的三神器從至寶清單清掉</b>(你對三神器的擁有、以及隱藏關卡的解鎖狀態都完全不受影響)。',
      '📚【課堂練習營改善】① 題目和選項的<b>字體放大</b>,在平板上更好閱讀;② 修正部分情況下<b>「第一題按了沒反應」</b>的問題(原因是練習營被遊戲其他畫面元素蓋住、攔截了你的點擊);③ <b>「帶獎勵進入遊戲」按鈕現在隨時都能按</b>——就算遊戲還沒連線好也能按下,系統會先把你剛賺到的獎勵<b>綁定你的帳號保存起來</b>,等連線一好就自動帶你進場(不會卡住、也不會白賺)。',
      '🖥️【英雄圖鑑「英雄強化教學」看完畫面上移卡死 已修正】先前在英雄詳情頁看完「英雄強化教學」後,整個遊戲畫面會往上移、超出螢幕(電腦版上方按鈕列會有一半不見、iPad 更會整個飄走、上方按鈕按不到形同卡死,只能重開或轉螢幕才恢復)。這版已根治;同時<b>一併改善了 iPad 上畫面容易飄移、超出螢幕的情況</b>。',
    ],
    items: [
      '★ v3.15.97【日本三神器=任務物品·永不進入台灣至寶系統】根因:_japanSetTreasure() 取得三神器時呼叫了 _advSaveTreasureUnlockHistory(key,「japan_clear」),該函式不只寫 _treasureUnlockHistory 帳本,還會把 taiwanTreasureData.<key>(tengu/shutendoji/tamamo) 也寫進台灣至寶擁有清單 → 雙重污染 → 帳號救援 _fbRebuildAccountFromLedgers 從帳本反推時把三神器當缺漏至寶補回、誤佔至寶 3 個數量。修法:① _japanSetTreasure 移除該呼叫(只保留 gameCloudSave;三神器擁有/同步全由 adv_japan_treasures + japanProgress.treasures 維護,主存檔/三槽合併/載入皆已涵蓋)② 新增 window._JAPAN_TREASURE_KEYS={tengu,shutendoji,tamamo} + window._isJapanTreasureKey()(掛 window 確保跨 script block 可呼叫)③ 三處清污染:_applySafeData 載入 taiwanTreasureData 合併後迴圈剔除三神器殘留鍵 → 隨後 _saveTaiwanTreasureData() 連同 _s 整包覆蓋雲端(已污染帳號登入即自動清乾淨)、_fbRebuildAccountFromLedgers 的 _missingTreasures filter 加 「&& !window._isJapanTreasureKey(id)」、_extractDataSummaryForCompare 至寶清點加 「if(window._isJapanTreasureKey(id))return」。★ 三神器「擁有」與隱藏關解鎖完全不受影響(走 adv_japan_treasures / japanProgress.treasures,與 taiwanTreasureData 無關)。',
      '★ v3.15.97【練習營三修】① 字體放大:_campShowQuestion 題目 18→23px、選項 15.5→20px、字母圈 26→32px、回饋 15→18px;_campShowSubjectScreen 題庫/隨機鈕 15→18px、標題 16→20px。② 第一題無法選根治:_campBuildShell overlay z-index 100000→2147483646(原 100000 被遊戲眾多高層元素 z 達 999999~2147483647 遮擋,雲端就緒後背景渲染的高層元素攔截了練習營點擊);答題改 #_camp-body「一次性事件委派」(_campOptBound 旗標 + closest「._camp-opt」,不再逐選項 onclick → 免疫 iOS 動態按鈕首次點擊被吃 + 重渲 onclick 競態);選項與題庫鈕加 touch-action:manipulation。③ 進入按鈕一律可按:_campUpdateBanner 改寫(就緒→綠色立即進入;未就緒→仍顯示橘色可按鈕 + 資源載入進度條);新增 async _campRequestEnter()(就緒→_campEnterGame;未就緒→設 window._campWantEnter=true + 先 _campSettleBank() 保存獎勵[bank 綁 uid] + 按鈕轉「準備中」);_campStart 開頭重設 _campWantEnter=false;700ms 輪詢加「_campWantEnter && _campCanEnter()→自動 _campEnterGame()」。',
      '★ v3.15.97【強化教學(HUT)畫面飄移根治】根因:_hutShowStep 用 el.scrollIntoView({block:「center」}) 把高亮 anchor 捲到中央,但在 iOS(尤其 iPad)scrollIntoView 會連帶冒泡捲動 documentElement/body,而英雄詳情 #hero-detail-overlay 是 position:absolute → body 一被捲走、整個遊戲畫面就上移飄出螢幕,且結束 _hutRemoveAll 只移除 _hut-* 元素、沒還原捲動位置 → PC 按鈕列半截超出、iPad 整個上移卡死(轉螢幕 reflow 重置 scrollTop 才恢復)。修法:① _hutShowStep 改用「手動只捲 #hero-detail-box」(用 getBoundingClientRect 差值設容器 scrollTop 把 anchor 捲到容器垂直中央,完全不觸發 body 捲動;找不到容器才 fallback scrollIntoView)② 進入時記錄 window._hutSavedPageScroll(首次)、_hutRemoveAll 結束還原(window.scrollTo + documentElement/body scrollTop + 清 null,雙保險)③ #hero-detail-box 加 overscroll-behavior:contain。',
      '★ v3.15.97【通用 iPad 畫面飄移根治】_initPWA 改為「無條件設 document.documentElement + body 的 overscrollBehavior=none」(原本僅 PWA standalone 模式才設)。瀏覽器分頁開啟時 iPad 也常見整頁被橡皮筋/慣性捲動推移、position:fixed/absolute 的 overlay 跟著飄出螢幕;對 html+body 阻斷捲動鏈外溢可大幅減少各種畫面飄移(不影響容器內正常捲動)。',
      '★ v3.15.97【版本鏈】本輪只改 index.html + game_changelog.js。版本同步點 _GAME_LOADED_VERSION + _vers[index.html / game_changelog.js] 全 v3.15.96→v3.15.97;sw.js(v3.5.87)/admin_panel.js(v3.15.90)/hero_db.js(v3.15.89)/main.css(v3.15.79)/world-boss.js(v3.15.51)/world-boss-ui.html(v3.15.69) 未改。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.76)。',
    ],
  },
  // v3.15.96 — 帳號污染根治(甲):heroLevels 字串版接齊
  {
    ver: 'v3.15.96',
    date: '2026-06-23',
    brief: [
      '🛡️【存檔同步再強化:從源頭杜絕「資料倒退」誤判】先前極少數帳號(尤其資料修復後)會因為<b>雲端殘留了已經不擁有的舊英雄等級</b>,墊高了比較基準,導致正確的存檔被誤判成「資料倒退」而存不上雲端。',
      '   ・這版把<b>英雄等級的存/讀/合併</b>全面改為以「你實際擁有的乾淨版」為準(技術上用字串版繞過雲端不刪舊資料的限制),讓殘留的幻影等級不會再被合併進來。',
      '   ・老師後台的清污染/刪英雄工具也同步配合,清掉的東西不會再被舊資料復活。',
      '   ・<b>這是存檔核心的改動</b>,請老師先在 1～2 個帳號驗證正常(尤其曾回報過倒退的帳號)再全班更新。',
    ],
    items: [
      '★ v3.15.96【heroLevels_s 端到端接齊 index.html】比照已驗證的 playerBackpack_s 模式,把 heroLevels 的字串版接齊四處:① 主存檔序列化新增 heroLevels_s: JSON.stringify(_heroLevels)(經 _fbSaveLive 透傳,live/safe 槽同步取得)② _lxpsObjFromSlot 新增 _LXPS_PREFER_S={heroLevels:1},僅對 heroLevels 改「優先採信 _s」→ 三槽逐鍵 max-merge 以乾淨字串版為來源,map 深合併殘留的幻影等級不再被合進 _mergedSix/merged.heroLevels(其餘 5 養成表維持原「先 map 後 _s」行為,不影響既有 GM 工具)③ _applySafeData 載入時優先採信 data.heroLevels_s(換成乾淨版後,再走既有 救援覆蓋 / 本地↔雲端 max-merge / maxLv 補檢查)④ 三支 GM 清污染工具(汙染清除 setDoc 主+live、刪英雄 admin_delete _patch、暴增收回 admin_scrub _patch)寫乾淨 heroLevels 時同步寫 heroLevels_s,否則下次載入採信舊 _s 會把剛清掉的污染復活。',
      '★ v3.15.96【安全邊界】只動 heroLevels,完全不改 heroExp/heroSkillLevels/heroStatPoints/heroStatInvested/heroCapsuleInvested/heroBurstLevels/heroTraitLevel 的合併行為(heroStatInvested_s/heroSkillLevels_s 本已各自處理;heroStatPoints 由素質點不變式 free+invested==lv-1 自癒,輸入 heroLevels 變乾淨後更穩)。舊存檔(尚無 heroLevels_s)在 _lxpsObjFromSlot 找不到 _s 時 falls back 原 map 行為、不變;學生正常存檔一次後三槽 heroLevels_s 即接齊。v3.15.76 的 unlockedHeroes 對帳守門仍在 → 過渡期即使 _s 尚未鋪滿,也不會誤判倒退(雙保險)。',
      '★ v3.15.96【未根治部分(待專門處理)】此版只把 heroLevels 補成字串版(逐欄位法/甲)。Firebase set(merge:true) 對 map 深合併不刪 key 的根本問題,徹底解法是主文件改 merge:false 整份覆蓋(乙·退役所有 _s 繞道),屬存檔核心架構改動、需獨立測試。登入困難(慢校網/改版卡載入)另由 sw.js 持久快取(v3.5.87)處理,真‧秒開(重檔 cache-first)為後續 B2。',
      '★ v3.15.96【版本鏈】本輪只改 index.html + game_changelog.js。版本同步點 _GAME_LOADED_VERSION + _vers[index.html / game_changelog.js] 全 v3.15.95→v3.15.96;sw.js(v3.5.87)/admin_panel.js(v3.15.90)/hero_db.js(v3.15.89)未改。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.75)。',
    ],
  },
  // v3.15.95 — 練習營獎勵防跨帳號錯置(共用平板)
  {
    ver: 'v3.15.95',
    date: '2026-06-23',
    brief: [
      '🔒【修正:共用平板上練習營獎勵可能算到別人帳號】之前練習營在等待時賺到的獎勵,是先暫存在「這台裝置的今天」;在共用 iPad 上,如果前一位同學練習後沒按「進入遊戲」就關掉,下一位登入結算時可能把前一位賺的獎勵算進自己帳號。',
      '   ・現在把暫存獎勵<b>綁定到各自的帳號</b>,換人登入不會再互相算到對方的獎勵,獎勵只會回到當初練習的那個帳號。',
    ],
    items: [
      '★ v3.15.95【練習營 bank key 綁 uid index.html】_campBankKey 由 lxps_camp_bank_{日期}(只綁日期·共用裝置同日共用一份)改 lxps_camp_bank_{uid}_{日期}(uid 取 _campState.uid,登入時即設定)→ 共用 iPad 上甲未按進入就關掉、乙接著登入時,_campLoadBank/_campSaveBank/_campSettleBank 各讀各自 uid 的暫存,不會把甲的本地存獎(每日上限 1000 幣/3 水晶)結算進乙帳號。結算本身仍走 _fbCompensatePlayer(寫 playerBackpack/_s + heroLevels_s + heroStatPoints_s + taiwanTreasureData_s 字串版,對 Firestore set(merge:true) map 深合併安全)。',
      '★ v3.15.95【說明】sw.js(v3.5.87)/載入讀條整合(v3.15.94)不碰帳號資料(sw.js 跳過 firestore.googleapis.com、仍 network-first)→ 無污染風險。知識王換科目牌堆 deck 隨 kingChallenge 整包存(與既有答題暫存同),為科目名字串陣列、每次開彈窗重洗、不參與任何存檔守門 → 無害(更正 v3.15.92 註記「不進雲端白名單」不精確)。',
      '★ v3.15.95【版本鏈】本輪只改 index.html + game_changelog.js。版本同步點 _GAME_LOADED_VERSION + _vers[index.html / game_changelog.js] 全 v3.15.94→v3.15.95;sw.js(v3.5.87)/admin_panel.js(v3.15.90)/hero_db.js(v3.15.89)未改。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.74)。',
    ],
  },
  // v3.15.94 — 練習營整合啟動載入進度條 + 載入機制可靠性強化
  {
    ver: 'v3.15.94',
    date: '2026-06-23',
    brief: [
      '🎒【課堂練習營 × 啟動載入進度整合】現在練習營會和遊戲啟動的「資源載入中」進度條<b>合而為一</b>:',
      '   ・一邊載入一邊就能練習答題,練習營<b>頂端會顯示資源載入進度(📦 資源載入中 X%)</b>。',
      '   ・等<b>資源載入完成、而且帳號也連線好</b>,頂端才會出現「<b>✅ 帶獎勵進入遊戲</b>」,按下就帶獎勵進場。',
      '   ・如果載入條跑完了、帳號卻還沒連上,就<b>繼續留在練習營邊玩邊賺</b>,連上後再進場結算。',
      '⚡【載入機制可靠性強化】更新了背景載入規則,讓<b>開過一次遊戲的裝置之後更不容易卡在載入畫面</b>(慢網更快用上已下載好的版本;線上仍會即時抓最新版)。',
    ],
    items: [
      '★ v3.15.94【練習營整合 boot-loader index.html】#boot-loader 的 _bootLoader IIFE 對外公開 window._bootLoaderPct(render 每拍寫)/_bootLoaderDone(done 設 true、session 早退路徑也設 true、啟動設 false);練習營 _campUpdateBanner 改:新增 _campCanEnter()=（_bootLoaderDone && _campState.ready）才顯示「✅ 帶獎勵進入遊戲」;未達標時依 (_bootLoaderDone, _campState.ready) 顯示三態文案 + 未載完內嵌一條資源載入進度條(讀 _bootLoaderPct)。_campStart 輪詢 1000ms→700ms 且每拍呼叫 _campUpdateBanner(資源 % 即時跑動、資源/登入任一就緒即轉場);hook2 _campMarkReady 仍設 ready 旗標(雙保險)。對齊老師:載入+登入皆完成可直接進、載入完成未登入續留練習營。',
      '★ v3.15.94【sw.js v3.5.87 載入可靠性(另檔·高風險建議先 1~2 台 iPad 驗證)】SHELL_CACHE 由 lxps-shell-+SW_VERSION 改固定 lxps-shell-v1(跨版本保留「上次成功完整載入」當 fallback)→ 根治「改版後新 shell 快取尚未填好、activate 又刪掉舊版快取 → 慢校網逾時想 fallback 卻撈不到 → 卡住下載不完」;networkFirstShell 逾時 5000→2500ms(慢網更快回快取)、fallback 先查本 shell 快取再退查全快取庫 caches.match(belt-and-suspenders);仍為 network-first(線上先抓最新→更新即時生效不變,非 cache-first 故無「新版延後」副作用)。SW_VERSION v3.5.86→v3.5.87 讓 iPad 取得新 sw.js。install 仍以 cache:reload 重抓 SHELL_URLS 覆蓋成最新。',
      '★ v3.15.94【誠實限制】此 sw.js 改動讓「開過一次的回頭裝置」幾乎一定進得去且更快,但「某台第一次全新開、且當下網路嚴重壅塞」仍需把資源下載一次(物理限制)→ 建議課前讓每台 iPad 先在好網路開過一次熱身。若日後要更激進的「真‧秒開」(重檔 cache-first,代價是新版延後一個開啟+需更新提示),可再評估 B2。',
      '★ v3.15.94【版本鏈】本輪改 index.html + game_changelog.js + sw.js。版本同步點 _GAME_LOADED_VERSION + _vers[index.html / game_changelog.js] 全 v3.15.93→v3.15.94;sw.js SW_VERSION v3.5.86→v3.5.87(sw.js 不在 _vers 字典);admin_panel.js(v3.15.90)/hero_db.js(v3.15.89)/world-boss*/arena.js/adv_quiz_db.js 未改。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.73)。',
    ],
  },
];
