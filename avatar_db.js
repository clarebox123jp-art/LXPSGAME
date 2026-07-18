/* ============================================================
 * 小英雄大對抗 — avatar_db.js(主角系統 Phase 1)
 * 版本: v4.59.0(2026-07-18)
 *
 * ★ v4.59.0 — 整套造型系統(整張取代基礎圖·管理員測試):
 *   - 新分類 P.full「整套造型」(換身體頁籤·cfg.full·id0=無 自由搭配):
 *     選擇整套造型時「隱藏素體基礎圖」,直接以整張 fullbody 素材取代(老師裁定),
 *     其餘圖層(髮型/眼鏡/帽子/手持等)照常疊加,玩家可自行搭配或保留預設
 *   - 首批 12 件素材(504×720 同素體規格·頭頂腳底已對齊素體幾何·切換不跳動):
 *     劍士系列 4(輕裝大劍士=男童/華麗細劍士=少女/重裝鎧甲劍士=少年/俏麗雙劍士=女童)
 *     魔法師系列 4(水藍=女童/紫電=少女/赤紅=少年/翠綠=男童)
 *     日式和服 1 款四體型齊全;缺體型格 null 佔位該體型自動隱藏(沿用 v4.58.0 機制)
 *   - 素材檔名 fullbody_{en}_{body}.png 放 avatar_parts/;名稱雙版(鐵律 1.232)
 * 版本: v4.58.1(2026-07-18)
 *
 * ★ v4.58.1 — 老師實測修正:①棋盤格裁切根治(aligned 圖透明背景匯出成灰白棋盤格被
 *   當髮件抽入 → remove_bg 加「中灰低飽和全域清除」+小連通塊精修,八款問題髮型
 *   [刺頭/超長髮/中分/大馬尾/公主頭/制服/精靈長髮/雙馬尾]四體型殘留降 <0.2%)
 *   ②預覽立繪放大至 80vh(PC+iPad 同步·左欄 flex 46%/max 640)③體型幼兒(男)/(女)
 *   →男童/女童 ④換身體頁加「手持」分類復原(held·素材待補顯繪製中)⑤名片語錄→座右銘
 * 版本: v4.58.0(2026-07-18)
 *
 * ★ v4.58.0 — 差異法乾淨素材 122 件正式接線(管理員測試)
 *   - 素材來源:老師人眼對位 aligned 圖 × 四批「差異法抽件」(等比零拉長;
 *     髮件=光頭素體之上完整整頭;服裝件完全覆蓋素體;皆經老師預覽流程)
 *   - 髮型 20 款掛檔:id0 短髮/id2 雙馬尾/id3 自然長髮(缺少年)/id4 妹妹頭/id5 刺蝟頭/
 *     id6 高馬尾/id7 中捲/id10 低馬尾/id11 超長直髮/id12 中分/id13 大馬尾/id14 公主頭/
 *     id15 制服頭/id16 精靈捲/id17 旁分/id18 雙辮子(少女)/id19 油頭(少年)/
 *     id20 側馬尾(幼女)/id21 西瓜頭(幼男)/id22 中等長髮(少年·新增)
 *   - 眼 6 款(id3/4/5/10/11/12)、嘴 2 款(id10/11·少年無件)、眼鏡 id4、精靈耳 id1(解鎖)、
 *     上衣 id10 白T+套裝 id11 制服/id12 藍長裙(少女)/id13 西裝(少年)/id14 小洋裝(幼女)/
 *     id15 吊帶裝(幼男)、下衣 id10 牛仔褲、鞋 id10 帆布鞋
 *   - 缺體型格以 null 佔位:PNG 模式清單過濾改「依當前體型判定」(_avImgFor per-body),
 *     缺格款於該體型自動隱藏;j===0 預設款永遠顯示(=素體內建外觀,
 *     top/btm/shoe id0 更名 預設運動服/預設運動短褲/打赤腳)
 *   - 頁籤:換髮型(髮型+髮色)/換臉(眼+瞳色+嘴+眼鏡+耳朵+眉色)/
 *     換身體(體型+膚色+上衣套裝+褲子+鞋子)/名片
 *   - 未接線待補:mouth id0 微笑嘴(無件維持 _offImg)、shoe id11/12(無件)、
 *     幼女小洋裝為同色系稀疏件(老師測試判定去留)
 * ★ v4.57.0 — 老師指示:自訂角色大幅簡化為三大類「換髮型/換臉/換身體」+ 名片語錄
 *   - 背景:舊管線(batch2/3)產出的服裝/配件/表情素材對位品質未達標,老師全數退回;
 *     僅四款基礎髮型(清爽短髮/雙馬尾/自然長髮/高馬尾)以「人眼對位+差異法」重抽通過
 *   - 頁籤簡化:服裝/配件/耳角翅尾/手持 四頁籤停用(舊定義保留於註解,素材到位可復原)
 *   - 素材停用手法:壞件的 img/fImg 鍵改名 _offImg/_offFImg(資料原地保留、渲染與
 *     PNG 模式清單自動忽略;絕不刪除 — 誤刪是大忌)。停用清單:
 *     髮型 id4/7/10~21、眼 id3/4/5/10/11/12、嘴 id0/10/11、耳 id1(重新上鎖)、
 *     眼鏡 id4、上衣 id10~15、下衣 id10、鞋 id10~12
 *   - 保留掛檔:髮型 id0/2/3/6 的 fImg(檔名 hair_{short,twin,long,pony}_{體型}.png,
 *     待老師將差異法乾淨件改名後上傳 avatar_parts/ 即生效)
 * ★ v4.55.5 — 老師 20 張變體圖第三批:8 套造型 76 件 PNG 部件(× 四體型)
 *   - 髮型 7 款:id15 學生制服短髮、id16 精靈金色長捲、id17 斯文旁分頭、id18 雙辮子髮、
 *     id19 紳士油頭、id20 單側俏馬尾、id21 西瓜皮短髮(fImg 四體型;SVG 後備借近似路徑)
 *   - 眼神:id12 高傲自信眼(含挑眉,精靈配套;含膚色補丁層)
 *   - 耳朵:id1 精靈長耳掛 PNG 並解鎖(原 SVG 保留後備)
 *   - 眼鏡:id4 經典黑框眼鏡(PNG 四體型)
 *   - 上衣 6 款:id10 白T恤、id11 學生制服套裝、id12 藍色連身長裙、id13 紳士西裝、
 *     id14 粉紅小洋裝、id15 吊帶短褲裝(洋裝/西裝/吊帶=連身整套佔上衣槽)
 *   - 下衣:id10 休閒牛仔褲;鞋 3 款:id10 帆布鞋、id11 學生皮鞋襪、id12 黑亮皮鞋
 *   - 渲染行:襪/鞋/下衣/上衣/耳/眼鏡 img 同步套 _avImgFor(支援四體型陣列)
 *   - 素材說明:制服/便服/精靈/眼鏡款為四體型原生;長裙/西裝/洋裝/吊帶為單體型
 *     跨體型幾何合成(肩寬+頸地比映射),品質次於原生,可日後補生成替換
 * ★ v4.55.4 — 老師 12 張變體圖第二批:髮型 3 款 + 眼 3 款 + 嘴 3 款(× 四體型 PNG)
 *   - 髮型:id12 中分清爽短髮、id13 飄逸大馬尾、id14 公主頭髮辮(fImg 四體型;
 *     SVG fallback 借用近似既有路徑:中分←旁分、大馬尾←高馬尾、公主頭←妹妹頭)
 *   - 眼神:id3 瞇瞇笑眼掛 img(素材化);新增 id10 自信神采眼、id11 柔弱水汪眼
 *   - 嘴型:id0 開心微笑掛 img;新增 id10 得意露齒笑、id11 委屈抿嘴
 *   - 眼/嘴部件均內建「膚色補丁層」精準蓋住素體原五官(素體眼線/眉/嘴不外露)
 *   - 渲染行:眉/鼻/嘴 img 同步套 _avImgFor(v4.55.3 只有眼有)
 *   - 素材:本批衣服與耳朵與素體同款同色(變體圖以原素體生成)→ 無新服裝/耳件
 * ★ v4.55.3 — 新髮型 4 款 + 眼神部件 2 款(× 四體型 PNG)
 *   - 髮型:齊瀏海妹妹頭(id4)掛 fImg;id7 更名「自然中捲髮/捲捲頭」並解鎖掛 fImg;
 *     新增 id10 低馬尾、id11 超長直髮(PNG 主打,SVG 後備借既有路徑)
 *   - 刺蝟頭(id5)PNG 版經評估後不採用,維持原 SVG 造型(PNG 模式清單自動隱藏)
 *   - 眼神:P.eye id5 銳利鳳眼=冷酷眼睛、id4 半月垂眼=溫柔眼睛(img 四體型陣列,
 *     渲染行以 _avImgFor 依體型解析;部件含蓋住素體原眼所需的小範圍膚色)
 *   - 已知限制:眼神部件不吃膚色/瞳色染色(素材原色);髮型部件不受影響
 * ★ v4.55.2 — 髮型 PNG 素材上線(短髮/長髮/高馬尾/雙馬尾 × 四體型)
 *   - P.hair id0/2/3/6 掛 fImg 陣列(依體型 [boy,girl,kidboy,kidgirl] 取檔)
 *   - _hairLayer 支援 fImg/bImg 為「單檔字串」或「四體型陣列」(_avImgFor 解析)
 *   - id3 更名「自然長髮」(素材為自然垂落長髮,非僅及腰直髮)
 *   - 素體 v2:輕薄內衣 → 運動服(少年/幼男=淡藍、少女/幼女=粉紅,T恤+及膝短褲)
 *     圖檔同名覆蓋(body_*.png),臉部五官/眼瞳ROI 完全未動,AVATAR_BODY_META 免調
 * ★ v4.55.0 — 全新檔案:主角捏臉系統 + 名片(Phase 1)
 *   內容:
 *     1. AVATAR_PALETTES — 膚色 8 / 髮色 16 / 瞳色 12 色票
 *     2. AVATAR_PARTS    — 全部件 SVG 庫(臉10/髮10/眉10/眼10/鼻10/嘴10/
 *                          耳7/角5/翅5/尾7/手持11/帽4/鏡4/鍊4/鐲4/披風4/
 *                          上衣10/下衣10/鞋10/體型4)
 *     3. _avatarRenderSVG — 由 cfg 組裝全身立繪(Q 版二次元卡通風)
 *     4. _avatarOpenPanel — 全螢幕客製化面板(仿好友面板 overlay 模式)
 *     5. _avatarOpenCard  — 社交名片彈窗(自己預覽 / 好友名單查看共用)
 *     6. 雲端存取 — avatarCard 整包存 players/{uid} 主檔(merge:true,
 *                   照 representativeHero 模式;好友經 _fbLoadFriend 免費讀到)
 *   設計原則:
 *     - 鐵律 1.232:所有 UI 說明文字皆備 cute(精簡)/premium(原文)雙版,
 *       依 window._artStyle 分流(部件「名稱」為專有名詞雙版同文亦逐欄標注)
 *     - 特殊款 lock:{t:'soon'} = 「主線劇情敬請期待」→ Phase 2 接真條件;
 *       avatarCard.unlock 陣列為未來解鎖帳本(GM 可補發)
 *     - 零 optional chaining(?.);零 ASCII 單引號進字串字面值內文
 *     - SVG 色彩用佔位字串 __SK__/__HC__/__EC__ 於渲染時替換(防呆最穩)
 *     - 寫雲端僅在玩家按「儲存造型」時單次觸發(天然節流,無高頻寫入)
 * ============================================================ */
(function(){
'use strict';

window.AVATAR_DB_VERSION = 'v4.59.0';

/* ── 雙版文字小工具(鐵律 1.232) ── */
function _avT(prem, cute){
  var isCute = (typeof window._artStyle !== 'undefined' && window._artStyle === 'cute');
  return isCute ? cute : prem;
}

/* ════════════════════════════════════════
 * 1. 色票
 * ════════════════════════════════════════ */
window.AVATAR_PALETTES = {
  skin: ['#ffe3cf','#ffd6b8','#f5c9a5','#eab98f','#d99e6f','#b97a4e','#8f5a38','#f9e0e6'],
  hair: ['#3a2a24','#111318','#6b4a2f','#a5713d','#d9a441','#f2d478','#b8412f','#e2603f',
         '#7a3fa0','#4457c9','#3f8fd4','#54b98a','#3f7d4a','#d45a8f','#c9ccd4','#f5f0e6'],
  eye:  ['#5a3d2b','#2b2b33','#3f6fd4','#2e9e7a','#c9433a','#8a4fd4','#d4913f','#3fa9d4',
         '#d45a9e','#6b7a3f','#8a8f99','#d4b23f']
};

/* ════════════════════════════════════════
 * 2. 部件庫
 *    每款 = { id, n(premium 名), ns(cute 名), svg 或 f/b(前後層), lock }
 *    lock: null=免費 | {t:'soon'}=主線敬請期待(Phase 2 接條件)
 *    色彩佔位:__SK__ 膚 / __HC__ 髮 / __EC__ 瞳 / __LN__ 線條
 * ════════════════════════════════════════ */
var LN = '#4a3438'; // 統一描邊色

/* ════════════════════════════════════════
 * ★ v4.55.0 PNG 部件管線(老師供圖模式)
 *   - 老師以「同構圖基準人物」生成素體與變體圖 → 去背後全畫布圖層疊放,
 *     同體型共用一組 transform → 部件自動對齊,零手工定位
 *   - AVATAR_IMG_TF:各體型在遊戲畫布(360×480)的置入參數
 *     (基於原圖 1049×1499 座標系;地面線 y=462;幼兒縮 85%)
 *   - _AVATAR_PNG_MODE=true:渲染只疊「有 img 的部件」,SVG 部件庫整套保留為
 *     fallback(要切回 SVG 版把此旗標改 false 即可)
 *   - 部件圖檔放 repo 的 avatar_parts/ 資料夾(相對路徑,與 Pages 部署同源)
 * ════════════════════════════════════════ */
window._AVATAR_PNG_MODE = true;
var AVATAR_IMG_BASE = './avatar_parts/';
var AVATAR_IMG_TF = {
  0: { x:26.1, y:33.6,  w:314.7, h:449.7 },  /* 少年 */
  1: { x:23.7, y:32.7,  w:314.7, h:449.7 },  /* 少女 */
  2: { x:47.7, y:95.3,  w:267.5, h:382.2 },  /* 幼兒男 */
  3: { x:47.7, y:100.7, w:267.5, h:382.2 }   /* 幼兒女 */
};
function _imgLayer(imgFile, tf){
  if(!imgFile || !tf) return '';
  var u = AVATAR_IMG_BASE + imgFile;
  return _imgLayerSrc(u, tf);
}
function _imgLayerSrc(src, tf){
  if(!src || !tf) return '';
  return '<image href="' + src + '" xlink:href="' + src + '" x="' + tf.x + '" y="' + tf.y
    + '" width="' + tf.w + '" height="' + tf.h + '" preserveAspectRatio="xMidYMid meet"/>';
}

/* ════════════════════════════════════════
 * ★ v4.55.1 PNG 指定部位換色引擎(老師需求:髮色/眉色/膚色/瞳色)
 *   原理:canvas 逐像素「色域 + ROI」雙重過濾 → 亮度映射(保留陰影高光層次)
 *   - 膚色:全圖膚色域(橘域 H10-46・中低飽和・高明度,含陰影膚)
 *   - 瞳色:眼睛 ROI 內的虹膜棕(排除描邊 V<0.34 與眼白高光 S<0.24)
 *   - 眉色:眉毛 ROI 內的深棕
 *   - 髮色:髮型為獨立圖層 → 整層亮度染色(_avatarTintLayer,髮型素材加入即生效)
 *   色票 idx 0 = 「原本的顏色」(不染,直接用原圖,零成本)
 *   快取:同 (體型,膚,瞳,眉) 組合只算一次(dataURL);染色非同步,
 *   首繪先出原色、完成後自動重繪(iPad 一次 ~50-100ms)
 *   AVATAR_BODY_META 座標系 = 部件圖檔原生 504×720
 * ════════════════════════════════════════ */
var AVATAR_BODY_META = {
  0: { sbv:0.98, eye:[196,100,296,150], brow:[196,80,296,102]  },  /* 少年 */
  1: { sbv:0.99, eye:[192,110,308,164], brow:[196,88,304,112]  },  /* 少女 */
  2: { sbv:0.99, eye:[182,120,320,192], brow:[186,96,316,122]  },  /* 幼兒男 */
  3: { sbv:0.99, eye:[180,124,318,198], brow:[184,98,314,126]  }   /* 幼兒女 */
};
var _avTintCache = {};
function _avHex2Rgb(hx){
  return [parseInt(hx.slice(1,3),16), parseInt(hx.slice(3,5),16), parseInt(hx.slice(5,7),16)];
}
window._avatarNeedTint = function(cfg){
  return ((cfg.skin|0) > 0) || ((cfg.eyeC|0) > 0) || ((cfg.browC|0) > 0);
};
function _avatarTintKey(cfg){
  return 'b' + cfg.body + '|' + (cfg.skin|0) + '|' + (cfg.eyeC|0) + '|' + (cfg.browC|0);
}
/* 亮度映射:ratio<=1 → 目標色×ratio(陰影);ratio>1 → 向白提亮(高光) */
function _avMapC(t, ratio){
  if(ratio <= 1) return t * ratio;
  var k = (ratio - 1) * 1.8; if(k > 1) k = 1;
  return t + (255 - t) * k;
}
window._avatarComposeBody = function(cfg, cb){
  var key = _avatarTintKey(cfg);
  if(_avTintCache[key]){ cb(_avTintCache[key]); return; }
  var bodyDef = P.body[(cfg.body >= 0 && cfg.body < P.body.length) ? cfg.body : 0];
  if(!bodyDef || !bodyDef.img){ cb(null); return; }
  var meta = AVATAR_BODY_META[cfg.body] || AVATAR_BODY_META[0];
  var PAL = window.AVATAR_PALETTES;
  var doSkin = (cfg.skin|0) > 0, doEye = (cfg.eyeC|0) > 0, doBrow = (cfg.browC|0) > 0;
  var skinT = doSkin ? _avHex2Rgb(PAL.skin[cfg.skin]) : null;
  var eyeT  = doEye  ? _avHex2Rgb(PAL.eye[cfg.eyeC])  : null;
  var browT = doBrow ? _avHex2Rgb(PAL.hair[cfg.browC]) : null;  /* 眉色共用髮色票 */
  var img = new Image();
  img.onload = function(){
    try{
      var W2 = img.naturalWidth, H2 = img.naturalHeight;
      var sc = W2 / 504;  /* 圖檔若非 504 寬,ROI 等比換算 */
      var cv = document.createElement('canvas'); cv.width = W2; cv.height = H2;
      var ctx = cv.getContext('2d'); ctx.drawImage(img, 0, 0);
      var d = ctx.getImageData(0, 0, W2, H2), px = d.data;
      var ex1=meta.eye[0]*sc, ey1=meta.eye[1]*sc, ex2=meta.eye[2]*sc, ey2=meta.eye[3]*sc;
      var bx1=meta.brow[0]*sc, by1=meta.brow[1]*sc, bx2=meta.brow[2]*sc, by2=meta.brow[3]*sc;
      var sbv = meta.sbv;
      for(var i=0;i<px.length;i+=4){
        if(px[i+3] < 10) continue;
        var r=px[i]/255, g=px[i+1]/255, b=px[i+2]/255;
        var mx=Math.max(r,g,b), mn=Math.min(r,g,b), dd=mx-mn;
        var v=mx, s=(mx>0)?dd/mx:0, h=0;
        if(dd>0){
          if(mx===r) h=60*(((g-b)/dd)%6);
          else if(mx===g) h=60*((b-r)/dd+2);
          else h=60*((r-g)/dd+4);
          if(h<0) h+=360;
        }
        var p=(i/4)|0, y=(p/W2)|0, x=p-y*W2;
        var T=null, ratio=0;
        if(doSkin && h>10 && h<46 && s>0.06 && s<0.52 && v>0.60){
          T=skinT; ratio=v/sbv;
        } else if(doEye && x>=ex1 && x<ex2 && y>=ey1 && y<ey2
                  && h>4 && h<52 && s>0.24 && s<0.8 && v>0.34 && v<0.82){
          T=eyeT; ratio=v/0.55;
        } else if(doBrow && x>=bx1 && x<bx2 && y>=by1 && y<by2
                  && h>4 && h<52 && s>0.2 && v>0.10 && v<0.68){
          T=browT; ratio=v/0.38;
        }
        if(T){
          if(ratio>1.6) ratio=1.6;
          px[i]   = _avMapC(T[0], ratio);
          px[i+1] = _avMapC(T[1], ratio);
          px[i+2] = _avMapC(T[2], ratio);
        }
      }
      ctx.putImageData(d, 0, 0);
      var url = cv.toDataURL('image/png');
      _avTintCache[key] = url;
      cb(url);
    }catch(e){ console.warn('[avatar] 染色失敗(改用原圖)', e); cb(null); }
  };
  img.onerror = function(){ cb(null); };
  img.src = AVATAR_IMG_BASE + bodyDef.img;
};

/* 整層染色(髮型/任何單色系圖層):全部非透明像素亮度映射;baseV 預設 0.55 */
var _avLayerTintCache = {};
window._avatarTintLayer = function(imgFile, palHex, baseV, cb){
  var key = imgFile + '|' + palHex;
  if(_avLayerTintCache[key]){ cb(_avLayerTintCache[key]); return; }
  var T = _avHex2Rgb(palHex), bv = baseV || 0.55;
  var img = new Image();
  img.onload = function(){
    try{
      var cv = document.createElement('canvas');
      cv.width = img.naturalWidth; cv.height = img.naturalHeight;
      var ctx = cv.getContext('2d'); ctx.drawImage(img, 0, 0);
      var d = ctx.getImageData(0, 0, cv.width, cv.height), px = d.data;
      for(var i=0;i<px.length;i+=4){
        if(px[i+3] < 10) continue;
        var v = Math.max(px[i], px[i+1], px[i+2]) / 255;
        var ratio = v / bv; if(ratio > 1.6) ratio = 1.6;
        px[i]   = _avMapC(T[0], ratio);
        px[i+1] = _avMapC(T[1], ratio);
        px[i+2] = _avMapC(T[2], ratio);
      }
      ctx.putImageData(d, 0, 0);
      var url = cv.toDataURL('image/png');
      _avLayerTintCache[key] = url;
      cb(url);
    }catch(e){ console.warn('[avatar] 圖層染色失敗', e); cb(null); }
  };
  img.onerror = function(){ cb(null); };
  img.src = AVATAR_IMG_BASE + imgFile;
};

var P = {};
window.AVATAR_PARTS = P;

/* ── 體型(身體底,膚色) ──
 * Q 版二頭身。座標基準:頸 y225 肩 y252 臀 y345 腿底 y438。
 * kid 體型不另畫 path:身體 group 套 transform 縮短(見渲染器)。 */
P.body = [
  { id:0, n:'少年', ns:'少年', lock:null, img:'body_boy.png', svg:
    '<path d="M180 222 c-30 2 -50 16 -52 42 l-4 78 c-1 14 8 22 18 22 l14 0 4 66 c0 6 5 9 10 9 l20 0 c5 0 10 -3 10 -9 l4 -66 14 0 c10 0 19 -8 18 -22 l-4 -78 c-2 -26 -22 -40 -52 -42 z" fill="__SK__" stroke="__LN__" stroke-width="3"/>'
   +'<path d="M132 262 c-10 4 -16 14 -17 26 l-3 46 c0 8 5 13 12 13 8 0 12 -5 12 -13 l0 -68 z" fill="__SK__" stroke="__LN__" stroke-width="3"/>'
   +'<path d="M228 262 c10 4 16 14 17 26 l3 46 c0 8 -5 13 -12 13 -8 0 -12 -5 -12 -13 l0 -68 z" fill="__SK__" stroke="__LN__" stroke-width="3"/>' },
  { id:1, n:'少女', ns:'少女', lock:null, img:'body_girl.png', svg:
    '<path d="M180 222 c-28 2 -46 16 -48 40 l-3 44 c-2 12 -6 22 -6 34 0 16 12 24 24 24 l8 0 3 66 c0 6 5 9 10 9 l24 0 c5 0 10 -3 10 -9 l3 -66 8 0 c12 0 24 -8 24 -24 0 -12 -4 -22 -6 -34 l-3 -44 c-2 -24 -20 -38 -48 -40 z" fill="__SK__" stroke="__LN__" stroke-width="3"/>'
   +'<path d="M134 260 c-9 4 -15 13 -16 24 l-3 46 c0 8 5 13 12 13 7 0 11 -5 11 -13 l0 -66 z" fill="__SK__" stroke="__LN__" stroke-width="3"/>'
   +'<path d="M226 260 c9 4 15 13 16 24 l3 46 c0 8 -5 13 -12 13 -7 0 -11 -5 -11 -13 l0 -66 z" fill="__SK__" stroke="__LN__" stroke-width="3"/>' },
  { id:2, n:'男童', ns:'男童', lock:null, img:'body_kidboy.png', svg:'@0' },
  { id:3, n:'女童', ns:'女童', lock:null, img:'body_kidgirl.png', svg:'@1' }
];
/* '@N' = 借用第 N 款 path,渲染器對 id 2/3 另套幼兒縮放 transform */

/* ── 臉型(頭部輪廓,膚色) — 10 款 ── */
function faceP(d){ return '<path d="'+d+'" fill="__SK__" stroke="__LN__" stroke-width="3.5"/>'; }
P.face = [
  { id:0, n:'圓潤臉', ns:'圓圓臉', lock:null, svg:faceP('M180 82 c-46 0 -80 30 -80 74 0 42 34 76 80 76 46 0 80 -34 80 -76 0 -44 -34 -74 -80 -74 z') },
  { id:1, n:'標準臉', ns:'標準臉', lock:null, svg:faceP('M180 82 c-45 0 -79 29 -79 72 0 34 20 62 46 74 10 5 22 8 33 8 11 0 23 -3 33 -8 26 -12 46 -40 46 -74 0 -43 -34 -72 -79 -72 z') },
  { id:2, n:'瓜子臉', ns:'瓜子臉', lock:null, svg:faceP('M180 82 c-44 0 -78 28 -78 70 0 30 16 54 38 72 12 10 27 16 40 16 13 0 28 -6 40 -16 22 -18 38 -42 38 -72 0 -42 -34 -70 -78 -70 z') },
  { id:3, n:'嬰兒肥臉', ns:'包子臉', lock:null, svg:faceP('M180 84 c-48 0 -82 28 -82 70 0 46 36 80 82 80 46 0 82 -34 82 -80 0 -42 -34 -70 -82 -70 z') },
  { id:4, n:'方圓臉', ns:'方方臉', lock:null, svg:faceP('M180 82 c-44 0 -78 26 -78 68 l0 24 c0 34 34 58 78 58 44 0 78 -24 78 -58 l0 -24 c0 -42 -34 -68 -78 -68 z') },
  { id:5, n:'心形臉', ns:'愛心臉', lock:null, svg:faceP('M180 82 c-46 0 -80 28 -80 70 0 28 18 50 40 66 14 10 28 16 40 16 12 0 26 -6 40 -16 22 -16 40 -38 40 -66 0 -42 -34 -70 -80 -70 z') },
  { id:6, n:'橢圓臉', ns:'鵝蛋臉', lock:null, svg:faceP('M180 80 c-42 0 -74 30 -74 76 0 44 32 78 74 78 42 0 74 -34 74 -78 0 -46 -32 -76 -74 -76 z') },
  { id:7, n:'小V臉', ns:'小尖臉', lock:{t:'soon'}, svg:faceP('M180 82 c-44 0 -77 27 -77 68 0 28 14 50 34 68 14 12 30 18 43 18 13 0 29 -6 43 -18 20 -18 34 -40 34 -68 0 -41 -33 -68 -77 -68 z') },
  { id:8, n:'精靈系臉', ns:'精靈臉', lock:{t:'soon'}, svg:faceP('M180 80 c-45 0 -78 28 -78 70 0 30 15 55 37 71 13 9 28 15 41 15 13 0 28 -6 41 -15 22 -16 37 -41 37 -71 0 -42 -33 -70 -78 -70 z') },
  { id:9, n:'福氣臉', ns:'福氣臉', lock:{t:'soon'}, svg:faceP('M180 86 c-50 0 -84 26 -84 66 0 46 36 82 84 82 48 0 84 -36 84 -82 0 -40 -34 -66 -84 -66 z') }
];

/* ── 髮型(f=前髮壓臉上 / b=後髮壓身後,髮色) — 10 款 ── */
P.hair = [
  { id:0, n:'清爽短髮', ns:'短短頭', lock:null,
    fImg:['hair_short_boy.png','hair_short_girl.png','hair_short_kidboy.png','hair_short_kidgirl.png'],
    f:'<path d="M180 74 c-48 0 -84 30 -84 74 0 8 1 15 3 22 6 -26 20 -38 32 -40 -4 10 -4 20 -1 27 8 -18 20 -28 30 -30 -2 9 0 18 5 24 6 -16 16 -24 30 -26 12 -2 26 4 34 18 4 -8 4 -18 1 -26 12 4 22 16 26 33 2 -7 3 -14 3 -22 0 -44 -32 -74 -79 -74 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>', b:'' },
  { id:1, n:'旁分瀏海', ns:'帥氣旁分', lock:null,
    f:'<path d="M180 74 c-48 0 -84 30 -84 74 0 7 1 14 2 20 4 -24 12 -36 24 -42 -2 10 0 19 4 25 4 -16 12 -26 24 -30 16 -6 52 -6 74 10 8 6 14 16 17 30 2 -6 3 -12 3 -19 0 -44 -33 -74 -80 -74 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>', b:'' },
  { id:2, n:'雙馬尾', ns:'雙馬尾', lock:null,
    fImg:['hair_twin_boy.png','hair_twin_girl.png','hair_twin_kidboy.png','hair_twin_kidgirl.png'],
    f:'<path d="M180 74 c-48 0 -84 30 -84 74 0 8 1 15 3 21 5 -24 16 -36 28 -40 -2 9 -1 18 3 24 6 -16 16 -25 28 -28 14 -4 42 -2 58 12 8 7 13 16 16 28 2 -6 3 -12 3 -19 0 -44 -33 -74 -79 -74 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>',
    b:'<path d="M104 140 c-16 6 -24 26 -22 48 2 24 12 46 26 56 6 4 12 2 12 -6 -6 -18 -10 -38 -10 -56 0 -16 2 -30 -6 -42 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/><path d="M256 140 c16 6 24 26 22 48 -2 24 -12 46 -26 56 -6 4 -12 2 -12 -6 6 -18 10 -38 10 -56 0 -16 -2 -30 6 -42 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>' },
  { id:3, n:'自然長髮', ns:'長長頭髮', lock:null,
    fImg:[null,'hair_long_girl.png','hair_long_kidboy.png','hair_long_kidgirl.png'],   /* ★ v4.58.0 少年版素材待補(null=少年隱藏) */
    f:'<path d="M180 74 c-48 0 -84 30 -84 74 0 8 1 15 3 21 5 -24 15 -36 27 -40 -2 9 -1 18 3 24 6 -16 16 -25 28 -28 14 -4 42 -2 58 12 8 7 13 16 16 28 2 -6 3 -12 3 -19 0 -44 -33 -72 -79 -72 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>',
    b:'<path d="M103 130 c-8 20 -12 60 -10 96 1 26 6 50 14 64 4 7 12 6 14 -2 l6 -30 c14 10 32 16 53 16 21 0 39 -6 53 -16 l6 30 c2 8 10 9 14 2 8 -14 13 -38 14 -64 2 -36 -2 -76 -10 -96 -10 -26 -40 -40 -77 -40 -37 0 -67 14 -77 40 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>' },
  { id:4, n:'齊瀏海妹妹頭', ns:'妹妹頭', lock:null,
    fImg:['hair_bob_boy.png','hair_bob_girl.png','hair_bob_kidboy.png','hair_bob_kidgirl.png'],
    f:'<path d="M180 74 c-48 0 -84 30 -84 74 l0 10 c0 6 6 8 10 4 l14 -16 8 14 c3 5 9 5 12 0 l8 -14 10 15 c3 5 9 5 12 0 l10 -15 10 15 c3 5 9 5 12 0 l10 -15 8 14 c3 5 9 5 12 0 l8 -14 14 16 c4 4 10 2 10 -4 l0 -10 c0 -44 -32 -74 -79 -74 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>',
    b:'<path d="M104 132 c-6 14 -8 34 -6 52 2 16 8 28 16 34 5 3 10 1 10 -5 l0 -60 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/><path d="M256 132 c6 14 8 34 6 52 -2 16 -8 28 -16 34 -5 3 -10 1 -10 -5 l0 -60 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>' },
  { id:5, n:'活力刺蝟頭', ns:'刺刺頭', lock:null,
    fImg:['hair_spiky_boy.png','hair_spiky_girl.png','hair_spiky_kidboy.png','hair_spiky_kidgirl.png'],   /* ★ v4.58.0 差異法乾淨件(冷酷眼配套圖抽出;舊 PNG 不採用註記作廢) */
    f:'<path d="M180 76 c-46 0 -82 28 -82 72 0 7 1 13 2 19 3 -20 8 -32 16 -40 l-8 -22 22 12 c4 -8 10 -14 18 -18 l-2 -22 18 14 c5 -2 11 -3 16 -3 5 0 11 1 16 3 l18 -14 -2 22 c8 4 14 10 18 18 l22 -12 -8 22 c8 8 13 20 16 40 1 -6 2 -12 2 -19 0 -44 -35 -72 -82 -72 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>', b:'' },
  { id:6, n:'高馬尾', ns:'馬尾巴', lock:null,
    fImg:['hair_pony_boy.png','hair_pony_girl.png','hair_pony_kidboy.png','hair_pony_kidgirl.png'],
    f:'<path d="M180 74 c-48 0 -84 30 -84 74 0 8 1 15 3 21 5 -24 16 -37 28 -41 -2 9 0 18 4 24 6 -15 16 -24 28 -27 14 -4 40 -2 56 11 9 7 14 17 17 30 2 -6 3 -12 3 -18 0 -44 -32 -74 -79 -74 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>',
    b:'<path d="M226 96 c22 4 34 24 34 50 0 30 -12 60 -30 76 -6 5 -14 1 -12 -7 8 -24 12 -48 10 -70 -1 -18 -6 -34 -14 -42 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>' },
  { id:7, n:'自然中捲髮', ns:'捲捲頭', lock:null,
    fImg:['hair_curl_boy.png','hair_curl_girl.png','hair_curl_kidboy.png','hair_curl_kidgirl.png'],
    f:'<path d="M180 74 c-48 0 -84 30 -84 74 0 8 1 15 3 21 5 -24 15 -36 27 -40 -2 9 -1 18 3 24 6 -16 16 -25 28 -28 14 -4 42 -2 58 12 8 7 13 16 16 28 2 -6 3 -12 3 -19 0 -44 -33 -72 -79 -72 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>',
    b:'<path d="M102 132 c-10 18 -14 46 -8 70 -8 8 -10 24 -4 38 -6 10 -4 26 6 34 8 7 18 4 18 -6 12 12 30 18 46 14 12 8 28 8 40 0 16 4 34 -2 46 -14 0 10 10 13 18 6 10 -8 12 -24 6 -34 6 -14 4 -30 -4 -38 6 -24 2 -52 -8 -70 -12 -24 -42 -38 -78 -38 -36 0 -66 14 -78 38 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>' },
  { id:8, n:'圓滾丸子頭', ns:'包包頭', lock:{t:'soon'},
    f:'<path d="M180 78 c-46 0 -80 28 -80 70 0 8 1 15 3 21 5 -23 15 -35 27 -39 -2 9 -1 17 3 23 6 -15 16 -24 28 -27 13 -4 40 -2 55 11 8 7 13 16 16 28 2 -6 3 -11 3 -17 0 -42 -33 -70 -75 -70 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>'
     +'<circle cx="180" cy="66" r="26" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>', b:'' },
  { id:9, n:'狼尾層次髮', ns:'小狼尾', lock:{t:'soon'},
    f:'<path d="M180 74 c-48 0 -84 30 -84 74 0 7 1 14 2 20 4 -22 10 -34 20 -40 l-4 -18 16 10 c6 -8 14 -13 22 -15 l0 -18 14 14 c5 -1 9 -1 14 -1 5 0 9 0 14 1 l14 -14 0 18 c8 2 16 7 22 15 l16 -10 -4 18 c10 6 16 18 20 40 1 -6 2 -13 2 -20 0 -44 -32 -74 -84 -74 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>',
    b:'<path d="M112 136 c-10 16 -14 40 -10 62 l-10 24 18 -8 2 20 14 -14 c10 8 22 13 34 15 l-48 -99 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/><path d="M248 136 c10 16 14 40 10 62 l10 24 -18 -8 -2 20 -14 -14 c-10 8 -22 13 -34 15 l48 -99 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>' },
  /* ★ v4.55.3 — 新增兩款(PNG 素材主打;SVG 後備借用既有路徑造型) */
  { id:10, n:'低馬尾', ns:'低馬尾', lock:null,
    fImg:['hair_lowtail_boy.png','hair_lowtail_girl.png','hair_lowtail_kidboy.png','hair_lowtail_kidgirl.png'],
    f:'<path d="M180 74 c-48 0 -84 30 -84 74 0 8 1 15 3 21 5 -24 16 -37 28 -41 -2 9 0 18 4 24 6 -15 16 -24 28 -27 14 -4 40 -2 56 11 9 7 14 17 17 30 2 -6 3 -12 3 -18 0 -44 -32 -74 -79 -74 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>',
    b:'<path d="M118 150 c-14 10 -20 32 -16 56 4 26 16 48 32 58 6 4 13 0 11 -8 -10 -22 -14 -44 -13 -64 1 -16 -4 -32 -14 -42 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>' },
  { id:11, n:'超長直髮', ns:'超長頭髮', lock:null,
    fImg:['hair_xlong_boy.png','hair_xlong_girl.png','hair_xlong_kidboy.png','hair_xlong_kidgirl.png'],
    f:'<path d="M180 74 c-48 0 -84 30 -84 74 0 8 1 15 3 21 5 -24 15 -36 27 -40 -2 9 -1 18 3 24 6 -16 16 -25 28 -28 14 -4 42 -2 58 12 8 7 13 16 16 28 2 -6 3 -12 3 -19 0 -44 -33 -72 -79 -72 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>',
    b:'<path d="M103 130 c-8 20 -12 60 -10 96 1 26 6 50 14 64 4 7 12 6 14 -2 l6 -30 c14 10 32 16 53 16 21 0 39 -6 53 -16 l6 30 c2 8 10 9 14 2 8 -14 13 -38 14 -64 2 -36 -2 -76 -10 -96 -10 -26 -40 -40 -77 -40 -37 0 -67 14 -77 40 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>' },
  /* ★ v4.55.4(2026-07-18)— 老師 12 張變體圖第二批:中分/大馬尾/公主頭(SVG fallback 沿用近似款式路徑) */
  { id:12, n:'中分清爽短髮', ns:'中分頭', lock:null,
    fImg:['hair_mid_boy.png','hair_mid_girl.png','hair_mid_kidboy.png','hair_mid_kidgirl.png'],
    f:'<path d="M180 74 c-48 0 -84 30 -84 74 0 7 1 14 2 20 4 -24 12 -36 24 -42 -2 10 0 19 4 25 4 -16 12 -26 24 -30 16 -6 52 -6 74 10 8 6 14 16 17 30 2 -6 3 -12 3 -19 0 -44 -33 -74 -80 -74 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>', b:'' },
  { id:13, n:'飄逸大馬尾', ns:'大馬尾', lock:null,
    fImg:['hair_bigtail_boy.png','hair_bigtail_girl.png','hair_bigtail_kidboy.png','hair_bigtail_kidgirl.png'],
    f:'<path d="M180 74 c-48 0 -84 30 -84 74 0 8 1 15 3 21 5 -24 16 -37 28 -41 -2 9 0 18 4 24 6 -15 16 -24 28 -27 14 -4 40 -2 56 11 9 7 14 17 17 30 2 -6 3 -12 3 -18 0 -44 -32 -74 -79 -74 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>',
    b:'<path d="M226 96 c22 4 34 24 34 50 0 30 -12 60 -30 76 -6 5 -14 1 -12 -7 8 -24 12 -48 10 -70 -1 -18 -6 -34 -14 -42 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>' },
  { id:14, n:'公主頭髮辮', ns:'公主頭', lock:null,
    fImg:['hair_princess_boy.png','hair_princess_girl.png','hair_princess_kidboy.png','hair_princess_kidgirl.png'],
    f:'<path d="M180 74 c-48 0 -84 30 -84 74 l0 10 c0 6 6 8 10 4 l14 -16 8 14 c3 5 9 5 12 0 l8 -14 10 15 c3 5 9 5 12 0 l10 -15 10 15 c3 5 9 5 12 0 l10 -15 8 14 c3 5 9 5 12 0 l8 -14 14 16 c4 4 10 2 10 -4 l0 -10 c0 -44 -32 -74 -79 -74 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>',
    b:'<path d="M104 132 c-6 14 -8 34 -6 52 2 16 8 28 16 34 5 3 10 1 10 -5 l0 -60 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/><path d="M256 132 c6 14 8 34 6 52 -2 16 -8 28 -16 34 -5 3 -10 1 -10 -5 l0 -60 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>' },
  /* ★ v4.55.5(2026-07-18)— 老師 20 張變體圖第三批:7 款髮型(SVG fallback 借近似既有路徑:
   *   制服頭←清爽短髮、精靈捲捲←中捲、旁分頭/油亮頭←旁分瀏海、辮子頭/西瓜頭←妹妹頭、側馬尾←高馬尾) */
  { id:15, n:'學生制服短髮', ns:'制服頭', lock:null,
    fImg:['hair_uniform_boy.png','hair_uniform_girl.png','hair_uniform_kidboy.png','hair_uniform_kidgirl.png'],
    f:'<path d="M180 74 c-48 0 -84 30 -84 74 0 8 1 15 3 22 6 -26 20 -38 32 -40 -4 10 -4 20 -1 27 8 -18 20 -28 30 -30 -2 9 0 18 5 24 6 -16 16 -24 30 -26 12 -2 26 4 34 18 4 -8 4 -18 1 -26 12 4 22 16 26 33 2 -7 3 -14 3 -22 0 -44 -32 -74 -79 -74 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>', b:'' },
  { id:16, n:'精靈金色長捲', ns:'精靈捲捲', lock:null,
    fImg:['hair_elf_boy.png','hair_elf_girl.png','hair_elf_kidboy.png','hair_elf_kidgirl.png'],
    f:'<path d="M180 74 c-48 0 -84 30 -84 74 0 8 1 15 3 21 5 -24 15 -36 27 -40 -2 9 -1 18 3 24 6 -16 16 -25 28 -28 14 -4 42 -2 58 12 8 7 13 16 16 28 2 -6 3 -12 3 -19 0 -44 -33 -72 -79 -72 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>',
    b:'<path d="M102 132 c-10 18 -14 46 -8 70 -8 8 -10 24 -4 38 -6 10 -4 26 6 34 8 7 18 4 18 -6 12 12 30 18 46 14 12 8 28 8 40 0 16 4 34 -2 46 -14 0 10 10 13 18 6 10 -8 12 -24 6 -34 6 -14 4 -30 -4 -38 6 -24 2 -52 -8 -70 -12 -24 -42 -38 -78 -38 -36 0 -66 14 -78 38 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>' },
  { id:17, n:'斯文旁分頭', ns:'旁分頭', lock:null,
    fImg:['hair_sidepart_boy.png','hair_sidepart_girl.png','hair_sidepart_kidboy.png','hair_sidepart_kidgirl.png'],
    f:'<path d="M180 74 c-48 0 -84 30 -84 74 0 7 1 14 2 20 4 -24 12 -36 24 -42 -2 10 0 19 4 25 4 -16 12 -26 24 -30 16 -6 52 -6 74 10 8 6 14 16 17 30 2 -6 3 -12 3 -19 0 -44 -33 -74 -80 -74 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>', b:'' },
  { id:18, n:'雙辮子髮', ns:'辮子頭', lock:null,
    fImg:[null,'hair_braids_girl.png',null,null],   /* ★ v4.58.0 僅少女體型有件 */
    f:'<path d="M180 74 c-48 0 -84 30 -84 74 l0 10 c0 6 6 8 10 4 l14 -16 8 14 c3 5 9 5 12 0 l8 -14 10 15 c3 5 9 5 12 0 l10 -15 10 15 c3 5 9 5 12 0 l10 -15 8 14 c3 5 9 5 12 0 l8 -14 14 16 c4 4 10 2 10 -4 l0 -10 c0 -44 -32 -74 -79 -74 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>',
    b:'<path d="M104 132 c-6 14 -8 34 -6 52 2 16 8 28 16 34 5 3 10 1 10 -5 l0 -60 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/><path d="M256 132 c6 14 8 34 6 52 -2 16 -8 28 -16 34 -5 3 -10 1 -10 -5 l0 -60 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>' },
  { id:19, n:'紳士油頭', ns:'油亮頭', lock:null,
    fImg:['hair_slick_boy.png',null,null,null],   /* ★ v4.58.0 僅少年體型有件 */
    f:'<path d="M180 74 c-48 0 -84 30 -84 74 0 7 1 14 2 20 4 -24 12 -36 24 -42 -2 10 0 19 4 25 4 -16 12 -26 24 -30 16 -6 52 -6 74 10 8 6 14 16 17 30 2 -6 3 -12 3 -19 0 -44 -33 -74 -80 -74 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>', b:'' },
  { id:20, n:'單側俏馬尾', ns:'側馬尾', lock:null,
    fImg:[null,null,null,'hair_sideponytail_kidgirl.png'],   /* ★ v4.58.0 僅幼女體型有件 */
    f:'<path d="M180 74 c-48 0 -84 30 -84 74 0 8 1 15 3 21 5 -24 16 -37 28 -41 -2 9 0 18 4 24 6 -15 16 -24 28 -27 14 -4 40 -2 56 11 9 7 14 17 17 30 2 -6 3 -12 3 -18 0 -44 -32 -74 -79 -74 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>',
    b:'<path d="M226 96 c22 4 34 24 34 50 0 30 -12 60 -30 76 -6 5 -14 1 -12 -7 8 -24 12 -48 10 -70 -1 -18 -6 -34 -14 -42 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>' },
  { id:21, n:'西瓜皮短髮', ns:'西瓜頭', lock:null,
    fImg:[null,null,'hair_mushroom_kidboy.png',null],   /* ★ v4.58.0 僅幼男體型有件 */
    f:'<path d="M180 74 c-48 0 -84 30 -84 74 l0 10 c0 6 6 8 10 4 l14 -16 8 14 c3 5 9 5 12 0 l8 -14 10 15 c3 5 9 5 12 0 l10 -15 10 15 c3 5 9 5 12 0 l10 -15 8 14 c3 5 9 5 12 0 l8 -14 14 16 c4 4 10 2 10 -4 l0 -10 c0 -44 -32 -74 -79 -74 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>', b:'' },
  /* ★ v4.58.0 — 新款:中等長髮(差異法乾淨件;僅少年體型;SVG 後備借旁分路徑) */
  { id:22, n:'自然中等長髮', ns:'中長髮', lock:null,
    fImg:['hair_medium_boy.png',null,null,null],
    f:'<path d="M180 74 c-48 0 -84 30 -84 74 0 7 1 14 2 20 4 -24 12 -36 24 -42 -2 10 0 19 4 25 4 -16 12 -26 24 -30 16 -6 52 -6 74 10 8 6 14 16 17 30 2 -6 3 -12 3 -19 0 -44 -33 -74 -80 -74 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>', b:'' }
];

/* ── 眉毛 — 10 款(髮色) ── */
function browP(dL,dR){ return '<path d="'+dL+'" fill="none" stroke="__HC__" stroke-width="5" stroke-linecap="round"/><path d="'+dR+'" fill="none" stroke="__HC__" stroke-width="5" stroke-linecap="round"/>'; }
P.brow = [
  { id:0, n:'標準眉', ns:'一般眉', lock:null, svg:browP('M134 136 q16 -8 32 -2','M226 136 q-16 -8 -32 -2') },
  { id:1, n:'柔和彎眉', ns:'彎彎眉', lock:null, svg:browP('M134 138 q16 -12 32 -4','M226 138 q-16 -12 -32 -4') },
  { id:2, n:'英氣挑眉', ns:'帥氣眉', lock:null, svg:browP('M132 142 l34 -10','M228 142 l-34 -10') },
  { id:3, n:'困擾八字眉', ns:'八字眉', lock:null, svg:browP('M136 132 l30 8','M224 132 l-30 8') },
  { id:4, n:'粗直眉', ns:'粗粗眉', lock:null, svg:'<path d="M132 134 l36 -2" stroke="__HC__" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M228 134 l-36 -2" stroke="__HC__" stroke-width="9" stroke-linecap="round" fill="none"/>' },
  { id:5, n:'細長眉', ns:'細細眉', lock:null, svg:browP('M130 136 q18 -6 38 -2','M230 136 q-18 -6 -38 -2') },
  { id:6, n:'圓點短眉', ns:'點點眉', lock:null, svg:'<path d="M144 134 q8 -6 18 -2" stroke="__HC__" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M216 134 q-8 -6 -18 -2" stroke="__HC__" stroke-width="7" stroke-linecap="round" fill="none"/>' },
  { id:7, n:'怒氣上揚眉', ns:'生氣眉', lock:{t:'soon'}, svg:browP('M134 128 l32 12','M226 128 l-32 12') },
  { id:8, n:'波浪眉', ns:'波波眉', lock:{t:'soon'}, svg:browP('M132 136 q8 -8 16 -2 q8 6 18 -4','M228 136 q-8 -8 -16 -2 q-8 6 -18 -4') },
  { id:9, n:'閃電眉', ns:'閃電眉', lock:{t:'soon'}, svg:browP('M132 138 l12 -8 6 6 14 -8','M228 138 l-12 -8 -6 6 -14 -8') }
];

/* ── 眼睛 — 10 款(瞳色) ── */
function eyePair(one){ return one.replace(/__X__/g,'150') + one.replace(/__X__/g,'210'); }
P.eye = [
  { id:0, n:'圓亮大眼', ns:'圓圓眼', lock:null, svg:eyePair('<ellipse cx="__X__" cy="166" rx="13" ry="15" fill="#fff" stroke="__LN__" stroke-width="3"/><circle cx="__X__" cy="168" r="8" fill="__EC__"/><circle cx="__X__" cy="164" r="3" fill="#fff"/>') },
  { id:1, n:'標準杏眼', ns:'一般眼', lock:null, svg:eyePair('<path d="M__X__ 156 c8 0 13 5 13 11 0 7 -5 12 -13 12 -8 0 -13 -5 -13 -12 0 -6 5 -11 13 -11 z" fill="#fff" stroke="__LN__" stroke-width="3"/><circle cx="__X__" cy="168" r="7" fill="__EC__"/><circle cx="__X__" cy="165" r="2.5" fill="#fff"/>') },
  { id:2, n:'星光閃閃眼', ns:'星星眼', lock:null, svg:eyePair('<ellipse cx="__X__" cy="166" rx="13" ry="15" fill="#fff" stroke="__LN__" stroke-width="3"/><circle cx="__X__" cy="168" r="9" fill="__EC__"/><path d="M__X__ 161 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" fill="#fff"/>') },
  { id:3, n:'瞇瞇笑眼', ns:'瞇瞇眼', lock:null,
    img:['eye_smile_boy.png','eye_smile_girl.png','eye_smile_kidboy.png','eye_smile_kidgirl.png'],   /* ★ v4.55.4 老師變體圖素材 */
    svg:'<path d="M138 168 q12 -12 24 0" fill="none" stroke="__LN__" stroke-width="4.5" stroke-linecap="round"/><path d="M222 168 q-12 -12 -24 0" fill="none" stroke="__LN__" stroke-width="4.5" stroke-linecap="round"/>' },
  { id:4, n:'半月垂眼', ns:'月亮眼', lock:null,
    img:['eye_soft_boy.png','eye_soft_girl.png','eye_soft_kidboy.png','eye_soft_kidgirl.png'],
    svg:eyePair('<path d="M__X__ 158 c8 0 13 5 13 12 l-26 0 c0 -7 5 -12 13 -12 z" fill="#fff" stroke="__LN__" stroke-width="3"/><path d="M__X__ 162 a6 6 0 0 1 6 8 l-12 0 a6 6 0 0 1 6 -8 z" fill="__EC__"/>') },
  { id:5, n:'銳利鳳眼', ns:'帥帥眼', lock:null,
    img:['eye_cool_boy.png','eye_cool_girl.png','eye_cool_kidboy.png','eye_cool_kidgirl.png'],
    svg:eyePair('<path d="M__X__ 160 c9 -2 14 3 14 8 0 6 -5 10 -14 10 -8 0 -12 -4 -12 -9 0 -5 4 -8 12 -9 z" fill="#fff" stroke="__LN__" stroke-width="3"/><circle cx="__X__" cy="169" r="6" fill="__EC__"/>') },
  { id:6, n:'圓豆豆眼', ns:'豆豆眼', lock:null, svg:'<circle cx="150" cy="167" r="7" fill="__LN__"/><circle cx="210" cy="167" r="7" fill="__LN__"/><circle cx="152" cy="164" r="2" fill="#fff"/><circle cx="212" cy="164" r="2" fill="#fff"/>' },
  { id:7, n:'貓瞳眼', ns:'貓貓眼', lock:{t:'soon'}, svg:eyePair('<ellipse cx="__X__" cy="166" rx="12" ry="14" fill="#fff" stroke="__LN__" stroke-width="3"/><ellipse cx="__X__" cy="167" rx="4" ry="9" fill="__EC__"/>') },
  { id:8, n:'渦渦眼', ns:'蚊香眼', lock:{t:'soon'}, svg:'<path d="M150 167 m8 0 a8 8 0 1 1 -4 -7 a5 5 0 1 0 1 5" fill="none" stroke="__LN__" stroke-width="3.5"/><path d="M210 167 m8 0 a8 8 0 1 1 -4 -7 a5 5 0 1 0 1 5" fill="none" stroke="__LN__" stroke-width="3.5"/>' },
  { id:9, n:'愛心眼', ns:'愛心眼', lock:{t:'soon'}, svg:eyePair('<path d="M__X__ 176 c-8 -6 -12 -11 -12 -15 0 -4 3 -6 6 -6 3 0 5 2 6 4 1 -2 3 -4 6 -4 3 0 6 2 6 6 0 4 -4 9 -12 15 z" fill="__EC__" stroke="__LN__" stroke-width="2.5"/>') },
  /* ★ v4.55.4(2026-07-18)— 老師 12 張變體圖第二批:神氣眼(壞壞笑)/水汪眼(柔弱) */
  { id:10, n:'自信神采眼', ns:'神氣眼', lock:null,
    img:['eye_sly_boy.png','eye_sly_girl.png','eye_sly_kidboy.png','eye_sly_kidgirl.png'],
    svg:eyePair('<path d="M__X__ 160 c9 -2 14 3 14 8 0 6 -5 10 -14 10 -8 0 -12 -4 -12 -9 0 -5 4 -8 12 -9 z" fill="#fff" stroke="__LN__" stroke-width="3"/><circle cx="__X__" cy="169" r="6" fill="__EC__"/>') },
  { id:11, n:'柔弱水汪眼', ns:'水汪眼', lock:null,
    img:['eye_gentle_boy.png','eye_gentle_girl.png','eye_gentle_kidboy.png','eye_gentle_kidgirl.png'],
    svg:eyePair('<ellipse cx="__X__" cy="166" rx="13" ry="15" fill="#fff" stroke="__LN__" stroke-width="3"/><circle cx="__X__" cy="168" r="8" fill="__EC__"/><circle cx="__X__" cy="164" r="3" fill="#fff"/>') },
  /* ★ v4.55.5(2026-07-18)— 老師 20 張變體圖第三批:高傲眼(含挑眉,精靈套裝配套;SVG 後備借鳳眼路徑) */
  { id:12, n:'高傲自信眼', ns:'高傲眼', lock:null,
    img:['eye_proud_boy.png','eye_proud_girl.png','eye_proud_kidboy.png','eye_proud_kidgirl.png'],
    svg:eyePair('<path d="M__X__ 160 c9 -2 14 3 14 8 0 6 -5 10 -14 10 -8 0 -12 -4 -12 -9 0 -5 4 -8 12 -9 z" fill="#fff" stroke="__LN__" stroke-width="3"/><circle cx="__X__" cy="169" r="6" fill="__EC__"/>') }
];

/* ── 鼻子 — 10 款 ── */
P.nose = [
  { id:0, n:'小點鼻', ns:'點點鼻', lock:null, svg:'<circle cx="180" cy="186" r="2.6" fill="__LN__"/>' },
  { id:1, n:'小勾鼻', ns:'小勾鼻', lock:null, svg:'<path d="M178 180 q5 4 0 9" fill="none" stroke="__LN__" stroke-width="3" stroke-linecap="round"/>' },
  { id:2, n:'圓潤鼻', ns:'圓圓鼻', lock:null, svg:'<ellipse cx="180" cy="186" rx="5" ry="4" fill="__SK__" stroke="__LN__" stroke-width="2.5"/>' },
  { id:3, n:'倒三角鼻', ns:'三角鼻', lock:null, svg:'<path d="M175 181 l10 0 -5 8 z" fill="__LN__"/>' },
  { id:4, n:'小豎線鼻', ns:'線線鼻', lock:null, svg:'<path d="M180 179 l0 9" stroke="__LN__" stroke-width="3" stroke-linecap="round" fill="none"/>' },
  { id:5, n:'害羞紅鼻', ns:'紅紅鼻', lock:null, svg:'<circle cx="180" cy="186" r="4.5" fill="#e88a8a" stroke="__LN__" stroke-width="2"/>' },
  { id:6, n:'隱形鼻', ns:'看不見鼻', lock:null, svg:'' },
  { id:7, n:'貓咪W鼻', ns:'貓貓鼻', lock:{t:'soon'}, svg:'<path d="M174 183 l6 5 6 -5 z" fill="#e88aa0" stroke="__LN__" stroke-width="2"/>' },
  { id:8, n:'狗狗圓鼻', ns:'狗狗鼻', lock:{t:'soon'}, svg:'<ellipse cx="180" cy="185" rx="6" ry="5" fill="__LN__"/><circle cx="178" cy="183" r="1.6" fill="#fff"/>' },
  { id:9, n:'星星鼻', ns:'星星鼻', lock:{t:'soon'}, svg:'<path d="M180 179 l2 5 5 1 -4 4 1 5 -4 -3 -4 3 1 -5 -4 -4 5 -1 z" fill="#ffd35a" stroke="__LN__" stroke-width="1.8"/>' }
];

/* ── 嘴巴 — 10 款 ── */
P.mouth = [
  { id:0, n:'開心微笑', ns:'微笑嘴', lock:null,
    _offImg:['mouth_smile_boy.png','mouth_smile_girl.png','mouth_smile_kidboy.png','mouth_smile_kidgirl.png'],   /* ★ v4.55.4 老師變體圖素材 */
    svg:'<path d="M166 206 q14 12 28 0" fill="none" stroke="__LN__" stroke-width="4" stroke-linecap="round"/>' },
  { id:1, n:'大笑開口', ns:'哈哈嘴', lock:null, svg:'<path d="M162 204 q18 22 36 0 z" fill="#8a3040" stroke="__LN__" stroke-width="3"/><path d="M168 210 q12 8 24 0 l0 4 q-12 8 -24 0 z" fill="#ff9aa8"/>' },
  { id:2, n:'抿嘴淺笑', ns:'小小笑', lock:null, svg:'<path d="M172 208 q8 5 16 0" fill="none" stroke="__LN__" stroke-width="3.5" stroke-linecap="round"/>' },
  { id:3, n:'驚訝圓嘴', ns:'哇哇嘴', lock:null, svg:'<ellipse cx="180" cy="209" rx="7" ry="9" fill="#8a3040" stroke="__LN__" stroke-width="3"/>' },
  { id:4, n:'貓型嘴', ns:'貓貓嘴', lock:null, svg:'<path d="M166 206 q7 8 14 0 q7 8 14 0" fill="none" stroke="__LN__" stroke-width="3.5" stroke-linecap="round"/>' },
  { id:5, n:'鼓氣嘟嘴', ns:'嘟嘟嘴', lock:null, svg:'<path d="M172 210 q8 -6 16 0" fill="none" stroke="__LN__" stroke-width="4" stroke-linecap="round"/>' },
  { id:6, n:'吐舌俏皮', ns:'吐舌頭', lock:null, svg:'<path d="M166 205 q14 10 28 0" fill="none" stroke="__LN__" stroke-width="3.5" stroke-linecap="round"/><path d="M176 208 q4 10 10 8 q4 -2 2 -9 z" fill="#ff8898" stroke="__LN__" stroke-width="2.5"/>' },
  { id:7, n:'小虎牙笑', ns:'小虎牙', lock:{t:'soon'}, svg:'<path d="M164 204 q16 16 32 0 z" fill="#8a3040" stroke="__LN__" stroke-width="3"/><path d="M170 205 l5 0 -2.5 6 z" fill="#fff"/><path d="M185 205 l5 0 -2.5 6 z" fill="#fff"/>' },
  { id:8, n:'波浪困惑嘴', ns:'歪歪嘴', lock:{t:'soon'}, svg:'<path d="M166 208 q5 -5 10 0 q4 5 9 0 q4 -5 9 0" fill="none" stroke="__LN__" stroke-width="3.5" stroke-linecap="round"/>' },
  { id:9, n:'鴨鴨嘴', ns:'鴨鴨嘴', lock:{t:'soon'}, svg:'<path d="M170 204 q10 -5 20 0 q-4 6 -10 6 q-6 0 -10 -6 z" fill="#ffb64f" stroke="__LN__" stroke-width="2.5"/><path d="M170 206 q10 3 20 0" fill="none" stroke="__LN__" stroke-width="2"/>' },
  /* ★ v4.55.4(2026-07-18)— 老師 12 張變體圖第二批:嘿嘿嘴(壞壞笑)/癟癟嘴(柔弱) */
  { id:10, n:'得意露齒笑', ns:'嘿嘿嘴', lock:null,
    img:[null,'mouth_sly_girl.png','mouth_sly_kidboy.png','mouth_sly_kidgirl.png'],   /* ★ v4.58.0 少年版原圖嘴無變化,無件(null=該體型隱藏) */
    svg:'<path d="M164 204 q16 16 32 0 z" fill="#8a3040" stroke="__LN__" stroke-width="3"/><path d="M167 205 q13 5 26 0 l0 5 q-13 5 -26 0 z" fill="#fff"/>' },
  { id:11, n:'委屈抿嘴', ns:'癟癟嘴', lock:null,
    img:[null,'mouth_gentle_girl.png','mouth_gentle_kidboy.png','mouth_gentle_kidgirl.png'],   /* ★ v4.58.0 少年版原圖嘴無變化,無件 */
    svg:'<path d="M172 210 q8 -6 16 0" fill="none" stroke="__LN__" stroke-width="4" stroke-linecap="round"/>' }
];

/* ── 耳朵 — 7 款(0=人耳臉側;獸耳掛頭頂,精靈耳臉側) ── */
P.ear = [
  { id:0, n:'一般耳', ns:'一般耳', lock:null, pos:'side',
    svg:'<ellipse cx="102" cy="168" rx="9" ry="13" fill="__SK__" stroke="__LN__" stroke-width="3"/><ellipse cx="258" cy="168" rx="9" ry="13" fill="__SK__" stroke="__LN__" stroke-width="3"/>' },
  { id:1, n:'精靈長耳', ns:'精靈耳', lock:null, pos:'side',   /* ★ v4.58.0 差異法乾淨件掛回並解鎖 */
    img:['ear_elf_boy.png','ear_elf_girl.png','ear_elf_kidboy.png','ear_elf_kidgirl.png'],
    svg:'<path d="M104 160 c-14 -4 -28 -12 -36 -24 6 20 14 34 30 40 6 2 10 -2 10 -8 z" fill="__SK__" stroke="__LN__" stroke-width="3"/><path d="M256 160 c14 -4 28 -12 36 -24 -6 20 -14 34 -30 40 -6 2 -10 -2 -10 -8 z" fill="__SK__" stroke="__LN__" stroke-width="3"/>' },
  { id:2, n:'貓貓耳', ns:'貓耳朵', lock:{t:'soon'}, pos:'top',
    svg:'<path d="M118 108 l-8 -34 32 18 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/><path d="M122 104 l-4 -18 16 9 z" fill="#ffb0c4"/><path d="M242 108 l8 -34 -32 18 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/><path d="M238 104 l4 -18 -16 9 z" fill="#ffb0c4"/>' },
  { id:3, n:'兔兔長耳', ns:'兔耳朵', lock:{t:'soon'}, pos:'top',
    svg:'<path d="M142 96 c-8 -34 -4 -58 8 -62 12 -4 18 18 14 56 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/><path d="M148 88 c-4 -22 -2 -38 4 -40 6 -2 9 12 7 38 z" fill="#ffb0c4"/><path d="M218 96 c8 -34 4 -58 -8 -62 -12 -4 -18 18 -14 56 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/><path d="M212 88 c4 -22 2 -38 -4 -40 -6 -2 -9 12 -7 38 z" fill="#ffb0c4"/>' },
  { id:4, n:'狐狸尖耳', ns:'狐狸耳', lock:{t:'soon'}, pos:'top',
    svg:'<path d="M112 112 l-12 -44 40 24 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/><path d="M118 106 l-7 -26 24 15 z" fill="#fff"/><path d="M248 112 l12 -44 -40 24 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/><path d="M242 106 l7 -26 -24 15 z" fill="#fff"/>' },
  { id:5, n:'熊熊圓耳', ns:'熊耳朵', lock:{t:'soon'}, pos:'top',
    svg:'<circle cx="126" cy="92" r="17" fill="__HC__" stroke="__LN__" stroke-width="3.5"/><circle cx="126" cy="92" r="8" fill="#e8b98a"/><circle cx="234" cy="92" r="17" fill="__HC__" stroke="__LN__" stroke-width="3.5"/><circle cx="234" cy="92" r="8" fill="#e8b98a"/>' },
  { id:6, n:'垂垂犬耳', ns:'狗耳朵', lock:{t:'soon'}, pos:'top',
    svg:'<path d="M116 96 c-14 6 -20 30 -14 52 4 14 14 20 22 14 6 -5 6 -18 4 -34 -2 -14 -5 -28 -12 -32 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/><path d="M244 96 c14 6 20 30 14 52 -4 14 -14 20 -22 14 -6 -5 -6 -18 -4 -34 2 -14 5 -28 12 -32 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>' }
];

/* ── 角 — 5 款(頭頂) ── */
P.horn = [
  { id:0, n:'無', ns:'不戴', lock:null, svg:'' },
  { id:1, n:'森之鹿角', ns:'小鹿角', lock:{t:'soon'},
    svg:'<path d="M138 92 c-6 -18 -16 -28 -30 -32 8 -2 14 -2 20 0 -4 -8 -10 -13 -18 -16 10 0 19 4 25 12 2 -6 2 -12 0 -18 8 8 12 20 12 34 z" fill="#b98a5e" stroke="__LN__" stroke-width="3"/><path d="M222 92 c6 -18 16 -28 30 -32 -8 -2 -14 -2 -20 0 4 -8 10 -13 18 -16 -10 0 -19 4 -25 12 -2 -6 -2 -12 0 -18 -8 8 -12 20 -12 34 z" fill="#b98a5e" stroke="__LN__" stroke-width="3"/>' },
  { id:2, n:'魔龍尖角', ns:'小龍角', lock:{t:'soon'},
    svg:'<path d="M136 96 c-10 -14 -12 -30 -6 -44 10 8 16 22 16 40 z" fill="#c94848" stroke="__LN__" stroke-width="3"/><path d="M224 96 c10 -14 12 -30 6 -44 -10 8 -16 22 -16 40 z" fill="#c94848" stroke="__LN__" stroke-width="3"/>' },
  { id:3, n:'威風牛角', ns:'牛牛角', lock:{t:'soon'},
    svg:'<path d="M130 100 c-18 -2 -30 -12 -34 -28 14 2 26 8 36 18 z" fill="#e8e0d4" stroke="__LN__" stroke-width="3"/><path d="M230 100 c18 -2 30 -12 34 -28 -14 2 -26 8 -36 18 z" fill="#e8e0d4" stroke="__LN__" stroke-width="3"/>' },
  { id:4, n:'綿羊捲角', ns:'羊咩角', lock:{t:'soon'},
    svg:'<path d="M134 100 a16 16 0 1 0 -20 -20 a10 10 0 1 1 12 14 z" fill="#e8d4a8" stroke="__LN__" stroke-width="3"/><path d="M226 100 a16 16 0 1 1 20 -20 a10 10 0 1 0 -12 14 z" fill="#e8d4a8" stroke="__LN__" stroke-width="3"/>' }
];

/* ── 翅膀 — 5 款(身後) ── */
P.wing = [
  { id:0, n:'無', ns:'不裝', lock:null, svg:'' },
  { id:1, n:'天使白翼', ns:'天使翅膀', lock:{t:'soon'},
    svg:'<path d="M120 268 c-34 -18 -62 -14 -80 6 16 2 26 8 32 16 -10 0 -18 3 -24 9 10 2 18 6 23 12 -7 2 -12 6 -15 12 20 6 44 -2 64 -22 z" fill="#f5f2ff" stroke="__LN__" stroke-width="3"/><path d="M240 268 c34 -18 62 -14 80 6 -16 2 -26 8 -32 16 10 0 18 3 24 9 -10 2 -18 6 -23 12 7 2 12 6 15 12 -20 6 -44 -2 -64 -22 z" fill="#f5f2ff" stroke="__LN__" stroke-width="3"/>' },
  { id:2, n:'惡魔黑翼', ns:'小惡魔翅膀', lock:{t:'soon'},
    svg:'<path d="M122 270 c-30 -22 -58 -24 -76 -10 12 4 20 10 24 18 l-16 2 18 12 -10 6 c16 8 40 2 60 -14 z" fill="#5a3d78" stroke="__LN__" stroke-width="3"/><path d="M238 270 c30 -22 58 -24 76 -10 -12 4 -20 10 -24 18 l16 2 -18 12 10 6 c-16 8 -40 2 -60 -14 z" fill="#5a3d78" stroke="__LN__" stroke-width="3"/>' },
  { id:3, n:'妖精晶翼', ns:'妖精翅膀', lock:{t:'soon'},
    svg:'<g opacity="0.85"><ellipse cx="112" cy="266" rx="34" ry="18" transform="rotate(-28 112 266)" fill="#b8f0e4" stroke="__LN__" stroke-width="3"/><ellipse cx="118" cy="296" rx="24" ry="13" transform="rotate(-12 118 296)" fill="#d4f5ee" stroke="__LN__" stroke-width="3"/><ellipse cx="248" cy="266" rx="34" ry="18" transform="rotate(28 248 266)" fill="#b8f0e4" stroke="__LN__" stroke-width="3"/><ellipse cx="242" cy="296" rx="24" ry="13" transform="rotate(12 242 296)" fill="#d4f5ee" stroke="__LN__" stroke-width="3"/></g>' },
  { id:4, n:'蝴蝶彩翼', ns:'蝴蝶翅膀', lock:{t:'soon'},
    svg:'<path d="M124 262 c-28 -26 -56 -30 -72 -16 -10 10 -6 26 10 34 -12 4 -14 16 -4 24 12 10 36 6 66 -20 z" fill="#ffb8d9" stroke="__LN__" stroke-width="3"/><circle cx="92" cy="270" r="7" fill="#a04fd4"/><circle cx="86" cy="296" r="5" fill="#a04fd4"/><path d="M236 262 c28 -26 56 -30 72 -16 10 10 6 26 -10 34 12 4 14 16 4 24 -12 10 -36 6 -66 -20 z" fill="#ffb8d9" stroke="__LN__" stroke-width="3"/><circle cx="268" cy="270" r="7" fill="#a04fd4"/><circle cx="274" cy="296" r="5" fill="#a04fd4"/>' }
];

/* ── 尾巴 — 7 款(身後右下) ── */
P.tail = [
  { id:0, n:'無', ns:'不裝', lock:null, svg:'' },
  { id:1, n:'貓貓尾', ns:'貓尾巴', lock:{t:'soon'},
    svg:'<path d="M232 390 c26 4 42 -6 46 -28 3 -18 -4 -34 -18 -42 8 12 10 26 4 38 -6 12 -18 18 -34 16 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/>' },
  { id:2, n:'搖搖犬尾', ns:'狗尾巴', lock:{t:'soon'},
    svg:'<path d="M232 388 c20 0 34 -10 38 -28 3 -14 -2 -26 -12 -34 4 10 4 20 -2 28 -6 10 -14 14 -26 14 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/><path d="M262 336 c4 -4 10 -6 16 -6 -2 6 -6 10 -12 12 z" fill="#fff" stroke="__LN__" stroke-width="2.5"/>' },
  { id:3, n:'圓球兔尾', ns:'兔尾球', lock:{t:'soon'},
    svg:'<circle cx="220" cy="386" r="15" fill="#fff" stroke="__LN__" stroke-width="3.5"/>' },
  { id:4, n:'蜥蜴龍尾', ns:'小龍尾', lock:{t:'soon'},
    svg:'<path d="M228 392 c30 6 52 -2 60 -24 6 -16 0 -32 -14 -40 6 12 6 24 -2 34 -10 12 -26 16 -44 12 z" fill="#54b98a" stroke="__LN__" stroke-width="3.5"/><path d="M270 340 l8 -12 4 14 z" fill="#3f8a68" stroke="__LN__" stroke-width="2.5"/><path d="M282 352 l12 -8 -2 14 z" fill="#3f8a68" stroke="__LN__" stroke-width="2.5"/>' },
  { id:5, n:'閃亮魚尾', ns:'魚尾巴', lock:{t:'soon'},
    svg:'<path d="M226 392 c22 8 40 4 50 -10 -4 12 -4 22 2 30 -14 2 -24 -2 -30 -10 -2 8 -8 14 -16 16 2 -10 0 -20 -6 -26 z" fill="#7ac9e8" stroke="__LN__" stroke-width="3.5"/><circle cx="248" cy="396" r="3" fill="#fff" opacity="0.8"/><circle cx="260" cy="390" r="2.5" fill="#fff" opacity="0.8"/>' },
  { id:6, n:'蓬蓬狐尾', ns:'狐狸尾', lock:{t:'soon'},
    svg:'<path d="M228 394 c28 10 52 4 62 -18 8 -18 2 -38 -14 -48 8 14 8 30 -2 42 -12 14 -30 18 -46 12 z" fill="__HC__" stroke="__LN__" stroke-width="3.5"/><path d="M276 330 c8 -2 16 0 22 6 -8 14 -18 20 -30 18 z" fill="#fff" stroke="__LN__" stroke-width="2.5"/>' }
];

/* ── 手持物 — 11 款(右手 262,318 附近,最前層) ── */
P.held = [
  { id:0, n:'空手', ns:'空空手', lock:null, svg:'' },
  { id:1, n:'勇者長劍', ns:'小小劍', lock:null,
    svg:'<g transform="rotate(-18 262 318)"><path d="M259 318 l0 -84 3 -10 3 10 0 84 z" fill="#d4dbe8" stroke="__LN__" stroke-width="3"/><path d="M248 318 l28 0 0 8 -28 0 z" fill="#c9a441" stroke="__LN__" stroke-width="3"/><path d="M258 326 l8 0 0 26 c0 4 -8 4 -8 0 z" fill="#8a5a2f" stroke="__LN__" stroke-width="3"/></g>' },
  { id:2, n:'長柄戰戟', ns:'長長槍', lock:{t:'soon'},
    svg:'<g transform="rotate(-8 262 330)"><path d="M260 420 l0 -170 4 0 0 170 z" fill="#8a5a2f" stroke="__LN__" stroke-width="3"/><path d="M262 250 l-12 -22 12 -12 12 12 z" fill="#d4dbe8" stroke="__LN__" stroke-width="3"/></g>' },
  { id:3, n:'能量手槍', ns:'咻咻槍', lock:{t:'soon'},
    svg:'<g transform="rotate(-10 262 318)"><path d="M244 310 l40 0 0 12 -24 0 -2 14 -10 0 2 -14 -6 0 z" fill="#5a6b8a" stroke="__LN__" stroke-width="3"/><circle cx="286" cy="316" r="4" fill="#7ae0ff" stroke="__LN__" stroke-width="2"/></g>' },
  { id:4, n:'星辰魔杖', ns:'魔法棒', lock:null,
    svg:'<g transform="rotate(-14 262 318)"><path d="M260 336 l0 -78 4 0 0 78 z" fill="#a06bd4" stroke="__LN__" stroke-width="3"/><path d="M262 240 l5 12 13 2 -9 9 2 13 -11 -6 -11 6 2 -13 -9 -9 13 -2 z" fill="#ffd35a" stroke="__LN__" stroke-width="3"/></g>' },
  { id:5, n:'智慧之書', ns:'魔法書', lock:{t:'soon'},
    svg:'<g transform="rotate(8 258 320)"><path d="M234 304 l24 6 24 -6 0 34 -24 6 -24 -6 z" fill="#4457c9" stroke="__LN__" stroke-width="3"/><path d="M258 310 l0 34" stroke="__LN__" stroke-width="2.5"/><path d="M240 314 l12 3 M240 322 l12 3 M264 317 l12 -3 M264 325 l12 -3" stroke="#c9d4ff" stroke-width="2.5"/></g>' },
  { id:6, n:'影刃匕首', ns:'小匕首', lock:{t:'soon'},
    svg:'<g transform="rotate(-24 262 318)"><path d="M260 318 l0 -40 3 -8 3 8 0 40 z" fill="#b8c4d4" stroke="__LN__" stroke-width="3"/><path d="M252 318 l20 0 0 6 -20 0 z" fill="#5a3d78" stroke="__LN__" stroke-width="3"/><path d="M259 324 l8 0 0 16 c0 3 -8 3 -8 0 z" fill="#3d2a54" stroke="__LN__" stroke-width="3"/></g>' },
  { id:7, n:'守護棍棒', ns:'大棒棒', lock:{t:'soon'},
    svg:'<g transform="rotate(-16 262 322)"><path d="M256 356 l-8 -88 c-1 -12 26 -12 25 0 l-8 88 z" fill="#b98a5e" stroke="__LN__" stroke-width="3"/><circle cx="252" cy="278" r="3" fill="#8a5a2f"/><circle cx="268" cy="290" r="3" fill="#8a5a2f"/></g>' },
  { id:8, n:'預言水晶球', ns:'水晶球', lock:{t:'soon'},
    svg:'<path d="M244 322 l36 0 -5 10 -26 0 z" fill="#c9a441" stroke="__LN__" stroke-width="3"/><circle cx="262" cy="302" r="20" fill="#b8e4ff" opacity="0.9" stroke="__LN__" stroke-width="3"/><path d="M252 294 a12 12 0 0 1 8 -4" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>' },
  { id:9, n:'不屈之盾', ns:'大盾牌', lock:{t:'soon'},
    svg:'<path d="M240 280 c14 -6 30 -6 44 0 2 26 -4 48 -22 60 -18 -12 -24 -34 -22 -60 z" fill="#5a8ad4" stroke="__LN__" stroke-width="3.5"/><path d="M262 288 l6 10 -6 10 -6 -10 z" fill="#ffd35a" stroke="__LN__" stroke-width="2.5"/>' },
  { id:10, n:'空手魔法', ns:'手手魔法', lock:{t:'soon'},
    svg:'<circle cx="266" cy="300" r="13" fill="#ffdf8a" opacity="0.9" stroke="#ffb84f" stroke-width="3"/><path d="M266 284 l3 7 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 z" fill="#fff"/><circle cx="286" cy="286" r="3.5" fill="#ffdf8a"/><circle cx="250" cy="284" r="2.8" fill="#ffdf8a"/>' }
];

/* ── 配件:帽 / 眼鏡 / 項鍊 / 手鐲 / 披風 ── */
P.hat = [
  { id:0, n:'無', ns:'不戴', lock:null, svg:'' },
  { id:1, n:'尖頂魔法帽', ns:'魔法帽', lock:null,
    svg:'<path d="M110 104 l140 0 c6 0 6 8 0 9 l-140 0 c-6 -1 -6 -9 0 -9 z" fill="#5a3d9e" stroke="__LN__" stroke-width="3"/><path d="M132 106 c6 -34 22 -58 48 -68 -4 12 -2 20 6 24 -12 18 -16 32 -14 44 z" fill="#6b4ab8" stroke="__LN__" stroke-width="3"/><circle cx="186" cy="62" r="6" fill="#ffd35a" stroke="__LN__" stroke-width="2.5"/>' },
  { id:2, n:'棒球帽', ns:'鴨舌帽', lock:{t:'soon'},
    svg:'<path d="M112 110 c0 -30 30 -50 68 -50 38 0 68 20 68 50 z" fill="#d45a5a" stroke="__LN__" stroke-width="3"/><path d="M240 110 l52 -2 c6 0 6 8 0 9 l-52 2 z" fill="#b84444" stroke="__LN__" stroke-width="3"/><circle cx="180" cy="62" r="5" fill="#fff" stroke="__LN__" stroke-width="2"/>' },
  { id:3, n:'花冠', ns:'小花圈', lock:{t:'soon'},
    svg:'<g stroke="__LN__" stroke-width="2.2"><circle cx="132" cy="102" r="7" fill="#ff9ab8"/><circle cx="156" cy="92" r="7" fill="#ffd35a"/><circle cx="180" cy="88" r="7" fill="#ff9ab8"/><circle cx="204" cy="92" r="7" fill="#8ad4a0"/><circle cx="228" cy="102" r="7" fill="#ffd35a"/></g>' }
];
P.glasses = [
  { id:0, n:'無', ns:'不戴', lock:null, svg:'' },
  { id:1, n:'圓框眼鏡', ns:'圓眼鏡', lock:null,
    svg:'<g fill="none" stroke="__LN__" stroke-width="3.5"><circle cx="150" cy="167" r="18"/><circle cx="210" cy="167" r="18"/><path d="M168 165 q12 -6 24 0 M132 162 l-24 -6 M228 162 l24 -6"/></g>' },
  { id:2, n:'方框眼鏡', ns:'方眼鏡', lock:{t:'soon'},
    svg:'<g fill="none" stroke="__LN__" stroke-width="3.5"><rect x="132" y="152" width="36" height="28" rx="6"/><rect x="192" y="152" width="36" height="28" rx="6"/><path d="M168 164 l24 0 M132 160 l-24 -5 M228 160 l24 -5"/></g>' },
  { id:3, n:'星星墨鏡', ns:'酷墨鏡', lock:{t:'soon'},
    svg:'<g stroke="__LN__" stroke-width="3"><path d="M132 154 l7 20 -20 -13 24 0 -20 13 z M192 154 l7 20 -20 -13 24 0 -20 13 z" fill="#2b2b33" transform="translate(11 0) scale(1.55) translate(-58 -87)"/><path d="M130 152 l40 0 4 26 -48 0 z" fill="#2b2b33"/><path d="M190 152 l40 0 4 26 -48 0 z" fill="#2b2b33"/><path d="M170 162 l20 0 M130 158 l-22 -5 M234 158 l22 -5" fill="none"/></g>' },
  /* ★ v4.55.5(2026-07-18)— 老師 20 張變體圖第三批:黑框眼鏡(PNG 四體型;SVG 後備借方框路徑) */
  { id:4, n:'經典黑框眼鏡', ns:'黑框眼鏡', lock:null,
    img:['glasses_black_boy.png','glasses_black_girl.png','glasses_black_kidboy.png','glasses_black_kidgirl.png'],
    svg:'<g fill="none" stroke="#22222a" stroke-width="5"><rect x="132" y="152" width="36" height="28" rx="6"/><rect x="192" y="152" width="36" height="28" rx="6"/><path d="M168 164 l24 0 M132 160 l-24 -6 M228 160 l24 -6"/></g>' }
];
P.neck = [
  { id:0, n:'無', ns:'不戴', lock:null, svg:'' },
  { id:1, n:'星星項鍊', ns:'星星鍊', lock:null,
    svg:'<path d="M154 238 q26 18 52 0" fill="none" stroke="#c9a441" stroke-width="3"/><path d="M180 250 l3 7 8 1 -6 6 2 8 -7 -4 -7 4 2 -8 -6 -6 8 -1 z" fill="#ffd35a" stroke="__LN__" stroke-width="2.2"/>' },
  { id:2, n:'愛心項鍊', ns:'愛心鍊', lock:{t:'soon'},
    svg:'<path d="M154 238 q26 18 52 0" fill="none" stroke="#d4d9e0" stroke-width="3"/><path d="M180 266 c-8 -6 -11 -10 -11 -14 0 -4 3 -6 6 -6 2 0 4 1 5 3 1 -2 3 -3 5 -3 3 0 6 2 6 6 0 4 -3 8 -11 14 z" fill="#ff7a9e" stroke="__LN__" stroke-width="2.2"/>' },
  { id:3, n:'領巾', ns:'小領巾', lock:{t:'soon'},
    svg:'<path d="M150 236 q30 22 60 0 l-8 14 q-22 12 -44 0 z" fill="#e2603f" stroke="__LN__" stroke-width="3"/><path d="M176 250 l8 0 -2 22 -4 4 -4 -4 z" fill="#e2603f" stroke="__LN__" stroke-width="3"/>' }
];
P.wrist = [
  { id:0, n:'無', ns:'不戴', lock:null, svg:'' },
  { id:1, n:'金色手鐲', ns:'金手環', lock:null,
    svg:'<path d="M112 322 q12 8 24 0 l0 8 q-12 8 -24 0 z" fill="#ffd35a" stroke="__LN__" stroke-width="2.5"/>' },
  { id:2, n:'串珠手鐲', ns:'珠珠環', lock:{t:'soon'},
    svg:'<g stroke="__LN__" stroke-width="2"><circle cx="115" cy="326" r="4" fill="#ff9ab8"/><circle cx="123" cy="329" r="4" fill="#8ad4a0"/><circle cx="131" cy="326" r="4" fill="#7ac9e8"/></g>' },
  { id:3, n:'勇氣護腕', ns:'護手套', lock:{t:'soon'},
    svg:'<path d="M240 316 q-14 8 -26 0 l0 14 q12 8 26 0 z" fill="#8a5a2f" stroke="__LN__" stroke-width="2.5"/><path d="M228 320 l0 8" stroke="#ffd35a" stroke-width="2.5"/>' }
];
P.cape = [
  { id:0, n:'無', ns:'不穿', lock:null, b:'', f:'' },
  { id:1, n:'冒險者披風', ns:'冒險披風', lock:null,
    b:'<path d="M136 244 l88 0 c18 60 22 118 14 168 -34 14 -82 14 -116 0 -8 -50 -4 -108 14 -168 z" fill="#c94848" stroke="__LN__" stroke-width="3.5"/>',
    f:'<path d="M148 240 l64 0 c5 0 8 6 4 10 l-14 10 -44 0 -14 -10 c-4 -4 -1 -10 4 -10 z" fill="#a83838" stroke="__LN__" stroke-width="3"/>' },
  { id:2, n:'魔導士披風', ns:'魔法披風', lock:{t:'soon'},
    b:'<path d="M136 244 l88 0 c18 60 22 118 14 168 -34 14 -82 14 -116 0 -8 -50 -4 -108 14 -168 z" fill="#4a3d8a" stroke="__LN__" stroke-width="3.5"/><circle cx="160" cy="330" r="4" fill="#ffd35a"/><circle cx="204" cy="360" r="3.5" fill="#ffd35a"/><circle cx="180" cy="300" r="3" fill="#ffd35a"/>',
    f:'<path d="M148 240 l64 0 c5 0 8 6 4 10 l-14 10 -44 0 -14 -10 c-4 -4 -1 -10 4 -10 z" fill="#38306b" stroke="__LN__" stroke-width="3"/>' },
  { id:3, n:'王族披風', ns:'國王披風', lock:{t:'soon'},
    b:'<path d="M136 244 l88 0 c18 60 22 118 14 168 -34 14 -82 14 -116 0 -8 -50 -4 -108 14 -168 z" fill="#8a2f5a" stroke="__LN__" stroke-width="3.5"/><path d="M134 400 c36 16 88 16 106 0 l4 14 c-38 16 -76 16 -114 0 z" fill="#f5f0e6" stroke="__LN__" stroke-width="3"/>',
    f:'<path d="M148 240 l64 0 c5 0 8 6 4 10 l-14 10 -44 0 -14 -10 c-4 -4 -1 -10 4 -10 z" fill="#6b2444" stroke="__LN__" stroke-width="3"/><circle cx="180" cy="248" r="5" fill="#ffd35a" stroke="__LN__" stroke-width="2"/>' }
];

/* ── ★ v4.55.1 新分類(老師指定模組):耳環 / 口罩 / 襪子 — 佔位就緒,等素材圖 ── */
P.earring = [ { id:0, n:'無', ns:'不戴', lock:null } ];
P.mask    = [ { id:0, n:'無', ns:'不戴', lock:null } ];
P.sock    = [ { id:0, n:'無', ns:'不穿', lock:null } ];

/* ── 上衣 — 10 款(蓋在軀幹 y248~352) ── */
function topBase(fill, extra){
  return '<path d="M180 226 c-28 2 -46 15 -48 38 l-4 66 c0 8 6 12 12 12 l80 0 c6 0 12 -4 12 -12 l-4 -66 c-2 -23 -20 -36 -48 -38 z" fill="'+fill+'" stroke="__LN__" stroke-width="3.5"/>'
   +'<path d="M133 260 c-9 4 -14 12 -15 23 l-3 44 c0 7 5 12 11 12 7 0 11 -5 11 -12 l0 -63 z" fill="'+fill+'" stroke="__LN__" stroke-width="3.5"/>'
   +'<path d="M227 260 c9 4 14 12 15 23 l3 44 c0 7 -5 12 -11 12 -7 0 -11 -5 -11 -12 l0 -63 z" fill="'+fill+'" stroke="__LN__" stroke-width="3.5"/>' + (extra||'');
}
P.top = [
  { id:0, n:'預設運動服', ns:'運動服', lock:null, svg:topBase('#f2b03f','<path d="M162 234 q18 12 36 0" fill="none" stroke="__LN__" stroke-width="3"/>') },   /* ★ v4.58.0 更名(PNG 模式選此=素體內建運動服) */
  { id:1, n:'學園襯衫', ns:'小襯衫', lock:null, svg:topBase('#f5f2ee','<path d="M180 232 l-10 14 10 8 10 -8 z" fill="#d4dbe8" stroke="__LN__" stroke-width="2.5"/><path d="M180 254 l0 84" stroke="__LN__" stroke-width="2.5"/><circle cx="180" cy="268" r="2.5" fill="__LN__"/><circle cx="180" cy="290" r="2.5" fill="__LN__"/><circle cx="180" cy="312" r="2.5" fill="__LN__"/>') },
  { id:2, n:'連帽外套', ns:'帽T', lock:null, svg:topBase('#5a8ad4','<path d="M152 236 c8 -12 48 -12 56 0 4 8 -4 14 -12 12 -10 -3 -22 -3 -32 0 -8 2 -16 -4 -12 -12 z" fill="#4a76b8" stroke="__LN__" stroke-width="3"/><path d="M172 258 l0 16 M188 258 l0 16" stroke="#e8eef8" stroke-width="3.5" stroke-linecap="round"/>') },
  { id:3, n:'蓬蓬洋裝上身', ns:'洋裝', lock:null, svg:topBase('#ff9ab8','<path d="M158 238 q22 14 44 0 l0 8 q-22 12 -44 0 z" fill="#fff" stroke="__LN__" stroke-width="2.5"/><circle cx="180" cy="286" r="4" fill="#fff" stroke="__LN__" stroke-width="2"/>') },
  { id:4, n:'運動球衣', ns:'球衣', lock:null, svg:topBase('#54b98a','<path d="M148 300 l64 0" stroke="#fff" stroke-width="4"/><text x="180" y="292" font-size="26" font-weight="900" fill="#fff" text-anchor="middle" font-family="sans-serif">1</text>') },
  { id:5, n:'吊帶背心', ns:'小背心', lock:null, svg:topBase('#7a5ac9','<path d="M156 232 l10 20 M204 232 l-10 20" stroke="#ffd35a" stroke-width="4" stroke-linecap="round"/>') },
  { id:6, n:'和風羽織', ns:'和服', lock:{t:'soon'}, svg:topBase('#3f4d8a','<path d="M180 232 l-24 44 M180 232 l24 44" stroke="#e8eef8" stroke-width="4"/><path d="M148 300 l64 0 0 12 -64 0 z" fill="#c94848" stroke="__LN__" stroke-width="2.5"/>') },
  { id:7, n:'鎧甲胸擋', ns:'鎧甲', lock:{t:'soon'}, svg:topBase('#8a94a8','<path d="M158 244 l44 0 c6 22 4 44 -22 56 -26 -12 -28 -34 -22 -56 z" fill="#b8c4d4" stroke="__LN__" stroke-width="3"/><path d="M180 258 l5 9 -5 9 -5 -9 z" fill="#ffd35a" stroke="__LN__" stroke-width="2"/>') },
  { id:8, n:'魔女長袍上身', ns:'魔女袍', lock:{t:'soon'}, svg:topBase('#4a3d78','<path d="M156 240 q24 16 48 0 l-4 12 q-20 12 -40 0 z" fill="#38306b" stroke="__LN__" stroke-width="2.5"/><path d="M164 320 l8 -10 8 10 8 -10 8 -10 8 10" fill="none" stroke="#ffd35a" stroke-width="2.5"/>') },
  { id:9, n:'古埃及束衣', ns:'埃及裝', lock:{t:'soon'}, svg:topBase('#f0e2c4','<path d="M150 246 q30 22 60 0 l0 10 q-30 20 -60 0 z" fill="#3f8fd4" stroke="__LN__" stroke-width="2.5"/><path d="M150 250 q30 22 60 0" fill="none" stroke="#ffd35a" stroke-width="3"/>') },
  /* ★ v4.55.5(2026-07-18)— 老師 20 張變體圖第三批:6 款 PNG 服裝(SVG 後備借 topBase 換色;
   *   洋裝/西裝/吊帶為連身整套,含裙擺/褲管,佔上衣槽) */
  { id:10, n:'簡約白T恤', ns:'白T恤', lock:null,
    img:['top_tee_boy.png','top_tee_girl.png','top_tee_kidboy.png','top_tee_kidgirl.png'],
    svg:topBase('#f5f2ee','<path d="M162 234 q18 12 36 0" fill="none" stroke="__LN__" stroke-width="3"/>') },
  { id:11, n:'學生制服套裝', ns:'學生制服', lock:null,
    img:['top_uniform_boy.png','top_uniform_girl.png','top_uniform_kidboy.png','top_uniform_kidgirl.png'],
    svg:topBase('#3f4d8a','<path d="M180 232 l-10 14 10 8 10 -8 z" fill="#f5f2ee" stroke="__LN__" stroke-width="2.5"/><path d="M180 254 l0 84" stroke="__LN__" stroke-width="2.5"/>') },
  { id:12, n:'藍色連身長裙', ns:'藍長裙', lock:null,
    img:[null,'top_bluedress_girl.png',null,null],   /* ★ v4.58.0 僅少女體型有件 */
    svg:topBase('#7ac0e8','<path d="M158 238 q22 14 44 0 l0 8 q-22 12 -44 0 z" fill="#fff" stroke="__LN__" stroke-width="2.5"/>') },
  { id:13, n:'紳士西裝', ns:'帥西裝', lock:null,
    img:['top_suit_boy.png',null,null,null],   /* ★ v4.58.0 僅少年體型有件 */
    svg:topBase('#3a4560','<path d="M180 232 l-12 18 12 10 12 -10 z" fill="#f5f2ee" stroke="__LN__" stroke-width="2.5"/><path d="M176 242 l8 0 -4 30 z" fill="#8a3040"/>') },
  { id:14, n:'粉紅小洋裝', ns:'粉洋裝', lock:null,
    img:[null,null,null,'top_pinkdress_kidgirl.png'],   /* ★ v4.58.0 僅幼女體型有件(同色系差異稀疏,老師測試判定) */
    svg:topBase('#ff9ab8','<path d="M158 238 q22 14 44 0 l0 8 q-22 12 -44 0 z" fill="#fff" stroke="__LN__" stroke-width="2.5"/><circle cx="180" cy="286" r="4" fill="#fff" stroke="__LN__" stroke-width="2"/>') },
  { id:15, n:'吊帶短褲裝', ns:'吊帶裝', lock:null,
    img:[null,null,'top_overall_kidboy.png',null],   /* ★ v4.58.0 僅幼男體型有件 */
    svg:topBase('#4a76b8','<path d="M156 232 l10 20 M204 232 l-10 20" stroke="#3a5e94" stroke-width="4" stroke-linecap="round"/>') }
];

/* ── 下衣 — 10 款(y336~400) ── */
P.btm = [
  { id:0, n:'預設運動短褲', ns:'運動短褲', lock:null, svg:'<path d="M148 334 l64 0 4 40 c1 5 -3 8 -8 8 l-14 0 c-4 0 -7 -3 -8 -7 l-6 -24 -6 24 c-1 4 -4 7 -8 7 l-14 0 c-5 0 -9 -3 -8 -8 z" fill="#5a6b8a" stroke="__LN__" stroke-width="3.5"/>' },   /* ★ v4.58.0 更名 */
  { id:1, n:'百褶裙', ns:'小裙裙', lock:null, svg:'<path d="M150 334 l60 0 14 44 c2 5 -2 9 -7 9 l-74 0 c-5 0 -9 -4 -7 -9 z" fill="#c94858" stroke="__LN__" stroke-width="3.5"/><path d="M158 340 l-6 44 M172 340 l-3 46 M188 340 l3 46 M202 340 l6 44" stroke="#a83848" stroke-width="2.5" fill="none"/>' },
  { id:2, n:'長褲', ns:'長褲褲', lock:null, svg:'<path d="M148 334 l64 0 4 92 c0 5 -4 8 -9 8 l-12 0 c-4 0 -8 -3 -8 -8 l-7 -60 -7 60 c0 5 -4 8 -8 8 l-12 0 c-5 0 -9 -3 -9 -8 z" fill="#3f4d6b" stroke="__LN__" stroke-width="3.5"/>' },
  { id:3, n:'蓬蓬紗裙', ns:'蓬蓬裙', lock:null, svg:'<path d="M150 334 l60 0 16 40 c3 6 -1 12 -8 12 l-8 0 -8 -8 -8 8 -16 0 -8 -8 -8 8 -8 0 c-7 0 -11 -6 -8 -12 z" fill="#ffb8d9" stroke="__LN__" stroke-width="3.5"/>' },
  { id:4, n:'運動短裙褲', ns:'裙褲', lock:null, svg:'<path d="M150 334 l60 0 10 36 c2 5 -2 9 -7 9 l-66 0 c-5 0 -9 -4 -7 -9 z" fill="#54b98a" stroke="__LN__" stroke-width="3.5"/><path d="M150 342 l60 0" stroke="#fff" stroke-width="3"/>' },
  { id:5, n:'吊帶工作褲', ns:'吊帶褲', lock:null, svg:'<path d="M148 330 l64 0 4 96 c0 5 -4 8 -9 8 l-12 0 c-4 0 -8 -3 -8 -8 l-7 -60 -7 60 c0 5 -4 8 -8 8 l-12 0 c-5 0 -9 -3 -9 -8 z" fill="#4a76b8" stroke="__LN__" stroke-width="3.5"/><rect x="168" y="336" width="24" height="16" rx="3" fill="#3a5e94" stroke="__LN__" stroke-width="2.5"/>' },
  { id:6, n:'和風袴', ns:'和服褲', lock:{t:'soon'}, svg:'<path d="M146 334 l68 0 10 90 c1 5 -3 9 -8 9 l-16 0 c-4 0 -8 -3 -9 -8 l-11 -52 -11 52 c-1 5 -5 8 -9 8 l-16 0 c-5 0 -9 -4 -8 -9 z" fill="#8a3040" stroke="__LN__" stroke-width="3.5"/><path d="M160 344 l40 0" stroke="#ffd35a" stroke-width="3"/>' },
  { id:7, n:'鎧甲戰裙', ns:'鐵裙裙', lock:{t:'soon'}, svg:'<path d="M150 334 l60 0 10 36 c2 5 -2 9 -7 9 l-66 0 c-5 0 -9 -4 -7 -9 z" fill="#8a94a8" stroke="__LN__" stroke-width="3.5"/><path d="M162 340 l0 36 M180 340 l0 39 M198 340 l0 36" stroke="__LN__" stroke-width="2.5"/>' },
  { id:8, n:'魔女長裙', ns:'魔女裙', lock:{t:'soon'}, svg:'<path d="M148 334 l64 0 20 84 c2 6 -2 11 -8 11 l-88 0 c-6 0 -10 -5 -8 -11 z" fill="#4a3d78" stroke="__LN__" stroke-width="3.5"/><path d="M156 400 l10 -12 10 12 10 -12 10 12 10 -12 10 12" fill="none" stroke="#ffd35a" stroke-width="2.5"/>' },
  { id:9, n:'古埃及圍裙', ns:'埃及裙', lock:{t:'soon'}, svg:'<path d="M150 334 l60 0 6 52 c1 5 -3 9 -8 9 l-56 0 c-5 0 -9 -4 -8 -9 z" fill="#f0e2c4" stroke="__LN__" stroke-width="3.5"/><path d="M172 334 l16 0 -4 56 -8 0 z" fill="#3f8fd4" stroke="__LN__" stroke-width="2.5"/>' },
  /* ★ v4.55.5(2026-07-18)— 老師 20 張變體圖第三批(SVG 後備借長褲換色) */
  { id:10, n:'休閒牛仔褲', ns:'牛仔褲', lock:null,
    img:['btm_jeans_boy.png','btm_jeans_girl.png','btm_jeans_kidboy.png','btm_jeans_kidgirl.png'],
    svg:'<path d="M148 334 l64 0 4 92 c0 5 -4 8 -9 8 l-12 0 c-4 0 -8 -3 -8 -8 l-7 -60 -7 60 c0 5 -4 8 -8 8 l-12 0 c-5 0 -9 -3 -9 -8 z" fill="#4a76b8" stroke="__LN__" stroke-width="3.5"/>' }
];

/* ── 鞋子 — 10 款(y426~466) ── */
function shoeP(fill, extra){
  return '<path d="M152 432 l24 0 2 18 c0 5 -4 8 -9 8 l-16 0 c-6 0 -9 -5 -7 -10 z" fill="'+fill+'" stroke="__LN__" stroke-width="3.5"/>'
   +'<path d="M208 432 l-24 0 -2 18 c0 5 4 8 9 8 l16 0 c6 0 9 -5 7 -10 z" fill="'+fill+'" stroke="__LN__" stroke-width="3.5"/>' + (extra||'');
}
P.shoe = [
  { id:0, n:'打赤腳', ns:'光腳丫', lock:null, svg:shoeP('#e84f4f','<path d="M154 446 l20 0 M186 446 l20 0" stroke="#fff" stroke-width="3.5"/>') },   /* ★ v4.58.0 更名(PNG 模式選此=素體赤腳) */
  { id:1, n:'小皮鞋', ns:'皮鞋', lock:null, svg:shoeP('#6b4a2f') },
  { id:2, n:'長筒靴', ns:'長靴', lock:null, svg:'<path d="M154 404 l22 0 2 46 c0 5 -4 8 -9 8 l-14 0 c-6 0 -9 -5 -7 -10 z" fill="#8a5a2f" stroke="__LN__" stroke-width="3.5"/><path d="M206 404 l-22 0 -2 46 c0 5 4 8 9 8 l14 0 c6 0 9 -5 7 -10 z" fill="#8a5a2f" stroke="__LN__" stroke-width="3.5"/>' },
  { id:3, n:'瑪莉珍鞋', ns:'娃娃鞋', lock:null, svg:shoeP('#c94858','<path d="M156 440 l18 0 M186 440 l18 0" stroke="__LN__" stroke-width="2.5"/><circle cx="165" cy="440" r="2.2" fill="#ffd35a"/><circle cx="195" cy="440" r="2.2" fill="#ffd35a"/>') },
  { id:4, n:'涼鞋', ns:'涼涼鞋', lock:null, svg:shoeP('#f2b03f','<path d="M158 438 l14 8 M172 438 l-14 8 M202 438 l-14 8 M188 438 l14 8" stroke="__LN__" stroke-width="2.5"/>') },
  { id:5, n:'絨毛拖鞋', ns:'毛毛拖', lock:null, svg:shoeP('#ffb8d9','<circle cx="164" cy="438" r="4" fill="#fff"/><circle cx="196" cy="438" r="4" fill="#fff"/>') },
  { id:6, n:'忍者足袋', ns:'忍者鞋', lock:{t:'soon'}, svg:shoeP('#3f4d6b','<path d="M164 432 l0 24 M196 432 l0 24" stroke="__LN__" stroke-width="2.5"/>') },
  { id:7, n:'鐵甲戰靴', ns:'鐵靴靴', lock:{t:'soon'}, svg:shoeP('#8a94a8','<path d="M154 442 l22 0 M184 442 l22 0" stroke="__LN__" stroke-width="2.5"/>') },
  { id:8, n:'魔法星星鞋', ns:'星星鞋', lock:{t:'soon'}, svg:shoeP('#7a5ac9','<path d="M164 440 l2 4 4 1 -3 3 1 4 -4 -2 -4 2 1 -4 -3 -3 4 -1 z" fill="#ffd35a"/><path d="M196 440 l2 4 4 1 -3 3 1 4 -4 -2 -4 2 1 -4 -3 -3 4 -1 z" fill="#ffd35a"/>') },
  { id:9, n:'黃金法老鞋', ns:'金金鞋', lock:{t:'soon'}, svg:shoeP('#ffd35a','<path d="M154 446 l22 0 M184 446 l22 0" stroke="#c9a441" stroke-width="3"/>') },
  /* ★ v4.55.5(2026-07-18)— 老師 20 張變體圖第三批(SVG 後備借 shoeP 換色) */
  { id:10, n:'休閒帆布鞋', ns:'帆布鞋', lock:null,
    img:['shoe_sneaker_boy.png','shoe_sneaker_girl.png','shoe_sneaker_kidboy.png','shoe_sneaker_kidgirl.png'],
    svg:shoeP('#5a6b8a','<path d="M154 446 l20 0 M186 446 l20 0" stroke="#fff" stroke-width="3.5"/>') },
  { id:11, n:'學生皮鞋襪', ns:'制服鞋', lock:null,
    _offImg:['shoe_loafer_boy.png','shoe_loafer_girl.png','shoe_loafer_kidboy.png','shoe_loafer_kidgirl.png'],
    svg:shoeP('#4a3428','<path d="M154 438 l22 0 M184 438 l22 0" stroke="#f5f2ee" stroke-width="3"/>') },
  { id:12, n:'黑亮皮鞋', ns:'黑皮鞋', lock:null,
    _offImg:['shoe_leather_boy.png','shoe_leather_girl.png','shoe_leather_kidboy.png','shoe_leather_kidgirl.png'],
    svg:shoeP('#22222a') }
];

/* ── 整套造型(★ v4.59.0)— 整張取代素體基礎圖(選擇時隱藏素體·老師裁定) ──
 * img=[少年,少女,男童,女童] 四體型陣列·缺格 null 該體型自動隱藏(沿用 v4.58.0 機制)
 * 素材 504×720 同素體規格·頭頂/腳底已對齊素體幾何·其餘圖層(髮/鏡/帽/手持)照常疊加 */
P.full = [
  { id:0, n:'無(自由搭配)', ns:'自己搭配', lock:null, img:null },
  { id:1, n:'輕裝大劍士套裝', ns:'大劍士裝', lock:null,
    img:[null, null, 'fullbody_lightgreatsword_kidboy.png', null] },
  { id:2, n:'華麗細劍士套裝', ns:'細劍士裝', lock:null,
    img:[null, 'fullbody_fancyrapier_girl.png', null, null] },
  { id:3, n:'重裝鎧甲劍士套裝', ns:'鎧甲劍士裝', lock:null,
    img:['fullbody_heavysword_boy.png', null, null, null] },
  { id:4, n:'俏麗雙劍士套裝', ns:'雙劍士裝', lock:null,
    img:[null, null, null, 'fullbody_dualblade_kidgirl.png'] },
  { id:5, n:'水藍魔法師套裝', ns:'水水魔法裝', lock:null,
    img:[null, null, null, 'fullbody_aquamage_kidgirl.png'] },
  { id:6, n:'紫電魔法師套裝', ns:'閃電魔法裝', lock:null,
    img:[null, 'fullbody_thundermage_girl.png', null, null] },
  { id:7, n:'赤紅魔法師套裝', ns:'火火魔法裝', lock:null,
    img:['fullbody_flamemage_boy.png', null, null, null] },
  { id:8, n:'翠綠魔法師套裝', ns:'綠綠魔法裝', lock:null,
    img:[null, null, 'fullbody_forestmage_kidboy.png', null] },
  { id:9, n:'日式和服', ns:'和服', lock:null,
    img:['fullbody_kimono_boy.png', 'fullbody_kimono_girl.png', 'fullbody_kimono_kidboy.png', 'fullbody_kimono_kidgirl.png'] }
];

/* ── 名片語錄(玩家擇一;內容非說明文字,單版) ── */
window.AVATAR_QUOTES = [
  '我還沒覺醒,但我很努力!','貓空纜車坐一半,人生轉彎。','超能力是什麼?能吃嗎?',
  '今天也是元氣滿滿的一天!','別看我這樣,我可是主角!','裂縫那邊的空氣比較甜。',
  '夥伴多的人最強!','我的必殺技是——寫功課!','午餐吃什麼,是永恆的難題。',
  '慢慢來,比較快。','我不是路痴,是路在躲我。','世界很大,我很勇敢!',
  '打不贏就交朋友!','努力不一定成功,但很帥!','我的字典裡沒有放棄(因為還沒買字典)。',
  '睡飽才有力氣拯救世界。','數學是我的天敵,朋友是我的超能力。','嘿嘿,你也來自另一個世界嗎?',
  '向著夢想,全速前進!','安靜!我在耍帥。'
];

/* ════════════════════════════════════════
 * 3. 渲染器
 *    cfg = { body,skin,face,hair,hairC,brow,eye,eyeC,nose,mouth,
 *            ear,horn,wing,tail,held,hat,gls,neck,wrist,cape,top,btm,sh }
 * ════════════════════════════════════════ */
window._avatarDefaultCfg = function(){
  return { v:1, body:0, skin:0, face:0, hair:0, hairC:0, brow:0, eye:0, eyeC:0,
    nose:0, mouth:0, ear:0, horn:0, wing:0, tail:0, held:0,
    hat:0, gls:0, neck:0, wrist:0, cape:0, top:0, btm:0, sh:0, q:0,
    browC:0, earr:0, mask:0, sock:0, full:0 };   /* ★ v4.59.0 full=整套造型 */
};

function _pick(list, idx){
  var i = (typeof idx === 'number' && idx >= 0 && idx < list.length) ? idx : 0;
  return list[i];
}
function _col(list, idx){
  var i = (typeof idx === 'number' && idx >= 0 && idx < list.length) ? idx : 0;
  return list[i];
}
function _fill(svg, sk, hc, ec){
  if(!svg) return '';
  return svg.split('__SK__').join(sk).split('__HC__').join(hc)
            .split('__EC__').join(ec).split('__LN__').join(LN);
}

/* ★ v4.55.2 — 部件圖檔解析:字串直接回傳;陣列依體型索引取檔
 *   [0]=少年 body_boy、[1]=少女 body_girl、[2]=幼男 body_kidboy、[3]=幼女 body_kidgirl */
function _avImgFor(val, bodyIdx){
  if(!val) return val;
  if(Object.prototype.toString.call(val) === '[object Array]'){
    var k = bodyIdx|0;
    if(k < 0 || k >= val.length) k = 0;
    return val[k];
  }
  return val;
}

window._avatarRenderSVG = function(cfg, sizeCss){
  cfg = cfg || window._avatarDefaultCfg();
  var PAL = window.AVATAR_PALETTES;
  var sk = _col(PAL.skin, cfg.skin), hc = _col(PAL.hair, cfg.hairC), ec = _col(PAL.eye, cfg.eyeC);
  var isKid = (cfg.body === 2 || cfg.body === 3);
  var bodyDef = _pick(P.body, cfg.body);

  /* ★ v4.55.0 PNG 模式:只疊「有 img 的部件」,全畫布圖層同 transform 自動對齊
   *   圖層序(底→頂):翅 → 披風後 → 後髮 → 尾 → 素體(含臉五官) → 鞋 → 下衣 → 上衣
   *   → 手鐲 → 披風前領 → 項鍊 → 五官替換件 → 前髮 → 頂耳 → 角 → 眼鏡 → 帽 → 手持 */
  if(window._AVATAR_PNG_MODE && bodyDef.img){
    var tf = AVATAR_IMG_TF[cfg.body] || AVATAR_IMG_TF[0];
    var hairD = _pick(P.hair, cfg.hair), capePng = _pick(P.cape, cfg.cape);
    var earPng = _pick(P.ear, cfg.ear);
    /* ★ v4.55.1 素體染色層(膚/瞳/眉):快取命中用染後圖;未命中先出原圖、背景染色完成後自動重繪 */
    var bodySrc2 = null;
    if(window._avatarNeedTint(cfg)){
      var tk2 = _avatarTintKey(cfg);
      if(_avTintCache[tk2]){ bodySrc2 = _avTintCache[tk2]; }
      else {
        window._avatarComposeBody(cfg, function(u){
          if(!u) return;
          try{ _avRefreshPreview(); }catch(_e){}
          try{ if(typeof window._avatarCardRerender === 'function') window._avatarCardRerender(); }catch(_e){}
        });
      }
    }
    /* ★ v4.55.1 髮色:髮型為獨立圖層 → 整層染色(素材加入後即生效) */
    function _hairLayer(imgFile){
      imgFile = _avImgFor(imgFile, cfg.body);   /* ★ v4.55.2 依體型解析陣列素材 */
      if(!imgFile) return '';
      if((cfg.hairC|0) > 0){
        var hk = imgFile + '|' + window.AVATAR_PALETTES.hair[cfg.hairC];
        if(_avLayerTintCache[hk]) return _imgLayerSrc(_avLayerTintCache[hk], tf);
        window._avatarTintLayer(imgFile, window.AVATAR_PALETTES.hair[cfg.hairC], 0.55, function(u){
          if(!u) return;
          try{ _avRefreshPreview(); }catch(_e){}
          try{ if(typeof window._avatarCardRerender === 'function') window._avatarCardRerender(); }catch(_e){}
        });
      }
      return _imgLayer(imgFile, tf);
    }
    /* 圖層序(底→頂):翅 → 披風後 → 後髮 → 尾 → 素體(含臉五官) → 襪 → 鞋 → 下衣 → 上衣
     * → 手鐲 → 披風前領 → 項鍊 → 五官替換件 → 口罩 → 前髮 → 頂耳 → 耳環 → 角 → 眼鏡 → 帽 → 手持 */
    /* ★ v4.59.0 整套造型:整張取代素體(隱藏基礎圖·老師裁定),其餘圖層照常疊加;
     *   膚色/瞳色染色不套用於整套素材(素材自帶完整外觀) */
    var fullPng = _avImgFor(_pick(P.full, cfg.full).img, cfg.body);
    var png = ''
      + _imgLayer(_pick(P.wing, cfg.wing).img, tf)
      + _imgLayer(capePng.bImg, tf)
      + _hairLayer(hairD.bImg)
      + _imgLayer(_pick(P.tail, cfg.tail).img, tf)
      + (fullPng ? _imgLayer(fullPng, tf) : (bodySrc2 ? _imgLayerSrc(bodySrc2, tf) : _imgLayer(bodyDef.img, tf)))   /* ★ v4.59.0 fullPng 優先=隱藏素體 */
      + _imgLayer(_avImgFor(_pick(P.sock, cfg.sock).img, cfg.body), tf)   /* ★ v4.55.5 襪/鞋/下衣/上衣/耳/眼鏡同步支援四體型陣列 */
      + _imgLayer(_avImgFor(_pick(P.shoe, cfg.sh).img, cfg.body), tf)
      + _imgLayer(_avImgFor(_pick(P.btm, cfg.btm).img, cfg.body), tf)
      + _imgLayer(_avImgFor(_pick(P.top, cfg.top).img, cfg.body), tf)
      + _imgLayer(_pick(P.wrist, cfg.wrist).img, tf)
      + _imgLayer(capePng.fImg, tf)
      + _imgLayer(_pick(P.neck, cfg.neck).img, tf)
      + _imgLayer(_avImgFor(_pick(P.brow, cfg.brow).img, cfg.body), tf)   /* ★ v4.55.4 眉/鼻/嘴同步支援四體型陣列 */
      + _imgLayer(_avImgFor(_pick(P.eye, cfg.eye).img, cfg.body), tf)   /* ★ v4.55.3 眼神部件依體型解析 */
      + _imgLayer(_avImgFor(_pick(P.nose, cfg.nose).img, cfg.body), tf)
      + _imgLayer(_avImgFor(_pick(P.mouth, cfg.mouth).img, cfg.body), tf)
      + _imgLayer(_pick(P.mask, cfg.mask).img, tf)
      + _hairLayer(hairD.fImg)
      + _imgLayer(_avImgFor(earPng.img, cfg.body), tf)
      + _imgLayer(_pick(P.earring, cfg.earr).img, tf)
      + _imgLayer(_pick(P.horn, cfg.horn).img, tf)
      + _imgLayer(_avImgFor(_pick(P.glasses, cfg.gls).img, cfg.body), tf)
      + _imgLayer(_pick(P.hat, cfg.hat).img, tf)
      + _imgLayer(_pick(P.held, cfg.held).img, tf);
    return '<svg viewBox="0 0 360 480" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="'
      + (sizeCss || 'width:100%;height:100%;') + 'display:block;">' + png + '</svg>';
  }

  var bodySvg = bodyDef.svg;
  if(bodySvg && bodySvg.charAt(0) === '@') bodySvg = P.body[parseInt(bodySvg.slice(1),10)].svg;

  var hair = _pick(P.hair, cfg.hair);
  var earD = _pick(P.ear, cfg.ear);
  var capeD = _pick(P.cape, cfg.cape);

  /* 幼兒:身體區塊縮矮(頭不縮 → 更 Q);頭部下移與縮短的頸部相連
   * ★ v4.55.0 老師回報修正:原 translate(0,26) 頭浮在半空 —
   *   幾何:頸 y225 經 scale(0.9,0.72) 錨 y438 → y=(225-438)*0.72+438=284.6,
   *   頭需下移 ≈56(頭底 232+56=288 與頸 284.6 微疊 3px 自然銜接) */
  var bodyT = isKid ? ' transform="translate(180,438) scale(0.9,0.72) translate(-180,-438)"' : '';
  var headT = isKid ? ' transform="translate(0,56)"' : '';
  var backT = isKid ? ' transform="translate(180,420) scale(0.95,0.82) translate(-180,-420)"' : '';
  /* ★ v4.55.0 老師回報修正:髮型包覆 — 髮以臉心(180,152)為錨放大 7%,
   *   讓髮蓋住臉輪廓外緣(原本髮僅比臉寬 8px 視覺像浮貼) */
  var hairWrapOpen = '<g transform="translate(180,152) scale(1.07,1.05) translate(-180,-152)">';

  var s = '';
  /* 後層:翅 → 披風後 → 尾 → 後髮 */
  s += '<g'+backT+'>' + _fill(_pick(P.wing, cfg.wing).svg, sk, hc, ec)
     + _fill(capeD.b, sk, hc, ec)
     + _fill(_pick(P.tail, cfg.tail).svg, sk, hc, ec) + '</g>';
  s += '<g'+headT+'>' + hairWrapOpen + _fill(hair.b || '', sk, hc, ec) + '</g></g>';
  /* 身體組:體、鞋、下衣、上衣、手鐲、披風前領、項鍊 */
  s += '<g'+bodyT+'>' + _fill(bodySvg, sk, hc, ec)
     + _fill(_pick(P.shoe, cfg.sh).svg, sk, hc, ec)
     + _fill(_pick(P.btm, cfg.btm).svg, sk, hc, ec)
     + _fill(_pick(P.top, cfg.top).svg, sk, hc, ec)
     + _fill(_pick(P.wrist, cfg.wrist).svg, sk, hc, ec)
     + _fill(capeD.f, sk, hc, ec)
     + _fill(_pick(P.neck, cfg.neck).svg, sk, hc, ec) + '</g>';
  /* 頭部組:臉、側耳、五官、前髮、頂耳、角、眼鏡、帽 */
  var earSide = (earD.pos === 'side') ? earD.svg : P.ear[0].svg;
  var earTop  = (earD.pos === 'top')  ? earD.svg : '';
  s += '<g'+headT+'>' + _fill(earSide, sk, hc, ec)
     + _fill(_pick(P.face, cfg.face).svg, sk, hc, ec)
     + _fill(_pick(P.brow, cfg.brow).svg, sk, hc, ec)
     + _fill(_pick(P.eye, cfg.eye).svg, sk, hc, ec)
     + _fill(_pick(P.nose, cfg.nose).svg, sk, hc, ec)
     + _fill(_pick(P.mouth, cfg.mouth).svg, sk, hc, ec)
     + hairWrapOpen + _fill(hair.f || '', sk, hc, ec) + '</g>'
     + _fill(earTop, sk, hc, ec)
     + _fill(_pick(P.horn, cfg.horn).svg, sk, hc, ec)
     + _fill(_pick(P.glasses, cfg.gls).svg, sk, hc, ec)
     + _fill(_pick(P.hat, cfg.hat).svg, sk, hc, ec) + '</g>';
  /* 最前:手持物 */
  s += '<g'+bodyT+'>' + _fill(_pick(P.held, cfg.held).svg, sk, hc, ec) + '</g>';

  return '<svg viewBox="0 0 360 480" xmlns="http://www.w3.org/2000/svg" style="'
    + (sizeCss || 'width:100%;height:100%;') + 'display:block;">' + s + '</svg>';
};

/* ════════════════════════════════════════
 * 4. 解鎖判定(Phase 1:免費款開放;lock 款看 avatarCard.unlock 帳本)
 * ════════════════════════════════════════ */
window._avatarIsUnlocked = function(cat, id){
  var list = P[cat]; if(!list) return false;
  var item = null;
  for(var i=0;i<list.length;i++){ if(list[i].id === id){ item = list[i]; break; } }
  if(!item) return false;
  if(!item.lock) return true;
  var card = window._avatarLocalCard || {};
  var un = card.unlock || [];
  return un.indexOf(cat + ':' + id) >= 0;
};

/* ════════════════════════════════════════
 * 5. 本機 + 雲端存取
 *    整包 avatarCard = { cfg, unlock, q(語錄idx), ver }
 *    雲端:players/{uid}.avatarCard(merge:true,照 representativeHero 模式)
 * ════════════════════════════════════════ */
function _avLsKey(){
  var uid = window._gUserId || 'guest';
  return 'lxps_avatarCard_' + uid;
}
window._avatarLocalCard = null;

window._avatarLoadLocal = function(){
  try{
    var raw = localStorage.getItem(_avLsKey());
    if(raw){ window._avatarLocalCard = JSON.parse(raw); }
  }catch(_e){ window._avatarLocalCard = null; }
  if(!window._avatarLocalCard || !window._avatarLocalCard.cfg){
    window._avatarLocalCard = { cfg: window._avatarDefaultCfg(), unlock: [], q: 0, ver: 1 };
  }
  return window._avatarLocalCard;
};

window._avatarSaveLocal = function(){
  try{ localStorage.setItem(_avLsKey(), JSON.stringify(window._avatarLocalCard)); }catch(_e){}
};

/* 儲存造型 → 本機 + 雲端(單次寫入,無高頻;失敗僅提示不擋本機) */
window._avatarSaveToCloud = function(){
  window._avatarSaveLocal();
  var uid = window._gUserId;
  if(!uid || !window._fbDb || !window._fbFns){ return Promise.resolve(false); }
  try{
    var F = window._fbFns;
    return F.setDoc(F.doc(window._fbDb, 'players', uid),
      { avatarCard: window._avatarLocalCard }, { merge: true })
      .then(function(){ return true; })
      .catch(function(e){ console.warn('[avatar] 雲端儲存失敗(本機已存)', e); return false; });
  }catch(e){ console.warn('[avatar] 雲端儲存例外(本機已存)', e); return Promise.resolve(false); }
};

/* 從自己的 players 主檔拉雲端造型(跨裝置還原;面板開啟時呼叫一次) */
window._avatarPullFromCloud = function(){
  var uid = window._gUserId;
  if(!uid || !window._fbDb || !window._fbFns){ return Promise.resolve(null); }
  try{
    var F = window._fbFns;
    return F.getDoc(F.doc(window._fbDb, 'players', uid)).then(function(snap){
      if(snap.exists()){
        var d = snap.data();
        if(d && d.avatarCard && d.avatarCard.cfg){
          window._avatarLocalCard = d.avatarCard;
          window._avatarSaveLocal();
          return d.avatarCard;
        }
      }
      return null;
    }).catch(function(){ return null; });
  }catch(_e){ return Promise.resolve(null); }
};

/* ════════════════════════════════════════
 * 6. 客製化面板 UI(全螢幕 overlay,仿好友面板模式)
 * ════════════════════════════════════════ */
/* ★ v4.57.0 — 老師指示:自訂角色簡化為三大類「換髮型/換臉/換身體」+ 名片語錄。
 *   服裝/配件/耳角翅尾/手持 頁籤停用(素材未達標);資料陣列與渲染邏輯保留未刪,
 *   舊八頁籤定義保留於下方註解,日後素材到位可直接復原。
 *   換臉頁只留 PNG 模式實際有作用的分類:眼睛(素材待補)/瞳色(染色可用)/
 *   眉毛顏色(染色可用)/嘴巴(素材待補);臉型/眉形/鼻子為純 SVG 款,PNG 模式
 *   下全是「繪製中」佔位框,先不顯示減少干擾。
 * 舊定義(v4.55.1):
 * var _AV_TABS = [
 *   { k:'bodyTab', p:'身體',   c:'身體',   cats:[['body','體型','體型'],['skin','膚色','皮膚顏色']] },
 *   { k:'faceTab', p:'臉部',   c:'臉臉',   cats:[['face','臉型','臉型'],['brow','眉毛','眉毛'],['browC','眉毛顏色','眉毛顏色'],['eye','眼睛','眼睛'],['eyeC','瞳孔顏色','眼睛顏色'],['nose','鼻子','鼻子'],['mouth','嘴巴','嘴巴']] },
 *   { k:'hairTab', p:'髮型',   c:'頭髮',   cats:[['hair','髮型','髮型'],['hairC','髮色','頭髮顏色']] },
 *   { k:'beastTab',p:'耳角翅尾', c:'變身',  cats:[['ear','耳朵','耳朵'],['horn','角','角角'],['wing','翅膀','翅膀'],['tail','尾巴','尾巴']] },
 *   { k:'wearTab', p:'服裝',   c:'衣服',   cats:[['top','上衣','上衣'],['btm','下褲(裙)','下褲(裙)'],['sock','襪子','襪襪'],['sh','鞋子','鞋鞋']] },
 *   { k:'accTab',  p:'配件',   c:'裝飾',   cats:[['hat','帽子','帽帽'],['gls','眼鏡','眼鏡'],['earring','耳環','耳環'],['mask','口罩','口罩'],['neck','項鍊','項鍊'],['wrist','手環','手環'],['cape','披風','披風']] },
 *   { k:'heldTab', p:'手持',   c:'拿的',   cats:[['held','手拿物品','拿什麼']] },
 *   { k:'cardTab', p:'名片',   c:'名片',   cats:[['q','名片語錄','名片的話']] }
 * ]; */
var _AV_TABS = [
  { k:'hairTab', p:'換髮型', c:'換頭髮', cats:[['hair','髮型','髮型'],['hairC','髮色','頭髮顏色']] },
  { k:'faceTab', p:'換臉', c:'換臉臉', cats:[['eye','眼睛','眼睛'],['eyeC','瞳孔顏色','眼睛顏色'],['mouth','嘴巴','嘴巴'],['gls','眼鏡','眼鏡'],['ear','耳朵','耳朵'],['browC','眉毛顏色','眉毛顏色']] },
  { k:'bodyTab', p:'換身體', c:'換身體', cats:[['body','體型','體型'],['skin','膚色','皮膚顏色'],['full','整套造型','整套裝扮'],['top','上衣/套裝','衣服'],['btm','褲子','褲褲'],['sh','鞋子','鞋鞋']] },   /* ★ v4.59.0 加整套造型 */
  { k:'heldTab', p:'手持', c:'拿的', cats:[['held','手拿物品','拿什麼']] },
  { k:'cardTab', p:'名片', c:'名片', cats:[['q','座右銘','名片的話']] }
];
var _AV_CFG_KEY = { body:'body', skin:'skin', face:'face', brow:'brow', eye:'eye', eyeC:'eyeC',
  nose:'nose', mouth:'mouth', hair:'hair', hairC:'hairC', ear:'ear', horn:'horn', wing:'wing',
  tail:'tail', top:'top', btm:'btm', sh:'sh', hat:'hat', gls:'gls', neck:'neck', wrist:'wrist',
  cape:'cape', held:'held', q:'q',
  browC:'browC', earring:'earr', mask:'mask', sock:'sock',
  full:'full' };   /* ★ v4.59.0 整套造型 */
var _avCurTab = 0;

function _avEsc(t){
  return String(t).replace(/[<>&"']/g, function(c){
    return { '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&#39;' }[c];
  });
}

window._avatarOpenPanel = function(){
  /* ★ v4.55.0 管理員測試期守門(雙保險;入口按鈕本身已隱藏) */
  if(typeof window._avatarGateAllowed === 'function' && !window._avatarGateAllowed()){
    alert(_avT('主角造型功能測試中,即將開放,敬請期待!','主角打扮功能快開放了,再等等喔!'));
    return;
  }
  var old = document.getElementById('_avatar-panel');
  if(old) old.remove();
  window._avatarLoadLocal();

  var panel = document.createElement('div');
  panel.id = '_avatar-panel';
  panel.style.cssText = 'position:fixed;inset:0;z-index:19999;'
    + 'background:linear-gradient(160deg,#141028 0%,#1e1440 55%,#0e0a20 100%);'
    + 'display:flex;flex-direction:column;overflow:hidden;'
    + 'font-family:"M PLUS Rounded 1c","Nunito",sans-serif;';

  panel.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 20px;'
    + 'border-bottom:2px solid rgba(140,200,255,0.4);background:linear-gradient(to right,rgba(20,30,60,0.9),rgba(30,15,50,0.9));flex-wrap:wrap;gap:10px;">'
    + '<div style="font-size:clamp(22px,3vw,34px);font-weight:900;color:#8ad4ff;letter-spacing:2px;text-shadow:0 0 16px rgba(120,200,255,0.5);">'
    + _avT('👤 我的主角 — 造型工房','👤 我的主角 — 打扮小屋') + '</div>'
    + '<div style="display:flex;gap:8px;">'
    + '<button onclick="_avatarPreviewCard()" style="padding:9px 18px;font-size:15px;font-weight:800;background:rgba(255,180,80,0.22);border:2px solid rgba(255,200,100,0.75);color:#ffd97a;border-radius:10px;cursor:pointer;font-family:inherit;">📇 ' + _avT('名片預覽','看名片') + '</button>'
    + '<button id="_av-save-btn" onclick="_avatarSaveClick()" style="padding:9px 18px;font-size:15px;font-weight:800;background:rgba(80,200,120,0.25);border:2px solid rgba(100,230,150,0.8);color:#9effc0;border-radius:10px;cursor:pointer;font-family:inherit;">💾 ' + _avT('儲存造型','存起來') + '</button>'
    + '<button onclick="document.getElementById(\'_avatar-panel\').remove()" style="padding:9px 18px;font-size:15px;font-weight:800;background:rgba(60,10,10,0.45);border:2px solid #e84040;color:#ff9a9a;border-radius:10px;cursor:pointer;font-family:inherit;">✕ ' + _avT('關閉','關掉') + '</button>'
    + '</div></div>'
    /* 主體:左預覽 + 右選單 */
    + '<div style="flex:1;display:flex;min-height:0;">'
    + '<div style="flex:0 0 46%;max-width:640px;display:flex;align-items:center;justify-content:center;padding:12px;background:radial-gradient(circle at 50% 42%,rgba(120,160,255,0.14),transparent 65%);">'
    + '<div id="_av-preview" style="height:80vh;max-height:80vh;aspect-ratio:3/4;width:auto;max-width:100%;"></div></div>'
    + '<div style="flex:1;display:flex;flex-direction:column;min-width:0;border-left:1.5px solid rgba(140,200,255,0.25);">'
    + '<div id="_av-tabs" style="display:flex;gap:6px;padding:10px 12px 6px;overflow-x:auto;flex-shrink:0;"></div>'
    + '<div id="_av-opts" style="flex:1;overflow-y:auto;padding:6px 14px 20px;"></div>'
    + '</div></div>'
    + '<div style="padding:8px 20px;font-size:13px;color:#8899bb;border-top:1px solid rgba(140,200,255,0.2);background:rgba(0,0,10,0.4);">'
    + _avT('🔒 鎖定款式將於主線劇情「萬象共鳴」開放取得,敬請期待!','🔒 鎖住的款式,等主線故事開放就拿得到囉!')
    + '</div>';

  document.body.appendChild(panel);
  _avRefreshPreview();
  _avRenderTabs();
  _avRenderOpts();

  /* 已登入 → 背景拉一次雲端(跨裝置還原;拉到才重繪) */
  window._avatarPullFromCloud().then(function(card){
    if(card && document.getElementById('_avatar-panel')){ _avRefreshPreview(); _avRenderOpts(); }
  });
};

function _avRefreshPreview(){
  var el = document.getElementById('_av-preview');
  if(el) el.innerHTML = window._avatarRenderSVG(window._avatarLocalCard.cfg);
}

function _avRenderTabs(){
  var box = document.getElementById('_av-tabs'); if(!box) return;
  var h = '';
  for(var i=0;i<_AV_TABS.length;i++){
    var t = _AV_TABS[i], on = (i === _avCurTab);
    h += '<button onclick="_avatarSwitchTab('+i+')" style="padding:8px 16px;font-size:15px;font-weight:800;white-space:nowrap;border-radius:10px;cursor:pointer;font-family:inherit;'
      + (on ? 'background:rgba(120,180,255,0.3);border:2px solid #8ad4ff;color:#d4ecff;'
            : 'background:rgba(60,70,110,0.25);border:2px solid rgba(120,140,190,0.4);color:#9aa8cc;')
      + '">' + _avT(t.p, t.c) + '</button>';
  }
  box.innerHTML = h;
}
window._avatarSwitchTab = function(i){ _avCurTab = i; _avRenderTabs(); _avRenderOpts(); };

function _avRenderOpts(){
  var box = document.getElementById('_av-opts'); if(!box) return;
  var tab = _AV_TABS[_avCurTab];
  var cfg = window._avatarLocalCard.cfg;
  var pngMode = (window._AVATAR_PNG_MODE && _pick(P.body, cfg.body).img);
  var _wipHtml = '<div style="padding:14px 16px;background:rgba(60,70,110,0.2);border:1.5px dashed rgba(150,170,220,0.5);border-radius:12px;color:#9aa8cc;font-size:14.5px;">🎨 '
    + _avT('此類素材繪製中,之後的更新會陸續加入,敬請期待!','這類的圖還在畫,等更新就會有囉!') + '</div>';
  var h = '';
  for(var c=0;c<tab.cats.length;c++){
    var cat = tab.cats[c][0], labP = tab.cats[c][1], labC = tab.cats[c][2];
    h += '<div style="font-size:16px;font-weight:900;color:#ffd97a;margin:14px 2px 8px;">' + _avT(labP, labC) + '</div>';
    if(pngMode && cat === 'hairC' && !_avatarAnyHairImg()){
      /* 髮色:染色引擎已就緒,髮型素材加入後即生效 */
      h += '<div style="padding:10px 14px;margin-bottom:8px;background:rgba(60,70,110,0.2);border:1.5px dashed rgba(150,170,220,0.5);border-radius:12px;color:#9aa8cc;font-size:13.5px;">💡 '
        + _avT('髮色引擎已就緒:髮型素材加入後,選好的髮色會自動套用','選好頭髮顏色,等髮型的圖加進來就會變色囉!') + '</div>';
    }
    h += '<div style="display:flex;flex-wrap:wrap;gap:8px;">';
    if(cat === 'skin' || cat === 'hairC' || cat === 'eyeC' || cat === 'browC'){
      var pal = (cat === 'skin') ? window.AVATAR_PALETTES.skin
              : (cat === 'eyeC') ? window.AVATAR_PALETTES.eye : window.AVATAR_PALETTES.hair;
      for(var i=0;i<pal.length;i++){
        var sel = (cfg[cat] === i || (!cfg[cat] && i === 0));
        var tt = (i === 0) ? _avT('原本的顏色','原本的顏色') : (_avT('色票','顏色') + ' ' + (i+1));
        h += '<button onclick="_avatarSetPart(\''+cat+'\','+i+')" title="'+tt
          + '" style="width:44px;height:44px;border-radius:50%;cursor:pointer;background:'+pal[i]+';position:relative;'
          + 'border:'+(sel?'3.5px solid #8ad4ff;box-shadow:0 0 12px rgba(120,200,255,0.7);':'2.5px solid rgba(255,255,255,0.35);')+'">'
          + (i === 0 ? '<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;color:rgba(60,40,30,0.75);">原</span>' : '')
          + '</button>';
      }
    } else if(cat === 'q'){
      var qs = window.AVATAR_QUOTES;
      for(var qi=0;qi<qs.length;qi++){
        var qsel = (window._avatarLocalCard.q === qi);
        h += '<button onclick="_avatarSetQuote('+qi+')" style="padding:9px 14px;font-size:14px;font-weight:700;border-radius:10px;cursor:pointer;font-family:inherit;max-width:100%;text-align:left;'
          + (qsel ? 'background:rgba(255,180,80,0.28);border:2px solid #ffd97a;color:#ffe9b8;'
                  : 'background:rgba(60,70,110,0.25);border:2px solid rgba(120,140,190,0.4);color:#b8c4e0;')
          + '">💬 ' + _avEsc(qs[qi]) + '</button>';
      }
    } else {
      var list = P[cat];
      var shown = 0;
      for(var j=0;j<list.length;j++){
        var it = list[j];
        /* ★ PNG 模式:只顯示「當前體型」有素材的款式(fImg/img/bImg 支援四體型陣列,
         *   缺格為 null → 該體型自動隱藏);j===0 的預設款(素體內建外觀)永遠顯示 — v4.58.0 */
        if(pngMode && j !== 0){
          var _hasPiece = _avImgFor(it.img, cfg.body) || _avImgFor(it.fImg, cfg.body) || _avImgFor(it.bImg, cfg.body);
          if(!_hasPiece) continue;
        }
        shown++;
        var unlocked = window._avatarIsUnlocked(cat, it.id);
        var selP = (cfg[_AV_CFG_KEY[cat]] === it.id);
        var nm = _avT(it.n, it.ns);
        if(unlocked){
          h += '<button onclick="_avatarSetPart(\''+cat+'\','+it.id+')" style="padding:10px 16px;font-size:15px;font-weight:800;border-radius:10px;cursor:pointer;font-family:inherit;'
            + (selP ? 'background:rgba(120,180,255,0.3);border:2px solid #8ad4ff;color:#d4ecff;box-shadow:0 0 10px rgba(120,200,255,0.4);'
                    : 'background:rgba(60,70,110,0.25);border:2px solid rgba(120,140,190,0.4);color:#c4d0ea;')
            + '">' + _avEsc(nm) + '</button>';
        } else {
          h += '<button title="' + _avT('主線劇情開放後取得','等主線故事開放') + '" style="padding:10px 16px;font-size:15px;font-weight:800;border-radius:10px;cursor:not-allowed;font-family:inherit;opacity:0.5;background:rgba(40,40,55,0.4);border:2px dashed rgba(150,150,170,0.45);color:#8890a8;">🔒 ' + _avEsc(nm) + '</button>';
        }
      }
      if(pngMode && shown === 0){ h += '</div>' + _wipHtml + '<div style="display:none;">'; }
    }
    h += '</div>';
  }
  box.innerHTML = h;
}

window._avatarSetPart = function(cat, id){
  window._avatarLocalCard.cfg[_AV_CFG_KEY[cat]] = id;
  _avRefreshPreview(); _avRenderOpts();
};
window._avatarSetQuote = function(i){
  window._avatarLocalCard.q = i;
  _avRenderOpts();
};

/* ★ v4.55.1 — 是否已有任何髮型素材(供髮色提示判斷) */
function _avatarAnyHairImg(){
  for(var i=0;i<P.hair.length;i++){
    if(P.hair[i].fImg || P.hair[i].bImg) return true;
  }
  return false;
}

window._avatarSaveClick = function(){
  var btn = document.getElementById('_av-save-btn');
  if(btn){ btn.disabled = true; btn.textContent = '⏳ ' + _avT('儲存中…','存檔中…'); }
  window._avatarSaveToCloud().then(function(ok){
    if(!btn) return;
    btn.textContent = ok ? ('✅ ' + _avT('已儲存!','存好了!')) : ('✅ ' + _avT('已存本機(雲端稍後重試)','先存在平板上囉'));
    setTimeout(function(){
      if(btn){ btn.disabled = false; btn.textContent = '💾 ' + _avT('儲存造型','存起來'); }
    }, 1800);
  });
};

/* ════════════════════════════════════════
 * 7. 名片(自己預覽 / 好友查看共用)
 *    data = { name(顯示名), card(avatarCard) }
 * ════════════════════════════════════════ */
window._avatarOpenCard = function(name, card){
  var old = document.getElementById('_avatar-card-modal');
  if(old) old.remove();
  card = (card && card.cfg) ? card : { cfg: window._avatarDefaultCfg(), q: 0 };
  /* ★ v4.55.1 記住參數:body 染色完成後可重繪名片 */
  window._avLastCardArgs = [name, card];
  var qi = (typeof card.q === 'number' && card.q >= 0 && card.q < window.AVATAR_QUOTES.length) ? card.q : 0;

  var wrap = document.createElement('div');
  wrap.id = '_avatar-card-modal';
  wrap.style.cssText = 'position:fixed;inset:0;z-index:20001;display:flex;align-items:center;justify-content:center;background:rgba(0,0,10,0.72);font-family:"M PLUS Rounded 1c","Nunito",sans-serif;';
  wrap.onclick = function(e){ if(e.target === wrap) wrap.remove(); };
  wrap.innerHTML =
    '<div style="width:min(92vw,380px);background:linear-gradient(160deg,#20184a,#141028);border:2.5px solid rgba(140,200,255,0.65);border-radius:20px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.7),0 0 30px rgba(120,180,255,0.25);">'
    + '<div style="padding:10px 18px;background:linear-gradient(to right,rgba(60,90,180,0.55),rgba(120,60,180,0.55));display:flex;justify-content:space-between;align-items:center;">'
    + '<span style="font-size:17px;font-weight:900;color:#d4ecff;letter-spacing:1px;">📇 ' + _avT('冒險者名片','冒險名片') + '</span>'
    + '<button onclick="document.getElementById(\'_avatar-card-modal\').remove()" style="background:none;border:none;color:#ff9a9a;font-size:20px;font-weight:900;cursor:pointer;font-family:inherit;">✕</button></div>'
    + '<div style="display:flex;align-items:center;justify-content:center;padding:10px;background:radial-gradient(circle at 50% 40%,rgba(120,160,255,0.16),transparent 70%);">'
    + '<div style="width:220px;aspect-ratio:3/4;">' + window._avatarRenderSVG(card.cfg) + '</div></div>'
    + '<div style="padding:4px 20px 18px;text-align:center;">'
    + '<div style="font-size:21px;font-weight:900;color:#ffe9b8;letter-spacing:1px;">' + _avEsc(name || _avT('神秘旅人','神祕人')) + '</div>'
    + '<div style="font-size:13px;color:#8ad4ff;font-weight:800;margin-top:2px;">' + _avT('✦ 異界旅人 ✦','✦ 從別的世界來的 ✦') + '</div>'
    + '<div style="margin-top:10px;padding:10px 12px;background:rgba(0,0,10,0.4);border:1.5px solid rgba(255,210,140,0.4);border-radius:12px;font-size:14.5px;color:#ffe9cc;line-height:1.5;">💬 ' + _avEsc(window.AVATAR_QUOTES[qi]) + '</div>'
    + '</div></div>';
  document.body.appendChild(wrap);
};

window._avatarPreviewCard = function(){
  var uid = window._gUserId || '';
  var name = '';
  try{ name = localStorage.getItem('lxps_nickname_' + uid) || ''; }catch(_e){}
  window._avatarOpenCard(name || _avT('我的主角','我的主角'), window._avatarLocalCard);
};

/* ★ v4.55.1 — 染色完成後,名片若開著就用同參數重繪(拿到染後圖) */
window._avatarCardRerender = function(){
  try{
    if(document.getElementById('_avatar-card-modal') && window._avLastCardArgs){
      window._avatarOpenCard(window._avLastCardArgs[0], window._avLastCardArgs[1]);
    }
  }catch(_e){}
};

/* 好友名單用:傳入好友 players doc(fd)與顯示名 → 開名片 */
window._avatarOpenFriendCard = function(label, fd){
  /* ★ v4.55.0 管理員測試期守門(雙保險;好友卡片 📇 按鈕本身已條件渲染) */
  if(typeof window._avatarGateAllowed === 'function' && !window._avatarGateAllowed()){
    alert(_avT('冒險者名片功能測試中,即將開放,敬請期待!','名片功能快開放了,再等等喔!'));
    return;
  }
  var card = (fd && fd.avatarCard && fd.avatarCard.cfg) ? fd.avatarCard : null;
  if(!card){
    window._avatarOpenCard(label, null);
    return;
  }
  window._avatarOpenCard(label, card);
};

/* ════════════════════════════════════════
 * 8. 管理員測試期 gating(老師指示 2026-07-17:先讓管理員測試,對一般玩家隱藏)
 *    ★ 正式開放時:把下面 _AVATAR_ADMIN_ONLY 這一行改成 false,即全員可見(單一開關)
 *    - 入口按鈕(#adv-avatar-btn)靜態 HTML 預設 display:none,
 *      由 _avatarRefreshEntryVisibility 於登入後判定管理員才顯示
 *    - 好友卡片 📇 按鈕:渲染時同開關判定(index.html _renderFriendPanelImpl 內)
 *    - _avatarOpenPanel / _avatarOpenFriendCard 開頭雙保險守門
 * ════════════════════════════════════════ */
window._AVATAR_ADMIN_ONLY = true;

window._avatarGateAllowed = function(){
  if(window._AVATAR_ADMIN_ONLY !== true) return true;
  return (typeof window._isAdminUser === 'function' && window._isAdminUser());
};

window._avatarRefreshEntryVisibility = function(){
  try{
    var btn = document.getElementById('adv-avatar-btn');
    if(!btn) return;
    btn.style.display = window._avatarGateAllowed() ? '' : 'none';
  }catch(_e){}
};

/* 登入後 _isAdminUser 才可用 → 啟動後輪詢 30 秒內判定(20 次 × 1.5s) */
(function(){
  var n = 0;
  var t = setInterval(function(){
    n++;
    try{ window._avatarRefreshEntryVisibility(); }catch(_e){}
    if(n >= 20) clearInterval(t);
  }, 1500);
})();

/* 啟動時載一次本機資料(供名片/未來主線使用) */
try{ window._avatarLoadLocal(); }catch(_e){}

})();
