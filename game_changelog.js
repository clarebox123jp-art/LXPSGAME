// ════════════════════════════════════════════════════════════════════════
//  game_changelog.js  —  LXPSGAME 更新日誌
//  最後更新:2026-06-20  / 目前主程式版本:v3.15.64(新增學生設計英雄「拘留者」5年1班彭經宸;召喚卷面板補至寶/自選至寶按鈕;修登入誤跳污染彈窗)
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
  // v3.15.64(2026-06-20)— 🤖 新英雄 拘留者 + 🎟 召喚卷補至寶按鈕 + 🔧 修登入誤跳彈窗
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.64',
    date: '2026-06-20',
    brief: [
      '🤖【新英雄登場:拘留者!】',
      '   ・<b>5 年 1 班 彭同學</b>設計的<b>時空執法機械人</b>(SSR,⚔傷害+🛡控場)!可在召喚星空抽到。',
      '   ・<b>S1 空間果實</b>(被動):受到直接攻擊時<b>扭曲時空閃避</b>,並把傷害<b>50% 反彈</b>給對手、<b>50% 治療自己</b>(每回合 1 次,需 4 能量)。',
      '   ・<b>S2 神刃之力</b>:對 1 名對手造成 (攻擊+特技)×250% 必中、無視有利的傷害,並使其陷入<b>「拘留」無法行動</b>(最多疊 2 層)!',
      '   ・<b>爆發 時空罰罪‧天手力</b>:<b>匯聚整場戰鬥累積的總傷害</b>(上限 2500),化為固定傷害由敵方全體分攤(單體上限 1250),必中、無視有利、不暴擊、不受屬性影響。',
      '   ・<b>天賦 時序回響</b>:使用神刃之力或爆發時,<b>30%</b>(隨天賦升級提高,最高 70%)機率<b>立即再造成一次相同傷害</b>。',
      '🎟【召喚星空補上「至寶召喚卷」按鈕】',
      '   ・「使用召喚卷」面板原本只有 SSR/SR 英雄券;現在<b>補上「隨機至寶召喚卷」與「自選至寶召喚卷」</b>兩個按鈕,和英雄券並排,可直接在這裡使用了!',
      '🔧【修復登入時誤跳的提示視窗】',
      '   ・修好<b>每次登入都會跳出「沒有正確讀取到遊戲記錄」</b>視窗的問題:原因是網路較慢、資料還沒讀完就被誤判,現在會<b>等資料真的讀取成功後才檢查</b>,正常情況不會再跳。',
    ],
    items: [
      '★ v3.15.64【新英雄 拘留者】hero_db.js 12 表(HERO_DB hp78/atk13/sp13/spd14;S1空間果實c4被動/S2神刃之力c7;BURST 時空罰罪‧天手力;TRAIT 時序回響;BURST_GIF 時空穿梭.gif+時空穿梭.mp3 dur450;AVATARS🤖;LORE/BIO/IMG/HEX/CATEGORIES/_TRAIT_LV_INFO)。index.html 邏輯層:execSkill/aiUseSkill 雙實作(神刃之力 (攻+特)×250% 必中無視有利+拘留疊2層+時序回響30%二次傷害)、空間果實 doDmg 頂部 hook(閃避+反彈50%+治療50%,需4能量/每回合1次,startTurn 重置 _spaceFruitUsedThisTurn)、execBurst 時空罰罪‧天手力(讀全場傷害累積器 G._detTotalDmg 上限2500→敵全體分攤·單體上限1250×_burstMult·fixedDmg)、新增「拘留」detain 狀態(BAD_STATUS/statusName/玩家+AI跳過行動/雅典娜免控/_CTRL/_CTRL_POPUP)、BURST/SKILL_UPGRADE_DEF、SUMMON_RARE_HEROES、STUDENT_DESIGNER_HEROES、sfx-detain-burst 音效。',
      '★ v3.15.64【召喚卷面板補至寶按鈕】index.html _openSummonTicketModal:在 SSR/SR 英雄券下方新增「💎 至寶召喚卷」分組(隨機 + 自選兩張卡,_treaCard helper),onclick 接既有 _useTreasureTicket()/_openTreasureTicketPickModal()(後端 v3.13.82/v3.15.56 早已完整,先前只缺從「使用召喚卷」入口進入,只能從背包點券進);主標題改「🎟 使用召喚卷」。',
      '★ v3.15.64【修登入誤跳污染彈窗】index.html _advCorruptionWatchdog 主 gate + 二次確認補 window._progressLoaded===true:_cloudLoadDone=true 只代表雲端流程跑完(含失敗),網路不穩讀取失敗時 _progressLoaded=false(空殼)被誤判成「污染」而在登入/載入畫面誤跳。改要求資料確實載入成功才判定(對齊全站 gameCloudSave 等 _progressLoaded 守門慣例),確保只在真正進入有資料的選關頁才可能彈窗。',
      '★ v3.15.64【版本鏈】4 GAME 同步點 v3.15.63→v3.15.64;_vers[index.html]/[hero_db.js]/[game_changelog.js] 同步。world-boss.js/world-boss-ui.html/adv_quiz_db.js/arena.js/admin_panel.js/sw.js 未改。本輪改 index.html＋hero_db.js＋game_changelog.js 三檔。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.44)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.63(2026-06-20)— ✨ 17 枚爆發技 GIF 特效更換 + 放大近全螢幕 + 只播 1 次
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.63',
    date: '2026-06-20',
    brief: [
      '✨【多個英雄的「爆發技」特效大改版!】',
      '   ・這次把<b>一整批爆發技的全螢幕動畫換成全新 GIF</b>,並且<b>放大到接近滿版全螢幕</b>、<b>只播放 1 次</b>(不再重複循環),施放時更有大招的震撼感。',
      '   ・更換清單(技能名稱不變,只換特效):<b>激戰之舞、神樂舞、天界彩繪、流浪者之歌、夢境時光、明鏡止水、魔尊覺醒、BUG 修復、三刀射擊、死亡怒火、神炎之翼、銀齒迴力鏢旋風、夢幻的茶會、火山之怒、深海大漩渦、萬鏡映虛獄</b>,以及世界 BOSS<b>風暴雷龍王</b>的爆發<b>雷神·萬雷殛世</b>。',
      '   ・其中<b>死亡怒火</b>(地獄將軍)以前沒有全螢幕大圖,這次<b>新增了爆炸煙霧特效</b>。',
      '   ・順手修好<b>激戰之舞、明鏡止水、夢境時光</b>三招因舊連結失效而看不到特效的問題,現在都正常顯示了。',
    ],
    items: [
      '★ v3.15.63【BURST_GIF_DB 16 換 + 1 新增】hero_db.js:激戰之舞→舞動音符(dur1830)、天界彩繪．毀滅與重生→大強化(910)、流浪者之歌→音樂舞動(1960)、夢境時光→泡泡升起(2800)、明鏡止水→漣漪(7620→2500 截斷)、魔尊覺醒→魔尊覺醒(1520)、BUG修復→數位代碼(1600)、三刀射擊→三道地裂(840)、神炎之翼→多火球射線(2470,移除 dead once:true)、銀齒迴力鏢旋風→龍捲風(360→1440 改 4 圈循環免眨眼)、夢幻的茶會→泡好一杯茶(800)、火山之怒→地火爆炸(910)、深海大漩渦!→漩渦(1500)、萬鏡映虛獄!→鑽石(3000)、雷神·萬雷殛世(風暴雷龍王,新增條目)→雷雨(1650);另新增 死亡怒火→爆炸煙霧2(2900,無 sfx 沿用 execBurst 火音效)。url 統一 raw.githubusercontent + encodeURIComponent;dur=單圈長度達成「只播1次」(GIF 皆 loop:0,_showBurstGif 不讀 once),scale 維持 1.6 近全螢幕。',
      '★ v3.15.63【神樂舞 inline overlay】index.html playSkillFX case「神樂舞」非走 BURST_GIF_DB,改 _kgImg.src 為「秋天楓葉飄落.gif」、移除 timeout 3600→3200(單圈長度),維持 scale1.6;不另加 BURST_GIF_DB 條目以免雙重播放。',
      '★ v3.15.63【順修壞連結】激戰之舞/明鏡止水/夢境時光 原 url 指向不存在的「-」repo(404),本次換新 gif 一併修復。深海大漩渦!/萬鏡映虛獄! 整塊錨定替換,未動到埃及豔后(尼羅河的詛咒)等其他技能對深海大漩渦.gif 的重用。',
      '★ v3.15.63【#17 已補 + 長度調整】雷神·萬雷殛世(風暴雷龍王 taifeng_wind_dragon,BURST_DB 在 world-boss.js,bd.n 經 _showBurstCinematic→_showBurstGif 命中新條目)補上 雷雨.gif(老師上傳,55 格 loop:0 單圈 1650ms,dur=1650);明鏡止水 漣漪 單圈 7.6s 過長→dur 截 2500;銀齒 龍捲風 單圈僅 360ms(4 格)會眨眼→dur 1440(4 圈循環,loop:0)維持視覺。',
      '★ v3.15.63【版本鏈】4 GAME 同步點 v3.15.62→v3.15.63;_vers[index.html]/[hero_db.js]/[game_changelog.js] 同步。world-boss.js v3.15.51、world-boss-ui.html v3.15.61、admin_panel.js v3.15.58、adv_quiz_db.js 20260620、arena.js v3.15.60 未改。本輪改 index.html＋hero_db.js＋game_changelog.js 三檔。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.43)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.62(2026-06-20)— ⚖ 比例傷害平衡:HP% 上限統一 Lv×20 + 瀕死技不再秒 BOSS/對手
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.62',
    date: '2026-06-20',
    brief: [
      '⚖️【英雄「按血量比例」的傷害,上限統一了】',
      '   ・有些技能會造成「對手血量百分比」的傷害(例如打對手目前 HP 的 20%)。這類傷害現在<b>全部統一一個上限:英雄等級 × 20</b>,讓高血量 BOSS 戰不會被某幾招無限滾雪球。',
      '   ・涉及技能:<b>神聖鎚擊、炸彈投擲 / 炸彈連續投擲、青炎爆破、雷鳴、捨命揮斬、支配鎖鍊、死亡宣告(對 BOSS)、主神奧汀的岡格尼爾、機械師的定時炸彈、幼兒園小孩的大聲啼哭</b>。多數是把舊的「等級×10」調成「等級×20」,等於<b>上限提高、可打更多</b>(捨命揮斬同時拿掉額外 +50,支配鎖鍊由「特技×倍率」改成更直覺的「等級×20」)。',
      '💀【「瀕死 / 秒殺」技,對 BOSS 與鬥技場對手不再「一招秒殺」】',
      '   ・<b>靈魂收割</b>(吸血鬼):打<b>小怪</b>維持「直接收割倒下」;但對 <b>BOSS、菁英、以及鬥技場對手</b>改成造成「當前 HP 20%(上限 等級×20)」傷害並回等量血,不再一招清場。',
      '   ・<b>惡鬼撲食</b>(幽幽):對<b>小怪</b>維持「打到剩一半血」;對 <b>BOSS</b> 的特技 300% 加上「等級×20」上限;在<b>鬥技場</b>改成「當前 HP 20%(上限 等級×20)」。',
      '   ・<b>天降雷罰</b>(天神宙斯):打<b>小怪</b>維持「全變 1 HP」;對 BOSS 的「當前 HP 25%」那段上限由 等級×15 提高到 <b>等級×20</b>(鬥技場對玩家仍沿用原本平衡縮減)。',
      '   ・<b>死亡宣告</b>(暗法師)對<b>小怪 / 鬥技場</b>維持「2 回合後剩 1 HP」不變,只有對 BOSS 的比例傷害上限跟著提高到 等級×20。',
      '🏅【GM 獎章挑戰提醒徽章變大、更明顯】',
      '   ・主選單獎章鍵上的「<b>新增獎章挑戰!</b>」提醒徽章<b>放大了一倍</b>,並修好之前被導覽列裁切、看不完整的問題。',
    ],
    items: [
      '★ v3.15.62【HP% 傷害上限統一 Lv×20】index.html execSkill＋aiUseSkill 雙路徑同步:神聖鎚擊(_maxDmg)、炸彈投擲/連投(_lvCap，S1/S2×玩家/AI 共 4 處)、青炎爆破(_azDmgCap)、雷鳴(_zmMaxDmg)、捨命揮斬(_hgExtraCap，去 +50)、支配鎖鍊(移除 _capMult/_spv 改 _hcHeroLv*20)、死亡宣告 BOSS 段(_maxDmgDM，Lv×10→Lv×20)、奧汀岡格尼爾(HP% 段 Math.min(...,Lv×20)，攻擊 300% 段不限)、機械師定時炸彈(5%maxHP 段 Math.min(...,Lv×20)，固定段不限)、大聲啼哭(加 _cryHeroLv*20)。戰鬥 log/註解 Lv×10→Lv×20。',
      '★ v3.15.62【瀕死/秒殺技 BOSS+PVP 改上限傷害】靈魂收割:玩家版 BOSS/菁英/死神段 cap Lv×10→Lv×20，新增「!_adventureMode(鬥技場)」分支=當前 HP 20% 上限 Lv×20+吸血同量(不秒殺)，小怪維持 curHp=0 處決;AI 版同款 BOSS/菁英/PVP 分支(原無條件 doDmg(curHp,piercing) 全處決)。惡鬼撲食(玩家+AI):BOSS 特技 300% 段加 Math.min(...,Lv×20)、新增 else if(_isArena)=當前 HP 20%/Lv×20、小怪維持剩 50%。天降雷罰:HP25% 段 _zrMaxHpDmg Lv×15→Lv×20(特技段不限、PVP 對玩家沿用 ×0.25、小怪維持 1HP)。死亡宣告小怪/PVP 剩 1HP 維持除外。',
      '★ v3.15.62【審判終結雙保險】judgmentEnd tick 的 BOSS 判定加 _isWorldBossTarget(t) OR 條件(belt-and-suspenders;BOSS_NAMES 已含 8 龍王，本次為未來防呆);鬥技場(!_adventureMode)同樣走 20% 上限不秒殺。',
      '★ v3.15.62【GM 獎章徽章 UI】_updateGmMedalW1Badge:徽章 font 11→22、padding/radius/top 放大;修 #adv-medal-btn 浮層被 #adv-bottom-nav .adv-nav-btn{overflow:hidden}(無 !important)裁切 → 對該鍵 inline overflow:visible + z-index 40(全達成時還原)。',
      '★ v3.15.62【圖鑑 fd 同步】hero_db.js 神聖鎚擊/死亡宣告/炸彈投擲·連投/青炎爆破/捨命揮斬/支配鎖鍊 的 d+fd 上限文字改 Lv×20(地獄將軍 L1835 dead fallback 暫留)。雷鳴/奧汀/定時炸彈/大聲啼哭 fd 本未列上限數字、無不一致。',
      '★ v3.15.62【版本鏈】4 GAME 同步點 v3.15.61→v3.15.62;_vers[index.html]/[game_changelog.js]/[hero_db.js(v3.15.60→v3.15.62)] 同步。world-boss-ui.html v3.15.61、adv_quiz_db.js 20260620、arena.js v3.15.60、world-boss.js v3.15.51、admin_panel.js v3.15.58 未改。本輪改 index.html＋hero_db.js＋game_changelog.js 三檔。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.42)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.61(2026-06-20)— 🏅 19 枚高階挑戰獎章 + 🧠 機關王題庫換新 + 🐉 龍王頁更新
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.61',
    date: '2026-06-20',
    brief: [
      '🏅【GM 加碼:19 枚高階挑戰獎章登場!】',
      '   ・老師特別追加了一整批<b>高難度成就獎章</b>,每解鎖 1 枚就送 <b>🔮 召喚水晶 ×5 + 💰 知識幣 +10,000</b>,超大獎勵等你來拿!',
      '   ・挑戰橫跨<b>英雄收集、台灣關、埃及關、黑暗球、鬥技場</b>各種高手關卡(例如:只用 SR 英雄通關、全程不帶寵物、一場把對手三隻一次清空…)。',
      '   ・主選單「<b>獎章</b>」鍵上會浮出「<b>新增獎章挑戰!</b>」標記;點進獎章頁會先跳出說明視窗,<b>已達成的會打勾 ✅</b>。看過可按「我知道了」或「今日不再顯示此視窗」,<b>全部達成後就不再出現</b>。',
      '   ・順手修好獎章頁<b>沒有顯示「埃及關 / 鬥技場」分類</b>的問題,現在這兩區的獎章都看得到了。',
      '🧠【世界機關王大賽:題庫煥然一新】',
      '   ・機關王關卡的題目全部換成<b>「簡單機械與 STEAM」</b>主題:斜面、槓桿、滑輪、齒輪、位能與動能、系統思考…邊打邊學超有料!',
      '🪲【聖甲蟲會逃跑了!】',
      '   ・埃及關的稀有「<b>聖甲蟲</b>」膽小又惜命——只要<b>撐到第 4 回合還沒被打倒,牠就會推著黃金糞球溜走</b>!想拿牠的大量獎勵就要速戰速決;不過讓牠成功逃走,也能解鎖「<b>聖蟲遁逃</b>」獎章喔。',
      '🐉【世界 BOSS 頁面更新:當前 & 下一隻龍王資訊修正】',
      '   ・世界 BOSS 大廳的「<b>當前龍王</b>」素質,以及「<b>下一隻龍王搶先看</b>」的名稱、立繪、屬性、能力介紹,全部改成<b>自動跟著實際龍王更新</b>,不會再顯示舊資料;點「能力詳細介紹」可看完整招式與天賦。',
    ],
    items: [
      '★ v3.15.61【世界機關王大賽題庫】adv_quiz_db.js ADV_QUIZ_GREENMECH(id 9601-9620,subject 世界機關王大賽)整批換成 STEAM 簡單機械題(斜面/槓桿/滑輪/齒輪/位能動能/系統思考);node --check PASS、20 題、無英文單引號。',
      '★ v3.15.61【19 枚高階獎章】index.html MEDAL_DEFS 新增 19 枚並全列入 _MEDAL_TOP_TIER(5💎+10000):英雄 ssr_unlock_20/40、first_ur_hero、shard_synth_first;台灣 tw_sr_only;埃及 egypt_sr_only/no_pet/4pets/kill_cleo_sealed/kill_self_charmed/both_talent_sealed/scorpion_ko/scarab_flee;黑暗球 darkorb_no_pet/r_only/all_clones;鬥技場 arena_kill_3/no_heal_win/2kill_3round。另 4 枚既有(unlock_xiaoli/kid/gm、arena_streak_5)升頂級。偵測 hook 分散於 _checkMedalHeroUnlock／_synthShardToPickTicket／doDmg 死亡集中 hook／Scorpion 即死／Scarab 逃跑／_checkEgyptClearMedal／_checkTaiwanWinMedals／黑暗球勝利分支／doHeal／_checkMedalArena;每枚 def=1 call=1 已稽核。',
      '★ v3.15.61【獎章頁顯示修正】_buildMedalPage cats 陣列補回漏列的「埃及關」「鬥技場」(原本該兩分類獎章完全不顯示)+ 對應類別圖示(🏟／🏜)。',
      '★ v3.15.61【聖甲蟲第 4 回合必逃】startTurn 仿寶箱怪框架:next.name===聖甲蟲 且 G.round>=4 → 從戰場 splice、curHp=0、不計擊倒/不給獎勵、_scarabFled 旗標、checkWin;逃走即解鎖 egypt_scarab_flee。聖甲蟲魔物圖鑑 lore 補逃跑警告。',
      '★ v3.15.61【GM 第一波獎章挑戰提醒 UI】index.html 新增 _GM_MEDAL_WAVE1(19 id)+ _gmMedalW1Stats／_updateGmMedalW1Badge(#adv-medal-btn 浮「新增獎章挑戰!」粉紅脈動徽章,全達成自動移除)／_gmMedalW1ShouldShowPopup／_showGmMedalW1Popup(進獎章頁彈視窗:列 19 枚打勾+進度+5💎+10000 強調;「我知道了」設 session 旗標、「今日不再顯示」寫 localStorage _gmMedalW1DismissDate=今日;全達成不再彈)。hook:openMedalPage 彈窗+刷新徽章、_unlockMedal earn 後刷新徽章、openAdventureOverlay 進關卡刷新徽章;CSS keyframe _gmMedalW1Pulse。',
      '★ v3.15.61【世界 BOSS 頁龍王資訊資料驅動】world-boss-ui.html:(a)當前龍王大廳卡素質(攻擊/特技/速度)由寫死火龍王 49/50/15 改 _wbApplyCurrentBossSkin 讀 HERO_DB[當前龍王](HP 統一 5,000,000 不動);(b)「下一隻龍王搶先看」整卡改資料驅動 _wbApplyNextBossPreview(依 _wbGetNextBossId 取輪替下一隻 → 名稱/立繪/屬性/素質/簡介=背景故事+自動護盾文案/主題色 + 能力詳細介紹鈕呼叫 _wbAdvOpenBossInfoPopup(nextId)),修正寫死土龍王過時文案(額外減傷 40%→實際 30% 等),輪替推進自動跟上。index.html 雲端當前龍王解析兩處 re-apply 加呼叫 _wbApplyNextBossPreview。',
      '★ v3.15.61【版本鏈】4 GAME 同步點 v3.15.60→v3.15.61;_vers[index.html]／[game_changelog.js] 同步 v3.15.61、[world-boss-ui.html] v3.15.50→v3.15.61、[adv_quiz_db.js] 20260612b→20260620。world-boss.js 維持 v3.15.51、hero_db.js v3.15.60、arena.js v3.15.60、admin_panel.js v3.15.58(均未改)。本輪改 index.html＋adv_quiz_db.js＋world-boss-ui.html＋game_changelog.js 四檔。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.41)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.60(2026-06-20)— ⚔ 主神奧汀大改 + 🐉 各龍王成就 + 🌑 黑暗球掉落
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.60',
    date: '2026-06-20',
    brief: [
      '⚔【主神奧汀 能力調整】',
      '   ・「<b>岡格尼爾的制裁</b>」改為消耗 7 能量,造成「攻擊 300% + 目標最大 HP 10%」傷害(對<b>魔王 / 龍王</b>改為 5%,避免一招打太兇)。',
      '   ・大絕「<b>諸神的黃昏</b>」主動版改版:先讓全隊降到剩 1 滴血,再以<b>全隊失去的 HP 總合 ×400%</b> 痛擊敵人——犧牲越多、爆發越強!(被動全滅復活版調整為最大 HP 總和 ×600%)',
      '   ・天賦「<b>奧汀之眼</b>」追加效果:奧汀<b>受到的所有傷害減少 30%</b>(天賦升級最高 50%),更能扛住前線。',
      '🐉【新獎章:迎戰各路龍王】',
      '   ・世界 BOSS 新增「<b>迎戰八大龍王</b>」系列獎章:挑戰火山炎、翠綠森、山岳地、風暴雷、深淵海、邪骨暗、神聖光、星辰幻龍王各一場(不論勝負)即可獲得;<b>集滿 8 隻</b>再拿下「八龍試煉」!',
      '🏟【新獎章:鬥技場 & 埃及關】',
      '   ・<b>鬥技場</b>新增成就:初登鬥技場、累積 10 / 30 / 50 勝、五連勝。',
      '   ・<b>埃及關</b>追加成就:累積通關 5 / 15 次、聖蟲獵手(累積擊敗聖甲蟲 3 次)。',
      '🌑【黑暗球掉落加碼】',
      '   ・挑戰「<b>黑暗球‧希望型態</b>」每場必得 <b>SSR 靈魂碎片 ×1~2</b>,還有機會掉落全新賣錢素材「<b>黑暗之晶核</b>」(可賣 5000 知識幣);超越極限果實掉落率也提高了!',
      '   ・魔物圖鑑的黑暗球頁面<b>補上完整掉落清單</b>,一眼看清能拿到什麼好東西。',
    ],
    items: [
      '★ v3.15.60【主神奧汀 S1 岡格尼爾的制裁】c:5→7;「攻擊300%(每升+5%)+ 目標最大HP%」之 HP% 由 20% 改 10%、對 BOSS(_zeusIsTrueBoss 權威清單)改 5%。execSkill(_s1HpPct)+ aiUseSkill(_s1HpPctO)雙路徑同步(鐵律1.128);走 doDmg → 世界 BOSS 5000cap 自動套用(鐵律1.31)。SKILL_UPGRADE_DEF label/註解同步 10%/BOSS5%。',
      '★ v3.15.60【主神奧汀 爆發 諸神的黃昏(老師裁示甲)】主動版重構:先將全隊存活友方降至 HP1,再以「全隊 4 槽失去 HP 總合(含倒下、含奧汀)×400%(每升+10%乘算 _burstMult)」對敵平分(必中無視有利);_sumLostHp = Σ max(0,maxHP-curHP)。被動全滅復活版倍率 ×10→×6(固定不隨等級)。BURST_UPGRADE_DEF rows 改主動 400/440/480/520/560% + 被動固定 600%。',
      '★ v3.15.60【主神奧汀 天賦 奧汀之眼 追加減傷】doDmg 新增減傷 hook:受到所有傷害減免 30%(每升 1 級 +5%,Lv5=50%,min(0.50,0.30+traitLv*0.05)),與 S2「英靈殿守望者」減傷分開乘算疊加(置於 reductions 區段,比照鋁合金暴龍/S2,% 減傷僅主流程)。hero_db.js desc/fd 只寫基礎 30%(鐵律1.160),逐級進 _TRAIT_LV_INFO。',
      '★ v3.15.60【獎章成就 +17 枚,全於 index.html MEDAL_DEFS(顯示用 MEDAL_DEFS,新 id 不與 world-boss.js WB_MEDALS 衝突,免動 world-boss.js)】鬥技場 5(arena_first_win/win_10/30/50/streak_5)+ 埃及 3(egypt_clears_5/15、egypt_scarab_3)+ 世界BOSS各龍王 9(wb_dragon_fire/forest/earth/thunder/sea/dark/light/illusion + wb_dragon_all 八龍試煉)。',
      '★ v3.15.60【獎章頒發 hook】鬥技場:arena.js 結算(result win/draw/loss)後呼叫主程式 window._checkMedalArena(累積勝場 winsLifetime 里程碑 + _medalStats.arenaWinStreak 連勝,平/敗歸零)。各龍王:WB 戰結算勝/敗兩路徑皆呼叫 window._checkMedalWbDragon(window._wbGetCurrentBoss().name)(參戰即計、不限排名;名→medalId 對照,集滿 8 隻補 wb_dragon_all)。埃及:_checkEgyptClearMedal 加 egyptClears 計數、聖甲蟲擊殺加 egyptScarabKills 計數。_medalStats 經 _saveMedals 存 adv_medal_stats 持久化。',
      '★ v3.15.60【黑暗球‧希望型態 掉落】_ssrShardDropCount 拆 darkorb(隨機 1~2)與 egypt(固定 2)兩 profile;黑暗球新增 25% 黑暗之晶核(id dark_crystal_core,🟣,sell_only sellPrice 5000,補 BACKPACK_ITEM_DEF + SHOP_SELL_ITEMS)、超越極限果實 8%→10%。MONSTER_DROPS 補「黑暗球‧希望型態」完整掉落列(原圖鑑只顯示基礎 EXP)。埃及雙王 SSR 碎片改固定 2。',
      '★ v3.15.60【碎片/自選券一致性稽核】全站確認 SSR 靈魂碎片合成需求 20 / SR 10(_SHARD_DEF 權威)與自選召喚卷說明一致(教學頁/道具/贈友/toast/圖鑑);修正教學頁「SSR 取得方法」鬥技商店價 40→30(對齊 ARENA_EXCHANGE_ITEMS arena_x_ssr_summon cost:30,v3.15.54 調價後漏改)。',
      '★ v3.15.60【版本鏈】4 GAME 同步點 v3.15.59→v3.15.60;_vers[index.html]/[game_changelog.js]/[hero_db.js] 同步 v3.15.60、[arena.js] v3.15.54→v3.15.60(含 ARENA_CONFIG.VERSION→v3.15.60)。world-boss.js 維持 v3.15.51(未改)、admin_panel.js v3.15.58、world-boss-ui.html v3.15.50。本輪改 index.html + hero_db.js + arena.js + game_changelog.js 四檔。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.40)。',
    ],
  },
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
];