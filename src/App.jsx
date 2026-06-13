import React, { useEffect, useMemo, useState, useCallback } from 'react'
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
  const r = await fetch('/api/votes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voter, scores }),
  })
  if (!r.ok) throw new Error('POST failed')
  return r.json()
}
async function apiReset() {
  const r = await fetch('/api/votes', { method: 'DELETE' })
  if (!r.ok) throw new Error('DELETE failed')
  return r.json()
}

export default function App() {
  const local = loadLocal()
  // screens: welcome -> vote -> waiting -> results
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

  // poll while waiting / results so the count stays fresh across phones
  useEffect(() => {
    if (screen !== 'waiting' && screen !== 'results') return
    const t = setInterval(refresh, 4000)
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

  if (screen === 'welcome') {
    return <Welcome name={name} setName={setName} onStart={startVoting} count={count} />
  }
  if (screen === 'vote') {
    return <Voting name={name} onSubmit={submitVote} onCancel={() => setScreen('welcome')} />
  }
  if (screen === 'waiting') {
    return (
      <Waiting
        votes={votes} count={count} finished={finished} loaded={loaded}
        onResults={goResults} onReset={resetAll}
      />
    )
  }
  return <Results votes={votes} onReset={resetAll} onBack={() => setScreen('waiting')} />
}

/* ---------------- Welcome ---------------- */
function Welcome({ name, setName, onStart, count }) {
  return (
    <div className="welcome fadein">
      <div>
        <div className="hero-emoji">🧀🎂</div>
        <h1>Votación de<br />Tartas de Queso</h1>
        <p className="sub muted">Cata a ciegas entre {count >= 0 ? '4' : '4'} tartas legendarias. Pon tu nombre y empieza a puntuar.</p>
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
  // scores[cakeId][criterionId] = number
  const [scores, setScores] = useState(() => {
    const s = {}
    CAKES.forEach((c) => { s[c.id] = {} })
    return s
  })
  const [step, setStep] = useState(0) // index into CAKES
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const cake = CAKES[step]
  const cakeScores = scores[cake.id]
  const cakeComplete = CRITERIA.every((cr) => typeof cakeScores[cr.id] === 'number')
  const isLast = step === CAKES.length - 1

  function setScore(criterionId, value) {
    setScores((prev) => ({ ...prev, [cake.id]: { ...prev[cake.id], [criterionId]: value } }))
  }

  async function next() {
    if (!cakeComplete) return
    if (!isLast) { setStep(step + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    // submit
    setSending(true); setError('')
    try {
      await onSubmit(scores)
    } catch (e) {
      setError('No se pudo enviar el voto. Revisa la conexión e inténtalo otra vez.')
      setSending(false)
    }
  }

  function back() {
    if (step === 0) { onCancel(); return }
    setStep(step - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      <div className="topbar">
        <span className="app-title">{name}</span>
        <div className="step-dots">
          {CAKES.map((c, i) => (
            <span key={c.id} className={'dot ' + (i === step ? 'active' : i < step ? 'done' : '')} />
          ))}
        </div>
      </div>

      <div className="card fadein" key={cake.id}>
        <div className="cake-head">
          <div className="cake-badge" style={{ background: cake.color }}>{cake.emoji}</div>
          <h2>{cake.name}</h2>
        </div>
        <p className="cake-counter">Tarta {step + 1} de {CAKES.length}</p>

        {CRITERIA.map((cr) => (
          <div className="criterion" key={cr.id}>
            <div className="criterion-top">
              <span className="criterion-label">{cr.emoji} {cr.label}</span>
              <span className={'criterion-value ' + (typeof cakeScores[cr.id] === 'number' ? '' : 'empty')}>
                {typeof cakeScores[cr.id] === 'number' ? cakeScores[cr.id] : '–'}
              </span>
            </div>
            <Scale value={cakeScores[cr.id]} onChange={(v) => setScore(cr.id, v)} />
          </div>
        ))}

        {error && <p className="center" style={{ color: '#d97777', fontSize: 14, marginTop: 12 }}>{error}</p>}

        <div className="nav-row">
          <button className="btn btn-back" onClick={back} disabled={sending}>‹</button>
          <button className="btn" onClick={next} disabled={!cakeComplete || sending}>
            {sending ? 'Enviando…' : isLast ? 'Enviar mi voto 🎉' : 'Siguiente tarta →'}
          </button>
        </div>
        {!cakeComplete && <p className="footer-note">Puntúa los {CRITERIA.length} criterios para continuar.</p>}
      </div>
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
          onClick={() => onChange(n)}
          aria-label={`Puntuar ${n}`}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

/* ---------------- Waiting ---------------- */
function Waiting({ votes, count, finished, loaded, onResults, onReset }) {
  return (
    <div className="waiting fadein">
      <div className="big-check pop">{finished ? '🎉' : '✅'}</div>
      <div>
        <h1 style={{ fontSize: 26, marginBottom: 8 }}>
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
          {votes.map((v, i) => <span className="voter-tag" key={i}>👤 {v.voter}</span>)}
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
  // per cake: per-criterion average, overall average, total
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
  const ranked = useMemo(() => computeStats(votes), [votes])
  const podium = ranked.slice(0, 3)
  // arrange podium visually: 2nd, 1st, 3rd
  const order = [podium[1], podium[0], podium[2]].filter(Boolean)
  const heightClass = (r) => (r === podium[0] ? 'h1bar podium-1' : r === podium[1] ? 'h2bar podium-2' : 'h3bar podium-3')
  const medal = (r) => (r === podium[0] ? '🥇' : r === podium[1] ? '🥈' : '🥉')

  return (
    <div className="fadein">
      <h1 className="results-title">🏆 Resultados</h1>
      <p className="results-sub muted">{votes.length} {votes.length === 1 ? 'voto' : 'votos'} · puntuación media del {MIN_SCORE} al {MAX_SCORE}</p>

      {/* Podium */}
      <div className="podium">
        {order.map((r, i) => (
          <div className="podium-col pop" style={{ animationDelay: `${i * 0.15}s` }} key={r.cake.id}>
            <div className="podium-medal">{medal(r)}</div>
            <div className="podium-emoji">{r.cake.emoji}</div>
            <div className={'podium-card ' + heightClass(r)}>
              <div className="podium-name">{r.cake.name}</div>
              <div className="podium-score">{r.overall.toFixed(1)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Full ranking */}
      <div className="section-title">Clasificación completa</div>
      {ranked.map((r, i) => (
        <div className="rank-row fadein" style={{ animationDelay: `${i * 0.05}s` }} key={r.cake.id}>
          <span className="rank-pos">{i + 1}</span>
          <span className="rank-emoji">{r.cake.emoji}</span>
          <div className="rank-info">
            <div className="rank-name">{r.cake.name}</div>
            <div className="rank-meta">{bestCriterion(r)}</div>
          </div>
          <span className="rank-score">{r.overall.toFixed(1)}</span>
        </div>
      ))}

      {/* Detailed stats */}
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

      <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-secondary" onClick={onBack}>‹ Volver</button>
        <button className="link-btn" onClick={onReset}>Reiniciar votación</button>
      </div>
      <p className="footer-note">Hecho con cariño 🧁</p>
    </div>
  )
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
