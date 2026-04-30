import { useState } from 'react'

const SYMPTOMES = ['Crampes', 'Maux de tête', 'Fatigue', 'Ballonnements', 'Irritabilité', 'Nausées', 'Douleurs dos', 'Sautes d\'humeur', 'Seins sensibles', 'Acné']
const INTENSITES = ['Légère', 'Modérée', 'Abondante', 'Très abondante']

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}
function fmt(date) {
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

export default function CyclePage() {
  const [cycles, setCycles] = useState([])
  const [showAdd, setShowAdd] = useState(false)

  const last = cycles[0]

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1>Mon Cycle</h1>
        <button onClick={() => setShowAdd(true)} style={{ color: 'var(--pink)', fontSize: 26, lineHeight: 1 }}>＋</button>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {last ? (
          <>
            <PredictionCard cycle={last} />
            <SymptomesCard cycle={last} />
          </>
        ) : (
          <EmptyState onAdd={() => setShowAdd(true)} />
        )}

        {cycles.length > 0 && (
          <div className="card">
            <p style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>Historique</p>
            {cycles.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < cycles.length - 1 ? '1px solid var(--gray-100)' : 'none' }}>
                <span style={{ color: 'var(--pink)', fontSize: 18 }}>🩸</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>Début : {fmt(c.dateDebut)}</p>
                  <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>Durée : {c.dureeFlux} j • {c.intensite} • Cycle {c.dureeCycle} j</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && <AddCycleSheet onClose={() => setShowAdd(false)} onSave={c => { setCycles(prev => [c, ...prev]); setShowAdd(false) }} />}
    </div>
  )
}

function PredictionCard({ cycle }) {
  const prochainCycle = addDays(cycle.dateDebut, cycle.dureeCycle)
  const ovulation = addDays(cycle.dateDebut, cycle.dureeCycle - 14)
  return (
    <div style={{ background: 'linear-gradient(135deg, #fdf2f8, #fce7f3)', borderRadius: 16, padding: 16, border: '1px solid #fbcfe8' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <p style={{ fontWeight: 700, fontSize: 16 }}>Prochain cycle</p>
        <p style={{ fontWeight: 700, color: 'var(--pink)' }}>{fmt(prochainCycle)}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
        {[
          { icon: '🩸', label: 'Durée flux', value: `${cycle.dureeFlux} j` },
          { icon: '🔄', label: 'Cycle', value: `${cycle.dureeCycle} j` },
          { icon: '❤️', label: 'Ovulation', value: fmt(ovulation) },
        ].map(({ icon, label, value }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,.6)', borderRadius: 10, padding: '10px 6px', textAlign: 'center' }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <p style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 4 }}>{label}</p>
            <p style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SymptomesCard({ cycle }) {
  return (
    <div className="card">
      <p style={{ fontWeight: 700, marginBottom: 10, fontSize: 15 }}>Symptômes enregistrés</p>
      {cycle.symptomes.length === 0
        ? <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Aucun symptôme enregistré</p>
        : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {cycle.symptomes.map(s => (
              <span key={s} className="badge badge-pink">{s}</span>
            ))}
          </div>
      }
    </div>
  )
}

function EmptyState({ onAdd }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--gray-100)', borderRadius: 20 }}>
      <span style={{ fontSize: 60 }}>🩸</span>
      <p style={{ fontWeight: 700, fontSize: 17, marginTop: 16 }}>Commencez à suivre votre cycle</p>
      <p style={{ color: 'var(--gray-400)', fontSize: 14, marginTop: 6 }}>Appuyez sur + pour enregistrer votre premier cycle</p>
      <button className="btn btn-pink" style={{ marginTop: 20 }} onClick={onAdd}>Ajouter mon cycle</button>
    </div>
  )
}

function AddCycleSheet({ onClose, onSave }) {
  const [dateDebut, setDateDebut] = useState(new Date().toISOString().split('T')[0])
  const [dureeFlux, setDureeFlux] = useState(5)
  const [dureeCycle, setDureeCycle] = useState(28)
  const [intensite, setIntensile] = useState('Modérée')
  const [selected, setSelected] = useState([])

  function toggleSymptome(s) {
    setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  function handleSave() {
    onSave({ dateDebut, dureeFlux, dureeCycle, intensite, symptomes: selected })
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2>Nouveau cycle</h2>
          <button onClick={onClose} style={{ fontSize: 22, color: 'var(--gray-400)' }}>×</button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Date de début</label>
            <input type="date" className="form-control" value={dateDebut} onChange={e => setDateDebut(e.target.value)} />
          </div>

          <div>
            <label className="form-label">Durée du flux : {dureeFlux} jours</label>
            <Stepper value={dureeFlux} min={1} max={10} onChange={setDureeFlux} />
          </div>
          <div>
            <label className="form-label">Durée du cycle : {dureeCycle} jours</label>
            <Stepper value={dureeCycle} min={21} max={35} onChange={setDureeCycle} />
          </div>

          <div>
            <label className="form-label">Intensité</label>
            <div className="segment">
              {INTENSITES.map(i => (
                <button key={i} className={intensite === i ? 'active' : ''} onClick={() => setIntensile(i)} style={{ fontSize: 12 }}>{i}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Symptômes</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SYMPTOMES.map(s => (
                <button
                  key={s}
                  onClick={() => toggleSymptome(s)}
                  style={{ padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, background: selected.includes(s) ? 'var(--pink)' : 'var(--gray-100)', color: selected.includes(s) ? 'white' : 'var(--gray-600)' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-pink btn-full" onClick={handleSave}>Enregistrer</button>
        </div>
      </div>
    </div>
  )
}

function Stepper({ value, min, max, onChange }) {
  return (
    <div className="stepper">
      <button onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <span>{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))}>＋</button>
    </div>
  )
}
