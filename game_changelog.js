// ════════════════════════════════════════════════════════════════════════
//  game_changelog.js  —  LXPSGAME 更新日誌
//  最後更新:2026-07-21  / 目前主程式版本:v4.69.0(造型工房紙娃娃/管理員預設·管理員測試)
//  ★ 永久規則(老師 2026-07-18):管理員測試期間的功能,更新日誌條目一律加 adminOnly: true
//    (index.html _filterChangelogForDisplay 對非管理員整筆隱藏·不干擾學生);
//    功能正式開放時,另發玩家版開放公告(新條目·不標 adminOnly)。
//    目前已標 9 筆主角系統測試期條目:v4.55.0/v4.56.0/v4.58.1/v4.59.0/v4.60.0/v4.60.1/v4.61.0/v4.62.0/v4.63.0/v4.63.1
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
  // v4.69.0 — 造型工房:紙娃娃說明+全部件尺寸+管理員定位設預設+玩家用預設勾選·管理員測試
  {
    ver: 'v4.69.0',
    date: '2026-07-21',
    adminOnly: true,
    brief: [
      '👤 造型工房升級!標題下方多了一行說明「每個部位都像紙娃娃一樣,可以調整位置和尺寸哦!」現在「每個部位」(頭、身體、頭髮、衣服、帽子、眼鏡、嘴巴…)都能像紙娃娃一樣移動位置、變大變小。每個部件多了「☑使用預設」的勾選:勾著=用老師調好的漂亮預設;把勾勾拿掉就能自己調,還有「↺回預設」一鍵回到預設。(造型工房測試中,先開放給管理員)',
    ],
    items: [
      '★ v4.69.0【需求一·紙娃娃說明】造型工房標題下追加雙版說明(premium「每個部位都像紙娃娃一樣,可以調整位置和尺寸哦!」/cute「每個部位都像紙娃娃,可以移動、變大變小哦!」·鐵律1.232)。',
      '★ v4.69.0【需求二·尺寸擴大全部件·2乙】原本只有飾品(頭戴/眼鏡/嘴飾)能調尺寸→現在所有部件皆可(全畫布件 baseH/baseB/ofh/ofb/hh/mouth/held 的尺寸縮放接進 _ofsWrap:頭群組以瞳孔中線為軸、身/持物以下半身中心為軸;飾品維持 _avAccLayer 自身中心縮放·順修其讀取 cap ±20→±50 對齊寫入)。',
      '★ v4.69.0【需求二·管理員雲端預設·1丙】新增 gameConfig/avatarPartDefaults(同 avatarLocks 模式·僅 GM 可寫·登入者可讀·走 gameConfig 既有 rules 免新增條款){defaults:{"key":[dx,dy,尺寸%]}}。管理員取消「使用預設」→調整→按「📌設為預設」即寫雲端·全體玩家登入即套用;另有「📤匯出預設JSON」供日後寫進程式永久保存(丙)。',
      '★ v4.69.0【需求二·玩家用預設勾選·3乙】每個部件微調區新增「☑使用預設位置/尺寸」勾選:勾=用管理員雲端預設(鎖微調·只顯示預設值)·取消=自己調(從預設值起·方向鍵±1位置/±1%尺寸·↺回預設);單一真相 _avEffPos(cfg,key)供 render(_ofsWrap/_avAccLayer)與微調 UI 共用;cfg.posDef[key] 隨 avatarCard 上雲(merge:true 免改 rules)·玩家動微調鈕自動 posDef=false。',
      '★ v4.69.0【範圍與相容】全在 avatar_db.js(index/admin/changelog 版號對齊);舊玩家已存的位置/尺寸(cfg.pos)無 posDef 者預設「使用預設」→吃管理員預設(雲端未設則退回舊值/歸零)·不遺失。★本版同時攜帶未部署主線 v4.68.0(章節選擇+BGM)/v4.68.1(場景切換連貫)修正(主線 _MAINSTORY_ADMIN_ONLY 管理員限定·安全)。九版號同步點對齊 v4.69.0·changelog 恰 20 條·無真?.·BOOT_VER 未動。',
    ],
  },
  // v4.68.1 — 主線劇情場景切換連貫性:常駐黑底+交叉淡入(不再露出關卡頁)·管理員測試
  {
    ver: 'v4.68.1',
    date: '2026-07-21',
    adminOnly: true,
    brief: [
      '📖 主線劇情切換場景更順了!之前換場景時,舊圖消失、新圖還在載入的那一秒會露出後面的關卡選擇頁(閃一下)。現在鋪了一層黑底把後面擋住,而且會等新場景圖「載好」才淡入切換——舊場景會撐著、新場景圖就緒才交叉淡入,中間不會再有空檔或閃現關卡頁。(測試中,先開放給老師)',
    ],
    items: [
      '★ v4.68.1【常駐黑底】新增 mainstory-backdrop(position:fixed;inset:0;z-index:9780;背景 #0a0618 不透明·pointer-events:none):整個主線期間鋪在場景(9800)/選單(9790)之下,填補「舊場景移除→新場景圖尚未載入」的空檔,徹底杜絕露出後面關卡選擇頁。_msEnsureBackdrop 於播章/開選單時建立·_msExitStoryBgm(離開主線)移除。',
      '★ v4.68.1【不透明底色】場景 overlay 背景末層加上 #0a0618 實色(url 圖→漸層→實色):即使場景圖尚未載入,overlay 本身也不透出後面,雙重保險。',
      '★ v4.68.1【交叉淡入·真正無空檔】_msPlayScene 改「舊場景改名保留(mainstory-overlay-prev)不立即移除」+ 新場景 opacity:0 起(transition 0.45s)+ new Image() 預載本場景圖 → onload(或無圖/逾時 1.5s 兜底/已快取)才把新場景淡入並移除舊場景;_proceed 不再自行淡出/移除(交由下一場景載圖就緒後交叉淡入·末場景由 _msRunChapter.done() 收);切場景前清殘留 -prev、done() 一併清 -prev 防疊加。',
      '★ v4.68.1【範圍與驗證】只改 index.html 主線引擎(場景切換/黑底);avatar_db.js/admin_panel.js/game_changelog.js 僅版號同步·hero_db.js 未動;無 ?.·九版號同步點全對齊 v4.68.1·changelog 恰 20 條·BOOT_VER 未動。',
    ],
  },
  // v4.68.0 — 主線劇情:章節選擇視窗(已完成/未完成/回顧)+主線專屬 BGM·管理員測試
  {
    ver: 'v4.68.0',
    date: '2026-07-21',
    adminOnly: true,
    brief: [
      '📖 主線劇情新增「章節選擇視窗」!點主線劇情會列出全部章節,每章清楚標示 ✅已完成 / ▶未完成 / 🔒尚未解鎖,還有進度條看你走到哪。已完成的章節可以「🔁 回顧劇情」重新看一次完整內容;還沒解鎖的章節要先完成前一章才會打開。另外主線劇情現在有專屬背景音樂了——序章和前面的熱血章節配「冒險小隊出發」,貓空異變、花林魅惑、深坑臭氣、黑暗球等緊張章節配比較有戲劇張力的劇情音樂,離開主線會自動換回關卡頁的音樂。(測試中,先開放給老師)',
    ],
    items: [
      '★ v4.68.0【章節選擇視窗】新增 _msOpenChapterSelect:全螢幕列出序章+一~六章,每章標示 ✅已完成 / ▶未完成(可繼續) / 🔒尚未解鎖;頂部進度條 X/7 + 百分比;全六章通關顯示 🏆 通關提示。主線入口鈕(_msOpenMainStory)改為開此視窗(原本直接跳下一未完章)。章節卡片依狀態上色(綠/琥珀/灰)·雙版文字(鐵律1.232)·大按鈕 touch-action:manipulation(iPad 好點)。',
      '★ v4.68.0【回顧劇情】已完成章節提供「🔁 回顧劇情」→ _msRunChapter(cid, cb, {review:true}):從第一場景重播該章完整內容·不記續播點·不重複標記完成/發獎(冪等·純重播)。未完成的當前章顯示「▶ 開始/繼續冒險」(有續播點則顯示繼續)·從續播點接續。播完一章自動回章節選單,方便挑下一章或回顧其他章。',
      '★ v4.68.0【尚未解鎖】章節依序解鎖:只有「第一個未完成章」可進行,之後的章顯示 🔒 並提示「先完成前一章才會解鎖」(維持主線循序敘事)。',
      '★ v4.68.0【主線專屬 BGM】根據場合挑選現有音樂:章節選單 + 序章/第一章/第二章 = 冒險小隊出發(bgm-adv-march);第三章貓空異變/第四章花林魅惑/第五章深坑臭氣/第六章黑暗球 = 台灣關卡簡介劇情BGM(bgm-taiwan-cutscene·較具戲劇張力)。進主線(選單/播章)以 bgmFadeTo 切入;離開主線(關閉視窗 / 首登序章播完)還原關卡頁 BGM 貓空冒險(bgm-adv-scene)。_msEnterStoryBgm / _msExitStoryBgm 集中管理·window._msInStory 旗標防重複存曲。',
      '★ v4.68.0【範圍與驗證】只改 index.html(主線引擎:BGM 管理 + _msRunChapter 加 review/BGM + _msOpenMainStory 改開選單 + 新增 _msOpenChapterSelect/_msPlayFromSelect);avatar_db.js/admin_panel.js/game_changelog.js 僅版號同步·hero_db.js 未動;無 ?.·九版號同步點全對齊 v4.68.0·changelog 恰 20 條。戰鬥/教學類 act(battle_*/tutorial_*)仍留待批次2b/3。',
    ],
  },
  // v4.67.0 — 主線劇情批次2a:序章接線(捏臉/名片/加入演出/次元裂縫)·管理員測試
  {
    ver: 'v4.67.0',
    date: '2026-07-21',
    adminOnly: true,
    brief: [
      '📖 主線劇情更好玩了!序章帶你「捏臉」做主角、看冒險者名片、夥伴「加入隊伍」演出,裂縫穿越也有畫面轉場;第三、四章通關還會直接收服 SR 夥伴(劍士/祭司/守衛/刺客/火法師),而且玩到一半離開,下次能接著上次的地方看。(測試中,先開放給老師)',
    ],
    items: [
      '★ v4.67.0【主線批次2a】新增演出動作分派器 _msRunAct:每段對白播完後執行該場景的 act,完成再自動續播下一段(無 act 直接續播·全程 try-catch + watchdog 防卡死)。',
      '★ v4.67.0【序章接線】捏臉(open_avatar_studio→開造型工房·掛 _avatarPanelClose 偵測離開續播)/名片(set_card→展示自動生成的冒險者名片·掛 _avatarCardClose)/加入隊伍(join_prologue:小劇團員‧直笛團員‧弦樂團員‧動物學家 純敘事演出·不發卡·初始8英雄建帳號即贈)/次元裂縫(改暗場穿越對白+結尾淡出全黑→下一場景淡入·不做影片)。',
      '★ v4.67.0【加入演出全通】join_ch1 籃球隊員‧田徑隊員 / join_ch2 程式設計師‧電腦繪圖師(初始8英雄至此全數登場·純敘事) / join_ch3 劍士‧祭司 / join_ch4 守衛‧刺客‧火法師 加入隊伍演出。',
      '★ v4.67.0【SR 夥伴解鎖(Q3)】第三章通關直接解鎖 劍士‧祭司;第四章通關直接解鎖 守衛‧刺客‧火法師(共 5 位 SR·經 advSaveUnlockedHero 來源 mainstory_clear·圖鑑顯示「主線劇情獲得」)。已擁有者每重複 1 位改為 +5 召喚水晶。維持 SR 稀有度(不進 SUMMON_RARE_HEROES SSR 池·5 位皆早在 _PLAYER_HERO_NAMES 白名單與 ADMIN_ALL_HEROES 之內·免造角)。發放綁章節通關 reward·冪等(_r_chap_chX)。',
      '★ v4.67.0【火法師登場】第四章花林新增火法師登場對白(火剋魅惑妖花·雙版說明);火法師為既有 hero_db 英雄,故事化收服。',
      '★ v4.67.0【主線關卡進度綁 UID(Q2)】主線改為「章節內場景續播點」:玩到一半離開,下次從上次那一段接續(_sc_chX·綁 UID·雲端 mainStoryProgress + 本地 lxps_mainstory_uid 鏡像·取大還原·整章完成清除)。與戰鬥/一般存檔分離·只增不退。',
      '★ v4.67.0【場景圖】MAINSTORY_DB 9 張場景圖副檔名 .png→.jpg(配合 JPGq90 場景圖省流量);保留 貓空BOSS戰背景/深坑老街/臭豆腐BOSS/第一章河堤 為 .png 不動。',
      '★ v4.67.0【範圍與驗證】只改 index.html(主線引擎+DB);avatar_db.js/admin_panel.js/game_changelog.js 僅版號同步·hero_db.js 未動;無 ?.·九版號同步點全對齊 v4.67.0·changelog 恰 20 條。戰鬥/教學類 act(battle_*/tutorial_*/grant_sword/awaken_hero)留待批次2b/3。',
    ],
  },
  // v4.66.0 — 自訂角色安全開關(隨機變裝暫停 + GM鎖款玩家隱藏·管理員測試)
  {
    ver: 'v4.66.0',
    date: '2026-07-20',
    adminOnly: true,
    brief: [
      '🎲 打扮小屋:「隨機變裝」先暫停整理中,還有一些服裝在準備;老師鎖起來的款式也先不顯示,等做好、開放後就會出現囉!(測試中)',
    ],
    items: [
      '★ v4.66.0【自訂角色】隨機變裝暫時關閉(window._AV_RANDOM_OFF·部分套裝素材整理中,避免抽到未完成款;點選會提示整理中·邏輯完整保留,日後 _AV_RANDOM_OFF=false 一鍵重開)',
      '★ v4.66.0【自訂角色】GM 上鎖款對「非管理員」完全隱藏(連鎖定預覽也不顯示,等對應套裝素材修好重傳、GM 解鎖後才對玩家出現;管理員照常可見、可切換測試)',
      '★ v4.66.0【範圍與驗證】只改 avatar_db.js(index.html/admin_panel.js/game_changelog.js 僅版號同步);無 ?.·九版號同步點全對齊 v4.66.0·changelog 恰 20 條。',
    ],
  },
  // v4.65.0 — 主線劇情模式 Phase 1 地基(穿越冒險故事外殼·管理員測試)
  {
    ver: 'v4.65.0',
    date: '2026-07-20',
    adminOnly: true,
    brief: [
      '📖 全新「主線劇情」要來囉!跟著力行小學生穿越到異世界,和夥伴一起冒險、學會戰鬥和馴養,最後喚醒你自己的主角!(測試中,先開放給老師)',
    ],
    items: [
      '★ v4.65.0【主線劇情】Phase 1 地基:資料驅動章節腳本 MAINSTORY_DB(序章~第六章)+ 過場播放引擎(獨立 overlay 鏈式·打字機對白·可跳過·影片插槽缺檔靜默 fallback·防卡死 watchdog)',
      '★ v4.65.0【主線劇情】進度 self-write(mainStoryProgress·players 主檔 merge·免改 rules)+ 各章 🔮×5 / 全通關 🌈SSR隨機召喚卷×1 冪等發獎(序章不發)',
      '★ v4.65.0【主線劇情】關卡頁「📖 主線劇情」入口 + 首登自動導入序章(admin gating 測試期·防疊加守門);演出動作(造型工房/夥伴加入/教學/劇情戰)批次2/3 接既有系統',
    ],
  },
  // v4.64.2 — 頭飾尺寸上限 ±50% + 素體/部件圖快取自清 + 眼鏡白鏡片版補齊(管理員測試)
  {
    ver: 'v4.64.2',
    date: '2026-07-20',
    adminOnly: true,
    brief: [
      '👤 打扮小屋:如果基本身體或配件沒更新到最新樣子,這次會自動幫你清掉舊圖、重新抓最新的,不用手動清快取囉!',
      '📐 帽子、眼鏡、嘴巴小物的「大小」現在最多可以調到 ±50%(以前 ±30%),放很大或縮很小都行!',
      '👓 眼鏡的「白色鏡片」樣式修好了,之前有幾款白鏡片會空白抓不到圖,現在正常顯示。',
    ],
    items: [
      '★ v4.64.2【自訂角色】所有頭飾(頭戴/眼鏡/嘴部飾品)尺寸縮放上限 ±30% → ±50%',
      '★ v4.64.2【素體/部件】圖快取自清:avatar_db 版本升級時主動刪 ASSET_CACHE 內 avatar_parts 圖條目,根治個別裝置 SW 對舊圖頑固命中(v4.64.1 boy/kidboy 素體只更新一半事件),不再只依賴 ?v= query 破快取',
      '★ v4.64.2【眼鏡】白鏡片版 gls_X.png ×9 補齊:repo 原缺白版(全 404·只有透明 _clear 版)致玩家切「白色鏡片」載入失敗;程式 P.glasses img 引用本已正確,補上 9 張白版素材即解決',
    ],
  },
  // v4.64.0 — 自訂角色系統大改版(頭身新切法素材+頭飾/眼鏡/嘴飾+GM上鎖通道·管理員測試)
  {
    ver: 'v4.64.0',
    date: '2026-07-20',
    adminOnly: true,
    brief: [
      '👤 打扮小屋大升級!髮型和套裝現在是「整顆頭」和「整套衣服」直接換,點一下就換好,不會疊在一起囉!',
      '🎩 新增 10 頂帽子、10 副眼鏡、9 種嘴巴小物(吐司、棒棒糖、口罩、奶嘴…),搭配隨你玩!',
      '📐 每個部件都可以自己按上下左右微調位置,飾品還能調大小(±20%),調到最滿意的樣子!',
      '👀 眼鏡可以切換「透明鏡片(看得到眼睛)」或「白色鏡片」兩種樣式!',
      '🔊 選裝扮、按確認、按重來都有可愛音效!',
    ],
    items: [
      '★ v4.64.0【自訂角色】素體改頭身拆層渲染(新切法 8 件·chin 118/125/165/157·頸頂=chin−15);部件 URL 全面 ?v= 破快取',
      '★ v4.64.0【髮型/套裝】P.hairhead 25 件 14 款整頭件、P.outfit 34 件 13 款頭身分離套裝;互斥更換語意(選套裝清髮型頭·選髮型保留套裝身)',
      '★ v4.64.0【配件】頭飾 10/眼鏡 10/嘴部飾品 9(prop 定位引擎:AVATAR_HEAD_GEO 實測幾何自動對位四體型);選單十項定版;全部件 XY 微調 ±100 + 飾品尺寸縮放 ±20%(cfg.pos [dx,dy,尺寸%]);眼鏡鏡片雙版(img 白鏡片/clearImg 透明·cfg.glsClear 開關預設透明);工房背景影片循環接點 0.5s 淡出/淡入轉場',
      '★ v4.64.0【GM】上鎖通道 gameConfig/avatarLocks(工房內 🔓/🔒 直接切換·被鎖款走 avatarCard.unlock 帳本·取得方式後續設計);三音效(選擇/確認/取消模組.mp3)',
    ],
  },
  // v4.63.1 — 🎵 造型工房 BGM:進工房自動播放·離開切回關卡音樂(管理員測試中)
  {
    ver: 'v4.63.1',
    adminOnly: true,   /* ★ 主角系統測試期內容·僅管理員可見(老師 2026-07-18 永久規則) */
    date: '2026-07-20',
    brief: [
      '🎵【造型工房也有音樂了!(老師測試中)】打開「自訂主角」造型工房,會自動響起專屬的打扮音樂,邊聽邊幫主角換造型更有氣氛!',
      '🚪 按「離開」關掉工房時,音樂會輕輕淡出,自動切回關卡選單原本的背景音樂,完全不用自己動手!',
      '📱 也修好了平板上有時第一次點開名片會聽不到音樂的小狀況,現在一點開就聽得到!',
    ],
    items: [
      '★ v4.63.1【造型工房 BGM・avatar_db.js 為主】①_avatarOpenPanel 進工房自動播 自訂角色名片.m4a(共用 audio#bgm-avatar-card·先記原播曲 _avPanelPrevBgm·bgmFadeTo 500ms 淡入) ②新增 window._avatarPanelClose 統一關閉:收面板+名片曲淡出→有原曲淡回原曲/無原曲 bgmStop 後 bgmEnsureSceneBgm 依場景補播(冒險選關頁= bgm-menu-01);離開鈕 onclick 改走統一關閉 ③iPad 舊 Safari 首播保險(工房與名片同套):點擊授權內先將 bgm-avatar-card 音量 0 同步 play() 解鎖媒體元素,再交 bgmFadeTo 正常流程(避免 500ms 淡出 timer 內的 play 因失去手勢授權被拒→安靜) ④名片 BGM 加 _avCardStartedBgm 旗標:工房曲已在播時開名片不重起、關名片不誤停(修 _avCardPrevBgm 為空時走 bgmStop 把工房曲關掉的邏輯洞) ⑤index.html/admin_panel.js 僅版號對齊;無 ?.。',
    ],
  },
  // v4.63.0 — 🤝 好友名單「切換成名片」檢視模式(管理員測試中)
  {
    ver: 'v4.63.0',
    adminOnly: true,   /* ★ 主角系統測試期內容·僅管理員可見(老師 2026-07-18 永久規則) */
    date: '2026-07-19',
    brief: [
      '🤝【好友名單・切換成名片!(老師測試中)】好友頁新增「🪪 切換成名片」按鈕,一鍵把好友名冊變成大頭照名片牆!',
      '🪪 名片牆上每位好友都用自己打扮的冒險者造型當大頭照,一眼認出誰是誰,點大頭照就能看完整名片!',
      '🟢 大頭照右上角有線上小綠燈,誰在線上一看就知道;再按一下「📋 切換成清單」就變回原本的名冊!',
    ],
    items: [
      '★ v4.63.0【好友名單名片檢視模式・index.html 為主】①面板標題列新增「🪪 切換成名片/📋 切換成清單」切換鈕:偏好記 localStorage(_friendPanelCardMode) 下次開面板沿用;與 📇 名片按鈕同 _AVATAR_ADMIN_ONLY gating(測試期僅管理員可見·正式開放改 avatar_db.js 單一開關);avatar_db.js 未載入(_avatarRenderSVG 不存在)不顯示按鈕不炸 ②名片模式=名片縮圖網格:每位好友一張 3:4 上半身特寫大頭照(_avatarRenderSVG(cfg,null,true)·v4.61.0 名片同款構圖),資料來源 _friendHeroData[uid].avatarCard(v4.55.0 _fbLoadFriend 已整份讀回·零額外 Firestore 讀取);未捏臉好友顯示預設造型+「尚未設定造型/還沒打扮喔」角標(鐵律1.232 雙版·_fpSimple 分流·按鈕與 title 同雙版);點縮圖 _openFriendAvatarCard 開完整名片;線上燈號沿用 class=_friend-presence-dot data-friend-uid 機制移至縮圖右上角(_applyFriendPresenceDots/onSnapshot 免改直接套) ③網格欄寬:名片模式 minmax(168px,1fr)/清單模式維持 280px ④_refreshFriendListInner(好友資料 lazy load 完成的增量更新路徑)在名片模式改走整面板重渲 _renderFriendPanel(清單模板直接蓋會把名片網格洗掉;輸入中延後 500ms 守門為既有機制·重渲後補套 _applyFriendPresenceDots) ⑤avatar_db.js/admin_panel.js 僅版號對齊(AVATAR_DB_VERSION 順帶破素材快取·老師剛上傳的 avatar_parts 新素材可正確更新);無 ?.。',
    ],
  },
  // v4.62.0 — 👤 我的主角:名片BGM+動態背景+特寫優化+重置視窗(管理員測試中)
  {
    ver: 'v4.62.0',
    adminOnly: true,   /* ★ 管理員測試期內容·僅管理員可見(老師 2026-07-18 永久規則) */
    date: '2026-07-19',
    brief: [
      '👤【我的主角・體驗四升級!(老師測試中)】打開冒險者名片會播放專屬的名片音樂,關掉名片就自動換回原本的背景音樂!',
      '🎬 造型工房加上全螢幕動態影片背景,幫主角打扮的時候超有氣氛!',
      '🔍 按「放大」看特寫時,現在只放大人物、背景保持原本大小,構圖更自然、背景不會糊掉!',
      '↩️「全部重置」的確認視窗換成遊戲風格的漂亮視窗,不再是瀏覽器的小灰框!',
    ],
    items: [
      '★ v4.62.0【自訂角色優化四合一・avatar_db.js+index.html】①名片專屬 BGM:index.html 新增 audio#bgm-avatar-card(preload=none·raw 網址載 自訂角色名片.m4a·loop);_avatarOpenCard 開名片時掃 audio[id^=bgm-] 記住原播曲(window._avCardPrevBgm)→ bgmFadeTo 淡入名片曲;新 _avatarCardClose 統一關閉(✕/點背景皆走此)→ 有原曲 bgmFadeTo 淡回·無原曲 bgmStop;染色重繪 _avatarCardRerender 重開時名片曲已在播即跳過不重起(不斷音) ②造型工房全螢幕動態影片背景(自訂角色動態背景.mp4·比照寵物小屋 v4.2.0 模式):createElement video muted autoplay playsinline·z-index:-1 蓋面板漸層底在正常流內容之下·onloadeddata 淡入/onerror 靜默移除露出漸層底·brightness(0.55) 壓暗保右側選單可讀·隨面板關閉一併移除·URL 帶 ?v=AVATAR_DB_VERSION 破快取 ③特寫改「只放大人物·背景尺寸不變」:_avatarRenderSVG PNG 路徑 portrait 時 viewBox 維持全幅 0 0 360 480(_bgLayer 背景照常鋪滿),人物全部圖層包 <g transform=scale(480/_pRect.h) translate(-x,-y)> 群組把特寫矩形映射回全畫布(_pRect=v4.61.0 同款頸線+118 構圖·3:4 等比故 X/Y 縮放一致);背景層在群組外;名片(portrait=true)同構圖自動生效;legacy SVG 路徑(無背景層)維持舊 viewBox 裁切零改動 ④全部重置確認框改遊戲內建風格視窗:新 _avShowConfirm(title,msg,onOk)(樣式同造型工房/名片·z20005·✅確定/✖取消/點背景取消·文字 _avT 雙版=鐵律1.232);_avatarResetAll 改走此視窗(瀏覽器原生 confirm 舊寫法保留註解·誤刪是大忌);拆層隱藏規則不變(整頭→隱藏素體頭+髮+五官件·整身/整套→隱藏素體身+衣物層·服裝分頁單件維持覆蓋法不隱藏素體);admin_panel.js 僅版號同步·無 ?.。',
    ],
  },
  // v4.61.0 — 👤 我的主角:面板大改版(直式選單/隨機組合/特寫名片·管理員測試中)
  {
    ver: 'v4.61.0',
    adminOnly: true,   /* ★ 管理員測試期內容·僅管理員可見(老師 2026-07-18 永久規則) */
    date: '2026-07-18',
    brief: [
      '👤【我的主角・面板全新排版!(老師測試中)】右邊選單改成由上到下十個項目:換身體/隨機組合/套裝/膚色/表情+瞳色/髮型+髮色/服裝+配色/手持(日後開放)/背景/全部重置,一眼看懂!',
      '🎲 全新「隨機組合」:按一下就幫你亂數搭配整套或混搭造型加隨機配色,手氣好就是最帥最可愛的造型!「全部重置」一鍵變回原本的樣子(體型和名片的話會保留)。',
      '🔍 預覽圖新增「放大」按鈕:等比例放大上半身特寫,眼睛瞳色看得一清二楚!名片(戰鬥卡片預覽圖)也改用特寫構圖,配上你選的背景超有型!',
      '💇 髮型款式選單重新開放:20 款髮型配 16 種髮色又回來了!',
    ],
    items: [
      '★ v4.61.0【面板改版・avatar_db.js】①_AV_TABS 十項直式重排(老師指示序):換身體(體型獨立)/隨機組合(act)/套裝(full+headfull+bodyfull)/膚色/表情+瞳色(eye+eyeC+mouth+gls+ear+browC)/髮型+髮色(P.hair 重新開放)/服裝+配色(top+btm+sh+clothC)/手持(wip 日後開放佔位)/背景(bg)/名片語錄(非清單項·保留座右銘入口可移除)/全部重置(act);面板右側改「直式選單欄+選項區」左右並排;act 項按下直接執行不切頁(_avatarSwitchTab 分流)②_avatarRandomize:當前體型可用+已解鎖款亂數(_avAvailIds 同選單過濾規則·gls/sh 短名映射),三模式輪盤(整套/整頭+整身混搭/自由搭配髮+衣),顏色全隨機(膚/髮/瞳/眉/服裝配色)+配件25%機率+背景隨機;體型/座右銘不動 ③_avatarResetAll:confirm 後 cfg 回預設(體型/座右銘保留)④_avatarRenderSVG 加第三參數 portrait:上半身特寫 viewBox(頸線+118px 高·3:4 等比·臉中心對齊·依體型 META/TF 計算);預覽 🔍放大/🔎縮小 鈕切換 _avZoom;名片卡 _avatarOpenCard 改 portrait=true(=戰鬥卡片預覽構圖·含所選背景)⑤wip/無cats 頁防呆佔位;拆層隱藏規則(v4.60.0)不變;index.html/admin_panel.js 僅版號同步。',
    ],
  },
  // v4.60.1 — 👤 我的主角:體型選單修復 + 眼白修復(管理員測試中)
  {
    ver: 'v4.60.1',
    adminOnly: true,   /* ★ 管理員測試期內容·僅管理員可見(老師 2026-07-18 永久規則) */
    date: '2026-07-18',
    brief: [
      '👤【我的主角・緊急修復!(老師測試中)】「換臉」「換身體」分頁修好了:四種體型(少年/少女/男童/女童)通通選得到,眼鏡和鞋子的選單也回來了!',
      '👀 換造型後眼睛的眼白變透明的問題修復:全部 36 件造型素材重新製作,眼睛白白亮亮!',
    ],
    items: [
      '★ v4.60.1【兩BUG修復・avatar_db.js+素材】①體型選不到根治(老師實機回報):_avRenderOpts/_avatarIsUnlocked 直接 P[cat] 查表但頁籤 cats 用短名 gls/sh(正確鍵 glasses/shoe)→ undefined.length THROW →「換臉」「換身體」整頁 innerHTML 未寫入=空白·體型/膚色/上衣/褲/鞋全選不到;經 vm sandbox 重現確認 v4.58.1 原版同樣 THROW=v4.57 簡化頁籤時的原生 bug 非本輪引入;修法=cat→P 鍵映射(gls→glasses/sh→shoe·對照 _AV_CFG_KEY 逆向)+查無分類顯示繪製中佔位不炸整頁 ②眼白透明根治:素材管線去背「封閉背景塊清除」(灰>10%+白>10%判棋盤格)把含灰色陰影的眼白誤清 → 去背加臉區保護區(角色上42%高·中央64%寬內的封閉塊一律保留)·從 src2 原圖以合成仿射單次 warp 重產 12 整套+24 整頭整身件(免二次重採樣·眼框透明px全數歸0·髮隨頭走/身件髮洞 inpaint 沿用);素體拆層 8 件不受影響未動。',
    ],
  },
  // v4.60.0 — 👤 我的主角:自訂角色大優化(整頭/整身/配色/背景·管理員測試中)
  {
    ver: 'v4.60.0',
    adminOnly: true,   /* ★ 管理員測試期內容·僅管理員可見(老師 2026-07-18 永久規則) */
    date: '2026-07-18',
    brief: [
      '👤【我的主角・大優化!(老師測試中)】全新「造型」分頁登場:除了整套換裝,現在還可以「只換整顆頭」或「只換整個身體」!劍士的頭配和服的身體?魔法師的頭配鎧甲?自由混搭!',
      '🎨 全新「服裝配色」:16 種顏色一鍵改變衣服色系,皮膚永遠不會被染到,膚色可以另外調!瞳色、髮色、膚色現在換上任何造型後都照樣可以調整!',
      '🖼 全新「背景更換」:14 個遊戲場景任你選!台灣地圖、玉山頂、阿里山、台北101、三峽/深坑/彰化老街、寵物小屋、日本神社、日本祭典、埃及沙漠、金字塔、黃金寶庫、至寶星空,讓你的主角站在最喜歡的地方!',
      '💇 髮型款式選單暫時收起來優化中(髮色照常可調),之後會以更棒的方式回歸,敬請期待!',
    ],
    items: [
      '★ v4.60.0【自訂角色優化・avatar_db.js】老師六大系統裁決全實裝:①素體拆層(裁決一乙)body_head/body_torso_{bt}.png 頸線切割(頭件下蓋6px蓋接縫·重組與原素體逐像素一致maxdiff=1)·P.body 加 headImg/torsoImg ②P.headfull 整頭造型(隱藏素體頭+髮型層+眉/眼/鼻/嘴五官件·眼鏡/帽/耳照常疊)③P.bodyfull 整身造型(隱藏素體身+上衣/下衣/襪/鞋層)·衍生素材=12套裝頸線切割24件(整頭件連通過濾去劍柄/肩甲殘片·長髮款垂落段歸整身件側=頸線切割已知限制)④換色引擎改上層渲染(裁決二·染基礎圖沒用已被取代):新 _avatarTintPiece 選擇性染色(逐像素優先序 瞳眼框虹膜→眉框→膚色域→髮=非膚眼框外→服裝=非膚·kind 分 full/headfull/bodyfull/baseHead/baseTorso/cloth 六類規則)·無任何取代件維持既有 _avatarComposeBody 整體路徑零回歸 ⑤clothC 服裝配色(裁決三乙·AVATAR_PALETTES.cloth 16色·膚色像素永遠排除可再調膚色·適用整套/整身/素體運動服/上衣/下衣/鞋層·和服實測可染px與膚+頸上保護區重疊=0)⑥髮型款式選單隱藏(裁決四·P.hair 完整保留·cfg.hair 照常渲染·hairC 髮色保留·舊頁籤註解可復原)⑦P.bg 背景 14 場景(repo 根目錄現有圖·渲染最底層 360×480 slice·encodeURI 處理中文空格檔名·PNG模式清單過濾對 bg 豁免)⑧頁籤重構:造型(整套/整頭/整身/服裝配色/背景)/髮色/換臉/換身體/手持/名片;cfg 新增 headf/bodyf/bg/clothC 四鍵·舊存檔 _pick 容錯退 id0 完全相容;素材 32 件(8 拆層+24 衍生)放 avatar_parts/;index.html/admin_panel.js 僅版號同步。',
    ],
  },
  // v4.59.0 — 👤 我的主角:整套造型系統(12 件·管理員測試中)
  {
    ver: 'v4.59.0',
    adminOnly: true,   /* ★ 管理員測試期內容·僅管理員可見(老師 2026-07-18 永久規則) */
    date: '2026-07-18',
    brief: [
      '👤【我的主角・整套造型登場!(老師測試中)】「換身體」新增「整套造型」:一鍵直接換上整套帥氣/漂亮的完整裝扮,連髮型姿勢都完美搭配好!',
      '⚔ 劍士系列 4 套:輕裝大劍士(男童)/華麗細劍士(少女)/重裝鎧甲劍士(少年)/俏麗雙劍士(女童),背著大劍握著細劍超有冒險者風範!',
      '🧙 魔法師系列 4 套:水藍(女童)/紫電(少女)/赤紅(少年)/翠綠(男童),四色魔法袍加披風,走到哪都是最亮眼的魔法師!',
      '👘 日式和服 1 款四種體型通通有!選「無(自由搭配)」就回到原本自由混搭模式;整套造型只有你的體型有的才會出現,之後會陸續補齊其他體型,敬請期待!',
    ],
    items: [
      '★ v4.59.0【整套造型系統・avatar_db.js】新分類 P.full「整套造型」(換身體頁籤·cfg.full·id0=無 自由搭配):選擇時「隱藏素體基礎圖」直接以整張 fullbody 素材取代(老師裁定),其餘圖層(髮型/眼鏡/帽子/手持等)照常疊加;渲染器素體層改 fullPng 優先(fullPng ? 整套 : 素體染色/素體),膚色/瞳色染色不套用於整套素材(素材自帶完整外觀);首批 12 件=劍士 4(輕裝大劍士 kidboy/華麗細劍士 girl/重裝鎧甲劍士 boy/俏麗雙劍士 kidgirl)+魔法師 4(水藍 kidgirl/紫電 girl/赤紅 boy/翠綠 kidboy)+日式和服四體型齊;素材 504×720 同素體規格·頭頂/腳底對齊素體幾何(切換造型大小不跳動)·檔名 fullbody_{en}_{body}.png 放 avatar_parts/;缺體型格 null 佔位該體型自動隱藏(沿用 v4.58.0 _avImgFor per-body 機制);名稱全雙版(鐵律1.232);_avatarDefaultCfg/_AV_CFG_KEY 補 full 欄位·舊存檔無 full 鍵 _pick 容錯退 id0 完全相容;index.html/admin_panel.js 僅版號同步。',
    ],
  },
  // v4.58.1 — 👤 我的主角:髮型裁切修復 + 介面放大(管理員測試中)
  {
    ver: 'v4.58.1',
    adminOnly: true,   /* ★ 管理員測試期內容·僅管理員可見(老師 2026-07-18 永久規則) */
    date: '2026-07-18',
    brief: [
      '👤【我的主角・造型工房 大改版!(老師測試中)】打扮方式變得超簡單:只有「換髮型」「換臉」「換身體」三大類加名片語錄,一眼就知道要按哪裡!',
      '💇 全新繪製的素材大量上線:髮型 20 款(短髮/雙馬尾/自然長髮/妹妹頭/刺蝟頭/高馬尾/中捲/低馬尾/超長直髮/中分/大馬尾/公主頭/制服頭/精靈捲/旁分/雙辮子/油頭/側馬尾/西瓜頭/中等長髮)配 16 種髮色!',
      '😊「換臉」可以選 6 款眼睛(瞇瞇眼/溫柔眼/帥帥眼/神氣眼/水汪眼/高傲眼)、2 款嘴巴、黑框眼鏡、精靈耳,再調瞳孔和眉毛顏色;「換身體」可以挑體型、膚色,還能換上白T牛仔褲、學生制服、西裝、藍長裙、小洋裝、吊帶裝!',
      '📌 有些款式只有特定體型才有(例如西裝目前只有少年版),選單會自動只顯示你的體型有的款式,之後會陸續補齊,敬請期待!正式開放時間請等公告。',
    ],
    items: [
      '★ v4.58.0【自訂主角簡化+素材接線·avatar_db.js】_AV_TABS 簡化為四頁籤:換髮型(hair+hairC)/換臉(eye+eyeC+mouth+gls+ear+browC)/換身體(body+skin+top+btm+sh)/名片(q);舊八頁籤定義保留於註解可復原。素材=老師人眼對位 aligned 圖 × 差異法抽件四批共 122 件(等比零拉長;髮件為光頭素體上之完整整頭;服裝件完全覆蓋素體;層序 素體→襪鞋褲衣→臉部件→前髮→耳→眼鏡)。缺體型格以 null 佔位,PNG 模式清單過濾改依當前體型(_avImgFor per-body)判定,缺格款於該體型自動隱藏;j===0 預設款永遠顯示(top/btm/shoe id0 更名 預設運動服/預設運動短褲/打赤腳)。',
      '★ v4.58.0【接線明細】髮 20 款(id0/2/3/4/5/6/7/10~22;id3 缺少年、id18 僅少女、id19/22 僅少年、id20 僅幼女、id21 僅幼男)、眼 id3/4/5/10/11/12、嘴 id10/11(少年原圖無變化無件)、眼鏡 id4、精靈耳 id1 解鎖、上衣 id10 白T+套裝 id11 制服/id12 藍長裙(少女)/id13 西裝(少年)/id14 小洋裝(幼女)/id15 吊帶裝(幼男)、下衣 id10 牛仔褲、鞋 id10 帆布鞋;檔名沿用既有槽位規劃(hair_short_boy.png 等),程式引用 126 檔與素材包交叉核對零缺零餘。mouth id0/shoe id11/12 無件維持 _offImg 停用。',
      '★ v4.58.0【範圍與驗證】改 avatar_db.js(頁籤+接線+per-body 過濾)+ index.html(mega 鍵與版號)+ game_changelog.js + admin_panel.js(僅版號)。功能仍受 _AVATAR_ADMIN_ONLY gating 一般玩家不可見。⚠ 部署需同步上傳 avatar_parts/ 資料夾 122 件 PNG(缺檔時選該款=素體原樣不破圖,_imgLayer 空值防呆)。check_inline 21 塊/node --check/孤立代理 0/admin 零真 ?./7 版本同步點全數 → v4.58.0。GAME_CHANGELOG 維持 20 筆(v4.57.0 未部署併入本條)。上傳順序:game_changelog.js → admin_panel.js → avatar_db.js → avatar_parts/ 素材 → index.html(最後)。',
    ],
  },
  // v4.56.0 — 🐉 世界BOSS龍王至寶修正 + 👤 主角造型素材第三批(管理員測試中)
  {
    ver: 'v4.56.0',
    adminOnly: true,   /* ★ 管理員測試期內容·僅管理員可見(老師 2026-07-18 永久規則) */
    date: '2026-07-18',
    brief: [
      '🐉【世界 BOSS 排名獎勵的「龍王至寶」修正!】之前不管當期是哪一隻龍王,獎勵頁分級表上寫的至寶永遠是「炎龍王之牙」(只有按 ? 小圓鈕看簡介才是對的)。現在分級表會跟著當期龍王顯示正確的專屬至寶名稱(例如海龍王之爪、雷龍王之翼、光龍王之羽…)!',
      '🎁【更重要的:實際發下來的至寶也修正了!】原本打贏非火龍王的場次、隔天領取排名獎勵時,發到手的龍王至寶一律變成「炎龍王之牙」——現在會正確發放「你當時擊敗的那隻龍王」的專屬至寶,就算領獎當天已經換下一隻龍王接班也不會發錯!',
      '👤 主角造型工房又進貨啦(老師測試中):新增 8 套完整造型素材——白T牛仔褲便服、學生制服、精靈套裝(金色捲髮+尖耳+高傲眼)、黑框眼鏡書卷風、雙辮子藍長裙、紳士西裝、單側馬尾粉洋裝、吊帶短褲西瓜頭,髮型 7 款、服裝 10 件、眼鏡與精靈耳通通有,正式開放請等公告!',
    ],
    items: [
      '★ v4.56.0【龍王至寶顯示修正·world-boss.js】根因:_WB_DRAGON_TREASURE_MAP 只有 3 筆(維蘇威/翠玉草/山岳)→ 雷/海/暗/光/幻龍王查無 → fallback dragon_fang_fire → 獎勵頁分級表 _wbGetCurrentDragonTreasureName() 永遠回「炎龍王之牙」(? 彈窗 v4.32.0 已改走 index 完整 8 龍王映射所以正確)。修法:①map 補齊 8 筆(與 index _lxpsDragonTreasureMapFull base 一致);②_wbGetCurrentDragonTreasureId 優先走 window._lxpsDragonTreasureId(_wbGetCurrentBoss().id)(與 ? 彈窗同源單一真相),舊路徑保留 fallback。無 ?.。',
      '★ v4.56.0【龍王至寶發放修正·world-boss.js + index.html】根因:領獎時 index 呼叫 _wbGrantDragonTreasure(rank) 只傳名次,grant 內部擲骰取 _WORLD_BOSS_TEAM_REWARDS[tier].dragonTreasureId(五個分級全寫死 dragon_fang_fire)→ 非火龍王場次排名至寶一律發成炎龍王之牙(結算寫入 pending award 的 dragonTreasureId 其實是正確的,但領獎忽略它;且結算隔天 08:00 下一隻龍王已原子接班,不能用「當前龍王」推算)。修法:_wbGrantDragonTreasure 加第二參數 tidOverride 一律優先;index 領獎呼叫改傳 _result.dragonTreasureId。歷史補寫 _advSaveTreasureUnlockHistory 原本就用 _result.dragonTreasureId,發放與歷史自此一致。',
      '★ v4.56.0【主角造型素材第三批·avatar_db.js v4.55.5】老師 20 張變體圖抽出 8 套 76 件 PNG 部件(×四體型):髮型 id15-21(制服頭/精靈捲捲/旁分頭/辮子頭/油亮頭/側馬尾/西瓜頭)、眼 id12 高傲眼(含挑眉+膚色補丁)、耳 id1 精靈長耳掛 PNG 解鎖、眼鏡 id4 黑框、上衣 id10-15(白T/學生制服/藍長裙/西裝/粉洋裝/吊帶裝)、下衣 id10 牛仔褲、鞋 id10-12(帆布/制服鞋/黑皮鞋);渲染行襪/鞋/下衣/上衣/耳/眼鏡補 _avImgFor 四體型陣列支援;雙版名稱(n/ns)全數齊備。長裙/西裝/粉洋裝/吊帶裝為單體型跨體型幾何合成(肩寬+頸地比映射),品質次於原生可日後補生成替換。素材仍受 _AVATAR_ADMIN_ONLY gating,一般玩家不可見。',
      '★ v4.56.0【範圍與驗證】改 world-boss.js(map 補齊+id 解析+grant 簽名)、index.html(領獎傳 override + mega 鍵)、avatar_db.js(v4.55.5 部件接線)。hero_db.js/adv_quiz_db.js/world-boss-ui.html/sw.js 未改免重傳(獎勵頁顯示行在 world-boss-ui.html 內原本就呼叫 _wbGetCurrentDragonTreasureName,修 helper 即生效)。check_inline 21 塊/node --check/孤立代理/admin 零真 ?./7 版本同步點 全數 → v4.56.0。GAME_CHANGELOG 維持 20 筆(移除最舊 v4.35.0)。上傳順序:game_changelog.js → admin_panel.js → world-boss.js → avatar_db.js → index.html(最後);avatar_parts/ 素材資料夾同步上傳。',
    ],
  },
  // v4.55.0 — 主角捏臉系統 Phase 1 + 冒險者名片
  {
    ver: 'v4.55.0',
    adminOnly: true,   /* ★ 管理員測試期內容·僅管理員可見(老師 2026-07-18 永久規則) */
    date: '2026-07-17',
    brief: [
      '👤 搶先預告:全新功能「我的主角」即將登場!到時主畫面會出現入口按鈕,打開「造型工房」就能捏出屬於你自己的主角:4 種體型(少年/少女/小小男生/小小女生)、8 種膚色、16 種髮色、12 種瞳色,加上臉型、髮型、眉毛、眼睛、鼻子、嘴巴各 10 款,自由搭配、左邊立繪即時預覽!',
      '🦊 還有超可愛的變身部件:精靈耳、貓耳、兔耳、狐狸耳、熊耳、狗耳,以及鹿角、龍角、天使翅膀、蝴蝶翅膀、貓尾巴、狐狸尾…有些款式上鎖了 🔒 —— 它們會在之後的「主線劇情」中解鎖,敬請期待!',
      '📇 「冒險者名片」也會一起來!捏好造型後可以選一句名片語錄(20 句可愛台詞任你挑),按「儲存造型」存到雲端;到「🤝 好友英雄」名單,每張好友卡片會多一顆「📇」按鈕,點開就能看好友的主角造型和名片!',
      '☁ 造型會自動存在你的帳號雲端,換一台 iPad 登入也不會不見。目前功能由老師先行測試中,正式開放請等公告,敬請期待!',
    ],
    items: [
      '★ v4.55.0【管理員測試期 gating】(老師指示:先讓管理員測試·對一般玩家隱藏)單一開關 avatar_db.js 內 _AVATAR_ADMIN_ONLY=true;三層防護:①主畫面入口按鈕靜態 display:none+_avatarRefreshEntryVisibility 登入後輪詢(30 秒內·20 次×1.5s)判 _isAdminUser 才顯示 ②好友卡片 📇 按鈕渲染時同開關條件輸出 ③_avatarOpenPanel/_avatarOpenFriendCard 開頭雙保險守門(非管理員 alert「測試中敬請期待」);正式開放=把該行改 false 一處即可全員可見。',
      '★ v4.55.0【主角捏臉系統 Phase 1·架構】全新獨立檔 avatar_db.js(部件庫+SVG 渲染器+造型工房面板+名片+雲端存取整包,index.html 僅 4 個掛鉤:mega-line 鍵/載入行/入口按鈕/好友卡片名片按鈕 → 改動最小化);部件定義 {id,type,svg,lock} 架構支援日後逐件替換 PNG 精繪(老師裁定丙案:Phase 1 SVG 全套上線·美術可漸進升級);Q 版二頭身 viewBox 360×480,色彩換色零額外資產(佔位字串 __SK__/__HC__/__EC__ 渲染時替換,膚8/髮16/瞳12 色票);幼兒體型=身體 group transform 縮矮(不另畫 path·部件 100% 共用)。',
      '★ v4.55.0【雲端與名片】avatarCard 整包 {cfg,unlock,q,ver} 存 players/{uid} 主檔 merge:true(照 representativeHero 模式;players 主檔 allow read: 登入玩家 → firestore.rules 零修改零部署);好友名片讀 _friendHeroData 既有整份 players doc → 零額外 Firestore 讀取;寫入僅「儲存造型」按鈕單次觸發=天然節流(v4.47.0 雲端節流教訓);本機 localStorage lxps_avatarCard_{uid} 快取,面板開啟時背景拉雲端一次跨裝置還原;名片語錄選單制 20 句(不開放自由輸入·900 位國小生校園安全·老師裁定)。',
      '★ v4.55.0【解鎖與雙版】特殊款 lock:{t:soon}=「主線劇情敬請期待」(Phase 2「萬象共鳴」主線掛真條件:獸耳↔對應英雄夥伴等);avatarCard.unlock 陣列帳本已預留(未來 GM 可補發);鐵律 1.232:全部件名稱+UI 說明文字 cute/premium 雙版(_artStyle 分流·avatar_db.js 內建 _avT 工具),主畫面入口按鈕副標註冊 _SIMPLE_TEXT_MAP;avatar_db.js 零 optional chaining、載入失敗僅 console.warn 不影響遊戲其餘功能(入口按鈕與好友名片按鈕都有 typeof 守門)。',
      '★ v4.55.0【驗證基準變更】index.html 新增 avatar_db.js document.write 載入行 → inline script 塊 20→21(check_inline 驗證基準同步更新);sw.js v3.5.90:SHELL_URLS 新增 ./avatar_db.js(隨核心檔快取·離線可用);admin_panel.js 僅版號同步。',
    ],
  },
  // v4.53.0 — 新英雄 麻吉喵‧Nico
  // v4.54.0 — 朱玥天賦強化 + 條件搜尋修正
  {
    ver: 'v4.54.0',
    date: '2026-07-17',
    brief: [
      '🌿 英雄調整—「魔界花使‧朱玥」天賦「百草共鳴」變強了!除了原本的「場上每有 1 名草屬性角色就讓朱玥傷害+治療變強」之外,現在每個新回合開始時,朱玥會讓花香瀰漫全場,用特技 100% 幫我方 HP 最低的 1 位夥伴補血(不會救倒下的夥伴)。',
      '🌿 這道新補血「沒有自己的升級數字」,但它會吃天賦原本的「治療量加成」—— 所以天賦練得越高、場上草屬性夥伴越多,補的血就越多!',
      '🔍 條件搜尋修正:勾「召喚物」現在會正確列出「操偶師」(牠的操偶/城牆本來就有自己的 HP 條卻一直沒被列到);同時把「動物學家、水狐」從召喚物移除(牠們召喚出來的效果不會留下持久的 HP)。',
      '🔍 條件搜尋修正:勾「冰凍」現在找得到「貓人族長」了(原本標籤打錯字,害牠兩邊都搜不到);勾「免死(HP剩1)」也會列出「炎火超少女」(爆發火神附體時不會倒下)。',
    ],
    items: [
      '★ v4.54.0【朱玥天賦新增效果】(老師需求)魔界花使‧朱玥 天賦「百草共鳴」新增:每回合開始時用特技 100% 恢復我方 HP 最低的 1 名友方(★不可復活 → 只找存活且未滿血者;全員滿血或全倒則不觸發)。★升級口徑(老師裁定「此效果的升級不用額外提升,隨著原有天賦提升即可」):本效果不另設升級軌、治療基數固定=朱玥當前特技值×100%,但因走 doHeal 且 actor=朱玥 → 自動吃既有「百草共鳴治療加成 hook」(草屬性存活數×(4+天賦Lv×2)%·總上限+50%)→ 天賦升級時自然一起變強;_TRAIT_LV_INFO 的 base/bonus/max 三軌完全不動(鐵律 1.160 只寫 Lv1 基準)。',
      '★ v4.54.0【朱玥天賦·實作位置】hook 掛 nextRound「救醫馬 救馬本能」之後、冬之戰場速度還原之前 = 新回合開始治療類集中區(與朱玥 S1 春之戰場「每回合開始恢復 20% HP」同一函式 → 語感對齊老師的「每回合開始時」);守門=朱玥存活 + 天賦未被封(_traitSeal / imprison / confused);特技值 spv=floor(sp×(1+sp×0.01)) 與寄生/爆發同口徑;doHeal 帶 actor 讓最高治療統計歸朱玥(v3.16.46 口徑)並自動吃禁療/減療閘門;純治療零傷害零復活 → 完全不涉鐵律 1.31。資料層四表同步:HERO_TRAIT desc/fd、_TRAIT_LV_INFO effect 補述、檔尾 sd 簡單風(鐵律 1.232 雙版齊備)、HERO_SKILL_EFFECTS 補「單體回復HP」;hero_input.html 天賦同步。',
      '★ v4.54.0【英雄 🔍 條件搜尋稽核修正】(老師回報操偶師漏標 + 全表稽核·純篩選顯示層·零戰鬥邏輯):❶老師裁定「召喚物」= 持久性且有獨立 HP 掛在角色身上(卡牌 card-summon-bars 有 HP 條)才算 → 操偶師(_puppetHp/_puppetWall)補標(本就在 v4.52.0 幽魂暗狐 _foxStripSummon 消召喚物權威清單內);動物學家(動物召喚=給友方裝寵物·走 EQUIP 無 HP 條)與水狐(天賦水精靈=一次性治療·不留 HP)移除舊標 → 召喚物精準剩 4 隻(操偶師/喚龍使‧蜜鶴林/貓人族長/陰陽師)與 card-summon-bars 渲染區完全對齊(雙星姊妹 _dualStarForm 只是型態標籤·無 HP·不列入)。',
      '★ v4.54.0【條件搜尋·孤兒標籤根治】❷貓人族長「凍結」→「冰凍」:v4.48.0 接線錯字,SKILL_EFFECT_DEFS 正式標籤為「冰凍」(實際狀態 addStatus freeze) → 舊值是孤兒標籤造成雙重失效(玩家勾「冰凍」搜不到貓人族長 / 「凍結」永遠不會有勾選框=死碼)。❸炎火超少女補「免死(HP剩1)」(爆發火神附體 3 回合明載「不會倒下·致命→HP剩1」·同鐵匠/魔劍姬/木靈使口徑)。❹幼兒園小孩「自身進入睡眠」依老師裁定不掛「睡眠」(該標籤語意=讓對手睡眠)。SKILL_EFFECT_DEFS 零新增;修正後稽核:86 標籤零孤兒(用到但不在表)、零空結果(勾了必無英雄)、100 隻英雄與 HERO_PRIMARY_CLASS 100 筆完全對齊。',
    ],
  },
  {
    ver: 'v4.53.0',
    date: '2026-07-17',
    brief: [
      '🍡 新英雄「麻吉喵‧Nico」登場!由 5 年 5 班 熊同學設計的 SSR 麻糬貓咪,是全遊戲第 7 隻「主坦克」英雄!',
      '🍡 天賦「Q彈」:隊友要被普通攻擊時,Nico 有機率彈過去幫他挨;而且自己每次被普通攻擊,軟軟的身體都會把衝擊彈開、回自己的 HP。',
      '😼 技能「喵的厲害」(被動):對手的極限爆發光芒一亮起,畫面就會問你要不要花能量發動 —— 一巴掌把對手的爆發光芒拍熄!每回合最多 1 次。',
      '🛡 技能「Nico保護你」:把自己撐成大麻糬盾牌,讓自己和 1 個隊友無敵 1 回合;每擋掉 1 次攻擊還會回能量和 HP。',
      '💢 極限爆發「怎麼樣?看看我的厲害!」:氣鼓鼓地連撞 7 下(撞倒了就換去打 HP 最低的那個),最後一下讓對手強力暈眩,自己再回一半 HP!',
      '🎨 這是 5 年 5 班的第七隻學生設計英雄,快去星空召喚看看能不能遇到牠!',
    ],
    items: [
      '★ v4.53.0【新英雄 麻吉喵‧Nico】資料層 14 表(hero_db.js):HERO_DB(hp91=配點70×1.3/atk15/sp10/spd5·總和100·老師裁決2乙由設計單 hp79 下修為 70 避免坦度爆表)、AVATARS🍡(全表零重複)、HERO_IMGS(麻吉喵Nico.webp·由 repo 既有 .jpg 轉出 524×749/q92/83KB/PSNR 41.15dB)、HERO_IMG_POS(150%/center 40%·主角貓在畫面中央偏下、背景有大量麻糬同伴需放大聚焦)、HERO_BIO(designer 5年5班 熊同學)、BURST_DB、HERO_LORE、HERO_TRAIT、BURST_GIF_DB(生氣的布丁奶茶.gif·實測 243×231/10幀/單圈 900ms→dur:900·sfx-punch+sfx-crit·tint 麻糬暖粉)、HERO_CATEGORIES_OVERRIDE(ctrl/heal/tank)、HERO_HEX_OVERRIDE(heal3/ctrl4)、_TRAIT_LV_INFO(代承50%+5%/級·回血10%+4%/級)、HERO_PRIMARY_CLASS(tank)、HERO_SKILL_EFFECTS(8 標籤全用既有·SKILL_EFFECT_DEFS 零新增)+ _LXPS_HERO_SD 簡單風四段(鐵律1.232 雙版齊備)。',
      '★ v4.53.0【邏輯層 index.html】天賦Q彈代承(doDmg 代承類集中區·挺身守護後/仁王挺立前·機率 50%+5%級·排除 AoE/DoT/反彈·_mochiGuardChecked 防連鎖)、天賦Q彈回血(doDmg 扣血後·對齊沐雲雪 軟軟的雲 hook 位置·10%+4%級)、S1喵的厲害被動確認窗(helper _mochiS1Prompt/_mochiS1Fire/_mochiS1Drain 置於 _catSummonChance 與 startTurn 之間;掛 nextRound「雙方各補3能量」後 → 對手爆發光芒剛亮起的瞬間;阻塞式彈窗由回呼排 startTurn·完全對齊 showEquipUI/showDiscardUI 既有非同步慣例)、S2 Nico保護你(execSkill 玩家路徑 + aiUseSkill AI 路徑雙實作·鐵律1.128·附 2 行 AI 評分)、S2 無敵回饋(doDmg immune 擋傷分支·靠 buff 上 _mochiGuard 標記辨識·別處來源的無敵不誤觸發)、爆發(_runBurst·7 連撞+倒下轉移 HP 最低+末擊強力暈眩+回 50%HP)、SUMMON_RARE_HEROES、STUDENT_DESIGNER_HEROES、SKILL_UPGRADE_DEF×2(special_mochi_s1/s2)+ 圖鑑升級視窗兩處 case、BURST_UPGRADE_DEF、_renderBurstFdWithLv 專屬 case。',
      '★ v4.53.0【鐵律 1.31 BOSS 保護】本隻全招式皆為純倍率/純我方增益 —— 無固定傷害、無 HP% 傷害、無即死、無 HP 設 1、無 >5000 固定傷害 → 走 doDmg 不加 bypassShield,世界 BOSS 每英雄每回合 5000 cap 與龍王元素護盾全部自動生效,對 BOSS 零破口,不需任何額外 cap(本輪為近期少數「零 BOSS 風險」的新英雄)。',
      '★ v4.53.0【老師四項裁決】① S1 保留「被動」定位但改為彈確認窗詢問是否消耗能量發動(完全比照煉金術師「道具複製」showAlchemistPrompt 模式·含自動戰鬥自動發動分支;AI 側走同一顆 _mochiS1Fire 保證同口徑)。② 配點 hp79→70(hp 欄位 103→91·與地獄將軍同級·非全遊戲最高)。③ 天賦代承由「必定」改機率制(50%起+5%/級·Lv5=70%)、回血 15%→10%(+4%/級)。④ S2 無敵回饋加每回合上限 2 次(_mochiGuardRoundUsed·nextRound 重置)→ 避免被連續 AoE 打成無限回復。',
      '★ v4.53.0【英雄編輯器 hero_input.html 修正·老師要求釐清】查證發現 _heroSkillTypes 是「HERO_PRIMARY_CLASS 有值就直接 return、CATEGORIES 永遠到不了」,而 PRIMARY_CLASS 已 100 筆涵蓋全英雄 → 編輯器舊有的「篩選分類」複選對遊戲篩選 100% 是死碼,真正決定篩選的 HERO_PRIMARY_CLASS 卻沒有欄位可填。本輪(老師選甲):新增「🎯 主分類(單選)」欄位 + HERO_PRIMARY_CLASS_INITIAL(100 筆)+ 設計單多印「主分類」+ 舊複選正名為「副分類(舊制備援)」並補上 tank 第四色;另補回 v4.52.0 漏同步的幽魂暗狐與本輪 Nico 至 HEROES_DB/HERO_CATEGORIES_INITIAL。⚠ 釐清:主分類(篩選)與雷達圖(HERO_HEX_OVERRIDE)是兩件不同的事。',
    ],
  },
];
