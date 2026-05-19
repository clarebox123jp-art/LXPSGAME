# 世界 BOSS 戰大改動 — 記憶傳承 v25(v3.3.5)

> 本文檔交接給未來的 Claude,延續 LXPSGAME 世界 BOSS 戰(維蘇威火山龍王)v3.3.5 修補。
> 上一份 v24 涵蓋到 v3.3.4 結束。本份 v25 涵蓋 v3.3.5 全部變更。

---

## 📦 專案基本資料

- **遊戲名稱**:LXPSGAME(瀏覽器 RPG)
- **當前階段**:世界 BOSS 戰(維蘇威火山龍王)多人連線 bug 修補 + 召喚機率表小調整
- **使用者稱呼**:老師(中文使用者,臺灣國語)
- **核心檔案**(都在 `/mnt/project/`,read-only):
  - `index.html`(主程式,~75,212 行)
  - `world-boss.html`(世界 BOSS UI,~10,765 行)

- **工作目錄**:`/home/claude/`
- **輸出目錄**:`/mnt/user-data/outputs/`

---

## 🎯 v3.3.5 完整需求清單(老師第九輪 — 多人連線實測 bug 修補)

### 老師反映的問題(三圖三 BUG + 一個內容調整)

1. ✅ **圖1 — 隊長行動完輪到隊友卡死、傷害特效未同步**(嚴重)
2. ✅ **圖2 — 房主補自己角色(單人組隊)時被「這題只能由第 2 號玩家回答」攔截**
3. ✅ **圖3 — 戰鬥中定型文蓋住傷害數字、沒放大、沒到角色卡下方技能位置**
4. ✅ **召喚機率表「稀有角色」desc 改成「未收錄之稀有角色(全收錄時則轉化為超越極限果實 x1)」**

---

## 🔧 v3.3.5 完整實作細節

### 🚨 一、最重要發現:`_wbHostSyncG` **從來沒有被安裝**(BUG 1 根因)

**v3.3.3 文檔欺騙了我們**:文檔說「`_wbHostSyncG(reason)` 由 Phase 3 安裝」,
但整份程式碼裡只有 `if(typeof window._wbHostSyncG === 'function')` 這種「防禦式呼叫」,
**從沒有真正的 `window._wbHostSyncG = function...` 定義**。

#### 呼叫點清單(v3.3.3 時已埋好,但全部 if false → 全 skip)

| 檔案 | 行 | reason |
| ---- | ---- | ---- |
| `world-boss.html` 6593 | 戰鬥開始 | `'battle_started'` |
| `world-boss.html` 6614 | 開戰題答完 | `'opening_quiz_done'` |
| `world-boss.html` 8125 | 答題獎勵 BOSS 受傷 | `'quiz-correct-team-reward'` |
| `world-boss.html` 8214 | 同上(另一條路徑) | `'quiz-reward-dmg'` |
| `world-boss.html` 8630 | 開戰題答對 | `'opening-quiz-correct'` |
| `index.html` 52180 | 寶物破盾 | `'reward-shield-remove'` |

**後果**:Host 端每次 endAction 完成後,從沒主動 push G 給 client。
Client 端 v6 `onBattleUpdate` 註冊好等推送,但 host 永遠不 push → 圖1卡死。
另外 `_wbFxQueue`(房主端收集的視覺特效)也跟著卡在 host,client 永遠看不到傷害數字+特效。

#### 修補(`index.html` 43184 行起)

```javascript
window._wbHostSyncG = function(reason){
  if(_adventureStage !== 'worldboss') return;
  if(!window._wbConnectedHostMode) return;
  // 用 _wbWireUtils.GToWire(G) 生成完整 wire
  const wireG = window._wbWireUtils.GToWire(G);
  // 多塞 _activeSidePos,client 能正確還原 G.activeChar
  wireG._activeSidePos = { side: G.activeChar.side, pos: G.activeChar.pos };
  window._wbNet.hostPushBattleState({
    fullWireG: wireG,
    _syncReason: reason
    // 注意:hostPushBattleState 內部自動 flush _wbFxQueue → 特效跟著一起送
  });
};

// 200ms 防抖版本,給高頻呼叫點用(endAction、startTurn)
window._wbHostSyncGDebounced = (function(){
  let _timer = null, _lastReason = null;
  return function(reason){
    _lastReason = reason || 'debounced';
    if(_timer) return;
    _timer = setTimeout(function(){
      _timer = null;
      window._wbHostSyncG(_lastReason);
    }, 200);
  };
})();
```

#### 新增的 sync 呼叫點(讓 client 收得到推進)

| 位置 | 觸發時機 | reason |
| ---- | ---- | ---- |
| `index.html` 27573 (`endAction` 末尾) | 每次行動結束 | `'action-end-<actor>'` |
| `index.html` 28695 (`startTurn` 確定 next 後) | 新角色開始行動 | `'turn-start-<name>'` |

兩個呼叫都用 debounced 版本,避免一個動作觸發多次推送。

---

### 🛡 二、「實質單人」攔截判定(BUG 2 修補)

#### 問題回顧

老師建房間 + 用補位填自己 4 隻角色(實際上沒有隊友連進來),
但 `_wbSoloPracticeMode` **沒被設為 true**(那是「單人練習」按鈕專用旗標)。
結果 round 2 → `expectedSlot = (2-1)%4 = 1`,但老師 `mySlot = 0`,
`advSubmitAnswer` 攔截器把房主擋下,跳出「🚫 這題只能由第 2 號玩家回答」。

#### 修補設計

兩個位置都加「實質單人」(`_isVirtualSolo`)判定:

1. **`index.html` 30037** (BOSS 行動前題指派槽位)
2. **`index.html` 51208** (`advSubmitAnswer` 攔截器入口)

判定邏輯:從 `_wbNet.getSnapshot().players` 抓所有 player,
過濾掉「沒 uid / uid='__bot' / 'bot-*' / isBot=true / 名稱含補位|假人|練習用|bot」,
剩下的 unique uid set 大小 ≤ 1 → 視為單人 → 不攔截。

```javascript
const _realUids = new Set();
_snap.players.forEach(p => {
  if(!p || !p.uid || p.isBot || /補位|假人|練習用|bot/i.test(p.name||'')) return;
  if(/^bot[-_]/i.test(p.uid)) return;
  _realUids.add(p.uid);
});
const _isVirtualSolo = (_realUids.size <= 1);
```

實際單人 OR 實質單人都不設 `_wbAssignedQuizSlot`(留 null),攔截器看到 null 就放行。

---

### 💬 三、定型文氣泡三段尺寸設計(BUG 3 修補)

#### 問題回顧

`_wbShowCardBubble` 原本只有兩種模式:
- 答題期間 → 300% 大字 + 卡下方
- 其他時候 → 小字 + 卡上方

戰鬥行動中(`round 3` 行動期間)走小字+卡上方分支,
結果氣泡浮在角色卡頂端 → 看起來像浮在 BOSS 圖左上角 → 蓋住傷害飄字 → 老師不爽。

#### 修補設計(`world-boss.html` 8824 起)

改為三段尺寸:

| 模式 | 觸發條件 | 字體 | 顏色框 | 位置 | z-index |
| ---- | ---- | ---- | ---- | ---- | ---- |
| `quiz` | `_advQuizPhase==='asking'` 或 `_bossQuizInFlight` 或 `_wbAssignedQuizSlot` 有值 | **300%** | 黃框金光 | 卡底 +12px | 9999 |
| `battle` | `body.classList.contains('wb-in-worldboss-battle')` | **150%** | 紫框 | 卡底 +8px | 8500 |
| `normal` | 其他(隊伍頁、結算等) | 18px(原值) | 藍框 | 卡頂 -12px | 9999 |

關鍵設計:
- **戰鬥模式 150%**:夠大讓人看清楚,但不像 300% 那樣壓滿整個下半畫面
- **緊貼卡片 (+8px)**:看起來像從卡片冒出來,不會浮成「獨立 UI 元素」
- **`pointer-events:none`**:答題期間+戰鬥期間都加上,防止氣泡擋住玩家點題目按鈕/角色卡

#### 判定函式碼

```javascript
const _isQuizActive = ...; // 沿用 v3.3.3 三條件
const _isInWorldBossBattle = document.body.classList.contains('wb-in-worldboss-battle');
let _bubbleMode = _isQuizActive ? 'quiz'
                : _isInWorldBossBattle ? 'battle'
                : 'normal';
```

---

### 🎁 四、召喚機率表「稀有角色」desc 改寫

#### 問題

舊版列出固定 8 隻角色(大天狗 / 玉藻前 / 酒吞童子 / 巫女 / 窮奇 / 科技生化人 / 鋁合金暴龍 / 超鬼神王),
但實際 `SUMMON_RARE_HEROES` 已擴充至 20 隻(包含學霸轉學生、天神宙斯、水狐、米鈴等新角色),
desc 完全跟不上。老師選擇「不要列名單,改成抽象描述」,以後加新角色不用再改 desc。

#### 修補(`index.html` 60224)

```javascript
{ kind:'rare_hero', pct: 5,
  label:'⭐ 稀有角色',
  desc:'未收錄之稀有角色(全收錄時則轉化為超越極限果實 ×1)' },
```

---

## 📊 變更影響範圍

| 檔案 | 起始行數 | 結束行數 | 增加 |
| ---- | ---- | ---- | ---- |
| `index.html` | 75,060 | 75,212 | +152 |
| `world-boss.html` | 10,734 | 10,765 | +31 |

所有變更都標記 `★ v3.3.5 —` 註解,容易在未來追蹤。

---

## ⚠ 給未來 Claude 的重要提醒

### 1. **永遠先檢查「呼叫點 vs 定義點」**
v3.3.3 文檔說「Phase 3 安裝 `_wbHostSyncG`」是個謊言(或者規劃時忘了實作),
這次老師回報「卡死」+「傷害不同步」就是這個漏洞造成。
未來看到「if(typeof X === 'function') X()」這種「防禦式呼叫」,
**立刻 grep `X\s*=\s*function` 或 `window.X =`** 確認真的有定義,
別假設別人寫好了。

### 2. **`_wbSoloPracticeMode` ≠ 房內只有一人**
這個旗標只在「按單人練習按鈕」進入的路徑被設為 true。
「真實建房 + 補位填自己角色」**不會**設這個旗標 →
要用 `_wbNet.getSnapshot().players` 算實際真實 uid 數量,
才是正確的「實質單人」判定。

### 3. **氣泡尺寸要因情境而異,不能一律 300%**
答題期間 300% 沒問題(玩家需要看清楚隊友的建議答案),
戰鬥行動中 300% 太大會蓋住傷害飄字 +「下一位角色提示」+ 順序條,
所以分三段(quiz/battle/normal)是正確設計,別退回兩段。

### 4. **`SUMMON_RARE_HEROES` 已長到 20 隻+,desc 不要再列名單**
未來新增角色時:
- 加進 `SUMMON_RARE_HEROES` 陣列(line 60188)
- 加進對應的 `BOSS_NAMES` / `JAPAN_EXCLUSIVE_HEROES` 等清單
- desc **不用改**(v3.3.5 已改成抽象描述)

### 5. **`_wbHostSyncG` 不要再加在「BOSS 攻擊每段傷害後」**
雖然 client 視覺特效靠 `_wbFxQueue` 同步,
但如果每段傷害都 push 一次 G 會炸 Firestore 寫入頻率(免費額度撐不住)。
debounced 200ms 是正確設計,別把 debounce 去掉。

---

## 🧪 測試建議(老師實測時可確認的點)

### BUG 1 驗收
- 隊長行動完成後 client console 要看到:
  - `[_wbHostSyncG] ✅ pushed reason=action-end-XXX` (host 端)
  - `[WB-Client v6] 收到 schema battle(fullWireG / _schemaV6)` (client 端)
- 傷害數字、卡片閃光、粒子特效在 client 端也要看得到(因為 FX queue 跟著一起 sync 過去)
- 「現在是 XX 的 OO 回合」不再停 5+ 秒

### BUG 2 驗收
- 建房後不邀請隊友,直接補自己 4 隻角色開戰
- BOSS 行動前題的回合(round 2 = slot1、round 3 = slot 2 ... )都要能直接點答案
- console 要看到 `[WB-Quiz 攔截] 偵測到實質單人(真實玩家 1/4),不攔截答題`
- 不再跳出「🚫 這題只能由第 X 號玩家回答」紅色 toast

### BUG 3 驗收
- 答題期間(BOSS 行動前題出現時)發定型文 → 300% 大字 + 黃框金光 + 卡下方
- 戰鬥行動中發定型文 → 150% 中字 + 紫框 + 卡下方技能位置
- 戰鬥中傷害飄字應該在卡上方,定型文在卡下方,不再衝突

### 召喚機率表驗收
- 點召喚介面的「?」說明按鈕
- 「⭐ 稀有角色」那列 desc 應該顯示「未收錄之稀有角色(全收錄時則轉化為超越極限果實 ×1)」
- 不再列出 8 隻角色名單

---

## 📝 待辦(v3.3.6 候選)

- 老師可能還會發現更細的多人同步問題(例如 BOSS 中爆發特效、玩家用爆發時 client 端動畫)
- 若實測時 BUG 1 仍偶發,可考慮再加 sync 點到:
  - `doDmg` 之後(直接 push 變化的 hero HP)
  - `_wbOnQuizCorrect` 立刻 sync(不等 debounce)
- 若 Firestore 寫入頻率太高(>1 寫/秒)被限流,debounce 從 200ms 拉長到 400ms

---

**結束 v25。下一份命名為 `世界BOSS戰大改動_記憶傳承_v26.md`,涵蓋 v3.3.6 起的變更。**
