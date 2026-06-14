// ════════════════════════════════════════════════════════════════════════
//  game_changelog.js  —  LXPSGAME 更新日誌
//  最後更新:2026-06-13  / 目前主程式版本:v3.14.27(主神奧汀 UR 實裝 + 玉藻前爆發改 + 龍王正名重排+至寶)
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
  // v3.15.7(2026-06-14)— 🎵 埃及關小怪戰 BGM 兩首輪播修正(開場觸發點)+ admin_panel.js 破快取字串補跟
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.7',
    date: '2026-06-14',
    brief: [
      '🎵【埃及關小怪戰 BGM 修正】',
      '   ・修正埃及關打小怪時,背景音樂沒有照原本設計<b>兩首輪流播放</b>的問題。現在每打一場小怪戰會<b>交替播放</b>兩首專屬小怪戰 BGM,而且同一場戰鬥中<b>不會中途換歌</b>。',
    ],
    items: [
      '★ v3.15.7 埃及小怪戰 BGM 開場觸發修正(index.html advStartMiniBattle 一般小怪 else 分支,約 L107541):原本寫死 bgmFadeTo(bgm-egypt-battle)——那是「埃及探索曲」、不在輪播清單 EGYPT_BATTLE_BGM_LIST=[bgm-egypt-mob01, bgm-egypt-mob02] 內,導致兩首小怪戰 BGM 開場永遠播不到(只能靠 bgmEnsureSceneBgm 中途重判才換、又違反戰中穩定)。改為與解析器 _detectCurrentBgm 完全相同的算式 EGYPT_BATTLE_BGM_LIST[(_egyptMobBattleCount||0)%length];_egyptMobBattleCount 已於本函式前段遞增,開場與解析器讀同一值 → 每場交替且戰中不重切。保留三處刻意用 bgm-egypt-battle 之處不動(L82085 英雄相遇場景、L107529 聖甲蟲登場、L56728 解析器防呆 fallback)。',
      '★ v3.15.7 admin_panel.js 破快取字串補跟(index.html _LXPS_FILE_VERSIONS 的 admin_panel.js 由 v3.15.3→v3.15.6,對齊檔內 ADMIN_PANEL_VERSION):原停在 v3.15.3 漏跟,曾在 v3.15.3 時期用過後台的 GM 瀏覽器可能仍快取舊後台 → 重抓同一網址拿到舊版、缺 v3.15.6 帳號資料轉移卡片。補回後強制重抓最新後台。純 GM 部署修正,完全不影響學生(學生有守門不載入 admin_panel.js);admin_panel.js 檔案本身不變(維持 v3.15.6),本輪不需重新上傳 admin_panel.js。',
      '★ 註:本檔(game_changelog.js / index.html)已累積含 v3.15.6(帳號資料轉移)+ v3.15.5(森龍王綠葉特效 + 阿蘇隨機 5~9 段)全部變更;若尚未上傳前面版本,直接上傳這批 v3.15.7 即涵蓋。hero_db.js 本輪未改、維持 v3.15.5。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.6(2026-06-14)— 📨 畢業帳號資料轉移(實名制 GM 審核)+ 好友「此帳號畢業已停用」徽章
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.6',
    date: '2026-06-14',
    brief: [
      '📨【新功能:畢業生「帳號資料轉移」】',
      '   ・畢業後想用<b>新的 Google 帳號</b>繼續玩,又捨不得舊帳號辛苦養成的英雄和進度嗎?現在可以申請把<b>舊學生帳號</b>的進度搬到新帳號了!',
      '   ・做法:用<b>新帳號</b>登入 → 在登入頁帳號那一排點<b>「📨 申請帳號資料轉移」</b> → 填寫真實姓名、畢業年度、班級座號、原學生信箱 → 送出後告訴老師,等老師審核搬移。',
      '   ・🔒 放心:搬移只是<b>複製</b>,舊帳號的資料會<b>保留、不會弄丟</b>。搬好後老師會通知你,記得<b>登出再重新登入</b>就能看到完整進度囉!',
      '👥【好友清單小提示】',
      '   ・如果好友是<b>已畢業停用</b>的舊帳號,清單上會顯示<b>「⚠ 此帳號畢業已停用」</b>,方便你知道對方已經換到新帳號了。',
    ],
    items: [
      '★ v3.15.6 畢業帳號資料轉移(實名制 GM 審核;整套架構比照既有「下載權限申請」downloadPermissions):新增 collection accountTransferRequests/{新uid}。firestore.rules 比照 downloadPermissions——get 本人或 GM、list 限 GM、create 限本人 pending 且 newUid==auth.uid 且禁塞 oldUid/resolvedAt/resolvedBy/migratedAt、update 限本人 pending 不能動 GM 欄位、delete 限 GM(list/實名資訊讀取限 GM,保護學生姓名/班級座號個資)。',
      '★ v3.15.6 學生端(index.html):登入頁帳號列 google-user-info 新增「📨 申請帳號資料轉移」按鈕(緊鄰 📩 申請下載權限,登入後即可見);_showAccountTransferModal 實名 modal(姓名/畢業年度/班級座號/原學生信箱四欄必填 + oldEmail 含@且≠新帳號;開啟時查既有申請顯示 pending/approved banner);後端 _fbSubmitAccountTransferRequest 寫入 + _fbGetMyAccountTransferRequest。',
      '★ v3.15.6 GM 端遷移/復原 API(index.html module scope,★只讀舊寫新、絕不改舊帳號):_fbListAccountTransferRequests、_fbAccountSnapshot(回 知識幣/解鎖數/最高Lv/總Lv/暱稱/是否停權 供新舊比較)、_fbBackupNewAccountBeforeMigration(players 主檔+saves/live+safe → _premig_* 備份槽)、_fbRestoreNewAccountPreMigration、_fbMigrateAccountData(全搬:players 主檔 + saves/live + saves/safe + arenaTeams[改 uid 欄] + wbDamageDetail[改 uid 欄];舊主檔不存在則丟錯)、_fbResolveAccountTransfer、_fbDeleteAccountTransferRequest(deleteDoc)。',
      '★ v3.15.6 GM 後台卡片(admin_panel.js,鐵律 1.47 三同步:HTML section #_admin-acctxfer-section + SIDEBAR_ITEMS + SIDEBAR_GROUPS「🛠 系統管理」組;ADMIN_PANEL_VERSION→v3.15.6):_bindAcctxferSection 事件委派(list 容器單一 click listener 讀 data-action/data-newuid/data-oldemail 分派)——🔍 反查舊帳號(oldEmail→oldUid via _fbAdminFindPlayerByEmail + 抓新舊 _fbAccountSnapshot 顯示比較)、✅ 核准並遷移(覆蓋前 confirm 比較 → _fbBackupNewAccountBeforeMigration → _fbMigrateAccountData → 驗證新主檔存在 → 最後才 _fbSuspendPlayer 停權舊帳號 → _fbResolveAccountTransfer approved → _fbAdminSendNotificationToPlayer 通知學生重登)、🚫 拒絕、↩ 取消停權(救回舊帳號)、↩ 還原新帳號到遷移前、🗑 刪除申請。沿用 admin_panel 慣例不用 ?. 可選鏈(舊 Safari 相容)。',
      '★ v3.15.6 好友清單「此帳號畢業已停用」徽章(index.html 兩處渲染 _renderFriendPanelImpl[8 空格縮排] + _refreshFriendListInner[6 空格縮排]):_fbLoadFriend 回傳整份 players doc(含 _suspended),好友渲染處 fd._suspended===true 即在暱稱旁顯示紅色「⚠ 此帳號畢業已停用」徽章。',
      '★ v3.15.6 復原後路(老師需求「萬一搬移失敗、也回不去舊帳號」5 道防線):①遷移只讀舊寫新 → 舊資料永久母本(就算舊信箱被學校停用,GM 仍能讀舊 uid 重搬)②停權是最後一步、複製驗證成功才做 ③覆蓋新帳號前 _premig_* 備份、可一鍵還原 ④GM 兩顆復原鈕(取消停權救舊帳號/還原新帳號到遷移前)⑤完成用通知彈窗請學生重登。',
      '★ 註:本檔(game_changelog.js / index.html)已累積含 v3.15.5(森龍王綠葉特效 + 阿蘇隨機 5~9 段)全部變更;若尚未上傳 v3.15.5,直接上傳這批 v3.15.6 即涵蓋。hero_db.js 本輪未改、維持 v3.15.5。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.5(2026-06-14)— 🐉 翠綠森龍王戰背景改綠葉特效 + 🌋 阿蘇火山龍王爆發段數改隨機5~9段
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.5',
    date: '2026-06-14',
    brief: [
      '🐉【翠綠森龍王 戰鬥背景特效更新】',
      '   ・進入<b>翠綠森龍王</b>世界 BOSS 戰時,背景特效由火焰改為<b>不斷飄升的綠葉</b>,更符合森林巨龍的氣息!(火山炎龍王維持熔岩火焰)',
      '🌋【阿蘇火山龍王 爆發技調整】',
      '   ・爆發<b>「超光速衝擊波」</b>的連段砲擊次數改為<b>隨機 5～9 段</b>(原本約 8～9 段);自身 HP 低於 15% 時仍會提早收手。',
    ],
    items: [
      '★ v3.15.5 龍王戰背景粒子「依屬性切換」(index.html advStartBattle worldboss 分支):屬性來源 window.WORLD_BOSS_LINEUP[].element(火山炎龍王=fire、翠綠森龍王=grass),加硬保底對照表 _WB_ELEM_FALLBACK 防 world-boss.js 延遲載入 race。火屬性沿用既有 main.css 火焰(wb-flame-particle);草屬性 inline 注入綠葉樣式(wb-leaf-particle,綠色 radial 漸層+葉形 border-radius+wbLeafRise/wbLeafRiseTop 上升搖曳動畫,id 守門只注入一次)。未列屬性 fallback 火焰。完全不動 main.css。',
      '★ v3.15.5 阿蘇爆發段數改隨機(index.html _runBurst 超光速衝擊波):_asMaxSeg 由固定 12 → 5 + Math.floor(Math.random()*5) = 隨機 5~9 段;_asMaxSeg 上移至 log 之前避 TDZ;HP<15% 停止條件(_asStopHp)保留(兩者先到先停);戰鬥 log 顯示擲出的最大段數。hero_db.js BURST_DB「超光速衝擊波」d/fd 改「連轟隨機 5~9 段」;順修一處 v3.15.3 漏改的開發註解(傷害 自損×20→×10、特技 100%→50%、約10段→隨機5~9)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.4(2026-06-14)— 👑 法老王/埃及豔后 爆發技能新增專屬動畫 + 音效 + 法老王爆發新增復活效果
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.4',
    date: '2026-06-14',
    brief: [
      '👑【法老王 / 埃及豔后 爆發技能 大升級】(管理員測試中)',
      '   ・<b>法老王「太陽神的審判」</b>:新增專屬<b>爆發動畫</b>(太陽火球)與<b>大爆炸音效</b>;並<b>新增「復活」效果</b>——施放時會先<b>復活已倒下的友方</b>(以 25% HP 復活),再恢復全體 HP!',
      '   ・<b>埃及豔后「尼羅河的詛咒」</b>:新增專屬<b>爆發動畫</b>(深海大漩渦)與<b>河水暴漲音效</b>。',
      '   ・💡 提醒:埃及關目前仍<b>僅開放管理員(老師)測試</b>,正式對全班開放後即可體驗雙王的華麗爆發!',
    ],
    items: [
      '★ v3.15.4 雙王爆發動畫/音效(hero_db.js BURST_GIF_DB + index.html):新增 BURST_GIF_DB 兩條——太陽神的審判→太陽火球.gif(sfx-pharaoh-burst,金光 tint)、尼羅河的詛咒→深海大漩渦.gif(sfx-cleopatra-burst,暗水藍 tint);爆發流程 _showBurstGif(bd.n) 於過場字幕後自動播放對應 GIF+音效。index.html 新增 2 個 <audio>:sfx-pharaoh-burst(大爆炸.mp3)、sfx-cleopatra-burst(河水暴漲.mp3,老師連結把「漲」打成「漩」,實際檔名為 河水暴漲.mp3 已確認 200)。兩爆發 body 移除舊的 playSfx(sfx-holy/sfx-curse),改由 GIF 音效統一播放(老師指定音效)。',
      '★ v3.15.4 法老王爆發新增復活(index.html _runBurst 太陽神的審判):傷害結算後、全體治療前,先以 doRevive(dead,0.25) 復活我方所有倒下友方(25% 最大HP,acted=false 可再行動,bannerFX「☀️ 拉神復活!」);復活對 BOSS 版(寶庫王座雙王)與招募版同樣生效——BOSS 版讓法老王爆發即可救回埃及豔后(配合天賦回合開始互相復活,雙王更難纏);招募版則為 UR/SSR 級隊伍復活利器。hero_db.js BURST_DB「太陽神的審判」desc/fd 同步補上復活說明(圖鑑一致)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.3(2026-06-14)— 🌋 阿蘇火山龍王技能調整 + ⚔️ 貓空/日本小怪 HP×2 + 🐉 森龍王戰背景修復 + 🛠 GM 工具(異常門檻/奧汀/解鎖至寶)
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.3',
    date: '2026-06-14',
    brief: [
      '🌋【阿蘇火山龍王 技能調整】',
      '   ・<b>S1「龍神分身術」</b>能量消耗 6 → <b>7</b>。',
      '   ・<b>S2「火山噴發」</b>傷害改以 <b>(特技+速度)×250%</b> 計算(原為「攻擊+速度」),與龍王以「特技」為主力的定位一致。',
      '   ・<b>爆發「超光速衝擊波」</b>每段傷害的特技加成由 100% → <b>50%</b>(圖鑑說明同步更正:每段傷害 = 失去的 HP×10 + 特技 50%;原圖鑑誤植「×20」,已更正為實際的「×10」)。',
      '   ・<b>天賦「頑強」</b>覺醒時的「不死」狀態由 2 回合 → <b>1 回合</b>(技能升至滿級為 2 回合)。',
      '⚔️【貓空、日本關卡小怪 強化】',
      '   ・貓空與日本關卡的<b>所有路邊小怪 HP 全部加倍</b>,戰鬥更有挑戰性,記得善用技能與隊形!',
      '🐉【翠綠森龍王 世界 BOSS 戰背景修復】',
      '   ・修復<b>翠綠森龍王(草龍王)</b>世界 BOSS 戰時<b>背景全黑</b>的問題,現在會正確顯示龍王立繪。',
    ],
    items: [
      '★ v3.15.3 阿蘇火山龍王調整(hero_db.js + index.html):S1 龍神分身術 c:6→7;S2 火山噴發 execSkill+aiUseSkill 傷害 atkv(a)→spv(a),即(特技+速度)×250%×(1+s2Lv×5%);爆發超光速衝擊波每段 (_asCost×10 + spvOf(h)) → (_asCost×10 + Math.floor(spvOf(h)×0.5))(特技 100%→50%);天賦頑強 _tnDur 2+(Lv4?1:0) → 1+(Lv4?1:0)(不死 1 回合,MAX 2);圖鑑(BURST_DB desc/fd + 爆發升級表 rows[0] + 程式註解)「自損×20」更正為實際的「自損×10」+ 特技 50%(老師回報圖鑑與實際不符)。',
      '★ v3.15.3 沙漠路邊小怪 ×2(hero_db.js + index.html;鐵律1.128 怪物只需 aiUseSkill):新增沙漠毒蠍(hp340/atk24/sp10/spd8;S1 致命毒螫 c4=使目標立即倒下,乙版:會被無敵/不死/死亡免疫/不倒再生擋下,對真BOSS改當前HP20%毒傷上限Lv×10鐵律1.31;S2 瞬間休眠 c3=自身 immune 1回合)、仙人掌怪(hp380/atk12/sp38/spd9;S1 針狀葉 c2=被動受擊反彈50%[doDmg on-hit hook 置 let dmg 後鐵律1.110]+主動 halfDmg 1回合;S2 千本針 c4=攻擊100%全體土屬性);加入 MINI_MONSTERS_EG 出怪池、小怪屬性表(土)、MONSTER_DROPS、EGYPT_ALL_CHARACTERS(鬥技場排除)、BOSS_NAMES(不入可解鎖圖鑑)、_ELEM_BY_SKILL(千本針土)、HERO_IMGS 立繪。',
      '★ v3.15.3 貓空/日本小怪 HP×2(hero_db.js):MINI_MONSTERS 4 隻(偷摘花妖精 42→84/鳥人哈維 40→80/竹筍哥布林 45→90/茶史萊姆 30→60)+ MINI_MONSTERS_JP 4 隻(河童 36→72/二口女 50→100/雪女 50→100/獨眼小僧 60→120);稀有小怪寶箱怪/小惡魔未動(屬稀有怪,非標準小怪池)。',
      '★ v3.15.3 埃及「小怪出現」開場白修正(index.html):MINI_BATTLE_INTROS 原缺 egypt-* key → fallback 到貓空 river(老師回報埃及戰開場白仍是貓空版);新增 egypt-desert/egypt-entrance/egypt-inner 三組埃及主題開場白(融入流沙眼鏡蛇/沙漠毒蠍/仙人掌怪/卡諾卜壇怪/木乃伊貓/神秘圖騰+雙王)。',
      '★ v3.15.3 翠綠森龍王 BOSS 戰背景修復(index.html advStartBattle worldboss 分支):背景圖原直連 `${boss名}.png`,但火山炎龍王/翠綠森龍王實際檔名不同(維蘇威火山龍王.png / 草龍王.png)→兩者皆 404 導致背景全黑;改用 window.HERO_IMGS[boss名] 解析 + 已知龍王硬保底對照表(防 world-boss.js 延遲載入 race),最後才退回名稱.png。',
      '★ v3.15.3 _PLAYER_HERO_NAMES 補漏(index.html):法老王/埃及豔后/主神奧汀先前漏列 → GM 工具 _cleanseHeroLevelsByEmail 會把不在白名單的 heroLevels 鍵刪除,恐誤刪正版持有者英雄;已補進白名單(防患未然)。',
      '★ v3.15.3 GM 後台(admin_panel.js):①龍王戰異常傷害判定門檻「平均每回合 > 5000」→「> 20000」(5 處判定式 _isAbnormal/紅字/墓碑勾選/排行榜紅旗/明細重勾 + UI 按鈕/說明/註解;單擊上限 5000 與聯手爆發 5000 為事實保留,明細收集天然不含聯手爆發)。②課堂獎勵發放新增「⚡ UR 主神奧汀」勾選(_cr-item-odin → unlockedHeroes 聯集發放)。③新增「💠 解鎖全部至寶(自己帳號)」GM 卡片(測試用,冪等掃 TAIWAN_TREASURES 寫 window._taiwanTreasureData + 雲端儲存;HTML section + SIDEBAR_ITEMS + SIDEBAR_GROUPS 三同步,鐵律1.47)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.2(2026-06-14)— 🔺 埃及探險關(管理員測試):雙王平衡坦向化 + 天賦/爆發升級效果 + 聖甲蟲/題庫/BGM/對白修正 ｜ 🐉 龍王雙動作 + 📊 排行榜傷害總表
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.2',
    date: '2026-06-14',
    brief: [
      '🔺【環遊世界第二關 ── 埃及探險 即將登場！】',
      '   ・繼貓空、台灣、日本之後,環遊世界冒險來到神祕的<b>古埃及</b>!穿越熾熱沙漠、深入金字塔,在寶庫王座挑戰守護寶藏的雙王。',
      '   ・關卡分為<b>沙漠 → 金字塔入口 → 金字塔內部</b>三幕場景,每幕都有一場小怪戰,最後在王座迎戰<b>法老王與埃及豔后</b>雙王!',
      '   ・在沙漠可以選擇<b>挑戰難度</b>(沒自信 / 普通 / 我很會),難度只影響雙王 BOSS 的 HP(+0% / +25% / +50%),題目一律是 30 題古埃及主題知識(地理 / 歷史 / 神話 / 神獸)。',
      '   ・埃及小怪有 5 種(木乃伊貓、流沙眼鏡蛇、卡諾卜壇怪、神秘圖騰、聖甲蟲),每場戰鬥有 <b>12% 機率出現稀有的「🪲 聖甲蟲」</b>,打倒牠每位英雄可得<b>大量經驗值(3000~5000)</b>!埃及小怪掉落的經驗書全程都是<b>精裝版</b>。',
      '   ・以 <b>S 評價</b>同時擊敗雙王,有機會<b>收服法老王或埃及豔后</b>(各自獨立 15% 機率)加入你的隊伍!',
      '   ・💡 本次<b>先開放管理員(老師)進行測試</b>,一般玩家點選埃及關會看到「即將開放」,正式對全班開放後即可挑戰,敬請期待!',
      '🌬️ 新角色登場介紹 ── 👑 法老王(光屬性 SSR)',
      '   ・<b>天賦「法老威儀」</b>:每個回合開始累積 1 層威儀(造成傷害 +10%,最多 10 層);每次受傷有機率被削減 1 層,基礎 50%、<b>天賦每升 1 級此機率 -5%</b>(滿級僅 30%,威儀更穩固)。當埃及豔后倒下時,法老王會耗費自身<b>最大 HP 5%</b>把她復活到 25% HP(不限次數)。',
      '   ・<b>S1「王權法杖」</b>:以攻擊+特技 150% 重擊 1 名對手,並把它的行動順序<b>擊退到最後</b>。',
      '   ・<b>S2「黃沙風暴」</b>:以攻擊+特技 80% 對全體連續攻擊 2 次,並使全體<b>速度下降</b> 2 回合。',
      '   ・<b>爆發「太陽神的審判」</b>:召喚拉神烈日,以特技 900%「群體分攤」的巨大光屬性傷害轟炸全場(敵人越多每人受越少),施放後<b>我方全體回復 25% HP</b>(<b>爆發每強化 1 級恢復量 +5%</b>,滿級達 45%)。',
      '🌬️ 新角色登場介紹 ── 🐍 埃及豔后(暗屬性 SSR)',
      '   ・<b>天賦「蛇瞳魅影」</b>:受到傷害時有機率使攻擊者陷入<b>強力魅惑</b> 1 回合(會攻擊自己的同伴),基礎 50%、<b>天賦每升 1 級此機率 +5%</b>(滿級達 70%)。當法老王倒下時,埃及豔后會耗費自身<b>最大 HP 5%</b>把他復活到 25% HP(不限次數)。',
      '   ・<b>S1「魅惑之吻」</b>:以特技 200% 傷害 1 名對手,並使其<b>魅惑</b> 2 回合。',
      '   ・<b>S2「蛇與蜜」</b>:回復我方全體 35% HP,並提升我方全體特技 50% 共 2 回合。',
      '   ・<b>爆發「尼羅河的詛咒」</b>:喚醒千年詛咒淹沒戰場,以特技 200% 對全體造成暗屬性巨大傷害,並各有 50% 機率<b>查封物品</b> 2 回合(<b>爆發每強化 1 級此機率 +5%</b>,滿級達 70%)。',
      '   ・⚠ 提醒:法老王與埃及豔后會「互相復活」,唯有<b>同一時間同時擊殺雙王</b>才能真正終結戰鬥!',
      '   ・⚖ <b>雙王定位</b>:法老王與埃及豔后是<b>高生存的坦克／輔助型</b>雙核(攻擊偏低、生存與控場極強),適合靠威儀疊層、互相復活與全體治療打持久消耗戰。',
      '🐉【世界 BOSS 龍王 ── 雙動作確認 + 隨時查看任一龍王能力】',
      '   ・確認<b>翠綠森龍王(草龍王)和火山炎龍王一樣每回合會行動兩次</b>:第一次是技能/爆發/普攻,第二次固定追擊一次普攻;追擊普攻現在會<b>鎖定當前 HP 最少的玩家</b>。',
      '   ・「元素龍系列」輪流表的<b>每一隻龍王下方都新增「📖 詳細能力」按鈕</b>,可隨時點開查看那隻龍王的招式、天賦與護盾(尚未實裝的龍王顯示「🔒 能力即將解放」)。',
    ],
    items: [
      // ── 埃及關 ──
      '★ v3.15.2 雙王平衡(index.html + hero_db.js):①數值改坦向(法老王 58/18/18/6、豔后 54/18/18/10,和=100;招募版攻30→18/特34→18 換高生存+控場)。②天賦/爆發升級+BOSS守門:法老威儀減層機率=isEgyptBoss?50%:max(30%,50%-天賦Lv×5%)、蛇瞳魅影魅惑=isEgyptBoss?50%:min(70%,50%+天賦Lv×5%)(內部Lv0~4=顯示Lv1~5,受傷 on-hit hook 內層化、鐵律1.110);太陽神恢復=isEgyptBoss?25%:min(45%,25%+爆發Lv×5%)、尼羅河查封=isEgyptBoss?50%:min(70%,50%+爆發Lv×5%)(_runBurst,爆發Lv0~4)。③互相復活耗血「當前HP10%」→「固定最大HP5%」(復活量25%不變,isEgyptBoss BOSS-only)。④雙王加入 _ZEUS_TRUE_BOSSES → 取得尊嚴鎖血(50%/1HP)+強制爆發反擊(無視能量;鐵律1.135;招募版 side!==p2 不受影響、秒殺技對BOSS改比例鐵律1.31)。',
      '★ v3.15.2 埃及其他修正(index.html + hero_db.js):⑤聖甲蟲聖光治癒/黃金護甲補 bannerFX/log/renderCard 視覺回饋 + 護盾30→60 + buffs守門(原本無回饋,玩家誤以為沒作用)。⑥埃及小怪戰題庫修正:advPrepareSessionQuestions 原只在 BOSS 戰前呼叫→小怪戰沿用殘留非埃及題池;新增 _advSessionSubject 追蹤,advStartMiniBattle 偵測「埃及關但題池科目≠埃及/池空」→重建(不過度重置)。①BGM 埃及小怪戰兩首輪播(EGYPT_BATTLE_BGM_LIST + _egyptMobBattleCount%2,每場交替戰中穩定)。④三場景對白重寫(沙漠/金字塔入口/內部,小怪各具性格+融入吉薩/尼羅河/拉神/卡諾卜罈史地)。②介紹頁 4→5 星 + 沙漠背景 + 選關切埃及首頁 BGM。預習頁(EGYPT_PREVIEW_CONTENT)延後下一批。',
      '埃及關場景流程(index.html):新增 _EG_BG(沙漠/金字塔入口/金字塔內部/寶庫王座 raw 連結)+ ADV_SCENES.egypt(3 幕:egypt-desert choiceType=difficulty 沿用貓空 _advBossHpMult 0/+25/+50%、egypt-entrance/egypt-inner choiceType=japan_auto);流程=沙漠選難度→小怪戰→入口→小怪戰→內部→小怪戰→advFinishCutscene→雙王 BOSS(共 3 場小怪戰 + 雙王)。startAdventureGame egypt 區塊(subject/grade=埃及,難度由沙漠選擇覆蓋);advGetQuizPool egypt 兜底(subject===埃及||_adventureStage===egypt → 30 題,過場清空 subject 也命中)。',
      '埃及小怪(index.html):MINI_MONSTERS_EG=[木乃伊貓/流沙眼鏡蛇/卡諾卜壇怪/神秘圖騰](正常 4 隻池);advStartMiniBattle 每場 12% 機率注入聖甲蟲(替換隨機一隻,同小惡魔/座敷童子稀有怪設計);MINI_MONSTER_ELEM(木乃伊貓暗/流沙眼鏡蛇土/卡諾卜壇怪土/神秘圖騰暗/聖甲蟲光);MONSTER_DROPS 五怪(精裝經驗書;聖甲蟲 EXP 3000~5000);advFinishMiniBattle 聖甲蟲掉落區塊(每位非好友英雄 addHeroExp 3000~5000 + 2% 果實 + 50% 技能書/精裝書);_RARE_MOB_LINES + _showRareMobIntro/_showRareMobDefeat 聖甲蟲金色(🪲 #ffd700)登場/退場對白;5 怪加入 BOSS_NAMES(魔物圖鑑/瀕死守門/鬥技場排除)。',
      '埃及背景/BGM(index.html):新增 3 個 <audio>(bgm-egypt-menu 首頁BGM / bgm-egypt-battle 冒險BGM / bgm-egypt-boss 法老王BOSS戰BGM);場景與戰鬥背景採 inline backgroundImage(_EG_BG,不依賴 main.css 的 .bg-egypt-*);BGM 接線涵蓋 advStartCutscene/advLoadScene(過場 menu)、mini 戰鬥(battle/聖甲蟲)、advStartBattle+advFinishCutscene+_detectCurrentBgm(雙王 boss)、mini 結算→下一場景、相遇 BGM 共 9 處。',
      '埃及雙王 BOSS(hero_db.js 批一已建,本批接線/天賦補完):_buildEgyptBossTeam 回傳法老王(光 isEgyptBoss)+埃及豔后(暗 isEgyptBoss),getBossTeam 5 處接線;雙王 s1/s2(王權法杖/黃沙風暴/魅惑之吻/蛇與蜜)execSkill 玩家路徑 + aiUseSkill AI 路徑雙路徑(鐵律 1.128);爆發(太陽神的審判 群體分攤900%+我方回25% / 尼羅河的詛咒 全體暗200%+50%查封)_runBurst 實作。',
      '埃及雙王天賦(index.html):法老威儀傷害加成(doDmg let dmg=rawDmg 後 +10%/層,鐵律 1.110)+ 疊層(startTurn 回合開始 +1,上限 10)+ 受傷減 1 層(doDmg 受傷 hook;機率見 v3.15.2 升級);蛇瞳魅影(豔后受傷使攻擊者強力魅惑 1 回合;機率見 v3.15.2 升級);互相復活(startTurn 行動前檢查,一王倒下另一王存活→耗自身最大 HP5%(v3.15.2 由當前HP10%改)復活倒下者至最大 HP25%;雙王同時陣亡不觸發=必須同時擊殺;以 isEgyptBoss 守門僅 BOSS 版觸發)。',
      '埃及招募 + 防呆 + 圖鑑(index.html):打雙王 S 評價時對法老王/埃及豔后各自獨立 15% 機率收服(未擁有+非借用,advSaveUnlockedHero source=egypt_boss_clear,已加入 BOSS_SOURCES/_LEGIT_SOURCES 白名單避免異常誤報);防呆 6 處(newHero/newHero_replace/focusHero/_renderHeroDetail/G.p1 二重保險×2)讀 EGYPT_BOSS_HERO_STATS 弱化版(法老王 hp48/atk30/sp14/spd8、豔后 hp38/atk12/sp34/spd16,避免招募版誤用 11500/10500 BOSS HP);_advGetHeroPoolForStage egypt 分支(法老王/埃及豔后 2 位)。',
      '埃及雙王稀有度(index.html):加入 SUMMON_RARE_HEROES 取得 SSR 稀有度,但為「埃及 BOSS 戰限定收服」→ 從 SSR 召喚抽取(rare_ssr/legacy rare_hero)與自選券(_summonTicketUnrecorded)以 EGYPT_EXCLUSIVE_HEROES 排除(不可召喚/不可自選,只能打 BOSS 收服);加入 ADMIN_ALL_HEROES(GM 可發放);_nonStudentInRare 加雙王(學生設計計數準確)。',
      '埃及入口閘門(index.html _egyptTrySelect):本版【僅開放管理員測試】(老師指示)——非管理員(含已達 4 名 Lv25 者)一律顯示「即將開放」彈窗不進入;唯管理員 _isAdminUser() 可進入 selectAdvStage(egypt)。日後正式開放只要把此閘門改回 4 名 Lv25 解鎖判斷即可。ADV_STAGES.egypt 介紹頁 + EGYPT 過濾 Set(EGYPT_BOSS_HEROES/EGYPT_EXCLUSIVE_HEROES/EGYPT_ALL_CHARACTERS/EGYPT_ARENA_EXCLUDE)批一已建。',
      '埃及獎章(index.html MEDAL_DEFS):新增「埃及關」分類 5 枚(egypt_unlock 金字塔之鑰 / egypt_first_clear 雙王伏誅 / egypt_s_clear 尼羅河的榮光 / egypt_scarab 黃金聖蟲 / egypt_recruit_king 王者結盟);定義 _checkEgyptUnlockMedal / _checkEgyptClearMedal(grade) / _checkEgyptRecruitMedal;_checkMedalDefeat 加聖甲蟲→egypt_scarab;_egyptHardSClear 旗標(S 評價通關埋未來隱藏終局 gate hook,本版只埋不實作)。',
      '埃及題庫(adv_quiz_db.js 批一已完成):末尾追加 30 題古埃及主題(id 3171-3200,grade/subject=埃及,22 普通+8 我很會),戰鬥題庫 filter subject===埃及,無撞號。',
      // ── 世界 BOSS 龍王 ──
      '龍王雙動作確認 + 追擊鎖血(world-boss.js):確認 _safeBossEndAction 的「主行動 + 追擊普攻」雙動作邏輯為「所有世界 BOSS 龍王」共用(以 _wbActionCount 計數,非火龍王專屬)→ 火山炎龍王與翠綠森龍王行為一致。_wbAdvBossNormalAtk 新增 targetLowest 參數:追擊普攻(第 2 次行動)傳 true → 鎖定當前 HP 最少的存活玩家;主行動的 20% AI 普攻維持隨機目標。',
      '龍王輪流表詳細能力鈕(world-boss-ui.html):_wbAdvOpenBossInfoPopup 重構接受 bossIdArg → 可查看「任一龍王」能力(HP/atk/sp/spd 優先讀 HERO_DB,其次 lineup maxHp);_wbRenderLineup 每隻龍王下方加按鈕——已實裝(HERO_DB 有資料,火/草)顯示「📖 詳細能力」開該龍王彈窗,未實裝 6 隻顯示「🔒 能力即將解放」佔位。',
      // ── 排行榜 ──
      '龍王排行榜逐回合明細新增「各英雄傷害來源總表」(admin_panel.js _wbShowRoundDetailModal/_renderBattles):每一場明細頂部加總本場每回合各英雄傷害並由高到低排序,附占比長條;單一英雄占比 ≥ 60% 標紅 ⚠ 警示,讓 GM 一眼看出哪隻英雄傷害異常(疑似 BUG/作弊)。資料源沿用既有 wbDamageDetail/{uid}(不含聯手爆發 5000),不改寫入端。',
    ],
    adminOnly: false,
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.14.27(2026-06-13)— 🦅 第三隻 UR「主神奧汀」實裝 + 🦊 玉藻前爆發改 + 🐉 八龍王正名重排+至寶頁
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.14.27',
    date: '2026-06-13',
    brief: [
      '🦅【第三隻 UR ── 主神奧汀 登場！】',
      '   ・繼藝天使、魔劍姬之後,第三隻最高稀有度「UR」降臨!北歐神話的眾神之父,手持永恆之槍的<b>最強反擊坦克</b>。',
      '   ・👁️ 天賦「奧汀之眼」:每回合替最脆弱的同伴(含自己)附上「注視」,被注視的人受傷會<b>免疫並由奧汀反擊</b>;而且對手的單體攻擊大多會<b>轉移到奧汀身上</b>替隊友擋下。',
      '   ・🔱 S1「岡格尼爾的制裁」:必中、必爆、無視一切庇護的一槍重擊,並讓對手<b>強力麻痺 1 回合</b>。',
      '   ・🛡️ S2「英靈殿的守望者」:號令<b>全場敵人只能攻擊奧汀</b> 1 回合,同時自己受傷大幅減少(對 BOSS 各有 50% 機率失效)。',
      '   ・🌅 爆發「諸神的黃昏」:主動發動會讓全隊化為彈藥傾力一擊;而且當<b>全隊倒下時會自動發動一次</b>,讓眾人浴火重生並反擊全場!(每場限 1 次)',
      '   ・取得方式同前兩隻 UR:<b>無法抽取</b>,只能靠考試優異或特殊優良表現由老師頒發(僅用於冒險,鬥技場不可使用)。',
      '🦊【玉藻前 爆發技改版】',
      '   ・爆發「禍世邪魅」改成<b>火屬性特技 200%、隨機攻擊 4 次</b>(打到的目標若倒下會自動轉移到別的對手),命中更兇猛、目標更靈活。',
      '🐉【八隻世界龍王正名 + 順序整理】',
      '   ・八隻龍王全部正名,並讓「元素龍系列」頁面最下方的<b>排序與當前龍王標記</b>對齊實際輪替順序:🔥火山炎龍王 → 🌿翠綠森龍王 → 🪨山岳地龍王 → 🌪風暴雷龍王 → 💧深淵海龍王 → ⚫邪骨暗龍王 → ☀神聖光龍王 → 🌌星辰幻龍王。',
      '   ・每隻龍王的<b>所在區域</b>也都標示出來了。',
      '💎【八龍王專屬至寶 全數進入至寶圖鑑】',
      '   ・對應正名,「火龍王之牙→<b>炎龍王之牙</b>」、「草龍王之鬚→<b>森龍王之鬚</b>」。',
      '   ・另外 6 隻龍王的專屬至寶(地龍王之麟、雷龍王之翼、海龍王之爪、暗龍王之骸、光龍王之羽、幻龍王之角)<b>已先放進至寶圖鑑</b>,目前顯示「🔒 尚未開放」,能力之後會陸續公開,敬請期待!',
    ],
    items: [
      // ── 主神奧汀 ──
      '主神奧汀(第三隻 UR)資料層:hero_db.js 新增 HERO_DB/AVATARS(🦅)/HERO_IMGS(主神奧汀.png)/HERO_PORTRAIT_LIBRARY/HERO_IMG_POS/HERO_THUMB_POS/HERO_BIO/BURST_DB(諸神的黃昏)/HERO_LORE/HERO_TRAIT(奧汀之眼 👁️)/BURST_GIF_DB(太陽火球.gif)/HERO_CATEGORIES_OVERRIDE([dmg,ctrl])/HERO_HEX_OVERRIDE/_TRAIT_LV_INFO/_v384HpFix(108);加入 _RARITY_UR_HEROES 與 ADMIN_ALL_HEROES。',
      '主神奧汀引擎層(index.html):天賦「奧汀之眼」於 startTurn 對最低 HP% 友方(含自己)施加「注視」_odinGaze(配額 1+天賦Lv,上限 4,每人最多 2 層);doDmg 兩段 hook —(ODIN-1)對手單體直接攻擊非奧汀友方時 75%+天賦Lv×5%(上限 95%)轉移由奧汀承受(_odinRedirect 防遞迴);(ODIN-2)被注視者受對手直接攻擊時免疫該次傷害並消耗 1 層、由奧汀以攻擊 100%+10%/天賦級反擊(奧汀倒下則不觸發)。皆置於 doDmg 頂部、僅用 rawDmg/target/opts(鐵律 1.110),AoE/DoT/反擊/治療不觸發。',
      '主神奧汀 S1「岡格尼爾的制裁」(execSkill+aiUseSkill 雙路徑,鐵律 1.128):攻擊 300%(每級 +5%)+ 目標最大 HP 20% 對 1 名對手,必中、無視有利、必定暴擊(forceCritRate),命中後強力麻痺 1 回合(直接 push para dur:1 _strong,對齊天神宙斯慣例);走 doDmg → 世界 BOSS 5000/下上限自動生效。',
      '主神奧汀 S2「英靈殿的守望者」(execSkill+aiUseSkill):全體對手強力挑釁(strongTaunt dur:2)只能普攻奧汀 + 自身 _odinGuard 受傷 -30%(每級 +3pp,上限 60%,doDmg 讀 _pct 減傷);_tauntImmuneCheck 排除八岐大蛇等,對 BOSS(BOSS_NAMES)各 50% 機率失效。',
      '主神奧汀爆發「諸神的黃昏」:(主動,_runBurst)全體存活友方(含奧汀)降 HP1,以全隊 4 槽最大 HP 總和 ×500%(每升 +10% _burstMult)對敵平分(必中無視有利);(被動,checkWin 頂部 hook)奧汀在隊且全隊倒下且對手有活口且本場未用過時,自動 1 次:徹底清結算守門旗標(鐵律 1.145)後全隊 HP1 復活 + 無敵 1 回合,以全隊最大 HP 總和 ×1000% 對敵平分。C=全 PvE 含世界 BOSS,每場限 1 次(_odinRagnarokUsed);鬥技場禁用 UR 不會誤觸。',
      '主神奧汀技能升級:SKILL_UPGRADE_DEF 註冊 special_odin_s1(放大攻擊 300% 乘算)/special_odin_s2(放大受傷 -30% 加法 +3pp/級);BURST_UPGRADE_DEF 加奧汀「諸神的黃昏」每升 +10% rows;newHero 初始化 _odinRagnarokUsed=false;圖鑑「近期活動與新角色」UR 主題改為三位 UR(克雷爾/伊莉雅/奧汀)三圖三段,新增 buildOdinDebutSection 金白聖光介紹卡(資料驅動)。',
      // ── 玉藻前 ──
      '玉藻前爆發「禍世邪魅」改版(hero_db.js BURST_DB + index.html _runBurst):移除原魅惑/吸血,改為以特技 200% 火屬性、隨機攻擊 4 次(每次重選目標,目標倒下自動轉移),doDmg 帶 elem:fire/isSkill;舊魅惑吸血 hook 成 inert dead code 無害保留。',
      // ── 龍王正名 ──
      '八龍王正名(只改顯示名,id 全保留 → 玩家已領至寶/排行榜/雲端當前龍王 wbCurrentBossId 全相容,零存檔風險):維蘇威火山龍王→火山炎龍王、翠玉草龍王→翠綠森龍王、深海冰龍王→深淵海龍王(element 仍 water)、風雷雲龍王→風暴雷龍王、山岳土龍王→山岳地龍王、不死骨龍王→邪骨暗龍王;神聖光龍王/星辰幻龍王不變。同步更新 WORLD_BOSS_LINEUP.name 及 HERO_DB/BURST_DB/HERO_TRAIT/HERO_LORE/HERO_BIO/HERO_IMGS 對應 key 與全部 UI/by-name 邏輯字串(world-boss.js/index.html/world-boss-ui.html/admin_panel.js/本檔)。⚠ 火龍王立繪圖檔仍沿用原始檔名「維蘇威火山龍王.png」(GitHub 實檔),改名只動 key 不動圖檔名以免 404。',
      '龍王列表排序修正(world-boss-ui.html _wbRenderLineup):原本照 WORLD_BOSS_LINEUP 陣列序顯示且寫死 i===0 為「當前」→ 改為照 _WB_BOSS_ROTATION(火→草→土→風→水→暗→光→幻)排列、「當前」標記改依 _wbGetCurrentBossId() 動態判定,並顯示每隻龍王的所在區域(scene)。',
      // ── 至寶 ──
      '龍王至寶正名 + 補齊(index.html TAIWAN_TREASURES):dragon_fang_fire name 火龍王之牙→炎龍王之牙、dragon_whisker_grass name 草龍王之鬚→森龍王之鬚(僅改 .name 顯示,id/圖檔名/specialEffects/bossId 全不動,效果以 id+effect-flag 判定不受影響)。新增 6 個龍王至寶定義 dragon_scale_earth(地龍王之麟)/dragon_wing_thunder(雷龍王之翼)/dragon_claw_sea(海龍王之爪)/dragon_bone_dark(暗龍王之骸)/dragon_feather_light(光龍王之羽)/dragon_horn_omni(幻龍王之角),圖檔用老師指定檔名(土/風/冰/骨/光/幻龍王之XX.png),baseStats 全 0、specialEffects 空、abilityText「尚未開放」、comingSoon:true;全部加進 _TAIWAN_TREASURE_ORDER(照龍王輪替序)。',
      '至寶圖鑑灰色佔位(_renderTaiwanTreasureGrid):comingSoon 至寶顯示灰階圖 + 右上「🔒 尚未開放」徽章 + 狀態「🔒 尚未開放/敬請期待」,點擊顯示提示而非進詳細頁(避免顯示誤導的取得管道)。6 個新至寶暫不接入排名領獎映射(_WB_DRAGON_TREASURE_MAP/_WB_DRAGON_T_MAP 維持只有 vesuvius/cuiyu)→ 不會發放空能力至寶,符合「尚未開放」;日後啟用某龍王至寶時:填 baseStats/specialEffects/abilityText、移除 comingSoon、並在兩張映射表補該 boss→至寶。',
    ],
    adminOnly: false,
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.14.26(2026-06-13)— 💎 草龍王之鬚補進至寶圖鑑(v3.14.24 漏列,圖鑑看不到)
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.14.26',
    date: '2026-06-13',
    brief: [
      '💎【草龍王之鬚進入至寶圖鑑】',
      '   ・打草龍王世界 BOSS 排名拿到的專屬至寶「🌿 草龍王之鬚」,現在會<b>正確出現在「💎 至寶圖鑑」裡</b>了(之前圖鑑漏列,只看得到火龍王之牙)。',
    ],
    items: [
      '草龍王之鬚補進至寶圖鑑:dragon_whisker_grass 的完整定義(name/icon/特效/abilityText)早在 v3.13.73 就有、排名獎勵發放也正常,但 v3.14.24 漏把它加進 _TAIWAN_TREASURE_ORDER —— 至寶圖鑑 _renderTaiwanTreasureGrid 正是以此陣列 forEach 生成卡片,故圖鑑跳過未顯示。已在 dragon_fang_fire(火龍王之牙)之後補上 dragon_whisker_grass。此陣列同時供至寶修復 / 卸下 / 同槽排序使用,補入後草龍王之鬚在這些邏輯也一併被正確涵蓋,無副作用。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.14.25(2026-06-13)— 👊 普攻顯示屬性 + 🐉 選完寵物 BOSS 卡頓修復 + 🔥 鳳凰爆發強化 + 📖 草龍王能力介紹修正
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.14.25',
    date: '2026-06-13',
    brief: [
      '👊【普通攻擊顯示屬性】',
      '   ・行動面板上的「普通攻擊」按鈕,拳頭圖示改成<b>該英雄目前的元素屬性圖示</b>(🔥火 / 💧水 / 🌿草 / 🪽風 / 🪨土 / ⭐光 / 🌙暗),一眼就知道自己普攻是什麼屬性的傷害。',
      '🐉【世界 BOSS 戰:選完寵物不再卡住】',
      '   ・在世界 BOSS 戰答對題目、選到「獲得寵物」並選好英雄後,<b>BOSS 會立刻接著行動</b>,不會再卡一陣子才動了。',
      '🔥【鳳凰爆發強化】',
      '   ・鳳凰的爆發技「神炎之翼」<b>基本傷害 130% → 180%</b>;附加的「熾羽」灼燒每層傷害,從固定 15 HP 提升為 <b>15 HP + 最大HP 3%</b>(疊滿 5 層威力更可觀)。',
      '📖【草龍王能力介紹修正】',
      '   ・世界 BOSS 大廳點「📖 BOSS 能力詳細介紹」,打草龍王時終於會顯示<b>草龍王自己的招式、天賦與護盾屬性</b>(之前還是顯示火龍王的業火灼燒 / 炎之意志)。大廳預覽卡的描述與屬性也一併修正。',
    ],
    items: [
      '普攻按鈕元素圖示:b-atk 按鈕內新增 <span id="b-atk-elem">,顯示玩家行動面板時讀 ELEMENT_DB[a.element].icon 動態替換原本寫死的 👊(英雄無 element 時後備 👊)。此更新區每次英雄行動都會重跑,切換英雄時圖示即時更新。',
      '選完寵物 BOSS 卡頓根治:根因為 advRewardConfirmUse 的 BOSS 路徑對 get_pet(會開「寵物選擇器」、設 _advRewardPendingPetPicker=true 並 return)仍提前呼叫 _advFinishRoundQuiz → 把 _advRoundQuizPending 設 false 並排一個 200ms 後的 startTurn,但該 startTurn 撞上仍開著的寵物選擇器 overlay 而 return 且不重排;待玩家選完寵物走 advOnQuizSkip(靠 _resumeTimers 推 _pendingTimers queue)卻找不到那個真 setTimeout → BOSS 卡住,只能等 15 秒 watchdog 或 iPad 回前台 nudge。修法:get_pet 開了選擇器時 advRewardConfirmUse 不提前收尾,改由 _advFinishPetPick 在玩家選完寵物後依 _advRoundQuizPending 呼叫 _advFinishRoundQuiz(BOSS 戰新回合答題,排 startTurn 推進對手)或 advOnQuizSkip(其他情境)。小怪戰走獨立 mini 路徑(_advMiniApplyReward + onDone),不受影響。',
      '鳳凰爆發「神炎之翼」數值(老師調整):基本傷害倍率 1.30→1.80(基礎 180%,等級加成保留每級 +10%,滿級 230%);熾羽 DoT 每層由 15 HP 改為 15 + Math.floor(最大HP×3%),N 層 = (15 + 最大HP×3%) × N(a.hp 為最大 HP)。hero_db.js BURST_DB 鳳凰文字同步。熾羽仍走 fixedDmg → 世界 BOSS 戰自動受 5000 單次上限保護。',
      '草龍王 BOSS 能力詳細介紹改資料驅動(world-boss-ui.html _wbAdvOpenBossInfoPopup):原本整段寫死火龍王(業火灼燒 / 龍吼震懾 / 天崩之炎 / 炎之意志 / 火風土暗護盾 / 火紅配色)→ 改為依當前龍王讀 HERO_DB[名].s1/s2、BURST_DB[名]、HERO_TRAIT[名] + lineup 的 element/shieldElements/shieldLayers,護盾元素 / 破盾元素(用 ELEMENT_DB 剋制表 vs_dis 動態算)/ 主題配色全部動態。大廳預覽卡(wb-boss-preview)的描述與屬性加 class 由 _wbApplyCurrentBossSkin 統一動態更新。火龍王顯示不變(讀回自己的資料),草龍王正確顯示劇毒藤縛 / 萬刃落葉 / 翠龍·萬藤絞殺 / 翠之意志 / 草盾×2+水+光,破盾火/風/暗。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.14.24(2026-06-13)— 🐉 草龍王完整可玩:專屬至寶正名 + 個性開場白/氣話 + 燃燒平衡 + 龍王機制凌駕確認
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.14.24',
    date: '2026-06-13',
    brief: [
      '🐉【草龍王(翠綠森龍王)完整可玩】',
      '   ・進入草龍王世界 BOSS 戰會正確顯示<b>草龍王立繪</b>並播放<b>專屬背景音樂</b>。',
      '   ・草龍王的排名專屬至寶正名為 <b>🐉 草龍王之鬚</b>(之前各處誤顯示「火龍王之牙」)。',
      '   ・草龍王擁有<b>自己的開場白與戰鬥對話</b>,不再講火龍王的台詞。',
      '⚖【平衡微調】草龍王的「燃燒」在<b>護盾啟動期間改為一樣吃 80% 減傷</b>(對齊天賦說明:火仍是牠的剋星,但護盾期間燃燒威力會被壓低)。',
      '🛡【龍王機制更穩固】再次確認:任何「無視天賦 / 穿透護盾 / 封印」類技能都<b>無法繞過龍王的受傷上限與元素護盾</b>,龍王的天賦凌駕於一切技能之上。',
    ],
    items: [
      '燃燒乙(老師裁示):移除草龍王燃燒 tick 的 _dotIgnoreShield → 護盾期間燃燒固定值改吃 80% 減傷(普通 -300→-60、強力 -600→-120),與天賦文字一致。中毒/猛毒維持「無視護盾減傷」(仍受 5000 單次上限),為其專屬設計、不在本次調整範圍。',
      '排名至寶正名:world-boss.js 新增 _WB_DRAGON_TREASURE_MAP + _wbGetCurrentDragonTreasureId/_wbGetCurrentDragonTreasureName();world-boss-ui.html 排名獎勵清單與 index.html _wbShowDragonTreasureInfo(? 彈窗、icon alt、副標)改依當前龍王動態顯示(翠玉草=草龍王之鬚 dragon_whisker_grass)。⚠ 與 index.html 領獎發放的 _WB_DRAGON_T_MAP 為兩份對照表,內容須同步(目前皆 vesuvius/cuiyu 兩筆)。',
      '龍王機制凌駕(確認,無程式變更):受傷上限 5000 + 元素護盾 80% 減傷在 doDmg 的 worldboss 分支「無條件」套用(無 ignoreBuffs/fixedDmg 例外閘);神槍手「穿透護盾」只穿一般 target.shield,不影響龍王的 _wbShields;天賦(上限/護盾/免疫)為被動、依龍王名判定觸發,無「封印天賦」狀態可關閉它(seal/sealall 只封技能使用)。經逐一檢查 _dotIgnoreShield 全檔僅剩中毒/猛毒一處(燃燒乙後),其餘一切傷害皆吃護盾減傷+5000 上限。',
      '每隻龍王專屬開場白:_wbBossOpeningRoar 改用 _WB_BOSS_ROAR_LINES(維蘇威=火紅三句 / 翠玉草=綠林三句)+ _WB_BOSS_ROAR_COLOR(咆哮字色配元素),依當前龍王挑,後備維蘇威。',
      '每隻龍王專屬戰鬥氣話:_ADV_BOSS_SKIP_LINES_MAP 新增「火山炎龍王」(火,6 句)與「翠綠森龍王」(草,6 句);並把翠綠森龍王加入 _SKIP_MAIN_BOSS_SET 讓挑選正確命中。',
      '首頁世界 BOSS 卡副標:原本寫死「🐉 火山炎龍王・全伺服器累積排名」,把龍王名包進 <span class="wb-curboss-nm"> → 由換皮 _wbApplyCurrentBossSkin 統一更新成當前龍王(配合 v3.14.23 onSnapshot 補快取 wbCurrentBossId,重整後也正確)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.14.23(2026-06-13)— 🛠️ 體驗修正:今日不再顯示 + 戰後升級畫面更快 + 草龍王戰修正(立繪/BGM)
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.14.23',
    date: '2026-06-13',
    brief: [
      '🌙【「今日不再顯示」修好了】',
      '   ・「近期活動與新角色」的角色登場公告,按下 <b>🌙 今日不再顯示</b> 之後,今天就真的不會再自動跳出來了(之前按了沒效果,每次回首頁還是會再彈一次)。',
      '⚡【戰鬥結束後,升級畫面跳得更快】',
      '   ・打完冒險關卡(把敵人全部打倒)後,<b>結算獎勵視窗</b> 和 <b>角色升級畫面</b> 之間的等待大幅縮短,不會再讓人以為遊戲卡住了。',
      '🐉【草龍王戰修正】',
      '   ・進入<b>草龍王(翠綠森龍王)世界 BOSS 戰</b>後,終於會出現龍王的立繪背景了(之前因為圖片檔名對不上,戰鬥背景沒有龍王)。',
      '   ・草龍王戰換上<b>專屬背景音樂</b>,和火龍王戰的曲子區隔開來。',
    ],
    items: [
      '修「今日不再顯示」失效:新角色登場公告的讀取端旗標 key 早已升 v4,但寫入端仍寫死 v3 → 讀寫脫鉤 → 旗標永遠讀不到、每次回首頁都重彈。改寫入端統一用 _SKIP_KEY 常數,讀寫永久同步(以後再升版也不會再脫鉤)。',
      '縮短結算↔升級間隔:BOSS 戰 grantBattleExp 內的 await gameCloudSave() 會卡住「按確認 → 升級彈窗」整段流程(共用平板網路慢時最明顯)→ 改為背景非同步存檔(對齊小怪戰 advFinishMiniBattle 既有 fire-and-forget 慣例);EXP/等級在存檔前已套用進 _heroLevels,存檔只是持久化,另有 autosave + 中斷快照雙重保險。',
      '三處戰鬥結算的升級延遲 setTimeout 400ms → 150ms(BOSS 捷徑 / BOSS 英雄相遇後 / 小怪戰),畫面銜接更俐落。',
      'GM 後台修復:「🐉 當前龍王切換」的「選擇龍王」下拉先前是空的(原本只在按「查詢當前龍王」時才填 option,直接點下拉會看不到任何龍王)。抽出共用冪等函式 _adminWbBossPopulateSelect,改成切到該卡時 / 點下拉當下(onmousedown+onfocus)/ 查詢時三處皆預填 8 隻龍王,並預設選中當前龍王。(非 z-index 問題,純粹是 option 尚未產生。)',
      '修草龍王戰沒有龍王圖:世界 BOSS 戰鬥背景 / BOSS 資訊彈窗的立繪 URL 原本由「角色名.png」推導 → 翠綠森龍王.png 不存在(404)→ 戰鬥背景沒龍王。改為優先讀 HERO_IMGS[名稱](翠綠森龍王→老師指定檔名 草龍王.png),後備才用名稱推導;戰鬥內角色 sprite(line 11131)早已走 HERO_IMGS 故不受影響。',
      '新增草龍王專屬戰鬥 BGM:index.html 加 <audio id="bgm-wb-cuiyu-battle">(草龍王BGM.m4a);world-boss.js 加 _WB_BATTLE_BGM_MAP + _wbGetCurrentBossBattleBgmId();world-boss-ui.html 房主/連線/單人三條戰鬥路徑共 5 處原本寫死 bgm-wb-vesuvius-battle 全改動態選用(未來龍王未配 BGM 前後備維蘇威)。',
      '護盾啟動提示動態化:_wbShowShieldHint 原整段寫死維蘇威盾組(火風土暗 / 破盾水土草光)→ 改用當前龍王 shieldElements/shieldLayers + 元素剋制表動態組字串(草龍王正確顯示「草盾×2 + 水盾 + 光盾」、破盾「🔥火×2 / 🌪風 / 🌑暗」),標題改「元素護盾啟動」。',
      '修首頁/戰鬥生成的龍王重整後變回火龍王:stats/global 即時訂閱(onSnapshot)原本漏快取 wbCurrentBossId → _wbGetCurrentBossId() 永遠拿不到雲端值、一律回退預設維蘇威。補快取該欄位 + 快取更新後重套外觀(_wbApplyCurrentBossSkin)。此修復同時讓上方草龍王戰鬥圖/BGM 在重整後仍正確(否則一重整,戰鬥又會抓回火龍王)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.14.22(2026-06-13)— 🐉 龍王輪替修正(結算當下接班+新序)+ GM 歷戰記錄
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.14.22',
    date: '2026-06-13',
    brief: [
      '🐉【龍王輪替系統修正】',
      '   ・龍王倒下後的<b>隔天早上 8:00 結算排名獎勵時,系統會同時自動開啟下一隻龍王</b>(滿血、排行榜全新);不再等到祝福結束才換。',
      '   ・「龍王的祝福」仍然在龍王倒下後<b>持續 72 小時不變</b>(全服 EXP / 知識幣 / 掉寶率加成),與換龍王互不影響。',
      '   ・輪替順序調整為:🔥 火(維蘇威)→ 🌱 草(翠玉)→ ⛰️ 土(山岳)→ 🌪️ 風(風雷雲)→ 💧 水(深海冰)→ 💀 暗(不死骨)→ ✨ 光(神聖)→ 🌌 幻(星辰)→ 🔥 火(新循環)。',
    ],
    items: [
      '接班時機修正(老師裁示):接班原子併入 _wbSettle.trySettle 的結算 transaction —— 隔天 8:00 結算成功的同一筆寫入即 wbCurrentBossId=下一隻 + 新龍王 worldBossHp 滿血 + wbBossSpawnTimes 戳生出時間 + wbAdvanceLog 留底;僅當「被結算者==當前龍王」才推進(GM 補結算舊輪不誤切)。結算後善後:清新榜 / 同步 _cachedGlobalStats / 換皮 / toast。',
      '祝福解耦:移除 v3.14.20「祝福 expiresAt 到期觸發接班」;_wbTryAutoAdvanceBoss 改為相容殼(只巡 wbBossDownTimes 觸發 trySettle);移除登入後與 30 秒輪詢的重複接班呼叫。',
      '輪替順序 _WB_BOSS_ROTATION 改 vesuvius→cuiyu→shanyue→taifeng→shenhai→bushi→shensheng→xingchen→循環(火草土風水暗光幻)。',
      'GM 後台「🏆 世界 BOSS 排行榜」新增「📜 歷戰記錄」分頁:結算 transaction 額外存 leaderboardSnapshot(每位上榜玩家 rank/teamKey/teamLabel/totalDmg/tier)+ spawnAt/bossDownAt/settledAt;GM 端讀 stats/global.wbSettlement 倒序列出每輪戰績、可關鍵字篩選玩家,供補償核對與 BUG 檢查(即使排行榜被清空仍保留快照)。',
      'spawn 時間記錄:GM 切換卡 + 自動接班 transaction 皆寫 wbBossSpawnTimes[bossId]=now。',
      'Firestore Rules:stats/global 為黑名單制(僅擋 maintenance/gmBroadcast)→ wbCurrentBossId/worldBossHp/wbSettlement/wbBossSpawnTimes/wbAdvanceLog/wbBlessing 皆已自動放行,本次無需改 rule。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.14.20(2026-06-13)— 🐉 龍王輪替系統:翠綠森龍王參戰!/ BOSS 鎖血尊嚴 / 平衡調整
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.14.20',
    date: '2026-06-13',
    brief: [
      '🐉【世界 BOSS 龍王輪替系統登場!】',
      '   ・龍王的祝福(72 小時)結束後,系統會<b>自動開啟下一隻龍王</b>!輪替順序:火山炎龍王 → 🌱 翠綠森龍王 → 深海冰 → 風雷雲 → 山岳土 → 不死骨 → 神聖光 → 星辰幻,循環不息!',
      '   ・第二棒「翠綠森龍王」棲息於亞馬遜雨林,以藤蔓、劇毒與飛葉守護綠林——破盾組合、燃燒弱點都和火龍王完全不同,快研究新戰術!',
      '   ・每隻龍王的排行榜、單人最佳紀錄、擊殺獎章都各自獨立計算;新龍王登場時滿血+排行榜全新開局。',
      '   ・翠綠森龍王的排名獎勵龍王至寶是「🌿 草龍王之鬚」(取代火龍王之牙)!',
      '',
      '🛡️【BOSS 鎖血尊嚴:鎖血至高無上,不可被突破!】',
      '   ・修正阿蘇火山龍王爆發技「超光速衝擊波」等多段攻擊,能在同一回合連續打穿 BOSS 的 50% 鎖血和 1 HP 鎖血、直接秒殺 BOSS 的問題。',
      '   ・現在 BOSS 觸發鎖血的那一回合,將<b>絕對免疫一切傷害</b>(包括爆發技、必中、無視有利)——下一回合才能繼續輸出。王者的尊嚴不容挑戰!',
      '   ・阿蘇火山龍王的爆發砲擊遇到鎖血目標會自動轉向其他對手;全部對手都鎖血時就帥氣收手(不浪費自己的 HP)。',
      '',
      '⚖️【平衡調整】',
      '   ・機關王雙人組 S2「重力加速攻擊」:能量消耗 3 → <b>6</b>,公式改為<b>(最大HP的一半+速度)×150%</b>。',
      '   ・機關王雙人組 爆發「霸王投石機」:主傷害改為<b>最大HP×100%</b>×4 次(原 200%)。',
      '   ・雅典娜 S1「進攻號令」:能量消耗 4 → <b>5</b>,傷害改為全隊攻特較高值總和的 <b>200%</b>(大幅加強!)。',
      '   ・雅典娜 S2「新生的誕生」:能量消耗 5 → <b>6</b>。',
    ],
    items: [
      '當前龍王切換系統:stats/global.wbCurrentBossId + _WB_BOSS_ROTATION(維蘇威→翠玉草→其餘 LINEUP 順序循環)+ helper _wbGetCurrentBossId/_wbGetCurrentBoss/_wbGetNextBossId(world-boss.js);全四檔約 30 處寫死 vesuvius 改動態(index 13 處/world-boss.js 4 處/world-boss-ui 邏輯 11 處+顯示換皮 _wbApplyCurrentBossSkin)。',
      '自動接班 _wbTryAutoAdvanceBoss:祝福 expiresAt 過期 → runTransaction 守門 wbBlessing.advancedAt → 寫 wbCurrentBossId=下一隻+worldBossHp[新]=滿血+advancedTo 留底,事後 best-effort 清新榜;掛登入 1800ms 與祝福標籤 30 秒輪詢。⚠ Rules 需開放玩家寫 stats/global 的 wbCurrentBossId 與 wbBlessing。',
      'GM 後台「🐉 當前龍王切換」卡(_admin-wbboss-section,三點同步):查詢當前/下拉 8 隻/切換並開戰(滿血+清榜+ceasefire false)/開戰/休戰。',
      '排名獎勵龍王至寶按 BOSS 映射(settle pending):vesuvius→dragon_fang_fire、cuiyu→dragon_whisker_grass,其餘後備火龍牙;領獎窗/補償 v2 的龍至寶名全改依 dragonTreasureId 動態(含證據 prefix dragon_whisker)。',
      'BOSS 鎖血尊嚴(鐵律):_applyBossLifelineProtection 任一段鎖血觸發即標 _lifelineImmuneRound=G.round,同回合所有後續傷害(主路徑+fixedDmg 路徑+DOT,爆擊額外經 _bossLifelineFiredThisHit 歸零)一律 0;下一回合恢復可傷=不卡死。阿蘇爆發 _asLocked 判定:鎖血目標自動轉向、全鎖血即收手。',
      '平衡:機關王 S2 c3→6 且公式(最大HP)→(最大HP×0.5)+spd(exec/ai 雙路徑同步);機關王爆發 _gmBDmg 2.00→1.00(rows/渲染器/hero_db 同步 100% 基準);雅典娜 S1 c4→5 且 _atMult=2.0×(1+lv×0.05)(exec/ai 雙路徑+fd「總和的200%」,dmg 泛用渲染器自動同步);雅典娜 S2 c5→6。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.14.19(2026-06-12)— 🎁 世界 BOSS 排名獎勵「至寶遺失」精準補償 v2
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.14.19',
    date: '2026-06-12',
    brief: [
      '🎁【世界 BOSS 排名獎勵:至寶遺失精準補償】',
      '   ・修正部分同學領完龍王排名獎勵後,「火龍王之牙」或「未收錄至寶」(例如台北 101 槍)從至寶管理欄位消失的問題。',
      '   ・現在系統會在登入時逐件檢查「領獎當下確實獲得的每一件至寶」是否還在——若被先前的存檔問題吃掉,會跳出 🎁 補發視窗,照原本獲得的那一件原樣補回(包括擲骰抽中的火龍王之牙)!',
      '   ・領獎時的擲骰結果也會永久記錄在雲端,之後不論發生什麼狀況都能精準核對補發。',
      '   ・如果你的至寶不見了:重新登入遊戲一次,看到 🎁「排名獎勵補發」視窗按下領取即可;若還是沒有,請再回報老師個案處理。',
    ],
    items: [
      'claimPending 擲骰後將實際發放結果寫回 wbPendingAward.grantedManifest(dragonGranted/treasureId 等,setDoc merge 雲端永久留底)。',
      '補償 v2(_wbCheckAndCompensateLostTreasure):移除「歷史有 wb_rank 即 return」盲點(歷史在、東西被吃 → 永不觸發);改證據導向 — grantedManifest > 歷史 wb_rank* 紀錄 id(本地+雲端聯集)> 必得推定,逐件對 _taiwanTreasureData 比對,缺了照原 id 精準補回(kind exact,冪等;history 記 wb_rank_compensate_exact)。',
      '機率項(2-5 名龍牙 75%)有發放證據者不再誤顯示「沒抽中」說明,改列入精準補發;無證據者維持說明窗。隨機推定型補發仍以歷史 wb_rank_compensate 防重抽。',
      '受害例:5408 第 2 名學生(龍牙擲中+台北101槍必得,雙雙被吃,v3.14.17 補償因歷史紀錄存在而未觸發)。老師亦可由 GM 後台補償區勾選至寶個案即時補發(_fbCompensatePlayer B8 已支援)。',
      'GM 後台:補修「🌟 龍王的祝福」控制卡 sidebar 登錄(v3.14.16 修復檔當時漏上傳,線上仍 v3.14.15 → 卡片永遠隱藏);本版 admin_panel.js 三點同步補齊(模板 HTML+SIDEBAR_ITEMS+SIDEBAR_GROUPS「🐉 世界 BOSS」群,鐵律 1.140),戳 v3.14.19。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.14.18(2026-06-12)— 🦉🌋 雙新角色登場:雅典娜+阿蘇火山龍王 / 四下自然題庫修復
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.14.18',
    date: '2026-06-12',
    brief: [
      '🦉【新角色登場介紹:雅典娜】',
      '   ・由 5 年 4 班 許芷菱 同學設計的第 79 號英雄「雅典娜」正式加入 SSR 召喚池!',
      '   ・從神話降臨戰場的智慧與戰爭女神——一手神盾守護同伴、一手長槍指引勝利!',
      '   ・🛡️ 天賦「神盾庇護」:受到傷害時有 40% 機率,由埃癸斯神盾把傷害減輕到只剩 40%!並且完全免疫所有「不能行動」的狀態(暈眩/冰凍/睡眠/麻痺/陷阱,連強力版都擋得住)!',
      '   ・⚔️ S1「進攻號令」:集合全隊存活夥伴「攻擊或特技取較高者」的總和,發動必中且無視有利狀態的全軍一擊!',
      '   ・💖 S2「新生的誕生」:讓 1 名友方 HP 完全回滿(倒下的也能復活!),再送上最大 HP 100% 的護盾與「增強術」(攻擊、特技、速度 +50%)2 回合!',
      '   ・👑 爆發「戰爭女神的權威」:設置戰場卡「女神權能」2 回合——全體友方每次行動完有 60% 機率立即再行動 1 次,而且全隊技能耗能 -50%(最少 1 點)!',
      '',
      '🌋【新角色登場介紹:阿蘇火山龍王】',
      '   ・由 5 年 3 班 柯靖為 同學設計的第 80 號英雄「阿蘇火山龍王」正式加入 SSR 召喚池!',
      '   ・守護日本阿蘇火山的巨龍,掌管岩漿火焰之力和火山噴發——愈瀕死愈兇猛!',
      '   ・🌋 天賦「頑強」:HP 第一次低於 10% 時(就算被致命一擊打倒也會以 1 HP 撐住!),攻擊力和特技立刻變為 2 倍,並獲得「不死」狀態 2 回合!',
      '   ・🐲 S1「龍神分身術」:用特技 100% 治療全體友方,並讓全隊免疫傷害和不利狀態 1 回合!',
      '   ・🔥 S2「火山噴發」:以(攻擊+速度)的 250% 轟出火屬性重擊,讓目標陷入「燃燒」2 回合!',
      '   ・💥 爆發「超光速衝擊波」:把自己的生命化為彈藥連段砲擊!每段消耗最大 HP 10%,造成(失去的 HP × 20 + 特技 100%)傷害,一路打到自己 HP 低於 15% 為止——必中無視有利,每段獨立機率暴擊,目標倒下還會自動轉向 HP 最高的對手!',
      '',
      '📚【修復:選「四下自然」沒有出現問答題目】',
      '   ・修正玩家回報的問題:科目選「四下自然第三單元(水的移動)」或「四下自然第四單元(認識臺灣的環境)」時,小怪戰與 BOSS 戰都不會出題(畫面顯示「題庫持續為空,自動跳過答題環節」)。',
      '   ・原因是這 94 題先前被收錄到錯誤的題庫分類;現在已歸位,加強提醒期間(6/15~6/23)複習衝刺不受影響!',
      '',
      '🃏【新規則:爆發技能的戰場卡只能被爆發戰場卡取代】',
      '   ・雅典娜「女神權能」、軍師「逆轉神計」抽選的戰場卡、魔界花使‧朱玥「四季戰場」——這些由爆發/技能產生的戰場卡,無法被道具「清潔裝甲車」清除,也無法被一般道具戰場卡頂掉(放置會失敗、道具不會被消耗)!',
      '   ・只有另一張「爆發戰場卡」才能取代它;未來所有爆發技能產生的戰場卡都適用同樣規則。',
      '',
      '🗡️【魔劍姬‧伊莉雅 S2「魔皇鬥氣」升級效果修正】',
      '   ・修正升級效果:現在每升 1 級「受到的傷害減免 +3%」(Lv10 可達 -42%),升級顯示與實戰效果完全同步。',
    ],
    items: [
      '第 79 號英雄「雅典娜」62/14/14/10,5 年 4 班 許芷菱設計;第 80 號英雄「阿蘇火山龍王」60/12/13/15,5 年 3 班 柯靖為設計;雙雙加入 SSR 召喚池。',
      '雅典娜:天賦 40%(+5%/級,Lv5 60%)減傷至 40%(-5pp/級,Lv5 20%)+免疫五大控制含強力(addStatus 主防線+startTurn 安全網);S1 全隊 max(atkv,spv) 加總 fixedDmg 必中無視有利;S2 回滿復活+HP100% 護盾(+5%/級)+增強術×1.5;爆發戰場卡 goddess(60%+5%/級再行動,每人每回合 1 次,技能耗能 ceil(c/2) 最少 1,MAX 3 回合)。',
      '阿蘇火山龍王:天賦頑強(門檻 10%+5pp/級 Lv5 30%,每場 1 次,致命以 1HP 觸發,攻特×2 整場+deathimmune 2T/MAX 3T,_asoCheckTenacity 共用 helper);S1 全體 spv×100% 治療+immune 1T;S2 (atkv+spd)×250% fire 屬性+hellfire 2T;爆發每段自損最大HP10%、傷害(自損×20+spv)×(1+10%/級),mustHit+ignoreBuffs 非 fixedDmg(每段引擎獨立暴擊),目標倒下轉移 HP 最高者,段數防呆 12,迴圈後觸發頑強檢查。',
      '四下自然修復:id 34601~34694 共 94 題原誤附加於 TAIWAN_QUIZ_DB,adv_quiz_db.js(20260612b)檔尾以執行期搬移推入 ADV_QUIZ_DB 並從台灣題庫移除,台灣環島恢復 501 題;小怪戰 _advMiniGetQuizPool 與 BOSS advGetQuizPool 通用分支同時生效。',
      '戰場卡新鐵律:_burstCard:true 標記(女神權能/軍師抽選卡/朱玥四季×2)。清潔裝甲車僅清除非 _burstCard 卡;addField 對 _burstCard 在場時拒絕一般卡放置(回 false,autoUseItem/prepItemUse 不消耗道具不結束行動);帶 _burstCard 的新卡可取代任何舊卡。',
      '天賦優先於技能(老師裁示鐵律):阿蘇頑強攻特×2 觸發時同步翻倍所有暫時 buff/debuff 的還原基準(strengthened._orig*/_strengthOrig*/_weakenOrig*),buff 到期不會吃掉天賦永久成長。',
      '題庫歸類鐵律(老師裁示):新增題庫必確認所屬陣列——一般科目進 ADV_QUIZ_DB、專題進對應專屬 const、台灣環島(帶 bossId)才進 TAIWAN_QUIZ_DB;完工驗證該 subject 在小怪/BOSS 取題分支實際可撈到題。',
      '魔劍姬 S2:減傷 15%+3pp/級(Lv10 42%);每回合首次受傷觸發(+2 能量/攻擊+5%)固定 1 次。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.14.17(2026-06-12)— 🛡 至寶資料保護大補強
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.14.17',
    date: '2026-06-12',
    brief: [
      '🛡【至寶再也不會莫名消失!】',
      '   ・修正一個重要問題:在少數情況下,剛獲得的至寶(例如世界 BOSS 排名獎勵的火龍王之牙、未收錄至寶)可能在下次登入時被較舊的雲端備份蓋掉而消失。',
      '   ・現在至寶資料改用「逐件比較、永遠保留較高等級」的合併方式 — 任何一件至寶、任何投資進度都不會再被舊備份吃掉。',
      '   ・雲端備份的健康評分也把至寶數量納入計算,確保系統永遠選擇「至寶最齊全」的存檔。',
      '   ・⚠ 已經因此遺失至寶的同學(例如世界 BOSS 第 1 名的排名獎勵):不用做任何事!系統會在你登入時自動偵測,跳出「🎁 排名獎勵補發」視窗,點「領取補償」就能拿回火龍王之牙與未收錄至寶!',
      '   ・ℹ️ 機率型獎勵(例如第 2 名以後的火龍王之牙)如果沒抽中,登入時也會跳出一次「擲骰結果說明」,讓你知道是這次運氣沒到、不是系統漏發 — 下次擊敗龍王再挑戰!',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.14.16(2026-06-12)— 🌟 龍王的祝福:補開完成
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.14.16',
    date: '2026-06-12',
    brief: [
      '🌟【龍王的祝福:補開完成!】',
      '   ・修正老師的祝福控制台入口問題,這次倒下龍王的祝福正式補開!',
      '   ・祝福期間全伺服器 EXP・知識幣・物品掉寶率 +25% — 留意「🌍 世界 BOSS 討伐戰」卡片上的金色倒數標籤,把握時間衝一波!',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.14.15(2026-06-12)— 🌟 龍王的祝福:活動補開機制
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.14.15',
    date: '2026-06-12',
    brief: [
      '🌟【龍王的祝福:活動補開機制】',
      '   ・老師(GM)現在可以手動開啟或關閉「龍王的祝福」活動,並自訂持續時數與加成幅度。',
      '   ・這次倒下的龍王發生在祝福系統上線之前,老師會用這個功能把屬於大家的祝福補開——留意世界 BOSS 卡片上的金色標籤!',
      '   ・同時強化了祝福系統的穩定性:就算祝福暫時點不亮,也絕對不會影響龍王討伐與傷害紀錄。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.14.14(2026-06-12)— 🌟 世界 BOSS 入口「龍王的祝福」倒數標籤
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.14.14',
    date: '2026-06-12',
    brief: [
      '🌟【「龍王的祝福」倒數標籤登場!】',
      '   ・祝福生效期間,關卡選擇頁的「🌍 世界 BOSS 討伐戰」卡片上會出現金色標籤:「🌟 龍王的祝福 還有 X 小時｜EXP・知識幣・掉寶率 +25%」。',
      '   ・剩餘時間每 30 秒自動更新,最後不到 1 小時會改成顯示剩餘分鐘,把握加成衝一波!',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.14.13(2026-06-12)— 🐉 世界 BOSS 排名獎勵領獎 + 龍王的祝福正式實裝
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.14.13',
    date: '2026-06-12',
    brief: [
      '🏆【世界 BOSS 排名獎勵:登入領獎彈窗登場!】',
      '   ・龍王倒下後的「下一個早上 8:00」系統自動結算排行榜,之後你一登入遊戲,就會跳出專屬領獎視窗!',
      '   ・按下「🎁 領取獎勵」:知識幣、召喚水晶、EXP 書立刻入帳,還會當場擲骰看你有沒有抽中 🐉 火龍王之牙與 ✨ 未收錄至寶!',
      '   ・修正:第 1 名「救世主級」與第 2~5 名「勇者級」的「未收錄至寶 ×1 必得」獎勵,之前因程式漏洞從未發出,現在會正確發放(救世主優先神話級、勇者優先傳說級)。',
      '   ・全伺服器第 1 名的隊伍成員,還會獲得專屬稱號【屠龍者】!',
      '',
      '🌟【龍王的祝福:正式啟動!】',
      '   ・龍王被全伺服器擊敗後,「龍王的祝福」立即點亮:全體玩家 EXP、知識幣、物品掉寶率 +25%,持續 72 小時!',
      '   ・加成範圍:BOSS 戰與小怪戰的經驗值、戰鬥與答題獲得的知識幣、寶箱怪知識幣、各 BOSS 戰利品與稀有小怪的物品掉落率。',
      '   ・世界 BOSS 大廳會顯示金色祝福橫幅與剩餘時間倒數,大家一起打龍王,全校一起變強!',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.14.12(2026-06-12)— 🤝 借用好友英雄誤解鎖修復
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.14.12',
    date: '2026-06-12',
    brief: [
      '🤝【借用好友英雄規則修正】',
      '   ・修正「邀請好友英雄一起冒險,戰鬥結束後好友英雄被錯誤解鎖到自己帳號」的問題。',
      '   ・借用的好友英雄本來就不會獲得經驗值(他的成長屬於好友本人),這次把漏洞徹底堵上。',
      '   ・想要永久擁有英雄,還是要靠自己解鎖喔!好友英雄只是來「助拳」的!',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.14.11(2026-06-12)— 🛡 世界 BOSS 結算守門補強
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.14.11',
    date: '2026-06-12',
    brief: [
      '🛡【世界 BOSS 結算保護補強】',
      '   ・世界 BOSS 戰(單人練習與組隊房間)維持「純名譽戰」:不發英雄經驗、不發知識幣、不會解鎖英雄。',
      '   ・本次將結算守門的「龍王辨識」從只認火龍王,升級為自動辨識所有現任與未來的世界 BOSS 龍王(包含即將登場的翠綠森龍王),確保任何情況下都不會誤發冒險獎勵。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.14.10(2026-06-12)— ⚙️ 新英雄「機關王雙人組」+ 📖 新手教學指引按鈕
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.14.10',
    date: '2026-06-12',
    brief: [
      '⚙️【新角色登場介紹:機關王雙人組】',
      '<div style="text-align:center;margin:8px 0;"><img src="https://raw.githubusercontent.com/clarebox123jp-art/LXPSGAME/main/%E6%A9%9F%E9%97%9C%E7%8E%8B%E9%81%B8%E6%89%8B.png" alt="機關王雙人組" style="max-width:min(280px,70%);border-radius:14px;border:2px solid rgba(255,187,85,0.6);box-shadow:0 0 18px rgba(255,187,85,0.4);" onerror="this.style.display=\'none\'"></div>',
      '   ・楊兆琪老師設計!活用物理觀念與機械運作原理的天才二人組,全新 R 卡活動限定英雄!',
      '   ・🔍 天賦「機關分析」:輪到自己時有 60% 機率拆解全體對手各 1 個有利狀態——連強力版都拆得掉!',
      '   ・🔗 S1「機關連結」:全隊串聯傳動裝置 2 回合,任何隊友受傷先減 10% 再由全隊平分——團隊就是力量!',
      '   ・⚙️ S2「重力加速攻擊」:(最大HP+速度)×150% 的鋼球重擊,必中且無視有利狀態!',
      '   ・💥 爆發「霸王投石機」:最大HP×200% 連轟 4 發必中無視有利,全隊再獲得拆不掉的「強力連結」!',
      '',
      '🏅【獲得方式:連續答對 20 題「世界機關王大賽」】',
      '   ・和小力、幼兒園小孩一樣!在冒險答題的「💝 養護專題」分類中,新增「⚙️ 世界機關王大賽」題庫(全新 20 題)。',
      '   ・題目認識真實世界的「世界機關王大賽」:賽事起源、STEAM 教育意義、槓桿/齒輪/能量轉換等機關概論!',
      '   ・⚠️ 必須一口氣連續答對 20 題,答錯就歸零重來——挑戰你的機關王知識!',
      '   ・詳細介紹請看主畫面「🎉 近期活動與新角色」的「⚙️ 新角色:機關王雙人組」主題!',
      '',
      '📖【首頁按鈕更新】',
      '   ・「遊戲介紹」改名為「遊戲介紹與說明書」。',
      '   ・介紹視窗底部按鈕改為「📚 新手教學指引」,點下去直接開啟 5 章圖文教學指引,新手快速上手!',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.14.9(2026-06-11)— 🔧 兩項 BUG 修正
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.14.9',
    date: '2026-06-11',
    brief: [
      '🔧【修正:技能無法使用(已死角色顯示行動面板)】',
      '   ・修正某些特殊情況(如持續傷害 DOT、反傷)讓角色在「被選為行動者」後才死亡,但行動面板仍然彈出、技能卻全部無法點擊的問題。',
      '   ・現在若角色在輪到自己行動的瞬間 HP 已歸零,系統會自動跳過並推進到下一位英雄,不再卡住。',
      '',
      '🔧【修正:世界 BOSS 賣出物品沒給能量】',
      '   ・修正世界 BOSS 連線對戰中,賣出物品後能量顯示未增加的問題(根因:Firestore 重試時帶來舊版能量資料覆蓋了本機)。',
      '   ・現在賣出物品後會立即同步最新能量到房間資料,防止被舊資料覆蓋。',
    ],
  },


  // ════════════════════════════════════════════════════════════════════
  // v3.14.8(2026-06-11)— 📚 新增四下自然題庫:水的移動 & 認識臺灣的環境
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.14.8',
    date: '2026-06-11',
    brief: [
      '📚【新增知識王題庫:四下自然第三單元「水的移動」＋第四單元「認識臺灣的環境」】',
      '   ・邱筠芝老師出題，共 94 題，id 34601~34694。',
      '   ・題目涵蓋連通管原理、虹吸現象、毛細現象、雨水與地表變化、地震防災、臺灣地形與動物棲地。',
      '   ・⭐ 知識王「加強複習」功能：2026-06-15 起至 06-23 止，這兩個單元將以較高機率出現，提醒同學複習期末考範圍！',
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.14.7(2026-06-11)— 🔐 自動登出強化:iPad 放置一整晚仍能確實登出
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.14.7',
    date: '2026-06-11',
    brief: [
      '🔐【自動登出修正:放置超過 30 分鐘一定會登出】',
      '   ・修正了一個問題:iPad 放久後系統把遊戲「冷凍」,隔天同學打開還是前一個人的帳號。',
      '   ・現在系統會記住「上次有操作的時間」,就算 iPad 睡著、App 被關掉再打開,只要超過 30 分鐘沒有操作就會自動登出,保護同學的帳號安全。',
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.14.6(2026-06-10)— 🛡 雙人決鬥:連線對戰測試版開放!
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.14.6',
    date: '2026-06-10',
    brief: [
      '🛡【雙人決鬥(連線對戰)測試版開放!】',
      '   ・鬥技場的「雙人決鬥」按鈕正式啟用!你可以和同學「即時連線」面對面對戰,不再是打電腦代打的隊伍!',
      '   ・玩法:一人按「開新房間」拿到 6 碼房號 → 告訴對手 → 對手輸入房號加入 → 雙方各自編組 4 名英雄 → 自動開戰!',
      '   ・規則與單人鬥技場完全相同:LV1 公平戰、傷害 ×25%、每回合答題(答對 +1 能量)。',
      '⏱【行動限時 20 秒】',
      '   ・輪到你的回合只有 20 秒可以行動!超過時間會自動幫你普通攻擊,「連續 2 次」沒動作就視同投降,別掛機喔!',
      '   ・對手如果斷線超過 60 秒,系統會直接判你獲勝。',
      '🎖【獎勵與場次】',
      '   ・鬥技之證照常獲得:勝 +3 / 平 +2 / 敗 +1。',
      '   ・每日 3 場上限是「單人挑戰 + 雙人決鬥」共用的,同一位對手每天只能對戰 1 場(不能找好朋友互刷!)。',
      '   ・連線對戰的勝敗也會計入排行榜!',
      '🏆【排行榜公告】',
      '   ・排行榜照常累計、照常顯示 TOP 10,但「測試期間暫不發放排名獎勵」,等雙人決鬥確認穩定後就會開放,鬥技之證不受影響。',
      '⚠【測試版小提醒】',
      '   ・連線對戰目前是測試版:對戰中暫時不能使用道具卡與自動戰鬥(雙方都一樣,維持公平)。',
      '   ・如果遇到畫面卡住或數字怪怪的,請截圖回報給老師,謝謝大家幫忙測試!',
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.14.5(2026-06-10)— 🌿 新世界 BOSS 搶先看 + 📱 手機畫面大升級
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.14.5',
    date: '2026-06-10',
    brief: [
      '🌿【下一隻世界 BOSS 搶先看:翠綠森龍王!】',
      '   ・打倒火山炎龍王之後,下一位挑戰者即將甦醒——棲息於亞馬遜雨林深處的「翠綠森龍王」!',
      '   ・現在就可以先去「魔物圖鑑 → 世界 BOSS」區看到牠的完整介紹(背景故事、能力、數值)。',
      '   ・「世界 BOSS」大廳也新增了牠的搶先看卡片:草盾×2 + 水盾 + 光盾(要用「火火風暗」破盾)、每回合吸走隊伍 2 點能量、完全免疫光屬性,但最怕火——燃燒對牠是固定大傷!想挑戰牠的人,先把火屬性英雄練起來吧!',
      '📱【手機橫向遊玩大升級(第一波)】',
      '   ・用手機(橫向)玩的同學有福了:戰鬥卡片文字、HP 數字、能量格、冒險地圖按鈕、過場字幕、英雄相遇、投降確認、技能替換、結算畫面、英雄/怪物/寵物/勳章圖鑑、確認視窗、登入提示……通通放大,不用再瞇著眼睛看了!',
      '   ・電腦和 iPad 的畫面完全不受影響。',
      '   ・這是第一波調整,如果還有覺得太小或跑版的畫面,歡迎回報給老師!',
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.14.4(2026-06-10)— 🛡 戰鬥卡死根治 + 登入穩定度修正(課堂災情緊急修復)
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.14.4',
    date: '2026-06-10',
    brief: [
      '🛡【BOSS 戰卡死問題根治】',
      '   ・修正「打倒全部敵人、或我方全滅後,戰鬥卡住不結束、沒有獎勵畫面」的嚴重問題。',
      '   ・找到真正原因:答題與戰鬥動作切換太快時,推進戰鬥的指令會被「悄悄弄丟」,之後就沒有任何東西能讓戰鬥結束。',
      '   ・現在指令不會再弄丟了,而且遊戲每 2 秒會自動巡邏戰場:敵人全倒、我方全倒、或 BOSS 已倒但小怪還站著,只要幾秒內沒正常結算,就會自動幫你收尾(勝利照發獎勵、滅團照常跳出接關視窗)。',
      '   ・以後不需要再「存檔跳出 → 繼續上次戰鬥」來解卡了!',
      '🔑【剛登入就被踢出的問題修正】',
      '   ・修正「剛登入幾秒就跳出『帳號已在其他裝置登入』,讓人以為一直登入失敗」的問題。',
      '   ・原因:全班同時上線時學校網路很塞,你的登入資料還在排隊上傳,系統就誤以為帳號被別人搶走了。',
      '   ・現在會先確認你的登入資料真的送達伺服器後才做判斷,不會再冤枉你。真的有人在別台登入你的帳號時,還是會正常提醒。',
      '📶【斷線自動接回 + 網路狀態提示】',
      '   ・iPad 切到其他 App 再切回來時,和伺服器的連線有時會悄悄斷掉;現在會自動偵測並重新接上,保護你的存檔安全。',
      '   ・新增「網路不穩」即時提示:斷線時畫面上方會出現提示條,告訴你「進度都還在裝置裡,剛抽到的英雄/至寶不會不見」。',
      '   ・網路恢復後會自動把你的進度同步回雲端,同步成功會顯示綠色「✅ 同步完成」。以前「剛抽到角色又莫名消失」其實就是斷線造成的,以後你會清楚知道發生什麼事。',
      '💾【抽到/解鎖的當下就立刻存檔】',
      '   ・召喚出英雄、冒險解鎖新英雄、獲得至寶時,按下「確認」的那一瞬間就會立刻同步存到雲端和裝置,雙重保險。',
      '   ・搭配上面的斷線提示,「剛抽到的角色不見了」這個問題從此走入歷史!',
      '📜【好友新功能:送禮記錄 + 回禮】',
      '   ・好友頁面新增「📜 送禮記錄」:可以看到最近 7 天內你送出和收到的所有禮物(日期、時間、對象、禮物內容)。',
      '   ・收到的禮物旁邊有「💝 回禮」按鈕,可以直接回送對方!回禮和一般送禮共用「每天 5 個好友」的額度,送滿時會提醒你「今天已經送完5次禮物,等明天再送吧~」。',
      '💌【送禮可以附上勉勵的話】',
      '   ・送禮時可以選一句話送給好友:「謝謝你平常對我的幫助!」「一起加油!」「你很棒!」「下次再一起遊玩吧!」「這是我的一點小心意~」',
      '   ・對方收到禮物時會看到你選的話,讓送禮更溫馨!',
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // (★ v3.14.10~24 修剪:v3.14.3「鬥技兌換確認視窗修正」、v3.14.2「強力免疫擋狐妖魅惑+日本BOSS必得SSR碎片」、v3.14.1「遊戲開啟速度大改善」、v3.14.0「三項修正(通知關閉/挑戰券進場/黑暗球卡死)」、v3.13.99「iPad 安裝版登入修正」、v3.13.98「世界BOSS傷害上限修正」、v3.13.97「連線與效能優化」、v3.13.96「近期活動改版」、v3.13.95「靈魂碎片系統」、v3.13.87「我的豚豚登場」、v3.13.86「單人卡死自救再強化」、v3.13.85「能力翻倍爆發修正」、v3.13.84「極限還原膠囊」、v3.13.83「UR 篩選+極限膠囊」已移除以維持 20 則上限)
];

// 通知 index.html 載入完成(可選,但建議保留)
try {
  if (typeof window._onChangelogReady === 'function') {
    window._onChangelogReady();
  }
} catch (e) { /* ignore */ }


// ════════════════════════════════════════════════════════════════════════
// ⏸ 尚未上線的「草稿」版本條目(2026-05-29 同步時由主陣列移到這裡暫存)
//   原因:線上實際最新版是 v3.11.24 / v3.11.25(玩家畫面右下角顯示 v3.11.24)。
//         以下 v3.11.31 / 30 / 27 的功能(編組頁「圖鑑整備」按鈕、網路駭客 #71、
//         幽幽 #70)尚【未】實際部署到線上,所以先放進這個「不會被顯示」的草稿陣列,
//         避免玩家在 v3.11.25 卻看到 v3.11.31 的更新內容。
//   ★ 等這些功能真的部署上線後:把對應的物件從本陣列「剪下」,貼回上方
//      window.GAME_CHANGELOG 陣列的「最上方」,即可恢復顯示(記得同步改檔頭版本號)。
//   ★ changelog 顯示程式只讀 window.GAME_CHANGELOG,不會讀這個陣列。
// ════════════════════════════════════════════════════════════════════════
window.GAME_CHANGELOG_DRAFT_UNRELEASED = [
  // ════════════════════════════════════════════════════════════════════
  // v3.11.31(2026-05-29)— 編組頁「圖鑑整備」按鈕 + 裝置信任小卡只在首頁
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.11.31',
    date: '2026-05-29',
    brief: [
      '📖 隊伍編組右側預覽:名稱旁新增「圖鑑整備」按鈕!',
      '   ・直接打開該英雄的圖鑑頁,進行至寶切換、能力加點、技能升級',
      '   ・關閉圖鑑後一鍵回到編組頁,不用重新邀約隊員',
      '',
      '🔧 右下角「已信任此裝置」小卡改為只在首頁顯示',
      '   ・進入關卡、編組、圖鑑、商店等畫面時自動隱藏',
      '   ・避免擋住右下角的功能按鈕,回到首頁時自動恢復',
    ],
    items: [
      '編組預覽(focusHero)名稱右側加「📖 圖鑑整備」按鈕 → _openHeroCodexFromTeam(name,idx):開 hero-page-overlay 後 openHeroDetail(name),設 _heroDetailReturnToTeam 旗標。',
      'closeHeroDetail 偵測旗標:收掉 hero-page-overlay + 重新 focusHero(idx,name) 套用剛剛的至寶/加點/技能變更,不觸發邀約;BGM 用 bgmEnsureSceneBgm 還原。',
      '裝置信任小卡 _updateTrustBadge 加 _isOnHomepageForBadge() 守門:任一主要 overlay 可見(adventure/hero-pick/hero-page/equip/shop/taiwan-map…)或戰鬥中(G.p2.length)即不顯示。',
      'uid 輪詢 interval 加首頁狀態追蹤:離開首頁立即移除 badge、回首頁重新渲染。',
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.11.30(2026-05-29)— 新英雄「網路駭客」(第 71 號,5 年 1 班 高同學設計)
  //   + 護盾值改為 HP 條藍色覆蓋層呈現 + 火爆女技能說明對齊
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.11.30',
    date: '2026-05-29',
    brief: [
      '🤖 新英雄登場:「網路駭客」(5 年 1 班 高同學設計,第 71 號英雄)!',
      '   ・玩遊戲玩膩了就在網路上搞高端惡作劇的程式天才',
      '   ・加入水晶召喚池(學生設計英雄)',
      '',
      '🐛 天賦「BUG 疊加」',
      '   ・開場竊取對手最高攻擊 + 最高特技值加到自己(持續 4 回合)',
      '   ・這份加成無法被消除、奪取或交換',
      '   ・每個新回合對隨機對手散播亂碼(附加隨機不利狀態)',
      '',
      '🔥 S1「攻陷防火牆」',
      '   ・消除對手全部有利狀態,每消除一個就獲得 20 護盾(最多 5 層)',
      '',
      '🐛 S2「強化 BUG」',
      '   ・把全體對手身上隨機 3 個不利狀態升級為強力版並延長 2 回合',
      '',
      '💻 爆發「超極密檔案 GET!」',
      '   ・奪取對手有利狀態(強力優先,無視不可奪取規則)',
      '   ・特技 150% 連續狙擊 3 次(從血量最低打到最高)',
      '   ・把造成的傷害轉化為治療,回復我方 3 次',
      '',
      '🛡 全新護盾呈現',
      '   ・護盾值改成顯示在 HP 條上的「藍色區塊」(靠左)',
      '   ・例:100 HP + 50 護盾 → 顯示 100+50/100,藍條佔 50%',
      '   ・受傷時先扣藍色護盾,藍條即時縮短,打光才扣綠色 HP',
    ],
    items: [
      '第 71 號英雄「網路駭客」,能力 58/11/15/16(總和 100),5 年 1 班 高同學設計。',
      '天賦「BUG 疊加」:戰開竊取對手最高攻+最高特(平衡上限 5+英雄等級),持續 4T(+1/級,不可消除/奪取/交換);每回合對隨機 N 名對手(1+級,上限 4)各附 1 個隨機不利狀態。到期由 tickStatus 還原 atk/sp。',
      'S1「攻陷防火牆」c5:clearGoodBuffs 消除全敵有利狀態,每消除 1 個 +20 護盾(上限 5 層;每級 +5/層),用 numeric h.shield 欄位(doDmg 會吸收)。',
      'S2「強化 BUG」c4:全敵隨機 3 個不利狀態升 _strong(不可淨化)並延長 2T;升至 4/7/10 級各 +1 升級數量。',
      '爆發「超極密檔案 GET!」:奪增益(強力優先,基礎 1 +1/級上限 5)→ 特技 150%(每級 ×1.10)三連 HP 低→高 → 傷害總和 /3 治療我方 3 次(HP 低優先)。傷害走 doDmg,世界 BOSS 5000 上限自動生效。',
      '護盾 HP 條呈現:renderCard 在綠色 HP 上疊藍色 .card-hp-shield2(width=護盾/最大HP),顯示護盾 = numeric h.shield + bigshield._hp(兩者皆 doDmg 會消費)。doDmg 扣盾後即時 renderCard,藍條同步縮短。CSS 同時寫進 main.css 與 index.html 內嵌 style(快取保險)。',
      '火爆女技能說明對齊:確認 S1 一擊必殺 / S2 超級射線 / 爆發 三刀射擊(玩家版+AI 版皆已實作),HERO_LORE 補上原本漏列的 S2「超級射線」。',
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.11.27(2026-05-28)— 新英雄「幽幽」(第 70 號,5 年 4 班 高同學設計)
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.11.27',
    date: '2026-05-28',
    brief: [
      '👻 新英雄登場:「幽幽」(5 年 4 班 高同學設計,第 70 號英雄)!',
      '   ・神秘又可愛的幽靈,惡鬼之軀卻有顆柔軟的心',
      '   ・加入水晶召喚池(學生設計英雄)',
      '',
      '🌫 天賦「幽魂體質」',
      '   ・用「特技值」代替攻擊出手,且免疫所有普通攻擊',
      '   ・不怕暗:受到暗屬性傷害減少(隨天賦等級最多 -50%)',
      '   ・怕光:受到光屬性傷害增加(隨天賦等級弱點漸減)',
      '',
      '🦷 S1「惡鬼撲食」',
      '   ・一口把對手咬到只剩一半血,並標記「等吞食」3 回合',
      '   ・對 BOSS/菁英改用特技 300% 造成傷害',
      '   ・吞食擊殺帶標記的對手 → 隊友回血,滿血溢出再轉成護盾',
      '',
      '🌑 S2「暗行」',
      '   ・潛入暗影 2 回合:完全免疫所有傷害與不利狀態',
      '   ・期間出手必中,而且傷害 +100%',
      '',
      '👻 爆發「惡夢遊魂」',
      '   ・全體敵人陷入「惡夢」:受到的傷害翻倍(隨等級更高)',
      '   ・全體隊友化為「遊魂」:受到的傷害大幅降低',
      '   ・兩個狀態都無法被消除、奪取或交換',
    ],
    items: [
      '第 70 號英雄「幽幽」,能力 55/0/20/25(總和 100),5 年 4 班第 8 位設計師(高同學)。',
      '天賦「幽魂體質」:普攻改用特技值 + 免疫普攻;受暗 -30%(每級 -5%,Lv4 -50%)、受光 +30%(每級增幅 -5%)。',
      'S1「惡鬼撲食」c4:非 BOSS 扣至剩 50% HP;BOSS/菁英改特技 300%(走 5000 上限保護)。附「等吞食」3T,吞食擊殺者回血(目標最大 HP 100%)溢出轉護盾(上限自身 HP×100%,每級 +5%)。',
      'S2「暗行」c5:自身 2T(每級 +1)免疫所有傷害與不利,期間必中且傷害 +100%(每級 +5%)。',
      '爆發「惡夢遊魂」:全敵惡夢 2T(受傷 ×2.0~2.8)、全友遊魂 2T(受傷 -70~90%),兩狀態不可消除/奪取/交換。惡夢倍率乘算且在 BOSS 5000 上限前套用,不破上限。',
      '友傷防呆:S1 玩家版鎖敵方/AI 版用引擎敵方目標;吞食回血僅幽幽同陣營擊殺者觸發;惡夢/遊魂不影響治療。'
    ]
  },
];