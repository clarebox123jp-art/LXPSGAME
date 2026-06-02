// ════════════════════════════════════════════════════════════════════════
//  arena.js  —  英雄鬥技場核心配置與邏輯
//  建立日:2026-06-02   /   v3.13.15(2026-06-02)雲端陣容池系統
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
    VERSION: 'v3.13.20',   // ★ v3.13.20(2026-06-02)— GM 後台:鬥技場入口開關 + 戰鬥記錄上傳審核
    TEAM_SIZE: 4,                  // 4v4
    FIXED_LEVEL: 1,                // LV1 公平戰
    QUIZ_TIME: 30,                 // 30 秒搶答(沿用既有冒險模式設定)
    MAX_ROUNDS: 10,                // 戰鬥 10 回合上限
    DAILY_BATTLE_LIMIT: 2,         // 每日場次上限
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
  // ──────────────────────────────────────────────────────────────────
  const ARENA_AI_TEAMS_DEFAULT = [
    {
      id: 'sys_1',
      name: '[鬥技場預設] 聖盾守護隊',
      desc: '聖騎士護全隊、守衛抗暴、祭司治療、火法師輸出',
      heroes: ['聖騎士', '守衛', '祭司', '火法師'],
      elements: ['light', 'earth', 'light', 'fire'],
      strategy: 'tank_heal_dmg',
    },
    {
      id: 'sys_2',
      name: '[鬥技場預設] 雷霆控場隊',
      desc: '雷法師爆控、暗法師封印、神射手必中、米鈴反擊解狀態',
      heroes: ['雷法師', '暗法師', '神射手', '米鈴'],
      elements: ['wind', 'dark', 'wind', 'water'],
      strategy: 'control_burst',
    },
    {
      id: 'sys_3',
      name: '[鬥技場預設] 舞動陣勢隊',
      desc: '舞者強化全隊、武鬥家輸出、吟遊詩人催眠、學者奪能反擊',
      heroes: ['舞者', '武鬥家', '吟遊詩人', '學者'],
      elements: ['light', 'fire', 'water', 'wind'],
      strategy: 'buff_combo',
    },
    {
      id: 'sys_4',
      name: '[鬥技場預設] 快攻刺客隊',
      desc: '刺客出血、田徑速攻、神偷削弱、煉金治療免疫',
      heroes: ['刺客', '田徑隊員', '神偷', '煉金術師'],
      elements: ['dark', 'wind', 'dark', 'grass'],
      strategy: 'speed_dmg',
    },
    {
      id: 'sys_5',
      name: '[鬥技場預設] 元素法團隊',
      desc: '火法師+冰法師+雷法師三系AoE壓場、祭司穩定治療',
      heroes: ['火法師', '冰法師', '雷法師', '祭司'],
      elements: ['fire', 'water', 'wind', 'light'],
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
      // 防呆 3:不可包含 BOSS 名(避免 GM 不慎或舊資料污染)
      if (typeof BOSS_NAMES !== 'undefined' && Array.isArray(BOSS_NAMES)) {
        for (const hname of team.heroes) {
          if (BOSS_NAMES.indexOf(hname) >= 0) return false;
        }
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
      try {
        const ros = (typeof window._getRosterEntry === 'function')
          ? window._getRosterEntry((email || '').toLowerCase().trim()) : null;
        if (ros && typeof window._formatRosterLabel === 'function') {
          displayLabel = window._formatRosterLabel(ros);
        }
      } catch (_) {}
      // 沒名冊就用暱稱遮罩
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
  window._arenaPickAITeam = function(opts) {
    try {
      const useCloud = !(opts && opts.systemOnly);
      // 1. 若快取已就緒,按 70/30 機率抽取
      if (useCloud && _cloudPoolCache && _cloudPoolCache.length) {
        const r = Math.random();
        if (r < ARENA_CONFIG.CLOUD_POOL_RATIO) {
          const picked = _cloudPoolCache[Math.floor(Math.random() * _cloudPoolCache.length)];
          return {
            name: picked.name,
            heroes: picked.heroes,
            elements: picked.elements || [],
            _isPlayerTeam: true,
            _ownerUid: picked._ownerUid,
            _ownerLabel: picked._ownerLabel,
            _slotKey: picked._slotKey,
          };
        }
      }
      // 2. 走系統 5 套
      const sys = _ARENA_AI_TEAMS[Math.floor(Math.random() * _ARENA_AI_TEAMS.length)];
      // 觸發雲端池抓取(背景非同步,下次刷新就有了)
      if (useCloud && !_cloudPoolFetching) {
        setTimeout(() => { window._arenaFetchTeamPool().catch(() => {}); }, 100);
      }
      return {
        name: sys.name,
        heroes: sys.heroes.slice(),
        elements: (sys.elements || []).slice(),
        _isPlayerTeam: false,
        _systemId: sys.id,
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
        zhengTotal: 0,  // 鬥技之證累積(全部歷史)
      };
      // 保留歷史鬥技之證累積
      try {
        const histRaw = localStorage.getItem('lxps_arena_zheng_total');
        if (histRaw) s.zhengTotal = parseInt(histRaw, 10) || 0;
      } catch (_) {}
      _writeDailyState(s);
    }
    return s;
  };

  // 檢查是否還能戰鬥(每日 2 場)
  window._arenaCanBattle = function() {
    const s = window._arenaGetDailyState();
    return s.battlesPlayed < ARENA_CONFIG.DAILY_BATTLE_LIMIT;
  };

  // 檢查是否還能刷新(每日 3 次)
  window._arenaCanRefresh = function() {
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
    if (result === 'win')      { zheng = ARENA_CONFIG.REWARD_WIN;  s.wins   = (s.wins||0)   + 1; }
    else if (result === 'draw'){ zheng = ARENA_CONFIG.REWARD_DRAW; s.draws  = (s.draws||0)  + 1; }
    else                        { zheng = ARENA_CONFIG.REWARD_LOSE; s.losses = (s.losses||0) + 1; }
    s.zhengTotal = (s.zhengTotal || 0) + zheng;
    _writeDailyState(s);
    try {
      localStorage.setItem('lxps_arena_zheng_total', String(s.zhengTotal));
    } catch (_) {}
    // ★ v3.13.20(2026-06-02) — 結算同時上傳戰鬥記錄(供 GM 異常傷害審核)
    //   fire-and-forget,失敗不影響玩家獎勵發放
    try { window._arenaSubmitBattleLog && window._arenaSubmitBattleLog(result); } catch (_) {}
    return { zheng, total: s.zhengTotal, state: s };
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
        v: 'v3.13.20',
      };
      await setDoc(doc(window._fbDb, 'arenaBattles', docId), payload);
      console.log('[arena] 戰鬥記錄已上傳: ' + result + ' / 總傷 ' + totalDmg
        + ' / 回合 ' + rounds + ' / 平均 ' + avgDmgPerRound);
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
    return {
      todayBattles: s.battlesPlayed || 0,
      todayBattleLimit: ARENA_CONFIG.DAILY_BATTLE_LIMIT,
      todayRefreshes: s.refreshesUsed || 0,
      todayRefreshLimit: ARENA_CONFIG.DAILY_REFRESH_LIMIT,
      todayWins: s.wins || 0,
      todayDraws: s.draws || 0,
      todayLosses: s.losses || 0,
      zhengTotal: s.zhengTotal || 0,
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
  //  ✅  載入完成標記
  // ──────────────────────────────────────────────────────────────────
  window._arenaLoaded = true;
  try {
    console.log('[arena.js] 載入完成 ' + ARENA_CONFIG.VERSION
      + '(系統 ' + _ARENA_AI_TEAMS.length + ' 套 + 雲端玩家池'
      + ', 抽取比 ' + Math.round(ARENA_CONFIG.CLOUD_POOL_RATIO * 100) + '%/'
      + Math.round((1 - ARENA_CONFIG.CLOUD_POOL_RATIO) * 100) + '%)');
  } catch (_) {}
})();
