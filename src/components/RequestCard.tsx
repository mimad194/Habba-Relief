import type { ReliefRequest } from '../data/mockData'

const severityClasses = {
 حرج: 'border-red-500/40 bg-red-500/10 text-red-200',
 عالي: 'border-orange-500/40 bg-orange-500/10 text-orange-200',
 متوسط: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-200',
} as const

export default function RequestCard({ request }: { request: any }) {
  // Format Firestore timestamp if it exists, otherwise fallback
  const timeStr = request.createdAt?.toDate 
    ? request.createdAt.toDate().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })
    : request.timestamp 
      ? new Date(request.timestamp).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })
      : 'غير معروف'

  return (
    <article className="rounded-3xl border border-white/10 bg-slate-800/40 p-4 shadow-lg hover:bg-slate-800/60 transition">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-base font-bold text-white">{request.name || 'فاعل خير'}</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">
            {request.wilayaName || ''} - {request.communeName || ''}
          </p>
        </div>
        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${severityClasses[request.severity as keyof typeof severityClasses] || severityClasses['متوسط']}`}>
          {request.severity || 'متوسط'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-300 bg-black/20 p-3 rounded-2xl">
        <p><span className="text-slate-500">الاحتياج:</span> {request.needType}</p>
        <p><span className="text-slate-500">الهاتف:</span> <span dir="ltr">{request.phone}</span></p>
        <p><span className="text-slate-500">التوقيت:</span> {timeStr}</p>
      </div>

      {request.items && request.items.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {request.items.slice(0, 3).map((item: any) => (
            <span key={item.itemId} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-slate-300">
              {item.qty} × {item.itemId}
            </span>
          ))}
          {request.items.length > 3 && (
            <span className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-slate-400">
              +{request.items.length - 3} أصناف أخرى
            </span>
          )}
        </div>
      )}
    </article>
  )
}
