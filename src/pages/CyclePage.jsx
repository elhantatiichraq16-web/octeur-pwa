import { useState, useMemo } from 'react'
import { useUserData } from '../hooks/useUserData'

// Probabilité de grossesse selon le jour du cycle (ovulation = dureeCycle - 14)
function getPregnancyChance(dayInCycle, dureeCycle) {
  const ovDay = dureeCycle - 14
  const diff = dayInCycle - ovDay
  if (diff === 0) return { pct: 33, label: 'Très élevée', color: '#ef4444', emoji: '🔴' }
  if (diff === -1 || diff === 1) return { pct: 28, label: 'Très élevée', color: '#ef4444', emoji: '🔴' }
  if (diff === -2 || diff === 2) return { pct: 18, label: 'Élevée', color: '#f97316', emoji: '🟠' }
  if (diff === -3) return { pct: 8, label: 'Modérée', color: '#eab308', emoji: '🟡' }
  if (diff === -4 || diff === -5) return { pct: 3, label: 'Faible', color: '#22c55e', emoji: '🟢' }
  return { pct: 1, label: 'Très faible', color: '#6b7280', emoji: '⚪' }
}

const SYMPTOMES = [
  { label: 'Crampes', emoji: '😣' },
  { label: 'Maux de tête', emoji: '🤕' },
  { label: 'Fatigue', emoji: '😴' },
  { label: 'Ballonnements', emoji: '😮‍💨' },
  { label: 'Irritabilité', emoji: '😤' },
  { label: 'Nausées', emoji: '🤢' },
  { label: 'Douleurs dos', emoji: '🔙' },
  { label: 'Sautes d\'humeur', emoji: '😢' },
  { label: 'Seins sensibles', emoji: '💗' },
  { label: 'Acné', emoji: '😬' },
  { label: 'Insomnie', emoji: '🌙' },
  { label: 'Appétit accru', emoji: '🍫' },
]
const INTENSITES = ['Légère', 'Modérée', 'Abondante', 'Très abondante']
const INTENSITE_COLORS = {
  'Légère': '#93c5fd',
  'Modérée': '#ec4899',
  'Abondante': '#be185d',
  'Très abondante': '#831843',
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}
function fmt(date) {
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}
function fmtFull(date) {
  return new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}
function daysUntil(date) {
  const today = new Date(); today.setHours(0,0,0,0)
  const target = new Date(date); target.setHours(0,0,0,0)
  return Math.round((target - today) / 86400000)
}
function daysSince(date) {
  const today = new Date(); today.setHours(0,0,0,0)
  const target = new Date(date); target.setHours(0,0,0,0)
  return Math.round((today - target) / 86400000)
}
function getCyclePhase(cycle) {
  const since = daysSince(cycle.dateDebut)
  if (since < 0) return null
  if (since < cycle.dureeFlux) return 'menstruation'
  if (since < 7) return 'folliculaire'
  const ovDay = cycle.dureeCycle - 14
  if (since >= ovDay - 2 && since <= ovDay + 2) return 'ovulation'
  if (since < ovDay) return 'folliculaire'
  if (since < cycle.dureeCycle) return 'lutéale'
  return 'prochain'
}

const PHASE_INFO = {
  menstruation: { label: 'Règles en cours', color: '#ec4899', bg: '#fdf2f8', emoji: '🩸', desc: 'Prenez soin de vous, reposez-vous et hydratez-vous.' },
  folliculaire: { label: 'Phase folliculaire', color: '#3b82f6', bg: '#eff6ff', emoji: '🌱', desc: 'Énergie en hausse, bon moment pour l\'exercice et les nouveaux projets.' },
  ovulation: { label: 'Période d\'ovulation', color: '#f59e0b', bg: '#fffbeb', emoji: '✨', desc: 'Pic de fertilité. Énergie maximale et humeur positive.' },
  lutéale: { label: 'Phase lutéale', color: '#8b5cf6', bg: '#f5f3ff', emoji: '🌙', desc: 'Ralentissez, favorisez le repos et la récupération.' },
  prochain: { label: 'Nouveau cycle attendu', color: '#6b7280', bg: '#f9fafb', emoji: '🔄', desc: 'Votre prochain cycle devrait commencer bientôt.' },
}

export default function CyclePage({ userEmail }) {
  const [cycles, setCycles] = useUserData('cycles', [], userEmail)
  const [grossesse, setGrossesse] = useUserData('grossesse', null, userEmail)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [activeTab, setActiveTab] = useState('apercu')
  const [showGrossesseModal, setShowGrossesseModal] = useState(false)

  const last = cycles[0]

  function deleteCycle(i) {
    if (!window.confirm('Supprimer ce cycle ?')) return
    setCycles(prev => prev.filter((_, idx) => idx !== i))
  }

  function saveCycle(data) {
    if (editing !== null) {
      setCycles(prev => prev.map((c, i) => i === editing ? data : c))
    } else {
      setCycles(prev => [data, ...prev])
    }
    setShowAdd(false)
    setEditing(null)
  }

  return (
    <div style={{ background: '#fdf2f8', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ background: 'white', padding: '16px 16px 0', borderBottom: '1px solid #fbcfe8', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>Mon Cycle 🌸</h1>
            <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>Suivi menstruel personnalisé</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            style={{ background: 'var(--pink)', color: 'white', borderRadius: 12, padding: '8px 14px', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            + Ajouter
          </button>
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderTop: '1px solid #fbcfe8' }}>
          {[
            { id: 'apercu', label: 'Aperçu' },
            { id: 'calendrier', label: 'Calendrier' },
            { id: 'historique', label: 'Historique' },
            { id: 'stats', label: 'Statistiques' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                flex: 1, padding: '10px 4px', fontSize: 12, fontWeight: 600,
                color: activeTab === t.id ? 'var(--pink)' : 'var(--gray-400)',
                borderBottom: activeTab === t.id ? '2px solid var(--pink)' : '2px solid transparent',
                transition: 'all .2s'
              }}
            >{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Bannière grossesse active */}
        {grossesse && (
          <GrossesseBanner grossesse={grossesse} onStop={() => { if (window.confirm('Terminer le suivi grossesse ?')) setGrossesse(null) }} />
        )}

        {!last && !grossesse ? (
          <EmptyState onAdd={() => setShowAdd(true)} />
        ) : grossesse ? (
          <TabGrossesse grossesse={grossesse} />
        ) : (
          <>
            {activeTab === 'apercu' && (
              <TabApercu cycle={last} onGrossesse={() => setShowGrossesseModal(true)} />
            )}
            {activeTab === 'calendrier' && <TabCalendrier cycle={last} />}
            {activeTab === 'historique' && (
              <TabHistorique cycles={cycles} onEdit={i => setEditing(i)} onDelete={deleteCycle} />
            )}
            {activeTab === 'stats' && <TabStats cycles={cycles} />}
          </>
        )}
      </div>

      {(showAdd || editing !== null) && (
        <AddCycleSheet
          initial={editing !== null ? cycles[editing] : null}
          onClose={() => { setShowAdd(false); setEditing(null) }}
          onSave={saveCycle}
        />
      )}
      {showGrossesseModal && (
        <GrossesseModal
          onClose={() => setShowGrossesseModal(false)}
          onConfirm={(data) => { setGrossesse(data); setShowGrossesseModal(false) }}
        />
      )}
    </div>
  )
}

/* ── Tab Aperçu ─────────────────────────────────────── */
function TabApercu({ cycle, onGrossesse }) {
  if (!cycle.dateDebut || !cycle.dureeCycle) return null

  const phase = getCyclePhase(cycle)
  const info = PHASE_INFO[phase] || PHASE_INFO.folliculaire
  const prochainCycle = addDays(cycle.dateDebut, cycle.dureeCycle)
  const ovulation = addDays(cycle.dateDebut, cycle.dureeCycle - 14)
  const fertileDebut = addDays(cycle.dateDebut, cycle.dureeCycle - 16)
  const fertileFin = addDays(cycle.dateDebut, cycle.dureeCycle - 12)
  const jRestants = daysUntil(prochainCycle)
  const jOvulation = daysUntil(ovulation)
  const since = daysSince(cycle.dateDebut)
  const progress = Math.min(100, Math.round((since / cycle.dureeCycle) * 100))
  const retard = since - cycle.dureeCycle // positif = retard en jours
  const chance = since >= 0 ? getPregnancyChance(since, cycle.dureeCycle) : null

  return (
    <>
      {/* Phase actuelle */}
      <div style={{ background: info.bg, border: `1.5px solid ${info.color}30`, borderRadius: 18, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 32 }}>{info.emoji}</span>
          <div>
            <p style={{ fontSize: 11, color: info.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Phase actuelle</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#1f2937', marginTop: 1 }}>{info.label}</p>
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.5 }}>{info.desc}</p>

        {/* Barre de progression du cycle */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600 }}>Jour {since + 1} / {cycle.dureeCycle}</span>
            <span style={{ fontSize: 11, color: info.color, fontWeight: 700 }}>{progress}%</span>
          </div>
          <div style={{ height: 8, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${info.color}99, ${info.color})`, borderRadius: 99, transition: 'width 0.5s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>{fmt(cycle.dateDebut)}</span>
            <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>{fmt(prochainCycle)}</span>
          </div>
        </div>
      </div>

      {/* Countdown cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <CountdownCard
          emoji="🩸"
          label="Prochain cycle"
          value={jRestants <= 0 ? 'Aujourd\'hui' : `Dans ${jRestants}j`}
          sub={fmt(prochainCycle)}
          color="#ec4899"
          bg="#fdf2f8"
        />
        <CountdownCard
          emoji="✨"
          label="Ovulation"
          value={jOvulation < 0 ? `Il y a ${Math.abs(jOvulation)}j` : jOvulation === 0 ? 'Aujourd\'hui' : `Dans ${jOvulation}j`}
          sub={fmt(ovulation)}
          color="#f59e0b"
          bg="#fffbeb"
        />
      </div>

      {/* Infos cycle */}
      <div style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: 'var(--shadow)' }}>
        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>📋 Détails du cycle</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <InfoRow label="Début des règles" value={fmtFull(cycle.dateDebut)} />
          <InfoRow label="Durée du flux" value={`${cycle.dureeFlux} jours`} />
          <InfoRow label="Durée du cycle" value={`${cycle.dureeCycle} jours`} />
          <InfoRow label="Intensité" value={cycle.intensite} valueColor={INTENSITE_COLORS[cycle.intensite]} />
          <InfoRow label="Fenêtre fertile" value={`${fmt(fertileDebut)} → ${fmt(fertileFin)}`} valueColor="#f59e0b" />
        </div>
      </div>

      {/* Symptômes */}
      <div style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: 'var(--shadow)' }}>
        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>🤒 Symptômes enregistrés</p>
        {!cycle.symptomes?.length
          ? <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Aucun symptôme enregistré pour ce cycle</p>
          : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {cycle.symptomes.map(s => {
                const sym = SYMPTOMES.find(x => x.label === s)
                return (
                  <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fdf2f8', color: 'var(--pink)', borderRadius: 99, padding: '5px 10px', fontSize: 12, fontWeight: 600, border: '1px solid #fbcfe8' }}>
                    {sym?.emoji} {s}
                  </span>
                )
              })}
            </div>
        }
      </div>

      {/* Alerte retard de règles */}
      {retard >= 5 && (
        <div style={{ background: '#fff7ed', border: '2px solid #fed7aa', borderRadius: 16, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>⚠️</span>
            <div>
              <p style={{ fontWeight: 800, fontSize: 15, color: '#c2410c' }}>Retard de {retard} jours</p>
              <p style={{ fontSize: 12, color: '#9a3412', marginTop: 2 }}>Vos règles étaient prévues le {fmt(prochainCycle)}</p>
            </div>
          </div>
          <p style={{ fontSize: 13, color: '#7c2d12', lineHeight: 1.5 }}>
            Un retard peut être causé par le stress, un changement de poids, la fatigue ou une grossesse. Nous vous recommandons de faire un test de grossesse.
          </p>
          <button
            onClick={onGrossesse}
            style={{ marginTop: 12, width: '100%', padding: '11px', borderRadius: 12, background: '#f97316', color: 'white', fontWeight: 700, fontSize: 14 }}
          >
            🤰 Je pense être enceinte
          </button>
        </div>
      )}

      {/* Alerte retard léger */}
      {retard >= 1 && retard < 5 && (
        <div style={{ background: '#fefce8', border: '1.5px solid #fde68a', borderRadius: 14, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>🕐</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#92400e' }}>Règles en retard de {retard} jour{retard > 1 ? 's' : ''}</p>
              <p style={{ fontSize: 12, color: '#78350f', marginTop: 2 }}>Attendez encore quelques jours avant de faire un test.</p>
            </div>
          </div>
        </div>
      )}

      {/* Carte probabilité grossesse */}
      {chance && retard < 1 && (
        <div style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: 'var(--shadow)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontWeight: 700, fontSize: 15 }}>🤰 Probabilité de grossesse</p>
            <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>Aujourd'hui</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${chance.color}20`, border: `3px solid ${chance.color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 18 }}>{chance.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: chance.color }}>{chance.pct}%</span>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, color: chance.color }}>{chance.label}</p>
              <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 3, lineHeight: 1.5 }}>
                {chance.pct >= 20
                  ? 'Vous êtes dans votre fenêtre fertile. Si vous ne souhaitez pas de grossesse, utilisez une contraception.'
                  : chance.pct >= 8
                  ? 'Risque modéré. La fenêtre fertile approche ou vient de passer.'
                  : 'Faible risque. Hors période fertile du cycle.'}
              </p>
            </div>
          </div>
          {/* Barre de risque */}
          <div style={{ marginTop: 12 }}>
            <div style={{ height: 6, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${chance.pct * 3}%`, background: `linear-gradient(90deg, #22c55e, ${chance.color})`, borderRadius: 99, transition: 'width .5s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
              <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>0% — Infertile</span>
              <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>33% — Ovulation</span>
            </div>
          </div>
          <button
            onClick={onGrossesse}
            style={{ marginTop: 12, width: '100%', padding: '10px', borderRadius: 10, background: '#fdf2f8', color: 'var(--pink)', fontWeight: 700, fontSize: 13, border: '1px solid #fbcfe8' }}
          >
            🤰 Je suis enceinte — Démarrer le suivi grossesse
          </button>
        </div>
      )}

      {/* Conseils */}
      <ConseilsCard phase={phase} />
    </>
  )
}

/* ── Tab Calendrier ──────────────────────────────────── */
function TabCalendrier({ cycle }) {
  if (!cycle.dateDebut || !cycle.dureeCycle) return null

  const today = new Date(); today.setHours(0,0,0,0)
  const debut = new Date(cycle.dateDebut); debut.setHours(0,0,0,0)
  const finFlux = addDays(cycle.dateDebut, cycle.dureeFlux - 1)
  const ovulation = addDays(cycle.dateDebut, cycle.dureeCycle - 14)
  const fertileDebut = addDays(cycle.dateDebut, cycle.dureeCycle - 16)
  const fertileFin = addDays(cycle.dateDebut, cycle.dureeCycle - 12)
  const prochainCycle = addDays(cycle.dateDebut, cycle.dureeCycle)

  // Build days array from cycle start
  const days = Array.from({ length: cycle.dureeCycle }, (_, i) => {
    const d = addDays(cycle.dateDebut, i)
    d.setHours(0,0,0,0)
    const isToday = d.getTime() === today.getTime()
    const isFlux = d <= new Date(finFlux).setHours(0,0,0,0)
    const isFertile = d >= new Date(fertileDebut).setHours(0,0,0,0) && d <= new Date(fertileFin).setHours(0,0,0,0)
    const isOvulation = d.getTime() === new Date(ovulation).setHours(0,0,0,0)
    return { date: d, day: i + 1, isToday, isFlux, isFertile, isOvulation }
  })

  function getDayStyle(d) {
    if (d.isOvulation) return { bg: '#f59e0b', color: 'white', border: 'none' }
    if (d.isFlux) return { bg: '#ec4899', color: 'white', border: 'none' }
    if (d.isFertile) return { bg: '#fef3c7', color: '#92400e', border: '1.5px solid #fcd34d' }
    if (d.isToday) return { bg: '#eff6ff', color: '#1d4ed8', border: '2px solid #3b82f6' }
    return { bg: '#f9fafb', color: '#374151', border: '1px solid #e5e7eb' }
  }

  const monthNames = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']
  const dayNames = ['D','L','M','M','J','V','S']

  return (
    <>
      <div style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: 'var(--shadow)' }}>
        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>📅 Calendrier du cycle</p>
        <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 14 }}>
          {fmt(debut)} → {fmt(prochainCycle)} ({cycle.dureeCycle} jours)
        </p>

        {/* Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {[
            { color: '#ec4899', label: 'Règles' },
            { color: '#f59e0b', label: 'Ovulation' },
            { color: '#fef3c7', label: 'Fertile', border: '#fcd34d' },
            { color: '#eff6ff', label: "Auj.", border: '#3b82f6' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: l.color, border: l.border ? `1.5px solid ${l.border}` : 'none' }} />
              <span style={{ fontSize: 11, color: 'var(--gray-600)' }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {dayNames.map(n => (
            <div key={n} style={{ textAlign: 'center', fontSize: 10, color: 'var(--gray-400)', fontWeight: 700, paddingBottom: 4 }}>{n}</div>
          ))}
          {/* Offset for first day */}
          {Array.from({ length: debut.getDay() }, (_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((d) => {
            const s = getDayStyle(d)
            return (
              <div key={d.day} style={{
                aspectRatio: '1',
                borderRadius: 8,
                background: s.bg,
                color: s.color,
                border: s.border || 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: d.isToday || d.isOvulation ? 800 : 600,
                position: 'relative',
              }}>
                <span>{d.date.getDate()}</span>
                {d.isOvulation && <span style={{ fontSize: 7, marginTop: 1 }}>OV</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Événements clés */}
      <div style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: 'var(--shadow)' }}>
        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>📌 Événements clés</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <EventRow emoji="🩸" label="Début des règles" date={cycle.dateDebut} color="#ec4899" />
          <EventRow emoji="🩸" label="Fin des règles" date={finFlux} color="#ec4899" />
          <EventRow emoji="🌱" label="Début fenêtre fertile" date={fertileDebut} color="#f59e0b" />
          <EventRow emoji="✨" label="Ovulation" date={ovulation} color="#f59e0b" highlight />
          <EventRow emoji="🌙" label="Fin fenêtre fertile" date={fertileFin} color="#f59e0b" />
          <EventRow emoji="🔄" label="Prochain cycle" date={prochainCycle} color="#ec4899" />
        </div>
      </div>
    </>
  )
}

/* ── Tab Historique ──────────────────────────────────── */
function TabHistorique({ cycles, onEdit, onDelete }) {
  const [viewing, setViewing] = useState(null)

  return (
    <>
      <div style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: 'var(--shadow)' }}>
        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>📋 Historique des cycles</p>
        {cycles.length === 0
          ? <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Aucun cycle enregistré</p>
          : cycles.map((c, i) => (
            <div key={i} style={{
              padding: '14px 0',
              borderBottom: i < cycles.length - 1 ? '1px solid #fce7f3' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  🩸
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>
                      {fmtFull(c.dateDebut)}
                    </p>
                    {i === 0 && (
                      <span style={{ fontSize: 10, background: '#dcfce7', color: '#16a34a', borderRadius: 99, padding: '2px 8px', fontWeight: 700 }}>
                        Actuel
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                    <span style={{ fontSize: 11, background: '#fdf2f8', color: 'var(--pink)', borderRadius: 99, padding: '3px 8px', fontWeight: 600 }}>
                      Flux : {c.dureeFlux}j
                    </span>
                    <span style={{ fontSize: 11, background: '#eff6ff', color: 'var(--blue)', borderRadius: 99, padding: '3px 8px', fontWeight: 600 }}>
                      Cycle : {c.dureeCycle}j
                    </span>
                    <span style={{ fontSize: 11, background: '#f9fafb', color: INTENSITE_COLORS[c.intensite] || 'var(--gray-600)', borderRadius: 99, padding: '3px 8px', fontWeight: 600, border: '1px solid #e5e7eb' }}>
                      {c.intensite}
                    </span>
                  </div>
                  {c.symptomes?.length > 0 && (
                    <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 5 }}>
                      {c.symptomes.slice(0, 3).join(' · ')}{c.symptomes.length > 3 ? ` +${c.symptomes.length - 3}` : ''}
                    </p>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, paddingLeft: 52 }}>
                <button
                  onClick={() => setViewing(i)}
                  style={{ flex: 1, padding: '7px', borderRadius: 8, background: '#fdf2f8', color: 'var(--pink)', fontWeight: 700, fontSize: 12 }}
                >
                  👁 Voir
                </button>
                <button
                  onClick={() => onEdit(i)}
                  style={{ flex: 1, padding: '7px', borderRadius: 8, background: '#eff6ff', color: 'var(--blue)', fontWeight: 700, fontSize: 12 }}
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => onDelete(i)}
                  style={{ flex: 1, padding: '7px', borderRadius: 8, background: '#fee2e2', color: 'var(--red)', fontWeight: 700, fontSize: 12 }}
                >
                  🗑 Supprimer
                </button>
              </div>
            </div>
          ))
        }
      </div>

      {viewing !== null && (
        <CycleDetailModal
          cycle={cycles[viewing]}
          index={viewing}
          total={cycles.length}
          onClose={() => setViewing(null)}
          onEdit={() => { onEdit(viewing); setViewing(null) }}
          onDelete={() => { onDelete(viewing); setViewing(null) }}
        />
      )}
    </>
  )
}

/* ── Modal détail d'un cycle ─────────────────────────── */
function CycleDetailModal({ cycle, index, total, onClose, onEdit, onDelete }) {
  const ovulation = addDays(cycle.dateDebut, cycle.dureeCycle - 14)
  const finFlux = addDays(cycle.dateDebut, cycle.dureeFlux - 1)
  const fertileDebut = addDays(cycle.dateDebut, cycle.dureeCycle - 16)
  const fertileFin = addDays(cycle.dateDebut, cycle.dureeCycle - 12)
  const finCycle = addDays(cycle.dateDebut, cycle.dureeCycle - 1)

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '92vh' }}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <div>
            <h2 style={{ color: 'var(--pink)' }}>🩸 Détail du cycle</h2>
            <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>
              Cycle {total - index} sur {total}
            </p>
          </div>
          <button onClick={onClose} style={{ fontSize: 22, color: 'var(--gray-400)' }}>×</button>
        </div>

        <div style={{ padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* En-tête date */}
          <div style={{ background: 'linear-gradient(135deg, #fdf2f8, #fce7f3)', borderRadius: 14, padding: 14, border: '1px solid #fbcfe8', textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: 'var(--pink)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Début des règles</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#1f2937', marginTop: 4 }}>{fmtFull(cycle.dateDebut)}</p>
            {index === 0 && <span style={{ fontSize: 11, background: '#dcfce7', color: '#16a34a', borderRadius: 99, padding: '3px 10px', fontWeight: 700, display: 'inline-block', marginTop: 6 }}>Cycle actuel</span>}
          </div>

          {/* Durées */}
          <div style={{ background: 'white', borderRadius: 14, padding: 14, boxShadow: 'var(--shadow)' }}>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>📏 Durées</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Durée du flux', value: `${cycle.dureeFlux} jours`, color: '#ec4899', bg: '#fdf2f8', emoji: '🩸' },
                { label: 'Durée du cycle', value: `${cycle.dureeCycle} jours`, color: '#3b82f6', bg: '#eff6ff', emoji: '🔄' },
              ].map(({ label, value, color, bg, emoji }) => (
                <div key={label} style={{ background: bg, borderRadius: 10, padding: 12, textAlign: 'center' }}>
                  <span style={{ fontSize: 22 }}>{emoji}</span>
                  <p style={{ fontSize: 18, fontWeight: 800, color, marginTop: 4 }}>{value}</p>
                  <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Intensité */}
          <div style={{ background: 'white', borderRadius: 14, padding: 14, boxShadow: 'var(--shadow)' }}>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>💧 Intensité du flux</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: INTENSITE_COLORS[cycle.intensite] || '#9ca3af', flexShrink: 0 }} />
              <p style={{ fontSize: 16, fontWeight: 700, color: INTENSITE_COLORS[cycle.intensite] || '#374151' }}>{cycle.intensite}</p>
            </div>
          </div>

          {/* Dates clés */}
          <div style={{ background: 'white', borderRadius: 14, padding: 14, boxShadow: 'var(--shadow)' }}>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>📅 Dates clés</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { emoji: '🩸', label: 'Début des règles', date: cycle.dateDebut, color: '#ec4899' },
                { emoji: '🩸', label: 'Fin des règles', date: finFlux, color: '#ec4899' },
                { emoji: '🌱', label: 'Début fenêtre fertile', date: fertileDebut, color: '#f59e0b' },
                { emoji: '✨', label: 'Ovulation estimée', date: ovulation, color: '#f59e0b', highlight: true },
                { emoji: '🌙', label: 'Fin fenêtre fertile', date: fertileFin, color: '#f59e0b' },
                { emoji: '🔄', label: 'Fin du cycle', date: finCycle, color: '#8b5cf6' },
              ].map(({ emoji, label, date, color, highlight }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: highlight ? '#fffbeb' : '#fafafa', border: `1px solid ${highlight ? '#fcd34d' : '#f3f4f6'}` }}>
                  <span style={{ fontSize: 16 }}>{emoji}</span>
                  <p style={{ flex: 1, fontSize: 12, color: '#374151', fontWeight: 500 }}>{label}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color }}>{fmt(date)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Symptômes */}
          <div style={{ background: 'white', borderRadius: 14, padding: 14, boxShadow: 'var(--shadow)' }}>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>🤒 Symptômes</p>
            {!cycle.symptomes?.length
              ? <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>Aucun symptôme enregistré</p>
              : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {cycle.symptomes.map(s => {
                    const sym = SYMPTOMES.find(x => x.label === s)
                    return (
                      <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fdf2f8', color: 'var(--pink)', borderRadius: 99, padding: '6px 12px', fontSize: 13, fontWeight: 600, border: '1px solid #fbcfe8' }}>
                        {sym?.emoji} {s}
                      </span>
                    )
                  })}
                </div>
            }
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onEdit}
              style={{ flex: 1, padding: '12px', borderRadius: 12, background: '#eff6ff', color: 'var(--blue)', fontWeight: 700, fontSize: 14 }}
            >
              ✏️ Modifier
            </button>
            <button
              onClick={onDelete}
              style={{ flex: 1, padding: '12px', borderRadius: 12, background: '#fee2e2', color: 'var(--red)', fontWeight: 700, fontSize: 14 }}
            >
              🗑 Supprimer
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

/* ── Tab Statistiques ────────────────────────────────── */
function TabStats({ cycles }) {
  const stats = useMemo(() => {
    if (cycles.length === 0) return null
    const durees = cycles.map(c => c.dureeCycle).filter(Boolean)
    const flux = cycles.map(c => c.dureeFlux).filter(Boolean)
    const avg = arr => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
    const min = arr => Math.min(...arr)
    const max = arr => Math.max(...arr)

    // Symptôme fréquence
    const symCount = {}
    cycles.forEach(c => c.symptomes?.forEach(s => { symCount[s] = (symCount[s] || 0) + 1 }))
    const topSymptomes = Object.entries(symCount).sort((a, b) => b[1] - a[1]).slice(0, 4)

    // Intensité fréquence
    const intCount = {}
    cycles.forEach(c => { if (c.intensite) intCount[c.intensite] = (intCount[c.intensite] || 0) + 1 })
    const topIntensite = Object.entries(intCount).sort((a, b) => b[1] - a[1])[0]

    return { durees, flux, avg, min, max, topSymptomes, topIntensite, total: cycles.length }
  }, [cycles])

  if (!stats) return <p style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 20 }}>Pas assez de données</p>

  return (
    <>
      <div style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: 'var(--shadow)' }}>
        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>📊 Statistiques générales</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <StatCard label="Cycles enregistrés" value={stats.total} emoji="📝" color="#3b82f6" />
          <StatCard label="Durée moy. cycle" value={`${stats.avg(stats.durees)}j`} emoji="🔄" color="#ec4899" />
          <StatCard label="Durée moy. flux" value={`${stats.avg(stats.flux)}j`} emoji="🩸" color="#be185d" />
          <StatCard label="Intensité fréquente" value={stats.topIntensite?.[0] || '—'} emoji="💧" color="#8b5cf6" small />
        </div>
      </div>

      {stats.durees.length > 1 && (
        <div style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: 'var(--shadow)' }}>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>📈 Régularité du cycle</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <InfoRow label="Plus court" value={`${stats.min(stats.durees)} jours`} />
            <InfoRow label="Plus long" value={`${stats.max(stats.durees)} jours`} />
            <InfoRow label="Variation" value={`±${stats.max(stats.durees) - stats.min(stats.durees)} jours`} />
          </div>
          {/* Mini bar chart */}
          <div style={{ marginTop: 14 }}>
            <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 8 }}>Durée des cycles (du plus récent)</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60 }}>
              {stats.durees.slice(0, 8).map((d, i) => {
                const h = Math.round((d / 35) * 100)
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <span style={{ fontSize: 9, color: 'var(--gray-400)' }}>{d}</span>
                    <div style={{ width: '100%', height: `${h}%`, background: i === 0 ? 'var(--pink)' : '#fbcfe8', borderRadius: '4px 4px 0 0', minHeight: 4 }} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {stats.topSymptomes.length > 0 && (
        <div style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: 'var(--shadow)' }}>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>🤒 Symptômes les plus fréquents</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats.topSymptomes.map(([sym, count]) => {
              const info = SYMPTOMES.find(s => s.label === sym)
              const pct = Math.round((count / stats.total) * 100)
              return (
                <div key={sym}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{info?.emoji} {sym}</span>
                    <span style={{ fontSize: 12, color: 'var(--pink)', fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div style={{ height: 6, background: '#fce7f3', borderRadius: 99 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--pink)', borderRadius: 99 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

/* ── Composants helper ───────────────────────────────── */
function CountdownCard({ emoji, label, value, sub, color, bg }) {
  return (
    <div style={{ background: bg, border: `1px solid ${color}30`, borderRadius: 14, padding: 14 }}>
      <span style={{ fontSize: 24 }}>{emoji}</span>
      <p style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 600, marginTop: 6, textTransform: 'uppercase' }}>{label}</p>
      <p style={{ fontSize: 16, fontWeight: 800, color, marginTop: 2 }}>{value}</p>
      <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>{sub}</p>
    </div>
  )
}

function InfoRow({ label, value, valueColor }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #fce7f3' }}>
      <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: valueColor || '#1f2937' }}>{value}</span>
    </div>
  )
}

function EventRow({ emoji, label, date, color, highlight }) {
  const jours = daysUntil(date)
  const passé = jours < 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: highlight ? '#fffbeb' : passé ? '#f9fafb' : 'white', border: highlight ? '1.5px solid #fcd34d' : '1px solid #f3f4f6' }}>
      <span style={{ fontSize: 18 }}>{emoji}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: passé ? 'var(--gray-400)' : '#1f2937' }}>{label}</p>
        <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 1 }}>{fmtFull(date)}</p>
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: passé ? 'var(--gray-400)' : color }}>
        {passé ? `il y a ${Math.abs(jours)}j` : jours === 0 ? "Auj." : `J+${jours}`}
      </span>
    </div>
  )
}

function StatCard({ label, value, emoji, color, small }) {
  return (
    <div style={{ background: '#fdf2f8', borderRadius: 12, padding: 14, textAlign: 'center', border: '1px solid #fbcfe8' }}>
      <span style={{ fontSize: 24 }}>{emoji}</span>
      <p style={{ fontSize: small ? 13 : 22, fontWeight: 800, color, marginTop: 4 }}>{value}</p>
      <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>{label}</p>
    </div>
  )
}

function ConseilsCard({ phase }) {
  const conseils = {
    menstruation: ['💧 Boire au moins 2L d\'eau par jour', '🛁 Chaleur sur le ventre pour les crampes', '🧘 Évitez les sports intenses', '🍫 Magnésium aide contre les crampes'],
    folliculaire: ['🏃 Bon moment pour le sport intense', '🥗 Alimentation riche en fer', '💪 Énergie maximale, profitez-en', '😊 Humeur stable et positive'],
    ovulation: ['🌡️ Température basale légèrement élevée', '🤍 Pic de fertilité sur 24-48h', '✨ Énergie et libido au maximum', '📱 Notez vos symptômes d\'ovulation'],
    lutéale: ['😴 Favorisez le repos', '🍵 Tisanes apaisantes recommandées', '🧘 Yoga et méditation bénéfiques', '🍬 Envies de sucre normales, modérez'],
    prochain: ['📅 Préparez vos protections hygiéniques', '💊 Prenez de l\'ibuprofène si besoin', '🛌 Bonne nuit de sommeil conseillée', '📝 Notez la date d\'arrivée'],
  }
  const list = conseils[phase] || conseils.folliculaire
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: 'var(--shadow)' }}>
      <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>💡 Conseils pour cette phase</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {list.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', background: '#fdf2f8', borderRadius: 10 }}>
            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.4 }}>{c}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Empty State ─────────────────────────────────────── */
function EmptyState({ onAdd }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: 20, boxShadow: 'var(--shadow)' }}>
      <span style={{ fontSize: 64 }}>🌸</span>
      <p style={{ fontWeight: 700, fontSize: 18, marginTop: 16, color: '#1f2937' }}>Commencez à suivre votre cycle</p>
      <p style={{ color: 'var(--gray-400)', fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>
        Enregistrez vos règles pour obtenir des prédictions personnalisées, suivre votre ovulation et comprendre votre cycle.
      </p>
      <button
        onClick={onAdd}
        style={{ marginTop: 20, background: 'var(--pink)', color: 'white', borderRadius: 12, padding: '12px 28px', fontWeight: 700, fontSize: 15 }}
      >
        🩸 Enregistrer mon premier cycle
      </button>
    </div>
  )
}

/* ── Add / Edit Sheet ────────────────────────────────── */
function AddCycleSheet({ initial, onClose, onSave }) {
  const [dateDebut, setDateDebut] = useState(initial?.dateDebut || new Date().toISOString().split('T')[0])
  const [dureeFlux, setDureeFlux] = useState(initial?.dureeFlux || 5)
  const [dureeCycle, setDureeCycle] = useState(initial?.dureeCycle || 28)
  const [intensite, setIntensite] = useState(initial?.intensite || 'Modérée')
  const [selected, setSelected] = useState(initial?.symptomes || [])
  const [step, setStep] = useState(1)

  function toggleSymptome(s) {
    setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  function handleSave() {
    onSave({ dateDebut, dureeFlux, dureeCycle, intensite, symptomes: selected })
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh' }}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2 style={{ color: 'var(--pink)' }}>{initial ? '✏️ Modifier cycle' : '🩸 Nouveau cycle'}</h2>
          <button onClick={onClose} style={{ fontSize: 22, color: 'var(--gray-400)' }}>×</button>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', padding: '8px 20px', gap: 4 }}>
          {[1, 2].map(s => (
            <div key={s} style={{ flex: 1, height: 3, borderRadius: 99, background: s <= step ? 'var(--pink)' : 'var(--gray-200)', transition: 'background .3s' }} />
          ))}
        </div>

        <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {step === 1 && (
            <>
              <p style={{ fontSize: 13, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Étape 1 — Informations de base</p>

              <div>
                <label className="form-label">📅 Date de début des règles</label>
                <input type="date" className="form-control" value={dateDebut} onChange={e => setDateDebut(e.target.value)} style={{ borderColor: '#fbcfe8' }} />
              </div>

              <div>
                <label className="form-label">🩸 Durée du flux : <span style={{ color: 'var(--pink)', fontWeight: 800 }}>{dureeFlux} jours</span></label>
                <Stepper value={dureeFlux} min={1} max={10} onChange={setDureeFlux} color="var(--pink)" />
              </div>

              <div>
                <label className="form-label">🔄 Durée du cycle : <span style={{ color: 'var(--blue)', fontWeight: 800 }}>{dureeCycle} jours</span></label>
                <Stepper value={dureeCycle} min={21} max={40} onChange={setDureeCycle} color="var(--blue)" />
                <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>Cycle moyen : 28 jours. Entre 21 et 40 jours c'est normal.</p>
              </div>

              <div>
                <label className="form-label">💧 Intensité du flux</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {INTENSITES.map(i => (
                    <button
                      key={i}
                      onClick={() => setIntensite(i)}
                      style={{
                        padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                        background: intensite === i ? INTENSITE_COLORS[i] : '#f9fafb',
                        color: intensite === i ? 'white' : 'var(--gray-600)',
                        border: `2px solid ${intensite === i ? INTENSITE_COLORS[i] : '#e5e7eb'}`,
                        transition: 'all .2s'
                      }}
                    >{i}</button>
                  ))}
                </div>
              </div>

              <button
                className="btn btn-pink btn-full"
                onClick={() => setStep(2)}
                style={{ marginTop: 4 }}
              >
                Suivant — Symptômes →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <p style={{ fontSize: 13, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Étape 2 — Symptômes (optionnel)</p>

              <div>
                <label className="form-label">🤒 Sélectionnez vos symptômes</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {SYMPTOMES.map(s => (
                    <button
                      key={s.label}
                      onClick={() => toggleSymptome(s.label)}
                      style={{
                        padding: '7px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                        background: selected.includes(s.label) ? 'var(--pink)' : '#fdf2f8',
                        color: selected.includes(s.label) ? 'white' : '#374151',
                        border: `1.5px solid ${selected.includes(s.label) ? 'var(--pink)' : '#fbcfe8'}`,
                        transition: 'all .15s'
                      }}
                    >
                      {s.emoji} {s.label}
                    </button>
                  ))}
                </div>
                {selected.length > 0 && (
                  <p style={{ fontSize: 12, color: 'var(--pink)', marginTop: 8, fontWeight: 600 }}>
                    {selected.length} symptôme{selected.length > 1 ? 's' : ''} sélectionné{selected.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  onClick={() => setStep(1)}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, background: '#f3f4f6', color: 'var(--gray-600)', fontWeight: 700, fontSize: 14 }}
                >
                  ← Retour
                </button>
                <button
                  className="btn btn-pink"
                  style={{ flex: 2 }}
                  onClick={handleSave}
                >
                  {initial ? '✅ Enregistrer' : '🩸 Enregistrer le cycle'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Bannière grossesse ──────────────────────────────── */
function GrossesseBanner({ grossesse, onStop }) {
  const saDDR = new Date(grossesse.ddr)
  const today = new Date(); today.setHours(0,0,0,0)
  const joursGrossesse = Math.round((today - saDDR) / 86400000)
  const semaines = Math.floor(joursGrossesse / 7)
  const jours = joursGrossesse % 7
  const saTerm = addDays(grossesse.ddr, 280) // DPA = DDR + 280j
  const jRestants = daysUntil(saTerm)

  return (
    <div style={{ background: 'linear-gradient(135deg, #fdf4ff, #fce7f3)', border: '2px solid #e879f9', borderRadius: 18, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 32 }}>🤰</span>
          <div>
            <p style={{ fontWeight: 800, fontSize: 16, color: '#86198f' }}>Suivi grossesse actif</p>
            <p style={{ fontSize: 12, color: '#a21caf', marginTop: 2 }}>
              {semaines} SA + {jours}j · Terme estimé : {fmt(saTerm)}
            </p>
          </div>
        </div>
        <button onClick={onStop} style={{ fontSize: 11, color: '#a21caf', background: '#fae8ff', borderRadius: 8, padding: '4px 8px', fontWeight: 700 }}>
          Arrêter
        </button>
      </div>
      <div style={{ marginTop: 12, height: 6, background: '#f3e8ff', borderRadius: 99 }}>
        <div style={{ height: '100%', width: `${Math.min(100, (joursGrossesse / 280) * 100)}%`, background: 'linear-gradient(90deg, #c084fc, #e879f9)', borderRadius: 99 }} />
      </div>
      <p style={{ fontSize: 11, color: '#a21caf', marginTop: 4, textAlign: 'right' }}>
        {jRestants > 0 ? `${jRestants} jours jusqu'au terme` : 'Terme atteint 🎉'}
      </p>
    </div>
  )
}

/* ── Tab Grossesse ───────────────────────────────────── */
const TRIMESTRES = [
  { num: 1, label: '1er trimestre', semaines: '1–13', emoji: '🌱', color: '#10b981', bg: '#ecfdf5' },
  { num: 2, label: '2ème trimestre', semaines: '14–27', emoji: '🌸', color: '#f59e0b', bg: '#fffbeb' },
  { num: 3, label: '3ème trimestre', semaines: '28–40', emoji: '🌟', color: '#8b5cf6', bg: '#f5f3ff' },
]

const DEVELOPPEMENT = {
  4:  { taille: 'Graine de pavot', poids: '<1g', desc: 'Implantation terminée. Le cœur commence à se former.' },
  6:  { taille: 'Grain de lentille', poids: '<1g', desc: 'Les yeux, les oreilles et la bouche commencent à se former.' },
  8:  { taille: 'Framboise', poids: '1g', desc: 'Tous les organes majeurs sont présents. Le bébé bouge déjà !' },
  10: { taille: 'Prune', poids: '4g', desc: 'Les dents de lait se forment. Les doigts sont distincts.' },
  12: { taille: 'Figue', poids: '14g', desc: 'Fin du 1er trimestre. Risque de fausse couche fortement réduit.' },
  16: { taille: 'Avocat', poids: '100g', desc: 'Vous pourrez bientôt sentir les premiers mouvements.' },
  20: { taille: 'Banane', poids: '300g', desc: 'Mi-grossesse ! L\'échographie morphologique est recommandée.' },
  24: { taille: 'Épi de maïs', poids: '600g', desc: 'Le bébé entend votre voix. Parlez-lui !' },
  28: { taille: 'Aubergine', poids: '1kg', desc: 'Début du 3ème trimestre. Le bébé ouvre les yeux.' },
  32: { taille: 'Noix de coco', poids: '1.7kg', desc: 'Le bébé se retourne en position tête en bas.' },
  36: { taille: 'Laitue romaine', poids: '2.6kg', desc: 'Presque à terme ! Préparez votre valise de maternité.' },
  40: { taille: 'Pastèque', poids: '3.4kg', desc: 'Terme ! Votre bébé est prêt à naître.' },
}

function getDevInfo(sa) {
  const keys = Object.keys(DEVELOPPEMENT).map(Number).sort((a, b) => a - b)
  let best = keys[0]
  for (const k of keys) { if (sa >= k) best = k }
  return DEVELOPPEMENT[best]
}

function TabGrossesse({ grossesse }) {
  const saDDR = new Date(grossesse.ddr)
  const today = new Date(); today.setHours(0,0,0,0)
  const joursGrossesse = Math.round((today - saDDR) / 86400000)
  const sa = Math.floor(joursGrossesse / 7)
  const jReste = joursGrossesse % 7
  const saTerm = addDays(grossesse.ddr, 280)
  const jRestants = Math.max(0, daysUntil(saTerm))
  const trimestre = sa < 14 ? 1 : sa < 28 ? 2 : 3
  const tri = TRIMESTRES[trimestre - 1]
  const dev = getDevInfo(sa)
  const pct = Math.min(100, Math.round((joursGrossesse / 280) * 100))

  const examens = [
    { sem: '8–12', label: 'Première échographie', done: sa >= 12 },
    { sem: '11–13', label: 'Dépistage trisomie 21', done: sa >= 13 },
    { sem: '20–22', label: 'Échographie morphologique', done: sa >= 22 },
    { sem: '30–32', label: 'Échographie 3ème trimestre', done: sa >= 32 },
    { sem: '36–38', label: 'Préparation accouchement', done: sa >= 38 },
  ]

  return (
    <>
      {/* Semaine actuelle */}
      <div style={{ background: `linear-gradient(135deg, ${tri.bg}, white)`, border: `2px solid ${tri.color}40`, borderRadius: 20, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <span style={{ fontSize: 40 }}>{tri.emoji}</span>
          <div>
            <p style={{ fontSize: 11, color: tri.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{tri.label}</p>
            <p style={{ fontSize: 28, fontWeight: 900, color: '#1f2937' }}>{sa} SA <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-400)' }}>+ {jReste}j</span></p>
            <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>Terme prévu le {fmtFull(saTerm)}</p>
          </div>
        </div>
        <div style={{ height: 10, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${tri.color}80, ${tri.color})`, borderRadius: 99, transition: 'width 0.5s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>Semaine 1</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: tri.color }}>{pct}%</span>
          <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>Semaine 40</span>
        </div>
        <p style={{ fontSize: 13, color: tri.color, fontWeight: 700, marginTop: 10, textAlign: 'center' }}>
          {jRestants > 0 ? `🗓️ ${jRestants} jours avant le terme` : '🎉 Terme atteint !'}
        </p>
      </div>

      {/* Développement bébé */}
      <div style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: 'var(--shadow)' }}>
        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>👶 Développement du bébé</p>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ width: 70, height: 70, borderRadius: 16, background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0 }}>
            🥑
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>Taille : {dev.taille}</p>
            <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>Poids : ~{dev.poids}</p>
            <p style={{ fontSize: 13, color: '#374151', marginTop: 6, lineHeight: 1.5 }}>{dev.desc}</p>
          </div>
        </div>
      </div>

      {/* Trimestres */}
      <div style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: 'var(--shadow)' }}>
        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>📊 Progression par trimestre</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {TRIMESTRES.map(t => {
            const active = t.num === trimestre
            const done = t.num < trimestre
            return (
              <div key={t.num} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, background: active ? t.bg : done ? '#f0fdf4' : '#f9fafb', border: `1.5px solid ${active ? t.color : done ? '#bbf7d0' : '#e5e7eb'}` }}>
                <span style={{ fontSize: 22 }}>{done ? '✅' : active ? t.emoji : '⏳'}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: active ? t.color : done ? '#16a34a' : 'var(--gray-400)' }}>{t.label}</p>
                  <p style={{ fontSize: 11, color: 'var(--gray-400)' }}>Semaines {t.semaines}</p>
                </div>
                {active && <span style={{ fontSize: 11, fontWeight: 700, color: t.color }}>En cours</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Examens médicaux */}
      <div style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: 'var(--shadow)' }}>
        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>🏥 Examens à prévoir</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {examens.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: e.done ? '#f0fdf4' : '#fafafa', border: `1px solid ${e.done ? '#bbf7d0' : '#e5e7eb'}` }}>
              <span style={{ fontSize: 18 }}>{e.done ? '✅' : '📋'}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: e.done ? '#16a34a' : '#374151' }}>{e.label}</p>
                <p style={{ fontSize: 11, color: 'var(--gray-400)' }}>Semaines {e.sem}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conseils grossesse */}
      <div style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: 'var(--shadow)' }}>
        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>💡 Conseils du trimestre</p>
        {[
          trimestre === 1 && ['🚫 Évitez l\'alcool, le tabac et certains médicaments', '💊 Prenez de l\'acide folique chaque jour', '😴 Reposez-vous, la fatigue est normale', '🥗 Mangez équilibré et évitez les charcuteries crues'],
          trimestre === 2 && ['🏊 Natation et yoga prénatal recommandés', '💆 Massages du dos pour les douleurs', '📸 Séance photo grossesse mémorable !', '🛌 Dormez sur le côté gauche pour la circulation'],
          trimestre === 3 && ['🧳 Préparez votre valise de maternité', '🏥 Visitez la maternité à l\'avance', '🧘 Exercices de respiration pour l\'accouchement', '📋 Rédigez votre plan de naissance'],
        ].filter(Boolean)[0].map((c, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 10px', background: '#fdf2f8', borderRadius: 10, marginBottom: 6 }}>
            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.4 }}>{c}</p>
          </div>
        ))}
      </div>
    </>
  )
}

/* ── Modal confirmation grossesse ───────────────────── */
function GrossesseModal({ onClose, onConfirm }) {
  const [ddr, setDdr] = useState(new Date().toISOString().split('T')[0])

  function handleConfirm() {
    onConfirm({ ddr, dateConfirmation: new Date().toISOString() })
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2 style={{ color: '#a21caf' }}>🤰 Suivi grossesse</h2>
          <button onClick={onClose} style={{ fontSize: 22, color: 'var(--gray-400)' }}>×</button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#fdf4ff', borderRadius: 12, padding: 14, border: '1px solid #e879f9' }}>
            <p style={{ fontSize: 13, color: '#7e22ce', lineHeight: 1.6 }}>
              🎉 Félicitations ! Entrez la date de vos <strong>dernières règles (DDR)</strong> pour calculer votre semaine de grossesse et votre date prévue d'accouchement.
            </p>
          </div>

          <div>
            <label className="form-label">📅 Date de vos dernières règles (DDR)</label>
            <input
              type="date"
              className="form-control"
              value={ddr}
              onChange={e => setDdr(e.target.value)}
              style={{ borderColor: '#e879f9' }}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {ddr && (
            <div style={{ background: '#f5f3ff', borderRadius: 12, padding: 14, border: '1px solid #c4b5fd' }}>
              {(() => {
                const j = Math.round((new Date() - new Date(ddr)) / 86400000)
                const sa = Math.floor(j / 7)
                const term = addDays(ddr, 280)
                return (
                  <>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#7c3aed' }}>📊 Estimation :</p>
                    <p style={{ fontSize: 13, color: '#5b21b6', marginTop: 4 }}>Semaine de grossesse : <strong>{sa} SA + {j % 7}j</strong></p>
                    <p style={{ fontSize: 13, color: '#5b21b6', marginTop: 2 }}>Date prévue d'accouchement : <strong>{fmtFull(term)}</strong></p>
                  </>
                )
              })()}
            </div>
          )}

          <p style={{ fontSize: 11, color: 'var(--gray-400)', lineHeight: 1.5 }}>
            ⚕️ Ces informations sont indicatives. Consultez votre médecin ou gynécologue pour un suivi médical officiel.
          </p>

          <button
            onClick={handleConfirm}
            style={{ padding: '13px', borderRadius: 12, background: '#a21caf', color: 'white', fontWeight: 700, fontSize: 15 }}
          >
            🤰 Démarrer le suivi grossesse
          </button>
        </div>
      </div>
    </div>
  )
}

function Stepper({ value, min, max, onChange, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        style={{ width: 36, height: 36, borderRadius: '50%', background: '#f3f4f6', color: color || 'var(--blue)', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >−</button>
      <div style={{ flex: 1, height: 4, background: '#f3f4f6', borderRadius: 99, position: 'relative' }}>
        <div style={{ height: '100%', width: `${((value - min) / (max - min)) * 100}%`, background: color || 'var(--blue)', borderRadius: 99, transition: 'width .2s' }} />
      </div>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        style={{ width: 36, height: 36, borderRadius: '50%', background: '#f3f4f6', color: color || 'var(--blue)', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >＋</button>
    </div>
  )
}
