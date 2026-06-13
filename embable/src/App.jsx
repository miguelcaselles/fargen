import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import confetti from 'canvas-confetti'
import { RESTAURANT, PLACEHOLDER, PEOPLE, DISHES, CRITERIA, MIN_SCORE, MAX_SCORE } from './data.js'

const LS_KEY = 'enbable-vote-v1'
const loadLocal = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') } catch { return {} } }
const saveLocal = (o) => { try { localStorage.setItem(LS_KEY, JSON.stringify(o)) } catch { /* */ } }

async function apiGet() {
  const r = await fetch('/api/votes', { cache: 'no-store' })
  if (!r.ok) throw new Error('GET failed')
  return r.json()
}
async function apiPost(personId, person, scores) {
  let lastErr
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch('/api/votes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personId, person, scores }),
      })
      if (!r.ok) throw new Error('POST failed')
      return r.json()
    } catch (e) { lastErr = e; await new Promise((res) => setTimeout(res, 800 * (i + 1))) }
  }
  throw lastErr
}
async function apiReset() {
  const r = await fetch('/api/votes', { method: 'DELETE' })
  if (!r.ok) throw new Error('DELETE failed')
  return r.json()
}

/* ---------- helpers ---------- */
const peopleById = Object.fromEntries(PEOPLE.map((p) => [p.id, p]))
const eligibleDishes = (personId) =>
  DISHES.filter((d) => d.scope === 'all' || (Array.isArray(d.scope) && d.scope.includes(personId)))
const eligibleVoters = (dish) =>
  dish.scope === 'all' ? PEOPLE : PEOPLE.filter((p) => dish.scope.includes(p.id))
const isShared = (dish) => dish.scope === 'all'

function scoreColor(v) {
  if (typeof v !== 'number') return '#dfe7ee'
  const t = (v - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)
  return `hsl(${4 + t * 134}, 58%, 60%)`
}
const REACTIONS = [
  { max: 2, txt: '🥲 Flojo' }, { max: 4, txt: '😐 Mejorable' }, { max: 6, txt: '🙂 Correcto' },
  { max: 8, txt: '😋 Muy bueno' }, { max: 10, txt: '🤩 ¡Espectacular!' },
]
const reactionFor = (v) => (typeof v !== 'number' ? '' : (REACTIONS.find((r) => v <= r.max) || REACTIONS[4]).txt)

function burst() {
  const opts = { spread: 70, startVelocity: 38, ticks: 200, zIndex: 9999, scalar: 0.9,
    colors: ['#3f80b3', '#6aa6d2', '#2a4866', '#e0b15a', '#6fb1a6'] }
  confetti({ ...opts, particleCount: 70, origin: { x: 0.5, y: 0.35 } })
  setTimeout(() => confetti({ ...opts, particleCount: 40, angle: 60, origin: { x: 0, y: 0.55 } }), 120)
  setTimeout(() => confetti({ ...opts, particleCount: 40, angle: 120, origin: { x: 1, y: 0.55 } }), 120)
}

function useCountUp(target, deps = []) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let raf; const start = performance.now(); const dur = 800
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur)
      setVal(target * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return val
}

const Blobs = () => (
  <div className="blobs" aria-hidden="true"><div className="blob b1" /><div className="blob b2" /><div className="blob b3" /></div>
)

const dishAverage = (dishScores) => {
  const vals = CRITERIA.map((c) => dishScores?.[c.id]).filter((x) => typeof x === 'number')
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
}

/* ============================================================ */
export default function App() {
  const local = loadLocal()
  const [screen, setScreen] = useState(local.hasVoted ? 'waiting' : 'who')
  const [person, setPerson] = useState(local.personId ? peopleById[local.personId] || null : null)
  const [votes, setVotes] = useState([])
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(async () => {
    try { const { votes } = await apiGet(); setVotes(Array.isArray(votes) ? votes : []) }
    catch { /* keep */ } finally { setLoaded(true) }
  }, [])
  useEffect(() => { refresh() }, [refresh])
  useEffect(() => {
    if (screen !== 'waiting' && screen !== 'results') return
    const t = setInterval(refresh, 7000)
    return () => clearInterval(t)
  }, [screen, refresh])

  const submittedIds = new Set(votes.map((v) => v.personId))
  const count = submittedIds.size
  const finished = count >= PEOPLE.length

  function pickPerson(p) {
    setPerson(p)
    saveLocal({ ...loadLocal(), personId: p.id, personName: p.name })
    setScreen('vote')
  }
  async function submitVote(scores) {
    await apiPost(person.id, person.name, scores)
    saveLocal({ ...loadLocal(), personId: person.id, personName: person.name, hasVoted: true })
    await refresh(); burst(); setScreen('waiting')
  }
  async function resetAll() {
    if (!confirm('¿Borrar TODAS las votaciones y empezar de nuevo?')) return
    await apiReset(); saveLocal({}); setPerson(null); await refresh(); setScreen('who')
  }

  let content
  if (screen === 'who') content = <Who votes={votes} onPick={pickPerson} />
  else if (screen === 'vote') content = <Voting person={person} onSubmit={submitVote} onCancel={() => setScreen('who')} />
  else if (screen === 'waiting') content = <Waiting votes={votes} count={count} finished={finished} loaded={loaded} onResults={() => setScreen('results')} onReset={resetAll} />
  else content = <Results votes={votes} onReset={resetAll} onBack={() => setScreen('waiting')} />

  return <><Blobs />{content}</>
}

/* ---------------- Brand header ---------------- */
function Brand({ small }) {
  return (
    <>
      <div className={'brand-logo' + (small ? ' brand-logo-sm' : '')}>
        <img src="/logo.jpeg" alt={RESTAURANT.name} />
      </div>
      {!small && (
        <p className="brand-caption">{RESTAURANT.subtitle}</p>
      )}
    </>
  )
}

/* ---------------- Who are you ---------------- */
function Who({ votes, onPick }) {
  const voted = new Set(votes.map((v) => v.personId))
  return (
    <div className="welcome fadein">
      <div>
        <Brand />
        <h1>Votación de platos</h1>
        <p className="sub muted">Elige tu nombre para empezar a puntuar lo que has comido.</p>
      </div>

      {PLACEHOLDER && (
        <p className="demo-note">⚠️ Datos de ejemplo — pendientes de los platos reales.</p>
      )}

      <div className="card">
        <div className="people-grid">
          {PEOPLE.map((p) => (
            <button key={p.id} className={'person-btn' + (voted.has(p.id) ? ' voted' : '')} onClick={() => onPick(p)}>
              <span className="pa">{p.name.trim().charAt(0).toUpperCase()}</span>
              <span className="pinfo">
                <div style={{ fontWeight: 700 }}>{p.name}</div>
                {voted.has(p.id) && <div className="pcheck">✓ ya ha votado (puedes corregir)</div>}
              </span>
              <span style={{ color: 'var(--ink-soft)' }}>›</span>
            </button>
          ))}
        </div>
      </div>
      <p className="footer-note">Puntúa del {MIN_SCORE} al {MAX_SCORE}. Votan {PEOPLE.length} comensales.</p>
    </div>
  )
}

/* ---------------- Voting ---------------- */
function Voting({ person, onSubmit, onCancel }) {
  const dishes = useMemo(() => eligibleDishes(person.id), [person.id])
  const [scores, setScores] = useState(() => { const s = {}; dishes.forEach((d) => { s[d.id] = {} }); return s })
  const [step, setStep] = useState(0) // 0..dishes.length-1 = dishes ; dishes.length = review
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const reviewing = step === dishes.length
  const dish = dishes[step]
  const dScores = reviewing ? null : scores[dish.id]
  const complete = reviewing || CRITERIA.every((cr) => typeof dScores[cr.id] === 'number')

  const setScore = (cid, v) => setScores((prev) => ({ ...prev, [dish.id]: { ...prev[dish.id], [cid]: v } }))

  async function next() {
    if (reviewing) {
      setSending(true); setError('')
      try { await onSubmit(scores) } catch { setError('No se pudo enviar. Revisa la conexión e inténtalo otra vez.'); setSending(false) }
      return
    }
    if (!complete) return
    setStep(step + 1); window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function back() {
    if (step === 0) { onCancel(); return }
    setStep(step - 1); window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const totalSteps = dishes.length + 1

  return (
    <div>
      <div className="topbar">
        <span className="app-title">{person.name}</span>
        <div className="step-dots">
          {dishes.map((d, i) => <span key={d.id} className={'dot ' + (i === step ? 'active' : i < step ? 'done' : '')} />)}
          <span className={'dot ' + (reviewing ? 'active' : '')} />
        </div>
      </div>
      <div className="progress-track" style={{ marginBottom: 16 }}>
        <div className="progress-fill" style={{ width: `${(step / (totalSteps - 1)) * 100}%` }} />
      </div>

      {reviewing ? (
        <Review person={person} dishes={dishes} scores={scores} sending={sending} error={error} onSend={next} onBack={back} />
      ) : (
        <div className="card slide-in" key={dish.id}>
          <div className="cake-head">
            <div className="cake-badge" style={{ background: 'var(--lav-soft)' }}>{dish.emoji}</div>
            <h2>{dish.name}</h2>
          </div>
          <div className="dish-tags">
            <span className="dish-tag cat">{dish.category}</span>
            {isShared(dish)
              ? <span className="dish-tag all">🤝 Para compartir</span>
              : <span className="dish-tag ind">👤 {eligibleVoters(dish).map((p) => p.name).join(', ')}</span>}
          </div>
          <p className="cake-counter">Plato {step + 1} de {dishes.length}</p>

          {CRITERIA.map((cr) => {
            const v = dScores[cr.id]
            return (
              <div className="criterion" key={cr.id}>
                <div className="criterion-top">
                  <span className="criterion-label">{cr.emoji} {cr.label}</span>
                  <span className={'criterion-value ' + (typeof v === 'number' ? '' : 'empty')} style={typeof v === 'number' ? { background: scoreColor(v) } : undefined}>
                    {typeof v === 'number' ? v : '–'}
                  </span>
                </div>
                <Scale value={v} onChange={(val) => setScore(cr.id, val)} />
                <div className="reaction" style={typeof v === 'number' ? { color: scoreColor(v) } : undefined}>{reactionFor(v)}</div>
              </div>
            )
          })}

          {error && <p className="center" style={{ color: '#c0556b', fontSize: 14, marginTop: 12 }}>{error}</p>}
          <div className="nav-row">
            <button className="btn btn-back" onClick={back} disabled={sending}>‹</button>
            <button className="btn" onClick={next} disabled={!complete || sending}>
              {step === dishes.length - 1 ? 'Revisar mi voto →' : 'Siguiente plato →'}
            </button>
          </div>
          {!complete && <p className="footer-note">Puntúa los {CRITERIA.length} aspectos para continuar.</p>}
        </div>
      )}
    </div>
  )
}

function Scale({ value, onChange }) {
  const nums = []; for (let i = MIN_SCORE; i <= MAX_SCORE; i++) nums.push(i)
  return (
    <div className="scale">
      {nums.map((n) => (
        <button key={n} className={'pill ' + (value === n ? 'selected' : '')}
          style={value === n ? { background: scoreColor(n) } : undefined}
          onClick={() => onChange(n)} aria-label={`Puntuar ${n}`}>{n}</button>
      ))}
    </div>
  )
}

function Review({ person, dishes, scores, sending, error, onSend, onBack }) {
  return (
    <div className="card slide-in">
      <div className="cake-head">
        <div className="cake-badge" style={{ background: 'var(--lav-soft)' }}>📝</div>
        <h2>Revisa tu voto</h2>
      </div>
      <p className="cake-counter">{person.name} · comprueba tus puntuaciones antes de enviar</p>
      {dishes.map((d) => (
        <div className="review-cake" key={d.id}>
          <div className="review-head">
            <span className="e">{d.emoji}</span>
            <span className="n">{d.name}</span>
            <span className="a">{dishAverage(scores[d.id]).toFixed(1)}</span>
          </div>
          <div className="review-crit">
            {CRITERIA.map((cr) => <span className="review-tag" key={cr.id}>{cr.label} <b>{scores[d.id][cr.id]}</b></span>)}
          </div>
        </div>
      ))}
      {error && <p className="center" style={{ color: '#c0556b', fontSize: 14, marginTop: 12 }}>{error}</p>}
      <div className="nav-row">
        <button className="btn btn-back" onClick={onBack} disabled={sending}>‹</button>
        <button className="btn" onClick={onSend} disabled={sending}>{sending ? 'Enviando…' : 'Enviar mi voto 🎉'}</button>
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
        <h1 style={{ fontSize: 27, marginBottom: 8 }}>{finished ? '¡Votación completada!' : '¡Voto registrado!'}</h1>
        <p className="muted">{finished ? 'Ya han votado todos los comensales.' : 'Gracias. Esperando al resto de comensales…'}</p>
      </div>
      {!loaded ? <div className="spinner" /> : (
        <>
          <div className="count-big">{count} / {PEOPLE.length}</div>
          <div className="progress-track" style={{ maxWidth: 280, margin: '0 auto', width: '100%' }}>
            <div className="progress-fill" style={{ width: `${Math.min(100, (count / PEOPLE.length) * 100)}%` }} />
          </div>
        </>
      )}
      {votes.length > 0 && (
        <div className="voter-list">
          {votes.map((v, i) => <span className="voter-tag" key={i} style={{ animationDelay: `${i * 0.06}s` }}>👤 {v.person}</span>)}
        </div>
      )}
      {finished
        ? <button className="btn" onClick={onResults}>Ver resultados 🏆</button>
        : <p className="muted" style={{ fontSize: 14 }}>Esta pantalla se actualiza sola.</p>}
      {!finished && count > 0 && <button className="link-btn" onClick={onResults}>Ver resultados parciales</button>}
      <button className="link-btn" onClick={onReset}>Reiniciar votación</button>
    </div>
  )
}

/* ---------------- Results ---------------- */
function computeStats(votes) {
  return DISHES.map((dish) => {
    const perCriterion = {}
    let sumOverall = 0, nCrit = 0
    const voterIds = new Set()
    CRITERIA.forEach((cr) => {
      let sum = 0, n = 0
      votes.forEach((v) => {
        const val = v.scores?.[dish.id]?.[cr.id]
        if (typeof val === 'number') { sum += val; n += 1; voterIds.add(v.personId) }
      })
      const avg = n ? sum / n : 0
      perCriterion[cr.id] = avg
      if (n) { sumOverall += avg; nCrit += 1 }
    })
    const overall = nCrit ? sumOverall / nCrit : 0
    return { dish, perCriterion, overall, nVotes: voterIds.size, expected: eligibleVoters(dish).length }
  }).sort((a, b) => b.overall - a.overall)
}

function Results({ votes, onReset, onBack }) {
  const [tab, setTab] = useState('global')
  const fired = useRef(false)
  useEffect(() => { if (fired.current) return; fired.current = true; const t = setTimeout(burst, 350); return () => clearTimeout(t) }, [])
  return (
    <div className="fadein">
      <Brand small />
      <h1 className="results-title">🏆 Resultados</h1>
      <p className="results-sub muted">{votes.length} {votes.length === 1 ? 'comensal' : 'comensales'} · nota media (Sabor · Presentación · Originalidad · Balance)</p>
      <div className="tabs">
        <button className={'tab ' + (tab === 'global' ? 'active' : '')} onClick={() => setTab('global')}>🌍 Global</button>
        <button className={'tab ' + (tab === 'person' ? 'active' : '')} onClick={() => setTab('person')}>👥 Por persona</button>
      </div>
      {tab === 'global' ? <GlobalResults votes={votes} /> : <PerPersonResults votes={votes} />}
      <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-secondary" onClick={onBack}>‹ Volver</button>
        <button className="link-btn" onClick={onReset}>Reiniciar votación</button>
      </div>
      <p className="footer-note">enbable · Taberna Asturiana 🍽️</p>
    </div>
  )
}

function GlobalResults({ votes }) {
  const ranked = useMemo(() => computeStats(votes), [votes])
  const podium = ranked.slice(0, 3)
  const order = [podium[1], podium[0], podium[2]].filter(Boolean)
  const hc = (r) => (r === podium[0] ? 'h1bar podium-1' : r === podium[1] ? 'h2bar podium-2' : 'h3bar podium-3')
  const medal = (r) => (r === podium[0] ? '🥇' : r === podium[1] ? '🥈' : '🥉')
  return (
    <div className="fadein">
      <div className="podium">
        {order.map((r, i) => (
          <div className="podium-col pop" style={{ animationDelay: `${i * 0.18}s` }} key={r.dish.id}>
            {r === podium[0] ? <div className="crown">👑</div> : <div className="podium-medal">{medal(r)}</div>}
            <div className="podium-emoji">{r.dish.emoji}</div>
            <div className={'podium-card ' + hc(r)}>
              <div className="podium-name">{r.dish.name}</div>
              <PodiumScore value={r.overall} />
            </div>
          </div>
        ))}
      </div>

      <div className="section-title">Clasificación de platos</div>
      {ranked.map((r, i) => (
        <div className={'rank-row fadein ' + (i === 0 ? 'first' : '')} style={{ animationDelay: `${i * 0.05}s` }} key={r.dish.id}>
          <span className="rank-pos">{i + 1}</span>
          <span className="rank-emoji">{r.dish.emoji}</span>
          <div className="rank-info">
            <div className="rank-name">{r.dish.name}</div>
            <div className="rank-meta">
              {isShared(r.dish) ? '🤝 Compartido' : '👤 Individual'} · {r.nVotes}/{r.expected} votos
            </div>
          </div>
          <span className="rank-score">{r.overall.toFixed(1)}</span>
        </div>
      ))}

      <div className="section-title">📈 Comparativa por aspecto</div>
      <LineChart ranked={ranked} />

      <div className="section-title">Detalle por plato</div>
      {ranked.map((r) => (
        <div className="stat-card" key={r.dish.id}>
          <div className="stat-head">
            <span className="e">{r.dish.emoji}</span>
            <span className="n">{r.dish.name}</span>
            <span className="avg">{r.overall.toFixed(1)}</span>
          </div>
          {CRITERIA.map((cr) => (
            <div className="bar-row" key={cr.id}>
              <div className="bar-top"><span>{cr.emoji} {cr.label}</span><span className="v">{r.perCriterion[cr.id].toFixed(1)}</span></div>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${(r.perCriterion[cr.id] / MAX_SCORE) * 100}%` }} /></div>
            </div>
          ))}
        </div>
      ))}

      <div className="section-title">Mejor en cada aspecto</div>
      <div className="stat-card">
        {CRITERIA.map((cr) => {
          const w = criterionWinner(ranked, cr.id)
          return (
            <div className="bar-row" key={cr.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{cr.emoji} {cr.label}</span>
              <span className="v" style={{ fontSize: 14 }}>{w ? `${w.dish.emoji} ${w.dish.name} · ${w.perCriterion[cr.id].toFixed(1)}` : '—'}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PerPersonResults({ votes }) {
  if (!votes.length) return <p className="center muted" style={{ marginTop: 30 }}>Todavía no hay votos.</p>
  return (
    <div className="fadein">
      <div className="section-title">Lo que puntuó cada comensal</div>
      {votes.map((v, idx) => {
        const dishes = DISHES.filter((d) => v.scores?.[d.id] && CRITERIA.some((cr) => typeof v.scores[d.id][cr.id] === 'number'))
        const allVals = []
        dishes.forEach((d) => CRITERIA.forEach((cr) => { const x = v.scores[d.id]?.[cr.id]; if (typeof x === 'number') allVals.push(x) }))
        const avg = allVals.length ? allVals.reduce((a, b) => a + b, 0) / allVals.length : 0
        const fav = dishes.map((d) => ({ d, a: dishAverage(v.scores[d.id]) })).sort((a, b) => b.a - a.a)[0]
        return (
          <div className="person-card fadein" style={{ animationDelay: `${idx * 0.06}s` }} key={idx}>
            <div className="person-head">
              <span className="person-avatar">{(v.person || '?').trim().charAt(0).toUpperCase()}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="person-name">{v.person}</div>
                {fav && <div className="person-meta">Su favorito: {fav.d.emoji} {fav.d.name}</div>}
              </div>
              <span className="person-avg">{avg.toFixed(1)}</span>
            </div>
            {dishes.map((d) => (
              <div className="person-cake" key={d.id}>
                <div className="person-cake-top">
                  <span>{d.emoji} {d.name}</span>
                  <span className="pc-avg" style={{ color: scoreColor(dishAverage(v.scores[d.id])) }}>{dishAverage(v.scores[d.id]).toFixed(1)}</span>
                </div>
                <div className="review-crit">
                  {CRITERIA.map((cr) => {
                    const val = v.scores[d.id]?.[cr.id]
                    return <span className="score-tag" key={cr.id} style={{ background: scoreColor(val), color: '#fff' }}>{cr.label} <b>{typeof val === 'number' ? val : '–'}</b></span>
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

/* Line chart: one line per dish across the aspects */
function LineChart({ ranked }) {
  const W = 340, H = 224, pL = 30, pR = 330, pT = 14, pB = 184
  const n = CRITERIA.length
  const xFor = (i) => (n <= 1 ? (pL + pR) / 2 : pL + (i * (pR - pL)) / (n - 1))
  const yFor = (v) => pB - (v / MAX_SCORE) * (pB - pT)
  const anchor = (i) => (i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle')
  const palette = ['#3f80b3', '#e0b15a', '#6fb1a6', '#2a4866', '#9b6dd6', '#d97c5a', '#5aa0d0', '#c0556b']
  const colorFor = (i) => palette[i % palette.length]
  return (
    <div className="chart-card">
      <svg viewBox={`0 0 ${W} ${H}`} className="linechart" role="img" aria-label="Comparativa de platos por aspecto">
        {[0, 2, 4, 6, 8, 10].map((t) => (
          <g key={t}><line x1={pL} y1={yFor(t)} x2={pR} y2={yFor(t)} className="grid" /><text x={pL - 7} y={yFor(t) + 3} className="ytick">{t}</text></g>
        ))}
        {CRITERIA.map((cr, i) => <text key={cr.id} x={xFor(i)} y={pB + 20} className="xtick" textAnchor={anchor(i)}>{cr.label}</text>)}
        {ranked.map((r, di) => {
          const pts = CRITERIA.map((cr, i) => `${xFor(i)},${yFor(r.perCriterion[cr.id])}`).join(' ')
          return <polyline key={r.dish.id} className="cakeline" points={pts} fill="none" stroke={colorFor(di)} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        })}
        {ranked.map((r, di) => CRITERIA.map((cr, i) => (
          <circle key={r.dish.id + cr.id} cx={xFor(i)} cy={yFor(r.perCriterion[cr.id])} r="3.4" fill={colorFor(di)} stroke="#fff" strokeWidth="1.4" />
        )))}
      </svg>
      <div className="legend">
        {ranked.map((r, di) => (
          <span className="legend-item" key={r.dish.id}><span className="legend-dot" style={{ background: colorFor(di) }} />{r.dish.emoji} {r.dish.name}</span>
        ))}
      </div>
    </div>
  )
}

function PodiumScore({ value }) { const v = useCountUp(value, [value]); return <div className="podium-score">{v.toFixed(1)}</div> }

function criterionWinner(ranked, cid) {
  let w = null
  ranked.forEach((r) => { if (!w || r.perCriterion[cid] > w.perCriterion[cid]) w = r })
  return w && w.perCriterion[cid] > 0 ? w : null
}
