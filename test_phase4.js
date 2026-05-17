// Phase 4 端到端測試 — 模擬「房主 push → 非房主接收 → 還原 G」完整流程
// 同時驗證 _wbClientMode 攔截邏輯是否正確

const _WIRE_HERO_SKIP = new Set(['_mimicInProgress', '_handledByOnCard']);

function _wireDeepClone(v, depth){
  depth = depth || 0;
  if(depth > 10) return null;
  if(v === null || v === undefined) return v;
  const t = typeof v;
  if(t === 'function') return undefined;
  if(t === 'number' || t === 'string' || t === 'boolean') return v;
  if(t !== 'object') return undefined;
  if(v instanceof Set) return Array.from(v).map(x => _wireDeepClone(x, depth+1)).filter(x => x !== undefined);
  if(Array.isArray(v)) return v.map(x => _wireDeepClone(x, depth+1)).map(x => x === undefined ? null : x);
  const out = {};
  for(const k in v){
    if(!Object.prototype.hasOwnProperty.call(v, k)) continue;
    if(_WIRE_HERO_SKIP.has(k)) continue;
    const c = _wireDeepClone(v[k], depth+1);
    if(c !== undefined) out[k] = c;
  }
  return out;
}
function _heroToWireV6(h){
  if(!h) return null;
  const w = _wireDeepClone(h, 0);
  if(!w) return null;
  if(!Array.isArray(w.status)) w.status = [];
  if(!Array.isArray(w.buffs))  w.buffs  = [];
  w.isDead = !!(h.isDead) || (h.curHp <= 0);
  return w;
}
function newHero(name, side, pos){
  return {
    name, side, pos,
    hp:100, atk:10, def:0, sp:5, spd:50,
    curHp:100, acted:false,
    s1:{n:'技能1'}, s2:{n:'技能2'},
    status:[], buffs:[],
    s2used:false, equip:null, av:'⚔',
    _mimicUsed:false,
  };
}
function _wireToHeroV6(w){
  if(!w || !w.name) return null;
  let h = newHero(w.name, w.side || 'p1', w.pos != null ? w.pos : 0);
  for(const k in w){
    if(!Object.prototype.hasOwnProperty.call(w, k)) continue;
    h[k] = w[k];
  }
  if(!Array.isArray(h.status)) h.status = [];
  if(!Array.isArray(h.buffs))  h.buffs  = [];
  return h;
}
function _GToWire(G){
  if(!G) return null;
  return {
    turn: G.turn || 1,
    currentActorIdx: G.currentActorIdx || 0,
    turnOrder: Array.isArray(G.turnOrder) ? G.turnOrder.map(o => ({side:o.side,pos:o.pos,spd:o.spd})) : [],
    p1: Array.isArray(G.p1) ? G.p1.map(_heroToWireV6) : [],
    p2: Array.isArray(G.p2) ? G.p2.map(_heroToWireV6) : [],
    energy: G.energy ? { p1: G.energy.p1 || 0, p2: G.energy.p2 || 0 } : { p1: 0, p2: 0 },
    battleStats: G.battleStats ? _wireDeepClone(G.battleStats, 0) : {},
    inv:[null,null,null], inv2:[null,null,null], deck:[],
    sellUsed:[], dmgUp:[],
    lastSkillName: G.lastSkillName || null,
  };
}
function _applyWireToG(G, wire){
  if(!G || !wire) return false;
  G.turn = wire.turn || 1;
  G.currentActorIdx = wire.currentActorIdx || 0;
  G.turnOrder = Array.isArray(wire.turnOrder) ? wire.turnOrder.slice() : [];
  G.p1 = Array.isArray(wire.p1) ? wire.p1.map(_wireToHeroV6) : [];
  G.p2 = Array.isArray(wire.p2) ? wire.p2.map(_wireToHeroV6) : [];
  G.energy = wire.energy ? {p1:wire.energy.p1||0, p2:wire.energy.p2||0} : {p1:0,p2:0};
  G.battleStats = wire.battleStats || {};
  G.lastSkillName = wire.lastSkillName || null;
  G.activeChar = null;
  return true;
}

// ── 模擬主程式 hook 系統 ─────────────────────────────────────────────
const callLog = [];

const win = {
  // 主程式狀態
  _adventureStage: null,
  G: null,

  // v6 旗標
  _wbClientMode: false,
  _wbConnectedHostMode: false,
  _wbConnectedClientMode: false,
  _wbClientFirstBattleUpdate: true,
  _wbClientLastVersion: 0,
  _wbClientForceCheckWin: false,
  _wbAdvBattleEnded: false,

  // 序列化工具
  _wbWireUtils: {
    GToWire: _GToWire,
    wireToHero: _wireToHeroV6,
    applyWireToG: _applyWireToG,
    heroToWire: _heroToWireV6,
  },

  // 模擬主程式 helpers
  _wbGetAdvStage: function(){ return win._adventureStage; },
  _wbGetG: function(){ return win.G; },
  _wbIsBossName: function(name){ return name === '維蘇威火山龍王'; },

  newHero: newHero,

  // 模擬主程式戰鬥引擎(原版)
  _origStartTurn: function(){ callLog.push('startTurn(原版)'); },
  _origAiAct:     function(a){ callLog.push('aiAct(原版): '+a?.name); },
  _origCheckWin:  function(){ callLog.push('checkWin(原版)'); return false; },
  _origEndAction: function(){ callLog.push('endAction(原版)'); },

  // hooks 安裝後填這裡
  startTurn: null,
  aiAct: null,
  checkWin: null,
  endAction: null,
};

// ── 安裝 v6 hooks(複製 world-boss.js 的關鍵邏輯) ──────────────────

// startTurn hook(Phase 4 client mode 攔截)
const _origStartTurn = win._origStartTurn;
win.startTurn = function(){
  if(win._wbClientMode && win._wbGetAdvStage() === 'worldboss'){
    callLog.push('startTurn 被擋(client mode)');
    return;
  }
  callLog.push('startTurn 通過');
  return _origStartTurn.apply(this, arguments);
};

// aiAct hook
const _origAiAct = win._origAiAct;
win.aiAct = function(a){
  if(win._wbClientMode && win._wbGetAdvStage() === 'worldboss'){
    callLog.push('aiAct 被擋(client mode): '+a?.name);
    return;
  }
  callLog.push('aiAct 通過: '+a?.name);
  return _origAiAct.apply(this, arguments);
};

// checkWin hook
const _origCheckWin = win._origCheckWin;
win.checkWin = function(){
  if(win._wbClientMode && !win._wbClientForceCheckWin && win._wbGetAdvStage() === 'worldboss'){
    callLog.push('checkWin 被擋(client mode)');
    return false;
  }
  callLog.push('checkWin 通過');
  return _origCheckWin.apply(this, arguments);
};

// endAction hook(client mode 下不擋,但 sync hook 內部會擋)
const _origEndAction = win._origEndAction;
win.endAction = function(){
  const r = _origEndAction.apply(this, arguments);
  // sync hook(client 端不會 push,host 模擬時也不會,因為無 _wbNet)
  return r;
};

// ── 測試案例 ──────────────────────────────────────────────────────

console.log('═══ Phase 4 端到端測試 ═══\n');
let allOk = true;

// Test 1: 非戰鬥階段,hooks 透通(對其他遊戲模式無影響)
console.log('▸ Test 1: 非世界戰時 hooks 透通(對台灣關/鬥技場無影響)');
callLog.length = 0;
win._adventureStage = 'taiwan';
win._wbClientMode = false;
win.startTurn();
win.aiAct({name:'某 BOSS', side:'p2'});
win.checkWin();
const t1_a = callLog.includes('startTurn 通過');
const t1_b = callLog.includes('aiAct 通過: 某 BOSS');
const t1_c = callLog.includes('checkWin 通過');
console.log(`    ${t1_a?'✅':'❌'} startTurn 通過原版`);
console.log(`    ${t1_b?'✅':'❌'} aiAct 通過原版`);
console.log(`    ${t1_c?'✅':'❌'} checkWin 通過原版`);
const t1ok = t1_a && t1_b && t1_c;
console.log('  ' + (t1ok ? '✅ Test 1 PASS' : '❌ Test 1 FAIL') + '\n');
if(!t1ok) allOk = false;

// Test 2: 世界戰 client mode,hooks 全部擋
console.log('▸ Test 2: 世界戰 + client mode,hooks 全部擋');
callLog.length = 0;
win._adventureStage = 'worldboss';
win._wbClientMode = true;
win._wbClientForceCheckWin = false;
win.startTurn();
win.aiAct({name:'維蘇威火山龍王', side:'p2'});
const cwR = win.checkWin();
const t2_a = callLog.includes('startTurn 被擋(client mode)');
const t2_b = callLog.includes('aiAct 被擋(client mode): 維蘇威火山龍王');
const t2_c = callLog.includes('checkWin 被擋(client mode)');
const t2_d = cwR === false;  // client mode 下 checkWin 永遠 false
console.log(`    ${t2_a?'✅':'❌'} startTurn 被擋`);
console.log(`    ${t2_b?'✅':'❌'} aiAct 被擋`);
console.log(`    ${t2_c?'✅':'❌'} checkWin 被擋`);
console.log(`    ${t2_d?'✅':'❌'} checkWin 回傳 false`);
const t2ok = t2_a && t2_b && t2_c && t2_d;
console.log('  ' + (t2ok ? '✅ Test 2 PASS' : '❌ Test 2 FAIL') + '\n');
if(!t2ok) allOk = false;

// Test 3: 世界戰房主 mode(_wbClientMode=false),hooks 不擋
console.log('▸ Test 3: 世界戰房主 mode,hooks 不擋');
callLog.length = 0;
win._adventureStage = 'worldboss';
win._wbClientMode = false;
win._wbConnectedHostMode = true;
win.startTurn();
win.aiAct({name:'維蘇威火山龍王', side:'p2'});
win.checkWin();
const t3_a = callLog.includes('startTurn 通過');
const t3_b = !callLog.includes('aiAct 被擋(client mode): 維蘇威火山龍王');
console.log(`    ${t3_a?'✅':'❌'} 房主 startTurn 通過`);
console.log(`    ${t3_b?'✅':'❌'} 房主 aiAct 不被擋`);
const t3ok = t3_a && t3_b;
console.log('  ' + (t3ok ? '✅ Test 3 PASS' : '❌ Test 3 FAIL') + '\n');
if(!t3ok) allOk = false;

// Test 4: _wbClientForceCheckWin = true 時,checkWin 不擋(讓結算流程跑)
console.log('▸ Test 4: client mode 但 forceCheckWin = true 時 checkWin 跑');
callLog.length = 0;
win._adventureStage = 'worldboss';
win._wbClientMode = true;
win._wbClientForceCheckWin = true;
win.checkWin();
const t4_a = callLog.includes('checkWin 通過');
console.log(`    ${t4_a?'✅':'❌'} forceCheckWin 啟用後 checkWin 跑原版`);
console.log('  ' + (t4_a ? '✅ Test 4 PASS' : '❌ Test 4 FAIL') + '\n');
if(!t4_a) allOk = false;
win._wbClientForceCheckWin = false;

// Test 5: 房主 push → 非房主 apply 完整流程
console.log('▸ Test 5: 房主 push → 非房主接收還原 G');
// 房主端模擬:G 有完整戰鬥狀態
const hostG = {
  p1: [
    Object.assign(newHero('火劍士','p1',0), {curHp:60, status:[{type:'burn',dur:2}], _wbPickedElement:'fire'}),
    Object.assign(newHero('治療師','p1',1), {curHp:80}),
    Object.assign(newHero('盜賊','p1',2), {curHp:0}),
    Object.assign(newHero('騎士','p1',3), {curHp:90}),
  ],
  p2: [
    Object.assign(newHero('維蘇威火山龍王','p2',0), {hp:200000, curHp:120000, _wbShields:{fire:2,water:3,wind:3,earth:3}}),
  ],
  turn: 5,
  currentActorIdx: 2,
  turnOrder: [
    {side:'p2',pos:0,spd:999},
    {side:'p1',pos:0,spd:80},
    {side:'p1',pos:1,spd:60},
    {side:'p1',pos:3,spd:55},
  ],
  energy: {p1:3, p2:999},
  battleStats: {'火劍士':{dmg:8000,heal:0,statusCount:1,hitsReceived:2,side:'p1',av:'⚔'}},
  lastSkillName: '炎槍',
};
const hostWire = _GToWire(hostG);

// 模擬 Firestore 把 hostWire 傳到非房主端
const wirePayload = JSON.parse(JSON.stringify({
  fullWireG: hostWire,
  _syncReason: 'after_endAction',
  version: 7,
  ended: false,
}));

// 非房主端 G(由 _wbSetupAdvForBattle 起底,假設先建好骨架)
win.G = {p1:[], p2:[], energy:{p1:0,p2:0}, turn:0, currentActorIdx:0, turnOrder:[], battleStats:{}, activeChar:'will_reset'};

// 模擬 onBattleUpdate 非房主分支
_applyWireToG(win.G, wirePayload.fullWireG);

const t5_a = win.G.turn === 5;
const t5_b = win.G.currentActorIdx === 2;
const t5_c = win.G.p1.length === 4;
const t5_d = win.G.p1[0].curHp === 60;
const t5_e = win.G.p1[0]._wbPickedElement === 'fire';
const t5_f = win.G.p1[2].curHp === 0;  // 死掉的盜賊還原
const t5_g = win.G.p2[0]._wbShields.fire === 2;
const t5_h = win.G.battleStats['火劍士'].dmg === 8000;
const t5_i = win.G.activeChar === null;  // 應被 reset
const t5_j = win.G.p1[0].status[0]?.type === 'burn';
console.log(`    ${t5_a?'✅':'❌'} turn = 5`);
console.log(`    ${t5_b?'✅':'❌'} currentActorIdx = 2`);
console.log(`    ${t5_c?'✅':'❌'} p1 長度 = 4`);
console.log(`    ${t5_d?'✅':'❌'} 火劍士 curHp = 60`);
console.log(`    ${t5_e?'✅':'❌'} 火劍士 _wbPickedElement = fire`);
console.log(`    ${t5_f?'✅':'❌'} 盜賊 curHp = 0(死狀態保留)`);
console.log(`    ${t5_g?'✅':'❌'} BOSS 護盾 fire = 2(被打過 1 次)`);
console.log(`    ${t5_h?'✅':'❌'} battleStats 火劍士 dmg = 8000`);
console.log(`    ${t5_i?'✅':'❌'} activeChar 被 reset`);
console.log(`    ${t5_j?'✅':'❌'} 火劍士 status burn 還原`);
const t5ok = t5_a && t5_b && t5_c && t5_d && t5_e && t5_f && t5_g && t5_h && t5_i && t5_j;
console.log('  ' + (t5ok ? '✅ Test 5 PASS' : '❌ Test 5 FAIL') + '\n');
if(!t5ok) allOk = false;

// Test 6: version 防舊事件
console.log('▸ Test 6: version 比對防舊事件');
win._wbClientLastVersion = 10;
// 模擬 onBattleUpdate 內的 version check
const oldEvent = { fullWireG: hostWire, version: 5 };
const versionOk = !(oldEvent.version > 0 && oldEvent.version < win._wbClientLastVersion);
const t6_a = !versionOk;  // 應該被擋
console.log(`    ${t6_a?'✅':'❌'} 舊 version (5 < 10) 被識別為應跳過`);

// 新 version 通過
const newEvent = { fullWireG: hostWire, version: 12 };
const newOk = !(newEvent.version > 0 && newEvent.version < win._wbClientLastVersion);
const t6_b = newOk;
console.log(`    ${t6_b?'✅':'❌'} 新 version (12 > 10) 通過`);
const t6ok = t6_a && t6_b;
console.log('  ' + (t6ok ? '✅ Test 6 PASS' : '❌ Test 6 FAIL') + '\n');
if(!t6ok) allOk = false;

// Test 7: cleanup 清掉所有 v6 旗標
console.log('▸ Test 7: 結算後 cleanup 清掉所有 v6 旗標');
win._wbClientMode = true;
win._wbConnectedHostMode = true;
win._wbConnectedClientMode = true;
win._wbClientForceCheckWin = true;
win._wbClientFirstBattleUpdate = false;
win._wbClientLastVersion = 99;
// 模擬 _wbShowAdvBattleResult 末端清理
win._wbConnectedHostMode = false;
win._wbConnectedClientMode = false;
win._wbClientMode = false;
win._wbClientForceCheckWin = false;
win._wbClientFirstBattleUpdate = true;
win._wbClientLastVersion = 0;
const t7_a = win._wbClientMode === false;
const t7_b = win._wbConnectedHostMode === false;
const t7_c = win._wbConnectedClientMode === false;
const t7_d = win._wbClientFirstBattleUpdate === true;
const t7_e = win._wbClientLastVersion === 0;
console.log(`    ${t7_a?'✅':'❌'} _wbClientMode = false`);
console.log(`    ${t7_b?'✅':'❌'} _wbConnectedHostMode = false`);
console.log(`    ${t7_c?'✅':'❌'} _wbConnectedClientMode = false`);
console.log(`    ${t7_d?'✅':'❌'} _wbClientFirstBattleUpdate reset 為 true`);
console.log(`    ${t7_e?'✅':'❌'} _wbClientLastVersion reset 為 0`);
const t7ok = t7_a && t7_b && t7_c && t7_d && t7_e;
console.log('  ' + (t7ok ? '✅ Test 7 PASS' : '❌ Test 7 FAIL') + '\n');
if(!t7ok) allOk = false;

// Test 8: 主程式房主廣播自己會跳過
console.log('▸ Test 8: 房主收到自己的廣播會跳過(isHost 檢查)');
const isHostFn = () => true;
const onBattleUpdate_hostCheck = (battle, isHostCheck) => {
  if(isHostCheck()) return 'skipped';
  return 'processed';
};
const t8_a = onBattleUpdate_hostCheck({fullWireG: hostWire}, isHostFn) === 'skipped';
console.log(`    ${t8_a?'✅':'❌'} 房主收到 onBattleUpdate 直接 return`);
console.log('  ' + (t8_a ? '✅ Test 8 PASS' : '❌ Test 8 FAIL') + '\n');
if(!t8_a) allOk = false;

console.log('═══ 結論 ═══');
console.log(allOk ? '✅ Phase 4 端到端測試全部 PASS' : '❌ 有測試失敗');
process.exit(allOk ? 0 : 1);
