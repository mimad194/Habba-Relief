type Props = {
 value: 'map' | 'list'
 onChange: (value: 'map' | 'list') => void
}

export default function MobileTabs({ value, onChange }: Props) {
 return (
 <div className="grid grid-cols-2 rounded-2xl bg-white/5 p-1 ring-1 ring-white/10 md:hidden">
 <button
 onClick={() => onChange('map')}
 className={`rounded-xl px-4 py-3 text-sm font-semibold ${
 value === 'map' ? 'bg-cyan-600 text-white' : 'text-slate-300'
 }`}
 >
 الخريطة
 </button>
 <button
 onClick={() => onChange('list')}
 className={`rounded-xl px-4 py-3 text-sm font-semibold ${
 value === 'list' ? 'bg-cyan-600 text-white' : 'text-slate-300'
 }`}
 >
 الطلبات
 </button>
 </div>
 )
}
