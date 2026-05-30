import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { useStore } from './hooks/useStore'
import { StoreContext } from './hooks/StoreContext'
import { BottomNav } from './components/ui/BottomNav'
import { Dashboard } from './pages/Dashboard'
import { Clients } from './pages/Clients'
import { ClientForm } from './pages/ClientForm'
import { ClientDetail } from './pages/ClientDetail'
import { Calendar } from './pages/Calendar'
import { Invoices } from './pages/Invoices'
import { InvoiceDetail } from './pages/InvoiceDetail'
import { Settings } from './pages/Settings'
import { t } from './lib/i18n'

const AppShell = () => (
  <div className="min-h-svh bg-[#F6F9FC]">
    <div className="sticky top-0 z-30 bg-[#F6F9FC]/80 backdrop-blur-md safe-top border-b border-slate-100/60">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#635BFF] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="font-semibold text-slate-900 text-sm">{t.appName}</span>
        </div>
        <NavLink to="/settings" className={({ isActive }) => `p-2 rounded-xl transition-colors ${isActive ? 'bg-indigo-50 text-[#635BFF]' : 'text-slate-400 hover:bg-slate-100'}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </NavLink>
      </div>
    </div>

    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/clients" element={<Clients />} />
      <Route path="/clients/new" element={<ClientForm />} />
      <Route path="/clients/:id" element={<ClientDetail />} />
      <Route path="/clients/:id/edit" element={<ClientForm />} />
      <Route path="/invoices" element={<Invoices />} />
      <Route path="/invoices/:id" element={<InvoiceDetail />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>

    <BottomNav />
  </div>
)

function App() {
  const store = useStore()
  return (
    <StoreContext.Provider value={store}>
      <BrowserRouter basename="/Testing">
        <AppShell />
      </BrowserRouter>
    </StoreContext.Provider>
  )
}

export default App
