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
  // v3.15.81 — 知識王完成後可查看今天做完的科目與成績
  {
    ver: 'v3.15.81',
    date: '2026-06-22',
    brief: [
      '📋【知識王:完成後可查看今天的成績】知識王挑戰完成後,再打開挑戰視窗,底部按鈕會變成「<b>📋 查看今天的科目與成績</b>」,點下去就能看到<b>今天的分數、答對題數,以及做完的科目</b>(一般科目 + 課堂複習)。隔天 08:00 重置後,完成新挑戰會自動更新成當天的成績。',
    ],
    items: [
      '★ v3.15.81【今日成績持久化 index.html】_kingChallenge 新增 _todayResult { date, score, correct, total, subN, subR, isReview };_kingClaimRewards 完成領獎時記錄(correct=_answered 中 true 數、total=_curQuestions 長度、subN=_curSubject、subR=_curSubjectReview、isReview=_isReviewMode)→ _kingSaveToCloud。',
      '★ v3.15.81【雲端白名單 save/load】save 序列化於 _bestScore 後加 _todayResult、load 還原同步;跨日由 date !== 今日(_kingGetTodayStr)自動失效(不需顯式清除,完成新挑戰時覆寫;_dailyDone 為 false 時也進不到查看鈕)。',
      '★ v3.15.81【UI】_kingShowEntryPopup 已完成(_dailyDone)底部按鈕由停用「✅ 今日挑戰已完成」改為可點「📋 查看今天的科目與成績」→ _kingShowTodayResult();新增 _kingShowTodayResult 全內聯彈窗(分數大字依分數變色、答對 X/Y、一般/課堂複習科目 chips、課堂複習徽章、歷史最高分;date 不符或無紀錄走 fallback「已完成」訊息;關閉用 .ktr-close JS 綁定 + 遮罩點擊,避免跳脫引號)。',
      '★ v3.15.81【版本鏈】4 GAME 同步點 v3.15.80→v3.15.81;_vers[index.html]/[game_changelog.js]/_GAME_LOADED_VERSION 同步 v3.15.81。hero_db.js v3.15.78、main.css v3.15.79、admin_panel.js v3.15.80、world-boss.js v3.15.51、world-boss-ui.html v3.15.69。本輪(81)只改 index.html。GAME_CHANGELOG trim 至 20(本 session 78-81 共加 4、移除最舊 v3.15.58/59/60/61)。',
    ],
  },
  // v3.15.80 — 召喚紀錄改存雲端 + 登入同步 + GM 查詢
  {
    ver: 'v3.15.80',
    date: '2026-06-22',
    brief: [
      '☁️【召喚紀錄改存雲端】以前召喚紀錄只存在這一台裝置,換裝置、清快取或重新登入就看不到了。現在<b>召喚紀錄會自動存到雲端、登入後同步</b>,不論在哪一台 iPad 都看得到<b>完整的召喚紀錄</b>(包含用合成召喚卷抽到的結果)。',
    ],
    items: [
      '★ v3.15.80【雲端化 index.html block#02 加 5 helper】_fbSaveSummonHistory(整包寫 summonHistory/{uid}={uid,list≤60,updatedAt},merge:false)、_fbLoadSummonHistory(uid)、_fbSyncSummonHistoryOnLogin(雲端+本地以 t+_+n 去重、保最新 60 寫回本地,本地較多則回寫雲端)、_fbReadPlayerSummonHistory(GM:email/uid/學號 lsps→補 @stu.lsps.tp.edu.tw 以 where email 反查 uid)、_fbShowPlayerSummonHistory(GM 彈窗:摘要抽到的稀有英雄/台灣至寶 chips + 逐次明細)。Firestore SDK refs 在 block#02 模組作用域,故 helper 定義於此、跨 block 以 window.* 呼叫。',
      '★ v3.15.80【寫入/同步點】_recordSummonHistory 寫 localStorage 後即時 window._fbSaveSummonHistory(_hist)(星空抽/隨機券/合成自選券/至寶券皆經 _showSummonResults/_showSummonTicketResult → _recordSummonHistory);登入 onAuthStateChanged 的 await gameCloudLoad(user.uid) 後加 _fbSyncSummonHistoryOnLogin()。',
      '★ v3.15.80【GM UI admin_panel.js】玩家活動記錄查詢區(_admin-activity-section)按鈕列加「📜 召喚紀錄」鈕,讀查詢框 email/uid/學號 → window._fbShowPlayerSummonHistory;加按鈕到既有 section 免三點同步(_summonBtn grab + onclick 綁定),全程無 optional chaining。',
      '★ v3.15.80【⚠ 需部署 Firestore 規則】summonHistory/{uid}:玩家寫自己(request.auth.uid==uid + hasOnly([uid,list,updatedAt]))、GM(isAdmin)讀全部;未部署則雲端寫入被拒,本地紀錄仍正常(belt-and-suspenders,不影響召喚本身)。',
      '★ v3.15.80【版本鏈】4 GAME 同步點 v3.15.79→v3.15.80;_vers[admin_panel.js] v3.15.58→v3.15.80 + ADMIN_PANEL_VERSION v3.15.58→v3.15.80(自檢需一致)。hero_db.js v3.15.78、main.css v3.15.79、world-boss.js v3.15.51、world-boss-ui.html v3.15.69。本輪改 index.html + admin_panel.js。',
    ],
  },
  // v3.15.79 — 知識王挑戰首頁加寬至接近全螢幕 + 字體按鈕放大
  {
    ver: 'v3.15.79',
    date: '2026-06-22',
    brief: [
      '🔍【知識王挑戰首頁加寬】「今日知識王挑戰」的視窗外框<b>加寬到接近全螢幕</b>,三欄(獎勵說明 / 本週小博士 / 特別挑戰題)的<b>字體與按鈕都放大</b>了,看得更清楚、也更好點。',
    ],
    items: [
      '★ v3.15.79【index.html _kingShowEntryPopup】外框 max-width min(96vw,960px)→min(97vw,1680px)、grid gap14→20、margin-top14→18;中欄(本週小博士卡)+右欄(特別挑戰卡 _specialCardHtml)+徽章(_scBadgeHtml)行內字級/按鈕放大;底部按鈕列 margin14→18;_applyLayout 響應門檻 600/900→640/1000(字級放大後三欄需更寬視窗才舒適)。',
      '★ v3.15.79【main.css】.king-box-2col max-width 1500→1680 + scoped 放大(.king-box-2col .king-title/.king-subtitle/.king-rules/.king-rule-row/.king-rule-detail/.king-btn),僅入口彈窗、不影響 .king-box-question/.king-box-result 等其他知識王彈窗。',
      '★ v3.15.79【版本鏈】4 GAME 同步點 v3.15.78→v3.15.79;_vers[main.css] v3.14.5→v3.15.79。hero_db.js v3.15.78、admin_panel.js v3.15.58(本輪未改)。本輪改 index.html + main.css。',
    ],
  },
  // v3.15.78 — 補喚龍使‧蜜鶴林圖鑑設計師資訊
  {
    ver: 'v3.15.78',
    date: '2026-06-22',
    brief: [
      '✏️【補上「喚龍使‧蜜鶴林」的設計師資訊】英雄圖鑑詳情頁補上「<b>喚龍使‧蜜鶴林</b>」的設計師標示:<b>由 5 年 3 班 龎同學設計</b>。',
    ],
    items: [
      '★ v3.15.78【hero_db.js】喚龍使‧蜜鶴林 HERO_BIO(L2144)補 designer:{ class:5年3班, name:龎同學, year:2026 };圖鑑詳情頁(index.html)以 bio.designer 存在為顯示設計師區塊的閘門,_getDesignerLabel 查無 STUDENT_DESIGNER_HEROES 則 fallback class+name → 顯示「✏️ 由 5年3班 龎同學 設計(2026 年)」。同 v3.15.65 熔岩巨人/拘留者病灶(新增英雄時 HERO_BIO 漏 designer 子欄位,鐵律 1.231)。',
      '★ v3.15.78【版本鏈】_vers[hero_db.js] v3.15.72→v3.15.78;4 GAME 同步點 v3.15.77→v3.15.78(本檔僅版本鏈,實質改 hero_db.js)。本輪只改 hero_db.js。',
    ],
  },
  // v3.15.77 — 十連抽優化(同批第二隻重複稀有英雄自動轉換成對應獎勵,沒有損失)
  {
    ver: 'v3.15.77',
    date: '2026-06-22',
    brief: [
      '🌈【十連抽優化】同一次連抽中,如果抽到「第二隻重複的稀有英雄」,系統會自動把重複的那隻轉換成對應獎勵——<b>SSR 重複→超越極限果實 ×1</b>、<b>SR 重複→精裝英雄經驗之書 ×5</b>,不會再白白浪費。',
      '   ・召喚結果視窗會明確顯示「🔄 抽到 N 隻重複英雄,已自動轉換為對應獎勵,沒有損失!」,被轉換的卡片也會標上「🔄 重複轉換」,讓你一眼就知道沒有虧到。',
    ],
    items: [
      '★ v3.15.77【根因】doSummon 連抽(10+1=11 抽)的抽取迴圈一次跑完才在 _applySummonReward 統一解鎖英雄;抽取當下 advGetUnlockedHeroes() 對「同一批稍早已抽中、但尚未解鎖」的英雄是看不見的 → rare_ssr/rare_sr 的候選 _avail 只用 stale unlocked 過濾 → 同批可能重複抽到同一隻;第二隻 advSaveUnlockedHero 等同 no-op(英雄只能擁有/未擁有,無重複概念)→ 玩家空得、形同浪費一抽。',
      '★ v3.15.77【修法】_rollOneSummon 新增 _batchExcl(Set)參數;doSummon 用 _batchClaimedHeroes Set 記錄本批已抽中的 rare_hero,逐抽即時排除。rare_ssr/rare_sr 改先算 _availUnlocked(僅依存檔已解鎖)再扣同批已抽中得 _avail:_avail 有貨→正常給英雄;_avail 空但 _availUnlocked 有貨(代表沒收錄的都在這批稍早抽中了)→第二隻重複,轉對應獎勵並標 _dupConverted/_dupTier;_availUnlocked 也空→維持原「全收錄」轉換文案。legacy rare_hero 路徑一併補 _excl 排除(保險)。',
      '★ v3.15.77【顯示】_showSummonResults 標題下方加綠色橫幅「🔄 抽到 N 隻重複的稀有英雄,已自動轉換為對應獎勵,沒有損失!」(_dupCount>0 才顯示,單抽因 _batchExcl 空永不觸發);被轉換的結果卡加「🔄 重複轉換」小標。轉換後的獎勵走既有 _applySummonReward(rwd.id→backpackAdd),召喚紀錄/角色預覽不受影響。',
      '★ v3.15.77【安全】只動「召喚抽取邏輯」與「結果顯示」,完全不改 SUMMON_RATES 機率表、不改英雄解鎖流程、不改任何存檔/守門。_rollOneSummon 全站僅 doSummon 一處呼叫,加選用參數向下相容(未傳=空集合,單抽行為不變)。轉換獎勵沿用既有「全收錄」同款道具(SSR→超越極限果實、SR→精裝英雄之書×5),不新增掉落物、不影響經濟平衡。',
      '★ v3.15.77【版本鏈】4 GAME 同步點 v3.15.76→v3.15.77;_vers[index.html]/[game_changelog.js] 同步 v3.15.77。hero_db.js v3.15.72、world-boss.js v3.15.51、world-boss-ui.html v3.15.69 不變。本輪只改 index.html + game_changelog.js。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.57)。',
    ],
  },
  // v3.15.76 — 存檔同步修正(資料修復後重整仍誤判倒退無法同步,根因雲端殘留舊資料墊高比較基準)
  {
    ver: 'v3.15.76',
    date: '2026-06-22',
    brief: [
      '🔧【存檔同步修正】修正極少數帳號在資料修復後,重新整理仍出現「資料倒退」警告、無法把進度存上雲端的問題。根因是雲端殘留的舊資料把比較基準墊高了,造成誤判。現在改以「實際擁有的英雄」為準來判斷,正確的資料能正常同步到雲端,不會再被誤擋。',
    ],
    items: [
      '★ v3.15.76【倒退守門 heroLevels map 污染免疫】根因:常規存檔走 setDoc(merge:true),對 heroLevels(map)是深合併→新資料未提及的舊子鍵殘留(同 v3.15.57 playerBackpack 病灶,但 heroLevels 無字串版 heroLevels_s);倒退守門/跨槽合併算 maxHeroLv/totalHeroLv 時只用 _PLAYER_HERO_NAMES 過濾、未對帳 unlockedHeroes→雲端 heroLevels 殘留的高 Lv 幻影條目墊高雲端 maxLv,使 GM 救援還原後正確的本地存檔被誤判「最高等級倒退」(_dMaxLv 達 -5)而拒絕同步(unlockedCount 走陣列比、0 差不觸發,真正擋下的是 maxLv 那條)。',
      '★ v3.15.76【三處同口徑修正】以 unlockedHeroes(陣列;merge 對陣列整包取代、不累積污染)為「真正擁有」權威清單,heroLevels 僅計入確實在 unlockedHeroes 的英雄等級:① _fbSave 主文件守門 _recompS ② _fbSaveLive live/safe 槽守門 _effLv ③ _lxpsMergeSlots recompute(merged._dataSummary)。三處共用同一對帳邏輯。',
      '★ v3.15.76【診斷日誌】_fbSave 主守門加 console.warn(🔎 倒退核對 uid=…),印出雲端 heroLevels 幻影殘留數+最高 Lv+雲端/本地真實 maxLv 與擁有數,供老師核對特定 uid 的實際資料、確認倒退警訊是否為誤判。',
      '★ v3.15.76【安全】只去除「maxLv 被 heroLevels 幻影墊高」造成的誤判;unlockedCount(真英雄被刪/遺失)仍用 unlockedHeroes 陣列比對照常守門,真倒退擋得住,不會放行薄資料覆蓋。',
      '★ v3.15.76【版本鏈】4 GAME 同步點 v3.15.75→v3.15.76;_vers[index.html]/[game_changelog.js] 同步 v3.15.76。hero_db.js v3.15.72、world-boss.js v3.15.51、world-boss-ui.html v3.15.69 不變。本輪只改 index.html + game_changelog.js。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.56)。',
    ],
  },
  // v3.15.75 — 修正序號兌換(亂打/無效序號不再誤判成功)
  {
    ver: 'v3.15.75',
    date: '2026-06-22',
    brief: [
      '🔧【序號兌換修正】修正部分情況下「輸入錯誤或亂打的序號,卻顯示兌換成功」的問題。現在只要序號不存在或格式不對,都會明確顯示「查無此序號,請確認有沒有打錯」,不會再誤判成功,也不會發出任何獎勵。',
    ],
  },
  // v3.15.74 — 新增「特別挑戰題」(知識王第三欄,30題全對領大獎)
  {
    ver: 'v3.15.74',
    date: '2026-06-22',
    brief: [
      '🎮【新增「特別挑戰題」!打開「👑 知識王挑戰」就能看到第三欄】小英雄大對抗・遊戲知識 30 題,教你戰鬥基礎、怎麼讓英雄變強、還有各種好康獎勵在哪拿,學會了打關卡更輕鬆!',
      '🏆【30 題全對拿大獎】30 題「全部答對」就能領 <b>🔮 召喚水晶 ×10 + 🌈 SSR 隨機召喚卷 ×1</b>!每個帳號限領一次,但可以重複作答複習(題目順序每次都會打亂),答錯不扣分,慢慢來!',
      '🔔【還沒領的同學注意】只要大獎還沒領,「知識王挑戰」按鈕和第三欄都會有醒目的「獎勵未獲得」提示——快去挑戰把大獎帶回家!',
    ],
  },
  // v3.15.73 — 世界BOSS龍王護盾說明中文化 + 埃及寵物名修正
  {
    ver: 'v3.15.73',
    date: '2026-06-22',
    brief: [
      '🐉【世界BOSS龍王護盾說明修正】世界BOSS頁的龍王介紹裡,護盾元素原本顯示英文(earth/fire/dark/grass),現已全部改回中文(🪨土/🔥火/🌙暗/🌿草),需要的破盾剋制屬性也正確顯示。',
      '🐺【埃及寵物名稱修正】埃及寵物(荷魯斯之鷹/聖䗴神蟲/阿努比斯胡狼/托特聖䴉)在裝備畫面與英雄卡上的圖示原本顯示「undefined」,現已正確顯示寵物圖示。',
      '👥【好友名單顯示優化】好友卡上較長的暱稱原本會被「…」截斷,現已改成自動換行完整顯示;點開好友「詳細」時,能力資訊改為點開當下即時讀取最新資料,修正先前只有最先載入的好友能顯示能力、其他人一片空白的問題,讓暱稱與詳細能力都能一目瞭然。',
    ],
  },
  // v3.15.72 — 新 SR 英雄「偵探」上線 + 中毒/猛毒修復
  {
    ver: 'v3.15.72',
    date: '2026-06-22',
    brief: [
      '🕵️【新英雄「偵探」上線!一名 SR 天才少年偵探,專門封鎖、壓制敵人的招式】',
      '   ・🔍<b>天賦「縝密推理」</b>:偵探存活時,只要友方受傷,有機率讓「造成該次傷害的對手」<b>天賦失效 + 被查封</b>各 1 回合。',
      '   ・🕵️<b>S1「察覺蛛絲馬跡」</b>(被動):看穿敵人的套路!敵方<b>無法連續使用相同的技能或極限爆發</b>,只能改用其他行動。',
      '   ・👁<b>S2「名偵探的凝視」</b>:50% 機率<b>封印 1 名目標的極限爆發 2 回合</b>;若失敗則回收 2 點能量。',
      '   ・⚖<b>爆發「犯人就是——你！」</b>:消除目標全部有利狀態,使其受到<b>我方全體當前 HP 總合</b>的固定傷害(必中、不受屬性影響、對 BOSS 也有效),並當場「認罪」1 回合(無法行動且受到傷害 +100%)。',
      '   ・想入手偵探?和其他 SR 一樣——在召喚星空抽 SR、或通關貓空有機率解鎖。',
      '☠️【中毒/猛毒修復】修正「猛毒與各種特殊中毒/流血明明應該扣很多血,卻只扣一點點」的問題;現在會正確依各招式設定的傷害值扣血。',
      '🐉【平衡】中毒、出血對「BOSS」的每回合傷害調整為原本的 1/4,避免 BOSS 被持續傷害過快消耗(固定值傷害與山岳地龍王畏毒不受影響)。',
      '🔥【文字對齊】燃燒狀態說明對齊實際數值(普通 6HP、強力 9HP)。',
    ],
  },
  // v3.15.71 — 新 SR 英雄「鐵匠」上線
  {
    ver: 'v3.15.71',
    date: '2026-06-21',
    brief: [
      '🔨【新英雄「鐵匠」上線!一名 SR 鋼鐵匠師,召喚率與解鎖方式都和其他 SR 相同】',
      '   ・🔨<b>天賦「工匠魂」</b>:鐵匠存活時,依我方存活英雄裝備的<b>至寶總件數</b>,每件提升友方全體傷害(最高 +40%);自身受到致命一擊時,也以同等機率<b>以鋼鐵之軀硬撐不倒</b>(HP 留在 1)!裝備愈多、隊伍愈強。',
      '   ・⚔<b>S1「武器精煉強化」</b>:為全隊淬鍊兵刃,依攻擊值提升友方全體造成的傷害,並使友方全體<b>暴擊率 +30%</b>,持續 2 回合。',
      '   ・🛡<b>S2「防具精煉強化」</b>:為全隊鍛造甲冑,依攻擊值提升友方全體的減傷,並使友方全體<b>迴避率 +30%</b>,持續 2 回合。',
      '   ・🔨<b>爆發「裝備破壞奧義」</b>:以攻擊 650% 重擊 1 名對手(必中、無視有利),<b>擊碎並消除其全部有利狀態</b>,並使其造成傷害 -30%、受到傷害 +30%,持續 3 回合!',
      '   ・想入手鐵匠?和其他 SR 一樣——在召喚星空抽 SR、或通關貓空有機率解鎖。',
    ],
    items: [
      '★ v3.15.71【鐵匠 SR 三池接入】手動列入 ADMIN_ALL_HEROES(取得 SR 稀有度 + 進 rare_sr 召喚池 + 管理員擁有 + 收錄計數)、ADV_UNLOCKABLE_HEROES(貓空通關 50% 解鎖池)、_PLAYER_HERO_NAMES(存檔守門白名單)。因非 SSR 不進 SUMMON_RARE_HEROES 自動同步 IIFE,故三處皆手動。來源標走 _getHeroRarity fallthrough → SR + 非學生/日本/活動 → 自動標「🌌 異世界英雄」,零額外設定。',
      '★ v3.15.71【天賦「工匠魂」】新增 _blacksmithPct(side):鐵匠存活時 = min(40%, 我方存活英雄至寶總件數 × (2%+1%/天賦級));_twTreasureCount 於 _applyTaiwanTreasureToHero / _applyFriendTreasuresToHero 寫入(敵 AI 隊 undefined → 0,鬥技場無至寶 → 0 失效)。doDmg 兩扣血點(fixedDmg + 主路徑)各加「不倒」hook:鐵匠受致命傷依此機率 HP 留 1。',
      '★ v3.15.71【S1/S2 buff + 爆發 debuff】S1 _blkWeaponBuff(_pct=攻擊×(0.5+級×0.05)/100, _critUp=0.30)、S2 _blkArmorBuff(_pct=min(0.90,攻擊×(0.5+級×0.05)/100), _evaUp=0.30) 皆 filter+push 防去重殘留(基準攻擊50%·每升+攻擊5%·S2亦可升級);爆發 _blkWeak/_blkVuln(各 30%+5%/級, 3→4 回合)。execSkill + aiUseSkill 雙實作(鐵律 1.128,S2 aiUseSkill 補 _bkS2LvA 讀級);aiSkillScore 評分。',
      '★ v3.15.71【doDmg hooks】頂部評估區 3 hooks:防具迴避(target 帶 _blkArmorBuff._evaUp → 30% 迴避歸零,排除必中/無視有利)、攻方增傷(_blacksmithAtkBuffMult × (1+_blacksmithPct) 乘算 rawDmg)、受方修正(_blacksmithTgtMult,無視有利攻擊跳過減傷部分);暴擊計算加 S1 _blkWeaponBuff._critUp +30%。覆蓋 fixedDmg + 主路徑兩條路(鐵律 1.110)。',
      '★ v3.15.71【顯示 + 升級表】buffClass/buffName(_blkWeaponBuff🔨/_blkArmorBuff🛡)、statusName(_blkWeak/_blkVuln)、BAD_STATUS 加此 2 debuff;SKILL_UPGRADE_DEF(武器精煉強化 special_blk_weapon + 防具精煉強化 special_blk_armor 皆含 codex 顯示 case·攻擊×(50+級×5%))、BURST_UPGRADE_DEF(裝備破壞奧義 650→910% 乘算 + debuff 30→50% + dur 3→4)。',
      '★ v3.15.71【編組圖位 _teamFormAdjustObjPos 加 where 參數】分 grid(編組選單左列縮圖·hpick-adv/arena 兩呼叫點·包 getHeroThumbObjPos)/preview(focusHero 右半部詳情 + 戰鬥預覽):拘留者/科學發明家 grid-20 preview-20、電腦老師 grid-20 preview-10、機關王雙人組 grid0 preview-10;grid base 多為 center center(無%)→ 函式內視為 50% 再加偏移(負值往上露頭)。不動戰鬥卡/圖鑑/HERO_IMG_POS 本體。',
      '★ v3.15.71【hero_db.js 12 表 + 版本鏈】HERO_DB hp79(配點61×1.3 pre-multiplied,不吃 runtime ×1.3)/atk20/sp11/spd8 + AVATARS🔨 + HERO_IMGS鐵匠.png + HERO_IMG_POS + HERO_BIO(無 designer 官方 SR) + BURST_DB + HERO_LORE + HERO_TRAIT工匠魂 + BURST_GIF_DB(迅雷不及掩耳的攻擊.gif·刀劍+爆破·dur1400) + 分類/HEX/_TRAIT_LV_INFO。4 GAME 同步點 v3.15.70→v3.15.71;本輪改 game_changelog.js + hero_db.js + index.html;GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.51)。',
    ],
  },
  // v3.15.70 — 新英雄「電腦老師」上線 ＋ 英雄圖鑑稀有度收集進度
  {
    ver: 'v3.15.70',
    date: '2026-06-21',
    brief: [
      '💻【新英雄「電腦老師」上線!5 年 3 班 陳同學設計的 SSR 英雄】',
      '   ・🛡<b>天賦「防毒防火牆」</b>:受到任何不利狀態(含強力版)時,有 50% 機率完全免疫(每升 1 級 +10%,滿級 90%)!',
      '   ・📺<b>S1「螢幕廣播系統」</b>:接管全場螢幕,使敵方全體暈眩 1 回合無法行動(對 BOSS／菁英成功率減半)。',
      '   ・📝<b>S2「很難的五大任務攻擊」</b>:出 5 道高難度任務,對隨機目標連打 5 次(特技 80~120% 遞增),命中陷入燃燒 2 回合。',
      '   ・💻<b>爆發「系統還原」</b>:清除敵方有利與我方不利狀態,全體夥伴重新開機<b>滿血復活</b>!所有小怪直接關機倒下,菁英／BOSS／玩家英雄則受特技 600% 重啟攻擊。',
      '📊【英雄圖鑑頂端新增「稀有度收集進度」】',
      '   ・英雄圖鑑上方原本的「魔物圖鑑／寵物圖鑑」按鈕,改顯示你的<b>收集進度</b>:👑UR、SSR、SR、R 各「已解鎖／總數」一目了然!',
      '   ・(魔物圖鑑與寵物圖鑑仍可從主畫面的導航列進入)想看自己離全收集還差幾隻,打開英雄圖鑑就知道囉!',
    ],
    items: [
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.69(2026-06-21)— 🆔 名稱顯示隱私強化 ＋ ✏️ 暱稱框加寬
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.69',
    date: '2026-06-21',
    brief: [
      '🆔【名稱顯示更好認、也更保護隱私】',
      '   ・校內信箱的同學,排行榜上的代號改顯示信箱<b>末 3 碼數字</b>(原本大家都是「lsp********」分不出誰),更好辨識!',
      '   ・同學的真實姓名一律<b>遮住中間字</b>(例如「陳O彬」),保護個人隱私。',
      '   ・小博士、世界 BOSS、鬥技場排行榜,以及好友列表,通通套用一致的遮罩格式;完整姓名只有老師在後台才看得到。',
      '✏️【設定暱稱視窗與名稱框加寬】「設定暱稱」視窗變寬了,下拉選單不會再被擠出格子;左上角顯示自己暱稱的白色框也加寬+字體微縮,讓完整暱稱(班級座號/信箱末碼 + 自選組合)能完整顯示。',
    ],
    items: [
      '★ v3.15.69【email 遮罩改末 3 碼 index.html】_emailMaskPrefix:lsps 校內信箱(local 皆以 lsps 開頭如 lsps110137,遮前 3 碼=「lsp********」毫無辨識度)改取「末 3 碼數字」當代號(lsps110137→137);非 lsps(gmail 等)維持前 3 碼 + 遮罩。',
      '★ v3.15.69【_formatPlayerDisplayName 全面重寫 index.html】真名一律中間字遮罩(_maskFullName,陳煥彬→陳O彬)。分支:(A)displayName 已是「4 碼班級座號+中文真名」(如 5408陳煥彬)→ 拆碼 + 中間字遮罩(5408陳O彬);(B)合法遊戲暱稱 → 名冊回班級座號+暱稱(5408暱稱)、lsps 無名冊回末 3 碼+暱稱(137暱稱)、非 lsps 回 cla********@暱稱;(C)真名/空 → 名冊優先回班級座號+中間字遮罩全名(5408陳O彬)否則 _formatRosterLabel(5408陳同學),名冊查不到的真名 → email 前綴+中間字遮罩(137陳O彬)。修補原本「名冊查不到的真名」直接回原字串導致真名外洩。',
      '★ v3.15.69【所有排行榜+好友列表一律遮罩】世界 BOSS 排行榜(world-boss-ui.html _protectName)移除「GM 觀看顯示真名」adminShowReal 分支,所有觀看者(含 GM)一律走 _formatPlayerDisplayName 遮罩;邀請好友列表同步走中央函式。小博士排行榜(index.html)兩寫入點(weeklyQuiz + arenaWeekly)寫入雲端前即套 _formatPlayerDisplayName 遮罩(寫入時有 email,新資料即遮罩,舊資料隨同學作答自動更新)。鬥技場(arena.js _getCurrentUserInfo)displayLabel 改走中央函式(原名冊外 fallback 原始暱稱會洩真名)。好友面板(_getFriendLabel)委派中央函式。★ 完整姓名只在 GM 後台選單(admin_panel.js _getAdminPlayerLabel adminShowReal:true 保留)出現。',
      '★ v3.15.69【設定暱稱 modal + 暱稱框加寬 index.html】設定暱稱 modal max-width min(96vw,clamp(480,50vw,680)) → (540,58vw,800),下拉選單不溢出;左上角 #adv-user-name 框 max-width clamp(200,18vw,320) → (240,26vw,460)、font-size clamp(18,2.8vw,38) → (14,1.9vw,26),讓遮罩後較長暱稱完整顯示、版面不變。',
      '★ v3.15.69【版本鏈】本輪改 index.html + world-boss-ui.html + arena.js + game_changelog.js 四檔(index.html 最後上傳)。版本同步點:_GAME_LOADED_VERSION + _vers[index.html / world-boss-ui.html / arena.js / game_changelog.js] 全 v3.15.68→v3.15.69。hero_db.js 維持 v3.15.67、world-boss.js/adv_quiz_db.js/admin_panel.js/sw.js(CURRENT_BOOT_VER 不動)/hero_input.html 未改。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.49)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.68(2026-06-21)— 🏆 限定稱號系統 ＋ 🆔 名稱辨識度 ＋ 🎁 每日儲備上限
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.68',
    date: '2026-06-21',
    brief: [
      '🏆【限定稱號系統上線!達成成就才能解鎖的專屬✨稱號】',
      '   ・打開「設定暱稱」,形容詞和名詞選單最下方多了一區「✨ 限定稱號」!',
      '   ・<b>屠龍王者</b>(單場世界 BOSS 戰排名第 1)解鎖:屠龍的、救世主、屠龍者。',
      '   ・<b>任何一枚頂級獎章</b>解鎖:不敗的、傳奇的、王者的⋯ 以及 冠軍、大師、霸主、學神 等霸氣稱號!',
      '   ・還沒達成的稱號會顯示🔒和達成條件,快去挑戰解鎖吧!',
      '🆔【玩家名稱更好辨識了】',
      '   ・改過暱稱的同學,名稱前面會自動加上班級座號(例如「5202勇敢的小英雄」),讓大家和老師都看得出來是誰。',
      '   ・這樣排行榜、鬥技場、世界 BOSS 戰就算有人取一樣的暱稱,也分得清楚囉!',
      '🎁【世界 BOSS 每日儲備入場卷上限 5 → 10】每天最多可以儲備 10 張入場卷,衝排名更彈性!',
      '📚【英雄圖鑑經驗書排版修正】英雄詳情頁 EXP 下方的經驗書按鈕不再擠成一排跑出畫面,改成依階級分排,英雄簡介也不會再被擠壞。',
      '⬆️【連續吃經驗書升級視窗優化】一次吃很多經驗書連續升級時,只會留<b>最新(最高等級)</b>的確認視窗,不用一直按了!',
      '📖【新手教學小修正】能量說明改為「能量足夠時就可以使用技能」;狀態效果補充:不能動(暈眩/麻痺/魅惑/睡眠)、持續扣血(燃燒/出血)。',
    ],
    items: [
      '★ v3.15.68【限定稱號系統 index.html】暱稱詞庫新增 _NICK_ADJ_SPECIAL(屠龍的=wb_top1,不敗的/傳奇的/榮耀的/至尊的/黃金的/鑽石的/王者的/殿堂的/冠軍的=any_top_tier)+ _NICK_NOUN_SPECIAL(救世主/屠龍者=wb_top1,冠軍/大師/霸主/神話/學神/榮譽生/傳奇/王者=any_top_tier),與既有 _NICK_ADJ/_NICK_NOUN 零重複。新增 window._hasNickReq(req)(wb_top1→!!_medals 屠龍王者;any_top_tier→任一 _medals key ∈ _MEDAL_TOP_TIER)+ _nickReqHint。openNicknameModal:_init 偵測含限定詞、下拉各 append optgroup「✨ 限定稱號」(已解鎖→✨可選/未解鎖→🔒停用+條件)。_checkNicknameClean 詞庫併入限定詞(他人限定暱稱判合法、正常顯示不被遮罩)。_saveNickname 過 _checkNicknameClean 後加成就把關:選限定詞但 !_hasNickReq → bannerFX 擋下 return(防 DOM 竄改)。_medals/_MEDAL_TOP_TIER 與暱稱函式同 script 區塊可直接存取。',
      '★ v3.15.68【玩家名稱辨識度前綴 index.html】_formatPlayerDisplayName 改寫:暱稱非真名時 → lsps 在名冊回 _classSeatCode4+暱稱(「5202暱稱」,年班+座號2碼不含姓,個資保護);非 lsps / lsps 未填名冊回 _emailMaskPrefix+「@」+暱稱(「cla********@暱稱」)。暱稱為真名或空 → 維持原名冊標籤保護。新增 window._classSeatCode4(名冊 class 正則年班+座號 + seatNo/seat 補 2 碼)、_emailMaskPrefix(local 前 3 碼 + 8 星號)、_isLspsEmail。_getAdminPlayerLabel 無名冊 adminShowReal 分支非 lsps 補 email 遮罩前綴。中央函式自動傳遞至 world-boss-ui.html 排行榜 / admin_panel.js / arena.js。',
      '★ v3.15.68【世界 BOSS 每日儲備入場卷上限 index.html + world-boss-ui.html】index.html WB_TICKET_MAX 5→10。world-boss-ui.html:彈窗持有/剩餘張數 /5 → /10、最多持有 5 張 → 10 張;每回合場次標籤「🎫 GM 補償場次」「🎟️ 入場券場次」一律改「🎁 每日儲備場次」、排行榜累計徽章合併 GM補償(wbBonusGrants)與每日入場券(wb_entry_ticket)兩來源為單一「🎁 含N場每日儲備」(N=bonusBattleCount+bonusTicketCount)。後端兩系統(playerBackpack.wb_entry_ticket 每日儲備 / wbBonusGrants GM 補發)仍各自獨立、GM 工具分開管理,僅顯示文案統一。',
      '★ v3.15.68【英雄圖鑑經驗書排版 index.html】英雄詳情頁 EXP 下方 6 顆經驗書按鈕原 inline-flex 往右溢出擠壞英雄簡介。改:外層包 flex-wrap 容器(max-width:448px),各階級(經驗值之書/精裝版/豪華典藏版)間插條件式 flex-basis:100% 換行元素 → 依階級最多疊 3 排不再溢出。為避免大段 template literal(含跳脫雙引號 + 變數插值)整塊替換風險,採無雙引號錨點窄注入 4 處;按鈕原 margin 保留(不影響不溢出結果)。',
      '★ v3.15.68【連續升級彈窗只留最新 index.html】_showLevelUpSequence 開頭(空陣列守門後)加 移除既有 _levelup-ov overlay,連續吃經驗書多次呼叫本函式時新彈窗移除舊的,只留最新最高等級給玩家確認。點數早已加上,彈窗僅告知。',
      '★ v3.15.68【編組頁英雄圖 Y 微調 index.html】新增 _teamFormAdjustObjPos(name,baseObjPos)(僅編組頁專用,getHeroObjPos / HERO_IMG_POS 本體不動):拘留者/科學發明家 Y-20%、機關王雙人組 Y-10%(負值往上露頭)。套用編組頁左側列表 .hf-illus + 右側預覽(typeof 守門)。戰鬥卡/圖鑑/其他頁面不受影響。',
      '★ v3.15.68【新手教學文字修正 index.html】第②章能量「達 3 即可使用 S1」→「能量足夠時就可以使用技能」(技能費用依英雄而異,非固定 3);狀態效果「😵暈眩（不能動）」→「暈眩 / 麻痺 / 魅惑 / 睡眠（不能動）」、「🔥燃燒（持續扣血）」→「燃燒 / 出血（持續扣血）」。',
      '★ v3.15.68【版本鏈】本輪改 index.html + world-boss-ui.html + game_changelog.js 三檔(index.html 最後上傳)。版本同步點:_GAME_LOADED_VERSION v3.15.67→v3.15.68、_vers[index.html] v3.15.67→v3.15.68、_vers[world-boss-ui.html] v3.15.61→v3.15.68、_vers[game_changelog.js] v3.15.67→v3.15.68。hero_db.js 維持 v3.15.67、world-boss.js/adv_quiz_db.js/arena.js/admin_panel.js/sw.js(CURRENT_BOOT_VER 不動)/hero_input.html 未改。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.48)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.67(2026-06-21)— 🤖 新增學生設計英雄「科學發明家」
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.67',
    date: '2026-06-21',
    brief: [
      '🤖【新英雄登場:科學發明家(SSR)】由 5 年 4 班 楊同學 設計!一位用「發明」改變戰局的天才!',
      '   ・💊<b>天賦「發明家的堅持」</b>:免疫「查封」(物品永遠不會被封鎖);每當自己使用發明物品卡,額外治療當前血量最低的夥伴。',
      '   ・🔬<b>技能①「即刻發明」</b>:從 6 種新發明裡挑選 3 種,立刻製造成物品卡放進背包,並可<b>再行動一次</b>!',
      '   ・💡<b>技能②「發明家的靈感」</b>(被動):場上任何人使用技能或爆發時,科學發明家都有機率<b>靈光一閃,多得 1 張新發明卡</b>。',
      '   ・🧬<b>爆發「醫學界的發明奇蹟」</b>:變賣最值錢的物品卡換能量,讓<b>全體夥伴回滿血(可復活)並無敵 1 回合</b>,還讓最強的夥伴強力增傷!',
      '   ・🎒<b>6 種新發明物品卡</b>:全效治療劑(全體治療+護盾)、淨化血清(全體治療+解不利)、戰術強化劑(強力增攻+普攻回能)、劇毒煙霧彈(敵全體強力中毒+消有利)、高能光束槍(單體必中重擊+強力麻痺)、反應力場(全體無敵+受擊反傷)。',
    ],
    items: [
      '★ v3.15.67【新增學生設計英雄「科學發明家」(5年4班 楊寓如)】資料層 hero_db.js 12 表(HERO_DB hp78=配點60×1.3/atk5/sp20/spd15、S1即刻發明c5主動、S2發明家的靈感c0被動、BURST 醫學界的發明奇蹟、TRAIT 發明家的堅持🔧、BIO designer、BURST_GIF 基因結構.gif dur2730、AVATARS🤖、IMG/POS/LORE/HEX/CATEGORIES);邏輯層 index.html 完整實作(技術細節見 index.html 內 _vers 版本註解):①新發明物品卡子系統 6 卡(INVENT_CARD_DEFS+_makeInventCard 鎖 inventorSpv+_grantInventCard/_useInventCardFlow/_applyInventCard side-agnostic;玩家走用卡流程,AI 不主動使用 invent 型);②S1 即刻發明(玩家 6 選 3 modal、AI 隨機 3 → 生成卡替換非裝備槽保留裝備卡 + 再行動;skillCost Lv5 消耗-1/Lv10-2);③S2 發明家的靈感(execSkill/aiUseSkill/_runBurst 三處 _inventInspirationTrigger,任意角色用技能/爆發雙方各自發明家 20%+5%/級 cap95% 生成);④天賦(addStatus 查封免疫 + 用卡治療最低 HP 友方 spv75%+10%/級);⑤爆發(賣最高卡→能量+全體回滿復活+無敵+首席增傷);execAtk 卡③回能 hook(鐵律1.207例外)+ doDmg 卡⑥反傷 hook(仿空間果實頂部評估,鐵律1.110);SKILL/BURST_UPGRADE_DEF + 生成器B special_invent_create + SUMMON_RARE_HEROES + STUDENT_DESIGNER_HEROES(lsps110048,自動套 _STUDENT_DESIGNED_HERO_SET → 圖鑑🎨)。',
      '★ v3.15.67【版本鏈】hero_db.js + index.html + game_changelog.js 三檔同改(index.html 最後上傳)。版本同步點:_GAME_LOADED_VERSION v3.15.66→v3.15.67、_vers[index.html] v3.15.66→v3.15.67、_vers[hero_db.js] v3.15.65→v3.15.67、_vers[game_changelog.js] v3.15.66→v3.15.67。world-boss.js/world-boss-ui.html/adv_quiz_db.js/arena.js/admin_panel.js/sw.js(CURRENT_BOOT_VER 不動)/hero_input.html 未改。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.47)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.66(2026-06-21)— 🎨 英雄來源標註補完 ＋ ⚡ 新手教學能量說明更正
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.66',
    date: '2026-06-21',
    brief: [
      '🎨【英雄圖鑑來源標註補完】',
      '   ・<b>喚龍使‧蜜鶴林</b>、<b>維京海盜船長</b>、<b>武器精靈</b>現在圖鑑會正確標示「🎨 學生設計英雄」。',
      '   ・<b>法老王</b>、<b>埃及豔后</b>新增「🏜 埃及關卡機率獲得」來源標示,讓大家知道牠們是在埃及關卡有機率獲得的英雄。',
      '⚡【新手教學「能量」說明更正】',
      '   ・修正第 ② 章「戰鬥系統」裡<b>講錯的能量規則</b>:之前寫「普通攻擊可以賺能量」是錯的!',
      '   ・正確規則:👊<b>普通攻擊免費,但不會回復能量</b>;每個<b>新回合開始全隊自動 +3 能量</b>🔷;☕休息 +1;🛒賣物品卡可得販賣能量;部分天賦/技能/爆發也會回能量。',
    ],
    items: [
      '★ v3.15.66【英雄來源標註補完 index.html】① 學生設計英雄:喚龍使‧蜜鶴林(5年3班龎苡睿)/維京海盜船長/武器精靈 先前未列入 STUDENT_DESIGNER_HEROES email-map → 圖鑑一覽表/詳情頁無「🎨 學生設計英雄」標。修:擴充 window._STUDENT_DESIGNED_HERO_SET 建構 IIFE,於 Object.keys(STUDENT_DESIGNER_HEROES) 之後 .add 此 3 名(此 set 僅供圖鑑標籤判定,3 隻皆 SSR 故自動套用,不影響設計師區塊/GM 補發 email-map)。② 埃及來源標:法老王/埃及豔后(EGYPT_EXCLUSIVE_HEROES)新增「🏜 埃及關卡機率獲得」標,於 grid-card 稀有度 IIFE(L≈103100)與 detail 稀有度 IIFE(L≈103748)各加 _eg 判定 + early-return 標籤 div(色 #f3c97a 沙金,emoji 🏜 對齊魔物圖鑑「🏜 埃及探險」,仿 JAPAN_EXCLUSIVE_HEROES「🗾 日本關卡機率獲得」雙處模式,grid 20px/detail 24px)。',
      '★ v3.15.66【新手教學能量說明更正 index.html】_showNewbieGuide 第 ② 章「戰鬥系統」render(L≈91192)能量機制文字與戰鬥引擎對齊。原誤植 4 處全改:① 普通攻擊 desc「賺取能量🔷」→「但不會回復能量🔷」;② 累積區「剛開場」說明改列正確來源(開場 0 能量;👊普攻 +0、☕休息 +1、🛒賣物品卡得販賣能量、部分天賦/技能/爆發回能量);③「攻擊幾次:」標籤 →「每回合 +3:」;④「能量 3 → 可使用 S1」→「每個新回合開始自動 +3 能量🔷 → 達 3 即可使用 S1」。權威定義(對照戰鬥碼):回合開始 G.energy[next.side]=min(10,+3)、普攻不耗能量、休息 +1、賣物品卡得販賣能量、外加恢復能量的天賦/技能/爆發。',
      '★ v3.15.66【版本鏈】本輪只改 index.html(來源標註 + 教學文字)+ game_changelog.js。版本同步點:_GAME_LOADED_VERSION v3.15.65→v3.15.66、_vers[index.html] v3.15.66、_vers[game_changelog.js] v3.15.66;_vers[hero_db.js] 維持 v3.15.65(本輪未改 hero_db.js)。hero_db.js v3.15.65、arena.js v3.15.37、admin_panel.js v3.15.40、world-boss.js v3.15.34、world-boss-ui.html v3.15.21、adv_quiz_db.js、sw.js(CURRENT_BOOT_VER 不動)未改。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.46)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.65(2026-06-20)— ✏️ 修正熔岩巨人/拘留者圖鑑缺設計師資訊
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.65',
    date: '2026-06-20',
    brief: [
      '✏️【修正圖鑑沒顯示設計學生的問題】',
      '   ・<b>熔岩巨人</b>(5 年 1 班 姜同學)與<b>拘留者</b>(5 年 1 班 彭同學)的圖鑑詳情頁,先前<b>沒有顯示「由 ⃝⃝ 設計」</b>的設計師資訊,現在補上了!',
      '   ・其他學生設計英雄不受影響(本來就正常顯示)。',
    ],
    items: [
      '★ v3.15.65【圖鑑設計師資訊修復 hero_db.js】根因:圖鑑詳情頁(index.html L≈103781)以 HERO_BIO 條目的「bio.designer 是否存在」作為「顯示設計師區塊」的 gate;_getDesignerLabel(反查 STUDENT_DESIGNER_HEROES→fullName 遮罩成「五年1班姜O晟同學」)僅負責美化標籤,但前提是 bio.designer 存在才會進入該區塊。熔岩巨人(v3.15.59)與拘留者(v3.15.64)新增時 HERO_BIO 只寫了 role/trait/hobby/quote,漏了 designer 子欄位 → 整塊不渲染。修:HERO_BIO 給此 2 隻補 designer:{class:"5年1班",name:"姜同學"/"彭同學",year:2026}。node 交叉比對(37 隻學生英雄 × HERO_BIO.designer)確認補後 0 缺。',
      '★ v3.15.65【版本鏈】4 GAME 同步點 v3.15.64→v3.15.65;_vers[index.html]/[hero_db.js]/[game_changelog.js] 同步。實質改 hero_db.js(HERO_BIO 2 處 designer);index.html 僅版本鏈。world-boss.js/world-boss-ui.html/adv_quiz_db.js/arena.js/admin_panel.js/sw.js/hero_input.html 未改。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.45)。',
    ],
  },
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
];