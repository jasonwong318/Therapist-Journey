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
  oneHour: string; oneHalfHour: string; twoHours: string
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
  updateInvoice: string; voidInvoice: string
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
  oneHour: '1 小時', oneHalfHour: '1.5 小時', twoHours: '2 小時',
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
  data: '資料管理', exportBackup: '匯出備份（JSON）', importBackup: '匯入備份（JSON）',
  dataLocal: '所有資料儲存於本機裝置。', holidays: '假期 / 休息日',
  manageHolidays: '管理假期，自動排課將跳過這些日子。', noHolidays: '未設假期。',
  removeHoliday: '移除', addHolidayHint: '從日曆頁點擊日期可新增假期',
  edit: '編輯', adhocTag: '補堂', cost: '費用', dateLabel: '日期', timeLabel: '時間', durationLabel: '時長', statusLabel: '狀態', hrs: (h) => `${h}小時`,
  slotStartDate: '開始日期（選填）', slotEndDate: '結束日期（選填）', noEndDate: '不設結束日期',
  updateInvoice: '加入發票', voidInvoice: '刪除發票',
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
  oneHour: '1 Hour', oneHalfHour: '1.5 Hours', twoHours: '2 Hours',
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
  updateInvoice: 'Add to Invoice', voidInvoice: 'Delete Invoice',
}

export type Lang = 'zh' | 'en'

const stored = localStorage.getItem('tt_lang') as Lang | null
export let t: Translations = (stored === 'en') ? en : zh

export const getLang = (): Lang => (localStorage.getItem('tt_lang') as Lang) ?? 'zh'

export const setLang = (lang: Lang) => {
  t = lang === 'en' ? en : zh
  localStorage.setItem('tt_lang', lang)
}
