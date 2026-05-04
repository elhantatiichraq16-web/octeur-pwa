import { useState } from 'react'
import { useUserData } from '../hooks/useUserData'

const VACCINS_RECOMMANDES = [
  { nom: 'Grippe saisonnière', periodicite: 'Annuel' },
  { nom: 'Tétanos-Diphtérie', periodicite: 'Tous les 10 ans' },
  { nom: 'COVID-19', periodicite: 'Selon recommandations' },
  { nom: 'Hépatite B', periodicite: 'Série de 3 doses' },
  { nom: 'ROR (Rougeole-Oreillons-Rubéole)', periodicite: '2 doses' },
  { nom: 'Pneumocoque', periodicite: 'Selon âge' },
]

function fmt(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function VaccinationPage({ userEmail }) {
  const [vaccins, setVaccins] = useUserData('vaccins', [], userEmail)
  const [showAdd, setShowAdd] = useState(false)

  function deleteVaccin(id) {
    setVaccins(prev => prev.filter(v => v.id !== id))
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1>Vaccinations</h1>
        <button onClick={() => setShowAdd(true)} style={{ color: 'var(--blue)', fontSize: 26, lineHeight: 1 }}>＋</button>
      </div>

      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Mes vaccins */}
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-400)', marginBottom: 10 }}>MON CARNET DE VACCINATION</p>
          {vaccins.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', background: 'var(--gray-100)', borderRadius: 20 }}>
              <span style={{ fontSize: 48 }}>💉</span>
              <p style={{ fontWeight: 700, fontSize: 16, marginTop: 12 }}>Aucun vaccin enregistré</p>
              <p style={{ color: 'var(--gray-400)', fontSize: 13, marginTop: 6 }}>Ajoutez vos vaccins pour suivre votre carnet</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAdd(true)}>Ajouter un vaccin</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {vaccins.map(v => <VaccinCard key={v.id} vaccin={v} onDelete={() => deleteVaccin(v.id)} />)}
            </div>
          )}
        </div>

        {/* Vaccins recommandés */}
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-400)', marginBottom: 10 }}>VACCINS RECOMMANDÉS</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {VACCINS_RECOMMANDES.map(vr => {
              const done = vaccins.some(v => v.nom.toLowerCase().includes(vr.nom.split(' ')[0].toLowerCase()))
              return (
                <div key={vr.nom} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: done ? '#f0fdf4' : '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    {done ? '✅' : '💉'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{vr.nom}</p>
                    <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>{vr.periodicite}</p>
                  </div>
                  {done
                    ? <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>Fait</span>
                    : <button onClick={() => setShowAdd(true)} style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 700 }}>+ Ajouter</button>
                  }
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {showAdd && (
        <AddVaccinSheet
          onClose={() => setShowAdd(false)}
          onSave={v => { setVaccins(prev => [...prev, { ...v, id: Date.now() }]); setShowAdd(false) }}
        />
      )}
    </div>
  )
}

function VaccinCard({ vaccin, onDelete }) {
  const [open, setOpen] = useState(false)
  const rappelDate = vaccin.rappel ? new Date(vaccin.rappel) : null
  const rappelPasse = rappelDate && rappelDate < new Date()

  return (
    <div className="card" style={{ borderLeft: `4px solid ${rappelPasse ? 'var(--orange)' : 'var(--green)'}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} onClick={() => setOpen(!open)}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: rappelPasse ? '#fff7ed' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
          💉
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 15 }}>{vaccin.nom}</p>
          <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>Reçu le {fmt(vaccin.date)}</p>
          {rappelDate && (
            <p style={{ fontSize: 12, color: rappelPasse ? 'var(--orange)' : 'var(--green)', fontWeight: 600 }}>
              {rappelPasse ? '⚠️ Rappel dépassé : ' : '🔔 Rappel : '}{fmt(vaccin.rappel)}
            </p>
          )}
        </div>
        <span style={{ fontSize: 18, color: 'var(--gray-300)' }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--gray-100)' }}>
          {vaccin.lot && <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 4 }}>N° lot : {vaccin.lot}</p>}
          {vaccin.medecin && <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 4 }}>Dr. {vaccin.medecin}</p>}
          {vaccin.notes && <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 12 }}>{vaccin.notes}</p>}
          <button onClick={onDelete} style={{ width: '100%', padding: '10px', borderRadius: 10, background: '#fee2e2', color: 'var(--red)', fontWeight: 700, fontSize: 14 }}>
            🗑 Supprimer
          </button>
        </div>
      )}
    </div>
  )
}

function AddVaccinSheet({ onClose, onSave }) {
  const [nom, setNom] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [rappel, setRappel] = useState('')
  const [lot, setLot] = useState('')
  const [medecin, setMedecin] = useState('')
  const [notes, setNotes] = useState('')

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2>Nouveau vaccin</h2>
          <button onClick={onClose} style={{ fontSize: 22, color: 'var(--gray-400)' }}>×</button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
          <div>
            <label className="form-label">Nom du vaccin *</label>
            <input className="form-control" placeholder="ex: Grippe saisonnière" value={nom} onChange={e => setNom(e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: -6 }}>
            {VACCINS_RECOMMANDES.map(vr => (
              <button key={vr.nom} onClick={() => setNom(vr.nom)} style={{ padding: '4px 10px', borderRadius: 14, fontSize: 12, background: 'var(--gray-100)', color: 'var(--gray-600)' }}>
                {vr.nom.split(' ')[0]}
              </button>
            ))}
          </div>
          <div>
            <label className="form-label">Date d'injection</label>
            <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Date de rappel (optionnel)</label>
            <input type="date" className="form-control" value={rappel} onChange={e => setRappel(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Numéro de lot (optionnel)</label>
            <input className="form-control" placeholder="ex: AB12345" value={lot} onChange={e => setLot(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Médecin (optionnel)</label>
            <input className="form-control" placeholder="Nom du médecin" value={medecin} onChange={e => setMedecin(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Notes</label>
            <textarea className="form-control" rows={2} placeholder="Remarques..." value={notes} onChange={e => setNotes(e.target.value)} style={{ resize: 'none' }} />
          </div>
          <button className="btn btn-primary btn-full" disabled={!nom.trim()} onClick={() => onSave({ nom, date, rappel, lot, medecin, notes })}>
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}
