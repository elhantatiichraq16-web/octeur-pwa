import { useState } from 'react'
import { useUserData } from '../hooks/useUserData'

const TYPES = ['Cabinet', 'Vidéo', 'Domicile', 'Urgence']
const TYPE_ICONS = { Cabinet: '🏥', Vidéo: '📹', Domicile: '🏠', Urgence: '🚨' }

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}
function fmtShort(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function AppointmentsPage({ userEmail }) {
  const [rdvs, setRdvs] = useUserData('rdvs', [], userEmail)
  const [showAdd, setShowAdd] = useState(false)
  const [tab, setTab] = useState('upcoming')

  const today = new Date().toISOString().split('T')[0]
  const upcoming = rdvs.filter(r => r.date >= today).sort((a, b) => a.date.localeCompare(b.date))
  const past = rdvs.filter(r => r.date < today).sort((a, b) => b.date.localeCompare(a.date))

  const todayRdvs = upcoming.filter(r => r.date === today)
  const nextRdvs = upcoming.filter(r => r.date > today)

  function deleteRdv(id) {
    setRdvs(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1>Rendez-vous</h1>
        <button onClick={() => setShowAdd(true)} style={{ color: 'var(--blue)', fontSize: 26, lineHeight: 1 }}>＋</button>
      </div>

      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Tabs */}
        <div className="segment">
          <button className={tab === 'upcoming' ? 'active' : ''} onClick={() => setTab('upcoming')}>À venir ({upcoming.length})</button>
          <button className={tab === 'past' ? 'active' : ''} onClick={() => setTab('past')}>Passés ({past.length})</button>
        </div>

        {tab === 'upcoming' && (
          <>
            {upcoming.length === 0 ? (
              <EmptyState onAdd={() => setShowAdd(true)} />
            ) : (
              <>
                {todayRdvs.length > 0 && (
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)', marginBottom: 8 }}>AUJOURD'HUI</p>
                    {todayRdvs.map(r => <RdvCard key={r.id} rdv={r} highlight onDelete={() => deleteRdv(r.id)} />)}
                  </div>
                )}
                {nextRdvs.length > 0 && (
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-400)', marginBottom: 8 }}>PROCHAINS</p>
                    {nextRdvs.map(r => <RdvCard key={r.id} rdv={r} onDelete={() => deleteRdv(r.id)} />)}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {tab === 'past' && (
          <>
            {past.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--gray-100)', borderRadius: 20 }}>
                <span style={{ fontSize: 48 }}>📋</span>
                <p style={{ fontWeight: 700, fontSize: 16, marginTop: 12 }}>Aucun rendez-vous passé</p>
              </div>
            ) : (
              past.map(r => <RdvCard key={r.id} rdv={r} past onDelete={() => deleteRdv(r.id)} />)
            )}
          </>
        )}
      </div>

      {showAdd && (
        <AddRdvSheet
          onClose={() => setShowAdd(false)}
          onSave={rdv => { setRdvs(prev => [...prev, { ...rdv, id: Date.now() }]); setShowAdd(false) }}
        />
      )}
    </div>
  )
}

function RdvCard({ rdv, highlight, past, onDelete }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card" style={{ marginBottom: 8, borderLeft: highlight ? '4px solid var(--blue)' : past ? '4px solid var(--gray-200)' : '4px solid var(--green)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} onClick={() => setOpen(!open)}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: highlight ? 'var(--blue-light)' : 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
          {TYPE_ICONS[rdv.type] || '🏥'}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 15 }}>{rdv.medecin}</p>
          <p style={{ fontSize: 13, color: 'var(--gray-600)' }}>{rdv.specialite}</p>
          <p style={{ fontSize: 12, color: highlight ? 'var(--blue)' : 'var(--gray-400)', fontWeight: 600, marginTop: 2 }}>
            {fmtShort(rdv.date)} à {rdv.heure}
          </p>
        </div>
        <span style={{ fontSize: 18, color: 'var(--gray-300)' }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--gray-100)' }}>
          <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 4 }}>📍 {rdv.lieu || 'Non précisé'}</p>
          {rdv.motif && <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 4 }}>💬 {rdv.motif}</p>}
          <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 12 }}>🏷 {rdv.type}</p>
          <button onClick={onDelete} style={{ width: '100%', padding: '10px', borderRadius: 10, background: '#fee2e2', color: 'var(--red)', fontWeight: 700, fontSize: 14 }}>
            🗑 Supprimer
          </button>
        </div>
      )}
    </div>
  )
}

function AddRdvSheet({ onClose, onSave }) {
  const [medecin, setMedecin] = useState('')
  const [specialite, setSpecialite] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [heure, setHeure] = useState('09:00')
  const [type, setType] = useState('Cabinet')
  const [lieu, setLieu] = useState('')
  const [motif, setMotif] = useState('')

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2>Nouveau rendez-vous</h2>
          <button onClick={onClose} style={{ fontSize: 22, color: 'var(--gray-400)' }}>×</button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Médecin *</label>
            <input className="form-control" placeholder="Dr. Benali" value={medecin} onChange={e => setMedecin(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Spécialité</label>
            <input className="form-control" placeholder="Cardiologue, Généraliste..." value={specialite} onChange={e => setSpecialite(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Date</label>
              <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Heure</label>
              <input type="time" className="form-control" value={heure} onChange={e => setHeure(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="form-label">Type</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TYPES.map(t => (
                <button key={t} onClick={() => setType(t)} style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                  background: type === t ? 'var(--blue)' : 'var(--gray-100)',
                  color: type === t ? 'white' : 'var(--gray-600)',
                }}>{TYPE_ICONS[t]} {t}</button>
              ))}
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Lieu / Adresse</label>
            <input className="form-control" placeholder="ex: 12 rue Hassan II, Casablanca" value={lieu} onChange={e => setLieu(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Motif</label>
            <textarea className="form-control" rows={2} placeholder="Raison de la consultation..." value={motif} onChange={e => setMotif(e.target.value)} style={{ resize: 'none' }} />
          </div>
          <button className="btn btn-primary btn-full" disabled={!medecin.trim()} onClick={() => onSave({ medecin, specialite, date, heure, type, lieu, motif })}>
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onAdd }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--gray-100)', borderRadius: 20 }}>
      <span style={{ fontSize: 60 }}>📅</span>
      <p style={{ fontWeight: 700, fontSize: 17, marginTop: 16 }}>Aucun rendez-vous</p>
      <p style={{ color: 'var(--gray-400)', fontSize: 14, marginTop: 6 }}>Planifiez vos prochaines consultations</p>
      <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={onAdd}>Ajouter un rendez-vous</button>
    </div>
  )
}
