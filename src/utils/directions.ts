export type RouteData = {
  path: [number, number][]
  distanceKm: string
  durationStr: string
}

/**
 * Decodes a Google-format encoded polyline string into [lat, lng] coordinates.
 * OSRM returns polylines in the same encoded format.
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
    lat += ((result & 1) ? ~(result >> 1) : (result >> 1))

    shift = 0; result = 0
    do {
      b = encoded.charAt(index++).charCodeAt(0) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    lng += ((result & 1) ? ~(result >> 1) : (result >> 1))

    poly.push([lat / 1e5, lng / 1e5])
  }
  return poly
}

function formatDuration(seconds: number): string {
  if (seconds < 3600) {
    return `${Math.round(seconds / 60)} دقيقة`
  }
  const h = Math.floor(seconds / 3600)
  const m = Math.round((seconds % 3600) / 60)
  return `${h} ساعة ${m > 0 ? `و ${m} دقيقة` : ''}`
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} م`
  return `${(meters / 1000).toFixed(1)} كم`
}

/**
 * Fetches real driving directions using OSRM (Open Source Routing Machine).
 * 100% free, no API key required, powered by OpenStreetMap.
 * Great coverage of Algeria and North Africa.
 */
export async function getDirections(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<RouteData | null> {
  // OSRM public demo server — for production, consider self-hosting
  const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=polyline`

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`OSRM HTTP error: ${res.status}`)
    
    const data = await res.json()

    if (data.code === 'Ok' && data.routes.length > 0) {
      const route = data.routes[0]
      const path = decodePolyline(route.geometry)

      return {
        path,
        distanceKm: formatDistance(route.distance),
        durationStr: formatDuration(route.duration),
      }
    } else {
      console.error('OSRM error:', data.code, data.message)
      return null
    }
  } catch (error) {
    console.error('Failed to fetch directions from OSRM:', error)
    return null
  }
}
