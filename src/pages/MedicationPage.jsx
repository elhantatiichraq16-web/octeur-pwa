import { useState } from 'react'

const FREQUENCES = ['1×/jour', '2×/jour', '3×/jour', 'Matin + soir', 'Si besoin']

export default function MedicationPage() {
  const [meds, setMeds] = useState([])
  const [showAdd, setShowAdd] = useState(false)

  const lowStock = meds.filter(m => m.actif && m.stock <= m.seuilAlerte)

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1>Médicaments</h1>
        <button onClick={() => setShowAdd(true)} style={{ color: 'var(--blue)', fontSize: 26, lineHeight: 1 }}>＋</button>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {lowStock.length > 0 && (
          <div style={{ background: '#fff7ed', borderRadius: 12, padding: 14, border: '1px solid #fed7aa' }}>
            <p style={{ fontWeight: 700, color: 'var(--orange)', marginBottom: 8, fontSize: 14 }}>⚠️ Alertes stock</p>
            {lowStock.map(m => (
              <p key={m.id} style={{ fontSize: 14, color: 'var(--gray-800)', marginBottom: 4 }}>
                <strong>{m.nom}</strong> — Stock faible : {m.stock} restant(s)
              </p>
            ))}
          </div>
        )}

        {meds.filter(m => m.actif).length === 0 ? (
          <EmptyState onAdd={() => setShowAdd(true)} />
        ) : (
          <>
            <p style={{ fontSize: 13, color: 'var(--gray-400)', fontWeight: 600 }}>MES TRAITEMENTS</p>
            {meds.filter(m => m.actif).map(m => (
              <MedCard key={m.id} med={m} />
            ))}
          </>
        )}
      </div>

      {showAdd && <AddMedSheet onClose={() => setShowAdd(false)} onSave={m => { setMeds(prev => [...prev, { ...m, id: Date.now(), actif: true }]); setShowAdd(false) }} />}
    </div>
  )
}

function MedCard({ med }) {
  const low = med.stock <= med.seuilAlerte
  return (
    <div className="card" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
        💊
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 700, fontSize: 15 }}>{med.nom}</p>
        <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>{med.dosage} • {med.frequence}</p>
        {med.notes && <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>{med.notes}</p>}
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: low ? 'var(--orange)' : 'var(--green)' }}>
          {med.stock} restant{med.stock !== 1 ? 's' : ''}
        </p>
        {low && <p style={{ fontSize: 11, color: 'var(--orange)' }}>⚠️ Stock faible</p>}
      </div>
    </div>
  )
}

function EmptyState({ onAdd }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--gray-100)', borderRadius: 20 }}>
      <span style={{ fontSize: 60 }}>💊</span>
      <p style={{ fontWeight: 700, fontSize: 17, marginTop: 16 }}>Aucun médicament</p>
      <p style={{ color: 'var(--gray-400)', fontSize: 14, marginTop: 6 }}>Ajoutez vos médicaments pour recevoir des rappels</p>
      <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={onAdd}>Ajouter un médicament</button>
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

function AddMedSheet({ onClose, onSave }) {
  const [nom, setNom] = useState('')
  const [dosage, setDosage] = useState('')
  const [frequence, setFrequence] = useState(FREQUENCES[0])
  const [stock, setStock] = useState(30)
  const [seuil, setSeuil] = useState(5)
  const [notes, setNotes] = useState('')

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2>Nouveau médicament</h2>
          <button onClick={onClose} style={{ fontSize: 22, color: 'var(--gray-400)' }}>×</button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nom du médicament *</label>
            <input className="form-control" placeholder="ex: Paracétamol" value={nom} onChange={e => setNom(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Dosage</label>
            <input className="form-control" placeholder="ex: 500mg" value={dosage} onChange={e => setDosage(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Fréquence</label>
            <select className="form-control" value={frequence} onChange={e => setFrequence(e.target.value)}>
              {FREQUENCES.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Stock actuel : {stock}</label>
            <Stepper value={stock} min={0} max={500} onChange={setStock} />
          </div>
          <div>
            <label className="form-label">Alerte si stock {"<"} {seuil}</label>
            <Stepper value={seuil} min={1} max={30} onChange={setSeuil} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Notes</label>
            <textarea className="form-control" rows={2} placeholder="Instructions, remarques..." value={notes} onChange={e => setNotes(e.target.value)} style={{ resize: 'none' }} />
          </div>
          <button
            className="btn btn-primary btn-full"
            disabled={!nom.trim()}
            onClick={() => onSave({ nom, dosage, frequence, stock, seuilAlerte: seuil, notes })}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}
