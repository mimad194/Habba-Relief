import { AlertTriangle, Info, Wind } from 'lucide-react'

export default function NewsTicker() {
 return (
 <div className="bg-red-500/10 border-y border-red-500/20 overflow-hidden relative flex items-center h-10 w-full">
 <div className="absolute left-0 z-10 h-full w-12 bg-gradient-to-r from-slate-950 to-transparent"></div>
 <div className="absolute right-0 z-10 h-full w-12 bg-gradient-to-l from-slate-950 to-transparent"></div>
 
 <div className="flex whitespace-nowrap animate-marquee items-center gap-12 text-sm font-medium">
 <span className="flex items-center gap-2 text-red-400">
 <AlertTriangle size={16} /> عاجل: الطريق الوطني رقم 43 مقطوع مؤقتاً بسبب الدخان الكثيف، يرجى من القوافل استخدام الطرق البديلة.
 </span>
 <span className="flex items-center gap-2 text-cyan-400">
 <Info size={16} /> الحماية المدنية: تمت السيطرة على 70% من بؤر الحرائق في زيامة منصورية.
 </span>
 <span className="flex items-center gap-2 text-yellow-400">
 <Wind size={16} /> نشرية جوية: رياح قوية متوقعة مساء اليوم قد تساهم في امتداد ألسنة اللهب، نرجو الحذر.
 </span>
 <span className="flex items-center gap-2 text-emerald-400">
 <Info size={16} /> توجيهات: نرجو من المواطنين عدم التوجه العشوائي لمناطق الحرائق وترك المجال لآليات الإطفاء وتوجيهات التطبيق.
 </span>
 </div>
 </div>
 )
}
