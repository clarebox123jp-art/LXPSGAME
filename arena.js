// ════════════════════════════════════════════════════════════════════════
//  arena.js  —  英雄鬥技場核心配置與邏輯
//  建立日:2026-06-02   /   v3.13.15(2026-06-02)雲端陣容池系統
//  最後更新:2026-07-24  /  v4.88.0 — 傷害明細 by 陣列補 m(最大單次傷害),
//                                     供 GM「技能傷害排行(全校)」判斷過強技能/BUG。
//                                     頂層欄位不變 → firestore.rules 零改動。
//
//  ★ 設計鐵則(老師指定):
//    1. 完全獨立 — 絕對不影響原有冒險/World BOSS/Taiwan 任何功能
//    2. 鬥技場 LV1 公平戰 — 無投資/無至寶/技能LV1/天賦LV1/爆發LV1
//    3. 普攻、技能、爆發傷害全保持原值(信任現有平衡 + 守衛反制機制)
//    4. 只調整三張固定值物品卡(攻擊型),命名為「(競技用)」明示給學生
//    5. 4v4、答題沿用冒險、30秒搶答、全題庫混合隨機
//    6. 每日 2 場上限、敵隊每日 3 次刷新
//    7. 10 回合上限,結算順序:存活數 > HP%總和 > 平手
//    8. 鬥技之證貨幣:勝3 / 平2 / 敗1,連敗保護 = 敗場仍給 1
//    9. 排名獎勵暫不啟用,顯示「未來鬥技場確認沒有嚴重 BUG 就會開放」
//   10. 鬥技場兌換商店嵌入既有不可思議超商(下版本實作商品內容)
//
//  ★ v3.13.15(2026-06-02)雲端陣容池系統大改動(老師指定):
//   11. 玩家陣容上雲規則:預設槽 1-5 修改自動上雲對應槽 + 鬥技場獲勝自動存「第6槽」
//   12. 抽取規則:混合 70% 雲端玩家池、30% 系統 5 套(玩家池空才100%系統)
//   13. 防呆:排除自己 uid、>30 天過期、元素全空、英雄名非法
//   14. 隊名:玩家用「鬥技場專屬詞庫」(形容詞+名詞,與暱稱詞庫區隔)。系統 5 套加 [鬥技場預設] 前綴
//   15. 系統 5 套可由 GM 後台改名與調整成員(從 Firestore arenaSystemTeams 讀)
//   16. 答題:鬥技場也每回合開場出題(移除 _advShouldStartRoundQuiz 的 !_adventureMode 攔截)
// ════════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  // ──────────────────────────────────────────────────────────────────
  //  ⚙️  鬥技場核心配置
  // ──────────────────────────────────────────────────────────────────
  const ARENA_CONFIG = {
    VERSION: 'v3.15.60',   // ★ v3.15.60(2026-06-20)— 結算後呼叫 window._checkMedalArena(鬥技場成就:首勝/10·30·50累積勝/5連勝)｜v3.13.72 鬥技場累積勝敗 winsLifetime/lossesLifetime(只增不減,仿 zhengLifetimeTotal)
                           //   前版 v3.13.31 — GM 戰鬥記錄審核 API:刪除 + 補償
    TEAM_SIZE: 4,                  // 4v4
    FIXED_LEVEL: 1,                // LV1 公平戰
    QUIZ_TIME: 30,                 // 30 秒搶答(沿用既有冒險模式設定)
    MAX_ROUNDS: 10,                // 戰鬥 10 回合上限
    DAILY_BATTLE_LIMIT: 3,         // ★ v3.13.21 每日場次上限(2026-06-02 老師裁示 2→3)
    DAILY_REFRESH_LIMIT: 3,        // 敵隊每日刷新次數

    // 鬥技之證貨幣
    REWARD_WIN: 3,                 // 勝場 +3
    REWARD_DRAW: 2,                // 平手 +2
    REWARD_LOSE: 1,                // 敗場 +1(連敗保護:每場都給)

    // 排名功能旗標
    RANK_REWARD_ENABLED: false,    // 暫不啟用排名獎勵
    RANK_PLACEHOLDER_TEXT: '🏆 鬥技場排名獎勵\n\n未來鬥技場確認沒有嚴重 BUG 就會開放排名獎勵!\n敬請期待 ⚖️',

    // ★ v3.13.15 — 雲端陣容池參數
    CLOUD_POOL_RATIO: 0.7,         // 70% 抽雲端玩家池、30% 抽系統 5 套
    CLOUD_TEAM_TTL_DAYS: 30,       // 玩家陣容過期天數(超過就不抽)
    CLOUD_FETCH_COOLDOWN_MS: 60000,// 雲端池快取冷卻(60 秒內不重抓)
    PLAYER_SLOT_COUNT: 5,          // 玩家預設陣容槽位數(欄位 1-5)
    AUTO_WIN_SLOT_KEY: 'auto_win', // 第 6 槽:自動勝利槽(每次勝利覆蓋)
  };
  window.ARENA_CONFIG = ARENA_CONFIG;

  // ──────────────────────────────────────────────────────────────────
  //  🃏  物品卡鬥技場版本(老師指定數值)
  //  ──── 影響範圍:僅限鬥技場(_adventureMode === false)
  // ──────────────────────────────────────────────────────────────────
  //  原版 vs 鬥技場版對照:
  //   飛鏢:       賣2/耗2/傷40  →  飛鏢(競技用):賣1/耗2/傷10
  //   奪命之箭:   賣5/耗5/傷100 →  奪命之箭(競技用):賣3/耗5/傷30
  //   煉金術炸彈: 賣7/耗7/傷80  →  煉金術炸彈(競技用):賣6/耗7/傷15
  const ARENA_ITEM_OVERRIDES = {
    '飛鏢': {
      n: '飛鏢(競技用)',
      sell: 1,
      dmg: 10,
      d: '使1名對手受到10點傷害(鬥技場限定數值)',
    },
    '奪命之箭': {
      n: '奪命之箭(競技用)',
      sell: 3,
      dmg: 30,
      d: '使1名對手受到30點傷害(鬥技場限定數值)',
    },
    '煉金術炸彈': {
      n: '煉金術炸彈(競技用)',
      sell: 6,
      dmg: 15,
      d: '使全體對手受到15點傷害(鬥技場限定數值)',
    },
  };
  window.ARENA_ITEM_OVERRIDES = ARENA_ITEM_OVERRIDES;

  // 工具:套用鬥技場物品 override(用在 buildDeck 抽卡時)
  // 接收原始 item,鬥技場時回傳新物件;非鬥技場原物回傳
  window._arenaTryItemOverride = function(it) {
    try {
      // 只在鬥技場(非冒險模式)套用
      if (typeof _adventureMode !== 'undefined' && _adventureMode) return it;
      if (!it || !it.n) return it;
      const ov = ARENA_ITEM_OVERRIDES[it.n];
      if (!ov) return it;
      return Object.assign({}, it, ov, { _arenaItem: true, _origName: it.n });
    } catch (e) {
      console.warn('[arena] _arenaTryItemOverride 例外:', e);
      return it;
    }
  };

  // ──────────────────────────────────────────────────────────────────
  //  🤖  系統 AI NPC 預設隊伍配方(GM 預設,可由 admin_panel 改名與成員)
  //  ──── 5 套挑戰性類型隊伍,玩家看到「[GM]」前綴即知是系統陣容
  //  ──── v3.13.15:這 5 套變成「系統保底池」,真正抽取以雲端玩家池為主(70/30)
  //  ──── GM 可由 admin_panel 載入 Firestore arenaSystemTeams 文件覆蓋此預設
  //  ──── ★ v3.13.27(2026-06-03)— 老師指定組合更新:
  //         第 1 套:神殿守護隊(聖騎/占星/天神宙斯/祭司)
  //         第 2 套:雷霆控場隊(雷法/守衛/玉藻前/救醫馬)
  //         第 3 套:舞動陣勢隊(舞者/直笛/吟遊/弦樂)
  //         第 4 套:快攻刺客隊(刺客/田徑/武器精靈/神槍手)
  //         第 5 套:元素法團隊(火法/冰法/雷法/菇女)
  // ──────────────────────────────────────────────────────────────────
  const ARENA_AI_TEAMS_DEFAULT = [
    {
      id: 'sys_1',
      name: '[鬥技場預設] 神殿守護隊',
      desc: '聖騎士護全隊、占星師控場、天神宙斯雷壓、祭司治療',
      heroes: ['聖騎士', '占星師', '天神宙斯', '祭司'],
      elements: ['light', 'dark', 'wind', 'grass'],
      strategy: 'tank_control_heal',
    },
    {
      id: 'sys_2',
      name: '[鬥技場預設] 雷霆控場隊',
      desc: '雷法師爆控、守衛抗暴、玉藻前妖術、救醫馬支援',
      heroes: ['雷法師', '守衛', '玉藻前', '救醫馬'],
      elements: ['wind', 'light', 'fire', 'grass'],
      strategy: 'control_burst',
    },
    {
      id: 'sys_3',
      name: '[鬥技場預設] 舞動陣勢隊',
      desc: '舞者強化全隊、直笛吟遊雙樂手、弦樂團員爆發',
      heroes: ['舞者', '直笛團員', '吟遊詩人', '弦樂團員'],
      elements: ['earth', 'wind', 'grass', 'light'],
      strategy: 'buff_combo',
    },
    {
      id: 'sys_4',
      name: '[鬥技場預設] 快攻刺客隊',
      desc: '刺客出血、田徑速攻、武器精靈強化、神槍手穿盾',
      heroes: ['刺客', '田徑隊員', '武器精靈', '神槍手'],
      elements: ['dark', 'wind', 'light', 'fire'],
      strategy: 'speed_dmg',
    },
    {
      id: 'sys_5',
      name: '[鬥技場預設] 元素法團隊',
      desc: '火法 + 冰法 + 雷法三系 AoE 壓場、菇女穩定治療控場',
      heroes: ['火法師', '冰法師', '雷法師', '菇女'],
      elements: ['fire', 'water', 'wind', 'grass'],
      strategy: 'aoe_storm',
    },
  ];
  // 當前生效的系統陣容(可被 GM 從 Firestore 覆蓋)
  let _ARENA_AI_TEAMS = JSON.parse(JSON.stringify(ARENA_AI_TEAMS_DEFAULT));
  window.ARENA_AI_TEAMS_DEFAULT = ARENA_AI_TEAMS_DEFAULT;
  Object.defineProperty(window, 'ARENA_AI_TEAMS', {
    configurable: true,
    get(){ return _ARENA_AI_TEAMS; },
    set(v){ if(Array.isArray(v) && v.length) _ARENA_AI_TEAMS = v; }
  });

  // GM 後台呼叫:覆蓋系統陣容(從 Firestore 讀來的 5 套)
  window._arenaApplySystemTeamsFromCloud = function(cloudTeams) {
    try {
      if (!Array.isArray(cloudTeams) || !cloudTeams.length) return false;
      const valid = cloudTeams.filter(t => t && t.name && Array.isArray(t.heroes) && t.heroes.length === 4);
      if (!valid.length) return false;
      _ARENA_AI_TEAMS = valid.slice(0, 5);
      // 補滿到 5 套(若雲端少於 5 套,用 default 補)
      while (_ARENA_AI_TEAMS.length < 5) {
        _ARENA_AI_TEAMS.push(JSON.parse(JSON.stringify(ARENA_AI_TEAMS_DEFAULT[_ARENA_AI_TEAMS.length])));
      }
      console.log('[arena] 已套用 Firestore 系統陣容,共 ' + _ARENA_AI_TEAMS.length + ' 套');
      return true;
    } catch (e) { console.warn('[arena] _arenaApplySystemTeamsFromCloud 例外:', e); return false; }
  };

  // ──────────────────────────────────────────────────────────────────
  //  📛  v3.13.15 — 鬥技場隊伍命名專用詞庫(與個人暱稱詞庫完全區隔)
  //  ──── 設計理念:
  //    暱稱詞庫(_NICK_ADJ/_NICK_NOUN):強調可愛、童趣、個人化
  //                                    例:「快樂的小狐狸」、「可愛的小兔子」
  //    隊名詞庫(本檔):強調氣勢、軍團、戰鬥感
  //                  例:「無敵的閃電軍團」、「狂暴的火焰戰旅」、「黃金的勝利之師」
  //  ──── 命名規則:形容詞 + 名詞,自動接「軍團/戰隊/之師/聯盟」等隊伍後綴感由名詞自帶
  // ──────────────────────────────────────────────────────────────────
  const ARENA_TEAM_NAME_ADJ = [
    // 氣勢系
    '無敵的','狂暴的','傳奇的','黃金的','璀璨的','銀色的','寒冰的','烈焰的',
    '雷霆的','疾風的','深淵的','聖光的','幽暗的','蒼穹的','深海的','大地的',
    // 戰術系
    '不敗的','百戰的','奇襲的','閃電的','沉默的','咆哮的','無形的','破軍的',
    '鋼鐵的','水晶的','黎明的','黃昏的','烈日的','寒月的','星辰的','彩虹的',
    // 趣味反差系(維持童趣讓低年級也有共鳴)
    '貪睡的','超萌的','搞怪的','活力的','神秘的','驕傲的','勇敢的','機智的',
    // 校園系
    '頂尖的','榮譽的','王牌的','金牌的','學霸的','風雲的','滿分的','學長的',
  ];
  const ARENA_TEAM_NAME_NOUN = [
    // 經典戰隊
    '軍團','戰隊','之師','聯盟','突擊隊','遠征軍','先鋒隊','禁衛隊',
    '騎士團','刺客集團','獵人聯隊','法師議會','弓兵營','戰士團','守護者','勇者隊',
    // 場景系
    '雷霆隊','烈焰隊','寒冰陣','疾風營','深淵團','聖光衛','黑暗會','破曉軍',
    '夜襲隊','晨曦旅','星辰會','彩虹軍','黃金衛','白銀盟','水晶教團','鋼鐵旅',
    // 帥氣系
    '勝利者','征服軍','王者隊','榮耀軍','傳說軍','英雄會','王牌組','冠軍隊',
    // 童趣/校園系
    '少年隊','超人組','英雄班','風雲幫','正義聯盟','奇蹟隊','美夢隊','希望軍',
    // 神話系
    '鳳凰之翼','蒼龍之爪','麒麟之師','玄武之盾','朱雀之焰','白虎之牙','青龍會','神龍隊',
  ];
  window.ARENA_TEAM_NAME_ADJ = ARENA_TEAM_NAME_ADJ;
  window.ARENA_TEAM_NAME_NOUN = ARENA_TEAM_NAME_NOUN;

  // 隨機生成隊名(用於「隨機取一個」按鈕、勝利自動上雲時的兜底名)
  window._arenaRandomTeamName = function() {
    try {
      const adj = ARENA_TEAM_NAME_ADJ[Math.floor(Math.random() * ARENA_TEAM_NAME_ADJ.length)];
      const noun = ARENA_TEAM_NAME_NOUN[Math.floor(Math.random() * ARENA_TEAM_NAME_NOUN.length)];
      return adj + noun;
    } catch (e) { return '神秘戰隊'; }
  };

  // 驗證隊名是否合法(必須是「形容詞 + 名詞」組合,不允許自由輸入)
  window._arenaIsTeamNameValid = function(name) {
    try {
      if (typeof name !== 'string' || !name) return false;
      for (const adj of ARENA_TEAM_NAME_ADJ) {
        if (name.startsWith(adj)) {
          const rest = name.slice(adj.length);
          if (ARENA_TEAM_NAME_NOUN.includes(rest)) return true;
        }
      }
      // 系統預設的 [鬥技場預設] 前綴也視為合法(讓 GM 改名時可保留)
      if (name.startsWith('[鬥技場預設]')) return true;
      return false;
    } catch (e) { return false; }
  };

  // ──────────────────────────────────────────────────────────────────
  //  ☁️  v3.13.15 — 雲端玩家陣容池系統
  //
  //  Firestore 結構:
  //    arenaTeams/{uid}
  //      ├─ uid, email, displayLabel, lastUpdate
  //      └─ slots: {
  //           "0": { name, heroes[4], elements[4], updatedAt, source:'preset' },
  //           "1": { ... },  ...  "4": { ... },
  //           "auto_win": { ..., source:'auto_win' }  // 第6槽:每次勝利覆蓋
  //         }
  //
  //  Firestore 規則(老師自行設定):
  //    arenaTeams/{uid}: read=true, write=(uid==request.auth.uid)
  //    arenaSystemTeams/main: read=true, write=(只有 GM 名單 uid 可寫)
  // ──────────────────────────────────────────────────────────────────

  // 工具:驗證一筆陣容是否合法(用於上雲前 + 抽取池子時的防呆)
  // ★ v3.13.27(2026-06-03) — 補齊三層黑名單(原本只擋 BOSS_NAMES 一層,造成
  //   BUG #1 木葉天狗冒出來):
  //     1. BOSS_NAMES(冒險所有 BOSS / 菁英 / 小怪 / 稀有怪 / 世界 BOSS)
  //     2. JAPAN_ARENA_EXCLUDE(日本菁英+小怪+稀有,但不含三妖怪英雄版)
  //     3. EVENT_ONLY_HEROES(活動限定:小力/幼兒園小孩/巫女)
  //   白名單:JAPAN_BOSS_HEROES(大天狗/酒吞童子/玉藻前)— 三妖怪英雄版可出現
  window._arenaIsTeamValid = function(team) {
    try {
      if (!team || !Array.isArray(team.heroes) || team.heroes.length !== 4) return false;
      if (typeof team.name !== 'string' || !team.name.trim()) return false;
      // 防呆 1:英雄名必須在 HERO_DB 內
      if (typeof HERO_DB === 'undefined') return false;
      for (const hname of team.heroes) {
        if (typeof hname !== 'string' || !HERO_DB[hname]) return false;
      }
      // 防呆 2:元素不可全空(允許部分為空,但至少一個有元素)
      if (Array.isArray(team.elements)) {
        const hasAnyElem = team.elements.some(e => e && typeof e === 'string');
        if (!hasAnyElem) return false;
      }
      // ★ v3.13.27 — 取得日本三妖怪英雄版白名單
      const _jpBossWL = (typeof JAPAN_BOSS_HEROES !== 'undefined' && JAPAN_BOSS_HEROES instanceof Set)
        ? JAPAN_BOSS_HEROES
        : (typeof window !== 'undefined' && window.JAPAN_BOSS_HEROES instanceof Set
            ? window.JAPAN_BOSS_HEROES : new Set());
      // 防呆 3:黑名單第 1 層 — BOSS_NAMES(三妖怪英雄版例外放行)
      const _bossArr = (typeof BOSS_NAMES !== 'undefined' && Array.isArray(BOSS_NAMES))
        ? BOSS_NAMES
        : (typeof window !== 'undefined' && Array.isArray(window.BOSS_NAMES)
            ? window.BOSS_NAMES : []);
      if (_bossArr.length) {
        for (const hname of team.heroes) {
          if (_jpBossWL.has(hname)) continue;
          if (_bossArr.indexOf(hname) >= 0) return false;
        }
      }
      // ★ v3.13.27 — 防呆 4:黑名單第 2 層 — JAPAN_ARENA_EXCLUDE
      const _jpArenaExc = (typeof JAPAN_ARENA_EXCLUDE !== 'undefined' && JAPAN_ARENA_EXCLUDE instanceof Set)
        ? JAPAN_ARENA_EXCLUDE
        : (typeof window !== 'undefined' && window.JAPAN_ARENA_EXCLUDE instanceof Set
            ? window.JAPAN_ARENA_EXCLUDE : new Set());
      for (const hname of team.heroes) {
        if (_jpBossWL.has(hname)) continue;
        if (_jpArenaExc.has(hname)) return false;
      }
      // ★ v3.13.27 — 防呆 5:黑名單第 3 層 — EVENT_ONLY_HEROES
      const _evtOnly = (typeof EVENT_ONLY_HEROES !== 'undefined' && EVENT_ONLY_HEROES instanceof Set)
        ? EVENT_ONLY_HEROES
        : (typeof window !== 'undefined' && window.EVENT_ONLY_HEROES instanceof Set
            ? window.EVENT_ONLY_HEROES : new Set());
      for (const hname of team.heroes) {
        if (_jpBossWL.has(hname)) continue;
        if (_evtOnly.has(hname)) return false;
      }
      return true;
    } catch (e) { console.warn('[arena] _arenaIsTeamValid 例外:', e); return false; }
  };

  // 工具:檢查陣容是否過期(>CLOUD_TEAM_TTL_DAYS 天)
  function _isTeamExpired(team) {
    try {
      if (!team || !team.updatedAt) return true;
      const now = Date.now();
      const ttl = ARENA_CONFIG.CLOUD_TEAM_TTL_DAYS * 86400 * 1000;
      return (now - team.updatedAt) > ttl;
    } catch (e) { return true; }
  }

  // 工具:取得當前玩家的 uid 與 email/displayLabel
  function _getCurrentUserInfo() {
    try {
      const uid = window._fbUser && window._fbUser.uid;
      const email = (window._fbUser && window._fbUser.email) || '';
      let displayLabel = '';
      // ★ v3.15.69 — 統一走玩家可見遮罩格式(名冊「5408陳O彬」/「5408暱稱」、lsps 無名冊「137…」),避免真名外洩
      try {
        const _nick = (window._playerNickname
          || (window._fbUser && window._fbUser.displayName) || '');
        if (typeof window._formatPlayerDisplayName === 'function') {
          displayLabel = window._formatPlayerDisplayName(_nick, email) || '';
        }
      } catch (_) {}
      // fallback:中央函式不在時走名冊短碼
      if (!displayLabel) {
        try {
          const ros = (typeof window._getRosterEntry === 'function')
            ? window._getRosterEntry((email || '').toLowerCase().trim()) : null;
          if (ros && typeof window._formatRosterLabel === 'function') {
            displayLabel = window._formatRosterLabel(ros);
          }
        } catch (_) {}
      }
      // 最後保險:暱稱
      if (!displayLabel) {
        displayLabel = (window._playerNickname
          || (window._fbUser && window._fbUser.displayName)
          || '神秘玩家');
      }
      return { uid, email, displayLabel };
    } catch (e) { return null; }
  }

  // 上雲:把玩家某一槽陣容寫到 Firestore
  // slotKey: '0'~'4' 或 'auto_win'
  // teamData: { name, heroes:[4], elements:[4], skills:[4]? }
  window._arenaUploadTeam = async function(slotKey, teamData) {
    try {
      const user = _getCurrentUserInfo();
      if (!user || !user.uid) {
        console.warn('[arena] _arenaUploadTeam: 未登入,跳過上雲');
        return false;
      }
      if (!window._fbDb) {
        console.warn('[arena] _arenaUploadTeam: Firestore 未就緒,跳過');
        return false;
      }
      // 把 skills 結構壓平成「只有英雄名+元素」,降低雲端體積(NPC 戰用不到玩家換的技能)
      const slotData = {
        name: String(teamData.name || '').slice(0, 20),
        heroes: teamData.heroes.slice(0, 4),
        elements: (teamData.elements || []).slice(0, 4),
        updatedAt: Date.now(),
        source: slotKey === ARENA_CONFIG.AUTO_WIN_SLOT_KEY ? 'auto_win' : 'preset',
      };
      // 防呆驗證
      if (!window._arenaIsTeamValid(slotData)) {
        console.warn('[arena] _arenaUploadTeam: 陣容驗證失敗,跳過上雲', slotData);
        return false;
      }
      // 取得 Firestore SDK 函式(主程式已掛在 window)
      const { setDoc, doc } = await _getFirestoreSdk();
      if (!setDoc || !doc) {
        console.warn('[arena] _arenaUploadTeam: Firestore SDK 函式未就緒');
        return false;
      }
      // 用 merge:true,只更新對應 slot key
      const payload = {
        uid: user.uid,
        email: user.email,
        displayLabel: user.displayLabel,
        lastUpdate: Date.now(),
        slots: { [slotKey]: slotData },
      };
      await setDoc(doc(window._fbDb, 'arenaTeams', user.uid), payload, { merge: true });
      console.log('[arena] 陣容已上雲: slot=' + slotKey + ', name=' + slotData.name);
      return true;
    } catch (e) {
      console.warn('[arena] _arenaUploadTeam 失敗:', e);
      return false;
    }
  };

  // 工具:取得 Firestore SDK 函式(主程式已掛在 window)
  async function _getFirestoreSdk() {
    try {
      // ★ v3.13.20 — 優先用 index.html 統一掛載的 window._fbFns(主程式 module script 已暴露)
      if (window._fbFns && window._fbFns.setDoc) {
        return {
          setDoc:     window._fbFns.setDoc,
          doc:        window._fbFns.doc,
          getDoc:     window._fbFns.getDoc,
          getDocs:    window._fbFns.getDocs,
          collection: window._fbFns.collection,
          query:      window._fbFns.query,
          orderBy:    window._fbFns.orderBy,
          limit:      window._fbFns.limit,
          deleteDoc:  window._fbFns.deleteDoc,
          where:      window._fbFns.where,
        };
      }
      // 舊路徑(向後相容,避免 v3.13.15 之前掛的個別 key)
      if (window._fbSetDoc && window._fbDoc && window._fbGetDocs && window._fbCollection) {
        return {
          setDoc: window._fbSetDoc,
          doc: window._fbDoc,
          getDoc: window._fbGetDoc,
          getDocs: window._fbGetDocs,
          collection: window._fbCollection,
        };
      }
      // fallback:動態 import
      const mod = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      return {
        setDoc: mod.setDoc,
        doc: mod.doc,
        getDoc: mod.getDoc,
        getDocs: mod.getDocs,
        collection: mod.collection,
        query: mod.query,
        orderBy: mod.orderBy,
        limit: mod.limit,
        deleteDoc: mod.deleteDoc,
        where: mod.where,
      };
    } catch (e) { console.warn('[arena] _getFirestoreSdk 例外:', e); return {}; }
  }

  // 雲端池快取
  let _cloudPoolCache = null;
  let _cloudPoolCacheAt = 0;
  let _cloudPoolFetching = false;

  // 拉取全玩家陣容池(快取 60 秒)
  window._arenaFetchTeamPool = async function(forceRefresh) {
    try {
      const now = Date.now();
      if (!forceRefresh && _cloudPoolCache
          && (now - _cloudPoolCacheAt) < ARENA_CONFIG.CLOUD_FETCH_COOLDOWN_MS) {
        return _cloudPoolCache;
      }
      if (_cloudPoolFetching) {
        // 已在抓取中,等待目前那次完成
        const waitStart = Date.now();
        while (_cloudPoolFetching && (Date.now() - waitStart) < 8000) {
          await new Promise(r => setTimeout(r, 200));
        }
        return _cloudPoolCache || [];
      }
      if (!window._fbDb) { return []; }
      _cloudPoolFetching = true;
      const { getDocs, collection } = await _getFirestoreSdk();
      if (!getDocs || !collection) { _cloudPoolFetching = false; return []; }
      const snap = await getDocs(collection(window._fbDb, 'arenaTeams'));
      const pool = [];
      const myUid = _getCurrentUserInfo() ? _getCurrentUserInfo().uid : null;
      snap.forEach(docSnap => {
        try {
          const data = docSnap.data();
          if (!data || !data.slots) return;
          if (data.uid === myUid) return;  // 排除自己
          // 每個 slot 都當作一個獨立陣容塞進池
          for (const slotKey of Object.keys(data.slots)) {
            const slot = data.slots[slotKey];
            if (!slot) continue;
            if (_isTeamExpired(slot)) continue;  // 過期跳過
            if (!window._arenaIsTeamValid(slot)) continue;  // 防呆
            pool.push({
              ...slot,
              _ownerUid: data.uid,
              _ownerEmail: data.email,
              _ownerLabel: data.displayLabel || '神秘玩家',
              _slotKey: slotKey,
            });
          }
        } catch (_eRow) { /* 單筆失敗不影響整池 */ }
      });
      _cloudPoolCache = pool;
      _cloudPoolCacheAt = now;
      _cloudPoolFetching = false;
      console.log('[arena] 雲端陣容池拉取完成: 共 ' + pool.length + ' 筆(快取 60 秒)');
      return pool;
    } catch (e) {
      _cloudPoolFetching = false;
      console.warn('[arena] _arenaFetchTeamPool 失敗:', e);
      return [];
    }
  };

  // ★ 主入口:抽一套 AI 隊伍(70% 雲端玩家 + 30% 系統 5 套)
  // 同步版回傳預設,讓選角 UI 立刻有東西顯示;同時觸發非同步 fetch 下次刷新時換上玩家
  // 回傳格式: { name, heroes, elements?, _isPlayerTeam, _ownerLabel?, _ownerUid? }
  // ★ v3.13.27(2026-06-03) — 抽到後再過一次 _arenaIsTeamValid 嚴驗(三層黑名單),
  //   不過就直接走系統 5 套(避免舊雲端資料污染、_arenaIsTeamValid 升級前上雲的髒陣容)
  window._arenaPickAITeam = function(opts) {
    try {
      const useCloud = !(opts && opts.systemOnly);
      // 1. 若快取已就緒,按 70/30 機率抽取
      if (useCloud && _cloudPoolCache && _cloudPoolCache.length) {
        const r = Math.random();
        if (r < ARENA_CONFIG.CLOUD_POOL_RATIO) {
          // ★ v3.13.27 — 最多挑 5 次,避開舊資料污染(BOSS/菁英)
          let _pickedCloud = null;
          for (let _i = 0; _i < 5; _i++) {
            const _cand = _cloudPoolCache[Math.floor(Math.random() * _cloudPoolCache.length)];
            if (_cand && window._arenaIsTeamValid(_cand)) {
              _pickedCloud = _cand;
              break;
            }
            try { console.warn('[arena v3.13.27] 雲端陣容污染,第 ' + (_i + 1) + ' 次重抽:', _cand && _cand.heroes); } catch (_) {}
          }
          if (_pickedCloud) {
            return {
              name: _pickedCloud.name,
              heroes: _pickedCloud.heroes,
              elements: _pickedCloud.elements || [],
              _isPlayerTeam: true,
              _ownerUid: _pickedCloud._ownerUid,
              _ownerLabel: _pickedCloud._ownerLabel,
              _slotKey: _pickedCloud._slotKey,
            };
          }
          // 5 次都污染就 fallthrough 走系統 5 套
        }
      }
      // 2. 走系統 5 套(系統陣容理論上絕對乾淨,但 GM 可能從 admin_panel 寫了髒陣容,
      //    所以也驗一次,污染就用 default 第 1 套兜底)
      let _sys = _ARENA_AI_TEAMS[Math.floor(Math.random() * _ARENA_AI_TEAMS.length)];
      if (!window._arenaIsTeamValid(_sys)) {
        try { console.warn('[arena v3.13.27] 系統陣容也污染,改用 default 第 1 套兜底:', _sys && _sys.heroes); } catch (_) {}
        // 從 default 找第一個乾淨的
        const _safe = ARENA_AI_TEAMS_DEFAULT.find(t => window._arenaIsTeamValid(t)) || ARENA_AI_TEAMS_DEFAULT[0];
        _sys = _safe;
      }
      // 觸發雲端池抓取(背景非同步,下次刷新就有了)
      if (useCloud && !_cloudPoolFetching) {
        setTimeout(() => { window._arenaFetchTeamPool().catch(() => {}); }, 100);
      }
      return {
        name: _sys.name,
        heroes: _sys.heroes.slice(),
        elements: (_sys.elements || []).slice(),
        _isPlayerTeam: false,
        _systemId: _sys.id,
      };
    } catch (e) {
      console.warn('[arena] _arenaPickAITeam 例外:', e);
      // 兜底:走第一套系統
      return {
        name: _ARENA_AI_TEAMS[0].name,
        heroes: _ARENA_AI_TEAMS[0].heroes.slice(),
        elements: (_ARENA_AI_TEAMS[0].elements || []).slice(),
        _isPlayerTeam: false,
      };
    }
  };

  // 把當前選角頁玩家方陣容存為「自動勝利槽(第6槽)」
  // 由 _showResultWithDrama 勝利分支呼叫
  window._arenaSaveAutoWinTeam = function(heroNames, elements) {
    try {
      if (!Array.isArray(heroNames) || heroNames.length !== 4) return false;
      // 用鬥技場專屬詞庫隨機生成隊名(與個人暱稱詞庫區隔)
      const _autoName = window._arenaRandomTeamName();
      const teamData = {
        name: _autoName,
        heroes: heroNames,
        elements: elements || [],
      };
      window._arenaUploadTeam(ARENA_CONFIG.AUTO_WIN_SLOT_KEY, teamData);
      return true;
    } catch (e) {
      console.warn('[arena] _arenaSaveAutoWinTeam 例外:', e);
      return false;
    }
  };

  // 隊長標籤(用於戰前顯示「⚔ 對戰 [神秘的小狐狸] · by 黃O漩同學」)
  window._arenaFormatEnemyTeamLabel = function(team) {
    try {
      if (!team) return '⚔ 對戰 神秘隊伍';
      const nm = team.name || '神秘隊伍';
      if (team._isPlayerTeam && team._ownerLabel) {
        return '⚔ 對戰 「' + nm + '」 · by ' + team._ownerLabel;
      }
      return '⚔ 對戰 「' + nm + '」';
    } catch (e) { return '⚔ 對戰'; }
  };

  // 隨機抽一套 AI 隊伍(同步快捷,刷新時呼叫)
  // 保留為舊版相容用,內部走主入口
  window._arenaPickAITeamSync = function() { return window._arenaPickAITeam(); };

  // ──────────────────────────────────────────────────────────────────

  // ──────────────────────────────────────────────────────────────────
  //  📅  每日場次與刷新管理(本地 localStorage)
  // ──────────────────────────────────────────────────────────────────
  function _todayKey() {
    const d = new Date();
    return d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();
  }
  const ARENA_LS_KEY = 'lxps_arena_daily_v1';

  function _readDailyState() {
    try {
      const raw = localStorage.getItem(ARENA_LS_KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (obj && obj.day === _todayKey()) return obj;
      return null;
    } catch (e) {
      console.warn('[arena] _readDailyState 例外:', e);
      return null;
    }
  }

  function _writeDailyState(state) {
    try {
      state.day = _todayKey();
      localStorage.setItem(ARENA_LS_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('[arena] _writeDailyState 例外:', e);
    }
  }

  // 取得今日狀態(沒有則初始化)
  window._arenaGetDailyState = function() {
    let s = _readDailyState();
    if (!s) {
      s = {
        day: _todayKey(),
        battlesPlayed: 0,
        refreshesUsed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        zhengTotal: 0,           // 鬥技之證累積(全部歷史)— 即「持有量」(未來開放兌換後扣減)
        zhengLifetimeTotal: 0,   // ★ v3.13.32(2026-06-03) — 累積獲得鬥技之證(只增不減,商店兌換不扣)
        winsLifetime: 0,         // ★ v3.13.72 — 累積勝場(只增不減,跨日保留)
        drawsLifetime: 0,        // ★ v3.13.72 — 累積平手(只增不減)
        lossesLifetime: 0,       // ★ v3.13.72 — 累積敗場(只增不減)
      };
      // 保留歷史鬥技之證累積
      try {
        const histRaw = localStorage.getItem('lxps_arena_zheng_total');
        if (histRaw) {
          const _n = parseInt(histRaw, 10) || 0;
          s.zhengTotal = _n;
          s.zhengLifetimeTotal = _n;  // 第一次升 schema:lifetime = current
        }
        // 若已有單獨的 lifetime localStorage,優先用較大值(防止意外重置)
        const lifeRaw = localStorage.getItem('lxps_arena_zheng_lifetime');
        if (lifeRaw) {
          const _ln = parseInt(lifeRaw, 10) || 0;
          if (_ln > s.zhengLifetimeTotal) s.zhengLifetimeTotal = _ln;
        }
        // ★ v3.13.72 — 還原累積勝敗(跨日保留,仿鬥技之證 lifetime)
        const _wl = parseInt(localStorage.getItem('lxps_arena_wins_lifetime'),  10); if (!isNaN(_wl)) s.winsLifetime   = _wl;
        const _dl = parseInt(localStorage.getItem('lxps_arena_draws_lifetime'), 10); if (!isNaN(_dl)) s.drawsLifetime  = _dl;
        const _ll = parseInt(localStorage.getItem('lxps_arena_losses_lifetime'),10); if (!isNaN(_ll)) s.lossesLifetime = _ll;
      } catch (_) {}
      _writeDailyState(s);
    }
    // 防呆:任何時候 zhengLifetimeTotal 都應 >= zhengTotal(累積不可少於持有)
    if (typeof s.zhengLifetimeTotal !== 'number' || s.zhengLifetimeTotal < (s.zhengTotal || 0)) {
      s.zhengLifetimeTotal = s.zhengTotal || 0;
      _writeDailyState(s);
    }
    return s;
  };

  // 檢查是否還能戰鬥(每日 N 場)
  // ★ v3.13.27(2026-06-03) — 管理員場次無限(老師指示):
  //   _isAdminUser() 回 true 就直接放行,不受 DAILY_BATTLE_LIMIT 限制
  window._arenaCanBattle = function() {
    try {
      if (typeof window._isAdminUser === 'function' && window._isAdminUser()) {
        return true;
      }
    } catch (_eAdm) {}
    const s = window._arenaGetDailyState();
    return s.battlesPlayed < ARENA_CONFIG.DAILY_BATTLE_LIMIT;
  };

  // 檢查是否還能刷新(每日 3 次)
  // ★ v3.13.27(2026-06-03) — 管理員刷新也無限
  window._arenaCanRefresh = function() {
    try {
      if (typeof window._isAdminUser === 'function' && window._isAdminUser()) {
        return true;
      }
    } catch (_eAdm) {}
    const s = window._arenaGetDailyState();
    return s.refreshesUsed < ARENA_CONFIG.DAILY_REFRESH_LIMIT;
  };

  // 增加場次計數(戰鬥真正開始後呼叫,不是進入選角)
  window._arenaIncrementBattle = function() {
    const s = window._arenaGetDailyState();
    s.battlesPlayed = (s.battlesPlayed || 0) + 1;
    _writeDailyState(s);
    return s;
  };

  // 增加刷新計數
  window._arenaIncrementRefresh = function() {
    const s = window._arenaGetDailyState();
    s.refreshesUsed = (s.refreshesUsed || 0) + 1;
    _writeDailyState(s);
    return s;
  };

  // 結算發放鬥技之證 + 戰績統計
  // result: 'win' | 'draw' | 'lose'
  window._arenaSettleReward = function(result) {
    const s = window._arenaGetDailyState();
    let zheng = 0;
    if (result === 'win')      { zheng = ARENA_CONFIG.REWARD_WIN;  s.wins   = (s.wins||0)   + 1; s.winsLifetime   = (s.winsLifetime||0)   + 1; }
    else if (result === 'draw'){ zheng = ARENA_CONFIG.REWARD_DRAW; s.draws  = (s.draws||0)  + 1; s.drawsLifetime  = (s.drawsLifetime||0)  + 1; }
    else                        { zheng = ARENA_CONFIG.REWARD_LOSE; s.losses = (s.losses||0) + 1; s.lossesLifetime = (s.lossesLifetime||0) + 1; }
    s.zhengTotal = (s.zhengTotal || 0) + zheng;
    // ★ v3.13.32(2026-06-03) — 累積獲得鬥技之證(商店扣減不影響)
    s.zhengLifetimeTotal = (s.zhengLifetimeTotal || 0) + zheng;
    // ★ v3.15.60 — 鬥技場成就檢查(主程式提供 window._checkMedalArena;win 累積/連勝、平敗中斷連勝)
    try{ if(typeof window._checkMedalArena === 'function') window._checkMedalArena(result, s.winsLifetime || 0); }catch(_){}
    _writeDailyState(s);
    try {
      localStorage.setItem('lxps_arena_zheng_total', String(s.zhengTotal));
      localStorage.setItem('lxps_arena_zheng_lifetime', String(s.zhengLifetimeTotal));
      // ★ v3.13.72 — 累積勝敗持久化(跨日保留)
      localStorage.setItem('lxps_arena_wins_lifetime',   String(s.winsLifetime   || 0));
      localStorage.setItem('lxps_arena_draws_lifetime',  String(s.drawsLifetime  || 0));
      localStorage.setItem('lxps_arena_losses_lifetime', String(s.lossesLifetime || 0));
    } catch (_) {}
    // ★ v3.13.20(2026-06-02) — 結算同時上傳戰鬥記錄(供 GM 異常傷害審核)
    //   fire-and-forget,失敗不影響玩家獎勵發放
    try { window._arenaSubmitBattleLog && window._arenaSubmitBattleLog(result); } catch (_) {}
    // ★ v3.13.61(2026-06-05)— 把本場得到的鬥技之證累計進「本週排名」(每週一 08:00 結算發獎)
    try { if (window._arenaRank && typeof window._arenaRank.addZheng === 'function') window._arenaRank.addZheng(zheng); } catch (_) {}
    // ★ v3.15.37(2026-06-18)— 持有量上雲:結算後即時觸發雲端存檔(gameCloudSave 內含完整保護層),
    //   讓鬥技之證「持有量/累積」跟著帳號跨裝置;修復共用 iPad 清 localStorage 後代幣消失。
    try { if (typeof window.gameCloudSave === 'function' && window._gUserId) window.gameCloudSave(); } catch (_) {}
    return { zheng, total: s.zhengTotal, lifetime: s.zhengLifetimeTotal, state: s };
  };

  // 取得鬥技之證總數(顯示用)
  window._arenaGetZhengTotal = function() {
    try {
      const raw = localStorage.getItem('lxps_arena_zheng_total');
      return raw ? (parseInt(raw, 10) || 0) : 0;
    } catch (e) {
      return 0;
    }
  };

  // ──────────────────────────────────────────────────────────────────
  //  ★ v3.13.60(2026-06-05)— 鬥技場商店「兌換扣證」+ GM 開關旗標讀取
  // ──────────────────────────────────────────────────────────────────
  //  扣鬥技之證(持有量 zhengTotal,不動 zhengLifetimeTotal=累積)。
  //  回傳 true=扣成功 / false=不足或失敗。持久化:state + lxps_arena_zheng_total。
  window._arenaSpendZheng = function(cost) {
    try {
      cost = Math.max(0, Math.round(Number(cost) || 0));
      if (cost <= 0) return true;
      const s = window._arenaGetDailyState();
      const have = s.zhengTotal || 0;
      if (have < cost) return false;
      s.zhengTotal = have - cost;       // 只扣持有,累積(lifetime)不動
      _writeDailyState(s);
      try { localStorage.setItem('lxps_arena_zheng_total', String(s.zhengTotal)); } catch (_) {}
      // ★ v3.15.37 — 扣證後同步上雲(讓「花掉」也跨裝置生效,避免下次登入又被舊雲端值還原)
      try { if (typeof window.gameCloudSave === 'function' && window._gUserId) window.gameCloudSave(); } catch (_) {}
      return true;
    } catch (e) { console.warn('[arena] _arenaSpendZheng 例外:', e); return false; }
  };

  //  GM 雲端開關:商店是否開放(預設 true=開放,老師指示「可以開放了」)
  //  讀 stats/global.arenaShopOpen(由 onSnapshot 同步到 _cachedGlobalStats)。
  window._arenaIsShopOpen = function() {
    try {
      const g = window._cachedGlobalStats;
      if (g && typeof g.arenaShopOpen === 'boolean') return g.arenaShopOpen;
    } catch (_) {}
    return true;   // 預設開放
  };

  //  GM 雲端開關:是否依排名發放獎勵。
  //  ★ v3.15.49 — 鬥技場排名「正式上線」:預設改為 true(每週一 08:00 自動結算發獎)。
  //    GM 仍可在後台「🏆 鬥技場排名發獎開關」把 arenaRankRewardEnabled 設成 false 暫停發放;
  //    只有「明確設成 false」才會停(沿用既有 typeof==='boolean' 判定),其餘情況一律發。
  window._arenaIsRankRewardEnabled = function() {
    try {
      const g = window._cachedGlobalStats;
      if (g && typeof g.arenaRankRewardEnabled === 'boolean') return g.arenaRankRewardEnabled;
    } catch (_) {}
    return true;  // ★ v3.15.49 — 預設發放(正式上線)
  };

  // ★ v3.13.61(2026-06-05)— 排名獎勵「發放鬥技之證」(加持有 zhengTotal + 累積 zhengLifetimeTotal)。
  //   注意:這是「獎勵發放」,不計入本週排名(不呼叫 _arenaRank.addZheng),避免領獎又灌下週排名。
  window._arenaGrantZheng = function(amount) {
    try {
      amount = Math.max(0, Math.round(Number(amount) || 0));
      if (amount <= 0) return;
      const s = window._arenaGetDailyState();
      s.zhengTotal = (s.zhengTotal || 0) + amount;
      s.zhengLifetimeTotal = (s.zhengLifetimeTotal || 0) + amount;
      _writeDailyState(s);
      try {
        localStorage.setItem('lxps_arena_zheng_total', String(s.zhengTotal));
        localStorage.setItem('lxps_arena_zheng_lifetime', String(s.zhengLifetimeTotal));
      } catch (_) {}
      // ★ v3.15.37 — 發證後同步上雲
      try { if (typeof window.gameCloudSave === 'function' && window._gUserId) window.gameCloudSave(); } catch (_) {}
    } catch (e) { console.warn('[arena] _arenaGrantZheng 例外:', e); }
  };


  // ──────────────────────────────────────────────────────────────────
  //  ★ v3.13.20(2026-06-02) — 戰鬥記錄上傳(供 GM 異常傷害審核)
  //  ──────────────────────────────────────────────────────────────────
  //  老師需求:玩家可能有異常 BUG 傷害,GM 要能查每個隊伍「平均單回合總傷害」
  //  最小可行版:每場結束上傳 {uid, displayLabel, teamName, heroes[], rounds,
  //              totalDmg, result, ts} 到 Firestore arenaBattles collection
  //  不存戰鬥邏輯詳細(回合招式/隨機數/quiz),保持資料量最小
  //  傷害累計由 index.html doDmg hook 寫到 window._arenaP1DmgDealt(進場時清零)
  //  ──────────────────────────────────────────────────────────────────
  window._arenaSubmitBattleLog = async function(result) {
    try {
      const user = _getCurrentUserInfo();
      if (!user || !user.uid) {
        console.warn('[arena] _arenaSubmitBattleLog: 未登入,跳過上傳');
        return false;
      }
      if (!window._fbDb) {
        console.warn('[arena] _arenaSubmitBattleLog: Firestore 未就緒,跳過');
        return false;
      }
      const G = window.G;
      if (!G || !Array.isArray(G.p1) || G.p1.length === 0) {
        console.warn('[arena] _arenaSubmitBattleLog: G.p1 不存在或為空,跳過');
        return false;
      }
      // 蒐集玩家隊伍資料
      const heroes = G.p1.map(h => h && h.name).filter(Boolean).slice(0, 4);
      const elements = G.p1.map(h => (h && h.element) || '').slice(0, 4);
      const totalDmg = Math.max(0, Math.floor(window._arenaP1DmgDealt || 0));
      const rounds = Math.max(1, Math.floor(G.round || 1));
      const avgDmgPerRound = Math.floor(totalDmg / rounds);
      // 取得隊名(若有預設陣容名稱),否則用 P1 自己的玩家標籤
      let teamName = '';
      try {
        if (G._arenaP1TeamName) teamName = String(G._arenaP1TeamName).slice(0, 30);
      } catch (_) {}
      if (!teamName) teamName = '(無命名)';

      const { setDoc, doc } = await _getFirestoreSdk();
      if (!setDoc || !doc) {
        console.warn('[arena] _arenaSubmitBattleLog: Firestore SDK 函式未就緒');
        return false;
      }
      // 文件 ID:uid + 時間戳(避免覆蓋,每場一筆)
      const ts = Date.now();
      const docId = user.uid + '_' + ts;
      // ★ v3.13.32(2026-06-03) — 老師需求 A:若該場是入場券場次,標記 bonusSource:'ticket'
      //   讓 GM 戰鬥記錄審核能區分「玩家自然場次」與「使用入場券補進的場次」
      //   旗標在 _arenaUseTicket 立起,這裡讀完即清(避免下場誤用)
      let _bonusSource = null;
      try {
        if (window._arenaNextBattleFromTicket === true) {
          _bonusSource = 'ticket';
          window._arenaNextBattleFromTicket = false;
        }
      } catch (_) {}
      const payload = {
        uid: user.uid,
        email: user.email || '',
        displayLabel: user.displayLabel || '',
        teamName: teamName,
        heroes: heroes,
        elements: elements,
        rounds: rounds,
        totalDmg: totalDmg,
        avgDmgPerRound: avgDmgPerRound,
        result: String(result || 'unknown'),  // 'win' | 'draw' | 'lose'
        ts: ts,
        v: 'v3.13.32',
      };
      // bonusSource 只有有值才寫(向下相容:舊紀錄沒這欄,GM panel 顯示「-」)
      if (_bonusSource) payload.bonusSource = _bonusSource;
      await setDoc(doc(window._fbDb, 'arenaBattles', docId), payload);
      console.log('[arena] 戰鬥記錄已上傳: ' + result + ' / 總傷 ' + totalDmg
        + ' / 回合 ' + rounds + ' / 平均 ' + avgDmgPerRound);

      // ════════════════════════════════════════════════════════════════
      // ★ v3.15.54(2026-06-19)— 老師需求 1:旁路寫「逐回合×逐英雄×技能」傷害明細
      //   到 arenaDamageDetail/{uid_ts}(docId 與 arenaBattles 對齊,GM 點記錄即可反查明細)。
      //   ❗失敗一律 try-catch 靜默,絕不影響上面已上傳的戰鬥記錄與獎勵發放。
      //   ⚠ 需在 Firebase Console 部署 arenaDamageDetail 規則,否則此寫入會被預設拒絕(僅明細缺,
      //      戰鬥記錄與其他功能照常)。
      //   資料源:G._arenaDmgSources(index.html doDmg hook 收集,每筆 {round,heroName,skill,amount})。
      //   結構:detail:[ { r:回合, h:[ { n:英雄, d:該回合總傷, by:[{s:技能, d:傷, m:最大單次}] } ] } ]
      // ★ v4.88.0(2026-07-24)— 老師需求:GM 要靠這份明細判斷「哪個技能過強/有 BUG」。
      //   舊版 by 只有 d(該回合該技能的**累加合計**)→ 多段攻擊技能(打 5 下)會被加總成大數字,
      //   看起來像爆量其實正常 → 最容易誤判。故每筆補 m = 該回合該技能的**最大單次**傷害。
      //   ★ 頂層欄位維持 uid/detail/totalDmg/ts/v 五個不變 → firestore.rules 的
      //     hasOnly 白名單與型別檢查完全不受影響(規則不檢查 detail 陣列內部結構)→ 規則零改動。
      //   ★ 舊場次沒有 m 欄,GM 端顯示「—」,不可回溯。
      // ════════════════════════════════════════════════════════════════
      try {
        var _rawSrc = (G && Array.isArray(G._arenaDmgSources)) ? G._arenaDmgSources : null;
        if (_rawSrc && _rawSrc.length) {
          // 聚合:round → hero → skill 累加
          var _byRound = {};
          var _grand = 0;
          _rawSrc.forEach(function (s) {
            if (!s) return;
            var _r = Math.max(0, Math.floor(s.round || 0));
            var _nm = String(s.heroName || '?').slice(0, 24);
            var _sk = String(s.skill || '普攻').slice(0, 24);
            var _amt = Math.max(0, Math.floor(s.amount || 0));
            if (_amt <= 0) return;
            if (!_byRound[_r]) _byRound[_r] = {};
            if (!_byRound[_r][_nm]) _byRound[_r][_nm] = { total: 0, skills: {}, maxes: {} };
            _byRound[_r][_nm].total += _amt;
            _byRound[_r][_nm].skills[_sk] = (_byRound[_r][_nm].skills[_sk] || 0) + _amt;
            // ★ v4.88.0 — 最大單次(max-merge;寫成 !(x >= y) 讓 undefined 一定會被寫入)
            if (!(_byRound[_r][_nm].maxes[_sk] >= _amt)) _byRound[_r][_nm].maxes[_sk] = _amt;
            _grand += _amt;
          });
          var _detail = Object.keys(_byRound)
            .map(function (k) { return parseInt(k, 10); })
            .sort(function (x, y) { return x - y; })
            .slice(0, 12)   // 鬥技場上限 10 回合,留 12 緩衝
            .map(function (r) {
              var _hs = _byRound[r];
              var _hArr = Object.keys(_hs).slice(0, 8).map(function (n) {
                var _h = _hs[n];
                // ★ v4.88.0 — 補 m(最大單次);排序主軸改「最大單次」高→低,
                //   讓 GM 展開明細時第一眼就看到爆量的那一招(合計 d 仍完整保留)。
                var _byArr = Object.keys(_h.skills)
                  .map(function (sk) {
                    return { s: sk, d: _h.skills[sk], m: (_h.maxes && _h.maxes[sk]) || 0 };
                  })
                  .sort(function (x, y) { return (y.m - x.m) || (y.d - x.d); })
                  .slice(0, 8);
                return { n: n, d: _h.total, by: _byArr };
              });
              return { r: r, h: _hArr };
            });
          var _detailPayload = {
            uid: user.uid,
            detail: _detail,
            totalDmg: _grand,
            ts: ts,
            v: 'v4.88.0',
          };
          await setDoc(doc(window._fbDb, 'arenaDamageDetail', docId), _detailPayload);
          console.log('[arena] 傷害明細已上傳 arenaDamageDetail/' + docId
            + '(' + _detail.length + ' 回合 / 原始總傷 ' + _grand + ')');
        }
      } catch (_eDetail) {
        console.warn('[arena] 傷害明細上傳略過(不影響戰鬥記錄;檢查 arenaDamageDetail 規則是否已部署):', _eDetail);
      }
      // 用完即清,防跨場殘留(正常進場也會清;雙保險)
      try { if (G) G._arenaDmgSources = []; } catch (_) {}

      return true;
    } catch (e) {
      console.warn('[arena] _arenaSubmitBattleLog 失敗(不影響獎勵發放):', e);
      return false;
    }
  };

  // ──────────────────────────────────────────────────────────────────
  //  ★ v3.13.20(2026-06-02) — 鬥技場全站開關(GM 後台控制)
  //  ──────────────────────────────────────────────────────────────────
  //  雲端:gameConfig/arenaSwitch  { enabled: bool, updatedAt, updatedBy }
  //  預設 enabled=true(查不到或斷網時不擋,避免 GM 後台壞掉誤關全站)
  //  本機快取:window._arenaSwitchEnabled(boolean),啟動時拉一次
  //  ──────────────────────────────────────────────────────────────────
  window._arenaSwitchEnabled = true;  // 預設開啟

  window._arenaCheckEnabled = async function() {
    try {
      if (!window._fbDb) return true;  // Firestore 沒就緒 → 預設開
      const { getDoc, doc } = await _getFirestoreSdk();
      if (!getDoc || !doc) return true;
      const snap = await getDoc(doc(window._fbDb, 'gameConfig', 'arenaSwitch'));
      if (snap && snap.exists()) {
        const data = snap.data();
        const enabled = (data && data.enabled !== false);  // 只有明確 false 才關
        window._arenaSwitchEnabled = enabled;
        try {
          if (typeof _arenaApplySwitchUI === 'function') _arenaApplySwitchUI(enabled);
        } catch (_) {}
        console.log('[arena] 鬥技場開關狀態: ' + (enabled ? '開啟' : '關閉'));
        return enabled;
      }
      // 雲端無此文件 → 預設開
      window._arenaSwitchEnabled = true;
      return true;
    } catch (e) {
      console.warn('[arena] _arenaCheckEnabled 例外(預設開啟):', e);
      window._arenaSwitchEnabled = true;
      return true;
    }
  };

  // 套用開關狀態到首頁按鈕 UI(由 index.html 或 admin_panel 呼叫)
  function _arenaApplySwitchUI(enabled) {
    try {
      const btn = document.getElementById('adv-arena-btn-main');
      if (!btn) return;
      if (enabled) {
        btn.style.opacity = '';
        btn.style.filter = '';
        btn.style.pointerEvents = '';
        btn.title = '';
      } else {
        btn.style.opacity = '0.45';
        btn.style.filter = 'grayscale(80%)';
        btn.style.pointerEvents = 'auto';  // 仍可按,但會被 _arenaStartFromMenu 擋下提示
        btn.title = '鬥技場暫時關閉維修中';
      }
    } catch (_) {}
  }
  window._arenaApplySwitchUI = _arenaApplySwitchUI;

  // 啟動時自動拉一次開關狀態(延遲 2 秒,等 Firebase 就緒)
  try {
    setTimeout(function() {
      if (typeof window._arenaCheckEnabled === 'function') {
        window._arenaCheckEnabled().catch(function(e) {
          console.warn('[arena] 啟動拉開關狀態失敗,預設開啟', e);
        });
      }
    }, 2000);
  } catch (_) {}

  // ──────────────────────────────────────────────────────────────────
  //  ⏱️  10 回合上限判定(平局/勝負結算)
  //  ──── 規則:
  //    1. 第 10 回合最後一位行動結束後觸發
  //    2. 場上存活人數較多者獲勝
  //    3. 一致 → 比 HP% 總和(HP 比例平均)
  //    4. 再一致 → 平手
  // ──────────────────────────────────────────────────────────────────
  window._arenaCheckRoundLimit = function() {
    try {
      // 僅在鬥技場觸發
      if (typeof _adventureMode !== 'undefined' && _adventureMode) return null;
      if (!G || !G.p1 || !G.p2) return null;
      const round = G.round || 1;
      if (round < ARENA_CONFIG.MAX_ROUNDS) return null;
      // 第 10 回合,結算
      const p1Alive = G.p1.filter(h => h && h.curHp > 0).length;
      const p2Alive = G.p2.filter(h => h && h.curHp > 0).length;
      const p1HpRatio = G.p1.reduce((sum, h) => {
        if (!h || !h.hp) return sum;
        return sum + Math.max(0, h.curHp || 0) / h.hp;
      }, 0);
      const p2HpRatio = G.p2.reduce((sum, h) => {
        if (!h || !h.hp) return sum;
        return sum + Math.max(0, h.curHp || 0) / h.hp;
      }, 0);
      // 結果:'win' (玩家勝) | 'lose' | 'draw'
      let result;
      if (p1Alive > p2Alive)      result = 'win';
      else if (p2Alive > p1Alive) result = 'lose';
      else if (p1HpRatio > p2HpRatio + 0.01) result = 'win';
      else if (p2HpRatio > p1HpRatio + 0.01) result = 'lose';
      else result = 'draw';
      return { result, p1Alive, p2Alive, p1HpRatio, p2HpRatio };
    } catch (e) {
      console.warn('[arena] _arenaCheckRoundLimit 例外:', e);
      return null;
    }
  };

  // ──────────────────────────────────────────────────────────────────
  //  🛡️  挑釁重疊安全規則(老師指定:以最新上限為準,全隊覆蓋單體)
  //  ──── 本檔案僅放規則文字,實際邏輯由引擎 strongTaunt 既有機制處理
  // ──────────────────────────────────────────────────────────────────
  // ARENA NOTE 鐵律 1.139:
  //   鬥技場「挑釁重疊」處理規則 — 多個挑釁來源時,以「最新上限」為準。
  //   實例:小劇團員 S2 對 1 名敵人附「被挑釁」2T 後,守衛爆發再對全敵附「強力挑釁」2T,
  //         全部目標都進入「強力挑釁」狀態(覆蓋既有挑釁;以全隊挑釁為最新生效)。
  //   實作:引擎既有 strongTaunt 機制是 addStatus(覆蓋同名狀態),自然符合「最新覆蓋」邏輯,
  //         本檔不需額外 hook,僅紀錄此鐵律避免日後混淆。

  // ──────────────────────────────────────────────────────────────────
  //  📊  戰績紀錄與顯示資料
  // ──────────────────────────────────────────────────────────────────
  window._arenaGetStatsForUI = function() {
    const s = window._arenaGetDailyState();
    // ★ v3.13.27(2026-06-03) — 管理員場次無限,UI 顯示 999 / Infinity 標記
    let _isAdmin = false;
    try { _isAdmin = (typeof window._isAdminUser === 'function' && window._isAdminUser()); } catch (_) {}
    return {
      todayBattles: s.battlesPlayed || 0,
      todayBattleLimit: _isAdmin ? 999 : ARENA_CONFIG.DAILY_BATTLE_LIMIT,
      todayRefreshes: s.refreshesUsed || 0,
      todayRefreshLimit: _isAdmin ? 999 : ARENA_CONFIG.DAILY_REFRESH_LIMIT,
      todayWins: s.wins || 0,
      todayDraws: s.draws || 0,
      todayLosses: s.losses || 0,
      // ★ v3.13.72 — 累積勝敗(只增不減,跨日保留)
      winsLifetime: s.winsLifetime || 0,
      drawsLifetime: s.drawsLifetime || 0,
      lossesLifetime: s.lossesLifetime || 0,
      zhengTotal: s.zhengTotal || 0,
      // ★ v3.13.32(2026-06-03) — 累積獲得(只增不減,商店扣減不影響)
      zhengLifetimeTotal: s.zhengLifetimeTotal || s.zhengTotal || 0,
      // ★ v3.13.32(2026-06-03) — 老師需求 A:含本機快取的入場券持有數
      ticketCount: (typeof window._arenaGetMyTicketCount === 'function')
        ? window._arenaGetMyTicketCount() : 0,
      ticketMax: 5,
      isAdmin: _isAdmin,
    };
  };

  // ──────────────────────────────────────────────────────────────────
  //  🏆  排名功能 placeholder
  // ──────────────────────────────────────────────────────────────────
  window._arenaShowRankPlaceholder = function() {
    try {
      if (typeof _showInGameToast === 'function') {
        _showInGameToast(ARENA_CONFIG.RANK_PLACEHOLDER_TEXT, '#ffaa66', 4500);
      } else {
        alert(ARENA_CONFIG.RANK_PLACEHOLDER_TEXT);
      }
    } catch (e) { console.warn('[arena] showRankPlaceholder 例外:', e); }
  };

  // ──────────────────────────────────────────────────────────────────
  //  🛠 v3.13.31(2026-06-03)— GM 戰鬥記錄審核 API(老師需求 #4)
  //  ──────────────────────────────────────────────────────────────────
  //  老師需求:
  //   ・週一早上 8:00 才結算本週「獲得最多鬥技之證」的玩家
  //   ・在這之前,GM 可以刪除 bug 異常的戰鬥記錄(arenaBattles)
  //   ・刪除記錄 = 該紀錄的鬥技之證從排行榜聚合中扣除(因為 _fetchLeaderboard 是即時聚合)
  //   ・補償該玩家「鬥技場入場券」x N 張(目前僅紀錄於雲端;玩家側使用流程下版本實作)
  //
  //  資料路徑:
  //   ・arenaBattles/{uid_ts} — 既有 schema(_arenaSubmitBattleLog 寫入)
  //   ・players/{uid}.playerBackpack.arena_entry_ticket — 跟 wb_entry_ticket 同模式
  //   ・操作 log:players/{uid}.adminLog.arenaCompensation — append-only 陣列
  //
  //  鐵律 1.55(跨玩家寫):由 GM admin 寫入,需要 Firestore Rules 配套(isAdmin 路徑)
  //  ──────────────────────────────────────────────────────────────────

  // 內部:取得 Firestore SDK(沿用既有 helper)
  async function _getFsAdminSdk() {
    try {
      const fb = (typeof window._fbModules === 'object' && window._fbModules) || null;
      if (fb && fb.firestore) return fb.firestore;
      // 若沒有,直接從 doc/setDoc/deleteDoc/updateDoc/getDoc 全域抓
      return {
        doc: window._fbDoc, setDoc: window._fbSetDoc, deleteDoc: window._fbDeleteDoc,
        updateDoc: window._fbUpdateDoc, getDoc: window._fbGetDoc, arrayUnion: window._fbArrayUnion,
      };
    } catch (e) { return null; }
  }

  // 列出最近 N 筆 arenaBattles 紀錄(GM 用)
  //   opts: { limit:200, onlyAnomaly:false, anomalyAvgDmg:200, anomalyTotalDmg:1500 }
  window._arenaAdminListBattleLogs = async function(opts) {
    opts = opts || {};
    const _limit = Math.max(10, Math.min(500, opts.limit || 200));
    const _onlyAnomaly = !!opts.onlyAnomaly;
    const _avgTh = opts.anomalyAvgDmg || 200;
    const _totalTh = opts.anomalyTotalDmg || 1500;
    try {
      if (!window._fbDb) { console.warn('[arenaAdmin] Firestore 未就緒'); return null; }
      const fb = (typeof window._fbModules === 'object' && window._fbModules) || null;
      let collection, getDocs, query, orderBy, limit;
      if (fb && fb.firestore) {
        ({ collection, getDocs, query, orderBy, limit } = fb.firestore);
      }
      if (!collection || !getDocs) {
        console.warn('[arenaAdmin] Firestore SDK 函式未就緒');
        return null;
      }
      const ref = collection(window._fbDb, 'arenaBattles');
      const q = query(ref, orderBy('ts','desc'), limit(_limit));
      const snap = await getDocs(q);
      const logs = [];
      snap.forEach(d => {
        const v = d.data() || {};
        const _avg = v.avgDmgPerRound || 0;
        const _tot = v.totalDmg || 0;
        const _isAnom = (_avg > _avgTh) || (_tot > _totalTh);
        if (_onlyAnomaly && !_isAnom) return;
        logs.push({
          docId: d.id,
          uid: v.uid || '',
          email: v.email || '',
          displayLabel: v.displayLabel || '',
          teamName: v.teamName || '',
          heroes: Array.isArray(v.heroes) ? v.heroes : [],
          elements: Array.isArray(v.elements) ? v.elements : [],
          rounds: v.rounds || 0,
          totalDmg: _tot,
          avgDmgPerRound: _avg,
          result: v.result || '',
          ts: v.ts || 0,
          isAnomaly: _isAnom,
        });
      });
      console.log('[arenaAdmin] 已載入 ' + logs.length + ' 筆'
        + (_onlyAnomaly ? '(僅異常)' : '')
        + ' / 異常閾值: avgDmg>' + _avgTh + ' or totalDmg>' + _totalTh);
      return logs;
    } catch (e) {
      console.error('[arenaAdmin] 列表載入失敗', e);
      return null;
    }
  };

  // 刪除單筆 arenaBattles 紀錄
  //   docId:文件 ID(uid_ts)
  //   回 {ok:true} 或 {ok:false, reason}
  window._arenaAdminDeleteBattleLog = async function(docId) {
    if (!docId) return { ok:false, reason:'missing_docId' };
    try {
      if (!window._fbDb) return { ok:false, reason:'fb_not_ready' };
      const sdk = await _getFsAdminSdk();
      const { doc, deleteDoc } = sdk || {};
      if (!doc || !deleteDoc) return { ok:false, reason:'sdk_not_ready' };
      await deleteDoc(doc(window._fbDb, 'arenaBattles', docId));
      console.log('[arenaAdmin] ✅ 已刪除 arenaBattles/' + docId);
      return { ok:true };
    } catch (e) {
      console.error('[arenaAdmin] 刪除失敗', e);
      return { ok:false, reason: (e && e.message) || 'unknown' };
    }
  };

  // 補發鬥技場入場券給指定玩家(GM 用)
  //   uid:玩家 uid
  //   n:張數(1~5,夾在上限內)
  //   reason:補償原因(寫入 adminLog,供日後追蹤)
  //   回 {ok:true, granted:N, total:M} 或 {ok:false, reason}
  window._arenaGrantTicketByUid = async function(uid, n, reason) {
    if (!uid) return { ok:false, reason:'missing_uid' };
    const _n = Math.max(1, Math.min(5, parseInt(n,10) || 1));
    const _reason = String(reason || 'GM 補償(鬥技場戰鬥異常)').slice(0, 100);
    try {
      if (!window._fbDb) return { ok:false, reason:'fb_not_ready' };
      const sdk = await _getFsAdminSdk();
      const { doc, getDoc, setDoc, updateDoc } = sdk || {};
      if (!doc || !getDoc || !setDoc) return { ok:false, reason:'sdk_not_ready' };
      const _ref = doc(window._fbDb, 'players', uid);
      const _snap = await getDoc(_ref);
      const _data = _snap.exists() ? (_snap.data() || {}) : {};
      const _bp = (_data.playerBackpack && typeof _data.playerBackpack === 'object') ? _data.playerBackpack : {};
      const _MAX_TICKETS = 5;
      const _cur = parseInt(_bp.arena_entry_ticket, 10) || 0;
      const _newTotal = Math.min(_MAX_TICKETS, _cur + _n);
      const _granted = _newTotal - _cur;
      // 寫回:用 dot-path 只動單欄,避免覆蓋其他 playerBackpack 內容
      const _payload = {
        ['playerBackpack.arena_entry_ticket']: _newTotal,
      };
      // 操作 log(append 到陣列。若 firestore arrayUnion 可用就用,否則用 setDoc merge 退到 ts key map)
      const _logEntry = {
        ts: Date.now(),
        action: 'grant_ticket',
        n: _granted,
        reason: _reason,
        by: (window._fbUser && window._fbUser.email) || '(unknown GM)',
      };
      // 用 setDoc merge 寫一個有時間戳 key 的子物件(避免讀整份 array 競態)
      const _logPath = 'adminLog.arenaCompensation.' + _logEntry.ts;
      _payload[_logPath] = _logEntry;
      if (updateDoc) {
        await updateDoc(_ref, _payload);
      } else {
        await setDoc(_ref, {
          playerBackpack: { arena_entry_ticket: _newTotal },
          adminLog: { arenaCompensation: { [_logEntry.ts]: _logEntry } },
        }, { merge: true });
      }
      console.log('[arenaAdmin] ✅ 已補發 arena_entry_ticket: uid=' + uid + ' +' + _granted
        + ' → ' + _newTotal + '/' + _MAX_TICKETS);
      return { ok:true, granted:_granted, total:_newTotal, max:_MAX_TICKETS };
    } catch (e) {
      console.error('[arenaAdmin] 補發失敗', e);
      return { ok:false, reason: (e && e.message) || 'unknown' };
    }
  };

  // 查某玩家持有的鬥技場入場券數
  window._arenaGetTicketByUid = async function(uid) {
    if (!uid) return 0;
    try {
      if (!window._fbDb) return 0;
      const sdk = await _getFsAdminSdk();
      const { doc, getDoc } = sdk || {};
      if (!doc || !getDoc) return 0;
      const _snap = await getDoc(doc(window._fbDb, 'players', uid));
      if (!_snap.exists()) return 0;
      const _bp = (_snap.data() && _snap.data().playerBackpack) || {};
      return parseInt(_bp.arena_entry_ticket, 10) || 0;
    } catch (e) {
      console.error('[arenaAdmin] 讀取持有數失敗', e);
      return 0;
    }
  };

  // 組合操作:刪除 + 補償(原子性的單次 GM 動作)
  //   docId: arenaBattles 文件 ID
  //   compensateN: 補償張數(預設 1)
  //   回 {ok:true, deleted:true, ticket:{granted, total, max}} 或 {ok:false, reason, partial}
  window._arenaAdminDeleteAndCompensate = async function(docId, compensateN) {
    compensateN = parseInt(compensateN, 10) || 1;
    if (!docId) return { ok:false, reason:'missing_docId' };
    try {
      // 1. 先讀紀錄拿到 uid(刪除後就讀不到了)
      if (!window._fbDb) return { ok:false, reason:'fb_not_ready' };
      const sdk = await _getFsAdminSdk();
      const { doc, getDoc } = sdk || {};
      if (!doc || !getDoc) return { ok:false, reason:'sdk_not_ready' };
      const _snap = await getDoc(doc(window._fbDb, 'arenaBattles', docId));
      if (!_snap.exists()) return { ok:false, reason:'log_not_found' };
      const _uid = (_snap.data() && _snap.data().uid) || '';
      if (!_uid) return { ok:false, reason:'uid_missing_in_log' };
      // 2. 補發入場券(先補後刪,刪失敗仍補了就有,玩家不虧)
      const _grant = await window._arenaGrantTicketByUid(_uid, compensateN,
        '戰鬥記錄 ' + docId + ' 被 GM 判定異常並刪除,補償入場券');
      if (!_grant.ok) return { ok:false, reason:'grant_failed:' + _grant.reason, partial:'none' };
      // 3. 刪除戰鬥紀錄
      const _del = await window._arenaAdminDeleteBattleLog(docId);
      if (!_del.ok) return { ok:false, reason:'delete_failed:' + _del.reason, partial:'ticket_granted', uid:_uid, ticket:_grant };
      return { ok:true, deleted:true, uid:_uid, ticket:_grant };
    } catch (e) {
      console.error('[arenaAdmin] 組合操作失敗', e);
      return { ok:false, reason: (e && e.message) || 'unknown' };
    }
  };

  // ──────────────────────────────────────────────────────────────────
  //  🎫 v3.13.32(2026-06-03)— 玩家側鬥技場入場券使用流程(老師需求 A)
  //  ──────────────────────────────────────────────────────────────────
  //  資料路徑:players/{uid}.playerBackpack.arena_entry_ticket(GM 補償寫入,玩家讀+扣)
  //  本機快取:window._arenaMyTicketCount(同 session 用) + localStorage(跨 session 顯示)
  //  使用流程:
  //   1. 玩家登入(或進鬥技場主頁)→ _arenaLoadMyTicketCount() 從 Firestore 拉
  //   2. 主頁 stats bar 顯示「🎫 N 張」
  //   3. 今日 3 場用完 + 持有 ≥ 1 張 → 主頁「單人挑戰」彈窗加「🎫 使用 1 張入場券」按鈕
  //   4. 點擊使用 → _arenaUseTicket() 扣 Firestore + 本機 → 設 _arenaNextBattleFromTicket=true
  //                  → 走 _arenaStartSoloBattle 跳過 _arenaCanBattle 檢查
  //   5. 戰鬥結算 → _arenaSubmitBattleLog payload 加 bonusSource:'ticket'(供 GM panel 區分)
  //  ──────────────────────────────────────────────────────────────────

  const ARENA_TICKET_LS_KEY = 'lxps_arena_ticket_count';
  const ARENA_TICKET_MAX = 5;

  // 從 Firestore 讀玩家自己的入場券持有數,寫入快取(同 session window + localStorage)
  window._arenaLoadMyTicketCount = async function() {
    try {
      let uid = '';
      try { uid = (window._fbUser && window._fbUser.uid) || window._gUserId || ''; } catch (_) {}
      if (!uid || !window._fbDb) {
        // 未登入或 Firestore 未就緒 → 用本機快取
        const _localRaw = (function(){ try { return localStorage.getItem(ARENA_TICKET_LS_KEY); } catch(_) { return null; } })();
        const _localN = _localRaw ? (parseInt(_localRaw, 10) || 0) : 0;
        window._arenaMyTicketCount = _localN;
        return _localN;
      }
      const sdk = await _getFsAdminSdk();
      const { doc, getDoc } = sdk || {};
      if (!doc || !getDoc) {
        // SDK 未就緒 → 用本機快取
        const _localRaw = (function(){ try { return localStorage.getItem(ARENA_TICKET_LS_KEY); } catch(_) { return null; } })();
        return parseInt(_localRaw || '0', 10) || 0;
      }
      const _snap = await getDoc(doc(window._fbDb, 'players', uid));
      const _bp = (_snap.exists() && _snap.data() && _snap.data().playerBackpack) || {};
      const _n = parseInt(_bp.arena_entry_ticket, 10) || 0;
      window._arenaMyTicketCount = _n;
      try { localStorage.setItem(ARENA_TICKET_LS_KEY, String(_n)); } catch (_) {}
      console.log('[arena ticket] 已載入持有數: ' + _n + '/' + ARENA_TICKET_MAX);
      return _n;
    } catch (e) {
      console.warn('[arena ticket] _arenaLoadMyTicketCount 失敗', e);
      try {
        const _localRaw = localStorage.getItem(ARENA_TICKET_LS_KEY);
        return parseInt(_localRaw || '0', 10) || 0;
      } catch (_) { return 0; }
    }
  };

  // 同步取得本機快取的入場券數(UI 用)
  window._arenaGetMyTicketCount = function() {
    if (typeof window._arenaMyTicketCount === 'number') return window._arenaMyTicketCount;
    try {
      const _raw = localStorage.getItem(ARENA_TICKET_LS_KEY);
      const _n = _raw ? (parseInt(_raw, 10) || 0) : 0;
      window._arenaMyTicketCount = _n;
      return _n;
    } catch (_) { return 0; }
  };

  // 玩家使用 1 張入場券(扣 Firestore + 本機 + 設旗標)
  // 回 {ok:true, remain:N} 或 {ok:false, reason}
  window._arenaUseTicket = async function() {
    try {
      let uid = '';
      try { uid = (window._fbUser && window._fbUser.uid) || window._gUserId || ''; } catch (_) {}
      if (!uid) return { ok:false, reason:'no_uid' };
      if (!window._fbDb) return { ok:false, reason:'fb_not_ready' };
      const sdk = await _getFsAdminSdk();
      const { doc, getDoc, updateDoc } = sdk || {};
      if (!doc || !getDoc || !updateDoc) return { ok:false, reason:'sdk_not_ready' };
      // 1. 先讀最新值(避免本機快取錯)
      const _ref = doc(window._fbDb, 'players', uid);
      const _snap = await getDoc(_ref);
      const _bp = (_snap.exists() && _snap.data() && _snap.data().playerBackpack) || {};
      const _cur = parseInt(_bp.arena_entry_ticket, 10) || 0;
      if (_cur <= 0) {
        // 雲端已 0 → 修正本機快取
        window._arenaMyTicketCount = 0;
        try { localStorage.setItem(ARENA_TICKET_LS_KEY, '0'); } catch (_) {}
        return { ok:false, reason:'no_ticket', remain:0 };
      }
      const _newN = _cur - 1;
      // 2. 扣 Firestore
      await updateDoc(_ref, {
        ['playerBackpack.arena_entry_ticket']: _newN,
        ['adminLog.arenaCompensation.' + Date.now()]: {
          ts: Date.now(),
          action: 'use_ticket',
          n: -1,
          reason: '玩家使用 1 張鬥技場入場券換取 1 場額外進場',
          by: 'player',
        },
      });
      // 3. 同步本機快取
      window._arenaMyTicketCount = _newN;
      try { localStorage.setItem(ARENA_TICKET_LS_KEY, String(_newN)); } catch (_) {}
      // 4. 設旗標:下一場戰鬥結算時 bonusSource='ticket'
      window._arenaNextBattleFromTicket = true;
      console.log('[arena ticket] ✅ 使用 1 張入場券, 剩餘 ' + _newN + '/' + ARENA_TICKET_MAX);
      return { ok:true, remain:_newN, max:ARENA_TICKET_MAX };
    } catch (e) {
      console.error('[arena ticket] _arenaUseTicket 失敗', e);
      return { ok:false, reason: (e && e.message) || 'unknown' };
    }
  };

  // 自動載入:在 Firestore + uid 就緒後 1 秒拉一次,失敗有 retry 與 localStorage 兜底
  //   設計理由:玩家可能多裝置 → 開遊戲時要同步雲端真實持有數,本機快取只當 fallback
  (function _autoLoadArenaTicket() {
    let _attempts = 0;
    const _maxAttempts = 30;  // 30 × 500ms = 15 秒
    const _tryLoad = function() {
      _attempts++;
      let uid = '';
      try { uid = (window._fbUser && window._fbUser.uid) || window._gUserId || ''; } catch (_) {}
      if (uid && window._fbDb) {
        try { window._arenaLoadMyTicketCount().catch(function(){}); } catch (_) {}
        return;
      }
      if (_attempts < _maxAttempts) {
        setTimeout(_tryLoad, 500);
      } else {
        console.log('[arena ticket] 自動載入逾時,僅用本機快取(' +
          (window._arenaGetMyTicketCount && window._arenaGetMyTicketCount()) + ' 張)');
      }
    };
    setTimeout(_tryLoad, 1000);
  })();


  try {
    console.log('[arena.js] 載入完成 ' + ARENA_CONFIG.VERSION
      + '(系統 ' + _ARENA_AI_TEAMS.length + ' 套 + 雲端玩家池'
      + ', 抽取比 ' + Math.round(ARENA_CONFIG.CLOUD_POOL_RATIO * 100) + '%/'
      + Math.round((1 - ARENA_CONFIG.CLOUD_POOL_RATIO) * 100) + '%)');
  } catch (_) {}
})();
