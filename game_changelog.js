// ════════════════════════════════════════════════════════════════════════
//  game_changelog.js  —  LXPSGAME 更新日誌
//  最後更新:2026-08-12  / 目前主程式版本:v5.28.0(新玩家強制主線:序章→第二章連播+總鎖引導層)
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
  // v5.28.0 — 新玩家主線引導:序章→第二章一氣呵成(丙案·老師裁定)
  {
    ver: 'v5.28.0',
    date: '2026-08-12',
    brief: [
      '📖【新夥伴的冒險起點】第一次來到「小英雄大對抗」的新玩家,登入後會直接進入主線劇情!從序章「穿越到異世界」開始,一路冒險到第二章結束,捏出你的主角、認識第一批夥伴,把冒險的故事完整走過一遍。',
      '🗺️ 打完第二章之後,整個世界就會為你敞開:召喚星空、不可思議超商、知識王、世界龍王討伐戰⋯⋯全部自由探索!中途不小心關掉遊戲也沒關係,下次登入會從上次的進度繼續,故事不會漏掉。',
      '✅ 已經玩過主線序章的同學完全不受影響,一切照舊、自由自在!',
    ],
    items: [
      '★ v5.28.0【新玩家判定(老師裁定)】「從來沒進過主線序章」= 新玩家:登入 gate 檢查 序章未完成 && 無序章續播點(_sc_prologue>0)&& 無任何章節 done → 寫入 _fg=Date.now() 至 mainStoryProgress(本機鏡像+雲端 self-write;_msHydrateProgress 三來源 union 取最早時間戳,跨裝置一致、只分類一次)。GM(_isAdminUser)永久豁免不分類不上鎖;GM 主線回溯(_rst)整份作廢後 _fg 一併消失 → 被回溯帳號重新分類再次強制,語義正確。',
      '★ v5.28.0【強制連播引擎】_fg 存在且第二章未完成期間:_msForceChainRun 從第一個未完成章開始連播(序章→第一章→第二章·onAllDone 串鏈章與章之間零空窗);第二章 done 當下釋放鎖+恭喜提示(精緻/簡單雙版·鐵律 1.232)。中途重整/中離:場景續播點(_sc_*)既有機制接續,戰鬥獎勵冪等旗標(_r_bt_*)防重複領取。',
      '★ v5.28.0【總鎖引導層(丙案)】新增 ms-force-gate-layer(z=9700·1.5 秒輪詢):強制期間只要不在劇情演出/戰鬥/章節銜接空窗/前置彈窗(登入門/當機恢復/救援說明等 14 個 id 名單),即全螢幕蓋住遊戲顯示「▶ 繼續主線冒險」+目前章節名;層在場約 3 秒自動續播(=首登直接導入體驗),等不及可直接按鈕。重整或任何方式中離都逃不掉:下一次輪詢又蓋回,第二章完成前無法自由操作其他系統。',
      '★ v5.28.0【舊玩家零影響】曾進過序章(含中途退出留有續播點)的所有帳號不被分類、不上鎖,維持 v4.65.0 原行為:僅 progress 全空時自動導入序章一次,其後完全自由。版號七點同步 v5.28.0(index/mainstory/admin_panel/game_changelog 四鍵 bump;hero_db/avatar_db/sw/world-boss 未動不 bump);CURRENT_BOOT_VER/AVATAR_DB_VERSION 永久凍結未動;changelog 刪最舊 v5.9.0 維持恰 20 條。上傳順序:game_changelog → admin_panel → mainstory → index(最後)。',
    ],
  },
  // v5.27.0 — 裝備系統 Phase 1:資料層+核心(GM 測試期 adminOnly)
  {
    ver: 'v5.27.0',
    date: '2026-08-11',
    adminOnly: true,
    brief: [
      '🛡️【裝備系統搶先看(GM 測試中)】全新裝備系統第一期登場!60 種生活小物裝備(草帽、平底鍋、鍋蓋、夾腳拖、冠軍獎盃⋯⋯)分成頭部/身軀/主手/副手/腿部/飾品六個部位,每件裝備取得時會隨機 Roll 出專屬詞條,永久固定、每一件都獨一無二!',
      '🛡️ 打開英雄圖鑑詳情,「至寶」下方多了「裝備欄位」:六個部位想裝就裝、想換就換,攻擊/特技/速度/HP 加成立刻反映在素質卡上(藍色 🛡️ 標記),出戰時真實生效!',
      '🎲 GM 限定:登入自動獲得全部 60 件各 1 件,每件裝備旁有「重Roll」按鈕可以重骰詞條測試手感。掉落/商店/召喚等取得途徑、格擋與狀態詞條的戰鬥效果,會在之後的版本陸續開放!',
    ],
    items: [
      '★ v5.27.0【資料層】GEAR_DB 60 件(6 部位×10·生活常見物品命名·稀有/史詩/傳說/神話四階=詞條 1/2/3/4 條·精緻風+簡單風雙版說明鐵律 1.232 創建期一次到位)+ GEAR_AFFIX_POOL 57 條詞條(通用 26/主副武狀態附加 10/頭部特定抵抗 11/飾品開場增益 10;免疫類 7 條僅傳說以上可骰·同狀態免疫與抵抗不可同件並存·開場增益同件最多 2 條·權重抽選·上下限內隨機 Roll 取得當下永久固定)。',
      '★ v5.27.0【資料模型與雲端同步(總鐵則檢查表)】equipmentData={instances:{eqUid:{itemId,affixes,gifted,equippedTo,src,at,at2,rr}}} 以取得當下唯一實例碼 eqUid 為鍵隨玩家主檔(零新 collection·firestore.rules 免改);槽計分 gearCount×30/件防覆蓋謀殺;三槽合併以 eqUid 整顆實例 union(at2 新者勝·v3.16.67 至寶漏欄位教訓)+ _equipUnlockHistory 帳本(300 筆·src+uid12+at)稽核感知 admin_delete 排除防殘槽復活;★ 零 localStorage 本機鏡像=雲端唯一權威(v3.13.93 教訓),全域變數列入 _clearAccountLocalData;受贈抵銷帳 giftReceivedLedger 欄位同步就緒(給心計算 Phase 4)。',
      '★ v5.27.0【素質套用+UI】_applyGearToHero 於冒險建隊至寶套用後同點生效:數值型(攻/特/速/HP)直加素質,百分比與戰鬥鏈類(減傷/格擋/抗性/免疫/狀態附加/開場增益/屬性減免)彙總 h._gearEff 待 Phase 2 戰鬥機制輪接線(三上限 50/50/35 屆時一併生效);鬥技場建隊不經此路徑=公平制鐵律 1.153 自然排除。圖鑑詳情至寶下方新增「🛡️ 裝備欄位」六槽(裝/卸/轉裝);素質卡/右欄有效值/圖鑑編隊排序 _getHeroEffectiveStat 均計入裝備數值加成(藍色 🛡️ 徽章)。',
      '★ v5.27.0【GM 測試(老師裁定)】登入 hydrate 完成後自動補發全部 60 件各 1 件(src=gm_grant 冪等判定·不重複發);裝備選擇視窗每件附「🎲 重Roll(GM)」按鈕重骰詞條(rr 計數+at2 更新·僅 GM 可見可用)。取得途徑(掉落/超商/召喚/送禮)與戰鬥效果引擎依分期計畫後續版本開放。',
      '★ v5.27.0【同版配套+老師四裁定】舊寵物卡系統 EQUIP_DB 全面改名 CARRY_PET_DB(老師裁定·純識別字改名 139 處零行為變更;新系統採 GEAR_ 前綴,漏改殘留會直接報錯可見不會靜默讀錯庫);老師四裁定同輪落實:①絕緣工作服=受到風屬性傷害-25%+抵抗麻痺+30%(原表雷屬性引擎無對應)②厚字典=減傷2%+攻擊+2(原表-15%修正)③同名裝備可重複獲得(詞條各異)全部保留,全帳號持有上限 100 件(_GEAR_MAX_OWNED·_gearGrant 守門+滿載提示·超過需賣出/贈送好友騰位[Phase 3/4 開通]·GM 補發豁免)④測試期閘門 _GEAR_ADMIN_ONLY=true 學生完全看不到圖鑑裝備欄位區塊(正式開放改 false 單一開關)。版號七點同步 v5.27.0;changelog 刪最舊 v5.8.0 維持恰 20 條;上傳順序:game_changelog → admin_panel → mainstory → index。',
    ],
  },
  // v5.26.0 — 手機解析度適配(主線/造型工房/寵物小屋:排版、字級、按鈕、捲動全面優化)
  {
    ver: 'v5.26.0',
    date: '2026-08-10',
    brief: [
      '📱【用手機玩也舒服了】主線劇情、造型工房、寵物小屋針對手機螢幕全面調整!直著拿手機看主線,章節卡片會自動換行排好、標題和按鈕大小剛剛好;劇情對白的字改成適合手機的大小,超長的句子對話框還能捲動,一個字都不會被切掉!',
      '👤 手機直著開造型工房,變成「上面看主角、下面選造型」的排法,選單不再擠成一團;寵物小屋的三張寵物卡改成「左右滑動」查看,每張卡和按鈕都維持原本大小,想按哪裡都按得到!',
      '📖 橫著拿手機時,各畫面的頂列會自動變矮、右上角的按鈕會避開瀏海,內容區變大更好看。iPad 上的畫面完全不受影響,跟之前一模一樣!',
    ],
    items: [
      '★ v5.26.0【雙斷點 media query(index.html 主 style 區塊)】@media (max-width:600px)=手機直向(iPad 直向 768px 不命中)/@media (max-height:520px)=手機橫向(iPad 橫向高 768+ 不命中)→ iPad 行為零變更。CSS 蓋 inline style 一律 !important。',
      '★ v5.26.0【主線】章節選單:標題 44→28px、卡片 flex-wrap 換行(徽章+文字一行·按鈕+縮圖整行置中)、徽章 64→44px、動作鈕字級縮;劇情對白:對白 46→24px(直)/20px(橫)、說話者縮、對白框 padding 縮+max-height 62vh(直)/74vh(橫)+overflow-y:auto(長句可捲動完整呈現不裁切)、上一句/下一句鈕縮;跳過鈕/關閉鈕手機橫向貼齊 env(safe-area-inset) 避開瀏海。選擇器錨點=mainstory.js 三處純加 class(ms-sel-head/ms-ch-card/ms-dlg-wrap·對白框特意用 class 不用 id 避開 v4.89.0 舊場景拔 id 機制)零行為變更。',
      '★ v5.26.0【造型工房】手機直向:主體改 flex-direction:column「上預覽(min(30vh,56vw))・下選單」堆疊、頁籤欄 150→104px、頂列鈕與紙娃娃說明行/底部鎖定說明列隱藏省空間;手機橫向:頂列壓扁+說明隱藏(左右佈局維持·預覽 v5.25.0 min(80vh,60vw) 自動縮)。avatar_db.js 本輪零改動不 bump(選擇器用 _avatar-panel id+nth-of-type;⚠ 日後改動面板頂層子元素順序需同步檢查 CSS)。',
      '★ v5.26.0【寵物小屋】手機直向:槽位列取消 _phFitSlots 整列 transform 縮放(縮到 0.59 倍按鈕實際僅 26px 難按)改「全尺寸+#_ph-slots 橫向捲動」(transform:none !important 蓋 JS inline·卡片與 44px 按鈕維持原大好按·左右滑動完整呈現三張卡)+頂列玩法說明隱藏(❓教學鈕仍在)+圖鑑桌鈕 96px+食物面板 margin-right 縮;手機橫向:頂列壓扁+食物面板 26vh → 中段可視高提升、_phFitSlots 縮放比自動改善。',
      '★ v5.26.0【圖鑑三頁+版號】hero-page-grid/hero-detail-box/monster·pet-page-content 手機內距縮;戰鬥引擎與召喚/商店/鬥技場/世界BOSS等其他系統本輪不動。版號 7 同步點對齊 v5.26.0(FILE_VERSIONS bump index/mainstory/admin_panel/game_changelog 四鍵;avatar_db/hero_db/sw/world-boss 未動不 bump);CURRENT_BOOT_VER/AVATAR_DB_VERSION 永久凍結未動;changelog 刪最舊 v5.7.0 維持恰 20 條。上傳順序:mainstory.js 在 index.html 前。',
    ],
  },
  // v5.25.0 — iPad 觸控優化(主線劇情/造型工房/寵物小屋:按鍵好按、連點不卡、捲動更順)
  {
    ver: 'v5.25.0',
    date: '2026-08-10',
    brief: [
      '📱【iPad 操作大優化】主線劇情、造型工房、寵物小屋在 iPad 上全面變好按了!所有按鈕加上觸控加速,快速連點(像造型工房的 ◀▶▲▼ 微調鈕、劇情的「下一句」)不再有卡一下的延遲;按鈕也不會再因為「按住太久」跳出奇怪的文字選取選單。',
      '🐾 寵物小屋的「撫摸/餵食/玩耍」按鈕和右上角「請出小屋」按鈕通通變大變好按,再也不會想按卻按不到!造型工房和主線章節選單的捲動也變順了,捲到底不會再把整個畫面拉走。',
      '👤 直著拿 iPad 開造型工房時,左邊的主角預覽現在會自動縮到剛剛好的大小,不會再變形或超出畫面。',
    ],
    items: [
      '★ v5.25.0【全域觸控 CSS(index.html 主 style 區塊)】以 overlay 根 id 作用域一次涵蓋三系統(mainstory-select-overlay / mainstory-overlay / mainstory-cover-overlay / _avatar-panel / _av-confirm-modal / _avatar-card-modal / _av-unlock-how / pet-house-overlay / _ph-pick-modal / pet-play-overlay)內所有 button:touch-action:manipulation(消除 iPad Safari 快速連點的雙擊縮放判定延遲)+ -webkit-tap-highlight-color:transparent + user-select/touch-callout:none(防長按跳文字選取)+ min-height:44px(觸控目標拉到 Apple HIG 44pt 下限;寵物槽位互動鈕原約 35px、「請出小屋」鈕原約 26px 為誤觸主因;槽位列增高由既有 _phFitSlots 自動縮放吸收)。所有動態 DOM 都掛同一 document,CSS 依 id 必生效 → mainstory.js 完全不必改動免重傳。',
      '★ v5.25.0【捲動容器補強】mainstory-select-overlay(章節選單)/_av-tabs、_av-opts(工房頁籤與選項區)/_ph-food(食物面板)/_ph-pick-modal 選寵清單:補 -webkit-overflow-scrolling:touch(慣性捲動)+ overscroll-behavior:contain(捲到底不外溢拉動整頁=iOS 橡皮筋卡死根治)+ touch-action:pan-y(捲動手勢與點擊不互吃)。餵食拖曳(_ph-food-drag touch-action:none)與翻牌/躲貓貓小遊戲既有觸控設定零改動。',
      '★ v5.25.0【造型工房直向 iPad 溢出修正(avatar_db.js 唯一實質改動)】左預覽容器 height:80vh → min(80vh,60vw):直向 iPad 80vh=819px 換算 7:10 寬遠超左欄 46%,顯式 height 讓 aspect-ratio 失效造成人物變形/溢出;60vw 在所有橫向 iPad(1024/1180/1366 寬)取值仍= 80vh 行為零變更,只在直向自動縮進欄寬。',
      '★ v5.25.0【範圍說明】戰鬥引擎(冒險/主線實戰/世界龍王/鬥技場共用)久經驗證本輪不動;戰報鈕/圖鑑頁等既有 touch-action 零改動。版號 7 同步點對齊 v5.25.0(FILE_VERSIONS bump index/avatar_db/admin_panel/game_changelog 四鍵;hero_db/mainstory/sw/world-boss 未動不 bump);CURRENT_BOOT_VER 與 AVATAR_DB_VERSION 永久凍結未動;changelog 刪最舊 v5.6.0 維持恰 20 條。',
    ],
  },
  // v5.24.0 — 主神奧汀「注視」機制改版(老師裁定:代承+反擊,每人最多 1 層)
  {
    ver: 'v5.24.0',
    date: '2026-08-09',
    brief: [
      '👁️【奧汀天賦改版】主神奧汀的「注視」守護全新登場!以前被注視的隊友受傷時會「完全免疫」,現在改成——眾神之父會親自挺身而出,「代替隊友承受這次傷害」,並立刻以自己攻擊 100% 的力量反擊對手,同時這名隊友身上的注視消失!為同伴擋刀、當場還擊,更有守護神的氣魄!',
      '👁️ 同步調整:「注視」現在每人最多 1 層(原本最多 2 層),奧汀每回合會優先把注視分給還沒有注視、HP 最低的隊友,天賦升級可以同時守護更多不同的隊友(最多 4 人)。',
      '🐉 小提醒:遇到龍王爆發這類「無視有利狀態」的超強攻擊時,注視仍維持上一版的「奮力擋下一半」規則(不轉移、不反擊、注視不消失)。',
    ],
    items: [
      '★ v5.24.0【奧汀「注視」機制改版(老師裁定)】index.html doDmg ODIN-2 hook:被注視友方受對手直接攻擊時,由「免疫該次傷害(return 0)+消耗 1 層」改為「由奧汀代為承受該次傷害」(return doDmg(奧汀, rawDmg, opts+_odinGazeRedirect 防遞迴)+奧汀以攻擊 100%(+10%/天賦級,乘算,升級軌不變)反擊+該次「注視」整顆移除(失去注視);目標若是奧汀自己則不轉移、傷害照常結算但仍反擊+失去注視;奧汀已倒下不觸發,DoT / 反擊 / 治療不觸發。',
      '★ 注視施加改「每人最多 1 層」:startTurn 施加段只挑「尚未注視」的最低 HP% 友方,不再疊第 2 層;配額(1+天賦級,最多 4)全數分散到不同友方,全員各有 1 層即停。',
      '★ ignoreBuffs(無視有利)攻擊維持 v5.23.0「擋下一半」分支零改動(不轉移/不反擊/不消耗);龍王爆發 _wbBurstMinHalf「至少保留原始一半」最終下限不受影響。',
      '★ 文案同步(鐵律 1.232 雙版/1.160 只寫 Lv1):hero_db.js HERO_TRAIT desc/fd、_TRAIT_LV_INFO(max 修正「注視 5 層」誤植→「注視 4 人」)、HERO_LORE、檔尾 _LXPS_HERO_SD trait + index.html 奧汀登場介紹卡 + hero_input.html trait 同步。',
    ],
  },
  // v5.23.0 — 龍王爆發至少保留一半傷害(老師裁定:免疫類改擋半+最終下限)
  {
    ver: 'v5.23.0',
    date: '2026-08-09',
    brief: [
      '🐉【龍王爆發規則定案】龍王的極限爆發遇到再強的減傷和無敵/免疫技能,現在「至少會打進一半的傷害」!免疫類守護(奧汀的注視、幽幽的暗行、科學發明家的反應力場)遇到龍王爆發這種「無視有利狀態」的攻擊,從上一版的「完全擋不住」調整成「奮力擋下一半」——守護仍然有價值,但再也擋不下全部!',
      '🛡️ 放心:一般的普通攻擊、S1/S2 技能被注視免疫+奧汀反擊、暗行全免疫、反應力場擋下+反彈的行為通通不變,只有「無視有利狀態」的大招會被打折成一半。',
      '💥 就算各種減傷效果層層疊加,龍王爆發最後結算的傷害也保證至少是原始傷害的一半(戰鬥紀錄會顯示「龍王爆發之力貫穿層層防禦」);鐵匠工匠魂這類「不會倒下」的保命被動仍然有效,最多被打到剩 1 HP 不會直接陣亡。',
    ],
    items: [
      '★ v5.23.0【免疫類改擋半】奧汀「注視」(_odinGaze)/幽幽「暗行」(_youyouDarkwalk)/科學發明家「反應力場」(_inventCounter)三個免疫類 hook,vs 帶 ignoreBuffs(無視有利狀態)的攻擊由 v5.22.1「完全貫穿」改為「擋下一半」(rawDmg ×0.5,floor,min 1):免疫失效但仍抵擋 50%;不消耗注視層數、反應力場卡片保留且不反彈、不觸發奧汀反擊;對齊火龍王天崩之炎「無敵 BUFF 強制改為減傷 50%」原始設計並推廣到全免疫類。未帶 ignoreBuffs 的普攻/S1/S2 等一般攻擊,免疫+反擊/擋反行為完全不變。',
      '★ v5.23.0【龍王爆發最終下限】index.html doDmg 主扣血點前新增兜底:opts._wbBurstMinHalf + _wbBurstOrigDmg(world-boss.js 六處龍王爆發 doDmg 帶入:草/土/水/風/火 execSkill hook 版/火預設天崩之炎)→ 全鏈路免疫/減傷疊完後最終傷害低於「原始一半」即補回 ceil(orig×0.5) 並印 log;只提高不降低。置於工匠魂等「不倒類」保命被動之前 → 保命被動仍可把致命傷夾成 HP 剩 1,下限不會打穿保命。S1/S2/普攻不帶旗標,不受下限影響。',
      '★ v5.23.0【版號】7 同步點對齊 v5.23.0(index.html _GAME_LOADED_VERSION + _LXPS_FILE_VERSIONS 四鍵 index/admin_panel/game_changelog/world-boss.js、ADMIN_PANEL_VERSION、changelog 檔頭+置頂 ver);world-boss-ui.html 本輪未動維持 v5.22.1;hero_db.js/avatar_db.js/mainstory.js/sw.js 未動;CURRENT_BOOT_VER 永久凍結未動;changelog 刪最舊 v5.5.0 維持恰 20 條。',
    ],
  },
  // v5.22.1 — 龍王爆發沒傷害根因②修復(注視免疫尊重無視有利)+龍王 LOG 動態化
  {
    ver: 'v5.22.1',
    date: '2026-08-09',
    brief: [
      '💥【龍王爆發沒傷害・真正修好了】有玩家回報 v5.22.0 後「龍王對我放爆發還是沒傷害」——這次抓到真兇:主神奧汀的「注視」守護原本連「無視有利狀態」的攻擊都能免疫,奧汀每回合幫血最少的隊友補注視,全隊滿血時注視遍佈四人 → 龍王爆發四發全被免疫吃掉,只剩冰凍封技照上、血條完全不動。現在「無視有利狀態」的攻擊(像龍王爆發)會貫穿注視,免疫不再萬能;一般攻擊被注視免疫+奧汀反擊的行為完全不變!',
      '🌑 同一類問題一次修好:幽幽的「暗行」全免疫、科學發明家的「反應力場」擋反卡,遇到無視有利狀態的攻擊同樣會被貫穿(貫穿時不消耗層數/卡片,留給下一次一般攻擊用)。',
      '🦷【戰鬥 LOG 更對味】海龍王戰不會再出現「維蘇威炎爪」了——每隻龍王的普攻改顯示自己的爪擊:深淵冰爪、翠玉藤爪、山岳岩爪、風暴雷爪…;傷害上限提示也改顯示各龍王自己的天賦名(深淵之意志、翠之意志…),不再全部寫「炎之意志」。',
    ],
    items: [
      '★ v5.22.1【爆發沒傷害根因②】玩家 v5.22.0 BUG 回報實錘(R8 爆發後全隊 freeze/seal/_burstSeal 照上、四人 HP 全滿):傷害被 doDmg 內奧汀「注視」(_odinGaze)免疫 hook return 0——該 hook 原本沒有 opts.ignoreBuffs 檢查,而全龍王爆發皆帶 ignoreBuffs:true(文案「無視有利狀態」)。修:注視免疫改尊重 ignoreBuffs——帶 ignoreBuffs 的攻擊貫穿(印「注視被貫穿」log·不消耗層數·不觸發反擊);未帶 ignoreBuffs 的普攻/S1/S2 維持原免疫+反擊行為零改動。v5.22.0 的 acted 守門(timer 被砍路徑)為另一獨立防護,保留。',
      '★ v5.22.1【同類病灶一次修】幽幽「暗行」(_youyouDarkwalk 全免疫)與科學發明家「反應力場」(_inventCounter 擋下+反彈)同樣原無 ignoreBuffs 檢查 → 一併改尊重 ignoreBuffs(貫穿=不免疫/不擋不反,buff 與卡片保留);對齊貓人族長冰精靈守護/鐵匠迴避等既有慣例。變化狸障眼法為刻意設計的硬免疫,維持不動。',
      '★ v5.22.1【龍王 LOG 動態化】①world-boss.js _wbAdvBossNormalAtk(全龍王共用普攻/追擊)LOG「🦷 維蘇威炎爪」改依 MONSTER_ELEMENT/WORLD_BOSS_LINEUP 屬性動態:火=維蘇威炎爪/水=深淵冰爪/草=翠玉藤爪/土=山岳岩爪/風=風暴雷爪/暗=黃泉冥爪/光=高天原聖爪/幻=星辰幻爪 ②index.html doDmg 龍王受傷上限三處 LOG(主路徑/固定值/爆擊)「炎之意志」改讀 HERO_TRAIT[龍王名].name(深淵之意志/翠之意志/雷霆之意志…·查無 fallback「龍王之意志」)③world-boss-ui.html 舊引擎 fallback 兩處寫死同步去除(保險)。',
      '★ v5.22.1【版號】7 同步點對齊 v5.22.1(index.html _GAME_LOADED_VERSION + _LXPS_FILE_VERSIONS 五鍵 index/admin_panel/game_changelog/world-boss.js/world-boss-ui.html、ADMIN_PANEL_VERSION、changelog 檔頭+置頂 ver);hero_db.js/avatar_db.js/mainstory.js/sw.js 本輪未動;CURRENT_BOOT_VER 永久凍結未動;changelog 刪最舊 v5.4.0 維持恰 20 條。',
    ],
  },
  // v5.22.0 — 世界龍王戰四合一修正(背景位置/開場咆哮/爆發傷害/爆發動畫時序)
  {
    ver: 'v5.22.0',
    date: '2026-08-09',
    brief: [
      '🐉【龍王的頭露出來了】世界龍王戰的背景圖往下移了一段,龍王的頭部不會再被上方的血條擋住,壯觀的龍王全貌看得更清楚!',
      '❄️【每隻龍王都有自己的台詞了】深淵海龍王(還有之後登場的暗、光、幻龍王)開場咆哮換成自己專屬的台詞和配色,不會再借用火龍王的怒吼;戰鬥中「下回合將釋放爆發技」的預告、房間裡的招式介紹,也都會正確顯示牠自己的招式名稱!',
      '💥【海龍王的爆發修好了】有時候海龍王放出「絕對零度·冰封終焉」,動畫播完卻沒有造成任何傷害——原因是戰鬥指令偶爾會「重複下達」,把爆發的傷害排程整條取消掉。現在加上了守門機制,所有龍王的技能和爆發都會確實生效!',
      '🎬【爆發動畫先看完,傷害才登場】所有英雄的極限爆發改成「動畫播完才結算傷害和治療」,在世界龍王戰裡也一樣;趕時間的話按「跳過 ⏭」,動畫立刻收起、效果馬上生效,節奏由你決定!',
    ],
    items: [
      '★ v5.22.0【背景位置】龍王戰背景圖垂直位置 65%→35%(index.html 戰鬥背景設定;圖高 175%,數值越小圖越往下移露出上方龍頭;全龍王一致,比照 v4.25.0 舊 UI 路徑同款調整口徑)。',
      '★ v5.22.0【開場咆哮補齊】world-boss.js _WB_BOSS_ROAR_LINES/_ROAR_COLOR 補上 深淵海龍王/邪骨暗龍王/神聖光龍王/星辰幻龍王 四筆專屬開場台詞與配色(原缺此筆 → 開場對白 fallback 成火龍王的,與 v4.22.0 雷龍王同病一次補齊);戰鬥中 R4 爆發預告改讀 BURST_DB[當前龍王] 動態顯示爆發技名;崩毀「最終滅絕」與擊敗訊息改動態龍王名;房間迷你預覽的屬性與三招名改依當前龍王動態(新增 _WB_BOSS_SKILL_NAMES 三招表);世界戰關卡說明文案去火龍王寫死。',
      '★ v5.22.0【爆發沒傷害根治】龍王爆發傷害本就設計「動畫 2.2 秒後才生效」(存於 boss._wbBossTid 排程);但疊發的重複 AI 呼叫會經由兩條無守門路徑(index.html _realAiAct 世界BOSS攔截段、world-boss.js aiAct hook 直達段)重進 _wbAdvBossTurn,其入口 clearTimeout 把爆發傷害排程整條砍掉 → 動畫播了卻無傷害無 log。兩條路徑皆補上 acted=true 守門(對齊 v5.21.0 甲:世界BOSS答題 cb 以 _quizCbBypass 一次性旗標放行;重複呼叫直接忽略、不排 startTurn 防疊發),並印 🛡 警示 log 供日後追蹤;火/草/土/雷/海全龍王技能與爆發同受保護。',
      '★ v5.22.0【爆發動畫時序】移除 v4.33.0 影片重排路徑的世界BOSS排除(_bvInWB):世界龍王戰中有爆發影片的英雄(天神宙斯/主神奧汀/藝天使/大天狗/玉藻前/酒吞童子/巫女/法老王/埃及豔后等)也改走「影片結束/跳過才放 GIF 特效+傷害/治療數字」;影片路徑補 _wbFxCapture burstCinematic 廣播,連線模式隊友端仍看得到爆發演出;無影片英雄與敵方 BOSS 維持原時序零改動(龍王自身爆發本就 GIF 播畢才生效,符合同一規則)。',
      '★ v5.22.0【版號】7 同步點對齊 v5.22.0(index.html _GAME_LOADED_VERSION + _LXPS_FILE_VERSIONS 五鍵 index/admin_panel/game_changelog/world-boss.js/world-boss-ui.html、ADMIN_PANEL_VERSION、changelog 檔頭+置頂 ver);mainstory.js/avatar_db.js 維持 v5.19.0、hero_db.js 維持 v5.18.0、sw.js 本輪未動(world-boss 兩檔走 ?v= 破快取 network-first,無需 SW bump);CURRENT_BOOT_VER 永久凍結未動;changelog 刪最舊 v5.3.0 維持恰 20 條。',
    ],
  },
  // v5.21.0 — 戰鬥卡死修復:敵人多次行動守門+全滅 3 秒巡邏(玩家 BUG 回報)
  {
    ver: 'v5.21.0',
    date: '2026-08-09',
    brief: [
      '🛠️【戰鬥突然跳出修好了】有同學回報「打到一半突然被踢出戰鬥」——原因找到了:敵人偷偷在同一回合連續行動好幾次,還把新回合的答題視窗擠掉害你直接被判答錯,戰鬥卡住 20 幾秒後才被保險機制強制結束,感覺就像突然跳出遊戲。',
      '🛡️ 現在敵人一回合只能行動一次,新回合答題不會再被擠掉;而且只要有一方全部倒下,3 秒內就會正常結算勝負——不會再卡住很久才突然跳出!',
    ],
    items: [
      '★ v5.21.0【甲·acted 守門】_realAiAct 一般路徑新增 p2 已行動守門(a.acted=true → 跳過行動改排 startTurn 推進;根治同一敵人單回合多次行動+多重 startTurn 疊發+新回合答題被後到 startTurn 當孤兒清除秒判答錯);世界 BOSS 行動前答題 cb 刻意先設 acted=true 的路徑以 _quizCbBypass 一次性旗標放行(讀到即清);世界 BOSS 追擊(鐵律 1.113)走 _wbAdvBossTurn 攔截在守門之前,零影響;守門僅限 p2,p1 自動戰鬥維持原行為。',
      '★ v5.21.0【乙·全滅 3 秒巡邏】借用 _gp heartbeat 既有 3 秒節拍新增冒險戰鬥全滅巡邏:任一方全滅且未結算 → 立即走與 startTurn v3.14.0/v3.14.4 保險完全相同的正規收場(checkWin 優先;敵方全滅且小怪戰中走 advFinishMiniBattle);最長 20+ 秒凍結縮到 ≤3 秒。安全閘:G._annihilationPatrolFired 每場一次(G 每場 initGame 全新物件天然歸零)/cutscene·小怪結算視窗顯示中不介入/答題進行中跳過本拍/世界 BOSS·鬥技場不適用,條件與 startTurn 保險完全對齊。',
      '★ v5.21.0【版號】7 同步點對齊 v5.21.0(index.html _GAME_LOADED_VERSION + _LXPS_FILE_VERSIONS 三鍵 index/admin_panel/game_changelog、ADMIN_PANEL_VERSION、changelog 檔頭+置頂 ver);mainstory.js/avatar_db.js 維持 v5.19.0、hero_db.js 維持 v5.18.0、sw.js 本輪未動;CURRENT_BOOT_VER 永久凍結未動;changelog 刪最舊 v5.2.0 維持恰 20 條。',
    ],
  },
  // v5.20.0 — 主線活動介紹卡圖文並茂改版(鼓勵創造自己的主角)
  {
    ver: 'v5.20.0',
    date: '2026-08-08',
    brief: [
      '🖼️ 「近期活動」的主線劇情介紹頁全新改版,變得圖文並茂:有序章封面大圖、七個章節的封面一字排開,還有故事場景照片,一眼就看到冒險世界長什麼樣子!',
      '👤 「捏出你自己的主角」變成介紹頁的最大主打:三個步驟(選髮型換衣服 → 戴帽子小物 → 印成專屬名片)一看就懂,快去創造全世界只有一個的你!',
      '🎁 章節獎勵說明同步更新:每章第一次通關固定拿 🔮 召喚水晶 ×5 + 💰 知識幣 20,000,戰鬥還有經驗值!',
    ],
    items: [
      '★ v5.20.0【純顯示層】buildMainStorySection 圖文並茂改版:①序章封面大橫幅(漸層疊字) ②「捏出你的主角」升級置頂主打區(主線_序章_雙月河堤.jpg+三步驟晶片+金框強調+入口指路雙處) ③七章封面橫向縮圖帶(素材=章節選單 cover 同組·零新圖檔·橫向可捲) ④特色卡改上圖下文(第三章封面/社團教室/黑暗球降臨場景圖) ⑤近期活動選單列 mainstory 卡補 2 張縮圖+sub「捏出你自己的主角」前置。',
      '★ v5.20.0【防呆】全部圖片 onerror 隱藏防缺圖破版;文案 cute/premium 雙版(鐵律 1.232);測試期預告橫幅分支保留(_msPub);零機制/零資料改動。',
      '★ v5.20.0【文案修正】獎勵卡由「英雄經驗值和技能升級書」改為實際發放口徑「🔮 召喚水晶 ×5 + 💰 知識幣 20,000 + 戰鬥經驗值(首勝限定·綁定帳號)」,與 v5.2.0 發獎實作及遊戲指引一致。',
      '★ v5.20.0【版號】7 同步點對齊 v5.20.0(index.html _GAME_LOADED_VERSION + _LXPS_FILE_VERSIONS 三鍵 index/admin_panel/game_changelog、ADMIN_PANEL_VERSION、changelog 檔頭+置頂 ver);mainstory.js/avatar_db.js 維持 v5.19.0、hero_db.js 維持 v5.18.0 本輪未動;CURRENT_BOOT_VER 永久凍結未動;changelog 刪最舊 v5.1.0 維持恰 20 條。',
    ],
  },
  // v5.19.0 — 主線劇情+自訂主角系統 正式開放(玩家版開放公告·不標 adminOnly)
  {
    ver: 'v5.19.0',
    date: '2026-08-08',
    brief: [
      '📖【主線劇情正式開放!】期待已久的「主線劇情故事」今天正式對全體同學開放!校外教學那天,你追著一隻藍鵲……一轉身就掉進了異世界!從序章到第六章,共 7 章的冒險故事等你來玩:遇見夥伴、學會戰鬥、打敗臭氣魔王、拿到神劍至寶,最後迎戰吞噬色彩的黑暗球!',
      '👤【捏出你自己的主角!】關卡頁新增「👤 我的主角」造型工房:體型、膚色、髮型、整套衣服、帽子眼鏡小物通通自己搭,做出獨一無二的你,還會印成一張專屬的「冒險者名片」——名片、英雄圖鑑的主角卡和主線故事裡的主角,都會用你捏的樣子!',
      '⚔️【主角會覺醒成 SSR!】主線打到第六章,你的主角會在最終決戰覺醒——從 R 卡覺醒成 SSR,圖鑑多一張新卡,之後還能用「技能繼承」幫主角換招式!',
      '🎁【每章都有大獎勵】每通關一章,固定獲得 🔮 召喚水晶 ×5 ＋ 💰 知識幣 20,000(綁定帳號,一輩子只發一次;回顧劇情或換平板都不會重複發、也不會漏發)。',
      '▶ 入口:關卡選擇頁最上方的「📖 主線劇情」按鈕;章節要照順序玩,中途離開下次會接著播。第一次進序章會自動打開造型工房,先捏好你的主角再開始冒險!',
      '💡 詳細玩法可以看「📚 遊戲指引」新增的「主線劇情」和「我的主角」兩章;目前故事到第六章告一段落,第七章製作中,敬請期待!',
    ],
    items: [
      '★ v5.19.0【正式開放·單一開關×2】mainstory.js _MAINSTORY_ADMIN_ONLY true→false + avatar_db.js _AVATAR_ADMIN_ONLY true→false(老師指示同輪切換·主線序章開造型工房兩系統一體);其餘連動全自動(v4.86.0/v5.6.0 既有設計):關卡頁 📖 主線鈕+✅進度徽章、👤 我的主角鈕、好友 📇 名片鈕全員顯示;近期活動介紹卡自動切「NEW!」正式文案;遊戲指引「主線劇情」「我的主角」兩章自動出現並重排連號。',
      '★ v5.19.0【開放前保護早已就緒(本輪零新碼)】章節獎勵 _r_bt_ 冪等綁 UID+雲端(換裝置/回顧不重發);v5.6.0 共用平板四道保護(旗標即時上雲/主角臉殘留根治/hydrate 懶回寫對帳/ch6 覺醒自我修復);v5.7.0 GM 主線/主角回溯工具;v5.9.0 主角 20 枚獎章 _protagMedalSweep 冪等。',
      '★ v5.19.0【破快取】mainstory.js 內容有變 → _LXPS_FILE_VERSIONS mainstory 鍵 v5.12.0→v5.19.0(結束「內容未變維持 v5.12.0」凍結);avatar_db.js 鍵 v5.17.0→v5.19.0;AVATAR_DB_VERSION 維持凍結 v4.95.2(未覆蓋任何同名素材·依凍結規則不 bump·900 台不重抓部件圖);sw.js/hero_db.js/adv_quiz_db.js 本輪未動。',
      '★ v5.19.0【版號】7 同步點全對齊 v5.19.0(index.html _GAME_LOADED_VERSION + _LXPS_FILE_VERSIONS 五鍵 index/mainstory/avatar_db/admin_panel/game_changelog、ADMIN_PANEL_VERSION、changelog 檔頭 + 置頂 ver);hero_db.js 維持 v5.18.0 本輪未動;CURRENT_BOOT_VER 永久凍結未動;changelog 刪最舊 v5.0.0 維持恰 20 條。',
    ],
  },
  // v5.18.0 — 動態英雄第三期:GM 遊戲內直接上架新英雄(測試期 adminOnly)
  {
    ver: 'v5.18.0',
    date: '2026-08-07',
    adminOnly: true,
    brief: [
      '🦸 GM 後台新增「動態英雄」:老師可以直接在遊戲裡設計新英雄——填數值、上傳立繪、挑天賦模板、設定技能效果,發佈後全體玩家下次開機自動出現在圖鑑、召喚和戰鬥,不用再改程式檔!',
      '⚙️ 技能效果可自由組合:傷害三型(單體/全體分攤/隨機多段)、治療三型、有利狀態 8 種、不利狀態 15 種(可強力版),回合數或持續到戰鬥結束;爆發動畫和音效直接從現有素材挑選套用!',
    ],
    items: [
      '★ v5.18.0【動態內容層第三期・動態英雄】GM 後台新增「🦸 動態英雄」(掛『📚 內容擴充』群組·三點同步):設計單表單(配點總和=100 即時驗證·HP 發佈時自動×1.3 baked·立繪 canvas 壓縮 WebP 優先≦120KB·天賦六模板·S1/S2/爆發三格參數·爆發 gif/sfx 下拉=執行期自現有素材蒐集零硬編碼)→👁 預覽自動生成的雙版圖鑑說明→📦 待發佈→🚀 發佈(先重讀雲端最新防多 GM 互蓋·寫入 dynamicContent _index.heroVer/heroPacks + hero_N 英雄包·依 JSON 位元組分包≦700KB 防 1MB 上限·成功即呼 _dynContentSync(true) GM 本機立即生效)。',
      '★ v5.18.0【泛用參數化戰鬥引擎・hero_db.js】一套引擎同時服務玩家端(execSkill hook·setPending 選目標·doDmg 依 _activeSkLvMult 自動套技能等級不重複乘)與 AI 端(aiUseSkill 鏈尾分支·手動乘 1+skLv×0.05)與爆發(_runBurst 鏈首·1+burstLv×0.05)→ 鐵律 1.128 天生滿足;所有傷害一律走 doDmg → 世界 BOSS 5000 上限/鐵律 1.31 自動生效;即死/HP%傷害/固定傷害三類不存在於引擎能力(硬性安全排除)。',
      '★ v5.18.0【效果池(僅收通用消費路徑已驗證者)】不利 15:暈眩/冰凍/睡眠/麻痺/封印技能/失明/遲緩/燃燒/中毒/出血/禁療/減療/受傷增加/魅惑/狂亂(可強力版=_strong 旗標·對齊強力失明/猛毒/強力易傷既有引擎);有利 8:無敵/減傷一半/迴避/隱身/免疫不利狀態/控制免疫/嘲諷/攻擊強化;回合 1~5 或戰鬥結束(999)。',
      '★ v5.18.0【資料表全自動接線】_dynHeroApply 冪等註冊 HERO_DB/BURST_DB/HERO_TRAIT/_TRAIT_LV_INFO/HERO_IMGS(b64)/AVATARS/HERO_BIO/HERO_LORE/分類/主定位/HERO_SKILL_EFFECTS(編組 🔍 標籤自動推導·鐵律六④)/SKILL_UPGRADE_DEF(cat=dmg|heal 標準)/BURST_UPGRADE_DEF(五列自動生成)/SKILL_FORCE_ELEMENT/BURST_GIF_DB;雙版圖鑑文字依參數自動生成(鐵律 1.160 只寫 Lv1/1.232 兩版齊備·GM 可覆寫);升級口徑:技能與爆發傷害/治療每級 +5%·狀態機率固定不隨級(圖鑑不說謊)·天賦機率 +3%/天賦級。',
      '★ v5.18.0【天賦六模板】T1 開場自身強化/T2 開場全隊強化/T3 行動前機率回血/T4 行動前機率使隨機敵人異常/T5 受傷時機率回血/T6 受傷時反施異常;三 hook(startBattle/startTurn/doDmg 逆鱗同區)·守門 _traitSeal/禁錮/疑惑(對齊逆鱗慣例)·_isDynTrait 旗標防遞迴。',
      '★ v5.18.0【取得與保護鐵則】取得三檔:進召喚池(自動同步 ADMIN_ALL_HEROES/_PLAYER_HERO_NAMES·對齊 v3.15.43 防漏列)/僅 GM 送禮/指定學生 email 登入自動發(STUDENT_DESIGNER_HEROES);英雄發佈後永不刪除只能 ⏸停用(off 仍完整註冊資料表·已擁有玩家圖鑑/戰鬥照常·只下架取得途徑=玩家資產永不損壞);技能名防碰撞(動態 hook 在派發鏈之前·與全部靜態技能/爆發名比對·重名即擋防劫持);與既有英雄重名拒絕註冊;firestore.rules dynamicContent {docId} 已涵蓋 hero_N 免改;版號七點 v5.18.0·changelog 刪最舊 v4.99.0 維持恰 20 條。',
    ],
  },
  // v5.17.0 — 動態造型配件第二期:GM 遊戲內直接上傳配件(測試期 adminOnly)
  {
    ver: 'v5.17.0',
    date: '2026-08-06',
    adminOnly: true,
    brief: [
      '🎩 GM 後台新增「動態造型配件」:老師可以直接在遊戲裡上傳新的帽子、眼鏡、面具、嘴部飾品,全體玩家下次開機就會出現在造型工房,不用再改程式檔!',
      '🎲 每一款都能設定取得方式:直接開放、召喚水晶抽到(每抽 1% 機率)、或先暫時上鎖敬請期待!',
    ],
    items: [
      '★ v5.17.0【動態內容層第二期・動態造型配件】GM 後台新增「🎩 動態造型配件」(掛『📚 內容擴充』群組):上傳去背圖→自動壓縮(WebP 優先·不支援退 PNG·最長邊 512·目標≦120KB base64)→四體型即場試穿預覽→發佈至 Firestore dynamicContent(_index.avatarVer/avatarPacks/avatarNext + avatar_N 配件包·每包≦700KB);id=200+分類序號單調配發永不重用;發佈前重讀雲端最新防多 GM 互蓋;成功即呼 _dynContentSync(true) GM 本機立即生效。',
      '★ v5.17.0【永不刪只停用(老師裁定題1甲)】配件只能 ⏸停用/▶重新啟用,雲端清單永不移除;停用件在玩家端轉「佔位」(選單隱藏·穿戴中渲染為無不破圖),陣列索引永不位移 → 與選單寫入 id、_pick 按索引、解鎖帳本/GM上鎖/管理員預設『cat:id』四座標系維持 id==index 不變量(v4.89.0 卡背錯位事故的根治設計)。',
      '★ v5.17.0【avatar_db.js 主引擎】window._dynAvatarApply 冪等合併(截回靜態段→佔位補到 200→動態件放 index===id 槽位);_avAccLayer prop 路徑支援 item.b64 dataURI(天然免快取·AVATAR_DB_VERSION 維持凍結 v4.95.2);_avatarMaskUnlockOnSummon 池擴充:動態四分類 summon 鎖款與靜態面具同池(仍每抽 1%·index 召喚點零改動);VARF 加 mask 鍵=每款面具獨立管理員預設 + _avEffPos raw 鍵 fallback 相容舊值;summon 鎖款自動註冊雙版解鎖說明(鐵律 1.232)。',
      '★ v5.17.0【玩家端載入器・index.html】_dynContentSync 改雙軌:同一 _index 讀取內 quizVer/avatarVer 各自獨立比對(題庫沒更新也會檢查配件);開機套 lxps_dynAvatar_v1 快取;快取寫入容量滿時靜默降級(下次開機自雲端再拉)·任何失敗不影響遊戲。',
      '★ v5.17.0【定位流程】發佈後老師到造型工房用既有「位置/尺寸調整 → 📌設為預設」逐款調定位(gameConfig/avatarPartDefaults 全體套用);firestore.rules 免改(沿用 v5.16.0 dynamicContent 條款);版號七點 v5.17.0(mainstory 鍵維持 v5.12.0·CURRENT_BOOT_VER 凍結);changelog 刪最舊 v4.98.0 維持恰 20 條。',
    ],
  },
  // v5.16.0 — 動態題庫第一期:GM 遊戲內直接新增題目(測試期 adminOnly)+ mainstory.js 缺檔救援
  {
    ver: 'v5.16.0',
    date: '2026-08-06',
    adminOnly: true,
    brief: [
      '📚 GM 後台新增「動態題庫擴充」:老師可以直接在遊戲裡新增題目,全體玩家下次開機自動載入,不用再改程式檔!',
      '🛠 同時修好了主線劇情打不開的問題(缺了一個檔案,已經救回來)!',
    ],
    items: [
      '★ v5.16.0【動態內容層第一期・動態題庫】GM 後台新增「📚 動態題庫擴充」(新側欄群組『📚 內容擴充』):單題表單/批次 JSON 匯入/待發佈清單/一鍵發佈/已發佈題目搜尋與勾選刪除。題目寫入 Firestore dynamicContent(_index 版本指標 + quiz_N 題包·每包 1800 題防 1MB 上限),id 自 100001 單調配發永不與靜態題庫(最大 34694)相撞、永不重用。',
      '★ v5.16.0【玩家端載入器・index.html】開機先套 localStorage 快取(離線可用)→ 登入後只讀 _index 一份比對版本(900 台每次開機各 1 讀·版本相同即結束)→ 有更新才拉題包 → 冪等合併進 ADV_QUIZ_DB;冒險答題/鬥技場/知識王/小博士全是執行期翻表,自動生效零接線;任何失敗靜默不影響遊戲。',
      '★ v5.16.0【mainstory.js 缺檔救援】開場 SOP 發現 repo 無 mainstory.js(v5.12.0 拆檔後未上傳→LIVE 主線入口全站失效·有 typeof 守門不崩潰):自 git 歷史 0996239(v5.11.0 拆檔前 index)原段 L144205-148311 重建 4,111 行,內容一字不差,node --check 過;FILE_VERSIONS mainstory 鍵維持 v5.12.0 不動。',
      '★ v5.16.0【部署】需部署 firestore.rules(新增 dynamicContent 條款:讀=登入玩家·寫=isAdmin);上傳順序:firestore.rules 先部署 → game_changelog.js → mainstory.js → admin_panel.js → index.html 最後;admin 無真 optional chaining;index inline 22 塊 node 全過。',
    ],
  },
  // v5.15.0 — 主角圖鑑位置修正:重開遊戲不再跑位
  {
    ver: 'v5.15.0',
    date: '2026-08-05',
    brief: [
      '🧑‍🎨 修好了「重新打開遊戲後,英雄圖鑑裡的主角頭和身體位置跑掉」的問題!',
      '✅ 現在每次打開遊戲,圖鑑和主角頁面都會自動顯示你儲存好的正確造型,不用再進造型工房重新按儲存了!',
    ],
    items: [
      '★ v5.15.0【主角圖鑑頭身位置跑掉根治】老師回報:每次重開遊戲,英雄圖鑑網格卡與詳情頁的主角「頭部+身體」組合位置錯位;點進造型工房顯示正常,按確認儲存後才恢復,下次重開又壞。根因:啟動時的主角立繪產生常在 gameConfig/avatarPartDefaults(管理員部件預設位置表)從雲端拉回之前就完成,且立繪簽章只包含 cfg → 預設表稍後到貨也永遠不會重畫,錯位整場鎖死;造型工房是開啟當下即時渲染(此時表已到)所以正常。',
      '★ v5.15.0【修法三保險·全在 index.html】①立繪簽章納入預設表內容(表一變舊簽章自動失效可重畫)②新增預設表「到貨監看」:每 1.5 秒廉價比對預設表 JSON 字串共 60 次,偵測到內容變動即簽章歸零重畫一次,90 秒後停;內容沒變時零渲染成本,舊 iPad 無感 ③世代守門 _lxpsProtagPortraitGen:舊輪 base64 內嵌抓圖在途完成一律作廢不回寫,一併根治既有 hydrate 歸零重畫與舊輪互蓋的競態;_msHydrateFromCloud 對帳簽章改用同一組合格式。',
      '★ v5.15.0【範圍】只改 index.html;avatar_db.js 零更動不 bump AVATAR_DB_VERSION(900 台不重抓部件圖);admin_panel.js/game_changelog.js 僅版號同步;sw.js/mainstory.js/hero_db.js 全未動。',
      '★ v5.15.0【驗證】index inline 22 塊 node --check 全過;admin/changelog node --check 過;0 孤立代理字元;admin 無真 optional chaining;7 版號同步點對齊 v5.15.0;changelog 恰 20 條;CURRENT_BOOT_VER 未動。',
    ],
  },
  // v5.14.0 — 圖片瘦身全面接管:所有玩家自動換用小圖
  {
    ver: 'v5.14.0',
    date: '2026-08-04',
    brief: [
      '🧹 這次更新後,大家 iPad 裡原本存的大張圖片會自動換成新的小張圖片,幫 iPad 省下超多空間(最多可以省下 250MB)!',
      '⚡ 「完整下載」也變快超多:圖片部分從快 300MB 變成只要 43MB,裝遊戲快很多!',
      '✅ 畫面一樣漂亮,遊戲內容完全沒變,大家什麼都不用做,更新後自動完成!',
    ],
    items: [
      '★ v5.14.0【activate 一次性遷移】老師裁定「更新後的玩家全部自動用 JPG 取代舊 348 張 PNG(去背圖除外)」:SW activate 清除 ASSET_CACHE 內可JPG化的 .png 快取鍵(排除 icon-*/avatar_parts//_去背/body_·規則同 _lxpsPngSlimEligible 三處共用),已快取大 PNG 的玩家下次載到該圖時自動改抓小 JPG(舊機)或 WebP(新機);遷移後鍵已是新格式,之後每版 activate 再跑同規則清不到東西=冪等零成本。',
      '★ v5.14.0【precache 格式感知】完整下載/背景補抓改依機型抓對格式:webp 判定=fetch Accept 學習旗標優先、客端 canvas supportsWebp 提示次之(Safari canvas 不回 webp 也不怕,誤判為 jpg 仍全機型可解碼);偏好格式 404(透明圖)自動退回原 png;cache 鍵=實抓格式;已快取過濾查偏好/png/jpg 三鍵。舊 iPad 完整下載圖片 297MB 級→43MB 級。',
      '★ v5.14.0【三 key 查詢】cacheFirstAsset 查快取 want→png→jpg 三鍵,任何機型/任何時期存下的格式鍵都能命中,precache 絕不白做;jpg 全機型可解碼,絕不會存出解不開的圖。',
      '★ v5.14.0【範圍】sw.js v3.5.92→v3.5.93(_lxpsPngSlimEligible/_lxpsPickAssetUrlStr 抽共用+Accept 學習旗標+activate 遷移+precache 感知+三鍵);index.html 僅兩個 PRECACHE_URLS 發送點加 supportsWebp 欄位(舊 SW 收到多的欄位自動忽略·相容);admin/changelog 僅版號同步;圖包(348 JPG+13 WebP)與 v5.13.0 相同無新增。',
      '★ v5.14.0【驗證】sw.js node --check 過;index inline 22 塊全過;0 孤立代理字元;無真 optional chaining;7 版號同步點對齊 v5.14.0;changelog 恰 20 條;CURRENT_BOOT_VER 未動;mainstory.js(v5.12.0)/hero_db/avatar_db/world-boss 全未動。',
    ],
  },
  // v5.13.0 — 遊戲圖片瘦身:舊 iPad 下載量大減·畫面不變
  {
    ver: 'v5.13.0',
    date: '2026-08-04',
    brief: [
      '🖼 遊戲圖片大瘦身!圖片下載量從將近 300MB 變成只要 43MB,進入遊戲、完整下載都變快超多,也更省流量!',
      '✅ 畫面看起來一模一樣漂亮,遊戲內容完全沒有改變,放心玩!',
    ],
    items: [
      '★ v5.13.0【圖片瘦身甲案·檔名不動 SW 分流】全 repo 根目錄 390 張 PNG 逐張盤點+alpha 掃描:不透明 348 張(排除 icon-* 8 張)全數產出同名 .jpg(q88·297MB→43MB 省 85.5%)並補產 13 張缺漏 .webp;34 張真透明(寵物 _去背 30 張/標題字/素體預覽/body_×4)與 avatar_parts/ 321 張依老師裁定保持 PNG。掃描發現大量動態組檔名(寵物 名+_去背.png/日本英雄 n+.png/世界BOSS背景/hero_db petImg 完整 URL)→ 裁定不改檔名,規避漏改破圖風險。',
      '★ v5.13.0【sw.js v3.5.92 舊機 JPG 分流】_lxpsPickAssetUrl 單點擴充:支援 webp 的新機維持 png→webp 完全不變;不支援 webp 的舊 iPad png 請求改試同名 .jpg,jpg 不存在(透明圖)由 cacheFirstAsset 既有機制 404 自動退回 png(v3.5.88/89 雙 key 快取+CORS 驗證全沿用零改動);排除 icon-*、avatar_parts/、_去背、body_ 免首抓無謂 404。遊戲程式碼零改動·AVATAR_DB_VERSION 不動。',
      '★ v5.13.0【上傳順序鐵則】jpg/webp 圖包必須先全部上傳,sw.js(v3.5.92)最後上;順序顛倒會讓舊機把 png 回應快取進 jpg key(cache-first),之後吃不到新 jpg。',
      '★ v5.13.0【驗證】sw.js node --check 過;index inline 22 塊全過;0 孤立代理字元;無真 optional chaining;7 版號同步點對齊 v5.13.0;changelog 恰 20 條;CURRENT_BOOT_VER 未動;mainstory.js(v5.12.0)/hero_db/avatar_db/world-boss 系列全未動。',
    ],
  },
  // v5.12.0 — 遊戲瘦身:主線劇情搬進獨立檔案·更新下載更快
  {
    ver: 'v5.12.0',
    date: '2026-08-04',
    brief: [
      '🚀 遊戲更新變快了!我們把主線劇情搬進獨立的檔案,以後遊戲更新時要下載的東西變少,打開遊戲會更快、更省流量!',
      '✅ 遊戲內容完全沒有改變:主線劇情、戰鬥、獎勵通通跟原本一模一樣,放心玩!',
    ],
    items: [
      '★ v5.12.0【額度瘦身丙案第一刀】主線劇情引擎+MAINSTORY_DB(index.html L144205-148311·4,107 行/約 228KB)整段拆出成 mainstory.js;index.html 原位改 document.write(_lxpsFileSrc) 載入,傳統 script 共享全域 scope,執行順序維持原點(_advSystemReady 之後同步載入),零行為變更。',
      '★ v5.12.0【連動】_LXPS_FILE_VERSIONS 新增 mainstory.js 載入鍵(?v= 破快取);sw.js SHELL_URLS 新增 ./mainstory.js + SW_VERSION v3.5.90→v3.5.91(隨核心檔快取·離線可用);check_inline 基準 21→22(新增 document.write 小包裝塊)。',
      '★ v5.12.0【驗證】mainstory.js node --check 過;index inline 22 塊全過;0 孤立代理字元;無真 optional chaining;7 版號同步點對齊 v5.12.0;changelog 恰 20 條;CURRENT_BOOT_VER 未動;hero_db/avatar_db/world-boss 系列全未動。',
    ],
  },
  // v5.11.0 — 世界龍王連線更穩定:伺服器忙碌自動保護+中文友善提示
  {
    ver: 'v5.11.0',
    date: '2026-08-03',
    brief: [
      '🐉 打龍王的時候如果看到「選角失敗」,不用擔心!那是伺服器一時太忙,現在會用中文清楚告訴你:休息一分鐘再試就可以了,你的東西都不會不見!',
      '🛡 遊戲學會自動偵測伺服器忙碌了!偵測到之後會先暫停背景連線一分鐘讓伺服器喘口氣,大家更快恢復正常,不會一直失敗。',
      '⚡ 龍王房間的背景連線也變得更省流量、更穩定,平常打龍王完全沒有影響,資料也都安全!',
      '🌟 主角修正:繼承別人的技能之後,按「升級技能」時跳出的視窗,現在會正確顯示「繼承來的那一招」的升級效果了!之前會顯示主角原本招式的效果,讓人看不懂,現在完全對得上囉!',
    ],
    items: [
      '★ v5.11.0【根因】玩家回報打龍王一直「選角失敗」。追查為 Firebase 免費方案每日流量配額耗盡(resource-exhausted)導致龍王房間所有讀寫失敗;且房間心跳(每10秒)與離線監測(每5秒)在失敗時反覆重試,形成玩家 console 可見的每秒約 3 次請求風暴,玩家畫面更直接顯示英文錯誤碼。',
      '★ v5.11.0【熔斷機制】偵測到流量配額耗盡時,自動暫停房間心跳與離線監測 60 秒,停止重試風暴;期間玩家操作(開房、加入房間、選角、切換準備)失敗會顯示中文友善提示(簡單風與精緻風雙版本·鐵律1.232),請玩家稍候一分鐘再試,並說明資料不會遺失。',
      '★ v5.11.0【常態降載】心跳間隔 10 秒改 20 秒、房主離線監測 5 秒改 15 秒、離線判定門檻 20 秒放寬到 45 秒(心跳變慢後仍保有 25 秒緩衝,離線偵測體驗不變),龍王房間常態雲端讀寫量下降約六成,讓每日免費配額撐得更久。',
      '★ v5.11.0【範圍】全部改動在 index.html 世界BOSS連線層;world-boss.js 與 world-boss-ui.html 未動,戰鬥機制、每擊 5000 傷害上限、排行榜零改動。',
      '★ v5.11.0【主角技能繼承升級效果修正】老師回報:主角繼承技能後,技能升級視窗顯示的升級效果文字仍是主角原本招式(與圖鑑詳情顯示的繼承技對不上)。追查:圖鑑詳情頁 v5.8.0 已改顯示繼承技,但三處升級介面仍直接讀主角原始招式——技能升級確認視窗與升級效果一覽表、背包技能升級書的技能選擇視窗、圖鑑一覽表的技能可升級標籤。修正:三處全部改用繼承後的招式來顯示與查升級表(來源英雄條件不再達標時自動退回主角原本招式);威力口徑不變:等級仍記在主角自己身上,戰鬥中實際威力經檢驗確認本來就正確吃主角自己的技能等級,本次為顯示層修正。',
    ],
  },
  // v5.10.0 — 動物面具 25 款上線(召喚水晶 1% 機率獲得·不重複)
  {
    ver: 'v5.10.0',
    date: '2026-08-03',
    brief: [
      '🎭 造型工房新增 25 款超可愛「動物面具」!老虎、兔子、青龍、柴犬、哈士奇、熊貓、狐狸面具通通有,快來收集!',
      '💎 怎麼拿?用召喚水晶召喚時,每一抽都有 1% 機率隨機獲得一款你還沒有的面具,而且不會重複,抽到就是新的!',
      '🧢 拿到之後,到造型工房的「頭戴」分頁就能戴上;面具位置和大小都可以自己微調,還能跟帽子一起戴喔!',
    ],
    items: [
      '★ v5.10.0【動物面具】造型工房頭戴分頁新增「動物面具」分類 25 款:天竺鼠、乳牛、老虎、兔子、青龍、眼鏡蛇、小馬、綿羊、猴子、麻雀、小豬、柴犬、哈士奇、貴賓狗、黃金獵犬、瑪爾濟斯、虎斑貓、黑貓、白貓、三花貓、獅子、黑熊、熊貓、大象、狐狸面具。',
      '★ v5.10.0【獲得方式】召喚水晶每抽獨立 1% 機率,從尚未擁有的面具中隨機送一款(十連算十次機會);已擁有的不會重複抽到,25 款集滿後不再觸發。抽中會跳出金色提示,不占用原本的召喚結果。',
      '★ v5.10.0【穿戴體驗】面具會自動對齊臉部,四種體型通用;可以在造型工房微調位置與大小;戴面具時會蓋住眼鏡,帽子仍可以疊在面具上面。還沒拿到的面具可以先點選試戴預覽,儲存時會自動脫下。',
      '★ v5.10.0【技術】面具解鎖記在造型卡解鎖帳本隨雲端同步,換裝置不消失;素材為全新檔名首次載入,不影響既有部件圖快取,老舊平板零重抓負擔。',
    ],
  },
];
