import { useState } from 'react'
import { useUserData } from '../hooks/useUserData'

const GROUPES_SANGUINS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Inconnu']
const MALADIES_SUGGESTIONS = ['Diabète', 'Hypertension', 'Asthme', 'Épilepsie', 'Insuffisance rénale', 'Maladie cardiaque', 'Thyroïde']

export default function HealthDossierPage({ userEmail }) {
  const [dossier, setDossier] = useUserData('dossier', {
    groupeSanguin: 'Inconnu',
    allergies: [],
    maladies: [],
    contacts: [],
    poids: [],
    taille: '',
  }, userEmail)
  const [editSection, setEditSection] = useState(null)

  const dernierPoids = dossier.poids[dossier.poids.length - 1]?.valeur
  const imc = dernierPoids && dossier.taille
    ? (dernierPoids / Math.pow(parseFloat(dossier.taille) / 100, 2)).toFixed(1)
    : null

  function imcLabel(v) {
    if (v < 18.5) return { text: 'Insuffisance pondérale', color: '#3b82f6' }
    if (v < 25) return { text: 'Poids normal', color: 'var(--green)' }
    if (v < 30) return { text: 'Surpoids', color: 'var(--orange)' }
    return { text: 'Obésité', color: 'var(--red)' }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Mon Dossier Santé</h1>
      </div>

      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Groupe sanguin */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ fontWeight: 700, fontSize: 15 }}>🩸 Groupe sanguin</p>
            <button onClick={() => setEditSection('sang')} style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600 }}>Modifier</button>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {GROUPES_SANGUINS.map(g => (
              <span key={g} style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 14, fontWeight: 700,
                background: dossier.groupeSanguin === g ? '#fee2e2' : 'var(--gray-100)',
                color: dossier.groupeSanguin === g ? 'var(--red)' : 'var(--gray-400)',
              }}>{g}</span>
            ))}
          </div>
        </div>

        {/* IMC */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ fontWeight: 700, fontSize: 15 }}>⚖️ Poids & Taille</p>
            <button onClick={() => setEditSection('imc')} style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600 }}>Modifier</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { label: 'Taille', value: dossier.taille ? `${dossier.taille} cm` : '—' },
              { label: 'Poids', value: dernierPoids ? `${dernierPoids} kg` : '—' },
              { label: 'IMC', value: imc || '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--gray-100)', borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                <p style={{ fontSize: 11, color: 'var(--gray-400)' }}>{label}</p>
                <p style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{value}</p>
              </div>
            ))}
          </div>
          {imc && (
            <p style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: imcLabel(parseFloat(imc)).color }}>
              {imcLabel(parseFloat(imc)).text}
            </p>
          )}
        </div>

        {/* Allergies */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <p style={{ fontWeight: 700, fontSize: 15 }}>⚠️ Allergies</p>
            <button onClick={() => setEditSection('allergies')} style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600 }}>Modifier</button>
          </div>
          {dossier.allergies.length === 0
            ? <p style={{ fontSize: 14, color: 'var(--gray-400)' }}>Aucune allergie enregistrée</p>
            : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {dossier.allergies.map(a => <span key={a} className="badge badge-orange">{a}</span>)}
              </div>
          }
        </div>

        {/* Maladies chroniques */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <p style={{ fontWeight: 700, fontSize: 15 }}>🏥 Antécédents / Maladies</p>
            <button onClick={() => setEditSection('maladies')} style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600 }}>Modifier</button>
          </div>
          {dossier.maladies.length === 0
            ? <p style={{ fontSize: 14, color: 'var(--gray-400)' }}>Aucun antécédent enregistré</p>
            : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {dossier.maladies.map(m => <span key={m} className="badge badge-blue">{m}</span>)}
              </div>
          }
        </div>

        {/* Contacts urgence */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <p style={{ fontWeight: 700, fontSize: 15 }}>📞 Contacts d'urgence</p>
            <button onClick={() => setEditSection('contacts')} style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600 }}>Modifier</button>
          </div>
          {dossier.contacts.length === 0
            ? <p style={{ fontSize: 14, color: 'var(--gray-400)' }}>Aucun contact enregistré</p>
            : dossier.contacts.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < dossier.contacts.length - 1 ? '1px solid var(--gray-100)' : 'none' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👤</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{c.nom}</p>
                    <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>{c.relation} • {c.tel}</p>
                  </div>
                  <a href={`tel:${c.tel}`} style={{ fontSize: 22 }}>📲</a>
                </div>
              ))
          }
        </div>
      </div>

      {editSection === 'sang' && (
        <EditSangSheet
          value={dossier.groupeSanguin}
          onClose={() => setEditSection(null)}
          onSave={v => { setDossier(d => ({ ...d, groupeSanguin: v })); setEditSection(null) }}
        />
      )}
      {editSection === 'imc' && (
        <EditImcSheet
          taille={dossier.taille}
          onClose={() => setEditSection(null)}
          onSave={(t, p) => { setDossier(d => ({ ...d, taille: t, poids: [...d.poids, { valeur: p, date: new Date().toISOString().split('T')[0] }] })); setEditSection(null) }}
        />
      )}
      {editSection === 'allergies' && (
        <EditListSheet
          title="Allergies"
          items={dossier.allergies}
          placeholder="ex: Pénicilline, arachides..."
          onClose={() => setEditSection(null)}
          onSave={v => { setDossier(d => ({ ...d, allergies: v })); setEditSection(null) }}
        />
      )}
      {editSection === 'maladies' && (
        <EditListSheet
          title="Antécédents / Maladies"
          items={dossier.maladies}
          suggestions={MALADIES_SUGGESTIONS}
          placeholder="ex: Diabète type 2..."
          onClose={() => setEditSection(null)}
          onSave={v => { setDossier(d => ({ ...d, maladies: v })); setEditSection(null) }}
        />
      )}
      {editSection === 'contacts' && (
        <EditContactsSheet
          contacts={dossier.contacts}
          onClose={() => setEditSection(null)}
          onSave={v => { setDossier(d => ({ ...d, contacts: v })); setEditSection(null) }}
        />
      )}
    </div>
  )
}

function EditSangSheet({ value, onClose, onSave }) {
  const [selected, setSelected] = useState(value)
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header"><h2>Groupe sanguin</h2><button onClick={onClose} style={{ fontSize: 22, color: 'var(--gray-400)' }}>×</button></div>
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
            {GROUPES_SANGUINS.map(g => (
              <button key={g} onClick={() => setSelected(g)} style={{
                padding: '10px 18px', borderRadius: 12, fontSize: 16, fontWeight: 700,
                background: selected === g ? '#fee2e2' : 'var(--gray-100)',
                color: selected === g ? 'var(--red)' : 'var(--gray-600)',
                border: selected === g ? '2px solid var(--red)' : '2px solid transparent',
              }}>{g}</button>
            ))}
          </div>
          <button className="btn btn-primary btn-full" onClick={() => onSave(selected)}>Enregistrer</button>
        </div>
      </div>
    </div>
  )
}

function EditImcSheet({ taille, onClose, onSave }) {
  const [t, setT] = useState(taille || '')
  const [p, setP] = useState('')
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header"><h2>Poids & Taille</h2><button onClick={onClose} style={{ fontSize: 22, color: 'var(--gray-400)' }}>×</button></div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Taille (cm)</label>
            <input className="form-control" type="number" placeholder="ex: 170" value={t} onChange={e => setT(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Poids actuel (kg)</label>
            <input className="form-control" type="number" placeholder="ex: 65" value={p} onChange={e => setP(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-full" disabled={!t || !p} onClick={() => onSave(t, parseFloat(p))}>Enregistrer</button>
        </div>
      </div>
    </div>
  )
}

function EditListSheet({ title, items, suggestions, placeholder, onClose, onSave }) {
  const [list, setList] = useState([...items])
  const [input, setInput] = useState('')

  function add() {
    const v = input.trim()
    if (v && !list.includes(v)) setList(prev => [...prev, v])
    setInput('')
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header"><h2>{title}</h2><button onClick={onClose} style={{ fontSize: 22, color: 'var(--gray-400)' }}>×</button></div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-control" placeholder={placeholder} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} style={{ flex: 1 }} />
            <button onClick={add} style={{ padding: '0 16px', borderRadius: 10, background: 'var(--blue)', color: 'white', fontWeight: 700 }}>+</button>
          </div>
          {suggestions && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {suggestions.filter(s => !list.includes(s)).map(s => (
                <button key={s} onClick={() => setList(prev => [...prev, s])} style={{ padding: '4px 12px', borderRadius: 16, fontSize: 12, background: 'var(--gray-100)', color: 'var(--gray-600)' }}>+ {s}</button>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {list.map(item => (
              <span key={item} onClick={() => setList(prev => prev.filter(x => x !== item))} style={{ padding: '6px 12px', borderRadius: 16, fontSize: 13, background: 'var(--blue-light)', color: 'var(--blue)', cursor: 'pointer', fontWeight: 600 }}>
                {item} ✕
              </span>
            ))}
          </div>
          <button className="btn btn-primary btn-full" onClick={() => onSave(list)}>Enregistrer</button>
        </div>
      </div>
    </div>
  )
}

function EditContactsSheet({ contacts, onClose, onSave }) {
  const [list, setList] = useState([...contacts])
  const [nom, setNom] = useState('')
  const [relation, setRelation] = useState('')
  const [tel, setTel] = useState('')

  function add() {
    if (!nom.trim() || !tel.trim()) return
    setList(prev => [...prev, { nom: nom.trim(), relation: relation.trim(), tel: tel.trim() }])
    setNom(''); setRelation(''); setTel('')
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header"><h2>Contacts d'urgence</h2><button onClick={onClose} style={{ fontSize: 22, color: 'var(--gray-400)' }}>×</button></div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'var(--gray-100)', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input className="form-control" placeholder="Nom" value={nom} onChange={e => setNom(e.target.value)} />
            <input className="form-control" placeholder="Relation (ex: Mère, Conjoint)" value={relation} onChange={e => setRelation(e.target.value)} />
            <input className="form-control" placeholder="Téléphone" type="tel" value={tel} onChange={e => setTel(e.target.value)} />
            <button onClick={add} disabled={!nom.trim() || !tel.trim()} style={{ padding: '10px', borderRadius: 10, background: 'var(--blue)', color: 'white', fontWeight: 700 }}>Ajouter</button>
          </div>
          {list.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px', background: 'var(--gray-100)', borderRadius: 12 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{c.nom}</p>
                <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>{c.relation} • {c.tel}</p>
              </div>
              <button onClick={() => setList(prev => prev.filter((_, j) => j !== i))} style={{ fontSize: 18, color: 'var(--red)' }}>🗑</button>
            </div>
          ))}
          <button className="btn btn-primary btn-full" onClick={() => onSave(list)}>Enregistrer</button>
        </div>
      </div>
    </div>
  )
}
