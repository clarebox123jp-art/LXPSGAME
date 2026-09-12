/* ============================================================================
 * 🏝 像素荒島求生記 — 資料表(minigame/minigame_island_db.js)
 * ============================================================================
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
  D.VER = 'v1.19.0';   /* ★ v1.19.0(2026-09-13):島名 60×60、STAT_MAX/SKILL_MAX 50、分層造型 IMG 24 張。 */   /* ★ v1.18.0(2026-09-13):11 區遮罩重建 + 地標重標。 */   /* ★ v1.17.0(2026-09-12):好友營地唯讀畫面常數 COOP_BOARD_PUB/COOP_DECO_PUB。 */   /* ★ v1.16.0(2026-09-12・老師四項修正):重畫 valley 遮罩(石橋過河,水域真的不可走)+ river/rock/lake/cave 共 8 個資源點位移到岸上,全 11 區水域全面禁止進入後仍 100% 可達(BFS 驗證)。 */   /* ★ v1.15.0(2026-09-12):無人島命名(ISLAND_ADJ/ISLAND_NOUN)+好友連線合作資料常數(COOP_MAX/COOP_HEARTBEAT_SEC/COOP_STALE_SEC/COOP_GONE_SEC)。 */   /* ★ v1.14.0(2026-09-12):留言板 BOARD_* + 阿獺委託板 QUEST。 */   /* ★ v1.13.0(2026-09-12):好友信箱資料常數。 */   /* ★ v1.12.0(2026-09-12):帆船+結局+回憶紀錄資料。 */   /* ★ v1.11.0(2026-09-12):甲乙丙 — 8 魔物/瞭望台/地下層/好友守夜資料。 */   /* ★ v1.10.0(2026-09-12):14 張場景改 .jpg。 */   /* ★ v1.9.0(2026-09-12):遮罩重校 + seed 圖。 */   /* ★ v1.8.0(2026-09-12):WEATHER + 台灣化。 */   /* ★ v1.7.0(2026-09-12 P4-b):TRAINERS。 */   /* ★ v1.6.0(2026-09-12 P4-a):SHOP + CODEX。 */   /* ★ v1.5.0(2026-09-12 P3-c):11 區首次進入內心話(STORY.zoneIntro)、小白各區提示(STORY.gullZone);BGM 由 index 端 islBgm 控制 */   /* ★ v1.4.0(2026-09-12 P3-b):懸崖/山谷/遺跡/火山四區、製作台與工具(鐵斧/鐵鎬/好釣竿/藤籃)、草藥/蜂蜜/遺物物品、四區解謎點、製作題庫 */   /* ★ v1.3.0(2026-09-12 P3-a):湖泊/洞窟兩區、科技研究(火把/滑輪/水車/電路)、各區解謎點題組、鐵礦/水晶物品、研究題庫 */   /* ★ v1.2.0(2026-09-12 P2-b):烹飪/種植/畜牧/水利(Grid 引擎首用)資料、農田/畜欄/水道三棟、全建築 Lv1~5、營地 Lv1~3 擴建、裝飾與舒適度、料理/蛋/奶/穀物物品、四庫新題 */   /* ★ v1.1.0(2026-09-12 P2-a):溪流/岩岸/草原、捕魚/打撈/採石、水桶架/木筏/圍牆/火把、防衛戰資料 */
  D.SAVE_VER = 1;          /* 存檔結構版本(缺欄位一律補預設值,絕不因存檔壞掉卡流程) */
  D.CELL = 64;             /* 一格 px */
  D.COLS = 32; D.ROWS = 24;

  /* ── 素材檔名(minigame/img/<file>.png;程式端缺圖一律 onerror 退回 emoji,可分批上傳) ── */
  D.IMG = {
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
    mon_slime: 'island_mon_slime.png', mon_ember: 'island_mon_ember.png', mon_basilisk: 'island_mon_basilisk.png', mon_spark: 'island_mon_spark.png', mon_guardian: 'island_mon_guardian.png', bld_tower: 'island_bld_tower.png', bld_ship: 'island_bld_ship.png', ending_sail: 'island_ending_sail.jpg',   /* ★ v1.12.0 帆船建築/結局揚帆圖(缺圖退 emoji) */   /* ★ v1.11.0 四魔物+守墓石像+瞭望台(缺圖退 emoji) */
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
    sheet_boy: 'island_body_sheet_boy.png', sheet_girl: 'island_body_sheet_girl.png'
  };
  /* ★ v1.19.0 分層造型(老師:主角造型新增 髮型/髮色/膚色/服裝)—— 每張 768×384、6 欄×3 列(正面/背面/側面朝右)、128px 格、角色置中、腳底貼格底:
   *   base_<boy|girl>_s0~s3  = 光頭基底身體(4 種膚色:淺/自然/小麥/深),只穿內搭背心短褲;
   *   hair_<boy|girl>_h0~h3  = 只有頭髮(短髮/雙馬尾/自然長髮/高馬尾),畫成中灰 #909090 帶明暗,髮色由 index 端 CSS filter 染色;
   *   cloth_<boy|girl>_c0~c3 = 只有衣服(力行運動服/探險背心裝/島民草編裝/海洋工作服)。
   *   三層同一張版面疊起來才對得齊,所以髮型/衣服要用「以基底身體圖為底圖加畫」的方式產出(見圖片提示詞清單)。任何一張缺圖 → index 端自動退回既有整張 sheet_boy/sheet_girl。 */
  (function(){ var bs = ['boy','girl'], i, j; for(i = 0; i < 2; i++){ for(j = 0; j < 4; j++){ D.IMG['base_' + bs[i] + '_s' + j] = 'island_body_base_' + bs[i] + '_s' + j + '.png'; D.IMG['hair_' + bs[i] + '_h' + j] = 'island_hair_' + bs[i] + '_h' + j + '.png'; D.IMG['cloth_' + bs[i] + '_c' + j] = 'island_cloth_' + bs[i] + '_c' + j + '.png'; } } })();
  D.SKINS4 = [ { n:'淺', c:'#ffe3cf' }, { n:'自然', c:'#f5c9a5' }, { n:'小麥', c:'#d99e6f' }, { n:'深', c:'#8f5a38' } ];   /* 分層造型的 4 種膚色(對應 base_*_s0~s3;主程式 8 色膚色索引 ÷2 取整對應) */
  D.CLOTHES = [ { n:'力行運動服', e:'👕' }, { n:'探險背心裝', e:'🦺' }, { n:'島民草編裝', e:'🌿' }, { n:'海洋工作服', e:'🧥' } ];

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
    d_fish:   { n:'烤魚',     e:'🐟', img:'', cat:'dish', eat:{hp:30, ap:0} },
    d_jam:    { n:'野果醬',   e:'🫙', img:'', cat:'dish', eat:{hp:10, ap:1} },
    d_soup:   { n:'野菇湯',   e:'🍲', img:'', cat:'dish', eat:{hp:40, ap:0} },
    d_stew:   { n:'鮮魚菇湯', e:'🥘', img:'', cat:'dish', eat:{hp:30, ap:1} },
    d_egg:    { n:'煎蛋',     e:'🍳', img:'', cat:'dish', eat:{hp:25, ap:0} },
    d_bread:  { n:'小米餅',   e:'🥞', img:'', cat:'dish', eat:{hp:20, ap:1} },
    d_pudding:{ n:'羊奶布丁', e:'🍮', img:'', cat:'dish', eat:{hp:20, ap:2} },
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
    mask:[   /* ★ v1.18.0 依場景圖重建障礙:巨石/樹木/崖壁 '#'(自動偵測+手動補格,固定點強制可走,BFS 連通驗證 0 退步) */
      '################################',
      '#.....######..#.###..###.#######',
      '#.#........................#####',
      '##...#.#.......................#',
      '###..#.#......................##',
      '#.............................##',
      '##.............................#',
      '#.#....................#........',
      '#.#....###............##.....##.',
      '#.#......#.............##....#.#',
      '#......####...........#.#....###',
      '###...........................##',
      '#.#..........................###',
      '##...........................###',
      '##............................##',
      '####....##.#######....##########',
      '##...~~...##.....######.###.####',
      '###~~~~~~###.~~~...##...~~~..###',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '################################',
      '################################'
    ],
    /* 每日隨機資源點(25.2) */
    spawn:{
      palm:  { n:4, minGap:2, act:'gather', node:'node_palm', e:'🌴', gives:'fiber', label:'林投樹',
               pool:[{x:3,y:3},{x:10,y:2},{x:16,y:3},{x:22,y:2},{x:28,y:3},{x:4,y:12},{x:13,y:11},{x:26,y:12}] },
      bush:  { n:3, minGap:2, act:'gather', node:'node_bush', e:'🌳', gives:'berry', label:'構樹果叢',
               pool:[{x:8,y:5},{x:19,y:6},{x:25,y:8},{x:6,y:14},{x:17,y:14},{x:29,y:6}] }
    },
    pick:{ n:[3,5], minGap:3, items:['shell','pebble','feather','berry'] },
    gullSpot:{x:8,y:9}
  };
  D.SCENE.forest = {
    bg:'zone_forest', bgColor:'#7bb661', waterColor:'#4aa3df',
    spawn0:{x:2,y:12}, exit:{x:0,y:12}, campGate:null,
    mask:[   /* ★ v1.18.0 依場景圖重建障礙:巨石/樹木/崖壁 '#'(自動偵測+手動補格,固定點強制可走,BFS 連通驗證 0 退步) */
      '################################',
      '###.###.#..#.###########.....#.#',
      '###########..##..#....#.###....#',
      '###....#....##...#.#.#....#....#',
      '###...###...###......##......#.#',
      '#.##.##..#..........###........#',
      '#......##..............#.......#',
      '###.#.......###..............#.#',
      '##..###.....####........#...#.##',
      '##.##...................#.....##',
      '##.#.................#........##',
      '...#.................##.#....###',
      '.#.#.........................#.#',
      '##.##..##...#............#...#.#',
      '#.....###..#........#.##....#..#',
      '#..#.#.###.#..........#######..#',
      '##.#...#..#.#......#..###.##...#',
      '#..###.#.#...............#.....#',
      '##..##....##.##....#...#.#..#..#',
      '###..###.....#......#.#......###',
      '####..............#.#..#.#..####',
      '#######...#..#.#.##......#######',
      '#############################..#',
      '################################'
    ],
    spawn:{
      tree:  { n:6, minGap:2, act:'chop', node:'node_tree', e:'🌲', gives:'wood', label:'樟樹',
               pool:[{x:5,y:4},{x:9,y:3},{x:14,y:5},{x:20,y:3},{x:26,y:4},{x:6,y:10},{x:16,y:11},{x:22,y:9},{x:28,y:11},{x:8,y:17},{x:15,y:18},{x:21,y:17}] },
      bush:  { n:3, minGap:2, act:'gather', node:'node_bush', e:'🌳', gives:'berry', label:'野果叢',
               pool:[{x:11,y:7},{x:24,y:14},{x:4,y:14},{x:18,y:14},{x:29,y:6},{x:12,y:19}] },
      mush:  { n:2, minGap:2, act:'gather', node:'node_mushroom', e:'🍄', gives:'mushroom', label:'野菇圈', chance:0.85,
               pool:[{x:3,y:7},{x:19,y:8},{x:29,y:16},{x:10,y:14},{x:25,y:19}] }
    },
    pick:{ n:[3,5], minGap:3, items:['feather','pebble','berry','seed'] },
    puzzle:{x:12,y:10, n:'年輪樹樁', e:'🪵'}   /* 解謎點(P3 才實作互動,P1 只顯示) */
  };
  /* ★ P2-a(v1.91.0):溪流／岩岸／草原三區。act 'fish'=捕魚、'trash'=打撈海廢、'quarry'=採石(沿用伐木 QTE 引擎) */
  D.SCENE.river = {
    bg:'zone_river', bgColor:'#8fbf6a', waterColor:'#3f8fd4',
    spawn0:{x:2,y:5}, exit:{x:0,y:5}, campGate:null,
    mask:[   /* ★ v1.18.0 依場景圖重建障礙:巨石/樹木/崖壁 '#'(自動偵測+手動補格,固定點強制可走,BFS 連通驗證 0 退步) */
      '################################',
      '##...#....#..###...............#',
      '##....#####........#...........#',
      '##.....####.~~~~~#.#.........###',
      '#.#...##.##..~~~~............###',
      '....#.......##~~~#...........###',
      '#............~~~~.....#........#',
      '#.......##...~~~~~..#.#.##.....#',
      '#.####..##...#~~~~..##~~~#.....#',
      '#.###........~~~~~.####~~~~##..#',
      '#.####......#....####~~~~~~~#.##',
      '##.....##.....~~~~.###~~~~~~~~##',
      '#......#........~~~~~~~.~~~~~~~#',
      '#............###....##..#.#..#.#',
      '#.#.#......#.##...###..........#',
      '#.##..........................##',
      '#..#.##.....###..###.....#..####',
      '#....##....###...#####......####',
      '#....##......#...#####..###.####',
      '#..........####.....##..####.#.#',
      '#.......................####...#',
      '#....................#..####...#',
      '#....##.#....#....#.##........##',
      '################################'
    ],
    spawn:{
      fish:  { n:3, minGap:3, act:'fish', node:'node_fish', e:'🐟', gives:'fish', label:'石𩼣魚群',
               pool:[{x:13,y:3},{x:15,y:2},{x:14,y:7},{x:15,y:9},{x:23,y:9},{x:26,y:10},{x:22,y:11},{x:28,y:12}] },
      reed:  { n:3, minGap:2, act:'gather', node:'node_reed', e:'🎋', gives:'reed', label:'蘆葦叢',
               pool:[{x:18,y:3},{x:15,y:9},{x:5,y:9},{x:26,y:10},{x:12,y:18},{x:22,y:19}] },
      pebble:{ n:2, minGap:2, act:'gather', node:'node_pebble', e:'⚪', gives:'pebble', label:'卵石灘',
               pool:[{x:6,y:3},{x:20,y:6},{x:4,y:18},{x:27,y:18}] }
    },
    pick:{ n:[3,5], minGap:3, items:['pebble','feather','seed','berry'] },
    puzzle:{x:13,y:10, n:'水車座', e:'⚙'}
  };
  D.SCENE.rock = {
    bg:'zone_rock', bgColor:'#9aa0a6', waterColor:'#2f7fc0',
    spawn0:{x:29,y:4}, exit:{x:31,y:4}, campGate:null,
    mask:[   /* ★ v1.18.0 依場景圖重建障礙:巨石/樹木/崖壁 '#'(自動偵測+手動補格,固定點強制可走,BFS 連通驗證 0 退步) */
      '################################',
      '#####################.########.#',
      '####.######.........#.#.###..#..',
      '###..##.........................',
      '##.......#...###...........##.#.',
      '#............#.....###.....###.#',
      '#..#.......##......###.....###.#',
      '#......###.#....#..###...#.###.#',
      '#.....####...#......#..........#',
      '#......#.####..................#',
      '#....#....###...#.............##',
      '#....#.........#..#.....#......#',
      '#.....#......#....#.....~~#.#..#',
      '#.~~~~~.....~~..~.~~~..~~~~...##',
      '#~~~~~~~~..#~~~~~~~~~.~~~~~~~~~#',
      '#~~~~~~~~~~#~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~##############################~',
      '~##############################~',
      '################################',
      '################################',
      '################################'
    ],
    spawn:{
      stone: { n:4, minGap:2, act:'quarry', node:'node_stone', e:'🪨', gives:'stone', label:'石堆',
               pool:[{x:7,y:3},{x:13,y:2},{x:20,y:4},{x:26,y:8},{x:8,y:9},{x:15,y:10},{x:23,y:11},{x:4,y:12}] },
      trash: { n:5, minGap:2, act:'trash', node:'node_trash', e:'🛍', gives:'trash', label:'海廢堆',
               pool:[{x:3,y:13},{x:10,y:14},{x:14,y:13},{x:19,y:12},{x:22,y:13},{x:28,y:13},{x:6,y:14},{x:25,y:12},{x:12,y:12},{x:17,y:12}] },
      shell: { n:2, minGap:3, act:'gather', node:'node_shell', e:'🐚', gives:'shell', label:'貝殼堆',
               pool:[{x:9,y:12},{x:27,y:11},{x:2,y:11},{x:16,y:11}] }
    },
    pick:{ n:[3,5], minGap:3, items:['shell','pebble','feather','trash'] },
    puzzle:{x:20,y:12, n:'潮池', e:'🦀'}
  };
  D.SCENE.grass = {
    bg:'zone_grass', bgColor:'#a9d46a', waterColor:'#4aa3df',
    spawn0:{x:2,y:12}, exit:{x:0,y:12}, campGate:null,
    mask:[   /* ★ v1.18.0 依場景圖重建障礙:巨石/樹木/崖壁 '#'(自動偵測+手動補格,固定點強制可走,BFS 連通驗證 0 退步) */
      '################################',
      '#.#....###..##.######.##.....#.#',
      '##.....###......###.#.........##',
      '##............................##',
      '##............................##',
      '##............................##',
      '##............................##',
      '##.................####.......##',
      '##................####........##',
      '##................###.##......##',
      '##...............#....#.......##',
      '##............................##',
      '..............................##',
      '##............................##',
      '##............................##',
      '##...##~~~##..................##',
      '##..#~~~~~~.#.................##',
      '##..###~~~~#..............#...##',
      '##....##.....................###',
      '###...........................##',
      '##.#.........................###',
      '#.##############################',
      '################################',
      '################################'
    ],
    spawn:{
      seedgrass: { n:4, minGap:2, act:'gather', node:'node_seedgrass', e:'🌾', gives:'seed', label:'咸豐草叢',
               pool:[{x:5,y:4},{x:12,y:3},{x:20,y:5},{x:27,y:3},{x:8,y:10},{x:15,y:12},{x:24,y:12},{x:10,y:18}] },
      berry: { n:2, minGap:2, act:'gather', node:'node_bush', e:'🌳', gives:'berry', label:'野果叢',
               pool:[{x:17,y:16},{x:26,y:18},{x:4,y:15},{x:22,y:8}] },
      fiber: { n:2, minGap:2, act:'gather', node:'node_fibergrass', e:'🌿', gives:'fiber', label:'月桃叢',
               pool:[{x:29,y:9},{x:7,y:7},{x:14,y:19},{x:19,y:2}] },
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
    mask:[   /* ★ v1.18.0 依場景圖重建障礙:巨石/樹木/崖壁 '#'(自動偵測+手動補格,固定點強制可走,BFS 連通驗證 0 退步) */
      '################################',
      '#...#..##...####.#..#...#####~~#',
      '##..#.##.....#####.#..#.#####.##',
      '#.##.........#.#.#...##..##..~.#',
      '#.........#..#.....##......#.~~#',
      '#.##.#.........~~..~..#......~##',
      '##....###..~~~~~~~~~~~~#......##',
      '#......#~~~~~~~~~~~~~~~~~....###',
      '#..#.#.~~~~~~#######~~~~~.~#..##',
      '#.#....~~~~###########~~~~~....#',
      '#...#.~~~~#############~~~~~...#',
      '#...#.~~~~#############~~~~~~###',
      '.......~~###############~~~~...#',
      '#....#.#~~#############~~~~~..##',
      '###....##~#############~~~~...##',
      '##........~###########~~~~....##',
      '#.#...#...#.########~~~~~..#...#',
      '#..##.###.#...#..~~~~..##......#',
      '#.....###...................#..#',
      '#.##..#####...#..###.##......###',
      '#.###...######......##..#..#####',
      '#.###....######.##~~.##....#####',
      '#.###....########.#~#.#....#####',
      '################################'
    ],
    spawn:{
      lakefish:{ n:3, minGap:3, act:'fish', node:'node_lakefish', e:'🐠', gives:'fish', label:'苦花魚', refract:true,
               pool:[{x:9,y:6},{x:22,y:6},{x:6,y:12},{x:28,y:12},{x:9,y:18},{x:22,y:18},{x:16,y:5},{x:16,y:19}] },
      lotus:  { n:3, minGap:2, act:'gather', node:'node_lotus', e:'🪷', gives:'seed', label:'台灣萍蓬草',
               pool:[{x:11,y:5},{x:20,y:5},{x:11,y:16},{x:21,y:16},{x:6,y:9},{x:26,y:15}] },
      reed:   { n:2, minGap:2, act:'gather', node:'node_reed', e:'🎋', gives:'reed', label:'蘆葦叢',
               pool:[{x:4,y:5},{x:28,y:4},{x:4,y:19},{x:28,y:19}] },
      pebble: { n:2, minGap:2, act:'gather', node:'node_pebble', e:'⚪', gives:'pebble', label:'卵石灘',
               pool:[{x:14,y:3},{x:18,y:21},{x:3,y:9},{x:29,y:15}] }
    },
    pick:{ n:[3,5], minGap:3, items:['pebble','feather','seed','shell'] },
    puzzle:{x:16,y:3, n:'湖心石碑', e:'🪨'}
  };
  D.SCENE.cave = {
    bg:'zone_cave', bgColor:'#3a3f4a', waterColor:'#2f6f9f', wallColor:'#1c1f27',
    spawn0:{x:29,y:20}, exit:{x:31,y:20}, campGate:null,
    mask:[   /* ★ v1.18.0 依場景圖重建障礙:巨石/樹木/崖壁 '#'(自動偵測+手動補格,固定點強制可走,BFS 連通驗證 0 退步) */
      '################################',
      '##.........#######....#....#####',
      '##.......#.####.............####',
      '##.........####.#.......#....###',
      '###.....#.....##............####',
      '####...............#.......#####',
      '###....###.........###....######',
      '#.....#..###.....#####...##...##',
      '#.......######...#####.........#',
      '#.........####.................#',
      '#...~..##..#...##............#.#',
      '#.~~~~~....#####.......###.....#',
      '#~~~~~~~.#.#####...##########..#',
      '#.##.~~~~#..####....############',
      '#....~~~~.~.#.............######',
      '##.~.~~~.~..#..........#########',
      '##....~~~#.##..#........###....#',
      '#####.~~#..###.##............###',
      '######...#.###...............###',
      '#####......####............#.###',
      '##################..#...........',
      '############################..##',
      '##############################.#',
      '################################'
    ],
    spawn:{
      ore:    { n:4, minGap:2, act:'quarry', node:'node_ore', e:'🟫', gives:'ore', label:'鐵礦脈',
               pool:[{x:6,y:4},{x:11,y:6},{x:20,y:3},{x:24,y:5},{x:15,y:9},{x:26,y:11},{x:5,y:10},{x:17,y:15},{x:27,y:16},{x:22,y:19}] },
      crystal:{ n:2, minGap:3, act:'gather', node:'node_crystal', e:'💎', gives:'crystal', label:'水晶簇', chance:0.8,
               pool:[{x:8,y:7},{x:22,y:8},{x:19,y:14},{x:26,y:19},{x:5,y:19}] },
      glow:   { n:2, minGap:2, act:'gather', node:'node_glowshroom', e:'🍄', gives:'mushroom', label:'螢光蕈',
               pool:[{x:12,y:10},{x:16,y:12},{x:25,y:14},{x:7,y:12},{x:21,y:5}] }
    },
    pick:{ n:[3,5], minGap:3, items:['pebble','stone','crystal','ore'] },
    puzzle:{x:7,y:16, n:'迴聲池', e:'🔊'}
  };
  /* ★ P3-b(v1.4.0):懸崖(三層台地、鳥巢/草藥/岩石)、山谷(蜿蜒溪+穀物/蜂巢/野果)、遺跡(石柱廣場+中央石室機關)、火山(中央熔岩湖不可走) */
  D.SCENE.cliff = {
    bg:'zone_cliff', bgColor:'#a08a6a', waterColor:'#3f8fd4', wallColor:'#5b4a3a',
    spawn0:{x:2,y:20}, exit:{x:0,y:20}, campGate:null,
    mask:[   /* ★ v1.18.0 依場景圖重建障礙:巨石/樹木/崖壁 '#'(自動偵測+手動補格,固定點強制可走,BFS 連通驗證 0 退步) */
      '################################',
      '################################',
      '#########...##...#.#.#...#######',
      '#########.....#......#..########',
      '#########.#....#.##.#...########',
      '#########........#...#.#.#######',
      '##########...............#######',
      '########.#.#.###################',
      '#########.##.###################',
      '####...##..........###...##.####',
      '####...#.##..#.#.......#...#.###',
      '####.#..#......###........##.###',
      '#####....................#.#.###',
      '####.....................###.###',
      '#####.#......#.......#......####',
      '############.############.##.###',
      '############.############....###',
      '####.....#.#.#....#....##..###.#',
      '##.##.##......###...#####.#.#.##',
      '###.###...##....#.##...#.###.###',
      '..........#......#...........#.#',
      '#####..###....#......#....##...#',
      '##.#####.#####.##.###.###.#....#',
      '################################'
    ],
    spawn:{
      nest:  { n:2, minGap:3, act:'gather', node:'node_nest', e:'🪺', gives:'egg', label:'遊隼巢', pool:[{x:12,y:3},{x:20,y:5},{x:16,y:2},{x:9,y:5}] },
      herb:  { n:3, minGap:2, act:'gather', node:'node_herb', e:'🍀', gives:'herb', label:'崖邊艾草', pool:[{x:6,y:10},{x:20,y:13},{x:26,y:10},{x:10,y:13},{x:14,y:10}] },
      stone: { n:3, minGap:2, act:'quarry', node:'node_stone', e:'🪨', gives:'stone', label:'落石堆', pool:[{x:5,y:18},{x:15,y:21},{x:25,y:18},{x:20,y:21},{x:28,y:21}] },
      feather:{ n:2, minGap:2, act:'gather', node:'node_nest', e:'🪶', gives:'feather', label:'羽毛堆', pool:[{x:22,y:3},{x:11,y:6},{x:18,y:12}] }
    },
    pick:{ n:[3,5], minGap:3, items:['feather','stone','pebble','egg'] },
    puzzle:{x:24,y:10, n:'風之柱', e:'🗼'}
  };
  D.SCENE.valley = {   /* ★ v1.109.0 重畫遮罩:溪水改真的不可走,中間留兩座石橋(x=8/22)過河,入口/出口移到南岸乾地 */
    bg:'zone_valley', bgColor:'#9fcf7a', waterColor:'#3f8fd4',
    spawn0:{x:2,y:20}, exit:{x:0,y:20}, campGate:null,
    mask:[   /* ★ v1.18.0 依場景圖重建障礙:巨石/樹木/崖壁 '#'(自動偵測+手動補格,固定點強制可走,BFS 連通驗證 0 退步) */
      '################################',
      '####......##..##...#####.......#',
      '##........##..##...#####..##.#.#',
      '#########.##..##...#####..##.###',
      '##.................#####..######',
      '##..........................####',
      '##.....##.........#.........####',
      '##.##..#...#................####',
      '##.##............#.........#####',
      '#....#.....####.....##.###.#####',
      '#..##..##..#..######....#..###.#',
      '#~~~~~~~~#~~~~~~~~~~~~.~~~~~~~~#',
      '#~~~~~~~~.~~~~~~~~~~~~.~~~~~~~~#',
      '#..#...........##........#######',
      '#.........#....##........###...#',
      '#...####...............#.####..#',
      '#...####...........#...........#',
      '#...####.......................#',
      '#..............................#',
      '##.#.#.........................#',
      '...###.........................#',
      '######.........................#',
      '######.........................#',
      '################################'
    ],
    spawn:{
      grain: { n:3, minGap:2, act:'gather', node:'node_grain', e:'🌾', gives:'grain', label:'野生小米', pool:[{x:8,y:4},{x:22,y:5},{x:14,y:7},{x:26,y:8},{x:6,y:8}] },
      hive:  { n:2, minGap:3, act:'gather', node:'node_hive', e:'🐝', gives:'honey', label:'野蜂巢', chance:0.85, pool:[{x:16,y:4},{x:28,y:3},{x:4,y:5}] },
      berry: { n:3, minGap:2, act:'gather', node:'node_bush', e:'🍓', gives:'berry', label:'野果叢', pool:[{x:8,y:17},{x:20,y:16},{x:26,y:19},{x:12,y:20},{x:4,y:19}] },
      fish:  { n:2, minGap:3, act:'fish', node:'node_fish', e:'🐟', gives:'fish', label:'台灣石𩼣', pool:[{x:6,y:11},{x:20,y:10},{x:26,y:11},{x:12,y:12}] },
      wood:  { n:2, minGap:3, act:'chop', node:'node_tree', e:'🌳', gives:'wood', label:'相思樹', pool:[{x:16,y:15},{x:24,y:15},{x:10,y:15}] }
    },
    pick:{ n:[3,5], minGap:3, items:['seed','berry','feather','grain'] },
    puzzle:{x:16,y:18, n:'磨坊遺址', e:'🎡'}
  };
  D.SCENE.ruins = {
    bg:'zone_ruins', bgColor:'#8f8f86', waterColor:'#3f8fd4', wallColor:'#5a5a52',
    spawn0:{x:16,y:22}, exit:{x:16,y:23}, campGate:null,
    mask:[   /* ★ v1.18.0 依場景圖重建障礙:巨石/樹木/崖壁 '#'(自動偵測+手動補格,固定點強制可走,BFS 連通驗證 0 退步) */
      '################################',
      '#............#.....#...........#',
      '#..#....#....##....#....#......#',
      '#.###...#.#..#..#..#..#.#...#..#',
      '#.##................#..........#',
      '#####...#...####.#####.........#',
      '##.#....#...##########..#...#..#',
      '##..#...#.#.#........##.#...#..#',
      '#...........#........#........##',
      '###.........#........#.........#',
      '#...#...#...#........#..#...#..#',
      '#...#...#.#.#........##.#...#..#',
      '#...#...#...#........#..#...#..#',
      '#...........#........#........##',
      '#...#...#...####.#####..#...#..#',
      '#...#...#.#.####.######.#...#..#',
      '#...#...#...............#...#..#',
      '#..............................#',
      '#####...#....#.....#....#...#..#',
      '#####.#.#.#..#..#..#..#.#...#..#',
      '#####...#....#.....#....#...#..#',
      '##.#..#.....................##.#',
      '####...#...............#.......#',
      '################.###############'
    ],
    spawn:{
      relic: { n:3, minGap:3, act:'gather', node:'node_relic', e:'🏺', gives:'relic', label:'陶片與石器', pool:[{x:6,y:5},{x:24,y:5},{x:6,y:17},{x:24,y:17},{x:16,y:5},{x:2,y:11}] },
      stone: { n:3, minGap:2, act:'quarry', node:'node_stone', e:'🪨', gives:'stone', label:'倒塌石柱', pool:[{x:9,y:9},{x:22,y:9},{x:9,y:13},{x:22,y:13},{x:28,y:2}] },
      crystal:{ n:1, minGap:3, act:'gather', node:'node_crystal', e:'💎', gives:'crystal', label:'祭壇水晶', chance:0.7, pool:[{x:16,y:20},{x:2,y:2},{x:29,y:20}] }
    },
    pick:{ n:[3,5], minGap:3, items:['stone','pebble','relic','crystal'] },
    puzzle:{x:16,y:11, n:'遺跡機關', e:'🗿'}
  };
  D.SCENE.volcano = {
    bg:'zone_volcano', bgColor:'#5a4038', waterColor:'#3f8fd4', wallColor:'#e8552a', deepWater:'#ff7a1a',
    spawn0:{x:16,y:22}, exit:{x:16,y:23}, campGate:null,
    mask:[   /* ★ v1.18.0 依場景圖重建障礙:巨石/樹木/崖壁 '#'(自動偵測+手動補格,固定點強制可走,BFS 連通驗證 0 退步) */
      '################################',
      '#.............#....#........#..#',
      '#....#..........#..............#',
      '#....#...#................#..###',
      '#....#.....................#...#',
      '#.....#.....####.##.......#....#',
      '#..........########..#.........#',
      '#........##############........#',
      '#.........###########.##.....#.#',
      '#.........###############......#',
      '#.#......###############.......#',
      '#.......################.......#',
      '#..........############........#',
      '#...##......#########..........#',
      '#............#######..........##',
      '#..............................#',
      '#..........#...........##......#',
      '#........#.#.........#...#.#...#',
      '#..............................#',
      '#.....#...................#...##',
      '#.....#..................##....#',
      '#.........#...........#........#',
      '#..............................#',
      '################.###############'
    ],
    spawn:{
      ore:   { n:3, minGap:3, act:'quarry', node:'node_ore', e:'🟫', gives:'ore', label:'火山鐵礦', pool:[{x:6,y:6},{x:26,y:6},{x:6,y:16},{x:26,y:16},{x:16,y:17}] },
      lava:  { n:3, minGap:2, act:'quarry', node:'node_lava_rock', e:'🌑', gives:'stone', label:'火山岩', pool:[{x:10,y:5},{x:22,y:5},{x:10,y:18},{x:22,y:18},{x:3,y:11},{x:29,y:11}] },
      crystal:{ n:2, minGap:3, act:'gather', node:'node_crystal', e:'💎', gives:'crystal', label:'火山水晶', pool:[{x:16,y:3},{x:4,y:20},{x:28,y:20},{x:16,y:20}] }
    },
    pick:{ n:[3,5], minGap:3, items:['stone','ore','crystal','pebble'] },
    puzzle:{x:16,y:16, n:'火山口觀測台', e:'🌋'}
  };

  /* ── 建築(第十二章 12.3;P1:營火／帳篷／倉庫,Lv1~2 可升) ── */
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
    { id:'pot',    n:'盆栽',     e:'🪴', comfort:2, cost:{fiber:2, seed:1},           d:'植物會行光合作用,還能讓人心情好。' },
    { id:'fence',  n:'小柵欄',   e:'🚧', comfort:2, cost:{wood:3},                    d:'把營地圍出邊界。' },
    { id:'lamp',   n:'路燈',     e:'🏮', comfort:3, cost:{wood:2, fiber:1, shell:1},  d:'夜裡的一點光,像家。' },
    { id:'rug',    n:'地毯',     e:'🧶', comfort:3, cost:{fiber:6},                   d:'纖維編織,踩起來不硌腳。' },
    { id:'chime',  n:'貝殼風鈴', e:'🐚', comfort:3, cost:{shell:5, fiber:1},          d:'風吹過就叮叮響——聲音是振動傳來的。' },
    { id:'flower', n:'花圃',     e:'🌸', comfort:3, cost:{seed:3, water:1},           d:'花吸引蜜蜂蝴蝶來傳粉。' },
    { id:'table',  n:'桌椅',     e:'🪑', comfort:4, cost:{wood:8},                    d:'終於可以好好坐著吃飯。' },
    { id:'bed',    n:'床',       e:'🛏', comfort:5, cost:{wood:6, fiber:6, leaf:3},   d:'睡得好,明天才有力氣。' },
    { id:'statue', n:'貝殼雕像', e:'🗿', comfort:5, cost:{stone:12, shell:8},         d:'島上的紀念碑。' }
  ];
  D.COMFORT_TIERS = [ { at:10, t:'睡覺多回 10 體力' }, { at:20, t:'明日 AP +1' }, { at:35, t:'夜襲機率 −10%' }, { at:50, t:'睡覺體力全滿' } ];

  /* ── 活動定義(第四章＋第十六章):knowledge(知識操作)＋quality(品質小遊戲) ── */
  D.ACTS = {
    gather: { n:'採集植物', e:'🌿', skill:'gather', stat:'dex', ap:1, sec:30, bgm:'bgm-play',
              qualityName:'輕輕摘', qualityHint:'長按拉扯,在果實掉下前的黃區放手!太用力果實會壓爛。' },
    chop:   { n:'伐木',     e:'🪓', skill:'chop',   stat:'pow', ap:1, sec:30, bgm:'bgm-play',
              qualityName:'連續三斧', qualityHint:'斧頭來回擺,在綠色甜蜜點時點下!三次綠區越來越窄。' },
    fire:   { n:'生火',     e:'🔥', skill:'fire',   stat:'wit', ap:1, sec:40, bgm:'bgm-play',
              qualityName:'吹氣', qualityHint:'火苗變小就點「吹」,吹太多會熄、太少會滅,維持在綠區 5 秒!' },
    build:  { n:'建造',     e:'🔨', skill:'build',  stat:'dex', ap:1, sec:40, bgm:'bgm-play',
              qualityName:'敲釘子', qualityHint:'釘子會依序閃,照順序快點敲完!' },
    /* ★ P2-a */
    fish:   { n:'捕魚',     e:'🎣', skill:'fish',   stat:'mov', ap:1, sec:30, bgm:'bgm-play',
              qualityName:'拉竿', qualityHint:'魚上鉤了!按住往左右拖,把張力指針維持在中間 3 秒。' },
    trash:  { n:'打撈海廢', e:'♻', skill:'trash',  stat:'dex', ap:1, sec:35, bgm:'bgm-play',
              qualityName:'快分', qualityHint:'最後幾樣會漂得更快,全部分對就是 ★★★!' },
    quarry: { n:'採石',     e:'⛏', skill:'quarry', stat:'pow', ap:1, sec:30, bgm:'bgm-play',
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
  D.ACTS.tame  = { n:'馴養',   e:'🐾', skill:'ranch', stat:'mov', ap:1, sec:30, bgm:'bgm-play',
                   qualityName:'慢慢靠近', qualityHint:'長按慢慢靠近,在黃區放手伸手摸牠;太快會把牠嚇跑!' };
  D.ACTS.canal = { n:'鋪水道', e:'💧', skill:'water', stat:'wit', ap:1, sec:75, bgm:'bgm-play',
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
  D.ACTS.craft = { n:'製作工具', e:'🛠', skill:'craft', stat:'dex', ap:1, sec:40, bgm:'bgm-play',
                   qualityName:'敲打組裝', qualityHint:'零件依序閃,照順序敲!敲對越多工具越牢。' };
  D.SKILLS.craft = { n:'製作', e:'🛠', stat:'dex', lv3:'藍圖部位有提示', lv5:'組裝節奏放慢', lv7:'製作材料 −20%' };
  D.QUIZ = D.QUIZ || {};
  D.QUIZ.craft = [
    { q:'鐵斧比石斧好用,主要因為鐵?', o:['更硬更耐磨','更輕','會發光','不用磨'], a:0, why:'鐵的硬度和韌性都比石頭好,刀口不容易崩掉。' },
    { q:'工具的握柄多用木頭,是因為木頭?', o:['不導熱、有彈性、輕','最硬','會導電','會發熱'], a:0, why:'木頭是熱的不良導體、有彈性,握起來不燙也不震手。' },
    { q:'鎬子的頭要做得尖,是為了?', o:['受力面積小,壓力大','比較好看','比較輕','比較長'], a:0, why:'同樣的力,面積越小壓力越大,越容易敲碎石頭。' },
    { q:'柄越長的鎚子越省力,是利用?', o:['槓桿原理','浮力','磁力','摩擦力'], a:0, why:'長柄=施力臂長,同樣的力產生更大的力矩。' },
    { q:'鐵放久了會生鏽,是因為鐵和什麼作用?', o:['空氣中的氧和水','木頭','石頭','光'], a:0, why:'鐵+氧+水 → 氧化鐵(鏽),乾燥或上油可以防鏽。' },
    { q:'釣線要用什麼材料?', o:['細但韌、不易斷','很粗很硬','很脆','會吸水變重'], a:0, why:'韌性好的細線魚看不見又不會被拉斷。' },
    { q:'把鐵礦變成鐵,需要?', o:['高溫加熱(冶煉)','泡水','曬太陽','用力敲'], a:0, why:'高溫下用木炭把鐵礦裡的氧奪走,留下鐵。' },
    { q:'磨刀石讓斧頭變利,是靠?', o:['摩擦磨掉多餘的金屬','加熱','磁力','泡水'], a:0, why:'硬的磨石磨掉刀口的金屬,形成更薄的刃。' },
    { q:'藤籃用蘆葦編織,而不是用石頭做,因為?', o:['輕又有韌性','石頭太便宜','蘆葦會發光','石頭會壞'], a:0, why:'材料要依用途選:裝東西要輕、能彎。' },
    { q:'貝殼可以磨成魚鉤,是因為貝殼?', o:['硬而且能磨尖','很軟','會浮','會溶解'], a:0, why:'貝殼主要成分是碳酸鈣,夠硬也能磨。' }
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
  D.ACTS.research = { n:'科技研究', e:'🔬', skill:'research', stat:'wit', ap:1, sec:75, bgm:'bgm-play',
                      qualityName:'零件接線', qualityHint:'點零件轉方向,把起點接到終點!剩越多時間品質越高。' };
  D.SKILLS.research = { n:'研究', e:'🔬', stat:'wit', lv3:'接線拼圖多 15 秒', lv5:'研究材料 −20%', lv7:'研究成功科技點退還一半' };
  D.QUIZ = D.QUIZ || {};
  D.QUIZ.research = [
    { q:'用棍子撬起大石頭,棍子是哪一種簡單機械?', o:['槓桿','滑輪','斜面','輪軸'], a:0, why:'槓桿:支點、施力點、抗力點,支點靠近重物最省力。' },
    { q:'定滑輪最主要的作用是?', o:['改變施力的方向','省一半力','讓東西變輕','讓繩子變長'], a:0, why:'定滑輪不省力,但可以往下拉把東西往上提。' },
    { q:'動滑輪可以?', o:['省力','省時間','改變方向但不省力','讓重物消失'], a:0, why:'動滑輪跟著重物一起動,施力大約只要重量的一半。' },
    { q:'把重物推上斜坡比直接抬起來輕鬆,是因為?', o:['斜面省力','斜面讓東西變輕','斜面有魔法','斜面比較短'], a:0, why:'斜面越長越緩越省力,但要推的距離變長。' },
    { q:'燈泡要亮,電路必須?', o:['形成通路(接成一圈)','斷開','只接一條線','泡在水裡'], a:0, why:'電流從電池正極經過燈泡回到負極,形成通路才會亮。' },
    { q:'下列哪一種材料可以導電?', o:['鐵釘','木筷','塑膠尺','橡皮擦'], a:0, why:'金屬是導體;木頭、塑膠、橡膠是絕緣體。' },
    { q:'水車轉動,是把什麼能量變成轉動?', o:['流水的動能','聲音','電','光'], a:0, why:'流動的水推葉片,水的動能變成水車的動能。' },
    { q:'火把要一直燒,需要不斷補充?', o:['可燃物和空氣','水','石頭','聲音'], a:0, why:'燃燒三要素:可燃物、助燃物(氧氣)、達到燃點的溫度。' },
    { q:'開關的功能是?', o:['接通或切斷電路','讓電變多','儲存電','讓燈變亮'], a:0, why:'開關閉合電路接通、打開電路斷開。' },
    { q:'螺絲釘是哪一種簡單機械的變形?', o:['斜面','滑輪','槓桿','輪軸'], a:0, why:'螺紋是繞在圓柱上的斜面,轉一圈只前進一點,所以省力。' }
  ];
  /* 各區解謎點(POI puzzle):3 題全對才解開,獎勵貝幣+科技點;每區只能解一次(ISL.puzzles[zone]) */
  D.PUZZLES = {
    forest: { n:'年輪樹樁', e:'🪵', intro:'樹樁上一圈圈的紋路,好像在說這座森林的故事……', reward:{shell:5, tech:3}, qs:[
      { q:'樹樁上的年輪一圈代表?', o:['一年','一個月','一天','一片葉子'], a:0, why:'樹每年長一圈(春天長得快顏色淺、秋冬慢顏色深)。' },
      { q:'年輪特別窄的那幾年,代表?', o:['那幾年乾旱或寒冷,長得慢','那幾年雨水多','樹在睡覺','樹被砍過'], a:0, why:'環境不好,樹長得慢,年輪就窄。' },
      { q:'樹幹裡負責運水的部分在?', o:['靠近樹皮的外圈','正中央','樹根','葉子'], a:0, why:'外圈的木質部把水往上送;正中央是老的心材。' } ] },
    river:  { n:'水車座', e:'⚙', intro:'岸邊有一個古老的木座,好像曾經裝過會轉的東西……', reward:{shell:5, tech:4}, qs:[
      { q:'水車要放在哪裡最會轉?', o:['水流最快的地方','平靜的水潭','岸上','水底'], a:0, why:'流速快,推葉片的力量大。' },
      { q:'溪水從上游到下游,速度通常?', o:['上游快、下游慢','一樣快','下游快','都不流'], a:0, why:'上游坡度大水流急,下游平緩。' },
      { q:'溪流轉彎處,哪一邊被沖蝕得比較厲害?', o:['外側','內側','兩邊一樣','都不會'], a:0, why:'外側水流快,侵蝕;內側慢,堆積。' } ] },
    rock:   { n:'潮池', e:'🦀', intro:'退潮後岩石間留下一窪窪小水池,裡面躲著好多生物……', reward:{shell:8, tech:2}, qs:[
      { q:'潮汐(海水漲退)主要是誰引起的?', o:['月球的引力','風','魚','溫度'], a:0, why:'月球(和太陽)的引力拉動海水,一天約兩次漲退。' },
      { q:'潮池裡的寄居蟹殼是?', o:['撿來的空螺殼','自己長的','石頭','塑膠'], a:0, why:'寄居蟹腹部柔軟,借用死掉螺類的殼保護自己。' },
      { q:'海星、海膽屬於?', o:['棘皮動物','魚類','哺乳類','植物'], a:0, why:'棘皮動物身體表面有棘刺,五輻射對稱。' } ] },
    grass:  { n:'風向草', e:'🍃', intro:'這叢草全部往同一邊倒,好像在告訴我什麼……', reward:{shell:5, tech:3}, qs:[
      { q:'草全部往東邊倒,表示風從哪裡吹來?', o:['西邊','東邊','上面','沒有風'], a:0, why:'風向是指風「來」的方向,西風吹向東。' },
      { q:'風是怎麼形成的?', o:['空氣由高壓流向低壓','樹搖出來的','海浪','太陽轉動'], a:0, why:'太陽把地面曬得不均勻,空氣冷熱不同、壓力不同就流動。' },
      { q:'蒲公英的種子靠什麼傳播?', o:['風','水','動物','自己爆開'], a:0, why:'種子有絨毛像降落傘,隨風飄走。' } ] },
    lake:   { n:'湖心石碑', e:'🪨', intro:'湖邊有塊刻著字的石碑,寫著:「看得見的魚,不在你看見的地方。」', reward:{shell:6, tech:4}, qs:[
      { q:'從岸上看水裡的魚,魚的真正位置比看到的?', o:['更深','更淺','一樣','在水面上'], a:0, why:'光從水進入空氣會折射,看起來的位置比實際淺。' },
      { q:'湖水為什麼看起來是藍色的?', o:['水吸收紅光、散射藍光,又映著天空','水裡有藍色顏料','魚是藍的','石頭是藍的'], a:0, why:'水對紅光吸收較多,加上天空的反射。' },
      { q:'湖泊和溪流最大的不同是?', o:['湖水幾乎不流動','湖水是鹹的','湖裡沒有生物','湖水會發光'], a:0, why:'湖泊是靜水,水中的氧氣和溫度分層都不一樣。' } ] },
    cave:   { n:'迴聲池', e:'🔊', intro:'對著洞裡喊一聲,聲音竟然回來了好幾次……', reward:{shell:8, tech:5}, qs:[
      { q:'迴聲是因為聲音?', o:['被岩壁反射回來','跑得太慢','變成光','被水吸走'], a:0, why:'聲波碰到硬的表面會反射,距離夠遠就聽得出來。' },
      { q:'聲音需要靠什麼傳播?', o:['空氣、水或固體(介質)','什麼都不用','只有光','只有真空'], a:0, why:'聲音是振動,要有介質才能傳;真空中聽不到聲音。' },
      { q:'洞窟頂上像冰柱一樣往下長的石頭叫?', o:['鐘乳石','石筍','火山岩','水晶'], a:0, why:'含碳酸鈣的水滴慢慢沉積,往下長是鐘乳石、往上長是石筍。' } ] },
    /* ★ P3-b */
    cliff:  { n:'風之柱', e:'🗼', intro:'懸崖頂上立著一根石柱,風從縫裡呼呼地穿過……', reward:{shell:8, tech:5}, qs:[
      { q:'越高的地方空氣越?', o:['稀薄、氣壓越低','濃、氣壓越高','一樣','越熱'], a:0, why:'越高空氣越少,氣壓越低,所以爬高山會喘。' },
      { q:'用滑輪把東西吊上懸崖,繩子要繞過滑輪的哪裡?', o:['輪子的凹槽','輪軸中心','旁邊','不用繞'], a:0, why:'繩子在凹槽裡才不會滑出來。' },
      { q:'懸崖上的鳥為什麼把巢築在高處?', o:['避開天敵','比較暖','風景好','蛋會滾下去'], a:0, why:'高處掠食者不容易到達,蛋和雛鳥比較安全。' } ] },
    valley: { n:'磨坊遺址', e:'🎡', intro:'溪邊有座倒塌的磨坊,大石磨還在,只是水車不見了……', reward:{shell:8, tech:6}, qs:[
      { q:'磨坊用水車帶動石磨,是把水的能量變成?', o:['轉動(動能)','光','聲音','電'], a:0, why:'水推葉片 → 軸轉動 → 石磨轉,能量轉換但總量不變。' },
      { q:'穀物要磨成粉才能做餅,磨的原理是?', o:['兩塊石頭摩擦把種子壓碎','加熱融化','用水泡軟','讓它自己裂開'], a:0, why:'摩擦與壓力把硬的種子碾碎,和牙齒嚼東西一樣。' },
      { q:'山谷裡溪水彎來彎去(曲流),是因為?', o:['流水侵蝕和堆積','風吹','動物走過','太陽照'], a:0, why:'外側侵蝕、內側堆積,河道越彎越明顯。' } ] },
    ruins:  { n:'遺跡機關', e:'🗿', intro:'石室中央有一塊刻著閃電符號的石板,旁邊插著銅棒與水晶……好像是古人的電路!', reward:{shell:12, tech:8}, qs:[
      { q:'把銅棒接上,燈才亮,銅是?', o:['導體','絕緣體','磁鐵','燃料'], a:0, why:'金屬是導體;水晶(石英)不導電是絕緣體。' },
      { q:'電路裡電流的方向,一般規定從電池的?', o:['正極流向負極','負極流向正極','兩邊同時','沒有方向'], a:0, why:'習慣上電流由正極經外電路流回負極。' },
      { q:'兩顆燈泡串聯,拔掉一顆,另一顆會?', o:['熄滅','更亮','不變','閃爍'], a:0, why:'串聯只有一條路,斷了整個電路就斷。並聯才各走各的。' } ] },
    volcano:{ n:'火山口觀測台', e:'🌋', intro:'站在火山口邊,腳下的岩石還是溫的。這座島,原來是火山噴出來的……', reward:{shell:15, tech:10}, qs:[
      { q:'岩漿冷卻凝固後變成?', o:['火成岩','沉積岩','變質岩','沙子'], a:0, why:'岩漿或熔岩冷卻結晶形成火成岩,例如玄武岩。' },
      { q:'火山島是怎麼形成的?', o:['海底火山噴發堆高露出海面','海水退了','風吹沙堆','動物蓋的'], a:0, why:'岩漿一次次噴出堆積,最後高出海面就成島。' },
      { q:'火山附近的土壤特別肥沃,是因為?', o:['火山灰含礦物質','比較熱','有很多水','沒有石頭'], a:0, why:'火山灰風化後釋放礦物質,植物長得好。' } ] }
  };

  /* ── 題庫(三~六年級隨機):烹飪(熱)、種植(植物)、馴養(動物)、水利(水) ── */
  D.QUIZ = D.QUIZ || {};
  D.QUIZ.cook = [
    { q:'鍋子放在火上,鍋底先熱,慢慢整個鍋子都熱了,這是?', o:['傳導','對流','輻射','蒸發'], a:0, why:'熱在固體裡一個粒子傳一個粒子,叫傳導。' },
    { q:'煮湯時,底下熱水往上、上面冷水往下,整鍋變熱,這是?', o:['對流','傳導','反射','凝固'], a:0, why:'液體和氣體靠上下流動傳熱,叫對流。' },
    { q:'站在營火旁邊不碰到火也覺得暖,是因為?', o:['輻射','傳導','對流','溶解'], a:0, why:'熱可以像光一樣直接射過來,叫輻射。' },
    { q:'一大氣壓下,水燒開的溫度大約是?', o:['100°C','50°C','200°C','0°C'], a:0, why:'水的沸點約 100°C,再加熱只會變成水蒸氣,不會更燙。' },
    { q:'哪一種材料最適合當鍋柄?', o:['木頭','鐵','銅','鋁'], a:0, why:'木頭是熱的不良導體,握著不燙手。' },
    { q:'煎蛋時透明的蛋白變白、變硬,是因為?', o:['蛋白質受熱變性凝固','水蒸發了','蛋白融化','空氣跑進去'], a:0, why:'蛋白質受熱會改變結構,從液態變固態。' },
    { q:'把野果加熱煮成果醬,果醬越煮越稠是因為?', o:['水分蒸發變少','糖跑掉了','果實變大','溫度變低'], a:0, why:'水變成水蒸氣跑掉,剩下的就變濃稠。' },
    { q:'食物要煮熟才吃,最主要是為了?', o:['殺死細菌和寄生蟲','讓食物變大','增加水分','讓顏色變漂亮'], a:0, why:'高溫能殺死大部分的細菌與寄生蟲,才不會生病。' },
    { q:'鹽放進熱湯裡不見了,鹽去哪了?', o:['溶解在水裡','蒸發了','燒掉了','沉到鍋底變石頭'], a:0, why:'鹽溶解在水中,湯嚐起來是鹹的。' },
    { q:'哪一種火最適合煮湯?', o:['小火慢煮','大火猛燒','不用火','火越大越好'], a:0, why:'小火讓水保持微滾,味道慢慢釋出、不燒焦。' }
  ];
  D.QUIZ.plant = [
    { q:'植物製造養分的地方主要在?', o:['葉子','根','花','種子'], a:0, why:'葉子裡的葉綠素利用陽光、水和二氧化碳製造養分。' },
    { q:'種子發芽需要的三個條件是?', o:['水、空氣、適當溫度','陽光、糖、肥料','音樂、水、土','風、雨、雷'], a:0, why:'種子發芽不一定要陽光,但要水、空氣和適當溫度。' },
    { q:'植物的根主要負責?', o:['吸收水分和養分、固定植株','製造養分','開花結果','呼吸空氣'], a:0, why:'根像吸管一樣吸水,也像錨一樣抓住土壤。' },
    { q:'田裡的水從土壤到葉子,是靠哪個部位運送?', o:['莖','花','果實','種子'], a:0, why:'莖裡有維管束,像水管一樣把水往上送。' },
    { q:'種太密的作物長得不好,是因為?', o:['互相搶陽光、水和養分','土壤太多','種子太大','水太多'], a:0, why:'植物之間會競爭資源,太擠大家都長不好。' },
    { q:'早上澆水比中午澆水好,是因為?', o:['中午太熱水很快蒸發','早上的水比較甜','中午植物在睡覺','早上土比較硬'], a:0, why:'中午太陽大,水還沒被吸收就蒸發了。' },
    { q:'一年生植物從種子到結種子,順序是?', o:['發芽→長葉→開花→結果','開花→發芽→結果→長葉','結果→發芽→開花→長葉','長葉→結果→發芽→開花'], a:0, why:'植物的生命週期:發芽、長葉、開花、結果、種子。' },
    { q:'花對植物來說最重要的功能是?', o:['傳粉、繁殖下一代','製造養分','吸收水分','儲存水'], a:0, why:'花是植物的繁殖器官,傳粉後才會結果、產生種子。' },
    { q:'穀物(像稻米、小麥)我們吃的是植物的哪個部位?', o:['種子','根','葉','莖'], a:0, why:'稻米、小麥、玉米都是植物的種子,裡面儲存了澱粉。' },
    { q:'把落葉、爛掉的野果埋進土裡,對田地有什麼好處?', o:['分解後變成養分(堆肥)','讓土變硬','讓蟲都跑掉','讓土變成石頭'], a:0, why:'分解者(細菌、蚯蚓)把它們分解成植物能吸收的養分。' }
  ];
  D.QUIZ.tame = [
    { q:'哺乳類動物的共同特徵是?', o:['胎生、有毛、喝母乳','卵生、有羽毛','有鱗片、冷血','六隻腳'], a:0, why:'哺乳類直接生小寶寶,用奶餵養,身上有毛。' },
    { q:'雞、海鷗這一類動物叫做?', o:['鳥類','哺乳類','爬蟲類','兩生類'], a:0, why:'鳥類有羽毛、有喙、卵生。' },
    { q:'兔子的門牙一直長,所以牠要?', o:['常常啃東西磨牙','不吃東西','睡覺','游泳'], a:0, why:'嚙齒類和兔子的門牙終生生長,要靠啃磨保持長度。' },
    { q:'山羊吃草,牠在食物鏈裡是?', o:['消費者','生產者','分解者','太陽'], a:0, why:'植物是生產者,吃植物的動物是消費者(初級)。' },
    { q:'青蛙小時候住在水裡用鰓呼吸,長大用肺,牠是?', o:['兩生類','魚類','爬蟲類','鳥類'], a:0, why:'兩生類一生經歷水陸兩種環境,會變態。' },
    { q:'動物身上的毛或羽毛,最主要的功能是?', o:['保暖','好看','發光','當食物'], a:0, why:'毛和羽毛留住空氣,減少熱散失。' },
    { q:'照顧家畜時,最基本要提供?', o:['食物、乾淨的水、安全的住所','手機','玩具','音樂'], a:0, why:'動物和我們一樣需要吃、喝、住得安全。' },
    { q:'雞蛋的蛋殼是硬的,主要成分是?', o:['碳酸鈣','鐵','塑膠','糖'], a:0, why:'蛋殼含碳酸鈣,能保護裡面的小雞胚胎。' },
    { q:'馴養動物時要慢慢靠近,是因為?', o:['動物看到快速動作會以為是天敵','動物喜歡慢','跑步會累','靠近要花錢'], a:0, why:'突然的動作和聲音會觸發動物的逃跑本能。' },
    { q:'哪一種動物是「變溫動物」(體溫隨環境改變)?', o:['蛇','山羊','雞','兔子'], a:0, why:'爬蟲類、兩生類、魚類是變溫動物;鳥和哺乳類是恆溫。' }
  ];
  D.QUIZ.canal = [
    { q:'水總是往哪裡流?', o:['低處','高處','北邊','熱的地方'], a:0, why:'受重力影響,水從高處流向低處。' },
    { q:'要把溪水引到營地,水道的起點應該比終點?', o:['高','低','一樣高','沒差'], a:0, why:'起點高、終點低,水才會自己流過去。' },
    { q:'水道要轉彎時用彎管,直的地方用直管,這是在利用水的什麼特性?', o:['水會沿著容器流動,沒有固定形狀','水是固體','水不會動','水會飛'], a:0, why:'液體沒有固定形狀,會順著管子的形狀流。' },
    { q:'水道的水從哪裡來?溪水最上游的源頭通常是?', o:['山上的雨水和地下水','海水','瓶裝水','水龍頭'], a:0, why:'雨水落在山上匯集成溪流,最後流進海裡——這是水循環。' },
    { q:'兩根水管一粗一細,同樣時間內哪根流過的水比較多?', o:['粗的','細的','一樣','都不流'], a:0, why:'管子越粗,水流的通道越大,流量越大。' },
    { q:'水道漏水了,最可能的原因是?', o:['接口沒對好','水太乾淨','天氣太好','水太少'], a:0, why:'管子接口沒接緊,水就從縫隙漏出去。' },
    { q:'古人用「水車」引水,是利用什麼力量轉動水車?', o:['水流的力量','風','電','人力'], a:0, why:'流動的水推動葉片,水車就會轉。' },
    { q:'農田引水太多,土裡沒有空氣,作物會?', o:['根爛掉','長更快','變甜','開更多花'], a:0, why:'根也要呼吸,泡在水裡太久會缺氧腐爛。' },
    { q:'水從溪流流到大海,再變成雲、下雨回到山上,叫做?', o:['水循環','食物鏈','光合作用','傳導'], a:0, why:'蒸發→凝結→降水,水在地球上不停循環。' },
    { q:'水道做好後,為什麼要用石頭砌邊?', o:['防止水把泥土沖走','石頭會發光','石頭會吸水','讓水變熱'], a:0, why:'流水會侵蝕鬆軟的土,硬的石頭能保護水道。' }
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
      q:{ q:'蝙蝠在黑暗中飛不撞牆,是靠?', o:['發出聲音聽回聲','眼睛特別亮','鼻子聞路','記住地圖'], a:0, why:'蝙蝠發出超音波,聽回聲判斷障礙物位置(回聲定位)。' } },
    { k:'boar',   n:'野豬', e:'🐗', tool:'fist', from:1, hint:'連點 3 下趕跑', why:'純反應!',
      q:{ q:'在山上遇到野豬,最安全的做法是?', o:['保持距離慢慢退開','跑過去摸牠','大聲追牠','餵牠吃東西'], a:0, why:'野生動物受驚會攻擊,遠離、不餵食最安全。' } },
    /* ★ v1.11.0 甲:新增四種魔物,各綁一個自然科學概念 */
    { k:'slime',  n:'黏泥怪', e:'🟢', tool:'salt', from:5, hint:'撒鹽!它會脫水', why:'鹽把水吸出來(滲透作用),黏泥就縮小了。',
      q:{ q:'蛞蝓被撒鹽會縮小,是因為?', o:['鹽把牠身體的水吸出來','鹽很燙','鹽會發光','鹽會變成酸'], a:0, why:'水會從鹽分低的地方流向鹽分高的地方(滲透),身體的水被吸走就脫水了。' } },
    { k:'ember',  n:'火精', e:'🔥', tool:'water', from:5, hint:'潑水!降溫又隔絕空氣', why:'水帶走熱、隔絕空氣,燃燒三要素少了兩個。',
      q:{ q:'燃燒需要三個條件,下列哪一個不是?', o:['水','可燃物','氧氣(空氣)','足夠的溫度'], a:0, why:'燃燒三要素=可燃物、助燃物(氧氣)、燃點溫度;水是用來滅火的。' } },
    { k:'basilisk', n:'石化蛇', e:'🐍', tool:'mirror', from:9, hint:'用鏡子把目光反射回去', why:'光遇到鏡面會反射(入射角=反射角)。',
      q:{ q:'鏡子能反射光,是因為鏡面?', o:['很光滑','很重','很冷','會發光'], a:0, why:'光滑的表面讓光整齊地反射回去(鏡面反射);粗糙表面則是漫反射。' } },
    { k:'spark',  n:'雷精', e:'⚡', tool:'glove', from:9, hint:'戴橡膠手套抓它!', why:'橡膠是絕緣體,電流過不去。',
      q:{ q:'電工戴橡膠手套工作,是因為橡膠是?', o:['絕緣體','導體','磁鐵','燃料'], a:0, why:'絕緣體(橡膠、塑膠、玻璃)不讓電流通過,可以保護人。' } }
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
    intro: ['石板下面有階梯,黑漆漆的……解開機關後,門真的開了。', '(地下層每天可以探一次。遇到魔物要先想「它怕什麼」,再回答一題;答錯會受傷,體力用完就得撤退。)'],
    floorNames: ['B1 石廊', 'B2 水晶室', 'B3 守墓者之間'],
    perFloor: [2, 2, 1],   /* 每層遇敵數(第 3 層 = 守墓者) */
    loot: [ {shell:4, relic:1}, {shell:6, crystal:1}, {shell:15, tech:6, crystal:2} ],
    boss: { k:'guardian', n:'守墓石像', e:'🗿', tool:'gong', hint:'石像會共振!敲鑼', why:'聲音是振動,大鑼的振動讓石像裂開(共振)。',
      qs:[ { q:'聲音是由什麼產生的?', o:['物體的振動','光','熱','磁力'], a:0, why:'任何聲音都來自振動,振動停了聲音也停。' },
           { q:'敲鑼後用手按住鑼面,聲音會?', o:['馬上停','更大聲','變高音','不變'], a:0, why:'手按住讓振動停止,聲音就停了。' },
           { q:'聲音在哪裡傳得最快?', o:['固體(石頭)','空氣','真空','沒有差別'], a:0, why:'固體分子排得緊,振動傳得最快;真空沒有介質,聲音傳不出去。' } ] },
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
    { q:'木頭做的浮標會浮在水上,是因為?', o:['木頭密度比水小','木頭很重','水很硬','風吹'], a:0, why:'密度比水小的東西會浮。' },
    { q:'看水裡的魚,牠真正的位置通常在看起來的?', o:['更深一點','更淺一點','一樣','旁邊'], a:0, why:'光從水進空氣會折射,看到的比實際淺。' },
    { q:'浮標突然猛沉,代表?', o:['魚咬餌了','風吹','水變深','浮標壞了'], a:0, why:'魚拉動魚餌,浮標才會被拉下去。' },
    { q:'魚用什麼呼吸?', o:['鰓','肺','皮膚','鰭'], a:0, why:'魚用鰓過濾水中的氧氣。' },
    { q:'魚身上的鰭主要用來?', o:['游泳與平衡','呼吸','吃東西','看東西'], a:0, why:'尾鰭推進、胸鰭腹鰭控制方向與平衡。' },
    { q:'把石頭放進裝滿水的桶子,水會?', o:['溢出來','變少','不變','消失'], a:0, why:'石頭佔了體積,水被排開。' },
    { q:'溪流上游的水流通常比下游?', o:['快','慢','一樣','不流動'], a:0, why:'坡度大,水流快。' },
    { q:'水從高處流向低處,是因為?', o:['重力','風','魚推','太陽'], a:0, why:'地球引力把水往下拉。' },
    { q:'在溪邊哪裡最容易看到魚?', o:['水流較緩、有遮蔽的地方','瀑布正下方','完全乾的石頭上','樹上'], a:0, why:'魚會躲在水流緩、有掩護的地方休息。' },
    { q:'哪一種動物「不是」魚?', o:['鯨魚','鯽魚','鱸魚','鰻魚'], a:0, why:'鯨魚是哺乳類,用肺呼吸。' }
  ];
  D.QUIZ.trash = [
    { q:'寶特瓶在海裡大約要多久才分解?', o:['幾百年','一星期','一年','一天'], a:0, why:'塑膠幾乎不會被自然分解。' },
    { q:'海龜為什麼會吃塑膠袋?', o:['以為是水母','喜歡塑膠','肚子餓什麼都吃','塑膠袋香'], a:0, why:'漂在水裡的塑膠袋外型很像水母。' },
    { q:'廢棄漁網對海洋生物的危害是?', o:['纏住動物','讓水變乾淨','提供食物','幫魚遮陽'], a:0, why:'幽靈漁網會纏住海龜、海豚。' },
    { q:'鋁罐屬於哪一類回收?', o:['金屬','紙類','塑膠','廚餘'], a:0, why:'鋁是金屬。' },
    { q:'回收的好處是?', o:['減少垃圾、節省資源','讓垃圾變多','汙染海洋','浪費電'], a:0, why:'回收再利用能少開採、少砍樹。' },
    { q:'塑膠碎成小顆粒後叫做?', o:['塑膠微粒','沙子','鹽','珍珠'], a:0, why:'塑膠微粒會被魚吃下,最後回到人的餐桌。' },
    { q:'海邊撿到的海漂垃圾,很多來自?', o:['陸地上的河川與雨水沖下海','海底火山','魚製造','天上掉下來'], a:0, why:'陸地垃圾隨河川入海。' },
    { q:'減少海洋垃圾,最好的方法是?', o:['從源頭少用一次性塑膠','多丟垃圾','把垃圾埋在沙灘','丟進海裡'], a:0, why:'少用才是根本。' },
    { q:'紙類回收前應該?', o:['壓平、去除膠帶','泡水','燒掉','撕碎丟海裡'], a:0, why:'乾淨、壓平的紙才好回收。' },
    { q:'寶特瓶在荒島上可以再利用做?', o:['浮筒','火種','石頭','食物'], a:0, why:'密封的空瓶會浮,可以當浮筒。' }
  ];
  D.QUIZ.quarry = [
    { q:'岩石是由什麼組成的?', o:['礦物','水','木頭','空氣'], a:0, why:'岩石由一種或多種礦物組成。' },
    { q:'海邊的岩石被海浪打久了會?', o:['變圓變光滑','變尖','長大','變軟'], a:0, why:'海浪不斷磨蝕,稜角被磨圓。' },
    { q:'岩石一層一層堆疊的樣子,可能是?', o:['沉積岩','火成岩','鐵','冰'], a:0, why:'沉積物一層層堆積壓實形成沉積岩。' },
    { q:'岩漿冷卻後形成的岩石是?', o:['火成岩','沉積岩','沙','泥土'], a:0, why:'例如玄武岩、花崗岩。' },
    { q:'用鎬子敲石頭,握在鎬柄尾端比較?', o:['省力','費力','一樣','危險'], a:0, why:'槓桿原理:施力臂越長越省力。' },
    { q:'潮間帶指的是?', o:['漲潮淹沒、退潮露出的地方','海底最深處','沙灘最上面','山上'], a:0, why:'漲退潮之間的區域,生物很多。' },
    { q:'退潮時岩石上的水窪叫?', o:['潮池','游泳池','水井','湖'], a:0, why:'潮池裡有螃蟹、海葵、小魚。' },
    { q:'石頭比木頭?', o:['硬且不會浮','軟','會浮','會燃燒'], a:0, why:'岩石密度大又硬。' },
    { q:'硬的石頭適合當什麼?', o:['營火底座','床墊','屋頂','火種'], a:0, why:'耐熱又穩固。' },
    { q:'岩石經過風吹雨打慢慢碎裂叫?', o:['風化','融化','燃燒','蒸發'], a:0, why:'風化後的碎屑變成沙和土。' }
  ];
  D.QUIZ.defense = [
    { q:'影子是怎麼形成的?', o:['光被物體擋住','物體發光','空氣變黑','水反射'], a:0, why:'光直線前進,被擋住的地方就是影子。' },
    { q:'磁鐵會吸哪一種東西?', o:['鐵釘','木頭','塑膠','紙'], a:0, why:'磁鐵吸鐵、鈷、鎳。' },
    { q:'蝙蝠在黑暗中怎麼找路?', o:['發出聲音聽回聲','用眼睛','聞味道','摸牆'], a:0, why:'回聲定位。' },
    { q:'敲鑼的聲音是怎麼傳到耳朵的?', o:['靠空氣振動','靠光','靠水','靠磁鐵'], a:0, why:'聲音靠介質振動傳播。' }
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
    { q:'想讓營火熄滅,最好移除哪一個?', o:['把燃料撥開分散','繼續搧風','蓋上乾葉'], a:0, why:'沒有可燃物,火就燒不下去。' },
    { q:'紙和木頭,哪一個先燒起來?', o:['紙','木頭','一樣快'], a:0, why:'紙比較薄、燃點低,先達到燃點。' }
  ];

  /* ── 題庫(每活動 15 題,三～六年級自然,格式沿用 q/o/a/why) ── */
  D.QUIZ = D.QUIZ || {};   /* ★ v1.1.0 改為不覆蓋(上方已放 P2 題庫) */
  D.QUIZ.gather = [
    { q:'植物的哪個部位負責吸收水分?', o:['根','葉','花','果實'], a:0, why:'根有根毛,能從土壤吸收水分和養分。' },
    { q:'葉子是綠色的,是因為含有什麼?', o:['葉綠素','糖','水','鹽'], a:0, why:'葉綠素能吸收光,進行光合作用。' },
    { q:'植物行光合作用需要陽光、水和什麼?', o:['二氧化碳','氧氣','氮氣','泥土'], a:0, why:'植物吸收二氧化碳,製造養分並放出氧氣。' },
    { q:'蒲公英的種子靠什麼傳播?', o:['風','水','人','火'], a:0, why:'蒲公英種子有冠毛,像降落傘隨風飄。' },
    { q:'海邊的林投果能漂到別的島,是因為?', o:['果實輕又防水','很重','會游泳','有翅膀'], a:0, why:'椰子靠海水傳播,外殼纖維多、能浮。' },
    { q:'鬼針草的種子靠什麼傳播?', o:['黏在動物身上','風吹','水流','自己彈跳'], a:0, why:'鬼針草有倒鉤,會黏在動物毛或衣服上。' },
    { q:'種子發芽一定需要的條件是?', o:['水、空氣、適當溫度','陽光','肥料','風'], a:0, why:'多數種子發芽不需要光,但一定要水、空氣和適溫。' },
    { q:'植物的莖主要功能是?', o:['運送水分與養分','製造養分','吸收水分','傳播種子'], a:0, why:'莖裡有維管束,像水管一樣運送。' },
    { q:'花的作用是?', o:['繁殖','行光合作用','吸水','儲存養分'], a:0, why:'花授粉後結成果實和種子。' },
    { q:'在荒島上,哪一種顏色鮮豔的漿果比較該小心?', o:['不認識的都先別吃','紅色的都能吃','黃色的都能吃','越漂亮越安全'], a:0, why:'很多鮮豔漿果有毒,不認識的一律不吃。' },
    { q:'植物會往哪個方向生長?', o:['向光','背光','向下','隨便'], a:0, why:'植物有向光性,莖葉會朝光源生長。' },
    { q:'林投樹的長葉子可以拿來做什麼?', o:['編織與遮雨','當食物主食','生火用的火種','當石頭'], a:0, why:'椰葉纖維長又韌,適合編織屋頂。' },
    { q:'哪一種是「根」可以吃的植物?', o:['胡蘿蔔','蘋果','高麗菜','玉米'], a:0, why:'胡蘿蔔吃的是儲藏養分的根。' },
    { q:'果實的主要功能是?', o:['保護與傳播種子','吸水','製造氧氣','固定植物'], a:0, why:'果實包住種子,吸引動物幫忙傳播。' },
    { q:'仙人掌的葉子變成刺,是為了?', o:['減少水分散失','嚇人','漂亮','行光合作用'], a:0, why:'沙漠缺水,刺狀葉子能減少蒸散。' }
  ];
  D.QUIZ.chop = [
    { q:'樹幹橫切面的一圈圈叫什麼?', o:['年輪','樹皮','葉脈','根毛'], a:0, why:'樹每年長一圈,數一數就知道樹幾歲。' },
    { q:'年輪比較寬的那一年,通常代表?', o:['雨水多、長得快','很冷','沒有陽光','樹生病'], a:0, why:'環境好時樹長得快,年輪就寬。' },
    { q:'用斧頭砍樹時,握在斧柄「尾端」比較省力,這是因為?', o:['施力臂變長','斧頭變重','木頭變軟','手變大'], a:0, why:'槓桿原理:施力臂越長越省力。' },
    { q:'木材容易浮在水上,是因為?', o:['密度比水小','很重','很硬','有顏色'], a:0, why:'木材密度小於水,所以會浮。' },
    { q:'下列哪一種材料最適合當支柱?', o:['木材','棉花','紙','葉子'], a:0, why:'木材硬又能承重。' },
    { q:'砍倒的樹要放在通風處曬乾,是為了?', o:['減少水分,比較好燒','讓它變綠','長更多年輪','變重'], a:0, why:'濕木頭水分多,不容易燒著。' },
    { q:'樹皮的功用是?', o:['保護樹木','製造養分','吸水','開花'], a:0, why:'樹皮像皮膚,保護內部組織。' },
    { q:'一棵樹有 8 圈年輪,它大約幾歲?', o:['8 歲','4 歲','16 歲','80 歲'], a:0, why:'一年長一圈。' },
    { q:'用斧頭「劈」木頭,斧刃是哪一種簡單機械?', o:['斜面','滑輪','輪軸','彈簧'], a:0, why:'斧刃是楔子,屬於斜面的應用。' },
    { q:'木材燃燒後留下的灰,是原本的什麼變化?', o:['化學變化','物理變化','沒有變化','融化'], a:0, why:'燃燒產生新物質(灰、二氧化碳),是化學變化。' },
    { q:'樹木長高主要靠哪裡的細胞分裂?', o:['頂端的芽','樹根底部','樹皮外層','葉子'], a:0, why:'莖頂端的分生組織讓樹長高。' },
    { q:'乾燥的木材比濕木材?', o:['更輕','更重','一樣重','更綠'], a:0, why:'水分蒸發後重量減少。' },
    { q:'下列哪一個不是木材的特性?', o:['導電','可燃','能浮水','可加工'], a:0, why:'木材是絕緣體,不導電。' },
    { q:'森林裡的枯木倒下後會慢慢腐爛,是誰在分解?', o:['細菌與真菌','老鷹','太陽','石頭'], a:0, why:'分解者把枯木變回養分回到土壤。' },
    { q:'用槓桿撬石頭,支點應該放在哪裡比較省力?', o:['靠近石頭','靠近手','中間','不放支點'], a:0, why:'支點靠近重物,施力臂比抗力臂長,省力。' }
  ];
  D.QUIZ.fire = [
    { q:'燃燒需要的三個條件是?', o:['可燃物、助燃物、溫度達燃點','水、風、光','木頭、石頭、沙','太陽、月亮、星星'], a:0, why:'缺一項火就燒不起來。' },
    { q:'空氣中幫助燃燒的氣體是?', o:['氧氣','二氧化碳','氮氣','水蒸氣'], a:0, why:'氧氣是助燃物。' },
    { q:'用鍋蓋蓋住著火的油鍋,是移除了哪個條件?', o:['助燃物(空氣)','可燃物','溫度','鍋子'], a:0, why:'隔絕空氣就沒有氧氣。' },
    { q:'澆水滅火,主要是?', o:['降低溫度','增加可燃物','增加氧氣','讓火變大'], a:0, why:'水吸熱,使溫度降到燃點以下。' },
    { q:'紙的燃點比木頭?', o:['低','高','一樣','不能比'], a:0, why:'紙容易點燃,燃點較低。' },
    { q:'搧風可以讓火變旺,因為?', o:['補充氧氣','降溫','移除燃料','增加水分'], a:0, why:'風帶來更多空氣(氧氣)。' },
    { q:'蠟燭放進密閉的玻璃罐裡,不久會?', o:['熄滅','燒更旺','變藍','爆炸'], a:0, why:'罐內氧氣用完,火就熄了。' },
    { q:'酒精燈蓋上燈罩就熄了,原理是?', o:['隔絕空氣','降溫','燈芯壞了','酒精用完'], a:0, why:'蓋子隔絕氧氣。' },
    { q:'下列哪一個「不是」可燃物?', o:['石頭','木頭','紙','乾草'], a:0, why:'石頭不會燃燒。' },
    { q:'燃燒後火焰上方的空氣會?', o:['變熱上升','變冷下沉','不動','變成水'], a:0, why:'熱空氣密度小會上升(對流)。' },
    { q:'摩擦生火是利用摩擦產生?', o:['熱','水','氧氣','木頭'], a:0, why:'摩擦讓溫度升高到燃點。' },
    { q:'在荒島生火時,最容易點著的是?', o:['乾燥細碎的枯草','濕樹枝','大石頭','新鮮綠葉'], a:0, why:'乾細的東西燃點低、接觸空氣多。' },
    { q:'燒開水時,水滾了冒出的白煙是?', o:['小水滴','火','空氣','油'], a:0, why:'水蒸氣遇冷凝結成小水滴。' },
    { q:'金屬湯匙放在火上會燙手,熱的傳播方式是?', o:['傳導','對流','輻射','反射'], a:0, why:'固體靠傳導傳熱。' },
    { q:'離營火一段距離也覺得暖,主要是?', o:['輻射','傳導','對流','摩擦'], a:0, why:'火的熱以輻射方式傳到身上。' }
  ];
  D.QUIZ.build = [
    { q:'屋頂要用什麼材料,雨才不會漏進來?', o:['防水的大葉或獸皮','棉花','紙','沙子'], a:0, why:'防水材料能擋雨。' },
    { q:'支柱要選?', o:['硬的木材','軟的纖維','薄的葉子','細的草'], a:0, why:'支柱要承重,需要硬又直的材料。' },
    { q:'三角形的結構比四邊形?', o:['更穩固','更容易變形','一樣','更軟'], a:0, why:'三角形不易變形,常用在屋頂。' },
    { q:'底面積越大的東西?', o:['越不容易倒','越容易倒','一樣','越輕'], a:0, why:'底面積大、重心低比較穩。' },
    { q:'床墊要選?', o:['柔軟的纖維','堅硬的石頭','冰冷的金屬','尖銳的樹枝'], a:0, why:'柔軟材料躺起來才舒服。' },
    { q:'金屬鍋子比木頭碗更容易燙手,因為金屬?', o:['導熱快','導熱慢','很輕','會浮'], a:0, why:'金屬是熱的良導體。' },
    { q:'想讓帳篷不被風吹走,可以?', o:['用石頭壓住四角','把它放高一點','拿掉支柱','用紙做'], a:0, why:'增加重量、固定底部。' },
    { q:'防水的材料有?', o:['塑膠布','棉布','紙','海綿'], a:0, why:'塑膠不吸水。' },
    { q:'砌石牆時,石頭要?', o:['交錯疊放','直直疊成一排','隨便丟','放在頂端'], a:0, why:'交錯疊放能分散重量,不易倒。' },
    { q:'哪一種材料能浮在水上,適合做浮筒?', o:['寶特瓶(密封)','石頭','鐵塊','磚頭'], a:0, why:'密封的空瓶裡有空氣,密度小會浮。' },
    { q:'房子的地基要?', o:['平穩堅固','鬆軟','高低不平','用葉子鋪'], a:0, why:'地基不穩房子會歪。' },
    { q:'保暖的材料通常?', o:['蓬鬆、裡面有很多空氣','很薄','很硬','會導熱'], a:0, why:'空氣是熱的不良導體,蓬鬆材料保暖。' },
    { q:'繩結要綁牢,纖維要?', o:['夠韌、不易斷','很脆','很短','會融化'], a:0, why:'韌性好的纖維才拉得住。' },
    { q:'用滑輪把重物吊上屋頂,可以?', o:['改變施力方向','讓重物變輕','讓重物消失','增加重量'], a:0, why:'定滑輪改變方向,動滑輪省力。' },
    { q:'房子的窗戶開在向陽面,好處是?', o:['採光與保暖','更冷','更暗','擋風'], a:0, why:'陽光能照亮並溫暖室內。' }
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
  D.DECOS.push({ id:'koi',    n:'鯉魚旗',   e:'🎏', comfort:4, cost:{}, shop:true, d:'風一吹就鼓起來——風是流動的空氣。' });
  D.DECOS.push({ id:'mirror', n:'貝殼鏡',   e:'🪞', comfort:5, cost:{}, shop:true, d:'光遇到平滑的面會反射,所以照得到自己。' });
  D.DECOS.push({ id:'vase',   n:'古代花瓶', e:'🏺', comfort:6, cost:{}, shop:true, d:'黏土燒過變成陶,不怕水也不會爛。' });

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
    { id:'crab', n:'陸蟹教練',   e:'🦀', img:'npc_crab', stat:'dex', skill:'fish',     zone:'rock',   spot:{x:24,y:6},
      hello:[ '喀嚓喀嚓!我是陸蟹教練,老家在墾丁的海岸林。看我這對鉗子——又準又穩,這就是「巧手」。', '巧手不是天生的,是練出來的:眼睛先看準,手再慢慢跟上。', '想學?我出三個問題,答對兩題,你的手就會更聽話。' ],
      lesson:'拖東西的時候,先看清楚要放的格子,再一次到位——手忙腳亂只會放錯。',
      d:'台灣墾丁的陸蟹平常住在海岸林裡,每年夏天滿月夜會集體下海產卵,過馬路時需要人幫忙護送。' },
    { id:'deer', n:'梅花鹿教練', e:'🦌', img:'npc_deer', stat:'mov', skill:'gather',   zone:'grass',  spot:{x:26,y:14},
      hello:[ '嗨,我是梅花鹿教練!我們梅花鹿曾經在台灣消失,後來在墾丁重新野放回來了。草原上沒有誰跑得過我。', '「腳程」靠的是節奏:呼吸、步伐、看路,三件事一起做。', '答對我兩題,你走路就會更輕快。' ],
      lesson:'走遠路要走「直線」和「乾地」——淺水會慢 60%,繞一點路反而快。',
      d:'台灣梅花鹿身上有白色梅花斑;野外族群曾在 1969 年絕跡,靠墾丁的復育計畫才重新回到草原上。' },
    { id:'bear', n:'台灣黑熊師傅',   e:'🐻', img:'npc_bear', stat:'pow', skill:'chop',     zone:'forest', spot:{x:26,y:18},
      hello:[ '吼——別怕,我是台灣黑熊師傅,胸前這個 V 字是我的招牌。這片森林的樹我都認識。', '「力氣」不是硬拉,是用對地方:槓桿、節奏、還有休息。', '答對兩題,我教你怎麼一斧劈得更深。' ],
      lesson:'連點的時候「有節奏」比「拼命點」有效——每一下都用力,手很快就痠了。',
      d:'台灣黑熊胸前有 V 字白毛;牠們會爬樹、會游泳,冬天在樹洞裡休息,靠秋天吃下的脂肪過冬。' },
    { id:'owl',  n:'領角鴞博士', e:'🦉', img:'npc_owl',  stat:'wit', skill:'research', zone:'river',  spot:{x:8,y:4},
      hello:[ '咕——我是領角鴞博士,台灣最常見的貓頭鷹,溪邊這棵樹是我的圖書館。', '「巧思」就是自然課老師說的:先觀察,再推理,最後動手驗證。', '答對兩題,你的腦筋會更靈光。' ],
      lesson:'拼圖卡住時,先從「終點」往回推——路只有一條能通,先排除不可能的。',
      d:'貓頭鷹的頭能轉 270 度,羽毛邊緣像梳子,飛起來幾乎沒聲音;牠是夜行性,靠大眼睛和超靈敏的耳朵找獵物。' }
  ];
  D.trainer = function(id){ var i; for(i=0;i<D.TRAINERS.length;i++){ if(D.TRAINERS[i].id===id) return D.TRAINERS[i]; } return null; };
  D.TRAIN_NEED = 2;   /* 3 題答對 ≥2 才算學會 */
  D.QUIZ = D.QUIZ || {};
  D.QUIZ.train_dex = [
    { q:'用鑷子夾小東西時,為什麼要看著尖端?', o:['眼睛看準,手才知道要往哪動','鑷子會自己找','看手腕比較準','不用看'], a:0, why:'手眼協調:眼睛給位置,手照著做。' },
    { q:'螃蟹夾東西用的「鉗子」是什麼構造?', o:['像鑷子一樣的槓桿','像吸盤','像網子','像鉤子'], a:0, why:'鉗子是一種槓桿,支點在關節,省力又精準。' },
    { q:'把石頭疊高不倒,最重要的是?', o:['重心放在下面的石頭上方','石頭要圓','疊越快越穩','用小石頭墊上面'], a:0, why:'重心落在支撐面內,東西就不會倒。' },
    { q:'穿針引線時線一直穿不過,該怎麼辦?', o:['把線頭捻尖、對準針孔慢慢穿','用力戳','閉一隻眼','換更粗的線'], a:0, why:'細小的動作要「慢而準」,力氣大沒有用。' },
    { q:'手的哪個部位讓我們能抓握東西?', o:['能和其他手指相對的大拇指','手掌的紋路','指甲','手腕的骨頭'], a:0, why:'大拇指能「對掌」,所以人類能拿工具。' }
  ];
  D.QUIZ.train_mov = [
    { q:'跑步時為什麼要配合呼吸?', o:['肌肉需要氧氣才有力氣','呼吸能讓腳變長','不呼吸跑比較快','和跑步沒關係'], a:0, why:'肌肉活動要用氧氣,呼吸跟不上就會喘、沒力。' },
    { q:'鹿的蹄分成兩瓣,有什麼好處?', o:['抓地力強,跑在草地和坡上不打滑','比較好看','可以游泳','能抓東西'], a:0, why:'兩瓣蹄能張開,增加接觸面、不易滑。' },
    { q:'走在淺水裡為什麼比走在沙地慢?', o:['水的阻力比空氣大','水太冷','水裡有魚','沙地有彈性'], a:0, why:'液體的阻力大,腳要花更多力氣推開水。' },
    { q:'長跑選手跑到一半覺得累,最好的做法是?', o:['放慢速度、調整呼吸再繼續','立刻坐下','閉氣衝刺','喝很多水再跑'], a:0, why:'調整節奏讓身體恢復,才能跑得更遠。' },
    { q:'動物的「骨骼」和「肌肉」誰負責讓身體動?', o:['肌肉收縮拉動骨頭','骨頭自己會動','皮膚','血液'], a:0, why:'肌肉收縮拉動骨頭,關節當作轉軸。' }
  ];
  D.QUIZ.train_pow = [
    { q:'砍樹時斧頭要從哪個角度砍最有效?', o:['斜著砍,讓刀刃切進木紋','正對著垂直砍','隨便砍','只砍樹皮'], a:0, why:'斜切能順著木頭纖維劈開,比直砍省力。' },
    { q:'用長棍撬大石頭,支點放哪裡最省力?', o:['靠近石頭那邊','靠近手那邊','正中間','不用支點'], a:0, why:'槓桿:支點離重物越近、離施力越遠,越省力。' },
    { q:'搬重物時正確的姿勢是?', o:['蹲下、背打直、用腿的力量站起來','彎腰用背拉','單手拿','用力甩上去'], a:0, why:'腿的肌肉最有力,背打直才不會受傷。' },
    { q:'黑熊胸前的白色 V 字有什麼用?', o:['是台灣黑熊的特徵,方便辨認','會發光','保暖','裝飾用'], a:0, why:'台灣黑熊的胸前 V 字是牠的身分證。' },
    { q:'連續用力敲東西,為什麼手會痠?', o:['肌肉一直收縮沒休息,累積疲勞','骨頭變短','血變少','手變重'], a:0, why:'肌肉需要休息恢復,有節奏地出力才持久。' }
  ];
  D.QUIZ.train_wit = [
    { q:'貓頭鷹飛起來幾乎沒聲音,是因為?', o:['羽毛邊緣像梳子,能打散氣流','飛得很慢','翅膀很小','晚上比較安靜'], a:0, why:'特殊的羽毛結構減少空氣的擾動,所以安靜。' },
    { q:'自然課的「科學方法」第一步是?', o:['觀察','直接猜答案','先做實驗','問別人'], a:0, why:'先觀察現象,才能提出問題和假設。' },
    { q:'走迷宮時卡住了,聰明的做法是?', o:['從終點往回找,排除死路','閉眼睛亂走','原地等','每條路都走一遍'], a:0, why:'逆推與排除法能大幅減少要試的路線。' },
    { q:'貓頭鷹的眼睛長在正前方,有什麼好處?', o:['能判斷距離(立體視覺)','看得比較遠','晚上會發光','能看到後面'], a:0, why:'兩眼視野重疊才能判斷遠近,適合抓獵物。' },
    { q:'做完實驗結果和猜的不一樣,應該?', o:['誠實記錄,想想為什麼','改掉數據','不記錄','再猜一次'], a:0, why:'錯的假設也是發現,科學就是這樣進步的。' }
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

  /* ── 結算文案 ── */
  D.STAR_TEXT = { 1:'還可以', 2:'不錯喔', 3:'完美!' };

  return D;
})();
