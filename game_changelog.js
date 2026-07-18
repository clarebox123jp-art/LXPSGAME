// ════════════════════════════════════════════════════════════════════════
//  game_changelog.js  —  LXPSGAME 更新日誌
//  最後更新:2026-07-18  / 目前主程式版本:v4.59.0(👤 主角整套造型系統 12 件)
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
  // v4.59.0 — 👤 我的主角:整套造型系統(12 件·管理員測試中)
  {
    ver: 'v4.59.0',
    date: '2026-07-18',
    brief: [
      '👤【我的主角・整套造型登場!(老師測試中)】「換身體」新增「整套造型」:一鍵直接換上整套帥氣/漂亮的完整裝扮,連髮型姿勢都完美搭配好!',
      '⚔ 劍士系列 4 套:輕裝大劍士(男童)/華麗細劍士(少女)/重裝鎧甲劍士(少年)/俏麗雙劍士(女童),背著大劍握著細劍超有冒險者風範!',
      '🧙 魔法師系列 4 套:水藍(女童)/紫電(少女)/赤紅(少年)/翠綠(男童),四色魔法袍加披風,走到哪都是最亮眼的魔法師!',
      '👘 日式和服 1 款四種體型通通有!選「無(自由搭配)」就回到原本自由混搭模式;整套造型只有你的體型有的才會出現,之後會陸續補齊其他體型,敬請期待!',
    ],
    items: [
      '★ v4.59.0【整套造型系統・avatar_db.js】新分類 P.full「整套造型」(換身體頁籤·cfg.full·id0=無 自由搭配):選擇時「隱藏素體基礎圖」直接以整張 fullbody 素材取代(老師裁定),其餘圖層(髮型/眼鏡/帽子/手持等)照常疊加;渲染器素體層改 fullPng 優先(fullPng ? 整套 : 素體染色/素體),膚色/瞳色染色不套用於整套素材(素材自帶完整外觀);首批 12 件=劍士 4(輕裝大劍士 kidboy/華麗細劍士 girl/重裝鎧甲劍士 boy/俏麗雙劍士 kidgirl)+魔法師 4(水藍 kidgirl/紫電 girl/赤紅 boy/翠綠 kidboy)+日式和服四體型齊;素材 504×720 同素體規格·頭頂/腳底對齊素體幾何(切換造型大小不跳動)·檔名 fullbody_{en}_{body}.png 放 avatar_parts/;缺體型格 null 佔位該體型自動隱藏(沿用 v4.58.0 _avImgFor per-body 機制);名稱全雙版(鐵律1.232);_avatarDefaultCfg/_AV_CFG_KEY 補 full 欄位·舊存檔無 full 鍵 _pick 容錯退 id0 完全相容;index.html/admin_panel.js 僅版號同步。',
    ],
  },
  // v4.58.1 — 👤 我的主角:髮型裁切修復 + 介面放大(管理員測試中)
  {
    ver: 'v4.58.1',
    date: '2026-07-18',
    brief: [
      '👤【我的主角・造型工房 大改版!(老師測試中)】打扮方式變得超簡單:只有「換髮型」「換臉」「換身體」三大類加名片語錄,一眼就知道要按哪裡!',
      '💇 全新繪製的素材大量上線:髮型 20 款(短髮/雙馬尾/自然長髮/妹妹頭/刺蝟頭/高馬尾/中捲/低馬尾/超長直髮/中分/大馬尾/公主頭/制服頭/精靈捲/旁分/雙辮子/油頭/側馬尾/西瓜頭/中等長髮)配 16 種髮色!',
      '😊「換臉」可以選 6 款眼睛(瞇瞇眼/溫柔眼/帥帥眼/神氣眼/水汪眼/高傲眼)、2 款嘴巴、黑框眼鏡、精靈耳,再調瞳孔和眉毛顏色;「換身體」可以挑體型、膚色,還能換上白T牛仔褲、學生制服、西裝、藍長裙、小洋裝、吊帶裝!',
      '📌 有些款式只有特定體型才有(例如西裝目前只有少年版),選單會自動只顯示你的體型有的款式,之後會陸續補齊,敬請期待!正式開放時間請等公告。',
    ],
    items: [
      '★ v4.58.0【自訂主角簡化+素材接線·avatar_db.js】_AV_TABS 簡化為四頁籤:換髮型(hair+hairC)/換臉(eye+eyeC+mouth+gls+ear+browC)/換身體(body+skin+top+btm+sh)/名片(q);舊八頁籤定義保留於註解可復原。素材=老師人眼對位 aligned 圖 × 差異法抽件四批共 122 件(等比零拉長;髮件為光頭素體上之完整整頭;服裝件完全覆蓋素體;層序 素體→襪鞋褲衣→臉部件→前髮→耳→眼鏡)。缺體型格以 null 佔位,PNG 模式清單過濾改依當前體型(_avImgFor per-body)判定,缺格款於該體型自動隱藏;j===0 預設款永遠顯示(top/btm/shoe id0 更名 預設運動服/預設運動短褲/打赤腳)。',
      '★ v4.58.0【接線明細】髮 20 款(id0/2/3/4/5/6/7/10~22;id3 缺少年、id18 僅少女、id19/22 僅少年、id20 僅幼女、id21 僅幼男)、眼 id3/4/5/10/11/12、嘴 id10/11(少年原圖無變化無件)、眼鏡 id4、精靈耳 id1 解鎖、上衣 id10 白T+套裝 id11 制服/id12 藍長裙(少女)/id13 西裝(少年)/id14 小洋裝(幼女)/id15 吊帶裝(幼男)、下衣 id10 牛仔褲、鞋 id10 帆布鞋;檔名沿用既有槽位規劃(hair_short_boy.png 等),程式引用 126 檔與素材包交叉核對零缺零餘。mouth id0/shoe id11/12 無件維持 _offImg 停用。',
      '★ v4.58.0【範圍與驗證】改 avatar_db.js(頁籤+接線+per-body 過濾)+ index.html(mega 鍵與版號)+ game_changelog.js + admin_panel.js(僅版號)。功能仍受 _AVATAR_ADMIN_ONLY gating 一般玩家不可見。⚠ 部署需同步上傳 avatar_parts/ 資料夾 122 件 PNG(缺檔時選該款=素體原樣不破圖,_imgLayer 空值防呆)。check_inline 21 塊/node --check/孤立代理 0/admin 零真 ?./7 版本同步點全數 → v4.58.0。GAME_CHANGELOG 維持 20 筆(v4.57.0 未部署併入本條)。上傳順序:game_changelog.js → admin_panel.js → avatar_db.js → avatar_parts/ 素材 → index.html(最後)。',
    ],
  },
  // v4.56.0 — 🐉 世界BOSS龍王至寶修正 + 👤 主角造型素材第三批(管理員測試中)
  {
    ver: 'v4.56.0',
    date: '2026-07-18',
    brief: [
      '🐉【世界 BOSS 排名獎勵的「龍王至寶」修正!】之前不管當期是哪一隻龍王,獎勵頁分級表上寫的至寶永遠是「炎龍王之牙」(只有按 ? 小圓鈕看簡介才是對的)。現在分級表會跟著當期龍王顯示正確的專屬至寶名稱(例如海龍王之爪、雷龍王之翼、光龍王之羽…)!',
      '🎁【更重要的:實際發下來的至寶也修正了!】原本打贏非火龍王的場次、隔天領取排名獎勵時,發到手的龍王至寶一律變成「炎龍王之牙」——現在會正確發放「你當時擊敗的那隻龍王」的專屬至寶,就算領獎當天已經換下一隻龍王接班也不會發錯!',
      '👤 主角造型工房又進貨啦(老師測試中):新增 8 套完整造型素材——白T牛仔褲便服、學生制服、精靈套裝(金色捲髮+尖耳+高傲眼)、黑框眼鏡書卷風、雙辮子藍長裙、紳士西裝、單側馬尾粉洋裝、吊帶短褲西瓜頭,髮型 7 款、服裝 10 件、眼鏡與精靈耳通通有,正式開放請等公告!',
    ],
    items: [
      '★ v4.56.0【龍王至寶顯示修正·world-boss.js】根因:_WB_DRAGON_TREASURE_MAP 只有 3 筆(維蘇威/翠玉草/山岳)→ 雷/海/暗/光/幻龍王查無 → fallback dragon_fang_fire → 獎勵頁分級表 _wbGetCurrentDragonTreasureName() 永遠回「炎龍王之牙」(? 彈窗 v4.32.0 已改走 index 完整 8 龍王映射所以正確)。修法:①map 補齊 8 筆(與 index _lxpsDragonTreasureMapFull base 一致);②_wbGetCurrentDragonTreasureId 優先走 window._lxpsDragonTreasureId(_wbGetCurrentBoss().id)(與 ? 彈窗同源單一真相),舊路徑保留 fallback。無 ?.。',
      '★ v4.56.0【龍王至寶發放修正·world-boss.js + index.html】根因:領獎時 index 呼叫 _wbGrantDragonTreasure(rank) 只傳名次,grant 內部擲骰取 _WORLD_BOSS_TEAM_REWARDS[tier].dragonTreasureId(五個分級全寫死 dragon_fang_fire)→ 非火龍王場次排名至寶一律發成炎龍王之牙(結算寫入 pending award 的 dragonTreasureId 其實是正確的,但領獎忽略它;且結算隔天 08:00 下一隻龍王已原子接班,不能用「當前龍王」推算)。修法:_wbGrantDragonTreasure 加第二參數 tidOverride 一律優先;index 領獎呼叫改傳 _result.dragonTreasureId。歷史補寫 _advSaveTreasureUnlockHistory 原本就用 _result.dragonTreasureId,發放與歷史自此一致。',
      '★ v4.56.0【主角造型素材第三批·avatar_db.js v4.55.5】老師 20 張變體圖抽出 8 套 76 件 PNG 部件(×四體型):髮型 id15-21(制服頭/精靈捲捲/旁分頭/辮子頭/油亮頭/側馬尾/西瓜頭)、眼 id12 高傲眼(含挑眉+膚色補丁)、耳 id1 精靈長耳掛 PNG 解鎖、眼鏡 id4 黑框、上衣 id10-15(白T/學生制服/藍長裙/西裝/粉洋裝/吊帶裝)、下衣 id10 牛仔褲、鞋 id10-12(帆布/制服鞋/黑皮鞋);渲染行襪/鞋/下衣/上衣/耳/眼鏡補 _avImgFor 四體型陣列支援;雙版名稱(n/ns)全數齊備。長裙/西裝/粉洋裝/吊帶裝為單體型跨體型幾何合成(肩寬+頸地比映射),品質次於原生可日後補生成替換。素材仍受 _AVATAR_ADMIN_ONLY gating,一般玩家不可見。',
      '★ v4.56.0【範圍與驗證】改 world-boss.js(map 補齊+id 解析+grant 簽名)、index.html(領獎傳 override + mega 鍵)、avatar_db.js(v4.55.5 部件接線)。hero_db.js/adv_quiz_db.js/world-boss-ui.html/sw.js 未改免重傳(獎勵頁顯示行在 world-boss-ui.html 內原本就呼叫 _wbGetCurrentDragonTreasureName,修 helper 即生效)。check_inline 21 塊/node --check/孤立代理/admin 零真 ?./7 版本同步點 全數 → v4.56.0。GAME_CHANGELOG 維持 20 筆(移除最舊 v4.35.0)。上傳順序:game_changelog.js → admin_panel.js → world-boss.js → avatar_db.js → index.html(最後);avatar_parts/ 素材資料夾同步上傳。',
    ],
  },
  // v4.55.0 — 主角捏臉系統 Phase 1 + 冒險者名片
  {
    ver: 'v4.55.0',
    date: '2026-07-17',
    brief: [
      '👤 搶先預告:全新功能「我的主角」即將登場!到時主畫面會出現入口按鈕,打開「造型工房」就能捏出屬於你自己的主角:4 種體型(少年/少女/小小男生/小小女生)、8 種膚色、16 種髮色、12 種瞳色,加上臉型、髮型、眉毛、眼睛、鼻子、嘴巴各 10 款,自由搭配、左邊立繪即時預覽!',
      '🦊 還有超可愛的變身部件:精靈耳、貓耳、兔耳、狐狸耳、熊耳、狗耳,以及鹿角、龍角、天使翅膀、蝴蝶翅膀、貓尾巴、狐狸尾…有些款式上鎖了 🔒 —— 它們會在之後的「主線劇情」中解鎖,敬請期待!',
      '📇 「冒險者名片」也會一起來!捏好造型後可以選一句名片語錄(20 句可愛台詞任你挑),按「儲存造型」存到雲端;到「🤝 好友英雄」名單,每張好友卡片會多一顆「📇」按鈕,點開就能看好友的主角造型和名片!',
      '☁ 造型會自動存在你的帳號雲端,換一台 iPad 登入也不會不見。目前功能由老師先行測試中,正式開放請等公告,敬請期待!',
    ],
    items: [
      '★ v4.55.0【管理員測試期 gating】(老師指示:先讓管理員測試·對一般玩家隱藏)單一開關 avatar_db.js 內 _AVATAR_ADMIN_ONLY=true;三層防護:①主畫面入口按鈕靜態 display:none+_avatarRefreshEntryVisibility 登入後輪詢(30 秒內·20 次×1.5s)判 _isAdminUser 才顯示 ②好友卡片 📇 按鈕渲染時同開關條件輸出 ③_avatarOpenPanel/_avatarOpenFriendCard 開頭雙保險守門(非管理員 alert「測試中敬請期待」);正式開放=把該行改 false 一處即可全員可見。',
      '★ v4.55.0【主角捏臉系統 Phase 1·架構】全新獨立檔 avatar_db.js(部件庫+SVG 渲染器+造型工房面板+名片+雲端存取整包,index.html 僅 4 個掛鉤:mega-line 鍵/載入行/入口按鈕/好友卡片名片按鈕 → 改動最小化);部件定義 {id,type,svg,lock} 架構支援日後逐件替換 PNG 精繪(老師裁定丙案:Phase 1 SVG 全套上線·美術可漸進升級);Q 版二頭身 viewBox 360×480,色彩換色零額外資產(佔位字串 __SK__/__HC__/__EC__ 渲染時替換,膚8/髮16/瞳12 色票);幼兒體型=身體 group transform 縮矮(不另畫 path·部件 100% 共用)。',
      '★ v4.55.0【雲端與名片】avatarCard 整包 {cfg,unlock,q,ver} 存 players/{uid} 主檔 merge:true(照 representativeHero 模式;players 主檔 allow read: 登入玩家 → firestore.rules 零修改零部署);好友名片讀 _friendHeroData 既有整份 players doc → 零額外 Firestore 讀取;寫入僅「儲存造型」按鈕單次觸發=天然節流(v4.47.0 雲端節流教訓);本機 localStorage lxps_avatarCard_{uid} 快取,面板開啟時背景拉雲端一次跨裝置還原;名片語錄選單制 20 句(不開放自由輸入·900 位國小生校園安全·老師裁定)。',
      '★ v4.55.0【解鎖與雙版】特殊款 lock:{t:soon}=「主線劇情敬請期待」(Phase 2「萬象共鳴」主線掛真條件:獸耳↔對應英雄夥伴等);avatarCard.unlock 陣列帳本已預留(未來 GM 可補發);鐵律 1.232:全部件名稱+UI 說明文字 cute/premium 雙版(_artStyle 分流·avatar_db.js 內建 _avT 工具),主畫面入口按鈕副標註冊 _SIMPLE_TEXT_MAP;avatar_db.js 零 optional chaining、載入失敗僅 console.warn 不影響遊戲其餘功能(入口按鈕與好友名片按鈕都有 typeof 守門)。',
      '★ v4.55.0【驗證基準變更】index.html 新增 avatar_db.js document.write 載入行 → inline script 塊 20→21(check_inline 驗證基準同步更新);sw.js v3.5.90:SHELL_URLS 新增 ./avatar_db.js(隨核心檔快取·離線可用);admin_panel.js 僅版號同步。',
    ],
  },
  // v4.53.0 — 新英雄 麻吉喵‧Nico
  // v4.54.0 — 朱玥天賦強化 + 條件搜尋修正
  {
    ver: 'v4.54.0',
    date: '2026-07-17',
    brief: [
      '🌿 英雄調整—「魔界花使‧朱玥」天賦「百草共鳴」變強了!除了原本的「場上每有 1 名草屬性角色就讓朱玥傷害+治療變強」之外,現在每個新回合開始時,朱玥會讓花香瀰漫全場,用特技 100% 幫我方 HP 最低的 1 位夥伴補血(不會救倒下的夥伴)。',
      '🌿 這道新補血「沒有自己的升級數字」,但它會吃天賦原本的「治療量加成」—— 所以天賦練得越高、場上草屬性夥伴越多,補的血就越多!',
      '🔍 條件搜尋修正:勾「召喚物」現在會正確列出「操偶師」(牠的操偶/城牆本來就有自己的 HP 條卻一直沒被列到);同時把「動物學家、水狐」從召喚物移除(牠們召喚出來的效果不會留下持久的 HP)。',
      '🔍 條件搜尋修正:勾「冰凍」現在找得到「貓人族長」了(原本標籤打錯字,害牠兩邊都搜不到);勾「免死(HP剩1)」也會列出「炎火超少女」(爆發火神附體時不會倒下)。',
    ],
    items: [
      '★ v4.54.0【朱玥天賦新增效果】(老師需求)魔界花使‧朱玥 天賦「百草共鳴」新增:每回合開始時用特技 100% 恢復我方 HP 最低的 1 名友方(★不可復活 → 只找存活且未滿血者;全員滿血或全倒則不觸發)。★升級口徑(老師裁定「此效果的升級不用額外提升,隨著原有天賦提升即可」):本效果不另設升級軌、治療基數固定=朱玥當前特技值×100%,但因走 doHeal 且 actor=朱玥 → 自動吃既有「百草共鳴治療加成 hook」(草屬性存活數×(4+天賦Lv×2)%·總上限+50%)→ 天賦升級時自然一起變強;_TRAIT_LV_INFO 的 base/bonus/max 三軌完全不動(鐵律 1.160 只寫 Lv1 基準)。',
      '★ v4.54.0【朱玥天賦·實作位置】hook 掛 nextRound「救醫馬 救馬本能」之後、冬之戰場速度還原之前 = 新回合開始治療類集中區(與朱玥 S1 春之戰場「每回合開始恢復 20% HP」同一函式 → 語感對齊老師的「每回合開始時」);守門=朱玥存活 + 天賦未被封(_traitSeal / imprison / confused);特技值 spv=floor(sp×(1+sp×0.01)) 與寄生/爆發同口徑;doHeal 帶 actor 讓最高治療統計歸朱玥(v3.16.46 口徑)並自動吃禁療/減療閘門;純治療零傷害零復活 → 完全不涉鐵律 1.31。資料層四表同步:HERO_TRAIT desc/fd、_TRAIT_LV_INFO effect 補述、檔尾 sd 簡單風(鐵律 1.232 雙版齊備)、HERO_SKILL_EFFECTS 補「單體回復HP」;hero_input.html 天賦同步。',
      '★ v4.54.0【英雄 🔍 條件搜尋稽核修正】(老師回報操偶師漏標 + 全表稽核·純篩選顯示層·零戰鬥邏輯):❶老師裁定「召喚物」= 持久性且有獨立 HP 掛在角色身上(卡牌 card-summon-bars 有 HP 條)才算 → 操偶師(_puppetHp/_puppetWall)補標(本就在 v4.52.0 幽魂暗狐 _foxStripSummon 消召喚物權威清單內);動物學家(動物召喚=給友方裝寵物·走 EQUIP 無 HP 條)與水狐(天賦水精靈=一次性治療·不留 HP)移除舊標 → 召喚物精準剩 4 隻(操偶師/喚龍使‧蜜鶴林/貓人族長/陰陽師)與 card-summon-bars 渲染區完全對齊(雙星姊妹 _dualStarForm 只是型態標籤·無 HP·不列入)。',
      '★ v4.54.0【條件搜尋·孤兒標籤根治】❷貓人族長「凍結」→「冰凍」:v4.48.0 接線錯字,SKILL_EFFECT_DEFS 正式標籤為「冰凍」(實際狀態 addStatus freeze) → 舊值是孤兒標籤造成雙重失效(玩家勾「冰凍」搜不到貓人族長 / 「凍結」永遠不會有勾選框=死碼)。❸炎火超少女補「免死(HP剩1)」(爆發火神附體 3 回合明載「不會倒下·致命→HP剩1」·同鐵匠/魔劍姬/木靈使口徑)。❹幼兒園小孩「自身進入睡眠」依老師裁定不掛「睡眠」(該標籤語意=讓對手睡眠)。SKILL_EFFECT_DEFS 零新增;修正後稽核:86 標籤零孤兒(用到但不在表)、零空結果(勾了必無英雄)、100 隻英雄與 HERO_PRIMARY_CLASS 100 筆完全對齊。',
    ],
  },
  {
    ver: 'v4.53.0',
    date: '2026-07-17',
    brief: [
      '🍡 新英雄「麻吉喵‧Nico」登場!由 5 年 5 班 熊同學設計的 SSR 麻糬貓咪,是全遊戲第 7 隻「主坦克」英雄!',
      '🍡 天賦「Q彈」:隊友要被普通攻擊時,Nico 有機率彈過去幫他挨;而且自己每次被普通攻擊,軟軟的身體都會把衝擊彈開、回自己的 HP。',
      '😼 技能「喵的厲害」(被動):對手的極限爆發光芒一亮起,畫面就會問你要不要花能量發動 —— 一巴掌把對手的爆發光芒拍熄!每回合最多 1 次。',
      '🛡 技能「Nico保護你」:把自己撐成大麻糬盾牌,讓自己和 1 個隊友無敵 1 回合;每擋掉 1 次攻擊還會回能量和 HP。',
      '💢 極限爆發「怎麼樣?看看我的厲害!」:氣鼓鼓地連撞 7 下(撞倒了就換去打 HP 最低的那個),最後一下讓對手強力暈眩,自己再回一半 HP!',
      '🎨 這是 5 年 5 班的第七隻學生設計英雄,快去星空召喚看看能不能遇到牠!',
    ],
    items: [
      '★ v4.53.0【新英雄 麻吉喵‧Nico】資料層 14 表(hero_db.js):HERO_DB(hp91=配點70×1.3/atk15/sp10/spd5·總和100·老師裁決2乙由設計單 hp79 下修為 70 避免坦度爆表)、AVATARS🍡(全表零重複)、HERO_IMGS(麻吉喵Nico.webp·由 repo 既有 .jpg 轉出 524×749/q92/83KB/PSNR 41.15dB)、HERO_IMG_POS(150%/center 40%·主角貓在畫面中央偏下、背景有大量麻糬同伴需放大聚焦)、HERO_BIO(designer 5年5班 熊同學)、BURST_DB、HERO_LORE、HERO_TRAIT、BURST_GIF_DB(生氣的布丁奶茶.gif·實測 243×231/10幀/單圈 900ms→dur:900·sfx-punch+sfx-crit·tint 麻糬暖粉)、HERO_CATEGORIES_OVERRIDE(ctrl/heal/tank)、HERO_HEX_OVERRIDE(heal3/ctrl4)、_TRAIT_LV_INFO(代承50%+5%/級·回血10%+4%/級)、HERO_PRIMARY_CLASS(tank)、HERO_SKILL_EFFECTS(8 標籤全用既有·SKILL_EFFECT_DEFS 零新增)+ _LXPS_HERO_SD 簡單風四段(鐵律1.232 雙版齊備)。',
      '★ v4.53.0【邏輯層 index.html】天賦Q彈代承(doDmg 代承類集中區·挺身守護後/仁王挺立前·機率 50%+5%級·排除 AoE/DoT/反彈·_mochiGuardChecked 防連鎖)、天賦Q彈回血(doDmg 扣血後·對齊沐雲雪 軟軟的雲 hook 位置·10%+4%級)、S1喵的厲害被動確認窗(helper _mochiS1Prompt/_mochiS1Fire/_mochiS1Drain 置於 _catSummonChance 與 startTurn 之間;掛 nextRound「雙方各補3能量」後 → 對手爆發光芒剛亮起的瞬間;阻塞式彈窗由回呼排 startTurn·完全對齊 showEquipUI/showDiscardUI 既有非同步慣例)、S2 Nico保護你(execSkill 玩家路徑 + aiUseSkill AI 路徑雙實作·鐵律1.128·附 2 行 AI 評分)、S2 無敵回饋(doDmg immune 擋傷分支·靠 buff 上 _mochiGuard 標記辨識·別處來源的無敵不誤觸發)、爆發(_runBurst·7 連撞+倒下轉移 HP 最低+末擊強力暈眩+回 50%HP)、SUMMON_RARE_HEROES、STUDENT_DESIGNER_HEROES、SKILL_UPGRADE_DEF×2(special_mochi_s1/s2)+ 圖鑑升級視窗兩處 case、BURST_UPGRADE_DEF、_renderBurstFdWithLv 專屬 case。',
      '★ v4.53.0【鐵律 1.31 BOSS 保護】本隻全招式皆為純倍率/純我方增益 —— 無固定傷害、無 HP% 傷害、無即死、無 HP 設 1、無 >5000 固定傷害 → 走 doDmg 不加 bypassShield,世界 BOSS 每英雄每回合 5000 cap 與龍王元素護盾全部自動生效,對 BOSS 零破口,不需任何額外 cap(本輪為近期少數「零 BOSS 風險」的新英雄)。',
      '★ v4.53.0【老師四項裁決】① S1 保留「被動」定位但改為彈確認窗詢問是否消耗能量發動(完全比照煉金術師「道具複製」showAlchemistPrompt 模式·含自動戰鬥自動發動分支;AI 側走同一顆 _mochiS1Fire 保證同口徑)。② 配點 hp79→70(hp 欄位 103→91·與地獄將軍同級·非全遊戲最高)。③ 天賦代承由「必定」改機率制(50%起+5%/級·Lv5=70%)、回血 15%→10%(+4%/級)。④ S2 無敵回饋加每回合上限 2 次(_mochiGuardRoundUsed·nextRound 重置)→ 避免被連續 AoE 打成無限回復。',
      '★ v4.53.0【英雄編輯器 hero_input.html 修正·老師要求釐清】查證發現 _heroSkillTypes 是「HERO_PRIMARY_CLASS 有值就直接 return、CATEGORIES 永遠到不了」,而 PRIMARY_CLASS 已 100 筆涵蓋全英雄 → 編輯器舊有的「篩選分類」複選對遊戲篩選 100% 是死碼,真正決定篩選的 HERO_PRIMARY_CLASS 卻沒有欄位可填。本輪(老師選甲):新增「🎯 主分類(單選)」欄位 + HERO_PRIMARY_CLASS_INITIAL(100 筆)+ 設計單多印「主分類」+ 舊複選正名為「副分類(舊制備援)」並補上 tank 第四色;另補回 v4.52.0 漏同步的幽魂暗狐與本輪 Nico 至 HEROES_DB/HERO_CATEGORIES_INITIAL。⚠ 釐清:主分類(篩選)與雷達圖(HERO_HEX_OVERRIDE)是兩件不同的事。',
    ],
  },
  // v4.52.0 — 新英雄 幽魂暗狐
  {
    ver: 'v4.52.0',
    date: '2026-07-16',
    brief: [
      '🦊 新英雄「幽魂暗狐」登場!由 4 年 7 班 于同學設計的 SSR 九尾幻獸,速度是全遊戲最頂尖的等級之一!',
      '👻 天賦「離魂蹤步」:每回合開始有機率化為殘影搶先行動,還會把敵人裡速度最快的那一隻往後擠 1 格。',
      '🐾 技能「殘影抓擊」:用特技連抓 2 下,而且會直接咬碎對手身上的 1 個召喚物(操偶、天青龍、小精靈、式神都算)。',
      '💀 技能「魂飛魄散擊」:把自己 HP 燒到剩 1,換一記必中的固定傷害加暈眩;打 BOSS 時威力更強(但有傷害上限保護)。',
      '🌀 極限爆發「靈魂交換」:跟 1 個對手交換魂魄!兩邊的攻擊和特技對調,暗狐還能用對手的技能跟大絕(大絕只能用 1 次)。',
      '🎨 這是 4 年 7 班的第二隻學生設計英雄,快去星空召喚看看能不能遇到牠!',
    ],
    items: [
      '★ v4.52.0【新英雄 幽魂暗狐】資料層 14 表(hero_db.js):HERO_DB(hp81=配點62×1.3/atk3/sp15/spd20·總和100)、AVATARS🦊、HERO_IMGS(幽魂暗狐.webp)、HERO_IMG_POS(524×749 四足幻獸·130%/center 26%)、HERO_BIO(designer 4年7班 于同學)、BURST_DB、HERO_LORE、HERO_TRAIT、BURST_GIF_DB(紫光籠罩吸收.gif·實測16幀/單圈1120ms→dur:1120·sfx-darkorb-burst+sfx-youyou-burst·tint紫)、HERO_CATEGORIES_OVERRIDE(dmg/ctrl)、HERO_HEX_OVERRIDE(heal0/ctrl5)、_TRAIT_LV_INFO(base 搶先50%/+10%級/max 90%Lv5)、HERO_PRIMARY_CLASS(dmg)、HERO_SKILL_EFFECTS + _LXPS_HERO_SD 簡單風四段(鐵律1.232 雙版齊備)。',
      '★ v4.52.0【邏輯層 index.html】天賦離魂蹤步(startTurn renderTurnOrderBar 前·仿翠鳥v3.36.0 _foxOrigSpd 搶先 + 仿警長 _foxPushOrigSpd 推後1格·天賦被封停用)、S1殘影抓擊 + S2魂飛魄散擊(execSkill 玩家路徑 + aiUseSkill AI 路徑雙實作·鐵律1.128·附 2 行 AI 評分)、爆發靈魂交換(_runBurst·新狀態 _soulSwap·helper 三支 _foxStripSummon/_foxSoulSwapApply/_foxSoulSwapRestore)、SUMMON_RARE_HEROES、STUDENT_DESIGNER_HEROES(4年7班第二位·isFirstOfClass 不設)、SKILL_UPGRADE_DEF×2、BURST_UPGRADE_DEF、STATUS_DESCS/statusName/buff圖示、SKILL_EFFECT_DEFS B組新增「搶先行動」「消除召喚物」2 標籤(鐵律六易錯點④·否則編組🔍搜不到)、_renderBurstFdWithLv 新增 case 靈魂交換(本爆發無百分數·通用N%引擎抓不到)。',
      '★ v4.52.0【鐵律 1.31 BOSS 保護·老師裁決】① S2 魂飛魄散擊對 BOSS 雖為 500%,但玩家/AI 兩路徑一律硬 cap 5000(_FOX_S2_BOSS_CAP·貼齊世界BOSS每英雄每回合上限);「HP降至1」是對自身非對BOSS設HP=1。② 爆發靈魂交換對 BOSS/世界BOSS 自動降級:只換 atk/sp + 可用其 S1/S2,禁止複製其爆發(防秒殺類公式被打回 BOSS 自己)。③ S1 消召喚物只清召喚物欄位、不碰本體 curHp;全技能走 doDmg 不加 bypassShield → 5000cap 自動生效。',
      '★ v4.52.0【實作要點】換魂期間直接把暗狐 s1/s2 換成對手技能物件 → 既有技能面板/skillCost/execSkill 分派全自動生效(零 UI 改動);借爆發走 _runBurst 第5參數 _mimicSourceName(臨摹大師現成引擎)並在 _runBurst 入口單點覆寫(execBurst 有多個呼叫點·不逐一改動);爆發選角沿用 _pickAutoBurstTarget(v3.7.10 起爆發禁用 setPending 防 cinematic 卡死);換魂 buff 帶 _strong:true(v3.13.46 通則·不可消除/奪取/交換),到期於既有 buff dur===1 區各自還原 atk/sp。',
      '★ v4.52.0【已知限制】借來的技能只有「通用倍率公式」生效、對方專屬特效不跑 —— 與既有臨摹大師「模仿」同款限制(execSkill 多數分支以 actor.name 把關),非新問題。⚠ 上線前必辦:老師需上傳「幽魂暗狐.webp」(repo 現為 .jpg),否則立繪破圖。admin_panel.js 本輪僅版號 bump·內容未改。',
    ],
  },
  // v4.51.0 — 🛟 戰鬥卡死自動救援升級(選目標超時自動取消)
  {
    ver: 'v4.51.0',
    date: '2026-07-16',
    brief: [
      '🛟【戰鬥卡住自動救援升級】按了「普通攻擊」或「使用物品」之後要點選目標,如果超過 30 秒都沒點成(不小心點錯、或一時找不到可以點的對象),以前遊戲可能會整個卡住不動。現在系統會自動幫你「取消這次選擇」,把行動按鈕還給你重新選一次,完全不會損失回合、不會影響戰鬥數值!',
      '🆘【自救按鈕保底】萬一自動救援連續幾次都沒成功,畫面會直接出現「卡死自救」按鈕讓你手動處理,不會再默默卡在原地。遇到「我方不動」的同學,更新後重新整理就能套用囉!',
    ],
    items: [
      '★ v4.51.0【根因】玩家按普攻/物品後 setPending 設 G.pendingTarget 進入「等點目標」,updateUI 依設計隱藏 action-panel;30 秒未完成點選 → 卡死 watchdog 進自動救援,但舊救援僅設 display 空字串再呼叫 updateUI —— updateUI 見 G.pendingTarget 仍在,立即把面板藏回去 → 「還原→2 秒後又判卡死」無限循環(單人模式 startTurnTimer 已停用,無 AI 代管,本救援為唯一保險網)。實錄:日本關 round 5 大天狗「我方不動卡死」,自動救援連跑 7+ 次全失敗。',
      '★ v4.51.0【修法①】救援(6)還原面板前,偵測 pendingTarget / selMove / pendingCb 殘留 → 先走內建取消選取路徑 clearSel()(一次清乾淨:pendingTarget/pendingCb/selMove/selItem/確認欄/item-ops/連發鎖/targetable 高亮),玩家效果=超時自動取消選取、行動面板還給玩家重選,不損失回合、零戰鬥數值改動。',
      '★ v4.51.0【修法②】面板還原由 display 空字串改 display:block,對齊 startTurn 正常開面板路徑;還原後補 renderItems() 重繪物品欄。',
      '★ v4.51.0【修法③保底】同一 actor+回合 連續還原 4 次仍卡 → 停止自動循環,改顯示「卡死自救」按鈕(舊版 _autoRescueOk 恆 true,自救按鈕永遠不會出現);換人/換回合計數自動歸零。僅動 watchdog 救援(6)區塊,無 ?.。',
    ],
  },
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
  // v4.35.0 — 🐉 天神宙斯「天降雷罰」秒殺龍王的漏洞修好了
];
