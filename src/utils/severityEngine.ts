/**
 * Severity Engine — Automatic severity calculation.
 *
 * The user (reporter) never sets severity.
 * The platform infers it automatically based on:
 *   1. Frequency of requests in the same geographic cluster (500m radius)
 *   2. Time decay: recent requests weight more heavily
 *   3. Type of need: medical > evacuation > materials
 *
 * This simulates what Firebase Cloud Functions will compute server-side
 * when integrated. For now it runs client-side on mock data.
 */

import { haversineKm } from './geo'
import type { ReliefRequest, Severity } from '../data/mockData'

// Weight map per need type
const NEED_WEIGHT: Record<string, number> = {
  'طبي': 3,
  'إجلاء': 2,
  'معدات/إطفاء': 1.5,
}

const CLUSTER_RADIUS_KM = 0.5 // 500 metres = same incident cluster
const TIME_DECAY_HOURS = 6    // Requests older than 6h lose weight

/**
 * Compute a severity score for a new request at (lat, lng) given existing requests.
 * Returns 'حرج' | 'عالي' | 'متوسط'
 */
export function computeSeverity(
  newLat: number,
  newLng: number,
  newNeedType: string,
  existingRequests: ReliefRequest[]
): Severity {
  const now = Date.now()

  // Sum weighted scores from nearby requests
  let score = 0

  for (const req of existingRequests) {
    const dist = haversineKm(newLat, newLng, req.lat, req.lng)
    if (dist > CLUSTER_RADIUS_KM) continue // Not in same cluster

    // Time decay factor: 1.0 = just now, approaches 0 after TIME_DECAY_HOURS
    const ageHours = (now - new Date(req.timestamp).getTime()) / 3_600_000
    const decayFactor = Math.max(0, 1 - ageHours / TIME_DECAY_HOURS)

    // Need weight
    const needWeight = NEED_WEIGHT[req.needType] ?? 1

    score += decayFactor * needWeight
  }

  // Add weight for the incoming request itself
  score += (NEED_WEIGHT[newNeedType] ?? 1)

  // Score thresholds → severity label
  if (score >= 6) return 'حرج'
  if (score >= 3) return 'عالي'
  return 'متوسط'
}

/**
 * Returns a human-readable explanation for transparency (can be shown to admins)
 */
export function severityExplanation(severity: Severity): string {
  switch (severity) {
    case 'حرج':
      return 'تم احتساب مستوى حرج بسبب تكرار النداءات في نفس البقعة خلال فترة زمنية قصيرة أو خطورة نوع الاحتياج.'
    case 'عالي':
      return 'طلبات متعددة أو احتياج بشري مسجّل في هذه المنطقة.'
    case 'متوسط':
      return 'طلب فردي أو مادي في منطقة ذات ضغط منخفض.'
  }
}
