import { useState, useEffect } from 'react'
import { WILAYAS, getCommunes } from '../data/algeria'
import type { Commune } from '../data/algeria'

type Props = {
  onLocationChange: (location: { wilayaCode: number, wilayaName: string, communeId: string, communeName: string }) => void
  label?: string
  required?: boolean
}

export default function LocationSelector({ onLocationChange, label = "الموقع الجغرافي", required = true }: Props) {
  const [selectedWilaya, setSelectedWilaya] = useState<number>(0)
  const [selectedCommune, setSelectedCommune] = useState<string>('')
  
  const [communes, setCommunes] = useState<Commune[]>([])
  const [loadingCommunes, setLoadingCommunes] = useState(false)

  // Fetch communes dynamically when wilaya changes
  useEffect(() => {
    if (selectedWilaya === 0) {
      setCommunes([])
      setSelectedCommune('')
      return
    }

    let isMounted = true
    setLoadingCommunes(true)
    
    getCommunes(selectedWilaya).then(data => {
      if (isMounted) {
        setCommunes(data)
        setLoadingCommunes(false)
      }
    })

    return () => { isMounted = false }
  }, [selectedWilaya])

  const handleWilayaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = Number(e.target.value)
    setSelectedWilaya(code)
    setSelectedCommune('')
    
    if (code > 0) {
      const w = WILAYAS.find(x => x.code === code)
      onLocationChange({
        wilayaCode: code,
        wilayaName: w?.name ?? '',
        communeId: '',
        communeName: ''
      })
    }
  }

  const handleCommuneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value
    setSelectedCommune(cid)
    if (cid && selectedWilaya > 0) {
      const w = WILAYAS.find(x => x.code === selectedWilaya)
      const c = communes.find(x => x.id === cid)
      onLocationChange({
        wilayaCode: selectedWilaya,
        wilayaName: w?.name ?? '',
        communeId: cid,
        communeName: c?.name ?? ''
      })
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-300">{label}</label>
      <div className="grid grid-cols-2 gap-3">
        <select
          required={required}
          value={selectedWilaya}
          onChange={handleWilayaChange}
          className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-red-500 appearance-none text-slate-100"
        >
          <option value={0} disabled>اختر الولاية...</option>
          {WILAYAS.map(w => (
            <option key={w.code} value={w.code}>
              {w.code} - {w.name}
            </option>
          ))}
        </select>

        <select
          required={required}
          value={selectedCommune}
          onChange={handleCommuneChange}
          disabled={selectedWilaya === 0 || loadingCommunes}
          className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-red-500 appearance-none disabled:opacity-50 text-slate-100"
        >
          <option value="" disabled>
            {loadingCommunes ? 'جاري التحميل...' : 'اختر البلدية...'}
          </option>
          {communes.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
