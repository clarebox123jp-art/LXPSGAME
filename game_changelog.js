// ════════════════════════════════════════════════════════════════════════
//  game_changelog.js  —  LXPSGAME 更新日誌
//  最後更新:2026-06-27  / 目前主程式版本:v3.16.39(修正 iPad 答題獎勵寵物裝備後小怪戰卡死)
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
  // v3.16.39 — 修正 iPad 答題獎勵寵物裝備後小怪戰卡死
  {
    ver: 'v3.16.39',
    date: '2026-06-27',
    brief: [
      '🐾【修正卡死】修正在小怪戰中,答題獎勵抽到寵物、選一位英雄「立即裝備」後遊戲卡住不動的問題(iPad 上每次都會發生)。現在裝完寵物會正常繼續戰鬥。',
    ],
    items: [
      '★ v3.16.39【修正寵物裝備卡死·index.html】根因:小怪戰答題獎勵抽到寵物(get_pet)時會開「選哪位英雄裝備」的選擇器,但程式在玩家還沒選之前就提前呼叫了繼續戰鬥,推進的回合撞上仍開著的選擇器而被擋下且不會重排;玩家選完寵物後又走了錯誤的續戰路徑(只解除暫停·不重新推進回合)→ 沒有任何角色行動·永久卡死。',
      '★ v3.16.39【修法】_advMiniApplyReward 偵測到寵物選擇器開啟時改為延後繼續戰鬥並把該回呼暫存(window._advPetPickerMiniOnDone);_advFinishPetPick 收尾改三條路:小怪戰用暫存的專屬回呼續戰(不走 advOnQuizSkip)、BOSS 新回合答題走 _advFinishRoundQuiz、其餘維持原本。與 v3.14.25 修 BOSS 戰同款 bug 的手法一致(當時漏修小怪戰)。',
      '★ v3.16.39【範圍/版本】只改 index.html(_advMiniApplyReward + _advFinishPetPick 兩處);admin_panel.js + game_changelog.js 僅版本 bump 對齊。五點版本同步 → v3.16.39(hero_db.js 維持 v3.16.22)。本套含 v3.16.36/37/38,同一批上傳。',
    ],
  },
  // v3.16.38 — 10連抽稀有上限(各 1) + 答題獎勵寵物選單字放大 + 已解鎖英雄隱藏解鎖提示
  {
    ver: 'v3.16.38',
    date: '2026-06-27',
    brief: [
      '🎰【10 連抽稀有上限】每次 10 連抽最多只會出 1 隻 SSR、1 隻 SR、1 個至寶(同一批不會重複);超過的部分會改成普通獎勵(技能升級書)。讓稀有更珍貴、產出更平均。',
      '🐾【答題獎勵寵物選單字放大】答對題目獲得寵物、選要裝給哪位英雄的視窗裡,寵物功能說明(例如「攻擊+20%」)字放大,看得更清楚。',
      '🔓【解鎖提示優化】已經解鎖小力、幼兒園小孩、機關王雙人組之後,再做該題庫不會再跳「再答對 X 題解鎖」的提示了。',
    ],
    items: [
      '★ v3.16.38【10 連抽稀有上限·index.html】doSummon 連抽迴圈加入本批產出上限:最多 1 隻 SSR、1 隻 SR、1 個至寶;超過上限的那一抽改成普通獎勵(技能升級書 ×2),不另作沒有損失轉換提示(老師裁示乙·感覺像沒中)。因上限=1,同批稀有不可能重複(涵蓋不重複抽取);只動水晶 10 連抽,單抽與召喚卷不受影響(本來就 ≤1)。',
      '★ v3.16.38【寵物選單字放大·index.html】_advShowPetTargetPicker(答題獎勵獲得寵物時選擇裝備英雄的選單)頂部寵物功能說明文字由 font-size:0.95em → 1.35em。',
      '★ v3.16.38【解鎖提示隱藏·index.html】新增 _lxpsUnlockHeroAlreadyDone(q) 依題庫對應英雄判斷是否已解鎖(獎章旗標優先·英雄解鎖清單後援);_trackUnlockHeroProgress 開頭加已解鎖即早退 + 冒險與迷你戰兩處「再答對 X 題解鎖」橫幅各加守門。進度條/詳情頁本來就顯示已解鎖不受影響。',
      '★ v3.16.38【範圍/版本】只改 index.html;admin_panel.js + game_changelog.js 僅版本 bump 對齊。五點版本同步 → v3.16.38(hero_db.js 維持 v3.16.22)。本套含 v3.16.36 王者尊嚴 + v3.16.37 寵物卡字放大,同一批上傳。',
    ],
  },
  // v3.16.37 — 寵物效果說明字放大(攻擊+20% 等看得更清楚)
  {
    ver: 'v3.16.37',
    date: '2026-06-27',
    brief: [
      '🐾【寵物效果說明字放大】英雄卡上的寵物效果說明(例如「攻擊+20%」「速度+20%」「機率不會倒下」)以及寵物名稱原本字太小,現在通通放大,看得更清楚。',
    ],
    items: [
      '★ v3.16.37【寵物效果字放大·只改 index.html】equipExtHTML(英雄戰鬥卡的寵物徽章)寵物效果短語(_EQUIP_SHORT:攻擊+20% 等)由 font-size:16px → 22px、寵物名 20px → 22px;equipSlotHTML(英雄詳情寵物欄)寵物說明 18px → 22px、效果文字 .equip-effect 加行內 font-size:22px 覆蓋 main.css。純行內字級放大·不動 main.css·不改任何版面邏輯。',
      '★ v3.16.37【範圍/版本】只改 index.html(寵物字級 4 處);admin_panel.js + game_changelog.js 僅版本 bump 對齊。四點版本同步 → v3.16.37(hero_db.js 維持 v3.16.22)。本版與上一版 v3.16.36「王者尊嚴」同一批上傳(本套已含 v3.16.36 修正)。',
    ],
  },
  // v3.16.36 — 平衡修正:王者尊嚴至高無上(阿蘇火山龍王爆發不再一發秒殺關卡 BOSS)
  {
    ver: 'v3.16.36',
    date: '2026-06-27',
    brief: [
      '⚔️【平衡修正·王者尊嚴】修正「阿蘇火山龍王」的極限爆發「超光速衝擊波」可以一發直接把關卡頭目(八岐大蛇/埃及雙王/黑暗球‧希望型態 等)秒殺的問題。現在頭目的「鎖血保命」在被逼到絕境的「那一回合」絕不會被擊殺——你仍然可以打出傷害、把頭目打到只剩 1 HP,但牠會以王者之軀撐住、施展覺醒反擊,下一回合你才能真正擊殺牠。',
      '💡【說明】這只影響「關卡頭目」;世界 BOSS 龍王本來就有「單次最多 5000 傷害」的保護,不受這次調整影響。被鎖血的那一回合,頭目仍會正常受到傷害(血量看得到一直往下掉),只是「不會在這一回合被打死」而已,下一回合就能正常擊殺,不會卡關。',
    ],
    items: [
      '★ v3.16.36【王者尊嚴至高無上·index.html】根因:_applyBossLifelineProtection 兩段鎖血(50%/1HP)在 v3.15.17 / v3.15.35 為修「鎖血後整回合打 0、玩家以為打不動」而移除「鎖血回合免疫」設定點 → _lifelineImmuneRound 從此無處寫入 → 阿蘇爆發「超光速衝擊波」(同一目標 5~9 段連轟)的 _asLocked 守門永遠 false → 多段在同一回合內燒穿兩段保命、後續段直接擊殺真 BOSS。修法:鎖血第一段(50%)與第二段(1HP)觸發時重新設 target._lifelineImmuneRound = 當前回合;阿蘇爆發既有 _asLocked(讀此旗標)隨之復活,偵測目標鎖血即停止砲擊(王者之軀絕對免疫·收手)。',
      '★ v3.16.36【死亡免疫地板·不再看起來無敵·index.html】鎖血回合免疫由舊版「整回合 return 0(後續全打 0)」改為「死亡免疫地板」:非致命傷害照常結算(HP 可見下降·不再整回合無敵)、會致命的傷害才夾到剩 1 HP(王者不倒+覺醒反擊);下一回合 _lifelineImmuneRound 不等於當前回合即恢復可擊殺(保證不卡死)。另補一道暴擊額外補扣的 1 HP 地板(_llCritFloor),堵「非致命主傷 + 致命爆擊」這條繞過主鎖血的穿透路徑;DOT/出血/固定傷害皆走同一鎖血函式,一併受地板保護。世界 BOSS 龍王走 5000 cap(_adventureStage 為 worldboss 時早退),不經此地板·不受影響。',
      '★ v3.16.36【範圍/版本】只改 index.html(BOSS 鎖血機制 4 處 + 過時註解 1 處);admin_panel.js 與 game_changelog.js 僅版本 bump 對齊。四點同步 _GAME_LOADED_VERSION + _vers[index.html / game_changelog.js / admin_panel.js] + ADMIN_PANEL_VERSION → v3.16.36(hero_db.js 維持 v3.16.22)。無新增可儲存欄位,不需改 firestore.rules。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.16)。',
    ],
  },
  // v3.16.35 — 後台:救援審核卡接玩家活動查詢 + 老師後台相關更新日誌對玩家隱藏(adminOnly)
  {
    ver: 'v3.16.35',
    date: '2026-06-27',
    adminOnly: true,
    brief: [
      '🛠️【後台·老師端】「帳號救援申請審核」卡:每一筆申請下方新增「📜 查看玩家活動紀錄查詢」鈕,點一下直接切到「玩家活動記錄查詢」頁、自動帶入該玩家 uid 並送出查詢,方便老師核對遊戲紀錄後再決定是否救援。',
      '🔒【更新日誌】所有「跟老師後台有關」的更新項目對一般玩家隱藏,只有老師(管理員)看得到;玩家端只會看到與玩法、獎勵、英雄有關的公告。',
    ],
    items: [
      '★ v3.16.35【救援審核卡接活動查詢·admin_panel.js】_initRescueReqSection 的 _render 每筆申請卡(待處理/已處理皆有)在學生勾選摘要下方加「📜 查看玩家活動紀錄查詢」鈕(class ._rrq-activity·帶 data-uid);wiring 於既有 abtns.forEach 之後新增 actBtns forEach onclick:呼叫 window._switchAdminSection 切到 _admin-activity-section → setTimeout 140ms 填入 _admin-activity-query 的 value=uid → scrollIntoView → 點 _admin-activity-search 自動送出。沿用既有多處「切活動頁帶 uid 查詢」模式·無 ?. 相容舊 iPad。',
      '★ v3.16.35【GM 日誌對玩家隱藏·index.html + game_changelog.js】把純老師後台的更新日誌對玩家隱藏:v3.16.21(老師後台修正)整筆標 adminOnly:true;移除 v3.16.33 與 v3.16.32 brief 內各一行(後台·老師端提示音 / 後台優化)GM 項目(玩家端不再顯示·老師端 items 仍保留完整技術紀錄);_filterChangelogForDisplay 的 _ADMIN_KEYWORD_RE 由「帳號救援」收斂為「帳號救援申請審核」(GM 卡名)→ 修正先前把玩家端「📨 帳號救援申請」公告也一併誤隱藏的問題·玩家現在能正常看到道歉補償與救援相關公告。',
      '★ v3.16.35【範圍/版本】四點同步 _GAME_LOADED_VERSION + _vers[index.html / game_changelog.js / admin_panel.js] + ADMIN_PANEL_VERSION → v3.16.35(hero_db.js 維持 v3.16.22)。本輪改 admin_panel.js(救援卡活動鈕)+ index.html(changelog 過濾正則)+ game_changelog.js(adminOnly + 移除 GM brief 行 + 本筆)。本筆 entry 亦標 adminOnly:true(純後台/日誌呈現改動·玩家無感)。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.15)。',
    ],
  },
  // v3.16.34 — BOSS 登場動畫(貓空:九尾空貓怪/杏花妖 + 黑暗球·全螢幕·保留mp4音軌+BOSS戰BGM·可跳過)
  {
    ver: 'v3.16.34',
    date: '2026-06-27',
    brief: [
      '🎬【BOSS 登場動畫】部分頭目戰開打前,現在會先播放全螢幕「登場動畫」:畫面變暗淡入 → 播放動畫(保留動畫本身的聲音,並同時響起該頭目的戰鬥音樂)→ 淡出進入戰鬥。原本的劇情對白(對話框字幕)維持不變。右上角有「⏭ 跳過動畫」可隨時跳過,每次戰鬥都會播放。這次先做:貓空的「九尾空貓怪」「杏花妖」,以及「黑暗球‧希望型態」。',
    ],
    items: [
      '★ v3.16.34【BOSS 登場動畫·index.html】新增 _BOSS_INTRO_MAP(九尾空貓怪→bgm-boss-01 / 杏花妖→bgm-boss-apricot / 黑暗球‧希望型態→bgm-boss-darkorb)+ _bossIntroDetect(冒險模式·非世界BOSS·讀 G.p2 名稱判定本批 BOSS)+ _playBossIntro(全螢幕 overlay z-index 2147483646·畫面變暗淡入 → 播 mp4 動畫 → 「⏭ 跳過動畫」鈕 → ended/error/逾時14s → 淡出·淡出同時重入建立戰鬥畫面銜接順暢)。掛在 advStartBattle 最頂(接在現有過場對白 adv-cutscene-overlay 之後·完全不動對白);_bossIntroResuming 旗標防動畫 callback 重入重播。每次都播 + 可跳過。',
      '★ v3.16.34【音訊·index.html】保留 mp4 動畫自身音軌(不靜音)+ 同時 bgmFadeTo 起該 BOSS 戰鬥 BGM(無縫銜接進戰鬥);iOS 擋「有聲自動播放」→ 退靜音播放保險(畫面仍出來·BGM 由遊戲 bgm 系統提供聲音)·載入失敗/逾時一律不卡死。現有過場對白(對話框字幕)完全不變。',
      '★ v3.16.34【素材·壓縮·保留音軌】三支登場動畫 mp4 壓縮(1280×720·CRF28·保留 AAC 音軌·faststart):九尾空貓動態 2.5→1.4MB / 杏花妖動態 2.5→1.8MB / 黑暗球動態 2.7→1.4MB。老師覆蓋上傳同檔名即可(未覆蓋仍可用原檔·只是較大)。',
      '★ v3.16.34【範圍/版本】本輪改 index.html(登場動畫)+ game_changelog.js + admin_panel.js(僅版本·功能沿用 v3.16.33)。四點同步 _GAME_LOADED_VERSION + _vers[index.html/game_changelog.js/admin_panel.js] + ADMIN_PANEL_VERSION → v3.16.34(hero_db.js 維持 v3.16.22)。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.14)。⚠ 需上傳三支壓縮 mp4(覆蓋同名)登場動畫才會更新。',
    ],
  },
  // v3.16.33 — 帳號污染源頭根治(四欄 _s 接齊 + 系統默認審查孤兒剔除·全 UID 把關) + GM 救援/回報提示音改 mp3
  {
    ver: 'v3.16.33',
    date: '2026-06-27',
    brief: [
      '🛡️【存檔保護再強化·玩家無感·只增不減】從源頭再堵住一類可能讓「已經不屬於你的角色」殘留在雲端存檔的情況(英雄的經驗值、剩餘能力點、極限爆發等級、天賦等級四項),並在每次登入時自動清掉這類殘留鍵。你的英雄、等級、至寶、知識幣、進度完全不受影響。',
    ],
    items: [
      '★ v3.16.33【污染源頭根治·四欄 _s 接齊·index.html】heroExp/heroStatPoints/heroBurstLevels/heroTraitLevel 四個逐英雄成長表補字串版 _s(鏡像 heroLevels_s 既有模式):_buildSafeData 寫四個 _s + _applySafeData 載入優先採信 _s + 三槽合併 _LXPS_PREFER_S 納入四欄 + 6 處 GM 清污染工具(刪英雄/收回/審查回收/學生自助移除/污染清除復原/完全重置)同步補 heroExp_s 與 heroTraitLevel_s。根因:這四欄原僅寫 map,Firebase merge:true 深合併「永不刪 map 子鍵」→ 英雄被收回/借用後雲端殘留幻影鍵,且正常遊玩每次存檔不會清(只有 GM 移除工具會整欄覆蓋)。接齊後從源頭免疫 merge 復活,與既有 heroLevels/heroStatInvested/heroSkillLevels 三欄一致。純加欄位(同 v3.16.4/v3.15.96 性質)。',
      '★ v3.16.33【系統默認審查·孤兒剔除·index.html】新增 _lxpsPruneOrphanGrowthMaps:雲端載入成功後對四欄剔除「不在擁有清單的孤兒鍵」(擁有權威 = advGetUnlockedHeroes 聯集 adv_unlocked_heroes 聯集 初始8·與 v3.15.76 heroLevels 幻影判定同口徑);記憶體清完下次存檔 _s 寫回乾淨值 → 源頭與既有殘留雙清。多重 UID 安全閘(任一不過整個跳過·寧可不剔也不誤刪):① window._gUserId 為空跳過 ② 擁有集合<8 跳過(空殼保險) ③ 待剔比例>40% 跳過(疑似載入異常·保留全部交 GM·印警告)。只剔孤兒鍵·絕不刪英雄·不動 unlockedHeroes 與 heroLevels。',
      '★ v3.16.33【提示音改 mp3·index.html】GM「收到救援申請/錯誤回報」提示音由 Web Audio 合成琶音改播老師指定 mp3(收到救援申請.mp3·新增 audio 元素 sfx-rescue-chime);_lxpsPlayRescueChime 改先播音檔、被擋/載入失敗時 fallback 回原合成音(_lxpsPlayRescueChimeSynth·雙保險不影響徽章)。',
      '★ v3.16.33【GM 選單退役·admin_panel.js】污染源頭根治後,退役(隱藏不刪)GM「📢 污染檢查提醒」卡:其功能=提醒玩家自我檢查污染,但 v3.16.31 已停用強制登入自我審查、本版改登入後系統默認審查自動清孤兒鍵 → 此「提醒玩家自查」機制已被取代。沿用 v3.15.85 退役模式(移出 SIDEBAR_ITEMS + 群組·卡片/init/handler 全保留·日後可加回)。救援/復原類卡(汙染清查掃描/洗錢查緝/英雄誤刪救回/帳號救援申請/Lv1 救援/一鍵重建/完全重置)一律保留作安全網,供清理本版前已受影響帳號。',
      '★ v3.16.33【範圍/版本/安全】四點同步 _GAME_LOADED_VERSION + _vers[index.html/game_changelog.js/admin_panel.js] + ADMIN_PANEL_VERSION → v3.16.33(hero_db.js 維持 v3.16.22)。本輪改 index.html(四欄 _s+孤兒審查+音效)+ admin_panel.js(版本+退役污染檢查提醒卡)+ game_changelog.js。所有新增可儲存欄位(四欄 _s)皆綁 uid·走既有 self-write 規則,無需改 firestore.rules。存檔倒退守門未動;載入路徑只「加一道只剔孤兒不刪英雄的 UID 閘審查」。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.13)。',
    ],
  },
  // v3.16.32 — 審查失誤道歉 + 補償(全體玩家·限領一次)+ 後台:救援/錯誤回報即時提醒(悅耳音效)/GM 信任裝置免閒置登出/GM 一鍵解鎖全部至寶
  {
    ver: 'v3.16.32',
    date: '2026-06-26',
    brief: [
      '💙【道歉與補償·全體玩家】前陣子「英雄圖鑑審查」每次登入強制跳出、要大家一隻一隻確認,造成有些同學誤把自己的英雄按成「不是我的」而被移除,也讓大家很困惑。老師已停止這個強制審查並向大家道歉。為了表達歉意,登入時會送上補償:💰 知識幣 100,000 + 🔮 召喚水晶 ×10(每個帳號限領一次·自動入帳)。若你的英雄不見了,到「📨 帳號救援申請」勾選送出,老師會連同等級幫你補回。',
    ],
    items: [
      '★ v3.16.32【GM 即時提醒·index.html】新增 onSnapshot 監聽 accountRescueRequests(待處理)+ bugReports(未回覆)→ GM 登入後右下浮動徽章顯示合併待處理數;新項目進來才播 Web Audio 合成上行大三和弦琶音(C5-E5-G5)悅耳提示音 + 徽章脈動(登入當下既有的只顯示不播音);點徽章開後台並自動跳到對應卡(救援/錯誤回報);登出 Stop 監聽。只 GM(_isAdminUser 守門);非 GM 與學生完全不啟用。',
      '★ v3.16.32【GM 信任裝置免閒置登出·index.html + admin_panel.js】_idleAutoLogoutStart 加閘門:管理員 + 本裝置已在雲端 trustedDevices 信任 → 停用 30 分鐘閒置自動登出(失敗安全:查詢失敗/未信任一律照常登出·共用平板安全優先);_tick 加雙保險守門。admin「🔐 撤銷學生裝置信任」卡新增「🖥 GM 本裝置免閒置自動登出」子區(查詢/信任/取消·立即生效·走既有 window._lxpsDeviceTrust 同一套信任名單);無 ?.。學生與其他裝置不受影響。',
      '★ v3.16.32【GM 至寶全解鎖·index.html】新增 window._lxpsGmUnlockAllTreasures:迭代 TAIWAN_TREASURES 主表(自動涵蓋台灣 10 + 8 龍王 + 未來新增)·排除日本三神器(_isJapanTreasureKey)·只增不減補缺(已擁有等級/裝備不動)·寫 gm_auto_unlock 解鎖紀錄·同步 window ref + localStorage + gameCloudSave;onAuth 等雲端就緒(_waitForCloudReady)後對 GM 自動執行(idempotent·下次登入自動補上次沒補到的)。至寶不觸發存檔倒退守門、GM 亦豁免守門。',
      '★ v3.16.32【道歉補償·index.html】全體玩家登入彈「審查失誤道歉 + 補償」(_maybeShowAuditApologyCompensation):補償 💰知識幣 100,000 + 🔮召喚水晶 ×10·每帳號限領一次。一次性守門用雲端 per-UID 旗標 _auditApologyCompensatedV1(getDocFromServer 讀·旗標先寫再發獎·at-most-once·UID 同步·鏡像 memberProfileRewarded);讀旗標失敗則跳過不發(延下次登入·絕不在不確定下重發)。發獎走 addKnowledgeCoins + backpackAdd(summon_crystal)+ gameCloudSave 持久;onAuth 等 _waitForCloudReady 後排程;與既有道歉公告防疊加共存。玩家自寫 players/{uid} 旗標·非停權欄位·走既有規則無需改 rules。',
      '★ v3.16.32【註解校正 + 範圍/版本】清除閒置自動登出區與實際代碼矛盾的舊註解(「5 分鐘」→ 實際 30 分鐘·IDLE_TIMEOUT_MS;onAuth 與 _tick 兩處)。前三件全 GM 守門·第四件「道歉補償」為全體玩家一次性(雲端旗標 at-most-once)·全部只增不減·存檔倒退守門與載入路徑完全不動。四點同步 _GAME_LOADED_VERSION + _vers[index.html/game_changelog.js/admin_panel.js] + ADMIN_PANEL_VERSION → v3.16.32(並修正既有 _vers[admin_panel.js]=v3.16.30 與檔案自身 v3.16.31 不一致);hero_db.js 維持 v3.16.22。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.11)。',
    ],
  },
  // v3.16.31 — 緊急修復:暫停「強制登入自我審查」(止血)+ 老師後台批次救回被誤刪的英雄
  {
    ver: 'v3.16.31',
    date: '2026-06-26',
    brief: [
      '🛟【緊急修復·英雄不會再被誤刪】這兩天「登入時強制跳出的英雄圖鑑審查」會把你本來就擁有、但系統查不到取得紀錄的舊角色列成「可疑」、要你一隻一隻勾,結果有些同學不小心按了「不是我的」,把自己的英雄移除了。現在已經暫停這個「每次登入強制跳出」的審查,你不會再被逼著勾、也不會再誤刪英雄。',
      '🔍【審查還在·只是不強迫】英雄圖鑑審查本身保留,你或老師仍可以隨時手動開啟(不再每次登入硬塞);台灣至寶的圖鑑審查也一樣是「可以用、但不強迫」。',
      '💚【被誤刪的英雄會還回來】如果你的英雄已經被審查誤刪,別擔心——老師後台可以一鍵把它們連同原本的等級一起補回來(只會把資料加回去、不會拿走任何東西)。如果發現自己有角色不見了,跟老師說一聲即可。',
    ],
    items: [
      '★ v3.16.31【止血·index.html】_maybeShowAccountAuditOnLogin 開頭加 early-return(鏡像 v3.16.28 orchestrator 停用 pattern):強制登入自我審查不再自動彈出(只是不彈·碰不到任何資料·不刪不改);自我審查本身保留,學生/老師仍可從圖鑑手動開 _openAccountAudit(含至寶審查)。根因:每次登入硬彈把「擁有但帳本查無紀錄」的舊版/早期取得英雄列成可疑·逼學生逐隻勾·誤按「不是我的」→ _fbStudentDisownHeroes 真的移除(且會清掉雲端等級)→ 帳號倒退。',
      '★ v3.16.31【批次救回·index.html】新增 GM 後端 _fbAdminScanDisownedHeroes(掃全體玩家·帳本反推:某英雄「最近一筆解鎖紀錄=audit_error_recovered」且現不在 unlockedHeroes → 判為被 disown 待救回;已被救回者最近一筆=admin_grant 自動跳過 idempotent·GM 手動刪 admin_delete 排除)+ _fbAdminRestoreAllDisownedHeroes(逐一呼叫既有 _fbAdminRestoreLostHeroes:加回解鎖+還原 _auditRecoveredLevels 暫存原等級+寫 admin_grant 合法紀錄→不再被隱藏·GM 直寫繞守門·只增不減)。補既有「等級>1/裝至寶」掃描(_fbAdminScanDeletedHeroes)抓不到「等級被清掉」這批的缺口。',
      '★ v3.16.31【GM 介面·admin_panel.js】「🛟 英雄誤刪救回」卡新增子區「🔺 審查誤刪英雄批次救回」:🔍 掃描全體玩家(審查移除)→ 列出受影響玩家與英雄(顯示移除前暫存等級)→「🛟 救回這位玩家」或「🛟 全部一鍵救回」。無 ?. 相容舊 Safari。',
      '★ v3.16.31【安全/範圍】只做「止血(關彈窗)+ 把資料加回去」,完全不動存檔倒退守門、不動載入路徑(老師裁示:不可製造新災情)。至寶版圖鑑審查(凍結+閘門+🔺徽章+GM 通過/不通過)保留。四點同步 _GAME_LOADED_VERSION + _vers[index.html/game_changelog.js/admin_panel.js] + ADMIN_PANEL_VERSION → v3.16.31(hero_db.js 維持 v3.16.22)。所有新增可儲存欄位皆綁 uid。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.10)。',
    ],
  },
  // v3.16.30 — 待審查凍結機制:圖鑑審查勾「這是我的」但雲端查不到取得紀錄的英雄先進「審查中」凍結,由老師通過/不通過
  {
    ver: 'v3.16.30',
    date: '2026-06-26',
    brief: [
      '🔍【英雄圖鑑審查升級·交給老師確認】當你在圖鑑審查按「這是我的」、但雲端查不到你自己的取得紀錄時,這隻英雄不會直接被鎖掉,而是先進入「🔺審查中」狀態交給老師確認。審查中的英雄你可以照常出戰、裝備至寶,只是暫時不能升級、投資能力、提升技能或升級極限爆發(戰鬥中的極限爆發照常使用)。',
      '✅ 老師確認「通過」→ 正式解鎖、變回正常顏色;若「不通過」→ 轉為灰色未收錄(可逆——之後你重抽/自選/冒險再次解鎖,就會自動正式解鎖)。老師審查完成後會通知你「請重新整理,確認你的英雄圖鑑」。',
      '🛟 另外:登入時若帳號裡有「查不到來源」的英雄,會先做一次圖鑑審查(完全乾淨的帳號會自動跳過);你也可以隨時到「📨 會員帳號與救援申請」→「🔍 重新申請圖鑑審查」自己重新檢查(一天一次)。',
    ],
    items: [
      '★ v3.16.30【待審查凍結·玩家端】圖鑑審查送出時,勾「這是我的」但與雲端 _heroUnlockHistory 不符的英雄 → 加入 players/{uid}._auditPendingHeroes(window._fbMarkAuditPending·arrayUnion)進入「🔺審查中」凍結:7 養成閘門(addHeroExp 靜默 return 0、investStat、upgradeSkill、upgradeBurst、三本經驗書)全擋下並提示「要等老師審查結束」,戰鬥極限爆發照常、可裝至寶;圖鑑一覽卡片左上加 🔺審查中徽章、詳情頁加紅框說明。',
      '★ v3.16.30【強制登入審查·雲端感知】_maybeShowAccountAuditOnLogin 改 async:先本機鐵證快篩(_advHasHardEvidence),完全乾淨者自動封存跳過;有疑似者再查雲端 _fbGetCloudUnlockHistory 逐隻核對自己 uid 紀錄——雲端有紀錄者一律封存不打擾、雲端讀取失敗則不強制不封存(5 秒重試最多 6 次),確實查無紀錄者才彈出審查。致歉文案改寫(共用 iPad 污染說明);「📨 會員帳號與救援申請」hub 新增「🔍 重新申請圖鑑審查」(每日一次·清完成旗標重開)。',
      '★ v3.16.30【GM 審核·老師端 admin_panel.js】「📨 帳號救援申請審核」卡偵測 claims.contestedHeroes → 摘要「🔺待審查英雄 N 隻」晶片 + 核對詳情列出 +「✅ 全部通過(正式解鎖)」「❌ 全部不通過(轉灰)」兩鈕:通過 → window._fbAdminApproveAuditHeroes(清 _auditPendingHeroes 解凍 + 寫 admin_grant 合法紀錄 + 蓋 _authoritativeRestoreAt 重載生效);不通過 → window._fbAdminRejectAuditHeroes(移出雲端 unlockedHeroes 轉灰 + 標 audit_error_recovered·可逆≠admin_delete·六補回路徑不復活);兩者皆標記救援申請已處理 + 通知玩家「GM已審查完畢,請重新整理,確認你的英雄圖鑑」。',
      '★ v3.16.30【範圍/版本】index.html(凍結基建 + 7 閘門 + 🔺標記 + 強制登入 + 致歉/重審入口 + 2 個 GM 後端)+ admin_panel.js(GM 通過/不通過卡)+ game_changelog.js 三檔;三點 _GAME_LOADED_VERSION + _vers[index.html/game_changelog.js] + ADMIN_PANEL_VERSION/_vers[admin_panel.js] → v3.16.30(hero_db.js 維持 v3.16.22)。所有新增可儲存欄位(_auditPendingHeroes 等)皆綁 uid。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.9)。',
    ],
  },
  // v3.16.29 — 英雄圖鑑自我審查改「視覺鎖·鐵證判定」:停用等級判定改鐵證·進圖鑑逐隻確認·這是我的核對雲端紀錄
  {
    ver: 'v3.16.29',
    date: '2026-06-26',
    brief: [
      '🔍【英雄圖鑑自我審查升級】進入英雄圖鑑時,如果你帳號裡有「查不到取得來源」的英雄,會跳出一份「待審核圖鑑」,把這些英雄列出來讓你一隻一隻確認:是你自己抽到/解鎖/練過的就按「這是我的」(系統會立刻核對雲端紀錄,符合就解鎖、變回正常顏色);不是你的就按「不是我的」,離開時會把它鎖回未解鎖。每一隻都要選、全部選完才能離開。',
      '✅ 有自己取得紀錄、投資過(加過素質點/技能/天賦/爆發)、裝過至寶、或是起始 8 隻角色的,都會自動通過、不會列出來,你只要確認真正可疑的那幾隻就好。',
      '🛟 按「這是我的」但雲端查不到你的紀錄時,會幫你送老師查證(不會直接鎖掉);誤鎖了也可以到「📨 帳號救援申請 →🔓 我遺失的英雄要回來」請老師補回(等級會還原)。',
    ],
    items: [
      '★ v3.16.29【停用等級判定·改鐵證】_openAccountAudit/_maybeShowAccountAuditOnLogin 不再用「等級/用過」判定英雄是不是你的(共用 iPad co-op 借用污染的英雄本來就帶等級·用等級判定會把污染當成你的)。改用「借用做不到的鐵證」(= _advHasHardEvidence):初始 8 隻 / 自己本機解鎖紀錄 / 投資過(素質點·技能·天賦·爆發) / 裝至寶。有鐵證=✅自動通過不列出;查無本機鐵證的持有英雄=待審核逐隻確認。',
      '★ v3.16.29【視覺鎖·必勾才能離開】_openAccountAudit 重寫成逐隻 toggle:每張待審卡有「這是我的/不是我的」兩鈕(可自由切換·即時視覺回饋·不寫雲端),全部選完前底部「✅ 完成審查並離開」鈕停用(顯示還有 N 隻未確認)。離開時一次提交:不是我的→_fbStudentDisownHeroes 鎖回(移出雲端 unlockedHeroes·補 audit_error_recovered 守門紀錄·可逆·GM 一鍵復原·本機同步清養成防自癒復活);符合記錄→鏡像補回本機帳本(source=audit_verified·下次不再列入);無待審核→顯示「圖鑑審查通過」並標記完成。',
      '★ v3.16.29【這是我的·核對雲端 uid】新增 window._fbGetCloudUnlockHistory(uid) 讀 players/{uid}._heroUnlockHistory;按「這是我的」即時核對雲端「自己 uid 真正解鎖紀錄」(排除 admin_delete/migration_seal/audit_error_recovered):符合→當作有鐵證·解鎖變正常色;不符→留在解鎖清單但送老師查證(_fbSubmitAccountRescueRequest·claims.contestedHeroes + meta.auditVerify=true·供後台篩選)。雲端帳本比共用 iPad 本機帳本不易被跨帳號污染·故當權威依據。',
      '★ v3.16.29【範圍/版本】三點版本同步 → v3.16.29(hero_db.js 維持 v3.16.22·admin_panel.js 維持 v3.16.19)。本輪只改 index.html + game_changelog.js。後台「只顯示不符」篩選卡、至寶審查、GM 即時通知為後續輪次。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.8)。',
    ],
  },
  // v3.16.28 — 停止系統「自動判定有證據=你的」(紀錄被跨帳號污染判定不準);改點進圖鑑自動彈出由玩家逐隻確認
  {
    ver: 'v3.16.28',
    date: '2026-06-26',
    brief: [
      '🛑【重要調整·停止系統自動判定】系統原本會自動判斷「哪些英雄有證據、是你的」並據此自動保留或回收——但因為英雄的取得紀錄會跨帳號互相影響、判定幾乎都不準(可能把別人的當成你的留著、也可能把你紀錄遺失的真角色誤回收)。所以即日起停止這個自動判定與自動回收,改成完全交給最清楚的你來確認。',
      '🔍【點進英雄圖鑑自動彈出確認】只要你帳號裡有「起始 8 隻角色以外」的英雄,點進英雄圖鑑時會自動跳出「英雄來源自我審查」,把這些角色列出來讓你逐一確認:是你自己抽到/打到/練過的就留著不要動(預設保留);不是你的(沒印象、從沒用過)就按「不是我的」+「✅ 確認移除」,立刻清掉、之後不會再跑回來。',
      '🛟 起始的 8 隻角色一定是你的、不會列出來;誤移除可到「📨 帳號救援申請 →🔓 我遺失的英雄要回來」請老師補回(等級會還原)。',
    ],
    items: [
      '★ v3.16.28【停用自動回收】_lxpsRecoverAuditErrorHeroes 協調器原本登入時逐隻用 _advHasGenuineUnlock(證據判定)把「無證據」者自動回收 → 因解鎖紀錄跨帳號污染,該判定會把污染當證據保留、把紀錄遺失的真角色當無證據誤回收。改為函式開頭直接 return 全面停用;清污染改全由學生自助確認。',
      '★ v3.16.28【自我審查停用證據分類】_openAccountAudit 的 B1/B2 不再用 _advHasHardEvidence/_advHasGenuineUnlock 判定:B1(✅免處理·不顯示)只認「起始 8 隻 _ARENA_INITIAL_HEROES」(建帳號即贈·全帳號相同·不可能跨帳號污染);其餘持有英雄一律列入 B2「請確認是不是你的」(預設保留·勾「不是我的」才走 v3.16.27 _fbStudentDisownHeroes 當場移除+守門不復活)。綠色「已確認是你的」整區隱藏(只列預計刪除)。',
      '★ v3.16.28【圖鑑開啟自動彈】_openHeroPage_doRender 末尾掛 _maybeShowAccountAuditOnLogin(延 350ms);彈出條件由「有查無硬證據英雄」改為「有起始 8 隻以外的英雄」(per-uid 一次性·擁有<8 或有其他彈窗自動重試)。登入後 4200ms 仍保留一次後援觸發。',
      '★ v3.16.28【卡片提示校正】B2 卡片移除舊版「曾被移除/你沒有取得紀錄」誤導文字(現含有紀錄英雄·紀錄不可盡信);只在紀錄明確顯示別人 uid 時給輕量提醒,其餘交玩家辨認。',
      '★ v3.16.28【版本/範圍】三點版本同步 → v3.16.28(hero_db.js 維持 v3.16.22)。本輪只改 index.html + game_changelog.js。_advHasGenuineUnlock/_advHasHardEvidence 仍保留定義但不再驅動任何自動保留/回收。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.7)。',
    ],
  },
  // v3.16.27 — 英雄自我審查升級:查無證據的「不是我的」按確認當場移除·之後不再跑回來;有證據自動保留
  {
    ver: 'v3.16.27',
    date: '2026-06-26',
    brief: [
      '🧹【重大修復·清掉不是你的英雄】之前就算把「不是你的」英雄移除,下次登入又會自己跑回來(系統的自動修復網會把練過的角色從等級表撈回解鎖清單)——這個根因已修好。現在到英雄圖鑑「🔍 英雄來源自我審查」,把確定不是你的按「不是我的」+「✅ 確認移除」,就會立刻清掉、而且之後不會再回來。',
      '✅ 系統已確認是你的(自己抽到/打到、初始角色、裝過至寶、或投資過素質點)會用綠框標示、自動保留、免處理;你只要看「🟡 需要你確認」的幾隻就好。',
      '🛟 誤移除了也別擔心:到「📨 帳號救援申請 →🔓 我遺失的英雄要回來」勾選送出,老師核對後可一鍵幫你補回(等級會還原)。登入時若帳號有「查不到取得來源」的英雄,會自動跳出這個審查提醒你清理(看過一次後就不再自動跳)。',
    ],
    items: [
      '★ v3.16.27【根因·自癒復活】advGetUnlockedHeroes 的「自癒 v3.13.28」會把 _heroLevels 內等級>0 的英雄無條件補回 unlockedHeroes(只擋 admin_delete/audit_error_recovered 與活動限定英雄)→ 一般 SSR/SR 的練過污染移除後每次載入又被撈回=「多出一直回來」。修法:學生自助移除走守門機制(見下),被移除者帳本最新一筆=audit_error_recovered → 自癒/紀錄救援/出口過濾/phantom 等六補回路徑全認得、不再復活。',
      '★ v3.16.27【當場移除·_fbStudentDisownHeroes】學生在自我審查按「不是我的」+確認 → 立即從雲端 unlockedHeroes 移除 + 清該英雄六養成表 _s+heroExp+heroTraitLevel(杜絕 desync/採信舊 _s 復活)+ 至寶解裝保留本體 + 帳本補 audit_error_recovered(disownedByStudent 標記)守門紀錄;暫存原等級到 _auditRecoveredLevels 供 GM 一鍵復原。刻意不寫 _authoritativeRestoreAt(不重載·本機同步即時更新)、不寫一次性旗標(可隨時再清)。本機同步:adv_unlocked_heroes 移除 + 記憶體養成清除 + 本機帳本補守門紀錄。',
      '★ v3.16.27【有證據自動保留·分類】新增 _advHasHardEvidence(=_advHasGenuineUnlock 略過「練過 lv>1」分支·只認 自己解鎖紀錄/初始8/裝至寶/投資過);自我審查 B1(✅免處理)/B2(🟡需確認)改用硬證據分類 → 初始 8 隻、投資過、裝過至寶的不再被誤列「需確認」,只有真正查無證據(含練過卻查無紀錄的污染)才落入 B2 由學生決定。',
      '★ v3.16.27【登入自動提示】新增 _maybeShowAccountAuditOnLogin:登入後若帳號有「持有但查無硬證據」的英雄才自動開審查(per-uid 一次性·擁有<8 或有其他彈窗時自動重試)。送出/關閉皆標記一次性,不再每次登入打擾;學生仍可從圖鑑自行開啟。',
      '★ v3.16.27【版本/範圍】三點版本同步 → v3.16.27(hero_db.js 維持 v3.16.22·本輪未動)。本輪只改 index.html + game_changelog.js。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.6)。',
    ],
  },
  // v3.16.26 — 帳號英雄修復:練過的英雄一律保留(誤回收的自動補回);只清「沒練過又查無紀錄」的純污染
  {
    ver: 'v3.16.26',
    date: '2026-06-26',
    brief: [
      '🛡️【重大修復·英雄解鎖】上個版本(v3.16.19)為了清掉跨帳號殘留的污染角色,把「你練過(等級>1)、但剛好查不到取得紀錄、也沒投資過素質點」的角色誤判成污染收走了,造成很多同學「練過的英雄突然不見」。本版改回「只要你練過(等級>1)就一定是你的、一律保留」,並在登入時自動把先前被誤收的『練過英雄』連同等級補回你的帳號。',
      '📌 重要:被補回的英雄「等級」會還原,但當初被清掉的「技能/天賦/極限爆發的升級」無法復原(那部分在上個版本收回當下就被刪掉、沒有備份),需要再用書本重新升級。造成的不便非常抱歉。',
      '🧹 仍會自動清掉的只剩:「沒練過(等級 1)且完全查不到任何取得紀錄、沒裝至寶、不是初始角色」的純污染。若有你真的擁有、卻被收回的,到「📨 帳號救援申請」→「🔓 我遺失的英雄要回來」勾選送出,老師核對後補回。',
    ],
    items: [
      '★ v3.16.26【判定改回·_advHasGenuineUnlock】推翻 v3.16.19「投資證據版」:於 admin_delete 檢查之後、其餘判定之前加回「等級>1 → 一律保留」分支(讀全域 _heroLevels),練過的英雄一律視為擁有(覆蓋「別人 uid 紀錄」判定,唯一例外是老師明確刪除 admin_delete);另修正自有解鎖紀錄 uid 比對改 slice(0,12)(舊紀錄若存完整 28 字 uid 也能正確認領,避免自己的紀錄被誤判成別人的)。改完 orchestrator 只會回收「等級 1 且無任何解鎖證據」的純污染。',
      '★ v3.16.26【自動補回·_fbRestoreLeveledAuditRecovered + _lxpsRestoreLeveledOnLogin】登入後一次性:讀雲端 _auditRecoveredLevels(v3.16.19 回收時暫存的原等級),只把「暫存等級>1(練過)」的英雄加回 unlockedHeroes + 還原等級(只升不降)+ 補一筆合法紀錄 audit_auto_restored(蓋過 audit_error_recovered → 不再被出口過濾隱藏);沒練過(等級 1)的暫存維持回收=正確清掉的污染。雲端旗標 _auditLeveledRestoreV1 + 本機旗標雙重防重跑;刻意不寫 _authoritativeRestoreAt(不觸發重載)、改記憶體/本機同步即時顯示;排程在 Lv1 污染回收(orchestrator)之前。',
      '★ v3.16.26【版本／範圍】三點版本同步 _GAME_LOADED_VERSION + _vers[index.html／game_changelog.js] → v3.16.26(hero_db.js 維持 v3.16.22·本輪未動)。本輪改 index.html + game_changelog.js(sw.js 圖片修正 v3.5.89 隨 v3.16.25 一併上傳)。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.5)。',
    ],
  },
  // v3.16.25 — 修正 iPad 安裝版 R 卡(及多數英雄)圖片讀不到:資源圖快取根治(SW 改 CORS·只快取確認 200·清中毒快取)
  {
    ver: 'v3.16.25',
    date: '2026-06-26',
    brief: [
      '🛠️【緊急修正·圖片】iPad 安裝版上,除了少數幾隻(主角小力／機關王／田徑隊／直笛團／籃球隊)以外,英雄圖片大量讀不到、變成破圖的問題已修正。重開遊戲後會自動重抓正確圖片(第一次可能稍慢,之後恢復正常)。',
    ],
    items: [
      '★ v3.16.25【根因】Service Worker(sw.js v3.5.88)抓圖失敗時,fallback 用 no-cors 方式抓 → 回應是 opaque(讀不到狀態碼),程式卻把它當成功圖片快取下來。當共用網路同 IP 多人同時撞 GitHub raw 被限流(429)、或 CDN 回 403 等錯誤時,那個壞掉的錯誤回應被永久快取 → 該英雄圖從此破圖。只有最早最常載入的主角／機關王／初始三隊在被限流前就先把正確圖快取住,所以只有那幾隻正常。',
      '★ v3.16.25【修法·sw.js v3.5.89】① 抓圖 fallback 全改 CORS(讀得到狀態碼),只快取確認 200 的回應,任何錯誤(403／429／404)一律不快取 → 根治破圖中毒。② 來源四重備援:raw webp → jsDelivr webp → raw png → jsDelivr png 依序試到出圖。③ cacheFirstAsset 改雙 key 查詢(webp 未命中再查 png),預載的圖也能被新機命中。④ 預載(precache)路徑同步去除同一 opaque bug、改 CORS。',
      '★ v3.16.25【清中毒】圖片快取庫 ASSET_CACHE 一次性 v1→v2,把先前被當成功存進去的破圖快取整批清掉(這是「ASSET_CACHE 永不改」鐵則的單次例外);每台裝置改完後下次只會重抓用到的圖一次,之後不再重抓。',
      '★ v3.16.25【版本／範圍】三點版本同步 _GAME_LOADED_VERSION + _vers[index.html／game_changelog.js] → v3.16.25(hero_db.js 維持 v3.16.22·本輪未動)。本輪改 sw.js + index.html + game_changelog.js。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.4)。',
    ],
  },
  // v3.16.24 — 修正「老師更新了你的帳號資料,正在重新載入」無限重載卡死(權威 restore 基線持久化+斷路器)
  {
    ver: 'v3.16.24',
    date: '2026-06-25',
    brief: [
      '🛠️【緊急修正·卡死】部分帳號(尤其電腦安裝版)開啟遊戲後,畫面不斷跳出「🎁 老師更新了你的帳號資料,正在重新載入以套用最新進度…」一直重開、卡死進不去的問題已修正。現在最多自動重整一次套用最新進度,就能正常進入遊戲。',
    ],
    items: [
      '★ v3.16.24【根因】v3.16.5「權威 restore 保護」的重載機制(_checkSnapData)會比較「雲端主檔 _authoritativeRestoreAt」>「本 session 載入時的基線 _mySessionRestoreSeen」來決定是否重載套用老師的最新操作;但基線只在 _applySafeData 從 data._authoritativeRestoreAt 設定於「記憶體」(一重載就消失),而某些載入路徑的 data 未可靠帶到此欄 → 基線=0 → 每次載入都 _cloudRA>0 觸發重載,且既有守門 _authoritativeReloadTriggered 一重載就重置、跨重載無效 → 無限重載。',
      '★ v3.16.24【修法·雙保險】① 持久基線:_onAuthoritativeRestore 重載前把已處理的 restoreAt 寫進 localStorage(_lxpsAuthRestoreSeen·已全域命名空間化自動綁 @@uid·跨重載與關閉皆保存);_checkSnapData 計算基線時折入 max(記憶體值, localStorage 持久值)→ 同一個 restoreAt 處理過後不再重載(老師之後若有更新=更大的 restoreAt 仍會觸發一次,權威保護完全不變)。② 分頁斷路器:同一分頁同帳號(sessionStorage _lxpsAuthReloadCnt_<uid>)權威重載達 3 次後一律不再重載(硬性防呆任何殘留迴圈,寧可請玩家手動重整也不卡死)。兩者皆只會減少重載,絕不影響權威保護或存檔安全。',
      '★ v3.16.24【版本/範圍】三點版本同步 _GAME_LOADED_VERSION + _vers[index.html/game_changelog.js] → v3.16.24(hero_db.js 維持 v3.16.22·本輪未動)。本輪只改 index.html + game_changelog.js。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.3)。',
    ],
  },
  // v3.16.23 — 修正 iPad「英雄來源自我審查」底部關閉/確認按鈕點不到卡死(overlay 佈局改 flex)
  {
    ver: 'v3.16.23',
    date: '2026-06-25',
    brief: [
      '🛠️【修正·iPad／平板】點開「🔍 英雄來源自我審查」後,下方的「關閉」與「✅ 確認並封存」按鈕按不到、點了沒反應、整個卡住的問題已修正。現在這兩個按鈕固定在畫面最底端、一定點得到,中間的英雄清單可以正常上下捲動。',
    ],
    items: [
      '★ v3.16.23【根因】_openAccountAudit 的全螢幕 overlay(#_audit-ov)本身設了 overflow-y:auto(自己就是滾動容器),底部按鈕列 #_au-bar 卻用 position:fixed;bottom:0 且是它的子元素 → 在 iOS Safari／iPadOS「position:fixed 元素位於 overflow:auto 祖先內」會觸發命中測試(hit-test)失效,或把 fixed 定位算到「滾動內容底端」而非視窗底端,導致按鈕點不到、或滾到底也碰不到。',
      '★ v3.16.23【修法】#_audit-ov 由 overflow-y:auto+padding-bottom:96px 改為 display:flex;flex-direction:column(自身不再滾動);內容改包進新增的 #_au-scroll(flex:1 1 auto·overflow-y:auto·-webkit-overflow-scrolling:touch 負責捲動);#_au-bar 由 position:fixed;bottom:0 改為 flex:0 0 auto(正常流·永遠貼在 flex 直欄底部=視窗底部·必可點);「關閉」與「確認並封存」鈕加 touch-action:manipulation。純佈局重構,所有事件 handler 與 #_au-cancel／#_au-submit／#_au-count／._au-act ID 全不變,零邏輯改動。',
      '★ v3.16.23【版本／範圍】三點版本同步 _GAME_LOADED_VERSION + _vers[index.html／game_changelog.js] → v3.16.23(hero_db.js 維持 v3.16.22·本輪未動)。本輪只改 index.html + game_changelog.js。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.2)。',
    ],
  },
  // v3.16.22 — 英雄「小鬼貓與兔」改版:天賦惡作劇(對手用技能/爆發反噬能量消耗×50)+ S1/S2 第2擊
  {
    ver: 'v3.16.22',
    date: '2026-06-25',
    brief: [
      '⚔️【英雄調整·小鬼貓與兔大改】① 天賦「惡作劇」全新效果:每當對手使用「技能或極限爆發」時,有 30% 機率反噬對手,造成「該招式能量消耗 ×50」的固定傷害(大招消耗越高、反噬越痛;極限爆發以滿能量計 → 反噬 500 點;對 BOSS 一樣有效並受傷害上限保護;觸發機率隨天賦升級提升)。',
      '🐱【小鬼貓與兔 S1／S2 連擊】② S1「烈日貓抓」與 S2「月影兔咬」兩招都新增:有 30% 機率對「隨機目標」追加第 2 次相同屬性的傷害(機率隨技能升級提升)。原本的傷害、失明、中毒效果全部保留。',
      'ℹ️【小提醒】天賦「惡作劇」只在對手「使用技能或大絕招」時才會觸發,對手普通攻擊不會觸發(這是和舊版最大的不同)。世界 BOSS 自己的招式不受此天賦影響。',
    ],
    items: [
      '★ v3.16.22【天賦改版】小鬼貓與兔「惡作劇」由「對手普攻時反彈該次傷害(execAtk hook)」改為「對手使用技能/極限爆發時反噬固定傷害」:新增 top-level helper _kgMischiefOnSkill(actor,cost)→ 取 actor 對側存活的小鬼貓與兔逐隻擲 0.30+天賦級×0.05(Lv1=30%·Lv10=75%)→ 命中對 actor 造成 cost×50 固傷。掛載點同科學發明家「靈感」:execSkill 頂部(!sk.p 主動技·傳 a,cost)+ aiUseSkill 頂部(傳 a,cost)+ _runBurst 頂部(傳 h,10·爆發以滿能量條計)。doDmg 用 fixedDmg/mustHit/ignoreBuffs/ignoreEvasion/noGuard/noHidden/noCrit/noCounter(不暴擊·不受屬性·無視有利),不加 bypassShield → 龍王元素護盾與 5000 上限在固傷路徑仍生效(鐵律1.31)。execAtk 內舊「對手普攻反彈」hook 移除。',
      '★ v3.16.22【S1/S2 第 2 擊】烈日貓抓/月影兔咬 execSkill(玩家)+ aiUseSkill(AI)雙路徑(鐵律1.128)各於主傷+附加狀態後新增:0.30+技能級×0.05 機率 → 對隨機 1 名存活敵方造成同 _kS1Dmg/_kS2Dmg、同屬性(light/dark)的純傷害(不附加狀態)。沿用既有 SKILL_UPGRADE_DEF{cat:dmg}(技能傷害 +5%/級照舊),第 2 擊機率同步隨技能等級 +5%/級。',
      '★ v3.16.22【資料層 hero_db.js + 版本】HERO_DB s1/s2 d+fd 加「30% 第 2 擊」(鐵律1.160 圖鑑只寫 Lv1 base 30%)·HERO_TRAIT desc/fd 改寫(能量消耗×50)·_TRAIT_LV_INFO 改 base30%/+5%天賦級/max75%(Lv10)·HERO_LORE 更新。四點版本同步 _GAME_LOADED_VERSION + _vers[index.html/game_changelog.js/hero_db.js] → v3.16.22。⚠ 世界 BOSS 自身招式走 world-boss.js 專屬 AI(非 execSkill/aiUseSkill/_runBurst),故世界 BOSS 戰中 BOSS 出招不觸發此天賦(同靈感限制)。本輪改 index.html + hero_db.js + game_changelog.js。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.1)。',
    ],
  },
  // v3.16.21 — 帳號救援審核不再把「初始 8 隻起始角色」誤列查無紀錄(永久免審查)
  {
    ver: 'v3.16.21',
    date: '2026-06-25',
    adminOnly: true,
    brief: [
      '🛠️【老師後台修正·一般玩家無感】「帳號救援申請審核」以前會把每位同學一定都有的「初始 8 隻起始角色」(電腦繪圖師/程式設計師/弦樂團員/小劇團員/田徑隊員/直笛團員/籃球隊員/動物學家)誤標成「帳本查無紀錄·需人工確認」。其實這 8 隻是建立帳號時就贈送的基底角色,本來就沒有抽取/解鎖紀錄,屬於正常 → 現在不再列入審查清單,也不會被當成可疑角色。',
    ],
    items: [
      '★ v3.16.21【根因】GM「📨 帳號救援申請審核」按「🔍 核對並準備救援」會跑 window._fbRebuildAccountFromLedgers(uid),其幻影偵測迴圈把「現有 unlockedHeroes 中、帳本查無解鎖紀錄」者收進 _extraNoRecord(diff.extraNoRecordHeroes)供老師人工審核。初始 8 隻起始角色(_ARENA_INITIAL_HEROES)是帳號建立即贈、從不經召喚/解鎖寫帳本 → 每個帳號都會把這 8 隻誤列「查無紀錄」。',
      '★ v3.16.21【修法】_extraNoRecord 計算迴圈在 admin_delete / no-record 判定前加一道 (window._ARENA_INITIAL_HEROES||[]).indexOf(n)>=0 → return 排除:初始 8 隻永久免審查、既不列「查無紀錄」、也不會被當幻影移除(_extraDeleted)。與玩家端自助審查 _rareSrcCat 旁「initial 非 pollution」判定(v3.13.52)同口徑對齊。只動 _extraNoRecord 收集邏輯,缺漏英雄/至寶/水晶/幣 反推全不變,零回歸風險。',
      '★ v3.16.21【版本/範圍】三點同步 _GAME_LOADED_VERSION + _vers[index.html / game_changelog.js] → v3.16.21;本輪只改 index.html + game_changelog.js(admin_panel.js 維持 v3.16.19·無需改:救援卡只讀 diff.extraNoRecordHeroes 渲染·源頭排除即不再顯示這 8 隻)。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.0)。',
    ],
  },
  // v3.16.20 — 取消啟動強制練習營 + 取消每次問設定二段密碼 + 二段密碼設定移到會員 hub
  {
    ver: 'v3.16.20',
    date: '2026-06-25',
    brief: [
      '🎒【取消「課堂練習營」開場強制彈出】登入遊戲時不再自動跳出全螢幕的「課堂練習營」答題視窗,會直接進入遊戲。',
      '🔐【不再每次詢問要不要設定第二段密碼】以前每次登入都會問「要不要設定第二段密碼」,現在取消這個提醒了。想保護帳號的人,改到關卡頁下方「📨 會員帳號與救援申請」→「🔐 二段密碼設置」自己設定即可。',
      '🔑【已經設過密碼的帳號不受影響】如果你之前已經設定過第二段密碼,登入時仍然會照常跳出「請輸入第二段密碼」,保護不變。',
    ],
    items: [
      '★ v3.16.20【取消啟動練習營】window._CAMP_ENABLED 預設值由 true 改 false → _campStart(user) 入口的 if(!window._CAMP_ENABLED) return 直接早退;onAuth 仍會呼叫但不再蓋上覆蓋層。練習營全部程式碼保留(零刪除),GM 需要時可手動 window._CAMP_ENABLED=true 重啟。',
      '★ v3.16.20【取消每次問設定二段密碼】_lxpsRunSecondPwGate 讀 _fbGetMyPwState:已設密碼(sp.hash)→ 維持 _showVerifyForm 彈出輸入(不變);未設密碼分支由原本 _showSetupPrompt(_finish)「詢問是否設定」改為直接 _finish()(設 sessionStorage 通過旗標 + resolve 放行進遊戲),不再彈設定提示。',
      '★ v3.16.20【二段密碼設定入口移到會員 hub】_openMemberAccountHub 在「✏️ 編輯會員資料」鈕下方新增「🔐 二段密碼設置」鈕(_mh-pw)→ onclick 呼叫既有 window._lxpsOpenSecondPwSetup(未設密碼直接開設定表單·已設密碼先驗證舊密碼再改)。後端 _fbSetMyPw/_fbVerifyMyPw/_fbGetMyPwState 與設定·驗證 UI 全部沿用,零後端改動。',
      '★ v3.16.20【版本/範圍】三點同步 _GAME_LOADED_VERSION + _vers[index.html / game_changelog.js] → v3.16.20;本輪只改 index.html + game_changelog.js(admin_panel.js 維持 v3.16.19·world-boss*/hero_db/arena/sw 等皆未動)。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.99)。',
    ],
  },
];
