// Vercel serverless function: shared cheesecake-vote storage.
// Backed by a free key-value object on restful-api.dev so all phones
// see the same aggregated votes. The object id can be overridden with
// the STORE_ID environment variable.

const STORE_ID = process.env.STORE_ID || 'ff8081819d82fab6019ec05f518e00e8'
const STORE_URL = `https://api.restful-api.dev/objects/${STORE_ID}`
const STORE_NAME = 'tartas-queso-votacion-prod'

async function readStore() {
  const r = await fetch(STORE_URL, { cache: 'no-store' })
  if (!r.ok) throw new Error(`read ${r.status}`)
  const json = await r.json()
  const votes = (json && json.data && Array.isArray(json.data.votes)) ? json.data.votes : []
  return votes
}

async function writeStore(votes) {
  const r = await fetch(STORE_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: STORE_NAME, data: { votes } }),
  })
  if (!r.ok) throw new Error(`write ${r.status}`)
}

function norm(name) {
  return String(name || '').trim().toLowerCase()
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    if (req.method === 'GET') {
      const votes = await readStore()
      return res.status(200).json({ votes })
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
      const voter = String(body.voter || '').trim()
      const scores = body.scores
      if (!voter || !scores || typeof scores !== 'object') {
        return res.status(400).json({ error: 'voter y scores son obligatorios' })
      }
      // read-modify-write; dedupe by voter name (resubmit replaces)
      const votes = await readStore()
      const filtered = votes.filter((v) => norm(v.voter) !== norm(voter))
      filtered.push({ voter, scores, ts: Date.now() })
      await writeStore(filtered)
      return res.status(200).json({ votes: filtered })
    }

    if (req.method === 'DELETE') {
      await writeStore([])
      return res.status(200).json({ votes: [] })
    }

    res.setHeader('Allow', 'GET, POST, DELETE')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: 'store error', detail: String(e && e.message || e) })
  }
}
