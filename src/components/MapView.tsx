import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import { mockRequests } from '../data/mockData'

const icon = new L.Icon({
 iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
 iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
 shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
 iconSize: [25, 41],
 iconAnchor: [12, 41],
})

export default function MapView() {
 return (
 <div className="h-full min-h-[420px] w-full overflow-hidden rounded-3xl border border-transparent p-0 relative z-0">
 <MapContainer center={[36.75, 5.05]} zoom={8} scrollWheelZoom className="h-full w-full">
 <TileLayer
 attribution="&copy; OpenStreetMap contributors"
 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
 />

 {mockRequests.map((request) => (
 <Marker key={request.id} position={[request.lat, request.lng]} icon={icon}>
 <Popup>
 <div className="text-sm">
 <strong>{request.name}</strong>
 <br />
 {request.needType} - {request.severity}
 <br />
 {request.locationDescription}
 </div>
 </Popup>
 </Marker>
 ))}
 </MapContainer>
 </div>
 )
}
