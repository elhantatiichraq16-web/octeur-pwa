import { useState } from 'react'

const CRENEAUX = ['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00','18:00']

export default function BookingSheet({ doctor, onClose, onConfirm }) {
  const [date, setDate] = useState('')
  const [creneau, setCreneau] = useState('')
  const [motif, setMotif] = useState('')
  const [type, setType] = useState('cabinet')

  const canConfirm = date && creneau

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2>Prendre rendez-vous</h2>
          <button onClick={onClose} style={{ fontSize: 22, color: 'var(--gray-400)' }}>×</button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: 'var(--blue-light)', borderRadius: 10 }}>
            <span style={{ fontSize: 24 }}>{doctor.genre === 'F' ? '👩‍⚕️' : '👨‍⚕️'}</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15 }}>Dr. {doctor.prenom} {doctor.nom}</p>
              <p style={{ fontSize: 13, color: 'var(--blue)' }}>{doctor.specialite}</p>
            </div>
          </div>

          {doctor.teleconsultation && (
            <div className="segment">
              <button className={type === 'cabinet' ? 'active' : ''} onClick={() => setType('cabinet')}>🏥 Cabinet</button>
              <button className={type === 'video' ? 'active' : ''} onClick={() => setType('video')}>📹 Vidéo</button>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Date du rendez-vous</label>
            <input
              type="date"
              className="form-control"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Choisir un créneau</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CRENEAUX.map(c => (
                <button
                  key={c}
                  onClick={() => setCreneau(c)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    background: creneau === c ? 'var(--blue)' : 'var(--gray-100)',
                    color: creneau === c ? 'white' : 'var(--gray-800)',
                    border: creneau === c ? 'none' : '1.5px solid var(--gray-200)',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Motif de consultation (optionnel)</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Décrivez brièvement votre motif..."
              value={motif}
              onChange={e => setMotif(e.target.value)}
              style={{ resize: 'none' }}
            />
          </div>

          <button className="btn btn-primary btn-full" disabled={!canConfirm} onClick={onConfirm}>
            Confirmer le rendez-vous
          </button>
        </div>
      </div>
    </div>
  )
}
