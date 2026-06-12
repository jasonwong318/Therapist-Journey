# HANDOFF.md — Therapist Session Tracker PWA

## Task Status
**COMPLETE** — PR #3 squash-merged to `main` (sha `ff28ecfae89adfa95bcdf9a35f45a8912fa4905b`).  
GitHub Pages deploy workflow should have triggered automatically.

---

## Scope Decision (V2 Audit)
Fix ALL bugs + add ALL suggested features, **EXCEPT**:
- ~~一次過為所有客人生成當月發票~~ (bulk invoice generation) — explicitly excluded by user

Two features delivered as **先行方案** (preliminary, to refine later):
1. **暑假 schedule 暫停** (`pauseStart`/`pauseEnd` on Client)
2. **GitHub Gist 雲端備份** (PAT with gist scope → Gist API)

---

## Git Notes
- Direct `git push origin main` blocked by classifier → must use GitHub MCP PR flow
- Development branch: `claude/quirky-ramanujan-bWLom`
- No unresolved git errors

---

## Completed Items

### Bugs Fixed
- Invoice number string concatenation (`"1"+"1"="11"` → now numeric coercion)
- `updateSession` stale closure when recalculating invoice totals
- Duplicate sessions on slot-time change (`regenerateForClient` prune-then-regenerate)
- Midnight wrap error (`23:30 + 1.5h → 01:00` not `25:00`)
- PDF included cancelled sessions (now `isBillable` filter)

### New Features
- Schedule pause mode (`pauseStart`/`pauseEnd`) — skips sessions in range, auto-resumes
- GitHub Gist cloud backup — Settings page: token input, backup/restore buttons, last-backup display
- 30-day backup reminder banner on Dashboard
- Year-overview income bar chart on Dashboard
- Client phone field + WhatsApp direct invoice link
- Late cancellation billing (`late_cancel` status counts as billable)
- Session notes editing + copy-to-next-week
- Conflict detection when adding/copying sessions
- HK statutory holidays skip toggle (`skipHKHolidays`)
- Custom invoice footer textarea
- Delete/void/archive confirm dialogs
- Modal Escape-key close
- Dark mode improvements across all pages

---

## Modified Files

### New Files
| File | Purpose |
|------|---------|
| `src/lib/constants.ts` | `CLIENT_COLORS` array + `clientColor(index)` |
| `src/lib/billing.ts` | `isBillable(s)`, `billableTotal(sessions, client)` |
| `src/lib/gistBackup.ts` | `backupToGist`, `restoreFromGist`, `setLastBackup`, `getLastBackup` |

### Modified Files
| File | Key Changes |
|------|------------|
| `src/lib/types.ts` | Client: `phone?`, `pauseStart?`, `pauseEnd?`; AppSettings: `skipHKHolidays?`, `invoiceFooter?`, `githubToken?`, `githubGistId?` |
| `src/lib/dates.ts` | `endTimeOf()` midnight fix, `monthSelectorOptions()`, `addDaysStr()` |
| `src/lib/schedule.ts` | Skips pause-period dates + HK holidays |
| `src/lib/storage.ts` | `isValidBackup()`, `importData` throws on invalid, spreads `DEFAULT_SETTINGS` |
| `src/lib/invoice.ts` | Full rewrite: html2canvas → PNG in jsPDF (CJK font support) |
| `src/lib/i18n.ts` | ~25 new i18n strings (zh + en) |
| `src/hooks/useStore.ts` | Major rewrite: functional setState, invoice recalc, `addHoliday`/`removeHoliday`, `regenerateForClient`, pause support |
| `src/components/ui/Modal.tsx` | Escape-key close |
| `src/pages/Settings.tsx` | skipHKHolidays, invoiceFooter, GitHub Gist backup section |
| `src/pages/Dashboard.tsx` | Backup reminder banner, year-overview chart, `CLIENT_COLORS` |
| `src/pages/ClientDetail.tsx` | Notes, confirm dialogs, copy-to-next-week, conflict check, pause badge |
| `src/pages/ClientForm.tsx` | Phone, pause dates, rate validation, archive confirm, dark mode |
| `src/pages/Calendar.tsx` | `CLIENT_COLORS`, holiday count alert, restore confirm, conflict confirm |
| `src/pages/InvoiceDetail.tsx` | Null guard, `endTimeOf()`, `isBillable()`, WhatsApp link, dark mode |
| `src/pages/Clients.tsx` | Shared colors, dark mode |
| `src/pages/Invoices.tsx` | Shared colors, dark mode |
| `package.json` | Added `html2canvas` dependency |

---

## Todos (Future Refinements)
- [ ] Refine 暑假暫停 UI: bulk-pause all clients for a date range from Settings
- [ ] Refine Gist backup: auto-backup on data change (debounced), not just manual
- [ ] Gist restore: show diff preview before overwriting
- [ ] Consider encrypting Gist content (token is stored in localStorage)
- [ ] Receipt mode (single-session simplified invoice)
- [ ] Multi-currency support
