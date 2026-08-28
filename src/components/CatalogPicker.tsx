import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react'
import { RELIEF_CATALOG, type SelectedItem } from '../data/catalog'

type Props = {
  onChange: (items: SelectedItem[]) => void
  mode?: 'request' | 'inventory' // request = needs, inventory = what volunteer brings
}

export default function CatalogPicker({ onChange, mode = 'request' }: Props) {
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Record<string, number>>({}) // itemId → qty
  const [customItems, setCustomItems] = useState<string>('')

  const toggle = (categoryId: string) => {
    setOpenCategoryId(prev => prev === categoryId ? null : categoryId)
  }

  const adjust = (itemId: string, delta: number, defaultQty: number) => {
    setSelected(prev => {
      const current = prev[itemId] ?? 0
      const next = Math.max(0, current + delta)
      const updated = { ...prev }
      if (next === 0) delete updated[itemId]
      else updated[itemId] = next
      emitChange(updated)
      return updated
    })
  }

  const emitChange = (sel: Record<string, number>) => {
    const items: SelectedItem[] = Object.entries(sel).map(([itemId, qty]) => ({ itemId, qty }))
    if (customItems.trim()) {
      items.push({ itemId: 'custom', qty: 1, customLabel: customItems.trim() })
    }
    onChange(items)
  }

  const totalSelectedCount = Object.keys(selected).length

  const labelText = mode === 'request'
    ? 'حدد الاحتياجات العينية المطلوبة'
    : 'جرد المساعدات المُحضَرة (Inventory)'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-300">{labelText}</label>
        {totalSelectedCount > 0 && (
          <span className="text-xs bg-emerald-600/30 text-emerald-300 px-2 py-1 rounded-full border border-emerald-600/40">
            {totalSelectedCount} صنف محدد
          </span>
        )}
      </div>

      <div className="space-y-2">
        {RELIEF_CATALOG.map(category => {
          const isOpen = openCategoryId === category.id
          const categorySelected = category.items.filter(i => selected[i.id]).length

          return (
            <div key={category.id} className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden">
              {/* Category Header */}
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 text-right hover:bg-white/5 transition-colors"
                onClick={() => toggle(category.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{category.emoji}</span>
                  <span className="font-semibold text-sm text-slate-200">{category.label}</span>
                  {categorySelected > 0 && (
                    <span className="text-xs bg-emerald-600/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-600/40">
                      ✓ {categorySelected}
                    </span>
                  )}
                </div>
                {isOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>

              {/* Items list */}
              {isOpen && (
                <div className="border-t border-white/10 divide-y divide-white/5">
                  {category.items.map(item => {
                    const qty = selected[item.id] ?? 0
                    return (
                      <div key={item.id} className="flex items-center justify-between px-4 py-3 gap-2">
                        <span className="text-sm text-slate-300 flex-1">{item.label}</span>
                        <span className="text-xs text-slate-500 w-16 text-center">{item.unit}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => adjust(item.id, -item.defaultQty, item.defaultQty)}
                            className="w-7 h-7 rounded-full bg-slate-700 hover:bg-red-700 flex items-center justify-center transition-colors disabled:opacity-30"
                            disabled={qty === 0}
                          >
                            <Minus size={14} />
                          </button>
                          <span className={`w-10 text-center text-sm font-bold ${qty > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {qty === 0 ? '—' : qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => adjust(item.id, item.defaultQty, item.defaultQty)}
                            className="w-7 h-7 rounded-full bg-slate-700 hover:bg-emerald-700 flex items-center justify-center transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* Free text for unlisted items */}
        <div className="rounded-2xl border border-dashed border-white/20 bg-slate-900/40 p-3">
          <label className="block text-xs text-slate-400 mb-2">➕ احتياجات أخرى غير مدرجة في القائمة</label>
          <textarea
            rows={2}
            className="w-full bg-transparent text-sm text-slate-200 outline-none resize-none placeholder:text-slate-600"
            placeholder="صف بإيجاز المواد الأخرى التي تحتاجها..."
            value={customItems}
            onChange={e => {
              setCustomItems(e.target.value)
              emitChange(selected)
            }}
          />
        </div>
      </div>
    </div>
  )
}
