export type RouteData = {
  path: [number, number][]
  distanceKm: string
  durationStr: string
}

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

/**
 * Fetches real driving directions via our Vercel serverless proxy (/api/directions).
 * The proxy calls Google Maps Directions API server-side:
 *   - No CORS issues
 *   - API key stays hidden on the server
 *   - Works on slow mobile networks (single lightweight request)
 */
export async function getDirections(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<RouteData | null> {
  try {
    const url = `/api/directions?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 12000) // 12s timeout

    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)

    if (!res.ok) throw new Error(`Proxy HTTP error: ${res.status}`)

    const data = await res.json()

    if (data.status === 'OK' && data.routes?.length > 0) {
      const route = data.routes[0]
      const leg = route.legs[0]
      const path = decodePolyline(route.overview_polyline.points)

      return {
        path,
        distanceKm: leg.distance.text,
        durationStr: leg.duration.text,
      }
    } else {
      console.warn('Directions API returned:', data.status)
      return null
    }
  } catch (error) {
    console.error('Directions fetch failed:', error)
    return null
  }
}
