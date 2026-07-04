// ════════════════════════════════════════════════════════════════════════
//  game_changelog.js  —  LXPSGAME 更新日誌
//  最後更新:2026-07-04  / 目前主程式版本:v4.10.0(寵物同萌正式上線:全服上線禮+兩階段教學+逐槽位每日鎖定+圖鑑三改版+戰鬥寵物稀有度出現率)
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
  // v4.11.0 — 🐾 寵物小屋生氣表情(去背圖+💢)+🏪 商店販售清單分類索引標籤+🐾 寵物教學改「進到關卡主頁才彈」
  {
    ver: 'v4.11.0',
    date: '2026-07-04',
    brief: [
      '😊【寵物小屋:餵對、摸對會露出開心表情!】在寵物小屋餵對主食、或按住搓揉撫摸完成時,寵物會短暫換上「開心」的表情圖(1.5 秒後自動變回原本的樣子)!',
      '💢【餵錯、亂戳會生氣!】餵錯食物、或只是戳戳點點寵物,牠會冒出「💢 生氣符號」表示不開心(1.5 秒消失)——先用原本的樣子加上生氣符號提醒你要好好照顧牠喔!(專屬的「不悅」表情圖之後會再補上)',
      '🏪【商店大改版:左側商品加分類標籤!】不可思議超商的商品清單左側新增「🔮 召喚 / 💪 強化 / 🐾 寵物 / ♻️ 重置 / 🖼️ 肖像」五個分類標籤,點一下就只看該類商品,每個標籤還會顯示該類有幾樣,找東西更快!(右側背包和賣出功能完全不變)',
      '🐾【寵物教學時機修正:進到關卡主頁才出現!】之前寵物的第一次教學有時候太早跳出來(你還沒真正進到關卡選擇畫面),害你錯過「跟著點一次」的教學和第一次召喚。現在改成「確定進到關卡主頁、畫面都準備好」才會出現,不會再被登入或其他視窗蓋住、也不會錯過囉!',
    ],
    items: [
      '★ v4.11.0【寵物小屋互動表情·index.html】window._petHouseEmote(slotIdx,mood) 改雙分支:mood="happy"→短暫把該槽 #_ph-img-{slotIdx} 內 <img> 換成 _petHappyUrl(pn)=寵物名_開心.webp(記憶體記 _petBaseSrc·_PET_EMOTE_MS=1500 後還原·onerror 立即還原去背圖不破圖);mood="sad"/"angry"→★不換圖★維持去背圖,在 wrap 疊 span._ph-angry-sym(💢·position:absolute top:0 right:4%·一次性注入 @keyframes _phAngryPop·連戳先移除舊符號防疊加·wrap 若 static 暫設 relative 到時還原·_PET_EMOTE_MS 後移除)。四咽喉點沿用:_petHouseFeed 餵對→happy/餵錯→sad·_petHouseStrokeReward 撫摸完成→happy·_petHouseStrokeEnd 戳戳→sad。_petSadUrl(寵物名_不悅.webp)保留備用,之後補「不悅」專屬圖時把 sad 分支改走換圖即可。',
      '★ v4.11.0【商店販售清單分類索引標籤·index.html】新增 window._SHOP_CAT_DEFS(召喚/強化/寵物/重置/肖像 5 類)+window._shopProductCat(p) 依 id 判定單一主分類:肖像=BACKPACK_ITEM_DEF[id].type="portrait" 或 id 尾綴 _portrait(涵蓋 priest_portrait_dawn 等非尾綴命名)、寵物=id 開頭 pet_food、重置=id 含 reset、召喚=summon_crystal、其餘=強化。#shop-main「🏪 商品」標題下插入 sticky #shop-cat-tabs 分頁列(_renderShopProducts 每次重繪·顯示各類商品數·當前類金橙高亮·空類 disabled);_shopBaseProducts 依當前 _shopActiveCat(預設 summon)過濾,pinTop 召喚水晶/當日特價排序在類內維持;window._shopSetCat(cat) 切換+商品區 scrollTop 回頂。右側背包/賣出完全不動。分佈:召喚1/強化6/寵物3/重置5/肖像36=共51件。',
      '★ v4.11.0【寵物第一階段聚光教學 _petT1 觸發時機修正·index.html】老師回報:教學在玩家還沒真正進到關卡主頁就彈出,害玩家錯過點擊教學+首次召喚。根因:舊觸發輪詢(登入後 9 秒起)只檢查 adventure-overlay 非 display:none,但該 overlay 是常駐底層容器,登入/雲端載入途中就會 display:block→誤判「在關卡頁」而提前彈,再被登入閘/會員資料/救援說明等前置彈窗蓋掉。修法三處:①openAdventureOverlay 通過所有硬守門(uid 解析/雲端驗證/二段密碼閘門皆在早退之後)真正 ov.style.display=flex 顯示關卡頁的成功點,設正向旗標 window._petT1EnteredLevelPage=true;②觸發輪詢改「正向就緒」門檻:必須 _petT1EnteredLevelPage===true + _cloudLoadDone===true + 關卡頁顯示中 + 不在戰鬥 + 無任何前置/其他彈窗(_petT1Blocked),且以上條件連續穩定 2 拍(settle)才啟動(防登入/雲端載入轉場瞬間誤觸)·上限 80→120 拍;③_petT1Blocked 黑名單補入 login-gate-modal/_member-profile-modal/_member-hub-modal/_rescue-guide-modal/_audit-ov 等登入首登前置彈窗。純觸發時機收斂·教學內容/步驟/完成旗標(petTut1Done)一律不動。',
    ],
  },
  // v4.10.0 — 🐾 寵物同萌正式上線:全服上線禮+兩階段教學(聚光引導/馴養教學送五色鳥)、每日互動改「逐槽位」鎖定、圖鑑三改版、戰鬥寵物稀有度出現率
  {
    ver: 'v4.10.0',
    date: '2026-07-04',
    brief: [
      '🎁【寵物同萌 全服上線禮!】為慶祝寵物系統正式全面開放,每位小英雄登入就自動獲得「🎟️ 隨機寵物召喚卷 ×1」和「🍖 高級寵物飼料 ×10」!每人限領一次(換平板、換瀏覽器都不會重複領),快去召喚你的第一隻寵物吧!',
      '👆【全新聚光教學,一步一步帶你玩!】第一次來到關卡選擇頁,畫面會變暗、只亮起你要按的按鈕,還有 👆 手指指給你看:帶你進寵物小屋 → 翻開寵物圖鑑 → 用上線禮的召喚卷召喚第一隻寵物 → 告訴你飼料在「🏪 不可思議超商」買得到!右下角隨時有「⏭ 跳過教學」,看過一次就不會再出現。',
      '🐦【每日首戰馴養教學:五色鳥送給你!】現在改成在「冒險戰鬥」中學馴養:每天第一次進關卡戰鬥,戰鬥教學結束後會出現馴養教學——一隻可愛的「五色鳥」會停在先行動的英雄身邊,輪到他時按「🐾 馴養」,教學不會用掉你的飼料、答案直接標 ⭐ 告訴你、保證馴養成功!第一次要看完,之後每天可以選「這次跳過」或「以後不再顯示」。已經有五色鳥的同學一樣可以練習,不會重複獲得。(所以第一次進小屋不再直接送五色鳥囉,改成教學獲得更好玩!)',
      '🔒【每日夥伴鎖定改「一個位置一隻」!】小屋鎖定規則更自由:改成「每個草蓆位置」每天各自綁定一隻寵物——某個位置開始互動(撫摸/餵食/玩耍其中一種)就鎖住那個位置,但其他空位還是可以請「今天還沒互動過」的寵物來玩!已鎖定的位置會掛「🔒 今日夥伴」標籤,每天早上 8:00 全部重置。還有:只要今天還有寵物沒互動完,關卡頁的「🐾 寵物」按鈕會亮出「🐾 今日互動!」小提醒!',
      '📖【寵物圖鑑三大改版!】①已馴養的寵物,卡片圖片「左上角」直接掛「🎓 已馴養」綠標,一眼看出哪些是你的!②已設定跟隨的寵物,卡片名字下方直接顯示「🤝 跟隨:英雄名」!③「選擇跟隨英雄」選單全新改版:和龍王戰替補選單一樣,有英雄縮圖、⚔💚🌀🛡 主分類按鈕、UR/SSR/SR/R 稀有度按鈕、還能用「🔍 條件搜尋」找有特定技能效果的英雄!',
      '⚔【戰鬥出現的寵物大改版!】戰鬥中出現寵物(答題獎勵/動物學家召喚)時:①圖片會標示「🎓 已馴養」或「✨ 未馴養」②所有寵物依稀有度有不同出現率:SSR=15%、SR=30%、R=55%,每次出現都是獨立機率、不會偏心「還沒收錄的」——高稀有度寵物保持真正的稀少感!③出現「已馴養」的寵物不會重複馴養,但攜帶牠出戰可以提升好感度 +1(每場戰鬥每隻限一次)!動物學家召喚的寵物也一樣照稀有度出現。',
      '💬【小屋提示視窗不再擋住寵物!】戳戳寵物生氣的提示、撫摸完成的提示,通通縮小約 20% 並移到畫面「最右下角」,不會再蓋住寵物圖片、也不會擋到下面的食物清單!',
      '🌌【五色鳥不佔召喚機率!】五色鳥改由馴養教學必定獲得,所以召喚星空和寵物召喚卷的寵物池都不會再出現五色鳥——你的每一次召喚機會都留給其他 27 隻寵物!',
    ],
    items: [
      '★ v4.10.0【全服上線禮·index.html】_fbClaimGlobalRewards 讀取失敗不再早退,並於有效獎勵清單前端硬編碼注入 pet40_launch_v4100(pet_summon_ticket×1+pet_food_adv×10·_petSysOpenForMe 守門):防重複沿用既有 globalRewardClaims/{uid}_{rid} transaction create-only 認領文件(UID 雲端權威·免疫三槽合併復活/跨裝置重領);領取即時 backpackAdd 進記憶體+_grClaimLog 供 v3.17.8 登入回溯對帳,免 GM 在後台手動建立。同一次主檔讀取順讀 petTut1Done/petTut2Seen/petTut2Off 三旗標存 window._petTutCloudFlags(零額外讀取);module block 新增 window._fbSetPetTutFlag(白名單三欄位·setDoc merge:true self-write 免改規則)。',
      '★ v4.10.0【第一階段聚光引導 _petT1·index.html】首次進關卡選擇頁(登入後 9 秒起輪詢·避開 style-onboarding/練習營/續戰/全體獎勵通知/GM獎勵等彈窗)自動啟動:4 塊遮罩板挖洞聚光(只有目標點得到)+金框脈動+👆手指+提示框(viewport clamp 不出畫面·iPad 邊緣必點得到);步驟=上線禮資訊卡→🐾寵物鈕(桌機 adv-nav-pet-btn/手機 nav 自動擇一)→📖圖鑑桌鈕→🎟️召喚卷使用鈕(_pet-ticket-use-btn·等券數減少且慶祝視窗 _pet-ticket-celebrate 關閉才前進)→🍖飼料資訊卡(提及 🏪 不可思議超商)→「← 返回」(_pet-page-close-btn)回小屋;右下 ⏭ 跳過教學永遠在場(z-15020·離邊 14px),每步 5 秒 watchdog 找不到目標自動跳步、任何例外自動收尾絕不卡死;完成/跳過寫 petTut1Done(localStorage per-uid+雲端旗標)不再出現;完成後若小屋開著自動補跑既有小屋互動教學(_petT1WantHouseTut 延後接力)。',
      '★ v4.10.0【第二階段馴養教學 _petT2·index.html】小怪戰啟動點(advStartMiniBattle 教學觸發區塊後·教學已完成的老玩家也觸發)呼 _petT2Arm:輪詢等戰鬥教學(_tutorialActive/_tut-prompt/_tut-dim)完全結束後彈教學視窗(z-13900·守門:寵物系統開放/冒險模式/非世界BOSS=鐵律1.203/今日未彈/未永久關);首次只有「🐦 開始教學」,petTut2Seen 之後多「這次跳過」「以後不再顯示」(petTut2Off 永久關·仍可自行按🐾馴養);彈出即記今日鍵(台灣 8:00 換日)不重複騷擾。開始教學=行動序第一位存活玩家英雄暫時換裝五色鳥(prevEquip 暫存·舊裝 onRemove)→輕量聚光 #b-tame(金框+👆+提示·僅該英雄回合顯示·戰鬥結束 watchdog 自動收尾還原);馴養鏈四處教學分支(guard e._tut):_advTameEligible 教學英雄一律 eligible(五色鳥已馴養也放行·免飼料·免每回合限制)、_advOpenTameMenu 只列高級飼料一列標「🎓 教學體驗·不消耗」、_advTameQuizOpen 免飼料守門+正解加 ⭐ 綠框直接提示、_advDoTame 不扣飼料+必定成功+已馴養不重複 _petRecordTame(只播特效)+收尾 _petT2Complete(寫 seen 旗標·新馴養留鳥出戰/已馴養還原原攜帶·雙版完成提示);新馴養來源標 tutorial_tame 入帳本。',
      '★ v4.10.0【逐槽位每日鎖定·index.html】取代 v4.9.0「三夥伴一次鎖」:新增 _petHouseSlotLock/_petHouseLockSlot/_petHouseAskLockSlot(單寵確認視窗 z-9650·含 v4.9.0 legacy lock 陣列一次性遷移到 lockSlots);每槽首次互動(撫摸/玩耍/餵食任一)先確認→鎖定「該槽」寵物,其他未鎖/空槽仍可自由入住與更換(教學結束後可用剩餘槽位補排「還沒互動過」的寵物);餵食拖曳改在放下咽喉點 _petHouseFeed 逐槽判定(起點放行拖曳);_petHousePickResident/回家鈕改「該槽鎖定才擋」;鎖定槽卡左上掛「🔒 今日夥伴」chip;資料掛 _petHouseDaily.lockSlots 隨 petHouseDaily_s 上雲(非同日採信當日雲端·同日逐槽聯集防換裝置重挑);舊三函式 _petHouseLockInfo/LockToday/AskLock 保留未刪(誤刪是大忌)。新增 _petHouseHasPendingToday/_petNavBadgeRefresh:今日尚有可互動寵物(已鎖槽未完成三互動、或有未互動寵物且尚有可安排槽位)→ 關卡頁 adv-nav-pet-btn 上方浮「🐾 今日互動!」金色 chip、手機 nav 寵物鈕掛紅點;掛入 _applyPetSysGate 隨 _syncMobileNav 500ms 週期自動刷新。',
      '★ v4.10.0【寵物圖鑑三修·index.html】①_buildPetPage 已馴養卡:圖片左上加「🎓 已馴養」綠標(_tamedTL·稀有度徽章維持右上/Lv 徽章維持左下不衝突) ②已設 followTo 的卡片名字下方加「🤝 跟隨:英雄名」(_followLine·詳情頁本就顯示) ③跟隨英雄選單 V2(_petPickFollowHero 函式名不變·呼叫點零改動;舊版改名 _petPickFollowHeroV1 保留未呼叫):仿龍王戰替補選單=篩選列(全部/⚔傷害/💚回復/🌀控場/🛡坦克/🎲其他/UR/SSR/SR/R/🔍條件搜尋)+英雄縮圖格(HERO_IMGS+getHeroThumbObjPos+_teamFormAdjustObjPos grid 口徑·跟隨中✅/現有寵物=替換提示);新增 _petFollowHeroPass(判定口徑鏡射 _wbSwapHeroPassFilter=主圖鑑同款)+doCondSearch 加 petfollow 分支(_petFollowFilterKey=cond→重繪)。',
      '★ v4.10.0【戰鬥寵物出現機制·index.html】新增 window._PET_APPEAR_RATE={SSR:0.15,SR:0.30,R:0.55}+window._petRollByRarity(pool,n):先擲稀有度層再於層內均勻抽 1(空層依剩餘層機率重新正規化·同批去重·排除五色鳥);每次出現皆獨立機率、完全不設「優先未收錄/未馴養」加權(高稀有度保持真正稀少感)。套用三處:答題獎勵 get_pet(原均勻抽全池)、動物學家爆發 AI 路徑 picks2、玩家路徑 picks(原 shuffle 均勻取 4)。出現視窗標示:_advShowPetTargetPicker 寵物卡加稀有度+_petTameBadgeHtml(🎓已馴養綠/✨未馴養琥珀)+已馴養說明行;_showBurstEquipSequence 標題同步加徽章。攜帶已馴養寵物→好感+1:新增 _petCarryAffOnce(每場每寵限 1 次防動物學家連放刷好感·G._petCarryAffGiven·+1 好感+💖popup+toast+存檔),掛 _advFinishPetPick 裝備完成點與動物學家序列裝備 onclick;戰鬥馴養鈕對已馴養寵物本就不顯示(不重複馴養✅)。',
      '★ v4.10.0【五色鳥退出召喚池+首入小屋改版·index.html】_petPoolSSR/_petPoolSR/_usePetSummonTicket 三處池 filter 加 pn!==五色鳥(教學必得·不佔玩家抽取其他寵物的機率;_petRollByRarity 亦排除);_petMaybeFirstTutorial 移除 v4.9.0 house_first_gift 自動送鳥區塊(改教學獲得;已領過的帳號資料不動),_petT1 進行中掛 _petT1WantHouseTut 延後小屋教學防兩套互蓋;_petHouseTutorial intro 第 4 步改條件式:已有馴養寵物→入住引導/一隻都沒有→引導先去戰鬥馴養(教學送五色鳥)或用召喚卷(cute/premium 雙版·鐵律 1.232)。',
      '★ v4.10.0【小屋提示視窗右下縮小·index.html】新增 window._phHintToast(fixed right:12px·bottom:calc(34vh+14px) 錨在食物清單正上方·字 44→35px 整體縮約 20%·max-width min(480px,72vw)·例外 fallback 原 toast);戳戳生氣提示與撫摸完成提示(_petHouseInteract pat 分支)改走此版,玩耍提示維持原位。',
      '★ v4.10.0【驗證與版本】index.html 全部 inline script 通過 node --check、零孤立代理字元;admin_panel.js 通過檢查、0 個真正可選串接(?.)。七點版本同步 → v4.10.0;GAME_CHANGELOG 維持 20 筆(移除最舊 v3.27.0)。本輪改 index.html＋admin_panel.js(僅版號)＋game_changelog.js;hero_db.js 內容未改、維持 v4.5.0 免重傳,世界BOSS兩檔維持 v4.8.0 免重傳。⚠ 上線禮/教學旗標為 self-write players 欄位,免改 firestore.rules。',
    ],
  },
  // v4.9.0 — 🐾 寵物系統大更新:首入送五色鳥+兩段教學、每日夥伴鎖定(早上8:00重置)、飼料分類頁籤、圖鑑修正、iPad寵物鈕修正、寵物「相遇/收錄馴養」全站語義重定義+召喚改「未馴養」口徑、小屋體驗五修(桌鈕/三鈕同列/撫摸回饋/鬥技場禁寵/躲貓貓提示泡泡)
  {
    ver: 'v4.9.0',
    date: '2026-07-04',
    brief: [
      '🐦【第一次進寵物小屋送你一隻寵物!】現在第一次走進寵物小屋,會自動獲得可愛的「五色鳥」!教學也變得更貼心:先帶你把五色鳥「請進小屋入住」,入住完成後才開始教你撫摸、餵食、玩耍——一步一步跟著做就對了!',
      '🔒【開始互動前,先確認今天的夥伴!】每天第一次要和寵物互動(撫摸/餵食/玩耍)時,會先跳出確認視窗,列出今天入住的 3 隻寵物問你「今天要和牠們一起玩嗎?」——按下「✅ 開始互動」之後,今天就不能再更換入住寵物囉!要等到隔天「早上 8:00」互動次數重置後才能換新夥伴(每日互動的重置時間也統一改為早上 8:00)。',
      '🍽【飼料區大改版:分類頁籤!】小屋下方的「動物主食大百科」改成清楚的分類頁籤(🌱植物甜食/🐛蟲/🍖肉/🐟水產/✨特殊),一次看一類、字變大、拖出來的飼料圖示也更大!最重要的是:以前在 iPad 上按不到的「糞球」等最下排飼料,現在切到分類就一定點得到、拖得到!',
      '📖【寵物圖鑑不再被小屋蓋住!】在寵物小屋按左邊桌上的大書本翻開寵物圖鑑時,圖鑑會好好地顯示在最上層,不會再被小屋畫面蓋住看不到了!',
      '📱【iPad 首頁「🐾寵物」按鈕消失修正!】部分 iPad 因為校園網路不穩,首頁下方的「寵物」按鈕會整節課不見——已經修好了!就算網路暫時讀不到設定,寵物按鈕也會正常顯示,還會自動重試連線。',
      '🌌【召喚出的寵物改為「未馴養」寵物!】召喚星空 SSR/SR 與「隨機寵物召喚卷」的判定統一修正:只要是「還沒馴養」的寵物都有機會召喚到(以前圖鑑看過就會被排除,害你的召喚機會變少)!要等該稀有度的寵物「全部馴養完成」,才會轉成寵物訓練書/頂級飼料。',
      '🏠【寵物小屋更好玩!】①寵物圖鑑按鈕變小、移到「動物主食大百科」上方,不再擋住第一隻寵物!②撫摸/餵食/玩耍三顆按鈕排成同一排,一眼看完!③撫摸的時候寵物會微微放大、輕輕上下搖晃,超有感覺!④玩躲貓貓時每次點擊,畫面中間會出現「💭 思考泡泡」偷偷告訴你距離:藍色=很遠、紅色=超近!⑤鬥技場為了公平,不能使用馴養寵物的力量喔。',
      '👀🎓【寵物圖鑑全新雙狀態!】重新定義:打怪時「出現並帶過」的寵物=「👀 已相遇」(可以看牠的科普資料,但還不算收錄);「馴養成功」才是真正的「🎓 收錄馴養」!圖鑑每一區現在同時顯示「👀 已相遇 X/N」和「🎓 收錄馴養 Z/N」兩種進度,已相遇但還沒馴養的寵物卡片會掛「👀 已相遇」標籤,馴養完成則是「🎓Lv」標籤——目標就是把 28 隻全部收錄馴養!',
    ],
    items: [
      '★ v4.9.0【首入小屋贈五色鳥+兩段式教學·index.html】_petMaybeFirstTutorial:首次進小屋(教學完成鍵未寫)且未馴養五色鳥 → _petRecordTame(五色鳥, house_first_gift) 自動馴養入庫(走既有統一入口:入帳本/圖鑑收錄/獎章檢查)+雙版 toast+雲端存檔。教學 _petHouseTutorial 加第二參數 phase:intro=前 3 步(歡迎/入住/圖鑑)+自訂「先請五色鳥入住」結尾步,結束不寫完成鍵、掛 _petTutAwaitCheckIn 旗標;玩家在 _petHousePickResident 完成入住 → 自動接 play 段(撫摸/餵食/玩耍/好感/開始體驗後 5 步),跑完才寫完成鍵。intro 段按「略過教學」=直接寫完成鍵退出不再引導;小屋內手動「❓教學」不帶 phase,維持完整 8 步不變。',
      '★ v4.9.0【每日互動 8:00 重置+當日夥伴鎖定·index.html】_petTwDateStr 由台灣午夜換日改「取 UTC 日期」=台灣早上 8:00 換日(同每日獎勵題庫口徑);新增 _petHouseLockInfo/_petHouseLockToday/_petHouseAskLock(確認視窗 z-9650·列出目前入住寵物·雙版文案):撫摸(_petHouseStrokeStart)/餵食(_petHouseFeedMode+_petHouseFoodDragStart)/玩耍(_petPlayStart) 四個互動入口首次觸發先確認,按「✅ 開始互動」把當下入住名單寫入 _petHouseDaily.lock;鎖定後 _petHousePickResident(請寵物入住/更換)與寵物卡「↩ 回家」皆擋下並提示明日早上 8:00 重置。lock 隨既有 petHouseDaily_s 序列化上雲,載入「僅雲端有當日」分支一併採信、同日走聯集口徑(任一端鎖了就算鎖,防換裝置重挑夥伴)。⚠ 部署當天若在台灣 00:00~08:00 之間,互動日鍵會往回移一天,當日互動可能多重置一次(一次性過渡、無害)。',
      '★ v4.9.0【飼料分類頁籤+放大·index.html】_petHouseRenderFood 重寫:根因是食物按鈕 CSS touch-action:none(拖曳必需)讓整個食物面板在 iPad 無法手指捲動,原五列全展開超出 34vh 時最下排(✨特殊:糞球等)永遠捲不到=按不到;改為分類頁籤(window._phFoodCat·一般按鈕點擊切換)一次只渲染一類 → 每頁內容必在可視高度內,全部飼料保證點得到/拖得到。標題 19→24px、食物鈕 16→22px+內距放大,拖曳幽靈圖示 ._ph-food-ghost 42px×1.35 → 60px×1.5;拖曳判定/餵食獎懲/存檔完全沿用 v4.1.0 不變。',
      '★ v4.9.0【寵物圖鑑 z-index 修正·index.html】根因:pet-page-overlay 位於 #adventure-overlay(z-index:510 stacking context)內,自身 z-9100 永遠壓不過掛在 body 上的小屋 overlay(z-9400)。openPetPage 在小屋開著時把圖鑑 overlay 暫時搬到 body 並改 position:fixed+z-9550(手法同 v4.8.0 龍王替補圖鑑整備),closePetPage 還原 DOM 位置與 z;寵物詳情卡 pet-detail-modal 本就是 body fixed z-9700 不受影響。',
      '★ v4.9.0【iPad 首頁寵物鈕消失修正·index.html】根因:寵物系統雲端開關(gameConfig/petSystemSwitch)在校園網路不穩時 getDoc 偶發失敗 → _petSysCloudOpen 停留 null → 退回硬編碼預設 false → _applyPetSysGate 把「🐾寵物」鈕整節課藏起來。三重修法:①window._PET_SYS_PUBLIC false→true(系統已對全體正式開放,讀不到開關時 fail-open;GM 雲端「暫時關閉」在正常讀取下依然生效)②_fbLoadPetSysSwitch 讀取失敗自動重試最多 5 次(每 6 秒·_petSwitchRetry)③_applyPetSysGate 改冪等寫入並掛入 _syncMobileNav 既有 500ms 週期,開關載入後 0.5 秒內按鈕必復原。',
      '★ v4.9.0【召喚星空寵物池口徑修正·index.html】老師裁決:召喚出的是「未馴養的寵物」,全收錄判定=馴養寵物全收錄,而非寵物圖鑑解鎖全收錄。rare_ssr/rare_sr 兩處寵物池 filter 由 !_isPetCollected(pn) 改 !window._petIsTamed(pn)(typeof 守門同步改 _petIsTamed);原口徑會把「圖鑑看過但還沒馴養」的寵物排除在召喚池外,錯誤壓縮玩家召喚機率。寵物全馴養才走 fallback 轉寵物訓練書(SSR×6/SR×3·標籤同步改「英雄全收錄·寵物全馴養」)。',
      '★ v4.9.0【寵物「相遇/收錄馴養」全站語義重定義·index.html】老師裁決:原「出現並攜帶過而解鎖」的集合(_petsEverCollected/_isPetCollected)統一正名為「👀 已相遇」,並非收錄;「寵物收錄」重新定義為「🎓 收錄馴養」(以 _petIsTamed/_tamedPets 為唯一權威)。實作:①新增語義正確別名 window._isPetMet(舊函式名保留全站相容,誤刪是大忌)+定義處/序列化/載入/戰鬥攜帶標記四處註解正名 ②寵物圖鑑 _buildPetPage:台/日/埃三區段標頭改雙計數「👀 已相遇 X/N·🎓 收錄馴養 Z/N」;已相遇未馴養的卡片加「👀 已相遇」琥珀徽章(馴養完成維持「🎓Lv.N」綠徽章);詳情閱覽門檻維持「已相遇」但訊息正名(尚未相遇/已相遇·尚未收錄馴養/已收錄馴養);系統介紹 intro 雙版補語義說明 ③隨機寵物召喚卷 pet_summon_ticket 一併改馴養口徑:召喚池 filter 由 _isPetCollected 改 !_petIsTamed(召喚出未馴養寵物),28 隻「全數收錄馴養」才自動轉頂級寵物飼料(帳本註記 all_tamed) ④全站文案正名:SUMMON_RATES 兩列說明/SSR 取得方法總整理/背包道具說明(召喚卷+訓練書)/GM 獎勵產生器標籤/新手教學第⑥章/戰鬥馴養成功提示,「未收錄寵物」一律改「未馴養寵物」、「全部收錄」一律改「英雄全收錄且寵物全馴養」。資料零遷移:petsEverCollected 集合本身不動,只重定義顯示語義與召喚判定。',
      '★ v4.9.0【寵物小屋體驗五修·index.html】❶iPad 圖鑑桌鈕(_ph-codex-desk-btn)縮小約 4 成(📖 clamp 40~62→26~40px·標題 17~24→14~18·padding 16/22→10/14)並下移(bottom clamp(160px,37vh,340px)→clamp(126px,35vh,300px))貼齊食物面板(#_ph-food max-height:34vh)正上方,不再蓋到左側第一個寵物槽位 ❷寵物卡「撫摸/餵食/玩耍」三鈕改固定同一列(btnRow flex-wrap:wrap→nowrap+各鈕 flex:1 1 0/min-width:0/white-space:nowrap·字級 17→clamp(13,1.5vw,16)·完成態「✅ 🤚 撫摸」→「✅撫摸」去 emoji 省寬) ❸撫摸回饋:StrokeStart 對寵物圖 wrap 掛 ._ph-stroking(scale 1.07+上下 ±4px 0.9s 無限輕搖·transform-origin 底部·先移除 _ph-bouncing/_ph-shaking 防動畫互蓋),StrokeEnd/StrokeReward 雙點卸除 ❹鬥技場禁用馴養寵物·調查確認+補洞:跟隨寵物素質加成/自動攜帶只在 confirmHeroPick 的 _isAdvMode 分支套用(鬥技場本就不套=無素質外掛✅);但寵物極限爆發 _petFollowBurstName 有「依英雄名 _petFollowOf」fallback,在鬥技場共用 execBurst 下可觸發雙選=漏洞→於該單一咽喉點加閘門:非冒險模式(_adventureMode)且非世界BOSS(_wbInWorldBossMode/_wbSoloPracticeMode)一律回 null(龍王戰為 v4.5.0 設計本就放行),另 _execPetBurst 開頭加同判定防禦雙保險 ❺躲貓貓(_petPlayHideSeek)每次未命中點擊於畫面中央(top 40%)彈 💭 思考對話泡泡,依四段距離 tier 顯示暗示文字(cute/premium 雙版·鐵律 1.232),邊框色沿用星星四段同色系(藍=遠/綠/黃/紅=近),1.6 秒後淡出、命中(HIT_R 內)直接揭曉寵物不彈泡泡。',
      '★ v4.9.0【驗證與版本】index.html 全部 inline script 通過 node --check、零孤立代理字元;admin_panel.js 通過檢查、0 個真正可選串接(?.)。七點版本同步 → v4.9.0;GAME_CHANGELOG 維持 20 筆(移除最舊 v3.26.0)。本輪改 index.html＋admin_panel.js(僅版號)＋game_changelog.js;hero_db.js 內容未改、維持 v4.5.0 免重傳,世界BOSS兩檔維持 v4.8.0 免重傳。',
    ],
  },
  // v4.8.0 — 🐉 龍王總 HP 提升到 1,000 萬 + ⚔ 替補英雄列表大升級(篩選/條件搜尋/圖鑑整備/縮圖)+ 🎁 GM 獎勵箱重新整理
  {
    ver: 'v4.8.0',
    date: '2026-07-04',
    brief: [
      '🐉【龍王變得超級耐打!】8 隻龍王的總 HP 從 500 萬提升到 1,000 萬!之前有高手一天就能打掉快一半,現在真的需要全校同學一起合作才打得倒——快揪隊友一起挑戰吧!(打法、護盾、排名獎勵都不變,只是龍王更耐打了)',
      '⚔【龍王戰選英雄大升級!】替換英雄的視窗現在有「篩選按鈕」了:全部/⚔主傷害/💚主回復/🌀主控場/🛡主坦克/👑UR/🌈SSR…還有 🔍 條件搜尋!而且每隻英雄下面都多了一顆「📖 圖鑑整備」按鈕——點下去可以直接幫他升級、裝至寶、裝寵物,關掉圖鑑會自動回到選英雄的畫面,等級馬上更新,超方便!',
      '🎁【GM 獎勵箱多了 🔄 重新整理】如果老師剛發的獎勵還沒出現在收件箱,按一下「🔄 重新整理」就會重新連線雲端同步,絕對不會重複領取。',
      '📸 替補英雄列表的縮圖位置也調整了,大部分英雄的臉現在看得更清楚!',
    ],
    items: [
      '★ v4.8.0【龍王總 HP 5,000,000 → 10,000,000·world-boss.js+world-boss-ui.html+index.html+admin_panel.js】WORLD_BOSS_LINEUP 八龍 maxHp+HERO_DB 掛載八條 hp+開放新一輪/入口 HP 條 fallback×2+console(world-boss.js);全 UI 同步(靜態龍王卡×2/超級血條預設/介紹彈窗/戰場血條 fallback×3·world-boss-ui);輪替接班/結算 fallback×2+關卡頁 HP 條+龍王介紹卡最大 HP(index);GM 龍王 HP 救援卡 MAX_HP fallback+查詢/切換 fallback+說明字+輸入框 max 上限放寬 10000000+五顆快捷鈕改 10M/7.5M/5M/2.5M/1M(admin)。',
      '★ v4.8.0【HP 調整不良影響檢查(全數確認)】①護盾為回合制(第 3/5/7/9 回合)非 HP% → 不受影響 ②單次扣血上限 5,000/單場上限 100,000 為固定值 → 不變 ③雲端 stats/global.worldBossHp 存「剩餘絕對值」→ 當前龍王血量原樣沿用不會跳動 ④排名/獎章/傷害統計皆絕對值 → 不受影響 ⑤過渡期:未更新的舊快取端若觸發輪替,會把下一隻龍王初始成 500 萬(建議部署後 GM 到後台用「龍王 HP 救援」把當前/新龍王補滿 1,000 萬;下下隻起自我修正);舊端看新雲端血量 >500 萬時血條暫時顯示 >100%(純視覺·更新後消失) ⑥擊殺週期約×2 = 本次調整目的;若實測超過兩週可再議下調。',
      '★ v4.8.0【替補列表篩選+條件搜尋·world-boss-ui+index】_wbTcOpenSwapHero 列表上方加篩選列(_wbTcEnsureSwapFilterBar·全部/五主類/四稀有度+🔍條件搜尋·冪等建立·至寶 modal 共用 grid 時由 _wbTcOpenSwapTreasure 匯流單點自動隱藏);判定函式 window._wbSwapHeroPassFilter 住 index.html(HERO_SKILL_EFFECTS/HERO_PRIMARY_CLASS 為主程式 const 不可跨檔讀),口徑與圖鑑/邀約頁完全一致(_heroSkillTypes/_getHeroRarity/_condSearchEffects.every);doCondSearch 新增 wbswap 分支(typeof 守門·不影響既有 pick/grid);篩選後空結果顯示雙版空狀態文字(鐵律 1.232)不彈 alert。',
      '★ v4.8.0【📖 圖鑑整備·world-boss-ui+index】每隻英雄名下加「📖 圖鑑整備」鈕(_wbOpenCodexFromSwap:記回流槽位→關 swap modal→呼主程式 _openHeroCodexFromWbSwap);主程式側完整鏡射既有編組版(_openHeroCodexFromTeam):detach hero-page/hero-detail 兩 overlay 到 body(z 10000/10500 絕對蓋過 WB UI)+狀態旗標 _heroDetailReturnToWbSwap;closeHeroDetail/closeHeroPage 各加 WB 回流分支(收 overlay→還原 DOM parent/z-index→重開 _wbTcOpenSwapHero(_wbSwapReturnSlotIdx)→剛升級/換裝的變更立即反映在列表);openHeroDetail 首次教學守門加 _heroDetailReturnToWbSwap(整備進來不觸發教學);已選(灰色)英雄改「保留可點」:移除 disabled 屬性與 .disabled class(其 pointer-events:none 會鎖死子鈕),改 _dim 灰階圖與文字+主 onclick 空轉 → 只擋選角不擋整備。',
      '★ v4.8.0【替補縮圖 Y 下移 20%·world-boss-ui】非排除名單英雄縮圖 img 加 object-position:50% 30%(原 object-fit:cover 置中 50% 50%);老師指定 33 隻「圖高已適當」者(_WB_SWAP_THUMB_KEEP)維持置中,名單已逐一對 hero_db.js HERO_DB keys 驗證通過(喚龍使‧蜜鶴林/御雲使‧沐雲雪為全名)。',
      '★ v4.8.0【GM 獎勵箱 🔄 重新整理·index·老師需求 1】收件箱(🎁 GM獎勵)最上方加「🔄 重新整理」鈕+雙版說明句(鐵律 1.232):_gmcrRefreshInbox 先跑 v3.16.97 既有冪等對帳 _fbReconcileGmClassRewardTickets(安全不等式·永不重複發·失敗靜默略過)再重繪收件箱(重新讀雲端待領+已領取紀錄);零改動任何領取/去重/transaction 路徑(_fbClaimGmClassReward/_gmcrClaimed 一字未動)。老師需求 3(鬥技場最高傷害與技能排行)經查證已於 v3.30.0 完整上線(📊 傷害排行鈕·本輪免重做)。',
      '★ v4.8.0【驗證/版本/範圍】index.html 20 個 inline script node --check 全過、0 lone surrogate;world-boss.js/world-boss-ui.html/admin_panel.js/game_changelog.js node --check 過、admin_panel.js 0 個真正可選串接(?.)、本輪全部新增區塊無 ?. 與 ??。七點版本同步 → v4.8.0(hero_db.js 未動維持 v4.5.0、arena.js 未動維持 v3.15.60、CURRENT_BOOT_VER 未動);GAME_CHANGELOG 維持 20 筆(移除最舊 v3.25.0)。本輪改 index.html+world-boss.js+world-boss-ui.html+admin_panel.js+game_changelog.js。',
    ],
  },
  // v4.7.0 — GM 管理工具:🐾 寵物紀錄查詢 + 🎁 指定補發寵物(含上線體檢兩項穩定性修正)
  {
    ver: 'v4.7.0',
    date: '2026-07-04',
    brief: [
      '🛠️【系統更穩定了!】老師幫寵物系統做了上線前的總體檢,把兩個看不見的小問題修好了:①共用 iPad 換帳號時,前一位同學的寵物資料現在會確實清乾淨,不會跑到下一位同學的帳號裡 ②玩耍小遊戲獲勝的獎勵改成「贏的瞬間就入帳」,就算馬上關掉畫面也絕對不會漏發!',
      '👨‍🏫【老師的新管理工具】老師現在可以查詢每位同學的完整寵物紀錄(馴養了誰、等級好感、餵食撫摸玩耍次數、獎章、每一筆馴養來源),寵物如果出問題也能直接指定補發。大家可以安心養寵物!',
    ],
    items: [
      '★ v4.7.0【GM 寵物紀錄查詢·index.html+admin_panel.js】玩家活動記錄查詢卡新增「🐾 寵物紀錄」鈕 → window._fbShowPlayerPetRecords(email/lsps學號/uid 反查·比照召喚紀錄):getDocFromServer 讀 players 權威主檔+ticketLedger,彈窗顯示 馴養總覽(N/28·SSR/SR/R 分佈)/寵物明細(Lv/EXP/好感/跟隨)/互動累計(餵對·撫摸·玩耍勝,讀 medalStats)/寵物獎章 14 枚/馴養帳本 200 筆(來源標籤+uid12,非本人 uid 自動紅底=共用平板污染線索)/寵物券帳本(領用+抽到哪隻)。唯讀零風險;取值口徑與 _applySafeData 一致(_s 字串優先)。',
      '★ v4.7.0【GM 指定補發寵物·index.html】彈窗底部「🎁 指定補發寵物」(28 隻下拉標已馴養+Lv 1~20)→ window._fbAdminGrantPetToPlayer:只增不減(已馴養僅取 max(lv)·絕不降級·不動好感/跟隨)、主檔必寫+saves live/safe 存在才同寫(tamedPets 載入為跨槽 union → 主檔寫入即充分·不創建殘缺槽)、map+_s 雙寫(載入 _s 優先·防補發隱形)、馴養帳本補 src=admin_grant(帶 uid12+by 合法來源佐證)、petsEverCollected 同步收錄、寄登入彈窗通知玩家。建議玩家離線時操作(避免整包存檔覆寫 race)。',
      '★ v4.7.0【上線體檢修正①·index.html】_clearAccountLocalData 補清寵物四狀態(_tamedPets/_petTameHistory/_petHouseSlots/_petHouseDaily):共用 iPad 換帳號無整頁 reload,Phase A 起漏列 → 前一位學生寵物殘留記憶體會被 union 只增不減載入永久合併進下一位帳號(與英雄污染同型)。比照 _heroLevels 既有清除;只清記憶體不動雲端,本人資料由雲端載入原樣還原。',
      '★ v4.7.0【上線體檢修正②·index.html】_petPlayFinish 發獎段移到 overlay 檢查之前:勝利→結算面板有 0.65~1.4 秒空窗,若玩家按 ✕ 放棄會 return 漏發 → 改為發獎不依賴 overlay 存在,勝利瞬間必入帳(overlay 已關僅略過結算面板)。',
      '★ v4.7.0【驗證/範圍】index.html 20 inline script node --check 全過、0 lone surrogate;admin_panel.js 0 真 ?.(本輪有實質修改:活動卡 🐾 鈕+grab+wiring 三處·免三點同步);零新 Firestore 集合/規則(寵物券帳本讀取沿用 ticketLedger 既有規則·未部署會顯示提示)。七點版本同步 → v4.7.0(hero_db.js 未動維持 v4.5.0·CURRENT_BOOT_VER 未動);GAME_CHANGELOG trim 20 筆(移除最舊 v3.24.0)。',
    ],
  },
  // v4.6.0 — 寵物小屋「玩耍」開放:🃏記憶翻牌+🙈躲貓貓雙迷你遊戲(隨機輪替)+ 🐾寵物獎章 14 枚
  {
    ver: 'v4.6.0',
    date: '2026-07-04',
    brief: [
      '🎾【寵物小屋「玩耍」正式開放!】小屋裡每隻寵物的「🎾 玩耍」按鈕可以按了!按下去會隨機輪流出現兩款小遊戲:「🃏 記憶翻牌」和「🙈 躲貓貓」。挑戰成功,那隻寵物 EXP+10、💖好感+1(每隻寵物每天 1 次);就算挑戰失敗也不會用掉當天的次數,可以馬上再挑戰一次!',
      '🃏【記憶翻牌怎麼玩】畫面上有 16 張蓋起來的卡牌(8 種寵物、每種 2 張)。每次翻開兩張:一樣的會發光留下來,不一樣的會自動蓋回去。在 60 秒內找齊 8 對就成功!30 秒內完成還能拿「⚡ 過目不忘」獎章!',
      '🙈【躲貓貓怎麼玩】寵物躲在小屋的某個地方!點小屋各處會跳出星星,用「聲音」和「星星的顏色」判斷距離:聲音越急、星星越紅=越近(藍色=很遠)!每次點完要等 3 秒。60 秒內找到牠就成功;只點 5 下以內就找到,可以拿「👂 順風耳」獎章!',
      '🏅【全新「🐾 寵物」獎章 14 枚!】獎章頁多了寵物分類:初次馴養、動物之友(7 隻)、森林夥伴(14 隻)、動物王者(28 隻全收服=最難獎章,獎勵 🔮×5+💰10000!)、傳說馴獸師(SSR 8 隻全收)、滿級教練(Lv.20)、心心相印(好感 100)、小小飼育員(餵對 20 次)、搓揉高手(撫摸 20 次)、玩耍初勝、遊戲高手(玩耍勝 20 次)、過目不忘、順風耳、爆發初體驗(第一次放寵物大絕招)。每枚解鎖自動送 🔮召喚水晶+💰知識幣,以前就達成的登入會自動補發!',
    ],
    items: [
      '★ v4.6.0【玩耍入口與輪替·index.html】小屋寵物卡「🎾 玩耍」由 v4.3.0 敬請期待改為 mk 工廠鈕(act=play·當日完成自動 ✅ 鎖定=裁決③甲)→ _petPlayStart:守門 _petSysOpenForMe/_petIsTamed/_petHouseCanDo → A/B 輪替=隨機起手+強制交替(localStorage _petPlayLast·裁決①甲·非關鍵資料不進存檔 schema)。勝利瞬間走既有 _petHouseInteract(pn,play,slotIdx) 發獎(EXP+10·好感+1·標記當日·雲存·重繪·防中途關閉漏發);失敗/中途離開不消耗(裁決②甲),結算面板供 🔄 再挑戰(同款遊戲·躲貓貓重新隨機藏點)/🏠 回小屋。',
      '★ v4.6.0【🃏 記憶翻牌·index.html】_petPlayMemory:28 隻全池隨機 8 隻 ×2 Fisher-Yates 洗入 4×4(裁決④甲·未馴養寵物入鏡=天然新寵預告);CSS 3D 翻牌(-webkit 前綴照顧老 iPad Safari);翻牌 sfx-kansatsu-flip、配對成功 sfx-quiz-correct+金框發光鎖定、配對失敗依規格靜默 0.8 秒自動翻回(期間全盤鎖點防連點)、8 對完成 sfx-applause;60 秒倒數(剩 10 秒轉紅脈動);≤30 秒完成 → ⚡過目不忘。卡面=EQUIP_DB petImg(emoji 墊底防破圖)、卡背 CSS 🐾,零新素材。',
      '★ v4.6.0【🙈 躲貓貓·index.html】_petPlayHideSeek:背景=靜態 寵物小屋.png 滿版(規格指定·不用動態 mp4);藏點正規化隨機(x 0.08~0.92 / y 0.10~0.90);點擊(touchstart preventDefault+mousedown 雙路徑防雙發)跳 點擊星星.gif,依對角線正規化距離 d 播四段音效:d>0.55 很遠 / ≤0.55 有點距離 / ≤0.35 有點近 / ≤0.18 非常近(4 段 mp3 開場預載·repo 已有·尊重全域靜音);裁決⑤乙:星星顏色隨距離 hue-rotate(藍→綠→黃→紅),靜音平板也玩得動;每次點擊 CD 3 秒(底部膠囊倒數指示);d≤0.08 命中 → sfx-quiz-correct+去背寵物圖彈出(_petNobgUrl·petImg fallback)+♪♫ 音符飄升;逾時寵物自行現身+氣泡;≤5 次點擊命中 → 👂順風耳。60÷3=最多 20 次點擊。',
      '★ v4.6.0【🐾 寵物獎章 14 枚·index.html】MEDAL_DEFS 新增 cat=寵物:馴養組 7(初次馴養/7 隻/14 隻/28 隻全收「動物王者」=_MEDAL_TOP_TIER 頂級 🔮×5+💰10000/SSR 全收/任一 Lv20/任一好感 100)+ 互動組 7(餵對 20/撫摸 20/玩耍首勝/玩耍勝 20/翻牌≤30 秒/躲貓貓≤5 點/寵物爆發初體驗=裁決⑥甲·掛 _runPetBurst 僅玩家方 p1)。獎章頁 cats 陣列+分類圖示鏈加「寵物🐾」;新條目帶 cute 欄位、渲染改 (簡單風 && m.cute)?m.cute:m.desc(鐵律 1.232 樣式③·舊獎章無 cute 自動 fallback desc 完全回溯相容)。',
      '★ v4.6.0【計數與檢查管線·index.html】互動累計掛「既有 _medalStats」新鍵 petFeedOk/petPat/petPlayWin(localStorage adv_medal_stats+雲存 medalStats/_s+三槽合併逐鍵 max 全部現成)→ 僅把 3 新鍵加入 _applySafeData 雲端合併 _numKeys 白名單,零新存檔欄位·只增不減·誤刪是大忌天然合規。遞增點:_petHouseFeed 餵對 / _petHouseStrokeReward 搓揉完成(實際撫摸完成點) / _petHouseInteract(play);_checkPetMedals 檢查點:馴養統一入口 _petRecordTame(涵蓋 battle_tame/summon/admin_grant)/ 寵物實際升級 _petAddExp / 好感首達 100 _petAddAff / 各遞增點 / 登入 _checkMedalsOnLogin 批次(舊玩家已達成自動補·_unlockMedal 三層防重複)。',
      '★ v4.6.0【文案/素材/範圍】小屋頂欄說明+首入教學 🎾 步驟改「玩耍已開放」(cute/premium 雙版·鐵律 1.232;圖鑑好感度說明本就寫「撫摸/玩耍 +1」免改);兩款遊戲說明列/結算面板/CD 指示/逾時氣泡皆雙版。素材:躲貓貓 4 段 mp3+點擊星星.gif 已在 repo(本輪 HTTP 200 驗證·零上傳);記憶翻牌全音效重用既有池(kansatsu-flip/quiz-correct/applause)。零新 Firestore 集合/規則。改 index.html+game_changelog.js+admin_panel.js(僅版號·無 ?.);hero_db.js 未動(_vers 維持 v4.5.0);CURRENT_BOOT_VER 未動;GAME_CHANGELOG trim 20 筆(移除最舊 v3.23.0)。',
    ],
  },
  // v4.5.0 — 寵物馴養 Phase C:28 隻寵物專屬「極限爆發」大絕招(跟隨寵物·雙選·專屬華麗特效)
  {
    ver: 'v4.5.0',
    date: '2026-07-04',
    brief: [
      '🌟【28 隻寵物都有自己的「極限爆發」大絕招了!】只要把馴養好的寵物設成某位英雄的「跟隨寵物」,戰鬥中當那位英雄的「極限爆發」集滿能量、亮起來的時候,就會多出一個選擇:要放「英雄自己的爆發」,還是改放「🐾 寵物的極限爆發」!每隻寵物的絕招都不一樣、超帥氣!',
      '💥【每隻寵物的絕招都不同!】舉幾個例子:台灣黑熊「黑熊怒擊」連續重擊敵人、綠蠵龜「龜甲庇護」讓全隊大幅減傷、丹頂鶴「鶴舞千年」幫全隊持續回血、荷魯斯之鷹「天空神之瞳」審判全場敵人、聖䗴神蟲「聖甲重生術」救活所有倒下的夥伴、阿努比斯胡狼「冥界審判」讓敵人不能回血也不能被救活…28 種效果等你發現!',
      '🎯【怎麼使用 & 次數規則】寵物要先「跟隨」一位英雄(在英雄詳情頁🐾設定或寵物圖鑑裡設定),牠才會帶著自己的爆發上場。每場戰鬥可以放 1 次寵物爆發,而且是和英雄自己的 2 次爆發「分開算」的!好感度養到滿 100 的寵物,每場還能多放 1 次寵物爆發喔!',
      '✨【每隻都有專屬華麗動畫】28 隻寵物的極限爆發各自搭配了華麗的全螢幕動畫特效與音效,放大絕的時候超有氣勢!快去寵物圖鑑點開每隻寵物,看看牠的專屬絕招介紹吧!',
    ],
    items: [
      '★ v4.5.0【寵物極限爆發總覽·index.html】為 28 隻寵物(台灣 12+日本 12+埃及 4)各設計專屬極限爆發:資料表 window.PET_BURST_DB[寵物名]={n:招式名,cute,premium}(鐵律 1.232 雙版文案);跟隨寵物且該寵物有爆發定義時,英雄爆發就緒會觸發「英雄爆發 / 🐾 寵物爆發」雙選(_showPetBurstChoiceModal)。每場限 1 次(h._petBurstUsed,與英雄自身 2 次爆發分開計);好感度滿 100 → h._petBurstBonus=1 額外 +1 次(v4.3.0 已就緒旗標)。',
      '★ v4.5.0【雙選與施放·index.html】execBurst 頂部 hook:若英雄有可用寵物爆發且本場尚未用(或好感滿 100 尚有加次)→ 彈雙選;選寵物則走 _runPetBurst(pn,h) 施放該寵物專屬效果、標記 _petBurstUsed、消耗英雄爆發能量;_canBurst / updateBurstEffects 同步認得寵物爆發可用狀態。所有寵物爆發傷害皆必中、無視有利,走 doDmg 不加 bypassShield → 龍王護盾與世界 BOSS 5000 傷害上限仍生效(鐵律 1.31);固定傷害段(如冥界審判 HP×400%)走 fixedDmg 組同樣受 cap。',
      '★ v4.5.0【doDmg 頂部/受傷後 hook·index.html】頂部:變化狸「百變障眼法」全隊共用免疫接下來 5 次傷害(G._petTanukiShield 每側計數·多段各扣 1)、對馬山貓「山貓瞬影」自身閃避 +40%(_petEvade·mustHit/ignoreEvasion 可破)、綠蠵龜/聖䗴神蟲減傷(_petDmgReduce)、丹頂鶴/奈良神鹿屬性減傷(_petElemGuard)、荷魯斯之鷹易傷(_petVuln)、錦鯉威能×2(_petAmpNext)。受傷後(扣 HP 之後·用實際 dmg·仿軟軟的雲):台灣藍鵲「長尾迴旋」50% 反彈給攻擊者(_petReflect·走 doDmg 受 cap)、綠雉「雉羽轉化」受傷 50% 轉治療(_petConvertDmg·經 _healCurseGate 尊重禁療)。',
      '★ v4.5.0【doHeal / doRevive / skillCost hook·index.html】doHeal:錦鯉「躍龍門」施療者身上 _petAmpNext → 本次治療 ×2(與傷害共用旗標·誰先出手先消耗)。doRevive:阿努比斯胡狼「冥界審判」目標 _petNoRevive>0 → 禁止復活(與禁療分開的獨立旗標·2 回合)。skillCost:五色鳥「五彩羽光」全體友 _petCostCut → 下次技能消耗 -80%(仿托特聖䴉一次性折扣·UI 顯示也套用·實際執行才消耗)。',
      '★ v4.5.0【startTurn 收尾 hook·index.html】新回合每英雄(tickStatus 之前):翠鳥「翠影急襲」下回合保證先手(_petFirstStrikeNext→速度暫拉滿 _petOrigSpd·次回合還原);阿努比斯禁復活回合遞減;石虎「石虎疾襲」等自我素質 buff 到期還原(_petStatBuffs 自管陣列);丹頂鶴/日本大山椒魚持續恢復(_petRegen·經 _healCurseGate);梅花鹿「鹿鳴呦呦」/奈良神鹿「神鹿賜福」能量賜予(_petEnergyGift·每側每回合僅一次·log 標明「來源:寵物爆發」鐵律 1.207)。其餘 _pet* buff/status 由既有 tickStatus 自動遞減移除。',
      '★ v4.5.0【寵物圖鑑爆發區 + 特效·index.html + hero_db.js】寵物詳情頁(_showPetDetail)在馴養狀態與生態科普之間新增「🌟 寵物極限爆發」區塊:顯示招式名 + cute/premium 雙版說明(鐵律 1.232)+ 使用方式提示(固定效果一版數值·無升級 → 鐵律 1.160 天然合規)。hero_db.js BURST_GIF_DB 新增 28 隻寵物爆發特效條目:全部重用 repo 既有 GIF(不同 key·仿大刀勇士做法·零上傳·GitHub 樹已確認 28 檔皆存在)、音效沿用既有 sfx 池、dur 統一 2000ms 全螢幕只播一段淡出。',
      '★ v4.5.0【安全性/範圍】皆為新增旁路 hook(全程 try-catch·不動既有傷害計算/存檔/守門/機率);借用好友英雄不觸發寵物爆發(_isFriendHero 天然排除)。改 index.html + hero_db.js(BURST_GIF_DB 28 條)+ admin_panel.js(僅版號 v4.5.0·內容未改·無 ?.)+ game_changelog.js。七點版本同步 → v4.5.0(含 hero_db.js·CURRENT_BOOT_VER 未動);GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.22.0)。',
    ],
  },
  // v4.3.0 — 寵物小屋互動包:撫摸改「按住搓揉」+首入互動教學(首次餵食報答案)+玩耍敬請期待+GM 小屋內雲端開關+近期活動預告+荷魯斯之鷹圖修正
  {
    ver: 'v4.3.0',
    date: '2026-07-03',
    brief: [
      '🤚【摸寵物改成用「搓」的更好玩!】現在撫摸寵物改成:在寵物身上「按住不放」,像畫圈圈或上下左右輕輕「搓揉」牠——會一直冒出愛心💖和舒服的音效!溫柔地搓一下下(大約 3 秒)就撫摸完成,拿到經驗值和好感度!⚠ 但如果只是一直「戳」牠、快速亂點,寵物會生氣😾而且不會有獎勵喔——要溫柔地搓才行!',
      '🎓【第一次進小屋有互動小教學!】第一次走進「🏠 寵物小屋」,會跳出一個可愛的小教學,一步一步教你怎麼撫摸、餵食、看圖鑑。而且你「第一次餵食」的時候,我會偷偷告訴你這隻寵物最愛吃的答案😉(之後就要自己看寵物圖鑑找答案囉)!想再看一次教學,按小屋右上角的「❓ 教學」就可以!',
      '🎾【「玩耍」即將開放】「🎾 玩耍」功能還在製作中,現在點下去會顯示「尚未開放,敬請期待」,很快就會和大家見面!',
      '🐾【荷魯斯之鷹圖片修正】修正了寵物「荷魯斯之鷹」的圖片會破圖/顯示不出來的問題,現在會正確顯示牠帥氣的樣子!',
    ],
    items: [
      '★ v4.3.0【撫摸改「搓揉」互動·index.html】寵物小屋「撫摸」由「點一下 +EXP/好感」改為手勢互動:在寵物圖片上按住並拖曳(畫圈或上下左右來回擦),document 級 mouse/touch 監聽累積「有效搓揉時間」(每幀位移≥6px 且 ≤260ms 才計),過程節流冒愛心 _ph-heart-float(~85ms)+ sfx-gentle(~260ms);累積滿 window._PH_STROKE_GOAL_MS=3000ms → _petHouseStrokeReward(當日 pat 記完成、EXP+10、好感+1、_petHouseFx、雲端存檔、重繪)。純點擊/連點(沒移動或位移<24px)→ _petHouseAngryFx(冒 💢/😾 顫抖 + sfx-quiz-wrong,不給獎勵);有搓但不到 3 秒 → 顯示進度鼓勵。撫摸鈕改成提示、寵物圖加「👆 按住搓揉」徽章;每日一次上限與存檔沿用。touch-action:none + preventDefault 防捲動。',
      '★ v4.3.0【首入互動教學 + 首次餵食報答案·index.html】首次進入寵物小屋(每帳號一次,localStorage lxps_pethouse_tut_done_{uid})自動播放 _petHouseTutorial:8 步介面說明+互動引導(歡迎/邀請入住/圖鑑書/搓揉撫摸/拖曳餵食/玩耍敬請期待/好感度忠誠夥伴/開始體驗),簡單風與精緻風雙版(鐵律 1.232),含「略過教學」與「下一步」;小屋標題列新增「❓ 教學」可隨時重看。首次餵食(每帳號一次,localStorage lxps_pethouse_firstfeed_{uid})在 _petHouseFeedMode 自動提示該寵物正確主食(_petStapleHint 讀 _PET_STAPLE→_petFoodName),之後靠圖鑑科普自行判斷。',
      '★ v4.3.0【玩耍暫不開放·index.html】寵物小屋「🎾 玩耍」按鈕改為灰底,點擊顯示「尚未開放,敬請期待」提示(不給任何獎勵、不記當日完成),待後續版本開放。',
      '★ v4.3.0【GM 可在小屋內雲端切換系統開放/關閉·index.html】開關由原本的硬編碼 window._PET_SYS_PUBLIC 升級為雲端旗標 gameConfig/petSystemSwitch{public,updatedAt,updatedBy}:新增 _petSysPublicOpen()(是否對全體公開,不含管理員特權)、_fbLoadPetSysSwitch()(登入後於 openAdventureOverlay 拉一次,載完自動再套 gate)、_fbSetPetSysSwitch(open)(GM 寫雲端並立即套用)。寵物小屋標題下方對「僅 GM」顯示切換列:🟢 已對全體開放 / 🔴 暫時關閉·僅GM測試,點擊 confirm 後寫雲端,學生下次登入(或回關卡頁)即生效。沿用既有 gameConfig 規則(登入可讀·GM 可寫),免部署新 firestore.rules;純顯隱/入口守門,不刪不動任何寵物資料。',
      '★ v4.3.0【近期活動卡預告化·index.html】登入「近期活動與新角色」的🐾寵物馴養大系統主題卡改為依 _petSysPublicOpen() 切換文案:未對全體開放時,標題顯示「即將推出!寵物馴養大系統(預告)」、副標「敬請期待…」、介紹卡頂端加「🔜 這是預告」橫幅並改用「即將推出」語氣;正式開放後恢復「NEW!…登場!」文案。雙版(鐵律 1.232)。',
      '★ v4.3.0【荷魯斯之鷹寵物圖修正·index.html】EQUIP_DB 荷魯斯之鷹 petImg 由已 404 的「荷魯斯之鷹.png」(且曾為托特聖䴉錯圖)改指向老師重傳的正確圖「荷魯斯之鷹 .webp」(檔名尾端含空格·webp 較小較快·破快取 ?v=20260703);小屋去背圖 荷魯斯之鷹_去背.png 未動。',
      '★ v4.3.0【安全性/範圍】皆集中在 index.html:寵物小屋互動/教學/顯隱與一張寵物圖 URL 修正,不動任何存檔/資料/守門/機率;GM 開關沿用既有 gameConfig 規則免改 firestore.rules。admin_panel.js 僅版號對齊 v4.3.0(內容未改)。改 index.html + admin_panel.js + game_changelog.js;hero_db.js 不動(_vers 維持 v3.34.0)。七點版本同步 → v4.3.0;GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.21.0)。',
    ],
  },
  // v4.2.0 — 寵物小屋改造(主選單直接進小屋+動態影片背景+圖鑑改小屋左桌大按鈕)+寵物系統 GM 測試限定閘門
  {
    ver: 'v4.2.0',
    date: '2026-07-03',
    brief: [
      '🐾【寵物系統整備中,敬請期待!】我們正在把「寵物小屋」變得更棒——加入了漂亮的動態背景影片🎬、專屬音樂🎵,還把「寵物圖鑑」改成小屋裡的一本大書📖,翻開就能查看每隻寵物喜歡吃的食物!目前正在做最後的測試與調整,很快就會開放給大家一起玩,再等我們一下下喔!',
    ],
    items: [
      '★ v4.2.0【主選單「🐾寵物」鈕直接進寵物小屋·index.html】導覽反轉:原「主選單→寵物圖鑑→(圖鑑頂端鈕)→寵物小屋」改為「主選單→寵物小屋(直接)→(小屋左側桌上大按鈕)→寵物圖鑑」。靜態導覽鈕(id=adv-nav-pet-btn)與手機底部導覽 pet 鈕的 onclick 皆改呼 window._openPetHouse();沿用專屬 BGM bgm-pet-house(bgmFadeTo,關閉還原原曲)。',
      '★ v4.2.0【寵物小屋動態影片背景·index.html】_openPetHouse 內以 createElement 建立 #pet-house-bg-video(autoplay/loop/muted/playsinline·src=寵物小屋動態背景.mp4),作法同召喚星空/鬥技場:z-index:-1 覆蓋 overlay 靜態背景圖 寵物小屋.png,onloadeddata 才淡入、onerror/讀不到自動隱藏露出靜態圖(iPad 自動播放需 muted+playsinline)。⚠ 需老師上傳 寵物小屋動態背景.mp4 至 repo 根目錄。',
      '★ v4.2.0【寵物圖鑑改「小屋內左側桌上大按鈕」·index.html】小屋內新增 #_ph-codex-desk-btn(position:absolute 左下·📖 書本樣式漸層棕框金邊·翻開 openPetPage 查看科普與喜好食物),取代原「圖鑑頁頂端進小屋」入口;提示文案雙版(鐵律 1.232 簡單風/精緻風)。',
      '★ v4.2.0【寵物系統 GM 測試限定閘門·index.html】新增總開關 window._PET_SYS_PUBLIC=false + window._petSysOpenForMe()(=公開旗標 || _isAdminUser)+ window._applyPetSysGate(由 openAdventureOverlay 呼叫,隱藏主選單寵物鈕)。非開放對象時:_openPetHouse / openPetPage 頂部守門(toast「準備中」)+ 英雄詳情🐾跟隨寵物槽、商店三種寵物飼料(_renderShopProducts filter)、戰鬥🐾馴養鈕(_advRefreshTameBtn)、召喚星空 SSR/SR 寵物混池(_petPoolSSR/SR 池空僅出英雄;全收錄 fallback 退回原 超越極限果實×1 / 精裝英雄經驗之書×5)一併對玩家隱藏/排除。全部非破壞性(只隱藏/排除,不刪不動任何寵物資料);老師確認要對全體開放時,把 _PET_SYS_PUBLIC 改成 true(單行切換)即可。',
      '★ v4.2.0【安全性/範圍】皆為 UI/入口顯隱與召喚池排除,不動任何存檔/資料/守門;召喚保證英雄路徑不變(混池關閉=Phase B 之前行為)。改 index.html + admin_panel.js(僅版號對齊 v4.2.0,內容未改)+ game_changelog.js;hero_db.js 不動(_vers 維持 v3.34.0)。版本同步 → v4.2.0;GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.20.0)。',
    ],
  },
  // v4.1.0 — 寵物馴養 Phase B(召喚整合)+ 寵物小屋餵食改「拖曳互動」
  {
    ver: 'v4.1.0',
    date: '2026-07-03',
    brief: [
      '🐾【召喚星空也能召喚寵物了!】現在抽「星空召喚」時,SSR / SR 大獎有機會直接召喚出「還沒收錄的寵物」!抽到就直接馴養完成(Lv.1)開始陪你冒險。同一次會出「英雄或寵物」其中一位,如果某一邊已經全部收集完,就會優先出另一邊喔!',
      '📘【全部收集完的大獎:寵物訓練書】當 SSR 的英雄和寵物「全部」收集完成後,再抽到 SSR 就會自動送你「📘 寵物訓練書 ×6」;SR 全部收集完則送 ×3。寵物訓練書在背包使用,可以選 1 隻已經馴養的寵物,直接 +10 點寵物經驗(Lv.20 滿級的寵物就不能再用囉)!',
      '🍽【寵物小屋「餵食」大改版:用拖的更好玩!】現在餵寵物改成:按住下面的食物「拖」到寵物身上放開就能餵牠!拖曳的時候手指會拉出一條閃亮的光點尾巴✨。餵對主食:寵物會開心地「跳起來💖」+ 出現愛心 + 答對音效;餵錯了:寵物會冒出「❓問號」並「左右搖頭」+ 提示音效。拖到一半放手,食物會自己「咻」地彈回原位,可以再試一次!',
    ],
    items: [
      '★ v4.1.0【召喚星空 SSR/SR 槽:英雄+寵物混池·index.html】SUMMON_RATES 的 rare_ssr / rare_sr 兩列改為「未收錄英雄 ∪ 未收錄寵物」合成一池均勻隨機抽 1(寵物收錄口徑沿用 _isPetCollected,與隨機寵物召喚卷一致):抽到英雄回 kind:rare_hero(既有解鎖流程不變)、抽到寵物回 kind:rare_pet → _applySummonReward 呼叫 _petRecordTame(pn,summon_star) 直接馴養收服 Lv.1(好感 0,寫入 _petTameHistory 帳本供 GM 稽核)。單次只會出其中之一;某一邊全收錄則必出另一邊。v3.16.38 每批稀有上限各 1 擴及寵物(與英雄同槽共用),同批排除清單(_batchClaimedHeroes)一併納入寵物名避免重複;有稀有英雄或寵物時皆播 reveal 收服特效。',
      '★ v4.1.0【兩邊皆全收錄 → 寵物訓練書·index.html】當某稀有度的「英雄與寵物皆全收錄」時,_rollOneSummon 該分支改發 kind:pet_training_book_alt:SSR ×6、SR ×3(取代舊的「超越極限果實×1 / 精裝英雄之書×5」全收錄 fallback);同一批抽到重複稀有英雄的 _dupConverted 轉換維持原獎勵(果實×1 / 精裝書×5)不變,不影響既有行為。',
      '★ v4.1.0【新道具「寵物訓練書」pet_training_book·index.html】BACKPACK_ITEM_DEF 新增(📘,type:use);背包使用 → _openPetTrainingBookPicker 列出所有已馴養寵物(顯示 Lv 與 EXP),點選後才扣書並對該寵物 _petAddExp(+10);Lv.20 滿級寵物鎖定不可選(防浪費,提示但不扣書);升級播 sfx-medal-unlock;還有剩自動重開連續訓練;文案雙版(鐵律 1.232)。非 GM 發放品、不進商店販賣、不進召喚卷帳本。',
      '★ v4.1.0【寵物小屋「餵食」改拖曳互動·index.html】原「點🍽選目標→點食物」改為「按住食物拖到寵物身上放開」:①食物按鈕(_petHouseRenderFood)加 touch/mouse 拖曳起始 _petHouseFoodDragStart,建立跟隨手指的幽靈食物 _ph-food-ghost,拖曳中每 ~28ms 於手指處灑一顆閃亮光點 _ph-spark(留在經過處淡出=光點尾巴) ②已馴養寵物卡標記 data-ph-pet / data-ph-slot / data-ph-feedable(當日已餵=0),拖曳中以 elementFromPoint + closest 命中可餵食卡則高亮 _ph-drop-hot ③放開命中可餵食寵物 → 沿用既有 _petHouseFeed 判定(餵對好感+2 EXP+1 播 _petHouseFx 愛心+跳躍 sfx-quiz-correct;餵錯好感−1 播新 _petHouseWrongFx 問號 _ph-qmark + 左右顫抖 _ph-shaking sfx-quiz-wrong,延後 950ms 重繪讓動畫播完可再拖曳重試) ④放開沒命中(或當日已餵的寵物)→ _petHouseSpringBackGhost 讓食物快速彈回原位。觸控加 touch-action:none + preventDefault 防捲動干擾;判定/好感/EXP/存檔邏輯完全沿用,只換互動方式並加動畫反饋。',
      '★ v4.1.0【安全性/範圍】召喚卷(summon_ticket_*)與鬥技場召喚卷(_arenaGrantSummonVoucher)「保證英雄」路徑刻意不動;混池為「只增不減」不影響任何存檔守門;寵物訓練書非發放/販賣品、不入帳本。改 index.html + admin_panel.js(僅版號對齊 v4.1.0,內容未改)+ game_changelog.js;hero_db.js 不動。六點版本同步 → v4.1.0;GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.19.0)。',
    ],
  },
  // v4.0.0 — 寵物馴養大系統 Phase A+(好感度累積制+寵物小屋+馴養知識問答+隨機寵物召喚卷)
  {
    ver: 'v4.0.0',
    date: '2026-07-03',
    brief: [
      '🏠【全新「寵物小屋」開張!】寵物圖鑑上方多了一顆大大的「🏠 寵物小屋」按鈕!邀請 3 隻馴養好的寵物入住,每天可以和每隻寵物「撫摸🤚、玩耍🎾、餵食🍽」各一次——會有可愛的愛心動畫、閃亮音效,還有小屋專屬的背景音樂!',
      '🍽【餵食大學問】餵食要從下方的「動物主食大百科」食物表(依 植物/蟲/肉/水產 分類)選出這隻寵物真正的主食:餵對了 💖好感+2、EXP+1;餵錯 💖好感−1,但可以一直重試到餵對為止——順便學會每種動物吃什麼!(提示:寵物圖鑑的科普資料裡都有答案)',
      '💖【好感度全新改版】好感度改成「自己累積」的了(大家都從 0 開始):和寵物一起戰鬥每場有 20% 機率 +1、打贏任何 BOSS 固定 +1、小屋撫摸/玩耍 +1、餵對主食 +2。累積到 25/50/75/100,主人倒下時寵物會救活他(回 10/20/30/40% 的血),滿 100 還能多放一次寵物極限爆發!',
      '📝【馴養變成知識挑戰】戰鬥中用飼料馴養寵物時,會先考你 1 題「這隻寵物的小知識」(別名/主食/習性/天敵四選一):答對馴養成功率 ×1.5、答錯 ×0.5!先把寵物圖鑑的科普資料讀熟,馴養就更容易成功!',
      '🎟️【新道具「隨機寵物召喚卷」】由老師獎勵發放的珍貴道具!在寵物圖鑑上方使用,直接收服 1 隻你還沒收錄的寵物(SSR 10%/SR 30%/R 60%)!',
      '📚【說明同步更新】登入的「近期活動與新角色」新增寵物系統完整介紹;新手教學「📚 遊戲指引」新增第 ⑥ 章「寵物系統」!',
    ],
    items: [
      '★ v4.0.0【寵物小屋】入口在寵物圖鑑最上方(大按鈕);全螢幕小屋場景+專屬背景音樂。3 個草蓆槽位由你自選任何已馴養寵物入住(可隨時移出換人);每天(台灣時間換日)可與每隻入住寵物互動:撫摸/玩耍(各 EXP+10、💖好感+1)、餵食(選對主食 💖好感+2、EXP+1;選錯 💖好感−1 可重試,重試到對為止才算完成當日餵食)。互動時愛心飄升+閃亮天使音效+寵物開心跳動。互動紀錄雲端同步:換平板也不能重複刷。',
      '★ v4.0.0【好感度改版】好感度由「寵物等級×5」改為「獨立累積制」:所有寵物從 0 開始、上限 100(MAX)。累積來源:①跟隨英雄出戰的寵物,每場戰鬥 20% 機率 +1 ②戰勝任意 BOSS(貓空/日本/台灣環島/埃及等關卡魔王)固定再 +1 ③小屋撫摸/玩耍 +1 ④餵對主食 +2(餵錯 −1)。忠誠夥伴四階門檻與效果完全不變:好感度 25→主人倒下復活 10%HP / 50→20% / 75→30% / 100→40%+寵物極限爆發多 1 次(每場戰鬥限 1 次·所有防護之後的最後一道防線)。',
      '★ v4.0.0【馴養知識問答】戰鬥中按 🐾 馴養選擇飼料後,先回答 1 題該寵物知識問答(四選一;題目取自寵物圖鑑科普資料的 別名/主食/特殊習性/主要天敵,干擾選項來自其他寵物):答對本次成功率 ×1.5、答錯 ×0.5(最終成功率保持在 5%~95% 之間)。此問答沒有答題獎勵、也不能使用法寶;答錯仍會進行馴養並消耗飼料。',
      '★ v4.0.0【隨機寵物召喚卷】新道具 🎟️(老師課堂獎勵/全體獎勵/虛寶序號皆可發放):使用 1 張,從你「尚未收錄」的寵物中依 SSR 10%/SR 30%/R 60% 機率直接馴養收服 1 隻(Lv.1、好感 0,馬上可設定跟隨或入住小屋);若某稀有度已全收錄,機率會自動分配到還有缺的稀有度;28 隻全數收錄後使用會自動轉換成 🍱 頂級寵物飼料 ×1,絕不浪費。使用地點:寵物圖鑑最上方(有券時才會出現金色使用按鈕)。',
      '★ v4.0.0【動物主食大百科】小屋下方常駐食物表,25 種食物依「🌿 植物與甜食/🐛 蟲類/🍖 肉類/🐟 水產類/✨ 特殊」分類;每隻寵物的正確主食完全依照寵物圖鑑科普資料設計(例:綠蠵龜吃水草海藻、聖䗴神蟲吃糞球、奈良神鹿還可以餵鹿仙貝!)。',
      '★ v4.0.0【資料安全】好感度(aff)併入 tamedPets 既有最高規格保護(三槽合併逐鍵取最大·字串版免疫雲端殘留·只增不減);小屋入住槽位與每日互動紀錄隨主存檔雲端同步(同一天的互動紀錄跨裝置取聯集,防止換平板重複互動刷好感)。誤刪是大忌、寧漏勿刪。',
      '★ v4.0.0【範圍】改 index.html(好感度累積制+寵物小屋+主食表+馴養問答+召喚卷+圖鑑說明/近期活動/新手教學第⑥章雙版文案)、admin_panel.js(GM 三獎勵產生器新增 🎟️ 隨機寵物召喚卷發放)、game_changelog.js(本公告)。hero_db.js/arena.js/world-boss.js/sw.js 未改免重傳;無新 firestore.rules 需求(小屋資料隨主存檔走既有 self-write 規則)。版本同步 → v4.0.0;移除最舊 v3.18.0 維持 20 筆。',
    ],
  },
  // v3.37.0 — 寵物馴養系統 Phase A(戰鬥馴養+跟隨英雄+寵物升級+稀有度)
  {
    ver: 'v3.37.0',
    date: '2026-07-03',
    brief: [
      '🐾【寵物馴養系統上線!】現在可以把冒險中遇到的寵物「馴養」成自己的了!先到商店購買「寵物飼料」(便宜/高級/頂級三種),戰鬥中攜帶「未馴養」的寵物時,按下新的 🐾 馴養按鈕餵牠,成功就永遠跟著你!(飼料愈好成功率愈高,稀有度愈高的寵物愈難馴服)',
      '🎓【寵物跟隨英雄】馴養成功的寵物可以在「寵物圖鑑」或英雄詳細頁設定「跟隨」一位英雄:出戰時自動帶著牠、附加素質加成(HP/攻擊/特技/速度),還能享有寵物原本的戰鬥效果!每位英雄限跟隨 1 隻。',
      '⭐【寵物會升級】跟隨的寵物在「打贏」的戰鬥後會獲得經驗值,升級後素質加成愈來愈多(最高 Lv.20)!寵物圖鑑現在也會顯示每隻寵物的稀有度(SSR/SR/R)與馴養等級。',
      '💖【共同天賦「忠誠夥伴」】所有馴養的寵物都有!寵物等級愈高、好感度愈高(好感度=等級×5,Lv.20=100 滿):主人倒下的瞬間,寵物會立刻救活主人(每場戰鬥限 1 次)——好感度 25→回 10%HP、50→20%、75→30%、100→40% 還能多用一次寵物極限爆發!',
      '🔧【三隻寵物調整】石虎:速度加成改為「固定+20」(不再依速度高低變動);白頭翁:免疫不利狀態機率提升到 75%,而且連「強化版」不利狀態也能免疫;黑冠麻鷺:馴養後變成「每場戰鬥免死一次、而且不會離去」!',
    ],
    items: [
      '★ v3.37.0【馴養玩法】商店新增三種寵物飼料:便宜的寵物飼料(300 知識幣·每日 10 個·基礎成功率 30%)/高級寵物飼料(1200·每日 5 個·60%)/頂級寵物飼料(5000·每日 1 個·100%);實際成功率=飼料基礎率−寵物稀有度懲罰(SSR −15%/SR −10%/R −5%)。冒險戰鬥中攜帶「未馴養」的寵物且背包有飼料時,行動列出現 🐾 馴養按鈕→選飼料餵食(每回合限嘗試 1 次·成功失敗都消耗飼料);成功時寵物卡上綻放彩色星星、寵物永久入庫。世界 BOSS 戰不開放馴養。',
      '★ v3.37.0【稀有度】28 隻寵物分為 SSR 8 隻(荷魯斯之鷹/聖䗴神蟲/阿努比斯胡狼/托特聖䴉/變化狸/對馬山貓/翠鳥/石虎)、SR 13 隻(櫻花鉤吻鮭/綠蠵龜/台灣藍鵲/鱟/喜鵲/白頭翁/梅花鹿/黑冠麻鷺/丹頂鶴/錦鯉/綠雉/日本大山椒魚/奈良神鹿)、R 7 隻(台灣黑熊/台灣獼猴/月輪熊/日本鱟/五色鳥/雪猴/白鼬);寵物圖鑑卡片與詳細頁都會顯示稀有度徽章。',
      '★ v3.37.0【跟隨與升級】馴養後的寵物有五種成長型(攻擊/特技/速度/坦克/均衡),Lv.1 素質合計 +10、每升 1 級主方向再 +1(Lv.20 封頂);跟隨的英雄出戰時自動附加素質並攜帶該寵物(享有寵物戰鬥效果;若戰鬥中另外攜帶同名寵物,效果不重複疊加)。經驗值只在「打贏」的主戰鬥後發放(稀有度愈高成長愈慢:SSR 每場 2 點/SR 4 點/R 10 點·每 100 點升 1 級·龍王祝福經驗加成也適用);借來的好友英雄不觸發。',
      '★ v3.37.0【共同天賦·忠誠夥伴】所有已馴養寵物共通:好感度=寵物等級×5(Lv.20=100)。攜帶該寵物的玩家英雄倒下時,寵物立即使主人復活(每場戰鬥限 1 次;觸發優先度置於所有技能與寵物效果「之後」——排在倒下免疫、黑冠麻鷺免死等全部攔截之後,作為最後一道防線):好感度 25→10%HP / 50→20%HP / 75→30%HP / 100→40%HP,且滿 100 可多使用一次寵物極限爆發(爆發系統於後續版本實裝,旗標已就緒)。寵物圖鑑詳細頁顯示好感度進度條與目前效果。',
      '★ v3.37.0【三隻效果修正】石虎:原「速度+20%」改為「速度固定+20」;白頭翁:免疫不利狀態機率 60%→75%,且明確涵蓋「強化版」不利狀態(沿用既有攔截點·動物學家在場照常加倍·上限 95%);黑冠麻鷺:未馴養時維持原樣(擋一次致命後離去),馴養後升級為「每場戰鬥免死一次(隊上有動物學家時 2 次)、寵物不會離去」。',
      '★ v3.37.0【資料安全】馴養資料(tamedPets)與馴養帳本(_petTameHistory·記錄每次馴養的時間與帳號)比照英雄/至寶最高規格:三槽合併採「聯集+逐鍵取最大」只增不減、字串版 tamedPets_s 免疫雲端深合併殘留、跟隨設定即時雲端同步;誤刪是大忌、寧漏勿刪。',
      '★ v3.37.0【範圍】改 index.html(資料層+戰鬥馴養按鈕/選單+商店/背包三飼料+跟隨套用+寵物EXP+寵物圖鑑改造+英雄詳情🐾寵物槽+三隻效果修正+黑冠麻鷺馴養分支);game_changelog.js 新增本公告;admin_panel.js 內容未改僅版號對齊。hero_db.js/arena.js/world-boss.js/sw.js 未改免重傳。本輪無新 firestore.rules 需求(tamedPets 隨主存檔走既有 self-write 規則)。七點版本同步 → v3.37.0;移除最舊 v3.17.9 維持 20 筆。',
    ],
  },
  // v3.36.0 — 日本 12 隻寵物全新獨立效果(不再複製台灣同名寵物)+動物學家天賦加倍
  {
    ver: 'v3.36.0',
    date: '2026-07-02',
    brief: [
      '🐾【日本寵物大改版】日本關卡的 12 隻寵物全部換上「全新獨特能力」,不再和台灣寵物重複!每一隻都有自己的專屬效果,搭配不同英雄會有全新玩法。',
      '✨ 舉幾個例子:月輪熊讓你「暴擊率+30%」、雪猴讓你的攻擊「必定命中」、變化狸「每回合免疫 1 次傷害」、翠鳥「有機會搶先行動」、日本鱟「每回合多 30 點護盾」、錦鯉「治療技能更省能量」!',
      '🦕【搭配動物學家更強】只要隊上有「動物學家」,這些日本寵物的效果會直接「加倍」(例如暴擊+30%→+60%、免疫 1 次→2 次),值得專門帶一隻動物學家來強化寵物!',
    ],
    items: [
      '★ v3.36.0【日本 12 寵物全新獨立效果】原本日本 12 隻寵物是「直接複製台灣同名寵物的效果」,本次全部改為各自獨立的全新能力:月輪熊(攻擊時暴擊率+30%)、雪猴(攻擊必定命中·無視對方迴避與隱身)、對馬山貓(受攻擊時30%完全閃避)、丹頂鶴(受水/火/風/土/草屬性傷害-30%並恢復2能量)、錦鯉(使用治療技能時能量消耗-50%)、綠雉(受傷時30%機率將該次傷害的50%轉為恢復HP)、日本大山椒魚(每回合恢復最大HP的20%)、翠鳥(每回合50%機率搶先行動)、日本鱟(每回合獲得30點護盾值)、奈良神鹿(受光/暗屬性傷害-30%並恢復2能量)、白鼬(自身有利狀態持續回合數+1)、變化狸(每回合可免疫1次任何傷害·含多段)。',
      '★ v3.36.0【動物學家加倍】隊上有動物學家存活時,上述日本寵物的「可增加」效果一律 ×2(沿用既有「獸盟·友方寵物效果+100%」機制):暴擊率+30%→+60%、閃避30%→60%(上限95%)、屬性減傷30%→60%(上限90%)、回能2→4、治療省能50%→90%(上限)、綠雉機率30%→60%轉化50%→100%、翠鳥搶先50%→95%、每回合護盾30→60、每回合回HP20%→40%、白鼬有利+1→+2回合、變化狸免疫1次→2次;雪猴「必定命中」為開關型無倍率。',
      '★ v3.36.0【實作】EQUIP_DB 日本 IIFE 由「Object.assign 複製台灣寵物」改為每隻獨立定義新效果欄位(借用對應台灣寵物的 svg 保持視覺·完全不繼承台灣的 onEquip/onRemove/healBonus/reflect 等效果·sell:5·petImg 沿用·_EQUIP_SHORT 與詳情 d 說明同步)。引擎 hook:doDmg 頂部(月輪熊 critBoost/雪猴 ignoreEvasion/對馬山貓 return0/變化狸免疫次數 return0)、doDmg teq 減傷區(丹頂鶴&奈良神鹿 屬性判定仿聖冥法師·綠雉 doHeal)、startTurn(翠鳥於 renderTurnOrderBar 前拉滿速度排最前·下回合開頭還原·日本鱟 bigshield·變化狸重置免疫次數·大山椒魚沿用 hpRegenPct)、skillCost(錦鯉治療名單 _JP_HEAL_SKILL_SET ×0.5)、addBuff(白鼬 dur+1)。數值/機率/次數型皆吃動物學家加成、機率類加 cap;鐵律1.207 能量權威不變(丹頂鶴/奈良神鹿回能為明列例外)。',
      '★ v3.36.0【BOSS 回血上限】新增 _jpBossHealCap：當「會恢復 HP 的寵物」（日本大山椒魚每回合20%、台灣鱟10%、綠雉受傷轉治療）套用在真 BOSS（世界BOSS龍王＋關卡BOSS/埃及雙王）身上時，單次恢復量上限壓成該 BOSS 最大HP的10%，避免 BOSS 血厚導致回血拖延戰鬥；套用於 startTurn 兩處(hpRegen/hpRegenPct)＋doDmg teq 綠雉共三點，玩家英雄／菁英／小怪／競技場不受影響。',
      '★ v3.36.0【範圍】只改 index.html(EQUIP_DB 日本 IIFE + doDmg/startTurn/skillCost/addBuff 各 hook + _jpBossHealCap);admin_panel.js/hero_db.js 內容未改僅 manifest 版號對齊、免重傳。寵物動物小知識(PET_KNOWLEDGE)與圖鑑分頁不受影響。七點版本同步 → v3.36.0;移除最舊 v3.17.8 維持 20 筆。',
    ],
  },
  // v3.35.0 — 好友線上狀態顯示修復(在線好友不再顯示離線·登入通知即時亮綠並顯示上線時間)
  {
    ver: 'v3.35.0',
    date: '2026-07-02',
    brief: [
      '🟢【好友線上狀態修復】修正好友明明在線上、好友清單卻一直顯示「離線」灰燈的問題!現在打開好友清單,會正確顯示哪位好友正在遊戲中。',
      '🔔【登入通知一亮就是線上】開了「登入通知」的好友一上線,除了右下角彈出提醒,好友清單上那位好友也會「立刻」亮成綠色的「線上」並顯示他的上線時間,不用等!',
    ],
    items: [
      '★ v3.35.0【根因】好友線上圓點與登入通知都靠監聽 presences(在線狀態)集合,但原本是「一次訂閱整個集合」——在全校幾百人同時上線、集合高頻變動時,這種訂閱會停止推送更新/卡在舊資料,導致在線好友一直被判離線、登入通知也不會跳(與 v3.12.2 記載的老問題同源)。',
      '★ v3.35.0【修法·好友圓點】改為「只讀好友本人那幾筆」:好友清單打開時,每 15 秒對每位好友各自的在線資料做一次「強制向伺服器讀取」(不吃舊快取),可靠反映最新狀態;在線判定門檻由 90 秒放寬到 150 秒(容忍慢網漏一拍心跳)。',
      '★ v3.35.0【修法·登入通知】從壞掉的「整集合訂閱」脫鉤,改為一支常駐輕量輪詢:每 30 秒「只讀有勾登入通知的那幾位好友」(沒勾任何人就完全不讀·零額外用量),偵測到好友從離線→上線就彈出提醒,同時把該好友狀態設為線上、記下上線時間;若此時好友清單正開著,圓點會立刻亮綠並顯示上線時間(老師需求)。沿用原本的防洗頻(每位好友 5 分鐘冷卻)與首次只建基準不補彈。',
      '★ v3.35.0【讀取量降低為原則】以上兩者都只讀「必要的那幾位好友」而非整個在線集合,整體雲端讀取量比原本更省;登入時啟動通知輪詢、登出/關頁時停止。',
      '★ v3.35.0【範圍】只改 index.html(_fbWatchFriendsPresence 重寫為 per-friend 輪詢、移除 _fbWatchOnlineCount 內的通知偵測呼叫、新增 _friendLoginDetectFromHb/_fbFriendNotifyPollOnce/_fbStartFriendNotifyPoll/_fbStopFriendNotifyPoll);admin_panel.js/hero_db.js 內容未改;免改 firestore.rules(全為讀自己/好友既有權限)。⚠ 首頁「目前在線」人數仍用整集合訂閱(全體學生都在跑=最大讀取源·下一輪再決定改法);兩台裝置都要更新到 v3.35.0 才會互相顯示在線。七點版本同步 → v3.35.0;移除最舊 v3.17.7 維持 20 筆。',
    ],
  },
  // v3.34.0 — 新英雄「大刀勇士」上線(5年4班 陳柏安設計·SSR·⚔傷害+💚回復)
  {
    ver: 'v3.34.0',
    date: '2026-07-02',
    brief: [
      '🌬️ 新角色介紹:大刀勇士(5年4班 陳同學設計·SSR)!曾經遠近馳名、擁有霸者決鬥之力的傳說勇士,現已加入召喚星空 SSR 稀有池,快去召喚看看!',
      '🗡️ 天賦「愈戰愈勇」:每回合行動前攻擊與速度都會越變越強(直到倒下),而且他的能力「不會被降低」——任何降攻降速招式對他通通無效!',
      '⚔️ 技能「霸道裂地斬」一刀 500% 重斬單一目標(無視有利狀態·對 BOSS 更痛);「勇士決勝之力」連斬 4 刀隨機目標,每一刀都把一半傷害化為治療,守護 HP 最低的夥伴!',
      '💥 極限爆發「奧義‧勇士大刀滅絕斬」:大刀化作滅絕之光連斬三閃(必中·無視有利),每一閃都邊打邊補血,對 BOSS 傷害還會加倍!',
    ],
    items: [
      '★ v3.34.0【新英雄】大刀勇士(5年4班 陳柏安設計,SSR,⚔傷害+💚回復):加入召喚星空 SSR 稀有池與貓空解鎖池;圖鑑含完整介紹、天賦/技能/爆發之簡單風+精緻風雙版本說明(鐵律1.232)。',
      '★ v3.34.0【天賦】愈戰愈勇:每回合行動前 攻擊/速度 各 +2(每天賦級 +1·Lv10=+11/回合),累積上限 +30,直到倒下(復活後重新累積);且「不會被降低能力」——所有降攻/降速/降特/降迴避/降暴擊類狀態與直寫點對他一律免疫(受傷增加類非能力降低照常)。',
      '★ v3.34.0【技能】S1 霸道裂地斬(消耗6):攻擊 500% 傷害 1 名目標(無視有利狀態·非必中),對 BOSS 傷害 +50%(固定);升級每級 +5%。S2 勇士決勝之力(消耗6):攻擊 80% 對隨機目標造成 4 次傷害(每次重挑),每次實際傷害的 50% 轉為治療,恢復我方 HP 最低且未滿血的夥伴(固定);升級每級 +5%。雙路徑實作(玩家+AI·鐵律1.128)。',
      '★ v3.34.0【極限爆發】奧義‧勇士大刀滅絕斬:攻擊 250% 對隨機目標造成 3 次傷害(必中·無視有利),每次實際傷害 50% 轉為治療同 S2,對 BOSS 傷害 ×2(固定);升級每級 +10% 乘算(250→350%)。走 doDmg 不加 bypassShield → 龍王護盾+世界BOSS 5000 上限照常生效(鐵律1.31)。',
      '★ v3.34.0【工程】天賦免疫=共用 helper _bvStatDownImmune + addStatus 攔截 + 10 個直寫點守門;傷害轉治療不帶 isHeal(固定 50% 不吃技能等級放大·禁療/減療守門無條件生效);七點版本同步 v3.34.0;資料層 14 表在 hero_db.js v3.34.0;GAME_CHANGELOG 移除最舊 v3.17.6 維持 20 筆。',
    ],
  },
  // v3.33.0 — 好友「登入通知」勾選(上線右下角彈窗+音效)+ 好友清單最近登入/離線時間 + 老師訊息專屬音效
  {
    ver: 'v3.33.0',
    date: '2026-07-02',
    brief: [
      '🔔【好友清單新增「登入通知」】在好友清單裡,每位好友名字下方多了一顆「🔕 通知關 / 🔔 通知開」按鈕。點成「🔔 通知開」後,只要那位好友上線,你正在玩的畫面右下角就會跳出提醒(還有音效)!想關掉再點一下就好。(這個設定只存在你這台裝置上)',
      '🟢【好友清單顯示「最近上線 / 離線時間」】好友在線會顯示「🕐 幾點上線」、剛離開顯示「剛離開·幾分鐘前」、離線顯示「最後上線 幾分鐘前(或日期)」,好友動態一目瞭然!',
      '👨‍🏫【老師訊息專屬音效】老師傳訊息給你時,現在會有專屬提示音效,更不容易錯過老師想跟你說的話!',
    ],
    items: [
      '★ v3.33.0【好友登入通知·需求1·index.html】新增 _getFriendLoginNotifySet/_toggleFriendLoginNotify(勾選狀態存 localStorage lxps_friend_login_notify_{uid}·純本地偏好·不寫雲端/免改 firestore.rules)+ _showFriendLoginToast(右下角堆疊彈窗·頭像取好友代表英雄·名稱走 _getFriendLabel 遮罩·~6s 淡出·播 sfx-friend-login 找不到退回 sfx-confirm·z-index 2147483200 低於 GM 訊息彈窗)。',
      '★ v3.33.0【偵測掛既有 snapshot·零額外 listener】_friendLoginDetectFromSnap(snap) 掛進常駐的 _fbWatchOnlineCount presences onSnapshot:對每個「已勾選」好友判定 lastHeartbeat 150 秒內視為 online,偵測 offline→online 轉變才彈;首次(或換帳號)只建 baseline 不補彈已在線好友;每位好友 5 分鐘冷卻防洗頻;剛勾選以當下線上狀態當 baseline 避免立刻補彈。',
      '★ v3.33.0【好友清單最近登入/離線時間·需求2·index.html】登入時把 lastLoginAt/lastSeenAt 寫進自己的 players/{uid} 主檔(self-write 非停權欄位·非存檔白名單不進載入路徑·免改 firestore.rules);心跳每 4 分鐘鏡射 lastSeenAt 一次(節流·非每次心跳);登出/關頁 best-effort 補寫 lastSeenAt(誤差 ≤4 分)。好友端經既有 _fbLoadFriend 讀對方主檔 + presence meta;_fbWatchFriendsPresence 回傳 metaMap{uid:{loginAt,lastHb}},_applyFriendPresenceDots 更新 ._friend-presence-time(在線→🕐上線時間/剛離開→相對時間/離線→最後上線相對時間·_friendClockStr/_friendAgoStr)。',
      '★ v3.33.0【老師訊息音效·需求3+工程】_gmChatIncoming 彈窗 appendChild 後播 sfx-gm-message(0.85·訊息.wav)找不到退回 sfx-confirm;新增 audio 元素 sfx-friend-login(好友登入.wav)/sfx-gm-message(訊息.wav)。兩 render 路徑 _renderFriendPanelImpl/_refreshFriendListInner 同步(時間文字行+通知 toggle);七點版本同步 v3.33.0·20 個 inline script node --check 全過·GAME_CHANGELOG 移除最舊 v3.17.5 維持 20 筆。⚠ 需老師確認 好友登入.wav / 訊息.wav 已在 repo 根目錄(已驗證 200)。',
    ],
  },
  // v3.32.0 — 本日獎勵題庫(每日 8:00 自動更換)+ 老師即時訊息(可回覆)+ GM 線上玩家查詢
  {
    ver: 'v3.32.0',
    date: '2026-07-02',
    brief: [
      '🎲 冒險關卡題庫選單新增「本日獎勵題庫」!每天早上 8:00 自動更換一個隨機學科,當天玩這個題庫,結算獎勵(經驗、知識幣、掉寶率)通通 +25%——每天都來看看今天輪到哪一科!',
      '📌 本日獎勵題庫放在課堂複習的上方,金橙色框框超好認;明天早上 8:00 就會換下一科,天天玩不一樣的題庫最划算!',
      '👨‍🏫 新增「老師的訊息」:老師可能會在你玩的時候傳訊息給你,畫面會直接跳出來;想回覆的話直接打字送出,老師就收得到囉!',
    ],
    items: [
      '★ v3.32.0【本日獎勵題庫】window._dailyBonusInfo:台灣 8:00 == UTC 0:00 → dayKey 取 UTC 日期,hash 決定科目(deterministic·所有裝置同日必同科·零雲端寫入·相鄰日 best-effort 不重複);科目池=一般學科(排除生活常識/國際交流/課堂複習/專屬解鎖題庫)。',
      '★ v3.32.0【加成折入】_gameBlessingMult:本場冒險科目==當日科目 → ×1.25;GM「🎓 課堂獎勵加成」同科目已生效則本段跳過(防雙重疊乘),GM 加成其他科目則兩者獨立;英雄解鎖機率不吃加成(同祝福鐵律)。GM 手動加成後台完整保留。',
      '★ v3.32.0【選單】_advGroupSubjects 新增 daily 群組置最前(課堂複習上方),當日科目自一般學科移入避免重複按鈕;label 含 🎁 自動 reward-flash;subject 場景+多步驟兩 render 路徑共用自動生效。',
      '★ v3.32.0【GM 線上玩家查詢】首頁「🔴 目前在線」改可點擊(僅管理員有反應):列出在線玩家的名冊標籤、登入時間(presence 新增 loginAt)、目前狀況(scene:世界BOSS/戰鬥/知識王/召喚星空/關卡頁/首頁·心跳每分鐘更新)、會員資料查看、✉️ 傳訊、💬 看回覆。',
      '★ v3.32.0【GM↔玩家訊息】GM updateDoc players/{uid}._gmChat(isAdmin 路徑);玩家端掛既有主檔 onSnapshot 偵測即時彈窗(已讀基線 localStorage 綁 uid 防重複彈),可回覆 → 自寫 _gmChatReply(self-write 非停權欄位);兩欄位非存檔白名單,merge:true 存檔不清;完全免改 firestore.rules。',
    ],
  },
  // v3.31.0 — 新英雄「聖冥法師」上線(4年7班 洪晨軒設計·SSR·光暗雙屬性)
  {
    ver: 'v3.31.0',
    date: '2026-07-02',
    brief: [
      '🌬️ 新角色介紹:聖冥法師(4年7班 洪同學設計·SSR)!聖法師與冥法師合而為一的光暗雙生大法師,現已加入召喚星空 SSR 稀有池,快去召喚看看!',
      '☯️ 天賦「光暗共生」:被光或暗屬性打到有機率變成回血;每回合行動前先恢復 HP,還會自己解掉 1 個不利狀態!',
      '⚔️ 技能「死之轉刃」讓 2 名對手 暈眩+天賦失效+被動失效;「生與死的洗禮」救回 2 名最虛弱的隊友(倒下也能復活)再全體攻擊!',
      '🌗 極限爆發「聖光與暗影的調停」:全隊回血復活+光與暗兩波全體攻擊,還讓敵人染上「光影」——被打或中狀態時會互相複製,越多敵人越痛!',
    ],
    items: [
      '★ v3.31.0【新英雄】聖冥法師(4年7班 洪晨軒設計,SSR,⚔傷害+💚回復+🛡控場,光/暗雙屬性):加入召喚星空 SSR 稀有池與貓空解鎖池;圖鑑含完整介紹、天賦/技能/爆發之簡單風+精緻風雙版本說明(鐵律1.232)。',
      '★ v3.31.0【天賦】光暗共生:受光/暗屬性直接傷害 30%(+3%/天賦級,上限57%)完全轉化為等量治療;每回合行動前恢復 15%(+3%/級,上限42%)最大HP並消除自己 1 個普通不利狀態(Lv10 MAX 可消強力版)。',
      '★ v3.31.0【技能】S1 死之轉刃(消耗6·Lv10 MAX 減為5):60%(+2%/技能級,上限95%)使隨機 2 名對手 暈眩+封印天賦+封印被動 各 2 回合(對手只剩 1 名時 80% 起跳;對 BOSS/菁英成功率減半)。S2 生與死的洗禮(消耗6):2 名 HP 比例最低友方——倒下者以 50%(+3%/級)HP 復活、存活者 HP 完全恢復;再對全體對手 特技 350%(每升+5%)分攤傷害。',
      '★ v3.31.0【爆發】聖光與暗影的調停:全體友方恢復 50%HP(可復活)+ 特技 300%(每升 1 級 +10% 乘算,Lv4 MAX=420%)光屬性與暗屬性共兩次全體分攤(必中·無視有利)+ 全體對手陷入新狀態「🌗 光影」2 回合——帶光影的目標受到傷害或不利狀態時,會複製 1 次給另一名隨機光影目標(最多複製 1 次·複製目標可重疊)。',
      '★ v3.31.0【工程】鐵律1.128 S1/S2 雙路徑(execSkill+aiUseSkill)·鐵律1.31 光影複製與爆發分攤皆走 doDmg 受世界BOSS 5000 上限·七點版本同步 v3.31.0·20 個 inline script node --check 全過。',
    ],
  },
  // v3.30.0 — 鬥技場「📊 傷害排行」;六隻 R 起始英雄初始圖修復(需上傳 6 張圖檔);GM 雙開關 課堂複習 🎁+25%/⭐再+25%(冒險+知識王)
  {
    ver: 'v3.30.0',
    date: '2026-07-02',
    brief: [
      '📊【鬥技場新增「傷害排行」!看看你的最強一擊】鬥技場主頁右上角多了一顆「📊 傷害排行」按鈕,點開就能看到你的每位英雄、每個招式打出過的「最大單次傷害」排行榜(由高到低,前三名還有獎牌標記)。每打完一場鬥技場都會自動更新紀錄,快去刷新你的最強一擊吧!(答題獎勵的固定傷害不列入,比的是英雄招式的真本事)',
      '🖼️【六隻起始英雄的圖片回來了】幼兒園小孩、弦樂團員、動物學家、小劇團員、程式設計師、電腦繪圖師這六隻起始英雄,先前初始(LV1)的可愛版圖片一直讀不到、顯示破圖,現在已經修復,圖片會正常顯示囉!',
      '📖【課堂複習的加成獎勵改由老師控制】課堂複習的兩層加成——「🎁 獎勵 +25%」(冒險關卡和知識王都有)和某些單元的「⭐ 加強複習期間獎勵再 +25%」——現在都改成老師可以開關。老師關閉時,對應的加成標籤會消失、結算也不再加成;老師配合課程進度重新開啟後就會恢復。看到 +25% 標籤亮著,就代表老師希望大家多練那些題庫喔!',
    ],
    items: [
      '★ v3.30.0【鬥技場傷害排行·index.html·需求3】資料源沿用既有 doDmg hook 的 G._arenaDmgSources(v3.15.54·只在鬥技場且攻擊者為我方時收集),push 物件新增一欄 fx=opts.fixedDmg(標記答題獎勵/固定傷害·純加欄位,arena.js 的 arenaDamageDetail 聚合只讀既有 4 欄=零回歸)。新增 window._arenaDmgRankAbsorb:於三個鬥技場結算點(10 回合上限 nextRound、正常 KO _showResultWithDrama hook、投降)在 _arenaSettleReward→_arenaSubmitBattleLog 清空來源之前吸收,依「英雄+招式」鍵取最大單次 amount、排除 fx,max-merge 寫 localStorage(lxps_arena_dmg_rank_綁uid·上限 200 鍵)→天然冪等,重複吸收無害。純本地、零雲端、零經濟風險;冒險/世界BOSS 一律不吸收(_adventureMode 守門)。arena.js 檔案未改、維持 v3.15.60 免重傳。',
      '★ v3.30.0【傷害排行 UI·index.html】鬥技場大廳標題列(al-header)離開鈕左側靜態新增「📊 傷害排行」鈕(inline onclick 執行期查 window,免跨 script 依賴);window._arenaShowDmgRank 開全螢幕視窗(z=2147483647·點背景/✕ 關閉·完全鏡像 v3.28.0 交換記錄模式),列「英雄 × 招式 × 💥最大傷害」降序前 100 名,前三名 🥇🥈🥉;空狀態說明依 _artStyle 備簡單風/精緻風兩版(鐵律1.232)。',
      '★ v3.30.0【六隻 R 起始英雄初始可愛版圖 404 根因與修復·免改程式】根因:hero_db.js 這六隻的 LV1 底圖 URL(Q幼兒園小孩(縮圖).png 等 6 檔)指向 LXPSGAME repo,但這些檔案只存在於早期舊 repo「clarebox123jp-art/-」,批次改 URL 到 LXPSGAME 時從未搬移(git 全歷史查證:LXPSGAME 從未存在這 6 個檔名)→ 上線以來一直 404。修法:自舊 repo 救回原始 6 張 PNG,由老師上傳到 LXPSGAME repo 根目錄(檔名必須一字不差)→ 零程式變更、零風險。LV10 進化圖與其他起始英雄(籃球隊員/直笛團員/田徑隊員/小力)不受影響。',
      '★ v3.30.0【GM 雙開關:課堂複習 🎁基礎+25% / ⭐加強複習 再+25%·index.html+admin_panel.js】老師需求:所有課堂複習加成皆可開關,依課程進度決定學生選題庫的動力。新增雲端旗標 gameConfig/reviewBoost={baseEnabled,doubledEnabled,updatedAt,updatedBy}(同 classRewardBoost 規則:玩家讀/GM 寫·免改 firestore.rules·獨立文件不被課堂獎勵加成 merge:false 覆寫);學生端監聽 _fbWatchReviewBoost(掛休息排程同一啟動點·回呼即時刷新關卡頁黃色 flash)+雙中央閘門 window._reviewBaseActive/_doubledReviewActive(欄位===false 才關·讀不到雲端=預設全開=維持現狀·向下相容)。基礎 +25% 套閘 6 點:冒險結算 _advCalcRewardMult 的 _isReviewSubject(唯一冒險發獎點·下游 isReview UI 連動消失)、關卡頁「課堂複習獎勵增加中」flash(_advRefreshReviewBonusUI 關閉時隱藏)、冒險科目選單群組標題 +25% 字樣、知識王結算擲骰 _kingRollReviewBonus 閘門+結算橫幅、知識王大廳卡標 🎁+25%、挑戰鈕浮籤與換科目 log。再+25% 套閘 5 點:直達鈕 _kingGetDoubledReviewTopics、大廳卡標 _isLeftDoubled、結算 _isDoubledSubject、冒險選單兩 render 的 ⭐ badge。GM UI 在「🎓 課堂獎勵加成」卡內子區塊「📖 課堂複習加成開關」:狀態列+查詢+兩組開/關四鈕(_adminReviewBoostQuery/Set·寫入前先讀舊值保留另一欄·無可選串接·同卡免側欄三點同步)。課堂複習科目分區/題庫本身不受開關影響、照常可選。',
      '★ v3.30.0【驗證/版本/範圍】index.html 全部 inline script 通過 node --check、三檔 0 lone surrogate;admin_panel.js 通過檢查、0 個真正可選串接(?.)。七點版本同步 → v3.30.0;GAME_CHANGELOG 維持 20 筆(移除最舊 v3.17.2)。本輪改 index.html＋admin_panel.js(版號＋加強複習開關 GM UI)＋game_changelog.js;hero_db.js 內容未改、維持 v3.25.0 免重傳;arena.js 未改、維持 v3.15.60。另需老師上傳 6 張圖檔到 repo 根目錄。',
    ],
  },

  // v3.29.0 — 新增 GM 選單「🎓 課堂獎勵加成」(隨機一般科目·+25% 知識幣/經驗/掉寶·持續時數開關)
  {
    ver: 'v3.29.0',
    date: '2026-07-02',
    brief: [
      '🎓【老師開「課堂獎勵加成」時，那個科目做冒險更好賺!】當老師開啟「課堂獎勵加成」並指定某一個科目時，你在那個科目的冒險關卡、打完結算時拿到的知識幣、經驗值和掉寶率都會 +25%(加成期間內)。老師會不定期換不同科目、也會設定持續時間，把握加成中的科目多多練習喔!',
    ],
    items: [
      '★ v3.29.0【新增 GM 選單「🎓 課堂獎勵加成」·admin_panel.js】新卡片(世界BOSS 群組·仿龍王的祝福):可「🎲 隨機抽一個一般科目(不重複輪替·整輪抽完自動重來)」+設定持續時數+加成%(預設25)→「🎓 開啟/續期加成」;另有「⛔ 立即關閉」「🔄 查詢目前狀態」。寫 gameConfig/classRewardBoost={enabled,subject,pct,expiresAt,recent[],updatedAt,updatedBy}(gameConfig=GM 寫/登入讀·免改 firestore.rules)。科目清單取自 _kingGetSubjects(一般科目·排除日本關/特殊題庫)。新增 _adminClassBoostQuery/Roll/On/Off + _cbEsc;側欄項 + 世界BOSS 群組登錄;無真正可選串接。',
      '★ v3.29.0【學生端套用·index.html】新增 gameConfig/classRewardBoost 監聽 _fbWatchClassBoost → window._classBoost(掛在休息排程監聽同一啟動點·登入後啟動)。加成折入既有 _gameBlessingMult:當「本場冒險科目 _advPlayerSubject == 指定科目」且啟用未過期時,倍率再 ×(1+pct%)→自動作用於既有所有結算發獎點(知識幣/經驗/各關掉寶率·與龍王的祝福同一套用面;英雄解鎖機率一律不吃加成)。與龍王的祝福乘算並存;科目不符或未啟用時倍率=1.0 完全零影響。',
      '★ v3.29.0【驗證/版本/範圍】index.html 全部 inline script 通過 node --check、三檔 0 lone surrogate;admin_panel.js 通過檢查、0 個真正可選串接(?.)。七點版本同步 → v3.29.0;GAME_CHANGELOG 維持 20 筆(移除最舊 v3.17.1)。本輪改 index.html＋admin_panel.js＋game_changelog.js;hero_db.js 內容未改、維持 v3.25.0 免重傳。需求6(GM 課堂獎勵加成)完成。',
    ],
  },

];
