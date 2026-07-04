type Translations = {
  dashboard: string; calendar: string; clients: string; invoices: string; settings: string; appName: string
  today: string; thisMonth: string; outstanding: string; sessions: string; invoicesCount: string
  todaySessions: string; noSessionsToday: string; monthlyOverview: string; done: string; upcoming: string
  addFirstClient: string; noClientsYet: string; hiGreeting: (name: string) => string
  addClient: string; archived: string; perHour: string; slotsPerWeek: (n: number) => string; noClients: string
  newClient: string; editClient: string; clientName: string; clientNamePlaceholder: string
  hourlyRate: string; defaultDuration: string; notes: string; notesPlaceholder: string
  weeklySchedule: string; addSlot: string; noSlots: string; day: string; time: string; duration: string
  saveChanges: string; archiveClient: string; unarchiveClient: string; cancel: string
  halfHour: string; oneHour: string; oneHalfHour: string; twoHours: string
  days: string[]; daysLong: string[]
  noSessionsThisMonth: string; monthlyEarnings: (month: string) => string
  totalHours: (h: number) => string; invoiced: string; invoice: string; sessionBreakdown: string
  addAdhoc: string; adhocLabel: string; confirmAddAdhoc: string; sessionDuration: string; updateStatus: string; deleteSession: string
  statusLabels: Record<string, string>
  noSessionsDay: string; addSession: string; addSessionTitle: (date: string) => string; selectClient: string
  monthNames: string[]; dayLabels: string[]
  addHoliday: string; markHoliday: string; holidayLabel: string; holidayPlaceholder: string
  confirmMarkHoliday: string; cancelHoliday: string; isHoliday: string
  noInvoices: string; generateFromClient: string; paid: string; sent: string; draft: string
  totalAmount: string; downloadPDF: string; markSent: string; markPaid: string; unmarkPaid: string
  issued: string; sentDate: string; paidDate: string; total: string; whatsappShare: string
  therapistProfile: string; yourName: string; namePlaceholder: string; email: string; phone: string
  paymentInfo: string; paymentPlaceholder: string; invoiceSettings: string; currency: string
  invoicePrefix: string; nextInvoiceNumber: string; saveSettings: string; saved: string
  data: string; exportBackup: string; importBackup: string; dataLocal: string
  holidays: string; manageHolidays: string; noHolidays: string; removeHoliday: string; addHolidayHint: string
  edit: string; adhocTag: string; cost: string; dateLabel: string; timeLabel: string; durationLabel: string; statusLabel: string; hrs: (h: number) => string
  slotStartDate: string; slotEndDate: string; noEndDate: string
  updateInvoice: string; voidInvoice: string; projected: string; projectedIncome: string
  confirmDeleteSession: string; confirmVoidInvoice: string; confirmArchiveClient: string
  invalidBackup: string
  sessionNotes: string; sessionNotesPlaceholder: string
  copyToNextWeek: string; conflictWarning: string
  clientPhone: string; clientPhoneHint: string
  pauseSchedule: string; pauseStart: string; pauseEnd: string; pauseHint: string; pausedTag: string
  skipHKHolidays: string; skipHKHolidaysHint: string
  invoiceFooterLabel: string; invoiceFooterPlaceholder: string
  cloudBackup: string; githubTokenLabel: string; githubTokenHint: string
  backupNow: string; restoreFromCloud: string; backingUp: string
  backupSuccess: string; backupFailed: string; restoreConfirm: string; restoreFailed: string
  lastBackup: (date: string) => string; neverBackedUp: string; backupReminder: string
  holidaySessionsCancelled: (n: number) => string; restoreCancelledSessions: string
  lateCancelHint: string
  yearOverview: string
  rescheduleHint: string; swipeToCancelHint: string
  bulkPauseTitle: string; bulkPauseHint: string; applyBulkPause: string; clearAllPauses: string
  bulkPauseApplied: (n: number) => string; bulkPauseCleared: (n: number) => string; bulkPauseInvalid: string
  autoBackupLabel: string; autoBackupHint: string
  restoreDiff: (backup: { clients: number; sessions: number; invoices: number; exportedAt: string },
    local: { clients: number; sessions: number; invoices: number }) => string
}

const zh: Translations = {
  dashboard: '主頁', calendar: '日曆', clients: '客人', invoices: '發票', settings: '設定', appName: '療程記錄',
  today: '今天', thisMonth: '本月收入', outstanding: '待收款項', sessions: '堂', invoicesCount: '張發票',
  todaySessions: '今天課堂', noSessionsToday: '今天沒有課堂', monthlyOverview: '本月概覽',
  done: '已完成', upcoming: '待上', addFirstClient: '新增第一位客人 →', noClientsYet: '還沒有客人。',
  hiGreeting: (name) => `你好，${name} 👋`,
  addClient: '新增客人', archived: '已存檔', perHour: '/小時', slotsPerWeek: (n) => `${n} 個時段/週`, noClients: '還沒有客人。',
  newClient: '新增客人', editClient: '編輯客人', clientName: '客人姓名', clientNamePlaceholder: '例：陳小明',
  hourlyRate: '時薪（HKD）', defaultDuration: '預設課堂時長', notes: '備註（選填）', notesPlaceholder: '關於此客人的備註...',
  weeklySchedule: '每週課表', addSlot: '+ 新增時段', noSlots: '未設時段，點擊新增時段。',
  day: '星期', time: '時間', duration: '時長', saveChanges: '儲存更改', archiveClient: '存檔客人',
  unarchiveClient: '取消存檔（重新啟用）', cancel: '取消',
  halfHour: '0.5 小時', oneHour: '1 小時', oneHalfHour: '1.5 小時', twoHours: '2 小時',
  days: ['日', '一', '二', '三', '四', '五', '六'],
  daysLong: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  noSessionsThisMonth: '本月沒有課堂。', monthlyEarnings: (month) => `${month} 收入`,
  totalHours: (h) => `共 ${h} 小時`, invoiced: '已開發票', invoice: '開發票', sessionBreakdown: '課堂明細',
  addAdhoc: '+ 補堂', adhocLabel: '新增補堂', confirmAddAdhoc: '確認新增補堂',
  sessionDuration: '課堂時長', updateStatus: '更新狀態', deleteSession: '刪除課堂',
  statusLabels: { completed: '已完成', cancelled: '已取消', scheduled: '待上', rescheduled: '已改期', late_cancel: '臨時取消' },
  noSessionsDay: '今天沒有課堂，點擊新增。', addSession: '+ 新增', addSessionTitle: (date) => `新增課堂 — ${date}`,
  selectClient: '選擇客人...',
  monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  dayLabels: ['日', '一', '二', '三', '四', '五', '六'],
  addHoliday: '+ 假期', markHoliday: '標記為假期/休息日', holidayLabel: '假期名稱（選填）',
  holidayPlaceholder: '例：公眾假期', confirmMarkHoliday: '標記假期', cancelHoliday: '移除假期', isHoliday: '假期',
  noInvoices: '還沒有發票。', generateFromClient: '從客人頁面生成發票。', paid: '已付款', sent: '已發送', draft: '草稿',
  totalAmount: '總金額', downloadPDF: '下載 PDF', markSent: '標記已發送', markPaid: '標記已付款',
  unmarkPaid: '取消付款標記', issued: '開立日期', sentDate: '發送日期', paidDate: '付款日期',
  total: '總計', whatsappShare: 'WhatsApp 通知客人',
  therapistProfile: '治療師資料', yourName: '你的姓名', namePlaceholder: '例：王小姐',
  email: '電郵', phone: '電話', paymentInfo: '付款資料（顯示於發票）',
  paymentPlaceholder: 'FPS：9xxx xxxx\n轉數快 / 銀行轉帳...',
  invoiceSettings: '發票設定', currency: '貨幣', invoicePrefix: '發票號碼前綴',
  nextInvoiceNumber: '下一個發票號碼', saveSettings: '儲存設定', saved: '✓ 已儲存！',
  data: '資料管理', exportBackup: '匙出備份（JSON）', importBackup: '匙入備份（JSON）',
  dataLocal: '所有資料儲存於本機裝置。', holidays: '假期 / 休息日',
  manageHolidays: '管理假期，自動排課將跳過這些日子。', noHolidays: '未設假期。',
  removeHoliday: '移除', addHolidayHint: '從日曆頁點擊日期可新增假期',
  edit: '編輯', adhocTag: '補堂', cost: '費用', dateLabel: '日期', timeLabel: '時間', durationLabel: '時長', statusLabel: '狀態', hrs: (h) => `${h}小時`,
  slotStartDate: '開始日期（選填）', slotEndDate: '結束日期（選填）', noEndDate: '不設結束日期',
  updateInvoice: '加入發票', voidInvoice: '刪除發票', projected: '預計', projectedIncome: '預計收入',
  confirmDeleteSession: '確定刪除此課堂？此操作無法復原。',
  confirmVoidInvoice: '確定刪除此發票？課堂將回復為未開發票狀態。',
  confirmArchiveClient: '確定存檔此客人？已排課堂將不再自動生成。',
  invalidBackup: '無效的備份檔案，資料未有改動。',
  sessionNotes: '課堂備註', sessionNotesPlaceholder: '當堂重點、功課...',
  copyToNextWeek: '複製到下週同一時間',
  conflictWarning: '注意：該時段已有其他課堂，確定繼續？',
  clientPhone: 'WhatsApp 電話（選填）', clientPhoneHint: '例：85291234567（連區號，不加 +）',
  pauseSchedule: '暫停排課（如暑假）', pauseStart: '暫停開始', pauseEnd: '暫停結束',
  pauseHint: '此期間內不會自動排課，期後自動回復原有課表。',
  pausedTag: '暫停中',
  skipHKHolidays: '自動跳過香港公眾假期', skipHKHolidaysHint: '開啟後，自動排課將略過公眾假期。',
  invoiceFooterLabel: '發票頁腳（選填）', invoiceFooterPlaceholder: '例：請於 7 日內付款。',
  cloudBackup: '雲端備份（GitHub）',
  githubTokenLabel: 'GitHub Token（需 gist 權限）',
  githubTokenHint: '於 github.com → Settings → Developer settings → Personal access tokens 建立，剔選 gist 權限。資料會備份到你帳戶下的私密 Gist。',
  backupNow: '立即備份', restoreFromCloud: '從雲端還原', backingUp: '備份中...',
  backupSuccess: '✓ 已備份到 GitHub！', backupFailed: '備份失敗，請檢查 Token 是否正確。',
  restoreConfirm: '從雲端還原將覆蓋本機所有資料，確定繼續？',
  restoreFailed: '還原失敗，請檢查 Token 及網絡。',
  lastBackup: (date) => `上次備份：${date}`, neverBackedUp: '從未備份',
  backupReminder: '提示：已超過 30 日未備份資料，建議到「設定」備份。',
  holidaySessionsCancelled: (n) => `已標記假期，當日 ${n} 堂已自動取消。`,
  restoreCancelledSessions: '已移除假期。要恢復當日被取消的課堂嗎？',
  lateCancelHint: '「臨時取消」會照常計費；「已取消」及「已改期」不計費。',
  yearOverview: '年度統計',
  rescheduleHint: '儲存後，原本課堂會標記為「已改期」，並會喺上面揀選嘅新日期自動新增一堂。',
  swipeToCancelHint: '提示：課堂向左滑可快速取消',
  bulkPauseTitle: '批量暫停排課（如暑假）',
  bulkPauseHint: '一次過為所有客人設定相同的暫停日期，期間不會自動排課，期後自動回復。個別客人可在其編輯頁面另行調整。',
  applyBulkPause: '套用至所有客人', clearAllPauses: '清除所有暫停',
  bulkPauseApplied: (n) => `已為 ${n} 位客人設定暫停。`,
  bulkPauseCleared: (n) => `已清除 ${n} 位客人的暫停設定。`,
  bulkPauseInvalid: '請填寫有效的暫停開始及結束日期（結束日期不可早於開始日期）。',
  autoBackupLabel: '自動備份',
  autoBackupHint: '資料變更後約 30 秒自動備份到 GitHub（需先手動備份一次）。',
  restoreDiff: (b, l) =>
    `雲端備份（${b.exportedAt}）：${b.clients} 位客人、${b.sessions} 堂課、${b.invoices} 張發票。\n本機現有：${l.clients} 位客人、${l.sessions} 堂課、${l.invoices} 張發票。`,
}

const en: Translations = {
  dashboard: 'Home', calendar: 'Calendar', clients: 'Clients', invoices: 'Invoices', settings: 'Settings', appName: 'Therapy Tracker',
  today: 'Today', thisMonth: 'This Month', outstanding: 'Outstanding', sessions: 'sessions', invoicesCount: 'invoices',
  todaySessions: "Today's Sessions", noSessionsToday: 'No sessions today.', monthlyOverview: 'Monthly Overview',
  done: 'Done', upcoming: 'Upcoming', addFirstClient: 'Add your first client →', noClientsYet: 'No clients yet.',
  hiGreeting: (name) => `Hi, ${name} 👋`,
  addClient: 'Add Client', archived: 'Archived', perHour: '/hr', slotsPerWeek: (n) => `${n} slot${n !== 1 ? 's' : ''}/wk`, noClients: 'No clients yet.',
  newClient: 'New Client', editClient: 'Edit Client', clientName: 'Client Name', clientNamePlaceholder: 'e.g. John Chan',
  hourlyRate: 'Hourly Rate (HKD)', defaultDuration: 'Default Duration', notes: 'Notes (optional)', notesPlaceholder: 'Notes about this client...',
  weeklySchedule: 'Weekly Schedule', addSlot: '+ Add Slot', noSlots: 'No slots yet. Tap to add.',
  day: 'Day', time: 'Time', duration: 'Duration', saveChanges: 'Save Changes', archiveClient: 'Archive Client',
  unarchiveClient: 'Unarchive (Re-activate)', cancel: 'Cancel',
  halfHour: '30 Min', oneHour: '1 Hour', oneHalfHour: '1.5 Hours', twoHours: '2 Hours',
  days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  daysLong: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  noSessionsThisMonth: 'No sessions this month.', monthlyEarnings: (month) => `${month} Earnings`,
  totalHours: (h) => `${h} hrs total`, invoiced: 'Invoiced', invoice: 'Invoice', sessionBreakdown: 'Session Breakdown',
  addAdhoc: '+ Makeup', adhocLabel: 'Add Makeup Session', confirmAddAdhoc: 'Confirm Add Session',
  sessionDuration: 'Duration', updateStatus: 'Update Status', deleteSession: 'Delete Session',
  statusLabels: { completed: 'Completed', cancelled: 'Cancelled', scheduled: 'Scheduled', rescheduled: 'Rescheduled', late_cancel: 'Late Cancel' },
  noSessionsDay: 'No sessions. Tap to add.', addSession: '+ Add', addSessionTitle: (date) => `Add Session — ${date}`,
  selectClient: 'Select client...',
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  dayLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  addHoliday: '+ Holiday', markHoliday: 'Mark as Holiday', holidayLabel: 'Holiday Name (optional)',
  holidayPlaceholder: 'e.g. Public Holiday', confirmMarkHoliday: 'Mark Holiday', cancelHoliday: 'Remove Holiday', isHoliday: 'Holiday',
  noInvoices: 'No invoices yet.', generateFromClient: 'Generate invoices from client page.', paid: 'Paid', sent: 'Sent', draft: 'Draft',
  totalAmount: 'Total Amount', downloadPDF: 'Download PDF', markSent: 'Mark as Sent', markPaid: 'Mark as Paid',
  unmarkPaid: 'Unmark as Paid', issued: 'Issued', sentDate: 'Sent Date', paidDate: 'Paid Date',
  total: 'Total', whatsappShare: 'Notify via WhatsApp',
  therapistProfile: 'Therapist Profile', yourName: 'Your Name', namePlaceholder: 'e.g. Jane Wong',
  email: 'Email', phone: 'Phone', paymentInfo: 'Payment Info (shown on invoice)',
  paymentPlaceholder: 'FPS: 9xxx xxxx\nBank transfer...',
  invoiceSettings: 'Invoice Settings', currency: 'Currency', invoicePrefix: 'Invoice Prefix',
  nextInvoiceNumber: 'Next Invoice Number', saveSettings: 'Save Settings', saved: '✓ Saved!',
  data: 'Data Management', exportBackup: 'Export Backup (JSON)', importBackup: 'Import Backup (JSON)',
  dataLocal: 'All data stored on this device.', holidays: 'Holidays / Rest Days',
  manageHolidays: 'Manage holidays. Auto-scheduling skips these days.', noHolidays: 'No holidays set.',
  removeHoliday: 'Remove', addHolidayHint: 'Tap a date in Calendar to add a holiday',
  edit: 'Edit', adhocTag: 'Makeup', cost: 'Fee', dateLabel: 'Date', timeLabel: 'Time', durationLabel: 'Duration', statusLabel: 'Status', hrs: (h) => `${h}h`,
  slotStartDate: 'Start Date (optional)', slotEndDate: 'End Date (optional)', noEndDate: 'No end date',
  updateInvoice: 'Add to Invoice', voidInvoice: 'Delete Invoice', projected: 'Projected', projectedIncome: 'Projected',
  confirmDeleteSession: 'Delete this session? This cannot be undone.',
  confirmVoidInvoice: 'Delete this invoice? Sessions will revert to uninvoiced.',
  confirmArchiveClient: 'Archive this client? Scheduled sessions will no longer be generated.',
  invalidBackup: 'Invalid backup file. Your data was not changed.',
  sessionNotes: 'Session Notes', sessionNotesPlaceholder: 'Key points, homework...',
  copyToNextWeek: 'Copy to same time next week',
  conflictWarning: 'Warning: another session exists at this time. Continue?',
  clientPhone: 'WhatsApp Phone (optional)', clientPhoneHint: 'e.g. 85291234567 (with country code, no +)',
  pauseSchedule: 'Pause Schedule (e.g. summer break)', pauseStart: 'Pause From', pauseEnd: 'Pause Until',
  pauseHint: 'No sessions are auto-scheduled during this period; the normal schedule resumes afterwards.',
  pausedTag: 'Paused',
  skipHKHolidays: 'Auto-skip HK public holidays', skipHKHolidaysHint: 'When on, auto-scheduling skips public holidays.',
  invoiceFooterLabel: 'Invoice Footer (optional)', invoiceFooterPlaceholder: 'e.g. Payment due within 7 days.',
  cloudBackup: 'Cloud Backup (GitHub)',
  githubTokenLabel: 'GitHub Token (gist scope)',
  githubTokenHint: 'Create at github.com → Settings → Developer settings → Personal access tokens, with the gist scope. Data is backed up to a secret Gist in your account.',
  backupNow: 'Backup Now', restoreFromCloud: 'Restore from Cloud', backingUp: 'Backing up...',
  backupSuccess: '✓ Backed up to GitHub!', backupFailed: 'Backup failed. Check your token.',
  restoreConfirm: 'Restoring from cloud will overwrite all local data. Continue?',
  restoreFailed: 'Restore failed. Check token and network.',
  lastBackup: (date) => `Last backup: ${date}`, neverBackedUp: 'Never backed up',
  backupReminder: 'Tip: it has been over 30 days since your last backup. Back up in Settings.',
  holidaySessionsCancelled: (n) => `Holiday marked. ${n} session(s) that day were cancelled.`,
  restoreCancelledSessions: 'Holiday removed. Restore the cancelled sessions on that day?',
  lateCancelHint: '"Late Cancel" is still billed; "Cancelled" and "Rescheduled" are not.',
  yearOverview: 'Year Overview',
  rescheduleHint: 'On save, this session is marked "Rescheduled" and a new session is added on the date chosen above.',
  swipeToCancelHint: 'Tip: swipe a session left to cancel it',
  bulkPauseTitle: 'Bulk Pause Scheduling (e.g. summer break)',
  bulkPauseHint: 'Set the same pause period for all clients at once. No sessions are auto-scheduled during the period; the schedule resumes afterwards. Individual clients can be adjusted on their edit page.',
  applyBulkPause: 'Apply to All Clients', clearAllPauses: 'Clear All Pauses',
  bulkPauseApplied: (n) => `Pause set for ${n} client(s).`,
  bulkPauseCleared: (n) => `Pause cleared for ${n} client(s).`,
  bulkPauseInvalid: 'Please enter valid pause start and end dates (end must not be before start).',
  autoBackupLabel: 'Auto Backup',
  autoBackupHint: 'Backs up to GitHub ~30s after data changes (run a manual backup once first).',
  restoreDiff: (b, l) =>
    `Cloud backup (${b.exportedAt}): ${b.clients} clients, ${b.sessions} sessions, ${b.invoices} invoices.\nLocal data: ${l.clients} clients, ${l.sessions} sessions, ${l.invoices} invoices.`,
}

export type Lang = 'zh' | 'en'

const stored = localStorage.getItem('tt_lang') as Lang | null
export let t: Translations = (stored === 'en') ? en : zh

export const getLang = (): Lang => (localStorage.getItem('tt_lang') as Lang) ?? 'zh'

export const setLang = (lang: Lang) => {
  t = lang === 'en' ? en : zh
  localStorage.setItem('tt_lang', lang)
}
