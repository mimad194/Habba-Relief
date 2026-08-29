import { Routes, Route, Link } from 'react-router-dom'
import { Flame, ShieldAlert, HeartHandshake, Home } from 'lucide-react'
import { Analytics } from '@vercel/analytics/react'
import Dashboard from './routes/Dashboard'
import VictimRequest from './routes/VictimRequest'
import Volunteer from './routes/Volunteer'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-red-500/30" dir="rtl">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-red-500 to-orange-600 p-2 shadow-lg shadow-red-500/20">
                <Flame size={24} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-300" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }}>
                  هَبّة
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">منصة تنسيق القوافل التضامنية</span>
              </div>
            </div>

            {/* Nav Links */}
            <div className="flex gap-4">
              <Link to="/" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                <Home size={18} />
                <span className="hidden sm:inline">اللوحة الرئيسية</span>
              </Link>
              <Link to="/request" className="flex items-center gap-2 rounded-xl bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors">
                <ShieldAlert size={18} />
                <span className="hidden sm:inline">طلب إغاثة</span>
              </Link>
              <Link to="/volunteer" className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                <HeartHandshake size={18} />
                <span className="hidden sm:inline">تقديم مساعدة</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/request" element={<VictimRequest />} />
          <Route path="/volunteer" element={<Volunteer />} />
        </Routes>
      </main>

      {/* Footer / Copyright */}
      <footer className="mt-auto border-t border-white/5 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} هَبّة. جميع الحقوق محفوظة لـ <span className="font-bold text-slate-400 tracking-widest">M.I.E</span></p>
      </footer>

      <Analytics />
    </div>
  )
}
