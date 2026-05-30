// ════════════════════════════════════════════════════════════════════════
//  game_changelog.js  —  LXPSGAME 更新日誌
//  最後更新:2026-05-30  / 目前主程式版本:v3.12.4(線上實際版本)
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
  // v3.12.4(2026-05-30)— ⚖️ 不可取代特色盤點:21 個技能/天賦/爆發精調 + 4 大體驗優化
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.12.4',
    date: '2026-05-30',
    brief: [
      '⚖️ 【不可取代度盤點 — 第二波平衡】21 個技能/天賦/爆發精調 + 4 大體驗優化',
      '   — 主旨:讓每隻英雄都有獨特定位,削強補弱不再有「絕對最強」',
      '',
      '🔵 爆發威力強化(7 個)',
      '',
      '   ・冰法師 冰封末日:150% → 200%(全體強力冰凍)',
      '   ・暗法師 毀滅禁咒:120% / 200% → 180% / 280%(全體 + 集中)',
      '   ・雷法師 怒雷狂襲:150% → 200%(彈跳 4 次強力麻痺)',
      '   ・神射手 流星箭雨:130% → 170% + 必中 + 無視有利狀態',
      '   ・時空法師 時間壓縮:400% → 800%(無法復活 2T → 3T)— 極限威力',
      '   ・科技生化人 輻射核砲:(攻+特) × 130% + 升級曲線 +10%/級',
      '   ・刺客 死神之鐮:(攻+特) × 500% → 400% + 升級曲線 +40%/級',
      '',
      '🟠 技能機制升級(8 個)',
      '',
      '   ・雷法師 S1 連鎖閃電:3~5 次 → 4~6 次(c=3 → c=4)',
      '   ・雷法師 S2 麻痺落雷:威力 100% → 200%(已於 v3.12.3 完成)',
      '   ・機械師 S2 亂槍射擊:3~5 次 → 4~6 次',
      '   ・水狐 S1 機制改造:刪除「召喚水精靈」,改為「50% 治療最低 HP 友方 ×3 + 40% 隨機水傷 ×3」',
      '   ・時空法師 S2 時間倒轉:c=6 → c=5,且任意友方倒下時可選擇是否立即觸發 ⭐',
      '   ・煉金術師 S1 道具複製:從「使用」物品保留 → 「使用 + 販賣」物品都可發動 ⭐',
      '   ・凡人 臨摹大師:威力上限隨自己爆發等級提升(Lv0=×1.0, Lv4=×1.4)',
      '   ・學者 元素智慧:追加奪取對手一半能量(四捨五入)',
      '   ・神偷 俠盜飛梭:升級曲線顯示修正(490% ~ 686%,實作不變)',
      '   ・科技生化人 S1 機械爪:×130% → ×150%(共 300% 兩段)',
      '   ・科技生化人 S2 科技能量:攻特 +3 → +(3 + 等級)(Lv9 = +12)',
      '',
      '🟣 天賦擴展與強化(8 個)',
      '',
      '   ・劍士 連擊:普攻 → 「普攻 + 技能造成傷害」都能觸發再行動 ⭐',
      '   ・學者 學究:普攻 → 「造成傷害後」奪取 1 能量(技能也算)',
      '   ・弦樂團員 反射:反彈率 30% → 30 + 10%/級(Lv5 = 70%)',
      '   ・科技生化人 機械濺射:從機率濺射 → 必定濺射,傷害 40 ~ 60%(隨升級)',
      '   ・小劇團員 戲謔:被選中率 40 + 5%/級 → 60 + 5%/級(Lv5 = 85%)',
      '   ・小劇團員 戲謔:轉化機率 20 + 5%/級 → 25 + 3%/級(Lv5 = 40%)',
      '   ・超鬼神王 大胃口:每升級多吞噬 1 個(Lv0 = 1, Lv5 = 6)',
      '   ・田徑隊員 起跑衝刺:倒下被復活時重啟「起跑衝刺」效果 ⭐',
      '   ・吟遊詩人 頌歌:自己造成的傷害「不會」提早解除目標睡眠 ⭐',
      '',
      '🟢 體驗 / UI 優化(4 大項)',
      '',
      '   ⚔ 戰鬥存檔繼續視窗(_advCheckCrashRecovery)',
      '      ・HP 條與雙方名稱大幅縮小(頭像 48 → 34px、字 16 → 13px、HP 條 14 → 11px)',
      '      ・改為 2 欄 grid 排列,4 名英雄壓縮在 2 行內,不再拖太長',
      '      ・「繼續上次戰鬥」「放棄」按鈕加防重複點擊保護,不會按多次無反應',
      '      ・按鈕點擊後立即顯示載入中視覺反饋',
      '',
      '   🔍 GM 後台「玩家紀錄查詢」中文搜尋大幅強化',
      '      ・maxScan 500 → 1500(學校 900 人也涵蓋)',
      '      ・新增「班級座號純數字」優先搜尋(4-6 位數字)',
      '      ・class_exact / class_prefix / class_reverse 三層比對',
      '      ・新增「真實姓名(括號內)」子字串比對',
      '      ・matchType 排序權重重新調整',
      '',
      '   💡 戰鬥獎勵「存到知識化為力量」覆蓋確認',
      '      ・若技能格已存在舊獎勵,彈出比較確認框',
      '      ・並列顯示舊獎勵 vs 新獎勵的圖示、名稱、描述',
      '      ・玩家可選擇「覆蓋舊的」或「保留舊的(丟棄新的)」',
      '      ・避免不小心覆蓋掉珍貴技能',
      '',
      '   🎨 首頁主標題 / 副標題字型',
      '      ・主標題「小英雄大對抗」改為 POP 海報體(Hachi Maru Pop)',
      '      ・副標題「力行小學生與來自異世界的小夥伴」改為超明體(Shippori Mincho)',
      '      ・更鮮明的視覺風格、更有遊戲海報感',
      '',
      '🎯 雙星姊妹體驗精修',
      '',
      '   ・卡片直接顯示「🌟 光星妹妹(治療+30%)」或「🌙 暗星姊姊(傷害+30%)」標籤',
      '   ・技能與爆發 fd 隨型態動態高亮:目前型態高亮、另一段灰色刪除線',
      '',
      '🐛 Bug 修補(本版內部品管)',
      '',
      '   ・時空法師救援 hook 限制 target.side === p1(避免敵方倒下也彈框)',
      '   ・時空法師救援能量扣除時機:必須在 _restoreRoundSnapshot 之後才扣',
      '   ・時空法師自救判定:_vMage !== target(避免自己倒下無效彈框)',
      '   ・吟遊詩人天賦 fd 文字微調',
      '',
      '🚨 深度檢測二度修補(老師要求複查)',
      '',
      '   ・時空法師救援嚴重 bug:彈框時沒暫停戰鬥 → 玩家還在選擇時 startTurn 已推進,',
      '     _prevRoundSnap 被新回合覆蓋,救援完全失效。修補:',
      '     ① 彈框前立刻 _gamePaused=true + window._gamePaused=true',
      '     ② 用 closure 凍結 snapshot(const _frozenSnap)',
      '     ③ 用原生 setTimeout 排彈框(不走 _pSetTimeout)',
      '     ④ 所有出口路徑(yes/no/fallback)都恢復 _gamePaused=false',
      '     ⑤ onYes 先 _clearPendingTimers 清舊 timer 避免倒轉後跑死亡那回合的舊邏輯',
      '     ⑥ onNo 呼叫 _resumeTimers() 釋放排隊 timer',
      '   ・煉金販賣保留設計不一致 bug:原版找「場上任何煉金」會強制扣別人能量,',
      '     機率帶升級加成不對齊「使用」流程。修補:',
      '     ① 嚴格限「販賣者本人是煉金」(a.name === 煉金術師)',
      '     ② 用既有 _hasAlchemistPassive(a) 統一判定(吃 seal/sealall/能量檢查)',
      '     ③ 固定 70% 機率不加升級加成(對齊使用流程的 _alchResult 行為)',
      '',
      '📚 鐵律新增',
      '',
      '   ・1.104:動態 fd 渲染要分離角色獨立 case(雷法師/神射手/冰法師/暗法師全部獨立)',
      '   ・1.105:天賦從「普攻」擴展到「造成傷害後」的雙 hook 模式',
      '   ・1.106:凡人爆發威力上限走 _mimicBurstMult 乘數(不影響被模仿英雄)',
      '   ・1.107:救援類技能在 _restoreRoundSnapshot 之後才能扣能量(否則被覆蓋)',
      '   ・1.108:在 doDmg 內掛 hook 彈玩家選擇框時必須立刻凍結戰鬥(凍結 snapshot+暫停 timer queue)',
      '   ・1.109:新增「自動觸發」類被動必須對齊既有同類被動的判定 SOP(grep 既有判定函式)',
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.12.3(2026-05-30)— ⚖️ 平衡大調整:24 削弱 + 9 強化 + 英雄圖鑑清理
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.12.3',
    date: '2026-05-30',
    brief: [
      '⚖️ 【平衡大調整】33 個技能調整 — 新版第一次登入會強制彈出完整告示',
      '',
      '🔴 過強技能削弱(24 個)',
      '',
      '── 學生設計英雄 ──',
      '   ・操偶師 S1 傀儡守護:全隊護盾 100 → 60',
      '   ・紅色玩家 S2 反域:持續 3T → 2T',
      '   ・電腦繪圖師 S2 色彩噴濺:消耗 c=5 → c=7',
      '   ・直笛團員 S2 餘音繞樑:持續 5T → 3T(治療 + 中毒同步)',
      '   ・學霸(轉學生) S2 下課時光:速度 +100% → +50%',
      '   ・網路駭客 S1 攻陷防火牆:消除「全部」有利 → 「最多 3 個」',
      '   ・網路駭客 S2 強化BUG:消耗 c=4 → c=5',
      '   ・雙星姊妹 S2 流星降雨:消耗 c=4 → c=5',
      '   ・幽幽 S1 惡鬼撲食:消耗 c=4 → c=5',
      '   ・超鬼神王 S2 鮮紅舌頭:固定中毒 2T(取消升級加回合)',
      '   ・窮奇 S1 巨爪攻擊:消耗 c=3 → c=4(威力 250% 不變)',
      '   ・科技生化人 S2 科技能量:消耗 c=3 → c=4',
      '',
      '── 原版英雄 ──',
      '   ・占星師 S2 轉禍為福:消耗 1 → 2 能量(+2 能量機制不變)',
      '   ・動物學家 S2 動物守護:消耗 c=3 → c=4',
      '   ・小劇團員 S1 變臉戲法:消耗 c=2 → c=3',
      '   ・小劇團員 S2 舞台聚光燈:消耗 c=2 → c=4',
      '   ・煉金術師 S2 賢者之石:消耗 c=3 → c=4',
      '   ・光法師 S1 日月同輝:消耗 c=4 → c=5',
      '   ・暗法師 S1 死亡宣告:消耗 c=4 → c=5',
      '   ・舞者 S1 熱情之舞:消耗 c=4 → c=5',
      '   ・籃球隊員 S2 運球:消耗 c=3 → c=4',
      '   ・幼兒園小孩 S1 大聲啼哭:消耗 c=3 → c=4',
      '   ・幼兒園小孩 S2 午睡時間:最多 4T → 3T',
      '',
      '🔵 偏弱技能強化(9 個)',
      '   ・冰法師 S1 冰凍之矛:特技 100% → 200%',
      '   ・雷法師 S2 麻痺落雷:特技 100% → 200%',
      '   ・火法師 S1 火焰球:消耗 c=4 → c=3(威力 230% 不變)',
      '   ・舞者 S2 魅惑之舞:消耗 c=3 → c=2',
      '   ・吸血鬼 S2 召喚蝙蝠群:每次傷害 50% → 70%',
      '   ・救醫馬 S1 馬上救你一命:消耗 c=7 → c=5',
      '   ・光法師 S2 極限閃光:消耗 c=4 → c=3(命中減半效果不變)',
      '   ・炸彈客 S2 連續投擲:基礎 2 次 → 3 次(Lv5+ 達 4 次)',
      '',
      '📖 【英雄圖鑑清理】移除技能/天賦/爆發說明內過時的「每升 1 級 +X」文字',
      '   ・hero_db.js 內 8 條技能 fd 清掉(聖騎士/武士/暗魔將·血/極限菇/火爆女×2/暗行/網路駭客)',
      '   ・天賦圖鑑 18 條清升級資訊(占星師/巫女/米鈴/學霸/天神宙斯/維京海盜/武器精靈/神槍手/火柴人/青炎龍王/鳳凰/操偶師/菇女/小丑/美人魚/火爆女/幽幽/網路駭客)',
      '   ・天神宙斯天賦「神之怒火」desc 同步清升級提示',
      '   ・網路駭客爆發「超極密檔案GET!」清升級文字',
      '   ・升級資訊改由系統依目前等級即時顯示,避免「圖鑑寫的」跟「實際效果」不一致誤導玩家',
      '',
      '🚀 【強制升版】新版上線後玩家會看到金色 banner + 改造「重新整理」按鈕',
      '   ・拉新版瀏覽器自動破快取,進主畫面後 2 秒強制彈出本次平衡告示',
      '   ・按「✅ 我看完了」之後才能繼續遊戲(每位玩家終身只彈一次)',
    ],
    items: [
      '本次平衡基於 v3.12.1 全英雄技能 ratio(總值/能量)分析,削弱過強學生設計英雄(操偶師、電繪、直笛、紅色玩家、學霸、網路駭客等)維護公平性。',
      '原版英雄分散削弱:光/暗法師 S1、舞者熱情之舞、煉金賢者之石等 c+1,降至中段 ratio。',
      '偏弱技能強化:冰矛/麻痺落雷雙倍威力、火焰球/極限閃光降耗、炸彈客次數+1、蝙蝠群每擊 70%。',
      '清升級文字:依鐵律 1.28,fd 只寫 Lv1 基礎,升級資訊由 _renderSkillFdWithLv / _renderTraitFdWithLv / _renderBurstFdWithLv 動態替換。',
      '新版玩家首次登入會在主畫面後 2 秒強制彈出 v3.12.3 平衡告示,localStorage key:lxps_v3_12_3_balance_seen。',
      '手動觸發 API(管理員測試用):window._showV3123BalanceAnnounce(true)。'
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.12.0(2026-05-29)— 三大新功能上線:好友送禮 + 火龍王至寶 + 商店背包賣出
  //                       + 美人魚水花 S1 補強(c=4→5,可連續濺射同目標)
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.12.0',
    date: '2026-05-29',
    brief: [
      '🎁 【好友送禮系統】每天送禮給好友,集滿友情之心換 SSR 召喚卷',
      '   ・好友卡片新增「🎁 送禮」按鈕(4 顆按鈕:邀請/送禮/詳細/✕)',
      '   ・好友面板上方新增「💕 友情之心 X/100」進度條 + 今日已送 X/5',
      '   ・7 種禮物可選(💰知識幣禮包/💎召喚水晶/📕精裝經驗書×5/📚豪華典藏經驗書/📜至寶經驗卷軸/🍑超越極限果實/📖技能升級書×2)',
      '   ・每樣禮物扣自己持有量、加對方對應物品,並獲得對應友情之心點數',
      '   ・每天最多送 5 個不同好友,同一好友當天不能送第二次,早上 8:00 重置',
      '   ・收禮端:登入後 3 秒自動領取所有 pendingGifts + bannerFX 通知',
      '   ・對方背包 99 上限保護:滿了自動轉 3,000 知識幣(不讓送禮失敗)',
      '   ・友情之心集滿 100 點 → 自動發 🌈 SSR 召喚卷 ×1 + 進度歸零',
      '',
      '⚠️ 老師上線前必做:Firebase Console 加 Firestore Rules:',
      '   match /players/{uid}/pendingGifts/{giftId} {',
      '     allow create: if request.auth != null',
      '                   && request.auth.uid != uid',
      '                   && request.resource.data.from == request.auth.uid',
      '                   && request.resource.data.keys().hasOnly([「from」,「fromName」,「itemId」,「deliver」,「ts」]);',
      '     allow read, delete: if request.auth != null && request.auth.uid == uid;',
      '   }',
      '   未加 Rules:送禮會失敗 + 自動退款 + 紅色提示',
      '',
      '🐉 【火龍王之牙】維蘇威火山龍王 世界 BOSS 排名獎勵專屬至寶',
      '   ・slot:weapon(武器槽,跟同槽位台灣武器至寶互斥)',
      '   ・rarity:mythic 神話級 / noSummon:true 不可召喚',
      '   ・baseStats:atk+15',
      '   ・specialEffects:fireDmgReduce 10%(每級+3%,Lv10=37%)',
      '                   / grassDmgBonus 10%(每級+3%,Lv10=37%)',
      '                   / immuneBurn 1(布林旗標,不成長,永遠免疫燃燒)',
      '   ・isDragonTreasure:true 白名單(每級 +3%,跟一般至寶 +2% 不同)',
      '   ・排名獎勵機率:1名 100%/2-5名 75%/6-10名 50%/11-20名 25%/21+ 5%',
      '   ・重複獲得自動轉 treasure_exp_scroll ×3',
      '   ・圖鑑加入維蘇威歷史傳說 + 龐貝古城 + 武爾坎努斯文化背景',
      '   ・API:window._wbRollDragonTreasure(rank) / _wbGrantDragonTreasure(rank)',
      '',
      '⚠️ 老師上線前必做:火龍王之牙.png 上傳到 GitHub repo',
      '   clarebox123jp-art/LXPSGAME/main/ 才能正確顯示圖示',
      '',
      '💰 【商店背包賣出】4 種養成書本可在商店右欄個別賣出',
      '   ・hero_exp_book(50 EXP) → 25 幣',
      '   ・hero_exp_book_deluxe(精裝版 500 EXP) → 250 幣',
      '   ・hero_exp_book_premium(豪華典藏版 5000 EXP) → 2,500 幣',
      '   ・skill_upgrade_book(技能升級書) → 300 幣',
      '   ・UI:+/- 數量選擇(預設 1,上限為持有量)+ 賣出按鈕',
      '   ・SHOP_SELL_ITEMS 不含這 4 種 → 「一鍵賣出所有賣錢物品」絕對不會誤殺',
      '   ・所有賣出走既有 shopSellItem 路徑(含 0.8s 冷卻 + 雲端同步)',
      '   ・召喚水晶可送好友但不可賣',
      '',
      '💧 【美人魚‧角角 S1 水花補強】(3 年 1 班 采漩設計)',
      '   ・能量消耗 c=4 → 5(平衡調整)',
      '   ・濺射目標不再排除「已打過的目標」 → 可連續濺射同一目標',
      '   ・對單 BOSS 戰也能打完整 4 段:240%+120%+60%+30% = 總 450%',
      '   ・玩家版 + AI 版同步修正,fd 描述與 log 文字明確說明',
      '',
      '🛡 【出檔前邏輯檢查補 3 個 BUG】',
      '   ・BUG #1:送禮 fromName 用了不存在的 _myDisplayName,改用',
      '     window._fbUser.displayName || window._fbUser.email',
      '   ・BUG #2(重大):火龍王之牙 fireDmgReduce / grassDmgBonus / immuneBurn',
      '     原本「只定義沒實作」,玩家裝備後完全沒效果。已加入:',
      '     - doDmg 內加 FT1 受火屬性傷害減免(水之祝禱免疫優先,火龍王之牙減免在後)',
      '     - doDmg 內加 FT2 對草屬性敵人傷害加成',
      '     - addStatus 內加 FT3 燃燒附加完全免疫(burn/hellfire 都擋)',
      '   ・BUG #14:giftHistory else if 空 body 加 /* noop */ 註解',
      '',
      '🛡 【第二輪邏輯檢查補 6 個 BUG + 圖鑑顯示問題】',
      '   ・BUG #15(中等):圖鑑卡片顯示火龍王之牙 immuneBurn+1% 怪畫面',
      '     _formatTreasureEff 的 _flagKeys 沒含 immuneBurn,且 _TAIWAN_TREASURE_EFFECT_LABEL',
      '     沒火龍王 3 個 key。已補:fireDmgReduce/grassDmgBonus/immuneBurn 三個 label + flag',
      '   ・BUG #16/#17(中等):另外 2 個顯示 effect 的位置(英雄詳細頁、至寶詳細頁)',
      '     同樣的問題,也已同步補上',
      '   ・BUG #18(中等,玩家受損):友情之心 100 自動換 SSR 卷時,',
      '     若 SSR 卷已 99 → backpackAdd silent cap → 玩家友情之心歸零但沒拿到卷。',
      '     已改:SSR 卷已 99 時,友情之心保留在 99 + 補償 10,000 知識幣 + 5 本精裝經驗書',
      '     並彈訊息「下次再達 100 補卷」,玩家不會白損失',
      '   ・BUG #19(中等):_fbSendGift 的 from || \'\' fallback 會被 Rules 拒絕,已加',
      '     前置守門:from 必須是長度 >=10 的有效 uid 才進入寫入流程',
      '   ・BUG #20(重大,實作邏輯錯誤):火龍王之牙 grassDmgBonus 原本用',
      '     HERO_DB[name].element 判定草屬性,但 HERO_DB 內並無 element 欄位。',
      '     正解:用 target.element(運行時欄位,BOSS 陣容組成時設,範例:杏花妖.element=\'grass\')',
      '   ・圖鑑顯示問題(老師回報):從「英雄編組頁」右側預覽按「📖 圖鑑整備」打開的',
      '     圖鑑被蓋住。v3.11.32 拉高 adventure-overlay z-index 不夠用,改用更暴力可靠的',
      '     修法:把 hero-page-overlay + hero-detail-overlay 暫時 detach 到 body 末端,',
      '     脫離 adventure-overlay 的 stacking context,z-index:10000+ 必定能蓋過任何東西。',
      '     return-to-team 流程關閉時再 attach 回原父節點',
      '',
      '🔧 版本戳:_GAME_LOADED_VERSION → v3.12.0;_LXPS_FILE_VERSIONS:',
      '   index.html → v3.12.0、hero_db.js → v3.12.0、world-boss.js → v3.12.0',
      '   world-boss-ui.html → v3.12.0、game_changelog.js → v3.12.0',
      '',
      '📝 鐵律新增:',
      '   ・鐵律 1.70:跨玩家寫 Firestore(送禮、補償通知等)必須走 Rules hasOnly()',
      '     精確守門欄位,例如 hasOnly([「from」,「fromName」,「itemId」,「deliver」,「ts」])',
      '     5 個欄位,多寫一個就被擋',
      '   ・鐵律 1.71:技能濺射/彈跳邏輯,要明確設計「能否打同目標」',
      '     傳統「排除已打目標」對單 BOSS 戰會浪費後續段傷害;若希望單體戰也',
      '     有完整輸出,應移除 _hitTargets.indexOf 排除條件',
      '',
      '⏳ 收禮系統 retry:寫入 Firestore 失敗會自動退款(扣掉的資源還回去)',
      '   並彈紅色 toast「Firestore 權限未開放(老師請設定 Rules)」,玩家不會白損失',
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.11.37(2026-05-29)— 答題/獎勵畫面 race condition 補強
  //   v3.11.36 上線後仍有新災情:答題獎勵畫面顯示中,玩家按爆發秒殺對手,
  //   造成答題流程與結算流程互相綁住,30 秒答題超時後才解開。
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.11.37',
    date: '2026-05-29',
    brief: [
      '🛡 修「答題獎勵畫面中按爆發秒殺對手」race(BUG #4)',
      '   ・災情:玩家答對題 → 獎勵畫面顯示 → 邊看獎勵邊按爆發鍵 → 玉藻前禍世邪魅',
      '     秒掉 p2 三隻 → checkWin → 結算流程被「未 resolve 的答題 promise」綁住',
      '     → 30 秒答題超時後才解開,玩家以為「對手不動卡死」',
      '   ・根因:答題流程的 _advQuizResolveCb 還在等玩家點獎勵的「確認」按鈕,',
      '     但戰鬥已結束,_closeAllBattleModals 把獎勵畫面 display:none 了,',
      '     resolve callback 永遠 fire 不掉',
      '',
      '🔧 三層補強:',
      '   ① execBurst 入口加守門:adv-reward-overlay 或 adv-quiz-overlay 顯示中時,',
      '     玩家側(p1)爆發被擋下,toast 提示「請先處理答題畫面」',
      '   ② v3.11.36 拒絕重入救援時,順手清答題殘留:',
      '     _advQuizResolveCb / _advQuizPhase / _gamePaused / _advQuizTimer / _quizDeadlockWatchdog',
      '   ③ v3.11.36 watchdog 5 秒救援時也清答題殘留(三層救援邏輯同步)',
      '',
      '📝 鐵律新增:',
      '   ・鐵律 1.68:任何 race-prone 動作(爆發、技能、物品使用)入口要檢查',
      '     獎勵/答題 overlay 是否顯示中,顯示中要擋下並引導玩家先處理該流程,',
      '     避免雙流程互鎖造成死結',
      '',
      '🔧 版本戳:_GAME_LOADED_VERSION → v3.11.37;_LXPS_FILE_VERSIONS:',
      '   index.html → v3.11.37、game_changelog.js → v3.11.37',
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.11.36(2026-05-29)— 三大戰鬥流程災情緊急修補
  //   緊急修補 v3.11.35 後玩家回報的三個獨立災情:
  //   #1 續戰恢復後 BOSS 重複行動卡死(5108 李宥禾)
  //   #2 擊敗 BOSS 但結算 modal 沒出來(杏花妖案例)
  //   #3 放棄快照後被擋在 stage_select 無法進關卡
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.11.36',
    date: '2026-05-29',
    brief: [
      '🐛 修續戰恢復後 BOSS 重複行動 + 死隊友卡住 startTurn(BUG #1)',
      '   ・災情:5108 李宥禾,貓空 round=15,黑暗球 4 隻續戰回來又跑一輪',
      '   ・根因:_advRestoreBattleState 把所有 acted 都清成 false,',
      '     包含快照中已行動完的 BOSS 群 → 還原後又被當作未行動 → 重新跑一遍',
      '   ・修法:HP<=0 角色強制 acted=true(死人視同已行動,不參與輪轉),',
      '     活著的才清 acted=false',
      '',
      '🛡 修「擊敗 BOSS 但結算 modal 沒顯示」三層救援(BUG #2)',
      '   ・災情:玩家「擊敗杏花妖但不讓我結束戰鬥」,後續所有觸發都被 60 秒守門擋下',
      '   ・根因:_showResultWithDrama 跑了 _closeAllBattleModals 把 adv-reward-overlay',
      '     設成 display:none,但下游 advStartWinSequence 中途 await 卡住 → modal 沒重開',
      '   ・三層修法:',
      '     ① 拒絕重入時,檢查結算 overlay 是否真有顯示,沒顯示 → 1.2 秒後強制重開',
      '     ② 入口設 5 秒 watchdog,沒看到結算 modal 就主動觸發 advShowBattleResult',
      '     ③ advShowBattleResult / advFinishMiniBattle 入口清掉 watchdog,避免重複觸發',
      '',
      '🛡 修「放棄快照後被擋在 stage_select 無法進關卡」(BUG #3)',
      '   ・災情:玩家放棄當前戰鬥 → 13 秒後 _fbLoad 又拉雲端 → 點任何關卡都被',
      '     「請先處理未完成戰鬥」彈窗擋住,無法繼續玩',
      '   ・根因:Firestore eventual consistency,放棄當下寫的 null 還沒生效,',
      '     _fbLoad 拉到舊資料(advSnapshot 還在)→ _applySafeData 寫回本地',
      '   ・三層修法:',
      '     ① _advDiscardSnapshotAndExit 設 _advRecentlyDiscarded = Date.now() 旗標',
      '     ② _applySafeData 套用 advSnapshot 前檢查:30 秒內剛放棄 → 跳過 + 清本地',
      '     ③ 放棄流程 3 秒 + 10 秒後再清本地 + 寫雲端各一次(retry 模式)',
      '',
      '📝 鐵律新增:',
      '   ・鐵律 1.65:_advRestoreBattleState 還原 acted 必須依 curHp 區分死活,',
      '     不可一律清零(造成 BOSS 重複行動 + 死人卡 startTurn)',
      '   ・鐵律 1.66:涉及雲端「清空關鍵欄位」的流程必須有 retry 保護 + 旗標阻擋',
      '     後續 _applySafeData 寫回,避免 Firestore eventual consistency 把剛清的',
      '     資料拉回來(放棄快照、登出清檔、補償清除等都適用)',
      '   ・鐵律 1.67:任何「結算 modal 顯示」流程必須有 watchdog,5-10 秒沒見到 modal',
      '     就要主動補救,因為 await 路徑卡住會永遠沒人重開 overlay',
      '',
      '🔧 版本戳:_GAME_LOADED_VERSION → v3.11.36;_LXPS_FILE_VERSIONS:',
      '   index.html → v3.11.36、game_changelog.js → v3.11.36',
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.11.35(2026-05-29)— 完整玩家活動管理系統 + 異常清理 + 補償 + 公告
  //   累積 patch:35a-j 共 10 個 micro-patch 合併為一個正式版
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.11.35',
    date: '2026-05-29',
    brief: [
      '📜 GM 後台新增「玩家活動記錄查詢」(側欄第 3 位)',
      '   ・輸入 email / uid / 學生姓名查詢(姓名查詢支援精確 + 模糊比對)',
      '   ・四分頁(英雄/至寶/戰鬥/幣帳)+ 玩家基本卡 + 異常紅框警示',
      '   ・每筆紀錄可單獨刪除,或整隻英雄/至寶清除',
      '   ・知識幣分頁附「強制覆寫餘額」+ audit log',
      '',
      '⚡ 「掃描異常」掃描全部玩家(不再限 200 位)',
      '   ・偵測規則:① 同 battleId 多解鎖 ② 3 分鐘內打 BOSS > 2 隻',
      '   ・果實異常也納入偵測(同規則,門檻 > 1 顆)',
      '   ・掃描結果同時對比 Firebase /players 實際數 vs 首頁顯示',
      '   ・不一致時提供「🔄 一鍵同步首頁總玩家數」按鈕',
      '',
      '📦 一鍵清除 + 自動補償 + 個人通知',
      '   ・偵測到異常的玩家紅橫條按鈕「📦 開啟勾選清除介面」',
      '   ・checkbox 勾選模式 — 預設全勾,可取消想保留的英雄/果實',
      '   ・補償公式:Lv×1000 幣 + 技能書(s1+s2)+ 果實 + 經驗書',
      '     ⚠ SSR 召喚卷不補(他們本不該多那隻 SSR)',
      '   ・果實清除若玩家手上不足 → 扣到 0 為止(不溯及已升級)',
      '   ・「👁 預覽玩家會看到什麼」按鈕擬真渲染玩家端通知 modal',
      '   ・通知文字採安撫風,強調「SSR 緣分」+「未來重逢」+ 補償條列',
      '',
      '📢 GM 公告增加 13 個範本(小學生友善,稱「小英雄」)',
      '   ・維修預告 10/5 分・維修中・維修完成',
      '   ・BUG 異常回收(老師親自擬,安撫風)・緊急修補完成',
      '   ・新功能上線・活動開始・活動快結束・全體發獎勵',
      '   ・玩法小提醒・回報 BUG 鼓勵・節慶問候・考試加油',
      '   ・點按鈕一鍵填入文字 + 自動切換樣式/顏色',
      '',
      '🆔 battleId 新格式 — 一眼分辨不同場次的 BOSS',
      '   ・舊:boss-1730000000-12345(看不出意義)',
      '   ・新:b-維蘇威火山龍王-260529-2135-003-A7F2',
      '   ・GM 後台顯示:「維蘇威火山龍王 #003 (5/29 21:35)」',
      '   ・BOSS 名一律全名不截短(老師指示)',
      '   ・序號為玩家當天第幾場(每日 00:00 重置)',
      '',
      '📩 玩家端管理員通知系統升級',
      '   ・補償物品改為展開詳列(技能升級書 ×N、果實 ×N...)',
      '   ・removedItems 加上果實顯示',
      '   ・知識幣加千分位逗號(+360,000)',
      '',
      '⛔ 訪客守門 watchdog + 版本戳健檢',
    ],
    items: [
      // ── 階段 4(玩家活動記錄 + 訪客守門 + 版本健檢)──
      '【階段 4a 戰鬥結果紀錄】新增 window._advRecordBattleResult(battleId,type,payload) 寫 adv_battle_history localStorage(merge 同 battleId);hook 點 advStartWinSequence、advShowBattleResult(含失敗 type="boss_loss");monkey-patch _wbShowResult 世界 BOSS 結束寫 type="world_boss";_buildSafeData/_applySafeData 加 _battleHistory + _battleHistory_s 雙寫雲端 + 合併邏輯。',
      '【階段 4b 5 個 admin API】(6) _fbAdminQueryPlayerActivity(uid) 回傳 player + heroH + treasureH + battleH + coinTx + fruitHistory + currentFruitCount + heroDetails(後加,v3.11.35d/e);(7) _fbAdminDeletePlayerActivityEntry(uid,type,entryKey);(8) _fbAdminOverwritePlayerData(uid,patch) 白名單 15 欄位;(9) _fbAdminScanBattleAnomaly(opts) v3.11.35g 起預設掃全部(限制可選 opts.limit);(10) _fbAdminFindPlayersByName(name) v3.11.35b 新增,姓名查詢兩階段(精確比對快路徑 → fallback 全掃 500 模糊 4 種 contains/reverse/no_prefix);(11) _fbAdminCleanupAndCompensate(uid,deleteList,compensation,notification,opts) v3.11.35d 一鍵清除 + 補償 + 通知;(12) _fbAdminClearAbnormalFruits(uid,requestedCount) v3.11.35e 扣果實 min 0。',
      '【階段 4c GM 後台 UI】admin_panel.js 新增 _admin-activity-section + IIFE _bindActivitySection ~350 行;查詢框(email/uid/姓名)+「⚡ 掃描異常」全掃按鈕;玩家基本卡 + 異常紅框;4 分頁 tabs(英雄/至寶/戰鬥/幣帳)+ 衝突 row 自動標紅 ⚠;動作欄「🗑 刪紀錄」/「🚫 整隻刪」;掃描結果獨立卡片 + 「→ 查看詳情」跳轉。',
      '【階段 4d sidebar 重排】1.🔧維修 / 2.📢GM公告 / 3.📜玩家活動記錄查詢(新) / 4.📥錯誤回報 / 5.🆘Lv1救援 / ... 其餘維持。',
      '【階段 4e 玩家端通知 modal】獨立 IIFE _setupAdminNotificationModal:setInterval 等就緒,登入 3 秒後讀 pendingAdminNotifications/{uid}/items(unread,orderBy asc);逐則彈出 + 三種 type 配色(info藍/warning紅/compensation綠);點「我知道了」updateDoc({read:true,readAt})。v3.11.35i 升級:compensation.items 展開詳列、removedItems.fruits 顯示、知識幣千分位。',
      '【階段 5 訪客守門 watchdog】_lxpsGuestLeakWatchdog IIFE 啟動延遲 8 秒,每 5 秒掃 adventure-overlay。命中條件:可見 + !_lxpsLoggedInThisSession + !_gUserId + !_lxpsActiveSignInThisPageload。連續 2 次才踢(10 秒視窗,防 race 誤判)。踢人:關 overlay + showLoginGate / reload。',
      '【階段 6 版本戳健康檢查】window._lxpsVersionHealthCheck() 檢查 4 項對齊;boot 100ms + 5000ms 兩輪,不對齊 → console.warn + window._lxpsVersionMismatch=true。',

      // ── v3.11.35b(姓名查詢)──
      '【v3.11.35b 姓名查詢】_resolveUid 升級為三路判斷:含 @ → email / 純英數 20+ 字 → uid / 其他 → 姓名走 _fbAdminFindPlayersByName;多筆候選 throw {_multi:true, candidates},_doQuery 渲染清單讓老師點選。',

      // ── v3.11.35c(時間窗異常偵測)──
      '【v3.11.35c 時間窗主規則】因 lsps112171@stu.lsps.tp.edu.tw 1 分鐘刷 12 隻 darkorb_5pct 但 battleId 都是「—」(老資料無 battleId),純 battleId 規則抓不到。新增「時間窗」主規則:1 分鐘內打 BOSS 來源 > 2 隻 = 異常。BOSS 來源白名單(darkorb_5pct/japan_boss_5pct/maokong_50pct/yamata_miko_5pct/taiwan_clear/japan_clear/boss_drop),排除 admin_*/summon_*/event_quest。演算法:滑動窗 consume-once,cluster 內 entry 標記 consumed 不重疊。',
      '【v3.11.35c UI 變化】玩家基本卡異常紅框顯示「⏱ 時間窗:英雄 N 群(共 M 隻)」+「battleId:英雄 K 場」雙計數;英雄/至寶分頁衝突 row 標紅;全掃描頁卡片紅框 ⏱ 顯示「N 分鐘內連刷 X 隻」+ 連刷英雄列表(較強鐵證)。',

      // ── v3.11.35d(一鍵清除 + 補償 + 通知 + GM 公告範本)──
      '【v3.11.35d 補償公式】_computeCompensationForHero(name, heroDetails) 算每隻英雄補償:知識幣=Lv×1000、skill_upgrade_book=s1Lv+s2Lv、burst_upgrade_fruit=burstLevel、hero_exp_book_premium=1。⚠ 不補 SSR 召喚卷(老師明確:他們本不該多那隻 SSR,補卷等於變相鼓勵)。',
      '【v3.11.35d cleanup+compensate flow】_fbAdminCleanupAndCompensate(uid, deleteList, compensation, notification, opts):(1) 逐個刪英雄(_fbAdminDeleteUnlockedHero,清 7 欄位);(2) 套補償(coinsMode="add" 累加);(3) 發 pendingAdminNotifications(type="compensation" 綠色);(4) 寫 _adminLastAction audit。暴露 window._getHeroRarity 給 admin_panel 判定 SSR(line 80367+)。',
      '【v3.11.35d 預覽 modal】admin_panel.js _openCleanupPreview:列出每隻英雄(Lv/技能/爆發/能力點/補償明細/原因)+「保留每場第 1 隻」邏輯 + 補償總計綠框 + 個人通知 textarea。',
      '【v3.11.35d GM 公告 BUG 範本】GM 公告區文字框下新增單按鈕「📜 BUG 修補公告範本」一鍵填老師擬好的長文 + 自動切換「強制彈窗 + 紅色」。',

      // ── v3.11.35e(果實異常偵測 + checkbox 勾選)──
      '【v3.11.35e 果實資料管線】_advSaveFruitHistory(source,count) helper 寫 adv_fruit_history localStorage 結構 {source,count,at,battleId,uid};hook 4 個果實掉落點:標準 BOSS(line 49382 boss_drop)、八岐大蛇(66464 yamata_drop)、黑暗球(66522 darkorb_drop)、mainboss(66600 mainboss_drop)。商店每日購買不寫入(合法路徑)。_buildSafeData 加 _fruitHistory + _fruitHistory_s 雙寫,_applySafeData 加合併(key=at|source)。',
      '【v3.11.35e 果實清除 API】_fbAdminClearAbnormalFruits(uid, requestedCount, opts):實扣 = min(requestedCount, _curCount) — 老師指示「若不足扣到 0 為止」;不動 heroBurstLevels(已升的視同合法消耗);寫 _fruitHistory 一筆 admin_delete audit(beforeCount/afterCount)。_fbAdminCleanupAndCompensate 升級加 opts.fruitsToRemove 整合進來,deleteList 可為空(只清果實的情境)。',
      '【v3.11.35e checkbox 勾選介面】預覽 modal 改為每英雄一個 checkbox 預設全勾 + 「全選/全不選」+ 果實清除獨立 checkbox(整批 toggle);補償總計 + 通知文字依勾選即時更新;老師手動編輯通知文字後不再自動覆寫(_userEditedNote flag);_detectFruitAnomalies 函式(同 battleId > 1 顆 OR 時間窗 > 1 顆);紅橫條 banner 條件升級為「英雄或果實任一異常都顯示」。',

      // ── v3.11.35f(GM 公告 13 範本)──
      '【v3.11.35f GM 公告 13 範本】_GM_TEMPLATES 物件:⏰ 維修預告 10 分(banner 金)/ ⏰ 維修預告 5 分(modal 橘)/ 🔧 維修中(modal 紅)/ ✅ 維修完成(banner 綠)/ 📜 BUG 異常回收(modal 紅,老師原文)/ 🛠 緊急修補完成(banner 藍)/ 🎉 新功能上線(modal 藍紫)/ 🎊 活動開始(modal 橘)/ ⏳ 活動快結束(banner 橘紅)/ 🎁 全體發獎勵(modal 綠)/ 💡 玩法小提醒(banner 紫)/ 📣 回報 BUG 鼓勵(modal 藍)/ 🎄 節慶問候(modal 粉)/ 📚 考試加油(banner 棕)。全部稱「小英雄」,小學生友善。統一 class _admin-gm-tmpl-btn 綁定,點按鈕一鍵填文字 + 自動切換樣式/顏色。',

      // ── v3.11.35g(掃全帳號 + 3 分鐘窗 + totalPlayers 同步)──
      '【v3.11.35g 掃全帳號】_fbAdminScanBattleAnomaly opts.limit 預設 0(無限制),不傳就掃全部 /players 集合;同時讀 stats/global.totalPlayers 對比實際文件數;回傳 actualPlayerCount + statsTotalPlayers + totalPlayersMismatch。',
      '【v3.11.35g 時間窗 1→3 分鐘】TIME_WINDOW_MS 兩檔同步 60×1000 → 3×60×1000(老師指示);全檔 UI 文字「1 分鐘」→「3 分鐘」批次更新(只保留 5308 行歷史備註)。',
      '【v3.11.35g totalPlayers UI】admin_panel.js _doScanAnomaly 升級:確認對話框文字改「掃描全部玩家」;結果頂部顯示對比框(不一致 → 黃色 + 「🔄 同步首頁總玩家數為 N」按鈕,一致 → 綠色「✓ 同步正常」);按鈕呼叫既有 _fbBackfillTotalPlayers() 掃 /players 寫回 stats/global.totalPlayers。_bindSyncTotalPlayersBtn helper 函式。',

      // ── v3.11.35h(battleId 可讀格式)──
      '【v3.11.35h battleId 新格式】window._advNewBattleId(bossName) 生成 b-{BOSS全名}-{YYMMDD}-{HHMM}-{seq}-{rand4}(例 b-維蘇威火山龍王-260529-2135-003-A7F2)。BOSS 名一律全名,不截短(老師明確指示)。序號從 localStorage adv_battle_seq 存 {date, seq},跨日自動重置。應用點:advStartBattle(line 60772-60776,推導 BOSS 名)、advStartMiniBattle(line 87482-87487,標 "小怪_{stage}")。',
      '【v3.11.35h 解析 helper】window._parseBattleId(battleId) → {bossName, dateStr, timeStr, seq, isLegacy};window._formatBattleId(battleId) 顯示用:新格式 → "維蘇威火山龍王 #003 (5/29 21:35)"、世界 BOSS → "世界 BOSS"、老格式 → "(舊) M/D HH:MM"、不可解 → 後 12 字。',
      '【v3.11.35h admin_panel.js 顯示】_shortBid 升級為呼叫 window._formatBattleId,所有用 _shortBid(e.battleId) 的地方自動變人類可讀;表頭文字「battleId」→「場次 (BOSS / 時間)」+ min-width:200px(英雄/至寶/掃描三表)。',
      '【v3.11.35h 修補】移除中途殘留的 _advMakeBattleId / _advParseBattleId(舊版會截短前 4 字違反老師指示),保留只用全名的 _advNewBattleId / _parseBattleId / _formatBattleId。',

      // ── v3.11.35i(玩家通知預覽 + 玩家端 modal 改進)──
      '【v3.11.35i 玩家通知預覽】_openCleanupPreview 按鈕區新增「👁 預覽玩家會看到什麼」藍色按鈕;_renderPlayerNotificationPreview(noteData) 完全擬真渲染玩家端 modal(同 _showNotificationModal 配色 + 結構)+ 預覽 modal 頂部黃色提示「不會真的發送」;關閉方式:下方按鈕 / 點背景;z-index 200005 蓋在預覽 modal 上。',
      '【v3.11.35i 玩家端 modal 改進】index.html _showNotificationModal 升級:compensation.items 原本只顯示「物品 N 種」 → 改為展開列出每樣物品中文名 + 數量(用 _ITEM_LABELS 對齊 admin_panel);removedItems.fruits 加上顯示「🍑 超越極限果實 ×N 顆」;知識幣加千分位(toLocaleString())。',

      // ── v3.11.35j(安撫版通知文字)──
      '【v3.11.35j 安撫版個人通知】重寫 _refreshSummary 內的預設通知文字。設計重點:不用「BUG/異常/回收」冰冷詞;開頭 💗 + 「有件事想跟你說」軟著陸;「捨不得是正常的」承認情緒;「會在未來的冒險中與你重逢」改寫「失去」為「等待重逢」;補償清單前 👇 視覺引導;結尾保留老師原句「你跟每一位 SSR 英雄結識,都是一段可歌可泣的戰鬥 ⚔」+「LXPSGAME 管理員 敬上」。情境分流:有英雄+有 SSR/無 SSR/只清果實/兩者都有,四種情境動態組合段落。',
      '【v3.11.35j 安撫版大公告】重寫 GM 公告 BUG 範本(bug),保留老師原意但語氣軟化;特別保留對未受影響玩家的肯定段(「這是好事!代表你一直在用正常方式累積實力」)+ 鼓勵回報 BUG 段(承接老師擔心的「未來不回報」)+ 結尾「守護這座知識的冒險世界 🗺」。',

      // ── 版本戳 ──
      '【版本戳】_GAME_LOADED_VERSION → v3.11.35;_LXPS_FILE_VERSIONS:index.html → v3.11.35、admin_panel.js → 20260529-v3-11-35j-comforting-text、game_changelog.js → v3.11.35;ADMIN_PANEL_VERSION 同步。',
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.11.34(2026-05-29)— 階段 1-3 結算反覆領獎根治 + 異常解鎖偵測
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.11.34',
    date: '2026-05-29',
    brief: [
      '🛡 黑暗球結算「✅ 確認」反覆領獎災情三層守門徹底根治',
      '   ・打完一場 BOSS / 黑暗球連按 5 下確認,只發 1 次獎',
      '   ・連帶解決「短時間刷出 5+ 隻稀有英雄」異常',
      '',
      '🔍 GM 後台新增「異常解鎖偵測」(英雄+至寶)',
      '   ・掃描短時間大量解鎖玩家,可逐項勾選清除',
      '   ・同場戰鬥多解鎖紅框警示(階段 4 升為主規則)',
      '   ・配合「告知+補償」「停權」「完整記錄」四個操作',
      '',
      '🦸 設計師英雄補上「神槍手」(5 年 4 班莊同學設計)',
      '   ・補進 STUDENT_DESIGNER_HEROES,後台補發工具會抓到',
    ],
    items: [
      '【階段 1 結算守門三層】L1 按鈕端:結算「✅確認」按鈕 onclick 加 disabled + dataset.claimed=\'1\' 雙條件,首次點擊立即鎖死(line 10202);L2 函式入口:advStartWinSequence 用 _advWinSequenceDone Set(50 上限 ring buffer)以 _advCurrentBattleId 為 key 守門(line 64847);L3 上游入口:_showResultWithDrama 用 _advResultDramaDone Map(100 上限)時間戳 60 秒內同 id 拒絕重入(line 42446)。L3 必須放行 _bossKillResultDelayed=true 的合理重入(慢動作 setTimeout 2100ms 後合法再呼叫)。新一場顯示按鈕時 reset disabled/claimed/opacity/cursor/textContent(line ~63886)防殘留。配合鐵律 2.03 三層守門模式。',
      '【階段 2 異常解鎖 API 群】5 個新 API:_fbAdminScanAbnormalUnlocks(掃英雄,過濾 admin_delete/grant 只算實際解鎖,帶 multiPerBattle 欄位)、_fbAdminDeleteUnlockedHero(完整清 7 個欄位 unlockedHeroes/heroLevels/heroStatInvested/heroStatPoints/heroSkillLevels/heroBurstLevels/_heroUnlockHistory,寫 admin_delete audit)、_fbAdminScanAbnormalTreasures(掃至寶)、_fbAdminDeleteTreasure(處理 taiwanTreasureData)、_fbAdminSendNotificationToPlayer(寫 pendingAdminNotifications/{uid}/items/{ts} 子集合,配合鐵律 2.04)。',
      '【階段 2 資料管線】_advSaveTreasureUnlockHistory(id,source) helper 寫 adv_treasure_unlock_history localStorage 結構 {id,at,source,battleId,uid};hook 點:_grantTaiwanTreasure 加 source="taiwan_clear"、_japanSetTreasure 加 source="japan_clear" 僅首次取得 (_wasNew);_buildSafeData 加 _treasureUnlockHistory + _treasureUnlockHistory_s 雙寫(陣列 + 字串繞 merge:true 限制),_applySafeData 加 union 合併(key=at|id)。',
      '【階段 3 GM 後台 UI】新增 _admin-abnormal-unlock-section 區段(在 🕵️ 可疑帳號偵測 後);sidebar 註冊「🔍 異常解鎖偵測」;完整事件綁定 _bindAbnormalUnlockSection:時間窗(1h/6h/24h/3d/7d)+ 英雄門檻(3/5/10);掃描同時跑 hero+treasure API 合併同玩家結果到一張卡(_mergePlayerResults);卡片內勾選 → 4 操作按鈕(🗑 清除勾選 / 💌 告知+補償 / 🚫 停權帳號 / 🔍 完整活動記錄);同場戰鬥多解鎖預設勾選 + 紅框「battleId=XXX 同場 N 個」警示。',
      '【神槍手補發】STUDENT_DESIGNER_HEROES 補上 lsps110013 莊同學(line 92519),後台 _grantStudentDesignerHero 補發工具會自動抓到。',
      '【新鐵律】2.03 結算 modal 三層守門模式(L1 按鈕 disabled+dataset / L2 函式 Set / L3 上游 Map 時間戳,每層 ring buffer 50/100,合理重入用旗標放行);2.04 GM 強制覆寫一律走 audit log(不走 _fbSaveLive 健康度守門,改 updateDoc 精確寫指定欄位,必寫 _adminLastAction + history 條目標 source:"admin_delete"/"admin_grant" + adminAction:true + deletedBy 標 email)。',
      '【版本戳】_GAME_LOADED_VERSION v3.11.33 → v3.11.34;_LXPS_FILE_VERSIONS.index.html / admin_panel.js / game_changelog.js 同步;ADMIN_PANEL_VERSION → 20260529-v3-11-34-abnormal-unlock-flow。',
    ]
  },


  // ════════════════════════════════════════════════════════════════════
  // v3.11.25(2026-05-29)— 黑暗球滅團卡死 / 好友名單同步 / 召喚登錄 三修補
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.11.25',
    date: '2026-05-29',
    brief: [
      '🐉 修正「打黑暗球友方滅團後卡在戰鬥畫面、戰鬥不會結束」',
      '   ・全隊陣亡時會正常彈出失敗結算(含接關機會),不再卡死',
      '',
      '🤝 好友名單同步變即時',
      '   ・好友換上「代表英雄」後,你打開好友面板(或停留著)就會看到最新英雄',
      '   ・好友切走 App / 關閉遊戲 → 你這邊「上線/離線」燈號幾秒內就更新',
      '',
      '🌟 修正「召喚抽到稀有英雄卻沒登錄」',
      '   ・同一次連續召喚不會再抽到重複的稀有英雄(浪費名額)',
      '   ・抽到稀有英雄後多一道「雲端確認後再核對補登錄」保險',
    ],
    items: [
      '【黑暗球滅團卡死】三層保險:(1) 天賦「黑暗失控」反擊在獨立 setTimeout 內結算,結尾補一次 checkWin(反擊打死最後一人也能正常結算);(2) checkWin 我方全滅判定改 null-safe(!h||h.curHp<=0),原本對空槽位 h.curHp 拋 TypeError 會中斷整個回合流程造成凍結;(3) advStartBattle 新增「友方滅團守門」每 1.2 秒兜底 interval,偵測 p1 連續 2 次全滅且無接關/結算/答題/過場視窗、非世界 BOSS、非小怪戰、敵方未同時全滅 → 強制走失敗結算(對齊小怪戰既有 _miniCheckInterval)。',
      '【好友名單同步】(a) _renderFriendPanelImpl 代表英雄原本永久快取(整 session 看舊的),改為每次開面板背景重讀 + 開啟期間每 12 秒重讀(_friendPanelRefreshInterval,於 _friendPanelClose / 背景點擊關閉時清除);(b) 新增 visibilitychange presence 同步:hidden(iPad 切 App/切分頁)立即 _fbStopPresence 刪 presence、visible 立即 _fbStartPresence 補寫,好友端 onSnapshot 幾秒內反映上線/離線,不增加固定頻率寫入。',
      '【召喚登錄】(a) doSummon 在 roll 完後、apply 前加 _dedupeRareHeroResults:同批重複的 rare_hero 改抽「本批+既有解鎖」都沒有的稀有英雄,全選完降級超越極限果實(修正看到兩張同名稀有卡卻只登錄一隻);(b) 新增 _persistSummonedRareHeroes:召喚後延遲 1.5 秒 await _waitForCloudReady(15s) 確認雲端載完,再核對 adv_unlocked_heroes 缺的補回 + 重存雲端,杜絕雲端晚到 load 覆蓋本地。受災生補發:管理員 console 執行 await window._adminGrantHeroByEmail("lsps110065@stu.lsps.tp.edu.tw", "鳳凰", "巫女")。',
    ]
  },


  // ════════════════════════════════════════════════════════════════════
  // v3.11.11(2026-05-28)— 稀有度系統 + 後台 UX 改造
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.11.11',
    date: '2026-05-28',
    brief: [
      '🌈 全新「英雄稀有度系統」上線(SSR / SR / R)',
      '   ・🌟 SSR(彩虹發光,31 隻):召喚水晶池 — 日本三妖怪+巫女+所有學生設計英雄',
      '   ・⭐ SR (黃色發光,28 隻):九尾貓/杏花妖通關 50% 機率解鎖的經典職業',
      '   ・💎 R  (藍色發光,10 隻):初始 8 隻商店肖像 + 答題解鎖的小力/幼兒園小孩',
      '   ・標籤顯示 6 處:圖鑑清單/圖鑑詳細頁/編組邀請預覽/編組小卡/編組出戰選擇卡/戰鬥中卡牌',
      '   ・邊框配色 2 處:圖鑑清單卡 / 編組出戰選擇卡(SSR 彩虹跑燈邊框)',
      '   ・SSR 採 4 秒循環跑燈動畫(粉→金→綠→藍→紫),邊框與標籤背景同節奏',
      '   ・編組頁選中時轉綠邊覆蓋(SSR 跑燈自動關掉避免閃爍)',
      '',
      '🔍 圖鑑頁與編組頁雙雙加上「稀有度篩選」按鈕',
      '   ・🌈 SSR / ⭐ SR / 💎 R 三按鈕,可快速篩選擁有的英雄',
      '   ・稀有度篩選會「未解鎖也列入」,讓你一眼看出還沒抽到哪些 SSR',
      '',
      '🛠 管理員後台:小博士排行榜操作介面大改造',
      '   ・「補發給單一玩家」uid 輸入 → 改成 email 輸入(自動反查 uid)',
      '   ・「🗑 刪除排名」按 uid 區塊整個移除',
      '   ・改為「查看前 30 名」modal 內 checkbox 勾選批次刪除',
      '     (對齊世界 BOSS 榜操作體驗:全選/全不選/二段確認/進度顯示)',
      '   ・3 號「玩家資料急救工具」也加 email→uid 反查按鈕',
      '',
      '🐉 維京海盜船長預覽圖修正',
      '   ・編組頁右側預覽圖位置太高,看不到臉(老師回報)',
      '   ・object-position Y 軸 25% → 15%,圖整體往下挪 10%,現在看得到臉跟戰斧',
      '',
      '⚙ 內部工程(玩家不會直接看到,為下版排行榜做準備)',
      '   ・新增單回合峰值追蹤(peakRoundDmg / peakRoundHeal)寫入排行榜',
      '   ・statTrack 新增 healSources 明細收集',
      '   ・為「英雄表現排行榜(技能平衡檢視)」鋪路,後台 UI 下版上線'
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.11.10(2026-05-27)— 管理員後台強化 + BUG 修補大集合
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.11.10',
    date: '2026-05-27',
    brief: [
      '🔒 管理員密技完全隔離(學生看不到任何管理員痕跡)',
      '   ・F8/F9/Shift+F10 對學生「完全沒反應」(連 console 都靜默)',
      '   ・F12 Network 也看不到 admin_panel.js 請求',
      '   ・全域 console wrapper 攔截敏感關鍵字 → 對非管理員靜默',
      '     (仍進 ring buffer 給 BUG 回報用,管理員看得到完整紀錄)',
      '',
      '⚔ 維蘇威火山龍王 v3.11.7 修補套餐(共 5 項 + HP 考核機制)',
      '   ・11 回合強制崩毀整套重構,陰陽師「四聖降臨」4 段拆解動畫',
      '   ・朱雀(火)/青龍(水) 召喚回合擴大,debuff 延到爆發結束才上',
      '   ・青龍追擊明確標 element/elem=water,避免被火免疫吃掉',
      '',
      '🐛 黑暗球解鎖英雄修補(三隻學生反映「沒真的解鎖」)',
      '   ・advSaveUnlockedHero 五重補強:',
      '     寫 _uid 標記 / 立即雲端同步 / 5 秒重試兜底 / 即時刷新圖鑑 / log 詳細紀錄',
      '   ・新增解鎖紀錄系統 _heroUnlockHistory(雲端 + localStorage)',
      '     8 個解鎖路徑加 source 標記,老師可查證學生回報真假',
      '',
      '🏆 管理員打的成績不列入世界 BOSS / 小博士排行榜',
      '   ・寫入端 + 顯示端雙重守門',
      '   ・後台新增 _adminCleanMyOwnLeaderboardEntries / _adminCleanMyOwnWeeklyQuiz',
      '     一鍵清除歷史殘留管理員測試資料',
      '',
      '🛠 新增管理員工具:_adminGrantHeroByEmail',
      '   ・補發英雄走 _fbCompensatePlayer 的 union 邏輯',
      '   ・既有英雄等級/培養完全保留,只 union 新英雄',
      '   ・執行時印「補發前/後 三槽 diff 對照表」,異常立刻看出來',
      '',
      '⚙ 多項雲端存檔保護加強(雙槽/三槽救援、健康度守門)'
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.11.0(2026-05-26)— 大版整合(原 v3.10.15~19)
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.11.0',
    date: '2026-05-26',
    brief: [
      '🐉 世界 BOSS 排行榜機制全面升級',
      '   ・⏰ 每日場次重置時間從台灣午夜 00:00 改為 上午 08:00',
      '   ・🕒 排行榜每筆顯示「最近一場時間 + MVP 英雄/等級/傷害」',
      '   ・📜 學生自己的隊伍可點「查看我每一場」展開歷史(最近 10 場)',
      '   ・🛠 管理員後台「查看明細」內每隊新增「展開每場」按鈕,可單獨刪除異常傷害',
      '   ・🎟 刪除某場後該隊員「今日場次」自動 -1(可重打)',
      '   ・🔄 BOSS 從休戰切到開放(新一輪)時,HP + 排行榜同步重置',
      '   ・💰 排名獎勵維持暫不發放(等所有 BUG 修完)',
      '',
      '⚔ 多英雄技能調整',
      '   ・🏀 籃球隊員爆發「絕殺灌籃」400% → 750% + 必中 + 維持無視有利',
      '   ・🩸 暗魔將·血 S1「血劍·防」消耗 6→5,減傷 70%→Lv10 MAX 88%(每級 +2%)',
      '       取消 Lv5 / Lv10 舊方級進階,改為純減傷成長',
      '   ・💃 舞者 S2「魅惑之舞」重新設計:1 名目標強力魅惑 2 回合',
      '       (舊版選單操控對方使用技能,新版直接給強力魅惑,不可免疫/解除)',
      '',
      '🐛 重要 BUG 修補',
      '   ・美人魚‧角角 S1「水花」彈射打到友方的嚴重 BUG 已修補',
      '     (原本用目標陣營算對手,導致彈射打友軍,改用施法者陣營)',
      '',
      '🈵 狀態 / buff 中文化大補(老師回報「面具/燃燒/恐懼是英文」)',
      '   ・status 補:燃燒、恐懼、悲傷面具、失明、緩速、嘲諷、',
      '     治療減半、狀態免疫、控制免疫',
      '   ・buff 補:快樂面具、魔術免疫、攻擊+、速度+、護盾、無敵、超頻、反轉領域',
      '   ・連帶補 buff icon 邊框視覺類別(避免 fallback 變灰色)',
      '',
      '📖 圖鑑與 UI 微調',
      '   ・5 隻學生設計英雄(鳳凰、操偶師、菇女、小丑、美人魚)英雄誌大幅精簡',
      '     從 230-310 字降到 86-99 字,跟其他學生英雄風格一致',
      '   ・技能 ? 按鈕展開的詳細說明視窗加寬(580px → 820px)',
      '     長技能說明不再超出畫面看不到後面'
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.10.14(2026-05-26)— 新英雄「美人魚‧角角」上線(3 年 1 班 采漩設計)
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.10.14',
    date: '2026-05-26',
    brief: [
      '🧜‍♀️ 新英雄上線:美人魚‧角角(3 年 1 班 采漩設計,LXPSGAME 第 68 號英雄)',
      '   ・能力 HP54/攻12/特18/速16;加入稀有英雄召喚池',
      '   ・3 年 1 班首位設計師,送旗幟徽章慶祝',
      '🎵 天賦「療癒之聲」:每回合自動全體治療 + 解燃燒',
      '   ・存活時每回合自己行動前自動以特技 40% 治療友方全體 HP',
      '   ・同時解除每位友方身上 1 個燃燒狀態(含強力燃燒)',
      '   ・每升 1 級治療量 +10%(Lv5 MAX = 特技 80% 全體治療)',
      '💧 S1「水花」(能量 4):特技 240% 水屬性傷害彈射 4 段',
      '   ・主目標 240% → HP% 最高其他敵人依序 120% → 60% → 30%',
      '   ・所有受傷目標附加「濕潤」狀態 2 回合(冰凍/麻痺機率 +50%)',
      '   ・每升 1 級主傷害 +5%(彈射 4 段同比例升)',
      '🏹 S2「水箭之雨」(能量 5):特技 40% 對敵方全體 3 次連射',
      '   ・水箭如降雨般覆蓋全場,適合搭配 S1 與爆發追擊',
      '   ・每升 1 級傷害 +5%(Lv5 MAX = 65%/次)',
      '🎼 爆發「百萬水箭共鳴曲」:百萬支水箭 10 次隨機襲擊 + 全體解燃燒 + 2 回合火免疫',
      '   ・特技 80% × 10 次完全隨機水屬性傷害(可能集中於同一目標)',
      '   ・消除友方所有「燃燒」與「強力燃燒」狀態',
      '   ・全體友方獲得「水之祝禱」2 回合:完全免疫火屬性傷害 + 無法被附加燃燒',
      '   ・每升 1 級傷害 +10%;Lv5 MAX 額外:免疫火焰回合數 +1(3 回合)'
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.10.13(2026-05-26)— 世界 BOSS 每日場次限制改為「讀排行榜判定」
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.10.13',
    date: '2026-05-26',
    brief: [
      '🛡️ 修補:同學換裝置/換瀏覽器/清快取可繞過世界 BOSS 每日 2 場限制的 BUG',
      '   ・舊版用 localStorage + 雲端 wbDailyEntries 雙寫計數,但「換裝置/PWA vs 網頁版/清快取」都會繞過',
      '   ・新版直接讀排行榜 battleHistory 判定今日場次,單一雲端來源不可繞',
      '🎯 新計次規則:玩家「實際造成傷害並上榜」才算 1 場(更友善)',
      '   ・進房沒打就退場、戰鬥途中網路斷線、被秒殺 0 傷害 → 都不算次數',
      '   ・跨過台灣午夜 00:00 自動重置',
      '👑 管理員一視同仁:老師你也受限,需要不受限請走後台或 console',
      '🛠️ 後台「6. 世界 BOSS 排行榜管理」新增「個別玩家今日場次處理」工具',
      '   ・🔍 查詢:輸入 email 看玩家今日上榜場次 + MVP + 傷害明細',
      '   ・🗑️ 重置:整筆 teamKey 砍掉(連帶其他隊友歷史一起清,簡單不漏)',
      '   ・console API 仍可用:_adminPeekWbDailyByEmail / _adminResetWbDailyByEmail / _myResetWbDailyToday',
      '🧹 廢棄舊模組:_wbDailyLimit 核心 + 雲端 wbDailyEntries 欄位 + lxps_wb_daily_entries_v1 localStorage 全部不再使用'
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.10.12(2026-05-26)— 新英雄「小丑」上線(5 年 1 班 林同學設計)
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.10.12',
    date: '2026-05-26',
    brief: [
      '🤡 新英雄上線:小丑(5 年 1 班 林同學設計,LXPSGAME 第 67 號英雄)',
      '   ・能力 HP59/攻12/特14/速15;加入稀有英雄召喚池',
      '   ・5 年 1 班首位設計師,送旗幟徽章慶祝',
      '🎭 天賦「小丑面具」:小丑自己行動前自動疊面具',
      '   ・自身堆 1 層「快樂小丑面具」(自身造成傷害 +5%/層,最多 5 層 = +25%)',
      '   ・敵方隨機 1 人堆 1 層「悲傷小丑面具」(該對手受傷 +5%/層,最多 5 層 = +25%)',
      '   ・受傷時 30% 機率掉 1 層,每升 1 級 -5% 機率(MAX 5%,面具幾乎永久)',
      '🎆 S1「恐怖禮炮」(能量 3):特技 180% 火屬性傷害 + 燃燒 2T + 60% 機率「恐懼」2T',
      '   ・恐懼狀態:目標仍能行動,但所有會造成傷害的技能/普攻完全失效(可治療/buff)',
      '🔨 S2「魔術大槌」(能量 4):特技 300% 對單體 + 自身 1 回合「魔術免疫」',
      '   ・魔術免疫:完全免疫所有傷害(必中/固定/DoT 都擋)+ 免疫所有不利狀態附加',
      '🃏 爆發「致命笑氣罐」:特技 550% 必中無視有利(對 BOSS ×150% = 825%)',
      '   ・引爆場上所有「悲傷小丑面具」每層 40 固定傷害,受傷者強力暈眩 1T',
      '   ・面具堆得越多 → 爆發越強,是控場與單體爆發兼備的犯罪天才'
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.10.10(2026-05-26)— 凍結戰鬥保護系統(取代 v3.5.69 兩段式關閉)
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.10.10',
    date: '2026-05-26',
    brief: [
      '🛡️ 重大設計:儲存戰鬥 = 凍結時光膠囊,打完前不能做任何事',
      '   ・按 ⏸ 存檔後,不再回關卡頁,改顯示「請手動關閉遊戲」鎖定頁',
      '   ・原因:升級/買至寶/抽召喚都會讓戰鬥前後不一致,等於作弊還容易崩',
      '🔒 全域守門:14 個入口被鎖(商店/召喚/英雄/至寶/圖鑑/獎章/更新日誌/背包/陣容...)',
      '   ・進入任何被鎖的入口會跳「請先處理未完成戰鬥」攔截彈窗',
      '⚔ 強制續戰模態:下次登入偵測到未完成戰鬥,彈窗無法用 ESC 或點背景關掉',
      '   ・必須二擇一:✅ 繼續戰鬥  或  🗑 放棄(二次確認)',
      '🟥 關卡頁紅色橫幅:有未完成戰鬥時,頂部固定顯示「繼續戰鬥 / 放棄」按鈕'
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.10.9(2026-05-26)— 陰陽師朱雀/青龍大幅強化
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.10.9',
    date: '2026-05-26',
    brief: [
      '☯️ 陰陽師 S1/S2 重大改造,從「純召喚」變「全體傷害+召喚+debuff」',
      '🐦‍🔥 朱雀召喚(能量 5→7):召喚時先用特技 70% 全體火屬性傷害 + 附「治療減半」2 回合,再召喚朱雀式神',
      '🐉 青龍召喚(能量 5→7):召喚時先用特技 70% 全體水屬性傷害 + 附「受傷+50%」2 回合,再召喚青龍式神',
      '📈 升級加成(每升 1 級 +3%):',
      '   ・技能傷害:70% → 97%(Lv10)',
      '   ・式神 HP:100% → 127%(Lv10)',
      '   ・式神追擊/治療:50% → 77%(Lv10)',
      '⚠️ 舊版「Lv5+ HP +20%/級、Lv9 消耗 -1」全部取消'
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.10.8(2026-05-26)— 更新日誌載入機制大修
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.10.8',
    date: '2026-05-26',
    brief: [
      '🔧 修補「更新日誌暫時無法載入」的長期問題',
      '   ・載入失敗時,現在會顯示精準錯誤類型(語法錯誤 / 主機 404 / 逾時 / 內容空)',
      '   ・SyntaxError 偵測:檔案語法錯誤可秒判,不必再等 8 秒',
      '   ・逾時保護從 8 秒放寬到 15 秒,慢網路也能順利載入',
      '   ・破快取參數現在跟主程式版本走,版本一升就自動刷新所有玩家的 changelog 快取'
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.10.7(2026-05-26)— 召喚物 HP 條位置
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.10.7',
    date: '2026-05-26',
    brief: [
      '🎨 召喚物 HP 條搬到「攻特速」上方,不再蓋住卡牌角色的臉',
      '   ・操偶師「操偶/城牆」HP 條',
      '   ・陰陽師三式神(玄武白虎 → 青龍 → 朱雀,由下往上堆)'
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.10.6(2026-05-26)— 多英雄技能平衡 + 戰鬥淨化
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.10.6',
    date: '2026-05-26',
    brief: [
      '⚔️ 多位英雄升級加成大幅強化(每升 1 級 +5%)',
      '   ・武士迴避反擊:Lv1=150% → Lv9=190%',
      '   ・聖騎士神聖鎚擊:Lv1 基礎 → Lv9 命中率 +40%',
      '   ・光法師極限閃光:Lv5 追加 1 目標(共 4)/ Lv9 能量消耗 -1',
      '🗡️ 俠盜飛梭追加掉落率 +20%(乘算,最多疊 2 層)',
      '🛡️ 戰鬥開始重置神偷掉落率加成、清除陰陽師式神資料(避免跨場殘留)'
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.10.5(2026-05-26)— 至寶面板強化
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.10.5',
    date: '2026-05-26',
    brief: [
      '📊 把至寶 specialEffects 的百分比加成計入英雄面板顯示'
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.10.4(2026-05-26)— 多項 BUG 修補
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.10.4',
    date: '2026-05-26',
    brief: [
      '🐛 修補「套用後至寶仍顯示舊數量」的 BUG',
      '🐛 修補「設定失敗,請檢查網路」誤判',
      '🐛 修補續戰提示永遠不彈的 BUG'
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.10.3(2026-05-26)— PWA 裝置信任機制
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.10.3',
    date: '2026-05-26',
    brief: [
      '📱 PWA 安裝版新增「裝置信任」機制',
      '   ・主動登入完成後,5 秒提示是否「信任此裝置」',
      '   ・被信任的裝置下次開遊戲,可自動登入(會顯示 3 秒倒數確認卡)',
      '   ・倒數內可隨時取消;不信任的裝置會走原本攔截邏輯',
      '🛡️ 後台新增「撤銷信任裝置」工具'
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.10.2(2026-05-26)— 歡迎彈窗 + 設計師英雄補發
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.10.2',
    date: '2026-05-26',
    brief: [
      '🎉 設計師英雄歡迎彈窗只彈一次(雲端優先,跨裝置生效)',
      '🛠️ 後台「設計師英雄批次補發」一鍵工具'
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.10.1(2026-05-26)— 共用平板防護
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.10.1',
    date: '2026-05-26',
    brief: [
      '🛡️ 禁止自動登入(共用平板防護)',
      '   ・偵測到 Firebase 自動還原 token 時主動攔截',
      '   ・標記「玩家主動發起登入」讓 onAuth 區分自動 vs 主動',
      '   ・PWA 安裝版有「裝置信任」放行通道(見 v3.10.3)'
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.10.0(2026-05-26)— 世界 BOSS 戰績歷史 + 機會式清掃
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.10.0',
    date: '2026-05-26',
    brief: [
      '🏆 世界 BOSS 戰績歷史(最新 10 場)',
      '   ・記錄每場時間、總傷害、本場 MVP(最高傷害英雄)',
      '🧹 每小時主動清除空房(機會式清掃)',
      '   ・搶鎖 transaction 確保只有一人清掃,不撞 Firestore 配額'
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.8.6(2026-05-26)— 速度迴避全面擴展 + BUG 修補
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.8.6',
    date: '2026-05-26',
    emoji: '🎯',
    brief: [
      '✨【重大平衡調整】速度迴避擴及 S1/S2/天賦技能 — 速度屬性變得更有戰術價值',
      '   ・原本只有普攻才受速度差迴避影響,現在所有技能傷害都會受影響',
      '   ・例外:爆發技能、反彈傷害、明標必中的技能仍維持必中',
      '   ・慢速英雄打高速對手時,S1/S2 也會偶爾 MISS,請留意調整隊伍速度配置',
      '⚔️ 劍士「刀背擊」重新設計 — 升級效果更有意義',
      '   ・Lv.1 基礎 100% 命中(受速度迴避影響);Lv.2~Lv.9 每級抵消對手迴避 5%',
      '   ・Lv.10 MAX:必中 + 無視有利狀態(舊版 Lv.9 能量消耗 -1 已取消)',
      '🐛 修補:選黑暗球路線後按「套用預存陣容」,陣容跑成九尾貓 BOSS 戰',
      '🐛 修補:系統維修模式開啟時,管理員自己被鎖在登入頁外的死鎖問題',
      '🎨 木柵選擇挑戰路線 UI:三條路線並排顯示,不再有第三張卡掉到下方'
    ]
  }

  // ════════════════════════════════════════════════════════════════════
  // 老師若有更舊的 changelog 條目(v3.7.x / v3.6.x / v3.5.x ...),
  // 在這裡接續新增即可。記得每個條目用逗號分隔,最後一個不加逗號。
  // 範例:
  //   ,
  //   {
  //     ver: 'v3.7.11',
  //     date: '2026-05-XX',
  //     brief: [ '...' ]
  //   }
  // ════════════════════════════════════════════════════════════════════

];

// 通知 index.html 載入完成(可選,但建議保留)
try {
  if (typeof window._onChangelogReady === 'function') {
    window._onChangelogReady();
  }
} catch (e) { /* ignore */ }


// ════════════════════════════════════════════════════════════════════════
// ⏸ 尚未上線的「草稿」版本條目(2026-05-29 同步時由主陣列移到這裡暫存)
//   原因:線上實際最新版是 v3.11.24 / v3.11.25(玩家畫面右下角顯示 v3.11.24)。
//         以下 v3.11.31 / 30 / 27 的功能(編組頁「圖鑑整備」按鈕、網路駭客 #71、
//         幽幽 #70)尚【未】實際部署到線上,所以先放進這個「不會被顯示」的草稿陣列,
//         避免玩家在 v3.11.25 卻看到 v3.11.31 的更新內容。
//   ★ 等這些功能真的部署上線後:把對應的物件從本陣列「剪下」,貼回上方
//      window.GAME_CHANGELOG 陣列的「最上方」,即可恢復顯示(記得同步改檔頭版本號)。
//   ★ changelog 顯示程式只讀 window.GAME_CHANGELOG,不會讀這個陣列。
// ════════════════════════════════════════════════════════════════════════
window.GAME_CHANGELOG_DRAFT_UNRELEASED = [
  // ════════════════════════════════════════════════════════════════════
  // v3.11.31(2026-05-29)— 編組頁「圖鑑整備」按鈕 + 裝置信任小卡只在首頁
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.11.31',
    date: '2026-05-29',
    brief: [
      '📖 隊伍編組右側預覽:名稱旁新增「圖鑑整備」按鈕!',
      '   ・直接打開該英雄的圖鑑頁,進行至寶切換、能力加點、技能升級',
      '   ・關閉圖鑑後一鍵回到編組頁,不用重新邀約隊員',
      '',
      '🔧 右下角「已信任此裝置」小卡改為只在首頁顯示',
      '   ・進入關卡、編組、圖鑑、商店等畫面時自動隱藏',
      '   ・避免擋住右下角的功能按鈕,回到首頁時自動恢復',
    ],
    items: [
      '編組預覽(focusHero)名稱右側加「📖 圖鑑整備」按鈕 → _openHeroCodexFromTeam(name,idx):開 hero-page-overlay 後 openHeroDetail(name),設 _heroDetailReturnToTeam 旗標。',
      'closeHeroDetail 偵測旗標:收掉 hero-page-overlay + 重新 focusHero(idx,name) 套用剛剛的至寶/加點/技能變更,不觸發邀約;BGM 用 bgmEnsureSceneBgm 還原。',
      '裝置信任小卡 _updateTrustBadge 加 _isOnHomepageForBadge() 守門:任一主要 overlay 可見(adventure/hero-pick/hero-page/equip/shop/taiwan-map…)或戰鬥中(G.p2.length)即不顯示。',
      'uid 輪詢 interval 加首頁狀態追蹤:離開首頁立即移除 badge、回首頁重新渲染。',
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.11.30(2026-05-29)— 新英雄「網路駭客」(第 71 號,5 年 1 班 高同學設計)
  //   + 護盾值改為 HP 條藍色覆蓋層呈現 + 火爆女技能說明對齊
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.11.30',
    date: '2026-05-29',
    brief: [
      '🤖 新英雄登場:「網路駭客」(5 年 1 班 高同學設計,第 71 號英雄)!',
      '   ・玩遊戲玩膩了就在網路上搞高端惡作劇的程式天才',
      '   ・加入水晶召喚池(學生設計英雄)',
      '',
      '🐛 天賦「BUG 疊加」',
      '   ・開場竊取對手最高攻擊 + 最高特技值加到自己(持續 4 回合)',
      '   ・這份加成無法被消除、奪取或交換',
      '   ・每個新回合對隨機對手散播亂碼(附加隨機不利狀態)',
      '',
      '🔥 S1「攻陷防火牆」',
      '   ・消除對手全部有利狀態,每消除一個就獲得 20 護盾(最多 5 層)',
      '',
      '🐛 S2「強化 BUG」',
      '   ・把全體對手身上隨機 3 個不利狀態升級為強力版並延長 2 回合',
      '',
      '💻 爆發「超極密檔案 GET!」',
      '   ・奪取對手有利狀態(強力優先,無視不可奪取規則)',
      '   ・特技 150% 連續狙擊 3 次(從血量最低打到最高)',
      '   ・把造成的傷害轉化為治療,回復我方 3 次',
      '',
      '🛡 全新護盾呈現',
      '   ・護盾值改成顯示在 HP 條上的「藍色區塊」(靠左)',
      '   ・例:100 HP + 50 護盾 → 顯示 100+50/100,藍條佔 50%',
      '   ・受傷時先扣藍色護盾,藍條即時縮短,打光才扣綠色 HP',
    ],
    items: [
      '第 71 號英雄「網路駭客」,能力 58/11/15/16(總和 100),5 年 1 班 高同學設計。',
      '天賦「BUG 疊加」:戰開竊取對手最高攻+最高特(平衡上限 5+英雄等級),持續 4T(+1/級,不可消除/奪取/交換);每回合對隨機 N 名對手(1+級,上限 4)各附 1 個隨機不利狀態。到期由 tickStatus 還原 atk/sp。',
      'S1「攻陷防火牆」c5:clearGoodBuffs 消除全敵有利狀態,每消除 1 個 +20 護盾(上限 5 層;每級 +5/層),用 numeric h.shield 欄位(doDmg 會吸收)。',
      'S2「強化 BUG」c4:全敵隨機 3 個不利狀態升 _strong(不可淨化)並延長 2T;升至 4/7/10 級各 +1 升級數量。',
      '爆發「超極密檔案 GET!」:奪增益(強力優先,基礎 1 +1/級上限 5)→ 特技 150%(每級 ×1.10)三連 HP 低→高 → 傷害總和 /3 治療我方 3 次(HP 低優先)。傷害走 doDmg,世界 BOSS 5000 上限自動生效。',
      '護盾 HP 條呈現:renderCard 在綠色 HP 上疊藍色 .card-hp-shield2(width=護盾/最大HP),顯示護盾 = numeric h.shield + bigshield._hp(兩者皆 doDmg 會消費)。doDmg 扣盾後即時 renderCard,藍條同步縮短。CSS 同時寫進 main.css 與 index.html 內嵌 style(快取保險)。',
      '火爆女技能說明對齊:確認 S1 一擊必殺 / S2 超級射線 / 爆發 三刀射擊(玩家版+AI 版皆已實作),HERO_LORE 補上原本漏列的 S2「超級射線」。',
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // v3.11.27(2026-05-28)— 新英雄「幽幽」(第 70 號,5 年 4 班 高同學設計)
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.11.27',
    date: '2026-05-28',
    brief: [
      '👻 新英雄登場:「幽幽」(5 年 4 班 高同學設計,第 70 號英雄)!',
      '   ・神秘又可愛的幽靈,惡鬼之軀卻有顆柔軟的心',
      '   ・加入水晶召喚池(學生設計英雄)',
      '',
      '🌫 天賦「幽魂體質」',
      '   ・用「特技值」代替攻擊出手,且免疫所有普通攻擊',
      '   ・不怕暗:受到暗屬性傷害減少(隨天賦等級最多 -50%)',
      '   ・怕光:受到光屬性傷害增加(隨天賦等級弱點漸減)',
      '',
      '🦷 S1「惡鬼撲食」',
      '   ・一口把對手咬到只剩一半血,並標記「等吞食」3 回合',
      '   ・對 BOSS/菁英改用特技 300% 造成傷害',
      '   ・吞食擊殺帶標記的對手 → 隊友回血,滿血溢出再轉成護盾',
      '',
      '🌑 S2「暗行」',
      '   ・潛入暗影 2 回合:完全免疫所有傷害與不利狀態',
      '   ・期間出手必中,而且傷害 +100%',
      '',
      '👻 爆發「惡夢遊魂」',
      '   ・全體敵人陷入「惡夢」:受到的傷害翻倍(隨等級更高)',
      '   ・全體隊友化為「遊魂」:受到的傷害大幅降低',
      '   ・兩個狀態都無法被消除、奪取或交換',
    ],
    items: [
      '第 70 號英雄「幽幽」,能力 55/0/20/25(總和 100),5 年 4 班第 8 位設計師(高同學)。',
      '天賦「幽魂體質」:普攻改用特技值 + 免疫普攻;受暗 -30%(每級 -5%,Lv4 -50%)、受光 +30%(每級增幅 -5%)。',
      'S1「惡鬼撲食」c4:非 BOSS 扣至剩 50% HP;BOSS/菁英改特技 300%(走 5000 上限保護)。附「等吞食」3T,吞食擊殺者回血(目標最大 HP 100%)溢出轉護盾(上限自身 HP×100%,每級 +5%)。',
      'S2「暗行」c5:自身 2T(每級 +1)免疫所有傷害與不利,期間必中且傷害 +100%(每級 +5%)。',
      '爆發「惡夢遊魂」:全敵惡夢 2T(受傷 ×2.0~2.8)、全友遊魂 2T(受傷 -70~90%),兩狀態不可消除/奪取/交換。惡夢倍率乘算且在 BOSS 5000 上限前套用,不破上限。',
      '友傷防呆:S1 玩家版鎖敵方/AI 版用引擎敵方目標;吞食回血僅幽幽同陣營擊殺者觸發;惡夢/遊魂不影響治療。'
    ]
  },
];