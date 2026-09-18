/* ============================================================================
 * 小英雄小遊戲 — 獨立 Service Worker(minigame/sw.js)v1.34.0(2026-09-08)
 * ★ v1.126.0(2026-09-14・老師四項:NPC 名牌高度 / 敲釘子 6×6 / 採集與砲樹 QTE 拉桿與按鈕放大延長)：對應 minigame_index.html v1.158.0 + island_db v1.158.0(零改動)。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.117.0(2026-09-14・老師截圖回報三項：視窗標題應顯示「荒島求生」/ 商店買東西分頁被縮太小 / GM 造型工房調校值寫入)：對應 minigame_index.html v1.149.0 + island_db v1.149.0。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.115.0(2026-09-14・老師回報「荒島求生點了地圖上的區域,沒有進去該地圖」緊急修復)：對應 minigame_index.html v1.146.0——islEnterZone() 整個函式缺一行 var 宣告(db/sc/zs/zm/h/u/sp/i/n/first 十個變數全部未宣告),第一行讀取未宣告的 sc 就丟 ReferenceError 中斷,導致點任何區域 700ms 後一律靜默失敗進不去。補回 var 宣告即修復。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.106.0(2026-09-13・老師:量集答對特效把題目視窗推下去修正)：對應 minigame_index.html v1.136.0 + island_db v1.29.0(零改動)。本檔僅版號同步。
 * ★ v1.105.0(2026-09-13・老師:GM 造型調整三向各別設定)：對應 minigame_index.html v1.135.0 + island_db v1.29.0(零改動)。本檔僅版號同步。
 * ★ v1.104.0(2026-09-13・老師「繼續開工」)：對應 minigame_index.html v1.134.0 + island_db v1.29.0(零改動)。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.103.0(2026-09-13・老師「繼續未完成的工作」+ 看圖三項)：對應 minigame_index.html v1.133.0 + island_db v1.29.0。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.102.0(2026-09-13・老師:造型工房涵蓋全部角色圖 + 創角預設樣貌匯出)：對應 minigame_index.html v1.132.0 + island_db v1.28.0。
 * ★ v1.98.0(2026-09-13・老師:GM 造型工房 + 男女髮型分列)：對應 minigame_index.html v1.128.0 + island_db v1.26.0。本檔僅版號同步(SHELL 改名讓舊快取失效);MG_IMG_VER 已由頁面端 4→5,少年新髮型圖同名覆蓋後不會吃到舊圖。
 * ★ v1.97.0(2026-09-13・老師「只有 GM 可以進荒島」)：對應 minigame_index.html v1.127.0。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.96.0(2026-09-13・老師:海浪聲/森林鳥叫環境音)：對應 minigame_index.html v1.126.0 + island_db v1.25.0(零改動)。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.95.0(2026-09-13・老師七項)：對應 minigame_index.html v1.125.0 + island_db v1.25.0。本檔僅版號同步(SHELL 改名讓舊快取失效)。
 * ★ v1.94.0(2026-09-13・老師四項:HUD 縮一行/視窗免捲動/採集 200 題/創角圖層對齊)：對應 minigame_index.html v1.124.0 + island_db v1.24.0。本檔僅版號同步(SHELL 改名讓舊快取失效)。
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
var MINI_VERSION = 'v1.246.0';   /* ★ v1.246.0 — 隨 index/island_db 同步(本檔本身無實質改動:第六章敬請期待閘門)。 */   /* ★ v1.245.0 — 隨 index/island_db 同步(本檔本身無實質改動:夜襲寵物守衛/主線第六~八章/地下層暫閉)。 */   /* ★ v1.244.0 — 隨 index/island_db 同步(本檔本身無實質改動:營地方向盤/好友連結系統/造型工房開放/結算鈕)。 */   /* ★ v1.243.0 — 隨 index/island_db 同步(本檔本身無實質改動:寵物技能修正——坦克型天賦重寫/梅花鹿天賦改版/螢火蟲鮭魚技能倍率調整/攻擊控場型冷卻微調)。 */   /* ★ v1.242.0 — 隨 index/island_db 同步(本檔本身無實質改動:sandwind 重定義/MON_LV_ATK 與寵物成長調整/懸崖魔物表異動)。 */   /* ★ v1.241.0 — 隨 index/island_db 同步(本檔本身無實質改動)。 */   /* ★ v1.239.0 — 隨 index/island_db 同步(頭目一覽改版/營地奔跑卡速修正/寵物數值放大),本檔本身無實質改動。 */   /* ★ v1.233.0 — 隨 index/island_db v1.233.0 bump(本檔零改動)。 */   /* ★ v1.232.0 — 隨 index/island_db v1.232.0 bump(本檔零改動)。 */   /* ★ v1.231.0 — 隨 index/island_db v1.231.0 bump(本檔零改動)。 */   /* ★ v1.230.0 — 隨 index/island_db v1.230.0 bump(本檔零改動)。 */   /* ★ v1.229.0 — 隨 index/island_db v1.229.0 bump(本檔零改動:戰鬥系統優化 B5 天賦星盤重整)。 */   /* ★ v1.228.0 — 隨 index/island_db v1.228.0 bump(本檔零改動:戰鬥系統優化 B4 裝備)。 */   /* ★ v1.227.0 — 隨 index v1.227.0 bump(本檔零改動:戰鬥系統優化 B3 地圖頭目)。 */     /* ★ v1.226.0 — 隨 index v1.226.0 bump(本檔零改動:戰鬥系統優化 B2)。 */     /* ★ v1.225.0 — 隨 index v1.225.0 bump(本檔零改動:戰鬥系統優化 B1 數值引擎+營地寵物尺寸,對應 island_db.js v1.225.0)。 */     /* ★ v1.224.0 — 隨 index v1.224.0 bump(本檔零改動:選單按鈕圖為主字為輔改版,對應 island_db.js v1.224.0)。 */   /* ★ v1.223.0 — 隨 index v1.223.0 bump(本檔零改動:重新計算戰鬥難度——HP複利改固定值/坦克補師下修/隊伍人數難度縮放,對應 island_db.js v1.223.0)。 */   /* ★ v1.222.0 — 隨 index v1.222.0 bump(本檔零改動:烤魚改野果+改小白贈送時機,對應 island_db.js v1.222.0)。 */   /* ★ v1.221.0 — 隨 index v1.221.0 bump(本檔零改動:主角開局帶3個烤魚,對應 island_db.js v1.221.0)。 */   /* ★ v1.220.0 — 隨 index v1.220.0 bump(本檔零改動:字體堆疊順序改圓體優先+天賦星盤/戰鬥介面視覺優化,對應 island_db.js v1.220.0)。 */   /* ★ v1.219.0 — 隨 index v1.219.0 bump(本檔零改動:ui_bld 圖鍵修正+共用卡片元件視覺升級,對應 island_db.js v1.219.0)。 */   /* ★ v1.217.0 — 隨 index v1.217.0 bump(本檔零改動:寵物詳情卡改用大對抗同色票,對應 island_db.js v1.217.0 版號同步)。 */   /* ★ v1.215.0 — 隨 index v1.215.0 bump(本檔零改動:補完視窗開啟/關閉、寵物升級、親密度階級提升音效,對應 island_db.js v1.215.0 D.SFX_MAP 異動)。 */   /* ★ v1.214.0 — 隨 index v1.214.0 bump(本檔零改動:實作6種缺失戰鬥技能機制,對應 island_db.js v1.214.0 資料異動)。 */   /* ★ v1.213.0 — 隨 index v1.213.0 bump(本檔零改動:iPad物品包/按鈕尺寸/倉庫版面/寵物四維標籤一批UI修正,老師七項需求本輪完成①②③④,⑤⑥⑦下一輪)。 */   /* ★ v1.212.0 — 隨 index v1.212.0 bump(本檔零改動:修跑步動畫幀速度bug+營地寵物走路睡覺行為+營地主角補齊鍵盤/奔跑/跳躍完整移動指令)。 */   /* ★ v1.211.0 — 隨 index v1.211.0 bump(首頁新增可點擊的荒島求生小LOGO,直接呼叫既有 islEnter 閘門判斷)。 */   /* ★ v1.210.0 — 隨 index v1.210.0 bump(彈窗/按鈕框架質感升級:平塗改漸層+發光邊框+外散光,色相不變仍是海洋藍)。 */   /* ★ v1.209.0 — 隨 index v1.209.0 bump(探險編組視窗改一般大小+卡片緊湊排列,不再近全螢幕散開)。 */   /* ★ v1.208.0 — 隨 index v1.208.0 bump(營地畫布改cover-fit佈滿全區域+側選單可收合+夥伴圖鑑圖片尺寸根治)。 */   /* ★ v1.207.0 — 隨 index v1.207.0 bump(戰鬥魔物站位越界修正+HP條縮短騰出狀態圖示列)。 */   /* ★ v1.206.0 — 隨 index v1.206.0 bump(「資源不足」標籤三項強化:還缺數量顯示/前往採集捷徑/湊齊主角提醒)。 */   /* ★ v1.205.0 — 隨 index／island_db v1.205.0 bump(選單圖示鍵補齊+營地設施格黃框移除)。 */   /* ★ v1.204.0 — 隨 index v1.204.0 bump(本檔零改動:修正營地寵物巨大化bug、主角放大100%)。 */   /* ★ v1.203.0 — 隨 index v1.203.0 bump(本檔零改動:缺圖佔位樣式拿掉虛線框,只留emoji)。 */   /* ★ v1.202.0 — 隨 index v1.202.0 bump(本檔零改動:按鈕/選單ICON全部接上圖片掛點,缺圖退回emoji)。 */   /* ★ v1.201.0 — 隨 index v1.201.0 bump(本檔零改動:修正 mgAutoBusy/mgVerReload 一系列 window._IS 等死鍵判斷式)。 */   /* ★ v1.200.0 — 隨 index v1.200.0 bump(本檔零改動:營地建造自由座標/天賦星域左右分欄/採集結算按鈕釘底)。 */   /* ★ v1.198.0 — 隨 index v1.198.0 bump(本檔零改動:野外跳躍/跑步三項修正)。 */   /* ★ v1.197.0 — 隨 index v1.197.0 bump(本檔零改動,純版號同步:荒島求生 UI/UX 一輪多項需求)。 */   /* ★ v1.196.0 — 隨 index／island_db v1.196.0 bump(本檔零改動:PENDING 6 項全部完成+採集題庫擴充到 300 題)。★ 本常數一律與 MG_VER 同號(v1.159.0 起的鐵則,版本徽章與 mgVerFetchLatest 都靠它)。 */   /* ★ v1.194.0 — 隨 index／island_db v1.194.0 bump(本檔零改動:寵物圖片全面接上/玩家技能特效+技能名稱/治療亮綠+粒子/委託報酬修正)。 */   /* ★ v1.193.0 — 隨 index／island_db v1.193.0 bump(本檔零改動:寵物技能特效改集中效果線+放大2秒/魔物被打倒特效改點擊星星)。 */   /* ★ v1.192.0 — 隨 index／island_db v1.192.0 bump(本檔零改動:夥伴圖鑑改版/寵物HP重調/升級HP+3%/戰鬥按鈕放大)。 */   /* ★ v1.191.0 — 隨 index／island_db v1.191.0 bump(本檔零改動:戰鬥開戰大字報/音效加強+勝利音樂淡出/營地對話泡泡寬高比)。 */   /* ★ v1.190.0 — 隨 index／island_db v1.190.0 bump(本檔零改動:採集品質小遊戲材料圖片改左右兩欄佈局,不再擋住拉桿)。 */   /* ★ v1.189.0 — 隨 index／island_db v1.189.0 bump(本檔零改動:iPad 營地方向錯誤根治、天賦星域接近全螢幕+收合說明)。 */   /* ★ v1.188.0 — 隨 index／island_db v1.188.0 bump(本檔零改動:荒島奔跑/跳躍動作、野外突發戰鬥與進場音效加強)。 */   /* ★ v1.187.0 — 隨 index／island_db v1.187.0 bump(本檔零改動:荒島 10 種防具/天賦星域全螢幕可縮放/玩到一半跳出遊戲三道根因)。 */      /* ★ v1.186.0 — 隨 index／island_db v1.186.0 bump(本檔零改動:建造區域雙指縮放/營地選單縮短/對話泡泡橫式/大選單全螢幕/買賣按鈕放大與買東西數量步進器)。 */   /* ★ v1.185.0 — 隨 index／island_db v1.185.0 bump(本檔零改動:iPad 對話框溢出/戰鬥音樂/QTE 版面/物品包放大/SOS 位置/材料顏色/資源圖示/沙灘停戰/營地角色方向)。 */   /* ★ v1.182.0 — 隨 index／island_db v1.182.0 bump(荒島寵物收服流程改版:機率制廢除、改送禮+答題;本檔僅版號同步) */   /* ★ v1.180.0(2026-09-15・老師截圖回報「還是卡在載入營地」— 找到真因)★★ 【網頁本體被完整下載快取永久凍結・根治】老師那台的 HUD 還是「六項資源攤開 + 😊🏠 分開」、載入條還是「2/3」⇒ 跑的是 v1.169.0 或更早,v1.170～v1.179 十輪修正(含三輪專治卡在載入營地)一次都沒送到。根因是四件事疊起來:①頁面端 `islInstallUrls()` 第一行就 `add('./minigame_index.html')` ⇒ **完整下載會把網頁本體存進 `lxps-mini-island-v1`**;②本檔 `staleWhileRevalidate` 用 `caches.match(KEY)`,這支 API **會掃過所有快取**,而島快取比當下的 SHELL 早建立、永遠先命中;③背景重抓到的新版只寫進 SHELL,寫了也永遠讀不到;④頁面端 `mgVerReload`(更新鈕)自 v1.159.0 起**刻意只清 `lxps-mini-shell-*`**(為了保住 60~120MB 素材),連帶把那份中毒的舊網頁一起保住。⇒ **按下完整下載的那一刻,網頁版本就被永久凍結了**,怎麼重整、怎麼按更新都救不回來,這也是我在沙箱怎麼跑都重現不出來的原因。本檔三道修法:(a) activate 新增一次性自癒 `purgeStaleProgramCopies()`——把所有快取裡的「程式檔鍵」(minigame_index.html / manifest.json / 帶 ?v= 的 minigame_*.js)刪乾淨,只留當前 SHELL 那一份;⚠ **只刪程式檔,素材一個位元組都不動**,60~120MB 完整下載完整保留。⚠ 這是唯一救得回已中毒裝置的路:SW 檔本身不經 SW 快取(瀏覽器每次 navigation 都會向伺服器對版),所以就算網頁凍結在 v1.169.0,新版 SW 照樣裝得進去 ⇒ 老師與學生都不必手動做任何事。(b) `staleWhileRevalidate` 改成**只讀當前 SHELL**,讀不到才退回全庫(離線保險),島快取再也不可能蓋過新版。(c) 自癒完成後廣播 `MG_FORCE_RELOAD`,新版頁面收到會先存檔再重載;舊版頁面不認得這個訊息也無妨,下一次重整就會拿到新版(快取已被清乾淨)。 */   /* ★ v1.179.0 — 隨 index／island_db v1.179.0 bump(本檔零改動) */   /* ★ v1.178.0 — 隨 index／island_db v1.178.0 bump(本檔零改動) */   /* ★ v1.177.0 — 本檔有實質改動:帶 ?v= 的程式檔逾時 15→45 秒(見 cacheFirst 說明);其餘隨 index／island_db v1.177.0 bump */   /* ★ v1.176.0 — 隨 index／island_db v1.176.0 bump */   /* ★ v1.175.0 — 隨 index／island_db v1.175.0 bump */   /* ★ v1.174.0 — 隨 index／island_db v1.174.0 bump；★ 荒島⚙「🔄 版本」就是拓這一行的 MINI_VERSION 做比對，忘了 bump 學生就永遠看不到新版 */   /* ★ v1.173.0 — 隨 index／island_db v1.173.0 bump */   /* ★ v1.172.0 — 隨 index／island_db v1.172.0 bump(HUD 甲案合併、大地圖 LOGO、離線素材對帳) */   /* ★ v1.171.0 — 本輪 SW 本體有實質改動(同源素材一律 cache-first + Range 從快取切 206) */   /* ★ v1.170.0 — 隨 index／island_db v1.170.0 bump(HUD 資源項濃縮成倉庫圖示) */   /* ★ v1.169.0 — 隨 index／island_db v1.169.0 bump */   /* ★ v1.168.0 — 隨 index／island_db v1.168.0 bump */   /* ★ v1.167.0 — 隨 index／island_db v1.167.0 bump */   /* ★ v1.166.0 — 隨 index／island_db v1.166.0 bump */   /* ★ v1.165.0 — 隨 index／island_db v1.165.0 bump */   /* ★ v1.164.0 — 隨 index／island_db v1.164.0 bump */   /* ★ v1.163.0 — 隨 index／island_db v1.163.0 bump(MINI_VERSION 一律與 MG_VER 同號) */   /* ★ v1.160.0 — 本常數一律跟 minigame_index.html 的 MG_VER 同號(v1.159.0 起的鐵則，版本徽章靠它判定「你玩的是舊版」) */   /* ★ v1.159.0(2026-09-14)—【根治】本常數往後一律跟 minigame_index.html 的 MG_VER 同號。頁面的「版本徽章」是用 mgVerNum(MINI_VERSION) > mgVerNum(MG_VER) 判定「你玩的是舊版」，而本常數自 v1.110.0 起就漂移落後(停在 v1.116/v1.126，index 已走到 v1.15x)，因此不管老師傳了幾次新版，學生端的徽章永遠不會轉紅、永遠不會提示更新⇒ 舊程式與舊素材版號一直被留在平板上。本輪對齊後徽章才真的會作用。 */   /* ★ SW 快取策略本輪改版：同源素材 cache-first、帶 ?v= 版號的檔案 cache-first、minigame_index.html 改 stale-while-revalidate。對應 minigame_index.html v1.159.0。 */   /* ★ v1.116.0(2026-09-14):對應 minigame_index.html v1.147.0(荒島求生地圖畫面與場景疊在一起的緊急修復:六個畫面容器改 position:absolute 互相覆蓋、islEnterZone 補雙保險 hide)。本檔僅版號同步(SHELL 改名讓舊快取失效)。 */   /* ★ v1.115.0(2026-09-14):對應 minigame_index.html v1.146.0(老師回報荒島求生點地圖區域沒反應緊急修復:islEnterZone() 補回缺的 var 宣告)。本檔僅版號同步(SHELL 改名讓舊快取失效)。 */   /* ★ v1.114.0(2026-09-14):對應 minigame_index.html v1.145.0(十二星神進小遊戲＋本關推薦)與 minigame_db.js v1.45.0。本檔僅版號同步。 */   /* ★ v1.113.0(2026-09-14):對應 minigame_index.html v1.144.0(休息排程閘門)+ island_db 零改動仍 v1.31.0。本檔僅版號同步(SHELL 改名讓舊快取失效)。★ 順修版號漂移:本常數自 v1.110.0 起未跟上,SHELL 卻已走到 v1.112.0,本輪一起對齊到 v1.113.0。 */   /* ★ v1.110.0(2026-09-13):對應 minigame_index.html v1.140.0(拜訪營地側欄併入 .cat 分類選單視覺)+ island_db 零改動仍 v1.30.0。本檔僅版號同步(SHELL 改名讓舊快取失效)。 */      /* ★ v1.109.0(2026-09-13):對應 minigame_index.html v1.139.0(水域資源點執行期可走格濾網 + food1/friend1 章節呼叫點補齊)+ island_db 零改動仍 v1.30.0。本檔僅版號同步(SHELL 改名讓舊快取失效)。 */      /* ★ v1.108.0(2026-09-13):對應 minigame_index.html v1.138.0(戰鬥立繪三層渲染+服裝染色+運動服改名)+ island_db v1.30.0。本檔僅版號同步(SHELL 改名讓舊快取失效)。 */   /* ★ v1.107.0(2026-09-13):對應 minigame_index.html v1.137.0(撿取閃亮特效+社交敬請期待占位)。本檔僅版號同步(SHELL 改名讓舊快取失效)。 */   /* ★ v1.106.0(2026-09-13):對應 minigame_index.html v1.136.0。 */   /* ★ v1.105.0(2026-09-13):對應 minigame_index.html v1.135.0。 */   /* ★ v1.104.0(2026-09-13):對應 minigame_index.html v1.134.0。 */   /* ★ v1.103.0(2026-09-13・老師「繼續未完成的工作」+ 看圖三項):對應 minigame_index.html v1.133.0 + island_db v1.29.0。本檔僅版號同步(SHELL 改名讓舊快取失效)。 */   /* ★ v1.102.0(2026-09-13・老師:造型工房涵蓋全部角色圖 + 創角預設樣貌匯出):對應 minigame_index.html v1.132.0 + island_db v1.28.0。本檔僅版號同步(SHELL 改名讓舊快取失效)。 */   /* ★ v1.101.0(2026-09-13):對應 minigame_index.html v1.131.0 + island_db v1.27.0。本檔僅版號同步(SHELL 改名讓舊快取失效)。 */   /* ★ v1.100.0(2026-09-13):對應 minigame_index.html v1.130.0 + island_db v1.26.0(零改動)。本檔僅版號同步(SHELL 改名讓舊快取失效)。 */   /* ★ v1.99.0(2026-09-13):對應 minigame_index.html v1.129.0 + island_db v1.26.0(零改動)。本檔僅版號同步(SHELL 改名讓舊快取失效)。 */   /* ★ v1.98.0(2026-09-13):對應 minigame_index.html v1.128.0 + island_db v1.26.0。 */   /* ★ v1.97.0(2026-09-13)：對應 minigame_index.html v1.127.0。 */   /* ★ v1.96.0(2026-09-13)：對應 minigame_index.html v1.126.0。 */   /* ★ v1.95.0(2026-09-13)：對應 minigame_index.html v1.125.0 + island_db v1.25.0。 */   /* ★ v1.94.0(2026-09-13)：對應 minigame_index.html v1.124.0 + island_db v1.24.0。 */   /* ★ v1.93.0(2026-09-13)：對應 minigame_index.html v1.123.0 + island_db v1.23.0。 */   /* ★ v1.92.0(2026-09-13)：對應 minigame_index.html v1.122.0 + island_db v1.23.0。 */   /* ★ v1.91.0(2026-09-13)：對應 minigame_index.html v1.121.0 + island_db v1.22.0。 */   /* ★ v1.90.0(2026-09-13)：對應 minigame_index.html v1.120.0 + island_db v1.21.0。 */   /* ★ v1.89.0(2026-09-13)：對應 minigame_index.html v1.119.0 + island_db v1.20.0。 */   /* ★ v1.88.0(2026-09-13)：對應 minigame_index.html v1.118.0。 */   /* ★ v1.87.0(2026-09-13)：對應 minigame_index.html v1.117.0。 */   /* ★ v1.86.0(2026-09-13)：對應 minigame_index.html v1.116.0 + island_db v1.19.0。 */   /* ★ v1.85.0(2026-09-13)：對應 minigame_index.html v1.115.0 + island_db v1.18.0。 */   /* ★ v1.84.0(2026-09-12)：對應 minigame_index.html v1.114.0 + island_db v1.17.0。 */   /* ★ v1.83.0(2026-09-12)：對應 minigame_index.html v1.113.0。 */   /* ★ v1.82.0(2026-09-12)：對應 minigame_index.html v1.112.0 + island_db v1.16.0。 */   /* ★ v1.81.0(2026-09-12)：對應 minigame_index.html v1.111.0 + island_db v1.16.0。 */   /* ★ v1.78.0(2026-09-12)：對應 minigame_index.html v1.107.0 + island_db v1.14.0。 */   /* ★ v1.77.0(2026-09-12)：對應 minigame_index.html v1.106.0 + island_db v1.13.0。 */   /* ★ v1.76.0(2026-09-12)：對應 minigame_index.html v1.105.0 + island_db v1.12.0;+ISLAND 快取白名單。 */   /* ★ v1.75.0(2026-09-12)：對應 minigame_index.html v1.104.0 + island_db v1.11.0。 */   /* ★ v1.74.0(2026-09-12)：對應 minigame_index.html v1.103.0 + island_db v1.10.0。 */   /* ★ v1.73.0(2026-09-12)：對應 minigame_index.html v1.102.0 + island_db v1.10.0。 */   /* ★ v1.72.0(2026-09-12)：對應 minigame_index.html v1.101.0 + island_db v1.9.0。 */   /* ★ v1.71.0(2026-09-12)：對應 minigame_index.html v1.100.0 + minigame_island_db.js v1.8.0。 */   /* ★ v1.70.0(2026-09-12)：對應 minigame_index.html v1.99.0 + minigame_island_db.js v1.7.0。 */   /* ★ v1.69.0(2026-09-12)：對應 minigame_index.html v1.98.0 + minigame_island_db.js v1.6.0。本檔僅版號同步。 */   /* ★ v1.68.0(2026-09-12)：對應 minigame_index.html v1.97.0(MG_IMG_VER 3、荒島 BGM 掛點、各區內心話)+ minigame_island_db.js v1.5.0。本檔僅版號同步。 */   /* ★ v1.67.0(2026-09-12)：對應 minigame_index.html v1.96.0(🏝 荒島 P3-b:四區場景+製作台工具)+ minigame_island_db.js v1.4.0。本檔僅版號同步。 */   /* ★ v1.66.0(2026-09-12)：對應 minigame_index.html v1.95.0(🏝 荒島 P3-a:科技研究/解謎點/湖泊+洞窟)+ minigame_island_db.js v1.3.0。本檔僅版號同步。 */   /* ★ v1.65.0(2026-09-12)：對應 minigame_index.html v1.94.0(🏝 荒島 P2-b:烹飪/播種/馴養/鋪水道+農田/畜欄/水道+建築 Lv5+營地擴建+裝飾舒適度)+ minigame_island_db.js v1.2.0。本檔僅版號同步(SHELL 改名讓舊快取失效)。 */   /* ★ v1.64.0(2026-09-12・老師回報主控台錯誤)：對應 minigame_index.html v1.93.0。①fetch 監聽器最前端加守門,非 http(s)(如瀏覽器擴充功能的 chrome-extension:// 請求)一律不攔截——Cache API 只支援 http(s),硬攔截會在 cache.put() 拋出「Request scheme 'chrome-extension' is unsupported」②三處 caches.open().then(function(c){c.put(...)}) 補上 return,c.put() 的 promise 才接得回外層 .catch(舊寫法失敗會變成主控台外的 Uncaught rejection,同一根因的另一半)。本檔僅版號同步(SHELL 改名讓舊快取失效)。 */   /* ★ v1.63.0(2026-09-12)：對應 minigame_index.html v1.92.0(🏝 荒島安全/教育回饋:角色受傷治療、環境受損修復、提示鈕)。本檔僅版號同步(SHELL 改名讓舊快取失效)。 */   /* ★ v1.62.0(2026-09-12)：對應 minigame_index.html v1.91.0(🏝 荒島 P2-a:三區/三活動/四建築/防衛戰)+ minigame_island_db.js v1.1.0。本檔僅版號同步(SHELL 改名讓舊快取失效)。 */   /* ★ v1.61.0(2026-09-12)：對應 minigame_index.html v1.90.0(🏝 像素荒島求生記 P1 骨架)。SHELL_URLS 新增 './minigame_island_db.js'(荒島資料表,離線也要抓得到);SHELL 改名讓舊快取失效。 */   /* ★ v1.60.0(2026-09-11)：對應 minigame_index.html v1.86.0(重新設計15關卡有幫助的第二效果+攻擊型爆發基礎傷害10→20)。本檔僅版號同步(SHELL 改名讓舊快取失效)。 */   /* ★ v1.59.0(2026-09-11)：對應 minigame_index.html v1.85.0(登入 redirect 回程訊號不足根治)。本檔僅版號同步(SHELL 改名讓舊快取失效)。 */   /* ★ v1.71.0(2026-09-10)：大對抗⇄小遊戲免重登(共用同一份 Firebase 登入狀態＋跨程式交接鑰匙＋小遊戲側共用裝置攔截器)＋PC/iPad/手機三平台版面稽核補丁。本檔僅版號同步(SHELL 改名讓舊快取失效)。 */   /* ★ v1.70.0(2026-09-10)：迷宮陷阱字重試補滿／起點小人物白色呼吸光暈／青炎龍王祭附加效果改版。本檔僅版號同步(SHELL 改名讓舊快取失效)。 */
var SHELL = 'lxps-mini-shell-v1.212.0';   /* ★ v1.246.0 */   /* ★ v1.245.0 */   /* ★ v1.244.0 */   /* ★ v1.243.0 */   /* ★ v1.242.0 */   /* ★ v1.241.0 */   /* ★ v1.240.0 */   /* ★ v1.199.0 — 隨 index v1.233.0 bump */   /* ★ v1.198.0 — 隨 index v1.232.0 bump */   /* ★ v1.197.0 — 隨 index v1.231.0 bump */   /* ★ v1.196.0 — 隨 index v1.230.0 bump */   /* ★ v1.195.0 — 隨 index v1.229.0 bump */   /* ★ v1.194.0 — 隨 index v1.228.0 bump */   /* ★ v1.193.0 — 隨 index v1.227.0 bump */     /* ★ v1.192.0 — 隨 index v1.226.0 bump */     /* ★ v1.191.0 — 隨 index v1.225.0 bump */     /* ★ v1.190.0 — 隨 index v1.224.0 bump */   /* ★ v1.189.0 — 隨 index v1.223.0 bump */   /* ★ v1.188.0 — 隨 index v1.222.0 bump */   /* ★ v1.187.0 — 隨 index v1.221.0 bump */   /* ★ v1.186.0 — 隨 index v1.220.0 bump */   /* ★ v1.185.0 — 隨 index v1.219.0 bump */   /* ★ v1.183.0 — 隨 index v1.217.0 bump */   /* ★ v1.181.0 — 隨 index v1.215.0 bump */   /* ★ v1.180.0 — 隨 index v1.214.0 bump */   /* ★ v1.179.0 — 隨 index v1.213.0 bump */   /* ★ v1.178.0 — 隨 index v1.212.0 bump */   /* ★ v1.177.0 — 隨 index v1.211.0 bump */   /* ★ v1.176.0 — 隨 index v1.210.0 bump */   /* ★ v1.175.0 — 隨 index v1.209.0 bump */   /* ★ v1.174.0 — 隨 index v1.208.0 bump */   /* ★ v1.173.0 — 隨 index v1.207.0 bump */   /* ★ v1.172.0 — 隨 index v1.206.0 bump */   /* ★ v1.171.0 — 隨 index v1.205.0 bump */   /* ★ v1.170.0 — 隨 index v1.204.0 bump */   /* ★ v1.169.0 — 隨 index v1.203.0 bump */   /* ★ v1.168.0 — 隨 index v1.202.0 bump */   /* ★ v1.167.0 — 隨 index v1.201.0 bump */   /* ★ v1.166.0 — 隨 index v1.200.0 bump */   /* ★ v1.165.0 — 隨 index v1.198.0 bump */   /* ★ v1.164.0 — 隨 index v1.197.0 bump,讓所有裝置重抓新版 shell */   /* ★ v1.163.0 — 隨 index v1.196.0 bump,讓所有裝置重抓新版 shell(PENDING 6 項+採集題庫擴充) */   /* ★ v1.162.0 — 隨 index v1.195.0 bump,讓所有裝置重抓新版 shell(HP條/預覽視窗/數值重新平衡/迴力鏢跳字) */   /* ★ v1.161.0 — 隨 index v1.194.0 bump,讓所有裝置重抓新版 shell(寵物圖片/玩家技能特效/治療特效/委託報酬修正) */   /* ★ v1.160.0 — 隨 index v1.193.0 bump,讓所有裝置重抓新版 shell(寵物技能特效/被打倒特效改版) */   /* ★ v1.159.0 — 隨 index v1.192.0 bump,讓所有裝置重抓新版 shell(夥伴圖鑑改版/寵物HP重調/升級加成/戰鬥按鈕放大) */   /* ★ v1.158.0 — 隨 index v1.191.0 bump,讓所有裝置重抓新版 shell(開戰大字報/戰鬥音效加強/營地對話泡泡) */   /* ★ v1.157.0 — 隨 index v1.190.0 bump,讓所有裝置重抓新版 shell(採集品質小遊戲材料圖片改左右兩欄佈局) */   /* ★ v1.156.0 — 隨 index v1.189.0 bump,讓所有裝置重抓新版 shell(iPad 營地方向根治+天賦星域版面改版) */   /* ★ v1.155.0 — 隨 index v1.188.0 bump,讓所有裝置重抓新版 shell(奔跑/跳躍動作+左下角新按鈕+野外戰鬥音效加強) */   /* ★ v1.154.0 — 隨 index v1.187.0 bump,讓所有裝置重抓新版 shell(防具/天賦星域/跳出遊戲修復) */      /* ★ v1.153.0 — 隨 index v1.186.0 bump,讓所有裝置重抓新版 shell(營地雙指縮放/選單/對話泡泡/買賣按鈕修正) */   /* ★ v1.152.0 — 隨 index v1.185.0 bump,讓所有裝置重抓新版 shell(對話框/戰鬥音樂/QTE 版面/物品包/SOS/材料顏色/資源圖示/沙灘停戰/營地方向修正) */   /* ★ v1.151.0 — 隨 index v1.184.0 bump(服裝刪減:探險背心裝/島民草編裝/海洋工作服拿掉) */   /* ★ v1.150.0 — 隨 index v1.183.0 bump(回營地無窮遞迴根治＋齒輪 GM 重新開始) */   /* ★ v1.149.0 — 隨 index v1.182.0 bump(荒島寵物收服流程改版) */   /* ★ v1.148.0 — 隨 index v1.180.0 bump(網頁本體被島快取凍結的根治輪) */   /* ★ v1.147.0 — 隨 index v1.179.0 bump */   /* ★ v1.146.0 — 隨 index v1.178.0 bump */   /* ★ v1.145.0 — 隨 index v1.177.0 bump */   /* ★ v1.144.0 — 隨 index v1.176.0 bump */   /* ★ v1.143.0 — 隨 index v1.175.0 bump */   /* ★ v1.142.0 — 隨 index v1.174.0 bump */   /* ★ v1.141.0 — 隨 index v1.173.0 bump */   /* ★ v1.140.0 — 隨 index v1.172.0／island_db v1.172.0 bump */   /* ★ v1.139.0 — 隨 index v1.171.0／island_db v1.171.0 bump */   /* ★ v1.138.0 — 隨 index v1.170.0／island_db v1.170.0 bump */   /* ★ v1.137.0 — 隨 index v1.169.0／island_db v1.169.0 bump */   /* ★ v1.136.0 — 隨 index v1.168.0／island_db v1.168.0 bump */   /* ★ v1.135.0 — 隨 index v1.167.0／island_db v1.167.0 bump */   /* ★ v1.134.0 — 隨 index v1.166.0／island_db v1.166.0 bump */   /* ★ v1.133.0 — 隨 index v1.165.0／island_db v1.165.0 bump */   /* ★ v1.132.0 — 隨 index v1.164.0／island_db v1.164.0 bump */   /* ★ v1.131.0 — 隨 index v1.163.0／island_db v1.163.0 bump */   /* ★ v1.130.0 — 隨 index v1.162.0／island_db v1.162.0 bump */   /* ★ v1.129.0 — 隨 index v1.161.0／island_db v1.161.0 bump */   /* ★ v1.128.0 — 隨 index v1.160.0／island_db v1.160.0 bump */   /* ★ v1.127.0 — 隨 index v1.159.0／island_db v1.159.0 bump，讓所有裝置重抓新版 shell */   /* ★ v1.126.0 — 隨 index v1.158.0／island_db v1.158.0 bump,讓所有裝置重抓新版 shell */   /* ★ v1.125.0 — 隨 index v1.157.0／island_db v1.157.0 bump,讓所有裝置重抓新版 shell */   /* ★ v1.124.0 — 隨 index v1.156.0／island_db v1.156.0 bump,讓所有裝置重抓新版 shell */   /* ★ v1.123.0 — 隨 index v1.155.0／island_db v1.155.0 bump,讓所有裝置重抓新版 shell */   /* ★ v1.122.0 — 隨 index v1.154.0／island_db v1.154.0 bump,讓所有裝置重抓新版 shell */   /* ★ v1.121.0 — 隨 index v1.153.0／island_db v1.153.0 bump,讓所有裝置重抓新版 shell */   /* ★ v1.120.0 — 隨 index v1.152.0／island_db v1.152.0 bump,讓所有裝置重抓新版 shell */   /* ★ v1.119.0 — 隨 index v1.151.0／island_db v1.151.0 bump,讓所有裝置重抓新版 shell */   /* ★ v1.118.0 — 隨 index v1.150.0／island_db v1.150.0 bump,讓所有裝置重抓新版 shell */   /* ★ v1.117.0 — 隨 index v1.149.0／island_db v1.149.0 bump,讓所有裝置重抓新版 shell */   /* ★ v1.115.0 — 隨 index v1.146.0 bump,讓所有裝置重抓新版 shell */   /* ★ v1.113.0 — 隨 index v1.144.0 bump,讓所有裝置重抓新版 shell */   /* ★ v1.110.0 — 隨 index v1.141.0／island_db v1.31.0 bump,讓所有裝置重抓新版 shell */
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

/* ══ ★★ v1.180.0 一次性自癒:清掉「殘留在別的快取裡的程式檔」★★ ══
   【為什麼需要】完整下載(islInstallUrls)過去會把 `./minigame_index.html`、`./manifest.json`
   與帶 ?v= 的 minigame_db.js / minigame_island_db.js 一起存進 ISLAND('lxps-mini-island-v1')。
   而 ISLAND 永遠不清(白名單保護,本來是為了保住 60~120MB 素材),
   `caches.match()` 又是掃全庫、以快取建立順序先命中者為準 ⇒
   島快取那份「下載當天的網頁」會永遠蓋過之後所有新版,裝置從此鎖死在那一版。
   ⇒ 這裡把「程式檔」從**每一個**快取裡剔除,只留當前 SHELL 那一份。
   ⚠ 判定刻意用白名單式的檔名比對,不用副檔名:素材(圖片/音樂)一個都不會被誤刪,
     老師與學生辛苦裝的完整下載完整保留,只有「程式碼」會被重抓(幾 MB,一次而已)。
   ⚠ 本函式冪等:清完之後每次 activate 再跑也只是掃一遍找不到東西,零成本。 */
function isProgramKey(u){
  try{
    var p = new URL(u, self.location.href);
    if(p.origin !== self.location.origin) return false;
    if(p.pathname.indexOf('/minigame/') < 0) return false;
    if(/minigame_index\.html$/i.test(p.pathname)) return true;
    if(/manifest\.json$/i.test(p.pathname)) return true;
    /* ⚠ 刻意**不**清帶 ?v= 的 minigame_db.js / minigame_island_db.js:
       它們的 URL 本身就含版號 ⇒ 新版網頁一定去要新的 URL,舊的那份只是佔幾百 KB,
       不可能造成凍結;反過來清掉會害已完整下載的裝置離線時讀不到資料表(荒島直接進不去)。
       真正會凍結整支程式的只有「URL 永遠不變」的這兩支。 */
    return false;
  }catch(e){ return false; }
}
function purgeStaleProgramCopies(){
  return caches.keys().then(function(keys){
    return Promise.all(keys.map(function(name){
      if(name === SHELL) return null;                    /* 當前 shell 那份就是新版,留著 */
      if(name.indexOf('lxps-mini-') !== 0) return null;  /* 主程式的快取一律不碰 */
      return caches.open(name).then(function(c){
        return c.keys().then(function(reqs){
          return Promise.all(reqs.map(function(r){
            return isProgramKey(r.url) ? c['delete'](r) : null;
          }));
        });
      })['catch'](function(){});
    }));
  })['catch'](function(){});
}
/* ★ v1.180.0 自癒完成後叫頁面重載(新版頁面才認得 MG_FORCE_RELOAD;舊版頁面不認得也無妨——
   快取已經清乾淨,下一次重整自然就會拿到新版)。 */
function forceReloadClients(){
  try{
    return self.clients.matchAll({ type: 'window' }).then(function(cs){
      var i; for(i = 0; i < cs.length; i++){
        try{ cs[i].postMessage({ type: 'MG_FORCE_RELOAD', ver: MINI_VERSION }); }catch(e){}
        try{ cs[i].postMessage({ type: 'MG_SHELL_UPDATED' }); }catch(e){}   /* 舊版頁面(v1.159.0+)認得這個,至少會把版本徽章轉紅 */
      }
    })['catch'](function(){});
  }catch(e){ return Promise.resolve(); }
}

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        // ★ 只清「自己前綴」的舊版本;主程式的快取一律不動
        if(k.indexOf('lxps-mini-') === 0 && k !== SHELL && k !== ASSET && k !== ISLAND){   /* ★ v1.76.0 保留荒島安裝快取 */
          return caches['delete'](k);
        }
      }));
    })
    .then(function(){ return purgeStaleProgramCopies(); })   /* ★ v1.180.0 見上方說明:唯一救得回已凍結裝置的一步 */
    .then(function(){ return self.clients.claim(); })
    .then(function(){ return forceReloadClients(); })
  );
});

function timeoutAfter(ms){
  return new Promise(function(_, rej){
    setTimeout(function(){ rej(new Error('timeout')); }, ms);
  });
}

/* ══ ★ v1.127.0(2026-09-14・老師:「已經完整下載遊戲了,開遊戲讀取圖片還是很慢,常常看不到圖片或聽不到音樂音效」)══
   三個根因對應三支新 helper:
   ① 同源素材(../答對.mp3 這種落在 /minigame/ 以外的檔案)以前完全沒被本 SW 攔截 ⇒ 每次都走網路。
      改成 cache-first,第一次抓到就永久留著。
   ② 帶 ?v= 版號的檔案(minigame_db.js / minigame_island_db.js)以前跑 network-first,
      每次開機都先等網路最多 2.5 秒才退快取——可是版號本身就是快取破壞鍵,URL 沒變就代表內容沒變,
      根本不需要問網路。改成 cache-first(與 /minigame/img/ 同一套邏輯)。
   ③ minigame_index.html(1.6 MB)以前也是 network-first ⇒ 校網慢的時候整整卡 2.5 秒才開始畫面。
      改成 stale-while-revalidate:先用快取秒開,網路在背景更新;背景發現內容真的變了才通知頁面,
      由頁面既有的「版本徽章」轉紅提示重新整理(minigame_sw.js 本身維持 network-first,徽章才驗得到新版)。 */
/* ══ ★ v1.171.0(2026-09-15・老師:「荒島求生已經完整下載安裝,載入圖片常常很慢」)══
   【根因二】iOS Safari 的 <audio>/<video> 幾乎都用 Range 請求(bytes=0-1 起手),而舊寫法一看到 range 標頭就整個不攔截
   ⇒ 完整下載存進去的 100 多支音效音樂,在 iPad 上永遠是「存了卻用不到」,每次都重新走網路,跟圖片搶同一條連線。
   改法:快取裡有整包(200)時,自己切出真正的 206 Partial Content 回應(帶 Content-Range/Accept-Ranges),
   這才是 Safari 要的東西;舊註解擔心的「拿 200 去回應 206 請求」那個坑因此也一併避開。
   ⚠ 一定要先 clone 再讀 arrayBuffer:Response 的 body 只能讀一次,解析失敗要能原封不動退回整包。 */
function rangeFromCache(req, hit){
  var h = (req.headers && req.headers.get && req.headers.get('range')) || '', m = /bytes=(\d*)-(\d*)/i.exec(h), copy;
  if(!m) return Promise.resolve(hit);   /* 解析不出來 ⇒ 整包回去(瀏覽器收到 200 會自己處理) */
  copy = hit.clone();
  return copy.arrayBuffer().then(function(buf){
    var total = buf.byteLength, start, end, n, slice, hs, ct;
    if(m[1] === ''){ n = parseInt(m[2], 10) || 0; start = Math.max(0, total - n); end = total - 1; }   /* bytes=-N:最後 N 個位元組 */
    else { start = parseInt(m[1], 10) || 0; end = (m[2] === '') ? (total - 1) : Math.min(total - 1, parseInt(m[2], 10)); }
    if(!(total > 0 && start >= 0 && end >= start && start < total)) return hit;
    slice = buf.slice(start, end + 1);
    hs = { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': String(slice.byteLength) };
    ct = hit.headers.get('content-type'); if(ct) hs['Content-Type'] = ct;
    return new Response(slice, { status: 206, statusText: 'Partial Content', headers: hs });
  })['catch'](function(){ return hit; });
}
/* ★ v1.177.0(稽核:15 秒逾時不該套用在「程式檔」上)——
   v1.176.0 的 15 秒逾時是為了「圖片永遠不回應」而加的,對圖片來說逾時回 504 只是破圖,無傷大雅;
   但帶 ?v= 的程式檔(minigame_db.js / minigame_island_db.js)走的是同一支 cacheFirst ⇒
   改版當天一班 25 台同時跟學校 wifi 要新版資料表,只要有一台超過 15 秒就會收到 504,
   <script> 整個載不到 ⇒ window.ISL_DB 是 undefined ⇒ 荒島根本進不去(得重新整理才有救)。
   ⇒ 逾時改成可調:素材維持 15 秒(要的是「不要無限掛著」),程式檔放寬到 45 秒。
   45 秒仍然有上限,不會回到 v1.176.0 之前「永遠懸著」的舊坑;而頁面端直入荒島的輪詢 10 秒就會
   自己拆簾退回大廳,學生再按一次入口時檔案通常已經抓完進快取了。 */
function cacheFirst(req, bucket, ms){
  return caches.match(req).then(function(hit){
    if(hit) return (req.headers && req.headers.get && req.headers.get('range')) ? rangeFromCache(req, hit) : hit;
    /* ★ v1.176.0(老師截圖:回營地卡在「載入 🏕 營地… 0 / 2」不動)——
       0/2 代表那兩張圖**既沒有 onload 也沒有 onerror**。會造成這種「永遠不回應」的,
       就是這裡:快取沒有 ⇒ 走 fetch(req),而校網卡住時 fetch 可以一直不 resolve 也不 reject,
       e.respondWith() 拿到一個永遠不結束的 Promise ⇒ 那張圖的請求就永遠掛著,
       頁面端的 onload/onerror 一輩子等不到 ⇒ 進度條卡在 0/2。
       ⇒ 一律加一道 15 秒逾時,逾時就回 504 讓它「失敗」——圖片 onerror 會觸發,
         載入閘門才數得到、才進得去營地(頁面端另有 6 秒逾時與「直接進去」鈕,兩道各自獨立)。
       ⚠ 15 秒刻意比頁面閘門的 6 秒長:目的是「不要無限掛著」,不是要提早砍掉正在慢慢下載的大圖。 */
    return Promise.race([ fetch(req), timeoutAfter(ms || 15000) ]).then(function(res){
      if(res && res.ok && res.status !== 206){   /* ★ v1.171.0 206 不能進 Cache(cache.put 會直接拋例外) */
        var copy = res.clone();
        caches.open(bucket).then(function(c){ return c.put(req, copy); })['catch'](function(){});
      }
      return res;
    })['catch'](function(){ return new Response('', { status: 504 }); });
  })['catch'](function(){ return new Response('', { status: 504 }); });   /* ★ v1.176.0 連 caches.match 本身失敗也要回一個「失敗」,不能讓 respondWith 永遠懸著 */
}
function swrTag(res){
  if(!res) return '';
  return (res.headers.get('etag') || '') + '|' + (res.headers.get('last-modified') || '') + '|' + (res.headers.get('content-length') || '');
}
function swrNotify(){
  try{
    self.clients.matchAll({ type: 'window' }).then(function(cs){
      var i; for(i = 0; i < cs.length; i++){ try{ cs[i].postMessage({ type: 'MG_SHELL_UPDATED' }); }catch(e){} }
    })['catch'](function(){});
  }catch(e){}
}
/* ⚠ 一律用「正規鍵」./minigame_index.html 讀寫,不用 req 本身當鍵:
   荒島是 ?mode=island 直入、訪客是 ?guest=1、從大廳進來沒有 query ——
   Cache API 是「整條 URL(含 query)當鍵」,拿 req 當鍵會變成三種進場方式各自一份快取、
   而且完整下載存進去的那一份(無 query)永遠對不上 ⇒ 等於沒有快取。
   index.html 的內容跟 query 無關(query 是 JS 執行期自己讀的),共用一把鍵才正確。 */
function staleWhileRevalidate(req){
  var KEY = './minigame_index.html';
  /* ★★ v1.180.0 根治:這裡以前是 `caches.match(KEY)` —— 掃全庫、以快取建立順序先命中者為準。
     完整下載把網頁本體也存了一份進 ISLAND,而 ISLAND 建立得比每一版新的 SHELL 都早 ⇒
     不論背景重抓幾次、把新版寫進 SHELL 幾次,回給使用者的永遠是下載當天那一份。
     改成**只讀當前 SHELL**(caches.open(SHELL).match),SHELL 每版改名 ⇒ 新版 SW 一裝好就必定是空的 ⇒
     第一次開頁一定走網路拿最新,之後才吃自己這版的快取。
     ⚠ 只有「SHELL 沒有、網路也失敗」時才退回全庫(caches.match)——那是離線情境,
       寧可給舊網頁也不要給一片白畫面;線上情境永遠不會走到那裡。 */
  return caches.open(SHELL).then(function(sc){ return sc.match(KEY); })['catch'](function(){ return null; }).then(function(hit){
    var net = fetch(req).then(function(res){
      if(res && res.ok){
        var copy = res.clone(), oldTag = swrTag(hit), newTag = swrTag(res);
        caches.open(SHELL).then(function(c){ return c.put(KEY, copy); })['catch'](function(){});
        if(hit && oldTag && newTag && oldTag !== newTag) swrNotify();
      }
      return res;
    })['catch'](function(){ return null; });
    if(hit) return hit;   /* 有快取 ⇒ 立刻回應,網路更新在背景自己跑完 */
    return net.then(function(r){
      if(r) return r;
      if(req.mode === 'navigate') return caches.match('./minigame_index.html').then(function(h){ return h || new Response('', { status: 504 }); });
      return new Response('', { status: 504 });
    });
  });
}
/* 同源媒體素材(音效/音樂/圖片/影片)—— 副檔名判定,不看目錄 */
function isAssetPath(p){ return /\.(mp3|m4a|wav|ogg|aac|png|jpe?g|webp|gif|mp4|svg)$/i.test(p); }

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
  // ── ★ v1.171.0【根因一】同源素材一律 cache-first,不再分「在不在 /minigame/ 裡」──
  //    舊版只有 /minigame/img/ 與「/minigame/ 以外的素材」兩條 cache-first,
  //    中間漏掉了 /minigame/audio/(17 首荒島 BGM + 5 支音效)⇒ 它們落到下面那條 network-first(2.5s 逾時),
  //    也就是說完整下載安裝把它們存好了,卻每次進場景都重新跟學校網路要一次,還要先等最多 2.5 秒才肯退回快取。
  //    這正是老師說的「已經完整下載安裝,載入圖片常常很慢」:進場景的載入畫面要等 BGM,BGM 每次都在等網路。
  if(sameOrigin && (url.pathname.indexOf('/minigame/img/') >= 0 || isAssetPath(url.pathname))){
    e.respondWith(cacheFirst(req, ASSET));   /* ★ v1.127.0 抽成共用 cacheFirst() */
    return;
  }

  // ── ★ v1.127.0 優化①(已於 v1.171.0 併入上面那條)──
  //    原本這裡只處理「同源但落在 /minigame/ 以外」的素材,且一看到 Range 標頭就不攔截。
  //    v1.171.0 起:同源素材(不分目錄)一律走上面那條 cache-first,Range 由 rangeFromCache 切出真正的 206,
  //    iPad 的 <audio> 才吃得到完整下載安裝存下來的音檔。本段保留註解當記錄,不再有程式碼。

  // ── ★ v1.127.0 優化②:本目錄帶 ?v= 版號的檔案(minigame_db.js / minigame_island_db.js)改 cache-first ──
  //    版號就是快取破壞鍵:URL 一樣 = 內容一樣,不需要每次先問網路再等 2.5 秒逾時。
  if(inScope && url.search.indexOf('v=') >= 0 && url.pathname.indexOf('minigame_sw.js') < 0){
    e.respondWith(cacheFirst(req, SHELL, 45000));   /* ★ v1.177.0 程式檔逾時放寬到 45 秒(見 cacheFirst 上方說明):15 秒對慢網路太短,回 504 等於資料表整個載不到 */
    return;
  }

  // ── ★ v1.127.0 優化③:minigame_index.html(1.6 MB)改 stale-while-revalidate,先秒開再背景更新 ──
  if(req.mode === 'navigate' || (inScope && url.pathname.indexOf('minigame_index.html') >= 0)){
    e.respondWith(staleWhileRevalidate(req));
    return;
  }

  // ── 本目錄 shell(其餘:minigame_sw.js/manifest/圖示):network-first(2.5s 逾時)→ 快取 ──
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
