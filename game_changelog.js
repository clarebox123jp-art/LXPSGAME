// ════════════════════════════════════════════════════════════════════════
//  game_changelog.js  —  LXPSGAME 更新日誌
//  最後更新:2026-07-22  / 目前主程式版本:v4.79.0(主線加入夥伴角色解鎖大卡+管理員造型預設/上鎖雲端同步修正+我的主角入口移至英雄圖鑑·管理員測試)
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
  // v4.79.0 — 主線加入夥伴角色解鎖大卡 + 管理員造型預設/上鎖雲端同步修正 + 我的主角入口搬家
  {
    ver: 'v4.79.0',
    date: '2026-07-22',
    adminOnly: true,
    brief: [
      '📖【主線劇情・新夥伴登場大卡(測試中)】劇情裡有新夥伴加入隊伍時,除了原本浮現名字的演出,接著會跳出一張大大的角色卡:完整立繪、角色名字、兩個技能(含要花多少能量)和極限爆發的說明,規格跟召喚抽到新角色時看到的那張一模一樣。一次只看一位,按「▶ 下一位」換下一個,上方會顯示「第幾位 ／ 共幾位」,看完最後一位按「太棒了!」就繼續播劇情。序章一次登場四位、第一章兩位、第二章兩位、第三章兩位、第四章三位,現在都看得到他們長什麼樣子、會什麼招。卡片上的名字用劇情裡的稱呼(例如動物學家‧小真老師),但圖片與技能還是取自英雄圖鑑本人,不會對不上。',
      '👤【管理員造型預設與上鎖・真正套用到全體玩家】修好一個藏得很深的問題:老師在造型工房把每個部件的位置與大小調好、按「📌設為預設」之後,那份預設其實只有在「打開造型工房」的當下才會從雲端抓下來,而且重新整理網頁就忘記了。結果學生在「冒險者名片」、「好友名片牆」以及主線劇情展示名片的地方,看到的都是沒有套上老師預設的版本,位置會跑掉。現在改成三點:①登入完成就先把老師設好的預設與上鎖名單抓下來,不必等學生點開造型工房;②抓下來的內容會存在平板本機,重新整理網頁、甚至暫時沒網路也還在;③打開造型工房那一瞬間,不會再閃過一下「本來應該被鎖住的款式」。老師改完預設或鎖定後,學生下次登入(或重新打開造型工房)就會套用。',
      '🗂【「👤 我的主角」入口搬家】原本放在冒險選關頁一長串按鈕的中間,現在移到「⚔️ 英雄圖鑑」畫面最上方、標題的左邊,和「← 返回」在同一排,一進圖鑑就看得到,不用再往下捲。功能完全一樣,一樣是管理員測試期間才看得見。',
    ],
    items: [
      '★ v4.79.0【主線加入夥伴角色解鎖大卡・乙案·index.html】①新增 _msJoinCardHtml(nm):單位夥伴大卡 HTML,規格對齊 _showSummonRareHeroPreview(立繪 min(70vw,300px) 1:1 金框 + 名稱 + s1/s2(技能名/能量🔷/說明) + 💥極限爆發);圖片走 HERO_IMGS[原名]·技能走 HERO_DB[原名]·爆發走 BURST_DB[原名],顯示名走 _msStoryName(劇情專屬姓名)→ 底層 key 完全不動;img onerror 退回 AVATARS emoji 不留破圖;新增 _msEscTx 對 名稱/技能名/說明 做 <>& 逸出(13 位夥伴實測資料無 HTML,純防未來學生設計英雄) ②新增 _msActJoinReveal(names,onDone):分頁 overlay(z-index 9975·淡入淡出),一次一位,底部按鈕「▶ 下一位」/最後一位「太棒了!」,list.length>1 才顯示「n ／ 共」頁碼;切換播 sfx-summon-reveal、結束播 sfx-confirm;onclick 走 window._msJoinRevealNext(全域可達·逐位順序播放不互相覆蓋);3 分鐘 watchdog 兜底防卡死 ③_msActJoin 尾端由「文字浮現完直接 onDone」改為「浮現完 → _msActJoinReveal(names,onDone)」,catch 分支也先試大卡再退回 onDone;舊行為保留為註解(誤刪是大忌) ④★乙案:_showSummonRareHeroPreview(抽卡結果預覽)完全未改動,零回歸風險;代價是日後改卡片規格需兩處同步 ⑤已逐名核對 13 位夥伴(小劇團員/直笛團員/弦樂團員/動物學家/籃球隊員/田徑隊員/程式設計師/電腦繪圖師/劍士/祭司/守衛/刺客/火法師)HERO_IMGS+HERO_DB(s1/s2)+BURST_DB 全數齊備。',
      '★ v4.79.0【管理員造型預設/上鎖雲端同步三項修正・avatar_db.js】根因:gameConfig/avatarLocks 與 gameConfig/avatarPartDefaults 兩張表只在 _avatarPanelOpen 內 getDoc 拉一次(唯一呼叫點),且為純記憶體全域變數不落地 → ①玩家沒開過造型工房 → _avatarPartDefaults 為空 → _avEffPos 退回 [0,0,0] → _avatarOpenCard(📇名片)/好友面板名片縮圖網格(v4.63.0)/主線 set_card 演出全吃不到管理員預設,位置尺寸跑掉 ②重整即歸零 ③開工房先渲染一次舊表,0.3~1 秒空窗期鎖款露出可點 ④離線/讀取失敗 fail-open。修正:①新增 _avatarCacheTables/_avatarLoadTablesFromLS(localStorage 鍵 lxps_avatarGmLocks / lxps_avatarPartDefaults),兩 loader 拉回後與兩個 GM 寫入點(_avatarGmToggleLock/_avatarSetPartDefault)皆同步落地 ②檔尾 _avatarLoadLocal() 之後先 _avatarLoadTablesFromLS() 用快取墊底 ③新增 _avatarBootSyncTables()+1.5s×20 輪詢等 _fbDb/_fbFns 就緒(登入完成)即 Promise.all 拉一次兩表後停,拉回若 _avatar-panel 開著則 _avRefreshPreview+_avRenderOpts 重繪。firestore.rules 已涵蓋(gameConfig:登入者可讀·isAdmin 可寫)不需改。成本:每位玩家每次登入多 2 次 gameConfig 讀取(一次性非輪詢)。仍為 getDoc 非 onSnapshot → 學生正開著工房時老師改設定,需關掉重開才生效。',
      '★ v4.79.0【👤 我的主角入口移至英雄圖鑑標題列・index.html】①冒險選關頁原 class=adv-event-btn 兩行大按鈕停用,整段舊 HTML 完整保留為註解(誤刪是大忌·日後要搬回可直接還原) ②hero-page-overlay 標題列 inner flex 內、「⚔️ 英雄圖鑑」標題之前插入緊湊版單行按鈕,id 沿用 adv-avatar-btn → avatar_db.js _avatarRefreshEntryVisibility 的管理員 gating 與 30 秒輪詢完全不用改(新位置同為靜態 DOM 常駐,overlay 隱藏時元素仍在),_AVATAR_ADMIN_ONLY 仍是正式開放的單一開關 ③_SIMPLE_TEXT_MAP[adv-avatar-btn] 由兩行含 <br> 副標的 cute 版改為單行「👤 打扮自己」(原值保留註解),避免簡單風把標題列撐爆 ④按鈕 display:none 靜態,_avatarRefreshEntryVisibility 設 style.display=空字串後回到 button 預設顯示,不依賴 flex。',
      '★ v4.79.0【版號】9 同步點全對齊 v4.79.0(index.html _GAME_LOADED_VERSION + _LXPS_FILE_VERSIONS 四鍵 index/avatar_db/admin_panel/game_changelog、AVATAR_DB_VERSION、ADMIN_PANEL_VERSION、changelog 檔頭 + 置頂 ver);hero_db.js 本輪未動維持 v4.54.0;CURRENT_BOOT_VER 永久凍結未動;admin_panel.js 僅版號同步·無真 ?.。AVATAR_DB_VERSION 隨版 bump → avatar_parts 部件圖一次性帶新 ?v= 重抓(小流量峰值·屬預期)。',
    ],
  },
  // v4.78.0 — 主線劇情:動作音效缺檔回退近義音 + 教學引導戰鬥六場全接線·管理員測試
  {
    ver: 'v4.78.0',
    date: '2026-07-22',
    adminOnly: true,
    brief: [
      '📖【主線劇情・音效補齊 + 教學戰鬥(測試中·未開放)】兩項升級:①還沒錄好的劇情音效,先自動借用遊戲裡意思最接近的技能音效頂上(例如登場借召喚角色、護盾借守護、恢復借治癒魔法),劇情不再有一段一段的靜默;等正式音效上傳後會自動改用正式的,不必再改程式。②六場劇情戰鬥全部做好了——第一章第一戰會用卡片一步一步帶你認識戰鬥操作(可以上一步、下一步、也可以跳過),接著播出戰鬥與勝利演出,其餘五場則直接播戰鬥與勝利,劇情從頭到尾走得完。③每一張教學卡片下面,主角都會忍不住吐槽一句(像是「有 AI 幫我打,那我站在這裡幹嘛」),把教學裡難免會提到的遊戲介面名詞,變成主角的個性。④八位夥伴在劇情裡有名字了:動物學家‧小真老師、小劇團員‧善行、弦樂團員‧真音、籃球隊員‧力強、田徑隊員‧阿動、電腦繪圖師‧活靈、程式設計師‧知理、直笛團員‧誠欣(只在劇情對白中出現,英雄圖鑑、召喚、戰鬥、編組一律維持原本名稱),對白上方的名字也略微縮小,長名字不會擠到台詞。⑤「👤 我的主角」造型工房選單最下面新增「✏️ 暱稱」,不用退出去就能直接改暱稱(和原本的設定暱稱是同一個)。⑥資料安全加強:主線劇情進度與主角造型都再確認過綁定各自帳號,共用平板換人登入時不會把上一位的劇情進度或造型帶到下一位身上。⑦女童(幼女)套裝終於補齊!整套裝扮頁現在有:學生制服、日式和服、俏麗雙劍士、水藍魔法師、粉紅長洋裝 五款(原本只有兩款)。雙劍士改用完好的圖,手套、武器、肩膀、裙擺不會再缺角;水藍魔法師也換成重新切好的版本,衣服白色部分完整。少年、少女、男童的套裝完全不受影響。',
    ],
    items: [
      '★ v4.78.0【動作音效缺檔回退·index.html】新增 _MS_SFX_FALLBACK(16 個主線 sfx key → 既有 <audio> 元素 id)+ _msFbUrl();_msPlaySfx / _msPlayHeldSfx 改為「先抓短檔名 {key}.m4a?v=版本,onerror 或 play() 失敗才用近義音效頂替」,成功播放則鎖住不回退。對照:appear→sfx-summon-reveal、card→sfx-deal、whistle→sfx-battle-start、charm→sfx-youyou-burst、shield→sfx-guard、fire→sfx-explode、stink→sfx-powerdown、treasure→sfx-medal-unlock、darkrise→sfx-wb-boss-skill、restore→sfx-heal;已到齊的 6 個(footstep/crack/fall/keyboard/sword/pray)也各配一組保險回退。',
      '★ v4.78.0【教學引導戰鬥(甲案)·index.html】新增 _MS_BATTLE_DEFS(六場敵人名/圖示/導語·雙版文案 鐵律1.232)與四幕演出:_msBattleIntro(敵人現身)→ _msBattleTutorial(復用既有 TUTORIAL_STEPS 11 步文案·premium 取 desc / cute 取 descSimple·上一步/下一步/跳過)→ _msBattleSim(敵人血條四段遞減+普攻與暴擊音)→ _msBattleWin(勝利卡·點畫面或 2.6 秒續播)。',
      '★ v4.78.0【分派器接線·index.html】_msRunAct 新增 battle_ch1_1 / ch1_2 / ch3_boss / ch4_boss / ch5_boss / ch6_boss 六個 case → _msActBattle(act, done),不再 fall-through 到 default;default 改為未知 act 直接續播。battle_ch1_1 帶完整教學引導,其餘五場只播戰鬥與勝利。',
      '★ v4.78.0【主角吐槽條·index.html】新增 _msQuipBar(premium,cute)(💭+_msWho(__hero) 暱稱+淡藍吐槽框)與 _MS_TUT_QUIPS(11 步吐槽·以標題關鍵字配對而非索引,TUTORIAL_STEPS 日後增刪不會錯位·查無走通用兜底句);教學引導戰鬥每一步、以及既有三張教學卡(tutorial_king/levelup/shop)皆插入吐槽條(插在按鈕之前)。語氣沿用主線 DB 主角既有的「（心想）…」自嘲風格,雙版文案(鐵律1.232)。',
      '★ v4.78.0【劇情專屬姓名·index.html】新增 _MS_STORY_NAME 對照表(八位夥伴)+ _msStoryName(n) helper;_msWho 尾端與 _msActJoin 加入隊伍演出各套一次,DB 的 who 值/HERO_DB key/圖鑑/召喚/戰鬥/編組完全不動(純顯示層對照,查無對照回原名無害)。另 DB 內兩句動物學家自我介紹台詞(premium+cute)同步改寫為「我是動物學家‧小真老師」。',
      '★ v4.78.0【對白名字縮小·index.html】showLine 說話者名字 font-size 38→30px、letter-spacing 3→2px、margin-bottom 16→14px(劇情專屬姓名最長 7 字·避免擠壓對白區)。',
      '★ v4.78.0【造型工房新增暱稱項·avatar_db.js】_AV_TABS 於 heldTab 之後新增第 11 項 { k:nickAct, act:nick }(act 型不切頁);_avRenderTabs 補藍色系樣式+✏️ 圖示;_avatarSwitchTab 補 nick 分支 → 呼叫 index.html 既有 window.openNicknameModal()(z29999 蓋在造型工房 z19999 之上·儲存走既有 _saveNickname 路徑=localStorage lxps_nickname_{uid} + 雲端·與名片暱稱同一份真相);函式未載入時走 bannerFX 雙版提示。',
      '★ v4.78.0【UID 綁定稽核(任務3)·index.html】稽核結果:主線進度雲端 players/{uid}.mainStoryProgress ✅、本機 lxps_mainstory_{uid} ✅(三個寫入點皆 if(uid) 守門)、avatarCard 雲端 players/{uid} ✅、本機 lxps_avatarCard_{uid} ✅ — 儲存層全部已綁 uid。★但查出真實漏洞:_clearAccountLocalData 換帳號清單漏列 window._mainStoryProgress / _avatarLocalCard / _protagAwakened / _avatarNickname 四個記憶體物件 → 共用 iPad 換帳號未整頁 reload 時,前一位的章節 done 會被 _msHydrateProgress 的 union(只增不減)併進下一位並寫上雲端(與 v4.6.0 寵物同型病灶)。修法:四者一併加入換帳號記憶體清除(只清記憶體不動雲端·誤刪是大忌)+ _msHydrateProgress 加 UID 守門第二道防線(window._mainStoryProgressUid 與當前 uid 不符→先清空再 union)。',
      '★ v4.78.0【女童(kidgirl)套裝修正·avatar_db.js + 素材】老師回報「衣服白色區域被過度去背」。repo 逐檔實測(新切法 kidgirl_{13款式}_{head/body}.png 全試·舊命名 headfull_/bodyfull_{款式}_kidgirl.png 全試·full_ 前綴·制服/洋裝各種別名)結論分三種病因:❶水藍魔法師=新切件 kidgirl_watermage_head/body.png 早已在 repo 且實測 0 內部破洞,但 P.outfit id13 仍掛舊件 bodyfull_aquamage_kidgirl.png(內部 3021px 白色破洞)→ 改掛新件(hhRef 沿用舊值·新件髮區實測中段 [68,66,67] 與現行 [68,66,66] 幾近相同=同一張原圖)。❷日式和服=headfull_/bodyfull_kimono_kidgirl.png 一直都在 repo,但 P.outfit id2 女童欄位是 null 從未接線 → 補上(hhRef [[56,53,50],[101,98,95]] 由該圖髮區實測取樣·已排除膚色與和服紅·並用雙劍士女童現行值反推比例校正)。❸雙劍士=程式已掛對、檔案也在,但 bodyfull_dualblade_kidgirl.png 內部有 3863px 白色破洞(headfull 另 10px)→ 產出修補檔請老師同名覆蓋上傳。舊件 aquamage_kidgirl 保留在 repo 與 P.headfull/P.bodyfull 定義中(誤刪是大忌)。',
      '★ v4.78.0【素材修補手法·雙劍士女童】非重新去背:原檔 RGB 完整保留、僅 alpha 被挖空,故只把「被角色輪廓完全包圍的透明像素」(scipy.ndimage.label 標記背景連通元件·從四邊界反推 outside·剩餘即內部破洞)alpha 補回 255,顏色一個都沒動。修補 3863px 實測 RGB 平均 (232,220,225)、81.5% 為純白系(RGB 皆>200)、最暗 (167,155,159)=白布陰影 → 確認就是被誤挖的白色衣服。修補後內部破洞 0。手臂與身體間的合法鏤空因連通到外部不受影響。',
      '★ v4.78.0【仍缺素材】女童「學生制服」與「小洋裝」逐檔實測確認不在 repo(全 404),P.outfit id1/id6 女童欄位維持 null。待老師上傳 kidgirl_uniform_head/body.png 與 kidgirl_dress_head/body.png 後即可接線。',
      '★ v4.78.0【女童套裝補齊(老師乙案)·avatar_db.js】★根因更正:前一輪誤判「制服/洋裝女童件不在 repo」,實際是漏探 top_*_kidgirl.png 這個 P.top 命名慣例;老師上傳的 7 張與 repo 現行檔逐像素比對總差=0 → 素材一直都在,問題全在程式碼引用。★另一關鍵:雙劍士老師的關鍵字是 dualsword,程式碼掛的是 dualblade(不同檔·且該舊件有 3863px 白色破洞+邊緣被削)→ 改掛 top_dualsword_kidgirl.png。P.outfit 女童欄位接線結果:id1 學生制服=top_uniform_kidgirl.png(整張式)、id2 日式和服=headfull_/bodyfull_kimono_kidgirl.png(頭+身分離件·可換髮型)、id7 俏麗雙劍士=top_dualsword_kidgirl.png(整張式)、id13 水藍魔法師=kidgirl_watermage_head/body.png(頭+身分離件·可換髮型)、新增 id14 粉紅長洋裝=top_dress_kidgirl.png(整張式)。★_pick 是依陣列索引取件,故新款一律追加陣列最後(id 必須等於索引)。',
      '★ v4.78.0【整張式套裝機制(whole)·avatar_db.js】P.outfit 原設計為「頭件+身件」分離,但女童的制服/洋裝/雙劍士只有含頭的整張全身圖(老師既有素材·不再裁切)。新增逐體型陣列欄位 whole 與 helper _ofIsWhole(d,bodyIdx):head 留 null、body 放整張圖、whole 對應體型標 1 → ❶渲染 hideHead 補 _ofWhole(素體頭隱藏·防整張圖的頭與素體頭重疊)❷髮型頁提示條與換髮型守門比照 lockHair 擋下(頭髮畫在圖裡)。★whole 是逐體型的,同款式其他體型若有正規分離件仍走原本頭+身流程,少年/少女/男童完全不受影響。',
      '★ v4.78.0【素材零改動】本輪未裁切、未修圖、未產生任何新素材;前一輪產出的 bodyfull_/headfull_dualblade_kidgirl.png 修補檔作廢不上傳(改用老師既有的 top_dualsword_kidgirl.png)。舊 dualblade / aquamage 件保留在 repo 與 P.full/P.headfull/P.bodyfull 定義中(誤刪是大忌)。',
      '★ v4.78.0【零副作用保證】教學引導戰鬥為純演出:不建立/不改動 G 戰場物件、不呼叫 startTurn 或 _closeTutorial、不寫 _tutorialDone/_tutorialMiniDone、不動存檔與獎勵,因此真實戰鬥的教學提示與流程完全不受影響;演出掛 15 分鐘 watchdog 兜底防卡死。真實可操作的主線戰鬥仍列 Phase 2(待主角戰鬥英雄)。',
      '★ v4.78.0【範圍與驗證】全在 index.html;avatar_db.js/admin_panel.js/game_changelog.js 版號同步;hero_db.js 維持 v4.54.0、sw.js/world-boss.js 未動。9 版號同步點對齊 v4.78.0;index.html 21 inline 塊 node --check 全過·0 孤立代理字元;admin 零真?.。',
    ],
  },
  // v4.77.0 — 主線劇情:動作音效對接 + 打字機修正 + 序章森林腳步聲5秒·管理員測試
  {
    ver: 'v4.77.0',
    date: '2026-07-22',
    adminOnly: true,
    brief: [
      '📖【主線劇情・體驗優化(測試中·未開放)】三項打磨:①對白動作音效正式接上(踏步、破裂、翻頁、寶劍出鞘、祈禱等已上傳的音效會在對應台詞響起);②打字途中手滑點到「上一句」,會先把整句補完、要再點一次才真的回看,避免訊息一閃而過看不到;③踏進序章森林那一刻的腳步聲會持續約5秒後自動淡出停止,不會一直踩個不停。',
    ],
    items: [
      '★ v4.77.0【動作音效對接·index.html】對白 sfx key→_msPlaySfx→抓短檔名 {key}.m4a?v=版本;已上傳6音效(footstep/crack/fall/keyboard/sword/pray)bump版號破SW/CDN快取後即響;其餘10個缺檔 graceful 靜默待老師上傳。',
      '★ v4.77.0【打字機修正·index.html】pb.onclick(上一句)對稱補上「打字中→clearInterval+顯示整句+return」守門,與 _msAdvance/下一句一致;打字未完不會直接跳段回看。',
      '★ v4.77.0【森林腳步聲5秒·index.html】新增 held-sfx 機制(_msPlayHeldSfx/_msStopHeldSfx·loop 播放+ms 後淡出);序章森林 footstep 行掛 sfxHold:5000;showLine 進下一句/離場皆自動停止持續音。',
      '★ v4.77.0【範圍與驗證】全在 index.html;avatar_db.js/admin_panel.js/game_changelog.js 版號同步;hero_db.js/sw.js 維持不動。',
    ],
  },
  // v4.76.0 — 主角 A2:三覺醒技(三分投射/變臉戲法/凡人的臨摹大師)+覺醒閘門·管理員測試
  {
    ver: 'v4.76.0',
    date: '2026-07-21',
    adminOnly: true,
    brief: [
      '👤【我的主角・覺醒技能(測試中·未開放)】主角覺醒後學會兩招 + 一招大絕:三分投射(打一個敵人·有機會暴擊還能拿能量)、變臉戲法(先給自己一個好狀態再攻擊)、大絕「凡人的臨摹大師」(打全部敵人 + 把隊友的好狀態學來分給整隊)。未覺醒前一律不能使用;主角仍不會出現在學生的召喚/圖鑑,正式開放請等公告。',
    ],
    items: [
      '★ v4.76.0【主角三覺醒技·index.html·管理員限定】覆寫 HERO_DB[主角] s1三分投射(c3·特技250%單體+50%暴擊×1.5+暴擊回2能量·沿用籃球隊員既有 execSkill 通用實作)、s2變臉戲法(c4·隨機獲得1有利狀態+特技+攻擊+速度傷害·沿用既有通用實作);注入 BURST_DB[主角]「凡人的臨摹大師」。三招皆走 doDmg 受世界BOSS 5000cap(鐵律1.31);升級沿用既有 _activeSkLvMult(每級+5%) + SKILL_UPGRADE_DEF 技能名共用(三分投射/變臉戲法皆已在表)。d/fd/sd 雙版(鐵律1.232·fd 只寫 Lv1 鐵律1.160)。',
      '★ v4.76.0【爆發 凡人的臨摹大師·_runBurst name===主角 分支(甲)】敵全體特技200%×_burstMult 分攤(必中·無視有利·isAoe)+ 臨摹複製我方1名夥伴身上1個有利狀態給全隊1回合(查無則從基礎有利清單挑1·臨摹兜底);BURST_UPGRADE_DEF[主角]200→280%(每升+10%乘算);BURST_GIF 本輪未注入→查無走預設視覺(下輪於 hero_db.js 補一筆專屬 GIF)。',
      '★ v4.76.0【覺醒閘門(乙)】skillCost 頂部:主角未覺醒時 s1/s2 回99(能量永遠不足=不可施放)、覺醒後正常 c3/c4;execSkill 頂部雙保險守門(未覺醒 return 不執行);_canBurst 未覺醒→false(不可爆發)。三處皆 _isProtagHero 把關·不影響同名的籃球隊員/變臉戲法原主人。aiUseSkill 三分投射/變臉戲法既有通用分支自動涵蓋(鐵律1.128)。',
      '★ v4.76.0【範圍與驗證】全在 index.html;avatar_db.js/admin_panel.js/game_changelog.js 版號同步;hero_db.js 維持 v4.54.0。9 版號同步點對齊 v4.76.0;index.html 21 inline 塊 node --check 全過·0 孤立代理字元;admin 零真?.。剩餘 A2:任務1立繪(需老師實機驗渲染路徑)、任務4重置回Lv1(呼 _lxpsSetProtagAwakened(false))。',
    ],
  },
  // v4.75.0 — 主角 A2:覺醒持久化 + 第六章覺醒 act + 圖鑑暱稱顯示·管理員測試(補記)
  {
    ver: 'v4.75.0',
    date: '2026-07-21',
    adminOnly: true,
    brief: [
      '👤【我的主角・覺醒與名字(測試中·未開放)】主角打完第六章覺醒場景後會「覺醒」(稀有度 R→SSR)並永久記住;英雄圖鑑主角卡會顯示玩家取的暱稱(沒設就顯示「主角」)。主角仍不會出現在學生的召喚/圖鑑,正式開放請等公告。',
    ],
    items: [
      '★ v4.75.0【覺醒持久化·avatar_db.js】avatarCard 新增 protagAwakened 欄位(隨 cfg 上雲 merge:true·免改 rules);_avatarLoadLocal/雲端命中設 window._protagAwakened;新增 window._lxpsSetProtagAwakened(v)(設記憶體旗標 + avatarCard 欄位 + 存本機/雲端·v 預設 true,傳 false 供重置)。讀取端 _getHeroRarity 主角→覺醒?SSR:R。',
      '★ v4.75.0【第六章覺醒 act·index.html】_msRunAct 分派器新增 case awaken_hero → 呼 _lxpsSetProtagAwakened(true)(fire-and-forget·退路設 _protagAwakened=true)→ done() 續播;第六章覺醒場景(v4.68.0/67.0 已建)播完 act 觸發覺醒。',
      '★ v4.75.0【圖鑑暱稱顯示·index.html】圖鑑卡名 + 詳情頁英雄名標題套 _heroDisplayName(主角→玩家暱稱 fallback「主角」·非主角一律回原名無害);只接顯示點·不改 HERO_DB key/狀態/統計(onclick/data-heroname 仍用原 name)。戰鬥卡/編組頁暱稱留待任務1立繪一起做。',
    ],
  },
  // v4.74.0 — avatar 部件預設「每個變體獨立」修復 + 主角資料地基(A1·休眠·管理員測試)
  {
    ver: 'v4.74.0',
    date: '2026-07-21',
    adminOnly: true,
    brief: [
      '🎨【造型工房・設為預設 大修(老師測試中)】管理員把不同髮型/套裝/飾品分別設為預設時,現在每一款各自獨立記住自己的位置與大小,互不覆蓋;玩家自訂微調也一樣每個部件×體型分開記。★注意:舊的共用預設會清空,管理員需針對每一款重新按「📌設為預設」。',
      '👤【我的主角・可上場英雄地基(測試中·未開放)】為之後主角能編入隊伍、上場戰鬥、覺醒鋪好底層資料;此版僅資料地基,主角仍不會出現在學生的召喚/圖鑑/鬥技場,正式開放請等公告。',
    ],
    items: [
      '★ v4.74.0【avatar 部件預設 per-變體獨立·avatar_db.js】新增 window._avPartVarKey(cfg,slot):槽位鍵→「槽#體型#變體id」(素體 baseH/baseB 只到體型·該槽未選變體只到體型·未知槽維持原鍵向下相容)。單一真相 _avEffPos 頂部解析變體鍵→render(_ofsWrap/_avAccLayer)自動 per-變體;_avatarSetPartDefault/_avatarNudge/_avatarNudgeSize/_avatarNudgeReset/_avatarTogglePosDef/UI 使用預設勾選 共 7 讀寫點集中改走變體鍵(DOM 顯示 id 保留槽位鍵、儲存走變體鍵·兩者分離)。',
      '★ v4.74.0【遷移·一次性】舊雲端管理員預設 gameConfig/avatarPartDefaults(舊槽位鍵)與玩家舊 cfg.pos/posDef 槽位鍵→新版讀變體鍵故被孤立=舊共用預設清空(本為錯誤共用·屬預期改善);管理員重新針對每款×體型按📌設為預設。bump AVATAR_DB_VERSION 破圖片 ?v= 快取(玩家首次進造型工房一次性重抓·屬預期)。',
      '★ v4.74.0【主角資料地基 A1·index.html·休眠管理員限定】中央 IIFE:_PROTAG_HERO_NAME/_isProtagHero/_PROTAG_HERO_PUBLIC=false/_protagHeroOpenForMe(=公開旗標||管理員)/_lxpsProtagAwakened(預設 false→R)/_heroDisplayName(暱稱 helper);注入 HERO_DB 主角(hp79/atk13/sp13/spd13·S1三分投射/S2變臉戲法 c99 佔位待 A2)+AVATARS+HERO_IMGS(星佔位)+_PLAYER_HERO_NAMES。_getHeroRarity 主角→覺醒?SSR:R;advGetUnlockedHeroes 管理員推入+final force-include(gated);圖鑑 _buildHeroGrid/arena×4/援軍/全收錄/收藏獎章 共 17 站點 _isProtagHero 排除閘門(全 gated·學生完全看不到)。',
      '★ v4.74.0【範圍與驗證】avatar_db.js(_avPartVarKey+7 讀寫點)+index.html(A1 中央 IIFE+17 站點閘門)+admin_panel.js/game_changelog.js 版號同步;hero_db.js 維持 v4.54.0。9 版號同步點對齊 v4.74.0;index.html 21 inline 塊 node --check 全過·0 孤立代理字元;avatar_db.js node --check 過·0 孤立代理字元。A2(立繪渲染/3覺醒技/覺醒持久化/重置/第六章覺醒 act)下一版接。',
    ],
  },
  // v4.73.0 — 主線:序章森林停BGM留環境音+章節選擇縮圖(首張場景插圖)+封面改播章節音樂.m4a一次播完自動關閉·管理員測試
  {
    ver: 'v4.73.0',
    date: '2026-07-21',
    adminOnly: true,
    brief: [
      '📖 主線再調整!① 序章穿越到「迷霧森林」後,原本那首不太搭的背景音樂會停掉,只留下森林的環境音(鳥鳴、風聲),更有「剛闖進陌生異世界」的神祕感。② 章節選擇畫面每一章的按鈕下方,現在會嵌入該章「第一張劇情插圖」的縮圖,一眼就看得出那章的場景氛圍。③ 章節開場封面改成:顯示封面時播放專屬的章節音樂一次,音樂播完封面就自動關閉、進入劇情(當然隨時可以按跳過)。(主線仍在測試中,先開放給老師)',
    ],
    items: [
      '★ v4.73.0【序章森林停BGM留環境音】_msPlayScene 逐場景 BGM 新增 scene.bgm==="none" 分支:bgmStop() 停所有 audio[id^="bgm"] 但完全不碰 amb(amb 是 _msStartAmb 的動態 new Audio·不在 DOM bgm 清單內)→ 真正「停BGM、留環境音」;window._msCurBgm 設 "none" 防重觸。序章「主線_序章_迷霧森林」場景 bgm 由 bgm-taiwan-intro 改 "none"(保留 amb:forest)。',
      '★ v4.73.0【章節選擇縮圖】新增 _msFirstSceneImg(cid)(回傳該章第一張有 img 的場景插圖);_msOpenChapterSelect 章節卡右欄由「單一動作鈕」改「rightCol 直欄:動作鈕 + 其下層縮圖」(190×107 圓角·邊框同章節狀態色 accent·_msAsset 帶 ?v= 破快取);縮圖沿用既有場景插圖零新素材。',
      '★ v4.73.0【封面改播章節音樂.m4a·播完自動關閉】_msPlayCover 音樂由「per-chapter cover.bgm(未上傳)」改「單一 章節音樂.m4a(已上傳 330KB·全章共用)」:進封面 bgmStop 獨佔 → 播 章節音樂.m4a 一次(volume 0.72)→ onended 觸發 finish() 自動關閉封面進劇情;被擋/缺檔 8 秒兜底、異常沒觸發 onended 45 秒硬兜底;skip 鈕/點畫面 隨時可跳過(finish 冪等)。原固定 10 秒自動進正片邏輯移除。',
      '★ v4.73.0【範圍與驗證】全部改動集中在 index.html 主線引擎(_msPlayScene bgm 分派 / _msPlayCover 封面音樂與關閉 / _msOpenChapterSelect 縮圖 + _msFirstSceneImg);avatar_db.js/admin_panel.js/game_changelog.js 僅版號同步·hero_db.js/world-boss 未動。無真 ?.·九版號同步點全對齊 v4.73.0·changelog 恰 20 條·CURRENT_BOOT_VER 未動。主線 _MAINSTORY_ADMIN_ONLY 管理員限定測試。Phase 2(6 場劇情引導戰+主角戰鬥英雄+覺醒)另輪製作。',
    ],
  },
  // v4.72.0 — 主線:章節封面新圖+前情提要+對白上一句/下一句翻頁+環境音短檔名+內嵌教學×3與發劍演出·管理員測試
  {
    ver: 'v4.72.0',
    date: '2026-07-21',
    adminOnly: true,
    brief: [
      '📖 主線又更完整了!① 七章都換上了全新的精緻章節封面大圖(進章節前會先看到),封面下半部會浮現「前情提要」——用幾句話回顧從序章到上一章發生的故事,接關也不怕忘記劇情。② 劇情對白新增「上一句/下一句」按鈕,可以往回看剛剛錯過的對白,切換時會有翻頁音,不怕手快點過頭。③ 補上環境音效(河堤、教室、茶園、老街…的氛圍聲)。④ 劇情中會穿插「認識魔王、英雄升級、逛商店」的小教學,以及第五章打敗發酵魔王後「神劍現世」的演出。(主線仍在測試中,先開放給老師)',
    ],
    items: [
      '★ v4.72.0【封面換圖+關程式疊字】老師提供 7 張內建標題的精緻章節封面(主線_封面_序章.jpg…第六章.jpg·1672×941 JPGq90·放 repo 根目錄·DB cover.img 本就指向此檔名免改);_msPlayCover 移除程式疊標題大字(圖已內建標題·避免雙標題)→ titleBox 僅在「無封面圖 fallback 漸層底」時才顯示。',
      '★ v4.72.0【前情提要(封面下半部)】新增 _MS_CH_RECAP(七章各一句話回顧·premium/cute 雙版鐵律1.232)+ _msRecapForCover(cid)(串接 order 中「本章之前」各章回顧·序章無前文回傳空);_msPlayCover 於封面下半部(bottom:8%)疊白字黑框(text-shadow 八向黑描邊·無底·楷書字族)顯示前情提要,淡入。',
      '★ v4.72.0【對白上一句/下一句+翻頁音】_msPlayScene 對白層改版:showLine(instant) 加參數(回看整句直接顯示不重打字);新增 _msNavBarHtml(上一句/下一句 導覽列·curIdx=0 時上一句灰化不可按·取代舊點擊繼續)+ _msBindNav + _msAdvance(打字中→補完·否則前進·切到有效下一句才播翻頁);翻頁音 _msPlayPageTurn 播 翻頁.mp3(缺檔靜默);點畫面/下一句鈕/上一句鈕三入口統一。line.sfx 動作音與場景轉場音不受影響。',
      '★ v4.72.0【環境音短檔名(乙案)】_msSndUrl 由 主線_音效_{key}.m4a 改抓 {key}.m4a(老師上傳 forest/riverside/park/teafarm/flowerforest/darkness.m4a 等短檔名即生效·amb/sfx 共用此規則;classroom/oldstreet 待補即靜默 graceful)。',
      '★ v4.72.0【內嵌教學×3+發劍演出】_msRunAct 接 tutorial_king(認識魔王)/tutorial_levelup(英雄升級)/tutorial_shop(商店補給)→ _msActTutorial 自成一體教學卡(雙版·點我知道了續播·30s watchdog);grant_sword_tutorial → _msActGrantSword 神劍現世演出(純演出不動存檔·實際發劍走 _msGrantChapterReward ch5 crystal5_sword)。battle_*/awaken_hero 仍 default 放行=Phase 2(待主角戰鬥英雄)。',
      '★ v4.72.0【範圍與驗證】全部改動集中在 index.html 主線引擎(_msPlayCover/_msPlayScene/_msRunAct+新 helper);avatar_db.js/admin_panel.js/game_changelog.js 僅版號同步·hero_db.js/world-boss 未動。無真 ?.·九版號同步點全對齊 v4.72.0·changelog 恰 20 條·CURRENT_BOOT_VER 未動。主線 _MAINSTORY_ADMIN_ONLY 管理員限定測試。Phase 2(6 場劇情引導戰+主角戰鬥英雄+覺醒)另輪製作。',
    ],
  },
  // v4.71.0 — 主線劇情:戰前世界觀介紹+主角吐槽役+逐場景BGM換曲+對白著色(主角淡藍/關鍵詞亮黃)+對白音效改場景轉場·管理員測試
  {
    ver: 'v4.71.0',
    date: '2026-07-21',
    adminOnly: true,
    brief: [
      '📖 主線劇情更好玩了!① 第一次戰鬥前,動物學家會先介紹這個世界的祕密——在這裡,人們的力量來自「知識」;戰鬥中每答對一題,知識就會化成力量灌注全隊,常常能出奇制勝!② 主角現在會在旁邊「吐槽」了——聽到夥伴講出很中二、很浮誇的台詞時,主角會冒出玩家心裡想講的那句吐槽,讓劇情更詼諧、更貼近你的感受。③ 對白音效調整:以前每點一次「繼續」都會叮一聲,現在改成只在「畫面換場景」時才響一下,耳朵清爽多了。④ 每換一個場景背景,配樂也會跟著淡入淡出、換成最適合那一幕的曲子(第一次來到雙月河堤,會響起「召喚星空」的旋律哦)。⑤ 主角自己說的話改用淡藍色、和其他人區隔開;劇情裡的教學重點關鍵詞(像普通攻擊、能量、技能、素質點、馴養、至寶…)會用亮黃色標出來,一眼就抓到重點。(主線仍在測試中,先開放給老師)',
    ],
    items: [
      '★ v4.71.0【需求一·戰前世界觀介紹】MAINSTORY_DB 第一章於「隊友登場(join_ch1)」與「第一次戰鬥(battle_ch1_1)」之間新增一個介紹場景(沿用河堤背景+park 環境音·無需新素材):動物學家講述「這個世界人們的力量源自知識、懂得越多越強」+「戰鬥中每答對一題→知識瞬間凝成能量灌注全隊→答得越準越能出奇制勝」,由主角吐槽收尾。premium 小說化/cute 簡短雙版(鐵律 1.232)。',
      '★ v4.71.0【需求二·主角吐槽役】主角(__hero)對白由 4 句增至 9 句,於各章浮誇/中二台詞後穿插玩家視角吐槽:序章結尾(自嘲異世界第一天資訊量爆炸)、第一章世界觀場景(想變強竟要認真答題)、第二章(程式設計師「Bug 只是還沒找到的 Feature」)、第三章(劍士「劍法只有往前砍」)、第五章(發酵公「聞聞我的臭味」→摀鼻拒絕)。全雙版(premium 小說化/cute 簡短·鐵律 1.232),讓劇情詼諧貼近玩家。',
      '★ v4.71.0【需求三·對白音效改場景轉場】主線播放引擎音效邏輯調整:移除「每句對白點擊繼續」時的翻頁音(原 ov.onclick 內 playSfx sfx-confirm2)→改在「場景轉場淡入」時單發一次(_msRevealScene 內·同 _msRevealed 守門只發一次/場景)。對白層原有的動作音(line.sfx·如劍擊/火焰)不受影響照常單發;環境音(amb)照常。結果:切對白不再每句叮一聲,只在換場景時響一下。',
      '★ v4.71.0【需求四·逐場景 BGM 換曲】MAINSTORY_DB 有背景圖的場景新增 bgm 欄位(全部沿用遊戲既有 10 首 BGM·免補音樂素材);_msPlayScene 換場景時若 scene.bgm 與 window._msCurBgm 不同→bgmFadeTo 800ms 淡入淡出換曲(同曲不重切·無圖的影片/純演出場景維持前一曲)。老師指定:第一次到雙月河堤=召喚星空 bgm-summon;另杏花妖花林=bgm-boss-apricot、黑暗球=bgm-boss-darkorb、發至寶=bgm-treasure-gallery 等對味主題曲。_msEnterStoryBgm/_msExitStoryBgm 同步維護 _msCurBgm(進出主線正確記錄/清空)。',
      '★ v4.71.0【需求五+六·對白著色】_msPlayScene 打字機由 textContent 改 innerHTML 逐字著色(新增 _msEsc 防注入 + _msRenderTyped·點擊補完同步走同一顆):主角(__hero)整句對白用淡藍色 #aad4ff 與旁人區隔;line.hl 陣列所列教學重點關鍵詞用亮黃色 #ffe14d 標示。已為 7 句教學/世界觀對白標 hl(涵蓋 知識/力量/出奇制勝/普通攻擊/能量/技能/素質點/HP/攻擊/馴養/商店/知識王/至寶/投資);hl 詞同時涵蓋 premium/cute 兩版用語(該版缺該詞則不標·不影響顯示)。',
      '★ v4.71.0【範圍與驗證】全部改動集中在 index.html(主線 MAINSTORY_DB + _msPlayScene 播放引擎:逐場景 BGM/對白著色/音效轉場);avatar_db.js/admin_panel.js/game_changelog.js 僅版號同步·hero_db.js 未動。與尚未部署的 v4.70.0(章節標題/開場封面/豐富音效/小說化對白/主線鈕上移)同批,部署同 4 檔即含兩輪。無真 ?.·九版號同步點全對齊 v4.71.0·changelog 恰 20 條·CURRENT_BOOT_VER 未動(v1.0.20260510.6050)。主線 _MAINSTORY_ADMIN_ONLY 管理員限定測試。',
    ],
  },
  // v4.70.0 — 主線劇情大改版:新章節標題+章節開場封面與開場曲+豐富音效+小說化對白+主線鈕移到最上方·管理員測試
  {
    ver: 'v4.70.0',
    date: '2026-07-21',
    adminOnly: true,
    brief: [
      '📖 主線劇情大改版!① 每一章都有了正式的章節標題(像「第一章・河堤上的初陣」),進入章節前會先播一段「章節開場封面」——大大的標題配上專屬開場曲,像翻開一本故事書的新篇章。② 對白重新改寫成小說的口吻,每個夥伴講話都有自己的個性和語氣,讀起來更有帶入感。③ 加入了豐富的「環境音效」和「動作音效」——河堤的風聲、教室的氛圍、翻牌的聲音、施法的聲響…讓每個場景都活了起來。④「主線劇情」按鈕移到了關卡列表的最上方,一進冒險就看得到。(主線仍在測試中,先開放給老師)',
    ],
    items: [
      '★ v4.70.0【B·章節新標題】MAINSTORY_DB 全 7 章(序章+第一~六章)新增/更新雙版標題 titleP(精緻)/titleC(簡單):序章・穿越到異世界、第一章・河堤上的初陣、第二章・異變的線索、第三章・褪色的茶園、第四章・被奪走的心、第五章・發酵魔王的陰謀、第六章・吞噬色彩的黑暗(cute 版對應簡短標題·鐵律 1.232 雙版齊備);章節選擇視窗與章節開場封面共用同一標題來源。',
      '★ v4.70.0【C·章節開場封面引擎】新增 _msPlayCover(cid,onDone):讀 chapter.cover{img,bgm} → 全螢幕封面 overlay(z-index 9810)顯示封面圖(缺圖 graceful fallback 漸層底)+ 程式疊上大字章節標題 + 專屬開場曲(new Audio·有開場曲才 bgmStop() 獨佔·缺檔靜默);支援「跳過」鈕/點畫面略過/10 秒自動結束;接入 _msRunChapter:僅從章節開頭(i===0)播封面,封面播畢才 _msEnterStoryBgm+開始場景,續播章節中段不重播。封面資產檔名規格:主線_封面_序章.jpg…主線_封面_第六章.jpg、開場曲 主線_開場_序章.m4a…主線_開場_第六章.m4a(repo 根目錄)。',
      '★ v4.70.0【D3·豐富音效引擎】新增環境音(amb)+動作音(sfx)雙軌:_msStartAmb(key) 循環環境音(淡入到 0.35·同 key 不重起·切換場景自動接續)、_msStopAmb() 淡出(離開主線/進章節選擇時停)、_msPlaySfx(key,vol) 單發動作音(動態 Audio·play().catch 靜默);MAINSTORY_DB 各 scene 依語意標 amb(森林/河堤/公園/教室/茶園/花之森/老街/黑暗…)、關鍵對白 line 標 sfx(腳步/破裂/登場/翻牌/哨聲/施法/劍擊/祈禱/護盾/火焰…);接入 _msPlayScene(換場景啟動環境音)與 showLine(對白觸發動作音)。★缺音檔一律 graceful fallback 靜默不影響劇情播放。',
      '★ v4.70.0【A·小說化對白改寫】MAINSTORY_DB 全 7 章 premium 對白重寫為小說筆觸,融入各代表英雄語氣個性(小劇團員「人生如戲」、直笛演奏家對音準的堅持、弦樂團員「音樂是靈魂的語言」、動物學家的好奇、籃球隊「Team work makes the dream work」、田徑隊「每一秒比昨天快」、程式高手「Bug 只是還沒找到的 Feature」、繪圖高手「顏色不夠再加一層」、劍士的直率、祭司「每條生命都值得被守護」…);cute 版維持簡短口語(鐵律 1.232)。順手統一用語「弦樂隊員」→「弦樂團員」。',
      '★ v4.70.0【D1·主線鈕移到最上方 + 範圍驗證】「📖 主線劇情」入口鈕(#adv-mainstory-btn)由原位置(頭像鈕與近期活動鈕之間)移到冒險關卡列表最上方(木柵防衛戰之上)·一進冒險即見。★全部改動集中在 index.html 主線引擎/MAINSTORY_DB(avatar_db.js/admin_panel.js/game_changelog.js 僅版號同步·hero_db.js 未動);無真 ?.·九版號同步點全對齊 v4.70.0·changelog 恰 20 條·CURRENT_BOOT_VER 未動(v1.0.20260510.6050)。主線 _MAINSTORY_ADMIN_ONLY 管理員限定測試。',
    ],
  },
  // v4.69.0 — 造型工房:紙娃娃說明+全部件尺寸+管理員定位設預設+玩家用預設勾選·管理員測試
  {
    ver: 'v4.69.0',
    date: '2026-07-21',
    adminOnly: true,
    brief: [
      '👤 造型工房升級!標題下方多了一行說明「每個部位都像紙娃娃一樣,可以調整位置和尺寸哦!」現在「每個部位」(頭、身體、頭髮、衣服、帽子、眼鏡、嘴巴…)都能像紙娃娃一樣移動位置、變大變小。每個部件多了「☑使用預設」的勾選:勾著=用老師調好的漂亮預設;把勾勾拿掉就能自己調,還有「↺回預設」一鍵回到預設。(造型工房測試中,先開放給管理員)',
    ],
    items: [
      '★ v4.69.0【需求一·紙娃娃說明】造型工房標題下追加雙版說明(premium「每個部位都像紙娃娃一樣,可以調整位置和尺寸哦!」/cute「每個部位都像紙娃娃,可以移動、變大變小哦!」·鐵律1.232)。',
      '★ v4.69.0【需求二·尺寸擴大全部件·2乙】原本只有飾品(頭戴/眼鏡/嘴飾)能調尺寸→現在所有部件皆可(全畫布件 baseH/baseB/ofh/ofb/hh/mouth/held 的尺寸縮放接進 _ofsWrap:頭群組以瞳孔中線為軸、身/持物以下半身中心為軸;飾品維持 _avAccLayer 自身中心縮放·順修其讀取 cap ±20→±50 對齊寫入)。',
      '★ v4.69.0【需求二·管理員雲端預設·1丙】新增 gameConfig/avatarPartDefaults(同 avatarLocks 模式·僅 GM 可寫·登入者可讀·走 gameConfig 既有 rules 免新增條款){defaults:{"key":[dx,dy,尺寸%]}}。管理員取消「使用預設」→調整→按「📌設為預設」即寫雲端·全體玩家登入即套用;另有「📤匯出預設JSON」供日後寫進程式永久保存(丙)。',
      '★ v4.69.0【需求二·玩家用預設勾選·3乙】每個部件微調區新增「☑使用預設位置/尺寸」勾選:勾=用管理員雲端預設(鎖微調·只顯示預設值)·取消=自己調(從預設值起·方向鍵±1位置/±1%尺寸·↺回預設);單一真相 _avEffPos(cfg,key)供 render(_ofsWrap/_avAccLayer)與微調 UI 共用;cfg.posDef[key] 隨 avatarCard 上雲(merge:true 免改 rules)·玩家動微調鈕自動 posDef=false。',
      '★ v4.69.0【範圍與相容】全在 avatar_db.js(index/admin/changelog 版號對齊);舊玩家已存的位置/尺寸(cfg.pos)無 posDef 者預設「使用預設」→吃管理員預設(雲端未設則退回舊值/歸零)·不遺失。★本版同時攜帶未部署主線 v4.68.0(章節選擇+BGM)/v4.68.1(場景切換連貫)修正(主線 _MAINSTORY_ADMIN_ONLY 管理員限定·安全)。九版號同步點對齊 v4.69.0·changelog 恰 20 條·無真?.·BOOT_VER 未動。',
    ],
  },
  // v4.68.1 — 主線劇情場景切換連貫性:常駐黑底+交叉淡入(不再露出關卡頁)·管理員測試
  {
    ver: 'v4.68.1',
    date: '2026-07-21',
    adminOnly: true,
    brief: [
      '📖 主線劇情切換場景更順了!之前換場景時,舊圖消失、新圖還在載入的那一秒會露出後面的關卡選擇頁(閃一下)。現在鋪了一層黑底把後面擋住,而且會等新場景圖「載好」才淡入切換——舊場景會撐著、新場景圖就緒才交叉淡入,中間不會再有空檔或閃現關卡頁。(測試中,先開放給老師)',
    ],
    items: [
      '★ v4.68.1【常駐黑底】新增 mainstory-backdrop(position:fixed;inset:0;z-index:9780;背景 #0a0618 不透明·pointer-events:none):整個主線期間鋪在場景(9800)/選單(9790)之下,填補「舊場景移除→新場景圖尚未載入」的空檔,徹底杜絕露出後面關卡選擇頁。_msEnsureBackdrop 於播章/開選單時建立·_msExitStoryBgm(離開主線)移除。',
      '★ v4.68.1【不透明底色】場景 overlay 背景末層加上 #0a0618 實色(url 圖→漸層→實色):即使場景圖尚未載入,overlay 本身也不透出後面,雙重保險。',
      '★ v4.68.1【交叉淡入·真正無空檔】_msPlayScene 改「舊場景改名保留(mainstory-overlay-prev)不立即移除」+ 新場景 opacity:0 起(transition 0.45s)+ new Image() 預載本場景圖 → onload(或無圖/逾時 1.5s 兜底/已快取)才把新場景淡入並移除舊場景;_proceed 不再自行淡出/移除(交由下一場景載圖就緒後交叉淡入·末場景由 _msRunChapter.done() 收);切場景前清殘留 -prev、done() 一併清 -prev 防疊加。',
      '★ v4.68.1【範圍與驗證】只改 index.html 主線引擎(場景切換/黑底);avatar_db.js/admin_panel.js/game_changelog.js 僅版號同步·hero_db.js 未動;無 ?.·九版號同步點全對齊 v4.68.1·changelog 恰 20 條·BOOT_VER 未動。',
    ],
  },
  // v4.68.0 — 主線劇情:章節選擇視窗(已完成/未完成/回顧)+主線專屬 BGM·管理員測試
  {
    ver: 'v4.68.0',
    date: '2026-07-21',
    adminOnly: true,
    brief: [
      '📖 主線劇情新增「章節選擇視窗」!點主線劇情會列出全部章節,每章清楚標示 ✅已完成 / ▶未完成 / 🔒尚未解鎖,還有進度條看你走到哪。已完成的章節可以「🔁 回顧劇情」重新看一次完整內容;還沒解鎖的章節要先完成前一章才會打開。另外主線劇情現在有專屬背景音樂了——序章和前面的熱血章節配「冒險小隊出發」,貓空異變、花林魅惑、深坑臭氣、黑暗球等緊張章節配比較有戲劇張力的劇情音樂,離開主線會自動換回關卡頁的音樂。(測試中,先開放給老師)',
    ],
    items: [
      '★ v4.68.0【章節選擇視窗】新增 _msOpenChapterSelect:全螢幕列出序章+一~六章,每章標示 ✅已完成 / ▶未完成(可繼續) / 🔒尚未解鎖;頂部進度條 X/7 + 百分比;全六章通關顯示 🏆 通關提示。主線入口鈕(_msOpenMainStory)改為開此視窗(原本直接跳下一未完章)。章節卡片依狀態上色(綠/琥珀/灰)·雙版文字(鐵律1.232)·大按鈕 touch-action:manipulation(iPad 好點)。',
      '★ v4.68.0【回顧劇情】已完成章節提供「🔁 回顧劇情」→ _msRunChapter(cid, cb, {review:true}):從第一場景重播該章完整內容·不記續播點·不重複標記完成/發獎(冪等·純重播)。未完成的當前章顯示「▶ 開始/繼續冒險」(有續播點則顯示繼續)·從續播點接續。播完一章自動回章節選單,方便挑下一章或回顧其他章。',
      '★ v4.68.0【尚未解鎖】章節依序解鎖:只有「第一個未完成章」可進行,之後的章顯示 🔒 並提示「先完成前一章才會解鎖」(維持主線循序敘事)。',
      '★ v4.68.0【主線專屬 BGM】根據場合挑選現有音樂:章節選單 + 序章/第一章/第二章 = 冒險小隊出發(bgm-adv-march);第三章貓空異變/第四章花林魅惑/第五章深坑臭氣/第六章黑暗球 = 台灣關卡簡介劇情BGM(bgm-taiwan-cutscene·較具戲劇張力)。進主線(選單/播章)以 bgmFadeTo 切入;離開主線(關閉視窗 / 首登序章播完)還原關卡頁 BGM 貓空冒險(bgm-adv-scene)。_msEnterStoryBgm / _msExitStoryBgm 集中管理·window._msInStory 旗標防重複存曲。',
      '★ v4.68.0【範圍與驗證】只改 index.html(主線引擎:BGM 管理 + _msRunChapter 加 review/BGM + _msOpenMainStory 改開選單 + 新增 _msOpenChapterSelect/_msPlayFromSelect);avatar_db.js/admin_panel.js/game_changelog.js 僅版號同步·hero_db.js 未動;無 ?.·九版號同步點全對齊 v4.68.0·changelog 恰 20 條。戰鬥/教學類 act(battle_*/tutorial_*)仍留待批次2b/3。',
    ],
  },
  // v4.67.0 — 主線劇情批次2a:序章接線(捏臉/名片/加入演出/次元裂縫)·管理員測試
  {
    ver: 'v4.67.0',
    date: '2026-07-21',
    adminOnly: true,
    brief: [
      '📖 主線劇情更好玩了!序章帶你「捏臉」做主角、看冒險者名片、夥伴「加入隊伍」演出,裂縫穿越也有畫面轉場;第三、四章通關還會直接收服 SR 夥伴(劍士/祭司/守衛/刺客/火法師),而且玩到一半離開,下次能接著上次的地方看。(測試中,先開放給老師)',
    ],
    items: [
      '★ v4.67.0【主線批次2a】新增演出動作分派器 _msRunAct:每段對白播完後執行該場景的 act,完成再自動續播下一段(無 act 直接續播·全程 try-catch + watchdog 防卡死)。',
      '★ v4.67.0【序章接線】捏臉(open_avatar_studio→開造型工房·掛 _avatarPanelClose 偵測離開續播)/名片(set_card→展示自動生成的冒險者名片·掛 _avatarCardClose)/加入隊伍(join_prologue:小劇團員‧直笛團員‧弦樂團員‧動物學家 純敘事演出·不發卡·初始8英雄建帳號即贈)/次元裂縫(改暗場穿越對白+結尾淡出全黑→下一場景淡入·不做影片)。',
      '★ v4.67.0【加入演出全通】join_ch1 籃球隊員‧田徑隊員 / join_ch2 程式設計師‧電腦繪圖師(初始8英雄至此全數登場·純敘事) / join_ch3 劍士‧祭司 / join_ch4 守衛‧刺客‧火法師 加入隊伍演出。',
      '★ v4.67.0【SR 夥伴解鎖(Q3)】第三章通關直接解鎖 劍士‧祭司;第四章通關直接解鎖 守衛‧刺客‧火法師(共 5 位 SR·經 advSaveUnlockedHero 來源 mainstory_clear·圖鑑顯示「主線劇情獲得」)。已擁有者每重複 1 位改為 +5 召喚水晶。維持 SR 稀有度(不進 SUMMON_RARE_HEROES SSR 池·5 位皆早在 _PLAYER_HERO_NAMES 白名單與 ADMIN_ALL_HEROES 之內·免造角)。發放綁章節通關 reward·冪等(_r_chap_chX)。',
      '★ v4.67.0【火法師登場】第四章花林新增火法師登場對白(火剋魅惑妖花·雙版說明);火法師為既有 hero_db 英雄,故事化收服。',
      '★ v4.67.0【主線關卡進度綁 UID(Q2)】主線改為「章節內場景續播點」:玩到一半離開,下次從上次那一段接續(_sc_chX·綁 UID·雲端 mainStoryProgress + 本地 lxps_mainstory_uid 鏡像·取大還原·整章完成清除)。與戰鬥/一般存檔分離·只增不退。',
      '★ v4.67.0【場景圖】MAINSTORY_DB 9 張場景圖副檔名 .png→.jpg(配合 JPGq90 場景圖省流量);保留 貓空BOSS戰背景/深坑老街/臭豆腐BOSS/第一章河堤 為 .png 不動。',
      '★ v4.67.0【範圍與驗證】只改 index.html(主線引擎+DB);avatar_db.js/admin_panel.js/game_changelog.js 僅版號同步·hero_db.js 未動;無 ?.·九版號同步點全對齊 v4.67.0·changelog 恰 20 條。戰鬥/教學類 act(battle_*/tutorial_*/grant_sword/awaken_hero)留待批次2b/3。',
    ],
  },
  // v4.66.0 — 自訂角色安全開關(隨機變裝暫停 + GM鎖款玩家隱藏·管理員測試)
  {
    ver: 'v4.66.0',
    date: '2026-07-20',
    adminOnly: true,
    brief: [
      '🎲 打扮小屋:「隨機變裝」先暫停整理中,還有一些服裝在準備;老師鎖起來的款式也先不顯示,等做好、開放後就會出現囉!(測試中)',
    ],
    items: [
      '★ v4.66.0【自訂角色】隨機變裝暫時關閉(window._AV_RANDOM_OFF·部分套裝素材整理中,避免抽到未完成款;點選會提示整理中·邏輯完整保留,日後 _AV_RANDOM_OFF=false 一鍵重開)',
      '★ v4.66.0【自訂角色】GM 上鎖款對「非管理員」完全隱藏(連鎖定預覽也不顯示,等對應套裝素材修好重傳、GM 解鎖後才對玩家出現;管理員照常可見、可切換測試)',
      '★ v4.66.0【範圍與驗證】只改 avatar_db.js(index.html/admin_panel.js/game_changelog.js 僅版號同步);無 ?.·九版號同步點全對齊 v4.66.0·changelog 恰 20 條。',
    ],
  },
  // v4.65.0 — 主線劇情模式 Phase 1 地基(穿越冒險故事外殼·管理員測試)
  {
    ver: 'v4.65.0',
    date: '2026-07-20',
    adminOnly: true,
    brief: [
      '📖 全新「主線劇情」要來囉!跟著力行小學生穿越到異世界,和夥伴一起冒險、學會戰鬥和馴養,最後喚醒你自己的主角!(測試中,先開放給老師)',
    ],
    items: [
      '★ v4.65.0【主線劇情】Phase 1 地基:資料驅動章節腳本 MAINSTORY_DB(序章~第六章)+ 過場播放引擎(獨立 overlay 鏈式·打字機對白·可跳過·影片插槽缺檔靜默 fallback·防卡死 watchdog)',
      '★ v4.65.0【主線劇情】進度 self-write(mainStoryProgress·players 主檔 merge·免改 rules)+ 各章 🔮×5 / 全通關 🌈SSR隨機召喚卷×1 冪等發獎(序章不發)',
      '★ v4.65.0【主線劇情】關卡頁「📖 主線劇情」入口 + 首登自動導入序章(admin gating 測試期·防疊加守門);演出動作(造型工房/夥伴加入/教學/劇情戰)批次2/3 接既有系統',
    ],
  },
  // v4.64.2 — 頭飾尺寸上限 ±50% + 素體/部件圖快取自清 + 眼鏡白鏡片版補齊(管理員測試)
  {
    ver: 'v4.64.2',
    date: '2026-07-20',
    adminOnly: true,
    brief: [
      '👤 打扮小屋:如果基本身體或配件沒更新到最新樣子,這次會自動幫你清掉舊圖、重新抓最新的,不用手動清快取囉!',
      '📐 帽子、眼鏡、嘴巴小物的「大小」現在最多可以調到 ±50%(以前 ±30%),放很大或縮很小都行!',
      '👓 眼鏡的「白色鏡片」樣式修好了,之前有幾款白鏡片會空白抓不到圖,現在正常顯示。',
    ],
    items: [
      '★ v4.64.2【自訂角色】所有頭飾(頭戴/眼鏡/嘴部飾品)尺寸縮放上限 ±30% → ±50%',
      '★ v4.64.2【素體/部件】圖快取自清:avatar_db 版本升級時主動刪 ASSET_CACHE 內 avatar_parts 圖條目,根治個別裝置 SW 對舊圖頑固命中(v4.64.1 boy/kidboy 素體只更新一半事件),不再只依賴 ?v= query 破快取',
      '★ v4.64.2【眼鏡】白鏡片版 gls_X.png ×9 補齊:repo 原缺白版(全 404·只有透明 _clear 版)致玩家切「白色鏡片」載入失敗;程式 P.glasses img 引用本已正確,補上 9 張白版素材即解決',
    ],
  },
  // v4.64.0 — 自訂角色系統大改版(頭身新切法素材+頭飾/眼鏡/嘴飾+GM上鎖通道·管理員測試)
  {
    ver: 'v4.64.0',
    date: '2026-07-20',
    adminOnly: true,
    brief: [
      '👤 打扮小屋大升級!髮型和套裝現在是「整顆頭」和「整套衣服」直接換,點一下就換好,不會疊在一起囉!',
      '🎩 新增 10 頂帽子、10 副眼鏡、9 種嘴巴小物(吐司、棒棒糖、口罩、奶嘴…),搭配隨你玩!',
      '📐 每個部件都可以自己按上下左右微調位置,飾品還能調大小(±20%),調到最滿意的樣子!',
      '👀 眼鏡可以切換「透明鏡片(看得到眼睛)」或「白色鏡片」兩種樣式!',
      '🔊 選裝扮、按確認、按重來都有可愛音效!',
    ],
    items: [
      '★ v4.64.0【自訂角色】素體改頭身拆層渲染(新切法 8 件·chin 118/125/165/157·頸頂=chin−15);部件 URL 全面 ?v= 破快取',
      '★ v4.64.0【髮型/套裝】P.hairhead 25 件 14 款整頭件、P.outfit 34 件 13 款頭身分離套裝;互斥更換語意(選套裝清髮型頭·選髮型保留套裝身)',
      '★ v4.64.0【配件】頭飾 10/眼鏡 10/嘴部飾品 9(prop 定位引擎:AVATAR_HEAD_GEO 實測幾何自動對位四體型);選單十項定版;全部件 XY 微調 ±100 + 飾品尺寸縮放 ±20%(cfg.pos [dx,dy,尺寸%]);眼鏡鏡片雙版(img 白鏡片/clearImg 透明·cfg.glsClear 開關預設透明);工房背景影片循環接點 0.5s 淡出/淡入轉場',
      '★ v4.64.0【GM】上鎖通道 gameConfig/avatarLocks(工房內 🔓/🔒 直接切換·被鎖款走 avatarCard.unlock 帳本·取得方式後續設計);三音效(選擇/確認/取消模組.mp3)',
    ],
  },
  // v4.63.1 — 🎵 造型工房 BGM:進工房自動播放·離開切回關卡音樂(管理員測試中)
  {
    ver: 'v4.63.1',
    adminOnly: true,   /* ★ 主角系統測試期內容·僅管理員可見(老師 2026-07-18 永久規則) */
    date: '2026-07-20',
    brief: [
      '🎵【造型工房也有音樂了!(老師測試中)】打開「自訂主角」造型工房,會自動響起專屬的打扮音樂,邊聽邊幫主角換造型更有氣氛!',
      '🚪 按「離開」關掉工房時,音樂會輕輕淡出,自動切回關卡選單原本的背景音樂,完全不用自己動手!',
      '📱 也修好了平板上有時第一次點開名片會聽不到音樂的小狀況,現在一點開就聽得到!',
    ],
    items: [
      '★ v4.63.1【造型工房 BGM・avatar_db.js 為主】①_avatarOpenPanel 進工房自動播 自訂角色名片.m4a(共用 audio#bgm-avatar-card·先記原播曲 _avPanelPrevBgm·bgmFadeTo 500ms 淡入) ②新增 window._avatarPanelClose 統一關閉:收面板+名片曲淡出→有原曲淡回原曲/無原曲 bgmStop 後 bgmEnsureSceneBgm 依場景補播(冒險選關頁= bgm-menu-01);離開鈕 onclick 改走統一關閉 ③iPad 舊 Safari 首播保險(工房與名片同套):點擊授權內先將 bgm-avatar-card 音量 0 同步 play() 解鎖媒體元素,再交 bgmFadeTo 正常流程(避免 500ms 淡出 timer 內的 play 因失去手勢授權被拒→安靜) ④名片 BGM 加 _avCardStartedBgm 旗標:工房曲已在播時開名片不重起、關名片不誤停(修 _avCardPrevBgm 為空時走 bgmStop 把工房曲關掉的邏輯洞) ⑤index.html/admin_panel.js 僅版號對齊;無 ?.。',
    ],
  },
  // v4.63.0 — 🤝 好友名單「切換成名片」檢視模式(管理員測試中)
  {
    ver: 'v4.63.0',
    adminOnly: true,   /* ★ 主角系統測試期內容·僅管理員可見(老師 2026-07-18 永久規則) */
    date: '2026-07-19',
    brief: [
      '🤝【好友名單・切換成名片!(老師測試中)】好友頁新增「🪪 切換成名片」按鈕,一鍵把好友名冊變成大頭照名片牆!',
      '🪪 名片牆上每位好友都用自己打扮的冒險者造型當大頭照,一眼認出誰是誰,點大頭照就能看完整名片!',
      '🟢 大頭照右上角有線上小綠燈,誰在線上一看就知道;再按一下「📋 切換成清單」就變回原本的名冊!',
    ],
    items: [
      '★ v4.63.0【好友名單名片檢視模式・index.html 為主】①面板標題列新增「🪪 切換成名片/📋 切換成清單」切換鈕:偏好記 localStorage(_friendPanelCardMode) 下次開面板沿用;與 📇 名片按鈕同 _AVATAR_ADMIN_ONLY gating(測試期僅管理員可見·正式開放改 avatar_db.js 單一開關);avatar_db.js 未載入(_avatarRenderSVG 不存在)不顯示按鈕不炸 ②名片模式=名片縮圖網格:每位好友一張 3:4 上半身特寫大頭照(_avatarRenderSVG(cfg,null,true)·v4.61.0 名片同款構圖),資料來源 _friendHeroData[uid].avatarCard(v4.55.0 _fbLoadFriend 已整份讀回·零額外 Firestore 讀取);未捏臉好友顯示預設造型+「尚未設定造型/還沒打扮喔」角標(鐵律1.232 雙版·_fpSimple 分流·按鈕與 title 同雙版);點縮圖 _openFriendAvatarCard 開完整名片;線上燈號沿用 class=_friend-presence-dot data-friend-uid 機制移至縮圖右上角(_applyFriendPresenceDots/onSnapshot 免改直接套) ③網格欄寬:名片模式 minmax(168px,1fr)/清單模式維持 280px ④_refreshFriendListInner(好友資料 lazy load 完成的增量更新路徑)在名片模式改走整面板重渲 _renderFriendPanel(清單模板直接蓋會把名片網格洗掉;輸入中延後 500ms 守門為既有機制·重渲後補套 _applyFriendPresenceDots) ⑤avatar_db.js/admin_panel.js 僅版號對齊(AVATAR_DB_VERSION 順帶破素材快取·老師剛上傳的 avatar_parts 新素材可正確更新);無 ?.。',
    ],
  },
];
