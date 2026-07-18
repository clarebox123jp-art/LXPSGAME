/* ════════════════════════════════════════════════════════════════════
 * world-boss.js — 世界 BOSS 討伐戰獨立模組
 * ★ v4.22.0(2026-07-06)— 風暴雷龍王(taifeng_wind_dragon)修正:①補 _WB_BOSS_ROAR_LINES/_ROAR_COLOR 專屬開場咆哮+雷金配色
 *   (原缺→開場對白 fallback 火龍王)②新增 _wbWindBossS1/S2/Burst 專屬 AI + _wbWindClearBossDebuffs(雷霆貫穿/暴風肅清/
 *   雷神·萬雷殛世;麻痺用 status 'para'、element 'wind')③三 dispatcher 加風暴雷龍王分支(原無→落預設火龍王招式)。需 index.html 同版 v4.22.0
 * ★ v4.8.0(2026-07-04)— 龍王總 HP 全面調整 5,000,000 → 10,000,000(老師指示:1~2 名高手單日可各打近百萬,
 *   500 萬已失去「全服共同挑戰」意義)。範圍:WORLD_BOSS_LINEUP 八龍 maxHp、HERO_DB 掛載八條 hp、
 *   兩處 fallback(開放新一輪重置/入口 HP 條)、console 記錄。護盾為回合制(3/5/7/9)非 HP% → 不受影響;
 *   單次扣血上限 5,000 / 單場 100,000 為固定值 → 不受影響;雲端 worldBossHp 存「剩餘絕對值」→ 當前龍王血量不變。
 * ★ v3.15.34(2026-06-18)— 翠綠森龍王天賦「翠之意志」fd 與 v3.13.73 註解的棲息地「太魯閣」更正為「亞馬遜雨林」(與 WORLD_BOSS_LINEUP scene、背景故事一致)
 * ★ v3.15.17(2026-06-15)— 第三隻龍王「山岳地龍王(土)」完整實裝:HERO_DB/BURST_DB/HERO_TRAIT/LORE/BIO/IMGS/AVTR/ELEMENT 掛載 + 專屬 AI(山崩落石/震天龍吼/天動地裂)+ 咆哮 + BGM/至寶/掉落/特效映射 + cap 強力減傷-40%/中毒繞cap弱點
 * ★ v3.14.24(2026-06-13)— 當前龍王排名至寶 helper(_wbGetCurrentDragonTreasureName)+ 每隻龍王專屬開戰咆哮(_WB_BOSS_ROAR_LINES,草龍王綠色系)
 * ★ v3.14.23(2026-06-13)— 草龍王戰鬥 BGM 對照表/helper(_wbGetCurrentBossBattleBgmId)+ 護盾啟動提示改依當前龍王動態產生(原寫死維蘇威盾組)
 * ★ v3.14.20(2026-06-13)— 當前龍王切換系統:_WB_BOSS_ROTATION + _wbGetCurrentBossId/_wbGetCurrentBoss/_wbGetNextBossId;
 *   4 處寫死 vesuvius 改動態(開戰重置/入口 HP 條/單人最佳/傷害同步 fallback)
 * ────────────────────────────────────────────────────────────────────
 * 為了讓主程式 index.html 不繼續增肥,世界 BOSS 系統除「Firebase 連線層
 * _wbNet」必須留在主程式 module 內以外,其餘全部移到本檔。
 *
 * 載入方式:在主程式 <body> 結尾 (最後一個 </script> 後) 加上
 *   <script src="world-boss.js" defer></script>
 *
 * 載入後本檔會「自動」做以下事情:
 *   1. 把元素龍清單、掉落、隊伍排名獎勵掛到 window 上
 *   2. 把火山炎龍王的 HERO_DB / BURST_DB / HERO_TRAIT / HERO_LORE
 *      用 Object.assign 合併到主程式既有的全域物件
 *   3. 把火山炎龍王立繪 URL 補進 HERO_IMGS
 *   4. 把 16 枚世界 BOSS 獎章 + 13 個統計欄位安全地合併到 ALL_MEDALS /
 *      _medalStats (用「補齊」模式,不會覆蓋既有資料)
 *   5. 攔截 execSkill 處理火山炎龍王 3 招(透過 window._wbHookExecSkill)
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
    // ★ FIX 20260530 — 8 隻龍王 HP 全部統一設為 500 萬(v3.12.5 強化版基準)
    // ★ v4.8.0 — 8 隻龍王 HP 全部統一調升為 1,000 萬(恢復全服共同挑戰意義)
    { id:'vesuvius_fire_dragon',     name:'火山炎龍王',    element:'fire',  maxHp:10000000,  scene:'維蘇威火山口',
      shieldElements:['fire','wind','earth','dark'],
      desc:'沉睡於義大利那不勒斯灣維蘇威火山口的古老火龍「炎之翼」,西元 79 年龐貝大爆發即是牠的甦醒' },
    { id:'shenhai_water_dragon',   name:'深淵海龍王',    element:'water', maxHp:10000000,  scene:'太平洋深淵',
      shieldElements:['water','wind','light','grass'],
      desc:'蛰伏於馬里亞納海溝的冰龍,以絕對零度凍結整片海洋' },
    { id:'taifeng_wind_dragon',    name:'風暴雷龍王',    element:'wind',  maxHp:10000000,  scene:'颱風眼',
      shieldElements:['wind','light','fire'],          // ★ v3.15.50 — 風盾×2/光盾/火盾,破盾:地(風)/暗(光)/水(火)
      shieldLayers:{wind:2, light:1, fire:1},          // ★ v3.15.50 — 風盾雙層(需地攻 2 次)→ 破盾組合「地地暗水」
      desc:'颱風眼正中央誕生的雷雲龍,捲起整座島嶼的氣流,以神雷麻痺、暴風自癒' },
    { id:'shanyue_earth_dragon',   name:'山岳地龍王',    element:'earth', maxHp:10000000, scene:'地核深處',
      shieldElements:['earth','fire','dark','grass'],
      desc:'盤據於地核的古老土龍,一動就引發強震' },
    { id:'bushi_dark_dragon',      name:'邪骨暗龍王',    element:'dark',  maxHp:10000000, scene:'黃泉之門',
      shieldElements:['dark','earth','water','grass'],
      desc:'從黃泉之門爬出的骨龍,擊敗一次後會以半血復活再戰' },
    { id:'shensheng_light_dragon', name:'神聖光龍王',    element:'light', maxHp:10000000, scene:'高天原',
      shieldElements:['light','fire','wind','grass'],
      desc:'天界派遣的審判龍,僅暗系英雄能對其造成完整傷害' },
    { id:'cuiyu_grass_dragon',     name:'翠綠森龍王',    element:'grass', maxHp:10000000, scene:'亞馬遜雨林',
      shieldElements:['grass','water','light'],          // ★ v3.13.73 — 破盾:火(草盾×2)/風(水盾)/暗(光盾)
      shieldLayers:{grass:2, water:1, light:1},          // ★ v3.13.73 — 草盾雙層(需火攻 2 次)→ 破盾組合「火火風暗」
      desc:'棲息於亞馬遜雨林(全世界植物最茂盛之地)的翠玉龍,以藤蔓束縛、劇毒與飛葉絞殺入侵者' },  // ★ v3.13.74
    { id:'xingchen_omni_dragon',   name:'星辰幻龍王',    element:'omni',  maxHp:10000000, scene:'銀河',
      shieldElements:['fire','water','wind','earth','light','dark','grass'],  // ★ 終極龍:7 元素全開
      desc:'集八元素之力於一身的終極龍,每階段切換屬性' },
  ];

  // ═══════════════════════════════════════════════════════════════════
  // ★ v3.14.20 — 當前龍王切換系統(老師裁示「甲」)
  //   背景:過去當前龍王寫死 vesuvius_fire_dragon(全檔約 30 處),翠玉草只能預覽不能打。
  //   設計:
  //   ① 雲端欄位 stats/global.wbCurrentBossId(玩家端 _cachedGlobalStats 快取同步)
  //   ② 輪替順序 _WB_BOSS_ROTATION:維蘇威 → 翠玉草(老師指定第二棒)→ 其餘照 LINEUP 順序循環
  //   ③ 祝福 72h 到期 → _wbTryAutoAdvanceBoss(index.html)搶鎖 transaction 自動接班下一隻(滿血)
  //   ④ GM 後台「當前龍王切換」卡可手動切換任一隻 / 開戰 / 休戰
  //   所有「現在打哪隻」判定一律走 _wbGetCurrentBossId()/_wbGetCurrentBoss(),禁止再寫死。
  // ═══════════════════════════════════════════════════════════════════
  window._WB_DEFAULT_BOSS_ID = 'vesuvius_fire_dragon';
  // ★ v3.14.21 老師裁示順序:火 → 草 → 土 → 風 → 水 → 暗 → 光 → 幻 → 火(循環)
  window._WB_BOSS_ROTATION = [
    'vesuvius_fire_dragon',   // 1. 火 — 火山炎龍王(首發)
    'cuiyu_grass_dragon',     // 2. 草 — 翠綠森龍王
    'shanyue_earth_dragon',   // 3. 土 — 山岳地龍王
    'taifeng_wind_dragon',    // 4. 風 — 風暴雷龍王
    'shenhai_water_dragon',   // 5. 水 — 深淵海龍王
    'bushi_dark_dragon',      // 6. 暗 — 邪骨暗龍王
    'shensheng_light_dragon', // 7. 光 — 神聖光龍王
    'xingchen_omni_dragon',   // 8. 幻 — 星辰幻龍王(終極)→ 循環回火
  ];
  window._wbGetCurrentBossId = function(){
    try{
      const gs = window._cachedGlobalStats;
      const id = gs && gs.wbCurrentBossId;
      if(id && (window.WORLD_BOSS_LINEUP || []).some(function(b){ return b && b.id === id; })) return id;
    }catch(_){}
    return window._WB_DEFAULT_BOSS_ID;
  };
  window._wbGetCurrentBoss = function(){
    const _id = window._wbGetCurrentBossId();
    const _lu = window.WORLD_BOSS_LINEUP || [];
    return _lu.find(function(b){ return b && b.id === _id; }) || _lu[0] || null;
  };
  window._wbGetNextBossId = function(afterId){
    const _rot = window._WB_BOSS_ROTATION || [];
    const _i = _rot.indexOf(afterId || window._wbGetCurrentBossId());
    return _rot[(_i >= 0 ? _i + 1 : 0) % _rot.length] || window._WB_DEFAULT_BOSS_ID;
  };
  // ★ v3.14.23(2026-06-13)— 當前龍王戰鬥 BGM 對照(對應 index.html 的 <audio> 元素 id)
  //   維蘇威=bgm-wb-vesuvius-battle、翠玉草=bgm-wb-cuiyu-battle;其餘龍王尚無專屬 BGM → 後備維蘇威。
  //   日後新增龍王 BGM:在 index.html 加 <audio>,並在此表加一筆映射即可。
  window._WB_BATTLE_BGM_MAP = {
    vesuvius_fire_dragon: 'bgm-wb-vesuvius-battle',
    cuiyu_grass_dragon:   'bgm-wb-cuiyu-battle',
    shanyue_earth_dragon: 'bgm-wb-shanyue-battle',   // ★ v3.15.17 — 地龍王戰BGM.m4a
    shenhai_water_dragon: 'bgm-wb-shenhai-battle',    // ★ v3.15.98 — 海龍王BGM.m4a
  };
  window._wbGetCurrentBossBattleBgmId = function(){
    try{
      const _id = window._wbGetCurrentBossId();
      return window._WB_BATTLE_BGM_MAP[_id] || 'bgm-wb-vesuvius-battle';
    }catch(_){ return 'bgm-wb-vesuvius-battle'; }
  };
  // ★ v3.14.24(2026-06-13)— 當前龍王「排名專屬至寶」對照(對應 index.html TAIWAN_TREASURES 內定義)
  //   維蘇威=火龍王之牙(dragon_fang_fire)、翠玉草=草龍王之鬚(dragon_whisker_grass);
  //   其餘龍王尚無專屬至寶 → 後備火龍王之牙(待日後設計補映射)。
  //   ⚠ 與 index.html 領獎發放的 _WB_DRAGON_T_MAP 內容須一致(目前都只有 vesuvius/cuiyu 兩筆)。
  window._WB_DRAGON_TREASURE_MAP = {
    vesuvius_fire_dragon: 'dragon_fang_fire',
    cuiyu_grass_dragon:   'dragon_whisker_grass',
    shanyue_earth_dragon: 'dragon_scale_earth',   // ★ v3.15.17 — 地龍王之麟(須與 index.html _WB_DRAGON_T_MAP 一致)
    // ★ v4.56.0(2026-07-18)— 補齊其餘 5 龍王(原僅 3 筆 → 雷/海/暗/光/幻 fallback 炎龍王之牙,
    //   造成獎勵頁分級表至寶名永遠顯示「炎龍王之牙」;內容與 index.html _lxpsDragonTreasureMapFull base 一致)
    shenhai_water_dragon:   'dragon_claw_sea',       // 海龍王之爪(水)
    taifeng_wind_dragon:    'dragon_wing_thunder',   // 雷龍王之翼(風暴雷龍王)
    bushi_dark_dragon:      'dragon_bone_dark',      // 暗龍王之骸(暗)
    shensheng_light_dragon: 'dragon_feather_light',  // 光龍王之羽(光)
    xingchen_omni_dragon:   'dragon_horn_omni',      // 幻龍王之角(幻/omni)
  };
  window._wbGetCurrentDragonTreasureId = function(){
    // ★ v4.56.0 — 優先走 index.html 完整 8 龍王映射(_lxpsDragonTreasureId,與獎勵頁 ? 彈窗同源單一真相);
    //   本地 map 已補齊 8 筆作 fallback(防 index helper 尚未載入)。原 3 筆時代的舊行為保留於下方 fallback。
    try{
      if(typeof window._lxpsDragonTreasureId === 'function'){
        var _bid = ((typeof window._wbGetCurrentBoss === 'function') && window._wbGetCurrentBoss() || {}).id;
        var _full = window._lxpsDragonTreasureId(_bid);
        if(_full) return _full;
      }
      return window._WB_DRAGON_TREASURE_MAP[window._wbGetCurrentBossId()] || 'dragon_fang_fire';
    }
    catch(_){ return 'dragon_fang_fire'; }
  };
  window._wbGetCurrentDragonTreasureName = function(){
    try{
      const _tid = window._wbGetCurrentDragonTreasureId();
      const _t = window.TAIWAN_TREASURES && window.TAIWAN_TREASURES[_tid];
      return (_t && _t.name) || '火龍王之牙';
    }catch(_){ return '火龍王之牙'; }
  };

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
    // ★ v3.15.17 — 山岳地龍王掉落物(土系紀念物,結構對齊火/水龍王)
    shanyue_earth_dragon: {
      treasure: { id:'wb_dragon_scale_earth', icon:'🪨', name:'土龍鱗甲', color:'#cc8855', price:13000, rarity:'mythical' },
      bonusItems: [
        { id:'wb_dragon_horn_earth', icon:'⛰', name:'土龍之角', price:5000, rate:0.30 },
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
      // ★ v3.12.14(2026-05-31)— tier 改成中性榮譽稱號,避免跟稀有度詞撞名混淆
      rankRange: '1', tier: '🏆 救世主級',
      coins: 100000,
      treasureLabel: '未收錄至寶 ×1(優先神話級)',
      summonCrystals: 10, titleTemplate: '屠龍者・{bossName}',
      expScrollTreasure: 5, expBookDeluxe: 5,
      dragonTreasureId: 'dragon_fang_fire',
      dragonTreasureChance: 1.00,
    },
    epic: {
      rankRange: '2-5', tier: '🥈 勇者級',
      coins: 60000,
      treasureLabel: '未收錄至寶 ×1(優先傳說級)',
      summonCrystals: 7,
      expScrollTreasure: 3, expBookDeluxe: 3,
      dragonTreasureId: 'dragon_fang_fire',
      dragonTreasureChance: 0.75,
    },
    rare: {
      rankRange: '6-10', tier: '🥉 大英雄級',
      coins: 30000, treasureChance: 0.60, treasureRarity: 'legendary',
      treasureLabel: '未收錄至寶 (60% 機率,優先史詩級)',
      summonCrystals: 5,
      expScrollTreasure: 2, expBookDeluxe: 2,
      dragonTreasureId: 'dragon_fang_fire',
      dragonTreasureChance: 0.50,
    },
    normal: {
      rankRange: '11-20', tier: '📦 小英雄級',
      coins: 15000, treasureChance: 0.30, treasureRarity: 'legendary',
      treasureLabel: '未收錄至寶 (30% 機率,優先稀有級)',
      summonCrystals: 3,
      expScrollTreasure: 1, expBookDeluxe: 1,
      dragonTreasureId: 'dragon_fang_fire',
      dragonTreasureChance: 0.25,
    },
    memorial: {
      rankRange: '21+', tier: '🎁 參加獎',
      coins: 7000, summonCrystals: 1,
      expScrollTreasure: 1, expBookDeluxe: 1,
      dragonTreasureId: 'dragon_fang_fire',
      dragonTreasureChance: 0.05,
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

  // ═══════════════════════════════════════════════════════════════════
  // ★ v3.12.0(2026-05-29)— 火龍王之牙獎勵抽取 + 發放 API
  //   排名獎勵專屬,1名 100% / 2-5名 75% / 6-10名 50% / 11-20名 25% / 21+ 5%
  //   重複獲得 → 自動轉 treasure_exp_scroll ×5(v3.15.86 老師統一為 5)
  //
  // _wbRollDragonTreasure(rank) → { won:bool, tier, chance }
  // _wbGrantDragonTreasure(rank) → { granted:bool, fallbackScrolls:0|5, alreadyOwned:bool }
  // ═══════════════════════════════════════════════════════════════════
  window._wbRollDragonTreasure = function(rank){
    try{
      const tier = window._wbGetRewardTier(rank);
      const rcfg = (window._WORLD_BOSS_TEAM_REWARDS || {})[tier];
      if(!rcfg || !rcfg.dragonTreasureId || !(rcfg.dragonTreasureChance > 0)){
        return { won:false, tier, chance:0 };
      }
      const won = Math.random() < rcfg.dragonTreasureChance;
      return { won, tier, chance: rcfg.dragonTreasureChance, treasureId: rcfg.dragonTreasureId };
    }catch(e){ console.warn('[v3.12.0 _wbRollDragonTreasure]', e); return { won:false }; }
  };

  window._wbGrantDragonTreasure = function(rank, tidOverride){
    // 結算流程呼叫此函式發放龍王排名至寶;若機率未中 → granted:false 不發
    // 若中了但已擁有 → 自動轉 treasure_exp_scroll ×5(v3.15.86)
    // ★ v4.56.0 — 加第二參數 tidOverride:領獎端傳入「結算當下寫入 pending award 的 dragonTreasureId」。
    //   原因:結算隔天 08:00 下一隻龍王已原子接班,領獎時的「當前龍王」≠ 被擊敗的龍王;
    //   且 _WORLD_BOSS_TEAM_REWARDS 各分級的 dragonTreasureId 寫死 dragon_fang_fire →
    //   原本非火龍王場次的排名至寶一律發成炎龍王之牙。有 override 一律優先。
    try{
      const roll = window._wbRollDragonTreasure(rank);
      if(!roll.won) return { granted:false, rolled:true, chance: roll.chance };
      const tid = (typeof tidOverride === 'string' && tidOverride)
        ? tidOverride
        : (roll.treasureId || 'dragon_fang_fire');
      // 檢查是否已擁有(讀 window 端的 _taiwanTreasureData,index.html 內已掛 window)
      const _td = (typeof window._taiwanTreasureData !== 'undefined') ? window._taiwanTreasureData : null;
      const _owned = _td && _td[tid] && (_td[tid].lv >= 1);
      if(_owned){
        // ★ v3.15.86(老師乙統一5)— 重複獲得 → 補 5 張至寶經驗卷軸(對齊自選券/未收錄至寶)
        try{
          if(typeof window.backpackAdd === 'function'){
            window.backpackAdd('treasure_exp_scroll', 5);
          }
        }catch(_){}
        try{ if(typeof window.gameCloudSave === 'function') window.gameCloudSave(); }catch(_){}
        console.log('[v3.15.86 _wbGrantDragonTreasure] 重複獲得 → +5 treasure_exp_scroll');
        return { granted:false, alreadyOwned:true, fallbackScrolls:5 };
      }
      // 首次獲得 → 寫入 _taiwanTreasureData
      try{
        if(typeof window._taiwanTreasureData === 'undefined' || !window._taiwanTreasureData){
          window._taiwanTreasureData = {};
        }
        window._taiwanTreasureData[tid] = { lv:1, exp:0, equippedTo:null, invested:{hp:0,atk:0,sp:0,spd:0} };
        // 持久化到 localStorage + 雲端
        try{
          if(typeof window._saveTaiwanTreasureData === 'function'){
            window._saveTaiwanTreasureData();
          } else {
            localStorage.setItem('lxps_taiwan_treasures', JSON.stringify(window._taiwanTreasureData));
          }
        }catch(_){}
        try{ if(typeof window.gameCloudSave === 'function') window.gameCloudSave(); }catch(_){}
        console.log('[v3.12.0 _wbGrantDragonTreasure] ✅ 首次獲得火龍王之牙!');
        return { granted:true, alreadyOwned:false };
      }catch(eW){
        console.error('[v3.12.0 _wbGrantDragonTreasure] 寫入失敗', eW);
        return { granted:false, error:eW.message };
      }
    }catch(e){
      console.warn('[v3.12.0 _wbGrantDragonTreasure]', e);
      return { granted:false, error:e.message };
    }
  };

  // ───────────────────────────────────────────────────────────────────
  // 5. 火山炎龍王資料 — 自動 Object.assign 掛到主程式既有 DB
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
          '火山炎龍王':{hp:10000000,atk:50,sp:50,spd:15,exp:1500,star:5,isWorldBoss:true,
            // ★ v3.5.9 — s1「業火灼燒」:能量 4→5、傷害 100%→150%(更具威脅性)
            // ★ v3.12.7(2026-05-30) — 配合追擊普攻設計,s1 能量 5→6 拉長放招間隔
            s1:{n:'業火灼燒',c:6,d:'特技150%全體火屬性傷害,附加燃燒2回合',fd:'噴出無盡業火灼燒全場!用特技值的 150% 對全體對手造成火屬性傷害,並對全體附加「燃燒」狀態 2 回合(行動前後各損失 6 HP)。'},
            s2:{n:'龍吼震懾',c:4,d:'特技75%全體無屬性傷害,50%機率眩暈1回合',fd:'發出震天龍吼!用特技值的 75% 對全體對手造成無屬性傷害(無視屬性抗性),每名對手有 50% 機率「眩暈」1 回合不能動。'}
          },
          // ★ v3.13.73 — 翠綠森龍王(第二隻世界 BOSS:草屬性,亞馬遜雨林;數值對齊火龍王)
          '翠綠森龍王':{hp:10000000,atk:45,sp:58,spd:12,exp:1500,star:5,isWorldBoss:true,
            s1:{n:'劇毒藤縛',c:5,d:'拘束特技最高 1 名對手 2 回合並使其猛毒',fd:'伸出巨大藤蔓緊緊纏住對方陣中特技最高的英雄!使其「禁動」2 回合(完全無法行動),並陷入「猛毒」5 回合(每回合損失最大 HP 8%,無視護盾與減傷)。'},
            s2:{n:'萬刃落葉',c:6,d:'特技150%全體草屬性傷害,附加出血2回合',fd:'抖落滿天如刀刃般銳利的葉片射向全場!用特技值的 150% 對全體對手造成草屬性傷害,並使全體「出血」2 回合(每回合損失最大 HP 6%,且每次受到攻擊再追加損失 6%;可被護盾與減傷抵銷)。'}
          },
          // ★ v3.15.17 — 山岳地龍王(第三隻世界 BOSS:土屬性,地核;數值對齊火/草龍王)
          '山岳地龍王':{hp:10000000,atk:60,sp:50,spd:5,exp:1500,star:5,isWorldBoss:true,
            s1:{n:'山崩落石',c:6,d:'特技150%全體土屬性傷害,60%機率暈眩1回合',fd:'撼動山岳崩落巨岩砸向全場!用特技值的 150% 對全體對手造成土屬性傷害,每名對手有 60% 機率「暈眩」1 回合不能動。'},
            s2:{n:'震天龍吼',c:4,d:'特技75%全體無屬性傷害,全體強力暈眩1回合',fd:'發出撼天動地的龍吼!用特技值的 75% 對全體對手造成無屬性傷害(無視屬性抗性),並使全體對手陷入「強力暈眩」1 回合,完全無法行動。'}
          },
          // ★ v3.15.50 — 風暴雷龍王(第四隻世界 BOSS:風屬性,颱風眼;ATK40/SP45/SPD30)
          '風暴雷龍王':{hp:10000000,atk:40,sp:45,spd:30,exp:1500,star:5,isWorldBoss:true,
            s1:{n:'雷霆貫穿',c:5,d:'特技150%單體風屬性傷害,麻痺2回合',fd:'凝聚萬鈞雷霆貫穿目標!用特技值的 150% 對特技最高的 1 名對手造成風屬性傷害,並使其「麻痺」2 回合(完全無法行動)。'},
            s2:{n:'暴風肅清',c:6,d:'特技120%全體風屬性傷害,解除自身所有不利狀態',fd:'捲起毀滅暴風橫掃全場!用特技值的 120% 對全體對手造成風屬性傷害,並解除自己身上所有不利狀態(中毒、麻痺、暈眩、降速等全部清除)。'}
          },
          // ★ v3.15.98 — 深淵海龍王(第五隻:水屬性,太平洋深淵;ATK47/SP50/SPD18)正式實裝
          '深淵海龍王':{hp:10000000,atk:47,sp:50,spd:18,exp:1500,star:5,isWorldBoss:true,
            s1:{n:'絕對零度',c:5,d:'特技130%全體水屬性傷害,全體50%機率冰凍1回合',fd:'釋放絕對零度的酷寒凍結全場!用特技值的 130% 對全體對手造成水屬性傷害,每名對手有 50% 機率陷入「冰凍」1 回合,完全無法行動。'},
            s2:{n:'萬丈寒淵',c:6,d:'特技150%全體水屬性傷害,隨機2名強力冰凍2回合',fd:'捲起萬丈深淵的寒濤橫掃全場!用特技值的 150% 對全體對手造成水屬性傷害,並從存活對手中隨機選 2 名陷入「強力冰凍」2 回合,完全無法行動。'}
          },
          // ★ v3.15.50 — 邪骨暗龍王(第六隻:暗屬性,黃泉之門;ATK45/SP55/SPD15)技能設計中
          '邪骨暗龍王':{hp:10000000,atk:45,sp:55,spd:15,exp:1500,star:5,isWorldBoss:true,
            s1:{n:'? 未知技能',c:5,d:'技能設計中',fd:'此招式尚在設計中,敬請期待!'},
            s2:{n:'? 未知技能',c:6,d:'技能設計中',fd:'此招式尚在設計中,敬請期待!'}
          },
          // ★ v3.15.50 — 神聖光龍王(第七隻:光屬性,高天原;ATK45/SP55/SPD15)技能設計中
          '神聖光龍王':{hp:10000000,atk:45,sp:55,spd:15,exp:1500,star:5,isWorldBoss:true,
            s1:{n:'? 未知技能',c:5,d:'技能設計中',fd:'此招式尚在設計中,敬請期待!'},
            s2:{n:'? 未知技能',c:6,d:'技能設計中',fd:'此招式尚在設計中,敬請期待!'}
          },
          // ★ v3.15.50 — 星辰幻龍王(第八隻終極:無屬性,銀河;ATK35/SP50/SPD30)技能設計中
          '星辰幻龍王':{hp:10000000,atk:35,sp:50,spd:30,exp:1500,star:5,isWorldBoss:true,
            s1:{n:'? 未知技能',c:5,d:'技能設計中',fd:'此招式尚在設計中,敬請期待!'},
            s2:{n:'? 未知技能',c:6,d:'技能設計中',fd:'此招式尚在設計中,敬請期待!'}
          },
        });
        window.HERO_DB = HERO_DB;  // ★ 暴露給 UI script 用
      }
    }catch(e){ console.warn('[WB] HERO_DB 掛載失敗', e); }

    try{
      if(typeof BURST_DB === 'object' && BURST_DB){
        Object.assign(BURST_DB, {
          // ★ v3.5.9 — 老師調整:當前 HP 90% → 95% 火傷(更具毀滅性)
          // ★ v3.11.7(2026-05-28) — 老師再調整:改為「將 HP 減至 20%」HP 考核機制,玩家至少需 110 HP 才能撐過爆發+後續燃燒
          '火山炎龍王': {n:'天崩之炎', d:'將全體HP減至最大HP 20%(無視有利)+強力燃燒3回合,隨機1名強力暈眩+強力易傷1回合', fd:'兩千年怒火一次釋放!將全體存活對手的 HP 減至「最大 HP 的 20%」(若當前 HP 已低於 20% 則不受傷),完全無視所有有利狀態(無敵、免疫、護盾、反射、減傷全部失效),並對全體存活對手附加「強力燃燒」狀態 3 回合(行動前後各 -10HP)。再從存活對手中隨機選 1 名,額外施加「強力暈眩」與「強力易傷」各 1 回合。'},
          // ★ v3.13.73 — 翠綠森龍王爆發(綜合 S1+S2 強力版)
          '翠綠森龍王': {n:'翠龍·萬藤絞殺', d:'特技120%全體草傷(無視有利)+全體猛毒5回(-8%/回)&強力出血2回(-9%/回)+隨機2名強力禁動1回合', fd:'太古翠藤自地底竄出絞殺全場!用特技值的 120% 對全體存活對手造成草屬性傷害(無視無敵、免疫、護盾、反射、減傷),並同時施加「猛毒」5 回合(每回合 -8% 最大HP,無視護盾/減傷)與「強力出血」2 回合(每回合 -9% 最大HP、每次受擊再追加 9%,可被護盾/減傷抵銷)。再從存活對手中隨機選 2 名,以強韌藤蔓「強力禁動」1 回合,完全無法行動。'},
          // ★ v3.15.17 — 山岳地龍王爆發(全體大傷 + 強力暈眩主軸)
          '山岳地龍王': {n:'天動地裂', d:'特技180%全體土傷(無視有利)+隨機2名強力暈眩1回合+隨機1名強力易傷2回合', fd:'大地崩解、山岳傾覆!用特技值的 180% 對全體存活對手造成土屬性傷害,完全無視所有有利狀態(無敵、免疫、護盾、反射、減傷全部失效;但元素護盾仍減 80%)。再從存活對手中隨機選 2 名陷入「強力暈眩」1 回合完全無法行動,並隨機選 1 名額外施加「強力易傷」2 回合。'},
          // ★ v3.15.50 — 風暴雷龍王爆發(item 2 設計:全體風傷+全體麻痺1回合+解除自身不利)
          '風暴雷龍王': {n:'雷神·萬雷殛世', d:'特技150%全體風傷+全體麻痺1回合+解除自身所有不利狀態', fd:'召喚九天神雷殛滅全場!用特技值的 150% 對全體存活對手造成風屬性傷害,並使全體「麻痺」1 回合(完全無法行動),同時解除自己身上所有不利狀態(中毒、暈眩、降速等全部清除)。'},
          // ★ v3.15.50 — 以下龍王爆發設計中(? 未知爆發)
          // ★ v3.15.98 — 深淵海龍王爆發(全體水傷 + 冰凍 + 招牌封技)
          '深淵海龍王': {n:'絕對零度·冰封終焉', d:'特技150%全體水傷(無視有利)+全體冰凍1回合+隨機1名強力冰凍2回合+全體封技1回合', fd:'絕對零度全面降臨,萬物凍結!用特技值的 150% 對全體存活對手造成水屬性傷害(無視無敵、免疫、護盾、反射、減傷;但元素護盾仍減 80%),使全體「冰凍」1 回合,並從中隨機選 1 名「強力冰凍」2 回合;再對全體施加「封技」1 回合(無法使用技能與極限爆發,僅能普攻或休息)。'},
          '邪骨暗龍王': {n:'? 未知爆發', d:'爆發設計中', fd:'此龍王的極限爆發尚在設計中,敬請期待!'},
          '神聖光龍王': {n:'? 未知爆發', d:'爆發設計中', fd:'此龍王的極限爆發尚在設計中,敬請期待!'},
          '星辰幻龍王': {n:'? 未知爆發', d:'爆發設計中', fd:'此龍王的極限爆發尚在設計中,敬請期待!'},
        });
        window.BURST_DB = BURST_DB;
      }
    }catch(_){}

    try{
      if(typeof HERO_TRAIT === 'object' && HERO_TRAIT){
        Object.assign(HERO_TRAIT, {
          // ★ v3.7.10(2026-05-25) — 護盾觸發回合:第 3/5/7/9,每元素各 1 層
          //   同時補充「全隊聯手爆發 5000 傷害可無視護盾」的攻略提示。
          '火山炎龍王': { name:'炎之意志', icon:'🐉', desc:'單次受傷上限固定 5,000(不隨 HP 變動);第 3/5/7/9 回合啟動四元素護盾各 1 層(減傷 80%);全隊聯手爆發可無視護盾', fd:'兩千年沉睡淬煉的炎之意志,單次受傷上限固定為 5,000(不隨 HP 變動,任何一擊最高僅造成 5,000 傷害)。每場戰鬥的第 3、5、7、9 回合會自動啟動「四元素護盾」,每次補滿每個元素各 1 層(同時最多 4 層):所有傷害再減 80%,即使是無視有利狀態的攻擊也無法穿透。需要使用對應屬性(火 / 風 / 土 / 暗)的剋制元素(水 / 土 / 草 / 光)攻擊各 1 次,才能完整破除護盾恢復正常傷害。整場 4 階段護盾、最多 16 次破盾機會,需用心管理破盾節奏。註:當隊伍累積答對 5 / 10 題時觸發的「全隊聯手爆發」5,000 傷害可以無視護盾直接命中。【共通天賦】所有龍王相同:① 每回合行動結束後會額外發動 1 次普通攻擊(追擊最低 HP 的對手);② 戰鬥若一直拖到第 11 回合,場地會崩壞、戰鬥強制結束結算。【火龍王專屬】牠的暴擊率永久 +30%,普攻與技能更容易打出暴擊重傷。' },
          // ★ v3.13.73 — 翠綠森龍王天賦「翠之意志」(共同 cap/護盾 + 吸能量/免疫光/燃燒特別放大)
          '翠綠森龍王': { name:'翠之意志', icon:'🐉', desc:'單次受傷上限固定 5,000;第 3/5/7/9 回合啟動四元素護盾(草盾×2/水盾/光盾,減傷 80%);每回合吸取隊伍 2 能量;免疫光屬性傷害;受燃燒傷害固定為「普通-300/強力-600」', fd:'亞馬遜雨林翠玉龍的古老意志,單次受傷上限固定為 5,000(不隨 HP 變動)。每場戰鬥的第 3、5、7、9 回合會啟動「元素護盾」:草盾 2 層 + 水盾 1 層 + 光盾 1 層(同時最多 4 層,減傷 80%),需用「火」攻擊破草盾(要 2 次)、「風」破水盾、「暗」破光盾,才能完整破除。此外牠每回合會「吸取隊伍 2 點能量」據為己用(讓自己更快爆發)、且「完全免疫光屬性傷害」。但藤葉天生怕火——對牠施加的燃燒會被特別放大為固定值:普通燃燒每跳 -300、強力燃燒每跳 -600(不受暴擊影響,護盾期間同樣吃 80% 減傷)。火屬性是牠的絕對剋星(屬性克制 + 破 2 層草盾 + 燃燒放大)。【共通天賦】所有龍王相同:① 每回合行動結束後會額外發動 1 次普通攻擊(追擊最低 HP 的對手);② 戰鬥若一直拖到第 11 回合,場地會崩壞、戰鬥強制結束結算。' },
          // ★ v3.15.17→v3.15.51 — 山岳地龍王天賦「山岳之意志」(共同 cap/護盾 + 強力減傷 -30% + 50%反擊 + 弱點畏毒)
          '山岳地龍王': { name:'山岳之意志', icon:'🐉', desc:'單次受傷上限固定 5,000;第 3/5/7/9 回合啟動四元素護盾(土/火/暗/草,減傷 80%);受到所有傷害再額外減 30%;受到攻擊時 50% 機率反彈受傷的 50% 給攻擊者;但畏懼劇毒——中毒傷害大幅放大且無視上限', fd:'盤踞地核億萬年的山岳之意志,單次受傷上限固定為 5,000(不隨 HP 變動)。每場戰鬥的第 3、5、7、9 回合會啟動「四元素護盾」:土盾、火盾、暗盾、草盾各 1 層(同時最多 4 層,減傷 80%),需用「草」破土盾、「水」破火盾、「光」破暗盾、「火」破草盾,各 1 次才能完整破除。此外牠擁有堅不可摧的軀體:受到所有傷害都會「再額外減免 30%」(護盾期間在 80% 減傷之上再減),且「受到攻擊時有 50% 機率反彈受到傷害的 50%」給攻擊者(土屬性)。但再硬的岩石也會被毒液侵蝕——牠「畏懼劇毒」:受到的中毒/猛毒傷害會被大幅放大為固定值(普通中毒每跳 -1,500、猛毒每跳 -3,000),且完全無視 5,000 上限、護盾與減傷。中毒是擊敗牠最有效的手段。【共通天賦】所有龍王相同:① 每回合行動結束後會額外發動 1 次普通攻擊(追擊最低 HP 的對手);② 戰鬥若一直拖到第 11 回合,場地會崩壞、戰鬥強制結束結算。' },
          // ★ v3.15.50 — 風暴雷龍王天賦(共通 cap/護盾/崩壞/額外普攻 + 專屬 開場普攻/被降速+30%受傷)
          '風暴雷龍王': { name:'雷霆之意志', icon:'🐉', desc:'單次受傷上限固定 5,000;第 3/5/7/9 回合啟動元素護盾(風盾×2/光盾/火盾,減傷 80%,用地/暗/水破盾);每回合開始用攻擊值襲擊隨機 1 人;被降速時受到傷害 +30%', fd:'颱風眼雷雲龍的意志,單次受傷上限固定 5,000(不隨 HP 變動)。每場戰鬥第 3、5、7、9 回合啟動「元素護盾」:風盾 2 層 + 光盾 1 層 + 火盾 1 層(減傷 80%),需用「地」破風盾(要 2 次)、「暗」破光盾、「水」破火盾,各打 1 次才能完整破除。【專屬】牠每個新回合一開始就會用「攻擊值」襲擊隨機 1 名對手(額外的開場攻擊);而且「被降速時受到的傷害會 +30%」——對牠降速反而讓牠更脆弱,要謹慎使用降速類技能。【共通天賦】所有龍王相同:① 每回合行動結束後會額外發動 1 次普通攻擊(追擊最低 HP 的對手);② 戰鬥若一直拖到第 11 回合,場地會崩壞、戰鬥強制結束結算。' },
          // ★ v3.15.98 — 深淵海龍王天賦(專屬 每回合封技 + 冰凍三段機制:被冰凍+30%受傷/冰中受擊回能/碎裂後免疫1回合)
          '深淵海龍王': { name:'深淵之意志', icon:'🐉', desc:'單次受傷上限固定 5,000;第 3/5/7/9 回合啟動四元素護盾(水/風/光/草,減傷 80%,用風/土/暗/火破盾);每回合隨機對 1 人「封技」1 回合(封技能+爆發);被冰凍時受傷 +30%,但冰封中每受擊回 1 能量,冰層碎裂後 1 回合免疫冰凍', fd:'馬里亞納海溝冰龍的意志,單次受傷上限固定 5,000(不隨 HP 變動)。每場戰鬥第 3、5、7、9 回合啟動「四元素護盾」:水盾、風盾、光盾、草盾各 1 層(減傷 80%),需用「風」破水盾、「土」破風盾、「暗」破光盾、「火」破草盾,各 1 次才能完整破除。【專屬】① 牠每回合會隨機對 1 名對手施加「封技」1 回合——被封技者無法使用技能與極限爆發,只能普攻或休息。② 弱點·畏冰:牠「被冰凍時受到的傷害 +30%」(突破上限),冰系英雄(如冰法師)是牠的剋星;但這弱點有代價——牠被冰封住的那一回合,每受到一次攻擊就會「回復 1 點能量」加速自身爆發,而且對牠的冰凍每次只持續 1 回合,冰層碎裂後的 1 回合牠會「免疫冰凍」無法被連續凍結。要趁冰封的短暫空檔集火,並小心反而餵飽牠的爆發。【共通天賦】所有龍王相同:① 每回合行動結束後額外發動 1 次普通攻擊(追擊最低 HP);② 戰鬥若拖到第 11 回合,場地崩壞、強制結束結算。' },
          // ★ v3.15.50 — 邪骨暗龍王天賦(專屬 死亡宣告/受光+30%;技能爆發設計中)
          '邪骨暗龍王': { name:'黃泉之意志', icon:'🐉', desc:'單次受傷上限固定 5,000;第 3/5/7/9 回合啟動四元素護盾(暗/土/水/草,減傷 80%,用光/草/風/火破盾);每回合隨機對 1 人死亡宣告;受到光屬性傷害 +30%', fd:'黃泉之門骨龍的意志,單次受傷上限固定 5,000。每場戰鬥第 3、5、7、9 回合啟動「四元素護盾」:暗盾、土盾、水盾、草盾各 1 層(減傷 80%),需用「光」破暗盾、「草」破土盾、「風」破水盾、「火」破草盾,各 1 次才能完整破除。【專屬】牠每回合會隨機對 1 名對手施加「死亡宣告」(數回合後若未解除即倒下);而且「受到光屬性傷害會 +30%」——光系英雄是牠的剋星。牠的招式與爆發尚在設計中(? 未知技能)。【共通天賦】所有龍王相同:① 每回合行動結束後額外發動 1 次普通攻擊(追擊最低 HP);② 戰鬥若拖到第 11 回合,場地崩壞、強制結束結算。' },
          // ★ v3.15.50 — 神聖光龍王天賦(專屬 封印/受暗+30%;技能爆發設計中)
          '神聖光龍王': { name:'高天原之意志', icon:'🐉', desc:'單次受傷上限固定 5,000;第 3/5/7/9 回合啟動四元素護盾(光/火/風/草,減傷 80%,用暗/水/土/火破盾);每回合隨機封印 1 人 2 回合;受到暗屬性傷害 +30%', fd:'高天原審判龍的意志,單次受傷上限固定 5,000。每場戰鬥第 3、5、7、9 回合啟動「四元素護盾」:光盾、火盾、風盾、草盾各 1 層(減傷 80%),需用「暗」破光盾、「水」破火盾、「土」破風盾、「火」破草盾,各 1 次才能完整破除。【專屬】牠每回合會隨機「封印」1 名對手 2 回合;而且「受到暗屬性傷害會 +30%」——暗系英雄是牠的剋星。牠的招式與爆發尚在設計中(? 未知技能)。【共通天賦】所有龍王相同:① 每回合行動結束後額外發動 1 次普通攻擊(追擊最低 HP);② 戰鬥若拖到第 11 回合,場地崩壞、強制結束結算。' },
          // ★ v3.15.50 — 星辰幻龍王天賦(終極:七元素全護盾 + 專屬 免疫異常/減普攻/迴避;技能爆發設計中)
          '星辰幻龍王': { name:'星辰之意志', icon:'🐉', desc:'單次受傷上限固定 5,000;第 3/5/7/9 回合啟動七元素全護盾(減傷 80%,需七屬性各破 1 次);免疫所有異常狀態;受到普攻傷害 -30%;迴避率 +30%', fd:'銀河終極龍的意志,單次受傷上限固定 5,000。牠集八元素之力於一身——每場戰鬥第 3、5、7、9 回合啟動「七元素全護盾」(火/水/風/土/光/暗/草各 1 層,減傷 80%),需用全部七種剋制屬性各打 1 次才能完整破除,是破盾難度最高的龍王。【專屬】牠「免疫所有異常狀態」(中毒、暈眩、麻痺、封印等一律無效)、「受到普通攻擊的傷害 -30%」、且天生「迴避率 +30%」(技能與普攻都可能被閃過)。牠的招式與爆發尚在設計中(? 未知技能)。【共通天賦】所有龍王相同:① 每回合行動結束後額外發動 1 次普通攻擊(追擊最低 HP);② 戰鬥若拖到第 11 回合,場地崩壞、強制結束結算。' },
        });
        window.HERO_TRAIT = HERO_TRAIT;
      }
    }catch(_){}

    try{
      if(typeof HERO_LORE === 'object' && HERO_LORE){
        Object.assign(HERO_LORE, {
          '火山炎龍王': '沉睡於義大利那不勒斯灣維蘇威火山口的古老火龍「炎之翼」。西元 79 年 8 月 24 日,牠首次甦醒咆哮,使整座火山噴發兩天兩夜,將山下的羅馬古城「龐貝」與「赫庫蘭尼姆」完全掩埋於火山灰下,並造成兩萬餘人喪命。中世紀的 1631 年牠再度被驚醒,造成 3,000 人罹難。20 世紀最後一次是 1944 年二戰末期,美軍轟炸鄰近地區時意外驚動,牠咆哮三日後返回火山口。2026 年,因近年地殼活動頻繁,火龍王第四度甦醒,需要四位英雄遠渡重洋前往那不勒斯封印,以免人類再蒙浩劫。',
          // ★ v3.13.74 — 翠綠森龍王背景故事(老師指定:世界 BOSS 都棲息於「全世界最充滿該屬性的地方」;
          //   草屬性 → 全世界植物最茂盛之地 = 亞馬遜雨林)
          '翠綠森龍王': '棲息於亞馬遜雨林最深處的太古翠玉龍。相傳全世界植物生命力最旺盛之地——這片占地球雨林面積過半、孕育數百萬物種的浩瀚綠海——正是牠藤蔓盤結的軀體所化,每一寸藤葉都是牠意志的延伸。平時牠與千年巨木融為一體靜靜沉睡,一旦有人砍伐焚林、破壞這片「世界之肺」,牠便會甦醒:萬千翠藤自地底竄出絞殺入侵者,飛葉如刀、劇毒蔓延。傳說牠唯一畏懼的是烈火,因為再堅韌的藤葉也擋不住火焰的吞噬。如今綠林告急,需要四位英雄以火為刃,才能讓這頭翠玉巨龍重歸沉眠。',
          // ★ v3.15.17 — 山岳地龍王背景故事(全世界土石最厚重之地 = 喜馬拉雅山脈直通地核的億萬噸岩層)
          '山岳地龍王': '蟄伏於地核最深處的太古土龍。相傳全世界岩石與土壤最厚重、最沉穩之地——喜馬拉雅山脈底下直通地核的億萬噸岩層——正是牠盤踞蜷曲的身軀所化。億萬年來牠與整座山脈融為一體靜靜沉睡,每一次翻身都化作撼動大陸的強震。當人類過度開鑿山岳、震動大地,牠便會甦醒:山崩地裂、巨岩如雨,以堅不可摧的岩甲與撼天龍吼鎮壓入侵者。傳說牠的岩甲刀槍不入,唯一的弱點是滲入岩縫的劇毒——再堅硬的磐石,也擋不住毒液經年累月的侵蝕。如今地脈震動不安,需要四位英雄以毒為刃,才能讓這頭山岳巨龍重歸沉眠。',
          // ★ v3.15.50 — 5 隻新龍王背景故事(各棲息於全世界最充滿該屬性之地)
          '風暴雷龍王': '盤踞於太平洋最強颱風眼正中央的雷雲巨龍。相傳全世界風與雷最狂暴之地——超級颱風的風眼——正是牠捲動的氣流所化。平時牠隨季風遊走於萬里高空靜靜沉睡,一旦人類的飛行器或船隻闖入風暴核心,牠便會甦醒:萬鈞神雷自九天劈下、暴風撕裂一切。牠的雷霆能麻痺對手,暴風能滌淨自身的一切創傷。傳說牠速度奇快、難以捉摸,但若有人能拖慢牠的身法,牠脆弱的本體便會顯露——降速,反而是逼出牠破綻的鑰匙。',
          '深淵海龍王': '蛰伏於馬里亞納海溝最深處(全世界最深、最寒的海)的太古冰龍。相傳全世界海水最深寒之地正是牠蜷曲的身軀所化,以絕對零度凍結整片海洋。牠每回合會「封技」入侵者,封鎖其技能與極限爆發,使其只能徒手反抗;以「絕對零度」「萬丈寒淵」凍結全場,爆發「絕對零度·冰封終焉」更將萬物冰封。傳說牠唯一的弱點是寒冰本身——當牠被冰凍時,傷口反而會更加致命(受傷 +30%);但牠被冰封的瞬間會吸納攻擊之力回復能量、加速反撲,且冰層轉瞬即碎、無法被連續凍結。需要四位英雄以冰為刃、抓準時機,才能讓這頭深淵巨龍重歸沉眠。',
          '邪骨暗龍王': '從冥界「黃泉之門」爬出的太古骨龍。相傳通往幽冥的黃泉入口正是牠白骨纏繞的身軀所化,渾身散發死亡的氣息。牠每回合會對入侵者下達「死亡宣告」,以冥界之力催命;但聖潔的光芒能灼傷牠的骨骸——受到光屬性攻擊時,牠承受的傷害會大幅增加。牠的招式與爆發,仍在四位英雄的探索之中(設計中)。',
          '神聖光龍王': '受天界差遣、自「高天原」降臨的審判之龍。相傳眾神所居的天界最高處正是牠聖光環繞的身軀所化,以神聖的裁決之力審判世間。牠每回合會封印入侵者的力量,使其無法施展極限之力;但與光相對的暗影能侵蝕牠的神性——受到暗屬性攻擊時,牠承受的傷害會大幅增加。牠的招式與爆發,仍在四位英雄的探索之中(設計中)。',
          '星辰幻龍王': '遨遊於浩瀚銀河、集八元素之力於一身的終極幻龍。相傳橫亙夜空的整條星河正是牠流轉變幻的身軀所化,每一顆星辰都是牠鱗片上的一點光。牠免疫一切異常、身法縹緲難以命中,普通攻擊更難傷其分毫,是所有龍王中最難對付的存在。傳說只有集齊七種屬性之力、層層破除牠的星辰護盾,才有可能撼動這頭橫跨星海的終極之龍。牠的招式與爆發,仍是宇宙級的謎團(設計中)。',
        });
        window.HERO_LORE = HERO_LORE;
      }
    }catch(_){}

    try{
      if(typeof HERO_BIO === 'object' && HERO_BIO){
        Object.assign(HERO_BIO, {
          '火山炎龍王': '沉睡於義大利維蘇威火山口的古老火龍,西元 79 年掩埋龐貝古城的元凶。需要 4 位英雄聯手才能封印的世界 BOSS。',
          // ★ v3.13.74 — 改成「全世界植物最茂盛之地=亞馬遜雨林」
          '翠綠森龍王': '棲息於亞馬遜雨林最深處的太古翠玉龍,全世界植物生命力最旺盛之地即是牠的軀體所化。以藤蔓、劇毒與飛葉守護綠林,唯一畏懼烈火。需要 4 位英雄聯手才能讓牠重歸沉眠的世界 BOSS。',
          // ★ v3.15.17 — 山岳地龍王簡介
          '山岳地龍王': '蟄伏於地核最深處的太古土龍,全世界土石最厚重之地即是牠的軀體所化。以山崩、落石與撼天龍吼鎮壓敵人,岩甲堅不可摧,唯一弱點是劇毒。需要 4 位英雄聯手才能讓牠重歸沉眠的世界 BOSS。',
          // ★ v3.15.50 — 5 隻新龍王簡介
          '風暴雷龍王': '盤踞於太平洋颱風眼正中央的雷雲巨龍,全世界風雷最狂暴之地即是牠的軀體所化。以神雷麻痺、暴風自癒,速度奇快,但被降速時更脆弱。需要 4 位英雄聯手才能讓牠重歸沉眠的世界 BOSS。',
          '深淵海龍王': '蛰伏於馬里亞納海溝最深處的太古冰龍,全世界最深最寒的海即是牠的軀體所化。每回合「封技」封鎖敵人技能與爆發,以絕對零度冰封全場;被冰凍時受傷 +30%(但冰封中受擊會回能、冰層轉瞬即碎)。需要 4 位英雄聯手挑戰的世界 BOSS。',
          '邪骨暗龍王': '從黃泉之門爬出的太古骨龍,通往冥界的入口即是牠的軀體所化。每回合對敵人死亡宣告,畏懼光屬性。招式與爆發設計中。需要 4 位英雄聯手挑戰的世界 BOSS。',
          '神聖光龍王': '自高天原降臨的審判之龍,眾神天界最高處即是牠的軀體所化。每回合封印敵人之力,畏懼暗屬性。招式與爆發設計中。需要 4 位英雄聯手挑戰的世界 BOSS。',
          '星辰幻龍王': '遨遊銀河、集八元素之力的終極幻龍,整條星河即是牠的軀體所化。免疫異常、迴避極高、減免普攻,需七屬性破盾,是最難對付的終極龍王。招式與爆發設計中。',
        });
        window.HERO_BIO = HERO_BIO;
      }
    }catch(_){}

    try{
      if(typeof HERO_IMGS === 'object' && HERO_IMGS){
        HERO_IMGS['火山炎龍王'] =
          'https://raw.githubusercontent.com/clarebox123jp-art/LXPSGAME/main/' +
          encodeURIComponent('維蘇威火山龍王.png');  // ★ v3.14.27 改名後圖檔仍用原始檔名(GitHub 上是 維蘇威火山龍王.png)
        // ★ v3.13.73 — 翠綠森龍王立繪(老師指定檔名 草龍王.png,不由角色名推導)
        HERO_IMGS['翠綠森龍王'] =
          'https://raw.githubusercontent.com/clarebox123jp-art/LXPSGAME/main/' +
          encodeURIComponent('草龍王.png');
        // ★ v3.15.17 — 山岳地龍王立繪(老師指定檔名 地龍王.png)
        HERO_IMGS['山岳地龍王'] =
          'https://raw.githubusercontent.com/clarebox123jp-art/LXPSGAME/main/' +
          encodeURIComponent('地龍王.png');
        // ★ v3.15.50 — 5 隻新龍王立繪(老師指定檔名)
        HERO_IMGS['風暴雷龍王'] =
          'https://raw.githubusercontent.com/clarebox123jp-art/LXPSGAME/main/' + encodeURIComponent('雷龍王.png');
        HERO_IMGS['深淵海龍王'] =
          'https://raw.githubusercontent.com/clarebox123jp-art/LXPSGAME/main/' + encodeURIComponent('水龍王.png');
        HERO_IMGS['邪骨暗龍王'] =
          'https://raw.githubusercontent.com/clarebox123jp-art/LXPSGAME/main/' + encodeURIComponent('邪龍王.png');
        HERO_IMGS['神聖光龍王'] =
          'https://raw.githubusercontent.com/clarebox123jp-art/LXPSGAME/main/' + encodeURIComponent('聖龍王.png');
        HERO_IMGS['星辰幻龍王'] =
          'https://raw.githubusercontent.com/clarebox123jp-art/LXPSGAME/main/' + encodeURIComponent('幻龍王.png');
        window.HERO_IMGS = HERO_IMGS;
      }
    }catch(_){}

    try{
      if(typeof MONSTER_AVTR === 'object' && MONSTER_AVTR){
        MONSTER_AVTR['火山炎龍王'] = '🐉';
        MONSTER_AVTR['翠綠森龍王'] = '🐉';   // ★ v3.13.73
        MONSTER_AVTR['山岳地龍王'] = '🐉';   // ★ v3.15.17
        // ★ v3.15.50 — 5 隻新龍王
        MONSTER_AVTR['風暴雷龍王'] = '🐉';
        MONSTER_AVTR['深淵海龍王'] = '🐉';
        MONSTER_AVTR['邪骨暗龍王'] = '🐉';
        MONSTER_AVTR['神聖光龍王'] = '🐉';
        MONSTER_AVTR['星辰幻龍王'] = '🐉';
        window.MONSTER_AVTR = MONSTER_AVTR;
      }
    }catch(_){}

    try{
      if(typeof MONSTER_ELEMENT === 'object' && MONSTER_ELEMENT){
        MONSTER_ELEMENT['火山炎龍王'] = 'fire';
        MONSTER_ELEMENT['翠綠森龍王'] = 'grass';   // ★ v3.13.73
        MONSTER_ELEMENT['山岳地龍王'] = 'earth';   // ★ v3.15.17
        // ★ v3.15.50 — 5 隻新龍王
        MONSTER_ELEMENT['風暴雷龍王'] = 'wind';
        MONSTER_ELEMENT['深淵海龍王'] = 'water';
        MONSTER_ELEMENT['邪骨暗龍王'] = 'dark';
        MONSTER_ELEMENT['神聖光龍王'] = 'light';
        MONSTER_ELEMENT['星辰幻龍王'] = 'omni';
        window.MONSTER_ELEMENT = MONSTER_ELEMENT;
      }
    }catch(_){}

    console.log('[WB] ✅ 火山炎龍王資料已掛載(HP 10000000 / 攻 49 / 特 50 / 速 15)');
    console.log('[WB] ✅ 山岳地龍王資料已掛載(HP 10000000 / 攻 49 / 特 50 / 速 15;天賦 強力減傷+反擊+畏毒)');
  }

  // ───────────────────────────────────────────────────────────────────
  // 6. 火山炎龍王技能邏輯 (透過 hook 接到 execSkill 末端)
  //    在 execSkill 函式裡找一個適合的位置呼叫:
  //      if(window._wbHookExecSkill && window._wbHookExecSkill(n,a,t,al,enemies)) return;
  //    但因為侵入式修改 execSkill 風險高,改用「監聽技能名」方式:
  //      window._wbExecSkillFallback(n, a, t, al, enemies) → true 表示已處理
  // ───────────────────────────────────────────────────────────────────
  window._wbExecSkillFallback = function(n, a, t, al, enemies){
    // 只處理火山炎龍王的 3 招
    if(n === '業火灼燒'){
      try{
        // ★ v3.5.9 — 老師調整:特技 100% → 150% 全體火傷害 + 全體燃燒 2 回合
        // ★ v3.11.7(2026-05-28) — 加 hitBonus 0.30(基礎命中率 +30%)
        enemies.forEach(e => {
          if(e.curHp > 0){
            doDmg(e, Math.floor(spv(a) * 1.50), {actor:a, isSkill:true, isAoe:true, element:'fire', hitBonus:0.30});
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
        // ★ v3.11.7(2026-05-28) — 加 hitBonus 0.30(基礎命中率 +30%)
        enemies.forEach(e => {
          if(e.curHp > 0){
            doDmg(e, Math.floor(spv(a) * 0.75), {actor:a, isSkill:true, isAoe:true, element:'none', hitBonus:0.30});
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
        //   1. 將全體 HP 減至最大 HP 的 20%(無視有利狀態 → 無敵/免疫/護盾/反射全部打穿)
        //   2. 全體強力燃燒 3 回合(主程式 type='hellfire' + _strong:true,行動前後各 -10HP)
        //      註:原版用 'burn' 是無效 type,實際從未生效;這次改為正確的 'hellfire'+_strong
        //   3. 隨機 1 名存活敵人:強力暈眩 + 強力易傷 各 1 回合
        // ★ v3.5.9 — 老師調整:當前 HP 90% → 95%
        // ★ v3.11.7(2026-05-28) — 老師再調整:改為「將 HP 減至最大 HP 的 20%」HP 考核機制
        //   傷害公式:dmg = max(0, curHp - floor(maxHp * 0.20))
        //   若玩家當前 HP 已低於 20% 最大 HP → 傷害 = 0(不會打到負數)
        //   設計意圖:強迫玩家把全隊養到至少 110 HP,確保「減至 22 + 強力燃燒 6 次 -10」仍能存活
        enemies.forEach(e => {
          if(e.curHp <= 0) return;
          const _floorHp = Math.floor((e.hp || 0) * 0.20);
          const _dmg = Math.max(0, e.curHp - _floorHp);
          if(_dmg > 0){
            doDmg(e, _dmg, {
              actor: a,
              isSkill: true,
              isAoe: true,
              ignoreBuffs: true,    // 無視有利狀態(無敵/免疫/護盾/保護/閃避全失效)
              ignoreEvasion: true,  // 必中
              noReflect: true,      // 不被反射
              noHalfDmg: true,      // 不受減傷
              piercing: true,       // 無視防禦
              fixedDmg: true,
              element: 'fire'
            });
          }
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
  //     ★ v3.12.6(2026-05-30) — 老師鐵則(HP 改 500 萬後仍維持):
  //       「世界 BOSS 的護盾凌駕於一切無視有利狀態之上,對世界 BOSS 造成的單次傷害永遠鎖在 5000」
  //       ※ 重點:HP 從 50 萬 → 500 萬「只放大血量上限」,「傷害上限不放大」。
  //         目的是延長龍王壽命,讓更多玩家可以陸續加入戰鬥造成傷害(滿血 500 萬 = 1000 刀)。
  //
  //     具體行為:
  //       1) 單次受傷上限 = 固定 5000(不隨滿血變動)— 永遠生效,沒有例外
  //       2) 第 3/5/7/9 回合啟動四元素護盾:傷害再減 80%(實際扣血 = 1000)
  //          ★ 凌駕於所有「無視有利狀態」「必中」「固定值」「聯手爆發」等旗標之上
  //          ★ 不存在 bypassShield 旗標,任何技能都無法繞過
  //       3) 護盾首次出現時跳訊息提醒玩家
  //
  //     已驗證涵蓋的所有打 BOSS 路徑:
  //       - 主 doDmg 路徑(index.html line 26414)
  //       - fixedDmg 早期 return 路徑(index.html line 25515)
  //       - 暴擊額外傷害(index.html line 26594)
  //       - host 戰鬥模擬(world-boss-ui.html line 8228)
  //       - 答題獎勵聯手爆發 5000(world-boss-ui.html line 10005,v3.11.5 補上)
  //       - 吸血鬼蝙蝠群(index.html line 34108 + 39655,v3.11.5 補上)
  // ───────────────────────────────────────────────────────────────────
  window._wbApplyBossDmgCap = function(boss, rawDmg, opts){
    // ★ v3.13.73 — 泛化:所有龍王共用「單次 cap 5000 + 護盾 80% 減傷」
    if(!boss || !boss.name) return rawDmg;
    const _isWbBoss = (boss.name === '火山炎龍王' || boss.name === '翠綠森龍王'
                       || (window._wbIsBossName && window._wbIsBossName(boss.name)));
    if(!_isWbBoss) return rawDmg;
    opts = opts || {};
    // ★ v3.13.73 — 翠綠森龍王天賦「翠之意志」:完全免疫光屬性傷害(光攻擊歸 0)
    if(boss.name === '翠綠森龍王'){
      const _atkElem = (opts.action && (opts.action.element || opts.action.elem)) || opts.element || null;
      if(_atkElem === 'light'){
        try{ if(typeof log === 'function') log(`🌿 [${boss.name}] 翠之意志:免疫光屬性傷害!`); }catch(_){}
        try{ if(typeof bannerFX === 'function') bannerFX(boss, '🌿 免疫光屬性', '#88ee88', 600); }catch(_){}
        return 0;
      }
    }
    if(rawDmg <= 0) return rawDmg;

    // ★ v3.15.17 — 山岳地龍王弱點·畏毒:中毒/猛毒(poison tick 已算好固定值 1500/3000)
    //   繞過 5000 上限 + 強力減傷 + 護盾(中毒是擊敗牠最有效的手段)
    if(boss.name === '山岳地龍王' && opts.action && opts.action._dotBypassBossCap){
      return Math.max(1, rawDmg);
    }

    // ★ v3.12.6 — 單次傷害上限「固定 5000」,不隨滿血變動
    //   設計目的:HP 放大 10 倍但 cap 不放大,讓戰鬥時間拉長,容納更多玩家上陣
    const cap1pct = 5000;
    let dmg = Math.min(rawDmg, cap1pct);

    // ★ v3.15.17→v3.15.51 山岳地龍王天賦「山岳之意志」強力減傷:受到所有傷害(cap 後)再額外 -30%
    //   ★ v3.15.51(乙)由 -40% 對齊圖鑑文字 -30%(×0.60→×0.70);
    //   (護盾期間在 80% 減傷之上再減;中毒已於上方 _dotBypassBossCap 繞過,不受此減)
    if(boss.name === '山岳地龍王'){
      dmg = Math.max(1, Math.floor(dmg * 0.70));
    }

    // 2) ★ v3.11.5(2026-05-27) — 老師鐵則:護盾凌駕於一切「無視有利狀態」之上
    //   - 任何傷害(含無視有利、必中、固定值、聯手爆發 5000)只要有護盾在,都吃 80% 減傷
    //   - 移除舊版 opts.bypassShield 例外(原本給聯手爆發用,現在統一被擋)
    //   - 設計理念:單次傷害「永遠」鎖在 5000(無護盾) / 1000(有護盾),沒有任何例外
    //   ★ v3.13.73 例外:中毒/猛毒、草龍王燃燒「無視護盾」(opts.action._dotIgnoreShield)→ 跳過 80% 減傷,但仍受 5000 cap
    const _dotIgnoreShield = !!(opts && opts.action && opts.action._dotIgnoreShield);
    const _hasActiveShield = boss._wbShields && Object.values(boss._wbShields).some(v => v > 0);
    if(_hasActiveShield && !_dotIgnoreShield){
      // 護盾首次啟動提示(沿用既有 _wbShieldNotified 旗標)
      if(!boss._wbShieldNotified){
        boss._wbShieldNotified = true;
        setTimeout(_wbShowShieldHint, 200);
      }
      // 受傷減 80%(只剩 20%)
      dmg = Math.floor(dmg * 0.20);
    }

    // ★ v3.15.98 — 深淵海龍王弱點·畏冰:身上有冰凍(freeze)時,最終受傷 +30%(突破 5000/1000 上限);
    //   且冰封中每受擊 1 次回 1 能量(G.energy.p2,加速爆發·老師設計的雙刃);
    //   標記 boss._wbWasFrozen 供「解凍後免疫 1 回合」判定(於 BOSS 主行動 hook 結算)
    if(boss.name === '深淵海龍王' && boss.status && boss.status.some(function(s){ return s && s.type === 'freeze'; })){
      boss._wbWasFrozen = true;
      dmg = Math.floor(dmg * 1.30);
      try{
        var _Gice = (typeof window._wbGetG === 'function') ? window._wbGetG() : window.G;
        if(_Gice && _Gice.energy && typeof _Gice.energy.p2 === 'number'){
          _Gice.energy.p2 = Math.min(10, (_Gice.energy.p2 || 0) + 1);
          try{ if(typeof renderEnergyBars === 'function') renderEnergyBars(); }catch(_){}
          try{ if(typeof bannerFX === 'function') bannerFX(boss, '❄ 冰中吸能 +1', '#9ee', 600); }catch(_){}
        }
      }catch(_eIce){}
    }
    return Math.max(1, dmg);
  };

  function _wbShowShieldHint(){
    // 跳提示 modal,告訴玩家:護盾啟動,需破解
    if(document.getElementById('wb-shield-hint-modal')) return;
    // ★ v3.14.23 — 護盾提示改依「當前龍王」動態產生
    //   原本整段寫死維蘇威(火/風/土/暗,破盾水/土/草/光)→ 換成翠玉草(草草水光,破盾火火風暗)
    //   等其他龍王時會誤導玩家。改用 shieldElements/shieldLayers + 元素剋制表動態組字串。
    const _elNm    = { fire:'🔥火', water:'💧水', wind:'🌪風', earth:'⛰土', dark:'🌑暗', light:'☀光', grass:'🌿草' };
    const _breakOf = { fire:'water', wind:'earth', earth:'grass', grass:'fire', water:'wind', dark:'light', light:'dark' };
    const _shCfg   = (typeof window._wbGetCurrentBoss === 'function' && window._wbGetCurrentBoss()) || null;
    const _shBossNm = (_shCfg && _shCfg.name) || '世界 BOSS';
    const _shEls   = (_shCfg && Array.isArray(_shCfg.shieldElements) && _shCfg.shieldElements.length) ? _shCfg.shieldElements : ['fire','wind','earth','dark'];
    const _shLy    = (_shCfg && _shCfg.shieldLayers) || {};
    const _shieldListStr = _shEls.map(function(e){ const _n = (_shLy && _shLy[e]) || 1; return (_elNm[e]||e) + '盾' + (_n>1 ? '×'+_n : ''); }).join(' + ');
    const _breakListStr  = _shEls.map(function(e){ const _n = (_shLy && _shLy[e]) || 1; const _b = _breakOf[e]; return (_elNm[e]||e) + ' ← ' + (_elNm[_b]||_b) + (_n>1 ? '×'+_n : ''); }).join(' / ');
    const _breakElsStr   = _shEls.map(function(e){ return (_elNm[_breakOf[e]]||_breakOf[e]); }).filter(function(v,i,a){ return a.indexOf(v)===i; }).join(' / ');
    const _totalLayers   = _shEls.reduce(function(s,e){ return s + ((_shLy && _shLy[e]) || 1); }, 0);
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
          ⚠ 元素護盾啟動!
        </div>
        <div style="font-size:16px;color:#ffe;line-height:1.85;text-align:left;
          background:rgba(255,80,40,0.12);padding:14px 18px;border-radius:10px;
          border-left:4px solid rgba(255,120,80,0.7);margin-bottom:14px;">
          ${_shBossNm}身上浮現由<b>${_shieldListStr}</b>構成的護盾!
          <br><br>
          <b style="color:#ff8866;">護盾規則:</b><br>
          ・第 <b style="color:#ffaa66;">3 / 5 / 7 / 9</b> 回合各啟動一次(同時最多 <b>${_totalLayers} 層</b>)<br>
          ・<b style="color:#ff6644;">所有傷害一律減 80%</b>(必中、無視有利、固定值、DoT、聯手爆發都擋)<br>
          ・<b style="color:#ffcc66;">單次傷害永遠鎖在 5000 上限</b>(有護盾時實際扣血 ≤ 1000)<br>
          ・<b style="color:#aaffaa;">沒有任何技能能繞過護盾</b>(連聯手爆發 5000 也會被減為 1000)
        </div>
        <div style="font-size:15px;color:#ffd;line-height:1.85;text-align:left;
          background:rgba(60,180,255,0.12);padding:14px 18px;border-radius:10px;
          border-left:4px solid rgba(80,180,255,0.7);margin-bottom:18px;">
          <b style="color:#88ddff;">💡 破解方法:</b><br>
          使用對應屬性的攻擊各打 <b>1 次</b>,即可破除對應護盾:<br>
          ${_breakListStr}
          <br><br>
          <b style="color:#aaffaa;">🎯 戰術建議:</b><br>
          換上含剋制屬性(${_breakElsStr})的英雄陣容,
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
    // 12 秒後自動關閉(讓沒注意的玩家也能繼續)
    setTimeout(() => { try{ ov.remove(); }catch(_){} }, 12000);
  }
  // 暴露給外部呼叫
  window._wbShowShieldHint = _wbShowShieldHint;

  // ───────────────────────────────────────────────────────────────────
  // 7. 獎章定義 + 統計欄位 — 自動補進主程式既有 ALL_MEDALS / _medalStats
  // ───────────────────────────────────────────────────────────────────
  const WB_MEDALS = [
    { id:'wb_first_clear',      icon:'🌍', name:'首次討伐',  desc:'第一次參與並擊敗任何世界 BOSS',                  cat:'世界BOSS' },
    { id:'wb_yushan_kill',      icon:'🐉', name:'屠龍勇者',  desc:'擊敗火山炎龍王',                                 cat:'世界BOSS' },
    { id:'wb_yushan_speedrun',  icon:'⚡', name:'三分速通',  desc:'3 分鐘內擊敗火山炎龍王',                        cat:'世界BOSS' },
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
        // ★ v3.11.17(2026-05-28) — fetch UI 檔時帶上中央版本清單破快取參數,
        //   確保改版後玩家(尤其已裝 PWA)一定拿到新的 world-boss-ui.html。
        //   _lxpsFileSrc 不在時 fallback 為純檔名(向下相容)。
        const _wbUiSrc = (typeof window._lxpsFileSrc === 'function')
          ? window._lxpsFileSrc('world-boss-ui.html')
          : 'world-boss-ui.html';
        const resp = await fetch(_wbUiSrc, { cache: 'no-cache' });
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
      // ★ v3.12.14(2026-05-31)— 顯示「今日還有 X 場可以挑戰」
      //   呼叫 window._wbDailyLimit.canEnter() async 拿,先顯示 fallback,異步刷新
      let _remainingText = '';
      try{
        if(window._wbDailyLimit && typeof window._wbDailyLimit.canEnter === 'function'){
          // 同步先用 cache 算(getTodayCount 是 async,先 fallback)
          const _limit = (typeof window._wbDailyLimit.getLimit === 'function')
            ? window._wbDailyLimit.getLimit() : 2;
          _remainingText = ' ・ <span id="wb-remaining-today" style="color:#ffd966;font-weight:700;">' +
                           '今日還有 ' + _limit + ' 場可以挑戰(載入中…)' +
                           '</span>';
        }
      }catch(_){}
      banner.innerHTML =
        '<div class="wb-cf-row">' +
          '<span class="wb-cf-ico">⚔</span>' +
          '<div class="wb-cf-main">' +
            '<div class="wb-cf-title">挑戰開放中!</div>' +
            '<div class="wb-cf-sub">隨時可以開房間 / 加入房間 / 練習模式' + _remainingText + '</div>' +
            (st.message ? '<div class="wb-cf-msg">📢 ' + _escapeHtml(st.message) + '</div>' : '') +
          '</div>' +
        '</div>';
      // 異步刷新今日剩餘場次(管理員顯示無限,玩家顯示實際剩餘)
      try{
        if(window._wbDailyLimit && typeof window._wbDailyLimit.canEnter === 'function'){
          window._wbDailyLimit.canEnter().then(function(_r){
            const _el = document.getElementById('wb-remaining-today');
            if(!_el) return;
            if(_r && _r.isAdmin){
              _el.innerHTML = '今日場次:管理員不受限';
              _el.style.color = '#aaffcc';
            }else if(_r){
              const _remain = Math.max(0, (_r.limit || 2) - (_r.used || 0));
              if(_remain > 0){
                _el.innerHTML = '今日還有 <b style="color:#ffe066;font-size:1.1em;">' + _remain + '</b> 場可以挑戰';
                _el.style.color = '#ffd966';
              }else{
                _el.innerHTML = '⚠ 今日場次已用完,明天 08:00 重置';
                _el.style.color = '#ff8866';
              }
            }
          }).catch(function(e){ console.warn('[wb-remaining-today] async 讀取失敗', e); });
        }
      }catch(_){}
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
      // ★ v3.10.17(2026-05-26)— 新一輪開戰時同步清空排行榜
      //   原本只重置 HP,但排行榜仍留著上一輪的傷害紀錄/隊伍排名,造成新一輪「開戰瞬間就有人在榜上」的怪現象
      //   現在 HP + 排行榜同步重置,真正進入「乾淨的新一輪」
      if(st.ceasefire === true && newCeasefire === false){
        try{
          if(window._wbHpSync && typeof window._wbHpSync.resetHp === 'function'){
            // 從當前龍王(★ v3.14.20 動態,_wbGetCurrentBoss)拿滿血;後備維蘇威 10000000(★ v4.8.0)
            const _curBoss = (typeof window._wbGetCurrentBoss === 'function' && window._wbGetCurrentBoss())
                          || (window.WORLD_BOSS_LINEUP || [])[0];
            const _maxHp = (_curBoss && _curBoss.maxHp) || 10000000;
            const _bossId = (_curBoss && _curBoss.id) || 'vesuvius_fire_dragon';
            await window._wbHpSync.resetHp(_bossId, _maxHp);
            console.log('[WB-Admin] 開放新一輪 → BOSS HP 重置為滿血', _bossId, _maxHp);
            // ★ v3.10.17 — 同步清空該 BOSS 的排行榜(含 battleHistory / championStats / dmgSources)
            if(typeof window._wbHpSync.clearLeaderboard === 'function'){
              try{
                const _clearRes = await window._wbHpSync.clearLeaderboard(_bossId);
                console.log('[WB-Admin] 開放新一輪 → 排行榜已清空', _clearRes);
              }catch(eCl){
                console.warn('[WB-Admin] 清空排行榜失敗(仍繼續開放,管理員可後台手動清)', eCl);
              }
            }
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
      // ★ FIX 20260521(i) — 改呼叫統一 helper window._wbEnsureCtrlBarOnTop, 它會:
      //   1. 無條件 reparent (不再只限 parentNode === body)
      //   2. inline style 強制 z-index:2147483647 + position:fixed
      //   修原本「ctrl-bar 仍被世界 BOSS 主頁視覺覆蓋」的 iPad bug.
      try{
        if(typeof window._wbEnsureCtrlBarOnTop === 'function'){
          window._wbEnsureCtrlBarOnTop();
        }else{
          // fallback (一般不會走到, helper 在 world-boss-ui.html 載入後就暴露)
          const _bar = document.getElementById('ctrl-bar');
          if(_bar && _bar.parentNode === document.body){
            document.body.appendChild(_bar);
          }
        }
      }catch(_){}
      try{ _wbRefreshBlessingBanner(); }catch(_){}
      // ★ v3.2 — 進入後立即同步休戰狀態看板 + 開戰按鈕鎖
      try{ _wbSyncCeasefireBanner(); }catch(_){}
      try{ _wbSyncStartButtonGate(); }catch(_){}
      // ★ v3.12.13(2026-05-30) — 入口卡每日上限視覺鎖
      //   進入入口頁時立即檢查 canEnter(),若達上限就在 3 張卡(不含單人練習)上加灰階 + 🔒 徽章
      // ★ v3.12.15(2026-05-31) — 啟動 60 秒輪詢,防跨日 / 多分頁同步問題
      try{
        if(typeof window._wbApplyEntryGateLock === 'function'){
          window._wbApplyEntryGateLock();
        }
        if(typeof window._wbStartEntryGatePolling === 'function'){
          window._wbStartEntryGatePolling();
        }
      }catch(_){}
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
      _wbGameAlert('🌍 世界 BOSS 討伐戰功能即將開放,敬請期待!\n\n首發 BOSS:火山炎龍王 🐉');
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
        console.warn('[WB] HERO_DB 未就緒 — 火山炎龍王資料未掛載');
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

    // 取得當前 BOSS 的 maxHp(★ v3.14.20 動態當前龍王)
    const lineup = window.WORLD_BOSS_LINEUP || [];
    const curBoss = (typeof window._wbGetCurrentBoss === 'function' && window._wbGetCurrentBoss()) || lineup[0];
    const maxHp = (curBoss && curBoss.maxHp) || 10000000;

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
    // ★ v3.6.9 — BOSS 護盾啟動特效(老師指定:最後之盾.gif)
    shield: 'https://raw.githubusercontent.com/clarebox123jp-art/LXPSGAME/main/' + encodeURIComponent('最後之盾.gif'),
    // ★ v3.13.73 — 翠綠森龍王爆發/技能特效(老師指定:藤蔓攻擊.gif)
    burst_grass: 'https://raw.githubusercontent.com/clarebox123jp-art/LXPSGAME/main/' + encodeURIComponent('藤蔓攻擊.gif'),
    // ★ v3.15.17 — 山岳地龍王爆發「天動地裂」特效(老師指定:護盾碎石.gif)
    burst_earth: 'https://raw.githubusercontent.com/clarebox123jp-art/LXPSGAME/main/' + encodeURIComponent('護盾碎石.gif'),
    // ★ v3.15.98 — 深淵海龍王爆發「絕對零度·冰封終焉」特效(老師指定:冰椎爆裂.gif)
    burst_water: 'https://raw.githubusercontent.com/clarebox123jp-art/LXPSGAME/main/' + encodeURIComponent('冰椎爆裂.gif'),
    // ★ v4.29.0 — 風暴雷龍王(taifeng_wind_dragon)專屬「雷電/風」特效(全用現有英雄爆發技的 GIF)
    //   老師回報:風暴雷龍王 S1/S2 之前傳通用 key 's1'(=火雨.gif 火龍王特效)、爆發走 _wbPlayBurstAnimation
    //   (寫死播「火山炎龍王/天崩之炎」)→ 三招全顯示成火龍王的火特效與火爆發名稱。此處補三個雷電專屬 key:
    wind_s1:    'https://raw.githubusercontent.com/clarebox123jp-art/LXPSGAME/main/' + encodeURIComponent('迅雷不及掩耳的攻擊.gif'),  // S1 雷霆貫穿(單體雷擊·借鐵匠爆發 GIF)
    wind_s2:    'https://raw.githubusercontent.com/clarebox123jp-art/LXPSGAME/main/' + encodeURIComponent('龍捲風.gif'),               // S2 暴風肅清(全體暴風·借迴力鏢旋風 GIF)
    burst_wind: 'https://raw.githubusercontent.com/clarebox123jp-art/LXPSGAME/main/' + encodeURIComponent('雷雨.gif'),                // 爆發 雷神·萬雷殛世(對齊 hero_db.js BURST_GIF_DB v3.15.63)
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
        playBurstAnimation('火山炎龍王', '天崩之炎');
        return;
      }
      if(typeof _showBurstCutscene === 'function'){
        _showBurstCutscene('火山炎龍王', '天崩之炎');
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
  // 維蘇威護盾系統
  // ───────────────────────────────────────────────────────────────────
  // 在第 3 / 5 / 7 / 9 回合自動啟動護盾(已啟動過該階段就跳過)
  // 啟動時 4 個元素護盾各 1 層(已 ≥ 1 層的元素維持),被剋的屬性 -1 層
  //   剋制關係(用 ELEMENT_DB vs_adv 反查):
  //     火盾 → 被 water 屬性攻擊 -1
  //     風盾 → 被 earth 屬性攻擊 -1
  //     土盾 → 被 grass 屬性攻擊 -1
  //     暗盾 → 被 light 屬性攻擊 -1
  // ───────────────────────────────────────────────────────────────────
  // 護盾元素系統(7 元素池 + 個別 BOSS 指定)
  // ───────────────────────────────────────────────────────────────────
  // 設計理念:
  //   1. 全部 7 種候選元素:火/水/風/土/光/暗/草 (WB_SHIELD_ALL_ELEMENTS)
  //   2. 每隻 BOSS 在 WORLD_BOSS_LINEUP 內透過 shieldElements 指定自己的 4 個
  //      (火山炎龍王:火/風/土/暗;未來深淵海龍王:水/草/風/光 等)
  //   3. 屬性剋制用標準單向循環剋 + 光暗互剋
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
  // ★ 護盾觸發機制:依回合數觸發(第 3 / 5 / 7 / 9 回合,每元素各 1 層)
  //   每階段 4 個元素各 1 層 → 同時最多 4 層,整場累計最多 16 次破盾機會。
  //   在第 9 回合最後一次設盾、第 10 回合要打掉才不會被崩毀掩埋。
  //   _wbCheckShieldTrigger 由「BOSS 受傷時」與「startTurn 後」呼叫,
  //   內部判定「回合數命中 + 還沒觸發過該回合」才啟動。
  const WB_SHIELD_TRIGGERS = [
    { round: 3, label:'R3' },
    { round: 5, label:'R5' },
    { round: 7, label:'R7' },
    { round: 9, label:'R9' },
  ];

  // 取當前回合數(從主程式 G 讀)
  function _wbGetCurrentRound(){
    try{
      const G = (typeof window._wbGetG === 'function') ? window._wbGetG() : window.G;
      if(!G) return 1;
      return G.round || G.turn || 1;
    }catch(_){
      return 1;
    }
  }

  // 檢查並啟動護盾(每次 BOSS 受傷後 / 回合開始時呼叫)
  window._wbCheckShieldTrigger = function(boss){
    if(!boss) return null;
    boss._wbShieldHistory = boss._wbShieldHistory || {};
    const curRound = _wbGetCurrentRound();
    let triggered = null;
    for(const t of WB_SHIELD_TRIGGERS){
      // 命中該回合(curRound >= t.round)且還沒觸發過該階段
      if(curRound >= t.round && !boss._wbShieldHistory[t.label]){
        boss._wbShieldHistory[t.label] = true;
        triggered = t.label;
        // ★ v3.1.2 — 用 BOSS 自己的 shieldElements 初始化護盾
        //   從 WORLD_BOSS_LINEUP 找該 BOSS 的設定;若找不到,fallback 用 fire/water/wind/earth
        let myElements = ['fire','water','wind','earth'];
        let myLayers = null;   // ★ v3.13.73 — 個別 BOSS 可指定各元素起始層數(翠綠森龍王草盾×2)
        try{
          const lineup = window.WORLD_BOSS_LINEUP || [];
          const config = lineup.find(b => b.name === boss.name);
          if(config && Array.isArray(config.shieldElements) && config.shieldElements.length > 0){
            myElements = config.shieldElements;
          }
          if(config && config.shieldLayers && typeof config.shieldLayers === 'object'){
            myLayers = config.shieldLayers;
          }
        }catch(_){}
        // ★ v3.7.10 — 每個元素 1 層(節奏一致 + 4 次薄盾)
        //   邏輯:已有元素 >= 想要層數 則維持、不足則補到想要層數
        //   ★ v3.13.73 — 想要層數預設 1;若 BOSS 有 shieldLayers 設定則用設定值(翠綠森龍王草盾=2)
        //   配合 4 次階段(R3/R5/R7/R9) → 整場累計最多 16 次破盾機會
        //   ⚠ 護盾元素清單仍依新階段更新(boss._wbShieldElements),確保 UI 顯示正確
        boss._wbShields = boss._wbShields || {};
        myElements.forEach(el => {
          const _want = (myLayers && typeof myLayers[el] === 'number') ? myLayers[el] : 1;
          const _cur = boss._wbShields[el] || 0;
          boss._wbShields[el] = Math.max(_cur, _want);
        });
        // 同時記錄這次護盾的元素清單(給 UI 渲染用)
        boss._wbShieldElements = myElements.slice();
        // 只觸發最早未觸發的那個階段,避免一口氣補多階段
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
  //   參數 roundLabel:回合 label,例如 'R3'/'R5'/'R7'/'R9'(由 WB_SHIELD_TRIGGERS.label 傳入)
  window._wbShowShieldTriggerHint = function(roundLabel, boss){
    // 換掉舊版單次提示,改成每次都提示
    const old = document.getElementById('wb-shield-hint-modal');
    if(old) old.remove();

    // ════════════════════════════════════════════════════════════════
    // ★ v3.6.9 — BOSS 護盾啟動時播放特效 + 音效(老師指定:最後之盾.gif)
    // ────────────────────────────────────────────────────────────────
    // 特效:全螢幕「最後之盾」GIF,1.8 秒淡出 + 螢幕震動
    // 音效:守護音(sfx-guard,主音)+ 龍吼(sfx-wb-boss-skill,疊一層氣勢)
    // 走 _wbPlayFullscreenFx + playSfx 既有機制,跟 S1/S2 完全一致
    // ════════════════════════════════════════════════════════════════
    try{
      if(typeof window._wbPlayFullscreenFx === 'function'){
        window._wbPlayFullscreenFx('shield', { duration:1800, shake:true });
      }
    }catch(_){}
    try{ if(typeof playSfx === 'function') playSfx('sfx-guard', 0.9); }catch(_){}
    // 100ms 後疊一層龍吼,讓「龍王施放護盾」的氣勢更足
    try{
      setTimeout(function(){
        try{ if(typeof playSfx === 'function') playSfx('sfx-wb-boss-skill', 0.65); }catch(_){}
      }, 120);
    }catch(_){}

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

    // 把 'R3' / 'R5' / 'R7' / 'R9' 轉成「第 3 回合」等友善文案
    let _roundLabelText = roundLabel || '護盾階段';
    if(typeof roundLabel === 'string'){
      const _m = roundLabel.match(/^R(\d+)$/);
      if(_m) _roundLabelText = `第 ${_m[1]} 回合`;
    }

    ov.innerHTML = `
      <div style="max-width:560px;background:linear-gradient(160deg,#2a1818,#1a0a0a);
        border:3px solid rgba(255,120,80,0.85);border-radius:18px;padding:24px 22px;
        box-shadow:0 0 60px rgba(255,80,40,0.6);text-align:center;color:#ffeecc;">
        <div style="font-size:32px;margin-bottom:8px;letter-spacing:6px;">${iconRow}</div>
        <div style="font-size:24px;color:#ff8866;font-weight:900;letter-spacing:2px;margin-bottom:10px;
          text-shadow:0 0 14px rgba(255,100,60,0.6);">
          ⚠ ${_roundLabelText} — 元素護盾啟動!
        </div>
        <div style="font-size:15px;color:#ffe;line-height:1.85;text-align:left;
          background:rgba(255,80,40,0.12);padding:13px 16px;border-radius:10px;
          border-left:4px solid rgba(255,120,80,0.7);margin-bottom:12px;">
          ${bossName}身上浮現 <b style="color:#ff8866;">${elements.length} 種護盾各 1 層</b>:
          <br>
          ${ruleRows}
          <br><br>
          <b style="color:#ffcc66;">護盾期間所有傷害再減 80%</b>,
          即使「無視有利狀態」的攻擊也無法穿透。<br>
          打破對應屬性 1 層才能解除該盾。<br>
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
  //   答對累積 第5/10次 觸發答題獎勵(BOSS 受固定 5,000 傷害,選完獎勵後發動)
  //   倒下角色跳過答題
  //   回合 5 → BOSS 必放爆發 (第4回合警告) — v3.7.9 新增首次爆發點
  //   回合 10 → BOSS 必放爆發 (第9回合警告)
  //   回合 10 → 系統警告「戰場即將崩毀」
  //   回合 11 → BOSS 強制全員滅絕,結算
  //   ★ v3.5.70 — 玩家完整跑完 20 回合(每回合 1 題),最後一次(第 21 次)答題
  //                行動結束後,輪到 BOSS 時觸發崩毀。
  //   ★ v3.7.9(2026-05-25) — 配合 10 回合節奏壓縮,所有常數對應砍半:
  //                MAX_TURNS 21→11、BURST_TURN [10]→[5,10]、COLLAPSE_WARN_TURN 20→10、
  //                QUIZ_REWARD_TRIGGERS [10,25,50]→[5,10]
  // ───────────────────────────────────────────────────────────────────
  window._wbConstants = {
    MAX_TURNS: 11,                // ★ v3.7.9:崩毀觸發回合(玩家可完整跑完 1~10 回合)
    BURST_TURNS: [5, 10],         // ★ v3.7.9:BOSS 兩次強制爆發點(同時新增能量滿主動爆發)
    BURST_WARN_TURNS: [4, 9],     // ★ v3.7.9:對應警告回合
    COLLAPSE_WARN_TURN: 10,       // ★ v3.7.9:警告改在第 10 回合
    PUNISH_HP_PCT: 0.05,          // 答錯扣 5% 自己 max HP
    QUIZ_REWARD_DMG_PCT: 0.01,    // 答題獎勵 1% 傷害
    QUIZ_REWARD_TRIGGERS: [5, 10],// ★ v3.7.9:第幾次答對觸發
  };

  // ★ v3.14.24 — 每隻龍王專屬開戰咆哮(老師需求:每隻龍王要有自己的個性開場白)
  //   原本寫死維蘇威三句;改成依當前龍王挑,後備維蘇威。日後新增龍王在此加一筆。
  window._WB_BOSS_ROAR_LINES = {
    vesuvius_fire_dragon: [
      '⚡ 兩千年的沉睡終結...',
      '🔥 渺小的凡人們,竟敢驚擾我的安眠?',
      '🐉 維蘇威之怒,將再次掩埋人類的世界!',
    ],
    cuiyu_grass_dragon: [
      '🌿 誰...驚醒了沉睡的綠林之主?',
      '🍃 砍伐、焚燒...你們對這片雨林做了什麼?',
      '🐉 萬千翠藤甦醒——入侵者,都化作我藤蔓的養分吧!',
    ],
    shanyue_earth_dragon: [
      '⛰ 億萬年的沉眠...被誰撼動了?',
      '🪨 渺小的生靈,也想揻動這座山岳?',
      '🐉 山崩地裂——入侵者,化作我腳下的塵土吧!',
    ],
    // ★ v4.22.0 — 風暴雷龍王專屬開場咆哮(原本缺此筆 → 開場對白 fallback 成火龍王的 BUG)
    taifeng_wind_dragon: [
      '⚡ 是誰...喚醒了沉眠颱風眼的雷雲之龍?',
      '🌪 渺小的凡人,可聽得見這撼動天地的雷鳴?',
      '🐉 萬雷齊發——入侵者,在神雷之下化為焦土吧!',
    ],
  };
  // 每隻龍王咆哮主色(配合元素;後備火紅)
  window._WB_BOSS_ROAR_COLOR = {
    vesuvius_fire_dragon: { fg:'#ff8866', glow:'#ff3322' },
    cuiyu_grass_dragon:   { fg:'#9bf09b', glow:'#22aa44' },
    shanyue_earth_dragon: { fg:'#d9a866', glow:'#8a5a22' },
    taifeng_wind_dragon:  { fg:'#ffe680', glow:'#44ccbb' },   // ★ v4.22.0 — 雷金字 + 風青光暈
  };
  // BOSS 開戰咆哮
  window._wbBossOpeningRoar = function(){
    const _roarBid = (typeof window._wbGetCurrentBossId === 'function') ? window._wbGetCurrentBossId() : 'vesuvius_fire_dragon';
    const lines = (window._WB_BOSS_ROAR_LINES && window._WB_BOSS_ROAR_LINES[_roarBid]) || window._WB_BOSS_ROAR_LINES.vesuvius_fire_dragon;
    const _roarClr = (window._WB_BOSS_ROAR_COLOR && window._WB_BOSS_ROAR_COLOR[_roarBid]) || window._WB_BOSS_ROAR_COLOR.vesuvius_fire_dragon;
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
      <div id="wb-roar-text" style="font-size:clamp(22px,3vw,36px);font-weight:900;color:${_roarClr.fg};letter-spacing:6px;
        text-align:center;line-height:1.8;text-shadow:0 0 20px ${_roarClr.glow},0 0 40px ${_roarClr.glow},0 4px 8px rgba(0,0,0,0.95);
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
  //   (5) startTurn hook:第 10 回合強制 BOSS 爆發、第 21 回合滅絕
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
      desc: '來自地心的火山炎龍王降臨!4 位英雄聯手在 10 回合內擊敗牠,'
          + '善用元素相剋削減多層護盾,小心第 5 / 10 回合的天崩之炎爆發!',
      stars: 5,
      objectives: [
        '⚔ 4 位英雄共同作戰,10 回合內擊敗龍王',
        '🛡 用 4 種破盾元素削減 BOSS 護盾(第 3/5/7/9 回合啟動)',
        '💥 撐過第 5 / 10 回合的「天崩之炎」爆發技',
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

  // ════════════════════════════════════════════════════════════════════
  // ★ v3.4.6 — 房主端「題目顯示」即時廣播給所有 client
  // ────────────────────────────────────────────────────────────────────
  // 老師明確需求:「無論如何讓組隊世界 boss 戰能同步看到問題,那是這遊戲的核心」
  //
  // 用途:房主端 advShowQuiz() 抽完題、render 完選項後,立即把題目資料 push 給所有 client,
  //       讓 client 也彈出一模一樣的 quiz 視窗(攔截器會擋掉非指派槽位的提交)。
  //
  // 為什麼用獨立函式不走 _wbHostSyncG?
  //   - _wbHostSyncG 有節流(同 tick 合併),若先呼 quiz 再呼 endAction,
  //     quiz payload 可能被覆蓋導致 client 收不到。
  //   - 這個函式直接 push,不參與節流,確保 quiz payload 不丟。
  //
  // payload 結構:
  //   _wbQuizPayload = {
  //     question:    '題目文字',
  //     options:     [{text, isCorrect, letter}, ...],   // 已洗牌的 4 個選項
  //     label:       'quiz label 文字',                   // 房主 UI 顯示「BOSS 開戰挑戰題」等
  //     allowedSlot: 0~3 或 -1(開戰題=0, BOSS 行動前題依輪次, -1=不限),
  //     timestamp:   Date.now(),                          // client 端去重用
  //   }
  // ════════════════════════════════════════════════════════════════════
  window._wbHostBroadcastQuizShow = function(payload){
    try{
      if(!window._wbConnectedHostMode) return;
      if(!window._wbNet || typeof window._wbNet.hostPushBattleState !== 'function') return;
      if(!payload || !payload.question){
        console.warn('[WB-QuizSync] payload 缺 question,跳過');
        return;
      }
      const G = (typeof window._wbGetG === 'function') ? window._wbGetG() : window.G;
      let fullWireG = null;
      try{
        if(G && window._wbWireUtils && typeof window._wbWireUtils.GToWire === 'function'){
          fullWireG = window._wbWireUtils.GToWire(G);
        }
      }catch(_){}
      console.log('[WB-QuizSync] 廣播題目給 client',
        'question="' + payload.question.slice(0, 30) + '...",',
        'allowedSlot=' + payload.allowedSlot,
        ', label=' + (payload.label || '(none)'));
      window._wbNet.hostPushBattleState({
        fullWireG: fullWireG,
        _syncReason: 'quiz-show',
        _wbQuizPayload: payload,
        // ★ v3.5.69 — payload 同時帶 round 與 turn,確保 client 收到後能還原回合數
        turn: G ? (G.round || G.turn || 1) : 1,
        round: G ? (G.round || 1) : 1,
        currentActorIdx: G ? (G.currentActorIdx || 0) : 0,
        p1: G ? (G.p1 || []) : [],
        p2: G ? (G.p2 || []) : [],
        logEntries: [],
      });
    }catch(e){
      console.error('[WB-QuizSync] 廣播失敗', e);
    }
  };

  // ★ v3.4.6 — 房主端「題目關閉/結束」廣播(答完題或 skip 時)
  //   client 收到後主動關掉自己的 quiz 視窗
  window._wbHostBroadcastQuizClose = function(reason){
    try{
      if(!window._wbConnectedHostMode) return;
      if(!window._wbNet || typeof window._wbNet.hostPushBattleState !== 'function') return;
      const G = (typeof window._wbGetG === 'function') ? window._wbGetG() : window.G;
      let fullWireG = null;
      try{
        if(G && window._wbWireUtils && typeof window._wbWireUtils.GToWire === 'function'){
          fullWireG = window._wbWireUtils.GToWire(G);
        }
      }catch(_){}
      console.log('[WB-QuizSync] 廣播關題,reason=' + reason);
      window._wbNet.hostPushBattleState({
        fullWireG: fullWireG,
        _syncReason: 'quiz-close',
        _wbQuizCloseReason: reason || 'unknown',
        // ★ v3.5.69 — 同步補 round
        turn: G ? (G.round || G.turn || 1) : 1,
        round: G ? (G.round || 1) : 1,
        currentActorIdx: G ? (G.currentActorIdx || 0) : 0,
        p1: G ? (G.p1 || []) : [],
        p2: G ? (G.p2 || []) : [],
        logEntries: [],
      });
    }catch(e){
      console.error('[WB-QuizSync] 廣播關題失敗', e);
    }
  };

  // ─ 安裝 endAction sync hook ───────────────────────────────────
  function _wbInstallEndActionSyncHook(){
    if(typeof window.endAction !== 'function') return false;
    if(window._wbEndActionSyncPatched) return true;
    const _origEndAction = window.endAction;
    window.endAction = function(a, cost, noFinish){
      // ★ v3.5.69 — client mode 攔截:client 不該本機跑 endAction
      //   根因:iPad 切 app 回前台時觸發的 nudge / watchdog 自動救援會呼叫 endAction,
      //         client 端跑 endAction 會把 hero.acted=true 設下去,但 host 還在等 client 送 action,
      //         結果雙端狀態錯位:host 認為玩家還沒動、client 認為自己動完了 → 看門狗跳過回合
      //   守門:
      //     - _wbClientOptimistic=true 時放行(這是 _wbExecPlayerAction 內部樂觀更新流程)
      //     - 否則直接 return,等房主 sync 過來
      if(window._wbClientMode && !window._wbClientOptimistic){
        console.warn('[WB-Client v6] endAction 被擋(client mode 非樂觀更新),actor=',
                     a && a.name, 'cost=', cost, 'noFinish=', noFinish);
        return;
      }
      const ret = _origEndAction.apply(this, arguments);
      try{
        if(window._wbConnectedHostMode){
          window._wbHostSyncG('after_endAction');
        }
      }catch(e){ console.warn('[WB-Sync v6] endAction hook 例外', e); }
      // ════════════════════════════════════════════════════════════════
      // ★ v3.11.6(2026-05-27) — [E3] endAction 後檢查 11 回合崩毀
      // ────────────────────────────────────────────────────────────────
      // R12+ fallback(R11 BOSS turn 漏崩):startTurn hook 也許還沒跑,
      // endAction 結尾再檢查一次 → 雙保險。同樣 R12+ 才觸發,避免擋 R11 玩家行動。
      // ════════════════════════════════════════════════════════════════
      try{
        if(typeof _adventureStage !== 'undefined' && _adventureStage === 'worldboss'
           && !window._wbClientMode && !window._wbAdvBattleEnded){
          const _Ge = (typeof window._wbGetG === 'function') ? window._wbGetG() : window.G;
          const _re = (_Ge && _Ge.round) || 1;
          if(_re >= 12 && !window._wbCollapseDone
             && typeof window._wbForceCollapseAt11 === 'function'){
            console.log('[WB-Sync v6] R' + _re + ' 啟動 [E3] endAction 後崩毀守門');
            window._wbForceCollapseAt11('endAction-E3-round-' + _re);
          }
        }
      }catch(_eEndCollapse){ console.warn('[WB-Sync v6] endAction 崩毀守門例外', _eEndCollapse); }
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
      // ════════════════════════════════════════════════════════════════
      // ★ v3.11.6(2026-05-27) — [E2] [E5] startTurn 後檢查 11 回合崩毀
      // ────────────────────────────────────────────────────────────────
      // [E2] G.round >= 12 + 未崩毀 → 立即強制崩毀(fallback,理應 R11 BOSS turn 崩了)
      // [E5] G.round >= 13 → 終極 fallback(R12 還沒崩 = 完全漏接,絕對強制)
      //   設計理由:R11 「BOSS turn 才崩毀」是老師原始設計,留給玩家完整 R1~R10 行動。
      //             所以 [E2] 不應該搶在 R11 startTurn(玩家還沒行動)就觸發。
      //             改為 R12+ 才在 startTurn 觸發 = 「R11 BOSS turn 漏崩了 → R12 補崩」。
      //             [E5] R13 是最後底線:R12 startTurn 也漏,絕對強制。
      // ════════════════════════════════════════════════════════════════
      try{
        if(typeof _adventureStage !== 'undefined' && _adventureStage === 'worldboss'
           && !window._wbClientMode){
          const _G2 = (typeof window._wbGetG === 'function') ? window._wbGetG() : window.G;
          const _round = (_G2 && _G2.round) || 1;
          // [E5] 終極 fallback:13+ 回合無條件強制崩毀,即使旗標已 true 也再跑一次
          if(_round >= 13 && !window._wbAdvBattleEnded){
            console.warn('[WB-Sync v6] ⚠ R' + _round + ' 仍未結束 — 啟動 [E5] 終極崩毀 fallback');
            window._wbCollapseDone = false;  // 強制 reset,讓 _wbForceCollapseAt11 能跑
            if(typeof window._wbForceCollapseAt11 === 'function'){
              window._wbForceCollapseAt11('startTurn-E5-round-' + _round);
            }
          }
          // [E2] 12+ 回合且尚未崩毀 → 立即強制(R11 BOSS turn 漏接的補救)
          else if(_round >= 12 && !window._wbCollapseDone && !window._wbAdvBattleEnded){
            console.log('[WB-Sync v6] R' + _round + ' 啟動 [E2] startTurn 後崩毀守門');
            if(typeof window._wbForceCollapseAt11 === 'function'){
              window._wbForceCollapseAt11('startTurn-E2-round-' + _round);
            }
          }
        }
      }catch(_eCollapseGuard){ console.warn('[WB-Sync v6] 崩毀守門例外', _eCollapseGuard); }
      // ★ v3.7.10 — 護盾依回合數觸發(第 3/5/7/9 回合,每元素 1 層)
      //   在每次 startTurn 後檢查一次,讓即使該回合沒人打 BOSS 也會啟動護盾。
      //   只在房主端 / 練習模式跑(client 不該本機改 BOSS 狀態,等 host sync)。
      try{
        if(typeof _adventureStage !== 'undefined' && _adventureStage === 'worldboss'
           && !window._wbClientMode){
          const _G = (typeof window._wbGetG === 'function') ? window._wbGetG() : window.G;
          const _boss = _G && _G.p2 && _G.p2[0];
          if(_boss && window._wbIsBossName && window._wbIsBossName(_boss.name) && _boss.curHp > 0
             && typeof window._wbCheckShieldTrigger === 'function'){
            const _trig = window._wbCheckShieldTrigger(_boss);
            if(_trig && typeof window._wbShowShieldTriggerHint === 'function'){
              setTimeout(() => { try{ window._wbShowShieldTriggerHint(_trig, _boss); }catch(_){} }, 300);
              // 房主端要 sync 一次,讓 client 看到新護盾
              try{
                if(window._wbConnectedHostMode && typeof window._wbHostSyncG === 'function'){
                  setTimeout(() => { try{ window._wbHostSyncG('shield-trigger-by-round'); }catch(_){} }, 350);
                }
              }catch(_){}
            }
          }
        }
      }catch(_eRoundShield){ console.warn('[WB-Sync v6] 回合護盾檢查例外', _eRoundShield); }
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

            // ★ v3.5.1 — 等待 banner 顯示時追蹤「同一角色卡多久」
            //   若同一個 actor 顯示等待 banner 超過 30 秒 → 自動觸發 stuck_resync
            //   避免房主端寫入失敗(failed-precondition)+ client 收不到 sync 雙重故障時全場卡死
            const _bannerKey = (actor.side || 'p1') + ':' + pos + ':' + heroName;
            if(window._wbWaitBannerKey !== _bannerKey){
              // 換 actor 了 → reset 計時
              window._wbWaitBannerKey = _bannerKey;
              window._wbWaitBannerStartTs = Date.now();
              if(window._wbWaitBannerStuckTimer){
                clearTimeout(window._wbWaitBannerStuckTimer);
              }
              // 30 秒後若還在卡同一個 actor → 自動送 stuck_resync
              window._wbWaitBannerStuckTimer = setTimeout(function(){
                try{
                  const _curBanner = document.getElementById('_wb-wait-banner');
                  if(!_curBanner || _curBanner.style.display === 'none') return;
                  // 還在卡 → 觸發自動救援
                  if(window._wbWaitBannerKey === _bannerKey){
                    console.warn('[WB-UIGuard v6] 同一 actor 等待超過 30 秒,自動觸發 stuck_resync');
                    // 提示玩家
                    try{
                      _curBanner.innerHTML += '<div style="font-size:14px;color:#ffaa66;margin-top:8px;line-height:1.5;">' +
                        '⚠ 偵測到可能卡死,正在自動向房主請求重新同步...' +
                        '</div>';
                    }catch(_){}
                    if(window._wbNet && typeof window._wbNet.sendAction === 'function'){
                      window._wbNet.sendAction({
                        type: '_client_stuck_resync',
                        ts: Date.now(),
                        reason: 'wait_banner_30s',
                        actor: heroName
                      });
                    }
                    // 如果再卡 30 秒仍沒解,再送一次(總共最多 2 次)
                    window._wbWaitBannerStuckTimer = setTimeout(function(){
                      try{
                        if(window._wbWaitBannerKey === _bannerKey){
                          console.error('[WB-UIGuard v6] 第二次 stuck_resync 後仍卡同一 actor');
                          if(window._wbNet && typeof window._wbNet.sendAction === 'function'){
                            window._wbNet.sendAction({
                              type: '_client_stuck_resync',
                              ts: Date.now(),
                              reason: 'wait_banner_60s_second_attempt',
                              actor: heroName
                            });
                          }
                          // 提示玩家可以投降
                          try{
                            const _b2 = document.getElementById('_wb-wait-banner');
                            if(_b2){
                              _b2.innerHTML += '<div style="font-size:14px;color:#ff8888;margin-top:8px;line-height:1.5;">' +
                                '⛔ 自動修復失敗。建議點左下「卡死自救」按鈕或投降。' +
                                '</div>';
                            }
                          }catch(_){}
                        }
                      }catch(_){}
                    }, 30000);
                  }
                }catch(_eW){ console.warn('[WB-UIGuard v6] stuck timer 例外', _eW); }
              }, 30000);
            }
          }catch(_){}
        }else{
          // ── 是我操作:確保 banner 移除、item-panel 還原 ──
          try{
            const banner = document.getElementById('_wb-wait-banner');
            if(banner) banner.style.display = 'none';
            // ★ v3.5.1 — 清掉等待計時(換成我操作了)
            if(window._wbWaitBannerStuckTimer){
              clearTimeout(window._wbWaitBannerStuckTimer);
              window._wbWaitBannerStuckTimer = null;
            }
            window._wbWaitBannerKey = null;
            window._wbWaitBannerStartTs = 0;
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
          // ════════════════════════════════════════════════════════════════
          // ★ v3.11.6(2026-05-27) — [E4] aiAct hook 入口崩毀守門
          // ────────────────────────────────────────────────────────────────
          // BOSS 行動觸發前(可能在 quiz 之前)就先檢查 R11,讓 quiz 流程不會
          // 把崩毀拖過去。優先級高於 quiz 攔截,直接 return(不再跑後續邏輯)
          // ════════════════════════════════════════════════════════════════
          try{
            const _Ga = (typeof window._wbGetG === 'function') ? window._wbGetG() : window.G;
            const _ra = (_Ga && _Ga.round) || 1;
            if(_ra >= 11 && !window._wbCollapseDone && !window._wbAdvBattleEnded
               && typeof window._wbForceCollapseAt11 === 'function'){
              console.log('[WB-Adv aiAct hook] R' + _ra + ' 啟動 [E4] aiAct 入口崩毀守門');
              window._wbForceCollapseAt11('aiAct-E4-round-' + _ra);
              return;
            }
          }catch(_eE4){ console.warn('[WB-Adv aiAct hook] [E4] 守門例外', _eE4); }
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

  // BOSS 名單判斷 — ★ v3.13.73 泛化:認所有 WORLD_BOSS_LINEUP 龍王名(含翠綠森龍王)
  window._wbIsBossName = function(name){
    if(!name) return false;
    if(name === '火山炎龍王' || name === '翠綠森龍王') return true;
    try{ return (window.WORLD_BOSS_LINEUP || []).some(b => b && b.name === name); }catch(_){ return false; }
  };

  // ════════════════════════════════════════════════════════════════════
  // ★ v3.11.6(2026-05-27) — 11 回合崩毀「強制執行」整套重構
  // ────────────────────────────────────────────────────────────────────
  // 玩家回報:打到第 14 回合龍王戰還沒結束。log 顯示 R13/R14 BOSS turn 跑了
  // _wbAdvBossTurn 並進到 BOSS 爆發,但「💥 戰場崩毀」log 從未出現。
  //
  // 根因分析(舊版 v3.7.9 設計缺陷):
  //   (1) 僅在 _wbAdvBossTurn 入口檢查 G.round >= 11 + 旗標。BOSS turn 期間
  //       任何 race condition(玩家爆發插隊、quiz cb 把 boss.acted 先設 true、
  //       _realAiAct 因 a.curHp<=0 提前 return startTurn)都會「跳過崩毀」。
  //   (2) _wbCollapseTriggered 是「set then leave」型旗標 — 一旦跑了 alive.forEach
  //       但 alive=[](全員已死)或 doDmg 例外,旗標仍會被 set 成 true,後續永遠
  //       擋下崩毀重試。
  //   (3) 結算僅靠 _safeBossEndAction → endAction → checkWin 鏈,中間任何一環
  //       斷掉(例如 BOSS 因 host sync race 被另一處 endAction 過了)就完全失效。
  //
  // 新設計(v3.11.6):
  //   (A) 抽出獨立函式 _wbForceCollapseAt11(reason),任何路徑都能呼叫
  //   (B) 用「DONE 才算 done」的旗標 _wbCollapseDone(原 _wbCollapseTriggered 保留向後相容)
  //   (C) 在 5 個入口都加守門,任一觸發都會強制崩毀:
  //       [E1] _wbAdvBossTurn 入口(原本就有,沿用)
  //       [E2] startTurn hook 結尾 (G.round >= 11)
  //       [E3] endAction hook 結尾 (G.round >= 11 且某些情況下 startTurn 還沒被呼叫)
  //       [E4] aiAct hook(BOSS 行動前)
  //       [E5] 12+ 回合 fallback — 任何 startTurn 看到 round >= 12 都強制全滅,不容例外
  //   (D) 崩毀執行完 600ms 後強制呼叫 checkWin + 強制結算 fallback(若還沒結算)
  // ════════════════════════════════════════════════════════════════════
  window._wbForceCollapseAt11 = function(reason){
    try{
      // client mode 不主動觸發崩毀(等房主 sync)
      if(window._wbClientMode) return false;
      const G = (typeof window._wbGetG === "function") ? window._wbGetG() : window.G;
      if(!G || !G.p1 || !G.p2) return false;
      // 已經跑過且確實完成 → 不重跑
      if(window._wbCollapseDone === true) return false;
      // stage 守門
      if(typeof window._wbGetAdvStage === 'function' && window._wbGetAdvStage() !== 'worldboss') return false;
      // 戰鬥已結算 → 不再跑
      if(window._wbAdvBattleEnded === true) return false;

      // 找 BOSS
      const boss = G.p2.find(h => h && window._wbIsBossName && window._wbIsBossName(h.name));
      if(!boss){
        console.warn('[WB-Collapse v3.11.6] 找不到 BOSS,跳過崩毀');
        return false;
      }
      // BOSS 已死 → checkWin 已接管,不需崩毀
      if(boss.curHp <= 0){
        window._wbCollapseDone = true;
        window._wbCollapseTriggered = true;
        return false;
      }

      console.log('[WB-Collapse v3.11.6] 🔥 強制崩毀觸發,reason=' + (reason || 'unknown') + ', round=' + (G.round || 1));

      // 雙旗標標記
      window._wbCollapseTriggered = true;
      window._wbCollapseDone = true;

      // 音效
      try{ if(typeof playSfx === 'function') playSfx('sfx-wb-boss-skill', 0.7); }catch(_){}
      // log
      try{ if(typeof log === 'function') log('💥 戰場崩毀!火山炎龍王發動最終滅絕!'); }catch(_){}

      // 把全隊強制歸 0(包括「已 acted=true 還活著的」也要全滅)
      const allOnField = G.p1.filter(h => h);
      allOnField.forEach(t => {
        if(t.curHp <= 0) return;  // 已死的不重跑特效
        const _d = t.curHp;
        try{
          if(typeof doDmg === 'function'){
            doDmg(t, _d, { actor: boss, isSkill: true, fixedDmg: true, isAoe: true, ignoreBuffs: true, mustHit: true });
          }
        }catch(_){}
        // 雙保險:doDmg 跑完仍可能因為某些 buff 沒打死 → 強制清 0
        try{ t.curHp = 0; }catch(_){}
        try{ if(typeof renderCard === 'function') renderCard(t); }catch(_){}
      });

      // 動畫
      try{ if(typeof window._wbPlayBurstAnimation === 'function') window._wbPlayBurstAnimation(); }catch(_){}
      try{ if(typeof log === 'function') log('☠ 全員陣亡 — 戰場已被火山灰掩埋'); }catch(_){}

      // 房主端 sync 給 client(連線模式)
      try{
        if(window._wbConnectedHostMode && typeof window._wbHostSyncG === 'function'){
          window._wbHostSyncG('force-collapse-at-11');
        }
      }catch(_){}

      // 強制 BOSS endAction(避免 BOSS 卡在「未行動」狀態繼續走主程式 turn 推進)
      try{ _safeBossEndAction(boss); }catch(_){}

      // ★ 強制呼叫 checkWin 觸發結算
      try{
        if(typeof window.checkWin === 'function'){
          window.checkWin();
        }
      }catch(_){}

      // ★ 600ms 後 fallback:若 checkWin 沒成功觸發結算 → 直接呼叫 _wbShowAdvBattleResult(false)
      setTimeout(() => {
        try{
          if(!window._wbAdvBattleEnded){
            console.warn('[WB-Collapse v3.11.6] checkWin 沒觸發結算,fallback 直接呼叫 _wbShowAdvBattleResult(false)');
            window._wbAdvBattleEnded = true;
            if(typeof window._wbShowAdvBattleResult === 'function'){
              window._wbShowAdvBattleResult(false);
            }
          }
        }catch(eFb){ console.error('[WB-Collapse v3.11.6] fallback 結算例外', eFb); }
      }, 600);

      return true;
    }catch(eFc){
      console.error('[WB-Collapse v3.11.6] _wbForceCollapseAt11 例外', eFc);
      return false;
    }
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

    // ════════════════════════════════════════════════════════════════
    // ★ v3.12.7(2026-05-30) — BOSS 天賦:每回合 1 次主行動 + 1 次追擊普攻
    //   (舊版 v3.11.7 是「1 回合內跑 2 次完整 turn」,改設計後更可預期)
    // ────────────────────────────────────────────────────────────────
    // 設計:每回合 BOSS = 主行動(S1/S2/普攻/爆發,擇一) + 追擊普攻(固定)
    //   - 進入 _wbAdvBossTurn 時:若 _wbActionRound !== G.round → 新回合,reset count=0
    //   - count += 1
    //   - 主行動跑完 → _safeBossEndAction 判定:count===1 + 非爆發 → 排追擊普攻
    //     (走專用排程 _scheduleBossFollowup,跑 _wbAdvBossNormalAtk 不再進完整 turn)
    //   - 追擊普攻跑完 → 再進 _safeBossEndAction → count===2 → 真正 endAction
    //   - 爆發強制把 count 跳到 2(爆發已經夠強,不允許再追擊)
    //   - R11+ 不應該觸發,因為 [E1] 已搶先走崩毀
    // ════════════════════════════════════════════════════════════════
    const _curRoundForCount = G.round || 1;
    if(boss._wbActionRound !== _curRoundForCount){
      boss._wbActionRound = _curRoundForCount;
      boss._wbActionCount = 0;
    }
    boss._wbActionCount = (boss._wbActionCount || 0) + 1;
    try{ console.log('[WB-BossAct v3.12.7] R' + _curRoundForCount + ' 第 ' + boss._wbActionCount + ' 次行動(1=主行動 / 2=追擊普攻)'); }catch(_){}

    // ★ v3.13.73 — 翠綠森龍王天賦「翠之意志」:每回合(主行動時)吸取隊伍 2 點能量灌給自己
    //   p1(隊伍)-2、p2(BOSS,即爆發計量)+2;放在爆發檢查之前 → 吸來的能量當回合就計入爆發門檻
    if(boss.name === '翠綠森龍王' && boss._wbActionCount === 1){
      try{
        if(G.energy && typeof G.energy.p1 === 'number'){
          const _drain = Math.min(2, Math.max(0, G.energy.p1));
          if(_drain > 0){
            G.energy.p1 = Math.max(0, G.energy.p1 - _drain);
            G.energy.p2 = Math.min(10, (G.energy.p2 || 0) + _drain);
            try{ if(typeof log === 'function') log(`🌿 [${boss.name}] 翠之意志:吸取隊伍 ${_drain} 點能量據為己用!`); }catch(_){}
            try{ if(typeof bannerFX === 'function') bannerFX(boss, `🌿 吸能 +${_drain}`, '#88ee88', 800); }catch(_){}
            try{ if(typeof renderEnergyBars === 'function') renderEnergyBars(); }catch(_){}
          }
        }
      }catch(_eDrain){ console.warn('[WB] 翠綠森龍王 吸能量失敗', _eDrain); }
    }

    // ★ v3.15.98 — 深淵海龍王天賦(主行動時):
    //   (a) 冰層碎裂冷卻結算:免疫回合數遞減;若上回合被冰封、本回合已解凍 → 設「免疫冰凍 1 回合」
    //       (被冰封的那一回合 BOSS 會 skip 主行動、不進此 hook,故此處必為「解凍後」的回合)
    //   (b) 每回合隨機對 1 名對手「封技」2 回合 = seal(無法用技能) + _burstSeal(無法爆發)
    if(boss.name === '深淵海龍王' && boss._wbActionCount === 1){
      try{
        var _hasFzNow = (boss.status || []).some(function(s){ return s && s.type === 'freeze'; });
        if(boss._wbIceImmuneTurns && boss._wbIceImmuneTurns > 0){ boss._wbIceImmuneTurns--; }
        if(boss._wbWasFrozen && !_hasFzNow){
          boss._wbIceImmuneTurns = 1;
          boss._wbWasFrozen = false;
          try{ if(typeof log === 'function') log(`❄ [${boss.name}] 冰層碎裂,本回合免疫冰凍!`); }catch(_){}
          try{ if(typeof bannerFX === 'function') bannerFX(boss, '❄ 免疫冰凍', '#aef', 800); }catch(_){}
        }
      }catch(_eIceTrk){ console.warn('[WB] 海龍王冰凍追蹤失敗', _eIceTrk); }
      try{
        var _aliveSeal = G.p1.filter(function(h){ return h && h.curHp > 0; });
        if(_aliveSeal.length){
          var _ts = _aliveSeal[Math.floor(Math.random() * _aliveSeal.length)];
          if(typeof addStatus === 'function'){ addStatus(_ts, 'seal', 1); addStatus(_ts, '_burstSeal', 1); }
          try{ if(typeof bannerFX === 'function') bannerFX(_ts, '❄ 封技', '#6cf', 1000); }catch(_){}
          try{ if(typeof log === 'function') log(`❄ [${boss.name}] 深淵之意志·封技!封鎖 [${_ts.name}] 的技能與極限爆發 1 回合(仍可普攻/休息)!`); }catch(_){}
          try{ renderCard(_ts); }catch(_){}
        }
      }catch(_eSeal){ console.warn('[WB] 海龍王封技失敗', _eSeal); }
    }

    // ★ v3.11.6(2026-05-27) — [E1] BOSS turn 入口:R11+ 直接走 _wbForceCollapseAt11
    //   舊版用 inline 邏輯 + 單一旗標 _wbCollapseTriggered;v3.11.6 改用獨立函式 +
    //   多重保險,任何漏洞都會被別的入口接住(詳見 _wbForceCollapseAt11 的設計說明)
    if((G.round || 1) >= 11 && !window._wbCollapseDone){
      if(typeof window._wbForceCollapseAt11 === 'function'){
        window._wbForceCollapseAt11('_wbAdvBossTurn-entry');
      }
      return;
    }

    // ★ v3.7.9(2026-05-25) — BOSS 爆發三條件(任一成立即釋放):
    //   (1) 第 5 回合 → 強制爆發(老師需求:首次爆發點往前移配合 10 回合節奏)
    //   (2) 第 10 回合 → 強制爆發(老師需求:崩毀前最後一次大絕)
    //   (3) 平常 BOSS 能量(G.energy.p2)滿 10 → 釋放爆發,能量歸 0
    //   設計理由:
    //     - 主程式戰鬥引擎本來就會替 BOSS 累積 G.energy.p2(每回合 +1、被打 +1 等),
    //       但 v3.5.70 之前用「G.round===10 一次性旗標」蓋過能量機制,等於 BOSS 永遠不會
    //       主動消耗能量爆發 → 老師希望「BOSS 正常使用能量、發動技能跟爆發」
    //     - 改為「第 5/10 是保底強制爆發 + 能量滿也會主動爆」雙軌:
    //         * 第 5 + 第 10 = 2 次保底,即使能量不夠也會爆(配合崩毀節奏給玩家壓力)
    //         * 中間若 BOSS 能量先湊到滿,還會額外爆發(獎勵 BOSS 累積)
    //   旗標:_wbBurst5Used / _wbBurst10Used 分別追蹤兩個固定點,避免重複觸發
    //   舊版(<= v3.5.70):if((G.round||1) === 10 && !G._wbBurstUsed)
    G._wbBurst5Used  = G._wbBurst5Used  || false;
    G._wbBurst10Used = G._wbBurst10Used || false;
    const _curRound = G.round || 1;
    const _bossEnergy = (G.energy && typeof G.energy.p2 === 'number') ? G.energy.p2 : 0;

    let _shouldBurst = false;
    let _burstReason = '';
    if(_curRound === 5 && !G._wbBurst5Used){
      G._wbBurst5Used = true;
      _shouldBurst = true;
      _burstReason = 'R5 保底爆發';
    }else if(_curRound === 10 && !G._wbBurst10Used){
      G._wbBurst10Used = true;
      _shouldBurst = true;
      _burstReason = 'R10 保底爆發';
    }else if(_bossEnergy >= 10){
      _shouldBurst = true;
      _burstReason = '能量滿(' + _bossEnergy + '/10)主動爆發';
    }

    if(_shouldBurst){
      // 消耗 BOSS 能量(歸 0),讓爆發符合主程式戰鬥引擎的能量規則
      try{
        if(G.energy && typeof G.energy.p2 === 'number'){
          G.energy.p2 = 0;
        }
      }catch(_){}
      try{ console.log('[WB-BossAI v3.7.9] BOSS 爆發 — ' + _burstReason); }catch(_){}
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
    // ════════════════════════════════════════════════════════════════
    // ★ v3.12.7(2026-05-30) — 主行動結束後追加 1 次普通攻擊
    //   舊版 v3.11.7:第 1 次行動完不走 endAction,延 800ms 再呼叫 _wbAdvBossTurn(跑完整 turn,可能再放技能或爆發)
    //   新版 v3.12.7:第 1 次行動完不走 endAction,延 800ms 直接呼叫 _wbAdvBossNormalAtk(只追擊一個普攻)
    //   守門條件:
    //     - 計數 === 1(主行動剛跑完,還沒追擊)
    //     - 沒爆發(爆發 _wbAdvBossBurst 內會把計數設為 2,直接結束本回合)
    //     - G.round < 11(R11+ 應該已被 [E1] 崩毀守門攔下,保險還是擋一下)
    //     - BOSS 沒被插隊(_wbEndedThisTurn 已在上面擋)
    //   進入追擊普攻時 count 已經是 1,_wbAdvBossNormalAtk 跑完會再進 _safeBossEndAction,
    //   那時不會再排第二次追擊(只有 count===1 才會排),直接走 endAction 結束本回合。
    //   ※ 注意:這裡不再 +1,因為計數要在「進入 _wbAdvBossTurn 時 +1」才算完整 turn 的單位;
    //     追擊普攻只是「附加動作」,不算新一輪 turn,所以直接把 count 跳到 2 標記「已追擊」。
    // ════════════════════════════════════════════════════════════════
    try{
      const _G = (typeof window._wbGetG === "function") ? window._wbGetG() : window.G;
      const _round = (_G && _G.round) || 1;
      const _count = boss._wbActionCount || 0;
      // 只在世界 BOSS stage 跑(避免影響其他關卡)
      const _isWB = (typeof _adventureStage !== 'undefined' && _adventureStage === 'worldboss')
                    || (typeof window._wbGetAdvStage === 'function' && window._wbGetAdvStage() === 'worldboss');
      if(_isWB && _count === 1 && _round < 11 && boss.curHp > 0){
        try{ console.log('[WB-BossAct v3.12.7] 主行動結束,延 800ms 追擊普攻一次'); }catch(_){}
        try{ if(boss._wbBossTid){ clearTimeout(boss._wbBossTid); boss._wbBossTid = null; } }catch(_){}
        // 把 count 直接跳到 2 標記「本回合已排追擊」,避免追擊普攻跑完又被排第二次
        boss._wbActionCount = 2;
        boss._wbBossTid = setTimeout(() => {
          boss._wbBossTid = null;
          // 二次檢查:在 800ms 期間 BOSS 可能被打死或被插隊
          if(boss.curHp <= 0 || boss._wbEndedThisTurn === true){
            try{ console.log('[WB-BossAct v3.12.7] 追擊延遲到期但 BOSS 已死/被插隊,跳過'); }catch(_){}
            return;
          }
          // 再次檢查崩毀(R11+ 防穿透)
          if(((_G && _G.round) || 1) >= 11 && !window._wbCollapseDone){
            if(typeof window._wbForceCollapseAt11 === 'function'){
              window._wbForceCollapseAt11('boss-followup-R11-guard');
            }
            return;
          }
          // ★ 關鍵:直接呼叫普攻(不走完整 turn,不會放技能/爆發)
          //   ★ v3.15.0 — 追擊普攻(第 2 次行動)鎖定「當前 HP 最少」的玩家(老師需求,火/草龍王一致)
          try{ _wbAdvBossNormalAtk(boss, true); }catch(eA2){ console.error('[WB-BossAct v3.12.7] 追擊普攻例外', eA2); }
        }, 800);
        return;  // 不走 endAction(等追擊普攻跑完再 end)
      }
    }catch(_eContAction){ console.warn('[WB-BossAct v3.12.7] 追擊判定例外,走 fallback endAction', _eContAction); }

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

  // ════════════════════════════════════════════════════════════════════
  // ★ v3.13.73 — 翠綠森龍王專屬 AI(劇毒藤縛 / 萬刃落葉 / 翠龍·萬藤絞殺)
  //   ⚠ 設計註:引擎中真正會每跳扣血的 DoT 只有 poison(劇毒);bleed 狀態經查不會扣血。
  //     故「猛毒」「出血」皆以 poison 系統實作(_poisonAmt = 最大HP × 比例),
  //     狀態圖示都顯示「中毒」,但傷害正常、banner/log 文字分別寫「猛毒/出血/劇毒纏繞」。
  //     爆發的「猛毒+出血合體」用一個較強的 poison(_strong,18%/回合)代表(兩個 poison 不疊加)。
  // ════════════════════════════════════════════════════════════════════
  // S1:劇毒藤縛 — 拘束特技最高 1 名(禁動 2 回合)+ 猛毒 2 回合(每回合 -10% 最大HP)
  function _wbGrassBossS1(boss){
    const G = (typeof window._wbGetG === "function") ? window._wbGetG() : window.G;
    try{ if(typeof playSfx === 'function') playSfx('sfx-wb-boss-skill', 0.7); }catch(_){}
    try{ if(typeof window._wbPlayFullscreenFx === 'function') window._wbPlayFullscreenFx('burst_grass', {duration:1400, shake:true}); }catch(_){}
    const alive = G.p1.filter(h => h && h.curHp > 0);
    if(alive.length === 0){ _scheduleBossEnd(boss, 600); return; }
    // 選特技(sp)最高的 1 名
    let tgt = alive[0];
    alive.forEach(h => { if((h.sp || 0) > (tgt.sp || 0)) tgt = h; });
    try{
      if(typeof addStatus === 'function') addStatus(tgt, 'trap', 2);          // 禁動 2 回合
      // 猛毒(poison + _strong)→ 統一系統:每回合 -8% 最大HP、5 回合、無視護盾/減傷
      if(typeof addStatus === 'function'){
        addStatus(tgt, 'poison', 5);
        const _ps = (tgt.status || []).find(s => s.type === 'poison');
        if(_ps){ _ps._strong = true; _ps._actor = boss; }
      }
      try{ if(typeof bannerFX === 'function') bannerFX(tgt, '🌿 藤縛 + 猛毒', '#2a9858', 1100); }catch(_){}
      try{ if(typeof log === 'function') log(`🌿 翠綠森龍王「劇毒藤縛」!藤蔓纏住 [${tgt.name}]:禁動 2 回合 + 猛毒 5 回合(每回合 -8% 最大HP)!`); }catch(_){}
      try{ renderCard(tgt); }catch(_){}
    }catch(e){ console.warn('[WB] 翠綠森龍王 劇毒藤縛失敗', e); }
    _scheduleBossEnd(boss, 1200);
  }

  // S2:萬刃落葉 — 特技 150% 全體草屬性傷害 + 出血 2 回合(每回合 -10% 最大HP)
  function _wbGrassBossS2(boss){
    const G = (typeof window._wbGetG === "function") ? window._wbGetG() : window.G;
    try{ if(typeof playSfx === 'function') playSfx('sfx-wb-boss-skill', 0.7); }catch(_){}
    try{ if(typeof window._wbPlayFullscreenFx === 'function') window._wbPlayFullscreenFx('burst_grass', {duration:1500, shake:true}); }catch(_){}
    const alive = G.p1.filter(h => h && h.curHp > 0);
    const dmg = Math.floor((boss.sp || 50) * 1.50);
    alive.forEach(t => {
      try{
        if(typeof doDmg === 'function'){
          doDmg(t, dmg, { actor: boss, isSkill: true, isAoe: true, ignoreBuffs: true, hitBonus: 0.30, element: 'grass' });
        }else{ t.curHp = Math.max(0, t.curHp - dmg); }
      }catch(_){ t.curHp = Math.max(0, t.curHp - dmg); }
      if(t.curHp > 0){
        try{
          // 出血(bleed)→ 統一系統:每回合 -6% 最大HP、2 回合、受護盾/減傷、受擊再追加 6%
          if(typeof addStatus === 'function') addStatus(t, 'bleed', 2);
          try{ if(typeof bannerFX === 'function') bannerFX(t, '🩸 出血', '#cc2222', 700); }catch(_){}
        }catch(_){}
      }
      try{ renderCard(t); }catch(_){}
    });
    try{ if(typeof log === 'function') log(`🍃 翠綠森龍王「萬刃落葉」!特技 150% 全體草屬性傷害 -${dmg} HP,並使全體出血 2 回合(每回合 -6% 最大HP,受擊再追加)!`); }catch(_){}
    _scheduleBossEnd(boss, 1300);
  }

  // 爆發:翠龍·萬藤絞殺 — 特技 120% 全體草傷(無視有利)+ 全體強力劇毒纏繞 2 回合(-18%/回合)+ 隨機 2 名強力禁動 1 回合
  function _wbGrassBossBurst(boss){
    const G = (typeof window._wbGetG === "function") ? window._wbGetG() : window.G;
    try{ if(typeof playSfx === 'function') playSfx('sfx-wb-burst-grass', 0.95); }catch(_){}   // 草龍王爆發音效(齒輪or藤蔓.mp3)
    try{ if(typeof window._wbPlayFullscreenFx === 'function') window._wbPlayFullscreenFx('burst_grass', {duration:2200, shake:true}); }catch(_){}
    try{ boss._wbActionCount = 2; }catch(_){}   // ★ 爆發後不再追擊普攻
    try{ if(boss._wbBossTid) clearTimeout(boss._wbBossTid); }catch(_){}
    boss._wbBossTid = setTimeout(() => {
      boss._wbBossTid = null;
      if(boss._wbEndedThisTurn === true){ return; }
      if(boss.curHp <= 0){ boss._wbEndedThisTurn = true; return; }
      const alive = G.p1.filter(h => h && h.curHp > 0);
      const dmg = Math.floor((boss.sp || 50) * 1.20);
      alive.forEach(t => {
        try{
          if(typeof doDmg === 'function'){
            doDmg(t, dmg, { actor: boss, isSkill: true, isAoe: true, ignoreBuffs: true, ignoreEvasion: true, noReflect: true, noHalfDmg: true, element: 'grass' });
          }else{ t.curHp = Math.max(0, t.curHp - dmg); }
        }catch(_){ t.curHp = Math.max(0, t.curHp - dmg); }
        // 全體：猛毒(poison+_strong,-8%/回×5) + 強力出血(bleed+_strong,-9%/回×2 且受擊再追加 9%)雙 DoT 疊加
        if(t.curHp > 0){
          try{
            if(typeof addStatus === 'function'){
              addStatus(t, 'poison', 5);
              const _ps = (t.status || []).find(s => s.type === 'poison');
              if(_ps){ _ps._strong = true; _ps._actor = boss; }
              addStatus(t, 'bleed', 2);
              const _bs = (t.status || []).find(s => s.type === 'bleed');
              if(_bs){ _bs._strong = true; _bs._actor = boss; }
            }
            try{ if(typeof bannerFX === 'function') bannerFX(t, '🌿 猛毒+強力出血', '#1f7a45', 900); }catch(_){}
          }catch(_eP){ console.warn('[WB-GrassBurst] 猛毒/強力出血附加失敗', _eP); }
        }
        try{ renderCard(t); }catch(_){}
      });
      // 隨機 2 名強力禁動 1 回合
      try{
        const _survivors = G.p1.filter(h => h && h.curHp > 0);
        const _picked = _survivors.slice().sort(() => Math.random() - 0.5).slice(0, 2);
        _picked.forEach(t => {
          try{
            if(typeof addStatus === 'function'){
              addStatus(t, 'trap', 1);
              const _ts = (t.status || []).find(s => s.type === 'trap');
              if(_ts){ _ts._strong = true; }
            }
            try{ if(typeof bannerFX === 'function') bannerFX(t, '🌿 強力禁動', '#1f7a45', 900); }catch(_){}
            try{ renderCard(t); }catch(_){}
          }catch(_){}
        });
      }catch(_eT){ console.warn('[WB-GrassBurst] 強力禁動失敗', _eT); }
      try{ if(typeof log === 'function'){ log('⚡ 翠綠森龍王爆發「翠龍·萬藤絞殺」!特技 120% 全體草傷 + 全體猛毒(5回,-8%/回) + 強力出血(2回,-9%/回且受擊追加)'); log('🌿 隨機 2 名英雄被強力藤蔓「禁動」1 回合!'); } }catch(_){}
      try{ if(typeof flashScreen === 'function') flashScreen('rgba(40,160,80,0.75)', 700); }catch(_){}
      _scheduleBossEnd(boss, 1800);
    }, 2200);
  }

  // ════════════════════════════════════════════════════════════════════
  // ★ v3.15.17 — 山岳地龍王專屬 AI(山崩落石 / 震天龍吼 / 天動地裂)
  //   主軸:強力暈眩。傷害走 doDmg → _wbApplyBossDmgCap(對玩家無 cap;玩家受傷正常)。
  //   ⚠ 暈眩/易傷的「強力版」沿用引擎 _strong 慣例(對齊草龍王 trap/poison/bleed)。
  // ════════════════════════════════════════════════════════════════════
  // S1:山崩落石 — 特技 150% 全體土屬性傷害 + 全體 60% 機率暈眩 1 回合
  function _wbEarthBossS1(boss){
    const G = (typeof window._wbGetG === "function") ? window._wbGetG() : window.G;
    try{ if(typeof playSfx === 'function') playSfx('sfx-wb-boss-skill', 0.7); }catch(_){}
    try{ if(typeof window._wbPlayFullscreenFx === 'function') window._wbPlayFullscreenFx('burst_earth', {duration:1500, shake:true}); }catch(_){}
    const alive = G.p1.filter(h => h && h.curHp > 0);
    const dmg = Math.floor((boss.sp || 50) * 1.50);
    alive.forEach(t => {
      try{
        if(typeof doDmg === 'function'){
          doDmg(t, dmg, { actor: boss, isSkill: true, isAoe: true, hitBonus: 0.30, element: 'earth' });
        }else{ t.curHp = Math.max(0, t.curHp - dmg); }
      }catch(_){ t.curHp = Math.max(0, t.curHp - dmg); }
      if(t.curHp > 0 && Math.random() < 0.60){
        try{ if(typeof addStatus === 'function') addStatus(t, 'stun', 1); }catch(_){}
        try{ if(typeof bannerFX === 'function') bannerFX(t, '💫 暈眩', '#d9a866', 700); }catch(_){}
      }
      try{ renderCard(t); }catch(_){}
    });
    try{ if(typeof log === 'function') log(`⛰ 山岳地龍王「山崩落石」!特技 150% 全體土屬性傷害 -${dmg} HP,60% 機率暈眩 1 回合!`); }catch(_){}
    _scheduleBossEnd(boss, 1300);
  }

  // S2:震天龍吼 — 特技 75% 全體無屬性傷害 + 全體強力暈眩 1 回合
  function _wbEarthBossS2(boss){
    const G = (typeof window._wbGetG === "function") ? window._wbGetG() : window.G;
    try{ if(typeof playSfx === 'function') playSfx('sfx-wb-boss-skill', 0.7); }catch(_){}
    try{ if(typeof window._wbPlayFullscreenFx === 'function') window._wbPlayFullscreenFx('s2', {duration:1400, shake:true}); }catch(_){}
    const alive = G.p1.filter(h => h && h.curHp > 0);
    const dmg = Math.floor((boss.sp || 50) * 0.75);
    alive.forEach(t => {
      try{
        if(typeof doDmg === 'function'){
          doDmg(t, dmg, { actor: boss, isSkill: true, isAoe: true, hitBonus: 0.30, element: 'none' });
        }else{ t.curHp = Math.max(0, t.curHp - dmg); }
      }catch(_){ t.curHp = Math.max(0, t.curHp - dmg); }
      if(t.curHp > 0){
        try{
          if(typeof addStatus === 'function'){
            addStatus(t, 'stun', 1);
            const _ss = (t.status || []).find(s => s.type === 'stun');
            if(_ss){ _ss._strong = true; }
          }
        }catch(_){}
        try{ if(typeof bannerFX === 'function') bannerFX(t, '💫 強力暈眩', '#8a5a22', 800); }catch(_){}
      }
      try{ renderCard(t); }catch(_){}
    });
    try{ if(typeof log === 'function') log(`🐉 山岳地龍王「震天龍吼」!特技 75% 全體無屬性傷害 -${dmg} HP,全體強力暈眩 1 回合!`); }catch(_){}
    _scheduleBossEnd(boss, 1300);
  }

  // 爆發:天動地裂 — 特技 180% 全體土傷(無視有利)+ 隨機 2 名強力暈眩 1 回合 + 隨機 1 名強力易傷 2 回合
  function _wbEarthBossBurst(boss){
    const G = (typeof window._wbGetG === "function") ? window._wbGetG() : window.G;
    // ★ v3.15.17 — 爆發音效「地震 + 爆炸」疊放(老師指定)
    try{ if(typeof playSfx === 'function'){ playSfx('sfx-earthquake', 0.95); playSfx('sfx-explode', 0.85); } }catch(_){}
    try{ if(typeof window._wbPlayFullscreenFx === 'function') window._wbPlayFullscreenFx('burst_earth', {duration:2200, shake:true}); }catch(_){}
    try{ boss._wbActionCount = 2; }catch(_){}   // ★ 爆發後不再追擊普攻
    try{ if(boss._wbBossTid) clearTimeout(boss._wbBossTid); }catch(_){}
    boss._wbBossTid = setTimeout(() => {
      boss._wbBossTid = null;
      if(boss._wbEndedThisTurn === true){ return; }
      if(boss.curHp <= 0){ boss._wbEndedThisTurn = true; return; }
      const alive = G.p1.filter(h => h && h.curHp > 0);
      const dmg = Math.floor((boss.sp || 50) * 1.80);
      alive.forEach(t => {
        try{
          if(typeof doDmg === 'function'){
            doDmg(t, dmg, { actor: boss, isSkill: true, isAoe: true, ignoreBuffs: true, ignoreEvasion: true, noReflect: true, noHalfDmg: true, piercing: true, element: 'earth' });
          }else{ t.curHp = Math.max(0, t.curHp - dmg); }
        }catch(_){ t.curHp = Math.max(0, t.curHp - dmg); }
        try{ renderCard(t); }catch(_){}
      });
      // 隨機 2 名強力暈眩 1 回合
      try{
        const _survivors = G.p1.filter(h => h && h.curHp > 0);
        const _picked = _survivors.slice().sort(() => Math.random() - 0.5).slice(0, 2);
        _picked.forEach(t => {
          try{
            if(typeof addStatus === 'function'){
              addStatus(t, 'stun', 1);
              const _ss = (t.status || []).find(s => s.type === 'stun');
              if(_ss){ _ss._strong = true; }
            }
            try{ if(typeof bannerFX === 'function') bannerFX(t, '💫 強力暈眩', '#8a5a22', 900); }catch(_){}
            try{ renderCard(t); }catch(_){}
          }catch(_){}
        });
      }catch(_eS){ console.warn('[WB-EarthBurst] 強力暈眩失敗', _eS); }
      // 隨機 1 名強力易傷 2 回合
      try{
        const _survivors2 = G.p1.filter(h => h && h.curHp > 0);
        if(_survivors2.length){
          const _vt = _survivors2[Math.floor(Math.random() * _survivors2.length)];
          if(typeof addStatus === 'function'){
            addStatus(_vt, 'dmgVuln', 2);
            const _vs = (_vt.status || []).find(s => s.type === 'dmgVuln');
            if(_vs){ _vs._strong = true; }
          }
          try{ if(typeof bannerFX === 'function') bannerFX(_vt, '💔 強力易傷', '#ff6644', 900); }catch(_){}
          try{ renderCard(_vt); }catch(_){}
        }
      }catch(_eV){ console.warn('[WB-EarthBurst] 強力易傷失敗', _eV); }
      try{ if(typeof log === 'function'){ log('⚡ 山岳地龍王爆發「天動地裂」!特技 180% 全體土屬性傷害(無視有利)!'); log('🪨 隨機 2 名英雄被巨岩壓制「強力暈眩」1 回合,1 名陷入「強力易傷」2 回合!'); } }catch(_){}
      try{ if(typeof flashScreen === 'function') flashScreen('rgba(180,120,60,0.75)', 700); }catch(_){}
      _scheduleBossEnd(boss, 1800);
    }, 2200);
  }

  // ════════════════════════════════════════════════════════════════════
  // ★ v3.15.98 — 深淵海龍王專屬 AI(絕對零度 / 萬丈寒淵 / 絕對零度·冰封終焉)
  //   主軸:冰凍 CC + 招牌封技(天賦每回合 + 爆發全體)。傷害走 doDmg → cap5000。
  //   ⚠ 封技 = seal(無法用技能) + _burstSeal(無法爆發)組合(老師①甲:零引擎風險)。
  //   ⚠ 對玩家施加的冰凍正常(1~2 回合);海龍王自己被冰凍的 dur 壓制在 index.html addStatus。
  // ════════════════════════════════════════════════════════════════════
  // S1:絕對零度 — 特技 130% 全體水屬性傷害 + 全體 50% 機率冰凍 1 回合
  function _wbWaterBossS1(boss){
    const G = (typeof window._wbGetG === "function") ? window._wbGetG() : window.G;
    try{ if(typeof playSfx === 'function') playSfx('sfx-wb-boss-skill', 0.7); }catch(_){}
    // ★ v4.29.0 — 特效改冰系 'burst_water'(原 's1'=火雨.gif 火龍王特效·但本招「絕對零度」是冰凍系)
    try{ if(typeof window._wbPlayFullscreenFx === 'function') window._wbPlayFullscreenFx('burst_water', {duration:1500, shake:true}); }catch(_){}
    const alive = G.p1.filter(h => h && h.curHp > 0);
    const dmg = Math.floor((boss.sp || 50) * 1.30);
    alive.forEach(t => {
      try{
        if(typeof doDmg === 'function'){
          doDmg(t, dmg, { actor: boss, isSkill: true, isAoe: true, hitBonus: 0.30, element: 'water' });
        }else{ t.curHp = Math.max(0, t.curHp - dmg); }
      }catch(_){ t.curHp = Math.max(0, t.curHp - dmg); }
      if(t.curHp > 0 && Math.random() < 0.50){
        try{ if(typeof addStatus === 'function') addStatus(t, 'freeze', 1); }catch(_){}
        try{ if(typeof bannerFX === 'function') bannerFX(t, '❄ 冰凍', '#88ddff', 700); }catch(_){}
      }
      try{ renderCard(t); }catch(_){}
    });
    try{ if(typeof log === 'function') log(`❄ 深淵海龍王「絕對零度」!特技 130% 全體水屬性傷害 -${dmg} HP,50% 機率冰凍 1 回合!`); }catch(_){}
    _scheduleBossEnd(boss, 1300);
  }

  // S2:萬丈寒淵 — 特技 150% 全體水屬性傷害 + 隨機 2 名強力冰凍 2 回合
  function _wbWaterBossS2(boss){
    const G = (typeof window._wbGetG === "function") ? window._wbGetG() : window.G;
    try{ if(typeof playSfx === 'function') playSfx('sfx-wb-boss-skill', 0.7); }catch(_){}
    try{ if(typeof window._wbPlayFullscreenFx === 'function') window._wbPlayFullscreenFx('s2', {duration:1500, shake:true}); }catch(_){}
    const alive = G.p1.filter(h => h && h.curHp > 0);
    const dmg = Math.floor((boss.sp || 50) * 1.50);
    alive.forEach(t => {
      try{
        if(typeof doDmg === 'function'){
          doDmg(t, dmg, { actor: boss, isSkill: true, isAoe: true, hitBonus: 0.30, element: 'water' });
        }else{ t.curHp = Math.max(0, t.curHp - dmg); }
      }catch(_){ t.curHp = Math.max(0, t.curHp - dmg); }
      try{ renderCard(t); }catch(_){}
    });
    try{
      const _survivors = G.p1.filter(h => h && h.curHp > 0);
      const _picked = _survivors.slice().sort(() => Math.random() - 0.5).slice(0, 2);
      _picked.forEach(t => {
        try{
          if(typeof addStatus === 'function'){
            addStatus(t, 'freeze', 2);
            const _fs = (t.status || []).find(s => s.type === 'freeze');
            if(_fs){ _fs._strong = true; }
          }
          try{ if(typeof bannerFX === 'function') bannerFX(t, '❄ 強力冰凍', '#6cc8ff', 900); }catch(_){}
          try{ renderCard(t); }catch(_){}
        }catch(_){}
      });
    }catch(_eF){ console.warn('[WB] 海龍王 萬丈寒淵 強力冰凍失敗', _eF); }
    try{ if(typeof log === 'function') log(`🌊 深淵海龍王「萬丈寒淵」!特技 150% 全體水屬性傷害 -${dmg} HP,隨機 2 名強力冰凍 2 回合!`); }catch(_){}
    _scheduleBossEnd(boss, 1300);
  }

  // 爆發:絕對零度·冰封終焉 — 特技 150% 全體水傷(無視有利)+ 全體冰凍 1 回合 + 隨機 1 名強力冰凍 2 回合 + 全體封技 1 回合
  function _wbWaterBossBurst(boss){
    const G = (typeof window._wbGetG === "function") ? window._wbGetG() : window.G;
    // ★ v3.15.98 — 爆發音效:結冰(sfx-ice1)鋪底 + 260ms 後碎冰爆破(sfx-burst),呼應「冰椎爆裂」
    try{ if(typeof playSfx === 'function'){ playSfx('sfx-ice1', 0.85); setTimeout(function(){ try{ playSfx('sfx-burst', 0.9); }catch(_){} }, 260); } }catch(_){}
    try{ if(typeof window._wbPlayFullscreenFx === 'function') window._wbPlayFullscreenFx('burst_water', {duration:2200, shake:true}); }catch(_){}
    try{ boss._wbActionCount = 2; }catch(_){}   // ★ 爆發後不再追擊普攻
    try{ if(boss._wbBossTid) clearTimeout(boss._wbBossTid); }catch(_){}
    boss._wbBossTid = setTimeout(() => {
      boss._wbBossTid = null;
      if(boss._wbEndedThisTurn === true){ return; }
      if(boss.curHp <= 0){ boss._wbEndedThisTurn = true; return; }
      const alive = G.p1.filter(h => h && h.curHp > 0);
      const dmg = Math.floor((boss.sp || 50) * 1.50);
      alive.forEach(t => {
        try{
          if(typeof doDmg === 'function'){
            doDmg(t, dmg, { actor: boss, isSkill: true, isAoe: true, ignoreBuffs: true, ignoreEvasion: true, noReflect: true, noHalfDmg: true, element: 'water' });
          }else{ t.curHp = Math.max(0, t.curHp - dmg); }
        }catch(_){ t.curHp = Math.max(0, t.curHp - dmg); }
        // 全體冰凍 1 回合 + 全體封技 1 回合(seal + _burstSeal)
        if(t.curHp > 0){
          try{
            if(typeof addStatus === 'function'){
              addStatus(t, 'freeze', 1);
              addStatus(t, 'seal', 1);
              addStatus(t, '_burstSeal', 1);
            }
            try{ if(typeof bannerFX === 'function') bannerFX(t, '❄ 冰凍+封技', '#7cd8ff', 900); }catch(_){}
          }catch(_){}
        }
        try{ renderCard(t); }catch(_){}
      });
      // 隨機 1 名強力冰凍 2 回合
      try{
        const _survivors = G.p1.filter(h => h && h.curHp > 0);
        if(_survivors.length){
          const _t = _survivors[Math.floor(Math.random() * _survivors.length)];
          if(typeof addStatus === 'function'){
            addStatus(_t, 'freeze', 2);
            const _fs = (_t.status || []).find(s => s.type === 'freeze');
            if(_fs){ _fs._strong = true; }
          }
          try{ if(typeof bannerFX === 'function') bannerFX(_t, '❄ 強力冰凍', '#6cc8ff', 900); }catch(_){}
          try{ renderCard(_t); }catch(_){}
        }
      }catch(_eFb){ console.warn('[WB] 海龍王爆發 強力冰凍失敗', _eFb); }
      try{ if(typeof log === 'function'){ log('⚡ 深淵海龍王爆發「絕對零度·冰封終焉」!特技 150% 全體水屬性傷害(無視有利)!'); log('❄ 全體冰凍 1 回合 + 全體封技 1 回合(無法用技能/爆發),隨機 1 名強力冰凍 2 回合!'); } }catch(_){}
      try{ if(typeof flashScreen === 'function') flashScreen('rgba(80,180,255,0.7)', 700); }catch(_){}
      _scheduleBossEnd(boss, 1800);
    }, 2200);
  }

  // ═══════════════════════════════════════════════════════════════════
  // ★ v4.22.0 — 風暴雷龍王(taifeng_wind_dragon)專屬 AI
  //   原本三個 dispatcher(_wbAdvBossS1/S2/Burst)只有草/地/水龍王有專屬分支,
  //   風暴雷龍王沒有 → 落到「預設分支」= 火龍王的業火灼燒/龍吼震懾/天崩之炎,
  //   導致老師回報「雷龍王技能都是火龍王的」。此處補上雷龍王的戰鬥實作,
  //   對齊 HERO_DB/BURST_DB[風暴雷龍王] 的文案(雷霆貫穿/暴風肅清/雷神·萬雷殛世)。
  //   麻痺 = 遊戲既有 status type 'para'(完全無法行動);風屬性 element:'wind'。
  // ═══════════════════════════════════════════════════════════════════
  // 「解除自身所有不利狀態」helper(中毒/麻痺/暈眩/降速/冰凍/燃燒等一律清除)
  //   BAD_STATUS 是 index.html 頂層 const(未掛 window),此處優先讀 window.BAD_STATUS,
  //   讀不到才用內建 fallback 清單(涵蓋常見不利;漏收保守可接受)。
  function _wbWindClearBossDebuffs(boss){
    try{
      const _BADS = (typeof window !== 'undefined' && Array.isArray(window.BAD_STATUS) && window.BAD_STATUS.length)
        ? window.BAD_STATUS
        : ['stun','freeze','sleep','para','trap','seal','noatk','forecast','spddown',
           'hellfire','poison','bleed','noheal_curse','berserk','exhaust','deathmark',
           'confused','dmgVuln','healReduced','weakened','charm','breakDef','detain',
           'imprison','_burstSeal','_traitSeal'];
      if(boss && Array.isArray(boss.status) && boss.status.length){
        boss.status = boss.status.filter(function(s){ return s && _BADS.indexOf(s.type) === -1; });
      }
      try{ if(typeof renderCard === 'function') renderCard(boss); }catch(_){}
    }catch(_){}
  }

  // S1:雷霆貫穿 — 特技 150% 對「特技最高的 1 名對手」風屬性傷害 + 麻痺 2 回合
  function _wbWindBossS1(boss){
    const G = (typeof window._wbGetG === "function") ? window._wbGetG() : window.G;
    try{ if(typeof playSfx === 'function') playSfx('sfx-wb-boss-skill', 0.7); }catch(_){}
    // ★ v4.29.0 — 特效改雷電專屬 'wind_s1'(原 's1'=火雨.gif 火龍王特效·老師回報)
    try{ if(typeof window._wbPlayFullscreenFx === 'function') window._wbPlayFullscreenFx('wind_s1', {duration:1500, shake:true}); }catch(_){}
    const alive = G.p1.filter(h => h && h.curHp > 0);
    // 特技最高的 1 名對手(平手取先出現者)
    let _tgt = null;
    alive.forEach(function(h){ if(!_tgt || (h.sp||0) > (_tgt.sp||0)) _tgt = h; });
    const dmg = Math.floor((boss.sp || 45) * 1.50);
    if(_tgt){
      try{
        if(typeof doDmg === 'function'){
          doDmg(_tgt, dmg, { actor: boss, isSkill: true, hitBonus: 0.30, element: 'wind' });
        }else{ _tgt.curHp = Math.max(0, _tgt.curHp - dmg); }
      }catch(_){ _tgt.curHp = Math.max(0, _tgt.curHp - dmg); }
      if(_tgt.curHp > 0){
        try{ if(typeof addStatus === 'function') addStatus(_tgt, 'para', 2); }catch(_){}
        try{ if(typeof bannerFX === 'function') bannerFX(_tgt, '⚡ 麻痺', '#ffee00', 800); }catch(_){}
      }
      try{ if(typeof renderCard === 'function') renderCard(_tgt); }catch(_){}
    }
    try{ if(typeof log === 'function') log(`⚡ 風暴雷龍王「雷霆貫穿」!特技 150% 對 ${_tgt ? _tgt.name : '對手'} 造成風屬性傷害 -${dmg} HP,並麻痺 2 回合(完全無法行動)!`); }catch(_){}
    _scheduleBossEnd(boss, 1300);
  }

  // S2:暴風肅清 — 特技 120% 全體風屬性傷害 + 解除自身所有不利狀態
  function _wbWindBossS2(boss){
    const G = (typeof window._wbGetG === "function") ? window._wbGetG() : window.G;
    try{ if(typeof playSfx === 'function') playSfx('sfx-wb-boss-skill', 0.7); }catch(_){}
    // ★ v4.29.0 — 特效改暴風專屬 'wind_s2'(原 's2'=集中效果線通用特效·非雷電風)
    try{ if(typeof window._wbPlayFullscreenFx === 'function') window._wbPlayFullscreenFx('wind_s2', {duration:1500, shake:true}); }catch(_){}
    const alive = G.p1.filter(h => h && h.curHp > 0);
    const dmg = Math.floor((boss.sp || 45) * 1.20);
    alive.forEach(t => {
      try{
        if(typeof doDmg === 'function'){
          doDmg(t, dmg, { actor: boss, isSkill: true, isAoe: true, hitBonus: 0.30, element: 'wind' });
        }else{ t.curHp = Math.max(0, t.curHp - dmg); }
      }catch(_){ t.curHp = Math.max(0, t.curHp - dmg); }
      try{ if(typeof renderCard === 'function') renderCard(t); }catch(_){}
    });
    // 解除自身所有不利狀態(對應天賦文案「捲起毀滅暴風…解除自己身上所有不利狀態」)
    _wbWindClearBossDebuffs(boss);
    try{ if(typeof bannerFX === 'function') bannerFX(boss, '🌪 淨化', '#7eddcc', 800); }catch(_){}
    try{ if(typeof log === 'function') log(`🌪 風暴雷龍王「暴風肅清」!特技 120% 全體風屬性傷害 -${dmg} HP,並解除自身所有不利狀態!`); }catch(_){}
    _scheduleBossEnd(boss, 1300);
  }

  // 爆發:雷神·萬雷殛世 — 特技 150% 全體風傷(無視有利)+ 全體麻痺 1 回合 + 解除自身所有不利
  function _wbWindBossBurst(boss){
    const G = (typeof window._wbGetG === "function") ? window._wbGetG() : window.G;
    try{ if(typeof playSfx === 'function'){ playSfx('sfx-paralysis-thunder', 0.9); setTimeout(function(){ try{ playSfx('sfx-burst', 0.9); }catch(_){} }, 240); } }catch(_){}
    // ★ v4.29.0 — 爆發特效改雷雨專屬 'burst_wind'(原走 _wbPlayBurstAnimation 寫死播「火山炎龍王/天崩之炎」
    //   火特效+火爆發名稱大字→這正是老師回報「雷龍王爆發技名稱與提示顯示火龍王」的根因;
    //   本函式下方 log 本就正確輸出「雷神·萬雷殛世」,改用只播 GIF 的 _wbPlayFullscreenFx 即不再冒出火龍王文字)
    try{ if(typeof window._wbPlayFullscreenFx === 'function') window._wbPlayFullscreenFx('burst_wind', {duration:2200, shake:true}); }catch(_){}
    try{ boss._wbActionCount = 2; }catch(_){}   // ★ 爆發後不再追擊普攻
    try{ if(boss._wbBossTid) clearTimeout(boss._wbBossTid); }catch(_){}
    boss._wbBossTid = setTimeout(() => {
      boss._wbBossTid = null;
      if(boss._wbEndedThisTurn === true){ return; }
      if(boss.curHp <= 0){ boss._wbEndedThisTurn = true; return; }
      const alive = G.p1.filter(h => h && h.curHp > 0);
      const dmg = Math.floor((boss.sp || 45) * 1.50);
      alive.forEach(t => {
        try{
          if(typeof doDmg === 'function'){
            doDmg(t, dmg, { actor: boss, isSkill: true, isAoe: true, ignoreBuffs: true, ignoreEvasion: true, noReflect: true, noHalfDmg: true, element: 'wind' });
          }else{ t.curHp = Math.max(0, t.curHp - dmg); }
        }catch(_){ t.curHp = Math.max(0, t.curHp - dmg); }
        // 全體麻痺 1 回合
        if(t.curHp > 0){
          try{ if(typeof addStatus === 'function') addStatus(t, 'para', 1); }catch(_){}
          try{ if(typeof bannerFX === 'function') bannerFX(t, '⚡ 麻痺', '#ffee00', 800); }catch(_){}
        }
        try{ if(typeof renderCard === 'function') renderCard(t); }catch(_){}
      });
      // 解除自身所有不利狀態
      _wbWindClearBossDebuffs(boss);
      try{ if(typeof log === 'function'){ log('⚡ 風暴雷龍王爆發「雷神·萬雷殛世」!特技 150% 全體風屬性傷害(無視有利)!'); log('🌩 全體麻痺 1 回合(完全無法行動),並解除自身所有不利狀態!'); } }catch(_){}
      try{ if(typeof flashScreen === 'function') flashScreen('rgba(255,240,80,0.7)', 700); }catch(_){}
      _scheduleBossEnd(boss, 1800);
    }, 2200);
  }

  // BOSS S1:業火灼燒(全體 sp×1.5 + 燃燒 2 回合 + 命中 +30%)
  // ★ v3.11.7(2026-05-28) — 傷害 1.0 → 1.5(對齊 v3.5.9 + 介紹彈窗描述)+ 命中率 +30%
  function _wbAdvBossS1(boss){
    const G = (typeof window._wbGetG === "function") ? window._wbGetG() : window.G;
    if(boss && boss.name === '翠綠森龍王'){ _wbGrassBossS1(boss); return; }   // ★ v3.13.73 — 草龍王走自己的 S1
    if(boss && boss.name === '山岳地龍王'){ _wbEarthBossS1(boss); return; }   // ★ v3.15.17 — 地龍王走自己的 S1
    if(boss && boss.name === '深淵海龍王'){ _wbWaterBossS1(boss); return; }   // ★ v3.15.98 — 海龍王走自己的 S1
    if(boss && boss.name === '風暴雷龍王'){ _wbWindBossS1(boss); return; }    // ★ v4.22.0 — 雷龍王走自己的 S1(原落預設火龍王 BUG)
    // ★ FIX 20260517 — 技能音效(龍的呼嘯)
    try{ if(typeof playSfx === 'function') playSfx('sfx-wb-boss-skill', 0.7); }catch(_){}
    try{ if(typeof window._wbPlayFullscreenFx === 'function') window._wbPlayFullscreenFx('s1', {duration:1600, shake:true}); }catch(_){}
    const alive = G.p1.filter(h => h && h.curHp > 0);
    const dmg = Math.floor((boss.sp || 50) * 1.50);
    alive.forEach(t => {
      // 走主程式 doDmg(有傷害彈出/震動/屬性計算)
      try{
        if(typeof doDmg === 'function'){
          // ★ v3.11.7 — hitBonus 0.30(抵消速度差迴避 30%,對齊「命中率 +30%」)
          doDmg(t, dmg, { actor: boss, isSkill: true, isAoe: true, ignoreBuffs: true, hitBonus: 0.30, element: 'fire' });
        }else{
          t.curHp = Math.max(0, t.curHp - dmg);
        }
      }catch(_){
        t.curHp = Math.max(0, t.curHp - dmg);
      }
      t._wbBurn = 2;
      try{ renderCard(t); }catch(_){}
    });
    if(typeof log === 'function') log(`🔥 火山炎龍王「業火灼燒」!全體 -${dmg} HP,並附加燃燒 2 回合`);
    // ★ FIX 20260518(c) #3 — 用 _scheduleBossEnd 取代裸 setTimeout
    _scheduleBossEnd(boss, 1500);
  }

  // BOSS S2:龍吼震懾(全體 sp×0.75 + 50% 眩暈 + 命中 +30%)
  // ★ v3.11.7(2026-05-28) — 命中率 +30%
  function _wbAdvBossS2(boss){
    const G = (typeof window._wbGetG === "function") ? window._wbGetG() : window.G;
    if(boss && boss.name === '翠綠森龍王'){ _wbGrassBossS2(boss); return; }   // ★ v3.13.73 — 草龍王走自己的 S2
    if(boss && boss.name === '山岳地龍王'){ _wbEarthBossS2(boss); return; }   // ★ v3.15.17 — 地龍王走自己的 S2
    if(boss && boss.name === '深淵海龍王'){ _wbWaterBossS2(boss); return; }   // ★ v3.15.98 — 海龍王走自己的 S2
    if(boss && boss.name === '風暴雷龍王'){ _wbWindBossS2(boss); return; }    // ★ v4.22.0 — 雷龍王走自己的 S2(原落預設火龍王 BUG)
    // ★ FIX 20260517 — 技能音效(龍的呼嘯)
    try{ if(typeof playSfx === 'function') playSfx('sfx-wb-boss-skill', 0.7); }catch(_){}
    try{ if(typeof window._wbPlayFullscreenFx === 'function') window._wbPlayFullscreenFx('s2', {duration:1600, shake:true}); }catch(_){}
    const alive = G.p1.filter(h => h && h.curHp > 0);
    const dmg = Math.floor((boss.sp || 50) * 0.75);
    const stunNames = [];
    alive.forEach(t => {
      try{
        if(typeof doDmg === 'function'){
          // ★ v3.11.7 — hitBonus 0.30(抵消速度差迴避 30%)
          doDmg(t, dmg, { actor: boss, isSkill: true, isAoe: true, ignoreBuffs: true, hitBonus: 0.30, element: 'none' });
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
    if(typeof log === 'function') log(`🐉 火山炎龍王「龍吼震懾」!全體 -${dmg} HP${stunMsg}`);
    // ★ FIX 20260518(c) #3 — 用 _scheduleBossEnd 取代裸 setTimeout
    _scheduleBossEnd(boss, 1500);
  }

  // BOSS 爆發:天崩之炎(將全體 HP 減至最大 HP 的 20% + 強力燃燒 3 回合,無視所有有利狀態)
  // ★ v3.11.7(2026-05-28) — 完整重寫:
  //   1. 傷害改成「將 HP 減至最大 HP 的 20%」HP 考核機制(舊版 95% 當前 HP 太狠,玩家死太快)
  //      傷害公式:dmg = max(0, curHp - floor(maxHp * 0.20))
  //      若玩家當前 HP 已低於 20% 最大 HP → 傷害 = 0(不會打到負數)
  //      設計意圖:強迫玩家把全隊養到至少 110 HP,確保「減至 22 + 強力燃燒 6 次 -10」仍能存活
  //   2. 移除「無敵擋下」「護盾減半」(老師明確指示:護盾和減傷都無效)
  //   3. doDmg opts 補上 ignoreEvasion/noReflect/noHalfDmg/piercing(對齊 _wbExecSkillFallback)
  //   4. 燃燒改用 addStatus(t, 'hellfire', 3) + _strong:true(有 chip、有 popup、行動前後 -10 HP)
  //      舊版用 t._wbBurn = 3 玩家側完全無 UI 顯示,所以老師回報「沒附加燃燒」
  //   5. 強制把 _wbActionCount = 2,讓爆發後不再追擊普攻(爆發已太強)
  function _wbAdvBossBurst(boss){
    const G = (typeof window._wbGetG === "function") ? window._wbGetG() : window.G;
    if(boss && boss.name === '翠綠森龍王'){ _wbGrassBossBurst(boss); return; }   // ★ v3.13.73 — 草龍王走自己的爆發
    if(boss && boss.name === '山岳地龍王'){ _wbEarthBossBurst(boss); return; }   // ★ v3.15.17 — 地龍王走自己的爆發
    if(boss && boss.name === '深淵海龍王'){ _wbWaterBossBurst(boss); return; }   // ★ v3.15.98 — 海龍王走自己的爆發
    if(boss && boss.name === '風暴雷龍王'){ _wbWindBossBurst(boss); return; }   // ★ v4.22.0 — 雷龍王走自己的爆發(原落預設火龍王 BUG)
    // ★ FIX 20260517 — 爆發技用技能音效(更大聲)
    try{ if(typeof playSfx === 'function') playSfx('sfx-wb-boss-skill', 0.9); }catch(_){}
    try{ if(typeof window._wbPlayBurstAnimation === 'function') window._wbPlayBurstAnimation(); }catch(_){}
    // ★ v3.12.7 — 爆發強制讓行動計數 = 2,結束行動不再追擊普攻
    try{ boss._wbActionCount = 2; }catch(_){}
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
      let logEntry = '⚡ 火山炎龍王爆發「天崩之炎」!將全體 HP 減至最大 HP 的 20%';
      alive.forEach(t => {
        // ★ v3.11.7 — 無視所有有利狀態:不再判定 _wbInvincible / _wbShield
        const _floorHp = Math.floor((t.hp || 0) * 0.20);
        const d = Math.max(0, t.curHp - _floorHp);
        if(d > 0){
          try{
            if(typeof doDmg === 'function'){
              doDmg(t, d, {
                actor: boss,
                isSkill: true,
                isAoe: true,
                ignoreBuffs: true,    // 無視有利狀態(無敵/免疫/護盾/保護/閃避全失效)
                ignoreEvasion: true,  // 必中
                noReflect: true,      // 不被反射
                noHalfDmg: true,      // 不受減傷
                piercing: true,       // 無視防禦
                fixedDmg: true,
                element: 'fire'
              });
            }else{
              t.curHp = Math.max(0, t.curHp - d);
            }
          }catch(_){
            t.curHp = Math.max(0, t.curHp - d);
          }
        }
        // ★ v3.11.7 — 強力燃燒 3 回合(主程式 hellfire + _strong,行動前後各 -10 HP)
        //   舊版 t._wbBurn = 3 玩家側完全無 UI 顯示,改走主程式 status 機制
        if(t.curHp > 0){
          try{
            if(typeof addStatus === 'function'){
              addStatus(t, 'hellfire', 3);
              const _hs = (t.status || []).find(s => s.type === 'hellfire');
              if(_hs){
                _hs._actor = boss;
                _hs._strong = true;
              }
              if(typeof bannerFX === 'function'){
                bannerFX(t, '🔥 強力燃燒', '#ff2200', 900);
              }
            }
          }catch(_eHF){ console.warn('[WB-Burst v3.11.7] 強力燃燒附加失敗', _eHF); }
        }
        try{ renderCard(t); }catch(_){}
      });
      if(typeof log === 'function'){ log(logEntry); log('🔥 存活全體附加強力燃燒 3 回合(行動前後各 -10 HP)'); }
      try{ if(typeof flashScreen === 'function') flashScreen('rgba(255,80,40,0.8)', 700); }catch(_){}
      // ★ FIX 20260518(c) #3 — 內層 endAction 也走防雙重觸發
      _scheduleBossEnd(boss, 1800);
    }, 2200);
  }

  // BOSS 普攻:選 1 個玩家英雄,atk × (1.0~1.3) 傷害
  //   ★ v3.15.0 — targetLowest=true(追擊普攻第 2 次行動)時改鎖定「當前 HP 最少」的存活玩家;
  //      主行動的普攻(20% AI)維持隨機目標。火龍王/草龍王共用此邏輯,雙王行為一致。
  function _wbAdvBossNormalAtk(boss, targetLowest){
    const G = (typeof window._wbGetG === "function") ? window._wbGetG() : window.G;
    // ★ FIX 20260517 — 普攻音效(龍的普攻)
    try{ if(typeof playSfx === 'function') playSfx('sfx-wb-boss-atk', 0.6); }catch(_){}
    const alive = G.p1.filter(h => h && h.curHp > 0);
    if(!alive.length){
      // ★ FIX 20260518(c) #3 — early return 也走防雙重觸發
      _safeBossEndAction(boss);
      return;
    }
    const tgt = targetLowest
      ? alive.slice().sort((a,b) => (a.curHp||0) - (b.curHp||0))[0]
      : alive[Math.floor(Math.random() * alive.length)];
    const d = Math.floor((boss.atk || 49) * (1 + Math.random() * 0.3));
    try{
      if(typeof doDmg === 'function'){
        // ★ v3.11.7 — hitBonus 0.30(普攻基礎命中率 +30%)
        doDmg(tgt, d, { actor: boss, hitBonus: 0.30 });
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
            // ★ v3.5.69 — 預檢爆發次數上限(每人最多 2 次/場)
            //   根因:client 樂觀更新 + host sync 雙端狀態錯位時,_burstUsed 可能沒同步,
            //         造成玩家觀察到「爆發無限次」(老師 BUG #6 回報)
            //   保險:在跑 _canBurst 之前先看 _burstUsed,>= 2 直接拒絕並改普攻
            const _curBurstUsed = (typeof actor._burstUsed === 'number') ? actor._burstUsed
                                 : (actor._burstUsed === true ? 1 : 0);
            const _isBossHero = (typeof BOSS_NAMES !== 'undefined' && BOSS_NAMES.includes
                                 && BOSS_NAMES.includes(actor.name));
            if(!_isBossHero && _curBurstUsed >= 2){
              console.warn('[WB-Action v6] ' + actor.name + ' 爆發已用 ' + _curBurstUsed
                + ' 次(達上限 2),拒絕並改普攻');
              const opp = actor.side === 'p1' ? 'p2' : 'p1';
              const foes = (G[opp] || []).filter(h => h && h.curHp > 0);
              const tgt = foes.sort((x, y) => y.curHp - x.curHp)[0] || null;
              if(tgt && typeof window.execAtk === 'function'){
                window.execAtk(actor, tgt, actor.atk);
                if(typeof window.endAction === 'function') window.endAction(actor, 0);
                ok = true;
              }
              return ok;
            }
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
      // ★ v3.13.57(2026-06-05)— BUG 1 根治:client 的 activeChar 卡在「已行動角色」時,
      //   玩家每點一次按鈕都會走到這裡被跳過(根因:房主端沒推進、client 永遠等不到下一個
      //   turn-start 廣播)。既然玩家正在主動嘗試操作,代表確實卡住 → 立即向房主送
      //   _client_stuck_resync 求救(房主收到會在 activeChar.acted 時強制 startTurn 推進);
      //   不必苦等 endAction watchdog 的 5 秒。節流 3 秒一次,避免洗版 Firestore。
      try{
        if(a && a.acted && window._wbConnectedClientMode === true){
          const _nowRs = Date.now();
          if(!window._wbClientStuckResyncTs || (_nowRs - window._wbClientStuckResyncTs) > 3000){
            window._wbClientStuckResyncTs = _nowRs;
            if(window._wbNet && typeof window._wbNet.sendAction === 'function'){
              console.warn('[WB-Client v6] activeChar 卡在已行動角色,玩家嘗試操作 → 主動送 _client_stuck_resync 向房主求救');
              const _rRs = window._wbNet.sendAction({ type: '_client_stuck_resync',
                                                      ts: _nowRs,
                                                      reason: 'optimistic_blocked',
                                                      actor: a.name });
              if(_rRs && typeof _rRs.then === 'function'){
                _rRs.catch(function(e){ console.warn('[WB-Client v6] 主動 resync 送出失敗', e); });
              }
            }
          }
        }
      }catch(_eResync){ console.warn('[WB-Client v6] 主動 resync 例外', _eResync); }
      return false;
    }
    // 設動畫結束時間戳(供 5.3 用,sync 進來時若還沒到此時間就延後 apply)
    window._wbClientAnimEndTs = Date.now() + 1500;
    window._wbClientOptimistic = true;

    // ★ v3.5.1 — 記錄本次樂觀更新的 actor,給 watchdog 在強解時識別
    window._wbClientOptimisticActor = {
      pos: a.pos,
      name: a.name,
      type: type,
      ts: Date.now(),
      sentToHost: false,
    };

    // 本機代執行(走跟房主一樣的 _wbExecPlayerAction 路徑)
    try{
      if(typeof window._wbExecPlayerAction === 'function'){
        window._wbExecPlayerAction(a.pos, { type: type });
      }
    }catch(eOp){ console.warn('[WB-Client v6] 樂觀更新失敗', eOp); }

    // ★ v3.5.1 — 同時送 Firestore 給房主(加上重試機制 + 失敗 fallback)
    //   原問題:_wbNet.sendAction 用 Firestore transaction 寫 worldBossRooms 文件,
    //          多人同時寫會撞到 failed-precondition (樂觀鎖衝突) → action 永遠送不到房主
    //          → 房主以為玩家還沒操作 → 全場卡死(包括房主自己畫面)
    //   修法:① 包成 async 重試,最多 3 次,每次間隔 600ms 後增加(指數退避)
    //         ② 全部失敗時記在 console,並設旗標讓 watchdog 知道
    //         ③ 成功時清旗標
    (async function _sendWithRetry(){
      const _maxAttempts = 3;
      let _lastErr = null;
      for(let _i = 0; _i < _maxAttempts; _i++){
        try{
          if(window._wbNet && typeof window._wbNet.sendAction === 'function'){
            const _result = window._wbNet.sendAction({ type: type });
            // sendAction 可能回傳 Promise(transaction)或 undefined(同步)
            if(_result && typeof _result.then === 'function'){
              await _result;
            }
            // 成功 → 標記
            if(window._wbClientOptimisticActor){
              window._wbClientOptimisticActor.sentToHost = true;
            }
            if(_i > 0){
              console.info('[WB-Client v6] sendAction 第 ' + (_i+1) + ' 次重試成功');
            }
            return;
          }
        }catch(eSd){
          _lastErr = eSd;
          const _isPrecond = eSd && (eSd.code === 'failed-precondition' ||
                                     (eSd.message || '').includes('failed-precondition'));
          console.warn('[WB-Client v6] sendAction 第 ' + (_i+1) + ' 次失敗' +
            (_isPrecond ? ' (樂觀鎖衝突, 將重試)' : ''), eSd && eSd.message);
          if(_i < _maxAttempts - 1){
            // 指數退避:600ms → 1200ms → 2400ms
            await new Promise(r => setTimeout(r, 600 * Math.pow(2, _i)));
          }
        }
      }
      // 全部失敗 → 嚴重狀態,通知玩家
      console.error('[WB-Client v6] sendAction 重試 ' + _maxAttempts + ' 次都失敗,房主端可能不知道此次操作', _lastErr);
      try{
        // 顯示給玩家看的 toast
        if(typeof window._showSimpleToast === 'function'){
          window._showSimpleToast('⚠ 操作未成功送到房主,請稍待房主端同步...如果持續卡住請投降重來', 'warn');
        } else {
          const _t = document.createElement('div');
          _t.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);z-index:99999;' +
            'background:rgba(120,80,20,0.96);border:2.5px solid #ffaa44;color:#ffe0aa;' +
            'font-size:15px;padding:12px 22px;border-radius:10px;max-width:90vw;text-align:center;line-height:1.6;';
          _t.innerHTML = '⚠ <b>操作未成功送到房主</b><br>' +
            '<span style="font-size:13px;color:#ffd699;">請稍待房主端同步,如果持續卡住請投降重來</span>';
          document.body.appendChild(_t);
          setTimeout(() => { if(_t.parentNode) _t.remove(); }, 8000);
        }
      }catch(_){}
    })();

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
  async function _wbShowAdvBattleResult(win){
    // ════════════════════════════════════════════════════════════════
    // ★ v3.12.12(2026-05-30) — 戰績歷史雙寫修補 + daily limit 失守修補
    // ────────────────────────────────────────────────────────────────
    // 老師回報 2026/05/30:學生「帥氣的惡龍」實際打 3 場,但戰績歷史顯示 6 場
    //   (兩筆兩筆成對,時間戳完全相同 21:08/20:57/21:17),且每日 2 場上限失守
    //   (允許打到 4+ 場)。
    //
    // 根因分析:
    //   1. _wbShowAdvBattleResult 函式本身完全沒有「重複進入守門」,
    //      只在外部呼叫處檢查 _wbAdvBattleEnded(非原子操作)。
    //   2. 11 回合戰場崩毀(_wbForceCollapseAt11)有 4 個觸發點(E2/E3/E4/E5),
    //      每個都會呼叫 checkWin + 600ms fallback setTimeout。
    //   3. 連線房主模式下,host 廣播 ended=true 給 client,client 收到後也會
    //      補跑一次 checkWin → 再次觸發 _wbShowAdvBattleResult。
    //   4. 多條觸發路徑之間有 timing gap(checkWin setTimeout 200ms、
    //      fallback setTimeout 600ms、client sync delay 300ms),
    //      race condition 讓「兩個觸發都通過 _wbAdvBattleEnded=false 守門」。
    //
    // 證據:重複的兩筆中,聯手爆發次數一筆是 0、另一筆是 2 — 代表是兩個不同時間
    //       點的快照,第一次寫入時聯手爆發還沒觸發完。
    //
    // 修補設計:在函式開頭立刻設定 _wbResultExecuting 旗標(atomic),
    //          已執行過(或正在執行)就直接 return。
    //
    //          這比依賴 _wbAdvBattleEnded 更安全:
    //          - _wbAdvBattleEnded 同時還給其他 14+ 個地方判斷「戰鬥已結束」
    //            (例如 endAction hook、startTurn hook 都在讀),不能在此函式
    //            一開始就 set,可能影響其他邏輯。
    //          - _wbResultExecuting 是本函式專用,只負責防重入。
    //          - 用 try/finally 確保即使中途 throw 也會釋放(下場戰鬥可正常)。
    //
    //          影響範圍(每場保證只跑 1 次):
    //          - updateLeaderboard(寫排行榜 + battleHistory)
    //          - bumpDailyCount(每日 +1)
    //          - dealDamage(扣 BOSS 雲端血)
    //          - 結算 UI 顯示
    //
    //          重置時機:本函式結束時 _wbResultExecuting 維持 true(代表本場已結算)。
    //          下場開戰時由 _wbCleanupAdvAfterBattle / startBattle / soloBegin
    //          等既有 cleanup 流程把它重置為 false(同 _wbAdvBattleEnded)。
    // ════════════════════════════════════════════════════════════════
    if(window._wbResultExecuting === true){
      console.warn('[WB-Result v3.12.12] ⚠ 本場已結算過或正在結算,跳過重複呼叫 (win=' + win + ')');
      return;
    }
    // 立刻 set 旗標,防止 race(任何 async/await/setTimeout 之前)
    window._wbResultExecuting = true;
    console.log('[WB-Result v3.12.12] ✅ 本場首次結算,正常執行 (win=' + win + ')');

    // ════════════════════════════════════════════════════════════════
    // ★ v3.11.8(2026-05-27) — 結算傷害來源修正 + 模式區分
    // ────────────────────────────────────────────────────────────────
    // 老師回報:打完世界 BOSS,結算顯示「練習模式、累積傷害 0」,但實際是房主開房 + 有上排行榜。
    // 根因:
    //   (a) myDmg 只讀 window._wbSoloContrib(練習模式才寫),連線房主的貢獻寫在
    //       window._wbNet.getSnapshot().meta.contributions[uid].dmgDealt → 永遠取不到
    //   (b) _wbSaveSoloBest 不分情境都寫進「練習模式個人最佳」,結算頁顯示「練習模式」
    // 修補:
    //   - myDmg 改成多源取:連線房主 → meta.contributions(全隊累積);
    //                       單人練習 → _wbSoloContrib(本機紀錄);
    //                       fallback 0
    //   - 用 isSolo 判斷模式,傳給結算 UI;_wbSaveSoloBest 只有真 solo 才寫
    // ════════════════════════════════════════════════════════════════
    const myUid = window._gUserId || 'solo_user';
    // ════════════════════════════════════════════════════════════════
    // ★ v3.12.15(2026-05-31)— isSolo 雙重判定(防止旗標殘留誤判)
    // ────────────────────────────────────────────────────────────────
    // 老師回報 2026-05-31:「直接開房間自己打,結算卻顯示練習模式」+「可無限再戰」。
    // 根因:_wbSoloPracticeMode 旗標在某些路徑會殘留為 true(例如前次 solo 隊伍頁
    //       未退出乾淨 / leaveRoom 沒走 / 跨 tab 殘留),導致連線房主進戰鬥時雖然
    //       _wbUiStartBattle line 8064 有設 false,但結算當下又被其他流程改回 true。
    // 修補:不只信任旗標,加上「真連線房號」的客觀判定。
    //   - solo mock _wbNet 的 getRoomId() 永遠回字串 '練習'
    //   - 真連線房間 getRoomId() 回 6 碼大寫房號(例如 'ABC123')
    //   只要 roomId 是真房號 → 強制 isSolo=false,確保:
    //     1. 結算頁顯示「⚔ 戰鬥結算」而非「🧪 練習結束」
    //     2. bumpDailyCount 正常呼叫(每日 2 場上限生效)
    //     3. 排行榜正常更新
    //     4. _wbSaveSoloBest 以 'host' mode 寫入個人最佳
    // ════════════════════════════════════════════════════════════════
    let isSolo = !!window._wbSoloPracticeMode;
    try{
      if(window._wbNet && typeof window._wbNet.getRoomId === 'function'){
        const _rid = window._wbNet.getRoomId();
        // 真連線房號:6 碼大寫英數字。'練習' 或 falsy 都不算
        if(typeof _rid === 'string' && /^[A-Z0-9]{6}$/.test(_rid)){
          if(isSolo){
            console.warn('[WB-Result v3.12.15] ⚠ _wbSoloPracticeMode=true 但 roomId 是真房號(' + _rid + '),強制視為連線戰');
          }
          isSolo = false;
        }
      }
    }catch(_eRid){ console.warn('[WB-Result v3.12.15] roomId 判定例外,沿用旗標', _eRid); }
    const isHost = !!window._wbConnectedHostMode;
    try{ console.log('[WB-Result v3.12.15] 最終判定 isSolo=' + isSolo + ', isHost=' + isHost
      + ', _wbSoloPracticeMode=' + !!window._wbSoloPracticeMode
      + ', roomId=' + (window._wbNet && window._wbNet.getRoomId ? window._wbNet.getRoomId() : '(無 _wbNet)')); }catch(_){}

    // ════════════════════════════════════════════════════════════════
    // ★ v3.11.8(2026-05-27) — 結算傷害來源修正 + 模式區分 + 個人最佳紀錄共用
    // ────────────────────────────────────────────────────────────────
    // 老師回報 1:打完世界 BOSS,結算顯示「練習模式、累積傷害 0」,但實際是房主開房 + 有上排行榜
    // 老師回報 2:結算頁要顯示「練習 + 連線房主共用的個人最佳紀錄」+ 破紀錄比較
    // 根因:
    //   (a) myDmg 只讀 window._wbSoloContrib(練習模式才寫),連線房主應從
    //       window._wbNet.getSnapshot().meta.contributions[uid].dmgDealt 讀
    //   (b) _wbSaveSoloBest 只在 isSolo 才寫 → 連線房主玩再多場也不更新個人最佳
    // 修補:
    //   - 算兩個傷害值:
    //       myDmg     = 「你個人」傷害(房主就是房主自己;練習就是你本機)→ 用於破紀錄比較
    //       teamDmg   = 「全隊累積」傷害(只在連線模式有意義;練習等同 myDmg)→ 用於結算顯示
    //   - 練習 + 連線房主**都**呼叫 _wbSaveSoloBest(共用同一份 localStorage)
    //   - 結算頁顯示:本場傷害 + 個人最佳 + 破紀錄/差距
    // ════════════════════════════════════════════════════════════════
    let myDmg = 0;     // 你個人的傷害(破紀錄比較用)
    let teamDmg = 0;   // 全隊累積傷害(連線模式顯示用,練習等同 myDmg)
    try{
      // ════════════════════════════════════════════════════════════════
      // ★ v3.12.15(2026-05-31)— 傷害來源改用 getContributions(本機 live 值)
      // ────────────────────────────────────────────────────────────────
      // 老師回報 2026-05-31:連線私人房結算,結算頁顯示「本場全隊累積總傷害 0」,
      //   實際打了 8 回合 + 答對 3 題 + 聯手爆發 1 次,絕對不是 0。
      // 根因:舊版讀 _wbNet.getSnapshot().meta.contributions,
      //   但 getSnapshot() 回的是 WB.lastSeenSnap(雲端冷資料,host 沒 broadcast 就空)。
      //   本機 doDmg 內的 addContribution 寫到 WB.contributions(本機 live)。
      //   兩者完全分離 → 結算讀錯來源 → 永遠 0。
      // 修補:改用 _wbNet.getContributions()(直接讀 WB.contributions 本機 live),
      //   原 _snap.meta.contributions 路徑保留作 fallback(若雲端有寫入也能讀到)。
      // ════════════════════════════════════════════════════════════════
      let _contrib = null;
      // 優先源:本機 live contributions(主程式 doDmg 累計寫入的真實傷害)
      try{
        if(window._wbNet && typeof window._wbNet.getContributions === 'function'){
          _contrib = window._wbNet.getContributions() || {};
        }
      }catch(_eGc){ console.warn('[WB-Result v3.12.15] getContributions 失敗', _eGc); }
      // fallback:雲端 snapshot 的 contributions(原本 v3.11.8 邏輯,留以兼容)
      if(!_contrib || Object.keys(_contrib).length === 0){
        try{
          if(window._wbNet && typeof window._wbNet.getSnapshot === 'function'){
            const _snap = window._wbNet.getSnapshot();
            _contrib = (_snap && _snap.meta && _snap.meta.contributions) || {};
          }
        }catch(_eGs){}
      }
      _contrib = _contrib || {};

      if(!isSolo){
        // ── 連線模式 ──
        Object.keys(_contrib).forEach(_u => {
          const _d = (_contrib[_u] && typeof _contrib[_u].dmgDealt === 'number') ? _contrib[_u].dmgDealt : 0;
          teamDmg += _d;
          if(_u === myUid) myDmg = _d;
        });
        // 房主代打槽:host_npc_X 也屬於我的貢獻 → 一併加進 myDmg
        if(isHost){
          Object.keys(_contrib).forEach(_u => {
            if(/^host_npc_/i.test(_u)){
              const _d = (_contrib[_u] && typeof _contrib[_u].dmgDealt === 'number') ? _contrib[_u].dmgDealt : 0;
              myDmg += _d;
            }
          });
        }
        // ★ v3.12.15 兜底:連線模式若 teamDmg 仍 0(極端情況例如沒人寫過 contribution),
        //   改從場上 BOSS 實際失血量取(boss.hp 為本場起始血,boss.curHp 為當前)
        if(teamDmg === 0){
          try{
            const _Gr2 = (typeof window._wbGetG === 'function') ? window._wbGetG() : window.G;
            const _bossLive = (_Gr2 && _Gr2.p2 && _Gr2.p2[0]) || null;
            if(_bossLive && typeof _bossLive.hp === 'number' && typeof _bossLive.curHp === 'number'){
              const _dealtFromBoss = Math.max(0, _bossLive.hp - _bossLive.curHp);
              if(_dealtFromBoss > 0){
                console.log('[WB-Result v3.12.15] contributions 都 0,從 BOSS 失血量推算 teamDmg=' + _dealtFromBoss);
                teamDmg = _dealtFromBoss;
                if(myDmg === 0) myDmg = _dealtFromBoss;  // 私人房自己打就全算自己的
              }
            }
          }catch(_eBossDmg){ console.warn('[WB-Result v3.12.15] BOSS 失血量兜底失敗', _eBossDmg); }
        }
      }
      // ── 單人練習(或連線取不到資料時的 fallback)──
      if(myDmg === 0 && window._wbSoloContrib && window._wbSoloContrib[myUid]){
        myDmg = window._wbSoloContrib[myUid].dmgDealt || 0;
      }
      if(teamDmg === 0) teamDmg = myDmg;  // 練習模式 teamDmg 等同 myDmg
    }catch(_eMyDmg){ console.warn('[WB-Result v3.12.15] myDmg/teamDmg 計算例外', _eMyDmg); }
    try{ console.log('[WB-Result v3.12.15] isSolo=' + isSolo + ', isHost=' + isHost + ', myDmg=' + myDmg + ', teamDmg=' + teamDmg); }catch(_){}

    // 4 隻英雄名
    const _Gr = (typeof window._wbGetG === 'function') ? window._wbGetG() : null;
    const heroes = (_Gr && _Gr.p1) ? _Gr.p1.map(h => h ? h.name : '?') : [];
    const elapsed = Date.now() - (window._wbSoloStartTs || Date.now());

    // ★ v3.11.8 — 取既有個人最佳紀錄(供結算頁顯示破紀錄/差距)
    let _prevBest = null;
    try{
      if(typeof window._wbGetSoloBest === 'function'){
        _prevBest = window._wbGetSoloBest((typeof window._wbGetCurrentBossId === 'function') ? window._wbGetCurrentBossId() : 'vesuvius_fire_dragon');  // ★ v3.14.20 動態當前龍王
      }
    }catch(_){}

    // ★ v3.11.8 — 練習 + 連線房主**都**寫個人最佳紀錄(共用同一份 localStorage)
    //   比較基準:你個人的傷害(myDmg),不是全隊
    //   mode 標記:'solo'(練習)/ 'host'(連線房主)/ 'client'(連線非房主,目前不會走到這流程)
    let isNewRecord = false;
    try{
      if(typeof window._wbSaveSoloBest === 'function'){
        const _mode = isSolo ? 'solo' : (isHost ? 'host' : 'client');
        isNewRecord = window._wbSaveSoloBest(myDmg, heroes, elapsed, win, _mode);
      }
    }catch(_){}

    // ════════════════════════════════════════════════════════════════
    // ★ v3.12.10(2026-05-30)— 每日場次計次補丁(修 3/3 bug)
    // ────────────────────────────────────────────────────────────────
    // 老師回報 2026/05/30:傳說的學長一天打了 3 場(實際 18:09 / 18:35 / 18:48)
    //
    // 根因:
    //   v3.12.9 設計「每日 2 場上限」,模組 window._wbDailyLimit 已完整實作,
    //   但 bumpDailyCount() 整個程式碼裡沒有任何地方真的呼叫,
    //   導致 wbDailyCount.count 永遠是 0,canEnter() 永遠 allowed=true。
    //
    // 修補:
    //   在結算函式呼叫 bumpDailyCount,符合 world-boss-ui.html line 4258 註解
    //   「真正 +1 的時機改為戰鬥結算 _wbShowAdvBattleResult」。
    //
    // 排除規則:
    //   ✅ isSolo === true (練習模式) → 不算次數
    //   ✅ myDmg <= 0 (沒造成傷害,例如進場立刻斷線) → 不算次數
    //
    // 失敗保護:
    //   try/catch 包住,bump 失敗也不影響結算 UI/排行榜寫入
    // ════════════════════════════════════════════════════════════════
    // ════════════════════════════════════════════════════════════════
    // ★ v3.12.17(2026-05-31)— 補償券系統:bump 改 await,把 isBonus 旗標傳給排行榜
    // ────────────────────────────────────────────────────────────────
    // 老師需求:超過正常 2 場(=用了補償券)的場次:
    //   - 戰績歷史條目標記 _isBonus:true → 玩家自己看到「🎫 補償場次」
    //   - 排行榜該隊伍 bonusBattleCount++ → 全校看到「(含 N 場補償)」
    //   - 傷害一樣計入排行榜總傷(維持跨天累積公平)
    // 改法:把 bumpDailyCount 改 await 在前面跑完,拿到 isBonus 後一起傳給 updateLeaderboard
    // ════════════════════════════════════════════════════════════════
    let _v3_12_17_isBonusBattle = false;
    try{
      if(!isSolo
         && myDmg > 0
         && window._wbDailyLimit
         && typeof window._wbDailyLimit.bumpDailyCount === 'function'){
        const _reason = isHost ? 'battle_settled_host' : 'battle_settled_client';
        const _bumpResult = await window._wbDailyLimit.bumpDailyCount(_reason);
        if(_bumpResult && _bumpResult.ok){
          _v3_12_17_isBonusBattle = !!_bumpResult.isBonus;
          console.log('[WB-DailyLimit v3.12.17] ✅ 結算 +1 計次成功:' + _bumpResult.count + '/2'
            + (_v3_12_17_isBonusBattle ? ' 🎫 本場為補償場次' : ''));
          // ★ v3.12.13(2026-05-30) — 計次成功後立即重新套入口卡鎖
          //   讓玩家從結算頁返回入口時就看到鎖狀態(不需要 reload 才生效)
          try{
            if(typeof window._wbApplyEntryGateLock === 'function'){
              window._wbApplyEntryGateLock();
            }
          }catch(_eLockReapply){
            console.warn('[WB-EntryGate v3.12.13] 結算後套鎖失敗', _eLockReapply);
          }
        }else{
          console.warn('[WB-DailyLimit v3.12.17] ⚠️ bumpDailyCount 回傳失敗:', _bumpResult);
        }
      }else{
        console.log('[WB-DailyLimit v3.12.17] 略過計次(isSolo=' + isSolo + ', myDmg=' + myDmg + ')');
      }
    }catch(_eBump){
      console.error('[WB-DailyLimit v3.12.17] bump 區塊例外:', _eBump);
    }

    // ★ FIX 20260518 — 全球 BOSS 殘血同步:本場全隊對 BOSS 造成的總傷害扣到雲端
    //   來源:_Gr.p2[0].hp - _Gr.p2[0].curHp 就是本場 BOSS 實際被打掉的血量
    //         (若 win=true,curHp<=0,等於把剩下的血全打光)
    //   接 _wbHpSync.dealDamage 扣雲端 stats/global.worldBossHp.<bossId>
    //   若擊敗(killed=true) → 順帶觸發休戰(寫 worldBossControl/main.ceasefire=true)
    try{
      const _wbBoss = (_Gr && _Gr.p2 && _Gr.p2[0]) || null;
      if(_wbBoss && typeof _wbBoss.hp === 'number' && typeof _wbBoss.curHp === 'number'
         && window._wbHpSync && typeof window._wbHpSync.dealDamage === 'function'){
        // 對應的 bossId 從 WORLD_BOSS_LINEUP 反查(用名稱比對);保險 fallback 改當前龍王(★ v3.14.20)
        let bossId = (typeof window._wbGetCurrentBossId === 'function') ? window._wbGetCurrentBossId() : 'vesuvius_fire_dragon';
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
          // ★ v3.5.6 — 排行榜顯示「玩家暱稱 + 使用英雄(LV)」(用戶需求)
          //   teamHeroes:每槽 { name, lv } — 英雄等級從 _Gr.p1[i] 對應 hero 物件 / player.element JSON 的 g.lv 取
          try{
            // ★ v3.5.73 — 單人練習模式不寫排行榜(老師指示:solo 不計入)
            //   原 v3.5.65 邏輯仍會寫入並用「房主 ×4」顯示,造成排行榜出現
            //   「5214高誠遠・5214高誠遠・代打・5214高誠遠・代打・5214高誠遠・代打」這種拼接,
            //   且 solo 容易刷高分污染真排行榜。
            //   守門條件:isSolo === true → 直接 return,不呼叫 updateLeaderboard
            // ★ v3.11.10(2026-05-28) — 管理員不寫排行榜(老師指示:GM 練習測試不能列入學生排名)
            //   守門條件:當前登入帳號是管理員 → 直接 return
            //   設計考量:管理員會用來測試新功能、調平衡、debug,成績不該污染真實學生競賽
            // ★ v3.12.15(2026-05-31) — 改用上面修正過的 isSolo(roomId 判定優先)
            //   原本讀 window._wbSoloPracticeMode 容易因旗標殘留誤判,
            //   現在用「真連線房號 → 強制 isSolo=false」確保開房就一定上榜,
            //   符合老師「不管幾個人打,只要是開房間都列入排名」需求。
            const _isAdminUser = (typeof window._isAdminUser === 'function' && window._isAdminUser());
            if(_isAdminUser){
              console.log('[WB-Leaderboard v3.11.10] 管理員身分,跳過排行榜更新');
            }else
            if(isSolo){
              console.log('[WB-Leaderboard v3.12.15] isSolo=true(練習模式),跳過排行榜更新');
            }else
            if(typeof window._wbHpSync.updateLeaderboard === 'function'){
              const _myNick = (window._playerNickname || window._userName || '玩家');
              // ★ v3.5.70 — 抓自己的 email,給「房主代打槽位」用(代打時用房主 email)
              const _myEmail = ((window._fbUser && window._fbUser.email) || '').toLowerCase();
              let _teamUids = [];
              let _teamNames = [];
              let _teamEmails = [];  // ★ v3.5.70 — 收集 email 給排行榜班級座號顯示用
              let _teamHeroes = [];  // ★ v3.5.6 — [{name, lv}, ...]
              try{
                // 從 _wbNet 拿房間玩家清單(連線模式有 4 個真實玩家;單人模式只有 1 個 + 3 個 NPC)
                const _snap = (window._wbNet && window._wbNet.getSnapshot) ? window._wbNet.getSnapshot() : null;
                const _players = (_snap && Array.isArray(_snap.players)) ? _snap.players : [];
                // ★ v3.5.6 — 解析 element JSON 拿 g.lv 的 helper
                const _parseG = function(elementStr){
                  if(!elementStr || typeof elementStr !== 'string') return null;
                  if(!elementStr.startsWith('{')) return null;
                  try{
                    const obj = JSON.parse(elementStr);
                    return (obj && obj.g && typeof obj.g === 'object') ? obj.g : null;
                  }catch(_){ return null; }
                };
                // ★ v3.5.6 — 取英雄等級的 helper(優先順序:該位 hero 物件 → player.element 的 g.lv → _heroLevels(僅房主自己) → 1)
                const _getHeroLv = function(slotIdx, heroName, isMyHero){
                  // 1. 從場上 hero 物件(_Gr.p1)取 _wbLv(房主端建構時若有套上)
                  try{
                    const _h = _Gr && _Gr.p1 && _Gr.p1[slotIdx];
                    if(_h && typeof _h._wbLv === 'number' && _h._wbLv > 0) return _h._wbLv;
                  }catch(_){}
                  // 2. 從 player.element JSON 的 g.lv 取(連線真實玩家)
                  try{
                    const _g = _parseG(_players[slotIdx] && _players[slotIdx].element);
                    if(_g && typeof _g.lv === 'number' && _g.lv > 0) return _g.lv;
                  }catch(_){}
                  // 3. 房主自己槽位 → 從 _heroLevels 取(主程式變數)
                  if(isMyHero && heroName){
                    try{
                      if(typeof _heroLevels !== 'undefined' && _heroLevels && _heroLevels[heroName]){
                        return _heroLevels[heroName];
                      }
                    }catch(_){}
                    try{
                      if(typeof window._heroLevels !== 'undefined' && window._heroLevels && window._heroLevels[heroName]){
                        return window._heroLevels[heroName];
                      }
                    }catch(_){}
                  }
                  return 1;  // fallback
                };
                for(let _i = 0; _i < 4; _i++){
                  const _p = _players[_i];
                  // 拿這個槽位的英雄名:player.heroName 優先,fallback 用 _Gr.p1[i].name
                  let _heroName = '';
                  try{
                    if(_p && _p.heroName) _heroName = _p.heroName;
                    else if(_Gr && _Gr.p1 && _Gr.p1[_i] && _Gr.p1[_i].name) _heroName = _Gr.p1[_i].name;
                  }catch(_){}
                  if(_p && _p.uid){
                    _teamUids.push(_p.uid);
                    _teamNames.push(_p.name || _myNick);
                    // ★ v3.5.70 — 從 player 物件取 email(createRoom/joinRoom 已存),lower-case 正規化
                    _teamEmails.push(((_p.email || '') + '').toLowerCase());
                    _teamHeroes.push({
                      name: _heroName || '?',
                      lv: _getHeroLv(_i, _heroName, _p.uid === myUid),
                    });
                  }else{
                    // 空槽 / 房主代打 → 用房主身份補位(用戶要求:單人開 4 隻顯示 4 次相同暱稱)
                    _teamUids.push(myUid);
                    _teamNames.push(_myNick);
                    // ★ v3.5.70 — 房主代打槽位,email 用房主自己的
                    _teamEmails.push(_myEmail);
                    _teamHeroes.push({
                      name: _heroName || '?',
                      lv: _getHeroLv(_i, _heroName, true),  // 房主代打,當作自己的英雄
                    });
                  }
                }
              }catch(_){
                // fallback:全部當房主自己
                _teamUids = [myUid, myUid, myUid, myUid];
                _teamNames = [_myNick, _myNick, _myNick, _myNick];
                // ★ v3.5.70 — fallback 也填房主自己的 email
                _teamEmails = [_myEmail, _myEmail, _myEmail, _myEmail];
                // _teamHeroes 留空,讓 updateLeaderboard 容錯處理
                _teamHeroes = [];
              }
              const _teamKey = (typeof window._wbCalcTeamId === 'function')
                ? window._wbCalcTeamId(_teamUids)
                : _teamUids.slice().sort().join('|');
              // ★ FIX 20260519(v13) — 算 tiebreaker 資料
              // ★ v3.11.8(2026-05-27) — 新增 teamBurstCount(本場聯手爆發觸發次數)
              //                          + turns 改抓 G.round(主程式戰鬥引擎用 round 不是 turn)
              //   bug 修補:G.turn 在 _wbSetupAdvForBattle 設成 0 之後就沒人 incr,永遠 0;
              //             真實回合數要從 G.round 抓(主程式 nextRound 會 incr)。
              //   fallback:若 G.round 也沒有(不該發生)就用 G.turn,再 fallback 0。
              const _tieBreaker = {
                turns: (_Gr && _Gr.round) || (_Gr && _Gr.turn) || 0,
                aliveCount: (_Gr && _Gr.p1) ? _Gr.p1.filter(h => h && h.curHp > 0).length : 0,
                quizCorrect: 0,
                teamBurstCount: (typeof window._wbTeamBurstFiredCount === 'number')
                                ? window._wbTeamBurstFiredCount : 0,
              };
              try{
                // ════════════════════════════════════════════════════════════════
                // ★ v3.11.8(2026-05-27) — 修補 quizCorrect 永遠 0 的 bug
                // ────────────────────────────────────────────────────────────────
                // 老師回報:歷史紀錄顯示「回合 — · 答對 0」
                // 根因:_wbMarkQuiz(line ~9703) 寫入結構是 { ok: bool, ts: Date.now() },
                //       但這裡讀 _v.correct(完全沒這個欄位)→ 永遠 undefined → 永遠 0。
                //       turns 顯示「—」是因為 G.turn 未定義/為 0 時被 UI 當成空。
                // 修補:讀 _v.ok === true 累計,每題答對 +1。
                //       (key 是 __q_t<turn>_p<pos>,代表「第 turn 回合第 pos 玩家的答題」)
                // ════════════════════════════════════════════════════════════════
                const _qs = window._wbQuizState || {};
                Object.keys(_qs).forEach(_k => {
                  const _v = _qs[_k];
                  if(_v && _v.ok === true) _tieBreaker.quizCorrect += 1;
                });
              }catch(_eQc){ console.warn('[WB-Leaderboard v3.11.8] quizCorrect 累計例外', _eQc); }
              try{ console.log('[WB-Leaderboard v3.11.8] tieBreaker:', _tieBreaker); }catch(_){}
              if(_teamKey){
                // ★★★ v3.5.43 — 計算四個冠軍 + 收集 dmgSources(老師需求) ★★★
                //   只統計 *Real 欄位(已排除答題獎勵 / 聯手爆發 / 固定傷害)
                //   teamHeroes 對應 _Gr.p1[0..3](玩家四隻英雄)
                let _championStats = null;
                try {
                  const _bs = (_Gr && _Gr.battleStats) || {};
                  const _heroEntries = _teamHeroes.map((th, idx) => {
                    const _name = th && th.name;
                    const _lv = th && th.lv || 1;
                    const _s = (_name && _bs[_name]) || {};
                    return {
                      slot: idx,
                      name: _name || '?',
                      lv: _lv,
                      dmgReal: _s.dmgReal || 0,
                      healReal: _s.healReal || 0,
                      dmgTakenReal: _s.dmgTakenReal || 0,
                      statusCount: _s.statusCount || 0,
                      statusTurnSum: _s.statusTurnSum || 0,
                      // 控場分數 = 次數×10 + 持續回合 (給「最強控場」評比)
                      ctrlScore: ((_s.statusCount||0) * 10) + (_s.statusTurnSum||0),
                    };
                  });
                  // 找各項冠軍(若全部都 0,該欄位留 null)
                  const _findTop = (field) => {
                    const _max = Math.max(0, ...(_heroEntries.map(e => e[field] || 0)));
                    if(_max === 0) return null;
                    const _winner = _heroEntries.find(e => (e[field] || 0) === _max);
                    if(!_winner) return null;
                    return { name: _winner.name, lv: _winner.lv, value: _max };
                  };
                  _championStats = {
                    topDmg:  _findTop('dmgReal'),       // 最高累積傷害(扣除固定)
                    topHeal: _findTop('healReal'),      // 最高累積治療
                    topTank: _findTop('dmgTakenReal'),  // 最強肉盾(承傷越多越強)
                    topCtrl: _findTop('ctrlScore'),     // 最強控場(次數+回合)
                    // 詳細控場資料:給後台顯示「次數 x 回合」
                    topCtrl_detail: (function(){
                      const _max = Math.max(0, ...(_heroEntries.map(e => e.ctrlScore || 0)));
                      if(_max === 0) return null;
                      const _w = _heroEntries.find(e => (e.ctrlScore || 0) === _max);
                      return _w ? { count: _w.statusCount, turnSum: _w.statusTurnSum } : null;
                    })(),
                  };
                } catch(_eCh){
                  console.warn('[WB-Leaderboard v3.5.43] 計算冠軍統計失敗', _eCh);
                }

                // 收集 dmgSources 明細(已含 isFixed 標記 + skill 名稱)
                let _dmgSources = [];
                try {
                  if(_Gr && Array.isArray(_Gr._wbDmgSources)){
                    // 為了 Firestore 大小限制,合併同英雄+同技能的多筆 → 累計 amount
                    const _grouped = {};
                    _Gr._wbDmgSources.forEach(s => {
                      const _key = s.heroName + '||' + s.skill + '||' + (s.isFixed ? 'F' : 'R');
                      if(!_grouped[_key]){
                        _grouped[_key] = {
                          heroName: s.heroName,
                          heroLv: s.heroLv,
                          skill: s.skill,
                          skillLv: s.skillLv || 0,
                          totalDmg: 0,
                          hits: 0,
                          isFixed: s.isFixed,
                        };
                      }
                      _grouped[_key].totalDmg += (s.amount || 0);
                      _grouped[_key].hits += 1;
                    });
                    _dmgSources = Object.values(_grouped)
                      .sort((a,b) => b.totalDmg - a.totalDmg)
                      .slice(0, 40);  // 上限 40 筆,避免單筆 Firestore doc 過大
                  }
                } catch(_eDs){
                  console.warn('[WB-Leaderboard v3.5.43] 收集 dmgSources 失敗', _eDs);
                }

                // ★ v3.5.6 — 把 _teamHeroes 也傳進去
                // ★ v3.5.43 — 把 championStats + dmgSources 也傳進去
                // ★ v3.5.70 — 把 _teamEmails 也傳進去(排行榜班級座號顯示用)
                // ★ v3.12.17 — 把 isBonus 旗標傳進去(補償場次計入排行榜總傷,但戰績/排行榜都標記出來)
                window._wbHpSync.updateLeaderboard(
                  bossId, _teamKey, _teamNames, _dealt, _tieBreaker, _teamHeroes,
                  _championStats, _dmgSources, _teamEmails, _v3_12_17_isBonusBattle
                )
                  .then(res => {
                    if(res) console.log('[WB-Leaderboard] 隊伍排名更新: rank=' + res.rank + ', totalDmg=' + res.totalDmg
                      + ', champions=', _championStats);
                    // ★ v3.12.14(2026-05-31)— 結算上榜後立即標記房間 ended
                    //   不論是房主或 client,都嘗試呼叫 _wbMarkRoomEnded API(冪等,寫多次無害)
                    //   讓房間立刻從公開房列表消失,避免其他玩家加進已結束的房
                    try{
                      if(window._wbNet && window._wbNet.roomId
                         && typeof window._wbMarkRoomEnded === 'function'){
                        window._wbMarkRoomEnded(window._wbNet.roomId, 'battle_settled')
                          .catch(_=>{});
                      }
                    }catch(_eEnd){}
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
      // ★ v3.11.8(2026-05-27) — 抓本場 3 個關鍵數據傳給結算頁顯示
      //   turns = G.round(總回合,主程式戰鬥引擎用 round 不是 turn;G.turn 永遠是 0)
      //   quizCorrect = window._wbQuizState 累計答對數(_v.ok === true 才算)
      //   teamBurstCount = window._wbTeamBurstFiredCount(本場聯手爆發觸發次數)
      let _battleTurns = 0, _battleQuizCorrect = 0, _battleTeamBurst = 0;
      try{
        _battleTurns = (_Gr && _Gr.round) || (_Gr && _Gr.turn) || 0;
        const _qs = window._wbQuizState || {};
        Object.keys(_qs).forEach(_k => {
          if(_qs[_k] && _qs[_k].ok === true) _battleQuizCorrect += 1;
        });
        _battleTeamBurst = (typeof window._wbTeamBurstFiredCount === 'number')
                         ? window._wbTeamBurstFiredCount : 0;
      }catch(_eStat){ console.warn('[WB-Result v3.11.8] 統計抓取例外', _eStat); }
      try{ console.log('[WB-Result v3.11.8] battleTurns=' + _battleTurns + ', quizCorrect=' + _battleQuizCorrect + ', teamBurst=' + _battleTeamBurst); }catch(_){}

      window._wbShowSoloPracticeResult({
        dmg: myDmg,                  // ★ v3.11.8 — 改為傳「你個人」傷害(破紀錄比較基準)
        teamDmg: teamDmg,            // ★ v3.11.8 — 連線模式才有意義,練習等同 myDmg
        heroes: heroes,
        elapsed: elapsed,
        killed: win,
        isNewRecord: isNewRecord,
        evalStats: evalStats,    // ★ 新增評比數據
        // ★ v3.11.8 — 新增:模式標記 + 本場 3 大數據 + 個人最佳對照
        isSolo: isSolo,
        isHost: isHost,
        battleTurns: _battleTurns,
        battleQuizCorrect: _battleQuizCorrect,
        battleTeamBurst: _battleTeamBurst,
        prevBest: _prevBest,         // 結算前的個人最佳(供顯示「破紀錄/未破紀錄」對照)
      });
    }else{
      // fallback alert
      _wbGameAlert(win ? '🏆 火山炎龍王已被擊敗!' : '💀 全員陣亡...');
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
    // ★ v3.12.15(2026-05-30) — 移除此處的 _wbResultExecuting=false
    //   原 v3.12.12 設計錯誤:把重置點對齊 _wbAdvBattleEnded=false,但這裡是
    //   本場結算函式的末段清理 — 如果在本場結尾就重置,後續 600ms fallback
    //   setTimeout 觸發時 _wbResultExecuting 已是 false → 守門失效 → 第二次
    //   跑結算流程(老師 2026-05-30 console log 證實:wbClears 從 1 變 2)。
    //   正確設計:_wbResultExecuting 只在「下一場戰鬥開始時」才重置,
    //   本場結束後維持 true 直到下場開戰。
    //   重置點移到 _wbInstallCheckWinHook 戰鬥開始流程內(已在其他地方有對齊處理)。
    // window._wbResultExecuting = false;  ← 移除!
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
    // ★ v3.11.3(2026-05-27) — 清理崩毀觸發旗標(對齊主程式 _wbSetupAdvForBattle 的 reset)
    //   詳見 index.html line ~49937 的修法註解。雙保險避免下場世界 BOSS 戰打不結束。
    window._wbCollapseTriggered = false;
    // ★ v3.11.6(2026-05-27) — 同時清新版「DONE」旗標
    window._wbCollapseDone = false;
    // ★ v3.11.8(2026-05-27) — 清聯手爆發觸發次數(供下場戰鬥重新累計)
    window._wbTeamBurstFiredCount = 0;
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