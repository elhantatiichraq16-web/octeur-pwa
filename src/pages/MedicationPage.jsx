import { useState, useEffect } from 'react'
import { useUserData } from '../hooks/useUserData'
import {
  requestNotificationPermission,
  getNotificationPermission,
  syncAllMedAlarms,
  removeMedAlarms,
  triggerAlarm,
} from '../notifications'

const FREQUENCES = ['1×/jour', '2×/jour', '3×/jour', 'Matin + soir', 'Si besoin']

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}
function isInstalledPWA() {
  return window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches
}

export default function MedicationPage({ userEmail }) {
  const [meds, setMeds] = useUserData('meds', [], userEmail)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [notifPerm, setNotifPerm] = useState(() => getNotificationPermission())

  const ios = isIOS()
  const installed = isInstalledPWA()
  // On iOS in browser: show install instructions
  // On iOS installed: show request button (iOS 16.4+ supports it)
  // unsupported = browser doesn't have Notification API at all (iOS Safari not installed)

  // Sync alarms whenever meds change
  useEffect(() => {
    syncAllMedAlarms(meds, userEmail)
  }, [meds, userEmail])

  async function handleRequestNotif() {
    const result = await requestNotificationPermission()
    setNotifPerm(result)
    if (result === 'granted') syncAllMedAlarms(meds, userEmail)
  }

  const actifs = meds.filter(m => m.actif)
  const inactifs = meds.filter(m => !m.actif)
  const lowStock = actifs.filter(m => m.stock <= m.seuilAlerte)

  function deleteMed(id) {
    removeMedAlarms(id, userEmail)
    setMeds(prev => prev.filter(m => m.id !== id))
  }

  function toggleActif(id) {
    setMeds(prev => prev.map(m => m.id === id ? { ...m, actif: !m.actif } : m))
  }

  function saveMed(data) {
    if (editing) {
      setMeds(prev => prev.map(m => m.id === editing.id ? { ...m, ...data } : m))
      setEditing(null)
    } else {
      setMeds(prev => [...prev, { ...data, id: Date.now(), actif: true }])
      setShowAdd(false)
    }
  }

  function priseAujourdhui(id) {
    setMeds(prev => prev.map(m => {
      if (m.id !== id) return m
      const today = new Date().toISOString().split('T')[0]
      const prises = m.prises || []
      const dejaPris = prises.includes(today)
      return {
        ...m,
        stock: dejaPris ? m.stock + 1 : Math.max(0, m.stock - 1),
        prises: dejaPris ? prises.filter(d => d !== today) : [...prises, today],
      }
    }))
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1>Médicaments</h1>
        <button onClick={() => setShowAdd(true)} style={{ color: 'var(--blue)', fontSize: 26, lineHeight: 1 }}>＋</button>
      </div>

      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Bannière notifications */}
        {ios && !installed ? (
          // iOS Safari — pas encore installé
          <div style={{ background: '#fff7ed', borderRadius: 14, padding: 16, border: '1px solid #fed7aa' }}>
            <p style={{ fontWeight: 700, color: 'var(--orange)', marginBottom: 8, fontSize: 15 }}>📲 Installez l'app pour les rappels</p>
            <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 10 }}>
              Les notifications sur iPhone nécessitent que l'app soit installée sur l'écran d'accueil.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                '1. Ouvrez cette page dans Safari',
                '2. Appuyez sur le bouton Partager ↑ (en bas)',
                '3. Choisissez "Sur l\'écran d\'accueil"',
                '4. Appuyez sur "Ajouter"',
                '5. Rouvrez MediTrack depuis l\'icône',
              ].map(step => (
                <div key={step} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.5 }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        ) : ios && installed && notifPerm !== 'granted' ? (
          // iOS installé — demander la permission
          <div style={{ background: 'var(--blue-light)', borderRadius: 14, padding: 16, border: '1px solid #bfdbfe' }}>
            <p style={{ fontWeight: 700, color: 'var(--blue)', marginBottom: 6, fontSize: 15 }}>🔔 Activez les rappels médicaments</p>
            <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 12 }}>
              Recevez une notification à chaque heure de prise. Requiert iOS 16.4+.
            </p>
            {notifPerm === 'denied' ? (
              <div>
                <p style={{ fontSize: 13, color: 'var(--red)', fontWeight: 600, marginBottom: 8 }}>⛔ Notifications bloquées</p>
                <p style={{ fontSize: 12, color: 'var(--gray-600)' }}>
                  Allez dans Réglages → MediTrack → Notifications → Autoriser
                </p>
              </div>
            ) : (
              <button onClick={handleRequestNotif} className="btn btn-primary btn-full" style={{ fontSize: 14 }}>
                Autoriser les notifications
              </button>
            )}
          </div>
        ) : !ios && notifPerm !== 'granted' && notifPerm !== 'unsupported' ? (
          // Android / Desktop
          <div style={{ background: 'var(--blue-light)', borderRadius: 14, padding: 16, border: '1px solid #bfdbfe' }}>
            <p style={{ fontWeight: 700, color: 'var(--blue)', marginBottom: 6, fontSize: 15 }}>🔔 Activez les rappels médicaments</p>
            <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 12 }}>
              Recevez une notification à l'heure de chaque médicament.
            </p>
            {notifPerm === 'denied' ? (
              <p style={{ fontSize: 13, color: 'var(--red)', fontWeight: 600 }}>
                ⛔ Notifications bloquées — activez-les dans les paramètres du navigateur.
              </p>
            ) : (
              <button onClick={handleRequestNotif} className="btn btn-primary btn-full" style={{ fontSize: 14 }}>
                Autoriser les notifications
              </button>
            )}
          </div>
        ) : null}

        {/* Rappels du jour */}
        {notifPerm === 'granted' && actifs.some(m => m.heures?.length > 0) && (
          <TodaySchedule meds={actifs} onTest={() => triggerAlarm('💊 Test alarme', 'Ceci est un rappel de test MediTrack')} />
        )}

        {lowStock.length > 0 && (
          <div style={{ background: '#fff7ed', borderRadius: 12, padding: 14, border: '1px solid #fed7aa' }}>
            <p style={{ fontWeight: 700, color: 'var(--orange)', marginBottom: 8, fontSize: 14 }}>⚠️ Alertes stock</p>
            {lowStock.map(m => (
              <p key={m.id} style={{ fontSize: 14, color: 'var(--gray-800)', marginBottom: 4 }}>
                <strong>{m.nom}</strong> — {m.stock} restant(s)
              </p>
            ))}
          </div>
        )}

        {actifs.length === 0 ? (
          <EmptyState onAdd={() => setShowAdd(true)} />
        ) : (
          <>
            <p style={{ fontSize: 13, color: 'var(--gray-400)', fontWeight: 700 }}>MES TRAITEMENTS</p>
            {actifs.map(m => (
              <MedCard
                key={m.id}
                med={m}
                onEdit={() => setEditing(m)}
                onDelete={() => deleteMed(m.id)}
                onToggleActif={() => toggleActif(m.id)}
                onPrise={() => priseAujourdhui(m.id)}
              />
            ))}
          </>
        )}

        {inactifs.length > 0 && (
          <>
            <p style={{ fontSize: 13, color: 'var(--gray-400)', fontWeight: 700, marginTop: 8 }}>TRAITEMENTS TERMINÉS</p>
            {inactifs.map(m => (
              <MedCard
                key={m.id}
                med={m}
                inactive
                onEdit={() => setEditing(m)}
                onDelete={() => deleteMed(m.id)}
                onToggleActif={() => toggleActif(m.id)}
                onPrise={() => {}}
              />
            ))}
          </>
        )}
      </div>

      {(showAdd || editing) && (
        <AddMedSheet
          initial={editing}
          onClose={() => { setShowAdd(false); setEditing(null) }}
          onSave={saveMed}
        />
      )}
    </div>
  )
}

function MedCard({ med, onEdit, onDelete, onToggleActif, onPrise, inactive }) {
  const [open, setOpen] = useState(false)
  const low = med.stock <= med.seuilAlerte
  const today = new Date().toISOString().split('T')[0]
  const prisCeJour = (med.prises || []).includes(today)

  return (
    <div className="card" style={{ opacity: inactive ? 0.6 : 1 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }} onClick={() => setOpen(!open)}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
          💊
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 15 }}>{med.nom}</p>
          <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>{med.dosage} • {med.frequence}</p>
          {med.heures && med.heures.length > 0 && (
            <p style={{ fontSize: 12, color: 'var(--blue)', marginTop: 2 }}>🕐 {med.heures.join(' • ')}</p>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: low ? 'var(--orange)' : 'var(--green)' }}>
            {med.stock} restant{med.stock !== 1 ? 's' : ''}
          </p>
          {low && <p style={{ fontSize: 11, color: 'var(--orange)' }}>⚠️ Stock faible</p>}
          <span style={{ fontSize: 16, color: 'var(--gray-300)', marginTop: 4, display: 'block' }}>{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {open && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--gray-100)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {med.notes && <p style={{ fontSize: 13, color: 'var(--gray-600)' }}>{med.notes}</p>}

          {!inactive && (
            <button
              onClick={onPrise}
              style={{
                width: '100%', padding: '12px', borderRadius: 12,
                background: prisCeJour ? '#f0fdf4' : 'var(--blue)',
                color: prisCeJour ? 'var(--green)' : 'white',
                fontWeight: 700, fontSize: 14,
                border: prisCeJour ? '1px solid var(--green)' : 'none',
              }}
            >
              {prisCeJour ? '✅ Pris aujourd\'hui' : '💊 Marquer comme pris'}
            </button>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onEdit} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'var(--blue-light)', color: 'var(--blue)', fontWeight: 700, fontSize: 14 }}>
              ✏️ Modifier
            </button>
            <button onClick={onToggleActif} style={{ flex: 1, padding: '10px', borderRadius: 10, background: inactive ? '#f0fdf4' : '#fff7ed', color: inactive ? 'var(--green)' : 'var(--orange)', fontWeight: 700, fontSize: 14 }}>
              {inactive ? '▶ Réactiver' : '⏸ Terminer'}
            </button>
            <button onClick={onDelete} style={{ padding: '10px 14px', borderRadius: 10, background: '#fee2e2', color: 'var(--red)', fontWeight: 700, fontSize: 14 }}>
              🗑
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function TodaySchedule({ meds, onTest }) {
  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const slots = []
  meds.forEach(m => {
    (m.heures || []).forEach(h => slots.push({ heure: h, nom: m.nom, dosage: m.dosage, past: h < currentTime }))
  })
  slots.sort((a, b) => a.heure.localeCompare(b.heure))
  if (slots.length === 0) return null

  return (
    <div style={{ background: 'linear-gradient(135deg, #eff6ff, #f0fdf4)', borderRadius: 14, padding: 14, border: '1px solid #bfdbfe' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--blue)' }}>🕐 Programme d'aujourd'hui</p>
        <button
          onClick={onTest}
          style={{ fontSize: 11, color: 'var(--blue)', background: 'white', border: '1px solid #bfdbfe', borderRadius: 8, padding: '4px 10px', fontWeight: 600 }}
        >
          🔔 Tester
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {slots.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: s.past ? 0.5 : 1 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: s.past ? 'var(--gray-400)' : 'var(--blue)', minWidth: 44 }}>{s.heure}</span>
            <span style={{ fontSize: 18 }}>{s.past ? '✅' : '💊'}</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600 }}>{s.nom}</p>
              {s.dosage && <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>{s.dosage}</p>}
            </div>
          </div>
        ))}
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

const HEURES_SUGGESTIONS = ['06:00', '07:00', '08:00', '12:00', '13:00', '18:00', '20:00', '21:00', '22:00']

function AddMedSheet({ initial, onClose, onSave }) {
  const [nom, setNom] = useState(initial?.nom || '')
  const [dosage, setDosage] = useState(initial?.dosage || '')
  const [frequence, setFrequence] = useState(initial?.frequence || FREQUENCES[0])
  const [stock, setStock] = useState(initial?.stock ?? 30)
  const [seuil, setSeuil] = useState(initial?.seuilAlerte ?? 5)
  const [notes, setNotes] = useState(initial?.notes || '')
  const [heures, setHeures] = useState(initial?.heures || [])
  const [heureInput, setHeureInput] = useState('')

  function addHeure(h) {
    if (h && !heures.includes(h)) setHeures(prev => [...prev, h].sort())
    setHeureInput('')
  }
  function removeHeure(h) {
    setHeures(prev => prev.filter(x => x !== h))
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2>{initial ? 'Modifier médicament' : 'Nouveau médicament'}</h2>
          <button onClick={onClose} style={{ fontSize: 22, color: 'var(--gray-400)' }}>×</button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
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

          {/* Heures de prise */}
          <div>
            <label className="form-label">Heures de prise</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input type="time" className="form-control" value={heureInput} onChange={e => setHeureInput(e.target.value)} style={{ flex: 1 }} />
              <button onClick={() => addHeure(heureInput)} disabled={!heureInput} style={{ padding: '0 16px', borderRadius: 10, background: 'var(--blue)', color: 'white', fontWeight: 700 }}>+</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {HEURES_SUGGESTIONS.map(h => (
                <button key={h} onClick={() => addHeure(h)} style={{
                  padding: '4px 10px', borderRadius: 14, fontSize: 12,
                  background: heures.includes(h) ? 'var(--blue)' : 'var(--gray-100)',
                  color: heures.includes(h) ? 'white' : 'var(--gray-600)',
                }}>{h}</button>
              ))}
            </div>
            {heures.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {heures.map(h => (
                  <span key={h} onClick={() => removeHeure(h)} style={{ padding: '6px 12px', borderRadius: 14, fontSize: 13, background: 'var(--blue-light)', color: 'var(--blue)', cursor: 'pointer', fontWeight: 600 }}>
                    🕐 {h} ✕
                  </span>
                ))}
              </div>
            )}
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
            onClick={() => onSave({ nom, dosage, frequence, stock, seuilAlerte: seuil, notes, heures })}
          >
            {initial ? 'Enregistrer les modifications' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}
