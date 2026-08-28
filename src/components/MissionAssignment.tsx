import { MapContainer, Marker, Popup, TileLayer, Polyline } from 'react-leaflet'
import L from 'leaflet'
import { Navigation, CheckCircle, AlertTriangle } from 'lucide-react'
import type { ReliefRequest } from '../data/mockData'

const iconVolunteer = new L.Icon({
 iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
 shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
 iconSize: [25, 41],
 iconAnchor: [12, 41],
})

const iconVictim = new L.Icon({
 iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
 shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
 iconSize: [25, 41],
 iconAnchor: [12, 41],
})

type Props = {
 volunteerData: { lat: number; lng: number; name: string }
 mission: ReliefRequest
 onAccept: () => void
}

export default function MissionAssignment({ volunteerData, mission, onAccept }: Props) {
 // Calculate rough distance in km (Haversine formula approximation for UI purposes)
 const R = 6371; // Earth's radius in km
 const dLat = (mission.lat - volunteerData.lat) * Math.PI / 180;
 const dLon = (mission.lng - volunteerData.lng) * Math.PI / 180;
 const a = 
 Math.sin(dLat/2) * Math.sin(dLat/2) +
 Math.cos(volunteerData.lat * Math.PI / 180) * Math.cos(mission.lat * Math.PI / 180) * 
 Math.sin(dLon/2) * Math.sin(dLon/2); 
 const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
 const distance = (R * c).toFixed(1);

 const polylinePositions: [number, number][] = [
 [volunteerData.lat, volunteerData.lng],
 [mission.lat, mission.lng]
 ]

 return (
 <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 shadow-lg relative overflow-hidden">
 <div className="absolute top-0 right-0 p-4 opacity-10">
 <Navigation size={100} />
 </div>
 
 <div className="flex items-center gap-2 text-emerald-400 mb-2">
 <CheckCircle size={20} />
 <h2 className="text-xl font-bold">تم المطابقة بالذكاء الاصطناعي</h2>
 </div>
 <p className="text-sm text-slate-300 relative z-10">
 بناءً على موقعك ونوع الموارد التي تبرعت بها، قام النظام آلياً بتوجيهك لأكثر نقطة احتياجاً لضمان عدم تكدس المساعدات والتوزيع العادل.
 </p>
 </div>

 <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl">
 <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
 <AlertTriangle className="text-red-500" size={18} />
 تفاصيل المهمة الموجهة
 </h3>
 
 <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
 <div className="bg-slate-900/50 p-3 rounded-2xl">
 <p className="text-slate-400 text-xs mb-1">المتضرر / الجهة</p>
 <p className="font-semibold">{mission.name}</p>
 </div>
 <div className="bg-slate-900/50 p-3 rounded-2xl">
 <p className="text-slate-400 text-xs mb-1">الموقع</p>
 <p className="font-semibold">{mission.locationDescription}</p>
 </div>
 <div className="bg-slate-900/50 p-3 rounded-2xl">
 <p className="text-slate-400 text-xs mb-1">الاحتياج المطلوب</p>
 <p className="font-semibold">{mission.needType} ({mission.severity})</p>
 </div>
 <div className="bg-slate-900/50 p-3 rounded-2xl">
 <p className="text-slate-400 text-xs mb-1">المسافة التقديرية</p>
 <p className="font-semibold">{distance} كيلومتر</p>
 </div>
 </div>

 <div className="h-[250px] w-full rounded-2xl overflow-hidden mb-4 border border-white/10 relative z-0">
 <MapContainer 
 bounds={polylinePositions}
 scrollWheelZoom={false} 
 className="h-full w-full"
 >
 <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
 
 <Marker position={[volunteerData.lat, volunteerData.lng]} icon={iconVolunteer}>
 <Popup>نقطة انطلاقك (المتطوع)</Popup>
 </Marker>
 
 <Marker position={[mission.lat, mission.lng]} icon={iconVictim}>
 <Popup>{mission.name} - {mission.locationDescription}</Popup>
 </Marker>

 <Polyline positions={polylinePositions} color="#10b981" weight={4} dashArray="10, 10" />
 </MapContainer>
 </div>

 <button
 onClick={onAccept}
 className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-4 font-bold text-white transition hover:bg-emerald-500 shadow-lg shadow-emerald-900/20"
 >
 <Navigation size={20} />
 قبول المهمة وبدء التوجيه (GPS)
 </button>
 </div>
 </div>
 )
}
