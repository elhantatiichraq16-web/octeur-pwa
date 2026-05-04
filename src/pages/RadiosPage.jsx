import { useState, useRef } from 'react'
import { useUserData } from '../hooks/useUserData'

const CATEGORIES = ['Tout', 'Radio', 'Analyse', 'Ordonnance', 'Vaccin', 'Autre']
const CAT_ICONS = { Radio: '🩻', Analyse: '🔬', Ordonnance: '💊', Vaccin: '💉', Autre: '📄' }

export default function RadiosPage({ userEmail }) {
  const [docs, setDocs] = useUserData('docs', [], userEmail)
  const [cat, setCat] = useState('Tout')
  const [showAdd, setShowAdd] = useState(false)
  const [preview, setPreview] = useState(null)

  const filtered = cat === 'Tout' ? docs : docs.filter(d => d.categorie === cat)

  function handleDelete(id) {
    setDocs(prev => prev.filter(d => d.id !== id))
    setPreview(null)
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1>Mes Documents</h1>
        <button onClick={() => setShowAdd(true)} style={{ color: 'var(--blue)', fontSize: 26, lineHeight: 1 }}>＋</button>
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        {/* Filtres catégorie */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, scrollbarWidth: 'none' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
              background: cat === c ? 'var(--blue)' : 'var(--gray-100)',
              color: cat === c ? 'white' : 'var(--gray-600)',
            }}>{c}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState onAdd={() => setShowAdd(true)} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {filtered.map(doc => (
              <DocCard key={doc.id} doc={doc} onClick={() => setPreview(doc)} />
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <AddDocSheet
          onClose={() => setShowAdd(false)}
          onSave={doc => { setDocs(prev => [{ ...doc, id: Date.now() }, ...prev]); setShowAdd(false) }}
        />
      )}

      {preview && (
        <PreviewSheet doc={preview} onClose={() => setPreview(null)} onDelete={() => handleDelete(preview.id)} />
      )}
    </div>
  )
}

function DocCard({ doc, onClick }) {
  return (
    <div onClick={onClick} style={{ borderRadius: 16, overflow: 'hidden', background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', cursor: 'pointer' }}>
      <div style={{ height: 120, background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {doc.dataUrl ? (
          <img src={doc.dataUrl} alt={doc.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 40 }}>{CAT_ICONS[doc.categorie] || '📄'}</span>
        )}
      </div>
      <div style={{ padding: '10px 12px' }}>
        <p style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.titre}</p>
        <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>{doc.categorie} • {new Date(doc.date).toLocaleDateString('fr-FR')}</p>
      </div>
    </div>
  )
}

function PreviewSheet({ doc, onClose, onDelete }) {
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh' }}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2 style={{ fontSize: 17 }}>{doc.titre}</h2>
          <button onClick={onClose} style={{ fontSize: 22, color: 'var(--gray-400)' }}>×</button>
        </div>
        <div style={{ padding: '0 20px 20px', overflowY: 'auto' }}>
          {doc.dataUrl ? (
            <img src={doc.dataUrl} alt={doc.titre} style={{ width: '100%', borderRadius: 12, marginBottom: 16 }} />
          ) : (
            <div style={{ height: 160, background: 'var(--gray-100)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, marginBottom: 16 }}>
              {CAT_ICONS[doc.categorie] || '📄'}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <span style={{ background: 'var(--blue-light)', color: 'var(--blue)', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{doc.categorie}</span>
            <span style={{ background: 'var(--gray-100)', color: 'var(--gray-600)', padding: '4px 12px', borderRadius: 20, fontSize: 13 }}>{new Date(doc.date).toLocaleDateString('fr-FR')}</span>
          </div>
          {doc.notes && <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: 16 }}>{doc.notes}</p>}
          <button onClick={onDelete} style={{ width: '100%', padding: '12px', borderRadius: 12, background: '#fee2e2', color: 'var(--red)', fontWeight: 700, fontSize: 15 }}>
            🗑 Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}

function AddDocSheet({ onClose, onSave }) {
  const [titre, setTitre] = useState('')
  const [categorie, setCategorie] = useState('Radio')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [dataUrl, setDataUrl] = useState(null)
  const fileRef = useRef()

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setDataUrl(ev.target.result)
    reader.readAsDataURL(file)
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2>Nouveau document</h2>
          <button onClick={onClose} style={{ fontSize: 22, color: 'var(--gray-400)' }}>×</button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>

          {/* Upload zone */}
          <div onClick={() => fileRef.current.click()} style={{
            height: 160, borderRadius: 16, border: '2px dashed var(--gray-200)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', overflow: 'hidden', background: dataUrl ? 'transparent' : 'var(--gray-100)',
          }}>
            {dataUrl ? (
              <img src={dataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <>
                <span style={{ fontSize: 36 }}>📸</span>
                <p style={{ fontSize: 14, color: 'var(--gray-400)', marginTop: 8 }}>Appuyer pour ajouter une photo</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Titre *</label>
            <input className="form-control" placeholder="ex: Radio thorax" value={titre} onChange={e => setTitre(e.target.value)} />
          </div>

          <div>
            <label className="form-label">Catégorie</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CATEGORIES.filter(c => c !== 'Tout').map(c => (
                <button key={c} onClick={() => setCategorie(c)} style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                  background: categorie === c ? 'var(--blue)' : 'var(--gray-100)',
                  color: categorie === c ? 'white' : 'var(--gray-600)',
                }}>{CAT_ICONS[c]} {c}</button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Date</label>
            <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Notes</label>
            <textarea className="form-control" rows={2} placeholder="Remarques, résultats..." value={notes} onChange={e => setNotes(e.target.value)} style={{ resize: 'none' }} />
          </div>

          <button className="btn btn-primary btn-full" disabled={!titre.trim()} onClick={() => onSave({ titre, categorie, date, notes, dataUrl })}>
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
      <span style={{ fontSize: 60 }}>🩻</span>
      <p style={{ fontWeight: 700, fontSize: 17, marginTop: 16 }}>Aucun document</p>
      <p style={{ color: 'var(--gray-400)', fontSize: 14, marginTop: 6 }}>Ajoutez vos radios, analyses et ordonnances</p>
      <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={onAdd}>Ajouter un document</button>
    </div>
  )
}
