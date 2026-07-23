// ════════════════════════════════════════════════════════════════════════
//  game_changelog.js  —  LXPSGAME 更新日誌
//  最後更新:2026-07-23  / 目前主程式版本:v4.85.0(造型工房三修+教學指引兩新章+主線第七章待續入口+序章對白閃過根治·管理員測試)
//  ★ 永久規則(老師 2026-07-18):管理員測試期間的功能,更新日誌條目一律加 adminOnly: true
//    (index.html _filterChangelogForDisplay 對非管理員整筆隱藏·不干擾學生);
//    功能正式開放時,另發玩家版開放公告(新條目·不標 adminOnly)。
//    目前已標 9 筆主角系統測試期條目:v4.55.0/v4.56.0/v4.58.1/v4.59.0/v4.60.0/v4.60.1/v4.61.0/v4.62.0/v4.63.0/v4.63.1
//
//  ★ 維護注意事項(老師請務必看):
//    1. 這個檔案必須是「合法的 JS」,結尾要有 `];` 把陣列關起來
//    2. 新增版本條目時:在 GAME_CHANGELOG = [ ... ] 內最上方插入新物件
//    3. 每個條目欄位必須用 `ver`(不是 version)、`items` 或 `brief`
//    4. 編輯完上傳 GitHub 後,index.html 內 _GAME_LOADED_VERSION 改新版本
//       會自動觸發瀏覽器破快取(?v=版本號)
//    5. 千萬不要只貼「補丁區塊」就上傳 — 那會讓整個檔案語法錯誤
// ════════════════════════════════════════════════════════════════════════

window.GAME_CHANGELOG = [
  // v4.85.0 — 六修:造型工房三修 + 教學指引兩新章 + 主線第七章待續入口 + 序章對白閃過根治
  {
    ver: 'v4.85.0',
    date: '2026-07-23',
    adminOnly: true,   /* ★ 造型工房測試期內容·僅管理員可見 */
    brief: [
      '🖼️【風景背景圖終於看得到了】在「背景圖片」挑好風景圖，卻一直被純白或漸層色蓋住的問題已修好：現在只要選了圖片，就會自動切換成圖片背景；把圖片取消掉也會自動退回純白底。',
      '🎨【漸層背景中間的白色變寬了】原本白色只有中間一小條，人物的袖子會壓在顏色上；現在白色會一路蓋到人物左右邊緣，只剩兩側細細的一條是你挑的顏色，看全身和看特寫都會自動調整寬度。',
      '👕【按「預設裝扮(素體)」會整個回到素體】以前只脫掉衣服、頭上的髮型還留著，看起來沒有真的回到原本的樣子；現在頭部也會一起換回預設，真正回到乾淨素體。',
      '📚【教學指引補齊兩大系統】遊戲指引新增「⑦ 主線劇情」與「⑧ 我的主角」兩章：主線怎麼進去、對白怎麼操作、每章給什麼獎勵；造型工房能調什麼、四顆重要按鈕、做好的樣子會用在哪裡，全部寫清楚了。',
      '📝【主線章節選單多了第七章】章節清單最下面新增「第七章・待續…」，讓大家知道故事還沒完；目前還在製作中，點下去會提示敬請期待，不影響現有進度與獎勵。',
      '💬【序章對白不再一閃而過】以前一次點擊常常會連跳兩句、來不及讀完就消失；現在每句話至少停留一下才吃得到下一次點擊，也修好了「上一個場景殘留的點擊」偷偷推掉對白的問題。',
      '👗【重看劇情時可以自己決定要不要捏臉】以前按「🔁 回顧劇情」重看序章，造型工房與名片會被直接跳過；現在改成跳出小視窗問你「要順便調整造型嗎？」，要進要跳都由你決定，看完關掉就接著播。',
      '🔊【劇情音效切換更乾淨】進造型工房或看名片時，會先把劇情的環境音（水聲、森林聲）淡出，關掉之後再自動接回來，不會三層聲音疊在一起。',
    ],
    items: [
      '【需求1・背景圖被蓋住】根因:背景圖(cfg.bg)與背景樣式(cfg.bgType)是兩個獨立分頁，玩家在「背景圖片」選了圖，bgType 仍停在 0(純白)或 1(漸層)',
      '→ _bgLayer 走不到 bt===2 圖片分支，畫面永遠是純色。修法:_avatarSetPart 新增 bg 分支，選到有效圖(id>0)自動設 bgType=2;取消圖(id=0)且目前為圖片型 → 退回純白。',
      '→ 對稱補上 bgC 分支:目前是「純白」時點漸層顏色自動切成漸層型;目前是「圖片」型則只記顏色不動背景(避免手滑點色票就把選好的風景圖蓋掉)。',
      '【需求2・白帶擴大】新增可調常數 _AV_BG_WHITE = { full:[0.33,0.67], port:[0.16,0.84] } 與 _AV_BG_FADE = 0.10(白↔色柔和過渡帶寬度)',
      '→ 數值來源=實測 body_torso_boy/girl/kidboy/kidgirl 四張 alpha bbox 換算成卡片座標取最寬。特寫模式人物被放大約 2.4 倍，故依 portrait 分流兩組寬度，兩種檢視都剛好蓋到袖口。',
      '→ 舊固定值(0/25/42/58/75/100)保留為註記，誤刪是大忌。漸層 id 仍走全域流水號 _avGradSeq，好友名片縮圖網格不會互相污染。',
      '【需求3・回預設素體】_avatarSetPart 的 outfit 分支由「id>0 才清髮型整頭件」改為一律 cfg.hh = 0',
      '→ 按「預設裝扮(素體)」時頭部同步回到素體頭;選其他套裝的行為完全不變(套裝本就自帶頭件)。',
      '【素材快取】本版 bump 了 AVATAR_DB_VERSION → 部件圖 URL 帶 ?v=v4.85.0 → SW/瀏覽器/CDN 全數 cache miss 強制重抓(一次性·屬預期)',
      '【需求4・教學指引】_showNewbieGuide 的 PAGES 由 6 章擴為 8 章(⑦主線劇情 / ⑧我的主角),render + renderSimple 雙版齊備(鐵律1.232)',
      '→ 章節總數改動態 window._nbgTotal(取代兩處寫死 TOTAL=6);兩新章依 _msEntryAllowed / _avatarGateAllowed 守門,測試期對學生自動隱藏,功能開放時自動出現免再改碼。',
      '【需求5・第七章入口】章節選單最後追加靜態「第七章・待續…」卡(虛線框/📝製作中/點擊 toast 敬請期待)',
      '→ ★ 刻意不寫進 MAINSTORY_DB.order:order 同時是進度分母、解鎖判定、全通關獎勵與首登導入的來源,加進去會讓現有玩家瞬間變成未全通關、全通關獎勵發不出去。日後第七章做好再正式入 order 並移除此卡。',
      '【需求6・對白閃過】新增 _MS_ADV_LOCK_MS=450 最短停留鎖:每次 showLine 記時間戳,鎖內一律忽略點畫面/下一句/上一句的推進輸入',
      '→ 根因三條:①封面或上一場景那同一下點擊在新 overlay 建立後補送 click ②iPad 觸控合成 click 連推兩句 ③舊場景改名成 mainstory-overlay-prev 後 onclick 仍掛著舊 _msAdvance 閉包;第三條另加 old.onclick=null + pointerEvents:none 根治。',
      '【需求6・回顧模式工房】_MS_REVIEW_SKIP_ACTS 對 open_avatar_studio / set_card 由靜默略過改走 _msReviewOptionalAct 詢問視窗(2 分鐘兜底自動續播);tutorial_* 維持略過',
      '【需求6・音效切換】_msActOpenStudio / _msActSetCard 開場記 _msAmbKey 並 _msStopAmb(),_resume 時 _msStartAmb 接回 → 工房影片背景/名片 BGM 不再與劇情環境音疊播',
      '【本輪檔案】avatar_db.js(造型工房三修)+ index.html(教學指引/第七章卡/主線對白與音效);admin_panel.js / game_changelog.js 僅版號同步與公告',
    ],
  },
  // v4.83.0 — 主角卡片背景大功能(批A)+主角 R/SSR 兩階段+主角天賦與爆發重設計
  {
    ver: 'v4.83.0',
    date: '2026-07-23',
    adminOnly: true,   /* ★ 造型工房與主線劇情測試期內容·僅管理員可見 */
    brief: [
      'Ὓc️【卡片背景大功能】造型工房新增「卡片背景」：卡框固定 7:10、人物佔 80%，背景可選純白、左右對稱漸層色，或 47 張遊戲場景圖！',
      'ὀ9【背景怎麼拿】BOSS 戰場圖＝用「我很會」難度打贏該 BOSS；關卡與主線場景圖＝通關時每張各 5% 機率；鬥技場＝鬥技之證 ×20 兌換；召喚星空＝召喚 1% 機率。',
      '⭐【主角兩階段】主角先以 R 卡登場；打完主線第六章覺醒後，R 卡隱藏、SSR「主角‧覺醒」解鎖並亮出解鎖大卡！兩張卡的立繪都是你在造型工房捷的臉。',
      'ἰc【主角天賦重新設計】「異界旅人的歇息」：休息時能量多回 1 點，而且回 HP 改成「全隊一起回」(Lv1 各回最大HP的 10%，每升 1 級 +5%)。',
      '✨【主角爆發重新設計】「異界之力」：使自己以外的友方全體各恢復 1 次極限爆發使用次數，每升 1 級另有 5% 機率額外再恢復 1 次！',
      'ὒ7【顆色功能修復】造型工房點膚色/髮色/服裝配色會跳「還沒解鎖」的問題已修好；最深的膚色因會出現臉上雜點已暂時移除(其餘顏色位置不變)。',
    ],
    items: [
      '【卡框 7:10】畫布改 350×500，人物座標系 360×480 完全不動，外面再包一層 translate(25,50) scale(0.833333) 卡框群組做映射',
      '→ 所有部件定位/prop 幾何/位置微調/特寫矩形全部零改動。造型工房左預覽/冒險者名片/好友名片縮圖三處統一。',
      '【背景三型】cfg.bgType 0=純白 / 1=左 25% 色C → 中 50% 純白 → 右 25% 色C / 2=圖片(cfg.bg)；cfg.bgC 色票同服裝配色 16 色',
      '【漸層 id 唯一】同一頁好友名片縮圖網格會同時出現多張卡，漸層 id 撞名會互相污染 → 改用全域流水號 _avGradSeq',
      '【P.bg 48 筆】既有 id/檔名全保留(舊存檔相容)，新款一律 id≥20；分群 grp=free6/boss18/scene6/special3/story15',
      '【影響告知】既有 id2/3/4/5/6/7/9/13(玉山頂/阿里山/台北101/三峽/深坑/彰化/大天狗神社/法老王座)原為免費，本版改為 BOSS「我很會」通關解鎖',
      '→ 因造型工房仍是管理員測試期(_AVATAR_ADMIN_ONLY=true)，目前零學生受影響；要改回免費只需把該款 lock 改回 null。',
      '【四種解鎖管道】BOSS「我很會」通關 / 關卡通關 5% / 主線章節通關 5% / 召喚 1% / 鬥技之證×20 兌換',
      '→ 帳本沿用 avatarCard.unlock(key = bg:<id>)，與部件解鎖/GM 上鎖/儲存時自動脫下未解鎖 完全同一組鍵，不新增任何雲端欄位。',
      '【放棄項】鬥技場/召喚星空的動態影片背景不釋出(SVG 不能播影片，且同頁多支 video 會拖垮舊 iPad)，改釋出同場景的靜態圖版本',
      '【主角兩階段】HERO_DB 戰鬥/編組/存檔永遠只有一隻「主角」；另建圖鑑專用別名「主角‧覺醒」(SSR)，依覺醒旗標互藏',
      '→ 覺醒別名永不寫進 unlockedHeroes，三槽合併/倒退守門/帳本稽核零影響；_isProtagHero 同時認兩個名字，鬥技場/編組/召喚池 11 處過濾器自動涵蓋。',
      '【主角立繪】_avatarRenderSVG(cfg,null,true) → data-URI 寫進 HERO_IMGS；未捷臉 → 預設男童(力行運動服)；儲存造型後自動重刷',
      '【天賦實作】doRest hook：能量額外 +1(合計 +2)，休息 HP 恢復改全體(不可復活)，10%+5%/級 加算；天賦被封印時退回一般版休息',
      '【爆發實作】_runBurst 主角分支：對自己以外存活友方 _burstUsed 減 1(不低於 0·本來沒用過不浪費也不超額)，5%/級 額外再減 1',
      '→ 純輔助零傷害，未新增任何傷害路徑 → 不涉鐵律 1.31 世界 BOSS 保護。舊「凡人的臨摹大師」實作與升級表全數保留為註解。',
      '【顆色功能修復】_avatarIsUnlocked 開頭加非部件分類白名單 _AV_NON_PART_CATS 早退(色票/開關類本就不是部件，P 底下沒有同名陣列 → 舊碼一律判成未解鎖)',
      '【膚色隱藏】_AV_HIDDEN_COLORS 採「陣列原地保留 + UI 不渲染 + 已選到自動退回鄰近色」，絕不直接刪除(cfg.skin 存的是索引值，真刪會讓舊存檔整排位移)',
      '【素材快取】本版 bump 了 AVATAR_DB_VERSION → 部件圖 URL 帶 ?v=v4.83.0 → SW/瀏覽器/CDN 全數 cache miss 強制重抓(一次性·屬預期)',
      '【待补素材】主線_第一章_河堤運動公園.png 仍 404(主線第一章引用中會破圖·優先)、台灣關卡首頁背景.png 仍 404',
      '【下一輪(批B)】頭戴/眼鏡/嘴部飾品全系列可染色 + 商店「὆4 主角裝扮」24 款上架(50000 幣/款)',
    ],
  },
  // v4.81.0 — 主線劇情大修:對白精緻化(乙案)+18 項 BUG 與體驗修正
  {
    ver: 'v4.81.0',
    date: '2026-07-22',
    adminOnly: true,   /* ★ 主線劇情測試期內容·僅管理員可見(_MAINSTORY_ADMIN_ONLY) */
    brief: [
      '🎭【主線對白大幅加料・七章共新增 52 句】以前夥伴們各講各的、笑點幾乎只有主角在心裡吐槽;現在每一章都加了 1~2 組「你一言我一語」的來回互動,角色個性也拉開了:小劇團員‧善行愛演、直笛團員‧誠欣面癱吐槽、弦樂團員‧真音愛用音樂比喻、動物學家‧小真老師可靠。像序章組隊時誠欣說「五線譜也是五條線,這個數字我很滿意」,善行報班底「有主角、有前輩、有負責演的、有配樂的」,真音追問「那負責吐槽的是誰?」,誠欣回一句「……我。」主角也不再只會心裡想,開始會開口說話了。',
      '😆【反派也有笑點了】杏花妖被善行拆穿「登場台詞也太完整了吧,連笑聲都排練過」,牠大方承認「難得來了觀眾,總不能隨便呵呵兩聲」;臭氣魔王聽到誠欣摀著鼻子說「這個味道,有層次」,竟然當成知音大喊「這孩子我不打了!」誠欣只回「我沒有在稱讚你。」',
      '👤【第三、四章的夥伴補上專屬姓名】劍士‧勇直、祭司‧慈光、守衛‧守恆、刺客‧夜影、火法師‧烈心。以前只有前八位有名字,同一段對話裡「動物學家‧小真老師」旁邊站著光禿禿的「劍士」,現在風格一致了。',
      '⏭【「跳過演出」改成「跳過這一段」】以前這顆鈕按下去會直接跳完整章,戰鬥、夥伴加入、發劍、主角覺醒全部略過,章節卻照樣算完成、獎勵照領——連按七次兩分鐘就能把主線獎勵全部拿走。現在改成只快轉「目前這一段對白」,演出和獎勵都不會被繞過,想快點看完劇情還是可以一直按,但該看的關鍵演出一個都不會少。',
      '🎁【章節通關獎勵改版:5 召喚水晶 + 2 萬知識幣】每一章通關固定給這兩樣,而且綁定你的帳號、一輩子只能領一次。同時取消了「主線夥伴重複時補 5 顆召喚水晶」的舊規則——那是唯一可能被重複觸發的漏洞,拿掉之後,不管在哪台平板、重整幾次,主線獎勵都不會再多發或少發。',
      '🤝【「新夥伴加入」不再誤導】序章、第一章、第二章跳出來的那八位(小劇團員/直笛團員/弦樂團員/動物學家/籃球隊員/田徑隊員/程式設計師/電腦繪圖師),其實是你建立帳號就送的初始夥伴,以前一律寫「🌟 新夥伴加入隊伍!」害大家跑去圖鑑找不到新角色。現在會分開顯示:真的新解鎖才寫「🌟 新夥伴解鎖!」,原本就有的寫「🤝 夥伴加入隊伍」。另外第三章的劍士與祭司改成「大卡跳出來的當下就入帳」,不用等整章播完。',
      '📖【前情提要修正+章節選單不再劇透】第一章的回顧原本寫「在雙月河堤遭遇陰影怪物」(那是序章的場景、也沒有陰影怪物),第三章寫「淨化了九尾空貓怪」(正片根本沒出現過牠),兩則都改成與劇情相符的內容。章節選單裡還沒解鎖的章節,標題改成「第 N 章・？？？」、場景縮圖打上霧,不會再把黑暗球、神劍、被魅惑的守衛先爆雷給你看。',
      '🔁【回顧劇情不再被抓去捏臉】按「🔁 回顧劇情」重看序章時,以前會再被強迫進造型工房捏一次臉、再看一次名片;重看第一章又要被 11 步戰鬥教學攔一次。現在回顧模式只播故事,這幾樣會自動略過(戰鬥演出、夥伴加入這些劇情的一部分照播)。',
      '⏰【教學卡與造型工房不會再被自動關掉】戰鬥教學卡原本只給 30 秒就強制關閉續播,還在讀就被踢走;造型工房也只給 3 分鐘,捏臉超時劇情會自己跑掉、新畫面躲在工房底下看不到。現在分別放寬到 5 分鐘與 20 分鐘。',
      '🎵【章節音樂不再連切兩次】進入章節時原本會先淡入一首章節曲,緊接著第一個場景的音樂又蓋上來,六章有五章都這樣,聽起來很亂。現在會先看第一個場景有沒有自己的音樂,有就直接播它。另外章節封面音樂統一使用「章節音樂.m4a」。',
      '🙋【主角終於會顯示你的名字了】對白框裡的主角一直只顯示「你」——原本要接的兩條路都是壞的(一個沒人寫入、另一個函式根本不存在)。現在接回你在造型工房設定的暱稱。',
      '🛠【其他修正】第六章按跳過不會再發生「章節顯示完成、主角卻沒有覺醒」;跳過影片後 6 秒不會再突然蹦出已經結束的演出;第二章商店教學補上背景圖不再瞬間掉成空白;已經看過戰鬥教學的人,主線只會播 4 步核心複習而不是整套 11 步;章節結算的雲端存檔由 4 次合併成 1 次。',
    ],
  },
  // v4.80.0 — 主線至寶實發+解鎖至寶大卡 / 造型解鎖條件全面接線 / 未解鎖部件可預覽
  {
    ver: 'v4.80.0',
    date: '2026-07-22',
    adminOnly: true,
    brief: [
      '⚔️【主線第五章・神劍終於真的拿得到了】以前打完第五章,畫面會跳出「神劍至寶現世!」,可是至寶欄裡什麼都沒有——那把劍其實從來沒有真的發給你。現在修好了:打敗發酵魔王之後,【深坑臭豆腐神劍】會正式進到你的至寶欄(攻擊+10、特技+5、爆擊率+30%),而且跟抽到新角色一樣,會跳出一張大大的「解鎖至寶」獎勵卡,上面有至寶的圖、名字、稀有度、加了哪些素質、以及能力說明,看完按「太棒了!」就繼續播劇情。已經有這把劍的人不會被覆蓋等級。',
      '👤【打完主線章節,造型工房就多一樣東西】從序章到第六章,每通關一章就解鎖一款配件:序章→酷炫墨鏡、第一章→趕時間吐司、第二章→學生帽、第三章→瀟灑葉子、第四章→櫻花瓣、第五章→棒球帽、第六章→黑色口罩。解鎖時畫面上會跳出提示,直接去「👤 我的主角」就能換上。',
      '👘【日本關卡・八岐大蛇】用「我很會」難度打贏日本關卡的最終BOSS八岐大蛇,造型工房就解鎖【日式和服】,四種體型(少年/少女/男童/女童)都能穿。不用拿S評價,也不用收服牠,打贏就算。',
      '🪄【埃及關卡・法老王與埃及豔后】用「我很會」難度打贏埃及關卡的最終BOSS,一次解鎖四款魔法師服:赤紅(少年)、紫電(少女)、翠綠(男童)、水藍(女童)。同樣不看評價,打贏就算。',
      '👀【還沒解鎖的東西,現在可以先穿起來看看】造型工房裡還沒拿到的配件不再是灰灰的點不動,而是可以直接點下去穿在身上預覽,同時跳出小視窗告訴你「這款要怎麼拿」(例如「打完主線第三章就拿得到!」)。還沒安排取得方式的款式會顯示「敬請期待」。★注意:試穿的東西不能存檔——按「確認儲存」時會自動幫你脫下來,並告訴你脫掉了哪些,等真的解鎖之後才能永久穿上。',
      '💄【造型工房・移除沒有作用的「嘴巴位置」調整】嘴巴分頁裡原本有一排「嘴巴位置」的上下左右按鈕,但那個圖層其實畫不出來,按了不會有任何變化,已經移除。同一頁的「嘴部飾品位置」照常可以調。',
      '🎬【主線序章不再播覺醒影片】老師調整:覺醒的橋段改在第六章、打黑暗球之前才發生,序章那段影片已移除(序章原本就沒有這支影片檔,以前會直接跳過)。',
    ],
    items: [
      '★ v4.80.0【主線至寶實發 + 解鎖至寶大卡・index.html】①新增 _msGrantStoryTreasure(tid):走既有台灣至寶路徑(window._taiwanTreasureData[tid]={lv:1,exp:0,equippedTo:null} → _saveTaiwanTreasureData → _advSaveTreasureUnlockHistory(tid,mainstory_clear) → _lxpsInstantPersist),已擁有直接 return false 冪等不覆蓋等級/裝備狀態 ②_msGrantChapterReward 的 ch5 crystal5_sword 分支由「僅發水晶」改為「水晶+實際發劍」(v4.78.0 以前註解自承由批次2 接·從未接線) ③新增 _msTreasureCardHtml(tid)+_msActTreasureReveal(tids,onDone):規格對齊 v4.79.0 join 角色大卡(overlay z9975·分頁·watchdog 3分鐘),內容取自 TAIWAN_TREASURES(iconUrl/icon fallback/rarity 徽章/baseStats 晶片/abilityText/desc) ④_msActGrantSword 金光演出結束改呼叫 _after():實際入帳 → 解鎖至寶大卡 → 續播;catch 分支同樣先試 _after 再退回 onDone;舊行為保留註解。',
      '★ v4.80.0【造型解鎖條件全面接線・avatar_db.js + index.html】①avatar_db.js 新增 AVATAR_UNLOCK_HOW(key=cat:id·與 _avatarIsUnlocked/GM 上鎖同一組鍵·雙版文案鐵律1.232)共 12 筆 ②新增 window._avatarGrantUnlock(keys):寫 avatarCard.unlock 帳本+本機存檔+雲端 fire-and-forget+工房開著即時重繪,回傳本次新解鎖 key 陣列(冪等) ③12 款由 lock:null 改 lock:{t:quest}——gls:5 酷炫墨鏡/mouthacc:1 趕時間吐司/hat:4 學生帽/mouthacc:3 瀟灑葉子(★老師寫「瀟灑的葉子」·repo 實名無「的」)/mouthacc:6 櫻花瓣/hat:5 棒球帽(★hat 有兩筆同名·id2 為舊 SVG 版早已 soon 且無素材·本輪只鎖 id5 圖片版 hat_baseball.png)/mouthacc:8 黑色口罩/outfit:2 日式和服/outfit:5,9,11,13 四款魔法師服 ④index.html 新增 _MS_STORY_AVATAR_GRANTS 七章對照表 + _MS_AVATAR_NAME + _msShowAvatarUnlockToast,掛進 _msGrantChapterReward(沿用既有 _msRewardFlagGet 冪等旗標) ⑤日本:_mainBoss===八岐大蛇 且 _advPlayerDifficulty 含「我很會」→ 解 outfit:2(不限評價/是否收服) ⑥埃及:_adventureStage===egypt 且 _advPlayerDifficulty 含「我很會」→ 解 outfit:5/9/11/13。★現行選單 setTab 只掛 P.outfit(P.full/headfull/bodyfull 為 v4.61.0 舊系統已不在選單)故只需鎖 outfit 一組鍵。',
      '★ v4.80.0【未解鎖部件可預覽(甲案)・avatar_db.js】①★反轉 v4.66.0 決策4:原「GM 上鎖款對非管理員完全隱藏」改為一律顯示(舊 if 保留註解) ②未解鎖按鈕由 cursor:not-allowed 改可點 → _avatarPreviewLocked(cat,id,name):套上身預覽 + 彈 _avatarShowUnlockHow 遊戲內小視窗(非 alert·查 AVATAR_UNLOCK_HOW·查無顯示「敬請期待」);選中時邊框轉金色標「預覽中/試穿中」 ③_avatarSetPart 加第三參數 _allowLocked:未解鎖 id 一律改走預覽路徑(避免遞迴) ④甲案還原 window._avatarStripLocked():驗證式逐槽重判(outfit/hairhead/hat/gls/mouthacc/mouth/held)凡選了但未解鎖一律歸零(outfit 另清 ofHead/full/headf/bodyf),掛在 _avatarSaveToCloud 開頭 → 所有存檔路徑統一把關,順帶清乾淨舊存檔殘留;_avatarSaveClick 於存檔後 alert 告知脫掉了哪些 ⑤_avRenderOpts 頂端加常駐提示條(同一組槽位定義·單一真相) ⑥GM 專用「🎁」鈕:lock.t===quest 且未入帳時顯示,直接寫 unlock 帳本供老師實測解鎖後效果(不必真的通關)。',
      '★ v4.80.0【其他・index.html / avatar_db.js】①序章 scene 移除 video:主線_序章_定形覺醒.mp4(該檔 repo 為 404·原本就靜默略過),保留 act:open_avatar_studio;第六章 主線_第六章_主角覺醒.mp4 未動 ②_AV_TABS mouthTab.adj 移除 [mouth,嘴巴位置,嘴嘴位置](P.mouth 只有 svg/_offImg·渲染抓的 .img 不存在=該排按鈕調的是畫不出來的圖層),保留 [macc,嘴部飾品位置];舊值保留註解 ③9 版號同步點全對齊 v4.80.0;hero_db.js 未動維持 v4.54.0;CURRENT_BOOT_VER 永久凍結未動;admin_panel.js 僅版號同步·無真 ?.。',
    ],
  },
  // v4.79.0 — 主線加入夥伴角色解鎖大卡 + 管理員造型預設/上鎖雲端同步修正 + 我的主角入口搬家
  {
    ver: 'v4.79.0',
    date: '2026-07-22',
    adminOnly: true,
    brief: [
      '📖【主線劇情・新夥伴登場大卡(測試中)】劇情裡有新夥伴加入隊伍時,除了原本浮現名字的演出,接著會跳出一張大大的角色卡:完整立繪、角色名字、兩個技能(含要花多少能量)和極限爆發的說明,規格跟召喚抽到新角色時看到的那張一模一樣。一次只看一位,按「▶ 下一位」換下一個,上方會顯示「第幾位 ／ 共幾位」,看完最後一位按「太棒了!」就繼續播劇情。序章一次登場四位、第一章兩位、第二章兩位、第三章兩位、第四章三位,現在都看得到他們長什麼樣子、會什麼招。卡片上的名字用劇情裡的稱呼(例如動物學家‧小真老師),但圖片與技能還是取自英雄圖鑑本人,不會對不上。',
      '👤【管理員造型預設與上鎖・真正套用到全體玩家】修好一個藏得很深的問題:老師在造型工房把每個部件的位置與大小調好、按「📌設為預設」之後,那份預設其實只有在「打開造型工房」的當下才會從雲端抓下來,而且重新整理網頁就忘記了。結果學生在「冒險者名片」、「好友名片牆」以及主線劇情展示名片的地方,看到的都是沒有套上老師預設的版本,位置會跑掉。現在改成三點:①登入完成就先把老師設好的預設與上鎖名單抓下來,不必等學生點開造型工房;②抓下來的內容會存在平板本機,重新整理網頁、甚至暫時沒網路也還在;③打開造型工房那一瞬間,不會再閃過一下「本來應該被鎖住的款式」。老師改完預設或鎖定後,學生下次登入(或重新打開造型工房)就會套用。',
      '🗂【「👤 我的主角」入口搬家】原本放在冒險選關頁一長串按鈕的中間,現在移到「⚔️ 英雄圖鑑」畫面最上方、標題的左邊,和「← 返回」在同一排,一進圖鑑就看得到,不用再往下捲。功能完全一樣,一樣是管理員測試期間才看得見。',
    ],
    items: [
      '★ v4.79.0【主線加入夥伴角色解鎖大卡・乙案·index.html】①新增 _msJoinCardHtml(nm):單位夥伴大卡 HTML,規格對齊 _showSummonRareHeroPreview(立繪 min(70vw,300px) 1:1 金框 + 名稱 + s1/s2(技能名/能量🔷/說明) + 💥極限爆發);圖片走 HERO_IMGS[原名]·技能走 HERO_DB[原名]·爆發走 BURST_DB[原名],顯示名走 _msStoryName(劇情專屬姓名)→ 底層 key 完全不動;img onerror 退回 AVATARS emoji 不留破圖;新增 _msEscTx 對 名稱/技能名/說明 做 <>& 逸出(13 位夥伴實測資料無 HTML,純防未來學生設計英雄) ②新增 _msActJoinReveal(names,onDone):分頁 overlay(z-index 9975·淡入淡出),一次一位,底部按鈕「▶ 下一位」/最後一位「太棒了!」,list.length>1 才顯示「n ／ 共」頁碼;切換播 sfx-summon-reveal、結束播 sfx-confirm;onclick 走 window._msJoinRevealNext(全域可達·逐位順序播放不互相覆蓋);3 分鐘 watchdog 兜底防卡死 ③_msActJoin 尾端由「文字浮現完直接 onDone」改為「浮現完 → _msActJoinReveal(names,onDone)」,catch 分支也先試大卡再退回 onDone;舊行為保留為註解(誤刪是大忌) ④★乙案:_showSummonRareHeroPreview(抽卡結果預覽)完全未改動,零回歸風險;代價是日後改卡片規格需兩處同步 ⑤已逐名核對 13 位夥伴(小劇團員/直笛團員/弦樂團員/動物學家/籃球隊員/田徑隊員/程式設計師/電腦繪圖師/劍士/祭司/守衛/刺客/火法師)HERO_IMGS+HERO_DB(s1/s2)+BURST_DB 全數齊備。',
      '★ v4.79.0【管理員造型預設/上鎖雲端同步三項修正・avatar_db.js】根因:gameConfig/avatarLocks 與 gameConfig/avatarPartDefaults 兩張表只在 _avatarPanelOpen 內 getDoc 拉一次(唯一呼叫點),且為純記憶體全域變數不落地 → ①玩家沒開過造型工房 → _avatarPartDefaults 為空 → _avEffPos 退回 [0,0,0] → _avatarOpenCard(📇名片)/好友面板名片縮圖網格(v4.63.0)/主線 set_card 演出全吃不到管理員預設,位置尺寸跑掉 ②重整即歸零 ③開工房先渲染一次舊表,0.3~1 秒空窗期鎖款露出可點 ④離線/讀取失敗 fail-open。修正:①新增 _avatarCacheTables/_avatarLoadTablesFromLS(localStorage 鍵 lxps_avatarGmLocks / lxps_avatarPartDefaults),兩 loader 拉回後與兩個 GM 寫入點(_avatarGmToggleLock/_avatarSetPartDefault)皆同步落地 ②檔尾 _avatarLoadLocal() 之後先 _avatarLoadTablesFromLS() 用快取墊底 ③新增 _avatarBootSyncTables()+1.5s×20 輪詢等 _fbDb/_fbFns 就緒(登入完成)即 Promise.all 拉一次兩表後停,拉回若 _avatar-panel 開著則 _avRefreshPreview+_avRenderOpts 重繪。firestore.rules 已涵蓋(gameConfig:登入者可讀·isAdmin 可寫)不需改。成本:每位玩家每次登入多 2 次 gameConfig 讀取(一次性非輪詢)。仍為 getDoc 非 onSnapshot → 學生正開著工房時老師改設定,需關掉重開才生效。',
      '★ v4.79.0【👤 我的主角入口移至英雄圖鑑標題列・index.html】①冒險選關頁原 class=adv-event-btn 兩行大按鈕停用,整段舊 HTML 完整保留為註解(誤刪是大忌·日後要搬回可直接還原) ②hero-page-overlay 標題列 inner flex 內、「⚔️ 英雄圖鑑」標題之前插入緊湊版單行按鈕,id 沿用 adv-avatar-btn → avatar_db.js _avatarRefreshEntryVisibility 的管理員 gating 與 30 秒輪詢完全不用改(新位置同為靜態 DOM 常駐,overlay 隱藏時元素仍在),_AVATAR_ADMIN_ONLY 仍是正式開放的單一開關 ③_SIMPLE_TEXT_MAP[adv-avatar-btn] 由兩行含 <br> 副標的 cute 版改為單行「👤 打扮自己」(原值保留註解),避免簡單風把標題列撐爆 ④按鈕 display:none 靜態,_avatarRefreshEntryVisibility 設 style.display=空字串後回到 button 預設顯示,不依賴 flex。',
      '★ v4.79.0【版號】9 同步點全對齊 v4.79.0(index.html _GAME_LOADED_VERSION + _LXPS_FILE_VERSIONS 四鍵 index/avatar_db/admin_panel/game_changelog、AVATAR_DB_VERSION、ADMIN_PANEL_VERSION、changelog 檔頭 + 置頂 ver);hero_db.js 本輪未動維持 v4.54.0;CURRENT_BOOT_VER 永久凍結未動;admin_panel.js 僅版號同步·無真 ?.。AVATAR_DB_VERSION 隨版 bump → avatar_parts 部件圖一次性帶新 ?v= 重抓(小流量峰值·屬預期)。',
    ],
  },
  // v4.78.0 — 主線劇情:動作音效缺檔回退近義音 + 教學引導戰鬥六場全接線·管理員測試
  {
    ver: 'v4.78.0',
    date: '2026-07-22',
    adminOnly: true,
    brief: [
      '📖【主線劇情・音效補齊 + 教學戰鬥(測試中·未開放)】兩項升級:①還沒錄好的劇情音效,先自動借用遊戲裡意思最接近的技能音效頂上(例如登場借召喚角色、護盾借守護、恢復借治癒魔法),劇情不再有一段一段的靜默;等正式音效上傳後會自動改用正式的,不必再改程式。②六場劇情戰鬥全部做好了——第一章第一戰會用卡片一步一步帶你認識戰鬥操作(可以上一步、下一步、也可以跳過),接著播出戰鬥與勝利演出,其餘五場則直接播戰鬥與勝利,劇情從頭到尾走得完。③每一張教學卡片下面,主角都會忍不住吐槽一句(像是「有 AI 幫我打,那我站在這裡幹嘛」),把教學裡難免會提到的遊戲介面名詞,變成主角的個性。④八位夥伴在劇情裡有名字了:動物學家‧小真老師、小劇團員‧善行、弦樂團員‧真音、籃球隊員‧力強、田徑隊員‧阿動、電腦繪圖師‧活靈、程式設計師‧知理、直笛團員‧誠欣(只在劇情對白中出現,英雄圖鑑、召喚、戰鬥、編組一律維持原本名稱),對白上方的名字也略微縮小,長名字不會擠到台詞。⑤「👤 我的主角」造型工房選單最下面新增「✏️ 暱稱」,不用退出去就能直接改暱稱(和原本的設定暱稱是同一個)。⑥資料安全加強:主線劇情進度與主角造型都再確認過綁定各自帳號,共用平板換人登入時不會把上一位的劇情進度或造型帶到下一位身上。⑦女童(幼女)套裝終於補齊!整套裝扮頁現在有:學生制服、日式和服、俏麗雙劍士、水藍魔法師、粉紅長洋裝 五款(原本只有兩款)。雙劍士改用完好的圖,手套、武器、肩膀、裙擺不會再缺角;水藍魔法師也換成重新切好的版本,衣服白色部分完整。少年、少女、男童的套裝完全不受影響。',
    ],
    items: [
      '★ v4.78.0【動作音效缺檔回退·index.html】新增 _MS_SFX_FALLBACK(16 個主線 sfx key → 既有 <audio> 元素 id)+ _msFbUrl();_msPlaySfx / _msPlayHeldSfx 改為「先抓短檔名 {key}.m4a?v=版本,onerror 或 play() 失敗才用近義音效頂替」,成功播放則鎖住不回退。對照:appear→sfx-summon-reveal、card→sfx-deal、whistle→sfx-battle-start、charm→sfx-youyou-burst、shield→sfx-guard、fire→sfx-explode、stink→sfx-powerdown、treasure→sfx-medal-unlock、darkrise→sfx-wb-boss-skill、restore→sfx-heal;已到齊的 6 個(footstep/crack/fall/keyboard/sword/pray)也各配一組保險回退。',
      '★ v4.78.0【教學引導戰鬥(甲案)·index.html】新增 _MS_BATTLE_DEFS(六場敵人名/圖示/導語·雙版文案 鐵律1.232)與四幕演出:_msBattleIntro(敵人現身)→ _msBattleTutorial(復用既有 TUTORIAL_STEPS 11 步文案·premium 取 desc / cute 取 descSimple·上一步/下一步/跳過)→ _msBattleSim(敵人血條四段遞減+普攻與暴擊音)→ _msBattleWin(勝利卡·點畫面或 2.6 秒續播)。',
      '★ v4.78.0【分派器接線·index.html】_msRunAct 新增 battle_ch1_1 / ch1_2 / ch3_boss / ch4_boss / ch5_boss / ch6_boss 六個 case → _msActBattle(act, done),不再 fall-through 到 default;default 改為未知 act 直接續播。battle_ch1_1 帶完整教學引導,其餘五場只播戰鬥與勝利。',
      '★ v4.78.0【主角吐槽條·index.html】新增 _msQuipBar(premium,cute)(💭+_msWho(__hero) 暱稱+淡藍吐槽框)與 _MS_TUT_QUIPS(11 步吐槽·以標題關鍵字配對而非索引,TUTORIAL_STEPS 日後增刪不會錯位·查無走通用兜底句);教學引導戰鬥每一步、以及既有三張教學卡(tutorial_king/levelup/shop)皆插入吐槽條(插在按鈕之前)。語氣沿用主線 DB 主角既有的「（心想）…」自嘲風格,雙版文案(鐵律1.232)。',
      '★ v4.78.0【劇情專屬姓名·index.html】新增 _MS_STORY_NAME 對照表(八位夥伴)+ _msStoryName(n) helper;_msWho 尾端與 _msActJoin 加入隊伍演出各套一次,DB 的 who 值/HERO_DB key/圖鑑/召喚/戰鬥/編組完全不動(純顯示層對照,查無對照回原名無害)。另 DB 內兩句動物學家自我介紹台詞(premium+cute)同步改寫為「我是動物學家‧小真老師」。',
      '★ v4.78.0【對白名字縮小·index.html】showLine 說話者名字 font-size 38→30px、letter-spacing 3→2px、margin-bottom 16→14px(劇情專屬姓名最長 7 字·避免擠壓對白區)。',
      '★ v4.78.0【造型工房新增暱稱項·avatar_db.js】_AV_TABS 於 heldTab 之後新增第 11 項 { k:nickAct, act:nick }(act 型不切頁);_avRenderTabs 補藍色系樣式+✏️ 圖示;_avatarSwitchTab 補 nick 分支 → 呼叫 index.html 既有 window.openNicknameModal()(z29999 蓋在造型工房 z19999 之上·儲存走既有 _saveNickname 路徑=localStorage lxps_nickname_{uid} + 雲端·與名片暱稱同一份真相);函式未載入時走 bannerFX 雙版提示。',
      '★ v4.78.0【UID 綁定稽核(任務3)·index.html】稽核結果:主線進度雲端 players/{uid}.mainStoryProgress ✅、本機 lxps_mainstory_{uid} ✅(三個寫入點皆 if(uid) 守門)、avatarCard 雲端 players/{uid} ✅、本機 lxps_avatarCard_{uid} ✅ — 儲存層全部已綁 uid。★但查出真實漏洞:_clearAccountLocalData 換帳號清單漏列 window._mainStoryProgress / _avatarLocalCard / _protagAwakened / _avatarNickname 四個記憶體物件 → 共用 iPad 換帳號未整頁 reload 時,前一位的章節 done 會被 _msHydrateProgress 的 union(只增不減)併進下一位並寫上雲端(與 v4.6.0 寵物同型病灶)。修法:四者一併加入換帳號記憶體清除(只清記憶體不動雲端·誤刪是大忌)+ _msHydrateProgress 加 UID 守門第二道防線(window._mainStoryProgressUid 與當前 uid 不符→先清空再 union)。',
      '★ v4.78.0【女童(kidgirl)套裝修正·avatar_db.js + 素材】老師回報「衣服白色區域被過度去背」。repo 逐檔實測(新切法 kidgirl_{13款式}_{head/body}.png 全試·舊命名 headfull_/bodyfull_{款式}_kidgirl.png 全試·full_ 前綴·制服/洋裝各種別名)結論分三種病因:❶水藍魔法師=新切件 kidgirl_watermage_head/body.png 早已在 repo 且實測 0 內部破洞,但 P.outfit id13 仍掛舊件 bodyfull_aquamage_kidgirl.png(內部 3021px 白色破洞)→ 改掛新件(hhRef 沿用舊值·新件髮區實測中段 [68,66,67] 與現行 [68,66,66] 幾近相同=同一張原圖)。❷日式和服=headfull_/bodyfull_kimono_kidgirl.png 一直都在 repo,但 P.outfit id2 女童欄位是 null 從未接線 → 補上(hhRef [[56,53,50],[101,98,95]] 由該圖髮區實測取樣·已排除膚色與和服紅·並用雙劍士女童現行值反推比例校正)。❸雙劍士=程式已掛對、檔案也在,但 bodyfull_dualblade_kidgirl.png 內部有 3863px 白色破洞(headfull 另 10px)→ 產出修補檔請老師同名覆蓋上傳。舊件 aquamage_kidgirl 保留在 repo 與 P.headfull/P.bodyfull 定義中(誤刪是大忌)。',
      '★ v4.78.0【素材修補手法·雙劍士女童】非重新去背:原檔 RGB 完整保留、僅 alpha 被挖空,故只把「被角色輪廓完全包圍的透明像素」(scipy.ndimage.label 標記背景連通元件·從四邊界反推 outside·剩餘即內部破洞)alpha 補回 255,顏色一個都沒動。修補 3863px 實測 RGB 平均 (232,220,225)、81.5% 為純白系(RGB 皆>200)、最暗 (167,155,159)=白布陰影 → 確認就是被誤挖的白色衣服。修補後內部破洞 0。手臂與身體間的合法鏤空因連通到外部不受影響。',
      '★ v4.78.0【仍缺素材】女童「學生制服」與「小洋裝」逐檔實測確認不在 repo(全 404),P.outfit id1/id6 女童欄位維持 null。待老師上傳 kidgirl_uniform_head/body.png 與 kidgirl_dress_head/body.png 後即可接線。',
      '★ v4.78.0【女童套裝補齊(老師乙案)·avatar_db.js】★根因更正:前一輪誤判「制服/洋裝女童件不在 repo」,實際是漏探 top_*_kidgirl.png 這個 P.top 命名慣例;老師上傳的 7 張與 repo 現行檔逐像素比對總差=0 → 素材一直都在,問題全在程式碼引用。★另一關鍵:雙劍士老師的關鍵字是 dualsword,程式碼掛的是 dualblade(不同檔·且該舊件有 3863px 白色破洞+邊緣被削)→ 改掛 top_dualsword_kidgirl.png。P.outfit 女童欄位接線結果:id1 學生制服=top_uniform_kidgirl.png(整張式)、id2 日式和服=headfull_/bodyfull_kimono_kidgirl.png(頭+身分離件·可換髮型)、id7 俏麗雙劍士=top_dualsword_kidgirl.png(整張式)、id13 水藍魔法師=kidgirl_watermage_head/body.png(頭+身分離件·可換髮型)、新增 id14 粉紅長洋裝=top_dress_kidgirl.png(整張式)。★_pick 是依陣列索引取件,故新款一律追加陣列最後(id 必須等於索引)。',
      '★ v4.78.0【整張式套裝機制(whole)·avatar_db.js】P.outfit 原設計為「頭件+身件」分離,但女童的制服/洋裝/雙劍士只有含頭的整張全身圖(老師既有素材·不再裁切)。新增逐體型陣列欄位 whole 與 helper _ofIsWhole(d,bodyIdx):head 留 null、body 放整張圖、whole 對應體型標 1 → ❶渲染 hideHead 補 _ofWhole(素體頭隱藏·防整張圖的頭與素體頭重疊)❷髮型頁提示條與換髮型守門比照 lockHair 擋下(頭髮畫在圖裡)。★whole 是逐體型的,同款式其他體型若有正規分離件仍走原本頭+身流程,少年/少女/男童完全不受影響。',
      '★ v4.78.0【素材零改動】本輪未裁切、未修圖、未產生任何新素材;前一輪產出的 bodyfull_/headfull_dualblade_kidgirl.png 修補檔作廢不上傳(改用老師既有的 top_dualsword_kidgirl.png)。舊 dualblade / aquamage 件保留在 repo 與 P.full/P.headfull/P.bodyfull 定義中(誤刪是大忌)。',
      '★ v4.78.0【零副作用保證】教學引導戰鬥為純演出:不建立/不改動 G 戰場物件、不呼叫 startTurn 或 _closeTutorial、不寫 _tutorialDone/_tutorialMiniDone、不動存檔與獎勵,因此真實戰鬥的教學提示與流程完全不受影響;演出掛 15 分鐘 watchdog 兜底防卡死。真實可操作的主線戰鬥仍列 Phase 2(待主角戰鬥英雄)。',
      '★ v4.78.0【範圍與驗證】全在 index.html;avatar_db.js/admin_panel.js/game_changelog.js 版號同步;hero_db.js 維持 v4.54.0、sw.js/world-boss.js 未動。9 版號同步點對齊 v4.78.0;index.html 21 inline 塊 node --check 全過·0 孤立代理字元;admin 零真?.。',
    ],
  },
  // v4.77.0 — 主線劇情:動作音效對接 + 打字機修正 + 序章森林腳步聲5秒·管理員測試
  {
    ver: 'v4.77.0',
    date: '2026-07-22',
    adminOnly: true,
    brief: [
      '📖【主線劇情・體驗優化(測試中·未開放)】三項打磨:①對白動作音效正式接上(踏步、破裂、翻頁、寶劍出鞘、祈禱等已上傳的音效會在對應台詞響起);②打字途中手滑點到「上一句」,會先把整句補完、要再點一次才真的回看,避免訊息一閃而過看不到;③踏進序章森林那一刻的腳步聲會持續約5秒後自動淡出停止,不會一直踩個不停。',
    ],
    items: [
      '★ v4.77.0【動作音效對接·index.html】對白 sfx key→_msPlaySfx→抓短檔名 {key}.m4a?v=版本;已上傳6音效(footstep/crack/fall/keyboard/sword/pray)bump版號破SW/CDN快取後即響;其餘10個缺檔 graceful 靜默待老師上傳。',
      '★ v4.77.0【打字機修正·index.html】pb.onclick(上一句)對稱補上「打字中→clearInterval+顯示整句+return」守門,與 _msAdvance/下一句一致;打字未完不會直接跳段回看。',
      '★ v4.77.0【森林腳步聲5秒·index.html】新增 held-sfx 機制(_msPlayHeldSfx/_msStopHeldSfx·loop 播放+ms 後淡出);序章森林 footstep 行掛 sfxHold:5000;showLine 進下一句/離場皆自動停止持續音。',
      '★ v4.77.0【範圍與驗證】全在 index.html;avatar_db.js/admin_panel.js/game_changelog.js 版號同步;hero_db.js/sw.js 維持不動。',
    ],
  },
  // v4.76.0 — 主角 A2:三覺醒技(三分投射/變臉戲法/凡人的臨摹大師)+覺醒閘門·管理員測試
  {
    ver: 'v4.76.0',
    date: '2026-07-21',
    adminOnly: true,
    brief: [
      '👤【我的主角・覺醒技能(測試中·未開放)】主角覺醒後學會兩招 + 一招大絕:三分投射(打一個敵人·有機會暴擊還能拿能量)、變臉戲法(先給自己一個好狀態再攻擊)、大絕「凡人的臨摹大師」(打全部敵人 + 把隊友的好狀態學來分給整隊)。未覺醒前一律不能使用;主角仍不會出現在學生的召喚/圖鑑,正式開放請等公告。',
    ],
    items: [
      '★ v4.76.0【主角三覺醒技·index.html·管理員限定】覆寫 HERO_DB[主角] s1三分投射(c3·特技250%單體+50%暴擊×1.5+暴擊回2能量·沿用籃球隊員既有 execSkill 通用實作)、s2變臉戲法(c4·隨機獲得1有利狀態+特技+攻擊+速度傷害·沿用既有通用實作);注入 BURST_DB[主角]「凡人的臨摹大師」。三招皆走 doDmg 受世界BOSS 5000cap(鐵律1.31);升級沿用既有 _activeSkLvMult(每級+5%) + SKILL_UPGRADE_DEF 技能名共用(三分投射/變臉戲法皆已在表)。d/fd/sd 雙版(鐵律1.232·fd 只寫 Lv1 鐵律1.160)。',
      '★ v4.76.0【爆發 凡人的臨摹大師·_runBurst name===主角 分支(甲)】敵全體特技200%×_burstMult 分攤(必中·無視有利·isAoe)+ 臨摹複製我方1名夥伴身上1個有利狀態給全隊1回合(查無則從基礎有利清單挑1·臨摹兜底);BURST_UPGRADE_DEF[主角]200→280%(每升+10%乘算);BURST_GIF 本輪未注入→查無走預設視覺(下輪於 hero_db.js 補一筆專屬 GIF)。',
      '★ v4.76.0【覺醒閘門(乙)】skillCost 頂部:主角未覺醒時 s1/s2 回99(能量永遠不足=不可施放)、覺醒後正常 c3/c4;execSkill 頂部雙保險守門(未覺醒 return 不執行);_canBurst 未覺醒→false(不可爆發)。三處皆 _isProtagHero 把關·不影響同名的籃球隊員/變臉戲法原主人。aiUseSkill 三分投射/變臉戲法既有通用分支自動涵蓋(鐵律1.128)。',
      '★ v4.76.0【範圍與驗證】全在 index.html;avatar_db.js/admin_panel.js/game_changelog.js 版號同步;hero_db.js 維持 v4.54.0。9 版號同步點對齊 v4.76.0;index.html 21 inline 塊 node --check 全過·0 孤立代理字元;admin 零真?.。剩餘 A2:任務1立繪(需老師實機驗渲染路徑)、任務4重置回Lv1(呼 _lxpsSetProtagAwakened(false))。',
    ],
  },
  // v4.75.0 — 主角 A2:覺醒持久化 + 第六章覺醒 act + 圖鑑暱稱顯示·管理員測試(補記)
  {
    ver: 'v4.75.0',
    date: '2026-07-21',
    adminOnly: true,
    brief: [
      '👤【我的主角・覺醒與名字(測試中·未開放)】主角打完第六章覺醒場景後會「覺醒」(稀有度 R→SSR)並永久記住;英雄圖鑑主角卡會顯示玩家取的暱稱(沒設就顯示「主角」)。主角仍不會出現在學生的召喚/圖鑑,正式開放請等公告。',
    ],
    items: [
      '★ v4.75.0【覺醒持久化·avatar_db.js】avatarCard 新增 protagAwakened 欄位(隨 cfg 上雲 merge:true·免改 rules);_avatarLoadLocal/雲端命中設 window._protagAwakened;新增 window._lxpsSetProtagAwakened(v)(設記憶體旗標 + avatarCard 欄位 + 存本機/雲端·v 預設 true,傳 false 供重置)。讀取端 _getHeroRarity 主角→覺醒?SSR:R。',
      '★ v4.75.0【第六章覺醒 act·index.html】_msRunAct 分派器新增 case awaken_hero → 呼 _lxpsSetProtagAwakened(true)(fire-and-forget·退路設 _protagAwakened=true)→ done() 續播;第六章覺醒場景(v4.68.0/67.0 已建)播完 act 觸發覺醒。',
      '★ v4.75.0【圖鑑暱稱顯示·index.html】圖鑑卡名 + 詳情頁英雄名標題套 _heroDisplayName(主角→玩家暱稱 fallback「主角」·非主角一律回原名無害);只接顯示點·不改 HERO_DB key/狀態/統計(onclick/data-heroname 仍用原 name)。戰鬥卡/編組頁暱稱留待任務1立繪一起做。',
    ],
  },
  // v4.74.0 — avatar 部件預設「每個變體獨立」修復 + 主角資料地基(A1·休眠·管理員測試)
  {
    ver: 'v4.74.0',
    date: '2026-07-21',
    adminOnly: true,
    brief: [
      '🎨【造型工房・設為預設 大修(老師測試中)】管理員把不同髮型/套裝/飾品分別設為預設時,現在每一款各自獨立記住自己的位置與大小,互不覆蓋;玩家自訂微調也一樣每個部件×體型分開記。★注意:舊的共用預設會清空,管理員需針對每一款重新按「📌設為預設」。',
      '👤【我的主角・可上場英雄地基(測試中·未開放)】為之後主角能編入隊伍、上場戰鬥、覺醒鋪好底層資料;此版僅資料地基,主角仍不會出現在學生的召喚/圖鑑/鬥技場,正式開放請等公告。',
    ],
    items: [
      '★ v4.74.0【avatar 部件預設 per-變體獨立·avatar_db.js】新增 window._avPartVarKey(cfg,slot):槽位鍵→「槽#體型#變體id」(素體 baseH/baseB 只到體型·該槽未選變體只到體型·未知槽維持原鍵向下相容)。單一真相 _avEffPos 頂部解析變體鍵→render(_ofsWrap/_avAccLayer)自動 per-變體;_avatarSetPartDefault/_avatarNudge/_avatarNudgeSize/_avatarNudgeReset/_avatarTogglePosDef/UI 使用預設勾選 共 7 讀寫點集中改走變體鍵(DOM 顯示 id 保留槽位鍵、儲存走變體鍵·兩者分離)。',
      '★ v4.74.0【遷移·一次性】舊雲端管理員預設 gameConfig/avatarPartDefaults(舊槽位鍵)與玩家舊 cfg.pos/posDef 槽位鍵→新版讀變體鍵故被孤立=舊共用預設清空(本為錯誤共用·屬預期改善);管理員重新針對每款×體型按📌設為預設。bump AVATAR_DB_VERSION 破圖片 ?v= 快取(玩家首次進造型工房一次性重抓·屬預期)。',
      '★ v4.74.0【主角資料地基 A1·index.html·休眠管理員限定】中央 IIFE:_PROTAG_HERO_NAME/_isProtagHero/_PROTAG_HERO_PUBLIC=false/_protagHeroOpenForMe(=公開旗標||管理員)/_lxpsProtagAwakened(預設 false→R)/_heroDisplayName(暱稱 helper);注入 HERO_DB 主角(hp79/atk13/sp13/spd13·S1三分投射/S2變臉戲法 c99 佔位待 A2)+AVATARS+HERO_IMGS(星佔位)+_PLAYER_HERO_NAMES。_getHeroRarity 主角→覺醒?SSR:R;advGetUnlockedHeroes 管理員推入+final force-include(gated);圖鑑 _buildHeroGrid/arena×4/援軍/全收錄/收藏獎章 共 17 站點 _isProtagHero 排除閘門(全 gated·學生完全看不到)。',
      '★ v4.74.0【範圍與驗證】avatar_db.js(_avPartVarKey+7 讀寫點)+index.html(A1 中央 IIFE+17 站點閘門)+admin_panel.js/game_changelog.js 版號同步;hero_db.js 維持 v4.54.0。9 版號同步點對齊 v4.74.0;index.html 21 inline 塊 node --check 全過·0 孤立代理字元;avatar_db.js node --check 過·0 孤立代理字元。A2(立繪渲染/3覺醒技/覺醒持久化/重置/第六章覺醒 act)下一版接。',
    ],
  },
  // v4.73.0 — 主線:序章森林停BGM留環境音+章節選擇縮圖(首張場景插圖)+封面改播章節音樂.m4a一次播完自動關閉·管理員測試
  {
    ver: 'v4.73.0',
    date: '2026-07-21',
    adminOnly: true,
    brief: [
      '📖 主線再調整!① 序章穿越到「迷霧森林」後,原本那首不太搭的背景音樂會停掉,只留下森林的環境音(鳥鳴、風聲),更有「剛闖進陌生異世界」的神祕感。② 章節選擇畫面每一章的按鈕下方,現在會嵌入該章「第一張劇情插圖」的縮圖,一眼就看得出那章的場景氛圍。③ 章節開場封面改成:顯示封面時播放專屬的章節音樂一次,音樂播完封面就自動關閉、進入劇情(當然隨時可以按跳過)。(主線仍在測試中,先開放給老師)',
    ],
    items: [
      '★ v4.73.0【序章森林停BGM留環境音】_msPlayScene 逐場景 BGM 新增 scene.bgm==="none" 分支:bgmStop() 停所有 audio[id^="bgm"] 但完全不碰 amb(amb 是 _msStartAmb 的動態 new Audio·不在 DOM bgm 清單內)→ 真正「停BGM、留環境音」;window._msCurBgm 設 "none" 防重觸。序章「主線_序章_迷霧森林」場景 bgm 由 bgm-taiwan-intro 改 "none"(保留 amb:forest)。',
      '★ v4.73.0【章節選擇縮圖】新增 _msFirstSceneImg(cid)(回傳該章第一張有 img 的場景插圖);_msOpenChapterSelect 章節卡右欄由「單一動作鈕」改「rightCol 直欄:動作鈕 + 其下層縮圖」(190×107 圓角·邊框同章節狀態色 accent·_msAsset 帶 ?v= 破快取);縮圖沿用既有場景插圖零新素材。',
      '★ v4.73.0【封面改播章節音樂.m4a·播完自動關閉】_msPlayCover 音樂由「per-chapter cover.bgm(未上傳)」改「單一 章節音樂.m4a(已上傳 330KB·全章共用)」:進封面 bgmStop 獨佔 → 播 章節音樂.m4a 一次(volume 0.72)→ onended 觸發 finish() 自動關閉封面進劇情;被擋/缺檔 8 秒兜底、異常沒觸發 onended 45 秒硬兜底;skip 鈕/點畫面 隨時可跳過(finish 冪等)。原固定 10 秒自動進正片邏輯移除。',
      '★ v4.73.0【範圍與驗證】全部改動集中在 index.html 主線引擎(_msPlayScene bgm 分派 / _msPlayCover 封面音樂與關閉 / _msOpenChapterSelect 縮圖 + _msFirstSceneImg);avatar_db.js/admin_panel.js/game_changelog.js 僅版號同步·hero_db.js/world-boss 未動。無真 ?.·九版號同步點全對齊 v4.73.0·changelog 恰 20 條·CURRENT_BOOT_VER 未動。主線 _MAINSTORY_ADMIN_ONLY 管理員限定測試。Phase 2(6 場劇情引導戰+主角戰鬥英雄+覺醒)另輪製作。',
    ],
  },
  // v4.72.0 — 主線:章節封面新圖+前情提要+對白上一句/下一句翻頁+環境音短檔名+內嵌教學×3與發劍演出·管理員測試
  {
    ver: 'v4.72.0',
    date: '2026-07-21',
    adminOnly: true,
    brief: [
      '📖 主線又更完整了!① 七章都換上了全新的精緻章節封面大圖(進章節前會先看到),封面下半部會浮現「前情提要」——用幾句話回顧從序章到上一章發生的故事,接關也不怕忘記劇情。② 劇情對白新增「上一句/下一句」按鈕,可以往回看剛剛錯過的對白,切換時會有翻頁音,不怕手快點過頭。③ 補上環境音效(河堤、教室、茶園、老街…的氛圍聲)。④ 劇情中會穿插「認識魔王、英雄升級、逛商店」的小教學,以及第五章打敗發酵魔王後「神劍現世」的演出。(主線仍在測試中,先開放給老師)',
    ],
    items: [
      '★ v4.72.0【封面換圖+關程式疊字】老師提供 7 張內建標題的精緻章節封面(主線_封面_序章.jpg…第六章.jpg·1672×941 JPGq90·放 repo 根目錄·DB cover.img 本就指向此檔名免改);_msPlayCover 移除程式疊標題大字(圖已內建標題·避免雙標題)→ titleBox 僅在「無封面圖 fallback 漸層底」時才顯示。',
      '★ v4.72.0【前情提要(封面下半部)】新增 _MS_CH_RECAP(七章各一句話回顧·premium/cute 雙版鐵律1.232)+ _msRecapForCover(cid)(串接 order 中「本章之前」各章回顧·序章無前文回傳空);_msPlayCover 於封面下半部(bottom:8%)疊白字黑框(text-shadow 八向黑描邊·無底·楷書字族)顯示前情提要,淡入。',
      '★ v4.72.0【對白上一句/下一句+翻頁音】_msPlayScene 對白層改版:showLine(instant) 加參數(回看整句直接顯示不重打字);新增 _msNavBarHtml(上一句/下一句 導覽列·curIdx=0 時上一句灰化不可按·取代舊點擊繼續)+ _msBindNav + _msAdvance(打字中→補完·否則前進·切到有效下一句才播翻頁);翻頁音 _msPlayPageTurn 播 翻頁.mp3(缺檔靜默);點畫面/下一句鈕/上一句鈕三入口統一。line.sfx 動作音與場景轉場音不受影響。',
      '★ v4.72.0【環境音短檔名(乙案)】_msSndUrl 由 主線_音效_{key}.m4a 改抓 {key}.m4a(老師上傳 forest/riverside/park/teafarm/flowerforest/darkness.m4a 等短檔名即生效·amb/sfx 共用此規則;classroom/oldstreet 待補即靜默 graceful)。',
      '★ v4.72.0【內嵌教學×3+發劍演出】_msRunAct 接 tutorial_king(認識魔王)/tutorial_levelup(英雄升級)/tutorial_shop(商店補給)→ _msActTutorial 自成一體教學卡(雙版·點我知道了續播·30s watchdog);grant_sword_tutorial → _msActGrantSword 神劍現世演出(純演出不動存檔·實際發劍走 _msGrantChapterReward ch5 crystal5_sword)。battle_*/awaken_hero 仍 default 放行=Phase 2(待主角戰鬥英雄)。',
      '★ v4.72.0【範圍與驗證】全部改動集中在 index.html 主線引擎(_msPlayCover/_msPlayScene/_msRunAct+新 helper);avatar_db.js/admin_panel.js/game_changelog.js 僅版號同步·hero_db.js/world-boss 未動。無真 ?.·九版號同步點全對齊 v4.72.0·changelog 恰 20 條·CURRENT_BOOT_VER 未動。主線 _MAINSTORY_ADMIN_ONLY 管理員限定測試。Phase 2(6 場劇情引導戰+主角戰鬥英雄+覺醒)另輪製作。',
    ],
  },
  // v4.71.0 — 主線劇情:戰前世界觀介紹+主角吐槽役+逐場景BGM換曲+對白著色(主角淡藍/關鍵詞亮黃)+對白音效改場景轉場·管理員測試
  {
    ver: 'v4.71.0',
    date: '2026-07-21',
    adminOnly: true,
    brief: [
      '📖 主線劇情更好玩了!① 第一次戰鬥前,動物學家會先介紹這個世界的祕密——在這裡,人們的力量來自「知識」;戰鬥中每答對一題,知識就會化成力量灌注全隊,常常能出奇制勝!② 主角現在會在旁邊「吐槽」了——聽到夥伴講出很中二、很浮誇的台詞時,主角會冒出玩家心裡想講的那句吐槽,讓劇情更詼諧、更貼近你的感受。③ 對白音效調整:以前每點一次「繼續」都會叮一聲,現在改成只在「畫面換場景」時才響一下,耳朵清爽多了。④ 每換一個場景背景,配樂也會跟著淡入淡出、換成最適合那一幕的曲子(第一次來到雙月河堤,會響起「召喚星空」的旋律哦)。⑤ 主角自己說的話改用淡藍色、和其他人區隔開;劇情裡的教學重點關鍵詞(像普通攻擊、能量、技能、素質點、馴養、至寶…)會用亮黃色標出來,一眼就抓到重點。(主線仍在測試中,先開放給老師)',
    ],
    items: [
      '★ v4.71.0【需求一·戰前世界觀介紹】MAINSTORY_DB 第一章於「隊友登場(join_ch1)」與「第一次戰鬥(battle_ch1_1)」之間新增一個介紹場景(沿用河堤背景+park 環境音·無需新素材):動物學家講述「這個世界人們的力量源自知識、懂得越多越強」+「戰鬥中每答對一題→知識瞬間凝成能量灌注全隊→答得越準越能出奇制勝」,由主角吐槽收尾。premium 小說化/cute 簡短雙版(鐵律 1.232)。',
      '★ v4.71.0【需求二·主角吐槽役】主角(__hero)對白由 4 句增至 9 句,於各章浮誇/中二台詞後穿插玩家視角吐槽:序章結尾(自嘲異世界第一天資訊量爆炸)、第一章世界觀場景(想變強竟要認真答題)、第二章(程式設計師「Bug 只是還沒找到的 Feature」)、第三章(劍士「劍法只有往前砍」)、第五章(發酵公「聞聞我的臭味」→摀鼻拒絕)。全雙版(premium 小說化/cute 簡短·鐵律 1.232),讓劇情詼諧貼近玩家。',
      '★ v4.71.0【需求三·對白音效改場景轉場】主線播放引擎音效邏輯調整:移除「每句對白點擊繼續」時的翻頁音(原 ov.onclick 內 playSfx sfx-confirm2)→改在「場景轉場淡入」時單發一次(_msRevealScene 內·同 _msRevealed 守門只發一次/場景)。對白層原有的動作音(line.sfx·如劍擊/火焰)不受影響照常單發;環境音(amb)照常。結果:切對白不再每句叮一聲,只在換場景時響一下。',
      '★ v4.71.0【需求四·逐場景 BGM 換曲】MAINSTORY_DB 有背景圖的場景新增 bgm 欄位(全部沿用遊戲既有 10 首 BGM·免補音樂素材);_msPlayScene 換場景時若 scene.bgm 與 window._msCurBgm 不同→bgmFadeTo 800ms 淡入淡出換曲(同曲不重切·無圖的影片/純演出場景維持前一曲)。老師指定:第一次到雙月河堤=召喚星空 bgm-summon;另杏花妖花林=bgm-boss-apricot、黑暗球=bgm-boss-darkorb、發至寶=bgm-treasure-gallery 等對味主題曲。_msEnterStoryBgm/_msExitStoryBgm 同步維護 _msCurBgm(進出主線正確記錄/清空)。',
      '★ v4.71.0【需求五+六·對白著色】_msPlayScene 打字機由 textContent 改 innerHTML 逐字著色(新增 _msEsc 防注入 + _msRenderTyped·點擊補完同步走同一顆):主角(__hero)整句對白用淡藍色 #aad4ff 與旁人區隔;line.hl 陣列所列教學重點關鍵詞用亮黃色 #ffe14d 標示。已為 7 句教學/世界觀對白標 hl(涵蓋 知識/力量/出奇制勝/普通攻擊/能量/技能/素質點/HP/攻擊/馴養/商店/知識王/至寶/投資);hl 詞同時涵蓋 premium/cute 兩版用語(該版缺該詞則不標·不影響顯示)。',
      '★ v4.71.0【範圍與驗證】全部改動集中在 index.html(主線 MAINSTORY_DB + _msPlayScene 播放引擎:逐場景 BGM/對白著色/音效轉場);avatar_db.js/admin_panel.js/game_changelog.js 僅版號同步·hero_db.js 未動。與尚未部署的 v4.70.0(章節標題/開場封面/豐富音效/小說化對白/主線鈕上移)同批,部署同 4 檔即含兩輪。無真 ?.·九版號同步點全對齊 v4.71.0·changelog 恰 20 條·CURRENT_BOOT_VER 未動(v1.0.20260510.6050)。主線 _MAINSTORY_ADMIN_ONLY 管理員限定測試。',
    ],
  },
  // v4.70.0 — 主線劇情大改版:新章節標題+章節開場封面與開場曲+豐富音效+小說化對白+主線鈕移到最上方·管理員測試
  {
    ver: 'v4.70.0',
    date: '2026-07-21',
    adminOnly: true,
    brief: [
      '📖 主線劇情大改版!① 每一章都有了正式的章節標題(像「第一章・河堤上的初陣」),進入章節前會先播一段「章節開場封面」——大大的標題配上專屬開場曲,像翻開一本故事書的新篇章。② 對白重新改寫成小說的口吻,每個夥伴講話都有自己的個性和語氣,讀起來更有帶入感。③ 加入了豐富的「環境音效」和「動作音效」——河堤的風聲、教室的氛圍、翻牌的聲音、施法的聲響…讓每個場景都活了起來。④「主線劇情」按鈕移到了關卡列表的最上方,一進冒險就看得到。(主線仍在測試中,先開放給老師)',
    ],
    items: [
      '★ v4.70.0【B·章節新標題】MAINSTORY_DB 全 7 章(序章+第一~六章)新增/更新雙版標題 titleP(精緻)/titleC(簡單):序章・穿越到異世界、第一章・河堤上的初陣、第二章・異變的線索、第三章・褪色的茶園、第四章・被奪走的心、第五章・發酵魔王的陰謀、第六章・吞噬色彩的黑暗(cute 版對應簡短標題·鐵律 1.232 雙版齊備);章節選擇視窗與章節開場封面共用同一標題來源。',
      '★ v4.70.0【C·章節開場封面引擎】新增 _msPlayCover(cid,onDone):讀 chapter.cover{img,bgm} → 全螢幕封面 overlay(z-index 9810)顯示封面圖(缺圖 graceful fallback 漸層底)+ 程式疊上大字章節標題 + 專屬開場曲(new Audio·有開場曲才 bgmStop() 獨佔·缺檔靜默);支援「跳過」鈕/點畫面略過/10 秒自動結束;接入 _msRunChapter:僅從章節開頭(i===0)播封面,封面播畢才 _msEnterStoryBgm+開始場景,續播章節中段不重播。封面資產檔名規格:主線_封面_序章.jpg…主線_封面_第六章.jpg、開場曲 主線_開場_序章.m4a…主線_開場_第六章.m4a(repo 根目錄)。',
      '★ v4.70.0【D3·豐富音效引擎】新增環境音(amb)+動作音(sfx)雙軌:_msStartAmb(key) 循環環境音(淡入到 0.35·同 key 不重起·切換場景自動接續)、_msStopAmb() 淡出(離開主線/進章節選擇時停)、_msPlaySfx(key,vol) 單發動作音(動態 Audio·play().catch 靜默);MAINSTORY_DB 各 scene 依語意標 amb(森林/河堤/公園/教室/茶園/花之森/老街/黑暗…)、關鍵對白 line 標 sfx(腳步/破裂/登場/翻牌/哨聲/施法/劍擊/祈禱/護盾/火焰…);接入 _msPlayScene(換場景啟動環境音)與 showLine(對白觸發動作音)。★缺音檔一律 graceful fallback 靜默不影響劇情播放。',
      '★ v4.70.0【A·小說化對白改寫】MAINSTORY_DB 全 7 章 premium 對白重寫為小說筆觸,融入各代表英雄語氣個性(小劇團員「人生如戲」、直笛演奏家對音準的堅持、弦樂團員「音樂是靈魂的語言」、動物學家的好奇、籃球隊「Team work makes the dream work」、田徑隊「每一秒比昨天快」、程式高手「Bug 只是還沒找到的 Feature」、繪圖高手「顏色不夠再加一層」、劍士的直率、祭司「每條生命都值得被守護」…);cute 版維持簡短口語(鐵律 1.232)。順手統一用語「弦樂隊員」→「弦樂團員」。',
      '★ v4.70.0【D1·主線鈕移到最上方 + 範圍驗證】「📖 主線劇情」入口鈕(#adv-mainstory-btn)由原位置(頭像鈕與近期活動鈕之間)移到冒險關卡列表最上方(木柵防衛戰之上)·一進冒險即見。★全部改動集中在 index.html 主線引擎/MAINSTORY_DB(avatar_db.js/admin_panel.js/game_changelog.js 僅版號同步·hero_db.js 未動);無真 ?.·九版號同步點全對齊 v4.70.0·changelog 恰 20 條·CURRENT_BOOT_VER 未動(v1.0.20260510.6050)。主線 _MAINSTORY_ADMIN_ONLY 管理員限定測試。',
    ],
  },
  // v4.69.0 — 造型工房:紙娃娃說明+全部件尺寸+管理員定位設預設+玩家用預設勾選·管理員測試
  {
    ver: 'v4.69.0',
    date: '2026-07-21',
    adminOnly: true,
    brief: [
      '👤 造型工房升級!標題下方多了一行說明「每個部位都像紙娃娃一樣,可以調整位置和尺寸哦!」現在「每個部位」(頭、身體、頭髮、衣服、帽子、眼鏡、嘴巴…)都能像紙娃娃一樣移動位置、變大變小。每個部件多了「☑使用預設」的勾選:勾著=用老師調好的漂亮預設;把勾勾拿掉就能自己調,還有「↺回預設」一鍵回到預設。(造型工房測試中,先開放給管理員)',
    ],
    items: [
      '★ v4.69.0【需求一·紙娃娃說明】造型工房標題下追加雙版說明(premium「每個部位都像紙娃娃一樣,可以調整位置和尺寸哦!」/cute「每個部位都像紙娃娃,可以移動、變大變小哦!」·鐵律1.232)。',
      '★ v4.69.0【需求二·尺寸擴大全部件·2乙】原本只有飾品(頭戴/眼鏡/嘴飾)能調尺寸→現在所有部件皆可(全畫布件 baseH/baseB/ofh/ofb/hh/mouth/held 的尺寸縮放接進 _ofsWrap:頭群組以瞳孔中線為軸、身/持物以下半身中心為軸;飾品維持 _avAccLayer 自身中心縮放·順修其讀取 cap ±20→±50 對齊寫入)。',
      '★ v4.69.0【需求二·管理員雲端預設·1丙】新增 gameConfig/avatarPartDefaults(同 avatarLocks 模式·僅 GM 可寫·登入者可讀·走 gameConfig 既有 rules 免新增條款){defaults:{"key":[dx,dy,尺寸%]}}。管理員取消「使用預設」→調整→按「📌設為預設」即寫雲端·全體玩家登入即套用;另有「📤匯出預設JSON」供日後寫進程式永久保存(丙)。',
      '★ v4.69.0【需求二·玩家用預設勾選·3乙】每個部件微調區新增「☑使用預設位置/尺寸」勾選:勾=用管理員雲端預設(鎖微調·只顯示預設值)·取消=自己調(從預設值起·方向鍵±1位置/±1%尺寸·↺回預設);單一真相 _avEffPos(cfg,key)供 render(_ofsWrap/_avAccLayer)與微調 UI 共用;cfg.posDef[key] 隨 avatarCard 上雲(merge:true 免改 rules)·玩家動微調鈕自動 posDef=false。',
      '★ v4.69.0【範圍與相容】全在 avatar_db.js(index/admin/changelog 版號對齊);舊玩家已存的位置/尺寸(cfg.pos)無 posDef 者預設「使用預設」→吃管理員預設(雲端未設則退回舊值/歸零)·不遺失。★本版同時攜帶未部署主線 v4.68.0(章節選擇+BGM)/v4.68.1(場景切換連貫)修正(主線 _MAINSTORY_ADMIN_ONLY 管理員限定·安全)。九版號同步點對齊 v4.69.0·changelog 恰 20 條·無真?.·BOOT_VER 未動。',
    ],
  },
  // v4.68.1 — 主線劇情場景切換連貫性:常駐黑底+交叉淡入(不再露出關卡頁)·管理員測試
  {
    ver: 'v4.68.1',
    date: '2026-07-21',
    adminOnly: true,
    brief: [
      '📖 主線劇情切換場景更順了!之前換場景時,舊圖消失、新圖還在載入的那一秒會露出後面的關卡選擇頁(閃一下)。現在鋪了一層黑底把後面擋住,而且會等新場景圖「載好」才淡入切換——舊場景會撐著、新場景圖就緒才交叉淡入,中間不會再有空檔或閃現關卡頁。(測試中,先開放給老師)',
    ],
    items: [
      '★ v4.68.1【常駐黑底】新增 mainstory-backdrop(position:fixed;inset:0;z-index:9780;背景 #0a0618 不透明·pointer-events:none):整個主線期間鋪在場景(9800)/選單(9790)之下,填補「舊場景移除→新場景圖尚未載入」的空檔,徹底杜絕露出後面關卡選擇頁。_msEnsureBackdrop 於播章/開選單時建立·_msExitStoryBgm(離開主線)移除。',
      '★ v4.68.1【不透明底色】場景 overlay 背景末層加上 #0a0618 實色(url 圖→漸層→實色):即使場景圖尚未載入,overlay 本身也不透出後面,雙重保險。',
      '★ v4.68.1【交叉淡入·真正無空檔】_msPlayScene 改「舊場景改名保留(mainstory-overlay-prev)不立即移除」+ 新場景 opacity:0 起(transition 0.45s)+ new Image() 預載本場景圖 → onload(或無圖/逾時 1.5s 兜底/已快取)才把新場景淡入並移除舊場景;_proceed 不再自行淡出/移除(交由下一場景載圖就緒後交叉淡入·末場景由 _msRunChapter.done() 收);切場景前清殘留 -prev、done() 一併清 -prev 防疊加。',
      '★ v4.68.1【範圍與驗證】只改 index.html 主線引擎(場景切換/黑底);avatar_db.js/admin_panel.js/game_changelog.js 僅版號同步·hero_db.js 未動;無 ?.·九版號同步點全對齊 v4.68.1·changelog 恰 20 條·BOOT_VER 未動。',
    ],
  },
  // v4.68.0 — 主線劇情:章節選擇視窗(已完成/未完成/回顧)+主線專屬 BGM·管理員測試
  {
    ver: 'v4.68.0',
    date: '2026-07-21',
    adminOnly: true,
    brief: [
      '📖 主線劇情新增「章節選擇視窗」!點主線劇情會列出全部章節,每章清楚標示 ✅已完成 / ▶未完成 / 🔒尚未解鎖,還有進度條看你走到哪。已完成的章節可以「🔁 回顧劇情」重新看一次完整內容;還沒解鎖的章節要先完成前一章才會打開。另外主線劇情現在有專屬背景音樂了——序章和前面的熱血章節配「冒險小隊出發」,貓空異變、花林魅惑、深坑臭氣、黑暗球等緊張章節配比較有戲劇張力的劇情音樂,離開主線會自動換回關卡頁的音樂。(測試中,先開放給老師)',
    ],
    items: [
      '★ v4.68.0【章節選擇視窗】新增 _msOpenChapterSelect:全螢幕列出序章+一~六章,每章標示 ✅已完成 / ▶未完成(可繼續) / 🔒尚未解鎖;頂部進度條 X/7 + 百分比;全六章通關顯示 🏆 通關提示。主線入口鈕(_msOpenMainStory)改為開此視窗(原本直接跳下一未完章)。章節卡片依狀態上色(綠/琥珀/灰)·雙版文字(鐵律1.232)·大按鈕 touch-action:manipulation(iPad 好點)。',
      '★ v4.68.0【回顧劇情】已完成章節提供「🔁 回顧劇情」→ _msRunChapter(cid, cb, {review:true}):從第一場景重播該章完整內容·不記續播點·不重複標記完成/發獎(冪等·純重播)。未完成的當前章顯示「▶ 開始/繼續冒險」(有續播點則顯示繼續)·從續播點接續。播完一章自動回章節選單,方便挑下一章或回顧其他章。',
      '★ v4.68.0【尚未解鎖】章節依序解鎖:只有「第一個未完成章」可進行,之後的章顯示 🔒 並提示「先完成前一章才會解鎖」(維持主線循序敘事)。',
      '★ v4.68.0【主線專屬 BGM】根據場合挑選現有音樂:章節選單 + 序章/第一章/第二章 = 冒險小隊出發(bgm-adv-march);第三章貓空異變/第四章花林魅惑/第五章深坑臭氣/第六章黑暗球 = 台灣關卡簡介劇情BGM(bgm-taiwan-cutscene·較具戲劇張力)。進主線(選單/播章)以 bgmFadeTo 切入;離開主線(關閉視窗 / 首登序章播完)還原關卡頁 BGM 貓空冒險(bgm-adv-scene)。_msEnterStoryBgm / _msExitStoryBgm 集中管理·window._msInStory 旗標防重複存曲。',
      '★ v4.68.0【範圍與驗證】只改 index.html(主線引擎:BGM 管理 + _msRunChapter 加 review/BGM + _msOpenMainStory 改開選單 + 新增 _msOpenChapterSelect/_msPlayFromSelect);avatar_db.js/admin_panel.js/game_changelog.js 僅版號同步·hero_db.js 未動;無 ?.·九版號同步點全對齊 v4.68.0·changelog 恰 20 條。戰鬥/教學類 act(battle_*/tutorial_*)仍留待批次2b/3。',
    ],
  },
  // v4.67.0 — 主線劇情批次2a:序章接線(捏臉/名片/加入演出/次元裂縫)·管理員測試
  {
    ver: 'v4.67.0',
    date: '2026-07-21',
    adminOnly: true,
    brief: [
      '📖 主線劇情更好玩了!序章帶你「捏臉」做主角、看冒險者名片、夥伴「加入隊伍」演出,裂縫穿越也有畫面轉場;第三、四章通關還會直接收服 SR 夥伴(劍士/祭司/守衛/刺客/火法師),而且玩到一半離開,下次能接著上次的地方看。(測試中,先開放給老師)',
    ],
    items: [
      '★ v4.67.0【主線批次2a】新增演出動作分派器 _msRunAct:每段對白播完後執行該場景的 act,完成再自動續播下一段(無 act 直接續播·全程 try-catch + watchdog 防卡死)。',
      '★ v4.67.0【序章接線】捏臉(open_avatar_studio→開造型工房·掛 _avatarPanelClose 偵測離開續播)/名片(set_card→展示自動生成的冒險者名片·掛 _avatarCardClose)/加入隊伍(join_prologue:小劇團員‧直笛團員‧弦樂團員‧動物學家 純敘事演出·不發卡·初始8英雄建帳號即贈)/次元裂縫(改暗場穿越對白+結尾淡出全黑→下一場景淡入·不做影片)。',
      '★ v4.67.0【加入演出全通】join_ch1 籃球隊員‧田徑隊員 / join_ch2 程式設計師‧電腦繪圖師(初始8英雄至此全數登場·純敘事) / join_ch3 劍士‧祭司 / join_ch4 守衛‧刺客‧火法師 加入隊伍演出。',
      '★ v4.67.0【SR 夥伴解鎖(Q3)】第三章通關直接解鎖 劍士‧祭司;第四章通關直接解鎖 守衛‧刺客‧火法師(共 5 位 SR·經 advSaveUnlockedHero 來源 mainstory_clear·圖鑑顯示「主線劇情獲得」)。已擁有者每重複 1 位改為 +5 召喚水晶。維持 SR 稀有度(不進 SUMMON_RARE_HEROES SSR 池·5 位皆早在 _PLAYER_HERO_NAMES 白名單與 ADMIN_ALL_HEROES 之內·免造角)。發放綁章節通關 reward·冪等(_r_chap_chX)。',
      '★ v4.67.0【火法師登場】第四章花林新增火法師登場對白(火剋魅惑妖花·雙版說明);火法師為既有 hero_db 英雄,故事化收服。',
      '★ v4.67.0【主線關卡進度綁 UID(Q2)】主線改為「章節內場景續播點」:玩到一半離開,下次從上次那一段接續(_sc_chX·綁 UID·雲端 mainStoryProgress + 本地 lxps_mainstory_uid 鏡像·取大還原·整章完成清除)。與戰鬥/一般存檔分離·只增不退。',
      '★ v4.67.0【場景圖】MAINSTORY_DB 9 張場景圖副檔名 .png→.jpg(配合 JPGq90 場景圖省流量);保留 貓空BOSS戰背景/深坑老街/臭豆腐BOSS/第一章河堤 為 .png 不動。',
      '★ v4.67.0【範圍與驗證】只改 index.html(主線引擎+DB);avatar_db.js/admin_panel.js/game_changelog.js 僅版號同步·hero_db.js 未動;無 ?.·九版號同步點全對齊 v4.67.0·changelog 恰 20 條。戰鬥/教學類 act(battle_*/tutorial_*/grant_sword/awaken_hero)留待批次2b/3。',
    ],
  },
  // v4.66.0 — 自訂角色安全開關(隨機變裝暫停 + GM鎖款玩家隱藏·管理員測試)
  {
    ver: 'v4.66.0',
    date: '2026-07-20',
    adminOnly: true,
    brief: [
      '🎲 打扮小屋:「隨機變裝」先暫停整理中,還有一些服裝在準備;老師鎖起來的款式也先不顯示,等做好、開放後就會出現囉!(測試中)',
    ],
    items: [
      '★ v4.66.0【自訂角色】隨機變裝暫時關閉(window._AV_RANDOM_OFF·部分套裝素材整理中,避免抽到未完成款;點選會提示整理中·邏輯完整保留,日後 _AV_RANDOM_OFF=false 一鍵重開)',
      '★ v4.66.0【自訂角色】GM 上鎖款對「非管理員」完全隱藏(連鎖定預覽也不顯示,等對應套裝素材修好重傳、GM 解鎖後才對玩家出現;管理員照常可見、可切換測試)',
      '★ v4.66.0【範圍與驗證】只改 avatar_db.js(index.html/admin_panel.js/game_changelog.js 僅版號同步);無 ?.·九版號同步點全對齊 v4.66.0·changelog 恰 20 條。',
    ],
  },
  // v4.65.0 — 主線劇情模式 Phase 1 地基(穿越冒險故事外殼·管理員測試)
  {
    ver: 'v4.65.0',
    date: '2026-07-20',
    adminOnly: true,
    brief: [
      '📖 全新「主線劇情」要來囉!跟著力行小學生穿越到異世界,和夥伴一起冒險、學會戰鬥和馴養,最後喚醒你自己的主角!(測試中,先開放給老師)',
    ],
    items: [
      '★ v4.65.0【主線劇情】Phase 1 地基:資料驅動章節腳本 MAINSTORY_DB(序章~第六章)+ 過場播放引擎(獨立 overlay 鏈式·打字機對白·可跳過·影片插槽缺檔靜默 fallback·防卡死 watchdog)',
      '★ v4.65.0【主線劇情】進度 self-write(mainStoryProgress·players 主檔 merge·免改 rules)+ 各章 🔮×5 / 全通關 🌈SSR隨機召喚卷×1 冪等發獎(序章不發)',
      '★ v4.65.0【主線劇情】關卡頁「📖 主線劇情」入口 + 首登自動導入序章(admin gating 測試期·防疊加守門);演出動作(造型工房/夥伴加入/教學/劇情戰)批次2/3 接既有系統',
    ],
  },
  // v4.64.0 — 自訂角色系統大改版(頭身新切法素材+頭飾/眼鏡/嘴飾+GM上鎖通道·管理員測試)
];
