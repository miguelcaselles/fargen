// Vercel serverless function: shared dish-vote storage for enbable.
// Primary: Upstash Redis (atomic per-person writes). Fallback: none needed
// once Redis is configured; if missing, returns empty so the app still loads.

export const config = { maxDuration: 20 }

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
const HAS_REDIS = Boolean(REDIS_URL && REDIS_TOKEN)
const KEY = 'enbable:votes'

const norm = (s) => String(s || '').trim().toLowerCase()

async function redis(command) {
  const r = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    cache: 'no-store',
  })
  if (!r.ok) throw new Error(`redis ${r.status}`)
  return (await r.json()).result
}

async function readAll() {
  if (!HAS_REDIS) return []
  const flat = await redis(['HGETALL', KEY])
  const votes = []
  if (Array.isArray(flat)) {
    for (let i = 1; i < flat.length; i += 2) {
      try { votes.push(JSON.parse(flat[i])) } catch { /* skip */ }
    }
  }
  votes.sort((a, b) => (a.ts || 0) - (b.ts || 0))
  return votes
}

async function addOne(personId, person, scores) {
  const vote = { personId, person, scores, ts: Date.now() }
  await redis(['HSET', KEY, norm(personId), JSON.stringify(vote)])
  return readAll()
}

async function resetAll() { if (HAS_REDIS) await redis(['DEL', KEY]) }

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    if (req.method === 'GET') {
      return res.status(200).json({ votes: await readAll(), store: HAS_REDIS ? 'redis' : 'none' })
    }
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
      const personId = String(body.personId || '').trim()
      const person = String(body.person || '').trim()
      const scores = body.scores
      if (!personId || !scores || typeof scores !== 'object') {
        return res.status(400).json({ error: 'personId y scores son obligatorios' })
      }
      if (!HAS_REDIS) return res.status(503).json({ error: 'almacenamiento no configurado' })
      return res.status(200).json({ votes: await addOne(personId, person, scores) })
    }
    if (req.method === 'DELETE') {
      await resetAll()
      return res.status(200).json({ votes: [] })
    }
    res.setHeader('Allow', 'GET, POST, DELETE')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: 'store error', detail: String((e && e.message) || e) })
  }
}
