// Vercel serverless function: shared cheesecake-vote storage.
//
// Primary store: Upstash Redis (atomic per-voter writes via HSET — no lost
// updates even if everyone votes at once, no write rate-limits).
// Fallback store: a free key-value object on restful-api.dev, used only if
// no Redis credentials are configured.

export const config = { maxDuration: 20 }

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
const HAS_REDIS = Boolean(REDIS_URL && REDIS_TOKEN)
const KEY = 'tartas:votes'

const norm = (name) => String(name || '').trim().toLowerCase()

/* ---------------- Redis (Upstash REST) ---------------- */
async function redis(command) {
  const r = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    cache: 'no-store',
  })
  if (!r.ok) throw new Error(`redis ${r.status}`)
  const json = await r.json()
  return json.result
}

async function redisRead() {
  const flat = await redis(['HGETALL', KEY]) // [field, value, field, value, ...]
  const votes = []
  if (Array.isArray(flat)) {
    for (let i = 1; i < flat.length; i += 2) {
      try { votes.push(JSON.parse(flat[i])) } catch { /* skip */ }
    }
  }
  votes.sort((a, b) => (a.ts || 0) - (b.ts || 0))
  return votes
}
async function redisAdd(voter, scores) {
  const vote = { voter, scores, ts: Date.now() }
  await redis(['HSET', KEY, norm(voter), JSON.stringify(vote)]) // atomic, per-voter
  return redisRead()
}
async function redisReset() { await redis(['DEL', KEY]) }

/* ---------------- Fallback: restful-api.dev ---------------- */
const STORE_ID = process.env.STORE_ID || 'ff8081819d82fab6019ec05f518e00e8'
const STORE_URL = `https://api.restful-api.dev/objects/${STORE_ID}`
const STORE_NAME = 'tartas-queso-votacion-prod'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fbRead(retries = 4) {
  let err
  for (let i = 0; i <= retries; i++) {
    try {
      const r = await fetch(STORE_URL, { cache: 'no-store' })
      if (!r.ok) throw new Error(`read ${r.status}`)
      const j = await r.json()
      return (j && j.data && Array.isArray(j.data.votes)) ? j.data.votes : []
    } catch (e) { err = e; if (i < retries) await sleep(400 * 2 ** i + Math.random() * 250) }
  }
  throw err
}
async function fbWrite(votes, retries = 5) {
  let err
  for (let i = 0; i <= retries; i++) {
    try {
      const r = await fetch(STORE_URL, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: STORE_NAME, data: { votes } }),
      })
      if (!r.ok) throw new Error(`write ${r.status}`)
      return
    } catch (e) { err = e; if (i < retries) await sleep(450 * 2 ** i + Math.random() * 300) }
  }
  throw err
}
async function fbAdd(voter, scores) {
  for (let a = 0; a < 3; a++) {
    const votes = await fbRead()
    const merged = votes.filter((v) => norm(v.voter) !== norm(voter))
    merged.push({ voter, scores, ts: Date.now() })
    await fbWrite(merged)
    const after = await fbRead()
    if (after.some((v) => norm(v.voter) === norm(voter))) return after
    await sleep(500 + Math.random() * 400)
  }
  return fbRead()
}

/* ---------------- Handler ---------------- */
async function readAll() { return HAS_REDIS ? redisRead() : fbRead() }
async function addOne(voter, scores) { return HAS_REDIS ? redisAdd(voter, scores) : fbAdd(voter, scores) }
async function resetAll() { return HAS_REDIS ? redisReset() : fbWrite([]) }

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    if (req.method === 'GET') {
      return res.status(200).json({ votes: await readAll(), store: HAS_REDIS ? 'redis' : 'fallback' })
    }
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
      const voter = String(body.voter || '').trim()
      const scores = body.scores
      if (!voter || !scores || typeof scores !== 'object') {
        return res.status(400).json({ error: 'voter y scores son obligatorios' })
      }
      return res.status(200).json({ votes: await addOne(voter, scores) })
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
