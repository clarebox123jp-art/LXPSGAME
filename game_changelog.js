// ════════════════════════════════════════════════════════════════════════
//  game_changelog.js  —  LXPSGAME 更新日誌
//  最後更新:2026-07-07  / 目前主程式版本:v4.38.0(三支爆發影片改成和特寫圖同時出現並完全取代、且有聲音)
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
  // v4.37.0 — 🎬 三支爆發技動畫更新 + 改成覆蓋右邊大特寫圖
  {
    ver: 'v4.37.0',
    date: '2026-07-07',
    brief: [
      '🎬【爆發技動畫大改版!】藝天使．克雷爾、主神奧汀、魔劍姬‧伊莉雅(神魔滅斬)這三支爆發動畫都更新了新版本;而且播放方式改了——以前動畫是「鑲嵌在畫面正中央上方的小框」,現在改成「直接覆蓋右邊那張爆發特寫大圖」,尺寸放大到跟特寫圖一樣大,出現時機也和特寫圖同時,魄力更足!',
      '✨【往後新英雄也一樣】未來新的 SSR 英雄若有動畫版爆發特寫,也會用這個「覆蓋右邊大特寫圖」的方式呈現。',
    ],
    items: [
      '★ v4.37.0【影片破快取重抓·index.html】老師更新了三支影片檔(天界彩繪動畫/神魔滅斬動畫/諸神的黃昏·同檔名內容變)。_BV_RAW 產生影片 URL 時附上 ?v=<版本>(讀 _LXPS_FILE_VERSIONS[\'index.html\']),每次版本 bump 即產生新 URL → 客戶端強制重抓最新影片(raw.githubusercontent 忽略未知 query 照常回檔);解決「同檔名被瀏覽器/SW 快取成舊影片」。',
      '★ v4.37.0【取消中央鑲嵌·改覆蓋右側靜態特寫大圖片·index.html】_ensureBurstVideoStyle 的 #_bv-overlay 由「畫面正中上方 left:50%+translateX·width:58%·height:50%·z60」改為「right:0;top:0;width:600px;height:100%·z461·object-fit:cover」——與右側靜態特寫盒 #burst-img-panel(z460)完全同框同尺寸,影片以 z461 覆蓋在靜態特寫圖之上、集中效果線(z462)與招式名大字(z465)仍疊在最上。播放器 _playBurstVideo 與觸發流程(execBurst 撐住模式→建立特寫圖→緊接播影片)不變,故影片出現時機同特寫圖。',
      '★ v4.37.0【伊莉雅技能影片統一·資料驅動可擴充】魔劍姬 gated S1「神魔滅斬」技能影片同樣落在右側特寫框(統一呈現)。未來 SSR 動畫版爆發特寫只需在 _BURST_VIDEO_DB 加一筆(url 用 _BV_RAW(\'檔名.mp4\')),即自動走「覆蓋右側特寫」做法,無需改邏輯。',
      '★ v4.37.0【範圍與驗證】只改 index.html(_BV_RAW 破快取 + _ensureBurstVideoStyle 定位/尺寸/object-fit + 規格註解);admin_panel.js/game_changelog.js 版號/公告對齊。hero_db.js/world-boss.js/world-boss-ui.html/arena.js/sw.js 未改免重傳。check_inline 20 塊/node --check/孤立代理字元/admin 零真 ?./7 版本同步點 全數 → v4.37.0。GAME_CHANGELOG 維持 20 筆(移除最舊 v4.17.0)。上傳順序:game_changelog.js → admin_panel.js → index.html(最後)。',
    ],
  },
  // v4.36.0 — 🐾 寵物在英雄倒下/復活時不再消失 + 戰鬥中換寵物同步換爆發技
  {
    ver: 'v4.36.0',
    date: '2026-07-07',
    brief: [
      '🐾【友方英雄倒下、復活時,身上帶的寵物不會再不見了!】以前英雄在戰鬥中倒下(或被免死盾犧牲)後,角色卡上的跟隨寵物小圖有時會消失,復活後也回不來。現在只要英雄有帶著寵物,不管牠是倒下還是又站起來,寵物圖都會一直顯示——唯一會變的只有「這場已經用過的寵物爆發次數」。(鬥技場本來就不能帶寵物,不受影響。)',
      '🔄【戰鬥中替換跟隨寵物,爆發技也會跟著換!】以前在戰鬥中幫英雄換一隻新寵物,圖片換了、但寵物的「極限爆發技」有時還是舊寵物那招。現在替換寵物時,圖片、寵物爆發技名稱、以及實際施放的爆發效果三者會完全一致,換誰就用誰的招。',
    ],
    items: [
      '★ v4.36.0【倒下/復活寵物浮圖不消失·index.html】renderCard 建立寵物浮動去背圖(.pet-float-badge)的來源判斷,原為「h.equip.n || h._followPet」;英雄死亡處理(黑冠麻鷺免死盾犧牲等)會把 equip 清成 null,若 _followPet 也未設就無來源 → 浮圖消失。修法:來源加第三層耐久 fallback _pfPnDurable = 當該英雄為 p1 非好友英雄、寵物系統對本人開放(_petSysOpenForMe())、且處於冒險/世界BOSS/單人練習戰(_adventureMode||_wbInWorldBossMode||_wbSoloPracticeMode·明確排除鬥技場)時,讀 window._petFollowOf(h.name) 取得其跟隨寵物名 → 即使 equip/_followPet 被清仍持久顯示攜帶寵物。舊條件保留為註解(誤刪是大忌)。無 ?.。',
      '★ v4.36.0【替換寵物同步爆發技·index.html】戰鬥中兩條主要替換路徑(_advApplyPetToHero / 答題獎勵 _advFinishPetPick)本就同時設 equip(圖片)與 _followPet(→爆發名),爆發名由 _petFollowBurstName 讀 h._followPet 動態決定、爆發執行 _runPetBurst 亦讀 h._followPet;破口在舊版通用 doEquip 裝寵路徑只設 equip 沒設 _followPet → 圖換了但 _petFollowBurstName fallback 回舊寵。修法:doEquip 於 _markPetCollected 之後,若裝備物件帶 pet,補設 h._followPet=eq.pet、h._petBurstUsedByPet、h._petBurstUsed(已用次數視圖)、h._petBurstBonus(好感≥100 多一次),比照 _advApplyPetToHero → 圖片+爆發名+爆發執行三者一致。刻意不重設寵物素質加成(比照既有設計·防中途換寵回血 exploit)。無 ?.。',
      '★ v4.36.0【範圍與驗證】只改 index.html(renderCard 浮圖來源 + doEquip 裝寵補設兩處);admin_panel.js/game_changelog.js 版號/公告對齊。hero_db.js(v4.20.0)/world-boss.js(v4.30.0)/world-boss-ui.html(v4.28.0)/arena.js(v3.15.60)/sw.js 未改免重傳。check_inline 20 塊/node --check/孤立代理字元/admin 零真 ?./7 版本同步點 全數 → v4.36.0。GAME_CHANGELOG 維持 20 筆(移除最舊 v4.16.0)。上傳順序:game_changelog.js → admin_panel.js → index.html(最後)。',
    ],
  },
  // v4.35.0 — 🐉 天神宙斯「天降雷罰」秒殺龍王的漏洞修好了
  {
    ver: 'v4.35.0',
    date: '2026-07-07',
    brief: [
      '🐉【世界龍王不會再被「一招秒殺」了!】修正天神宙斯的極限爆發「天降雷罰」等即死類招式,原本會把最新幾隻世界 BOSS 龍王當成「小怪」直接打到只剩 1 滴血(等於一招秒殺)的嚴重漏洞。現在全部 8 隻龍王一律享有「王者尊嚴」保護,即死招式對龍王只會造成有上限的傷害,絕不會再被秒殺!',
    ],
    items: [
      '★ v4.35.0【天降雷罰秒殺龍王根治·index.html】根因:即死/秒殺保護的權威判定 _zeusIsTrueBoss 依賴的 _ZEUS_TRUE_BOSSES 清單只登錄到第三隻龍王(火山炎/翠綠森/山岳地),後 5 隻龍王(深淵海/風暴雷/邪骨暗/神聖光/星辰幻)漏加 → 被判為「非 BOSS」→ 天降雷罰(curHp=1)/死神收割(curHp=0)/大嘴吸入(curHp=0)/超能衝鋒瀕死 等把龍王當小怪直接設 HP=1/0(繞過 doDmg 5000 cap)一發秒殺。',
      '★ v4.35.0【單一真相修法】改 _zeusIsTrueBoss 函式本體加 _isWorldBossTarget(讀 WORLD_BOSS_LINEUP)判定,一律認全 8 龍王為真 BOSS,未來新增龍王自動涵蓋;龍王改走「BOSS 分支」比例傷害(受 5000 cap)不再被秒殺。連死神收割/大嘴吸入/超能衝鋒等同源秒殺技一併修好。',
      '★ v4.35.0【安全與範圍】僅影響 _zeusIsTrueBoss() 秒殺保護判定(全保護方向);不動 _ZEUS_TRUE_BOSSES.has() 直接呼叫(checkWin BOSS 存活/尊嚴反擊結算);_applyBossLifelineProtection 對世界 BOSS 有 worldboss 早退不受影響;玩家英雄阿蘇火山/青炎龍王不在 lineup 不誤判。只改 index.html;admin_panel.js/game_changelog.js 版號同步。',
      '★ 鐵則(今後永久生效):新增冒險關 BOSS 只要進 _ZEUS_TRUE_BOSSES 權威清單,即自動享有「BOSS 尊嚴」(50%/1HP 兩段鎖血+強制爆發反擊);新增世界 BOSS 只要進 WORLD_BOSS_LINEUP,即自動享有「單次傷害上限 5,000」——任何會造成傷害的公式對世界 BOSS 都不可再出現直接秒殺/HP 剩 1/HP 比例傷害/固定傷害超過 5,000。',
    ],
  },
  // v4.34.0 — 🐉 世界龍王連線戰「一場秒殺」修復
  {
    ver: 'v4.34.0',
    date: '2026-07-07',
    brief: [
      '🐉【世界龍王連線戰「一場被秒殺」的重大漏洞修好了!】修正世界 BOSS 龍王在「連線正式討伐戰」中,極少數情況下會被單一隊伍「一場戰鬥就打掉近千萬血、瞬間擊敗」的嚴重問題。龍王的「單次最多 5,000 傷害」尊嚴限制,現在不論戰鬥途中發生什麼狀況(斷線續戰、狀態殘留等)都一律生效,再也不會整場失效被秒殺。之前因此漏洞產生的異常排行紀錄,老師可在後台單筆刪除並補償參戰同學。',
    ],
    items: [
      '★ v4.34.0【乙案·龍王 cap 守門硬化·index.html】根因:doDmg 內 7 個龍王傷害 cap 站點(主路徑/固定傷害/爆擊額外的 pre-cap+終極 5000 cap+回合累計 budget)原守門為「_isWorldBossTarget(target) && _adventureStage===\'worldboss\'」兩條件同時成立才套 cap;連線正式龍王戰若中途被快照/續戰還原(_advRestoreSnapshot:_adventureStage=snap.stage)或殘留 maokong 冒險狀態把 _adventureStage 洗成非 worldboss,兩條件之一失效即「整場所有 cap 靜默全失效」→ 龍王被幾發普攻/技能秒空(排行榜 _dealt=boss.hp-boss.curHp=本場真實掉血 9.38M)。修法:新增單一真相 helper _wbCapStageOk()(恆回 true,stage 異常時 console.warn 一次診斷),7 站點守門改為「_isWorldBossTarget(target) && _wbCapStageOk()」→ 只要 target 是 WORLD_BOSS_LINEUP 八龍王之一就一律套 5000 cap,不再依賴脆弱的 _adventureStage。玩家英雄「阿蘇火山龍王/青炎龍王」名字不在 lineup、_isWorldBossTarget 回 false、絕不誤中。舊 _adventureStage 條件全部保留為註解(誤刪是大忌)。純記帳(addContribution)/FX 同步/護盾觸發/治療免疫等非 cap 站點維持原 stage 條件不動(stage 洗掉時只會少記傷害或少觸發護盾,不會造成秒殺,守保守原則)。',
      '★ v4.34.0【GM 排行榜工具補齊全 8 龍王·admin_panel.js·後台】「🏆 世界 BOSS 排行榜管理」原寫死火山炎龍王(_bindWblbSection 的 const BOSS_ID),七隻新龍王的排名/傷害看不到也刪不了。修法:區塊加龍王下拉 _admin-wblb-boss-select(依 WORLD_BOSS_LINEUP 列全 8 龍王·標⭐當前),BOSS_ID 改 let(預設帶入當前龍王 _wbGetCurrentBossId),下拉切換即換 BOSS_ID+重新整理;讀榜/清榜/明細(逐隊英雄+等級/四冠軍/📜傷害來源明細=每位英雄每個技能名稱+累積傷害+命中次數)/勾選刪除異常紀錄/單場墓碑標記+發補償券 全部閉包共用同一 let BOSS_ID → 切龍王即全套切換,龍王名稱全動態(_wbBossName)。讓老師可隨時針對「一場秒殺/異常傷害」紀錄單筆刪除並補償參戰玩家。',
      '★ v4.34.0【範圍與驗證】改 index.html(7 個 cap 站點守門+helper)+admin_panel.js(GM 排行榜工具);game_changelog.js 版號/公告。hero_db.js/world-boss.js/world-boss-ui.html 凍結免重傳。check_inline 20 塊/node --check/孤立代理字元/admin 零真 ?./7 版本同步點 全數 → v4.34.0。GAME_CHANGELOG 維持 20 筆(移除最舊 v4.14.0)。上傳順序:game_changelog.js → admin_panel.js → index.html(最後)。',
    ],
  },
  // v4.33.0 — 🐾 預設陣容記住寵物 + 🎬 爆發技影片播放順序改善
  {
    ver: 'v4.33.0',
    date: '2026-07-06',
    brief: [
      '🐾【冒險預設陣容會記住寵物了!】在冒險模式儲存「預設陣容」時,現在會一起記住每位英雄身上帶的跟隨寵物;打開預設陣容清單會看到每位英雄下方顯示攜帶的寵物圖與名字,套用這個陣容時也會自動幫大家戴回當時的寵物(鬥技場本來就不能帶寵物,不受影響)。',
      '🎬【爆發技影片播放順序更順了!】有專屬爆發動畫的英雄(藝天使‧克雷爾、主神奧汀等),施展爆發時:爆發字幕、集中效果線、爆發音效、全螢幕光彩會和影片「同時出現」,字幕與效果線會一直撐到影片播完;影片位置從左上角移到畫面「正中央上方」;要等影片播完(或按「跳過」)才會放原本的爆發特效並顯示傷害/治療數字。影片右下角有「跳過 ⏭」鈕,趕時間可以直接跳過。',
    ],
    items: [
      '★ v4.33.0①【冒險預設陣容儲存跟隨寵物·甲·index.html】_confirmSavePreset 於冒險模式(_adventureStage!=null)把 heroes.map(_petFollowOf) 存為槽位新欄位 pets[](鬥技場不存);_advPresetTeams 是整個陣列寫進主存檔→Firestore set(merge:true) 對陣列整包取代不深合併,加 pets 欄位天生安全且自動上雲。openPresetTeamPanel 冒險模式每位英雄下方顯示寵物去背圖(_petNobgUrl·onerror→🐾)+寵物名(舊存檔無 pets 欄位退回讀當下 _petFollowOf 不留白)。_applyPresetTeam 冒險分支套用時對 pt.pets[] 逐一 _petSetFollow 還原跟隨寵物(_petIsTamed 守門,未馴養靜默略過),戰前 _applyFollowPetToHero 據此上寵物。',
      '★ v4.33.0②【爆發技影片播放時序重排·index.html】僅「有爆發影片的玩家英雄(_BURST_VIDEO_DB[h.name])且非世界BOSS」走重排:execBurst 尾端 t=0 同時起播 爆發字幕(大字)+集中效果線+爆發音效(sfx-burst)+全屏光彩(flashScreen)+影片;_showBurstCinematic 加「撐住」模式(window._bvHoldCinematic)→大字/集中線不自動淡出、不自動放 GIF,存參照待影片結束回收;_playBurstVideo 新增 onEnd 回呼,影片自然結束/跳過/載入失敗/10s 兜底任一路徑只觸發一次→收大字/集中線→放原有 GIF 特效→顯示傷害/治療數字(執行爆發效果·抑制 _runBurst 內部重播影片旗標 _bvSuppressInRunBurst)。overlay 位置由左上改置中上方(left:50%+translateX·貼頂),新增「跳過 ⏭」鈕(overlay pointer-events:none,鈕單獨 auto)。世界BOSS(多人同步時序敏感)與無影片英雄一律走原路徑,零改動。',
      '★ v4.33.0【範圍與驗證】只改 index.html(兩功能)+admin_panel.js/game_changelog.js 版號對齊;hero_db.js(v4.20.0)/world-boss.js(v4.30.0)/world-boss-ui.html(v4.28.0)凍結免重傳。7 版本同步點 → v4.33.0。GAME_CHANGELOG 維持 20 筆(移除最舊 v4.13.6)。上傳順序:game_changelog.js → admin_panel.js → index.html(最後)。★待辦:鬥技場預設陣容顯示/儲存(鬥技場禁寵物,僅至寶加成待評估)。',
    ],
  },
  // v4.32.0 — 🛒 超商動態背景 + 🎬 爆發技影片顯示修復 + 🛡 BOSS 尊嚴根治 + 🐉 龍王排名至寶對應
  {
    ver: 'v4.32.0',
    date: '2026-07-06',
    brief: [
      '🛒【不可思議超商變成會動的了!】進到「不可思議超商」(每日商店)時,背景會播放一段全螢幕的動態影片,讓超商更有氣氛!畫面自動淡入,萬一載入失敗會自動換回靜態背景圖,不影響購物。',
      '🎬【爆發技動畫終於出得來了!】修好「爆發技鑲嵌動畫沒有出現」的問題(影片網址與顯示階層都調整過),藝天使‧克雷爾、主神奧汀、魔劍姬的爆發動畫現在會正確疊在戰鬥畫面上。',
      '🛡【王者尊嚴補強!】修正「魔劍姬爆發一發把關卡 BOSS 秒殺、沒有觸發強制鎖血與爆發反擊」的漏洞。現在 BOSS 遇到會致命的暴擊,一樣會先鎖在半血/1 滴血並反擊,不會被一擊帶走。',
      '🐉【龍王排名獎勵至寶對應正確了!】世界 BOSS 排名獎勵的「龍王專屬至寶」現在會正確對應「當前這隻龍王」——雷龍王發雷龍王之翼、海龍王發海龍王之爪…等,全 8 隻龍王都對應好了(原本雷/海/暗/光/幻會誤發成火龍王之牙)。獎勵頁的至寶介紹也一併顯示正確。',
    ],
    items: [
      '★ v4.32.0①【不可思議超商動態影片背景·index.html】商店 overlay(#shop-overlay)最前端新增全螢幕動態影片 #shop-bg-video(autoplay/loop/muted/playsinline·onloadeddata 才淡入·onerror 自動隱藏→露出靜態 不可思議超商.png),作法比照召喚星空/鬥技場:z-index:0 疊在自身靜態底圖之上、遮罩(z0)與內容(z1)之下,pointer-events:none。',
      '★ v4.32.0②【爆發技影片沒出現·根治】❶URL 由相對路徑檔名改完整 raw(_BV_RAW encodeURIComponent)——全站影音一律走 raw.githubusercontent,GitHub Pages 下相對路徑會 404→onerror 靜默移除→影片不出現。❷_playBurstVideo 錨點由 #field-center(場地效果卡容器·常空→updateFieldFX 會 center.innerHTML=\'\' 幾乎零高度且清掉 overlay)改為穩定全尺寸 #gc(戰鬥畫面外層·z-index:60 疊在敵方卡牌區上方)。',
      '★ v4.32.0③【BOSS 尊嚴·魔劍姬必爆穿透鎖血根治】doDmg 的「暴擊額外傷害」是主傷之後另扣一次的補扣路徑,原本只有「本擊主傷已觸發鎖血」時才歸零;漏洞=主傷未觸發鎖血(HP 仍 >0/未破 50% 門檻,或第一段已用但主傷未致命),但主傷+暴擊額外會把 BOSS 打到 <50% 或 ≤0 時,暴擊額外照扣→穿透兩段鎖血直接秒殺、且不觸發反擊(魔劍姬「魔尊血脈」對關卡 BOSS 必定暴擊→穩定觸發此洞)。修法:對真 BOSS 讓暴擊額外補扣也經 _applyBossLifelineProtection(此時 curHp 已扣主傷,依剩餘 HP 正確判 50%/1HP 鎖血並排程強制爆發反擊)。世界 BOSS 走 5000 cap 不受影響(鐵律 1.31)。',
      '★ v4.32.0④【龍王排名獎勵至寶對應各龍王·index.html】原 _WB_DRAGON_T_MAP 只有火/草/地 3 筆→雷/海/暗/光/幻 5 隻查無 bossId→fallback 火龍王之牙(排名獎勵與獎勵頁至寶彈窗都發錯/顯示錯)。新增單一真相 helper window._lxpsDragonTreasureMapFull()/_lxpsDragonTreasureId(bossId):本地完整 8 龍王 base(炎龍王之牙/森龍王之鬚/地龍王之麟/雷龍王之翼/海龍王之爪/暗龍王之骸/光龍王之羽/幻龍王之角)· Object.assign 疊 world-boss.js window._WB_DRAGON_TREASURE_MAP;排名獎勵發放與 _wbShowDragonTreasureInfo 雙路徑改走 helper。未來新增龍王只需補一筆即自動對應。★ world-boss.js 未動(其顯示 map 仍 3 筆但被本地 8 筆覆蓋;因 raw 落後於未部署 v4.30.0,不動避免誤刪三龍王微調)——world-boss.js 顯示 helper map 之後由老師於正確 v4.30.0 底本補齊 8 筆。',
      '★ v4.32.0【範圍與驗證】改 index.html(超商 video/爆發影片 URL+錨點/BOSS 尊嚴引擎/龍王至寶 helper);admin_panel.js/game_changelog.js 版號對齊。7 版本同步點 → v4.32.0(world-boss.js v4.29.0 未動 / hero_db.js v4.20.0 / world-boss-ui.html v4.28.0 / arena.js v3.15.60 凍結免重傳)。GAME_CHANGELOG 維持 20 筆。上傳順序:game_changelog.js → admin_panel.js → index.html(最後)。★待辦:鬥技場預設陣容顯示跟隨寵物去背圖+寵物名、並把寵物/至寶加成存進預設陣容記錄(尚未做)。',
    ],
  },
  // v4.31.0 — 🎬 三英雄爆發技鑲嵌動畫上線(資料驅動可擴充)
  {
    ver: 'v4.31.0',
    date: '2026-07-06',
    brief: [
      '🎬【爆發技動畫登場!】部分英雄施展極限爆發時,戰鬥畫面左上角會疊上一段專屬的動畫短片,讓爆發更有氣勢!動畫會自動淡入淡出、播完就消失,不影響操作。',
      '👼 藝天使．克雷爾 施放極限爆發時 → 播放「天界彩繪」動畫。',
      '⚡ 主神奧汀 施放極限爆發時 → 播放「諸神的黃昏」動畫。',
      '⚔️ 魔劍姬‧伊莉雅 只有在爆發「魔尊覺醒」進入再行動、免費施放 S1 神魔滅殺 的那一下 → 播放「神魔滅斬」動畫(直接放 S1 或還沒覺醒都不會播)。',
      '✨ 之後會陸續替更多英雄的爆發技加上專屬動畫,敬請期待!',
    ],
    items: [
      '★ v4.31.0【爆發技鑲嵌動畫系統·index.html·資料驅動可擴充】新增資料表 _BURST_VIDEO_DB(英雄名→爆發影片)與 _SKILL_VIDEO_DB(英雄名→特定技能+條件影片)+ 播放器 _playBurstVideo/_ensureBurstVideoStyle:overlay 錨定 #field-center 填左上(width52%/height50%/z-index60)、opacity 淡入淡出、播完 onended/onerror 自動移除、pointer-events:none 純視覺不吃點擊、muted+playsinline+webkit-playsinline(舊 iPad inline autoplay)、play().catch 與 10s watchdog 兜底、載入失敗靜默略過絕不擋爆發。之後大量新增只加一筆資料,不改邏輯。',
      '★ v4.31.0【三掛鉤點·鐵律1.128雙實作】① _runBurst 內 name=_mimicSourceName||h.name 後:side===p1 且 _BURST_VIDEO_DB[name] 存在即播(藝天使→天界彩繪動畫.mp4、奧汀→諸神的黃昏.mp4)。②execSkill 與 ③aiUseSkill 開頭各查 _SKILL_VIDEO_DB[a.name]:魔劍姬 sk.n===神魔滅殺 且 a.side===p1 且 when(a)=h._iliyaBurstActive===true 才播 神魔滅斬動畫.mp4(自動戰鬥 p1 同觸發)。',
      '★ v4.31.0【影片壓縮·交付】三支 720p 去音軌(ffmpeg libx264 crf29 veryslow +faststart):天界彩繪動畫 7.1MB→866KB、神魔滅斬動畫 7.5MB→1.39MB、諸神的黃昏 5.8MB→966KB(原檔名直接覆蓋 GitHub 根目錄·網址不變)。',
      '★ v4.31.0【版本與驗證】7 版本同步點 → v4.31.0(index.html + admin_panel.js + game_changelog.js;world-boss.js 維持 v4.30.0、hero_db.js 維持 v4.20.0 免重傳)。GAME_CHANGELOG 維持 20 筆(移除最舊 v4.13.4)。上傳順序:game_changelog.js → admin_panel.js → index.html(最後)。',
    ],
  },
  // v4.30.0 — 🐲 世界 BOSS 最後三龍王(邪骨暗/神聖光/星辰幻)技能·爆發·天賦·特效·音效正式實裝
  {
    ver: 'v4.30.0',
    date: '2026-07-06',
    brief: [
      '🐲【世界 BOSS 最後三隻龍王正式登場!】邪骨暗龍王、神聖光龍王、星辰幻龍王原本是「設計中(招式未知)」,現在技能、大絕招、天賦、專屬視覺特效與音效全部到位,可以正式挑戰了!',
      '💀【邪骨暗龍王(暗屬性)】天賦「黃泉之意志」:每回合會對一名英雄烙下死亡宣告(倒數歸零會倒下,要盡快解除),而且畏懼光屬性(受光屬性傷害增加)。招式「幽冥凋零 / 黃泉侵蝕」、爆發「黃泉歸葬」,伴隨煙霧與死神鐮刀特效。',
      '✨【神聖光龍王(光屬性)】天賦「高天原之意志」:每回合會封印一名英雄的技能與爆發,而且畏懼暗屬性。招式「神聖裁決 / 天罰之光」、爆發「高天原審判」,伴隨審判光束與金色聖光特效。',
      '🌌【星辰幻龍王(無屬性·終極)】天賦「星辰之意志」:免疫所有異常狀態、極高迴避、受普通攻擊傷害減少,需要湊齊七種屬性才能有效破防。招式「星流閃擊 / 銀河潮汐」、爆發「星辰湮滅」,伴隨星辰與虛空特效。',
    ],
    items: [
      '★ v4.30.0【三龍王技能/爆發/天賦正式化·world-boss.js】HERO_DB 內嵌補充的 s1/s2、BURST_DB 三筆爆發、HERO_TRAIT/HERO_LORE/HERO_BIO 由「? 未知/設計中」改為正式技能文案。暗=幽冥凋零(c5·特130% 全體暗+隨機2死亡宣告)/黃泉侵蝕(c6·特150% 全體暗+全體強力易傷)/爆發黃泉歸葬(特150% 全體暗 無視增益+全體死亡宣告+隨機2強力暈眩)。光=神聖裁決(c5·特130% 全體光+隨機2封印)/天罰之光(c6·特150% 全體光+隨機2強力暈眩)/爆發高天原審判(特150% 全體光 無視增益+全體封印+隨機1強力暈眩)。幻=星流閃擊(c5·特130% 全體無屬性+隨機2暈眩)/銀河潮汐(c6·特150% 全體+隨機2強力易傷)/爆發星辰湮滅(特160% 全體 無視增益+全體暈眩+全體強力易傷)。',
      '★ v4.30.0【三龍王專屬特效 key·world-boss.js】_WB_FX_URLS 新增 9 key(全用現有英雄爆發技 GIF·curl 200):暗 dark_s1=煙霧爆開.gif / dark_s2=永恆藍染詛咒.gif / burst_dark=死神之鐮.gif;光 light_s1=審判光束.gif / light_s2=持續神聖光芒.gif / burst_light=金色閃光炸開.gif;幻 omni_s1=彩色星星.gif / omni_s2=星空祝福.gif / burst_omni=萬鏡映虛獄.gif。切勿再用通用 s1/s2(=火雨/集中線)或 _wbPlayBurstAnimation(寫死火龍王)。',
      '★ v4.30.0【三龍王 AI 與 dispatcher·world-boss.js】新增 _wbDark/Light/OmniBossS1/S2/Burst 共 9 個 AI 函式(比照海龍王/雷龍王範本:playSfx + _wbPlayFullscreenFx + doDmg 迴圈 + addStatus + log + _scheduleBossEnd);dispatcher _wbAdvBossS1/S2/Burst 三處各加暗/光/幻 3 分支(按中文名分流),不再落預設火龍王。爆發音效:暗 sfx-darkorb-burst、光 sfx-athena-burst、幻 sfx-fantasy,皆 +sfx-burst。',
      '★ v4.30.0【三龍王天賦引擎·world-boss.js + index.html】暗龍王每回合死亡宣告(BOSS 主行動 hook)+ 受光屬性+30%(_wbApplyBossDmgCap);光龍王每回合封印+爆發封印(seal+_burstSeal)+ 受暗屬性+30%;幻龍王三防禦被動(免疫異常/迴避+30%/受普攻-30%)沿用 v4.16.0 已在 index.html 引擎的實作。',
      '★ v4.30.0【版本與驗證】world-boss.js 續解凍(v4.29.0→v4.30.0);7 版本同步點 → v4.30.0(index.html + admin_panel.js + world-boss.js + game_changelog.js;hero_db.js 維持 v4.20.0、world-boss-ui.html 維持 v4.28.0 免重傳)。GAME_CHANGELOG 維持 20 筆(移除最舊 v4.13.3)。上傳順序:game_changelog.js → admin_panel.js → world-boss.js → index.html(最後)。',
    ],
  },
  // v4.29.0 — ⚡ 風暴雷龍王 S1/S2/爆發 雷電特效與爆發名稱改回正確(原顯示成火龍王的)
  {
    ver: 'v4.29.0',
    date: '2026-07-06',
    brief: [
      '⚡【風暴雷龍王的招式與大絕招改回「雷電」特效與名稱了!】之前風暴雷龍王(雷龍王)使出招式和極限爆發時，畫面特效和技能名稱都錯誤地顯示成火龍王的(火焰特效、「天崩之炎」)。現在全部修正:S1「雷霆貫穿」、S2「暴風肅清」、爆發「雷神·萬雷殛世」都會播放正確的雷電/暴風特效與名稱。',
      '❄【順帶修正:深淵海龍王 S1「絕對零度」的特效也改回冰系】原本誤用火焰特效，現在改成冰椎特效。',
    ],
    items: [
      '★ v4.29.0【風暴雷龍王 S1/S2/爆發 雷電特效與爆發名稱修正·world-boss.js】根因:_WB_FX_URLS 對照表裡 s1=火雨.gif(火龍王特效)、爆發 _wbPlayBurstAnimation() 寫死播「火山炎龍王/天崩之炎」;風暴雷龍王 S1/S2 之前傳通用 key s1/s2、爆發呼叫 _wbPlayBurstAnimation → 三招全顯示成火龍王的火特效與火爆發名稱。修法:新增雷電專屬 key(全用現有英雄爆發技 GIF)wind_s1=迅雷不及掩耳的攻擊.gif、wind_s2=龍捲風.gif、burst_wind=雷雨.gif;_wbWindBossS1 特效 s1→wind_s1、_wbWindBossS2 特效 s2→wind_s2、_wbWindBossBurst 由 _wbPlayBurstAnimation() 改 _wbPlayFullscreenFx(burst_wind)(只播雷雨 GIF·爆發 log 本就正確輸出「雷神·萬雷殛世」)。連線戰/單人戰皆走本檔 dispatcher(_wbAdvBossS1/S2/Burst)一併修正。',
      '★ v4.29.0【順修 深淵海龍王 S1 絕對零度 特效·world-boss.js】_wbWaterBossS1 特效 s1(火雨.gif 火龍王特效)→ burst_water(冰椎爆裂.gif·冰系正確)。',
      '★ v4.29.0【版本與驗證】world-boss.js 解凍(v4.22.0→v4.29.0);版本同步點 → v4.29.0(index.html + admin_panel.js + world-boss.js + game_changelog.js;hero_db.js 維持 v4.20.0、world-boss-ui.html 維持 v4.28.0 免重傳)。GAME_CHANGELOG 維持 20 筆(移除最舊 v4.13.2)。上傳順序:game_changelog.js → admin_panel.js → world-boss.js → index.html(最後)。',
    ],
  },
  // v4.28.0 — 🐲 龍王戰三修:英雄詳細預覽不再被血條蓋住 + 一進場自動帶跟隨寵物 + 卡片寵物圖縮小
  {
    ver: 'v4.28.0',
    date: '2026-07-06',
    brief: [
      '🐲【龍王戰角色卡預覽不再被血條蓋住!】在世界BOSS(龍王)戰鬥中點角色卡看詳細預覽時，上半部原本會被上方龍王的超級血條蓋住看不到，現在修好了——預覽會完整浮在最上層。',
      '🐾【一進龍王戰就自動帶上你設定的跟隨寵物!】以前單人打龍王時，明明幫英雄設好了跟隨寵物，一進場卻不會出現(卡片沒有寵物圖、也顯示「無寵物」)，要等戰鬥中出現寵物再手動選才會有。現在一進戰鬥就會自動讀取你設定好的跟隨寵物並顯示在角色卡上。',
      '🖼【角色卡右上角的寵物圖縮小、不再蓋住HP條!】戰鬥角色卡右上角的寵物去背圖片縮小了約 30%，並往下移到 HP 條下方，不會再擋住血量數字。',
    ],
    items: [
      '★ v4.28.0【英雄詳細預覽被龍王超級血條蓋住·根治·index.html】根因:#hero-preview-overlay 位在 #gc 內、且是 position:absolute(main.css z-index:9990，行內雖已拉到 12000，但只在 #gc 這個堆疊脈絡內有效);世界BOSS大廳 #wb-lobby-overlay 是「body 層 z-index:9000」→ 整個 #gc(含此預覽)被壓在它之下，故大廳內的龍王超級血條反而蓋住預覽。修法:showHeroPreview 顯示時把預覽移到 body 層 + 改 position:fixed(inset:0 滿版) + z-index 12000 → 高於 body 層 9000 的世界BOSS大廳，預覽穩定浮在最上層(手法同 v4.9.0 圖鑑 detach to body)。一般冒險戰不受影響。',
      '★ v4.28.0【單人龍王戰一進場自動套跟隨寵物·world-boss-ui.html】根因:單人練習/一人龍王戰的 p1 組建走「WB-Solo」路徑(與連線戰 _wbUiStartBattle 不同函式)，原本漏呼叫 _applyFollowPetToHero → 設了跟隨寵物的英雄一進單人龍王戰沒有寵物(浮圖/貓掌爆發槽/寵物爆發/英雄詳細預覽全顯示「無寵物」)。修法:比照連線戰在 p1.push 前補套跟隨寵物(素質加成 + 自動裝備該寵物 + 爆發旗標)，此路徑唯一套用點不雙套。英雄詳細預覽本就用「裝備寵物或跟隨寵物」雙口徑，套上後預覽與卡片皆正確顯示攜帶的寵物。',
      '★ v4.28.0【戰鬥卡寵物浮圖縮小30%+下移不蓋HP條·index.html】renderCard 的 .pet-float-badge:高度 50%→35%、下方圖片 max-width 118→82(縮小約 30%);位置 top 2px→34px，讓浮圖落在 .card-hp-wrap2(固定 23px 高 + 6px 下邊距)之下方的肖像右上角，不再壓住 HP 條數字。純顯示層調整。',
      '★ v4.28.0【驗證與版本】world-boss-ui.html 解凍(v4.25.0→v4.28.0);版本同步點 → v4.28.0(index.html + admin_panel.js + world-boss-ui.html + game_changelog.js;hero_db.js 維持 v4.20.0、world-boss.js 維持 v4.22.0 免重傳)。GAME_CHANGELOG 維持 20 筆(移除最舊 v4.13.1)。上傳順序:game_changelog.js → admin_panel.js → world-boss-ui.html → index.html(最後)。',
    ],
  },
  // v4.27.0 — 🏠 首頁「已信任此裝置」小卡離開首頁自動隱藏 + 🦝 變化狸不悅表情補圖
  {
    ver: 'v4.27.0',
    date: '2026-07-06',
    brief: [
      '🏠【首頁小卡不再擋畫面!】左下角「已信任此裝置」小卡改成「只要離開遊戲首頁就會自動隱藏」——進到關卡選擇、世界BOSS、鬥技場、知識王等任何畫面都不會再殘留擋住畫面(回到首頁會再出現)。',
      '🦝【變化狸生氣表情補上了!】修好寵物小屋裡「變化狸」被戳戳/餵錯時「不悅(生氣)表情」圖片顯示不出來的問題。',
    ],
    items: [
      '★ v4.27.0【裝置信任小卡離開首頁自動隱藏·index.html】根因:v4.26.0 一修改用的「只認首頁 #overlay 可見」判定失效——#overlay 是常駐底層,只有「進入戰鬥」才隱藏,關卡頁/世界BOSS/鬥技場/知識王等全螢幕畫面都是「疊在 #overlay 之上」、#overlay 仍顯示 → 被判成「到處都是首頁」故小卡不隱藏。改為穩健正向偵測:用 elementFromPoint 檢查首頁「開始冒險」鈕(#adventure-btn)中心點的最上層元素是否仍屬於 #overlay(有任何畫面疊上來就會蓋住它)+ 世界BOSS/戰鬥模式旗標雙保險,免逐一列舉所有 overlay;watchdog 每拍加「非首頁且小卡仍在就移除」防殘留。舊「白名單/黑名單」兩版判定皆保留為註解(誤刪是大忌)。',
      '★ v4.27.0【變化狸不悅表情顯示修正·repo 根目錄·異體字檔名】老師其實已上傳不悅表情圖,但檔名用了異體字「變化貍_不悅.webp」(貍 U+8C8D),而遊戲寵物名與去背/開心兩圖用的是「變化狸」(狸 U+72F8)——兩字外觀幾乎相同但編碼不同。程式依寵物名組 變化狸_不悅.webp(狸 U+72F8)去抓 → 對不到那個貍(U+8C8D)檔 → 404 顯示不出。修法:把老師的原不悅圖(640×640 透明 RGBA·完全沿用不重壓)改存為正確檔名 變化狸_不悅.webp(狸 U+72F8·與其他兩圖及寵物名一致)供上傳;老師可把舊的「貍」版檔案刪除(不刪也不影響·只是用不到)。純檔名修正·零程式改動。',
      '★ v4.27.0【驗證與版本】index.html 全部 inline script 通過 node --check、零孤立代理字元;admin_panel.js 通過檢查、0 個真正可選串接。版本同步點 → v4.27.0(index.html+admin_panel.js+game_changelog.js;hero_db.js 維持 v4.20.0、世界BOSS兩檔維持 v4.22.0/v4.25.0 免重傳)。GAME_CHANGELOG 維持 20 筆(移除最舊 v4.13.0·新最舊 v4.13.1)。上傳順序:game_changelog.js → admin_panel.js → index.html(最後);變化狸_不悅.webp 放 repo 根目錄。',
    ],
  },
  // v4.26.0 — 🐾 寵物小屋兩處優化 + 🏠 首頁兩處整理
  {
    ver: 'v4.26.0',
    date: '2026-07-06',
    brief: [
      '🐾【寵物小屋更好操作了!】底部的食物清單縮短了一點,把「寵物圖鑑」大按鈕移到食物清單旁邊的右下角(不再蓋在食物清單上方),說明文字也放大更好讀——現在可以一邊在左邊選食物、一邊從右邊翻開圖鑑;另外和寵物互動時的小提示(例如「不要一直戳我啦」)會直接顯示在「正在互動的那隻寵物頭上」,一看就知道是在說哪一隻。',
      '🏠【首頁看起來更清爽!】右下角那個「已信任此裝置」小視窗改成只在遊戲首頁出現(進到冒險、世界BOSS、鬥技場等畫面就會自動隱藏、不再擋住畫面右下角),位置也從右下角移到左下角;首頁上方的「目前在線／今日上線／累計冒險」統計列,移到了「📖 遊戲介紹與說明書」按鈕的下方。',
    ],
    items: [
      '★ v4.26.0【寵物小屋·食物面板+圖鑑鈕·index.html】#_ph-food 加 box-sizing:border-box + margin-right:clamp(150px,20vw,250px) 由右側縮寬約 20% 騰出右欄;#_ph-codex-desk-btn 由「食物面板正上方 bottom:clamp(126px,34vh,300px)」移到「右下角與食物清單同一水平帶 bottom:clamp(16px,6vh,70px)」+ 新增 width:clamp(132px,17.5vw,224px) 對齊騰出欄寬(不再上下相蓋);桌鈕說明字 clamp(10,1.2vw,13)→clamp(14,1.8vw,19)+移除 white-space:nowrap 讓窄欄可換行。',
      '★ v4.26.0【寵物小屋·互動提示錨定·index.html】_phHintToast 新增第 4 參數 anchorIdx(互動槽位):傳入時讀 #_ph-img-{idx} 的畫面位置,把提示置中貼在該寵物圖正上方(getBoundingClientRect + translateX(-50%) + 左右夾邊防切);無 anchorIdx／找不到寵物圖時退回舊版「畫面右下角」(相容舊呼叫·誤刪是大忌保留)。四個互動提示呼叫點(餵對／餵錯／戳戳生氣／撫摸完成)皆傳入該槽 slotIdx。',
      '★ v4.26.0【首頁·裝置信任小卡·index.html】①_isOnHomepageForBadge() 由「黑名單 overlay 列舉」改「白名單:只認首頁 #overlay 可見」——根治世界BOSS／鬥技場／知識王／練習營／會員hub 等未列入清單的畫面被誤判成首頁、badge 殘留擋住畫面右下角(舊黑名單版保留為註解·誤刪是大忌);進入任何遊戲畫面 #overlay 皆 display:none → 立即隱藏。②badge 位置由右下角 right:14px 改左下角 left:14px。',
      '★ v4.26.0【首頁·在線統計列·index.html】#player-stats-bar 由「首頁頂端置中 top:12px」移到「📖 遊戲介紹與說明書鈕(#game-info-btn·main.css top:78%)下方」top:85%(置中不變)。純顯示定位·統計內容／點擊 _gmOpenOnlineList 不變。',
      '★ v4.26.0【圖檔+驗證+版本】更新「聖䗴神蟲」四張圖(主圖 .png 保留埃及場景背景／去背 .png／開心 .webp／不悅 .webp·表情圖依程式為 .webp)。index.html 全部 inline script 通過 node --check、零孤立代理字元;admin_panel.js 通過檢查、0 個真正可選串接。版本同步點 → v4.26.0(index.html+admin_panel.js+game_changelog.js;hero_db.js 維持 v4.20.0、世界BOSS兩檔維持 v4.22.0 免重傳)。GAME_CHANGELOG 維持 20 筆(移除最舊 v4.12.0·新最舊 v4.13.0)。上傳順序:game_changelog.js → admin_panel.js → index.html(最後)。',
    ],
  },
  // v4.25.0 — 🐉 龍王戰畫面四個小修正(戰報鈕/寵物浮圖/英雄預覽/龍王背景)
  {
    ver: 'v4.25.0',
    date: '2026-07-06',
    brief: [
      '🐉【龍王戰畫面更好看、更好用了!】左下角的「戰報」按鈕(原本的 LOG)縮成和求救鈕一樣的小圓鈕、不再擋到英雄卡;英雄卡上攜帶的寵物「去背發光圖」現在會穩穩出現在角色圖右上角(可以點開看寵物說明);點英雄看詳細資料的視窗不再被龍王血條蓋住;有帶寵物時詳細視窗下方也會正確顯示寵物、不再寫「無寵物」。',
    ],
    items: [
      '★ v4.25.0【戰報鈕·index.html】左下 #log-toggle-btn 由圓角矩形「📜 LOG」改為與 SOS(#adv-battle-help-fab)同直徑的圓鈕(58px·border-radius:50%·font-size:20px·line-height:53px)、標籤改「戰報」(展開時「收合」·_collapseBattleLog/toggleBattleLog 兩 textContent 同步)。縮小後不再壓到最左邊的角色卡;位置維持 SOS 正上方(left:10px bottom:80px)。',
      '★ v4.25.0【寵物浮圖階層·index.html】renderCard 寵物攜帶/跟隨浮動去背圖(.pet-float-badge)原掛在 .card-illus-space(該層是 inset:0 的卡片背景層)→ 被卡片前景文字/技能列/HP 蓋住=老師回報「階層太低沒出現在角色圖右上」(左上稀有度徽章剛好在無文字角落才看得見)。修法:改掛到卡片前景層(el·getComputedStyle position:static 才補 relative)+ z-index 12→30 → 浮圖穩定顯示在肖像右上;位置口徑不變(illus-space 本 inset:0=全卡)。點圖開迷你圖鑑(_togglePetMiniCodex)不變·敵我雙方卡片皆套·涵蓋所有戰鬥畫面(冒險/世界BOSS)·鬥技場本就禁用寵物。',
      '★ v4.25.0【英雄預覽 z-index + 寵物·index.html】①點英雄卡彈出的詳細預覽 #hero-preview-overlay 加行內 z-index:12000(蓋過世界BOSS大廳 #wb-lobby-overlay 9000/元素確認 10500·仍低於 SOS/戰報 2147483646)→ 不再被龍王 BOSS 血條(.wb-mega-hp-zone 吃 lobby 9000)蓋住;所有預覽入口共用此元素故一次生效。②showHeroPreview 寵物顯示來源放寬 h.equip.n || h._followPet(_applyFollowPetToHero 有時只設 _followPet →原只看 h.equip 會誤顯「無寵物」)·與 renderCard 浮圖同口徑·有攜帶就顯示。',
      '★ v4.25.0【龍王戰場背景·world-boss-ui.html】戰鬥畫面 BOSS 背景圖位置 Y -10%→-30%(全龍王通用·龍王在畫面上再往下移 20%·露出龍頭於 HP 條下方;_wbRenderBattleScreen JS 動態設定 + #wb-lobby-overlay.wb-in-battle CSS fallback 兩處同步·硬編碼無 _bossBgY 逐龍王判定→全 8 龍王一致)。老師回報 v4.22.0 的 -10% 仍看不到龍頭故再下移。',
      '★ v4.25.0【驗證與版本】index.html 全部 inline script 通過 node --check、零孤立代理字元;admin_panel.js 通過檢查、0 個真正可選串接。版本同步點 → v4.25.0(index.html+admin_panel.js+game_changelog.js+world-boss-ui.html;hero_db.js 維持 v4.20.0、world-boss.js 維持 v4.22.0 免重傳)。GAME_CHANGELOG 維持 20 筆(移除最舊 v4.11.0·新最舊 v4.12.0)。上傳順序:game_changelog.js → admin_panel.js → world-boss-ui.html → index.html(最後)。',
    ],
  },
  // v4.24.0 — 🤚 寵物小屋「撫摸(按住搓揉)」互動小修正(讓撫摸更穩定)
  {
    ver: 'v4.24.0',
    date: '2026-07-06',
    brief: [
      '🤚【寵物小屋「撫摸」互動更穩定了!】修好了寵物小屋裡「在寵物身上按住搓揉」在某些情況下按了沒反應、無法開始撫摸的小問題。一般同學的撫摸/餵食/玩耍原本就正常,這次是把撫摸的啟動判斷修得更一致、更可靠。',
    ],
    items: [
      '★ v4.24.0【撫摸對 GM 失效修復·index.html】_petHouseStrokeStart 逐槽鎖守門由「直接讀 _petHouseSlotLock 判斷」改「採信 _petHouseAskLockSlot 回傳值」,與餵食 _petHouseFeedMode / 玩耍 _petPlayStart 兩入口一致。根因:v4.21.0 讓 _petHouseAskLockSlot 對管理員一律放行(回 true 但不鎖槽)→ GM 永不鎖任何槽 → _slk 恆為 null → 撫摸入口 if(_slk!==pn) 恆真 → 每次都停在「呼叫 AskLockSlot(對 GM 空轉)後 return」→ GM 撫摸完全無法啟動,且確認視窗因 GM 放行也不彈。修法:未鎖到本寵時呼叫 AskLockSlot,回 false(學生已彈確認 / 鎖到別隻已擋)才 return;回 true(GM 放行)則往下開始撫摸。',
      '★ v4.24.0【影響範圍】僅修復 GM(管理員)測試路徑;一般學生流程完全不變:未鎖此槽→仍先彈「確認今日互動夥伴」視窗、確認後鎖槽、再次按住搓揉才開始撫摸(自 v4.10.0 起行為一致)。餵食/玩耍原本就採信 AskLockSlot 回傳值故對 GM 正常,只有撫摸用了不一致的直接讀鎖寫法。',
      '★ v4.24.0【驗證與版本】index.html 全部 inline script 通過 node --check、零孤立代理字元;admin_panel.js 通過檢查、0 個真正可選串接。版本同步點 → v4.24.0(index.html+admin_panel.js+game_changelog.js;hero_db.js 維持 v4.20.0、世界BOSS兩檔維持 v4.22.0 免重傳)。GAME_CHANGELOG 維持 20 筆(移除最舊 v4.10.0·新最舊 v4.11.0)。本輪 index.html 同時含 v4.23.0 兩處純顯示微調(圖鑑桌鈕右移+食物頁籤藍底)+ v4.24.0 撫摸修復。',
    ],
  },
  // v4.23.0 — 🏠 寵物小屋兩個小調整:圖鑑書本鈕移到右邊、食物分類標籤改藍底更好認
  {
    ver: 'v4.23.0',
    date: '2026-07-06',
    brief: [
      '📖【寵物圖鑑書本鈕移到右邊了!】寵物小屋裡「翻開寵物圖鑑」的書本大按鈕,原本在左邊會擋到第一隻寵物,現在移到右邊、貼齊下方食物面板的上緣,三隻寵物看得更清楚!',
      '🔵【食物分類標籤改成藍色底,更好認!】小屋下方「動物主食大百科」的分類標籤(🌿植物與甜食/🐛蟲類/🍖肉類/🐟水產類/✨特殊)原本是深綠色,跟下面的食物清單底色太像、不好分辨——現在改成藍色底,一眼就看得出來哪些是「分類按鈕」、哪些是「食物」!',
    ],
    items: [
      '★ v4.23.0【寵物圖鑑桌鈕左→右·index.html】_ph-codex-desk-btn 定位由 left:clamp(10px,2vw,28px) 改 right:clamp(10px,2vw,28px)(移到小屋右下·避開左邊第一個寵物槽);bottom 由 clamp(126px,35vh,300px) 微調為 clamp(126px,34vh,300px) 使鈕底緣貼齊下方食物面板 #_ph-food(max-height:34vh)頂端。純顯示層定位,點擊行為/openPetPage 呼叫不變。',
      '★ v4.23.0【食物分類頁籤底色 深綠→深藍·index.html】_petHouseRenderFood 分類頁籤 tb.style:active 由綠漸層改藍漸層(linear-gradient(135deg,rgba(40,95,190,.96),rgba(70,150,245,.96))+藍框+藍光暈)、inactive 由 rgba(22,40,30,.9) 深綠改 rgba(18,30,60,.92) 深藍(藍框+#bcd2f2 淺藍字);與下方食物列表深綠黑底(#_ph-food gradient)區隔明顯。純顏色調整,分類切換/拖曳餵食邏輯不變。',
      '★ v4.23.0【驗證與版本】index.html 全部 inline script 通過 node --check、零孤立代理字元;admin_panel.js 通過檢查、0 個真正可選串接(?.)。版本同步點 → v4.23.0(index.html+admin_panel.js+game_changelog.js;hero_db.js 維持 v4.20.0、世界BOSS兩檔維持 v4.22.0 免重傳)。GAME_CHANGELOG 維持 20 筆(移除最舊 v4.9.0·新最舊 v4.10.0)。本輪改 index.html＋admin_panel.js(僅版號)＋game_changelog.js。',
    ],
  },
  // v4.22.0 — ⚡ 風暴雷龍王改回自己的雷電招式與開場對白 + 世界 BOSS 戰場背景下移 + 連線戰帶跟隨寵物
  {
    ver: 'v4.22.0',
    date: '2026-07-06',
    brief: [
      '⚡【風暴雷龍王終於用自己的招式了!】之前打「風暴雷龍王」時,牠的開場登場對白和施放的技能其實都是「火山炎龍王」的火焰版本(業火灼燒、天崩之炎那些)。現在修好了:雷龍王會用自己的雷電招式——雷霆貫穿(單體雷擊+麻痺)、暴風肅清(全體風傷+淨化自身)、以及爆發「雷神·萬雷殛世」(全體雷擊+全體麻痺),開場咆哮也換回雷龍王專屬台詞。',
      '🐉【龍王大圖不再被血條擋住頭】世界 BOSS 戰鬥畫面裡的龍王背景大圖整體往下移了一點,原本被畫面上方血條/資訊列遮住的龍王頭部,現在看得更完整了(所有龍王都調整)。',
      '🐾【世界王連線戰也能帶跟隨寵物了】以前在世界 BOSS 連線戰,就算你幫英雄設定了「跟隨寵物」,一進戰鬥卻看不到寵物(浮動小圖、貓腳印、寵物爆發都沒有)。現在補上了,設定跟隨的寵物會一起上場!',
    ],
    items: [
      '★ v4.22.0【風暴雷龍王對白+技能修正·world-boss.js】根源:①_WB_BOSS_ROAR_LINES/_WB_BOSS_ROAR_COLOR 只有火/草/土三龍王,缺 taifeng_wind_dragon → 開場對白 fallback 成火龍王三句。補上雷龍王專屬三句咆哮+雷金配色。②三個 BOSS 技能 dispatcher(_wbAdvBossS1/S2/BossBurst)只有草/地/水龍王有專屬分支,風暴雷龍王沒有 → 落到預設分支(=火龍王的業火灼燒/龍吼震懾/天崩之炎,連戰報都印火山炎龍王)。新增 _wbWindBossS1/S2/Burst 專屬 AI(對齊 HERO_DB/BURST_DB[風暴雷龍王] 文案:雷霆貫穿=特技150%單體風傷+麻痺2回合/暴風肅清=特技120%全體風傷+解除自身不利/雷神·萬雷殛世=特技150%全體風傷+全體麻痺1+解除自身不利)+ _wbWindClearBossDebuffs helper(麻痺用遊戲既有 status para、element wind),並在三 dispatcher 海龍王判斷後各加風暴雷龍王分支。',
      '★ v4.22.0【世界 BOSS 戰場背景 Y 下移·world-boss-ui.html】老師需求:龍王戰場上半部被 HP 條擋住 → 全龍王背景圖 object-position 由 center 10% 改為 center -10%(下移 20%)。兩處同步:_wbRenderBattleScreen 的 JS 動態 _lobby.style.background + #wb-lobby-overlay.wb-in-battle 的 CSS fallback。',
      '★ v4.22.0【世界 BOSS 連線戰跟隨寵物·world-boss-ui.html】需求3(甲):連線戰 p1 組隊(_wbUiStartBattle)原本漏套跟隨寵物(一般大冒險/單人練習走 confirmHeroPick 已正確)。在 p1 組隊迴圈養成套用後、push 前,對每個英雄呼叫 window._applyFollowPetToHero(素質加成+自動裝備寵物+爆發旗標)。唯一套用點(_wbSetupAdvForBattle 只設 G.p1 不再套 → 不雙套)。⚠ 連線多人由房主組隊廣播,套的是房主本機的跟隨寵物(=房主帶自己寵物隊伍打;單人完全正確);每位玩家各帶自己寵物需另做連線寵物同步(乙案,日後獨立場次)。',
      '★ v4.22.0【驗證/範圍】解凍 world-boss.js(v4.16.0→v4.22.0)+ world-boss-ui.html(v4.8.0→v4.22.0);index.html/admin_panel.js 僅版號同步;hero_db.js 維持 v4.20.0。node --check world-boss.js 全過、index 20 inline block 0 fail、四檔 0 lone surrogate、admin_panel.js 0 真 ?.、7 版號同步點全 v4.22.0(+world-boss 兩 key 解凍)。GAME_CHANGELOG trim 20 筆(移除最舊 v4.8.0)。零新 Firestore 集合/規則。',
    ],
  },
  // v4.21.0 — 🐾 戰鬥角色卡寵物浮圖與貓掌更明顯 + 寵物小屋槽位空間變大(GM 開關移到老師後台)
  {
    ver: 'v4.21.0',
    date: '2026-07-06',
    brief: [
      '🐾【戰鬥中一眼看出你的寵物!】戰鬥中角色卡上,跟隨(或裝備)的寵物會浮現一張「會發光的去背小圖」在肖像右上角——點一下就能看牠的能力介紹;圖片這次加大、光暈也更亮,更好認了!(要先到寵物圖鑑把某隻寵物設定「跟隨」某位英雄,帶那位英雄出戰就會看到喔)',
      '🐾【貓腳印告訴你還能放幾次寵物爆發!】有跟隨寵物且該寵物有專屬極限爆發時,角色卡左上角兩顆爆發星星「正上方」會出現黃色貓腳印🐾:亮的表示這一場還能放幾次寵物爆發、灰的表示已用完(好感度滿 100 可多放 1 次)。這次把貓腳印放大、變更亮,更明顯!',
      '🏠【寵物小屋槽位看得更完整】把小屋裡一列老師專用的小開關收起來(移到老師的後台),讓三個寵物草蓆槽位有更充足、更完整的顯示空間。',
    ],
    items: [
      '★ v4.21.0【寵物小屋 GM 開關移至後台·index.html+admin_panel.js】移除 _openPetHouse 內的 GM 開關列(gmBar·騰出 #_ph-slots 垂直空間讓三槽位更完整);等效功能改在 GM 後台「🛠 系統管理」新增「🐾 寵物系統開關」卡(三點同步:SIDEBAR_ITEMS+SIDEBAR_GROUPS+section HTML+_initPetSysSection IIFE)——狀態讀 window._petSysPublicOpen()、對全體開放/暫時關閉走 window._fbSetPetSysSwitch(bool)、🔄 重新讀取呼 window._fbLoadPetSysSwitch(皆沿用 index.html 既有後端·gameConfig/petSystemSwitch·免改 firestore.rules);confirm 二次確認+關閉不刪資料說明。無 ?.。',
      '★ v4.21.0【GM 寵物互動不限次數·index.html】老師需求:讓 GM 測試時與寵物互動不受每日次數限制。單一咽喉點 _petHouseCanDo 對 _isAdminUser 一律回 true(撫摸/餵食/玩耍可重複)+ 逐槽鎖定 _petHouseAskLockSlot 對 GM 一律放行(不鎖槽·可自由換寵測試)。★ 每日增加好感度上限 +5 不變:好感仍走 _petHouseAddAff 的 affGain 每日 cap → GM 多互動只多得 EXP(方便測試升級),好感不會超額累加。學生行為完全零改動(僅 _isAdminUser 分支)。',
      '★ v4.21.0【戰鬥卡寵物浮圖+貓掌增強·index.html】老師回報戰鬥卡寵物浮圖/貓掌「沒看到」→ 確認 v4.18.0 已於 renderCard 建置(浮圖 gate=h.equip.n、貓掌 gate=_petFollowBurstName·皆需英雄有跟隨/裝備寵物);本輪提升可見度與穩健性:①浮圖來源由 h.equip.n 放寬為 h.equip.n || h._followPet(雙保險·_applyFollowPetToHero 兩者都會設)②浮圖高度 40%→50%、max-width 96→118、z-index 9→12、金色光暈加強(對應「帶有光暈」)③貓掌爆發次數符號 15→19px+亮腳印光暈加強。點浮圖開 _togglePetMiniCodex 迷你圖鑑、點貓掌 _showBurstStarTip 看剩餘次數 皆不變;敵我雙方卡片皆套·鬥技場本就禁用。',
      '★ v4.21.0【驗證/範圍】改 index.html + admin_panel.js(本輪有實質修改:🐾 寵物系統開關卡三點同步+init)+ game_changelog.js;hero_db.js(維持 v4.20.0)/world-boss 兩檔凍結不動。index.html 20 inline script node --check 全過、0 lone surrogate;admin_panel.js 0 真 ?.;零新 Firestore 集合/規則。版本同步 → v4.21.0(hero_db.js key 維持 v4.20.0);GAME_CHANGELOG trim 20 筆(移除最舊 v4.7.0)。',
    ],
  },
  // v4.20.0 — 🏠 寵物小屋 iPad 兩修:三槽位完整顯示不捲動 + 🃏 記憶翻牌點了立刻翻
  {
    ver: 'v4.20.0',
    date: '2026-07-05',
    brief: [
      '🏠【小屋三隻寵物一眼看齊全!】修正 iPad 上寵物小屋的排版問題:以前畫面比較矮時,寵物卡的上半部會被上方的列蓋住、往上滑之後圖片還會卡住回不來。現在三個草蓆槽位會自動縮放成剛剛好的大小,寵物的圖、等級、經驗、好感度和三顆互動按鈕全部完整顯示,不用捲動!電腦上空間夠的話畫面完全不變。',
      '🃏【翻牌遊戲手指一碰就翻!】修正 iPad 玩「記憶翻牌」時點了卡片要等一下才翻開的卡頓問題——現在手指一碰到卡片就立刻翻面,計時挑戰玩起來更順手!',
      '🖥️【電腦上小屋寵物變大隻!】電腦等大螢幕空間充裕時,寵物小屋的三個槽位會自動等比放大(最多約 1.7 倍),寵物的名字、等級、好感度文字都變大更好讀;iPad 空間不夠時照舊自動縮小塞好塞滿。',
      '🏷️【戰鬥抽到寵物,一眼看懂身分!】戰鬥中寵物出現的視窗(獲得寵物 / 答題獎勵選英雄 / 動物學家召喚),寵物名字旁現在會顯示完整徽章:稀有度(SSR/SR/R)+ 🎓已馴養、或 👀已相遇 + ✨未馴養、或 🌫未相遇 + ✨未馴養——是不是新面孔、要不要馴養,一眼就知道!',
      '🐾【寵物爆發換上主角特寫!】寵物施放專屬極限爆發時,畫面右側的大圖從英雄立繪改成「那隻寵物的放大特寫」(去背圖加金色光暈),招式大字與全螢幕特效照舊——這一招是誰放的,看得清清楚楚!',
      '🧸【簡單風圖鑑數字跟著等級跑!】切「簡單風」時,英雄圖鑑的技能與極限爆發精簡說明,現在也會跟精緻風一樣「隨你升級後的等級」顯示計算後的實際數值(並附 Lv.X 標籤),不再永遠停在 Lv1 的數字。',
      '🔎【編組篩選歸類微調】「動物學家」在主定位篩選裡從「主坦克」改到「其他」,更符合牠召喚寵物、保護隊友的定位(藝天使‧克雷爾上一版已從主坦克改到主回復);編組用「主定位」篩選時更好找。',
    ],
    items: [
      '★ v4.20.0【小屋槽位排版·index.html】#_ph-slots 由 overflow-y:auto 改 overflow:hidden 並補 min-height:0(根治 flex 子項不縮小把食物面板擠出畫面 + align-items:center 內容過高時上緣被裁在捲動原點之外「捲不回來」的 iPad 病灶);三張槽位卡改包進單一內層列 #_ph-slot-row,_petHouseRender 渲染尾端(食物面板高度定案後)呼叫新函式 _phFitSlots:以 row.offsetWidth/offsetHeight(版面尺寸·不受 transform 影響)對容器可視尺寸量測,超出即整列等比 transform:scale 縮小塞進可視高度(transform-origin:center·容器置中故視覺完整);空間足夠時比例=1 完全不變(桌機零影響)。另 +150ms 補量一拍吃掉字型/分頁籤晚到的版面變動,並一次性綁定 resize / orientationchange 重量測(小屋未開啟時自動 no-op)。附帶效益:不再需要捲動後,「想捲動卡片卻誤觸寵物圖而跳出綁定今日夥伴確認」的情形自然消失(逐槽鎖定機制本身零改動)。',
      '★ v4.20.0【記憶翻牌 iPad 即時響應·index.html】._ppg-card 加 touch-action:manipulation(移除 iOS 合成 click ~300ms 延遲=卡頓主因)+ -webkit-tap-highlight-color:transparent + user-select:none;._ppg-inner 加 will-change:transform(翻牌 3D 動畫走 GPU 合成更順);卡片加 touchstart(passive:true)立即呼叫 onCard 翻牌,後續補來的合成 click 打到「已翻卡」會被 onCard 開頭 _ppg-flip 判定早退=天然防重複觸發,桌機滑鼠仍走 click;「✕ 放棄」鈕同加 touch-action:manipulation。翻牌配對判定 / 60 秒計時 / 發獎(走既有 _petHouseInteract)/ 敗不消耗可再挑戰 / 躲貓貓 全部零改動。',
      '★ v4.20.0【PC 槽位放大·index.html】_phFitSlots 縮放比上限 1→1.7(r=min(1.7, availH/needH, availW/needW)·|r-1|>0.01 才套 transform):大螢幕空間充裕即等比放大三槽位整列(字更大更好讀·視覺仍完整落在可視區);iPad 空間不足時 r<1 縮小分支行為不變。',
      '★ v4.20.0【寵物出現視窗徽章·index.html】新增 window._petStatusBadgesHtml(pn,fs)=稀有度徽章(_petRarityBadgeHtml)+ 狀態徽章(🎓已馴養[_petIsTamed 權威] / 👀已相遇+✨未馴養[_isPetMet·v4.9.0 語義] / 🌫未相遇+✨未馴養),為「出現當下」快照(裝備攜帶後才算相遇);套用三視窗:showEquipUI 的 #equip-pet-name(第二設定點改 innerHTML=名+徽章)、_showBurstEquipSequence、_advShowPetTargetPicker(helper 缺席退回舊 _petTameBadgeHtml 組合·寵物名為內建常數無 XSS 風險)。',
      '★ v4.20.0【寵物爆發特寫·index.html】_execPetBurst 演出呼叫改 _showBurstCinematic(h,{n,_petName:pn});_showBurstCinematic 對 bd._petName 走寵物分支:右側面板改 img 元素三段 fallback(_petNobgUrl 去背圖 object-fit:contain+金色 drop-shadow → EQUIP_DB petImg 照片 cover+圓角 → 大 icon emoji·仿 v4.18 迷你圖鑑),左側/底部漸層遮罩、淡入 0.35s/2s 淡出、集中效果線、招式大字、BURST_GIF_DB 特效全不動;英雄爆發路徑(無 _petName)零改動(其餘 8 個呼叫點不受影響)。',
      '★ v4.20.0【簡單風動態數值·index.html】老師裁決推翻 v3.24.0「cute 顯示 sd 不套升級數值」:_renderHeroDetail 技能分岔 cute 改 _renderSkillFdWithLv(sk.n, sd, skLv)、爆發分岔 cute 改 _renderBurstFdWithLv(burst.n, sd, _bLv)——與 premium 同一顆數值替換引擎(通用類全 N% 替換對 sd 必中·special/custom regex 錨定 fd 措辭者對 sd miss 時該數字維持 Lv1 基準=保守可接受)+ 一律附 Lv.X 標籤;premium 路徑一字不改;天賦兩版本本就不套動態值(v3.5.62 摘要制)不動。鐵律 1.160 原意=不寫升級 scaling 說明,顯示當前等級計算值不違反。',
      '★ v4.20.0【主定位篩選調整·hero_db.js】HERO_PRIMARY_CLASS[\'動物學家\'] tank→other(篩選唯一權威·v3.15.88);藝天使．克雷爾 v4.19.0 已 tank→heal,本版不再變動。只動篩選分類,雷達用 HERO_CATEGORIES_OVERRIDE(動物學家 [\'ctrl\'])與 HERO_HEX_OVERRIDE 兩者分離皆不動。',
      '★ v4.20.0【版本與範圍】改 index.html + hero_db.js(篩選調整·本輪解凍 v4.19.0→v4.20.0);admin_panel.js/game_changelog.js 版號公告;world-boss 兩檔凍結不動。版本同步 → v4.20.0(含 hero_db.js key);GAME_CHANGELOG trim 20 筆(移除最舊 v4.6.0)。',
    ],
  },
  // v4.19.0 — 🔄 戰鬥中換夥伴對照視窗 + 逐寵物爆發計次(換寵保留·不跨戰鬥)+ 克雷爾主分類修正
  {
    ver: 'v4.19.0',
    date: '2026-07-05',
    brief: [
      '🔄【戰鬥中換夥伴,先看對照再決定!】戰鬥中抽到「已經馴養」的寵物、想裝到「已經有跟隨夥伴」的英雄身上時,會先跳出「換夥伴對照視窗」——一次看清楚英雄目前的攻擊/特技/速度/HP、新舊兩隻夥伴的功能效果與專屬爆發招、以及各自「還能放幾次爆發」,再決定要「換成新夥伴」還是「保留原夥伴」(保留的話新夥伴會收進背包)。',
      '🐾【寵物爆發改「逐寵物計次」】現在每一隻寵物在同一位英雄身上,都有屬於自己的爆發次數(好感度滿 100 一樣是 2 次);還沒放爆發就把牠換下去,次數會「留著」,之後換回來還能繼續用;只有「真的放出爆發」才會消耗那隻寵物的次數。此紀錄只在同一場戰鬥內計算,戰鬥結束就重新開始。',
      '🌈【克雷爾歸類修正】藝天使‧克雷爾在「主定位篩選」裡從「主坦克」改為「主回復」,更符合她實際的治療定位,編組用篩選時更好找。',
    ],
    items: [
      '★ v4.19.0【替換對照視窗·index.html】新增 _advShowPetSwapCompareModal(雙版·鐵律1.232·z-index 12800):顯示英雄當下攻/特/速/HP + 舊/新寵物功能效果(_EQUIP_SHORT / EQUIP_DB.d)與專屬爆發名稱說明(PET_BURST_DB cute/premium)及各自剩餘次數;替換 / 保留原夥伴 / 背景點擊=保留 / 出錯保底=保留,每條退出路徑都呼叫收尾避免卡死。',
      '★ v4.19.0【逐寵物計次·index.html】新增 h._petBurstUsedByPet(戰前歸零·不跨戰鬥):_applyFollowPetToHero 初始化、_execPetBurst 寫回當前寵物已用次數;_petBurstUsed / _petBurstBonus 改為「當前跟隨寵物視圖」,與貓掌槽 / 雙選視窗 / renderCard 顯示同步。',
      '★ v4.19.0【換裝流程·index.html】_advApplyPetToHero:換裝前卸除舊寵 onRemove、設 equip+onEquip、_followPet=新寵、次數視圖還原(換回舊寵取回保留次數)、_petBurstBonus 依新寵好感重算;_advFinishPetPick 於「已有跟隨寵物且新寵已馴養」彈對照視窗,收尾抽成 _advFinishPetPickTail 由抉擇 handler 呼叫(維持 v3.14.25/v3.16.39 三路推進),保留原夥伴則新寵進背包(滿則放棄)。',
      '★ v4.19.0【克雷爾主分類·hero_db.js】HERO_PRIMARY_CLASS 內「藝天使．克雷爾」由 tank 改 heal(篩選 _heroSkillTypes 讀取來源);hero_db.js 版本自 v4.5.0 起隨主程式對齊為 v4.19.0。',
      '★ v4.19.0【範圍/安全】戰鬥中換寵不重新套用寵物「成長素質加成」(避免場中補血 / HP 重算風險),對照視窗僅呈現當下素質+功能效果+爆發供決策;競技場仍照舊封鎖寵物爆發;全程 try-catch,不動既有傷害計算 / 存檔 / 守門。',
    ],
  },
];
