import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import confetti from 'canvas-confetti'
import { CAKES, CRITERIA, TOTAL_VOTERS, MIN_SCORE, MAX_SCORE } from './data.js'

const LS_KEY = 'tartas-queso-vote-v1'

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') } catch { return {} }
}
function saveLocal(obj) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(obj)) } catch { /* ignore */ }
}

async function apiGet() {
  const r = await fetch('/api/votes', { cache: 'no-store' })
  if (!r.ok) throw new Error('GET failed')
  return r.json()
}
async function apiPost(voter, scores) {
  let lastErr
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voter, scores }),
      })
      if (!r.ok) throw new Error('POST failed')
      return r.json()
    } catch (e) {
      lastErr = e
      await new Promise((res) => setTimeout(res, 800 * (i + 1)))
    }
  }
  throw lastErr
}
async function apiReset() {
  const r = await fetch('/api/votes', { method: 'DELETE' })
  if (!r.ok) throw new Error('DELETE failed')
  return r.json()
}

/* color-code a 1..10 score: soft red -> amber -> green */
function scoreColor(v) {
  if (typeof v !== 'number') return '#e9e4ef'
  const t = (v - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)
  const hue = 4 + t * 134 // 4 (red) -> 138 (green)
  return `hsl(${hue}, 62%, 66%)`
}
const REACTIONS = [
  { max: 2, txt: '🥲 Mejorable' },
  { max: 4, txt: '😐 Regular' },
  { max: 6, txt: '🙂 Está bien' },
  { max: 8, txt: '😋 Muy rica' },
  { max: 10, txt: '🤩 ¡Brutal!' },
]
function reactionFor(v) {
  if (typeof v !== 'number') return ''
  return (REACTIONS.find((r) => v <= r.max) || REACTIONS[REACTIONS.length - 1]).txt
}

function burst() {
  const opts = { spread: 70, startVelocity: 38, ticks: 200, zIndex: 9999, scalar: 0.9,
    colors: ['#f3a3a3', '#cdbdf0', '#a8d8c8', '#f2c879', '#fbd5d5'] }
  confetti({ ...opts, particleCount: 70, origin: { x: 0.5, y: 0.35 } })
  setTimeout(() => confetti({ ...opts, particleCount: 40, angle: 60, origin: { x: 0, y: 0.55 } }), 120)
  setTimeout(() => confetti({ ...opts, particleCount: 40, angle: 120, origin: { x: 1, y: 0.55 } }), 120)
}

/* count-up animation hook */
function useCountUp(target, deps = []) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let raf
    const start = performance.now()
    const dur = 800
    const from = 0
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(from + (target - from) * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return val
}

function Blobs() {
  return (
    <div className="blobs" aria-hidden="true">
      <div className="blob b1" /><div className="blob b2" /><div className="blob b3" />
    </div>
  )
}

export default function App() {
  const local = loadLocal()
  const [screen, setScreen] = useState(local.hasVoted ? 'waiting' : 'welcome')
  const [name, setName] = useState(local.voterName || '')
  const [votes, setVotes] = useState([])
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const { votes } = await apiGet()
      setVotes(Array.isArray(votes) ? votes : [])
    } catch { /* keep previous */ }
    finally { setLoaded(true) }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    if (screen !== 'waiting' && screen !== 'results') return
    const t = setInterval(refresh, 7000)
    return () => clearInterval(t)
  }, [screen, refresh])

  const count = votes.length
  const finished = count >= TOTAL_VOTERS

  function startVoting() {
    const n = name.trim()
    if (!n) return
    saveLocal({ ...loadLocal(), voterName: n })
    setScreen('vote')
  }

  async function submitVote(scores) {
    await apiPost(name.trim(), scores)
    saveLocal({ ...loadLocal(), voterName: name.trim(), hasVoted: true })
    await refresh()
    burst()
    setScreen('waiting')
  }

  function goResults() { setScreen('results') }

  async function resetAll() {
    if (!confirm('¿Borrar TODOS los votos y empezar de nuevo?')) return
    await apiReset()
    saveLocal({ voterName: name.trim() })
    await refresh()
    setScreen('welcome')
  }

  let content
  if (screen === 'welcome') {
    content = <Welcome name={name} setName={setName} onStart={startVoting} />
  } else if (screen === 'vote') {
    content = <Voting name={name} onSubmit={submitVote} onCancel={() => setScreen('welcome')} />
  } else if (screen === 'waiting') {
    content = (
      <Waiting
        votes={votes} count={count} finished={finished} loaded={loaded}
        onResults={goResults} onReset={resetAll}
      />
    )
  } else {
    content = <Results votes={votes} onReset={resetAll} onBack={() => setScreen('waiting')} />
  }

  return <><Blobs />{content}</>
}

/* ---------------- Welcome ---------------- */
function Welcome({ name, setName, onStart }) {
  return (
    <div className="welcome fadein">
      <div>
        <div className="hero-emoji">🧀</div>
        <h1>Votación de<br />Tartas de Queso</h1>
        <p className="sub muted">Cata a ciegas entre 4 tartas legendarias. Pon tu nombre y empieza a puntuar.</p>
      </div>

      <div className="cake-chips">
        {CAKES.map((c) => (
          <span className="chip" key={c.id}>{c.emoji} {c.name}</span>
        ))}
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input
          className="field"
          placeholder="Tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onStart() }}
          autoComplete="off"
          enterKeyHint="go"
          maxLength={24}
        />
        <button className="btn" onClick={onStart} disabled={!name.trim()}>
          Empezar a votar →
        </button>
      </div>

      <p className="footer-note">Cada criterio se puntúa del {MIN_SCORE} al {MAX_SCORE}. Votan {TOTAL_VOTERS} personas.</p>
    </div>
  )
}

/* ---------------- Voting ---------------- */
function Voting({ name, onSubmit, onCancel }) {
  const [scores, setScores] = useState(() => {
    const s = {}
    CAKES.forEach((c) => { s[c.id] = {} })
    return s
  })
  // step: 0..CAKES.length-1 = cakes ; CAKES.length = review
  const [step, setStep] = useState(0)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const reviewing = step === CAKES.length
  const cake = CAKES[step]
  const cakeScores = reviewing ? null : scores[cake.id]
  const cakeComplete = reviewing || CRITERIA.every((cr) => typeof cakeScores[cr.id] === 'number')

  function setScore(criterionId, value) {
    setScores((prev) => ({ ...prev, [cake.id]: { ...prev[cake.id], [criterionId]: value } }))
  }

  async function next() {
    if (reviewing) {
      setSending(true); setError('')
      try { await onSubmit(scores) }
      catch { setError('No se pudo enviar el voto. Revisa la conexión e inténtalo otra vez.'); setSending(false) }
      return
    }
    if (!cakeComplete) return
    setStep(step + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function back() {
    if (step === 0) { onCancel(); return }
    setStep(step - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalSteps = CAKES.length + 1

  return (
    <div>
      <div className="topbar">
        <span className="app-title">{name}</span>
        <div className="step-dots">
          {CAKES.map((c, i) => (
            <span key={c.id} className={'dot ' + (i === step ? 'active' : i < step ? 'done' : '')} />
          ))}
          <span className={'dot ' + (reviewing ? 'active' : '')} />
        </div>
      </div>

      <div className="progress-track" style={{ marginBottom: 16 }}>
        <div className="progress-fill" style={{ width: `${((step) / (totalSteps - 1)) * 100}%` }} />
      </div>

      {reviewing ? (
        <Review scores={scores} sending={sending} error={error} onSend={next} onBack={back} />
      ) : (
        <div className="card slide-in" key={cake.id}>
          <div className="cake-head">
            <div className="cake-badge" style={{ background: cake.color }}>{cake.emoji}</div>
            <h2>{cake.name}</h2>
          </div>
          <p className="cake-counter">Tarta {step + 1} de {CAKES.length}</p>

          {CRITERIA.map((cr) => {
            const v = cakeScores[cr.id]
            return (
              <div className="criterion" key={cr.id}>
                <div className="criterion-top">
                  <span className="criterion-label">{cr.emoji} {cr.label}</span>
                  <span
                    className={'criterion-value ' + (typeof v === 'number' ? '' : 'empty')}
                    style={typeof v === 'number' ? { background: scoreColor(v) } : undefined}
                  >
                    {typeof v === 'number' ? v : '–'}
                  </span>
                </div>
                <Scale value={v} onChange={(val) => setScore(cr.id, val)} />
                <div className="reaction" style={typeof v === 'number' ? { color: scoreColor(v) } : undefined}>
                  {reactionFor(v)}
                </div>
              </div>
            )
          })}

          {error && <p className="center" style={{ color: '#d97777', fontSize: 14, marginTop: 12 }}>{error}</p>}

          <div className="nav-row">
            <button className="btn btn-back" onClick={back} disabled={sending}>‹</button>
            <button className="btn" onClick={next} disabled={!cakeComplete || sending}>
              {step === CAKES.length - 1 ? 'Revisar mi voto →' : 'Siguiente tarta →'}
            </button>
          </div>
          {!cakeComplete && <p className="footer-note">Puntúa los {CRITERIA.length} criterios para continuar.</p>}
        </div>
      )}
    </div>
  )
}

function Scale({ value, onChange }) {
  const nums = []
  for (let i = MIN_SCORE; i <= MAX_SCORE; i++) nums.push(i)
  return (
    <div className="scale">
      {nums.map((n) => (
        <button
          key={n}
          className={'pill ' + (value === n ? 'selected' : '')}
          style={value === n ? { background: scoreColor(n) } : undefined}
          onClick={() => onChange(n)}
          aria-label={`Puntuar ${n}`}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

function cakeAverage(cakeScores) {
  const vals = CRITERIA.map((cr) => cakeScores?.[cr.id]).filter((x) => typeof x === 'number')
  if (!vals.length) return 0
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

function Review({ scores, sending, error, onSend, onBack }) {
  return (
    <div className="card slide-in">
      <div className="cake-head">
        <div className="cake-badge" style={{ background: 'var(--lav-soft)' }}>📝</div>
        <h2>Revisa tu voto</h2>
      </div>
      <p className="cake-counter">Comprueba tus puntuaciones antes de enviar</p>

      {CAKES.map((c) => {
        const avg = cakeAverage(scores[c.id])
        return (
          <div className="review-cake" key={c.id}>
            <div className="review-head">
              <span className="e">{c.emoji}</span>
              <span className="n">{c.name}</span>
              <span className="a">{avg.toFixed(1)}</span>
            </div>
            <div className="review-crit">
              {CRITERIA.map((cr) => (
                <span className="review-tag" key={cr.id}>{cr.label} <b>{scores[c.id][cr.id]}</b></span>
              ))}
            </div>
          </div>
        )
      })}

      {error && <p className="center" style={{ color: '#d97777', fontSize: 14, marginTop: 12 }}>{error}</p>}

      <div className="nav-row">
        <button className="btn btn-back" onClick={onBack} disabled={sending}>‹</button>
        <button className="btn" onClick={onSend} disabled={sending}>
          {sending ? 'Enviando…' : 'Enviar mi voto 🎉'}
        </button>
      </div>
    </div>
  )
}

/* ---------------- Waiting ---------------- */
function Waiting({ votes, count, finished, loaded, onResults, onReset }) {
  return (
    <div className="waiting fadein">
      <div className={'big-check ' + (finished ? 'pop' : 'pulse')}>{finished ? '🎉' : '✅'}</div>
      <div>
        <h1 style={{ fontSize: 27, marginBottom: 8 }}>
          {finished ? '¡Votación completada!' : '¡Voto registrado!'}
        </h1>
        <p className="muted">
          {finished
            ? 'Ya han votado todas las personas. Mira quién se lleva la corona.'
            : 'Gracias por puntuar. Esperando al resto de catadores…'}
        </p>
      </div>

      {!loaded ? (
        <div className="spinner" />
      ) : (
        <>
          <div className="count-big">{count} / {TOTAL_VOTERS}</div>
          <div className="progress-track" style={{ maxWidth: 280, margin: '0 auto', width: '100%' }}>
            <div className="progress-fill" style={{ width: `${Math.min(100, (count / TOTAL_VOTERS) * 100)}%` }} />
          </div>
        </>
      )}

      {votes.length > 0 && (
        <div className="voter-list">
          {votes.map((v, i) => <span className="voter-tag" key={i} style={{ animationDelay: `${i * 0.06}s` }}>👤 {v.voter}</span>)}
        </div>
      )}

      {finished ? (
        <button className="btn" onClick={onResults}>Ver resultados 🏆</button>
      ) : (
        <p className="muted" style={{ fontSize: 14 }}>Esta pantalla se actualiza sola.</p>
      )}

      {!finished && count > 0 && (
        <button className="link-btn" onClick={onResults}>Ver resultados parciales</button>
      )}
      <button className="link-btn" onClick={onReset}>Reiniciar votación</button>
    </div>
  )
}

/* ---------------- Results ---------------- */
function computeStats(votes) {
  return CAKES.map((cake) => {
    const perCriterion = {}
    let overallSum = 0
    let overallCount = 0
    CRITERIA.forEach((cr) => {
      let sum = 0, n = 0
      votes.forEach((v) => {
        const val = v.scores?.[cake.id]?.[cr.id]
        if (typeof val === 'number') { sum += val; n += 1 }
      })
      const avg = n ? sum / n : 0
      perCriterion[cr.id] = avg
      overallSum += sum
      overallCount += n
    })
    const overall = overallCount ? overallSum / overallCount : 0
    return { cake, perCriterion, overall }
  }).sort((a, b) => b.overall - a.overall)
}

function Results({ votes, onReset, onBack }) {
  const [tab, setTab] = useState('global')

  const fired = useRef(false)
  useEffect(() => {
    if (fired.current) return
    fired.current = true
    const t = setTimeout(burst, 350)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="fadein">
      <h1 className="results-title">🏆 Resultados</h1>
      <p className="results-sub muted">{votes.length} {votes.length === 1 ? 'voto' : 'votos'} · media del {MIN_SCORE} al {MAX_SCORE}</p>

      <div className="tabs">
        <button className={'tab ' + (tab === 'global' ? 'active' : '')} onClick={() => setTab('global')}>🌍 Global</button>
        <button className={'tab ' + (tab === 'person' ? 'active' : '')} onClick={() => setTab('person')}>👥 Por persona</button>
      </div>

      {tab === 'global' ? <GlobalResults votes={votes} /> : <PerPersonResults votes={votes} />}

      <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-secondary" onClick={onBack}>‹ Volver</button>
        <button className="link-btn" onClick={onReset}>Reiniciar votación</button>
      </div>
      <p className="footer-note">Hecho con cariño 🧁</p>
    </div>
  )
}

function GlobalResults({ votes }) {
  const ranked = useMemo(() => computeStats(votes), [votes])
  const podium = ranked.slice(0, 3)
  const order = [podium[1], podium[0], podium[2]].filter(Boolean)
  const heightClass = (r) => (r === podium[0] ? 'h1bar podium-1' : r === podium[1] ? 'h2bar podium-2' : 'h3bar podium-3')
  const medal = (r) => (r === podium[0] ? '🥇' : r === podium[1] ? '🥈' : '🥉')

  return (
    <div className="fadein">
      <div className="podium">
        {order.map((r, i) => (
          <div className="podium-col pop" style={{ animationDelay: `${i * 0.18}s` }} key={r.cake.id}>
            {r === podium[0] ? <div className="crown">👑</div> : <div className="podium-medal">{medal(r)}</div>}
            <div className="podium-emoji">{r.cake.emoji}</div>
            <div className={'podium-card ' + heightClass(r)}>
              <div className="podium-name">{r.cake.name}</div>
              <PodiumScore value={r.overall} />
            </div>
          </div>
        ))}
      </div>

      <div className="section-title">Clasificación completa</div>
      {ranked.map((r, i) => (
        <div className={'rank-row fadein ' + (i === 0 ? 'first' : '')} style={{ animationDelay: `${i * 0.06}s` }} key={r.cake.id}>
          <span className="rank-pos">{i + 1}</span>
          <span className="rank-emoji">{r.cake.emoji}</span>
          <div className="rank-info">
            <div className="rank-name">{r.cake.name}</div>
            <div className="rank-meta">{bestCriterion(r)}</div>
          </div>
          <span className="rank-score">{r.overall.toFixed(1)}</span>
        </div>
      ))}

      <div className="section-title">Estadísticas por tarta</div>
      {ranked.map((r) => (
        <div className="stat-card" key={r.cake.id}>
          <div className="stat-head">
            <span className="e">{r.cake.emoji}</span>
            <span className="n">{r.cake.name}</span>
            <span className="avg">{r.overall.toFixed(1)}</span>
          </div>
          {CRITERIA.map((cr) => (
            <div className="bar-row" key={cr.id}>
              <div className="bar-top">
                <span>{cr.emoji} {cr.label}</span>
                <span className="v">{r.perCriterion[cr.id].toFixed(1)}</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(r.perCriterion[cr.id] / MAX_SCORE) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      ))}

      <div className="section-title">Mejor en cada criterio</div>
      <div className="stat-card">
        {CRITERIA.map((cr) => {
          const winner = criterionWinner(ranked, cr.id)
          return (
            <div className="bar-row" key={cr.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{cr.emoji} {cr.label}</span>
              <span className="v" style={{ fontSize: 14 }}>
                {winner ? `${winner.cake.emoji} ${winner.cake.name} · ${winner.perCriterion[cr.id].toFixed(1)}` : '—'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------- Per-person results ---------------- */
function PerPersonResults({ votes }) {
  if (!votes.length) {
    return <p className="center muted" style={{ marginTop: 30 }}>Todavía no hay votos.</p>
  }
  return (
    <div className="fadein">
      <div className="section-title">Lo que puntuó cada catador</div>
      {votes.map((v, idx) => {
        const allVals = []
        CAKES.forEach((c) => CRITERIA.forEach((cr) => {
          const val = v.scores?.[c.id]?.[cr.id]
          if (typeof val === 'number') allVals.push(val)
        }))
        const personAvg = allVals.length ? allVals.reduce((a, b) => a + b, 0) / allVals.length : 0
        // that person's favourite cake
        const perCake = CAKES.map((c) => ({ cake: c, avg: cakeAverage(v.scores?.[c.id]) }))
          .sort((a, b) => b.avg - a.avg)
        const fav = perCake[0]
        return (
          <div className="person-card fadein" style={{ animationDelay: `${idx * 0.06}s` }} key={idx}>
            <div className="person-head">
              <span className="person-avatar">{v.voter.trim().charAt(0).toUpperCase() || '?'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="person-name">{v.voter}</div>
                <div className="person-meta">Su favorita: {fav.cake.emoji} {fav.cake.name}</div>
              </div>
              <span className="person-avg">{personAvg.toFixed(1)}</span>
            </div>
            {perCake.map(({ cake, avg }) => (
              <div className="person-cake" key={cake.id}>
                <div className="person-cake-top">
                  <span>{cake.emoji} {cake.name}</span>
                  <span className="pc-avg" style={{ color: scoreColor(avg) }}>{avg.toFixed(1)}</span>
                </div>
                <div className="review-crit">
                  {CRITERIA.map((cr) => {
                    const val = v.scores?.[cake.id]?.[cr.id]
                    return (
                      <span className="score-tag" key={cr.id} style={{ background: scoreColor(val), color: '#fff' }}>
                        {cr.label} <b>{typeof val === 'number' ? val : '–'}</b>
                      </span>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

function PodiumScore({ value }) {
  const v = useCountUp(value, [value])
  return <div className="podium-score">{v.toFixed(1)}</div>
}

function bestCriterion(r) {
  let best = null
  CRITERIA.forEach((cr) => {
    if (!best || r.perCriterion[cr.id] > r.perCriterion[best.id]) best = cr
  })
  if (!best || r.perCriterion[best.id] === 0) return 'Sin datos'
  return `Destaca en ${best.label.toLowerCase()} (${r.perCriterion[best.id].toFixed(1)})`
}

function criterionWinner(ranked, criterionId) {
  let winner = null
  ranked.forEach((r) => {
    if (!winner || r.perCriterion[criterionId] > winner.perCriterion[criterionId]) winner = r
  })
  if (!winner || winner.perCriterion[criterionId] === 0) return null
  return winner
}
