/* ============================================================================
 * 🏝 像素荒島求生記 — 資料表(minigame/minigame_island_db.js)
 * ============================================================================
 * ★ v1.149.0(2026-09-14・老師在「🎨 造型工房(GM)」調好後貼回聊天室的「📋 複製設定值」輸出)—
 *   D.LAYER_ADJ 全表改為老師這次微調過的值(髮型改為個別正/背/側三向專屬微調 @0/@1/@2,取代 v1.29.0 的全表 1/1/0/0 舊預設)；
 *   D.CREATE_DEFAULT 補上遺漏的 clothC:0 欄位(v1.138.0 新增的服裝染色欄位，舊表忘了加，匯出/寫入格式現在對齊)。
 *   對應 minigame_index.html v1.148.0(script src 的 ?v= 快取破壞字串同步 bump)。
 * ★ v1.28.0(2026-09-13・老師三項需求之①「先做劇情、豐富的主角內心對白(各種情境、反應,頭上對話泡泡)、豐富的操作互動音效」)—
 *   ①新增 D.MONO:主角內心話資料表,37 種情境共 100+ 句(每天/天氣/體力/背包/探索/採集/建造/成長/戰鬥/夜襲/地下層/朋友/離島),
 *     附冷卻 cool、停留時間 dur 與優先權 pri;index 端以 islMono(key) 在角色頭上冒泡泡(沿用 AP 泡泡同一套 DOM/CSS)。
 *   ②新增 D.SFX_MAP:30 種操作事件 → 既有 sfx id 的對照表(刻意只引用已存在的 54 支音效,不新增任何音檔 ⇒ 上傳即生效)。
 *   ③D.STORY 新增 chapters(8 段里程碑劇情,第一次達成才播、永不重播)與 notes(阿川的紙條 5 張,散落各區)。
 *   ④D.LAYER_ADJ 的 hair_boy_h1/h2/h3 依老師已上傳的新圖(刺蝟短髮/西瓜皮/捲毛蓬鬆)逐格重量,改回 1/1/0/0(舊值是舊髮型圖量的,會把新髮型縮小又上推)。
 *   對應 minigame_index.html v1.132.0。
 * ★ v1.27.0(2026-09-13・老師需求③)— 武器外觀分 5 階段(Lv1~4 / 5~9 / 10~14 / 15~19 / 20),新增 30 個 D.IMG.wp_* 圖鍵;全部選配,缺圖自動退回上一階、再缺退 emoji ⇒ 一張都還沒生成也不會壞。對應 minigame_index.html v1.131.0。
 * ★ v1.26.0(2026-09-13・老師:GM 要能調整頭髮和衣服的尺寸與座標,如同造型工房)— 新增 D.LAYER_ADJ:24 張分層造型圖各自的尺寸(sx/sy)與座標(dx/dy)修正值,並附一組用實際輪廓量測自動擬合出來的預設值(衣服 c1~c3 原本比基底身體大 1.3~1.6 倍把整顆頭吃掉、髮型假髮頭圍偏大且少女基底頭頂高 5px 導致瀏海壓到眼睛)。index 端 islLyGeo() 依本表換算 background-size/background-position,GM 可在「🎨 造型工房(GM)」即時微調並複製設定值回填本表。對應 minigame_index.html v1.128.0。
 * ★ v1.25.0(2026-09-13・老師七項:休息分頁/AP0泡泡/營地泡泡/存檔回饋/日曆/建造等待時間/武器20級)— 新增 BUILD_SECS(每棟建築的真實施工秒數)+ BUILD_SECS_DEFAULT;WEAPON_MAX_LV 5 → 20,新增 WEAPON_XP_NEED(每級所需熟練值)、WEAPON_XP_WIN(打贏一隻的基礎熟練值)、WEAPON_UP_TIER(五個階段的專屬升級素材,越後面越需要後期資源)。對應 minigame_index.html v1.125.0。
 * ★ v1.24.0(2026-09-13・老師四項:HUD 縮一行/視窗免捲動/採集題庫 200 題/創角圖層對齊)— D.QUIZ.gather 由 15 題擴充為 200 題(主題:採集各種有用的自然資源——植物構造與部位、種子傳播、樹木與木材、纖維與編織、水資源與淨水、岩石礦物與土壤、菇類與保存、海邊與潮間帶資源、台灣生態與物種、野外辨識、動物性資源、槓桿滑輪等省力原理、永續採集原則;不必與當前採集物有關)。出題順序控制在 minigame_index.html 的 islQuizPick:第一輪照本表順序 200 題不重複出完,第二輪起依 seed(uid|actId|輪次) 重新洗牌,選項每題即時打亂。對應 minigame_index.html v1.124.0。
 * ★ v1.23.0(2026-09-13・老師「繼續」)— DUNGEON.intro 改寫(地下層改回合制戰鬥,守墓石像共振題);其餘零改動。對應 minigame_index.html v1.122.0。
 * ★ v1.22.0(2026-09-13・老師四項:通關稽核/回合制遇敵戰鬥/多樣武器/圖片清單)— ①通關稽核:「🍃 大葉」全島沒有任何來源(帳篷/水桶架/床都要)→ 森林新增每日資源點「月桃葉叢」(gives leaf,node_bigleaf 圖選配)+ 沙灘林投採集附帶 +1 大葉(spawn.bonus)+ 森林撿取物加 leaf;②MON_BT(9 種魔物戰鬥數值/掉落)+ ENC(11 區踩地雷式遇敵點:每日 n 個、from 第幾天起、魔物池)+ BT(戰鬥常數:徒手攻擊/防禦/逃跑/智取/魔物成長/打贏科技點上限)+ STORY.firstBattle;③WEAPONS 6 種(棍棒/石斧 徒手可做;長槍/弓箭/錘/迴力鏢需製作台)各有 atk/def/甜蜜點寬度/先手/暴擊倍率/段數/暈眩率、製作藍圖 parts、升級材料 up,WEAPON_MAX_LV=5;QUIZ.weapon 8 題;④IMG 新增 bt_p_*(主角 5 態×2)/bt_m_*(9 魔物×5 態)/wp_*(6 武器)/node_bigleaf,全部選配缺圖自動退回。對應 minigame_index.html v1.121.0。
 * ★ v1.21.0(2026-09-13・老師四項)— ACTS.gather.n「採集植物」→「採集」;漂流木/礁岩碎石改用專屬圖鍵 node_drift/node_beachrock(island_node_drift.png/island_node_beachrock.png,缺圖退 emoji);7 道料理 ITEMS.img 接 res_d_<id>(island_res_d_*.png);12 種裝飾加 img:deco_<id>(island_deco_*.png);皆為選配,圖上傳即生效。
 * ★ v1.20.0(2026-09-13・老師七項)— ①SHOP.sell 品質倍率改 ★ ×1、★★ ×2、★★★ ×3(index islSellTake)③沙灘新增「漂流木」(gives wood)與「礁岩碎石」(gives stone)兩種每日資源點 + 撿取物加 wood/stone(遊戲初期營火要木 5 石 3,舊版沙灘只出纖維/野果,森林又要營火才開 → 死鎖)④AP 基礎 10、各活動 AP 不同(ACTS.ap:採集/捕魚/打撈/生火/烹飪/播種 1,伐木/採石/建造/馴養/鋪水道/研究/製作 2)+ AP_EXTRA 清單(上課/工程修復/地下層)⑤採集 QTE 依資源分輕/中/重(GATHER_FORCE:輕=野果/野菇/葉/草藥/種子/羽毛/貝殼/小石;重=木材/石頭/鐵礦/水晶/遺物;其餘中)⑥AP 用完的角色泡泡 TIRED_LINES
 * ★ v1.19.0(2026-09-13・老師六項)— ①島名詞庫擴充:ISLAND_ADJ 20→60、ISLAND_NOUN 18→60(60×60=3600 種組合,創角/改名改為兩個可捲動下拉選單+自由輸入) ②STAT_MAX 20→50、新增 SKILL_MAX=50(技能等級上限) ③IMG 表新增分層造型 24 張(膚色×4 基底身體 base_<body>_s0~3 / 髮型×4 hair_<body>_h0~3 / 服裝×4 cloth_<body>_c0~3,皆 768×384、6 欄×3 列 128px 格;缺圖自動退回既有整張 sheet),對應 minigame_index.html v1.116.0。
 * ★ v1.18.0(2026-09-13・老師兩批需求)— 11 區 SCENE.mask 依場景圖重建障礙(巨石/樹木/崖壁 '#',固定點強制可走,BFS 驗證 0 退步);ZONES.map 依 island_map_base.jpg 實圖重新標位。對應 minigame_index.html v1.115.0。
 * ★ v1.17.0(2026-09-12・老師「一先做」=好友營地唯讀畫面)— 名片公開欄位常數 COOP_BOARD_PUB/COOP_DECO_PUB(訪客參觀營地:看擺設、讀留言板、留言給島主)。對應 minigame_index.html v1.114.0。
 * ★ v1.16.0(2026-09-12・老師四項修正:主角外觀改用像素圖/移動左右鏡像反了/水域全面禁止進入/採集簡化+QTE放大圖/字體放大改用中黑體)— 重畫 valley 遮罩+8 個資源點位移,BFS 驗證 11 區全數可達;對應 minigame_index.html v1.109.0。
 * ★ v1.15.0(2026-09-12・老師三項:好友連線合作/無人島命名/記憶傳承檔案位置)— 無人島命名(ISLAND_ADJ×ISLAND_NOUN 隨機組合)常數;好友連線合作(拜訪好友的島/邀請來自己的島,最多 4 人,離線自動變 NPC)常數 COOP_MAX/COOP_HEARTBEAT_SEC/COOP_STALE_SEC/COOP_GONE_SEC。對應 minigame_index.html v1.108.0。
 * ★ v1.14.0(2026-09-12・老師「繼續完成荒島求生」)— 📋 營地留言板常數 BOARD_MAX/BOARD_TEXT_MAX + 📜 阿獺委託板 QUEST(perDay/pool 24 種含 need 條件與阿獺科學小語/hardGive/MS 里程碑/intro/thanks)。對應 minigame_index.html v1.107.0。
 * ★ v1.13.0(2026-09-12・老師「請繼續」,裁定 R=自由創角、S=訪客島獨立存檔不可匯入 已確認)— 好友信箱資料:MAIL_GIFT_ITEMS(可送資源白名單)、MAIL_QTY_MAX、MAIL_NOTE_MAX。對應 minigame_index.html v1.106.0。
 * ★ v1.12.0(2026-09-12・老師四項:場景懶載入/首頁完整安裝鈕/raid+raid2 輪流/帆船結局)— BUILDINGS.ship(最終目標,tech:30、needZone volcano、noUpgrade、final)、BUILD_ORDER +ship、IMG bld_ship/ending_sail、STORY.shipBuilt/endingHome、ENDING(結局文案與節奏)、LOG_MAX(回憶紀錄上限)。對應 minigame_index.html v1.105.0。
 * ★ v1.11.0(2026-09-12・老師「甲乙丙全做」)— 甲:MONSTERS 4→8(黏泥怪/火精/石化蛇/雷精,各綁科學概念,from=出現天數,每隻加 q 一題)、DEF_TOOLS 4→8、DEF_STAT_BONUS(四維加成)、DEF_BITE_HP、瞭望台 tower 建築;乙:DUNGEON(遺跡地下層 3 層+守墓石像 boss);丙:FRIEND_MAX/FRIEND_HELPERS/FRIEND_HIT_SEC、STORY.friendWatch/towerFirst;IMG +6、CODEX +5(57→62)。對應 minigame_index.html v1.104.0。
 * ★ v1.10.0(2026-09-12・老師「場景幫我壓縮成 JPG」)— 11 區場景 + 大島地圖 + 營地日/夜 共 14 張改讀 .jpg(全部無透明,品質 85,71 MB → 10 MB);mgPicUrl 自帶副檔名不補 .png。對應 minigame_index.html v1.102.0。
 * ★ v1.9.0(2026-09-12・第二批 35 張圖上線)— 依實際場景圖重校 5 區遮罩(river 淺水帶改貼畫中溪流+魚群池改到水上、rock 下半海域補 ~/深水 #、grass 小池塘、cave 依畫中洞室重繪、lake 淺水環擴到畫中湖岸);seed 圖接上。對應 minigame_index.html v1.101.0。
 * ★ v1.8.0(2026-09-12・老師三項需求)— WEATHER(晴/毛毛雨/颱風)、STORY.typhoon/rainFirst;台灣化:SCENE 各 label、ITEMS(野菇/小米/野菇湯/小米餅)、ANIMALS/ANIMAL_CARDS、CODEX 全部 57 筆重寫為台灣物種、阿獺改歐亞水獺、訓練師改陸蟹/台灣黑熊/領角鴞。對應 minigame_index.html v1.100.0。
 * ★ v1.7.0(2026-09-12・P4-b)— 新增 TRAINERS(四位動物訓練師)、QUIZ.train_dex/mov/pow/wit(各 5 題)、SCENE.<zone>.trainer、IMG.npc_*、圖鑑 +4。對應 minigame_index.html v1.99.0。
 * ★ v1.6.0(2026-09-12・P4-a)— 新增 SHOP(阿獺雜貨鋪買/賣表、擴格階梯價、每日特價)、CODEX/CODEX_CATS/CODEX_ALIAS/CODEX_PICK/CODEX_MS(自然圖鑑 53 筆)、
 *   3 種 shop:true 商店限定裝飾、IMG.npc_otter。對應 minigame_index.html v1.98.0。
 * ★ v1.0.0(2026-09-12・P1 骨架首版)— 對應 minigame_index.html v1.90.0。
 *   本檔只放「資料」:區域表／可行走遮罩／資源候選錨點／活動與題庫／建築表／起步風格模板／
 *   劇情與新手教學／素材檔名清單。所有邏輯在 minigame_index.html 的 isl* 函式群(window.ISL 狀態)。
 *   規格權威=《像素荒島求生記_設計書_v9.md》。ES5 only(小遊戲鐵律)。
 *   ⚠ 上傳順序:minigame_db.js → minigame_island_db.js(本檔)→ minigame_sw.js → minigame_index.html。
 * ---------------------------------------------------------------------------
 * 可行走遮罩(mask)規格(設計書 20.1):每區 32 欄 × 24 列字串,一格 = 64px(場景 2048×1536)。
 *   '#' 牆／不可走   '.' 可走   '~' 淺水(可走但慢 60%)
 * 資源候選錨點(spawn,設計書 25.2):{x,y} 格座標;候選數 ≥ 需要數 ×2;程式以 seed=hash(uid+day+zone)
 *   洗牌取 n 個、距離 < minGap 的跳過;生成結果不存雲端,只存當日已採索引 zones[id].daily.taken。
 * ============================================================================ */
window.ISL_DB = (function(){
  'use strict';

  var D = {};
  D.VER = 'v1.182.0';   /* ★ v1.182.0(2026-09-15・老師「荒島寵物加入條件改為送禮＋答題」)— 野外 10 隻夥伴(leopardcat/bluemagpie/eagle/pangolin/turtle/coconutcrab/treefrog/firefly/macaque/spoonbill)各自新增 food(喜歡的食物,一種生食材或料理)與 quiz(10 題自然知識題庫,答題時隨機抽 5 題);新增 D.PET_RECRUIT={quizPick:5,quizPass:4} 單一調整點;D.PET_BOND_GAIN 新增 levelUp:8(老師需求「寵物升級要加更多親密度」)。⚠ salmon(鮭魚)／barbet(五色鳥)兩隻是阿獺商店直接用貝幣換購,沒有「遇到」這個時刻,本輪刻意不動。 */   D.VER = 'v1.180.0';   /* ★ v1.180.0(2026-09-15)D.LOG 新增一筆(自動更新上線);其餘零改動。⚠ 本輪的重點全在 minigame_sw.js 與 minigame_index.html:完整下載曾把網頁本體存進永不清除的島快取,害裝置從按下下載那一刻起就被凍結在當時的版本(老師卡在 v1.169.0 十輪的真因)。 */   /* ★ v1.179.0(2026-09-15)D.LOG 新增一筆(暫時只剩 GM 測試);其餘零改動。 */   /* ★ v1.178.0(2026-09-15)D.LOG 新增一筆(回營地不再卡載入、教學條讓開血條);其餘零改動。 */   /* ★ v1.177.0(2026-09-15)D.LOG 新增一筆(🆘 自救鈕與測試版告知);其餘零改動。 */   /* ★ v1.176.0(2026-09-15)D.LOG 新增一筆；其餘零改動。 */   /* ★ v1.175.0(2026-09-15)新增 D.LOG：學生看的更新日誌資料表（新增一版只要在最上面插一筆，index 端不必動）。 */   /* ★ v1.174.0(2026-09-15・對應 index v1.174.0：⚙ 版本/更新鈕、物品包圖示放大加名稱、清單圖示稽核)。本檔零改動,僅版號同步。 */   /* ★ v1.173.0(2026-09-15・對應 index v1.173.0：回營地卡住根治、大地圖 LOGO 移右下、採集 QTE 版面)。本檔零改動,僅版號同步。 */   /* ★ v1.172.0(2026-09-15・對應 index v1.172.0):D.IMG 新增 logo: 'island_logo.webp'(大地圖左下角去背 LOGO,選配)。其餘零改動。 */   /* ★ v1.171.0(2026-09-15・對應 index／sw v1.171.0:完整下載安裝後圖片音樂載入變慢的三個根因修正)。本檔零改動,僅版號同步。 */   /* ★ v1.170.0(2026-09-15・對應 index v1.170.0:HUD 資源項濃縮成倉庫圖示 🏚,點擊展開完整資源總覽)。本檔零改動——完整清單直接讀現成的 D.ITEM_ORDER／D.ITEMS,僅版號同步。 */   /* ★ v1.169.0(2026-09-15・對應 index v1.169.0:強制橫式提醒層 + 英雄選單右側版面重配)。本檔零改動,僅版號同步。 */   /* ★ v1.168.0(2026-09-15・對應 index v1.168.0:PC/iPad 版面溢出量測與修正)。本檔零改動,僅版號同步。 */   /* ★ v1.167.0(2026-09-15・死鍵稽核:「確認每個功能都有用」)— 🐾【最大一項】16 隻夥伴的天賦被動原本**只有文字沒有效果**(只有 4 隻是用 u.k==='bear' 這種硬寫,其餘 12 隻全是死鍵)。改成資料驅動:island_db 每隻帶 tal:{效果鍵:值},index 端只有 islPetTal(單位,鍵)／islPetTalAll／islPartyTal 三個出口,16 個效果鍵全部接上消費點——coverAddP 坦克代受機率(黑熊)、cutP 減傷(穿山甲)、thornP 反震(椰子蟹)、shieldP 護盾加成(綠蠵龜)、stunAddP 暈眩機率(獼猴)、sealAdd 封招延長(五色鳥)、healOutP 治療輸出(梅花鹿)、rainHealP 雨天治療(樹蛙)、lowHealP 半血治療(鮭魚)、perAllyAtkP 每多一位夥伴加攻(藍鵲)、lowHpAtkP 目標半血加攻(石虎)、firstDmgP 先手加傷(領角鴞)、critP 普攻暴擊(大冠鷲)、darkAtkP 暗處全隊攻擊(螢火蟲)、ctrlSpdP 控場成群加速(黑面琵鷺)、encAdd 野外多走幾步才遇敵(海鷗小白)。四隻原本寫不出效果的天賦文案一併改寫成寫得出來的(石虎夜襲→目標半血、螢火蟲命中→暗處攻擊、小白資源點→遇敵步數、領角鴞先手→隊友中第一個出手)。隊友普攻與專屬指令共用同一支 islPetAtk,天賦才不會只對其中一種生效。🔧 其餘死鍵:PET_XP.lose 補上消費點(打輸也給一點經驗,不讓學生白忙)、PET_BOND_GAIN.feed 補上「🍖 餵食」(圖鑑卡片,花一道料理換親密度;只吃料理不吃生食材)、PET_BOND_GAIN.dayTogether 補上(新的一天編組裡的夥伴親密度 +1)、PARTY.FRIEND_READONLY 接上真正的消費點(islPetsGainAfterWin 的跳過條件);PARTY_FRIEND.SNAP_ON/FIELDS 與 PET_XP.raid 三個無法有消費點的鍵直接移除。🧪 稽核器改成資料驅動(讀資料表現有欄位反查 index 消費點),重跑死鍵＝0。平衡沙盤重跑,曲線幾乎不變(遺跡 73→79%、火山 89→93%)。 */   /* ★ v1.166.0(2026-09-15・P4:步數遇敵 + 平衡稽核)— ①【老師需求⑤】野外遇敵改步數制 islEncStep():每走 D.ENC_STEP.min~max 步(15~30)隨機遭遇,戰後欠 safeSteps(8) 步才重新計數。「一步」＝踏進新格子(不是一幀也不是按一次鍵),慢走快走遇敵率才一樣;計數器只放 _IS 不寫存檔。舊的踩地雷式(islSpawnDaily 生成 _IS.mines + islMineCheck)整段保留但停用——只要 D.ENC_STEP 存在就不生成任何遇敵點,兩套並存會雙重觸發密到走不動;拿掉 D.ENC_STEP 即自動回到舊制。步數制的 mine 是合成物件(idx −1),islBattleEnd 只在 idx≥0 時才寫 daily.mines、islBattleClose 只在 idx≥0 時才刪 .isl-mine 元素。②【平衡稽核】沙盤跑 11 區 ×(0/1/2/3 位隊友)×150 場。第一輪發現滿編 100% 勝率且主角剩血 93~100%——根因不是等級太低而是**治療量壓過傷害**(草藥療傷 25%/cd2、露水治癒 20%/cd1 等於無限續航),改成 18%/cd3 與 15%/cd2;D.ENC 等級再上調一段(森林 4-7 … 遺跡 20-27、火山 24-31,沙灘維持不動因為那區還沒有隊友)。③【平衡】戰鬥中倒下的隊友當天不能再上場(rec.rest,明天自動歸隊;三條結束路徑勝/敗/逃都標記),編組頁顯示「💤 休息中」。刻意不做跨場扣血——「今天不能上場」對中低年級好懂,也不會逼他們一直跑回營地。調校後(寵物等級壓成主角的一半):早期 1 位隊友就穩、湖泊~山谷要 2~3 位、遺跡/火山滿編 73~89%,單人在中後段 0~11%——招募隊友從此是必要而不是裝飾。 */   /* ★ v1.165.0(2026-09-15・P3:UI 與招募)— 🐾 三個入口掛進 👤 角色子選單:**🧭 探險編組**(3 格,站位預覽由右到左＝前鋒到後排;選好友時整頁先跑 islFriendsRefresh 重抓名片＝老師裁定 2,借用版同場限一位、標明不可更改不會升級)、**📖 夥伴圖鑑**(16 隻卡片,已擁有顯示 Lv/親密度/四維/專屬指令/天賦/自然知識,未擁有顯示取得方式;商店款可直接用貝幣換)、**🎯 特殊指令**(裝設 3 格 + 已解鎖清單)。招募三條路:①訓練師課題通過後跳邀請(只有台灣黑熊/梅花鹿/領角鴞,陸蟹維持純訓練師)②海鷗小白在營火蓋好且森林解鎖後可邀請③野外馴養成功時擲 islPetWildRoll(機率讀 D.PETS[].get.p,並吃既有 tameP 天賦;刻意不另開資源點與圖片)。第一次取得會自動補進空的編組格(不然學生招募完還要再進一次編組頁,低年級最常見的回報就是「抓到了為什麼戰鬥沒出現」)。🎯 特殊指令:野外類掛在 🗺 探索子選單(沒裝就不出現,不放空按鈕)、戰鬥類每個各一顆按鈕插在動作列(每場各 1 次,用過變灰),AP 在 islCmdUse 統一扣;CMD_SCAN 進掃描模式(遇敵點現形+資源點金色光暈,只對當天那一區有效,islEnterZone 逐次 toggle 收掉)、CMD_QUICKPICK 下一次採集直接 ★★★(旗標一次性;刻意不寫進 note,note 在各活動分支會被覆蓋)、CMD_REST 野外回 30% 體力。island_db:CMD_CALL 由 both 改 battle(野外沒有隊友單位可治療,掛野外會變成按了沒反應的死按鈕)。 */   /* ★ v1.164.0(2026-09-15・P2:戰鬥引擎 1v1 → 組隊)— 🐾 主角+最多 3 位隊友 對 1~4 隻魔物。①引擎改「擴充」不「重寫」:_islBt.m 改成指向 _islBt.ms[mi] 的「目前鎖定目標」指標,既有 QTE/智取/絕招/包紮/流血/破防/反擊/不良狀態/地下層全部零改動照常運作;側別字串擴成 p/a0~a2/m0~m3('m'=目前目標的別名),$('isl-bt-'+side) 一律改走 islBtEl()。②回合順序 主角 → 隊友(依站位由前到後) → 魔物(逐隻);islBtMonTurn 改成驅動器,同一輪第一次呼叫先跑隊友,十幾處既有呼叫點一行都不用改。③站位:坦克 0 → 主角 1 → 攻擊 2 → 控場 3 → 治療 4,由 JS 依人數算 inline 座標;魔物依編號往右排。④魔物選目標依站位權重,坦克型可代替後排承受(TANK_COVER_P/TANK_CUT_P,台灣黑熊天賦再 +15%)。⑤隊友自動行動:冷卻好了放專屬指令,否則普通攻擊;16 招全部讀 D.PET_CMDS[].fx(本輪補上數值),支援 傷害/多段/全體/必中/暴擊加成/暈眩/單體與全體治療/解除不良狀態/護盾/攻防速全隊增益/代受/嘲諷/命中與速度減益/封暴擊/先手。⑥速度增減益換成迴避率(上限 25%),封招對沒有技能的魔物解釋成「打不出暴擊」,避免出現看不出差別的空效果。⑦勝利結算改整組逐隻結算(貝幣與掉落各一份,🔬 仍吃每日上限);上場寵物給經驗與親密度並自動升級(上限 50),借用版好友一律不寫回存檔(老師裁定 3)。⑧上方血條改成左右兩欄清單(沿用 .bt-hpbox 讓 iPad 放大覆寫繼續生效),點魔物那一列或舞台上的魔物即可換鎖定,換目標會清掉破防/防禦下降累積。⑨野外遇敵戰曲改播 D.BT.BGM_WILD(貓空小怪戰曲五選一),地下層與夜襲維持 raid/raid2。⑩進區域時隊伍未滿會提醒(D.ENC_TEAM_HINT,只提醒不擋人)。⑪island_db:16 招補 fx 數值;D.ENC 等級範圍沙盤實跑後全面下修(原 P1 訂到 Lv30~44,乘上每級 +18%HP/+12%攻再乘 4 隻會直接秒殺學生)。 */   /* ★ v1.163.0(2026-09-15・老師《寵物加入戰鬥／探險編組》需求 P1:資料層)— 🐾 新增 D.PET_TYPES(四型與站位 row)/D.PARTY(主角+3 隊友、坦克代受、借用版好友唯讀)/D.PARTY_FRIEND(每次開編組頁重抓快照)/D.PET_CMDS(16 個夥伴專屬指令)/D.PETS(4 位 NPC 夥伴 + 12 隻台灣寵物,各自 b 基礎值與 g 每級成長、天賦、取得方式、自然知識)/D.PET_ORDER/D.PET_LV(上限 50)/D.PET_XP/D.PET_BOND(親密度 5 階);🎯 天賦星域新增「特殊指令星域」(D.SK_CMDS 8 個指令 + SK_CMD_1~8 八個節點,座標全落在星圖右下方空白區,既有 41 個節點零更動;裝設上限 D.SK_CMD_SLOTS=3,使用消耗 ⚡AP);⚔ D.ENC 全表重排(num 每場 1~4 隻、lv 各區等級範圍)+ D.ENC_STEP(15~30 步遇敵,戰後 8 步安全)+ D.ENC_TEAM_HINT(隊伍未滿提醒門檻)+ D.BT.BGM_WILD(野外遇敵改播貓空小怪戰曲五選一);🖼 D.IMG 自動登記 96 張夥伴戰鬥立繪鍵 bt_pet_<key>_<6 態>(全部選配,缺圖退 idle→emoji)。⚠ 本輪純資料與存檔欄位,戰鬥引擎仍是 1v1,P2 才改寫。 */   /* ★ v1.162.0(2026-09-14・老師「效果要對島上各種玩法都有幫助，還要有提升寵物能力的」)— 29 個節點各自加一個「島上用」的第二效果與對應說明文字：QTE 指針變慢(qteSlowP)、甜蜜點擴大(sweetP)、走路速度(moveP)、每日 AP(apAdd)、砍樹/採石/捕魚產量(chopAdd/quarryAdd/fishAdd)、建造製作品質(craftStar)、失誤受傷減輕(hurtCutP)、採集作答時間(actSecP)，以及寵物三鍵 tameP/petYieldP/petFeedSaveP。節點數量、座標、前置關係全部不變（星圖版面零影響）。 */   /* ★ v1.161.0(2026-09-14・對應 index v1.161.0：🌟 天賦星域 index 端邏輯接上)。本檔零改動（SK_* 系列自 v1.150.0 就已備好），僅版號同步。 */   /* ★ v1.160.0(2026-09-14・對應 index v1.160.0：🤒 不良狀態 5 種 index 端邏輯接上)。本檔零改動（D.STATUS 系列自 v1.150.0 就已備好），僅版號同步。 */   /* ★ v1.159.0(2026-09-14・對應 index v1.159.0：載入效能根治——更新鈕不再清掉完整下載快取、素材改同源、SW 快取策略改版)。本檔零改動，僅版號同步。 */   /* ★ v1.158.0(2026-09-14・對應 index v1.158.0:NPC 名牌行高、敲釘子 6×6、採集/砲樹 QTE 拉桿與按鈕放大延長)。本檔零改動,僅版號同步。 */   /* ★ v1.157.0(2026-09-14・對應 index v1.157.0:營地走路動作模組共用化+尺寸依帳篷高度動態算、品質小遊戲版面重排、走路腳步聲不再誤當連續點擊)。本檔零改動,僅版號同步。 */   /* ★ v1.156.0(2026-09-14・選擇題錯誤選項加長 第 3 批 60 題):手法同前兩批。改寫後「唯一最長」比例 186/412(45%) → 126/412(31%)。剩 126 題續做。 */   /* ★ v1.155.0(2026-09-14・選擇題錯誤選項加長 第 2 批 50 題):手法同第 1 批(正確答案原文與 a 索引不動、每個錯誤選項顯示寬度 ≥ 正確答案、每個都是真的迷思概念不是填充字)。改寫後「唯一最長」比例 241/412(58%) → 186/412(45%)。剩 186 題分批續做。 */   /* ★ v1.154.0(2026-09-14・對應 index v1.154.0 角色能力浮窗說明改版):本檔零改動,僅版號同步。 */   /* ★ v1.153.0(2026-09-14・老師:「把所有選擇題的錯誤選項字數也加長(至少跟正確答案一樣長),避免玩家覺得每次選最長的就是正確答案,失去思考的教學目的」)— 第 1 批:落差最大的 50 題逐題改寫錯誤選項。原則:①正確答案原文與 a 索引完全不動 ②每個錯誤選項顯示寬度 ≥ 正確答案 ③必須是「真的有人會這樣想」的迷思概念,不是填充字。改寫後「正確答案是唯一最長」的比例 291/412(71%) → 241/412(58%)。⚠ 剩下 241 題分批續做,一輪 40~60 題。 */   /* ★ v1.152.0(2026-09-14・老師四項):①11 區 mask 全部依場景實圖逐格重建(比周圍暗多少判立體物、藍色判水域、火山另判岩漿;去雜點後 BFS 連通驗證,不可達的可走格一律封起來)。②229 個固定座標(各區 spawn pool/gullSpot/puzzle/訓練師 spot)吸附到最近的可走格,不再硬挖障礙格。③D.TRAINERS 四隻新增 sz(依真實體型比例的顯示高度 px,玩家 96px 為基準);黑熊/領角鴞站位挪到寬敞處。 */   /* ★ v1.151.0(2026-09-14・對應 index v1.151.0 營地設施搬移/鏡像 + 主角自由走動):本檔零改動,僅版號同步(index 的 ?v= 快取破壞字串一併 bump)。 */   /* ★ v1.150.0(2026-09-14・老師《戰鬥系統擴充設計規格 v1.0》第一輪:技能樹＋不良狀態):新增 D.SK_CANVAS/D.SK_GALAXY/D.SK_ACTS/D.SK_NODES(46 節點)/D.SK_MED_LINK/D.SK_TITLES/D.SK_RESPEC 與 D.STATUS/D.STATUS_ORDER/D.STATUS_ROLL(5 種不良狀態)。⚠ 本檔版號自 v1.30.0 起與 index 端 MG_VER 對不上(index 已走到 v1.149.0),本輪起直接對齊 index 版號,日後兩邊同號。台灣寵物 12 隻(規格書第四章)留待下一輪。 */   /* ★ v1.30.0(2026-09-13・老師「初始服裝力行運動服改名運動服」):D.CLOTHES[0].n 顯示名稱改「運動服」(圖檔名 cloth_*_c0 與資料鍵不變,舊存檔零影響)。 */   /* ★ v1.29.0(2026-09-13):20 個落在水域 '~' 的資源錯點全部移到緊鄰水邊的可走岸格(溪流 9、岩岸 3、湖泊 4、山谷 3、洞窟 1);根因是 v1.115.0 依場景圖重建遮罩後沒重跑可達性稽核。⚠ index 端 v1.133.0 另加了一道執行期可走格濾網(islSpawnDaily)當雙保險，下次重建遮罩再歸位一次也不會出現永遠採不到的點。 */   /* ★ v1.28.0(2026-09-13):內心話 D.MONO、操作音效 D.SFX_MAP、章節劇情 STORY.chapters/notes、少年髮型 LAYER_ADJ 重算。 */   /* ★ v1.27.0(2026-09-13):武器 6 種 × 5 階段外觀圖鍵 wp_*(Lv5/10/15/20 換圖)。 */   /* ★ v1.26.0(2026-09-13):分層造型微調表 D.LAYER_ADJ(GM 造型工房的預設值)。 */   /* ★ v1.25.0(2026-09-13):建築施工秒數 BUILD_SECS;武器上限 20 級 + 熟練值 + 分階段升級素材。 */   /* ★ v1.24.0(2026-09-13):採集題庫 15 → 200 題。 */   /* ★ v1.23.0(2026-09-13):地下層改回合制,DUNGEON.intro 改寫。 */   /* ★ v1.22.0(2026-09-13):回合制遇敵戰鬥(MON_BT/ENC/BT)+ 6 種武器(WEAPONS)+ 大葉來源(森林月桃葉叢/林投附帶)+ 戰鬥立繪 IMG 鍵。 */   /* ★ v1.21.0(2026-09-13):採集改名、漂流木/礁岩/料理/裝飾圖鍵。 */   /* ★ v1.20.0(2026-09-13):賣價倍率/沙灘木石/AP 10 與各活動 AP/採集輕中重/疲勞泡泡。 */   /* ★ v1.19.0(2026-09-13):島名 60×60、STAT_MAX/SKILL_MAX 50、分層造型 IMG 24 張。 */   /* ★ v1.18.0(2026-09-13):11 區遮罩重建 + 地標重標。 */   /* ★ v1.17.0(2026-09-12):好友營地唯讀畫面常數 COOP_BOARD_PUB/COOP_DECO_PUB。 */   /* ★ v1.16.0(2026-09-12・老師四項修正):重畫 valley 遮罩(石橋過河,水域真的不可走)+ river/rock/lake/cave 共 8 個資源點位移到岸上,全 11 區水域全面禁止進入後仍 100% 可達(BFS 驗證)。 */   /* ★ v1.15.0(2026-09-12):無人島命名(ISLAND_ADJ/ISLAND_NOUN)+好友連線合作資料常數(COOP_MAX/COOP_HEARTBEAT_SEC/COOP_STALE_SEC/COOP_GONE_SEC)。 */   /* ★ v1.14.0(2026-09-12):留言板 BOARD_* + 阿獺委託板 QUEST。 */   /* ★ v1.13.0(2026-09-12):好友信箱資料常數。 */   /* ★ v1.12.0(2026-09-12):帆船+結局+回憶紀錄資料。 */   /* ★ v1.11.0(2026-09-12):甲乙丙 — 8 魔物/瞭望台/地下層/好友守夜資料。 */   /* ★ v1.10.0(2026-09-12):14 張場景改 .jpg。 */   /* ★ v1.9.0(2026-09-12):遮罩重校 + seed 圖。 */   /* ★ v1.8.0(2026-09-12):WEATHER + 台灣化。 */   /* ★ v1.7.0(2026-09-12 P4-b):TRAINERS。 */   /* ★ v1.6.0(2026-09-12 P4-a):SHOP + CODEX。 */   /* ★ v1.5.0(2026-09-12 P3-c):11 區首次進入內心話(STORY.zoneIntro)、小白各區提示(STORY.gullZone);BGM 由 index 端 islBgm 控制 */   /* ★ v1.4.0(2026-09-12 P3-b):懸崖/山谷/遺跡/火山四區、製作台與工具(鐵斧/鐵鎬/好釣竿/藤籃)、草藥/蜂蜜/遺物物品、四區解謎點、製作題庫 */   /* ★ v1.3.0(2026-09-12 P3-a):湖泊/洞窟兩區、科技研究(火把/滑輪/水車/電路)、各區解謎點題組、鐵礦/水晶物品、研究題庫 */   /* ★ v1.2.0(2026-09-12 P2-b):烹飪/種植/畜牧/水利(Grid 引擎首用)資料、農田/畜欄/水道三棟、全建築 Lv1~5、營地 Lv1~3 擴建、裝飾與舒適度、料理/蛋/奶/穀物物品、四庫新題 */   /* ★ v1.1.0(2026-09-12 P2-a):溪流/岩岸/草原、捕魚/打撈/採石、水桶架/木筏/圍牆/火把、防衛戰資料 */
  D.SAVE_VER = 1;          /* 存檔結構版本(缺欄位一律補預設值,絕不因存檔壞掉卡流程) */
  /* ══ ★ v1.175.0(老師:「老師更新內容時,會有更新日誌彈出」)══
     學生看的更新日誌。新增一版 = 在**最上面**插一筆就好,index 端不必動。
     ★ 寫法規則:寫「學生看得懂、跟他有關」的話(這裡是給小朋友看的,不是給工程用的);
       一筆 2~4 條、每條一句話,前面帶一個圖示。技術細節留在 index 的 MG_VER 註解裡。
     ⚠ v 必須與 index 的 MG_VER 同格式(vX.Y.Z):進場比對「比看過的還新就彈」用的是數值比較。
     ⚠ 只要有寫進這張表就會彈給學生看 ⇒ 純內部修正(不影響學生體感的)可以不必寫進來。 */
  D.LOG = [
    { v: 'v1.182.0', d: '2026-09-15', items: [
      '🐾 野外遇到新夥伴的方式改了!現在要先送牠喜歡的食物,再答對幾題自然知識題,牠才會正式搬進營地。',
      '🍖 每天都可以送禮物給你的寵物夥伴,會冒愛心特效喔!',
      '🎉 帶寵物去打贏戰鬥、幫牠升級,都會讓你們更要好。'
    ] },
    { v: 'v1.180.0', d: '2026-09-15', items: [
      '🔄 遊戲會自己更新了!以後老師修好東西,你一進來就是最新版,不用再自己按更新。',
      '🐛 修好一個大問題:按過「完整下載」的平板,以前會卡在下載那一天的舊版本,不管怎麼重開都換不掉。',
      '💾 你辛苦下載的圖片和音樂全部保留,這次只會重新抓程式本身,不用再等一次 60~120MB。'
    ] },
    { v: 'v1.179.0', d: '2026-09-15', items: [
      '🔧 荒島求生暫時關起來整修,目前只有老師的帳號進得來測試。',
      '☁ GM 測試的島恢復存到自己的帳號雲端,好友／信箱／留言板也一起回來了。'
    ] },
    { v: 'v1.178.0', d: '2026-09-15', items: [
      '🏕 回營地不會再卡在「載入營地」了——按下去直接就進去,背景圖自己慢慢出現。',
      '📘 戰鬥的時候,上面的教學說明會讓開,不再擋住雙方的血條。'
    ] },
    { v: 'v1.177.0', d: '2026-09-15', items: [
      '🆘 畫面右下角多了一顆 🆘 鈕:卡住的時候按它,可以「存檔並回到營地」,不用關掉重開。',
      '📋 同一顆 🆘 也可以「回報錯誤給老師」——它會自動幫你抄好資訊,你只要寫一句發生什麼事再按複製。',
      '⚠ 提醒:現在是測試版,你的進度在正式推出的時候會全部清除喔!',
      '💾 已經登入的人按 💾 存檔,不會再誤報「沒有存成功」了。',
      '⚔ 戰鬥萬一卡住不動,20 秒後會自動把行動權還給你。'
    ] },
    { v: 'v1.176.0', d: '2026-09-15', items: [
      '🏕 回營地再也不會卡住：就算圖片一直載不出來，最多等 6 秒也會自動進去。',
      '▶ 載入畫面等超過 2.5 秒會出現「直接進去」，不想等就按它。'
    ] },
    { v: 'v1.175.0', d: '2026-09-15', items: [
      '🏝 荒島求生開放試玩囉!不用登入也可以直接玩。',
      '📱 測試期間進度只留在這台平板,換一台平板就是另一座島,也還不會記到你的帳號裡。',
      '📜 之後老師更新內容,一進來就會跳出這張「更新日誌」告訴你改了什麼。',
      '🔄 想知道自己玩的是哪一版:右上角 ⚙ 裡面有「版本」,有新版也可以從那裡更新。'
    ] },
    { v: 'v1.174.0', d: '2026-09-15', items: [
      '🎒 物品包的圖片變大了,而且每個東西下面都會寫名字,不用再猜那是什麼。',
      '🔍 各種清單裡的小圖片在 iPad 上也一起放大,看得更清楚。'
    ] },
    { v: 'v1.173.0', d: '2026-09-15', items: [
      '🏕 從野外回營地不會再卡很久、也不會突然跳出遊戲了。',
      '🎯 採集的「按住拉…放手」按鈕和長條移到畫面正中央,材料圖片放到左邊,比較好按。'
    ] }
  ];

  D.CELL = 64;             /* 一格 px */
  D.COLS = 32; D.ROWS = 24;

  /* ── 素材檔名(minigame/img/<file>.png;程式端缺圖一律 onerror 退回 emoji,可分批上傳) ── */
  D.IMG = {
    /* ★ v1.172.0 老師:大地圖左下角放遊戲 LOGO(去背圖)。副檔名寫在值裡 ⇒ mgPicUrl 照用,不會被自動補成 .png。
       選配:檔案還沒上傳時 index 端 onerror 會整塊收起來,畫面不會出現破圖。 */
    logo: 'island_logo.webp',
    /* ★ P2-b(v1.2.0) */
    zone_cliff: 'island_zone_cliff.jpg', zone_valley: 'island_zone_valley.jpg', zone_ruins: 'island_zone_ruins.jpg', zone_volcano: 'island_zone_volcano.jpg', bld_bench_1: 'island_bld_bench.png', res_herb: 'island_res_herb.png', res_honey: 'island_res_honey.png', res_relic: 'island_res_relic.png', node_nest: 'island_node_nest.png', node_herb: 'island_node_herb.png', node_hive: 'island_node_hive.png', node_grain: 'island_node_grain.png', node_relic: 'island_node_relic.png', node_lava_rock: 'island_node_lava_rock.png',   /* ★ P3-b */
    zone_lake: 'island_zone_lake.jpg', zone_cave: 'island_zone_cave.jpg', res_ore: 'island_res_ore.png', res_crystal: 'island_res_crystal.png', node_lakefish: 'island_node_lakefish.png', node_lotus: 'island_node_lotus.png', node_ore: 'island_node_ore.png', node_crystal: 'island_node_crystal.png', node_glowshroom: 'island_node_glowshroom.png',   /* ★ P3-a */
    bld_farm_1: 'island_bld_farm.png', bld_farm_3: 'island_bld_farm_lv3.png', bld_pen_1: 'island_bld_pen.png', bld_pen_3: 'island_bld_pen_lv3.png', bld_canal_1: 'island_bld_canal.png',
    res_seed: 'island_res_seed.png', res_egg: 'island_res_egg.png', res_milk: 'island_res_milk.png', res_grain: 'island_res_grain.png',
    node_chicken: 'island_node_chicken.png', node_goat: 'island_node_goat.png', node_rabbit: 'island_node_rabbit.png',
    zone_river: 'island_zone_river.jpg', zone_rock: 'island_zone_rock.jpg', zone_grass: 'island_zone_grass.jpg',   /* ★ P2-a */
    bld_bucket_1: 'island_bld_bucket.png', bld_raft_1: 'island_bld_raft.png', bld_wall_1: 'island_bld_wall.png', bld_torch_1: 'island_bld_torch.png',
    res_fish: 'island_res_fish.png', res_trash: 'island_res_trash.png', res_reed: 'island_res_reed.png', res_water: 'island_res_water.png',
    node_fish: 'island_node_fish.png', node_reed: 'island_node_reed.png', node_pebble: 'island_node_pebble.png', node_stone: 'island_node_stone.png',
    node_trash: 'island_node_trash.png', node_shell: 'island_node_shell.png', node_seedgrass: 'island_node_seedgrass.png', node_fibergrass: 'island_node_fibergrass.png',
    camp_night: 'island_camp_night.jpg', mon_shadow: 'island_mon_shadow.png', mon_beetle: 'island_mon_beetle.png', mon_bat: 'island_mon_bat.png', mon_boar: 'island_mon_boar.png',
    mon_slime: 'island_mon_slime.png', mon_ember: 'island_mon_ember.png', mon_basilisk: 'island_mon_basilisk.png', mon_spark: 'island_mon_spark.png', mon_guardian: 'island_mon_guardian.png', bld_tower: 'island_bld_tower.png', bld_tower_1: 'island_bld_tower.png', bld_ship: 'island_bld_ship.png', bld_ship_1: 'island_bld_ship.png',   /* ★ v1.28.0(老師回報「建造－瞭望台和帆船的圖片缺失」)— 根因:程式一律用 `b.img + '_1'` 取 Lv1 圖(見 islCampBuildMenu / islCampPaint),但這兩棟當初只登記了不帶 _1 的鍵 ⇒ 查無 → 破圖。16 棟建築逐棟比對,只有這兩棟缺;圖檔本身在 repo(256×256 RGBA)完全正常,所以補鍵即可,不必重畫。 */ ending_sail: 'island_ending_sail.jpg',   /* ★ v1.12.0 帆船建築/結局揚帆圖(缺圖退 emoji) */   /* ★ v1.11.0 四魔物+守墓石像+瞭望台(缺圖退 emoji) */
    map:      'island_map_base.jpg',            /* 2048×1536 大島底圖 */
    zone_beach:  'island_zone_beach.jpg',       /* 2048×1536 區域場景 */
    zone_forest: 'island_zone_forest.jpg',
    camp:     'island_camp_day.jpg',            /* 1024×768 營地 */
    bld_campfire_1: 'island_bld_campfire.png', bld_campfire_3: 'island_bld_campfire_lv3.png',
    bld_tent_1:     'island_bld_tent.png',     bld_tent_3:     'island_bld_tent_lv3.png',
    bld_storage_1:  'island_bld_storage.png',  bld_storage_3:  'island_bld_storage_lv3.png',
    res_wood: 'island_res_wood.png', res_stone: 'island_res_stone.png', res_fiber: 'island_res_fiber.png',
    res_berry: 'island_res_berry.png', res_leaf: 'island_res_leaf.png', res_mushroom: 'island_res_mushroom.png',
    res_shell: 'island_res_shell.png', res_pebble: 'island_res_pebble.png', res_feather: 'island_res_feather.png',
    node_tree: 'island_node_tree.png', node_stump: 'island_node_stump.png',
    node_palm: 'island_node_palm.png', node_bush: 'island_node_bush.png', node_bush_empty: 'island_node_bush_empty.png',
    node_mushroom: 'island_node_mushroom.png',
    gull_normal: 'island_npc_gull_normal.png', gull_happy: 'island_npc_gull_happy.png', gull_worry: 'island_npc_gull_worry.png',
    ui_dialog: 'island_ui_dialog.png', ui_bag: 'island_ui_bag.png',
    sheet_boy: 'island_body_sheet_boy.png', sheet_girl: 'island_body_sheet_girl.png',
    ending_sail: 'island_ending_sail.jpg',   /* ★ v1.20.0 大地圖外圍海面底圖(已在 repo) */
    /* ★ v1.21.0 選配(尚未上傳,缺圖退 emoji):沙灘漂流木/礁岩碎石資源點(192)、7 道料理(128)、12 種裝飾(128) */
    node_drift: 'island_node_drift.png', node_beachrock: 'island_node_beachrock.png',
    res_d_fish: 'island_res_d_fish.png', res_d_jam: 'island_res_d_jam.png', res_d_soup: 'island_res_d_soup.png', res_d_stew: 'island_res_d_stew.png', res_d_egg: 'island_res_d_egg.png', res_d_bread: 'island_res_d_bread.png', res_d_pudding: 'island_res_d_pudding.png',
    deco_pot: 'island_deco_pot.png', deco_fence: 'island_deco_fence.png', deco_lamp: 'island_deco_lamp.png', deco_rug: 'island_deco_rug.png', deco_chime: 'island_deco_chime.png', deco_flower: 'island_deco_flower.png', deco_table: 'island_deco_table.png', deco_bed: 'island_deco_bed.png', deco_statue: 'island_deco_statue.png', deco_koinobori: 'island_deco_koinobori.png', deco_mirror: 'island_deco_mirror.png', deco_vase: 'island_deco_vase.png'
  };
  /* ★ v1.19.0 分層造型(老師:主角造型新增 髮型/髮色/膚色/服裝)—— 每張 768×384、6 欄×3 列(正面/背面/側面朝右)、128px 格、角色置中、腳底貼格底:
   *   base_<boy|girl>_s0~s3  = 光頭基底身體(4 種膚色:淺/自然/小麥/深),只穿內搭背心短褲;
   *   hair_<boy|girl>_h0~h3  = 只有頭髮(短髮/雙馬尾/自然長髮/高馬尾),畫成中灰 #909090 帶明暗,髮色由 index 端 CSS filter 染色;
   *   cloth_<boy|girl>_c0~c3 = 只有衣服(力行運動服/探險背心裝/島民草編裝/海洋工作服)。
   *   三層同一張版面疊起來才對得齊,所以髮型/衣服要用「以基底身體圖為底圖加畫」的方式產出(見圖片提示詞清單)。任何一張缺圖 → index 端自動退回既有整張 sheet_boy/sheet_girl。 */
  (function(){ var bs = ['boy','girl'], i, j; for(i = 0; i < 2; i++){ for(j = 0; j < 4; j++){ D.IMG['base_' + bs[i] + '_s' + j] = 'island_body_base_' + bs[i] + '_s' + j + '.png'; D.IMG['hair_' + bs[i] + '_h' + j] = 'island_hair_' + bs[i] + '_h' + j + '.png'; D.IMG['cloth_' + bs[i] + '_c' + j] = 'island_cloth_' + bs[i] + '_c' + j + '.png'; } } })();
  /* ★ v1.26.0 分層造型微調表(老師:GM 要能像造型工房那樣調整頭髮與衣服的尺寸和座標)——
   *   24 張分層圖是各自生成的,實際量測後發現彼此比例不一致:
   *     ·衣服 c1~c3 是照「比較高瘦的身體」畫的,整件比基底身體大 1.3~1.6 倍 ⇒ 領口畫到臉上,整顆頭被吃掉;
   *     ·頭髮假髮的頭圍比基底的頭大一圈,少女基底的頭又比少年高 5px(128 格座標) ⇒ 瀏海壓到眼睛。
   *   本表就是每一張圖各自的「尺寸(sx/sy)+座標(dx/dy)」修正值,由 index 端 islLyGeo() 換算成
   *   background-size / background-position(基準點:水平置中、腳底那條線),所以三層永遠對得齊、走路各幀也同步。
   *     sx/sy = 寬/高倍率(1 = 原圖大小);dx/dy = 顯示用 64px 座標系的位移(正 = 右/下,可到小數 0.5)。
   *   下面這組預設值是用 Python 量每張圖的實際輪廓(alpha>120)自動擬合出來的:
   *     ·衣服:領口高於基底下巴時 → 等比縮到「領口剛好落在脖子」;本來就畫對的(c0 力行運動服)維持 1.0 不動。
   *     ·頭髮:等比縮到髮量寬度 ≈ 頭寬 ×1.12,再把髮際線對到基底的頭頂上緣。
   *   GM 在遊戲裡用「🎨 造型工房(GM)」微調後按「📋 複製設定值」,把值貼回來就換掉這張表(本機暫存在 localStorage.isl_lyadj)。 */
  D.LAYER_ADJ = {
    /* ★ v1.149.0(2026-09-14・老師在「🎨 造型工房(GM)」調好後貼回聊天室的「📋 複製設定值」輸出) — 全表覆蓋為老師這次微調過的值;
       原 v1.29.0 的「全表 1/1/0/0(少女髮型 dy:-2)」預設值已被這份取代(見下方各鍵行內舊值不保留,整段為老師最新調校結果)。
       GM 之後若再用造型工房調整,同樣流程:調好 → 📋 複製設定值 → 貼回聊天室 → 寫進本表 → 上傳部署後全裝置生效。 */
    cloth_boy_c0: { sx:1.000, sy:1.000, dx:0, dy:0 },
    cloth_boy_c1: { sx:1.000, sy:1.000, dx:0, dy:0 },
    cloth_boy_c2: { sx:1.000, sy:1.000, dx:0, dy:0 },
    cloth_boy_c3: { sx:1.000, sy:1.000, dx:0, dy:0 },
    hair_boy_h0: { sx:1.260, sy:1.030, dx:0, dy:0 },
    /* 正面 專屬 */ 'hair_boy_h0@0': { sx:1.270, sy:1.100 },
    /* 背面 專屬 */ 'hair_boy_h0@1': { sy:1.110 },
    /* 側面 專屬 */ 'hair_boy_h0@2': { sx:1.240, sy:1.230, dx:-0.5, dy:7.5 },
    hair_boy_h1: { sx:1.280, sy:1.060, dx:0, dy:0 },
    /* 正面 專屬 */ 'hair_boy_h1@0': { sx:1.220, sy:1.310, dx:0, dy:8.5 },
    /* 背面 專屬 */ 'hair_boy_h1@1': { sx:1.290, sy:1.360, dx:0.5, dy:13.5 },
    /* 側面 專屬 */ 'hair_boy_h1@2': { sx:1.310, sy:1.390, dx:-1.5, dy:16 },
    hair_boy_h2: { sx:1.180, sy:1.030, dx:0, dy:0 },
    /* 正面 專屬 */ 'hair_boy_h2@0': { sx:1.080, sy:1.180, dx:0.5, dy:6 },
    /* 背面 專屬 */ 'hair_boy_h2@1': { sx:1.130, sy:1.180, dy:7 },
    /* 側面 專屬 */ 'hair_boy_h2@2': { sx:1.130, sy:1.230, dx:-0.5, dy:10.5 },
    hair_boy_h3: { sx:1.240, sy:1.040, dx:0, dy:0 },
    /* 正面 專屬 */ 'hair_boy_h3@0': { sx:1.240, sy:1.190, dy:3 },
    /* 背面 專屬 */ 'hair_boy_h3@1': { sx:1.190, sy:1.540, dy:22 },
    /* 側面 專屬 */ 'hair_boy_h3@2': { sx:1.240, sy:1.290, dx:-0.5, dy:11 },
    cloth_girl_c0: { sx:1.000, sy:1.000, dx:0, dy:0 },
    /* 側面 專屬 */ 'cloth_girl_c0@2': { sy:1.000, dy:0 },
    cloth_girl_c1: { sx:1.000, sy:1.000, dx:0, dy:0 },
    cloth_girl_c2: { sx:1.000, sy:1.000, dx:0, dy:0 },
    cloth_girl_c3: { sx:1.000, sy:1.000, dx:0, dy:0 },
    hair_girl_h0: { sx:1.240, sy:1.070, dx:0, dy:-2.5 },
    hair_girl_h1: { sx:1.226, sy:0.966, dx:-4.5, dy:-6.1 },
    /* 正面 專屬 */ 'hair_girl_h1@0': { sx:1.426, sy:1.366, dx:-0.5, dy:15.9 },
    /* 背面 專屬 */ 'hair_girl_h1@1': { sx:1.326, sy:1.266, dx:-0.5, dy:11.9 },
    /* 側面 專屬 */ 'hair_girl_h1@2': { sx:1.216, sy:1.256, dx:-5, dy:7.4 },
    hair_girl_h2: { sx:1.000, sy:1.000, dx:0, dy:-2 },
    /* 正面 專屬 */ 'hair_girl_h2@0': { sx:1.000, sy:1.150, dy:4 },
    /* 背面 專屬 */ 'hair_girl_h2@1': { sx:1.100, sy:1.200, dx:0.5, dy:7.5 },
    /* 側面 專屬 */ 'hair_girl_h2@2': { sx:1.100, sy:1.100, dx:-3.5, dy:1 },
    hair_girl_h3: { sx:1.233, sy:1.063, dx:1.5, dy:-7.5 },
    /* 正面 專屬 */ 'hair_girl_h3@0': { sx:1.073, sy:1.063, dx:2.5, dy:-7 },
    /* 背面 專屬 */ 'hair_girl_h3@1': { sx:0.873, sy:0.813, dx:0, dy:-16.5 },
    /* 側面 專屬 */ 'hair_girl_h3@2': { sx:1.333, sy:1.183, dx:-6.5, dy:3.5 }
  };  /* ★ v1.22.0 回合制戰鬥與武器(全部選配,缺圖自動退回:主角=既有 sprite 幀 + CSS 動作、魔物=既有 island_mon_<k>.png + CSS 動作、武器=emoji):
   *   bt_p_<boy|girl>_<idle|atk|hit|stun|down> = 主角戰鬥立繪 5 態(island_bt_p_boy_idle.png …,512×512 透明底、側面朝右、腳底貼底);
   *   bt_m_<魔物k>_<idle|atk|hit|stun|down>     = 9 種魔物(8 隻 + 守墓石像)戰鬥立繪 5 態(island_bt_m_shadow_idle.png …,512×512 透明底、側面朝左);
   *   wp_<武器id>                                = 6 種武器圖(island_wp_club.png …,256×256 透明底,品質★由程式加框色、等級由程式加角標);
   *   node_bigleaf                               = 森林月桃葉叢資源點(192)。 */
  D.IMG.node_bigleaf = 'island_node_bigleaf.png';
  (function(){ var st = ['idle','atk','hit','stun','down'], ms = ['shadow','beetle','bat','boar','slime','ember','basilisk','spark','guardian'], ws = ['club','spear','bow','hammer','boomerang','stoneaxe'], i, j;
    for(i = 0; i < st.length; i++){ D.IMG['bt_p_boy_' + st[i]] = 'island_bt_p_boy_' + st[i] + '.png'; D.IMG['bt_p_girl_' + st[i]] = 'island_bt_p_girl_' + st[i] + '.png'; for(j = 0; j < ms.length; j++){ D.IMG['bt_m_' + ms[j] + '_' + st[i]] = 'island_bt_m_' + ms[j] + '_' + st[i] + '.png'; } }
    for(i = 0; i < ws.length; i++){ D.IMG['wp_' + ws[i]] = 'island_wp_' + ws[i] + '.png'; } })();
  D.SKINS4 = [ { n:'淺', c:'#ffe3cf' }, { n:'自然', c:'#f5c9a5' }, { n:'小麥', c:'#d99e6f' }, { n:'深', c:'#8f5a38' } ];   /* 分層造型的 4 種膚色(對應 base_*_s0~s3;主程式 8 色膚色索引 ÷2 取整對應) */
  D.CLOTHES = [ { n:'運動服', e:'👕' }, { n:'探險背心裝', e:'🦺' }, { n:'島民草編裝', e:'🌿' }, { n:'海洋工作服', e:'🧥' } ];   /* ★ v1.30.0 老師:初始服裝「力行運動服」改名「運動服」(圖檔名/資料鍵不變,只改顯示名稱) */

  /* ── 資源／物品定義 ── */
  D.ITEMS = {
    wood:     { n:'木材',   e:'🪵', img:'res_wood',     cat:'res' },
    stone:    { n:'石頭',   e:'🪨', img:'res_stone',    cat:'res' },
    fiber:    { n:'纖維',   e:'🌿', img:'res_fiber',    cat:'res' },
    leaf:     { n:'大葉',   e:'🍃', img:'res_leaf',     cat:'res' },
    berry:    { n:'野果',   e:'🍓', img:'res_berry',    cat:'food' },
    mushroom: { n:'野菇',   e:'🍄', img:'res_mushroom', cat:'food' },
    shell:    { n:'貝殼',   e:'🐚', img:'res_shell',    cat:'misc' },
    pebble:   { n:'卵石',   e:'⚪', img:'res_pebble',   cat:'misc' },
    feather:  { n:'羽毛',   e:'🪶', img:'res_feather',  cat:'misc' },
    seed:     { n:'種子',   e:'🌰', img:'res_seed',     cat:'misc' },   /* ★ v1.9.0 接上已上傳的 island_res_seed.png */
    fish:     { n:'魚',     e:'🐟', img:'res_fish',     cat:'food' },   /* ★ P2 */
    trash:    { n:'海廢',   e:'♻', img:'res_trash',    cat:'res' },
    reed:     { n:'蘆葦',   e:'🎋', img:'res_reed',     cat:'res' },
    water:    { n:'淡水',   e:'💧', img:'res_water',    cat:'res' },
    /* ★ P2-b:畜牧產物、農作物、料理(cat:'dish' 可在物品包「🍽 吃」,eat={hp,ap};★★★ 效果 ×1.5) */
    egg:      { n:'蛋',     e:'🥚', img:'res_egg',      cat:'food' },
    milk:     { n:'羊奶',   e:'🥛', img:'res_milk',     cat:'food' },
    grain:    { n:'小米',   e:'🌾', img:'res_grain',    cat:'food' },
    d_fish:   { n:'烤魚',     e:'🐟', img:'res_d_fish', cat:'dish', eat:{hp:30, ap:0} },
    d_jam:    { n:'野果醬',   e:'🫙', img:'res_d_jam', cat:'dish', eat:{hp:10, ap:1} },
    d_soup:   { n:'野菇湯',   e:'🍲', img:'res_d_soup', cat:'dish', eat:{hp:40, ap:0} },
    d_stew:   { n:'鮮魚菇湯', e:'🥘', img:'res_d_stew', cat:'dish', eat:{hp:30, ap:1} },
    d_egg:    { n:'煎蛋',     e:'🍳', img:'res_d_egg', cat:'dish', eat:{hp:25, ap:0} },
    d_bread:  { n:'小米餅',   e:'🥞', img:'res_d_bread', cat:'dish', eat:{hp:20, ap:1} },
    d_pudding:{ n:'羊奶布丁', e:'🍮', img:'res_d_pudding', cat:'dish', eat:{hp:20, ap:2} },
    ore:      { n:'鐵礦',   e:'🟫', img:'res_ore',      cat:'res' },    /* ★ P3-a 洞窟採石產;電路研究材料 */
    crystal:  { n:'水晶',   e:'💎', img:'res_crystal',  cat:'misc' },
    herb:     { n:'草藥',   e:'🍀', img:'res_herb',     cat:'res' },    /* ★ P3-b 懸崖;治療替代材料 */
    honey:    { n:'蜂蜜',   e:'🍯', img:'res_honey',    cat:'dish', eat:{hp:15, ap:1} },   /* 山谷蜂巢;可直接吃 */
    relic:    { n:'遺物',   e:'🏺', img:'res_relic',    cat:'misc' }
  };
  D.ITEM_ORDER = ['wood','stone','fiber','leaf','reed','trash','water','berry','mushroom','fish','egg','milk','grain','seed','shell','pebble','feather','d_fish','d_jam','d_soup','d_stew','d_egg','d_bread','d_pudding','ore','crystal','herb','honey','relic'];
  D.STACK = 20;                 /* 物品包每格堆疊上限 */
  D.BAG_CAP = 12;               /* 物品包 Lv1 格數 */
  D.STORE_CAP = { 1:99, 2:199, 3:399, 4:699, 5:999 };   /* 倉庫每種上限(隨倉庫 Lv) */

  /* ── 四維能力(第三十一章)與 8 個起步風格模板(31.2) ── */
  D.STATS = [
    { k:'dex', n:'巧手', e:'🖐', d:'拖曳類活動品質、甜蜜點寬度' },
    { k:'mov', n:'腳程', e:'👣', d:'走路速度、限時類活動時間' },
    { k:'pow', n:'力氣', e:'💪', d:'敲打／採礦／伐木單擊量' },
    { k:'wit', n:'巧思', e:'🧠', d:'拼圖／研究正確率、知識題提示' }
  ];
  D.STYLES = [
    { id:'craft',   n:'巧手型', src:'電腦繪圖師', e:'🎨', s:{dex:4,mov:1,pow:1,wit:4}, d:'手很巧、腦袋也靈光,做東西特別精緻。' },
    { id:'think',   n:'巧思型', src:'程式設計師', e:'💻', s:{dex:2,mov:1,pow:1,wit:6}, d:'解謎和研究的高手,遇到機關一眼就懂。' },
    { id:'garden',  n:'園藝型', src:'弦樂團員',   e:'🎻', s:{dex:3,mov:2,pow:1,wit:4}, d:'細心又有耐心,適合照顧植物與採集。' },
    { id:'explore', n:'探險型', src:'小劇團員',   e:'🎭', s:{dex:2,mov:4,pow:1,wit:3}, d:'愛冒險、腳程快,島上哪裡都想去。' },
    { id:'runner',  n:'腳程型', src:'田徑隊員',   e:'🏃', s:{dex:1,mov:6,pow:2,wit:1}, d:'跑得飛快,限時活動總是來得及。' },
    { id:'balance', n:'均衡型', src:'直笛團員',   e:'🎵', s:{dex:2,mov:2,pow:2,wit:4}, d:'什麼都會一點,穩穩地慢慢變強。' },
    { id:'power',   n:'力氣型', src:'籃球隊員',   e:'🏀', s:{dex:1,mov:2,pow:6,wit:1}, d:'力氣超大,砍樹敲石頭一下就見效。' },
    { id:'eco',     n:'生態型', src:'動物學家',   e:'🔬', s:{dex:3,mov:2,pow:3,wit:2}, d:'懂動植物,採集時常有意外收穫。' }
  ];
  D.STAT_MAX = 50;      /* ★ v1.19.0 老師:四維上限 20 → 50 */
  D.SKILL_MAX = 50;     /* ★ v1.19.0 老師:生存技能等級上限 10 → 50(升級 EXP 仍 = 5×Lv;Lv3/5/7 里程碑效果不變,Lv10 以上只再加產量與甜蜜點,見 index islSkillGain/islSweetWidth) */
  D.STAT_XP_NEED = 8;   /* 用進廢退:對應維度累積 8 次活動 → +1(上限 STAT_MAX) */

  /* ── ★ v1.15.0 無人島命名(創角時隨機生成,可隨時改;形容詞+名詞組合) ── */
  /* ★ v1.19.0 老師:島名詞庫至少 50×50 —— 形容詞 70 × 名詞 62(自然/天象/神祕/可愛/海洋生物/尋寶/水果/方位…各種風格),創角與改名都用兩個可捲動下拉選單組合,也可自由輸入 */
  D.ISLAND_ADJ = ['翡翠','珊瑚','薄霧','椰風','琉璃','浪花','向陽','靜謐','潮汐','沙金','月光','風信','蜜柑','海風','星砂','潮聲','綠意','漣漪','日暮','晨曦','彩虹','流星','銀河','極光','曙光','火山','熔岩','迷霧','暴風','雷鳴','神祕','傳說','遠古','失落','隱藏','快樂','微笑','勇者','冒險','自由','貝殼','海龜','飛魚','鯨鯊','海豚','黑潮','碧波','湛藍','蔚藍','翠綠','夢幻','甜心','棉花糖','棒棒糖','蘋果','海盜','藏寶','龍骨','石像','守護','玫瑰','薰衣草','野莓','芒果','鳳梨','熱帶','南國','東風','北極星','太陽'];
  D.ISLAND_NOUN = ['小島','灣岸','礁島','群島','沙洲','海角','秘境','漂流島','岬角','港灣','棲地','浮島','岸線','潟湖','秘灘','歸帆島','燈塔島','漁村島','王國','樂園','天堂','家園','避風港','珊瑚礁','環礁','火山島','石灘','貝殼灣','龜島','鯨島','鷗島','蟹島','獺島','綠洲','花園','森林島','寶島','夢島','基地','營地','據點','前哨站','觀測站','星島','月島','日島','雲島','雨島','之丘','之嶼','之洲','之岬','之濱','海灣','漁港','燈塔','礁石灘','荒島','孤島','仙境','世界','海島'];
  D.ISLAND_NAME_MAX = 10;

  /* ── ★ v1.15.0 好友連線合作(拜訪好友的島/邀請好友來自己的島,一座島最多 4 人) ── */
  D.COOP_MAX = 4;              /* 同一座島最多同時容納玩家數(含島主) */
  D.COOP_HEARTBEAT_SEC = 6;    /* 在合作模式中每隔幾秒回報一次自己的位置 */
  D.COOP_STALE_SEC = 18;       /* 超過幾秒沒回報 → 判定離線,自動變成留守的 NPC(並通知島主) */
  D.COOP_GONE_SEC = 600;       /* 變成 NPC 後超過幾秒 → 任一在場玩家可把他清出島(釋放名額) */
  /* ★ v1.17.0 好友營地唯讀畫面:島主名片多發布 deco(裝飾位置)/board(留言板最新幾則)/comfort,訪客可「🏕 參觀營地」看擺設、讀留言板、留言給島主(走既有 mail 子集合 note,島主 📌 釘上才會出現在板上) */
  D.COOP_BOARD_PUB = 8;        /* 名片上公開的留言板則數(取最新 N 則;只含署名/內容/天數) */
  D.COOP_DECO_PUB = 40;        /* 名片上公開的裝飾數上限(避免名片文件過大) */

  /* ── 生存技能(P1 四種;Lv N→N+1 需 EXP = 5×N;每級基礎產量 +10%) ── */
  D.SKILLS = {
    gather: { n:'採集', e:'🌿', stat:'dex', lv3:'認得毒莓(自動標 ⚠)',  lv5:'正確目標微微發亮', lv7:'採集產量再 +1' },
    chop:   { n:'伐木', e:'🪓', stat:'pow', lv3:'年輪自動顯示',         lv5:'甜蜜點更寬',       lv7:'砍倒必多 1 木' },
    fire:   { n:'生火', e:'🔥', stat:'wit', lv3:'三要素框有提示',       lv5:'吹氣綠區更寬',     lv7:'生火必 ★★ 以上' },
    build:  { n:'建造', e:'🔨', stat:'dex', lv3:'藍圖部位有提示',       lv5:'釘子節奏放慢',     lv7:'升級材料 −20%' }
  };
  D.SKILL_XP_NEED = function(lv){ return 5 * lv; };
  /* ★ v1.20.0 老師:AP 基礎 10;各活動 AP 不同(ACTS[].ap);點 HUD 的 AP 藥丸顯示這份清單 */
  D.AP_BASE = 10;
  D.AP_EXTRA = [ { e:'🎓', n:'向訓練師上課', ap:1 }, { e:'🔧', n:'環境工程修復', ap:1 }, { e:'🕳', n:'遺跡地下層探索', ap:1 } ];
  /* ★ v1.20.0 老師:採集 QTE 輕/中/重位置不同 —— 輕(偏左,較快放手)/中(中間)/重(偏右,按較久);依資源決定 */
  D.GATHER_FORCE = { berry:'light', mushroom:'light', leaf:'light', herb:'light', seed:'light', feather:'light', shell:'light', pebble:'light', honey:'light',
                     wood:'heavy', stone:'heavy', ore:'heavy', crystal:'heavy', relic:'heavy' };
  D.GATHER_FORCE_UI = { light: { title:'🍃 輕輕摘', hint:'這種東西很脆弱——拉一下下就要放手!黃區在左邊(偏快),白色正中央=暴擊。', over:'太用力,弄壞了…', low:'還沒摘下來' },
                        mid:   { title:'👐 適中的力道', hint:'不快不慢——黃區在中間,白色正中央=暴擊。', over:'太用力了', low:'力道不夠' },
                        heavy: { title:'💪 用力拔起', hint:'這個很重——要按久一點!黃區在右邊(偏久),白色正中央=暴擊。', over:'太猛,扭到了…', low:'還拔不動' } };
  /* ★ v1.20.0 老師:AP 用完時角色頭上的泡泡,每 3 秒隨機換一句 */
  /* ══ ★ v1.28.0(2026-09-13・老師「一個匯出設定按鍵讓我可以給你修改玩家創角時預設的樣貌」)══
     D.CREATE_DEFAULT = 玩家第一次進創角畫面時,預覽上**預設長什麼樣**。
     ★ 這是「預設值」不是「鎖定值」:玩家仍可自由改體型/膚色/髮型/髮色/瞳色/服裝,只是一進去就已經是一個好看的組合,
       而不是像以前那樣固定 boy/skin1/h0/c0(白紙一張,很多小朋友直接按確定就走了)。
     ★ GM 在「🎨 造型工房(GM)」的「🧍 創角預設」分頁調好後按「📋 複製設定值」,會連同 LAYER_ADJ 一起輸出,
       老師把整段貼回聊天室,我寫進本表 ⇒ 全裝置生效。
     ⚠ 登入的學生仍會被 islCreateAutoApplyMain 以大對抗主角的造型覆蓋(那是老師更早的裁定,優先於本預設值);
       本表主要影響訪客、以及大對抗還沒捏過主角的學生。
     ⚠ 欄位值域:body 'boy'|'girl';skin 0~7(5 是隱藏色,會被自動跳過);hair/cloth 0~3;hairC 0~15;eyeC 0~11。 */
  D.CREATE_DEFAULT = { body:'boy', skin:1, hair:0, hairC:0, eyeC:0, cloth:0, clothC:0, style:'balance' };   /* ★ v1.149.0 補上 clothC:0(服裝染色,v1.138.0 新增欄位,舊表遺漏)——老師本輪貼回的「📋 複製設定值」輸出本就含這個欄位，一併補齊避免匯出/寫入格式對不齊。 */

  D.TIRED_LINES = ['好累…今天就先這樣吧。', '體力不支了…回去休息。', '時間過得好快,差不多該休息了。'];

  /* ══════════════════════════════════════════════════════════════════════════
   * ★ v1.28.0(2026-09-13・老師「先做劇情、豐富的主角內心對白(各種情境、反應,頭上對話泡泡)」)
   *   D.MONO = 主角內心話資料表。每個 key 是一種「情境」,程式在對應時機呼叫 islMono(key, ctx)
   *   讓角色頭上冒出對話泡泡(沿用 AP 泡泡同一套 DOM/CSS,不另開第二套)。
   *   ★ 設計原則(老師既有標準,沿用):
   *     ① 一律用「我」的內心話語氣,不是旁白、不是說明文字。
   *     ② 每句都帶一點自然科學觀察或生活感受,但不講課(講課有圖鑑和題目,泡泡只負責「有人味」)。
   *     ③ 每組至少 3 句,程式隨機挑且刻意避開上一次講過的那句(見 index 端 islMonoPick)。
   *     ④ 文字盡量短(泡泡限寬 150px 會換行),最長不超過約 24 個字。
   *   ⚠ 冷卻與優先權在 index 端處理(D.MONO.cool / D.MONO.pri),這裡只放文字。
   *   ⚠ 新增情境時:先在這裡加一組 key,再到 index 端對應的函式加一行 islMono。
   *     兩邊都要動,只加這裡不會有任何效果(刻意的:避免資料表偷偷長出沒人呼叫的死內容)。
   * ══════════════════════════════════════════════════════════════════════════ */
  D.MONO = {
    cool: 11000,         /* 全域最短間隔(毫秒):11 秒內不再冒第二顆泡泡,避免一直碎念 */
    dur:  5000,          /* 每顆泡泡停留時間(毫秒),與 AP 泡泡一致 */
    pri: {               /* 優先權:數字大的可以打斷正在顯示的低優先泡泡 */
      apZero:5, hpLow:5, bagFull:4, raidWarn:5, battleLose:4,
      crit:3, star3:3, levelUp:3, statUp:3, built:3, techDone:3, codex:2,
      wake:2, wxRain:1, wxTyphoon:3, wxSun:1, zoneAgain:1, idle:1
    },
    lines: {
      /* ── 每天 / 天氣 ── */
      wake:      ['睡飽了。今天要做什麼好呢?', '太陽出來了,島上的東西也長回來了。', '又是新的一天。昨天沒做完的,今天繼續。', '早安,我的島。'],
      wakeLate:  ['已經第 {day} 天了……我在這裡活了這麼久。', '第 {day} 天。我好像比剛來的時候厲害一點了。'],
      wxSun:     ['今天太陽好大,水分蒸發得快,要記得補水。', '晴天,影子好短——現在應該接近中午。', '天氣好,適合往遠一點的地方走走。'],
      wxRain:    ['下毛毛雨了。雨水會滲進土裡,植物會長得比較好。', '雨滴打在葉子上啪嗒啪嗒的,好好聽。', '下雨天路變滑了,走慢一點。'],
      wxTyphoon: ['風好大!颱風要來了,快回營地。', '雲一直往同一個方向捲……這是颱風的樣子。', '要把東西收好,不然會被吹走。'],
      /* ── 體力 / 行動力 / 背包 ── */
      apLow:     ['有點累了,剩下的力氣要用在重要的事上。', '手開始發抖……做完這件事就休息。', '快沒力氣了,再撐一下。'],
      apZero:    ['好累…今天就先這樣吧。', '力氣用完了,回去休息吧。', '身體在跟我說「夠了」。明天再來。'],
      hpLow:     ['受傷了……要先處理傷口才行。', '好痛。硬撐下去只會更糟。', '該找草藥了,不能再拖。'],
      bagFull:   ['背包塞不下了,得先回營地放東西。', '再撿就要掉出來了……先回去一趟。', '東西太多反而走不快。'],
      /* ── 探索 / 移動 ── */
      zoneAgain: ['又回到這裡了。上次沒注意到的地方,再看一次。', '同一個地方,不同的時間,看到的東西會不一樣。', '這裡我熟了。先去老地方看看。'],
      idle:      ['嗯……接下來要做什麼?', '先想一想再動,比較不會白跑。', '(深呼吸)海的味道。'],
      water:     ['水看起來很淺,其實不知道有多深——不能走進去。', '水裡的東西看起來比較近,那是光折射造成的。'],
      blocked:   ['過不去。要繞路。', '這裡被擋住了,換個方向試試。'],
      /* ── 採集與活動 ── */
      actStart:  ['好,專心。', '仔細看清楚再動手。', '老師說過:先觀察,再想辦法。'],
      crit:      ['剛剛那一下抓得剛剛好!', '找到施力的角度了!', '就是這個力道!'],
      star3:     ['這個品質超好!小心不要弄壞。', '哇,這是我採過最漂亮的一個。', '狀態完美!今天運氣不錯。'],
      actFail:   ['失敗了……再來一次。', '力氣用錯地方了。下次換個方式。', '沒關係,失敗也是在學。'],
      pick:      ['這個好像用得到,先收起來。', '撿到東西了!', '島上什麼都不能浪費。'],
      /* ── 營地 / 建造 / 成長 ── */
      built:     ['蓋好了!營地又更像家了一點。', '自己蓋出來的東西,看著就有成就感。', '有了這個,以後方便多了。'],
      building:  ['還在施工……做東西本來就急不得。', '工程要時間。先去做別的吧。'],
      levelUp:   ['我好像變熟練了!', '做久了,手就記起來了。', '進步了!練什麼就會長什麼。'],
      statUp:    ['身體變得更靈活了。', '感覺力氣變大了一點。', '腦袋好像轉得比以前快。'],
      techDone:  ['原理弄懂了!可以動手做了。', '把科學變成工具,就是這種感覺。', '研究成功!'],
      codex:     ['又認識一種新的生物了,記到圖鑑裡。', '這個名字我以前只在課本上看過。', '島上的東西,一個一個記下來。'],
      comfort:   ['營地變得好舒服,晚上會睡得比較好。', '把家佈置得漂亮一點,心情也會好。'],
      /* ── 戰鬥 / 夜襲 / 地下層 ── */
      battleStart:['小心……有東西靠近了。', '不能硬碰硬,要用對方法。', '冷靜。想想它怕什麼。'],
      battleWin: ['贏了!用對工具真的比用力有效。', '呼……解決了。', '原來只要知道它的弱點就不可怕。'],
      battleLose:['撤退!活著才有下次。', '打不贏……先跑,回去想辦法。', '我還不夠強,要再準備一下。'],
      raidWarn:  ['今晚不太平靜……要準備好。', '瞭望台看到動靜了,趕快檢查營火。', '把工具放在手邊,晚上可能用得到。'],
      raidWin:   ['守住了!營火還亮著。', '大家平安。這一夜好長。', '只要準備夠,就不用怕。'],
      raidLose:  ['東西被搶走了……明天要把圍牆補起來。', '沒守住。下次要提早準備。'],
      dungeon:   ['地下好安靜,只有我的腳步聲。', '這裡的空氣比較悶,要快點。', '牆上的刻痕……以前有人來過。'],
      /* ── 人與朋友 ── */
      npcMeet:   ['島上還有其他生物,我不是一個人。', '牠好像不怕我。', '有人可以說說話,真好。'],
      mail:      ['有人寄東西給我!', '朋友記得我。好開心。', '收到禮物了,下次也要回禮。'],
      questDone: ['任務完成!阿獺應該會很高興。', '幫上忙的感覺不錯。'],
      trade:     ['貝幣又多了一點,存起來。', '有需要的東西再買就好,不要亂花。'],
      /* ── 目標 / 離島 ── */
      shipNear:  ['造船的材料快湊齊了……我真的可以回家。', '再一點點,就能出海了。'],
      shipDone:  ['船好了。但是……我好像也捨不得這座島。']
    }
  };

  /* ★ v1.28.0(老師「豐富的操作互動音效」)— D.SFX_MAP = 荒島操作事件 → 既有音效 id 對照表。
     ★ 刻意只引用**已存在**的 54 支 sfx(minigame_index.html 裡的 <audio id="sfx-…">),不新增任何音檔 ⇒ 上傳即生效、不必等老師生音效。
     格式:事件名: [音效 id, 音量]。音量一律偏小(0.2~0.5):荒島是長時間停留的模式,
     操作音太大聽久會煩,而且會蓋掉 BGM 與環境音(環境音是 v1.126.0 才特地加的)。
     ⚠ 新增事件請一併到 index 端呼叫 islSfx(事件名),只加這裡不會有聲音。 */
  D.SFX_MAP = {
    walk:      ['sfx-tap', 0.12],          /* 每走一格(已節流,連走時每 2 格才響一次) */
    menuOpen:  ['sfx-enter', 0.30],        /* 開面板/視窗 */
    menuClose: ['sfx-cancel', 0.25],       /* 關視窗/取消 */
    select:    ['sfx-sel', 0.28],          /* 選單選項、分頁切換 */
    confirm:   ['sfx-confirm', 0.35],      /* 確定鈕 */
    deny:      ['sfx-ng', 0.30],           /* 材料不足/AP 不足/走不過去 */
    pick:      ['sfx-coin', 0.30],         /* 撿起地上的小東西 */
    bagIn:     ['sfx-ok', 0.26],           /* 收進物品包/倉庫 */
    gather:    ['sfx-tap', 0.30],          /* 採集每一下 */
    chop:      ['sfx-punch', 0.32],        /* 伐木/採石每一下 */
    crit:      ['sfx-crit', 0.45],         /* 暴擊 */
    star3:     ['sfx-summon-reveal', 0.40],/* 採到 ★★★ */
    build:     ['sfx-statup', 0.35],       /* 動工 */
    buildDone: ['sfx-medal', 0.45],        /* 完工 */
    fire:      ['sfx-powerup', 0.38],      /* 生火成功 */
    levelUp:   ['sfx-powerup', 0.42],      /* 技能/四維提升 */
    tech:      ['sfx-recharge', 0.38],     /* 研究完成 */
    codex:     ['sfx-passive', 0.33],      /* 圖鑑新收錄 */
    heal:      ['sfx-heal', 0.38],         /* 治療/吃東西回體力 */
    hurt:      ['sfx-normalatk', 0.35],    /* 受傷 */
    buy:       ['sfx-coin', 0.38],         /* 買賣成交 */
    quest:     ['sfx-applause', 0.35],     /* 委託完成 */
    mail:      ['sfx-gentle', 0.35],       /* 收到信 */
    save:      ['sfx-ok', 0.30],           /* 存檔成功 */
    saveFail:  ['sfx-ng', 0.35],           /* 存檔失敗 */
    dialog:    ['sfx-gentle', 0.22],       /* 對白翻頁 */
    bubble:    ['sfx-gentle', 0.16],       /* 內心話泡泡(很小聲,只是提醒有話) */
    newDay:    ['sfx-fantasy', 0.40],      /* 換日 */
    raid:      ['sfx-earthquake', 0.45],   /* 夜襲開始 */
    ending:    ['sfx-goddess', 0.50]       /* 帆船完成/結局 */
  };

  /* ── 11 區域(第三章)。P1 只有 beach/forest 有場景;其餘只在大島地圖顯示解鎖條件。 ── */
  /* ★ v1.18.0 老師:依 island_map_base.jpg 實圖重新辨識各區地標位置(%):沙灘=南岸沙灘、營地鈕=沙灘右上的空地(index 端)、森林=西側密林、草原=中央花草地、溪流=瀑布下的西北溪流、湖泊=中央湖、洞窟=西北岩壁洞口、懸崖=東側橙色台地、山谷=湖與台地之間的溪谷、岩岸=東北石拱與礁岩、遺跡=東北石柱遺跡、火山=北方火山 */
  D.ZONES = [
    { id:'beach',  n:'沙灘',  e:'🏖', order:1, unlock:{t:'start'},           unlockText:'起始',               map:{x:44,y:79}, p1:true },
    { id:'forest', n:'森林',  e:'🌲', order:2, unlock:{t:'bld', bld:'campfire'}, unlockText:'蓋好「營火」',   map:{x:24,y:47}, p1:true },
    { id:'grass',  n:'草原',  e:'🌾', order:3, unlock:{t:'explore', zone:'forest', pct:50}, unlockText:'森林探索 ≥50%', map:{x:50,y:50}, p1:true },   /* ★ P2 開放 */
    { id:'river',  n:'溪流',  e:'🏞', order:4, unlock:{t:'bld', bld:'bucket'}, unlockText:'蓋好「水桶架」',  map:{x:40,y:27}, p1:true },   /* ★ P2 開放 */
    { id:'rock',   n:'岩岸',  e:'🪨', order:5, unlock:{t:'bld', bld:'raft'},   unlockText:'蓋好「木筏」',    map:{x:87,y:27}, p1:true },   /* ★ P2 開放 */
    { id:'lake',   n:'湖泊',  e:'🏔', order:6, unlock:{t:'explore', zone:'river', pct:50}, unlockText:'溪流探索 ≥50%', map:{x:59,y:30}, p1:true },   /* ★ P3-a 開放 */
    { id:'cave',   n:'洞窟',  e:'🕳', order:7, unlock:{t:'tech', tech:'torch'}, unlockText:'研究科技「火把」',  map:{x:16,y:22}, p1:true },   /* ★ P3-a 開放 */
    { id:'cliff',  n:'懸崖',  e:'⛰', order:8, unlock:{t:'tech', tech:'pulley'}, unlockText:'研究科技「滑輪」', map:{x:78,y:48}, p1:true },   /* ★ P3-b 開放 */
    { id:'valley', n:'山谷',  e:'🌄', order:9, unlock:{t:'tech', tech:'wheel'}, unlockText:'研究科技「水車」',  map:{x:67,y:44}, p1:true },
    { id:'ruins',  n:'遺跡',  e:'🗿', order:10,unlock:{t:'tech', tech:'circuit'}, unlockText:'研究科技「電路」', map:{x:72,y:12}, p1:true },
    { id:'volcano',n:'火山',  e:'🌋', order:11,unlock:{t:'puzzle', zone:'ruins'}, unlockText:'解開遺跡機關', map:{x:50,y:9}, p1:true }
  ];
  D.zone = function(id){ var i; for(i=0;i<D.ZONES.length;i++){ if(D.ZONES[i].id===id) return D.ZONES[i]; } return null; };

  /* 場景資料(P1:beach / forest)。mask 32×24;spawn 為當日隨機重生;poi 為固定互動點(不重生)。 */
  D.SCENE = {};
  D.SCENE.beach = {
    bg:'zone_beach', bgColor:'#e9d8a6', waterColor:'#4aa3df',
    spawn0:{x:6,y:8},          /* 進場出生格 */
    exit:{x:31,y:8},           /* 右緣出口箭頭 → 大島地圖 */
    campGate:{x:2,y:10},       /* 左緣「回營地」入口 */
    mask:[   /* ★ v1.152.0 依場景實圖逐格重建:以「比周圍暗多少」判定立體物(樹冠/岩壁/建物)、藍色判定水域、火山另判岩漿;再去雜點 → BFS 連通驗證 → 不可達的可走格一律封起來。 */
      '################################',
      '###......##~#####~##.###~##~####',
      '##..........................####',
      '#....###......................##',
      '##...###......................~#',
      '##............................##',
      '##.............................#',
      '##.............................#',
      '##.....................##.......',
      '#.......##............###.....##',
      '#.......##............###.....##',
      '##............................##',
      '##............................##',
      '##............................##',
      '#..............................#',
      '#..............................#',
      '#.......................~......#',
      '#~~~~..~~~~~~~~~~~.~~...~....~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '###~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '######~~~~~~~~~~~~~~~~~~~~~#~~##',
      '#####~~~~~~~~~~~~~~~~~~~~~~#####',
      '################################'
    ],
    /* 每日隨機資源點(25.2) */
    spawn:{
      palm:  { n:4, minGap:2, act:'gather', node:'node_palm', e:'🌴', gives:'fiber', bonus:'leaf', label:'林投樹',   /* ★ v1.22.0 bonus:採集成功另附 +1(林投葉=大葉;大葉原本全島無來源) */
               pool:[{x:3,y:3},{x:10,y:2},{x:16,y:3},{x:22,y:2},{x:28,y:3},{x:4,y:12},{x:13,y:11},{x:26,y:12}] },
      bush:  { n:3, minGap:2, act:'gather', node:'node_bush', e:'🌳', gives:'berry', label:'構樹果叢',
               pool:[{x:8,y:5},{x:19,y:6},{x:25,y:8},{x:6,y:14},{x:17,y:14},{x:29,y:6}] },
      /* ★ v1.20.0 老師:遊戲初期拿不到木材/石頭(營火要木 5 石 3,森林又要營火才開)→ 沙灘岸邊每天有漂流木與礁岩碎石可採(重力道 QTE) */
      drift: { n:2, minGap:2, act:'gather', node:'node_drift', e:'🪵', gives:'wood', label:'漂流木',
               pool:[{x:5,y:13},{x:12,y:13},{x:20,y:13},{x:27,y:13}] },
      rocks: { n:2, minGap:2, act:'gather', node:'node_beachrock', e:'🪨', gives:'stone', label:'礁岩碎石',
               pool:[{x:12,y:6},{x:22,y:5},{x:15,y:10},{x:26,y:10}] }
    },
    pick:{ n:[4,6], minGap:3, items:['shell','pebble','feather','berry','wood','stone','wood','stone'] },   /* ★ v1.20.0 沙灘上的樹枝(木材)與石頭也可撿 */
    gullSpot:{x:7,y:9}
  };
  D.SCENE.forest = {
    bg:'zone_forest', bgColor:'#7bb661', waterColor:'#4aa3df',
    spawn0:{x:2,y:12}, exit:{x:0,y:12}, campGate:null,
    mask:[   /* ★ v1.152.0 依場景實圖逐格重建:以「比周圍暗多少」判定立體物(樹冠/岩壁/建物)、藍色判定水域、火山另判岩漿;再去雜點 → BFS 連通驗證 → 不可達的可走格一律封起來。 */
      '################################',
      '#.....####################.....#',
      '#.....#########...########.##..#',
      '#...####..........#####....###.#',
      '#..####.............###....###.#',
      '#..###......................####',
      '#.............................##',
      '#.........####.................#',
      '#..##.....#####.........##...#.#',
      '#####......##...........##...#.#',
      '#...................###......#.#',
      '#...................###......###',
      '............###..............###',
      '#.###.......####.............###',
      '#.###.........##.............###',
      '#..#....##............#......###',
      '#.##....##.................#####',
      '#.###..........................#',
      '#..##......##..........###....##',
      '#..##......##......##..###....##',
      '#.......#..........##...###....#',
      '#.........................#....#',
      '#............###....#.....###..#',
      '################################'
    ],
    spawn:{
      tree:  { n:6, minGap:2, act:'chop', node:'node_tree', e:'🌲', gives:'wood', label:'樟樹',
               pool:[{x:6,y:5},{x:9,y:3},{x:14,y:5},{x:19,y:4},{x:26,y:4},{x:6,y:10},{x:16,y:11},{x:22,y:9},{x:28,y:11},{x:8,y:17},{x:15,y:18},{x:21,y:17}] },
      bush:  { n:3, minGap:2, act:'gather', node:'node_bush', e:'🌳', gives:'berry', label:'野果叢',
               pool:[{x:11,y:6},{x:24,y:14},{x:4,y:15},{x:18,y:14},{x:29,y:6},{x:12,y:20}] },
      mush:  { n:2, minGap:2, act:'gather', node:'node_mushroom', e:'🍄', gives:'mushroom', label:'野菇圈', chance:0.85,
               pool:[{x:3,y:7},{x:19,y:8},{x:29,y:17},{x:10,y:14},{x:26,y:19}] },
      /* ★ v1.22.0 通關稽核發現「🍃 大葉」全島沒有任何來源(帳篷 4/水桶架 3/床 3 都要大葉 → 溪流→湖泊→水道→水車→山谷整條鏈卡死)→ 森林每天長月桃葉叢;沙灘林投採集也附帶 +1 大葉(index islActResult bonus) */
      bigleaf:{ n:3, minGap:2, act:'gather', node:'node_bigleaf', e:'🍃', gives:'leaf', label:'月桃葉叢',
               pool:[{x:17,y:5},{x:26,y:7},{x:9,y:10},{x:25,y:10},{x:13,y:14},{x:18,y:17},{x:7,y:20},{x:22,y:20}] }
    },
    pick:{ n:[3,5], minGap:3, items:['feather','pebble','berry','seed','leaf'] },
    puzzle:{x:12,y:10, n:'年輪樹樁', e:'🪵'}   /* 解謎點(P3 才實作互動,P1 只顯示) */
  };
  /* ★ P2-a(v1.91.0):溪流／岩岸／草原三區。act 'fish'=捕魚、'trash'=打撈海廢、'quarry'=採石(沿用伐木 QTE 引擎) */
  D.SCENE.river = {
    bg:'zone_river', bgColor:'#8fbf6a', waterColor:'#3f8fd4',
    spawn0:{x:2,y:5}, exit:{x:0,y:5}, campGate:null,
    mask:[   /* ★ v1.152.0 依場景實圖逐格重建:以「比周圍暗多少」判定立體物(樹冠/岩壁/建物)、藍色判定水域、火山另判岩漿;再去雜點 → BFS 連通驗證 → 不可達的可走格一律封起來。 */
      '################################',
      '##...........#~~####.###....####',
      '#.....##...##~~~##...###....####',
      '#..#######.##~~~~#...##.....##.#',
      '#..##..###....~~##.............#',
      '...##.........~~##.........#...#',
      '#............#~~~#.....##..#####',
      '#.....####...#~~~#.....###..####',
      '###...####...##~~##....~~##....#',
      '####........###~~~#.....~~#....#',
      '####........##~~~~#...~..~~~####',
      '#..######......~~~#....~~#~~~~~#',
      '#...#####........~~~~....~~#~~~#',
      '###...........##...~..##.......#',
      '####.................###......##',
      '#........###.........###......##',
      '#........###...................#',
      '#.........###...........###....#',
      '#.........####..........########',
      '###.......####.##.......########',
      '###.........#####....#...#######',
      '####..###....####....#....######',
      '#####.#####...###....#.....#####',
      '################################'
    ],
    spawn:{
      fish:  { n:3, minGap:3, act:'fish', node:'node_fish', e:'🐟', gives:'fish', label:'石𩼣魚群',
               pool:[{x:12,y:1},{x:13,y:4},{x:12,y:7},{x:14,y:11},{x:22,y:7},{x:26,y:7},{x:23,y:12},{x:28,y:13}] },   /* ★ v1.29.0 原本 8 個裡有 7 個座標落在水域 '~'(v1.115.0 依場景圖重建遮罩後沒重跑稽核),小人走不到 ⇒ 全部移到緊鄰水邊的可走岸格 */
      reed:  { n:3, minGap:2, act:'gather', node:'node_reed', e:'🎋', gives:'reed', label:'蘆葦叢',
               pool:[{x:18,y:3},{x:14,y:12},{x:5,y:9},{x:27,y:8},{x:13,y:17},{x:22,y:19}] },   /* ★ v1.29.0 第 2、4 個原本在水域 '~' */
      pebble:{ n:2, minGap:2, act:'gather', node:'node_pebble', e:'⚪', gives:'pebble', label:'卵石灘',
               pool:[{x:6,y:4},{x:20,y:6},{x:4,y:18},{x:27,y:17}] }
    },
    pick:{ n:[3,5], minGap:3, items:['pebble','feather','seed','berry'] },
    puzzle:{x:13,y:11, n:'水車座', e:'⚙'}
  };
  D.SCENE.rock = {
    bg:'zone_rock', bgColor:'#9aa0a6', waterColor:'#2f7fc0',
    spawn0:{x:29,y:3}, exit:{x:31,y:4}, campGate:null,
    mask:[   /* ★ v1.152.0 依場景實圖逐格重建:以「比周圍暗多少」判定立體物(樹冠/岩壁/建物)、藍色判定水域、火山另判岩漿;再去雜點 → BFS 連通驗證 → 不可達的可走格一律封起來。 */
      '################################',
      '###~...###.........######~##.###',
      '####..................#####..###',
      '###..........##.........##....##',
      '#............##.................',
      '####...............###.......###',
      '####...............###.......###',
      '###................##.........##',
      '#......#......................##',
      '#......##......................#',
      '##~~~##....~~~.........####....#',
      '#####~~...~~~~#...~#...~~~~#...#',
      '#####~~....~~~#..#~~......~~..##',
      '#~~~~~~~#~..~~~.~#~~~#...~~~####',
      '##~~~~#~~#.#~~~~~~~~~~###~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~#~~~~#',
      '#~~~~~~~~~~~~~~~~~~~##~~####~~~#',
      '#~~~~~#~~~~~~~~~~~~~~~~~~####~~#',
      '#~~~~##~~~~~~~~~~~~~~~#~~~~#~~~#',
      '#~~~~~~~~~~~~#~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~#~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~###~~~~~#',
      '################################'
    ],
    spawn:{
      stone: { n:4, minGap:2, act:'quarry', node:'node_stone', e:'🪨', gives:'stone', label:'石堆',
               pool:[{x:7,y:3},{x:13,y:2},{x:20,y:4},{x:26,y:8},{x:8,y:8},{x:15,y:10},{x:22,y:11},{x:4,y:9}] },
      trash: { n:5, minGap:2, act:'trash', node:'node_trash', e:'🛍', gives:'trash', label:'海廢堆',
               pool:[{x:3,y:9},{x:10,y:14},{x:15,y:13},{x:20,y:11},{x:22,y:13},{x:28,y:12},{x:7,y:12},{x:25,y:12},{x:11,y:13},{x:16,y:12}] },   /* ★ v1.29.0 第 1、7、8 個原本在水域 '~'(岩岸下半是海) */
      shell: { n:2, minGap:3, act:'gather', node:'node_shell', e:'🐚', gives:'shell', label:'貝殼堆',
               pool:[{x:9,y:12},{x:27,y:10},{x:2,y:9},{x:16,y:11}] }
    },
    pick:{ n:[3,5], minGap:3, items:['shell','pebble','feather','trash'] },
    puzzle:{x:20,y:12, n:'潮池', e:'🦀'}
  };
  D.SCENE.grass = {
    bg:'zone_grass', bgColor:'#a9d46a', waterColor:'#4aa3df',
    spawn0:{x:2,y:12}, exit:{x:0,y:12}, campGate:null,
    mask:[   /* ★ v1.152.0 依場景實圖逐格重建:以「比周圍暗多少」判定立體物(樹冠/岩壁/建物)、藍色判定水域、火山另判岩漿;再去雜點 → BFS 連通驗證 → 不可達的可走格一律封起來。 */
      '################################',
      '#.................##...........#',
      '##................##...........#',
      '##.............................#',
      '##.............................#',
      '##.............................#',
      '##.............................#',
      '##.............................#',
      '##...............######........#',
      '##...............######........#',
      '#.................#####........#',
      '#..............................#',
      '...............................#',
      '##.............................#',
      '##.............................#',
      '##...######....................#',
      '#....#######...................#',
      '##....######...................#',
      '##.............................#',
      '##.............................#',
      '#..............................#',
      '#.##...........................#',
      '#######..####.....###..###.....#',
      '################################'
    ],
    spawn:{
      seedgrass: { n:4, minGap:2, act:'gather', node:'node_seedgrass', e:'🌾', gives:'seed', label:'咸豐草叢',
               pool:[{x:5,y:4},{x:12,y:3},{x:20,y:5},{x:27,y:3},{x:8,y:10},{x:15,y:12},{x:24,y:12},{x:10,y:18}] },
      berry: { n:2, minGap:2, act:'gather', node:'node_bush', e:'🌳', gives:'berry', label:'野果叢',
               pool:[{x:17,y:16},{x:26,y:18},{x:4,y:15},{x:22,y:7}] },
      fiber: { n:2, minGap:2, act:'gather', node:'node_fibergrass', e:'🌿', gives:'fiber', label:'月桃叢',
               pool:[{x:29,y:9},{x:7,y:7},{x:14,y:19},{x:19,y:3}] },
      /* ★ P2-b 畜牧:野生動物(act 'tame' 馴養;gives=動物代碼,結算進畜欄而非物品包) */
      chicken:{ n:1, minGap:3, act:'tame', node:'node_chicken', e:'🐔', gives:'chicken', label:'環頸雉', chance:0.8,
               pool:[{x:10,y:5},{x:23,y:14},{x:6,y:19},{x:27,y:6}] },
      goat:   { n:1, minGap:3, act:'tame', node:'node_goat', e:'🐐', gives:'goat', label:'長鬃山羊', chance:0.6,
               pool:[{x:17,y:4},{x:4,y:10},{x:25,y:16},{x:13,y:15}] },
      rabbit: { n:1, minGap:3, act:'tame', node:'node_rabbit', e:'🐇', gives:'rabbit', label:'台灣野兔', chance:0.7,
               pool:[{x:21,y:19},{x:9,y:13},{x:29,y:3},{x:16,y:9}] }
    },
    pick:{ n:[3,5], minGap:3, items:['feather','seed','berry','pebble'] },
    puzzle:{x:16,y:6, n:'風向草', e:'🍃'}
  };
  /* ★ P3-a(v1.3.0):湖泊(中央深水不可走,環湖淺水;釣魚=折射版)、洞窟(黑暗岩壁,需研究火把;鐵礦/水晶/發光蘑菇) */
  D.SCENE.lake = {
    bg:'zone_lake', bgColor:'#8fc27a', waterColor:'#3f8fd4', deepWater:'#1f5fa8',
    spawn0:{x:2,y:12}, exit:{x:0,y:12}, campGate:null,
    mask:[   /* ★ v1.152.0 依場景實圖逐格重建:以「比周圍暗多少」判定立體物(樹冠/岩壁/建物)、藍色判定水域、火山另判岩漿;再去雜點 → BFS 連通驗證 → 不可達的可走格一律封起來。 */
      '################################',
      '#######..###.......###~......~~#',
      '######..###........#######...~~#',
      '#######.###...........####..~~##',
      '#######............~........#~~#',
      '######..........~..~........#~~#',
      '#.##.......~~~~~~~~~~~~.......~#',
      '#.......~~~~~~~~~~~~~~~~~.....##',
      '#......~~~~~~~~~~~~~~~~~~.~....#',
      '#......~~~~~~~~~~~~~~~~~~~~....#',
      '#......~~~~~~~~~~~~~~~~~~~~~...#',
      '#.....~~~~~~~~~~~~~~~~~~~~~~~..#',
      '.......~~~~~~~~~~~~~~~~~~~~~...#',
      '##......~~~~~~~~~~~~~~~~~~~~...#',
      '##.##....~~~~~~~~~~~~~~~~~~.~..#',
      '#..###.......~~~~~~~~~~~~~#....#',
      '#...............~~~~~~~~~......#',
      '#............##..~~~~.........##',
      '#............##.............####',
      '#...#...#....##...~..........###',
      '#......#~........~~~#........~##',
      '#.....###...#.....~~~~#...~.####',
      '#..#..###...~.##..~~~##.##~###~#',
      '################################'
    ],
    spawn:{
      lakefish:{ n:3, minGap:3, act:'fish', node:'node_lakefish', e:'🐠', gives:'fish', label:'苦花魚', refract:true,
               pool:[{x:9,y:6},{x:21,y:5},{x:6,y:12},{x:28,y:12},{x:9,y:18},{x:22,y:18},{x:16,y:4},{x:16,y:19}] },   /* ★ v1.29.0 第 2、7 個原本在水域 '~' */
      lotus:  { n:3, minGap:2, act:'gather', node:'node_lotus', e:'🪷', gives:'seed', label:'台灣萍蓬草',
               pool:[{x:11,y:5},{x:20,y:5},{x:11,y:16},{x:21,y:17},{x:6,y:9},{x:26,y:16}] },   /* ★ v1.29.0 第 4 個原本在水域 '~' */
      reed:   { n:2, minGap:2, act:'gather', node:'node_reed', e:'🎋', gives:'reed', label:'蘆葦叢',
               pool:[{x:4,y:6},{x:27,y:4},{x:3,y:19},{x:28,y:19}] },
      pebble: { n:2, minGap:2, act:'gather', node:'node_pebble', e:'⚪', gives:'pebble', label:'卵石灘',
               pool:[{x:14,y:3},{x:17,y:19},{x:3,y:9},{x:29,y:15}] }   /* ★ v1.29.0 第 2 個原本在水域 '~' */
    },
    pick:{ n:[3,5], minGap:3, items:['pebble','feather','seed','shell'] },
    puzzle:{x:16,y:3, n:'湖心石碑', e:'🪨'}
  };
  D.SCENE.cave = {
    bg:'zone_cave', bgColor:'#3a3f4a', waterColor:'#2f6f9f', wallColor:'#1c1f27',
    spawn0:{x:29,y:20}, exit:{x:31,y:20}, campGate:null,
    mask:[   /* ★ v1.152.0 依場景實圖逐格重建:以「比周圍暗多少」判定立體物(樹冠/岩壁/建物)、藍色判定水域、火山另判岩漿;再去雜點 → BFS 連通驗證 → 不可達的可走格一律封起來。 */
      '################################',
      '#..........##.................##',
      '#..........##.................##',
      '#..........#####.....~..~.....##',
      '#.....##.....###..............##',
      '####..###..........##..........#',
      '####..####...~....#####..####..#',
      '#.....########...######..###...#',
      '#.....########...######........#',
      '#....#########.................#',
      '#...~~#~#####................~.#',
      '##~~~~~~########.......###.....#',
      '#~~~~~~~~~#######..##########..#',
      '#...~~~~~~#######..######...#..#',
      '#...~~~~~~~###.............#####',
      '#.#~~~~~~~###...........########',
      '#.####~~~~####..........######.#',
      '#..###~~.#####............###..#',
      '#...##.........................#',
      '#...................#.~........#',
      '#.........................##....',
      '#.........................###..#',
      '#........#..####..........###..#',
      '################################'
    ],
    spawn:{
      ore:    { n:4, minGap:2, act:'quarry', node:'node_ore', e:'🟫', gives:'ore', label:'鐵礦脈',
               pool:[{x:5,y:4},{x:11,y:6},{x:20,y:3},{x:24,y:5},{x:15,y:9},{x:26,y:11},{x:4,y:9},{x:17,y:15},{x:27,y:18},{x:21,y:19}] },
      crystal:{ n:2, minGap:3, act:'gather', node:'node_crystal', e:'💎', gives:'crystal', label:'水晶簇', chance:0.8,
               pool:[{x:9,y:5},{x:22,y:9},{x:19,y:14},{x:26,y:19},{x:5,y:19}] },
      glow:   { n:2, minGap:2, act:'gather', node:'node_glowshroom', e:'🍄', gives:'mushroom', label:'螢光蕈',
               pool:[{x:13,y:10},{x:16,y:11},{x:25,y:14},{x:5,y:8},{x:21,y:5}] }   /* ★ v1.29.0 第 4 個原本在洞窟水潭 '~' */
    },
    pick:{ n:[3,5], minGap:3, items:['pebble','stone','crystal','ore'] },
    puzzle:{x:8,y:17, n:'迴聲池', e:'🔊'}
  };
  /* ★ P3-b(v1.4.0):懸崖(三層台地、鳥巢/草藥/岩石)、山谷(蜿蜒溪+穀物/蜂巢/野果)、遺跡(石柱廣場+中央石室機關)、火山(中央熔岩湖不可走) */
  D.SCENE.cliff = {
    bg:'zone_cliff', bgColor:'#a08a6a', waterColor:'#3f8fd4', wallColor:'#5b4a3a',
    spawn0:{x:2,y:20}, exit:{x:0,y:20}, campGate:null,
    mask:[   /* ★ v1.152.0 依場景實圖逐格重建:以「比周圍暗多少」判定立體物(樹冠/岩壁/建物)、藍色判定水域、火山另判岩漿;再去雜點 → BFS 連通驗證 → 不可達的可走格一律封起來。 */
      '################################',
      '#~~~~~~##~#####~~##~~#~####~~#~#',
      '#~~~~~~################~###~~~##',
      '#~~~~~~#####################~~~#',
      '#~~~~~~#####################~~~#',
      '#~~~~~#####~##############~#~~~#',
      '#~~~~####.##~#######~##~~###~~~#',
      '#~~~~.###.##~###~###~##~~~~~~~~#',
      '#~~~#...........###~.##...#~~~~#',
      '##~~#......................~~~~#',
      '##~~#####...................~~~#',
      '#~~~########..##..........##~~~#',
      '#~~~~#~~#~#####~#########.#~~~~#',
      '#~~~~~~~~~#~~#~~~##~#~##~...~~~#',
      '##~##~~~~~~~~~~~~~~~~#~~~#..~~~#',
      '##~#######~~~.~~~.~~~~~###..#~~#',
      '#####...###........~...~....#~~#',
      '##..........................#~~#',
      '#..........................##~~#',
      '##.#####.......#########.##~~~~#',
      '...##~#~########~#~~~##~~#~~~#~#',
      '#.....~~~~~~#~#~~~~~~~~~~#~~~~~#',
      '#........~~~~#~~~~~~~~~~~~~~~~~#',
      '################################'
    ],
    spawn:{
      nest:  { n:2, minGap:3, act:'gather', node:'node_nest', e:'🪺', gives:'egg', label:'遊隼巢', pool:[{x:9,y:6},{x:20,y:8},{x:15,y:8},{x:9,y:7}] },
      herb:  { n:3, minGap:2, act:'gather', node:'node_herb', e:'🍀', gives:'herb', label:'崖邊艾草', pool:[{x:6,y:9},{x:20,y:11},{x:26,y:10},{x:12,y:11},{x:14,y:10}] },
      stone: { n:3, minGap:2, act:'quarry', node:'node_stone', e:'🪨', gives:'stone', label:'落石堆', pool:[{x:5,y:18},{x:14,y:19},{x:25,y:18},{x:20,y:18},{x:26,y:18}] },
      feather:{ n:2, minGap:2, act:'gather', node:'node_nest', e:'🪶', gives:'feather', label:'羽毛堆', pool:[{x:23,y:8},{x:11,y:8},{x:18,y:11}] }
    },
    pick:{ n:[3,5], minGap:3, items:['feather','stone','pebble','egg'] },
    puzzle:{x:24,y:10, n:'風之柱', e:'🗼'}
  };
  D.SCENE.valley = {   /* ★ v1.109.0 重畫遮罩:溪水改真的不可走,中間留兩座石橋(x=8/22)過河,入口/出口移到南岸乾地 */
    bg:'zone_valley', bgColor:'#9fcf7a', waterColor:'#3f8fd4',
    spawn0:{x:2,y:20}, exit:{x:0,y:20}, campGate:null,
    mask:[   /* ★ v1.152.0 依場景實圖逐格重建:以「比周圍暗多少」判定立體物(樹冠/岩壁/建物)、藍色判定水域、火山另判岩漿;再去雜點 → BFS 連通驗證 → 不可達的可走格一律封起來。 */
      '################################',
      '#......####.......##...........#',
      '#.....#####...#####...........##',
      '#.......###....###...#........~#',
      '#.......###..........#.......~~#',
      '#...#...#............#.......~~#',
      '#...#.....................###~##',
      '#..##.....................#~~~~#',
      '#..###............##...##..~#~~#',
      '#...###.....#....###...~~~~###~#',
      '#....##..#~~~.~~~~~~~~......####',
      '#....~...~~.....~..........#####',
      '#..........................##~~#',
      '#...........................#~~#',
      '##..............##.............#',
      '##....#.........##.............#',
      '##..###........................#',
      '#...###.....##.................#',
      '#....#......##......#..........#',
      '#....#.##...........#.......##.#',
      '....##.##.......#...###.....##~#',
      '#...##..........#....##..#######',
      '#........###....##.......#######',
      '################################'
    ],
    spawn:{
      grain: { n:3, minGap:2, act:'gather', node:'node_grain', e:'🌾', gives:'grain', label:'野生小米', pool:[{x:7,y:4},{x:22,y:5},{x:14,y:7},{x:26,y:8},{x:6,y:8}] },
      hive:  { n:2, minGap:3, act:'gather', node:'node_hive', e:'🐝', gives:'honey', label:'野蜂巢', chance:0.85, pool:[{x:16,y:4},{x:28,y:3},{x:3,y:5}] },
      berry: { n:3, minGap:2, act:'gather', node:'node_bush', e:'🍓', gives:'berry', label:'野果叢', pool:[{x:8,y:17},{x:20,y:16},{x:26,y:19},{x:12,y:20},{x:4,y:19}] },
      fish:  { n:2, minGap:3, act:'fish', node:'node_fish', e:'🐟', gives:'fish', label:'台灣石𩼣', pool:[{x:6,y:11},{x:20,y:9},{x:26,y:10},{x:12,y:13}] },   /* ★ v1.29.0 第 1、3、4 個原本在溪水 '~' */
      wood:  { n:2, minGap:3, act:'chop', node:'node_tree', e:'🌳', gives:'wood', label:'相思樹', pool:[{x:15,y:15},{x:24,y:15},{x:10,y:15}] }
    },
    pick:{ n:[3,5], minGap:3, items:['seed','berry','feather','grain'] },
    puzzle:{x:16,y:18, n:'磨坊遺址', e:'🎡'}
  };
  D.SCENE.ruins = {
    bg:'zone_ruins', bgColor:'#8f8f86', waterColor:'#3f8fd4', wallColor:'#5a5a52',
    spawn0:{x:16,y:22}, exit:{x:16,y:23}, campGate:null,
    mask:[   /* ★ v1.152.0 依場景實圖逐格重建:以「比周圍暗多少」判定立體物(樹冠/岩壁/建物)、藍色判定水域、火山另判岩漿;再去雜點 → BFS 連通驗證 → 不可達的可走格一律封起來。 */
      '################################',
      '######......####..#######....###',
      '######............###.###....###',
      '#######............#....#......#',
      '###.#####......................#',
      '#............................###',
      '#.......##...#########......####',
      '#.##....##..##########......#..#',
      '#.##........####.#####.........#',
      '#.#.........##......##........##',
      '#...........#.......##.......###',
      '#..##..##...#.......##......####',
      '#.###..##...#.......##......####',
      '###....##..##..................#',
      '#..........######.####.........#',
      '#.###......######.####......##.#',
      '#.###.......####...###......####',
      '#.###.........................##',
      '#.............................##',
      '#....##............##..........#',
      '#....###....#......##..#...###.#',
      '###..###...##..........#...###.#',
      '###...##...#..........##....##.#',
      '################.###############'
    ],
    spawn:{
      relic: { n:3, minGap:3, act:'gather', node:'node_relic', e:'🏺', gives:'relic', label:'陶片與石器', pool:[{x:6,y:5},{x:24,y:5},{x:6,y:17},{x:24,y:17},{x:16,y:5},{x:2,y:11}] },
      stone: { n:3, minGap:2, act:'quarry', node:'node_stone', e:'🪨', gives:'stone', label:'倒塌石柱', pool:[{x:9,y:9},{x:22,y:9},{x:9,y:13},{x:22,y:13},{x:28,y:2}] },
      crystal:{ n:1, minGap:3, act:'gather', node:'node_crystal', e:'💎', gives:'crystal', label:'祭壇水晶', chance:0.7, pool:[{x:16,y:20},{x:3,y:4},{x:29,y:19}] }
    },
    pick:{ n:[3,5], minGap:3, items:['stone','pebble','relic','crystal'] },
    puzzle:{x:16,y:11, n:'遺跡機關', e:'🗿'}
  };
  D.SCENE.volcano = {
    bg:'zone_volcano', bgColor:'#5a4038', waterColor:'#3f8fd4', wallColor:'#e8552a', deepWater:'#ff7a1a',
    spawn0:{x:16,y:22}, exit:{x:16,y:23}, campGate:null,
    mask:[   /* ★ v1.152.0 依場景實圖逐格重建:以「比周圍暗多少」判定立體物(樹冠/岩壁/建物)、藍色判定水域、火山另判岩漿;再去雜點 → BFS 連通驗證 → 不可達的可走格一律封起來。 */
      '################################',
      '################################',
      '################################',
      '################################',
      '#########....###################',
      '#########..#####################',
      '########..######################',
      '#######...######################',
      '#####...#################..#####',
      '#####...#################..#####',
      '#####...################....####',
      '#####...#################...####',
      '####......###############....###',
      '####.......##############...####',
      '######.....#####.####......#####',
      '######.......##............#####',
      '#######....................#####',
      '########..............##########',
      '#########.............##########',
      '###########...........##########',
      '############......##.###########',
      '##############....##############',
      '##############......############',
      '################.###############'
    ],
    spawn:{
      ore:   { n:3, minGap:3, act:'quarry', node:'node_ore', e:'🟫', gives:'ore', label:'火山鐵礦', pool:[{x:7,y:7},{x:26,y:8},{x:6,y:15},{x:26,y:16},{x:16,y:17}] },
      lava:  { n:3, minGap:2, act:'quarry', node:'node_lava_rock', e:'🌑', gives:'stone', label:'火山岩', pool:[{x:10,y:5},{x:25,y:8},{x:10,y:18},{x:21,y:18},{x:4,y:12},{x:28,y:12}] },
      crystal:{ n:2, minGap:3, act:'gather', node:'node_crystal', e:'💎', gives:'crystal', label:'火山水晶', pool:[{x:12,y:4},{x:7,y:16},{x:25,y:16},{x:16,y:20}] }
    },
    pick:{ n:[3,5], minGap:3, items:['stone','ore','crystal','pebble'] },
    puzzle:{x:16,y:16, n:'火山口觀測台', e:'🌋'}
  };

  /* ── 建築(第十二章 12.3;P1:營火／帳篷／倉庫,Lv1~2 可升) ── */
  /* ★ v1.25.0(2026-09-13・老師:所有建造的設施都需要真實等待時間)—— 每棟的施工秒數(真實時間,不是遊戲日)。
     設計原則:初期救命的營火最短(30 秒,學生不會卡住),日常設施 1~2 分,大型與解鎖用設施 3~5 分,最終目標帆船 10 分;
     升級 = 新建時間 × 0.6 × 目前等級(越高級蓋越久)。index.html 的 islBuildSecs 讀這張表,查不到就退回 DEFAULT。 */
  D.BUILD_SECS = { campfire:30, tent:90, storage:120, bucket:90, raft:150, wall:60, torch:90, farm:120, pen:150, bench:180, tower:240, canal:180, ship:600 };
  D.BUILD_SECS_DEFAULT = 90;
  D.BUILDINGS = {
    campfire: { n:'營火', e:'🔥', img:'bld_campfire', cost:{wood:5, stone:3, fiber:2},
                desc:'夜晚有光;蓋好後解鎖森林。', lvText:['夜晚有光','光圈 +20%','營火血 +1、可烹飪火候更寬','夜襲機率 −10%','營火血 +2、料理必 ★★ 以上'],
                parts:[ { k:'base', n:'底座', need:'stone', hint:'要能耐高溫、不會燒起來', e:'🪨' },
                        { k:'fuel', n:'燃料', need:'wood',  hint:'要是可燃物',           e:'🪵' },
                        { k:'tinder', n:'火種', need:'fiber', hint:'乾燥、細碎、最容易點燃', e:'🌿' } ] },
    tent:     { n:'帳篷', e:'⛺', img:'bld_tent', cost:{wood:10, fiber:8, leaf:4},
                desc:'休息與存檔的地方;Lv3 起明日 AP +1。', lvText:['存檔點','舒適 +2','明日 AP +1、舒適 +4','舒適 +6','明日 AP +2、舒適 +8'],
                parts:[ { k:'roof', n:'屋頂', need:'leaf',  hint:'要防水,雨水才不會滴進來', e:'🍃' },
                        { k:'pole', n:'支柱', need:'wood',  hint:'要夠硬,撐得住屋頂',     e:'🪵' },
                        { k:'bed',  n:'床墊', need:'fiber', hint:'要柔軟,躺起來才舒服',    e:'🌿' } ] },
    storage:  { n:'倉庫', e:'🏚', img:'bld_storage', cost:{wood:15, stone:5},
                desc:'每種資源上限 99;升級可放更多。', lvText:['每種 99','每種 199','每種 399','每種 699','每種 999'],
                parts:[ { k:'wall', n:'牆壁', need:'wood',  hint:'木板一片片排好', e:'🪵' },
                        { k:'floor', n:'地基', need:'stone', hint:'要重、要穩,不怕被風吹走', e:'🪨' } ] },
    /* ★ P2-a 新增四棟 */
    bucket:   { n:'水桶架', e:'🪣', img:'bld_bucket', cost:{wood:8, fiber:4, leaf:3},
                desc:'每天供應淡水;蓋好後解鎖溪流。', lvText:['淡水 5/日','淡水 8/日','淡水 11/日','淡水 14/日','淡水 17/日'],
                parts:[ { k:'frame', n:'支架', need:'wood', hint:'要硬,撐得住裝滿水的桶子', e:'🪵' },
                        { k:'body', n:'桶身', need:'leaf', hint:'要防水,水才不會漏光', e:'🍃' },
                        { k:'rope', n:'綁繩', need:'fiber', hint:'要韌,綁緊不鬆脫', e:'🌿' } ] },
    raft:     { n:'木筏', e:'🛶', img:'bld_raft', cost:{wood:20, fiber:10},
                desc:'能划到岩岸;蓋好後解鎖岩岸與打撈海廢。', lvText:['可到岩岸','更穩(海廢 +1)','海廢 +1','海廢 +2','海廢 +2、魚 +1'],
                parts:[ { k:'float', n:'浮筒', need:'wood', hint:'密度比水小才浮得起來', e:'🪵' },
                        { k:'tie', n:'綁繩', need:'fiber', hint:'把木頭一根根綁緊', e:'🌿' } ] },
    wall:     { n:'圍牆', e:'🧱', img:'bld_wall', cost:{stone:8, wood:4},
                desc:'夜襲時魔物變慢 20%。', lvText:['減速 20%','減速 30%','減速 40%','減速 50%','減速 60%'],
                parts:[ { k:'stack', n:'石牆', need:'stone', hint:'石頭交錯疊放才不會倒', e:'🪨' },
                        { k:'post', n:'木樁', need:'wood', hint:'插進土裡固定牆面', e:'🪵' } ] },
    torch:    { n:'火把', e:'🕯', img:'bld_torch', cost:{wood:3, fiber:2},
                desc:'光圈變大,影魔怕光不敢靠近(夜襲影魔減半)。', lvText:['光圈 1 格','光圈 1.5 格','影魔 −50%','影魔、夜蝠 −50%','夜襲少 1 隻/波'],
                parts:[ { k:'stick', n:'火把桿', need:'wood', hint:'一根直的木頭', e:'🪵' },
                        { k:'head', n:'火頭', need:'fiber', hint:'纖維纏繞,容易點燃', e:'🌿' } ] },
    /* ★ P2-b 新增三棟:農田(種植)、畜欄(畜牧)、水道(水利;建造改走 Grid 拼圖引擎 act:'canal',需溪流已解鎖) */
    farm:     { n:'農田', e:'🌱', img:'bld_farm', cost:{wood:6, stone:4, fiber:4},
                desc:'開墾田地種野果、穀物;每天要澆水(有水道自動澆)。', lvText:['2 塊田','3 塊田','4 塊田','5 塊田','6 塊田、收成 +1'],
                parts:[ { k:'soil', n:'翻土', need:'stone', hint:'先把石頭搬開,土才鬆', e:'🪨' },
                        { k:'fence', n:'田埂', need:'wood', hint:'圍起來,水才留得住', e:'🪵' },
                        { k:'mulch', n:'覆蓋', need:'fiber', hint:'蓋一層乾草,土不會太快乾', e:'🌿' } ] },
    pen:      { n:'畜欄', e:'🐔', img:'bld_pen', cost:{wood:12, fiber:6},
                desc:'關養馴服的動物;每天餵食就會生產蛋、奶、毛。', lvText:['養 2 隻','養 3 隻','養 4 隻','養 5 隻','養 6 隻、產量 +1'],
                parts:[ { k:'post', n:'欄杆', need:'wood', hint:'要夠高,動物才跳不出去', e:'🪵' },
                        { k:'nest', n:'窩', need:'fiber', hint:'柔軟保暖,動物才肯生蛋', e:'🌿' } ] },
    /* ★ P3-b 製作台:做工具(見 D.TOOLS);側欄「🛠 製作」 */
    bench:    { n:'製作台', e:'🛠', img:'bld_bench', cost:{wood:10, stone:6, fiber:4},
                desc:'做鐵斧、鐵鎬、好釣竿、藤籃;工具讓活動產量更多。', lvText:['可製作基本工具','製作品質 +1 ★','製作材料 −20%','工具耐用(暫無效果)','工具效果 +1'],
                parts:[ { k:'top', n:'台面', need:'wood', hint:'平整的厚木板', e:'🪵' },
                        { k:'anvil', n:'砧座', need:'stone', hint:'又重又硬,敲打不會晃', e:'🪨' },
                        { k:'strap', n:'固定帶', need:'fiber', hint:'綁住零件不會滑', e:'🌿' } ] },
    /* ★ v1.11.0 甲:瞭望台 — 休息前預告今晚夜襲(Lv1 有無、Lv2 種類與波數、Lv3 夜襲 −5%、Lv4 −10%、Lv5 第一波少 1 隻) */
    tower:    { n:'瞭望台', e:'🗼', img:'bld_tower', cost:{wood:14, stone:8, fiber:4},
                desc:'睡前先看看今晚有沒有魔物要來、來的是誰,好先準備工具。', lvText:['預告今晚有無夜襲','預告魔物種類與波數','夜襲機率 −5%','夜襲機率 −10%','第一波少 1 隻'],
                parts:[ { k:'leg', n:'高腳架', need:'wood', hint:'要高,才看得遠(視線不被擋住)', e:'🪵' },
                        { k:'base', n:'基座', need:'stone', hint:'又重又穩,風吹不倒', e:'🪨' },
                        { k:'ladder', n:'繩梯', need:'fiber', hint:'要韌,爬上去才安全', e:'🌿' } ] },
    /* ★ v1.12.0 最終目標:帆船 — 蓋好即達成離島條件並播放結局(K 甲:之後仍可留在島上家園模式);不可升級、需火山已解鎖+科技點 30 */
    ship:     { n:'帆船', e:'⛵', img:'bld_ship', cost:{wood:80, reed:30, fiber:40, ore:6, crystal:2}, tech:30, needZone:'volcano', noUpgrade:true, final:true,
                desc:'最終目標!造出能出海的帆船,就具備離開荒島的條件(也可以留下來繼續生活)。',
                lvText:['可以出海了'],
                parts:[ { k:'hull', n:'船身', need:'wood', hint:'密度比水小、又要夠硬,才浮得起來又撐得住', e:'🪵' },
                        { k:'sail', n:'船帆', need:'reed', hint:'編得密、又輕,才能兜住風', e:'🌾' },
                        { k:'rope', n:'帆索', need:'fiber', hint:'要韌,拉緊了帆才轉得動', e:'🌿' },
                        { k:'keel', n:'龍骨配重', need:'ore', hint:'又重又硬,放在船底才不會翻', e:'🟫' } ] },
    canal:    { n:'水道', e:'💧', img:'bld_canal', cost:{stone:10, reed:6, wood:4}, act:'canal', needZone:'river',
                desc:'把溪水引到營地:農田自動澆水、淡水 +3/日。(建造 = 水道拼圖)', lvText:['自動澆水、淡水 +3/日','淡水 +5/日','淡水 +7/日','淡水 +9/日','淡水 +12/日、作物快 1 天'],
                parts:[] }
  };
  D.BUILD_ORDER = ['campfire','tent','storage','bucket','raft','wall','torch','tower','farm','pen','canal','bench','ship'];   /* ★ v1.11.0 +tower;★ v1.12.0 +ship(最終目標) */
  D.BLD_MAX_LV = 5;
  D.BLD_MAX_LV_P1 = 5;   /* 舊名相容(P2-b 起全建築可升到 Lv5) */
  /* 營地 Lv1~3 擴建(第十二章):格數 9→12→16;cost 由「🏕 擴建」鈕消耗(tech=科技點) */
  D.CAMP_LV = {
    1:{grid:3, cols:3, rows:3, n:9,  ap:5, fireHp:3},
    2:{grid:4, cols:4, rows:3, n:12, ap:5, fireHp:4, cost:{wood:30, stone:15, fiber:10}},
    3:{grid:4, cols:4, rows:4, n:16, ap:5, fireHp:5, cost:{wood:60, stone:40, fiber:20}, tech:10}
  };
  D.CAMP_MAX_LV = 3;

  /* ── ★ P2-b 裝飾(第十五/二十二章):舒適度=各裝飾 comfort 總和 + 帳篷加成;可在營地自由拖曳擺放 ── */
  D.DECOS = [
    { id:'pot',    n:'盆栽',     e:'🪴', img:'deco_pot', comfort:2, cost:{fiber:2, seed:1},           d:'植物會行光合作用,還能讓人心情好。' },
    { id:'fence',  n:'小柵欄',   e:'🚧', img:'deco_fence', comfort:2, cost:{wood:3},                    d:'把營地圍出邊界。' },
    { id:'lamp',   n:'路燈',     e:'🏮', img:'deco_lamp', comfort:3, cost:{wood:2, fiber:1, shell:1},  d:'夜裡的一點光,像家。' },
    { id:'rug',    n:'地毯',     e:'🧶', img:'deco_rug', comfort:3, cost:{fiber:6},                   d:'纖維編織,踩起來不硌腳。' },
    { id:'chime',  n:'貝殼風鈴', e:'🐚', img:'deco_chime', comfort:3, cost:{shell:5, fiber:1},          d:'風吹過就叮叮響——聲音是振動傳來的。' },
    { id:'flower', n:'花圃',     e:'🌸', img:'deco_flower', comfort:3, cost:{seed:3, water:1},           d:'花吸引蜜蜂蝴蝶來傳粉。' },
    { id:'table',  n:'桌椅',     e:'🪑', img:'deco_table', comfort:4, cost:{wood:8},                    d:'終於可以好好坐著吃飯。' },
    { id:'bed',    n:'床',       e:'🛏', img:'deco_bed', comfort:5, cost:{wood:6, fiber:6, leaf:3},   d:'睡得好,明天才有力氣。' },
    { id:'statue', n:'貝殼雕像', e:'🗿', img:'deco_statue', comfort:5, cost:{stone:12, shell:8},         d:'島上的紀念碑。' }
  ];
  D.COMFORT_TIERS = [ { at:10, t:'睡覺多回 10 體力' }, { at:20, t:'明日 AP +1' }, { at:35, t:'夜襲機率 −10%' }, { at:50, t:'睡覺體力全滿' } ];

  /* ── 活動定義(第四章＋第十六章):knowledge(知識操作)＋quality(品質小遊戲) ── */
  D.ACTS = {
    gather: { n:'採集', e:'🌿', skill:'gather', stat:'dex', ap:1, sec:30, bgm:'bgm-play',
              qualityName:'輕輕摘', qualityHint:'長按拉扯,在果實掉下前的黃區放手!太用力果實會壓爛。' },
    chop:   { n:'伐木',     e:'🪓', skill:'chop',   stat:'pow', ap:2, sec:30, bgm:'bgm-play',
              qualityName:'連續三斧', qualityHint:'斧頭來回擺,在綠色甜蜜點時點下!三次綠區越來越窄。' },
    fire:   { n:'生火',     e:'🔥', skill:'fire',   stat:'wit', ap:1, sec:40, bgm:'bgm-play',
              qualityName:'吹氣', qualityHint:'火苗變小就點「吹」,吹太多會熄、太少會滅,維持在綠區 5 秒!' },
    build:  { n:'建造',     e:'🔨', skill:'build',  stat:'dex', ap:2, sec:40, bgm:'bgm-play',
              qualityName:'敲釘子', qualityHint:'釘子會依序閃,照順序快點敲完!' },
    /* ★ P2-a */
    fish:   { n:'捕魚',     e:'🎣', skill:'fish',   stat:'mov', ap:1, sec:30, bgm:'bgm-play',
              qualityName:'拉竿', qualityHint:'魚上鉤了!按住往左右拖,把張力指針維持在中間 3 秒。' },
    trash:  { n:'打撈海廢', e:'♻', skill:'trash',  stat:'dex', ap:1, sec:35, bgm:'bgm-play',
              qualityName:'快分', qualityHint:'最後幾樣會漂得更快,全部分對就是 ★★★!' },
    quarry: { n:'採石',     e:'⛏', skill:'quarry', stat:'pow', ap:2, sec:30, bgm:'bgm-play',
              qualityName:'三鎬', qualityHint:'鎬子擺到綠色甜蜜點時敲下!三次綠區越來越窄。' }
  };
  D.SKILLS.fish   = { n:'捕魚', e:'🎣', stat:'mov', lv3:'浮標下沉窗口變長', lv5:'魚影提示', lv7:'折射位置畫虛線' };
  D.SKILLS.trash  = { n:'打撈', e:'♻', stat:'dex', lv3:'生物自動閃綠',     lv5:'漂流變慢',   lv7:'海廢產量 +1' };
  D.SKILLS.quarry = { n:'採石', e:'⛏', stat:'pow', lv3:'岩石種類自動顯示', lv5:'甜蜜點更寬', lv7:'採石必多 1 石' };
  D.SKILLS.defense= { n:'防衛', e:'⚔', stat:'wit', lv3:'魔物弱點提示',     lv5:'瞭望提前 1 秒', lv7:'營火多 1 血' };

  /* ══════════════ ★ P2-b(v1.2.0):烹飪／種植／畜牧／水利 ══════════════ */
  D.ACTS.cook  = { n:'烹飪',   e:'🍳', skill:'cook',  stat:'wit', ap:1, sec:35, bgm:'bgm-play',
                   qualityName:'翻面', qualityHint:'鍋子熱了!在綠色甜蜜點時翻面 3 次,太用力油會噴出來。' };
  D.ACTS.plant = { n:'播種',   e:'🌱', skill:'farm',  stat:'dex', ap:1, sec:30, bgm:'bgm-play',
                   qualityName:'埋種子', qualityHint:'長按把種子壓進土裡,在黃區放手:太淺會被鳥吃掉,太深發不了芽。' };
  D.ACTS.tame  = { n:'馴養',   e:'🐾', skill:'ranch', stat:'mov', ap:2, sec:30, bgm:'bgm-play',
                   qualityName:'慢慢靠近', qualityHint:'長按慢慢靠近,在黃區放手伸手摸牠;太快會把牠嚇跑!' };
  D.ACTS.canal = { n:'鋪水道', e:'💧', skill:'water', stat:'wit', ap:2, sec:75, bgm:'bgm-play',
                   qualityName:'放水', qualityHint:'水道接通後放水!剩越多時間,水流越順,品質越高。' };
  D.SKILLS.cook  = { n:'烹飪', e:'🍳', stat:'wit', lv3:'火力提示',       lv5:'翻面甜蜜點更寬', lv7:'料理效果 +20%' };
  D.SKILLS.farm  = { n:'種植', e:'🌱', stat:'dex', lv3:'生長需求提示',   lv5:'收成 +1',        lv7:'作物快 1 天成熟' };
  D.SKILLS.ranch = { n:'畜牧', e:'🐾', stat:'mov', lv3:'分類提示',       lv5:'靠近黃區更寬',   lv7:'畜欄產量 +1' };
  D.SKILLS.water = { n:'水利', e:'💧', stat:'wit', lv3:'水道拼圖多 15 秒', lv5:'起點終點連線提示', lv7:'水道淡水 +2/日' };

  /* 烹飪:食譜(need=食材;heat=正確火力:low 小火慢煮/mid 中火/high 大火快烤;dish=產出料理) */
  D.HEAT_SLOTS = [ {k:'low', n:'小火慢煮', e:'🕯', d:'湯、醬:小火慢慢煮,不燒焦'}, {k:'mid', n:'中火', e:'🔥', d:'煎、烤:均勻受熱'}, {k:'high', n:'大火快炒', e:'🌋', d:'快炒:高溫短時間'} ];
  D.RECIPES = [
    { id:'d_fish',    n:'烤魚',     e:'🐟', need:{fish:1},                    heat:'mid',  why:'中火烤,魚肉才會由外到內慢慢熟——熱是從表面「傳導」進去的。' },
    { id:'d_jam',     n:'野果醬',   e:'🍯', need:{berry:3},                   heat:'low',  why:'小火慢煮讓水分慢慢蒸發,果醬變濃稠又不燒焦。' },
    { id:'d_soup',    n:'野菇湯',   e:'🍲', need:{mushroom:2, water:1},       heat:'low',  why:'湯要小火慢煮,水的沸點是 100°C,大火只會把水燒乾。' },
    { id:'d_stew',    n:'鮮魚菇湯', e:'🥘', need:{fish:1, mushroom:1, water:1}, heat:'low', why:'燉煮用小火,肉和菇的味道才會慢慢跑進湯裡(溶解)。' },
    { id:'d_egg',     n:'煎蛋',     e:'🍳', need:{egg:1},                     heat:'mid',  why:'蛋白遇熱會凝固(變性),中火最剛好。' },
    { id:'d_bread',   n:'小米餅',   e:'🥞', need:{grain:2, water:1},          heat:'mid',  why:'穀物磨碎加水揉成餅,中火烤到金黃——澱粉受熱會變香。' },
    { id:'d_pudding', n:'羊奶布丁', e:'🍮', need:{milk:1, egg:1},             heat:'low',  why:'奶和蛋要用小火慢慢加熱,溫度太高會結塊。' }
  ];

  /* 種植:作物(seed 種下 → days 天成熟;每天要澆水或有水道;n=基礎收成) */
  D.CROPS = {
    berry: { n:'野果', e:'🍓', gives:'berry', days:3, n:3, stages:['🌱','🌿','🌳'] },
    grain: { n:'小米', e:'🌾', gives:'grain', days:4, n:3, stages:['🌱','🌿','🌾'] }
  };
  D.PLANT_BINS = [ {k:'need', n:'植物需要', e:'✅'}, {k:'no', n:'不需要', e:'❌'} ];
  D.PLANT_NEEDS = [
    { n:'陽光', e:'☀', how:'need', why:'葉子用陽光行光合作用製造養分' },
    { n:'水',   e:'💧', how:'need', why:'根吸水,運到全身' },
    { n:'空氣', e:'💨', how:'need', why:'光合作用要吸二氧化碳' },
    { n:'土壤', e:'🟫', how:'need', why:'土裡有礦物質養分,也讓根抓穩' },
    { n:'適當溫度', e:'🌡', how:'need', why:'太冷太熱種子都不發芽' },
    { n:'糖果', e:'🍬', how:'no',   why:'植物自己會做糖(光合作用),不用餵' },
    { n:'音樂', e:'🎵', how:'no',   why:'好聽,但植物沒有耳朵' },
    { n:'衣服', e:'👕', how:'no',   why:'植物不怕冷到要穿衣服,靠的是適合的溫度' },
    { n:'肉',   e:'🍖', how:'no',   why:'植物是生產者,不吃東西' }
  ];

  /* 畜牧:動物(cls 分類標籤;food=每日餵食物品;make=每日產物;n=數量) */
  D.ANIMALS = {   /* ★ v1.8.0 修 bug:產量欄 n 與名字欄 n 撞名(名字被蓋成數字),產量改為 out */
    chicken: { n:'環頸雉', e:'🐔', cls:['bird','egg'],      food:'seed',  make:'egg',   out:1, d:'鳥類:有羽毛、卵生,兩隻腳。' },
    goat:    { n:'長鬃山羊', e:'🐐', cls:['mammal','milk'], food:'fiber', make:'milk',  out:1, d:'哺乳類:有毛、胎生、喝奶長大。' },
    rabbit:  { n:'台灣野兔', e:'🐇', cls:['mammal'],        food:'berry', make:'fiber', out:2, d:'哺乳類:兔毛可以搓成纖維。' }
  };
  D.ANIMAL_CARDS = [
    { k:'chicken', n:'環頸雉', e:'🐔', cls:['bird','egg','feather','two'] },
    { k:'goat',    n:'長鬃山羊', e:'🐐', cls:['mammal','fur','four'] },
    { k:'rabbit',  n:'台灣野兔', e:'🐇', cls:['mammal','fur','four'] },
    { k:'gull',    n:'海鷗', e:'🕊', cls:['bird','egg','feather','two'] },
    { k:'frog',    n:'青蛙', e:'🐸', cls:['amph','egg','four'] },
    { k:'fish',    n:'魚',   e:'🐟', cls:['fish','egg','scale'] },
    { k:'snake',   n:'蛇',   e:'🐍', cls:['reptile','egg','scale'] },
    { k:'turtle',  n:'海龜', e:'🐢', cls:['reptile','egg','scale','four'] },
    { k:'butterfly', n:'蝴蝶', e:'🦋', cls:['insect','egg','six'] }
  ];
  D.TAME_TASKS = [
    { q:'哪些是「鳥類」?', tag:'bird',   why:'鳥類有羽毛、有喙、卵生,大多會飛。' },
    { q:'哪些是「哺乳類」?', tag:'mammal', why:'哺乳類有毛、胎生、用奶餵小寶寶。' },
    { q:'哪些動物是「卵生」(生蛋)?', tag:'egg', why:'鳥、魚、青蛙、爬蟲、昆蟲都生蛋;哺乳類直接生小寶寶。' },
    { q:'哪些動物身上有「鱗片」?', tag:'scale', why:'魚和爬蟲類身體外面有鱗片保護。' },
    { q:'哪些動物有「四隻腳」?', tag:'four', why:'哺乳類、爬蟲類、兩生類大多四隻腳;鳥兩隻,昆蟲六隻。' }
  ];

  /* 水利:水道拼圖(Grid 引擎首用):5×5,起點左上(溪流,高處)終點右下(農田,低處);管件 s=直管 c=彎管 */
  D.CANAL = { size:5, sec:75 };

  /* ══════════════ ★ P3-b(v1.4.0):製作台工具 ══════════════ */
  /* 工具(第十四章):cost=材料;parts=藍圖部位(Drag 引擎同建造);eff={act:+n} 產量加成;需製作台 */
  D.TOOLS = [
    { id:'basket',   n:'藤籃',   e:'🧺', cost:{fiber:8, reed:4},          eff:{gather:1}, d:'採集一次多裝一些。', parts:[ {k:'body', n:'籃身', need:'reed', hint:'蘆葦編織又輕又韌', e:'🎋'}, {k:'handle', n:'提把', need:'fiber', hint:'纖維搓成繩,才提得動', e:'🌿'} ] },
    { id:'ironaxe',  n:'鐵斧',   e:'🪓', cost:{ore:3, wood:3, fiber:2},   eff:{chop:2},   d:'鐵比石頭硬,伐木一次多 2 木。', parts:[ {k:'head', n:'斧頭', need:'ore', hint:'鐵硬又耐磨,能砍進木頭', e:'🟫'}, {k:'shaft', n:'斧柄', need:'wood', hint:'木頭有彈性、不導熱,握著舒服', e:'🪵'}, {k:'bind', n:'綁繩', need:'fiber', hint:'把斧頭綁牢在柄上', e:'🌿'} ] },
    { id:'ironpick', n:'鐵鎬',   e:'⛏', cost:{ore:3, wood:3, fiber:2},   eff:{quarry:2}, d:'尖尖的鐵頭敲碎岩石,採石多 2。', parts:[ {k:'head', n:'鎬頭', need:'ore', hint:'尖端受力面積小,壓力大,才敲得碎石頭', e:'🟫'}, {k:'shaft', n:'鎬柄', need:'wood', hint:'長柄=長槓桿,更省力', e:'🪵'}, {k:'bind', n:'綁繩', need:'fiber', hint:'綁緊不飛出去', e:'🌿'} ] },
    { id:'rod',      n:'好釣竿', e:'🎣', cost:{wood:4, fiber:6, shell:2}, eff:{fish:1},   d:'有彈性的竿子和結實的線,捕魚多 1 條。', parts:[ {k:'pole', n:'竿身', need:'wood', hint:'要有彈性,魚拉才不會斷', e:'🪵'}, {k:'line', n:'釣線', need:'fiber', hint:'細又韌', e:'🌿'}, {k:'hook', n:'魚鉤', need:'shell', hint:'貝殼磨尖當鉤', e:'🐚'} ] }
  ];
  D.tool = function(id){ var i; for(i=0;i<D.TOOLS.length;i++){ if(D.TOOLS[i].id===id) return D.TOOLS[i]; } return null; };
  D.ACTS.craft = { n:'製作工具', e:'🛠', skill:'craft', stat:'dex', ap:2, sec:40, bgm:'bgm-play',
                   qualityName:'敲打組裝', qualityHint:'零件依序閃,照順序敲!敲對越多工具越牢。' };
  D.SKILLS.craft = { n:'製作', e:'🛠', stat:'dex', lv3:'藍圖部位有提示', lv5:'組裝節奏放慢', lv7:'製作材料 −20%' };
  D.QUIZ = D.QUIZ || {};
  D.QUIZ.craft = [
    { q:'鐵斧比石斧好用,主要因為鐵?', o:['更硬更耐磨','其實鐵斧拿起來比石斧還輕','鐵斧本身會微微發出亮光','鐵斧做好之後完全不需要磨'], a:0, why:'鐵的硬度和韌性都比石頭好,刀口不容易崩掉。' },
    { q:'工具的握柄多用木頭,是因為木頭?', o:['不導熱、有彈性、輕','是所有材料裡摸起來最堅硬的','木頭碰到電流會直接把電導走','木頭一旦發熱就會馬上燙傷人'], a:0, why:'木頭是熱的不良導體、有彈性,握起來不燙也不震手。' },
    { q:'鎬子的頭要做得尖,是為了?', o:['受力面積小,壓力大','做得尖尖的,看起來比較威風好看','做得尖尖的,可以讓鎬頭變得比較輕','做得尖尖的,能讓木柄可以做得更長'], a:0, why:'同樣的力,面積越小壓力越大,越容易敲碎石頭。' },
    { q:'柄越長的鎚子越省力,是利用?', o:['槓桿原理','是利用了水裡的浮力','是利用了磁鐵的磁力','是利用了表面的摩擦力'], a:0, why:'長柄=施力臂長,同樣的力產生更大的力矩。' },
    { q:'鐵放久了會生鏽,是因為鐵和什麼作用?', o:['空氣中的氧和水','鐵放在木頭旁邊,兩者發生反應','鐵放在石頭旁邊,兩者發生反應','鐵長時間曬到太陽光,產生反應'], a:0, why:'鐵+氧+水 → 氧化鐵(鏽),乾燥或上油可以防鏽。' },
    { q:'釣線要用什麼材料?', o:['細但韌、不易斷','要挑又粗又硬的那種材質','要挑很脆、容易斷裂的材質','材質會吸水,拉起來變重的那種'], a:0, why:'韌性好的細線魚看不見又不會被拉斷。' },
    { q:'把鐵礦變成鐵,需要?', o:['高溫加熱(冶煉)','把鐵礦拿去泡在水裡就可以了','把鐵礦放在太陽底下曬乾就好','用力拿石頭把鐵礦敲碎就完成'], a:0, why:'高溫下用木炭把鐵礦裡的氧奪走,留下鐵。' },
    { q:'磨刀石讓斧頭變利,是靠?', o:['摩擦磨掉多餘的金屬','把斧頭放在火上加熱後變得鋒利','磨刀石本身帶有磁力吸住鐵屑','把斧頭泡在水裡讓刀刃變銳利'], a:0, why:'硬的磨石磨掉刀口的金屬,形成更薄的刃。' },
    { q:'藤籃用蘆葦編織,而不是用石頭做,因為?', o:['輕又有韌性','石頭太便宜','蘆葦會發光','石頭會壞'], a:0, why:'材料要依用途選:裝東西要輕、能彎。' },
    { q:'貝殼可以磨成魚鉤,是因為貝殼?', o:['硬而且能磨尖','貝殼摸起來其實相當柔軟','貝殼放進水裡會自己浮起來','貝殼放久了會慢慢溶解掉'], a:0, why:'貝殼主要成分是碳酸鈣,夠硬也能磨。' }
  ];

  /* ══════════════ ★ P3-a(v1.3.0):科技研究、各區解謎點 ══════════════ */
  /* 科技(第十三章):tech=科技點(夜襲守住 +5、解謎點也給),cost=材料;研究活動=2 題+零件接線拼圖(沿用水道 Grid 引擎);unlocks=解鎖區域 */
  D.TECHS = [
    { id:'torch',   n:'火把',   e:'🔦', tech:5,  cost:{wood:5, fiber:5, stone:2},        unlocks:'cave',   src:'🔥', dst:'🔦', d:'把火固定在棒子上,走到哪亮到哪——燃燒需要可燃物、助燃物、溫度。', pz:'把燃料、空氣、火種接起來' },
    { id:'pulley',  n:'滑輪',   e:'⚙',  tech:10, cost:{wood:10, fiber:8, stone:4},       unlocks:'cliff',  src:'💪', dst:'📦', d:'定滑輪改變施力方向,動滑輪省一半力;有了它就能爬上懸崖搬東西。', pz:'把繩子繞過滑輪接到重物' },
    { id:'wheel',   n:'水車',   e:'🎡', tech:15, cost:{wood:15, reed:8, stone:6},        unlocks:'valley', needBld:'canal', src:'🏞', dst:'🎡', d:'流水推動葉片,水車就轉——把水的能量變成轉動的能量。', pz:'把水流引到水車葉片' },
    { id:'circuit', n:'電路',   e:'💡', tech:20, cost:{ore:6, trash:6, crystal:2},       unlocks:'ruins',  src:'🔋', dst:'💡', d:'電池→導線→燈泡→回到電池,形成通路燈才會亮;鐵礦煉的鐵、海廢的金屬都能導電。', pz:'把電池、導線、燈泡接成通路' }
  ];
  D.tech = function(id){ var i; for(i=0;i<D.TECHS.length;i++){ if(D.TECHS[i].id===id) return D.TECHS[i]; } return null; };
  D.ACTS.research = { n:'科技研究', e:'🔬', skill:'research', stat:'wit', ap:2, sec:75, bgm:'bgm-play',
                      qualityName:'零件接線', qualityHint:'點零件轉方向,把起點接到終點!剩越多時間品質越高。' };
  D.SKILLS.research = { n:'研究', e:'🔬', stat:'wit', lv3:'接線拼圖多 15 秒', lv5:'研究材料 −20%', lv7:'研究成功科技點退還一半' };
  D.QUIZ = D.QUIZ || {};
  D.QUIZ.research = [
    { q:'用棍子撬起大石頭,棍子是哪一種簡單機械?', o:['槓桿','滑輪','斜面','輪軸'], a:0, why:'槓桿:支點、施力點、抗力點,支點靠近重物最省力。' },
    { q:'定滑輪最主要的作用是?', o:['改變施力的方向','能讓拉東西的力氣直接省一半','能讓被吊起的東西整個變輕','能讓拉動用的繩子變得更長'], a:0, why:'定滑輪不省力,但可以往下拉把東西往上提。' },
    { q:'動滑輪可以?', o:['省力','省時間','改變方向但不省力','讓重物消失'], a:0, why:'動滑輪跟著重物一起動,施力大約只要重量的一半。' },
    { q:'把重物推上斜坡比直接抬起來輕鬆,是因為?', o:['斜面省力','斜面讓東西變輕','斜面有魔法','斜面比較短'], a:0, why:'斜面越長越緩越省力,但要推的距離變長。' },
    { q:'燈泡要亮,電路必須?', o:['形成通路(接成一圈)','把電路的其中一段刻意切斷','只用一條電線接住燈泡就好','把整個電路泡進水裡才會亮'], a:0, why:'電流從電池正極經過燈泡回到負極,形成通路才會亮。' },
    { q:'下列哪一種材料可以導電?', o:['鐵釘','木筷','塑膠尺','橡皮擦'], a:0, why:'金屬是導體;木頭、塑膠、橡膠是絕緣體。' },
    { q:'水車轉動,是把什麼能量變成轉動?', o:['流水的動能','是水流嘩啦啦的聲音能量','是插在水車旁的電線供電','是太陽照射水面的光能量'], a:0, why:'流動的水推葉片,水的動能變成水車的動能。' },
    { q:'火把要一直燒,需要不斷補充?', o:['可燃物和空氣','需要不斷潑上大量的水才行','需要不斷疊上一顆顆的石頭','需要靠旁邊有人不斷發出聲音'], a:0, why:'燃燒三要素:可燃物、助燃物(氧氣)、達到燃點的溫度。' },
    { q:'開關的功能是?', o:['接通或切斷電路','開關的作用是讓電流變得更多','開關本身是用來儲存電力的','開關打開之後燈才會變得更亮'], a:0, why:'開關閉合電路接通、打開電路斷開。' },
    { q:'螺絲釘是哪一種簡單機械的變形?', o:['斜面','滑輪','槓桿','輪軸'], a:0, why:'螺紋是繞在圓柱上的斜面,轉一圈只前進一點,所以省力。' }
  ];
  /* 各區解謎點(POI puzzle):3 題全對才解開,獎勵貝幣+科技點;每區只能解一次(ISL.puzzles[zone]) */
  D.PUZZLES = {
    forest: { n:'年輪樹樁', e:'🪵', intro:'樹樁上一圈圈的紋路,好像在說這座森林的故事……', reward:{shell:5, tech:3}, qs:[
      { q:'樹樁上的年輪一圈代表?', o:['一年','一個月','一天','一片葉子'], a:0, why:'樹每年長一圈(春天長得快顏色淺、秋冬慢顏色深)。' },
      { q:'年輪特別窄的那幾年,代表?', o:['那幾年乾旱或寒冷,長得慢','那幾年的雨水下得特別特別多','那幾年樹整個進入休眠睡著了','那幾年這棵樹曾經被人砍過一次'], a:0, why:'環境不好,樹長得慢,年輪就窄。' },
      { q:'樹幹裡負責運水的部分在?', o:['靠近樹皮的外圈','是長在樹木最正中央的部分','是深深埋在土裡的樹根部分','是長在最外面、行光合作用的葉子'], a:0, why:'外圈的木質部把水往上送;正中央是老的心材。' } ] },
    river:  { n:'水車座', e:'⚙', intro:'岸邊有一個古老的木座,好像曾經裝過會轉的東西……', reward:{shell:5, tech:4}, qs:[
      { q:'水車要放在哪裡最會轉?', o:['水流最快的地方','放在水面完全平靜的水潭裡','直接把水車架設在岸上','放在整條溪流的最深處水底'], a:0, why:'流速快,推葉片的力量大。' },
      { q:'溪水從上游到下游,速度通常?', o:['上游快、下游慢','從上游到下游,速度其實完全一樣','反而是下游的水流速度比較快','溪水從上游到下游根本不會流動'], a:0, why:'上游坡度大水流急,下游平緩。' },
      { q:'溪流轉彎處,哪一邊被沖蝕得比較厲害?', o:['外側','內側','兩邊一樣','都不會'], a:0, why:'外側水流快,侵蝕;內側慢,堆積。' } ] },
    rock:   { n:'潮池', e:'🦀', intro:'退潮後岩石間留下一窪窪小水池,裡面躲著好多生物……', reward:{shell:8, tech:2}, qs:[
      { q:'潮汐(海水漲退)主要是誰引起的?', o:['月球的引力','是海邊吹起的風造成的現象','是海裡的魚群集體游動造成的','是海水溫度變化造成的現象'], a:0, why:'月球(和太陽)的引力拉動海水,一天約兩次漲退。' },
      { q:'潮池裡的寄居蟹殼是?', o:['撿來的空螺殼','其實是寄居蟹自己長出來的','是撿來的一顆普通石頭','是海邊常見的塑膠垃圾'], a:0, why:'寄居蟹腹部柔軟,借用死掉螺類的殼保護自己。' },
      { q:'海星、海膽屬於?', o:['棘皮動物','牠們其實是屬於魚類','牠們其實是屬於哺乳類','牠們其實是屬於植物'], a:0, why:'棘皮動物身體表面有棘刺,五輻射對稱。' } ] },
    grass:  { n:'風向草', e:'🍃', intro:'這叢草全部往同一邊倒,好像在告訴我什麼……', reward:{shell:5, tech:3}, qs:[
      { q:'草全部往東邊倒,表示風從哪裡吹來?', o:['西邊','東邊','上面','沒有風'], a:0, why:'風向是指風「來」的方向,西風吹向東。' },
      { q:'風是怎麼形成的?', o:['空氣由高壓流向低壓','是被搖動的樹木自己搖出來的','是海浪拍打岸邊產生出來的','是太陽自轉帶動空氣旋轉出來的'], a:0, why:'太陽把地面曬得不均勻,空氣冷熱不同、壓力不同就流動。' },
      { q:'蒲公英的種子靠什麼傳播?', o:['風','水','動物','自己爆開'], a:0, why:'種子有絨毛像降落傘,隨風飄走。' } ] },
    lake:   { n:'湖心石碑', e:'🪨', intro:'湖邊有塊刻著字的石碑,寫著:「看得見的魚,不在你看見的地方。」', reward:{shell:6, tech:4}, qs:[
      { q:'從岸上看水裡的魚,魚的真正位置比看到的?', o:['更深','更淺','一樣','在水面上'], a:0, why:'光從水進入空氣會折射,看起來的位置比實際淺。' },
      { q:'湖水為什麼看起來是藍色的?', o:['水吸收紅光、散射藍光,又映著天空','湖底其實沉著很多天然的藍色顏料粉末','湖裡的魚身上本來就長著藍色的鱗片','湖底鋪滿的石頭原本天生就是藍色的'], a:0, why:'水對紅光吸收較多,加上天空的反射。' },
      { q:'湖泊和溪流最大的不同是?', o:['湖水幾乎不流動','湖水其實是鹹的,和海水一樣','湖泊裡面其實完全沒有生物','湖水在晚上其實會微微發光'], a:0, why:'湖泊是靜水,水中的氧氣和溫度分層都不一樣。' } ] },
    cave:   { n:'迴聲池', e:'🔊', intro:'對著洞裡喊一聲,聲音竟然回來了好幾次……', reward:{shell:8, tech:5}, qs:[
      { q:'迴聲是因為聲音?', o:['被岩壁反射回來','是聲音跑得不夠快造成的現象','是聲音變成光線之後產生的','是聲音被水整個吸收掉造成的'], a:0, why:'聲波碰到硬的表面會反射,距離夠遠就聽得出來。' },
      { q:'聲音需要靠什麼傳播?', o:['空氣、水或固體(介質)','完全不需要靠任何東西幫忙傳播','只能靠光線,才有辦法傳播出去','只能在完全沒有空氣的真空裡傳播'], a:0, why:'聲音是振動,要有介質才能傳;真空中聽不到聲音。' },
      { q:'洞窟頂上像冰柱一樣往下長的石頭叫?', o:['鐘乳石','石筍','火山岩','水晶'], a:0, why:'含碳酸鈣的水滴慢慢沉積,往下長是鐘乳石、往上長是石筍。' } ] },
    /* ★ P3-b */
    cliff:  { n:'風之柱', e:'🗼', intro:'懸崖頂上立著一根石柱,風從縫裡呼呼地穿過……', reward:{shell:8, tech:5}, qs:[
      { q:'越高的地方空氣越?', o:['稀薄、氣壓越低','越往高處,空氣反而越濃密、氣壓越高','越往高處,空氣的狀態其實完全一樣','越往高處,氣溫反而會變得越熱'], a:0, why:'越高空氣越少,氣壓越低,所以爬高山會喘。' },
      { q:'用滑輪把東西吊上懸崖,繩子要繞過滑輪的哪裡?', o:['輪子的凹槽','要繞過滑輪正中央的輪軸','隨便繞在輪子旁邊哪裡都行','其實完全不需要繞過去'], a:0, why:'繩子在凹槽裡才不會滑出來。' },
      { q:'懸崖上的鳥為什麼把巢築在高處?', o:['避開天敵','比較暖','風景好','蛋會滾下去'], a:0, why:'高處掠食者不容易到達,蛋和雛鳥比較安全。' } ] },
    valley: { n:'磨坊遺址', e:'🎡', intro:'溪邊有座倒塌的磨坊,大石磨還在,只是水車不見了……', reward:{shell:8, tech:6}, qs:[
      { q:'磨坊用水車帶動石磨,是把水的能量變成?', o:['轉動(動能)','變成一閃一閃的光','變成轟隆隆的聲音','變成可以用的電力'], a:0, why:'水推葉片 → 軸轉動 → 石磨轉,能量轉換但總量不變。' },
      { q:'穀物要磨成粉才能做餅,磨的原理是?', o:['兩塊石頭摩擦把種子壓碎','把穀物拿去加熱,讓它整個融化','把穀物泡進水裡,讓它自己變軟','放著不管,穀物自己就會裂開來'], a:0, why:'摩擦與壓力把硬的種子碾碎,和牙齒嚼東西一樣。' },
      { q:'山谷裡溪水彎來彎去(曲流),是因為?', o:['流水侵蝕和堆積','是山谷裡吹起的風造成的','是路過的動物踩踏造成的','是太陽照射水面造成的'], a:0, why:'外側侵蝕、內側堆積,河道越彎越明顯。' } ] },
    ruins:  { n:'遺跡機關', e:'🗿', intro:'石室中央有一塊刻著閃電符號的石板,旁邊插著銅棒與水晶……好像是古人的電路!', reward:{shell:12, tech:8}, qs:[
      { q:'把銅棒接上,燈才亮,銅是?', o:['導體','絕緣體','磁鐵','燃料'], a:0, why:'金屬是導體;水晶(石英)不導電是絕緣體。' },
      { q:'電路裡電流的方向,一般規定從電池的?', o:['正極流向負極','負極流向正極','兩邊同時','沒有方向'], a:0, why:'習慣上電流由正極經外電路流回負極。' },
      { q:'兩顆燈泡串聯,拔掉一顆,另一顆會?', o:['熄滅','更亮','不變','閃爍'], a:0, why:'串聯只有一條路,斷了整個電路就斷。並聯才各走各的。' } ] },
    volcano:{ n:'火山口觀測台', e:'🌋', intro:'站在火山口邊,腳下的岩石還是溫的。這座島,原來是火山噴出來的……', reward:{shell:15, tech:10}, qs:[
      { q:'岩漿冷卻凝固後變成?', o:['火成岩','沉積岩','變質岩','沙子'], a:0, why:'岩漿或熔岩冷卻結晶形成火成岩,例如玄武岩。' },
      { q:'火山島是怎麼形成的?', o:['海底火山噴發堆高露出海面','退潮之後海水完全退開,露出島嶼','大風把沙子越吹越高,堆成了島','海裡的動物一點一點蓋出了島嶼'], a:0, why:'岩漿一次次噴出堆積,最後高出海面就成島。' },
      { q:'火山附近的土壤特別肥沃,是因為?', o:['火山灰含礦物質','是因為那裡的氣溫比較高','是因為那裡的水分特別多','是因為那裡沒有任何石頭'], a:0, why:'火山灰風化後釋放礦物質,植物長得好。' } ] }
  };

  /* ── 題庫(三~六年級隨機):烹飪(熱)、種植(植物)、馴養(動物)、水利(水) ── */
  D.QUIZ = D.QUIZ || {};
  D.QUIZ.cook = [
    { q:'鍋子放在火上,鍋底先熱,慢慢整個鍋子都熱了,這是?', o:['傳導','對流','輻射','蒸發'], a:0, why:'熱在固體裡一個粒子傳一個粒子,叫傳導。' },
    { q:'煮湯時,底下熱水往上、上面冷水往下,整鍋變熱,這是?', o:['對流','傳導','反射','凝固'], a:0, why:'液體和氣體靠上下流動傳熱,叫對流。' },
    { q:'站在營火旁邊不碰到火也覺得暖,是因為?', o:['輻射','傳導','對流','溶解'], a:0, why:'熱可以像光一樣直接射過來,叫輻射。' },
    { q:'一大氣壓下,水燒開的溫度大約是?', o:['100°C','50°C','200°C','0°C'], a:0, why:'水的沸點約 100°C,再加熱只會變成水蒸氣,不會更燙。' },
    { q:'哪一種材料最適合當鍋柄?', o:['木頭','選導熱又燙手的鐵來當鍋柄','選導熱又燙手的銅來當鍋柄','選導熱又燙手的鋁來當鍋柄'], a:0, why:'木頭是熱的不良導體,握著不燙手。' },
    { q:'煎蛋時透明的蛋白變白、變硬,是因為?', o:['蛋白質受熱變性凝固','是因為蛋白裡面的水分蒸發掉了','是因為加熱讓蛋白整個融化開來','是因為煎的時候有空氣跑進蛋裡'], a:0, why:'蛋白質受熱會改變結構,從液態變固態。' },
    { q:'把野果加熱煮成果醬,果醬越煮越稠是因為?', o:['水分蒸發變少','是因為裡面的糖分全部跑掉了','是因為果實在鍋裡越煮越大顆','是因為鍋子裡的溫度變得比較低'], a:0, why:'水變成水蒸氣跑掉,剩下的就變濃稠。' },
    { q:'食物要煮熟才吃,最主要是為了?', o:['殺死細菌和寄生蟲','煮熟之後可以讓食物的體積變大','煮熟之後可以增加食物的含水量','煮熟之後能讓食物的顏色變漂亮'], a:0, why:'高溫能殺死大部分的細菌與寄生蟲,才不會生病。' },
    { q:'鹽放進熱湯裡不見了,鹽去哪了?', o:['溶解在水裡','蒸發了','燒掉了','沉到鍋底變石頭'], a:0, why:'鹽溶解在水中,湯嚐起來是鹹的。' },
    { q:'哪一種火最適合煮湯?', o:['小火慢煮','大火猛燒','不用火','火越大越好'], a:0, why:'小火讓水保持微滾,味道慢慢釋出、不燒焦。' }
  ];
  D.QUIZ.plant = [
    { q:'植物製造養分的地方主要在?', o:['葉子','根','花','種子'], a:0, why:'葉子裡的葉綠素利用陽光、水和二氧化碳製造養分。' },
    { q:'種子發芽需要的三個條件是?', o:['水、空氣、適當溫度','需要陽光、糖分,還有肥料','需要輕柔的音樂、水和土壤','需要風、雨水,還有打雷'], a:0, why:'種子發芽不一定要陽光,但要水、空氣和適當溫度。' },
    { q:'植物的根主要負責?', o:['吸收水分和養分、固定植株','行光合作用,幫植物製造養分','負責開出花朵,然後再結出果實','讓植物能夠呼吸空氣中的氧氣'], a:0, why:'根像吸管一樣吸水,也像錨一樣抓住土壤。' },
    { q:'田裡的水從土壤到葉子,是靠哪個部位運送?', o:['莖','花','果實','種子'], a:0, why:'莖裡有維管束,像水管一樣把水往上送。' },
    { q:'種太密的作物長得不好,是因為?', o:['互相搶陽光、水和養分','是因為那塊田裡的土壤突然變多','是因為播下去的種子顆粒太大顆','純粹是因為澆的水澆得太多了'], a:0, why:'植物之間會競爭資源,太擠大家都長不好。' },
    { q:'早上澆水比中午澆水好,是因為?', o:['中午太熱水很快蒸發','是因為早上澆的水味道比較甜','是因為中午時間植物在睡午覺','是因為早上的土壤質地比較硬'], a:0, why:'中午太陽大,水還沒被吸收就蒸發了。' },
    { q:'一年生植物從種子到結種子,順序是?', o:['發芽→長葉→開花→結果','開花→發芽→結果→長葉','結果→發芽→開花→長葉','長葉→結果→發芽→開花'], a:0, why:'植物的生命週期:發芽、長葉、開花、結果、種子。' },
    { q:'花對植物來說最重要的功能是?', o:['傳粉、繁殖下一代','負責行光合作用,製造養分','負責從土壤裡吸收水分','負責把水分儲存在花瓣裡面'], a:0, why:'花是植物的繁殖器官,傳粉後才會結果、產生種子。' },
    { q:'穀物(像稻米、小麥)我們吃的是植物的哪個部位?', o:['種子','我們吃的其實是植物的根部','我們吃的其實是植物的葉子','我們吃的其實是植物的莖部'], a:0, why:'稻米、小麥、玉米都是植物的種子,裡面儲存了澱粉。' },
    { q:'把落葉、爛掉的野果埋進土裡,對田地有什麼好處?', o:['分解後變成養分(堆肥)','埋進去之後,會讓那塊土地變得很硬','埋進去之後,土裡的蟲會統統跑光光','埋進去之後,土壤最後會變成石頭'], a:0, why:'分解者(細菌、蚯蚓)把它們分解成植物能吸收的養分。' }
  ];
  D.QUIZ.tame = [
    { q:'哺乳類動物的共同特徵是?', o:['胎生、有毛、喝母乳','卵生、身上長著羽毛','身上有鱗片、屬於冷血動物','牠們的身體構造是六隻腳'], a:0, why:'哺乳類直接生小寶寶,用奶餵養,身上有毛。' },
    { q:'雞、海鷗這一類動物叫做?', o:['鳥類','哺乳類','爬蟲類','兩生類'], a:0, why:'鳥類有羽毛、有喙、卵生。' },
    { q:'兔子的門牙一直長,所以牠要?', o:['常常啃東西磨牙','乾脆整天都不要進食','大部分時間拿來睡覺','時常跳進水裡游泳'], a:0, why:'嚙齒類和兔子的門牙終生生長,要靠啃磨保持長度。' },
    { q:'山羊吃草,牠在食物鏈裡是?', o:['消費者','生產者','分解者','太陽'], a:0, why:'植物是生產者,吃植物的動物是消費者(初級)。' },
    { q:'青蛙小時候住在水裡用鰓呼吸,長大用肺,牠是?', o:['兩生類','魚類','爬蟲類','鳥類'], a:0, why:'兩生類一生經歷水陸兩種環境,會變態。' },
    { q:'動物身上的毛或羽毛,最主要的功能是?', o:['保暖','好看','發光','當食物'], a:0, why:'毛和羽毛留住空氣,減少熱散失。' },
    { q:'照顧家畜時,最基本要提供?', o:['食物、乾淨的水、安全的住所','手機和平板,讓牠們不會覺得無聊','各式各樣的玩具和好玩的遊戲','整天播放的音樂和明亮的燈光'], a:0, why:'動物和我們一樣需要吃、喝、住得安全。' },
    { q:'雞蛋的蛋殼是硬的,主要成分是?', o:['碳酸鈣','蛋殼的主要成分其實是鐵','蛋殼的主要成分其實是塑膠','蛋殼的主要成分其實是糖分'], a:0, why:'蛋殼含碳酸鈣,能保護裡面的小雞胚胎。' },
    { q:'馴養動物時要慢慢靠近,是因為?', o:['動物看到快速動作會以為是天敵','動物天生就喜歡慢吞吞的動作聲音','跑步靠近會先把自己累壞沒力氣','走太快會把地上的草踩壞,牠會生氣'], a:0, why:'突然的動作和聲音會觸發動物的逃跑本能。' },
    { q:'哪一種動物是「變溫動物」(體溫隨環境改變)?', o:['蛇','山羊','雞','兔子'], a:0, why:'爬蟲類、兩生類、魚類是變溫動物;鳥和哺乳類是恆溫。' }
  ];
  D.QUIZ.canal = [
    { q:'水總是往哪裡流?', o:['低處','高處','北邊','熱的地方'], a:0, why:'受重力影響,水從高處流向低處。' },
    { q:'要把溪水引到營地,水道的起點應該比終點?', o:['高','低','一樣高','沒差'], a:0, why:'起點高、終點低,水才會自己流過去。' },
    { q:'水道要轉彎時用彎管,直的地方用直管,這是在利用水的什麼特性?', o:['水會沿著容器流動,沒有固定形狀','水在管子裡其實是固體,所以要轉彎','水放著不會自己動,要靠管子推著走','水到了轉角會飛起來,要用彎管接住'], a:0, why:'液體沒有固定形狀,會順著管子的形狀流。' },
    { q:'水道的水從哪裡來?溪水最上游的源頭通常是?', o:['山上的雨水和地下水','其實源頭是從海裡逆流上來的海水','是有人特地搬上山的整箱瓶裝水','是接在山上牆邊裝設好的水龍頭'], a:0, why:'雨水落在山上匯集成溪流,最後流進海裡——這是水循環。' },
    { q:'兩根水管一粗一細,同樣時間內哪根流過的水比較多?', o:['粗的','細的','一樣','都不流'], a:0, why:'管子越粗,水流的通道越大,流量越大。' },
    { q:'水道漏水了,最可能的原因是?', o:['接口沒對好','是因為裡面流的水太乾淨了','是因為那幾天天氣太好了','是因為水道裡的水量太少了'], a:0, why:'管子接口沒接緊,水就從縫隙漏出去。' },
    { q:'古人用「水車」引水,是利用什麼力量轉動水車?', o:['水流的力量','是靠呼呼吹來的風力轉動','是靠接上電線來轉動的','是靠很多人一起出力推動'], a:0, why:'流動的水推動葉片,水車就會轉。' },
    { q:'農田引水太多,土裡沒有空氣,作物會?', o:['根爛掉','長更快','變甜','開更多花'], a:0, why:'根也要呼吸,泡在水裡太久會缺氧腐爛。' },
    { q:'水從溪流流到大海,再變成雲、下雨回到山上,叫做?', o:['水循環','食物鏈','光合作用','傳導'], a:0, why:'蒸發→凝結→降水,水在地球上不停循環。' },
    { q:'水道做好後,為什麼要用石頭砌邊?', o:['防止水把泥土沖走','因為石頭在晚上會發出微光','因為石頭本身具有吸水功能','石頭砌邊能讓流過的水變熱'], a:0, why:'流水會侵蝕鬆軟的土,硬的石頭能保護水道。' }
  ];

  /* 打撈海廢:漂來物與分類桶(重用 recycle 題材;生物要放回海裡) */
  D.TRASH_BINS = [ {k:'paper', n:'紙類', e:'📦'}, {k:'plastic', n:'塑膠', e:'🧴'}, {k:'metal', n:'金屬', e:'🥫'}, {k:'other', n:'一般', e:'🗑'}, {k:'life', n:'放回海裡', e:'🌊'} ];
  D.TRASH_ITEMS = [
    { n:'寶特瓶', e:'🧴', k:'plastic', why:'塑膠要幾百年才分解,一定要回收。' },
    { n:'鋁罐', e:'🥫', k:'metal', why:'鋁罐可以熔掉再做新罐子。' },
    { n:'泡水紙箱', e:'📦', k:'paper', why:'紙類回收可以少砍很多樹。' },
    { n:'塑膠袋', e:'🛍', k:'plastic', why:'塑膠袋在海裡像水母,海龜會誤食。' },
    { n:'玻璃瓶', e:'🍾', k:'other', why:'玻璃單獨回收,不和一般塑膠混。(這裡先歸一般)' },
    { n:'漁網碎片', e:'🕸', k:'other', why:'廢棄漁網會纏住海洋生物,叫「幽靈漁網」。' },
    { n:'鐵釘', e:'🔩', k:'metal', why:'鐵會生鏽,但仍可回收再利用。' },
    { n:'報紙', e:'📰', k:'paper', why:'紙類回收。' },
    { n:'海龜', e:'🐢', k:'life', why:'這是生物!輕輕放回海裡。' },
    { n:'水母', e:'🪼', k:'life', why:'水母是生物,不是塑膠袋,放回海裡。' },
    { n:'寄居蟹', e:'🦀', k:'life', why:'寄居蟹住在殼裡,放回岸邊。' },
    { n:'保麗龍', e:'⬜', k:'plastic', why:'保麗龍是塑膠的一種,會碎成小顆粒被魚吃掉。' }
  ];
  /* 防衛戰(第五章):魔物八種,各自對應正確工具;★ v1.11.0 每隻加 from(第幾天起出現)與 q(地下層/戰鬥一題) */
  D.MONSTERS = [
    { k:'shadow', n:'影魔', e:'👤', tool:'torch', from:1, hint:'怕光!用火把照它', why:'光讓影子消失(光與影)。',
      q:{ q:'影子會出現,是因為?', o:['光被物體擋住','物體會發黑光','空氣變黑','地上有洞'], a:0, why:'光沿直線前進,被擋住的地方就是影子。' } },
    { k:'beetle', n:'鐵甲蟲', e:'🪲', tool:'magnet', from:1, hint:'鐵做的!用磁鐵吸走', why:'磁鐵會吸鐵。',
      q:{ q:'下列哪一種會被磁鐵吸住?', o:['鐵釘','銅線','鋁罐','塑膠尺'], a:0, why:'磁鐵吸鐵、鈷、鎳;銅、鋁、塑膠都不會。' } },
    { k:'bat',    n:'夜蝠', e:'🦇', tool:'gong', from:1, hint:'怕吵!敲鑼趕走', why:'蝙蝠靠聲音(回聲)定位,巨響會干擾牠。',
      q:{ q:'蝙蝠在黑暗中飛不撞牆,是靠?', o:['發出聲音聽回聲','是靠一雙眼睛特別明亮看路','是靠鼻子聞味道辨認方向','是靠事先記熟整張地圖飛行'], a:0, why:'蝙蝠發出超音波,聽回聲判斷障礙物位置(回聲定位)。' } },
    { k:'boar',   n:'野豬', e:'🐗', tool:'fist', from:1, hint:'連點 3 下趕跑', why:'純反應!',
      q:{ q:'在山上遇到野豬,最安全的做法是?', o:['保持距離慢慢退開','直接跑過去伸手摸摸看牠','放聲大喊並追著牠跑過去','拿食物出來,試著餵牠吃'], a:0, why:'野生動物受驚會攻擊,遠離、不餵食最安全。' } },
    /* ★ v1.11.0 甲:新增四種魔物,各綁一個自然科學概念 */
    { k:'slime',  n:'黏泥怪', e:'🟢', tool:'salt', from:5, hint:'撒鹽!它會脫水', why:'鹽把水吸出來(滲透作用),黏泥就縮小了。',
      q:{ q:'蛞蝓被撒鹽會縮小,是因為?', o:['鹽把牠身體的水吸出來','撒上去的鹽,溫度其實非常燙','鹽粒接觸到身體之後會發出亮光','鹽碰到蛞蝓的身體會變成酸液'], a:0, why:'水會從鹽分低的地方流向鹽分高的地方(滲透),身體的水被吸走就脫水了。' } },
    { k:'ember',  n:'火精', e:'🔥', tool:'water', from:5, hint:'潑水!降溫又隔絕空氣', why:'水帶走熱、隔絕空氣,燃燒三要素少了兩個。',
      q:{ q:'燃燒需要三個條件,下列哪一個不是?', o:['水','可燃物','氧氣(空氣)','足夠的溫度'], a:0, why:'燃燒三要素=可燃物、助燃物(氧氣)、燃點溫度;水是用來滅火的。' } },
    { k:'basilisk', n:'石化蛇', e:'🐍', tool:'mirror', from:9, hint:'用鏡子把目光反射回去', why:'光遇到鏡面會反射(入射角=反射角)。',
      q:{ q:'鏡子能反射光,是因為鏡面?', o:['很光滑','很重','很冷','會發光'], a:0, why:'光滑的表面讓光整齊地反射回去(鏡面反射);粗糙表面則是漫反射。' } },
    { k:'spark',  n:'雷精', e:'⚡', tool:'glove', from:9, hint:'戴橡膠手套抓它!', why:'橡膠是絕緣體,電流過不去。',
      q:{ q:'電工戴橡膠手套工作,是因為橡膠是?', o:['絕緣體','橡膠其實是很好的導電材料','橡膠本身其實是一種磁鐵','橡膠其實可以拿來當作燃料'], a:0, why:'絕緣體(橡膠、塑膠、玻璃)不讓電流通過,可以保護人。' } }
  ];
  D.DEF_TOOLS = [ {k:'torch', n:'火把', e:'🔦'}, {k:'magnet', n:'磁鐵', e:'🧲'}, {k:'gong', n:'銅鑼', e:'🔔'}, {k:'fist', n:'趕跑', e:'👊'},
                  {k:'salt', n:'鹽', e:'🧂'}, {k:'water', n:'水桶', e:'💧'}, {k:'mirror', n:'鏡子', e:'🪞'}, {k:'glove', n:'橡膠手套', e:'🧤'} ];   /* ★ v1.11.0 四種新工具 */
  D.monster = function(k){ var i; for(i=0;i<D.MONSTERS.length;i++){ if(D.MONSTERS[i].k===k) return D.MONSTERS[i]; } return null; };
  D.defTool = function(k){ var i; for(i=0;i<D.DEF_TOOLS.length;i++){ if(D.DEF_TOOLS[i].k===k) return D.DEF_TOOLS[i]; } return null; };
  /* ★ v1.11.0 甲:四維對防衛戰的加成(門檻 8 / 14,說明文字給夜襲開場視窗用) */
  D.DEF_STAT_BONUS = {
    pow: { n:'力氣', e:'💪', t8:'野豬只要點 2 下', t14:'野豬只要點 1 下' },
    dex: { n:'巧手', e:'✋', t8:'魔物移動慢 10%', t14:'魔物移動慢 20%' },
    mov: { n:'腳程', e:'🏃', t8:'每波多 2 秒', t14:'每波多 4 秒' },
    wit: { n:'巧思', e:'💡', t8:'魔物頭上顯示提示', t14:'用錯工具也能讓魔物停 1 秒' }
  };
  D.DEF_BITE_HP = 5;   /* ★ v1.11.0 甲:魔物咬到營火時,守在旁邊的你也受傷 5;體力歸零 = 倒下,夜襲判輸 */
  /* ★ v1.11.0 乙:遺跡地下層(探索戰鬥=工具配對 + 一題,不是動作戰鬥;每天可下一次,遺跡機關解開後開放) */
  D.DUNGEON = {
    floors: 3, ap: 1, entry:{x:16, y:17, n:'地下入口', e:'🕳'},
    intro: ['石板下面有階梯,黑漆漆的……解開機關後,門真的開了。', '(地下層每天可以探一次。裡面的魔物比地面的強,是回合制戰鬥;帶好武器和料理,打不過就撤退。守墓石像會共振——答對牠的問題,開戰時牠會先暈一回合。)'],   /* ★ v1.22.0→v1.23.0 地下層改回合制 */
    floorNames: ['B1 石廊', 'B2 水晶室', 'B3 守墓者之間'],
    perFloor: [2, 2, 1],   /* 每層遇敵數(第 3 層 = 守墓者) */
    loot: [ {shell:4, relic:1}, {shell:6, crystal:1}, {shell:15, tech:6, crystal:2} ],
    boss: { k:'guardian', n:'守墓石像', e:'🗿', tool:'gong', hint:'石像會共振!敲鑼', why:'聲音是振動,大鑼的振動讓石像裂開(共振)。',
      qs:[ { q:'聲音是由什麼產生的?', o:['物體的振動','是光線照射之後產生的','是物體受熱之後產生的','是磁力吸引之後產生的'], a:0, why:'任何聲音都來自振動,振動停了聲音也停。' },
           { q:'敲鑼後用手按住鑼面,聲音會?', o:['馬上停','更大聲','變高音','不變'], a:0, why:'手按住讓振動停止,聲音就停了。' },
           { q:'聲音在哪裡傳得最快?', o:['固體(石頭)','聲音在空氣裡傳得最快','聲音在真空裡傳得最快','其實不管在哪裡傳都沒有差別'], a:0, why:'固體分子排得緊,振動傳得最快;真空沒有介質,聲音傳不出去。' } ] },
    clearStory: ['守墓石像碎成一堆石塊,牆上露出一幅壁畫:古人用銅棒、水晶和……閃電,點亮了整座遺跡。', '(原來這座島的祕密,是「電」。)']
  };
  /* ★ v1.11.0 丙:好友守夜(H 甲互加不需同意、I 甲不在線也守夜);名片 minigameIslandPublic/{uid},好友清單存在自己存檔 friends[] */
  /* ★ v1.12.0 結局(建造帆船後):回憶幻燈片 + 電影捲動字幕;字幕內容由 index 端依存檔生成,這裡放固定文案 */
  D.ENDING = {
    title: '像素荒島求生記', subtitle: '— 一段用自然課知識活下來的日子 —',
    opening: ['帆船造好了。', '在離開之前,讓我們回頭看看——', '這座島記得的每一天。'],
    slideSec: 3.6, fadeSec: 1.2, maxSlides: 28,
    creditsTail: ['島上的植物、動物與礦石　　全部是台灣的物種', '自然知識　　小學三～六年級自然科學', '美術風格　　HD-2D 像素風', '製作　　力行國小', '謝謝你,守護了這座島。', '(想留下來的話,島一直都在。)']
  };
  D.LOG_MAX = 150;
  /* ★ v1.13.0 好友信箱:送物資限這幾種原始資源、單次數量上限、留言字數上限 */
  D.MAIL_GIFT_ITEMS = ['wood', 'stone', 'fiber', 'leaf', 'reed', 'pebble'];
  D.MAIL_QTY_MAX = 20;
  D.MAIL_NOTE_MAX = 40;
  D.FRIEND_MAX = 5;
  D.FRIEND_HELPERS = 3;       /* 夜襲時最多 3 位好友小人在營火旁 */
  D.FRIEND_HIT_SEC = function(defLv){ return Math.max(3, 7 - 0.4 * (defLv || 1)); };   /* 好友每隔幾秒趕走一隻(防衛技能越高越快) */

  D.QUIZ = D.QUIZ || {};   /* ★ v1.1.0 提前宣告(P2 題庫先於 P1 題庫定義) */
  D.QUIZ.fish = [
    { q:'木頭做的浮標會浮在水上,是因為?', o:['木頭密度比水小','是因為那塊木頭特別重','是因為水的質地特別硬','是因為風一直在吹著它'], a:0, why:'密度比水小的東西會浮。' },
    { q:'看水裡的魚,牠真正的位置通常在看起來的?', o:['更深一點','更淺一點','一樣','旁邊'], a:0, why:'光從水進空氣會折射,看到的比實際淺。' },
    { q:'浮標突然猛沉,代表?', o:['魚咬餌了','風吹','水變深','浮標壞了'], a:0, why:'魚拉動魚餌,浮標才會被拉下去。' },
    { q:'魚用什麼呼吸?', o:['鰓','肺','皮膚','鰭'], a:0, why:'魚用鰓過濾水中的氧氣。' },
    { q:'魚身上的鰭主要用來?', o:['游泳與平衡','是用來呼吸,吸收水裡的氧氣','是用來進食,把食物送進嘴裡','是用來看東西,類似眼睛功能'], a:0, why:'尾鰭推進、胸鰭腹鰭控制方向與平衡。' },
    { q:'把石頭放進裝滿水的桶子,水會?', o:['溢出來','桶子裡的水反而會變少','桶子裡的水量完全不會改變','桶子裡的水會整個憑空消失'], a:0, why:'石頭佔了體積,水被排開。' },
    { q:'溪流上游的水流通常比下游?', o:['快','慢','一樣','不流動'], a:0, why:'坡度大,水流快。' },
    { q:'水從高處流向低處,是因為?', o:['重力','風','魚推','太陽'], a:0, why:'地球引力把水往下拉。' },
    { q:'在溪邊哪裡最容易看到魚?', o:['水流較緩、有遮蔽的地方','水流又急又猛的瀑布正下方','完全曬乾、沒有一滴水的石頭上','溪邊旁邊那些高高的樹上面'], a:0, why:'魚會躲在水流緩、有掩護的地方休息。' },
    { q:'哪一種動物「不是」魚?', o:['鯨魚','鯽魚','鱸魚','鰻魚'], a:0, why:'鯨魚是哺乳類,用肺呼吸。' }
  ];
  D.QUIZ.trash = [
    { q:'寶特瓶在海裡大約要多久才分解?', o:['幾百年','一星期','一年','一天'], a:0, why:'塑膠幾乎不會被自然分解。' },
    { q:'海龜為什麼會吃塑膠袋?', o:['以為是水母','喜歡塑膠','肚子餓什麼都吃','塑膠袋香'], a:0, why:'漂在水裡的塑膠袋外型很像水母。' },
    { q:'廢棄漁網對海洋生物的危害是?', o:['纏住動物','讓水變乾淨','提供食物','幫魚遮陽'], a:0, why:'幽靈漁網會纏住海龜、海豚。' },
    { q:'鋁罐屬於哪一類回收?', o:['金屬','紙類','塑膠','廚餘'], a:0, why:'鋁是金屬。' },
    { q:'回收的好處是?', o:['減少垃圾、節省資源','把東西拿去回收,垃圾反而會變多','回收的過程,反而會汙染到海洋','回收其實是一種很浪費電力的行為'], a:0, why:'回收再利用能少開採、少砍樹。' },
    { q:'塑膠碎成小顆粒後叫做?', o:['塑膠微粒','碎成小顆粒之後會變成細沙','碎成小顆粒之後會變成鹽粒','碎成小顆粒之後會變成珍珠'], a:0, why:'塑膠微粒會被魚吃下,最後回到人的餐桌。' },
    { q:'海邊撿到的海漂垃圾,很多來自?', o:['陸地上的河川與雨水沖下海','是海底火山噴發時一起噴出來的','是海裡的魚自己製造出來的','是從天上直接掉落到海面上的'], a:0, why:'陸地垃圾隨河川入海。' },
    { q:'減少海洋垃圾,最好的方法是?', o:['從源頭少用一次性塑膠','盡量多丟一些垃圾到海裡去','把垃圾統統埋進沙灘裡面','直接把垃圾丟進海裡處理掉'], a:0, why:'少用才是根本。' },
    { q:'紙類回收前應該?', o:['壓平、去除膠帶','要先整個拿去泡在水裡','直接一把火把它燒掉','撕成碎片之後丟進海裡'], a:0, why:'乾淨、壓平的紙才好回收。' },
    { q:'寶特瓶在荒島上可以再利用做?', o:['浮筒','火種','石頭','食物'], a:0, why:'密封的空瓶會浮,可以當浮筒。' }
  ];
  D.QUIZ.quarry = [
    { q:'岩石是由什麼組成的?', o:['礦物','水','木頭','空氣'], a:0, why:'岩石由一種或多種礦物組成。' },
    { q:'海邊的岩石被海浪打久了會?', o:['變圓變光滑','稜角反而會變得更尖銳','體積會漸漸變得越來越大','質地會漸漸變得越來越軟'], a:0, why:'海浪不斷磨蝕,稜角被磨圓。' },
    { q:'岩石一層一層堆疊的樣子,可能是?', o:['沉積岩','火成岩','鐵','冰'], a:0, why:'沉積物一層層堆積壓實形成沉積岩。' },
    { q:'岩漿冷卻後形成的岩石是?', o:['火成岩','沉積岩','沙','泥土'], a:0, why:'例如玄武岩、花崗岩。' },
    { q:'用鎬子敲石頭,握在鎬柄尾端比較?', o:['省力','費力','一樣','危險'], a:0, why:'槓桿原理:施力臂越長越省力。' },
    { q:'潮間帶指的是?', o:['漲潮淹沒、退潮露出的地方','整片海域裡海水最深的那個地方','沙灘上距離海水最遠的最上面','靠近海邊、地勢比較高的山坡地'], a:0, why:'漲退潮之間的區域,生物很多。' },
    { q:'退潮時岩石上的水窪叫?', o:['潮池','游泳池','水井','湖'], a:0, why:'潮池裡有螃蟹、海葵、小魚。' },
    { q:'石頭比木頭?', o:['硬且不會浮','質地比木頭還要軟一些','放到水裡會浮起來','碰到火會被點燃燃燒'], a:0, why:'岩石密度大又硬。' },
    { q:'硬的石頭適合當什麼?', o:['營火底座','拿來鋪成柔軟舒適的床墊','直接拿來蓋成整片屋頂','當作引火用的乾燥火種'], a:0, why:'耐熱又穩固。' },
    { q:'岩石經過風吹雨打慢慢碎裂叫?', o:['風化','融化','燃燒','蒸發'], a:0, why:'風化後的碎屑變成沙和土。' }
  ];
  D.QUIZ.defense = [
    { q:'影子是怎麼形成的?', o:['光被物體擋住','是因為那個物體自己在發光','是因為周圍的空氣突然變黑','是因為光線照到水面反射出來'], a:0, why:'光直線前進,被擋住的地方就是影子。' },
    { q:'磁鐵會吸哪一種東西?', o:['鐵釘','木頭','塑膠','紙'], a:0, why:'磁鐵吸鐵、鈷、鎳。' },
    { q:'蝙蝠在黑暗中怎麼找路?', o:['發出聲音聽回聲','靠一雙眼睛在黑暗中看清楚路','靠鼻子聞味道來辨認方向','靠手腳一路摸著牆壁前進'], a:0, why:'回聲定位。' },
    { q:'敲鑼的聲音是怎麼傳到耳朵的?', o:['靠空氣振動','是靠光線把聲音傳過來的','是靠水流把聲音帶過來的','是靠磁鐵吸引聲音過來的'], a:0, why:'聲音靠介質振動傳播。' }
  ];

  /* 採集:植物部位(知識操作用) */
  D.PLANT_PARTS = [
    { k:'root',  n:'根',   e:'🥕', d:'吸水、固定植物' },
    { k:'stem',  n:'莖',   e:'🎋', d:'運送水分養分、支撐' },
    { k:'leaf',  n:'葉',   e:'🍃', d:'行光合作用製造養分' },
    { k:'flower',n:'花',   e:'🌸', d:'繁殖器官,會結成果實' },
    { k:'fruit', n:'果實', e:'🍎', d:'保護種子,幫助傳播' },
    { k:'seed',  n:'種子', e:'🌰', d:'發芽長成新植物' }
  ];
  /* 採集任務模板:指令 + 正確部位(多選)+ 陷阱說明 */
  D.GATHER_TASKS = [
    { q:'採 3 個「果實」回去當糧食', ok:['fruit'], n:3, why:'果實裡面包著種子,很多果實可以吃。' },
    { q:'找出會「行光合作用」的部位,採 3 片', ok:['leaf'], n:3, why:'葉子有葉綠素,能用陽光製造養分。' },
    { q:'要拿來「編繩子」的纖維,採莖 3 條', ok:['stem'], n:3, why:'莖裡有纖維,可以撕成細條編織。' },
    { q:'想種新植物,要收集 3 個什麼?', ok:['seed'], n:3, why:'種子會發芽,長成新的植物。' },
    { q:'能「吸水、把植物固定在土裡」的部位,拔 2 個', ok:['root'], n:2, why:'根會往土裡長,吸收水分並固定植物。' },
    { q:'將來會結成果實的部位,採 2 朵', ok:['flower'], n:2, why:'花授粉後,子房會發育成果實。' }
  ];
  /* 種子傳播(進階拖曳題) */
  D.SEED_SPREAD = [
    { n:'蒲公英', e:'🌬', how:'wind',   why:'有毛毛的降落傘,靠風飄走。' },
    { n:'林投果', e:'🥥', how:'water',  why:'果實能浮在海上,順著洋流漂到別的海岸。' },
    { n:'鬼針草', e:'🌾', how:'animal', why:'有小勾子,黏在動物身上被帶走。' },
    { n:'楓樹翅果', e:'🍁', how:'wind', why:'像螺旋槳一樣旋轉,靠風飛遠。' },
    { n:'野莓',   e:'🍓', how:'animal', why:'被鳥吃掉後,種子隨糞便到別處發芽。' },
    { n:'蓮子',   e:'🪷', how:'water',  why:'蓮蓬會漂在水上,種子隨水流散開。' }
  ];
  D.SPREAD_BINS = [ {k:'wind', n:'風傳', e:'💨'}, {k:'water', n:'水傳', e:'💧'}, {k:'animal', n:'動物傳', e:'🐦'} ];

  /* 生火:三要素與滅火情境 */
  D.FIRE_ITEMS = [
    { k:'tinder', n:'火種(乾草)', e:'🌾', slot:'fuel',  why:'可燃物' },
    { k:'wood',   n:'木柴',       e:'🪵', slot:'fuel',  why:'可燃物' },
    { k:'air',    n:'扇風',       e:'🪭', slot:'air',   why:'助燃物(空氣中的氧氣)' },
    { k:'spark',  n:'摩擦生熱',   e:'✨', slot:'heat',  why:'溫度(達到燃點)' },
    { k:'stone',  n:'濕石頭',     e:'🪨', slot:null,    why:'不會燒,也不助燃' },
    { k:'water',  n:'一桶水',     e:'🪣', slot:null,    why:'降溫、隔絕空氣,是滅火用的' }
  ];
  D.FIRE_SLOTS = [ {k:'fuel', n:'可燃物', e:'🪵', d:'燒得起來的東西'}, {k:'air', n:'助燃物', e:'💨', d:'讓火持續燒的空氣'}, {k:'heat', n:'溫度', e:'🌡', d:'達到燃點的熱'} ];
  D.EXTINGUISH = [
    { q:'鍋子裡的油突然燒起來了!該怎麼辦?', o:['蓋上鍋蓋','倒水下去','用嘴吹'], a:0, why:'蓋鍋蓋隔絕空氣(助燃物);油鍋倒水會噴濺更危險。' },
    { q:'營火旁的乾草燒起來了,最快的方法?', o:['蓋沙子','搧風','再丟木頭'], a:0, why:'沙子把火和空氣隔開,火就熄了。' },
    { q:'想讓營火熄滅,最好移除哪一個?', o:['把燃料撥開分散','繼續對著火堆用力搧風','在火堆上面蓋一層乾葉子'], a:0, why:'沒有可燃物,火就燒不下去。' },
    { q:'紙和木頭,哪一個先燒起來?', o:['紙','木頭','一樣快'], a:0, why:'紙比較薄、燃點低,先達到燃點。' }
  ];

  /* ── 題庫(三～六年級自然,格式沿用 q/o/a/why;★ v1.24.0 老師:採集題庫擴充到 200 題,主題＝採集各種有用的自然資源,不必與當前採集物有關;出題順序由 minigame_index.html 的 islQuizPick 控制=第一輪照本表順序 200 題不重複出完,第二輪起依 seed(uid|actId|輪次) 重新洗牌,選項每題即時打亂) ── */
  D.QUIZ = D.QUIZ || {};   /* ★ v1.1.0 改為不覆蓋(上方已放 P2 題庫) */
  D.QUIZ.gather = [
    { q:'植物的哪個部位負責從土裡吸收水分?', o:['根','葉','花','果實'], a:0, why:'根上有細細的根毛,能把土壤裡的水和養分吸進來。' },
    { q:'葉子是綠色的,是因為含有什麼?', o:['葉綠素','是因為葉子裡面含有糖分','是因為葉子裡面含有鹽分','是因為葉子裡面含有水分'], a:0, why:'葉綠素會吸收陽光,是植物製造養分的關鍵。' },
    { q:'植物行光合作用需要陽光、水,還有什麼?', o:['二氧化碳','還需要空氣裡的氧氣才行','還需要空氣裡的氮氣才行','需要肥沃濕潤的泥土才行'], a:0, why:'植物吸收二氧化碳製造養分,同時放出氧氣。' },
    { q:'植物的莖主要的工作是什麼?', o:['運送水分與養分','負責行光合作用來製造養分','負責從土壤裡吸收各種水分','負責把種子傳播到別的地方'], a:0, why:'莖裡面有維管束,像水管一樣把水和養分送到全身。' },
    { q:'花最重要的功能是什麼?', o:['繁殖後代','行光合作用','吸收水分','儲存養分'], a:0, why:'花授粉之後才會結成果實和種子。' },
    { q:'果實最主要的功能是什麼?', o:['保護並幫助傳播種子','吸收土壤裡的水分和各種養分','行光合作用,製造氧氣供人呼吸','把植物整株牢牢固定在土地上'], a:0, why:'果實包住種子,還能吸引動物幫忙把種子帶到遠方。' },
    { q:'下列哪一種我們吃的是「根」?', o:['胡蘿蔔','蘋果','高麗菜','玉米'], a:0, why:'胡蘿蔔吃的是把養分儲存起來的根。' },
    { q:'下列哪一種我們吃的是「莖」?', o:['馬鈴薯','我們吃的其實是它的葉子部位','我們吃的其實是它的果實部位','我們吃的其實是它的種子部位'], a:0, why:'馬鈴薯是長在地下的塊莖,不是根。' },
    { q:'下列哪一種我們吃的是「葉」?', o:['高麗菜','我們吃的其實是它的根部','我們吃的其實是它的莖部','我們吃的其實是它的果實'], a:0, why:'高麗菜是一層一層包起來的葉子。' },
    { q:'下列哪一種我們吃的是「花」?', o:['花椰菜','我們吃的其實是它的嫩芽部位','我們吃的其實是它的鱗莖部位','我們吃的其實是它的根部'], a:0, why:'花椰菜吃的是還沒開的花苞。' },
    { q:'採集野菜時,為什麼不要把整株連根拔起?', o:['留下根就能再長出新葉,以後還採得到','根上面沾滿了泥土,清洗起來非常麻煩','根長得又深又硬,整株拔起來很不容易','根帶著苦味,連根一起煮起來會變難吃'], a:0, why:'留根等於留下明年的收成,這是永續採集的基本原則。' },
    { q:'植物的莖葉會朝哪個方向生長?', o:['朝向光源','背對光源','一律向下','隨機亂長'], a:0, why:'這叫向光性,能讓葉子接到更多陽光。' },
    { q:'仙人掌的葉子變成刺,主要是為了什麼?', o:['減少水分散失','嚇走動物','比較漂亮','加強光合作用'], a:0, why:'沙漠缺水,針狀的葉子蒸散面積小,可以省水。' },
    { q:'水生植物的葉子常常又大又扁,浮在水面上,主要是為了?', o:['接到更多陽光並幫助呼吸','純粹是為了讓葉子看起來比較好看','浮在水面上可以擋住水裡的魚群','讓整片葉子的重量變得比較重一些'], a:0, why:'浮葉能曬到太陽,葉子背面的氣孔也方便交換空氣。' },
    { q:'採集嫩葉當野菜,通常哪個部位最嫩?', o:['莖的頂端新長出來的芽','是最靠近地面的那一圈老葉','是已經開始轉黃的那些葉子','是已經開過花之後的枝條'], a:0, why:'頂芽是最近才長出來的,纖維還沒變硬。' },
    { q:'咸豐草(鬼針草)的種子靠什麼傳播?', o:['黏在動物身上被帶走','完全靠風,把種子輕輕吹到遠方','跟著雨水,順著水流漂到別處','成熟之後自己彈開,把種子彈出去'], a:0, why:'它的種子有倒鉤,會勾住毛髮和衣服。' },
    { q:'蒲公英的種子靠什麼傳播?', o:['風','水','動物','彈力'], a:0, why:'冠毛像小降落傘,風一吹就飄很遠。' },
    { q:'海邊的林投果能漂到別的島上,是因為?', o:['果實輕、外皮防水會浮','林投果本身相當有份量、非常重','林投果會像魚一樣自己游過去','林投果身上長著像鳥一樣的翅膀'], a:0, why:'靠海水傳播的果實通常纖維多、能浮又耐鹽。' },
    { q:'鳳仙花的種子成熟時會怎麼傳播?', o:['果莢彈開把種子彈出去','完全依靠風,把種子輕輕吹到遠方','跟著雨水一起,順著水流漂到別處','靠螞蟻一顆一顆把種子搬運到別處'], a:0, why:'這叫彈力傳播,碰一下就啪地彈開。' },
    { q:'被鳥吃掉的果實,種子最後通常會?', o:['隨糞便排出,落在別的地方發芽','留在鳥的胃裡,慢慢發芽長成小樹','進到鳥的身體以後就完全消失不見','被鳥的身體吸收,變成鳥身上的羽毛'], a:0, why:'很多種子外殼很硬,不會被消化,還會得到一份天然肥料。' },
    { q:'種子要發芽,一定需要的三個條件是?', o:['水、空氣、適當的溫度','需要陽光、肥料,還有微風','需要肥料、土壤,加上陽光','需要有風、有陽光和聲音'], a:0, why:'多數種子發芽不必見光,但一定要水、空氣和合適溫度。' },
    { q:'為什麼種子外面通常包著硬硬的外皮?', o:['保護裡面的胚,避免乾掉或受傷','外皮的主要作用是增加種子的重量','外皮可以讓種子吃起來味道更香甜','外皮能幫種子進行光合作用來生長'], a:0, why:'種皮是種子的盔甲,等條件合適才會裂開。' },
    { q:'採集種子留著來年種,最好挑什麼樣的?', o:['成熟飽滿、沒有蟲蛀的','外皮還很青綠、尚未成熟的種子','已經被蟲咬過一口的那些種子','挑選當中顆粒最小最輕的種子'], a:0, why:'飽滿的種子養分足,發芽率比較高。' },
    { q:'採下來的種子要保存,最好放在?', o:['陰涼乾燥的地方','潮濕悶熱的地方','泡在水裡','太陽下直曬'], a:0, why:'受潮會發霉,太熱會讓種子失去活力。' },
    { q:'在荒島上,同一片野菜地連續天天採光,最可能的後果是?', o:['這片野菜會越來越少甚至消失','這片野菜反而會因此長得更快更多','這片野菜的葉子會因此變得更大片','天天採光對這片野菜完全沒有影響'], a:0, why:'採集要輪流換地方,讓植物有時間恢復。' },
    { q:'樹幹橫切面一圈一圈的紋路叫什麼?', o:['年輪','樹皮','葉脈','根毛'], a:0, why:'溫帶樹木每年大約長一圈,數年輪就知道樹齡。' },
    { q:'年輪比較寬的那一年,通常代表?', o:['雨水和陽光充足,長得快','那一年的天氣特別非常寒冷','那一年完全都曬不到陽光','那一年這棵樹生了一場病'], a:0, why:'生長條件好的年份,木頭長得多,年輪就寬。' },
    { q:'木材可以浮在水面上,是因為?', o:['木材的密度比水小','是因為木材本身相當有份量','是因為木材質地非常堅硬','是因為木材帶有特別的顏色'], a:0, why:'密度比水小的東西就會浮起來,所以能做木筏。' },
    { q:'剛砍下來的「生材」不適合馬上拿來蓋房子,主要原因是?', o:['含水量高,乾了會收縮變形','生材的顏色不好看,蓋起來不美觀','生材摸起來很輕,結構強度不夠','生材本身完全沒辦法拿來當柴火燒'], a:0, why:'木材要先陰乾,等水分散掉尺寸才穩定。' },
    { q:'用斧頭砍樹時,手握在斧柄尾端比較省力,這是因為?', o:['施力臂變長,槓桿比較省力','握在尾端之後,斧頭本身會變得更重','握在尾端之後,木頭會突然變得比較軟','握在尾端之後,手臂的力氣會憑空變大'], a:0, why:'槓桿原理:施力臂越長越省力。' },
    { q:'砍樹前先在樹幹兩側各砍一個缺口,主要目的是?', o:['控制樹倒下的方向,比較安全','先砍缺口可以讓這棵樹長得更快一點','先砍缺口能增加最後能取得的木材量','先砍缺口能讓樹皮變得比較容易剝下'], a:0, why:'先下的缺口決定倒向,能避開人和建築。' },
    { q:'同樣粗細的木頭,「硬木」和「軟木」相比通常?', o:['硬木比較重、比較耐用','其實硬木摸起來反而比較輕','兩種木頭的性質完全一模一樣','軟木一定會比硬木更加耐用'], a:0, why:'硬木密度高,適合做工具柄和樑柱。' },
    { q:'樹皮對樹木最主要的功用是?', o:['保護樹幹、減少水分散失與病蟲害','進行光合作用,替整棵樹製造出養分','從空氣中吸收水分,再送到樹根那裡','撐住樹枝的重量,樹枝才不會被壓斷'], a:0, why:'樹皮像皮膚,環狀剝光一圈樹就會死。' },
    { q:'在森林裡撿拾「枯枝」當柴火,最大的好處是?', o:['不必砍活樹,而且枯枝比較乾好燒','枯枝拿在手上,比新砍的樹枝還要重','枯枝表面比較粗糙,看起來比較漂亮','枯枝摸起來有黏液,其實帶著一點毒'], a:0, why:'含水量低的乾柴才容易點燃、煙也少。' },
    { q:'木炭比木柴更適合長時間烹煮,主要是因為?', o:['木炭燃燒溫度穩定、煙少','木炭這種材料,價格通常比較便宜','木炭拿在手上,重量比木柴還要輕','木炭比木柴更耐燒,不會很快燒完'], a:0, why:'木材悶燒去掉水分和雜質後就變成木炭。' },
    { q:'竹子長得快又中空,最適合拿來做什麼?', o:['水管、容器與支架','拿來磨成一把鋒利的石斧','拿來當作釣魚用的鉛錘','拿來當成生火用的火種石'], a:0, why:'中空又輕又直,是最好用的天然管材。' },
    { q:'採收竹筍最好的時機是?', o:['剛冒出地面不久、還很嫩的時候','等它已經完全長成一根竹子之後','等到竹子已經開花結果以後再採收','要專門挑寒冷會下雪的季節去採收'], a:0, why:'冒出太久的筍纖維變老,就不好吃了。' },
    { q:'為什麼漂流木常常比新砍的木頭好點燃?', o:['它已經被太陽曬乾,含水量低','它裡面含有油脂,點火的時候比較滑','它是最近才被沖上岸的,材質比較新','它比一般木頭重,搬起來特別有份量'], a:0, why:'不過泡過海水的漂流木含鹽,燃燒會有刺鼻味。' },
    { q:'鋸木頭時,順著木紋鋸和橫著木紋鋸,哪一種比較費力?', o:['橫著木紋鋸比較費力','其實是順著木紋鋸比較費力','兩種鋸法花的力氣完全一樣','要看當天的天氣狀況才能決定'], a:0, why:'橫斷要切斷纖維,順紋只是把纖維分開。' },
    { q:'木頭要做成堅固的木板,通常會先?', o:['把樹幹鋸成板材再陰乾壓平','直接把整根木頭拿去泡在水裡','木頭還沒鋸開就先拿去用火燒','把整根木頭直接埋進土裡等待'], a:0, why:'陰乾能讓水分慢慢散失,比較不會裂開。' },
    { q:'植物的「纖維」主要存在哪個部位,可以拿來搓繩子?', o:['莖或葉的維管束部分','開得五顏六色、吸引昆蟲的花瓣','吃起來甜甜軟軟、多汁的果肉部分','包在種子最裡面那一層胚的部分'], a:0, why:'維管束的纖維長又韌,是天然繩索的來源。' },
    { q:'把植物纖維搓成繩子時,為什麼要「扭轉」再合股?', o:['扭轉增加摩擦力,合股後更不容易散開','扭轉之後繩子看起來比較整齊也比較好看','扭轉可以讓繩子變短,收納時比較方便','扭轉會把纖維裡的水擠出來,繩子就變輕'], a:0, why:'兩股反向合起來會互相咬住,強度大增。' },
    { q:'要取得長又韌的纖維,通常會把植物莖泡在水裡一段時間,這叫?', o:['泡製脫膠,讓不要的組織腐爛剝落','漂白,把莖裡的顏色泡到變淡變白','染色,讓水裡的顏色慢慢吃進纖維','發酵成酒,讓莖裡的糖分變成酒精'], a:0, why:'軟組織爛掉後,剩下的就是好用的長纖維。' },
    { q:'林投的長葉子最適合拿來做什麼?', o:['編織蓆子、籃子與屋頂','直接拿來當三餐吃的主食','曬乾當作生火用的火種','敲一敲拿來做石器工具'], a:0, why:'葉緣有刺要先去掉,曬軟後就很好編。' },
    { q:'編織前把植物葉子先曬到半乾,主要原因是?', o:['減少日後收縮,編好才不會鬆掉','曬過之後顏色會變深,編出來更好看','曬過之後重量會增加,編起來更牢固','曬過之後味道會變香,聞起來更好吃'], a:0, why:'太濕的材料乾掉會縮,編織品就會鬆散變形。' },
    { q:'月桃的葉子在台灣常被拿來做什麼?', o:['包粽子、鋪蒸籠','拿來搓成一條堅固耐用的繩子','曬乾之後拿去燒成木炭使用','切成小段拿來當作釣魚的餌'], a:0, why:'月桃葉有香氣又耐熱,是傳統的天然包材。' },
    { q:'香蕉的假莖剝開後,可以取得什麼有用的材料?', o:['長纖維,能搓成繩子','可以燒出品質很好、耐燒的木炭','可以刮出黏稠、能點火用的樹脂','可以取出白白的、能調味的鹽巴'], a:0, why:'蕉麻類的纖維強韌又耐水,常用來做繩索。' },
    { q:'要做一張能承重的吊床,繩子最重要的性質是?', o:['抗拉強度大、不易斷','顏色鮮豔','很有彈性會一直伸長','很細很輕'], a:0, why:'承重看的是拉不斷的能力,太會延伸反而危險。' },
    { q:'藤本植物(如黃藤)為什麼常被拿來編籃子?', o:['又長又柔軟,泡水後可以彎曲','質地非常堅硬,完全沒辦法彎曲','放著不用管,自己就會變成籃子形狀','帶有天然的毒性,可以順便防蟲蛀'], a:0, why:'藤條泡水變軟,乾了又硬,定型後很耐用。' },
    { q:'天然纖維做的繩子泡水後通常會?', o:['吸水變重,強度可能下降','泡了水之後,繩子反而會變得更輕','泡水前後,繩子的狀態完全不受影響','泡了水以後,繩子會自動變長兩倍'], a:0, why:'所以繩索用完要晾乾,才不會發霉腐爛。' },
    { q:'要判斷一條自製繩子夠不夠牢,最合理的做法是?', o:['先用比預期更大的力量測試一次','不管三七二十一,直接拿來吊起重物','光用眼睛看繩子的顏色深淺來判斷','湊近聞一聞繩子的味道來判斷牢不牢'], a:0, why:'先在安全的地方試拉,是使用前必要的檢查。' },
    { q:'植物染色時,常加入明礬等「媒染劑」,目的是?', o:['讓顏色更牢固不易褪色','讓染好的布變得比較厚實','讓染好的布聞起來很香','讓染好的布碰到火不會燒'], a:0, why:'媒染劑能幫助色素牢牢附著在纖維上。' },
    { q:'棉花可以紡紗,用的是植物的哪一部分?', o:['種子上的細毛','是埋在土裡吸收養分的根部','是進行光合作用的葉子部分','是包在最外層保護樹幹的皮'], a:0, why:'棉纖維其實是包在種子外面的表皮毛。' },
    { q:'採集樹皮纖維時,為什麼不可以整圈剝下來?', o:['環狀剝皮會切斷輸送管道,樹會枯死','剝一整圈之後,樹皮的切口會慢慢變黑','整圈剝下來的纖維會比較短,不好使用','整圈的傷口會散發氣味,把蟲子引過來'], a:0, why:'只縱向取一部分,樹才有機會癒合活下來。' },
    { q:'用葉子編成屋頂時,由下往上一層層疊,主要目的是?', o:['讓雨水順著層層往下流,不會滲進屋內','這樣排起來比較整齊,屋頂看起來比較美','這樣可以少用一些葉子,把材料省下來','這樣屋頂會變重,風再大也不會被吹跑'], a:0, why:'像魚鱗一樣重疊,才能真正防雨。' },
    { q:'下列哪一種材料最適合當「引火的火種」?', o:['乾燥的細草絮或棕櫚纖維','剛從樹上摘下來、還帶著水分的綠葉','外表濕答答、還沒曬乾的一片樹皮','隨手撿起的一顆普通石頭'], a:0, why:'火種要細、乾、鬆,才容易被火星點燃。' },
    { q:'要把粗的植物纖維變細變軟,常用的方法是?', o:['用木棒反覆敲打','把整把纖維丟進油裡浸泡','直接放進火堆裡烤一烤','在纖維表面均勻撒上一層鹽'], a:0, why:'敲打能把纖維束打散,變成可以搓捻的細絲。' },
    { q:'在野外撿到一段看起來很堅固的木頭,要做工具柄前應先?', o:['檢查有沒有裂縫或蟲蛀','什麼都不檢查,直接就拿來使用','先拿去泡在水裡整整一天','在木頭表面塗上厚厚的泥巴'], a:0, why:'有裂縫的木頭在出力時可能突然斷裂,很危險。' },
    { q:'為什麼取用樹脂(松脂)可以幫助生火?', o:['樹脂是可燃的油性物質,容易點燃又耐燒','樹脂其實是樹吸上來的水,沾濕了更好點','樹脂碰到火會先降低溫度,火才能燒得更久','樹脂本身不會燃燒,只是把火固定在木頭'], a:0, why:'松脂沾在火種上,即使有點潮濕也點得著。' },
    { q:'採集蘆葦或芒草的桿子,最適合做什麼?', o:['編蓆子、做箭桿或屋頂材料','打造斧頭的刃口,用來砍倒大樹','磨成鋒利的石刀,用來切割東西','彎成堅固的魚鉤,用來釣大魚'], a:0, why:'中空又直的桿子輕巧好加工。' },
    { q:'大片的葉子在野外最實用的用途之一是?', o:['當臨時容器或雨具','劈開曬乾之後拿來當柴火主力','撕成細條之後拿來當作繩索','敲一敲拿來當作石器的材料'], a:0, why:'厚而不易破的葉子折一折就能盛水。' },
    { q:'採集植物做材料時,先「少量試用」的理由是?', o:['確認材料合用,避免浪費一大片資源','這樣做會讓工作慢下來,比較不會太累','先試一點點可以增加難度,比較好玩','其實沒有理由,一次全部採完也一樣'], a:0, why:'先試再大量採,是野外資源管理的好習慣。' },
    { q:'下列哪一種情況最適合大量採收草類纖維?', o:['植株成熟、還沒開始腐爛時','選在草才剛剛冒出新芽的時候','選在草開花結果、快要枯黃腐爛時','特地挑颳風下大雨的那一天'], a:0, why:'成熟時纖維最長最強,腐爛後就沒有強度了。' },
    { q:'把繩子的末端用火稍微燒一下或綁緊,目的是?', o:['防止末端鬆散開來','燒過之後可以讓繩子變得更長','燒過之後會增加繩子的重量','燒過之後繩子的顏色會改變'], a:0, why:'收尾處理能大幅延長繩子的壽命。' },
    { q:'在森林裡採集時,背著寬口的籃子而不是袋子,好處是?', o:['東西不容易被壓壞,也方便隨手放進去','籃子比布袋輕很多,背起來完全不覺得重','籃子比布袋便宜,壞掉了也能隨時再編','籃子比布袋防水,下雨天裡面完全不會濕'], a:0, why:'硬殼的籃子能保護果實和嫩葉不被壓爛。' },
    { q:'為什麼採集到的材料最好分類存放?', o:['避免潮的乾的混在一起發霉,也好找','分類整齊之後,同樣的空間能放更多','分開放之後,材料的重量會變得比較輕','其實沒有必要,全部堆在一起也一樣'], a:0, why:'分類保存能大幅減少浪費。' },
    { q:'木頭的接合處用繩子綁時,「十字纏繞」比隨便繞好,因為?', o:['受力平均、比較不會鬆脫','纏成十字形,綁起來的速度比較快','纏成十字形,可以省下不少繩子','纏成十字形,看起來比較整齊好看'], a:0, why:'傳統的綁紮法是靠交叉纏繞把兩根木頭鎖住。' },
    { q:'要判斷一棵樹是不是已經枯死,最可靠的觀察是?', o:['樹皮剝落、樹枝乾脆易折且沒有新芽','樹幹長得特別粗,比旁邊的樹都還要粗','這棵樹長得非常高,高過周圍所有的樹','樹上的葉子還是綠的,而且長得很茂密'], a:0, why:'枯木適合當柴,但也可能不穩,砍伐要小心。' },
    { q:'下列哪一項是「可再生」的自然資源?', o:['樹木','石油','鐵礦','煤炭'], a:0, why:'樹木可以再種再長,礦物和化石燃料則用完就沒了。' },
    { q:'採集時遵守「只取需要的量」,最重要的理由是?', o:['讓資源有時間恢復,以後還能繼續採','這樣採起來比較累,才算是認真工作','留一點下來,別人就採不到自己贏了','其實沒有什麼理由,想採多少都可以'], a:0, why:'永續利用的核心就是不把資源一次用光。' },
    { q:'把採到的材料立刻做記號或記錄地點,好處是?', o:['下次能更快找到同樣的資源','做了記號之後,材料的數量會變多','做了記號之後,材料會變得比較輕','做記號單純只是好玩,沒有別的好處'], a:0, why:'野外記錄是很重要的科學習慣。' },
    { q:'在野外取水,下列哪一種來源通常最乾淨?', o:['山壁流出的泉水','靜止的水窪','靠近營地的水溝','海水'], a:0, why:'流動又剛從地下冒出的水,受污染的機會最小。' },
    { q:'野外取到的水即使看起來很清,為什麼還是要煮沸?', o:['清澈的水仍可能含有看不見的細菌','煮過的水喝起來比較順口也比較甘','水煮過以後會變甜,喝起來比較舒服','水煮過以後體積變多,可以喝比較久'], a:0, why:'微生物用肉眼看不見,加熱才能殺死。' },
    { q:'把水煮沸消毒,一般要維持沸騰多久比較保險?', o:['至少一分鐘以上','一秒就好','只要冒泡就關火','不用沸騰'], a:0, why:'持續沸騰才能確保大部分病原被殺死。' },
    { q:'用沙子、小石子和木炭層層堆疊做的簡易濾水器,木炭的作用是?', o:['吸附異味和部分雜質','木炭主要的作用是增加整體重量','木炭能讓濾出來的水變得更甜','木炭能把水裡所有細菌統統殺死'], a:0, why:'木炭表面有很多孔洞,能吸附雜質,但不能取代煮沸。' },
    { q:'簡易濾水器由上到下的順序,最合理的是?', o:['粗石子在上、細沙在下','細沙在上、粗石子在下','全部用細沙','全部用大石頭'], a:0, why:'先擋大顆粒再過濾細顆粒,濾層才不會馬上堵住。' },
    { q:'海水不能直接喝,主要原因是?', o:['鹽分太高,喝了反而更缺水','海水的溫度太冰,喝下去容易感冒','海水帶著濃濃的魚腥味,喝了會想吐','海水的顏色看起來不太對勁,不能喝'], a:0, why:'身體排掉多餘的鹽會用掉更多水分。' },
    { q:'利用太陽把海水變成淡水,靠的是什麼原理?', o:['蒸發後凝結,鹽留在原處','用細密的布把海水裡的鹽粒過濾掉','把海水放進冰塊裡冷凍讓鹽分離開','把海水拿去燃燒讓鹽分被燒掉不見'], a:0, why:'水會蒸發,鹽不會,這就是蒸餾。' },
    { q:'在地上挖坑、蓋透明布、中央壓一顆石頭的「太陽能蒸餾器」,水會?', o:['蒸發後在布上凝結,順著往中央滴下','直接蒸發到空氣裡不見,什麼也不剩','往下滲進土裡,被泥土整個都吸收掉','在布底下結成冰,等太陽下山才融化'], a:0, why:'溫差讓水氣在薄膜下方凝成水珠再集中滴落。' },
    { q:'清晨在葉子上收集露水,利用的是什麼現象?', o:['空氣中的水氣遇冷凝結','是植物在流汗,把水分排到葉子表面','是昨天晚上下的雨,還沒完全流走','是地底下的地下水,慢慢往上冒出'], a:0, why:'夜間地表降溫,水氣凝結成露。' },
    { q:'下雨時收集雨水,最合適的容器口形狀是?', o:['開口大而淺的容器','開口非常小的一支細長瓶子','整個完全密封起來的箱子','底部破了一個洞的舊桶子'], a:0, why:'承接面積越大,收到的雨水越多。' },
    { q:'竹筒剖半可以做成引水的水道,是利用竹子的什麼特性?', o:['中空且節與節之間不漏水','竹子拿在手上,比同樣粗的木頭還重','竹子在黑暗中會發出微微的亮光','竹子的莖裡含有讓人中毒的成分'], a:0, why:'去掉竹節就成了一條天然水管。' },
    { q:'要把水從高處引到低處,不需要任何動力,是因為?', o:['水會因重力往低處流','是因為水會自己找到路走','是因為水的重量比空氣還輕','是因為水本身帶有磁性'], a:0, why:'只要一路往下有坡度,水就會自己流。' },
    { q:'虹吸管能把水從容器裡引出來,前提是?', o:['出水口要比水面低','出水口要比水面高','管子要很短','水要很熱'], a:0, why:'靠高度差產生的壓力差把水抽出來。' },
    { q:'靠近河流的下游取水,通常比上游髒,原因是?', o:['沿途會匯入更多泥沙和污染','下游的水流量,其實比上游還要少','下游的水溫,通常會比上游還要冷','下游那一段河道,通常沒有魚可看'], a:0, why:'所以取水盡量往上游走。' },
    { q:'在營地附近挖井時,為什麼廁所要離水源很遠?', o:['避免污水滲入地下污染水源','廁所離得遠一點,走過去比較好走','廁所離得遠一點,附近會比較涼快','其實沒有特別的理由,純粹是習慣'], a:0, why:'污染物會隨地下水移動,距離是最基本的保護。' },
    { q:'水裡有泥沙時,先「靜置沉澱」再取上層的水,利用的是?', o:['泥沙比水重會沉到底部','泥沙放久了會自己慢慢蒸發','泥沙碰到水就會整個溶解掉','泥沙其實比水還輕,會浮起來'], a:0, why:'沉澱是過濾前很有效的第一步。' },
    { q:'野外的水如果有很重的異味或油光,應該?', o:['不要飲用,另找水源','先簡單煮一下,煮過就能喝','加一點鹽進去調味後再喝','用布隨便過濾一次就可以喝'], a:0, why:'煮沸殺得死細菌,卻去不掉化學污染。' },
    { q:'裝水的容器用完後倒扣晾乾,主要是為了?', o:['避免殘水滋生細菌與發霉','倒扣著晾乾,看起來比較整齊好看','倒扣晾乾之後,容器會變得更堅硬','倒扣晾乾可以順便增加容器的容量'], a:0, why:'保持乾燥是容器保養的關鍵。' },
    { q:'岩石依成因主要分成三大類,下列何者正確?', o:['火成岩、沉積岩、變質岩','黑岩、白岩、灰岩三大類','硬岩、軟岩、中岩三大類','海岩、山岩、河岩三大類'], a:0, why:'這是地球科學最基本的岩石分類。' },
    { q:'岩漿冷卻凝固形成的岩石叫什麼?', o:['火成岩','沉積岩','變質岩','化石岩'], a:0, why:'冷卻速度快慢會影響結晶顆粒的大小。' },
    { q:'由泥沙一層層堆積壓實形成的岩石是?', o:['沉積岩','火成岩','花崗岩','玄武岩'], a:0, why:'沉積岩常有明顯的層理,也最容易找到化石。' },
    { q:'化石最常在哪一類岩石中被發現?', o:['沉積岩','火成岩','變質岩','玻璃'], a:0, why:'只有慢慢堆積的環境才保得住生物遺骸。' },
    { q:'要把石頭敲成有鋒利邊緣的石器,最適合選哪一種石材?', o:['質地細密、敲擊會產生貝殼狀斷口的石頭','顆粒鬆散、用手一搓就會掉下沙的砂岩塊','摸起來軟軟的、曬乾之後就會裂開的泥球','表面已經風化、一敲就會層層剝落的石片'], a:0, why:'燧石之類的石材斷口鋒利,是石器時代的首選。' },
    { q:'敲擊石頭做石器時,一定要注意什麼安全事項?', o:['保護眼睛,避免碎片飛濺','要躲到光線很暗的地方進行敲擊','敲擊的時候絕對不可以戴手套','要對著旁邊的人練習瞄準敲擊'], a:0, why:'飛石碎片非常銳利,護目是第一要務。' },
    { q:'磨製石斧比敲製石斧更費工,但好處是?', o:['刀刃更平整耐用,不易崩裂','磨出來的石斧,拿在手上比較輕','磨製的步驟比敲製還要快、還省工','磨出來的石斧材料成本比較便宜'], a:0, why:'新石器時代的磨製技術讓工具壽命大幅延長。' },
    { q:'河床上的鵝卵石為什麼大多是圓的?', o:['被水流長期搬運磨去稜角','這種石頭本來天生長出來就是圓的','是被太陽長期曝曬之後曬成圓形','是被河裡的動物一顆一顆咬成圓形'], a:0, why:'搬運距離越遠,石頭通常越圓越小。' },
    { q:'要判斷兩種礦物誰比較硬,最簡單的野外方法是?', o:['互相刮刮看,刮傷對方的比較硬','放在手上比比看,比較重的那個比較硬','看顏色深淺,顏色比較深的那個比較硬','比大小,體積比較大的那一顆比較硬'], a:0, why:'這就是莫氏硬度的刮痕比較法。' },
    { q:'鐵礦石要變成可用的鐵,必須經過什麼過程?', o:['高溫冶煉把鐵從礦石中還原出來','用大量的水反覆沖洗,把泥沙洗乾淨','放在太陽底下曬乾,水分蒸發就好','用石頭把礦石敲碎,敲得夠細就能用'], a:0, why:'冶煉需要高溫和還原劑,通常是木炭。' },
    { q:'石灰岩遇到酸會冒泡,是因為產生了什麼氣體?', o:['二氧化碳','冒出來的其實是氧氣','冒出來的其實是氫氣','冒出來的其實是氮氣'], a:0, why:'碳酸鈣和酸反應會放出二氧化碳。' },
    { q:'鐘乳石和石筍是怎麼形成的?', o:['含碳酸鈣的水滴長年沉積','是地底下的火山噴發出來堆積的','是很久以前的人特地雕刻出來的','是洞裡的動物一點一點堆積出來的'], a:0, why:'一滴一滴累積上千年才長幾公分。' },
    { q:'玄武岩在台灣澎湖常見的特殊外形是?', o:['柱狀節理','常見的外形是一顆顆圓球狀','常見的外形是像樹枝一樣分岔','常見的外形是一片一片的薄片'], a:0, why:'熔岩冷卻收縮時裂開,形成六角柱。' },
    { q:'大理岩是由哪一種岩石變質而來?', o:['石灰岩','花崗岩','玄武岩','砂岩'], a:0, why:'高溫高壓讓石灰岩重新結晶就成了大理岩。' },
    { q:'台灣東部太魯閣峽谷主要的岩石是?', o:['大理岩','玄武岩','砂岩','頁岩'], a:0, why:'堅硬的大理岩加上河流下切,才形成深峻的峽谷。' },
    { q:'採集石材時挑選「沒有裂縫」的石頭,原因是?', o:['有裂縫的石頭受力時容易整塊碎掉','裂縫裡跑進水氣之後,石頭就會生鏽','有裂縫的石頭重量比較重,搬起來費力','裂縫會讓石頭的顏色看起來髒髒的'], a:0, why:'結構完整的石頭才安全耐用。' },
    { q:'石頭圍成的爐灶要避免使用溪邊「含水的石頭」,因為?', o:['內部水分受熱膨脹可能使石頭爆裂','石頭碰到火會先融化,流得到處都是','溪邊的石頭帶著腥味,加熱後會發臭','石頭裡的水被烤乾以後,整顆會變輕'], a:0, why:'封閉孔隙中的水變成蒸氣,壓力會把石頭崩開。' },
    { q:'砂子的主要成分通常是?', o:['石英','鐵','鹽','木頭'], a:0, why:'石英很硬又耐風化,所以在沙灘上大量留下來。' },
    { q:'黏土可以拿來做陶器,是因為它有什麼特性?', o:['加水後可塑,燒過之後變硬','黏土天生質地就非常堅硬耐用','黏土加水之後會微微發出亮光','黏土碰到水之後很快就會溶解'], a:0, why:'陶土在高溫下產生變化,永久定型。' },
    { q:'土壤中最適合植物生長的通常是?', o:['富含腐植質、排水又保水的壤土','顆粒粗大、水一澆就全部漏光的純沙','又細又黏、下過雨會積水的純黏土','幾乎都是小石子、不含養分的石礫'], a:0, why:'壤土兼具通氣、保水和養分。' },
    { q:'落葉堆積腐爛後變成腐植質,對土壤的好處是?', o:['增加養分並改善土壤結構','腐植質會讓整片土壤變得又乾又硬','腐植質會讓土壤變酸到無法耕種','其實腐植質對土壤沒有任何好處'], a:0, why:'分解者把落葉變成植物能吸收的養分。' },
    { q:'堆肥需要哪些條件才會順利分解?', o:['空氣、水分和適當溫度','要完全密封起來,不能透空氣','材料要保持完全乾燥的狀態','要把堆肥整個放進冰箱冷藏'], a:0, why:'好氧分解需要翻堆通氣,才不會發臭。' },
    { q:'蚯蚓對土壤最大的貢獻是?', o:['鑽洞讓土壤通氣,排遺又能增加養分','牠把土裡的害蟲和蟲卵全部吃得乾乾淨淨','牠在土裡呼吸時會製造氧氣給植物的根','牠能把空氣中的氮固定下來變成肥料'], a:0, why:'蚯蚓被稱為大地的犁。' },
    { q:'採集後把落葉鋪回地面(覆蓋),主要好處是?', o:['保濕、抑制雜草並慢慢補充養分','把土壓得更緊實,地面才不會鬆軟','吸引更多蟲子過來,土裡就熱鬧了','反射更多陽光,讓植物照到更多光'], a:0, why:'覆蓋層像替土壤蓋被子。' },
    { q:'野外採集菇類,最安全的原則是?', o:['不確定的一律不採不吃','要挑顏色鮮豔的才不能吃','只要被蟲咬過的就代表安全','只要拿去煮過就一定安全'], a:0, why:'有些劇毒菇煮不壞,也照樣有蟲吃。' },
    { q:'菇類在生態系中扮演的角色主要是?', o:['分解者,把枯枝落葉分解回土壤','生產者,靠著陽光自己製造養分','消費者,專門吃別的動物來維生','掠食者,會主動獵捕小型的昆蟲'], a:0, why:'真菌和細菌一起讓物質循環得以完成。' },
    { q:'菇類不能自己行光合作用,因為它?', o:['沒有葉綠素','是因為菇類完全沒有根部','是因為菇類體內缺乏水分','是因為菇類的體型太小了'], a:0, why:'所以真菌得靠分解現成的有機物過活。' },
    { q:'木耳、香菇這類真菌喜歡什麼環境?', o:['陰涼潮濕、有腐木的地方','整天曝曬在太陽下的乾燥岩石','鹹度很高、充滿鹽分的海水裡','又乾又熱、四處是沙子的沙漠'], a:0, why:'所以雨後的林下是尋找食用菌的時機。' },
    { q:'台灣的螢光蕈會發光,這種現象稱為?', o:['生物發光','光合作用','反射陽光','燃燒'], a:0, why:'體內的化學反應把化學能轉成光能。' },
    { q:'食物發霉了,最正確的處理是?', o:['整個丟棄不要吃','把發霉部分切掉吃剩下的','煮過再吃','曬乾再吃'], a:0, why:'看不見的菌絲和毒素早已擴散到整塊食物。' },
    { q:'把食物曬乾可以保存比較久,原因是?', o:['水分少,細菌和黴菌不容易繁殖','太陽底下曝曬,能把所有的蟲都曬死','曬乾之後的食物,重量反而會變重','食物曬乾以後,吃起來會變得比較甜'], a:0, why:'脫水是最古老也最有效的保存法之一。' },
    { q:'用鹽醃漬保存食物的原理是?', o:['高濃度的鹽讓微生物脫水而無法繁殖','鹽灑上去之後,會讓食物慢慢被加熱變熟','鹽可以把食物上所有的病毒都殺光光','鹽灑上去之後,會讓食物的含水量增加'], a:0, why:'滲透壓把微生物體內的水分吸走。' },
    { q:'海水曬鹽的原理是?', o:['水分蒸發後鹽結晶留下','鹽粒其實會自己慢慢浮上水面','鹽粒是被細密的布慢慢過濾出來','鹽粒本身比水重,會慢慢往下沉'], a:0, why:'日曬鹽田就是一層層的蒸發池。' },
    { q:'退潮時最適合到潮間帶採集,是因為?', o:['原本被海水覆蓋的地方露出來','退潮的時候海水比平常還要更深','退潮時海浪特別大,容易沖上東西','退潮時太陽比較熱,生物會跑出來'], a:0, why:'但一定要注意漲潮時間,避免被困住。' },
    { q:'在潮間帶採集時最重要的安全注意事項是?', o:['注意漲潮時間與腳下濕滑','穿著寬鬆的拖鞋走起來比較方便','一個人單獨去採集動作比較快','特地挑晚上出發,因為比較涼快'], a:0, why:'海邊意外多半發生在忽略潮汐的時候。' },
    { q:'海藻在海裡扮演的角色主要是?', o:['生產者,行光合作用並提供氧氣','分解者,把海裡的屍體分解乾淨','掠食者,會捕捉小魚和浮游生物','寄生者,吸附在大魚身上吸養分'], a:0, why:'海藻是海洋食物網的基礎之一。' },
    { q:'採海藻時把固定在岩石上的部分留下,好處是?', o:['它還能再長出新的藻體','留下固定的部分,比較容易採下來','留下固定的部分,吃起來比較好吃','留下固定的部分,搬起來比較輕鬆'], a:0, why:'只採上段等於留下再生的能力。' },
    { q:'在海邊撿到空的貝殼,最適合拿來做什麼?', o:['容器、刮刀或裝飾','劈開曬乾之後,拿來當柴火燒','磨得又細又長,拿來搓成繩子','敲碎磨成粉,拿來當水泥使用'], a:0, why:'貝殼邊緣磨利後是很好用的刮削工具。' },
    { q:'貝殼的主要成分和石灰岩相同,是?', o:['碳酸鈣','主要成分其實是鐵','主要成分其實是矽','主要成分其實是鹽'], a:0, why:'所以燒過的貝殼也能做成石灰。' },
    { q:'撿拾漂流木前要先檢查什麼?', o:['有沒有釘子、繩索或腐爛','先看看木頭的顏色深不深、好不好看','先湊近聞一聞木頭有沒有特別的味道','先量一量木頭的長度到底夠不夠用'], a:0, why:'海漂物常夾帶危險物品,處理要小心。' },
    { q:'海邊的沙灘地形常隨季節改變,主要的作用力是?', o:['海浪與潮流的搬運','是地底下發生地震所造成的','是各種動物在沙灘上挖洞造成的','是沙灘上的植物生長所造成的'], a:0, why:'冬夏浪況不同,沙灘會變胖變瘦。' },
    { q:'珊瑚礁看起來像石頭,其實是?', o:['珊瑚蟲分泌的碳酸鈣骨骼堆積而成','海底的岩漿冷卻凝固後形成的岩石','一種會開花結果、長在海裡的植物','很久以前的人在海底建造堆疊出來的'], a:0, why:'活珊瑚是動物,採集會破壞整個生態系。' },
    { q:'為什麼不應該採集活珊瑚?', o:['它生長極慢,是許多海洋生物的家','它非常重,搬運起來實在相當不方便','它會咬人,靠近的時候很容易受傷','它一點用處也沒有,撿回去也是浪費'], a:0, why:'珊瑚礁孕育了大約四分之一的海洋物種。' },
    { q:'在海邊撿到的東西沾了海水,使用前最好?', o:['用淡水沖洗並晾乾,避免鹽分腐蝕','直接拿來使用,沾到海水也沒有關係','繼續泡在海水裡,免得乾掉之後變脆','在表面塗上一層油,把海水鎖在裡面'], a:0, why:'殘留的鹽會加速金屬生鏽、也讓木頭發霉。' },
    { q:'台灣常見的陸蟹會在特定季節集體到海邊,主要是為了?', o:['把卵釋放到海裡繁殖','沿路尋找食物,順便換個環境','海邊比較涼,躲避炎熱的太陽','準備遷徙到比較溫暖的地方過冬'], a:0, why:'所以那段期間要特別避免干擾與路殺。' },
    { q:'採集海邊資源時遵守「不採小、不採懷卵」的原則,是為了?', o:['讓族群能持續繁衍','這樣採起來會比平常還要更順手','懷卵的個體吃起來反而比較美味','這樣做能讓帶回去的重量減輕一些'], a:0, why:'留下未成熟與懷卵個體,資源才不會枯竭。' },
    { q:'要在沙灘上找到淡水,最可能的地點是?', o:['靠近陸地、沙丘後方地勢較低處','海浪不停拍打、經常被打濕的地方','露出水面、佈滿礁石的岩岸地帶','整片沙灘裡地勢最高的那座沙丘頂'], a:0, why:'雨水下滲後會浮在較重的海水之上。' },
    { q:'海邊的植物常有厚厚的葉子或蠟質表面,是為了?', o:['減少水分散失並抵抗鹽分','厚厚的表面是特地用來吸引昆蟲','葉子變厚是為了增加整體的重量','讓葉子行光合作用的速度更快'], a:0, why:'這是耐鹽耐風的海濱植物典型構造。' },
    { q:'在礁岩上行走時穿防滑鞋,主要是因為?', o:['岩石上的藻類非常濕滑','礁岩被太陽曬過,摸起來非常燙','礁岩的質地偏軟,踩下去會凹陷','礁岩上常帶著一些讓人不舒服的毒'], a:0, why:'滑倒加上尖銳的礁岩,是常見的受傷原因。' },
    { q:'台灣特有的「台灣萍蓬草」生長在什麼環境?', o:['水池或濕地','是生長在高山上的岩壁縫隙','是生長在乾燥缺水的沙漠裡','是生長在鹹鹹的海水裡面'], a:0, why:'它是台灣特有的水生植物,對水質很敏感。' },
    { q:'台灣的「艾草」自古被拿來做什麼?', o:['驅蟲、做草仔粿與泡澡','是拿來釀酒時最主要的原料','曬乾之後拿來搓成一條條的繩子','敲一敲拿來當作石器的材料'], a:0, why:'端午掛艾草是台灣常見的民俗。' },
    { q:'台灣原住民常用的「小米」屬於哪一類作物?', o:['禾本科的穀類','是屬於豆類的一種農作物','是屬於根莖類的一種作物','是屬於水果類的一種作物'], a:0, why:'小米耐旱,是山田燒墾的重要作物。' },
    { q:'台灣的「構樹」樹皮自古被拿來做什麼?', o:['製作樹皮布','拿去燒成一塊塊的木炭','拿來當作釀酒的原料','敲一敲拿來做石器工具'], a:0, why:'南島民族的樹皮布文化和構樹關係密切。' },
    { q:'台灣的「樟樹」最有名的產物是?', o:['樟腦','橡膠','蜂蜜','棉花'], a:0, why:'日治時期台灣樟腦產量曾居世界第一。' },
    { q:'台灣的「月桃」屬於哪一類植物?', o:['薑科','禾本科','豆科','蕨類'], a:0, why:'月桃的葉鞘曬乾後可以編蓆編籃。' },
    { q:'台灣的「林投」常生長在什麼地方?', o:['海岸沙地','高山針葉林','水田','洞穴'], a:0, why:'它耐鹽耐風,是重要的海岸防風植物。' },
    { q:'台灣的「苦花魚」(鯝魚)喜歡生活在?', o:['乾淨清涼的溪流中上游','河流注入大海、鹹淡水交會的出海口','水流不動、堆滿爛泥巴的水池底部','水很深、光線很暗的湖泊最深處'], a:0, why:'牠會刮食石頭上的藻類,是溪流健康的指標。' },
    { q:'台灣的「環頸雉」主要在哪裡活動?', o:['草生地與農田','主要活動範圍是深深的海底','主要活動範圍是高山的雪地','主要活動範圍是密閉的樹洞裡'], a:0, why:'牠是台灣特有亞種,棲地減少讓數量下降。' },
    { q:'台灣的「長鬃山羊」是唯一的野生什麼動物?', o:['牛科動物','貓科動物','犬科動物','猴科動物'], a:0, why:'牠能在陡峭岩壁上行走,是台灣特有亞種。' },
    { q:'台灣的「領角鴞」屬於什麼鳥類?', o:['夜行性猛禽','水鳥','候鳥中的雁鴨','走禽'], a:0, why:'牠們晚上獵捕鼠類,是農田的好幫手。' },
    { q:'台灣的「歐亞水獺」目前主要分布在?', o:['金門','台北市區','蘭嶼','玉山山頂'], a:0, why:'台灣本島的水獺已幾乎消失,金門是最後據點。' },
    { q:'溪流中出現大量「藻類暴長」,通常代表?', o:['水中養分過多,可能受到污染','這條溪流的水質其實非常乾淨清澈','這條溪流目前的水溫太低,藻類喜歡','這條溪流的水流速度太快,藻類卡住'], a:0, why:'優養化會讓水中氧氣被耗盡。' },
    { q:'生態系中的「生產者」指的是?', o:['能自己製造養分的綠色植物與藻類','專門靠吃植物維生長大的草食性動物','負責把動植物屍體慢慢分解掉的細菌','會主動獵捕其他動物來吃的肉食動物'], a:0, why:'生產者是所有食物鏈的起點。' },
    { q:'食物鏈中,能量從一階傳到下一階時通常?', o:['大部分損失掉,只有少部分被利用','完全保留下來,一點一滴都不會減少','反而會增加,越上層的能量就越多','完全不會改變,每一階的能量都一樣'], a:0, why:'所以越上層的消費者數量越少。' },
    { q:'外來種入侵對本地生態最大的威脅是?', o:['競爭資源或捕食本地物種,破壞原有平衡','會讓島上的風景變得好看、物種更加豐富','會製造出比本地植物更多的氧氣給大家用','其實對本地原有的生態完全沒有任何影響'], a:0, why:'缺乏天敵的外來種常常大量繁殖。' },
    { q:'採集野外植物時發現是保育類,應該?', o:['不採集,只觀察或拍照記錄','反正只採一點點,應該沒什麼關係','看到就整片全部採光帶回營地','挖起來移植到自己的營地裡養'], a:0, why:'保育類動植物受法律保護,採集是違法的。' },
    { q:'生物多樣性越高的環境,通常?', o:['越穩定、越能承受環境變化','反而越容易在小小的變化下就崩潰','裡面能生存的生物種類反而越少','環境的健康狀況通常反而比較不好'], a:0, why:'多樣性像分散風險,環境抵抗力更強。' },
    { q:'在荒島上發現不認識的鮮豔漿果,應該?', o:['不要吃,先找確定可食的食物','看到紅色的漿果,就可以放心吃下','看到黃色的漿果,吃起來一定安全','漿果長得越漂亮,通常代表越安全'], a:0, why:'顏色和毒性沒有固定關係,不認識就不吃。' },
    { q:'野外辨識植物時,最可靠的做法是?', o:['綜合葉、莖、花、果與生長環境一起判斷','只要把葉子的形狀看清楚,就能完全確定是哪種','只要聞一聞味道,馬上就分辨得出來是哪一種','只要看清楚花和果實的顏色,就一定不會認錯'], a:0, why:'單一特徵常常會誤判成相似的有毒植物。' },
    { q:'觸摸到不認識的植物汁液後應該?', o:['盡快用清水沖洗,避免接觸眼睛','隨便用手抹一抹,擦掉就沒事了','放到嘴裡舔一舔,嚐嚐是什麼味道','塗抹在另一塊皮膚上,測試看看'], a:0, why:'有些植物汁液具刺激性,會造成灼傷或過敏。' },
    { q:'採集時穿長袖長褲的主要理由是?', o:['避免割傷、蟲咬與植物刺激','穿起來比較保暖,不容易著涼感冒','長袖長褲穿起來,看起來比較好看','長袖長褲的布料通常比較輕、透氣'], a:0, why:'適當的裝備是野外安全的第一層防護。' },
    { q:'搬開石頭或倒木採集時,正確的姿勢是?', o:['從遠離自己的一側掀開','直接把手伸進石頭底下的縫隙','把臉湊近貼著石頭仔細看','抬起腳直接把石頭踢開'], a:0, why:'把石頭當成盾牌,避免驚動底下的蛇或蜂。' },
    { q:'在森林中判斷方向,比較可靠的方式是?', o:['用指北針並搭配地形地圖','只憑樹幹上長的青苔位置來判斷','只看樹枝生長的方向來判斷','完全憑直覺感覺,用猜的決定'], a:0, why:'青苔只受濕度影響,不能當作可靠的方位指標。' },
    { q:'蜂蜜是蜜蜂由什麼製造的?', o:['花蜜','花粉','樹汁','露水'], a:0, why:'蜜蜂把花蜜帶回巢,經過酵素轉化和脫水才成蜜。' },
    { q:'蜂蜜能長期保存不腐壞,主要是因為?', o:['含水量低、糖分高,微生物不易生長','蜜蜂會在蜂蜜裡加入天然的防腐成分','蜂蜜採收之後都經過了高溫殺菌處理','只要把罐子密封好,放多久都不會壞'], a:0, why:'高糖環境的滲透壓讓細菌無法繁殖。' },
    { q:'採蜂蜜時用煙霧,原因是?', o:['煙會讓蜜蜂較不具攻擊性','煙霧噴過去可以直接殺死蜜蜂','煙霧的作用是讓蜂蜜變得更甜','煙霧主要是用來照亮蜂巢內部'], a:0, why:'但仍要穿防護裝備,不可徒手取蜜。' },
    { q:'蜜蜂對人類農業最大的貢獻是?', o:['幫農作物授粉','蜜蜂主要的貢獻是製造木材','蜜蜂主要的貢獻是吃掉雜草','蜜蜂主要的貢獻是幫忙鬆土'], a:0, why:'許多果樹的收成都依賴昆蟲授粉。' },
    { q:'鳥類的羽毛具有保暖效果,主要因為?', o:['羽絨中間困住了大量空氣','羽毛本身摸起來相當有份量、很重','羽毛的表面碰到熱源會自己發熱','羽毛表面帶著一層天然的油,防水'], a:0, why:'靜止的空氣是很好的隔熱層。' },
    { q:'採集鳥蛋是不被允許的行為,主要理由是?', o:['會直接減少野生鳥類的族群數量','野鳥的蛋腥味很重,其實一點都不好吃','鳥蛋又重又佔空間,帶回營地很麻煩','鳥蛋放不了幾天就會壞掉,帶回也浪費'], a:0, why:'許多野生鳥類受法律保護。' },
    { q:'動物的骨頭在野外可以拿來做什麼?', o:['磨成針、魚鉤或刮刀','劈成小段,拿來當柴火的主力','磨得細細長長,拿來搓成繩子','挖空之後,拿來盛裝水或食物'], a:0, why:'骨器堅韌好磨,是史前重要的工具材料。' },
    { q:'獸皮要變成耐用的皮革,必須經過什麼處理?', o:['刮除脂肪並鞣製','只要拿去曬乾就可以直接使用','直接拿去泡在鹹鹹的海水裡','拿去用火烤到表面焦黑就好'], a:0, why:'未鞣製的皮會腐爛發臭,乾了又硬又脆。' },
    { q:'在野外保存肉類,最實用的方法之一是?', o:['切薄片煙燻或曬成肉乾','直接整塊肉挖坑埋進土裡保存','把整塊肉泡在冰涼的溪水裡','切成一整塊放在太陽下曝曬'], a:0, why:'脫水加煙燻能同時抑制細菌和蟲。' },
    { q:'蛋白質來源在荒島上除了魚類,還可以考慮?', o:['貝類與可食用的昆蟲','撿拾河邊或海邊常見的普通石頭','採集各種植物寬大翠綠的葉子','直接舀一瓢鹹鹹的海水來補充'], a:0, why:'許多文化都把昆蟲當作重要蛋白質來源。' },
    { q:'釣魚時魚鉤上的「倒鉤」作用是?', o:['讓魚上鉤後不容易脫落','倒鉤的作用,是讓魚鉤變得比較重','倒鉤的作用,是讓魚鉤看起來比較亮','倒鉤的作用,是不讓魚感覺到痛'], a:0, why:'但也會讓放生的魚受傷較重。' },
    { q:'用陷阱捕獵時,每天檢查陷阱的原因是?', o:['避免動物長時間受苦,也免得獵物腐壞','每天去看比較好玩,順便在森林裡散步','每天去看陷阱會抓到更多獵物,數量變多','其實沒有理由,隔幾天再去看也完全一樣'], a:0, why:'負責任地使用陷阱是基本的野外倫理。' },
    { q:'槓桿原理中,支點越靠近重物,會?', o:['越省力','越費力','沒有差別','重物變重'], a:0, why:'撬動大石頭時,支點要盡量靠近石頭。' },
    { q:'用滑輪把重物往上拉,定滑輪的主要好處是?', o:['改變施力方向,可以往下拉','定滑輪可以讓拉起重物的力氣減半','定滑輪會讓被拉起的重物變得更重','定滑輪能讓拉繩子移動的距離變短'], a:0, why:'動滑輪才省力,定滑輪只改變方向。' },
    { q:'斜面(斜坡)可以幫忙搬重物,是因為?', o:['用比較小的力,走比較長的距離','東西放到斜坡上,重量就會變得比較輕','斜坡表面特別光滑,摩擦力完全消失','走上斜坡的時候,重力會突然消失不見'], a:0, why:'省力但不省功,這是機械的基本原則。' },
    { q:'在泥地上搬運重物時,底下墊圓木會比較輕鬆,因為?', o:['滾動摩擦力比滑動摩擦力小','圓木自己會推著整個物體往前走','東西墊上圓木之後,重量就會變輕','墊上圓木之後,下面的泥土會變硬'], a:0, why:'這也是輪子發明的原理。' },
    { q:'刀刃磨得越薄越利,是因為?', o:['受力面積變小,壓力變大','刀刃越磨越薄,整把刀會跟著變重','刀刃越磨越薄,刀身材質會變得比較軟','刀刃越磨越薄,切東西時的摩擦力變大'], a:0, why:'同樣的力集中在更小的面積,就更容易切開材料。' },
    { q:'在濕滑的地面搬運時,增加鞋底的粗糙度可以?', o:['增加摩擦力,比較不會滑倒','讓鞋子連同身體的重量一起減少','讓走路搬運的速度變得更快一些','反而讓鞋底和地面之間更容易打滑'], a:0, why:'摩擦力是我們能行走的關鍵。' },
    { q:'把採集到的重物背在背上而不是提在手上,好處是?', o:['重心靠近身體,比較省力也比較穩','揹在背上看起來比較帥氣、比較威風','揹在背上之後,東西的重量就會變輕','揹著走路的速度,會比提著快上許多'], a:0, why:'重心越靠近身體軸線,負擔越小。' },
    { q:'背負重物時,腰帶把重量轉移到臀部的好處是?', o:['讓強壯的腿部肌肉分擔,肩膀比較不痠','腰帶扣緊之後整個背包的重量就真的變輕','腰帶可以撐開背包,讓它多裝一些東西','腰帶讓背和背包留出空隙,背起來涼快'], a:0, why:'登山背包的腰帶就是為此設計。' },
    { q:'採集大量資源時,分成多趟搬運比一次搬完好,因為?', o:['降低受傷風險,也比較不會弄壞物品','多走幾趟比較好玩,路上還能看風景','分成幾趟其實比一次搬完還要快一些','分批搬可以省下時間,早一點回營地'], a:0, why:'安全比速度重要。' },
    { q:'在野外辨識可食植物,「少量試吃法」為什麼仍然危險?', o:['有些毒素少量就會造成嚴重傷害','一種一種慢慢試,要花掉非常多時間','每次都要先洗再試,步驟很多很麻煩','摘來摘去會把手弄得髒兮兮又黏黏的'], a:0, why:'所以最好的策略仍是只吃確定認識的植物。' },
    { q:'採集時記錄「日期與地點」,對以後最大的幫助是?', o:['掌握不同季節的資源分布','把日期地點寫上去,筆記本會變厚一點','記錄這些純粹是為了打發無聊的時間','記錄日期地點對以後完全沒有幫助'], a:0, why:'野外資源有明顯的季節性。' },
    { q:'很多果實在特定季節才成熟,這和什麼因素關係最大?', o:['日照長度與氣溫變化','和當地是否發生地震有很大關係','和天上月亮目前的形狀有關係','和當時吹的是哪個方向的風有關'], a:0, why:'植物靠環境訊號決定開花結果的時機。' },
    { q:'春天適合採集嫩芽野菜,主要因為?', o:['氣溫回升,植物大量長出新芽','春天是一年裡雨水下得最少的季節','春天白天最短、天黑得特別早','春天草叢裡的蟲子數量是最多的'], a:0, why:'季節決定了能採到什麼。' },
    { q:'下雨過後最適合採集哪一類資源?', o:['菇類等真菌','乾燥的火種','曬乾的海鹽','風乾的木材'], a:0, why:'潮濕的環境會讓菌類大量冒出。' },
    { q:'颱風過後海邊常出現大量漂流木,是因為?', o:['強風豪雨把山區的木頭沖到海裡再漂上岸','海邊的樹被風吹倒後自己走到沙灘上排好','海水裡的礦物質慢慢凝結成了木頭的樣子','海裡的動物把木頭一根一根搬到岸上堆著'], a:0, why:'颱風同時帶來資源與危險,撿拾要注意安全。' },
    { q:'為什麼許多地方規定禁漁期?', o:['讓魚類在繁殖季節能順利產卵','禁漁期主要是為了讓漁民多休息','禁漁期能讓附近的海水變得更乾淨','其實沒有什麼特別的原因,只是規定'], a:0, why:'保護繁殖期是資源永續的關鍵手段。' },
    { q:'「永續利用」自然資源的意思是?', o:['使用的速度不超過資源恢復的速度','盡量多採一些,趁還有的時候先拿到手','完全不去使用,讓資源自己留在原地','只給島上少數幾個人使用,別人不能拿'], a:0, why:'這樣資源才能一直用下去。' },
    { q:'回收利用海邊撿到的塑膠垃圾,對環境的意義是?', o:['減少污染並讓廢棄物變成有用的材料','把垃圾集中起來,島上的垃圾總量會變多','撿走塑膠之後,海水會變得比原來更鹹','做起來很辛苦,對環境其實沒什麼意義'], a:0, why:'海洋廢棄物是全球嚴重的環境問題。' },
    { q:'塑膠在自然環境中不易分解,會造成什麼問題?', o:['碎成微塑膠被生物吃下,進入食物鏈','很快就會爛掉,變成植物需要的肥料','混進土裡之後,會讓土壤變得更肥沃','泡在水裡久了,反而會把水質變乾淨'], a:0, why:'微塑膠最後可能回到人類的餐桌。' },
    { q:'在野外把果核或種子隨手留在原地,可能帶來的好處是?', o:['有機會長出新的植株','隨手留下會讓周圍地面變得又髒又亂','留在原地反而會吸引更多蚊蟲聚集','留在原地其實完全沒有任何好處'], a:0, why:'不過外來種的種子就不該隨意散播。' },
    { q:'採集工作結束後把營火完全澆熄,理由是?', o:['避免死灰復燃引起森林火災','把火澆熄之後,營火看起來比較好看','把火澆熄可以省下不少木柴不用燒','把火澆熄能讓周圍的地面變得比較涼'], a:0, why:'看不到火焰不代表沒有餘燼。' },
    { q:'在野外「無痕山林」的核心精神是?', o:['把帶去的東西帶回來,盡量不留下痕跡','盡量多採一些東西回去,才不會白跑一趟','在山上蓋一間小木屋,留下來當作紀念','在石頭或樹幹上刻字,證明自己來過這裡'], a:0, why:'尊重環境,讓下一個人看到同樣的美景。' },
    { q:'觀察一個地方能不能長期採集,最該注意的是?', o:['資源再生的速度與目前的數量','這個地方的風景漂不漂亮、好不好看','這個地方距離營地遠不遠、方不方便','這個地方有沒有樹蔭可以遮陽休息'], a:0, why:'先觀察再決定採多少,是負責任的採集。' },
    { q:'同一種植物在不同季節的「可用部位」可能不同,例如?', o:['春天採嫩芽,秋天採種子','不管哪個季節,永遠只能採根部','一整年當中只能採到花這個部位','規定只有在冬天才可以進行採集'], a:0, why:'了解植物的生活史,才能物盡其用。' },
    { q:'下列哪一種行為最符合永續採集的原則?', o:['分散在不同區域少量採集','把整片區域的資源一次採光','專挑最稀有難得的那幾種來採','連根一起拔起,方便一次帶走'], a:0, why:'分散採集能讓每塊區域都有恢復的時間。' },
    { q:'科學觀察記錄時,「畫圖」比只用文字描述的好處是?', o:['能記下形狀與比例等不易用文字說清楚的特徵','畫圖比寫字快得多,可以省下很多做記錄的時間','畫圖比較省紙,同一張紙能記下更多次的觀察結果','畫圖比寫字有趣得多,做記錄時比較不會覺得無聊'], a:0, why:'圖文並用是博物學家的傳統方法。' }
  ];
  D.QUIZ.chop = [
    { q:'樹幹橫切面的一圈圈叫什麼?', o:['年輪','樹皮','葉脈','根毛'], a:0, why:'樹每年長一圈,數一數就知道樹幾歲。' },
    { q:'年輪比較寬的那一年,通常代表?', o:['雨水多、長得快','很冷','沒有陽光','樹生病'], a:0, why:'環境好時樹長得快,年輪就寬。' },
    { q:'用斧頭砍樹時,握在斧柄「尾端」比較省力,這是因為?', o:['施力臂變長','握在尾端之後斧頭反而變重了','握在尾端之後木頭突然變軟了','握在尾端之後手臂力氣變大了'], a:0, why:'槓桿原理:施力臂越長越省力。' },
    { q:'木材容易浮在水上,是因為?', o:['密度比水小','是因為木材本身相當沉重','是因為木材質地非常堅硬','是因為木材帶有特別的顏色'], a:0, why:'木材密度小於水,所以會浮。' },
    { q:'下列哪一種材料最適合當支柱?', o:['木材','棉花','紙','葉子'], a:0, why:'木材硬又能承重。' },
    { q:'砍倒的樹要放在通風處曬乾,是為了?', o:['減少水分,比較好燒','曬乾之後,樹幹的顏色會變得翠綠','曬乾反而會讓年輪的圈數變多','放著曬乾之後,木頭反而會變重'], a:0, why:'濕木頭水分多,不容易燒著。' },
    { q:'樹皮的功用是?', o:['保護樹木','製造養分','吸水','開花'], a:0, why:'樹皮像皮膚,保護內部組織。' },
    { q:'一棵樹有 8 圈年輪,它大約幾歲?', o:['8 歲','4 歲','16 歲','80 歲'], a:0, why:'一年長一圈。' },
    { q:'用斧頭「劈」木頭,斧刃是哪一種簡單機械?', o:['斜面','滑輪','輪軸','彈簧'], a:0, why:'斧刃是楔子,屬於斜面的應用。' },
    { q:'木材燃燒後留下的灰,是原本的什麼變化?', o:['化學變化','物理變化','沒有變化','融化'], a:0, why:'燃燒產生新物質(灰、二氧化碳),是化學變化。' },
    { q:'樹木長高主要靠哪裡的細胞分裂?', o:['頂端的芽','樹根底部','樹皮外層','葉子'], a:0, why:'莖頂端的分生組織讓樹長高。' },
    { q:'乾燥的木材比濕木材?', o:['更輕','更重','一樣重','更綠'], a:0, why:'水分蒸發後重量減少。' },
    { q:'下列哪一個不是木材的特性?', o:['導電','可燃','能浮水','可加工'], a:0, why:'木材是絕緣體,不導電。' },
    { q:'森林裡的枯木倒下後會慢慢腐爛,是誰在分解?', o:['細菌與真菌','是在天上盤旋的老鷹負責分解','單純是被太陽曬到腐爛的','是被壓在下面的石頭分解的'], a:0, why:'分解者把枯木變回養分回到土壤。' },
    { q:'用槓桿撬石頭,支點應該放在哪裡比較省力?', o:['靠近石頭','靠近手','中間','不放支點'], a:0, why:'支點靠近重物,施力臂比抗力臂長,省力。' }
  ];
  D.QUIZ.fire = [
    { q:'燃燒需要的三個條件是?', o:['可燃物、助燃物、溫度達燃點','充足的水分、強勁的風力,加上光線','一堆木頭、石頭,再加上一些細沙','天上的太陽、月亮,再加上星星'], a:0, why:'缺一項火就燒不起來。' },
    { q:'空氣中幫助燃燒的氣體是?', o:['氧氣','二氧化碳','氮氣','水蒸氣'], a:0, why:'氧氣是助燃物。' },
    { q:'用鍋蓋蓋住著火的油鍋,是移除了哪個條件?', o:['助燃物(空氣)','移除的是鍋子裡的可燃物','移除的是周圍環境的溫度','移除掉的其實是那口鍋子'], a:0, why:'隔絕空氣就沒有氧氣。' },
    { q:'澆水滅火,主要是?', o:['降低溫度','增加可燃物','增加氧氣','讓火變大'], a:0, why:'水吸熱,使溫度降到燃點以下。' },
    { q:'紙的燃點比木頭?', o:['低','高','一樣','不能比'], a:0, why:'紙容易點燃,燃點較低。' },
    { q:'搧風可以讓火變旺,因為?', o:['補充氧氣','降溫','移除燃料','增加水分'], a:0, why:'風帶來更多空氣(氧氣)。' },
    { q:'蠟燭放進密閉的玻璃罐裡,不久會?', o:['熄滅','燒更旺','變藍','爆炸'], a:0, why:'罐內氧氣用完,火就熄了。' },
    { q:'酒精燈蓋上燈罩就熄了,原理是?', o:['隔絕空氣','降溫','燈芯壞了','酒精用完'], a:0, why:'蓋子隔絕氧氣。' },
    { q:'下列哪一個「不是」可燃物?', o:['石頭','木頭','紙','乾草'], a:0, why:'石頭不會燃燒。' },
    { q:'燃燒後火焰上方的空氣會?', o:['變熱上升','變冷下沉','不動','變成水'], a:0, why:'熱空氣密度小會上升(對流)。' },
    { q:'摩擦生火是利用摩擦產生?', o:['熱','水','氧氣','木頭'], a:0, why:'摩擦讓溫度升高到燃點。' },
    { q:'在荒島生火時,最容易點著的是?', o:['乾燥細碎的枯草','還帶著水分、濕答答的樹枝','搬不太動的一整顆大石頭','剛從樹上摘下的新鮮綠葉'], a:0, why:'乾細的東西燃點低、接觸空氣多。' },
    { q:'燒開水時,水滾了冒出的白煙是?', o:['小水滴','冒出來的白煙其實是小小的火苗','冒出來的白煙其實是純粹的空氣','冒出來的白煙其實是一點點的油'], a:0, why:'水蒸氣遇冷凝結成小水滴。' },
    { q:'金屬湯匙放在火上會燙手,熱的傳播方式是?', o:['傳導','對流','輻射','反射'], a:0, why:'固體靠傳導傳熱。' },
    { q:'離營火一段距離也覺得暖,主要是?', o:['輻射','傳導','對流','摩擦'], a:0, why:'火的熱以輻射方式傳到身上。' }
  ];
  D.QUIZ.build = [
    { q:'屋頂要用什麼材料,雨才不會漏進來?', o:['防水的大葉或獸皮','蓬鬆柔軟、一下雨就會濕透的棉花','薄薄一張、碰到水就會爛掉的紙','顆粒鬆散、雨一沖就會流走的沙子'], a:0, why:'防水材料能擋雨。' },
    { q:'支柱要選?', o:['硬的木材','軟的纖維','薄的葉子','細的草'], a:0, why:'支柱要承重,需要硬又直的材料。' },
    { q:'三角形的結構比四邊形?', o:['更穩固','更容易變形','一樣','更軟'], a:0, why:'三角形不易變形,常用在屋頂。' },
    { q:'底面積越大的東西?', o:['越不容易倒','底面積越大,反而越容易傾倒','底面積不管大小,穩定度都一樣','底面積越大,重量反而會越輕'], a:0, why:'底面積大、重心低比較穩。' },
    { q:'床墊要選?', o:['柔軟的纖維','堅硬的石頭','冰冷的金屬','尖銳的樹枝'], a:0, why:'柔軟材料躺起來才舒服。' },
    { q:'金屬鍋子比木頭碗更容易燙手,因為金屬?', o:['導熱快','導熱慢','很輕','會浮'], a:0, why:'金屬是熱的良導體。' },
    { q:'想讓帳篷不被風吹走,可以?', o:['用石頭壓住四角','把整座帳篷盡量架得高高的','把帳篷的支柱整個拿掉不用','改用一張紙來搭建帳篷'], a:0, why:'增加重量、固定底部。' },
    { q:'防水的材料有?', o:['塑膠布','選用吸水力很強的棉布來防水','選用薄薄一張紙來當防水材料','選用會吸水膨脹的海綿來防水'], a:0, why:'塑膠不吸水。' },
    { q:'砌石牆時,石頭要?', o:['交錯疊放','直直疊成一排','隨便丟','放在頂端'], a:0, why:'交錯疊放能分散重量,不易倒。' },
    { q:'哪一種材料能浮在水上,適合做浮筒?', o:['寶特瓶(密封)','隨手撿到的一顆普通石頭','敲下來的一塊沉重鐵塊','燒製過的一塊紅磚頭'], a:0, why:'密封的空瓶裡有空氣,密度小會浮。' },
    { q:'房子的地基要?', o:['平穩堅固','鬆軟','高低不平','用葉子鋪'], a:0, why:'地基不穩房子會歪。' },
    { q:'保暖的材料通常?', o:['蓬鬆、裡面有很多空氣','摸起來又薄又輕,幾乎沒有厚度','摸起來相當硬,而且不容易壓扁','材質本身很容易把熱量傳導出去'], a:0, why:'空氣是熱的不良導體,蓬鬆材料保暖。' },
    { q:'繩結要綁牢,纖維要?', o:['夠韌、不易斷','質地要脆,一拉就容易斷開','長度要短,越短越好綁緊','碰到熱就會整條融化掉'], a:0, why:'韌性好的纖維才拉得住。' },
    { q:'用滑輪把重物吊上屋頂,可以?', o:['改變施力方向','滑輪可以讓吊起的重物變輕','滑輪可以讓重物憑空消失不見','滑輪反而會讓重物的重量增加'], a:0, why:'定滑輪改變方向,動滑輪省力。' },
    { q:'房子的窗戶開在向陽面,好處是?', o:['採光與保暖','開在向陽面反而會讓屋內更冷','開在向陽面會讓屋內變得很暗','開在向陽面反而會把風擋住'], a:0, why:'陽光能照亮並溫暖室內。' }
  ];

  /* ── 劇情(主角內心話)與新手教學(可跳過) ── */
  D.STORY = {
    prologue: [
      '……好冷。我是躺在沙灘上嗎?',
      '海浪拍著我的腳。船呢?老師呢?大家呢?',
      '這裡是一座島。四周只有沙、樹,和很遠很遠的海。',
      '不能哭。自然課老師說過:「先觀察,再想辦法。」',
      '我要在這座島上活下去,然後,回家。'
    ],
    gullIntro: [
      '(一隻海鷗歪著頭看我。)',
      '「嘎!你醒啦?我是小白,這座島我最熟!」',
      '「先動一動,把地上閃閃發亮的東西撿起來吧。」'
    ],
    wake: '島上的東西又長回來了……新的一天,新的機會。',
    firstCamp: '這塊空地離海不遠,又有樹擋風——就把營地設在這裡吧。',
    friendWatch: '有朋友的小人在營火旁守夜,晚上安心多了。原來一起生活,就是這種感覺。',   /* ★ v1.11.0 丙 */
    shipBuilt: ['帆升起來了。風一吹,整艘船微微晃了一下——它真的能出海。', '回頭看看營地、田、還有那些朋友……原來我在這座島上,做了這麼多事。'],   /* ★ v1.12.0 */
    endingHome: '船就停在岸邊,想走的時候隨時可以走。今天,先回營地吧。',
    towerFirst: '從瞭望台看出去,整片草原都在腳下。原來看得高、看得遠,才能提早準備。',   /* ★ v1.11.0 甲 */
    fireLit: '火,燒起來了。有光、有暖,今晚不用怕了。',
    forestOpen: '有了營火,我敢往森林裡走了。那裡一定有木材。',
    /* ★ v1.5.0 每區第一次進入的內心話(自然課觀察 → 想辦法) */
    zoneIntro: {
      beach:  '沙子被太陽曬得好燙。海邊有林投樹、貝殼……這裡看起來像台灣的海邊。先找找能用的東西。',
      forest: '樹葉把光擋掉大半,地上涼涼的。這些樹,每一棵都好粗。',
      grass:  '風一吹,整片草像海浪一樣。遠遠好像有動物在動……',
      river:  '水聲!清澈的溪水從山上流下來——有淡水了,而且水裡有魚影。',
      rock:   '岩石上滿是海浪打上來的東西,有貝殼,也有……垃圾。海洋在求救。',
      lake:   '好安靜的湖。水面像鏡子,湖裡的魚看起來好近,伸手卻摸不到?',
      cave:   '洞裡涼涼的,岩壁上有一閃一閃的東西。沒有火把的話,這裡什麼都看不到。',
      cliff:  '風好大!站在崖邊往下看,海鷗在腳下飛。有滑輪才搬得動東西上來。',
      valley: '兩座山之間,溪流彎彎曲曲。這裡的土地比沙灘肥沃多了,還有蜜蜂的聲音。',
      ruins:  '石柱、雕刻、還有像電線一樣的銅條……以前有人住在這座島上?',
      volcano:'腳下的岩石是溫的。原來整座島,是火山從海底噴出來的。'
    },
    /* ══ ★ v1.28.0(2026-09-13・老師「先做劇情」)— 章節推進劇情 ══
       每一則在「第一次達成某個里程碑」時播一次(存檔 flags.st[key]=1,永不重播)。
       ★ 為什麼做成里程碑觸發而不是固定第幾天:荒島是自由進度,有人第 3 天就蓋好營火、有人第 10 天才蓋,
         用天數綁劇情一定會出現「還沒生火就先講火的事」這種錯亂。里程碑一定是玩家真的做到了才講。
       ⚠ 這是自寫版劇情,與《像素荒島求生記_劇情與新手教學腳本_v1.md》尚未合併(那份仍停在舊的「選 8 位英雄」設定)。
         老師日後提供正式腳本時,整段替換 D.STORY.chapters 即可,程式端不必改。 */
    chapters: {
      night1: [
        '天黑了。火光照在沙子上,一閃一閃的。',
        '我把腳縮起來,聽著海浪的聲音。',
        '原來一個人的時候,火會這麼重要。',
        '明天,我要去森林看看。'
      ],
      forest1: [
        '走進森林,聲音突然變小了。',
        '樹把陽光擋住,地上涼涼的,還有濕濕的味道。',
        '這些木頭,可以蓋房子、可以生火、可以做工具。',
        '我開始覺得——我不是在等人來救我,我是在這裡生活。'
      ],
      water1: [
        '終於找到淡水了。',
        '我用手捧起來喝了一口,冰冰的,好甜。',
        '人可以好幾天不吃東西,但是不能沒有水。',
        '我要想辦法把水引回營地。'
      ],
      food1: [
        '第一次自己煮出熱的東西。',
        '火的熱從鍋底傳上來,把食物煮熟——這就是熱傳導。',
        '熱熱的湯喝下去,整個人都活過來了。'
      ],
      raid1: [
        '半夜,營火旁邊有東西在動。',
        '我抓起手邊的工具,心臟跳得好快。',
        '……原來只要用對方法,牠們也沒那麼可怕。',
        '但是我知道,牠們明天還會再來。'
      ],
      ruins1: [
        '石柱上刻著我看不懂的圖案。',
        '有人在我之前,在這座島上生活過。',
        '他們後來去哪裡了?是回家了,還是……'
      ],
      friend1: [
        '有人來我的島了。',
        '我們一起走在沙灘上,什麼都沒說,但是好安心。',
        '原來「有人在」本身就是一件很重要的事。'
      ],
      shipStart: [
        '我把木頭一根一根排好。',
        '這是要載我回家的船。',
        '可是為什麼,想到要離開,心裡會有一點點捨不得?'
      ]
    },
    /* ★ 阿川的紙條:散落在島上各處的前人留言,解謎點/地下層/特定區域第一次抵達時發現。
       每張紙條講一點「怎麼在島上生活」的道理,也一點一點拼出前一位漂流者的故事。 */
    notes: {
      beach:  ['【破舊的紙條】', '「撿到這張紙的人:先找水,再找火,最後才找吃的。」', '「——阿川」'],
      forest: ['【夾在樹皮裡的紙條】', '「樹會告訴你風從哪裡來。葉子密的那一面是背風面。」', '「在背風面搭營地,晚上會暖很多。——阿川」'],
      cave:   ['【刻在岩壁上的字】', '「洞裡不要一個人待太久,空氣會變悶。」', '「火把如果變小,就是在叫你出去。——阿川」'],
      ruins:  ['【壓在石板下的紙條】', '「這裡的機關是用電路做的,通了才會動。」', '「我花了三十天才想通。你一定比我快。——阿川」'],
      volcano:['【燒焦一角的紙條】', '「山是熱的,不要靠太近。」', '「我要走了。如果你也想回家,就去把船做好。——阿川」']
    },
    gullZone: {
      grass:  '「嘎!草原上的動物膽子小,要慢慢靠近;先蓋畜欄才帶得回去。」',
      river:  '「嘎!溪水記得裝回營地,蓋了水道就不用天天提水。」',
      rock:   '「嘎!海廢分類要小心,分錯的話海邊會越來越髒。」',
      lake:   '「嘎!湖裡的魚看起來近,其實在更深的地方——光會轉彎!」',
      cave:   '「嘎!洞裡的鐵礦可以做鐵斧鐵鎬,先蓋製作台。」',
      ruins:  '「嘎!石室裡的機關解開,火山就會露出路來。」'
    }
  };
  D.TUTORIAL = [
    { id:'move',   t:'用左下角的搖桿,或直接點地板,走一走。', done:'moved' },
    { id:'pick',   t:'走到閃亮的小東西旁邊,它會自動撿起來。', done:'picked' },
    { id:'gather', t:'走到林投樹或構樹果叢旁,按右下角的「!」開始採集。', done:'acted' },
    { id:'camp',   t:'按上方「🏕 回營」,把東西放進營地。', done:'camped' },
    { id:'fire',   t:'在營地點一個空格,先蓋「營火」。', done:'campfire' },
    { id:'rest',   t:'AP 用完就按「🌙 休息」結束今天,明天資源會長回來。', done:'rested' }
  ];

  /* ══════════════════════════════════════════════════════════════════════════
   * ★ v1.6.0(2026-09-12 P4-a・老師「繼續」)— 🐚 貝幣商店(阿獺雜貨鋪)+ 📖 自然圖鑑
   *   商店(第二十九章 29.5,N 甲=貝幣獨立於主程式知識幣;O 甲=島民為擬人化小動物):
   *     buy  = 貝幣(+遺物/水晶/貝殼)換物品、物品包擴格、科技點、商店限定裝飾;每日一件特價(seed=uid+day)
   *     sell = 阿獺收購基準價(★★ ×1.5、★★★ ×2,四捨五入);先賣低品質、留好東西給玩家
   *   圖鑑(第二十九章 29.7):採集/伐木/捕魚/採石/打撈/馴養/撿取/解謎/研究/烹飪/擊退魔物 → 自動收錄,每筆一句自然知識;
   *     首次收錄 🐚+1,累積 10/20/30/40/50 筆各有里程碑獎勵(自動發放,存 codexMs)。
   * ══════════════════════════════════════════════════════════════════════════ */
  D.IMG.npc_otter = 'island_npc_otter.png';   /* 阿獺(256×256 去背,HD-2D 擬人化歐亞水獺老闆,圍裙+小算盤;★ v1.8.0 台灣化:金門的歐亞水獺,不是海獺) */
  D.SHOP = {
    npc: { n:'阿獺', e:'🦦', img:'npc_otter',
           hello: [ '歡迎光臨「阿獺雜貨鋪」!我是阿獺,從金門游過來的歐亞水獺,住在這座島好多年啦。',
                    '我們水獺最會用石頭敲貝殼——所以島上都用貝殼當錢,叫「貝幣」。',
                    '你採到用不完的東西可以賣給我,想要的東西也可以跟我換。',
                    '海廢我也收!回收再利用,比丟回海裡好多了。' ],
           tips:  [ '台灣只剩金門還有野生的歐亞水獺,大概不到 200 隻,要好好保護溪流。',
                    '貝殼是碳酸鈣做的,和蛋殼、石灰岩是親戚。',
                    '以前的人沒有錢,就用「以物易物」——你的魚換我的木材。',
                    '東西越少見就越貴,這叫「物以稀為貴」。',
                    '今天的特價品不一樣喔,每天都來看看!' ] },
    /* price:{shell,relic,crystal,shellItem} 全部都是「貨幣/材料」;give:{item,q,n}|{kind:'bagup'}|{kind:'tech',n}|{kind:'deco',deco} */
    buy: [
      { id:'seed3',   n:'種子 ×3',        e:'🌰', price:{shell:6},                 give:{item:'seed', q:1, n:3},    d:'一顆種子裡藏著一整棵植物的開始。' },
      { id:'water3',  n:'淡水 ×3',        e:'💧', price:{shell:5},                 give:{item:'water', q:1, n:3},   d:'阿獺用椰殼接雨水,乾淨又清涼。' },
      { id:'reed3',   n:'蘆葦 ×3',        e:'🎋', price:{shell:6},                 give:{item:'reed', q:1, n:3},    d:'又輕又韌,編籃子、鋪水道都好用。' },
      { id:'herb1',   n:'草藥 ×1',        e:'🍀', price:{shell:8},                 give:{item:'herb', q:2, n:1},    d:'阿獺曬過的草藥,受傷時治療只要一株。' },
      { id:'fish2',   n:'烤魚 ×1',        e:'🐟', price:{shell:10},                give:{item:'d_fish', q:2, n:1},  d:'阿獺親手烤的,回體力 30。' },
      { id:'soup1',   n:'野菇湯 ×1',      e:'🍲', price:{shell:12},                give:{item:'d_soup', q:2, n:1},  d:'熱湯是「對流」把熱帶到每一口。回體力 40。' },
      { id:'ore2',    n:'鐵礦 ×2',        e:'🟫', price:{shell:14},  needZone:'cave',   give:{item:'ore', q:1, n:2},     d:'洞窟才有的礦,做鐵斧鐵鎬要用。' },
      { id:'tech3',   n:'科技點 +3',      e:'🔬', price:{shell:12, crystal:1},     give:{kind:'tech', n:3},         d:'阿獺的舊筆記本——裡面畫滿了機關草圖。' },
      { id:'bagup',   n:'物品包擴格 +2',  e:'🎒', price:{},                        give:{kind:'bagup'},             d:'阿獺幫你多縫兩個口袋。(每次越縫越貴,最多 5 次)' },
      { id:'koi',     n:'鯉魚旗',         e:'🎏', price:{shell:20, shellItem:3},   give:{kind:'deco', deco:'koi'},  d:'風一吹就鼓起來——風是流動的空氣。' },
      { id:'mirror',  n:'貝殼鏡',         e:'🪞', price:{shell:30, crystal:2},     give:{kind:'deco', deco:'mirror'}, d:'水晶磨平了會反光,光遇到平面會「反射」。' },
      { id:'vase',    n:'古代花瓶',       e:'🏺', price:{shell:25, relic:2},       give:{kind:'deco', deco:'vase'}, d:'遺跡的人用黏土燒成陶器,燒過就不怕水。' }
    ],
    bagUp: { step:2, max:5, price:[15, 25, 40, 60, 85] },   /* 第 n 次擴格價(貝幣) */
    dailyOff: 0.3,                                          /* 每日特價 −30%(只算貝幣那一項) */
    sell: { wood:1, stone:1, fiber:1, leaf:1, reed:1, berry:1, mushroom:2, fish:2, shell:2, pebble:1, feather:2, seed:1, water:1,
            egg:2, milk:3, grain:2, trash:3, ore:4, crystal:8, relic:10, honey:3, herb:3,
            d_fish:4, d_jam:3, d_soup:5, d_stew:6, d_egg:4, d_bread:4, d_pudding:6 }
  };
  /* 商店限定裝飾:shop:true → 裝飾面板不列入製作清單(cost 空),只能向阿獺購買 */
  D.DECOS.push({ id:'koi',    n:'鯉魚旗',   e:'🎏', img:'deco_koinobori', comfort:4, cost:{}, shop:true, d:'風一吹就鼓起來——風是流動的空氣。' });
  D.DECOS.push({ id:'mirror', n:'貝殼鏡',   e:'🪞', img:'deco_mirror', comfort:5, cost:{}, shop:true, d:'光遇到平滑的面會反射,所以照得到自己。' });
  D.DECOS.push({ id:'vase',   n:'古代花瓶', e:'🏺', img:'deco_vase', comfort:6, cost:{}, shop:true, d:'黏土燒過變成陶,不怕水也不會爛。' });

  /* ── 📖 自然圖鑑(29.7):id 對應 spawn 的 kind(別名見 CODEX_ALIAS)、撿取物品、puzzle 區、tech id、料理 id、魔物 k ── */
  D.CODEX_CATS = [
    { k:'plant',   n:'植物',       e:'🌿' },
    { k:'animal',  n:'動物',       e:'🐾' },
    { k:'earth',   n:'岩石與海洋', e:'⛏' },
    { k:'dish',    n:'料理',       e:'🍳' },
    { k:'tech',    n:'科技',       e:'🔬' },
    { k:'puzzle',  n:'島嶼謎題',   e:'🧩' },
    { k:'monster', n:'夜襲魔物',   e:'👾' }
  ];
  D.CODEX_ALIAS = { berry:'bush', wood:'tree', fiber:'fibergrass', lava:'lavarock', feather:'nest' };   /* spawn kind → codex id */
  D.CODEX_PICK  = { shell:'shell', pebble:'pebble', feather:'nest', berry:'bush' };                       /* 撿取物品 → codex id */
  D.CODEX = [
    /* ★ v1.8.0 老師需求③:島嶼以台灣附近地理環境為主,自然生態全部改為台灣物種 */
    /* 植物 */
    { id:'palm',       cat:'plant', n:'林投樹',     e:'🌴', img:'node_palm',      where:'沙灘',        d:'台灣海邊最常見的樹,葉緣有刺;果實像鳳梨,能浮在海上順洋流傳播,老一輩用葉子編草蓆和籃子。' },
    { id:'bush',       cat:'plant', n:'構樹果叢',   e:'🌳', img:'node_bush',      where:'沙灘/森林/草原/山谷', d:'構樹全台灣的荒地都有,夏天結橘紅色的甜果實;鳥和松鼠愛吃,順便把種子帶到遠方。' },
    { id:'mush',       cat:'plant', n:'野菇圈',     e:'🍄', img:'node_mushroom',  where:'森林',        d:'菇不是植物,是真菌,靠分解落葉枯木過活;台灣山區的木耳、香菇都是可食的,但不認識的野菇絕不能吃。' },
    { id:'tree',       cat:'plant', n:'樟樹',       e:'🌲', img:'node_tree',      where:'森林',        d:'台灣最有代表性的大樹,葉子搓一搓有香味;一百年前台灣的樟腦產量是世界第一。年輪一圈代表一年。' },
    { id:'reed',       cat:'plant', n:'蘆葦叢',     e:'🎋', img:'node_reed',      where:'溪流/湖泊',   d:'台灣河口濕地常見,莖空心又輕又韌;根能吸掉水裡多餘的養分,是天然的淨水器。' },
    { id:'seedgrass',  cat:'plant', n:'咸豐草叢',   e:'🌾', img:'node_seedgrass', where:'草原',        d:'台灣到處都是的野草,種子頂端有倒鉤,會黏在動物的毛和人的褲子上——靠「動物」傳播。' },
    { id:'fibergrass', cat:'plant', n:'月桃叢',     e:'🌿', img:'node_fibergrass', where:'草原',       d:'月桃葉可以包粽子,莖裡的纖維又長又結實,原住民用它編織草蓆和繩子。' },
    { id:'lotus',      cat:'plant', n:'台灣萍蓬草', e:'🪷', img:'node_lotus',     where:'湖泊',        d:'台灣特有種水生植物,開黃色小花,只剩桃園的少數埤塘還有;葉柄有氣孔把空氣送到水底的根。' },
    { id:'glow',       cat:'plant', n:'螢光蕈',     e:'🍄', img:'node_glowshroom', where:'洞窟',       d:'阿里山、溪頭的潮濕林地夜裡會發出綠光的小菇——是化學反應的「生物發光」,不是燙的光。' },
    { id:'herb',       cat:'plant', n:'艾草',       e:'🍀', img:'node_herb',      where:'懸崖',        d:'端午節掛在門口的草,葉背有白毛;台灣民間用來做草仔粿、驅蚊、泡藥浴。沒認清楚的植物千萬別亂吃。' },
    { id:'grain',      cat:'plant', n:'小米',       e:'🌾', img:'node_grain',     where:'山谷',        d:'台灣原住民最重要的傳統穀物,耐旱好種;我們吃的米、麥、小米都是「種子」,裡面的澱粉是幼苗的便當。' },
    /* 動物 */
    { id:'fish',       cat:'animal', n:'台灣石𩼣',   e:'🐟', img:'node_fish',     where:'溪流/山谷',   d:'台灣溪流最常見的魚,身上有七條黑色橫紋,俗稱「石斑」;魚用鰓呼吸水裡的氧氣,鰭是牠的槳和舵。' },
    { id:'lakefish',   cat:'animal', n:'苦花魚',     e:'🐠', img:'node_lakefish', where:'湖泊',        d:'台灣鏟頜魚,喜歡乾淨冰涼的水,啃石頭上的藻類時會翻身閃出銀光;看到的位置比實際淺,是光的折射。' },
    { id:'chicken',    cat:'animal', n:'環頸雉',     e:'🐔', img:'node_chicken',  where:'草原',        d:'台灣平地草原的野生雉雞,公鳥脖子有白環、尾巴很長;鳥類卵生、有羽毛、恆溫,牠不太會飛但跑很快。' },
    { id:'goat',       cat:'animal', n:'長鬃山羊',   e:'🐐', img:'node_goat',     where:'草原',        d:'台灣特有種,也是台灣唯一的野生牛科動物;蹄的邊緣像橡膠,能在很陡的岩壁上跳來跳去。哺乳類胎生、喝奶長大。' },
    { id:'rabbit',     cat:'animal', n:'台灣野兔',   e:'🐇', img:'node_rabbit',   where:'草原',        d:'台灣特有亞種,住在平地草叢,不挖洞而是躲在草窩裡;門牙一輩子都在長,所以要一直啃東西磨牙。' },
    { id:'nest',       cat:'animal', n:'遊隼巢',     e:'🪺', img:'node_nest',     where:'懸崖',        d:'台灣北海岸和東部的海崖上住著遊隼,俯衝時速可超過 300 公里,是世界上最快的動物;巢築在崖壁天敵爬不到。' },
    { id:'hive',       cat:'animal', n:'野蜂巢',     e:'🐝', img:'node_hive',     where:'山谷',        d:'台灣的野蜂(東方蜂)採龍眼、荔枝的花蜜,順便幫花傳粉;蜂巢是六角形,最省材料又最堅固。' },
    { id:'gull',       cat:'animal', n:'海鷗小白',   e:'🕊', img:'gull_normal',   where:'沙灘',        d:'每年冬天黑尾鷗會從日本、韓國飛到台灣北海岸過冬;翅膀長又窄,能乘著海風滑翔很久不用拍翅。' },
    { id:'otter',      cat:'animal', n:'水獺阿獺',   e:'🦦', img:'npc_otter',     where:'營地商店',    d:'歐亞水獺,台灣本島已經看不到,只剩金門的溪流和湖泊還有不到 200 隻;牠們會用石頭敲開貝殼,是會用工具的動物。' },
    /* 岩石與海洋 */
    { id:'stone',      cat:'earth', n:'珊瑚礁岩',   e:'🪨', img:'node_stone',    where:'岩岸/懸崖/遺跡', d:'台灣南部和東部海岸的岩石很多是珊瑚骨骼堆成的;岩石會被風、雨、海浪慢慢磨碎,這叫「風化」與「侵蝕」。' },
    { id:'pebble',     cat:'earth', n:'卵石',       e:'⚪', img:'node_pebble',   where:'溪流/湖泊',      d:'台灣的溪流又短又急,石頭被水沖來沖去互相碰撞,稜角磨掉就變圓圓的卵石,溪口常堆成一片礫石灘。' },
    { id:'shell',      cat:'earth', n:'貝殼',       e:'🐚', img:'node_shell',    where:'岩岸/沙灘',      d:'貝殼是軟體動物的家,主要成分是碳酸鈣,和蛋殼一樣;台灣的貝塚遺址證明幾千年前的人就靠撿貝為生。' },
    { id:'trash',      cat:'earth', n:'海廢',       e:'♻', img:'node_trash',    where:'岩岸',           d:'台灣海岸每年淨灘撿到最多的是塑膠瓶、保麗龍和漁網;塑膠要幾百年才分解,海龜會把塑膠袋當水母誤食。' },
    { id:'ore',        cat:'earth', n:'鐵礦脈',     e:'🟫', img:'node_ore',      where:'洞窟/火山',      d:'鐵藏在礦石裡要高溫才能煉出來;台灣金瓜石、九份以前是東亞最大的金礦和銅礦產地。磁鐵會被鐵礦吸住。' },
    { id:'crystal',    cat:'earth', n:'水晶簇',     e:'💎', img:'node_crystal',  where:'洞窟/遺跡/火山', d:'水晶是慢慢長出來的規則形狀,叫「結晶」;鹽和糖也會結晶。台灣花蓮的豐田以前出產玉石。' },
    { id:'lavarock',   cat:'earth', n:'火山岩',     e:'🌋', img:'node_lava_rock', where:'火山',          d:'岩漿冷卻變硬就是火成岩,小洞是氣泡跑掉留下的;台灣的大屯山、龜山島、蘭嶼、綠島都是火山造成的。' },
    { id:'relic',      cat:'earth', n:'陶片與石器', e:'🏺', img:'node_relic',    where:'遺跡',           d:'台灣的十三行、卑南、大坌坑遺址都挖出過幾千年前的陶片和石器;考古學家靠這些碎片認識台灣的過去。' },
    /* 料理 */
    { id:'d_fish',    cat:'dish', n:'烤魚',     e:'🐟', img:'', where:'營火烹飪', d:'熱從表面「傳導」進魚肉,由外到內慢慢熟。' },
    { id:'d_jam',     cat:'dish', n:'野果醬',   e:'🫙', img:'', where:'營火烹飪', d:'小火讓水慢慢蒸發,果醬變濃稠;糖多也能防腐。' },
    { id:'d_soup',    cat:'dish', n:'野菇湯',   e:'🍲', img:'', where:'營火烹飪', d:'湯裡的熱靠「對流」上下翻滾,整鍋一起熱。' },
    { id:'d_stew',    cat:'dish', n:'鮮魚菇湯', e:'🥘', img:'', where:'營火烹飪', d:'煮到 100°C 的沸點能殺死細菌,野外的水一定要煮開。' },
    { id:'d_egg',     cat:'dish', n:'煎蛋',     e:'🍳', img:'', where:'營火烹飪', d:'蛋白遇熱從透明變白,是蛋白質「變性」——變了就變不回去。' },
    { id:'d_bread',   cat:'dish', n:'小米餅',   e:'🥞', img:'', where:'營火烹飪', d:'小米磨成粉加水,澱粉遇熱糊化就變好消化;原住民的小米糕就是這樣做的。' },
    { id:'d_pudding', cat:'dish', n:'羊奶布丁', e:'🍮', img:'', where:'營火烹飪', d:'奶加熱後蛋白質凝固,冷卻就變成會晃的布丁。' },
    /* 科技 */
    { id:'torch',   cat:'tech', n:'火把',  e:'🔦', img:'', where:'科技研究', d:'燃燒三要素:可燃物、空氣(氧)、溫度,缺一不可。' },
    { id:'pulley',  cat:'tech', n:'滑輪',  e:'📦', img:'', where:'科技研究', d:'定滑輪改變施力方向,動滑輪能省一半力氣。' },
    { id:'wheel',   cat:'tech', n:'水車',  e:'🎡', img:'', where:'科技研究', d:'流動的水推動葉片——水的「動能」變成轉動的能量;台灣的溪流落差大,以前很多水車磨坊。' },
    { id:'circuit', cat:'tech', n:'電路',  e:'💡', img:'', where:'科技研究', d:'電要繞成一個閉合的圈才會流;金屬導電、塑膠不導電。' },
    /* 島嶼謎題 */
    { id:'pz_forest',  cat:'puzzle', n:'年輪樹樁',   e:'🪵', img:'', where:'森林', d:'年輪一圈一年;寬圈=雨水多的好年。' },
    { id:'pz_river',   cat:'puzzle', n:'水車座',     e:'⚙', img:'', where:'溪流', d:'水往低處流,落差越大推力越強。' },
    { id:'pz_rock',    cat:'puzzle', n:'潮池',       e:'🦀', img:'', where:'岩岸', d:'漲潮退潮是月亮的引力拉著海水造成的。' },
    { id:'pz_grass',   cat:'puzzle', n:'風向草',     e:'🍃', img:'', where:'草原', d:'草往同一邊倒,就知道這裡常吹哪個方向的風;台灣冬天吹東北季風、夏天吹西南季風。' },
    { id:'pz_lake',    cat:'puzzle', n:'湖心石碑',   e:'🪨', img:'', where:'湖泊', d:'光在水裡會折射,看到的東西位置會偏。' },
    { id:'pz_cave',    cat:'puzzle', n:'迴聲池',     e:'🔊', img:'', where:'洞窟', d:'聲音撞到硬牆會反彈回來,就是回聲。' },
    { id:'pz_cliff',   cat:'puzzle', n:'風之柱',     e:'🗼', img:'', where:'懸崖', d:'越高的地方空氣越稀薄、氣壓越低。' },
    { id:'pz_valley',  cat:'puzzle', n:'磨坊遺址',   e:'🎡', img:'', where:'山谷', d:'磨坊靠水車把水的能量變成磨穀子的力。' },
    { id:'pz_ruins',   cat:'puzzle', n:'遺跡機關',   e:'🗿', img:'', where:'遺跡', d:'金屬是導體,把電路接成圈機關才會動。' },
    { id:'pz_volcano', cat:'puzzle', n:'火山口觀測台', e:'🌋', img:'', where:'火山', d:'島是海底火山噴出的岩漿堆起來的;火山灰讓土地變肥沃。台灣的龜山島就是這樣誕生的。' },
    /* 夜襲魔物 */
    { id:'shadow', cat:'monster', n:'影魔',   e:'👤', img:'mon_shadow', where:'夜襲', d:'影子是光被擋住形成的;光一照,影子就不見了。' },
    { id:'beetle', cat:'monster', n:'鐵甲蟲', e:'🪲', img:'mon_beetle', where:'夜襲', d:'磁鐵只吸鐵、鈷、鎳這類金屬,不吸銅和鋁。' },
    { id:'bat',    cat:'monster', n:'夜蝠',   e:'🦇', img:'mon_bat',    where:'夜襲', d:'蝙蝠發出超音波、聽回聲來找路,巨響會干擾牠。台灣有 30 多種蝙蝠。' },
    { id:'boar',   cat:'monster', n:'野豬',   e:'🐗', img:'mon_boar',   where:'夜襲', d:'台灣野豬用鼻子拱土找食物,山上的農田常被牠翻;遇到牠要保持距離、慢慢退開。' },
    /* ★ v1.11.0 甲/乙 */
    { id:'slime',    cat:'monster', n:'黏泥怪', e:'🟢', img:'mon_slime',    where:'夜襲(第 5 天起)、遺跡地下層', d:'鹽會把水從細胞裡吸出來(滲透作用),所以蛞蝓、蝸牛遇到鹽會脫水。醃菜、鹹魚也是同一個原理。' },
    { id:'ember',    cat:'monster', n:'火精',   e:'🔥', img:'mon_ember',    where:'夜襲(第 5 天起)、遺跡地下層', d:'燃燒三要素:可燃物、氧氣、溫度。潑水同時降溫又隔絕空氣;油鍋起火不能潑水,要蓋鍋蓋。' },
    { id:'basilisk', cat:'monster', n:'石化蛇', e:'🐍', img:'mon_basilisk', where:'夜襲(第 9 天起)、遺跡地下層', d:'光遇到光滑表面會反射,入射角等於反射角;潛望鏡、後照鏡都靠這個原理。' },
    { id:'spark',    cat:'monster', n:'雷精',   e:'⚡', img:'mon_spark',    where:'夜襲(第 9 天起)、遺跡地下層', d:'金屬是導體、橡膠塑膠是絕緣體;電線外面包塑膠、電工戴橡膠手套,都是為了不讓電流過到人身上。' },
    { id:'guardian', cat:'monster', n:'守墓石像', e:'🗿', img:'mon_guardian', where:'遺跡地下層 B3', d:'聲音是振動;把振動的頻率對上物體本身的頻率會共振,古時候軍隊過橋要打散步伐就是怕共振。' }
  ];
  D.codex = function(id){ var i; for(i=0;i<D.CODEX.length;i++){ if(D.CODEX[i].id===id) return D.CODEX[i]; } return null; };
  D.CODEX_MS = [ { at:10, shell:10, tech:2 }, { at:20, shell:15, tech:3 }, { at:30, shell:20, tech:4 }, { at:40, shell:30, tech:5 }, { at:50, shell:50, tech:8 } ];

  /* ══════════════════════════════════════════════════════════════════════════
   * ★ v1.7.0(2026-09-12 P4-b・老師「繼續」)— 🐾 動物訓練師 NPC(第三十六章:向動物 NPC 學習可換取四維 +1,每位每週限 1 次;
   *   練的是「解法知識」不是純數值):四位島民各守一區,對話 → 上課 3 題(答對 ≥2 才算學會)→ 對應四維 +1(上限 STAT_MAX)+ 對應技能 EXP +5。
   *   週 = Math.floor((day-1)/7);存 ISL.train[id] = 上次受訓的週序。上課耗 1 AP。O 甲:擬人化小動物。
   * ══════════════════════════════════════════════════════════════════════════ */
  D.TRAINERS = [
    { id:'crab', n:'陸蟹教練',   e:'🦀', img:'npc_crab', sz:72,   /* ★ v1.152.0 顯示高度 px(玩家 96px 為基準):陸蟹比人小很多,取 0.75 倍 */ stat:'dex', skill:'fish',     zone:'rock',   spot:{x:24,y:6},
      hello:[ '喀嚓喀嚓!我是陸蟹教練,老家在墾丁的海岸林。看我這對鉗子——又準又穩,這就是「巧手」。', '巧手不是天生的,是練出來的:眼睛先看準,手再慢慢跟上。', '想學?我出三個問題,答對兩題,你的手就會更聽話。' ],
      lesson:'拖東西的時候,先看清楚要放的格子,再一次到位——手忙腳亂只會放錯。',
      d:'台灣墾丁的陸蟹平常住在海岸林裡,每年夏天滿月夜會集體下海產卵,過馬路時需要人幫忙護送。' },
    { id:'deer', n:'梅花鹿教練', e:'🦌', img:'npc_deer', sz:106,   /* ★ v1.152.0 顯示高度 px(玩家 96px 為基準):梅花鹿肩高與小學生相近,取 1.1 倍 */ stat:'mov', skill:'gather',   zone:'grass',  spot:{x:26,y:14},
      hello:[ '嗨,我是梅花鹿教練!我們梅花鹿曾經在台灣消失,後來在墾丁重新野放回來了。草原上沒有誰跑得過我。', '「腳程」靠的是節奏:呼吸、步伐、看路,三件事一起做。', '答對我兩題,你走路就會更輕快。' ],
      lesson:'走遠路要走「直線」和「乾地」——淺水會慢 60%,繞一點路反而快。',
      d:'台灣梅花鹿身上有白色梅花斑;野外族群曾在 1969 年絕跡,靠墾丁的復育計畫才重新回到草原上。' },
    { id:'bear', n:'台灣黑熊師傅',   e:'🐻', img:'npc_bear', sz:192,   /* ★ v1.152.0 顯示高度 px(玩家 96px 為基準):台灣黑熊站起來約小孩兩倍高,老師指定大 1 倍 ⇒ 2 倍 */ stat:'pow', skill:'chop',     zone:'forest', spot:{x:26,y:13},
      hello:[ '吼——別怕,我是台灣黑熊師傅,胸前這個 V 字是我的招牌。這片森林的樹我都認識。', '「力氣」不是硬拉,是用對地方:槓桿、節奏、還有休息。', '答對兩題,我教你怎麼一斧劈得更深。' ],
      lesson:'連點的時候「有節奏」比「拼命點」有效——每一下都用力,手很快就痠了。',
      d:'台灣黑熊胸前有 V 字白毛;牠們會爬樹、會游泳,冬天在樹洞裡休息,靠秋天吃下的脂肪過冬。' },
    { id:'owl',  n:'領角鴞博士', e:'🦉', img:'npc_owl', sz:72,   /* ★ v1.152.0 顯示高度 px(玩家 96px 為基準):領角鴞是小型貓頭鷹,取 0.75 倍(再小就不好點) */  stat:'wit', skill:'research', zone:'river',  spot:{x:6,y:15},
      hello:[ '咕——我是領角鴞博士,台灣最常見的貓頭鷹,溪邊這棵樹是我的圖書館。', '「巧思」就是自然課老師說的:先觀察,再推理,最後動手驗證。', '答對兩題,你的腦筋會更靈光。' ],
      lesson:'拼圖卡住時,先從「終點」往回推——路只有一條能通,先排除不可能的。',
      d:'貓頭鷹的頭能轉 270 度,羽毛邊緣像梳子,飛起來幾乎沒聲音;牠是夜行性,靠大眼睛和超靈敏的耳朵找獵物。' }
  ];
  D.trainer = function(id){ var i; for(i=0;i<D.TRAINERS.length;i++){ if(D.TRAINERS[i].id===id) return D.TRAINERS[i]; } return null; };
  D.TRAIN_NEED = 2;   /* 3 題答對 ≥2 才算學會 */
  D.QUIZ = D.QUIZ || {};
  D.QUIZ.train_dex = [
    { q:'用鑷子夾小東西時,為什麼要看著尖端?', o:['眼睛看準,手才知道要往哪動','鑷子的尖端會自己感應找到東西','看著手腕的動作,會夾得比較準','其實不用看,憑感覺夾也能夾到'], a:0, why:'手眼協調:眼睛給位置,手照著做。' },
    { q:'螃蟹夾東西用的「鉗子」是什麼構造?', o:['像鑷子一樣的槓桿','像吸盤一樣,靠吸力吸住東西','像漁網一樣,把東西整個網住','像釣魚鉤一樣,把東西勾住'], a:0, why:'鉗子是一種槓桿,支點在關節,省力又精準。' },
    { q:'把石頭疊高不倒,最重要的是?', o:['重心放在下面的石頭上方','挑選的每一顆石頭都要盡量圓','堆疊的動作要盡量快,越快越穩','故意用最小顆的石頭墊在最上面'], a:0, why:'重心落在支撐面內,東西就不會倒。' },
    { q:'穿針引線時線一直穿不過,該怎麼辦?', o:['把線頭捻尖、對準針孔慢慢穿','不管三七二十一,直接用力硬戳進去','閉上一隻眼睛,單眼瞄準去穿針孔','乾脆換一條更粗的線,比較好抓握'], a:0, why:'細小的動作要「慢而準」,力氣大沒有用。' },
    { q:'手的哪個部位讓我們能抓握東西?', o:['能和其他手指相對的大拇指','手掌上一條一條彎彎曲曲的紋路','手指最前端那一小片硬硬的指甲','連接手掌和手臂那一段的手腕骨頭'], a:0, why:'大拇指能「對掌」,所以人類能拿工具。' }
  ];
  D.QUIZ.train_mov = [
    { q:'跑步時為什麼要配合呼吸?', o:['肌肉需要氧氣才有力氣','配合呼吸據說能讓腳變得更長','憋著氣不呼吸反而能跑得更快','其實配合呼吸和跑步一點關係也沒有'], a:0, why:'肌肉活動要用氧氣,呼吸跟不上就會喘、沒力。' },
    { q:'鹿的蹄分成兩瓣,有什麼好處?', o:['抓地力強,跑在草地和坡上不打滑','分成兩瓣比較好看,同伴才認得出來','張開來像蹼一樣,可以在水裡游得快','可以像手一樣夾住東西,方便抓食物'], a:0, why:'兩瓣蹄能張開,增加接觸面、不易滑。' },
    { q:'走在淺水裡為什麼比走在沙地慢?', o:['水的阻力比空氣大','是因為水的溫度太冰冷了','是因為水裡剛好有魚游過','是因為沙地踩起來特別有彈性'], a:0, why:'液體的阻力大,腳要花更多力氣推開水。' },
    { q:'長跑選手跑到一半覺得累,最好的做法是?', o:['放慢速度、調整呼吸再繼續','立刻停下來坐在地上休息一陣子','憋住呼吸不喘氣,用力往前衝刺','一口氣灌下大量的水再繼續跑'], a:0, why:'調整節奏讓身體恢復,才能跑得更遠。' },
    { q:'動物的「骨骼」和「肌肉」誰負責讓身體動?', o:['肌肉收縮拉動骨頭','其實是骨頭自己在動','其實是靠皮膚在動','其實是靠血液在動'], a:0, why:'肌肉收縮拉動骨頭,關節當作轉軸。' }
  ];
  D.QUIZ.train_pow = [
    { q:'砍樹時斧頭要從哪個角度砍最有效?', o:['斜著砍,讓刀刃切進木紋','垂直對著樹幹,用力正對著砍下去','角度隨便都可以,亂砍也沒關係','只需要輕輕砍在樹皮表面就好'], a:0, why:'斜切能順著木頭纖維劈開,比直砍省力。' },
    { q:'用長棍撬大石頭,支點放哪裡最省力?', o:['靠近石頭那邊','支點放在靠近手握的那一端','支點放在整根長棍的正中間','根本不需要用到任何支點'], a:0, why:'槓桿:支點離重物越近、離施力越遠,越省力。' },
    { q:'搬重物時正確的姿勢是?', o:['蹲下、背打直、用腿的力量站起來','彎下腰、用背的力量把東西拉起來','用單手抓住,另外一隻手空出來扶著','一口氣用力甩,把東西整個甩到肩膀上'], a:0, why:'腿的肌肉最有力,背打直才不會受傷。' },
    { q:'黑熊胸前的白色 V 字有什麼用?', o:['是台灣黑熊的特徵,方便辨認','到了晚上會發亮,用來嚇走敵人','白色的毛特別厚,冬天可以保暖','只是好看的花紋,沒有特別用途'], a:0, why:'台灣黑熊的胸前 V 字是牠的身分證。' },
    { q:'連續用力敲東西,為什麼手會痠?', o:['肌肉一直收縮沒休息,累積疲勞','手臂裡的骨頭被震得越來越短了','手上的血液慢慢變少,不夠用了','手臂吸收了力量,所以整隻變重'], a:0, why:'肌肉需要休息恢復,有節奏地出力才持久。' }
  ];
  D.QUIZ.train_wit = [
    { q:'貓頭鷹飛起來幾乎沒聲音,是因為?', o:['羽毛邊緣像梳子,能打散氣流','貓頭鷹飛行的速度本來就非常緩慢','貓頭鷹的翅膀長得特別小又輕巧','晚上的森林本來就比較安靜沒聲音'], a:0, why:'特殊的羽毛結構減少空氣的擾動,所以安靜。' },
    { q:'自然課的「科學方法」第一步是?', o:['觀察','直接猜答案','先做實驗','問別人'], a:0, why:'先觀察現象,才能提出問題和假設。' },
    { q:'走迷宮時卡住了,聰明的做法是?', o:['從終點往回找,排除死路','乾脆閉上眼睛,隨便亂走看看','原地站著不動,等別人來帶路','把每一條岔路都各走一遍看看'], a:0, why:'逆推與排除法能大幅減少要試的路線。' },
    { q:'貓頭鷹的眼睛長在正前方,有什麼好處?', o:['能判斷距離(立體視覺)','讓牠不管白天晚上都看得比較遠','讓牠的眼睛在晚上會微微發亮','讓牠不用轉頭也能看到後面'], a:0, why:'兩眼視野重疊才能判斷遠近,適合抓獵物。' },
    { q:'做完實驗結果和猜的不一樣,應該?', o:['誠實記錄,想想為什麼','偷偷把記錄下來的數據改掉','這次的結果乾脆完全不要記錄','什麼都不管,直接再重新猜一次'], a:0, why:'錯的假設也是發現,科學就是這樣進步的。' }
  ];
  D.SCENE.rock.trainer = 'crab'; D.SCENE.grass.trainer = 'deer'; D.SCENE.forest.trainer = 'bear'; D.SCENE.river.trainer = 'owl';
  D.IMG.npc_crab = 'island_npc_crab.png'; D.IMG.npc_deer = 'island_npc_deer.png'; D.IMG.npc_bear = 'island_npc_bear.png'; D.IMG.npc_owl = 'island_npc_owl.png';
  D.CODEX.push({ id:'crab', cat:'animal', n:'陸蟹教練',   e:'🦀', img:'npc_crab', where:'岩岸', d:'墾丁的陸蟹住在海岸林,夏天滿月夜集體下海產卵,是台灣特有的生態奇景。' });
  D.CODEX.push({ id:'deer', cat:'animal', n:'梅花鹿教練', e:'🦌', img:'npc_deer', where:'草原', d:'台灣梅花鹿野外族群曾絕跡,靠墾丁復育重新回到草原;身上的白斑像梅花。' });
  D.CODEX.push({ id:'bear', cat:'animal', n:'台灣黑熊師傅', e:'🐻', img:'npc_bear', where:'森林', d:'台灣黑熊是台灣唯一的熊,胸前有 V 字白毛;野外只剩幾百隻,是瀕臨絕種的保育類。' });
  D.CODEX.push({ id:'owl',  cat:'animal', n:'領角鴞博士', e:'🦉', img:'npc_owl',  where:'溪流', d:'領角鴞是台灣都市和郊山最常見的貓頭鷹,晚上「嘓—嘓—」叫;羽毛像梳子,飛起來幾乎沒聲音。' });

  /* ══════════════════════════════════════════════════════════════════════════
   * ★ v1.8.0(2026-09-12・老師三項需求)— ①動態背景(邏輯在 index 的 islAmb*:雲影/水面反光與浪/風中飄葉花瓣/風紋/雨;資源點植物 CSS 搖曳)
   *   ②天氣系統 WEATHER:晴天/毛毛雨/颱風,每日由 seed(uid|day|wx)決定(第 1~2 天必晴、颱風不連兩天),影響動物出沒與植物生長
   *   ③台灣化:所有自然生態改為台灣物種(見 SCENE 各 label、ITEMS、ANIMALS、CODEX、訓練師/阿獺文案)
   * ══════════════════════════════════════════════════════════════════════════ */
  D.WEATHER = {
    sunny:   { n:'晴天',   e:'☀', p:0.6, wind:1,   tint:null,               d:'太陽很大,萬物照常生長。台灣夏天的晴天要記得補水、戴帽子。',
               fx:'動物照常出沒;農田要自己澆水。' },
    rain:    { n:'毛毛雨', e:'🌧', p:0.3, wind:1.4, tint:'rgba(60,80,120,.18)', d:'台灣一年有一半的日子在下雨,春天的梅雨、夏天的午後雷陣雨都是水氣遇冷凝結變成的。',
               fx:'雨水幫農田澆水;魚、菇多長 1 個;野生動物躲雨(出現機率減半);水桶架多接 3 淡水。' },
    typhoon: { n:'颱風',   e:'🌀', p:0.1, wind:3,   tint:'rgba(25,35,60,.38)', d:'颱風是熱帶海面上的巨大低氣壓,在北半球逆時針旋轉;台灣每年夏秋平均會遇到 3~4 個。狂風暴雨時千萬不要靠近海邊和溪流!',
               fx:'走路慢 20%;溪魚與野生動物全部躲起來;資源點少 30%;漂流物多 2 個;夜裡魔物也躲雨(不夜襲);過後農田可能倒伏、建築耐久 −10。' }
  };
  D.WEATHER_ORDER = ['sunny', 'rain', 'typhoon'];
  D.STORY.typhoon = [ '風好大……樹整棵在搖,雨是橫著打過來的。', '自然課說過:颱風是海上的巨大低氣壓,逆時針轉,中心叫颱風眼。', '今天不能去溪邊,也不能去海邊。先把營地的東西綁好。' ];
  D.STORY.rainFirst = '滴滴答答……是毛毛雨。雨水會幫我澆田,可是動物們都躲起來了。';

  /* ══════════════════════════════════════════════════════════════════════════
   * ★ v1.14.0(2026-09-12・老師「繼續完成荒島求生」)— 📋 營地留言板 + 📜 阿獺委託板
   *   留言板(第三十七章「營地留言板」常駐展示版):存 ISL.board=[{n,t,at,day,own}],上限 BOARD_MAX,自己寫的與好友信件「📌 釘上」的都留著,不即讀即刪。
   *   委託板(第二十九章 NPC 委託):每遊戲日 seed=hash(uid|day|quest) 抽 QUEST.perDay 張;前兩張只從 basic 池抽,第三張(困難)從全部可接池抽、數量 ×hardMul、
   *   額外給 hardGive 之一;報酬貝幣 = round(SHOP.sell 單價 × 數量 × rewardMul) + rewardFlat;完成存 ISL.quest={day,done:{id:1},total};累計里程碑 QUEST.MS。
   *   need:{zone}|{bld}|{any:[…]} 決定「玩家現在有辦法取得」才會抽到(避免抽到還沒開的區域的東西)。
   * ══════════════════════════════════════════════════════════════════════════ */
  D.BOARD_MAX = 20;
  D.BOARD_TEXT_MAX = 40;
  D.QUEST = {
    perDay: 3, hardMul: 1.5, rewardMul: 1.6, rewardFlat: 2,
    pool: [
      { item:'wood',     min:4, max:8, basic:true,  why:'阿獺想修補河邊的小木橋——木材輕又能浮在水上,是天然的建材。' },
      { item:'stone',    min:3, max:6, basic:true,  why:'水獺會用石頭當工具敲開貝殼,這是少數會用工具的哺乳類喔。' },
      { item:'fiber',    min:4, max:8, basic:true,  why:'林投葉的纖維又長又韌,阿獺想編一張新的漁網。' },
      { item:'leaf',     min:3, max:6, basic:true,  why:'大片的葉子可以包食物、擋雨,葉子上的蠟質層讓水珠會滾走。' },
      { item:'berry',    min:3, max:6, basic:true,  why:'構樹的果實鳥和松鼠都愛吃,吃下去再把種子帶到別處——這叫種子傳播。' },
      { item:'shell',    min:2, max:4, basic:true,  why:'貝殼是碳酸鈣做的,阿獺收集起來磨成貝幣。' },
      { item:'pebble',   min:3, max:6, basic:true,  why:'卵石被溪水滾了幾百年才變圓,阿獺想拿來鋪店門口。' },
      { item:'feather',  min:2, max:4, basic:true,  why:'羽毛中空又輕,鳥才飛得起來;阿獺拿來當筆寫帳本。' },
      { item:'fish',     min:2, max:4, basic:true,  why:'水獺一天要吃掉體重 15% 的魚!阿獺今天想吃鮮的。' },
      { item:'mushroom', min:2, max:4, need:{zone:'forest'}, why:'野菇不是植物是真菌,不會行光合作用,靠分解落葉長大。' },
      { item:'reed',     min:3, max:6, need:{zone:'river'},  why:'蘆葦的莖裡有空氣通道,長在水邊也不會悶死,拿來鋪水道最好。' },
      { item:'trash',    min:3, max:6, need:{zone:'rock'},   why:'阿獺會把海廢分類回收,塑膠在海裡幾百年都不會消失。' },
      { item:'seed',     min:2, max:4, need:{zone:'forest'}, why:'一顆種子裡有胚和養分,阿獺想在店後面種一小片田。' },
      { item:'egg',      min:2, max:3, need:{any:[{zone:'cliff'},{bld:'pen'}]}, why:'蛋殼有幾千個小氣孔讓小雞呼吸,阿獺想做煎蛋。' },
      { item:'milk',     min:1, max:3, need:{bld:'pen'},      why:'羊奶要煮過才安全,加熱能殺死細菌——這叫巴斯德殺菌法。' },
      { item:'grain',    min:2, max:4, need:{any:[{zone:'valley'},{bld:'farm'}]}, why:'小米很耐旱,是台灣原住民最早種的穀物之一。' },
      { item:'d_fish',   min:1, max:2, need:{bld:'campfire'}, why:'烤魚用的是「輻射」和「傳導」把熱送進魚肉裡。' },
      { item:'d_soup',   min:1, max:2, need:{bld:'campfire'}, why:'湯裡的熱靠「對流」上下翻滾,每一口都熱呼呼。' },
      { item:'d_jam',    min:1, max:2, need:{bld:'campfire'}, why:'果醬糖分高,細菌吸不到水就長不了,所以能放很久。' },
      { item:'ore',      min:2, max:4, need:{zone:'cave'},    why:'鐵礦要用高溫把氧拿掉才變成鐵,這叫還原反應。' },
      { item:'crystal',  min:1, max:2, need:{zone:'cave'},    why:'水晶是石英慢慢結晶成的,六角柱是它天生的形狀。' },
      { item:'herb',     min:1, max:3, need:{zone:'cliff'},   why:'艾草的葉子背面有白絨毛,能減少水分蒸發,才長得住懸崖。' },
      { item:'honey',    min:1, max:2, need:{zone:'valley'},  why:'蜜蜂用翅膀搧風把花蜜的水分蒸發掉,才變成濃濃的蜂蜜。' },
      { item:'relic',    min:1, max:1, need:{zone:'ruins'},   why:'遺物是古人留下的線索,阿獺想放在店裡當展示品。' }
    ],
    hardGive: [ { item:'seed', n:2 }, { item:'water', n:3 }, { kind:'tech', n:1 }, { item:'herb', n:1 }, { item:'d_soup', n:1 } ],
    MS: [ { at:5, shell:20 }, { at:15, shell:50 }, { at:30, shell:100 }, { at:50, shell:200 } ],
    intro: [ '這是我的「委託板」——島上大家有需要的東西都會貼在這裡。', '幫忙送來,我付貝幣;每天都會換新的三張委託。', '第三張比較難,但報酬也比較好,還會多送一樣東西喔!' ],
    thanks: [ '太好了,謝謝你!', '正是我要的!', '有你在這座島真好。', '這批品質不錯喔!' ]
  };

  /* ══════════════ ★ v1.22.0(2026-09-13・老師四項):回合制遇敵戰鬥 + 多樣武器 ══════════════ */
  /* 魔物戰鬥數值(基準=第 1 級,依區域 order 逐級成長:hp +18%/級、atk +12%/級;def/spd 固定)。fear=怕的工具(沿用 MONSTERS.tool,🧠 智取用) */
  D.MON_BT = {
    boar:     { hp:26, atk:6,  def:1, spd:6,  crit:10, drop:{ shell:[2,4], item:'fiber',   p:0.5 }, d:'橫衝直撞的野豬,皮厚但笨。' },
    beetle:   { hp:30, atk:5,  def:3, spd:3,  crit:5,  drop:{ shell:[2,4], item:'ore',     p:0.25 }, d:'鐵甲很硬,普通攻擊會被彈掉一些。' },
    slime:    { hp:22, atk:5,  def:0, spd:4,  crit:5,  drop:{ shell:[1,3], item:'water',   p:0.5 }, d:'軟軟的,打起來不痛不癢,但會黏住你。' },
    bat:      { hp:20, atk:7,  def:1, spd:9,  crit:15, drop:{ shell:[2,5], item:'feather', p:0.6 }, d:'飛得快,常常先手。' },
    shadow:   { hp:28, atk:8,  def:1, spd:7,  crit:15, drop:{ shell:[3,6], item:'crystal', p:0.2 }, d:'影子怪,怕光。' },
    ember:    { hp:32, atk:9,  def:2, spd:5,  crit:10, drop:{ shell:[3,6], item:'ore',     p:0.4 }, d:'火精,碰到會燙傷。' },
    basilisk: { hp:36, atk:8,  def:3, spd:5,  crit:20, drop:{ shell:[4,7], item:'relic',   p:0.3 }, d:'石化蛇,被牠瞪到會暈眩。' },
    spark:    { hp:30, atk:10, def:1, spd:10, crit:20, drop:{ shell:[4,7], item:'crystal', p:0.35 }, d:'雷精,又快又痛。' },
    guardian: { hp:80, atk:12, def:4, spd:3,  crit:10, drop:{ shell:[10,15], item:'relic', p:1 },  d:'守墓石像。' }
  };
  /* 各區「踩地雷式」遇敵:每遊戲日依 seed 在可走格藏 n 個遇敵點(離出生/出口/資源點 ≥3 格),踩到就跳出魔物;from=第幾天起才有;lv=魔物等級(= 區域 order) */
  /* ★ v1.163.0 有了組隊系統(主角+3 隊友)之後,各區魔物的「數量」與「等級」全表重排。
     num:[最少,最多] = 一場戰鬥會出現幾隻(老師需求:較難的區域 2~4 隻,最多 4 隻);
     lv:[最低,最高]  = 該區魔物等級抽樣範圍。
     ⚠ v1.164.0 沙盤實跑後下修:MON_LV_HP 是每級 +18% HP、MON_LV_ATK 每級 +12% 攻擊,
       等級一拉到 30 幾,一隻魔物的 HP 就變成 7 倍、攻擊 5 倍,再乘上「一場 4 隻」,
       學生會在遺跡/火山被秒殺。現在的級距是舊版(等級＝區域 order,1~4)的約 3~4 倍,
       正好抵掉「一次要打 2~4 隻」,再由隊友把差距補回來。⚠ 這組數字要等老師實測再微調。
     n  = 舊的「踩地雷」隱藏遇敵點數量,P4 改成步數遇敵後這欄就會停用,先保留避免 P1 動到現行流程。 */
  D.ENC = {
    beach:   { n:1, from:1,  mons:['boar'],                       num:[1,1], lv:[1,2] },   /* ★ v1.27.0 起始區第 1 天就會遇到,只有 1 隻,不會太兇。★ v1.166.0 沙灘刻意維持原級距:這一區還沒有隊友可用 */
    forest:  { n:2, from:1,  mons:['boar','beetle'],              num:[1,2], lv:[4,7] },
    grass:   { n:2, from:1,  mons:['boar','slime'],               num:[1,2], lv:[6,9] },
    river:   { n:2, from:1,  mons:['slime','bat'],                num:[2,2], lv:[8,12] },
    rock:    { n:2, from:1,  mons:['beetle','slime'],             num:[2,2], lv:[10,14] },
    lake:    { n:3, from:1,  mons:['slime','bat'],                num:[2,3], lv:[12,17] },
    cave:    { n:3, from:1,  mons:['bat','shadow','beetle'],      num:[2,3], lv:[14,20] },
    cliff:   { n:3, from:1,  mons:['spark','boar'],               num:[2,3], lv:[16,23] },
    valley:  { n:3, from:1,  mons:['ember','beetle'],             num:[3,3], lv:[18,25] },
    ruins:   { n:4, from:1,  mons:['shadow','basilisk','spark'],  num:[3,4], lv:[20,27] },
    volcano: { n:4, from:1,  mons:['ember','basilisk'],           num:[3,4], lv:[24,31] }
  };
  /* ★ v1.163.0 野外遇敵改「步數制」(老師需求 5):每走 min~max 步隨機遭遇一次;
     戰鬥結束後 safeSteps 步內不再觸發,避免剛打完原地又被纏上。P4 於 index 端 islTick 接上。 */
  D.ENC_STEP = { min:15, max:30, safeSteps:8 };
  /* ★ v1.163.0 隊伍未滿提醒:進入區域時若隊友數 < needFrom[zone] 就提醒去招募(只提醒,不擋人) */
  D.ENC_TEAM_HINT = { beach:0, forest:1, grass:1, river:1, rock:2, lake:2, cave:2, cliff:2, valley:3, ruins:3, volcano:3 };
  D.BT = {
    FIST_ATK: 4, BASE_DEF: 0, POW_ATK: 0.5, DEX_HIT: 0.6, MOV_SPD: 1, WIT_STUN: 14,   /* 徒手攻擊 4;力氣每點 +0.5 攻;巧手每點甜蜜點 +0.6%;巧思 ≥14 智取免答 */
    DEFEND_CUT: 0.5, DEFEND_HEAL: 3,          /* 🛡 防禦:下一次受傷減半 + 回 3 */
    ESCAPE_BASE: 40, ESCAPE_MOV: 2,           /* 🏃 逃跑成功率 = 40% + 腳程×2%(上限 90%) */
    OUTWIT_DMG: 12, OUTWIT_STUN: 1,           /* 🧠 智取:選對它怕的工具 → 固定傷害 + 暈 1 回合;選錯 → 被反擊 */
    MON_LV_HP: 0.18, MON_LV_ATK: 0.12,        /* 魔物每級成長 */
    PLAYER_STUN_ON_CRIT: true,                /* 魔物暴擊 → 主角暈眩 1 回合 */
    TECH_PER_WIN: 1, TECH_DAY_CAP: 3,         /* 打贏 🔬+1(每天最多 3;補足科技點不足的通關鏈) */
    XP_WIN: 2, XP_LOSE: 1,                    /* 防衛技能 EXP */
    QTE_SPEED: 1.5,                           /* 攻擊甜蜜點指針速度 */
    /* ★ v1.163.0 老師需求 6:野外遇敵戰鬥音樂改用大對抗「貓空關小怪戰鬥曲」,每次隨機輪播一首。
       這五支 <audio> 早就在 minigame_index.html 裡(與大對抗 BATTLE_BGM_LIST 同一組),零素材上傳。
       ⚠ 只換「野外遇敵」;遺跡地下層與夜襲防衛戰維持既有 raid/raid2 氣氛曲不動。 */
    BGM_WILD: ['bgm-battle-01', 'bgm-battle-02', 'bgm-battle-03', 'bgm-battle-04', 'bgm-battle-05'],
    lines: { open: ['有東西跳出來了!', '小心——是魔物!', '牠擋在路上……'], win: ['趕跑了!', '太棒了!', '這一區安全多了。'], lose: ['眼前一黑……', '……好痛,撐不住了。'], flee: ['溜掉了!', '先躲一下再說。'], fleeFail: ['沒逃掉!', '被追上了!'] }
  };
  /* 武器(第三批需求):6 種,各有 ★1~3 品質(製作 QTE 決定)與 Lv1~5(製作台升級)。
   * atk=基礎攻擊;zone=甜蜜點寬度倍率(長槍寬、錘窄);spd=先手加成;crit=暴擊倍率;hits=一回合命中次數(迴力鏢 2 段);first=必先手(弓);stunP=命中時暈眩機率%(錘);def=防禦
   * hand=true 不用製作台就能做(棍棒/石斧:初期沒蓋製作台也能自保);up=每升 1 級的材料(× 當前 Lv)
   * 攻擊 = round((atk × (1 + 0.25×(★−1)) × (1 + 0.2×(Lv−1))) + 力氣×POW_ATK) */
  /* ══ ★ v1.27.0(2026-09-13・老師需求③「武器每升到 5/10/15/20 級時更換圖片,使武器看起來更厲害(仍以島上的素材做出來為原則)」)══
     6 種武器 × 5 個外觀階段 = 30 張(全部選配,缺圖自動退回上一階、再缺退 emoji;檔名 island_wp_<id>[_t2..t5].png)。
       無階(Lv1~4)=剛做好的樣子 / _t2(Lv5~9) / _t3(Lv10~14) / _t4(Lv15~19) / _t5(Lv20 滿級)。
     ⚠ 美術原則(老師指定):**只能用島上採得到的素材**(木、石、纖維、貝殼、羽毛、蘆葦、鐵礦、水晶、遺物、草藥),
        不可以出現鋼鐵鑄造、魔法發光劍那種「不屬於這座島」的東西;越後期是「做工更講究、綁得更紮實、鑲嵌更多島上珍稀素材」。 */
  D.IMG.wp_club = 'island_wp_club.png';
  D.IMG.wp_club_t2 = 'island_wp_club_t2.png';
  D.IMG.wp_club_t3 = 'island_wp_club_t3.png';
  D.IMG.wp_club_t4 = 'island_wp_club_t4.png';
  D.IMG.wp_club_t5 = 'island_wp_club_t5.png';
  D.IMG.wp_stoneaxe = 'island_wp_stoneaxe.png';
  D.IMG.wp_stoneaxe_t2 = 'island_wp_stoneaxe_t2.png';
  D.IMG.wp_stoneaxe_t3 = 'island_wp_stoneaxe_t3.png';
  D.IMG.wp_stoneaxe_t4 = 'island_wp_stoneaxe_t4.png';
  D.IMG.wp_stoneaxe_t5 = 'island_wp_stoneaxe_t5.png';
  D.IMG.wp_spear = 'island_wp_spear.png';
  D.IMG.wp_spear_t2 = 'island_wp_spear_t2.png';
  D.IMG.wp_spear_t3 = 'island_wp_spear_t3.png';
  D.IMG.wp_spear_t4 = 'island_wp_spear_t4.png';
  D.IMG.wp_spear_t5 = 'island_wp_spear_t5.png';
  D.IMG.wp_bow = 'island_wp_bow.png';
  D.IMG.wp_bow_t2 = 'island_wp_bow_t2.png';
  D.IMG.wp_bow_t3 = 'island_wp_bow_t3.png';
  D.IMG.wp_bow_t4 = 'island_wp_bow_t4.png';
  D.IMG.wp_bow_t5 = 'island_wp_bow_t5.png';
  D.IMG.wp_hammer = 'island_wp_hammer.png';
  D.IMG.wp_hammer_t2 = 'island_wp_hammer_t2.png';
  D.IMG.wp_hammer_t3 = 'island_wp_hammer_t3.png';
  D.IMG.wp_hammer_t4 = 'island_wp_hammer_t4.png';
  D.IMG.wp_hammer_t5 = 'island_wp_hammer_t5.png';
  D.IMG.wp_boomerang = 'island_wp_boomerang.png';
  D.IMG.wp_boomerang_t2 = 'island_wp_boomerang_t2.png';
  D.IMG.wp_boomerang_t3 = 'island_wp_boomerang_t3.png';
  D.IMG.wp_boomerang_t4 = 'island_wp_boomerang_t4.png';
  D.IMG.wp_boomerang_t5 = 'island_wp_boomerang_t5.png';
  D.WEAPONS = [
    { id:'club',      n:'棍棒',   e:'🏏', img:'wp_club',      atk:7,  def:1, zone:1.0, spd:0, crit:1.5, hits:1, hand:true,  cost:{wood:4, fiber:2},              up:{wood:3, fiber:1},
      d:'最簡單的武器,一根硬木頭。',   sci:'木頭有彈性又不會太重,揮起來不震手。',
      parts:[ {k:'body', n:'棒身', need:'wood', hint:'又直又硬的木頭', e:'🪵'}, {k:'grip', n:'握把', need:'fiber', hint:'纏一圈纖維才不會滑手', e:'🌿'} ] },
    { id:'stoneaxe',  n:'石斧',   e:'🪓', img:'wp_stoneaxe',  atk:9,  def:0, zone:0.9, spd:0, crit:2.0, hits:1, hand:true,  cost:{stone:3, wood:3, fiber:2},     up:{stone:2, wood:2, fiber:1},
      d:'磨尖的石頭綁在木柄上,暴擊特別痛。', sci:'石頭磨出刃口,受力面積小→壓力大,砍得進去。',
      parts:[ {k:'head', n:'石刃', need:'stone', hint:'磨出刃口的硬石頭', e:'🪨'}, {k:'shaft', n:'斧柄', need:'wood', hint:'木柄是槓桿,越長越省力', e:'🪵'}, {k:'bind', n:'綁繩', need:'fiber', hint:'綁緊石刃不飛出去', e:'🌿'} ] },
    { id:'spear',     n:'長槍',   e:'🔱', img:'wp_spear',     atk:10, def:1, zone:1.4, spd:1, crit:1.5, hits:1, hand:false, cost:{wood:6, stone:2, fiber:3},     up:{wood:3, stone:1, fiber:1},
      d:'又長又準,甜蜜點特別寬。',     sci:'長槍離魔物遠,也能先刺到——距離就是安全。',
      parts:[ {k:'shaft', n:'槍桿', need:'wood', hint:'長而直,才刺得遠', e:'🪵'}, {k:'tip', n:'槍尖', need:'stone', hint:'尖尖的,受力面積小', e:'🪨'}, {k:'bind', n:'綁繩', need:'fiber', hint:'把槍尖綁牢', e:'🌿'} ] },
    { id:'bow',       n:'弓箭',   e:'🏹', img:'wp_bow',       atk:8,  def:0, zone:1.0, spd:4, crit:1.8, hits:1, first:true, hand:false, cost:{wood:5, fiber:6, feather:2}, up:{wood:2, fiber:3, feather:1},
      d:'遠遠射過去,永遠先出手。',     sci:'拉弓把「彈性位能」存進弓身,放手變成箭的動能。',
      parts:[ {k:'limb', n:'弓身', need:'wood', hint:'要有彈性,彎了會彈回來', e:'🪵'}, {k:'string', n:'弓弦', need:'fiber', hint:'細又韌,拉緊不斷', e:'🌿'}, {k:'fletch', n:'箭羽', need:'feather', hint:'羽毛讓箭飛得直', e:'🪶'} ] },
    { id:'hammer',    n:'錘',     e:'🔨', img:'wp_hammer',    atk:14, def:2, zone:0.7, spd:-2, crit:1.5, hits:1, stunP:35, hand:false, cost:{stone:6, wood:4, fiber:2}, up:{stone:3, wood:2, fiber:1},
      d:'又重又慢,打中有機會把魔物打暈。', sci:'質量大、速度快 → 動量大,一錘下去魔物站不穩。',
      parts:[ {k:'head', n:'錘頭', need:'stone', hint:'又重又硬的大石頭', e:'🪨'}, {k:'shaft', n:'錘柄', need:'wood', hint:'長柄=長施力臂,更省力', e:'🪵'}, {k:'bind', n:'綁繩', need:'fiber', hint:'綁緊錘頭', e:'🌿'} ] },
    { id:'boomerang', n:'迴力鏢', e:'🪃', img:'wp_boomerang', atk:5,  def:0, zone:1.1, spd:2, crit:1.5, hits:2, hand:false, cost:{wood:5, fiber:2, shell:1},   up:{wood:3, fiber:1, shell:1},
      d:'丟出去打一下、飛回來再打一下(一回合兩段)。', sci:'彎彎的翼面像機翼,旋轉時產生升力才會轉一圈飛回來。',
      parts:[ {k:'wing', n:'翼身', need:'wood', hint:'兩片彎翼,像機翼一樣', e:'🪵'}, {k:'edge', n:'刃緣', need:'shell', hint:'貝殼磨利當刃', e:'🐚'}, {k:'grip', n:'握把', need:'fiber', hint:'纏纖維才好握', e:'🌿'} ] }
  ];
  /* ★ v1.25.0(2026-09-13・老師:所有武器也都能升級強化,最高 20 級,每次升級需要武器熟練值,裝備去打怪練功即可獲得,
     每次升級需要的素材都不同,升越高級需要越後期的資源)——
     熟練值:裝備著那把武器打贏魔物就會累積(islWeaponXpGain),存在武器實例的 xp 欄位,每把各自獨立。
     素材:武器本身的 up 表 × (1 + (Lv−1)×0.3) 為底,再依「升到第幾級」加上該階段的專屬素材(越後面越需要後期資源)。 */
  D.WEAPON_MAX_LV = 20;
  D.WEAPON_XP_NEED = function(lv){ return 3 + lv * 2; };   /* Lv→Lv+1 需要的熟練值:Lv1→2 要 5,Lv19→20 要 41,全程合計約 440 */
  D.WEAPON_XP_WIN = 3;                                     /* 打贏一隻魔物的基礎熟練值(再加魔物等級的一半) */
  D.WEAPON_UP_TIER = [                                     /* to = 升到第幾級為止適用;add = 該階段額外要的素材 */
    { to:4,  add:null,                                  n:'基礎強化',   d:'把原本的材料再補強一次就好。' },
    { to:8,  add:{ leaf:2, pebble:2 },                  n:'野外改良',   d:'加上大葉與小石子,握感與配重更好。' },
    { to:12, add:{ ore:2, shell:3 },                    n:'金屬補強',   d:'鑲上鐵礦與貝殼,硬度大幅提升。' },
    { to:16, add:{ crystal:1, trash:4 },                n:'工藝精修',   d:'水晶與回收的海廢材料做出精密配件。' },
    { to:20, add:{ relic:1, crystal:2, honey:1 },       n:'遺跡傳承',   d:'遺跡出土的遺物 + 水晶,只有跑過地下層才做得出來。' }
  ];
  D.weapon = function(id){ var i; for(i = 0; i < D.WEAPONS.length; i++){ if(D.WEAPONS[i].id === id) return D.WEAPONS[i]; } return null; };

  /* ══════════════════════════════════════════════════════════════════════════
   * ★ v1.150.0 — 🌟 天賦星域(技能樹)+ 🤒 不良狀態
   *   依《像素荒島求生記_戰鬥系統擴充_技能樹醫療寵物_設計規格 v1.0》實作。
   *   ⚠ 命名:規格書寫 ISL_SKILL_TREE_DEFS / ISL_STATUS_DEFS,本檔所有資料表都掛在 ISL_DB 的 D 底下,
   *     因此改為 D.SK_NODES / D.STATUS(對外就是 ISL_DB.SK_NODES),避免出現兩套命名慣例。
   *   ⚠ 節點效果一律走「效果鍵 eff:{key:值}」累加制,index 端只有 islSkEff(key) 一個消費點,
   *     日後加節點只要加資料、不必再改戰鬥程式。
   *   ⚠ wp 欄 = 只有裝備該武器時才生效(武器星域的節點);沒有 wp 欄 = 常駐。
   *     棍棒石斧星域吃 club 與 stoneaxe 兩把(老師裁定:它們共用一個星域)。
   *   ⚠ x/y = 星圖畫布座標(畫布 1240×1020,中央基礎星域在 (600,500) 附近),節點直徑 64。
   * ══════════════════════════════════════════════════════════════════════════ */
  D.SK_CANVAS = { w:1240, h:1020, cx:600, cy:500 };
  D.SK_GALAXY = [
    { k:'core',      n:'中央基礎星域',   e:'✨', c:'#ffd166' },
    { k:'bow',       n:'弓箭星域',       e:'🏹', c:'#7bed9f' },
    { k:'club',      n:'棍棒石斧星域',   e:'🪵', c:'#ff9f43' },
    { k:'hammer',    n:'錘星域',         e:'🔨', c:'#c9a0ff' },
    { k:'spear',     n:'長槍星域',       e:'🔱', c:'#5fb3d9' },
    { k:'boomerang', n:'迴力鏢星域',     e:'🪃', c:'#f7b6cf' },
    { k:'med',       n:'醫療急救星域',   e:'🩹', c:'#ff7b7b' },
    { k:'cmd',       n:'特殊指令星域',   e:'🎯', c:'#5fe0c0' }   /* ★ v1.163.0 點亮後可到 👤 能力頁裝設,野外/戰鬥會多出按鈕(消耗 ⚡AP) */
  ];
  /* 關鍵節點解鎖的主動技能(戰鬥中「✨ 絕招」鈕,每場戰鬥 1 次;裝備對應武器才會出現) */
  D.SK_ACTS = {
    bow_volley:   { n:'連射',     e:'🏹', d:'連續射出 3 箭(每箭 60% 傷害,必中)',               hits:3, mul:0.60 },
    club_smash:   { n:'猛擊',     e:'🪵', d:'一記重擊 2.2 倍傷害,並讓目標防禦 −30%(整場)',     hits:1, mul:2.20, defDown:0.30 },
    spear_combo:  { n:'突刺連環', e:'🔱', d:'貫穿 2 段(各 1.2 倍),並讓目標流血 2 層',           hits:2, mul:1.20, bleed:2 },
    hammer_quake: { n:'地裂重擊', e:'🔨', d:'1.8 倍傷害,必定擊暈 2 回合',                        hits:1, mul:1.80, stun:2 },
    boom_dance:   { n:'迴旋亂舞', e:'🪃', d:'迴力鏢橫掃 4 段(各 55% 傷害,必中)',                hits:4, mul:0.55 }
  };
  /* 節點:id/g 星域/n 名稱/req 前置(全部要有)/x,y 星圖座標/d 效果說明/eff 效果鍵/wp 限定武器/key 關鍵節點/act 主動技能/sci 小知識 */
  D.SK_NODES = [
    /* ── 中央基礎星域(無前置,一開始就能點) ── */
    { id:'SK_CORE_HP',   g:'core', n:'強健', e:'💪', req:[], x:543, y:443, d:'最大體力 +10%；每日 ⚡AP +1', eff:{ hpMaxP:10, apAdd:1, apAdd:1 } },
    { id:'SK_CORE_ATK',  g:'core', n:'蠻力', e:'⚔',  req:[], x:657, y:443, d:'物理攻擊 +5%；砍樹/採石 產量 +1', eff:{ atkP:5, chopAdd:1, quarryAdd:1, chopAdd:1, quarryAdd:1 } },
    { id:'SK_CORE_SPD',  g:'core', n:'敏捷', e:'💨', req:[], x:543, y:557, d:'行動速度 +5%；島上走路速度 +12%', eff:{ spdP:5, moveP:12, moveP:12 } },
    { id:'SK_CORE_LUCK', g:'core', n:'幸運', e:'🍀', req:[], x:657, y:557, d:'稀有掉落率 +5%；馴養成功率 +10%', eff:{ luckP:5, tameP:10, tameP:10 } },
    /* ── 弓箭星域 ── */
    { id:'SK_BOW_1',   g:'bow', wp:['bow'], n:'穩定持弓', e:'🎯', req:['SK_CORE_ATK'], x:600, y:340, d:'暴擊率 +5%；所有 QTE 甜蜜點 +8%', eff:{ critC:5, sweetP:8 } },
    { id:'SK_BOW_2',   g:'bow', wp:['bow'], n:'遠射',     e:'🏹', req:['SK_BOW_1'], x:666, y:228, d:'傷害 +10%', eff:{ dmgP:10 }, sci:'箭離弦後靠慣性前進,拉得越滿、飛得越遠。' },
    { id:'SK_BOW_3',   g:'bow', wp:['bow'], n:'快手',     e:'⚡', req:['SK_BOW_1'], x:534, y:228, d:'命中後 10% 機率不消耗這個回合；所有 QTE 指針變慢 12%', eff:{ freeP:10, qteSlowP:12 } },
    { id:'SK_BOW_4',   g:'bow', wp:['bow'], n:'連續命中', e:'📈', req:['SK_BOW_2','SK_BOW_3'], x:600, y:124, d:'同一場連續命中疊加傷害(最高 +20%)；所有 QTE 甜蜜點 +5%', eff:{ comboP:20, sweetP:5 } },
    { id:'SK_BOW_KEY', g:'bow', wp:['bow'], key:true, act:'bow_volley', n:'連射', e:'🌟', req:['SK_BOW_4'], x:600, y:30, d:'★關鍵節點:解鎖主動技能「連射」' },
    /* ── 棍棒石斧星域 ── */
    { id:'SK_CLUB_1',   g:'club', wp:['club','stoneaxe'], n:'握把纏繩', e:'🎯', req:['SK_CORE_ATK'], x:443, y:467, d:'暴擊率 +5%；所有 QTE 甜蜜點 +8%', eff:{ critC:5, sweetP:8 } },
    { id:'SK_CLUB_2',   g:'club', wp:['club','stoneaxe'], n:'趁亂追擊', e:'💫', req:['SK_CLUB_1'], x:348, y:379, d:'對「暈眩中」的目標傷害 +25%；砍樹產量 +1', eff:{ vsStunP:25, chopAdd:1 } },
    { id:'SK_CLUB_3',   g:'club', wp:['club','stoneaxe'], n:'反擊',     e:'🛡', req:['SK_CLUB_1'], x:320, y:508, d:'受擊時 15% 機率立刻反擊；島上活動失誤受傷 −30%', eff:{ counterP:15, hurtCutP:30 } },
    { id:'SK_CLUB_4',   g:'club', wp:['club','stoneaxe'], n:'破防',     e:'🪨', req:['SK_CLUB_2','SK_CLUB_3'], x:232, y:422, d:'連續攻擊同一目標疊加破防(每次 −8% 防禦,最多 −40%)；採石產量 +1', eff:{ breakP:8, quarryAdd:1 } },
    { id:'SK_CLUB_KEY', g:'club', wp:['club','stoneaxe'], key:true, act:'club_smash', n:'猛擊', e:'🌟', req:['SK_CLUB_4'], x:140, y:402, d:'★關鍵節點:解鎖主動技能「猛擊」' },
    /* ── 錘星域 ── */
    { id:'SK_HAMMER_1',   g:'hammer', wp:['hammer'], n:'穩握錘柄', e:'🎯', req:['SK_CORE_ATK'], x:474, y:599, d:'暴擊率 +5%；所有 QTE 甜蜜點 +8%', eff:{ critC:5, sweetP:8 } },
    { id:'SK_HAMMER_2',   g:'hammer', wp:['hammer'], n:'震盪',     e:'😵', req:['SK_HAMMER_1'], x:345, y:615, d:'擊暈機率 +12%；採石產量 +1', eff:{ stunAddP:12, quarryAdd:1 }, sci:'重物撞擊會把能量變成震動傳出去。' },
    { id:'SK_HAMMER_3',   g:'hammer', wp:['hammer'], n:'硬扛',     e:'🛡', req:['SK_HAMMER_1'], x:426, y:719, d:'每次受傷固定減 3；島上活動失誤受傷 −30%', eff:{ dmgCut:3, hurtCutP:30 } },
    { id:'SK_HAMMER_4',   g:'hammer', wp:['hammer'], n:'蓄力',     e:'🔋', req:['SK_HAMMER_2','SK_HAMMER_3'], x:304, y:731, d:'防禦後的下一擊傷害 +35%；建造/製作品質 ★ +1', eff:{ chargeP:35, craftStar:1 } },
    { id:'SK_HAMMER_KEY', g:'hammer', wp:['hammer'], key:true, act:'hammer_quake', n:'地裂重擊', e:'🌟', req:['SK_HAMMER_4'], x:230, y:789, d:'★關鍵節點:解鎖主動技能「地裂重擊」' },
    /* ── 長槍星域 ── */
    { id:'SK_SPEAR_1',   g:'spear', wp:['spear'], n:'槍身平衡', e:'🎯', req:['SK_CORE_ATK'], x:594, y:660, d:'暴擊率 +5%；所有 QTE 甜蜜點 +8%', eff:{ critC:5, sweetP:8 } },
    { id:'SK_SPEAR_2',   g:'spear', wp:['spear'], n:'掃擊',     e:'🌀', req:['SK_SPEAR_1'], x:525, y:770, d:'攻擊帶小範圍(甜蜜點寬度 +18%)', eff:{ zoneP:18 } },
    { id:'SK_SPEAR_3',   g:'spear', wp:['spear'], n:'先發制人', e:'🥇', req:['SK_SPEAR_1'], x:656, y:774, d:'每場戰鬥第一擊必定命中；所有 QTE 指針變慢 12%', eff:{ firstHit:1, qteSlowP:12 } },
    { id:'SK_SPEAR_4',   g:'spear', wp:['spear'], n:'放血',     e:'🩸', req:['SK_SPEAR_2','SK_SPEAR_3'], x:587, y:876, d:'命中時疊加流血(每層每回合 −2)；捕魚產量 +1', eff:{ bleedOn:1, fishAdd:1 } },
    { id:'SK_SPEAR_KEY', g:'spear', wp:['spear'], key:true, act:'spear_combo', n:'突刺連環', e:'🌟', req:['SK_SPEAR_4'], x:584, y:970, d:'★關鍵節點:解鎖主動技能「突刺連環」' },
    /* ── 迴力鏢星域 ── */
    { id:'SK_BOOMERANG_1',   g:'boomerang', wp:['boomerang'], n:'手感', e:'🎯', req:['SK_CORE_ATK'], x:719, y:607, d:'暴擊率 +5%；所有 QTE 甜蜜點 +8%', eff:{ critC:5, sweetP:8 } },
    { id:'SK_BOOMERANG_2',   g:'boomerang', wp:['boomerang'], n:'雙迴旋', e:'🪃', req:['SK_BOOMERANG_1'], x:758, y:731, d:'一回合多命中 1 次；島上走路速度 +10%', eff:{ hitsAdd:1, moveP:10 }, sci:'迴力鏢彎曲的翼形讓它一邊旋轉一邊繞回來。' },
    { id:'SK_BOOMERANG_3',   g:'boomerang', wp:['boomerang'], n:'回收',   e:'♻', req:['SK_BOOMERANG_1'], x:846, y:633, d:'命中後 25% 機率多賺 1 點武器熟練(省資源)；採集作答時間 +8%', eff:{ xpBackP:25, actSecP:8 } },
    { id:'SK_BOOMERANG_4',   g:'boomerang', wp:['boomerang'], n:'追打',   e:'💫', req:['SK_BOOMERANG_2','SK_BOOMERANG_3'], x:879, y:752, d:'對「暈眩中/被擊退」的目標傷害 +20%；所有 QTE 指針變慢 10%', eff:{ vsStunP:20, qteSlowP:10 } },
    { id:'SK_BOOMERANG_KEY', g:'boomerang', wp:['boomerang'], key:true, act:'boom_dance', n:'迴旋亂舞', e:'🌟', req:['SK_BOOMERANG_4'], x:949, y:814, d:'★關鍵節點:解鎖主動技能「迴旋亂舞」' },
    /* ── 醫療急救星域:包紮 / 藥學 / 烹飪 三條子路徑(星域內互通,見 D.SK_MED_LINK) ── */
    { id:'SK_MED_BND_1',   g:'med', sub:'bnd', dep:1, n:'止血',     e:'🩹', req:['SK_CORE_HP'],     x:860,  y:300, d:'戰鬥中可止血:去除自己身上的流血/蜂螫；島上活動失誤受傷 −25%', eff:{ bleedCure:1, hurtCutP:25 } },
    { id:'SK_MED_BND_2',   g:'med', sub:'bnd', dep:2, n:'緊急包紮', e:'🧻', req:['SK_MED_BND_1'],   x:952,  y:300, d:'每場戰鬥 1 次:立刻回復 30% 體力(不用藥草)', eff:{ bandageP:30, bandageN:1 } },
    { id:'SK_MED_BND_3',   g:'med', sub:'bnd', dep:3, n:'為隊友包紮', e:'🤝', req:['SK_MED_BND_2'], x:1044, y:300, d:'★多人連線用;單人時:緊急包紮可用次數 +1、回復量 +10%', eff:{ bandageN:1, bandageP:10, allyBnd:1 } },
    { id:'SK_MED_BND_KEY', g:'med', sub:'bnd', dep:4, key:true, n:'不倒的意志', e:'🌟', req:['SK_MED_BND_3'], x:1136, y:300, d:'★關鍵節點:每場戰鬥 1 次,體力歸零時保留 1 點不算戰敗', eff:{ deathSave:1 } },
    { id:'SK_MED_PHM_1',   g:'med', sub:'phm', dep:1, n:'辨識野生藥草', e:'🍀', req:['SK_CORE_LUCK'], x:860,  y:420, d:'採集時 🍀草藥 掉落機率 +25%；馴養成功率 +15%', eff:{ herbP:25, tameP:15 }, sci:'認得出植物才敢用——不認得的野草絕對不能亂吃。' },
    { id:'SK_MED_PHM_2',   g:'med', sub:'phm', dep:2, n:'基礎解毒劑', e:'🧪', req:['SK_MED_PHM_1'],   x:952,  y:420, d:'可調配解毒劑,解除蛇咬中毒(需 🍀草藥 1)', eff:{ poisonCure:1 } },
    { id:'SK_MED_PHM_3',   g:'med', sub:'phm', dep:3, n:'毒素抗性',   e:'🛡', req:['SK_MED_PHM_2'],   x:1044, y:420, d:'中毒每回合傷害減半,惡化速度也減半；島上活動失誤受傷 −25%', eff:{ poisonResP:50, hurtCutP:25 } },
    { id:'SK_MED_PHM_KEY', g:'med', sub:'phm', dep:4, key:true, n:'進階解毒劑', e:'🌟', req:['SK_MED_PHM_3'], x:1136, y:420, d:'★關鍵節點:一次解除身上所有不良狀態(每天 1 次,需 🍀草藥 1)', eff:{ cureAll:1 } },
    { id:'SK_MED_CK_1',   g:'med', sub:'ck', dep:1, n:'恢復料理',   e:'🍲', req:['SK_CORE_HP'],    x:860,  y:540, d:'吃料理回復量 +20%,熱食可解除失溫；養的動物每日產出 +20%', eff:{ dishP:20, coldCure:1, petYieldP:20 } },
    { id:'SK_MED_CK_2',   g:'med', sub:'ck', dep:2, n:'保存食物',   e:'🫙', req:['SK_MED_CK_1'],   x:952,  y:540, d:'25% 機率吃了料理卻不消耗那一份；餵動物也有 25% 不消耗飼料', eff:{ dishSaveP:25, petFeedSaveP:25 }, sci:'曬乾、煙燻、加鹽都能讓食物不容易壞——因為細菌沒有水就長不起來。' },
    { id:'SK_MED_CK_3',   g:'med', sub:'ck', dep:3, n:'消除疲勞',   e:'⚡', req:['SK_MED_CK_2'],   x:1044, y:540, d:'每天第一次吃料理額外回復 ⚡AP 1；養的動物每日產出 +25%', eff:{ dishAp:1, petYieldP:25 } },
    { id:'SK_MED_CK_KEY', g:'med', sub:'ck', dep:4, key:true, n:'營地聚餐', e:'🌟', req:['SK_MED_CK_3'], x:1136, y:540, d:'★多人連線用;在營地辦聚餐:今天攻擊 +10%(每天 1 次,需任一道料理)；養的動物每日產出 +25%、馴養成功率 +15%', eff:{ feast:1, petYieldP:25, tameP:15 } }
  ];
  /* 醫療星域內部互通:某節點的前置若沒點,但同星域已有「深度 ≥ 本節點深度−1」的節點,也算前置達成
     ⇒ 點完「包紮 2 號」可以直接接「藥學 1 號」,不必繞回中央基礎星域。 */
  /* ★ v1.163.0 ── 🎯 特殊指令星域(8 節點,全部落在星圖右下方原本的空白區,既有 41 個節點座標零更動) ──
     每個節點帶一個 cmd 鍵 → 對應 D.SK_CMDS;點亮 = 解鎖該指令,還要到能力頁裝設(上限 D.SK_CMD_SLOTS)才會出現按鈕。 */
  D.SK_NODES.push(
    { id:'SK_CMD_1', g:'cmd', cmd:'CMD_SCAN',      n:'環境觀察', e:'🔍', req:['SK_CORE_LUCK'],           x:1030, y:655, d:'解鎖特殊指令「🔍 環境觀察」(野外・⚡1)', eff:{}, sci:'先觀察再行動,是所有野外工作的第一步。' },
    { id:'SK_CMD_2', g:'cmd', cmd:'CMD_FIRSTAID',  n:'戰場急救', e:'🩹', req:['SK_CMD_1'],                x:1140, y:655, d:'解鎖特殊指令「🩹 戰場急救」(戰鬥・⚡2)', eff:{}, sci:'急救的順序是先止血、再保暖,最後才送醫。' },
    { id:'SK_CMD_3', g:'cmd', cmd:'CMD_SMOKE',     n:'煙霧彈',   e:'💨', req:['SK_CMD_1'],                x:985,  y:745, d:'解鎖特殊指令「💨 煙霧彈」(戰鬥・⚡1)',   eff:{}, sci:'濃煙會遮住動物的視線與氣味,是很老的脫身方法。' },
    { id:'SK_CMD_4', g:'cmd', cmd:'CMD_QUICKPICK', n:'熟練採集', e:'🧺', req:['SK_CMD_1'],                x:1095, y:745, d:'解鎖特殊指令「🧺 熟練採集」(野外・⚡2)', eff:{}, sci:'熟練來自重複練習,動作會慢慢變成身體記得的事。' },
    { id:'SK_CMD_5', g:'cmd', cmd:'CMD_TRAP',      n:'佈設陷阱', e:'🪤', req:['SK_CMD_2'],                x:1200, y:745, d:'解鎖特殊指令「🪤 佈設陷阱」(戰鬥・⚡2)', eff:{}, sci:'陷阱靠的是「位能一次放掉」,所以小小的繩子也能絆倒大東西。' },
    { id:'SK_CMD_6', g:'cmd', cmd:'CMD_CALL',      n:'呼喚夥伴', e:'📣', req:['SK_CMD_3'],                x:1030, y:845, d:'解鎖特殊指令「📣 呼喚夥伴」(野外+戰鬥・⚡1)', eff:{}, sci:'動物能分辨熟悉的聲音,叫名字比大吼有用。' },
    { id:'SK_CMD_7', g:'cmd', cmd:'CMD_RALLY',     n:'鼓舞號令', e:'⚡', req:['SK_CMD_4'],                x:1140, y:845, d:'解鎖特殊指令「⚡ 鼓舞號令」(戰鬥・⚡2)', eff:{}, sci:'一起喊口號會讓人動作更同步,這叫「節律同調」。' },
    { id:'SK_CMD_8', g:'cmd', cmd:'CMD_REST', key:true, n:'野外小憩', e:'🔥', req:['SK_CMD_6','SK_CMD_7'], x:1085, y:945, d:'★解鎖特殊指令「🔥 野外小憩」(野外・⚡3)', eff:{}, sci:'休息時身體會把血糖轉回肌肉裡的肝醣,這就是「恢復」。' }
  );
  D.SK_MED_LINK = true;
  /* 關鍵節點頭銜(自動取得,可同時擁有多個,不鎖點法) */
  D.SK_TITLES = [
    { id:'T_GUARD',  n:'拓荒衛士',     e:'🛡', cond:'anyKey:SK_CLUB_KEY,SK_HAMMER_KEY', d:'防禦 +5%',        eff:{ defP:5 } },
    { id:'T_VAN',    n:'破陣前鋒',     e:'🔱', cond:'key:SK_SPEAR_KEY',                 d:'控場命中率 +10%', eff:{ stunAddP:10 } },
    { id:'T_HUNTER', n:'遊林獵人',     e:'🏹', cond:'key:SK_BOW_KEY',                   d:'暴擊傷害 +10%',   eff:{ critMulP:10 } },
    { id:'T_NIMBLE', n:'靈巧行者',     e:'🪃', cond:'key:SK_BOOMERANG_KEY',             d:'採集作答時間 +10%', eff:{ actSecP:10 } },
    { id:'T_MEDIC',  n:'戰場醫官',     e:'⚕', cond:'wpKeyAndMedKey',                   d:'治療/解毒效果 +15%', eff:{ healP:15 } },
    { id:'T_PIONEER',n:'拓荒者(全能)', e:'🌏', cond:'weapon2x3',                        d:'採集額外產出機率 +10%', eff:{ gatherP:10 } }
  ];
  /* 🧙 拜訪巫醫(重整天賦):阿獺雜貨鋪的服務;第 n 次洗點的貝幣價 = base + step×已洗次數(無次數上限) */
  D.SK_RESPEC = { base:30, step:20 };

  /* ── 🤒 不良狀態(觸發來源掛在既有分區/天氣,不另開觸發邏輯) ──
     days = 沒治療時自然衰退需要的天數(比一般恢復慢);dot = 戰鬥中每回合扣的體力。 */
  D.STATUS = {
    beesting:  { n:'蜂螫',     e:'🐝', days:2, d:'腫脹,瞄不準(甜蜜點縮小 25%)',      from:'森林/山谷採集意外', hitMul:0.75,          cure:['SK_MED_BND_1'], cureN:'止血包紮', sci:'蜂針會留下蟻酸,冰敷可以消腫止痛。' },
    snakebite: { n:'蛇咬中毒', e:'🐍', days:3, d:'每回合 −3 體力,拖越久越嚴重',      from:'森林/懸崖遭遇',     dot:3, worsen:true,   cure:['SK_MED_PHM_2'], cureN:'解毒劑', need:'herb', sci:'被蛇咬要記住牠的樣子、不要跑動,讓毒擴散得慢一點。' },
    burn:      { n:'燒燙傷',   e:'🔥', days:2, d:'每回合 −2 體力,速度 −20%',         from:'火山區',            dot:2, spdMul:0.8,    cure:['SK_MED_BND_2'], cureN:'緊急包紮', sci:'燙傷要「沖脫泡蓋送」,先用冷水沖十五分鐘。' },
    cold:      { n:'失溫',     e:'🥶', days:2, d:'攻擊/防禦/速度全部 −15%',          from:'颱風天沒做好保暖',  allMul:0.85,          cure:['SK_MED_CK_1'], cureN:'熱食', sci:'風會把體溫帶走,淋濕又吹風最容易失溫。' },
    infect:    { n:'感染',     e:'🦠', days:4, d:'每回合 −2 體力,治療效果打對折',    from:'外傷拖太久沒處理',  dot:2, healMul:0.5,   cure:['SK_MED_PHM_KEY'], cureN:'進階解毒劑', sci:'傷口一定要先洗乾淨,細菌繁殖起來比外傷本身更麻煩。' }
  };
  D.STATUS_ORDER = ['beesting', 'snakebite', 'burn', 'cold', 'infect'];
  /* 觸發機率(%);沒點到對應治療節點的玩家仍可靠自然衰退與商店藥品應急,不會被卡死 */
  D.STATUS_ROLL = {
    beesting:  { zones:['forest','valley'], p:15 },
    snakebite: { zones:['forest','cliff'],  p:12 },
    burn:      { zones:['volcano'],         p:20 },
    cold:      { p:30 },
    infect:    { p:35 }
  };
  /* ══════════════════════════════════════════════════════════════════════════
   * ★ v1.163.0 — 🐾 探險編組／夥伴／寵物 資料層(P1)
   *   老師需求(2026-09-15):寵物加入戰鬥,各自有等級/HP/攻/防/速/專屬指令,最高 50 級;
   *   探險編組 = 主角 + 3 位隊友(隊友可以是好友或寵物);初期 NPC 動物完成課題後可邀請入營成為隊友。
   *   ⚠ 本輪只落資料表與存檔欄位,戰鬥引擎(1v1 → 4v4)在 P2 改寫,UI 在 P3,步數遇敵在 P4。
   *   ⚠ 站位規則(老師指定):友軍最右側第一位 = 最前鋒。由前到後 =
   *      坦克型 → 主角 → 攻擊型 → 控場型 → 治療型(D.PARTY.ROW 就是這個順序的索引)。
   * ══════════════════════════════════════════════════════════════════════════ */
  D.PET_TYPES = {
    tank: { n:'坦克型', e:'🛡', row:0, d:'站在主角身前,優先代替隊友承受攻擊' },
    atk:  { n:'攻擊型', e:'⚔',  row:2, d:'站在主角身後、控場型之前' },
    ctrl: { n:'控場型', e:'✨', row:3, d:'站在主角身後' },
    heal: { n:'治療型', e:'💚', row:4, d:'站在隊伍最後面' }
  };
  D.PARTY = {
    MAX_ALLY: 3,                                   /* 主角 + 3 位隊友 */
    ROW: { tank:0, hero:1, atk:2, ctrl:3, heal:4 },/* 由前到後的站位索引(數字小 = 靠前鋒) */
    TANK_COVER_P: 60,                              /* 坦克型代替後排承受攻擊的機率(%) */
    TANK_CUT_P: 30,                                /* 代受時自身再減傷(%) */
    FRIEND_READONLY: true                          /* ★ 老師裁定:借用版好友角色不可改屬性/裝備,也不會升級(消費點:islPetsGainAfterWin 的跳過條件) */
  };
  /* 借用版好友:每次開「探險編組」頁選定好友時,才向 minigameIslandPublic 重抓一次快照(老師裁定 2) */
  D.PARTY_FRIEND = { MAX:1 };   /* ★ v1.167.0 稽核:SNAP_ON/FIELDS 是兩個沒有消費點的死鍵(重抓時機寫死在 islPartyOpen、欄位由 islFriendCacheSet 決定),移除避免誤導 */

  /* ── 夥伴專屬指令(戰鬥中該夥伴自己的按鈕;cd = 冷卻回合數,0 = 每回合可用) ──
     ★ v1.164.0 每一招補上 fx 數值物件,index 端 islBtPetCmd 只認 fx 的欄位、不寫死任何一招的數字:
       hits/mul 段數與倍率・sure 必中・all 打全體・critAdd 這一擊暴擊率加成・stunP/stun 暈眩機率與回合・
       heal 單體治療(% 最大體力)・healAll 全隊治療・cure 解除一種不良狀態・shield 全隊護盾(% 最大體力)・
       defUpP/spdUpP 全隊增益・guard/cut 代受與減傷・taunt 強制敵方本回合只打自己・
       hitDownP/spdDownP/seal 敵方減益・first 這回合先手・dur 效果持續回合數。 */
  D.PET_CMDS = {
    /* A 組:四位 NPC 夥伴 */
    guard:      { n:'守護',       e:'🛡', cd:2, fx:{ guard:1, cut:40, dur:1 }, d:'1 回合內代替任一隊友承受攻擊,並把傷害再減 40%' },
    herbheal:   { n:'草藥療傷',   e:'🌿', cd:3, fx:{ heal:18 }, d:'指定一位隊友回復 18% 最大體力' },   /* ★ v1.166.0 平衡:25%/cd2 → 18%/cd3。沙盤實跑 11 區都是 100% 勝率且幾乎不掉血,根因就是治療量壓過傷害 */
    dive:       { n:'靜音俯衝',   e:'🦉', cd:2, fx:{ mul:1.8, first:1 }, d:'1.8 倍傷害,且這一回合必定先手' },
    sandwind:   { n:'風沙亂舞',   e:'🕊', cd:3, fx:{ all:1, hitDownP:25, dur:2 }, d:'敵方全體命中率 −25%,持續 2 回合' },
    /* B 組:攻擊型 */
    doubleclaw: { n:'二段攻擊',   e:'🐾', cd:1, fx:{ hits:2, mul:0.75 }, d:'連續兩爪,每爪 75% 傷害' },
    flockrush:  { n:'群飛突擊',   e:'🪶', cd:2, fx:{ hits:3, mul:0.5, sure:1 }, d:'三段掠擊,每段 50% 傷害,必中' },
    talondive:  { n:'蒼鷹撲擊',   e:'🦅', cd:3, fx:{ mul:2.2, critAdd:30 }, d:'2.2 倍傷害,這一擊暴擊率 +30%' },
    /* B 組:坦克型 */
    curlguard:  { n:'鱗甲捲護',   e:'🦔', cd:3, fx:{ defUpP:40, dur:2 }, d:'全隊防禦 +40%,持續 2 回合' },
    shellwall:  { n:'龜甲壁',     e:'🐢', cd:3, fx:{ shield:15 }, d:'給全隊一層護盾,各吸收 15% 最大體力的傷害' },
    clawtaunt:  { n:'巨螯嘲諷',   e:'🦀', cd:2, fx:{ taunt:1, cut:50, dur:1 }, d:'這一回合敵方全體只能攻擊自己,自身減傷 50%' },
    /* B 組:治療型 */
    dewheal:    { n:'露水治癒',   e:'💧', cd:2, fx:{ heal:15 }, d:'指定一位隊友回復 15% 最大體力' },   /* ★ v1.166.0 平衡:cd1 的治療＝每隔一回合就補滿,等於無限續航 */
    glowlight:  { n:'螢光普照',   e:'🌟', cd:3, fx:{ healAll:12, cure:1 }, d:'全隊回復 12% 最大體力,並解除一種不良狀態' },
    clearstream:{ n:'清流一躍',   e:'🐟', cd:3, fx:{ healAll:10, spdUpP:20, dur:2 }, d:'全隊回復 10% 最大體力,速度 +20% 持續 2 回合' },
    /* B 組:控場型 */
    throwstone: { n:'投石',       e:'🪨', cd:1, fx:{ mul:1.0, stunP:35, stun:1 }, d:'造成傷害,並有 35% 機率讓目標暈眩 1 回合' },
    sweepbill:  { n:'橫掃扁嘴',   e:'🥄', cd:2, fx:{ all:1, mul:0.6, spdDownP:25, dur:2 }, d:'敵方全體受到 60% 傷害,速度 −25% 持續 2 回合' },
    drumecho:   { n:'啄木聲波',   e:'🥁', cd:3, fx:{ all:1, seal:1, dur:1 }, d:'敵方全體 1 回合內無法使用技能(只能普通攻擊)' }
  };

  /* ── 夥伴名冊(A 組 4 位 NPC + B 組 12 隻台灣寵物;共 16 位) ──
     b = Lv1 基礎值;g = 每升一級的成長值(小數,顯示時取整);cmd = 專屬指令;
     talent = 常駐天賦被動;get = 取得方式(npc=完成課題後邀請入營 / tame=野外馴養 / shop=阿獺雜貨鋪稀有換購);
     sci = 自然知識一句(夥伴圖鑑用,與既有自然圖鑑同一種口吻)。 */
  D.PETS = {
    /* ── A 組:四位 NPC 夥伴(完成各自課題後可邀請到營地居住) ── */
    gull:        { n:'海鷗小白',   e:'🕊', type:'ctrl', npc:true, sz:72,
                   b:{ hp:30, atk:6,  def:3, spd:9 }, g:{ hp:2.6, atk:0.6, def:0.35, spd:0.38 },
                   cmd:'sandwind',  talent:'領路人:在野外要多走 5 步才會遇敵(牠會先發現危險)', tal:{ encAdd:5 },
                   get:{ how:'npc', quest:'gull_intro' },
                   sci:'黑尾鷗每年冬天從日本、韓國飛到台灣北海岸過冬,翅膀長又窄,能乘海風滑翔很久不用拍翅。' },
    bear:        { n:'台灣黑熊',   e:'🐻', type:'tank', npc:true, sz:192,
                   b:{ hp:46, atk:6,  def:5, spd:3 }, g:{ hp:4.4, atk:0.55, def:0.65, spd:0.14 },
                   cmd:'guard',     talent:'厚實胸膛:代替隊友承受攻擊的機率再 +15%', tal:{ coverAddP:15 },
                   get:{ how:'npc', quest:'trainer_bear' },
                   sci:'台灣黑熊是台灣唯一的熊,胸前有 V 字白毛;野外只剩幾百隻,是瀕臨絕種的保育類。' },
    deer:        { n:'梅花鹿',     e:'🦌', type:'heal', npc:true, sz:106,
                   b:{ hp:26, atk:4,  def:2, spd:7 }, g:{ hp:2.3, atk:0.4,  def:0.3,  spd:0.3 },
                   cmd:'herbheal',  talent:'識草本能:自己施放的治療效果 +15%', tal:{ healOutP:15 },
                   get:{ how:'npc', quest:'trainer_deer' },
                   sci:'梅花鹿曾在台灣野外絕跡,靠人工復育才重新回到墾丁的草原上。' },
    owl:         { n:'領角鴞',     e:'🦉', type:'atk',  npc:true, sz:72,
                   b:{ hp:28, atk:10, def:2, spd:8 }, g:{ hp:2.5, atk:1.05, def:0.25, spd:0.32 },
                   cmd:'dive',      talent:'無聲之翼:在隊友中第一個出手時傷害 +12%', tal:{ firstDmgP:12 },
                   get:{ how:'npc', quest:'trainer_owl' },
                   sci:'領角鴞的飛羽邊緣有細細的鋸齒,能把氣流打散,飛起來幾乎沒有聲音。' },

    /* ── B 組:攻擊型 3 隻 ── */
    leopardcat:  { n:'石虎',       e:'🐆', type:'atk',
                   b:{ hp:27, atk:10, def:2, spd:8 }, g:{ hp:2.4, atk:1.10, def:0.24, spd:0.34 },
                   cmd:'doubleclaw', talent:'夜行獵手:目標體力低於一半時,自己的攻擊 +20%', tal:{ lowHpAtkP:20 },
                   get:{ how:'tame', zone:'forest', p:22 },
                   sci:'石虎是台灣僅存的野生貓科動物,耳朵背面有白斑,住在淺山的草叢與果園附近。' ,
                   food:'fish', quiz:[
        { q:'石虎的耳朵背面有什麼特徵？', o:['白色斑點','黑色條紋','透明的毛','紅色斑點'], a:0, why:'石虎耳朵背面有白斑，是辨認牠的特徵之一。' },
        { q:'石虎主要住在哪種環境？', o:['高山寒帶森林','淺山的草叢和果園附近','深海珊瑚礁','沙漠'], a:1, why:'石虎多棲息在淺山的草叢、果園與農地附近。' },
        { q:'石虎是台灣哪一類動物中僅存的野生成員？', o:['貓科','犬科','熊科','鹿科'], a:0, why:'石虎是台灣目前僅存的野生貓科動物。' },
        { q:'石虎最喜歡吃什麼？', o:['水果','老鼠等小型動物','樹葉','海藻'], a:1, why:'石虎主要獵食老鼠等小型動物。' },
        { q:'石虎目前在台灣的族群狀況是？', o:['非常多，到處都是','瀕臨絕種的保育類動物','已經絕種了','是外來入侵種'], a:1, why:'石虎野外數量稀少，是瀕臨絕種的保育類動物。' },
        { q:'石虎最常在什麼時間活動？', o:['大白天','黃昏與夜間','正中午','完全不活動'], a:1, why:'石虎多在黃昏到夜間活動覓食。' },
        { q:'石虎最大的生存威脅是什麼？', o:['天敵太多','棲地破壞與道路車禍','食物太多吃太胖','氣候太冷'], a:1, why:'棲地被開發與道路車禍（路殺）是石虎最大的威脅。' },
        { q:'石虎和家貓最大的不同是什麼？', o:['石虎是野生動物，家貓是馴化的寵物','石虎不會爬樹','石虎沒有尾巴','石虎只吃素'], a:0, why:'石虎是野生動物，家貓是被人類長期馴化的寵物。' },
        { q:'苗栗、南投一帶保護石虎最重要的行動是什麼？', o:['多蓋道路','設置友善通道、減少路殺','多噴農藥','把石虎抓來當寵物'], a:1, why:'設置生態友善通道能減少石虎被車撞的機會。' },
        { q:'石虎的英文名字裡有哪個字，形容牠身上的花紋？', o:['Leopard（豹）','Tiger（虎）','Lion（獅）','Panda（熊貓）'], a:0, why:'石虎的英文 Leopard cat，取名自牠身上像豹一樣的斑點花紋。' }
      ] },
    bluemagpie:  { n:'台灣藍鵲',   e:'🐦', type:'atk',
                   b:{ hp:25, atk:9,  def:2, spd:10 }, g:{ hp:2.2, atk:0.98, def:0.22, spd:0.40 },
                   cmd:'flockrush',  talent:'長尾陣列:隊伍中每多一位夥伴,自己攻擊 +5%', tal:{ perAllyAtkP:5 },
                   get:{ how:'tame', zone:'grass', p:26 },
                   sci:'台灣藍鵲會「家族幫手」育雛,哥哥姊姊會一起幫忙餵弟弟妹妹,是台灣特有種。' ,
                   food:'berry', quiz:[
        { q:'台灣藍鵲最特別的育兒行為是什麼？', o:['自己單獨育雛','哥哥姊姊會一起幫忙餵弟弟妹妹','把蛋丟給別的鳥孵','完全不照顧幼鳥'], a:1, why:'台灣藍鵲有「家族幫手」行為，哥哥姊姊會協助餵養弟妹。' },
        { q:'台灣藍鵲是不是台灣特有種？', o:['是，只有台灣才有','不是，世界各地都有','是從國外引進的','是人工培育的品種'], a:0, why:'台灣藍鵲是台灣特有種，只在台灣才看得到。' },
        { q:'台灣藍鵲的尾羽有什麼特色？', o:['很短幾乎看不到','長長的，顏色鮮豔','是透明的','會發光'], a:1, why:'台灣藍鵲擁有長而鮮豔的尾羽，十分醒目。' },
        { q:'台灣藍鵲屬於什麼食性？', o:['只吃肉','只吃素','雜食，水果和小動物都吃','完全不進食'], a:2, why:'台灣藍鵲是雜食性，果實與小動物都吃。' },
        { q:'台灣藍鵲又被稱作什麼別名？', o:['長尾山娘','國寶魚','森林小飛俠','台灣雲豹'], a:0, why:'台灣藍鵲有「長尾山娘」的別名。' },
        { q:'台灣藍鵲通常以什麼方式群體行動？', o:['單獨行動，不合群','家族群體一起活動','只跟其他鳥種混群','只在夜間出現'], a:1, why:'台灣藍鵲習慣以家族群體方式共同活動。' },
        { q:'台灣藍鵲的羽毛主要是什麼顏色？', o:['全身雪白','亮麗的藍色配黑色頭','全身黑色','全身紅色'], a:1, why:'台灣藍鵲羽色以鮮豔的藍色搭配黑色頭部為特徵。' },
        { q:'保護台灣藍鵲棲地最重要的是什麼？', o:['多砍伐森林','保留低海拔的森林環境','把牠們抓去動物園','噴大量農藥'], a:1, why:'保留低海拔森林環境，藍鵲才有地方築巢覓食。' },
        { q:'台灣藍鵲在保護幼鳥時會有什麼行為？', o:['完全不理會入侵者','會成群鳴叫、俯衝驅趕入侵者','立刻棄巢逃跑','把幼鳥藏到地底下'], a:1, why:'台灣藍鵲會群體合作，鳴叫俯衝驅趕靠近巢的入侵者。' },
        { q:'台灣藍鵲主要棲息在台灣的什麼地區？', o:['低、中海拔山區森林','海邊沙灘','高山寒原','都市水泥地'], a:0, why:'台灣藍鵲主要棲息在低、中海拔的山區森林。' }
      ] },
    eagle:       { n:'大冠鷲',     e:'🦅', type:'atk',
                   b:{ hp:29, atk:11, def:3, spd:7 }, g:{ hp:2.6, atk:1.15, def:0.28, spd:0.28 },
                   cmd:'talondive',  talent:'高空視野:自己的普通攻擊有 8% 機率暴擊(1.5 倍)', tal:{ critP:8 },
                   get:{ how:'tame', zone:'cliff', p:14 },
                   sci:'大冠鷲盤旋時會發出「呼——悠」的長鳴,靠上升氣流幾乎不用拍翅就能升高。' ,
                   food:'egg', quiz:[
        { q:'大冠鷲盤旋飛行時會發出什麼聲音？', o:['呼嚕呼嚕','呼——悠的長鳴','喵喵叫','完全不出聲'], a:1, why:'大冠鷲盤旋時常發出「呼——悠」的長鳴聲。' },
        { q:'大冠鷲主要靠什麼力量升高飛翔，而不太需要拍翅膀？', o:['噴射引擎','上升氣流','彈跳助跑','同伴推牠'], a:1, why:'大冠鷲善用上升氣流盤旋升高，省力飛行。' },
        { q:'大冠鷲最喜歡的主要食物是什麼？', o:['蛇類','海藻','樹葉','花蜜'], a:0, why:'大冠鷲以蛇類為主食，又稱蛇鵰。' },
        { q:'大冠鷲屬於哪一類鳥？', o:['游禽','猛禽（掠食性鳥類）','鳴禽','家禽'], a:1, why:'大冠鷲是掠食性的猛禽。' },
        { q:'大冠鷲的視力特色是什麼？', o:['視力很差，靠嗅覺獵食','視力極佳，能從高空發現獵物','完全看不見','只在夜間看得見'], a:1, why:'猛禽視力極佳，能在高空發現地面的獵物。' },
        { q:'大冠鷲喜歡棲息在什麼樣的環境？', o:['低海拔到中海拔的森林上空','深海','沙漠','都市地下道'], a:0, why:'大冠鷲常出沒在低到中海拔的森林上空盤旋。' },
        { q:'大冠鷲的尾羽通常有什麼樣的花紋？', o:['純白色沒有花紋','有明顯的橫紋','全黑無紋','透明看不到'], a:1, why:'大冠鷲尾羽上有明顯的橫紋，是辨識特徵之一。' },
        { q:'大冠鷲屬於保育類動物，牠面臨的主要威脅是什麼？', o:['棲地開發與盜獵','天敵太少太安全','食物太多','氣候太熱'], a:0, why:'棲地開發與盜獵是大冠鷲面臨的主要威脅。' },
        { q:'大冠鷲又被稱作什麼別名？', o:['蛇鵰','國寶魚','長尾山娘','台灣雲豹'], a:0, why:'大冠鷲因主食蛇類，別名「蛇鵰」。' },
        { q:'大冠鷲飛行時常做出什麼特殊動作吸引人注意？', o:['低空快速直線飛行','定點盤旋、繞圈翱翔','倒著飛','貼著水面飛'], a:1, why:'大冠鷲常在空中定點盤旋繞圈，十分醒目。' }
      ] },

    /* ── B 組:坦克型 3 隻 ── */
    pangolin:    { n:'穿山甲',     e:'🦔', type:'tank',
                   b:{ hp:44, atk:5,  def:5, spd:3 }, g:{ hp:4.2, atk:0.48, def:0.66, spd:0.15 },
                   cmd:'curlguard',  talent:'鱗片護體:自己受到的傷害固定再減 8%', tal:{ cutP:8 },
                   get:{ how:'tame', zone:'forest', p:16 },
                   sci:'穿山甲的鱗片和我們的指甲一樣是角蛋白,遇到危險會捲成一顆球保護柔軟的肚子。' ,
                   food:'honey', quiz:[
        { q:'穿山甲的鱗片主要成分和我們身上的什麼一樣？', o:['骨頭','指甲（角蛋白）','牙齒','頭髮的顏色'], a:1, why:'穿山甲的鱗片和人類的指甲一樣，都是角蛋白構成的。' },
        { q:'穿山甲遇到危險時會怎麼保護自己？', o:['立刻逃跑','捲成一顆球','噴出毒液','裝死不動'], a:1, why:'穿山甲遇險時會把身體捲成一顆球，用鱗片保護柔軟的腹部。' },
        { q:'穿山甲主要吃什麼食物？', o:['螞蟻和白蟻','大型哺乳動物','水果','魚類'], a:0, why:'穿山甲以螞蟻和白蟻為主食。' },
        { q:'穿山甲挖開蟻窩靠的是什麼？', o:['銳利的爪子','牙齒啃咬','噴水沖開','請其他動物幫忙'], a:0, why:'穿山甲用銳利的前爪挖開蟻窩。' },
        { q:'穿山甲的舌頭有什麼特色？', o:['很短幾乎看不到','又細又長，方便伸進蟻穴','是分岔的','會變色'], a:1, why:'穿山甲的舌頭又細又長，能伸進蟻穴舔食螞蟻。' },
        { q:'穿山甲是全世界走私最嚴重的哺乳動物之一，主要原因是什麼？', o:['肉和鱗片被非法交易','太可愛被當寵物','牠們主動接近人類','牠們會攻擊農作物'], a:0, why:'穿山甲的肉與鱗片遭到非法交易，是走私最嚴重的哺乳動物之一。' },
        { q:'穿山甲主要在什麼時候活動？', o:['大白天','夜間','正中午最活躍','完全不活動'], a:1, why:'穿山甲主要在夜間出來活動覓食。' },
        { q:'穿山甲沒有牙齒，牠如何磨碎食物？', o:['用胃裡的砂石磨碎','用舌頭嚼碎','直接吞下不用磨','用前爪先咬碎'], a:0, why:'穿山甲沒有牙齒，靠吞下的砂石在胃裡把食物磨碎。' },
        { q:'台灣穿山甲屬於什麼保育等級？', o:['普通動物，數量很多','珍貴稀有的保育類動物','外來入侵種','已經滅絕'], a:1, why:'台灣穿山甲是珍貴稀有的保育類動物。' },
        { q:'穿山甲的英文名字 pangolin 源自馬來語，意思和牠的什麼行為有關？', o:['「會捲起來的東西」','「跑得很快的動物」','「愛吃甜食的動物」','「會飛的動物」'], a:0, why:'pangolin 一詞源自馬來語，意思是「會捲起來的東西」，正好描述牠遇險捲成球的習性。' }
      ] },
    turtle:      { n:'綠蠵龜',     e:'🐢', type:'tank',
                   b:{ hp:48, atk:4,  def:6, spd:2 }, g:{ hp:4.6, atk:0.42, def:0.70, spd:0.12 },
                   cmd:'shellwall',  talent:'護盾傳承:自己給的護盾再 +20%', tal:{ shieldP:20 },
                   get:{ how:'tame', zone:'beach', p:12 },
                   sci:'綠蠵龜會回到自己出生的沙灘產卵;小海龜的性別是由沙子的溫度決定的。' ,
                   food:'mushroom', quiz:[
        { q:'母綠蠵龜產卵時有什麼特別的行為？', o:['隨便找地方下蛋','回到自己出生的沙灘產卵','在海裡直接產卵','把蛋咬在嘴裡'], a:1, why:'母綠蠵龜會回到自己出生的沙灘上岸產卵。' },
        { q:'小海龜的性別是由什麼決定的？', o:['媽媽的心情','沙子的溫度','爸爸媽媽的血型','月亮的形狀'], a:1, why:'綠蠵龜的性別由孵化時沙子的溫度決定。' },
        { q:'綠蠵龜主要吃什麼食物？', o:['海藻和海草','大型魚類','陸地上的果實','昆蟲'], a:0, why:'成年綠蠵龜主要以海藻、海草為食。' },
        { q:'為什麼海龜有時候會誤食海洋垃圾？', o:['垃圾很好吃','塑膠袋在水中很像水母','海龜喜歡收集垃圾','垃圾會發出聲音吸引牠'], a:1, why:'漂浮在水中的塑膠袋外觀很像水母，容易讓海龜誤食。' },
        { q:'綠蠵龜的名字「綠蠵」是因為什麼是綠色的？', o:['牠的殼是綠色的','牠體內脂肪偏綠色','牠的眼睛是綠色的','牠生活在綠色的海域'], a:1, why:'綠蠵龜體內脂肪偏綠色，因此得名，殼本身其實是褐色的。' },
        { q:'小海龜孵化後第一件事是做什麼？', o:['立刻潛入深海睡覺','爬向海邊、游向大海','回到蛋殼裡休息','等媽媽來帶路'], a:1, why:'小海龜孵化後會立刻爬向海邊，游向大海。' },
        { q:'綠蠵龜是保育類動物，牠面臨的威脅之一是什麼？', o:['沙灘光害讓小海龜迷失方向','天敵太少','食物太多長太胖','海水太乾淨'], a:0, why:'沙灘上的人工光害會讓剛孵化的小海龜迷失爬向海洋的方向。' },
        { q:'綠蠵龜屬於什麼動物？', o:['哺乳類','爬蟲類','魚類','兩棲類'], a:1, why:'海龜屬於爬蟲類動物。' },
        { q:'成年綠蠵龜的體型有多大？', o:['比手掌還小','殼長可達 1 公尺左右，體重上百公斤','和螞蟻差不多大','和大象一樣大'], a:1, why:'成年綠蠵龜體型相當大，殼長可達 1 公尺左右。' },
        { q:'台灣哪些地方是知名的海龜產卵地？', o:['澎湖望安、小琉球','合歡山','阿里山','日月潭'], a:0, why:'澎湖望安與小琉球是台灣知名的海龜上岸產卵地點。' }
      ] },
    coconutcrab: { n:'椰子蟹',     e:'🦀', type:'tank',
                   b:{ hp:40, atk:7,  def:4, spd:4 }, g:{ hp:3.9, atk:0.60, def:0.58, spd:0.18 },
                   cmd:'clawtaunt',  talent:'硬殼反震:自己被攻擊時反彈 10% 傷害給對方', tal:{ thornP:10 },
                   get:{ how:'tame', zone:'rock', p:15 },
                   sci:'椰子蟹是世界上最大的陸生甲殼類,螯力大到能剝開椰子,但要三十年才長到成年。' ,
                   food:'d_jam', quiz:[
        { q:'椰子蟹是世界上最大的哪一類動物？', o:['陸生甲殼類','海洋哺乳類','昆蟲類','兩棲類'], a:0, why:'椰子蟹是世界上體型最大的陸生甲殼類動物。' },
        { q:'椰子蟹的螯力有多大？', o:['很弱，連紙都夾不破','大到能剝開堅硬的椰子殼','根本沒有螯','只能用來游泳'], a:1, why:'椰子蟹的螯力驚人，能剝開堅硬的椰子外殼。' },
        { q:'椰子蟹要花多久時間才會長成成年個體？', o:['一星期','一個月','大約三十年','一天'], a:2, why:'椰子蟹成長緩慢，要花大約三十年才會長成成年個體。' },
        { q:'椰子蟹的食性是什麼？', o:['只吃肉','雜食性，熟軟的果實也愛吃','只喝水不進食','只吃石頭'], a:1, why:'椰子蟹是雜食性，熟軟的果實也是牠喜歡的食物。' },
        { q:'椰子蟹雖然住在陸地上，但牠的祖先來自哪裡？', o:['高山','海洋（牠是寄居蟹的近親）','沙漠','河流上游'], a:1, why:'椰子蟹是寄居蟹的近親，祖先來自海洋。' },
        { q:'椰子蟹平常大多躲在哪裡休息？', o:['完全露天曝曬','躲在洞穴或石縫裡','漂浮在海面上','掛在樹枝上'], a:1, why:'椰子蟹白天多躲在洞穴或石縫裡避免曝曬與天敵。' },
        { q:'為什麼椰子蟹在台灣變得越來越少見？', o:['過度捕捉與棲地破壞','牠們自己搬到國外去了','食物太多長太胖','天敵太少'], a:0, why:'過度捕捉與棲地破壞使椰子蟹在台灣數量大幅減少。' },
        { q:'椰子蟹主要在什麼時候出來活動覓食？', o:['大白天','夜間','正中午','從不活動'], a:1, why:'椰子蟹通常在夜間出來活動覓食。' },
        { q:'椰子蟹身體最外層覆蓋著什麼保護自己？', o:['柔軟的皮膚','堅硬的外殼（甲殼）','厚厚的羽毛','透明的黏液'], a:1, why:'椰子蟹全身覆蓋堅硬的甲殼保護自己。' },
        { q:'台灣哪個離島以椰子蟹聞名，設有保護區？', o:['綠島','澎湖本島','金門','馬祖'], a:0, why:'綠島是台灣知名的椰子蟹棲地，設有保護措施。' }
      ] },

    /* ── B 組:治療型 3 隻 ── */
    treefrog:    { n:'莫氏樹蛙',   e:'🐸', type:'heal',
                   b:{ hp:24, atk:4,  def:2, spd:7 }, g:{ hp:2.2, atk:0.38, def:0.28, spd:0.30 },
                   cmd:'dewheal',    talent:'濕潤皮膚:雨天或颱風天,自己的治療效果 +25%', tal:{ rainHealP:25 },
                   get:{ how:'tame', zone:'river', p:24 },
                   sci:'莫氏樹蛙腳趾末端有吸盤,能牢牢黏在葉片上;牠是台灣特有種,叫聲像「啾啾啾」。' ,
                   food:'herb', quiz:[
        { q:'莫氏樹蛙的腳趾末端有什麼構造，讓牠能黏在葉片上？', o:['小鉤子','吸盤','黏液腺','尖爪'], a:1, why:'莫氏樹蛙腳趾末端有吸盤，能牢牢黏在葉片上。' },
        { q:'莫氏樹蛙是不是台灣特有種？', o:['是，只有台灣才有','不是，全世界都有','是從國外引進的','是人工培育的'], a:0, why:'莫氏樹蛙是台灣特有種青蛙。' },
        { q:'莫氏樹蛙的叫聲聽起來像什麼？', o:['啾啾啾','汪汪汪','喵喵喵','嗡嗡嗡'], a:0, why:'莫氏樹蛙的叫聲聽起來像「啾啾啾」。' },
        { q:'青蛙皮膚有什麼特殊功能？', o:['可以呼吸，需要保持濕潤','完全防水不透氣','可以噴火','會自動變色隱形'], a:0, why:'青蛙的皮膚能輔助呼吸，需要保持濕潤才能發揮作用。' },
        { q:'莫氏樹蛙主要棲息在什麼樣的環境？', o:['乾燥的沙漠','潮濕的森林、溪流附近','深海','高山雪地'], a:1, why:'莫氏樹蛙喜歡棲息在潮濕的森林與溪流附近。' },
        { q:'兩棲類動物的成長過程通常經歷什麼變化？', o:['蛋直接孵出成體，沒有變態','蝌蚪經過變態變成青蛙','一輩子都是蝌蚪','先變成鳥再變成蛙'], a:1, why:'兩棲類會從蝌蚪經過變態發育成青蛙。' },
        { q:'為什麼青蛙被稱為環境的「指標生物」？', o:['牠們皮膚敏感，環境污染會直接影響牠們','牠們最喜歡吃垃圾','牠們最會築巢','牠們天生免疫任何污染'], a:0, why:'青蛙皮膚敏感，環境一旦污染會很快反映在牠們的數量上。' },
        { q:'莫氏樹蛙主要在什麼時間活動、鳴叫？', o:['大白天','夜間','正中午','完全不叫'], a:1, why:'莫氏樹蛙主要在夜間活動並鳴叫求偶。' },
        { q:'青蛙主要吃什麼維生？', o:['樹葉','昆蟲等小動物','石頭','塑膠垃圾'], a:1, why:'青蛙主要以昆蟲等小動物為食。' },
        { q:'保護台灣特有種青蛙棲地，最重要的是什麼？', o:['多蓋水泥堤防','維護乾淨的溪流與森林環境','多噴農藥除蟲','把牠們全部抓進實驗室'], a:1, why:'乾淨的溪流與森林環境，是青蛙生存不可或缺的條件。' }
      ] },
    firefly:     { n:'螢火蟲',     e:'✨', type:'heal',
                   b:{ hp:20, atk:3,  def:1, spd:9 }, g:{ hp:1.9, atk:0.32, def:0.20, spd:0.38 },
                   cmd:'glowlight',  talent:'冷光:在洞窟與火山這種昏暗的地方,全隊攻擊 +8%', tal:{ darkAtkP:8 },
                   get:{ how:'tame', zone:'cave', p:20 },
                   sci:'螢火蟲的光幾乎不發熱,叫做「冷光」;牠對光害和農藥很敏感,是環境好不好的指標。' ,
                   food:'water', quiz:[
        { q:'螢火蟲發出的光有什麼特色？', o:['非常燙，會發熱','幾乎不發熱，叫做「冷光」','只有白天才會發光','是靠反射月光'], a:1, why:'螢火蟲的光幾乎不發熱，稱為「冷光」。' },
        { q:'螢火蟲對什麼環境變化特別敏感，常被當作指標生物？', o:['光害和農藥','下雨天','颳風','滿月的夜晚'], a:0, why:'螢火蟲對光害與農藥非常敏感，是環境好壞的指標生物。' },
        { q:'螢火蟲幼蟲主要住在哪裡、吃什麼？', o:['住在海裡吃魚','住在潮濕地或水邊，吃蝸牛等小動物','住在沙漠吃仙人掌','住在樹梢吃樹葉'], a:1, why:'螢火蟲幼蟲多棲息在潮濕地或水邊，捕食蝸牛等小動物。' },
        { q:'螢火蟲發光主要是為了什麼？', o:['嚇跑天敵','求偶，吸引同伴','照亮前方的路','純粹好玩'], a:1, why:'螢火蟲發光主要用來求偶，吸引異性同伴。' },
        { q:'螢火蟲屬於哪一類昆蟲？', o:['甲蟲類','蝴蝶類','蜻蜓類','蜜蜂類'], a:0, why:'螢火蟲屬於甲蟲類昆蟲。' },
        { q:'螢火蟲最活躍的時間是什麼時候？', o:['大白天','傍晚到夜間','正中午','整天都一樣活躍'], a:1, why:'螢火蟲主要在傍晚到夜間活動發光。' },
        { q:'為什麼都市光害會影響螢火蟲？', o:['路燈太亮讓牠們找不到彼此發出的訊號','路燈的熱量太高','光害會讓螢火蟲變胖','完全沒有影響'], a:0, why:'過亮的路燈會干擾螢火蟲的發光訊號，讓牠們難以找到同伴。' },
        { q:'台灣賞螢的知名地點通常選在什麼樣的環境？', o:['水泥叢林的市中心','乾淨無光害的山區溪谷','高速公路旁','大型停車場'], a:1, why:'賞螢地點通常選在乾淨、少光害的山區溪谷。' },
        { q:'螢火蟲的一生要經過哪些階段？', o:['卵→幼蟲→蛹→成蟲','一出生就是成蟲','只有幼蟲和成蟲兩階段','永遠停留在幼蟲階段'], a:0, why:'螢火蟲一生經歷卵、幼蟲、蛹、成蟲四個階段。' },
        { q:'保護螢火蟲棲地最重要的做法是什麼？', o:['減少農藥使用、減少光害','多裝路燈','多噴殺蟲劑','把牠們抓去做標本'], a:0, why:'減少農藥與光害，才能保留螢火蟲生存所需的乾淨環境。' }
      ] },
    salmon:      { n:'櫻花鉤吻鮭', e:'🐟', type:'heal',
                   b:{ hp:26, atk:5,  def:3, spd:6 }, g:{ hp:2.4, atk:0.44, def:0.32, spd:0.26 },
                   cmd:'clearstream',talent:'逆流而上:自己體力低於一半時,治療效果 +30%', tal:{ lowHealP:30 },
                   get:{ how:'shop', price:180 },
                   sci:'櫻花鉤吻鮭是冰河時期留下來的「陸封型」鮭魚,只住在台灣高山的冷水溪流裡。' },

    /* ── B 組:控場型 3 隻 ── */
    macaque:     { n:'台灣獼猴',   e:'🐒', type:'ctrl',
                   b:{ hp:30, atk:7,  def:3, spd:8 }, g:{ hp:2.8, atk:0.65, def:0.36, spd:0.34 },
                   cmd:'throwstone', talent:'手巧:自己造成暈眩的機率 +10%', tal:{ stunAddP:10 },
                   get:{ how:'tame', zone:'valley', p:18 },
                   sci:'台灣獼猴是台灣唯一的野生猴類,會用手挑食物、互相理毛,群體裡有清楚的階級。' ,
                   food:'grain', quiz:[
        { q:'台灣獼猴是台灣唯一的哪一類野生動物？', o:['野生猴類','野生熊類','野生鹿類','野生貓科動物'], a:0, why:'台灣獼猴是台灣唯一的野生猴類。' },
        { q:'台灣獼猴群體裡有什麼特別的社會結構？', o:['完全沒有階級，大家平等','有清楚的階級制度','每隻猴子都獨自生活','只有母猴會聚在一起'], a:1, why:'台灣獼猴群體內有清楚的階級制度。' },
        { q:'台灣獼猴之間常做什麼行為來增進感情？', o:['互相理毛','互相打架','各自躲起來','互相搶食物打鬥到底'], a:0, why:'互相理毛是台灣獼猴增進感情、清潔身體的重要行為。' },
        { q:'台灣獼猴的食性是什麼？', o:['只吃肉','雜食性，水果、種子、昆蟲都吃','只吃石頭','完全不進食'], a:1, why:'台灣獼猴是雜食性，水果、種子與昆蟲都吃。' },
        { q:'台灣獼猴用什麼方式取食？', o:['直接用嘴巴咬','靈活地用雙手挑選、剝食物','用尾巴捲食物','完全不會用手'], a:1, why:'台灣獼猴擁有靈活的雙手，能挑選與剝除食物外皮。' },
        { q:'為什麼有些地區的台灣獼猴會搶食遊客的食物？', o:['牠們天生兇猛','人類長期餵食讓牠們失去對人的戒心','牠們吃不到野外食物','牠們特別喜歡人類的味道'], a:1, why:'人類長期餵食會讓野生獼猴失去戒心，進而主動搶食。' },
        { q:'台灣獼猴主要棲息在什麼環境？', o:['低、中海拔山區森林','海邊沙灘','高山寒原','都市柏油路'], a:0, why:'台灣獼猴主要棲息在低、中海拔的山區森林。' },
        { q:'台灣獼猴的尾巴有什麼功能？', o:['完全沒有作用','協助在樹林間爬行時保持平衡','用來噴水','用來發光'], a:1, why:'尾巴能協助台灣獼猴在樹林間移動時保持身體平衡。' },
        { q:'台灣獼猴目前在保育上被列為什麼等級？', o:['已經滅絕','族群穩定，但仍受法律保護的野生動物','外來入侵種要撲殺','世界上數量最多的哺乳類'], a:1, why:'台灣獼猴族群目前算穩定，但仍是受法律保護的野生動物。' },
        { q:'遇到野生台灣獼猴時，正確的做法是什麼？', o:['主動餵食牠們','不要餵食、保持距離、不直視挑釁','追著牠們拍照','搶走牠們手上的食物'], a:1, why:'遇到野生獼猴應不餵食、保持距離，避免直視挑釁。' }
      ] },
    spoonbill:   { n:'黑面琵鷺',   e:'🥄', type:'ctrl',
                   b:{ hp:28, atk:6,  def:3, spd:9 }, g:{ hp:2.6, atk:0.58, def:0.34, spd:0.36 },
                   cmd:'sweepbill',  talent:'群棲:隊伍中有其他控場型時,全隊速度 +8%', tal:{ ctrlSpdP:8 },
                   get:{ how:'tame', zone:'lake', p:15 },
                   sci:'黑面琵鷺會把扁扁的嘴伸進水裡左右掃,碰到魚蝦就合起來;全世界大部分都在台南過冬。' ,
                   food:'d_fish', quiz:[
        { q:'黑面琵鷺覓食時有什麼特別的動作？', o:['靜靜站著等魚游過來','把扁扁的嘴伸進水裡左右掃動','用爪子抓魚','潛到水底捕魚'], a:1, why:'黑面琵鷺會把扁平的嘴伸進水中，左右來回掃動覓食。' },
        { q:'台灣哪個地區是黑面琵鷺重要的度冬棲地？', o:['台南沿海溼地','合歡山','日月潭','阿里山'], a:0, why:'台南沿海溼地是黑面琵鷺重要的度冬棲息地。' },
        { q:'黑面琵鷺的嘴巴形狀像什麼？', o:['尖尖的錐子','扁平的湯匙（琵琶）','鉤子狀','圓球狀'], a:1, why:'黑面琵鷺的嘴巴扁平像湯匙，形狀近似琵琶，因此得名。' },
        { q:'黑面琵鷺主要吃什麼食物？', o:['魚、蝦等水中生物','樹葉','堅果','花蜜'], a:0, why:'黑面琵鷺主要以魚、蝦等水中生物為食。' },
        { q:'黑面琵鷺是候鳥還是留鳥？', o:['候鳥，會隨季節遷徙','留鳥，終年不移動','完全不會飛','只在陸地上生活'], a:0, why:'黑面琵鷺是候鳥，會隨季節南北遷徙。' },
        { q:'黑面琵鷺名字裡的「黑面」指的是什麼部位是黑色的？', o:['整個身體','臉部與嘴喙','翅膀尖端','腳掌'], a:1, why:'黑面琵鷺的臉部與嘴喙呈黑色，因此得名。' },
        { q:'保護黑面琵鷺棲地最重要的是什麼？', o:['填平沿海溼地蓋房子','維護沿海溼地的完整與乾淨','多開發魚塭抓光魚蝦','趕走所有水鳥'], a:1, why:'維護沿海溼地的完整與乾淨，是保護黑面琵鷺最重要的做法。' },
        { q:'黑面琵鷺曾經是瀕臨絕種的鳥類，經過保育後族群狀況如何？', o:['已經完全恢復到安全數量，不需再保育','仍是珍貴稀有的保育類，持續受到監測與保護','已經徹底滅絕','數量多到氾濫成災'], a:1, why:'黑面琵鷺仍是珍貴稀有的保育類鳥種，持續受到監測與保護。' },
        { q:'黑面琵鷺遷徙時通常會做什麼？', o:['單獨一隻默默飛行','成群結隊一起飛行遷徙','用走的移動，不會飛','躲在地底冬眠'], a:1, why:'黑面琵鷺遷徙時通常成群結隊一起飛行。' },
        { q:'全世界黑面琵鷺的數量曾經瀕危，國際上如何一起合作保護牠？', o:['各國各自為政互不往來','跨國進行同步普查與棲地保護合作','完全不需要國際合作','只靠台灣一個國家保護就夠'], a:1, why:'黑面琵鷺的保育需要跨國同步普查與棲地保護合作。' }
      ] },
    barbet:      { n:'五色鳥',     e:'🎨', type:'ctrl',
                   b:{ hp:27, atk:6,  def:4, spd:7 }, g:{ hp:2.5, atk:0.56, def:0.40, spd:0.30 },
                   cmd:'drumecho',   talent:'鑿洞高手:自己的封招效果延長 1 回合', tal:{ sealAdd:1 },
                   get:{ how:'shop', price:160 },
                   sci:'五色鳥會用嘴在枯木上鑿洞當巢,叫聲像敲木魚,所以被叫做「森林裡的花和尚」。' }
  };
  D.PET_ORDER = ['bear','owl','gull','deer','leopardcat','bluemagpie','eagle','pangolin','turtle','coconutcrab','treefrog','firefly','salmon','macaque','spoonbill','barbet'];

  /* 夥伴等級:與主角同樣最高 50 級;升到 Lv n 所需經驗 = XP_BASE + XP_STEP×(n−1)。
     經驗只給「有上場」的夥伴(借用版好友角色永遠不給,見 D.PARTY.FRIEND_READONLY)。 */
  D.PET_LV = { MAX:50, XP_BASE:12, XP_STEP:8 };
  D.PET_XP = { win:6, lose:2, boss:20 };   /* ★ v1.167.0 稽核:raid(夜襲)是死鍵——夜襲防衛戰沒有隊友單位,移除;lose 本輪補上消費點(打輸也給一點經驗,不讓學生白忙) */
  /* 親密度 5 階:靠餵食與同行累積,純加成不擋玩法 */
  D.PET_BOND = [
    { n:'陌生',   e:'🤍', need:0,   d:'剛加入,還在觀察你' },
    { n:'熟悉',   e:'💛', need:20,  d:'全能力 +3%' ,  mul:1.03 },
    { n:'信任',   e:'🧡', need:60,  d:'全能力 +6%' ,  mul:1.06 },
    { n:'親密',   e:'❤️', need:120, d:'全能力 +10%',  mul:1.10 },
    { n:'生死之交',e:'💖', need:220, d:'全能力 +15%,專屬指令冷卻 −1 回合', mul:1.15, cdCut:1 }
  ];
  D.PET_BOND_GAIN = { feed:4, battle:2, levelUp:8, dayTogether:1, cap:999 };   /* ★ v1.167.0 稽核:feed 與 dayTogether 原本是死鍵,本輪補上消費點(圖鑑的「🍖 餵食」與每天同行 +1);★ v1.181.0 老師需求「寵物升級要加更多親密度」新增 levelUp(每升 1 級額外 +8,比單純打贏一場的 +2 多很多,鼓勵練等) */
  /* ★ v1.181.0(老師需求「寵物加入條件改為送禮＋答題」)— 野外招募新規則參數:
     每次遇到只抽 quizPick 題(10 題題庫隨機抽 5)、至少答對 quizPass 題才合格。
     ⚠ 單一調整點:老師日後想改難度(例如全問或門檻),只改這裡兩個數字,index 端零改動。 */
  D.PET_RECRUIT = { quizPick:5, quizPass:4 };

  /* ── 🎯 特殊指令(老師 2026-09-15 需求 5)──
     從天賦星域的「特殊指令星域」點亮後,到 👤 能力頁「裝設」;裝好的指令會在
     野外探索畫面 / 戰鬥畫面多出一顆按鈕。使用一律消耗 ⚡AP。
     where:'battle'=只在戰鬥中 / 'field'=只在野外探索 / 'both'=兩邊都有。
     ⚠ 這裡只有資料;index 端按鈕與效果在 P3 接上(與 islSkEff 同一套「效果鍵」思路)。 */
  D.SK_CMD_SLOTS = 3;
  D.SK_CMDS = {
    CMD_SCAN:      { n:'環境觀察', e:'🔍', ap:1, where:'field',  d:'把本區今天所有資源點與遇敵點的位置全部顯示出來',   sci:'先觀察再行動,是所有野外工作的第一步。' },
    CMD_FIRSTAID:  { n:'戰場急救', e:'🩹', ap:2, where:'battle', d:'全隊立刻回復 15% 最大體力',                         sci:'急救的順序是先止血、再保暖,最後才送醫。' },
    CMD_SMOKE:     { n:'煙霧彈',   e:'💨', ap:1, where:'battle', d:'這一回合逃跑必定成功',                               sci:'濃煙會遮住動物的視線與氣味,是很老的脫身方法。' },
    CMD_QUICKPICK: { n:'熟練採集', e:'🧺', ap:2, where:'field',  d:'下一次採集免 QTE,直接判定 ★★★',                    sci:'熟練來自重複練習,動作會慢慢變成身體記得的事。' },
    CMD_TRAP:      { n:'佈設陷阱', e:'🪤', ap:2, where:'battle', d:'敵方全體暈眩 1 回合',                                sci:'陷阱靠的是「位能一次放掉」,所以小小的繩子也能絆倒大東西。' },
    CMD_CALL:      { n:'呼喚夥伴', e:'📣', ap:1, where:'battle', d:'讓體力最低的一位隊友立刻回復 20% 最大體力',           sci:'動物能分辨熟悉的聲音,叫名字比大吼有用。' },   /* ★ v1.165.0 由 both 改 battle:野外沒有隊友單位可以治療(隊友每場戰鬥才建立),掛在野外會變成按了沒反應的死按鈕 */
    CMD_RALLY:     { n:'鼓舞號令', e:'⚡', ap:2, where:'battle', d:'全隊攻擊 +25%,持續 3 回合',                          sci:'一起喊口號會讓人動作更同步,這叫「節律同調」。' },
    CMD_REST:      { n:'野外小憩', e:'🔥', ap:3, where:'field',  d:'在野外原地回復 30% 最大體力,不必走回營地',           sci:'休息時身體會把血糖轉回肌肉裡的肝醣,這就是「恢復」。' }
  };

  /* ── 🐾 夥伴戰鬥立繪(16 位 × 6 態 = 96 張,全部選配;缺圖自動退回 idle,idle 也缺退 emoji) ──
     island_bt_pet_<key>_<態>.png,512×512 透明底、側面朝右(與主角同向,魔物才是朝左)、腳底貼底。
     ⚠ 圖片上傳後必須 bump MG_IMG_VER,否則 SW 的 cache-first 會讓裝置繼續吃舊快取。 */
  (function(){ var st = ['idle','atk','hit','stun','down','skill'], i, j, k;
    for(i = 0; i < D.PET_ORDER.length; i++){ k = D.PET_ORDER[i];
      for(j = 0; j < st.length; j++){ D.IMG['bt_pet_' + k + '_' + st[j]] = 'island_bt_pet_' + k + '_' + st[j] + '.png'; } } })();

  D.QUIZ = D.QUIZ || {};
  D.QUIZ.weapon = [
    { q:'拉開的弓把箭射出去,弓身裡存的是哪一種能量?', o:['彈性位能','存的其實是滾燙的熱能','存的其實是一閃一閃的光能','存的其實是嗡嗡作響的聲能'], a:0, why:'彎曲的弓身像壓縮的彈簧,存的是彈性位能,放手變成箭的動能。' },
    { q:'錘柄做得長一點,敲下去比較省力,是因為?', o:['施力臂變長(槓桿)','柄做長之後,整支錘子反而變輕了','柄做長之後,底下的石頭會變軟','柄做長之後,揮動的手臂突然變大'], a:0, why:'柄越長施力臂越長,同樣的力產生更大的力矩。' },
    { q:'石斧的刃要磨得薄,是為了?', o:['受力面積小,壓力大','刃磨薄之後,整把石斧會變得比較輕','刃磨得薄薄的,看起來比較好看','刃磨薄之後,石頭就不容易生鏽了'], a:0, why:'同樣的力,面積越小壓力越大,越容易砍進去。' },
    { q:'迴力鏢能飛回來,和飛機翅膀一樣靠?', o:['翼面產生升力','迴力鏢本身帶有天然的磁力','是靠地球引力把它拉轉回來','是靠丟出去時發出的聲音導引'], a:0, why:'彎翼旋轉時空氣流過產生升力,讓它轉彎飛回來。' },
    { q:'長槍比棍棒安全,主要因為?', o:['離魔物比較遠','是因為長槍拿起來比較輕','是因為長槍看起來比較亮眼','是因為長槍做得比棍棒還要短'], a:0, why:'武器越長,攻擊距離越遠,魔物碰不到你。' },
    { q:'箭尾要黏羽毛,是為了?', o:['讓箭飛得直','黏上羽毛是為了讓箭變得更重','黏上羽毛只是單純用來裝飾','黏上羽毛是為了讓箭發出亮光'], a:0, why:'羽毛像尾翼,穩定箭的方向不翻滾。' },
    { q:'錘子敲東西「動量」大,是因為?', o:['質量大又揮得快','錘頭本身的顏色比較深、比較暗','錘柄做得特別長,拿起來很長','錘子用久了之後,摸起來會發熱'], a:0, why:'動量=質量×速度,又重又快的錘頭衝擊力最大。' },
    { q:'木棒握把要纏一圈纖維,是為了?', o:['增加摩擦力不滑手','纏上去之後,整根木棒會變得比較重','纏上纖維,主要是讓木棒看起來漂亮','纏上纖維,可以順便防止蟲蛀木棒'], a:0, why:'粗糙的表面摩擦力大,握得住才揮得穩。' }
  ];
  D.STORY.firstBattle = ['什麼東西從草叢裡跳出來了!', '(遇到魔物時:⚔ 攻擊要在指針經過綠色甜蜜點時按下;🧠 智取是選出「牠怕什麼」;打不過就 🛡 防禦或 🏃 逃跑。)', '(受傷要回營地治療;體力歸零會倒下,魔物就在原地,明天再來報仇。)'];

  /* ── 結算文案 ── */
  D.STAR_TEXT = { 1:'還可以', 2:'不錯喔', 3:'完美!' };

  return D;
})();
