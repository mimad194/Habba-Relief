export type RouteData = {
  path: [number, number][]
  distanceKm: string
  durationStr: string
}

/**
 * Decodes a Google Maps API polyline string into an array of [lat, lng] coordinates
 */
function decodePolyline(encoded: string): [number, number][] {
  const poly: [number, number][] = []
  let index = 0, len = encoded.length
  let lat = 0, lng = 0

  while (index < len) {
    let b, shift = 0, result = 0
    do {
      b = encoded.charAt(index++).charCodeAt(0) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1))
    lat += dlat

    shift = 0
    result = 0
    do {
      b = encoded.charAt(index++).charCodeAt(0) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1))
    lng += dlng

    poly.push([lat / 1e5, lng / 1e5])
  }
  return poly
}

/**
 * Fetches the directions between origin and destination using Google Maps Directions API.
 * 
 * Note: When doing this entirely on the client, you might hit CORS issues with maps.googleapis.com
 * unless you use the newer Routes API or a proxy. For this MVP, we will try the basic Directions API.
 * If CORS is an issue, we will need to route it through a serverless function (Vercel API) or use Leaflet-Routing-Machine.
 */
export async function getDirections(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<RouteData | null> {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    console.error('Google Maps API Key is missing in .env')
    return null
  }

  // Use a CORS proxy or Vercel serverless function in production.
  // We use the basic endpoint here, but CORS might block it in browser.
  // A better approach for client-side is often using a proxy or standard Leaflet router.
  const url = `https://corsproxy.io/?` + encodeURIComponent(`https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=${apiKey}&language=ar`)

  try {
    const res = await fetch(url)
    const data = await res.json()

    if (data.status === 'OK' && data.routes.length > 0) {
      const route = data.routes[0]
      const leg = route.legs[0]
      
      const path = decodePolyline(route.overview_polyline.points)
      
      return {
        path,
        distanceKm: leg.distance.text, // e.g. "45 km"
        durationStr: leg.duration.text // e.g. "40 mins"
      }
    } else {
      console.error('Directions API error:', data.status, data.error_message)
      return null
    }
  } catch (error) {
    console.error('Failed to fetch directions:', error)
    return null
  }
}
