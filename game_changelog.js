// ════════════════════════════════════════════════════════════════════════
//  game_changelog.js  —  LXPSGAME 更新日誌
//  最後更新:2026-06-21  / 目前主程式版本:v3.15.67(新增學生設計英雄「科學發明家」5年4班楊寓如,SSR,新發明物品卡子系統6卡＋6選3即刻發明＋靈感被動＋醫學界的發明奇蹟爆發)
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
  // v3.15.89 — 英雄強化教學 + 條件搜尋大升級(效果標籤校正 + 新增條件 + 補滿92隻)
  {
    ver: 'v3.15.89',
    date: '2026-06-22',
    brief: [
      '📘【英雄強化教學上線!】點英雄看「詳情」時,新增一段<b>強化教學</b>互動導覽,帶你認識把英雄練強的六大方法:⬆ 升等(吃經驗書)、💪 加素質點、💎 裝備台灣至寶、🌟 天賦、📚 技能升級、🔥 極限爆發。詳情頁六角圖上方也多了「📘 強化教學」按鈕,隨時可重看。',
      '🔍【條件搜尋大升級!新增多種條件】條件搜尋可勾選的效果變更多了!新增:<b>素質提升、受傷增加(讓敵人變脆)、造成傷害增加、追擊、模仿、封印天賦</b>,並把<b>七大屬性傷害</b>(🔥火 / 💧水 / 🪽風 / 🌿草 / 🪨土 / ⭐光 / 🌙暗)獨立成一組,想找特定屬性的打手或特定功能的角色更精準!',
      '🛠【效果標籤全面校正 + 補滿 92 隻】重新校對全部 92 隻英雄的技能效果標籤,修正先前自動產生的誤標(例如把「免疫暈眩」誤判成「會造成暈眩」之類),並補上先前漏掉的<b>刺客、法老王、埃及豔后</b>。現在條件搜尋完整涵蓋全部 92 隻英雄!',
    ],
    items: [
      '★ v3.15.89【英雄強化教學 HUT・index.html】新增 HUT 互動導覽模組(HUT_STEPS 6 步,對應 _renderHeroDetail 六個錨點 _hut-anchor-level/stats/treasure/talent/skills/burst);英雄詳情頁六角圖上方加「📘 強化教學」鈕(_hutOpenManual),首次開啟英雄詳情自動提示(_hutShowEntryPrompt);_hutShowStep/_hutShowFinal 逐步高亮+說明;完成旗標 window._heroUpgradeTutDone 隨雲端存檔(_buildSafeData/_applySafeData 白名單)。遊戲指引「英雄養成」章補各素質點(攻擊/特技/速度/HP/防禦)效果說明。',
      '★ v3.15.89【條件搜尋:新增條件・hero_db.js + index.html】SKILL_EFFECT_DEFS 由 4 組改 5 組:新增 E「屬性傷害類」(火/水/風/草/土/光/暗 7 種,對齊 ELEMENT_DB 7 屬性,雷歸風);A 組加 素質提升、造成傷害增加;B 組加 封印天賦、受傷增加、追擊、模仿。index.html openCondSearch 彈窗渲染陣列 [A..D]→[A..E](E 色 #c9a0ff),比對邏輯資料驅動不變。',
      '★ v3.15.89【條件搜尋:標籤校正・hero_db.js】HERO_SKILL_EFFECTS 全 92 隻逐隻校對,移除自動掃描的誤標(雅典娜免疫暈眩/麻痺/冰凍/睡眠被誤判成施放、守衛「封印時無效」被誤判成會封印技能、美人魚解燃燒被誤判成施放燃燒、幽幽屬性減免被誤判成屬性攻擊、我的豚豚降被攻擊率被誤判成提高被攻擊率…等數十處),並補上漏標效果。屬性標籤改以技能實際元素(SKILL_FORCE_ELEMENT / 描述)為準(陰陽師補火水風土四屬、美人魚移除誤判火、暗法師無強制元素故不標)。',
      '★ v3.15.89【補滿 92 隻 + 學者改類・hero_db.js】HERO_PRIMARY_CLASS 與 HERO_SKILL_EFFECTS 補上先前漏列的 刺客(主傷害)、法老王(主傷害)、埃及豔后(主控場),兩表皆 89→92(與 _PLAYER_HERO_NAMES 聯集對齊全 92 隻);學者主分類 主控場→主傷害。',
      '★ v3.15.89【版本鏈】4 GAME 同步點 v3.15.88→v3.15.89(_GAME_LOADED_VERSION / _vers[index.html] / _vers[hero_db.js] / _vers[game_changelog.js])。admin_panel.js v3.15.85 / world-boss.js v3.15.86 / world-boss-ui.html v3.15.87 / main.css v3.15.79 / adv_quiz_db.js 20260620 不變。本輪改 index.html + hero_db.js + game_changelog.js 三檔(index.html 最後上傳)。GAME_CHANGELOG trim 至 20(移除最舊 v3.15.68)。',
    ],
  },
  // v3.15.88 — 篩選分類重定義(單一主分類)+ 新增條件搜尋
  {
    ver: 'v3.15.88',
    date: '2026-06-22',
    brief: [
      '🔍【篩選分類改版】英雄圖鑑與編組的篩選分類全面改版!原本的「傷害/回復/控場坦克」改為<b>五大主分類</b>:⚔ 主傷害、💚 主回復、🌀 主控場、🛡 主坦克、🎲 其他。每隻英雄會歸到<b>最符合的單一主類</b>(坦克型獨立出來,不再和控場混在一起),分類更清楚。',
      '🔍【全新「條件搜尋」】篩選列新增「🔍 條件搜尋」按鈕,點開後可<b>勾選想要的技能效果</b>(例如:護盾、復活、暈眩、燃燒、封印、吸血、再行動、減傷…等數十種),按「搜尋」就會列出<b>同時具備全部所選效果</b>的英雄,配隊找特定功能的角色超方便!',
    ],
  },
  // v3.15.86 — 龍王至寶獲得管道擴充(未收錄至寶納入8龍王)+ 重複轉換統一5
  {
    ver: 'v3.15.86',
    date: '2026-06-22',
    brief: [
      '🐉【龍王至寶更好收集 + 重複統一轉卷軸×5】世界 BOSS <b>排名獎勵</b>的「未收錄至寶」現在也會<b>隨機給出 8 種龍王至寶</b>(原本只給台灣 10 件);<b>自選至寶召喚卷</b>一樣可挑龍王至寶。<b>重複拿到</b>(已收齊)時統一改贈「<b>至寶經驗卷軸 ×5</b>」,不會白白浪費!',
    ],
    items: [
      '★ v3.15.86【甲:未收錄至寶納入 8 龍王至寶】排名獎勵「未收錄至寶」隨機池(index.html _treasureResult)原本用 noSummon 過濾排除全部 8 龍王至寶 → 移除過濾,讓 8 龍王至寶(皆 mythic 神話級)納入隨機池。上榜玩家的「未收錄至寶」可隨機獲得任一尚未擁有的龍王至寶(不再只限當週 BOSS 對應的那一隻)。',
      '★ v3.15.86【乙:重複轉換統一 5 張】三處對齊為「重複 / 全收齊 → 至寶經驗卷軸 ×5」:① 排名「未收錄至寶」全部收齊(含龍王)原本不發 → 改發 ×5 ② world-boss.js 該場 BOSS 龍王至寶(_wbGrantDragonTreasure)重複 3→5 ③ 自選 / 隨機至寶券全收齊本就 ×5(未改,確認一致)。',
      '★ v3.15.86【補償一致 + 顯示】補償重發的隨機未收錄至寶 fallback 同步納入龍王至寶(與主獎勵池一致);世界 BOSS 結算第二幕「全擁有」訊息補上「改贈 至寶經驗卷軸 ×5」。',
      '★ v3.15.86【安全】只動「未收錄至寶」候選池與全擁有 fallback、龍王至寶重複卷軸數;排名分級的 expScrollTreasure(5/3/2/1/1 名次卷軸獎勵)、龍王至寶機率 / 該場 BOSS 對應、星空召喚維持龍王 noSummon(抽不到)全不動。龍王至寶為 mythic,納入後高名次玩家會在 mythic 層較易抽到龍王至寶(老師確認的 buff)。',
      '★ v3.15.86【版本鏈】3 GAME 同步點 v3.15.85→v3.15.86(_GAME_LOADED_VERSION / _vers[index.html] / _vers[game_changelog.js]);_vers[world-boss.js] v3.15.51→v3.15.86(本輪改 world-boss.js)。admin_panel.js v3.15.85 / hero_db.js v3.15.78 / main.css v3.15.79 / world-boss-ui.html v3.15.69 不變。本輪改 index.html + world-boss.js + game_changelog.js 三檔。GAME_CHANGELOG trim 至 20(移除最舊 v3.15.66)。',
    ],
  },
  // v3.15.85 — 甲案資料救援統整 + 復原顯示新增英雄/至寶(名+等級)
  {
    ver: 'v3.15.85',
    date: '2026-06-22',
    brief: [
      '🛠️【老師後台:資料救援工具整理 + 復原看得到補回了什麼】把後台「資料救援與重置」整理得更清楚:<b>移除一個過時工具</b>、其餘三個各加<b>「使用時機」說明</b>讓老師一眼知道該用哪個。另外老師幫你復原資料時,現在會<b>清楚列出「這次補回了哪些角色、哪些至寶、各是幾等」</b>,確保補回的就是你原本擁有的。',
    ],
    items: [
      '★ v3.15.85【甲案統整:退役「🚑 玩家資料急救工具」】此工具針對 2026-04 一個早已修好的舊 bug、且用最費工的「手動填數量」,功能已被「🔧 一鍵帳號重建」(自動反推)+「🎁 學生補償工具」(手動補發)完全覆蓋 → 從側欄與「資料救援與重置」群組移除(卡片與 init 程式保留但不再顯示)。資料救援與重置由 4 個精簡為 3 個。',
      '★ v3.15.85【三救援工具加「使用時機」導引】🆘 Lv1 救援(整個帳號變回 Lv1 / 被本地汙染覆蓋·某槽完整 → 整槽複製)、🔧 一鍵帳號重建(部分英雄/水晶/幣不見了·只補缺漏不動現有·最安全·首選)、⚠️ 完全重置(最後手段·被別帳號汙染加法救不回·清空不可逆),三卡頂各加一句明確分流。',
      '★ v3.15.85【需求2:一鍵重建顯示「將補回英雄/至寶 + 等級」】index.html _fbRebuildAccountFromLedgers diff 新增 missingHeroDetail(缺漏英雄附等級·讀合併後 heroLevels=學生原本練到的等級)+ missingTreasures(解鎖紀錄有但三槽全失的至寶·id/name/lv·排除 GM admin_delete)+ payload.treasures(經 _fbCompensatePlayer union 補回·新的給 Lv1)。admin_panel.js 分析結果以晶片列「🦸 將補回英雄 N 隻(名+Lv)」「💎 將補回至寶 M 件(名+Lv)」;套用後再列「本次補回」摘要(英雄+Lv/至寶+Lv/水晶+/幣+)供老師與學生核對是否符合預期。',
      '★ v3.15.85【需求2:Lv1 救援三槽診斷顯示每槽英雄/至寶】三槽深度掃描時,每槽除原本的「解鎖數/最高 Lv/等級總和」,再列該槽英雄(名+等級·依等級排序)與至寶(名+等級),讓老師選還原來源前就看清楚每槽內容是否為學生預期(讀 _fbDiagnoseAllSlots 已回傳的 rawData,未改後端)。',
      '★ v3.15.85【安全】退役工具僅移出側欄,後端救援邏輯與既有補償/重建/重置/誤刪救回不受影響;一鍵重建補至寶走既有 _fbCompensatePlayer(union 只補不減,既有至寶不動,新補給 Lv1)。',
      '★ v3.15.85【版本鏈】4 GAME 同步點 v3.15.84→v3.15.85;_vers[index.html]/[game_changelog.js]/_GAME_LOADED_VERSION + admin_panel.js ADMIN_PANEL_VERSION/_vers[admin_panel.js] 同步 v3.15.85。hero_db.js v3.15.78、main.css v3.15.79、world-boss.js v3.15.51、world-boss-ui.html v3.15.69 不變。本輪改 index.html + admin_panel.js + game_changelog.js 三檔。GAME_CHANGELOG trim 至 20(移除最舊 v3.15.65)。',
    ],
  },
  // v3.15.84 — GM「英雄誤刪救回」一鍵掃描+復原(排除 GM 手動刪除的)
  {
    ver: 'v3.15.84',
    date: '2026-06-22',
    brief: [
      '🛟【老師後台新增「英雄誤刪救回」工具】老師現在可以在後台<b>一鍵掃描</b>所有玩家,找出先前被誤刪的角色(你練過、或裝過至寶的主力),再<b>一鍵幫你補回來</b>。如果你之前有角色不見了,跟老師說一聲,老師按一下就能救回,<b>等級和身上的至寶都會原樣保留</b>。',
    ],
    items: [
      '★ v3.15.84【GM 後端 4 函式】index.html block#02:_computeDeletedHeroesFromDoc(從一份玩家雲端資料算出「被誤刪、可救回」的英雄=heroLevels 等級>1 或 身上裝著至寶 equippedTo·但不在 unlockedHeroes·且在 _PLAYER_HERO_NAMES 白名單·且最近一筆解鎖紀錄不是 admin_delete)、_fbAdminScanDeletedHeroes(getDocs 全體玩家逐一算,回受影響清單依英雄數降序)、_fbAdminRestoreDeletedHeroesForUid(getDocFromServer 重讀重算再復原)、_fbAdminRestoreAllDeletedHeroes(逐一 await 復原回統計)。',
      '★ v3.15.84【復原走 _fbCompensatePlayer】只帶 unlockedHeroes → union 把英雄加回(不重複)、heroLevels 取較大值(絕不重置/降級既有等級)、主檔+live+safe 三槽同寫、_adminForceRestore 繞健康度守門、記 compensation 解鎖歷史、不誤發補償彈窗給玩家。玩家下次登入即生效。',
      '★ v3.15.84【★ 排除 GM 手動刪除(老師要求)】最近一筆解鎖紀錄 source 為 admin_delete(GM 在「汙染清查」手動刪掉的)的英雄一律不列入、不救回,避免把刻意刪除的汙染角色又加回來。',
      '★ v3.15.84【GM UI:🛟 英雄誤刪救回卡】admin_panel.js「🧹 帳號汙染處理」群組(洗錢查緝卡下方):「🔍 掃描全體玩家」列出每位受影響玩家(uid/email/暱稱 + 被誤刪英雄晶片含 Lv·裝至寶標💎)→ 逐位「🛟 復原這位玩家」或頂部「🛟 全部一鍵救回」。三點同步(SIDEBAR_ITEMS+SIDEBAR_GROUPS+卡片 HTML+_initDeletedHeroSection IIFE);_esc HTML 跳脫、confirm 後執行、無 ?.。',
      '★ v3.15.84【定位】鏡像 v3.15.82/83 玩家登入時 client 端救回邏輯的「server 主動批次版」:讓老師不必等學生逐一登入,即可一次把雲端被誤刪的英雄批次補齊。安全:只救/列白名單英雄、排除 admin_delete、復原為 union 加回(只增不減),跨帳號防護不變。',
      '★ v3.15.84【版本鏈】4 GAME 同步點 v3.15.83→v3.15.84;_vers[index.html]/[game_changelog.js]/_GAME_LOADED_VERSION 同步 v3.15.84;admin_panel.js ADMIN_PANEL_VERSION 與 _vers[admin_panel.js] 同步 v3.15.80→v3.15.84。hero_db.js v3.15.78、main.css v3.15.79、world-boss.js v3.15.51、world-boss-ui.html v3.15.69 不變。本輪改 index.html + admin_panel.js + game_changelog.js 三檔。GAME_CHANGELOG trim 至 20(移除最舊 v3.15.64)。',
    ],
  },
  // v3.15.83 — 資料救回再強化:自己解鎖/投資過的角色與污染相同時算已解鎖
  {
    ver: 'v3.15.83',
    date: '2026-06-22',
    brief: [
      '🛟【資料救回再強化】承接上一版的英雄救回,依老師指示再加強——只要是你<b>自己練過、或身上裝了至寶</b>的角色,就算在共用平板上和別人重複(系統紀錄的最近一次解鎖剛好是別人),系統<b>都會正確認定那是你自己的角色、算「已解鎖」,絕不會誤判成別人的污染而刪掉</b>。',
    ],
    items: [
      '★ v3.15.83【依老師指示:自己解鎖的角色/至寶若跟污染相同,要算已解鎖、不可誤判為汙染】承 v3.15.82,_applySafeData 把「本地英雄是否保留」的判定順序改為「投資證據 / 本人解鎖紀錄」優先於「最近一筆解鎖紀錄標別帳號 uid」。',
      '★ v3.15.83【投資證據 = 練過 或 身上裝著至寶】_heroInvested82(n)= heroLevels 等級>1(雲端∪本地)或 身上裝著至寶(equippedTo,來源:雲端 taiwanTreasureData / 字串版 taiwanTreasureData_s / 本地 lxps_taiwan_treasures 三者聯集)。有投資證據 → 一定是學生自己的資源 → 保留,即使最近一筆解鎖紀錄標別帳號(共用機上同一隻常見英雄最近一筆常是別人解鎖的)。',
      '★ v3.15.83【本人解鎖紀錄看「全部」非「最近一筆」】_hasOwnUnlockRec82(n) 掃整份解鎖紀錄(雲端∪本地),只要有任一筆是「本人 curUid 或無 uid 舊資料」且非 admin_delete → 學生自己解鎖過 → 保留(修正舊版只看 _latestRec 最近一筆、被同機後來者覆蓋而誤殺)。',
      '★ v3.15.83【幻影救回同步擴充】分支前幻影救回(救援/同 uid/別人殘留/GM 三槽修復皆受惠)候選由「heroLevels 等級>1」擴為「heroLevels>1 ∪ 身上裝著至寶」,且移除 uid 擋(有投資證據即本帳號),只擋 GM admin_delete。',
      '★ v3.15.83【安全 / 跨帳號防護不變】GM admin_delete(刪除永久)仍最高優先丟;只救/保留 _PLAYER_HERO_NAMES 白名單英雄。跨帳號汙染防護仍靠既有三層(本機命名空間 @@<uid> + 裝置擁有者對齊 + gameCloudLoad 鎖 _gUserId);本版只放寬「同一帳號內被誤判為污染」的情形、未放寬跨帳號讀取,故「讀不到別人的角色」不變。',
      '★ v3.15.83【版本鏈】4 GAME 同步點 v3.15.82→v3.15.83;_vers[index.html]/[game_changelog.js]/_GAME_LOADED_VERSION 同步 v3.15.83。hero_db.js v3.15.78、main.css v3.15.79、admin_panel.js v3.15.80、world-boss.js v3.15.51、world-boss-ui.html v3.15.69 不變。本輪只改 index.html + game_changelog.js。GAME_CHANGELOG trim 至 20(移除最舊 v3.15.63)。',
    ],
  },
  // v3.15.82 — 重大資料遺失修復(裝至寶主力變未解鎖 + GM 三槽救不回)
  {
    ver: 'v3.15.82',
    date: '2026-06-22',
    brief: [
      '🛟【重大修復:消失的英雄救回來了!】修正部分同學在共用 iPad 上登入後,<b>原本擁有的英雄(尤其練過、裝了至寶的主力)突然「變成未解鎖」消失</b>的嚴重問題。現在每次登入都會<b>自動以雲端最完整的擁有資料為準</b>,把被誤刪的英雄救回並補齊。',
      '   ・如果你之前有英雄不見了,<b>重新登入一次</b>系統就會自動把練過的主力從雲端等級紀錄救回解鎖清單,之後也不會再發生。',
    ],
    items: [
      '★ v3.15.82【根因】_applySafeData 稽核熔斷(v3.15.40)要求「本地英雄要有解鎖紀錄」才保留;但 v3.13.19 本機按帳號命名空間(adv_unlocked_heroes@@<uid>)上線後,本地清單已是「本帳號專屬」、不可能是別帳號殘留 → 查無解鎖紀錄的合法舊英雄(尤其練過/裝至寶的主力)被當汙染誤丟 → in-memory 變薄 → autosave 把薄清單寫回雲端三槽 → 永久消失,連 GM「三槽最豐富修復」都救不回(三槽 unlockedHeroes 全薄;但 heroLevels 的等級殘留還在,成為救回線索)。',
      '★ v3.15.82【幻影救回·提到所有分支之前】_applySafeData 一進 unlockedHeroes 處理就先掃雲端 heroLevels:凡「等級>1(代表練過/裝過至寶)卻不在 unlockedHeroes」的玩家英雄,補回 data.unlockedHeroes(排除 GM admin_delete 已刪、排除解鎖紀錄明確標別帳號 uid 者)。因為提到分支之前,救援(_adminRescueInProgress)/別人殘留/同 uid 三條路徑都受惠 → GM「三槽最豐富修復」後學生一登入即自動補回。',
      '★ v3.15.82【同 uid 分支放寬稽核】_isLegitLocalHero 由「查無紀錄就丟」改為「有投資證據(雲端或本地 heroLevels 等級>1)即使查無紀錄也保留」;仍尊重 admin_delete(GM 刪除永久)與「紀錄明確標別帳號 uid → 丟」雙保險。原邏輯誤殺合法無紀錄英雄,新邏輯精準保留練過的主力、仍擋得住真殘留。',
      '★ v3.15.82【自動 heal 雲端 + 跨帳號防護不變】救回的英雄寫進本地後,隨下次 autosave 經 _fbSave union(只增不減)回寫雲端主檔 + live + safe 三槽 → 雲端自動補齊,之後 GM 不必再手動救、也不會再次被誤刪。跨帳號汙染防護維持既有三層(本機命名空間 @@<uid> + _lxpsEnforceDeviceOwner 裝置擁有者對齊 + gameCloudLoad 鎖 _gUserId),本次只放寬「同一個自己帳號命名空間內」的誤殺、完全不放寬跨帳號,所以「不會讀到別人的英雄」這條安全性不變。',
      '★ v3.15.82【安全邊界】只救 _PLAYER_HERO_NAMES 白名單內的英雄(已從 HERO_DB 移除的不救)、只救等級>1(避免剛解鎖 seed=1 的幻影或汙染)、admin_delete 與別帳號 uid 紀錄一律不救。',
      '★ v3.15.82【版本鏈】4 GAME 同步點 v3.15.81→v3.15.82;_vers[index.html]/[game_changelog.js]/_GAME_LOADED_VERSION 同步 v3.15.82。hero_db.js v3.15.78、main.css v3.15.79、admin_panel.js v3.15.80、world-boss.js v3.15.51、world-boss-ui.html v3.15.69 不變。本輪只改 index.html + game_changelog.js。GAME_CHANGELOG trim 至 20(移除最舊 v3.15.62)。',
    ],
  },
  // v3.15.81 — 知識王完成後可查看今天做完的科目與成績
  {
    ver: 'v3.15.81',
    date: '2026-06-22',
    brief: [
      '📋【知識王:完成後可查看今天的成績】知識王挑戰完成後,再打開挑戰視窗,底部按鈕會變成「<b>📋 查看今天的科目與成績</b>」,點下去就能看到<b>今天的分數、答對題數,以及做完的科目</b>(一般科目 + 課堂複習)。隔天 08:00 重置後,完成新挑戰會自動更新成當天的成績。',
    ],
    items: [
      '★ v3.15.81【今日成績持久化 index.html】_kingChallenge 新增 _todayResult { date, score, correct, total, subN, subR, isReview };_kingClaimRewards 完成領獎時記錄(correct=_answered 中 true 數、total=_curQuestions 長度、subN=_curSubject、subR=_curSubjectReview、isReview=_isReviewMode)→ _kingSaveToCloud。',
      '★ v3.15.81【雲端白名單 save/load】save 序列化於 _bestScore 後加 _todayResult、load 還原同步;跨日由 date !== 今日(_kingGetTodayStr)自動失效(不需顯式清除,完成新挑戰時覆寫;_dailyDone 為 false 時也進不到查看鈕)。',
      '★ v3.15.81【UI】_kingShowEntryPopup 已完成(_dailyDone)底部按鈕由停用「✅ 今日挑戰已完成」改為可點「📋 查看今天的科目與成績」→ _kingShowTodayResult();新增 _kingShowTodayResult 全內聯彈窗(分數大字依分數變色、答對 X/Y、一般/課堂複習科目 chips、課堂複習徽章、歷史最高分;date 不符或無紀錄走 fallback「已完成」訊息;關閉用 .ktr-close JS 綁定 + 遮罩點擊,避免跳脫引號)。',
      '★ v3.15.81【版本鏈】4 GAME 同步點 v3.15.80→v3.15.81;_vers[index.html]/[game_changelog.js]/_GAME_LOADED_VERSION 同步 v3.15.81。hero_db.js v3.15.78、main.css v3.15.79、admin_panel.js v3.15.80、world-boss.js v3.15.51、world-boss-ui.html v3.15.69。本輪(81)只改 index.html。GAME_CHANGELOG trim 至 20(本 session 78-81 共加 4、移除最舊 v3.15.58/59/60/61)。',
    ],
  },
  // v3.15.80 — 召喚紀錄改存雲端 + 登入同步 + GM 查詢
  {
    ver: 'v3.15.80',
    date: '2026-06-22',
    brief: [
      '☁️【召喚紀錄改存雲端】以前召喚紀錄只存在這一台裝置,換裝置、清快取或重新登入就看不到了。現在<b>召喚紀錄會自動存到雲端、登入後同步</b>,不論在哪一台 iPad 都看得到<b>完整的召喚紀錄</b>(包含用合成召喚卷抽到的結果)。',
    ],
    items: [
      '★ v3.15.80【雲端化 index.html block#02 加 5 helper】_fbSaveSummonHistory(整包寫 summonHistory/{uid}={uid,list≤60,updatedAt},merge:false)、_fbLoadSummonHistory(uid)、_fbSyncSummonHistoryOnLogin(雲端+本地以 t+_+n 去重、保最新 60 寫回本地,本地較多則回寫雲端)、_fbReadPlayerSummonHistory(GM:email/uid/學號 lsps→補 @stu.lsps.tp.edu.tw 以 where email 反查 uid)、_fbShowPlayerSummonHistory(GM 彈窗:摘要抽到的稀有英雄/台灣至寶 chips + 逐次明細)。Firestore SDK refs 在 block#02 模組作用域,故 helper 定義於此、跨 block 以 window.* 呼叫。',
      '★ v3.15.80【寫入/同步點】_recordSummonHistory 寫 localStorage 後即時 window._fbSaveSummonHistory(_hist)(星空抽/隨機券/合成自選券/至寶券皆經 _showSummonResults/_showSummonTicketResult → _recordSummonHistory);登入 onAuthStateChanged 的 await gameCloudLoad(user.uid) 後加 _fbSyncSummonHistoryOnLogin()。',
      '★ v3.15.80【GM UI admin_panel.js】玩家活動記錄查詢區(_admin-activity-section)按鈕列加「📜 召喚紀錄」鈕,讀查詢框 email/uid/學號 → window._fbShowPlayerSummonHistory;加按鈕到既有 section 免三點同步(_summonBtn grab + onclick 綁定),全程無 optional chaining。',
      '★ v3.15.80【⚠ 需部署 Firestore 規則】summonHistory/{uid}:玩家寫自己(request.auth.uid==uid + hasOnly([uid,list,updatedAt]))、GM(isAdmin)讀全部;未部署則雲端寫入被拒,本地紀錄仍正常(belt-and-suspenders,不影響召喚本身)。',
      '★ v3.15.80【版本鏈】4 GAME 同步點 v3.15.79→v3.15.80;_vers[admin_panel.js] v3.15.58→v3.15.80 + ADMIN_PANEL_VERSION v3.15.58→v3.15.80(自檢需一致)。hero_db.js v3.15.78、main.css v3.15.79、world-boss.js v3.15.51、world-boss-ui.html v3.15.69。本輪改 index.html + admin_panel.js。',
    ],
  },
  // v3.15.79 — 知識王挑戰首頁加寬至接近全螢幕 + 字體按鈕放大
  {
    ver: 'v3.15.79',
    date: '2026-06-22',
    brief: [
      '🔍【知識王挑戰首頁加寬】「今日知識王挑戰」的視窗外框<b>加寬到接近全螢幕</b>,三欄(獎勵說明 / 本週小博士 / 特別挑戰題)的<b>字體與按鈕都放大</b>了,看得更清楚、也更好點。',
    ],
    items: [
      '★ v3.15.79【index.html _kingShowEntryPopup】外框 max-width min(96vw,960px)→min(97vw,1680px)、grid gap14→20、margin-top14→18;中欄(本週小博士卡)+右欄(特別挑戰卡 _specialCardHtml)+徽章(_scBadgeHtml)行內字級/按鈕放大;底部按鈕列 margin14→18;_applyLayout 響應門檻 600/900→640/1000(字級放大後三欄需更寬視窗才舒適)。',
      '★ v3.15.79【main.css】.king-box-2col max-width 1500→1680 + scoped 放大(.king-box-2col .king-title/.king-subtitle/.king-rules/.king-rule-row/.king-rule-detail/.king-btn),僅入口彈窗、不影響 .king-box-question/.king-box-result 等其他知識王彈窗。',
      '★ v3.15.79【版本鏈】4 GAME 同步點 v3.15.78→v3.15.79;_vers[main.css] v3.14.5→v3.15.79。hero_db.js v3.15.78、admin_panel.js v3.15.58(本輪未改)。本輪改 index.html + main.css。',
    ],
  },
  // v3.15.78 — 補喚龍使‧蜜鶴林圖鑑設計師資訊
  {
    ver: 'v3.15.78',
    date: '2026-06-22',
    brief: [
      '✏️【補上「喚龍使‧蜜鶴林」的設計師資訊】英雄圖鑑詳情頁補上「<b>喚龍使‧蜜鶴林</b>」的設計師標示:<b>由 5 年 3 班 龎同學設計</b>。',
    ],
    items: [
      '★ v3.15.78【hero_db.js】喚龍使‧蜜鶴林 HERO_BIO(L2144)補 designer:{ class:5年3班, name:龎同學, year:2026 };圖鑑詳情頁(index.html)以 bio.designer 存在為顯示設計師區塊的閘門,_getDesignerLabel 查無 STUDENT_DESIGNER_HEROES 則 fallback class+name → 顯示「✏️ 由 5年3班 龎同學 設計(2026 年)」。同 v3.15.65 熔岩巨人/拘留者病灶(新增英雄時 HERO_BIO 漏 designer 子欄位,鐵律 1.231)。',
      '★ v3.15.78【版本鏈】_vers[hero_db.js] v3.15.72→v3.15.78;4 GAME 同步點 v3.15.77→v3.15.78(本檔僅版本鏈,實質改 hero_db.js)。本輪只改 hero_db.js。',
    ],
  },
  // v3.15.77 — 十連抽優化(同批第二隻重複稀有英雄自動轉換成對應獎勵,沒有損失)
  {
    ver: 'v3.15.77',
    date: '2026-06-22',
    brief: [
      '🌈【十連抽優化】同一次連抽中,如果抽到「第二隻重複的稀有英雄」,系統會自動把重複的那隻轉換成對應獎勵——<b>SSR 重複→超越極限果實 ×1</b>、<b>SR 重複→精裝英雄經驗之書 ×5</b>,不會再白白浪費。',
      '   ・召喚結果視窗會明確顯示「🔄 抽到 N 隻重複英雄,已自動轉換為對應獎勵,沒有損失!」,被轉換的卡片也會標上「🔄 重複轉換」,讓你一眼就知道沒有虧到。',
    ],
    items: [
      '★ v3.15.77【根因】doSummon 連抽(10+1=11 抽)的抽取迴圈一次跑完才在 _applySummonReward 統一解鎖英雄;抽取當下 advGetUnlockedHeroes() 對「同一批稍早已抽中、但尚未解鎖」的英雄是看不見的 → rare_ssr/rare_sr 的候選 _avail 只用 stale unlocked 過濾 → 同批可能重複抽到同一隻;第二隻 advSaveUnlockedHero 等同 no-op(英雄只能擁有/未擁有,無重複概念)→ 玩家空得、形同浪費一抽。',
      '★ v3.15.77【修法】_rollOneSummon 新增 _batchExcl(Set)參數;doSummon 用 _batchClaimedHeroes Set 記錄本批已抽中的 rare_hero,逐抽即時排除。rare_ssr/rare_sr 改先算 _availUnlocked(僅依存檔已解鎖)再扣同批已抽中得 _avail:_avail 有貨→正常給英雄;_avail 空但 _availUnlocked 有貨(代表沒收錄的都在這批稍早抽中了)→第二隻重複,轉對應獎勵並標 _dupConverted/_dupTier;_availUnlocked 也空→維持原「全收錄」轉換文案。legacy rare_hero 路徑一併補 _excl 排除(保險)。',
      '★ v3.15.77【顯示】_showSummonResults 標題下方加綠色橫幅「🔄 抽到 N 隻重複的稀有英雄,已自動轉換為對應獎勵,沒有損失!」(_dupCount>0 才顯示,單抽因 _batchExcl 空永不觸發);被轉換的結果卡加「🔄 重複轉換」小標。轉換後的獎勵走既有 _applySummonReward(rwd.id→backpackAdd),召喚紀錄/角色預覽不受影響。',
      '★ v3.15.77【安全】只動「召喚抽取邏輯」與「結果顯示」,完全不改 SUMMON_RATES 機率表、不改英雄解鎖流程、不改任何存檔/守門。_rollOneSummon 全站僅 doSummon 一處呼叫,加選用參數向下相容(未傳=空集合,單抽行為不變)。轉換獎勵沿用既有「全收錄」同款道具(SSR→超越極限果實、SR→精裝英雄之書×5),不新增掉落物、不影響經濟平衡。',
      '★ v3.15.77【版本鏈】4 GAME 同步點 v3.15.76→v3.15.77;_vers[index.html]/[game_changelog.js] 同步 v3.15.77。hero_db.js v3.15.72、world-boss.js v3.15.51、world-boss-ui.html v3.15.69 不變。本輪只改 index.html + game_changelog.js。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.57)。',
    ],
  },
  // v3.15.76 — 存檔同步修正(資料修復後重整仍誤判倒退無法同步,根因雲端殘留舊資料墊高比較基準)
  {
    ver: 'v3.15.76',
    date: '2026-06-22',
    brief: [
      '🔧【存檔同步修正】修正極少數帳號在資料修復後,重新整理仍出現「資料倒退」警告、無法把進度存上雲端的問題。根因是雲端殘留的舊資料把比較基準墊高了,造成誤判。現在改以「實際擁有的英雄」為準來判斷,正確的資料能正常同步到雲端,不會再被誤擋。',
    ],
    items: [
      '★ v3.15.76【倒退守門 heroLevels map 污染免疫】根因:常規存檔走 setDoc(merge:true),對 heroLevels(map)是深合併→新資料未提及的舊子鍵殘留(同 v3.15.57 playerBackpack 病灶,但 heroLevels 無字串版 heroLevels_s);倒退守門/跨槽合併算 maxHeroLv/totalHeroLv 時只用 _PLAYER_HERO_NAMES 過濾、未對帳 unlockedHeroes→雲端 heroLevels 殘留的高 Lv 幻影條目墊高雲端 maxLv,使 GM 救援還原後正確的本地存檔被誤判「最高等級倒退」(_dMaxLv 達 -5)而拒絕同步(unlockedCount 走陣列比、0 差不觸發,真正擋下的是 maxLv 那條)。',
      '★ v3.15.76【三處同口徑修正】以 unlockedHeroes(陣列;merge 對陣列整包取代、不累積污染)為「真正擁有」權威清單,heroLevels 僅計入確實在 unlockedHeroes 的英雄等級:① _fbSave 主文件守門 _recompS ② _fbSaveLive live/safe 槽守門 _effLv ③ _lxpsMergeSlots recompute(merged._dataSummary)。三處共用同一對帳邏輯。',
      '★ v3.15.76【診斷日誌】_fbSave 主守門加 console.warn(🔎 倒退核對 uid=…),印出雲端 heroLevels 幻影殘留數+最高 Lv+雲端/本地真實 maxLv 與擁有數,供老師核對特定 uid 的實際資料、確認倒退警訊是否為誤判。',
      '★ v3.15.76【安全】只去除「maxLv 被 heroLevels 幻影墊高」造成的誤判;unlockedCount(真英雄被刪/遺失)仍用 unlockedHeroes 陣列比對照常守門,真倒退擋得住,不會放行薄資料覆蓋。',
      '★ v3.15.76【版本鏈】4 GAME 同步點 v3.15.75→v3.15.76;_vers[index.html]/[game_changelog.js] 同步 v3.15.76。hero_db.js v3.15.72、world-boss.js v3.15.51、world-boss-ui.html v3.15.69 不變。本輪只改 index.html + game_changelog.js。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.56)。',
    ],
  },
  // v3.15.75 — 修正序號兌換(亂打/無效序號不再誤判成功)
  {
    ver: 'v3.15.75',
    date: '2026-06-22',
    brief: [
      '🔧【序號兌換修正】修正部分情況下「輸入錯誤或亂打的序號,卻顯示兌換成功」的問題。現在只要序號不存在或格式不對,都會明確顯示「查無此序號,請確認有沒有打錯」,不會再誤判成功,也不會發出任何獎勵。',
    ],
  },
  // v3.15.74 — 新增「特別挑戰題」(知識王第三欄,30題全對領大獎)
  {
    ver: 'v3.15.74',
    date: '2026-06-22',
    brief: [
      '🎮【新增「特別挑戰題」!打開「👑 知識王挑戰」就能看到第三欄】小英雄大對抗・遊戲知識 30 題,教你戰鬥基礎、怎麼讓英雄變強、還有各種好康獎勵在哪拿,學會了打關卡更輕鬆!',
      '🏆【30 題全對拿大獎】30 題「全部答對」就能領 <b>🔮 召喚水晶 ×10 + 🌈 SSR 隨機召喚卷 ×1</b>!每個帳號限領一次,但可以重複作答複習(題目順序每次都會打亂),答錯不扣分,慢慢來!',
      '🔔【還沒領的同學注意】只要大獎還沒領,「知識王挑戰」按鈕和第三欄都會有醒目的「獎勵未獲得」提示——快去挑戰把大獎帶回家!',
    ],
  },
  // v3.15.73 — 世界BOSS龍王護盾說明中文化 + 埃及寵物名修正
  {
    ver: 'v3.15.73',
    date: '2026-06-22',
    brief: [
      '🐉【世界BOSS龍王護盾說明修正】世界BOSS頁的龍王介紹裡,護盾元素原本顯示英文(earth/fire/dark/grass),現已全部改回中文(🪨土/🔥火/🌙暗/🌿草),需要的破盾剋制屬性也正確顯示。',
      '🐺【埃及寵物名稱修正】埃及寵物(荷魯斯之鷹/聖䗴神蟲/阿努比斯胡狼/托特聖䴉)在裝備畫面與英雄卡上的圖示原本顯示「undefined」,現已正確顯示寵物圖示。',
      '👥【好友名單顯示優化】好友卡上較長的暱稱原本會被「…」截斷,現已改成自動換行完整顯示;點開好友「詳細」時,能力資訊改為點開當下即時讀取最新資料,修正先前只有最先載入的好友能顯示能力、其他人一片空白的問題,讓暱稱與詳細能力都能一目瞭然。',
    ],
  },
  // v3.15.72 — 新 SR 英雄「偵探」上線 + 中毒/猛毒修復
  {
    ver: 'v3.15.72',
    date: '2026-06-22',
    brief: [
      '🕵️【新英雄「偵探」上線!一名 SR 天才少年偵探,專門封鎖、壓制敵人的招式】',
      '   ・🔍<b>天賦「縝密推理」</b>:偵探存活時,只要友方受傷,有機率讓「造成該次傷害的對手」<b>天賦失效 + 被查封</b>各 1 回合。',
      '   ・🕵️<b>S1「察覺蛛絲馬跡」</b>(被動):看穿敵人的套路!敵方<b>無法連續使用相同的技能或極限爆發</b>,只能改用其他行動。',
      '   ・👁<b>S2「名偵探的凝視」</b>:50% 機率<b>封印 1 名目標的極限爆發 2 回合</b>;若失敗則回收 2 點能量。',
      '   ・⚖<b>爆發「犯人就是——你！」</b>:消除目標全部有利狀態,使其受到<b>我方全體當前 HP 總合</b>的固定傷害(必中、不受屬性影響、對 BOSS 也有效),並當場「認罪」1 回合(無法行動且受到傷害 +100%)。',
      '   ・想入手偵探?和其他 SR 一樣——在召喚星空抽 SR、或通關貓空有機率解鎖。',
      '☠️【中毒/猛毒修復】修正「猛毒與各種特殊中毒/流血明明應該扣很多血,卻只扣一點點」的問題;現在會正確依各招式設定的傷害值扣血。',
      '🐉【平衡】中毒、出血對「BOSS」的每回合傷害調整為原本的 1/4,避免 BOSS 被持續傷害過快消耗(固定值傷害與山岳地龍王畏毒不受影響)。',
      '🔥【文字對齊】燃燒狀態說明對齊實際數值(普通 6HP、強力 9HP)。',
    ],
  },
  // v3.15.71 — 新 SR 英雄「鐵匠」上線
  {
    ver: 'v3.15.71',
    date: '2026-06-21',
    brief: [
      '🔨【新英雄「鐵匠」上線!一名 SR 鋼鐵匠師,召喚率與解鎖方式都和其他 SR 相同】',
      '   ・🔨<b>天賦「工匠魂」</b>:鐵匠存活時,依我方存活英雄裝備的<b>至寶總件數</b>,每件提升友方全體傷害(最高 +40%);自身受到致命一擊時,也以同等機率<b>以鋼鐵之軀硬撐不倒</b>(HP 留在 1)!裝備愈多、隊伍愈強。',
      '   ・⚔<b>S1「武器精煉強化」</b>:為全隊淬鍊兵刃,依攻擊值提升友方全體造成的傷害,並使友方全體<b>暴擊率 +30%</b>,持續 2 回合。',
      '   ・🛡<b>S2「防具精煉強化」</b>:為全隊鍛造甲冑,依攻擊值提升友方全體的減傷,並使友方全體<b>迴避率 +30%</b>,持續 2 回合。',
      '   ・🔨<b>爆發「裝備破壞奧義」</b>:以攻擊 650% 重擊 1 名對手(必中、無視有利),<b>擊碎並消除其全部有利狀態</b>,並使其造成傷害 -30%、受到傷害 +30%,持續 3 回合!',
      '   ・想入手鐵匠?和其他 SR 一樣——在召喚星空抽 SR、或通關貓空有機率解鎖。',
    ],
    items: [
      '★ v3.15.71【鐵匠 SR 三池接入】手動列入 ADMIN_ALL_HEROES(取得 SR 稀有度 + 進 rare_sr 召喚池 + 管理員擁有 + 收錄計數)、ADV_UNLOCKABLE_HEROES(貓空通關 50% 解鎖池)、_PLAYER_HERO_NAMES(存檔守門白名單)。因非 SSR 不進 SUMMON_RARE_HEROES 自動同步 IIFE,故三處皆手動。來源標走 _getHeroRarity fallthrough → SR + 非學生/日本/活動 → 自動標「🌌 異世界英雄」,零額外設定。',
      '★ v3.15.71【天賦「工匠魂」】新增 _blacksmithPct(side):鐵匠存活時 = min(40%, 我方存活英雄至寶總件數 × (2%+1%/天賦級));_twTreasureCount 於 _applyTaiwanTreasureToHero / _applyFriendTreasuresToHero 寫入(敵 AI 隊 undefined → 0,鬥技場無至寶 → 0 失效)。doDmg 兩扣血點(fixedDmg + 主路徑)各加「不倒」hook:鐵匠受致命傷依此機率 HP 留 1。',
      '★ v3.15.71【S1/S2 buff + 爆發 debuff】S1 _blkWeaponBuff(_pct=攻擊×(0.5+級×0.05)/100, _critUp=0.30)、S2 _blkArmorBuff(_pct=min(0.90,攻擊×(0.5+級×0.05)/100), _evaUp=0.30) 皆 filter+push 防去重殘留(基準攻擊50%·每升+攻擊5%·S2亦可升級);爆發 _blkWeak/_blkVuln(各 30%+5%/級, 3→4 回合)。execSkill + aiUseSkill 雙實作(鐵律 1.128,S2 aiUseSkill 補 _bkS2LvA 讀級);aiSkillScore 評分。',
      '★ v3.15.71【doDmg hooks】頂部評估區 3 hooks:防具迴避(target 帶 _blkArmorBuff._evaUp → 30% 迴避歸零,排除必中/無視有利)、攻方增傷(_blacksmithAtkBuffMult × (1+_blacksmithPct) 乘算 rawDmg)、受方修正(_blacksmithTgtMult,無視有利攻擊跳過減傷部分);暴擊計算加 S1 _blkWeaponBuff._critUp +30%。覆蓋 fixedDmg + 主路徑兩條路(鐵律 1.110)。',
      '★ v3.15.71【顯示 + 升級表】buffClass/buffName(_blkWeaponBuff🔨/_blkArmorBuff🛡)、statusName(_blkWeak/_blkVuln)、BAD_STATUS 加此 2 debuff;SKILL_UPGRADE_DEF(武器精煉強化 special_blk_weapon + 防具精煉強化 special_blk_armor 皆含 codex 顯示 case·攻擊×(50+級×5%))、BURST_UPGRADE_DEF(裝備破壞奧義 650→910% 乘算 + debuff 30→50% + dur 3→4)。',
      '★ v3.15.71【編組圖位 _teamFormAdjustObjPos 加 where 參數】分 grid(編組選單左列縮圖·hpick-adv/arena 兩呼叫點·包 getHeroThumbObjPos)/preview(focusHero 右半部詳情 + 戰鬥預覽):拘留者/科學發明家 grid-20 preview-20、電腦老師 grid-20 preview-10、機關王雙人組 grid0 preview-10;grid base 多為 center center(無%)→ 函式內視為 50% 再加偏移(負值往上露頭)。不動戰鬥卡/圖鑑/HERO_IMG_POS 本體。',
      '★ v3.15.71【hero_db.js 12 表 + 版本鏈】HERO_DB hp79(配點61×1.3 pre-multiplied,不吃 runtime ×1.3)/atk20/sp11/spd8 + AVATARS🔨 + HERO_IMGS鐵匠.png + HERO_IMG_POS + HERO_BIO(無 designer 官方 SR) + BURST_DB + HERO_LORE + HERO_TRAIT工匠魂 + BURST_GIF_DB(迅雷不及掩耳的攻擊.gif·刀劍+爆破·dur1400) + 分類/HEX/_TRAIT_LV_INFO。4 GAME 同步點 v3.15.70→v3.15.71;本輪改 game_changelog.js + hero_db.js + index.html;GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.51)。',
    ],
  },
  // v3.15.70 — 新英雄「電腦老師」上線 ＋ 英雄圖鑑稀有度收集進度
  {
    ver: 'v3.15.70',
    date: '2026-06-21',
    brief: [
      '💻【新英雄「電腦老師」上線!5 年 3 班 陳同學設計的 SSR 英雄】',
      '   ・🛡<b>天賦「防毒防火牆」</b>:受到任何不利狀態(含強力版)時,有 50% 機率完全免疫(每升 1 級 +10%,滿級 90%)!',
      '   ・📺<b>S1「螢幕廣播系統」</b>:接管全場螢幕,使敵方全體暈眩 1 回合無法行動(對 BOSS／菁英成功率減半)。',
      '   ・📝<b>S2「很難的五大任務攻擊」</b>:出 5 道高難度任務,對隨機目標連打 5 次(特技 80~120% 遞增),命中陷入燃燒 2 回合。',
      '   ・💻<b>爆發「系統還原」</b>:清除敵方有利與我方不利狀態,全體夥伴重新開機<b>滿血復活</b>!所有小怪直接關機倒下,菁英／BOSS／玩家英雄則受特技 600% 重啟攻擊。',
      '📊【英雄圖鑑頂端新增「稀有度收集進度」】',
      '   ・英雄圖鑑上方原本的「魔物圖鑑／寵物圖鑑」按鈕,改顯示你的<b>收集進度</b>:👑UR、SSR、SR、R 各「已解鎖／總數」一目了然!',
      '   ・(魔物圖鑑與寵物圖鑑仍可從主畫面的導航列進入)想看自己離全收集還差幾隻,打開英雄圖鑑就知道囉!',
    ],
    items: [
    ],
  },
  // ════════════════════════════════════════════════════════════════════
  // v3.15.69(2026-06-21)— 🆔 名稱顯示隱私強化 ＋ ✏️ 暱稱框加寬
  // ════════════════════════════════════════════════════════════════════
  {
    ver: 'v3.15.69',
    date: '2026-06-21',
    brief: [
      '🆔【名稱顯示更好認、也更保護隱私】',
      '   ・校內信箱的同學,排行榜上的代號改顯示信箱<b>末 3 碼數字</b>(原本大家都是「lsp********」分不出誰),更好辨識!',
      '   ・同學的真實姓名一律<b>遮住中間字</b>(例如「陳O彬」),保護個人隱私。',
      '   ・小博士、世界 BOSS、鬥技場排行榜,以及好友列表,通通套用一致的遮罩格式;完整姓名只有老師在後台才看得到。',
      '✏️【設定暱稱視窗與名稱框加寬】「設定暱稱」視窗變寬了,下拉選單不會再被擠出格子;左上角顯示自己暱稱的白色框也加寬+字體微縮,讓完整暱稱(班級座號/信箱末碼 + 自選組合)能完整顯示。',
    ],
    items: [
      '★ v3.15.69【email 遮罩改末 3 碼 index.html】_emailMaskPrefix:lsps 校內信箱(local 皆以 lsps 開頭如 lsps110137,遮前 3 碼=「lsp********」毫無辨識度)改取「末 3 碼數字」當代號(lsps110137→137);非 lsps(gmail 等)維持前 3 碼 + 遮罩。',
      '★ v3.15.69【_formatPlayerDisplayName 全面重寫 index.html】真名一律中間字遮罩(_maskFullName,陳煥彬→陳O彬)。分支:(A)displayName 已是「4 碼班級座號+中文真名」(如 5408陳煥彬)→ 拆碼 + 中間字遮罩(5408陳O彬);(B)合法遊戲暱稱 → 名冊回班級座號+暱稱(5408暱稱)、lsps 無名冊回末 3 碼+暱稱(137暱稱)、非 lsps 回 cla********@暱稱;(C)真名/空 → 名冊優先回班級座號+中間字遮罩全名(5408陳O彬)否則 _formatRosterLabel(5408陳同學),名冊查不到的真名 → email 前綴+中間字遮罩(137陳O彬)。修補原本「名冊查不到的真名」直接回原字串導致真名外洩。',
      '★ v3.15.69【所有排行榜+好友列表一律遮罩】世界 BOSS 排行榜(world-boss-ui.html _protectName)移除「GM 觀看顯示真名」adminShowReal 分支,所有觀看者(含 GM)一律走 _formatPlayerDisplayName 遮罩;邀請好友列表同步走中央函式。小博士排行榜(index.html)兩寫入點(weeklyQuiz + arenaWeekly)寫入雲端前即套 _formatPlayerDisplayName 遮罩(寫入時有 email,新資料即遮罩,舊資料隨同學作答自動更新)。鬥技場(arena.js _getCurrentUserInfo)displayLabel 改走中央函式(原名冊外 fallback 原始暱稱會洩真名)。好友面板(_getFriendLabel)委派中央函式。★ 完整姓名只在 GM 後台選單(admin_panel.js _getAdminPlayerLabel adminShowReal:true 保留)出現。',
      '★ v3.15.69【設定暱稱 modal + 暱稱框加寬 index.html】設定暱稱 modal max-width min(96vw,clamp(480,50vw,680)) → (540,58vw,800),下拉選單不溢出;左上角 #adv-user-name 框 max-width clamp(200,18vw,320) → (240,26vw,460)、font-size clamp(18,2.8vw,38) → (14,1.9vw,26),讓遮罩後較長暱稱完整顯示、版面不變。',
      '★ v3.15.69【版本鏈】本輪改 index.html + world-boss-ui.html + arena.js + game_changelog.js 四檔(index.html 最後上傳)。版本同步點:_GAME_LOADED_VERSION + _vers[index.html / world-boss-ui.html / arena.js / game_changelog.js] 全 v3.15.68→v3.15.69。hero_db.js 維持 v3.15.67、world-boss.js/adv_quiz_db.js/admin_panel.js/sw.js(CURRENT_BOOT_VER 不動)/hero_input.html 未改。GAME_CHANGELOG trim 至 20 筆(移除最舊 v3.15.49)。',
    ],
  },
];