// ════════════════════════════════════════════════════════════════════════
//  game_changelog.js  —  LXPSGAME 更新日誌
//  最後更新:2026-07-15  / 目前主程式版本:v4.50.0(📖 遊戲教學說明更正)
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
  // v4.50.0 — 📖 遊戲教學說明更正(龍王血量/素質上限/寵物好感爆發威力)
  {
    ver: 'v4.50.0',
    date: '2026-07-15',
    brief: [
      '🐉【世界龍王血量更正】遊戲教學與說明書中的世界龍王 HP 由「500 萬」更正為「1000 萬」(和實際遊戲一致);同時把「每人每回合傷害上限 5000」寫得更清楚:是「每位英雄」每回合傷害上限 5000 喔!',
      '📊【素質提升上限補充】英雄能力點說明補上各項的提升上限:❤️HP 每點 +0.2% 減傷(最多減 50%)、⚔️攻擊每點 +0.5% 暴擊率與暴擊傷害(暴擊率最高疊到 100%)、✨特技每點 +1% 技能傷害與治療(沒有上限!投越多越強)、💨速度依速度差每點 +1% 迴避(最多躲 60%)。素質說明卡、新手教學、英雄強化教學都同步更新!',
      '💖【寵物好感度說明補完】原本只寫到「主人倒下時寵物會救活他、滿 100 爆發多 1 次」,現在補上遺漏的重點:寵物極限爆發的「威力」也會隨好感度五階提升——有點陌生 25% → 已經熟識 50% → 有點親密 75% → 非常親密 100% → 不離不棄 125%!和寵物越要好,寵物大絕越強!新手教學、寵物圖鑑、寵物小屋教學、寵物詳情頁全部同步。',
    ],
    items: [
      '★ v4.50.0【龍王血量】新手教學第4章 + 遊戲介紹說明書(可見文字與註解)HP 500 萬→1000 萬,對齊 v4.8.0 實況 10,000,000;「每人每回合」正名「每位英雄每回合」傷害上限 5000。',
      '★ v4.50.0【素質上限】STAT_DESCS(desc+simple 雙版)/ 新手教學第3章(premium 四行+simple 升級加點)/ HUT「分配四項能力」頁,補上:HP 減傷上限 50%(既有)、攻擊暴擊率最高疊到 100%(基礎15%+0.5%/點·doDmg Math.min(1))、特技無上限、速度依速度差每點+1%迴避上限 60%(doDmg Math.min(0.6))。',
      '★ v4.50.0【寵物好感爆發威力】依 v4.13.2 _affMult 實況(25/50/75/100/125%),於六處雙版文字補完:新手教學第6章 / 近期活動寵物卡 / 寵物小屋教學 STEPS / 寵物圖鑑 intro / 詳情頁忠誠夥伴 _desc / 詳情頁爆發區塊 _tip(鐵律1.232 cute+premium 全齊)。純顯示層·零邏輯改動·無 ?.。',
    ],
  },
  // v4.49.0 — 🐱 新角色登場:貓人族長(元素小精靈召喚·天賦強化)
  {
    ver: 'v4.49.0',
    date: '2026-07-12',
    brief: [
      '🌟【新角色登場介紹】🐱 貓人族長(SSR·4 年 6 班 張同學設計)—— 隱居深山的貓人族千金,天生擅長召喚魔法!天賦「小精靈召喚」:每回合出手前「一定」會召喚火/冰/雷元素小精靈中還沒有的一種(最多同時 3 隻);而且「普通攻擊時」和「受到傷害時」還各有機會再多召喚一隻!小精靈會擁有自己的血量、優先幫族長擋下傷害,普通攻擊時每有 1 隻小精靈就追加一次對應屬性的爪擊,讓對手燃燒/緩速/麻痺!(天賦每升 1 級,普攻與受傷的召喚機率就 +10%,最高 90%)',
      '💥【爆發更好懂】貓人族長準備發動極限爆發時,爆發說明會即時顯示「目前有幾隻小精靈」以及「引爆的總傷害量」,讓你一眼就知道現在爆發打得夠不夠痛,要不要再多召喚幾隻!',
      '⚡【技能一·雷精靈風暴】消耗雷精靈,喚起狂雷對隨機對手連轟 4 次,每一擊都有機會讓對手麻痺!(沒有雷精靈時無法施展喔)',
      '❄️【技能二·冰精靈守護】消耗冰精靈,展開極寒守護結界,讓我方全體受到的傷害大幅減少,而且攻擊我方的對手會被冰霜緩速!(沒有冰精靈時無法施展)',
      '💥【極限爆發·上級元素精靈‧引爆】把所有小精靈昇華引爆!每 1 隻精靈都會對敵方全體造成強力對應屬性傷害,還附帶強力燃燒/凍結/強力麻痺,必中且無視有利狀態!(至少要有 1 隻精靈才能發動)',
      '🐱【怎麼獲得】到「召喚星空」就有機會抽到貓人族長喔!',
    ],
    items: [
      '★ v4.49.0【天賦強化 小精靈召喚】①行動前「必定」召喚一隻缺少的小精靈(startTurn 改用 _catSummonMissingSprite helper·精靈 HP 改固定=本體最大HP×70% 不再隨天賦級成長) ②普通攻擊時(execAtk 追擊後) ③受到傷害時(doDmg 代承前·單次擲一次·排除治療反彈) 各有機率額外召喚一隻缺少的小精靈;召喚機率=50%+10%/天賦級(Lv5=90%)·天賦被封三處皆停用。',
      '★ v4.49.0【文字同步】HERO_TRAIT desc/fd(鐵律1.160 只寫Lv1=50%)+_TRAIT_LV_INFO(改為 base 召喚機率50%/+10%級/max 90%)+檔尾 sd(鐵律1.232 簡單風)+hero_input.html 天賦皆同步;召喚只加精靈不造成傷害·無新增秒殺路徑。',
      '★ v4.49.0【爆發面板動態資訊】showBurstPanel 與 adventure 爆發選角面板為貓人族長注入即時顯示:目前小精靈數量(含元素 emoji)+引爆總傷害量(=精靈數×spv×500%×_burstMult·_burstMult=1+爆發Lv×0.1);0 隻時提示需持有至少 1 隻才能發動。純顯示層·不動任何傷害邏輯。',
      '★ v4.48.0【新增學生設計英雄 貓人族長·4 年 6 班 張同學·SSR·dmg+ctrl】doDmg FIFO 精靈代承(比照天青龍·扣精靈 hp 不繞 5000cap·全擋 return 0)+renderCard 精靈 HP 條+普攻每持有1隻追加特技60%對應屬性傷害+對應異常2回合。',
      '★ v4.48.0【技能與爆發】S1 雷精靈風暴(消耗雷精靈·特技100%+5%/lv 風屬性隨機4次·每次70%麻痺)+S2 冰精靈守護(消耗冰精靈·全隊 _catIceGuard 減傷70%+3%/lv[Lv5=82%]2回合+攻擊者緩速)+爆發 上級元素精靈‧引爆(消耗全部精靈·每隻對敵全體特技500%×_burstMult 對應屬性分攤必中無視有利+強力異常·需≥1隻·走 doDmg 受5000cap 鐵律1.31)。',
      '★ v4.48.0【接線】execSkill+aiUseSkill 雙實作(鐵律1.128·AI 無對應精靈改普攻)+SKILL_FORCE_ELEMENT+SKILL_UPGRADE_DEF+BURST_UPGRADE_DEF(500→700%)+buffClass/buffName(_catIceGuard)+SUMMON_RARE_HEROES(IIFE 自動補池)+STUDENT_DESIGNER_HEROES(lsps111050→圖鑑🎨)·全在 index.html+hero_db.js+hero_input.html·無 ?.·七版號同步全對齊 v4.49.0。',
    ],
  },
  // v4.47.0 — 🛡 戰鬥體驗穩定四合一(封印提示/存檔更穩/劇情防卡/續戰診斷)
  {
    ver: 'v4.47.0',
    date: '2026-07-11',
    brief: [
      '🚫【封印看得懂了】被敵人「封印」時,技能按鈕上方會出現清楚提示:「技能被封印無法使用!可改用普通攻擊、休息或物品卡」。以前按技能沒反應會以為壞掉,現在一看就知道是被封印了,等封印回合結束就會恢復!',
      '☁️【存檔更穩定】戰鬥中的雲端存檔改成「聰明合併」:太密集的存檔會自動合併成一筆再上傳,重要時刻(暫停存檔、離開遊戲)一樣立刻存。這樣全班同時上課時,雲端不會塞車,你的進度反而存得更牢!',
      '👆【劇情不再卡住】劇情對話如果停很久沒動,畫面會出現「點擊畫面繼續劇情」提示;再等一陣子系統會自動幫你點一下,不會再有「卡在過場畫面出不去」的情況。',
      '🔍【續戰更透明】戰鬥中斷後的「續戰快照」現在會在系統紀錄留下完整線索,之後如果遇到「跳出後不能繼續打」,老師能更快幫你查出原因!',
    ],
    items: [
      '★ v4.47.0【任務A·封印零回饋根治·index.html】updateUI 於技能鈕(b-s1)正上方動態建 #seal-hint 提示條:行動英雄 seal/sealall→「🚫 技能被封印無法使用!可改用普通攻擊、休息或物品卡」;_burstSeal→爆發封印版;兩者並存→合併版。cute+premium 雙版(鐵律1.232)·pointer-events:none 純顯示層·不改任何 disabled 判定。根治玩家回報「按技能或爆發沒反應」(日本關學霸被八岐大蛇封印案例)。',
      '★ v4.47.0【任務B·雲端存檔節流·index.html】根治 Firestore resource-exhausted(Write stream exhausted maximum allowed queued writes→最大退避→存檔靜默失敗):gameCloudSave 保護層1.6後加 leading+trailing throttle——僅「戰鬥進行中且未結算」生效,距上次實寫<15秒→排尾端補寫(到期以最新記憶體狀態上雲·資料不遺失·最多延15秒·被節流呼叫共享同一Promise);直通旗標 _lxpsCloudSaveForceNext 由 _forceSaveBattleSnapshotAndSync/暫停存檔離開/只存檔 三關鍵路徑先設;三層離場事件偵測尾端補寫排程中→補寫一次。非戰鬥/結算存檔行為零改動。',
      '★ v4.47.0【任務C·過場防卡死 watchdog·index.html】adv-cutscene-overlay 每5秒輪詢:場景/對白索引60秒無推進→顯示脈動「👆 點擊畫面繼續劇情」(cute:點一下畫面繼續!);120秒起每60秒自動代點 advNextDialog 一次(借用既有自我修復重置殘留旗標·上限10次)。小怪戰/隨機事件/選擇面板/日本難度/法寶彈窗/答題/暫停 皆列例外不計時。',
      '★ v4.47.0【任務D·續戰快照診斷·index.html】_saveBattleRoundSnapshot 每回合寫入印 stage/round;_advCheckCrashRecovery 四個不彈續戰分支(無快照/內容無效/超過24小時/已在同關戰鬥中)各印明確原因→「跳出後沒讓我繼續打」類回報可直接從 console 定位。',
      '★ v4.47.0【範圍與驗證】只改 index.html(admin_panel.js/game_changelog.js 僅版號同步);無新增雲端欄位·firestore.rules 免改·無 ?.;七版號同步點全對齊 v4.47.0。',
    ],
  },
  // v4.46.0 — 🔥 炎火超少女登場
  {
    ver: 'v4.46.0',
    date: '2026-07-10',
    brief: [
      '🌬️【新角色登場介紹】🔥 炎火超少女(SSR·火屬性·1年4班 梁同學設計)—— 繼承火神血脈的異世界少女登場!她是高特技、高速度的火焰輸出兼控場好手。天賦「烈焰亂舞」:每回合出手前先甩出 4 道火焰亂舞灼燒隨機敵人、附加燃燒。S1「不滅炎魂」(被動):只要敵人一復活,就立刻被烈焰擊倒(遇到 BOSS、世界 BOSS 或鬥技場對手則改成造成上限傷害+強力燃燒,不會秒殺);而且每有敵人復活一次,她的特技就會越燒越旺!S2「怒火連環拳」:一口氣打出 5 記火拳,每一拳還會打掉對手 1 個有利狀態。極限爆發「火神附體」:對全體敵人灑下 900% 火焰、封住他們的增益 3 回合,接著自己進入「火神附體」3 回合——受傷減半、傷而不倒(最低保留 1 滴血)、火焰與燃燒反而幫她回血、出手還必中無視防禦!',
      '🔥【怎麼獲得】到「召喚星空」就有機會抽到炎火超少女喔!',
    ],
    items: [
      '★ v4.46.0【新增學生設計 SSR 英雄「炎火超少女」(1年4班 梁同學)·index.html+hero_db.js】火屬性·主分類 dmg+ctrl·配點 hp55/atk5/sp24/spd16(hp 欄位 72=55×1.3)。hero_db.js 14 表齊備(HERO_DB/AVATARS🔥/HERO_IMGS 炎火超少女.png/HERO_IMG_POS/HERO_BIO 含 designer(1年4班 梁同學)/BURST_DB/HERO_LORE/HERO_TRAIT/BURST_GIF_DB→神木復仇之火.gif/HERO_CATEGORIES_OVERRIDE[dmg,ctrl]/HERO_HEX_OVERRIDE/_TRAIT_LV_INFO/HERO_PRIMARY_CLASS dmg/HERO_SKILL_EFFECTS)+檔尾 sd 簡單風(鐵律1.232 cute+premium 雙版·1.160 只寫 Lv1)。',
      '★ v4.46.0【邏輯層 index.html】SUMMON_RARE_HEROES(IIFE 自動補 ADMIN_ALL_HEROES/_PLAYER_HERO_NAMES)+SKILL_FORCE_ELEMENT 四招火屬性+頂層 helper(_yhHasFireGod/_yhSoulPerLayer/_yhSpMult)+天賦 startTurn 行動前 hook(烈焰亂舞 特技40%×4 火傷+燃燒·天賦被封停用)+S1 doRevive hook(不滅炎魂:敵方復活即處決/上限傷害 Lv×20+強力燃燒·特技疊層+20%[3回合最多5層])+S2 execSkill/aiUseSkill 雙實作(鐵律1.128·怒火連環拳 特技100%火屬性隨機5次·每擊消1有利)+爆發 _runBurst(火神附體 特技900%×_burstMult 全體分攤·命中者禁益3回合·自身 firegodbody buff 3回合)+doDmg 5 hook(actor 必中無視有利/受傷減半/火傷·燃燒轉治療/不會倒下/造成傷害套禁益)+buffName/buffClass firegodbody+SKILL_UPGRADE_DEF(special_yh_soul+dmg)+codex 升級視窗 render case+BURST_UPGRADE_DEF(900→1260%)。',
      '★ v4.46.0【鐵律1.31 BOSS 尊嚴】天賦/S1/S2/爆發全部走 doDmg → 世界 BOSS 5000cap、真 BOSS 鎖血地板自動兜底,不會秒殺/HP 設 1/HP 比例/固定傷害>5000。S1 對世界 BOSS/真 BOSS/鬥技場對手一律改為上限傷害 Lv×20+強力燃燒(不處決)。',
      '★ v4.46.0【範圍與驗證】改 index.html+hero_db.js+hero_input.html(編輯器 HEROES_DB/HERO_CATEGORIES_INITIAL 純新增炎火超少女);admin_panel.js/game_changelog.js 版號/公告對齊。world-boss.js/world-boss-ui.html/arena.js/sw.js 未改免重傳。check_inline 20 塊/node --check/孤立代理字元/admin 零真 ?./7 版本同步點 全數 → v4.46.0。GAME_CHANGELOG 維持 20 筆(移除最舊 v4.26.0)。爆發用視覺特效 GIF 神木復仇之火.gif(無影片)。設計者 1年4班25號 梁同學掛名(index.html 補入 _STUDENT_DESIGNED_HERO_SET → 圖鑑標 🎨 學生設計英雄 + HERO_BIO.designer 顯示設計者區塊;該生未達三年級、無學生信箱 → 不入 STUDENT_DESIGNER_HEROES 獎勵登錄、不發設計師獎勵)。',
    ],
  },
  // v4.45.0 — 👑 埃及豔后爆發動畫「尼羅河的詛咒」登場
  {
    ver: 'v4.45.0',
    date: '2026-07-10',
    brief: [
      '👑【埃及豔后爆發動畫上線】使出極限爆發「尼羅河的詛咒」時,畫面右邊會播放埃及豔后專屬的爆發動畫!在英雄圖鑑點開埃及豔后,按左邊大圖右下角的「🎬 播放動畫」也能欣賞(要先收錄才看得到喔)。',
    ],
  },
  // v4.44.0 — ⛩ 巫女「神樂舞」+ ☀️ 法老王「太陽神的審判」爆發動畫登場
  {
    ver: 'v4.44.0',
    date: '2026-07-07',
    brief: [
      '⛩【巫女爆發動畫上線】使出極限爆發「神樂舞」時,畫面右邊會播放巫女專屬的爆發動畫!在英雄圖鑑點開巫女,按左邊大圖右下角的「🎬 播放動畫」也能欣賞(要先收錄才看得到喔)。',
      '☀️【法老王爆發動畫上線】使出極限爆發「太陽神的審判」時,畫面右邊會播放法老王專屬的爆發動畫!在英雄圖鑑點開法老王,按「🎬 播放動畫」也能欣賞(要先收錄才看得到喔)。',
    ],
  },
  // v4.43.0 — 🛡 BOSS 鎖血時圖片顯示「發威狀態·免疫傷害」標示
  {
    ver: 'v4.43.0',
    date: '2026-07-07',
    brief: [
      '🛡【王者發威!關卡 BOSS 鎖血時會亮起提示】當關卡 BOSS 血量被打到剩一半、或用最後一絲氣力撐住 1 滴血「王者不倒」的那一回合,BOSS 圖片上會出現醒目的「💢 進入發威狀態,免疫任何傷害!」標示,讓你一眼看出牠這回合正在拚死硬撐、絕不會倒下;等這回合過去、鎖血無敵結束,標示就會自動消失。(切到🧸簡單風時文字會變成更短的「💢 發威中!免疫傷害!」)',
    ],
    items: [
      '★ v4.43.0【BOSS 鎖血發威標示·index.html·強化版】抽出單一真相 helper _lxpsPaintBossRageLabel(h):p2 真 BOSS 卡(card-p2-{pos})中央加持久 .boss-rage-label(z32·pointer-events:none·Web Animations 輕微脈動)。顯示條件=「鎖血同回合 h._lifelineImmuneRound===G.round」或「保底顯示期未過 Date.now()<h._bossRageUntil」。★根治老師實測「鎖血卻看不到標籤」:改「鎖血觸發當下即時畫(_applyBossLifelineProtection 兩處 50%/1HP 賦值後呼叫 _lxpsTriggerBossRageLabel)+保底顯示 ~2.6s」→玩家該回合是最後行動者時 G.round 立刻前進也不會一閃即逝;renderCard 每次重繪呼叫同 helper(依同條件加/移除)。保底期滿 setTimeout 補收一次;鎖血無敵結束(下一回合)後自然移除(=「直到鎖血無敵結束」)。',
      '★ v4.43.0【純顯示層·不改機制】完全不動鎖血傷害機制:死亡免疫地板仍為 v3.16.36 版(非致命傷害照常結算·HP 可見下降·會致命才夾到剩 1 HP)。_lifelineImmuneRound 只會被 _applyBossLifelineProtection 對「真 BOSS」寫入→一般 p2 雜魚/菁英不誤顯示;世界 BOSS 龍王走 worldboss 早退不進此函式,不受影響。文字 cute+premium 雙版(鐵律1.232)。',
      '★ v4.43.0【範圍與驗證】只改 index.html;admin_panel.js/game_changelog.js 版號/公告對齊。hero_db.js/world-boss.js/world-boss-ui.html/arena.js/sw.js 未改免重傳。check_inline 20 塊/node --check/孤立代理字元/admin 零真 ?./7 版本同步點 全數 → v4.43.0。GAME_CHANGELOG 維持 20 筆(移除最舊 v4.23.0)。上傳順序:game_changelog.js → admin_panel.js → index.html(最後)。',
    ],
  },
  // v4.42.0 — 🍶 酒吞童子爆發動畫「鬼王酒宴」登場
  {
    ver: 'v4.42.0',
    date: '2026-07-07',
    brief: [
      '🍶【酒吞童子爆發動畫上線】使出極限爆發時,畫面右邊會播放酒吞童子專屬的爆發動畫「鬼王酒宴」!在英雄圖鑑點開酒吞童子,按左邊大圖右下角的「🎬 播放動畫」也能欣賞(要先收錄才看得到喔)。',
    ],
  },
  // v4.41.0 — 📖 圖鑑「播放動畫」按鈕不再被收錄記錄蓋住 + 🦊 玉藻前爆發動畫「禍世邪魅」登場
  {
    ver: 'v4.41.0',
    date: '2026-07-07',
    brief: [
      '📖【圖鑑「播放動畫」按鈕移到看得到的地方】英雄圖鑑左邊大圖右下角的「🎬 播放動畫」按鈕,之前會被下方「你已收錄+日期」那一條蓋住;現在會自動移到那一條的上方,不再被擋住,更好按了!',
      '🦊【玉藻前爆發動畫登場!】玉藻前新增專屬爆發動畫「禍世邪魅」,戰鬥爆發和英雄圖鑑的「播放動畫」欣賞都看得到、聽得到聲音!',
    ],
    items: [
      '★ v4.41.0【圖鑑播放動畫鈕上移·index.html】#hero-detail-anim-btn(原 bottom:14px·z8)會被 #hero-detail-unlock-record(收錄記錄帶·bottom:0·z8·高度依內容變·v3.16.69 放大約2倍)蓋住;修法:_codexRefreshBurstAnimBtn 顯示按鈕後量測收錄帶 offsetHeight,動態設 _btn.style.bottom = 收錄帶高度+12px(量測不到→退回舊值 14px);immediate + requestAnimationFrame 兩拍(catch 首次 overlay 剛顯示版面未定)。收錄帶在 _renderHeroDetail 順序上先於本函式渲染(117402→117404),量測穩定。純顯示層,不動收錄帶/按鈕行為/事件。',
      '★ v4.41.0【玉藻前爆發動畫·index.html】_BURST_VIDEO_DB 加「玉藻前→禍世邪魅動畫.mp4」一筆(SSR 標準流程):戰鬥爆發自動走 execBurst→_playBurstVideo、圖鑑欣賞自動走 _codexVideoUrlFor→_codexPlayHeroAnim,雙處自動生效無需改邏輯。URL 走 _BV_RAW(encodeURIComponent 中文檔名+?v=<版本> 破快取)。',
      '★ v4.41.0【範圍與驗證】只改 index.html;admin_panel.js/game_changelog.js 版號/公告對齊。hero_db.js/world-boss.js/world-boss-ui.html/arena.js/sw.js 未改免重傳。check_inline 20 塊/node --check/孤立代理字元/admin 零真 ?./7 版本同步點 全數 → v4.41.0。GAME_CHANGELOG 維持 20 筆(移除最舊 v4.21.0)。上傳順序:game_changelog.js → admin_panel.js → index.html(最後)。',
    ],
  },
  // v4.40.0 — 🎬 集中線/招式名固定3秒 + 英雄圖鑑「播放動畫」欣賞 + 大天狗動畫
  {
    ver: 'v4.40.0',
    date: '2026-07-07',
    brief: [
      '🎬【爆發演出更俐落】爆發時的「集中效果線」和「招式名稱大字」現在固定演出 3 秒後淡出,不會再跟著動畫長度一直停在畫面上,節奏更清爽!',
      '📖【英雄圖鑑可以看動畫囉!】在英雄圖鑑的個人頁,左邊大圖的右下角新增「🎬 播放動畫」按鈕。已經收錄(圖片是彩色)的英雄才能點,點下去動畫會放大蓋住左邊大圖播給你看,還能聽到聲音!第一次點會先下載並存起來,之後戰鬥時就能更快讀取播放。還沒收錄的英雄不能點;動畫還沒做好的英雄點了會出現「敬請期待」。',
      '🐉【大天狗動畫登場!】大天狗新增專屬爆發動畫(神威‧風獵),戰鬥爆發和圖鑑欣賞都看得到!',
    ],
    items: [
      '★ v4.40.0【集中線/招式名固定3秒·index.html】_showBurstCinematic 影片路徑下 speedLines(集中效果線 z462)與 cin(招式名大字 z465)由「撐到影片結束」改「固定 3 秒後淡出」;仍存參照給 execBurst _bvDone,影片比 3 秒短時由影片結束提前收(_faded 守門防重複);招式名 3 秒淡出不放 GIF(GIF 仍由影片結束 _bvDone 觸發)。靜態特寫盒 imgPanel 維持撐到影片結束(被影片覆蓋)。非影片英雄(_bvHold=null)時序零改動。',
      '★ v4.40.0【圖鑑播放動畫·index.html】#hero-detail-img-side 右下加 #hero-detail-anim-btn;_renderHeroDetail 設圖後 _codexRefreshBurstAnimBtn(name,_heroIsUnlocked)刷新(彩色=已收錄→可點·未收錄→禁用灰階·同大圖灰階口徑)。點擊 _codexOnAnimBtnClick:未收錄→輕提示;有動畫(_codexVideoUrlFor 查 _BURST_VIDEO_DB→_SKILL_VIDEO_DB)→_codexPlayHeroAnim 建 #hero-detail-anim-overlay(z30 覆蓋左側大圖·蓋過 SSR徽章 z10/皮膚切換 z5/收錄記錄·object-fit:contain·靜音起播→playing 解靜音出聲·關閉鈕/onended/onerror 自動收);無動畫→_codexAnimNotice「敬請期待」。文字 cute+premium 雙版(鐵律1.232)。',
      '★ v4.40.0【緩存·index.html】圖鑑動畫 URL 走 _BV_RAW(自帶 ?v=<版本>);圖鑑首播即進瀏覽器 HTTP 快取→戰鬥爆發 _playBurstVideo 用同一 URL 命中快取快速讀取(零額外 JS 記憶體·版本 bump 自動破快取重抓)。',
      '★ v4.40.0【大天狗動畫·index.html】_BURST_VIDEO_DB 加「大天狗→神威風獵動畫.mp4」一筆:戰鬥爆發自動走 execBurst→_playBurstVideo、圖鑑欣賞自動走 _codexVideoUrlFor→_codexPlayHeroAnim。★慣例:未來新增 SSR 爆發動畫只加 _BURST_VIDEO_DB 一筆即「戰鬥+圖鑑」雙處生效,無需改邏輯。',
      '★ v4.40.0【範圍與驗證】只改 index.html;admin_panel.js/game_changelog.js 版號/公告對齊。hero_db.js/world-boss.js/world-boss-ui.html/arena.js/sw.js 未改免重傳。check_inline 20 塊/node --check/孤立代理字元/admin 零真 ?./7 版本同步點 全數 → v4.40.0。GAME_CHANGELOG 維持 20 筆(移除最舊 v4.20.0)。上傳順序:game_changelog.js → admin_panel.js → index.html(最後)。',
    ],
  },
  // v4.39.0 — 🎬 爆發動畫「卡住」修好 + 播放順序重排(先文字/音效/特寫圖 → 動畫 → 技能特效/色彩遮罩/傷害)
  {
    ver: 'v4.39.0',
    date: '2026-07-07',
    brief: [
      '🎬【爆發動畫不卡了!】之前爆發動畫有時會停住好幾秒才繼續——原因是上一版讓影片「帶著聲音自動播放」,在 iPad 上常常卡住、播不動,要等到保險時間到才恢復。現在改成「先靜音把影片播起來(iPad 一定播得動),一開始播放就立刻打開聲音」,聲音照樣有、但不會再卡住了!',
      '🎞️【爆發演出順序調整】現在爆發的順序是:先出現「招式名文字 + 爆發音效 + 右側特寫大圖 + 集中線」→ 接著播放右側動畫 → 動畫結束後,才一起出現「原本的招式特效 + 音效 + 全螢幕色彩閃光 + 傷害/治療數字」,節奏更清楚、更有魄力!',
    ],
    items: [
      '★ v4.39.0【卡住根治·index.html】_playBurstVideo 影片由 v.muted=false(v4.38.0 解靜音)改「v.muted=true 靜音起播(iPad muted autoplay 一定能播、onended 正常) → playing 事件後 v.muted=false 解除靜音出聲」;根因=iPad Safari 對帶聲音的網路影片自動播放常令 play() 卡住/不播、onended 不觸發→一路等 10s 兜底=體感卡住。移除舊「解靜音被擋→退回靜音重播」邏輯。聲音仍播、且不卡。',
      '★ v4.39.0【順序重排·index.html】全螢幕色彩遮罩 flashScreen 由 execBurst 開頭「延到影片結束的 _bvDone」,與 _showBurstGif(原技能特效·含自帶音效)+ _runBurst(傷害/治療)同時登場→順序=爆發音效 sfx-burst + 招式名文字 bannerFX + 右側特寫大圖 + 集中線『先出現』→影片播→動畫完畢→技能特效+音效+色彩遮罩+傷害/治療。爆發音效 sfx-burst 維持在開頭(第一步)。',
      '★ v4.39.0【非影片路徑零改動·index.html】無爆發影片的英雄與世界BOSS(else 分支)沒有動畫要等,色彩遮罩 flashScreen 補回 else 分支開頭,維持與 v4.38.0 前完全一致的時序,杜絕回歸。',
      '★ v4.39.0【範圍與驗證】只改 index.html(_playBurstVideo 靜音起播+playing 解靜音、execBurst 色彩遮罩分流至影片路徑 _bvDone / 非影片路徑 else 開頭);admin_panel.js/game_changelog.js 版號/公告對齊。hero_db.js/world-boss.js/world-boss-ui.html/arena.js/sw.js 未改免重傳。check_inline 20 塊/node --check/孤立代理字元/admin 零真 ?./7 版本同步點 全數 → v4.39.0。GAME_CHANGELOG 維持 20 筆(移除最舊 v4.19.0)。上傳順序:game_changelog.js → admin_panel.js → index.html(最後)。',
    ],
  },
  // v4.38.0 — 🎬 三支爆發影片改成和特寫圖同時出現、並完全取代、而且有聲音
  {
    ver: 'v4.38.0',
    date: '2026-07-07',
    brief: [
      '🎬【爆發動畫時機修好了!】藝天使．克雷爾、主神奧汀、魔劍姬‧伊莉雅(神魔滅斬)這三支爆發動畫,現在會「和右邊那張爆發特寫大圖同時出現、並完全取代它」——不會再發生「特寫圖先跑出來、影片卻慢半拍才姍姍現身」的情況(尤其學校網路比較慢時)。',
      '🔊【爆發動畫有聲音了!】這三支影片本身帶的聲音現在會播出來,魄力更足!',
    ],
    items: [
      '★ v4.38.0【影片就緒才淡入·index.html】_playBurstVideo 的淡入時機由「一 append overlay 就 requestAnimationFrame 淡入」改為「影片可顯示畫面(loadeddata/playing/canplay 任一,0.8s 兜底)才淡入」→ 淡入的是真正有畫面的影片,而非空白 overlay,消除載入延遲造成的視覺空窗。',
      '★ v4.38.0【撐住靜態特寫盒直到影片覆蓋·index.html】爆發路徑(execBurst)下 _showBurstCinematic 的右側靜態特寫盒 #burst-img-panel 改「撐住模式」:不再固定 2 秒自動淡出,存參照(_bvHold.imgPanel)交由影片結束/跳過的 _bvDone 統一淡出移除→影片就緒瞬間覆蓋(取代)特寫圖、兩者同時呈現,無「特寫圖已消失、影片尚未出現」的落差。非影片英雄仍走原本 2 秒淡出時序,零改動。',
      '★ v4.38.0【解除靜音·帶聲音播放·index.html】_playBurstVideo 的 video 由 v.muted=true 改 v.muted=false/volume=1(老師更新的三支影片已含音軌)。帶聲音的自動播放若被瀏覽器擋(play() reject),退回「靜音重播」讓影片仍照常出現(絕不整支略過);伊莉雅技能影片神魔滅斬同走此播放器=一併解靜音+就緒才顯示。',
      '★ v4.38.0【範圍與驗證】只改 index.html(_showBurstCinematic 撐住 imgPanel + execBurst _bvDone 收尾 imgPanel + _playBurstVideo 解靜音/就緒才淡入/被擋退回靜音);admin_panel.js/game_changelog.js 版號/公告對齊。hero_db.js/world-boss.js/world-boss-ui.html/arena.js/sw.js 未改免重傳。check_inline 20 塊/node --check/孤立代理字元/admin 零真 ?./7 版本同步點 全數 → v4.38.0。GAME_CHANGELOG 維持 20 筆(移除最舊 v4.18.0)。上傳順序:game_changelog.js → admin_panel.js → index.html(最後)。',
    ],
  },
  // v4.37.0 — 🎬 三支爆發技動畫更新 + 改成覆蓋右邊大特寫圖
  {
    ver: 'v4.37.0',
    date: '2026-07-07',
    brief: [
      '🎬【爆發技動畫大改版!】藝天使．克雷爾、主神奧汀、魔劍姬‧伊莉雅(神魔滅斬)這三支爆發動畫都更新了新版本;而且播放方式改了——以前動畫是「鑲嵌在畫面正中央上方的小框」,現在改成「直接覆蓋右邊那張爆發特寫大圖」,尺寸放大到跟特寫圖一樣大,出現時機也和特寫圖同時,魄力更足!',
      '✨【往後新英雄也一樣】未來新的 SSR 英雄若有動畫版爆發特寫,也會用這個「覆蓋右邊大特寫圖」的方式呈現。',
    ],
    items: [
      '★ v4.37.0【影片破快取重抓·index.html】老師更新了三支影片檔(天界彩繪動畫/神魔滅斬動畫/諸神的黃昏·同檔名內容變)。_BV_RAW 產生影片 URL 時附上 ?v=<版本>(讀 _LXPS_FILE_VERSIONS[\'index.html\']),每次版本 bump 即產生新 URL → 客戶端強制重抓最新影片(raw.githubusercontent 忽略未知 query 照常回檔);解決「同檔名被瀏覽器/SW 快取成舊影片」。',
      '★ v4.37.0【取消中央鑲嵌·改覆蓋右側靜態特寫大圖片·index.html】_ensureBurstVideoStyle 的 #_bv-overlay 由「畫面正中上方 left:50%+translateX·width:58%·height:50%·z60」改為「right:0;top:0;width:600px;height:100%·z461·object-fit:cover」——與右側靜態特寫盒 #burst-img-panel(z460)完全同框同尺寸,影片以 z461 覆蓋在靜態特寫圖之上、集中效果線(z462)與招式名大字(z465)仍疊在最上。播放器 _playBurstVideo 與觸發流程(execBurst 撐住模式→建立特寫圖→緊接播影片)不變,故影片出現時機同特寫圖。',
      '★ v4.37.0【伊莉雅技能影片統一·資料驅動可擴充】魔劍姬 gated S1「神魔滅斬」技能影片同樣落在右側特寫框(統一呈現)。未來 SSR 動畫版爆發特寫只需在 _BURST_VIDEO_DB 加一筆(url 用 _BV_RAW(\'檔名.mp4\')),即自動走「覆蓋右側特寫」做法,無需改邏輯。',
      '★ v4.37.0【範圍與驗證】只改 index.html(_BV_RAW 破快取 + _ensureBurstVideoStyle 定位/尺寸/object-fit + 規格註解);admin_panel.js/game_changelog.js 版號/公告對齊。hero_db.js/world-boss.js/world-boss-ui.html/arena.js/sw.js 未改免重傳。check_inline 20 塊/node --check/孤立代理字元/admin 零真 ?./7 版本同步點 全數 → v4.37.0。GAME_CHANGELOG 維持 20 筆(移除最舊 v4.17.0)。上傳順序:game_changelog.js → admin_panel.js → index.html(最後)。',
    ],
  },
  // v4.36.0 — 🐾 寵物在英雄倒下/復活時不再消失 + 戰鬥中換寵物同步換爆發技
  {
    ver: 'v4.36.0',
    date: '2026-07-07',
    brief: [
      '🐾【友方英雄倒下、復活時,身上帶的寵物不會再不見了!】以前英雄在戰鬥中倒下(或被免死盾犧牲)後,角色卡上的跟隨寵物小圖有時會消失,復活後也回不來。現在只要英雄有帶著寵物,不管牠是倒下還是又站起來,寵物圖都會一直顯示——唯一會變的只有「這場已經用過的寵物爆發次數」。(鬥技場本來就不能帶寵物,不受影響。)',
      '🔄【戰鬥中替換跟隨寵物,爆發技也會跟著換!】以前在戰鬥中幫英雄換一隻新寵物,圖片換了、但寵物的「極限爆發技」有時還是舊寵物那招。現在替換寵物時,圖片、寵物爆發技名稱、以及實際施放的爆發效果三者會完全一致,換誰就用誰的招。',
    ],
    items: [
      '★ v4.36.0【倒下/復活寵物浮圖不消失·index.html】renderCard 建立寵物浮動去背圖(.pet-float-badge)的來源判斷,原為「h.equip.n || h._followPet」;英雄死亡處理(黑冠麻鷺免死盾犧牲等)會把 equip 清成 null,若 _followPet 也未設就無來源 → 浮圖消失。修法:來源加第三層耐久 fallback _pfPnDurable = 當該英雄為 p1 非好友英雄、寵物系統對本人開放(_petSysOpenForMe())、且處於冒險/世界BOSS/單人練習戰(_adventureMode||_wbInWorldBossMode||_wbSoloPracticeMode·明確排除鬥技場)時,讀 window._petFollowOf(h.name) 取得其跟隨寵物名 → 即使 equip/_followPet 被清仍持久顯示攜帶寵物。舊條件保留為註解(誤刪是大忌)。無 ?.。',
      '★ v4.36.0【替換寵物同步爆發技·index.html】戰鬥中兩條主要替換路徑(_advApplyPetToHero / 答題獎勵 _advFinishPetPick)本就同時設 equip(圖片)與 _followPet(→爆發名),爆發名由 _petFollowBurstName 讀 h._followPet 動態決定、爆發執行 _runPetBurst 亦讀 h._followPet;破口在舊版通用 doEquip 裝寵路徑只設 equip 沒設 _followPet → 圖換了但 _petFollowBurstName fallback 回舊寵。修法:doEquip 於 _markPetCollected 之後,若裝備物件帶 pet,補設 h._followPet=eq.pet、h._petBurstUsedByPet、h._petBurstUsed(已用次數視圖)、h._petBurstBonus(好感≥100 多一次),比照 _advApplyPetToHero → 圖片+爆發名+爆發執行三者一致。刻意不重設寵物素質加成(比照既有設計·防中途換寵回血 exploit)。無 ?.。',
      '★ v4.36.0【範圍與驗證】只改 index.html(renderCard 浮圖來源 + doEquip 裝寵補設兩處);admin_panel.js/game_changelog.js 版號/公告對齊。hero_db.js(v4.20.0)/world-boss.js(v4.30.0)/world-boss-ui.html(v4.28.0)/arena.js(v3.15.60)/sw.js 未改免重傳。check_inline 20 塊/node --check/孤立代理字元/admin 零真 ?./7 版本同步點 全數 → v4.36.0。GAME_CHANGELOG 維持 20 筆(移除最舊 v4.16.0)。上傳順序:game_changelog.js → admin_panel.js → index.html(最後)。',
    ],
  },
  // v4.35.0 — 🐉 天神宙斯「天降雷罰」秒殺龍王的漏洞修好了
  {
    ver: 'v4.35.0',
    date: '2026-07-07',
    brief: [
      '🐉【世界龍王不會再被「一招秒殺」了!】修正天神宙斯的極限爆發「天降雷罰」等即死類招式,原本會把最新幾隻世界 BOSS 龍王當成「小怪」直接打到只剩 1 滴血(等於一招秒殺)的嚴重漏洞。現在全部 8 隻龍王一律享有「王者尊嚴」保護,即死招式對龍王只會造成有上限的傷害,絕不會再被秒殺!',
    ],
    items: [
      '★ v4.35.0【天降雷罰秒殺龍王根治·index.html】根因:即死/秒殺保護的權威判定 _zeusIsTrueBoss 依賴的 _ZEUS_TRUE_BOSSES 清單只登錄到第三隻龍王(火山炎/翠綠森/山岳地),後 5 隻龍王(深淵海/風暴雷/邪骨暗/神聖光/星辰幻)漏加 → 被判為「非 BOSS」→ 天降雷罰(curHp=1)/死神收割(curHp=0)/大嘴吸入(curHp=0)/超能衝鋒瀕死 等把龍王當小怪直接設 HP=1/0(繞過 doDmg 5000 cap)一發秒殺。',
      '★ v4.35.0【單一真相修法】改 _zeusIsTrueBoss 函式本體加 _isWorldBossTarget(讀 WORLD_BOSS_LINEUP)判定,一律認全 8 龍王為真 BOSS,未來新增龍王自動涵蓋;龍王改走「BOSS 分支」比例傷害(受 5000 cap)不再被秒殺。連死神收割/大嘴吸入/超能衝鋒等同源秒殺技一併修好。',
      '★ v4.35.0【安全與範圍】僅影響 _zeusIsTrueBoss() 秒殺保護判定(全保護方向);不動 _ZEUS_TRUE_BOSSES.has() 直接呼叫(checkWin BOSS 存活/尊嚴反擊結算);_applyBossLifelineProtection 對世界 BOSS 有 worldboss 早退不受影響;玩家英雄阿蘇火山/青炎龍王不在 lineup 不誤判。只改 index.html;admin_panel.js/game_changelog.js 版號同步。',
      '★ 鐵則(今後永久生效):新增冒險關 BOSS 只要進 _ZEUS_TRUE_BOSSES 權威清單,即自動享有「BOSS 尊嚴」(50%/1HP 兩段鎖血+強制爆發反擊);新增世界 BOSS 只要進 WORLD_BOSS_LINEUP,即自動享有「單次傷害上限 5,000」——任何會造成傷害的公式對世界 BOSS 都不可再出現直接秒殺/HP 剩 1/HP 比例傷害/固定傷害超過 5,000。',
    ],
  },
  // v4.34.0 — 🐉 世界龍王連線戰「一場秒殺」修復
  {
    ver: 'v4.34.0',
    date: '2026-07-07',
    brief: [
      '🐉【世界龍王連線戰「一場被秒殺」的重大漏洞修好了!】修正世界 BOSS 龍王在「連線正式討伐戰」中,極少數情況下會被單一隊伍「一場戰鬥就打掉近千萬血、瞬間擊敗」的嚴重問題。龍王的「單次最多 5,000 傷害」尊嚴限制,現在不論戰鬥途中發生什麼狀況(斷線續戰、狀態殘留等)都一律生效,再也不會整場失效被秒殺。之前因此漏洞產生的異常排行紀錄,老師可在後台單筆刪除並補償參戰同學。',
    ],
    items: [
      '★ v4.34.0【乙案·龍王 cap 守門硬化·index.html】根因:doDmg 內 7 個龍王傷害 cap 站點(主路徑/固定傷害/爆擊額外的 pre-cap+終極 5000 cap+回合累計 budget)原守門為「_isWorldBossTarget(target) && _adventureStage===\'worldboss\'」兩條件同時成立才套 cap;連線正式龍王戰若中途被快照/續戰還原(_advRestoreSnapshot:_adventureStage=snap.stage)或殘留 maokong 冒險狀態把 _adventureStage 洗成非 worldboss,兩條件之一失效即「整場所有 cap 靜默全失效」→ 龍王被幾發普攻/技能秒空(排行榜 _dealt=boss.hp-boss.curHp=本場真實掉血 9.38M)。修法:新增單一真相 helper _wbCapStageOk()(恆回 true,stage 異常時 console.warn 一次診斷),7 站點守門改為「_isWorldBossTarget(target) && _wbCapStageOk()」→ 只要 target 是 WORLD_BOSS_LINEUP 八龍王之一就一律套 5000 cap,不再依賴脆弱的 _adventureStage。玩家英雄「阿蘇火山龍王/青炎龍王」名字不在 lineup、_isWorldBossTarget 回 false、絕不誤中。舊 _adventureStage 條件全部保留為註解(誤刪是大忌)。純記帳(addContribution)/FX 同步/護盾觸發/治療免疫等非 cap 站點維持原 stage 條件不動(stage 洗掉時只會少記傷害或少觸發護盾,不會造成秒殺,守保守原則)。',
      '★ v4.34.0【GM 排行榜工具補齊全 8 龍王·admin_panel.js·後台】「🏆 世界 BOSS 排行榜管理」原寫死火山炎龍王(_bindWblbSection 的 const BOSS_ID),七隻新龍王的排名/傷害看不到也刪不了。修法:區塊加龍王下拉 _admin-wblb-boss-select(依 WORLD_BOSS_LINEUP 列全 8 龍王·標⭐當前),BOSS_ID 改 let(預設帶入當前龍王 _wbGetCurrentBossId),下拉切換即換 BOSS_ID+重新整理;讀榜/清榜/明細(逐隊英雄+等級/四冠軍/📜傷害來源明細=每位英雄每個技能名稱+累積傷害+命中次數)/勾選刪除異常紀錄/單場墓碑標記+發補償券 全部閉包共用同一 let BOSS_ID → 切龍王即全套切換,龍王名稱全動態(_wbBossName)。讓老師可隨時針對「一場秒殺/異常傷害」紀錄單筆刪除並補償參戰玩家。',
      '★ v4.34.0【範圍與驗證】改 index.html(7 個 cap 站點守門+helper)+admin_panel.js(GM 排行榜工具);game_changelog.js 版號/公告。hero_db.js/world-boss.js/world-boss-ui.html 凍結免重傳。check_inline 20 塊/node --check/孤立代理字元/admin 零真 ?./7 版本同步點 全數 → v4.34.0。GAME_CHANGELOG 維持 20 筆(移除最舊 v4.14.0)。上傳順序:game_changelog.js → admin_panel.js → index.html(最後)。',
    ],
  },
  // v4.33.0 — 🐾 預設陣容記住寵物 + 🎬 爆發技影片播放順序改善
  {
    ver: 'v4.33.0',
    date: '2026-07-06',
    brief: [
      '🐾【冒險預設陣容會記住寵物了!】在冒險模式儲存「預設陣容」時,現在會一起記住每位英雄身上帶的跟隨寵物;打開預設陣容清單會看到每位英雄下方顯示攜帶的寵物圖與名字,套用這個陣容時也會自動幫大家戴回當時的寵物(鬥技場本來就不能帶寵物,不受影響)。',
      '🎬【爆發技影片播放順序更順了!】有專屬爆發動畫的英雄(藝天使‧克雷爾、主神奧汀等),施展爆發時:爆發字幕、集中效果線、爆發音效、全螢幕光彩會和影片「同時出現」,字幕與效果線會一直撐到影片播完;影片位置從左上角移到畫面「正中央上方」;要等影片播完(或按「跳過」)才會放原本的爆發特效並顯示傷害/治療數字。影片右下角有「跳過 ⏭」鈕,趕時間可以直接跳過。',
    ],
    items: [
      '★ v4.33.0①【冒險預設陣容儲存跟隨寵物·甲·index.html】_confirmSavePreset 於冒險模式(_adventureStage!=null)把 heroes.map(_petFollowOf) 存為槽位新欄位 pets[](鬥技場不存);_advPresetTeams 是整個陣列寫進主存檔→Firestore set(merge:true) 對陣列整包取代不深合併,加 pets 欄位天生安全且自動上雲。openPresetTeamPanel 冒險模式每位英雄下方顯示寵物去背圖(_petNobgUrl·onerror→🐾)+寵物名(舊存檔無 pets 欄位退回讀當下 _petFollowOf 不留白)。_applyPresetTeam 冒險分支套用時對 pt.pets[] 逐一 _petSetFollow 還原跟隨寵物(_petIsTamed 守門,未馴養靜默略過),戰前 _applyFollowPetToHero 據此上寵物。',
      '★ v4.33.0②【爆發技影片播放時序重排·index.html】僅「有爆發影片的玩家英雄(_BURST_VIDEO_DB[h.name])且非世界BOSS」走重排:execBurst 尾端 t=0 同時起播 爆發字幕(大字)+集中效果線+爆發音效(sfx-burst)+全屏光彩(flashScreen)+影片;_showBurstCinematic 加「撐住」模式(window._bvHoldCinematic)→大字/集中線不自動淡出、不自動放 GIF,存參照待影片結束回收;_playBurstVideo 新增 onEnd 回呼,影片自然結束/跳過/載入失敗/10s 兜底任一路徑只觸發一次→收大字/集中線→放原有 GIF 特效→顯示傷害/治療數字(執行爆發效果·抑制 _runBurst 內部重播影片旗標 _bvSuppressInRunBurst)。overlay 位置由左上改置中上方(left:50%+translateX·貼頂),新增「跳過 ⏭」鈕(overlay pointer-events:none,鈕單獨 auto)。世界BOSS(多人同步時序敏感)與無影片英雄一律走原路徑,零改動。',
      '★ v4.33.0【範圍與驗證】只改 index.html(兩功能)+admin_panel.js/game_changelog.js 版號對齊;hero_db.js(v4.20.0)/world-boss.js(v4.30.0)/world-boss-ui.html(v4.28.0)凍結免重傳。7 版本同步點 → v4.33.0。GAME_CHANGELOG 維持 20 筆(移除最舊 v4.13.6)。上傳順序:game_changelog.js → admin_panel.js → index.html(最後)。★待辦:鬥技場預設陣容顯示/儲存(鬥技場禁寵物,僅至寶加成待評估)。',
    ],
  },
  // v4.32.0 — 🛒 超商動態背景 + 🎬 爆發技影片顯示修復 + 🛡 BOSS 尊嚴根治 + 🐉 龍王排名至寶對應
  {
    ver: 'v4.32.0',
    date: '2026-07-06',
    brief: [
      '🛒【不可思議超商變成會動的了!】進到「不可思議超商」(每日商店)時,背景會播放一段全螢幕的動態影片,讓超商更有氣氛!畫面自動淡入,萬一載入失敗會自動換回靜態背景圖,不影響購物。',
      '🎬【爆發技動畫終於出得來了!】修好「爆發技鑲嵌動畫沒有出現」的問題(影片網址與顯示階層都調整過),藝天使‧克雷爾、主神奧汀、魔劍姬的爆發動畫現在會正確疊在戰鬥畫面上。',
      '🛡【王者尊嚴補強!】修正「魔劍姬爆發一發把關卡 BOSS 秒殺、沒有觸發強制鎖血與爆發反擊」的漏洞。現在 BOSS 遇到會致命的暴擊,一樣會先鎖在半血/1 滴血並反擊,不會被一擊帶走。',
      '🐉【龍王排名獎勵至寶對應正確了!】世界 BOSS 排名獎勵的「龍王專屬至寶」現在會正確對應「當前這隻龍王」——雷龍王發雷龍王之翼、海龍王發海龍王之爪…等,全 8 隻龍王都對應好了(原本雷/海/暗/光/幻會誤發成火龍王之牙)。獎勵頁的至寶介紹也一併顯示正確。',
    ],
    items: [
      '★ v4.32.0①【不可思議超商動態影片背景·index.html】商店 overlay(#shop-overlay)最前端新增全螢幕動態影片 #shop-bg-video(autoplay/loop/muted/playsinline·onloadeddata 才淡入·onerror 自動隱藏→露出靜態 不可思議超商.png),作法比照召喚星空/鬥技場:z-index:0 疊在自身靜態底圖之上、遮罩(z0)與內容(z1)之下,pointer-events:none。',
      '★ v4.32.0②【爆發技影片沒出現·根治】❶URL 由相對路徑檔名改完整 raw(_BV_RAW encodeURIComponent)——全站影音一律走 raw.githubusercontent,GitHub Pages 下相對路徑會 404→onerror 靜默移除→影片不出現。❷_playBurstVideo 錨點由 #field-center(場地效果卡容器·常空→updateFieldFX 會 center.innerHTML=\'\' 幾乎零高度且清掉 overlay)改為穩定全尺寸 #gc(戰鬥畫面外層·z-index:60 疊在敵方卡牌區上方)。',
      '★ v4.32.0③【BOSS 尊嚴·魔劍姬必爆穿透鎖血根治】doDmg 的「暴擊額外傷害」是主傷之後另扣一次的補扣路徑,原本只有「本擊主傷已觸發鎖血」時才歸零;漏洞=主傷未觸發鎖血(HP 仍 >0/未破 50% 門檻,或第一段已用但主傷未致命),但主傷+暴擊額外會把 BOSS 打到 <50% 或 ≤0 時,暴擊額外照扣→穿透兩段鎖血直接秒殺、且不觸發反擊(魔劍姬「魔尊血脈」對關卡 BOSS 必定暴擊→穩定觸發此洞)。修法:對真 BOSS 讓暴擊額外補扣也經 _applyBossLifelineProtection(此時 curHp 已扣主傷,依剩餘 HP 正確判 50%/1HP 鎖血並排程強制爆發反擊)。世界 BOSS 走 5000 cap 不受影響(鐵律 1.31)。',
      '★ v4.32.0④【龍王排名獎勵至寶對應各龍王·index.html】原 _WB_DRAGON_T_MAP 只有火/草/地 3 筆→雷/海/暗/光/幻 5 隻查無 bossId→fallback 火龍王之牙(排名獎勵與獎勵頁至寶彈窗都發錯/顯示錯)。新增單一真相 helper window._lxpsDragonTreasureMapFull()/_lxpsDragonTreasureId(bossId):本地完整 8 龍王 base(炎龍王之牙/森龍王之鬚/地龍王之麟/雷龍王之翼/海龍王之爪/暗龍王之骸/光龍王之羽/幻龍王之角)· Object.assign 疊 world-boss.js window._WB_DRAGON_TREASURE_MAP;排名獎勵發放與 _wbShowDragonTreasureInfo 雙路徑改走 helper。未來新增龍王只需補一筆即自動對應。★ world-boss.js 未動(其顯示 map 仍 3 筆但被本地 8 筆覆蓋;因 raw 落後於未部署 v4.30.0,不動避免誤刪三龍王微調)——world-boss.js 顯示 helper map 之後由老師於正確 v4.30.0 底本補齊 8 筆。',
      '★ v4.32.0【範圍與驗證】改 index.html(超商 video/爆發影片 URL+錨點/BOSS 尊嚴引擎/龍王至寶 helper);admin_panel.js/game_changelog.js 版號對齊。7 版本同步點 → v4.32.0(world-boss.js v4.29.0 未動 / hero_db.js v4.20.0 / world-boss-ui.html v4.28.0 / arena.js v3.15.60 凍結免重傳)。GAME_CHANGELOG 維持 20 筆。上傳順序:game_changelog.js → admin_panel.js → index.html(最後)。★待辦:鬥技場預設陣容顯示跟隨寵物去背圖+寵物名、並把寵物/至寶加成存進預設陣容記錄(尚未做)。',
    ],
  },
  // v4.31.0 — 🎬 三英雄爆發技鑲嵌動畫上線(資料驅動可擴充)
  {
    ver: 'v4.31.0',
    date: '2026-07-06',
    brief: [
      '🎬【爆發技動畫登場!】部分英雄施展極限爆發時,戰鬥畫面左上角會疊上一段專屬的動畫短片,讓爆發更有氣勢!動畫會自動淡入淡出、播完就消失,不影響操作。',
      '👼 藝天使．克雷爾 施放極限爆發時 → 播放「天界彩繪」動畫。',
      '⚡ 主神奧汀 施放極限爆發時 → 播放「諸神的黃昏」動畫。',
      '⚔️ 魔劍姬‧伊莉雅 只有在爆發「魔尊覺醒」進入再行動、免費施放 S1 神魔滅殺 的那一下 → 播放「神魔滅斬」動畫(直接放 S1 或還沒覺醒都不會播)。',
      '✨ 之後會陸續替更多英雄的爆發技加上專屬動畫,敬請期待!',
    ],
    items: [
      '★ v4.31.0【爆發技鑲嵌動畫系統·index.html·資料驅動可擴充】新增資料表 _BURST_VIDEO_DB(英雄名→爆發影片)與 _SKILL_VIDEO_DB(英雄名→特定技能+條件影片)+ 播放器 _playBurstVideo/_ensureBurstVideoStyle:overlay 錨定 #field-center 填左上(width52%/height50%/z-index60)、opacity 淡入淡出、播完 onended/onerror 自動移除、pointer-events:none 純視覺不吃點擊、muted+playsinline+webkit-playsinline(舊 iPad inline autoplay)、play().catch 與 10s watchdog 兜底、載入失敗靜默略過絕不擋爆發。之後大量新增只加一筆資料,不改邏輯。',
      '★ v4.31.0【三掛鉤點·鐵律1.128雙實作】① _runBurst 內 name=_mimicSourceName||h.name 後:side===p1 且 _BURST_VIDEO_DB[name] 存在即播(藝天使→天界彩繪動畫.mp4、奧汀→諸神的黃昏.mp4)。②execSkill 與 ③aiUseSkill 開頭各查 _SKILL_VIDEO_DB[a.name]:魔劍姬 sk.n===神魔滅殺 且 a.side===p1 且 when(a)=h._iliyaBurstActive===true 才播 神魔滅斬動畫.mp4(自動戰鬥 p1 同觸發)。',
      '★ v4.31.0【影片壓縮·交付】三支 720p 去音軌(ffmpeg libx264 crf29 veryslow +faststart):天界彩繪動畫 7.1MB→866KB、神魔滅斬動畫 7.5MB→1.39MB、諸神的黃昏 5.8MB→966KB(原檔名直接覆蓋 GitHub 根目錄·網址不變)。',
      '★ v4.31.0【版本與驗證】7 版本同步點 → v4.31.0(index.html + admin_panel.js + game_changelog.js;world-boss.js 維持 v4.30.0、hero_db.js 維持 v4.20.0 免重傳)。GAME_CHANGELOG 維持 20 筆(移除最舊 v4.13.4)。上傳順序:game_changelog.js → admin_panel.js → index.html(最後)。',
    ],
  },
  // v4.30.0 — 🐲 世界 BOSS 最後三龍王(邪骨暗/神聖光/星辰幻)技能·爆發·天賦·特效·音效正式實裝
  {
    ver: 'v4.30.0',
    date: '2026-07-06',
    brief: [
      '🐲【世界 BOSS 最後三隻龍王正式登場!】邪骨暗龍王、神聖光龍王、星辰幻龍王原本是「設計中(招式未知)」,現在技能、大絕招、天賦、專屬視覺特效與音效全部到位,可以正式挑戰了!',
      '💀【邪骨暗龍王(暗屬性)】天賦「黃泉之意志」:每回合會對一名英雄烙下死亡宣告(倒數歸零會倒下,要盡快解除),而且畏懼光屬性(受光屬性傷害增加)。招式「幽冥凋零 / 黃泉侵蝕」、爆發「黃泉歸葬」,伴隨煙霧與死神鐮刀特效。',
      '✨【神聖光龍王(光屬性)】天賦「高天原之意志」:每回合會封印一名英雄的技能與爆發,而且畏懼暗屬性。招式「神聖裁決 / 天罰之光」、爆發「高天原審判」,伴隨審判光束與金色聖光特效。',
      '🌌【星辰幻龍王(無屬性·終極)】天賦「星辰之意志」:免疫所有異常狀態、極高迴避、受普通攻擊傷害減少,需要湊齊七種屬性才能有效破防。招式「星流閃擊 / 銀河潮汐」、爆發「星辰湮滅」,伴隨星辰與虛空特效。',
    ],
    items: [
      '★ v4.30.0【三龍王技能/爆發/天賦正式化·world-boss.js】HERO_DB 內嵌補充的 s1/s2、BURST_DB 三筆爆發、HERO_TRAIT/HERO_LORE/HERO_BIO 由「? 未知/設計中」改為正式技能文案。暗=幽冥凋零(c5·特130% 全體暗+隨機2死亡宣告)/黃泉侵蝕(c6·特150% 全體暗+全體強力易傷)/爆發黃泉歸葬(特150% 全體暗 無視增益+全體死亡宣告+隨機2強力暈眩)。光=神聖裁決(c5·特130% 全體光+隨機2封印)/天罰之光(c6·特150% 全體光+隨機2強力暈眩)/爆發高天原審判(特150% 全體光 無視增益+全體封印+隨機1強力暈眩)。幻=星流閃擊(c5·特130% 全體無屬性+隨機2暈眩)/銀河潮汐(c6·特150% 全體+隨機2強力易傷)/爆發星辰湮滅(特160% 全體 無視增益+全體暈眩+全體強力易傷)。',
      '★ v4.30.0【三龍王專屬特效 key·world-boss.js】_WB_FX_URLS 新增 9 key(全用現有英雄爆發技 GIF·curl 200):暗 dark_s1=煙霧爆開.gif / dark_s2=永恆藍染詛咒.gif / burst_dark=死神之鐮.gif;光 light_s1=審判光束.gif / light_s2=持續神聖光芒.gif / burst_light=金色閃光炸開.gif;幻 omni_s1=彩色星星.gif / omni_s2=星空祝福.gif / burst_omni=萬鏡映虛獄.gif。切勿再用通用 s1/s2(=火雨/集中線)或 _wbPlayBurstAnimation(寫死火龍王)。',
      '★ v4.30.0【三龍王 AI 與 dispatcher·world-boss.js】新增 _wbDark/Light/OmniBossS1/S2/Burst 共 9 個 AI 函式(比照海龍王/雷龍王範本:playSfx + _wbPlayFullscreenFx + doDmg 迴圈 + addStatus + log + _scheduleBossEnd);dispatcher _wbAdvBossS1/S2/Burst 三處各加暗/光/幻 3 分支(按中文名分流),不再落預設火龍王。爆發音效:暗 sfx-darkorb-burst、光 sfx-athena-burst、幻 sfx-fantasy,皆 +sfx-burst。',
      '★ v4.30.0【三龍王天賦引擎·world-boss.js + index.html】暗龍王每回合死亡宣告(BOSS 主行動 hook)+ 受光屬性+30%(_wbApplyBossDmgCap);光龍王每回合封印+爆發封印(seal+_burstSeal)+ 受暗屬性+30%;幻龍王三防禦被動(免疫異常/迴避+30%/受普攻-30%)沿用 v4.16.0 已在 index.html 引擎的實作。',
      '★ v4.30.0【版本與驗證】world-boss.js 續解凍(v4.29.0→v4.30.0);7 版本同步點 → v4.30.0(index.html + admin_panel.js + world-boss.js + game_changelog.js;hero_db.js 維持 v4.20.0、world-boss-ui.html 維持 v4.28.0 免重傳)。GAME_CHANGELOG 維持 20 筆(移除最舊 v4.13.3)。上傳順序:game_changelog.js → admin_panel.js → world-boss.js → index.html(最後)。',
    ],
  },
];
