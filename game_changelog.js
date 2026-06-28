// ════════════════════════════════════════════════════════════════════════
//  game_changelog.js  —  LXPSGAME 更新日誌
//  最後更新:2026-06-29  / 目前主程式版本:v3.16.72(素質四欄兩行排版修正 + 四說明視窗字放大×2 + 技能/爆發升級即開窗+音效改點;前版 v3.16.70 英雄圖鑑放大改版)
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
  // v3.16.65 — 序號兌換改名「🎁 GM獎勵」+ 老師課堂獎勵改自行領取(待領取)
  {
    ver: 'v3.16.65',
    date: '2026-06-28',
    brief: [
      '🎁【「序號兌換」變身「GM獎勵」】關卡頁右下角的「序號兌換」鈕改名為「🎁 GM獎勵」,視窗放大、字更大更好讀。裡面除了原本的序號兌換,還多了「課堂獎勵收件區」——老師發給你的課堂獎勵會出現在這裡,顯示你的「表現優良事蹟」(像是期末第一、滿分、進步前三…)和獲得的獎項,按下「✅ 確認領取」才會存進你的帳號。有獎勵可領時,「GM獎勵」鈕上方會冒出紅色「有可領取獎勵」標籤提醒你。',
    ],
    items: [
      '★ v3.16.65【課堂獎勵改「自己領取」·玩家面向】老師發課堂獎勵的方式由「直接發到你帳號」改成「放進你的收件箱、由你自己確認領取」:好處是在共用 iPad 上,別人登入時看不到也領不到你的獎勵(尤其 UR 英雄),獎勵只會在「你本人登入並按確認領取」時才存進你的帳號,更安全、不會發錯人;每份獎勵只能領一次(換裝置/重新整理也不會重複),領取後畫面會自動重新整理讓獎勵生效。',
      '★ v3.16.65【後台·老師端】課堂獎勵發放頁新增「🏅 表現優良事蹟」(8 個預設可複選 + 自由補充);「發放」改為寫入該學生收件箱(待領取),學生下次登入在「🎁 GM獎勵」看到事蹟+獎項並自行「確認領取」入帳(嚴防共用平板 UR 發錯人/帳號污染)。送禮記錄、同名候選挑選維持不變。',
      '★ v3.16.65【版本／範圍】本輪改 index.html + admin_panel.js + game_changelog.js + firestore.rules(新增 gmClassRewards / gmClassRewardClaims·老師另部署);hero_db.js 僅版號對齊免重傳。七點版本同步 → v3.16.65;GAME_CHANGELOG 維持 20 筆(移除最舊 v3.16.45)。',
    ],
  },
  // v3.16.64 — 老師回信改右下角小視窗+鈴聲通知
  {
    ver: 'v3.16.64',
    date: '2026-06-28',
    brief: [
      '🔔【老師回覆通知更貼心】老師回覆你的 BUG／問題回報後，登入時畫面右下角會跳出小視窗加上提示鈴聲，點一下就能看老師回覆的完整內容；看完關閉後就不會再重複提醒。即使老師回覆時你不在線上也沒關係，下次上線會立刻通知。',
    ],
    items: [
      '★ v3.16.64【老師回信通知改版·index.html】原本登入會直接蓋一個置中大視窗，改成在畫面右下角彈出一張小通知卡(仿老師端收到回報的小視窗)＋鈴聲提示(sfx-rescue-chime)：新增 _showAdminReplyToast(顯示老師回覆前 40 字摘要＋若有多則顯示還有 N 則)，登入檢查 _checkUnreadBugReplies 偵測到未讀回信時改彈此小卡。點小卡→開既有「老師回覆你的回報」完整視窗(_showAdminReplyPopup·看完按「我知道了」即標記已讀、不再顯示)；右上角 ×→只收起小卡(未讀，下次登入再提醒，確保不漏看)。',
      '★ v3.16.64【範圍/安全】老師端按「儲存回覆」沿用既有 _fbUpdateBugReportAdminReply(寫 adminReply＋adminReplyRead:false)完全不變；玩家標記已讀沿用既有 _markPendingBugRepliesAsRead；不需改 firestore.rules(bugReports 既有權限已允許玩家讀自己回報＋標記已讀)。只改 index.html；admin_panel.js／hero_db.js 僅版本對齊免重傳。七點版本同步→v3.16.64。GAME_CHANGELOG 維持 20 筆(移除最舊 v3.16.44)。',
    ],
  },
  // v3.16.63 — 學生名冊上線(student_roster.js 補完 706 筆)
  {
    ver: 'v3.16.63',
    date: '2026-06-28',
    brief: [
      '🔍【老師找學生大升級】學生名冊已補上全校 706 筆資料！現在課堂獎勵發放與玩家活動查詢，可以用中文真名搜到全校任何一位同學，候選清單也會顯示班級座號方便核對。',
    ],
    items: [
      '★ v3.16.63【學生名冊上線·student_roster.js + index.html】老師補完 student_roster.js(window._STUDENT_ROSTER 706 筆·每筆 class/seatNo/surname/fullName)取代原本空白名冊。index.html 把名冊破快取版號 _LXPS_FILE_VERSIONS[student_roster.js] 由 20260524→20260628·讓學生端立即載入新名冊。→ _fbAdminFindPlayersByName 階段1.5 名冊反查全校生效(中文真名搜尋)·_classSeatCode4 班級座號顯示生效(課堂獎勵候選清單)·好友面板/排行榜/圖鑑短碼標籤一併補上。',
      '★ v3.16.63【版本/範圍】七點版本同步 → v3.16.63。本輪改 student_roster.js(名冊本體·需上傳 repo) + index.html(名冊版號+主版本) + admin_panel.js(版本對齊) + game_changelog.js;hero_db.js 未改內容·僅 manifest 版號對齊免重傳。⚠ 名冊有 29 組「班級+座號」重複(多為跨屆轉入/重設帳號學生·不影響真名搜尋·僅班級座號碼會重複)·留待日後校正。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.43)。',
    ],
  },
  // v3.16.62 — GM 玩家搜尋:設計師學生中文真名備援(補名冊缺漏)
  {
    ver: 'v3.16.62',
    date: '2026-06-28',
    brief: [
      '🔍【老師找學生更準了】課堂獎勵發放與玩家活動查詢，現在就算某位設計過英雄的同學沒被收進名冊，也能用中文真名搜到他了。',
    ],
    items: [
      '★ v3.16.62【設計師名冊備援·index.html】_fbAdminFindPlayersByName 階段 1.5：原本只掃 student_roster.js 的 _STUDENT_ROSTER 反查真名→email；若該名冊缺某生或未上傳/未載入則搜不到。新增備援：_STUDENT_ROSTER 沒命中時，改用 index.html 內建的 STUDENT_DESIGNER_HEROES(約 30+ 名設計過英雄的學生·含 fullName 真名)反查 email→查玩家 doc(matchType designer)。讓設計過英雄但不在名冊的學生(如高廷睿 lsps110127 5年4班)可用中文真名搜到。課堂獎勵+活動查詢共用此函式·兩邊同時生效。',
      '★ v3.16.62【版本/範圍】七點版本同步 → v3.16.62。本輪改 index.html + admin_panel.js(版本對齊) + game_changelog.js(hero_db.js 未改內容·僅 manifest 版號對齊·免重傳)。⚠ 非設計師且已取暱稱、且不在 student_roster.js 的學生·仍需補完 student_roster.js 才能用真名搜到(可改用學號/班級座號/信箱搜)。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.42)。',
    ],
  },
  // v3.16.61 — GM 課堂獎勵/活動查詢中文姓名搜尋根治 + 同名候選班級座號挑選 + 帳號轉移修復
  {
    ver: 'v3.16.61',
    date: '2026-06-28',
    brief: [
      '📨【會員資料新增「帳號轉移功能申請」按鈕】在「會員資料」編輯畫面的 E-mail 信箱欄位下方，新增了「帳號轉移功能申請」按鈕。畢業換新帳號、或想把舊帳號的進度搬到新帳號時，可直接從這裡申請（功能同首頁左上角，每天限申請一次）。',
      '✅【修好「轉移後新帳號無法登入」】之前申請帳號轉移、老師搬好資料後，新帳號登入會卡在「載入失敗」進不去——這次已修正，新帳號現在可以正常登入並看到搬過來的進度。',
    ],
    items: [
      '★ v3.16.61【中文姓名搜尋根治·index.html】GM 課堂獎勵發放 + 玩家活動記錄查詢共用的 _fbAdminFindPlayersByName：玩家真名/暱稱實際存於 players 文件的 displayName 欄位(並無 name 欄位)，原階段1精確查 name 永遠 0 筆、階段2全掃讀 _data.name 為空字串被 if(!_name)return 全略過(連名冊 fullName 比對都跑不到)。改為查/讀 displayName(保留 name 後備)，中文姓名(未取暱稱者=真名、已取暱稱者=暱稱)現可精確+子字串命中;校外帳號(無真名/學號/名冊)新增信箱搜尋:輸入含 @ → 精確查 email、純文字片段≥3字 → 模糊比對 email(純數字輸入不走此路·避免班級碼誤配)。',
      '★ v3.16.61【課堂獎勵·大量貼上+同名候選挑選·admin_panel.js】姓名輸入沿用逗點/換行分隔(可一次大量貼上)；單筆命中自動入列、可逐一移除；同名多筆改列候選清單並顯示每位的班級座號(走 _classSeatCode4)讓老師核對是誰、點選加入(可複選)；查無此人另列並提示改用學號/班級座號/信箱/uid。發放對象以確認後的清單為準。',
      '★ v3.16.61【活動查詢顯示會員資料·admin_panel.js+index.html】玩家活動記錄查詢的玩家卡新增會員資料區塊，顯示玩家自填的 暱稱/信箱/身分/出生年(換算約略年齡)/性別/年級/平台，每次查詢即時讀最新(玩家更新後 GM 同步看到)；_fbGetMemberProfile 回傳加 updatedAt 供顯示最後更新時間；玩家未填則顯示尚未填寫。',
      '★ v3.16.61【帳號轉移殘留根因修復·index.html】_fbMigrateAccountData 整份複製舊帳號存檔時會連 ownerUid 一起搬進新帳號，導致新帳號登入時 gameCloudLoad 的 Layer B 偵測 ownerUid(舊)≠登入 uid(新) 判為外來資料拒絕套用、卡載入失敗。修法：主檔 + saves/live + saves/safe 三處 ownerUid 一律改寫為新 uid(只讀舊寫新，不動母本)。',
      '★ v3.16.61【會員資料加轉移鈕 + 每天限一次·index.html】會員資料編輯模式 E-mail 欄下方新增帳號轉移功能申請鈕(首登模式不顯示)，點擊開啟既有 _showAccountTransferModal。轉移彈窗(首頁左上角 + 會員資料兩入口共用)新增每日一次限制：以雲端申請紀錄 createdAt 對比台灣當日，今日已申請則顯示提示橫幅 + 停用送出鈕 + 送出守門擋下；送出成功另寫 localStorage 當日旗標備援。',
      '★ v3.16.61【版本/範圍】七點版本同步 _GAME_LOADED_VERSION + _vers[index.html/hero_db.js/admin_panel.js/game_changelog.js] + ADMIN_PANEL_VERSION + 本條 ver → v3.16.61。本輪改 index.html + admin_panel.js + game_changelog.js(hero_db.js 未改內容·僅 manifest 版號對齊·免重傳)。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.41)。',
    ],
  },
  // v3.16.60 — 召喚物行動時在主人卡牌跳趣味標籤
  {
    ver: 'v3.16.60',
    date: '2026-06-28',
    brief: [
      '🎉【召喚物出手更有戲了】陰陽師的式神、操偶師的傀儡、喚龍使的天青龍在場上幫忙時，會在「主人的卡牌」上跳出可愛的提示標籤：朱雀治療！、青龍助攻！、玄武白虎守護！、操偶／城牆守護！、天青龍守護！——一眼就知道是哪隻召喚物在出力。',
      '🐉【青龍助攻慢半拍登場】青龍追擊的傷害數字和「青龍助攻！」標籤會比原本的攻擊慢 0.5 秒才跳出來，跟原本的傷害數字錯開、看得更清楚。',
    ],
    items: [
      '★ v3.16.60【召喚物笑果標籤·index.html】五隻召喚物在「主人卡牌」跳 bannerFX 標籤：朱雀治療！(治療友方·主人＝陰陽師)／青龍助攻！(追擊友方目標·主人＝陰陽師)／玄武白虎守護！(代承陰陽師傷害·主人＝陰陽師)／操偶守護！‧城牆守護！(操偶師·依當前 _puppetLabel 狀態)／天青龍守護！‧至尊天青龍守護！(喚龍使‧蜜鶴林本體·依當前 _dlabel 狀態)。原本守護顯示的「-扣血數字」移到戰鬥紀錄文字，卡牌 banner 改顯示笑果文字。',
      '★ v3.16.60【青龍助攻延後 0.5 秒·index.html】青龍追擊的傷害套用＋「青龍助攻！」標籤改用 _pSetTimeout 延後 0.5 秒(避免和原本傷害數字疊在一起)；立即設防遞迴旗標、capture 區域變數，延後回呼會重新確認目標／陰陽師／青龍式神都還在場才執行，戰鬥結束或式神陣亡則略過。pause-aware：暫停中會排隊、解除後再跑，並自帶 fallback 不卡死。',
      '★ v3.16.60【範圍/版本】只改 index.html(doDmg／doHeal hook 五處 bannerFX)；admin_panel.js＋game_changelog.js 僅版本對齊。七點版本同步 → v3.16.60。未來新增召喚物比照此模式加標籤。「替身！」「反擊！」等其他既有機制不動。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.40)。',
    ],
  },
  // v3.16.59 — 鬥技場動態影片背景
  {
    ver: 'v3.16.59',
    date: '2026-06-28',
    brief: [
      '🏟️【鬥技場換上動態背景】鬥技場主頁加入全螢幕動態背景影片，畫面更有氣勢！若影片還沒下載好或讀取失敗，會自動顯示原本的鬥技場背景圖，不影響使用。',
    ],
    items: [
      '★ v3.16.59【鬥技場動態影片·index.html】#arenaLobbyOverlay 第一子層新增 <video id=arena-bg-video>（鬥技場動態.mp4·autoplay/loop/muted/playsinline·object-fit:cover 全螢幕·opacity:0 + onloadeddata 淡入·onerror→display:none 露出靜態 鬥技場.png）。作法同召喚星空動態影片，但 z-index 用 -1（非召喚頁的 0）：鬥技場 .al-body 內容為正常流(static)，影片若用 z0 會蓋住內容，改用負 z 讓影片畫在「本元素背景圖(png+漸層)之上、正常流內容之下」（.al-header 為 sticky z5 亦在其上）。',
      '★ v3.16.59【需上傳 repo + 版本】⚠ 老師需上傳 repo 根目錄：鬥技場動態.mp4（缺檔則鬥技場頁自動隱藏影片·露出原本的鬥技場.png）。七點版本同步 → v3.16.59。GAME_CHANGELOG trim 至 20 筆（本批新增 v3.16.55~59·移除最舊 v3.16.39~35）。',
    ],
  },
  // v3.16.58 — 自動戰鬥「每位英雄 AI 行動設定」
  {
    ver: 'v3.16.58',
    date: '2026-06-28',
    brief: [
      '🤖【自動戰鬥可以細調每位英雄了】開啟「自動戰鬥」前，會先跳出設定視窗，讓你為隊上「每一位英雄」分別決定 AI 要不要做這些行動：使用普通攻擊／技能1／技能2／極限爆發／優先賣物品卡蓄能／優先使用物品卡／優先使用治療復活技能／優先攻擊HP最高的目標／優先攻擊HP最低的目標。',
      '⚙️【打到一半也能改】自動戰鬥進行中，點畫面會出現「是否取消自動戰鬥」視窗，裡面多了「⚙ 修改AI設定」按鈕，可以隨時調整、下一個我方行動就生效。設定會記住並同步雲端，換裝置也還在。',
      '💡【預設不變】沒有特別調整時，AI 行為跟以前完全一樣；這只是讓你能進一步客製化每位英雄的打法。',
    ],
    items: [
      '★ v3.16.58【每位英雄AI設定·index.html】新增 window._autoBattleHeroCfg（綁英雄名·9 布林開關 atk/s1/s2/burst/sell/useItem/healRevive/tgtHigh/tgtLow）+ localStorage(lxps_auto_battle_cfg) + 雲端同步（_buildSafeData 寫 autoBattleCfg / autoBattleCfg_s·_applySafeData 優先採信 _s·自寫欄位不需改 firestore.rules·不在英雄存檔載入路徑）。預設值=等同舊行為（普攻依天賦判定·其餘 true·目標兩項 false）。',
      '★ v3.16.58【設定視窗·index.html】toggleAutoBattle 開啟前先彈 showAutoBattleSettings({live:false, onConfirm:_doEnableAutoBattle})；showAutoBattleConfirm（進行中）新增「⚙ 修改AI設定」鈕 → showAutoBattleSettings({live:true})（只存檔不重啟）。視窗 25 秒未操作自動套用並繼續（防卡死）·空隊伍直接放行·任何例外都不擋流程。畫面點擊攔截 excluded 加 auto-confirm-settings / auto-battle-settings-ov。新增 #auto-battle-settings-ov CSS（iPad 友善開關·≥44px 觸控·可捲動·z 9960）。',
      '★ v3.16.58【_realAiAct 閘門·index.html】只在「玩家側 p1 + 自動戰鬥開啟 + 該英雄有設定」時生效（敵方 p2 與未設定英雄完全不受影響）。爆發/技能(canS1b/canS2b 折入 s1/s2 開關·涵蓋治療段與攻擊段)/普攻/賣卡蓄能/物品卡(裝寵物·復活/治療/攻擊道具)/治療技能 各加「不允許就略過、往下一個選項走」；目標 HP 最高/最低（恰好勾一項時生效·XOR）。最後一定有「休息」收尾且永不被閘門擋 → 任何勾選組合都會結束回合、不會卡死。',
    ],
  },
  // v3.16.57 — 戰鬥存檔教學放大 + 每次提醒可暫停存檔
  {
    ver: 'v3.16.57',
    date: '2026-06-28',
    brief: [
      '📖【戰鬥存檔教學放大】「戰鬥存檔功能教學」的金色說明框裡的文字全部放大一倍，看得更清楚。',
      '⏸️【每次都提醒可暫停存檔】很多同學不知道戰鬥中可以暫停存檔，現在新手教學的「第一步」一定會先提醒「右上角可以暫停，暫停就會存檔」；之前的「不再顯示」勾選也移除了（共用 iPad 每位同學都看得到）。',
    ],
    items: [
      '★ v3.16.57【教學金框放大·index.html】._tut-pause-hint-box 系列 CSS 字級 ×2（標題 18→36px·內文 15→30px·勾選 14→28px·checkbox 28px）。',
      '★ v3.16.57【暫停提醒每次顯示·index.html】移除 localStorage(pauseHintDismissed) 守門與「不再顯示」勾選；於 TUTORIAL_STEPS 最前插入一步（target:null·side:center·標題「⏸ 戰鬥可以暫停存檔！」）→ 每次走教學（含 ❓ 重看）第一步都先提醒。',
    ],
  },
  // v3.16.56 — 戰鬥 LOG 展開/收合 + 移除雲端同步洗頻
  {
    ver: 'v3.16.56',
    date: '2026-06-28',
    brief: [
      '📜【戰鬥紀錄可以展開看全文了】戰鬥畫面的戰鬥紀錄區右上角新增「📜 展開／✖ 收合」按鈕，展開時紀錄會放大覆蓋整個區域、可往上捲讀完整戰鬥過程；進入下一場戰鬥會自動收合。原本的戰鬥指令排版完全不變。',
      '🧹【移除洗頻訊息】移除戰鬥紀錄裡頻繁出現的「☁️ 雲端已同步」洗頻訊息（存檔很頻繁，改為只記在開發者主控台，不再洗版戰鬥紀錄）。',
    ],
    items: [
      '★ v3.16.56【LOG 展開/收合·index.html】#sb 第一子層新增 #log-toggle-btn（position:absolute·top4/right8·z60·不佔排版流 → 不影響任何戰鬥指令位置）；toggleBattleLog 展開時 #log 改 position:absolute inset:0 覆蓋 #sb（z55·深底·padding 44px）·收合清回 inline 空字串還原 main.css；startTurn round1 呼叫 _collapseBattleLog 自動收合。全程不修改 #action-panel 與任何指令按鈕。',
      '★ v3.16.56【移除同步洗頻·index.html】兩處 log(☁️雲端已同步 / 部分) 改為僅 console.log，不再寫入戰鬥 LOG。',
    ],
  },
  // v3.16.55 — 死亡宣告對日本/埃及小怪也生效
  {
    ver: 'v3.16.55',
    date: '2026-06-28',
    brief: [
      '💀【死亡宣告對日本／埃及小怪也生效了】英雄技能「死亡宣告」原本只對台灣關卡的路邊小怪生效（2 回合後強制剩 1 HP），現在日本（河童等）與埃及（木乃伊貓等）關卡的路邊小怪也一樣生效。',
      '💡【說明】菁英小怪（九尾空貓怪／綠竹筍小妖／茶葉精靈）、各關頭目、以及免疫即死的死神／暗龍王之骸 不受影響，維持原本規則。',
    ],
    items: [
      '★ v3.16.55【死亡宣告擴關·index.html】死亡宣告的「路邊小怪」判定名單由原本只含台灣 MINI_MONSTERS，擴充為 concat(MINI_MONSTERS, MINI_MONSTERS_JP, MINI_MONSTERS_EG)（以 typeof 守門避免未定義）。玩家施放路徑（L≈45118）與 deathmark 到期結算路徑（L≈54484·最後防線）雙處同口徑修正。菁英小怪/BOSS 陣容走 20% 當前 HP 傷害+禁療（上限英雄 Lv×20）·死神/暗龍王之骸 即死免疫·皆不變。',
    ],
  },
  // v3.16.54 — 巫女神樂舞新動畫+音效 + 召喙星空動態影片背景
  {
    ver: 'v3.16.54',
    date: '2026-06-28',
    brief: [
      '🎐【巫女大絕「神樂舞」換新裝】巫女的極限爆發「神樂舞」換上全新的「花瓣飛起」動畫，並加入清脆的「風鈴聲」音效，施放時更有神社祈福的氛圍！',
      '🌌【召喙星空動起來了】召喙星空頁面加入全螢幕動態背景影片，夜空與水面流動更生動；原本的流星特效保留，水面漣漪改由影片呈現。（若影片還沒下載好，會先顯示原本的星空背景圖，不影響召喙。）'
    ],
    items: [
      '★ v3.16.54【神樂舞特效·index.html】爆發 VFX case 神樂舞：全螢幕 GIF 由「秋天楓葉飄落.gif」改「花瓣飛起.gif」（移除 timeout 維持 3200ms）；音效新增 playSfx(sfx-windchime,0.85)（新註冊 <audio id=sfx-windchime src=風鈴聲.mp3>·與既有 sfx-burst/sfx-heal 並存）。',
      '★ v3.16.54【召喙星空動態影片·index.html】#summon-overlay 第一子層新增 <video id=summon-bg-video>（召喙星空動態.mp4·autoplay/loop/muted/playsinline·z-index:0 覆蓋背景圖·object-fit:cover 全螢幕·opacity:0+onloadeddata 淡入·onerror→display:none 露出靜態背景圖 fallback）；#summon-stars 流星特效保留；#summon-river 河面波紋漣漪層改 display:none 隱藏。',
      '★ v3.16.54【需上傳 repo + 版本】⚠ 老師需上傳 repo 根目錄：花瓣飛起.gif、風鈴聲.mp3、召喙星空動態.mp4（缺檔則神樂舞無新動畫/無風鈴聲·召喙頁影片自動隱藏露出靜態星空圖）。六點版本同步 → v3.16.54。GAME_CHANGELOG trim 至 20 筆（移除最舊 v3.16.34/v3.16.33）。'
    ],
  },
  // v3.16.53 — 素質50%上限說明補完 + BOSS/世界BOSS依攻擊素質強制減傷
  {
    ver: 'v3.16.53',
    date: '2026-06-28',
    brief: [
      '⚖️【BOSS 變得更耐打·攻擊越高越會擋】所有冰險關卡 BOSS 與世界 BOSS（龍王）現在會依「攻擊力」自動減免受到的傷害——攻擊力數字就是減傷百分比（例如攻擊 60 的龍王，受到普攻/技能/爆發/一般天賦傷害會減少 60%），最高減 60%。不過「固定傷害」「依 HP 百分比的傷害」「物品卡上有寫傷害數字的攻擊（像飛鏢、煉金術炸彈）」都不會被這個減傷擋下，仍是穿透打滿！',
      '📖【素質說明更完整】英雄圖鑑與新手教學裡的「能力投資」說明，補上 HP 減傷的上限提示：每 1 點 HP +0.2% 減傷，最多減 50%。'
    ],
    items: [
      '★ v3.16.53【BOSS 攻擊素質減傷·index.html】doDmg(L≈39669)玩家HP減傷之後、世界BOSS 5000cap 之前新增 hook：對 _isWorldBossTarget||_zeusIsTrueBoss 的目標，減傷% = min(0.60, (target.atk||0)×0.01)（攻擊素質直接換算·攻擊60→60%·上限60%）；菁英/小怪不套。穿透條件 !opts.fixedDmg && !opts._pierceBossReduce。對世界BOSS=先攻擊減傷、再夾 5000cap。',
      '★ v3.16.53【穿透豁免標記·index.html】固定傷害走 opts.fixedDmg；另對 HP%傷害與物品卡寫死數值傷害補 opts._pierceBossReduce（無副作用旗標）：11 處—神聖鑇擊/死亡宣告BOSS段/魔術閃光含AI/大聲啲哭含AI/暗黑洞含AI/弄壞你的玩具/夢境時光爆發 + 物品卡 atk(L≈51856)。奧汀岡格尼爾/青炎爆破(攻擊·特技混合)、超能衝鋒(攻擊)、惡鬼撲食(特技)維持被減傷。',
      '★ v3.16.53【素質50%上限文案·index.html】HP 減傷 50% 上限（程式本就 min(0.50,hp×0.002)）補進「英雄強化教學 HUT·分配四項能力」頁（STAT_DESCS + 新手教學③本就有「最多減50%」）；受治療放大無上限。',
      '★ v3.16.53【驗證】index.html 20 inline script node --check 全過·0 lone surrogate；四檔版本同步 → v3.16.53。'
    ],
  },
];
