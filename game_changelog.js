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
  // v3.15.93 — 課堂練習營(登入連線時邊等邊玩賺獎勵,不卡關)
  {
    ver: 'v3.15.93',
    date: '2026-06-23',
    brief: [
      '🎒【新增「課堂練習營」——登入連線時不再乾等!】大家同時登入時偶爾會卡一下,現在登入時會先出現<b>全螢幕的課堂練習營</b>,讓你<b>邊等邊玩、邊賺獎勵</b>。',
      '   ・選一個題庫開始答題(有答題音效、答對題數,玩法和知識王一樣)。答對 1 題 <b>+10 知識幣</b>,<b>答錯不扣分</b>。',
      '   ・累積<b>答對 30 題</b>可得 <b>🔮 召喚水晶 ×1</b>(畫面有計量條,看得到進度)。',
      '   ・遊戲在背景默默幫你連線;一連好,上方就會通知「<b>✅ 可以進入遊戲</b>」,按下去就<b>帶著剛剛賺到的獎勵</b>進場囉!',
      '   ・(每天從練習營可賺的獎勵有上限:知識幣最多 1000、召喚水晶最多 3 顆。)',
    ],
    items: [
      '★ v3.15.93【練習營啟動/就緒掛點 index.html block#02】onAuthStateChanged 隱藏 login-gate 後立刻 window._campStart(user) 蓋全螢幕練習營(管理員 email 略過·不打斷 GM 測試);背景照常 await window.gameCloudLoad(uid),完成後 window._campGameReady=true + _campMarkReady() 通知頂端可進入。★純覆蓋層:不改動真正登入/載入流程,練習營任何例外都 try-catch 不影響進遊戲。',
      '★ v3.15.93【練習營模組 block#05】_campStart/_campBuildShell(全螢幕外框:頂端橫幅+統計列+水晶計量條+內容區·全內聯樣式)/_campShowSubjectScreen(_kingGetSubjects+_kingGetReviewSubjects 去重列題庫+🎲隨機)/_campPickSubject(首次手勢→bgmFadeTo bgm-king-challenge 播 BGM→_kingDrawQuestions 抽 50 題·用完 _campLoadDeck 重抽無限練)/_campShowQuestion(知識王式選項·data-idx 綁定避免題目文字進 onclick)/_campAnswer(answer 字母→索引判對·答對 sfx-quiz-correct+10 幣、答錯 sfx-quiz-wrong 不扣·1.15s 下一題)。',
      '★ v3.15.93【獎勵記帳/結算】localStorage lxps_camp_bank_{日期}={dailyCorrect,settledCoins,settledCrystals}(登入前無 uid 只能存本地);_campEarnedFor 由今日答對數推導應得(知識幣=對數×10 上限 1000·水晶=floor(對數/30) 上限 3);_campEnterGame→_campSettleBank 算 target-settled 差額·經 window._fbCompensatePlayer(coins coinsMode add + backpack summon_crystal·走帳本)idempotent 入帳·成功才推進 settled(失敗保留待下次);沒按進入則留待下次登入結算。停輪詢+bgmEnsureSceneBgm 回場景+移除覆蓋層+入帳 toast。',
      '★ v3.15.93【防刷/安全】每日上限(知識幣 1000/水晶 3)為防刷天花板(登入前身分為裝置暫時態·獎勵存本地·上限即邊界);★不寫本週小博士排行榜(練習營答對不計入·避免榜單 farming·也因登入前無法可靠寫雲端);結算走 _fbCompensatePlayer 帳本→老師可稽核。rescue 說明彈窗加「_camp-overlay 在場則跳過」防疊加。window._CAMP_ENABLED 可全域關閉。',
      '★ v3.15.93【版本鏈】本輪只改 index.html + game_changelog.js(A 段)。版本同步點 _GAME_LOADED_VERSION + _vers[index.html / game_changelog.js] 全 v3.15.92→v3.15.93;admin_panel.js(v3.15.90)/hero_db.js(v3.15.89)/world-boss*/arena.js/adv_quiz_db.js/sw.js(B 段秒開另回合)未改。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.72)。',
    ],
  },
  // v3.15.92 — 知識王今日挑戰「換科目」上限10次 + 題庫輪播不重複
  {
    ver: 'v3.15.92',
    date: '2026-06-23',
    brief: [
      '🎲【知識王今日挑戰「換科目」大升級】「🎲 換科目」的可重抽次數從 <b>3 次提高到 10 次</b>,想換到喜歡的題庫更有彈性!',
      '   ・而且每次換科目都<b>保證換到不同的題庫</b>,不會一直抽到同一個;要等<b>所有題庫都出現過一輪</b>,才會再循環回第一個。',
      '   ・課堂複習(左)與一般科目(右)各自獨立輪播,各自都會把自己的題庫全部輪過才循環。',
    ],
    items: [
      '★ v3.15.92【知識王換科目改題庫輪播 index.html】_kingRerollSubject 上限 3→10;改用「洗牌副牌」輪播取代原本「隨機排除前一個」:_kingShuffleArr(Fisher-Yates) 把 _kingGetSubjects()/_kingGetReviewSubjects() 各洗成一副牌(_kingBuildSubjectDecks)、指標逐次前進(_kingDeckAdvance·% 回繞=走完整副牌回到第一個)、_kingDeckCurrentSubject/_kingDeckCurrentReviewSubject 取當前題庫;保證一輪內不重複,全部出現過才回第一個。',
      '★ v3.15.92【兩池獨立輪播】左半課堂複習 + 右半一般科目各自一副牌、各自在自己長度循環(各自保證全部出現過才循環);換科目時兩副牌同步各前進一格(共用 10 次上限)。',
      '★ v3.15.92【UI/初始】_kingShowStartPopup 開彈窗(!isResume)時洗牌建副牌、當前題庫取第一張、_rerollLeft 改 10-_rerollCount;規則文案改「可以重抽 10 次(每次都換不同題庫,全部出現過才會再循環)」;deck 為純執行期狀態,不進雲端存檔白名單(開彈窗即重洗,不影響存檔/不污染雲端)。',
      '★ v3.15.92【版本鏈】本輪只改 index.html + game_changelog.js。版本同步點 _GAME_LOADED_VERSION + _vers[index.html / game_changelog.js] 全 v3.15.91→v3.15.92;admin_panel.js(v3.15.90)/hero_db.js(v3.15.89)/world-boss*/arena.js/adv_quiz_db.js/sw.js(CURRENT_BOOT_VER 不動)未改。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.71)。',
    ],
  },
  // v3.15.91 — 登入到關卡頁自動說明「帳號救援申請」怎麼用(可選以後不再顯示)
  {
    ver: 'v3.15.91',
    date: '2026-06-23',
    brief: [
      '📨【登入會自動教你「帳號救援申請」怎麼用】登入進到關卡頁時,會自動跳出一個小說明,告訴你下方「📨 帳號救援申請」按鈕的用途和使用步驟。',
      '   ・說明裡有完整 4 步驟:① 點下方「📨 帳號救援申請」② 勾選不見的東西 ③ 送出 ④ 老師核對遊戲記錄後補回;也提醒每天最多申請 1 次。',
      '   ・看完覺得懂了,可以勾「以後不要再顯示」,之後登入就不會再自動跳出來(沒勾的話下次登入還會再提醒一次)。',
    ],
    items: [
      '★ v3.15.91【關卡頁登入說明彈窗 index.html】新增 window._showRescueGuidePopup(force):說明「📨 帳號救援申請」用途 + 4 步驟使用方式 + 每日上限 1 次提醒;底部「我知道了」+「以後不要再顯示」勾選框,勾選後寫 per-uid localStorage(lxps_rescue_guide_dismissed_{uid})→ 該帳號不再自動彈;點背景關閉等同「我知道了」(會尊重勾選)。',
      '★ v3.15.91【觸發點 index.html block#02】掛在 onAuthStateChanged 登入流程「續戰檢查(800ms)」之後,延 2500ms 呼叫 _showRescueGuidePopup(false);自動觸發時:① per-uid localStorage 已勾不再顯示則跳過 ② 偵測到續戰提示(adv-wb-crash-notice / adv-crash-recovery-box)開著時跳過不疊加 ③ 已開著同彈窗則跳過。',
      '★ v3.15.91【per-uid 守門】不再顯示旗標用 uid 區隔(共用平板上每位學生各自記錄,A 勾不再顯示不影響 B);未勾則每次登入仍提醒,直到學生主動勾選(呼應老師需求)。',
      '★ v3.15.91【版本鏈】本輪只改 index.html + game_changelog.js。版本同步點 _GAME_LOADED_VERSION + _vers[index.html / game_changelog.js] 全 v3.15.90→v3.15.91;admin_panel.js(v3.15.90)/hero_db.js(v3.15.89)/world-boss*/arena.js/adv_quiz_db.js/sw.js(CURRENT_BOOT_VER 不動)未改。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.70)。',
    ],
  },
  // v3.15.90 — 帳號救援申請(學生自助向老師申請補回遺失資料 + 同步雲端旁新增鈕)
  {
    ver: 'v3.15.90',
    date: '2026-06-23',
    brief: [
      '📨【資料不見了?可以自己申請救援!】關卡頁下方「☁ 立即同步雲端」旁邊,新增一顆「📨 帳號救援申請」按鈕。',
      '   ・點開會先說明:雲端系統會<b>先查詢你的遊戲記錄核對</b>,確認真的是「雲端同步失敗」造成的損失,才會把資料修復還給你,請耐心等老師處理。',
      '   ・接著勾選你覺得不見的東西:🦸 英雄、💎 台灣/龍王至寶、🔮 召喚水晶、🎫 召喚卷、💰 知識幣、🏆 排名獎勵,送出申請(每天最多 1 次)。',
      '   ・送出後系統會自動幫老師整理你的遊戲記錄;老師核對「你說缺的」哪些<b>真的有少</b>、哪些其實還在,確認後才補回。',
      '   ・補回只會「<b>只增不減</b>」——你練到的英雄/至寶等級、現有的水晶幣都不會被蓋掉或變少,也會避免重複補太多。',
      '✅ 這套救援沿用先前的資料修復強化,把「申請 → 核對 → 補回」做成正式流程,遇到同步問題時更安心。',
    ],
    items: [
      '★ v3.15.90【關卡頁新增救援申請鈕 index.html】底部工具列(超商列下方)由「☁ 立即同步雲端 / 🐛 BUG 回報 / 📚 遊戲指引」三鈕擴為四鈕,新增「📨 帳號救援申請」(_openRescueReq);四鈕 flex:1 均分、字級沿用 clamp(14,1.7vw,21)。',
      '★ v3.15.90【學生端救援流程 index.html】_openRescueReq:登入檢查 → 讀 accountRescueRequests/{uid} 做每日上限(_getTodayKeyTW;今日已申請則提示等候)→ 彈核對說明(老師指定原文「雲端系統會先查詢小英雄的遊戲記錄進行核對,當確認是雲端同步失敗導致的損失會修復還給您,請耐心等候,謝謝!」)→ 勾選 6 類(英雄/至寶/召喚水晶/召喚卷/知識幣/排名獎勵)→ 送出時客戶端跑一次 _fbRebuildAccountFromLedgers(自己 uid) 產初判摘要 selfCheck(僅供老師一覽參考)→ 寫申請。全程內聯樣式、動態注入(沿用特別挑戰題模式)。',
      '★ v3.15.90【Firestore helper index.html block#02】新增 _fbSubmitAccountRescueRequest / _fbGetMyAccountRescueRequest(學生)、_fbListAccountRescueRequests / _fbResolveAccountRescueRequest(GM);接在帳號轉移 cluster 後。',
      '★ v3.15.90【GM 審核區 admin_panel.js】新增「📨 帳號救援申請審核」卡(🚑 資料救援與重置群組):list 待處理 → 開申請時自動跑 _fbRebuildAccountFromLedgers(uid) 對照學生勾選逐項標 ✅符合/❌不符合/⏳待判斷(召喚卷/排名獎勵無帳本由 GM 人工以「學生補償工具」處理)→ 顯示「將補回 英雄(名+等級)/至寶(名+等級)/水晶/幣」→「✅ 確認救援」走 _fbApplyAccountRebuild(只增不減+套用前讀當下 max-merge 避免過量)後標 resolved /「✖ 駁回」標 rejected。三點同步(SIDEBAR_ITEMS+SIDEBAR_GROUPS+卡片+_initRescueReqSection IIFE);_esc 跳脫;無 ?.',
      '★ v3.15.90【安全】補償一律由 GM 端從雲端帳本權威反推,完全不採信學生寫入的 claims/selfCheck(只當參考)→ 玩家無法藉偽造刷資源;sustained 沿用 v3.15.76 heroLevels 幻影免疫,救援後重整不再誤判倒退。',
      '★ v3.15.90【新 Firestore 規則】新增 match /accountRescueRequests/{uid}(create 限本人 pending+白名單+不塞 GM 欄位、list/GM 欄位限 GM、delete 限 GM),比照 accountTransferRequests 安全模型。⚠ 老師需手動部署 firestore.rules,否則申請寫入被預設 deny 擋下(client 端會 catch 提示「救援系統尚未啟用」,不影響遊戲)。',
      '★ v3.15.90【版本鏈】本輪改 index.html + admin_panel.js + game_changelog.js + firestore.rules。版本同步點:_GAME_LOADED_VERSION + _vers[index.html / admin_panel.js / game_changelog.js] 全 v3.15.89→v3.15.90;ADMIN_PANEL_VERSION v3.15.85→v3.15.90。hero_db.js(v3.15.89)/world-boss*/arena.js/adv_quiz_db.js/sw.js(CURRENT_BOOT_VER 不動)未改。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.69)。',
    ],
  },
  // v3.15.89 — 英雄強化教學 + 條件搜尋大升級(效果標籤校正 + 新增條件 + 補滿92隻)
  {
    ver: 'v3.15.89',
    date: '2026-06-22',
    brief: [
      '📘【英雄強化教學上線!】點英雄看「詳情」時,新增一段<b>強化教學</b>互動導覽,帶你認識把英雄練強的六大方法:⬆ 升等(吃經驗書)、💪 加素質點、💎 裝備台灣至寶、🌟 天賦、📚 技能升級、🔥 極限爆發。詳情頁六角圖上方也多了「📘 強化教學」按鈕,隨時可重看。',
      '🔍【條件搜尋大升級!新增多種條件】條件搜尋可勾選的效果變更多了!新增:<b>素質提升、受傷增加(讓敵人變脆)、造成傷害增加、追擊、模仿、封印天賦</b>,並把<b>七大屬性傷害</b>(🔥火 / 💧水 / 🪽風 / 🌿草 / 🪨土 / ⭐光 / 🌙暗)獨立成一組,想找特定屬性的打手或特定功能的角色更精準!',
      '🛠【效果標籤全面校正 + 補滿 92 隻】重新校對全部 92 隻英雄的技能效果標籤,修正先前自動產生的誤標(例如把「免疫暈眩」誤判成「會造成暈眩」之類),並補上先前漏掉的<b>刺客、法老王、埃及豔后</b>。現在條件搜尋完整涵蓋全部 92 隻英雄!',
    ],
    items: [
      '★ v3.15.89【英雄強化教學 HUT・index.html】新增 HUT 互動導覽模組(HUT_STEPS 6 步,對應 _renderHeroDetail 六個錨點 _hut-anchor-level/stats/treasure/talent/skills/burst);英雄詳情頁六角圖上方加「📘 強化教學」鈕(_hutOpenManual),首次開啟英雄詳情自動提示(_hutShowEntryPrompt);_hutShowStep/_hutShowFinal 逐步高亮+說明;完成旗標 window._heroUpgradeTutDone 隨雲端存檔(_buildSafeData/_applySafeData 白名單)。遊戲指引「英雄養成」章補各素質點(攻擊/特技/速度/HP/防禦)效果說明。',
      '★ v3.15.89【條件搜尋:新增條件・hero_db.js + index.html】SKILL_EFFECT_DEFS 由 4 組改 5 組:新增 E「屬性傷害類」(火/水/風/草/土/光/暗 7 種,對齊 ELEMENT_DB 7 屬性,雷歸風);A 組加 素質提升、造成傷害增加;B 組加 封印天賦、受傷增加、追擊、模仿。index.html openCondSearch 彈窗渲染陣列 [A..D]→[A..E](E 色 #c9a0ff),比對邏輯資料驅動不變。',
      '★ v3.15.89【條件搜尋:標籤校正・hero_db.js】HERO_SKILL_EFFECTS 全 92 隻逐隻校對,移除自動掃描的誤標(雅典娜免疫暈眩/麻痺/冰凍/睡眠被誤判成施放、守衛「封印時無效」被誤判成會封印技能、美人魚解燃燒被誤判成施放燃燒、幽幽屬性減免被誤判成屬性攻擊、我的豚豚降被攻擊率被誤判成提高被攻擊率…等數十處),並補上漏標效果。屬性標籤改以技能實際元素(SKILL_FORCE_ELEMENT / 描述)為準(陰陽師補火水風土四屬、美人魚移除誤判火、暗法師無強制元素故不標)。',
      '★ v3.15.89【補滿 92 隻 + 學者改類・hero_db.js】HERO_PRIMARY_CLASS 與 HERO_SKILL_EFFECTS 補上先前漏列的 刺客(主傷害)、法老王(主傷害)、埃及豔后(主控場),兩表皆 89→92(與 _PLAYER_HERO_NAMES 聯集對齊全 92 隻);學者主分類 主控場→主傷害。',
      '★ v3.15.89【版本鏈】4 GAME 同步點 v3.15.88→v3.15.89(_GAME_LOADED_VERSION / _vers[index.html] / _vers[hero_db.js] / _vers[game_changelog.js])。admin_panel.js v3.15.85 / world-boss.js v3.15.86 / world-boss-ui.html v3.15.87 / main.css v3.15.79 / adv_quiz_db.js 20260620 不變。本輪改 index.html + hero_db.js + game_changelog.js 三檔(index.html 最後上傳)。GAME_CHANGELOG trim 至 20(移除最舊 v3.15.68)。',
    ],
  },
  // v3.15.88 — 篩選分類重定義(單一主分類)+ 新增條件搜尋
  {
    ver: 'v3.15.88',
    date: '2026-06-22',
    brief: [
      '🔍【篩選分類改版】英雄圖鑑與編組的篩選分類全面改版!原本的「傷害/回復/控場坦克」改為<b>五大主分類</b>:⚔ 主傷害、💚 主回復、🌀 主控場、🛡 主坦克、🎲 其他。每隻英雄會歸到<b>最符合的單一主類</b>(坦克型獨立出來,不再和控場混在一起),分類更清楚。',
      '🔍【全新「條件搜尋」】篩選列新增「🔍 條件搜尋」按鈕,點開後可<b>勾選想要的技能效果</b>(例如:護盾、復活、暈眩、燃燒、封印、吸血、再行動、減傷…等數十種),按「搜尋」就會列出<b>同時具備全部所選效果</b>的英雄,配隊找特定功能的角色超方便!',
    ],
  },
  // v3.15.86 — 龍王至寶獲得管道擴充(未收錄至寶納入8龍王)+ 重複轉換統一5
  {
    ver: 'v3.15.86',
    date: '2026-06-22',
    brief: [
      '🐉【龍王至寶更好收集 + 重複統一轉卷軸×5】世界 BOSS <b>排名獎勵</b>的「未收錄至寶」現在也會<b>隨機給出 8 種龍王至寶</b>(原本只給台灣 10 件);<b>自選至寶召喚卷</b>一樣可挑龍王至寶。<b>重複拿到</b>(已收齊)時統一改贈「<b>至寶經驗卷軸 ×5</b>」,不會白白浪費!',
    ],
    items: [
      '★ v3.15.86【甲:未收錄至寶納入 8 龍王至寶】排名獎勵「未收錄至寶」隨機池(index.html _treasureResult)原本用 noSummon 過濾排除全部 8 龍王至寶 → 移除過濾,讓 8 龍王至寶(皆 mythic 神話級)納入隨機池。上榜玩家的「未收錄至寶」可隨機獲得任一尚未擁有的龍王至寶(不再只限當週 BOSS 對應的那一隻)。',
      '★ v3.15.86【乙:重複轉換統一 5 張】三處對齊為「重複 / 全收齊 → 至寶經驗卷軸 ×5」:① 排名「未收錄至寶」全部收齊(含龍王)原本不發 → 改發 ×5 ② world-boss.js 該場 BOSS 龍王至寶(_wbGrantDragonTreasure)重複 3→5 ③ 自選 / 隨機至寶券全收齊本就 ×5(未改,確認一致)。',
      '★ v3.15.86【補償一致 + 顯示】補償重發的隨機未收錄至寶 fallback 同步納入龍王至寶(與主獎勵池一致);世界 BOSS 結算第二幕「全擁有」訊息補上「改贈 至寶經驗卷軸 ×5」。',
      '★ v3.15.86【安全】只動「未收錄至寶」候選池與全擁有 fallback、龍王至寶重複卷軸數;排名分級的 expScrollTreasure(5/3/2/1/1 名次卷軸獎勵)、龍王至寶機率 / 該場 BOSS 對應、星空召喚維持龍王 noSummon(抽不到)全不動。龍王至寶為 mythic,納入後高名次玩家會在 mythic 層較易抽到龍王至寶(老師確認的 buff)。',
      '★ v3.15.86【版本鏈】3 GAME 同步點 v3.15.85→v3.15.86(_GAME_LOADED_VERSION / _vers[index.html] / _vers[game_changelog.js]);_vers[world-boss.js] v3.15.51→v3.15.86(本輪改 world-boss.js)。admin_panel.js v3.15.85 / hero_db.js v3.15.78 / main.css v3.15.79 / world-boss-ui.html v3.15.69 不變。本輪改 index.html + world-boss.js + game_changelog.js 三檔。GAME_CHANGELOG trim 至 20(移除最舊 v3.15.66)。',
    ],
  },
  // v3.15.85 — 甲案資料救援統整 + 復原顯示新增英雄/至寶(名+等級)
  {
    ver: 'v3.15.85',
    date: '2026-06-22',
    brief: [
      '🛠️【老師後台:資料救援工具整理 + 復原看得到補回了什麼】把後台「資料救援與重置」整理得更清楚:<b>移除一個過時工具</b>、其餘三個各加<b>「使用時機」說明</b>讓老師一眼知道該用哪個。另外老師幫你復原資料時,現在會<b>清楚列出「這次補回了哪些角色、哪些至寶、各是幾等」</b>,確保補回的就是你原本擁有的。',
    ],
    items: [
      '★ v3.15.85【甲案統整:退役「🚑 玩家資料急救工具」】此工具針對 2026-04 一個早已修好的舊 bug、且用最費工的「手動填數量」,功能已被「🔧 一鍵帳號重建」(自動反推)+「🎁 學生補償工具」(手動補發)完全覆蓋 → 從側欄與「資料救援與重置」群組移除(卡片與 init 程式保留但不再顯示)。資料救援與重置由 4 個精簡為 3 個。',
      '★ v3.15.85【三救援工具加「使用時機」導引】🆘 Lv1 救援(整個帳號變回 Lv1 / 被本地汙染覆蓋·某槽完整 → 整槽複製)、🔧 一鍵帳號重建(部分英雄/水晶/幣不見了·只補缺漏不動現有·最安全·首選)、⚠️ 完全重置(最後手段·被別帳號汙染加法救不回·清空不可逆),三卡頂各加一句明確分流。',
      '★ v3.15.85【需求2:一鍵重建顯示「將補回英雄/至寶 + 等級」】index.html _fbRebuildAccountFromLedgers diff 新增 missingHeroDetail(缺漏英雄附等級·讀合併後 heroLevels=學生原本練到的等級)+ missingTreasures(解鎖紀錄有但三槽全失的至寶·id/name/lv·排除 GM admin_delete)+ payload.treasures(經 _fbCompensatePlayer union 補回·新的給 Lv1)。admin_panel.js 分析結果以晶片列「🦸 將補回英雄 N 隻(名+Lv)」「💎 將補回至寶 M 件(名+Lv)」;套用後再列「本次補回」摘要(英雄+Lv/至寶+Lv/水晶+/幣+)供老師與學生核對是否符合預期。',
      '★ v3.15.85【需求2:Lv1 救援三槽診斷顯示每槽英雄/至寶】三槽深度掃描時,每槽除原本的「解鎖數/最高 Lv/等級總和」,再列該槽英雄(名+等級·依等級排序)與至寶(名+等級),讓老師選還原來源前就看清楚每槽內容是否為學生預期(讀 _fbDiagnoseAllSlots 已回傳的 rawData,未改後端)。',
      '★ v3.15.85【安全】退役工具僅移出側欄,後端救援邏輯與既有補償/重建/重置/誤刪救回不受影響;一鍵重建補至寶走既有 _fbCompensatePlayer(union 只補不減,既有至寶不動,新補給 Lv1)。',
      '★ v3.15.85【版本鏈】4 GAME 同步點 v3.15.84→v3.15.85;_vers[index.html]/[game_changelog.js]/_GAME_LOADED_VERSION + admin_panel.js ADMIN_PANEL_VERSION/_vers[admin_panel.js] 同步 v3.15.85。hero_db.js v3.15.78、main.css v3.15.79、world-boss.js v3.15.51、world-boss-ui.html v3.15.69 不變。本輪改 index.html + admin_panel.js + game_changelog.js 三檔。GAME_CHANGELOG trim 至 20(移除最舊 v3.15.65)。',
    ],
  },
  // v3.15.84 — GM「英雄誤刪救回」一鍵掃描+復原(排除 GM 手動刪除的)
  {
    ver: 'v3.15.84',
    date: '2026-06-22',
    brief: [
      '🛟【老師後台新增「英雄誤刪救回」工具】老師現在可以在後台<b>一鍵掃描</b>所有玩家,找出先前被誤刪的角色(你練過、或裝過至寶的主力),再<b>一鍵幫你補回來</b>。如果你之前有角色不見了,跟老師說一聲,老師按一下就能救回,<b>等級和身上的至寶都會原樣保留</b>。',
    ],
    items: [
      '★ v3.15.84【GM 後端 4 函式】index.html block#02:_computeDeletedHeroesFromDoc(從一份玩家雲端資料算出「被誤刪、可救回」的英雄=heroLevels 等級>1 或 身上裝著至寶 equippedTo·但不在 unlockedHeroes·且在 _PLAYER_HERO_NAMES 白名單·且最近一筆解鎖紀錄不是 admin_delete)、_fbAdminScanDeletedHeroes(getDocs 全體玩家逐一算,回受影響清單依英雄數降序)、_fbAdminRestoreDeletedHeroesForUid(getDocFromServer 重讀重算再復原)、_fbAdminRestoreAllDeletedHeroes(逐一 await 復原回統計)。',
      '★ v3.15.84【復原走 _fbCompensatePlayer】只帶 unlockedHeroes → union 把英雄加回(不重複)、heroLevels 取較大值(絕不重置/降級既有等級)、主檔+live+safe 三槽同寫、_adminForceRestore 繞健康度守門、記 compensation 解鎖歷史、不誤發補償彈窗給玩家。玩家下次登入即生效。',
      '★ v3.15.84【★ 排除 GM 手動刪除(老師要求)】最近一筆解鎖紀錄 source 為 admin_delete(GM 在「汙染清查」手動刪掉的)的英雄一律不列入、不救回,避免把刻意刪除的汙染角色又加回來。',
      '★ v3.15.84【GM UI:🛟 英雄誤刪救回卡】admin_panel.js「🧹 帳號汙染處理」群組(洗錢查緝卡下方):「🔍 掃描全體玩家」列出每位受影響玩家(uid/email/暱稱 + 被誤刪英雄晶片含 Lv·裝至寶標💎)→ 逐位「🛟 復原這位玩家」或頂部「🛟 全部一鍵救回」。三點同步(SIDEBAR_ITEMS+SIDEBAR_GROUPS+卡片 HTML+_initDeletedHeroSection IIFE);_esc HTML 跳脫、confirm 後執行、無 ?.。',
      '★ v3.15.84【定位】鏡像 v3.15.82/83 玩家登入時 client 端救回邏輯的「server 主動批次版」:讓老師不必等學生逐一登入,即可一次把雲端被誤刪的英雄批次補齊。安全:只救/列白名單英雄、排除 admin_delete、復原為 union 加回(只增不減),跨帳號防護不變。',
      '★ v3.15.84【版本鏈】4 GAME 同步點 v3.15.83→v3.15.84;_vers[index.html]/[game_changelog.js]/_GAME_LOADED_VERSION 同步 v3.15.84;admin_panel.js ADMIN_PANEL_VERSION 與 _vers[admin_panel.js] 同步 v3.15.80→v3.15.84。hero_db.js v3.15.78、main.css v3.15.79、world-boss.js v3.15.51、world-boss-ui.html v3.15.69 不變。本輪改 index.html + admin_panel.js + game_changelog.js 三檔。GAME_CHANGELOG trim 至 20(移除最舊 v3.15.64)。',
    ],
  },
  // v3.15.83 — 資料救回再強化:自己解鎖/投資過的角色與污染相同時算已解鎖
  {
    ver: 'v3.15.83',
    date: '2026-06-22',
    brief: [
      '🛟【資料救回再強化】承接上一版的英雄救回,依老師指示再加強——只要是你<b>自己練過、或身上裝了至寶</b>的角色,就算在共用平板上和別人重複(系統紀錄的最近一次解鎖剛好是別人),系統<b>都會正確認定那是你自己的角色、算「已解鎖」,絕不會誤判成別人的污染而刪掉</b>。',
    ],
    items: [
      '★ v3.15.83【依老師指示:自己解鎖的角色/至寶若跟污染相同,要算已解鎖、不可誤判為汙染】承 v3.15.82,_applySafeData 把「本地英雄是否保留」的判定順序改為「投資證據 / 本人解鎖紀錄」優先於「最近一筆解鎖紀錄標別帳號 uid」。',
      '★ v3.15.83【投資證據 = 練過 或 身上裝著至寶】_heroInvested82(n)= heroLevels 等級>1(雲端∪本地)或 身上裝著至寶(equippedTo,來源:雲端 taiwanTreasureData / 字串版 taiwanTreasureData_s / 本地 lxps_taiwan_treasures 三者聯集)。有投資證據 → 一定是學生自己的資源 → 保留,即使最近一筆解鎖紀錄標別帳號(共用機上同一隻常見英雄最近一筆常是別人解鎖的)。',
      '★ v3.15.83【本人解鎖紀錄看「全部」非「最近一筆」】_hasOwnUnlockRec82(n) 掃整份解鎖紀錄(雲端∪本地),只要有任一筆是「本人 curUid 或無 uid 舊資料」且非 admin_delete → 學生自己解鎖過 → 保留(修正舊版只看 _latestRec 最近一筆、被同機後來者覆蓋而誤殺)。',
      '★ v3.15.83【幻影救回同步擴充】分支前幻影救回(救援/同 uid/別人殘留/GM 三槽修復皆受惠)候選由「heroLevels 等級>1」擴為「heroLevels>1 ∪ 身上裝著至寶」,且移除 uid 擋(有投資證據即本帳號),只擋 GM admin_delete。',
      '★ v3.15.83【安全 / 跨帳號防護不變】GM admin_delete(刪除永久)仍最高優先丟;只救/保留 _PLAYER_HERO_NAMES 白名單英雄。跨帳號汙染防護仍靠既有三層(本機命名空間 @@<uid> + 裝置擁有者對齊 + gameCloudLoad 鎖 _gUserId);本版只放寬「同一帳號內被誤判為污染」的情形、未放寬跨帳號讀取,故「讀不到別人的角色」不變。',
      '★ v3.15.83【版本鏈】4 GAME 同步點 v3.15.82→v3.15.83;_vers[index.html]/[game_changelog.js]/_GAME_LOADED_VERSION 同步 v3.15.83。hero_db.js v3.15.78、main.css v3.15.79、admin_panel.js v3.15.80、world-boss.js v3.15.51、world-boss-ui.html v3.15.69 不變。本輪只改 index.html + game_changelog.js。GAME_CHANGELOG trim 至 20(移除最舊 v3.15.63)。',
    ],
  },
];
