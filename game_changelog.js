// ════════════════════════════════════════════════════════════════════════
//  game_changelog.js  —  LXPSGAME 更新日誌
//  最後更新:2026-06-15  / 目前主程式版本:v3.15.16(地府酋長天賦改%疊層+刀山火海全體分攤;14個全體傷害爆發統一改基礎×4全體分攤,杏花妖/黑暗球BOSS不改)
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
  // ════════════════════════════════════════════════════════════════════
  // v3.15.59(2026-06-20)— 🌋 新英雄登場:熔岩巨人(5 年 1 班姜同學設計)
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.59',
    date: '2026-06-20',
    brief: [
      '🌋【新英雄登場:熔岩巨人】',
      '   ・由 <b>5 年 1 班 姜同學</b>設計的全新英雄「<b>熔岩巨人</b>」加入稀有召喚池!他是沉睡火山的化身,雖然不太會說話,卻愛好和平、樂於助人,能操控整座火山的力量焚燒敵人。',
      '   ・<b>火山般的熾熱軀體</b>讓他幾乎不怕火,還會反過來灼傷膽敢徒手攻擊他的對手;「<b>熔岩巨砲</b>」必中轟擊、「<b>烈焰力場</b>」化作火焰護盾反傷,大絕「<b>火山之怒</b>」更是岩漿傾瀉、焚盡全場!',
      '   ・快到<b>召喚星空</b>碰碰運氣,把這位溫柔又強大的火山巨人收入隊伍吧!',
    ],
    items: [
      '★ v3.15.59【新英雄 熔岩巨人 — 學生設計(5 年 1 班 姜亦晟)hero_db.js 12 表 + index.html 邏輯層】定位:火/地雙屬性 SSR,⚔傷害+🛡控場。配點 HP68/攻5/特技24/速3(和=100;HERO_DB hp 欄位=配點×1.3=88)。',
      '★ v3.15.59【天賦 高溫軀體】受到火屬性傷害減免 50%(每升 1 級 +10%,Lv5=90%);被對手「普通攻擊」時使攻擊者陷入燃燒 2 回合(固定,不隨等級)。火減傷 hook 置於 doDmg rawDmg 階段(只用 rawDmg/target/opts,鐵律1.110);反擊燃燒置於 execAtk 普攻 post-process(判定 target===熔岩巨人 → 對攻擊者 actor 加 hellfire)。',
      '★ v3.15.59【S1 熔岩巨砲 c7】特技 300%(每升 1 級 +5%)對隨機對手造成火/地隨機屬性傷害、連攻 2 次、必中(ignoreEvasion/noGuard/noHidden)。SKILL_RANDOM_ELEMENTS 登錄火/地隨機。execSkill + aiUseSkill 雙實作(鐵律1.128)。',
      '★ v3.15.59【S2 烈焰力場 c5】獲得護盾=自身最大 HP×50%(每升 1 級 +5%)+ 我方場上火屬性(element 為 fire)角色數×5;護盾被消耗時將吸收量化為火屬性反彈攻擊者(反彈 hook 置於 doDmg 護盾吸傷處,旗標 _lavaFieldReflect,防遞迴 _isLavaReflect+noReflect)。',
      '★ v3.15.59【爆發 火山之怒】特技 250%(每升 1 級 +10% 乘算 _burstMult)× 3 次隨機火屬性,必中且無視有利狀態(mustHit/ignoreEvasion/ignoreBuffs);命中者陷入強力燃燒(行動前後各-10HP)+強力禁療,各 2 回合(Lv5/MAX +1=3 回合)。仿神槍手火焰神槍結構,burstName dispatch 自呼 _burstFinish。動畫=神木復仇之火.gif(與山靈古魔共用),音效=地震 sfx-earthquake + 爆炸 sfx-explode。',
      '★ v3.15.59【資料層】SUMMON_RARE_HEROES 加入(觸發 v3.15.43 auto-sync IIFE 推入 ADMIN_ALL_HEROES + _PLAYER_HERO_NAMES);STUDENT_DESIGNER_HEROES 加入 lsps110167(姜同學,自動納入 _STUDENT_DESIGNED_HERO_SET → 圖鑑標「🎨 學生設計英雄」+ 設計師補發工具可發);另登錄 SKILL_FORCE_ELEMENT(火山之怒=fire)。',
      '★ v3.15.59【鐵律遵循】1.31(三技/爆發皆非秒殺,走 doDmg → 世界 BOSS 5000cap 自動保護)、1.110(火減傷 hook 時序)、1.128(execSkill+aiUseSkill 雙實作)、1.139(_runBurst 乘 _burstMult)、1.160(fd 只寫 Lv1 基底,升級數字進 _TRAIT_LV_INFO/SKILL_UPGRADE_DEF/BURST_UPGRADE_DEF)、1.98(新英雄 checklist)。',
      '★ v3.15.59【版本鏈】4 GAME 同步點 v3.15.58→v3.15.59;_vers[index.html]/[game_changelog.js] 同步 v3.15.59 + _vers[hero_db.js] v3.15.44→v3.15.59。admin_panel.js 維持 v3.15.58、arena.js v3.15.54、world-boss.js v3.15.51、world-boss-ui.html v3.15.50。本輪改 hero_db.js + index.html + game_changelog.js 三檔。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.39)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.58(2026-06-20)— 💰 GM 洗錢查緝工具 + 單件賣出帳本補全
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.58',
    date: '2026-06-20',
    brief: [
      '🔧【後台管理工具更新(一般同學無須理會)】',
      '   ・老師後台新增帳號安全稽核工具,並完善了商店賣出的紀錄。對正常遊玩沒有任何影響。',
    ],
    items: [
      '★ v3.15.58【GM 洗錢查緝 admin_panel.js + index.html】承接 v3.15.57(修掉「賣出物品重整後復活、可重複賣」洗錢漏洞)→ 新增事後查緝工具。後端 index.html:window._fbAdminScanMoneyLaundering(windowSec,minRepeat) 用 getDocs 掃全 players,讀 _coinTransactions 篩「賣出類」(reason 含「賣出」且 amount>0),依金額分桶、桶內按時間排序,相鄰間隔 ≤windowSec 的連續同額簇若 ≥minRepeat 即判一組洗錢,贓款=(簇次數-1)×金額(保留 1 次合法),回傳嫌疑玩家(估算贓款/當前餘額/逐組明細,按贓款降序)。預設 windowSec=60、minRepeat=3。',
      '★ v3.15.58【回收 index.html】window._fbAdminRecoverLaunderedCoins(uid,amount,note):複用 _fbCompensatePlayer 的 coinsMode add 負值扣減(_newCoins=Math.max(0,current-amount)),主檔 + live + safe 三槽同寫(防跨槽合併把高餘額復活),不誤發補償彈窗給玩家。',
      '★ v3.15.58【GM UI admin_panel.js】新增「💰 洗錢查緝」卡(🧹 帳號汙染處理群組):設視窗秒數 / 同額門檻次數 → 🔍 開始查緝 → 列嫌疑玩家(餘額 / 估算贓款 / 逐組明細),每人可填金額(預設=估算贓款)一鍵「💸 回收」。三點同步(SIDEBAR_ITEMS+SIDEBAR_GROUPS+卡片 HTML+_initLaunderingSection);全程無 optional chaining。',
      '★ v3.15.58【賣出帳本補全 index.html】shopSellItem(單件賣出)原本未記知識幣帳本(只有一鍵賣出 shopSellAllItems 有 _logCoinTx)→ 補上 _logCoinTx(coins,"收入:賣出-道具名"),否則查緝抓不到「單件反覆賣出」的痕跡。',
      '★ v3.15.58【限制】帳本跨槽 union 僅保留最近 400 筆,極早期洗錢可能已滾出;偵測為估算、供 GM 人工裁量回收。漏洞本身已於 v3.15.57 修復,不會再產生新贓款。Firestore 規則無需新增(掃描/回收均走 isAdmin 既有路徑)。',
      '★ v3.15.58【版本鏈】4 GAME 同步點 v3.15.57→v3.15.58;_vers[index.html]/[game_changelog.js] 同步 v3.15.58 + _vers[admin_panel.js] v3.15.54→v3.15.58 + ADMIN_PANEL_VERSION v3.15.49→v3.15.58。arena.js 維持 v3.15.54、world-boss.js v3.15.51、world-boss-ui.html v3.15.50、hero_db.js v3.15.44。本輪改 index.html + admin_panel.js + game_changelog.js 三檔。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.38)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.57(2026-06-20)— 🛒 商店賣出嚴重漏洞修復(賣出物品重整後重複出現)
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.57',
    date: '2026-06-20',
    brief: [
      '🛒【商店賣出穩定性修正(重要更新)】',
      '   ・修正了少數情況下,在商店賣出物品後重新整理,背包顯示與雲端存檔<b>不同步</b>的問題。',
      '   ・現在賣出的物品會<b>正確且穩定地保存</b>,不會再因重新整理而異常重現。感謝同學的回報!',
    ],
    items: [
      '★ v3.15.57【賣出漏洞根治 index.html _lxpsMergeSlots】現象:玩家 87 萬 → 賣垃圾得 7 萬 = 94 萬(垃圾消失),重新整理後知識幣仍 94 萬(正確),但剛賣掉的垃圾又出現可再賣 → 可無限變現。根因:backpackRemove 對數量歸 0 的道具 delete key;賣出走 _fbSaveLive/_fbSave 的 set(...,{merge:true}),Firestore 對 map(物件)欄位是「深度合併」→ 新資料未提及的子鍵(賣掉的道具)不會被刪除 → 雲端 map 欄位 playerBackpack 殘留舊道具(復活),而純量字串 playerBackpack_s 被整包覆蓋(正確)→ 知識幣(純量)正確、背包(map)子鍵復活,正是「94 萬保留、垃圾復活」的不對稱現象。',
      '★ v3.15.57【漏網與修法】_applySafeData 早有同款「優先字串繞道」(註解明寫 Firebase merge 不會刪 key 的繞道),但「多槽合併」_lxpsMergeSlots 漏修 → 有 live+safe+主檔三槽的玩家走合併路徑而中招。修:_lxpsMergeSlots 的 _bag 改為優先解析 _newest.playerBackpack_s(賣後正確、免疫 merge 污染),map 欄位僅在無字串時 fallback。單槽載入走 _applySafeData(本就優先字串)未受影響。',
      '★ v3.15.57【影響面】新賣出 → 字串無垃圾 → 存檔(賣出函式賣完即 await gameCloudSave)→ 重整載入字串 → 不復活,漏洞徹底堵死。已中招玩家現有殘留垃圾賣掉一次變現後字串收斂、不再復活。雲端 map 欄位的歷史殘留無人讀取(載入一律用字串)、無害,列為次要後續(GM 後台讀 map 的背包種類摘要鍵數可能偏多,不影響玩家)。',
      '★ v3.15.57【鐵律 1.213】消費型(會減量)map 欄位嚴禁僅靠 set(merge:true) 寫入後直接讀 map:Firestore map 深度合併不刪子鍵 → 減量(賣出/消耗)會殘留復活。一律「寫純量字串整包版 + 讀取優先字串版」(playerBackpack/playerBackpack_s 模式);純量欄位(knowledgeCoins 等)不受影響。新增同類消費型 map 欄位時務必同步字串版,並在所有讀取點(含 _lxpsMergeSlots、_applySafeData)優先字串。',
      '★ v3.15.57【版本鏈】4 GAME 同步點 v3.15.56→v3.15.57;_vers[index.html]/[game_changelog.js] 同步 v3.15.57。arena.js / admin_panel.js 維持 v3.15.54、world-boss.js v3.15.51、world-boss-ui.html v3.15.50、hero_db.js v3.15.44。本輪只改 index.html + game_changelog.js。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.37)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.56(2026-06-19)— 🎟 鬥技商店召喚卷改發「卷道具」(到召喚星空使用)
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.56',
    date: '2026-06-19',
    brief: [
      '🎟【鬥技商店「召喚卷」改成真正的卷了！】',
      '   ・以前在鬥技場用鬥技之證換 SSR / SR / 至寶召喚卷,是「當場直接給你角色或至寶」;現在改成<b>發一張「召喚卷」到你的背包</b>,由你自己到<b>召喚星空</b>使用。',
      '   ・這樣你可以<b>自己決定什麼時候用</b>;而且若該稀有度暫時收齊了,召喚卷也能<b>先留著以後再用</b>,不會浪費。',
      '💠【鬥技場至寶券升級為「自選券」!】',
      '   ・鬥技商店的至寶召喚卷改成<b>自選至寶召喚卷</b>,使用時可從<b>台灣 10 件 + 龍王 8 件</b>尚未擁有的至寶中<b>自己挑一件</b>,<b>挑得到龍王至寶</b>!',
      '   ・(提醒:隨機至寶召喚卷與星空召喚仍只有台灣至寶,龍王至寶要靠龍王戰排名、老師自選卷,或鬥技場的自選至寶召喚卷取得。)',
    ],
    items: [
      '★ v3.15.56【鬥技商店召喚卷改發卷道具 index.html _arenaGrantExchangeItem】arena_x_ssr_summon / arena_x_sr_summon / arena_x_treasure_summon 三件,由「當場 advSaveUnlockedHero 自動解鎖角色 / _arenaGrantTreasureVoucher 當場發至寶」改為 backpackAdd 對應卷道具(summon_ticket_ssr / summon_ticket_sr / summon_ticket_treasure_pick),玩家到召喚星空自行使用(老師裁示:召喚卷一律是卷、不直接解鎖)。_arenaGrantSummonVoucher / _arenaGrantTreasureVoucher 改為未使用(保留不刪)。',
      '★ v3.15.56【至寶券改自選券 + 自選池納龍王 index.html】鬥技商店至寶券改發 summon_ticket_treasure_pick(自選);新增 _treasureTicketPickNotOwned(台灣 10 + 龍王 8 = 18,引用 _ARENA_DRAGON_TREASURE_IDS),_openTreasureTicketPickModal 改用此池→可挑龍王。隨機券 _useTreasureTicket 仍用 _treasureTicketNotOwned(台灣 10、不含龍王);星空召喚 random 不變(龍王 noSummon,v3.15.52 結論不動)。鬥技券卡改名「自選至寶召喚卷」+icon💠,_openTreasureTicketModal 兩卡「尚有 N 件」計數分流(隨機=台灣/自選=含龍王),summon_ticket_treasure_pick 背包說明補龍王。',
      '★ v3.15.56【背景】玩家回報「用鬥技之證買 SSR 召喚卷卻沒拿到卷」:原實作是當場直接解鎖一名隨機未收錄 SSR(該玩家確實有解鎖到角色,並非遺失),但與「召喚卷 = 可收進背包、自行使用的道具」設計不符 → 本版全面改為發卷道具。',
      '★ v3.15.56【版本鏈】4 GAME 同步點 v3.15.55→v3.15.56;_vers[index.html]/[game_changelog.js] 同步 v3.15.56。arena.js / admin_panel.js 維持 v3.15.54、world-boss.js v3.15.51、world-boss-ui.html v3.15.50、hero_db.js v3.15.44。本輪只改 index.html + game_changelog.js。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.36)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.55(2026-06-19)— 🏜 埃及關完整掉落物 + 魔物圖鑑「埃及探險」區
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.55',
    date: '2026-06-19',
    brief: [
      '🏜【埃及關沙漠小怪掉落物上線!】',
      '   ・6 隻沙漠小怪(木乃伊貓、流沙眼鏡蛇、卡諾卜壇怪、神秘圖騰、沙漠毒蠍、仙人掌怪)現在會掉落專屬賣錢物品,可前往超商賣出換知識幣。',
      '   ・沙漠小怪掉落率提升到 <b>60%</b>,而且練功用的經驗書全程都是<b>精裝版</b>!',
      '👑【埃及雙王掉落稀世珍寶!】',
      '   ・打倒法老王有機會掉落 <b>黃金法老面具(可賣 60,000 知識幣)</b>;打倒埃及豔后有機會掉落 <b>尼羅河女王之珠(可賣 55,000 知識幣)</b>!',
      '   ・埃及雙王的<b>超越極限果實掉落率大幅提升到 25%</b>,快去挑戰金字塔王座!',
      '👹【魔物圖鑑新增「🏜 埃及探險」專區!】',
      '   ・現在可在魔物圖鑑查看埃及關的<b>雙王 BOSS(完整 BOSS 能力)</b>、6 隻路邊小怪與稀有的<b>聖甲蟲</b>,每隻都有完整的背景介紹與掉落資訊。',
    ],
    items: [
      '★ v3.15.55【埃及 6 沙漠小怪賣錢掉落物 index.html】新增 BACKPACK_ITEM_DEF + SHOP_SELL_ITEMS 6 物(eg_mummy_cloth 24/eg_cobra_fang 27/eg_canopic_shard 28/eg_totem_fragment 25/eg_scorpion_sting 26/eg_cactus_needle 22;賣值較日本路邊怪 18~23 約 +20%)。新增 EGYPT_MINI_DROP_MAP(6 mob→item)+ 結算 if-else 新增埃及小怪分支:掉落率 0.60(=日本路邊 0.50 +20%)× 難度/祝福倍率。原本 6 mob 落入 else 用 _MINI_DROP_MAP 查無→不掉落,現補齊。',
      '★ v3.15.55【埃及小怪經驗書精裝化 index.html】場景結算 25% 經驗書:_adventureStage===egypt 改發 hero_exp_book_deluxe(📕 精裝版),其餘關卡維持 hero_exp_book(📗 一般版),對齊魔物圖鑑顯示。',
      '★ v3.15.55【埃及雙王賣錢物品 index.html】新增 eg_pharaoh_mask(黃金法老面具 60000)/eg_cleopatra_pearl(尼羅河女王之珠 55000)至 BACKPACK_ITEM_DEF + SHOP_SELL_ITEMS。埃及雙王結算區(_adventureStage===egypt)新增 _EGYPT_BOSS_DROPS,_egKings 各自獨立 20% × 祝福(上限 95%)掉落,不限評價(比照日本 BOSS 掉落模式)。',
      '★ v3.15.55【埃及關爆發果實基礎掉落率 25% index.html】主 BOSS 超越極限果實掉落:_adventureStage===egypt 時 _fruitDropRate 由 BOSS基礎EXP×0.1% 改為固定 0.25(其餘關卡維持原公式)。',
      '★ v3.15.55【魔物圖鑑埃及探險區 index.html _buildMonsterPage】原 EG_BOSS_LIST/EG_MOB_LIST/EG_RARE_LIST(v3.15.17 已定義且在 _monsterDetailList 翻頁清單內)從未在 el.innerHTML render。現補上「🏜 埃及探險」區:makeSection 雙王 BOSS(boss)+ 路邊小怪(mob)+ 稀有小怪(rare),置於台灣環島與世界 BOSS 之間。makeCard 讀 HERO_DB 原始數值 → 雙王顯示 BOSS 能力版(HP 11500/10500);英雄圖鑑仍走 EGYPT_BOSS_HERO_STATS 弱化招募版,兩者並存。',
      '★ v3.15.55【埃及 9 怪 MONSTER_LORE 完整介紹 index.html】補 9 筆魔物背景介紹(法老王/埃及豔后/木乃伊貓/流沙眼鏡蛇/卡諾卜壇怪/神秘圖騰/沙漠毒蠍/仙人掌怪/聖甲蟲),文案結合古埃及神話與其實際 BOSS/小怪戰技能行為。openMonsterDetail 之 stats/技能(b.s1/s2/burst)/天賦(HERO_TRAIT)皆資料驅動本已具備,僅缺 lore,現補齊。',
      '★ v3.15.55【埃及掉落資訊 MONSTER_DROPS index.html】6 小怪顯示 50%→60% + 標註賣值;新增法老王(黃金法老面具 20% / 超越極限果實 25%)、埃及豔后(尼羅河女王之珠 20% / 超越極限果實 25%)掉落顯示(於英雄圖鑑詳情頁及魔物圖鑑詳情頁顯示)。',
      '★ v3.15.55【版本鏈】4 GAME 同步點 v3.15.54→v3.15.55;_vers[index.html]/[game_changelog.js] 同步 v3.15.55。arena.js/admin_panel.js 維持 v3.15.54(本輪未動)、world-boss.js v3.15.51、hero_db.js v3.15.44。本輪只改 index.html + game_changelog.js。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.35)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.54(2026-06-19)— ⚔ 鬥技場大調整:碎片門檻減半 + 商店調價 + 至寶卷含龍王
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.54',
    date: '2026-06-19',
    brief: [
      '🔨【靈魂碎片合成自選召喚卷:需求減半!】',
      '   ・<b>SSR 靈魂碎片</b>:集滿張數由 40 個降為 <b>20 個</b>即可在召喚星空合成 🌟 SSR 自選召喚卷。',
      '   ・<b>SR 靈魂碎片</b>:集滿張數由 20 個降為 <b>10 個</b>即可合成 ✨ SR 自選召喚卷。',
      '⚔【鬥技場兌換商店:價格調整】',
      '   ・SSR 英雄召喚卷:40 → <b>30</b> 鬥技之證;SR 英雄召喚卷:20 → <b>15</b>。',
      '   ・至寶召喚卷:50 → <b>40</b>;至寶經驗卷軸:10 → <b>5</b>;召喚水晶:5 → <b>3</b>;知識幣 1 萬維持 5。',
      '💎【至寶召喚卷升級:現在抽得到龍王至寶了!】',
      '   ・鬥技場「至寶召喚卷」的隨機池由 10 件台灣至寶<b>擴充為 18 件(台灣 10 + 龍王 8)</b>,有機會抽到炎/森/地/雷/海/暗/光/幻龍王的至寶!',
      '   ・(提醒:星空召喚池仍然只有台灣至寶,龍王至寶只能靠龍王戰排名、老師自選卷、或鬥技場至寶召喚卷取得。)',
    ],
    items: [
      '★ v3.15.54【靈魂碎片合成門檻減半 index.html】_SOUL_SHARD_DEF.ssr.need 40→20、sr.need 20→10(合成/換券函式皆讀 need,改常數即生效);同步更新 _buildSummonPage 合成卡 fallback 預設(40→20、20→10)、SSR 自選介紹、soul_shard_ssr/sr 背包說明、3 處貓空 SR 碎片 toast、好友送禮 SSR/SR 碎片說明,全部文案 40→20 / 20→10。',
      '★ v3.15.54【鬥技商店調價 index.html ARENA_EXCHANGE_ITEMS】arena_x_ssr_summon 40→30、arena_x_sr_summon 20→15、arena_x_treasure_summon 50→40、arena_x_treasure_exp 10→5、arena_x_summon_crystal 5→3;arena_x_coins_10k 維持 5。同步更新註解清單與至寶卷 desc(註明台灣 10 + 龍王 8)。',
      '★ v3.15.54【鬥技場至寶卷含龍王 index.html _arenaGrantTreasureVoucher】新增 _ARENA_DRAGON_TREASURE_IDS(8 隻龍王至寶 id),發券時把存在於 TAIWAN_TREASURES 的龍王至寶 push 進 SUMMON_RANDOM_TREASURES.slice() 合併池(去重),再依「未擁有優先」抽 1 件。⚠ 只改鬥技場至寶卷,星空召喚仍走原 SUMMON_RANDOM_TREASURES(龍王 noSummon 不變,v3.15.52 結論不動)。龍王至寶與台灣至寶同存 TAIWAN_TREASURES,_grantTaiwanTreasure/_taiwanTreasureData 通用。同步在至寶圖鑑龍王分支 _howToGet 加註「鬥技場至寶召喚卷(40 證,台灣+龍王 18 件)」管道。',
      '★ v3.15.54【GM 傷害明細(adminOnly)admin_panel.js + arena.js + index.html】老師需求:鬥技場戰鬥記錄審核可查「逐回合×逐英雄×技能」傷害。① index.html doDmg 既有鬥技場總傷 hook(!_adventureMode)同處旁路收集 G._arenaDmgSources(只記 p1 攻擊者,技能名 opts.skillName→_curSkillName→特技/普攻,amount=原始計算傷害含溢殺) ② arena.js _arenaSubmitBattleLog 結算後聚合 round→hero→skill,旁路寫 arenaDamageDetail/{uid_ts}(docId 對齊 arenaBattles;失敗靜默) ③ admin_panel.js 每筆戰鬥列加「🔍 傷害明細」展開鈕,getDoc 讀該場明細,單回合單英雄>5000 標紅。',
      '★ v3.15.54【⚠ Firestore 規則 — 需手動部署】新增 arenaDamageDetail/{docId} 規則(get/list 限 GM、create 限本人+docId 開頭 uid_+hasOnly 5 欄+型別/時間檢查、update:false、delete 限 GM),比照 arenaBattles 安全模型。未部署時明細寫入會被預設拒絕(僅明細缺,戰鬥記錄與其他功能照常,不會壞)。',
      '★ v3.15.54【GM 面板舊註更正 admin_panel.js】更正「刪除鬥技記錄會扣排行榜鬥技之證」的過時說明:v3.15.49 起排行榜改讀 stats/global.arenaWeekly(不再從 arenaBattles 聚合),且持有量在 players/{uid}.arenaZhengHeld → 刪除記錄不會扣到玩家鬥技之證。同步改面板說明文字與刪除+補償確認框文案。',
      '★ v3.15.54【版本鏈】4 GAME 同步點 v3.15.53→v3.15.54;_vers[index.html]/[game_changelog.js]/[arena.js]/[admin_panel.js] 同步 v3.15.54。world-boss.js 維持 v3.15.51、world-boss-ui.html v3.15.50、hero_db.js v3.15.44。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.34)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.53(2026-06-19)— 🛠 素質點數BUG修復 + 圖鑑改版 + 英雄來源標註
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.53',
    date: '2026-06-19',
    brief: [
      '🛠【嚴重BUG修復:素質點數會越長越多】',
      '   ・部分英雄(維京海盜船長、武器精靈、火柴人等)每次重新進遊戲都會多出 1 點可分配素質點,累積後超過該等級應有的點數。已徹底修復。',
      '   ・新機制會在每次載入自動「對帳」:把每位英雄的素質點(已配 + 未配)校正回「等級 − 1」的正確總額,多的收回、少的補回,並自動修復<b>所有</b>受影響的英雄。',
      '📖【魔物圖鑑大改版】',
      '   ・魔物圖鑑改成跟英雄圖鑑一樣的緊湊卡片版面:方形立繪、左上角分類標籤、版面填滿整列不再有右邊大片空白。',
      '   ・魔物名稱字體縮小並可自動換行,長名字(如殺生石分身)完整顯示不再被切斷;魔物的詳細介紹點進卡片就看得到。',
      '🎨【英雄圖鑑名稱與來源標註】',
      '   ・英雄圖鑑卡片名稱字體縮小、可換行,長名字(藝天使・克雷爾、魔劍姬・伊莉雅等)完整呈現不再出現「…」。',
      '   ・新增來源標籤:同學設計的 SSR 英雄標示 <b>🎨 學生設計英雄</b>、來自異世界的官方 SR 英雄標示 <b>🌌 異世界英雄</b>。',
    ],
    items: [
      '★ v3.15.53【嚴重BUG:素質點數每重開+1 修復 index.html】症狀:維京海盜船長/武器精靈/火柴人等每次載入 free 素質點 +1、超過 lv-1。根因:雲端三槽合併 _lxpsMergeSlots「六大養成表」對 heroStatInvested 逐子鍵 max、heroStatPoints 逐鍵 max;玩家用重置之書重配點後各槽分配分歧 → 逐子鍵 max 雙計 invested → 總點數 > lv-1;而舊自癒只「少補」(shouldAdd>0 才加)、溢出不回收 → 每重開累積。修法:_applySafeData 與 _buildHeroGrid 兩處自癒一律改「多退少補」雙向冪等:expected=max(0, lv-1),investedTotal 超出先回收(spd→sp→atk→hp),再 free=max(0, expected-investedTotal)。每次載入強制 free+invested 等於 lv-1,冪等不再長,並自動修復所有受影響英雄。未動合併本體(風險),自癒在合併後執行可中和其溢出。',
      '★ v3.15.53【魔物圖鑑改版 index.html _buildMonsterPage】makeCard 重寫為仿英雄圖鑑緊湊卡:移除固定 width:300px 改 grid 控寬;立繪 height:260px 改 aspect-ratio:1/1 方形;分類標籤(終極BOSS/精英/稀有/路邊)改左上 absolute overlay 徽章(font 14px);名稱 54px 改 clamp(20-30)+word-break 換行完整;簡介(lore)移除 inline(openMonsterDetail 詳情頁本就完整顯示);補上先前漏的「💜 稀有小怪」標籤。makeSection 由 flex-wrap 改 grid repeat(auto-fill, minmax(210px,1fr)) → 卡片填滿整列、右邊不再大片留白;區塊標題 32px 改 28px。',
      '★ v3.15.53【英雄圖鑑名稱字體 index.html _buildHeroGrid】卡片名稱 font 54px + white-space:nowrap + ellipsis(會截斷)改為 clamp(22-34px) + line-height:1.15 + word-break:break-word,長名完整呈現不再「…」。',
      '★ v3.15.53【英雄來源標註 index.html】新增 window._STUDENT_DESIGNED_HERO_SET(由 STUDENT_DESIGNER_HEROES 全部 .hero 自動建集合,日後新增設計者英雄自動涵蓋)。圖鑑 grid 卡與詳情頁同步加判定:_STUDENT_DESIGNED_HERO_SET 含此英雄 且 稀有度為 SSR → 🎨 學生設計英雄(綠);稀有度為 SR 且 非學生設計 且 非日本限定 且 非活動限定 → 🌌 異世界英雄(紫)。與既有 🗾日本關卡 / 🏆成績特優(UR)/ 🏫初始校園(R)/ 🎪活動 標籤互斥不重疊。',
      '★ v3.15.53【版本鏈】4 GAME 同步點 v3.15.52→v3.15.53,_vers[index.html] 與 [game_changelog.js] 同步 v3.15.53;world-boss.js 維持 v3.15.51、world-boss-ui.html v3.15.50、admin_panel.js/arena.js v3.15.49、hero_db.js v3.15.44。本輪只改 index.html + game_changelog.js。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.33)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.52(2026-06-19)— 🐉 龍王至寶「獲得管道」顯示修正
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.52',
    date: '2026-06-19',
    brief: [
      '🐉【龍王至寶的「獲得管道」說明修正】',
      '   ・至寶圖鑑裡 5 條新龍王至寶(雷/海/暗/光/幻)原本誤寫「透過召喚池或特殊關卡獲得」,現已修正為正確途徑。',
      '   ・龍王至寶<b>只能</b>透過兩種方式取得:① <b>世界 BOSS「龍王戰」排名獎勵</b>(機率型,名次越前面機率越高);② 老師發放的 <b>「自選至寶選擇卷」</b>。',
      '   ・<b>星空召喚(召喚池)抽不到龍王至寶</b>——召喚池只會出現 10 件台灣至寶,請放心。',
    ],
    items: [
      '★ v3.15.52【龍王至寶獲得管道顯示修正 index.html】至寶圖鑑未獲得分支 _howToGet:把只認 dragon_fang_fire 的分支改為通用 if(def.isDragonTreasure),統一顯示「世界 BOSS 龍王戰排名獎勵(冠軍必得/第2名75%/第3名50%/第4名25%/其餘5%)+ GM 自選至寶選擇卷 + 明示星空召喚抽不到」。根因:其餘 7 隻龍王至寶 bossId(世界 BOSS id)非 TAIWAN_BOSSES → 掉進「透過召喚池或特殊關卡獲得」fallback。',
      '★ v3.15.52【查證:星空召喚不會抽到龍王至寶(僅文字修正,召喚邏輯不動)】SUMMON_RANDOM_TREASURES(召喚 2% 抽至寶 L95720 / 鬥技場至寶券 _arenaGrantTreasureVoucher / 未擁有補發 共用池)只含 10 件台灣 BOSS 至寶、0 件 dragon_ 龍王至寶,且無任何 push/concat 動態塞入;龍王至寶 8 件皆 noSummon:true 雙保險。確認星空召喚實際抽不到龍王至寶。',
      '★ v3.15.52【版本鏈】4 GAME 同步點 v3.15.51→v3.15.52,_vers[index.html]/[game_changelog.js] 同步 v3.15.52;world-boss.js 維持 v3.15.51、world-boss-ui.html v3.15.50、admin_panel.js/arena.js v3.15.49、hero_db.js v3.15.44。本輪只改 index.html + game_changelog.js。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.32)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.51(2026-06-19)— 🐉 5 條新龍王至寶上線(雷/海/暗/光/幻 完整實裝)
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.51',
    date: '2026-06-19',
    brief: [
      '🐉【5 條新龍王的至寶正式登場!】',
      '   ・打倒世界 BOSS 排名靠前可獲得的龍王至寶,新增 <b>雷龍王之翼、海龍王之爪、暗龍王之骸、光龍王之羽、幻龍王之角</b> 5 件,能力全部開放!',
      '   ・每件至寶都有<b>屬性剋制</b>:受到剋制屬性傷害 -10%(每升 1 級再 +3%)、對該屬性敵人傷害 +10%,再加上各自的<b>專屬免疫</b>與<b>每回合成長</b>固有效果。',
      '⚔️【5 件新至寶能力一覽】',
      '   ・<b>雷龍王之翼</b>:速度+15、受水/對水、免疫麻痺與遲緩、每回合速度 +5%(最高 +30%)。',
      '   ・<b>海龍王之爪</b>:HP+15、受火/對火、免疫反彈傷害與冰凍、每回合最大 HP +5%(最高 +30%)。',
      '   ・<b>暗龍王之骸</b>:特技+15、受光/對光、免疫查封與死亡宣告、每回合傷害 +5%(最高 +30%)。',
      '   ・<b>光龍王之羽</b>:特技+15、受暗/對暗、免疫封印技能與失明、每回合傷害 +5%(最高 +30%)。',
      '   ・<b>幻龍王之角</b>:HP/攻/特各 +5、受普攻/對普攻、免疫魅惑與嘲諷、每回合技能消耗 -1(最多 -5,最低 1)。',
      '🔧【炎龍王之牙 / 森龍王之鬚 屬性更正】',
      '   ・<b>炎龍王之牙</b>改為「受草/對草」+ 免疫燃燒、封印普攻、睡眠;<b>森龍王之鬚</b>改為「受土/對土」+ 免疫減療、禁療、中毒(對齊龍王屬性相剋環)。',
      '📖【魔物圖鑑修正】',
      '   ・5 條新龍王現在正確顯示在<b>魔物圖鑑「世界 BOSS」區</b>(原本誤跑到英雄圖鑑)。',
    ],
    items: [
      '★ v3.15.51【5 新龍王至寶 combat 全實裝 index.html】TAIWAN_TREASURES 5 件 comingSoon 全開放:雷龍王之翼(spd+15/waterDmgReduce+waterDmgBonus/免疫 para+slow/spdRampPerRound)、海龍王之爪(hp+15/fireDmgReduce+fireDmgBonus/免疫反彈+freeze/hpMaxRampPerRound)、暗龍王之骸(sp+15/lightDmgReduce+lightDmgBonus/免疫 nosell+deathmark/atkRampPerRound)、光龍王之羽(sp+15/darkDmgReduce+darkDmgBonus/免疫 seal+forecast/atkRampPerRound)、幻龍王之角(hp/atk/sp+5/normalAtkDmgReduce+normalAtkDmgBonus/免疫 charm+taunt/skillCostReducePerRound)。',
      '★ v3.15.51【受X/對X 18 元素 hook(doDmg FT1-FT18)】新增 9 個元素減免/加成 hook(windDmgReduce/waterDmgReduce/waterDmgBonus/fireDmgBonus/lightDmgReduce/lightDmgBonus/darkDmgReduce/darkDmgBonus/normalAtkDmgReduce);因屬性更正,FT1/FT3/FT6 持有者改名:受火→海龍王之爪、受草→炎龍王之牙、受土→森龍王之鬚,並把舊名 火龍王之牙/草龍王之鬚 一併改為 炎龍王之牙/森龍王之鬚。全程鏡像既有 pattern、dmg 後插入、無 && 短路(鐵律 1.110)。',
      '★ v3.15.51【12 狀態免疫(addStatus 中央攔截)】炎封印普攻(noatk)/睡眠(sleep)、森中毒(poison 含猛毒)、雷麻痺(para)/遲緩(slow+spddown)、海冰凍(freeze)、暗查封(nosell)/死亡宣告(deathmark)、光封印技能(seal)/失明(forecast+blind)、幻魅惑(charm)/嘲諷(taunt+strongTaunt),對齊地龍王之麟慣例,早 return 擋掉。',
      '★ v3.15.51【海龍王之爪免疫反彈(只反彈,不反擊)】新增 doDmg FT18:opts.isReflect 真反彈對持有者歸 0。專標 6 個反彈點(反域 reverseDomain/警長正義制裁/日月潭靈鏡 reflectChance/台灣藍鵲鏡盾/仙人掌針狀葉/武鬥家金鐘罩)isReflect:true;反擊/還手 與「爆發/技能避免還手迴圈」的 isRebound 一律不擋。',
      '★ v3.15.51【3 遞減固有】速度遞減(_effSpd turn-order +5%/回,上限+30%,讀 G.round 不改 spd);技能消耗遞減(skillCost 每回合 -1,最多 -5,最低 1,確定性折扣 UI 同步);HP上限遞減(nextRound G.round++ 後 mutate h.hp +5%/回,上限+30%,補等量當前 HP,_hpRampBase 只記一次)。',
      '★ v3.15.51【顯示層同步】4 旗標集(免疫/遞減旗標不被當 +N% 顯示)+ 3 標籤表(新 % 鍵中文標籤)同步,順手補地龍王 v3.15.17 漏列的 earthDmgReduce/windDmgBonus 標籤。',
      '★ v3.15.51【魔物圖鑑修正】5 新龍王(風暴雷/深淵海/邪骨暗/神聖光/星辰幻)補進 BOSS_NAMES + WORLD_BOSS_LIST + MONSTER_AVTR(原 v3.15.50 加 HERO_DB 時漏加 → 誤列英雄圖鑑當 SR,同 v3.15.17 地龍王事故)。',
      '★ v3.15.51【BOSS 戰天賦對齊 world-boss.js 甲+乙】甲:校對 8 龍王圖鑑天賦文字一致(全內部一致,僅修地龍王註解 -40%→-30%)。乙:山岳地龍王 combat 強力減傷由 -40% 對齊圖鑑文字 -30%(傷害 ×0.60→×0.70)。',
      '★ v3.15.51【版本鏈】4 GAME 同步點 v3.15.50→v3.15.51,_vers[index.html]/[world-boss.js]/[game_changelog.js] 同步 v3.15.51;world-boss-ui.html 維持 v3.15.50、admin_panel.js/arena.js v3.15.49、hero_db.js v3.15.44。本輪改 index.html + world-boss.js + game_changelog.js。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.31)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.50(2026-06-19)— 🐉 世界 BOSS 8 龍王大補完(雷龍王登場 + 素質天賦圖鑑 + 露臉)
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.50',
    date: '2026-06-19',
    brief: [
      '🐉【世界 BOSS 8 條龍王大補完!】',
      '   ・<b>風暴雷龍王(雷龍王)</b>設計完成並登場圖鑑:風屬性,S1 雷霆貫穿(單體+麻痺)、S2 暴風肅清(全體+清除自身不利)、爆發「雷神·萬雷殛世」(全體+全體麻痺+清除自身不利);護盾 風×2/光/火(用地/暗/水破盾)。',
      '   ・新增 <b>深淵海龍王、邪骨暗龍王、神聖光龍王、星辰幻龍王</b> 圖鑑(素質與天賦已公開,招式與爆發設計中,以「? 未知技能」標示)。',
      '   ・所有龍王的<b>素質、共通天賦、專屬天賦</b>全部補進龍王圖鑑頁,點龍王頭像即可查看完整資料。',
      '⚔️【龍王戰看得更清楚】',
      '   ・所有龍王在戰鬥畫面的背景圖<b>往上調整,讓龍王的臉露在畫面中央</b>,看起來更有魄力!',
      '📅【龍王接班規則】',
      '   ・打倒當前龍王後,<b>下一隻龍王會在隔天早上 8:00 自動開放</b>(滿血迎戰),以後每隻龍王都這樣輪替。',
    ],
    items: [
      '★ v3.15.50【8 龍王素質修正 world-boss.js HERO_DB】火山炎龍王 atk49→50;翠綠森龍王 49/50/15→45/58/12;山岳地龍王 49/50/15→60/50/5;新增 風暴雷龍王(40/45/30,風)、深淵海龍王(47/50/18,水)、邪骨暗龍王(45/55/15,暗)、神聖光龍王(45/55/15,光)、星辰幻龍王(35/50/30,無)完整 HERO_DB(hp 500萬/star5/isWorldBoss)。',
      '★ v3.15.50【共通+專屬天賦全寫進圖鑑 world-boss.js HERO_TRAIT】圖鑑彈窗(_wbTcBuildInfoHtml / _wbAdvOpenBossInfoPopup)資料驅動讀 HERO_DB/HERO_TRAIT/BURST_DB,更新資料即自動反映。8 龍王 trait 全補共通 4 天賦(元素護盾第 3/5/7/9 回合、單次受傷上限 5000、第 11 回合崩壞場地強制結算、每回合行動完額外普攻 1 下追擊最低 HP)+各專屬:火 暴擊+30%;森 吸能量/免疫光/怕燃燒(維持);地 減傷 40%→30%(依老師 spec)+反擊/怕毒(維持);雷 開場用攻擊值襲擊隨機 1 人/被降速時受傷+30%;海 每回合查封 1 人 2 回合/被冰凍受傷+30%;暗 每回合死亡宣告 1 人/受光+30%;光 每回合封印 1 人 2 回合/受暗+30%;幻 免疫所有異常/受普攻-30%/迴避+30%。',
      '★ v3.15.50【雷龍王完整設計 + 其餘 ? 未知 world-boss.js】風暴雷龍王 S1 雷霆貫穿(特技150%單體風傷+麻痺2回)、S2 暴風肅清(特技120%全體風傷+解除自身所有不利)、爆發 雷神·萬雷殛世(特技150%全體風傷+全體麻痺1回+解除自身所有不利);LINEUP 護盾改 風×2/光/火(shieldLayers wind:2/light:1/fire:1,破盾組合 地地暗水)。深淵海/邪骨暗/神聖光/星辰幻 之 S1/S2/爆發暫填「? 未知技能 / ? 未知爆發」(設計中),其素質與天賦已完整公開。',
      '★ v3.15.50【龍王戰背景露臉 world-boss-ui.html】#wb-lobby-overlay.wb-in-battle 戰鬥背景(JS 動態 _bossUrl + CSS 後備)由 center/cover 改 center 10%/cover(Y 由 50% 減 40% → 10%),龍王臉露在畫面中央。戰鬥隱藏龍王卡(縮 1px 仍可點 click)+全螢幕龍王背景 本就由 body.wb-in-worldboss-battle 全龍王通用,新龍王自動套用。',
      '★ v3.15.50【接班排程確認(既有機制已符合需求)】龍王倒下記 wbBossDownTimes[bossId];_calcSettleAt 算「倒下後下一個台灣 8:00」;該 8:00 第一個觸發 _wbSettle.trySettle 的玩家用 transaction 結算並「同一 transaction 原子接班下一隻龍王(滿血,照 _WB_BOSS_ROTATION 輪替)」。即「倒下後隔天 8:00 開放下一隻」對全龍王皆適用,本輪無需改碼。',
      '★ v3.15.50【版本鏈】4 GAME 同步點 v3.15.49→v3.15.50,_vers[world-boss.js] v3.15.34→v3.15.50、_vers[world-boss-ui.html] v3.15.48→v3.15.50,_vers[index.html]/[game_changelog.js] 同步 v3.15.50。admin_panel.js/arena.js 維持 v3.15.49、hero_db.js v3.15.44。本輪改 world-boss.js + world-boss-ui.html + index.html(版本鏈)+ game_changelog.js。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.30)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.49(2026-06-19)— 🎁 全體獎勵 + ⚔️ 鬥技場排名上線 + ✨ 提醒徽章 + 🛠 離場按鈕
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.49',
    date: '2026-06-19',
    brief: [
      '🎁【新增:老師可一鍵發獎勵給全班】',
      '   ・老師後台新增「全體玩家獎勵」,可一次把召喚卷 / 水晶 / 知識幣 / 英雄等發給<b>全班所有人</b>,你下次登入會自動收到並跳出通知,<b>每人只會領一次</b>(不會重複領)。',
      '⚔️【鬥技場排名正式開跑,有發獎勵了!】',
      '   ・排行榜改為比<b>本週獲得的 🎖 鬥技之證</b>,每週一早上 8:00 自動結算發獎,<b>同證數並列同名次</b>;結算後排行榜歸零,可在大廳按「📜 歷史」回看過去的名次。',
      '   ・名次獎勵:🥇第 1 名 🔮15/🎖15/💰3萬、🥈第 2-5 名 🔮10/🎖10/💰2萬、🥉第 6-10 名 🔮5/🎖5/💰1萬、第 11 名以後(本週有得證)🔮2/🎖2/💰5000。',
      '✨【關卡首頁的提醒更準了】',
      '   ・關卡首頁下方的提醒(免費 1 抽 / 有可強化英雄 / 有至寶可強化 / 有好友可贈禮)現在會<b>定時自動更新</b>,每天早上 8:00 重置後也會正確出現。',
      '🛠【離開鬥技場不再殘留按鈕】',
      '   ・修正離開鬥技場回到關卡頁後,<b>「戰鬥教學」等戰鬥中按鈕沒有消失</b>的問題,現在會全部收乾淨。',
    ],
    items: [
      '★ v3.15.49【離開鬥技場徹底收按鈕 index.html】backToHomeArena 補呼叫 ctrlBattleToggle(false)(隱藏左下「戰鬥教學」浮鈕 _tut-float-btn + 控制列「離開戰場」鈕/分隔線)+ 清教學遮罩 _tut-prompt/_ti-dim-overlay/_tut-dim + _tutorialActive/_gamePaused 旗標歸位 + 保險隱藏 _tut-float-btn。根因:backToHomeArena 原本只清各 overlay,從未呼叫 ctrlBattleToggle(false),故戰鬥教學浮鈕殘留',
      '★ v3.15.49【全體玩家獎勵 admin_panel.js + index.html】GM 後台「獎勵與補償」群組(原「補償與補發」改名)新增「全體玩家獎勵」卡:勾獎勵+數量(鏡像課堂獎勵)→ 標題/訊息/有效期 → _fbCreateGlobalReward 寫 globalRewards 一筆。玩家登入後 _fbClaimGlobalRewards 讀 enabled 的 globalRewards,對未領者用 transaction 認領 globalRewardClaims 的 uid_rewardId 文件(獨立認領文件,與玩家存檔分離 → 永不被三槽 richest-merge 復活成未領 → 即使共用 iPad 清快取/雲端資料誤差也絕不重複領);標記成功才 _fbCompensatePlayer 三槽發獎(沿用序號兌換「先標記再發獎,寧漏不重複」)。玩家主檔 _grClaimed 做跳過已領快取。需先部署 globalRewards/globalRewardClaims 規則',
      '★ v3.15.49【關卡提醒徽章定時刷新 index.html】新增 _setupStageBadgeAutoRefresh:每 25 秒,只要關卡頁 #adventure-overlay 可見就重跑 _updateStageEnhanceBadges();另追蹤台灣 game-day-key(_lxpsGetGameDayKey),跨 08:00 強制刷新。根因:徽章只在進頁/特定動作後計算一次,雲端資料(好友/至寶/每日免費召喚狀態)晚載入或玩家停在頁面跨過 08:00 都不會重檢 → 提醒常常沒出現。偵測階段零 Firebase 讀寫(純本地 + DOM class 切換)',
      '★ v3.15.49【鬥技場排名正式上線 arena.js + index.html】arena.js _arenaIsRankRewardEnabled 預設 false→true(GM 仍可在「鬥技場排名發獎開關」關閉)。並列同名次(競賽排名):trySettleLastWeek / getMyWeeklyRank / 大廳排行 rank = 1 + 本週證數嚴格大於我的人數(同證數同名次)。大廳排行榜資料源由聚合 arenaBattles(最近 500 筆)改讀 arenaWeekly[本週](便宜/自動週重置/不限 500 筆),欄位改「名次/玩家/本週證」(移除勝平敗)。結算後 deleteField 清空 arenaWeekly[上週](set merge:true 對 map 是深度合併,寫整份缺鍵不會刪 → 必須用 deleteField 才真的刪鍵)+ arenaRankSettlement 保留最近 6 週供大廳「📜 歷史排名」回查(新增 _arenaRank.getCurrentWeekRanking/getSettlementHistory)。獎勵不漏不重(結算上方既有 claimMyAward 自助領)',
      '★ v3.15.49【版本鏈】4 GAME 同步點 v3.15.48→v3.15.49,_vers[admin_panel.js] v3.15.40→v3.15.49(ADMIN_PANEL_VERSION 同步)、_vers[arena.js] v3.15.37→v3.15.49。hero_db.js 維持 v3.15.44、world-boss.js v3.15.34、world-boss-ui.html v3.15.48。本輪改 4 檔:game_changelog.js + admin_panel.js + arena.js + index.html。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.29)',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.48(2026-06-19)— 🐉 修世界 BOSS 龍王戰崩毀後卡死
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.48',
    date: '2026-06-19',
    brief: [
      '🐉【修正:龍王戰第 11 回合戰場崩毀後卡住無法離開】',
      '   ・修正多人一起打世界 BOSS 龍王戰時,<b>第 11 回合戰場崩毀(全員陣亡)後,部分玩家卡在戰場、結算畫面跳不出來、無法離開</b>的問題。',
      '   ・現在就算與房主的連線剛好掉封包,<b>自己也會偵測到全員陣亡並進入結算</b>,順利離開回到關卡頁。',
    ],
    items: [
      '★ v3.15.48【世界 BOSS 龍王戰崩毀後 guest 卡死 修正 world-boss-ui.html】根因:多人連線世界 BOSS 戰由房主(host)權威跑戰鬥、廣播狀態給其他玩家(guest/client)。guest 端結算靠 _wbClientCheckEnded 偵測「房主廣播 meta.status 為 ended」才觸發。但房主第 11 回合戰場崩毀 _wbForceCollapseAt11 只廣播 reason=force-collapse-at-11(把 p1 全歸 0),隨後「meta.status=ended」的 sync 若因網路丟包/房主端也卡而沒送達 guest,guest 會死等 ended → 永久卡在戰場「龍王戰結束無法離開」(v3.15.36 玩家回報:Safari、round 11、p1 四人 HP 全 0、最後 sync reason=force-collapse-at-11 後再無 sync)。修法:guest 端 _wbClientApplyWire 每次套完房主狀態後,偵測「p1 全員 curHp<=0(玩家方全滅)」且戰鬥未結算 → 自主走 checkWin 進結算(設 _wbClientForceCheckWin 放行,與 _wbClientCheckEnded 同機制),不再依賴房主二次廣播 ended',
      '★ v3.15.48【不誤判/不重複】世界 BOSS 戰玩家無復活機制,p1 全滅=確定戰敗,fallback 不會誤判;_wbAdvBattleEnded + _wbClientForceCheckWin 雙旗標守門避免每次 sync 重複觸發,兩旗標於新戰鬥開始 reset(world-boss.js L4546/L4585、world-boss-ui.html L10368)。checkWin worldboss + p1 全滅分支既有 → _wbShowAdvBattleResult(false) 進結算頁(index.html L55434)。房主端崩毀結算流程(_wbForceCollapseAt11 自身 600ms fallback)不受影響',
      '★ v3.15.48【版本鏈】本輪主改 world-boss-ui.html(guest 結算 fallback)+ index.html/game_changelog.js 版本鏈同步(index.html 無功能改動)。4 GAME 同步點 v3.15.47→v3.15.48,_vers[world-boss-ui.html] v3.15.21→v3.15.48。hero_db.js 維持 v3.15.44、arena.js v3.15.37、admin_panel.js v3.15.40、world-boss.js v3.15.34。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.28)',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.47(2026-06-19)— ⚔️ 修鬥技場滿 10 回合勝利卡死
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.47',
    date: '2026-06-19',
    brief: [
      '⚔️【修正:鬥技場打滿 10 回合分勝負時卡住】',
      '   ・修正鬥技場<b>雙方都沒被全部打倒、打滿 10 回合</b>由存活數/血量分勝負時,<b>結算畫面跳不出來、卡在戰場結束不了</b>的問題。',
      '   ・現在打滿 10 回合會<b>直接顯示勝負結算 + 「🏫 回到學校」</b>,乾淨結束回到關卡頁。',
    ],
    items: [
      '★ v3.15.47【鬥技場滿 10 回合勝利卡死 修正 index.html】根因:nextRound 內 _arenaCheckRoundLimit 滿 10 回合結算時,原優先走 _showResultWithDrama(這是「擊殺結束」的慢動作戲劇化,鏡頭聚焦最後一擊 → advShowBattleResult 冒險結算)。但滿 10 回合是「時間到結束」、雙方都還活著、沒有擊殺動作 → 慢動作找不到擊殺對象而卡死、結算頁不顯示 → 玩家卡在戰場「結束不了」。修法:win/lose/draw 三分支改「直接走 showResult」(鬥技場結算視窗 #result-overlay + 🏫 回到學校,無慢動作,會 clearTurnTimer + 關 action-panel + 清鬥技場中斷快照,乾淨結束回關卡頁);_showResultWithDrama 降為 fallback(萬一 showResult 不存在)',
      '★ v3.15.47【獎勵不漏不重 index.html】鬥技之證仍由結算上方 _arenaSettleReward(win/lose/draw) 先發,不重複;勝利陣容自動上雲(自動勝利槽,原在 _showResultWithDrama 內)於 win 分支補回呼叫 _arenaSaveAutoWinTeam(G.p1 四英雄名+元素)。全滅 KO 勝利仍走 _showResultWithDrama(有擊殺動作,慢動作正常),不受本次改動影響',
      '★ v3.15.47【版本鏈】本輪只改 index.html(鬥技場結算分流)+ game_changelog.js。4 GAME 同步點 v3.15.46→v3.15.47。hero_db.js 維持 v3.15.44、arena.js v3.15.37(_arenaCheckRoundLimit 計算邏輯未改)、admin_panel.js v3.15.40、world-boss.js v3.15.34、world-boss-ui.html v3.15.21。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.27)',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.46(2026-06-19)— 🛒 商店購買/販賣數量 +/- 調整更順手
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.46',
    date: '2026-06-19',
    brief: [
      '🛒【商店買賣數量調整更順手】',
      '   ・按「<b>＋</b>」想加超過上限時(今日限購/本週限購/背包裝不下,或賣超過持有量、果實每日上限),會<b>跳出提示告訴你已達上限</b>,「＋」按鈕也會<b>變灰鎖住</b>,不會多扣或多賣。',
      '   ・數量在「<b>1</b>」時按「<b>－</b>」,會<b>直接跳到最大數量</b>繼續往下調,不用從 1 一路加上去,調整更快!',
    ],
    items: [
      '★ v3.15.46【商店數量 +/- 調整改良 index.html】老師需求兩項。① 按「+」超過上限 → 彈窗提示 + 卡在上限 + 「+」按鈕變灰鎖定:新增 _shopMaxBuyable(prod) 回傳 {max,reason}(購買上限取 今日剩餘(dailyLimit-_shopDailyBought)/本週剩餘(weeklyLimit-_shopWeeklyBought)/背包容量(99-backpackGet) 最小值,記錄哪項卡住);shopAdjQty delta>0 且 cur>=max → _showInGameToast(依 reason:已達今日購買上限數量/已達本週購買上限數量/背包已滿)+ 數量卡 max;販賣 bagSellAdjQty delta>0 且 cur>=max → 依卡住原因(果實今日上限→已達今日販賣上限數量;否則→已達持有數量)。② 數量為 1 時按「-」→ 跳到最大循環:shopAdjQty/bagSellAdjQty delta<0 且 cur<=1 → next=max',
      '★ v3.15.46【+ 按鈕鎖定視覺 index.html】新增 _setPlusBtnLocked(btnId,locked) 統一切換「+」按鈕灰/綠(購買販賣共用,+ 按鈕皆綠色系);購買「+」按鈕加 id="shop-plus-{id}"、販賣加 id="bag-plus-{id}",渲染時依「數量是否已達上限」給初始灰/綠樣式,bagSellAdjQty 調整後即時更新(因販賣只更新數字不重渲染),購買 shopAdjQty 重渲染自動反映。+ 按鈕雖變灰仍保留 onclick → 玩家點到仍會跳上限提示',
      '★ v3.15.46【版本鏈】本輪只改 index.html(商店數量調整全在此)+ game_changelog.js。4 GAME 同步點 v3.15.45→v3.15.46。hero_db.js 維持 v3.15.44、admin_panel.js v3.15.40、arena.js v3.15.37、world-boss.js v3.15.34、world-boss-ui.html v3.15.21。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.26)',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.45(2026-06-19)— 🛟 帳號資料自救看門狗(讀不到完整記錄時一鍵重新載入)
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.45',
    date: '2026-06-19',
    brief: [
      '🛟【讀不到完整遊戲記錄時,一鍵自救】',
      '   ・偶爾因網路不穩,進冒險選關頁時<b>左上角的代表英雄頭像、暱稱會不見</b>——這通常代表沒有正確讀到你的完整記錄。',
      '   ・現在系統會自動偵測這個狀況,跳出提示<b>「因為網路連線不穩定,目前沒有正確讀取到您的完整遊戲記錄,請按此重新載入」</b>。',
      '   ・按下「<b>重新載入</b>」會自動重新整理+重新登入,用<b>雲端最完整的資料</b>蓋掉本機讀錯的資料;載入完成後會顯示<b>英雄、至寶、總等級、知識幣、水晶</b>讓你確認資料回來了!',
      '   ・(自救後 10 分鐘內不會重複跳出,避免一直打擾。)',
    ],
    items: [
      '★ v3.15.45【帳號污染自救看門狗 index.html】症狀偵測+一鍵自救(根因改過多次仍偶發,改走使用者層自救)。偵測:setInterval 每4秒跑 _advCorruptionWatchdog,守門(已登入+_cloudLoadDone===true+冒險選關頁 #adventure-overlay 開著+未冷卻+未顯示中)後,判定「本機記得暱稱(localStorage lxps_nickname_/_playerNickname/google-name 有值)但畫面暱稱條 #adv-username-bar 隱藏或 #adv-user-name 空」=疑似本地污染(暱稱條顯示條件=#google-name 有文字,污染讀不到則 display:none)。二次確認(1.2s 後再驗一次)防渲染時序瞬間誤判',
      '★ v3.15.45【自救流程 index.html】_showAdvCorruptionModal 彈全螢幕提示(僅「重新載入」鈕,文案=老師指定)→ _advRepairReload:寫 lxps_advRepairCooldown_{uid}(冷卻10分)+ lxps_advRepairPending(重整後顯示資料確認)+ _lxpsEnforceDeviceOwner(uid)清本機別 uid 殘留 + 清 window._memoryOwnerUid 強制重驗 → location.reload(Firebase auth 持久化自動重登,gameCloudLoad _lxpsMergeSlots 三槽最豐富覆蓋本地污染)',
      '★ v3.15.45【資料確認畫面 index.html】重整後掛在 gameCloudLoad existing-player 載入成功處(_applySafeData 後、_gmAutoUnlockNewHeroes 旁)呼叫 _advCheckRepairResult(_gUserId):讀 lxps_advRepairPending 標記(本 uid 才彈、彈一次即清)→ _showRepairResultModal 顯示 持有英雄(advGetUnlockedHeroes)/台灣至寶(taiwanTreasureData)/英雄總等級(_heroLevels 加總)/知識幣(_knowledgeCoins)/召喚水晶(_getCrystalBal),含「✓ 確認」鈕',
      '★ v3.15.45【版本鏈】本輪只改 index.html(看門狗全在此)+ game_changelog.js。4 GAME 同步點 v3.15.44→v3.15.45。hero_db.js 維持 v3.15.44(本輪未改)、admin_panel.js v3.15.40、arena.js v3.15.37、world-boss.js v3.15.34、world-boss-ui.html v3.15.21。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.25)',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.44(2026-06-19)— ⚡ 登入卡死修復 ＋ 24隻英雄血量提升30% ＋ 宙斯天降雷罰改三段
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.44',
    date: '2026-06-19',
    brief: [
      '🔧【修復:多人同時登入偶爾卡在首頁進不去】',
      '   ・修正全班同時開機時,少數同學<b>卡在登入畫面、要重開很久才進得去</b>的問題。',
      '   ・現在雲端讀取若太久沒回應,會在數秒後顯示「請檢查網路後重新整理」,<b>不再無限卡住</b>(進度都在雲端,重整就回來)。',
      '',
      '💪【24 隻英雄基礎血量提升約 30%】',
      '   ・這些英雄之前漏了血量加成,現在補上、<b>更耐打了</b>:武器精靈、神槍手、火柴人、青炎龍王、鳳凰、操偶師、菇女、小丑、美人魚‧角角、火爆女、幽幽、網路駭客、風術士、我的豚豚、機關王雙人組、雅典娜、阿蘇火山龍王、死神、地獄將軍、魔界花使‧朱玥、小鬼貓與兔、喚龍使‧蜜鶴林,以及法老王、埃及豔后(招募版)。',
      '',
      '⚡【天神宙斯爆發「天降雷罰」改版】',
      '   ・改為:鎖定 1 名主要目標(BOSS 或玩家)造成<b>特技600%+當前HP25%</b>傷害;旁邊的<b>菁英怪 HP 砍半</b>;<b>小怪全部變成 1 HP</b>;最後<b>全體敵人強力麻痺 1 回合</b>!',
    ],
    items: [
      '★ v3.15.44【登入卡死修復 index.html】根因:全班同時開機 → 同一校園對外 IP 大量並發 → Firestore 連線被限流/半通不通,getDocFromServer(強制走網路)既不成功也不快速失敗 → 永久 pending → await 卡死 gameCloudLoad/登入流程,玩家卡首頁要重開。修:新增 _fbRaceTimeout(p,ms,label) 逾時包裝,套到三槽讀取的 5 處:_fbLoad(server 9s + cache fallback 4s)、_fbLoadSlot(server 9s + cache 4s)、gameCloudLoad 二次確認(server 9s)。逾時 reject → 落入既有 catch → fallback getDoc(本 uid 專屬快取,安全);快取也逾時則拋出 → gameCloudLoad 既有「載入失敗視窗,請重整」路徑接手(不退預設池、不空白覆蓋雲端、不假裝新玩家)。最壞約 server9s+cache4s 後給可重整提示,不再無限卡',
      '★ v3.15.44【24隻玩家英雄基礎HP×1.3補正 hero_db.js】根因:玩家英雄四維配點和=100、HP 欄位應 baked×1.3(v3.4.0「59隻」批次規則),但後續新增的學生設計英雄逐隻漏做此步(index.html 直接用 HERO_DB.hp 不二次乘,故 hp 偏低約30%)。修:HERO_DB 22隻(蜜鶴林74/武器精靈75/神槍手78/火柴人66/青炎龍王78/鳳凰73/操偶師84/菇女78/小丑77/美人魚70/火爆女72/幽幽72/網路駭客75/風術士81/我的豚豚72/機關王84/雅典娜81/阿蘇78/死神77/地獄將軍91/魔界花使83/小鬼貓與兔77)+ EGYPT_BOSS_HERO_STATS 招募版(法老王58→75/豔后54→70)。僅改玩家英雄(全在 _PLAYER_HERO_NAMES);BOSS版hp 11500/10500、小怪、河童(小怪)、幼兒園小孩(玩家英雄但故意弱化sum80)均不動',
      '★ v3.15.44【宙斯天降雷罰改三段傷害 index.html + hero_db.js】老師更正規格,_runBurst 內 if(burstName===天降雷罰) 整段重寫:傷害1=_pickAutoBurstTarget 鎖定1名主要目標,若 BOSS(_zeusIsTrueBoss)或玩家(_PLAYER_HERO_NAMES)→特技 h.sp×_zrSpPct(Lv1=600%/每升+60%)+當前HP25%(HP段上限Lv×15);傷害2=BOSS/主目標以外的菁英怪(_zrEliteNames 對齊 _FIRE_IMMUNE_ELITE_NAMES 12名:貓空+日本菁英/稀有)→HP變當前50%;傷害3=小怪(非BOSS/非玩家/非菁英)→全體HP變1;結束全體強力麻痺1回合。鬥技場/PvP 對玩家目標沿用 v3.13.74 ×0.25 平衡;BOSS/玩家但非主目標(雙BOSS另一隻/鬥技場其他玩家)不受傷害只受麻痺。hero_db BURST_DB d/fd 同步三段文案(鐵律1.160 只寫Lv1基底600%)',
      '★ v3.15.44【版本鏈】index.html(登入逾時+宙斯爆發)+ hero_db.js(24隻HP+宙斯文案)+ game_changelog.js,4 GAME 同步點 v3.15.43→v3.15.44、_vers[hero_db.js] v3.15.42→v3.15.44。admin_panel.js 維持 v3.15.40、arena.js v3.15.37、world-boss.js v3.15.34、world-boss-ui.html v3.15.21。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.24)',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.43(2026-06-18)— 🐉 修復新英雄「喚龍使‧蜜鶴林」抽到/解鎖卻顯示未收錄
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.43',
    date: '2026-06-18',
    brief: [
      '🐉🔧【修復:抽到喚龍使‧蜜鶴林卻顯示「未收錄」】',
      '   ・修正新英雄 <b>喚龍使‧蜜鶴林</b> 即使召喚抽到、仍顯示未解鎖/未收錄的問題。',
      '   ・原因:這隻新英雄漏登錄到「全英雄主名單」,導致收錄判定抓不到它。現在已補上,抽到就正常收錄!',
      '   ・同時加了防呆機制:<b>所有稀有召喚英雄都會自動同步到主名單</b>,以後新角色不會再發生「抽到卻沒收錄」。',
    ],
    items: [
      '★ v3.15.43【根因 index.html】v3.15.41 新增喚龍使‧蜜鶴林時只加進 SUMMON_RARE_HEROES(召喚池),漏列兩份主清單:(a) ADMIN_ALL_HEROES — advGetUnlockedHeroes() 對管理員「直接回傳 ADMIN_ALL_HEROES.slice()(無視實際解鎖紀錄)」,故管理員帳號連抽到/GM 自動解鎖(v3.15.42)都永遠顯示未解鎖;(b) _PLAYER_HERO_NAMES — 收錄計數/存檔守門/_cleanseHeroLevelsByEmail 白名單,漏列會被當「非白名單」漏算甚至誤刪',
      '★ v3.15.43【修復 index.html】① 把「喚龍使‧蜜鶴林」補進 ADMIN_ALL_HEROES(L≈81382 結尾)與 _PLAYER_HERO_NAMES(L≈17378,v3.15.42 已補)② ★防呆自動補列:於 SUMMON_RARE_HEROES 定義後(L≈94121),把 SUMMON_RARE_HEROES(全為玩家可收集稀有英雄、無 BOSS/小怪)中漏列者自動 push/add 進 ADMIN_ALL_HEROES 與 _PLAYER_HERO_NAMES(const 陣列/Set 內容可變)→ 以後新增稀有英雄只要進了 SUMMON_RARE_HEROES,兩份主清單自動同步,絕不再漏',
      '★ v3.15.43【新增英雄鐵律(強化為主清單自動同步)】新英雄主清單 ADMIN_ALL_HEROES/_PLAYER_HERO_NAMES 現由「自動補列」保障(只要進 SUMMON_RARE_HEROES);_GM_AUTO_UNLOCK_HEROES(v3.15.42)對管理員實為冗餘(管理員 own-all 走 ADMIN_ALL_HEROES),保留無害',
      '★ v3.15.43【版本鏈】index.html(蜜鶴林補主清單 + 稀有英雄自動補列防呆)+ game_changelog.js,4 GAME 同步點 v3.15.42→v3.15.43。hero_db.js 維持 v3.15.42、admin_panel.js v3.15.40、arena.js v3.15.37、world-boss.js v3.15.34。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.23)',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.42(2026-06-18)— 🔨 靈魂碎片改手動合成自選召喚卷 ＋ 天青龍齊射調整 ＋ SSR 碎片數量分難度
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.42',
    date: '2026-06-18',
    brief: [
      '🔨【靈魂碎片改「手動合成」自選召喚卷】',
      '   ・SSR / SR 靈魂碎片<b>不再自動換成隨機召喚卷</b>,改成在「召喚星空」的召喚卷視窗裡<b>自己按「🔨 合成」</b>。',
      '   ・<b>40 個 SSR 靈魂碎片 → 合成 1 張 🌟 SSR 自選召喚卷</b>;<b>20 個 SR 靈魂碎片 → 1 張 ✨ SR 自選召喚卷</b>(自選券可從未收錄英雄中自己挑一名)!',
      '',
      '🐉【喚龍使‧蜜鶴林 天青龍調整】',
      '   ・天青龍(含爆發「魂芳雲魄」的至尊天青龍)的每回合龍息齊射,由<b>連攻 3 次改為 2 次</b>(節奏微調,單發威力不變)。',
      '   ・天青龍造成傷害時,<b>新增水龍攻擊動畫</b>,出手更有龍威!',
      '',
      '🔮【SSR 靈魂碎片掉落數量依難度調整】',
      '   ・黑暗球、埃及 BOSS:沒自信 <b>1</b> 片 / 普通 <b>2</b> 片 / 我很會 <b>3</b> 片(埃及 BOSS 通關現在也會掉 SSR 靈魂碎片)。',
      '   ・日本 BOSS:沒自信 <b>1</b> 片 / 普通 <b>1~2</b> 片 / 我很會 <b>2</b> 片。',
      '',
      '🚲【木柵防衛戰難度標示】',
      '   ・木柵冒險關卡介紹的難度改成 <b>★★★ ～ ★★★★★</b>(三隻 BOSS 由易到難)。',
    ],
    items: [
      '★ v3.15.42【乙 靈魂碎片手動合成自選券 index.html】移除自動換券:_gainSoulShard 與收禮路徑不再呼叫 _checkSoulShardConvert(碎片持續累積)。_SOUL_SHARD_DEF 的 ticket 由隨機券 summon_ticket_ssr/sr 改為自選券 summon_ticket_ssr_pick/sr_pick(ticketName/Icon 同步 🌟/✨)。新增 _synthShardToPickTicket(rarity):每次合成 1 張,檢查碎片≥need(SSR40/SR20)、自選券<99(滿則保留碎片不白損)、扣碎片+1 張自選券+_logActivity(source:shard_synth)+音效/banner+gameCloudSave+刷新面板。_openSummonTicketModal 新增「🔨 靈魂碎片合成」區(顯示 SSR/SR 碎片持有/需求 + 合成鈕)。道具 desc/贈友 desc/貓空 toast×3/SSR 取得說明畫面文案全部由「自動換」改為「可在召喚星空🔨合成自選召喚卷」',
      '★ v3.15.42【天青龍齊射 3→2 index.html + hero_db.js】_heLinDragonBarrage 迴圈 for(<3)→for(<2)、log「連攻 3 次」→「2 次」;BURST_UPGRADE_DEF 魂芳雲魄 5 列「特技×N%×3」→「×2」;hero_db S1 天青龍召喚 + 爆發魂芳雲魄 d/fd「攻擊隨機3次/連攻3次」→「2次」(保留召喚 3 回合不變)。涵蓋 S1 天青龍與爆發至尊天青龍兩種召喚物',
      '★ v3.15.42【天青龍傷害動畫 index.html】_heLinDragonBarrage 每段 doDmg 後 + 爆發龍息重擊 doDmg 後,呼叫 _skillGifOnCard(target, 水龍攻擊.gif, {cls:_dragon-barrage-gif, dur:1000/1100, opacity:0.95, blend:screen})疊在受擊卡片上',
      '★ v3.15.42【SSR 碎片掉落數量分難度 index.html】新增 _ssrShardDropCount(profile):darkorb_egypt→沒自信1/普通2/我很會3、japan→沒自信1/普通1~2隨機/我很會2(讀 _advPlayerDifficulty)。黑暗球(darkorb_always)/日本BOSS(japanboss_clear)/新增埃及BOSS(egyptboss_clear,原本無碎片)三點改用此數量;對應劇情視窗/加入夥伴 toast/埃及拾得 toast 顯示實際 ×N',
      '★ v3.15.42【GM 自動解鎖新英雄 index.html】新增 _GM_AUTO_UNLOCK_HEROES 清單(目前=喚龍使‧蜜鶴林)+ _gmAutoUnlockNewHeroes():管理員載入完成(gameCloudLoad existing-player path)後對清單中未解鎖者呼叫 advSaveUnlockedHero(name,gm_auto)(會寫 _heroUnlockHistory、不被 v3.15.40 稽核熔斷誤刪),idempotent、非管理員不動作。鐵律:每次新增英雄要把英雄名加進 _GM_AUTO_UNLOCK_HEROES',
      '★ v3.15.42【木柵難度範圍 index.html】adv-info 靜態星級 ★★★☆☆ → 「★★★ ～ ★★★★★」;selectAdvStage 動態星級 key===maokong 顯示範圍、其餘關卡維持 data.stars 原樣',
      '★ v3.15.42【版本鏈】index.html(乙手動合成/天青龍3→2/傷害動畫/碎片數量分難度/GM自動解鎖/木柵難度範圍)+ hero_db.js(天青龍 fd/desc 3→2 文字),4 GAME 同步點 v3.15.41→v3.15.42、_vers[hero_db.js]→v3.15.42。admin_panel.js 維持 v3.15.40、arena.js v3.15.37、world-boss.js v3.15.34。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.22)',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.41(2026-06-18)— 🛡️ 存檔保護修復(補發後存不了檔自動修復)＋世界王至寶補償修復
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.41',
    date: '2026-06-18',
    brief: [
      '🛡️【存檔保護修復 — 補發後存不了檔的同學會自動修復】',
      '   ・修正少數同學<b>老師補發角色/道具後,遊戲一直存不了檔、進度卡住</b>的問題(系統把正常存檔誤判成「資料倒退」擋了下來)。',
      '   ・更新後這些同學<b>下次登入會自動修復</b>,進度正常存檔,不會遺失任何東西。',
      '   ・同時修好<b>世界王排行榜的至寶補發</b>:之前因程式錯誤從未成功發出,現在恢復正常。',
      '',
      '⚔️【戰鬥更有氣勢】',
      '   ・所有戰鬥畫面登場時,新增<b>震撼的進場轉場音效</b>——冒險、鬥技場、世界王、雙人對戰通通有,開戰更帶感!',
      '',
      '🐉【新英雄登場】',
      '   ・新增英雄 <b>喚龍使‧蜜鶴林</b>(5 年 3 班 龎苡睿設計)!召喚「天青龍」助戰的召喚流英雄。',
      '   ・天賦「逆鱗」受傷時有機率封印攻擊者;S1 召喚天青龍化作護盾並每回合自動龍息齊射;S2「杳杳香魂」全體傷害+魅惑;爆發「魂芳雲魄」召喚至尊天青龍+特技 600% 龍息重擊。',
    ],
    items: [
      '★ v3.15.41【補償/存檔保護口徑統一 index.html — 乙】根因(5407 案例鐵證):_fbCompensatePlayer 算 _dataSummary 時 unlockedCount 用 _mergedUnlocked.length、totalHeroLv 整本 _mergedLevels 加總(主檔/live/safe 三槽全未過濾白名單),而 client 端 _buildSafeData/_getLocalSummary 都用 _PLAYER_HERO_NAMES 過濾;當帳號 unlockedHeroes/heroLevels 含非白名單殘留(BOSS/小怪/舊名,約 11 項約 100 級)時 → 雲端 summary=57/500、client 算 46/400 → _fbSaveLive 健康度守門(unlockedDelta=-11≤-5 硬擋、逃生口需本地總等級高雲端 15+ 但此處反低 100)誤判「解鎖倒退 11 隻」→ 連新撿的背包都存不上。修:補償三槽 + 跨槽合併 _lxpsMergeSlots 的 _dataSummary 全部改用同一支白名單過濾,雲端與 client 口徑一致(只過濾計數,不從實際 unlockedHeroes 清單刪英雄)',
      '★ v3.15.41【補償寫解鎖紀錄 + 等級 floor index.html — 甲】_fbCompensatePlayer 對「真的新解鎖」的英雄寫 _heroUnlockHistory(source:compensation),供 v3.15.40 稽核感知熔斷認得為本人合法擁有(否則查無紀錄會被當跨帳號殘留丟掉);並對授予英雄補 heroLevels Lv1 floor(max-merge 不降級既有高等級),一併流入主檔/live/safe 三槽',
      '★ v3.15.41【載入 reconcile index.html — 丙】雲端 heroLevels merge 完成後,凡 unlockedHeroes(已經 v3.15.40 稽核熔斷清淨)裡的白名單英雄若缺等級即補 Lv1 floor → unlockedHeroes↔heroLevels 對齊,推導解鎖數/totalLv 不再對不上(只補白名單缺項,不覆蓋既有等級、不新增非白名單殘留)',
      '★ v3.15.41【世界BOSS排名至寶補償修復 index.html】_wbCheckAndCompensateLostTreasure 內用了別函式作用域的區域 const PLAYER_DOC → 每次第一行 getDoc 就 throw ReferenceError 被 try/catch 吞成 WARN → 整支排名至寶自動補償從未跑成功(很可能是「第2名至寶補不回」主因)。修:函式內補上 const PLAYER_DOC=(uid)=>doc(window._fbDb,"players",uid)',
      '★ v3.15.41【存檔守門口徑一致 + 自動修復 index.html — 丁】_fbSaveLive(live 主守門)與 _fbSave(主文件守門)比對倒退時,雲端 baseline 與本地都改用「實際 unlockedHeroes/heroLevels 陣列 + 同一支 _PLAYER_HERO_NAMES 過濾」即時重算,不再採信舊版補償寫進雲端的「未過濾」_dataSummary。效果:已被舊膨脹 summary 卡住、存不了檔的帳號,下次存檔以「過濾後雲端(46) vs 過濾後本地(46)」自動通過(免逐隻一鍵重建);真正的英雄倒退仍擋得住(過濾後雲端 > 本地才算)',
      '★ v3.15.41【戰鬥畫面進場音效 index.html】老師需求:所有戰鬥畫面出現時加氣勢感轉場音效。新增 <audio id=sfx-battle-enter>(進入戰鬥畫面.mp3),掛在 renderField(entranceMode===true)——所有戰鬥類型(冒險/鬥技場兩路/重戰/世界BOSS/PvP/迷你)的戰場進場唯一通用點;直接 play 控制較大音量(0.9,暫停減半)呈現氣勢,尊重 _sfxMuted 靜音、800ms 防抖、播 4 秒後淡出;mid-battle 重繪走 renderField(false) 不誤觸。既有 playBattleStartSfx(開始進攻)/敲鑼未動,於冒險/鬥技場路徑會與新音效疊加',
      '★ v3.15.41【新英雄 喚龍使‧蜜鶴林 — 邏輯層 index.html(資料層在 hero_db.js v3.15.41)】(5 年 3 班 龎苡睿設計)召喚流 HP57/攻10/特18/速15。天青龍=附身式護盾(比照操偶 _puppetHp,doDmg 代承傷害、護盾全擋 return 0→逆鱗不觸發=甲);天賦逆鱗=本體受傷 50%(+5%/級)封印攻擊者;S1 天青龍召喚(護盾=本體 75% HP,3 回合,登場即齊射+每回合行動前特技 120% 連攻隨機 3 次,可 MISS);S2 杳杳香魂(全體特技 100% 傷害+60% 魅惑,龍在場×2/魅惑 70%);爆發 魂芳雲魄(至尊天青龍護盾=本體 200% HP+特技 600% 單體,玩家爆發經 _isPlayerBurstHit 必中)。execSkill+aiUseSkill 雙路徑(1.128)+ SKILL_UPGRADE_DEF/_renderSkillFdWithLv/BURST_UPGRADE_DEF 動態升級顯示(1.139/1.160)+ UI 護盾 HP 條 + SUMMON_RARE_HEROES 稀有池',
      '★ v3.15.41【版本鏈】index.html(乙=補償三槽+合併 summary 過濾／甲=補償寫解鎖紀錄+Lv1 floor／丙=載入 reconcile／丁=守門即時重算 baseline／PLAYER_DOC 修復／戰鬥進場音效／新英雄喚龍使‧蜜鶴林邏輯層)+ hero_db.js(英雄資料層)+ game_changelog.js,4 GAME 同步點 v3.15.40→v3.15.41、_vers[hero_db.js]→v3.15.41。admin_panel.js 維持 v3.15.40、arena.js v3.15.37、world-boss.js v3.15.34',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.40(2026-06-18)— 🛡️ 帳號資料保護大升級(角色/水晶/鬥技之證不再莫名消失)
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.40',
    date: '2026-06-18',
    brief: [
      '🛡️【你的資料,從此更安全】',
      '   ・大幅強化帳號保護:<b>抽到/補發的角色、水晶、鬥技之證、知識幣、台灣至寶</b>等,再也不會因為共用平板、切換帳號或網路不穩而<b>莫名消失或變成別人的</b>。',
      '   ・現在每次登入都會<b>以雲端最完整的資料為準</b>,自動把散在各處的進度全部撿回來,你看到的永遠是正確、完整的自己。',
      '   ・若之前有同學的資料曾經出問題,老師現在可以<b>一鍵幫你修復補回</b>。',
    ],
    items: [
      '★ v3.15.40【帳號資料保護「最高規格」六層核心修補 index.html】根因:載入時三槽(live/safe/主檔)只「挑最豐富一槽」,落選槽獨有的英雄/水晶/救援信號被丟掉;且換帳號時六大表記憶體殘留的守門憑證被命名空間架空→從不觸發。修:①新增 _lxpsMergeSlots「跨槽合併」取代挑一槽——累積型(英雄/六大養成表/台灣至寶/友情之心/鬥技之證持有+累積/各類帳本)union 或逐鍵 max、消耗型(知識幣/水晶/背包)取最新存檔槽、_adminRescueSignal 取三槽最大 ts、稽核感知排除「最近一筆解鎖紀錄=admin_delete」的英雄/至寶。②跨帳號污染守門改用 window._memoryOwnerUid(JS 全域變數,與殘留同生命週期,真實反映記憶體屬於誰)取代被命名空間架空的 adv_unlocked_heroes_uid。③lxps_device_owner_uid 列入命名空間白名單(復活 _lxpsEnforceDeviceOwner 換帳號清理)+ _clearAccountLocalData 補清 _friendshipHeart/_giftHistory/_giftLog/_kingChallenge/_crystalCount。④污染熔斷由「本地比雲端多>3隻就整批丟」改為「稽核感知」:逐隻查 _heroUnlockHistory(本人 creatorUid 且最近一筆非 admin_delete→保留;查無紀錄/別帳號/已刪→丟)→ 離線抽到的不誤殺、跨帳號殘留照樣擋、GM 刪除永久生效。⑤gameCloudSave 退化守門新增「背包整包被清空(0鍵但本地有≥3種物品)」防護,不誤擋正常消費',
      '★ v3.15.40【GM 一鍵帳號重建 index.html + admin_panel.js】新增後端 _fbRebuildAccountFromLedgers(讀三槽合併→用 _heroUnlockHistory/_crystalTransactions/_coinTransactions 帳本反推「應有資料」→比對現況缺漏)/ _fbApplyAccountRebuild(走 _fbCompensatePlayer 三槽 union/max 寫入,只補不減、排除已刪英雄、水晶補到上限99);admin_panel.js 新增「🔧 一鍵帳號重建」卡片(資料救援與重置群組,急救工具下方,三點同步 SIDEBAR_ITEMS+SIDEBAR_GROUPS+卡片+handler,無 ?. 相容舊 Safari)',
      '★ v3.15.40【設計取捨】消耗型(幣/水晶/背包)採「最新存檔槽」而非 max:三槽同帳號不同時間寫的,最新槽=最新真相,既尊重最新消費(不退款防刷)又不被舊槽低餘額蓋掉(防遺失)。累積型 union/max 只增不減,結構上不可能造成英雄/累積資源遺失。已被舊版弄壞的帳號:跨槽合併自動撿回英雄/累積資源,消耗型餘額用 GM 一鍵重建(帳本反推)補回',
      '★ v3.15.40【寫穿透加固 index.html】落實「獲得即上雲、不只存本地」原則:獲得幣 addKnowledgeCoins 本就立即 gameCloudSave;補上 backpackAdd(物品/水晶獲得的中央點)去抖動排程上雲(一連串獲得 2.5 秒內合併成一次同步、最長 15 秒保證落地,避免 Spark 寫入風暴)。英雄(_lxpsCloudInstantUnlock 即時 arrayUnion)、至寶(targeted updateDoc)、召喚結果/冒險解鎖確認(_lxpsInstantPersist)本就即時上雲。一次同步寫當前完整狀態→獲得物品與已扣水晶/幣一起落地。配合載入端跨槽合併「消耗型取最新槽」,共用平板換帳號也不遺失剛獲得的資源',
      '★ v3.15.40【版本鏈】3 主同步點 v3.15.39→v3.15.40 + game_changelog.js→v3.15.40 + admin_panel.js v3.15.37→v3.15.40(ADMIN_PANEL_VERSION 同步)。arena.js 維持 v3.15.37、hero_db.js v3.15.36、world-boss.js v3.15.34(本輪未動)',
    ],
  },
];