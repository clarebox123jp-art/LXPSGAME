/* ════════════════════════════════════════════════════════════════════
 * world-boss.js — 世界 BOSS 討伐戰獨立模組
 * ────────────────────────────────────────────────────────────────────
 * 為了讓主程式 index.html 不繼續增肥,世界 BOSS 系統除「Firebase 連線層
 * _wbNet」必須留在主程式 module 內以外,其餘全部移到本檔。
 *
 * 載入方式:在主程式 <body> 結尾 (最後一個 </script> 後) 加上
 *   <script src="world-boss.js" defer></script>
 *
 * 載入後本檔會「自動」做以下事情:
 *   1. 把元素龍清單、掉落、隊伍排名獎勵掛到 window 上
 *   2. 把玉山火龍王的 HERO_DB / BURST_DB / HERO_TRAIT / HERO_LORE
 *      用 Object.assign 合併到主程式既有的全域物件
 *   3. 把玉山火龍王立繪 URL 補進 HERO_IMGS
 *   4. 把 16 枚世界 BOSS 獎章 + 13 個統計欄位安全地合併到 ALL_MEDALS /
 *      _medalStats (用「補齊」模式,不會覆蓋既有資料)
 *   5. 攔截 execSkill 處理玉山火龍王 3 招(透過 window._wbHookExecSkill)
 *   6. 提供 _openWorldBossEntry / _wbRefreshBlessingBanner 入口函式
 *      (按鈕 onclick 會呼叫到)
 *   7. 點按鈕時才 fetch('world-boss-ui.html') 注入 UI Overlay
 *
 * 連線層 _wbNet 在主程式裡(因要用 Firebase module 內 import 的 doc/setDoc
 * /onSnapshot…),本檔只透過 window._wbNet 介面跟它對話。
 *
 * 版本: v2.0 (2026-05-15)
 * ════════════════════════════════════════════════════════════════════ */

(function setupWorldBossModule(){
  'use strict';

  // ───────────────────────────────────────────────────────────────────
  // 1. 元素龍清單 (8 隻輪替,全伺服器共享 HP)
  // ───────────────────────────────────────────────────────────────────
  window.WORLD_BOSS_LINEUP = [
    { id:'yushan_fire_dragon',     name:'玉山火龍王',    element:'fire',  maxHp:800000,  scene:'玉山火口',
      desc:'沉睡於玉山火口的古老火龍「炎之翼」,每三百年甦醒一次' },
    { id:'shenhai_water_dragon',   name:'深海冰龍王',    element:'water', maxHp:900000,  scene:'太平洋深淵',
      desc:'蛰伏於馬里亞納海溝的冰龍,以絕對零度凍結整片海洋' },
    { id:'taifeng_wind_dragon',    name:'風雷雲龍王',    element:'wind',  maxHp:850000,  scene:'颱風眼',
      desc:'颱風中央誕生的雷雲龍,捲起整座島嶼的氣流' },
    { id:'shanyue_earth_dragon',   name:'山岳土龍王',    element:'earth', maxHp:1000000, scene:'地核深處',
      desc:'盤據於地核的古老土龍,一動就引發強震' },
    { id:'bushi_dark_dragon',      name:'不死骨龍王',    element:'dark',  maxHp:1100000, scene:'黃泉之門',
      desc:'從黃泉之門爬出的骨龍,擊敗一次後會以半血復活再戰' },
    { id:'shensheng_light_dragon', name:'神聖光龍王',    element:'light', maxHp:1200000, scene:'高天原',
      desc:'天界派遣的審判龍,僅暗系英雄能對其造成完整傷害' },
    { id:'cuiyu_grass_dragon',     name:'翠玉草龍王',    element:'grass', maxHp:1300000, scene:'太魯閣',
      desc:'守護太魯閣峽谷的翠玉龍,藤蔓束縛全場' },
    { id:'xingchen_omni_dragon',   name:'星辰幻龍王',    element:'omni',  maxHp:1500000, scene:'銀河',
      desc:'集八元素之力於一身的終極龍,每階段切換屬性' },
  ];

  // ───────────────────────────────────────────────────────────────────
  // 2. 掉落物 (依個人傷害%分級)
  // ───────────────────────────────────────────────────────────────────
  window._WORLD_BOSS_DROPS = {
    yushan_fire_dragon: {
      treasure: { id:'wb_dragon_scale_fire',  icon:'🔥', name:'火龍鱗甲',  color:'#ff6644', price:12000, rarity:'mythical' },
      bonusItems: [
        { id:'wb_dragon_fang_fire',  icon:'🦷', name:'火龍獠牙', price:4500, rate:0.30 },
        { id:'wb_dragon_blood_fire', icon:'🩸', name:'火龍精血', price:3200, rate:0.45 },
      ],
      coinBase:5000, coinSilver:12000, coinGold:25000,
    },
    shenhai_water_dragon: {
      treasure: { id:'wb_dragon_scale_water', icon:'💧', name:'冰龍鱗甲',  color:'#3296ff', price:13000, rarity:'mythical' },
      bonusItems: [
        { id:'wb_dragon_fang_water', icon:'❄', name:'冰龍獠牙', price:5000, rate:0.30 },
      ],
      coinBase:5500, coinSilver:13500, coinGold:27000,
    },
    // (其他元素龍掉落物待後續設計)
  };

  // ───────────────────────────────────────────────────────────────────
  // 3. 龍王祝福加成倍率 (全伺服器共用)
  // ───────────────────────────────────────────────────────────────────
  window._wbGetBlessingMult = function(){
    try{
      const blessing = window._cachedGlobalStats && window._cachedGlobalStats.wbBlessing;
      if(!blessing || !blessing.active) return 1.0;
      if(blessing.expiresAt && blessing.expiresAt < Date.now()) return 1.0;
      return 1 + ((blessing.bonusPct || 0) / 100);
    }catch(e){ return 1.0; }
  };

  // ───────────────────────────────────────────────────────────────────
  // 4. 隊伍排名獎勵分級表
  // ───────────────────────────────────────────────────────────────────
  window._WORLD_BOSS_TEAM_REWARDS = {
    legendary: {
      rankRange: '1', tier: '🏆 傳奇',
      coins: 50000, treasureChance: 1.0, treasureRarity: 'mythical',
      summonCrystals: 5, titleTemplate: '屠龍者・{bossName}', expScrolls: 5,
    },
    epic: {
      rankRange: '2-10', tier: '🥈 史詩',
      coins: 25000, treasureChance: 1.0, treasureRarity: 'mythical',
      summonCrystals: 3, expScrolls: 3,
    },
    rare: {
      rankRange: '11-50', tier: '🥉 稀有',
      coins: 12000, treasureChance: 1.0, treasureRarity: 'legendary',
      summonCrystals: 1, expScrolls: 2,
    },
    normal: {
      rankRange: '51-200', tier: '📦 普通',
      coins: 6000, treasureChance: 0.30, treasureFragments: 3, expScrolls: 1,
    },
    memorial: {
      rankRange: '200+', tier: '🎁 紀念',
      coins: 2000, expScrolls: 1,
    },
  };

  window._wbGetRewardTier = function(rank){
    if(rank === 1)        return 'legendary';
    if(rank <= 10)        return 'epic';
    if(rank <= 50)        return 'rare';
    if(rank <= 200)       return 'normal';
    return 'memorial';
  };

  window._wbCalcTeamId = function(playerUids){
    if(!Array.isArray(playerUids) || playerUids.length === 0) return null;
    return playerUids.filter(u => u).sort().join('|');
  };

  // ───────────────────────────────────────────────────────────────────
  // 5. 玉山火龍王資料 — 自動 Object.assign 掛到主程式既有 DB
  //    (主程式啟動完成後才掛,避免初始化順序問題)
  // ───────────────────────────────────────────────────────────────────
  function _wbInstallHeroData(){
    // HERO_DB:基礎屬性
    if(typeof window.HERO_DB === 'object' && window.HERO_DB){
      Object.assign(window.HERO_DB, {
        '玉山火龍王':{hp:28000,atk:42,sp:55,spd:12,exp:600,
          s1:{n:'業火灼燒',c:5,d:'特技90%全體火屬性傷害,對HP最低2人附加燃燒3回合',fd:'噴出無盡業火灼燒全場!用特技值的 90% 對全體對手造成火屬性傷害,並對 HP 最低的 2 名對手附加「燃燒」狀態 3 回合(行動前後各損失 6 HP)。'},
          s2:{n:'龍吼震懾',c:6,d:'攻擊110%全體火屬性傷害,50%機率眩暈1回合',fd:'發出震天龍吼!用攻擊值的 110% 對全體對手造成火屬性傷害,每名對手有 50% 機率「眩暈」1 回合不能動。'}
        },
      });
    }

    // BURST_DB:爆發技
    if(typeof window.BURST_DB === 'object' && window.BURST_DB){
      Object.assign(window.BURST_DB, {
        '玉山火龍王': {n:'天崩之炎', d:'全體當前HP 80%傷害(可被無敵/免疫/盾減免),自身回血5%', fd:'三百年怒火一次釋放!對全體對手造成當前 HP 80% 的火屬性傷害(無視防禦,可被「無敵」/「免疫」完全擋下,「護盾」減半),並消耗目標身上的盾;自身回復最大 HP 的 5%。'},
      });
    }

    // HERO_TRAIT:天賦
    if(typeof window.HERO_TRAIT === 'object' && window.HERO_TRAIT){
      Object.assign(window.HERO_TRAIT, {
        '玉山火龍王': { name:'炎之意志', icon:'🐉', desc:'單次受到的傷害不超過最大 HP 的 4%;HP 過半啟動四元素護盾', fd:'三百年沉睡淬煉的炎之意志,單次受傷上限為最大 HP 的 4%。HP 降至 50% 時進入第二階段,身上浮現四元素護盾,需要對應屬性(火/水/土/風)的攻擊各打 3 次裂痕才能打破。' },
      });
    }

    // HERO_LORE:背景
    if(typeof window.HERO_LORE === 'object' && window.HERO_LORE){
      Object.assign(window.HERO_LORE, {
        '玉山火龍王': '沉睡於玉山火口的古老火龍「炎之翼」,每三百年甦醒一次。日治時期最後一次出現是 1923 年關東大地震當晚,牠在玉山頂端長嘯三聲後鑽回火口。學者認為牠的火焰是台灣造山運動的能量源。近年地殼活動頻繁,火龍王再度甦醒,需要四位英雄前往封印。',
      });
    }

    // HERO_BIO:簡介 (給卡片用)
    if(typeof window.HERO_BIO === 'object' && window.HERO_BIO){
      Object.assign(window.HERO_BIO, {
        '玉山火龍王': '沉睡於玉山火口的古老火龍,需要 4 位英雄聯手才能封印的世界 BOSS。',
      });
    }

    // HERO_IMGS:立繪
    if(typeof window.HERO_IMGS === 'object' && window.HERO_IMGS){
      window.HERO_IMGS['玉山火龍王'] =
        'https://raw.githubusercontent.com/clarebox123jp-art/LXPSGAME/main/' +
        encodeURIComponent('玉山火龍王.png');
    }

    // MONSTER_AVTR / MONSTER_ELEMENT (用於圖鑑頁面)
    if(typeof window.MONSTER_AVTR === 'object' && window.MONSTER_AVTR){
      window.MONSTER_AVTR['玉山火龍王'] = '🐉';
    }
    if(typeof window.MONSTER_ELEMENT === 'object' && window.MONSTER_ELEMENT){
      window.MONSTER_ELEMENT['玉山火龍王'] = 'fire';
    }

    console.log('[WB] ✅ 玉山火龍王資料已掛載');
  }

  // ───────────────────────────────────────────────────────────────────
  // 6. 玉山火龍王技能邏輯 (透過 hook 接到 execSkill 末端)
  //    在 execSkill 函式裡找一個適合的位置呼叫:
  //      if(window._wbHookExecSkill && window._wbHookExecSkill(n,a,t,al,enemies)) return;
  //    但因為侵入式修改 execSkill 風險高,改用「監聽技能名」方式:
  //      window._wbExecSkillFallback(n, a, t, al, enemies) → true 表示已處理
  // ───────────────────────────────────────────────────────────────────
  window._wbExecSkillFallback = function(n, a, t, al, enemies){
    // 只處理玉山火龍王的 3 招
    if(n === '業火灼燒'){
      try{
        enemies.forEach(e => {
          if(e.curHp > 0){
            doDmg(e, Math.floor(spv(a) * 0.9), {actor:a, isSkill:true, isAoe:true, element:'fire'});
          }
        });
        const sorted = enemies.filter(e => e.curHp > 0).sort((x, y) => x.curHp - y.curHp);
        sorted.slice(0, 2).forEach(e => addStatus(e, 'burn', 3));
        bannerFX(a, '🔥 業火灼燒!', '#ff6644', 1200);
      }catch(e){ console.warn('[WB] 業火灼燒執行失敗', e); }
      return true;
    }
    if(n === '龍吼震懾'){
      try{
        enemies.forEach(e => {
          if(e.curHp > 0){
            doDmg(e, Math.floor(atkv(a) * 1.1), {actor:a, isSkill:true, isAoe:true, element:'fire'});
            if(e.curHp > 0 && Math.random() < 0.50) addStatus(e, 'stun', 1);
          }
        });
        bannerFX(a, '🐉 龍吼震懾!', '#cc4422', 1200);
      }catch(e){ console.warn('[WB] 龍吼震懾執行失敗', e); }
      return true;
    }
    if(n === '天崩之炎'){
      try{
        enemies.forEach(e => {
          if(e.curHp <= 0) return;
          if(typeof hasStatus === 'function'){
            if(hasStatus(e, 'invincible')){
              log(`✨ ${e.name} 的無敵狀態擋下了天崩之炎!`);
              if(typeof removeStatus === 'function') removeStatus(e, 'invincible');
              return;
            }
            if(hasStatus(e, 'immune')){
              log(`🛡 ${e.name} 的免疫狀態擋下了天崩之炎!`);
              if(typeof removeStatus === 'function') removeStatus(e, 'immune');
              return;
            }
          }
          let dmgPct = 0.80;
          if(typeof hasStatus === 'function' && hasStatus(e, 'shield')){
            dmgPct = 0.40;
            if(typeof removeStatus === 'function') removeStatus(e, 'shield');
            log(`🛡 ${e.name} 的護盾將傷害減半...`);
          }
          const _dmg = Math.floor(e.curHp * dmgPct);
          doDmg(e, _dmg, {actor:a, isSkill:true, isAoe:true, ignoreEvasion:true, piercing:true, element:'fire'});
        });
        if(typeof doHeal === 'function') doHeal(a, Math.floor(a.hp * 0.05), {actor:a, isHeal:true});
        bannerFX(a, '⚡ 天崩之炎降臨!', '#ee2222', 1800);
        if(typeof flashScreen === 'function') flashScreen('rgba(255,80,40,0.8)', 700);
      }catch(e){ console.warn('[WB] 天崩之炎執行失敗', e); }
      return true;
    }
    return false;
  };

  // ───────────────────────────────────────────────────────────────────
  // 7. 獎章定義 + 統計欄位 — 自動補進主程式既有 ALL_MEDALS / _medalStats
  // ───────────────────────────────────────────────────────────────────
  const WB_MEDALS = [
    { id:'wb_first_clear',      icon:'🌍', name:'首次討伐',  desc:'第一次參與並擊敗任何世界 BOSS',                  cat:'世界BOSS' },
    { id:'wb_yushan_kill',      icon:'🐉', name:'屠龍勇者',  desc:'擊敗玉山火龍王',                                 cat:'世界BOSS' },
    { id:'wb_yushan_speedrun',  icon:'⚡', name:'三分速通',  desc:'3 分鐘內擊敗玉山火龍王',                        cat:'世界BOSS' },
    { id:'wb_mvp_first',        icon:'👑', name:'首次 MVP',  desc:'在一場世界 BOSS 戰中取得 MVP',                   cat:'世界BOSS' },
    { id:'wb_mvp_3',            icon:'👑', name:'三冠王',    desc:'累積 3 次世界 BOSS MVP',                         cat:'世界BOSS' },
    { id:'wb_no_ko',            icon:'🛡', name:'銅牆鐵壁',  desc:'擊敗世界 BOSS 時全員無人倒下',                   cat:'世界BOSS' },
    { id:'wb_break_all_shields',icon:'💥', name:'破盾達人',  desc:'同一場戰鬥中親手破壞 2 個以上元素護盾',          cat:'世界BOSS' },
    { id:'wb_solo_save',        icon:'💖', name:'最後的希望',desc:'單英雄存活擊敗世界 BOSS(其他 3 人都倒下)',     cat:'世界BOSS' },
    { id:'wb_revive_5',         icon:'🌟', name:'再生使徒',  desc:'單場世界 BOSS 戰復活隊友達 3 次',                cat:'世界BOSS' },
    { id:'wb_team_play_5',      icon:'👥', name:'團隊夥伴',  desc:'累積完成 5 場世界 BOSS 戰(勝負不限)',           cat:'世界BOSS' },
    { id:'wb_team_play_25',     icon:'👥', name:'戰隊核心',  desc:'累積完成 25 場世界 BOSS 戰',                     cat:'世界BOSS' },
    { id:'wb_full_party_win',   icon:'🎖', name:'完美陣容',  desc:'4 人滿員擊敗世界 BOSS(沒有 AI 替補)',           cat:'世界BOSS' },
    { id:'wb_three_crowns',     icon:'👑', name:'三冠加身',  desc:'單場世界 BOSS 戰中拿到 5 大稱號中的 3 個以上',   cat:'世界BOSS' },
    { id:'wb_team_top1',        icon:'🏆', name:'屠龍者',    desc:'你的隊伍在某次世界 BOSS 戰中拿到全伺服器第 1 名',cat:'世界BOSS' },
    { id:'wb_team_top10',       icon:'🥈', name:'史詩戰隊',  desc:'你的隊伍在某次世界 BOSS 戰中進入全伺服器前 10 名',cat:'世界BOSS' },
    { id:'wb_team_top50',       icon:'🥉', name:'稀有戰隊',  desc:'你的隊伍在某次世界 BOSS 戰中進入全伺服器前 50 名',cat:'世界BOSS' },
  ];

  const WB_MEDAL_STAT_DEFAULTS = {
    wbClears:                0,
    wbWins:                  0,
    wbMvpCount:              0,
    wbBossKills:             {},
    wbShieldsBrokenTotal:    0,
    wbMaxRevivesInOneBattle: 0,
    wbBestClearTime:         {},
    wbTotalDmgDealt:         0,
    wbTotalHealDone:         0,
    wbBestTeamRank:          {},
    wbBossTeamRankings:      [],
  };

  function _wbInstallMedals(){
    // 把獎章 push 進主程式既有的 ALL_MEDALS (如果存在)
    if(Array.isArray(window.ALL_MEDALS)){
      const existingIds = new Set(window.ALL_MEDALS.map(m => m.id));
      WB_MEDALS.forEach(m => {
        if(!existingIds.has(m.id)) window.ALL_MEDALS.push(m);
      });
    }
    // 把統計欄位安全補齊到 _medalStats (如果存在)
    if(window._medalStats && typeof window._medalStats === 'object'){
      Object.keys(WB_MEDAL_STAT_DEFAULTS).forEach(k => {
        if(typeof window._medalStats[k] === 'undefined'){
          // 物件用 deep copy 防止共用引用
          const def = WB_MEDAL_STAT_DEFAULTS[k];
          window._medalStats[k] = (typeof def === 'object' && def !== null)
            ? (Array.isArray(def) ? [] : {})
            : def;
        }
      });
    }
    console.log('[WB] ✅ ' + WB_MEDALS.length + ' 枚世界 BOSS 獎章已掛載');
  }

  // ───────────────────────────────────────────────────────────────────
  // 8. UI Overlay 動態載入 (lazy load)
  //    第一次點按鈕時 fetch world-boss-ui.html 注入 body
  // ───────────────────────────────────────────────────────────────────
  let _wbUiLoaded = false;
  let _wbUiLoadingPromise = null;

  async function _wbEnsureUi(){
    if(_wbUiLoaded) return true;
    if(_wbUiLoadingPromise) return _wbUiLoadingPromise;

    _wbUiLoadingPromise = (async () => {
      try{
        const resp = await fetch('world-boss-ui.html', { cache: 'no-cache' });
        if(!resp.ok) throw new Error('HTTP ' + resp.status);
        const html = await resp.text();

        // 建立一個 div 容器,放整段 UI HTML
        const container = document.createElement('div');
        container.id = 'wb-ui-container';
        // 用 insertAdjacentHTML 而不是 innerHTML,這樣 <style> 能立即被瀏覽器解析套用
        container.insertAdjacentHTML('beforeend', html);
        document.body.appendChild(container);

        // 但 innerHTML/insertAdjacentHTML 賦值都不會執行 <script>,要重新建立
        const scripts = container.querySelectorAll('script');
        for(const oldScript of scripts){
          const newScript = document.createElement('script');
          // 複製屬性
          for(const attr of oldScript.attributes){
            newScript.setAttribute(attr.name, attr.value);
          }
          newScript.textContent = oldScript.textContent;
          oldScript.parentNode.replaceChild(newScript, oldScript);
        }

        _wbUiLoaded = true;
        console.log('[WB] ✅ UI Overlay 已 lazy load 注入 (' +
                    container.querySelectorAll('style').length + ' style + ' +
                    scripts.length + ' script)');
        return true;
      }catch(e){
        console.error('[WB] UI 載入失敗', e);
        _wbUiLoadingPromise = null; // 允許重試
        return false;
      }
    })();
    return _wbUiLoadingPromise;
  }

  // ───────────────────────────────────────────────────────────────────
  // 9. 入口函式 — 按鈕 onclick 呼叫
  // ───────────────────────────────────────────────────────────────────
  window._openWorldBossEntry = async function(){
    // 檢查登入
    if(!window._gUserId){
      alert('🌍 世界 BOSS 討伐戰\n\n需要先 Google 登入才能跟好友一起連線打喔!\n請先在右上角登入。');
      return;
    }
    // 確保 UI 已注入
    const ok = await _wbEnsureUi();
    if(!ok){
      alert('🌍 世界 BOSS 討伐戰\n\nUI 載入失敗,請檢查網路或重新整理頁面。\n(world-boss-ui.html 需要跟 index.html 放在同一個目錄)');
      return;
    }
    // 顯示入口 overlay
    const ov = document.getElementById('wb-entry-overlay');
    if(ov){
      ov.style.display = 'flex';
      try{ _wbRefreshBlessingBanner(); }catch(_){}
    }else{
      alert('🌍 世界 BOSS 討伐戰功能即將開放,敬請期待!\n\n首發 BOSS:玉山火龍王 🐉');
    }
  };

  window._closeWorldBossEntry = function(){
    const ov = document.getElementById('wb-entry-overlay');
    if(ov) ov.style.display = 'none';
  };

  window._wbRefreshBlessingBanner = function(){
    const banner = document.getElementById('wb-blessing-banner');
    if(!banner) return;
    const blessing = window._cachedGlobalStats && window._cachedGlobalStats.wbBlessing;
    if(!blessing || !blessing.active || (blessing.expiresAt && blessing.expiresAt < Date.now())){
      banner.style.display = 'none';
      return;
    }
    banner.style.display = 'block';
    const nameEl = document.getElementById('wb-blessing-bossname');
    if(nameEl){
      nameEl.textContent = (blessing.bossName || '世界 BOSS') +
        ' 已被全伺服器擊敗!所有玩家 EXP / 知識幣 / 掉寶率 +' + (blessing.bonusPct || 10) + '%';
    }
    const countdownEl = document.getElementById('wb-blessing-countdown');
    if(countdownEl){
      const remainMs = blessing.expiresAt - Date.now();
      const hours = Math.floor(remainMs / 3600000);
      const minutes = Math.floor((remainMs % 3600000) / 60000);
      countdownEl.textContent = `剩餘 ⏳ ${hours} 小時 ${minutes} 分鐘`;
    }
  };

  // ───────────────────────────────────────────────────────────────────
  // 10. 啟動 — 等主程式各個 DB 準備好後才掛載
  // ───────────────────────────────────────────────────────────────────
  function _wbBootstrap(){
    let tries = 0;
    function tryInstall(){
      tries++;
      // 等 HERO_DB 和 ALL_MEDALS 都準備好
      const dbReady = (typeof window.HERO_DB === 'object' && window.HERO_DB &&
                       typeof window.BURST_DB === 'object' && window.BURST_DB);
      const medalsReady = Array.isArray(window.ALL_MEDALS);

      if(dbReady){
        _wbInstallHeroData();
      }else if(tries < 30){
        // 主程式還在初始化,500ms 後再試
        return setTimeout(tryInstall, 500);
      }else{
        console.warn('[WB] HERO_DB 未就緒 — 玉山火龍王資料未掛載');
      }

      if(medalsReady){
        _wbInstallMedals();
      }else if(tries < 30){
        // 獎章可能更晚才初始化,單獨重試
        let medalTries = 0;
        const medalTimer = setInterval(() => {
          medalTries++;
          if(Array.isArray(window.ALL_MEDALS)){
            _wbInstallMedals();
            clearInterval(medalTimer);
          }else if(medalTries > 30){
            clearInterval(medalTimer);
            console.warn('[WB] ALL_MEDALS 未就緒 — 16 枚獎章未掛載');
          }
        }, 500);
      }

      console.log('[WB] ✅ world-boss.js 啟動完成 (v2.0)');
    }

    // DOM ready 後開始嘗試
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', tryInstall);
    }else{
      // 已經 loaded,稍微延後一下讓主程式 IIFE 先跑
      setTimeout(tryInstall, 100);
    }
  }

  _wbBootstrap();
})();
