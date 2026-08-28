/**
 * Haversine formula — returns distance in kilometers between two GPS coords.
 */
export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Verifies that the user's GPS is within `thresholdKm` of the wilaya center.
 * Returns null if OK, or a warning message string if suspicious.
 */
export function verifyGpsAgainstWilaya(
  userLat: number,
  userLng: number,
  wilayaCenter: { lat: number; lng: number },
  thresholdKm = 120
): string | null {
  const dist = haversineKm(userLat, userLng, wilayaCenter.lat, wilayaCenter.lng)
  if (dist > thresholdKm) {
    return `⚠️ موقعك الجغرافي يبعد ${Math.round(dist)} كم عن مركز الولاية المختارة. يرجى التأكد من صحة المعلومات. قد يؤدي ذلك إلى رفض الطلب.`
  }
  return null
}
