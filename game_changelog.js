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
  // ════════════════════════════════════════════════════════════════════
  // v3.15.39(2026-06-18)— 🛡️ 技能防連點刷傷漏洞修正(學霸 五科滿分考卷等)
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.39',
    date: '2026-06-18',
    brief: [
      '🛡️【技能不能再連點刷傷害了】',
      '   ・修正<b>學霸(轉學生)</b>的「五科滿分考卷」(以及其他技能)<b>連續點技能鍵就能無限連發、造成超多段傷害</b>的漏洞。',
      '   ・現在技能/普攻按下去後,在這個行動播放與結算完成之前會<b>自動上鎖、無法再連點觸發</b>;行動一結束就解鎖,完全不影響正常出招節奏。',
    ],
    items: [
      '★ v3.15.39【玩家行動防連發鎖 index.html】根因:多段非同步技能(如學霸 五科滿分考卷 _doExam,每段 _pSetTimeout 300ms)的「扣能量 + 設 acted」都在 endAction(動畫末段才執行),整段動畫期間 acted 仍為 false、能量尚未扣 → requestAction/selMove 守門全過 → 連點技能鍵 + 確認可在扣能量前重複觸發 execSkill,疊加出無限多段傷害。修:新增 window._pActBusy 行動鎖——於 selMove(涵蓋普攻/S1/S2,在 clearSel 之後)上鎖 _pActBusy=true + 記 _pActBusyTs;requestAction 與 confirmAction 入口偵測「鎖定中且未逾時(8 秒)」即忽略點擊;clearSel(取消)/endAction(行動完成)/startTurn(換回合保險)三處解鎖。8 秒自動逾時確保任何路徑漏解鎖也不會卡死。爆發/休息/物品另有各自流程,不受影響',
      '★ v3.15.39【版本鏈】3 主同步點 v3.15.38→v3.15.39(本輪僅 index.html 改動)+ game_changelog.js→v3.15.39。admin_panel.js / arena.js 維持 v3.15.37、hero_db.js v3.15.36、world-boss.js v3.15.34',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.38(2026-06-18)— ⚡ 玩家極限爆發必中且無視有利狀態 ＋ 好友送禮次數修正
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.38',
    date: '2026-06-18',
    brief: [
      '⚡【極限爆發保證命中、無視敵方有利狀態】',
      '   ・修正部分同學反應「對<b>大天狗</b>等速度很快、或正處於<b>迴避狀態</b>的敵人放極限爆發卻 MISS(沒打中)」的問題。',
      '   ・現在<b>玩家英雄的極限爆發一律必中</b>,並且<b>無視敵方的有利狀態</b>(迴避/閃避/護盾/免疫/減傷)——這是專屬於玩家的霸氣!',
      '   ・反過來,<b>BOSS 的極限爆發仍然可以被你自己的有利狀態抵抗</b>(例如你身上的迴避/護盾),這個平衡維持不變。',
      '🎁【送禮次數不再卡住】修正少數同學「<b>今天明明還沒送過禮</b>(送禮紀錄是空的),按送禮卻被擋「今日已送 5/5」」的問題。現在送禮次數會<b>以你真實的送禮紀錄為準</b>,殘留的假次數會自動清除。',
    ],
    items: [
      '★ v3.15.38【玩家極限爆發必中+無視有利狀態 index.html doDmg】新增集中判定 _isPlayerBurstHit =(爆發施放中 _burstCastActive 且攻擊者 a.side 為 p1 且敵我異側);成立時於 doDmg 開頭設 opts.mustHit/ignoreEvasion/ignoreBuffs=true,一次涵蓋速度迴避/疾風步 _windEvade/急速閃躲 spdAvoid/至寶閃避/「evasion」buff(由烏天狗 羽刃陣列、色彩噴濺、變臉戲法、神籤 等賦予;大天狗 MISS 主因是友軍 烏天狗 給全隊迴避)/trapShield/免疫/減傷等全部來源。另對「染靈幻魔・藍色憂鬱」「紅色玩家」兩個不吃 ignoreEvasion 的天生閃避加上 !_isPlayerBurstHit 讓玩家爆發也能穿透',
      '★ v3.15.38【不對稱保留 index.html】BOSS 爆發(a.side 為 p2)不觸發上述判定 → 玩家自身的有利狀態(迴避/護盾/免疫)仍可照常抵抗 BOSS 爆發。BOSS 鎖血保命 _applyBossLifelineProtection(獨立函式、不看 ignoreBuffs)、世界BOSS 元素破盾(element-break 機制)、神樹恩澤不倒 burstUndying(玩家專屬 buff、敵方不會有)皆不受影響',
      '★ v3.15.38【好友送禮次數以紀錄為準 index.html】根因:共用 iPad 換帳號殘留(原換帳號守門掛在六大表 UID 信號上,該信號在英雄校正時可能已被改成當前帳號 → 守門略過清空)或雲端寫入時序,使今日送禮計數 _giftHistory.sentUids 帶到非本人的送禮對象,造成 0 次卻被擋「今日已送 5/5」。修:_giftMaybeResetHistory 每次被呼叫時(送禮 gating 與計數皆會呼叫)以今日 giftLog 的 sent 去重收禮者重建 sentUids(上限 5)→ 幽靈計數自動消失、真實已送對象保留(「今日已送過此好友」判定亦正確);另加持有者 _uid 與當前帳號不符即重置之防護。並抽出 _giftKeyForTs(ts) 供逐筆判定日期(_giftGetTodayKey 改為呼叫之,邏輯不變)',
      '★ v3.15.38【版本鏈】3 主同步點 v3.15.37→v3.15.38(本輪僅 index.html 改動)+ game_changelog.js→v3.15.38。admin_panel.js / arena.js 維持 v3.15.37、hero_db.js v3.15.36、world-boss.js v3.15.34',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.37(2026-06-18)— 🎖 鬥技之證持有量上雲(共用平板不再消失)＋ GM 可補償鬥技之證
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.37',
    date: '2026-06-18',
    brief: [
      '🎖【鬥技之證不再不見了】',
      '   ・修正部分同學反應「<b>打完鬥技場卻沒拿到鬥技之證</b>」、或在學校共用平板換人/清快取後鬥技之證歸零的問題。',
      '   ・現在你的鬥技之證會<b>跟著帳號存到雲端</b>,換一台平板登入、或清掉瀏覽器資料後重新登入,持有數量都會自動還原(以雲端與本機較高者為準,只會多不會少)。',
      '🎁【老師可以補發鬥技之證了】若有同學的鬥技之證真的遺失,老師可在後台直接補發。',
    ],
    items: [
      '★ v3.15.37【鬥技之證持有量上雲 arena.js + index.html】鬥技之證可花費餘額(zhengTotal / zhengLifetimeTotal)原本只存在本機 localStorage(lxps_arena_zheng_total / _lifetime / 每日狀態 JSON),共用平板清快取或換裝置就歸零。改:arena.js 在「結算發證 / 商店花費 / 補發」後即時觸發 gameCloudSave;index.html _buildSafeData 把持有量寫進雲端存檔(arenaZhengHeld / arenaZhengLifetime),_applySafeData 還原時取「本機與雲端較高者」合併並回寫 localStorage + 同步每日狀態 JSON。週排行累積值 arenaWeekly 原本就在雲端,不受影響',
      '★ v3.15.37【GM 補償鬥技之證 admin_panel.js + index.html】學生補償工具新增「🎖 鬥技之證 (+N)」輸入框、課堂獎勵發放新增「🎖 鬥技之證 ×N」勾選框,皆經 _fbCompensatePlayer 寫入;後端在主檔 + live + safe 三槽同步累加 arenaZhengHeld / arenaZhengLifetime,確保雲端載入時不論取哪一槽都帶到補發量',
      '★ v3.15.37【版本鏈】3 主同步點 v3.15.36→v3.15.37 + admin_panel.js v3.15.26→v3.15.37 + arena.js→v3.15.37。hero_db.js 維持 v3.15.36、world-boss.js v3.15.34',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.36(2026-06-18)— ⚔ 復活無敵僅限 PvE + 埃及雙王復活說明一致
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.36',
    date: '2026-06-18',
    brief: [
      '⚔【鬥技場復活保護修正】',
      '   ・修正鬥技場(PvP)英雄復活後仍有「復活無敵」的問題——鬥技場是玩家對玩家,不該享有冒險專屬的復活保護。<b>冒險、台灣關、世界BOSS 等 PvE 戰鬥的英雄復活保護維持不變</b>。',
      '🏺【埃及雙王圖鑑說明更新】法老王與埃及豔后「互相復活」的圖鑑說明文字,由 25% 更新為 <b>12.5%</b>(與實際效果一致)。',
    ],
    items: [
      '★ v3.15.36【復活無敵僅限 PvE 玩家英雄 index.html】doRevive 的 reviveImmune 賦予條件由「side 為 p1」收緊為「side 為 p1 且非鬥技場」。鬥技場判定沿用既有慣例(_arenaBgmContext===true 或 _adventureMode===false);冒險/台灣/世界BOSS 皆 _adventureMode===true、_arenaBgmContext===false 故保留復活保護。小怪/BOSS 方(p2)本就被 p1 條件排除',
      '★ v3.15.36【埃及雙王互相復活 fd/desc 文字一致 hero_db.js】法老王「法老威儀」+ 埃及豔后「蛇瞳魅影」的 desc/fd「互相復活至 25%HP」改為 12.5%HP(與 BOSS 程式碼 v3.15.25/v3.15.35 實際一致)。爆發「太陽神的審判」fd 的 25% 保留(招募版 Lv1 基底,鐵律 1.160);互相復活僅 BOSS 版有,招募版實際效果不變',
      '★ v3.15.36【版本鏈】3 主同步點 v3.15.35→v3.15.36 + hero_db.js v3.15.33→v3.15.36。world-boss.js 維持 v3.15.34、admin_panel.js v3.15.26',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.35(2026-06-18)— 🛡️ BOSS 鎖血卡死修正 + 埃及豔后復活血量
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.35',
    date: '2026-06-18',
    brief: [
      '🛡️【BOSS 戰手感修正】',
      '   ・修正 BOSS 跌破半血「鎖血」後<b>整回合所有傷害都變 0</b>的問題——現在 BOSS 鎖血會立即反擊大招,但<b>之後同回合可以正常被打</b>,不再讓你以為打不動。',
      '   ・埃及豔后與法老王互相復活的血量<b>統一降為 12.5%</b>(原豔后偏高),雙王戰不再因為一直回滿血而拖太久。',
    ],
    items: [
      '★ v3.15.35【BOSS 鎖血整回合免疫移除 index.html】_applyBossLifelineProtection 第一段(50%)鎖血觸發時不再設 target._lifelineImmuneRound(原本會讓該回合所有後續傷害一律歸 0,玩家回報整回合 0 傷害以為打不動)。比照第二段(1HP,v3.15.17 已移除):保命壓住該致命擊 + 立即爆發反擊後,同回合後續攻擊正常結算。兩段保命(50%/1HP)仍各擋一次致命,不會被一擊秒殺',
      '★ v3.15.35【埃及豔后互相復活血量 25%→12.5% index.html】startTurn + checkWin 兩處互救 hook,豔后被法老王復活的血量由最大HP 25% 降為 12.5%(與法老王被豔后復活的 12.5% 一致;v3.15.25 當時只 nerf 法老王、漏改豔后)。僅 BOSS 版(isEgyptBoss)生效,玩家招募版天賦與圖鑑說明不動',
      '★ v3.15.35【版本鏈】3 主同步點 v3.15.34→v3.15.35。world-boss.js 維持 v3.15.34、hero_db.js v3.15.33、admin_panel.js v3.15.26',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.34(2026-06-18)— 🌳 龍王棲息地正名 + 龍王不再顯示經驗值
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.34',
    date: '2026-06-18',
    brief: [
      '🌳【小修正】',
      '   ・翠綠森龍王的棲息地正名為<b>亞馬遜雨林</b>(原天賦說明誤寫太魯閣)。',
      '   ・所有龍王(世界 BOSS)<b>不再顯示經驗值</b>——牠們本就不發英雄經驗,魔物圖鑑不再標示經驗數字以免誤會。',
    ],
    items: [
      '★ v3.15.34【翠綠森龍王棲息地正名 world-boss.js】天賦「翠之意志」fd 與 v3.13.73 註解的棲息地「太魯閣」更正為「亞馬遜雨林」,與 WORLD_BOSS_LINEUP 的 scene 欄位、背景故事一致',
      '★ v3.15.34【龍王不再顯示經驗值 index.html】魔物圖鑑:① 卡片(makeCard)對世界 BOSS(b.isWorldBoss)不再顯示「⭐ 基本經驗值」行(原誤顯示 1500);② 詳情頁原「⭐ 基礎EXP:0(世界 BOSS 不發英雄經驗)」改純說明「⭐ 世界 BOSS 不提供英雄經驗值」。世界 BOSS 結算本就不發 EXP,此為顯示層一致化',
      '★ v3.15.34【版本鏈】3 主同步點 v3.15.33→v3.15.34;world-boss.js v3.15.17→v3.15.34。hero_db.js 維持 v3.15.33、admin_panel.js v3.15.26',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.33(2026-06-18)— 🛠️ 戰鬥畫面修復 + 選單字體再放大 + 新攻略
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.33',
    date: '2026-06-18',
    brief: [
      '🛠️【戰鬥畫面修復 & 多項優化】',
      '   ・修正戰鬥時敵方角色卡片可能<b>掉到畫面中央</b>的嚴重排版問題,恢復正常橫排。',
      '   ・主選單下方的圖示與文字<b>再放大</b>,占滿格子更好點。',
      '   ・召喚頁面的「召喚紀錄」移到<b>召喚水晶數量上方</b>。',
      '   ・新增<b>復活保護</b>:剛被救活的隊友會短暫<b>無敵</b>(免疫傷害與不利狀態),直到自己行動才解除,不會一復活就被秒殺。',
      '   ・法老王 & 埃及豔后新增<b>第二種攻略</b>:用軍師(疑惑)讓王「天賦失效」時,他們<b>無法互相復活</b>,可各個擊破。',
    ],
    items: [
      '★ v3.15.33【戰場排版崩壞復原 index.html CSS】.brow 從 v3.15.28 的 flex-wrap:wrap 改回 flex-wrap:nowrap。根因:#field padding-right:148px → 敵方可用寬約 1132px,正好等於 4 張普通卡寬(4×253+3×40 gap),wrap 模式遇 sub-pixel/縮放捨入就觸發換行,把第 4 張敵卡掉到戰場中央。nowrap 即正常橫排;黑暗球異常分出 6~7 隻分身是另一個分身數量 BUG,不為它改版面。max-width:100% 保留防外溢',
      '★ v3.15.33【召喚紀錄位置 index.html】召喚頁「📜 召喚紀錄」按鈕由右上角移到左下「🔮 召喚水晶數量」框上方',
      '★ v3.15.33【動物學家天賦升級視窗 hero_db.js】_TRAIT_LV_INFO 內「動物學家」重複定義兩次,JS 同 key 後者覆蓋前者,導致升級視窗誤顯示舊的「寵物效果+100→150%」(v3.15.12 已把寵物效果改固定×2)。移除重複定義,改由「行動前驅除對手寵物機率 50→90%」正確版生效',
      '★ v3.15.33【法老王/埃及豔后 第二攻略 index.html】startTurn 與 checkWin 兩處互相復活 hook 各加判定:存活的王若處於 confused(軍師「迷惑戰術」全天賦失效)或 locked(維京海盜船長「鎖定目標」)狀態,則無法復活倒下的另一王 → 可在天賦失效期間各個擊破,不必同時擊殺雙王',
      '★ v3.15.33【友方復活無敵 index.html 6 處】所有復活統一走 doRevive,友方(p1)復活後獲得 reviveImmune buff:doDmg 完全免傷 + addStatus 免疫不利(複用既有 immune 邏輯)+ clearGoodBuffs 保護不被消有利技清除 + 顯示「✨復活無敵」;於 startTurn(next 確定後)在自己回合開始解除。保護剛復活脆弱單位不被秒殺;敵方復活不受影響',
      '★ v3.15.33【底部選單字體/圖示再放大 index.html CSS】.adv-nav-label 2 字 25px→36px(clamp(16px,2.4vw,36px));.adv-nav-icon 28px→42px(clamp(22px,2.9vw,42px));序號兌換/更新日誌 4 字 20px→28px。保留 nowrap+ellipsis 兜底',
      '★ v3.15.33【版本鏈】3 主同步點 v3.15.32→v3.15.33;hero_db.js v3.15.29→v3.15.33。admin_panel.js 維持 v3.15.26、world-boss.js v3.15.17、world-boss-ui.html v3.15.21',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.32(2026-06-17)— 🔠 底部選單字體放到最大
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.32',
    date: '2026-06-17',
    brief: [
      '🔠【底部選單字體放到最大】',
      '   ・主選單下方的功能字進一步<b>放到最大</b>,在格子裡清楚顯示、不超出邊界,版面維持不變。',
    ],
    items: [
      '★ v3.15.32【底部選單字體最大化 index.html CSS】老師需求「字體放到最大且不超出格子、維持版面」。.adv-nav-label 基礎字體(2 字 label:召喚/英雄/至寶/魔物/寵物/好友/背包/獎章)放大為 clamp(13px,1.65vw,25px)(原 11/1.25vw/18);「序號兌換」「更新日誌」4 字 label 由 nth-of-type(9)(10) 獨立設 clamp(11px,1.35vw,20px) 確保 fit 不溢出(各自最大化、不遷就最長那兩個);.adv-nav-icon 維持 clamp(17px,2vw,28px) 不動 → 仍主導按鈕高度、nav 版面不變;保留 white-space:nowrap + text-overflow:ellipsis 作極端寬度兜底。順手移除序號兌換/更新日誌已被 CSS !important 蓋掉的 inline font-size:80% 死碼,字體完全由 CSS 控',
      '★ v3.15.32【版本鏈】3 主同步點 v3.15.31→v3.15.32(本輪只改 index.html CSS + game_changelog.js)。hero_db.js 維持 v3.15.29、admin_panel.js v3.15.26、world-boss.js v3.15.17、world-boss-ui.html v3.15.21',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.31(2026-06-17)— 🔧 後台管理工具優化(一般玩家無感)
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.31',
    date: '2026-06-17',
    brief: [
      '🔧【系統維護】',
      '   ・本次為後台管理工具的小幅優化,一般玩家的遊戲內容與規則<b>完全不受影響</b>。',
    ],
    items: [
      '★ v3.15.31【管理員指令冷卻全面自動繞過 index.html】老師需求:管理員白名單帳號登入後「自動」繞過 5 類冷卻/每日限制(不再需要手動到 GM 後台按「解除冷卻」)。① 知識王每日挑戰:原 v5820 彈窗確認解除改為「自動放行」— _kingShowEntryPopup 偵測 _todayClaimed 時,管理員自動清 _todayClaimed/_snapshot/_isPlaying 後續往下進全新挑戰流程,不再彈窗(一般玩家照舊提示「08:00 再來」並 return) ② 世界BOSS每日次數:canEnter 的 _allowed 改 (_isAdmin ? true : _used<_effectiveLimit) ③ 手動雲端同步:10 秒 cooldown 與每日 30 次上限兩處均加 !_isAdminCS 繞過 ④ 預習練習每日 500 幣:結算 _canEarn 改 (isAdmin || _todayCoins<500) ⑤ 好友借用獎勵每日 3 次:擋點加 !_isAdminFB 繞過。皆以 window._isAdminUser() 判定,僅影響管理員白名單帳號',
      '★ v3.15.31【副作用備忘(僅管理員帳號)】雲端同步繞過 10 秒冷卻後,管理員若短時間大量手動同步會增加 Firestore 寫入(Spark 配額);預習/好友/世界BOSS 繞過會使管理員帳號的每日統計數字超出常規(屬測試帳號預期行為)。一般玩家不受任何影響',
      '★ v3.15.31【版本鏈】3 主同步點 v3.15.30→v3.15.31(本輪只改 index.html + game_changelog.js)。hero_db.js 維持 v3.15.29、admin_panel.js v3.15.26、world-boss.js v3.15.17、world-boss-ui.html v3.15.21',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.30(2026-06-17)— 🔆 底部選單字體更清楚
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.30',
    date: '2026-06-17',
    brief: [
      '🔆【底部選單看得更清楚了】',
      '   ・主選單下方的功能字(召喚、英雄…)<b>放大、加粗、加上黑色外框與陰影</b>,',
      '     在明亮的背景下也不會再看不清楚囉!',
      '🔥【「極限挑戰」獎章調整】',
      '   ・改成:隊伍裡<b>帶 1 名 Lv1 英雄、打倒任一台灣關 BOSS</b> 就能解鎖!',
    ],
    items: [
      '★ v3.15.30【底部主選單可讀性加強 index.html CSS】老師回報亮背景下淺色 label 看不清。.adv-nav-label:font-size 放大 clamp(11px,1.25vw,18px)(原 10/16)、font-weight 900、-webkit-text-stroke 0.8px #000 黑色描邊(paint-order stroke fill 確保字芯不被邊框吃掉)、text-shadow 投影+光暈;.adv-nav-icon 微放大 + filter drop-shadow 圖示陰影。純 CSS 不動按鈕 HTML',
      '★ v3.15.30【極限挑戰獎章難度修正 index.html】解鎖條件由「任意 BOSS 勝利+隊伍有 Lv1 英雄」改為「擊敗台灣關 10 BOSS 之一+隊伍含 1 名 Lv1 英雄」:BOSS 勝利結算的 _checkMedalExtreme 呼叫端加 G.p2.some(台灣 10 BOSS 名) 判定,只在台灣關主戰才逐一檢查 p1 英雄等級(任一 Lv1 即解,_checkMedalExtreme 內 heroLevel<=1 邏輯不變);獎章 desc 同步改「隊伍含Lv1英雄打倒台灣關BOSS」',
      '★ v3.15.30【版本鏈】3 主同步點 v3.15.29→v3.15.30(本輪只改 index.html CSS + game_changelog.js)。hero_db.js 維持 v3.15.29(上一接力新增雙王答題對白,累積待部署)、admin_panel.js v3.15.26、world-boss.js v3.15.17、world-boss-ui.html v3.15.21',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.29(2026-06-17)— 🏺 法老王・埃及豔后專屬答題對白
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.29',
    date: '2026-06-17',
    brief: [
      '🏺【法老王・埃及豔后有自己的台詞了!】',
      '   ・在埃及雙王 BOSS 戰答題時,<b>法老王與埃及豔后會說出符合各自身分的話</b>',
      '     (法老王威嚴、豔后聰慧),不再借用九尾空貓怪的台詞囉!',
    ],
    items: [
      '★ v3.15.29【埃及雙王答題反應對白 hero_db.js + index.html】原本雙王戰答題時,advShowBossReact 的 _mainReactBoss 偵測清單與 _reactSuffix 對照表都沒有法老王/埃及豔后 → suffix 為空 → fallback 到無後綴預設(九尾空貓怪台詞)。修法:① hero_db.js 新增 BOSS_REACT_{CORRECT/WRONG/TIMEOUT}_PHARAOH 與 _CLEOPATRA 共 6 組常數(法老王威嚴神聖、豔后魅惑智慧;CORRECT5+WRONG5+TIMEOUT3) ② index.html advShowBossReact 偵測清單加兩王、_reactSuffix 加 法老王→_PHARAOH/埃及豔后→_CLEOPATRA、_BOSS_REACT_MAP 補 6 key。雙王同場 find 取先存活者(法老王 pos 在前優先,倒下後換豔后)',
      '★ v3.15.29【版本鏈】3 主同步點 v3.15.28→v3.15.29 + hero_db.js v3.15.17→v3.15.29(本輪改 index.html + hero_db.js + game_changelog.js)。admin_panel.js 維持 v3.15.26、world-boss.js v3.15.17、world-boss-ui.html v3.15.21。上傳順序:game_changelog.js → hero_db.js → index.html(最後)',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.28(2026-06-17)— 🐛 埃及雙王/黑暗球修正 + 選將圖微調
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.28',
    date: '2026-06-17',
    brief: [
      '🏺【埃及雙王打倒後正確結束】',
      '   ・法老王與埃及豔后<b>同時擊敗後,正確領獎並回到關卡頁</b>,不會再突然又重新開打一場!',
      '🌑【黑暗球分身不再擠爆畫面】',
      '   ・黑暗球分裂出很多隻時,畫面會<b>自動換行排列</b>,不會再被擠到看不見功能按鈕、卡住動不了。',
      '🎴【法老王・埃及豔后選將圖微調】',
      '   ・兩位埃及王的頭像位置<b>往下調整</b>,在選將與英雄頁看起來更好看。',
    ],
    items: [
      '★ v3.15.28【埃及雙王打贏重啟修正 index.html】根因:_showResultWithDrama 內有一份硬編碼 _BOSS_SET2 清單(漏了法老王/埃及豔后)→ 玩家「同時擊殺」雙王走到 BOSS 結算流程時 _hasBoss2=false → 誤判「無 BOSS 小怪戰」→ 強制 advFinishMiniBattle → 還原滿血雙王陣容 + 推進 scene 重開雙王戰(BUG 數據:雙王滿血 11500/10500 + _advMiniResultShowing=true)。v3.15.9 已修 checkWin 的 _hasBoss 但漏此下游處。修法:_BOSS_SET2 改用單一真相 _ZEUS_TRUE_BOSSES(含雙王,鐵律 1.135),雙王不再被誤判 → 正確走 advShowBattleResult(true) 回關卡頁',
      '★ v3.15.28【黑暗球分身撐寬戰場修正 index.html CSS】根因:main.css .brow=flex-wrap:nowrap + .card 固定 253px 寬 → 7 隻黑暗球橫排約 1843px 撐寬 #gc → 把 #sb 的 action-panel 推出可視區按不到。修法:內嵌覆寫 .brow flex-wrap:wrap+max-width:100%+row-gap(載於 main.css 之後必勝,不動 main.css),多單位換行不撐寬,功能鍵保持可見;#z2 換行靠上對齊',
      '★ v3.15.28【法老王/埃及豔后選將立繪下移 index.html】getHeroThumbObjPos 補兩王特例:原 HERO_THUMB_POS 未設定 → fallback center 50% 偏低 → 改 center 30%(下移 20%,專案慣例 50%-20%);置於 premium 判斷後、通用 fallback 前,涵蓋選將/英雄頁/好友卡所有縮圖一致',
      '★ v3.15.28【未動】埃及雙王「互相復活」機制(法老回 12.5%/豔后回 25%,v3.15.25 已調)維持原設計;玩家回報「打死又回血」為此機制觀感,本次僅修「打贏後重啟」bug。若需再降復活量可另行告知',
      '★ v3.15.28【版本鏈】3 主同步點 v3.15.27→v3.15.28(本輪只改 index.html + game_changelog.js)。admin_panel.js 維持 v3.15.26、hero_db.js/world-boss.js v3.15.17、world-boss-ui.html v3.15.21',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.27(2026-06-17)— 🎨 底部主選單字體/色彩優化
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.27',
    date: '2026-06-17',
    brief: [
      '🎨【底部選單看起來更清爽】',
      '   ・主選單下方的功能按鈕(召喚、英雄、序號兌換…)<b>文字不再超出格子</b>,字體會自動配合螢幕大小。',
      '   ・每個按鈕<b>換上不同顏色</b>,更好辨認囉!',
    ],
    items: [
      '★ v3.15.27【底部主選單字體/色彩修正 index.html CSS】加第 10 顆「序號兌換」按鈕後每格變窄,原本靠繼承的 label 字體未約束→「召喚」等兩字掉到第二行/溢出格子。修法:新增 #adv-bottom-nav .adv-nav-label 高 specificity 規則(font-size clamp(10px,1.05vw,16px)+white-space nowrap+text-overflow ellipsis,!important 蓋過序號/更新日誌的 inline font-size:80%);.adv-nav-icon 也 clamp 約束;以 nth-of-type(1~10) 給 10 顆各自 border-color+label color。僅加 CSS、不動按鈕 HTML',
      '★ v3.15.27【版本鏈】3 主同步點 v3.15.26→v3.15.27(本輪只改 index.html CSS + game_changelog.js)。admin_panel.js 維持 v3.15.26(未改)、world-boss-ui.html v3.15.21、hero_db.js/world-boss.js v3.15.17。上傳順序:game_changelog.js → admin_panel.js(若 v3.15.26 尚未部署) → index.html(最後)',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.26(2026-06-17)— 🎟️ 新功能:虛寶序號兌換(老師發序號,學生輸入領獎勵)
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.26',
    date: '2026-06-17',
    brief: [
      '🎟️【全新功能:虛寶序號兌換】',
      '   ・主選單新增「<b>🎟️ 序號兌換</b>」按鈕!老師會給你<b>虛寶序號</b>,在這裡輸入就能領取獎勵。',
      '   ・獎勵可能包含 UR 英雄、各種召喚卷、召喚水晶、知識幣、超越極限果實等等。',
      '   ・<b>每個序號只能用一次</b>:已被別人領走的序號再輸入,會顯示「此序號已被使用」喔!',
      '   ・領到的獎勵會直接加進你的帳號,<b>不會蓋掉你原有的東西</b>。',
    ],
    items: [
      '★ v3.15.26【虛寶序號系統 新增 index.html + admin_panel.js】老師需求:GM 選單新增「虛寶序號」,可直接發課堂獎勵的序號讓學生輸入兌換。設計:一序號=一次性兌換券(每序號限用一次,誰先輸入誰得,兌過即失效)',
      '★ v3.15.26【GM 端 admin_panel.js】「🎁 補償與補發」群組新增「🎟️ 虛寶序號」卡片(課堂獎勵發放下方):勾選獎勵(鏡像課堂獎勵 12 項)+數量 → 設定產生組數(1~200)/有效期(永久或到期日)/備註 → 批量產生序號 → 產出含獎勵名稱的可複製清單(可整段貼給其他老師);另可查看序號清單(未兌/已兌by誰/過期/停用)、單一刪除。三點同步(SIDEBAR_ITEMS+GROUPS+卡片+handler),無 ?. 相容舊 Safari',
      '★ v3.15.26【學生端 index.html】主選單(冒險地圖頁底部功能列 + 手機版底部導覽)新增「🎟️ 序號兌換」按鈕 → openRedeemDialog 彈窗輸入序號 → _fbRedeemCode 兌換。發獎複用 _fbCompensatePlayer(union 合併不降級),走玩家寫自己 doc 路徑(payload 全非停權欄位,rule 放行)',
      '★ v3.15.26【後端 index.html】_lxpsGenRedeemCode(12碼大寫英數,排除易混淆 0/O/1/I/L)、_fbGenerateRedeemCodes(GM 批量產生,runTransaction 防撞號)、_fbListRedeemCodes(GM 列清單)、_fbAdminDeleteRedeemCode(GM 刪)、_fbRedeemCode(學生兌換:先讀檢查 → runTransaction 原子標記 redeemed → 發獎;先標記再發獎,寧可偶爾漏發也不可重複刷)。資料結構 redeemCodes/{CODE}={code,reward,itemsLabel,redeemed,redeemedBy,redeemedByLabel,redeemedAt,expiresAt,batchId,note,createdAt,createdBy,enabled}',
      '★ v3.15.26【安全 firestore.rules ⚠需老師手動部署】redeemCodes 規則:get 任何登入者(兌換需讀)、list/create/delete 限 GM、update 僅允許「redeemed:false→true 且 redeemedBy==自己 且只動 redeemed/redeemedBy/redeemedByLabel/redeemedAt」→ 玩家動不了 reward/有效期/啟用旗標,兌過的序號他人再寫被 rule 擋(transaction 之外的雙重保險)。未部署前產生/兌換都會失敗',
      '★ v3.15.26【版本鏈】3 主同步點 v3.15.25→v3.15.26;admin_panel.js v3.15.23→v3.15.26(ADMIN_PANEL_VERSION + _vers 同步)。world-boss-ui.html 維持 v3.15.21、hero_db.js/world-boss.js 維持 v3.15.17。上傳順序:game_changelog.js → admin_panel.js → index.html(最後)',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.25(2026-06-17)— 🔁 戰鬥題目出完自動循環不卡死 ＋ ⚖️ 法老王BOSS恢復/復活下修
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.25',
    date: '2026-06-17',
    brief: [
      '🔁【戰鬥答題:題目出完自動循環,不再卡死】',
      '   ・修正某些情況下,戰鬥中題目<b>全部出完後會卡住、題目一直跳不出來</b>的問題。',
      '   ・現在題目出完會<b>自動從頭重新循環出題</b>,戰鬥不會再卡死。',
      '⚖️【埃及王關:法老王(BOSS)恢復與復活下修】',
      '   ・法老王 BOSS 的大招<b>全體回血量降低 50%</b>(25%→12.5%),<b>復活量也一起調低</b>',
      '     (大招復活倒下同伴、以及和埃及豔后「互相復活」喚回法老王的血量都從 25% 降為 12.5%)。',
      '   ・<b>你自己招募的法老王不受影響</b>;埃及豔后被喚回的血量也維持原本數值。',
    ],
    items: [
      '★ v3.15.25【戰鬥題目出完循環卡死 根治 index.html advPickQuestion】老師需求:戰鬥中題目出完後要自動從第一題循環、避免卡死。根因:題庫整輪出完時 BOSS 戰回傳 { __needRepick:true } → advShowQuiz 隔 150ms 用 _advTriggerQuizSafely 重觸發再抽;但若 _advSessionQuestions 此時是空陣列(某些路徑沒初始化/被清掉),重觸發後 advPickQuestion 清空 used 後 pool 仍空 → 又回傳 __needRepick → 150ms 無限重觸發、題目永遠不出 → 卡死',
      '★ v3.15.25【修法 index.html】advPickQuestion 預設分支與 catch 分支同步改:只在「_advSessionQuestions 非空(剛清完 used、重觸發保證抽得到)」時才走 __needRepick 重觸發;session 為空時不再回傳 __needRepick,改用 ADV_QUIZ_DB 洗牌兜底補回 _advSessionQuestions、當場往下走隨機抽題 → 保證有題可出、從頭循環、永不無限重觸發',
      '★ v3.15.25【法老王 BOSS 恢復量降 50% index.html 太陽神的審判】爆發「全體回 HP」原 BOSS 版固定 25%(招募版 25%→45% 隨爆發升級)。老師需求:BOSS 版恢復量降 50% → _healPct = h.isEgyptBoss ? 0.125 : (招募版維持 0.25~0.45)。只動 BOSS 版,招募版不變',
      '★ v3.15.25【法老王 BOSS 復活量也降低 index.html】(a)爆發「太陽神的審判」復活倒下友方:_revPct = h.isEgyptBoss ? 0.125 : 0.25(BOSS 25%→12.5%,招募版維持 25%);(b)埃及雙王天賦「互相復活」喚回法老王:_phK.curHp 由最大HP×0.25 → ×0.125(兩處 hook:startTurn 行動前 + checkWin 全滅判定前皆改)。埃及豔后被喚回維持 ×0.25(老師需求僅針對法老王)',
      '★ v3.15.25【版本鏈】3 主同步點 v3.15.24→v3.15.25(本輪改 index.html + game_changelog.js)。admin_panel.js 維持 v3.15.23、world-boss-ui.html 維持 v3.15.21、hero_db.js 未改。上傳順序:game_changelog.js → admin_panel.js → index.html(最後)',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.24(2026-06-17)— 🐛 兩項戰鬥修正:世界BOSS妖怪等級、冒險第三場卡死
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.24',
    date: '2026-06-17',
    brief: [
      '⚔️【世界BOSS龍王戰:妖怪英雄等級修正】',
      '   ・修正帶「<b>大天狗 / 酒吞童子 / 玉藻前</b>」(以及埃及「<b>法老王 / 埃及豔后</b>」)上場打世界BOSS龍王時,',
      '     <b>隊伍確認顯示正確、一進戰鬥卻變回 1 級</b>的問題。現在這些英雄會正確帶著你培養的等級與能力上場了!',
      '🗺️【冒險第三關:劇情卡死修正】',
      '   ・修正第三場劇情演到一半,<b>只剩背景畫面 + 右邊法寶欄、進不了小怪戰</b>的卡死。',
      '   ・原因是過場背景沒被收起來、<b>蓋住了其實已經開始的戰鬥</b>。現在會自動把背景收掉、露出戰鬥畫面,不用再手動自救了。',
    ],
    items: [
      '★ v3.15.24【世界BOSS妖怪變Lv1 根治 index.html _wbSetupAdvForBattle】老師回報:世界BOSS龍王戰的大天狗/酒吞/玉藻前沒讀到參與玩家等級能力,隊伍確認顯示正確、進戰鬥變Lv1。根因:該函式的「二重保險」(防妖怪誤帶BOSS版高素質)原用固定 h.hp>=100 判定,但世界BOSS獨立入口傳進來的 G.p1 已套過「等級(冒險+2%/級,Lv上限50)+素質投資(HP自由50+膠囊20)」加成 → 英雄弱化版滿等(酒吞童子91基底→(91+70)×1.98≈319)早超過100 → 合法高等妖怪被誤判成BOSS版、強制打回 JP_BOSS_HERO_STATS 基底=Lv1',
      '★ v3.15.24【時序差異說明】主程式 confirmHeroPick 的同款二重保險跑在「套等級之前」的基底值(大天狗75/酒吞91/玉藻74,皆<100)故不誤觸;世界BOSS的跑在「已套等級+投資」的隊伍上(滿等≈319>100)才誤觸 → 只有世界BOSS出問題,與老師觀察一致',
      '★ v3.15.24【修法 index.html】兩處世界BOSS二重保險(妖怪 + 埃及雙王)門檻 h.hp>=100 → 改用「HERO_DB BOSS版基礎HP × 0.5」(妖怪 900×0.5=450、埃及 11500/10500×0.5=5750/5250):弱化版滿等≤319 遠低於450不誤傷;真誤帶BOSS版(900/11500)才還原。主程式兩處(跑在基底、判定正確)不動',
      '★ v3.15.24【冒險第三場卡死 根治 index.html advStartMiniBattle】老師回報+新假設:第三場劇情到一半只剩背景+法寶卡死,自救存檔→確認→關視窗,背景圖消失後就看到戰鬥畫面 → 是不是被覆蓋?確認屬實:過場層 adv-cutscene-overlay(z-index 620,內含 adv-scene-bg 背景圖 + adv-treasure-bar 法寶欄)蓋在已起的戰場上沒掀掉,玩家只看到背景+法寶、誤以為沒戰鬥(且此時 _advMiniBattleActive 已 true、原 watchdog 不再介入)',
      '★ v3.15.24【修法① index.html】進小怪戰 setTimeout 的「第一件事」就先隱藏 adv-cutscene-overlay(原本只在後段隱藏,若中段組怪/抽牌/狀態重置任一拋例外就會在隱藏前中斷、過場層永遠蓋住戰場)→ 確保後面任何步驟出錯都不會蓋住戰鬥',
      '★ v3.15.24【修法②(獨立保險)index.html】另排一個與主 setTimeout 互不影響的計時器:以 _advCurrentBattleId 綁定本場戰鬥,於「開場演出(_introDelay)後 +1500ms」檢查「本場小怪戰仍在進行 + 過場層仍蓋著」→ 強制掀掉過場層 + 清其他可能遮擋的過場彈窗(boss-detail/intro/quiz/reward/result),露出戰場。綁 battleId 確保不會誤掀之後新一場戰鬥的開場演出',
      '★ v3.15.24【版本鏈】3 主同步點 v3.15.23→v3.15.24(本輪改 index.html + game_changelog.js)。admin_panel.js 維持 v3.15.23(本輪未動),world-boss-ui.html 維持 v3.15.21,hero_db.js 未改(只讀數值)。上傳順序:game_changelog.js → admin_panel.js → index.html(最後)',
    ],
  },
];