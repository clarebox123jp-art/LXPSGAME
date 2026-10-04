/* ============================================================================
 * ⛵ 像素荒島求生記 — 出海探險資料表(minigame/minigame_sea_db.js)
 * ============================================================================
 * ★ v1.370.0(2026-10-04・老師上傳 359 張出海新圖)— 檔尾覆寫區:外島 20 區遮罩依真場景圖重建、入口/出口/藤蔓口袋對齊場景圖、
 *   觀察點/補給點移到最近可走格(避免吸附不到而消失)、翻頁地圖區域標記對齊全景圖。D.LOG 新增 v1.370.0 一筆。
 * ★ v1.369.0(2026-10-04・出海第一包待辦②④)— 平衡沙盤實跑後:外島第 3~5 區遇敵改固定 4 隻(D.ENC num),第 1~2 區維持 3~4 隻。
 *   鳥糞石農田加成全在 index(islFarmFertAll),本檔不動資料。
 * ★ v1.368.0(2026-10-01・老師《荒島出海探險設計書 v0.2》第一包)— 新檔。
 *   外島四島二十區、24 魔物、4 島主、12 夥伴、22 觀察點、32 資源點、材料料理防具科技、等級上限 70。
 *   掛在 window.ISL_DB 上(擴充 minigame_island_db.js,不改動該檔任何一行);
 *   上傳順序:minigame_island_db.js → minigame_sea_db.js → minigame_sw.js → minigame_index.html。
 *   ⚠ 載入順序保險:本檔若比 island_db 先跑(onerror 重試的少見路徑),會把套用函式留在 window.ISL_SEA_APPLY,
 *     index 端 islDB() 第一次取到資料表時補套用一次;重複套用由 D.SEA 是否存在擋住。
 *   ⚠ ES5 only;本檔註解嚴禁出現「星號+斜線」字樣(v1.227.0 教訓)。
 * ============================================================================ */
(function(){
  'use strict';
  function apply(D){
  if(!D || D.SEA) return;
  var _imgKeys0 = {}, _k0;
  for(_k0 in D.IMG){ if(D.IMG.hasOwnProperty(_k0)) _imgKeys0[_k0] = 1; }
  D.SEA_VER = 'v1.378.0';   /* ★ v1.378.0 外島篇主線 c9~c13 + 4 位說話者(檔尾 v1.378.0 區塊);終章最後一句改「本島篇完結」 */

  /* ══════════════════════════════════════════════════════════════════════════
   * ★ v1.368.0(2026-10-01・老師《荒島出海探險設計書 v0.2》第一包:資料層)
   *   ⛵ 終章完成後出海;大地圖左右翻頁 5 頁(本島+4 座外島);每天只能出海 1 次;四島各一種環境機制;
   *   每島 5 區(海底洞穴 5 區場景放大成 64×48 格、4096×3072);每島 1 隻島主;🔭 觀察點;等級上限 50→70。
   *   index 端出口:islSea*(見 minigame_index.html「出海探險模組」),本區只放資料。
   *   ⚠ 本區註解嚴禁出現「星號+斜線」字樣(v1.227.0 教訓)。
   *   ⚠ 外島遮罩目前是程式產生的暫用版(D.seaMask),老師場景圖上傳後改用逐像素法重建,座標一律由 index 端 islSnapCell 吸附。
   * ══════════════════════════════════════════════════════════════════════════ */
  D.ADV.MAX = 70; D.PET_LV.MAX = 70; D.STAT_MAX = 70; D.SKILL_MAX = 70;
  D.CAP_MAIN = 50;   /* 本島最多練到 50;51~70 只能在外島(外島戰鬥/外島活動)取得 */

  D.SEA = {
    dayLimit: 1,                 /* 每天出海次數(老師裁定:每天只能出海 1 次,免費) */
    eliteP: 0.20,                /* 外島野外精英機率(本島 D.ELITE.P = 0.12) */
    guardOrderMax: 4,            /* 1~4 區每天第一場戰鬥有一隻必定精英(區域守衛) */
    joinLv: { ice:45, jungle:50, storm:55, deep:60 },   /* 外島夥伴加入時的等級(Lv1 加入在 Lv50+ 的島上完全派不上用場) */
    ISLES: [
      { id:'ice',    n:'冰天雪地島', e:'❄', map:'seamap_ice',    color:'#cfe8f5', sea:'#5a8fb5',
        unlock:{ t:'ending' }, unlockText:'完成終章「島的新樣貌」',
        meter:{ k:'temp', n:'體溫', e:'🌡', max:100, perCells:10, drain:5, zeroCells:10, zeroHurtP:5, gear:'qiviutcoat', wxMul:2, slowAtZero:0.8,
                lowTxt:'好冷……手腳都凍僵了,快找營火堆取暖!', refill:'warm' },
        wx:{ bad:'blizzard', n:'暴風雪', e:'🌨' } },
      { id:'jungle', n:'熱帶雨林島', e:'🌴', map:'seamap_jungle', color:'#3f8f4a', sea:'#2f7d8f',
        unlock:{ t:'boss', boss:'ice_peak' }, unlockText:'擊敗冰雪島主「冰河猛瑪王」',
        meter:{ k:'water', n:'水分', e:'💧', max:100, perCells:10, drain:5, zeroCells:10, zeroHurtP:5, gear:'junglesuit', rainStop:true,
                lowTxt:'好渴……汗一直流,要趕快補充水分!', refill:'drink', drinkItem:'water', drinkAdd:40 },
        wx:{ bad:'storm', n:'午後雷陣雨', e:'⛈' } },
      { id:'storm',  n:'狂風暴雨島', e:'🌀', map:'seamap_storm',  color:'#56606e', sea:'#2c3e50',
        unlock:{ t:'boss', boss:'jungle_giant' }, unlockText:'擊敗雨林島主「絞殺巨木靈」',
        gust:{ everySec:8, warnSec:1.2, cells:[1,3], gear:'stormcoat' },
        bolt:{ everySec:7, warnSec:2, hurtP:15, r:56, gear:'stormcoat' },
        wx:{ bad:'gale', n:'狂風暴雨', e:'🌬' } },
      { id:'deep',   n:'海底洞穴',   e:'🌊', map:'seamap_deep',   color:'#0d3b66', sea:'#06223d',
        unlock:{ t:'boss', boss:'storm_eye', tech:'divehelmet' }, unlockText:'擊敗風暴島主「颶風元靈」+ 研究科技「潛水頭盔」',
        meter:{ k:'oxy', n:'氧氣', e:'🫧', max:100, perSec:1, darkMul:1.5, zeroHurtP:3, gear:'divesuit',
                lowTxt:'快沒氣了!游到氣泡柱補充氧氣!', refill:'bubble' },
        wx:null }
    ],
    /* 區域 4 的入場裝備(沒有就鎖住);key = 島 id */
    gate4: { ice:{ armor:'qiviutcoat', txt:'製作「麝牛絨大衣」' }, jungle:{ tool:'machete', txt:'製作工具「開山刀」' },
             storm:{ armor:'stormcoat', txt:'製作「防風雨衣」' }, deep:{ armor:'divesuit', txt:'製作「潛水服」' } },
    /* 補給點(POI) */
    REFILL: { warm:{ n:'營火堆', e:'🔥', img:'poi_warm', add:100, txt:'烤烤火,身體暖起來了!' },
              drink:{ n:'葉腋小水池', e:'💧', img:'node_bromeliad', add:50, txt:'鳳梨科植物葉子間積著乾淨的雨水,喝了好幾口。' },
              bubble:{ n:'氣泡柱', e:'🫧', img:'poi_bubble', add:100, txt:'從岩縫冒出的大氣泡,氧氣補滿了!' } },
    BOAT: { n:'帆船', e:'⛵', img:'poi_boat', label:'帆船(回本島營地)' },
    VINE: { n:'藤蔓簾', e:'🌿', img:'node_vine', tool:'machete', ap:1, txt:'用開山刀把藤蔓砍開了!(明天會再長回來)' },
    BGM: { map:'sea_map', ice:'sea_ice', jungle:'sea_jungle', storm:'sea_storm', deep:'sea_deep',
           boss_ice:'sea_boss_ice', boss_jungle:'sea_boss_jungle', boss_storm:'sea_boss_storm', boss_deep:'sea_boss_deep' },
    sailTxt: [ '起錨!帆鼓起來了——', '海風把帆船推向遠方的島……' ]
  };
  D.seaIsle = function(id){ var i; for(i = 0; i < D.SEA.ISLES.length; i++){ if(D.SEA.ISLES[i].id === id) return D.SEA.ISLES[i]; } return null; };

  /* ── 外島 20 區(不放進 D.ZONES:本島地圖、迷霧、劇情、回憶紀錄等既有迴圈全都只認本島 11 區,外島另走 index 端 islSea* 流程) ── */
  D.SEA_ZONES = [
    { id:'ice_coast',      isle:'ice',    order:1, n:'企鵝冰岸',   e:'🐧', map:{x:50,y:80}, lv:[50,53] },
    { id:'ice_taiga',      isle:'ice',    order:2, n:'雲杉雪林',   e:'🌲', map:{x:27,y:58}, lv:[51,54] },
    { id:'ice_tundra',     isle:'ice',    order:3, n:'凍原苔原',   e:'🌾', map:{x:68,y:56}, lv:[52,55] },
    { id:'ice_glacier',    isle:'ice',    order:4, n:'藍冰冰河',   e:'🧊', map:{x:38,y:32}, lv:[53,56] },
    { id:'ice_peak',       isle:'ice',    order:5, n:'極光冰峰',   e:'🏔', map:{x:60,y:13}, lv:[54,57] },
    { id:'jungle_mangrove',isle:'jungle', order:1, n:'紅樹林河口', e:'🌳', map:{x:30,y:80}, lv:[55,58] },
    { id:'jungle_floor',   isle:'jungle', order:2, n:'雨林底層',   e:'🍃', map:{x:52,y:62}, lv:[56,59] },
    { id:'jungle_canopy',  isle:'jungle', order:3, n:'林冠吊橋',   e:'🌉', map:{x:74,y:44}, lv:[57,60] },
    { id:'jungle_swamp',   isle:'jungle', order:4, n:'黑水沼澤',   e:'🪷', map:{x:27,y:40}, lv:[58,61] },
    { id:'jungle_giant',   isle:'jungle', order:5, n:'千年巨木',   e:'🌴', map:{x:52,y:18}, lv:[59,62] },
    { id:'storm_reef',     isle:'storm',  order:1, n:'破浪礁岸',   e:'🌊', map:{x:20,y:78}, lv:[60,63] },
    { id:'storm_colony',   isle:'storm',  order:2, n:'海鳥繁殖崖', e:'🐦', map:{x:73,y:74}, lv:[61,64] },
    { id:'storm_moor',     isle:'storm',  order:3, n:'風蝕石林',   e:'🗿', map:{x:75,y:38}, lv:[62,65] },
    { id:'storm_wreck',    isle:'storm',  order:4, n:'沉船燈塔灣', e:'🗼', map:{x:24,y:34}, lv:[63,66] },
    { id:'storm_eye',      isle:'storm',  order:5, n:'風暴之眼',   e:'🌀', map:{x:50,y:54}, lv:[64,67] },
    { id:'deep_reef',      isle:'deep',   order:1, n:'珊瑚礁淺海', e:'🪸', map:{x:30,y:14}, lv:[65,68] },
    { id:'deep_kelp',      isle:'deep',   order:2, n:'巨藻森林',   e:'🌿', map:{x:66,y:30}, lv:[66,69] },
    { id:'deep_wreck',     isle:'deep',   order:3, n:'沉船洞窟',   e:'⚓', map:{x:32,y:50}, lv:[67,70] },
    { id:'deep_abyss',     isle:'deep',   order:4, n:'發光深淵',   e:'✨', map:{x:66,y:68}, lv:[68,71] },
    { id:'deep_vent',      isle:'deep',   order:5, n:'熱泉巨穴',   e:'♨', map:{x:44,y:86}, lv:[69,72] }
  ];
  (function(){
    var i, z, isle;
    for(i = 0; i < D.SEA_ZONES.length; i++){
      z = D.SEA_ZONES[i]; isle = D.seaIsle(z.isle);
      z.sea = true; z.p1 = true;
      if(z.order === 1) z.unlockText = '跟著島一起開放';
      else if(z.order === 4) z.unlockText = '前一區探索 ≥50% + ' + D.SEA.gate4[z.isle].txt;
      else z.unlockText = '前一區探索 ≥50%';
      D.IMG['zone_' + z.id] = 'island_zone_' + z.id + '.jpg';
      if(!D.IMG[isle.map]) D.IMG[isle.map] = 'island_' + isle.map + '.jpg';
    }
  })();
  D.seaZone = function(id){ var i; for(i = 0; i < D.SEA_ZONES.length; i++){ if(D.SEA_ZONES[i].id === id) return D.SEA_ZONES[i]; } return null; };
  D.seaZonesOf = function(isle){ var a = [], i; for(i = 0; i < D.SEA_ZONES.length; i++){ if(D.SEA_ZONES[i].isle === isle) a.push(D.SEA_ZONES[i]); } return a; };
  /* D.zone() 改成兩張表都找:研究卡片「→ 解鎖 ○○」、區域頂端名稱、首次踏進橫幅、遇敵等既有呼叫點不必逐一改寫 */
  (function(){ var _z0 = D.zone; D.zone = function(id){ return _z0(id) || D.seaZone(id); }; })();
  D.IMG.poi_boat = 'island_poi_boat.png'; D.IMG.poi_warm = 'island_poi_warm.png'; D.IMG.poi_bubble = 'island_poi_bubble.png'; D.IMG.node_vine = 'island_node_vine.png'; D.IMG.tech_divehelmet = 'island_tech_divehelmet.png';

  /* ── 暫用遮罩產生器(場景圖上傳前先能走、能測):邊框牆、入口在左緣中段、出口在右緣中段,中間一條保底通道永遠可走;
       散布石塊/樹叢障礙(依區 id 當種子,每次結果一樣);water:'bottom'|'top' 留水域;vine:true 在右上角圍出一塊藤蔓口袋。
       產生後 BFS 把走不到的可走格封起來(藤蔓格當作可通過計算,口袋裡的資源才不會被封掉)。 ── */
  D.seaHash = function(s){ var h = 2166136261, i; for(i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; } return h >>> 0; };
  D.seaRng = function(seed){ var s = seed >>> 0 || 1; return function(){ s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
  D.seaMask = function(id, W, H, opt){
    var o = opt || {}, rnd = D.seaRng(D.seaHash('mask|' + id)), g = [], x, y, i, k, cx, cy, r, mid = Math.floor(H / 2), wb = o.water ? Math.max(3, Math.round(H * 0.16)) : 0, q, head, seen, cur, nb, d, out = [];
    for(y = 0; y < H; y++){ g.push([]); for(x = 0; x < W; x++){ g[y].push((x === 0 || y === 0 || x === W - 1 || y === H - 1) ? '#' : '.'); } }
    if(o.water === 'bottom'){ for(y = H - 1 - wb; y < H - 1; y++){ for(x = 1; x < W - 1; x++){ if(y > H - 1 - wb + (D.seaHash(id + x) % 2)) g[y][x] = '~'; } } }
    if(o.water === 'top'){ for(y = 1; y <= wb; y++){ for(x = 1; x < W - 1; x++){ if(y < wb - (D.seaHash(id + x) % 2)) g[y][x] = '~'; } } }
    k = Math.round(W * H / (o.dense ? 55 : 75));
    for(i = 0; i < k; i++){
      cx = 2 + Math.floor(rnd() * (W - 4)); cy = 2 + Math.floor(rnd() * (H - 4)); r = rnd() < 0.3 ? 2 : 1;
      if(Math.abs(cy - mid) <= 1) continue;
      for(y = cy - r; y <= cy + r; y++){ for(x = cx - r; x <= cx + r; x++){ if(x > 0 && y > 0 && x < W - 1 && y < H - 1 && g[y][x] === '.' && (Math.abs(x - cx) + Math.abs(y - cy) <= r + (rnd() < 0.5 ? 0 : 1))) g[y][x] = (o.pond && rnd() < 0.35) ? '~' : '#'; } }
    }
    for(x = 1; x < W - 1; x++){ for(y = mid - 1; y <= mid + 1; y++){ if(g[y][x] === '#' || g[y][x] === '~') g[y][x] = '.'; } }
    for(y = mid - 2; y <= mid + 2; y++){ for(x = 1; x <= 4; x++){ g[y][x] = '.'; } for(x = W - 5; x <= W - 2; x++){ g[y][x] = '.'; } }
    if(o.vine){
      var vx = Math.floor(W * 0.62), vy = Math.max(3, mid - 3);
      for(y = 1; y <= vy; y++){ if(g[y][vx] !== '~') g[y][vx] = 'v'; }
      for(x = vx; x < W - 1; x++){ if(g[vy][x] !== '~') g[vy][x] = 'v'; }
      for(y = 2; y < vy - 1; y++){ for(x = vx + 2; x < W - 3; x++){ if(g[y][x] === '#' && rnd() < 0.6) g[y][x] = '.'; } }
    }
    q = [{ x: 2, y: mid }]; seen = {}; seen[2 + ',' + mid] = 1; head = 0; nb = [[1,0],[-1,0],[0,1],[0,-1]];
    while(head < q.length){ cur = q[head++]; for(d = 0; d < 4; d++){ x = cur.x + nb[d][0]; y = cur.y + nb[d][1]; if(x < 0 || y < 0 || x >= W || y >= H || seen[x + ',' + y]) continue; if(g[y][x] !== '.' && g[y][x] !== 'v') continue; seen[x + ',' + y] = 1; q.push({ x: x, y: y }); } }
    for(y = 0; y < H; y++){ for(x = 0; x < W; x++){ if(g[y][x] === '.' && !seen[x + ',' + y]) g[y][x] = '#'; } out.push(g[y].join('')); }
    return out;
  };
  /* 候選點池:在指定範圍內均勻撒點(進場時再由 index 端吸附到最近可走格) */
  D.seaPool = function(id, kind, n, W, H, box){
    var rnd = D.seaRng(D.seaHash('pool|' + id + '|' + kind)), a = [], i, b = box || { x0: 2, y0: 2, x1: W - 3, y1: H - 3 };
    for(i = 0; i < n; i++) a.push({ x: b.x0 + Math.floor(rnd() * (b.x1 - b.x0 + 1)), y: b.y0 + Math.floor(rnd() * (b.y1 - b.y0 + 1)) });
    return a;
  };

  /* ── 外島材料/料理(圖片 island_res_<id>.png 128×128 去背;料理 island_res_d_<id>.png;sea:{temp|water|oxy} = 吃下去補環境計量條) ── */
  (function(){
    var IT = {
      ice:          { n:'冰塊',     e:'🧊', cat:'res' },
      krill:        { n:'磷蝦',     e:'🦐', cat:'food' },
      cloudberry:   { n:'雲莓',     e:'🫐', cat:'dish', eat:{ hp:15, ap:0 } },
      lichen:       { n:'馴鹿苔',   e:'🍂', cat:'res' },
      qiviut:       { n:'麝牛絨',   e:'🧶', cat:'res' },
      frostcrystal: { n:'冰晶',     e:'❄', cat:'misc' },
      ivory:        { n:'猛瑪象牙', e:'🦣', cat:'misc' },
      coconut:      { n:'椰子',     e:'🥥', cat:'dish', eat:{ hp:10, ap:0 }, sea:{ water:30 } },
      banana:       { n:'香蕉',     e:'🍌', cat:'dish', eat:{ hp:15, ap:0 } },
      cacao:        { n:'可可豆',   e:'🫘', cat:'food' },
      nut:          { n:'巴西堅果', e:'🥜', cat:'dish', eat:{ hp:12, ap:0 } },
      latex:        { n:'天然乳膠', e:'🧴', cat:'res' },
      cactus:       { n:'仙人掌',   e:'🌵', cat:'dish', eat:{ hp:8, ap:0 }, sea:{ water:20 } },
      guano:        { n:'鳥糞石',   e:'🪨', cat:'res' },
      coralbit:     { n:'珊瑚碎',   e:'🪸', cat:'misc' },
      kelp:         { n:'巨藻',     e:'🥬', cat:'food' },
      urchin:       { n:'海膽',     e:'🟣', cat:'food' },
      sulfide:      { n:'硫化礦',   e:'🟨', cat:'misc' },
      airtank:      { n:'空氣瓶',   e:'🫙', cat:'dish', eat:{ hp:5, ap:0 }, sea:{ oxy:50 } },
      core_mammoth:    { n:'猛瑪冰核',   e:'🧊', cat:'misc' },
      core_treespirit: { n:'巨木之心',   e:'💚', cat:'misc' },
      core_hurricane:  { n:'風暴之眼石', e:'🌀', cat:'misc' },
      core_giantsquid: { n:'深淵墨珠',   e:'⚫', cat:'misc' },
      d_cocoa:       { n:'熱可可',     e:'☕', cat:'dish', eat:{ hp:30, ap:0 }, sea:{ temp:40 } },
      d_krillsoup:   { n:'磷蝦熱湯',   e:'🍲', cat:'dish', eat:{ hp:35, ap:0 }, sea:{ temp:40 } },
      d_bananacoco:  { n:'椰香烤蕉',   e:'🍌', cat:'dish', eat:{ hp:30, ap:0 }, sea:{ water:30 } },
      d_cactusjuice: { n:'仙人掌果汁', e:'🥤', cat:'dish', eat:{ hp:15, ap:1 }, sea:{ water:40 } },
      d_kelpsoup:    { n:'海膽海藻湯', e:'🥣', cat:'dish', eat:{ hp:50, ap:0 } }
    }, k, SELL = { ice:2, krill:3, cloudberry:3, lichen:2, qiviut:6, frostcrystal:10, ivory:25, coconut:3, banana:2, cacao:4, nut:3, latex:6,
      cactus:2, guano:4, coralbit:4, kelp:2, urchin:4, sulfide:12, airtank:6, core_mammoth:40, core_treespirit:40, core_hurricane:40, core_giantsquid:40,
      d_cocoa:8, d_krillsoup:8, d_bananacoco:7, d_cactusjuice:6, d_kelpsoup:10 };
    for(k in IT){ if(!IT.hasOwnProperty(k)) continue;
      IT[k].img = 'res_' + k; D.ITEMS[k] = IT[k]; D.IMG['res_' + k] = 'island_res_' + k + '.png';
      if(D.ITEM_ORDER.indexOf(k) < 0) D.ITEM_ORDER.push(k);
      if(SELL[k] != null) D.SHOP.sell[k] = SELL[k];
    }
  })();
  D.RECIPES.push(
    { id:'d_cocoa',       n:'熱可可',     e:'☕', need:{ cacao:2, milk:1 },   heat:'low', sea:true, why:'可可豆要先發酵、烘焙、磨碎才有巧克力香;用小火慢慢煮,奶才不會燒焦結塊。' },
    { id:'d_krillsoup',   n:'磷蝦熱湯',   e:'🍲', need:{ krill:3, water:1 },  heat:'low', sea:true, why:'磷蝦是南極海洋食物鏈的基礎,鯨魚、企鵝、海豹都靠牠們過活;熱湯能把熱量直接帶進身體。' },
    { id:'d_bananacoco',  n:'椰香烤蕉',   e:'🍌', need:{ banana:2, coconut:1 }, heat:'mid', sea:true, why:'香蕉其實是很大的草本植物不是樹;烤過之後澱粉分解成糖,會變得更甜。' },
    { id:'d_cactusjuice', n:'仙人掌果汁', e:'🥤', need:{ cactus:2, water:1 }, heat:'low', sea:true, why:'仙人掌的莖可以儲存大量的水,葉子退化成刺,減少水分從葉面蒸散。' },
    { id:'d_kelpsoup',    n:'海膽海藻湯', e:'🥣', need:{ urchin:2, kelp:2 },  heat:'low', sea:true, why:'海膽太多會把巨藻吃光,適量採海膽反而能保護巨藻森林——這叫「生態平衡」。' }
  );
  D.SHOP.buy.push({ id:'airtank2', n:'空氣瓶 ×2', e:'🫙', price:{ shell:14 }, needZone:'deep_reef', give:{ item:'airtank', q:1, n:2 }, d:'阿獺用椰殼加壓灌滿空氣——氣體可以被壓縮,所以小小一瓶能裝很多。' });

  /* ── 四件環境防具(第 11~14 階):穿著時對應外島的環境計量條消耗減半(seaGear) ── */
  D.ARMORS.push(
    { id:'qiviutcoat', n:'麝牛絨大衣', e:'🧥', img:'am_qiviutcoat', tier:11, def:42, cut:3, spd:0, ail:20, hand:false, seaGear:'ice',
      cost:{ qiviut:8, fiber:10, lichen:4 },
      d:'用麝牛冬天脫落的底絨織成的大衣,比羊毛暖好幾倍。(冰天雪地島:體溫下降速度減半)', sci:'麝牛的底絨又細又密,能鎖住一層不流動的空氣;空氣不容易傳熱,所以是最好的保暖層。',
      parts:[ {k:'down', n:'絨毛內襯', need:'qiviut', hint:'越細的絨毛鎖住越多空氣', e:'🧶'}, {k:'shell', n:'外衣', need:'fiber', hint:'外層要擋風', e:'🌿'}, {k:'pad', n:'苔蘚填充', need:'lichen', hint:'乾燥的地衣塞進縫隙', e:'🍂'} ] },
    { id:'junglesuit', n:'雨林防蟲裝', e:'🦟', img:'am_junglesuit', tier:12, def:46, cut:3, spd:1, ail:30, hand:false, seaGear:'jungle',
      cost:{ latex:6, leaf:10, fiber:8 },
      d:'淺色長袖加上橡膠防水層,不悶熱又不被蚊蟲叮。(熱帶雨林島:水分下降速度減半)', sci:'淺色衣服反射陽光比較涼;長袖長褲把皮膚包起來,蚊子和水蛭就叮不到。',
      parts:[ {k:'coat', n:'防水層', need:'latex', hint:'乳膠塗上去晾乾就不透水', e:'🧴'}, {k:'cloth', n:'淺色布料', need:'leaf', hint:'大葉曬乾撕成條編織', e:'🍃'}, {k:'sew', n:'縫線', need:'fiber', hint:'袖口褲管縫緊', e:'🌿'} ] },
    { id:'stormcoat', n:'防風雨衣', e:'🌂', img:'am_stormcoat', tier:13, def:50, cut:4, spd:0, ail:15, hand:false, seaGear:'storm',
      cost:{ latex:8, fiber:10, feather:8 },
      d:'橡膠雨衣加羽毛內裡,不怕雨淋也不導電。(狂風暴雨島:陣風推力與落雷傷害減半)', sci:'橡膠是絕緣體,電流很難通過;表面光滑又防水,風雨都吹不進去。',
      parts:[ {k:'coat', n:'橡膠外層', need:'latex', hint:'整件塗滿才不會漏水', e:'🧴'}, {k:'lining', n:'羽毛內裡', need:'feather', hint:'羽毛保暖又輕', e:'🪶'}, {k:'sew', n:'縫線', need:'fiber', hint:'接縫要壓緊', e:'🌿'} ] },
    { id:'divesuit', n:'潛水服', e:'🤿', img:'am_divesuit', tier:14, def:54, cut:4, spd:1, ail:20, hand:false, seaGear:'deep',
      cost:{ latex:10, kelp:6, coralbit:4 },
      d:'貼身的橡膠潛水服,在冰冷的深海也不會失溫。(海底洞穴:氧氣消耗減半)', sci:'在水裡身體散熱比在空氣中快 20 多倍;潛水服包住一層薄薄的水,被體溫加熱後就像保溫層。',
      parts:[ {k:'skin', n:'橡膠衣身', need:'latex', hint:'要剛好貼身,水才不會一直流進來', e:'🧴'}, {k:'seal', n:'巨藻封邊', need:'kelp', hint:'滑滑的巨藻壓在接縫', e:'🥬'}, {k:'weight', n:'珊瑚配重', need:'coralbit', hint:'加一點重量才潛得下去', e:'🪸'} ] }
  );
  D.ARMOR_EXT.qiviutcoat = { route:'mid',   res:{ cold:50 } };
  D.ARMOR_EXT.junglesuit = { route:'light', res:{ poison:50 } };
  D.ARMOR_EXT.stormcoat  = { route:'mid',   res:{ thunder:50, cold:20 } };
  D.ARMOR_EXT.divesuit   = { route:'light', res:{ cold:30, poison:20 } };
  D.ARMOR_TIER_ORDER.push('qiviutcoat', 'junglesuit', 'stormcoat', 'divesuit');
  D.IMG.am_qiviutcoat = 'island_am_qiviutcoat.png'; D.IMG.am_junglesuit = 'island_am_junglesuit.png'; D.IMG.am_stormcoat = 'island_am_stormcoat.png'; D.IMG.am_divesuit = 'island_am_divesuit.png';
  D.TOOLS.push({ id:'machete', n:'開山刀', e:'🔪', cost:{ ore:4, wood:3, fiber:4 }, eff:{ chop:1 }, d:'又寬又薄的刀刃,一揮就能砍開雨林的藤蔓;伐木也多 1 木。',
    parts:[ {k:'blade', n:'刀刃', need:'ore', hint:'刀刃越薄,壓力越大越好砍', e:'🟫'}, {k:'grip', n:'刀柄', need:'wood', hint:'握得穩才不會滑手', e:'🪵'}, {k:'wrap', n:'纏繩', need:'fiber', hint:'纏緊防滑', e:'🌿'} ] });
  D.TECHS.push({ id:'divehelmet', n:'潛水頭盔', e:'🤿', tech:35, cost:{ frostcrystal:4, latex:4, crystal:2 }, unlocks:'deep_reef', src:'🫁', dst:'🌊', pz:'把空氣管從壓縮瓶接到頭盔',
    d:'把空氣加壓送進頭盔,人就能在水底呼吸——水越深壓力越大,空氣要加壓才吸得進肺裡。' });

  /* ── 外島資源點(圖 island_node_<kind>.png 192×192 去背)。kind = 圖鑑 id;act 沿用既有活動(採集/伐木/採石/捕魚),題庫與品質小遊戲照舊 ── */
  D.SEA_NODES = {
    floe:        { act:'gather', e:'🧊', gives:'ice',          label:'浮冰塊',     cat:'earth',  d:'海面上漂來的浮冰。海水結冰時會把鹽分擠出去,所以浮冰融化後幾乎是淡水,極地探險隊就靠它取水。' },
    krill:       { act:'fish',   e:'🦐', gives:'krill',        label:'磷蝦群',     cat:'animal', d:'南極磷蝦只有手指長,數量卻多到能把海水染成粉紅色;藍鯨一天可以吃掉好幾噸磷蝦,是南極食物鏈的基礎。' },
    spruce:      { act:'chop',   e:'🌲', gives:'wood',         label:'雲杉',       cat:'plant',  d:'北方針葉林的主角。葉子細得像針、表面有蠟,能減少冬天水分散失;樹形像尖塔,積雪會自己滑落,枝條不會被壓斷。' },
    cloudberry:  { act:'gather', e:'🫐', gives:'cloudberry',   label:'雲莓叢',     cat:'plant',  d:'長在寒冷沼澤和苔原上的橘黃色莓果,維生素 C 比柳丁還多,北歐人會把它做成果醬。' },
    lichen:      { act:'gather', e:'🍂', gives:'lichen',       label:'馴鹿苔',     cat:'plant',  d:'其實不是苔,是「地衣」——真菌和藻類合作共生的生物:藻類行光合作用做養分、真菌保住水分。冬天馴鹿就靠它過活。' },
    willow:      { act:'gather', e:'🌿', gives:'fiber',        label:'北極柳',     cat:'plant',  d:'世界上最矮的樹之一,只有幾公分高,貼著地面長才不會被寒風吹倒;它的枝條很韌,可以剝出纖維。' },
    poppy:       { act:'gather', e:'🌼', gives:'herb',         label:'北極罌粟',   cat:'plant',  d:'花朵像小碟子一樣會跟著太陽轉,把陽光集中到花心取暖,小昆蟲很喜歡停在裡面曬太陽。' },
    muskox:      { act:'gather', e:'🐂', gives:'qiviut',       label:'麝牛群(撿脫落的絨毛)', cat:'animal', d:'麝牛是冰河時期就存在的動物,長毛底下有一層極細的底絨,春天會自然脫落;只撿掉在地上的絨毛,不會傷害牠們。' },
    frostore:    { act:'quarry', e:'💠', gives:'frostcrystal', label:'冰晶礦',     cat:'earth',  d:'冰河底下被壓得又密又硬的透明晶體,在陽光下閃著藍光;冰河的冰因為空氣被擠掉了,看起來是藍色的。' },
    mammoth:     { act:'quarry', e:'🦣', gives:'ivory',        label:'冰封猛瑪牙', cat:'earth',  chance:0.35, d:'從凍土裡露出來的猛瑪象長牙。猛瑪象在大約四千年前才完全滅絕,西伯利亞凍土裡常挖到保存完整的遺骸。' },
    mangrove:    { act:'chop',   e:'🌳', gives:'wood',         label:'紅茄苳',     cat:'plant',  d:'紅樹林植物長在海水和淡水交界的泥灘上,用支柱根撐住身體;種子在樹上就先發芽(胎生苗),掉下來直接插進泥裡生長。' },
    coconut:     { act:'gather', e:'🌴', gives:'coconut',      label:'椰子樹',     cat:'plant',  d:'椰子的外殼有厚厚的纖維,能浮在海上漂好幾個月,漂到別的海岸再發芽——所以熱帶海邊到處都有椰子樹。' },
    banana:      { act:'gather', e:'🍌', gives:'banana',       label:'香蕉叢',     cat:'plant',  d:'香蕉是世界上最大的草本植物,看起來像樹幹的部分其實是一層層葉鞘捲成的「假莖」。' },
    cacao:       { act:'gather', e:'🍫', gives:'cacao',        label:'可可樹',     cat:'plant',  d:'可可的花和果實直接長在樹幹上(幹生花),由小小的蠓蟲授粉;一顆可可果裡有 30~50 顆可可豆。' },
    bromeliad:   { act:'gather', e:'🪴', gives:'water',        label:'鳳梨科附生植物', cat:'plant', d:'長在樹枝上的鳳梨科植物,葉子圍成一個小水杯接雨水,裡面住著蝌蚪、昆蟲,是樹上的「迷你池塘」。' },
    brazilnut:   { act:'gather', e:'🌰', gives:'nut',          label:'巴西堅果樹', cat:'plant',  d:'可以長到 50 公尺高;它的果殼超硬,只有刺豚鼠咬得開,牠們把吃不完的堅果埋起來,忘記的就長成新樹。' },
    rubber:      { act:'gather', e:'🌳', gives:'latex',        label:'橡膠樹',     cat:'plant',  d:'在樹皮上割一道斜口,白色的乳膠會慢慢流出來;乳膠凝固後就是天然橡膠,可以做輪胎、雨鞋和手套。' },
    victoria:    { act:'gather', e:'🪷', gives:'leaf',         label:'王蓮',       cat:'plant',  d:'亞馬遜河的巨大睡蓮,葉子直徑可達 3 公尺,葉背有像肋骨一樣的粗葉脈撐住,能承載一個小孩的重量。' },
    dunegrass:   { act:'gather', e:'🌾', gives:'fiber',        label:'濱草',       cat:'plant',  d:'長在海邊沙丘的草,根又長又密能抓住沙子,讓沙丘不被風吹走;葉子會捲起來減少被風吹乾。' },
    basalt:      { act:'quarry', e:'🪨', gives:'stone',        label:'玄武岩',     cat:'earth',  d:'火山噴出的岩漿在地表快速冷卻形成的黑色岩石,常裂成六角柱狀;台灣的澎湖就有很多玄武岩柱。' },
    guano:       { act:'gather', e:'🪨', gives:'guano',        label:'鳥糞石',     cat:'earth',  d:'海鳥的糞便在乾燥的島上堆積了幾百年變成石頭,含有大量的磷和氮,以前是很珍貴的天然肥料。' },
    flagtree:    { act:'chop',   e:'🌲', gives:'wood',         label:'旗形樹',     cat:'plant',  d:'迎風那一面的芽都被強風吹死了,樹枝只往背風面長,整棵樹就像一面被風吹著的旗子——看它就知道風從哪裡來。' },
    cactus:      { act:'gather', e:'🌵', gives:'cactus',       label:'梨果仙人掌', cat:'plant',  d:'加拉巴哥群島的梨果仙人掌會長成大樹的樣子,把扁扁的莖抬高,不讓象龜吃到;它的果實和莖都可以吃。' },
    wreck:       { act:'quarry', e:'⚓', gives:'ore', bonus:'trash', label:'沉船殘骸', cat:'earth', d:'被暴風雨打上岸的老船。木頭被海蟲蛀得都是洞,鐵件生滿了鏽——鹽分和水氣會讓鐵氧化得特別快。' },
    coraldebris: { act:'gather', e:'🪸', gives:'coralbit',     label:'珊瑚碎屑',   cat:'animal', d:'珊瑚是動物不是植物!活珊瑚絕對不能採,這裡只撿已經死掉、被浪打碎的碎片。珊瑚礁是海洋生物的家,只占海底 1% 卻住了四分之一的海洋生物。' },
    seagrass:    { act:'gather', e:'🌱', gives:'fiber',        label:'海草床',     cat:'plant',  d:'海草是會開花的植物,不是藻類;海草床是海龜和儒艮的食堂,也是小魚躲藏長大的育嬰室。' },
    kelp:        { act:'gather', e:'🌿', gives:'kelp',         label:'巨藻',       cat:'plant',  d:'巨藻一天可以長 50 公分,高度超過 30 公尺,在海裡長成一片「森林」;靠葉子上的小氣囊浮起來向著陽光。' },
    urchinbed:   { act:'gather', e:'🟣', gives:'urchin',       label:'海膽群',     cat:'animal', d:'海膽吃巨藻的根部,海膽太多會把整片巨藻森林啃光;海獺吃海膽,所以海獺是巨藻森林的守護者。' },
    wreckchest:  { act:'quarry', e:'🧰', gives:'relic', bonus:'ore', label:'沉船寶箱', cat:'earth', d:'古帆船上的木箱,裡面的金屬器具早就鏽成一團。沉船會慢慢被珊瑚和海綿覆蓋,變成人工魚礁。' },
    anchor:      { act:'quarry', e:'⚓', gives:'ore',          label:'鏽錨鏈',     cat:'earth',  d:'沉在海底的大鐵錨。鐵在海水裡會生鏽,鏽蝕的速度跟水溫、鹽分和氧氣多少有關。' },
    lanternfish: { act:'fish',   e:'🐟', gives:'fish',         label:'燈籠魚群',   cat:'animal', d:'身上有一排排會發光的發光器,白天待在幾百公尺深的海裡,晚上才游上淺海覓食,是數量最多的脊椎動物之一。' },
    smoker:      { act:'quarry', e:'♨', gives:'sulfide',      label:'黑煙囪',     cat:'earth',  d:'深海熱泉噴出 300 多度、富含礦物的熱水,遇到冰冷海水就沉澱出黑色的硫化礦,慢慢堆成高高的煙囪。' }
  };
  /* ── 🔭 觀察點(圖 island_obs_<k>.png 192×192 去背):不耗 AP、答 1 題收進圖鑑+少量貝幣;只觀察、不打擾 ── */
  D.SEA_OBS = {
    adelie:      { n:'阿德利企鵝', e:'🐧', cat:'animal', d:'南極最常見的企鵝,會用小石頭堆巢,公企鵝還會撿漂亮的石頭送給母企鵝;牠們在水裡用翅膀「飛」。',
                   q:{ q:'企鵝不會飛,翅膀是拿來做什麼的?', o:['在水裡划水游泳','拿來搧風讓自己涼快','拿來把魚抓住吃掉','用來在雪地挖洞穴'], a:0, why:'企鵝的翅膀變成又硬又扁的鰭狀肢,在水裡像槳一樣划,游泳速度很快。' } },
    weddell:     { n:'威德爾海豹', e:'🦭', cat:'animal', d:'住在最南邊的哺乳類之一,能潛到 600 公尺深、憋氣超過一小時;牠用牙齒在冰上磨出呼吸孔。',
                   q:{ q:'海豹在冰冷的海水裡,靠什麼保持溫暖?', o:['皮下很厚的脂肪層','全身長滿保暖的羽毛','一直游泳讓自己發熱','把身體泡在熱泉裡面'], a:0, why:'海豹皮下有很厚的脂肪(鯨脂),像穿了一件保暖衣,熱量不容易散失。' } },
    reindeer:    { n:'馴鹿',       e:'🦌', cat:'animal', d:'唯一公母都長角的鹿;蹄子很寬,在雪地上像穿了雪鞋,冬天會用蹄子刨開雪找地衣吃。',
                   q:{ q:'馴鹿的蹄子又大又寬,對生活有什麼幫助?', o:['在雪地上不容易陷下去','讓牠在水裡游泳游得更快','讓牠可以輕鬆地爬到樹上','讓牠在雪地上跳得比較高'], a:0, why:'寬大的蹄把體重分散到比較大的面積,壓力變小,走在雪地上就不容易陷進去。' } },
    lemming:     { n:'旅鼠',       e:'🐹', cat:'animal', d:'苔原上的小型囓齒動物,冬天在雪底下挖隧道生活;旅鼠多的年份,北極狐和雪鴞也會跟著變多。',
                   q:{ q:'旅鼠變多的那一年,吃旅鼠的雪鴞通常會怎樣?', o:['也跟著變多','全部飛到別處','完全不受影響','改成去吃樹葉'], a:0, why:'食物變多,掠食者生下的寶寶也比較能活下來,數量就跟著增加——這是食物鏈的互相牽動。' } },
    polarbear:   { n:'北極熊',     e:'🐻‍❄️', cat:'animal', d:'只住在北極的大型掠食者,毛其實是透明中空的、皮膚是黑色的;牠靠海冰當平台獵海豹,海冰變少讓牠越來越難生存。(遠遠觀察就好,千萬不能靠近!)',
                   q:{ q:'為什麼北極熊和企鵝在野外不會碰面?', o:['一個住北極、一個住南半球','牠們是好朋友,一直住在一起','企鵝看到北極熊就會躲進雪裡','北極熊只在晚上才會出來活動'], a:0, why:'北極熊只住在北極圈,企鵝幾乎都住在南半球,兩邊隔了整個地球——這座島很特別,南岸像南極、北邊像北極。' } },
    fiddler:     { n:'招潮蟹',     e:'🦀', cat:'animal', d:'公招潮蟹有一隻特別大的螯,退潮時會揮動大螯吸引母蟹、也宣示地盤,看起來像在「招潮水回來」。',
                   q:{ q:'公招潮蟹揮動一隻特大的螯,主要是為了?', o:['吸引母蟹和宣示地盤','揮動大螯把潮水招回來','用大螯把泥巴地挖得鬆鬆','揮來揮去把蚊子趕走'], a:0, why:'大螯是求偶和打架用的「招牌」,揮得越用力越受母蟹青睞。' } },
    leafcutter:  { n:'切葉蟻',     e:'🐜', cat:'animal', d:'切葉蟻把葉子切成小片搬回巢,不是自己吃,而是拿來種一種真菌,再吃長出來的真菌——牠們是會種田的螞蟻。',
                   q:{ q:'切葉蟻把葉子搬回巢裡,是拿來做什麼?', o:['種真菌來吃','鋪成床睡覺','曬乾當成屋頂','送給蟻后當禮物'], a:0, why:'切葉蟻用葉子當肥料養真菌,再吃真菌長出的菌絲,跟人類種田很像。' } },
    pitcher:     { n:'豬籠草',     e:'🌱', cat:'plant',  d:'葉子尖端長出一個像瓶子的捕蟲籠,籠口又滑又香,昆蟲掉進去就被消化液分解,補充土壤裡缺少的養分。',
                   q:{ q:'豬籠草為什麼要「吃」昆蟲?', o:['補充土壤裡缺少的養分','因為它根本沒有長葉子','因為它完全不會行光合作用','為了把附近的昆蟲都趕走'], a:0, why:'豬籠草還是會行光合作用,但它生長的土壤很缺氮,所以靠消化昆蟲來補充養分。' } },
    sloth:       { n:'樹懶',       e:'🦥', cat:'animal', d:'一天睡十幾個小時、動作超慢,一個禮拜才下樹上一次廁所;慢慢動可以省能量,毛上還長了綠藻當保護色。',
                   q:{ q:'樹懶的毛常常帶點綠色,是因為?', o:['毛上長了藻類當保護色','牠吃了太多綠色的葉子','牠用樹葉把自己的毛染綠','牠生病了,毛才會變成綠色'], a:0, why:'樹懶動得很慢,潮濕的毛上會長出藻類,綠綠的讓牠在樹上更不容易被老鷹發現。' } },
    toucan:      { n:'巨嘴鳥',     e:'🐦', cat:'animal', d:'大嘴巴看起來很重,其實裡面是像海綿一樣的中空構造,很輕;大嘴還能幫忙散熱。',
                   q:{ q:'巨嘴鳥的大嘴巴其實很輕,原因是?', o:['裡面是中空像海綿的構造','嘴巴其實是用羽毛做成的','嘴巴裡面裝滿了小小的空氣球','牠的嘴巴是透明的所以很輕'], a:0, why:'巨嘴鳥的喙由薄薄的角質外殼包著中空的骨架,又大又輕;血管還能幫忙散熱。' } },
    morpho:      { n:'大藍閃蝶',   e:'🦋', cat:'animal', d:'翅膀閃著金屬藍光,但翅膀裡其實沒有藍色色素!那是鱗片上細微的結構讓光反射出來的「結構色」。',
                   q:{ q:'大藍閃蝶的翅膀為什麼會閃著藍光?', o:['鱗片的細微結構反射出藍光','翅膀裡面塗了一層藍色的油漆','翅膀會自己發出一閃一閃的藍光','牠喝了藍色的花蜜,翅膀就變藍色'], a:0, why:'鱗片上有很細的層狀構造,只把藍色的光反射出來,叫做「結構色」,所以換個角度看顏色會變。' } },
    rafflesia:   { n:'大王花',     e:'🌺', cat:'plant',  d:'世界上最大的單朵花,直徑可達 1 公尺;它沒有葉子和根,寄生在藤蔓上,開花時發出腐肉的臭味吸引蒼蠅來授粉。',
                   q:{ q:'大王花開花時會發出臭味,是為了?', o:['吸引蒼蠅幫忙授粉','趕走想吃它的動物','因為它生病發臭了','讓人類不敢靠近它'], a:0, why:'大王花的臭味像腐肉,會吸引愛吃腐肉的蒼蠅;蒼蠅在花裡爬來爬去,就把花粉帶到另一朵花上。' } },
    marineiguana:{ n:'海鬣蜥',     e:'🦎', cat:'animal', d:'世界上唯一會下海覓食的蜥蜴,潛到海裡吃海藻;牠會打噴嚏把吃進去多餘的鹽分噴出來。',
                   q:{ q:'海鬣蜥從海裡上來後常趴在黑色岩石上,是在做什麼?', o:['曬太陽讓變冷的身體暖起來','趴在溫暖的石頭上舒服地睡午覺','在岩石上面等牠的朋友游上岸','躲在岩石上偷偷地看著遊客'], a:0, why:'海鬣蜥是變溫動物,在冷冷的海水裡覓食後體溫下降,要趴在曬熱的黑岩石上取暖。' } },
    boobie:      { n:'藍腳鰹鳥',   e:'🐦', cat:'animal', d:'有一雙亮藍色的腳,求偶時公鳥會抬起藍腳跳舞給母鳥看,腳越藍代表越健康、吃得越好。',
                   q:{ q:'公藍腳鰹鳥求偶時,為什麼要秀出藍色的腳?', o:['腳越藍代表越健康','因為牠的腳覺得很冷','要把濕濕的腳曬乾','秀出藍腳嚇跑敵人'], a:0, why:'腳的藍色來自吃的魚,吃得越好腳越藍,母鳥會挑腳最藍的公鳥當伴侶。' } },
    finch:       { n:'達爾文雀',   e:'🐤', cat:'animal', d:'不同小島上的雀鳥,嘴巴形狀都不一樣:吃硬種子的嘴又粗又厚、吃昆蟲的又細又尖。達爾文看到這些差異,想出了「演化」。',
                   q:{ q:'不同島上的達爾文雀嘴巴形狀不同,主要是因為?', o:['為了適應各島不同的食物','小時候撞到石頭把嘴巴撞歪了','鳥媽媽幫牠們把嘴巴修剪過了','嘴巴的形狀其實是隨便長出來的'], a:0, why:'適合當地食物的嘴型比較容易活下來、生下後代,一代代下來就變成不同的嘴型,這就是「天擇」。' } },
    sealion:     { n:'加拉巴哥海獅', e:'🦭', cat:'animal', d:'有外耳殼、能用前肢把身體撐起來在岸上「走路」,這是牠和海豹最大的不同;很喜歡在海灘上睡覺。',
                   q:{ q:'海獅和海豹最容易分辨的地方是?', o:['海獅有小小的外耳殼','海獅身上長了一層羽毛','海豹會在天上飛來飛去','海獅只吃岸上長的青草'], a:0, why:'海獅有外耳殼、後肢能轉向前方幫忙走路;海豹沒有外耳殼,在岸上只能用肚子扭著前進。' } },
    clownfish:   { n:'小丑魚與海葵', e:'🐠', cat:'animal', d:'海葵的觸手有毒,小丑魚身上的黏液卻讓牠不會被螫;小丑魚躲在海葵裡避敵,也幫海葵趕走吃觸手的魚——互相幫忙叫「共生」。',
                   q:{ q:'小丑魚和海葵住在一起,彼此都得到好處,這種關係叫?', o:['互利共生','寄生關係','競爭關係','捕食關係'], a:0, why:'小丑魚得到保護,海葵得到清潔和小丑魚帶來的食物殘渣,兩邊都受益,叫做互利共生。' } },
    parrotfish:  { n:'鸚哥魚',     e:'🐟', cat:'animal', d:'牙齒長得像鸚鵡的嘴,會啃珊瑚上的藻類,把吃進去的碎珊瑚磨成細沙排出來——很多白色沙灘的沙就是牠們做的!',
                   q:{ q:'熱帶海島雪白的沙灘,有一部分是誰「做」出來的?', o:['鸚哥魚啃珊瑚排出的細沙','海浪把貝殼一點一點磨碎的','螃蟹一顆一顆從海裡搬上來的','颱風從遙遠的沙漠吹過來的'], a:0, why:'鸚哥魚啃食珊瑚上的藻類時連珊瑚一起咬碎,排出的細沙一隻一年可以有好幾百公斤。' } },
    giantclam:   { n:'硨磲貝',     e:'🐚', cat:'animal', d:'世界上最大的貝類,可以超過 1 公尺、活超過 100 年;外套膜裡住著行光合作用的藻類,幫牠製造養分。是保育類,不能採!',
                   q:{ q:'硨磲貝為什麼常常住在陽光照得到的淺海?', o:['體內的共生藻要曬陽光','牠非常喜歡曬太陽取暖','深海太冷、牠會被凍住','牠很怕黑,不敢待在深海'], a:0, why:'硨磲貝外套膜裡的共生藻靠陽光製造養分分給硨磲貝,所以牠要住在陽光照得到的地方。' } },
    seadragon:   { n:'葉海龍',     e:'🐉', cat:'animal', d:'海馬的親戚,全身長滿像海藻葉子的突起,在海藻間漂著幾乎分不出來;和海馬一樣是由爸爸負責帶卵。',
                   q:{ q:'葉海龍全身長得像海藻葉子,對牠有什麼好處?', o:['偽裝起來不容易被吃掉','讓牠在海裡游泳游得比較快','讓牠可以像植物一樣行光合作用','可以把別的魚都吸引到身邊來'], a:0, why:'長得像環境裡的東西叫「擬態」,葉海龍在海藻間漂動,掠食者很難發現牠。' } },
    grouper:     { n:'龍膽石斑',   e:'🐟', cat:'animal', d:'可以長到兩公尺以上的大型石斑魚,喜歡住在沉船和礁石的洞裡;很多石斑魚小時候是母的,長大後會變成公的。',
                   q:{ q:'沉船沉到海底多年後,常常變成魚的家,這叫?', o:['人工魚礁','魚的監獄','海底垃圾場','珊瑚墳墓'], a:0, why:'沉船表面會長滿珊瑚和海綿,有很多洞穴可以躲藏,吸引魚群定居,所以沉船或水泥塊被拿來做「人工魚礁」。' } },
    tubeworm:    { n:'巨型管蟲',   e:'🪱', cat:'animal', d:'住在深海熱泉旁,可以長到兩公尺;牠沒有嘴也沒有胃,靠體內的細菌利用熱泉的化學物質製造養分。',
                   q:{ q:'巨型管蟲沒有嘴巴,是靠什麼得到養分?', o:['體內細菌用熱泉做養分','用皮膚直接吃海底的泥巴','靠微弱的月光行光合作用','吃從海面上掉下來的雪花'], a:0, why:'管蟲體內住著能做「化學合成」的細菌,利用熱泉噴出的硫化物製造養分分給管蟲,不需要陽光。' } }
  };

  /* ── 20 區場景:spawn = [資源點種類, 每天幾個];obs = 觀察點;refill = 補給點數量;water/vine/dark 見 D.seaMask ── */
  (function(){
    var DEF = {
      ice_coast:      { W:32, H:24, bg:'#dfeef7', wall:'#8aa9bf', water:'bottom', spawn:[['floe',3],['krill',2],['drift',2]], obs:['adelie','weddell'], refill:1, pick:['ice','shell','pebble','feather','krill'] },
      ice_taiga:      { W:32, H:24, bg:'#e6f0f2', wall:'#3f6b4f', dense:1, spawn:[['spruce',5],['cloudberry',3],['lichen',2]], obs:['reindeer'], refill:2, pick:['wood','cloudberry','lichen','pebble'] },
      ice_tundra:     { W:32, H:24, bg:'#d9e4d3', wall:'#7f8f7a', pond:1, spawn:[['willow',3],['poppy',2],['muskox',2]], obs:['lemming'], refill:2, pick:['fiber','herb','lichen','pebble'],
                        puzzle:{ n:'浮冰之謎', e:'🧊' } },
      ice_glacier:    { W:32, H:24, bg:'#cfe6f7', wall:'#5d8fb8', spawn:[['frostore',3],['mammoth',1],['floe',2]], obs:['polarbear'], refill:2, pick:['ice','stone','pebble'] },
      ice_peak:       { W:32, H:24, bg:'#e9f1f8', wall:'#7d93ab', spawn:[['frostore',2],['lichen',2],['spruce',2]], obs:[], refill:2, pick:['ice','stone'] },
      jungle_mangrove:{ W:32, H:24, bg:'#6f9a5a', wall:'#2f5a2c', water:'bottom', spawn:[['mangrove',3],['coconut',3]], obs:['fiddler'], refill:1, pick:['coconut','shell','wood','fiber'] },
      jungle_floor:   { W:32, H:24, bg:'#4f7d43', wall:'#1f3f1c', dense:1, vine:1, spawn:[['banana',3],['cacao',2],['bromeliad',2]], obs:['leafcutter','pitcher'], refill:1, pick:['banana','leaf','fiber','berry'] },
      jungle_canopy:  { W:32, H:24, bg:'#5f8f4b', wall:'#2b4f26', spawn:[['brazilnut',3],['bromeliad',2]], obs:['sloth','toucan'], refill:2, pick:['nut','leaf','feather'],
                        puzzle:{ n:'雨林四層', e:'🌳' } },
      jungle_swamp:   { W:32, H:24, bg:'#5a6f45', wall:'#2c3a22', pond:1, water:'top', spawn:[['rubber',3],['victoria',2]], obs:['morpho'], refill:2, pick:['leaf','fiber','reed'] },
      jungle_giant:   { W:32, H:24, bg:'#4a7a3c', wall:'#1d3a19', dense:1, vine:1, spawn:[['cacao',2],['rubber',2]], obs:['rafflesia'], refill:2, pick:['leaf','banana','wood'] },
      storm_reef:     { W:32, H:24, bg:'#8a8f86', wall:'#3c4044', water:'bottom', spawn:[['dunegrass',3],['basalt',3],['drift',2]], obs:['marineiguana'], refill:0, pick:['stone','shell','pebble','trash'] },
      storm_colony:   { W:32, H:24, bg:'#a59c84', wall:'#5b5446', spawn:[['guano',3],['dunegrass',2]], obs:['boobie'], refill:0, pick:['feather','guano','pebble'] },
      storm_moor:     { W:32, H:24, bg:'#8f9473', wall:'#4a4d3c', dense:1, spawn:[['flagtree',3],['cactus',3],['basalt',2]], obs:['finch'], refill:0, pick:['cactus','wood','stone'] },
      storm_wreck:    { W:32, H:24, bg:'#7f8a8c', wall:'#3a4143', water:'top', spawn:[['wreck',3],['drift',2],['basalt',2]], obs:['sealion'], refill:0, pick:['trash','ore','shell'],
                        puzzle:{ n:'燈塔透鏡', e:'🗼' } },
      storm_eye:      { W:32, H:24, bg:'#9aa3a8', wall:'#4d5559', spawn:[['cactus',2],['basalt',2]], obs:[], refill:0, pick:['stone','feather'] },
      deep_reef:      { W:64, H:48, bg:'#2f8fb5', wall:'#c97b63', spawn:[['coraldebris',4],['seagrass',4]], obs:['clownfish','parrotfish','giantclam'], refill:3, pick:['shell','coralbit','pebble'] },
      deep_kelp:      { W:64, H:48, bg:'#1f6f86', wall:'#2f5a3c', dense:1, spawn:[['kelp',5],['urchinbed',4],['seagrass',2]], obs:['seadragon'], refill:3, pick:['kelp','shell','urchin'] },
      deep_wreck:     { W:64, H:48, bg:'#1b5470', wall:'#5a4630', spawn:[['wreckchest',3],['anchor',4],['coraldebris',2]], obs:['grouper'], refill:4, pick:['ore','shell','trash'],
                        puzzle:{ n:'浮力機關', e:'⚓' } },
      deep_abyss:     { W:64, H:48, bg:'#0b2a44', wall:'#1c2f3f', dark:1, spawn:[['lanternfish',5],['anchor',2]], obs:[], refill:4, pick:['fish','pebble'] },
      deep_vent:      { W:64, H:48, bg:'#14243a', wall:'#3a2a24', dark:1, spawn:[['smoker',4],['lanternfish',2]], obs:['tubeworm'], refill:4, pick:['stone','pebble'] }
    }, id, d, sc, i, k, nd, mid, vbox, pocket, cnt;
    for(id in DEF){ if(!DEF.hasOwnProperty(id)) continue;
      d = DEF[id]; mid = Math.floor(d.H / 2);
      vbox = d.vine ? { x0: Math.floor(d.W * 0.62) + 1, y0: 1, x1: d.W - 2, y1: Math.max(3, mid - 3) - 1 } : null;
      sc = D.SCENE[id] = {
        bg: 'zone_' + id, bgColor: d.bg, wallColor: d.wall, waterColor: '#4aa3df', sea: true, isle: D.seaZone(id).isle,
        cols: d.W, rows: d.H, dark: !!d.dark, vineBox: vbox,
        spawn0: { x: 2, y: mid }, exit: { x: d.W - 2, y: mid }, campGate: null,
        mask: D.seaMask(id, d.W, d.H, { water: d.water || '', vine: !!d.vine, dense: !!d.dense, pond: !!d.pond }),
        spawn: {}, pick: { n: d.W > 32 ? [6, 9] : [3, 5], minGap: 3, items: d.pick }, refill: [], obs: []
      };
      for(i = 0; i < d.spawn.length; i++){
        k = d.spawn[i][0]; cnt = d.spawn[i][1];
        if(k === 'drift'){ sc.spawn.drift = { n: cnt, minGap: 2, act:'gather', node:'node_drift', e:'🪵', gives:'wood', label:'漂流木', pool: D.seaPool(id, k, cnt * 3, d.W, d.H) }; continue; }
        nd = D.SEA_NODES[k];
        pocket = (vbox && i === 0) ? 1 : 0;   /* 藤蔓口袋裡固定多長第一種資源 */
        sc.spawn[k] = { n: cnt + pocket, minGap: d.W > 32 ? 4 : 2, act: nd.act, node: 'node_' + k, e: nd.e, gives: nd.gives, label: nd.label,
                        pool: D.seaPool(id, k, cnt * 3, d.W, d.H).concat(pocket ? D.seaPool(id, k + 'v', 2, d.W, d.H, vbox) : []) };
        if(nd.bonus) sc.spawn[k].bonus = nd.bonus;
        if(nd.chance) sc.spawn[k].chance = nd.chance;
        if(!D.IMG['node_' + k]) D.IMG['node_' + k] = 'island_node_' + k + '.png';
      }
      for(i = 0; i < d.obs.length; i++){ sc.obs.push({ k: d.obs[i], pt: D.seaPool(id, 'obs' + d.obs[i], 1, d.W, d.H)[0] }); D.IMG['obs_' + d.obs[i]] = 'island_obs_' + d.obs[i] + '.png'; }
      for(i = 0; i < d.refill; i++) sc.refill.push(D.seaPool(id, 'refill' + i, 1, d.W, d.H)[0]);
      if(d.puzzle) sc.puzzle = { x: Math.floor(d.W / 2), y: mid - 4, n: d.puzzle.n, e: d.puzzle.e };
      if(vbox) sc.vine = { x: vbox.x0 - 1, y: vbox.y1 + 2 };   /* 藤蔓互動點:口袋左下角外側 */
    }
  })();

  /* ── 遇敵(等級依上限 70 重排;每場 3~4 隻,第 5 區固定 4 隻) ── */
  (function(){
    var M = {
      ice_coast:['walrus','snowball'], ice_taiga:['frostwolf','blizzardowl'], ice_tundra:['frostwolf','snowball','icewisp'], ice_glacier:['icewisp','polarshade','walrus'], ice_peak:['polarshade','frostwolf','blizzardowl'],
      jungle_mangrove:['caiman','piranha'], jungle_floor:['armyant','sporeshroom'], jungle_canopy:['poisonfrog','stranglevine'], jungle_swamp:['piranha','caiman','sporeshroom'], jungle_giant:['stranglevine','poisonfrog','armyant'],
      storm_reef:['stormcrab','saltghost'], storm_colony:['frigatethief','whirlwind'], storm_moor:['erodegolem','thundercloud'], storm_wreck:['saltghost','stormcrab','thundercloud'], storm_eye:['whirlwind','thundercloud','frigatethief'],
      deep_reef:['puffer','lionfish'], deep_kelp:['moray','jellyghost'], deep_wreck:['moray','anglerlure','lionfish'], deep_abyss:['anglerlure','jellyghost'], deep_vent:['ventember','anglerlure','jellyghost']
    }, i, z;
    for(i = 0; i < D.SEA_ZONES.length; i++){
      z = D.SEA_ZONES[i];
      D.ENC[z.id] = { n:3, from:1, mons: M[z.id], num: z.order >= 3 ? [4,4] : [3,4], lv: z.lv };   /* ★ v1.369.0 平衡沙盤:第 3~5 區改固定 4 隻(同本島遺跡/火山),第 1~2 區維持 3~4 隻當登島緩衝 */
      D.ENC_TEAM_HINT[z.id] = 3;
    }
  })();

  /* ── 外島解謎(既有 D.PUZZLES 格式:3 題答對 2 題以上解開) ── */
  D.PUZZLES.ice_tundra = { n:'浮冰之謎', e:'🧊', intro:'凍原的水窪上漂著一塊冰,冰底下的水卻沒有結凍……', reward:{ shell:12, tech:5 }, qs:[
    { q:'冰為什麼會浮在水面上?', o:['冰的密度比水小','冰被風吹著才勉強浮在上面','冰塊會自己產生往上推的力量','冰其實比水重,只是浮在表層'], a:0, why:'水結成冰時分子排得比較鬆,體積變大、密度變小,所以冰會浮在水面上。' },
    { q:'冬天湖面結冰,冰底下的魚為什麼還活著?', o:['冰層像蓋子保溫,底下的水沒結凍','魚到了冬天就全部變成冰塊睡覺了','湖底一直有熱水從地底下不停冒出來','魚會游到岸上的雪地裡面躲起來取暖'], a:0, why:'冰層把冷空氣隔開,冰下的水大約維持在 4°C,魚在底下照樣游。' },
    { q:'冰山露出水面的部分,大約是整座冰山的多少?', o:['十分之一左右','大約有一半左右','整座冰山都露在外面','露出來的比沉下去的多'], a:0, why:'冰的密度大約是海水的九成,所以冰山大約九成藏在水面下,這就是「冰山一角」的由來。' } ] };
  D.PUZZLES.jungle_canopy = { n:'雨林四層', e:'🌳', intro:'一棵大樹從地面一路長到天空,每一層住的動物都不一樣……', reward:{ shell:12, tech:5 }, qs:[
    { q:'熱帶雨林從上到下,依序是哪四層?', o:['突出層、樹冠層、林下層、地被層','地被層、樹冠層、突出層、林下層','樹冠層、地被層、林下層、突出層','林下層、突出層、地被層、樹冠層'], a:0, why:'最高的突出層、茂密的樹冠層、陰暗的林下層、最底下的地被層,每一層的光線和溫度都不一樣。' },
    { q:'雨林的哪一層,住的動物種類最多?', o:['樹冠層','最底下的地被層','樹根旁邊的土壤裡','流過森林的河流裡'], a:0, why:'樹冠層陽光最多、花和果實最多,七成以上的雨林動物都住在這裡。' },
    { q:'雨林的底層為什麼那麼暗?', o:['上面的樹葉擋住了大部分陽光','雨林上空的太陽本來就比較小顆','雨林只有在晚上才照得到太陽光','雨林底層的空氣本身就是黑色的'], a:0, why:'樹冠層的葉子層層疊疊,只有不到 2% 的陽光照得到地面。' } ] };
  D.PUZZLES.storm_wreck = { n:'燈塔透鏡', e:'🗼', intro:'傾倒的燈塔裡,一片刻滿一圈圈紋路的大玻璃還閃著光……', reward:{ shell:12, tech:5 }, qs:[
    { q:'燈塔的大透鏡為什麼要刻成一圈一圈的?', o:['把光集中成一道,遠遠射出去','刻成一圈一圈只是為了比較好看','讓玻璃比較不容易被大風吹倒','讓燈塔在晚上可以發出好聽的音樂'], a:0, why:'這種「菲涅耳透鏡」把凸透鏡切成一圈圈薄片,又輕又能把光集中射到很遠的海上。' },
    { q:'光從空氣進入玻璃,前進的方向會怎樣?', o:['偏折(折射)','光會完全停在玻璃表面','光會變成聲音傳出去','光會直接往後退回去'], a:0, why:'光進入另一種物質時速度改變,方向就會偏折,這叫折射;透鏡就是利用折射聚光。' },
    { q:'燈塔的光,對夜裡航行的船最重要的用途是?', o:['告訴船哪裡有陸地和危險','讓船上的人晚上可以看書寫字','幫在船上的人加熱、取暖','把附近海裡的魚都吸引過來'], a:0, why:'每座燈塔閃光的方式都不一樣,船員看閃光就知道自己在哪裡、附近有沒有礁石。' } ] };
  D.PUZZLES.deep_wreck = { n:'浮力機關', e:'⚓', intro:'沉船艙門上綁著一排裝滿空氣的木桶,門上刻著:「讓它浮起來,門就會開。」', reward:{ shell:15, tech:6 }, qs:[
    { q:'裝滿空氣的木桶,為什麼能在水裡浮起來?', o:['排開的水比較重,浮力就比較大','木桶裡的空氣會自己往上飛出去','因為海水一直都是往上方流動的','木桶泡進水裡就會自動變輕一半'], a:0, why:'阿基米德發現:物體受到的浮力等於它排開的水的重量;排開的水比自己重,就會浮起來。' },
    { q:'潛水艇要往下潛的時候,會怎麼做?', o:['把水灌進水櫃讓自己變重','把潛水艇上所有的燈都關掉','把船裡的空氣全部抽到外面','把船尾後面的螺旋槳拆下來'], a:0, why:'潛水艇的水櫃灌水變重就下沉,把水排出去換成空氣就上浮;魚的魚鰾也是同樣的道理。' },
    { q:'一樣大的鐵塊和木塊放進水裡,為什麼鐵塊會沉?', o:['鐵的密度比水大','鐵塊比較怕碰到水','木塊會用力吸住水面','鐵塊的溫度比較冷'], a:0, why:'密度比水大的東西會沉、比水小的會浮;鐵船能浮,是因為船身中空、平均密度比水小。' } ] };

  /* ── 第一次踏進各區的內心話 ── */
  D.STORY.zoneIntro = D.STORY.zoneIntro || {};
  (function(){
    var T = {
      ice_coast:'呼出來的氣全變成白霧……這裡的企鵝一點都不怕我,搖搖擺擺走過來看熱鬧。',
      ice_taiga:'雲杉長得像一座座尖塔,雪一積多就自己滑下來——原來樹的形狀也跟天氣有關。',
      ice_tundra:'整片大地都好矮,連樹都只到我的腳踝。風吹過來,什麼都擋不住。',
      ice_glacier:'冰是藍色的!腳底下的冰河好像在慢慢移動,裂縫裡傳來喀啦喀啦的聲音。',
      ice_peak:'天空掛著綠色的光帶,一直在飄動……是極光!山頂有一個好大的影子在看著我。',
      jungle_mangrove:'鹹鹹的海水和河水混在一起,樹的根像一隻隻腳站在泥巴裡。好悶熱!',
      jungle_floor:'這裡好暗,頭頂的樹葉把天空全遮住了。到處都是聲音,卻看不到是誰在叫。',
      jungle_canopy:'吊橋晃來晃去……這一層陽光好多,花、果子、鳥全都在這裡!',
      jungle_swamp:'河水是茶色的,像泡了一大壺紅茶。浮在水上的葉子大得可以坐人。',
      jungle_giant:'一棵巨大的古樹被藤蔓整個包住,氣根垂得到處都是……它好像在呼吸。',
      storm_reef:'浪好大,風吹得我站不穩!黑色的岩石上趴著一排會打噴嚏的蜥蜴。',
      storm_colony:'滿天都是海鳥,叫聲吵得要命。地上白白一層……是鳥糞嗎?',
      storm_moor:'樹全都往同一邊歪,像被風梳過頭髮一樣。石頭被削成奇怪的形狀。',
      storm_wreck:'一艘破船斜斜地插在岸邊,燈塔倒了一半。天上的雷一直在響。',
      storm_eye:'突然……風停了?四周是一圈高高的雲牆,天空正中間是藍色的。這裡是颱風眼!',
      deep_reef:'我在水底呼吸了!陽光一條一條照下來,珊瑚五顏六色,小魚從我身邊游過。',
      deep_kelp:'好高的海藻,像一座搖來搖去的森林。有一隻海獺抱著石頭在水面上睡覺。',
      deep_wreck:'沉船的船艙黑漆漆的,裡面好像藏著什麼……要注意氧氣還夠不夠。',
      deep_abyss:'好暗……只有一點一點的藍光在閃。這裡是陽光完全照不到的深海。',
      deep_vent:'海底在冒黑煙!熱水從石頭煙囪噴出來,旁邊卻長滿了紅色的長管子生物。'
    }, k;
    for(k in T){ if(T.hasOwnProperty(k)) D.STORY.zoneIntro[k] = T[k]; }
  })();

  /* ── 外島魔物 24 隻(格式同 v1.242.0 擴充魔物;戰鬥立繪 island_bt_m_<k>_<態>.png 512×512 側面朝左) ── */
  D.SEA_MONS = [
    /* ❄ 冰天雪地島 */
    { k:'walrus', n:'海象戰士', e:'🦭', race:'beast', tag:'hard', tool:'bait', zone:'冰天雪地島',
      bt:{ hp:44, atk:12, def:5, spd:3, crit:5, drop:{ shell:[5,8], item:'ivory', p:0.2 }, d:'長牙又粗又長的大海象,趴在浮冰上不肯讓路。' },
      sk:{ t:'charge', n:'長牙刺擊', e:'🦷', p:45, cd:2, mul:2.2, tele:'把長牙插進冰面,龐大的身體往前一撐……', hint:'單體重擊!快用「!」閃避;🪱 誘餌能把牠引開。' },
      tr:'厚脂肪層:體力多、防禦高', hint:'牠只想吃蛤蜊,用誘餌引開', why:'海象用敏感的鬍鬚在海底摸蛤蜊吃;有現成的食物出現,牠就不想打架了。',
      q:{ q:'海象的長牙除了打架,還常用來做什麼?', o:['把笨重的身體撐上冰面','挖一條地道讓自己住在裡面','當成吸管把海水吸進嘴裡','嚇跑天空中想偷吃的海鳥'], a:0, why:'海象會把長牙插進冰裡,把笨重的身體撐上浮冰,牠的學名意思就是「用牙走路的海馬」。' },
      cx:'【獸族・厚脂肪層】海象皮下有很厚的脂肪保暖;牠用好幾百根敏感的鬍鬚在黑漆漆的海底找蛤蜊吃。',
      wit:'牠看起來只是肚子餓了……要是有更好吃的東西出現呢?' },
    { k:'snowball', n:'雪球怪', e:'⛄', race:'soft', tag:'soft', tool:'salt', zone:'冰天雪地島',
      bt:{ hp:32, atk:11, def:2, spd:4, crit:5, drop:{ shell:[4,7], item:'ice', p:0.6 }, d:'雪滾成的圓球怪,越滾越大,撞上來又冰又痛。' },
      sk:{ t:'sticky', n:'雪球糊臉', e:'❄', p:45, cd:2, mul:1.0, slow:2, tele:'身體縮成一團,準備把自己砸過來……', hint:'被雪糊住會變慢 2 回合;🧂 撒鹽讓雪融化。' },
      tr:'冰雪身軀:越冷越硬', hint:'撒鹽!雪會融化', why:'鹽讓冰的熔點變低,0°C 以下也會融化——冬天馬路撒鹽就是這個道理。',
      q:{ q:'下雪的國家冬天在馬路上撒鹽,是為了什麼?', o:['讓冰雪比較容易融化','讓馬路看起來白白的比較漂亮','讓天空的雪下得更快更多','讓車子的輪胎跑得比較快'], a:0, why:'鹽水的凝固點比純水低,冰雪碰到鹽就會在 0°C 以下融化,路面才不會結冰打滑。' },
      cx:'【軟體族・冰雪身軀】雪是水蒸氣在高空直接凝結成的冰晶,每一片雪花幾乎都是六角形。',
      wit:'冬天的馬路上常常撒一種白色的東西……它能讓冰怎麼樣?' },
    { k:'frostwolf', n:'霜狼', e:'🐺', race:'beast', tag:'', tool:'torch', zone:'冰天雪地島',
      bt:{ hp:34, atk:14, def:2, spd:9, crit:15, drop:{ shell:[5,8], item:'frostcrystal', p:0.2 }, d:'雪白的狼群,在暴風雪裡悄悄包圍過來。' },
      sk:{ t:'multi', n:'群狼撲咬', e:'🐺', p:45, cd:2, mul:0.5, n2:3, tele:'低吼聲從四面八方傳來,好幾雙眼睛在雪裡發亮……', hint:'會隨機咬 3 下;🔦 火把能嚇退狼群。' },
      tr:'群體狩獵:速度快、暴擊高', hint:'野獸怕火,點起火把', why:'大多數野生動物都怕火,火光和熱會讓牠們本能地往後退。',
      q:{ q:'北極狼的毛為什麼那麼保暖?', o:['底下有一層細絨毛鎖住空氣','毛裡面藏著會自己發熱的小石頭','毛上塗了一層會發光的油脂','狼毛其實是用細細的冰做成的'], a:0, why:'狼毛分兩層:外層長毛擋風雪,底層細絨毛鎖住一層空氣;空氣不容易傳熱,所以很保暖。' },
      cx:'【獸族・群體狩獵】狼是成群打獵的動物,彼此分工包圍獵物;牠們用嚎叫跟遠方的同伴聯絡。',
      wit:'野生動物最怕什麼又亮又熱的東西?' },
    { k:'blizzardowl', n:'暴雪鴞妖', e:'🦉', race:'bird', tag:'fly', tool:'gong', zone:'冰天雪地島',
      bt:{ hp:28, atk:14, def:1, spd:10, crit:20, drop:{ shell:[5,8], item:'feather', p:0.7 }, d:'在暴風雪裡無聲滑翔的大白鴞,一雙金眼睛盯著獵物。' },
      sk:{ t:'charge', n:'無聲俯衝', e:'🦉', p:45, cd:2, mul:2.3, tele:'白色的影子在頭頂盤旋,一點聲音也沒有……', hint:'單體超重擊!快用「!」閃避;🔔 銅鑼的巨響會打亂牠。' },
      tr:'無聲飛行:速度快、暴擊高', hint:'鴞靠耳朵找獵物,敲鑼干擾牠', why:'貓頭鷹兩邊耳朵一高一低,靠聲音到達的時間差找獵物;巨響會讓牠暈頭轉向。',
      q:{ q:'貓頭鷹在黑暗中抓老鼠,最主要靠什麼?', o:['非常靈敏的聽覺','用鼻子聞老鼠留下的味道','老鼠身上會一閃一閃發光','白天先把老鼠的位置記下來'], a:0, why:'貓頭鷹的臉像碟子一樣把聲音集中到耳朵,兩耳高低不同,能精準判斷聲音從哪裡來。' },
      cx:'【鳥族・無聲飛行】貓頭鷹羽毛邊緣有細細的鋸齒,能打散氣流,所以飛起來幾乎沒有聲音。',
      wit:'牠聽得到雪底下老鼠在走路……要是耳邊突然好大一聲呢?' },
    { k:'icewisp', n:'冰晶精', e:'❄', race:'elem', tag:'elem', tool:'torch', zone:'冰天雪地島',
      bt:{ hp:30, atk:13, def:2, spd:7, crit:10, drop:{ shell:[5,9], item:'frostcrystal', p:0.4 }, d:'冰晶聚成的小精靈,碰到就會被凍住。' },
      sk:{ t:'petrify', n:'冰封', e:'🧊', p:40, cd:3, mul:0.7, stun:1, tele:'四周的空氣越來越冷,水氣在牠身邊結成冰花……', hint:'被凍住 1 回合不能動;🔦 火把的熱會讓冰熔化。' },
      tr:'冰晶身軀:會把人凍住', hint:'固體遇熱會熔化,用火把', why:'冰受熱超過 0°C 就從固體變成液體(熔化),冰晶精就散成一灘水。',
      q:{ q:'冰塊放在太陽底下慢慢變成水,這叫做什麼?', o:['熔化','凝固(液體變成固體)','凝結(水蒸氣變成水)','昇華(固體直接變成氣體)'], a:0, why:'固體變成液體叫熔化;液體變成固體叫凝固。' },
      cx:'【元素族・冰晶身軀】水結成冰時體積會變大,所以冰比水輕、會浮在水面上。',
      wit:'冰最怕遇到什麼?一熱起來,它會變成什麼?' },
    { k:'polarshade', n:'極夜幽影', e:'👤', race:'ghost', tag:'elem', tool:'mirror', zone:'冰天雪地島',
      bt:{ hp:34, atk:15, def:1, spd:8, crit:15, drop:{ shell:[6,9], item:'frostcrystal', p:0.3 }, d:'極夜裡游蕩的影子,躲在照不到光的地方。' },
      sk:{ t:'vanish', n:'藏進極夜', e:'🌑', p:40, cd:3, dur:2, missP:50, tele:'牠的身體越來越淡,快要跟黑夜融在一起……', hint:'看不清楚時攻擊常常落空;🪞 鏡子把光反射過去就看得到。' },
      tr:'極夜之影:很難打中', hint:'用鏡子把光反射過去', why:'鏡子能改變光前進的方向,把光送進暗處,影子就無處可躲。',
      q:{ q:'北極有一段時間整天都是黑夜(極夜),主要原因是?', o:['地球的自轉軸是傾斜的','那段時間太陽暫時熄滅了','北極上空的雲層特別厚重','月亮剛好整個擋住了太陽'], a:0, why:'地軸傾斜約 23.5 度,冬天時北極整個背對太陽,好幾個月都照不到陽光。' },
      cx:'【幽魂族・極夜之影】極夜時北極天空常出現極光,那是太陽吹來的帶電粒子撞上大氣發出的光。',
      wit:'影子最怕光……要是能把遠處的光「轉個彎」照過來呢?' },
    /* 🌴 熱帶雨林島 */
    { k:'caiman', n:'凱門鱷', e:'🐊', race:'reptile', tag:'hard', tool:'gong', zone:'熱帶雨林島',
      bt:{ hp:42, atk:14, def:5, spd:4, crit:10, drop:{ shell:[5,9], item:'leaf', p:0.4 }, d:'只露出眼睛和鼻孔的鱷魚,靜靜等在河岸邊。' },
      sk:{ t:'charge', n:'死亡翻滾', e:'🌀', p:45, cd:2, mul:2.4, tele:'水面突然冒泡,一張大嘴從水裡張開……', hint:'單體超重擊!快用「!」閃避;🔔 銅鑼的巨響會把牠嚇回水裡。' },
      tr:'鱗甲厚皮:防禦高、咬合力大', hint:'巨響會嚇得牠潛回水裡', why:'鱷魚對水面的震動和聲音很敏感,突然的巨響會讓牠躲回水裡。',
      q:{ q:'鱷魚常常趴在岸邊曬太陽,是因為什麼?', o:['牠是變溫動物,要曬太陽取暖','牠想要把自己的皮膚曬得黑一點','牠在岸邊等天上的雨趕快停下來','牠吃太飽了,趴在岸上睡個午覺'], a:0, why:'爬蟲類是變溫動物,體溫跟著環境變,要曬太陽讓身體暖起來才有力氣活動。' },
      cx:'【爬蟲族・鱗甲厚皮】凱門鱷是住在中南美洲的小型鱷魚;鱷魚的眼睛和鼻孔長在頭頂,身體泡在水裡也能看和呼吸。',
      wit:'牠對水面的動靜很敏感……要是突然轟的一聲呢?' },
    { k:'piranha', n:'食人魚群', e:'🐟', race:'aquatic', tag:'', tool:'bait', zone:'熱帶雨林島',
      bt:{ hp:26, atk:13, def:1, spd:10, crit:15, drop:{ shell:[4,8], item:'fish', p:0.7 }, d:'一大群牙齒尖尖的魚,在水裡繞著圈圈。' },
      sk:{ t:'multi', n:'群咬', e:'🦷', p:45, cd:2, mul:0.45, n2:5, tele:'水面被攪得像沸騰一樣,魚群越游越快……', hint:'會隨機咬 5 下;🪱 誘餌能把魚群引開。' },
      tr:'成群結隊:速度快', hint:'丟誘餌引開魚群', why:'食人魚其實多半吃腐肉和小魚,聞到更好吃的東西就會一窩蜂游過去。',
      q:{ q:'食人魚大多數時候其實吃什麼?', o:['小魚、昆蟲和死掉的動物','只吃活生生跑進河裡的人','只吃長在河底的那些水草','只吃石頭上面薄薄的青苔'], a:0, why:'食人魚是雜食的「清道夫」,會吃小魚、昆蟲、種子和腐肉,很少主動攻擊人。' },
      cx:'【水族・成群結隊】食人魚住在南美洲的亞馬遜河,成群生活是為了保護自己不被大魚和鳥吃掉。',
      wit:'牠們一聞到好吃的東西就會一窩蜂衝過去……?' },
    { k:'armyant', n:'行軍蟻兵團', e:'🐜', race:'insect', tag:'', tool:'smoke', zone:'熱帶雨林島',
      bt:{ hp:30, atk:12, def:3, spd:7, crit:10, drop:{ shell:[4,8], item:'fiber', p:0.5 }, d:'幾十萬隻螞蟻排成一條黑色的河,所到之處什麼都不剩。' },
      sk:{ t:'burn', n:'蟻海叮咬', e:'🐜', p:40, cd:3, mul:0.55, dot:5, dur:2, tele:'地面在動!黑壓壓的蟻群從四面湧過來……', hint:'全體受傷並持續疼痛 2 回合;💨 煙會打亂牠們的隊伍。' },
      tr:'大軍壓境:一起攻擊', hint:'用煙打亂牠們的氣味路線', why:'螞蟻靠費洛蒙(氣味)排隊和溝通,煙會蓋過氣味,蟻群就亂成一團。',
      q:{ q:'螞蟻排成一長列走路,是靠什麼找路的?', o:['同伴留下的氣味(費洛蒙)','抬頭看太陽決定要往哪裡走','聽最前面的隊長大聲喊口令','跟著風吹過去的方向前進'], a:0, why:'螞蟻會在走過的路上留下費洛蒙,後面的同伴聞著氣味就能跟上。' },
      cx:'【蟲族・大軍壓境】行軍蟻沒有固定的家,幾十萬隻一起移動,晚上用身體互相勾住搭成「活的蟻巢」。',
      wit:'牠們排隊靠的是鼻子……要是空氣裡的味道全被蓋掉呢?' },
    { k:'sporeshroom', n:'毒孢菇魔', e:'🍄', race:'plant', tag:'soft', tool:'water', zone:'熱帶雨林島',
      bt:{ hp:32, atk:11, def:2, spd:4, crit:5, regenP:5, drop:{ shell:[4,8], item:'mushroom', p:0.6 }, d:'會走路的大毒菇,一抖就噴出一陣孢子雲。' },
      sk:{ t:'burn', n:'孢子雲', e:'🌫', p:40, cd:3, mul:0.5, dot:5, dur:2, tele:'菇傘鼓了起來,底下的皺褶在顫抖……', hint:'全體吸到孢子,持續中毒 2 回合;💧 灑水讓孢子沉下去。' },
      tr:'孢子再生:每回合回復 5% 體力', hint:'灑水讓孢子沉下來', why:'孢子吸了水會變重,就沒辦法在空中飄散。',
      q:{ q:'菇類是靠什麼來繁殖下一代的?', o:['孢子','種子(植物開花後結的)','花粉(花朵裡的小粉末)','果實(包著種子的部分)'], a:0, why:'菇是真菌,菇傘底下的皺褶會散出大量孢子,落到適合的地方就長出新的菌絲。' },
      cx:'【植物族・孢子再生】雨林又熱又濕,是真菌的天堂;真菌把落葉枯木分解成養分,讓雨林循環不停。',
      wit:'牠的孢子在空氣裡飄得到處都是……要是空氣變得濕答答呢?' },
    { k:'poisonfrog', n:'箭毒蛙精', e:'🐸', race:'amphibian', tag:'soft', tool:'glove', zone:'熱帶雨林島',
      bt:{ hp:26, atk:13, def:1, spd:8, crit:15, drop:{ shell:[5,8], item:'herb', p:0.4 }, d:'鮮豔得像寶石的小青蛙,皮膚上全是毒。' },
      sk:{ t:'sticky', n:'毒黏舌', e:'👅', p:45, cd:2, mul:1.1, slow:2, tele:'鼓起喉嚨,彩色的皮膚亮了一下……', hint:'被黏住會變慢 2 回合;🧤 厚手套才能碰牠。' },
      tr:'警戒色:皮膚有毒', hint:'戴厚手套才能碰牠', why:'箭毒蛙的毒在皮膚上,隔著厚手套就碰不到。',
      q:{ q:'箭毒蛙身上鮮豔的顏色,是在告訴別的動物什麼?', o:['我有毒,別吃我','我很好吃,快來吃我','我正在找朋友一起玩','我現在覺得非常冷'], a:0, why:'這種鮮豔的顏色叫「警戒色」,提醒掠食者吃了會中毒,讓牠們不敢靠近。' },
      cx:'【兩棲族・警戒色】箭毒蛙爸爸會把蝌蚪揹到鳳梨科植物葉子間的小水池裡養大;以前的原住民用牠的毒塗在吹箭上打獵。',
      wit:'牠的毒長在皮膚上……要是隔著一層厚厚的東西去抓呢?' },
    { k:'stranglevine', n:'絞殺藤魔', e:'🌿', race:'plant', tag:'', tool:'sickle', zone:'熱帶雨林島',
      bt:{ hp:36, atk:12, def:3, spd:5, crit:5, regenP:4, drop:{ shell:[5,8], item:'fiber', p:0.6 }, d:'一團會動的氣根和藤蔓,纏上就甩不掉。' },
      sk:{ t:'petrify', n:'纏繞', e:'🌿', p:40, cd:3, mul:0.7, stun:1, tele:'藤蔓悄悄從腳邊爬上來……', hint:'被纏住 1 回合不能動;🌾 鐮刀能割斷藤蔓。' },
      tr:'纏繞成長:每回合回復 4% 體力', hint:'用鐮刀割斷藤蔓', why:'藤蔓是植物的莖,割斷之後上半部就沒有水和養分可用。',
      q:{ q:'絞殺榕是怎麼長大的?', o:['種子在樹頂發芽,氣根往下長','從土裡長出來,把旁邊的樹推倒','整棵樹飄浮在空中,慢慢長大','把旁邊大樹的葉子全部吃光光'], a:0, why:'鳥把絞殺榕的種子帶到大樹頂端,它發芽後垂下氣根到地面,慢慢把宿主樹整個包住。' },
      cx:'【植物族・纏繞成長】雨林底層很暗,很多植物用「爬到別人身上」的方法搶陽光,藤本植物和附生植物特別多。',
      wit:'藤蔓靠一條長長的莖把水送上去……要是莖被切斷了呢?' },
    /* 🌀 狂風暴雨島 */
    { k:'stormcrab', n:'怒潮寄居蟹', e:'🐚', race:'aquatic', tag:'hard', tool:'glove', zone:'狂風暴雨島',
      bt:{ hp:40, atk:12, def:6, spd:3, crit:5, drop:{ shell:[6,10], item:'shell', p:0.8 }, d:'揹著巨大螺殼的寄居蟹,大螯夾起來很痛。' },
      sk:{ t:'harden', n:'縮進殼裡', e:'🐚', p:40, cd:3, dur:2, defMul:2.4, tele:'整個身體縮進殼裡,只露出一對大螯……', hint:'防禦大增 2 回合;🧤 厚手套能把牠抓起來。' },
      tr:'借來的硬殼:防禦最高', hint:'戴厚手套把牠抓起來', why:'寄居蟹的殼很硬但螯很利,厚手套能保護手不被夾到。',
      q:{ q:'寄居蟹背上的殼是從哪裡來的?', o:['撿死掉的螺留下的空殼','是寄居蟹自己慢慢長出來的','跟寄居蟹媽媽借來用的','用海邊的沙子一點點黏出來'], a:0, why:'寄居蟹腹部柔軟,要借用螺類的空殼保護自己;長大了就得換一個更大的殼。' },
      cx:'【水族・借來的硬殼】海灘上的塑膠瓶蓋和垃圾,常被找不到殼的寄居蟹誤當成家,反而害死牠們。',
      wit:'牠的大螯夾起來很痛……用什麼保護手才敢去抓?' },
    { k:'saltghost', n:'鹽霧幽靈', e:'🌫', race:'ghost', tag:'elem', tool:'mirror', zone:'狂風暴雨島',
      bt:{ hp:30, atk:15, def:1, spd:8, crit:15, drop:{ shell:[6,9], item:'pebble', p:0.5 }, d:'海風捲起的鹹霧聚成人形,一下出現一下消失。' },
      sk:{ t:'vanish', n:'鹽霧', e:'🌫', p:40, cd:3, dur:2, missP:45, tele:'白色的霧越來越濃,牠的身影變得好模糊……', hint:'霧裡攻擊常常落空;🪞 鏡子集中光線就照得出來。' },
      tr:'霧中隱形:很難打中', hint:'用鏡子反光照出牠的位置', why:'霧裡的小水滴會讓光散開,用鏡子把光集中起來就能照出影子。',
      q:{ q:'海邊的鐵器特別容易生鏽,主要是因為什麼?', o:['空氣裡有很多鹽分和水氣','海邊的太陽光比較微弱一點','海邊吹來的風特別涼爽舒服','海鳥很喜歡去啄鐵做的東西'], a:0, why:'海風帶著含鹽的水霧,鹽和水會讓鐵更快氧化生鏽,所以海邊的欄杆要常常保養。' },
      cx:'【幽魂族・霧中隱形】霧是很多小水滴浮在靠近地面的空氣裡,其實就是「地上的雲」。',
      wit:'濃霧裡什麼都看不清……能不能把光集中起來照過去?' },
    { k:'frigatethief', n:'劫掠軍艦鳥', e:'🐦', race:'bird', tag:'fly', tool:'bait', zone:'狂風暴雨島',
      bt:{ hp:28, atk:14, def:1, spd:11, crit:20, drop:{ shell:[6,9], item:'feather', p:0.7 }, d:'翅膀又尖又長的黑色大鳥,專搶別人的食物。' },
      sk:{ t:'strip', n:'空中搶奪', e:'🪶', p:40, cd:3, mul:0.6, tele:'在頭頂盤旋,眼睛盯著大家身上的好東西……', hint:'清掉全隊增益並造成傷害;🪱 誘餌能讓牠去搶別的。' },
      tr:'空中強盜:速度最快之一', hint:'丟出誘餌讓牠去搶別的', why:'軍艦鳥常在空中搶別的海鳥嘴裡的魚,有現成的食物就會轉移目標。',
      q:{ q:'軍艦鳥為什麼常常搶別的海鳥的魚?', o:['羽毛不防水,不太能潛水抓魚','牠其實根本不會飛,也不會游泳','牠只有吃搶來的食物才吃得飽','牠只是在跟別的海鳥玩追逐遊戲'], a:0, why:'軍艦鳥羽毛防水性差,泡水就飛不起來,所以練出在空中搶食的本領。' },
      cx:'【鳥族・空中強盜】雄軍艦鳥求偶時會把喉嚨鼓成一顆大紅氣球。',
      wit:'牠最喜歡搶別人的食物……要是丟一塊好吃的出去呢?' },
    { k:'whirlwind', n:'旋風妖', e:'🌪', race:'elem', tag:'elem', tool:'smoke', zone:'狂風暴雨島',
      bt:{ hp:30, atk:14, def:1, spd:10, crit:10, drop:{ shell:[6,9], item:'fiber', p:0.5 }, d:'捲著砂石的小旋風,轉得讓人頭暈。' },
      sk:{ t:'multi', n:'砂石亂舞', e:'🌪', p:45, cd:2, mul:0.5, n2:4, tele:'越轉越快,地上的砂石全被捲上天……', hint:'會隨機打 4 下;💨 煙能看出旋轉的中心。' },
      tr:'旋轉風壓:動作快', hint:'點煙看出風的流向', why:'煙會跟著空氣流動,看出風怎麼轉,就能找到旋風的中心。',
      q:{ q:'想知道風往哪裡吹,最簡單的方法是什麼?', o:['看煙或旗子飄的方向','看地上影子朝哪一邊','聽遠方海浪的聲音大小','抬頭看雲是什麼顏色'], a:0, why:'煙和旗子會被空氣推著走,飄的方向就是風吹過去的方向。' },
      cx:'【元素族・旋轉風壓】龍捲風是空氣快速旋轉形成的漏斗狀氣流,風速可以超過每小時 300 公里。',
      wit:'看不見的風要怎麼「看見」?有什麼東西會跟著空氣一起飄?' },
    { k:'erodegolem', n:'風蝕石像', e:'🗿', race:'rock', tag:'hard', tool:'water', zone:'狂風暴雨島',
      bt:{ hp:44, atk:12, def:6, spd:2, crit:5, drop:{ shell:[6,9], item:'stone', p:0.8 }, d:'被海風削成怪形狀的石頭,慢慢站了起來。' },
      sk:{ t:'quake', n:'崩落', e:'🪨', p:40, cd:3, mul:0.8, stunP:25, tele:'石頭上的裂縫越來越大,碎石開始掉落……', hint:'全體受傷,可能被震暈;💧 潑冷水讓曬熱的石頭裂開。' },
      tr:'風蝕岩身:體力多、防禦高', hint:'曬熱的石頭潑冷水會裂開', why:'岩石熱脹冷縮反覆變化就會裂開,這是風化作用。',
      q:{ q:'海邊的岩石被風和浪長年刻成奇怪的形狀,這叫做什麼?', o:['風化和侵蝕','岩石自己慢慢長大變形','有人偷偷拿工具雕刻','岩石被太陽曬到融化'], a:0, why:'風、雨、浪、溫度變化會讓岩石碎裂(風化),再被風和水帶走(侵蝕),野柳的女王頭就是這樣形成的。' },
      cx:'【岩石族・風蝕岩身】台灣野柳的女王頭、蕈狀岩,都是海風和海浪花了上萬年慢慢雕出來的。',
      wit:'被太陽曬得滾燙的石頭,突然被冷水一潑會怎麼樣?' },
    { k:'thundercloud', n:'雷雲精', e:'⛈', race:'elem', tag:'elem', tool:'glove', zone:'狂風暴雨島',
      bt:{ hp:32, atk:15, def:1, spd:9, crit:20, drop:{ shell:[6,10], item:'crystal', p:0.3 }, d:'一小團不停閃著電光的烏雲,靠近就頭髮豎起來。', stunOnHitP:15 },
      sk:{ t:'chain', n:'落雷', e:'⚡', p:45, cd:2, mul:1.2, n2:3, metalP:50, tele:'雲裡閃著白光,劈哩啪啦的聲音越來越大……', hint:'隨機打 3 人,穿鐵甲更痛;🧤 橡膠手套能抓住它。' },
      tr:'帶電雲體:偶爾讓人麻痺', hint:'戴橡膠手套抓它', why:'橡膠是絕緣體,電流過不去。',
      q:{ q:'打雷的時候,為什麼不要站在空曠地的大樹下?', o:['閃電常打在最高最尖的地方','大樹可能會被風吹倒壓到人','大樹下面比較冷,容易著涼感冒','大樹下面有很多蟲會出來咬人'], a:0, why:'閃電會找最近的路到地面,高聳孤立的樹最容易被打中,站在下面很危險。' },
      cx:'【元素族・帶電雲體】積雨雲裡的冰晶和水滴互相摩擦會累積電荷,累積夠多就放電變成閃電。',
      wit:'電流最怕遇到什麼材料?電工穿戴的是什麼?' },
    /* 🌊 海底洞穴 */
    { k:'puffer', n:'刺魨球', e:'🐡', race:'aquatic', tag:'hard', tool:'glove', zone:'海底洞穴',
      bt:{ hp:40, atk:13, def:6, spd:3, crit:5, drop:{ shell:[7,10], item:'shell', p:0.6 }, d:'一受驚就鼓成刺球的魚,全身的刺都豎起來。' },
      sk:{ t:'harden', n:'膨脹', e:'🐡', p:40, cd:3, dur:2, defMul:2.5, tele:'大口大口地吞水,身體越鼓越大……', hint:'防禦大增 2 回合;🧤 厚手套能抓住牠的刺。' },
      tr:'膨脹刺球:防禦極高', hint:'戴厚手套抓牠的刺', why:'刺魨膨脹時全身的刺都豎起來,厚手套能保護手。',
      q:{ q:'刺魨遇到危險時會把身體鼓得圓滾滾,是靠什麼?', o:['大口吞水把胃撐大','身體自己發熱就膨脹起來','吸進很多泥沙把身體撐開','把身體裡的骨頭往外撐開'], a:0, why:'刺魨能快速吞進大量的水把胃撐大,變成一顆刺球,讓掠食者吞不下去。' },
      cx:'【水族・膨脹刺球】河魨(刺魨的親戚)的內臟有劇毒「河魨毒素」,沒有專業處理絕對不能吃。',
      wit:'全身都是刺,要怎麼樣才敢伸手抓?' },
    { k:'lionfish', n:'獅子魚', e:'🐠', race:'aquatic', tag:'', tool:'glove', zone:'海底洞穴',
      bt:{ hp:32, atk:15, def:2, spd:8, crit:15, drop:{ shell:[7,10], item:'fish', p:0.6 }, d:'鰭像羽毛扇一樣張開的美麗魚,鰭棘上藏著毒。' },
      sk:{ t:'burn', n:'毒鰭棘', e:'☠', p:40, cd:3, mul:0.5, dot:6, dur:2, tele:'鰭全部張開,像一朵帶刺的花……', hint:'全體中毒 2 回合;🧤 厚手套能避開毒刺。' },
      tr:'毒鰭棘:被刺到會中毒', hint:'戴厚手套避開毒刺', why:'獅子魚的毒在背鰭的棘刺上,隔著厚手套就刺不進皮膚。',
      q:{ q:'獅子魚跑到原本沒有牠的海域大量繁殖,這種生物叫做?', o:['外來入侵種','受法律保護的保育類動物','只住在當地的特有種','本來就住在那裡的原生種'], a:0, why:'被人帶到新環境、又沒有天敵控制的生物,會大量繁殖搶走原生物種的食物,叫做外來入侵種。' },
      cx:'【水族・毒鰭棘】獅子魚原本住在印度洋和太平洋,被人放生到大西洋後沒有天敵,吃光了很多珊瑚礁小魚。',
      wit:'牠美麗的鰭上藏著毒刺……用什麼包住手才安全?' },
    { k:'moray', n:'狂暴海鱔', e:'🐍', race:'aquatic', tag:'soft', tool:'bait', zone:'海底洞穴',
      bt:{ hp:36, atk:16, def:2, spd:7, crit:15, drop:{ shell:[7,10], item:'fish', p:0.6 }, d:'躲在岩縫裡的大海鱔,嘴巴一張一合露出尖牙。' },
      sk:{ t:'charge', n:'雙顎咬', e:'🦷', p:45, cd:2, mul:2.3, tele:'牠慢慢從洞裡探出頭,嘴巴張得好大……', hint:'單體重擊!快用「!」閃避;🪱 誘餌能把牠引出洞。' },
      tr:'洞穴伏擊:咬合很痛', hint:'用誘餌把牠引出洞外', why:'海鱔躲在洞裡等獵物經過,看到食物就會整條竄出來。',
      q:{ q:'海鱔的嘴巴總是一張一合,是在做什麼?', o:['讓水流過鰓來呼吸','在跟游過去的魚講話','在嘴巴裡面嚼口香糖','在用嘴巴偷偷唱歌'], a:0, why:'海鱔的鰓蓋很小,要一直張嘴讓水流進來經過鰓,才能呼吸到水裡的氧氣。' },
      cx:'【水族・洞穴伏擊】海鱔的喉嚨裡還藏著第二副顎(咽頜),咬住獵物後會把它往喉嚨裡拖。',
      wit:'牠總是躲在洞裡守株待兔……要怎麼讓牠自己游出來?' },
    { k:'jellyghost', n:'深海水母靈', e:'🪼', race:'soft', tag:'soft', tool:'net', zone:'海底洞穴',
      bt:{ hp:30, atk:13, def:1, spd:6, crit:10, drop:{ shell:[7,10], item:'kelp', p:0.4 }, d:'透明發光的水母,長長的觸手在水裡飄。', stunOnHitP:15 },
      sk:{ t:'petrify', n:'觸手麻痺', e:'⚡', p:40, cd:3, mul:0.7, stun:1, tele:'觸手輕輕飄過來,一碰到就刺刺麻麻……', hint:'被麻痺 1 回合不能動;🥅 捕網一撈就撈起來。' },
      tr:'刺絲胞:偶爾讓人麻痺', hint:'用捕網把牠撈起來', why:'水母沒有骨頭也游不快,網子一撈就撈起來了。',
      q:{ q:'水母的身體大約有多少是水?', o:['95% 以上','大約只有一半左右','大約只有十分之一','水母身體完全沒有水'], a:0, why:'水母的身體 95% 以上是水,沒有腦、沒有心臟也沒有骨頭,靠觸手上的刺絲胞捕食。' },
      cx:'【軟體族・刺絲胞】有一種「燈塔水母」在變老後能退回小時候的樣子,被稱為「長生不老」的水母。',
      wit:'牠軟軟的又游得很慢……有什麼東西一撈就能把牠帶走?' },
    { k:'anglerlure', n:'誘光鮟鱇', e:'🐟', race:'aquatic', tag:'', tool:'mirror', zone:'海底洞穴',
      bt:{ hp:38, atk:16, def:3, spd:5, crit:15, drop:{ shell:[8,11], item:'crystal', p:0.3 }, d:'頭上掛著一盞小燈籠的深海魚,大嘴裡全是尖牙。' },
      sk:{ t:'vanish', n:'誘光', e:'💡', p:40, cd:3, dur:2, missP:45, tele:'黑暗中只剩一點晃動的光,牠的身體不見了……', hint:'攻擊常常落空;🪞 鏡子把光反射回去就看得到牠。' },
      tr:'發光誘餌:藏在黑暗裡', hint:'用鏡子把牠的光反射回去', why:'鮟鱇靠頭上的發光誘餌引獵物靠近;鏡子把光反射回去,就看得清楚牠藏在哪。',
      q:{ q:'深海鮟鱇頭上的「小燈籠」是用來做什麼的?', o:['發光引誘獵物靠近','在漆黑的深海裡照路','發出強光嚇跑別的大魚','閃一閃跟同伴打招呼'], a:0, why:'深海一片漆黑,鮟鱇頭上發光的誘餌會吸引好奇的小魚游過來,再一口吞下;光其實是共生的細菌發出來的。' },
      cx:'【水族・發光誘餌】有些深海鮟鱇的雄魚很小,會咬住雌魚後跟她長在一起,一輩子都不分開。',
      wit:'牠頭上的光是唯一的亮點……要是把光彈回去照向牠自己呢?' },
    { k:'ventember', n:'熱泉噴發精', e:'♨', race:'elem', tag:'elem', tool:'magnet', zone:'海底洞穴',
      bt:{ hp:34, atk:16, def:2, spd:6, crit:10, drop:{ shell:[8,11], item:'sulfide', p:0.35 }, d:'從黑煙囪冒出來的滾燙精靈,四周的水都在冒泡。' },
      sk:{ t:'burn', n:'熱泉噴發', e:'♨', p:40, cd:3, mul:0.55, dot:6, dur:2, tele:'海底轟隆一聲,滾燙的黑水往上噴……', hint:'全體燙傷 2 回合;🧲 磁鐵能吸走牠身上的金屬礦。' },
      tr:'高溫熱泉:會燙傷人', hint:'磁鐵能吸走牠身上的金屬礦', why:'海底熱泉噴出的水裡含有很多鐵等金屬礦物,磁鐵能把含鐵的礦物吸出來。',
      q:{ q:'深海熱泉旁的生物沒有陽光,靠什麼得到能量?', o:['細菌用熱泉的化學物質做養分','靠月亮的光照進深海行光合作用','靠從海面上掉下來的雨水過日子','靠海底火山直接噴出來的火焰取暖'], a:0, why:'熱泉旁的細菌能利用硫化物等化學物質製造養分(化學合成),管蟲、蝦蟹再靠這些細菌生活,是不靠陽光的生態系。' },
      cx:'【元素族・高溫熱泉】深海熱泉的水可以超過 350°C,因為深海的水壓很大,水在那麼高溫下也不會沸騰。',
      wit:'牠噴出的熱水裡有很多金屬礦……什麼東西特別愛吸鐵?' }
  ];
  (function(){
    var L = D.SEA_MONS, i, m, j, st = ['idle','atk','hit','stun','down'];
    for(i = 0; i < L.length; i++){
      m = L[i];
      D.MONSTERS.push({ k:m.k, n:m.n, e:m.e, tool:m.tool, from:1, wild:true, sea:true, race:m.race, tr:m.tr, hint:m.hint, why:m.why, q:m.q });
      D.MON_BT[m.k] = m.bt; D.MON_SKILL[m.k] = m.sk; D.MON_TAG_OF[m.k] = m.tag; D.MON_RACE_OF[m.k] = m.race;
      D.CODEX.push({ id:m.k, cat:'monster', n:m.n, e:m.e, img:'bt_m_' + m.k + '_idle', where:m.zone + '(野外)', d:m.cx + '(怕:' + D.defTool(m.tool).e + D.defTool(m.tool).n + ')' });
      D.WIT_HINT[m.k] = m.wit;
      for(j = 0; j < st.length; j++) D.IMG['bt_m_' + m.k + '_' + st[j]] = 'island_bt_m_' + m.k + '_' + st[j] + '.png';
    }
    /* 外島精英必掉的島專屬材料 */
    var DR = { walrus:'ivory', snowball:'frostcrystal', frostwolf:'qiviut', blizzardowl:'frostcrystal', icewisp:'frostcrystal', polarshade:'frostcrystal',
               caiman:'latex', piranha:'latex', armyant:'cacao', sporeshroom:'latex', poisonfrog:'nut', stranglevine:'latex',
               stormcrab:'guano', saltghost:'guano', frigatethief:'guano', whirlwind:'guano', erodegolem:'guano', thundercloud:'crystal',
               puffer:'coralbit', lionfish:'coralbit', moray:'coralbit', jellyghost:'kelp', anglerlure:'sulfide', ventember:'sulfide' }, k;
    for(k in DR){ if(DR.hasOwnProperty(k)) D.ELITE.DROP[k] = DR[k]; }
  })();

  /* ── 四隻島主(第 5 區巢穴;格式同 D.BOSSES;探索度 ≥80% 巢穴才出現,7 天重生) ── */
  D.BOSSES.push(
    { zone:'ice_peak', k:'mammothking', n:'冰河猛瑪王', e:'🦣', lv:60, hp:400, atk:52, def:5, spd:4, crit:10, tool:'torch', weakWp:['hammer','spear'], core:'core_mammoth', sea:true,
      hint:'🔦 冰河時期的野獸也怕火光;錘的重擊和矛的長刺最能打亂牠。',
      skills:[ { t:'quake', n:'冰原踐踏', e:'🦶', p:40, cd:3, mul:0.8, stunP:30, tele:'巨大的腳舉得好高,冰面開始裂開……', hint:'全體受傷,可能被震暈;🔦 火把智取可以取消。' },
               { t:'summon', n:'召喚霜狼', e:'🐺', p:40, cd:3, k:'frostwolf', cnt:2, tele:'仰頭發出低沉的長鳴,遠方傳來狼嚎……', hint:'會叫出 2 隻霜狼。' } ],
      p2:{ atkMul:1.2, summon:'frostwolf', text:'冰河猛瑪王甩動長毛,冰屑像暴風雪一樣飛散!' },
      ult:{ n:'冰河紀元', e:'🧊', every:5, cd:2, mul:2.3, cover:0.2, tele:'四周的溫度一下子掉到冰點以下,空氣都結霜了……',
        q:[ { q:'猛瑪象為什麼全身長滿了長毛?', o:['牠生活在冰河時期的寒冷地區','為了在炎熱的沙漠裡擋住太陽','長毛能讓牠在水裡游得比較快','只是為了讓自己看起來比較大隻'], a:0, why:'猛瑪象生活在冰河時期,長毛加上厚脂肪能抵擋零下幾十度的嚴寒。' },
            { q:'冰河時期的海平面比現在低,主要是因為?', o:['大量的水變成冰,留在陸地上','海水被那時候的太陽曬乾了一大半','海底突然變得比現在深了很多','那時候全世界都完全不會下雨'], a:0, why:'冰河時期大量海水變成冰河和冰原堆在陸地上,海水變少、海平面就下降;台灣海峽那時候曾經是陸地!' } ] } },
    { zone:'jungle_giant', k:'treespirit', n:'絞殺巨木靈', e:'🌳', lv:65, hp:400, atk:56, def:5, spd:3, crit:10, tool:'sickle', weakWp:['stoneaxe','hammer'], core:'core_treespirit', sea:true,
      hint:'🌾 鐮刀能割斷纏繞的氣根;斧頭和錘最能傷到樹幹。',
      skills:[ { t:'sticky', n:'根網', e:'🕸', p:45, cd:2, mul:1.0, slow:2, tele:'地面的樹根一條條拱起來……', hint:'被纏住會變慢 2 回合;🌾 鐮刀智取可以取消。' },
               { t:'heal', n:'光合再生', e:'☀', p:35, cd:4, healP:15, tele:'樹冠打開,陽光灑在葉子上閃閃發亮……', hint:'會回復 15% 體力;趁這時集中火力。' } ],
      p2:{ atkMul:1.2, summon:'stranglevine', text:'絞殺巨木靈的氣根像蛇一樣甩動,整片雨林都在搖晃!' },
      ult:{ n:'千年板根', e:'🌳', every:5, cd:2, mul:2.3, cover:0.2, tele:'巨大的板根從地底翻起,像牆一樣壓過來……',
        q:[ { q:'熱帶雨林的大樹為什麼常長出又寬又扁的「板根」?', o:['土壤淺,板根從側面撐住樹幹','板根可以拿來儲存大量的雨水','為了讓森林裡的動物躲在板根後面','板根可以讓大樹自己慢慢移動走路'], a:0, why:'雨林的土壤很淺、根長不深,大樹就長出像牆一樣的板根,從側面把樹撐穩。' },
            { q:'熱帶雨林的植物那麼多,土壤卻很貧瘠,是因為?', o:['落葉很快分解,養分又被吸走','雨林的土壤裡其實全部都是沙子','雨林裡的樹一年到頭從來不會掉葉子','雨水把土壤裡的養分都沖到天上去了'], a:0, why:'又熱又濕讓落葉幾天就被分解,養分很快又被植物吸回去,所以養分都存在植物身上,不在土裡。' } ] } },
    { zone:'storm_eye', k:'hurricane', n:'颶風元靈', e:'🌀', lv:70, hp:400, atk:60, def:4, spd:8, crit:15, tool:'smoke', weakWp:['bow','boomerang'], core:'core_hurricane', sea:true,
      hint:'💨 煙能看出旋轉的中心;弓和迴力鏢能從遠處打中飛舞的身體。',
      skills:[ { t:'aoe', n:'暴風捲', e:'🌪', p:40, cd:3, mul:0.8, slow:1, tele:'四周的風越轉越快,砂石開始飛起來……', hint:'全體受傷並減速;💨 煙智取可以取消。' },
               { t:'chain', n:'連環落雷', e:'⚡', p:40, cd:2, mul:1.2, n2:3, metalP:50, tele:'雲層裡閃著白光,轟隆聲越來越近……', hint:'隨機打 3 人,穿鐵甲更痛。' } ],
      p2:{ atkMul:1.2, summon:'thundercloud', text:'颶風元靈發出尖嘯,雲牆裡衝出一團團雷雲!' },
      ult:{ n:'十七級強風', e:'🌀', every:5, cd:2, mul:2.4, cover:0.2, tele:'風聲變成尖叫,整片天空都在旋轉……',
        q:[ { q:'颱風眼裡為什麼幾乎沒有風,天氣還很晴朗?', o:['中心的空氣往下沉,雲都散開了','颱風眼裡有一面看不見的牆在擋風','風全部都被吹到遠遠的海裡面去了','颱風眼是颱風停在中間睡午覺的地方'], a:0, why:'颱風中心的空氣是往下沉的,下沉的空氣變乾、雲就散了,所以颱風眼裡風平浪靜;但四周的眼牆風雨最強!' },
            { q:'北半球的颱風是往哪個方向旋轉?', o:['逆時針','順時針(跟時鐘走的方向一樣)','上下翻轉(像摩天輪一樣)','完全不會旋轉(直直前進)'], a:0, why:'受到地球自轉的影響(科氏力),北半球的颱風是逆時針旋轉,南半球則是順時針。' } ] } },
    { zone:'deep_vent', k:'giantsquid', n:'深淵大王魷', e:'🦑', lv:76, hp:400, atk:64, def:4, spd:6, crit:15, tool:'mirror', weakWp:['spear','bow'], core:'core_giantsquid', sea:true,
      hint:'🪞 突然的閃光會讓深海生物嚇一大跳;矛和弓最適合刺穿軟軟的身體。',
      skills:[ { t:'petrify', n:'八腕纏繞', e:'🦑', p:40, cd:3, mul:0.8, stun:1, tele:'長長的腕足從黑暗中伸過來……', hint:'被纏住 1 回合不能動;🪞 鏡子智取可以取消。' },
               { t:'blind', n:'噴墨', e:'🖤', p:40, cd:3, dur:2, mul:0.4, tele:'身體縮了一下,準備噴出一大團墨汁……', hint:'全隊看不清楚,命中下降 2 回合。' } ],
      p2:{ atkMul:1.2, summon:'jellyghost', text:'深淵大王魷全身變成紅色,招來一群發光的水母!' },
      ult:{ n:'深淵之眼', e:'👁', every:5, cd:2, mul:2.4, cover:0.2, tele:'黑暗中亮起一隻比籃球還大的眼睛,牢牢盯著你們……',
        q:[ { q:'大王魷的眼睛為什麼那麼大(跟籃球差不多)?', o:['深海很暗,大眼睛收集微弱的光','為了讓自己看起來兇一點,嚇跑敵人','眼睛裡面裝著潛水要用的備用空氣','眼睛越大,在水裡就游得越快越遠'], a:0, why:'大王魷的眼睛是動物界最大之一,在幾乎沒有光的深海,大眼睛能收集微弱的光,及早看到天敵抹香鯨。' },
            { q:'潛水潛得越深,耳朵就越痛,是因為?', o:['越深水壓越大,壓迫耳膜','深海的水溫特別冰冷刺骨','深海裡傳來的聲音特別大聲','深海的魚會游到耳邊大聲叫'], a:0, why:'水越深,上面壓著的水越多,水壓就越大,會把耳膜往裡壓,所以潛水要學會「平衡耳壓」。' } ] } }
  );
  (function(){
    var st = ['idle','atk','hit','stun','down','skill'], i, j, b,
        TAG = { mammothking:'hard', treespirit:'hard', hurricane:'fly', giantsquid:'soft' },
        RACE = { mammothking:'beast', treespirit:'plant', hurricane:'elem', giantsquid:'soft' },
        CX = { mammothking:{ d:'猛瑪象是大象的親戚,生活在冰河時期;西伯利亞的凍土裡還挖得到保存完整、連毛都在的遺骸。', where:'冰天雪地島・極光冰峰' },
               treespirit:{ d:'絞殺榕從大樹頂端發芽,氣根一路往下長,最後把宿主樹整個包住;宿主樹死掉腐爛後,中間會留下一個空心的「樹洞塔」。', where:'熱帶雨林島・千年巨木' },
               hurricane:{ d:'颱風、颶風、氣旋其實是同一種天氣現象,只是在不同海域有不同的名字;颱風眼直徑大約 20~50 公里。', where:'狂風暴雨島・風暴之眼' },
               giantsquid:{ d:'大王魷可以長到十幾公尺,眼睛直徑超過 25 公分;牠的天敵是抹香鯨,鯨魚身上常留著大王魷吸盤的圓形傷痕。', where:'海底洞穴・熱泉巨穴' } };
    for(i = 0; i < D.BOSSES.length; i++){ b = D.BOSSES[i]; if(!b.sea) continue;
      D.MON_BT[b.k] = { hp:b.hp, atk:b.atk, def:b.def, spd:b.spd, crit:b.crit, drop:{ shell:[0,0], item:null, p:0 }, d:b.hint };
      for(j = 0; j < st.length; j++) D.IMG['bt_m_' + b.k + '_' + st[j]] = 'island_bt_m_' + b.k + '_' + st[j] + '.png';
      D.IMG['poi_lair_' + b.zone] = 'island_poi_lair_' + b.zone + '.png';
      D.MON_TAG_OF[b.k] = TAG[b.k]; D.MON_RACE_OF[b.k] = RACE[b.k];
      D.CODEX.push({ id:b.k, cat:'boss', n:b.n, e:b.e, img:'bt_m_' + b.k + '_idle', where:CX[b.k].where + '巢穴', d:CX[b.k].d });
    }
  })();
  D.BOSS_GRD.mammothking = { n:'冰原崩裂', e:'🧊', aoe:1, t:'quake', mul:1.6, stun:1, s:'sfx-earthquake', tele:'猛瑪王用長牙重重敲擊冰面,裂縫往四面八方蔓延……', how:'跳到裂縫旁的厚冰上', sci:'冰河在重量和溫度變化下會裂開形成「冰隙」;冰隙常被雪蓋住,所以極地探險隊會用繩子綁在一起前進。' };
  D.BOSS_GRD.treespirit  = { n:'萬根穿地', e:'🌱', aoe:1, t:'aoe', mul:1.5, slow:2, s:'sfx-earthquake', tele:'腳下的土地在跳動,無數樹根準備破土而出……', how:'跳上倒下的樹幹', sci:'植物的根會朝著水和養分多的方向生長(向水性),力量大到能撐裂石頭和水泥地。' };
  D.BOSS_GRD.hurricane   = { n:'眼牆暴雨', e:'🌧', aoe:1, t:'aoe', mul:1.6, slow:2, s:'sfx-cleopatra-burst', tele:'颱風眼開始移動,四周的雲牆壓了過來……', how:'躲到岩石的背風面', sci:'颱風眼周圍的「眼牆」是風雨最強的地方;颱風眼經過時會突然風平浪靜,但很快另一側的眼牆又會到,千萬不能出門。' };
  D.BOSS_GRD.giantsquid  = { n:'墨汁暗流', e:'🌊', aoe:1, t:'blind', mul:1.6, blind:2, s:'sfx-darkness', tele:'大王魷捲起一陣暗流,墨汁把四周染得一片漆黑……', how:'抓緊岩石、閉上眼睛', sci:'頭足類(章魚、烏賊、魷魚)遇到危險會噴墨,墨汁在水中散開像煙幕,讓敵人看不見牠們逃到哪裡。' };
  D.WIT_HINT.mammothking = '冰河時期的野獸,最怕什麼又亮又熱的東西?';
  D.WIT_HINT.treespirit  = '纏得緊緊的氣根,要用什麼才割得斷?';
  D.WIT_HINT.hurricane   = '看不見的旋風,要怎麼看出它在哪裡轉?';
  D.WIT_HINT.giantsquid  = '深海的生物一直生活在黑暗裡……突然一道閃光會怎麼樣?';

  /* ── 外島夥伴 12 位(在對應區域活動成功就會遇到 → 送喜歡的食物 → 答題 5 題對 4 題加入;加入時等級 = D.SEA.joinLv[島]) ── */
  D.PET_CMDS.huddle      = { n:'企鵝圈',     e:'🐧', cd:4, fx:{ shield:18 }, d:'全隊擠在一起取暖,每人得到 18% 最大體力的護盾' };
  D.PET_CMDS.silentdive  = { n:'無聲撲擊',   e:'🦉', cd:3, fx:{ mul:2.0, first:1, critAdd:20 }, d:'這一回合必定先手,2 倍傷害且暴擊率 +20%' };
  D.PET_CMDS.snowpounce  = { n:'雪地撲躍',   e:'🦊', cd:2, fx:{ mul:1.1, stunP:40, stun:1 }, d:'一躍撲下,110% 傷害並有 40% 機率讓目標暈眩 1 回合' };
  D.PET_CMDS.calmbath    = { n:'泡水放鬆',   e:'🛁', cd:5, fx:{ healAll:25, regenAll:8, dur:3 }, d:'全隊立即恢復 25% 最大體力,接下來 3 回合每回合再恢復 8%' };
  D.PET_CMDS.clayscreech = { n:'喧鬧尖叫',   e:'🦜', cd:3, fx:{ all:1, skillSeal:1, dmgDownP:25, dur:1 }, d:'敵方全體 1 回合內無法使用技能,且造成的傷害降低 25%' };
  D.PET_CMDS.skullbite   = { n:'一口破殼',   e:'🐆', cd:3, fx:{ mul:2.4, critAdd:15 }, d:'2.4 倍傷害,這一擊暴擊率 +15%' };
  D.PET_CMDS.fishshare   = { n:'一口十條魚', e:'🐟', cd:4, fx:{ healAll:22 }, d:'把叼回來的小魚分給大家,全隊恢復 22% 最大體力' };
  D.PET_CMDS.shellfort   = { n:'百年甲殼',   e:'🐢', cd:3, fx:{ guard:1, cut:50, dur:1 }, d:'1 回合內代替任一隊友承受攻擊,並把傷害再減 50%' };
  D.PET_CMDS.stormglide  = { n:'乘風掠擊',   e:'🪶', cd:3, fx:{ hits:3, mul:0.8, sure:1, randHits:1 }, d:'三段掠擊,每段 80% 傷害,必中,每段隨機攻擊一隻敵人' };
  D.PET_CMDS.swordrush   = { n:'旗魚突刺',   e:'🗡', cd:3, fx:{ mul:2.2, first:1 }, d:'這一回合必定先手,2.2 倍傷害' };
  D.PET_CMDS.handhold    = { n:'手牽手漂浮', e:'🦦', cd:4, fx:{ shield:15 }, d:'大家手牽手不被沖走,每人得到 15% 最大體力的護盾' };
  D.PET_CMDS.armorcurl   = { n:'甲殼蜷縮',   e:'🛡', cd:4, fx:{ defUpP:40, dur:2 }, d:'全隊防禦 +40%,持續 2 回合' };
  (function(){
    var P = {
      empenguin: { n:'皇帝企鵝', e:'🐧', type:'tank', sz:70, b:{ hp:90, atk:5, def:6, spd:3 }, g:{ hp:8.4, atk:0.5, def:1.0, spd:0.14 },
        cmd:'huddle', talent:'輪流到外圈:自己受到的傷害固定減 35%,且每回合自動恢復自己 8% 最大體力', tal:{ cutP:35, selfRegenP:8 },
        get:{ how:'tame', zone:'ice_coast', p:15 }, food:'krill',
        sci:'皇帝企鵝住在南極,爸爸把蛋放在腳背上、用肚皮的皮褶蓋住,在零下 40 度的冬天站著孵兩個月。',
        quiz:[
          { q:'皇帝企鵝住在地球的哪裡?', o:['南極','北極','赤道附近的熱帶島嶼','高山上的森林裡'], a:0, why:'皇帝企鵝只住在南極,是體型最大的企鵝。' },
          { q:'皇帝企鵝的蛋是誰負責孵的?', o:['企鵝爸爸','企鵝媽媽','企鵝爺爺奶奶','隔壁的海豹幫忙'], a:0, why:'媽媽生完蛋就去海裡覓食,爸爸把蛋放在腳背上孵兩個月,這段時間幾乎都不吃東西。' },
          { q:'一大群皇帝企鵝擠在一起,還會慢慢輪流換位置,是為了什麼?', o:['讓每一隻都能輪到中間取暖','因為牠們在玩擠來擠去的捉迷藏','因為站得很近,比較方便聊天','因為大家要一起排隊下海游泳'], a:0, why:'站在外圈最冷,企鵝會慢慢輪流移動,讓大家都有機會到溫暖的中間。' },
          { q:'企鵝的翅膀主要用來做什麼?', o:['在水裡划水游泳','用力拍動飛到天空上','用來把魚抓住送進嘴裡','用來在雪地裡挖洞'], a:0, why:'企鵝的翅膀變成又硬又扁的鰭狀肢,在水裡像槳一樣划,游得又快又遠。' },
          { q:'企鵝身上黑背白肚的顏色,在海裡有什麼好處?', o:['從上看像深海、從下看像水面','黑白配色讓企鵝看起來比較帥氣','黑白配色比較容易被同伴看見','黑色的背可以讓牠游得比較快'], a:0, why:'從上往下看,黑背和深色的海融在一起;從下往上看,白肚子和亮亮的水面融在一起,這叫「反蔭蔽」保護色。' },
          { q:'皇帝企鵝主要吃什麼?', o:['魚、烏賊和磷蝦','岸邊的海藻和地衣','冰塊和白白的雪花','海豹剛生下的寶寶'], a:0, why:'皇帝企鵝會潛到幾百公尺深去抓魚、烏賊和磷蝦。' },
          { q:'企鵝在冰天雪地裡不會凍壞,最主要靠什麼?', o:['厚厚的脂肪和密密的羽毛','體內有一顆會發熱的小石頭','一直不停地走路讓自己變熱','每天晚上都會躲進溫泉裡面'], a:0, why:'企鵝有很厚的皮下脂肪,羽毛又短又密層層疊著,能擋住寒風、鎖住體溫。' },
          { q:'企鵝寶寶剛出生時,身上的毛是什麼樣子?', o:['灰色的絨毛,還不能下水','跟爸媽一樣的黑白防水羽毛','完全沒有長毛,全身光溜溜','全身長滿亮橘色的硬鱗片'], a:0, why:'企鵝寶寶全身是灰色絨毛,不防水,要等換成防水的羽毛之後才能下海。' },
          { q:'企鵝在冰上有時候會趴下用肚子滑行,為什麼?', o:['比用腳走路更快又更省力','因為牠們的腳受傷走不動了','為了把冰面擦得乾乾淨淨','為了讓肚子貼著冰涼快一點'], a:0, why:'企鵝的腳短短的走路很慢,趴著用腳推冰滑行又快又省力,看起來像在溜滑梯。' },
          { q:'南極的海冰越來越少,對企鵝會有什麼影響?', o:['失去繁殖和休息的地方','企鵝會變得更容易找到食物','企鵝會因此全部搬到北極去住','完全不會對企鵝有任何影響'], a:0, why:'皇帝企鵝在海冰上繁殖育幼;全球暖化讓海冰提早融化,寶寶還沒長好防水羽毛就可能落海。' } ] },
      snowyowl: { n:'雪鴞', e:'🦉', type:'atk', sz:55, b:{ hp:60, atk:11, def:2, spd:8 }, g:{ hp:6.0, atk:1.15, def:0.3, spd:0.32 },
        cmd:'silentdive', talent:'銳利夜視:自己的普通攻擊有 25% 機率暴擊(1.5 倍)', tal:{ critP:25 },
        get:{ how:'tame', zone:'ice_taiga', p:14 }, food:'d_fish',
        sci:'雪鴞住在北極苔原,白天也會出來打獵;旅鼠多的年份,雪鴞就會生比較多的蛋。',
        quiz:[
          { q:'雪鴞的羽毛大部分是白色的,對牠有什麼好處?', o:['在雪地裡不容易被發現','讓牠在天上飛得比較快一點','白色的羽毛可以自己發熱','讓牠看起來比較乾淨漂亮'], a:0, why:'白色和雪地融為一體,是很好的保護色,也方便悄悄接近獵物。' },
          { q:'雪鴞和大部分貓頭鷹不一樣的地方是什麼?', o:['白天也出來打獵','完全不會在天上飛','只吃樹上的水果','只在海裡面生活'], a:0, why:'北極夏天太陽整天不下山,雪鴞白天也照常打獵。' },
          { q:'雪鴞最喜歡吃哪一種小動物?', o:['旅鼠','海豹','企鵝','馴鹿'], a:0, why:'旅鼠是雪鴞最主要的食物,一隻雪鴞一年可以吃掉上千隻旅鼠。' },
          { q:'雪鴞的腳上也長滿羽毛,這有什麼用?', o:['像穿毛襪子一樣保暖','讓腳比較好抓住細細的樹枝','讓牠走路的時候完全沒有聲音','讓牠的腳看起來比較大比較兇'], a:0, why:'腳上的羽毛像毛襪,在冰天雪地裡幫助保暖。' },
          { q:'貓頭鷹的頭為什麼能轉得那麼大圈?', o:['眼睛不能轉,只好轉頭','因為牠的脖子特別短小','因為牠想要嚇唬天上的敵人','因為牠的頭非常輕,很好轉動'], a:0, why:'貓頭鷹的眼睛固定在眼眶裡不能轉,所以脖子特別靈活,頭可以轉大約 270 度。' },
          { q:'貓頭鷹吃完獵物後會吐出一團東西,那是什麼?', o:['消化不了的骨頭和毛','吃太飽了吐出來的肉','準備帶回去送給寶寶的食物','不小心吞下去的小石頭'], a:0, why:'貓頭鷹會把骨頭和毛壓成一團「食繭」吐出來,科學家可以從食繭知道牠吃了什麼。' },
          { q:'旅鼠變少的年份,雪鴞通常會怎樣?', o:['蛋變少,甚至不繁殖','反而生下更多更多的蛋','改成去吃樹上的葉子','全部搬到熱帶的地方去住'], a:0, why:'食物少時雪鴞會少生或不生寶寶,這是食物鏈互相影響的例子。' },
          { q:'貓頭鷹飛行時幾乎沒有聲音,主要是因為?', o:['羽毛邊緣有細細的鋸齒','牠的翅膀其實是用布做的','牠飛的時候從來都不拍翅膀','牠都在地上走路,很少飛起來'], a:0, why:'羽毛邊緣的細鋸齒和柔軟的絨毛能打散氣流,讓翅膀拍動時幾乎沒有聲音。' },
          { q:'貓頭鷹的臉為什麼像一個圓圓的碟子?', o:['可以把聲音集中到耳朵','讓牠的臉看起來比較可愛','可以接住從天上掉下來的雨','讓牠在水裡游泳時比較省力'], a:0, why:'碟子狀的臉盤像雷達一樣收集聲音,幫助牠聽出獵物的位置。' },
          { q:'雪鴞的寶寶在哪裡長大?', o:['苔原地面的淺巢','高高的大樹洞裡','漂在海上的浮冰','沙漠的沙堆裡面'], a:0, why:'北極苔原沒有高大的樹,雪鴞直接在地上微微隆起的小丘做巢,方便觀察四周。' } ] },
      arcticfox: { n:'北極狐', e:'🦊', type:'ctrl', sz:50, b:{ hp:52, atk:7, def:3, spd:9 }, g:{ hp:5.4, atk:0.65, def:0.4, spd:0.36 },
        cmd:'snowpounce', talent:'換季換毛:自己造成暈眩的機率 +15%', tal:{ stunAddP:15 },
        get:{ how:'tame', zone:'ice_tundra', p:16 }, food:'cloudberry',
        sci:'北極狐冬天換成白毛、夏天換成棕灰色,跟著季節變換保護色;牠能聽到雪底下旅鼠的聲音,一躍撲進雪裡抓。',
        quiz:[
          { q:'北極狐冬天和夏天的毛色有什麼不同?', o:['冬天白色、夏天棕灰色','一年四季都是黑色的毛','冬天綠色、夏天變成紅色','完全沒有毛,也沒有任何顏色'], a:0, why:'北極狐會跟著季節換毛,冬天白色融入雪地、夏天棕灰色融入岩石和苔原。' },
          { q:'北極狐的耳朵比一般狐狸小,這有什麼好處?', o:['減少熱量從耳朵散失','讓牠聽得比較清楚一點','讓牠在雪地跑得比較快','讓牠看起來比較好看可愛'], a:0, why:'寒冷地區的動物耳朵、尾巴、腳通常比較短小,露在外面的面積小,熱量就不容易散失。' },
          { q:'北極狐怎麼抓躲在雪底下的旅鼠?', o:['聽聲音找位置再撲進雪裡','用鼻子用力把雪全部吹開','挖一條很長很長的地道慢慢找','在雪地上一直等旅鼠自己跑出來'], a:0, why:'北極狐靠靈敏的聽覺找到雪下的旅鼠,高高跳起再一頭撲進雪裡抓。' },
          { q:'北極狐睡覺時會用什麼蓋住自己保暖?', o:['自己毛茸茸的大尾巴','從地上撿來的一堆落葉','用雪做成的一條厚被子','從海豹身上剝下來的皮'], a:0, why:'北極狐會捲成一團,用蓬鬆的大尾巴蓋住鼻子和腳,像蓋被子一樣。' },
          { q:'北極狐的腳底有什麼特別的地方?', o:['長滿了毛,像穿毛襪子','有吸盤可以爬上冰做的牆','腳趾之間有蹼可以游泳','腳底會一直發熱融化冰雪'], a:0, why:'腳底長毛能保暖,也讓牠在冰上不容易滑倒。' },
          { q:'冬天食物不夠的時候,北極狐常常會怎麼做?', o:['跟著北極熊撿剩下的食物','冬眠一整個冬天都不吃任何東西','游泳到南極那裡去找食物吃','改成每天只吃雪和冰塊過日子'], a:0, why:'北極狐很聰明,會跟在北極熊後面撿牠吃剩的海豹,也會把多的食物藏起來。' },
          { q:'北極狐的保護色,主要的作用是什麼?', o:['躲避天敵,也方便偷偷靠近獵物','讓同伴比較容易在雪地裡找到牠','讓牠的身體在冬天比較溫暖一點','讓牠身上的毛長得比較快比較長'], a:0, why:'保護色讓動物和環境融為一體,既不容易被老鷹、狼發現,也方便偷偷接近獵物。' },
          { q:'夏天北極狐除了旅鼠,還會吃什麼?', o:['莓果、鳥蛋和昆蟲','只吃冰塊和白白雪','只吃海裡面的海藻','只吃樹上面的葉子'], a:0, why:'北極狐是雜食性動物,夏天也吃雲莓等莓果、鳥蛋和昆蟲。' },
          { q:'北極狐住在什麼樣的家?', o:['在土堆裡挖的地洞','樹上別人的鳥巢裡','冰山最高的頂端上','海底深處的洞穴裡'], a:0, why:'北極狐在苔原的土丘裡挖洞,有的洞穴一代傳一代,用了好幾百年。' },
          { q:'北極狐和沙漠裡的耳廓狐比,耳朵大小有什麼不同?', o:['北極狐耳小、耳廓狐耳大','兩種狐狸的耳朵完全一樣大','北極狐耳大、耳廓狐耳小','兩種狐狸都完全沒有長耳朵'], a:0, why:'沙漠的耳廓狐用大耳朵散熱,北極狐用小耳朵保暖——同樣是狐狸,住在不同環境就長得不一樣。' } ] },
      capybara: { n:'水豚', e:'🦫', type:'heal', sz:65, b:{ hp:60, atk:4, def:2, spd:6 }, g:{ hp:5.9, atk:0.4, def:0.34, spd:0.28 },
        cmd:'calmbath', talent:'和平使者:每回合恢復全隊 4% 最大體力', tal:{ tickHealAllP:4 },
        get:{ how:'tame', zone:'jungle_mangrove', p:18 }, food:'banana',
        sci:'水豚是世界上最大的囓齒動物,住在南美洲的河邊;牠脾氣溫和,常有鳥站在牠背上幫忙吃小蟲。',
        quiz:[
          { q:'水豚是世界上最大的哪一類動物?', o:['囓齒動物','貓科動物','鳥類動物','爬蟲類動物'], a:0, why:'水豚和老鼠、松鼠一樣是囓齒動物,體重可以到 60 公斤,是最大的囓齒動物。' },
          { q:'水豚的眼睛、耳朵、鼻孔都長在頭頂上,有什麼好處?', o:['泡在水裡時還能看、聽、呼吸','讓牠的頭看起來比較平比較可愛','讓牠在吃東西的時候比較方便','讓牠晚上睡覺時可以睡得比較舒服'], a:0, why:'跟鱷魚、河馬一樣,五官長在頭頂,身體泡在水裡也能觀察四周。' },
          { q:'水豚的腳趾之間有什麼,讓牠很會游泳?', o:['蹼','吸盤','爪子','鱗片'], a:0, why:'水豚腳趾間有小小的蹼,游泳很厲害,遇到危險會跳進水裡躲起來。' },
          { q:'水豚主要吃什麼?', o:['水草和青草','河裡的小魚','飛來的昆蟲','比較小的動物'], a:0, why:'水豚是草食動物,吃水草、青草和水果。' },
          { q:'為什麼常常看到鳥站在水豚背上?', o:['鳥在幫水豚吃身上的小蟲','鳥想要搭便車去遠方旅行','水豚在幫忙背著鳥寶寶們','鳥正在跟水豚吵架、打架'], a:0, why:'鳥吃水豚身上的小蟲,水豚少了蟲子叮咬,兩邊都有好處。' },
          { q:'水豚的牙齒會一直長,所以牠需要怎麼做?', o:['常常啃咬磨牙','每年去讓醫生拔牙','一直都不吃東西','用石頭把牙敲斷'], a:0, why:'囓齒動物的門牙一輩子都在長,要靠啃咬植物來磨短。' },
          { q:'水豚遇到危險時通常會怎麼做?', o:['跳進水裡潛起來躲','站起來大聲地吼叫','很快地爬到樹上去','躺在地上裝死不動'], a:0, why:'水豚可以潛水好幾分鐘,遇到美洲豹等天敵就躲進水裡。' },
          { q:'水豚為什麼喜歡泡在水裡或泥巴裡?', o:['散熱,也能防蚊蟲','因為牠沒有腳可以走','因為牠想把自己洗乾淨','因為牠在泥巴裡找寶藏'], a:0, why:'南美洲很熱,泡水能降溫,泥巴乾掉後還能保護皮膚不被蚊蟲叮。' },
          { q:'水豚通常是怎麼生活的?', o:['一小群家族住在一起','一輩子都自己一隻生活','全部住在深深的海底','住在高高的大樹上面'], a:0, why:'水豚喜歡群居,通常 10~20 隻一起生活,互相提醒危險。' },
          { q:'水豚被叫做「動物界的和平使者」,是因為?', o:['脾氣溫和,和誰都處得來','牠會跑去阻止別的動物打架','牠每天都會唱歌給大家聽','牠是所有動物選出來的國王'], a:0, why:'水豚個性很溫和,常有鳥、猴子甚至鱷魚在旁邊,看起來和大家都處得來。' } ] },
      macaw: { n:'金剛鸚鵡', e:'🦜', type:'ctrl', sz:55, b:{ hp:52, atk:6, def:3, spd:9 }, g:{ hp:5.4, atk:0.6, def:0.38, spd:0.38 },
        cmd:'clayscreech', talent:'吃黏土解毒:每回合自動幫隊伍解除 1 個不利狀態', tal:{ tickCure1:1 },
        get:{ how:'tame', zone:'jungle_canopy', p:16 }, food:'nut',
        sci:'金剛鸚鵡會成群飛到河岸邊啃食黏土,科學家認為黏土能幫牠們中和種子裡的毒素,也能補充鹽分。',
        quiz:[
          { q:'金剛鸚鵡的嘴巴又大又彎,最適合做什麼?', o:['咬開堅硬的果殼和種子','用來從河裡吸水來喝水','用來在地上挖出一個地洞','用來從河裡把魚抓起來吃'], a:0, why:'金剛鸚鵡的嘴力氣很大,可以咬開巴西堅果這類很硬的殼。' },
          { q:'金剛鸚鵡為什麼會成群去啃河岸的黏土?', o:['黏土能中和種子裡的毒素','因為黏土吃起來甜甜的很好吃','因為牠們要用黏土蓋房子','因為河岸的黏土會一閃一閃發光'], a:0, why:'牠們吃的種子有些含有毒素,黏土能吸附毒素,也能補充鹽分。' },
          { q:'鸚鵡的腳趾有什麼特別的排列?', o:['兩根朝前、兩根朝後','四根腳趾全部都朝前','每隻腳只有一根腳趾','腳趾長在背上的羽毛裡'], a:0, why:'兩前兩後的腳趾讓鸚鵡能牢牢抓住樹枝,還能像手一樣拿食物。' },
          { q:'金剛鸚鵡通常住在雨林的哪一層?', o:['高高的樹冠層','深深的地底下','河流的最底部','海邊的沙灘上'], a:0, why:'金剛鸚鵡住在樹冠層和突出層,在高高的樹洞裡築巢。' },
          { q:'鸚鵡為什麼能模仿人說話?', o:['舌頭和發聲器官很靈活','因為牠們完全聽得懂人話','因為牠們每天都會讀書練習','因為牠們偷偷去上說話課'], a:0, why:'鸚鵡的舌頭厚實靈活、發聲器官很發達,又很聰明,能模仿聽到的聲音。' },
          { q:'金剛鸚鵡通常會跟伴侶在一起多久?', o:['常常一輩子在一起','只會在一起一天而已','從來都不會去找伴侶','只在下雨天在一起'], a:0, why:'金剛鸚鵡通常一夫一妻,配對後常常一起飛、一起吃,維持很多年。' },
          { q:'金剛鸚鵡羽毛鮮豔的顏色,在茂密的樹冠裡有什麼作用?', o:['方便同伴互相辨認','讓牠更容易被老鷹抓到','讓牠在晚上可以發光','讓牠可以飛得更高更遠'], a:0, why:'在花果繽紛的樹冠層,鮮豔的羽毛反而不突兀,也讓同伴好辨認。' },
          { q:'金剛鸚鵡現在面臨最大的威脅是什麼?', o:['雨林被砍伐、被抓當寵物','天上的雲太多擋住了太陽光','每天吃太多水果吃到肚子痛','冬天太冷,把牠們凍得生病'], a:0, why:'雨林被開墾讓牠們失去家園,非法捕捉買賣也讓野外數量變少。' },
          { q:'金剛鸚鵡吃完果實,會不小心幫雨林做什麼事?', o:['把種子帶到別處幫忙傳播','把雨林裡的河流變得很乾淨','把雨林裡的大樹全部變矮','讓雨林從此再也不會下雨'], a:0, why:'鸚鵡吃果實時把種子掉在別處,幫植物把下一代送到新地方。' },
          { q:'金剛鸚鵡大聲尖叫,通常是在做什麼?', o:['跟遠方的同伴聯絡','在練習參加唱歌比賽','因為牠肚子痛得受不了','在大聲呼叫雨趕快停'], a:0, why:'雨林很茂密看不遠,鸚鵡用很響亮的叫聲跟同伴保持聯絡、警告危險。' } ] },
      jaguar: { n:'美洲豹', e:'🐆', type:'atk', sz:70, b:{ hp:60, atk:12, def:3, spd:8 }, g:{ hp:6.0, atk:1.2, def:0.32, spd:0.34 },
        cmd:'skullbite', talent:'最強咬合力:目標體力低於 50% 時,自己造成的傷害 +40%', tal:{ lowHpAtkP:40 },
        get:{ how:'tame', zone:'jungle_swamp', p:12 }, food:'d_fish',
        sci:'美洲豹是美洲最大的貓科動物,咬合力在貓科裡數一數二,還很會游泳,常在河裡抓魚和凱門鱷。',
        quiz:[
          { q:'美洲豹是哪一個洲最大的貓科動物?', o:['美洲','非洲','亞洲','南極洲'], a:0, why:'美洲豹住在中南美洲,是美洲體型最大的貓科動物。' },
          { q:'美洲豹和大部分貓科動物不一樣,牠很喜歡做什麼?', o:['游泳和在水裡抓獵物','整天在沙漠裡曬太陽睡覺','爬到很高的高山雪地上','在深深的海底挖洞居住'], a:0, why:'大部分貓不愛水,美洲豹卻很會游泳,會在河裡抓魚、烏龜甚至凱門鱷。' },
          { q:'美洲豹身上的花紋是什麼樣子?', o:['玫瑰花般的斑點,中間有小點','一條一條直直的黑色條紋圖案','全身都是純白色、沒有任何花紋','身上有像彩虹一樣的七種顏色'], a:0, why:'美洲豹的斑點像一朵朵玫瑰,中間常有小黑點,這是和花豹不同的地方。' },
          { q:'美洲豹的花紋在雨林裡有什麼好處?', o:['跟樹葉間的光影融在一起','讓獵物比較容易就看到牠','讓牠在晚上可以一閃一閃發光','讓牠在雨林裡跑得比較快'], a:0, why:'斑點和雨林裡斑駁的光影很像,是很好的保護色,方便悄悄接近獵物。' },
          { q:'美洲豹的咬合力有多厲害?', o:['可以直接咬穿烏龜殼','軟到連香蕉都咬不動','跟一隻小貓咪差不多','牠其實完全沒有牙齒'], a:0, why:'美洲豹的咬合力在貓科動物中數一數二,能咬穿烏龜殼和鱷魚的頭骨。' },
          { q:'全身黑色的美洲豹叫什麼?', o:['黑豹','黑貓','黑熊','黑狼'], a:0, why:'有些美洲豹天生毛色特別黑,被叫做「黑豹」,仔細看還是看得到斑點。' },
          { q:'美洲豹通常是怎麼打獵的?', o:['偷偷埋伏再突然撲上去','跟一大群同伴一起追著跑','只吃樹上掉下來的水果','大聲吼叫,把獵物直接嚇死'], a:0, why:'美洲豹是獨居的伏擊型獵人,先悄悄靠近,再突然撲上去。' },
          { q:'美洲豹在雨林的食物鏈裡是什麼角色?', o:['頂級掠食者','植物生產者','落葉分解者','初級消費者'], a:0, why:'美洲豹幾乎沒有天敵,在食物鏈的最頂端,能控制草食動物的數量。' },
          { q:'美洲豹喜歡在一天的什麼時間活動?', o:['黃昏和夜晚','正中午太陽最大的時候','只在下雪的時候','完全不會活動'], a:0, why:'美洲豹多在黃昏到夜裡活動,眼睛在暗處也看得很清楚。' },
          { q:'保護美洲豹,也等於保護了什麼?', o:['整片雨林的生態系','只有保護美洲豹自己','遠方的大沙漠地帶','南極洲的冰原和冰山'], a:0, why:'頂級掠食者需要很大的地盤,保護牠的棲地,就保護了住在那裡的所有生物,這叫「傘護物種」。' } ] },
      puffin: { n:'海鸚', e:'🐦', type:'heal', sz:45, b:{ hp:58, atk:5, def:2, spd:8 }, g:{ hp:5.9, atk:0.45, def:0.32, spd:0.32 },
        cmd:'fishshare', talent:'分享漁獲:普通攻擊時恢復友方 HP 最低的隊友 12% 體力', tal:{ atkHealLowP:12 },
        get:{ how:'tame', zone:'storm_colony', p:16 }, food:'d_fish',
        sci:'海鸚的嘴巴裡有像倒鉤一樣的細刺,一次可以叼住十幾條小魚帶回巢裡餵寶寶;牠在水裡用翅膀「飛」著游泳。',
        quiz:[
          { q:'海鸚為什麼一次可以叼住十幾條小魚?', o:['舌頭和上顎有倒鉤般的細刺','因為牠的嘴巴裡面塗滿了黏膠','因為小魚會自己排好隊游進嘴','因為牠是用兩隻腳把魚抓住'], a:0, why:'海鸚用粗糙的舌頭壓住魚,上顎的細刺卡住魚,張嘴抓下一條時前面的也不會掉。' },
          { q:'海鸚的嘴巴為什麼被叫做「彩色的嘴」?', o:['繁殖季變得紅黃藍很鮮豔','因為牠每天都吃彩色的魚','因為牠會用嘴巴沾顏料畫畫','因為牠的嘴巴一整年都在變色'], a:0, why:'海鸚的嘴在繁殖季特別鮮豔,用來吸引伴侶,過了繁殖季顏色會變淡。' },
          { q:'海鸚在水裡是怎麼游泳的?', o:['拍動翅膀像在水裡飛','用尾巴左右擺動前進','用腳像青蛙一樣往後踢','用嘴巴吸水再噴出去前進'], a:0, why:'海鸚會拍動短短的翅膀在水裡「飛」,可以潛到幾十公尺深抓魚。' },
          { q:'海鸚的家通常在哪裡?', o:['海邊懸崖上的洞','高高的大樹頂端','炎熱的沙漠中間','河流的最最底部'], a:0, why:'海鸚在海邊懸崖的草坡上挖洞或利用岩縫築巢。' },
          { q:'海鸚一年中大部分時間待在哪裡?', o:['在海上漂浮和覓食','在森林裡面睡大覺','在熱鬧的城市裡面','在很高的高山上面'], a:0, why:'海鸚只有繁殖季才上岸,其他時間都在大海上生活。' },
          { q:'海鸚和企鵝很像,但最大的不同是什麼?', o:['海鸚會飛、企鵝不會飛','海鸚其實是住在南極的鳥','企鵝會飛,海鸚完全不會飛','海鸚其實根本沒有長翅膀'], a:0, why:'海鸚住在北半球、會飛也會潛水;企鵝住在南半球,翅膀變成鰭不會飛。' },
          { q:'海鸚寶寶長大離巢時,通常會在什麼時間出發?', o:['晚上,比較不會被海鷗抓','中午太陽最大最熱的時候','颱風剛好來的那一天晚上','永遠都不會離開自己的鳥巢'], a:0, why:'海鸚寶寶通常趁夜晚跑向海邊,躲開白天會攻擊牠們的海鷗。' },
          { q:'海鸚飛行時翅膀要拍得很快,為什麼?', o:['翅膀短,要快拍才飛得起來','因為牠每天都很急著趕回家','因為牠一邊飛一邊在跳舞給人看','因為牠在空中忙著趕走蒼蠅'], a:0, why:'海鸚的翅膀短,適合潛水,飛行時一秒要拍好幾百次才撐得住身體。' },
          { q:'海鸚主要吃什麼?', o:['玉筋魚等小魚','樹上的甜水果','森林裡的樹葉','草地上的昆蟲'], a:0, why:'海鸚主要吃細長的小魚,例如玉筋魚,再帶回巢餵寶寶。' },
          { q:'海裡的小魚變少,對海鸚會有什麼影響?', o:['寶寶吃不飽,存活變少','海鸚的數量反而會變更多','完全不會有任何的影響','海鸚會改成去吃岸上的草'], a:0, why:'過度捕撈和海水變暖讓小魚變少,海鸚寶寶就容易餓死,數量跟著下降。' } ] },
      tortoise: { n:'加拉巴哥象龜', e:'🐢', type:'tank', sz:70, b:{ hp:92, atk:4, def:6, spd:2 }, g:{ hp:8.5, atk:0.42, def:1.06, spd:0.12 },
        cmd:'shellfort', talent:'百年硬殼:自己受到的傷害固定減 50%', tal:{ cutP:50 },
        get:{ how:'tame', zone:'storm_moor', p:12 }, food:'cactus',
        sci:'加拉巴哥象龜可以活超過 100 歲,不同小島上的象龜殼形狀不一樣——達爾文就是看到這些差異,想出了「演化」的道理。',
        quiz:[
          { q:'加拉巴哥象龜大約可以活多久?', o:['超過 100 年','大約只有 1 年','大約只有 1 個月','大約只有 10 天'], a:0, why:'加拉巴哥象龜是最長壽的動物之一,常常活超過 100 歲。' },
          { q:'不同小島上的象龜殼形狀不一樣,主要是因為?', o:['適應各島不同的食物高度','因為小時候撞到石頭撞歪了','因為牠們的殼都是撿來的','殼的形狀其實是隨便長出來的'], a:0, why:'乾燥小島的象龜要伸長脖子吃高處的仙人掌,殼前緣就翹起來,像馬鞍一樣。' },
          { q:'誰看了加拉巴哥群島的象龜和雀鳥,想出了「演化論」?', o:['達爾文','牛頓爺爺','愛迪生先生','伽利略博士'], a:0, why:'達爾文在 1835 年來到加拉巴哥群島,觀察到生物會適應環境而改變,後來提出演化論。' },
          { q:'象龜可以很久不吃不喝,主要靠什麼?', o:['身體儲存了很多水分和脂肪','牠會像植物一樣行光合作用','牠會趁大家不注意偷吃石頭','牠一直睡覺,根本不需要能量'], a:0, why:'象龜新陳代謝很慢,體內能儲存大量水分和脂肪,好幾個月不吃東西也撐得住。' },
          { q:'象龜最喜歡吃什麼?', o:['仙人掌和青草','海裡的小魚兒','飛來飛去的昆蟲','別隻小小烏龜'], a:0, why:'象龜是草食動物,愛吃仙人掌、青草和樹葉。' },
          { q:'以前象龜數量變得很少,主要原因是什麼?', o:['被船員捕捉、外來動物吃蛋','因為那幾年的天氣實在太冷了','因為牠們吃得太多,吃到撐死','因為牠們全部都搬家到別處'], a:0, why:'以前航海的人把象龜抓上船當食物,老鼠、山羊等外來動物又吃蛋、搶食物,讓象龜差點滅絕。' },
          { q:'象龜遇到危險時會怎麼保護自己?', o:['把頭和腳縮進殼裡','展開翅膀飛到天上','轉身用很快的速度跑走','變成跟環境一樣的顏色'], a:0, why:'象龜的殼又厚又硬,縮進殼裡就像住在一座堡壘裡。' },
          { q:'象龜很喜歡泡在泥巴水坑裡,為什麼?', o:['降溫,也能防蚊蟲叮咬','想要好好洗個澡變乾淨','在泥巴水坑裡面找寶藏','在泥巴裡練習游泳比賽'], a:0, why:'泡泥巴能降溫,泥巴乾了還能擋住蚊子和扁蝨。' },
          { q:'烏龜的殼其實是身體的什麼部分?', o:['和肋骨、脊椎長在一起的骨','在海邊撿來、背在身上的石頭','像衣服一樣,可以隨時脫下來','其實是牠收起來的一對大翅膀'], a:0, why:'龜殼和肋骨、脊椎長在一起,是身體的一部分,烏龜不能把殼脫下來。' },
          { q:'現在科學家怎麼幫助象龜?', o:['人工孵蛋,再把小象龜放回島','把牠們全部抓去、關在動物園裡','把牠們住的小島全部填平蓋房子','教牠們學會在大海裡面游泳過海'], a:0, why:'保育人員收集象龜蛋人工孵化,等小象龜長大夠強壯再放回原本的島,數量慢慢回升。' } ] },
      albatross: { n:'信天翁', e:'🪶', type:'atk', sz:70, b:{ hp:58, atk:11, def:2, spd:9 }, g:{ hp:5.8, atk:1.15, def:0.3, spd:0.36 },
        cmd:'stormglide', talent:'動態翱翔:每回合開始自己攻擊力 +6%,最多疊加至 +30%', tal:{ atkStackP:6, atkStackCapP:30 },
        get:{ how:'tame', zone:'storm_wreck', p:12 }, food:'krill',
        sci:'漂泊信天翁的翅膀張開超過 3 公尺,是翼展最長的鳥;牠利用海面上的風「動態翱翔」,可以好幾個小時不拍翅膀。',
        quiz:[
          { q:'漂泊信天翁的翅膀張開大約有多長?', o:['超過 3 公尺','大約 30 公分','大約 1 公分','跟大象一樣長 30 公尺'], a:0, why:'漂泊信天翁的翼展超過 3 公尺,是現存翼展最長的鳥。' },
          { q:'信天翁能好幾個小時不拍翅膀一直飛,是利用什麼?', o:['海面上的風(動態翱翔)','翅膀裡面裝了小小的馬達','天上的雲會把牠輕輕托住','在天上一直憋氣就飄起來'], a:0, why:'信天翁利用海面附近風速的差別,一下迎風爬升、一下順風滑下,幾乎不用拍翅膀。' },
          { q:'信天翁一輩子大部分時間在哪裡?', o:['在大海上空飛行','在樹上呼呼大睡','在炎熱的沙漠裡','在小河的旁邊玩'], a:0, why:'信天翁可以在海上飛好幾年不落地,只有繁殖時才回到小島。' },
          { q:'信天翁的鼻孔有什麼特別的地方?', o:['像管子、能排出多餘的鹽','牠的鼻孔長在兩隻腳上面','牠其實完全沒有長出鼻孔','牠的鼻孔可以噴出大火焰'], a:0, why:'信天翁屬於「管鼻類」,鼻孔像管子,幫助聞氣味,也能把喝進海水多的鹽排出去。' },
          { q:'信天翁在海上是怎麼喝水的?', o:['直接喝海水,再把鹽排掉','只喝從天上掉下來的雨水','一輩子從來都不需要喝水','每天飛到很遠的河邊去喝水'], a:0, why:'信天翁眼睛上方有鹽腺,能把海水裡多的鹽濃縮排出,所以可以直接喝海水。' },
          { q:'信天翁的伴侶關係通常是怎樣?', o:['一輩子只跟同一個伴侶','每天都換一個新的伴侶','從來都不會去找任何伴侶','只跟南極的企鵝在一起'], a:0, why:'信天翁常和同一個伴侶在一起幾十年,還會跳求偶舞維持感情。' },
          { q:'信天翁最大的威脅之一是什麼?', o:['誤吞海上的塑膠垃圾','天空的顏色實在太藍了','海上的浪花實在太小了','海裡的魚實在太多了'], a:0, why:'信天翁會把漂在海上的塑膠誤當食物吞下,還會拿去餵寶寶,讓很多小鳥餓死。' },
          { q:'延繩釣漁船對信天翁有什麼危險?', o:['搶魚餌時可能被勾住淹死','漁船上的人會跟牠一起玩','漁船上的人會餵牠吃東西','對信天翁完全沒有任何危險'], a:0, why:'信天翁會俯衝去搶漁船的魚餌,被魚鉤勾住拖進海裡;現在漁船會加上驅鳥繩保護牠們。' },
          { q:'信天翁在陸地上走路的樣子是怎樣?', o:['搖搖擺擺,起飛要助跑','跑得比草原上的馬還要快','在地上都用雙腳一跳一跳','在陸地上完全不會走路'], a:0, why:'信天翁的翅膀太長,在陸地上很笨拙,起飛時要迎風助跑才飛得起來。' },
          { q:'信天翁主要吃什麼?', o:['烏賊、魚和磷蝦','樹上的甜甜水果','岸邊的嫩嫩青草','花朵裡的甜花蜜'], a:0, why:'信天翁在海面附近抓烏賊、魚和磷蝦,鼻子很靈,能聞到很遠的食物。' } ] },
      sailfish: { n:'雨傘旗魚', e:'🐟', type:'atk', sz:70, b:{ hp:58, atk:12, def:2, spd:11 }, g:{ hp:5.8, atk:1.2, def:0.28, spd:0.45 },
        cmd:'swordrush', talent:'劍嘴劈砍:普通攻擊為 2 次', tal:{ basicHits:2 },
        get:{ how:'tame', zone:'deep_reef', p:12 }, food:'fish',
        sci:'雨傘旗魚是游得最快的魚之一,衝刺時速可以超過 100 公里;牠用長長的劍嘴左右揮打魚群,把魚打暈再吃。',
        quiz:[
          { q:'雨傘旗魚背上那片大大的鰭,張開時像什麼?', o:['撐開的雨傘或船帆','一片小小的綠樹葉','一根細細長長的筷子','一顆圓圓滾滾的球'], a:0, why:'雨傘旗魚的背鰭又高又大,張開像船帆一樣,所以英文叫 sailfish(帆魚)。' },
          { q:'雨傘旗魚為什麼游得那麼快?', o:['身體像魚雷,減少水的阻力','因為牠在水裡面會長出翅膀','因為牠的尾巴可以往後噴火','因為牠的身體輕得像一根羽毛'], a:0, why:'流線型的身體能減少阻力,高速游泳時還會把背鰭收進背上的溝裡。' },
          { q:'雨傘旗魚的長嘴巴主要拿來做什麼?', o:['左右揮打魚群把魚打暈','用來挖開海底的那些沙子','用來從海面上吸水來喝','用來跟同伴揮手打招呼'], a:0, why:'牠衝進魚群用劍嘴左右揮打,把小魚打暈或打傷後再吃。' },
          { q:'雨傘旗魚興奮時,身體會怎樣?', o:['會變色,出現藍色條紋','身體會發出好聽的音樂','身體會變成完全透明的','身體兩邊會長出腳來走路'], a:0, why:'旗魚皮膚有特殊細胞,獵食時會快速變色,可能是在跟同伴溝通。' },
          { q:'雨傘旗魚為什麼常常一群一起獵食?', o:['把魚群趕成一團比較好抓','因為牠們很怕黑,不敢分開','因為牠們在一起比賽唱歌','因為牠們自己一隻不會游泳'], a:0, why:'旗魚會合作把沙丁魚群趕成「魚球」,再輪流衝進去獵食。' },
          { q:'台灣東部哪個地方以旗魚聞名?', o:['台東成功、花蓮一帶','台北市的熱鬧市中心','阿里山的最高山頂上','日月潭的湖水正中央'], a:0, why:'台灣東部海域有黑潮經過,台東成功漁港以傳統鏢旗魚聞名。' },
          { q:'流過台灣東部、帶來很多魚群的海流叫什麼?', o:['黑潮','白潮','紅潮','綠潮'], a:0, why:'黑潮是溫暖的洋流,帶來豐富的魚類,旗魚、鬼頭刀都會跟著來。' },
          { q:'流線型的形狀,人類還用在哪裡?', o:['高鐵、飛機和潛水艇','方方正正的大冰箱子','每天上課要用的課本','雨傘最最下面的傘柄'], a:0, why:'流線型能減少空氣或水的阻力,所以高鐵車頭、飛機、潛水艇都設計成流線型。' },
          { q:'雨傘旗魚的魚卵會怎樣?', o:['漂在海上,一次產很多','藏在海邊大樹的樹洞裡','埋在遠方沙漠的沙堆裡','媽媽一直咬在嘴巴裡孵'], a:0, why:'旗魚一次會產下幾百萬顆小魚卵,在海上漂浮孵化,只有少數能長大。' },
          { q:'為什麼要限制捕撈太小的旗魚?', o:['讓牠們長大繁殖,數量不會變少','因為小旗魚吃起來一點都不好吃','因為小旗魚會跳上漁船來咬人喔','因為小旗魚太重了,搬都搬不動'], a:0, why:'讓魚長大到能生下一代再捕,魚的數量才能持續,這叫「永續漁業」。' } ] },
      seaotter: { n:'海獺', e:'🦦', type:'heal', sz:50, b:{ hp:58, atk:5, def:2, spd:7 }, g:{ hp:5.9, atk:0.45, def:0.33, spd:0.3 },
        cmd:'handhold', talent:'石頭敲貝:每回合自動恢復全隊 HP 最少的那一位 10% 體力', tal:{ healLowP:10 },
        get:{ how:'tame', zone:'deep_kelp', p:14 }, food:'urchin',
        sci:'海獺會躺在海面上,把石頭放在肚子上敲開貝殼和海膽吃,是少數會用工具的動物;睡覺時會手牽手,免得漂走。',
        quiz:[
          { q:'海獺怎麼吃硬硬的貝殼?', o:['石頭放肚子上敲開貝殼','用尾巴把貝殼甩到石頭上','把貝殼直接整顆吞下去','請別的動物幫忙打開來'], a:0, why:'海獺仰躺在水面,把石頭當砧板放在肚子上敲貝殼,是少數會用工具的動物。' },
          { q:'海獺睡覺時為什麼會手牽手?', o:['免得睡著時被浪沖散','因為牠們在水上跳舞','因為牠們的手很冰冷','因為牠們在比賽拔河'], a:0, why:'海獺睡在海上,手牽手或用巨藻纏住身體,就不會漂走。' },
          { q:'海獺沒有厚脂肪,怎麼在冷海水裡保暖?', o:['非常濃密的毛,鎖住空氣','一直游泳讓身體自己發熱','每天晚上躲進海底溫泉裡','穿上漁夫送牠的毛衣保暖'], a:0, why:'海獺的毛是動物裡最濃密的,一平方公分有十幾萬根,毛裡鎖住空氣當保暖層。' },
          { q:'海獺為什麼每天要花很多時間整理毛?', o:['毛裡要有空氣,才能保暖防水','為了變漂亮,要去參加選美比賽','因為毛會自己打結,讓牠生病','因為牠實在太無聊,沒事可以做'], a:0, why:'毛髒了或打結就鎖不住空氣,海獺會失溫,所以要常常梳理、吹氣進毛裡。' },
          { q:'海獺吃海膽,對巨藻森林有什麼好處?', o:['海膽變少,巨藻不被吃光','讓巨藻長得越來越矮小了','讓附近的海水變得更加鹹','跟巨藻森林完全沒有關係'], a:0, why:'海膽吃巨藻,海獺吃海膽;有海獺在,海膽不會太多,巨藻森林就能維持,所以海獺被稱為「關鍵物種」。' },
          { q:'海獺和營地商店的阿獺(歐亞水獺)有什麼不同?', o:['海獺住海裡、水獺住溪流','兩種其實是同一種動物喔','海獺住在炎熱的沙漠裡面','歐亞水獺會在天上飛來飛去'], a:0, why:'海獺住在北太平洋的海上;歐亞水獺住在溪流湖泊,金門還有野生族群——都是鼬科但不同種。' },
          { q:'海獺的腋下有一個「口袋」,用來裝什麼?', o:['撿到的食物和石頭','牠自己剛出生的寶寶','從天上接下來的雨水','備用的一套小衣服'], a:0, why:'海獺腋下有鬆鬆的皮膚像口袋,可以放食物和常用的石頭工具。' },
          { q:'海獺媽媽怎麼照顧寶寶?', o:['讓寶寶趴在肚子上漂浮','把寶寶放在岸邊的樹上','把寶寶埋在海邊的沙裡','讓寶寶自己在海裡面游'], a:0, why:'海獺寶寶的毛很蓬鬆會浮起來,媽媽讓牠趴在肚子上,一邊漂一邊餵奶。' },
          { q:'以前海獺數量變得很少,主要是因為?', o:['毛皮很珍貴,被大量捕捉','因為牠們吃得太多吃到撐','因為那幾年的天氣太熱了','因為牠們全部搬家到別處了'], a:0, why:'海獺毛皮又暖又軟,以前被大量獵捕差點滅絕,現在受到保護才慢慢回升。' },
          { q:'海獺漂在海上時,喜歡用什麼纏住身體?', o:['巨藻','漁網','繩子','塑膠袋'], a:0, why:'海獺會用巨藻把自己纏住,像繫安全帶一樣,睡覺時就不會漂走。' } ] },
      isopod: { n:'大王具足蟲', e:'🛡', type:'tank', sz:55, b:{ hp:90, atk:4, def:6, spd:2 }, g:{ hp:8.4, atk:0.42, def:1.05, spd:0.12 },
        cmd:'armorcurl', talent:'深海節能:自己受到的傷害固定減 40%,且每回合自動恢復自己 10% 最大體力', tal:{ cutP:40, selfRegenP:10 },
        get:{ how:'tame', zone:'deep_abyss', p:12 }, food:'fish',
        sci:'大王具足蟲住在幾百公尺深的海底,是潮蟲(鼠婦)的親戚,體長可達 50 公分;牠新陳代謝很慢,可以好幾年不吃東西。',
        quiz:[
          { q:'大王具足蟲是哪一種小動物的親戚?', o:['潮蟲(西瓜蟲)','花園裡的蝴蝶','土裡面的蚯蚓','葉子上的蝸牛'], a:0, why:'大王具足蟲和花園裡的潮蟲都屬於等足類,只是牠大很多,可以長到 50 公分。' },
          { q:'大王具足蟲為什麼可以很久不吃東西?', o:['新陳代謝很慢,很省能量','因為牠會像植物一樣光合作用','因為牠常常趁大家睡覺偷吃','因為牠完全不需要任何能量'], a:0, why:'深海又冷又缺食物,大王具足蟲新陳代謝很慢,吃一次大餐能撐很久,有隻在水族館好幾年沒吃東西。' },
          { q:'大王具足蟲遇到危險會怎麼做?', o:['把身體捲成一顆球','從嘴巴噴出黑色墨汁','發出很大很大的叫聲','用力跳出海面逃走'], a:0, why:'牠和西瓜蟲一樣,遇到危險會把身體捲起來,用硬殼保護柔軟的肚子。' },
          { q:'大王具足蟲在深海裡主要吃什麼?', o:['沉到海底的死魚和鯨魚','海底長出來的那些水草','海底那些還活著的珊瑚','從海面上照下來的陽光'], a:0, why:'大王具足蟲是深海的「清道夫」,吃從上面沉下來的動物屍體,幫海底保持乾淨。' },
          { q:'大王具足蟲的大眼睛有什麼用?', o:['在微弱的光線下看東西','用來在黑暗裡發出亮光','用來嚇跑游過來的大魚','用來聽四周傳來的聲音'], a:0, why:'深海光線很少,大大的複眼能收集微弱的光。' },
          { q:'為什麼深海生物常常長得比淺海的親戚大很多?', o:['又冷又缺氧,長得慢活得久','因為深海的食物比淺海多很多','因為深海的海水其實特別熱','因為深海每天都照得到陽光'], a:0, why:'這叫「深海巨大症」:低溫讓生物長得慢、活得久,體型就可能變得特別大。' },
          { q:'大王具足蟲的殼是什麼構造?', o:['一節一節的外骨骼','跟烏龜一樣的骨頭','用毛髮編起來做的','用海底沙子黏起來的'], a:0, why:'牠和昆蟲、螃蟹一樣有外骨骼,一節一節的,長大時要脫殼。' },
          { q:'鯨魚死後沉到海底,會變成什麼?', o:['深海生物的大餐「鯨落」','慢慢長成一座新的大島嶼','變成一塊石頭,馬上就消失了','浮回海面上,被太陽曬乾了'], a:0, why:'一頭鯨魚沉到海底,能讓大王具足蟲、盲鰻等深海生物吃上好幾年,叫做「鯨落」。' },
          { q:'深海的水壓很大,大王具足蟲為什麼沒有被壓扁?', o:['身體充滿液體,內外壓力平衡','因為牠的殼是用鐵打造出來的','因為牠很會躲在大石頭的底下','因為牠會游到海面上再飛走喔'], a:0, why:'深海生物身體裡大多是液體,沒有充氣的空腔,內外壓力差不多,所以不會被壓扁。' },
          { q:'大王具足蟲有幾對腳?', o:['七對','一對','五十對','沒有腳'], a:0, why:'等足類有七對差不多長的腳,所以叫「等足」。' } ] }
    }, k, st = ['idle','atk','hit','stun','down','skill'], j, p;
    for(k in P){ if(!P.hasOwnProperty(k)) continue;
      p = P[k]; p.sea = true;
      p.joinLv = D.SEA.joinLv[D.seaZone(p.get.zone).isle];
      D.PETS[k] = p;
      if(D.PET_ORDER.indexOf(k) < 0) D.PET_ORDER.push(k);
      for(j = 0; j < st.length; j++) D.IMG['bt_pet_' + k + '_' + st[j]] = 'island_bt_pet_' + k + '_' + st[j] + '.png';
      D.IMG['bt_pet_' + k + '_walk'] = 'island_pet_' + k + '_walk.png'; D.IMG['bt_pet_' + k + '_sleep'] = 'island_pet_' + k + '_sleep.png';
      D.CODEX.push({ id:k, cat:'animal', n:p.n, e:p.e, img:'bt_pet_' + k + '_idle', where:D.seaIsle(D.seaZone(p.get.zone).isle).n + '・' + D.seaZone(p.get.zone).n + '(夥伴)', d:p.sci });
    }
  })();

  /* ── 圖鑑:外島資源點、觀察點、料理、科技 ── */
  (function(){
    var k, n, o, i, where = {}, id, sc, sk;
    for(id in D.SCENE){ if(!D.SCENE.hasOwnProperty(id) || !D.SCENE[id].sea) continue; sc = D.SCENE[id];
      for(sk in sc.spawn){ if(sc.spawn.hasOwnProperty(sk)){ where[sk] = where[sk] || []; if(where[sk].indexOf(D.seaZone(id).n) < 0) where[sk].push(D.seaZone(id).n); } }
      for(i = 0; i < sc.obs.length; i++){ where[sc.obs[i].k] = where[sc.obs[i].k] || []; where[sc.obs[i].k].push(D.seaZone(id).n); }
    }
    for(k in D.SEA_NODES){ if(!D.SEA_NODES.hasOwnProperty(k)) continue; n = D.SEA_NODES[k];
      D.CODEX.push({ id:k, cat:n.cat, n:n.label.replace(/[（(].*$/, ''), e:n.e, img:'node_' + k, where:(where[k] || []).join('/') || '外島', d:n.d, sea:true });
    }
    for(k in D.SEA_OBS){ if(!D.SEA_OBS.hasOwnProperty(k)) continue; o = D.SEA_OBS[k];
      D.CODEX.push({ id:k, cat:o.cat, n:o.n, e:o.e, img:'obs_' + k, where:((where[k] || []).join('/') || '外島') + '(🔭 觀察)', d:o.d, sea:true });
    }
    for(i = 0; i < D.RECIPES.length; i++){ if(!D.RECIPES[i].sea) continue;
      D.CODEX.push({ id:D.RECIPES[i].id, cat:'dish', n:D.RECIPES[i].n, e:D.RECIPES[i].e, img:'res_' + D.RECIPES[i].id, where:'營地烹飪', d:D.RECIPES[i].why, sea:true });
    }
    D.CODEX.push({ id:'divehelmet', cat:'tech', n:'潛水頭盔', e:'🤿', img:'tech_divehelmet', where:'科技研究', d:'把空氣加壓送進頭盔,人就能在水底呼吸——水越深壓力越大,空氣要加壓才吸得進肺裡。', sea:true });
  })();
  D.LOG.unshift({ v: 'v1.368.0', d: '2026-10-01', items: [
    '⛵ 出海探險準備中(目前只開放老師測試):完成終章後,大地圖可以左右翻頁,搭帆船去四座外島——冰天雪地島、熱帶雨林島、狂風暴雨島、海底洞穴。',
    '⭐ 冒險等級、夥伴等級、四維能力上限從 50 提高到 70(51 級以後要到外島才練得上去)。'
  ] });
  D.LOG.unshift({ v: 'v1.369.0', d: '2026-10-04', items: [
    '🪨 鳥糞石可以當肥料了:營地農田「🪨 全部施肥」,每塊生長中的田用 1 顆,收成 +1(鳥糞含磷和氮,是天然肥料)。',
    '⚔ 外島每座島的第 3~5 區,遇到的魔物固定一次 4 隻,記得帶齊夥伴再深入。'
  ] });
  D.LOG.unshift({ v: 'v1.370.0', d: '2026-10-04', items: [
    '🗺 外島 20 區換上正式場景圖:岩石、樹林、冰崖、珊瑚都會擋路,沙地、雪地、步道、吊橋可以走;翻頁地圖上的區域標記也對準了圖上的地點。',
    '🚶 走路更順:點地板走路會自動繞開水邊,不會再卡在水邊原地踏步;萬一被卡住,角色會自動回到最近能走的地方。'
  ] });
  /* ═════════════════════════════════════════════════════════════════
   * ★ v1.370.0(2026-10-04・老師「359 張新圖已上傳,重建可走區域,確保主角移動不會被卡死」)
   *   外島 20 區遮罩改用老師的真場景圖逐像素重建,取代上面 D.seaMask 的程序暫代版(暫代版保留當退路:尺寸對不上就不覆寫)。
   *   做法:每區手選地面/障礙/水域樣本格 → 像素分類(顏色+亮度+紋理)→ 每格算腳下地面佔比 → 逐區疊回場景圖目視修補 →
   *   以 spawn0 為起點 BFS,走不到的可走格一律封掉(藤蔓口袋例外,砍開藤蔓才進得去)。
   *   . 可走 / # 障礙 / ~ 水域 / v 藤蔓(雨林底層、千年巨木:對齊場景圖上畫的綠色藤簾下緣,口袋在藤簾後面)。
   *   s = 入口 spawn0、e = 出口;v/vb = 藤蔓互動點/藤蔓口袋範圍。資源點/補給點/觀察點/解謎點由 index 端 islSnapCell 執行期吸附,不必逐點搬。
   *   ⚠ 改遮罩後一定要重跑「全部固定點 BFS 可達」檢查(見荒島 handoff v1.370.0)。
   * ═════════════════════════════════════════════════════════════════ */
  (function(){
    var M = {
      ice_coast: { s:[1,10], e:[30,11], m:[
        '~~~######################~~#####',
        '~~~######..#####################',
        '~~~~#####...####...#############',
        '~~~~~~#####..###....############',
        '~~~~~~#####....#....############',
        '~~~~######.##.......############',
        '~~~~######..#....##....#########',
        '~###.#####.......##..#....#.####',
        '#.....###........##..##.....####',
        '#...................###........#',
        '...............................#',
        '###.............................',
        '####..........................##',
        '~~~###..##...................##~',
        '~~~~###...###........##.....###~',
        '~~~~~#########.....#####...##~~~',
        '~~~~~~~~~#######.############~~~',
        '~~~~~~~~~~~~~~##############~~~~',
        '~~~~~~~~~~~~~~~###~~##~~~~###~~~',
        '~~~~~~~~~~~~~~~~~~~~~~~~~###~~~~',
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
      ] },
      ice_taiga: { s:[1,10], e:[30,11], m:[
        '################################',
        '#################.##############',
        '################...#############',
        '################...#############',
        '#######..########..#############',
        '#######......####...############',
        '#..#####......#......###########',
        '#..#######.......##.....######.#',
        '#..######..##....###....######.#',
        '#...###....##....####.....###..#',
        '...........####...#............#',
        '##..........####................',
        '##............................##',
        '###..................#.####.####',
        '####...#...............####..###',
        '########..........##........####',
        '###########.................####',
        '###########..##........#.##.####',
        '#########...####......##########',
        '###########.#####..#..##########',
        '#################.##############',
        '################################',
        '################################',
        '################################'
      ] },
      ice_tundra: { s:[1,12], e:[30,12], m:[
        '################################',
        '########~~~~####################',
        '########~~~~#############~~#####',
        '#######~~~~~############~~~~####',
        '####~~~~~~~~###########~~#######',
        '#####~~~####..#.################',
        '####..##.###.....############.##',
        '#####.............#.#########..#',
        '#.####.....##.###......####....#',
        '#..###.....###..##....#....#...#',
        '#...........###.......#........#',
        '#..............................#',
        '................................',
        '#...###........................#',
        '###.####....................####',
        '##..#####.#...............######',
        '######~#######...##...##########',
        '###~~~~~~######...~##.##########',
        '###~~~~~~~#####.################',
        '####~~~~~~~############~~~~~####',
        '######~~~#~~##########~~~~~~####',
        '#########################~~#####',
        '################################',
        '################################'
      ] },
      ice_glacier: { s:[1,12], e:[30,12], m:[
        '################################',
        '################################',
        '################################',
        '################################',
        '################################',
        '################################',
        '#########################..#####',
        '#########.##.....########...####',
        '#####......#.......###......####',
        '####......##................####',
        '##.......###.........#.......###',
        '#...................###........#',
        '...................####.........',
        '####..........................##',
        '#####.##....................####',
        '##########..................####',
        '###########...........##..######',
        '###############.......##########',
        '#################...############',
        '################################',
        '################################',
        '################################',
        '################################',
        '################################'
      ] },
      ice_peak: { s:[1,12], e:[30,12], m:[
        '################################',
        '################################',
        '################################',
        '################################',
        '################################',
        '####################..##########',
        '########...#####.......#########',
        '####.......#...............#####',
        '###..#....................#..###',
        '###..#........................##',
        '#.............................##',
        '#..............................#',
        '................................',
        '#..............................#',
        '###...........................##',
        '##............................##',
        '##..#........................###',
        '###....##................#..####',
        '####.####.................######',
        '############.......##.#..#######',
        '###############....#####.#######',
        '################.....###########',
        '#################....###########',
        '################################'
      ] },
      jungle_mangrove: { s:[1,12], e:[30,12], m:[
        '#####~~~~~###############~~~####',
        '#####~~~~~~###############~~~###',
        '######~~~~~##############~~~~###',
        '#######~~~~##############~~~~~##',
        '#######~~~~~#~###~~~#####~~~~~~~',
        '#######~~~~~~######~##~~~~~~~~~~',
        '~#####~~~~~~~~~~~..#~~~~~~~~~##~',
        '#####~~.#~~~~~......~~~~~~~~~###',
        '###~~##...............~.~~######',
        '#....##..................~.~#..#',
        '#..............................#',
        '#..............................#',
        '................................',
        '#..............................#',
        '####........................~~~~',
        '#####..~.~~~~.............~~~~~~',
        '#####~~~~~~~######.......~##~~~~',
        '##~~~~~~~~~########~#~..~####~~~',
        '####~~~~~~~##########~~~~~~~####',
        '####~~~~#~~~#########~~~~~~~####',
        '#####~~~~~~~#########~~~~#######',
        '######~~~~~~##########~~~#######',
        '#########~############~~~#######',
        '##############~~######~~~#######'
      ] },
      jungle_floor: { s:[1,12], e:[30,12], v:[17,4], vb:[16,1,19,2], m:[
        '################################',
        '################....############',
        '################....############',
        '################vvvv############',
        '################....############',
        '################....############',
        '################....############',
        '##############.......###########',
        '#######.###..........###########',
        '#.........................####.#',
        '#..............................#',
        '#..............................#',
        '................................',
        '###.#........................###',
        '######......................####',
        '#######...............#....#####',
        '############.........###.#######',
        '##############......############',
        '###############......###########',
        '###################.############',
        '################################',
        '################################',
        '################################',
        '################################'
      ] },
      jungle_canopy: { s:[1,12], e:[30,12], m:[
        '################################',
        '################################',
        '######...################.....##',
        '#####.....##############......##',
        '#######.#...###########.......##',
        '##########....########...#######',
        '############....####...#########',
        '##############....##..##########',
        '###############...#...##########',
        '##############...##....#########',
        '#.................#............#',
        '#..............................#',
        '...###.#...#.............#.#....',
        '################.....###########',
        '##################...###########',
        '###################..###########',
        '###################...##########',
        '####################....########',
        '####################....########',
        '####################....########',
        '#####################..#########',
        '################################',
        '################################',
        '################################'
      ] },
      jungle_swamp: { s:[1,11], e:[30,11], m:[
        '######~##~~~~~~~#########~~~~~~~',
        '#######~~~~~~~~~#####~##~~~~~~~#',
        '########~~~~~~~######~~~~~~~~~~~',
        '#########~~~~~#######~~~~~~~~~~~',
        '########~~~~~~#########~~~~~~~~#',
        '########~~#~~~~~~~~###~~~~~~~###',
        '~~~~#####~~~~#~~~~~~~~~~~~~#####',
        '~~~~~##~~...~##~~~~#~~~~~#######',
        '#~~~~~~~.......#~~~~~~~~~##~####',
        '#...~~~..........~..~.#..######~',
        '#..............................#',
        '................................',
        '###..........................###',
        '###....#...................#####',
        '#####~~~...................#####',
        '######~~####~~~~~.......~~~#####',
        '######~####~~~~~~~~~#####~~~####',
        '####~~~#####~~~~~~~#############',
        '~~~~~~#######~~~~~~~~###########',
        '~~~~~~~####~~~~~~~~~~~~#~#######',
        '~~~~~~~~~~~~~~#####~~~~~~~######',
        '~~~~~~~~~~~~~~######~~~~~~~#####',
        '~~~#~~~~~~#~#########~~~~~~~~~##',
        '###~~~~~~#############~~~~~~~~~~'
      ] },
      jungle_giant: { s:[1,12], e:[30,12], v:[17,7], vb:[15,4,19,5], m:[
        '################################',
        '################################',
        '################################',
        '################################',
        '###############.....############',
        '###############.....############',
        '###############vvvvv############',
        '################...#############',
        '################....############',
        '#####..#########....############',
        '#......######........###########',
        '#...........................##.#',
        '................................',
        '#..............................#',
        '###............................#',
        '######........................##',
        '########.....................###',
        '########.........##.........####',
        '###########.....#####....#######',
        '############...#################',
        '############...#################',
        '################################',
        '################################',
        '################################'
      ] },
      storm_reef: { s:[1,11], e:[30,11], m:[
        '#############~~~~#~~~~~~~~~~~~~~',
        '################~#~##~~~~~~~~~~~',
        '#################~~~#~~###~~~~~~',
        '#################~~~~~~~##~~~~~~',
        '#...###################~~~~~~~~~',
        '##....###########~###~~#####~~~~',
        '###.....##########~##~~#######~#',
        '####.......#########~~~########~',
        '####.......#.....~..~###########',
        '~~##...................######..#',
        '~~.....................#.......#',
        '................................',
        '###...##......................##',
        '############..#####.........#.##',
        '###########~.######..........###',
        '########~~~~~~~#####.##..#....##',
        '~~~~~###~~~~~~~~~~~~#########~##',
        '~~~~~#~~~#~~~~~~~~~~~#########~#',
        '~~~~~~~~~~~~~~~~~~~~~~##~##~~#~~',
        '~~~~~~~~~~~~~~~~~~~~#~~~###~~~~~',
        '~~~~~~~~~~~~~~#~~~~~~~~####~~~~~',
        '~~~~~~~~~~~~~~###~~~~~~~##~~~~~~',
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
      ] },
      storm_colony: { s:[1,10], e:[30,10], m:[
        '###########################~~~~~',
        '###########################~~~~~',
        '##############################~~',
        '################################',
        '#################...############',
        '#######..########.....##########',
        '######.........#.......#########',
        '#~#####.................########',
        '#~######.................######~',
        '#..###.....................###.#',
        '................................',
        '##............................##',
        '###.........................####',
        '#####.##.......##.......########',
        '~~#######..............#######~#',
        '~~#############..##.....#######~',
        '~###################..#######~~~',
        '#~#############################~',
        '~~~######################~~~####',
        '~~~~~~###################~~~####',
        '~~~~~~~~##~############~~~#~####',
        '~~~~~~~#~~~~~~#########~~~#~~###',
        '~~~~~~~#~###~~~~~#~###~~~~~~~###',
        '~~~~~~~###~~~~~~~~~~~~~~~~~~~###'
      ] },
      storm_moor: { s:[1,12], e:[30,12], m:[
        '################################',
        '################################',
        '################################',
        '################################',
        '################################',
        '################################',
        '#.###########......#############',
        '#...#######........#############',
        '#.....#####.......##.##..#####.#',
        '###......##....................#',
        '#.............................##',
        '#..............................#',
        '................................',
        '##........##..................##',
        '###.......##.....##...........##',
        '####.....#####...##.####.....###',
        '##############.##...#######..###',
        '##################.#######..####',
        '################################',
        '################################',
        '################################',
        '################################',
        '################################',
        '################################'
      ] },
      storm_wreck: { s:[1,11], e:[30,12], m:[
        '#####################~~~~~~~##~~',
        '#####################~~~~~~##~~~',
        '########################~~~##~~~',
        '###########~~###############~#~~',
        '###########~~~################~~',
        '###########~~~.##############~~~',
        '#...######.......#############~~',
        '##...#.............#############',
        '###................##########~~~',
        '###....................#~~##~~~#',
        '#........................~~~~###',
        '..........................~~####',
        '####........................#...',
        '#####~~~~......................#',
        '#####~~##~~~~...............####',
        '##~###~#~~~~~~~~~.~~~.....#.####',
        '~~######~##~~~~~~~~~~~......####',
        '##~########~~~~~~~~~~~~##...####',
        '###~#######~~~~~~~~~~~####~~####',
        '#############~~~~~~~~~~~~#######',
        '#######~~###~##~~~~~~~~~~#######',
        '#########~~~~~#~~~~~~~~~~~~#####',
        '############~~~~~~~~~~~~~~~~~~~~',
        '###############~~~~~~~~~~~~~~~~~'
      ] },
      storm_eye: { s:[1,11], e:[30,11], m:[
        '################################',
        '################################',
        '################################',
        '################################',
        '###########..........###########',
        '########...............#########',
        '#######..................#######',
        '#####.....................######',
        '#####......................#####',
        '####........................####',
        '#..............................#',
        '................................',
        '###..........................###',
        '#####.......................####',
        '#####......................#####',
        '######....................######',
        '#######..................#######',
        '##########.............#########',
        '############.........###########',
        '################...#############',
        '################################',
        '################################',
        '################################',
        '################################'
      ] },
      deep_reef: { s:[1,24], e:[62,24], m:[
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '##############################################....##############',
        '##########################################.........#############',
        '################......#####################.........############',
        '###############.......######################.........###########',
        '############..............##################..........##########',
        '############...............############.#.............##########',
        '############................#########.................##########',
        '############................#########................###########',
        '#############.............###########.................##########',
        '#############............############.................##########',
        '#############............###########.................###########',
        '##########...#...........##########..............###############',
        '#.#######....#..........########......................##########',
        '#....#.....................###........................#..####..#',
        '#...........................##...........................##....#',
        '#..............................................................#',
        '#..............................................................#',
        '................................................................',
        '#..............................................................#',
        '#..............................................................#',
        '#.....##..............................##...............##.##...#',
        '##########..........................####.............###########',
        '############..................#########............#############',
        '#############................#########.............#############',
        '###########.................#########...............############',
        '############................##########................##########',
        '#################.........#############...............##########',
        '#################........###############.............###########',
        '##################....#####################......##.############',
        '##############################################.#################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################'
      ] },
      deep_kelp: { s:[1,24], e:[62,24], m:[
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '#################################.##############################',
        '################################.....###########################',
        '###############################.........########################',
        '###############################...........######################',
        '################################..........######################',
        '################################.........#########.#############',
        '#########################.###...........##########....##########',
        '########################................##########......########',
        '########################................##########......########',
        '#####..#######.....#######................#######.......########',
        '######...###.......########...............#####............#####',
        '######...........###########..............##.#.............#####',
        '####...............###########..............................####',
        '##..................##########.................................#',
        '#.....................#######.#................................#',
        '#.......................###....................................#',
        '#.....................................#........................#',
        '.....................................##.........................',
        '###..#...................#............###...................#..#',
        '#########...............#####..............................#####',
        '##########.............#####...............#...............#####',
        '########..............######...............###............######',
        '###########...........######...............#####.......#########',
        '###########...........####.................#####.......#########',
        '##############......#####..................#####.....###########',
        '##############.....#####....#............#######################',
        '###############....#####.#####.##........#######################',
        '###############...################......########################',
        '###################################....#########################',
        '###################################.....########################',
        '####################################.##.########################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################'
      ] },
      deep_wreck: { s:[1,24], e:[62,24], m:[
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '###################################.############################',
        '#################################...############################',
        '#################################......#########################',
        '#################################......#########################',
        '#################################......#########################',
        '####################################......######################',
        '#####.############################..........####################',
        '####...#########################.............###################',
        '####.........###################..............#######...########',
        '#####........###################................####.....#######',
        '#####..........##################........................#######',
        '#####............##..#############.............##........#######',
        '#####............##...#####...####.............##.......########',
        '#####..#................##......#####........###........########',
        '#########.....................##.####.........##..........######',
        '#.....###.....................##....#.........#................#',
        '#..............................................................#',
        '................................................................',
        '#..............................................................#',
        '#..............................................................#',
        '####........######...##..................................#######',
        '#####.#....######........................................#######',
        '###############.......................................#..#######',
        '###############.............#...##..........##..........########',
        '##############..............#######.......###...........########',
        '##############..............########.....#................######',
        '#############................#######......................######',
        '############..................#######.....................######',
        '############.................##########....................#####',
        '#############................##########.....................####',
        '################...........##############...............#..#####',
        '###################........###############..............########',
        '####################...#..#################............#########',
        '#####################..######################.........##########',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################'
      ] },
      deep_abyss: { s:[1,23], e:[62,24], m:[
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '###############..###############################################',
        '#############.....##############################################',
        '###########..........###########################.###############',
        '##########...........######################.......##############',
        '############..........###################...........############',
        '###########............##################...........############',
        '##########...............##############................#########',
        '########..................#############................#########',
        '########.................#############.................#########',
        '########.......................##.###..................#########',
        '########.................##...........##.............###########',
        '########.................###........####............############',
        '########.##.............####.........####...........##########.#',
        '#....######...........................##............#########..#',
        '#.......##............................................#.##.#...#',
        '#..............................................................#',
        '#..............................................................#',
        '#..............................................................#',
        '...............................................................#',
        '######..............#...........................................',
        '######.......................................................###',
        '######.................###..............................###..###',
        '##########..............................##.............#########',
        '##########...........................................###########',
        '#########................#............................##########',
        '#########................###.......#...................#########',
        '##########...............####.#...###..................#########',
        '##########...............##############................#########',
        '#############............##############...............##########',
        '#############..........#################...............#########',
        '##############......######################.............#########',
        '################....#######################.........#.##########',
        '################.###########################.......#############',
        '###############################################....#############',
        '#################################################.##############',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################'
      ] },
      deep_vent: { s:[1,24], e:[62,24], m:[
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################..##############################',
        '#############....###############.....###########################',
        '############.....###############..........######################',
        '############...........#########..........######################',
        '############..............#######...........####################',
        '############.###............######.............#################',
        '##########...##.............######..............################',
        '##########...................####....................###########',
        '###..#####...................###....................############',
        '###......###..................##.................#.#############',
        '####...........................#...................#############',
        '####...............................................##.....######',
        '#####..........##.........................................######',
        '#######................................................##..#####',
        '#.....#................................................##......#',
        '#..............................................................#',
        '................................................................',
        '##............................................................##',
        '####.........................................................###',
        '#####.#...................................................######',
        '#########.........................##...............#.......#####',
        '########......................#...##...............###......####',
        '########...#.................###.###................##......####',
        '#########..#.................#######.#..............##......####',
        '##############...............######..#.............#####..######',
        '################.......#....##########.............####..#######',
        '#################......#...###########...............##.########',
        '#################.........############..................########',
        '################..........############.................#########',
        '################......##...###############............##########',
        '################.....####....#################.#...#.###########',
        '#########################....####################.##############',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################',
        '################################################################'
      ] }
    }, id, sc, z, k, sp, i, ob, nb, p;
    /* 觀察點/補給點只有一個候選點,吸附半徑(index 端 8 格)內若全是岩石,這個點整個會消失(深海珊瑚礁的鸚哥魚觀察點、熱泉巨穴唯一的管蟲觀察點就是這樣)。
       ⇒ 資料層先把它們移到全圖最近的可走格(避開藤蔓口袋),index 端吸附就一定原地成立。 */
    function near(m, pt, vb){
      var x, y, d, best = null, bd = 1e9;
      if(m[pt.y] && m[pt.y].charAt(pt.x) === '.' && !(vb && pt.x >= vb.x0 && pt.x <= vb.x1 && pt.y >= vb.y0 && pt.y <= vb.y1)) return pt;
      for(y = 1; y < m.length - 1; y++){
        for(x = 1; x < m[y].length - 1; x++){
          if(m[y].charAt(x) !== '.' || (vb && x >= vb.x0 && x <= vb.x1 && y >= vb.y0 && y <= vb.y1)) continue;
          d = (x - pt.x) * (x - pt.x) + (y - pt.y) * (y - pt.y);
          if(d < bd){ bd = d; best = { x: x, y: y }; }
        }
      }
      return best || pt;
    }
    /* 翻頁地圖上的區域標記(%,2048×1536 底圖)對齊老師的 4 張全景圖:原本是憑設計書文字估的位置,
       有幾個落在海上或別區的地景上(冰河標在雪地、海鳥崖/破浪礁岸標在海裡、巨藻森林標在沉船上)。
       冰雪島:黑礫海岸→針葉林→灌叢水窪帶→藍冰洞→山頂;雨林島:紅樹林小島→林間步道→樹梢吊橋→左側王蓮沼澤→千年巨木;
       風暴島:黑色礁岩浪區→左側海鳥斷崖→左上石林→燈塔沉船灣→中央風暴之眼;海底:上層珊瑚→左側巨藻→沉船→發光深淵→熱泉。 */
    var MP = {
      ice_coast: [50, 80], ice_taiga: [40, 57], ice_tundra: [62, 42], ice_glacier: [71, 24], ice_peak: [54, 10],
      jungle_mangrove: [62, 75], jungle_floor: [45, 52], jungle_canopy: [72, 18], jungle_swamp: [18, 45], jungle_giant: [52, 18],
      storm_reef: [46, 72], storm_colony: [17, 42], storm_moor: [28, 22], storm_wreck: [80, 43], storm_eye: [52, 37],
      deep_reef: [30, 14], deep_kelp: [20, 32], deep_wreck: [68, 40], deep_abyss: [25, 62], deep_vent: [60, 78]
    };
    for(id in MP){ if(MP.hasOwnProperty(id) && D.seaZone(id)) D.seaZone(id).map = { x: MP[id][0], y: MP[id][1] }; }
    for(id in M){
      if(!M.hasOwnProperty(id) || !D.SCENE[id]) continue;
      sc = D.SCENE[id]; z = M[id];
      if(z.m.length !== sc.rows || z.m[0].length !== sc.cols) continue;   /* 尺寸對不上就保留暫代版 */
      sc.mask = z.m; sc.maskV = 'img';
      sc.spawn0 = { x: z.s[0], y: z.s[1] }; sc.exit = { x: z.e[0], y: z.e[1] };
      nb = z.vb ? { x0: z.vb[0], y0: z.vb[1], x1: z.vb[2], y1: z.vb[3] } : null;
      for(i = 0; i < sc.obs.length; i++) sc.obs[i].pt = near(sc.mask, sc.obs[i].pt, nb);
      for(i = 0; i < sc.refill.length; i++) sc.refill[i] = near(sc.mask, sc.refill[i], nb);
      if(z.v){
        ob = sc.vineBox; nb = { x0: z.vb[0], y0: z.vb[1], x1: z.vb[2], y1: z.vb[3] };
        sc.vine = { x: z.v[0], y: z.v[1] }; sc.vineBox = nb;
        /* 藤蔓口袋資源:原本撒在舊口袋範圍的候選點,改撒到新口袋(對齊藤簾後面的空間) */
        for(k in sc.spawn){
          if(!sc.spawn.hasOwnProperty(k)) continue; sp = sc.spawn[k];
          for(i = 0; i < sp.pool.length; i++){
            p = sp.pool[i];
            if(ob && p.x >= ob.x0 && p.x <= ob.x1 && p.y >= ob.y0 && p.y <= ob.y1) sp.pool[i] = D.seaPool(id, k + 'v2|' + i, 1, sc.cols, sc.rows, nb)[0];
          }
        }
      }
    }
  })();
  /* ══════════════════════════════════════════════════════════════════════════
   * ★ v1.378.0(2026-10-04・老師「繼續進行荒島求生完成帆船後的外島劇情章節故事」)— ⛵ 外島篇主線 5 章(c9~c13)
   *   接在終章 c8「島的新樣貌」之後;每章標 sea:1 ⇒ index 端只有 islSeaAvail()(GM 外島開關已開放 + 終章完成,或 GM 本人)時才會開始,
   *   外島上鎖時主線停在這一章、顯示「⛵ 外島篇敬請期待」,存檔的 S.ch 不動、獎勵不會漏(比照 c6 的 ISL_CH6_OPEN 做法)。
   *   故事主軸:阿川沒有直接回家,他一路去了四座外島,想知道「失衡之氣」是不是只出現在我們的島。
   *     每座島各自生病的樣子(冰河融化/雨林被砍/颱風變多/深海熱泉冒黑霧)⇒ 最後在熱泉旁找到阿川的答案:
   *     失衡之氣是大自然失去平衡時發出的警告;能讓魔物變回動物的,是讓大自然恢復平衡。
   *   新目標類型(index islMainObjCur 新增):sail(出海次數)、seaObs(某島 🔭 觀察過的物種數)、armor(擁有某件防具)、
   *     tool(擁有某把工具)、seaPets(外島夥伴人數);boss 沿用本島寫法(id = 島主巢穴所在區)。
   *   新說話者(只有 emoji,不需要新圖):🐧 企鵝長老、🦜 金剛鸚鵡阿彩、🐢 象龜爺爺、🐋 老藍鯨。
   *   ⚠ 本區註解嚴禁出現「星號+斜線」字樣(v1.227.0 教訓)。
   * ══════════════════════════════════════════════════════════════════════════ */
  (function(){
    var i, has = {}, c8 = null, seg, last;
    D.SPEAKERS = D.SPEAKERS || {};
    D.SPEAKERS.penguin = { who:'npc', img:'', e:'🐧' };
    D.SPEAKERS.macaw = { who:'npc', img:'', e:'🦜' };
    D.SPEAKERS.tortoise = { who:'npc', img:'', e:'🐢' };
    D.SPEAKERS.whale = { who:'npc', img:'', e:'🐋' };
    if(!D.MAINLINE) return;
    for(i = 0; i < D.MAINLINE.length; i++){ has[D.MAINLINE[i].id] = 1; if(D.MAINLINE[i].id === 'c8') c8 = D.MAINLINE[i]; }
    /* 終章最後一句原本寫「主線完結」⇒ 改成本島篇完結,並帶出海平線那頭的外島 */
    if(c8 && c8.end && c8.end.length){
      seg = c8.end[c8.end.length - 1]; last = seg.l.length - 1;
      if(seg.s === 'me' && /主線完結/.test(seg.l[last])) seg.l[last] = '(本島篇完結!島一直都在,想留下來的話,隨時都能繼續生活。……海平線那一頭,好像還有別的島。)';
    }
    if(has.c9) return;
    D.MAINLINE.push(
      { id:'c9', sea:1, n:'外島篇・霧的另一邊', e:'⛵', sum:'海平線上的霧散了——阿川沒有直接回家,他往外島去了。第一次出海,登上冰天雪地島。',
        start: [ { s:'gull', l:['「嘎!你看海平線那邊——以前一直被霧擋住,現在霧散了!」', '「有四座島!一座白白的、一座綠綠的、一座整天在打雷,還有一座……在海底發著藍光。」'] },
                 { s:'note', l:['【漂流瓶裡的紙條】', '「我沒有直接回家。我想知道,失衡之氣是不是只出現在我們這座島。」', '「我先往北走——那裡的冰,好像在哭。——阿川」'] },
                 { s:'me', l:['阿川沒有回家……他去了外島!', '帆船已經造好了。這一次揚帆,不是為了回家,是為了找到答案。'] } ],
        objs: [
          { t:'sail', n:1, txt:'第一次出海', g:'打開 🗺 大地圖,按左下角「⛵ 出海探險」,翻到 ❄ 冰天雪地島,點企鵝冰岸出航。' },
          { t:'explore', id:'ice_coast', n:30, txt:'企鵝冰岸探索度 30%', g:'在冰岸採集、觀察、打倒魔物,探索度就會上升。小心體溫,冷了就去 🔥 營火堆取暖。', go:'ice_coast' },
          { t:'seaObs', isle:'ice', n:2, txt:'🔭 觀察 2 種冰雪島的動物', g:'地圖上的 🔭 觀察點走過去,答對題目就會記進圖鑑。', go:'ice_coast' }
        ],
        end: [ { s:'penguin', l:['「呱——你是從南邊那座島來的?我是這裡的企鵝長老。」', '「這幾年冰河退得好快,我們要走好遠好遠,才找得到夠厚的冰可以孵蛋。」'] },
               { s:'me', l:['冰變少了……是因為地球越來越暖嗎?'] },
               { s:'penguin', l:['「呱……冰峰上的猛瑪王最近變得好兇,牠身上冒著黑霧——跟你說的『失衡之氣』一模一樣。」'] } ],
        reward: { shell:60, tech:4, items:{ krill:3 } } },

      { id:'c10', sea:1, n:'冰原篇・融化的冰河', e:'❄', sum:'穿上麝牛絨大衣走進藍冰冰河,讓冰河猛瑪王冷靜下來。',
        start: [ { s:'penguin', l:['「呱,冰河那邊冷得要命,沒穿暖和的衣服,體溫一下子就掉光了。」', '「凍原上的麝牛,絨毛是世界上最保暖的毛之一——細細的毛會把空氣鎖在裡面。」'] },
                 { s:'me', l:['空氣不太會傳熱,被鎖住就變成一層保暖層。', '所以羽絨衣、毛衣才會那麼暖!'] } ],
        objs: [
          { t:'armor', id:'qiviutcoat', txt:'做出麝牛絨大衣', g:'「👤 角色 → 🛡 防具」製作;麝牛絨在凍原苔原的麝牛群採得到。', go:'ice_tundra' },
          { t:'zone', id:'ice_glacier', txt:'抵達藍冰冰河', g:'凍原苔原探索度 50%,加上擁有麝牛絨大衣,冰河就會開放。', go:'ice_tundra' },
          { t:'seaObs', isle:'ice', n:4, txt:'🔭 觀察 4 種冰雪島的動物', g:'冰岸、雪林、凍原、冰河都有觀察點。' },
          { t:'boss', id:'ice_peak', txt:'讓冰河猛瑪王冷靜下來', g:'極光冰峰探索度 80% 後,巢穴會出現在冰峰深處。', go:'ice_peak' }
        ],
        end: [ { s:'me', l:['猛瑪王倒下的那一刻,身上的黑霧散開了——牠只是一隻好老、好老的猛瑪象。', '牠腳邊的冰裡,封著一個玻璃瓶。'] },
               { s:'note', l:['【冰裡的紙條】', '「冰河像大地的冰箱,也像一面大鏡子:白白的冰把陽光反射回天空。」', '「冰一變少,露出來的深色海水和土地吸了更多熱,冰就融得更快——這是一個停不下來的圈圈。」', '「我要去南邊那座綠色的島。聽說那裡的樹,一天比一天少。——阿川」'] },
               { s:'penguin', l:['「呱!黑霧散了,冰河今年應該能長回來一點點。謝謝你,南方來的朋友!」'] } ],
        reward: { shell:100, tech:6, items:{ frostcrystal:3 } } },

      { id:'c11', sea:1, n:'雨林篇・破了洞的樹冠', e:'🌴', sum:'砍開藤蔓、爬上林冠,找出千年巨木生氣的原因。',
        start: [ { s:'gull', l:['「嘎——好熱!好濕!這座島的空氣黏黏的,羽毛都塌了。」'] },
                 { s:'macaw', l:['「嘎啊啊!新面孔!我是金剛鸚鵡阿彩!」', '「你要往裡面走?先做一把開山刀——這裡的藤蔓,長得比你走路還快!」', '「還有喔,樹林正中央那棵千年巨木,最近一直在哭。」'] } ],
        objs: [
          { t:'tool', id:'machete', txt:'做出開山刀', g:'營地「🛠 製作工具」就做得出來;砍開藤蔓才進得了黑水沼澤。' },
          { t:'explore', id:'jungle_canopy', n:40, txt:'林冠吊橋探索度 40%', g:'雨林底層探索度 50% 就能爬上林冠吊橋。', go:'jungle_canopy' },
          { t:'seaObs', isle:'jungle', n:3, txt:'🔭 觀察 3 種雨林的生物', g:'樹懶、巨嘴鳥、切葉蟻……雨林是生物種類最多的地方。' },
          { t:'seaPets', n:1, txt:'交到第一位外島夥伴', g:'外島的動物也能邀請:送牠喜歡的食物,再答對牠的知識題。' },
          { t:'boss', id:'jungle_giant', txt:'讓絞殺巨木靈冷靜下來', g:'千年巨木探索度 80% 後,巢穴會出現(記得帶開山刀砍藤蔓)。', go:'jungle_giant' }
        ],
        end: [ { s:'me', l:['巨木靈身上的藤蔓一鬆開,千年老樹嘩啦啦落下一大片葉子,陽光一路照進了雨林底層。'] },
               { s:'macaw', l:['「嘎……雨林的邊緣被砍掉好多樹,樹冠破了一個大洞,太陽直直曬下來,底層的植物都乾掉了。」', '「大樹被困住、被曬傷,巨木靈就生氣了。」'] },
               { s:'note', l:['【樹洞裡的紙條】', '「雨林的土其實很薄,養分大部分存在活著的植物身上。樹一砍掉,大雨就把土沖走,很難再長回來。」', '「我在東邊那座暴風雨的島,看到奇怪的閃電。我得去看看。——阿川」'] } ],
        reward: { shell:140, tech:8, items:{ latex:4, banana:3 } } },

      { id:'c12', sea:1, n:'風暴篇・颱風眼的寧靜', e:'🌀', sum:'頂著陣風與落雷走進風暴之眼,問出黑霧到底從哪裡來。',
        start: [ { s:'tortoise', l:['「呼……年輕人,你是第一個在這種天氣還敢靠岸的。我是象龜爺爺,活了一百五十年囉。」', '「以前啊,颱風一年來一兩次。現在,一個接一個。」'] },
                 { s:'me', l:['颱風是從溫暖的海面吸水氣長大的。', '海水越暖,颱風就有越多能量……'] },
                 { s:'tortoise', l:['「呼,記得穿防風雨衣。橡膠做的,不但擋雨,還不導電——打雷的時候也比較安全。」'] } ],
        objs: [
          { t:'armor', id:'stormcoat', txt:'做出防風雨衣', g:'「👤 角色 → 🛡 防具」製作;沒有它,沉船燈塔灣進不去。' },
          { t:'zone', id:'storm_wreck', txt:'抵達沉船燈塔灣', g:'風蝕石林探索度 50%,加上擁有防風雨衣就會開放。', go:'storm_moor' },
          { t:'seaObs', isle:'storm', n:3, txt:'🔭 觀察 3 種風暴島的動物', g:'海鬣蜥、藍腳鰹鳥、達爾文雀……牠們都只住在這種海島上。' },
          { t:'tech', id:'divehelmet', txt:'研究「潛水頭盔」', g:'營地側欄「🏕 營地 → 🔬 研究」;要下海底洞穴一定要有它。' },
          { t:'boss', id:'storm_eye', txt:'讓颶風元靈平靜下來', g:'風暴之眼探索度 80% 後,巢穴會出現在颱風眼正中央。', go:'storm_eye' }
        ],
        end: [ { s:'me', l:['走進風暴之眼:四周是旋轉的雲牆,正中央卻安靜得聽得到自己的心跳。', '颶風元靈散開了,變成一陣涼涼的海風。'] },
               { s:'tortoise', l:['「呼……風停了。年輕人,黑霧不是從天上來的。」', '「你仔細看——它是從海底冒上來的。」'] },
               { s:'note', l:['【燈塔裡的紙條】', '「我在燈塔頂上看見,海底有藍藍的光,還有一股黑霧從那裡往上冒。」', '「最後的答案,一定在最深的地方。我先下去了。如果你看到這張紙條——記得帶夠空氣。——阿川」'] } ],
        reward: { shell:180, tech:10, items:{ airtank:2 } } },

      { id:'c13', sea:1, n:'深海篇・最深的回聲', e:'🌊', sum:'潛進沒有陽光的深海,在熱泉旁找到阿川最後的答案。',
        start: [ { s:'whale', l:['「嗚————————」(很低很低的聲音,整片海都跟著震動)'] },
                 { s:'gull', l:['「嘎!是藍鯨!牠說:『小小的陸地朋友,深海很黑、很冷、壓力很大。跟著光走。』」'] },
                 { s:'me', l:['越往下,水壓越大;越往下,陽光越少。', '我深吸一口氣——出發。'] } ],
        objs: [
          { t:'armor', id:'divesuit', txt:'做出潛水服', g:'「👤 角色 → 🛡 防具」製作;沒有它,發光深淵進不去。' },
          { t:'explore', id:'deep_abyss', n:40, txt:'發光深淵探索度 40%', g:'深淵一片漆黑,螢火蟲夥伴的光在這裡特別有用。', go:'deep_abyss' },
          { t:'seaObs', isle:'deep', n:3, txt:'🔭 觀察 3 種海底生物', g:'珊瑚礁、巨藻森林、沉船洞窟都有觀察點(活珊瑚只能看、不能採)。' },
          { t:'seaPets', n:3, txt:'擁有 3 位外島夥伴', g:'四座外島都有可以邀請的動物。' },
          { t:'boss', id:'deep_vent', txt:'讓深淵大王魷平靜下來', g:'熱泉巨穴探索度 80% 後,巢穴會出現在黑煙囪旁邊。', go:'deep_vent' }
        ],
        end: [ { s:'me', l:['大王魷鬆開觸手,慢慢游回熱泉旁邊的黑暗裡。', '黑煙囪四周,管蟲、白色的螃蟹……竟然有一大群生物,在完全沒有陽光的地方活著。'] },
               { s:'note', l:['【熱泉旁的鐵盒】', '「我找到答案了:失衡之氣不是怪物,是大自然失去平衡時發出的警告。」', '「海太熱、冰太少、樹太少、垃圾太多——每座島生病的樣子都不一樣,但病因都一樣。」', '「我要回家,把看到的告訴大家。如果你也走完了這四座島——你就是第二個知道答案的人。——阿川」'] },
               { s:'whale', l:['「嗚——」(海水輕輕地震動,像是在說謝謝)'] },
               { s:'me', l:['原來,能讓魔物變回動物的,不是打倒牠們,而是讓大自然恢復平衡。', '四座島都記得我來過。下一次揚帆,也許就是回家的時候了。', '(外島篇完結!四座外島一直都在,隨時都能再出海探險。)'] } ],
        reward: { shell:300, tech:15, items:{ crystal:5 } } }
    );
  })();  /* ★ v1.378.0 更新日誌排序:本檔比 island_db 晚載入,這裡 unshift 的 v1.368~v1.370 會蓋在 island_db 較新版本(v1.371 起)的上面 ⇒ 依版號由新到舊重排一次 */
  (function(){
    function vn(v){ var m = /v(\d+)\.(\d+)\.(\d+)/.exec(String(v || '')); return m ? (+m[1]) * 1e6 + (+m[2]) * 1e3 + (+m[3]) : 0; }
    var i, L = D.LOG;
    if(!L || !L.length) return;
    for(i = 0; i < L.length; i++) L[i]._ord = i;
    L.sort(function(a, b){ var d = vn(b.v) - vn(a.v); return d ? d : a._ord - b._ord; });
    for(i = 0; i < L.length; i++) delete L[i]._ord;
  })();

  /* 本檔新增的圖鍵全部列為選配:圖還沒上傳前「完整下載」不會因此算失敗(index 端 islInstallUrls 讀 D.SEA_IMG) */
  D.SEA_IMG = {};
  for(_k0 in D.IMG){ if(D.IMG.hasOwnProperty(_k0) && !_imgKeys0[_k0]) D.SEA_IMG[_k0] = 1; }
  }
  window.ISL_SEA_APPLY = apply;
  if(window.ISL_DB) apply(window.ISL_DB);
})();
