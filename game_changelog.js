// ════════════════════════════════════════════════════════════════════════
//  game_changelog.js  —  LXPSGAME 更新日誌
//  最後更新:2026-06-28  / 目前主程式版本:v3.16.60(召喚物行動在主人卡牌跳趣味標籤·青龍助攻延後0.5秒;前版 v3.16.59 鬥技場動態影片背景)
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
  // v3.16.52 — 題庫顯示「本週累積答對進度」+ 每週重置 + 英雄條件搜尋補標(禁錮/拘留/認罪)
  {
    ver: 'v3.16.52',
    date: '2026-06-28',
    brief: [
      '📘【題庫進度看得見·每週重新挑戰】貓空關「河堤」選科目時,每個題庫下方會顯示「本週已答對 N／M 題」,整個題庫都答對了就顯示「✅ 本週已完成」,讓你一眼看出本週還有哪些題庫沒做完。每週知識王結算後,所有題庫的本週進度會自動重置歸零,可以重新累積、再次挑戰拚小博士排行榜!(三個專屬解鎖題庫「領養與照顧狗狗／照顧與陪伴幼兒／世界機關王大賽」維持原本的連擊解鎖顯示。)',
      '🔍【英雄條件搜尋補上新效果】英雄圖鑑與編組的「🔍 條件搜尋」新增三個可勾選的技能效果標籤:「禁錮」(魔術師)、「拘留」(拘留者)、「認罪」(偵探),配隊找控制型英雄更方便。'
    ],
    items: [
      '★ v3.16.52【題庫每週累積·index.html】_persistentCorrectQuestions 由「永久」改「本週」範圍:新增 _persistentCorrectWeekKey(綁 window._weeklyQuiz.getWeekKey 知識王週次)+ _pcqWeeklyResetCheck()(跨週清空 + fire-and-forget gameCloudSave;冪等;weeklyQuiz 未就緒回空時不動);掛 advGetQuizPool / _advMiniGetQuizPool / _kingPickAnswer 三入口。存檔新增 persistentCorrectWeekKey 欄(綁 UID·走既有 self-write 規則·無需改 firestore.rules);舊存檔無此欄→首次進題庫視為遷移、清成本週空白。小博士 first-correct 計分(recordCorrect)隨週重置=每週可重新累積。',
      '★ v3.16.52【本週進度顯示·index.html】新增 _advWeeklyBankInfo(subject) 回 {answered,total}(五下第三/四單元、期中評量讀各自陣列·其餘 ADV_QUIZ_DB.filter by subject·三專屬解鎖題庫回 null);_renderChoiceBtnContent + makeBtn 兩個 render 路徑的「一般科目」else 分支顯示「📘 本週已答對 N/M」或「✅ 本週已完成」。需求「隨機調整選項」引擎本就有(河堤 BOSS L≈82593 + 小怪戰 L≈118283 每次出題 Fisher-Yates 洗選項·dataset.isCorrect 判答)·本輪未改答題判分路徑。',
      '★ v3.16.52【條件搜尋補標·hero_db.js】SKILL_EFFECT_DEFS B 組(傷害/控場類)新增 3 標籤 禁錮/拘留/認罪(置於「無法行動」後);HERO_SKILL_EFFECTS 掛標:魔術師+禁錮、拘留者+拘留、偵探+認罪(封印被動 v3.16.50 已在表內)。稽核 84 勾選項/84 英雄使用·無孤兒標籤、無空結果勾選項。',
      '★ v3.16.52【驗證/版本】index.html 20 個 inline script node --check 全過·0 lone surrogate;hero_db.js/admin_panel.js/game_changelog.js node --check 過·UTF-8 OK。四點版本同步 _GAME_LOADED_VERSION + _vers[index.html/hero_db.js/admin_panel.js/game_changelog.js] + ADMIN_PANEL_VERSION → v3.16.52(admin_panel.js 僅版號對齊·內容未改)。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.32)。'
    ],
  },
  // v3.16.51 — 平衡調整:HP素質只給玩家英雄版 + %治療不吃HP放大 + 暗法師加強 + 自動戰鬥AI更聰明
  {
    ver: 'v3.16.51',
    date: '2026-06-28',
    brief: [
      '⚖️【平衡調整·HP素質更合理】英雄的「生命值(HP)」素質帶來的「減傷」與「受到治療量提升」效果,現在只對你的玩家英雄生效(包含你招募到的英雄版酒吞童子、玉藻前、大天狗、法老王、埃及豔后)。冒險關卡裡的敵方 BOSS、菁英、小怪即使是同名角色,也不再享有這兩項加成。攻擊、特技、速度三項素質對戰鬥的影響維持不變。',
      '💧【治療計算更直覺】所有「按 HP 百分比回復」的治療(例如「回復最大 HP 的 30%」),不再被 HP 素質額外放大——百分比治療就是實打實的百分比,不會再因為堆高 HP 而暴漲。(治療技能、至寶等「提升治療量」的效果仍然有效。)',
      '🌑【暗法師加強】暗法師的 S1「死亡宣告」能量消耗從 5 降到 4,更容易施放!爆發技「毀滅禁咒」傷害不變,但現在保證附加「強力封印」+「強力禁療」2 回合(把爆發練到滿級可達 3 回合),讓敵人既不能用技能、也無法被治療!',
      '🤖【自動戰鬥更聰明】開啟自動戰鬥時:只有「天賦會在普通攻擊時觸發效果」的英雄才會去普攻(例如法師、祭司、神偷等),其他英雄不再浪費回合做微弱的普攻,改成賣出高價物品蓄積能量、優先施放爆發或技能。主治療類型的英雄,只要有隊友倒下或血量偏低,就會優先進行復活/治療!'
    ],
    items: [
      '★ v3.16.51【HP素質範圍·index.html】新增 _isBossVerStat(t)(世界BOSS龍王 || p2側且 _adventureMode)→ SITE5 受傷減免(L≈39638)+SITE1 受治療放大(L≈41819)的 _isPlayerHero 閘各加 && !_isBossVerStat;競技場/PVP 的 p2 非冒險回 false → 英雄版酒吞/玉藻前/大天狗/法老王/豔后保留 HP 加成。atk/特技/速度三素質公式完全未動(BOSS/菁英/小怪/玩家一致·無上限)。',
      '★ v3.16.51【%治療不吃HP放大·index.html】doHeal 新增 opts.isPctHeal;SITE1 受治療放大閘加 && !opts.isPctHeal;13 處「按目標最大HP百分比」的 doHeal 呼叫點補 isPctHeal:true。至寶 healReceived/草龍王 healRamp/healReduced 等「技能效果」仍生效;回滿血(t.hp-t.curHp / 滿血菇 / 賢者之石)因已夾 maxHP 為 no-op 不標。',
      '★ v3.16.51【暗法師·hero_db.js+index.html】S1死亡宣告 c:5→c:4(hero_db.js);爆發毀滅禁咒(index.html L≈31539)傷害不變,per-enemy 由「機率封印1回合」改「保證 addStatus seal+noheal_curse·皆 _strong:true·dur=2+_lv5Extra(_burstLv>=4→3回合)」。',
      '★ v3.16.51【自動戰鬥AI·index.html】_realAiAct:(1)優先3普攻只在 a.side==p1 且 HERO_TRAIT desc/fd 含「普通攻擊」時執行(否則略過·改賣最高價非裝備/非治療/非復活物品蓄能·無可賣才休息);(2)isHealer 併入 HERO_PRIMARY_CLASS[a.name]==heal → 主治療型套用治療門檻優先治療/復活。敵方 p2 AI 維持原行為不動 BOSS 平衡。',
      '★ v3.16.51【驗證/版本】index.html 20 個 inline script node --check 全過·0 lone surrogate;hero_db.js/admin_panel.js node --check 過。四點版本同步 _GAME_LOADED_VERSION + _vers[index.html/hero_db.js/admin_panel.js/game_changelog.js] + ADMIN_PANEL_VERSION → v3.16.51。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.31)。'
    ],
  },
  // v3.16.50 — 新角色登場:魔術師(4年6班 張簡映澤·SSR)
  {
    ver: 'v3.16.50',
    date: '2026-06-27',
    brief: [
      '🎩【新英雄登場！魔術師（SSR）】由 4 年 6 班 張簡映澤 設計的神秘魔術師加入小英雄行列！口頭禪「見證奇蹟的時刻，到了」，擅長幻術與逃脫術。天賦「障眼法」每回合有機率讓對手的被動技能失效（對手都沒有被動就改用暈眩）；S1「魔術閃光」造成傷害後隱身休息（免傷＋回血）；S2「表演魔術」讓全場敵人暈眩並從帽子裡變出物品卡；爆發「禁錮牢籠」把敵人關進無形牢籠 3 回合（無法行動、無法被治療、天賦與被動全部失效），對 BOSS 與玩家英雄則有一半機率掙脫但會受到強力反噬！',
      '✨【召喚登場】魔術師為 SSR 稀有度，可在召喚星空抽到（🎩 禮帽為其代表標記），圖鑑可查看完整介紹與升級效果。'
    ],
    items: [
      '★ v3.16.50【魔術師資料層·hero_db.js】HERO_DB(HP75/攻8/特22/速12·S1魔術閃光c4/S2表演魔術c5)/AVATARS(🎩)/HERO_IMGS/HERO_BIO(designer 4年6班張簡同學)/BURST_DB(禁錮牢籠)/HERO_TRAIT(障眼法)/HERO_LORE/BURST_GIF_DB(禁錮.gif+禁錮.mp3)/HERO_CATEGORIES/HEX/PRIMARY_CLASS(ctrl)/HERO_SKILL_EFFECTS 共 14 表;node --check 通過。',
      '★ v3.16.50【新狀態 imprison/_passiveSeal·index.html】禁錮(無法行動+禁療+天賦/被動失效)+被動失效兩新狀態:BAD_STATUS/STATUS_DESCS/statusName(🔒/🎭)+5處控制清單+禁療判定(_healCurseGate/doHeal/doRevive)+天賦失效判定(_getTraitLv)全部接好。',
      '★ v3.16.50【技能/爆發/天賦·index.html】爆發禁錮牢籠(_runBurst:imprison 3回合+消有利+強敵50%脫離受特技500%×爆發乘數反噬)+S1魔術閃光(當前HP20%上限Lv×20+隱身休息immune+回血)+S2表演魔術(全體暈眩對BOSS減半+drawItem加普通物品卡)+天賦障眼法(startTurn封被動/無被動則暈眩);execSkill+aiUseSkill雙路徑(鐵律1.128)。',
      '★ v3.16.50【升級預覽+被動攔截·index.html】SKILL_UPGRADE_DEF(special_magic_flash/show)+codex case(S1回血%/S2加卡數逐級高亮)+BURST_UPGRADE_DEF(脫離反噬500→700%);被動失效/禁錮攔截 7 個被動(拘留者空間果實/武士迴避反擊/御雲使軟軟的雲/武鬥家金鐘罩/漩渦反擊/科學發明家靈感/偵探察覺蛛絲馬跡)。',
      '★ v3.16.50【三池+音效+版本】SUMMON_RARE_HEROES+STUDENT_DESIGNER_HEROES(lsps111132)+sfx-imprison-burst(禁錮.mp3);四點版本同步 _GAME_LOADED_VERSION + _vers[index.html／hero_db.js／admin_panel.js／game_changelog.js] + ADMIN_PANEL_VERSION → v3.16.50。'
    ],
  },
  // v3.16.49 — 禁療/減療對所有恢復HP行動全面生效 + 酒吞童子BOSS回血削弱
  {
    ver: 'v3.16.49',
    date: '2026-06-27',
    brief: [
      '🚫【禁療現在能封死所有回血了】「死亡宣告」等技能造成的「禁止恢復(不治詛咒)」與「治療減半」,以前只擋一部分治療,現在對「所有恢復 HP 的行動」(隊友治療、持續回血、吸血、天賦回血、復活…)全面生效——中了強力禁療就完全無法恢復 HP、也無法被復活;中了減療則所有回血量減半。',
      '👹【日本 BOSS 酒吞童子變好打了】酒吞童子當關卡 BOSS 時,爆發技「鬼王酒宴」的自我回血由 40% 降為 20%、吸血效果減半,而且現在會乖乖受「禁療」限制——對牠用上禁療(例如暗法師的死亡宣告),牠就無法靠爆發回血變肉,讓禁療成為打酒吞 BOSS 的有效攻略。(你自己抽到/招募的酒吞童子維持原本的 40% 回血與滿額吸血,不受影響。)',
    ],
    items: [
      '★ v3.16.49【中央禁療閘門·index.html】新增 _healCurseGate(target,amt):noheal_curse(不治詛咒/強力)→0、healReduced 普通×0.50/強力×0.25、受詛咒的神像 field→0;套用到 21 處原本繞過 doHeal 直接改 curHp 的「主動治療/復活」點(隊友治療多處、至寶 hpRegen 持續回血、寶箱怪/地獄將軍/玉藻前天賦回血、死靈法師「怨念化慈悲」與「死靈之力」復活設定型→中禁療時 curHp 夾 0 不復活)。',
      '★ v3.16.49【復活也受減療·index.html】doRevive 原本只擋 noheal_curse(復活剩 1 HP),補上 healReduced:中減療時復活 HP 也減半(普通×0.50/強力×0.25,最低保 1),呼應「減療對所有恢復 HP 行動生效」。',
      '★ v3.16.49【酒吞 BOSS 回血削弱·index.html】爆發「鬼王酒宴」自身回血原為「直接 h.curHp += 40%」完全繞過禁療(中死亡宣告禁療仍回 40% 的漏洞根因),改走 doHeal → 自動受不治詛咒/減療攔截;並依「冒險模式敵方 p2」判定 BOSS 版:自身回血 40%→20%、吸血 burstVamp _vampMult 1.0→0.5;玩家招募版(p1/鬥技場 p2)維持 40%/1.0。吸血本就走 doHeal,故中禁療時吸血也歸 0。',
      '★ v3.16.49【刻意不套(防禦/免死非主動回血)】金鐘罩減傷補回、漩渦反擊迴避補回、武鬥家「鋼鐵意志」致命傷免死回血、各種「不倒(剩 1 HP)」、魔劍姬伊莉雅爆發 HP 翻倍、救醫馬/裝備的最大 HP 增益(curHp 跟漲),屬「受傷時的防禦/上限變動」非主動恢復行動,維持原狀不被禁療誤殺。',
      '★ v3.16.49【版本/範圍】四點版本同步 _GAME_LOADED_VERSION + _vers[index.html／admin_panel.js／game_changelog.js] + ADMIN_PANEL_VERSION → v3.16.49;hero_db.js 維持 v3.16.46。本輪只改 index.html(新增 1 helper + 22 處治療/復活點 + 酒吞爆發 3 改) + game_changelog.js + admin_panel.js(僅版號對齊·內容未改)。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.29)。',
    ],
  },
  // v3.16.48 — 答對題目後三個獎勵選項新增專屬行動音效
  {
    ver: 'v3.16.48',
    date: '2026-06-27',
    brief: [
      '🔊【答對選獎勵有音效了】戰鬥中答對題目、選擇獎勵時,三個選項(✨ 立即使用 / 💡 存到「知識化為力量」 / ⚡ 轉換為 3 能量)現在各自會播放專屬音效,點起來更有回饋感。',
    ],
    items: [
      '★ v3.16.48【三個獎勵選項音效·index.html】新增 3 個 <audio> 元素:sfx-reward-use(使用答題獎勵.mp3)／sfx-reward-keep(知識化為力量.mp3)／sfx-reward-energy(轉為能量.mp3),皆 preload="auto"、引 GitHub raw,接在偵探音效 sfx-detective-burst 之後。',
      '★ v3.16.48【替換既有通用音(取代非疊加)·index.html】advRewardConfirmUse／advRewardConfirmKeep／advRewardConfirmToEnergy 三函式開頭原各播通用 UI 音(sfx-confirm 0.7／sfx-powerup 0.6),改播對應專屬音(音量 0.8);採「取代」避免專屬音與通用音同時響起。',
      '★ v3.16.48【版本/範圍】四點版本同步 _GAME_LOADED_VERSION + _vers[index.html／admin_panel.js／game_changelog.js] + ADMIN_PANEL_VERSION → v3.16.48;hero_db.js 維持 v3.16.46、world-boss.js v3.15.98、world-boss-ui.html v3.16.45、arena.js v3.15.69、main.css v3.15.79。本輪只改 index.html(3 audio + 3 函式各替換 1 行) + game_changelog.js + admin_panel.js(僅版號對齊·內容未改)。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.28)。',
    ],
  },
  // v3.16.47 — 首頁標題圖再放大 75% + 上移避免擋住人物頭部 + 移除副標題
  {
    ver: 'v3.16.47',
    date: '2026-06-27',
    brief: [
      '🏠【首頁大標題再放大】首頁「小英雄大對抗」標題圖再放大 75%、更醒目;同時往上移動,盡量不擋到中間拿筆電男孩等人物的頭。',
      '🗒️【移除副標題】移除標題下方的副標題「力行小學生與來自異世界的小夥伴」,畫面更簡潔。',
    ],
    items: [
      '★ v3.16.47【標題圖放大 75%·index.html】.title-img max-width:min(82vw,560px)→min(90vw,980px)、max-height:40vh→72vh(讓寬度先綁定·依 836×470 原比例縮放)。',
      '★ v3.16.47【標題容器上移·index.html】#overlay .title-wrap 由 main.css 的 flex 置中+margin-top:-180px 改 position:absolute+left:50%+transform:translateX(-50%)+top:-8vh(放大後往上長·圖上方 17% 透明邊距往上推不切字·底部讓出中央人物頭部);#overlay 內所有按鈕皆 position:absolute(top:67%/78%…)故不受影響。',
      '★ v3.16.47【移除副標題·index.html】.title-en 加 display:none(移除「力行小學生與來自異世界的小夥伴」)。',
      '★ v3.16.47【版本/範圍】四點版本同步 _GAME_LOADED_VERSION + _vers[index.html／admin_panel.js／game_changelog.js] → v3.16.47;hero_db.js 維持 v3.16.46、world-boss.js v3.15.98、world-boss-ui.html v3.16.45、arena.js v3.15.69、main.css v3.15.79。本輪只改 index.html(3 處 CSS) + game_changelog.js + admin_panel.js(僅版號對齊·內容未改);標題圖 title-zh.webp 已上傳·無需改碼。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.27)。',
    ],
  },
  // v3.16.46 — 首頁標題圖文字後備+尺寸 / 鬥技場·龍王戰最高治療歸施術者 / 答題獎勵不計最高傷害·治療 / 戰鬥求救鈕整併 / 答題轉3能量
  {
    ver: 'v3.16.46',
    date: '2026-06-27',
    brief: [
      '🏠【首頁大標題修正】修正首頁「小英雄大對抗」大標題的顯示問題:① 電腦版原本標題圖沒出現、副標題「力行小學生與來自異世界的小夥伴」位置太高 ② 平板(iPad)版標題位置出現彩色閃爍細邊框和 404 破圖圖示、副標題跑到畫風切換鈕位置太低。原因是標題圖片檔尚未上傳,現在改成:圖片載入失敗時自動改顯示乾淨的金色立體文字標題,副標題位置在電腦和平板都正確一致;標題尺寸也縮小調整,不會擋到右邊遠方的 101 大樓和中間拿筆電男孩的臉。(等老師把標題圖檔上傳後,圖片就會正常顯示。)',
      '💚【最高治療統計更準確】鬥技場和龍王戰的「最高治療」現在會正確算在「真正施展治療的英雄」身上:持續回血(像朱玥的春之戰場)、吸血、天賦觸發的治療,以前可能誤算到「當下正在行動的英雄」或「被治療的英雄」頭上,現在一律歸功給真正的施術者,才能正確看出治療是誰的功勞。',
      '🚫【答題獎勵不計入最高傷害/治療】答題答對後使用的獎勵(對敵人造成傷害、幫全隊回血)不再灌進「最高傷害」「最高治療」的排名統計,讓這兩項只反映英雄技能本身的真實表現(龍王戰排行榜本就已排除,本次補上鬥技場結算)。',
      '🆘【戰鬥求救鈕整併】戰鬥中的求救/救援按鈕整合成單一選單,介面更清爽。',
      '🔷【答題獎勵可轉 3 能量】答題獎勵確認視窗新增選項:可把獎勵直接轉換成 3 點能量。',
      '🔄【換隊友重戰/重新開戰完全復原】戰鬥卡死自救的「換隊友重新開始戰鬥」與「重新開戰」,現在會完全恢復到戰鬥剛開始的狀態——包含每位英雄的「極限爆發使用次數」(原本沒重置、重戰後爆發次數仍是用完的)、武士崛起鬥志、連招疲勞、S2 使用旗標全部歸零,真正從頭開始。',
      '🖼️【沐雲雪立繪修正】新角色「御雲使‧沐雲雪」圖片顯示破圖(404)的問題修正了(原因:先前改成 .webp 檔名但 .webp 圖檔沒上傳到 repo;改回 repo 裡原本就有的 .png 圖檔,立繪立即正常顯示)。',
    ],
    items: [
      '★ v3.16.46【首頁標題圖文字後備·index.html】根因:title-zh.webp 回傳 404(圖檔尚未上傳 repo 根目錄)。PC:img 失敗→父層 font-size:0→塌陷→副標上移;iPad:Safari 渲染破圖佔位框+404圖示→把副標往下推到畫風切換鈕。修法:.title-img 加 onerror→隱藏破圖、切顯示新增的 .title-zh-text(預設 display:none 的金漸層 POP 文字「小英雄大對抗」·-webkit-text-stroke+text-shadow+titleFloat 動畫)→破圖不再出現、.title-zh 維持應有高度→副標位置 PC/iPad 一致;.title-img 尺寸 min(90vw,680px)→max-width:min(82vw,560px)+max-height:40vh+width/height:auto(依 836×470 原比例縮入框、不擋 101/筆電男孩臉);cache param ?v=v3.16.46。老師上傳 title-zh.webp 後圖片即正常顯示、後備自動隱藏。',
      '★ v3.16.46【最高治療歸施術者·index.html】doHeal 治療統計呼叫由 activeChar-first(const _healer=G&&(G.activeChar||opts.actor))改 actor-first(const _healer=(opts&&(opts._healSrc||opts.actor))||(G&&G.activeChar))→持續回血/吸血/天賦觸發治療(常在別英雄回合結算)歸正確施術者,不再誤算當前行動者或受治療者(仿 v3.15.45 DoT 歸施術者);稽核 154 個 doHeal 呼叫點確認傳 actor 者皆為施術者/吸血者/天賦擁有者/自療本體(actor:target=效果擁有者自療或治隊友皆正確),actor-first 安全。傳 actor:null 的持續回血補 _healSrc 明確來源:朱玥春之戰場(_healSrc=朱玥本體·不論存活)、午睡自療(_healSrc:h)、寵物鱟固定/百分比回血(_healSrc:h)。',
      '★ v3.16.46【答題獎勵不計最高傷害/治療·index.html】答題獎勵 dmg_one/dmg_all(doDmg fixedDmg:true 走早退路徑 isFixed:true)、heal_50(doHeal fixedDmg:true→statTrack isFixed:true)本就不入 dmgReal/healReal;龍王戰排行榜(world-boss.js _findTop dmgReal/healReal)與本場 MVP(topDmg=dmgReal)早已排除。本次補上鬥技場結算 showResult:battle-stats-bar 的 byDmg/byHeal 排序 + 最強輸出/最佳治療統計卡取值由總量 dmg/heal 改 dmgReal/healReal → 答題獎勵不再灌進鬥技場最高傷害/治療(showResult 全部呼叫點皆鬥技場;鬥技場玩家+AI 答題獎勵走 advApplyReward/_arenaAIApplyReward)。',
      '★ v3.16.46【riding·戰鬥求救鈕整併+答題轉3能量·index.html】(前一階段累積·本版一併上線)戰鬥求救/救援鈕整併為單一選單(adv-battle-help-fab + _showBattleHelpMenu);答題獎勵確認視窗新增第 4 鈕「轉 3 能量」(advRewardConfirmToEnergy)。',
      '★ v3.16.46【換隊友重戰/重新開戰完全復原·index.html】兩條重戰路徑原本只重置 curHp/status/buffs/acted,漏了 per-battle 計數 → 重戰後極限爆發次數不恢復(老師回報)。比照正常開戰 advStartBattle(BOSS 戰前重置)補齊:① 換隊友重戰 _showRollbackReinforcePicker→_rrfSelectIn 的 G.p1/G.p2 reset 迴圈加 h._burstUsed=0+h._risingSpiritCount=0;② 重新開戰按鈕 _resetH 加 h.s2used=false+h._burstUsed=0+h._risingSpiritCount=0;兩處均加 G.comboFatigue=0/comboFatigueByHero={}/lastSkillName=null/lastSkillByHero={}(連招疲勞歸零)。時間倒轉卡(_initState 還原)與小怪戰逐場(爆發本就跨小怪戰累積到 BOSS 戰才歸零·鐵則)維持原樣不動。',
      '★ v3.16.46【沐雲雪立繪 .webp→.png·hero_db.js】HERO_IMGS[御雲使‧沐雲雪] 由 御雲使_沐雲雪.webp(raw 404·v3.16.42 改 webp 但圖檔從未上傳)改回 御雲使_沐雲雪.png(raw 200·repo 既有)→立繪即恢復。同步 bump _vers[hero_db.js] v3.16.41→v3.16.46 破快取。⚠ 大標題 title-zh.webp 同屬「改 webp 但圖檔未上傳→404」,但已有 v3.16.46 文字後備(顯示金字標題)兜底;老師日後若要顯示圖片版,需自行上傳 title-zh.webp / 御雲使_沐雲雪.webp 到 repo 根目錄(Claude 只能改 src 引用、無法產生圖檔本體)。',
      '★ v3.16.46【版本／範圍】五點版本同步 _GAME_LOADED_VERSION + _vers[index.html／hero_db.js／admin_panel.js／game_changelog.js] → v3.16.46;world-boss.js 維持 v3.15.98、world-boss-ui.html 維持 v3.16.45、arena.js 維持 v3.15.69、main.css 維持 v3.15.79。本輪改 index.html + hero_db.js(沐雲雪 .png 引用) + game_changelog.js + admin_panel.js(僅版號對齊·內容未改)。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.26)。',
    ],
  },
  // v3.16.45 — 世界 BOSS 三修(龍王戰入口紫框壓縮 + 排行榜最高傷害 DoT 歸施術者 + 答題法寶確認視窗 z-index)
  {
    ver: 'v3.16.45',
    date: '2026-06-27',
    brief: [
      '⚔️【世界 BOSS 三項小修正】① 龍王戰入口畫面:最上面的紫色外框太高、和下面紅色「山岳地龍王」介紹卡擠在一起的問題修正了,標題區間距縮小、兩張卡之間保持適當距離。② 龍王戰排行榜的「最高傷害」更準確:中毒、燃燒、出血這類「持續傷害」現在會正確算在「放這個技能的英雄」身上(以前會誤算到當下正在行動的那隻英雄頭上),全隊「聯手爆發」的固定傷害也不會被灌進個人最高傷害。③ 答題時使用「神諭之光」「換題葉符」等法寶,原本「使用確認視窗」會被題目蓋住、按不到的問題修正,確認視窗現在固定顯示在最上層,一定點得到。',
    ],
    items: [
      '★ v3.16.45【龍王戰入口紫框壓縮·world-boss-ui.html】#wb-entry-overlay 的 .wb-card(紫框 border:3px #a884ff)頂部 padding 48→30、.wb-title margin-bottom 24→12、.wb-subtitle 44→20、.wb-boss-preview(紅框)min-height 480→360 + margin-top 36→22 → 紫框整體變矮,標題區不再把紅龍王卡往下擠。(紫框是外框、紅卡是其子元素,CSS 父子本不會真重疊;此修壓縮頂部過高間距讓視覺不再卡在一起。若實機重疊另有狀況需截圖再查。)',
      '★ v3.16.45【排行榜最高傷害 DoT 歸屬·index.html】根因:doDmg 第二段 a=G.activeChar||opts.actor — DoT(中毒/出血)tick 沒傳 actor 就被算到「tick 當下正要行動的英雄 G.activeChar」名下,且未標 isFixed → 進 dmgReal(=排行榜 topDmg);對 BOSS 每 tick 撞 5000 上限,誤灌某英雄最高傷害;燃燒(fixedDmg)則沒人認領。修法:addStatus 為 poison/bleed/hellfire 記施術者 _dotSrc(=當下 G.activeChar);三處 tick(中毒/出血/燃燒行動前後)傳 actor=_dotSrc;doDmg 改 a=(_isDotTick?opts.actor:G.activeChar)||opts.actor 讓 DoT 歸施術者(一般傷害不變);燃燒 fixedDmg 路徑 isFixed 改 !_isDotTick → 計入施術者真實貢獻。聯手爆發 5000 本就直接扣 boss.curHp 不走 doDmg/statTrack、從不在 dmgReal;本場總傷團隊貢獻用 myUid 計、不依賴 a,無回歸。',
      '★ v3.16.45【答題法寶確認視窗 z-index·index.html】adv-treasure-confirm(神諭之光/換題葉符 使用確認視窗)z-index 9200→10500。根因:答題時 adv-quiz-overlay 會被拉到 9500(_tgAskPetQuestion)甚至 9950(另一答題流程)以蓋過過場 cutscene,原 9200 反被題目蓋住、✔使用/✕取消 按不到。10500 高於 9950、低於系統級 overlay(2147483646)。',
      '★ v3.16.45【版本／範圍】五點版本同步 _GAME_LOADED_VERSION + _vers[index.html／admin_panel.js／game_changelog.js／world-boss-ui.html] → v3.16.45;world-boss.js 維持 v3.15.98、hero_db.js 維持 v3.16.41、main.css 維持 v3.15.79。本輪改 index.html + world-boss-ui.html + game_changelog.js + admin_panel.js(僅版號對齊·內容未改)。',
    ],
  },
  // v3.16.44 — 首頁主標題改用 POP 海報體立繪圖(去掉底部灰色、保留飄浮動態)
  {
    ver: 'v3.16.44',
    date: '2026-06-27',
    brief: [
      '✨【首頁變漂亮】首頁最上面的「小英雄大對抗」主標題,換成全新的 POP 海報體立繪圖(有寶劍、皇冠、盾牌跟小星星裝飾),原本標題字底部那塊灰灰的、看起來沒填滿的影子也拿掉了。標題會輕輕飄浮的動態效果保留著。',
    ],
    items: [
      '★ v3.16.44【首頁主標題改圖·index.html】原 .title-zh 是用 CSS 文字(M PLUS Rounded 1c)+ 彩虹漸層 background-clip:text + -webkit-text-stroke + 多層 drop-shadow 做的;其中 drop-shadow(0 6px 0 #fff) 與 drop-shadow(0 8px 0 rgba(0,0,0,0.25)) 這兩層「白+灰往下偏移」的假 3D,在花背景上看起來就像字底部一塊灰色沒填滿(老師回報「好醜」)。',
      '★ v3.16.44【修法】① HTML:.title-zh 內的六個字「小英雄大對抗」改為 <img class="title-img" src="title-zh.webp">(POP 海報體已內建在圖中,含寶劍/皇冠/盾牌/星星裝飾)。② 內嵌 <style> 用 !important 把 .title-zh 的 font/漸層/background-clip/text-stroke/灰色 filter/titleRainbow 動畫全部關掉(沿用「不動 main.css」內嵌覆寫慣例,只保留 main.css 既有定位 margin-top)。③ 圖片改套新的 titleFloat 飄浮動畫(scale 1→1.02 + rotate ±0.5deg + translateY 0→-7px bob,4s 循環)+ 一道柔和 drop-shadow(非灰色硬邊)→ 保留飄浮動態、去掉灰影。副標題「力行小學生與來自異世界的小夥伴」維持文字不變。',
      '★ v3.16.44【webp 鐵則】老師提供的 836×470 PNG(≈408KB)依鐵則轉成 webp(q90·≈77KB·小 81%·保留透明背景),命名 title-zh.webp。⚠ title-zh.webp 需老師上傳 repo 根目錄(與 index.html 同層),圖片用相對路徑 + ?v=v3.16.44 破快取。日後若換圖,改 index.html 內 ?v= 版本即可。',
      '★ v3.16.44【版本／範圍】五點版本同步 _GAME_LOADED_VERSION + _vers[index.html／admin_panel.js／game_changelog.js] → v3.16.44(hero_db.js 維持 v3.16.41、main.css 未動故 v3.15.79 不變、admin_panel.js 內容未動僅版號對齊)。本輪只改 index.html + game_changelog.js(+ 新增 title-zh.webp 圖檔由老師上傳)。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.24)。',
    ],
  },
  // v3.16.43 — 代表英雄跨帳號污染根治 + 接關搶關修正 + 代表英雄滿等改贈經驗書 + PC切帳號清單修正
  {
    ver: 'v3.16.43',
    date: '2026-06-27',
    brief: [
      '🛡️【修正·共用平板】修正「代表英雄」在共用平板上被別的帳號污染的問題:之前 A 帳號設了代表英雄,換成 B 帳號(沒解鎖那隻)卻會看到它、甚至切回 A 後英雄/等級被改掉。現在代表英雄會牢牢綁定各自的帳號,換帳號不再互相影響。',
      '⚔️【修正·接關】修正 BOSS 用連續爆發技把全隊一次打倒時,接關視窗剛跳出來就被「戰鬥結束」搶走、來不及按接關的問題。現在一定會等你自己按下「接關」或「放棄」,才會真正結束戰鬥。',
      '📚【新功能·代表英雄滿等獎勵】代表英雄練到 Lv50 滿等後,每日簽到不再浪費:會改送你「豪華典藏版經驗之書 ×1」(可用在其他英雄);如果這本書已經拿滿 99 本,則改送 5000 知識幣,並會跳出視窗清楚告訴你。',
      '💻【修正·電腦安裝版】修正電腦安裝版切換帳號時,已經加入過的帳號只顯示一個、其他不見了的問題。現在加入過的帳號都會留在清單裡,可以直接點選切換。',
    ],
    items: [
      '★ v3.16.43【代表英雄跨帳號污染·根因·index.html】記憶體有兩個代表英雄變數:本 block 內 local _myRepHero(被 _loadRepHeroBar 讀)與 window._myRepHero(被即時雲端監聽/每日簽到讀),長期不同步;換帳號清理 _clearAccountLocalData 從不清這兩個變數,也不取消待寫雲端的防抖 → 前帳號殘留的代表英雄被下一個帳號 autosave(_refreshMyRepHeroCloud)以新帳號等級寫進新帳號雲端 → 永久污染(A 巫女 Lv50 → B 沒解鎖卻看到巫女 → 切回 A 變祭司)。',
      '★ v3.16.43【代表英雄·修法·五處】① 新增 window._clearRepHeroLocal / window._applyRepHeroFromCloud helper(本 block 定義,可同時改 local+window+畫面並取消防抖);② _clearAccountLocalData 換帳號時呼叫 _clearRepHeroLocal();③ _refreshMyRepHeroCloud 寫雲端前用 advGetUnlockedHeroes() 驗證該英雄屬本帳號,殘留則中止寫入並清除(_own.length 守門防早載入誤判);④ 即時雲端監聽改走 _applyRepHeroFromCloud 並補 null 分支(切到無代表英雄帳號時清殘留);⑤ _loadRepHeroBar 顯示前驗證擁有權,非本帳號擁有則回復「設定代表英雄」。借用好友代表英雄仍讀好友快照(等級/素質投資/技能投資/至寶),不受影響。',
      '★ v3.16.43【接關搶關·根因】王多段爆發約 6 秒才呼叫 checkWin,我方全滅 watchdog 先觸發 → 第一次 _showResultWithDrama(false) 已正確彈出接關 modal(#adv-continue-overlay);但爆發段落跑完後第二次 _showResultWithDrama(false) 被 60 秒去重守門擋下 → 走「結算 modal 救援」,而救援與 5 秒 watchdog 的 overlay 清單沒納入 adv-continue-overlay → 誤判「無結算 modal」→ 強制 advShowBattleResult(false) → 關掉接關 modal 直接判敗。',
      '★ v3.16.43【接關搶關·修法·四處·index.html】① _showResultWithDrama 入口(worldboss 守門後)加主守門:接關 modal 顯示中且為敗北結算一律 return,等玩家按接關/放棄;② 救援 _checkOvIds 與 ③ 5 秒 watchdog _ids 都補進 adv-continue-overlay(雙保險);④ advShowBattleResult 入口加最終安全網(同款守門)。安全性:advGiveUp(玩家按放棄)會先 remove(show) 接關 overlay 再呼叫 → 正常敗北不被擋;接關次數用盡時不顯示接關 overlay → 正常敗北結算也不受影響。',
      '★ v3.16.43【代表英雄滿等改贈·index.html】_checkDailyRepHeroBonus 的 Lv50 分支原本只標記已領就跳過(玩家空得)→ 改為:backpackAdd(hero_exp_book_premium,1) 取實際新增數,>0 即贈一本豪華典藏版經驗之書;=0(背包已滿 99)改 addKnowledgeCoins(5000)。新增 window._showRepHeroMaxLvGiftModal 簽到後彈窗清楚告知(書/幣),並寫 _logActivity 供 GM 查證;仍標記 lastDailyRepHeroExp 防同日重複發。',
      '★ v3.16.43【PC 切帳號清單只剩一個·robustification·index.html】最近帳號原本只在 onAuth 深層 _addRecentAccount 記錄一次。修法:① _doSignInFlow popup 成功 與 ② getRedirectResult 成功的最早一刻(profile 最完整、必有 email)即記錄;③ _addRecentAccount 對同 uid 做「欄位增補合併」,新值為空時保留舊紀錄的 email/暱稱/頭像,絕不用空值覆蓋;④ _getRecentAccounts filter 由「需 uid && email」放寬為「只需 uid」,避免暫時缺 email 的帳號被整筆丟掉。多點補強確保加入過的帳號都留在清單。',
      '★ v3.16.43【版本／範圍】五點版本同步 _GAME_LOADED_VERSION + _vers[index.html／admin_panel.js／game_changelog.js] → v3.16.43;hero_db.js 維持 v3.16.41、admin_panel.js 內容未動(本輪四修皆在 index.html,僅版號對齊)。本輪只改 index.html + game_changelog.js。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.23)。',
    ],
  },
  // v3.16.42 — BOSS 開場動畫音樂無縫接續進戰鬥(不再從頭播放)+ 新圖一律 webp
  {
    ver: 'v3.16.42',
    date: '2026-06-27',
    brief: [
      '🎵【BOSS 開場動畫音樂接續修正】修正貓空 BOSS(九尾空貓怪／杏花妖／黑暗球‧希望型態)開場動畫的背景音樂,在進入戰鬥時又從頭重新播放一次的問題。現在動畫的音樂會直接、無縫地接續進戰鬥,不會再從頭播放。',
    ],
    items: [
      '★ v3.16.42【BOSS 開場動畫 BGM 無縫接續·index.html】根因:BOSS 登場動畫(_playBossIntro)本就用 bgmFadeTo 先起該 BOSS 的戰鬥 BGM(原意就是無縫銜接進戰鬥),但進戰鬥時 advStartBattle 的 _playAdvBossBgm 開頭 bgmStop() + currentTime=0 + play() 會把動畫已經起好的「同一首」BGM 停掉再從頭播 → 聽起來像重頭播放一次。',
      '★ v3.16.42【修法】_playAdvBossBgm 開頭加冪等守門:若「應播的這首 BGM(_curBgm===id)正在播放(el.paused 為 false)」→ 不 bgmStop、不 reset currentTime,只校正音量並掛好 onended 後 return → 從動畫無縫接續。iOS 自動播放被擋時 el.paused 為真 → 不符守門 → 照常 bgmStop 重起(無回歸)。只改 index.html 1 處。',
      '★ v3.16.42【新圖一律 webp·鐵則】老師裁示:之後新增任何圖片一律改用 webp 格式(檔案更小、新版平板下載更快)。本輪先把上一版新增的「御雲使‧沐雲雪」立繪圖檔由 .png 改 .webp(hero_db.js HERO_IMGS)。⚠ 圖檔 御雲使_沐雲雪.webp 需老師另外上傳 repo。',
      '★ v3.16.42【版本／範圍】五點版本同步 _GAME_LOADED_VERSION + _vers[index.html／admin_panel.js／game_changelog.js] + ADMIN_PANEL_VERSION → v3.16.42;hero_db.js 維持 v3.16.41(本輪未改邏輯,僅沐雲雪圖檔副檔名 .png→.webp)。本輪改 index.html + hero_db.js + game_changelog.js + admin_panel.js。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.22)。',
    ],
  },
];
