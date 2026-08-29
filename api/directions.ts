import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { origin, destination } = req.query

  if (!origin || !destination) {
    return res.status(400).json({ error: 'origin and destination are required' })
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Google Maps API key not configured on server' })
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}&language=ar`
    const response = await fetch(url)
    const data = await response.json()

    // Forward the Google response to our client
    return res.status(200).json(data)
  } catch (error) {
    console.error('Directions proxy error:', error)
    return res.status(500).json({ error: 'Failed to fetch directions' })
  }
}
