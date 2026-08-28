import { useState } from 'react'
import { LocateFixed, HeartHandshake, ChevronRight, ChevronLeft, Plus, Trash2, Car, UserCheck } from 'lucide-react'
import LocationSelector from './LocationSelector'
import CatalogPicker from './CatalogPicker'
import { verifyGpsAgainstWilaya } from '../utils/geo'
import { WILAYAS } from '../data/algeria'
import type { SelectedItem } from '../data/catalog'
import { useAuth } from '../firebase/auth'

export type VolunteerFormState = {
  name: string
  phone: string
  wilayaCode: number
  wilayaName: string
  communeId: string
  communeName: string
  lat?: number
  lng?: number
  vehicles: string[]      // plate numbers
  inventory: SelectedItem[]
  notes: string
}

type Props = {
  onSubmitForm: (data: VolunteerFormState) => void
}

export default function VolunteerForm({ onSubmitForm }: Props) {
  const { user, loginWithGoogle, logout } = useAuth()
  const [step, setStep] = useState<1 | 2>(1)
  const [loadingGps, setLoadingGps] = useState(false)
  const [gpsWarning, setGpsWarning] = useState<string | null>(null)
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [form, setForm] = useState<VolunteerFormState>({
    name: '', phone: '',
    wilayaCode: 0, wilayaName: '', communeId: '', communeName: '',
    vehicles: [], inventory: [], notes: '',
  })

  const getGps = () => {
    if (!navigator.geolocation) return
    setLoadingGps(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        const wilaya = WILAYAS.find(w => w.code === form.wilayaCode)
        const warning = wilaya ? verifyGpsAgainstWilaya(lat, lng, wilaya.center, 200) : null
        setGpsWarning(warning)
        setForm(p => ({ ...p, lat, lng }))
        setLoadingGps(false)
      },
      () => { setLoadingGps(false) },
      { enableHighAccuracy: true }
    )
  }

  const addVehicle = () => {
    const plate = vehiclePlate.trim().toUpperCase()
    if (!plate) return
    setForm(p => ({ ...p, vehicles: [...p.vehicles, plate] }))
    setVehiclePlate('')
  }

  const removeVehicle = (idx: number) => {
    setForm(p => ({ ...p, vehicles: p.vehicles.filter((_, i) => i !== idx) }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    const finalData = { ...form, userId: user.uid }
    onSubmitForm(finalData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl bg-white/5 p-5 shadow-xl ring-1 ring-white/10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-400">
          <HeartHandshake size={22} />
          <h2 className="text-xl font-bold">تسجيل قافلة مساعدات</h2>
        </div>
        <div className="flex gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${step === 1 ? 'bg-emerald-500' : 'bg-slate-600'}`} />
          <span className={`w-2.5 h-2.5 rounded-full ${step === 2 ? 'bg-emerald-500' : 'bg-slate-600'}`} />
        </div>
      </div>

      <div className="h-1 rounded-full bg-slate-800">
        <div className={`h-1 rounded-full bg-emerald-500 transition-all ${step === 1 ? 'w-1/2' : 'w-full'}`} />
      </div>

      {/* ── STEP 1: Identity + Location ── */}
      {step === 1 && (
        <div className="space-y-4">
          {!user ? (
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-600/10 border border-emerald-600/30 px-4 py-3">
              <UserCheck size={20} className="text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-300">التوثيق مطلوب</p>
                <p className="text-xs text-slate-400">سيتم ربط حساب Google لضمان موثوقية بياناتك وتتبع مساهمتك.</p>
              </div>
              <button type="button" onClick={loginWithGoogle} className="mr-auto shrink-0 bg-emerald-600 hover:bg-emerald-500 transition text-white text-xs font-bold px-3 py-2 rounded-xl">
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
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-emerald-500"
            placeholder="الاسم / اسم الجمعية / القافلة"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          />

          <input
            required
            type="tel"
            dir="ltr"
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-emerald-500 text-right"
            placeholder="رقم الهاتف للتواصل"
            value={form.phone}
            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
          />

          {/* Vehicle Registration */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Car size={16} />
              أرقام تسجيل المركبات (اختياري — للتعرف الميداني)
            </label>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-2.5 outline-none focus:border-emerald-500 text-sm font-mono tracking-wider"
                placeholder="مثال: 123-456-16"
                dir="ltr"
                value={vehiclePlate}
                onChange={e => setVehiclePlate(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addVehicle())}
              />
              <button
                type="button"
                onClick={addVehicle}
                className="rounded-2xl bg-slate-700 hover:bg-emerald-700 px-4 py-2.5 transition"
              >
                <Plus size={18} />
              </button>
            </div>
            {form.vehicles.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {form.vehicles.map((plate, idx) => (
                  <div key={idx} className="flex items-center gap-1 bg-emerald-900/40 border border-emerald-700/40 rounded-xl px-3 py-1 text-sm font-mono">
                    <Car size={13} className="text-emerald-400" />
                    <span dir="ltr" className="text-emerald-300">{plate}</span>
                    <button type="button" onClick={() => removeVehicle(idx)}>
                      <Trash2 size={13} className="text-red-400 hover:text-red-300 mr-1" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <LocationSelector
            label="ولاية وبلدية الانطلاق (للتوثيق)"
            required={false}
            onLocationChange={loc => setForm(p => ({ ...p, ...loc }))}
          />

          {/* GPS */}
          <button
            type="button"
            onClick={getGps}
            disabled={loadingGps}
            className={`w-full flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold text-white transition
              ${form.lat ? 'bg-emerald-700 hover:bg-emerald-600' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            <LocateFixed size={18} className={loadingGps ? 'animate-pulse' : ''} />
            {loadingGps ? 'جارٍ التحديد...' : form.lat ? `✓ موقع الانطلاق محدد (${form.lat!.toFixed(4)}, ${form.lng!.toFixed(4)})` : 'تحديد موقع الانطلاق (GPS) — إلزامي'}
          </button>
          {gpsWarning && <p className="text-xs text-yellow-300">{gpsWarning}</p>}

          <button
            type="button"
            disabled={!form.lat || !user}
            onClick={() => setStep(2)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            التالي: جرد المساعدات
            <ChevronLeft size={18} />
          </button>
        </div>
      )}

      {/* ── STEP 2: Inventory ── */}
      {step === 2 && (
        <div className="space-y-4">
          <CatalogPicker
            mode="inventory"
            onChange={items => setForm(p => ({ ...p, inventory: items }))}
          />

          <textarea
            rows={2}
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-emerald-500 resize-none text-sm"
            placeholder="ملاحظات إضافية عن القافلة (عدد الأشخاص، نوع السيارات...)"
            value={form.notes}
            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-2 rounded-2xl bg-slate-700 px-4 py-3 font-semibold text-slate-200 hover:bg-slate-600 transition"
            >
              <ChevronRight size={18} /> رجوع
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 transition"
            >
              <HeartHandshake size={18} />
              تسجيل القافلة والانطلاق
            </button>
          </div>
        </div>
      )}
    </form>
  )
}
