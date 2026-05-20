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
 *   2. 把維蘇威火山龍王的 HERO_DB / BURST_DB / HERO_TRAIT / HERO_LORE
 *      用 Object.assign 合併到主程式既有的全域物件
 *   3. 把維蘇威火山龍王立繪 URL 補進 HERO_IMGS
 *   4. 把 16 枚世界 BOSS 獎章 + 13 個統計欄位安全地合併到 ALL_MEDALS /
 *      _medalStats (用「補齊」模式,不會覆蓋既有資料)
 *   5. 攔截 execSkill 處理維蘇威火山龍王 3 招(透過 window._wbHookExecSkill)
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

  // ═══════════════════════════════════════════════════════════════════
  // ★ FIX 20260517 — 遊戲內彈窗 (取代瀏覽器原生 alert/confirm)
  // ───────────────────────────────────────────────────────────────────
  // 為什麼要做這個?
  //   1. 瀏覽器原生 alert/confirm 的字體在 iPad 上非常小,而且樣式無法控制
  //   2. iOS Safari 的 alert 還會直接卡住整個畫面,觸控體驗極差
  //   3. 字體大小要對齊主程式「技能詳細小視窗」(sdp-desc:33px)
  //
  // 設計:
  //   - _wbGameAlert(msg) 回傳 Promise<void>,使用者按確定才 resolve
  //   - _wbGameConfirm(msg) 回傳 Promise<boolean>,確定 true / 取消 false
  //   - z-index 設 99999,確保蓋在所有遊戲視窗之上
  //   - 點背景遮罩 = 取消(只對 confirm 有效)
  //   - ESC 鍵 = 取消(只對 confirm 有效;alert 不能取消必須按確定)
  // ═══════════════════════════════════════════════════════════════════
  function _wbGamePopup(msg, isConfirm){
    return new Promise(function(resolve){
      try{ if(typeof playSfx === 'function') playSfx('sfx-popup', 0.5); }catch(_){}
      try{ const _old = document.getElementById('wb-game-popup'); if(_old) _old.remove(); }catch(_){}

      const ov = document.createElement('div');
      ov.id = 'wb-game-popup';
      ov.style.cssText =
        'position:fixed;inset:0;z-index:99999;'
        + 'background:rgba(0,0,0,0.72);'
        + 'display:flex;align-items:center;justify-content:center;'
        + 'padding:20px;font-family:"M PLUS Rounded 1c","Nunito",sans-serif;'
        + 'animation:wbPopupFadeIn 0.18s ease-out;';

      const safeMsg = String(msg || '')
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;').replace(/'/g,'&#39;')
        .replace(/\n/g,'<br>');

      ov.innerHTML =
        '<div class="wb-gp-box" style="'
        + 'background:linear-gradient(160deg,#1a1d2e 0%,#0d0f1a 100%);'
        + 'border:3px solid #d4a843;border-radius:18px;'
        + 'padding:28px 32px 26px;max-width:min(640px,92vw);min-width:min(360px,92vw);'
        + 'max-height:88vh;overflow-y:auto;'
        + 'box-shadow:0 0 48px rgba(212,168,67,0.55),0 8px 40px rgba(0,0,0,0.9);'
        + 'animation:wbPopupBoxIn 0.22s cubic-bezier(0.34,1.56,0.64,1);'
        + 'text-align:center;">'
        +   '<div class="wb-gp-msg" style="'
        +     'font-size:33px;color:#f0ead8;line-height:1.6;font-weight:500;'
        +     'letter-spacing:0.5px;margin-bottom:24px;text-align:left;'
        +     'white-space:pre-wrap;word-break:break-word;">'
        +     safeMsg
        +   '</div>'
        +   '<div class="wb-gp-btn-row" style="'
        +     'display:flex;gap:14px;justify-content:center;flex-wrap:wrap;">'
        +     (isConfirm
        ?       '<button class="wb-gp-btn wb-gp-cancel" style="'
                + 'min-width:140px;padding:14px 28px;font-size:28px;font-weight:800;'
                + 'cursor:pointer;font-family:inherit;letter-spacing:2px;'
                + 'background:rgba(60,10,10,0.6);border:2px solid rgba(220,80,80,0.6);'
                + 'color:#ff9999;border-radius:10px;transition:all 0.15s;">'
                + '✕ 取消</button>'
        :       '')
        +     '<button class="wb-gp-btn wb-gp-ok" style="'
        +       'min-width:140px;padding:14px 28px;font-size:28px;font-weight:800;'
        +       'cursor:pointer;font-family:inherit;letter-spacing:2px;'
        +       'background:linear-gradient(135deg,#3ec87a,#1e783c);'
        +       'border:2px solid #6ee6a0;color:#fff;border-radius:10px;'
        +       'box-shadow:0 4px 14px rgba(62,200,122,0.4);transition:all 0.15s;">'
        +       (isConfirm ? '✓ 確定' : '✓ 知道了')
        +     '</button>'
        +   '</div>'
        + '</div>';

      if(!document.getElementById('wb-game-popup-style')){
        const sty = document.createElement('style');
        sty.id = 'wb-game-popup-style';
        sty.textContent =
          '@keyframes wbPopupFadeIn{from{opacity:0;}to{opacity:1;}}'
          + '@keyframes wbPopupBoxIn{from{opacity:0;transform:scale(0.85) translateY(8px);}'
          + 'to{opacity:1;transform:scale(1) translateY(0);}}'
          + '.wb-gp-btn-row .wb-gp-ok:hover{filter:brightness(1.15);transform:translateY(-1px);}'
          + '.wb-gp-btn-row .wb-gp-cancel:hover{background:rgba(200,50,50,0.4);}';
        document.head.appendChild(sty);
      }

      document.body.appendChild(ov);

      const cleanup = function(result){
        try{ ov.remove(); }catch(_){}
        try{ document.removeEventListener('keydown', onKey); }catch(_){}
        resolve(result);
      };

      const onKey = function(ev){
        if(ev.key === 'Enter'){ ev.preventDefault(); cleanup(true); }
        else if(ev.key === 'Escape'){ ev.preventDefault(); cleanup(isConfirm ? false : true); }
      };
      document.addEventListener('keydown', onKey);

      const okBtn = ov.querySelector('.wb-gp-ok');
      if(okBtn) okBtn.addEventListener('click', function(){ cleanup(true); });
      const cancelBtn = ov.querySelector('.wb-gp-cancel');
      if(cancelBtn) cancelBtn.addEventListener('click', function(){ cleanup(false); });

      if(isConfirm){
        ov.addEventListener('click', function(ev){
          if(ev.target === ov) cleanup(false);
        });
      }
    });
  }
  window._wbGameAlert = function(msg){ return _wbGamePopup(msg, false); };
  window._wbGameConfirm = function(msg){ return _wbGamePopup(msg, true); };

  // ───────────────────────────────────────────────────────────────────
  // 1. 元素龍清單 (8 隻輪替,全伺服器共享 HP)
  // ───────────────────────────────────────────────────────────────────
  window.WORLD_BOSS_LINEUP = [
    // ★ FIX 20260516 — 測試版階段:8 隻龍王 HP 全部統一設為 50 萬作為基準,
    //   等真實平衡測試後再個別調整。
    { id:'vesuvius_fire_dragon',     name:'維蘇威火山龍王',    element:'fire',  maxHp:500000,  scene:'維蘇威火山口',
      shieldElements:['fire','wind','earth','dark'],
      desc:'沉睡於義大利那不勒斯灣維蘇威火山口的古老火龍「炎之翼」,西元 79 年龐貝大爆發即是牠的甦醒' },
    { id:'shenhai_water_dragon',   name:'深海冰龍王',    element:'water', maxHp:500000,  scene:'太平洋深淵',
      shieldElements:['water','wind','light','grass'],
      desc:'蛰伏於馬里亞納海溝的冰龍,以絕對零度凍結整片海洋' },
    { id:'taifeng_wind_dragon',    name:'風雷雲龍王',    element:'wind',  maxHp:500000,  scene:'颱風眼',
      shieldElements:['wind','fire','water','dark'],
      desc:'颱風中央誕生的雷雲龍,捲起整座島嶼的氣流' },
    { id:'shanyue_earth_dragon',   name:'山岳土龍王',    element:'earth', maxHp:500000, scene:'地核深處',
      shieldElements:['earth','fire','dark','grass'],
      desc:'盤據於地核的古老土龍,一動就引發強震' },
    { id:'bushi_dark_dragon',      name:'不死骨龍王',    element:'dark',  maxHp:500000, scene:'黃泉之門',
      shieldElements:['dark','earth','water','grass'],
      desc:'從黃泉之門爬出的骨龍,擊敗一次後會以半血復活再戰' },
    { id:'shensheng_light_dragon', name:'神聖光龍王',    element:'light', maxHp:500000, scene:'高天原',
      shieldElements:['light','fire','wind','grass'],
      desc:'天界派遣的審判龍,僅暗系英雄能對其造成完整傷害' },
    { id:'cuiyu_grass_dragon',     name:'翠玉草龍王',    element:'grass', maxHp:500000, scene:'太魯閣',
      shieldElements:['grass','water','wind','light'],
      desc:'守護太魯閣峽谷的翠玉龍,藤蔓束縛全場' },
    { id:'xingchen_omni_dragon',   name:'星辰幻龍王',    element:'omni',  maxHp:500000, scene:'銀河',
      shieldElements:['fire','water','wind','earth','light','dark','grass'],  // ★ 終極龍:7 元素全開
      desc:'集八元素之力於一身的終極龍,每階段切換屬性' },
  ];

  // ───────────────────────────────────────────────────────────────────
  // 2. 掉落物 (依個人傷害%分級)
  // ───────────────────────────────────────────────────────────────────
  window._WORLD_BOSS_DROPS = {
    vesuvius_fire_dragon: {
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
  // ★ FIX 20260517 — 1-5 名至寶不再依稀有度給,改用 treasureLabel 描述
  //                  EXP 卷軸拆成「至寶EXP卷軸」+「豪華典藏版EXP書」兩種,
  //                  兩種數量一致(沿用原 expScrolls 數量)
  // ───────────────────────────────────────────────────────────────────
  window._WORLD_BOSS_TEAM_REWARDS = {
    legendary: {
      rankRange: '1', tier: '🏆 傳奇',
      coins: 100000,
      // ★ FIX 20260519(v12) — 改成「未收錄至寶(優先神話級)」,當神話都解鎖了就降一級給傳說/史詩
      treasureLabel: '未收錄至寶 ×1(優先神話級)',
      summonCrystals: 10, titleTemplate: '屠龍者・{bossName}',
      expScrollTreasure: 5, expBookDeluxe: 5,
    },
    epic: {
      rankRange: '2-5', tier: '🥈 史詩',
      coins: 60000,
      // ★ FIX 20260519(v12) — 改成「未收錄至寶(優先傳說級)」
      treasureLabel: '未收錄至寶 ×1(優先傳說級)',
      summonCrystals: 7,
      expScrollTreasure: 3, expBookDeluxe: 3,
    },
    rare: {
      rankRange: '6-10', tier: '🥉 稀有',
      coins: 30000, treasureChance: 0.60, treasureRarity: 'legendary',
      // ★ FIX 20260519(v12) — 改成 treasureLabel 不再用 treasureChance,
      //   但留 treasureChance/Rarity 給結算邏輯舊兼容(機率取至寶)
      treasureLabel: '未收錄至寶 (60% 機率,優先史詩級)',
      summonCrystals: 5,
      expScrollTreasure: 2, expBookDeluxe: 2,
    },
    normal: {
      rankRange: '11-20', tier: '📦 普通',
      coins: 15000, treasureChance: 0.30, treasureRarity: 'legendary',
      // ★ FIX 20260519(v12) — 改成 treasureLabel
      treasureLabel: '未收錄至寶 (30% 機率,優先稀有級)',
      summonCrystals: 3,
      expScrollTreasure: 1, expBookDeluxe: 1,
    },
    memorial: {
      rankRange: '21+', tier: '🎁 參加獎',
      coins: 7000, summonCrystals: 1,
      expScrollTreasure: 1, expBookDeluxe: 1,
    },
  };

  window._wbGetRewardTier = function(rank){
    if(rank === 1)        return 'legendary';
    if(rank <= 5)         return 'epic';
    if(rank <= 10)        return 'rare';
    if(rank <= 20)        return 'normal';
    return 'memorial';
  };

  window._wbCalcTeamId = function(playerUids){
    if(!Array.isArray(playerUids) || playerUids.length === 0) return null;
    return playerUids.filter(u => u).sort().join('|');
  };

  // ───────────────────────────────────────────────────────────────────
  // 5. 維蘇威火山龍王資料 — 自動 Object.assign 掛到主程式既有 DB
  //    (主程式啟動完成後才掛,避免初始化順序問題)
  // ───────────────────────────────────────────────────────────────────
  function _wbInstallHeroData(){
    // ★ v3.1.1 — 鐵律 2.40 修補:
    //   HERO_DB / BURST_DB / HERO_TRAIT 等是 const 宣告,不掛 window
    //   必須用 typeof 直接讀全域 lexical scope,寫入時改它原物件(因為是物件參考)
    //   同時把參考也掛到 window,讓 UI 端(world-boss-ui.html)能讀
    try{
      if(typeof HERO_DB === 'object' && HERO_DB){
        Object.assign(HERO_DB, {
          '維蘇威火山龍王':{hp:500000,atk:49,sp:50,spd:15,exp:1500,star:5,isWorldBoss:true,
            s1:{n:'業火灼燒',c:4,d:'特技100%全體火屬性傷害,附加燃燒2回合',fd:'噴出無盡業火灼燒全場!用特技值的 100% 對全體對手造成火屬性傷害,並對全體附加「燃燒」狀態 2 回合(行動前後各損失 6 HP)。'},
            s2:{n:'龍吼震懾',c:4,d:'特技75%全體無屬性傷害,50%機率眩暈1回合',fd:'發出震天龍吼!用特技值的 75% 對全體對手造成無屬性傷害(無視屬性抗性),每名對手有 50% 機率「眩暈」1 回合不能動。'}
          },
        });
        window.HERO_DB = HERO_DB;  // ★ 暴露給 UI script 用
      }
    }catch(e){ console.warn('[WB] HERO_DB 掛載失敗', e); }

    try{
      if(typeof BURST_DB === 'object' && BURST_DB){
        Object.assign(BURST_DB, {
          '維蘇威火山龍王': {n:'天崩之炎', d:'全體當前HP 90%火傷(無視有利)+強力燃燒3回合,隨機1名強力暈眩+強力易傷1回合', fd:'兩千年怒火一次釋放!對全體對手造成當前 HP 90% 的火屬性傷害,完全無視所有有利狀態(無敵、免疫、護盾、反射、減傷全部失效),並對全體存活對手附加「強力燃燒」狀態 3 回合(行動前後各 -10HP)。再從存活對手中隨機選 1 名,額外施加「強力暈眩」與「強力易傷」各 1 回合。'},
        });
        window.BURST_DB = BURST_DB;
      }
    }catch(_){}

    try{
      if(typeof HERO_TRAIT === 'object' && HERO_TRAIT){
        Object.assign(HERO_TRAIT, {
          '維蘇威火山龍王': { name:'炎之意志', icon:'🐉', desc:'單次受傷上限為最大 HP 的 1%;HP 過半啟動四元素護盾(減傷 80%,無視有利狀態的攻擊也無法打穿)', fd:'兩千年沉睡淬煉的炎之意志,單次受傷上限為最大 HP 的 1%(即任何一擊最高僅造成 5000 傷害)。HP 降至 50% 時進入第二階段,身上浮現四元素護盾:所有傷害再減 80%,即使是無視有利狀態的攻擊也無法穿透。需要使用對應屬性(火 / 水 / 土 / 風)的攻擊各打 3 次裂痕,才能完整破除護盾恢復正常傷害。' },
        });
        window.HERO_TRAIT = HERO_TRAIT;
      }
    }catch(_){}

    try{
      if(typeof HERO_LORE === 'object' && HERO_LORE){
        Object.assign(HERO_LORE, {
          '維蘇威火山龍王': '沉睡於義大利那不勒斯灣維蘇威火山口的古老火龍「炎之翼」。西元 79 年 8 月 24 日,牠首次甦醒咆哮,使整座火山噴發兩天兩夜,將山下的羅馬古城「龐貝」與「赫庫蘭尼姆」完全掩埋於火山灰下,並造成兩萬餘人喪命。中世紀的 1631 年牠再度被驚醒,造成 3,000 人罹難。20 世紀最後一次是 1944 年二戰末期,美軍轟炸鄰近地區時意外驚動,牠咆哮三日後返回火山口。2026 年,因近年地殼活動頻繁,火龍王第四度甦醒,需要四位英雄遠渡重洋前往那不勒斯封印,以免人類再蒙浩劫。',
        });
        window.HERO_LORE = HERO_LORE;
      }
    }catch(_){}

    try{
      if(typeof HERO_BIO === 'object' && HERO_BIO){
        Object.assign(HERO_BIO, {
          '維蘇威火山龍王': '沉睡於義大利維蘇威火山口的古老火龍,西元 79 年掩埋龐貝古城的元凶。需要 4 位英雄聯手才能封印的世界 BOSS。',
        });
        window.HERO_BIO = HERO_BIO;
      }
    }catch(_){}

    try{
      if(typeof HERO_IMGS === 'object' && HERO_IMGS){
        HERO_IMGS['維蘇威火山龍王'] =
          'https://raw.githubusercontent.com/clarebox123jp-art/LXPSGAME/main/' +
          encodeURIComponent('維蘇威火山龍王.png');
        window.HERO_IMGS = HERO_IMGS;
      }
    }catch(_){}

    try{
      if(typeof MONSTER_AVTR === 'object' && MONSTER_AVTR){
        MONSTER_AVTR['維蘇威火山龍王'] = '🐉';
        window.MONSTER_AVTR = MONSTER_AVTR;
      }
    }catch(_){}

    try{
      if(typeof MONSTER_ELEMENT === 'object' && MONSTER_ELEMENT){
        MONSTER_ELEMENT['維蘇威火山龍王'] = 'fire';
        window.MONSTER_ELEMENT = MONSTER_ELEMENT;
      }
    }catch(_){}

    console.log('[WB] ✅ 維蘇威火山龍王資料已掛載(HP 500000 / 攻 49 / 特 50 / 速 15)');
  }

  // ───────────────────────────────────────────────────────────────────
  // 6. 維蘇威火山龍王技能邏輯 (透過 hook 接到 execSkill 末端)
  //    在 execSkill 函式裡找一個適合的位置呼叫:
  //      if(window._wbHookExecSkill && window._wbHookExecSkill(n,a,t,al,enemies)) return;
  //    但因為侵入式修改 execSkill 風險高,改用「監聽技能名」方式:
  //      window._wbExecSkillFallback(n, a, t, al, enemies) → true 表示已處理
  // ───────────────────────────────────────────────────────────────────
  window._wbExecSkillFallback = function(n, a, t, al, enemies){
    // 只處理維蘇威火山龍王的 3 招
    if(n === '業火灼燒'){
      try{
        // 特技 100% 全體火傷害 + 全體燃燒 2 回合
        enemies.forEach(e => {
          if(e.curHp > 0){
            doDmg(e, Math.floor(spv(a) * 1.00), {actor:a, isSkill:true, isAoe:true, element:'fire'});
            if(e.curHp > 0) addStatus(e, 'burn', 2);
          }
        });
        bannerFX(a, '🔥 業火灼燒!', '#ff6644', 1200);
      }catch(e){ console.warn('[WB] 業火灼燒執行失敗', e); }
      return true;
    }
    if(n === '龍吼震懾'){
      try{
        // 特技 75% 全體無屬性傷害(element:'none' 不吃屬性抗性) + 50% 眩暈 1 回合
        enemies.forEach(e => {
          if(e.curHp > 0){
            doDmg(e, Math.floor(spv(a) * 0.75), {actor:a, isSkill:true, isAoe:true, element:'none'});
            if(e.curHp > 0 && Math.random() < 0.50) addStatus(e, 'stun', 1);
          }
        });
        bannerFX(a, '🐉 龍吼震懾!', '#cc4422', 1200);
      }catch(e){ console.warn('[WB] 龍吼震懾執行失敗', e); }
      return true;
    }
    if(n === '天崩之炎'){
      try{
        // ★ FIX 20260516 — 規則更新:
        //   1. 全體當前 HP 90% 火傷(無視有利狀態 → 無敵/免疫/護盾/反射全部打穿)
        //   2. 全體強力燃燒 3 回合(主程式 type='hellfire' + _strong:true,行動前後各 -10HP)
        //      註:原版用 'burn' 是無效 type,實際從未生效;這次改為正確的 'hellfire'+_strong
        //   3. 隨機 1 名存活敵人:強力暈眩 + 強力易傷 各 1 回合
        enemies.forEach(e => {
          if(e.curHp <= 0) return;
          const _dmg = Math.floor(e.curHp * 0.90);
          doDmg(e, _dmg, {
            actor: a,
            isSkill: true,
            isAoe: true,
            ignoreBuffs: true,    // 無視有利狀態(無敵/免疫/護盾/保護/閃避全失效)
            ignoreEvasion: true,  // 必中
            noReflect: true,      // 不被反射
            noHalfDmg: true,      // 不受減傷
            piercing: true,       // 無視防禦
            element: 'fire'
          });
          // 強力燃燒 3 回合(行動前後各 -10HP,死了就不附加)
          if(e.curHp > 0){
            if(typeof addStatus === 'function') addStatus(e, 'hellfire', 3);
            const _hs = (e.status || []).find(s => s.type === 'hellfire');
            if(_hs){
              _hs._actor = a;
              _hs._strong = true;
            }
            if(typeof bannerFX === 'function'){
              bannerFX(e, '🔥 強力燃燒', '#ff2200', 900);
            }
          }
        });
        if(typeof bannerFX === 'function') bannerFX(a, '⚡ 天崩之炎降臨!', '#ee2222', 1800);
        if(typeof flashScreen === 'function') flashScreen('rgba(255,80,40,0.8)', 700);

        // ─── 追加效果:隨機 1 名存活敵人陷入「強力暈眩」+「強力易傷」各 1 回合 ───
        //   強力暈眩 = clearStatus(['stun']) + push 新 stun + _burstStun:true 旗標 + banner「強力昏迷」
        //   強力易傷 = addStatus('dmgVuln', 1) + _vulnStrong=true + banner「💥 強力易傷」
        try{
          const _survivors = enemies.filter(e => e && e.curHp > 0);
          if(_survivors.length > 0){
            const _target = _survivors[Math.floor(Math.random() * _survivors.length)];
            // 強力暈眩
            if(typeof clearStatus === 'function') clearStatus(_target, ['stun']);
            if(_target.status && Array.isArray(_target.status)){
              _target.status.push({ type:'stun', dur:1, _burstStun:true });
            }else if(typeof addStatus === 'function'){
              addStatus(_target, 'stun', 1);
            }
            if(typeof bannerFX === 'function') bannerFX(_target, '💫 強力昏迷!', '#cc8800', 1000);
            log(`💫 [${_target.name}] 被天崩之炎震懾,陷入強力暈眩 1 回合!`);
            // 強力易傷(banner 稍延遲避免跟強力昏迷撞)
            if(typeof addStatus === 'function') addStatus(_target, 'dmgVuln', 1);
            _target._vulnStrong = true;
            log(`💥 [${_target.name}] 體質虛弱,受傷增加 1 回合!`);
            if(typeof bannerFX === 'function'){
              setTimeout(() => {
                try{ bannerFX(_target, '💥 強力易傷!', '#ff6644', 900); }catch(_){}
              }, 600);
            }
            if(typeof renderCard === 'function'){
              try{ renderCard(_target); }catch(_){}
            }
          }
        }catch(eExtra){
          console.warn('[WB] 天崩之炎追加暈眩/易傷失敗', eExtra);
        }
      }catch(e){ console.warn('[WB] 天崩之炎執行失敗', e); }
      return true;
    }
    return false;
  };

  // ───────────────────────────────────────────────────────────────────
  // 6b. 天賦「炎之意志」傷害計算 hook
  //     戰鬥引擎在「BOSS 受傷時」呼叫,回傳調整後的傷害值
  //     1) 單次受傷上限 = 最大 HP 的 1% (即 500000 * 1% = 5000)
  //     2) HP < 50% 啟動四元素護盾:傷害再減 80%
  //        (即使是無視有利狀態的攻擊也擋,因為這不是 buff,是天賦)
  //     3) 護盾首次出現時跳訊息提醒玩家
  // ───────────────────────────────────────────────────────────────────
  window._wbApplyBossDmgCap = function(boss, rawDmg, opts){
    if(!boss || !boss.name || boss.name !== '維蘇威火山龍王') return rawDmg;
    if(rawDmg <= 0) return rawDmg;
    opts = opts || {};

    const maxHp = boss.hp || 500000;
    // 1) 單次受傷上限 1%
    const cap1pct = Math.floor(maxHp * 0.01);
    let dmg = Math.min(rawDmg, cap1pct);

    // 2) HP < 50% 時 四元素護盾減傷 80%
    const hpRatio = boss.curHp / maxHp;
    const shieldActive = hpRatio < 0.50;
    if(shieldActive){
      // 護盾首次啟動提示
      if(!boss._wbShieldNotified){
        boss._wbShieldNotified = true;
        // 用 setTimeout 確保畫面已渲染
        setTimeout(_wbShowShieldHint, 200);
      }
      // 受傷減 80%
      dmg = Math.floor(dmg * 0.20);
    }
    return Math.max(1, dmg);
  };

  function _wbShowShieldHint(){
    // 跳提示 modal,告訴玩家:護盾啟動,需破解
    if(document.getElementById('wb-shield-hint-modal')) return;
    const ov = document.createElement('div');
    ov.id = 'wb-shield-hint-modal';
    ov.style.cssText = 'position:fixed;inset:0;z-index:10500;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(6px);';
    ov.innerHTML = `
      <div style="max-width:560px;background:linear-gradient(160deg,#2a1818,#1a0a0a);
        border:3px solid rgba(255,120,80,0.8);border-radius:18px;padding:28px 24px;
        box-shadow:0 0 60px rgba(255,80,40,0.5);text-align:center;">
        <div style="font-size:38px;margin-bottom:12px;">🛡⚡🔥</div>
        <div style="font-size:26px;color:#ff8866;font-weight:900;letter-spacing:2px;margin-bottom:14px;
          text-shadow:0 0 14px rgba(255,100,60,0.6);">
          ⚠ 第二階段啟動!四元素護盾
        </div>
        <div style="font-size:16px;color:#ffe;line-height:1.85;text-align:left;
          background:rgba(255,80,40,0.12);padding:14px 18px;border-radius:10px;
          border-left:4px solid rgba(255,120,80,0.7);margin-bottom:14px;">
          維蘇威火山龍王 HP 降至 50% 以下,身上浮現由<b>火 / 風 / 土 / 暗</b>四種元素構成的護盾!
          <br><br>
          <b style="color:#ff8866;">護盾效果:</b><br>
          ・所有傷害額外 <b style="color:#ffaa66;">減 80%</b><br>
          ・即使是無視有利狀態的攻擊也<b style="color:#ff6644;">無法打穿</b><br>
          ・單次受傷上限 1% 仍然有效(<b style="color:#ffcc66;">每擊最多 5000 傷害</b>)
        </div>
        <div style="font-size:15px;color:#ffd;line-height:1.85;text-align:left;
          background:rgba(60,180,255,0.12);padding:14px 18px;border-radius:10px;
          border-left:4px solid rgba(80,180,255,0.7);margin-bottom:18px;">
          <b style="color:#88ddff;">💡 破解方法:</b><br>
          使用對應屬性的攻擊各打 <b>3 次裂痕</b>,即可破除護盾:<br>
          🔥 火 / 🌪 風 / ⛰ 土 / 🌑 暗 各 3 次,共 12 次屬性裂痕
          <br><br>
          <b style="color:#aaffaa;">🎯 戰術建議:</b><br>
          換上含 4 種屬性的英雄陣容(火法師/風行者/山岳禁咒/暗法師⋯),
          專心普攻 + S1/S2 配合 BOSS 弱點屬性破盾!
        </div>
        <button onclick="document.getElementById('wb-shield-hint-modal').remove()"
          style="background:linear-gradient(135deg,#ff6644,#cc3322);color:#fff;
          border:2px solid rgba(255,160,140,0.7);border-radius:10px;padding:10px 28px;
          font-size:18px;font-weight:800;cursor:pointer;letter-spacing:2px;
          box-shadow:0 4px 16px rgba(255,80,40,0.5);">
          ⚔ 開戰!
        </button>
      </div>
    `;
    document.body.appendChild(ov);
    // 8 秒後自動關閉(讓沒注意的玩家也能繼續)
    setTimeout(() => { try{ ov.remove(); }catch(_){} }, 12000);
  }
  // 暴露給外部呼叫
  window._wbShowShieldHint = _wbShowShieldHint;

  // ───────────────────────────────────────────────────────────────────
  // 7. 獎章定義 + 統計欄位 — 自動補進主程式既有 ALL_MEDALS / _medalStats
  // ───────────────────────────────────────────────────────────────────
  const WB_MEDALS = [
    { id:'wb_first_clear',      icon:'🌍', name:'首次討伐',  desc:'第一次參與並擊敗任何世界 BOSS',                  cat:'世界BOSS' },
    { id:'wb_yushan_kill',      icon:'🐉', name:'屠龍勇者',  desc:'擊敗維蘇威火山龍王',                                 cat:'世界BOSS' },
    { id:'wb_yushan_speedrun',  icon:'⚡', name:'三分速通',  desc:'3 分鐘內擊敗維蘇威火山龍王',                        cat:'世界BOSS' },
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
    // ★ v3.1.1 — 鐵律 2.40 修補:ALL_MEDALS / _medalStats 都是主程式的 let/const,不掛 window
    try{
      if(typeof ALL_MEDALS !== 'undefined' && Array.isArray(ALL_MEDALS)){
        const existingIds = new Set(ALL_MEDALS.map(m => m.id));
        WB_MEDALS.forEach(m => {
          if(!existingIds.has(m.id)) ALL_MEDALS.push(m);
        });
        window.ALL_MEDALS = ALL_MEDALS;
      }
    }catch(e){ console.warn('[WB] ALL_MEDALS 掛載失敗', e); }

    try{
      if(typeof _medalStats !== 'undefined' && _medalStats && typeof _medalStats === 'object'){
        Object.keys(WB_MEDAL_STAT_DEFAULTS).forEach(k => {
          if(typeof _medalStats[k] === 'undefined'){
            const def = WB_MEDAL_STAT_DEFAULTS[k];
            _medalStats[k] = (typeof def === 'object' && def !== null)
              ? (Array.isArray(def) ? [] : {})
              : def;
          }
        });
        window._medalStats = _medalStats;
      }
    }catch(_){}
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
  // ★ v3.2 — 休戰期狀態工具:從 window._wbCeasefireState 讀,若未載入則預設休戰
  function _wbIsCeasefire(){
    const st = window._wbCeasefireState || {};
    // 文件未載入時 → 採保守策略,維持「休戰期」直到 Firestore 同步完成
    if(!st._loaded) return true;
    return !!st.ceasefire;
  }
  function _wbGetNextOpenText(){
    const st = window._wbCeasefireState || {};
    return st.nextOpenTime || '';
  }
  window._wbIsCeasefire = _wbIsCeasefire;
  window._wbGetNextOpenText = _wbGetNextOpenText;

  // ★ v3.2 — 同步「世界 BOSS 討伐戰」按鈕外觀(灰色/紅色 + 浮水印 + 預告時間)
  //   隨 Firestore 狀態即時刷新;管理員仍可進入(進去看到「強制開戰」測試按鈕)
  function _wbSyncStageButton(){
    const stage = document.getElementById('adv-worldboss-stage');
    if(!stage) return;
    const wm = document.getElementById('adv-worldboss-stage-watermark');
    const nextOpenBox = document.getElementById('adv-worldboss-stage-nextopen');
    const nextOpenTime = document.getElementById('adv-worldboss-stage-nextopen-time');
    const isAdmin = (typeof window._isAdminUser === 'function' && window._isAdminUser());
    if(_wbIsCeasefire()){
      stage.classList.add('is-ceasefire');
      if(wm){
        wm.style.display = '';
        wm.textContent = isAdmin ? '休戰期(管理員可進)' : '休戰期';
      }
      const txt = _wbGetNextOpenText();
      if(nextOpenTime) nextOpenTime.textContent = txt || '尚未公告 — 請等管理員通知';
      if(nextOpenBox) nextOpenBox.style.display = 'block';
    }else{
      stage.classList.remove('is-ceasefire');
      if(wm) wm.style.display = 'none';
      if(nextOpenBox) nextOpenBox.style.display = 'none';
    }
  }
  window._wbSyncStageButton = _wbSyncStageButton;

  // Firestore 狀態變更時自動刷新按鈕外觀
  try{
    document.addEventListener('wbCeasefireStateChanged', () => {
      try{ _wbSyncStageButton(); }catch(_){}
      try{ _wbSyncCeasefireBanner(); }catch(_){}
      try{ _wbSyncStartButtonGate(); }catch(_){}
    });
  }catch(_){}

  // ★ v3.2 — 點按鈕的入口包裝器(取代直接呼叫 _openWorldBossEntry)
  //   休戰期 → 玩家仍可進去看 BOSS 預覽 + 預告時間,但開新房間/加入房間/單人練習都鎖
  //   管理員 → 不受限,任何狀態都可以全功能進入(用於測試 & 切換開關)
  window._wbTrySelect = async function(){
    // 確保訂閱已啟動(萬一玩家先於連線層載入點到按鈕)
    try{ if(window._wbControl && window._wbControl.subscribe) window._wbControl.subscribe(); }catch(_){}
    // 直接走原入口流程(內部會根據 ceasefire 狀態鎖開戰按鈕,並顯示狀態看板)
    return window._openWorldBossEntry();
  };

  // 入口 overlay 內的「狀態看板」(休戰中/開放中 + 預告時間)即時刷新
  function _wbSyncCeasefireBanner(){
    const banner = document.getElementById('wb-ceasefire-banner');
    if(!banner) return;
    const isAdmin = (typeof window._isAdminUser === 'function' && window._isAdminUser());
    const st = window._wbCeasefireState || {};
    if(_wbIsCeasefire()){
      banner.className = 'wb-ceasefire-banner is-ceasefire';
      banner.innerHTML =
        '<div class="wb-cf-row">' +
          '<span class="wb-cf-ico">⏸</span>' +
          '<div class="wb-cf-main">' +
            '<div class="wb-cf-title">目前為休戰期</div>' +
            '<div class="wb-cf-sub">' +
              (_wbGetNextOpenText()
                ? ('📅 下次開戰:<b>' + _escapeHtml(_wbGetNextOpenText()) + '</b>')
                : '尚未公告下次開戰時間,請等管理員預告') +
            '</div>' +
            (st.message ? '<div class="wb-cf-msg">📢 ' + _escapeHtml(st.message) + '</div>' : '') +
          '</div>' +
        '</div>';
    }else{
      banner.className = 'wb-ceasefire-banner is-open';
      banner.innerHTML =
        '<div class="wb-cf-row">' +
          '<span class="wb-cf-ico">⚔</span>' +
          '<div class="wb-cf-main">' +
            '<div class="wb-cf-title">挑戰開放中!</div>' +
            '<div class="wb-cf-sub">隨時可以開房間 / 加入房間 / 練習模式</div>' +
            (st.message ? '<div class="wb-cf-msg">📢 ' + _escapeHtml(st.message) + '</div>' : '') +
          '</div>' +
        '</div>';
    }
    // 管理員控制面板(僅 admin 看到)
    const ctrl = document.getElementById('wb-admin-ctrl-panel');
    if(ctrl){
      ctrl.style.display = isAdmin ? '' : 'none';
      if(isAdmin){
        // 把現有預告時間填回輸入框
        const inp = document.getElementById('wb-admin-nextopen-input');
        if(inp && document.activeElement !== inp){ inp.value = st.nextOpenTime || ''; }
        const msgInp = document.getElementById('wb-admin-msg-input');
        if(msgInp && document.activeElement !== msgInp){ msgInp.value = st.message || ''; }
        const stateLab = document.getElementById('wb-admin-cur-state');
        if(stateLab){
          stateLab.innerHTML = _wbIsCeasefire()
            ? '<span style="color:#888;font-weight:900;">🔒 休戰中</span>'
            : '<span style="color:#5dcaa5;font-weight:900;">🔓 開放挑戰</span>';
        }
        const byLab = document.getElementById('wb-admin-cur-updatedby');
        if(byLab){
          if(st.updatedAt){
            const d = new Date(st.updatedAt);
            byLab.textContent = '最後更新:' + d.toLocaleString() + ' (by ' + (st.updatedBy || '?') + ')';
          }else{
            byLab.textContent = '尚未有人設定過 — 目前為預設值';
          }
        }
      }
    }
  }
  window._wbSyncCeasefireBanner = _wbSyncCeasefireBanner;

  // 入口 overlay 三大按鈕(開新房/加入房/單人練習)休戰時禁用
  function _wbSyncStartButtonGate(){
    const isAdmin = (typeof window._isAdminUser === 'function' && window._isAdminUser());
    const locked = _wbIsCeasefire() && !isAdmin;
    // 找按鈕(透過 onclick attribute 識別,避免改動原有 HTML 結構)
    const btnRow = document.querySelector('#wb-entry-overlay .wb-entry-btn-row');
    if(!btnRow) return;
    const btns = btnRow.querySelectorAll('.wb-entry-big-btn');
    btns.forEach(b => {
      if(locked){
        b.classList.add('wb-locked');
        b.dataset._origOnclick = b.dataset._origOnclick || b.getAttribute('onclick') || '';
        b.setAttribute('onclick',
          "if(typeof _wbShowCeasefireToast==='function'){_wbShowCeasefireToast();}");
      }else{
        if(b.dataset._origOnclick){
          b.setAttribute('onclick', b.dataset._origOnclick);
        }
        b.classList.remove('wb-locked');
      }
    });
    // 房號輸入區也鎖
    const joinArea = document.getElementById('wb-join-area');
    if(joinArea){
      joinArea.style.opacity = locked ? '0.4' : '1';
      joinArea.style.pointerEvents = locked ? 'none' : '';
    }
  }
  window._wbSyncStartButtonGate = _wbSyncStartButtonGate;

  // 休戰期點按鈕的提示(短暫 toast)
  window._wbShowCeasefireToast = function(){
    try{ if(typeof playSfx === 'function') playSfx('sfx-cancel', 0.5); }catch(_){}
    const txt = _wbGetNextOpenText();
    const msg = '⏸ 目前為休戰期,無法開戰\n\n' +
      (txt ? ('📅 下次開戰時間:' + txt) : '管理員尚未公告下次開戰時間,請耐心等候。') +
      '\n\n你還是可以點 BOSS 預覽看看下一隻 BOSS 的資料喔!';
    _wbGameAlert(msg);
  };

  // 小工具:HTML escape
  function _escapeHtml(s){
    return String(s).replace(/[&<>"']/g, c =>
      ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  window._wbEscapeHtml = _escapeHtml;

  // 管理員 toggle 開放/休戰
  window._wbAdminToggleCeasefire = async function(forceState){
    if(!(typeof window._isAdminUser === 'function' && window._isAdminUser())){
      _wbGameAlert("⚠ 你不是管理員,無法切換開放/休戰");
      return;
    }
    if(!window._wbControl || !window._wbControl.set){
      _wbGameAlert("⚠ 控制模組未載入,請重新整理頁面");
      return;
    }
    const st = window._wbCeasefireState || {};
    const newCeasefire = (typeof forceState === 'boolean') ? forceState : !st.ceasefire;
    const nextOpenInput = document.getElementById('wb-admin-nextopen-input');
    const msgInput = document.getElementById('wb-admin-msg-input');
    const nextOpenTime = nextOpenInput ? nextOpenInput.value.trim() : (st.nextOpenTime || '');
    const message = msgInput ? msgInput.value.trim() : (st.message || '');
    try{
      const newState = await window._wbControl.set({
        ceasefire: newCeasefire,
        nextOpenTime: nextOpenTime,
        message: message,
      });
      console.log('[WB-Admin] 已寫入新狀態', newState);
      // ★ FIX 20260518 — 從休戰切到開放(新一輪開戰)時,順手把雲端 BOSS HP 重置為滿血
      //   讓全伺服器看到的 BOSS HP 條回到 100%,進入新一輪挑戰
      if(st.ceasefire === true && newCeasefire === false){
        try{
          if(window._wbHpSync && typeof window._wbHpSync.resetHp === 'function'){
            // 從 WORLD_BOSS_LINEUP 拿當前 BOSS 滿血;預設維蘇威 500000
            const _lineup = window.WORLD_BOSS_LINEUP || [];
            const _curBoss = _lineup.find(b => b && b.id === 'vesuvius_fire_dragon') || _lineup[0];
            const _maxHp = (_curBoss && _curBoss.maxHp) || 500000;
            const _bossId = (_curBoss && _curBoss.id) || 'vesuvius_fire_dragon';
            await window._wbHpSync.resetHp(_bossId, _maxHp);
            console.log('[WB-Admin] 開放新一輪 → BOSS HP 重置為滿血', _bossId, _maxHp);
          }
        }catch(eR){ console.warn('[WB-Admin] 重置 BOSS HP 失敗', eR); }
      }
      // Firestore onSnapshot 會自動觸發 UI 刷新
      try{ if(typeof playSfx === 'function') playSfx('sfx-confirm', 0.6); }catch(_){}
      const fb = document.getElementById('wb-admin-result-feedback');
      if(fb){
        fb.style.display = 'block';
        fb.style.color = '#5dcaa5';
        fb.textContent = '✅ 已寫入:' + (newCeasefire ? '🔒 休戰' : '🔓 開放') +
          (nextOpenTime ? '(預告:' + nextOpenTime + ')' : '');
        setTimeout(() => { fb.style.display = 'none'; }, 3500);
      }
    }catch(e){
      console.error('[WB-Admin] 寫入失敗', e);
      const fb = document.getElementById('wb-admin-result-feedback');
      if(fb){
        fb.style.display = 'block';
        fb.style.color = '#ff8866';
        fb.textContent = '❌ 寫入失敗:' + (e.message || e);
      }
    }
  };
  // 只儲存預告時間/訊息(不切換狀態)
  window._wbAdminSavePreview = async function(){
    const st = window._wbCeasefireState || {};
    return window._wbAdminToggleCeasefire(st.ceasefire);
  };

  window._openWorldBossEntry = async function(){
    // 檢查登入
    if(!window._gUserId){
      _wbGameAlert('🌍 世界 BOSS 討伐戰\n\n需要先 Google 登入才能跟好友一起連線打喔!\n請先在右上角登入。');
      return;
    }
    // 確保 UI 已注入
    const ok = await _wbEnsureUi();
    if(!ok){
      _wbGameAlert('🌍 世界 BOSS 討伐戰\n\nUI 載入失敗,請檢查網路或重新整理頁面。\n(world-boss-ui.html 需要跟 index.html 放在同一個目錄)');
      return;
    }
    // 顯示入口 overlay
    const ov = document.getElementById('wb-entry-overlay');
    if(ov){
      ov.style.display = 'flex';
      // ★ FIX 20260517 — entry 開啟時把 #ctrl-bar 推到 body 最後,確保最高層
      try{
        const _bar = document.getElementById('ctrl-bar');
        if(_bar && _bar.parentNode === document.body){
          document.body.appendChild(_bar);
        }
      }catch(_){}
      try{ _wbRefreshBlessingBanner(); }catch(_){}
      // ★ v3.2 — 進入後立即同步休戰狀態看板 + 開戰按鈕鎖
      try{ _wbSyncCeasefireBanner(); }catch(_){}
      try{ _wbSyncStartButtonGate(); }catch(_){}
      // 確保訂閱已啟動(背景持續同步)
      try{ if(window._wbControl && window._wbControl.subscribe) window._wbControl.subscribe(); }catch(_){}
      // ★ v3.1.2 — 切換到世界 BOSS 主頁面 BGM
      try{
        // 記下原 BGM 以便離開時還原
        if(typeof _curBgm !== 'undefined' && _curBgm && _curBgm !== 'bgm-wb-menu' && _curBgm !== 'bgm-wb-vesuvius-battle'){
          window._wbPrevBgm = _curBgm;
        }
        if(typeof bgmFadeTo === 'function'){
          bgmFadeTo('bgm-wb-menu', 600);
        }
      }catch(_){}
    }else{
      _wbGameAlert('🌍 世界 BOSS 討伐戰功能即將開放,敬請期待!\n\n首發 BOSS:維蘇威火山龍王 🐉');
    }
  };

  window._closeWorldBossEntry = function(){
    const ov = document.getElementById('wb-entry-overlay');
    if(ov) ov.style.display = 'none';
    // ★ v3.1.2 — 關閉入口時恢復原 BGM
    try{
      if(window._wbPrevBgm && typeof bgmFadeTo === 'function'){
        bgmFadeTo(window._wbPrevBgm, 600);
      }
    }catch(_){}
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
      // ★ FIX 20260517(c) — 全服祝福加成統一定案:+25% / 72 小時
      //   (歷史:20260516 從 +10%/24h → +50%/48h,本輪改為 +25%/72h 折中)
      nameEl.textContent = (blessing.bossName || '世界 BOSS') +
        ' 已被全伺服器擊敗!所有玩家 EXP / 知識幣 / 掉寶率 +' + (blessing.bonusPct || 25) + '%';
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
      // ★ v3.1.1 — 鐵律 2.40:HERO_DB 是 const 宣告,不會掛 window
      //   必須用 typeof 檢查全域 lexical scope,而非 window.HERO_DB
      let dbReady = false;
      try{
        dbReady = (typeof HERO_DB === 'object' && HERO_DB &&
                   typeof BURST_DB === 'object' && BURST_DB);
      }catch(_){ dbReady = false; }
      const medalsReady = (typeof ALL_MEDALS !== 'undefined' && Array.isArray(ALL_MEDALS));

      if(dbReady){
        _wbInstallHeroData();
      }else if(tries < 30){
        return setTimeout(tryInstall, 500);
      }else{
        console.warn('[WB] HERO_DB 未就緒 — 維蘇威火山龍王資料未掛載');
      }

      if(medalsReady){
        _wbInstallMedals();
      }else if(tries < 30){
        let medalTries = 0;
        const medalTimer = setInterval(() => {
          medalTries++;
          if(typeof ALL_MEDALS !== 'undefined' && Array.isArray(ALL_MEDALS)){
            _wbInstallMedals();
            clearInterval(medalTimer);
          }else if(medalTries > 30){
            clearInterval(medalTimer);
            console.warn('[WB] ALL_MEDALS 未就緒 — 16 枚獎章未掛載');
          }
        }, 500);
      }

      console.log('[WB] ✅ world-boss.js 啟動完成 (v3.2 — 元素確認 + 休戰期)');

      _wbSyncStageHpBar();
      setInterval(_wbSyncStageHpBar, 30000);
      // ★ v3.2 — 啟動時刷一次按鈕外觀(狀態若已從 Firestore 同步好就會立即顯示;
      //          若尚未同步,Firestore 載入後會透過 wbCeasefireStateChanged 事件自動再刷)
      try{ _wbSyncStageButton(); }catch(_){}
      // 退而求其次:每 60 秒檢查一次(避免事件機制失效時按鈕外觀過期)
      setInterval(() => { try{ _wbSyncStageButton(); }catch(_){} }, 60000);
    }

    // DOM ready 後開始嘗試
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', tryInstall);
    }else{
      // 已經 loaded,稍微延後一下讓主程式 IIFE 先跑
      setTimeout(tryInstall, 100);
    }
  }

  // ★ v3.0 — 同步首頁 BOSS HP 條
  function _wbSyncStageHpBar(){
    const bar = document.getElementById('adv-worldboss-stage-hpbar');
    const curEl = document.getElementById('adv-wb-hp-cur');
    const maxEl = document.getElementById('adv-wb-hp-max');
    const pctEl = document.getElementById('adv-wb-hp-pct');
    if(!bar) return;  // 還沒到關卡選擇頁

    // 取得當前 BOSS 的 maxHp
    const lineup = window.WORLD_BOSS_LINEUP || [];
    const curBoss = lineup.find(b => b.id === 'vesuvius_fire_dragon') || lineup[0];
    const maxHp = (curBoss && curBoss.maxHp) || 500000;

    // 取得當前 HP — 從 _cachedGlobalStats.worldBossHp 讀
    let curHp = maxHp;  // 預設 100%
    try{
      const gs = window._cachedGlobalStats;
      if(gs && gs.worldBossHp && typeof gs.worldBossHp[curBoss.id] === 'number'){
        curHp = Math.max(0, Math.min(maxHp, gs.worldBossHp[curBoss.id]));
      }
    }catch(_){}

    const pct = Math.max(0, Math.min(100, (curHp / maxHp) * 100));

    bar.style.width = pct + '%';

    // 顏色隨 HP 變化(高 HP 紅橙、低 HP 暗紅)
    if(pct > 50){
      bar.style.background = 'linear-gradient(90deg,#ff3322 0%,#ff6644 30%,#ff9966 70%,#ffcc88 100%)';
    }else if(pct > 25){
      bar.style.background = 'linear-gradient(90deg,#cc2222 0%,#ee4422 50%,#ff8855 100%)';
    }else{
      bar.style.background = 'linear-gradient(90deg,#770000 0%,#aa1111 50%,#dd3322 100%)';
    }

    if(curEl) curEl.textContent = Math.round(curHp).toLocaleString();
    if(maxEl) maxEl.textContent = maxHp.toLocaleString();
    if(pctEl) pctEl.textContent = `(${pct.toFixed(1)}%)`;
  }
  window._wbSyncStageHpBar = _wbSyncStageHpBar;

  // ───────────────────────────────────────────────────────────────────
  // 11. 世界 BOSS 戰用題目 — 從「所有題庫」隨機抽取
  //     (而非綁定某一個關卡的題庫,這樣難度才有挑戰性)
  // ───────────────────────────────────────────────────────────────────
  function _wbGetAllQuestionPool(){
    // 嘗試從這些全域陣列收集題目
    const sources = [
      'ADV_QUIZ_DB',
      'TAIWAN_QUIZ_DB',
      'ADV_QUIZ_5S_MIDTERM',
      'ADV_QUIZ_5S_U3_ANIMAL',
      'ADV_QUIZ_5S_U4_SOUND',
      'ADV_QUIZ_DOG_CARE',
      'ADV_QUIZ_CARE_INFANT',
    ];
    const pool = [];
    for(const name of sources){
      try{
        const arr = window[name];
        if(Array.isArray(arr)){
          for(const q of arr){
            // 只收有 q 跟 a 欄位的題目(過濾掉設定資料)
            if(q && (q.q || q.question) && (q.a || q.answer || q.options)){
              pool.push(q);
            }
          }
        }
      }catch(_){}
    }
    return pool;
  }
  window._wbGetAllQuestionPool = _wbGetAllQuestionPool;

  // 隨機抽 N 題(不重複)
  window._wbPickRandomQuestions = function(count){
    count = count || 1;
    const pool = _wbGetAllQuestionPool();
    if(pool.length === 0) return [];
    const out = [];
    const used = new Set();
    const max = Math.min(count, pool.length);
    let tries = 0;
    while(out.length < max && tries < max * 5){
      tries++;
      const idx = Math.floor(Math.random() * pool.length);
      if(used.has(idx)) continue;
      used.add(idx);
      out.push(pool[idx]);
    }
    return out;
  };

  // 抽 1 題的便捷函式
  window._wbPickRandomQuestion = function(){
    const arr = window._wbPickRandomQuestions(1);
    return arr[0] || null;
  };

  // ═══════════════════════════════════════════════════════════════════
  // v3.1 — 全畫面特效系統 (S1 火雨 / S2 集中線 / 爆發技動畫)
  // ───────────────────────────────────────────────────────────────────
  const _WB_FX_URLS = {
    s1:    'https://raw.githubusercontent.com/clarebox123jp-art/LXPSGAME/main/' + encodeURIComponent('火雨.gif'),
    s2:    'https://raw.githubusercontent.com/clarebox123jp-art/LXPSGAME/main/' + encodeURIComponent('集中效果線.gif'),
  };

  // 播放全畫面 GIF 特效 (持續 1.6 秒後淡出)
  window._wbPlayFullscreenFx = function(fxKey, opts){
    opts = opts || {};
    const url = _WB_FX_URLS[fxKey];
    if(!url){
      console.warn('[WB-FX] 未知特效 key:', fxKey);
      return;
    }
    const dur = opts.duration || 1600;
    const ov = document.createElement('div');
    ov.className = 'wb-fullscreen-fx wb-fx-' + fxKey;
    ov.style.cssText = `
      position:fixed;inset:0;z-index:10300;pointer-events:none;
      background-image:url('${url}');
      background-size:cover;background-position:center;background-repeat:no-repeat;
      mix-blend-mode:screen;
      opacity:0;
      transition:opacity 0.25s;
    `;
    document.body.appendChild(ov);
    // 強制觸發動畫
    requestAnimationFrame(() => { ov.style.opacity = '1'; });
    setTimeout(() => {
      ov.style.opacity = '0';
      setTimeout(() => { try{ ov.remove(); }catch(_){} }, 320);
    }, dur);

    // 同時播放螢幕震動效果
    if(opts.shake){
      const battleArea = document.getElementById('wb-battle-area');
      if(battleArea){
        battleArea.classList.add('wb-screen-shake');
        setTimeout(() => battleArea.classList.remove('wb-screen-shake'), 600);
      }
    }
  };

  // 爆發技動畫(沿用主程式既有的 BURST 動畫,呼叫 playBurstAnimation 或 fallback)
  window._wbPlayBurstAnimation = function(){
    try{
      // 主程式有自己的爆發動畫(playBurstAnimation 或 _showBurstCutscene),嘗試呼叫
      if(typeof playBurstAnimation === 'function'){
        playBurstAnimation('維蘇威火山龍王', '天崩之炎');
        return;
      }
      if(typeof _showBurstCutscene === 'function'){
        _showBurstCutscene('維蘇威火山龍王', '天崩之炎');
        return;
      }
    }catch(_){}
    // Fallback:用全螢幕火光 + 文字
    const ov = document.createElement('div');
    ov.style.cssText = `
      position:fixed;inset:0;z-index:10400;pointer-events:none;
      background:radial-gradient(circle at center,rgba(255,100,40,0.85) 0%,rgba(160,30,20,0.95) 50%,rgba(0,0,0,0.95) 100%);
      display:flex;align-items:center;justify-content:center;flex-direction:column;
      animation:wbBurstFx 2.4s ease-out forwards;
    `;
    ov.innerHTML = `
      <div style="font-size:clamp(40px,7vw,80px);font-weight:900;color:#ffeecc;letter-spacing:8px;
        text-shadow:0 0 30px #ff3322,0 0 60px #ff3322,0 0 90px #ff6644;
        animation:wbBurstText 2.4s ease-out forwards;">
        ⚡ 天崩之炎 ⚡
      </div>
      <div style="font-size:clamp(20px,2.5vw,32px);font-weight:700;color:#ffaa66;letter-spacing:4px;
        margin-top:14px;animation:wbBurstText 2.4s ease-out 0.3s both;">
        兩千年怒火,一次釋放
      </div>
    `;
    document.body.appendChild(ov);
    setTimeout(() => { try{ ov.remove(); }catch(_){} }, 2400);
  };

  // ═══════════════════════════════════════════════════════════════════
  // v3.1 — 維蘇威護盾系統
  // ───────────────────────────────────────────────────────────────────
  // 在 HP 80% / 60% / 40% / 20% / 1% 時自動啟動護盾(從未啟動過才啟動)
  // 啟動時 4 個元素護盾各 3 層,被剋的屬性 -1 層
  //   剋制關係(用主程式既有規則):
  //     fire ← water(水克火)
  //     water ← grass(草克水)  ※ 但只有 4 元素護盾(火水風土),所以草不在內
  //     wind  ← earth(土克風)
  //     earth ← grass / wind?
  //     用更直接:火-水互剋、土-風互剋(對稱)
  //   實際採用:
  //     火盾 → 被 water 屬性攻擊 -1
  //     水盾 → 被 fire 屬性攻擊 -1
  //     風盾 → 被 earth 屬性攻擊 -1
  //     土盾 → 被 wind 屬性攻擊 -1
  // ───────────────────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════
  // v3.1.2 — 護盾元素系統(7 元素池 + 個別 BOSS 指定)
  // ───────────────────────────────────────────────────────────────────
  // 設計理念:
  //   1. 全部 7 種候選元素:火/水/風/土/光/暗/草 (WB_SHIELD_ALL_ELEMENTS)
  //   2. 每隻 BOSS 在 WORLD_BOSS_LINEUP 內透過 shieldElements 指定自己的 4 個
  //      (維蘇威火山龍王:火/風/土/暗;未來深海冰龍王:水/草/風/光 等)
  //   3. 屬性剋制用標準雙向(火↔水、土↔風、光↔暗、草克水土等)
  // ───────────────────────────────────────────────────────────────────

  const WB_SHIELD_ALL_ELEMENTS = ['fire','water','wind','earth','light','dark','grass'];

  // 元素 icon / label / 顏色(統一表)
  const WB_ELEMENT_META = {
    fire:  {icon:'🔥', label:'火盾', color:'#ff7755', borderColor:'rgba(255,110,80,0.85)', bg:'rgba(80,20,10,0.7)'},
    water: {icon:'💧', label:'水盾', color:'#88cfff', borderColor:'rgba(120,180,255,0.85)', bg:'rgba(15,30,70,0.7)'},
    wind:  {icon:'🌪', label:'風盾', color:'#aaffdd', borderColor:'rgba(150,240,200,0.85)', bg:'rgba(10,50,40,0.7)'},
    earth: {icon:'⛰', label:'土盾', color:'#ddbb88', borderColor:'rgba(220,180,120,0.85)', bg:'rgba(55,35,15,0.7)'},
    light: {icon:'☀', label:'光盾', color:'#fff5aa', borderColor:'rgba(255,245,170,0.85)', bg:'rgba(70,65,30,0.7)'},
    dark:  {icon:'🌑', label:'暗盾', color:'#bb88dd', borderColor:'rgba(190,140,230,0.85)', bg:'rgba(40,20,55,0.7)'},
    grass: {icon:'🌿', label:'草盾', color:'#88ee88', borderColor:'rgba(140,220,140,0.85)', bg:'rgba(20,50,20,0.7)'},
  };
  window._WB_ELEMENT_META = WB_ELEMENT_META;

  // 元素剋制表:攻擊元素 → 能削減哪個護盾元素
  // ★ v3.1.2 老師指定剋制鏈:
  //   主循環(五元素單向循環剋):水→火→草→土→風→水
  //     水 克 火 / 火 克 草 / 草 克 土 / 土 克 風 / 風 克 水
  //   光暗互剋(獨立成對):光 ↔ 暗
  const WB_ELEMENT_COUNTER = {
    water: ['fire'],     // 水克火
    fire:  ['grass'],    // 火克草
    grass: ['earth'],    // 草克土
    earth: ['wind'],     // 土克風
    wind:  ['water'],    // 風克水
    light: ['dark'],     // 光克暗
    dark:  ['light'],    // 暗克光
  };
  window._WB_ELEMENT_COUNTER = WB_ELEMENT_COUNTER;
  const WB_SHIELD_TRIGGERS = [
    { pct: 0.80, label:'80%' },
    { pct: 0.60, label:'60%' },
    { pct: 0.40, label:'40%' },
    { pct: 0.20, label:'20%' },
    { pct: 0.01, label:'1%'  },
  ];

  // 檢查並啟動護盾(每次 BOSS 受傷後呼叫)
  window._wbCheckShieldTrigger = function(boss){
    if(!boss) return null;
    boss._wbShieldHistory = boss._wbShieldHistory || {};
    const hpRatio = boss.curHp / (boss.hp || 500000);
    let triggered = null;
    for(const t of WB_SHIELD_TRIGGERS){
      if(hpRatio <= t.pct && !boss._wbShieldHistory[t.label]){
        boss._wbShieldHistory[t.label] = true;
        triggered = t.label;
        // ★ v3.1.2 — 用 BOSS 自己的 shieldElements 初始化護盾
        //   從 WORLD_BOSS_LINEUP 找該 BOSS 的設定;若找不到,fallback 用 fire/water/wind/earth
        let myElements = ['fire','water','wind','earth'];
        try{
          const lineup = window.WORLD_BOSS_LINEUP || [];
          const config = lineup.find(b => b.name === boss.name);
          if(config && Array.isArray(config.shieldElements) && config.shieldElements.length > 0){
            myElements = config.shieldElements;
          }
        }catch(_){}
        // 初始化護盾物件,每個元素 3 層
        boss._wbShields = {};
        myElements.forEach(el => { boss._wbShields[el] = 3; });
        // 同時記錄這次護盾的元素清單(給 UI 渲染用)
        boss._wbShieldElements = myElements.slice();
        break;
      }
    }
    return triggered;
  };

  // 取得 BOSS 當前護盾總層數(0 表示沒護盾)
  window._wbGetTotalShield = function(boss){
    if(!boss || !boss._wbShields) return 0;
    return Object.values(boss._wbShields).reduce((s,v) => s + Math.max(0,v), 0);
  };

  // 屬性攻擊削減對應元素護盾(每次攻擊 -1 層)
  window._wbConsumeShield = function(boss, attackElement){
    if(!boss || !boss._wbShields || !attackElement) return null;
    // ★ v3.1.2 — 用 WB_ELEMENT_COUNTER 查 attackElement 能克哪些元素
    //   遍歷 BOSS 身上現有的盾,看哪個盾「被剋」且還有層數
    const counterables = WB_ELEMENT_COUNTER[attackElement] || [];
    for(const shieldEl of counterables){
      if(boss._wbShields[shieldEl] > 0){
        boss._wbShields[shieldEl]--;
        return shieldEl;
      }
    }
    return null;
  };

  // 護盾啟動時的提示 modal
  window._wbShowShieldTriggerHint = function(pctLabel, boss){
    // 換掉舊版「第二階段啟動」單次提示,改成每次都提示
    const old = document.getElementById('wb-shield-hint-modal');
    if(old) old.remove();

    const ov = document.createElement('div');
    ov.id = 'wb-shield-hint-modal';
    ov.style.cssText = 'position:fixed;inset:0;z-index:10500;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(6px);';

    // ★ v3.1.2 — 用 BOSS 自己的元素 + 反查剋制邏輯,完全動態生成 modal 內容
    const elements = (boss && boss._wbShieldElements) ? boss._wbShieldElements : ['fire','water','wind','earth'];
    const bossName = (boss && boss.name) || '世界 BOSS';

    // 為每個護盾元素反查:哪個屬性能克它?
    function _whichCountersIt(shieldEl){
      const out = [];
      for(const atkEl of Object.keys(WB_ELEMENT_COUNTER)){
        if(WB_ELEMENT_COUNTER[atkEl].includes(shieldEl)) out.push(atkEl);
      }
      return out;
    }

    const iconRow = elements.map(el => WB_ELEMENT_META[el]?.icon || '?').join('');
    const ruleRows = elements.map(el => {
      const meta = WB_ELEMENT_META[el] || {icon:'?', label:el, color:'#fff'};
      const counters = _whichCountersIt(el);
      let counterText = '';
      if(counters.length){
        counterText = counters.map(c => {
          const cmeta = WB_ELEMENT_META[c] || {label:c};
          return `<b>${cmeta.label.replace('盾','')}</b>`;
        }).join(' / ');
      }else{
        counterText = '<i style="color:#999;">(無剋制元素 — 此盾無法被打破!)</i>';
      }
      return `${meta.icon} <b style="color:${meta.color};">${meta.label}</b>:被 ${counterText} 屬性攻擊 -1 層`;
    }).join('<br>');

    const elementListForTactic = elements.map(el => {
      const counters = _whichCountersIt(el);
      if(!counters.length) return null;
      const c = counters[0];
      const cmeta = WB_ELEMENT_META[c] || {label:c, color:'#fff'};
      return `<b style="color:${cmeta.color};">${cmeta.label.replace('盾','')}</b>`;
    }).filter(x => x !== null).join(' / ');

    ov.innerHTML = `
      <div style="max-width:560px;background:linear-gradient(160deg,#2a1818,#1a0a0a);
        border:3px solid rgba(255,120,80,0.85);border-radius:18px;padding:24px 22px;
        box-shadow:0 0 60px rgba(255,80,40,0.6);text-align:center;color:#ffeecc;">
        <div style="font-size:32px;margin-bottom:8px;letter-spacing:6px;">${iconRow}</div>
        <div style="font-size:24px;color:#ff8866;font-weight:900;letter-spacing:2px;margin-bottom:10px;
          text-shadow:0 0 14px rgba(255,100,60,0.6);">
          ⚠ HP ${pctLabel} — 元素護盾啟動!
        </div>
        <div style="font-size:15px;color:#ffe;line-height:1.85;text-align:left;
          background:rgba(255,80,40,0.12);padding:13px 16px;border-radius:10px;
          border-left:4px solid rgba(255,120,80,0.7);margin-bottom:12px;">
          ${bossName}身上浮現 <b style="color:#ff8866;">${elements.length} 種護盾各 3 層</b>:
          <br>
          ${ruleRows}
          <br><br>
          <b style="color:#ffcc66;">護盾期間所有傷害再減 80%</b>,
          即使「無視有利狀態」的攻擊也無法穿透。<br>
          打破對應屬性 3 層才能解除該盾。<br>
          <br>
          💡 戰術:準備 ${elementListForTactic} 屬性英雄輪流破盾!
        </div>
        <button onclick="document.getElementById('wb-shield-hint-modal').remove()"
          style="background:linear-gradient(135deg,#ff6644,#cc3322);color:#fff;
          border:2px solid rgba(255,160,140,0.7);border-radius:10px;padding:9px 24px;
          font-size:16px;font-weight:800;cursor:pointer;letter-spacing:2px;
          box-shadow:0 4px 14px rgba(255,80,40,0.5);">
          ⚔ 繼續戰鬥!
        </button>
      </div>
    `;
    document.body.appendChild(ov);
    setTimeout(() => { try{ ov.remove(); }catch(_){} }, 8000);
  };

  // ═══════════════════════════════════════════════════════════════════
  // v3.1 — 答題系統 (取代「直接點普攻就打」,改成「答對才能行動」)
  // ───────────────────────────────────────────────────────────────────
  // 流程:
  //   開戰    → BOSS 咆哮 (display once)
  //   回合 1  → BOSS 先出題給玩家答 → 全員一題 → 答對 burst+1 / 答錯受 5% 傷害
  //   回合 N  → BOSS 行動 → 玩家依速度順序答題 → 答對才能行動,答錯跳過
  //   答對累積 第10/25/50次 觸發答題獎勵(以前是 BOSS 受 20% HP 傷害,現改為 1%)
  //   倒下角色跳過答題
  //   回合 10 → BOSS 必放爆發 (第9回合警告)
  //   回合 18 → 系統警告「戰場即將崩毀」
  //   回合 20 → BOSS 強制全員滅絕,結算
  // ───────────────────────────────────────────────────────────────────
  window._wbConstants = {
    MAX_TURNS: 20,
    BURST_TURN: 10,
    BURST_WARN_TURN: 9,
    COLLAPSE_WARN_TURN: 18,
    PUNISH_HP_PCT: 0.05,      // 答錯扣 5% 自己 max HP
    QUIZ_REWARD_DMG_PCT: 0.01, // 答題獎勵 1% 傷害
    QUIZ_REWARD_TRIGGERS: [10, 25, 50], // 第幾次答對觸發
  };

  // BOSS 開戰咆哮
  window._wbBossOpeningRoar = function(){
    const lines = [
      '⚡ 兩千年的沉睡終結...',
      '🔥 渺小的凡人們,竟敢驚擾我的安眠?',
      '🐉 維蘇威之怒,將再次掩埋人類的世界!',
    ];
    const ov = document.createElement('div');
    ov.id = 'wb-boss-roar';
    ov.style.cssText = `
      position:fixed;inset:0;z-index:10600;
      background:radial-gradient(ellipse at center,rgba(80,20,10,0.9),rgba(20,5,5,0.97));
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      pointer-events:none;
    `;
    ov.innerHTML = `
      <div style="font-size:clamp(60px,9vw,120px);margin-bottom:20px;animation:wbRoarPulse 0.6s ease-out infinite;">🐉</div>
      <div id="wb-roar-text" style="font-size:clamp(22px,3vw,36px);font-weight:900;color:#ff8866;letter-spacing:6px;
        text-align:center;line-height:1.8;text-shadow:0 0 20px #ff3322,0 0 40px #ff3322,0 4px 8px rgba(0,0,0,0.95);
        padding:0 30px;"></div>
    `;
    document.body.appendChild(ov);
    let i = 0;
    function nextLine(){
      const el = document.getElementById('wb-roar-text');
      if(!el) return;
      el.style.animation = 'none';
      el.offsetHeight; // reflow
      el.textContent = lines[i] || '';
      el.style.animation = 'wbRoarTextFade 1.2s ease-in-out';
      i++;
      if(i < lines.length){
        setTimeout(nextLine, 1100);
      }else{
        setTimeout(() => { try{ ov.remove(); }catch(_){} }, 1500);
      }
    }
    nextLine();
  };

  // ════════════════════════════════════════════════════════════════════
  // ★ v4.0 (2026-05-17) — 世界 BOSS 戰接入主程式 advStartBattle() 系統
  // ────────────────────────────────────────────────────────────────────
  // 設計理念(來自記憶傳承):
  //   世界 BOSS 戰共用主程式 #gc 戰場 + 台灣關 UI(英雄卡、能量條、順序條、
  //   相剋盤、log)。本檔提供:
  //   (1) ADV_STAGES.worldboss 關卡定義(讓主程式認得這個 stage)
  //   (2) AI hook:BOSS 行動改走世界戰自訂 AI(火雨/龍吼/爆發/普攻)
  //   (3) 結算 hook:BOSS curHp=0 時走世界戰自製結算,不發冒險獎勵
  //   (4) execSkill hook:玩家對 BOSS 造成傷害時套用炎之意志/護盾削減
  //   (5) startTurn hook:第 10 回合強制 BOSS 爆發、第 20 回合滅絕
  //
  // 不入侵主程式檔案(index.html 完全不改):
  //   - ADV_STAGES 用 ADV_STAGES.worldboss = {...} 補上
  //   - aiAct 攔截:override window.aiAct,在 worldboss stage 時改走自製
  //   - checkWin 攔截:override window.checkWin,在 worldboss stage 時改走自製
  //   - execSkill 用 window._wbHookExecSkill(已存在)做傷害削減
  // ════════════════════════════════════════════════════════════════════

  // ── A. 世界戰 ADV_STAGES 關卡定義 ───────────────────────────────────
  function _wbInstallAdvStage(){
    const ADV = window.ADV_STAGES;
    if(typeof ADV === 'undefined' || !ADV){
      console.warn('[WB-Adv] window.ADV_STAGES 未就緒,延後註冊');
      return false;
    }
    if(ADV.worldboss){
      // 已註冊過(可能 hot reload),覆蓋
    }
    ADV.worldboss = {
      name: '🌍 世界 BOSS 討伐戰',
      emoji: '🐉🌋🔥💀',
      desc: '來自地心的維蘇威火山龍王降臨!4 位英雄聯手在 20 回合內擊敗牠,'
          + '善用元素相剋削減多層護盾,小心第 10 回合的天崩之炎爆發!',
      stars: 5,
      objectives: [
        '⚔ 4 位英雄共同作戰,20 回合內擊敗龍王',
        '🛡 用 4 種破盾元素削減 BOSS 護盾(HP 80/60/40/20/1% 啟動)',
        '💥 撐過第 10 回合的「天崩之炎」爆發技',
        '🏆 全員存活擊敗 BOSS 獲得最高排名',
      ],
      rewards: [
        {icon:'⭐', text:'雷霆勳章 / 火霜獎章'},
        {icon:'📖', text:'技能升級書 ×5'},
        {icon:'💰', text:'大量知識幣'},
        {icon:'🦸', text:'獨家世界 BOSS 戰績榜'},
      ],
      tags: [
        {cls:'nature', text:'🌋 火山熔岩'},
        {cls:'social', text:'🤝 4 人協作'},
        {cls:'math',   text:'⚔ 元素相剋'},
      ],
    };
    console.log('[WB-Adv] ✅ ADV_STAGES.worldboss 已註冊');
    return true;
  }

  // ── B. 主程式 aiAct 攔截:worldboss stage 時改走世界戰 BOSS AI ─────
  // ──────────────────────────────────────────────────────────────────
  // 思路:主程式 aiAct(actor) 看到 actor 是 worldboss stage 的 BOSS 時,
  //   不走主程式答題流程,改呼叫 _wbAdvBossTurn() 執行世界戰 BOSS AI。
  //   行動完後設 actor.acted=true 並呼叫 endAction 進入下一回合。
  // ════════════════════════════════════════════════════════════════════
  // ★ v6 Phase 3 (2026-05-17) — 房主端 G 同步機制
  // ────────────────────────────────────────────────────────────────────
  // 連線模式房主跑主程式 advStartBattle() 後,主程式 G 被改動時(玩家 / BOSS
  // 行動結算、回合開始等),要把完整 G 序列化推到 Firestore 給非房主玩家。
  //
  // 設計重點:
  //   1. 節流:同一 tick 多次呼叫只發一次 push(用 microtask 合併)
  //   2. 守門:只在 window._wbConnectedHostMode === true 才 push,
  //            單人練習 / 非房主端不會誤觸
  //   3. 呼叫 window._wbNet.hostPushBattleState({fullWireG, _syncReason})
  //   4. fullWireG 由 window._wbWireUtils.GToWire(G) 產生(Phase 1 已安裝)
  // ════════════════════════════════════════════════════════════════════
  let _wbHostSyncPending = false;
  let _wbHostSyncPushCount = 0;
  window._wbHostSyncG = function(reason){
    if(!window._wbConnectedHostMode) return;       // 守門:只連線房主跑
    if(!window._wbNet || typeof window._wbNet.hostPushBattleState !== 'function') return;
    if(!window._wbWireUtils || typeof window._wbWireUtils.GToWire !== 'function'){
      console.warn('[WB-Sync v6] _wbWireUtils.GToWire 未就緒,跳過 push');
      return;
    }
    // 節流:同 tick 內多次呼叫合併
    if(_wbHostSyncPending) return;
    _wbHostSyncPending = true;
    const _r = reason || 'unknown';
    Promise.resolve().then(() => {
      _wbHostSyncPending = false;
      try{
        const G = (typeof window._wbGetG === 'function') ? window._wbGetG() : window.G;
        if(!G){ console.warn('[WB-Sync v6] G 不存在,跳過 push'); return; }
        const fullWireG = window._wbWireUtils.GToWire(G);
        const curOrder = (G.turnOrder && G.turnOrder[G.currentActorIdx]) || null;
        _wbHostSyncPushCount++;
        console.log(`[WB-Sync v6] push #${_wbHostSyncPushCount} reason=${_r} turn=${G.round||G.turn||'?'} actorIdx=${G.currentActorIdx}`);
        window._wbNet.hostPushBattleState({
          fullWireG: fullWireG,
          _syncReason: _r,
          // 兼容欄位(舊接收端可能讀)
          turn: G.round || G.turn || 1,
          currentActorIdx: G.currentActorIdx || 0,
          turnOrder: G.turnOrder || [],
          p1: G.p1 || [],
          p2: G.p2 || [],
          logEntries: [],  // log 已在 fullWireG 內
        });
      }catch(e){
        console.error('[WB-Sync v6] push 失敗', e);
      }
    });
  };

  // ─ 安裝 endAction sync hook ───────────────────────────────────
  function _wbInstallEndActionSyncHook(){
    if(typeof window.endAction !== 'function') return false;
    if(window._wbEndActionSyncPatched) return true;
    const _origEndAction = window.endAction;
    window.endAction = function(a, cost, noFinish){
      const ret = _origEndAction.apply(this, arguments);
      try{
        if(window._wbConnectedHostMode){
          window._wbHostSyncG('after_endAction');
        }
      }catch(e){ console.warn('[WB-Sync v6] endAction hook 例外', e); }
      return ret;
    };
    window._wbEndActionSyncPatched = true;
    console.log('[WB-Sync v6] ✅ endAction sync hook 已安裝');
    return true;
  }

  // ─ 安裝 startTurn sync hook ───────────────────────────────────
  function _wbInstallStartTurnSyncHook(){
    if(typeof window.startTurn !== 'function') return false;
    if(window._wbStartTurnSyncPatched) return true;
    const _origStartTurn = window.startTurn;
    window.startTurn = function(){
      // ★ Phase 4 預留:client mode early return
      //   (client mode 旗標還沒做時,這個 if 不會生效)
      if(window._wbClientMode){
        // 非房主端 — 不在本機推進 turn,等房主 sync 過來
        return;
      }
      const ret = _origStartTurn.apply(this, arguments);
      try{
        if(window._wbConnectedHostMode){
          window._wbHostSyncG('after_startTurn');
        }
      }catch(e){ console.warn('[WB-Sync v6] startTurn hook 例外', e); }
      return ret;
    };
    window._wbStartTurnSyncPatched = true;
    console.log('[WB-Sync v6] ✅ startTurn sync hook 已安裝');
    return true;
  }

  // ════════════════════════════════════════════════════════════════════
  // ★ FIX 20260517(bb) — updateUI 守門:房主端只在「自己/自己代打的槽」
  //                       才顯示 action-panel,輪到隊友時要藏起來,
  //                       不然房主畫面會跑出隊友的操作選單。
  // ────────────────────────────────────────────────────────────────────
  // 規則:
  //   (a) 非世界 BOSS 連線戰 → 不動(走主程式原生邏輯)
  //   (b) 房主端 (_wbConnectedHostMode):
  //       - G.activeChar 為「自己/自己代打的槽」  → action-panel 維持顯示
  //       - G.activeChar 為「其他真人玩家的槽」  → 藏 action-panel + 顯示「等候 XX」
  //   (c) 非房主端 (_wbConnectedClientMode):
  //       - G.activeChar 為「自己的槽」          → action-panel 維持顯示
  //       - G.activeChar 為其他槽位             → 藏 action-panel + 顯示「等候 XX」
  //
  // 判斷「自己的槽」:
  //   - 房主代打槽 → hero._wbIsHostNpc === true (空槽 / 玩家離線)
  //   - 真人槽 → 透過 _wbNet.getSnapshot().players[pos].uid === window._gUserId
  // ════════════════════════════════════════════════════════════════════
  function _wbInstallUpdateUIGuard(){
    if(typeof window.updateUI !== 'function') return false;
    if(window._wbUpdateUIGuardPatched) return true;
    const _origUpdateUI = window.updateUI;
    window.updateUI = function(){
      const ret = _origUpdateUI.apply(this, arguments);
      try{
        // 只在世界 BOSS 連線戰啟用
        if(!window._wbInWorldBossMode) return ret;
        if(!window._wbConnectedHostMode && !window._wbConnectedClientMode) return ret;
        const G = (typeof window._wbGetG === 'function') ? window._wbGetG() : window.G;
        if(!G) return ret;

        // ★ FIX 20260517(dd) — 還原工具:把藏起來的 item-panel + 等候 banner 還原。
        //   任何 early return(BOSS 回合 / actor 行動完 / 沒 activeChar)前都要呼叫,
        //   否則上一輪藏的狀態會卡死,造成「BOSS 回合時隊友還在等候畫面」之類錯亂。
        const _wbRestoreUI = function(){
          try{
            const banner = document.getElementById('_wb-wait-banner');
            if(banner && banner.style.display !== 'none') banner.style.display = 'none';
          }catch(_){}
          try{
            const ip = document.getElementById('item-panel');
            if(ip && ip.style.display === 'none'){
              ip.style.display = (typeof ip.dataset._wbOrigDisplay !== 'undefined')
                ? ip.dataset._wbOrigDisplay : '';
            }
          }catch(_){}
        };

        const actor = G.activeChar;
        if(!actor || actor.side !== 'p1'){ _wbRestoreUI(); return ret; }
        if(actor.acted || actor.curHp <= 0){ _wbRestoreUI(); return ret; }

        // 判斷 actor 是否屬於「我」操作
        const myUid = window._gUserId;
        const snap = (window._wbNet && typeof window._wbNet.getSnapshot === 'function')
          ? window._wbNet.getSnapshot() : null;
        const players = (snap && Array.isArray(snap.players)) ? snap.players : [];
        const pos = actor.pos;
        const playerAtSlot = players[pos];

        let isMine = false;
        if(window._wbConnectedHostMode){
          // 房主端:房主代打的槽(_wbIsHostNpc=true) 或 真人槽且玩家是我
          if(actor._wbIsHostNpc){
            isMine = true;
          }else if(playerAtSlot && playerAtSlot.uid === myUid){
            isMine = true;
          }
        }else if(window._wbConnectedClientMode){
          // client 端:只有真人槽且玩家是我
          if(playerAtSlot && playerAtSlot.uid === myUid){
            isMine = true;
          }
          // (client 不該看到 _wbIsHostNpc=true 的槽位被當成自己,
          //  那是房主代打的槽,只有房主能按)
        }

        if(!isMine){
          // ── 不是我操作:藏 action-panel + item-panel,顯示「等候 XX」獨立 banner ──
          // ★ FIX 20260517(dd) — 同時藏 #item-panel(非自己回合不能用物品),
          //                       用獨立 banner DIV(放在 #sb 內)顯示等候提示,
          //                       原本只改 #actor-info 但 action-panel 被藏 → 提示看不到。
          try{
            const panel = document.getElementById('action-panel');
            if(panel) panel.style.display = 'none';
          }catch(_){}
          try{
            const ip = document.getElementById('item-panel');
            if(ip){
              // 記住原本的 display(可能是 ''/block/flex 等),還原時用
              if(typeof ip.dataset._wbOrigDisplay === 'undefined'){
                ip.dataset._wbOrigDisplay = ip.style.display || '';
              }
              ip.style.display = 'none';
            }
          }catch(_){}
          // 等候 banner — 放在 #sb 內 #log 之後、#action-panel 之前的獨立 DIV
          try{
            const waitName = (playerAtSlot && playerAtSlot.name)
              || ('槽 ' + (pos + 1));
            const heroName = actor.name || '英雄';
            let banner = document.getElementById('_wb-wait-banner');
            if(!banner){
              banner = document.createElement('div');
              banner.id = '_wb-wait-banner';
              banner.style.cssText = 'margin:8px 0;padding:14px 12px;border-radius:14px;'
                + 'background:linear-gradient(135deg,rgba(60,40,90,0.55),rgba(40,30,70,0.45));'
                + 'border:2px solid rgba(255,217,102,0.55);'
                + 'box-shadow:0 0 18px rgba(255,217,102,0.25),inset 0 0 12px rgba(255,217,102,0.12);';
              // 嘗試插在 #log 之後;若失敗就 append 到 #sb
              const sb = document.getElementById('sb');
              const logEl = document.getElementById('log');
              if(logEl && logEl.parentNode){
                logEl.parentNode.insertBefore(banner, logEl.nextSibling);
              }else if(sb){
                sb.appendChild(banner);
              }
            }
            banner.innerHTML = '<div style="font-size:30px;font-weight:700;line-height:1.4;'
              + 'animation:actorInfoGlow 1.4s ease-in-out infinite;text-align:center;'
              + 'letter-spacing:1px;color:#fff;">⏳ 現在是 <span style="color:#ffd966;'
              + 'text-shadow:0 0 16px rgba(255,220,0,0.9)">' + _escAi(waitName)
              + '</span> 的<br><span style="color:#9be4ff;font-size:26px;">'
              + _escAi(heroName) + '</span> 回合中...</div>';
            banner.style.display = 'block';
          }catch(_){}
        }else{
          // ── 是我操作:確保 banner 移除、item-panel 還原 ──
          try{
            const banner = document.getElementById('_wb-wait-banner');
            if(banner) banner.style.display = 'none';
          }catch(_){}
          try{
            const ip = document.getElementById('item-panel');
            if(ip && ip.style.display === 'none'){
              // 還原為原本 display(空字串等同預設值)
              ip.style.display = (typeof ip.dataset._wbOrigDisplay !== 'undefined')
                ? ip.dataset._wbOrigDisplay : '';
            }
          }catch(_){}
        }
      }catch(eGuard){
        console.warn('[WB-UIGuard v6] updateUI hook 例外', eGuard);
      }
      return ret;
    };
    window._wbUpdateUIGuardPatched = true;
    console.log('[WB-UIGuard v6] ✅ updateUI 守門 hook 已安裝');
    return true;
  }

  // HTML escape 小工具(updateUI guard 用)
  function _escAi(s){
    return String(s == null ? '' : s).replace(/[<>&"']/g, c =>
      ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&#39;' }[c]));
  }

  function _wbInstallAiActHook(){
    if(typeof window.aiAct !== 'function'){
      // aiAct 尚未載入,延後
      return false;
    }
    if(window._wbAiActPatched) return true;
    const _origAiAct = window.aiAct;
    window.aiAct = function(a){
      // ★ v6 Phase 4 — client mode 攔截:非房主端 BOSS 行動等房主廣播,本機不跑 AI
      if(window._wbClientMode){
        try{
          if(a && a.side === 'p2' && window._wbIsBossName && window._wbIsBossName(a.name)){
            console.log('[WB-Client v6] aiAct 被攔截(BOSS 行動等房主廣播)');
            return;
          }
        }catch(_){}
      }
      try{
        // 偵測:是否處於世界戰 stage + 是否為 BOSS
        if(typeof window._wbGetAdvStage === 'function' && window._wbGetAdvStage() === 'worldboss'
           && a && a.side === 'p2' && typeof a.name === 'string'
           && window._wbIsBossName && window._wbIsBossName(a.name)){
          // ★ FIX 20260518(c) #6 — quiz 守門:世界 BOSS 已在 ADV_QUIZ_BOSS_NAMES,
          //   需要先讓主程式 aiAct 內的 quiz 觸發邏輯跑完(advShowQuiz),
          //   quiz cb 內呼叫 _realAiAct → _realAiAct 自己會接到 _wbAdvBossTurn(已在 #6 修補)。
          //   所以這裡的 hook 只在「答題已完成 / 不需答題」情境直接走 _wbAdvBossTurn。
          const _quizBusy = (typeof window._advQuizPhase !== 'undefined'
                            && (window._advQuizPhase === 'asking' || window._advQuizPhase === 'answered'))
                           || !!window._bossQuizInFlight;
          const _quizCbPending = !!window._advQuizResolveCb;
          // 答題流程進行中 → 走主程式 aiAct(讓它的 quiz 觸發邏輯接管,不要在這裡 return)
          if(_quizBusy || _quizCbPending){
            console.log('[WB-Adv aiAct hook] quiz 進行中,讓主程式 aiAct quiz 邏輯接管');
            return _origAiAct.apply(this, arguments);
          }
          // 走世界戰 BOSS AI(沒有 quiz 流程在跑時,例如 quiz 失敗 fallback 或還沒觸發)
          if(typeof window._wbAdvBossTurn === 'function'){
            // 但若 BOSS 在名單中且未行動 → 應該讓 quiz 先觸發,不要這裡跑 AI
            const _needQuiz = window.ADV_QUIZ_BOSS_NAMES
                           && window.ADV_QUIZ_BOSS_NAMES.indexOf(a.name) >= 0
                           && a.curHp > 0 && !a.acted;
            if(_needQuiz){
              console.log('[WB-Adv aiAct hook] BOSS 需要先答題,讓主程式 aiAct 接管 quiz 觸發');
              return _origAiAct.apply(this, arguments);
            }
            return window._wbAdvBossTurn(a);
          }
        }
      }catch(e){ console.warn('[WB-Adv aiAct hook] 例外,fallback 原 aiAct', e); }
      return _origAiAct.apply(this, arguments);
    };
    window._wbAiActPatched = true;
    console.log('[WB-Adv] ✅ aiAct hook 已安裝');
    return true;
  }

  // BOSS 名單判斷(目前只有維蘇威火山龍王,未來擴充其他世界 BOSS 時加進來)
  window._wbIsBossName = function(name){
    if(!name) return false;
    return name === '維蘇威火山龍王';
  };

  // ── C. 世界戰 BOSS AI(替代 world-boss-ui.html 內的 _wbHostExecuteBossTurn)─
  // ─────────────────────────────────────────────────────────────────
  // 跑在主程式戰鬥引擎中,直接修改 G.p1[i].curHp + log + renderCard,然後 endAction
  window._wbAdvBossTurn = function(boss){
    if(!boss || boss.curHp <= 0) return;
    const G = (typeof window._wbGetG === "function") ? window._wbGetG() : window.G;
    if(!G || !G.p1) return;

    // ★ FIX 20260518(c) #3 — 每次 BOSS 行動進入時重置防雙重觸發狀態
    //   (上一輪的 _wbEndedThisTurn=true 若沒清會卡死下一輪 endAction)
    boss._wbEndedThisTurn = false;
    try{ if(boss._wbBossTid){ clearTimeout(boss._wbBossTid); boss._wbBossTid = null; } }catch(_){}

    // ★ 第 20 回合到 → 強制全員滅絕
    if((G.round || 1) >= 20){
      // ★ FIX 20260517 — 滅絕也算技能,播技能音效
      try{ if(typeof playSfx === 'function') playSfx('sfx-wb-boss-skill', 0.7); }catch(_){}
      if(typeof log === 'function') log('💥 戰場崩毀!維蘇威火山龍王發動最終滅絕!');
      const alive = G.p1.filter(h => h && h.curHp > 0);
      alive.forEach(t => {
        // 直接全清,visually 用大量 doDmg 也行,簡化為直接設 0
        const _d = t.curHp;
        try{
          if(typeof doDmg === 'function'){
            doDmg(t, _d, { actor: boss, isSkill: true, fixedDmg: true, isAoe: true });
          }else{
            t.curHp = 0;
          }
        }catch(_){ t.curHp = 0; }
        try{ renderCard(t); }catch(_){}
      });
      try{ if(typeof window._wbPlayBurstAnimation === 'function') window._wbPlayBurstAnimation(); }catch(_){}
      if(typeof log === 'function') log('☠ 全員陣亡 — 戰場已被火山灰掩埋');
      // ★ FIX 20260518(c) #3 — 滅絕路徑也走防雙重觸發
      _safeBossEndAction(boss);
      return;
    }

    // ★ 第 10 回合固定爆發技
    if((G.round || 1) === 10 && !G._wbBurstUsed){
      G._wbBurstUsed = true;
      _wbAdvBossBurst(boss);
      return;
    }

    // BOSS AI:隨機選 S1 / S2 / 普攻(45% / 35% / 20%)
    const r = Math.random();
    if(r < 0.45){
      _wbAdvBossS1(boss);
    }else if(r < 0.80){
      _wbAdvBossS2(boss);
    }else{
      _wbAdvBossNormalAtk(boss);
    }
  };

  // ════════════════════════════════════════════════════════════════════
  // ★ FIX 20260518(c) #3 — BOSS 動作 endAction 防雙重觸發共用工具
  // ────────────────────────────────────────────────────────────────────
  // 問題:_wbAdvBossS1/S2/Burst/NormalAtk 結尾都用 setTimeout 跑 endAction(boss, 0),
  //       期間若玩家爆發插隊把 boss.acted 設成 true 並走完 _burstFinish → startTurn,
  //       原本 setTimeout 仍會跑 → 第二次 endAction → currentActorIdx 跳一個 actor →
  //       導致下一位玩家永遠輪不到。
  // 解法:
  //   1. 把 setTimeout 句柄存到 boss._wbBossTid,新一次 BOSS 動作前先 clear
  //   2. _safeBossEndAction(boss):endAction 前先檢查「boss 是否已被其他流程處理過」
  //      - 若 boss.curHp <= 0 → 不再呼叫 endAction(checkWin 應已接管)
  //      - 若 boss._wbEndedThisTurn === true → 已 endAction 過,跳過
  //      - 否則正常設 acted=true + endAction,並標記 _wbEndedThisTurn 防 double-fire
  //   3. startTurn 時主程式會清 acted,並由 _wbInstallStartTurnSyncHook 清 _wbEndedThisTurn
  // ════════════════════════════════════════════════════════════════════
  function _safeBossEndAction(boss){
    if(!boss) return;
    // 已被插隊處理過(玩家爆發優先 etc.)
    if(boss._wbEndedThisTurn === true){
      try{ console.log('[WB-BossAct] _safeBossEndAction 已跑過,跳過(防雙重 endAction)'); }catch(_){}
      return;
    }
    // BOSS 已死
    if(boss.curHp <= 0){
      try{ console.log('[WB-BossAct] BOSS HP=0,checkWin 應接管,跳過 endAction'); }catch(_){}
      boss._wbEndedThisTurn = true;
      return;
    }
    boss._wbEndedThisTurn = true;
    boss.acted = true;
    try{ if(typeof checkWin === 'function' && checkWin()) return; }catch(_){}
    try{ if(typeof endAction === 'function') endAction(boss, 0); }catch(_){}
  }
  function _scheduleBossEnd(boss, delay){
    // 取消舊 timer(若 BOSS 連續被觸發,避免堆積)
    try{ if(boss._wbBossTid) clearTimeout(boss._wbBossTid); }catch(_){}
    boss._wbBossTid = setTimeout(() => {
      boss._wbBossTid = null;
      _safeBossEndAction(boss);
    }, delay);
  }
  // 對外暴露,讓 startTurn sync hook / _wbAdvBossTurn 等清狀態
  window._wbClearBossEndState = function(boss){
    if(!boss) return;
    boss._wbEndedThisTurn = false;
    try{ if(boss._wbBossTid){ clearTimeout(boss._wbBossTid); boss._wbBossTid = null; } }catch(_){}
  };

  // BOSS S1:業火灼燒(全體 sp×1.0 + 燃燒 2 回合)
  function _wbAdvBossS1(boss){
    const G = (typeof window._wbGetG === "function") ? window._wbGetG() : window.G;
    // ★ FIX 20260517 — 技能音效(龍的呼嘯)
    try{ if(typeof playSfx === 'function') playSfx('sfx-wb-boss-skill', 0.7); }catch(_){}
    try{ if(typeof window._wbPlayFullscreenFx === 'function') window._wbPlayFullscreenFx('s1', {duration:1600, shake:true}); }catch(_){}
    const alive = G.p1.filter(h => h && h.curHp > 0);
    const dmg = Math.floor((boss.sp || 50) * 1.00);
    alive.forEach(t => {
      // 走主程式 doDmg(有傷害彈出/震動/屬性計算)
      try{
        if(typeof doDmg === 'function'){
          doDmg(t, dmg, { actor: boss, isSkill: true, isAoe: true, ignoreBuffs: true });
        }else{
          t.curHp = Math.max(0, t.curHp - dmg);
        }
      }catch(_){
        t.curHp = Math.max(0, t.curHp - dmg);
      }
      t._wbBurn = 2;
      try{ renderCard(t); }catch(_){}
    });
    if(typeof log === 'function') log(`🔥 維蘇威火山龍王「業火灼燒」!全體 -${dmg} HP,並附加燃燒 2 回合`);
    // ★ FIX 20260518(c) #3 — 用 _scheduleBossEnd 取代裸 setTimeout
    _scheduleBossEnd(boss, 1500);
  }

  // BOSS S2:龍吼震懾(全體 sp×0.75 + 50% 眩暈)
  function _wbAdvBossS2(boss){
    const G = (typeof window._wbGetG === "function") ? window._wbGetG() : window.G;
    // ★ FIX 20260517 — 技能音效(龍的呼嘯)
    try{ if(typeof playSfx === 'function') playSfx('sfx-wb-boss-skill', 0.7); }catch(_){}
    try{ if(typeof window._wbPlayFullscreenFx === 'function') window._wbPlayFullscreenFx('s2', {duration:1600, shake:true}); }catch(_){}
    const alive = G.p1.filter(h => h && h.curHp > 0);
    const dmg = Math.floor((boss.sp || 50) * 0.75);
    const stunNames = [];
    alive.forEach(t => {
      try{
        if(typeof doDmg === 'function'){
          doDmg(t, dmg, { actor: boss, isSkill: true, isAoe: true, ignoreBuffs: true });
        }else{
          t.curHp = Math.max(0, t.curHp - dmg);
        }
      }catch(_){
        t.curHp = Math.max(0, t.curHp - dmg);
      }
      if(t.curHp > 0 && Math.random() < 0.50){
        // 套用主程式的暈眩 status
        if(!t.status) t.status = [];
        t.status = t.status.filter(s => s.type !== 'stun');
        t.status.push({type:'stun', dur:1});
        stunNames.push(t.name);
      }
      try{ renderCard(t); }catch(_){}
    });
    const stunMsg = stunNames.length ? `,${stunNames.join('/')} 眩暈 1 回合` : '';
    if(typeof log === 'function') log(`🐉 維蘇威火山龍王「龍吼震懾」!全體 -${dmg} HP${stunMsg}`);
    // ★ FIX 20260518(c) #3 — 用 _scheduleBossEnd 取代裸 setTimeout
    _scheduleBossEnd(boss, 1500);
  }

  // BOSS 爆發:天崩之炎(全體當前 HP 90%)
  function _wbAdvBossBurst(boss){
    const G = (typeof window._wbGetG === "function") ? window._wbGetG() : window.G;
    // ★ FIX 20260517 — 爆發技用技能音效(更大聲)
    try{ if(typeof playSfx === 'function') playSfx('sfx-wb-boss-skill', 0.9); }catch(_){}
    try{ if(typeof window._wbPlayBurstAnimation === 'function') window._wbPlayBurstAnimation(); }catch(_){}
    // ★ FIX 20260518(c) #3 — 外層動畫等待也存到 _wbBossTid,玩家爆發插隊時能取消整條鏈
    try{ if(boss._wbBossTid) clearTimeout(boss._wbBossTid); }catch(_){}
    boss._wbBossTid = setTimeout(() => {
      boss._wbBossTid = null;
      // 二次檢查:外層 timer 跑到時 boss 可能已被插隊處理
      if(boss._wbEndedThisTurn === true){
        try{ console.log('[WB-BossAct] BOSS 爆發外層 timer 觸發時已被插隊,跳過'); }catch(_){}
        return;
      }
      if(boss.curHp <= 0){
        try{ console.log('[WB-BossAct] BOSS 爆發外層 timer 觸發時 BOSS 已死,跳過'); }catch(_){}
        boss._wbEndedThisTurn = true;
        return;
      }
      const alive = G.p1.filter(h => h && h.curHp > 0);
      let logEntry = '⚡ 維蘇威火山龍王爆發「天崩之炎」!';
      alive.forEach(t => {
        if(t._wbInvincible){
          logEntry += ` ${t.name} 無敵擋下!`;
          t._wbInvincible = 0;
          return;
        }
        let dmgPct = 0.90;
        if(t._wbShield){
          dmgPct = 0.45;
          t._wbShield = 0;
          logEntry += ` ${t.name} 護盾減半...`;
        }
        const d = Math.floor(t.curHp * dmgPct);
        try{
          if(typeof doDmg === 'function'){
            doDmg(t, d, { actor: boss, isSkill: true, isAoe: true, ignoreBuffs: true, fixedDmg: true });
          }else{
            t.curHp = Math.max(0, t.curHp - d);
          }
        }catch(_){
          t.curHp = Math.max(0, t.curHp - d);
        }
        t._wbBurn = 3;
        try{ renderCard(t); }catch(_){}
      });
      if(typeof log === 'function') { log(logEntry); log('🔥 全體附加燃燒 3 回合'); }
      // ★ FIX 20260518(c) #3 — 內層 endAction 也走防雙重觸發
      _scheduleBossEnd(boss, 1800);
    }, 2200);
  }

  // BOSS 普攻:隨機選 1 個玩家英雄,atk × (1.0~1.3) 傷害
  function _wbAdvBossNormalAtk(boss){
    const G = (typeof window._wbGetG === "function") ? window._wbGetG() : window.G;
    // ★ FIX 20260517 — 普攻音效(龍的普攻)
    try{ if(typeof playSfx === 'function') playSfx('sfx-wb-boss-atk', 0.6); }catch(_){}
    const alive = G.p1.filter(h => h && h.curHp > 0);
    if(!alive.length){
      // ★ FIX 20260518(c) #3 — early return 也走防雙重觸發
      _safeBossEndAction(boss);
      return;
    }
    const tgt = alive[Math.floor(Math.random() * alive.length)];
    const d = Math.floor((boss.atk || 49) * (1 + Math.random() * 0.3));
    try{
      if(typeof doDmg === 'function'){
        doDmg(tgt, d, { actor: boss });
      }else{
        tgt.curHp = Math.max(0, tgt.curHp - d);
      }
    }catch(_){
      tgt.curHp = Math.max(0, tgt.curHp - d);
    }
    try{ renderCard(tgt); }catch(_){}
    if(typeof log === 'function') log(`🦷 維蘇威炎爪攻擊 ${tgt.name} -${d} HP`);
    // ★ FIX 20260518(c) #3 — 用 _scheduleBossEnd 取代裸 setTimeout
    _scheduleBossEnd(boss, 1200);
  }

  // ════════════════════════════════════════════════════════════════════
  // ★ v6 Phase 5 (2026-05-17) — 玩家行動同步
  // ────────────────────────────────────────────────────────────────────
  // 連線模式下,非房主玩家點按鈕後送 pendingAction 給房主,房主這邊要
  // 「代執行」該玩家的動作(透過主程式 execSkill / execAtk / 爆發)。
  //
  // 難點:主程式 execSkill 內部會用 setPending('enemy', t => ...) 等玩家選目標,
  //       但「代執行其他玩家」時,被代執行的人不在房主面前,沒辦法叫他選。
  //       世界 BOSS 戰只有 BOSS 一個敵人,所以只要敵方目標都自動鎖定 BOSS,
  //       友方目標自動選 HP 最低的隊友(主程式 _autoBattle 邏輯一樣)。
  //
  // 設計:
  //   1. patch window.setPending,在 _wbAutoTargetForOtherPlayer=true 時
  //      自動選目標(enemy→BOSS, ally→HP 最低隊友, self→自己)
  //   2. window._wbExecPlayerAction(actorPos, action) — 代執行入口
  //      - action.type:'atk' | 's1' | 's2' | 'burst' | 'rest' | 'skip'
  //      - 先把 G.activeChar 設為 actor,打開 _wbAutoTargetForOtherPlayer
  //      - 呼叫對應入口:execAtk / execSkill / execBurst / doRest
  //      - 跑完後關掉 flag(execSkill 內 setTimeout 走完才關)
  // ════════════════════════════════════════════════════════════════════
  window._wbAutoTargetForOtherPlayer = false;

  // ─ setPending patch:auto-target 模式下自動選 BOSS / 隊友 ─────────
  function _wbInstallSetPendingPatch(){
    if(typeof window.setPending !== 'function') return false;
    if(window._wbSetPendingPatched) return true;
    const _origSetPending = window.setPending;
    window.setPending = function(type, cb){
      if(window._wbAutoTargetForOtherPlayer){
        try{
          const G = (typeof window._wbGetG === 'function') ? window._wbGetG() : window.G;
          const a = G && G.activeChar;
          if(!a){ return _origSetPending.apply(this, arguments); }
          const opp = a.side === 'p1' ? 'p2' : 'p1';
          // ★ FIX 20260518(c) #4 — setPending type 白名單擴充 + default 兜底
          //   原問題:只匹配 7 種 type(enemy/any_e/ally/self_or_ally/ally_dead/ally_or_dead/any),
          //          其他 type 如 'dead_ally'/'foe_count'/'mimic_target'/'self'/'self_e' 等
          //          會走到 _origSetPending → 跳出目標選擇 modal,但代執行情境下被代執行
          //          的玩家根本看不到房主螢幕的 modal → 整場戰鬥永久卡住。
          //   修補:
          //     1. 補上常見 type 映射(dead_ally/self/foe_count/mimic_target)
          //     2. 加 default 分支:任何未匹配 type 都「降級為跳過」,確保不會卡 modal
          let autoT = null;
          let matched = true;
          if(type === 'enemy' || type === 'any_e' || type === 'foe' || type === 'foe_count'){
            const foes = (G[opp] || []).filter(h => h && h.curHp > 0);
            // 世界戰只有 BOSS,但保險還是用 sort
            autoT = foes.sort((x, y) => y.curHp - x.curHp)[0] || null;
          }else if(type === 'ally' || type === 'self_or_ally'){
            const al = (G[a.side] || []).filter(h => h && h.curHp > 0);
            autoT = al.sort((x, y) => x.curHp - y.curHp)[0] || null;
          }else if(type === 'ally_dead' || type === 'ally_or_dead' || type === 'dead_ally' || type === 'dead'){
            const dead = (G[a.side] || []).filter(h => h && h.curHp === 0);
            autoT = dead[0] || null;
            // 沒倒下隊友 → 退而選自己以外的活著隊友(讓技能不空轉)
            if(!autoT){
              const al = (G[a.side] || []).filter(h => h && h.curHp > 0 && h !== a);
              autoT = al.sort((x, y) => x.curHp - y.curHp)[0] || null;
            }
          }else if(type === 'self' || type === 'self_e'){
            // self:自己
            autoT = a;
          }else if(type === 'mimic_target' || type === 'mimic'){
            // 臨摹大師:自動選 HP 最高的活著友方(代表能力最完整的)
            const al = (G[a.side] || []).filter(h => h && h.curHp > 0 && h !== a);
            autoT = al.sort((x, y) => y.curHp - x.curHp)[0] || null;
          }else if(type === 'any'){
            const all = (G.p1 || []).concat(G.p2 || []).filter(h => h && h.curHp > 0);
            autoT = all.sort((x, y) => x.curHp - y.curHp)[0] || null;
          }else{
            // ★ 未匹配 type → 標記 matched=false,走 default 兜底
            matched = false;
            console.warn('[WB-Action v6] setPending 未匹配 type=' + type + ' → 走 default 跳過');
          }
          if(autoT && cb){
            // 延 50ms 模擬玩家點擊延遲(讓主程式內部 state 收歛)
            setTimeout(() => { try{ cb(autoT); }catch(eC){ console.error('[WB-Action v6] setPending cb 例外', eC); } }, 50);
            return;
          }
          // ★ FIX 20260518(c) #4 — default 兜底:不論是「matched 但找不到目標」還是
          //   「type 未匹配」,都走「actor.acted=true → startTurn」推進回合,避免卡在
          //   等不到玩家點目標的 modal。
          if(a && !a.acted){
            a.acted = true;
            try{ if(typeof updateUI === 'function') updateUI(); }catch(_){}
            // matched=false 時 log 提示,協助未來 debug
            if(!matched){
              console.warn('[WB-Action v6] setPending default 兜底觸發,actor=' + (a.name||'?')
                + ' acted=true → startTurn');
            }
            setTimeout(() => { try{ if(typeof window.startTurn === 'function') window.startTurn(); }catch(_){} }, 400);
          }
          return;
        }catch(eP){
          console.warn('[WB-Action v6] setPending auto-target 例外,fallback', eP);
        }
      }
      return _origSetPending.apply(this, arguments);
    };
    window._wbSetPendingPatched = true;
    console.log('[WB-Action v6] ✅ setPending patch 已安裝(auto-target 給代執行用)');
    return true;
  }

  // ─ 代執行玩家動作 ───────────────────────────────────────────────
  //   主要呼叫者:index.html 內房主收到 pendingAction 時
  //   actorPos: 0~3
  //   action: { type:'atk'|'s1'|'s2'|'burst'|'rest'|'skip' }
  window._wbExecPlayerAction = function(actorPos, action){
    const G = (typeof window._wbGetG === 'function') ? window._wbGetG() : window.G;
    if(!G || !G.p1){
      console.warn('[WB-Action v6] G 不存在或無 p1');
      return false;
    }
    const actor = G.p1[actorPos];
    if(!actor){
      console.warn('[WB-Action v6] actor 不存在 pos=' + actorPos);
      return false;
    }
    if(actor.curHp <= 0){
      console.warn('[WB-Action v6] actor 已倒下,跳過');
      // 推進到下一個 actor
      setTimeout(() => { try{ if(typeof window.startTurn === 'function') window.startTurn(); }catch(_){} }, 200);
      return false;
    }
    if(actor.acted){
      console.warn('[WB-Action v6] actor 已行動過,忽略重複行動');
      return false;
    }
    const type = action && action.type;
    if(!type){
      console.warn('[WB-Action v6] action.type 為空');
      return false;
    }

    // 設 G.activeChar 給主程式各路徑讀(execSkill 內部會讀)
    G.activeChar = actor;

    // 打開 auto-target 旗標
    window._wbAutoTargetForOtherPlayer = true;

    let ok = false;
    try{
      if(type === 'atk'){
        // 普攻:目標自動選 BOSS
        const opp = actor.side === 'p1' ? 'p2' : 'p1';
        const foes = (G[opp] || []).filter(h => h && h.curHp > 0);
        const tgt = foes.sort((x, y) => y.curHp - x.curHp)[0] || null;
        if(tgt){
          try{
            if(typeof window.execAtk === 'function'){
              window.execAtk(actor, tgt, actor.atk);
              // execAtk 不會自己呼叫 endAction,要手動接(對照主程式 selMove)
              if(typeof window.endAction === 'function'){
                window.endAction(actor, 0);
              }
              ok = true;
            }
          }catch(eA){ console.error('[WB-Action v6] execAtk 例外', eA); }
        }else{
          console.warn('[WB-Action v6] 找不到敵方目標');
          actor.acted = true;
          setTimeout(() => { try{ if(typeof window.startTurn === 'function') window.startTurn(); }catch(_){} }, 200);
        }
      }
      else if(type === 's1' || type === 's2'){
        const sk = (type === 's1') ? actor.s1 : actor.s2;
        if(!sk || sk.p){
          console.warn('[WB-Action v6] 技能不存在或是被動 type=' + type);
        }else{
          const cost = (typeof window.skillCost === 'function') ? window.skillCost(sk, actor, true) : (sk.c || 0);
          // 檢查能量
          if(G.energy && G.energy[actor.side] != null && G.energy[actor.side] < cost){
            console.warn('[WB-Action v6] ' + actor.name + ' 能量不足,改普攻');
            // 能量不足 → 自動降級為普攻
            const opp = actor.side === 'p1' ? 'p2' : 'p1';
            const foes = (G[opp] || []).filter(h => h && h.curHp > 0);
            const tgt = foes.sort((x, y) => y.curHp - x.curHp)[0] || null;
            if(tgt && typeof window.execAtk === 'function'){
              window.execAtk(actor, tgt, actor.atk);
              if(typeof window.endAction === 'function') window.endAction(actor, 0);
              ok = true;
            }
          }else{
            try{
              if(typeof window.execSkill === 'function'){
                window.execSkill(actor, sk, cost, type);
                // 注意:execSkill 內部用 setPending 等目標 → patch 會自動選
                //       setPending cb 內會呼叫 endAction,不用手動呼叫
                ok = true;
              }
            }catch(eS){ console.error('[WB-Action v6] execSkill 例外', eS); }
          }
        }
      }
      else if(type === 'burst'){
        // 爆發
        try{
          if(typeof window._canBurst === 'function' && typeof window.execBurst === 'function'){
            if(window._canBurst(actor)){
              window.execBurst(actor.side, actor.pos);
              ok = true;
            }else{
              console.warn('[WB-Action v6] ' + actor.name + ' 爆發未滿,改普攻');
              // 爆發沒滿 → 改普攻
              const opp = actor.side === 'p1' ? 'p2' : 'p1';
              const foes = (G[opp] || []).filter(h => h && h.curHp > 0);
              const tgt = foes.sort((x, y) => y.curHp - x.curHp)[0] || null;
              if(tgt && typeof window.execAtk === 'function'){
                window.execAtk(actor, tgt, actor.atk);
                if(typeof window.endAction === 'function') window.endAction(actor, 0);
                ok = true;
              }
            }
          }
        }catch(eB){ console.error('[WB-Action v6] execBurst 例外', eB); }
      }
      else if(type === 'rest'){
        try{
          if(typeof window.doRest === 'function'){
            window.doRest();
            ok = true;
          }
        }catch(eR){ console.error('[WB-Action v6] doRest 例外', eR); }
      }
      else if(type === 'skip'){
        // 跳過 = 設 acted + 推到下一個
        actor.acted = true;
        // 答錯懲罰才會送 skip,burst+3 之類由送 action 的客戶端先處理
        try{ if(typeof window.endAction === 'function') window.endAction(actor, 0); }catch(_){}
        ok = true;
      }
      else{
        console.warn('[WB-Action v6] 未知 action.type=' + type);
      }
    }finally{
      // setTimeout 延後關 flag,讓 setPending 內部 setTimeout cb 有機會跑(50ms)
      setTimeout(() => { window._wbAutoTargetForOtherPlayer = false; }, 200);
    }

    return ok;
  };

  // ════════════════════════════════════════════════════════════════════
  // ★ v6 Phase 5.2 (2026-05-17) — 非房主端攔截 selMove/doRest/execBurst
  // ────────────────────────────────────────────────────────────────────
  // 非房主玩家在主程式 #gc 戰場上點按鈕(b-atk / b-s1 / b-s2 / 爆發 / 休息)
  // → 主程式走 confirmAction → selMove(s1/s2/atk) / doRest / execBurst
  //
  // 我們在 client mode 下攔截這三個入口,改為:
  //   1. 本機跑 _wbExecPlayerAction(actor.pos, {type})  ← 樂觀更新,本機立即播動畫
  //   2. 同時送 _wbNet.sendAction({type}) → Firestore → 房主收到走 5.1 路徑
  //   3. 設 window._wbClientAnimEndTs = Date.now() + 1500,給 5.3 動畫競態緩衝用
  //
  // ⚠ 樂觀更新本機跑 execSkill 會改 G.curHp / G.energy 等,房主算完廣播
  //   _applyWireToG 過來時會覆蓋本機。中間可能有畫面跳動 → 5.3 解決
  // ════════════════════════════════════════════════════════════════════
  function _wbClientSendOptimisticAndSync(type){
    const G = (typeof window._wbGetG === 'function') ? window._wbGetG() : window.G;
    const a = G && G.activeChar;
    if(!a || a.acted){
      console.warn('[WB-Client v6] 樂觀:actor 不存在或已行動,跳過');
      return false;
    }
    // 設動畫結束時間戳(供 5.3 用,sync 進來時若還沒到此時間就延後 apply)
    window._wbClientAnimEndTs = Date.now() + 1500;
    window._wbClientOptimistic = true;
    // 本機代執行(走跟房主一樣的 _wbExecPlayerAction 路徑)
    try{
      if(typeof window._wbExecPlayerAction === 'function'){
        window._wbExecPlayerAction(a.pos, { type: type });
      }
    }catch(eOp){ console.warn('[WB-Client v6] 樂觀更新失敗', eOp); }
    // 同時送 Firestore 給房主
    try{
      if(window._wbNet && typeof window._wbNet.sendAction === 'function'){
        // 注意:sendAction 在 isHost 端會直接走本地引擎,非房主端會走 pendingAction
        window._wbNet.sendAction({ type: type });
      }
    }catch(eSd){ console.warn('[WB-Client v6] sendAction 失敗', eSd); }
    window._wbClientOptimistic = false;
    return true;
  }

  function _wbInstallSelMovePatch(){
    if(typeof window.selMove !== 'function') return false;
    if(window._wbSelMovePatched) return true;
    const _origSelMove = window.selMove;
    window.selMove = function(type){
      if(window._wbClientMode){
        // type ∈ {'atk','s1','s2'}
        if(_wbClientSendOptimisticAndSync(type)) return;
      }
      return _origSelMove.apply(this, arguments);
    };
    window._wbSelMovePatched = true;
    console.log('[WB-Client v6] ✅ selMove patch 已安裝');
    return true;
  }

  function _wbInstallDoRestPatch(){
    if(typeof window.doRest !== 'function') return false;
    if(window._wbDoRestPatched) return true;
    const _origDoRest = window.doRest;
    window.doRest = function(){
      // ★ v3.5.0 — Reentry guard:同 execBurst,_wbExecPlayerAction line 2321
      //   會 window.doRest() 內部代執行,若不擋會無限遞迴。
      //   _wbClientOptimistic=true 表示正在樂觀更新中,直接走原版 doRest。
      if(window._wbClientMode && !window._wbClientOptimistic){
        if(_wbClientSendOptimisticAndSync('rest')) return;
      } else if(window._wbClientMode && window._wbClientOptimistic){
        // ★ v3.5.0 — 樂觀更新中由 _wbExecPlayerAction 內部呼叫進來,直通原版執行
        console.log('[WB-Client v6] doRest 樂觀更新中,patch 直通原版');
      }
      return _origDoRest.apply(this, arguments);
    };
    window._wbDoRestPatched = true;
    console.log('[WB-Client v6] ✅ doRest patch 已安裝');
    return true;
  }

  // ════════════════════════════════════════════════════════════════════
  // ★ FIX 20260518(d) — 世界 BOSS 戰題庫預備:包裝 _wbSetupAdvForBattle
  // ────────────────────────────────────────────────────────────────────
  // 問題:
  //   主程式 advPickQuestion() 走通用分支會讀 _advSessionQuestions(本局題庫),
  //   而世界 BOSS 戰流程 (_wbSetupAdvForBattle 設 stage='worldboss' →
  //   advStartBattle()) 從不呼叫 advPrepareSessionQuestions(),所以該陣列永遠空。
  //   玩家行動前 [WB-PlayerQuiz] hook 觸發 advShowQuiz → advPickQuestion 後,
  //   pool 一定空 → 進入「整輪 N 題庫已全部出過」分支 → 回 {__needRepick:true}
  //   → advShowQuiz 用 setTimeout 150ms 重呼自己 → 無限迴圈,
  //   console 每 150ms 噴一行 + 畫面卡在「答對題目才能行動」永遠不會推進。
  //
  // 修補:
  //   包裝 window._wbSetupAdvForBattle,在原函式成功(回傳 true)後,
  //   立刻呼叫主程式 advPrepareSessionQuestions()。
  //   - 主程式 _advSessionQuestions 是 lexical scope 的 let 變數,
  //     外部 IIFE 無法直接賦值(window._advSessionQuestions 影響不到 lexical 變數),
  //     唯一方法是呼叫主程式自己的 advPrepareSessionQuestions(),
  //     它會在 lexical scope 內把 _advSessionQuestions 設好。
  //   - advPrepareSessionQuestions 內部呼叫 advGetQuizPool(grade,subject,difficulty),
  //     世界 BOSS 戰沒設過這三者(都是 ''),會走到 advGetQuizPool 尾端
  //     「沒選科目或選綜合 → 全題庫」分支,回傳完整 ADV_QUIZ_DB shuffle 後的池。
  //   - 同時主程式 advPrepareSessionQuestions 內 fallback:
  //         let finalPool = pool.length ? pool : ADV_QUIZ_DB.slice();
  //     雙保險,保證 _advSessionQuestions 不會空。
  // ════════════════════════════════════════════════════════════════════
  function _wbInstallWbAdvQuizPoolPatch(){
    if(typeof window._wbSetupAdvForBattle !== 'function') return false;
    if(window._wbSetupAdvForBattlePatched) return true;
    const _origSetup = window._wbSetupAdvForBattle;
    window._wbSetupAdvForBattle = function(opts){
      const _ok = _origSetup.apply(this, arguments);
      try{
        const _stage = (opts && opts.stage) || 'worldboss';
        if(_ok && _stage === 'worldboss'){
          // 呼叫主程式自己的 advPrepareSessionQuestions(),讓它在 lexical scope 內
          // 把 _advSessionQuestions 設成完整題庫(advGetQuizPool 會回 ADV_QUIZ_DB shuffle)
          if(typeof window.advPrepareSessionQuestions === 'function'){
            try{
              window.advPrepareSessionQuestions();
              console.log('[WB-AdvQuiz] ✅ 世界 BOSS 戰題庫已透過 advPrepareSessionQuestions 預備');
            }catch(ePrep){
              console.warn('[WB-AdvQuiz] advPrepareSessionQuestions 呼叫失敗,玩家行動前出題可能卡死', ePrep);
            }
          }else{
            console.warn('[WB-AdvQuiz] advPrepareSessionQuestions 不存在,題庫無法預備');
          }
          // 清掉「玩家行動前答題」的回合追蹤,避免上一場世界 BOSS 戰殘留
          try{ window._wbPlayerQuizDone = {}; }catch(_){}
        }
      }catch(eAll){
        console.warn('[WB-AdvQuiz] 題庫預備例外(忽略)', eAll);
      }
      return _ok;
    };
    window._wbSetupAdvForBattlePatched = true;
    console.log('[WB-AdvQuiz] ✅ _wbSetupAdvForBattle patch 已安裝');
    return true;
  }

  function _wbInstallExecBurstPatch(){
    if(typeof window.execBurst !== 'function') return false;
    if(window._wbExecBurstPatched) return true;
    const _origExecBurst = window.execBurst;
    window.execBurst = function(side, pos, _safeName){
      // ★ v3.5.0 — Reentry guard:_wbClientSendOptimisticAndSync 內部會呼叫
      //   _wbExecPlayerAction,而 _wbExecPlayerAction line 2301 又會呼叫 window.execBurst
      //   (此時 window.execBurst 已被 patch 蓋掉)→ 無限遞迴 → InternalError: too much recursion
      //   修法:_wbClientOptimistic=true 表示正在樂觀更新中,直接走原版 execBurst
      //   避免再次進入 _wbClientSendOptimisticAndSync 路徑。
      if(window._wbClientMode && !window._wbClientOptimistic){
        // 只攔截 p1(玩家)爆發 — p2 BOSS 爆發走 BOSS AI,本機不會跑(client mode 已擋)
        if(side === 'p1'){
          // 確認是「我自己」的爆發(非房主只能控制自己的英雄)
          const mySlot = (window._wbNet && typeof window._wbNet.getMySlot === 'function')
            ? window._wbNet.getMySlot() : -1;
          if(mySlot >= 0 && pos === mySlot){
            if(_wbClientSendOptimisticAndSync('burst')) return;
          }else{
            // 不是自己的爆發按鈕(理論上 UI 不該讓 client 端能按),靜默忽略
            console.warn('[WB-Client v6] 嘗試替別人按爆發(pos=' + pos + ' mySlot=' + mySlot + '),忽略');
            return;
          }
        }
      } else if(window._wbClientMode && window._wbClientOptimistic){
        // ★ v3.5.0 — 樂觀更新中由 _wbExecPlayerAction 內部呼叫進來,直通原版執行
        console.log('[WB-Client v6] execBurst 樂觀更新中,patch 直通原版(side=' + side + ' pos=' + pos + ')');
      }
      return _origExecBurst.apply(this, arguments);
    };
    window._wbExecBurstPatched = true;
    console.log('[WB-Client v6] ✅ execBurst patch 已安裝');
    return true;
  }

  // ── D. checkWin 攔截:worldboss stage 時走自製結算 ──────────────────
  // ─────────────────────────────────────────────────────────────────
  function _wbInstallCheckWinHook(){
    if(typeof window.checkWin !== 'function') return false;
    if(window._wbCheckWinPatched) return true;
    const _origCheckWin = window.checkWin;
    window.checkWin = function(){
      // ★ v6 Phase 4 — client mode:本機不判勝敗,等房主廣播 ended sync
      //   例外:_wbClientForceCheckWin=true 時(收到 ended sync 後)放行
      if(window._wbClientMode && !window._wbClientForceCheckWin){
        return false;
      }
      try{
        const _G = (typeof window._wbGetG === 'function') ? window._wbGetG() : null;
        if(typeof window._wbGetAdvStage === 'function' && window._wbGetAdvStage() === 'worldboss'
           && _G && _G.p1 && _G.p2){
          // BOSS 死了 → 玩家勝
          const boss = _G.p2.find(h => h && window._wbIsBossName(h.name));
          if(boss && boss.curHp <= 0){
            if(!window._wbAdvBattleEnded){
              window._wbAdvBattleEnded = true;
              // ★ FIX 20260517 — BOSS 倒下音效(立即播,不等結算頁出來)
              try{ if(typeof playSfx === 'function') playSfx('sfx-wb-boss-down', 0.9); }catch(_){}
              setTimeout(() => { try{ _wbShowAdvBattleResult(true); }catch(e){ console.error(e); } }, 200);
            }
            return true;
          }
          // 玩家全滅 → 玩家敗
          if(_G.p1.every(h => !h || h.curHp <= 0)){
            if(!window._wbAdvBattleEnded){
              window._wbAdvBattleEnded = true;
              setTimeout(() => { try{ _wbShowAdvBattleResult(false); }catch(e){ console.error(e); } }, 200);
            }
            return true;
          }
          return false;
        }
      }catch(e){ console.warn('[WB-Adv checkWin hook] 例外,fallback 原 checkWin', e); }
      return _origCheckWin.apply(this, arguments);
    };
    window._wbCheckWinPatched = true;
    console.log('[WB-Adv] ✅ checkWin hook 已安裝');
    return true;
  }

  // 世界戰結算頁(簡化版,沿用 world-boss-ui.html 的 _wbShowSoloPracticeResult 邏輯)
  function _wbShowAdvBattleResult(win){
    // 把世界戰戰績寫進 _wbSoloContrib(_wbSaveSoloBest 會讀)
    const myUid = window._gUserId || 'solo_user';
    const myDmg = (window._wbSoloContrib && window._wbSoloContrib[myUid] && window._wbSoloContrib[myUid].dmgDealt) || 0;
    // 4 隻英雄名
    const _Gr = (typeof window._wbGetG === 'function') ? window._wbGetG() : null;
    const heroes = (_Gr && _Gr.p1) ? _Gr.p1.map(h => h ? h.name : '?') : [];
    const elapsed = Date.now() - (window._wbSoloStartTs || Date.now());
    let isNewRecord = false;
    try{
      if(typeof window._wbSaveSoloBest === 'function'){
        isNewRecord = window._wbSaveSoloBest(myDmg, heroes, elapsed, win);
      }
    }catch(_){}

    // ★ FIX 20260518 — 全球 BOSS 殘血同步:本場全隊對 BOSS 造成的總傷害扣到雲端
    //   來源:_Gr.p2[0].hp - _Gr.p2[0].curHp 就是本場 BOSS 實際被打掉的血量
    //         (若 win=true,curHp<=0,等於把剩下的血全打光)
    //   接 _wbHpSync.dealDamage 扣雲端 stats/global.worldBossHp.<bossId>
    //   若擊敗(killed=true) → 順帶觸發休戰(寫 worldBossControl/main.ceasefire=true)
    try{
      const _wbBoss = (_Gr && _Gr.p2 && _Gr.p2[0]) || null;
      if(_wbBoss && typeof _wbBoss.hp === 'number' && typeof _wbBoss.curHp === 'number'
         && window._wbHpSync && typeof window._wbHpSync.dealDamage === 'function'){
        // 對應的 bossId 從 WORLD_BOSS_LINEUP 反查(用名稱比對),保險起見 fallback 'vesuvius_fire_dragon'
        let bossId = 'vesuvius_fire_dragon';
        try{
          const _lineup = window.WORLD_BOSS_LINEUP || [];
          const _m = _lineup.find(b => b && b.name === _wbBoss.name);
          if(_m && _m.id) bossId = _m.id;
        }catch(_){}
        // 本場實際造成的傷害量 = BOSS 起始 HP(_wbBoss.hp) − 戰後剩餘 HP(_wbBoss.curHp)
        // 注意:_wbBoss.hp 在戰鬥開始時已設為「雲端殘血」(下一步會做),
        //       所以扣血量就是「真實本場貢獻」,不會把同一段血扣兩次
        const _dealt = Math.max(0, Math.floor(_wbBoss.hp - _wbBoss.curHp));
        if(_dealt > 0){
          window._wbHpSync.dealDamage(bossId, _dealt, _wbBoss.hp).then(res => {
            if(res && res.killed){
              console.log('[WB-HpSync] BOSS', bossId, '被擊敗 → 嘗試觸發休戰');
              // 嘗試自動切休戰(需要管理員權限,失敗則只留 HP=0 等管理員手動切)
              try{
                if(window._wbControl && typeof window._wbControl.set === 'function'
                   && typeof window._isAdminUser === 'function' && window._isAdminUser()){
                  window._wbControl.set({
                    ceasefire: true,
                    nextOpenTime: '',
                    message: '🏆 BOSS 已被全伺服器擊敗!感謝參戰勇者,下次開戰時間即將公告。',
                  }).catch(e => console.warn('[WB] 自動休戰失敗', e));
                }
              }catch(_){}
            }
          }).catch(e => console.warn('[WB-HpSync] dealDamage 失敗', e));

          // ★ FIX 20260519(v12) — 排行榜更新:把本場傷害累積到隊伍紀錄
          //   隊伍識別:4 個玩家 uid 排序後 join('|') 當 teamKey,
          //             單人練習模式只有 1 個真實玩家,其他 3 個是 host_npc_X,
          //             這時用「同樣 uid 重複 4 次」當隊伍(會顯示「玩家暱稱×4」)
          //   teamNames:用每個槽位的玩家暱稱(同 uid 顯示同名,符合用戶需求「同一人開 4 隻顯示 4 次相同暱稱」)
          // ★ FIX 20260519(v13) — 帶上 tiebreaker 資料(回合數、正確答題數、最後存活人數)
          //   用途:若多隊伍同時擊破 BOSS(尾刀平手),依「回合數→正確數→存活人數」決定真實排名
          try{
            if(typeof window._wbHpSync.updateLeaderboard === 'function'){
              const _myNick = (window._playerNickname || window._userName || '玩家');
              let _teamUids = [];
              let _teamNames = [];
              try{
                // 從 _wbNet 拿房間玩家清單(連線模式有 4 個真實玩家;單人模式只有 1 個 + 3 個 NPC)
                const _snap = (window._wbNet && window._wbNet.getSnapshot) ? window._wbNet.getSnapshot() : null;
                const _players = (_snap && Array.isArray(_snap.players)) ? _snap.players : [];
                for(let _i = 0; _i < 4; _i++){
                  const _p = _players[_i];
                  if(_p && _p.uid){
                    _teamUids.push(_p.uid);
                    _teamNames.push(_p.name || _myNick);
                  }else{
                    // 空槽 / 房主代打 → 用房主身份補位(用戶要求:單人開 4 隻顯示 4 次相同暱稱)
                    _teamUids.push(myUid);
                    _teamNames.push(_myNick);
                  }
                }
              }catch(_){
                // fallback:全部當房主自己
                _teamUids = [myUid, myUid, myUid, myUid];
                _teamNames = [_myNick, _myNick, _myNick, _myNick];
              }
              const _teamKey = (typeof window._wbCalcTeamId === 'function')
                ? window._wbCalcTeamId(_teamUids)
                : _teamUids.slice().sort().join('|');
              // ★ FIX 20260519(v13) — 算 tiebreaker 資料
              const _tieBreaker = {
                turns: (_Gr && _Gr.turn) || 0,
                aliveCount: (_Gr && _Gr.p1) ? _Gr.p1.filter(h => h && h.curHp > 0).length : 0,
                quizCorrect: 0,
              };
              try{
                // 算本場玩家答對問題數(從 window._wbQuizState 累計)
                const _qs = window._wbQuizState || {};
                Object.keys(_qs).forEach(_k => {
                  const _v = _qs[_k];
                  if(_v && _v.correct) _tieBreaker.quizCorrect += _v.correct;
                });
              }catch(_){}
              if(_teamKey){
                window._wbHpSync.updateLeaderboard(bossId, _teamKey, _teamNames, _dealt, _tieBreaker)
                  .then(res => {
                    if(res) console.log('[WB-Leaderboard] 隊伍排名更新: rank=' + res.rank + ', totalDmg=' + res.totalDmg);
                  })
                  .catch(e => console.warn('[WB-Leaderboard] updateLeaderboard 失敗', e));
              }
            }
          }catch(eLb){ console.warn('[WB-Leaderboard] 排行榜更新例外', eLb); }
        }
      }
    }catch(eHp){
      console.warn('[WB-HpSync] 結算扣血失敗', eHp);
    }

    // 結束戰鬥:離開冒險模式 + 隱藏戰鬥畫面
    try{
      // 清掉冒險戰鬥背景
      const _gc = document.getElementById('gc');
      if(_gc) _gc.classList.remove('adv-battle');
      const _bb = document.getElementById('adv-battle-bg');
      if(_bb){ _bb.className = ''; _bb.style.backgroundImage = ''; }
    }catch(_){}
    try{
      // 清掉教學按鈕等 BOSS 戰專屬 UI
      ['adv-tut-btn','adv-bug-report-battle-btn'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.style.display = 'none';
      });
    }catch(_){}

    // 呼叫 UI 層的「練習模式結算」(已存在於 world-boss-ui.html)
    // ★ FIX 20260517 — 從主程式 G.battleStats 整理 4 項表現評比(我方 p1 全隊各自 + 你的)
    //                  最高輸出 = dmg (傷害總量)
    //                  最佳治療 = heal (治療總量)
    //                  最高減傷 = dmgTaken (承受傷害總量,越多代表幫隊友扛得越多 / 撐越久)
    //                  最佳控場 = statusCount (對對手施加不利狀態次數)
    let evalStats = null;
    try{
      if(_Gr && _Gr.battleStats){
        const p1Names = heroes;  // 玩家陣容(4 名)
        const sumOfField = (field) => {
          let total = 0;
          p1Names.forEach(n => {
            const s = _Gr.battleStats[n];
            if(s && typeof s[field] === 'number') total += s[field];
          });
          return total;
        };
        evalStats = {
          totalDmg: sumOfField('dmg'),
          totalHeal: sumOfField('heal'),
          totalDmgTaken: sumOfField('dmgTaken'),
          totalCtrl: sumOfField('statusCount'),
          // 每位英雄個別數據,結算頁可選擇性顯示
          perHero: p1Names.map(n => {
            const s = _Gr.battleStats[n] || {};
            return {
              name: n,
              dmg: s.dmg || 0,
              heal: s.heal || 0,
              dmgTaken: s.dmgTaken || 0,
              statusCount: s.statusCount || 0,
            };
          }),
        };
      }
    }catch(e){
      console.warn('[WB-Result] 評比統計計算失敗', e);
    }

    if(typeof window._wbShowSoloPracticeResult === 'function'){
      window._wbShowSoloPracticeResult({
        dmg: myDmg,
        heroes: heroes,
        elapsed: elapsed,
        killed: win,
        isNewRecord: isNewRecord,
        evalStats: evalStats,    // ★ 新增評比數據
      });
    }else{
      // fallback alert
      _wbGameAlert(win ? '🏆 維蘇威火山龍王已被擊敗!' : '💀 全員陣亡...');
    }

    // 清理 worldboss 全域狀態:走主程式對外清理函式(才能正確清掉 let _adventureStage)
    try{
      if(typeof window._wbCleanupAdvAfterBattle === 'function'){
        window._wbCleanupAdvAfterBattle();
      }
    }catch(_){}
    window._wbInWorldBossMode = false;
    window._wbSoloPracticeMode = false;
    window._wbAdvBattleEnded = false;
    // ★ FIX 20260519(v4) — 戰鬥結算後強制清掉「定型文選單」(表情列)
    //   原 v3 只在 _wbShowSoloPracticeResult / _wbBackToStageSelect 內 remove .show class,
    //   但若用戶從別的路徑離開戰鬥(網路斷線、頁面切回等)會殘留 → 下次回到入口看到漂浮表情列
    //   修法:在最終結算函式內強制 inline style display:none + 移 class,雙保險。
    try{
      const _eb = document.getElementById('wb-emoji-bar-real');
      if(_eb){
        _eb.classList.remove('wb-eb-show');
        _eb.style.display = 'none';
      }
    }catch(_){}
    // ★ FIX 20260519(v4) — 連線房主戰鬥結算後自動 leaveRoom 清掉 firestore 房間
    //   原 bug:結算頁的「返回關卡選擇」按鈕 _wbBackToStageSelect 沒呼叫 _wbNet.leaveRoom(),
    //          房主退出後 firestore 房間還掛著 → 別的玩家在大廳還能看到該房間,
    //          隔天甚至前一晚開的房間都還在,變成幽靈房。
    //   修法:在結算時若是連線房主(_wbConnectedHostMode=true) → 自動 leaveRoom 關房。
    //         非房主端不主動關房(房主關了之後 firestore room 會整個消失,client 自然清掉)。
    //         單人模式 _wbNet 是 mock,leaveRoom 是 no-op 不會有副作用。
    try{
      const _wasHost = !!window._wbConnectedHostMode;
      if(_wasHost && window._wbNet && typeof window._wbNet.leaveRoom === 'function'){
        console.log('[WB] 戰鬥結算,連線房主自動 leaveRoom 清掉房間');
        window._wbNet.leaveRoom().catch(e => console.warn('[WB] 結算後 leaveRoom 失敗', e));
      }
    }catch(_eLv){ console.warn('[WB] 結算後 leaveRoom 例外', _eLv); }
    // ★ v6 Phase 4 — 清理連線模式 / client mode 旗標
    window._wbConnectedHostMode = false;
    window._wbConnectedClientMode = false;
    window._wbClientMode = false;
    window._wbClientForceCheckWin = false;
    window._wbClientFirstBattleUpdate = true;  // 重設供下一場
    window._wbClientLastVersion = 0;
    // ★ v6 Phase 5.3 — 清理動畫競態緩衝
    window._wbClientAnimEndTs = 0;
    window._wbClientOptimistic = false;
    if(window._wbClientPendingApplyTimer){
      try{ clearTimeout(window._wbClientPendingApplyTimer); }catch(_){}
      window._wbClientPendingApplyTimer = null;
    }
    // ★ v6 Phase 5 — 清理 auto-target 旗標
    window._wbAutoTargetForOtherPlayer = false;
  }
  window._wbShowAdvBattleResult = _wbShowAdvBattleResult;

  // ── E. 安裝所有 hooks(等主程式 ready) ──────────────────────────────
  function _wbInstallAllAdvHooks(){
    let tries = 0;
    function tryInstall(){
      tries++;
      let allOk = true;
      try{ if(!_wbInstallAdvStage())     allOk = false; }catch(e){ console.warn('[WB-Adv] stage', e); allOk = false; }
      try{ if(!_wbInstallAiActHook())    allOk = false; }catch(e){ console.warn('[WB-Adv] aiAct', e); allOk = false; }
      try{ if(!_wbInstallCheckWinHook()) allOk = false; }catch(e){ console.warn('[WB-Adv] checkWin', e); allOk = false; }
      // ★ v6 Phase 3 — sync hooks(連線房主端 G 同步)
      try{ if(!_wbInstallEndActionSyncHook()) allOk = false; }catch(e){ console.warn('[WB-Sync v6] endAction', e); allOk = false; }
      try{ if(!_wbInstallStartTurnSyncHook()) allOk = false; }catch(e){ console.warn('[WB-Sync v6] startTurn', e); allOk = false; }
      // ★ FIX 20260517(bb) — updateUI 守門(避免房主誤操作隊友角色)
      try{ if(!_wbInstallUpdateUIGuard())     allOk = false; }catch(e){ console.warn('[WB-UIGuard v6] updateUI', e); allOk = false; }
      // ★ v6 Phase 5 — setPending patch(代執行其他玩家行動時用)
      try{ if(!_wbInstallSetPendingPatch()) allOk = false; }catch(e){ console.warn('[WB-Action v6] setPending', e); allOk = false; }
      // ★ v6 Phase 5.2 — client mode 攔截:玩家點按鈕改走樂觀更新 + sendAction
      try{ if(!_wbInstallSelMovePatch())   allOk = false; }catch(e){ console.warn('[WB-Client v6] selMove', e); allOk = false; }
      try{ if(!_wbInstallDoRestPatch())    allOk = false; }catch(e){ console.warn('[WB-Client v6] doRest', e); allOk = false; }
      try{ if(!_wbInstallExecBurstPatch()) allOk = false; }catch(e){ console.warn('[WB-Client v6] execBurst', e); allOk = false; }
      // ★ FIX 20260518(d) — 世界 BOSS 戰題庫預備:包裝 _wbSetupAdvForBattle,
      //   在 stage='worldboss' 設好之後立刻幫主程式準備 _advSessionQuestions,
      //   否則玩家行動前 hook 觸發 advShowQuiz → advPickQuestion 找不到題,
      //   走 __needRepick 自我重呼 → 每 150ms 一次 → console 狂噴「整輪 N 題庫已全部出過」
      //   且畫面卡死(action-panel 被鎖、actor-info 永遠停在「答對題目才能行動」)。
      try{ if(!_wbInstallWbAdvQuizPoolPatch()) allOk = false; }catch(e){ console.warn('[WB-Adv] wbAdvQuizPool', e); allOk = false; }
      if(!allOk && tries < 40){
        setTimeout(tryInstall, 500);
      }else if(allOk){
        console.log('[WB-Adv] ✅ v4.0 + v6 主程式整合 hooks 全部完成');
      }else{
        console.warn('[WB-Adv] ⚠ hooks 安裝未完全成功,放棄重試');
      }
    }
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', () => setTimeout(tryInstall, 200));
    }else{
      setTimeout(tryInstall, 200);
    }
  }
  _wbInstallAllAdvHooks();

  _wbBootstrap();
})();