import { useState, useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Navigation, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import type { ReliefRequest } from '../data/mockData'
import { getDirections, type RouteData } from '../utils/directions'

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

// Component to dynamically fit the map bounds to the route
function MapBoundsFitter({ path }: { path: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (path.length > 0) {
      map.fitBounds(L.latLngBounds(path), { padding: [20, 20] })
    }
  }, [map, path])
  return null
}

type Props = {
  volunteerData: { lat: number; lng: number; name: string }
  mission: ReliefRequest
  onAccept: () => void
}

export default function MissionAssignment({ volunteerData, mission, onAccept }: Props) {
  const [routeData, setRouteData] = useState<RouteData | null>(null)
  const [loadingRoute, setLoadingRoute] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoadingRoute(true)
    
    getDirections(
      { lat: volunteerData.lat, lng: volunteerData.lng },
      { lat: mission.lat, lng: mission.lng }
    ).then(data => {
      if (isMounted) {
        setRouteData(data)
        setLoadingRoute(false)
      }
    })

    return () => { isMounted = false }
  }, [volunteerData.lat, volunteerData.lng, mission.lat, mission.lng])

  // Fallback to straight line if API fails
  const fallbackPath: [number, number][] = [
    [volunteerData.lat, volunteerData.lng],
    [mission.lat, mission.lng]
  ]

  const displayPath = routeData?.path || fallbackPath

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
          بناءً على موقعك ومواردك، تم توجيهك لأكثر نقطة احتياجاً لضمان عدم تكدس المساعدات.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <AlertTriangle className="text-red-500" size={18} />
          تفاصيل نداء الاستغاثة
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="bg-slate-900/50 p-3 rounded-2xl">
            <p className="text-slate-400 text-xs mb-1">الجهة المتضررة</p>
            <p className="font-semibold">{mission.name}</p>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-2xl">
            <p className="text-slate-400 text-xs mb-1">الوجهة (الموقع)</p>
            <p className="font-semibold">{mission.locationDescription}</p>
          </div>
          
          <div className="bg-slate-900/50 p-3 rounded-2xl">
            <p className="text-slate-400 text-xs mb-1">المسافة الفعلية للمسار</p>
            {loadingRoute ? (
              <p className="font-semibold flex items-center gap-2 text-slate-500"><Loader2 size={14} className="animate-spin" /> جاري الحساب...</p>
            ) : (
              <p className="font-semibold text-emerald-400">{routeData ? routeData.distanceKm : 'غير متاح'}</p>
            )}
          </div>
          <div className="bg-slate-900/50 p-3 rounded-2xl border border-orange-500/20">
            <p className="text-slate-400 text-xs mb-1">الزمن المتوقع (ETA)</p>
            {loadingRoute ? (
              <p className="font-semibold flex items-center gap-2 text-slate-500"><Loader2 size={14} className="animate-spin" /> جاري الحساب...</p>
            ) : (
              <p className="font-semibold text-orange-400">{routeData ? routeData.durationStr : 'غير متاح'}</p>
            )}
          </div>
        </div>

        <div className="h-[250px] w-full rounded-2xl overflow-hidden mb-4 border border-white/10 relative z-0">
          <MapContainer 
            bounds={L.latLngBounds(fallbackPath)} 
            scrollWheelZoom={false} 
            className="h-full w-full"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            <Marker position={[volunteerData.lat, volunteerData.lng]} icon={iconVolunteer}>
              <Popup>نقطة انطلاقك (القافلة)</Popup>
            </Marker>
            
            <Marker position={[mission.lat, mission.lng]} icon={iconVictim}>
              <Popup>{mission.name}</Popup>
            </Marker>

            {!loadingRoute && <Polyline positions={displayPath} color="#10b981" weight={5} opacity={0.8} />}
            {!loadingRoute && <MapBoundsFitter path={displayPath} />}
          </MapContainer>
        </div>

        <button
          onClick={onAccept}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-4 font-bold text-white transition hover:bg-emerald-500 shadow-lg shadow-emerald-900/20"
        >
          <Navigation size={20} />
          قبول المهمة وبدء التوجيه للإنقاذ
        </button>
      </div>
    </div>
  )
}
