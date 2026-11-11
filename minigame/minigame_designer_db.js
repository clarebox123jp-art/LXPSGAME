/* ══════════════════════════════════════════════════════════════════════════
 * 🎨 遊戲美術設計師 資料檔 minigame_designer_db.js(ES5 only)
 * 由 minigame_index.html?mode=designer 直入時才載入。引擎在 minigame_designer.js。
 * 設計書:claude/遊戲美術設計師_設計書.md v0.2;交接:claude/遊戲美術設計師_MEMORY_HANDOFF.md
 * ★ v1.0.0(2026-11-07・老師「依建議」)第一階段:素材組合設計器(角色皮膚/荒島裝飾)+上傳給 GM+智慧審核+老師未通過清單/人工放行+GM 倉庫審核上架+每月 1 件
 * ══════════════════════════════════════════════════════════════════════════ */
(function(){
'use strict';
var D = window.DSG_DB = {};
D.VER = 'v1.1.2';   /* ★ v1.1.2(2026-11-11)HOWTO.editor 加電腦快捷鍵一條 */ void 'v1.1.0';   /* ★ v1.1.0(2026-11-10)HOWTO.tools 新工具說明 */ void 'v1.0.0';
/* 讀不到雲端 gameConfig/designerAccess、也沒有本機快取時的預設:只有 GM 進得去 */
D.OPEN = false;
D.GM_EMAILS = ['clarebox123@gmail.com', 'clarebox123@lsps.tp.edu.tw', 'asemia@gmail.com'];
D.MONTH_LIMIT = 1;   /* 老師裁定 6 甲:皮膚與荒島裝飾合計每月 1 件 ⇒ ★ v1.1.0(2026-11-10 18:46 老師)改成分開:角色皮膚每月 1 件、荒島裝飾每月 1 件(designSubmit/{月}_{uid}_{skin|deco}) */
D.TEXT_MAX = 8;      /* 裁定 8:文字貼片最多 8 字 */
D.DRAFT_MAX = 8;     /* 每人本機草稿上限 */
/* ★ 老師補充(2026-11-07 13:29):基本品質門檻 — 達標才能繳交,沒達到會清楚告訴學生差在哪裡(GM 老師台可改,存 gameConfig/designerAccess.q)
   ops   至少操作次數(★ v1.0.2 老師 2026-11-08:只算「增加、變色」的動作——放素材/文字/形狀、畫一筆、像素點/填色、複製、選人物部件、換顏色(部件色相/形狀填色外框/文字色/色相亮度滑桿);改完的畫面要跟原本不一樣、出現過的畫面不重複算;拖曳/縮放/旋轉/往前往後/透明度/粗細不算)
   bbox  圖案範圍:不透明像素的外框面積 ÷ 畫布面積(實測:只放人物 0.36、人物+武器+寵物 0.90、三件裝飾 0.87)
   fill  實際上色比例(不透明像素 ÷ 畫布;實測人物+武器+寵物 0.31、裝飾 0.43~0.46)
   colors 顏色數:12 色相+5 階灰,佔畫面 1% 以上才算一種(實測只放人物 4、換西裝 6、加武器寵物 8) */
D.QUALITY = { skin: { ops: 100, bbox: 0.70, fill: 0.25, colors: 6 }, deco: { ops: 100, bbox: 0.70, fill: 0.35, colors: 6 } };
D.CLOUD_BACKUP_MS = 5 * 60 * 1000;   /* 老師:作品進度預設存本機,每 5 分鐘上傳雲端備份一次 */

/* 兩種作品:畫布尺寸 = 主角素材原始尺寸(504×720),套件零件不用縮放就對齊 */
D.KINDS = {
  /* ★ v1.0.3(2026-11-08 11:03・老師「設計師以繪畫為主…改成手繪原創,現在都是替換和拼湊的概念,不是我要的原創性」)入口簡介改成手繪原創 */
  skin: { n: '角色皮膚', e: '🦸', W: 504, H: 720, d: { c: '用畫筆從一張白紙開始,畫出你自己創造的角色!可以打開「🦴 動作骨架」拖關節擺出 3D 姿勢,再照著畫。', p: '以畫筆手繪原創角色;可開啟 3D 關節骨架調整姿勢,作為比例參考(骨架不會出現在作品裡)。' } },
  deco: { n: '荒島裝飾', e: '🏝', W: 512, H: 512, d: { c: '用畫筆畫出你自己設計的營地裝飾!「🖼 參考圖片」只能看著練習,不會放進作品裡。', p: '以畫筆手繪原創營地裝飾;參考圖片僅供觀察描繪,不會出現在作品中。' } }
};
D.BT = [ { id: 'boy', n: '少年' }, { id: 'girl', n: '少女' }, { id: 'kidboy', n: '小男孩' }, { id: 'kidgirl', n: '小女孩' } ];

/* 人物部件(對齊底座,不用拖):依檔名規則分類;畫的順序 = 陣列順序 */
D.SLOTS = [
  { id: 'full',    n: '整套造型', e: '🧍', d: '整個人(含頭髮)一次換好' },
  { id: 'btm',     n: '褲子',     e: '👖' },
  { id: 'body',    n: '服裝',     e: '👕' },
  { id: 'eye',     n: '眼睛',     e: '👀' },
  { id: 'head',    n: '頭部造型', e: '🙂', d: '臉+髮型一起換' },
  { id: 'hair',    n: '髮型',     e: '💇' },
  { id: 'ear',     n: '耳朵',     e: '👂' },
  { id: 'glasses', n: '眼鏡',     e: '👓' }
];
/* 檔名 → 部件分類(bt = 體型)。回傳 null = 不屬於這個體型的對齊部件 */
D.slotOf = function(f, bt){
  var m;
  if(f === 'body_' + bt) return 'base';
  if(new RegExp('^fullbody_[a-z]+_' + bt + '$').test(f) || new RegExp('^' + bt + '_[a-z0-9]+_full$').test(f)) return 'full';
  if(new RegExp('^btm_[a-z]+_' + bt + '$').test(f)) return 'btm';
  if(new RegExp('^' + bt + '_[a-z0-9]+_body$').test(f) || new RegExp('^bodyfull_[a-z]+_' + bt + '$').test(f)) return 'body';
  if(new RegExp('^eye_[a-z]+_' + bt + '$').test(f)) return 'eye';
  if(new RegExp('^' + bt + '_[a-z0-9]+_head$').test(f) || new RegExp('^headfull_[a-z]+_' + bt + '$').test(f)) return 'head';
  if(new RegExp('^hair_[a-z]+_' + bt + '$').test(f)) return 'hair';
  if(new RegExp('^ear_[a-z]+_' + bt + '$').test(f)) return 'ear';
  if(new RegExp('^glasses_[a-z]+_' + bt + '$').test(f)) return 'glasses';
  m = null; return m;
};
/* 檔名裡的風格字 → 中文(顯示用) */
D.AV_WORD = { suit: '西裝', kimono: '浴衣', uniform: '制服', heavysword: '重劍士', redmage: '紅袍法師', dress: '洋裝', dualblade: '雙刀客', purplemage: '紫袍法師',
  rapier: '細劍士', greatsword: '大劍士', greenmage: '綠袍法師', overalls: '吊帶褲', watermage: '水法師', aquamage: '水法師', fancyrapier: '華麗細劍', flamemage: '火焰法師',
  forestmage: '森林法師', lightgreatsword: '光之大劍', thundermage: '雷法師', jeans: '牛仔褲', elf: '精靈', cool: '酷酷', gentle: '溫柔', proud: '自信', sly: '調皮', smile: '笑咪咪',
  soft: '柔和', black: '黑框', shaggy: '蓬鬆', braid: '辮子', closedeyes: '瞇眼', elfcurl: '精靈捲', glasses: '眼鏡', longstraight: '長直髮', longwavy: '長波浪', ponytail: '馬尾',
  ponytail2: '高馬尾', sideponytail: '側馬尾', twintail: '雙馬尾', wavybob: '波浪短髮', spiky: '刺刺頭', curlybob: '捲捲短髮', elfwavy: '精靈波浪', hime: '公主切',
  bigtail: '大馬尾', bob: '鮑伯頭', braids: '麻花辮', curl: '捲髮', long: '長髮', lowtail: '低馬尾', medium: '中長髮', mid: '中短髮', mushroom: '香菇頭', pony: '馬尾',
  princess: '公主頭', short: '短髮', sidepart: '旁分', slick: '油頭', twin: '雙辮', xlong: '超長髮',
  src02: '款式二', src03: '款式三', src04: '款式四', src05: '款式五', src06: '款式六', src07: '款式七', src08: '款式八', src09: '款式九' };
/* 自由擺放的配件(不分體型):帽子、面具、眼鏡、嘴飾 */
D.FREE_AV = [ { re: /^hat_/, n: '帽子', e: '🎩' }, { re: /^mask_/, n: '動物面具', e: '🎭' }, { re: /^gls_/, n: '眼鏡配件', e: '🕶' }, { re: /^macc_/, n: '嘴邊小物', e: '🍃' } ];
D.HAT_WORD = { baseball: '棒球帽', beanie: '毛線帽', beret: '貝雷帽', boater: '草編禮帽', bucket: '漁夫帽', cadet: '軍官帽', fedora: '紳士帽', newsboy: '報童帽', straw: '草帽', witch: '魔法帽',
  clover: '幸運草', grass: '小草', leaf: '葉子', lolly: '棒棒糖', maskb: '黑口罩', maskw: '白口罩', paci: '奶嘴', sakura: '櫻花', toast: '吐司',
  bold: '粗框', bold_clear: '粗框(透明)', browblack: '黑眉框', browblack_clear: '黑眉框(透明)', browgold: '金眉框', browgold_clear: '金眉框(透明)', monocle: '單片眼鏡', monocle_clear: '單片(透明)',
  red: '紅框', red_clear: '紅框(透明)', rimless: '無框', rimless_clear: '無框(透明)', roundblack: '黑圓框', roundblack_clear: '黑圓框(透明)', roundgold: '金圓框', roundgold_clear: '金圓框(透明)',
  slim: '細框', slim_clear: '細框(透明)', sun: '太陽眼鏡' };

/* 素材庫分頁(左欄)。src:'av' = 主程式 avatar_parts/;'isl' = 小遊戲 img/island_*.png */
/* ★ v1.0.3(2026-11-08 11:03・老師)①角色皮膚只留畫筆+人物動作骨架(移除人物/武器/寵物/配件/飾品)②荒島裝飾的裝飾/動物/小物/工具收合到「參考圖片」③兩個介面都以畫筆為預設(第一個分頁=開啟時的分頁)。
   文字貼片保留(招牌/旗幟/服裝/刻字規範不變)。舊草稿裡已經放的素材照樣顯示、可以移動或刪除,只是不能再新增。 */
D.TABS = {
  skin: [ { id: 'paint', n: '畫筆', e: '🖌' }, { id: 'pose', n: '動作骨架', e: '🦴' }, { id: 'text', n: '文字貼片', e: '🔤' } ],
  deco: [ { id: 'paint', n: '畫筆', e: '🖌' }, { id: 'ref', n: '參考圖片', e: '🖼' }, { id: 'text', n: '文字貼片', e: '🔤' } ]
};
/* 🖼 參考圖片(荒島裝飾):四組收合,點一張 = 放到畫布下面當半透明描圖參考(不會進作品、不算操作次數) */
D.REF_GROUPS = [ { id: 'deco', n: '裝飾', e: '🪴', lib: 'LIB_DECO' }, { id: 'pet', n: '動物', e: '🐾', lib: 'LIB_PET' }, { id: 'item', n: '小物', e: '💎', lib: 'LIB_ACC' }, { id: 'wp', n: '工具', e: '🔨', lib: 'LIB_WP' } ];
/* 🦴 人物動作骨架(角色皮膚):座標是畫布寬高的比例(0~1);畫布 504×720。只當描圖參考,不會進作品、不算操作次數。(v1.0.5 起是 3D 關節人偶的起手範本)
   關節:頭 h、頸 n、肩 ls/rs、肘 le/re、手 lh/rh、腰 p、髖 lp/rp、膝 lk/rk、腳 lf/rf(l = 畫面左邊) */
D.POSES = [
  { id: 'stand', n: '站好', e: '🧍', j: { h: [.50, .14], n: [.50, .23], ls: [.38, .27], rs: [.62, .27], le: [.34, .42], re: [.66, .42], lh: [.32, .56], rh: [.68, .56], p: [.50, .52], lp: [.42, .55], rp: [.58, .55], lk: [.41, .73], rk: [.59, .73], lf: [.40, .92], rf: [.60, .92] } },
  { id: 'wave', n: '揮手', e: '👋', j: { h: [.50, .14], n: [.50, .23], ls: [.38, .27], rs: [.62, .27], le: [.34, .42], re: [.74, .18], lh: [.32, .56], rh: [.80, .06], p: [.50, .52], lp: [.42, .55], rp: [.58, .55], lk: [.41, .73], rk: [.59, .73], lf: [.40, .92], rf: [.60, .92] } },
  { id: 'walk', n: '走路', e: '🚶', j: { h: [.50, .14], n: [.50, .23], ls: [.39, .27], rs: [.61, .27], le: [.44, .41], re: [.58, .42], lh: [.52, .53], rh: [.50, .55], p: [.50, .52], lp: [.45, .55], rp: [.55, .55], lk: [.38, .72], rk: [.60, .73], lf: [.30, .91], rf: [.64, .92] } },
  { id: 'run', n: '奔跑', e: '🏃', j: { h: [.54, .14], n: [.52, .23], ls: [.42, .27], rs: [.62, .28], le: [.32, .36], re: [.70, .40], lh: [.36, .48], rh: [.62, .50], p: [.48, .51], lp: [.44, .54], rp: [.52, .55], lk: [.30, .66], rk: [.66, .70], lf: [.22, .82], rf: [.60, .92] } },
  { id: 'jump', n: '跳躍', e: '🤸', j: { h: [.50, .12], n: [.50, .21], ls: [.38, .25], rs: [.62, .25], le: [.26, .14], re: [.74, .14], lh: [.20, .04], rh: [.80, .04], p: [.50, .48], lp: [.42, .51], rp: [.58, .51], lk: [.32, .64], rk: [.68, .64], lf: [.36, .80], rf: [.64, .80] } },
  { id: 'sword', n: '拿武器', e: '⚔', j: { h: [.48, .14], n: [.48, .23], ls: [.37, .27], rs: [.60, .27], le: [.30, .40], re: [.70, .37], lh: [.34, .52], rh: [.76, .30], p: [.48, .52], lp: [.40, .55], rp: [.56, .55], lk: [.34, .72], rk: [.62, .72], lf: [.28, .92], rf: [.68, .92] } },
  { id: 'sit', n: '坐著', e: '🪑', j: { h: [.50, .24], n: [.50, .33], ls: [.38, .37], rs: [.62, .37], le: [.33, .50], re: [.67, .50], lh: [.40, .60], rh: [.60, .60], p: [.50, .62], lp: [.42, .65], rp: [.58, .65], lk: [.36, .68], rk: [.64, .68], lf: [.36, .90], rf: [.64, .90] } }
];
D.POSE_BONES = [ ['n', 'p'], ['ls', 'rs'], ['ls', 'le'], ['le', 'lh'], ['rs', 're'], ['re', 'rh'], ['lp', 'rp'], ['lp', 'lk'], ['lk', 'lf'], ['rp', 'rk'], ['rk', 'rf'], ['h', 'n'] ];
/* ★ v1.0.5(2026-11-08 13:06・老師「骨架改成有關節,可以 3D 拖曳調整人物姿勢」)
   上面 7 種姿勢改當「起手範本」:載入時以「站好」量出每根骨頭長度,畫面上變短的骨頭 = 朝鏡頭方向伸出(推回深度 z),之後學生可自由拖關節、轉視角。
   POSE_PAR = 關節的上一節(腰 p 是根);POSE_ZB = 範本裡「往後伸」的關節(其餘預設往前)。 */
/* ★ 13:19 老師「脊椎增加 3 個關節」:腰 p → s1 腰椎 → s2 胸椎下 → s3 胸椎上 → 頸 n(範本沒有就在腰與頸之間平均補上)。
   ★ 13:19「頭部把眼睛鼻子用十字線定位」:fc = 臉的方向點(頭 h 的下一節,長度 = 頭半徑,在頭球表面正前方;拖它 = 轉頭/抬頭/低頭)。 */
D.POSE_PAR = { s1: 'p', s2: 's1', s3: 's2', n: 's3', h: 'n', fc: 'h', ls: 'n', rs: 'n', le: 'ls', re: 'rs', lh: 'le', rh: 're', lp: 'p', rp: 'p', lk: 'lp', rk: 'rp', lf: 'lk', rf: 'rk' };
D.POSE_ORD = ['p', 's1', 's2', 's3', 'n', 'h', 'fc', 'ls', 'le', 'lh', 'rs', 're', 'rh', 'lp', 'lk', 'lf', 'rp', 'rk', 'rf'];
D.POSE_BONES3 = [ ['p', 's1'], ['s1', 's2'], ['s2', 's3'], ['s3', 'n'], ['ls', 'rs'], ['ls', 'le'], ['le', 'lh'], ['rs', 're'], ['re', 'rh'], ['lp', 'rp'], ['lp', 'lk'], ['lk', 'lf'], ['rp', 'rk'], ['rk', 'rf'], ['h', 'n'] ];
D.POSE_MINE_MAX = 20;   /* 我的姿勢最多存幾個 */
D.POSE_JN = { p: '✥ 整個人', s1: '腰椎', s2: '胸椎(下)', s3: '胸椎(上)', n: '脖子', h: '頭頂', fc: '臉(鼻子)', ls: '肩膀', rs: '肩膀', le: '手肘', re: '手肘', lh: '手', rh: '手', lp: '髖', rp: '髖', lk: '膝蓋', rk: '膝蓋', lf: '腳', rf: '腳' };
D.POSE_ZB = { run: { lf: 1, rh: 1 }, walk: { lh: 1 } };
D.POSE_VIEWS = [ { id: 'front', n: '正面', e: '⬆', y: 0, p: 0 }, { id: 'q', n: '斜側', e: '↗', y: 35, p: -8 }, { id: 'side', n: '側面', e: '➡', y: 90, p: 0 }, { id: 'back', n: '背面', e: '⬇', y: 180, p: 0 }, { id: 'top', n: '從上往下看', e: '🔽', y: 20, p: -45 } ];

/* 🔤 文字貼片:只有這四種位置可以有字(老師補充:圖上不可寫說明文字,招牌/旗幟/服裝/刻字可以) */
D.TEXT_KINDS = [
  { id: 'sign',    n: '招牌',     e: '🪧', bg: '#8a5a2b', bd: '#5b3a1a', fg: '#fff6e0', pad: 0.35, r: 0.18 },
  { id: 'flag',    n: '旗幟',     e: '🚩', bg: '#d8443c', bd: '#8c2420', fg: '#ffffff', pad: 0.4, r: 0.05 },
  { id: 'shirt',   n: '服裝印字', e: '👕', bg: '', bd: '', fg: '#ffffff', st: '#222222', pad: 0.1, r: 0 },
  { id: 'engrave', n: '武器刻字', e: '⚔️', bg: '', bd: '', fg: '#ffe58a', st: '#5a3a00', pad: 0.1, r: 0 }
];
D.FONTS = [
  { id: 'hei',  n: '黑體', css: '"PingFang TC","Microsoft JhengHei","Noto Sans TC",sans-serif', w: 900 },
  { id: 'ming', n: '明體', css: '"Songti TC","PMingLiU","Noto Serif TC",serif', w: 700 },
  { id: 'kai',  n: '楷體', css: '"Kaiti TC","BiauKai","DFKai-SB","STKaiti",serif', w: 700 },
  { id: 'round', n: '圓圓', css: '"Yuanti TC","Arial Rounded MT Bold","PingFang TC",sans-serif', w: 900 },
  { id: 'mono', n: '方塊', css: '"Courier New",monospace', w: 900 },
  { id: 'hand', n: '手寫', css: '"Chalkboard SE","Comic Sans MS","PingFang TC",cursive', w: 700 }
];
D.PAINT_COLORS = ['#1b1b1b', '#ffffff', '#e63b3b', '#ff8a2a', '#ffd23f', '#5fbf3a', '#2aa7a0', '#2f6fdf', '#7a4fd6', '#ff6fb1', '#8a5a2b', '#9a9a9a'];

/* 作品名:從選項組合(比照創藝畫廊,不開放自由輸入) */
D.TITLE_A = ['勇敢的', '神秘的', '閃亮的', '溫柔的', '熱血的', '森林的', '海洋的', '星空的', '火焰的', '冰雪的', '彩虹的', '古老的', '可愛的', '帥氣的', '快樂的', '安靜的'];
D.TITLE_B = { skin: ['冒險家', '劍士', '魔法師', '弓箭手', '守護者', '旅行者', '騎士', '探險隊長', '小英雄', '島民', '學者', '藝術家'],
              deco: ['小屋', '花園', '攤位', '噴泉', '燈塔', '秘密基地', '展示台', '休息區', '拱門', '遊樂場', '小舞台', '溫室'] };

/* ══ 規範(上傳前提醒卡;雙版本 c 簡單風 / p 精緻風,鐵律 1.232) ══ */
D.RULES = [
  { e: '🩸', n: '血腥',     c: '流血、受傷的畫面',           p: '血腥或傷口特寫' },
  { e: '👊', n: '暴力',     c: '打人、欺負人、殺害的畫面',     p: '傷害、霸凌、殺戮等暴力情節' },
  { e: '🔞', n: '色情',     c: '不適合小朋友看的親密畫面',     p: '任何性暗示或色情內容' },
  { e: '🙈', n: '裸露',     c: '沒穿衣服、露出隱私部位',       p: '裸露身體或隱私部位' },
  { e: '😝', n: '嘲笑別人', c: '取笑同學、醜化別人、寫別人名字', p: '嘲諷、醜化特定人物或寫出他人姓名' }
];
D.RULE_TEXT = { c: '圖上不可以寫說明文字(像「這是我」、箭頭加說明、作者名字)。招牌、旗幟、衣服、武器上的字只能用「🔤 文字貼片」放,而且要有禮貌。',
                p: '作品中不得出現說明性文字;裝飾性文字僅限以「🔤 文字貼片」放在招牌、旗幟、服裝或武器上,且須符合善良風俗(任何語言)。' };

/* ══ 智慧審核 ══
   圖像:Google Cloud Vision SafeSearch(adult/violence/racy/medical/spoof)+ TEXT_DETECTION(文字辨識)。
   門檻:任何一項達 LIKELY 以上 = 不通過;adult/violence/racy 達 POSSIBLE 也不通過(標「疑似」)。GM 可在老師台調。 */
D.VLEVEL = { UNKNOWN: 0, VERY_UNLIKELY: 1, UNLIKELY: 2, POSSIBLE: 3, LIKELY: 4, VERY_LIKELY: 5 };
D.VCAT = { adult: '色情', violence: '暴力', racy: '裸露/煽情', medical: '血腥', spoof: '惡搞/嘲諷' };
D.VTH_DEF = { adult: 3, violence: 3, racy: 3, medical: 4, spoof: 4 };

/* 不雅字詞基本庫(任何語言)。比對前會先正規化:全形→半形、大寫→小寫、簡→繁(常用字)、去掉空白與符號。
   CJK/假名/諺文/注音:子字串比對;拉丁字母與數字:整個單字比對(避免 class、skill 這類誤判)。
   老師可在老師台「⚙ 設定」加字(gameConfig/designerWords),也會自動加入名冊裡全校同學的全名。 */
D.WORDS_CJK = ['幹你', '幹妳', '幹他', '幹她', '靠北', '靠杯', '靠夭', '機掰', '雞掰', '機歪', '雞歪', '白痴', '白癡', '智障', '低能', '腦殘', '弱智', '去死', '找死', '該死', '死胖子', '肥豬', '豬頭',
  '醜八怪', '醜女', '醜男', '垃圾人', '廢物', '人渣', '賤人', '婊', '妓', '屌', '屄', '屎', '尿尿', '大便臉', '操你', '操妳', '他媽', '他馬', '你媽', '妳媽', '媽的', '媽逼', '三小', '殺小',
  '幹林', '幹拎', '幹恁', '淫', '色狼', '變態', '裸體', '脫光', '奶子', '胸部', '屁眼', '雞雞', '陰莖', '陰道', '性交', '做愛', '殺人', '殺死', '砍死', '打死', '血流', '自殺', '跳樓', '上吊',
  '滾開', '閉嘴', '笨蛋', '蠢', '呆子', '傻子', '傻瓜', '神經病', '瘋子', '土包子', '魯蛇', '矮冬瓜', '黑鬼', '支那', '台巴子', '阿督仔',
  'ㄍㄋㄋ', 'ㄍㄢ', 'ㄋㄋ', 'ㄐㄅ', 'ㄎㄅ', 'ㄙㄒㄠ', 'ㄅㄔ',
  'ばか', 'バカ', '馬鹿', 'あほ', 'アホ', 'しね', 'シネ', '死ね', 'くそ', 'クソ', 'ぶす', 'ブス', 'ちんこ', 'チンコ', 'まんこ', 'マンコ', 'きもい', 'キモい', 'キモイ', 'うざい', 'ウザい',
  '시발', '씨발', '병신', '개새끼', '바보', '미친', '좆', '썅', '꺼져', '죽어'];
D.WORDS_LATIN = ['fuck', 'fck', 'fuk', 'shit', 'sht', 'bitch', 'btch', 'ass', 'asshole', 'dick', 'cock', 'pussy', 'cunt', 'bastard', 'damn', 'stupid', 'idiot', 'dumb', 'loser', 'ugly', 'fatty', 'fat',
  'kill', 'die', 'dead', 'sex', 'sexy', 'porn', 'nude', 'naked', 'penis', 'vagina', 'boobs', 'boob', 'nigger', 'nigga', 'retard', 'moron', 'wtf', 'stfu', 'gtfo', 'kys', 'fu',
  'gan', 'ganni', 'ganlinniang', 'kaobei', 'kaobe', 'jibai', 'chibai', 'sb', 'tmd', 'nmsl', 'cnm', 'baka', 'aho', 'kuso', 'busu',
  '87', '978', '69', '4ni'];
/* 常用簡體 → 繁體(只收不雅字詞會用到的字,讓「白痴/白癡、妈的」等都比得到) */
D.S2T = { '妈': '媽', '死': '死', '杀': '殺', '脑': '腦', '残': '殘', '贱': '賤', '鸡': '雞', '机': '機', '蠢': '蠢', '丑': '醜', '变': '變', '态': '態', '脱': '脫', '光': '光', '肥': '肥', '猪': '豬',
  '头': '頭', '废': '廢', '渣': '渣', '神': '神', '经': '經', '病': '病', '疯': '瘋', '滚': '滾', '闭': '閉', '嘴': '嘴', '笨': '笨', '蛋': '蛋', '傻': '傻', '瓜': '瓜', '弱': '弱', '智': '智',
  '障': '障', '低': '低', '能': '能', '尸': '屍', '卖': '賣', '骂': '罵', '恶': '惡', '妓': '妓', '婊': '婊', '淫': '淫', '狼': '狼', '体': '體', '裸': '裸', '阴': '陰', '茎': '莖', '道': '道',
  '爱': '愛', '跳': '跳', '楼': '樓', '吊': '吊', '杀人': '殺人', '鬼': '鬼', '们': '們', '这': '這', '个': '個', '么': '麼', '说': '說', '话': '話', '让': '讓', '对': '對', '为': '為' };

/* 老師退回理由貼紙 */
D.BACK_REASONS = ['主題不適合', '還沒完成', '看不清楚', '不符合規範', '和別人的作品太像', '請找老師聊聊'];
/* GM 上架:稀有度預設價格(大對抗知識幣 / 荒島貝幣),老師可改 */
D.PRICE = { 1: { coin: 3000, shell: 150 }, 2: { coin: 8000, shell: 400 }, 3: { coin: 20000, shell: 1000 } };

/* 說明(❓ 怎麼玩;雙版本) */
D.HOWTO = {
  /* ★ v1.1.0(2026-11-10)新工具說明:7 種畫筆、油漆桶、長按變形狀、剪刀、變形、圖層、選色器 */
  tools: { c: ['✍️ 畫筆有 7 種:鉛筆、水彩、蠟筆、毛筆(畫快變細、畫慢變粗)、圓頭麥克筆、平頭麥克筆、向量筆(放開後變成可以再改顏色粗細的向量線條)。',
              '🪣 油漆桶:選 🪣 點一下要填色的地方;或按住右邊的顏色,拖到線條圍起來的地方放開就填滿。拖到畫布上停住不動會先預覽,左右滑動調「臨界值」(越大填越多)。線條有缺口會整張填滿,記得把線接好。',
              '📐 變成形狀:畫完一筆,筆先不要拿起來,停 2 秒(會出現倒數圈)就變成工整的直線、圓、三角形、長方形……(向量形狀,放在物件層);還沒放開前拖一拖可以調大小。',
              '✂️ 剪刀:把想搬走的地方圈起來,就從目前的圖層剪下來;拖它移動,拖到右邊的圖層上放開 = 放進那個圖層。⤡ 變形:把整個圖層放大縮小、旋轉、翻面,「扭曲」可以單獨拉每個角。好了按 ✅,反悔按 ✖。',
              '📚 圖層在右邊:👁 顯示/隱藏、✏️ 改名字、▲▼ 調上下、⋯ 打開透明度/參照/阿爾法鎖定。「🔷 物件層」放文字貼片和向量形狀。',
              '🎨 選色器:外面的圓環轉顏色,中間三角形選深淺和鮮豔。'],
           p: ['畫筆 7 種:鉛筆、水彩、蠟筆、毛筆(速度影響粗細)、圓頭麥克筆、平頭麥克筆、向量筆(筆畫轉為可編輯的向量曲線)。',
              '油漆桶:點擊填色,或將右側色票拖曳至封閉區域;拖曳後停留可預覽並左右滑動調整臨界值。',
              '自動形狀:筆畫結束停留 2 秒即轉為向量幾何形狀(位於物件層),放開前可拖曳調整。',
              '剪刀:圈選範圍自目前圖層剪下,可拖曳移動或拖至右側圖層放入。變形:整個圖層縮放、旋轉、翻轉、扭曲。按 ✅ 完成、✖ 取消。',
              '圖層位於右側:顯示/隱藏、重新命名、調整順序;「⋯」可設定透明度、參照、阿爾法鎖定。物件層放置文字貼片與向量形狀。',
              '選色器:外環選色相,內三角形選明度與彩度。'] },
  hub: { c: ['選「🦸 角色皮膚」或「🏝 荒島裝飾」開始設計。作品會自動存在這台平板,每 5 分鐘備份到雲端;也可以隨時按 💾 存檔。', '做好了按「📤 確認繳交」:要先達到基本標準(操作 100 次以上、圖案夠大、顏色夠多),電腦會告訴你還差什麼。', '繳交後作品就鎖住不能改了;如果老師退件,會寫建議給你,你照建議改好再繳交。老師通過就變成遊戲裡的商品!', '每個人每個月可以繳交 🦸 角色皮膚 1 件、🏝 荒島裝飾 1 件,每月 1 日早上 8 點換新的月份。', '繳交時電腦會先檢查內容;沒通過的話請找老師看,老師同意就能繳交。'],
         p: ['選擇「角色皮膚」或「荒島裝飾」開始創作;進度自動存於本機,每 5 分鐘備份至雲端,亦可隨時手動存檔。', '完成後按「確認繳交」;須先達基本標準(操作 100 次以上、圖案範圍、色彩數量),系統會列出未達項目。', '繳交後作品即鎖定;若老師退件並附修改建議,方可繼續修改後再次繳交。審核通過即正式成為遊戲商品。', '每人每月限繳交角色皮膚 1 件、荒島裝飾 1 件,每月 1 日 08:00 重置。', '繳交時系統先進行智慧審核;未通過者請向老師確認,老師核可後即可繳交。'] },
  /* ★ v1.0.3 改成手繪原創的說明 */
  editor: { c: ['🖌 一打開就是畫筆:從白紙開始,用自己的手畫出原創作品。可以換筆刷、顏色、粗細,也有像素筆和形狀。', '🦸 角色皮膚:打開「🦴 動作骨架」,先選一個起手姿勢,再拖拉關節(頭、脊椎、肩、手肘、手、髖、膝蓋、腳)彎出你要的動作,拖鼻子的紅點轉頭;拖空白地方可以把 3D 人偶轉一圈看,也能拉近拉遠。擺好可以取名字存成「我的姿勢」。骨架不會出現在作品裡。', '🏝 荒島裝飾:「🖼 參考圖片」可以把荒島的東西放在畫布下面當描圖參考,看著練習;參考圖片不會放進作品裡。', '🔤 文字貼片:招牌、旗幟、衣服、武器上的字只能用這個放;不要在圖上寫說明文字喔。', '只有「畫上去、加上去、換顏色」才算操作次數,而且要跟原本不一樣。', '記得按 💾 存檔;按「🔙 回工作室」時會請你幫作品取名字。做好了按 📤 上傳給老師。', '🔍 想畫細一點:兩根手指(食指和拇指)在畫布上張開=放大、捏起來=縮小,兩指一起移動可以挪畫布;電腦用滑鼠滾輪。按左上角的「🔍 百分比」回到原本大小。', '◧ 按上方「面板」可以把兩邊(直的拿時是下面)的面板收起來,畫畫的地方會變大;再按一次就打開。平板和手機直的拿也可以畫。', '⌨ 電腦快捷鍵:Ctrl+Z 復原、Ctrl+Y 重做;按住空白鍵,游標會變成 ✋ 手掌,這時候拖曳就能移動畫布。'],
            p: ['開啟即為畫筆:以手繪方式從空白畫布創作原創作品,可切換筆刷、色彩、粗細、像素筆與形狀。', '角色皮膚:「動作骨架」為 3D 關節人偶,可拖曳各關節(含脊椎三節與頭部面向)調整姿勢、拖曳空白處旋轉視角並可拉近拉遠,姿勢可命名儲存;骨架作為姿勢與比例參考,不會出現在作品中。', '荒島裝飾:「參考圖片」可置於畫布下方作為描繪參考,不會納入作品。', '裝飾性文字請使用「文字貼片」;請勿書寫說明性文字。', '操作次數僅計算新增與變色,且須與原狀態不同。', '返回工作室時需為作品命名;完成後存檔並「上傳給老師」。', '畫布縮放:雙指張開/捏合可放大縮小、雙指平移可移動畫布;電腦可用滑鼠滾輪。點左上角縮放比例即回復原尺寸。', '「◧ 面板」可收合工具面板以擴大繪圖區;支援平板與手機直式繪圖。', '電腦快捷鍵:Ctrl+Z 復原、Ctrl+Y(或 Ctrl+Shift+Z)重做;按住空白鍵游標轉為手掌,拖曳即可平移畫布。'] }
};
})();
(function(){ var D = window.DSG_DB;

/* ── 素材清單(2026-11-07 依 repo asset_manifest.json 與 minigame_island_db.js 自動產生;檔案都已在 repo,零新增) ── */
D.LIB_DECO = [['deco_pot','盆栽'],['deco_fence','小柵欄'],['deco_lamp','路燈'],['deco_rug','地毯'],['deco_chime','貝殼風鈴'],['deco_flower','花圃'],['deco_table','桌椅'],['deco_bed','床'],['deco_statue','貝殼雕像'],['deco_koinobori','鯉魚旗'],['deco_mirror','貝殼鏡'],['deco_vase','古代花瓶'],['deco_r_ash','火山灰田'],['deco_r_ice','冰封水晶'],['deco_r_wetland','濕地蘆葦'],['deco_r_crystal','地心水晶'],['deco_r_buoy','浮球風鈴'],['deco_r_woodpile','柴堆'],['deco_r_sapling','樟樹苗'],['deco_r_lumber','木材堆'],['deco_r_petbed','動物窩'],['deco_r_banner','守護旗'],['deco_r_stonelamp','火山石燈'],['deco_r_elamp','電燈'],['deco_cabin','小木屋'],['deco_pool','石砌水池'],['deco_fountain','貝殼噴泉'],['deco_lotuspond','荷花池'],['deco_well','古井'],['deco_swing','樹下鞦韆'],['deco_hammock','吊床'],['deco_stonepath','石板步道'],['deco_woodbridge','小木橋'],['deco_mailbox','木頭信箱'],['deco_scarecrow','稻草人'],['deco_birdhouse','鳥屋'],['deco_logseat','圓木椅'],['deco_palm','椰子樹'],['deco_bamboo','竹叢'],['deco_lights','貝殼串燈'],['deco_sundial','日晷'],['deco_windmill','小風車'],['deco_flowerarch','花拱門'],['deco_sandcastle','沙堡'],['deco_picnic','野餐墊'],['deco_telescope','天文望遠鏡'],['deco_sofa','藤編沙發'],['deco_bookshelf','書架'],['deco_wardrobe','衣櫃'],['deco_dresser','梳妝台'],['deco_desk','書桌'],['deco_chair','木椅'],['deco_dining','長餐桌'],['deco_stove','石爐灶'],['deco_cupboard','碗櫃'],['deco_fireplace','壁爐'],['deco_bunkbed','雙層床'],['deco_rocker','搖椅'],['deco_floorlamp','立燈'],['deco_clock','掛鐘'],['deco_painting','島嶼風景畫'],['deco_hangplant','吊掛盆栽'],['deco_aquarium','小水族箱'],['deco_guitar','手作吉他'],['deco_organ','小風琴'],['deco_globe','地球儀'],['deco_specimen','標本櫃'],['deco_roundrug','圓形編織毯'],['deco_cushion','羽毛坐墊'],['deco_curtain','窗簾'],['deco_basket','收納籃'],['deco_teaset','茶具組'],['deco_plushbear','黑熊玩偶'],['deco_screen','木框屏風'],['deco_col_bottle','漂流瓶'],['deco_col_camphor','樟腦結晶'],['deco_col_arrowhead','石器箭頭'],['deco_col_goldsand','砂金'],['deco_col_fossil','貝類化石'],['deco_col_paddle','獨木舟槳'],['deco_col_stalactite','鐘乳石碎片'],['deco_col_lamp','老燈塔油燈'],['deco_col_gear','木齒輪'],['deco_col_potsherd','古陶片'],['deco_col_obsidian','黑曜石'],['deco_trcase','寶藏展示櫃'],['deco_icesculpt','冰晶天鵝雕'],['deco_igloolamp','雪屋燈'],['deco_ivoryarch','猛瑪象牙拱門'],['deco_qiviutrug','麝牛絨地毯'],['deco_cocohammock','椰子吊床'],['deco_cacaopot','可可樹盆栽'],['deco_lighthouse','燈塔模型'],['deco_coraltank','珊瑚魚缸'],['deco_urchinlamp','發光海膽燈'],['deco_kingstatue','四島主紀念碑']];
D.LIB_PET = [['pet_gull_walk','海鷗小白'],['pet_bear_walk','台灣黑熊'],['pet_deer_walk','梅花鹿'],['pet_owl_walk','領角鴞'],['pet_leopardcat_walk','石虎'],['pet_bluemagpie_walk','台灣藍鵲'],['pet_eagle_walk','大冠鷲'],['pet_pangolin_walk','穿山甲'],['pet_turtle_walk','綠蠵龜'],['pet_coconutcrab_walk','椰子蟹'],['pet_treefrog_walk','莫氏樹蛙'],['pet_firefly_walk','螢火蟲'],['pet_salmon_walk','櫻花鉤吻鮭'],['pet_macaque_walk','台灣獼猴'],['pet_spoonbill_walk','黑面琵鷺'],['pet_barbet_walk','五色鳥'],['pet_cloudleopard_walk','台灣雲豹'],['pet_bluering_walk','藍環章魚'],['pet_swallowtail_walk','寬尾鳳蝶'],['pet_empenguin_walk','皇帝企鵝'],['pet_snowyowl_walk','雪鴞'],['pet_arcticfox_walk','北極狐'],['pet_capybara_walk','水豚'],['pet_macaw_walk','金剛鸚鵡'],['pet_jaguar_walk','美洲豹'],['pet_puffin_walk','海鸚'],['pet_tortoise_walk','加拉巴哥象龜'],['pet_albatross_walk','信天翁'],['pet_sailfish_walk','雨傘旗魚'],['pet_seaotter_walk','海獺'],['pet_isopod_walk','大王具足蟲']];
D.LIB_WP = [['wp_club','棍棒'],['wp_club_t2','棍棒 ★2'],['wp_club_t3','棍棒 ★3'],['wp_club_t4','棍棒 ★4'],['wp_club_t5','棍棒 ★5'],['wp_stoneaxe','石斧'],['wp_stoneaxe_t2','石斧 ★2'],['wp_stoneaxe_t3','石斧 ★3'],['wp_stoneaxe_t4','石斧 ★4'],['wp_stoneaxe_t5','石斧 ★5'],['wp_spear','長槍'],['wp_spear_t2','長槍 ★2'],['wp_spear_t3','長槍 ★3'],['wp_spear_t4','長槍 ★4'],['wp_spear_t5','長槍 ★5'],['wp_bow','弓箭'],['wp_bow_t2','弓箭 ★2'],['wp_bow_t3','弓箭 ★3'],['wp_bow_t4','弓箭 ★4'],['wp_bow_t5','弓箭 ★5'],['wp_hammer','錘'],['wp_hammer_t2','錘 ★2'],['wp_hammer_t3','錘 ★3'],['wp_hammer_t4','錘 ★4'],['wp_hammer_t5','錘 ★5'],['wp_boomerang','迴力鏢'],['wp_boomerang_t2','迴力鏢 ★2'],['wp_boomerang_t3','迴力鏢 ★3'],['wp_boomerang_t4','迴力鏢 ★4'],['wp_boomerang_t5','迴力鏢 ★5']];
D.LIB_ACC = [['acc_bat','蝙蝠之牙'],['acc_batearring','蝙蝠耳環'],['acc_claw','利爪'],['acc_clawbangle','爪痕手環'],['acc_colossus','巨像碎片'],['acc_gorgon','蛇髮之瞳'],['acc_gorgonmirror','蛇鱗手鏡'],['acc_ink','墨魚墨囊'],['acc_lavaheart_pendant','熔岩之心墜飾'],['acc_locust','蝗蟲翅'],['acc_locustcharm','蝗蟲護符'],['acc_magma','熔岩核'],['acc_magmabrooch','熔岩胸針'],['acc_mammoth','猛瑪象牙'],['acc_mud','泥巨人之心'],['acc_mudamulet','泥土護身符'],['acc_shadow','暗影結晶'],['acc_shadowring','暗影戒指'],['acc_thunder','雷鳥羽'],['acc_thunderplume_pin','雷羽別針'],['acc_treering','千年年輪'],['acc_tusk','野豬獠牙'],['acc_tusknecklace','獠牙項鍊'],['acc_windeye','風之眼'],['pgear_beastfang','獸牙'],['pgear_collar','夥伴項圈'],['pgear_crystalchime','水晶風鈴'],['pgear_emberamulet','餘燼護符'],['pgear_featherring','羽毛環'],['pgear_herbsachet','草藥香包'],['pgear_honeyjar','蜂蜜罐'],['pgear_leafback','葉片背包'],['pgear_leafmail','葉片鎧甲'],['pgear_magmabadge','熔岩徽章'],['pgear_shellguard','貝殼護甲']];
D.AV_FILES = ['body_boy','body_girl','body_head_boy','body_head_girl','body_head_kidboy','body_head_kidgirl','body_kidboy','body_kidgirl','body_torso_boy','body_torso_girl','body_torso_kidboy','body_torso_kidgirl','bodyfull_aquamage_kidgirl','bodyfull_dualblade_kidgirl','bodyfull_fancyrapier_girl','bodyfull_flamemage_boy','bodyfull_forestmage_kidboy','bodyfull_heavysword_boy','bodyfull_kimono_boy','bodyfull_kimono_girl','bodyfull_kimono_kidboy','bodyfull_kimono_kidgirl','bodyfull_lightgreatsword_kidboy','bodyfull_thundermage_girl','boy_heavysword_body','boy_heavysword_full','boy_heavysword_head','boy_kimono_body','boy_kimono_full','boy_kimono_head','boy_redmage_body','boy_redmage_full','boy_redmage_head','boy_shaggy_head','boy_src06_body','boy_suit_body','boy_suit_full','boy_suit_head','boy_uniform_body','boy_uniform_full','boy_uniform_head','btm_jeans_boy','btm_jeans_girl','btm_jeans_kidboy','btm_jeans_kidgirl','ear_elf_boy','ear_elf_girl','ear_elf_kidboy','ear_elf_kidgirl','eye_cool_boy','eye_cool_girl','eye_cool_kidboy','eye_cool_kidgirl','eye_gentle_boy','eye_gentle_girl','eye_gentle_kidboy','eye_gentle_kidgirl','eye_proud_boy','eye_proud_girl','eye_proud_kidboy','eye_proud_kidgirl','eye_sly_boy','eye_sly_girl','eye_sly_kidboy','eye_sly_kidgirl','eye_smile_boy','eye_smile_girl','eye_smile_kidboy','eye_smile_kidgirl','eye_soft_boy','eye_soft_girl','eye_soft_kidboy','eye_soft_kidgirl','fullbody_aquamage_kidgirl','fullbody_dualblade_kidgirl','fullbody_fancyrapier_girl','fullbody_flamemage_boy','fullbody_forestmage_kidboy','fullbody_heavysword_boy','fullbody_kimono_boy','fullbody_kimono_girl','fullbody_kimono_kidboy','fullbody_kimono_kidgirl','fullbody_lightgreatsword_kidboy','fullbody_thundermage_girl','girl_braid_head','girl_closedeyes_head','girl_dress_body','girl_dress_full','girl_dress_head','girl_dualblade_body','girl_dualblade_head','girl_elfcurl_head','girl_glasses_head','girl_kimono_body','girl_kimono_full','girl_kimono_head','girl_longstraight_head','girl_longwavy_head','girl_ponytail_head','girl_purplemage_body','girl_purplemage_full','girl_purplemage_head','girl_rapier_body','girl_rapier_full','girl_rapier_head','girl_sideponytail_head','girl_src02_body','girl_src03_body','girl_src04_body','girl_src05_body','girl_twintail_head','girl_uniform_body','girl_uniform_full','girl_uniform_head','girl_wavybob_head','glasses_black_boy','glasses_black_girl','glasses_black_kidboy','glasses_black_kidgirl','gls_bold','gls_bold_clear','gls_browblack','gls_browblack_clear','gls_browgold','gls_browgold_clear','gls_monocle','gls_monocle_clear','gls_red','gls_red_clear','gls_rimless','gls_rimless_clear','gls_roundblack','gls_roundblack_clear','gls_roundgold','gls_roundgold_clear','gls_slim','gls_slim_clear','gls_sun','hair_bigtail_boy','hair_bigtail_girl','hair_bigtail_kidboy','hair_bigtail_kidgirl','hair_bob_boy','hair_bob_girl','hair_bob_kidboy','hair_bob_kidgirl','hair_braids_girl','hair_curl_boy','hair_curl_girl','hair_curl_kidboy','hair_curl_kidgirl','hair_elf_boy','hair_elf_girl','hair_elf_kidboy','hair_elf_kidgirl','hair_long_girl','hair_long_kidboy','hair_long_kidgirl','hair_lowtail_boy','hair_lowtail_girl','hair_lowtail_kidboy','hair_lowtail_kidgirl','hair_medium_boy','hair_mid_boy','hair_mid_girl','hair_mid_kidboy','hair_mid_kidgirl','hair_mushroom_kidboy','hair_pony_boy','hair_pony_girl','hair_pony_kidboy','hair_pony_kidgirl','hair_princess_boy','hair_princess_girl','hair_princess_kidboy','hair_princess_kidgirl','hair_short_boy','hair_short_girl','hair_short_kidboy','hair_short_kidgirl','hair_sidepart_boy','hair_sidepart_girl','hair_sidepart_kidboy','hair_sidepart_kidgirl','hair_sideponytail_kidgirl','hair_slick_boy','hair_spiky_boy','hair_spiky_girl','hair_spiky_kidboy','hair_spiky_kidgirl','hair_twin_boy','hair_twin_girl','hair_twin_kidboy','hair_twin_kidgirl','hair_uniform_boy','hair_uniform_girl','hair_uniform_kidboy','hair_uniform_kidgirl','hair_xlong_boy','hair_xlong_girl','hair_xlong_kidboy','hair_xlong_kidgirl','hat_baseball','hat_beanie','hat_beret','hat_boater','hat_bucket','hat_cadet','hat_fedora','hat_newsboy','hat_straw','hat_witch','headfull_aquamage_kidgirl','headfull_dualblade_kidgirl','headfull_fancyrapier_girl','headfull_flamemage_boy','headfull_forestmage_kidboy','headfull_heavysword_boy','headfull_kimono_boy','headfull_kimono_girl','headfull_kimono_kidboy','headfull_kimono_kidgirl','headfull_lightgreatsword_kidboy','headfull_thundermage_girl','kidboy_glasses_head','kidboy_greatsword_body','kidboy_greatsword_full','kidboy_greatsword_head','kidboy_greenmage_body','kidboy_greenmage_full','kidboy_greenmage_head','kidboy_kimono_body','kidboy_kimono_full','kidboy_kimono_head','kidboy_overalls_body','kidboy_overalls_full','kidboy_overalls_head','kidboy_shaggy_head','kidboy_spiky_head','kidboy_src07_body','kidboy_uniform_body','kidboy_uniform_full','kidboy_uniform_head','kidgirl_braid_head','kidgirl_closedeyes_head','kidgirl_curlybob_head','kidgirl_elfwavy_head','kidgirl_glasses_head','kidgirl_hime_head','kidgirl_longstraight_head','kidgirl_longwavy_head','kidgirl_ponytail2_head','kidgirl_ponytail_head','kidgirl_sideponytail_head','kidgirl_src08_body','kidgirl_src09_body','kidgirl_twintail_head','kidgirl_watermage_body','kidgirl_watermage_head','kidgirl_wavybob_head','macc_clover','macc_grass','macc_leaf','macc_lolly','macc_maskb','macc_maskw','macc_paci','macc_sakura','macc_toast','mask_01','mask_02','mask_03','mask_04','mask_05','mask_06','mask_07','mask_08','mask_09','mask_10','mask_11','mask_12','mask_13','mask_14','mask_15','mask_16','mask_17','mask_18','mask_19','mask_20','mask_21','mask_22','mask_23','mask_24','mask_25','mouth_gentle_girl','mouth_gentle_kidboy','mouth_gentle_kidgirl','mouth_sly_girl','mouth_sly_kidboy','mouth_sly_kidgirl','shoe_sneaker_boy','shoe_sneaker_girl','shoe_sneaker_kidboy','shoe_sneaker_kidgirl','top_bluedress_girl','top_dress_kidgirl','top_dualsword_kidgirl','top_kimono_kidgirl','top_overall_kidboy','top_pinkdress_kidgirl','top_suit_boy','top_tee_boy','top_tee_girl','top_tee_kidboy','top_tee_kidgirl','top_uniform_boy','top_uniform_girl','top_uniform_kidboy','top_uniform_kidgirl','top_watermage_kidgirl'];
})();
