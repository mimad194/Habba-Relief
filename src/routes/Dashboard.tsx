import { useState, useEffect } from 'react'
import { Activity, Users, AlertTriangle, CheckCircle2, Siren, ArrowUpRight, TrendingUp } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import MapView from '../components/MapView'
import NewsTicker from '../components/NewsTicker'
import RequestCard from '../components/RequestCard'
import { listenToActiveRequests } from '../firebase/firestore'
import type { ReliefRequest } from '../data/mockData'
import MobileTabs from '../components/MobileTabs'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map')
  const [activeRequests, setActiveRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen to live requests from Firestore
    const unsubscribe = listenToActiveRequests(null, (data) => {
      setActiveRequests(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // Calculate live KPIs based on Firestore data
  const criticalCount = activeRequests.filter(r => r.severity === 'حرج').length
  const highCount = activeRequests.filter(r => r.severity === 'عالي').length
  const normalCount = activeRequests.filter(r => r.severity === 'متوسط').length

  // Generate chart data based on request timestamps (mocking the last 5 hours for now until we have more real data)
  const chartData = [
    { time: '08:00', requests: 5 },
    { time: '09:00', requests: 12 },
    { time: '10:00', requests: 25 },
    { time: '11:00', requests: Math.max(30, activeRequests.length * 0.8) },
    { time: '12:00', requests: Math.max(45, activeRequests.length) },
  ]

  // Map requests to map markers
  const mapMarkers = activeRequests.map(r => ({
    id: r.id,
    lat: r.lat,
    lng: r.lng,
    type: 'victim' as const,
    label: `${r.needType} (${r.severity})`
  }))

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0 animate-fade-in">
      
      {/* 1. Top KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* KPI 1 */}
        <div className="rounded-3xl bg-white/5 border border-white/10 p-4 md:p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-red-500/10 group-hover:text-red-500/20 transition-colors">
            <AlertTriangle size={100} />
          </div>
          <div className="relative z-10">
            <p className="text-xs md:text-sm font-medium text-slate-400">نداءات استغاثة نشطة</p>
            <p className="text-3xl md:text-4xl font-black text-white mt-1">{loading ? '...' : activeRequests.length}</p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="rounded-3xl bg-white/5 border border-white/10 p-4 md:p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-orange-500/10 group-hover:text-orange-500/20 transition-colors">
            <Siren size={100} />
          </div>
          <div className="relative z-10">
            <p className="text-xs md:text-sm font-medium text-slate-400">وضع حرج (أولوية 1)</p>
            <p className="text-3xl md:text-4xl font-black text-orange-400 mt-1">{loading ? '...' : criticalCount}</p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="rounded-3xl bg-white/5 border border-white/10 p-4 md:p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
            <Users size={100} />
          </div>
          <div className="relative z-10">
            <p className="text-xs md:text-sm font-medium text-slate-400">قوافل متجهة / قيد الإنجاز</p>
            <p className="text-3xl md:text-4xl font-black text-emerald-400 mt-1">--</p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="rounded-3xl bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border border-emerald-500/20 p-4 md:p-5 shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs md:text-sm font-medium text-emerald-200">النداءات المُلبّاة بنجاح</p>
            <p className="text-3xl md:text-4xl font-black text-white mt-1">--</p>
          </div>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden">
        <MobileTabs activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Main Grid: Map & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[600px]">
        
        {/* Interactive Map */}
        <div className={`lg:col-span-2 rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative bg-slate-900 ${activeTab === 'list' ? 'hidden lg:block' : 'h-[400px] lg:h-auto'}`}>
          <div className="absolute top-4 right-4 z-[400] bg-slate-950/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-lg">
            <Activity className="text-red-500 animate-pulse" size={18} />
            <span className="text-sm font-bold text-white tracking-wide">الخريطة التفاعلية الحية</span>
          </div>
          <MapView markers={mapMarkers} height="100%" />
        </div>

        {/* Sidebar - Hidden on mobile if map tab is active */}
        <div className={`flex flex-col gap-4 overflow-hidden ${activeTab === 'map' ? 'hidden lg:flex' : ''}`}>
          
          {/* Chart Widget */}
          <div className="rounded-3xl bg-white/5 border border-white/10 p-5 shrink-0 hidden md:block">
            <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-red-400" />
              مؤشر تصاعد الاستغاثات
            </h3>
            <div className="h-24 md:h-32 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#f87171' }}
                  />
                  <Area type="monotone" dataKey="requests" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorReq)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Live Request Feed */}
          <div className="flex-1 rounded-3xl bg-white/5 border border-white/10 p-4 md:p-5 overflow-hidden flex flex-col">
            <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2 shrink-0">
              <Siren size={16} className="text-orange-400 animate-pulse" />
              تغذية حية للنداءات
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl" />
                  ))}
                </div>
              ) : activeRequests.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                  <CheckCircle2 size={32} className="text-emerald-500/50" />
                  <p className="text-sm font-medium">لا توجد نداءات نشطة حالياً</p>
                </div>
              ) : (
                activeRequests.map(req => (
                  <RequestCard key={req.id} request={req as ReliefRequest} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. News Ticker Bottom */}
      <div className="rounded-2xl overflow-hidden shadow-lg border border-red-500/20">
        <NewsTicker alerts={[
          "🔴 تنبيه: رياح قوية متوقعة في ولايات الوسط الشرقي قد تساهم في انتشار النيران. يُرجى توخي الحذر.",
          "🟢 تحديث: وصول قافلة تضامنية من ولاية سطيف إلى بجاية وتغطية 40% من احتياجات منطقة تيشي.",
          "⚠️ إعلان: الأولوية الحالية لتوجيه المولدات الكهربائية وصهاريج المياه إلى القرى المعزولة.",
          "📞 غرفة التنسيق: يُرجى من المتطوعين التأكد من إدخال بيانات حمولة سياراتهم بدقة لضمان التوجيه الآلي السليم."
        ]} />
      </div>

    </div>
  )
}
