import { useState } from 'react'
import { LocateFixed, Send, UserCheck, ChevronRight, ChevronLeft, AlertTriangle } from 'lucide-react'
import LocationSelector from './LocationSelector'
import CatalogPicker from './CatalogPicker'
import { verifyGpsAgainstWilaya } from '../utils/geo'
import { computeSeverity } from '../utils/severityEngine'
import { mockRequests } from '../data/mockData'
import { WILAYAS } from '../data/algeria'
import type { SelectedItem } from '../data/catalog'
import type { NeedType } from '../data/mockData'
import { useAuth } from '../firebase/auth'

import { submitReliefRequest } from '../firebase/firestore'

type StepOneData = {
  name: string
  phone: string
  wilayaCode: number
  wilayaName: string
  communeId: string
  communeName: string
  lat?: number
  lng?: number
  gpsWarning?: string
}

type StepTwoData = {
  needType: NeedType
  items: SelectedItem[]
  description: string
}

export default function RequestForm() {
  const { user, loginWithGoogle, logout } = useAuth()
  const [step, setStep] = useState<1 | 2>(1)
  const [loadingGps, setLoadingGps] = useState(false)
  const [gpsWarning, setGpsWarning] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const [step1, setStep1] = useState<Partial<StepOneData>>({
    name: '', phone: '',
    wilayaCode: 0, wilayaName: '', communeId: '', communeName: '',
  })
  const [step2, setStep2] = useState<Partial<StepTwoData>>({
    needType: 'طبي', items: [], description: '',
  })

  const getGps = () => {
    if (!navigator.geolocation) {
      setGpsWarning('المتصفح لا يدعم GPS.')
      return
    }
    setLoadingGps(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        const wilaya = WILAYAS.find(w => w.code === step1.wilayaCode)
        const warning = wilaya
          ? verifyGpsAgainstWilaya(lat, lng, wilaya.center)
          : null
        setGpsWarning(warning)
        setStep1(prev => ({ ...prev, lat, lng, gpsWarning: warning ?? undefined }))
        setLoadingGps(false)
      },
      () => {
        setGpsWarning('تعذّر تحديد الموقع. تأكد من تفعيل خدمة GPS ومنح الإذن.')
        setLoadingGps(false)
      },
      { enableHighAccuracy: true }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!step1.lat || !step1.lng || !user) return

    // Auto-compute severity
    const severity = computeSeverity(
      step1.lat, step1.lng,
      step2.needType ?? 'طبي',
      mockRequests
    )

    const finalRequest = {
      ...step1,
      ...step2,
      severity,
      userId: user.uid,
    }
    
    console.log('FINAL REQUEST TO FIREBASE:', finalRequest)
    
    // Fire and forget (Offline-first approach)
    // Firebase local cache will save it instantly, and sync when internet is available.
    // We don't await because if offline, the promise hangs until online.
    submitReliefRequest(finalRequest).catch(console.error)
    
    // Instantly show success UI
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="rounded-3xl bg-emerald-500/10 border border-emerald-500/30 p-8 text-center space-y-3">
        <div className="text-5xl">✅</div>
        <h2 className="text-xl font-bold text-emerald-400">تم استلام طلبك بنجاح</h2>
        <p className="text-slate-400 text-sm">
          سيتم تحليل طلبك آلياً وتوجيه المساعدات إليك حسب الأولوية الميدانية.
          تأكد من إبقاء هاتفك متاحاً على الرقم المُدخل.
        </p>
        <button
          onClick={() => { setSubmitted(false); setStep(1) }}
          className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition"
        >
          إرسال طلب آخر
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl bg-white/5 p-5 shadow-xl ring-1 ring-white/10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-red-400">تسجيل احتياج إغاثي</h2>
          <p className="text-xs text-slate-400 mt-1">الخطوة {step} من 2</p>
        </div>
        {/* Step dots */}
        <div className="flex gap-2">
          <span className={`w-2.5 h-2.5 rounded-full transition-colors ${step === 1 ? 'bg-red-500' : 'bg-emerald-500'}`} />
          <span className={`w-2.5 h-2.5 rounded-full transition-colors ${step === 2 ? 'bg-red-500' : 'bg-slate-600'}`} />
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full bg-slate-800">
        <div className={`h-1 rounded-full bg-red-500 transition-all ${step === 1 ? 'w-1/2' : 'w-full'}`} />
      </div>

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Google Sign-In Banner */}
          {!user ? (
            <div className="flex items-center gap-3 rounded-2xl bg-blue-600/10 border border-blue-600/30 px-4 py-3">
              <UserCheck size={20} className="text-blue-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-300">التوثيق مطلوب</p>
                <p className="text-xs text-slate-400">سيتم ربط حساب Google لضمان موثوقية البلاغ ومنع الإساءة.</p>
              </div>
              <button type="button" onClick={loginWithGoogle} className="mr-auto shrink-0 bg-blue-600 hover:bg-blue-500 transition text-white text-xs font-bold px-3 py-2 rounded-xl">
                تسجيل الدخول
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-2xl bg-emerald-600/10 border border-emerald-600/30 px-4 py-3">
              <div className="flex items-center gap-3">
                <img src={user.photoURL || ''} alt="User avatar" className="w-8 h-8 rounded-full" />
                <div>
                  <p className="text-sm font-semibold text-emerald-300">{user.displayName}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              </div>
              <button type="button" onClick={logout} className="text-xs text-slate-400 hover:text-white transition">
                تسجيل الخروج
              </button>
            </div>
          )}

          <input
            required
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-red-500"
            placeholder="الاسم الكامل أو اسم الجهة المبلِّغة"
            value={step1.name}
            onChange={e => setStep1(p => ({ ...p, name: e.target.value }))}
          />

          <input
            required
            type="tel"
            dir="ltr"
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-red-500 text-right"
            placeholder="رقم الهاتف للتواصل الميداني"
            value={step1.phone}
            onChange={e => setStep1(p => ({ ...p, phone: e.target.value }))}
          />

          <LocationSelector
            label="الموقع الإداري (الولاية والبلدية)"
            onLocationChange={loc => setStep1(p => ({ ...p, ...loc }))}
          />

          {/* GPS Button */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={getGps}
              disabled={loadingGps}
              className={`w-full flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold text-white transition
                ${step1.lat ? 'bg-emerald-700 hover:bg-emerald-600' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
              <LocateFixed size={18} className={loadingGps ? 'animate-pulse' : ''} />
              {loadingGps ? 'جارٍ تحديد الموقع...' : step1.lat ? `✓ تم تحديد موقعك (${step1.lat!.toFixed(4)}, ${step1.lng!.toFixed(4)})` : 'تحديد موقعي (GPS) — إلزامي'}
            </button>

            {gpsWarning && (
              <div className="flex items-start gap-2 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 px-4 py-3 text-sm text-yellow-300">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                {gpsWarning}
              </div>
            )}
            {step1.lat && !gpsWarning && (
              <p className="text-xs text-emerald-400 text-center">✓ الموقع ضمن نطاق الولاية المختارة</p>
            )}
          </div>

          <button
            type="button"
            disabled={!step1.lat || !step1.wilayaCode || !step1.communeId || !user}
            onClick={() => setStep(2)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            التالي: تفاصيل الاحتياج
            <ChevronLeft size={18} />
          </button>
        </div>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">نوع الاحتياج الرئيسي</label>
            <select
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-red-500"
              value={step2.needType}
              onChange={e => setStep2(p => ({ ...p, needType: e.target.value as NeedType }))}
            >
              <option value="طبي">🏥 مساعدة طبية</option>
              <option value="معدات/إطفاء">🔥 معدات أو دعم إطفاء</option>
              <option value="إجلاء">🚨 إجلاء من الخطر</option>
            </select>
          </div>

          <CatalogPicker
            mode="request"
            onChange={items => setStep2(p => ({ ...p, items }))}
          />

          <div>
            <label className="block text-xs text-slate-400 mb-1">ملاحظات أو وصف إضافي (اختياري)</label>
            <textarea
              rows={3}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-red-500 resize-none"
              placeholder="مثال: عائلة من 7 أفراد، الوصول من الطريق الفلاني..."
              value={step2.description}
              onChange={e => setStep2(p => ({ ...p, description: e.target.value }))}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-2 rounded-2xl bg-slate-700 px-4 py-3 font-semibold text-slate-200 hover:bg-slate-600 transition"
            >
              <ChevronRight size={18} />
              رجوع
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-500 shadow-lg shadow-red-900/20 transition"
            >
              <Send size={18} />
              إرسال طلب الإغاثة
            </button>
          </div>
        </div>
      )}
    </form>
  )
}
