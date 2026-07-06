# ROADMAP — Therapist Session Tracker

> 用途：整理剩餘功能俾用戶同太太（實際使用者）傾優先次序，
> 並作為下一個 AI session（Opus）嘅接手文件。
> 最後更新：2026-07（Fable 5 全面 review + 修正批次之後）

---

## 已完成（呢次批次，作為背景）

- ✅ 香港公眾假期資料修正 + 官方 1823.gov.hk feed 自動更新（`hkHolidays.ts`，30 日快取）
- ✅ localStorage 寫入保護（爆滿彈警告）+ `navigator.storage.persist()` + 自動備份預設開
- ✅ 發票 PDF 多頁分頁 + Web Share API（iOS PWA 分享面板優先，fallback 下載）
- ✅ 時薪歷史（`rateHistory` + `rateOn()`）：改時薪設生效日期，之前課堂按舊價、之後按新價
- ✅ 刪除已入發票課堂會同步修正發票（移除 id + 重計金額）
- ✅ 撞堂偵測改用時間區間重疊（`timesOverlap`）
- ✅ GitHub Pages SPA 404 redirect（deep link refresh 唔再 404）
- ✅ 備份檔匯入逐欄驗證
- ✅ Vitest 測試套件（35 tests：dates / billing+rates / schedule），已加入 deploy workflow
- ✅ App PIN 鎖（Settings 設定，SHA-256 hash，開 app 要解鎖）
- ✅ 發票 HTML 注入 escape、swipe undo timer 清理

---

## 待做功能（等太太揀優先次序）

### A. 錢相關（推薦優先）

**A1. 年度收入報表 / CSV 匯出**（報稅用）
- Settings 或 Dashboard 加「匯出年度報表」：揀年份 → 下載 CSV
- 欄位：日期、客人、時長、時薪、金額、狀態、發票號碼、已付/未付
- 實作提示：純 client-side，`Blob` + `a.download`；重用 `sessionCost()`/`isBillable()`
- 順手加：年度總結行（總堂數、總時數、總收入、已收/未收）

**A2. 每客欠款累計視圖**
- Clients 列表每個客人卡片顯示「未付 $X（N 張發票）」
- 計法：該客所有 `!paidAt` 發票，金額用 `billableTotal`（同 Dashboard outstanding 一致）
- 注意：而家 Dashboard「待收款項」只計所揀月份；可考慮同時加一個「全部未收」總數

**A3. 發票到期日 + 逾期標示**
- `Invoice` 加 `dueAt?: string`（開票時 = issuedAt + N 日，N 喺 Settings 設定，預設 7）
- Invoices 列表 + InvoiceDetail：過期未付顯示紅色「逾期 X 日」badge
- 舊發票冇 `dueAt` 就唔顯示（唔使 migration）

**A4. 收據模式（單堂簡化收據）**（舊 todo）
- ClientDetail 課堂 modal 加「開收據」：單堂、即時 PDF，格式同發票類似但簡化
- 收據編號可獨立 sequence（`nextReceiptNumber`）

**A5. 多貨幣**（舊 todo，優先度低 — 而家全域 currency 已夠用）

### B. 排課相關

**B1. 隔週 / 自訂頻率循環時段**
- `ScheduleSlot` 加 `frequency?: 1 | 2`（每週/隔週）+ `anchorDate`（隔週由邊個星期起計）
- `schedule.ts` 生成時按 anchor 計 week parity；tests 要加
- UI：ClientForm slot 加頻率 select

**B2. iCal 匯出**
- 生成 `.ics` 檔（VEVENT per scheduled session，未來 3 個月）俾手機日曆 import
- 純文字模板就得，唔使 library

### C. 備份/資料

**C1. Gist 備份版本歷史還原**
- Gist 本身有 revision history（GET /gists/:id/commits）
- Settings 列出最近 N 個版本（日期+大小），揀一個還原
- 配合已有嘅 restore diff preview

**C2. Gist 內容加密**（舊 todo）
- WebCrypto AES-GCM，密碼由用戶設（唔存 plaintext）；要諗忘記密碼 = 備份廢
- 同 C1 有交互（加密後 diff preview 要先解密）

**C3. 遷移 IndexedDB**（工程投資，唔急但值得）
- localStorage → IndexedDB（容量大、唔會 sync 阻塞、更耐清）
- 用薄 wrapper 保持 `storage.ts` API 不變；一次性 migration + 保留舊 key 做 fallback

### D. 其他

**D1. Dashboard「待收款項」範圍**：而家只計所揀月份嘅未付發票。考慮改成/加埋「全部未付」。
**D2. 客人搜尋/排序**（客人多咗先需要）
**D3. 生物認證解鎖**（WebAuthn，而家 PIN 已夠）

---

## 接手注意事項（俾 Opus）

1. **金錢計算一律經 `rateOn()` / `sessionCost()` / `billableTotal()`**（`src/lib/rates.ts`、`billing.ts`）。
   唔好直接寫 `client.hourlyRate * duration` — 會無視時薪歷史。
2. **循環堂唔可以真刪**：`deleteSession` 只俾 ad-hoc 用；循環堂要標 `cancelled`（tombstone），
   否則 `generateSessionsForMonth` 會重生。呢個 pattern 喺 `ClientDetail.handleDeleteSession` 有註解。
3. **改期語義**：原堂保留、標 `rescheduled`（不計費），新堂係 ad-hoc + `originalSessionId` 連結。
4. **改任何排課/計費邏輯前先跑 `npm test`**，改完加返對應 test case。
5. **Push 流程**：直接 `git push origin main` 得（歷史上有次被 classifier 擋，改用 GitHub MCP PR flow 即可）。
   Deploy workflow 而家會先跑 tests。
6. **UI 語言**：所有字串經 `src/lib/i18n.ts`（zh + en 都要加）。用戶溝通用廣東話。
7. 用戶（Jason）嘅太太係實際使用者（言語治療師）；功能決策等 Jason 確認。

## 已知限制（接受咗，唔使「修」）

- 資料單機 localStorage + Gist 手動/自動備份；冇多裝置即時 sync
- PIN 鎖係 privacy gate，唔係加密
- 假期 feed 靠 1823.gov.hk CORS 開放；失敗會靜默 fallback 靜態表（2025–2026）
- 發票用 html2canvas 截圖式 PDF：檔案較大、文字不可選取，但 CJK 顯示正確
