// ════════════════════════════════════════════════════════════════════════
//  mainstory.js — 主線劇情引擎 + MAINSTORY_DB(自 index.html 拆出)
//  ★ v5.27.0(2026-08-11)— 舊寵物卡系統改名配套:註解 EQUIP_DB→CARRY_PET_DB(純註解一處·零行為變更;裝備系統 Phase 1 本體全在 index.html v5.27.0) ｜ ★ v5.26.0(2026-08-10)— 手機適配 CSS 錨點(老師手機解析度優化需求):三處純加 className(章節選單 head=ms-sel-head/章節卡+第七章待續卡=ms-ch-card/對白框=ms-dlg-wrap·對白框特意用 class 不用 id 避開 v4.89.0 舊場景拔 id 機制),零行為變更;實際手機版型/字級/捲動規則全在 index.html v5.26.0 media query(max-width:600px 手機直向/max-height:520px 手機橫向·iPad 均不命中) ｜ ★ v5.12.0(2026-08-04)— 額度瘦身丙案第一刀:自 index.html L144205-148311 整段搬出(4,107行/約228KB),零行為變更;傳統 script 共享全域 scope,載入位置維持原點(_advSystemReady 設定後由 document.write 同步載入);破快取走 _LXPS_FILE_VERSIONS['mainstory.js'] ?v= + sw.js SHELL_URLS ｜ ★ 更早的版本歷史請見 git 提交紀錄與 MEMORY_HANDOFF(鐵律:本註解僅保留最近20版)
// ════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════
// ★ v4.65.0(2026-07-20) — 主線劇情模式 Phase 1・批次1 地基
//   規格書:MAINSTORY_SPEC_2026-07-20。純新增,不動既有戰鬥/關卡/存檔邏輯。
//   內容:資料表 MAINSTORY_DB(序章完整+一~六章 meta/對白骨架)+ 過場播放引擎
//        (獨立 overlay 鏈式串接·打字機·可跳過·影片插槽缺檔靜默 fallback·防卡死 watchdog)
//        + self-write 存檔讀寫 + 發獎冪等 + 關卡頁入口刷新 + 首登自動導入 gate。
//   ★測試期 gating:_MAINSTORY_ADMIN_ONLY(比照 avatar _AVATAR_ADMIN_ONLY);正式開放改 false。
//   ★演出動作(造型工房/四隊員加入/教學掛接/劇情戰)由批次2/3 接既有系統,此處以 act 佔位。
// ════════════════════════════════════════════════════════════════════
(function(){
  'use strict';

  /* ★ v5.19.0(2026-08-08·老師指示)—— 主線劇情「正式開放」:測試期閘門改 false,全體玩家可見。
   *   連動全自動(v4.86.0/v5.6.0 既有設計·零另改):關卡頁 📖 主線劇情鈕全員顯示+進度徽章、
   *   近期活動介紹卡自動切「NEW!」正式文案、遊戲指引「主線劇情」章自動出現。
   *   舊值備查(誤刪是大忌):window._MAINSTORY_ADMIN_ONLY = true; */
  window._MAINSTORY_ADMIN_ONLY = false;

  // ── 破快取:場景圖/影片 URL 帶 ?v=版本(比照爆發影片 _BV_RAW)──
  function _msVer(){
    try{
      if(window._LXPS_FILE_VERSIONS && window._LXPS_FILE_VERSIONS["index.html"])
        return window._LXPS_FILE_VERSIONS["index.html"];
    }catch(_){}
    return "v0";
  }
  function _msAsset(name){
    if(!name) return "";
    try{ return "./" + encodeURIComponent(name) + "?v=" + _msVer(); }catch(_){ return "./" + name; }
  }

  // ════════ 主線劇情資料表(資料驅動)════════
  // chapter = { id, titleP(精緻), titleC(簡單), reward, scenes:[ scene ] }
  // scene   = { img|video, act, lines:[ {who, text(精緻), cute(簡單)} ] }
  //   img   :場景圖檔名(放 repo 根目錄);缺檔(404)→ 退回漸層底+對白(不會壞)
  //   video :影片插槽檔名;缺檔→ 靜默略過該場影片,只播對白(比照爆發影片 onerror)
  //   act   :演出動作字串(批次2/3 接既有系統:open_avatar/set_card/join/tutorial_*/battle_*)
  //   who   :說話者名(對白框標題);"__narr"=旁白;"__hero"=主角(顯示玩家暱稱)
  //   text/cute:鐵律1.232 雙版(精緻風/簡單風);cute 省略時退回 text
  var MAINSTORY_DB = {
    order: ["prologue","ch1","ch2","ch3","ch4","ch5","ch6"],
    chapters: {
      prologue: {
        id:"prologue", titleP:"序章・穿越到異世界", titleC:"序章・穿越了", reward:null,
        /* ★ v4.81.0 老師裁定(2026-07-22):章節封面音樂「統一」使用 repo 根目錄的 章節音樂.m4a。
         *   以下各章 cover.bgm 保留原值但「程式不讀取」= 不使用欄位(_msPlayCover 固定播共用曲);
         *   對應的 主線_開場_第X章.m4a 七個檔案不需要上傳,待辦清單可劃除。 */
        cover:{ img:"主線_封面_序章.jpg", bgm:"主線_開場_序章.m4a" },
        scenes:[
          { img:"主線_序章_校外教學.jpg", amb:"forest", bgm:"bgm-adv-march", lines:[
            { who:"__narr", text:"貓空的午後，陽光穿過樟樹葉隙，灑下一地細碎的金光。一隻藍鵲拖著長長的尾羽掠過眼前，你忍不住追了上去，轉進一條沒走過的步道——再一回身，隊伍的笑鬧聲，連同同學的身影，全都不見了。",
              cute:"今天去貓空校外教學。你追著一隻藍鵲跑，一轉身，大家都不見了！" },
            { who:"__hero", text:"（心想）樹影越來越密，天色也越來越暗……老師？大家跑到哪去了？", cute:"（心想）好暗喔……老師？大家在哪？", sfx:"footstep", sfxHold:5000 }
          ]},
          { img:"主線_序章_迷霧森林.jpg", amb:"forest", bgm:"none", lines:[
            { who:"__narr", text:"霧氣不知何時漫了上來。你低頭想看清腳下的路，一層厚厚的落葉卻突然裂開一道發光的縫隙——來不及驚呼，整個人就這樣被吞了進去。",
              cute:"起霧了。腳邊的落葉裂開，發出亮光，你「啊」一聲就掉了進去！", sfx:"crack" }
          ]},
          { act:"blackout", lines:[
            { who:"__narr", text:"失重、翻滾、天旋地轉。四周的光影碎裂成一片片流動的星塵，你在時空的縫隙裡不斷向下、向下墜落，分不清哪裡是上、哪裡是下。",
              cute:"你一直往下掉！身邊的光都碎成一點一點的小星星。", sfx:"fall" },
            { who:"__hero", text:"（心想）這裡到底是……我會掉到什麼地方去——", cute:"（心想）這是哪裡……我會掉到哪裡去——" }
          ]},
          { img:"主線_序章_雙月河堤.jpg", amb:"riverside", bgm:"bgm-summon", act:"open_avatar", lines:[
            { who:"小劇團員", text:"看！裂縫裡掉出一個人來——好戲要開場了！人生如戲，戲如人生，這位主角登場得可真夠戲劇性！", cute:"啊！有人從裂縫掉出來了！", sfx:"appear" },
            { who:"直笛團員", text:"別急。你看他的輪廓……還在異世界的光裡忽明忽暗地閃爍，都還沒「定形」呢。這種細節，可不能馬虎。",
              cute:"他還在發光，樣子還沒固定下來耶。" },
            /* ★ v4.81.0 對白精緻化(乙案·老師核可)：夥伴互動＋主角首次開口 */
            { who:"小劇團員", text:"還沒定形？那不就是還在試鏡嗎！來來來，讓我幫你設計一個帥氣的登場姿勢——",
              cute:"還沒變好？那就是還在試鏡嘛！我幫你想一個超帥的姿勢！" },
            { who:"直笛團員", text:"……善行，人家剛從天上掉下來。",
              cute:"……善行，他剛剛才掉下來耶。" },
            { who:"小劇團員", text:"所以才更要把握啊！人生的第一印象，一輩子只有一次！",
              cute:"就是因為這樣才要把握啊！第一次見面只有一次！" },
            { who:"弦樂團員", text:"（輕輕撥了一下弦）別理他們。你剛才落地那一下，撞出來的聲音是降 B——是個很漂亮的音喔。",
              cute:"（撥了一下琴弦）別管他們。你掉下來的聲音，很好聽喔！", sfx:"card" },
            { who:"__hero", text:"等、等一下，我掉下來還有音高的嗎——",
              cute:"等等，我掉下來還有分高低音喔？" },
            { who:"動物學家", text:"別害怕。在這個世界啊，你得先在心裡想像出自己的模樣，樣貌才會真正固定下來。來——閉上眼睛，好好想像「你」是什麼樣子——",
              cute:"別怕！在這裡，先想像你自己的樣子，樣子才會固定喔。閉上眼睛想一想——" }
          ]},
          /* ★★ v4.87.0 老師裁定(2026-07-23)—— 序章「定形覺醒」影片正式接回,播放位置=開啟造型工房「之前」。
           *   沿革:v4.65.0 原本就寫了 video 但檔案未上傳(404·引擎靜默 fallback 只播對白);
           *        v4.79.0 老師當時指示「序章不需要覺醒影片(覺醒改在第六章)」→ 拿掉 video 欄位;
           *        v4.87.0 老師已把 主線_序章_定形覺醒.mp4 上傳 repo(實測 HTTP 200)並指定放在
           *        「準備開啟造型工房之前」→ 本行把 video 欄位加回。
           *   ★ 播放順序由 _msPlayScene 保證:影片播完 → startDialog(本場 lines 為空)→ finish()
           *     → 才跑 scene.act = open_avatar_studio 開造型工房。所以「影片在捏臉之前」是引擎天然行為。
           *   ★ 缺檔/播放失敗仍靜默 fallback 直接開工房(既有 onerror 與 6 秒兜底),絕不擋劇情。
           *   舊值保留(誤刪是大忌):{ act:"open_avatar_studio", lines:[] } */
          { video:"主線_序章_定形覺醒.mp4", act:"open_avatar_studio", lines:[] },
          /* ★★ v4.89.0 老師指示(2026-07-24)——「把觀看主角名片放在這裡」:
           *   舊結構是「三句對白全播完 → 才跑 act:set_card 開名片」,玩家看到名片時,
           *   真音那句「這張是你的冒險者名片…」早已被兩句吐槽蓋過去了,對不上。
           *   引擎規則:scene.act 一律在「本場景 lines 播完」才執行 → 想讓名片緊接某句出現,
           *   就把該句單獨切成一個場景(同 img/amb,畫面完全不會閃)。
           *   拆法:場景A(act:set_card)=真音介紹名片那一句 → 播完立刻開名片;
           *        場景B(無 act)=關掉名片後接著演善行與主角的吐槽兩句。 */
          { img:"主線_序章_雙月河堤.jpg", amb:"riverside", act:"set_card", lines:[
            { who:"弦樂團員", text:"哇——這就是你啊！真好，每個人的樣子都像一段獨一無二的旋律。這張是你的「冒險者名片」，上面有你的名字，還有你家鄉編號的末六碼喔。",
              cute:"哇，這就是你！這是你的冒險者名片，有你的名字喔。", sfx:"card" }
          ]},
          { img:"主線_序章_雙月河堤.jpg", amb:"riverside", lines:[
            /* ★ v4.81.0 對白精緻化(乙案) */
            { who:"小劇團員", text:"哇——這張名片上的表情，也太震驚了吧！你剛掉下來那一瞬間，我就知道非搶這個鏡頭不可。",
              cute:"哇，名片上的表情超驚訝的！你一掉下來我就知道要拍這張！" },
            { who:"__hero", text:"（心想）所以剛剛那個一直繞著我打轉的人……是在拍照？我還以為他只是單純很興奮。",
              cute:"（心想）他剛剛一直繞著我轉，原來是在拍照喔？" }
          ]},
          { img:"主線_序章_雙月河堤.jpg", amb:"riverside", act:"join_prologue", lines:[
            { who:"動物學家", text:"我是動物學家‧小真老師。看你這副迷路的樣子——別擔心，跟我們組隊吧，這片奇妙的世界，就讓我一路帶你認識。",
              cute:"我是動物學家‧小真老師。你迷路了吧？跟我們一隊，我帶你認識這個世界！" },
            { who:"動物學家", text:"太好了，隊伍剛好湊滿！今天先回鎮上好好歇一晚，明天一早，我就帶你到河堤去，來場真刀真槍的實戰！",
              cute:"隊伍剛好滿了！先回鎮上休息，明天去河堤練習打怪吧。" },
            /* ★ v4.81.0 對白精緻化(乙案)：三句來回 */
            { who:"直笛團員", text:"四個人，加上你，剛好五個。五線譜也是五條線——這個數字，我很滿意。",
              cute:"加你剛好五個人！五線譜也是五條線，我很滿意。" },
            { who:"小劇團員", text:"五個人！有主角、有可靠的前輩、有負責演的、有負責配樂的——完美的班底！",
              cute:"五個人！有主角、有可靠的前輩、有演的、有配樂的——超完美！" },
            { who:"弦樂團員", text:"善行，你把自己算成「負責演的」，那「負責吐槽的」是誰？",
              cute:"善行，那「負責吐槽的」是誰啊？" },
            /* ★ v4.89.0 老師指定對白修改(2026-07-24):原「……我。」→ 改為把吐槽棒交給主角,笑點更順且把玩家拉進對話。
             *   舊值保留備查(誤刪是大忌):{ who:"直笛團員", text:"……我。", cute:"……我。" } */
            { who:"直笛團員", text:"這種事當然是交給主角啊！",
              cute:"這種事當然是交給主角啊！" },
            { who:"__hero", text:"（心想）掉進裂縫、換了張新臉、還莫名其妙湊了一整隊……這異世界的第一天，資訊量是不是有點太大了？算了——既來之則安之，明天就先打場漂亮的仗吧。",
              cute:"（心想）掉進洞、換新臉、又組了隊……第一天也太多事了吧！算了，明天先打場漂亮的！" }
          ]}
        ]
      },
      ch1: {
        id:"ch1", titleP:"第一章・河堤上的初陣", titleC:"第一章・河堤初戰", reward:"crystal5",
        cover:{ img:"主線_封面_第一章.jpg", bgm:"主線_開場_第一章.m4a" },
        /* ★ v4.80.0(2026-07-22)缺圖修正:原引用 "主線_第一章_河堤運動公園.png" 在 repo 從未存在(raw 404)
         *   → 第一章開場一直退回漸層底沒有畫面。改用老師既有的 "景美溪河堤(精美版).png"
         *   (同一地點·1.03MB·冒險關卡第一幕早已在用=必定存在)。老師日後若另備主線專屬圖,
         *   只要以 "主線_第一章_河堤運動公園.png" 為檔名上傳,把此處改回原檔名即可。 */
        scenes:[
          { img:"景美溪河堤(精美版).png", amb:"park", bgm:"bgm-menu", act:"join_ch1", lines:[
            { who:"籃球隊員", text:"喔——新來的！聽說你昨天掉進裂縫還全身而退，是條硬漢嘛！跟我們一隊吧——記住，Team work makes the dream work，罩得住彼此我們才走得遠！",
              /* ★ v4.89.0 老師指定(2026-07-24):這裡的敲鐘開戰音效太長 → sfxMax 截成 3 秒(到點淡出)。
               *   註:repo 目前沒有 whistle.m4a(404),實際播的是缺檔回退音 sfx-battle-start(開始進攻.mp3),
               *   截斷邏輯對「正式檔或回退音」皆有效;老師日後補上 whistle.m4a 也一樣只播 3 秒。 */
              cute:"新來的！聽說你掉進裂縫還沒事？跟我們一隊吧！", sfx:"whistle", sfxMax:3000 },
            { who:"田徑隊員", text:"（喘著氣）我、我只是跑過來看看而已……不、不過先說好，論速度我可不會輸——每一秒，都要比昨天更快！",
              cute:"（喘）我只是跑來看看……但我跑超快的！" },
            /* ★ v4.81.0 對白精緻化(乙案)：力強 vs 阿動 三句來回 */
            { who:"籃球隊員", text:"「只是跑過來看看」這句，你從一年級講到現在了吧？每次比賽，第一個到場的明明都是你。",
              cute:"「只是跑來看看」這句你講幾年了？每次比賽最早到的都是你耶！" },
            { who:"田徑隊員", text:"……那、那是因為我家離得比較近。",
              cute:"……那、那是因為我家比較近。" },
            { who:"弦樂團員", text:"阿動，你家在山的另一頭喔。",
              cute:"阿動，你家在山的另一邊耶。" },
            { who:"田徑隊員", text:"…………",
              cute:"…………" },
            { who:"__hero", text:"（心想）懂了。這位是那種嘴上說「沒有啦我隨便跑跑」，然後每天最早到操場的人。",
              cute:"（心想）懂了，他就是那種嘴巴說隨便跑跑、結果每天最早到操場的人。" }
          ]},
          { img:"景美溪河堤(精美版).png", amb:"park", lines:[
            { who:"動物學家", text:"正式開打之前，有件最要緊的事得先告訴你——在這個世界，人們的力量從來不是靠拳頭，而是源自『知識』。你懂得越多，能使出的力量就越強大。",
              cute:"打之前先記住一件事：這個世界的力量來自『知識』，懂得越多、就越強！", hl:["知識","力量"] },
            { who:"動物學家", text:"而戰鬥，正是把知識化為力量的舞台。每當你在戰鬥中答對一道題，腦中的智慧就會瞬間凝成真實的能量、灌注給全隊——答得越準，往往能打出讓對手措手不及、出奇制勝的一擊！",
              cute:"戰鬥時每答對一題，知識就會變成力量灌給全隊——常常能出奇制勝喔！", hl:["答對","知識","力量","出奇制勝"] },
            { who:"__hero", text:"（心想）等一下……所以在這個世界想變強的方法，是……上課專心、認真答題？早知道，昨天就不該在數學課上打瞌睡了。",
              cute:"（心想）蛤——所以想變強要認真答題？早知道上課就不打瞌睡了啦！" }
          ]},
          { act:"battle_ch1_1", lines:[
            { who:"動物學家", text:"來，看仔細囉——普通攻擊不花任何能量，可以放心地打；等你攢夠 3 點能量，就能施展威力更強的技能了。",
              cute:"看好囉——普攻不用能量；存滿 3 能量就能放技能！", hl:["普通攻擊","普攻","能量","技能"] }
          ]},
          { act:"tutorial_levelup", lines:[
            { who:"弦樂團員", text:"你變強了呢，這感覺真美妙。這些「素質點」由你自己分配——想更耐打就加 HP，想打得更痛就加攻擊，就像調音一樣，慢慢找出最適合你的那組聲音。",
              cute:"變強啦！這些點數自己分配：想耐打加 HP，想打痛加攻擊。", hl:["素質點","點數","HP","攻擊"] }
          ]},
          { act:"battle_ch1_2", lines:[
            { who:"動物學家", text:"噓——你看這片草叢裡，藏著野生的小夥伴呢！在這個世界，動物是可以「馴養」帶在身邊一起冒險的。來，我親自示範一次給你看。",
              cute:"草叢裡有野生小夥伴！這裡的動物能馴養帶著走，我做給你看。", hl:["馴養"] },
            { who:"籃球隊員", text:"太酷了吧！有寵物並肩作戰，整支隊伍的氣勢都不一樣了！", cute:"太酷了！有寵物一起打更帥！" },
            /* ★ v4.81.0 對白精緻化(乙案) */
            { who:"田徑隊員", text:"……速度。牠比我快。",
              cute:"……牠跑得比我快。" },
            { who:"籃球隊員", text:"阿動，你的對手不是兔子啦。",
              cute:"阿動，你的對手不是兔子啦！" }
          ]}
        ]
      },
      ch2: {
        id:"ch2", titleP:"第二章・異變的線索", titleC:"第二章・找線索", reward:"crystal5",
        cover:{ img:"主線_封面_第二章.jpg", bgm:"主線_開場_第二章.m4a" },
        scenes:[
          { img:"主線_第二章_社團教室.jpg", amb:"classroom", bgm:"bgm-menu-01", act:"join_ch2", lines:[
            { who:"程式設計師", text:"聽說有個從「沒有能力的世界」來的人？有趣……我已經把貓空異變的資料全跑過一遍了。放心，再難的謎題我都不怕——Bug 只是還沒被找到的 Feature 罷了。",
              cute:"聽說有個沒有能力的世界來的人？有趣！我查過貓空的怪事了。", sfx:"keyboard" },
            { who:"__hero", text:"（心想）「Bug 只是還沒被找到的 Feature」……這句話聽起來超帥，但我怎麼越想越覺得，好像只是在幫自己的錯，找一個很體面的藉口？",
              cute:"（心想）這句話聽起來好帥……但總覺得只是在幫錯誤找一個帥氣的藉口？" },
            { who:"電腦繪圖師", text:"我畫了張貓空的地圖給你，你看這裡——顏色我一層一層疊上去才發現，那股飄過來的茶香，色調不太對勁……感覺，有什麼東西正在悄悄褪色。",
              cute:"我畫了張貓空地圖給你，那個茶香怪怪的。" },
            /* ★ v4.81.0 對白精緻化(乙案)：理性 vs 感性三句來回 */
            { who:"程式設計師", text:"「色調不太對勁」——活靈，這種句子我沒辦法寫進程式裡。給我一個數值。",
              cute:"「顏色怪怪的」——這種話我沒辦法寫成程式啦，給我一個數字。" },
            { who:"電腦繪圖師", text:"數值？好啊——大概是……黃色少了三成，然後偷偷多了一點灰。",
              cute:"數字喔？好啊——黃色少了三成，還多了一點灰。" },
            { who:"程式設計師", text:"……那還真的是數值。剛剛那句話我收回。",
              cute:"……真的是數字耶。我剛剛的話收回。" },
            { who:"__hero", text:"（心想）原來畫畫的人也看得到數字，只是他們把數字叫做顏色。",
              cute:"（心想）原來畫畫的人也看得到數字，只是他們叫它顏色。" }
          ]},
          // ★ v4.81.0 B8 — 舊值 { act:"tutorial_shop", lines:[] } 沒有 img,畫面會從「社團教室」
          //   瞬間掉成純漸層底再蓋教學卡(視覺斷層)。沿用同一張社團教室維持場景連貫。
          // ★★ v4.97.0 — 商店實戰教學(老師需求·第2次分次作業):對白鋪陳後,act tutorial_shop
          //   於「首次遊玩」改走 _msActShopLive(真的開商店:賣教材茶 → 買召喚水晶 → 召喚保底果實);
          //   完成過 / 回顧模式維持舊靜態卡。教材對白在此鋪陳(雙版鐵律 1.232)。
          { img:"主線_第二章_社團教室.jpg", amb:"classroom", act:"tutorial_shop", lines:[
            { who:"程式設計師", text:"光用嘴巴講解太沒效率了——身為工程師,我信奉「做中學」。走,我們直接去一趟商店,實際操作一遍給你看。",
              cute:"用講的太慢了!走,直接去商店實際操作一次!", hl:["商店"], sfx:"keyboard" },
            { who:"電腦繪圖師", text:"啊,我路上撿到一杯「喝一半的好茶」……嗯,琥珀色的層次還算漂亮。就把它當作你的第一件教材吧。",
              cute:"我路上撿到一杯「喝一半的好茶」,就當你的第一件教材吧!" },
            { who:"__hero", text:"（心想）等一下,喝到一半的茶也能拿去賣?這個世界的回收業,未免也太先進了。",
              cute:"（心想）喝一半的茶也能賣喔?也太神奇了吧!" }
          ]},
          { act:"tutorial_king", lines:[
            /* ★ v4.97.0 — 商店實戰教學收尾:超越極限果實用途再提醒(雙版鐵律 1.232) */
            { who:"電腦繪圖師", text:"剛剛召喚出來的「超越極限果實」記得收好——那可是能讓英雄的極限爆發再突破一級的寶物,之後對付更強大的魔王時,一定用得上。",
              cute:"抽到的「超越極限果實」要收好喔!它能讓極限爆發升 1 級,以後打魔王超需要!", hl:["超越極限果實","極限爆發"] },
            { who:"程式設計師", text:"補給和情報，就靠這兩個地方：商店買裝備武裝自己，知識王練答題換取獎勵。準備好了嗎？下一站——貓空。",
              cute:"補給和情報靠這兩個地方：商店買東西，知識王答題換獎勵。準備好，下一站貓空！", hl:["商店","知識王"] },
            /* ★ v4.81.0 對白精緻化(乙案) */
            { who:"電腦繪圖師", text:"你剛剛講「下一站——貓空」的時候，中間特地停頓了一下對不對？",
              cute:"你剛剛講「下一站——貓空」，中間有停一下對不對？" },
            { who:"程式設計師", text:"……那叫節奏感。",
              cute:"……那叫節奏感。" },
            { who:"__hero", text:"（心想）我好像看懂了：這一隊每個人，都偷偷想當主角。",
              cute:"（心想）我發現了，這一隊每個人都偷偷想當主角。" }
          ]}
        ]
      },
      ch3: {
        id:"ch3", titleP:"第三章・褪色的茶園", titleC:"第三章・變淡的茶園", reward:"crystal5",
        cover:{ img:"主線_封面_第三章.jpg", bgm:"主線_開場_第三章.m4a" },
        scenes:[
          { img:"主線_第三章_貓空異變.jpg", amb:"teafarm", bgm:"bgm-taiwan-intro", lines:[
            { who:"電腦繪圖師", text:"你看……原本翠綠飽滿的茶園，顏色正一寸一寸地褪去，連瀰漫在山間的靈氣，都像被什麼東西死死封住了。這片景色，正在失去它的色彩。",
              cute:"你看，靈氣被封住了，茶園的顏色都在變淡……" },
            { who:"__narr", text:"話音未落，濃濃的茶霧中，兩道身影一前一後緩緩走了出來。", cute:"這時兩個人從茶霧裡走出來。", sfx:"appear" }
          ]},
          { img:"主線_第三章_劍士祭司登場.jpg", amb:"teafarm", bgm:"bgm-taiwan-cutscene", act:"join_ch3", lines:[
            { who:"劍士", text:"我是巡守貓空的劍士。這股邪術，我盯了很久了。廢話不必多說——擋在前頭的敵人，劍法只有一條路，往前砍。",
              cute:"我是守護貓空的劍士。這個邪術……我等你們很久了。", sfx:"sword" },
            { who:"__hero", text:"（心想）「劍法只有一條路，往前砍」……好、好帥。雖然這聽起來完全沒有任何戰術可言，但不知道為什麼，跟這種人並肩作戰，還真挺讓人安心的。",
              cute:"（心想）「只會往前砍」……雖然超級沒戰術，但不知道為什麼，有他在還挺安心的。" },
            { who:"祭司", text:"我是祭司，能為你們療傷、為你們祈福。這片靈地正在痛苦地哭泣……每一條生命都值得被守護，就讓我們一起，把它淨化回來吧。",
              cute:"我是祭司，可以幫你們療傷。一起來淨化這裡吧！", sfx:"pray" },
            /* ★ v4.81.0 對白精緻化(乙案)：勇直 vs 慈光 三句來回 */
            { who:"祭司", text:"對了勇直，上一次你「往前砍」，砍斷的是我剛搭好的祈禱帳篷。",
              cute:"對了，上次你「往前砍」，砍斷的是我剛搭好的帳篷。" },
            { who:"劍士", text:"……那頂帳篷，擋在路中間。",
              cute:"……那個帳篷擋在路中間。" },
            { who:"祭司", text:"那是我們的營地。",
              cute:"那是我們自己的營地。" },
            { who:"__hero", text:"（心想）這兩個人，大概就是那種吵歸吵、真的打起來卻絕對會把後背交給對方的組合吧。",
              cute:"（心想）他們雖然一直鬥嘴，但打起來一定超有默契。" },
            /* ★ v4.98.0 第三章隊伍改編 —— 電腦繪圖師參戰理由(老師指定意旨:無法放任貓空景色的色彩消失,所以參戰) */
            { who:"電腦繪圖師", text:"這一戰，也算我一份。我沒辦法放任貓空這片景色的色彩，就這樣一寸一寸地消失——身為畫畫的人，這是我不能退讓的底線。",
              cute:"我也要一起打！我不能眼睜睜看著貓空的顏色消失！" },
            { who:"劍士", text:"好。色彩交給你，砍的交給我。",
              cute:"好。顏色交給你，砍交給我。" }
          ]},
          { img:"貓空BOSS戰背景.png", bgm:"bgm-taiwan-boss", act:"battle_ch3_boss", lines:[] },
          { img:"貓空BOSS戰背景.png", amb:"teafarm", bgm:"bgm-taiwan-cutscene", lines:[
            { who:"劍士", text:"封印鬆動了，靈氣正慢慢流回來……但別鬆懈。真正在幕後操縱這一切的黑手，還藏在花林深處。",
              cute:"靈氣鬆開了……但真正的壞蛋，還在花林深處。" },
            /* ★ v4.81.0 對白精緻化(乙案) */
            { who:"祭司", text:"翻譯一下：還要再往前砍。",
              cute:"翻譯一下：還要繼續往前砍。" },
            { who:"劍士", text:"……嗯。",
              cute:"……嗯。" },
            { who:"弦樂團員", text:"（小聲）不知道為什麼，這兩個人的合奏，意外地和諧耶。",
              cute:"（小聲）他們兩個講話，居然還滿搭的耶。" }
          ]}
        ]
      },
      ch4: {
        id:"ch4", titleP:"第四章・被奪走的心", titleC:"第四章・被控制的心", reward:"crystal5",
        cover:{ img:"主線_封面_第四章.jpg", bgm:"主線_開場_第四章.m4a" },
        scenes:[
          { img:"主線_第四章_杏花妖花林.jpg", amb:"flowerforest", bgm:"bgm-boss-apricot", lines:[
            { who:"杏花妖", text:"呵呵……又送上門幾隻不知天高地厚的小蟲。聞聞看吧，我這醉人的花香，能悄悄奪走任何人的心智——連他們，也早已是我的了。",
              cute:"呵……又來了幾隻小蟲。我的花香，能控制任何人的心！", sfx:"charm" },
            /* ★ v4.81.0 對白精緻化(乙案)：反派也給笑點 */
            { who:"小劇團員", text:"等一下——這位反派的登場台詞也太完整了吧？連笑聲都排練過。",
              cute:"等等——這個壞人的台詞也太完整了吧？連笑聲都有練過！" },
            { who:"杏花妖", text:"當然排練過。難得來了觀眾，總不能隨便「呵呵」兩聲就打發你們吧？",
              cute:"當然練過啊。難得有觀眾，隨便笑兩聲多沒誠意。" },
            { who:"__hero", text:"（心想）糟了。我們這邊也有一個一模一樣的人。",
              cute:"（心想）糟了，我們這邊也有一個一樣的人。" },
            { who:"__narr", text:"甜膩的花香在林間層層瀰漫。兩道熟悉的身影自花叢後緩緩轉出，雙眼泛著詭異的血紅，冷冷地擋在路前——",
              cute:"花香飄過來，兩個熟悉的身影紅著眼睛擋住路——" },
            /* ★ v4.98.0 第四章劇情修改(老師裁定甲+劇情修改)——火法師改「戰前」登場並參戰:
             *   想親手打醒被魅惑的男性夥伴(守衛/刺客)+展現火屬性剋制花妖。
             *   火柱入場演出由原第3場(戰後)移到此處;第3場對應段落同步改寫(見下)。 */
            { who:"__narr", text:"就在此時，林外驟然騰起一道熾烈的火柱，轟地燒開纏繞路徑的妖藤——一名法師踏著餘燼，大步走了過來。",
              cute:"這時一道大火燒開妖藤，一個法師走了過來！", sfx:"fire" },
            { who:"火法師", text:"守衛！刺客！你們兩個大男人……居然被一朵花給迷住了？我是火法師——魅惑之花，最怕的就是烈火。這一戰算我一份，我要親手把這兩個笨蛋夥伴打醒！",
              cute:"守衛！刺客！你們居然被花控制了！我是火法師，花最怕火——我要親手把他們打醒！" },
            { who:"祭司", text:"火剋花……屬性上正好剋制。有你的烈焰開路，這場魅惑之局就有解了。",
              cute:"火剋花，屬性剛剛好！有你在就有救了。" },
            { who:"__hero", text:"（心想）打醒夥伴的方式是「燒」……嗯，雖然聽起來很粗暴，但不知道為什麼，我完全不擔心。",
              cute:"（心想）用火打醒夥伴……好粗暴，但感覺很可靠！" }
          ]},
          { img:"主線_第四章_魅惑守衛刺客.jpg", act:"battle_ch4_boss", lines:[] },
          { img:"主線_第四章_杏花妖花林.jpg", amb:"flowerforest", bgm:"bgm-taiwan-cutscene", act:"join_ch4", lines:[
            /* ★ v4.99.0 —— 杏花妖本尊現已真的在戰鬥中被打倒,戰後開頭補一句她敗退+魅惑解除的旁白銜接 */
            { who:"__narr", text:"杏花妖不甘地嬌喝一聲，化作漫天花瓣散入林間深處——纏繞在守衛與刺客身上的魅惑妖香，也隨之碎裂消散。",
              cute:"杏花妖大叫一聲，變成花瓣逃走了！控制夥伴的魔法也跟著消失了。" },
            { who:"守衛", text:"唔……我居然被那花香操控了，真是丟臉。多虧你們把我打醒。這份恩情我記下了——這面盾，從今往後，就為你們而舉。",
              cute:"唔……我竟然被花香控制了……謝謝你們救我。這面盾，以後為你們擋！", sfx:"shield" },
            { who:"刺客", text:"這一次，算我欠你的。我的刃，接下來替你出鞘——放心，我的字典裡，沒有失敗兩個字。",
              cute:"欠你一次。我的刀，以後幫你出鞘！" },
            /* ★ v4.81.0 對白精緻化(乙案) */
            { who:"守衛", text:"我竟然對著自己人舉起了盾……這件事我要寫進日記，每天翻出來看一次。",
              cute:"我居然對自己人舉盾……我要寫在日記裡，每天看一次。" },
            { who:"刺客", text:"別寫了，很煩。",
              cute:"別寫了啦，很煩。" },
            /* ★ v4.98.0 第四章劇情修改——火法師已於第1場「戰前」登場參戰,原戰後火柱首次登場演出移除,
             *   改為戰後對兩位被打醒夥伴的收尾。舊段保留註解備查(誤刪是大忌):
             *   { who:"__narr", text:"話音才落，花林深處驟然騰起一道熾烈的火柱，轟地燒開纏繞路徑的妖藤——", cute:"就在這時，花林深處冒出一道大火，燒斷了纏住路的妖藤——", sfx:"fire" },
             *   { who:"火法師", text:"哈！魅惑之花，最怕的就是烈火。這片妖林，就交給我的火焰來淨化吧——燃燒吧！比我更強的傢伙，快站出來！", cute:"迷惑人的花最怕火。這片妖怪森林，交給我的火焰來清乾淨！" }, */
            { who:"火法師", text:"醒了就好。下次再被一朵花給迷住，我就把整片花林燒了，給你們兩個醒醒腦。",
              cute:"醒了就好！下次再被花迷住，我就把整片花林燒掉！" },
            /* ★ v4.81.0 對白精緻化(乙案) */
            { who:"刺客", text:"他每次登場都要放火。",
              cute:"他每次出場都要放火。" },
            { who:"守衛", text:"上一次燒掉的是我的斗篷。",
              cute:"上次燒掉的是我的披風。" },
            { who:"火法師", text:"那是為了幫你驅寒！",
              cute:"那是要幫你取暖啊！" },
            { who:"__hero", text:"謝謝你，火法師！有你這把火開路，我們一定能燒穿這片花林！",
              cute:"謝謝你，火法師！有你的火，我們一定能衝過這片花林！" }
          ]}
        ]
      },
      ch5: {
        id:"ch5", titleP:"第五章・發酵魔王的陰謀", titleC:"第五章・臭味魔王", reward:"crystal5_sword",
        cover:{ img:"主線_封面_第五章.jpg", bgm:"主線_開場_第五章.m4a" },
        scenes:[
          /* ★ v5.0.0(2026-07-28)— 老師需求:去深坑之前先加「學校內對話」場景(沿用現有場景圖 主線_第二章_社團教室.jpg):
           *   劍士/祭司/火法師/刺客/守衛 說明自己來自異世界·任務=討伐各地的異象與魔物·
           *   祭司感應到下一個受汙染地點=深坑老街 → 銜接原第 1 場「循著臭氣來到深坑老街」臭豆腐 BOSS 爆笑劇情(原封不動)。
           *   雙版鐵律 1.232·sfx 沿用既有 pray·主線引擎逐場順播無硬編索引·獎勵 _r_bt_ 冪等不受場次位移影響。 */
          { img:"主線_第二章_社團教室.jpg", amb:"classroom", bgm:"bgm-menu-01", lines:[
            { who:"__narr", text:"擊退杏花妖後，大家回到熟悉的社團教室稍作休整。難得的平靜裡，你終於問出了憋在心裡很久的問題——你們，到底是從哪裡來的？",
              cute:"打敗杏花妖後，大家回到社團教室休息。你終於問出：「你們到底是從哪裡來的？」" },
            { who:"劍士", text:"異世界。我們五個，都是從次元裂縫另一端的世界來的。話說得簡單：哪裡有異象和魔物，我們就去哪裡——往前砍。",
              cute:"我們五個都是從異世界來的。哪裡有怪物，我們就去哪裡砍。", sfx:"sword" },
            { who:"祭司", text:"請容我補充得完整一點。我們奉命跨越裂縫，討伐散落各地的異象與魔物，守護這片土地的靈氣——這是我們的任務，也是我們的榮耀。",
              cute:"我們的任務，就是打倒各地的異象和魔物，守護這裡的靈氣。" },
            { who:"火法師", text:"說得那麼文謅謅做什麼！簡單講——壞東西出現，我們就燒過去！只是這次連守衛跟刺客都被一朵花迷倒，看來這個世界的魔物，還挺會挑對手的嘛。",
              cute:"簡單說——有壞東西，我們就燒過去！只是這次連守衛和刺客都被花迷倒了耶。" },
            { who:"守衛", text:"……那件事可以不要再提了嗎。",
              cute:"……那件事可以不要再講了嗎。" },
            { who:"刺客", text:"（撇過頭）同感。",
              cute:"（撇頭）同感。" },
            { who:"__hero", text:"（心想）原來如此……難怪他們一個比一個強。異世界來的討伐小隊，加上我們社團全員——這陣容，感覺什麼魔王都打得贏！",
              cute:"（心想）原來他們是異世界的討伐小隊！加上我們社團大家，什麼魔王都不怕！" },
            { who:"__narr", text:"就在這時，祭司忽然閉上雙眼，指尖泛起淡淡的微光——",
              cute:"這時，祭司忽然閉上眼睛，手指發出微微的光——", sfx:"pray" },
            { who:"祭司", text:"……感應到了。下一個被汙染的地方，在「深坑老街」。那裡的靈氣，正被一股……嗯……非常、非常獨特的「氣味」侵蝕著。",
              cute:"……感應到了！下一個被汙染的地方，是「深坑老街」。那裡有一股很奇怪的味道。", hl:["深坑老街"] },
            { who:"刺客", text:"氣味？魔物還沒見到，我在這裡就先聞到了。",
              cute:"味道？我在這裡就先聞到了。" },
            { who:"劍士", text:"目標確定——深坑老街。出發。",
              cute:"目標：深坑老街。出發！" }
          ]},
          { img:"深坑老街.png", amb:"oldstreet", bgm:"bgm-taiwan-boss", lines:[
            { who:"__narr", text:"循著一路愈發濃烈、幾乎令人窒息的臭氣，你們一行人拐進了古樸的深坑老街。街道盡頭，一團扭曲的黑影正咕嘟咕嘟地冒著泡。",
              cute:"跟著越來越濃的臭味，你們來到深坑老街。" },
            { who:"臭氣魔王・發酵公", text:"哼哼，來得正好！我要奪取深坑代代相傳的發酵秘方，讓全島的食物統統失去香味，只剩下我的臭氣！咳咳咳——來，好好聞聞吧！",
              cute:"我要搶走深坑的發酵秘方，讓全島的食物都變難吃！咳咳，聞聞我的臭味吧！", sfx:"stink" },
            /* ★ v4.81.0 對白精緻化(乙案)：反派笑點 */
            { who:"直笛團員", text:"（摀著鼻子）……這個味道，有層次。",
              cute:"（摀鼻）……這個味道，有層次耶。" },
            { who:"臭氣魔王・發酵公", text:"聽見沒有！有層次！這位小兄弟懂我——來人啊，這孩子我不打了！",
              cute:"聽到了沒！有層次！這位小朋友懂我！這個我不打了！" },
            { who:"直笛團員", text:"我沒有在稱讚你。",
              cute:"我沒有在稱讚你。" },
            { who:"__hero", text:"（摀著鼻子·心想）好好聞聞？不，我拒絕。這股味道……比體育課後整間教室悶了一節課的味道，還要濃上十倍。這場架，我們速戰速決，拜託了！",
              cute:"（摀鼻）好好聞聞才怪！這味道比體育課後的教室還濃十倍……我們快點解決啦！" }
          ]},
          { img:"臭豆腐BOSS.png", act:"battle_ch5_boss", lines:[] },
          { img:"深坑老街.png", amb:"oldstreet", bgm:"bgm-treasure-gallery", act:"grant_sword_tutorial", lines:[
            { who:"弦樂團員", text:"你看，這就是傳說中的「至寶」了。把它裝在英雄身上，還能持續投資讓它慢慢成長——就像日復一日的練習，愈用，會愈強。",
              cute:"把至寶裝到英雄身上，還能投資讓它變強，越用越厲害！", sfx:"treasure", hl:["至寶","投資"] },
            /* ★ v4.81.0 對白精緻化(乙案) */
            { who:"__hero", text:"等一下……這把劍，是不是也有一點剛剛那個味道？",
              cute:"等等……這把劍是不是也有剛剛那個味道？" },
            { who:"弦樂團員", text:"有。而且我覺得，它非常以此為傲。",
              cute:"有喔。而且我覺得它很驕傲。" },
            { who:"直笛團員", text:"……那我走後面一點。",
              cute:"……那我走後面一點。" }
          ]}
        ]
      },
      ch6: {
        id:"ch6", titleP:"第六章・吞噬色彩的黑暗", titleC:"第六章・黑暗大決戰", reward:"crystal5",
        cover:{ img:"主線_封面_第六章.jpg", bgm:"主線_開場_第六章.m4a" },
        scenes:[
          /* ★★ v5.1.0(2026-07-29·老師需求)—— 第六章開頭新增「電腦繪圖與程式設計校隊教室」對話場景:
           *   深坑決戰後回到社團教室聊天,大家「同時」接獲最新消息=貓空出現神秘次元裂縫、
           *   不斷奪走周圍的色彩與生命能量 → 主角群前往一探究竟。
           *   銜接原第 1 場開頭旁白「天空的裂縫『終於』失控地炸裂開來」(裂縫在此先被報導=伏筆成立,
           *   抵達貓空的瞬間裂縫失控、黑暗球升起,原劇情原封不動一字未改)。
           *   場景沿用現有 主線_第二章_社團教室.jpg + amb classroom + bgm-menu-01(與 ch2/ch5 教室場景同款,
           *   下一場黑暗球 bgm-boss-darkorb 形成張力對比);sfx 沿用既有 keyboard,零新音檔零新圖檔;
           *   對白 11 句全雙版(鐵律 1.232),沿用各角色既有口癖(程式設計師工程師腔/電腦繪圖師色彩魂/
           *   動物學家生命關懷/田徑隊員「我在前面」跑第一梗/小劇團員舞台梗/主角內心吐槽+覺醒伏筆)。 */
          { img:"主線_第二章_社團教室.jpg", amb:"classroom", bgm:"bgm-menu-01", lines:[
            { who:"__narr", text:"深坑決戰之後，一行人回到電腦繪圖與程式設計校隊的教室休整。螢幕的微光映著大家的笑臉，七嘴八舌地聊著一路走來的冒險。",
              cute:"大家回到電腦社團教室休息，開心地聊著冒險的事。" },
            { who:"程式設計師", text:"這一路的戰鬥資料，我全都整理進資料庫了——從迷霧森林到深坑老街，每一場都是珍貴的樣本。嗯，程式跑完零錯誤，完美。",
              cute:"我把大家的戰鬥資料都存進電腦了，完全沒有錯誤！", sfx:"keyboard" },
            { who:"電腦繪圖師", text:"我也把奪回來的顏色，一筆一筆畫回地圖上了。你看——貓空的茶園綠、深坑的豆腐金……這張地圖，總算又亮了起來。",
              cute:"我把搶回來的顏色都畫回地圖上了，地圖變漂亮了！" },
            { who:"__hero", text:"（心想）一個把冒險存成資料庫，一個把冒險畫成地圖……我們這個社團，根本是全世界最強的冒險紀錄組合吧。",
              cute:"（心想）一個存資料、一個畫地圖，我們社團也太強了吧！" },
            { who:"__narr", text:"就在此時——教室裡所有的螢幕與手機，同時「叮！」地一聲亮起，跳出同一則最新消息。",
              cute:"這時，所有螢幕和手機同時「叮！」一聲，跳出同一則消息！", sfx:"keyboard" },
            { who:"程式設計師", text:"快訊——「貓空上空出現神祕的次元裂縫，正不斷奪走周圍的色彩與生命能量，影響範圍持續擴大中」……這訊號強度，絕對不是普通的異變。",
              cute:"快訊！「貓空出現神祕的次元裂縫，一直吸走顏色和生命能量！」", hl:["次元裂縫"] },
            { who:"電腦繪圖師", text:"又是貓空……而且這一次，連「色彩」都被指名奪走。我們才剛把顏色一筆一筆畫回來——絕對不能讓它被搶走第二次！",
              cute:"又是貓空！顏色才剛畫回來，不能再被搶走！" },
            { who:"動物學家", text:"比色彩更可怕的是「生命能量」……再這樣被吸下去，山裡的動物、草木，全都會失去生機。事不宜遲，我們馬上過去！",
              cute:"生命能量被吸走，山裡的動物會有危險！快出發吧！" },
            { who:"田徑隊員", text:"（已經背好背包站在門口）我在門口。你們快點啦。",
              cute:"（背好背包站在門口）我在門口啦，你們快一點！" },
            { who:"小劇團員", text:"各位，聽好了——最終決戰的布幕，已經拉開了！",
              cute:"大家聽好，最後的大決戰開始了！" },
            { who:"__hero", text:"（心想）不知道為什麼，胸口深處……有一股力量正隱隱發燙。走吧——去貓空，把這一切的答案，弄個清楚！",
              cute:"（心想）我的胸口熱熱的……走吧，去貓空看清楚！" }
          ]},
          { img:"主線_第六章_黑暗球降臨.jpg", amb:"darkness", bgm:"bgm-boss-darkorb", lines:[
            { who:"__narr", text:"天空的裂縫終於失控地炸裂開來，一顆巨大無比的黑暗球緩緩升起，懸在城鎮上方。它每轉一圈，周遭的生機與色彩就被貪婪地吞噬一分，天地間只剩下一片死寂的灰。",
              cute:"裂縫爆炸了，一顆巨大的黑暗球升起，把周圍的顏色都吸光了。", sfx:"darkrise" },
            { who:"動物學家", text:"就是它——這一切異變的源頭！可是……面對這麼濃的黑暗，我們現在的力量，還遠遠不夠。",
              cute:"就是它！所有怪事的源頭……但它太強，我們的力量還不夠。" },
            /* ★ v4.81.0 對白精緻化(乙案)：覺醒前全員打氣 */
            { who:"籃球隊員", text:"力量不夠？那就靠人多。全隊都在這裡了，一個都沒少。",
              cute:"力量不夠？那就大家一起上！全隊都到齊了！" },
            { who:"直笛團員", text:"阿動不在。",
              cute:"阿動不在。" },
            { who:"田徑隊員", text:"（已經站在最前面回過頭）我在前面。你們快點啦。",
              cute:"（站在最前面回頭）我在前面啦，你們快一點！" },
            { who:"小劇團員", text:"最終決戰、全員到齊、主角覺醒——這根本就是為了舞台寫好的劇本啊！",
              cute:"最後大決戰、大家到齊、主角覺醒——這根本是為了演出寫的劇本！" },
            { who:"__hero", text:"（心想）不夠嗎？不……我體內還有一股從沒真正使出來的力量。這一路走來，我看著大家並肩戰鬥、一起成長——現在，換我上場了。",
              cute:"（心想）不夠？不……我還有沒用出來的力量。看了大家這麼久——現在換我了！" }
          ]},
          /* ★ v5.5.0(老師需求 2026-07-31·裁定:音樂=章節音樂.m4a)—— 主角覺醒動畫影片「同時播放章節音樂」:
           *   bgm:"none" → 場景開頭先停掉前一場的 BGM(bgm-boss-darkorb),避免與章節音樂疊聲;
           *   coverMusic:true → _msPlayScene 影片插槽偵測到即以 new Audio 播放 repo 根目錄
           *   章節音樂.m4a(同 _msPlayCover 封面口徑·帶 ?v= 破快取·音量 0.72),與影片同時進行;
           *   影片結束/缺檔/逾時(_vFin)→ 章節音樂淡出停止 → 進下一場戰鬥(戰鬥 BGM 由 ctx.bgm 接手)。
           *   缺檔/被擋皆靜默不擋劇情。舊值備查:
           *   { video:"主線_第六章_主角覺醒.mp4", act:"awaken_hero", lines:[] } */
          { video:"主線_第六章_主角覺醒.mp4", act:"awaken_hero", bgm:"none", coverMusic:true, lines:[] },
          { img:"主線_第六章_黑暗球降臨.jpg", act:"battle_ch6_boss", lines:[] },
          { img:"主線_第六章_黑暗球降臨.jpg", amb:"darkness", bgm:"bgm-taiwan-cutscene", lines:[
            { who:"動物學家", text:"色彩……一點一點回來了。你真的做到了。", cute:"顏色……回來了。你做到了！", sfx:"restore" },
            /* ★ v4.81.0 對白精緻化(乙案) */
            { who:"電腦繪圖師", text:"顏色回來了……而且比我印象中的，還要再飽和一點點。",
              cute:"顏色回來了……而且好像比以前更鮮豔一點耶。" },
            { who:"程式設計師", text:"那大概是因為，這一次是我們自己畫上去的。",
              cute:"因為這次的顏色，是我們自己畫上去的啊。" },
            { who:"__narr", text:"黑暗球在光芒中緩緩消散，被奪走的顏色重新流回大地，貓空的茶香又變得清甜。你的異世界冒險，暫時在這裡告一段落——但屬於你和夥伴們的故事，才正要開始。",
              cute:"黑暗球消失了，貓空的茶香又變甜了。你的冒險先告一段落——但夥伴們的故事，才要開始！" }
          ]}
        ]
      }
    }
  };
  window.MAINSTORY_DB = MAINSTORY_DB;

  // ════════ 進度讀寫(self-write·players/{uid} merge·免改 rules)════════
  function _msProgress(){
    try{ window._mainStoryProgress = window._mainStoryProgress || {}; }catch(_){}
    return window._mainStoryProgress || {};
  }
  function _msChapterDone(cid){
    var p = _msProgress(); return !!(p && p[cid] === "done");
  }
  // ★ v4.81.0 C2 — 進度落地單一出口(本地鏡像一定寫;雲端寫入可暫停合併)
  //   根因:一次章節結束會連著跑 _msClearScenePos → _msMarkChapterDone → _msRewardFlagSet(章節獎勵)
  //        →(可能再一次)_msRewardFlagSet(全通關),每支各自呼叫一次 _fbSaveMainStoryProgress
  //        = 同一份物件連寫雲端 3~4 次。900 位學生 × 7 章,純屬浪費配額。
  //   修法:_msBeginBatch() 期間只寫本地並記 dirty,_msEndBatch() 用「當下最新的 p」補寫雲端一次。
  //        非批次期間行為與舊版完全相同(即時寫),所以任何沒被包起來的路徑都不會漏存。
  var _msBatchDepth = 0, _msBatchDirty = false;
  function _msPersist(p){
    try{
      var uid = (window._fbUser && window._fbUser.uid) || window._gUserId || "";
      if(uid) localStorage.setItem("lxps_mainstory_" + uid, JSON.stringify(p));
    }catch(_){}
    if(_msBatchDepth > 0){ _msBatchDirty = true; return; }        // 批次中 → 只落本地,雲端留到 endBatch 一次寫
    try{ if(typeof window._fbSaveMainStoryProgress === "function") window._fbSaveMainStoryProgress(p); }catch(_){}
  }
  function _msBeginBatch(){ _msBatchDepth++; }
  function _msEndBatch(){
    _msBatchDepth--; if(_msBatchDepth > 0) return;
    _msBatchDepth = 0;
    if(!_msBatchDirty) return;
    _msBatchDirty = false;
    try{ if(typeof window._fbSaveMainStoryProgress === "function") window._fbSaveMainStoryProgress(_msProgress()); }catch(_){}
  }
  function _msMarkChapterDone(cid){
    var p = _msProgress(); p[cid] = "done";
    _msPersist(p);   // 本地鏡像(綁 uid·跨重整)+ 雲端 self-write(批次中則延到 endBatch)
    // ★ v5.9.0 — 章節完成當下判定主角類獎章(冪等 sweep;全通/覺醒/單章枚一次到位)
    try{ if(typeof window._protagMedalSweep === "function") window._protagMedalSweep(); }catch(_eMdl){}
    // ★ v5.6.0 — 章節完成當下同步刷新入口進度徽章(關掉主線視窗回關卡頁不會重跑頁面顯示函式,靠這裡即時更新)
    try{ if(typeof window._msRefreshEntryVisibility === "function") window._msRefreshEntryVisibility(); }catch(_){}
  }
  // 登入後由 gameCloudLoad 呼叫:把雲端 mainStoryProgress 併入 window(雲端優先·union done)
  window._msHydrateProgress = function(cloudObj){
    try{
      var uid = (window._fbUser && window._fbUser.uid) || window._gUserId || "";
      // ★ v4.78.0 UID 守門(雙保險·任務3):記憶體進度綁 uid;偵測到與上次 hydrate 的 uid 不同
      //   → 先清空記憶體再 union,杜絕共用 iPad 換帳號(未 reload)把前一位的 done 併進來。
      //   _clearAccountLocalData 已在換帳號時清一次,此處為第二道防線(該路徑若沒跑到也不會污染)。
      try{
        var _prevUid = window._mainStoryProgressUid || "";
        if(uid && _prevUid && _prevUid !== uid){ window._mainStoryProgress = {}; }
        if(uid) window._mainStoryProgressUid = uid;
      }catch(_){}
      var p = _msProgress();
      var local = {};
      try{ if(uid){ var s = localStorage.getItem("lxps_mainstory_" + uid); if(s) local = JSON.parse(s) || {}; } }catch(_){}
      var src = (cloudObj && typeof cloudObj === "object") ? cloudObj : {};
      // ★ v5.7.0 — GM 回溯紀元(_rst):後台「⏪ 主線/主角回溯」把雲端 mainStoryProgress 整份換成 {_rst:ts}。
      //   若不處理,本機鏡像/記憶體的舊進度會被下面 union「只增不減」全數併回、丙1 還會補寫上雲 = 回溯被自動復原。
      //   規則:雲端 _rst 比本機鏡像/記憶體記錄的新 → 該來源視為「回溯前殘留」整份作廢(並刪本機鏡像檔),
      //   之後照常 union(雲端為唯一真相);_rst 存進 p 隨每次 persist 帶著 → 各裝置逐台失效、重跑冪等。
      //   ("_rst" 不會被 _r_ 前綴的發獎旗標 union 誤掃:前綴判斷是 indexOf("_r_")===0,"_rst" 第三字元非底線。)
      try{
        var _rstC = (typeof src._rst === "number") ? src._rst : 0;
        if(_rstC){
          if((((typeof local._rst === "number") ? local._rst : 0)) < _rstC){
            local = {};
            try{ if(uid) localStorage.removeItem("lxps_mainstory_" + uid); }catch(_eRm){}
          }
          if((((typeof p._rst === "number") ? p._rst : 0)) < _rstC){
            window._mainStoryProgress = {};
            p = _msProgress();
          }
          p._rst = _rstC;
        }
      }catch(_eRst){}
      // union:任一來源標 done 即 done(進度只增不退)
      MAINSTORY_DB.order.forEach(function(cid){
        if(src[cid] === "done" || local[cid] === "done" || p[cid] === "done") p[cid] = "done";
        // ★ v4.67.0 Q2 — 未完成章節:還原場景續播點(雲端/本地/記憶取大);已完成章:清除
        if(p[cid] !== "done"){
          var sk = "_sc_" + cid;
          var _a = (typeof src[sk] === "number") ? src[sk] : 0;
          var _b = (typeof local[sk] === "number") ? local[sk] : 0;
          var _c = (typeof p[sk] === "number") ? p[sk] : 0;
          var _mx = Math.max(_a, _b, _c);
          if(_mx > 0) p[sk] = _mx;
        } else if(p["_sc_" + cid] != null){ delete p["_sc_" + cid]; }
      });
      // ★ v4.81.0 A1 — 發獎冪等旗標 _r_* 一併 union 回記憶體(舊版只 union done 與 _sc_*,
      //   重整/換裝置後記憶體恆無 _r_* → 共用平板多開時同章可重複發獎[5水晶/劍士祭司/守衛刺客火法師/SSR卷])。
      //   只增不減:任一來源有值即採信(值是 Date.now 時間戳,取較早者代表第一次發放時間)。
      try{
        var _rk = {};
        [src, local, p].forEach(function(o){
          if(!o || typeof o !== "object") return;
          for(var k in o){
            if(!Object.prototype.hasOwnProperty.call(o, k)) continue;
            if(k.indexOf("_r_") !== 0) continue;
            var v = o[k]; if(!v) continue;
            if(!_rk[k] || (typeof v === "number" && typeof _rk[k] === "number" && v < _rk[k])) _rk[k] = v;
          }
        });
        for(var _k2 in _rk){ if(Object.prototype.hasOwnProperty.call(_rk, _k2)) p[_k2] = _rk[_k2]; }
      }catch(_er){ console.warn("[主線] 獎勵旗標 union 失敗", _er); }
      window._mainStoryProgress = p;
      // ★ v5.6.0 丙1 — 懶回寫對帳:union 後若本機鏡像/記憶體有「雲端沒有的鍵」(先前 fire-and-forget
      //   寫入失敗·校網斷線等),立即補寫一次(merge 深合併·每次登入最多一筆),
      //   免得學生換到別台裝置時雲端缺進度 → 重打章節 → 水晶/知識幣重複領。
      try{
        var _needUp = false;
        for(var _hk in p){
          if(!Object.prototype.hasOwnProperty.call(p, _hk)) continue;
          if(src[_hk] === undefined){ _needUp = true; break; }
        }
        if(_needUp && typeof window._fbSaveMainStoryProgress === "function") window._fbSaveMainStoryProgress(p);
      }catch(_eUp){}
      // ★ v5.6.0 丙2 — 「ch6 已完成、主角卻未覺醒」自我修復(覺醒走 avatarCard 那條線,
      //   雲端寫失敗+換裝置會卡在死角;回顧模式又刻意不跑狀態套用 → 玩家自己永遠修不回來)。
      //   立即檢查一次 + 8 秒後再檢查一次(避開 avatarCard 雲端載入較晚完成、把記憶體旗標
      //   蓋回 false 的時序);_msEnsureChapterState 冪等,多跑無副作用。第三個檢查點在章節選單。
      try{
        var _awFix = function(){ try{ if(_msChapterDone("ch6") && !window._protagAwakened) _msEnsureChapterState("ch6"); }catch(_){} };
        _awFix();
        setTimeout(_awFix, 8000);
      }catch(_eAw){}
      // ★ v5.6.0 — 雲端進度 hydrate 完成後刷新入口進度徽章(登入非同步回填可能晚於關卡頁首次顯示)
      try{ if(typeof window._msRefreshEntryVisibility === "function") window._msRefreshEntryVisibility(); }catch(_){}
    }catch(_e){ console.warn("[主線] hydrate 失敗", _e); }
  };

  // ════════ 發獎冪等(比照 mainStoryChapReward_n / mainStoryAllClearReward)════════
  function _msRewardFlagGet(key){
    try{ var p = _msProgress(); return !!(p["_r_" + key]); }catch(_){ return false; }
  }
  function _msRewardFlagSet(key){
    try{
      var p = _msProgress(); p["_r_" + key] = Date.now();
      _msPersist(p);   // ★ v4.81.0 C2 — 舊版在此自行寫 localStorage + _fbSaveMainStoryProgress,改走單一出口(批次中延後合併)
    }catch(_){}
  }
  // ★ v4.81.0 老師裁定(2026-07-22)— 每章通關知識幣獎勵(與 5 召喚水晶同一筆冪等旗標 _r_chap_{cid})
  var _MS_CHAPTER_COINS = 20000;
  // ★ v4.67.0 主線批次2a — 章節通關「直接解鎖」SR 夥伴(重複→已擁有不再補水晶·v4.81.0 老師裁定);維持 SR·不進 SSR 池
  var _MS_STORY_HERO_GRANTS = { ch3: ["劍士", "祭司"], ch4: ["守衛", "刺客", "火法師"] };
  // ★ v4.79.0 老師指示(2026-07-22)— 章節通關解鎖造型部件(key 格式 cat:id·與 avatar_db.js
  //   AVATAR_UNLOCK_HOW / _avatarIsUnlocked / GM 上鎖表同一組鍵;寫入 avatarCard.unlock 帳本)
  var _MS_STORY_AVATAR_GRANTS = {
    prologue: ["gls:5"],        // 酷炫墨鏡
    ch1:      ["mouthacc:1"],   // 趕時間吐司
    ch2:      ["hat:4"],        // 學生帽
    ch3:      ["mouthacc:3"],   // 瀟灑葉子
    ch4:      ["mouthacc:6"],   // 櫻花瓣
    ch5:      ["hat:5"],        // 棒球帽
    ch6:      ["mouthacc:8"]    // 黑色口罩
  };
  var _MS_AVATAR_NAME = {
    "gls:5":"酷炫墨鏡", "mouthacc:1":"趕時間吐司", "hat:4":"學生帽", "mouthacc:3":"瀟灑葉子",
    "mouthacc:6":"櫻花瓣", "hat:5":"棒球帽", "mouthacc:8":"黑色口罩"
  };
  function _msShowAvatarUnlockToast(keys){
    try{
      var ns = [];
      for(var i = 0; i < keys.length; i++){ ns.push(_MS_AVATAR_NAME[keys[i]] || keys[i]); }
      var msg = "👤 " + _msT("造型工房解鎖新部件：", "打扮的東西多了新的：") + ns.join("、");
      setTimeout(function(){
        try{ if(typeof _showInGameToast === "function") _showInGameToast(msg, "#9fd6ff", 5200); }catch(_){}
      }, 900);
    }catch(_e){}
  }
  // ★ v4.79.0 主線章節至寶發放(走既有台灣至寶資料結構·冪等:已擁有不覆蓋等級/裝備狀態)
  //   回傳 true=本次新解鎖 / false=早已擁有或失敗
  function _msGrantStoryTreasure(tid){
    try{
      if(!tid) return false;
      if(typeof window._taiwanTreasureData !== "object" || !window._taiwanTreasureData){
        window._taiwanTreasureData = {};
      }
      if(window._taiwanTreasureData[tid]) return false;                 // 已擁有 → 冪等不動
      window._taiwanTreasureData[tid] = { lv: 1, exp: 0, equippedTo: null };
      try{
        if(typeof window._saveTaiwanTreasureData === "function") window._saveTaiwanTreasureData();
        else localStorage.setItem("lxps_taiwan_treasures", JSON.stringify(window._taiwanTreasureData));
      }catch(_eS){}
      try{
        if(typeof window._advSaveTreasureUnlockHistory === "function"){
          window._advSaveTreasureUnlockHistory(tid, "mainstory_clear");  // 解鎖來源帳本(GM 稽核可查)
        }
      }catch(_eH){}
      try{ if(typeof window._lxpsInstantPersist === "function") window._lxpsInstantPersist("主線至寶發放"); }catch(_eP){}
      return true;
    }catch(_e){ console.warn("[主線] 至寶發放失敗", tid, _e); return false; }
  }
  window._msGrantStoryTreasure = _msGrantStoryTreasure;
  function _msGrantStoryHero(name){
    if(!name) return;
    try{
      var owned = [];
      try{ if(typeof advGetUnlockedHeroes === "function") owned = advGetUnlockedHeroes() || []; }catch(_){}
      // ★ v4.81.0 老師裁定(2026-07-22)— 已擁有時「不再補發 5 召喚水晶」。
      //   舊行為:owned → backpackAdd("summon_crystal", 5),這是主線角色獎勵唯一可能被重複觸發的出口;
      //   移除後,主線的水晶一律只從章節獎勵發(每章一次·綁 uid 冪等),重複發放的風險徹底消失。
      //   舊碼保留於本註解:if(owned.indexOf(name) >= 0){ backpackAdd("summon_crystal", 5); } else { ... }
      if(owned.indexOf(name) >= 0) return;                                                              // 已擁有 → 什麼都不做
      try{ if(typeof advSaveUnlockedHero === "function") advSaveUnlockedHero(name, "mainstory_clear"); }catch(_){}   // 新夥伴 → 直接解鎖
    }catch(_e){ console.warn("[主線] 發夥伴失敗", name, _e); }
  }
  // ★ v4.81.0 B2 — 章節夥伴「當下就發」+ 獨立冪等旗標
  //   根因:第三章 join_ch3(劍士/祭司)的解鎖大卡在第 2 場就跳出來,但英雄實際入帳掛在
  //        _msGrantChapterReward(整章播完才跑),中間還隔一場 BOSS 戰與一段收尾對白
  //        → 玩家看到大卡卻還沒真的拿到;中途離開/當機就白看一場。
  //   修法:抽成獨立函式並用自己的旗標 hero_{cid}(與章節獎勵旗標 chap_{cid} 分開,才不會互相擋),
  //        由 _msRunAct 的 join_ch3 / join_ch4 在演出「之前」先發,章節結束時再跑一次也天然冪等。
  //   回傳:本次「真正新解鎖」的名字陣列 → 供大卡區分「新解鎖」與「原本就有」(B1)。
  function _msGrantStoryHeroes(cid){
    var newly = [];
    try{
      var list = _MS_STORY_HERO_GRANTS[cid];
      if(!list || !list.length) return newly;
      var key = "hero_" + cid;
      if(_msRewardFlagGet(key)) return newly;      // 已發過 → 不重發(大卡一律走「原本就有」樣式)
      var owned = [];
      try{ if(typeof advGetUnlockedHeroes === "function") owned = advGetUnlockedHeroes() || []; }catch(_){}
      for(var i = 0; i < list.length; i++){
        if(owned.indexOf(list[i]) < 0) newly.push(list[i]);
        _msGrantStoryHero(list[i]);                // 已擁有 → +5 召喚水晶;未擁有 → 直接解鎖
      }
      _msRewardFlagSet(key);                        // 全部發完才落旗標(同 A8 口徑)
    }catch(_e){ console.warn("[主線] 章節夥伴發放失敗", cid, _e); }
    return newly;
  }
  /* ★★ v4.87.0 需求1 —— 「這隻是不是主線劇情發給玩家的夥伴」對外判定(圖鑑/稽核共用單一真相)
   *   用途:老師裁定「主線劇情解鎖後的角色,永遠不需要再讓玩家確認是不是自己的」。
   *   ★ 為什麼要綁章節旗標而不是整張名單一律豁免:
   *     劍士/祭司/守衛/刺客/火法師 也能靠一般召喚取得。若無條件豁免,沒玩過主線的帳號
   *     若被共用 iPad 污染帶入這幾隻,反而躲過既有的污染稽核 → 削弱保護。
   *     綁 hero_{cid} / chap_{cid} 旗標(存 mainStoryProgress·會上雲·換裝置也在)後,
   *     「真的走過那一章的人」才豁免,沒玩過主線的帳號行為與過去完全相同。
   *   ★ 旗標任一即可:hero_{cid} 是 v4.81.0 B2 演出當下先發的旗標,
   *     chap_{cid} 是章節通關結算旗標(玩家跳過演出時的保底發放點),兩者都代表「這章給過」。 */
  window._msStoryHeroGranted = function(name){
    try{
      if(!name) return false;
      for(var _cid in _MS_STORY_HERO_GRANTS){
        if(!Object.prototype.hasOwnProperty.call(_MS_STORY_HERO_GRANTS, _cid)) continue;
        var _list = _MS_STORY_HERO_GRANTS[_cid] || [];
        if(_list.indexOf(name) < 0) continue;
        if(_msRewardFlagGet("hero_" + _cid) || _msRewardFlagGet("chap_" + _cid)) return true;
      }
    }catch(_e){}
    return false;
  };
  // ★ v4.81.0 A2 — 章節「狀態型變更」保證套用(與演出脫鉤)
  //   根因:主角覺醒 awaken_hero 原本只掛在 scene.act,玩家按「⏭ 跳過演出」→ act 全被略過,
  //        但章節仍標完成並照常發獎 → 第六章顯示已完成、主角卻沒有覺醒(狀態不一致)。
  //   修法:抽成獨立函式,由 _msRunChapter 的 done() 無條件呼叫(跳過與否都會跑),act 內維持原呼叫
  //        (兩邊皆冪等:setter 本身重複設 true 無副作用)。日後新增狀態型變更一律加在這裡。
  function _msEnsureChapterState(cid){
    try{
      if(cid === "ch6"){                      // 第六章:主角覺醒 R→SSR(持久化上雲 avatarCard.protagAwakened)
        if(window._protagAwakened === true) return;
        if(typeof window._lxpsSetProtagAwakened === "function"){
          var _p = window._lxpsSetProtagAwakened(true);
          if(_p && typeof _p.catch === "function") _p.catch(function(){});
        } else { window._protagAwakened = true; }
      }
    }catch(_e){ console.warn("[主線] 章節狀態套用失敗", cid, _e); try{ if(cid === "ch6") window._protagAwakened = true; }catch(__){} }
  }
  function _msGrantChapterReward(cid){
    var ch = MAINSTORY_DB.chapters[cid]; if(!ch) return;
    if(!ch.reward && !_MS_STORY_HERO_GRANTS[cid]) return;
    var key = "chap_" + cid;
    if(_msRewardFlagGet(key)) return; // 冪等:已發過不再發
    // ★ v4.81.0 A8 — 舊行為是「先寫冪等旗標再發獎」(此處原為 _msRewardFlagSet(key);),
    //   發獎中途拋錯(backpackAdd 尚未就緒等)→ 旗標已寫死,該章獎勵永久漏發且無補救路徑。
    //   改為「發完才寫旗標」;同一輪內用 _msRewardGranting 記憶體鎖擋重入(防同章重複觸發)。
    try{
      window._msRewardGranting = window._msRewardGranting || {};
      if(window._msRewardGranting[key]) return;
      window._msRewardGranting[key] = 1;
    }catch(_eLk){}
    try{
      // ★ v4.81.0 老師裁定(2026-07-22)— 章節通關獎勵統一為「5 召喚水晶 + 20000 知識幣」。
      //   舊行為只發水晶(此處原為 if(ch.reward === "crystal5" || ch.reward === "crystal5_sword"){ backpackAdd("summon_crystal",5); })。
      //   冪等由 _r_chap_{cid} 旗標保證(存在 mainStoryProgress → localStorage lxps_mainstory_{uid} + 雲端同一份,綁 uid),
      //   每章一輩子只能領一次;A1 已讓這個旗標會從雲端 union 回記憶體,換裝置/共用平板都不會重複領。
      if(ch.reward){
        if(typeof backpackAdd === "function") backpackAdd("summon_crystal", 5);
        if(typeof addKnowledgeCoins === "function") addKnowledgeCoins(_MS_CHAPTER_COINS);
        // 通關獎勵提示條(讓學生明確知道拿到什麼·延後 1.4 秒避免和演出收尾重疊)
        try{
          var _rw = "🎁 " + _msT("章節通關獎勵：", "過關獎勵：") + "召喚水晶 ×5、"
                  + _msT("知識幣 ", "知識幣 ") + _MS_CHAPTER_COINS.toLocaleString();
          setTimeout(function(){
            try{ if(typeof _showInGameToast === "function") _showInGameToast(_rw, "#ffd98a", 5200); }catch(_){}
          }, 1400);
        }catch(_eT){}
      }
      // ★ v4.79.0 老師指示:第五章「深坑臭豆腐神劍」至寶正式發放(v4.78.0 以前只發水晶·至寶從未真的入帳)
      //   走既有台灣至寶解鎖路徑(_taiwanTreasureData + _saveTaiwanTreasureData + 解鎖來源帳本),
      //   已擁有 → 不覆蓋等級(冪等);演出視窗由 _msActGrantSword 呈現。
      if(ch.reward === "crystal5_sword"){ _msGrantStoryTreasure("stinky_tofu_sword"); }
      // ★ v4.67.0 章節通關直接解鎖 SR 夥伴(重複→+5水晶)
      // ★ v4.81.0 B2 — 舊行為(此處直接 for 迴圈跑 _msGrantStoryHero)改走 _msGrantStoryHeroes:
      //   夥伴已在 join_ch3 / join_ch4 演出當下就發過並落了 hero_{cid} 旗標,這裡再跑一次會早退(冪等),
      //   不會因為「已擁有」而又白送一次 +5 召喚水晶;若玩家跳過演出沒跑到 join,這裡就是保底發放點。
      _msGrantStoryHeroes(cid);
      // ★ v4.79.0 老師指示:章節通關解鎖造型部件(序章~第六章各一款·寫入 avatarCard.unlock 帳本)
      try{
        var _av = _MS_STORY_AVATAR_GRANTS[cid];
        if(_av && typeof window._avatarGrantUnlock === "function"){
          var _newAv = window._avatarGrantUnlock(_av);
          if(_newAv && _newAv.length){ _msShowAvatarUnlockToast(_av); }
        }
      }catch(_eAv){ console.warn("[主線] 造型解鎖失敗", cid, _eAv); }
      // ★★ v4.83.0 主線章節通關 → 該章劇情場景圖「每張各 5%」逐張擲(卡片背景)
      //   幂等保護:本函式整體已被 _r_chap_{cid} 旗標守門，每章一輩子只會跑一次。
      try{
        if(typeof window._avatarBgUnlockOnChapterClear === "function"){
          var _msBg = window._avatarBgUnlockOnChapterClear(cid) || [];
          if(_msBg.length){
            setTimeout(function(){
              try{ if(typeof _showInGameToast === "function") _showInGameToast("\u1f5bc\ufe0f 卡片背景解鎖：" + _msBg.join("、") + "！", "#8ad4ff", 5200); }catch(_){}
            }, 2600);
          }
        }
      }catch(_eMsBg){ console.warn("[主線] 卡片背景解鎖失敗", cid, _eMsBg); }
      _msRewardFlagSet(key);          // ★ v4.81.0 A8 — 全部發完才落旗標(中途拋錯 → 不落旗標,下次仍可補發)
      // ★ v5.6.0 甲 — 獎勵入帳即時上雲(比照 ch5 至寶發放 _msGrantStoryTreasure 既有做法):
      //   _r_chap 旗標走 players 主檔「即時」self-write,但水晶/知識幣/技能書在存檔系統要等一般
      //   autosave;共用平板在時間差內換帳號/當機 → 旗標已上雲、獎勵沒上雲,冪等守門擋補發 = 永久遺失。
      try{ if(typeof window._lxpsInstantPersist === "function") window._lxpsInstantPersist("主線章節獎勵"); }catch(_eIP){}
    }catch(_e){ console.warn("[主線] 發獎失敗", _e); }
    try{ if(window._msRewardGranting) delete window._msRewardGranting[key]; }catch(_eU){}
  }
  function _msGrantAllClearReward(){
    var key = "allclear";
    if(_msRewardFlagGet(key)) return;
    // 全六章通關才發
    var all = MAINSTORY_DB.order.every(function(cid){ return _msChapterDone(cid); });
    if(!all) return;
    // ★ v4.81.0 A8 — 同上:舊行為是此處先 _msRewardFlagSet(key) 再發卷,改為發完才落旗標
    try{
      window._msRewardGranting = window._msRewardGranting || {};
      if(window._msRewardGranting[key]) return;
      window._msRewardGranting[key] = 1;
    }catch(_eLk){}
    try{
      if(typeof backpackAdd === "function") backpackAdd("summon_ticket_ssr", 1);
      _msRewardFlagSet(key);
      // ★ v5.6.0 甲 — SSR 卷入帳即時上雲(同章節獎勵口徑,補「旗標快、背包慢」時間差)
      try{ if(typeof window._lxpsInstantPersist === "function") window._lxpsInstantPersist("主線全通關獎勵"); }catch(_eIP){}
    }catch(_e){ console.warn("[主線] 全通關發獎失敗", _e); }
    try{ if(window._msRewardGranting) delete window._msRewardGranting[key]; }catch(_eU){}
  }
  window._msGrantChapterReward = _msGrantChapterReward;
  window._msGrantAllClearReward = _msGrantAllClearReward;

  // ════════ 過場播放引擎(獨立 overlay 鏈式·打字機·可跳過·影片fallback·watchdog)════════
  var _MS_Z = 9800; // 疊在既有台灣過場(9750/9760)之上
  function _msArtCute(){ try{ return window._artStyle === "cute"; }catch(_){ return false; } }
  function _msLineText(line){
    if(!line) return "";
    return (_msArtCute() && line.cute) ? line.cute : (line.text || "");
  }
  // ★ v4.78.0 劇情專屬姓名(老師 2026-07-22):八位夥伴在主線對白中改用「職業‧名字」。
  //   ★ 只在主線顯示層生效:DB 的 who 值、HERO_DB key、英雄圖鑑/召喚/戰鬥/編組一律沿用原名不動。
  var _MS_STORY_NAME = {
    "動物學家":   "動物學家‧小真老師",
    "小劇團員":   "小劇團員‧善行",
    "弦樂團員":   "弦樂團員‧真音",
    "籃球隊員":   "籃球隊員‧力強",
    "田徑隊員":   "田徑隊員‧阿動",
    "電腦繪圖師": "電腦繪圖師‧活靈",
    "程式設計師": "程式設計師‧知理",
    "直笛團員":   "直笛團員‧誠欣",
    // ★ v4.81.0 B9 — 補齊第三、四章加入的五位夥伴(舊版只有初始八位有專屬姓名,
    //   同一段對白裡「動物學家‧小真老師」與光禿禿的「劍士」並列,風格明顯不一致)。
    "劍士":       "劍士‧勇直",
    "祭司":       "祭司‧慈光",
    "守衛":       "守衛‧守恆",
    "刺客":       "刺客‧夜影",
    "火法師":     "火法師‧烈心"
  };
  function _msStoryName(n){ try{ return _MS_STORY_NAME[n] || n || ""; }catch(_){ return n || ""; } }
  function _msWho(who){
    if(who === "__narr") return "旁白";
    if(who === "__hero"){
      // ★ v4.81.0 A7 — 舊版兩條路徑「都是死碼」,主角在整個主線永遠只顯示「你」:
      //   ❶ window._avatarNickname 全檔只有「清空」(換帳號)與「讀取」,沒有任何地方寫入;
      //   ❷ _advGetNickname 這個函式根本不存在(全檔僅此一處呼叫)。
      //   修法:接回全站唯一真相 localStorage lxps_nickname_{uid}(= _saveNickname 的儲存位置,
      //        也是造型工房「✏️ 暱稱」與冒險者名片共用的同一份),與 L15272/15334/16510 同口徑。
      //   舊碼保留於上方註解;_avatarNickname 若日後真的有人寫入仍優先採用(相容)。
      try{ if(typeof window._avatarNickname === "string" && window._avatarNickname) return window._avatarNickname; }catch(_){}
      try{
        var _uid = (window._fbUser && window._fbUser.uid) || window._gUserId || "";
        if(_uid){ var _nk = localStorage.getItem("lxps_nickname_" + _uid); if(_nk) return _nk; }
      }catch(_){}
      return "你";
    }
    return _msStoryName(who);   // ★ v4.78.0 劇情專屬姓名
  }

  // ════════ 演出動作分派器(_msRunAct·v4.67.0 批次2a:非戰鬥類 act 接既有系統)════════
  //   scene.act 在對白播完(finish)之後執行,完成回呼 onDone 續播下一 scene。
  //   已接:open_avatar(純對白鋪陳)/open_avatar_studio(開造型工房捏臉)/set_card(展示名片)/
  //         join_prologue·join_ch1(加入隊伍演出·純敘事不發卡·初始8英雄建帳號即贈)/blackout(次元裂縫淡黑)。
  //   未接(批次2b/3):battle_*/tutorial_*/join_ch2+/grant_sword_tutorial/awaken_hero → default 直接放行不卡。
  function _msT(premium, cute){ return (_msArtCute() && cute) ? cute : premium; }

  // 開造型工房捏臉 → 掛 _avatarPanelClose(統一關閉點)偵測離開 → 續播;雙保險輪詢面板消失;watchdog 防卡死
  function _msActOpenStudio(ov, onDone){
    var _done = false, _orig = window._avatarPanelClose, _poll = null;
    /* ★ v4.86.0 需求3 —— 音樂/音效在正確位置切換:
     *   進造型工房前先把「劇情場景環境音」淡出(不然河堤水聲會一直疊在工房底下,
     *   之後名片還會再切一首 BGM，三層聲音打架);離開工房後把同一支環境音接回來。 */
    var _ambBack = "";
    try{ _ambBack = _msAmbKey || ""; if(_ambBack) _msStopAmb(); }catch(_){}
    var _resume = function(){
      if(_done) return; _done = true;
      try{ window._avatarPanelClose = _orig; }catch(_){}
      if(_poll){ try{ clearInterval(_poll); }catch(_){} _poll = null; }
      try{ if(ov){ ov.style.display = ""; } }catch(_){}
      try{ if(_ambBack) _msStartAmb(_ambBack); }catch(_){}   /* ★ v4.86.0 接回場景環境音 */
      if(onDone) onDone();
    };
    try{ if(ov){ ov.style.display = "none"; } }catch(_){}   // 讓工房面板露出(工房 z 19999 本就蓋過主線 9800·此為雙保險)
    try{
      window._avatarPanelClose = function(){
        try{ if(typeof _orig === "function") _orig.apply(this, arguments); }catch(e){ console.error("[主線 studio close]", e); }
        _resume();
      };
    }catch(_){}
    try{
      if(typeof window._avatarOpenPanel === "function"){ window._avatarOpenPanel(); }
      else { _resume(); return; }
    }catch(e){ console.error("[主線 open studio]", e); _resume(); return; }
    // 面板沒開起來(gate 擋/例外)→ 即時放行不卡
    setTimeout(function(){ if(!document.getElementById("_avatar-panel")) _resume(); }, 500);
    // 雙保險輪詢:任何關閉路徑令面板消失 → 續播
    _poll = setInterval(function(){ if(!document.getElementById("_avatar-panel")) _resume(); }, 600);
    // watchdog 兜底:180 秒仍未關(異常)→ 強制放行防卡死
    setTimeout(function(){ _resume(); }, 1200000);   // ★ v4.81.0 A5 — 舊值 180000(3分)對小學生捷臉太短，時間一到劇情自己續播、新場景已蓋在工房底下；改 20 分(關閉偵測本就有雙保險，這只是兜底)
  }

  // 展示自動生成名片(唯讀·_avatarPreviewCard)→ 掛 _avatarCardClose 偵測關閉 → 續播
  function _msActSetCard(onDone){
    var _done = false, _orig = window._avatarCardClose, _poll = null;
    var _ambBack2 = "";                                     /* ★ v4.86.0 名片有專屬 BGM,先淡出場景環境音 */
    try{ _ambBack2 = _msAmbKey || ""; if(_ambBack2) _msStopAmb(); }catch(_){}
    var _resume = function(){
      if(_done) return; _done = true;
      try{ window._avatarCardClose = _orig; }catch(_){}
      if(_poll){ try{ clearInterval(_poll); }catch(_){} _poll = null; }
      try{ if(_ambBack2) _msStartAmb(_ambBack2); }catch(_){}   /* ★ v4.86.0 關名片後接回場景環境音 */
      if(onDone) onDone();
    };
    try{
      if(typeof window._avatarPreviewCard === "function"){
        window._avatarCardClose = function(){
          try{ if(typeof _orig === "function") _orig.apply(this, arguments); }catch(e){ console.error("[主線 card close]", e); }
          _resume();
        };
        window._avatarPreviewCard();
      } else { _resume(); return; }
    }catch(e){ console.error("[主線 set_card]", e); _resume(); return; }
    setTimeout(function(){ if(!document.getElementById("_avatar-card-modal")) _resume(); }, 500);
    _poll = setInterval(function(){ if(!document.getElementById("_avatar-card-modal")) _resume(); }, 600);
    setTimeout(function(){ _resume(); }, 600000);    // ★ v4.81.0 A5 — 舊值 120000(2分)；名片看久一點不應被強制續播
  }

  // ════════ ★ v4.79.0 需求1(乙案)— 主線加入夥伴「角色解鎖大卡」════════
  //   老師 2026-07-22:主線劇情加入新夥伴時,中間浮現解鎖角色的獎勵視窗,按一下切換一位。
  //   規格沿用抽卡新角色預覽(_showSummonRareHeroPreview):立繪 + 名稱 + 技能 s1/s2(含能量) + 💥極限爆發。
  //   ★ 乙案 = 主線自建同規格卡片,完全不碰抽卡程式(_showSummonRareHeroPreview 原封不動·零回歸風險);
  //     代價:日後要改卡片規格需兩處同步(此處 + 抽卡預覽)。
  //   名稱顯示走 _msStoryName(劇情專屬姓名·如「動物學家‧小真老師」),
  //   但查圖/技能/爆發一律用 HERO_IMGS / HERO_DB / BURST_DB 的「原名」(底層 key 不變)。
  //   一次一位;底部「▶ 下一位」+ 頁碼「1 ／ 4」;最後一位變「太棒了!」→ 關閉並續播劇情。
  function _msEscTx(s){
    return String(s == null ? "" : s).replace(/[<>&]/g, function(c){
      return c === "<" ? "&lt;" : (c === ">" ? "&gt;" : "&amp;");
    });
  }
  // 單一位夥伴的大卡 HTML(規格對齊抽卡新角色預覽)
  function _msJoinCardHtml(nm){
    var img = "", hdb = null, bst = null, av = "🗡️";
    try{ if(typeof HERO_IMGS !== "undefined" && HERO_IMGS[nm]) img = HERO_IMGS[nm]; }catch(_e1){}
    try{ if(typeof HERO_DB   !== "undefined" && HERO_DB[nm])   hdb = HERO_DB[nm];   }catch(_e2){}
    try{ if(typeof BURST_DB  !== "undefined" && BURST_DB[nm])  bst = BURST_DB[nm];  }catch(_e3){}
    try{ if(typeof AVATARS   !== "undefined" && AVATARS[nm])   av  = AVATARS[nm];   }catch(_e4){}
    var h = "<div style=\"display:flex;flex-direction:column;align-items:center;gap:13px;\">";
    // 立繪(載入失敗 → 退回 emoji 頭像,不留破圖)
    if(img){
      h += "<div style=\"width:min(70vw,300px);aspect-ratio:1/1;border-radius:18px;overflow:hidden;"
        + "border:3px solid rgba(255,200,100,0.85);box-shadow:0 0 30px rgba(255,200,80,0.65);"
        + "background:rgba(20,15,40,0.7);\">"
        + "<img src=\"" + img + "\" style=\"width:100%;height:100%;object-fit:cover;\" "
        + "onerror=\"this.parentNode.innerHTML=&quot;<div style=&#39;width:100%;height:100%;display:flex;"
        + "align-items:center;justify-content:center;font-size:110px;&#39;>" + av + "</div>&quot;\"/></div>";
    } else {
      h += "<div style=\"width:min(70vw,300px);aspect-ratio:1/1;display:flex;align-items:center;"
        + "justify-content:center;font-size:110px;\">" + av + "</div>";
    }
    // 名稱(劇情專屬姓名)
    h += "<div style=\"font-size:34px;font-weight:900;color:#ffe066;letter-spacing:4px;"
      + "text-shadow:0 0 14px rgba(255,200,80,0.85);text-align:center;line-height:1.28;\">"
      + _msEscTx(_msStoryName(nm)) + "</div>";
    // 技能 s1 / s2
    if(hdb){
      h += "<div style=\"display:flex;flex-direction:column;gap:6px;width:100%;max-width:520px;\">";
      var _ks = ["s1", "s2"];
      for(var _i = 0; _i < _ks.length; _i++){
        var s = hdb[_ks[_i]];
        if(!s) continue;
        h += "<div style=\"background:rgba(60,40,100,0.5);border-radius:10px;padding:10px 14px;text-align:left;\">"
          + "<div style=\"font-size:18px;font-weight:900;color:#ffcc66;\">⚔ " + _msEscTx(s.n) + " (" + (s.c || 0) + "🔷)</div>"
          + "<div style=\"font-size:15px;color:#ddd;line-height:1.5;margin-top:3px;\">" + _msEscTx(s.d || "") + "</div></div>";
      }
      h += "</div>";
    }
    // 極限爆發
    if(bst){
      h += "<div style=\"background:rgba(120,40,80,0.45);border:2px solid rgba(255,150,200,0.5);border-radius:10px;"
        + "padding:10px 14px;width:100%;max-width:520px;text-align:left;\">"
        + "<div style=\"font-size:18px;font-weight:900;color:#ff99cc;\">💥 "
        + _msT("極限爆發:", "大絕招:") + _msEscTx(bst.n) + "</div>"
        + "<div style=\"font-size:15px;color:#ddd;line-height:1.5;margin-top:3px;\">" + _msEscTx(bst.d || "") + "</div></div>";
    }
    h += "</div>";
    return h;
  }
  // 分頁式解鎖大卡(一次一位·按鈕切換·最後一位關閉續播)
  // ★ v4.81.0 B1 — 第三參數 newSet:本次「真正新解鎖」的名字集合(物件當 Set 用)。
  //   根因:序章/第一章/第二章 join 的八位(小劇團員/直笛團員/弦樂團員/動物學家/籃球隊員/
  //        田徑隊員/程式設計師/電腦繪圖師)正好就是 _ARENA_INITIAL_HEROES「建帳號就送」的初始 8 隻,
  //        但大卡一律寫「🌟 新夥伴加入隊伍!」→ 學生以為拿到新角色,跑去圖鑑找不到新的而困惑。
  //   修法:真新解鎖 → 「🌟 新夥伴解鎖!」+ 金色「NEW」標;原本就有 → 「🌟 夥伴加入隊伍!」+ 註明是同伴入隊不是新角色。
  function _msActJoinReveal(names, onDone, newSet){
    var list = (names || []).slice();
    if(!list.length){ if(onDone) onDone(); return; }
    var _nw = newSet || {};
    var _isNew = function(nm){ try{ return !!_nw[nm]; }catch(_){ return false; } };
    var idx = 0, closed = false;
    var ov = document.createElement("div");
    ov.id = "ms-join-reveal";
    // ★ v4.81.0 C3 — 關閉時順手清掉 window._msJoinRevealNext(舊版關閉後這支全域一直掛著)
    var _msJoinClearGlobal = function(){ try{ window._msJoinRevealNext = null; }catch(_){} };
    ov.style.cssText = "position:fixed;inset:0;z-index:9975;background:rgba(5,3,15,0.94);"
      + "backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;padding:16px;"
      + "opacity:0;transition:opacity 0.35s;"
      + "font-family:\"M PLUS Rounded 1c\",\"Nunito\",sans-serif;";
    var box = document.createElement("div");
    box.style.cssText = "background:linear-gradient(135deg,rgba(40,20,60,0.96),rgba(30,15,45,0.96));"
      + "border:3px solid rgba(255,200,100,0.7);border-radius:20px;padding:22px 24px;"
      + "max-width:min(96vw,660px);max-height:92vh;overflow-y:auto;text-align:center;";
    ov.appendChild(box);
    document.body.appendChild(ov);
    requestAnimationFrame(function(){ ov.style.opacity = "1"; });
    var finish = function(){
      if(closed) return;
      closed = true;
      _msJoinClearGlobal();   // ★ v4.81.0 C3
      try{ ov.style.opacity = "0"; }catch(_e){}
      setTimeout(function(){ try{ ov.remove(); }catch(_e2){} if(onDone) onDone(); }, 380);
    };
    var draw = function(){
      var isLast = (idx >= list.length - 1);
      // ★ v4.81.0 B1 — 舊行為:標題一律「新夥伴加入隊伍!」(不分是否真的新解鎖),保留於本註解。
      var _n = _isNew(list[idx]);
      var h = "<div style=\"font-size:27px;font-weight:900;color:" + (_n ? "#ffe066" : "#9fe0ff") + ";letter-spacing:4px;"
        + "text-shadow:0 0 18px " + (_n ? "rgba(255,200,80,0.95)" : "rgba(120,200,255,0.9)") + ";margin-bottom:5px;\">"
        + (_n ? ("🌟 " + _msT("新夥伴解鎖!", "解鎖新夥伴!") + " 🌟")
              : ("🤝 " + _msT("夥伴加入隊伍!", "夥伴加入隊伍!"))) + "</div>"
        + "<div style=\"font-size:15px;font-weight:700;color:" + (_n ? "#ffd28a" : "#bcd8ee") + ";letter-spacing:1px;margin-bottom:8px;\">"
        + (_n ? _msT("已加入你的英雄圖鑑，隨時可以編進隊伍出戰。", "已經收進英雄圖鑑，可以編進隊伍囉！")
              : _msT("你原本就擁有的夥伴，這一刻正式並肩同行。", "他本來就是你的夥伴，現在一起出發囉！")) + "</div>";
      if(list.length > 1){
        h += "<div style=\"font-size:16px;font-weight:800;color:#9fd6ff;letter-spacing:2px;margin-bottom:11px;\">"
          + (idx + 1) + " ／ " + list.length + "</div>";
      } else {
        h += "<div style=\"height:9px;\"></div>";
      }
      h += _msJoinCardHtml(list[idx]);
      h += "<div style=\"margin-top:16px;\"><button onclick=\"_msJoinRevealNext()\" "
        + "style=\"padding:12px 44px;font-size:22px;font-weight:800;"
        + "background:linear-gradient(135deg,rgba(180,100,40,0.85),rgba(220,140,60,0.85));"
        + "border:2.5px solid rgba(255,220,150,0.85);color:#fff;border-radius:10px;cursor:pointer;"
        + "font-family:inherit;letter-spacing:3px;box-shadow:0 0 18px rgba(255,180,80,0.6);\">"
        + (isLast ? _msT("太棒了!", "太棒了!") : ("▶ " + _msT("下一位", "下一個"))) + "</button></div>";
      box.innerHTML = h;
      try{ box.scrollTop = 0; }catch(_e){}
    };
    // onclick 屬性需全域可達 → 掛 window(逐位順序播放,不會互相覆蓋)
    window._msJoinRevealNext = function(){
      idx++;
      if(idx >= list.length){
        try{ if(typeof playSfx === "function") playSfx("sfx-confirm", 0.6); }catch(_e){}
        finish();
        return;
      }
      draw();
      try{ if(typeof playSfx === "function") playSfx("sfx-summon-reveal", 0.7); }catch(_e2){}
    };
    draw();
    try{ if(typeof playSfx === "function") playSfx("sfx-summon-reveal", 0.7); }catch(_e3){}
    // watchdog:任何意外都不讓劇情卡死(3 分鐘後自動續播)
    setTimeout(function(){ if(!closed) finish(); }, 180000);
  }

  // 「🌟加入了隊伍」純演出(不發卡):淡入→逐名浮現→淡出 →(★v4.79.0)接角色解鎖大卡→續播
  // ★ v4.81.0 B1 — 第三參數 newSet 透傳給大卡(區分真新解鎖 / 原本就有的初始夥伴)
  function _msActJoin(names, onDone, newSet){
    var _nw = newSet || {};
    var _anyNew = false; try{ for(var _kk in _nw){ if(_nw[_kk]){ _anyNew = true; break; } } }catch(_){}
    try{
      var wrap = document.createElement("div");
      wrap.id = "ms-join-fx";
      wrap.style.cssText = "position:fixed;inset:0;z-index:9860;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:radial-gradient(circle at 50% 44%,rgba(40,55,120,0.55),rgba(6,4,16,0.9));opacity:0;transition:opacity 0.4s;font-family:'M PLUS Rounded 1c','Nunito',sans-serif;";
      var head = document.createElement("div");
      head.textContent = _anyNew ? ("🌟 " + _msT("加入了冒險隊伍！", "加入隊伍囉！"))
                                 : ("🤝 " + _msT("並肩同行！", "一起出發囉！"));
      head.style.cssText = "font-size:52px;font-weight:900;color:#ffe08a;text-shadow:0 0 26px rgba(255,200,100,0.65);letter-spacing:5px;margin-bottom:8px;";
      wrap.appendChild(head);
      (names || []).forEach(function(nm, idx){
        var row = document.createElement("div");
        row.textContent = "✦ " + _msStoryName(nm);   // ★ v4.78.0 劇情專屬姓名
        row.style.cssText = "font-size:42px;font-weight:800;color:#9fe0ff;letter-spacing:3px;opacity:0;transform:translateY(16px);transition:opacity 0.4s,transform 0.4s;transition-delay:" + (0.2 + idx * 0.35) + "s;text-shadow:0 0 14px rgba(120,200,255,0.4);";
        wrap.appendChild(row);
        setTimeout(function(){ row.style.opacity = "1"; row.style.transform = "translateY(0)"; }, 50);
      });
      document.body.appendChild(wrap);
      requestAnimationFrame(function(){ wrap.style.opacity = "1"; });
      try{ if(typeof playSfx === "function") playSfx("sfx-confirm", 0.6); }catch(_){}
      var hold = 1300 + (names ? names.length : 0) * 420;
      setTimeout(function(){
        try{ wrap.style.opacity = "0"; }catch(_){}
        // ★ v4.79.0 舊行為(文字浮現完直接續播)保留於此註解:setTimeout(...{ wrap.remove(); if(onDone) onDone(); }, 450)
        setTimeout(function(){
          try{ wrap.remove(); }catch(_){}
          _msActJoinReveal(names, onDone, _nw);   // ★ v4.79.0 接角色解鎖大卡(一次一位),看完才續播·v4.81.0 帶 newSet
        }, 450);
      }, hold);
    }catch(e){
      console.error("[主線 join fx]", e);
      // 文字演出失敗也要讓玩家看到解鎖大卡;大卡再失敗才直接續播
      try{ _msActJoinReveal(names, onDone, _nw); }catch(_e2){ if(onDone) onDone(); }
    }
  }

  // 次元裂縫:淡出全黑 → 放行(下一 scene 於黑幕下建立)→ 黑幕淡出露出下一場景淡入
  function _msActBlackout(onDone){
    try{
      var b = document.createElement("div");
      b.id = "ms-blackout";
      b.style.cssText = "position:fixed;inset:0;z-index:9850;background:#000;opacity:0;transition:opacity 0.5s;pointer-events:none;";
      document.body.appendChild(b);
      requestAnimationFrame(function(){ b.style.opacity = "1"; });
      setTimeout(function(){
        if(onDone){ try{ onDone(); }catch(_){} }   // 此刻上一 overlay 移除、下一 scene overlay 於全黑下建立
        setTimeout(function(){
          try{ b.style.opacity = "0"; }catch(_){}
          setTimeout(function(){ try{ b.remove(); }catch(_){} }, 560);
        }, 550);
      }, 950);   // 全黑後停留 0.95s 再放行
    }catch(e){ console.error("[主線 blackout]", e); if(onDone) onDone(); }
  }

  // ★ v4.72.0 主線內嵌教學演出(認識魔王/升級/商店·自成一體 overlay·點「我知道了」續播·雙版鐵律1.232)
  // ════════ v4.78.0 主角吐槽條(緩衝「系統教學」的出戲感)════════
  //   老師 2026-07-22:教學卡難免會提到遊戲介面(右上暫停、左下❓教學、三格背包…),
  //   與其硬改成不出戲,不如讓主角當場吐槽一句 —— 出戲變成角色個性(打破第四面牆)。
  //   語氣沿用主線 DB 主角既有的「（心想）…」自嘲吐槽風;雙版文案(鐵律1.232)。
  function _msQuipBar(premium, cute){
    var q = _msT(premium, cute);
    var box = document.createElement("div");
    box.style.cssText = "margin-top:20px;padding:14px 18px;border-radius:16px;background:rgba(120,170,255,0.13);border-left:5px solid #7fb8ff;text-align:left;";
    var nm = document.createElement("div");
    nm.textContent = "💭 " + _msWho("__hero");
    nm.style.cssText = "font-size:19px;font-weight:800;color:#9fd6ff;letter-spacing:1px;margin-bottom:5px;";
    var tx = document.createElement("div");
    tx.textContent = q;
    tx.style.cssText = "font-size:21px;line-height:1.6;color:#dbe9ff;font-weight:600;";
    box.appendChild(nm); box.appendChild(tx);
    return box;
  }
  // 依教學步驟標題關鍵字配對吐槽(用關鍵字而非索引,TUTORIAL_STEPS 日後增刪也不會錯位)
  var _MS_TUT_QUIPS = [
    { k:"暫停",     p:"（心想）等等，異世界打到一半可以按暫停？還能存進雲端？……這個世界的物理法則，我大概是永遠搞不懂了。",
                    c:"（心想）打一半可以暫停？還能存起來？這個世界也太方便了吧！" },
    { k:"勝利目標", p:"（心想）「把敵人全部打倒就獲勝」——謝謝，這句話的資訊量，大概跟「吃飯要用嘴巴」差不多。",
                    c:"（心想）把敵人打倒就贏……這也需要人教喔？" },
    { k:"行動順序", p:"（心想）原來連誰先出手都排好了。那我剛剛站在原地發呆的那幾秒，是在排隊嗎？",
                    c:"（心想）原來出手要排隊！我剛剛發呆是在排隊喔？" },
    { k:"普通攻擊", p:"（心想）免費、每回合一次——聽起來很像便利商店的集點活動。不過免費的攻擊，我當然照用不誤。",
                    c:"（心想）免費又每回合都能用，那當然要一直用啊！" },
    { k:"能量",     p:"（心想）能量、回合、消耗……我開始有點懷疑，這個異世界其實是某個很認真的人做出來的遊戲。",
                    c:"（心想）能量、回合……這個世界該不會其實是一款遊戲吧？" },
    { k:"特技技能", p:"（心想）先選技能、再按「使用」、然後選目標——三個步驟。緊要關頭誰記得住這個啊！",
                    c:"（心想）選技能→按使用→選目標，三個步驟，緊張的時候一定會忘記啦！" },
    { k:"極限爆發", p:"（心想）每場最多兩次的大絕招……那我是不是應該先在心裡想一個很帥的招式名字？",
                    c:"（心想）大絕招每場只能放兩次！那我要先想一個超帥的名字。" },
    { k:"物品",     p:"（心想）三格。只有三格。我書包裡光是沒吃完的麵包，就不只三個了。",
                    c:"（心想）只有三格喔？我書包裡的麵包都不只三個了。" },
    { k:"自動戰鬥", p:"（心想）有 AI 可以幫我打？……那我站在這裡的意義到底是什麼。算了，能贏就好。",
                    c:"（心想）有 AI 幫我打？那我站在這裡幹嘛……算了，會贏就好！" },
    { k:"教學指引", p:"（心想）左下角？我這邊看過去只有一整片草地耶。……好吧，我就當作那裡真的有一顆按鈕。",
                    c:"（心想）左下角？我這裡只有草地啊……好啦，我就當那邊有按鈕。" },
    { k:"準備好了", p:"（心想）講了這麼一大串，敵人居然還乖乖站在那裡等我們聽完。……真是個有禮貌的世界。",
                    c:"（心想）講這麼久，敵人還站在那邊等我們！好有禮貌喔。" }
  ];
  function _msTutQuip(title){
    var t = title || "";
    for(var i = 0; i < _MS_TUT_QUIPS.length; i++){
      if(t.indexOf(_MS_TUT_QUIPS[i].k) >= 0) return _msQuipBar(_MS_TUT_QUIPS[i].p, _MS_TUT_QUIPS[i].c);
    }
    return _msQuipBar("（心想）……這個世界的說明，怎麼聽起來越來越像遊戲攻略了。",
                      "（心想）……這說明聽起來好像遊戲攻略喔？");
  }

  function _msActTutorial(kind, onDone){
    var DEFS = {
      king:    { icon:"👹", tp:"認識魔王", tc:"什麼是魔王", bp:"魔王是異世界最強大的敵人，血量超高、招式強力。打魔王時把握「答對題目→知識化成力量→集中火力」，就能扭轉戰局！", bc:"魔王是最強的大壞蛋，血超多！答對題目變成力量，大家一起打就贏得了！",
                 qp:"（心想）血量超高、招式強力——聽起來完全不像我打得贏的東西。不過既然答對題目就能變強……那我這次上課，是真的得專心了。",
                 qc:"（心想）血超多又超強……不過答對題就能變強，那我要認真上課了！" },
      levelup: { icon:"⬆️", tp:"英雄升級", tc:"讓英雄變強", bp:"戰鬥勝利會獲得經驗值，累積足夠就會升級，血量與攻擊都提升，還能分配素質點、強化技能，讓英雄越來越強。", bc:"打贏就有經驗值，經驗夠了英雄就升級，變得更厲害！",
                 qp:"（心想）打贏就會變強，變強又更容易打贏。這個循環好像哪裡怪怪的，但我一點都不想吐槽它。",
                 qc:"（心想）打贏變強，變強更好打贏……怪怪的，但我不介意！" },
      shop:    { icon:"🛒", tp:"商店補給", tc:"去商店買東西", bp:"用冒險賺到的知識幣，可以到商店購買物品卡、飼料與強化道具，讓你的隊伍準備得更充足再出發。", bc:"用知識幣在商店買好東西，讓隊伍更強！",
                 qp:"（心想）異世界也有商店，也一樣要付錢。只是這裡的錢叫「知識幣」——聽名字就知道很難存。",
                 qc:"（心想）異世界也有商店耶！不過這裡的錢叫知識幣，感覺很難存……" }
    };
    var d = DEFS[kind];
    if(!d){ if(onDone) onDone(); return; }
    try{
      var wrap = document.createElement("div");
      wrap.id = "ms-tutorial-fx";
      wrap.style.cssText = "position:fixed;inset:0;z-index:9860;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 44%,rgba(30,24,60,0.74),rgba(6,4,16,0.93));opacity:0;transition:opacity 0.4s;font-family:'M PLUS Rounded 1c','Nunito',sans-serif;";
      var title = _msArtCute() ? d.tc : d.tp, body = _msArtCute() ? d.bc : d.bp;
      var card = document.createElement("div");
      card.style.cssText = "max-width:760px;margin:0 24px;padding:34px 40px;border-radius:24px;background:linear-gradient(135deg,rgba(30,18,52,0.96),rgba(46,28,74,0.96));border:3px solid rgba(255,205,110,0.8);box-shadow:0 0 44px rgba(255,190,90,0.4);text-align:center;";
      card.innerHTML =
        "<div style=\"font-size:64px;margin-bottom:6px;\">" + d.icon + "</div>" +
        "<div style=\"font-size:40px;font-weight:900;color:#ffe08a;letter-spacing:3px;margin-bottom:16px;text-shadow:0 0 18px rgba(255,200,100,0.5);\">📖 " + title + "</div>" +
        "<div style=\"font-size:26px;line-height:1.7;color:#fff;font-weight:600;\">" + body + "</div>" +
        "<div style=\"margin-top:24px;\"><button id=\"ms-tut-ok\" style=\"padding:12px 36px;font-size:24px;font-weight:800;letter-spacing:2px;border:none;border-radius:16px;color:#fff;cursor:pointer;background:linear-gradient(135deg,#ff9a3c,#ff6ab0);touch-action:manipulation;\">" + _msT("我知道了", "我懂了！") + "</button></div>";
      wrap.appendChild(card);
      try{                                                                        // ★ v4.78.0 主角吐槽條插在按鈕之前
        var _bw = card.lastElementChild, _q = _msQuipBar(d.qp, d.qc);
        if(_bw) card.insertBefore(_q, _bw); else card.appendChild(_q);
      }catch(_){}
      document.body.appendChild(wrap);
      requestAnimationFrame(function(){ wrap.style.opacity = "1"; });
      try{ if(typeof playSfx === "function") playSfx("sfx-confirm", 0.5); }catch(_){}
      var _done = false;
      var finish = function(){ if(_done) return; _done = true; try{ wrap.style.opacity = "0"; }catch(_){} setTimeout(function(){ try{ wrap.remove(); }catch(_){} if(onDone) onDone(); }, 380); };
      var ok = document.getElementById("ms-tut-ok");
      if(ok) ok.onclick = function(){ try{ if(typeof playSfx==="function") playSfx("sfx-confirm2",0.6); }catch(_){} finish(); };
      setTimeout(finish, 300000);  // ★ v4.81.0 A4 — 舊值 30000(30秒)：教學卡一大段文字加吐槽條，學生還在讀就被自動關掉續播；已有「我知道了」鈕，這只是兜底→ 5 分
    }catch(e){ console.error("[主線 tutorial]", kind, e); if(onDone) onDone(); }
  }

  // ════════════════════════════════════════════════════════════════════
  // ★★ v4.97.0 — 主線第二章「商店實戰教學」(老師需求·第2次分次作業)
  // ────────────────────────────────────────────────────────────────────
  //   舊行為:act tutorial_shop 只彈一張靜態說明卡(_msActTutorial 的 shop)。
  //   新行為(僅首次遊玩·未完成過):程式設計師+電腦繪圖師對白鋪陳後 →「實際開啟商店」——
  //     ① 販賣課:教材「喝一半的好茶」×1(背包沒有才補發·冪等)→ 玩家親手按「賣出」;
  //     ② 購買課:買 1 顆「召喚水晶」(知識幣不足 → 獎學金預支補足;今日限購已買過 → 直接補發 1 顆略過本課);
  //     ③ 召喚課:轉場到召喚星空按「召喚 1 次」→ 保底必得「超越極限果實」×1(一生一次·跨裝置冪等);
  //     ④ 收尾卡:說明果實用途 →「繼續劇情」回到主線。
  //   ★ 圖層術:shop-overlay / summon-overlay 原生在 #adventure-overlay 內(z750·會被主線 z9800 蓋死),
  //     教學期間暫時「抬升」到 document.body(position:fixed z9830·蓋過主線場景),結束時原位原樣還原;
  //     不隱藏主線圖層 → 中途任何例外都不會露出底下關卡頁(比照 v4.91.0 全黑事故的反向教訓)。
  //   ★ 冪等旗標全存 mainStoryProgress 的 _r_shoptut2_*(走 _msRewardFlag* 既有機制:綁 uid·上雲·
  //     跨裝置 union)→ 共用 iPad 換裝置也不可能重複拿保底果實;完成過(done)→ 改走舊靜態卡複習。
  //   ★ 逃生門:教學列右側「⏭ 略過教學」隨時可跳(確認後視同完成),絕不讓學生卡死在劇情裡。
  //   ★ 回顧模式不走本流程(維持 v4.86.0 詢問 + 靜態卡);保底邏輯掛在 _rollOneSummon 的一次性旗標,
  //     消耗即清,任何正常召喚(含十連)機率完全不變。
  // ════════════════════════════════════════════════════════════════════
  var _MS_SHOPTUT = { active:false, step:"", ui:null, poll:null, doneCb:null, moved:[] };
  function _msShopTutFlag(k){ return _msRewardFlagGet("shoptut2_" + k); }
  function _msShopTutMark(k){ _msRewardFlagSet("shoptut2_" + k); }
  var _MS_SHOPTUT_TX = {
    sell:   { icon:"💱",
      p:"第一課・販賣:右邊「我的背包」裡有一杯「喝一半的好茶」,找到它、按下「賣出」,把它換成知識幣!",
      c:"第一課・賣東西:右邊背包裡有「喝一半的好茶」,按「賣出」把它換成錢!" },
    buy:    { icon:"🔮",
      p:"第二課・購買:左邊商品區最上面就是「召喚水晶」,買 1 顆回來——錢不夠?放心,先從你的獎學金裡面扣除。",
      c:"第二課・買東西:左邊最上面的「召喚水晶」買 1 顆!錢不夠沒關係,先從獎學金裡扣。" },
    summon: { icon:"🌌",
      p:"第三課・召喚星空:帶著水晶按下「召喚 1 次」!嘿嘿……我偷偷改了一點點程式,保證你第一抽就出好東西。",
      c:"第三課・召喚:按「召喚 1 次」!我偷偷動了一點手腳,第一抽一定出好東西!" },
    done:   { icon:"🍑",
      p:"這顆「超越極限果實」能讓英雄的「極限爆發」升 1 級——之後對付更強大的魔王時一定用得上,好好收著!",
      c:"「超越極限果實」能讓極限爆發升 1 級,以後打魔王超需要,要收好喔!" }
  };
  function _msShopTutLift(id){
    try{
      var el = document.getElementById(id);
      if(!el) return null;
      for(var i = 0; i < _MS_SHOPTUT.moved.length; i++){ if(_MS_SHOPTUT.moved[i].el === el) return el; }   // 已抬升過(冪等)
      var rec = { el: el, parent: el.parentNode, next: el.nextSibling, pos: el.style.position, z: el.style.zIndex };
      document.body.appendChild(el);
      el.style.position = "fixed";
      el.style.zIndex = "9830";
      _MS_SHOPTUT.moved.push(rec);
      return el;
    }catch(e){ console.warn("[商店教學] 抬升圖層失敗", id, e); return null; }
  }
  function _msShopTutRestoreLayers(){
    while(_MS_SHOPTUT.moved.length){
      var r = _MS_SHOPTUT.moved.pop();
      try{
        r.el.style.position = r.pos || "";
        r.el.style.zIndex = r.z || "";
        if(r.parent){
          if(r.next && r.next.parentNode === r.parent){ r.parent.insertBefore(r.el, r.next); }
          else { r.parent.appendChild(r.el); }
        }
      }catch(_e){}
    }
  }
  function _msShopTutToast(msg){
    try{ if(typeof _showInGameToast === "function") _showInGameToast(msg, "#ffd88a", 4200); }catch(_){}
  }
  function _msShopTutCoach(step){
    var tx = _MS_SHOPTUT_TX[step];
    if(!tx) return;
    var ui = _MS_SHOPTUT.ui;
    if(!ui){
      ui = document.createElement("div");
      ui.id = "ms-shoptut-coach";
      ui.style.cssText = "position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:9930;"
        + "width:min(94vw,880px);background:linear-gradient(135deg,rgba(20,16,46,0.96),rgba(40,26,70,0.96));"
        + "border:2.5px solid rgba(140,200,255,0.85);border-radius:18px;padding:14px 18px;"
        + "box-shadow:0 0 26px rgba(120,170,255,0.45);font-family:\"M PLUS Rounded 1c\",\"Nunito\",sans-serif;";
      ui.innerHTML = ""
        + "<div style=\"display:flex;align-items:center;gap:10px;margin-bottom:6px;\">"
        +   "<span id=\"ms-shoptut-icon\" style=\"font-size:30px;\"></span>"
        +   "<span style=\"font-size:20px;font-weight:900;color:#9fd6ff;letter-spacing:1px;\">🧑‍💻 程式設計師</span>"
        +   "<span style=\"flex:1;\"></span>"
        +   "<button id=\"ms-shoptut-skip\" style=\"padding:6px 14px;font-size:16px;font-weight:800;border-radius:10px;cursor:pointer;"
        +     "background:rgba(255,255,255,0.08);border:1.5px solid rgba(180,200,255,0.4);color:#bcd0ee;touch-action:manipulation;\">⏭ 略過教學</button>"
        + "</div>"
        + "<div id=\"ms-shoptut-text\" style=\"font-size:21px;line-height:1.6;color:#fff;font-weight:700;\"></div>"
        + "<div id=\"ms-shoptut-btnrow\" style=\"display:none;text-align:center;margin-top:12px;\">"
        +   "<button id=\"ms-shoptut-ok\" style=\"padding:12px 34px;font-size:22px;font-weight:900;letter-spacing:2px;border:none;border-radius:14px;"
        +     "color:#fff;cursor:pointer;background:linear-gradient(135deg,#ff9a3c,#ff6ab0);touch-action:manipulation;\"></button>"
        + "</div>";
      document.body.appendChild(ui);
      _MS_SHOPTUT.ui = ui;
      var sk = document.getElementById("ms-shoptut-skip");
      if(sk) sk.onclick = function(){
        var go = function(){ _msShopTutFinish(); };
        var q = _msT("要略過商店實戰教學嗎?(視同完成,之後不會再出現)", "要跳過商店教學嗎?(跳過後不會再教一次喔)");
        try{ if(typeof _customConfirm === "function"){ _customConfirm(q, go); return; } }catch(_){}
        try{ if(window.confirm(q)) go(); }catch(_e2){ go(); }
      };
    }
    try{ document.getElementById("ms-shoptut-icon").textContent = tx.icon; }catch(_){}
    try{ document.getElementById("ms-shoptut-text").textContent = _msT(tx.p, tx.c); }catch(_){}
    var row = document.getElementById("ms-shoptut-btnrow"), ok = document.getElementById("ms-shoptut-ok");
    if(row && ok){
      if(step === "done"){
        row.style.display = "block";
        ok.textContent = _msT("✅ 我學會了,繼續劇情", "✅ 學會了,繼續!");
        ok.onclick = function(){ try{ if(typeof playSfx === "function") playSfx("sfx-confirm2", 0.6); }catch(_){} _msShopTutFinish(); };
      } else { row.style.display = "none"; }
    }
  }
  function _msShopTutStep(step){
    if(step === "buy"){
      // 今日限購已買過 → 教學直接補發 1 顆略過本課;錢不足 → 獎學金預支補足(對白搞笑點·老師指定)
      var _prod = null;
      try{ if(typeof SHOP_PRODUCTS !== "undefined") _prod = SHOP_PRODUCTS.find(function(p){ return p.id === "summon_crystal"; }); }catch(_){}
      var _remain = 1;
      try{ if(_prod && _prod.dailyLimit > 0 && typeof _shopDailyBought === "function") _remain = _prod.dailyLimit - _shopDailyBought("summon_crystal"); }catch(_){}
      if(_remain <= 0){
        try{ if(typeof backpackAdd === "function") backpackAdd("summon_crystal", 1); }catch(_){}
        try{ if(typeof _logCrystalTx === "function") _logCrystalTx(1, "獲得:主線教學補發"); }catch(_){}
        try{ if(typeof gameCloudSave === "function") gameCloudSave(); }catch(_){}
        _msShopTutMark("crystal");
        _msShopTutToast(_msT("🔮 今日的召喚水晶你已經買過了!教學直接送你 1 顆。", "🔮 水晶今天買過了!直接送你 1 顆。"));
        _msShopTutStep("summon");
        return;
      }
      try{
        var _price = 1000;
        try{ if(_prod && typeof _shopGetEffectivePrice === "function") _price = _shopGetEffectivePrice(_prod) || 1000; }catch(_){}
        if((_knowledgeCoins || 0) < _price){
          var _need = _price - (_knowledgeCoins || 0);
          _knowledgeCoins = (_knowledgeCoins || 0) + _need;
          try{ if(typeof _logCoinTx === "function") _logCoinTx(_need, "收入:主線教學-獎學金預支"); }catch(_){}
          try{ if(typeof _syncCoinsDisplay === "function") _syncCoinsDisplay(); }catch(_){}
          try{ if(typeof _renderShopProducts === "function") _renderShopProducts(); }catch(_){}
          try{ if(typeof gameCloudSave === "function") gameCloudSave(); }catch(_){}
          _msShopTutToast(_msT("💰 學費不夠?程式設計師:「放心,先從你的獎學金裡面扣除。」(+" + _need + " 知識幣)", "💰 錢不夠?先從獎學金扣!(+" + _need + " 知識幣)"));
        }
      }catch(_eS){ console.warn("[商店教學] 獎學金預支例外", _eS); }
    }
    if(step === "summon"){
      if(_msShopTutFlag("fruit")){ _msShopTutStep("done"); return; }   // 中斷續走:保底果實已拿過 → 不再要求召喚(防水晶不足卡死)
      try{ if(typeof closeShopOverlay === "function") closeShopOverlay(); }catch(_){}
      _msShopTutLift("summon-overlay");
      try{ if(typeof openSummonOverlay === "function") openSummonOverlay(); }catch(_eO){ console.error("[商店教學] 開召喚星空失敗", _eO); }
      window._msShopTutForceFruit = true;                              // 一次性保底旗標(於 _rollOneSummon 消耗即清)
    }
    _MS_SHOPTUT.step = step;
    _msShopTutCoach(step);
  }
  function _msShopTutCleanup(markDone){
    _MS_SHOPTUT.active = false;
    _MS_SHOPTUT.step = "";
    try{ if(_MS_SHOPTUT.poll){ clearInterval(_MS_SHOPTUT.poll); _MS_SHOPTUT.poll = null; } }catch(_){}
    try{ window._msShopTutForceFruit = false; }catch(_){}
    try{ var so = document.getElementById("shop-overlay"); if(so && so.style.display !== "none" && typeof closeShopOverlay === "function") closeShopOverlay(); }catch(_){}
    try{ var uo = document.getElementById("summon-overlay"); if(uo && uo.style.display !== "none" && typeof closeSummonOverlay === "function") closeSummonOverlay(); }catch(_){}
    _msShopTutRestoreLayers();
    try{ if(_MS_SHOPTUT.ui) _MS_SHOPTUT.ui.remove(); }catch(_){}
    _MS_SHOPTUT.ui = null;
    if(markDone) _msShopTutMark("done");
    // 商店/召喚把 BGM 帶走了;主線底層被抬升圖層蓋住,bgmEnsureSceneBgm 偵測不到 → 手動接回主線場景 BGM
    try{ if(window._msCurBgm && window._msCurBgm !== "none" && typeof bgmFadeTo === "function") bgmFadeTo(window._msCurBgm, 700); }catch(_){}
  }
  function _msShopTutFinish(){
    _msShopTutCleanup(true);
    var cb = _MS_SHOPTUT.doneCb;
    _MS_SHOPTUT.doneCb = null;
    if(cb){ try{ cb(); }catch(e){ console.error("[商店教學] 續播例外", e); } }
  }
  // 商店/召喚系統回報教學事件(hook 掛在 shopSellItem / shopBuyItem / doSummon / _rollOneSummon;教學未啟動時為 no-op)
  window._msShopTutNotify = function(kind, id){
    try{
      if(kind === "fruit_granted"){ _msShopTutMark("fruit"); }           // 保底消耗即記(active 判斷之前:跨裝置冪等優先)
      if(!_MS_SHOPTUT.active) return;
      if(kind === "sell" && _MS_SHOPTUT.step === "sell"){
        _msShopTutMark("sold");
        _msShopTutToast(_msT("✨ 賣出成功!之後撿到的賣錢物品,都能這樣換成知識幣。", "✨ 賣掉了!撿到的東西都能這樣換錢喔。"));
        _msShopTutStep("buy");
        return;
      }
      if(kind === "buy" && _MS_SHOPTUT.step === "buy" && id === "summon_crystal"){
        _msShopTutMark("crystal");
        _msShopTutStep("summon");
        return;
      }
      if(kind === "summon" && _MS_SHOPTUT.step === "summon"){
        _msShopTutStep("done");
        return;
      }
    }catch(e){ console.warn("[商店教學] notify 例外", e); }
  };
  function _msActShopLive(onDone){
    var done = function(){ try{ if(onDone) onDone(); }catch(e){ console.error("[主線 商店教學 done]", e); } };
    if(_msShopTutFlag("done")){ _msActTutorial("shop", done); return; }  // 完成過(雲端旗標·跨裝置)→ 靜態卡複習,絕不重跑
    try{
      if(!document.getElementById("shop-overlay") || typeof openShopOverlay !== "function"
         || typeof openSummonOverlay !== "function" || typeof backpackGet !== "function"){
        _msActTutorial("shop", done); return;                            // 環境不齊 → 退回靜態卡,絕不擋劇情
      }
      _MS_SHOPTUT.active = true;
      _MS_SHOPTUT.doneCb = done;
      _MS_SHOPTUT.moved = [];
      if(!_msShopTutFlag("sold")){                                       // 教材冪等:販賣課完成後永不再補發
        try{
          if((backpackGet("half_tea") || 0) <= 0 && typeof backpackAdd === "function"){
            backpackAdd("half_tea", 1);
            _msShopTutMark("junk");
          }
        }catch(_eJ){ console.warn("[商店教學] 發教材例外", _eJ); }
      }
      _msShopTutLift("shop-overlay");
      openShopOverlay();
      if(_msShopTutFlag("crystal")){ _msShopTutStep("summon"); }         // 中斷續走:購買課已完成 → 直跳召喚課
      else if(_msShopTutFlag("sold")){ _msShopTutStep("buy"); }          // 中斷續走:販賣課已完成
      else { _msShopTutStep("sell"); }
      // 防呆巡邏:玩家在課程中按 ✕ 關掉商店/召喚 → 自動重開(逃生請走「⏭ 略過教學」)
      _MS_SHOPTUT.poll = setInterval(function(){
        try{
          if(!_MS_SHOPTUT.active){ if(_MS_SHOPTUT.poll){ clearInterval(_MS_SHOPTUT.poll); _MS_SHOPTUT.poll = null; } return; }
          var st = _MS_SHOPTUT.step;
          if(st === "sell" || st === "buy"){
            var so = document.getElementById("shop-overlay");
            if(so && so.style.display === "none"){
              try{ openShopOverlay(); }catch(_){}
              _msShopTutToast(_msT("🏪 教學進行中,先完成這一課吧!(不想上課可按「⏭ 略過教學」)", "🏪 先把這一課完成吧!(想跳過就按「⏭ 略過教學」)"));
            }
          } else if(st === "summon"){
            var uo = document.getElementById("summon-overlay");
            if(uo && uo.style.display === "none"){ try{ openSummonOverlay(); }catch(_){} }
          }
        }catch(_){}
      }, 1500);
    }catch(e){
      console.error("[商店教學] 啟動失敗 → 退回靜態卡", e);
      try{ _msShopTutCleanup(false); }catch(_){}
      _MS_SHOPTUT.doneCb = null;
      _msActTutorial("shop", done);
    }
  }

  // ════════ ★ v4.79.0 需求1 — 主線「解鎖至寶」獎勵大卡(規格對齊 join 角色解鎖大卡)════════
  //   老師 2026-07-22:主線發放至寶時,一樣要出現解鎖至寶的獎勵視窗。
  //   卡片內容:至寶圖(iconUrl·載入失敗退回 emoji)+ 名稱 + 稀有度徽章 + 素質加成 + 能力說明 + 介紹。
  //   資料一律取自既有 TAIWAN_TREASURES(不另建資料);一次一件,「太棒了!」關閉續播。
  var _MS_TRE_RARITY = { mythic:["#ff44ff","傳說之上"], legend:["#ffaa44","傳說"], epic:["#aa66ff","史詩"], rare:["#66ddff","稀有"] };
  function _msTreasureCardHtml(tid){
    var t = null;
    try{ if(typeof TAIWAN_TREASURES !== "undefined") t = TAIWAN_TREASURES[tid]; }catch(_e1){}
    if(!t) return "";
    var rc = _MS_TRE_RARITY[t.rarity] || ["#66ddff", "稀有"];
    var h = "<div style=\"display:flex;flex-direction:column;align-items:center;gap:13px;\">";
    h += "<div style=\"width:min(58vw,230px);aspect-ratio:1/1;border-radius:18px;overflow:hidden;"
      + "border:3px solid " + rc[0] + ";box-shadow:0 0 30px " + rc[0] + "88;background:rgba(20,15,40,0.7);"
      + "display:flex;align-items:center;justify-content:center;\">";
    if(t.iconUrl){
      h += "<img src=\"" + t.iconUrl + "\" style=\"width:100%;height:100%;object-fit:contain;\" "
        + "onerror=\"this.parentNode.innerHTML=&quot;<span style=&#39;font-size:110px;&#39;>" + (t.icon || "💎") + "</span>&quot;\"/>";
    } else {
      h += "<span style=\"font-size:110px;\">" + (t.icon || "💎") + "</span>";
    }
    h += "</div>";
    h += "<div style=\"font-size:34px;font-weight:900;color:#ffe066;letter-spacing:3px;"
      + "text-shadow:0 0 14px rgba(255,200,80,0.85);text-align:center;line-height:1.28;\">" + _msEscTx(t.name) + "</div>";
    h += "<div style=\"display:inline-block;padding:5px 16px;border-radius:999px;font-size:16px;font-weight:900;"
      + "background:" + rc[0] + "33;border:2px solid " + rc[0] + ";color:" + rc[0] + ";letter-spacing:2px;\">✦ " + rc[1] + " ✦</div>";
    var bs = t.baseStats || {};
    var parts = [];
    if(bs.hp) parts.push("❤️ HP +" + bs.hp);
    if(bs.atk) parts.push("⚔ 攻擊 +" + bs.atk);
    if(bs.sp) parts.push("✨ 特技 +" + bs.sp);
    if(bs.spd) parts.push("💨 速度 +" + bs.spd);
    if(parts.length){
      h += "<div style=\"display:flex;flex-wrap:wrap;gap:8px;justify-content:center;\">";
      for(var i = 0; i < parts.length; i++){
        h += "<span style=\"padding:6px 13px;border-radius:9px;background:rgba(60,40,100,0.55);"
          + "font-size:16px;font-weight:800;color:#ffd97a;\">" + _msEscTx(parts[i]) + "</span>";
      }
      h += "</div>";
    }
    if(t.abilityText){
      h += "<div style=\"background:rgba(120,40,80,0.4);border:2px solid rgba(255,150,200,0.5);border-radius:10px;"
        + "padding:10px 14px;width:100%;max-width:520px;text-align:left;\">"
        + "<div style=\"font-size:17px;font-weight:900;color:#ff99cc;\">💠 " + _msT("至寶能力", "厲害的地方") + "</div>"
        + "<div style=\"font-size:15.5px;color:#ddd;line-height:1.55;margin-top:3px;\">" + _msEscTx(t.abilityText) + "</div></div>";
    }
    if(t.desc){
      h += "<div style=\"font-size:15px;color:#c8d4ea;line-height:1.6;max-width:520px;text-align:left;"
        + "background:rgba(30,25,55,0.5);border-radius:10px;padding:10px 14px;\">" + _msEscTx(t.desc) + "</div>";
    }
    h += "</div>";
    return h;
  }
  // 解鎖至寶獎勵視窗(沿用 join 大卡的 overlay 樣式;支援多件·按鈕切換)
  function _msActTreasureReveal(tids, onDone){
    var list = (tids || []).slice();
    if(!list.length){ if(onDone) onDone(); return; }
    var idx = 0, closed = false;
    var ov = document.createElement("div");
    ov.id = "ms-treasure-reveal";
    ov.style.cssText = "position:fixed;inset:0;z-index:9975;background:rgba(5,3,15,0.94);"
      + "backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;padding:16px;"
      + "opacity:0;transition:opacity 0.35s;font-family:\"M PLUS Rounded 1c\",\"Nunito\",sans-serif;";
    var box = document.createElement("div");
    box.style.cssText = "background:linear-gradient(135deg,rgba(50,35,20,0.96),rgba(30,18,42,0.96));"
      + "border:3px solid rgba(255,200,100,0.75);border-radius:20px;padding:22px 24px;"
      + "max-width:min(96vw,660px);max-height:92vh;overflow-y:auto;text-align:center;";
    ov.appendChild(box);
    document.body.appendChild(ov);
    requestAnimationFrame(function(){ ov.style.opacity = "1"; });
    var finish = function(){
      if(closed) return;
      closed = true;
      try{ ov.style.opacity = "0"; }catch(_e){}
      setTimeout(function(){ try{ ov.remove(); }catch(_e2){} if(onDone) onDone(); }, 380);
    };
    var draw = function(){
      var isLast = (idx >= list.length - 1);
      var h = "<div style=\"font-size:27px;font-weight:900;color:#ffe066;letter-spacing:4px;"
        + "text-shadow:0 0 18px rgba(255,200,80,0.95);margin-bottom:5px;\">⚔️ "
        + _msT("解鎖至寶！", "拿到至寶了！") + " ⚔️</div>";
      if(list.length > 1){
        h += "<div style=\"font-size:16px;font-weight:800;color:#9fd6ff;letter-spacing:2px;margin-bottom:11px;\">"
          + (idx + 1) + " ／ " + list.length + "</div>";
      } else {
        h += "<div style=\"height:9px;\"></div>";
      }
      h += _msTreasureCardHtml(list[idx]);
      h += "<div style=\"margin-top:16px;\"><button onclick=\"_msTreasureRevealNext()\" "
        + "style=\"padding:12px 44px;font-size:22px;font-weight:800;"
        + "background:linear-gradient(135deg,rgba(180,100,40,0.85),rgba(220,140,60,0.85));"
        + "border:2.5px solid rgba(255,220,150,0.85);color:#fff;border-radius:10px;cursor:pointer;"
        + "font-family:inherit;letter-spacing:3px;box-shadow:0 0 18px rgba(255,180,80,0.6);\">"
        + (isLast ? _msT("太棒了!", "太棒了!") : ("▶ " + _msT("下一件", "下一個"))) + "</button></div>";
      box.innerHTML = h;
      try{ box.scrollTop = 0; }catch(_e){}
    };
    window._msTreasureRevealNext = function(){
      idx++;
      if(idx >= list.length){
        try{ if(typeof playSfx === "function") playSfx("sfx-confirm", 0.6); }catch(_e){}
        finish();
        return;
      }
      draw();
      try{ _msPlaySfx("treasure", 0.8); }catch(_e2){}
    };
    draw();
    try{ _msPlaySfx("treasure", 0.8); }catch(_e3){}
    setTimeout(function(){ if(!closed) finish(); }, 180000);   // watchdog 防卡死
  }

  // ★ v4.72.0 發劍演出(第五章·神劍至寶現世)
  // ★ v4.79.0 老師指示:此處改為「真的發至寶 + 出現解鎖至寶獎勵大卡」
  //   流程:金光開場演出(維持原樣·可點跳過)→ 實際入帳 _msGrantStoryTreasure → 解鎖至寶大卡 → 續播
  function _msActGrantSword(onDone){
    var _after = function(){
      var _tid = "stinky_tofu_sword";
      try{ _msGrantStoryTreasure(_tid); }catch(_eG){}          // 冪等:已擁有不覆蓋
      try{ _msActTreasureReveal([_tid], onDone); }catch(_eR){ if(onDone) onDone(); }
    };
    try{
      var wrap = document.createElement("div");
      wrap.id = "ms-sword-fx";
      wrap.style.cssText = "position:fixed;inset:0;z-index:9860;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:radial-gradient(circle at 50% 42%,rgba(60,50,20,0.62),rgba(6,4,16,0.93));opacity:0;transition:opacity 0.4s;cursor:pointer;font-family:'M PLUS Rounded 1c','Nunito',sans-serif;";
      var head = document.createElement("div");
      head.textContent = "⚔️ " + _msT("神劍至寶現世！", "得到神劍！");
      head.style.cssText = "font-size:52px;font-weight:900;color:#ffe08a;text-shadow:0 0 28px rgba(255,210,90,0.7);letter-spacing:4px;";
      var sword = document.createElement("div");
      sword.textContent = "🗡️";
      sword.style.cssText = "font-size:120px;filter:drop-shadow(0 0 30px rgba(255,220,120,0.9));opacity:0;transform:scale(0.6) rotate(-12deg);transition:opacity 0.6s,transform 0.6s;";
      var body = document.createElement("div");
      body.innerHTML = _msArtCute()
        ? "打敗發酵魔王，得到超臭又超強的神劍！之後打仗更有力囉！"
        : "擊退發酵魔王後，深坑的傳說神劍認可了你——它散發著發酵的異香，卻蘊含著斬破黑暗的力量。";
      body.style.cssText = "max-width:720px;padding:0 24px;text-align:center;font-size:26px;line-height:1.7;color:#fff;font-weight:600;";
      wrap.appendChild(head); wrap.appendChild(sword); wrap.appendChild(body);
      document.body.appendChild(wrap);
      requestAnimationFrame(function(){ wrap.style.opacity = "1"; setTimeout(function(){ sword.style.opacity = "1"; sword.style.transform = "scale(1) rotate(0deg)"; }, 200); });
      try{ _msPlaySfx("treasure", 0.8); }catch(_){}   // 主線至寶音(treasure.m4a·缺檔靜默)
      var _done = false;
      /* ★ v4.79.0 舊行為(演出完直接續播)保留:… if(onDone) onDone(); }, 420) */
      var finish = function(){ if(_done) return; _done = true; try{ wrap.style.opacity = "0"; }catch(_){} setTimeout(function(){ try{ wrap.remove(); }catch(_){} _after(); }, 420); };
      wrap.onclick = finish;
      setTimeout(finish, 5200);
    }catch(e){ console.error("[主線 grant_sword]", e); try{ _after(); }catch(_e2){ if(onDone) onDone(); } }
  }

  // ════════ v4.78.0 任務4・教學引導戰鬥(甲案·老師 2026-07-22 選定)════════
  //   六個 battle_* act 全部接線,不再 fall-through 到 default(原本完全沒有戰鬥演出)。
  //   作法:復用既有戰鬥教學系統的 TUTORIAL_STEPS 文案(11 步·premium=desc / cute=descSimple),
  //        以主線專屬 overlay 逐步呈現 → 再播「模擬戰鬥」條 → 勝利卡 → 續播劇情。
  //   ★ 純演出:不動 G 戰場物件、不動存檔、不呼叫 startTurn/_closeTutorial,
  //     故不會與真實戰鬥教學(_tutorialDone/_tutorialMiniDone)互相干擾,零副作用。
  //   ★ 真實可操作戰鬥仍列 Phase 2(待主角戰鬥英雄),本版先讓劇情完整走得通。
  var _MS_BATTLE_DEFS = {
    /* ★ v4.91.0(老師裁定 D甲)— 首場文案原本寫「動物學家陪你打第一場」,但 _MS_BATTLE_TEAMS 的
     *   battle_ch1_1 隊伍是 主角/小劇團員/直笛團員/弦樂團員,★動物學家根本不在隊上★(牠在 ch1_2),
     *   說明與實際出戰名單對不上 → 改成真正的三位隊友。舊文案保留備查(誤刪是大忌):
     *   lp:"動物學家陪你打第一場——邊打邊學，把戰鬥的基本操作一次弄懂！" / lc:"跟著動物學家打第一場，學會怎麼戰鬥！" */
    battle_ch1_1:   { icon:"🐾", np:"野生小怪 · 初陣",          nc:"野生小怪",       tut:true,
                      lp:"小劇團員、直笛團員、弦樂團員陪你打第一場——邊打邊學，把戰鬥的基本操作一次弄懂！",
                      lc:"三位新朋友陪你打第一場，學會怎麼戰鬥！" },
    /* ★ v4.91.0(老師裁定 F甲·口徑由老師指正)— 舊文案寫「先把牠打到虛弱，再出手馴養」是錯的:
     *   實際流程=戰鬥中「動物會加入物品卡」→ 用物品卡把牠帶在英雄身上 → 才能用飼料馴養。
     *   舊文案保留備查:lp:"先把牠打到虛弱，再出手馴養——牠就會成為與你並肩冒險的夥伴。"
     *                 lc:"先打到牠沒力，再馴養牠，就變成你的夥伴啦！"
     * ★ v4.92.0 — 這一場改為「手指一步一步帶」(攜帶→馴養→餵飼料→寵物極限爆發),文案同步改成
     *   「跟著手指做」,不再要玩家自己記步驟。 */
    battle_ch1_2:   { icon:"🐰", np:"草叢裡的野生小夥伴",        nc:"野生小夥伴",     tut:false,
                      lp:"戰鬥中會有小動物跑進你的物品格！接下來會有 👆 手指一步一步帶你：先把牠帶在夥伴身上，再出手馴養、餵牠飼料——牠就會成為與你並肩冒險的夥伴。",
                      lc:"打一打會有小動物跑進物品格！等一下有 👆 手指會教你：先把牠帶上，再馴養餵牠吃東西，牠就變成你的夥伴啦！" },
    battle_ch3_boss:{ icon:"🌫️", np:"封住靈氣的褪色邪術",        nc:"茶園的壞邪術",   tut:false,
                      lp:"劍士在前排開路、祭司在後方療傷——破除邪陣，把貓空的色彩討回來。",
                      lc:"劍士在前面砍、祭司幫你補血，一起打壞邪術！" },
    /* ★ v4.99.0 —— 陣容補上杏花妖本尊,詢問卡名稱/說明同步(舊文案保留備查·誤刪是大忌):
     *   np:"被魅惑的守衛 · 刺客" / nc:"被控制的守衛和刺客"
     *   lp:"他們並非真心與你為敵——把他們打醒，就能解開杏花妖的魅惑。烈火正剋妖花，就讓火法師打頭陣吧。"
     *   lc:"他們是被控制的！把他們打醒就好囉。火剋妖花，讓火法師打頭陣！" */
    battle_ch4_boss:{ icon:"🌸", np:"杏花妖 · 被魅惑的守衛與刺客",  nc:"杏花妖和被控制的夥伴", tut:false,
                      lp:"杏花妖親自坐鎮花林，兩位夥伴並非真心與你為敵——打倒杏花妖、把他們打醒，魅惑自會解開。烈火正剋妖花，就讓火法師打頭陣吧。",
                      lc:"杏花妖自己出來擋路了！打倒她、把夥伴打醒就好囉。火剋妖花，讓火法師打頭陣！" },
    battle_ch5_boss:{ icon:"🤢", np:"臭氣魔王 · 發酵公",          nc:"臭臭的發酵魔王", tut:false,
                      lp:"憋住氣、速戰速決——奪回深坑代代相傳的發酵秘方！",
                      lc:"閉氣快點打！把深坑的發酵秘方搶回來！" },
    battle_ch6_boss:{ icon:"🌑", np:"吞噬色彩的黑暗球",          nc:"黑暗球",         tut:false,
                      lp:"覺醒後的你站上了最前線——這一擊，是為了把整座城鎮的色彩帶回來。",
                      lc:"覺醒的你站到最前面——這一下，要把顏色通通帶回來！" }
  };
  // 第一幕:戰鬥開場(敵人現身)
  function _msBattleIntro(host, d, next){
    try{
      var box = document.createElement("div");
      box.style.cssText = "text-align:center;opacity:0;transform:scale(0.86);transition:opacity 0.45s,transform 0.45s;";
      var t1 = document.createElement("div");
      t1.textContent = "⚔️ " + _msT("戰鬥開始！", "開打囉！");
      t1.style.cssText = "font-size:46px;font-weight:900;color:#ffd76a;letter-spacing:4px;text-shadow:0 0 26px rgba(255,200,90,0.65);margin-bottom:10px;";
      var ic = document.createElement("div");
      ic.textContent = d.icon;
      ic.style.cssText = "font-size:104px;filter:drop-shadow(0 0 26px rgba(255,120,120,0.7));margin:6px 0;";
      var nm = document.createElement("div");
      nm.textContent = _msT(d.np, d.nc);
      nm.style.cssText = "font-size:34px;font-weight:900;color:#ff9a9a;letter-spacing:2px;margin-bottom:14px;";
      var ld = document.createElement("div");
      ld.textContent = _msT(d.lp, d.lc);
      ld.style.cssText = "max-width:680px;margin:0 auto;padding:0 24px;font-size:24px;line-height:1.7;color:#fff;font-weight:600;";
      box.appendChild(t1); box.appendChild(ic); box.appendChild(nm); box.appendChild(ld);
      host.appendChild(box);
      requestAnimationFrame(function(){ box.style.opacity = "1"; box.style.transform = "scale(1)"; });
      try{ if(typeof playSfx === "function") playSfx("sfx-battle-enter", 0.6); }catch(_){}
      setTimeout(function(){
        try{ box.style.opacity = "0"; box.style.transform = "scale(0.94)"; }catch(_){}
        setTimeout(function(){ try{ box.remove(); }catch(_){} next(); }, 380);
      }, 2400);
    }catch(e){ console.error("[主線 battle intro]", e); next(); }
  }
  // 第二幕:教學引導(逐步卡片·復用 TUTORIAL_STEPS 文案)
  function _msBattleTutorial(host, next){
    var STEPS = null;
    try{ if(typeof TUTORIAL_STEPS !== "undefined" && TUTORIAL_STEPS && TUTORIAL_STEPS.length) STEPS = TUTORIAL_STEPS; }catch(_){}
    if(!STEPS){ next(); return; }
    // ★ v4.81.0 B5 — 舊行為:主線第一場一律播完整 11 步 TUTORIAL_STEPS,之後玩家第一次真的進戰鬥
    //   又會被同一套 11 步教一次(重複、拖節奏)。修法:若玩家「已經看過真實戰鬥教學」
    //   (_tutorialDone 鬥技場版 / _tutorialMiniDone 小怪版任一為真),主線只播核心 4 步當複習。
    //   ★ 純顯示層:不寫、不改這兩個旗標(主線是純演出,不能污染真實教學的完成狀態)。
    try{
      var _seen = false;
      try{ _seen = (typeof _tutorialDone !== "undefined" && _tutorialDone) ||
                   (typeof _tutorialMiniDone !== "undefined" && _tutorialMiniDone); }catch(_){}
      if(_seen){
        var _core = ["普通攻擊", "能量", "特技技能", "極限爆發"];
        var _f = STEPS.filter(function(st){
          var t = (st && st.title) ? st.title : "";
          for(var i = 0; i < _core.length; i++){ if(t.indexOf(_core[i]) >= 0) return true; }
          return false;
        });
        if(_f.length) STEPS = _f;
      }
    }catch(_){}
    var idx = 0, ended = false;
    var card = document.createElement("div");
    card.style.cssText = "max-width:780px;margin:0 24px;padding:30px 36px 26px;border-radius:24px;background:linear-gradient(135deg,rgba(28,18,52,0.97),rgba(48,28,78,0.97));border:3px solid rgba(255,205,110,0.85);box-shadow:0 0 44px rgba(255,190,90,0.42);text-align:center;";
    host.appendChild(card);
    var leave = function(){
      if(ended) return; ended = true;
      try{ card.style.transition = "opacity 0.3s"; card.style.opacity = "0"; }catch(_){}
      setTimeout(function(){ try{ card.remove(); }catch(_){} next(); }, 320);
    };
    var draw = function(){
      var st = STEPS[idx]; if(!st){ leave(); return; }
      var body = (_msArtCute() && st.descSimple) ? st.descSimple : (st.desc || "");
      var last = (idx >= STEPS.length - 1);
      card.innerHTML = "";
      var tag = document.createElement("div");
      tag.textContent = "📖 " + _msT("戰鬥教學", "戰鬥怎麼打") + "　" + (idx + 1) + " / " + STEPS.length;
      tag.style.cssText = "font-size:20px;font-weight:800;color:#9fd6ff;letter-spacing:2px;margin-bottom:12px;";
      var ttl = document.createElement("div");
      ttl.textContent = st.title || "";
      ttl.style.cssText = "font-size:36px;font-weight:900;color:#ffe08a;letter-spacing:2px;margin-bottom:14px;text-shadow:0 0 18px rgba(255,200,100,0.5);";
      var txt = document.createElement("div");
      txt.textContent = body;
      txt.style.cssText = "font-size:25px;line-height:1.75;color:#fff;font-weight:600;min-height:96px;";
      var bar = document.createElement("div");
      bar.style.cssText = "margin-top:22px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;";
      var mkBtn = function(label, bg, fn){
        var b = document.createElement("button");
        b.textContent = label;
        b.style.cssText = "padding:11px 28px;font-size:22px;font-weight:800;letter-spacing:2px;border:none;border-radius:15px;color:#fff;cursor:pointer;touch-action:manipulation;background:" + bg + ";";
        b.onclick = function(){ try{ if(typeof playSfx === "function") playSfx("sfx-confirm2", 0.5); }catch(_){} fn(); };
        return b;
      };
      if(idx > 0) bar.appendChild(mkBtn("◀ " + _msT("上一步", "回上頁"), "linear-gradient(135deg,#5a6a8a,#7a88a8)", function(){ idx--; draw(); }));
      bar.appendChild(mkBtn(last ? (_msT("開始戰鬥", "開打！") + " ⚔️") : (_msT("下一步", "下一頁") + " ▶"), "linear-gradient(135deg,#ff9a3c,#ff6ab0)", function(){
        if(last){ leave(); } else { idx++; draw(); }
      }));
      bar.appendChild(mkBtn(_msT("跳過教學", "不用教了"), "linear-gradient(135deg,#4a4560,#635c7e)", leave));
      card.appendChild(tag); card.appendChild(ttl); card.appendChild(txt);
      try{ card.appendChild(_msTutQuip(st.title || "")); }catch(_){}   // ★ v4.78.0 主角吐槽(化解系統教學的出戲感)
      card.appendChild(bar);
    };
    draw();
  }
  // 第三幕:模擬戰鬥(敵人血條遞減)→ 勝利卡
  function _msBattleSim(host, d, next){
    try{
      var box = document.createElement("div");
      box.style.cssText = "text-align:center;width:100%;max-width:640px;padding:0 24px;";
      var ic = document.createElement("div");
      ic.textContent = d.icon;
      ic.style.cssText = "font-size:96px;filter:drop-shadow(0 0 22px rgba(255,120,120,0.6));transition:transform 0.16s,filter 0.16s;";
      var nm = document.createElement("div");
      nm.textContent = _msT(d.np, d.nc);
      nm.style.cssText = "font-size:28px;font-weight:900;color:#ff9a9a;letter-spacing:2px;margin:6px 0 10px;";
      var hpOut = document.createElement("div");
      hpOut.style.cssText = "height:26px;border-radius:13px;background:rgba(255,255,255,0.16);border:2px solid rgba(255,255,255,0.35);overflow:hidden;";
      var hpIn = document.createElement("div");
      hpIn.style.cssText = "height:100%;width:100%;border-radius:11px;background:linear-gradient(90deg,#ff5a5a,#ffb04a);transition:width 0.42s;";
      hpOut.appendChild(hpIn);
      var tip = document.createElement("div");
      tip.textContent = _msT("全隊集中火力攻擊中……", "大家一起攻擊中……");
      tip.style.cssText = "margin-top:14px;font-size:23px;color:#fff;font-weight:700;letter-spacing:1px;";
      box.appendChild(ic); box.appendChild(nm); box.appendChild(hpOut); box.appendChild(tip);
      host.appendChild(box);
      var seq = [72, 48, 25, 0], i = 0;
      var hit = function(){
        if(i >= seq.length){
          tip.textContent = "";
          setTimeout(function(){ try{ box.remove(); }catch(_){} _msBattleWin(host, d, next); }, 520);
          return;
        }
        try{ hpIn.style.width = seq[i] + "%"; }catch(_){}
        try{ ic.style.transform = "scale(1.1) rotate(-5deg)"; ic.style.filter = "drop-shadow(0 0 30px rgba(255,255,255,0.95))"; }catch(_){}
        setTimeout(function(){ try{ ic.style.transform = "scale(1)"; ic.style.filter = "drop-shadow(0 0 22px rgba(255,120,120,0.6))"; }catch(_){} }, 150);
        try{ if(typeof playSfx === "function") playSfx(i === seq.length - 1 ? "sfx-crit" : "sfx-normalatk", 0.55); }catch(_){}
        i++;
        setTimeout(hit, 640);
      };
      setTimeout(hit, 420);
    }catch(e){ console.error("[主線 battle sim]", e); next(); }
  }
  // 第四幕:勝利卡(點畫面或 2.6 秒後續播)
  function _msBattleWin(host, d, next){
    try{
      var box = document.createElement("div");
      box.style.cssText = "text-align:center;opacity:0;transform:scale(0.85);transition:opacity 0.4s,transform 0.4s;cursor:pointer;";
      var t1 = document.createElement("div");
      t1.textContent = "🎉 " + _msT("戰鬥勝利！", "打贏啦！");
      t1.style.cssText = "font-size:54px;font-weight:900;color:#ffe08a;letter-spacing:5px;text-shadow:0 0 30px rgba(255,210,90,0.75);";
      var t2 = document.createElement("div");
      t2.textContent = _msT("知識化為力量，你們擊退了眼前的敵人。", "知識變成力量，把敵人打退了！");
      t2.style.cssText = "margin-top:16px;font-size:25px;line-height:1.7;color:#fff;font-weight:600;padding:0 24px;";
      box.appendChild(t1); box.appendChild(t2);
      host.appendChild(box);
      requestAnimationFrame(function(){ box.style.opacity = "1"; box.style.transform = "scale(1)"; });
      try{ if(typeof playSfx === "function") playSfx("sfx-applause", 0.6); }catch(_){}
      var go = function(){ try{ box.onclick = null; }catch(_){} next(); };
      box.onclick = go;
      setTimeout(go, 2600);
    }catch(e){ console.error("[主線 battle win]", e); next(); }
  }
  /* ★ v4.89.0 — 「純演出版」戰鬥四幕(簡化版)保留。
   *   ★ 第二版(老師 2026-07-24 指示)後,本函式只剩兩個用途:
   *     ① 玩家在回顧模式的詢問視窗選擇「▶ 只看演出，不打」
   *     ② 戰鬥引擎缺失/前置演出例外時的兜底(絕不擋劇情)
   *   回顧模式已不再預設走這裡 —— 預設是進正式戰鬥畫面(見下方 _msActBattle)。 */
  function _msActBattleShow(key, onDone){
    var d = _MS_BATTLE_DEFS[key];
    if(!d){ if(onDone) onDone(); return; }
    var _done = false, _wd = null, wrap = null;
    var finish = function(){
      if(_done) return; _done = true;
      try{ if(_wd) clearTimeout(_wd); }catch(_){}
      try{ if(wrap) wrap.style.opacity = "0"; }catch(_){}
      setTimeout(function(){ try{ if(wrap) wrap.remove(); }catch(_){} if(onDone) onDone(); }, 400);
    };
    try{
      wrap = document.createElement("div");
      wrap.id = "ms-battle-fx";
      wrap.style.cssText = "position:fixed;inset:0;z-index:9860;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 44%,rgba(48,18,26,0.78),rgba(6,4,16,0.95));opacity:0;transition:opacity 0.4s;";
      document.body.appendChild(wrap);
      requestAnimationFrame(function(){ wrap.style.opacity = "1"; });
      _wd = setTimeout(finish, 900000);   // 15 分鐘兜底(教學由學生自己按·不設短 watchdog 以免中途被踢掉)
      _msBattleIntro(wrap, d, function(){
        if(d.tut){ _msBattleTutorial(wrap, function(){ _msBattleSim(wrap, d, finish); }); }
        else { _msBattleSim(wrap, d, finish); }
      });
    }catch(e){ console.error("[主線 battle]", key, e); finish(); }
  }


  // ════════════════════════════════════════════════════════════════════
  // ★★ v4.89.0 — 主線 Phase 2:戰鬥實戰化(真實可操作戰鬥)
  // ────────────────────────────────────────────────────────────────────
  // 老師裁定(2026-07-23 四項 + 2026-07-24 三項補裁):
  //   Q1 丙=鎖定劇情固定隊伍  Q2 ch3=九尾空貓怪  Q3 乙=發EXP不掉寶+技能升級書x1+強化教學指路
  //   Q4 甲=戰敗只重打該場    Q5 乙=自建唯讀編組卡(首場含編組示範教學·不碰共用選角頁=零回歸)
  //   Q6 甲=元素寫死於資料表(首場屬性相剋教學+技能替換簡介·本次不替換)  Q7 乙=不接關
  // ★ 帳號零汙染總則(老師 2026-07-24 明令):
  //   ① _saveBattleRoundSnapshot 對主線戰鬥早退(絕不寫續戰快照·不會污染冒險續戰)
  //   ② 三個結算入口(_showResultWithDrama / advFinishMiniBattle / advShowBattleResult)
  //     照 worldboss 前例(鐵律 1.112/1.135)加 mainstory 守門 → 全部改派 _msBattleResult,
  //     絕不進冒險結算/發獎/推場景/寫快照流程
  //   ③ advCheckContinue 對主線 return false(Q7 乙:不接關)
  //   ④ 獎勵(EXP+技能升級書)綁 _r_bt_{key} 冪等旗標,重打通關不重發
  //   ⑤ 好友英雄注入停用(照 worldboss 做法只清 _friendHeroInParty·不動 _invitedFriendHero)
  //   ⑥ 天賦/至寶/投資/跟隨寵物「唯讀套用」到戰鬥物件(主線=用練過的角色打·不寫回任何帳號資料)
  // ════════════════════════════════════════════════════════════════════
  /* ★★ v4.91.0 —— 新增 bgm / bg 兩欄(老師 2026-07-24 裁定 ❸甲=用該章主線場景圖當戰場背景)
   *   【bgm】根治老師回報「第一場教學戰鬥的音樂是空貓怪 BOSS 的、是錯的」:
   *     根因 advStartBattle 的 BGM 分支只認 japan/worldboss/egypt/taiwan,主線 stage="mainstory"
   *     一路掉到最後 else,而 _currentBossVariantInfo 又被主線清成 null
   *     → _bossBgmId 固定拿到 'bgm-boss-01'(=九尾空貓怪 BOSS 曲)→ ★六場全部播同一首錯的★
   *       (ch3 敵人剛好就是九尾空貓怪,所以只有那場聽起來是對的)。
   *     修法=本表寫死每場專屬 BGM,advStartBattle 加 mainstory 分支讀取。全部沿用既有音檔·零上傳。
   *   【bg】同一病灶:背景 class 也沒有 mainstory 分支 → 六場全套 bg-boss(貓空茶園 BOSS 背景),
   *     第一場「河堤小怪戰」的背景本來就不該是那張(只是先前被 backdrop 蓋住所以看不出來)。
   *     修法=直接取 MAINSTORY_DB 該場戰鬥所在場景的圖(景美溪河堤 / 貓空BOSS戰 / 魅惑守衛刺客 /
   *     臭豆腐BOSS / 黑暗球降臨),劇情與戰場完全連貫。走 _msAsset() 同一組 URL(帶 ?v= 破快取)。 */
  var _MS_BATTLE_TEAMS = {
    battle_ch1_1:   { heroes:["主角","小劇團員","直笛團員","弦樂團員"],     elems:["light","wind","water","grass"], exp:60,  teach:true,
                      bgm:"bgm-battle-01", bg:"景美溪河堤(精美版).png", tutInter:true },
    battle_ch1_2:   { heroes:["主角","動物學家","籃球隊員","田徑隊員"],     elems:["light","grass","fire","wind"],  exp:60,
                      bgm:"bgm-battle-02", bg:"景美溪河堤(精美版).png", petCard:"五色鳥", petTut:true },
    /* ★ v4.98.0 —— 第三章隊伍改編(老師指定):主角/劍士/祭司/電腦繪圖師。
     *   劍士/祭司在本章 join_ch3(第2場)加入後緊接第3場 BOSS 戰,隊伍與劇情演出一致;
     *   戰鬥詢問卡 lp「劍士在前排開路、祭司在後方療傷」自此與實際編組吻合(舊隊伍=程式設計師/繪圖師/小劇團員時不一致)。
     *   元素口徑對齊 ch4/ch6 既有寫法:劍士=fire/祭司=grass;繪圖師=water(剋 ch3 敵方九尾空貓怪 fire)。
     *   舊隊伍保留註解備查(誤刪是大忌):heroes:["主角","程式設計師","電腦繪圖師","小劇團員"], elems:["light","water","water","wind"] */
    battle_ch3_boss:{ heroes:["主角","劍士","祭司","電腦繪圖師"],       elems:["light","fire","grass","water"], exp:120,
                      bgm:"bgm-boss-01",   bg:"貓空BOSS戰背景.png" },
    /* ★ v4.98.0 —— 第四章一致性(老師裁定):火法師改於第1場「戰前」火柱登場參戰(打醒被魅惑的守衛/刺客),
     *   本隊 主角/劍士/祭司/火法師 自此與劇情演出完全一致(舊版火法師戰後才登場卻已在隊上=不一致);隊伍本身不動。 */
    battle_ch4_boss:{ heroes:["主角","劍士","祭司","火法師"],               elems:["light","fire","grass","fire"],  exp:120,
                      bgm:"bgm-boss-apricot", bg:"主線_第四章_魅惑守衛刺客.jpg" },
    battle_ch5_boss:{ heroes:["主角","守衛","刺客","祭司"],                 elems:["light","earth","dark","grass"], exp:150,
                      bgm:"bgm-taiwan-boss",  bg:"臭豆腐BOSS.png" },
    battle_ch6_boss:{ heroes:["主角","劍士","祭司","火法師"],               elems:["light","fire","grass","fire"],  exp:180,
                      bgm:"bgm-boss-darkorb", bg:"主線_第六章_黑暗球降臨.jpg" }
  };
  // 主角未解鎖(測試閘門未開)時的替補池:取第一位「不在隊上」的初始 8 隻,絕不開天窗、絕不重複
  var _MS_PROTAG_FALLBACK = ["動物學家","小劇團員","直笛團員","弦樂團員","籃球隊員","田徑隊員","程式設計師","電腦繪圖師"];
  // 敵方陣容(全部現成敵人·零新建·balance 零改動;鐵律 1.31:真 BOSS 在 _ZEUS_TRUE_BOSSES 尊嚴保護自動生效)
  function _msBattleEnemies(key){
    try{
      if(key === "battle_ch1_1" || key === "battle_ch1_2"){
        var pool = (typeof MINI_MONSTERS !== "undefined" && MINI_MONSTERS.length) ? MINI_MONSTERS.slice() : ["偷喝茶的史萊姆"];
        pool.sort(function(){ return Math.random() - 0.5; });
        /* ★★ v4.91.0(老師裁定 E甲)—— 敵方屬性由「完全隨機」改「寫死成被我方剋制的屬性」。
         *   根因:屬性相剋小教室的原文是「這一隊的屬性已經依照對手幫你配好囉」,
         *   但舊碼 els[Math.floor(Math.random()*...)] 是每場隨機擲 → 學生照教學去算相剋會對不上,
         *   教學等於騙人。改成寫死後,首場的相剋教學才真正成立(相剋環 水→火→草→土→風→水):
         *     ch1_1 我方 風/水/草 → 敵方 水/火/土(各自剛好被剋,打出去就會看到傷害 +10%)
         *     ch1_2 我方 草/火     → 敵方 土/草
         *   ★ 敵人「名字」仍隨機(河堤小怪池 MINI_MONSTERS 洗牌),保留每次遭遇的新鮮感;
         *     只把「屬性」固定下來 → 教學成立、又不失變化。 */
        var _MS_MOB_ELEMS = { battle_ch1_1: ["water","fire","earth"], battle_ch1_2: ["earth","grass"] };
        var els = _MS_MOB_ELEMS[key] || ["water","fire","earth"];
        var out = [];
        for(var i = 0; i < els.length; i++){
          out.push({ name: pool[i % pool.length], element: els[i] });
        }
        return out;
      }
      if(key === "battle_ch3_boss"){ return [{ name:"九尾空貓怪", element:"fire" }]; }
      if(key === "battle_ch4_boss"){
        /* ★ v4.99.0(老師需求)—— 補上杏花妖本尊(舊陣容漏了她,只剩兩位被魅惑夥伴):
         *   ①排法照冒險模式杏花妖路線 _buildApricotTeam 慣例=被魅惑英雄在兩側、杏花妖居中(grass);
         *   ②連鎖自動生效:_bossIntroDetect 掃到 G.p2 有杏花妖 → 全螢幕播「杏花妖動態.mp4」出場動畫
         *     (v3.16.34 機制·ch3 九尾貓同路徑已驗證);advShowBossReact find 到杏花妖 → 答題反應改用
         *     _APRICOT 專屬台詞(舊陣容沒有她才 fallback 九尾貓預設台詞=老師回報的病灶);
         *   ③杏花妖在 _ZEUS_TRUE_BOSSES → 鎖血/尊嚴保護自動生效(鐵律 1.31);魅惑天賦/爆發 gate
         *     _adventureMode 主線同樣成立。舊陣容保留備查(誤刪是大忌):
         *   return [
         *     { name:"守衛", element:"earth", charmedFromHero:"守衛" },
         *     { name:"刺客", element:"dark",  charmedFromHero:"刺客" }
         *   ]; */
        return [
          { name:"守衛", element:"earth", charmedFromHero:"守衛" },
          { name:"杏花妖", element:"grass" },
          { name:"刺客", element:"dark",  charmedFromHero:"刺客" }
        ];
      }
      if(key === "battle_ch5_boss"){
        var tw = null;
        try{ if(typeof window._buildTaiwanBossTeam === "function") tw = window._buildTaiwanBossTeam("shenkeng_tofu"); }catch(_){}
        if(tw && tw.length) return tw;
        return [{ name:"臭氣魔王・發酵公", element:"grass" }];
      }
      if(key === "battle_ch6_boss"){ return [{ name:"黑暗球‧希望型態", element:"dark" }]; }
    }catch(_e){ console.warn("[主線戰鬥] 敵方陣容建構例外", key, _e); }
    return [];
  }
  // 建我方英雄(照 confirmHeroPick isAdvMode 正統流程:投資→等級HP→技能等級→爆發→至寶→跟隨寵物·全部唯讀套用)
  function _msBuildAllyHero(name, elem, pos){
    var h = newHero(name, "p1", pos);
    if(elem){ h.element = elem; try{ if(typeof applyElemBonus === "function") applyElemBonus(h); }catch(_){} }
    try{
      var inv = (typeof _heroStatInvested !== "undefined" && _heroStatInvested && _heroStatInvested[name]) || {};
      if(inv.hp){  h.hp  += inv.hp;  h.curHp = h.hp; }
      if(inv.atk){ h.atk += inv.atk; }
      if(inv.sp){  h.sp  += inv.sp;  }
      if(inv.spd){ h.spd += inv.spd; }
    }catch(_){}
    try{ if(typeof _applyAdvLevelHpBonus === "function") _applyAdvLevelHpBonus(h); }catch(_){}
    try{
      h._skLv = (typeof _heroSkillLevels !== "undefined" && _heroSkillLevels && _heroSkillLevels[name])
        ? { s1: (_heroSkillLevels[name].s1 || 0), s2: (_heroSkillLevels[name].s2 || 0) }
        : { s1: 0, s2: 0 };
      h._burstLvAdv = (typeof _heroBurstLevels !== "undefined" && _heroBurstLevels && _heroBurstLevels[name]) || 0;
    }catch(_){}
    try{ if(typeof _applyTaiwanTreasureToHero === "function") _applyTaiwanTreasureToHero(h); }catch(_){}
    try{ if(typeof window._applyFollowPetToHero === "function") window._applyFollowPetToHero(h); }catch(_){}
    return h;
  }
  // 我方名單解算:主角未解鎖 → 替補;同名重複防呆
  function _msResolveTeamNames(team){
    var names = team.heroes.slice();
    var protagOk = false;
    try{
      var pn = window._PROTAG_HERO_NAME || "主角";
      protagOk = !!(typeof window._protagHeroOpenForMe === "function" && window._protagHeroOpenForMe()
        && typeof HERO_DB !== "undefined" && HERO_DB[pn]);
    }catch(_){ protagOk = false; }
    for(var i = 0; i < names.length; i++){
      var isP = false;
      try{ isP = !!(typeof window._isProtagHero === "function" && window._isProtagHero(names[i])); }catch(_){}
      if(isP && !protagOk){
        var sub = null;
        for(var j = 0; j < _MS_PROTAG_FALLBACK.length; j++){
          if(names.indexOf(_MS_PROTAG_FALLBACK[j]) < 0){ sub = _MS_PROTAG_FALLBACK[j]; break; }
        }
        names[i] = sub || "動物學家";
      }
    }
    return names;
  }
  // 顯示名(主角顯示玩家暱稱·其餘原名)
  function _msDispHeroName(name){
    try{
      if(typeof window._isProtagHero === "function" && window._isProtagHero(name)
         && typeof window._lxpsProtagNick === "function"){
        return window._lxpsProtagNick() || name;
      }
    }catch(_){}
    return name;
  }
  function _msHeroImgSrc(name){
    try{ if(typeof HERO_IMGS !== "undefined" && HERO_IMGS && HERO_IMGS[name]) return HERO_IMGS[name]; }catch(_){}
    return "";
  }
  // ── 鎖定編組卡(Q5 乙:自建唯讀卡·零回歸)──
  function _msShowTeamCard(host, key, onGo){
    var team = _MS_BATTLE_TEAMS[key];
    var names = _msResolveTeamNames(team);
    var card = document.createElement("div");
    card.style.cssText = "max-width:1040px;width:96vw;margin:0 10px;padding:34px 32px 28px;border-radius:28px;background:linear-gradient(135deg,rgba(18,26,54,0.97),rgba(30,22,66,0.97));border:4px solid rgba(140,200,255,0.85);box-shadow:0 0 52px rgba(90,160,255,0.45);text-align:center;max-height:92vh;overflow-y:auto;-webkit-overflow-scrolling:touch;";
    var tag = document.createElement("div");
    tag.textContent = "🛡 " + _msT("出戰編組", "這次一起出戰的夥伴");
    tag.style.cssText = "font-size:40px;font-weight:900;color:#9fd6ff;letter-spacing:3px;margin-bottom:10px;text-shadow:0 0 18px rgba(120,190,255,0.55);";
    card.appendChild(tag);
    var lockLine = document.createElement("div");
    lockLine.textContent = "🔒 " + _msT("劇情固定隊伍——這一場由故事安排,成員無法更換。", "這一場的隊友是故事排好的,不能換人喔!");
    lockLine.style.cssText = "font-size:25px;color:#ffd98a;font-weight:700;margin-bottom:20px;line-height:1.6;";
    card.appendChild(lockLine);
    var grid = document.createElement("div");
    grid.style.cssText = "display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:14px;";
    for(var i = 0; i < names.length; i++){
      (function(nm, elemKey){
        var cell = document.createElement("div");
        cell.style.cssText = "width:196px;padding:14px 10px 16px;border-radius:18px;background:rgba(255,255,255,0.07);border:2.5px solid rgba(160,200,255,0.45);";
        var src = _msHeroImgSrc(nm);
        if(src){
          var im = document.createElement("img");
          im.src = src; im.alt = "";
          im.style.cssText = "width:140px;height:140px;object-fit:cover;border-radius:14px;background:rgba(0,0,0,0.3);";
          im.onerror = function(){ try{ im.remove(); }catch(_){} };
          cell.appendChild(im);
        } else {
          var em = document.createElement("div");
          try{ em.textContent = (typeof AVATARS !== "undefined" && AVATARS[nm]) || "🦸"; }catch(_){ em.textContent = "🦸"; }
          em.style.cssText = "font-size:96px;line-height:140px;";
          cell.appendChild(em);
        }
        var nmEl = document.createElement("div");
        nmEl.textContent = _msDispHeroName(nm);
        nmEl.style.cssText = "margin-top:10px;font-size:26px;font-weight:900;color:#fff;letter-spacing:1px;";
        cell.appendChild(nmEl);
        var el = document.createElement("div");
        try{
          var ed = (typeof ELEMENT_DB !== "undefined") ? ELEMENT_DB[elemKey] : null;
          el.textContent = ed ? (ed.icon + " " + ed.name + _msT("屬性", "屬性")) : "";
        }catch(_){}
        el.style.cssText = "margin-top:6px;font-size:22px;font-weight:700;color:#aee0ff;";
        cell.appendChild(el);
        grid.appendChild(cell);
      })(names[i], team.elems[i]);
    }
    card.appendChild(grid);
    if(team.teach){
      var teach = document.createElement("div");
      teach.style.cssText = "text-align:left;max-width:900px;margin:0 auto 18px;padding:18px 24px;border-radius:16px;background:rgba(120,180,255,0.10);border:2px solid rgba(140,200,255,0.4);font-size:25px;line-height:1.8;color:#e8f2ff;font-weight:600;";
      teach.innerHTML = "📖 <b style=\"color:#ffe08a;\">" + _msT("編組頁小教室", "什麼是編組頁?") + "</b><br>"
        + _msT(
          "這個畫面就是「編組頁」的縮影:每場戰鬥前,你都會像這樣確認 4 位出戰夥伴與他們的屬性。之後在冒險關卡裡,編組頁會開放讓你自由挑選、搭配自己的隊伍——今天先由故事替你安排,好好認識這幾位夥伴吧!",
          "這就是「編組頁」!每次打架前都會先看到 4 位隊友和他們的屬性。以後冒險時可以自己挑隊友,今天先用故事幫你選好的隊伍吧!");
      card.appendChild(teach);
    }
    var bar = document.createElement("div");
    bar.style.cssText = "display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:6px;";
    var go = document.createElement("button");
    go.textContent = team.teach ? (_msT("下一步:認識屬性", "下一步:屬性小教室") + " ▶") : ("⚔️ " + _msT("出發!", "開打!"));
    go.style.cssText = "padding:16px 44px;font-size:31px;font-weight:900;letter-spacing:2px;border:none;border-radius:17px;color:#fff;cursor:pointer;touch-action:manipulation;background:linear-gradient(135deg,#ff9a3c,#ff6ab0);";
    go.onclick = function(){
      try{ if(typeof playSfx === "function") playSfx("sfx-confirm2", 0.5); }catch(_){}
      try{ card.style.transition = "opacity 0.3s"; card.style.opacity = "0"; }catch(_){}
      setTimeout(function(){ try{ card.remove(); }catch(_){} onGo(); }, 320);
    };
    bar.appendChild(go);
    card.appendChild(bar);
    host.appendChild(card);
  }
  // ── 屬性相剋教學卡(Q6 甲:首場一次·含技能替換簡介但本次不替換)──
  function _msShowElemCard(host, key, onGo){
    var card = document.createElement("div");
    card.style.cssText = "max-width:1000px;width:96vw;margin:0 10px;padding:34px 34px 28px;border-radius:28px;background:linear-gradient(135deg,rgba(30,20,52,0.97),rgba(50,26,74,0.97));border:4px solid rgba(255,205,110,0.85);box-shadow:0 0 52px rgba(255,190,90,0.45);text-align:center;max-height:92vh;overflow-y:auto;-webkit-overflow-scrolling:touch;";
    var tag = document.createElement("div");
    tag.textContent = "🔮 " + _msT("屬性相剋小教室", "屬性小教室");
    tag.style.cssText = "font-size:40px;font-weight:900;color:#ffe08a;letter-spacing:3px;margin-bottom:16px;text-shadow:0 0 18px rgba(255,200,100,0.5);";
    card.appendChild(tag);
    var wheel = document.createElement("div");
    wheel.style.cssText = "font-size:34px;font-weight:900;letter-spacing:2px;color:#fff;line-height:1.9;margin-bottom:12px;";
    wheel.innerHTML = "💧水 ➜ 🔥火 ➜ 🌿草 ➜ 🪨土 ➜ 🪽風 ➜ 💧水<br><span style=\"font-size:29px;\">⭐光 ⇄ 🌙暗(互相剋制)</span>";
    card.appendChild(wheel);
    var txt = document.createElement("div");
    txt.style.cssText = "text-align:left;max-width:880px;margin:0 auto 18px;font-size:25px;line-height:1.85;color:#f2ecff;font-weight:600;";
    txt.innerHTML = _msT(
      "箭頭代表「剋制」:攻擊被自己剋制的屬性時,傷害提高 10%;反過來被剋制方打你,傷害則降低 10%。這一隊的屬性已經依照對手幫你配好囉——之後在冒險裡,選對屬性就是致勝關鍵之一!",
      "箭頭是「剋制」的意思:打到被你剋的屬性,傷害會多 10%;被剋你的打到,傷害會少 10%。這隊的屬性已經幫你配好了,以後自己選屬性也要記得剋制對手喔!"
    ) + "<br><br>✨ <b style=\"color:#ffd98a;\">" + _msT("小預告:技能替換", "偷偷告訴你:技能可以換!")
      + "</b><br>" + _msT(
      "英雄的技能將來可以「替換」成別的招式——例如隊伍缺補血就換上治療技,打硬皮敵人就換上破防技。這一場我們先用每位夥伴原本的技能,好好熟悉他們的看家本領!",
      "以後英雄的招式可以換成別的!像是缺補血就換補血招。今天先用大家原本的招式,認識他們最拿手的絕活吧!");
    card.appendChild(txt);
    var go = document.createElement("button");
    go.textContent = "⚔️ " + _msT("出發!", "開打!");
    go.style.cssText = "padding:16px 48px;font-size:32px;font-weight:900;letter-spacing:2px;border:none;border-radius:17px;color:#fff;cursor:pointer;touch-action:manipulation;background:linear-gradient(135deg,#ff9a3c,#ff6ab0);";
    go.onclick = function(){
      try{ if(typeof playSfx === "function") playSfx("sfx-confirm2", 0.5); }catch(_){}
      try{ card.style.transition = "opacity 0.3s"; card.style.opacity = "0"; }catch(_){}
      setTimeout(function(){ try{ card.remove(); }catch(_){} onGo(); }, 320);
    };
    card.appendChild(go);
    host.appendChild(card);
  }
  // ★★ v4.91.1 —— 主線第一場「邊打邊學」實戰引導教學啟動器(老師 2026-07-25 指示)
  //   接遊戲既有的 _startInteractiveTutorial():全畫面遮罩挖洞聚光 + 👆手指指著亮起來的按鈕
  //   + 訊息條,依序帶玩家做完 普攻→選目標→稱讚→賣卡/技能→技能鈕→選目標→完成卡。
  //   ★ 只在 _MS_BATTLE_TEAMS 標了 tutInter 的場次啟動(目前僅 battle_ch1_1)。
  //   ★ 教學系統本身是 setInterval 輪詢等玩家回合,所以在 advStartBattle 之後啟動剛剛好;
  //     這裡再延遲 900ms,讓戰鬥畫面的入場動畫與發牌先跑完,手指才不會指到還沒定位的按鈕。
  //   ★ 缺函式/例外一律靜默略過 —— 教學是加分項,絕不可以擋住劇情或戰鬥。
  function _msKickInteractiveTut(team){
    try{
      if(!team || !team.tutInter) return;
      if(typeof _startInteractiveTutorial !== "function") return;
      setTimeout(function(){
        try{
          if(!window._msRealBattleActive) return;   // 戰鬥已結束就不要再叫教學出來
          _startInteractiveTutorial();
        }catch(_e1){ console.warn("[主線戰鬥] 實戰引導教學啟動失敗(已略過,不影響戰鬥)", _e1); }
      }, 900);
    }catch(_e2){ console.warn("[主線戰鬥] 實戰引導教學排程失敗", _e2); }
  }

  // ══════════════════════════════════════════════════════════════════════
  // ★★ v4.92.0 —— 主線第二場「寵物馴養」手指引導教學(老師 2026-07-25 指示)
  // ──────────────────────────────────────────────────────────────────────
  // 老師要求:第二場也要像第一場那樣有手指,帶著玩家走完
  //   「先攜帶寵物 → 再馴養 → 使用飼料」整段流程,最後還要指引
  //   「馴養後可以使用寵物的極限爆發,而且好感度越高威力越強」。
  // 作法:沿用遊戲既有的實戰教學零件(_tutInterShowDim 挖洞聚光 / _tutInterShowArrow 👆手指 /
  //   _tutInterShowMsg 訊息條),自己跑一條 350ms 的輪詢狀態機,依 DOM 與遊戲狀態推進:
  //     step1 寵物卡進物品格 → 指該格,請玩家點它
  //     step2 卡被選中(🐾 攜帶寵物鈕現身)→ 指該鈕
  //     step3 已裝到某位夥伴身上 → 等輪到牠,指 🐾 馴養鈕(教學版免飼料、答案會標⭐、必成功)
  //     step4 馴養完成 → 收掉遮罩,跳出「寵物極限爆發 × 好感度」說明卡
  // ★ 全程純顯示層:不改任何戰鬥數值,任何一步查無元素就靜靜等待,絕不擋住戰鬥。
  // ★ 與第一場的 _startInteractiveTutorial 互斥(那場是 tutInter、這場是 petTut),不會同時出現。
  // ══════════════════════════════════════════════════════════════════════
  var _MS_PET_TUT = { on:false, step:0, pet:"", timer:null, tickN:0 };

  /* ★★ v4.93.0(老師裁定乙)—— 主線教學戰鬥「保留 1 HP」守門判定(供 doDmg 兩條致命路徑呼叫)。
   *   回傳 true = 現在應該把這名目標的致命傷害夾成保留 1 HP。條件全部成立才擋:
   *     ① 目前在主線戰鬥(_adventureStage==='mainstory')
   *     ② 目標是敵方(side==='p2')且「不是真 BOSS」(不在 _ZEUS_TRUE_BOSSES·BOSS 場不應被無限拖延)
   *     ③ 教學正在進行:第一場實戰引導(_tutInterPhase 存在且非 'idle')或第二場寵物馴養教學(_MS_PET_TUT.on)
   *   任一不成立 → 回 false(正常可擊殺)。純判定、零副作用、全程 try 包好,絕不擋住戰鬥流程。 */
  window._msTutBattleGuardActive = function(target){
    try{
      if(typeof _adventureStage === 'undefined' || _adventureStage !== 'mainstory') return false;
      if(!target || target.side !== 'p2') return false;
      if(typeof _ZEUS_TRUE_BOSSES !== 'undefined' && _ZEUS_TRUE_BOSSES && _ZEUS_TRUE_BOSSES.has && _ZEUS_TRUE_BOSSES.has(target.name)) return false;
      var _tutInterOn = (typeof _tutInterPhase !== 'undefined' && _tutInterPhase && _tutInterPhase !== 'idle');
      var _petTutOn = !!(_MS_PET_TUT && _MS_PET_TUT.on);
      return !!(_tutInterOn || _petTutOn);
    }catch(_e){ return false; }
  };

  function _msPetTutStop(){
    try{ if(_MS_PET_TUT.timer){ clearInterval(_MS_PET_TUT.timer); } }catch(_){}
    _MS_PET_TUT.timer = null; _MS_PET_TUT.on = false; _MS_PET_TUT.step = 0;
    try{ if(typeof _tutInterClearArrow === "function") _tutInterClearArrow(); }catch(_){}
    try{ if(typeof _tutInterClearMsg === "function") _tutInterClearMsg(); }catch(_){}
    try{ if(typeof _tutInterHideDim === "function") _tutInterHideDim(); }catch(_){}
  }
  window._msPetTutStop = _msPetTutStop;

  // 馴養成功由 _advDoTame 回呼 → 推進到最後一步(寵物極限爆發指引)
  window._msPetTutOnTamed = function(){
    try{
      if(!_MS_PET_TUT.on) return;
      _MS_PET_TUT.step = 4;
    }catch(_){}
  };

  function _msPetTutFindSlot(pet){
    try{
      if(typeof G === "undefined" || !G || !G.inv) return -1;
      for(var i = 0; i < G.inv.length; i++){
        var it = G.inv[i];
        if(it && (it.n === pet || it.name === pet)) return i;
      }
    }catch(_){}
    return -1;
  }
  function _msPetTutEquippedHero(pet){
    try{
      if(typeof G === "undefined" || !G || !Array.isArray(G.p1)) return null;
      for(var i = 0; i < G.p1.length; i++){
        var h = G.p1[i];
        if(h && h.equip && h.equip.n === pet) return h;
      }
    }catch(_){}
    return null;
  }

  // ── 最後一步:寵物極限爆發 × 好感度 說明卡 ──
  function _msPetTutBurstCard(){
    try{
      var _cute = false;
      try{ _cute = _msArtCute(); }catch(_){}
      var m = document.createElement("div");
      m.id = "_ms-pet-burst-card";
      m.style.cssText = "position:fixed;inset:0;z-index:12060;background:rgba(0,0,0,0.86);display:flex;align-items:center;justify-content:center;padding:20px;";
      var box = document.createElement("div");
      box.style.cssText = "max-width:960px;width:96vw;max-height:92vh;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:32px 34px 26px;border-radius:26px;background:linear-gradient(150deg,rgba(20,40,30,0.98),rgba(10,24,18,0.99));border:4px solid rgba(120,255,180,0.8);box-shadow:0 0 54px rgba(70,230,150,0.4);text-align:center;";
      var h1 = document.createElement("div");
      h1.textContent = "🐾 " + (_cute ? "牠變成你的夥伴了!" : "馴養成功 — 寵物極限爆發");
      h1.style.cssText = "font-size:40px;font-weight:900;color:#8dffc0;letter-spacing:2px;margin-bottom:14px;text-shadow:0 0 18px rgba(80,255,160,0.5);";
      box.appendChild(h1);
      var t = document.createElement("div");
      t.style.cssText = "text-align:left;max-width:860px;margin:0 auto 18px;font-size:25px;line-height:1.85;color:#eaffee;font-weight:600;";
      t.innerHTML = (_cute
        ? "帶著寵物的夥伴,能量集滿的時候,爆發按鈕會變成「🐾 寵物爆發」——那是只有寵物才會的大絕招!<br><br>"
          + "⭐ <b style=\"color:#ffe08a;\">和寵物越要好,大絕越強!</b><br>"
          + "在小屋陪牠玩、一起打贏敵人,好感度就會變高。好感度越高,寵物大絕的威力就越強:"
          + "<b style=\"color:#8dffc0;\">25% → 50% → 75% → 100% → 125%</b>。<br>"
          + "好感度滿 100 的時候,寵物大絕一場還可以多放一次喔!"
        : "當夥伴身上帶著寵物、能量集滿時,極限爆發鈕會切換成「🐾 寵物爆發」——這是寵物專屬的招式,和英雄自己的極限爆發<b>分開計次</b>,等於多一次翻盤機會。<br><br>"
          + "⭐ <b style=\"color:#ffe08a;\">好感度越高,寵物極限爆發威力越強</b><br>"
          + "好感度可透過一起戰鬥、擊敗 BOSS、在寵物小屋互動累積(上限 100)。威力隨好感度五階提升:"
          + "<b style=\"color:#8dffc0;\">25% → 50% → 75% → 100% → 125%(不離不棄)</b>;"
          + "好感度達 25/50/75/100 還會解鎖「忠誠夥伴」——主人倒下時由寵物復活 10/20/30/40% HP,"
          + "滿 100 更可每場多放一次寵物極限爆發。");
      box.appendChild(t);
      var b = document.createElement("button");
      b.textContent = "⚔️ " + (_cute ? "知道了,繼續打!" : "了解,繼續戰鬥");
      b.style.cssText = "padding:16px 48px;font-size:32px;font-weight:900;letter-spacing:2px;border:none;border-radius:17px;color:#fff;cursor:pointer;touch-action:manipulation;background:linear-gradient(135deg,#3ec98a,#2aa0d8);";
      b.onclick = function(){
        try{ if(typeof playSfx === "function") playSfx("sfx-confirm2", 0.5); }catch(_){}
        try{ m.remove(); }catch(_){}
      };
      box.appendChild(b);
      m.appendChild(box);
      document.body.appendChild(m);
    }catch(e){ console.warn("[主線寵物教學] 爆發說明卡例外", e); }
  }

  function _msPetTutTick(){
    try{
      if(!_MS_PET_TUT.on) return;
      _MS_PET_TUT.tickN++;
      // 戰鬥結束/離場 → 自行收尾(雙保險,_msBattleResult 也會呼叫)
      if(!window._msRealBattleActive){ _msPetTutStop(); return; }
      // 逾時保護:約 5 分鐘還沒走完就自動收掉,絕不長期佔著畫面
      if(_MS_PET_TUT.tickN > 860){ _msPetTutStop(); return; }

      var pet = _MS_PET_TUT.pet;
      var _cute = false;
      try{ _cute = _msArtCute(); }catch(_){}

      // ── step4:馴養完成 → 收遮罩 + 出寵物爆發說明卡(只做一次)──
      if(_MS_PET_TUT.step === 4){
        _msPetTutStop();
        setTimeout(function(){ _msPetTutBurstCard(); }, 900);
        return;
      }
      // ── step3:已裝備 → 等該英雄回合,指 🐾 馴養鈕 ──
      var hEq = _msPetTutEquippedHero(pet);
      if(hEq){
        var tameBtn = document.getElementById("b-tame");
        var tameOn = !!(tameBtn && tameBtn.style.display !== "none" && tameBtn.offsetParent !== null);
        if(tameOn){
          if(_MS_PET_TUT.step !== 3){
            _MS_PET_TUT.step = 3;
            try{ if(typeof playSfx === "function") playSfx("sfx-sel", 0.4); }catch(_){}
          }
          try{ _tutInterShowDim(tameBtn, 24); }catch(_){}
          try{ _tutInterShowArrow(tameBtn, "auto"); }catch(_){}
          try{
            _tutInterShowMsg(
              "🐾 " + (_cute ? "第三步:馴養牠!" : "第三步:出手馴養"),
              (_cute ? "按這個「馴養」鈕,餵牠吃飼料!會問你一題小問題,有 ⭐ 的就是答案,點它就對了!這次教學不會用掉你的飼料喔!"
                     : "按下「🐾 馴養」→ 選飼料 → 回答一題寵物小知識(教學版會直接標出 ⭐ 正確答案)。本場教學不消耗飼料、必定成功。"),
              "_msPetTutStop");
          }catch(_){}
          return;
        }
        // 已裝備但還沒輪到 → 提示等待,不鎖畫面
        if(_MS_PET_TUT.step !== 2.5){
          _MS_PET_TUT.step = 2.5;
          try{ _tutInterHideDim(); _tutInterClearArrow(); }catch(_){}
          try{
            _tutInterShowMsg(
              "⏳ " + (_cute ? "帶好了!等牠出手" : "攜帶完成 — 等待該夥伴的回合"),
              (_cute ? "「" + (hEq.name || "夥伴") + "」已經帶著小動物了!等輪到牠的時候,就會出現「🐾 馴養」按鈕。"
                     : "「" + (hEq.name || "夥伴") + "」已攜帶該寵物。輪到牠行動時,動作列就會出現「🐾 馴養」按鈕。"),
              "_msPetTutStop");
          }catch(_){}
        }
        return;
      }
      // ── step2:寵物卡被選中 → 指「🐾 攜帶寵物」鈕 ──
      var eqBtn = document.getElementById("iop-equip-btn");
      var eqOn = !!(eqBtn && eqBtn.style.display !== "none" && eqBtn.offsetParent !== null);
      if(eqOn){
        if(_MS_PET_TUT.step !== 2){
          _MS_PET_TUT.step = 2;
          try{ if(typeof playSfx === "function") playSfx("sfx-sel", 0.4); }catch(_){}
        }
        try{ _tutInterShowDim(eqBtn, 22); }catch(_){}
        try{ _tutInterShowArrow(eqBtn, "auto"); }catch(_){}
        try{
          _tutInterShowMsg(
            "🐾 " + (_cute ? "第二步:把牠帶上!" : "第二步:攜帶寵物"),
            (_cute ? "按「🐾 攜帶寵物」,再選一位夥伴,讓牠把小動物帶在身上!"
                   : "按下「🐾 攜帶寵物」,再選一位夥伴 —— 帶著寵物的夥伴,才能對牠出手馴養。"),
            "_msPetTutStop");
        }catch(_){}
        return;
      }
      // ── step1:等寵物卡出現在物品格 → 指那一格 ──
      var si = _msPetTutFindSlot(pet);
      if(si >= 0){
        var slot = document.getElementById("slot-" + si);
        if(slot){
          if(_MS_PET_TUT.step !== 1){
            _MS_PET_TUT.step = 1;
            try{ if(typeof playSfx === "function") playSfx("sfx-equip", 0.5); }catch(_){}
          }
          try{ _tutInterShowDim(slot, 22); }catch(_){}
          try{ _tutInterShowArrow(slot, "auto"); }catch(_){}
          try{
            _tutInterShowMsg(
              "🐾 " + (_cute ? "第一步:有小動物跑進包包!" : "第一步:物品格裡的小動物"),
              (_cute ? "看!「" + pet + "」跑到你的包包裡了!先點它一下選起來。"
                     : "野生的「" + pet + "」跑進了你的物品格。先點選這張卡片。"),
              "_msPetTutStop", "left");
          }catch(_){}
        }
        return;
      }
      // 卡還沒出現(理論上開場就有)→ 靜靜等待,不顯示任何東西
    }catch(e){ console.warn("[主線寵物教學] tick 例外(已略過)", e); }
  }

  // ── 啟動器:由 _msStartRealBattle 在 advStartBattle 之後呼叫 ──
  function _msKickPetTut(team){
    try{
      if(!team || !team.petTut || !team.petCard) return;
      if(typeof _tutInterShowDim !== "function" || typeof _tutInterShowMsg !== "function") return;
      try{ if(typeof _tutInterInjectCSS === "function") _tutInterInjectCSS(); }catch(_){}
      _msPetTutStop();
      _MS_PET_TUT.on = true; _MS_PET_TUT.step = 0; _MS_PET_TUT.pet = team.petCard; _MS_PET_TUT.tickN = 0;
      setTimeout(function(){
        try{
          if(!window._msRealBattleActive){ _msPetTutStop(); return; }
          _MS_PET_TUT.timer = setInterval(_msPetTutTick, 350);
        }catch(_e){ console.warn("[主線寵物教學] 啟動失敗(已略過)", _e); }
      }, 1200);
    }catch(e){ console.warn("[主線寵物教學] 排程失敗", e); }
  }

  // ── 真實戰鬥啟動(照 _wbSetupAdvForBattle 前例)──
  function _msStartRealBattle(key, onDone){
    var team = _MS_BATTLE_TEAMS[key];
    if(!team){ if(onDone) onDone(); return; }
    var ov = document.getElementById("mainstory-overlay");
    var ambBack = "";
    try{ ambBack = _msAmbKey || ""; if(ambBack) _msStopAmb(); }catch(_){}
    /* ★★ v4.91.0 全黑根治 —— 舊碼只藏 overlay、沒動 z9780 的 #mainstory-backdrop,
     *   導致整場戰鬥被深藍 #0a0618 蓋死(且 pointer-events:none 讓點擊穿透到別的畫面)。
     *   舊碼保留備查(誤刪是大忌):try{ if(ov) ov.style.display = "none"; }catch(_){} */
    _msHideStoryLayers();
    /* ★★ v5.4.0(2026-07-30 玩家回報)—— 主線開戰前強制清除「殘留的冒險結算視窗」:
     *   災情:ch6 一進戰鬥就浮出「戰鬥勝利」視窗(adv-result-overlay),背景同時正常戰鬥;
     *   按確認直接發冒險獎勵並退回關卡頁,整場戰鬥+後續劇情被跳過。
     *   追查:adv-result-overlay 全檔僅 advShowBattleResult 內兩個顯示點,皆在 v4.89.0 主線
     *   攔截「之後」(攔截必印 🛡 warn,玩家 console 300 條全無)→ 判定該 .show 是「更早之前
     *   (先前冒險戰/舊版)殘留」,整段主線劇情被 z9780 mainstory-backdrop 蓋住看不見,
     *   進真實戰鬥 _msHideStoryLayers() 收掉劇情圖層後才露出。主線開戰路徑沒有像冒險入口
     *   (advStartAdventure L≈82378)那樣的殘留 overlay 清理 → 於此補上。
     *   只清 UI(.show/inline display)不動任何資料/獎勵/旗標語義;清到殘留會印 warn 供診斷。 */
    try{
      ['adv-result-overlay','adv-mini-result','adv-reward-overlay','adv-continue-overlay','adv-unlock-overlay'].forEach(function(_sid){
        var _sel = document.getElementById(_sid);
        if(!_sel) return;
        var _wasShown = !!(_sel.classList && _sel.classList.contains('show'))
          || !!(_sel.style && _sel.style.display && _sel.style.display !== 'none' && _sel.style.display !== '');
        if(_wasShown){
          console.warn('🛡 [主線開戰 v5.4.0] 清除殘留結算視窗 #' + _sid + '(殘留自先前戰鬥·非本場,防「一進戰鬥就看到勝利視窗」)');
        }
        try{ _sel.classList.remove('show'); }catch(_){}
        try{ _sel.style.display = (_sid === 'adv-mini-result') ? 'none' : ''; }catch(_){}
      });
      /* 殘留的結算 watchdog 一併拆除(先前戰鬥排的 4s/5s 計時器若在主線戰鬥中觸發,
       *   會強制重開結算頁/重觸 advShowBattleResult;後者雖有主線攔截,拆掉最乾淨) */
      try{ if(window._advResultShowWatchdog){ clearTimeout(window._advResultShowWatchdog); window._advResultShowWatchdog = null; } }catch(_){}
      try{ if(window._showResultWatchdog){ clearTimeout(window._showResultWatchdog); window._showResultWatchdog = null; } }catch(_){}
    }catch(_eStale){ console.warn('[主線開戰 清殘留結算視窗 v5.4.0]', _eStale); }
    var names = _msResolveTeamNames(team);
    // ── 建 G.p1(任何一隻失敗 → 用替補池救,絕不讓 map 例外造成空隊)──
    var p1 = [];
    for(var i = 0; i < names.length; i++){
      var built = null;
      try{ built = _msBuildAllyHero(names[i], team.elems[i], i); }catch(_e1){ console.error("[主線戰鬥] 建立我方失敗", names[i], _e1); }
      if(!built){
        for(var j = 0; j < _MS_PROTAG_FALLBACK.length && !built; j++){
          if(names.indexOf(_MS_PROTAG_FALLBACK[j]) < 0){
            try{ built = _msBuildAllyHero(_MS_PROTAG_FALLBACK[j], team.elems[i], i); names[i] = _MS_PROTAG_FALLBACK[j]; }catch(_e2){}
          }
        }
      }
      if(built) p1.push(built);
    }
    // ── 建 G.p2(被魅惑敵人素質繼承照 confirmHeroPick 前例)──
    var defs = _msBattleEnemies(key);
    var p2 = [];
    for(var k = 0; k < defs.length; k++){
      var b = defs[k];
      var h2 = null;
      try{ h2 = newHero(b.name, "p2", k); }catch(_e3){ console.error("[主線戰鬥] 建立敵方失敗", b.name, _e3); }
      if(!h2) continue;
      h2.element = b.element || null;
      try{ if(h2.element && typeof applyElemBonus === "function") applyElemBonus(h2); }catch(_){}
      if(b.isMainBoss) h2.isMainBoss = true;
      if(b.charmedFromHero){
        try{
          var src = b.charmedFromHero;
          h2._displayName = "被魅惑的" + src;
          h2._isCharmedEnemy = true;
          var civ = (typeof _heroStatInvested !== "undefined" && _heroStatInvested && _heroStatInvested[src]) || {};
          if(civ.hp){ h2.hp += civ.hp; h2.curHp = h2.hp; }
          if(civ.atk) h2.atk += civ.atk;
          if(civ.sp)  h2.sp  += civ.sp;
          if(civ.spd) h2.spd += civ.spd;
          var clv = (typeof _heroLevels !== "undefined" && _heroLevels && _heroLevels[src]) || 1;
          if(clv > 1){
            var bhp = Math.round(h2.hp * ((clv - 1) * 0.02));
            h2.hp += bhp; h2.curHp = h2.hp;
          }
          h2._skLv = (typeof _heroSkillLevels !== "undefined" && _heroSkillLevels && _heroSkillLevels[src])
            ? { s1: (_heroSkillLevels[src].s1 || 0), s2: (_heroSkillLevels[src].s2 || 0) }
            : { s1: 0, s2: 0 };
          h2._burstLvAdv = (typeof _heroBurstLevels !== "undefined" && _heroBurstLevels && _heroBurstLevels[src]) || 0;
          h2.hp = Math.round(h2.hp * 2);   // 被魅惑強化 HP+100%(照 v1.0.20260501.4700 前例)
          h2.curHp = h2.hp;
        }catch(_e4){ console.warn("[主線戰鬥] 被魅惑素質繼承例外", _e4); }
      }
      p2.push(h2);
    }
    if(!p1.length || !p2.length){
      console.error("[主線戰鬥] 隊伍建構失敗(p1=" + p1.length + " p2=" + p2.length + ") → 退回純演出,絕不擋劇情");
      /* ★ v4.91.0 —— 退回演出前必須把主線圖層還原 + backdrop 重建(否則劇情底層會露出關卡頁) */
      _msShowStoryLayers();
      try{ if(typeof _msEnsureBackdrop === "function") _msEnsureBackdrop(); }catch(_){}
      try{ if(ov) ov.style.display = ""; }catch(_){}
      try{ if(ambBack) _msStartAmb(ambBack); }catch(_){}
      _msActBattleShow(key, onDone);
      return;
    }
    /* ★ v5.2.0(老師需求 2026-07-29)—— 主線戰鬥獎勵改「依魔物原設定的經驗值」(首勝限定):
     *   單一真相 = 全遊戲統一公式 _calcBaseExpFromName(名) = HERO_DB 基礎 (hp+atk+sp+spd)×0.5
     *   (冒險小怪戰 _miniBaseExp、BOSS 戰 grantBattleExp baseExp、魔物圖鑑顯示皆同此口徑)。
     *   於此(敵方陣容確定當下)快照合計進 ctx.enemyExp;被魅惑敵人(ch4 守衛/刺客)雖在戰鬥中
     *   繼承玩家素質+HP×2,「原設定」仍以 HERO_DB 基礎值計。HERO_DB 缺名 → 退 _calcMobExp(當下
     *   素質)兜底;總和 0 時 _msShowRealWin 退回舊固定值 team.exp 兜底,絕不因此漏發獎。 */
    var _msEnemyExp = 0;
    try{
      for(var _ei = 0; _ei < p2.length; _ei++){
        var _en = (p2[_ei] && p2[_ei].name) ? p2[_ei].name : "";
        if(!_en) continue;
        var _e1 = 0;
        try{ _e1 = (typeof _calcBaseExpFromName === "function") ? (_calcBaseExpFromName(_en) || 0) : 0; }catch(_eCb){ _e1 = 0; }
        if(!_e1){ try{ _e1 = (typeof _calcMobExp === "function") ? (_calcMobExp(p2[_ei]) || 0) : 0; }catch(_eCm){ _e1 = 0; } }
        _msEnemyExp += _e1;
      }
    }catch(_eExpSum){ _msEnemyExp = 0; }
    /* ★ v5.2.0(老師需求 2026-07-29)—— 第六章黑暗球 BOSS 血量/能力「依主角隊伍等級同步調整」
     *   (如同冒險關卡:與木柵浮動加成同公式 scale = 1 + max(0, 隊伍平均Lv−1) × 0.02,套 hp/atk/sp/spd)。
     *   根因:主線 stage='mainstory' 進不了 advStartBattle 的木柵縮放分支(只認 maokong),黑暗球在
     *   主線一直是 HERO_DB 原始素質(HP 1500 固定)與玩家等級完全脫鉤 → 於隊伍建構完成後在此補套。
     *   ★ 難度=最簡單(「沒自信」同級):主線 _advPlayerDifficulty="" → _advBossHpMult() 回 1.00,
     *     與「沒自信」難度 1.00 完全同值,不疊任何難度 HP 加成(老師指定口徑)。
     *   ★ 獎勵不受影響:ctx.enemyExp 已於本段「之前」以 HERO_DB 原設定快照(維持魔物原設定語義)。
     *   ★ 分身/鎖血自動連動:BOSS_CLONE_DEF 分身 HP=本體初始 hp×50%、鎖血 50%/1HP 依 hp 比例判定,
     *     皆讀縮放後 hp → 行為與冒險模式黑暗球完全一致。僅第六章套用(老師指定範圍)。 */
    if(key === "battle_ch6_boss"){
      try{
        var _lvSum = 0, _lvCnt = 0;
        for(var _li = 0; _li < p1.length; _li++){
          var _ln = (p1[_li] && p1[_li].name) ? p1[_li].name : "";
          if(!_ln) continue;
          _lvSum += ((typeof _heroLevels !== "undefined" && _heroLevels && _heroLevels[_ln]) || 1);
          _lvCnt++;
        }
        var _avgLv = _lvCnt ? (_lvSum / _lvCnt) : 1;
        var _lvScale = 1 + Math.max(0, _avgLv - 1) * 0.02;
        if(_lvScale > 1.0001){
          for(var _bi = 0; _bi < p2.length; _bi++){
            var _bh = p2[_bi];
            if(!_bh) continue;
            if(typeof _bh.hp === "number" && _bh.hp > 0){ _bh.hp = Math.max(1, Math.round(_bh.hp * _lvScale)); _bh.curHp = _bh.hp; }
            if(typeof _bh.atk === "number" && _bh.atk > 0){ _bh.atk = Math.max(1, Math.round(_bh.atk * _lvScale)); }
            if(typeof _bh.sp === "number" && _bh.sp > 0){ _bh.sp = Math.max(1, Math.round(_bh.sp * _lvScale)); }
            if(typeof _bh.spd === "number" && _bh.spd > 0){ _bh.spd = Math.max(1, Math.round(_bh.spd * _lvScale)); }
          }
          try{ console.log("[主線 ch6 等級浮動 v5.2.0] 隊伍平均 Lv=" + _avgLv.toFixed(2) + " scale=×" + _lvScale.toFixed(4) + " → 黑暗球 hp=" + (p2[0] ? p2[0].hp : "?")); }catch(_eLg){}
        } else {
          try{ console.log("[主線 ch6 等級浮動 v5.2.0] 隊伍平均 Lv≈1 → 不縮放(維持原設定素質)"); }catch(_eLg2){}
        }
      }catch(_eLvScale){ console.warn("[主線 ch6 等級浮動] 套用失敗(維持原素質)", _eLvScale); }
    }
    /* ★ v5.5.0(老師需求 2026-07-31)—— 第六章主線 BOSS 黑暗球降強度(只在這場戰鬥,讓玩家容易通關主線):
     *   ①改名「黑暗球‧初始型態」:純顯示層 _displayName(渲染卡片 L≈34021 本就優先讀它·被魅惑敵人同款前例),
     *     h.name 完全不動 → _ZEUS_TRUE_BOSSES 鎖血尊嚴、天賦黑暗失控反擊、BOSS_CLONE_DEF 分身/保命、
     *     擊倒慢動作判定、答題反應等全部 name gate 照常生效,零機制回歸;
     *   ②最大HP/攻擊/特技/速度全部調降 50%:套在 v5.2.0 等級浮動「之後」(=浮動後再砍半,
     *     玩家隊伍等級再高也維持相對輕鬆);curHp 同步重設為新 hp。
     *   ③_msStatMult=0.5 標記:供 _spawnBossClones 讓跌破 50% 分裂出的 3 個分身「攻/特/速也砍半+同名顯示」
     *     (分身 HP 本就=本體 hp×50% → 讀到砍半後的 hp 自動連動,免另外處理)。
     *   ★ 範圍:只在主線 battle_ch6_boss;冒險模式木柵的黑暗球‧希望型態(名稱/素質)完全不受影響。 */
    if(key === "battle_ch6_boss"){
      try{
        for(var _ni = 0; _ni < p2.length; _ni++){
          var _nh = p2[_ni];
          if(!_nh || _nh.name !== "黑暗球‧希望型態") continue;
          _nh._displayName = "黑暗球‧初始型態";
          _nh._msStatMult = 0.5;   // ★ 分身連動標記(_spawnBossClones 讀取·僅主線 ch6 本體會帶)
          if(typeof _nh.hp  === "number" && _nh.hp  > 0){ _nh.hp  = Math.max(1, Math.round(_nh.hp  * 0.5)); _nh.curHp = _nh.hp; }
          if(typeof _nh.atk === "number" && _nh.atk > 0){ _nh.atk = Math.max(1, Math.round(_nh.atk * 0.5)); }
          if(typeof _nh.sp  === "number" && _nh.sp  > 0){ _nh.sp  = Math.max(1, Math.round(_nh.sp  * 0.5)); }
          if(typeof _nh.spd === "number" && _nh.spd > 0){ _nh.spd = Math.max(1, Math.round(_nh.spd * 0.5)); }
          try{ console.log("[主線 ch6 初始型態 v5.5.0] 黑暗球降強度 50% → hp=" + _nh.hp + " atk=" + _nh.atk + " sp=" + _nh.sp + " spd=" + _nh.spd); }catch(_eLg3){}
        }
      }catch(_eNerf){ console.warn("[主線 ch6 初始型態降強度] 套用失敗(維持原素質)", _eNerf); }
    }
    // ── 戰鬥情境旗標(照 _wbSetupAdvForBattle 清殘留)──
    window._msRealBattleActive = true;
    /* ★ v4.91.0 —— ctx 帶上本場專屬 BGM 與戰場背景圖(advStartBattle 的 mainstory 分支讀取) */
    /* ★ v5.2.0 —— ctx 加 enemyExp(魔物原設定經驗合計快照,供 _msShowRealWin 發獎) */
    window._msBattleCtx = { key: key, onDone: onDone, ambBack: ambBack, usedNames: names.slice(), settled: false,
                            enemyExp: _msEnemyExp,
                            bgm: (team.bgm || ""), bg: (team.bg ? _msAsset(team.bg) : "") };
    /* ★★ v4.91.0(老師裁定 F甲·老師 2026-07-24 補充口徑)—— ch1_2 馴養教學:
     *   ★老師明確指正:「不是把小怪打到殘血,是會有動物加入物品卡,攜帶後才能開始用飼料馴養」。
     *   作法=沿用既有 window._pendingEventPet 機制(茶園野生動物事件同款):advStartBattle 開場發牌時
     *   會把該寵物的 CARRY_PET_DB 物件放進 G.inv[0] → 玩家在物品格看到「動物夥伴卡」→ 用卡把牠帶上
     *   某位英雄身上(doEquip)→ 該英雄回合才會出現 🐾 馴養鈕 → 用飼料馴養。完全對齊老師描述的流程。
     *   ★ 教學旗標 _msTameTut:讓這一場免飼料、問答直接標答案、必定成功(仿既有 _petT2 教學分支),
     *     學生就算背包一份飼料都沒有也一定能完成劇情,不會卡在「按不動」。 */
    try{
      window._msTameTut = null;
      if(team.petCard){
        window._pendingEventPet = team.petCard;
        window._msTameTut = { active: true, pet: team.petCard };
      }
    }catch(_ePet){ console.warn("[主線戰鬥] 寵物卡注入例外", _ePet); }
    try{
      _adventureMode = true;
      _adventureStage = "mainstory";
      _advBossIntroShown = true;      // 主線有自己的開場卡;BOSS 登場動畫(_bossIntroDetect)另行自動判定播放
      _advBossIntroActive = false;
      _advMiniBattleActive = false;
      if(typeof _advQuizPhase !== "undefined") _advQuizPhase = "idle";
      if(typeof _advQuizResolveCb !== "undefined") _advQuizResolveCb = null;
      if(typeof _bossQuizInFlight !== "undefined") window._bossQuizInFlight = false;
      if(typeof _advBossActionSkip !== "undefined") _advBossActionSkip = false;
      if(typeof _advBossRageBurstUsed !== "undefined") _advBossRageBurstUsed = false;
      if(typeof _advContinueCount !== "undefined") _advContinueCount = 0;
      if(typeof _advPlayerDifficulty !== "undefined") _advPlayerDifficulty = "";  // HP 難度倍率 = 1.00
      if(typeof _advPlayerSubject !== "undefined") _advPlayerSubject = "";
    }catch(_eFlag){ console.warn("[主線戰鬥] 旗標設定例外", _eFlag); }
    try{
      window._advMiniResultShowing = false;
      window._advMiniResultPending = null;
      window._advPreComposedMobs = null;
      window._advBossHpMultApplied = false;
      window._advJapanEliteBuffApplied = false;
      window._advJapanYamataWeakApplied = false;
      window._advMaokongLvScaleApplied = false;
      window._advRareMobLvScaleApplied = false;
      window._currentBossVariantInfo = null;
      window._friendHeroInParty = false;   // 主線鎖定隊伍:好友英雄不注入(照 worldboss 前例·不清 _invitedFriendHero)
    }catch(_){}
    // 戰鬥用法寶 3 個隨機(純戰鬥內消耗·零持久化;照 advRestartBattle 前例)
    try{
      if(typeof ADV_TREASURES !== "undefined" && ADV_TREASURES.length){
        var tp = ADV_TREASURES.slice().sort(function(){ return Math.random() - 0.5; });
        _advTreasures = [tp[0], tp[1 % tp.length], tp[2 % tp.length]];
        try{ if(typeof advUpdateTreasureBar === "function") advUpdateTreasureBar(); }catch(_){}
      }
    }catch(_){}
    // ── 戰場物件重置(照 _wbSetupAdvForBattle;能量照 advRestartBattle 初始 2/2)──
    try{
      G.p1 = p1;
      G.p2 = p2;
      G.round = 1;
      G.turn = 0;
      G.currentActorIdx = 0;
      G.turnOrder = [];
      G.energy = { p1: 2, p2: 2 };
      G.energyMax = 10;
      G._resultShown = false;
      G._everHadEnemies = false;
    }catch(_eG){ console.error("[主線戰鬥] G 重置例外", _eG); }
    /* ★ v4.91.0 全黑根治·保險網 —— 主線場景切換有 new Image() 預載 + 1.5s 逾時兜底等非同步排程,
     *   理論上進戰鬥後不會再重建 backdrop;但為保證「絕不再出現整片深藍蓋住戰鬥」,
     *   開戰後每秒巡一次(共 6 秒):只要仍在主線實戰中就把殘留的 backdrop 拔掉。純移除、零副作用。 */
    try{ if(window._msBattleBackdropWd){ clearInterval(window._msBattleBackdropWd); } }catch(_){}
    (function(){
      var _n = 0;
      window._msBattleBackdropWd = setInterval(function(){
        _n++;
        try{
          if(!window._msRealBattleActive || _n > 6){ clearInterval(window._msBattleBackdropWd); window._msBattleBackdropWd = null; return; }
          var _b = document.getElementById("mainstory-backdrop");
          if(_b){ _b.remove(); console.warn("🛡 [v4.91.0] 偵測到主線 backdrop 於實戰中殘留 → 已移除(防全黑)"); }
        }catch(_){}
      }, 1000);
    })();
    if(typeof fadeTransition === "function"){
      /* ★ v5.2.0 —— 引擎啟動例外的兜底戰敗設 forceSettle 旁路(讓偽結算守門放行此合法路徑) */
      fadeTransition(function(){ try{ advStartBattle(); }catch(_eS){ console.error("[主線戰鬥] advStartBattle 例外", _eS); try{ if(window._msBattleCtx) window._msBattleCtx.forceSettle = true; }catch(_eF1){} window._msBattleResult(false); } _msKickInteractiveTut(team); _msKickPetTut(team); }, 400);
    } else {
      try{ advStartBattle(); }catch(_eS2){ console.error("[主線戰鬥] advStartBattle 例外", _eS2); try{ if(window._msBattleCtx) window._msBattleCtx.forceSettle = true; }catch(_eF2){} window._msBattleResult(false); }
      _msKickInteractiveTut(team);
      _msKickPetTut(team);
    }
  }
  /* ★ v5.2.0 —— 主線戰鬥收場清戰場(老師回報「技能繼承顯示戰鬥中」根因②):
   *   一般冒險結算流程會清空 G.p1(advStartWinSequence「G.p1 清空前」快照即此慣例),但主線
   *   _msBattleResult 先前沒清 → 打完主線後 G.p1/G.p2 殘留存活英雄 → _isInBattleNow() 恆 true
   *   → 技能繼承與所有「戰鬥中?」判定被誤鎖。清空點刻意選在「勝利卡收尾 / 撤退離場」
   *   (戰鬥結束數秒後),避開結算瞬間仍在跑的傷害鏈殘餘計時器;「再挑戰一次」路徑走
   *   _msStartRealBattle 整組重建不受影響。 */
  function _msClearBattleField(){
    try{
      if(typeof G !== "undefined" && G){ G.p1 = []; G.p2 = []; G.turnOrder = []; }
    }catch(_){}
  }
  // ── 結算(唯一入口·由三處守門改派;照 _wbCleanupAdvAfterBattle 收場)──
  window._msBattleResult = function(win){
    var ctx = window._msBattleCtx;
    if(!ctx || ctx.settled) return;   // 冪等:48+ 呼叫點 race 只認第一次
    /* ★ v5.2.0 —— 偽結算守門(老師回報「ch6 黑暗球一進戰鬥就結束」防護網):
     *   三結算入口(_showResultWithDrama / advShowBattleResult / advFinishMiniBattle)的 mainstory
     *   攔截(v4.89.0)排在所有去重/battleId 守門「之前」——任何殘留計時器/前一場鏈路的散逸
     *   結算呼叫,只要在新戰鬥剛開場(含 BOSS 出場動畫的十餘秒空窗)打進來,都會直接把新 ctx
     *   結掉 = 一進戰鬥就結束。合法結算的鐵性質:勝利時敵方必已全滅(checkWin 唯一勝點·主BOSS
     *   死小怪投降也是先全清 0 才派發;敵人逃光清場則 p2.length===0 不在本守門範圍);戰敗時
     *   我方必已受創(全滅),唯一例外=advStartBattle 啟動例外的兜底戰敗(走 ctx.forceSettle 旁路)。
     *   不符鐵性質者 = 散逸呼叫 → console.error 印呼叫堆疊供追根因,拒絕受理讓真戰鬥繼續。
     *   正常對戰中雙方 HP 必有變化,本守門對正常勝敗零影響。 */
    try{
      var _sgP1 = (typeof G !== "undefined" && G && Array.isArray(G.p1)) ? G.p1 : null;
      var _sgP2 = (typeof G !== "undefined" && G && Array.isArray(G.p2)) ? G.p2 : null;
      if(win === true && _sgP2 && _sgP2.length > 0 && _sgP2.some(function(h){ return h && h.curHp > 0; })
         && _sgP1 && _sgP1.some(function(h){ return h && h.curHp > 0; })){
        console.error("🛡 [主線偽結算守門 v5.2.0] 收到 win=true 但敵方仍有 "
          + _sgP2.filter(function(h){ return h && h.curHp > 0; }).length
          + " 隻存活 → 判定為殘留結算呼叫,拒絕受理(戰鬥照常進行)。呼叫堆疊:", (new Error()).stack);
        return;
      }
      if(win === false && !ctx.forceSettle && _sgP1 && _sgP1.length > 0 && _sgP2 && _sgP2.length > 0
         && _sgP1.every(function(h){ return h && h.curHp === h.hp; })
         && _sgP2.every(function(h){ return h && h.curHp === h.hp; })){
        console.error("🛡 [主線偽結算守門 v5.2.0] 收到 win=false 但雙方皆滿血未接戰 "
          + "→ 判定為殘留結算呼叫,拒絕受理(戰鬥照常進行)。呼叫堆疊:", (new Error()).stack);
        return;
      }
    }catch(_eSpurGuard){}
    ctx.settled = true;
    try{ if(window._advAllDeadWatchdog){ clearInterval(window._advAllDeadWatchdog); window._advAllDeadWatchdog = null; } }catch(_){}
    try{ if(window._showResultWatchdog){ clearTimeout(window._showResultWatchdog); window._showResultWatchdog = null; } }catch(_){}
    window._msRealBattleActive = false;
    /* ★ v4.91.0 —— 清主線馴養教學旗標與未用完的寵物卡預約(絕不殘留到冒險關) */
    try{ window._msTameTut = null; window._pendingEventPet = null; }catch(_){}
    /* ★ v4.91.1 —— 完整收掉實戰引導教學(遮罩/手指/訊息條/稱讚卡 + ★停掉 250ms 輪詢★)。
     *   用 _tutInterSkip 而非 _tutInterClearAll:後者不會 clearInterval,教學輪詢會殘留下去。 */
    try{ if(typeof _tutInterSkip === "function") _tutInterSkip(); }catch(_){}
    /* ★ v4.92.0 —— 一併收掉主線寵物馴養手指教學(遮罩/手指/訊息條 + 停輪詢) */
    try{ if(typeof _msPetTutStop === "function") _msPetTutStop(); }catch(_){}
    try{ if(window._msBattleBackdropWd){ clearInterval(window._msBattleBackdropWd); window._msBattleBackdropWd = null; } }catch(_){}
    try{
      _adventureMode = false;
      _adventureStage = null;
      _advMiniBattleActive = false;
      if(typeof _advQuizPhase !== "undefined") _advQuizPhase = "idle";
      if(typeof _advQuizResolveCb !== "undefined") _advQuizResolveCb = null;
    }catch(_){}
    try{ if(typeof G !== "undefined" && G) G._resultShown = true; }catch(_){}
    try{ localStorage.removeItem("adv_battle_snap"); localStorage.removeItem("adv_crash_snapshot"); }catch(_){}
    try{ if(typeof bgmStop === "function") bgmStop(); }catch(_){}
    try{
      var gc = document.getElementById("gc");
      if(gc) gc.classList.remove("adv-battle");
      var qo = document.getElementById("adv-quiz-overlay"); if(qo) qo.classList.remove("show");
      var co = document.getElementById("adv-continue-overlay"); if(co) co.classList.remove("show");
    }catch(_){}
    /* ★ v4.91.0 —— 還原「進戰鬥時被隱藏的全部主線圖層」(舊碼只還原 overlay 一層) */
    _msShowStoryLayers();
    var ov = document.getElementById("mainstory-overlay");
    try{ if(ov) ov.style.display = ""; }catch(_){}
    try{ if(typeof _msEnsureBackdrop === "function") _msEnsureBackdrop(); }catch(_){}
    try{ if(ctx.ambBack) _msStartAmb(ctx.ambBack); }catch(_){}
    setTimeout(function(){
      if(win) _msShowRealWin(ctx);
      else _msShowRetry(ctx);
    }, 480);
  };
  // ── 勝利卡 + 獎勵(冪等)+ 首次技能書 → 強化教學指路 ──
  function _msShowRealWin(ctx){
    var team = _MS_BATTLE_TEAMS[ctx.key] || { exp: 0 };
    /* ★ v5.2.0(老師需求)—— 獎勵值改「依魔物原設定」:
     *   EXP = ctx.enemyExp(_msStartRealBattle 快照的 Σ_calcBaseExpFromName(敵名),每位出戰英雄各得全額,
     *   對齊冒險小怪戰「每位出戰英雄各得 baseExp」既有口徑);知識幣 = EXP×0.3(對齊 _miniCoins 口徑)。
     *   舊固定值 team.exp 保留當兜底(快照缺失/為 0 時)。冪等仍綁 _r_bt_{key}(mainStoryProgress →
     *   localStorage lxps_mainstory_{uid} + 雲端同一份,綁 UID),回顧重打/換裝置皆不重複發放。 */
    var _rwExp = (ctx && ctx.enemyExp && ctx.enemyExp > 0) ? ctx.enemyExp : (team.exp || 0);
    var _rwCoins = Math.round(_rwExp * 0.3);
    var flagKey = "bt_" + ctx.key;
    var first = !_msRewardFlagGet(flagKey);
    var lvUps = [];
    if(first){
      try{
        (ctx.usedNames || []).forEach(function(nm){
          try{
            /* ★ v5.2.0 —— team.exp 固定值改 _rwExp(魔物原設定)。舊碼保留備查(誤刪是大忌):
             *   var ups = (typeof addHeroExp === "function") ? addHeroExp(nm, team.exp || 0) : []; */
            var ups = (typeof addHeroExp === "function") ? addHeroExp(nm, _rwExp) : [];
            if(ups && ups.length) ups.forEach(function(u){ lvUps.push(u); });
          }catch(_eE){ console.warn("[主線戰鬥] 發 EXP 例外", nm, _eE); }
        });
        try{ if(typeof backpackAdd === "function") backpackAdd("skill_upgrade_book", 1); }catch(_eB){ console.warn("[主線戰鬥] 發技能書例外", _eB); }
        /* ★ v5.2.0 —— 首勝加發知識幣(走既有 addKnowledgeCoins·同受 _r_bt_ 冪等旗標保護) */
        try{ if(_rwCoins > 0 && typeof addKnowledgeCoins === "function") addKnowledgeCoins(_rwCoins); }catch(_eC){ console.warn("[主線戰鬥] 發知識幣例外", _eC); }
        _msRewardFlagSet(flagKey);
        try{
          if(typeof window._lxpsInstantPersist === "function") window._lxpsInstantPersist("主線戰鬥獎勵");
          else if(typeof gameCloudSave === "function") gameCloudSave();
        }catch(_){}
      }catch(_eR){ console.warn("[主線戰鬥] 發獎例外", _eR); }
    }
    var wrap = document.createElement("div");
    wrap.id = "ms-battle-fx";
    wrap.style.cssText = "position:fixed;inset:0;z-index:9860;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 44%,rgba(28,38,26,0.82),rgba(6,4,16,0.95));opacity:0;transition:opacity 0.4s;";
    document.body.appendChild(wrap);
    requestAnimationFrame(function(){ wrap.style.opacity = "1"; });
    var box = document.createElement("div");
    box.style.cssText = "text-align:center;padding:0 20px;max-height:88vh;overflow-y:auto;-webkit-overflow-scrolling:touch;cursor:pointer;";
    var t1 = document.createElement("div");
    t1.textContent = "🎉 " + _msT("戰鬥勝利!", "打贏啦!");
    t1.style.cssText = "font-size:54px;font-weight:900;color:#ffe08a;letter-spacing:5px;text-shadow:0 0 30px rgba(255,210,90,0.75);";
    box.appendChild(t1);
    var rw = document.createElement("div");
    rw.style.cssText = "margin-top:16px;font-size:24px;line-height:1.8;color:#fff;font-weight:700;";
    if(first){
      /* ★ v5.2.0 —— 顯示改魔物原設定 EXP + 新增知識幣列。舊碼保留備查(誤刪是大忌):
       *   rw.innerHTML = "⚔ " + _msT("全隊經驗值", "大家的經驗值") + " <b ...>+" + (team.exp || 0) + "</b><br>" + 技能書列; */
      rw.innerHTML = "⚔ " + _msT("全隊經驗值", "大家的經驗值") + " <b style=\"color:#9fe6a0;\">+" + _rwExp + "</b><br>"
        + "💰 " + _msT("知識幣", "知識幣") + " <b style=\"color:#ffd44a;\">+" + _rwCoins + "</b><br>"
        + "📕 " + _msT("技能升級書", "技能升級書") + " <b style=\"color:#ffd98a;\">×1</b>";
      if(lvUps.length){
        var seen = {}, arr = [];
        lvUps.forEach(function(u){ if(u && u.name){ seen[u.name] = u.lv; } });
        for(var nmK in seen){ if(Object.prototype.hasOwnProperty.call(seen, nmK)) arr.push("🌟 " + _msDispHeroName(nmK) + " Lv" + seen[nmK]); }
        if(arr.length){
          var lu = document.createElement("div");
          lu.style.cssText = "margin-top:10px;font-size:20px;color:#aef0b0;font-weight:800;";
          lu.textContent = _msT("升級!", "升級囉!") + " " + arr.join("　");
          rw.appendChild(lu);
        }
      }
    } else {
      rw.textContent = _msT("本場獎勵先前已領取,這次不重複發放。", "獎勵之前領過囉,這次不會再給一次!");
    }
    box.appendChild(rw);
    var hint = document.createElement("div");
    hint.textContent = _msT("(點畫面繼續)", "(點一下繼續)");
    hint.style.cssText = "margin-top:18px;font-size:17px;color:#c8d4e8;font-weight:600;";
    box.appendChild(hint);
    wrap.appendChild(box);
    try{ if(typeof playSfx === "function") playSfx("sfx-applause", 0.6); }catch(_){}
    var done = false;
    var finish = function(){
      if(done) return; done = true;
      try{ wrap.style.opacity = "0"; }catch(_){}
      setTimeout(function(){
        try{ wrap.remove(); }catch(_){}
        try{ _msClearBattleField(); }catch(_){}   // ★ v5.2.0 勝利收尾清戰場(解 PGI 誤鎖)
        // 首次拿到技能升級書 → 強化教學指路卡(全帳號一次·沿用既有 HUT,不新寫教學)
        if(first && !_msRewardFlagGet("bt_bookteach")){
          _msRewardFlagSet("bt_bookteach");
          _msShowBookTeach(function(){ if(ctx.onDone) ctx.onDone(); });
        } else {
          if(ctx.onDone) ctx.onDone();
        }
      }, 400);
    };
    wrap.onclick = finish;
    setTimeout(finish, 6000);
  }
  // ── 強化教學指路卡(乙案沿用既有 HUT:只指路,不重寫教學;HUT 首次進英雄頁會自動詢問)──
  function _msShowBookTeach(onDone){
    var wrap = document.createElement("div");
    wrap.id = "ms-battle-fx";
    wrap.style.cssText = "position:fixed;inset:0;z-index:9860;display:flex;align-items:center;justify-content:center;background:rgba(6,4,16,0.92);opacity:0;transition:opacity 0.4s;";
    document.body.appendChild(wrap);
    requestAnimationFrame(function(){ wrap.style.opacity = "1"; });
    var card = document.createElement("div");
    card.style.cssText = "max-width:720px;width:94vw;margin:0 12px;padding:26px 26px 22px;border-radius:24px;background:linear-gradient(135deg,rgba(16,30,54,0.98),rgba(24,20,60,0.98));border:3px solid rgba(120,200,255,0.85);box-shadow:0 0 44px rgba(90,170,255,0.45);text-align:center;max-height:88vh;overflow-y:auto;-webkit-overflow-scrolling:touch;";
    var tag = document.createElement("div");
    tag.textContent = "📕 " + _msT("你獲得了「技能升級書」!", "你拿到「技能升級書」了!");
    tag.style.cssText = "font-size:28px;font-weight:900;color:#ffd98a;letter-spacing:2px;margin-bottom:12px;";
    card.appendChild(tag);
    var txt = document.createElement("div");
    txt.style.cssText = "text-align:left;max-width:600px;margin:0 auto 16px;font-size:18px;line-height:1.85;color:#e8f2ff;font-weight:600;";
    txt.innerHTML = _msT(
      "打贏戰鬥獲得的經驗值會讓英雄升級,每升 1 級就有 1 點「素質點數」可以自由投資到 HP、攻擊、特技或速度;而「技能升級書」則能把英雄的技能升級,讓招式威力更上一層樓!<br><br>👉 想試試看嗎?到「英雄圖鑑」點選任何一位英雄,再按「📘 英雄強化教學」,會有完整的一步步教學帶你操作!",
      "打贏會拿到經驗值,英雄升級後有「素質點數」可以加強 HP、攻擊、特技或速度;「技能升級書」可以讓招式變更強!<br><br>👉 到「英雄圖鑑」點任何一位英雄,再按「📘 英雄強化教學」,就會一步一步教你怎麼用喔!");
    card.appendChild(txt);
    var ok = document.createElement("button");
    ok.textContent = "✔ " + _msT("知道了!", "好喔!");
    ok.style.cssText = "padding:12px 34px;font-size:23px;font-weight:900;letter-spacing:2px;border:none;border-radius:15px;color:#fff;cursor:pointer;touch-action:manipulation;background:linear-gradient(135deg,#44a0ff,#7b6bff);";
    ok.onclick = function(){
      try{ if(typeof playSfx === "function") playSfx("sfx-confirm2", 0.5); }catch(_){}
      try{ wrap.style.opacity = "0"; }catch(_){}
      setTimeout(function(){ try{ wrap.remove(); }catch(_){} if(onDone) onDone(); }, 380);
    };
    card.appendChild(ok);
    wrap.appendChild(card);
  }
  // ── 戰敗重打視窗(Q4 甲/Q7 乙:只重打該場·不接關·撤退回章節選單且該章不算通關)──
  function _msShowRetry(ctx){
    var wrap = document.createElement("div");
    wrap.id = "ms-battle-fx";
    wrap.style.cssText = "position:fixed;inset:0;z-index:9860;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 44%,rgba(48,18,26,0.85),rgba(6,4,16,0.96));opacity:0;transition:opacity 0.4s;";
    document.body.appendChild(wrap);
    requestAnimationFrame(function(){ wrap.style.opacity = "1"; });
    var box = document.createElement("div");
    box.style.cssText = "text-align:center;padding:0 20px;";
    var t1 = document.createElement("div");
    t1.textContent = "💫 " + _msT("這次沒能取勝……", "哎呀,這次沒打贏……");
    t1.style.cssText = "font-size:42px;font-weight:900;color:#ff9a9a;letter-spacing:3px;text-shadow:0 0 24px rgba(255,120,120,0.6);";
    box.appendChild(t1);
    var t2 = document.createElement("div");
    t2.textContent = _msT("沒關係,調整心情再挑戰一次!戰敗不會有任何損失。", "沒關係!再試一次就好,輸了也不會少東西喔!");
    t2.style.cssText = "margin-top:14px;font-size:22px;line-height:1.7;color:#fff;font-weight:600;";
    box.appendChild(t2);
    var bar = document.createElement("div");
    bar.style.cssText = "margin-top:24px;display:flex;gap:14px;justify-content:center;flex-wrap:wrap;";
    var retry = document.createElement("button");
    retry.textContent = "💪 " + _msT("再挑戰一次", "再打一次!");
    retry.style.cssText = "padding:13px 32px;font-size:24px;font-weight:900;letter-spacing:2px;border:none;border-radius:15px;color:#fff;cursor:pointer;touch-action:manipulation;background:linear-gradient(135deg,#ff9a3c,#ff6ab0);";
    retry.onclick = function(){
      try{ if(typeof playSfx === "function") playSfx("sfx-confirm2", 0.5); }catch(_){}
      try{ wrap.style.opacity = "0"; }catch(_){}
      setTimeout(function(){ try{ wrap.remove(); }catch(_){} _msStartRealBattle(ctx.key, ctx.onDone); }, 380);
    };
    bar.appendChild(retry);
    var leave = document.createElement("button");
    leave.textContent = "↩ " + _msT("暫時撤退", "先休息一下");
    leave.style.cssText = "padding:13px 28px;font-size:21px;font-weight:800;letter-spacing:2px;border:2px solid rgba(180,190,220,0.7);border-radius:15px;color:#cdd6e8;cursor:pointer;touch-action:manipulation;background:rgba(50,50,80,0.45);";
    leave.onclick = function(){
      try{ if(typeof playSfx === "function") playSfx("sfx-cancel", 0.5); }catch(_){}
      try{ wrap.style.opacity = "0"; }catch(_){}
      setTimeout(function(){
        try{ wrap.remove(); }catch(_){}
        try{ _msClearBattleField(); }catch(_){}   // ★ v5.2.0 撤退離場清戰場(解 PGI 誤鎖)
        // 撤退:本章不算通關(進度不落 done),回章節選單;下次進章節可重新挑戰(可用⏭快速跳到戰鬥)
        try{ window._msSkipChapter = true; }catch(_){}
        /* ★ v4.89.0(第二版)撤退時 _msRunChapter 的 done() 不會執行 → 回顧旗標不會被清。
         *   雖然下一次 _msRunChapter 開頭就會重設,仍在此主動歸零(零殘留·防任何中途讀取誤判)。 */
        try{ window._msReviewMode = false; }catch(_){}
        try{ var o1 = document.getElementById("mainstory-overlay"); if(o1) o1.remove(); }catch(_){}
        try{ var o2 = document.getElementById("mainstory-overlay-prev"); if(o2) o2.remove(); }catch(_){}
        try{ if(typeof _msStopAmb === "function") _msStopAmb(); }catch(_){}
        try{ if(typeof _msRemoveBackdrop === "function") _msRemoveBackdrop(); }catch(_){}
        setTimeout(function(){
          try{ window._msSkipChapter = false; }catch(_){}
          try{ if(typeof window._msOpenChapterSelect === "function") window._msOpenChapterSelect(); }catch(_eSel){}
        }, 120);
      }, 380);
    };
    bar.appendChild(leave);
    box.appendChild(bar);
    wrap.appendChild(box);
    try{ if(typeof playSfx === "function") playSfx("sfx-cancel", 0.5); }catch(_){}
  }
  // ── 新版 _msActBattle:真實戰鬥分派 ──
  //   ★★ v4.89.0(第二版·老師 2026-07-24 指示)——「回顧主線劇情時也要體驗完整的戰鬥過程」。
  //     舊行為(第一版)是「回顧模式一律走純演出版」→ 老師回顧時只看得到簡化演出,無法真的進戰鬥畫面。
  //     新行為:回顧模式改用既有的 _msReviewOptionalAct 詢問視窗(與造型工房/名片/教學同一顆),
  //     預設引導「⚔️ 完整戰鬥」= 進正式戰鬥畫面(指揮夥伴/答題/技能/極限爆發/法寶/打倒對手,與首次遊玩完全相同);
  //     玩家若選「▶ 只看演出」才走簡化版 _msActBattleShow。
  //     ★ 獎勵安全:真實戰鬥的發獎綁 _r_bt_{key} 冪等旗標 → 回顧再打一次不會重複發 EXP/技能書
  //       (勝利卡會明示「本場獎勵先前已領取」);若該場旗標從未落過(舊版演出通關的帳號),
  //       回顧打贏才第一次入帳,屬正確行為。
  //     ★ 首次遊玩不受影響:一律強制真實戰鬥(維持 v4.89.0 Q1~Q7 規格與獎勵完整性),不跳詢問視窗。
  //     ★ 純演出版 _msActBattleShow 自此只剩兩個用途:①玩家在回顧時選擇不打 ②戰鬥引擎缺失兜底。
  function _msActBattle(key, onDone){
    var d = _MS_BATTLE_DEFS[key];
    if(!d){ if(onDone) onDone(); return; }
    var team = _MS_BATTLE_TEAMS[key];
    var engineOk = false;
    try{
      engineOk = !!(team && typeof advStartBattle === "function" && typeof newHero === "function"
        && typeof G !== "undefined" && G && typeof _adventureMode !== "undefined");
    }catch(_){ engineOk = false; }
    if(!engineOk){ _msActBattleShow(key, onDone); return; }   // 引擎缺失兜底:絕不擋劇情
    var _goReal = function(){
      var wrap = document.createElement("div");
      wrap.id = "ms-battle-fx";
      wrap.style.cssText = "position:fixed;inset:0;z-index:9860;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 44%,rgba(48,18,26,0.78),rgba(6,4,16,0.95));opacity:0;transition:opacity 0.4s;";
      document.body.appendChild(wrap);
      requestAnimationFrame(function(){ wrap.style.opacity = "1"; });
      var toBattle = function(){
        try{ wrap.style.opacity = "0"; }catch(_){}
        setTimeout(function(){ try{ wrap.remove(); }catch(_){} _msStartRealBattle(key, onDone); }, 380);
      };
      try{
        _msBattleIntro(wrap, d, function(){
          var afterTut = function(){
            _msShowTeamCard(wrap, key, function(){
              if(team.teach){ _msShowElemCard(wrap, key, toBattle); }
              else { toBattle(); }
            });
          };
          /* ★★ v4.91.1(老師 2026-07-25 指示)—— 戰前 11 頁翻頁教學「取消」,改成進戰鬥後用
           *   遊戲既有的「實戰引導教學」(_startInteractiveTutorial:全畫面遮罩挖洞聚光 + 👆手指
           *   指著亮起來的按鈕 + 訊息條,一步一步跟著真的打)。
           *   理由:老師明確要求「不需要在前面把 11 頁講完才開始」——邊打邊學才學得會。
           *   ★ _msBattleTutorial() 函式本體「保留不刪」(誤刪是大忌):日後若要改回翻頁式,
           *     把下面這行換回 if(d.tut){ _msBattleTutorial(wrap, afterTut); } else { afterTut(); } 即可。
           *   實際啟動點在 _msStartRealBattle(advStartBattle 之後),見該處 tutInter 段。 */
          afterTut();
        });
      }catch(_eAct){
        console.error("[主線戰鬥] 前置演出例外,退回純演出", key, _eAct);
        try{ wrap.remove(); }catch(_){}
        _msActBattleShow(key, onDone);
      }
    };
    if(window._msReviewMode === true && typeof _msReviewOptionalAct === "function"){
      _msReviewOptionalAct("battle", null, _goReal, function(){ _msActBattleShow(key, onDone); });
      return;
    }
    _goReal();
  }

  // ★ v4.81.0 B7 — 回顧模式(🔁 回顧劇情)要略過的 act:
  //   舊行為是回顧一律重跑全部 act → 回顧序章會「再被強迫進造型工房捏一次臉」、再看一次名片;
  //   回顧第一章會再被 11 步戰鬥教學攔一次。玩家按回顧只是想重看故事,不該再被操作流程綁架。
  //   ★ 只略過「操作/教學類」;戰鬥演出、加入夥伴、發劍、黑幕轉場一律照播(那些是劇情的一部分)。
  var _MS_REVIEW_SKIP_ACTS = {
    open_avatar_studio: 1, set_card: 1,
    tutorial_king: 1, tutorial_levelup: 1, tutorial_shop: 1
  };
  /* ★★ v4.86.0 老師需求3 —— 「序章沒有正常出現造型工房」根因與修法
   *   根因:老師是用「🔁 回顧劇情」重看序章,而 v4.81.0(B7)把 open_avatar_studio / set_card
   *        列入回顧略過清單 → 回顧序章時工房與名片「依設計」被靜默跳過,看起來就像壞掉。
   *   修法(兩全):回顧模式不再靜默跳過這兩項,改彈一個小視窗讓玩家自己選——
   *        「要順便調整造型嗎?」→ 好 = 正常開工房(可進可出)/ 不用 = 直接續播。
   *        教學類(tutorial_*)維持靜默略過(那是操作流程,回顧不該再被攔)。
   *   ★ 首次遊玩(非回顧)完全不受影響:一律照舊強制開工房捏臉。 */
  /* ★★ v4.86.0 老師裁定「甲」(2026-07-23)—— 回顧模式的五個「操作/教學類」演出,
   *   全部由「靜默略過」改成「詢問是否觀看」(同一顆 _msReviewOptionalAct 小視窗)。
   *   ★ 為什麼不是直接照播:v4.81.0 老師原本的抱怨就是「回顧只想重看故事,不想再被操作流程攔」;
   *     改成詢問後,想複習的人按「好」照樣完整體驗,只想看故事的人按「不用」一秒跳過 → 兩邊都滿足。
   *   ★ 回顧內容自此 100% 完整:對白 / 造型工房 / 名片 / 三個系統教學 / 六場劇情戰鬥演出 /
   *     第一章戰鬥教學卡 / 夥伴加入大卡 / 發劍 / 主角覺醒 / 黑幕轉場 全部進得去也出得來。
   *   ★ 首次遊玩(非回顧)完全不受影響:一律照舊強制播,不會跳出這個詢問視窗。 */
  var _MS_REVIEW_OPT_TX = {
    open_avatar_studio: { icon:"👗",
      tp:"要順便調整造型嗎？", tc:"要順便換造型嗎？",
      dp:"這是回顧模式，可以自由決定要不要進造型工房；調整完關掉就會接著播劇情。",
      dc:"這是重看模式，可以自己決定要不要換造型；換好關掉就繼續看故事。",
      yp:"好，我要調整", yc:"好，我要換" },
    set_card:           { icon:"📇",
      tp:"要看一下冒險者名片嗎？", tc:"要看一下名片嗎？",
      dp:"看完名片按關閉，劇情就會接著播下去。",
      dc:"看完名片按關閉，故事就會繼續。",
      yp:"好，我要看", yc:"好，我要看" },
    tutorial_king:      { icon:"👑",
      tp:"要複習「認識魔王」的教學嗎？", tc:"要再看一次「認識魔王」嗎？",
      dp:"這是回顧模式，教學可看可跳；看完按下一步就會接著播劇情。",
      dc:"重看模式，教學可以看也可以跳過；看完就繼續看故事。",
      yp:"好，我要複習", yc:"好，我要看" },
    tutorial_levelup:   { icon:"⬆️",
      tp:"要複習「英雄升級」的教學嗎？", tc:"要再看一次「英雄怎麼變強」嗎？",
      dp:"這是回顧模式，教學可看可跳；看完按下一步就會接著播劇情。",
      dc:"重看模式，教學可以看也可以跳過；看完就繼續看故事。",
      yp:"好，我要複習", yc:"好，我要看" },
    tutorial_shop:      { icon:"🏪",
      tp:"要複習「商店補給」的教學嗎？", tc:"要再看一次「商店怎麼買」嗎？",
      dp:"這是回顧模式，教學可看可跳；看完按下一步就會接著播劇情。",
      dc:"重看模式，教學可以看也可以跳過；看完就繼續看故事。",
      yp:"好，我要複習", yc:"好，我要看" },
    /* ★★ v4.89.0(第二版)老師指示:回顧也要能完整打一場真實戰鬥。
     *   np/nc = 「不要」鈕的自訂文字(未給則沿用預設「不用，繼續劇情」·舊條目零影響)。 */
    battle:             { icon:"⚔️",
      tp:"這一場要完整打一次嗎？", tc:"這一場要自己打嗎？",
      dp:"回顧模式一樣可以進入正式戰鬥畫面：親自指揮夥伴、答題、施放技能與極限爆發、使用法寶，把對手打倒。獎勵先前已領過不會重複發放，打輸也沒有任何損失，可以放心練習。",
      dc:"重看也可以真的打一場喔！自己出招、答題、用法寶打倒對手。獎勵之前領過不會再給一次，輸了也不會少東西。",
      yp:"好，我要完整打一場", yc:"好，我要打！",
      np:"只看演出，不打", nc:"只看一下就好" }
  };
  function _msReviewOptionalAct(act, ov, runFn, done){
    var _fired = false;
    var _pick = function(yes){
      if(_fired) return; _fired = true;
      try{ var m = document.getElementById("ms-review-opt"); if(m) m.remove(); }catch(_){}
      if(yes){ try{ runFn(); return; }catch(e){ console.error("[主線 回顧可選 act]", act, e); } }
      done();
    };
    try{
      var tx = _MS_REVIEW_OPT_TX[act] || _MS_REVIEW_OPT_TX.open_avatar_studio;
      var box = document.createElement("div");
      box.id = "ms-review-opt";
      box.style.cssText = "position:fixed;inset:0;z-index:19990;display:flex;align-items:center;justify-content:center;"
        + "background:rgba(0,0,0,0.72);font-family:'M PLUS Rounded 1c','Nunito',sans-serif;";
      box.innerHTML =
        "<div style=\"width:min(92vw,640px);background:linear-gradient(160deg,#20184a,#141028);border:3px solid rgba(160,200,255,0.7);"
        + "border-radius:22px;padding:34px 30px;text-align:center;box-shadow:0 0 44px rgba(120,160,255,0.4);\">"
        + "<div style=\"font-size:52px;margin-bottom:10px;\">" + tx.icon + "</div>"
        + "<div style=\"font-size:30px;font-weight:900;color:#ffd98a;letter-spacing:1px;margin-bottom:10px;\">"
        + _msT(tx.tp, tx.tc) + "</div>"
        + "<div style=\"font-size:20px;color:#cfe4ff;line-height:1.6;margin-bottom:22px;\">"
        + _msT(tx.dp, tx.dc) + "</div>"
        + "<div style=\"display:flex;gap:14px;justify-content:center;flex-wrap:wrap;\">"
        + "<button id=\"ms-ro-yes\" style=\"padding:14px 30px;font-size:23px;font-weight:900;border-radius:16px;border:none;cursor:pointer;"
        + "color:#fff;background:linear-gradient(135deg,#ff9a3c,#ff6ab0);touch-action:manipulation;\">"
        + (tx.icon + " " + _msT(tx.yp, tx.yc)) + "</button>"
        + "<button id=\"ms-ro-no\" style=\"padding:14px 30px;font-size:23px;font-weight:900;border-radius:16px;border:2px solid rgba(160,200,255,0.5);cursor:pointer;"
        + "color:#cfe4ff;background:rgba(255,255,255,0.08);touch-action:manipulation;\">"
        + "▶ " + _msT(tx.np || "不用，繼續劇情", tx.nc || "不用，繼續看") + "</button>"
        + "</div></div>";
      document.body.appendChild(box);
      var yb = document.getElementById("ms-ro-yes"); if(yb) yb.onclick = function(){ try{ if(typeof playSfx==="function") playSfx("sfx-confirm",0.5); }catch(_){} _pick(true); };
      var nb = document.getElementById("ms-ro-no");  if(nb) nb.onclick = function(){ try{ if(typeof playSfx==="function") playSfx("sfx-sel",0.5); }catch(_){} _pick(false); };
      setTimeout(function(){ _pick(false); }, 120000);   /* 兜底:2 分鐘沒選 → 續播不卡死 */
    }catch(e){ console.error("[主線 回顧可選視窗]", act, e); _pick(false); }
  }
  function _msRunAct(act, chId, ov, onDone){
    var done = function(){ try{ if(onDone) onDone(); }catch(e){ console.error("[主線 act done]", e); } };
    if(!act){ done(); return; }
    try{
      if(window._msReviewMode === true && _MS_REVIEW_SKIP_ACTS[act]){
        /* ★ v4.86.0 老師裁定甲:五個操作/教學類 act 一律改「詢問是否觀看」(不再靜默略過) */
        if(act === "open_avatar_studio"){ _msReviewOptionalAct(act, ov, function(){ _msActOpenStudio(ov, done); }, done); return; }
        if(act === "set_card"){          _msReviewOptionalAct(act, ov, function(){ _msActSetCard(done); }, done); return; }
        if(act === "tutorial_king"){     _msReviewOptionalAct(act, ov, function(){ _msActTutorial("king", done); }, done); return; }
        if(act === "tutorial_levelup"){  _msReviewOptionalAct(act, ov, function(){ _msActTutorial("levelup", done); }, done); return; }
        if(act === "tutorial_shop"){     _msReviewOptionalAct(act, ov, function(){ _msActTutorial("shop", done); }, done); return; }
        done(); return;   /* 保留:日後若再有 act 進 _MS_REVIEW_SKIP_ACTS 而未給文案 → 維持略過不卡 */
      }
    }catch(_){}
    try{
      switch(act){
        case "open_avatar":        done(); return;                    // 純對白鋪陳(工房在 open_avatar_studio 開)
        case "open_avatar_studio": _msActOpenStudio(ov, done); return;
        case "set_card":           _msActSetCard(done); return;
        case "blackout":           _msActBlackout(done); return;
        // ★ v4.81.0 B1 — 序章/第一章/第二章這八位 = _ARENA_INITIAL_HEROES 初始 8 隻(建帳號即贈),
        //   本來就擁有 → newSet 傳空物件,大卡走「🤝 夥伴加入隊伍」樣式,不會誤導成拿到新角色。
        case "join_prologue":      _msActJoin(["小劇團員", "直笛團員", "弦樂團員", "動物學家"], done, {}); return;
        case "join_ch1":           _msActJoin(["籃球隊員", "田徑隊員"], done, {}); return;
        case "join_ch2":           _msActJoin(["程式設計師", "電腦繪圖師"], done, {}); return;
        // ★ v4.81.0 B2 — 第三、四章是真的會發夥伴:演出「之前」先入帳(冪等·旗標 hero_ch3 / hero_ch4),
        //   回傳的 newly 才是本次真正新解鎖的(玩家若早就抽到劍士,大卡就走「原本就有」樣式不誤導)。
        //   回顧模式不重發(旗標早已落),newly 自然為空陣列。
        case "join_ch3": {
          var _n3 = {}; try{ _msGrantStoryHeroes("ch3").forEach(function(x){ _n3[x] = 1; }); }catch(_){}
          _msActJoin(["劍士", "祭司"], done, _n3); return;
        }
        case "join_ch4": {
          var _n4 = {}; try{ _msGrantStoryHeroes("ch4").forEach(function(x){ _n4[x] = 1; }); }catch(_){}
          _msActJoin(["守衛", "刺客", "火法師"], done, _n4); return;
        }
        case "tutorial_king":      _msActTutorial("king", done); return;      // ★ v4.72.0 認識魔王
        case "tutorial_levelup":   _msActTutorial("levelup", done); return;   // ★ v4.72.0 英雄升級
        case "tutorial_shop":      _msActShopLive(done); return;              // ★ v4.97.0 商店實戰教學(完成過/環境不齊 → 退回 v4.72.0 靜態卡)
        case "grant_sword_tutorial": _msActGrantSword(done); return;          // ★ v4.72.0 發劍演出
        case "awaken_hero":                                                   // ★ A2(2026-07-21) 主角覺醒:R→SSR·持久化上雲(avatarCard.protagAwakened)
          try{
            if(typeof window._lxpsSetProtagAwakened === "function"){
              var _apw = window._lxpsSetProtagAwakened(true);               // 記憶體旗標+本機+雲端(fire-and-forget·不擋續播)
              if(_apw && typeof _apw.catch === "function") _apw.catch(function(){});
            } else { window._protagAwakened = true; }                        // 退路:setter 未載入時至少設記憶體旗標
          }catch(_awErr){ try{ window._protagAwakened = true; }catch(__){} }
          // ★★ v4.83.0 老師需求2 —— 覺醒 SSR 後一樣亮出「解鎖的獎勵視窗」
          //   沿用 v4.79.0 主線夥伴解鎖大卡 _msActJoin(立繪+名稱+技能+Ὂ5極限爆發·規格同抽卡預覽)，
          //   以「主角‧覺醒」(SSR 別名)為主角，並標成 NEW。
          //   ★ 先刷一次立繪，確保大卡上看到的是玩家自己捷的臉，而不是★星星佔位圖。
          //   ★ _msActJoin 不存在(舊版本)→ 直接 done() 續播，絕不擋劇情。
          try{ if(typeof window._lxpsProtagPortraitRefresh === "function") window._lxpsProtagPortraitRefresh(); }catch(_awP){}
          try{
            var _awName = window._PROTAG_SSR_NAME || "主角‧覺醒";
            if(typeof _msActJoin === "function"){
              var _awNew = {}; _awNew[_awName] = 1;
              _msActJoin([_awName], done, _awNew); return;
            }
          }catch(_awJ){ console.warn("[主線] 覺醒獎勵視窗失敗", _awJ); }
          done(); return;
        case "battle_ch1_1":                                                  // ★ v4.78.0 教學引導戰鬥(甲案·六場全接線)
        case "battle_ch1_2":
        case "battle_ch3_boss":
        case "battle_ch4_boss":
        case "battle_ch5_boss":
        case "battle_ch6_boss":     _msActBattle(act, done); return;
        default:                   done(); return;                    // 未知 act → 直接續播(不擋劇情)
      }
    }catch(e){ console.error("[主線 act 分派內]", act, e); done(); }
  }

  // 播一個 scene:先(可選)影片→背景圖+打字機對白;完成呼叫 onDone
  function _msPlayScene(scene, chId, onDone){
    if(!scene){ if(onDone) onDone(); return; }
    var bg = scene.img ? _msAsset(scene.img) : "";
    try{ if(scene.amb) _msStartAmb(scene.amb); }catch(_){}  // ★ v4.70.0 場景環境音(有 amb 才切·同 amb 連續播·離場統一停)
    try{
      if(scene.bgm === "none"){                                       // ★ v4.73.0 取消BGM只保留環境音(bgmStop 不碰 amb 動態 Audio)
        if(window._msCurBgm !== "none"){ try{ if(typeof bgmStop==="function") bgmStop(); }catch(_){} window._msCurBgm = "none"; }
      } else if(scene.bgm && scene.bgm !== window._msCurBgm){ if(typeof bgmFadeTo==="function") bgmFadeTo(scene.bgm, 800); window._msCurBgm = scene.bgm; }
    }catch(_){}  // ★ v4.71.0 逐場景 BGM(換背景圖即淡入淡出換曲)·v4.73.0 加 none=停BGM
    _msEnsureBackdrop();                                   // ★ v4.68.1 常駐黑底(防切換空檔露出關卡頁)
    // ★ v4.68.1 連貫切換:舊場景改名保留(不立即移除),待新場景圖就緒→淡入交叉→再移除舊場景
    try{ var _stalePrev = document.getElementById("mainstory-overlay-prev"); if(_stalePrev) _stalePrev.remove(); }catch(_){}  // 清殘留舊場景防疊加
    var old = document.getElementById("mainstory-overlay");
    if(old){
      /* ★ v4.86.0 需求3 —— 舊場景 overlay 保留當交叉淡出圖層期間,必須先拔掉它的點擊處理器與
       *   滑鼠指標樣式;否則那 480ms 內誤觸會呼叫「上一個場景的 _msAdvance 殘留閉包」,
       *   表現就是玩家看到對白瞬間被跳掉。 */
      try{ old.onclick = null; old.style.pointerEvents = "none"; old.style.cursor = "default"; }catch(_){}
      /* ★★ v4.89.0 根治「對白只顯示說話者、內容空白」:舊場景留在 DOM 當交叉淡出圖層期間,
       *   它裡面的 ms-dlg-text / ms-prev-btn / ms-next-btn 會與新場景「id 重複」,
       *   document.getElementById 依文件順序回傳舊的那顆 → 新場景的打字機打進看不見的舊框,
       *   480ms 後舊框被移除更變成孤兒節點,那句話永遠不會出現。
       *   這裡把舊 overlay 內所有 id 一次拔掉(它已不吃點擊、只剩淡出用途,拔 id 零副作用)。 */
      try{
        var _oldIded = old.querySelectorAll("[id]");
        for(var _oi = 0; _oi < _oldIded.length; _oi++){ try{ _oldIded[_oi].removeAttribute("id"); }catch(_){} }
      }catch(_){}
      try{ old.id = "mainstory-overlay-prev"; }catch(_){ try{ old.remove(); }catch(__){} }
    }
    var ov = document.createElement("div");
    ov.id = "mainstory-overlay";
    ov.style.cssText =
      "position:fixed;inset:0;z-index:" + _MS_Z + ";cursor:pointer;opacity:0;transition:opacity 0.45s;" +
      (bg ? ("background:url(\"" + bg + "\") center center/cover no-repeat,") : "background:") +
      "linear-gradient(180deg,rgba(10,6,24,0.55),rgba(10,6,24,0.85)),#0a0618;" +   // ★ 末層不透明底色·防載入中透出
      "display:flex;flex-direction:column;align-items:center;justify-content:flex-end;" +
      "font-family:'M PLUS Rounded 1c','Nunito',sans-serif;";

    var lines = (scene.lines && scene.lines.length) ? scene.lines : [];
    // 影片插槽:有 video 才建;缺檔(onerror)靜默移除只走對白;播完/跳過→顯示對白或直接 onDone
    var _dialogStarted = false;
    // ★ v4.81.0 A3 — 本場景作廢旗標(按「⏭ 跳過演出」即設)。
    //   根因:舊版跳過只做 ov.remove(),沒清打字機 interval、也沒取消影片的 6 秒兜底計時器
    //        → 影片場景(序章覺醒/第六章覺醒)按跳過後 6 秒,_vFin()→startDialog()→finish() 仍會跑起來,
    //          把已經結束章節的 scene.act(覺醒/戰鬥演出)整個叫出來蓋在章節選單上。
    //   修法:finish/startDialog 開頭一律檢查此旗標與全域 _msSkipChapter,作廢就完全不動作。
    var _scAbort = false;
    var _finished = false;                                  // ★ v4.81.0 丙案 — finish 冪等(快轉與自然播完可能撞在一起)
    var _scDead = function(){ try{ return _scAbort || window._msSkipChapter === true; }catch(_){ return _scAbort; } };
    var _scStopMedia = function(){                          // ★ v4.81.0 丙案 — 快轉時把影片/打字機/持續音一次收乾淨
      try{ if(typeTimer){ clearInterval(typeTimer); typeTimer = null; } typing = false; }catch(_){}
      try{ var _v = ov.querySelector("video"); if(_v){ _v.pause(); _v.removeAttribute("src"); _v.load(); } }catch(_){}
      try{ if(typeof _msStopHeldSfx === "function") _msStopHeldSfx(); }catch(_){}
    };
    var startDialog = function(){
      if(_scDead()) return;                                   // ★ v4.81.0 A3
      if(_dialogStarted) return; _dialogStarted = true;
      if(!lines.length){ finish(); return; }
      buildDialogBox(); showLine();
    };
    var finish = function(){
      if(_scDead()) return;                                   // ★ v4.81.0 A3 場景已作廢 → 殘留計時器不得再觸發 act
      if(_finished) return; _finished = true;                 // ★ v4.81.0 丙案 冪等
      var _proceed = function(){
        // ★ v4.68.1 連貫切換:不在此淡出/移除本場景 → 由下一場景載圖就緒後交叉淡入時移除(末場景由 _msRunChapter.done() 移除)
        if(onDone){ try{ onDone(); }catch(e){ console.error("[主線 scene onDone]", e); } }
      };
      // ★ v4.67.0 批次2a — 對白播完 → 執行 scene.act(非戰鬥類已接既有系統)→ 完成再續播;無 act 直接續播
      if(scene.act && typeof _msRunAct === "function"){
        try{ _msRunAct(scene.act, chId, ov, _proceed); }
        catch(e){ console.error("[主線 act 分派]", scene.act, e); _proceed(); }
      } else {
        _proceed();
      }
    };

    // ── 跳過鈕 ──
    // ★ v4.81.0 老師裁定「丙案」(2026-07-22)— 由「⏭ 跳過演出=一鍵跳完整章」改為「⏭ 跳過這一段=只快轉本場景」。
    //   根因:舊鈕會設 window._msSkipChapter=true,step() 立刻 done() → 整章的 scene.act(戰鬥、加入夥伴、
    //        發劍、主角覺醒)全被略過,章節卻照樣標完成並發全部獎勵;學生連按七次約兩分鐘就能領完主線所有獎勵。
    //   新行為:清掉本場景的打字機/影片/持續音 → 直接走 finish() → 該場景的 act 照常執行 → 續播下一場景。
    //          也就是「快轉這一段對白」,不會繞過任何演出、也不會提前結算獎勵;玩家仍需一場一場走完。
    //   舊碼保留於本註解:_scAbort = true; window._msSkipChapter = true; ov.remove(); onDone(true);
    //   ★ window._msSkipChapter 這條全域機制保留(step/_scDead 仍會檢查),供日後 GM 或緊急中止使用,但 UI 不再觸發。
    var skipBtn = document.createElement("button");
    skipBtn.textContent = "⏭ " + _msT("跳過這一段", "快轉這一段");
    skipBtn.title = _msT("快轉本段對白，演出與獎勵不受影響", "快轉這段對話，後面照常");
    skipBtn.style.cssText = "position:absolute;top:18px;right:18px;z-index:2;background:rgba(0,0,0,0.55);color:#fff;border:2px solid rgba(255,255,255,0.5);border-radius:20px;padding:8px 18px;font-size:18px;font-weight:700;cursor:pointer;";
    skipBtn.onclick = function(ev){
      if(ev){ ev.stopPropagation(); }
      try{ if(typeof playSfx==="function") playSfx("sfx-skip-cutscene",0.85); }catch(_){}
      _scStopMedia();
      _dialogStarted = true;                                  // 影片兜底計時器之後再回來也不會重開對白
      finish();                                               // → 執行本場景 act → 續播下一場景
    };

    var dialogWrap = null, textEl = null, curIdx = 0, typing = false, typeTimer = null;
    /* ★★ v4.86.0 老師需求3 —— 「對白經常太快閃過消失來不及閱讀」根治
     *   根因(三條同時存在,任何一條都會讓一句話瞬間被跳掉):
     *     ① 封面/上一場景那「同一下」點擊,在新 overlay 建立後仍會補送一個 click →
     *        玩家還沒看到第一句,第一句就被推掉。
     *     ② iPad 上一次觸控常同時產生 touch 合成 click 與按鈕 click,連推兩句。
     *     ③ 舊場景 overlay 被改名成 mainstory-overlay-prev 後「onclick 仍掛著舊 _msAdvance」,
     *        480ms 內誤觸就會推進上一個場景的殘留閉包。
     *   修法(單一節流閘·不動任何劇情資料):每次顯示一句就記時間戳,_MS_ADV_LOCK_MS 毫秒內
     *   一律忽略任何推進輸入(點畫面/下一句鈕/上一句鈕皆同)。打字機通常跑超過這個時間,
     *   所以「打字中點一下補完整句」的既有手感完全不受影響。 */
    var _MS_ADV_LOCK_MS = 450;
    var _lineShownAt = Date.now();   /* 初值=場景建立時間 → 建立瞬間的殘留 click 直接被擋掉 */
    var _msAdvLocked = function(){ return (Date.now() - _lineShownAt) < _MS_ADV_LOCK_MS; };
    /* ★★ v4.89.0(第二版·老師 2026-07-24 回饋修正)——「對白顯示完立刻就能按下一句」。
     *   ★ 第一版的「顯示完停 2 秒」已依老師指示移除(那是錯的·會卡住玩家節奏)。
     *   保留的只有一道極短防護 _MS_DONE_GUARD_MS = 350ms:專門擋 iPad「一次觸控 → touchend
     *   之後約 300ms 才補送的合成 click」,這是「點一下卻連跳兩句」的元凶之一。350ms 對人眼
     *   等同「立即」(人真的連點兩下最快也要 ~250ms 起跳且多半落在 350ms 之外),不影響手感。
     *   ★ 真正讓對白「只出現說話者、內容空白/被跳過」的根因不在這裡,見下方 _msQ() 的說明。 */
    var _MS_DONE_GUARD_MS = 350;
    var _lineDoneAt = 0;             /* 本句「完整顯示」時刻(補完或自然打完皆記) */
    var _msDoneGuard = function(){ return (Date.now() - _lineDoneAt) < _MS_DONE_GUARD_MS; };
    var _msLineDone = function(){ _lineDoneAt = Date.now(); };
    /* ★★★ v4.89.0 血淚根因(老師回報「幾個句子只顯示說話的人、對白沒出現/一瞬間被跳過」)——
     *   ★ 病灶=「重複 id + document.getElementById 抓到舊場景的元素」。
     *     v4.68.1 的連貫切換會把上一個場景 overlay 改名成 mainstory-overlay-prev 留在 DOM 裡
     *     (等 480ms 交叉淡入後才移除),但「它裡面的子元素 id 沒有改」——
     *     ms-dlg-text / ms-prev-btn / ms-next-btn 於是同時存在兩份。
     *     document.getElementById 回傳「文件順序最前面」那一個 = 舊場景(先 append 到 body)的元素!
     *   ★ 後果(完全對應老師看到的畫面):
     *     ① showLine 的 textEl 指到「舊場景那顆看不見的文字框」→ 打字機把整句打進舊場景,
     *        新場景只剩「說話者名字 + 空白對白框」;480ms 後舊場景被 remove,textEl 變成
     *        脫離文件的孤兒節點 → 這句話從頭到尾永遠不會出現在畫面上。
     *     ② 玩家點一下 → _msAdvance 判定 typing=true → 把整句補進那顆孤兒節點(畫面依然沒反應)
     *        → 再點一下才真的跳下一句 → 玩家看到的就是「這句被整個跳過」。
     *     ③ _msBindNav 綁到的也是舊場景的按鈕 → 新場景的「◀ 上一句 / 下一句 ▶」根本沒作用。
     *   ★ 為什麼剛好是那幾句:受害的一律是「每個新場景的最前面一兩句」(舊 overlay 還在的那段時間),
     *     而序章/第一章那幾處剛好都是 act(黑幕/捏臉/名片/加入隊伍/戰鬥)結束後緊接著換場景,
     *     玩家又會連點 → 前一兩句必中。戰鬥教學前後整段沒顯示也是同一顆病灶。
     *   ★ 修法:本場景一律用 _msQ() 在「自己的 overlay(ov)」裡面找元素,永遠不跨場景;
     *     另在改名成 -prev 的同時把舊 overlay 內所有 id 拔掉(雙保險,順便讓任何其他
     *     getElementById 都不可能再抓到舊場景的殘骸)。 */
    var _msQ = function(id){ try{ return ov.querySelector("#" + id); }catch(_){ return null; } };
    // ★ v4.71.0 對白著色:主角(__hero)淡藍·line.hl 教學關鍵詞亮黃·其餘白;逐字打字機用 innerHTML 套色
    function _msEsc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
    function _msRenderTyped(line, ci){
      var full = _msLineText(line);
      var base = (line && line.who === "__hero") ? "#aad4ff" : "#ffffff";
      var hlArr = (line && line.hl && line.hl.length) ? line.hl : null;
      var shown = (ci==null || ci<0 || ci>full.length) ? full.length : ci;
      if(!hlArr){ return "<span style=\"color:" + base + "\">" + _msEsc(full.slice(0,shown)) + "</span>"; }
      var marks = [], k; for(k=0;k<full.length;k++) marks[k]=false;
      for(var h=0;h<hlArr.length;h++){ var kw=hlArr[h]; if(!kw) continue; var idx=full.indexOf(kw); while(idx!==-1){ for(var p=idx;p<idx+kw.length;p++) marks[p]=true; idx=full.indexOf(kw, idx+kw.length); } }
      var out="", i=0;
      while(i<shown){ var m=marks[i], j=i; while(j<shown && marks[j]===m) j++; out += "<span style=\"color:" + (m?"#ffe14d":base) + "\">" + _msEsc(full.slice(i,j)) + "</span>"; i=j; }
      return out;
    }
    function buildDialogBox(){
      dialogWrap = document.createElement("div");
      dialogWrap.className = "ms-dlg-wrap";   /* ★ v5.26.0 手機適配 CSS 錨點(用 class 不用 id:v4.89.0 舊場景改名 -prev 時會拔子元素 id·class 不受影響·零行為變更) */
      dialogWrap.style.cssText = "width:90%;max-width:1400px;margin-bottom:56px;background:linear-gradient(180deg,rgba(18,10,32,0.94),rgba(38,20,58,0.96));border:3px solid rgba(160,200,255,0.7);border-radius:22px;padding:30px 48px;box-shadow:0 0 40px rgba(120,150,255,0.35);";
      ov.appendChild(dialogWrap);
    }
    // ★ v4.72.0 翻頁音(切換上一句/下一句時單發·缺檔靜默)
    function _msPlayPageTurn(){ try{ var a = new Audio("./" + encodeURIComponent("翻頁.mp3") + "?v=" + _msVer()); a.volume = 0.6; var pr = a.play(); if(pr && pr.catch) pr.catch(function(){}); }catch(_){} }
    // ★ v4.72.0 上一句/下一句導覽列(取代舊「▼ 點擊繼續」·避免玩家按太快沒看到)
    function _msNavBarHtml(){
      var canPrev = (curIdx > 0);
      var prevSt = "flex:0 0 auto;padding:10px 22px;border-radius:14px;font-size:24px;font-weight:800;letter-spacing:1px;border:2px solid rgba(160,200,255,0.55);background:rgba(255,255,255,0.06);touch-action:manipulation;cursor:" + (canPrev ? "pointer" : "not-allowed") + ";color:" + (canPrev ? "#cfe4ff" : "rgba(200,200,220,0.32)") + ";";
      var nextSt = "flex:0 0 auto;padding:10px 22px;border-radius:14px;font-size:24px;font-weight:800;letter-spacing:1px;border:2px solid rgba(160,200,255,0.55);background:rgba(255,255,255,0.06);touch-action:manipulation;cursor:pointer;color:#cfe4ff;";
      return "<div style=\"display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:14px;\">" +
        "<button id=\"ms-prev-btn\" style=\"" + prevSt + "\">◀ " + _msT("上一句", "上一句") + "</button>" +
        "<div style=\"font-size:26px;color:#ffcc66;letter-spacing:3px;font-weight:700;\">▼ " + _msT("點擊繼續", "點一下繼續") + "</div>" +
        "<button id=\"ms-next-btn\" style=\"" + nextSt + "\">" + _msT("下一句", "下一句") + " ▶</button>" +
        "</div>";
    }
    function _msBindNav(){
      try{
        var pb = _msQ("ms-prev-btn");        /* ★ v4.89.0 只在本場景 overlay 內找(舊 document.getElementById 會抓到上一場景的按鈕) */
        if(pb) pb.onclick = function(ev){
          if(ev) ev.stopPropagation();
          if(_msAdvLocked()) return;                                              /* ★ v4.86.0 最短停留鎖 */
          if(typing){                                                              // ★ v4.77.0 打字中按上一句=先補完整句(不回看·避免訊息一閃而過看不到)
            if(typeTimer) clearInterval(typeTimer);
            typing = false;
            if(textEl && lines[curIdx]) textEl.innerHTML = _msRenderTyped(lines[curIdx], -1);
            _msLineDone();                                                         /* ★ v4.89.0 補完=完整顯示起點 */
            return;
          }
          if(curIdx > 0){ curIdx--; _msPlayPageTurn(); showLine(true); }            // 補完後再按才回看
        };
        var nb = _msQ("ms-next-btn");        /* ★ v4.89.0 同上 */
        if(nb) nb.onclick = function(ev){ if(ev) ev.stopPropagation(); _msAdvance(); };
      }catch(_){}
    }
    // ★ v4.72.0 下一句:打字中→補完;否則前進一句(有下一句才播翻頁)
    function _msAdvance(){
      if(_msAdvLocked()) return;                        /* ★ v4.86.0 最短停留鎖:剛換句的 450ms 內不吃任何推進 */
      if(typing){
        if(typeTimer) clearInterval(typeTimer);
        typing = false;
        if(textEl && lines[curIdx]) textEl.innerHTML = _msRenderTyped(lines[curIdx], -1);
        _msLineDone();                                  /* ★ v4.89.0 補完整句=完整顯示起點 → 至少停 2 秒 */
        return;
      }
      if(_msDoneGuard()) return;                        /* ★ v4.89.0(第二版)整句顯示完即可推進;僅擋 350ms 內的 iPad 合成 click(防一下跳兩句) */
      curIdx++;
      if(curIdx < lines.length){ _msPlayPageTurn(); }   // 切到有效下一句才播翻頁(最後一句→finish 不播)
      showLine();
    }
    function showLine(instant){
      _lineShownAt = Date.now();                        /* ★ v4.86.0 本句顯示時間戳(節流閘基準) */
      try{ if(typeof _msStopHeldSfx === "function") _msStopHeldSfx(); }catch(_){}  // ★ v4.77.0 進下一句即停上一句的持續音(森林腳步等)
      if(curIdx >= lines.length){ finish(); return; }
      var line = lines[curIdx];
      try{
        if(line && line.sfxHold){ _msPlayHeldSfx(line.sfx, line.sfxHold); }        // ★ v4.77.0 持續型動作音(loop·sfxHold 毫秒後淡出停)
        else if(line && line.sfx){ _msPlaySfx(line.sfx, null, line.sfxMax); }      // ★ v4.70.0 對白動作音(單發·缺檔靜默)·★ v4.89.0 sfxMax=最長播放毫秒(到點淡出)
      }catch(_){}
      var whoTxt = _msWho(line.who);
      dialogWrap.innerHTML =
        (whoTxt ? ("<div style=\"font-size:30px;font-weight:900;color:#ffcc66;letter-spacing:2px;margin-bottom:14px;\">" + whoTxt + "</div>") : "") +   // ★ v4.78.0 說話者名字略縮小(38→30·劇情專屬姓名變長後不擠壓對白)
        "<div id=\"ms-dlg-text\" style=\"font-size:46px;color:#fff;letter-spacing:1px;line-height:1.7;min-height:120px;font-weight:600;\"></div>" +
        _msNavBarHtml();   // ★ v4.72.0 上一句/下一句 導覽列
      textEl = _msQ("ms-dlg-text");    /* ★★ v4.89.0 根因修復:舊碼 document.getElementById 會抓到上一場景殘留的同名元素(見上方 _msQ 說明)→ 打字打進看不見的舊框,新場景只剩說話者名字 */
      _msBindNav();
      var full = _msLineText(line);
      if(instant){   // ★ v4.72.0 上一句回看:整句直接顯示(不重播打字機)
        if(typeTimer) clearInterval(typeTimer);
        typing = false;
        if(textEl) textEl.innerHTML = _msRenderTyped(line, -1);
        _msLineDone();                                  /* ★ v4.89.0 回看整句直接顯示=完整顯示起點 */
        return;
      }
      var ci = 0; typing = true;
      if(typeTimer){ clearInterval(typeTimer); }
      typeTimer = setInterval(function(){
        if(ci >= full.length){ clearInterval(typeTimer); typing = false; _msLineDone(); return; }   /* ★ v4.89.0 自然打完也記完整顯示時刻 */
        ci++; if(textEl) textEl.innerHTML = _msRenderTyped(line, ci);  // ★ v4.71.0 逐字著色(主角淡藍/關鍵詞亮黃)
      }, 28);
    }
    ov.onclick = function(){
      if(!_dialogStarted) return;
      _msAdvance();   // ★ v4.72.0 點畫面=下一句(打字中則補完;切換有效句時播翻頁音)
    };
    ov.appendChild(skipBtn);
    document.body.appendChild(ov);

    // ★ v4.68.1 連貫切換:新場景圖載入完成(或無圖/逾時)才淡入,並移除上一場景 → 無空檔黑閃/露關卡頁
    var _msRevealed = false;
    var _msRevealScene = function(){
      if(_msRevealed) return; _msRevealed = true;
      try{ if(typeof playSfx==="function") playSfx("sfx-confirm2",0.4); }catch(_){}  // ★ v4.71.0 音效改在畫面轉場單發(不再每句對白發音)
      requestAnimationFrame(function(){ try{ ov.style.opacity = "1"; }catch(_){} });
      setTimeout(function(){ try{ var pv = document.getElementById("mainstory-overlay-prev"); if(pv) pv.remove(); }catch(_){} }, 480);
    };
    if(bg){
      try{
        var _msIm = new Image();
        _msIm.onload = _msRevealScene; _msIm.onerror = _msRevealScene; _msIm.src = bg;
        if(_msIm.complete) _msRevealScene();               // 已快取→立即淡入
      }catch(_){ _msRevealScene(); }
      setTimeout(_msRevealScene, 1500);                    // 逾時兜底:慢網最多等 1.5s 也淡入(黑底墊著不露關卡頁)
    } else {
      _msRevealScene();                                    // 無圖(影片/純演出場景)→立即淡入
    }

    // 影片插槽(有才播;muted autoplay playsinline·就緒淡入·缺檔/播完→對白)
    if(scene.video){
      var vurl = _msAsset(scene.video);
      var v = document.createElement("video");
      v.src = vurl; v.muted = true; v.setAttribute("playsinline",""); v.setAttribute("webkit-playsinline","");
      v.autoplay = true; v.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 0.5s;z-index:1;";
      /* ★ v5.5.0(老師裁定 2026-07-31)—— scene.coverMusic:true → 影片同時播放「章節音樂.m4a」
       *   (同 _msPlayCover 封面口徑:repo 根目錄·encodeURIComponent·?v= 破快取·音量 0.72)。
       *   場景本身 bgm:"none" 已在函式開頭停掉前一場 BGM → 不疊聲;影片結束/缺檔/逾時
       *   由 _vFin 統一把章節音樂淡出停止(700ms 線性降音量·雙保險 pause),缺檔/被擋皆靜默。 */
      var _cvA = null;
      if(scene.coverMusic){
        try{
          _cvA = new Audio("./" + encodeURIComponent("章節音樂.m4a") + "?v=" + _msVer());
          _cvA.volume = 0.72;
          var _cvP = _cvA.play(); if(_cvP && _cvP.catch) _cvP.catch(function(){});
        }catch(_eCv){ _cvA = null; }
      }
      var _cvStop = function(){
        var a = _cvA; _cvA = null;
        if(!a) return;
        try{
          var _t0 = Date.now(), _v0 = a.volume || 0.72;
          var _fi = setInterval(function(){
            var _r = (Date.now() - _t0) / 700;
            if(_r >= 1){ try{ a.pause(); }catch(_){} clearInterval(_fi); return; }
            try{ a.volume = Math.max(0, _v0 * (1 - _r)); }catch(_){}
          }, 60);
          setTimeout(function(){ try{ a.pause(); }catch(_){} }, 900);   // 雙保險:淡出計時器異常也必停
        }catch(_eCs){ try{ a.pause(); }catch(_){} }
      };
      var _vGone = false, _vFin = function(){ if(_vGone) return; _vGone = true; try{ v.remove(); }catch(_){} _cvStop(); startDialog(); };
      v.onerror = function(){ _vFin(); };            // 缺檔靜默→直接對白
      v.onended = function(){ _vFin(); };
      v.addEventListener("playing", function(){ v.style.opacity = "1"; try{ v.muted = false; }catch(_){} });
      ov.appendChild(v);
      try{ var pr = v.play(); if(pr && pr.catch) pr.catch(function(){ _vFin(); }); }catch(_){ _vFin(); }
      setTimeout(function(){ if(!_vGone && (!v.currentTime || v.readyState < 2)) _vFin(); }, 6000); // 兜底
    } else {
      startDialog();
    }
  }

  // ★ v4.67.0 Q2 — 章節內場景續播點(綁 UID·雲端/本地鏡像·同 done 存檔路徑)
  function _msSaveProgressObj(p){
    _msPersist(p);   // ★ v4.81.0 C2 — 舊版在此自行寫 localStorage + _fbSaveMainStoryProgress,改走單一出口(批次中延後合併)
  }
  function _msSetScenePos(cid, idx){ try{ var p = _msProgress(); p["_sc_" + cid] = idx; _msSaveProgressObj(p); }catch(_){} }
  function _msGetScenePos(cid){ try{ var p = _msProgress(); var v = p["_sc_" + cid]; return (typeof v === "number" && v > 0) ? v : 0; }catch(_){ return 0; } }
  function _msClearScenePos(cid){ try{ var p = _msProgress(); if(p["_sc_" + cid] != null){ delete p["_sc_" + cid]; _msSaveProgressObj(p); } }catch(_){} }

  // ════════ 主線劇情專屬 BGM(v4.68.0·根據場合挑選現有音樂)════════
  //   選曲原則:序章/前期熱血章 → 冒險小隊出發(bgm-adv-march);
  //            異變/魅惑/臭氣/黑暗球等緊張高潮章 → 台灣關卡簡介劇情BGM(bgm-taiwan-cutscene)。
  //   進主線(章節選單/播章)切入專屬 BGM;離開主線還原關卡頁 BGM(貓空冒險 bgm-adv-scene)。
  var _MS_MENU_BGM = "bgm-adv-march";   // 章節選擇視窗 + 前期章節
  var _MS_CH_BGM = {
    prologue:"bgm-adv-march", ch1:"bgm-adv-march", ch2:"bgm-adv-march",
    ch3:"bgm-taiwan-cutscene", ch4:"bgm-taiwan-cutscene", ch5:"bgm-taiwan-cutscene", ch6:"bgm-taiwan-cutscene"
  };
  function _msBgmForChapter(cid){ return _MS_CH_BGM[cid] || _MS_MENU_BGM; }
  function _msEnterStoryBgm(cid){
    try{
      if(!window._msInStory){ window._msInStory = true; }
      var id = cid ? _msBgmForChapter(cid) : _MS_MENU_BGM;
      if(typeof bgmFadeTo === "function") bgmFadeTo(id, 700);
      window._msCurBgm = id;   // ★ v4.71.0 記錄當前主線 BGM(逐場景切換比對用)
    }catch(_){}
  }
  function _msExitStoryBgm(){
    try{
      window._msInStory = false;
      window._msCurBgm = null;   // ★ v4.71.0 離開主線清空 BGM 記錄
      if(typeof bgmFadeTo === "function") bgmFadeTo("bgm-adv-scene", 700);   // 還原關卡頁 BGM(貓空冒險)
    }catch(_){}
    try{ _msRemoveBackdrop(); }catch(_){}                 // ★ v4.68.1 離開主線→移除常駐黑底
    try{ _msStopAmb(); }catch(_){}                        // ★ v4.70.0 離開主線→淡出停止環境音
    try{ if(typeof _msStopHeldSfx === "function") _msStopHeldSfx(); }catch(_){}   // ★ v4.77.0 離開主線→停止持續型動作音
  }
  window._msExitStoryBgm = _msExitStoryBgm;

  // ★ v4.68.1 常駐不透明黑底:整個主線期間鋪在場景/選單之下,填補「舊場景移除→新場景圖載入」空檔,
  //   杜絕露出後面關卡選擇頁(z 低於場景 9800 / 選單 9790·不吃點擊)。
  function _msEnsureBackdrop(){
    try{
      if(document.getElementById("mainstory-backdrop")) return;
      var b = document.createElement("div");
      b.id = "mainstory-backdrop";
      b.style.cssText = "position:fixed;inset:0;z-index:9780;background:#0a0618;pointer-events:none;";
      document.body.appendChild(b);
    }catch(_){}
  }
  function _msRemoveBackdrop(){
    try{ var b = document.getElementById("mainstory-backdrop"); if(b) b.remove(); }catch(_){}
  }

  // ════════════════════════════════════════════════════════════════════
  // ★★ v4.91.0 — 主線戰鬥「整片深藍蓋住看不到」根治(老師 2026-07-24 實測回報)
  // ────────────────────────────────────────────────────────────────────
  // 症狀:進主線第一場教學戰鬥後,整個畫面被深藍色蓋住什麼都看不到,但「亂點擊會有反應」,
  //      甚至點到跑進冒險關卡的別的分頁(聽到不同 BGM),全程無法遊玩只能關閉遊戲。
  // 根因:v4.68.1 的常駐不透明黑底 #mainstory-backdrop
  //      (position:fixed; inset:0; z-index:9780; background:#0a0618; pointer-events:none)
  //      是「整個主線期間」都鋪著的;而 v4.89.0 的 _msStartRealBattle 進戰鬥時
  //      ★只做了 mainstory-overlay.style.display="none",完全沒有處理 backdrop★。
  //      戰鬥畫面 #gc 的 z-index 遠低於 9780 → 整場戰鬥被那層 #0a0618 深藍蓋死;
  //      又因 backdrop 是 pointer-events:none,所有點擊都「穿透」打到底下真的戰鬥畫面/
  //      關卡頁按鈕 → 完全對應老師說的「看不到卻點得到、還會切到別的分頁聽到別的 BGM」;
  //      而左下「戰報」「SOS」兩顆鈕 z-index=2147483646 高過 9780,所以只有它們看得見。
  // 修法:進戰鬥前把「所有主線圖層」一律隱藏(backdrop 直接移除),結算回劇情時再還原。
  //      ★ 用 querySelectorAll('[id^="mainstory"]') 全面掃描,不逐一列舉 id ——
  //        除了 backdrop 與 overlay,也一併涵蓋 v4.68.1 交叉淡出殘留的 "-prev" 舊場景層,
  //        日後主線再新增任何圖層也自動被涵蓋,不會再發生「漏一層就全黑」。
  // ════════════════════════════════════════════════════════════════════
  var _MS_HIDDEN_LAYERS = [];
  function _msHideStoryLayers(){
    _MS_HIDDEN_LAYERS = [];
    try{
      var els = document.querySelectorAll('[id^="mainstory"]');
      for(var i = 0; i < els.length; i++){
        try{
          _MS_HIDDEN_LAYERS.push({ el: els[i], disp: els[i].style.display });
          els[i].style.display = "none";
        }catch(_e1){}
      }
    }catch(e){ console.warn("[主線戰鬥] 隱藏主線圖層例外", e); }
    /* ★★ v4.91.1 —— 老師 2026-07-25 實測回報:深藍遮罩解掉了、BGM 也正確了,
     *   但進第一場戰鬥「看到的是遊戲首頁」而不是戰鬥畫面。
     *   根因:主線戰鬥是從「首頁」啟動的,底下那層就是遊戲封面 #overlay(main.css z-index:500);
     *   正規冒險流程 startAdventureGame() 會做 overlay.style.display='none' 並把 #gc 打開,
     *   而 v4.89.0 的主線實戰路徑直接呼叫 advStartBattle(),★完全沒有做這個畫面切換★
     *   → 收掉主線圖層後,露出來的自然是首頁封面而不是戰場。
     *   修法:比照 startAdventureGame 把首頁封面與各選單 overlay 收起來、把戰鬥容器 #gc 打開,
     *   全部記進同一份 _MS_HIDDEN_LAYERS,結算回劇情時原樣還原(退出主線仍正常回到首頁)。 */
    try{
      var _swap = [
        { id:"overlay",              to:"none" },   // 遊戲封面首頁(z500)= 老師看到的那一頁
        { id:"adventure-overlay",    to:"none" },   // 冒險關卡選單
        { id:"hero-pick-overlay",    to:"none" },   // 選角
        { id:"hero-detail-overlay",  to:"none" },   // 英雄詳情
        { id:"gc",                   to:"flex" }    // ★ 戰鬥容器:正規流程會設 display:flex
      ];
      for(var _s = 0; _s < _swap.length; _s++){
        var _el = document.getElementById(_swap[_s].id);
        if(!_el) continue;
        _MS_HIDDEN_LAYERS.push({ el: _el, disp: _el.style.display });
        _el.style.display = _swap[_s].to;
      }
    }catch(e2){ console.warn("[主線戰鬥] 畫面切換例外", e2); }
    try{ _msRemoveBackdrop(); }catch(_){}    // backdrop 直接移除(結算時由 _msEnsureBackdrop 重建)
  }
  function _msShowStoryLayers(){
    try{
      for(var i = 0; i < _MS_HIDDEN_LAYERS.length; i++){
        var r = _MS_HIDDEN_LAYERS[i];
        try{ if(r && r.el && r.el.parentNode) r.el.style.display = (r.disp || ""); }catch(_e2){}
      }
    }catch(e){ console.warn("[主線戰鬥] 還原主線圖層例外", e); }
    _MS_HIDDEN_LAYERS = [];
  }

  // ════════ v4.70.0 主線豐富音效(環境音循環 amb + 動作音單發 sfx·缺檔靜默 fallback)════════
  //   音效檔:主線_音效_{key}.m4a(放 repo 根目錄);以動態 Audio 播放,不需 HTML 加 audio 元素。
  //   amb:場景層環境音·低音量(~0.35)循環·離場淡出;sfx:對白層動作音·單發(~0.7)。缺檔靜默(play().catch)。
  var _msAmbAudio = null, _msAmbKey = "";
  function _msSndUrl(key){ try{ return "./" + encodeURIComponent(key + ".m4a") + "?v=" + _msVer(); }catch(_){ return ""; } }   // ★ v4.72.0 乙案:改抓短檔名 {key}.m4a(老師上傳 forest.m4a 等·amb/sfx 共用)
  // ★ v4.78.0 任務1・缺檔回退表(主線 16 個動作音 key → 遊戲既有「近義技能音效」<audio> 元素 id)
  //   行為:優先抓 repo 短檔名 {key}.m4a;抓不到(404/被擋)才用近義音效頂替 → 劇情不再靜默。
  //   老師日後把正式音檔上傳到 repo 根目錄,同名 key 會自動改用正式檔(回退自動失效),不必再改程式。
  var _MS_SFX_FALLBACK = {
    footstep:  "sfx-gentle",         // 腳步 → 輕柔選取(短促細音)
    crack:     "sfx-earthquake",     // 龜裂 → 地震(低頻碎裂)
    fall:      "sfx-powerdown",      // 墜落 → 能量下墜音
    appear:    "sfx-summon-reveal",  // 登場 → 召喚角色
    card:      "sfx-deal",           // 翻牌 → 發牌
    whistle:   "sfx-battle-start",   // 哨聲 → 開始進攻
    keyboard:  "sfx-kansatsu-flip",  // 鍵盤 → 圖鑑翻頁(細碎敲擊感)
    sword:     "sfx-sword",          // 劍擊 → 劍
    pray:      "sfx-goddess",        // 祈禱 → 女神發光
    charm:     "sfx-youyou-burst",   // 魅惑 → 惡夢遊魂(詭異)
    shield:    "sfx-guard",          // 護盾 → 守護
    fire:      "sfx-explode",        // 烈焰 → 爆炸
    stink:     "sfx-powerdown",      // 臭氣 → 洩氣衰弱(逗趣)
    treasure:  "sfx-medal-unlock",   // 至寶 → 獲得獎章(閃亮)
    darkrise:  "sfx-wb-boss-skill",  // 黑暗崛起 → 龍的呼嘯(低沉轟鳴)
    restore:   "sfx-heal"            // 恢復 → 治癒魔法
  };
  function _msFbUrl(key){
    try{
      var id = _MS_SFX_FALLBACK[key]; if(!id) return "";
      var el = document.getElementById(id); if(!el) return "";
      return el.currentSrc || el.src || "";
    }catch(_){ return ""; }
  }
  /* ★ v4.89.0 新增第三參數 maxMs:動作音「最長只播 N 毫秒」(到點淡出停止)。
   *   老師需求(2026-07-24):籃球隊員登場那句的開戰鐘聲太長,截成 3 秒。
   *   實作要點:正式檔與缺檔回退音都要能被截斷 → 用 _cur 追蹤「當前真正在播的那顆 Audio」,
   *   回退接手時一併換 _cur;淡出沿用既有 0.12/45ms 節奏(與 _msStopHeldSfx 同手感)。
   *   未帶 maxMs 的呼叫行為與舊版完全相同(整段播完·零回歸)。 */
  function _msPlaySfx(key, vol, maxMs){
    if(!key) return;
    try{
      var v = (typeof vol === "number") ? vol : 0.7;
      var a = new Audio(_msSndUrl(key));
      a.volume = v;
      var used = false;
      var _cur = a;
      var fb = function(){
        if(used) return; used = true;
        var u = _msFbUrl(key); if(!u) return;
        try{ var b = new Audio(u); b.volume = v; _cur = b; var p2 = b.play(); if(p2 && p2.catch) p2.catch(function(){}); }catch(_){}
      };
      try{ a.onerror = fb; }catch(_){}
      var pr = a.play();
      if(pr && pr.then) pr.then(function(){ used = true; }, function(){ fb(); });   // 成功→鎖住不回退;失敗(缺檔/被擋)→頂替
      if(typeof maxMs === "number" && maxMs > 0){
        setTimeout(function(){
          try{
            var t0 = _cur; if(!t0) return;
            var vv = t0.volume || 0;
            var ft = setInterval(function(){
              vv -= 0.12;
              if(vv <= 0){ vv = 0; try{ t0.pause(); }catch(_){} clearInterval(ft); }
              try{ t0.volume = Math.max(0, vv); }catch(_){ clearInterval(ft); }
            }, 45);
          }catch(_){}
        }, maxMs);
      }
    }catch(_){}
  }
  // ★ v4.77.0 持續型動作音(loop 播放·ms 毫秒後淡出停止;用於序章森林腳步聲「持續5秒就停」)
  //   短檔(單腳步)→loop 填滿時長;長檔→ms 到即截斷淡出。進下一句/離場皆會提前停止。
  var _msHeldSfx = null, _msHeldStopT = null, _msHeldFadeT = null;
  function _msStopHeldSfx(){
    try{ if(_msHeldStopT){ clearTimeout(_msHeldStopT); _msHeldStopT = null; } }catch(_){}
    try{ if(_msHeldFadeT){ clearInterval(_msHeldFadeT); _msHeldFadeT = null; } }catch(_){}
    var a = _msHeldSfx; _msHeldSfx = null;
    if(!a) return;
    try{
      var v = a.volume || 0;
      var t = setInterval(function(){ v -= 0.12; if(v <= 0){ v = 0; try{ a.pause(); }catch(_){} clearInterval(t); } try{ a.volume = Math.max(0, v); }catch(_){ clearInterval(t); } }, 45);
    }catch(_){ try{ a.pause(); }catch(__){} }
  }
  function _msPlayHeldSfx(key, ms, vol){
    if(!key) return;
    _msStopHeldSfx();
    try{
      var v = (typeof vol === "number") ? vol : 0.6;
      var a = new Audio(_msSndUrl(key));
      a.loop = true; a.volume = v;
      var used = false;
      // ★ v4.78.0 缺檔回退:正式檔抓不到時改用近義技能音效(一樣 loop·一樣受 _msStopHeldSfx 控制)
      var fb = function(){
        if(used) return; used = true;
        var u = _msFbUrl(key); if(!u) return;
        try{
          var b = new Audio(u); b.loop = true; b.volume = v;
          var p2 = b.play(); if(p2 && p2.catch) p2.catch(function(){});
          if(_msHeldSfx === a) _msHeldSfx = b;   // 交棒:淡出/停止改控回退音
        }catch(_){}
      };
      try{ a.onerror = fb; }catch(_){}
      var pr = a.play();
      if(pr && pr.then) pr.then(function(){ used = true; }, function(){ fb(); });
      _msHeldSfx = a;
      var dur = (typeof ms === "number" && ms > 0) ? ms : 5000;
      _msHeldStopT = setTimeout(function(){ _msStopHeldSfx(); }, dur);   // ms 後淡出停止
    }catch(_){}
  }
  window._msStopHeldSfx = _msStopHeldSfx;   // 供離場統一停止
  function _msStopAmb(){
    try{
      var a = _msAmbAudio;
      if(a){
        try{ if(a._msFadeT) clearInterval(a._msFadeT); }catch(_){}
        var v = a.volume || 0;
        var t = setInterval(function(){ v -= 0.07; if(v <= 0){ v = 0; try{ a.pause(); }catch(_){} clearInterval(t); } try{ a.volume = Math.max(0, v); }catch(_){ clearInterval(t); } }, 55);
      }
    }catch(_){}
    _msAmbAudio = null; _msAmbKey = "";
  }
  function _msStartAmb(key){
    if(!key) return;   // 無 amb 的場景(戰鬥/黑幕)→ 不動作·維持前一環境音;離場才停
    try{
      if(_msAmbKey === key && _msAmbAudio){ return; }   // 同一環境音持續·不重起(場景間連續)
      _msStopAmb();
      var a = new Audio(_msSndUrl(key));
      a.loop = true; a.volume = 0;
      var pr = a.play();
      if(pr && pr.then){
        pr.then(function(){
          var v = 0; a._msFadeT = setInterval(function(){ v += 0.05; if(v >= 0.35){ v = 0.35; try{ clearInterval(a._msFadeT); }catch(_){} } try{ a.volume = v; }catch(_){ try{ clearInterval(a._msFadeT); }catch(__){} } }, 65);
        }).catch(function(){});   // 缺檔/被擋→靜默
      }
      _msAmbAudio = a; _msAmbKey = key;
    }catch(_){}
  }
  window._msStopAmb = _msStopAmb;   // 供 _msExitStoryBgm 離場統一停環境音

  // ════════ v4.72.0 前情提要(封面下半部·白字黑框·回顧序章→上一章)════════
  //   _MS_CH_RECAP[cid] = 該章「發生了什麼」的一句話回顧(premium/cute 雙版·鐵律1.232)。
  //   _msRecapForCover(cid) = 串接「本章之前」各章回顧 → 顯示在該章封面下半部;序章無前文回傳空。
  var _MS_CH_RECAP = {
    prologue: { p:"校外教學追藍鵲迷路，一行人穿越到異世界，捏出屬於自己的模樣。", c:"追藍鵲迷路，大家穿越到異世界，變出自己的樣子。" },
    // ★ v4.81.0 B3 — 舊文與正片對不上(寫「雙月河堤」但那是序章場景、寫「陰影怪物」但正片是野生小怪),
    //   舊值保留於此註解:{ p:"在雙月河堤遭遇陰影怪物，打了異世界的第一場仗。", c:"在河堤遇到陰影怪，打了第一場仗。" }
    ch1:      { p:"在河堤運動公園打了異世界的第一場仗，也學會了把野生小夥伴收為同伴。", c:"在河堤打了第一場仗，還學會馴養小夥伴。" },
    ch2:      { p:"回到社團教室追查，程式高手與繪圖師拼湊出貓空異變的線索。", c:"在教室調查，找到貓空怪事的線索。" },
    // ★ v4.81.0 B3 — 舊文寫「淨化了九尾空貓怪與作亂的菁英妖怪」,但正片 BOSS 是「封住靈氣的褪色邪術」,
    //   九尾空貓怪從頭到尾沒出場(那是冒險關卡的敵人)。舊值保留於此註解:
    //   { p:"貓空茶園褪成灰白，眾人淨化了九尾空貓怪與作亂的菁英妖怪。", c:"貓空茶園變灰，打倒了九尾空貓怪。" }
    ch3:      { p:"貓空茶園褪成灰白，劍士與祭司並肩加入，一同破除了封住靈氣的褪色邪術。", c:"茶園變灰了，劍士和祭司加入，一起破解邪術。" },
    ch4:      { p:"杏花妖以妖術魅惑了守衛與刺客，火法師燒開妖花林，救回被奪走的心。", c:"火法師燒開被迷惑的花林，救回被搶走的心。" },
    ch5:      { p:"深坑老街臭氣沖天，眾人擊退發酵魔王，尋得傳說中的神劍至寶。", c:"打敗臭味魔王，拿到神劍。" },
    ch6:      { p:"黑暗球降臨吞噬所有色彩，主角覺醒，迎向最終決戰。", c:"黑暗球吞掉色彩，主角覺醒，最後大決戰。" }
  };
  function _msRecapForCover(cid){
    try{
      var order = MAINSTORY_DB.order, idx = order.indexOf(cid);
      if(idx <= 0) return "";                       // 序章(或找不到)→無前情
      var cute = _msArtCute(), parts = [];
      for(var i = 0; i < idx; i++){
        var r = _MS_CH_RECAP[order[i]];
        if(r){ parts.push(cute ? (r.c || r.p) : (r.p || r.c)); }
      }
      return parts.join("");
    }catch(_){ return ""; }
  }
  // ★ v4.73.0 取某章「第一張有背景圖的場景」插圖(章節選擇縮圖用)
  function _msFirstSceneImg(cid){
    try{
      var ch = MAINSTORY_DB.chapters[cid];
      if(!ch || !ch.scenes) return "";
      for(var i = 0; i < ch.scenes.length; i++){ if(ch.scenes[i] && ch.scenes[i].img) return ch.scenes[i].img; }
    }catch(_){}
    return "";
  }

  // ════════ v4.70.0 章節開場封面(封面圖+標題大字+開場曲·可跳過·缺資產 graceful fallback)════════
  //   cover = { img:封面圖檔名, bgm:開場曲檔名 };★封面圖不畫字·標題大字由程式疊。
  //   缺封面→漸層底+標題大字(不會壞);缺開場曲→靜默(保留當前 BGM 墊著)。約 10 秒或點擊/跳過→onDone。
  function _msPlayCover(cid, onDone){
    var ch = MAINSTORY_DB.chapters[cid];
    var cover = (ch && ch.cover) ? ch.cover : null;
    var _done = false, _introAudio = null, _autoT = null;
    var finish = function(){
      if(_done) return; _done = true;
      if(_autoT){ try{ clearTimeout(_autoT); }catch(_){} }
      try{ if(_introAudio){ _introAudio.pause(); } }catch(_){}
      try{ var o = document.getElementById("mainstory-cover-overlay"); if(o){ o.style.opacity = "0"; setTimeout(function(){ try{ o.remove(); }catch(_){} }, 420); } }catch(_){}
      if(onDone){ try{ onDone(); }catch(e){ console.error("[主線 cover done]", e); } }
    };
    try{ _msEnsureBackdrop(); }catch(_){}
    var title = _msArtCute() ? ((ch && (ch.titleC || ch.titleP)) || "") : ((ch && (ch.titleP || ch.titleC)) || "");
    var bg = (cover && cover.img) ? _msAsset(cover.img) : "";
    var ov = document.createElement("div");
    ov.id = "mainstory-cover-overlay";
    ov.style.cssText =
      "position:fixed;inset:0;z-index:9810;cursor:pointer;opacity:0;transition:opacity 0.6s;" +
      (bg ? ("background:url(\"" + bg + "\") center center/cover no-repeat,") : "background:") +
      "linear-gradient(160deg,rgba(30,16,54,0.68),rgba(10,6,24,0.92)),#0a0618;" +
      "display:flex;flex-direction:column;align-items:center;justify-content:center;" +
      "font-family:'M PLUS Rounded 1c','Nunito',sans-serif;";
    // ★ v4.72.0 封面圖已內建章節標題 → 不再由程式疊字(title 變數保留備援:若無封面圖則以漸層底顯示標題)
    var titleBox = null;
    if(!bg){                                          // 無封面圖 fallback:漸層底才疊標題大字(避免無圖時空白)
      titleBox = document.createElement("div");
      titleBox.style.cssText = "text-align:center;padding:0 24px;opacity:0;transform:translateY(26px);transition:opacity 0.9s,transform 0.9s;";
      titleBox.innerHTML =
        "<div style=\"font-size:clamp(30px,4.4vw,58px);font-weight:900;color:#ffe08a;letter-spacing:6px;line-height:1.4;text-shadow:0 0 32px rgba(255,190,90,0.7),0 3px 14px #000;\">" + title + "</div>";
      ov.appendChild(titleBox);
    }
    // ★ v4.72.0 前情提要:封面下半部·白字黑框·無底(回顧序章→上一章)
    var _msRecapTxt = ""; try{ _msRecapTxt = _msRecapForCover(cid); }catch(_){ _msRecapTxt = ""; }
    var recapBox = document.createElement("div");
    recapBox.style.cssText = "position:absolute;left:0;right:0;bottom:8%;padding:0 9%;text-align:center;opacity:0;transition:opacity 1s;pointer-events:none;font-family:'標楷體','DFKai-SB','BiauKai','KaiTi','STKaiti','Kaiti TC',serif;";
    if(_msRecapTxt){
      var _rSh = "-2px -2px 0 #000,2px -2px 0 #000,-2px 2px 0 #000,2px 2px 0 #000,0 2px 6px #000,0 0 10px rgba(0,0,0,0.9)";
      recapBox.innerHTML =
        "<div style=\"font-size:clamp(14px,1.5vw,22px);font-weight:800;color:#fff;letter-spacing:5px;margin-bottom:8px;text-shadow:" + _rSh + ";\">❖ " + _msT("前情提要", "前情提要") + " ❖</div>" +
        "<div style=\"font-size:clamp(15px,1.9vw,28px);line-height:1.7;font-weight:700;color:#fff;letter-spacing:1px;text-shadow:" + _rSh + ";\">" + _msRecapTxt + "</div>";
    }
    ov.appendChild(recapBox);
    var skip = document.createElement("button");
    skip.textContent = "⏭ " + _msT("跳過", "跳過");
    skip.style.cssText = "position:absolute;bottom:34px;right:26px;z-index:2;background:rgba(0,0,0,0.55);color:#fff;border:2px solid rgba(255,255,255,0.5);border-radius:20px;padding:9px 20px;font-size:18px;font-weight:700;cursor:pointer;touch-action:manipulation;";
    skip.onclick = function(ev){ if(ev) ev.stopPropagation(); try{ if(typeof playSfx==="function") playSfx("sfx-skip-cutscene",0.85); }catch(_){} finish(); };
    ov.appendChild(skip);
    ov.onclick = function(){ finish(); };   // 點畫面也可略過進正片
    document.body.appendChild(ov);
    requestAnimationFrame(function(){ ov.style.opacity = "1"; setTimeout(function(){ try{ if(titleBox){ titleBox.style.opacity = "1"; titleBox.style.transform = "translateY(0)"; } }catch(_){} try{ recapBox.style.opacity = "1"; }catch(_){} }, 260); });
    // ★ v4.73.0 封面專屬音樂(單一 章節音樂.m4a·全章共用)播放一次;停 BGM 獨佔;★音樂播完 → 自動關閉封面進劇情
    try{ if(typeof bgmStop === "function") bgmStop(); }catch(_){}
    var _coverMusicEnded = false;
    // ★ v4.81.0 C1(老師裁定 2026-07-22)— 章節封面音樂「統一」使用 repo 根目錄的 章節音樂.m4a,
    //   不做每章不同曲。因此 MAINSTORY_DB 各章的 cover.bgm(主線_開場_序章.m4a…共 7 個)確認為
    //   「不使用的欄位」,已在 DB 端標註;老師的待辦清單可以把「7 個開場曲要補檔」這條直接劃掉。
    //   本輪只補強穩健性:新增 onerror → 缺檔/被擋不再空等 45 秒,改 8 秒兜底關閉封面。
    try{
      _introAudio = new Audio("./" + encodeURIComponent("章節音樂.m4a") + "?v=" + _msVer());
      _introAudio.volume = 0.72;
      _introAudio.onended = function(){ _coverMusicEnded = true; finish(); };            // 音樂停止 → 封面自動關閉
      _introAudio.onerror = function(){ if(!_autoT) _autoT = setTimeout(finish, 8000); };  // ★ v4.81.0 缺檔也不空等
      var pr2 = _introAudio.play();
      if(pr2 && pr2.catch) pr2.catch(function(){ if(!_autoT) _autoT = setTimeout(finish, 8000); });   // 被擋/缺檔 → 8 秒兜底
    }catch(_){ _autoT = setTimeout(finish, 8000); }
    // 硬兜底:音樂異常沒觸發 onended(缺檔/超長)→ 最長 45 秒也關閉,避免卡在封面(可隨時跳過)
    setTimeout(function(){ if(!_coverMusicEnded && !_done) finish(); }, 45000);
  }

  // 播整章:依序播 scenes,每個 scene 之間串接;結束標旗標+發獎
  //   opts.review=true → 回顧模式:從第一場景重播完整內容·不記續播點·不重複發獎(冪等)。
  window._msRunChapter = function(cid, onAllDone, opts){
    var ch = MAINSTORY_DB.chapters[cid];
    if(!ch){ if(onAllDone) onAllDone(); return; }
    var _review = !!(opts && opts.review);
    window._msSkipChapter = false;
    window._msReviewMode = _review;   // ★ v4.81.0 B7 — 供 _msRunAct 判斷是否略過捏臉/名片/教學類 act
    var scenes = ch.scenes || [];
    var i = _review ? 0 : _msGetScenePos(cid);        // ★ 回顧一律從頭;正常播從續播點接續
    if(i >= scenes.length) i = 0;                     // 保險:超界則從頭
    var step = function(skipped){
      if(window._msSkipChapter){ done(); return; }
      if(i >= scenes.length){ done(); return; }
      if(!_review) _msSetScenePos(cid, i);            // ★ Q2:先記錄目前場景(退出後可續);回顧不記
      var sc = scenes[i]; i++;
      _msPlayScene(sc, cid, function(sk){ if(sk) window._msSkipChapter = true; step(); });
    };
    var done = function(){
      try{ var o = document.getElementById("mainstory-overlay"); if(o) o.remove(); }catch(_){}
      try{ var op = document.getElementById("mainstory-overlay-prev"); if(op) op.remove(); }catch(_){}  // ★ v4.68.1 清交叉淡入殘留
      if(!_review){                                    // 回顧模式:純重播·不動進度/發獎
        // ★ v4.81.0 C2 — 批次包住:清續播點 / 標章節完成 / 章節獎勵旗標 / 全通關獎勵旗標
        //   四筆本來各寫一次雲端,改為本地即時落地、雲端在 _msEndBatch 用最新狀態補寫一次。
        try{ _msBeginBatch(); }catch(_){}
        try{
          _msClearScenePos(cid);                       // ★ Q2:整章完成→清續播點
          _msMarkChapterDone(cid);
          _msEnsureChapterState(cid);                  // ★ v4.81.0 A2 — 跳過演出也保證套用狀態型變更(第六章覺醒)
          if(cid !== "prologue") _msGrantChapterReward(cid); // 序章不發獎(規格)
          _msGrantAllClearReward(); // 全通關檢查(冪等)
        }catch(_eD){ console.warn("[主線] 章節結算失敗", cid, _eD); }
        try{ _msEndBatch(); }catch(_){}
      }
      try{ window._msReviewMode = false; }catch(_){}   // ★ v4.81.0 B7 — 離開本章即清旗標(避免殘留影響下一章)
      if(onAllDone){ try{ onAllDone(); }catch(_e){} }
      else { try{ _msExitStoryBgm(); }catch(_){} }     // 無後續(首登序章)→ 還原關卡頁 BGM
    };
    // ★ v4.70.0 從頭播(i===0)→ 先播章節開場封面(封面圖+標題大字+開場曲·可跳過);中途續播不重播 cover
    var _beginScenes = function(){
      // ★ v4.81.0 A6 — 舊行為(此處無條件 _msEnterStoryBgm(cid))會與第一場景自己的 bgm 連切兩次:
      //   先 0.7s 淡入章節曲、緊接 0.8s 淡入場景曲,六章中五章中招(ch1 march→menu、ch2 march→menu-01、
      //   ch3 cutscene→taiwan-intro、ch5 cutscene→taiwan-boss、ch6 cutscene→boss-darkorb),聽起來很亂。
      //   修法:先看即將播的那一場有沒有自帶 bgm(含 none=停BGM);有就交給 _msPlayScene 切,這裡不動。
      try{
        var _fs = scenes[i], _fsBgm = (_fs && _fs.bgm) ? _fs.bgm : "";
        if(!_fsBgm){ _msEnterStoryBgm(cid); }
        else { window._msInStory = true; window._msCurBgm = null; }   // 只設旗標;曲子由該場景切(不預先搶播)
      }catch(_){ try{ _msEnterStoryBgm(cid); }catch(__){} }
      step();
    };
    if(i === 0 && typeof _msPlayCover === "function"){ _msPlayCover(cid, _beginScenes); }
    else { _beginScenes(); }
  };

  // ════════ 入口刷新(關卡頁 📖 主線劇情鈕·admin gating 比照 avatar)════════
  window._msEntryAllowed = function(){
    var gateOn = (typeof window._MAINSTORY_ADMIN_ONLY === "undefined") || window._MAINSTORY_ADMIN_ONLY === true;
    var isAdm = (typeof window._isAdminUser === "function" && window._isAdminUser());
    return (!gateOn) || isAdm;
  };
  window._msRefreshEntryVisibility = function(){
    try{
      var btn = document.getElementById("adv-mainstory-btn");
      if(!btn) return;
      var _ok = window._msEntryAllowed();
      btn.style.display = _ok ? "" : "none";
      // ★ v5.6.0 — 已完成章節進度徽章(老師需求1):按鈕右上角顯示「✅ 已完成 N / 7 章」;全通關改「🏆 全章完成」。
      //   單一更新出口:關卡頁顯示、雲端 hydrate、章節完成(_msMarkChapterDone)三處都會呼叫本函式,徽章不會過期。
      try{
        var _bd = document.getElementById("adv-mainstory-progress-badge");
        if(_bd){
          if(!_ok || typeof MAINSTORY_DB === "undefined" || !MAINSTORY_DB || !MAINSTORY_DB.order){
            _bd.style.display = "none";
          }else{
            var _bo = MAINSTORY_DB.order, _bdn = 0;
            for(var _bi = 0; _bi < _bo.length; _bi++){ if(_msChapterDone(_bo[_bi])) _bdn++; }
            _bd.textContent = (_bdn >= _bo.length)
              ? _msT("🏆 全章完成", "🏆 全部破完")
              : _msT("✅ 已完成 " + _bdn + " / " + _bo.length + " 章", "✅ 打完 " + _bdn + " / " + _bo.length + " 章");
            _bd.style.display = "";
          }
        }
      }catch(_){}
    }catch(_){}
  };

  // 開主線 → 章節選擇視窗(v4.68.0:標示已完成/未完成/回顧劇情·回顧可重播完整內容)
  window._msOpenMainStory = function(){
    if(!window._msEntryAllowed()){ try{ if(typeof _toast==="function") _toast("主線劇情準備中"); }catch(_){} return; }
    window._msOpenChapterSelect();
  };

  // ════════ 章節選擇視窗(v4.68.0)════════
  //   每章標示:✅已完成(可🔁回顧劇情重播完整內容)/ ▶未完成(進行/繼續)/ 🔒尚未解鎖(需先完成前一章)。
  //   進視窗即切入主線專屬 BGM;關閉還原關卡頁 BGM。
  var _MS_CH_TEASER = {
    prologue: { p:"追藍鵲迷路，墜入異世界，捏出屬於你的模樣", c:"追藍鵲迷路，掉進異世界，變出你的樣子" },
    ch1:      { p:"熱血籃球隊員與飛毛腿田徑隊員，加入你的隊伍", c:"熱血籃球隊員和跑很快的田徑隊員加入" },
    ch2:      { p:"程式設計師與電腦繪圖師，查出貓空的異變", c:"程式設計師和繪圖師，查出貓空的怪事" },
    ch3:      { p:"貓空靈氣被封印，劍士與祭司並肩淨化靈地", c:"貓空被邪術封住，劍士和祭司一起守護" },
    ch4:      { p:"杏花妖魅惑守衛與刺客，火法師破開妖林", c:"火法師用火燒開被迷惑的花林" },
    ch5:      { p:"深坑臭氣魔王作亂，神劍至寶就此現世", c:"打敗臭味魔王，得到神劍至寶" },
    ch6:      { p:"黑暗球降臨，主角覺醒的最終決戰", c:"黑暗球出現，主角覺醒的大決戰" }
  };

  window._msOpenChapterSelect = function(){
    if(!window._msEntryAllowed()){ try{ if(typeof _toast==="function") _toast("主線劇情準備中"); }catch(_){} return; }
    // ★ v5.6.0 丙2 — 開章節選單時補一次覺醒對帳(此時 avatarCard 必已載入完成,是最可靠的修復點;冪等)
    try{ if(_msChapterDone("ch6") && !window._protagAwakened) _msEnsureChapterState("ch6"); }catch(_){}
    try{ var _old = document.getElementById("mainstory-select-overlay"); if(_old) _old.remove(); }catch(_){}
    try{ _msEnsureBackdrop(); }catch(_){}             // ★ v4.68.1 常駐黑底
    try{ _msStopAmb(); }catch(_){}                    // ★ v4.70.0 進/回選單→停環境音(只留選單 BGM)
    try{ _msEnterStoryBgm(null); }catch(_){}          // 進選單→切入主線選單 BGM

    var order = MAINSTORY_DB.order;
    var firstUndone = order.length;
    for(var _i=0;_i<order.length;_i++){ if(!_msChapterDone(order[_i])){ firstUndone = _i; break; } }
    var doneCnt = 0; for(var _j=0;_j<order.length;_j++){ if(_msChapterDone(order[_j])) doneCnt++; }

    var ov = document.createElement("div");
    ov.id = "mainstory-select-overlay";
    ov.style.cssText =
      "position:fixed;inset:0;z-index:9790;overflow-y:auto;-webkit-overflow-scrolling:touch;" +
      "background:radial-gradient(circle at 50% 22%,rgba(70,40,120,0.96),rgba(14,8,30,0.98));" +
      "font-family:'M PLUS Rounded 1c','Nunito',sans-serif;padding:0 0 60px 0;";

    var wrap = document.createElement("div");
    wrap.style.cssText = "max-width:1000px;margin:0 auto;padding:34px 18px 0 18px;";
    ov.appendChild(wrap);

    // 標題 + 進度
    var head = document.createElement("div");
    head.className = "ms-sel-head";   /* ★ v5.26.0 手機適配 CSS 錨點(index.html media query 用·零行為變更) */
    head.style.cssText = "text-align:center;margin-bottom:22px;";
    var pct = Math.round(doneCnt / order.length * 100);
    head.innerHTML =
      "<div style=\"font-size:44px;font-weight:900;color:#ffd98a;letter-spacing:4px;text-shadow:0 0 24px rgba(255,190,90,0.5);\">📖 " +
        _msT("主線劇情", "主線故事") + "</div>" +
      "<div style=\"font-size:24px;color:#cfc0ff;margin-top:8px;letter-spacing:2px;font-weight:700;\">" +
        _msT("穿越異世界・和夥伴一起冒險", "穿越異世界・和夥伴冒險") + "</div>" +
      "<div style=\"margin:16px auto 0 auto;max-width:520px;background:rgba(0,0,0,0.35);border:2px solid rgba(200,170,255,0.5);border-radius:16px;height:26px;position:relative;overflow:hidden;\">" +
        "<div style=\"position:absolute;left:0;top:0;bottom:0;width:" + pct + "%;background:linear-gradient(90deg,#8a6cff,#ffcf6a);transition:width 0.4s;\"></div>" +
        "<div style=\"position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:#fff;text-shadow:0 1px 3px #000;letter-spacing:2px;\">" +
          _msT("進度", "進度") + " " + doneCnt + " / " + order.length + "</div>" +
      "</div>";
    wrap.appendChild(head);

    // 章節卡片
    order.forEach(function(cid, idx){
      var ch = MAINSTORY_DB.chapters[cid];
      var title = _msArtCute() ? (ch.titleC || ch.titleP) : (ch.titleP || ch.titleC);
      var tz = _MS_CH_TEASER[cid] || { p:"", c:"" };
      var teaser = _msArtCute() ? (tz.c || tz.p) : (tz.p || tz.c);
      var status = _msChapterDone(cid) ? "done" : (idx === firstUndone ? "current" : "locked");

      var card = document.createElement("div");
      card.className = "ms-ch-card";   /* ★ v5.26.0 手機適配 CSS 錨點(零行為變更) */
      var accent = status === "done" ? "rgba(120,220,150,0.75)" : (status === "current" ? "rgba(255,205,110,0.85)" : "rgba(150,150,170,0.4)");
      var op = status === "locked" ? "0.55" : "1";
      card.style.cssText =
        "display:flex;align-items:center;gap:18px;margin:0 auto 16px auto;padding:20px 22px;border-radius:20px;" +
        "background:linear-gradient(135deg,rgba(30,18,52,0.92),rgba(46,28,74,0.92));border:3px solid " + accent + ";" +
        "box-shadow:0 4px 22px rgba(0,0,0,0.35);opacity:" + op + ";";

      // 左:章序徽章
      var badge = document.createElement("div");
      var badgeTxt = status === "done" ? "✅" : (status === "current" ? "▶" : "🔒");
      badge.textContent = badgeTxt;
      badge.style.cssText = "flex:0 0 auto;width:64px;height:64px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:34px;background:rgba(0,0,0,0.3);border:2px solid " + accent + ";";
      card.appendChild(badge);

      // 中:標題 + 導言 + 狀態文字
      var mid = document.createElement("div");
      mid.style.cssText = "flex:1 1 auto;min-width:0;";
      var stLabel = status === "done" ? _msT("已完成", "完成了") : (status === "current" ? _msT("未完成", "還沒玩") : _msT("尚未解鎖", "還沒開"));
      var stColor = status === "done" ? "#8ee6a8" : (status === "current" ? "#ffd98a" : "#a9a9be");
      // ★ v4.81.0 B6 — 舊行為:未解鎖章節的標題、導言、場景縮圖全部照秀(只用 opacity 0.55 淡化),
      //   等於把黑暗球、神劍至寶、被魅惑的守衛刺客全部先劇透給玩家。
      //   修法:未解鎖章 → 標題改「第 N 章・？？？」、導言換成引導句、縮圖打霧+壓暗(見下方 rightCol)。
      var _lk = (status === "locked");
      var _shownTitle = _lk ? (_msT("第 ", "第 ") + (idx) + _msT(" 章・？？？", " 章・？？？")) : title;
      if(_lk && cid === "prologue") _shownTitle = _msT("序章・？？？", "序章・？？？");
      var _shownTeaser = _lk ? _msT("完成前一章就會揭曉這一章的故事。", "玩完上一章就知道這章在演什麼囉！") : teaser;
      mid.innerHTML =
        "<div style=\"font-size:30px;font-weight:900;color:" + (_lk ? "#b9b3cc" : "#fff") + ";letter-spacing:1px;\">" + _shownTitle + "</div>" +
        (_shownTeaser ? ("<div style=\"font-size:20px;color:" + (_lk ? "#9d97b4" : "#cdbcff") + ";margin-top:5px;line-height:1.4;\">" + _shownTeaser + "</div>") : "") +
        "<div style=\"font-size:18px;font-weight:800;color:" + stColor + ";margin-top:7px;letter-spacing:1px;\">" + badgeTxt + " " + stLabel + "</div>";
      card.appendChild(mid);

      // 右:動作鈕
      var btn = document.createElement("button");
      btn.style.cssText = "flex:0 0 auto;padding:14px 22px;border-radius:16px;font-size:22px;font-weight:800;letter-spacing:1px;cursor:pointer;border:none;color:#fff;touch-action:manipulation;";
      if(status === "done"){
        btn.textContent = "🔁 " + _msT("回顧劇情", "重看一次");
        btn.style.background = "linear-gradient(135deg,#4f86ff,#6a5cff)";
        btn.onclick = function(ev){ if(ev) ev.stopPropagation(); try{ if(typeof playSfx==="function") playSfx("sfx-sel",0.55); }catch(_){} _msPlayFromSelect(cid, true); };
      } else if(status === "current"){
        var resuming = (_msGetScenePos(cid) > 0);
        btn.textContent = resuming ? ("▶ " + _msT("繼續冒險", "繼續玩")) : ("▶ " + _msT("開始冒險", "開始玩"));
        btn.style.background = "linear-gradient(135deg,#ff9a3c,#ff6ab0)";
        btn.onclick = function(ev){ if(ev) ev.stopPropagation(); try{ if(typeof playSfx==="function") playSfx("sfx-sel",0.6); }catch(_){} _msPlayFromSelect(cid, false); };
      } else {
        btn.textContent = "🔒 " + _msT("未解鎖", "還沒開");
        btn.style.background = "rgba(90,90,110,0.6)";
        btn.style.cursor = "not-allowed";
        btn.onclick = function(ev){ if(ev) ev.stopPropagation(); try{ if(typeof _toast==="function") _toast(_msT("先完成前一章才會解鎖喔", "先玩完前一章才會開喔")); }catch(_){} };
      }
      // ★ v4.73.0 右欄:動作鈕 + 其下層嵌入該章「第一張場景插圖」當縮圖
      var rightCol = document.createElement("div");
      rightCol.style.cssText = "flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:10px;";
      rightCol.appendChild(btn);
      var _thumbImg = ""; try{ _thumbImg = _msFirstSceneImg(cid); }catch(_){ _thumbImg = ""; }
      if(_thumbImg){
        var thumb = document.createElement("div");
        // ★ v4.81.0 B6 — 未解鎖章的場景縮圖打霧(blur)+壓暗,只看得出有一張圖、看不出畫的是什麼
        thumb.style.cssText = "position:relative;overflow:hidden;width:190px;height:107px;border-radius:12px;"
          + "background:url(\"" + _msAsset(_thumbImg) + "\") center center/cover no-repeat,#0a0618;"
          + "border:2px solid " + accent + ";box-shadow:0 2px 12px rgba(0,0,0,0.45);"
          + (_lk ? "filter:blur(9px) brightness(0.42) saturate(0.5);" : "");
        rightCol.appendChild(thumb);
        if(_lk){
          var _lock = document.createElement("div");
          _lock.textContent = "🔒";
          _lock.style.cssText = "width:190px;height:0;position:relative;top:-70px;text-align:center;font-size:34px;"
            + "text-shadow:0 2px 10px #000;pointer-events:none;";
          rightCol.appendChild(_lock);
        }
      }
      card.appendChild(rightCol);
      wrap.appendChild(card);
    });

    /* ★★ v4.86.0 老師需求2 —— 章節選單新增「第七章」入口卡(目前無法進入·顯示「待續…」)
     *   ★ 刻意「不」加進 MAINSTORY_DB.order:
     *     order 是進度分母(X / 7)、解鎖判定(firstUndone)、全通關獎勵(_msGrantAllClearReward)、
     *     首登導入 hasAny 判定 的共同來源。若把 ch7 加進 order,現有玩家會瞬間變成「還沒全通關」、
     *     全通關獎勵發不出去、進度條倒退 → 故本卡為「純顯示層靜態卡」,零資料影響。
     *   ★ 日後第七章正式做好時:把 ch7 寫進 MAINSTORY_DB.chapters + order,並刪掉這張靜態卡即可。 */
    (function _msComingSoonCard(){
      try{
        var csCard = document.createElement("div");
        csCard.className = "ms-ch-card";   /* ★ v5.26.0 手機適配 CSS 錨點(與章節卡同版型·零行為變更) */
        var csAccent = "rgba(150,150,170,0.42)";
        csCard.style.cssText =
          "display:flex;align-items:center;gap:18px;margin:0 auto 16px auto;padding:20px 22px;border-radius:20px;" +
          "background:linear-gradient(135deg,rgba(26,16,44,0.92),rgba(38,24,62,0.92));border:3px dashed " + csAccent + ";" +
          "box-shadow:0 4px 22px rgba(0,0,0,0.35);opacity:0.7;";
        var csBadge = document.createElement("div");
        csBadge.textContent = "…";
        csBadge.style.cssText = "flex:0 0 auto;width:64px;height:64px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:900;color:#b9b3cc;background:rgba(0,0,0,0.3);border:2px dashed " + csAccent + ";";
        csCard.appendChild(csBadge);
        var csMid = document.createElement("div");
        csMid.style.cssText = "flex:1 1 auto;min-width:0;";
        csMid.innerHTML =
          "<div style=\"font-size:30px;font-weight:900;color:#b9b3cc;letter-spacing:1px;\">" +
            _msT("第七章・待續…", "第七章・待續…") + "</div>" +
          "<div style=\"font-size:20px;color:#9d97b4;margin-top:5px;line-height:1.4;\">" +
            _msT("異世界的故事還沒結束。新的篇章正在撰寫中，敬請期待！", "故事還沒完喔！新的一章正在寫，等一下下！") + "</div>" +
          "<div style=\"font-size:18px;font-weight:800;color:#a9a9be;margin-top:7px;letter-spacing:1px;\">📝 " +
            _msT("製作中", "還在做") + "</div>";
        csCard.appendChild(csMid);
        var csRight = document.createElement("div");
        csRight.style.cssText = "flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:10px;";
        var csBtn = document.createElement("button");
        csBtn.textContent = "📝 " + _msT("待續…", "待續…");
        csBtn.style.cssText = "flex:0 0 auto;padding:14px 22px;border-radius:16px;font-size:22px;font-weight:800;letter-spacing:1px;cursor:not-allowed;border:none;color:#fff;touch-action:manipulation;background:rgba(90,90,110,0.6);";
        csBtn.onclick = function(ev){
          if(ev) ev.stopPropagation();
          try{ if(typeof _toast === "function") _toast(_msT("第七章還在製作中，敬請期待！", "第七章還在做，等一下下喔！")); }catch(_){}
        };
        csRight.appendChild(csBtn);
        csCard.appendChild(csRight);
        wrap.appendChild(csCard);
      }catch(_csErr){ console.warn("[主線] 第七章待續卡建立失敗", _csErr); }
    })();

    // 全通關提示
    if(doneCnt === order.length){
      var clr = document.createElement("div");
      clr.style.cssText = "text-align:center;margin:6px auto 0 auto;font-size:24px;font-weight:900;color:#ffe08a;letter-spacing:2px;text-shadow:0 0 18px rgba(255,200,100,0.5);";
      clr.textContent = "🏆 " + _msT("全六章通關！你已走完異世界的旅程。", "全部通關！你走完異世界的旅程囉！");
      wrap.appendChild(clr);
    }

    // 關閉鈕(還原關卡頁 BGM)
    var closeBtn = document.createElement("button");
    closeBtn.textContent = "✕ " + _msT("關閉", "關閉");
    closeBtn.style.cssText = "position:fixed;top:16px;right:18px;z-index:2;background:rgba(0,0,0,0.55);color:#fff;border:2px solid rgba(255,255,255,0.5);border-radius:20px;padding:10px 22px;font-size:22px;font-weight:800;cursor:pointer;touch-action:manipulation;";
    closeBtn.onclick = function(){ try{ if(typeof playSfx==="function") playSfx("sfx-confirm2",0.4); }catch(_){} try{ ov.remove(); }catch(_){} try{ _msExitStoryBgm(); }catch(_){} };
    ov.appendChild(closeBtn);

    document.body.appendChild(ov);
  };

  // 從章節選單播一章:移除選單→播章(review=回顧)→播完回選單(讓玩家挑下一章/回顧其他章)
  function _msPlayFromSelect(cid, review){
    try{ var sel = document.getElementById("mainstory-select-overlay"); if(sel) sel.remove(); }catch(_){}
    window._msRunChapter(cid, function(){
      try{ if(typeof playSfx==="function") playSfx("sfx-confirm",0.5); }catch(_){}
      window._msOpenChapterSelect();                   // 回章節選單
    }, { review: !!review });
  }

  // ════════ 首登自動導入 gate(排 onAuth 序列最後·防疊加)════════
  window._msMaybeFirstLogin = function(){
    try{
      if(!window._msEntryAllowed()) return; // 測試期僅管理員
      // 防疊加:任一前置彈窗/戰鬥/過場在場則不導入
      var block = ["mainstory-overlay","adv-cutscene-overlay","taiwan-cutscene-overlay","taiwan-dialog-overlay",
        "style-onboarding-modal","_member-profile-modal","_member-hub-modal","_rescue-guide-modal","_audit-ov",
        "adv-wb-crash-notice","adv-crash-recovery-box","login-gate-modal","_camp-overlay"];
      for(var i=0;i<block.length;i++){ var el = document.getElementById(block[i]); if(el && el.offsetParent !== null) return; }
      try{ if(typeof _isInBattleNow !== "undefined" && _isInBattleNow) return; }catch(_){}
      // 僅首登(progress 空)自動導入序章;有進度者不自動彈(從入口自行進入)
      var p = _msProgress(), hasAny = false;
      MAINSTORY_DB.order.forEach(function(cid){ if(p[cid] === "done") hasAny = true; });
      if(hasAny) return;
      window._msRunChapter("prologue");
    }catch(_e){ console.warn("[主線首登] 觸發例外", _e); }
  };

})();
