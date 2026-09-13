/* ============================================================================
 * 小英雄小遊戲 — 獨立 Service Worker(minigame/sw.js)v1.34.0(2026-09-08)
 * ★ v1.93.0(2026-09-13・老師「繼續未完成的工作」)：對應 minigame_index.html v1.123.0 + island_db v1.23.0。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.92.0(2026-09-13・老師「繼續」)：對應 minigame_index.html v1.122.0 + island_db v1.23.0。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.91.0(2026-09-13・老師四項)：對應 minigame_index.html v1.121.0 + island_db v1.22.0。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.90.0(2026-09-13・老師五項)：對應 minigame_index.html v1.120.0 + island_db v1.21.0。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.89.0(2026-09-13・老師七項)：對應 minigame_index.html v1.119.0 + island_db v1.20.0。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.88.0(2026-09-13・老師三項)：對應 minigame_index.html v1.118.0(QTE 右側紀錄欄/走路幀/iPad 文字 ×2)。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.87.0(2026-09-13・老師看圖)：對應 minigame_index.html v1.117.0(大廳三顆模式鈕移除、islInstallUrls 掛 window)。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.86.0(2026-09-13・老師六項)：對應 minigame_index.html v1.116.0(完整下載主程式/島名選單/分層造型/上限 50/水面閃光)+ island_db v1.19.0。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.85.0(2026-09-13・老師兩批需求)：對應 minigame_index.html v1.115.0 + island_db v1.18.0。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.84.0(2026-09-12・好友營地唯讀畫面)：對應 minigame_index.html v1.114.0(拜訪模式參觀營地/留言給島主)+ island_db v1.17.0。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.83.0(2026-09-12)：對應 minigame_index.html v1.113.0(?mode=island 直入)+ island_db v1.16.0(零改動)。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.82.0(2026-09-12・iPad 版面實測修正)：對應 minigame_index.html v1.112.0(補 @media 大括號/HUD 兩列/版面修正)+ island_db v1.16.0(零改動)。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.81.0(2026-09-12・除錯+全域放大)：對應 minigame_index.html v1.111.0(islZk zoom 座標修正/zoom 1.3 放大/除錯守門)+ island_db v1.16.0(零改動)。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.80.0(2026-09-12・接續好友連線合作)：對應 minigame_index.html v1.110.0(拜訪好友的島完工)。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.79.0(2026-09-12・老師四項修正)：對應 minigame_index.html v1.109.0(主角改像素圖/移動鏡像修正/水域全阻擋/採集簡化/字體改中黑體)+ island_db v1.16.0。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.78.0(2026-09-12)：對應 minigame_index.html v1.107.0(🏝 營地留言板+阿獺委託板)+ island_db v1.14.0。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.77.0(2026-09-12)：對應 minigame_index.html v1.106.0(🏝 好友信箱)+ island_db v1.13.0。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.76.0(2026-09-12)：對應 minigame_index.html v1.105.0 + island_db v1.12.0。activate 白名單新增 ISLAND='lxps-mini-island-v1'(首頁「完整下載安裝荒島求生」由頁面端寫入的快取,SW 換版不清除;fetch 各策略 caches.match 本來就查所有快取)。
 * ★ v1.75.0(2026-09-12)：對應 minigame_index.html v1.104.0(🏝 戰鬥擴充 甲乙丙)+ island_db v1.11.0。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.74.0(2026-09-12)：對應 minigame_index.html v1.103.0(🏝 荒島存檔三道守門)+ island_db v1.10.0(零改動)。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.73.0(2026-09-12)：對應 minigame_index.html v1.102.0(場景改 .jpg)+ island_db v1.10.0。本檔僅版號同步。
 * ★ v1.72.0(2026-09-12)：對應 minigame_index.html v1.101.0(MG_IMG_VER 4、遮罩重校)+ island_db v1.9.0。本檔僅版號同步。
 * ★ v1.71.0(2026-09-12)：對應 minigame_index.html v1.100.0(荒島 動態背景+天氣+台灣化)+ minigame_island_db.js v1.8.0。本檔僅版號同步。
 * ★ v1.70.0(2026-09-12)：對應 minigame_index.html v1.99.0(荒島 P4-b 動物訓練師)+ minigame_island_db.js v1.7.0。本檔僅版號同步。
 * ★ v1.69.0(2026-09-12)：對應 minigame_index.html v1.98.0(荒島 P4-a 貝幣商店+自然圖鑑)+ minigame_island_db.js v1.6.0。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.55.0(2026-09-09・老師需求)：護盾型/控場型英雄第二效果改版＋對手爆發預告標籤。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.54.0(2026-09-09・老師需求)：回復型英雄爆發追加淨化易傷/封印/魅惑,比照大對抗巫女/米鈴。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.53.0(2026-09-09・老師需求)：登入後小遊戲選單新增最愛收藏(上限10)+只顯示最愛切換。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.52.0(2026-09-09・老師需求)：攻擊時序改玩家先攻擊間隔0.5秒對手才攻擊；爆發演示名稱字體/動畫比照大對抗、
 *   傷害治療狀態全部延後到動畫播完才生效。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.51.0(2026-09-09・老師需求)：算數射擊打中正確答案不再消除周圍錯誤目標。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.50.0(2026-09-09・老師需求)：戰鬥卡片字體改圓體/黑體、傷害數字與狀態呈現方式比照大對抗。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.49.0(2026-09-09・老師需求:消消樂加分規則)：四連消+30/五連消+60/combo1~5每層+20 分,進 MG.score。
 * ★ v1.48.0(2026-09-09・老師需求)：卡片受擊移除金色閃光炸開特效,只留點擊星星.gif。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.47.0(2026-09-09・老師需求:消消樂三項＋全體小遊戲兩項)：iPad拖曳只能動一格根治／元素7→5／
 *   combo字放大黑邊圓體字／戰鬥卡立繪裁掉下半部30%／受擊特效改點擊星星.gif。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.46.0(2026-09-09・老師需求:手機版遊玩版面優化)：①100vh→100dvh(iOS 網址列)②功能列壓一行
 *   ③首頁 6 欄 3 列一頁看完 16 關 ④關卡頁作答區再壓一級 ⑤戰鬥卡同步壓縮 ⑥彈窗動作列 sticky 一定按得到
 *   ⑦切到後台/關閉遊戲一律靜音(pagehide+freeze+visibilitychange 共用 mgSilenceAll,含 AudioContext suspend)。
 *   本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.45.0(2026-09-09・老師看圖三項:iPad／PC 版面修正)：①首頁三顆按鈕排成同一行並放大字體
 *   ②關卡頁右欄作答區垂直置中並放大／英雄卡爆發鈕與計量槽拆兩行並放大／極限爆發呼吸光芒+火焰粒子
 *   ③PC與iPad彈窗置中安全化、字級全面放大、圖層不重疊。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.44.0(2026-09-09・老師三項需求)：①首頁「遊戲簡介」改名「遊玩提示」並移到專注課堂複習右邊
 *   ②元素消消樂拖曳跳針根治(中心區判定+單次位移鎖+上下分層同向交換+改用迴避音效)
 *   ③關卡戰鬥 BGM 重複堆疊根治(bgmStop 清 _mgWasPlaying／前景恢復只認 _bgmCur／勝利路徑補停)。
 *   本檔僅版號同步(SHELL 改名讓舊快取失效)。邏輯全在 minigame_index.html(本輪需重傳)。
 * ★ v1.43.0(2026-09-09・老師需求六項＋版號漂移修復)：①戰鬥卡片改版:爆發鈕+能量點移到卡片頭頂(立繪之上),剩餘爆發次數縮小移到HP條下方,
 *   爆發技能說明維持在卡片最底部(全部 9 款小遊戲共用同一份卡片標記,一次改全部生效)②元素消消樂 5×5 棋盤放大(340px→560px 上限)
 *   ③元素消消樂修正「每題解答說明消失」— 根因是共用的 renderQuestion() 一律 show('card-area') 給各引擎的題卡用,
 *   但元素消消樂從不寫入題卡,留下一個空白但仍顯示的框;改為 renderMatch3() 內明確 hide('card-area')
 *   ④元素交換新增位移滑動動畫、補齊元素新增從上方掉落動畫 ⑤COMBO 疊加時追加音階音效,越疊越高(Combo1=Do·Combo2=Re…)
 *   ⑥小遊戲音效整體降低跟大對抗一致(playSfx 補上大對抗同款 0.49 總量折減)。
 *   ★ 版號漂移修復:上一輪(元素消消樂重作)的程式碼實際上早已是 v1.42.0,但 MINI_VERSION／MG_VER 兩處版號常數當時忘記同步 bump,
 *   本檔一直卡在 v1.41.0——這與主程式那邊發現的「版號漂移」是同一種錯，這次直接跳號到 v1.43.0 一併補上。
 *   本檔僅版號同步(SHELL 改名讓舊快取失效)。邏輯全在 index.html(本輪需重傳)。
 * ★ v1.34.0(2026-09-08・老師四項需求):①爆發技能視覺特效放大至全螢幕(#bt-burstfx img.gif 由
 *   70vw×58vh 改 100vw×100vh)②新增爆發技能使用時/爆發充滿可用時兩支專屬音效(sfx-burst-use・
 *   sfx-burst-ready,取代原沿用的 sfx-enter/sfx-recharge)③被擊倒時換播戰鬥失敗 BGM(bgm-lose,
 *   沿用主程式同一支「戰鬥失敗.mp3」)④迷宮探險王地圖走法改為每次隨機生成(mgMazeGenRandom,
 *   6×6 格逐步隨機加牆+BFS 連通性檢查,保證一定走得通;內容題庫/提示文字完全不動,只有路線隨機)。
 *   本檔僅版號同步(SHELL 改名讓舊快取失效)。邏輯全在 index.html(本輪需重傳)。
 * ★ v1.33.1(2026-09-08・老師截圖回報)— 台灣飛飛飛(map)嘉義火雞肉飯題,簡單風問法「嘉義最有名的
 *   小吃是?」跟點地圖答題的機制對不起來(答案該是地名,這樣問卻要學生答小吃名),改成「哪個城市的
 *   火雞肉飯最有名?」與精緻風、遊戲機制一致;順手掃過 map 其餘 65 題確認無同型問題。另修
 *   index.html 載入 minigame_db.js 的版本查詢字串卡在 v1.30.0 沒跟著版號走(快取風險),改用當前版號。
 *   本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.33.0(2026-09-08・老師三項需求):①橫式戰鬥卡片改回佔左欄格線列(不再貼底,填滿計時條下方到答題區
 *   之間的左下空間,直向大卡格式與直式相同)②回復型第二效果基準值調整為 +5(原 +3,後續全面個別化時採
 *   5~8 區間)③64 隻 SSR 的爆發第二效果全部改成逐英雄設計(取自各自在大對抗的真實爆發技能特色,不再是
 *   4 大類共用同一組數值)。本檔僅版號同步(SHELL 改名讓舊快取失效)。邏輯全在 index.html／minigame_db.js
 *   (本輪皆需重傳)。
 * ★ v1.32.2(2026-09-08・老師需求「就是依照大對抗的極限爆發那種呈現方式」):爆發鍵充滿時文字由招式名
 *   改為通用「⚡ 極限爆發」召喚字樣(比照大對抗按鈕慣例),搭配既有金色脈動發光;充能中仍顯示招式名預告,
 *   只套用玩家自己可按的鈕、NPC 卡維持純資訊顯示。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.32.1(2026-09-08・老師需求):戰鬥打擊感升級(受擊三件套:震動+閃紅+立繪頓挫、出手方輕頓挫、
 *   爆發火花放大)+攻擊型爆發改直接傷害(玩家10/NPC20)+易傷第二效果訂正(原誤標中毒,數值3→5)。
 *   本檔僅版號同步(SHELL 改名讓舊快取失效)。邏輯全在 index.html／minigame_db.js(本輪皆需重傳)。
 * ★ v1.31.0(2026-09-08・老師多項需求):①四型爆發各追加第二效果(回復/護盾/攻擊/控場)②爆發演出立繪
 *   改逐英雄裁切位置置中(取自主程式 HERO_IMG_POS,無資料者改 contain 完整顯示)③已登入時過濾成只能選
 *   已解鎖 SSR、訪客不受限(唯讀 players/{uid}.unlockedHeroes)④換英雄選單 z-index 修正(不再被關卡
 *   說明蓋住)⑤選角視窗篩選跳版問題修正(.hm-list 改固定高度)+英雄圖片/文字/視窗放大⑥戰鬥卡片改版
 *   (直式=大對抗式直向大卡只留立繪/HP/爆發技能+效果說明,橫式維持 v1.29.0 貼底小卡)。
 *   本檔僅版號同步(SHELL 改名讓舊快取失效)。邏輯與資料全在 index.html／minigame_db.js(本輪皆需重傳)。
 * ★ v1.41.0(2026-09-08・老師需求「重新排版小遊戲選單頁」)：排行榜/課堂複習按鈕縮短移到標題右方；移除選英雄介紹文與常駐吉祥物泡泡,改成標題下方「遊戲簡介」按鈕點開泡泡視窗；本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.40.0(2026-09-08・老師截圖回報「答對率40%被打倒還拿4星」不合理)：星等改依「本關最低分到理論最高分」百分比評分,≥90%才五星,不再用勝負+HP門檻+爆發次數東拼西湊(HP上限改200後兩道HP門檻幾乎必過的破口)；本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.39.0(2026-09-08・老師截圖回報四項)：HP條比例修正(上限200後寬度失真)/爆發次數與充能點移出爆發鈕改獨立一列/戰鬥模式移除左下角答對提示/職能標籤依型別上色；本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.38.0(2026-09-08・老師需求「檔名改成新的避免跟大對抗混淆」)：本檔正式改名 sw.js→minigame_sw.js；SHELL_URLS 快取清單、離線導覽退回頁改指 minigame_index.html；SHELL 改名讓舊快取失效。⚠ 主程式 index.html 的入口連結需同步改指 minigame/minigame_index.html，見本輪對話說明，不在本次小遊戲更新包內。
 * ★ v1.37.0(2026-09-08・老師需求)：爆發鈕新增兩顆星星次數指示(比照充能點同一套呈現邏輯)；本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.36.0(2026-09-08・老師需求)：受擊音效/特效比照大對抗普攻+新增seal/confuse/revive三型爆發第二效果
 *   +爆發滿槽卡片橘色橫幅視覺；本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.35.0(2026-09-08・老師需求「64隻角色技能平衡」):HP 100→200/CHARGE 3→5/新增爆發上限2次/64隻eff2重新分配
 *   (shield擴大到4隻shd職能、drain·charge統一v:2)/電磁鐵題目邏輯修正;本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.30.0(2026-09-08・老師需求):戰鬥卡片改貼底橫向大卡+爆發完整立繪演出+15 款各換不同戰鬥曲+首頁文案改英雄對戰;本檔僅版號同步(SHELL 改名讓舊快取失效)。
 *   邏輯與資料全在 index.html／minigame_db.js(本輪皆需重傳)。
 * ★ v1.29.0(2026-09-08・老師需求):戰鬥模式「英雄卡 VS NPC + HP + 極限爆發」;本檔僅版號同步(SHELL 改名讓舊快取失效)。
 *   邏輯在 index.html、英雄/爆發資料表 MG_HEROES/MG_BURST_DEF 在 minigame_db.js(本輪需重傳)。
 * ★ v1.28.0(2026-09-08・老師三項需求):①算數大進擊連續答錯3次⇒5秒射擊冷卻、連續答對5次
 *   ⇒「時間暫停」鈕亮起可用一次(凍結畫面3秒) ②視窗切到背景(縮到最小)時所有音效/BGM 靜音，
 *   回到前景自動恢復(比照大對抗 visibilitychange 設計)。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.12.0:版號同步(txw 遞迴 BUG 修正 + 英文專有名詞附中文,邏輯全在 index.html)。⚠⚠ 本檔只能放在 minigame/ 目錄;2026-09-06 曾被誤傳到根目錄覆蓋主程式 sw.js,造成主程式「首次安裝」卡 0%。
 * ★ v1.11.0:版號同步(語系切換)
 * ★ v1.10.4:版號同步(卡片科目標籤)
 * ★ v1.10.3:版號同步(專注模式相關關卡才亮;題庫搬移在 minigame_db.js)
 * ★ v1.10.2:版號同步(專注複習勾單元自動啟用)
 * ★ v1.10.1:版號同步(排排站題卡/專注複習視窗防呆;SHELL 改名讓舊 db 快取失效)
 * ★ v1.10.0:版號同步(每週排行榜獎勵面板/彈窗在 index.html)
 * ★ v1.9.8:版號同步(排排站小達人改為真正的先後順序題,內容在 minigame_db.js)
 * ★ v1.9.7:版號同步(算數大進擊煙火/爆炸音效/50%、mgBins、課堂複習題全面混入)
 * ★ v1.9.6:版號同步(迷宮跨領域題組在 minigame_db.js)
 * ★ v1.9.5:版號同步(算數大進擊射擊特效在 index.html)
 * ★ v1.9.4:版號同步(連連看殘留圖層修正在 index.html)
 * ★ v1.9.3:版號同步(俗諺連連看在 index.html/minigame_db.js)
 * ★ v1.9.2:版號同步(缺圖名單誤記根治在 index.html;題圖快取策略與 MG_IMG_VER 不動,不重抓)
 * ★ v1.9.0:/minigame/img/ 題圖改 cache-first(URL 帶 ?v=MG_IMG_VER 破快取),其餘 shell 仍 network-first
 *
 * ★ scope 只在 /minigame/,比主程式 sw.js 的 './' 更具體
 *   ⇒ 瀏覽器自動讓本 SW 接管本目錄,不需要改主程式的 fetch 邏輯。
 *
 * ★ 快取名稱一律 'lxps-mini-' 前綴:
 *     - 主程式 sw.js 的 activate 已加白名單,不會把它清掉(v5.140.0 一行修正)
 *     - 本 SW 反過來也「只清自己前綴」的舊版本,絕不碰主程式的 lxps-shell / lxps-assets
 *   ⚠ CacheStorage 是整個 origin 共用的,這兩道白名單缺一不可。
 *
 * ★ 策略:
 *     - shell(本目錄檔案)= network-first + 2.5 秒逾時退回快取
 *       (更新即時生效;校網很慢或離線時仍然一定進得去 —— 這正是本小程式的存在目的)
 *     - 跨域素材(音效等)= cache-first,只存成功回應
 * ============================================================================ */
var MINI_VERSION = 'v1.93.0';   /* ★ v1.93.0(2026-09-13)：對應 minigame_index.html v1.123.0 + island_db v1.23.0。 */   /* ★ v1.92.0(2026-09-13)：對應 minigame_index.html v1.122.0 + island_db v1.23.0。 */   /* ★ v1.91.0(2026-09-13)：對應 minigame_index.html v1.121.0 + island_db v1.22.0。 */   /* ★ v1.90.0(2026-09-13)：對應 minigame_index.html v1.120.0 + island_db v1.21.0。 */   /* ★ v1.89.0(2026-09-13)：對應 minigame_index.html v1.119.0 + island_db v1.20.0。 */   /* ★ v1.88.0(2026-09-13)：對應 minigame_index.html v1.118.0。 */   /* ★ v1.87.0(2026-09-13)：對應 minigame_index.html v1.117.0。 */   /* ★ v1.86.0(2026-09-13)：對應 minigame_index.html v1.116.0 + island_db v1.19.0。 */   /* ★ v1.85.0(2026-09-13)：對應 minigame_index.html v1.115.0 + island_db v1.18.0。 */   /* ★ v1.84.0(2026-09-12)：對應 minigame_index.html v1.114.0 + island_db v1.17.0。 */   /* ★ v1.83.0(2026-09-12)：對應 minigame_index.html v1.113.0。 */   /* ★ v1.82.0(2026-09-12)：對應 minigame_index.html v1.112.0 + island_db v1.16.0。 */   /* ★ v1.81.0(2026-09-12)：對應 minigame_index.html v1.111.0 + island_db v1.16.0。 */   /* ★ v1.78.0(2026-09-12)：對應 minigame_index.html v1.107.0 + island_db v1.14.0。 */   /* ★ v1.77.0(2026-09-12)：對應 minigame_index.html v1.106.0 + island_db v1.13.0。 */   /* ★ v1.76.0(2026-09-12)：對應 minigame_index.html v1.105.0 + island_db v1.12.0;+ISLAND 快取白名單。 */   /* ★ v1.75.0(2026-09-12)：對應 minigame_index.html v1.104.0 + island_db v1.11.0。 */   /* ★ v1.74.0(2026-09-12)：對應 minigame_index.html v1.103.0 + island_db v1.10.0。 */   /* ★ v1.73.0(2026-09-12)：對應 minigame_index.html v1.102.0 + island_db v1.10.0。 */   /* ★ v1.72.0(2026-09-12)：對應 minigame_index.html v1.101.0 + island_db v1.9.0。 */   /* ★ v1.71.0(2026-09-12)：對應 minigame_index.html v1.100.0 + minigame_island_db.js v1.8.0。 */   /* ★ v1.70.0(2026-09-12)：對應 minigame_index.html v1.99.0 + minigame_island_db.js v1.7.0。 */   /* ★ v1.69.0(2026-09-12)：對應 minigame_index.html v1.98.0 + minigame_island_db.js v1.6.0。本檔僅版號同步。 */   /* ★ v1.68.0(2026-09-12)：對應 minigame_index.html v1.97.0(MG_IMG_VER 3、荒島 BGM 掛點、各區內心話)+ minigame_island_db.js v1.5.0。本檔僅版號同步。 */   /* ★ v1.67.0(2026-09-12)：對應 minigame_index.html v1.96.0(🏝 荒島 P3-b:四區場景+製作台工具)+ minigame_island_db.js v1.4.0。本檔僅版號同步。 */   /* ★ v1.66.0(2026-09-12)：對應 minigame_index.html v1.95.0(🏝 荒島 P3-a:科技研究/解謎點/湖泊+洞窟)+ minigame_island_db.js v1.3.0。本檔僅版號同步。 */   /* ★ v1.65.0(2026-09-12)：對應 minigame_index.html v1.94.0(🏝 荒島 P2-b:烹飪/播種/馴養/鋪水道+農田/畜欄/水道+建築 Lv5+營地擴建+裝飾舒適度)+ minigame_island_db.js v1.2.0。本檔僅版號同步(SHELL 改名讓舊快取失效)。 */   /* ★ v1.64.0(2026-09-12・老師回報主控台錯誤)：對應 minigame_index.html v1.93.0。①fetch 監聽器最前端加守門,非 http(s)(如瀏覽器擴充功能的 chrome-extension:// 請求)一律不攔截——Cache API 只支援 http(s),硬攔截會在 cache.put() 拋出「Request scheme 'chrome-extension' is unsupported」②三處 caches.open().then(function(c){c.put(...)}) 補上 return,c.put() 的 promise 才接得回外層 .catch(舊寫法失敗會變成主控台外的 Uncaught rejection,同一根因的另一半)。本檔僅版號同步(SHELL 改名讓舊快取失效)。 */   /* ★ v1.63.0(2026-09-12)：對應 minigame_index.html v1.92.0(🏝 荒島安全/教育回饋:角色受傷治療、環境受損修復、提示鈕)。本檔僅版號同步(SHELL 改名讓舊快取失效)。 */   /* ★ v1.62.0(2026-09-12)：對應 minigame_index.html v1.91.0(🏝 荒島 P2-a:三區/三活動/四建築/防衛戰)+ minigame_island_db.js v1.1.0。本檔僅版號同步(SHELL 改名讓舊快取失效)。 */   /* ★ v1.61.0(2026-09-12)：對應 minigame_index.html v1.90.0(🏝 像素荒島求生記 P1 骨架)。SHELL_URLS 新增 './minigame_island_db.js'(荒島資料表,離線也要抓得到);SHELL 改名讓舊快取失效。 */   /* ★ v1.60.0(2026-09-11)：對應 minigame_index.html v1.86.0(重新設計15關卡有幫助的第二效果+攻擊型爆發基礎傷害10→20)。本檔僅版號同步(SHELL 改名讓舊快取失效)。 */   /* ★ v1.59.0(2026-09-11)：對應 minigame_index.html v1.85.0(登入 redirect 回程訊號不足根治)。本檔僅版號同步(SHELL 改名讓舊快取失效)。 */   /* ★ v1.71.0(2026-09-10)：大對抗⇄小遊戲免重登(共用同一份 Firebase 登入狀態＋跨程式交接鑰匙＋小遊戲側共用裝置攔截器)＋PC/iPad/手機三平台版面稽核補丁。本檔僅版號同步(SHELL 改名讓舊快取失效)。 */   /* ★ v1.70.0(2026-09-10)：迷宮陷阱字重試補滿／起點小人物白色呼吸光暈／青炎龍王祭附加效果改版。本檔僅版號同步(SHELL 改名讓舊快取失效)。 */
var SHELL = 'lxps-mini-shell-v1.93.0';
var ASSET = 'lxps-mini-assets-v1';
var ISLAND = 'lxps-mini-island-v1';   /* ★ v1.76.0 荒島完整安裝快取(頁面端 islInstall 寫入),與 index.html 的 ISL_CACHE 同名 */

var SHELL_URLS = [
  './minigame_index.html',
  './minigame_db.js',
  './minigame_island_db.js',   /* ★ v1.61.0 — 🏝 像素荒島求生記資料表 */
  './manifest.json',
  './title.webp',
  './icon-192.png',
  './icon-180.png'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(SHELL).then(function(c){
      // 逐一抓取,單一檔失敗不讓整個 install 失敗
      return Promise.all(SHELL_URLS.map(function(u){
        return fetch(u, { cache: 'reload' }).then(function(r){
          if(r && r.ok) return c.put(u, r);
        })['catch'](function(){});
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        // ★ 只清「自己前綴」的舊版本;主程式的快取一律不動
        if(k.indexOf('lxps-mini-') === 0 && k !== SHELL && k !== ASSET && k !== ISLAND){   /* ★ v1.76.0 保留荒島安裝快取 */
          return caches['delete'](k);
        }
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

function timeoutAfter(ms){
  return new Promise(function(_, rej){
    setTimeout(function(){ rej(new Error('timeout')); }, ms);
  });
}

self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return;

  var url;
  try{ url = new URL(req.url); }catch(err){ return; }
  if(url.protocol !== 'http:' && url.protocol !== 'https:') return;   /* ★ v1.93.0 老師回報主控台報錯「Request scheme 'chrome-extension' is unsupported」:
     Cache API 只支援 http(s) 請求,某些瀏覽器擴充功能會發出 chrome-extension:// 請求並被本 SW 攔截,
     嘗試 cache.put() 會拋出未接住的 rejection(下方 caches.open().then() 內沒有把 c.put() 的 promise
     接回外層 .catch,是同一個 bug 的另一半,一併修好見下方)。非 http(s) 一律不攔截,交回瀏覽器預設處理。 */

  var sameOrigin = (url.origin === self.location.origin);
  var inScope = sameOrigin && url.pathname.indexOf('/minigame/') >= 0;

  // ── ★ v1.9.0 優化①:題圖 /minigame/img/ 一律 cache-first ──
  //    URL 已帶 ?v=MG_IMG_VER(素材更新只改那個數字 ⇒ 新 URL 自然重抓),所以不需要 network-first;
  //    舊寫法每題都重新下載(校網慢時先卡 2.5s 才退快取)。404 不進快取(index.html 另有缺圖名單擋重打)。
  if(sameOrigin && url.pathname.indexOf('/minigame/img/') >= 0){
    e.respondWith(
      caches.match(req).then(function(hit){
        if(hit) return hit;
        return fetch(req).then(function(res){
          if(res && res.ok){
            var copy = res.clone();
            caches.open(ASSET).then(function(c){ return c.put(req, copy); })['catch'](function(){});   /* ★ v1.93.0 c.put() 的 promise 接回鏈中,外層 .catch 才接得住(舊寫法未 return,c.put 失敗會變成主控台的 Uncaught rejection,同一 bug) */
          }
          return res;
        })['catch'](function(){ return new Response('', { status: 504 }); });
      })
    );
    return;
  }
  // ── 本目錄 shell:network-first(2.5s 逾時)→ 快取 ──
  if(inScope || req.mode === 'navigate'){
    e.respondWith(
      Promise.race([ fetch(req), timeoutAfter(2500) ])
        .then(function(res){
          if(res && res.ok){
            var copy = res.clone();
            caches.open(SHELL).then(function(c){ return c.put(req, copy); })['catch'](function(){});   /* ★ v1.93.0 同上,接回 promise 鏈 */
          }
          return res;
        })['catch'](function(){
          return caches.match(req).then(function(hit){
            if(hit) return hit;
            // 導覽請求退回首頁,避免離線時出現瀏覽器錯誤頁
            if(req.mode === 'navigate') return caches.match('./minigame_index.html');
            return new Response('', { status: 504 });
          });
        })
    );
    return;
  }

  // ── 跨域素材(音效等):cache-first ──
  if(!sameOrigin){
    e.respondWith(
      caches.match(req).then(function(hit){
        if(hit) return hit;
        return fetch(req).then(function(res){
          if(res && res.ok){
            var copy = res.clone();
            caches.open(ASSET).then(function(c){ return c.put(req, copy); })['catch'](function(){});   /* ★ v1.93.0 c.put() 的 promise 接回鏈中,外層 .catch 才接得住(舊寫法未 return,c.put 失敗會變成主控台的 Uncaught rejection,同一 bug) */
          }
          return res;
        })['catch'](function(){ return new Response('', { status: 504 }); });
      })
    );
  }
});
