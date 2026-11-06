# 【2026-11-06】小遊戲/荒島 v1.422.0 — 荒島鍵盤(基底 v1.421.0)
- 老師:「荒島主角移動同時可用 ASDW 控制上下左右,野外與營地都要」「荒島求生的對話也可以用空白鍵跳過下一頁」
- 改檔:minigame_index.html(MG_VER v1.422.0)、minigame_sw.js(MINI_VERSION v1.422.0、SHELL lxps-mini-shell-v1.422.0);island_db 未改。
- 上傳順序:minigame_sw.js → minigame_index.html
- WASD 原本就綁,但只認 ev.key;注音輸入法下 ev.key 是「ㄊ」/Process ⇒ 新 islKeyNorm(ev) 優先讀 ev.code,野外/營地 keydown 與共用 keyup 都改用。
- islDialog 對白框:window capture keydown,空白鍵 = 下一頁,ev.repeat 忽略,彈窗(#isl-modal)開著或打字中不攔,攔下事件不觸發跳躍。
- 驗證:3 個 inline script node --check ✅;islKeyNorm 單元測試(KeyW+ㄊ→w、KeyD+Process→d、方向鍵、無 code 退回 key)✅。
- ⚠ 註解內不要寫「Arrow*/」,會提早關掉 /* */。
