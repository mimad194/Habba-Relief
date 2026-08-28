import rawWilayas from 'geoalgeria/data/wilayas.json'

export type Commune = {
  id: string
  name: string
  nameFr: string
  postalCode: string
  lat?: number
  lng?: number
}

export type Wilaya = {
  code: number
  name: string
  nameFr: string
  center: { lat: number; lng: number }
  communesCount: number
}

const rawWilayaList: any[] = (rawWilayas as any).wilayas

export const WILAYAS: Wilaya[] = rawWilayaList.map((w: any) => ({
  code: w.code,
  name: w.name_ar,
  nameFr: w.name_fr,
  // Approximate centers for now, could be refined
  center: { lat: 36.0, lng: 3.0 },
  communesCount: w.communes_count ?? 0,
}))

export function getWilaya(code: number): Wilaya | undefined {
  return WILAYAS.find(w => w.code === code)
}

// In-memory cache to prevent re-fetching
const communeCache = new Map<number, Commune[]>()

export async function getCommunes(wilayaCode: number): Promise<Commune[]> {
  if (communeCache.has(wilayaCode)) {
    return communeCache.get(wilayaCode)!
  }

  let rawCommunes: any[] = []

  try {
    if (wilayaCode <= 23) {
      const mod = await import('geoalgeria/data/communes_w1_w23.json')
      rawCommunes = (mod.default || mod) as any[]
    } else if (wilayaCode <= 48) {
      const mod = await import('geoalgeria/data/communes_w24_w48.json')
      rawCommunes = (mod.default || mod) as any[]
    } else {
      const mod = await import('geoalgeria/data/communes_w49_w69.json')
      rawCommunes = (mod.default || mod) as any[]
    }
  } catch (error) {
    console.error("Failed to load communes", error)
  }

  // Filter out just the ones for this wilaya
  const filtered = rawCommunes.filter(c => Number(c.wilaya_code) === wilayaCode)
  let parsed = filtered.map(c => ({
    id: String(c.code_commune),
    name: c.name_ar ?? c.name_fr,
    nameFr: c.name_fr ?? '',
    postalCode: c.postal_code ?? '',
    lat: c.latitude ? Number(c.latitude) : undefined,
    lng: c.longitude ? Number(c.longitude) : undefined,
  }))

  // Fallback for new wilayas if not in JSON (geoalgeria embeds them in wilayas.json)
  if (parsed.length === 0) {
    const w = rawWilayaList.find(x => x.code === wilayaCode)
    if (w && Array.isArray(w.communes)) {
      parsed = w.communes.map((c: any, idx: number) => ({
        id: `${w.code}${String(idx + 1).padStart(3, '0')}`,
        name: c.name_ar ?? c.name_fr,
        nameFr: c.name_fr ?? '',
        postalCode: '',
      }))
    }
  }

  communeCache.set(wilayaCode, parsed)
  return parsed
}
