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
  // ════════════════════════════════════════════════════════════════════
  // v3.15.61(2026-06-20)— 🏅 19 枚高階挑戰獎章 + 🧠 機關王題庫換新 + 🐉 龍王頁更新
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.61',
    date: '2026-06-20',
    brief: [
      '🏅【GM 加碼:19 枚高階挑戰獎章登場!】',
      '   ・老師特別追加了一整批<b>高難度成就獎章</b>,每解鎖 1 枚就送 <b>🔮 召喚水晶 ×5 + 💰 知識幣 +10,000</b>,超大獎勵等你來拿!',
      '   ・挑戰橫跨<b>英雄收集、台灣關、埃及關、黑暗球、鬥技場</b>各種高手關卡(例如:只用 SR 英雄通關、全程不帶寵物、一場把對手三隻一次清空…)。',
      '   ・主選單「<b>獎章</b>」鍵上會浮出「<b>新增獎章挑戰!</b>」標記;點進獎章頁會先跳出說明視窗,<b>已達成的會打勾 ✅</b>。看過可按「我知道了」或「今日不再顯示此視窗」,<b>全部達成後就不再出現</b>。',
      '   ・順手修好獎章頁<b>沒有顯示「埃及關 / 鬥技場」分類</b>的問題,現在這兩區的獎章都看得到了。',
      '🧠【世界機關王大賽:題庫煥然一新】',
      '   ・機關王關卡的題目全部換成<b>「簡單機械與 STEAM」</b>主題:斜面、槓桿、滑輪、齒輪、位能與動能、系統思考…邊打邊學超有料!',
      '🪲【聖甲蟲會逃跑了!】',
      '   ・埃及關的稀有「<b>聖甲蟲</b>」膽小又惜命——只要<b>撐到第 4 回合還沒被打倒,牠就會推著黃金糞球溜走</b>!想拿牠的大量獎勵就要速戰速決;不過讓牠成功逃走,也能解鎖「<b>聖蟲遁逃</b>」獎章喔。',
      '🐉【世界 BOSS 頁面更新:當前 & 下一隻龍王資訊修正】',
      '   ・世界 BOSS 大廳的「<b>當前龍王</b>」素質,以及「<b>下一隻龍王搶先看</b>」的名稱、立繪、屬性、能力介紹,全部改成<b>自動跟著實際龍王更新</b>,不會再顯示舊資料;點「能力詳細介紹」可看完整招式與天賦。',
    ],
    items: [
      '★ v3.15.61【世界機關王大賽題庫】adv_quiz_db.js ADV_QUIZ_GREENMECH(id 9601-9620,subject 世界機關王大賽)整批換成 STEAM 簡單機械題(斜面/槓桿/滑輪/齒輪/位能動能/系統思考);node --check PASS、20 題、無英文單引號。',
      '★ v3.15.61【19 枚高階獎章】index.html MEDAL_DEFS 新增 19 枚並全列入 _MEDAL_TOP_TIER(5💎+10000):英雄 ssr_unlock_20/40、first_ur_hero、shard_synth_first;台灣 tw_sr_only;埃及 egypt_sr_only/no_pet/4pets/kill_cleo_sealed/kill_self_charmed/both_talent_sealed/scorpion_ko/scarab_flee;黑暗球 darkorb_no_pet/r_only/all_clones;鬥技場 arena_kill_3/no_heal_win/2kill_3round。另 4 枚既有(unlock_xiaoli/kid/gm、arena_streak_5)升頂級。偵測 hook 分散於 _checkMedalHeroUnlock／_synthShardToPickTicket／doDmg 死亡集中 hook／Scorpion 即死／Scarab 逃跑／_checkEgyptClearMedal／_checkTaiwanWinMedals／黑暗球勝利分支／doHeal／_checkMedalArena;每枚 def=1 call=1 已稽核。',
      '★ v3.15.61【獎章頁顯示修正】_buildMedalPage cats 陣列補回漏列的「埃及關」「鬥技場」(原本該兩分類獎章完全不顯示)+ 對應類別圖示(🏟／🏜)。',
      '★ v3.15.61【聖甲蟲第 4 回合必逃】startTurn 仿寶箱怪框架:next.name===聖甲蟲 且 G.round>=4 → 從戰場 splice、curHp=0、不計擊倒/不給獎勵、_scarabFled 旗標、checkWin;逃走即解鎖 egypt_scarab_flee。聖甲蟲魔物圖鑑 lore 補逃跑警告。',
      '★ v3.15.61【GM 第一波獎章挑戰提醒 UI】index.html 新增 _GM_MEDAL_WAVE1(19 id)+ _gmMedalW1Stats／_updateGmMedalW1Badge(#adv-medal-btn 浮「新增獎章挑戰!」粉紅脈動徽章,全達成自動移除)／_gmMedalW1ShouldShowPopup／_showGmMedalW1Popup(進獎章頁彈視窗:列 19 枚打勾+進度+5💎+10000 強調;「我知道了」設 session 旗標、「今日不再顯示」寫 localStorage _gmMedalW1DismissDate=今日;全達成不再彈)。hook:openMedalPage 彈窗+刷新徽章、_unlockMedal earn 後刷新徽章、openAdventureOverlay 進關卡刷新徽章;CSS keyframe _gmMedalW1Pulse。',
      '★ v3.15.61【世界 BOSS 頁龍王資訊資料驅動】world-boss-ui.html:(a)當前龍王大廳卡素質(攻擊/特技/速度)由寫死火龍王 49/50/15 改 _wbApplyCurrentBossSkin 讀 HERO_DB[當前龍王](HP 統一 5,000,000 不動);(b)「下一隻龍王搶先看」整卡改資料驅動 _wbApplyNextBossPreview(依 _wbGetNextBossId 取輪替下一隻 → 名稱/立繪/屬性/素質/簡介=背景故事+自動護盾文案/主題色 + 能力詳細介紹鈕呼叫 _wbAdvOpenBossInfoPopup(nextId)),修正寫死土龍王過時文案(額外減傷 40%→實際 30% 等),輪替推進自動跟上。index.html 雲端當前龍王解析兩處 re-apply 加呼叫 _wbApplyNextBossPreview。',
      '★ v3.15.61【版本鏈】4 GAME 同步點 v3.15.60→v3.15.61;_vers[index.html]／[game_changelog.js] 同步 v3.15.61、[world-boss-ui.html] v3.15.50→v3.15.61、[adv_quiz_db.js] 20260612b→20260620。world-boss.js 維持 v3.15.51、hero_db.js v3.15.60、arena.js v3.15.60、admin_panel.js v3.15.58(均未改)。本輪改 index.html＋adv_quiz_db.js＋world-boss-ui.html＋game_changelog.js 四檔。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.41)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.60(2026-06-20)— ⚔ 主神奧汀大改 + 🐉 各龍王成就 + 🌑 黑暗球掉落
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.60',
    date: '2026-06-20',
    brief: [
      '⚔【主神奧汀 能力調整】',
      '   ・「<b>岡格尼爾的制裁</b>」改為消耗 7 能量,造成「攻擊 300% + 目標最大 HP 10%」傷害(對<b>魔王 / 龍王</b>改為 5%,避免一招打太兇)。',
      '   ・大絕「<b>諸神的黃昏</b>」主動版改版:先讓全隊降到剩 1 滴血,再以<b>全隊失去的 HP 總合 ×400%</b> 痛擊敵人——犧牲越多、爆發越強!(被動全滅復活版調整為最大 HP 總和 ×600%)',
      '   ・天賦「<b>奧汀之眼</b>」追加效果:奧汀<b>受到的所有傷害減少 30%</b>(天賦升級最高 50%),更能扛住前線。',
      '🐉【新獎章:迎戰各路龍王】',
      '   ・世界 BOSS 新增「<b>迎戰八大龍王</b>」系列獎章:挑戰火山炎、翠綠森、山岳地、風暴雷、深淵海、邪骨暗、神聖光、星辰幻龍王各一場(不論勝負)即可獲得;<b>集滿 8 隻</b>再拿下「八龍試煉」!',
      '🏟【新獎章:鬥技場 & 埃及關】',
      '   ・<b>鬥技場</b>新增成就:初登鬥技場、累積 10 / 30 / 50 勝、五連勝。',
      '   ・<b>埃及關</b>追加成就:累積通關 5 / 15 次、聖蟲獵手(累積擊敗聖甲蟲 3 次)。',
      '🌑【黑暗球掉落加碼】',
      '   ・挑戰「<b>黑暗球‧希望型態</b>」每場必得 <b>SSR 靈魂碎片 ×1~2</b>,還有機會掉落全新賣錢素材「<b>黑暗之晶核</b>」(可賣 5000 知識幣);超越極限果實掉落率也提高了!',
      '   ・魔物圖鑑的黑暗球頁面<b>補上完整掉落清單</b>,一眼看清能拿到什麼好東西。',
    ],
    items: [
      '★ v3.15.60【主神奧汀 S1 岡格尼爾的制裁】c:5→7;「攻擊300%(每升+5%)+ 目標最大HP%」之 HP% 由 20% 改 10%、對 BOSS(_zeusIsTrueBoss 權威清單)改 5%。execSkill(_s1HpPct)+ aiUseSkill(_s1HpPctO)雙路徑同步(鐵律1.128);走 doDmg → 世界 BOSS 5000cap 自動套用(鐵律1.31)。SKILL_UPGRADE_DEF label/註解同步 10%/BOSS5%。',
      '★ v3.15.60【主神奧汀 爆發 諸神的黃昏(老師裁示甲)】主動版重構:先將全隊存活友方降至 HP1,再以「全隊 4 槽失去 HP 總合(含倒下、含奧汀)×400%(每升+10%乘算 _burstMult)」對敵平分(必中無視有利);_sumLostHp = Σ max(0,maxHP-curHP)。被動全滅復活版倍率 ×10→×6(固定不隨等級)。BURST_UPGRADE_DEF rows 改主動 400/440/480/520/560% + 被動固定 600%。',
      '★ v3.15.60【主神奧汀 天賦 奧汀之眼 追加減傷】doDmg 新增減傷 hook:受到所有傷害減免 30%(每升 1 級 +5%,Lv5=50%,min(0.50,0.30+traitLv*0.05)),與 S2「英靈殿守望者」減傷分開乘算疊加(置於 reductions 區段,比照鋁合金暴龍/S2,% 減傷僅主流程)。hero_db.js desc/fd 只寫基礎 30%(鐵律1.160),逐級進 _TRAIT_LV_INFO。',
      '★ v3.15.60【獎章成就 +17 枚,全於 index.html MEDAL_DEFS(顯示用 MEDAL_DEFS,新 id 不與 world-boss.js WB_MEDALS 衝突,免動 world-boss.js)】鬥技場 5(arena_first_win/win_10/30/50/streak_5)+ 埃及 3(egypt_clears_5/15、egypt_scarab_3)+ 世界BOSS各龍王 9(wb_dragon_fire/forest/earth/thunder/sea/dark/light/illusion + wb_dragon_all 八龍試煉)。',
      '★ v3.15.60【獎章頒發 hook】鬥技場:arena.js 結算(result win/draw/loss)後呼叫主程式 window._checkMedalArena(累積勝場 winsLifetime 里程碑 + _medalStats.arenaWinStreak 連勝,平/敗歸零)。各龍王:WB 戰結算勝/敗兩路徑皆呼叫 window._checkMedalWbDragon(window._wbGetCurrentBoss().name)(參戰即計、不限排名;名→medalId 對照,集滿 8 隻補 wb_dragon_all)。埃及:_checkEgyptClearMedal 加 egyptClears 計數、聖甲蟲擊殺加 egyptScarabKills 計數。_medalStats 經 _saveMedals 存 adv_medal_stats 持久化。',
      '★ v3.15.60【黑暗球‧希望型態 掉落】_ssrShardDropCount 拆 darkorb(隨機 1~2)與 egypt(固定 2)兩 profile;黑暗球新增 25% 黑暗之晶核(id dark_crystal_core,🟣,sell_only sellPrice 5000,補 BACKPACK_ITEM_DEF + SHOP_SELL_ITEMS)、超越極限果實 8%→10%。MONSTER_DROPS 補「黑暗球‧希望型態」完整掉落列(原圖鑑只顯示基礎 EXP)。埃及雙王 SSR 碎片改固定 2。',
      '★ v3.15.60【碎片/自選券一致性稽核】全站確認 SSR 靈魂碎片合成需求 20 / SR 10(_SHARD_DEF 權威)與自選召喚卷說明一致(教學頁/道具/贈友/toast/圖鑑);修正教學頁「SSR 取得方法」鬥技商店價 40→30(對齊 ARENA_EXCHANGE_ITEMS arena_x_ssr_summon cost:30,v3.15.54 調價後漏改)。',
      '★ v3.15.60【版本鏈】4 GAME 同步點 v3.15.59→v3.15.60;_vers[index.html]/[game_changelog.js]/[hero_db.js] 同步 v3.15.60、[arena.js] v3.15.54→v3.15.60(含 ARENA_CONFIG.VERSION→v3.15.60)。world-boss.js 維持 v3.15.51(未改)、admin_panel.js v3.15.58、world-boss-ui.html v3.15.50。本輪改 index.html + hero_db.js + arena.js + game_changelog.js 四檔。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.40)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.59(2026-06-20)— 🌋 新英雄登場:熔岩巨人(5 年 1 班姜同學設計)
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.59',
    date: '2026-06-20',
    brief: [
      '🌋【新英雄登場:熔岩巨人】',
      '   ・由 <b>5 年 1 班 姜同學</b>設計的全新英雄「<b>熔岩巨人</b>」加入稀有召喚池!他是沉睡火山的化身,雖然不太會說話,卻愛好和平、樂於助人,能操控整座火山的力量焚燒敵人。',
      '   ・<b>火山般的熾熱軀體</b>讓他幾乎不怕火,還會反過來灼傷膽敢徒手攻擊他的對手;「<b>熔岩巨砲</b>」必中轟擊、「<b>烈焰力場</b>」化作火焰護盾反傷,大絕「<b>火山之怒</b>」更是岩漿傾瀉、焚盡全場!',
      '   ・快到<b>召喚星空</b>碰碰運氣,把這位溫柔又強大的火山巨人收入隊伍吧!',
    ],
    items: [
      '★ v3.15.59【新英雄 熔岩巨人 — 學生設計(5 年 1 班 姜亦晟)hero_db.js 12 表 + index.html 邏輯層】定位:火/地雙屬性 SSR,⚔傷害+🛡控場。配點 HP68/攻5/特技24/速3(和=100;HERO_DB hp 欄位=配點×1.3=88)。',
      '★ v3.15.59【天賦 高溫軀體】受到火屬性傷害減免 50%(每升 1 級 +10%,Lv5=90%);被對手「普通攻擊」時使攻擊者陷入燃燒 2 回合(固定,不隨等級)。火減傷 hook 置於 doDmg rawDmg 階段(只用 rawDmg/target/opts,鐵律1.110);反擊燃燒置於 execAtk 普攻 post-process(判定 target===熔岩巨人 → 對攻擊者 actor 加 hellfire)。',
      '★ v3.15.59【S1 熔岩巨砲 c7】特技 300%(每升 1 級 +5%)對隨機對手造成火/地隨機屬性傷害、連攻 2 次、必中(ignoreEvasion/noGuard/noHidden)。SKILL_RANDOM_ELEMENTS 登錄火/地隨機。execSkill + aiUseSkill 雙實作(鐵律1.128)。',
      '★ v3.15.59【S2 烈焰力場 c5】獲得護盾=自身最大 HP×50%(每升 1 級 +5%)+ 我方場上火屬性(element 為 fire)角色數×5;護盾被消耗時將吸收量化為火屬性反彈攻擊者(反彈 hook 置於 doDmg 護盾吸傷處,旗標 _lavaFieldReflect,防遞迴 _isLavaReflect+noReflect)。',
      '★ v3.15.59【爆發 火山之怒】特技 250%(每升 1 級 +10% 乘算 _burstMult)× 3 次隨機火屬性,必中且無視有利狀態(mustHit/ignoreEvasion/ignoreBuffs);命中者陷入強力燃燒(行動前後各-10HP)+強力禁療,各 2 回合(Lv5/MAX +1=3 回合)。仿神槍手火焰神槍結構,burstName dispatch 自呼 _burstFinish。動畫=神木復仇之火.gif(與山靈古魔共用),音效=地震 sfx-earthquake + 爆炸 sfx-explode。',
      '★ v3.15.59【資料層】SUMMON_RARE_HEROES 加入(觸發 v3.15.43 auto-sync IIFE 推入 ADMIN_ALL_HEROES + _PLAYER_HERO_NAMES);STUDENT_DESIGNER_HEROES 加入 lsps110167(姜同學,自動納入 _STUDENT_DESIGNED_HERO_SET → 圖鑑標「🎨 學生設計英雄」+ 設計師補發工具可發);另登錄 SKILL_FORCE_ELEMENT(火山之怒=fire)。',
      '★ v3.15.59【鐵律遵循】1.31(三技/爆發皆非秒殺,走 doDmg → 世界 BOSS 5000cap 自動保護)、1.110(火減傷 hook 時序)、1.128(execSkill+aiUseSkill 雙實作)、1.139(_runBurst 乘 _burstMult)、1.160(fd 只寫 Lv1 基底,升級數字進 _TRAIT_LV_INFO/SKILL_UPGRADE_DEF/BURST_UPGRADE_DEF)、1.98(新英雄 checklist)。',
      '★ v3.15.59【版本鏈】4 GAME 同步點 v3.15.58→v3.15.59;_vers[index.html]/[game_changelog.js] 同步 v3.15.59 + _vers[hero_db.js] v3.15.44→v3.15.59。admin_panel.js 維持 v3.15.58、arena.js v3.15.54、world-boss.js v3.15.51、world-boss-ui.html v3.15.50。本輪改 hero_db.js + index.html + game_changelog.js 三檔。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.39)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.58(2026-06-20)— 💰 GM 洗錢查緝工具 + 單件賣出帳本補全
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.58',
    date: '2026-06-20',
    brief: [
      '🔧【後台管理工具更新(一般同學無須理會)】',
      '   ・老師後台新增帳號安全稽核工具,並完善了商店賣出的紀錄。對正常遊玩沒有任何影響。',
    ],
    items: [
      '★ v3.15.58【GM 洗錢查緝 admin_panel.js + index.html】承接 v3.15.57(修掉「賣出物品重整後復活、可重複賣」洗錢漏洞)→ 新增事後查緝工具。後端 index.html:window._fbAdminScanMoneyLaundering(windowSec,minRepeat) 用 getDocs 掃全 players,讀 _coinTransactions 篩「賣出類」(reason 含「賣出」且 amount>0),依金額分桶、桶內按時間排序,相鄰間隔 ≤windowSec 的連續同額簇若 ≥minRepeat 即判一組洗錢,贓款=(簇次數-1)×金額(保留 1 次合法),回傳嫌疑玩家(估算贓款/當前餘額/逐組明細,按贓款降序)。預設 windowSec=60、minRepeat=3。',
      '★ v3.15.58【回收 index.html】window._fbAdminRecoverLaunderedCoins(uid,amount,note):複用 _fbCompensatePlayer 的 coinsMode add 負值扣減(_newCoins=Math.max(0,current-amount)),主檔 + live + safe 三槽同寫(防跨槽合併把高餘額復活),不誤發補償彈窗給玩家。',
      '★ v3.15.58【GM UI admin_panel.js】新增「💰 洗錢查緝」卡(🧹 帳號汙染處理群組):設視窗秒數 / 同額門檻次數 → 🔍 開始查緝 → 列嫌疑玩家(餘額 / 估算贓款 / 逐組明細),每人可填金額(預設=估算贓款)一鍵「💸 回收」。三點同步(SIDEBAR_ITEMS+SIDEBAR_GROUPS+卡片 HTML+_initLaunderingSection);全程無 optional chaining。',
      '★ v3.15.58【賣出帳本補全 index.html】shopSellItem(單件賣出)原本未記知識幣帳本(只有一鍵賣出 shopSellAllItems 有 _logCoinTx)→ 補上 _logCoinTx(coins,"收入:賣出-道具名"),否則查緝抓不到「單件反覆賣出」的痕跡。',
      '★ v3.15.58【限制】帳本跨槽 union 僅保留最近 400 筆,極早期洗錢可能已滾出;偵測為估算、供 GM 人工裁量回收。漏洞本身已於 v3.15.57 修復,不會再產生新贓款。Firestore 規則無需新增(掃描/回收均走 isAdmin 既有路徑)。',
      '★ v3.15.58【版本鏈】4 GAME 同步點 v3.15.57→v3.15.58;_vers[index.html]/[game_changelog.js] 同步 v3.15.58 + _vers[admin_panel.js] v3.15.54→v3.15.58 + ADMIN_PANEL_VERSION v3.15.49→v3.15.58。arena.js 維持 v3.15.54、world-boss.js v3.15.51、world-boss-ui.html v3.15.50、hero_db.js v3.15.44。本輪改 index.html + admin_panel.js + game_changelog.js 三檔。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.38)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.57(2026-06-20)— 🛒 商店賣出嚴重漏洞修復(賣出物品重整後重複出現)
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.57',
    date: '2026-06-20',
    brief: [
      '🛒【商店賣出穩定性修正(重要更新)】',
      '   ・修正了少數情況下,在商店賣出物品後重新整理,背包顯示與雲端存檔<b>不同步</b>的問題。',
      '   ・現在賣出的物品會<b>正確且穩定地保存</b>,不會再因重新整理而異常重現。感謝同學的回報!',
    ],
    items: [
      '★ v3.15.57【賣出漏洞根治 index.html _lxpsMergeSlots】現象:玩家 87 萬 → 賣垃圾得 7 萬 = 94 萬(垃圾消失),重新整理後知識幣仍 94 萬(正確),但剛賣掉的垃圾又出現可再賣 → 可無限變現。根因:backpackRemove 對數量歸 0 的道具 delete key;賣出走 _fbSaveLive/_fbSave 的 set(...,{merge:true}),Firestore 對 map(物件)欄位是「深度合併」→ 新資料未提及的子鍵(賣掉的道具)不會被刪除 → 雲端 map 欄位 playerBackpack 殘留舊道具(復活),而純量字串 playerBackpack_s 被整包覆蓋(正確)→ 知識幣(純量)正確、背包(map)子鍵復活,正是「94 萬保留、垃圾復活」的不對稱現象。',
      '★ v3.15.57【漏網與修法】_applySafeData 早有同款「優先字串繞道」(註解明寫 Firebase merge 不會刪 key 的繞道),但「多槽合併」_lxpsMergeSlots 漏修 → 有 live+safe+主檔三槽的玩家走合併路徑而中招。修:_lxpsMergeSlots 的 _bag 改為優先解析 _newest.playerBackpack_s(賣後正確、免疫 merge 污染),map 欄位僅在無字串時 fallback。單槽載入走 _applySafeData(本就優先字串)未受影響。',
      '★ v3.15.57【影響面】新賣出 → 字串無垃圾 → 存檔(賣出函式賣完即 await gameCloudSave)→ 重整載入字串 → 不復活,漏洞徹底堵死。已中招玩家現有殘留垃圾賣掉一次變現後字串收斂、不再復活。雲端 map 欄位的歷史殘留無人讀取(載入一律用字串)、無害,列為次要後續(GM 後台讀 map 的背包種類摘要鍵數可能偏多,不影響玩家)。',
      '★ v3.15.57【鐵律 1.213】消費型(會減量)map 欄位嚴禁僅靠 set(merge:true) 寫入後直接讀 map:Firestore map 深度合併不刪子鍵 → 減量(賣出/消耗)會殘留復活。一律「寫純量字串整包版 + 讀取優先字串版」(playerBackpack/playerBackpack_s 模式);純量欄位(knowledgeCoins 等)不受影響。新增同類消費型 map 欄位時務必同步字串版,並在所有讀取點(含 _lxpsMergeSlots、_applySafeData)優先字串。',
      '★ v3.15.57【版本鏈】4 GAME 同步點 v3.15.56→v3.15.57;_vers[index.html]/[game_changelog.js] 同步 v3.15.57。arena.js / admin_panel.js 維持 v3.15.54、world-boss.js v3.15.51、world-boss-ui.html v3.15.50、hero_db.js v3.15.44。本輪只改 index.html + game_changelog.js。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.37)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.56(2026-06-19)— 🎟 鬥技商店召喚卷改發「卷道具」(到召喚星空使用)
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.56',
    date: '2026-06-19',
    brief: [
      '🎟【鬥技商店「召喚卷」改成真正的卷了！】',
      '   ・以前在鬥技場用鬥技之證換 SSR / SR / 至寶召喚卷,是「當場直接給你角色或至寶」;現在改成<b>發一張「召喚卷」到你的背包</b>,由你自己到<b>召喚星空</b>使用。',
      '   ・這樣你可以<b>自己決定什麼時候用</b>;而且若該稀有度暫時收齊了,召喚卷也能<b>先留著以後再用</b>,不會浪費。',
      '💠【鬥技場至寶券升級為「自選券」!】',
      '   ・鬥技商店的至寶召喚卷改成<b>自選至寶召喚卷</b>,使用時可從<b>台灣 10 件 + 龍王 8 件</b>尚未擁有的至寶中<b>自己挑一件</b>,<b>挑得到龍王至寶</b>!',
      '   ・(提醒:隨機至寶召喚卷與星空召喚仍只有台灣至寶,龍王至寶要靠龍王戰排名、老師自選卷,或鬥技場的自選至寶召喚卷取得。)',
    ],
    items: [
      '★ v3.15.56【鬥技商店召喚卷改發卷道具 index.html _arenaGrantExchangeItem】arena_x_ssr_summon / arena_x_sr_summon / arena_x_treasure_summon 三件,由「當場 advSaveUnlockedHero 自動解鎖角色 / _arenaGrantTreasureVoucher 當場發至寶」改為 backpackAdd 對應卷道具(summon_ticket_ssr / summon_ticket_sr / summon_ticket_treasure_pick),玩家到召喚星空自行使用(老師裁示:召喚卷一律是卷、不直接解鎖)。_arenaGrantSummonVoucher / _arenaGrantTreasureVoucher 改為未使用(保留不刪)。',
      '★ v3.15.56【至寶券改自選券 + 自選池納龍王 index.html】鬥技商店至寶券改發 summon_ticket_treasure_pick(自選);新增 _treasureTicketPickNotOwned(台灣 10 + 龍王 8 = 18,引用 _ARENA_DRAGON_TREASURE_IDS),_openTreasureTicketPickModal 改用此池→可挑龍王。隨機券 _useTreasureTicket 仍用 _treasureTicketNotOwned(台灣 10、不含龍王);星空召喚 random 不變(龍王 noSummon,v3.15.52 結論不動)。鬥技券卡改名「自選至寶召喚卷」+icon💠,_openTreasureTicketModal 兩卡「尚有 N 件」計數分流(隨機=台灣/自選=含龍王),summon_ticket_treasure_pick 背包說明補龍王。',
      '★ v3.15.56【背景】玩家回報「用鬥技之證買 SSR 召喚卷卻沒拿到卷」:原實作是當場直接解鎖一名隨機未收錄 SSR(該玩家確實有解鎖到角色,並非遺失),但與「召喚卷 = 可收進背包、自行使用的道具」設計不符 → 本版全面改為發卷道具。',
      '★ v3.15.56【版本鏈】4 GAME 同步點 v3.15.55→v3.15.56;_vers[index.html]/[game_changelog.js] 同步 v3.15.56。arena.js / admin_panel.js 維持 v3.15.54、world-boss.js v3.15.51、world-boss-ui.html v3.15.50、hero_db.js v3.15.44。本輪只改 index.html + game_changelog.js。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.36)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.55(2026-06-19)— 🏜 埃及關完整掉落物 + 魔物圖鑑「埃及探險」區
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.55',
    date: '2026-06-19',
    brief: [
      '🏜【埃及關沙漠小怪掉落物上線!】',
      '   ・6 隻沙漠小怪(木乃伊貓、流沙眼鏡蛇、卡諾卜壇怪、神秘圖騰、沙漠毒蠍、仙人掌怪)現在會掉落專屬賣錢物品,可前往超商賣出換知識幣。',
      '   ・沙漠小怪掉落率提升到 <b>60%</b>,而且練功用的經驗書全程都是<b>精裝版</b>!',
      '👑【埃及雙王掉落稀世珍寶!】',
      '   ・打倒法老王有機會掉落 <b>黃金法老面具(可賣 60,000 知識幣)</b>;打倒埃及豔后有機會掉落 <b>尼羅河女王之珠(可賣 55,000 知識幣)</b>!',
      '   ・埃及雙王的<b>超越極限果實掉落率大幅提升到 25%</b>,快去挑戰金字塔王座!',
      '👹【魔物圖鑑新增「🏜 埃及探險」專區!】',
      '   ・現在可在魔物圖鑑查看埃及關的<b>雙王 BOSS(完整 BOSS 能力)</b>、6 隻路邊小怪與稀有的<b>聖甲蟲</b>,每隻都有完整的背景介紹與掉落資訊。',
    ],
    items: [
      '★ v3.15.55【埃及 6 沙漠小怪賣錢掉落物 index.html】新增 BACKPACK_ITEM_DEF + SHOP_SELL_ITEMS 6 物(eg_mummy_cloth 24/eg_cobra_fang 27/eg_canopic_shard 28/eg_totem_fragment 25/eg_scorpion_sting 26/eg_cactus_needle 22;賣值較日本路邊怪 18~23 約 +20%)。新增 EGYPT_MINI_DROP_MAP(6 mob→item)+ 結算 if-else 新增埃及小怪分支:掉落率 0.60(=日本路邊 0.50 +20%)× 難度/祝福倍率。原本 6 mob 落入 else 用 _MINI_DROP_MAP 查無→不掉落,現補齊。',
      '★ v3.15.55【埃及小怪經驗書精裝化 index.html】場景結算 25% 經驗書:_adventureStage===egypt 改發 hero_exp_book_deluxe(📕 精裝版),其餘關卡維持 hero_exp_book(📗 一般版),對齊魔物圖鑑顯示。',
      '★ v3.15.55【埃及雙王賣錢物品 index.html】新增 eg_pharaoh_mask(黃金法老面具 60000)/eg_cleopatra_pearl(尼羅河女王之珠 55000)至 BACKPACK_ITEM_DEF + SHOP_SELL_ITEMS。埃及雙王結算區(_adventureStage===egypt)新增 _EGYPT_BOSS_DROPS,_egKings 各自獨立 20% × 祝福(上限 95%)掉落,不限評價(比照日本 BOSS 掉落模式)。',
      '★ v3.15.55【埃及關爆發果實基礎掉落率 25% index.html】主 BOSS 超越極限果實掉落:_adventureStage===egypt 時 _fruitDropRate 由 BOSS基礎EXP×0.1% 改為固定 0.25(其餘關卡維持原公式)。',
      '★ v3.15.55【魔物圖鑑埃及探險區 index.html _buildMonsterPage】原 EG_BOSS_LIST/EG_MOB_LIST/EG_RARE_LIST(v3.15.17 已定義且在 _monsterDetailList 翻頁清單內)從未在 el.innerHTML render。現補上「🏜 埃及探險」區:makeSection 雙王 BOSS(boss)+ 路邊小怪(mob)+ 稀有小怪(rare),置於台灣環島與世界 BOSS 之間。makeCard 讀 HERO_DB 原始數值 → 雙王顯示 BOSS 能力版(HP 11500/10500);英雄圖鑑仍走 EGYPT_BOSS_HERO_STATS 弱化招募版,兩者並存。',
      '★ v3.15.55【埃及 9 怪 MONSTER_LORE 完整介紹 index.html】補 9 筆魔物背景介紹(法老王/埃及豔后/木乃伊貓/流沙眼鏡蛇/卡諾卜壇怪/神秘圖騰/沙漠毒蠍/仙人掌怪/聖甲蟲),文案結合古埃及神話與其實際 BOSS/小怪戰技能行為。openMonsterDetail 之 stats/技能(b.s1/s2/burst)/天賦(HERO_TRAIT)皆資料驅動本已具備,僅缺 lore,現補齊。',
      '★ v3.15.55【埃及掉落資訊 MONSTER_DROPS index.html】6 小怪顯示 50%→60% + 標註賣值;新增法老王(黃金法老面具 20% / 超越極限果實 25%)、埃及豔后(尼羅河女王之珠 20% / 超越極限果實 25%)掉落顯示(於英雄圖鑑詳情頁及魔物圖鑑詳情頁顯示)。',
      '★ v3.15.55【版本鏈】4 GAME 同步點 v3.15.54→v3.15.55;_vers[index.html]/[game_changelog.js] 同步 v3.15.55。arena.js/admin_panel.js 維持 v3.15.54(本輪未動)、world-boss.js v3.15.51、hero_db.js v3.15.44。本輪只改 index.html + game_changelog.js。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.35)。',
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.54(2026-06-19)— ⚔ 鬥技場大調整:碎片門檻減半 + 商店調價 + 至寶卷含龍王
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.54',
    date: '2026-06-19',
    brief: [
      '🔨【靈魂碎片合成自選召喚卷:需求減半!】',
      '   ・<b>SSR 靈魂碎片</b>:集滿張數由 40 個降為 <b>20 個</b>即可在召喚星空合成 🌟 SSR 自選召喚卷。',
      '   ・<b>SR 靈魂碎片</b>:集滿張數由 20 個降為 <b>10 個</b>即可合成 ✨ SR 自選召喚卷。',
      '⚔【鬥技場兌換商店:價格調整】',
      '   ・SSR 英雄召喚卷:40 → <b>30</b> 鬥技之證;SR 英雄召喚卷:20 → <b>15</b>。',
      '   ・至寶召喚卷:50 → <b>40</b>;至寶經驗卷軸:10 → <b>5</b>;召喚水晶:5 → <b>3</b>;知識幣 1 萬維持 5。',
      '💎【至寶召喚卷升級:現在抽得到龍王至寶了!】',
      '   ・鬥技場「至寶召喚卷」的隨機池由 10 件台灣至寶<b>擴充為 18 件(台灣 10 + 龍王 8)</b>,有機會抽到炎/森/地/雷/海/暗/光/幻龍王的至寶!',
      '   ・(提醒:星空召喚池仍然只有台灣至寶,龍王至寶只能靠龍王戰排名、老師自選卷、或鬥技場至寶召喚卷取得。)',
    ],
    items: [
      '★ v3.15.54【靈魂碎片合成門檻減半 index.html】_SOUL_SHARD_DEF.ssr.need 40→20、sr.need 20→10(合成/換券函式皆讀 need,改常數即生效);同步更新 _buildSummonPage 合成卡 fallback 預設(40→20、20→10)、SSR 自選介紹、soul_shard_ssr/sr 背包說明、3 處貓空 SR 碎片 toast、好友送禮 SSR/SR 碎片說明,全部文案 40→20 / 20→10。',
      '★ v3.15.54【鬥技商店調價 index.html ARENA_EXCHANGE_ITEMS】arena_x_ssr_summon 40→30、arena_x_sr_summon 20→15、arena_x_treasure_summon 50→40、arena_x_treasure_exp 10→5、arena_x_summon_crystal 5→3;arena_x_coins_10k 維持 5。同步更新註解清單與至寶卷 desc(註明台灣 10 + 龍王 8)。',
      '★ v3.15.54【鬥技場至寶卷含龍王 index.html _arenaGrantTreasureVoucher】新增 _ARENA_DRAGON_TREASURE_IDS(8 隻龍王至寶 id),發券時把存在於 TAIWAN_TREASURES 的龍王至寶 push 進 SUMMON_RANDOM_TREASURES.slice() 合併池(去重),再依「未擁有優先」抽 1 件。⚠ 只改鬥技場至寶卷,星空召喚仍走原 SUMMON_RANDOM_TREASURES(龍王 noSummon 不變,v3.15.52 結論不動)。龍王至寶與台灣至寶同存 TAIWAN_TREASURES,_grantTaiwanTreasure/_taiwanTreasureData 通用。同步在至寶圖鑑龍王分支 _howToGet 加註「鬥技場至寶召喚卷(40 證,台灣+龍王 18 件)」管道。',
      '★ v3.15.54【GM 傷害明細(adminOnly)admin_panel.js + arena.js + index.html】老師需求:鬥技場戰鬥記錄審核可查「逐回合×逐英雄×技能」傷害。① index.html doDmg 既有鬥技場總傷 hook(!_adventureMode)同處旁路收集 G._arenaDmgSources(只記 p1 攻擊者,技能名 opts.skillName→_curSkillName→特技/普攻,amount=原始計算傷害含溢殺) ② arena.js _arenaSubmitBattleLog 結算後聚合 round→hero→skill,旁路寫 arenaDamageDetail/{uid_ts}(docId 對齊 arenaBattles;失敗靜默) ③ admin_panel.js 每筆戰鬥列加「🔍 傷害明細」展開鈕,getDoc 讀該場明細,單回合單英雄>5000 標紅。',
      '★ v3.15.54【⚠ Firestore 規則 — 需手動部署】新增 arenaDamageDetail/{docId} 規則(get/list 限 GM、create 限本人+docId 開頭 uid_+hasOnly 5 欄+型別/時間檢查、update:false、delete 限 GM),比照 arenaBattles 安全模型。未部署時明細寫入會被預設拒絕(僅明細缺,戰鬥記錄與其他功能照常,不會壞)。',
      '★ v3.15.54【GM 面板舊註更正 admin_panel.js】更正「刪除鬥技記錄會扣排行榜鬥技之證」的過時說明:v3.15.49 起排行榜改讀 stats/global.arenaWeekly(不再從 arenaBattles 聚合),且持有量在 players/{uid}.arenaZhengHeld → 刪除記錄不會扣到玩家鬥技之證。同步改面板說明文字與刪除+補償確認框文案。',
      '★ v3.15.54【版本鏈】4 GAME 同步點 v3.15.53→v3.15.54;_vers[index.html]/[game_changelog.js]/[arena.js]/[admin_panel.js] 同步 v3.15.54。world-boss.js 維持 v3.15.51、world-boss-ui.html v3.15.50、hero_db.js v3.15.44。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.34)。',
    ],
  },
];