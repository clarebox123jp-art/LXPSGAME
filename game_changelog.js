// ════════════════════════════════════════════════════════════════════════
//  game_changelog.js  —  LXPSGAME 更新日誌
//  最後更新:2026-06-27  / 目前主程式版本:v3.16.50(禁療/減療對所有恢復HP行動全面生效 + 酒吞童子BOSS回血削弱:爆發回血40%→20%·吸血減半)
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
  // v3.16.41 — 新英雄上線:御雲使‧沐雲雪(5年3班 黃稚善設計)
  {
    ver: 'v3.16.41',
    date: '2026-06-27',
    brief: [
      '☁️【新英雄上線·御雲使‧沐雲雪】新增學生設計英雄「御雲使‧沐雲雪」(5 年 3 班 黃稚善同學設計)!從天空誕生、總是睡眼惺忪的御雲精靈,SSR,定位 💚回復 + 🛡️控場——本身很脆,但能為全隊撐起雲霧屏障,還能把夥伴的力量再發揮一次。',
      '☁️【天賦·雲霧飄渺】只要沐雲雪在場上,全隊被雲霧繚繞、迴避率 +15%(隨天賦升級最高 +60%);她一旦倒下,雲霧就會消散。',
      '💤【S1·浮雲入夢】指定 1 名「已倒下」的隊友,立刻讓他施展一次屬於自己的極限爆發(沿用該隊友的爆發效果與等級,但不會復活他);每名隊友整場限喚醒 1 次,技能升到滿級可喚醒 2 次。',
      '☁️【S2·軟軟的雲(被動)】身體像雲一樣柔軟,受到傷害時(極限爆發傷害除外)有 35% 機率把這次傷害的 200% 彈回給攻擊者,每回合最多 2 次(機率隨技能升級最高 80%)。',
      '🌈【極限爆發·霞蔚雲蒸】全隊(含已倒下的隊友)恢復最大 HP 的 50% 並可復活(隨爆發升級最高 90%);接著由你「指定 1 名友方」立刻施展一次他自己的極限爆發!',
      'ℹ️【取得方式】和其他 SSR 英雄一樣,可透過召喚、打 BOSS、知識王成績等機會獲得。',
    ],
    items: [
      '★ v3.16.41【新增學生設計英雄·御雲使‧沐雲雪(5年3班 黃稚善)】SSR·💚回復+🛡️控場。配點 hp55×1.3=72/atk3/sp20/spd22(總和 100·鐵律1.30)。資料層 hero_db.js 14 表 + 邏輯層 index.html 全套(設計單 31 個 AI 決定欄位依老師「全照做」實作)。',
      '★ v3.16.41【天賦 雲霧飄渺】沐雲雪存活時友方全體迴避 +15%(+5%/天賦級·Lv10=60%),doDmg 迴避計算 hook 仿風術士天賦光環(必中/爆發/反彈不受影響·倒下即失效·鐵律1.160 圖鑑只寫 Lv1 base)。',
      "★ v3.16.41【S1 浮雲入夢(c8)】execSkill+aiUseSkill 雙路徑(鐵律1.128):setPending('ally_dead') 指定倒下隊友 → 走引擎 _runBurst 施展其自身爆發(仿菇女「極限菇」·不上暈眩·不復活)。每名隊友 _muyunDreamUsed 限喚醒 1 次·s1 Lv10=2 次;無合法目標退還能量;被喚發友方爆發以 _interrupted 收尾。",
      '★ v3.16.41【S2 軟軟的雲(c0 被動)】doDmg 扣 HP 後 hook(才符「受到傷害時」·避免被自身迴避光環誤觸):受傷(排除爆發傷害 _burstCastActive/治療/反彈/DoT)35%+技能級×5%(Lv10=80%)反彈該次傷害 ×200% 給攻擊者·每回合 ≤2 次(_softCloudRoundUsed·startTurn 重置)。反彈走 doDmg(isRebound·無 bypassShield)→ 龍王護盾+5000cap 仍生效(鐵律1.31)。',
      "★ v3.16.41【爆發 霞蔚雲蒸】_runBurst 分支:全體隊友(含倒下者)回復最大 HP 50%+10%/burstLv(Lv4 MAX=90%·doRevive/doHeal)→ setPending('ally') 指定 1 友方立即施展其自身爆發(乙:玩家手動點選 + 5 秒 watchdog 自動挑攻/特最高防卡)。本體 execBurst 已 acted,故分支 return,收尾交被喚發友方 _runBurst。",
      '★ v3.16.41【UI/註冊/版本】SKILL_UPGRADE_DEF(浮雲入夢 special_yunmeng 可升級 + 軟軟的雲 pct_buff)+ codex case special_yunmeng + BURST_UPGRADE_DEF(霞蔚雲蒸 5 列治療 50→90%)+ SUMMON_RARE_HEROES + STUDENT_DESIGNER_HEROES(lsps110188·自動套 _STUDENT_DESIGNED_HERO_SET→圖鑑🎨)。BURST_GIF 霞蔚雲蒸=大強化.gif + 神聖治療音效(sfx-goddess/sfx-heal·dur910)。五點版本同步 + hero_db.js → v3.16.41。本輪改 index.html + hero_db.js + game_changelog.js。⚠ 圖檔 御雲使_沐雲雪.webp(★ 新圖一律 webp 格式·新版平板下載更快)需老師另外上傳 repo;hero_input.html 離線編輯器另上傳。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.16.21)。',
    ],
  },
  // v3.16.40 — 修正 iPad 切到背景/滑掉後遊戲背景音樂沒停止
  {
    ver: 'v3.16.40',
    date: '2026-06-27',
    brief: [
      '🔇【修正背景音樂關不掉】修正在 iPad 上把遊戲切到背景、滑掉、或鎖屏後,遊戲的背景音樂仍持續播放、關不掉的問題。現在切到背景會自動暫停音樂,回到遊戲再自動恢復。',
    ],
    items: [
      '★ v3.16.40【修正背景 BGM 不停·index.html】根因:切到背景時用來暫停音樂的判斷,排除條件用「目前是否在全螢幕」——但遊戲啟動會自動進全螢幕,導致「人在全螢幕時真正切到背景/鎖屏」也被誤判成全螢幕切換而跳過暫停 → 音樂在背景一直播、關不掉。',
      '★ v3.16.40【修法】改用「是否正處於全螢幕『切換瞬間』」的短暫旗標(由全螢幕請求與 fullscreenchange 設定·1.2 秒內有效)當排除條件:只略過全螢幕轉場那一下的假切換,真正切到背景(即使正全螢幕)一律暫停所有音訊;_requestFullscreenAll 在請求全螢幕前先設旗標(避免事件順序造成靜音);另加 pagehide(關閉/離開頁面)強制停止所有音訊作雙保險。',
      '★ v3.16.40【範圍/版本】只改 index.html(visibilitychange 處理 + _requestFullscreenAll 兩處);admin_panel.js + game_changelog.js 僅版本 bump 對齊。五點版本同步 → v3.16.40(hero_db.js 維持 v3.16.22)。本套含 v3.16.36~39,同一批上傳。',
    ],
  },
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
];
