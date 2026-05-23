// ════════════════════════════════════════════════════════════════════
// student_roster.js — LXPSGAME 學生名冊(v3.5.59 新增)
//
//   用途:把學生班級/座號/姓名等個資資料,跟主程式碼分開保管
//
//   key:玩家 email(全小寫)
//   value:{ class, seatNo, surname, fullName }
//     class    — '5年3班'(必填,用於萃取年級數+班級數)
//     seatNo   — 1~35 整數(必填,個位數會自動補 0 為 2 碼)
//     surname  — '蔣'(必填,用於管理員後台/圖鑑/排行榜「同學」顯示)
//     fullName — '蔣小明'(★ v3.5.59 新增,僅用於好友面板顯示完整真名)
//
//   填寫範例:
//     'lsps110046@stu.lsps.tp.edu.tw': {
//       class:    '5年3班',
//       seatNo:   24,
//       surname:  '蔣',
//       fullName: '蔣小明',    // 老師可選填,沒填好友面板會 fallback 只顯示姓
//     },
//
//   顯示對照(同一筆名冊):
//     管理員後台 / 圖鑑 / 排行榜  → '5324蔣同學'          (姓 + 同學泛稱)
//     世界 BOSS 邀請好友彈窗      → '5324蔣同學' + 線上燈號
//     好友面板(玩家自己看)      → '5324蔣小明' + 線上燈號(若有 fullName)
//                              或 '5324蔣同學' + 線上燈號(若沒 fullName)
//
//   部署:
//     1. 把這個檔案放在 GitHub repo 跟 index.html 同層
//     2. 改 index.html 內的 <script src="student_roster.js?v=YYYYMMDD"> 破快取
//     3. 若不想上 GitHub(個資考量),加入 .gitignore 後手動上傳到伺服器
//
//   失敗安全:
//     若本檔載入失敗(404 / 網路問題),index.html 內 fallback 為空物件,
//     所有顯示走「無名冊資料 → 原 displayName」路徑,遊戲完全正常運作,
//     只是管理員後台短碼功能停擺。
//
// ════════════════════════════════════════════════════════════════════

window._STUDENT_ROSTER = {

  // ─── 範例(請老師參考格式後逐筆填入,key 必須是全小寫 email)─────────────
  //
  // 'lsps110046@stu.lsps.tp.edu.tw': { class:'5年3班', seatNo:24, surname:'蔣', fullName:'蔣小明' },  // 青炎龍王設計者
  // 'drummerelvis@gmail.com':         { class:'5年3班', seatNo:1,  surname:'張', fullName:'張小強' },  // 火柴人設計者
  // 'lsps110137@stu.lsps.tp.edu.tw': { class:'5年5班', seatNo:14, surname:'閻', fullName:'閻小華' },
  //
  // ─── 5 年 3 班 ─────────────────────────────────────────────────
  // 'lsps110001@stu.lsps.tp.edu.tw': { class:'5年3班', seatNo:1,  surname:'王', fullName:'王...' },
  //
  // ─── 5 年 5 班 ─────────────────────────────────────────────────
  //
  // ─── 6 年 5 班 ─────────────────────────────────────────────────
  //

};

// 通知 index.html 名冊已載入完成(若有人在等)
try {
  if (typeof window !== 'undefined' && typeof window._onStudentRosterReady === 'function') {
    window._onStudentRosterReady();
  }
} catch(e) {}

console.info('[student_roster.js v3.5.59] 已載入,共 ' + Object.keys(window._STUDENT_ROSTER).length + ' 筆名冊資料');
