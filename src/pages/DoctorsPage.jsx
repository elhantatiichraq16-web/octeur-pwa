import { useState, useMemo } from 'react'
import allDoctors from '../data/doctors.json'
import DoctorDetail from '../components/DoctorDetail'

const SPECIALITES = ['Toutes', ...new Set(allDoctors.map(d => d.specialite))]
const VILLES = ['Toutes', ...new Set(allDoctors.map(d => d.ville))]

export default function DoctorsPage() {
  const [search, setSearch] = useState('')
  const [specialite, setSpecialite] = useState('Toutes')
  const [ville, setVille] = useState('Toutes')
  const [tele, setTele] = useState(false)
  const [selected, setSelected] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    return allDoctors.filter(d => {
      const q = search.toLowerCase()
      const matchSearch = !q || d.nom.toLowerCase().includes(q) || d.prenom.toLowerCase().includes(q) || d.specialite.toLowerCase().includes(q) || d.ville.toLowerCase().includes(q)
      const matchSpec = specialite === 'Toutes' || d.specialite === specialite
      const matchVille = ville === 'Toutes' || d.ville === ville
      const matchTele = !tele || d.teleconsultation
      return matchSearch && matchSpec && matchVille && matchTele
    })
  }, [search, specialite, ville, tele])

  if (selected) return <DoctorDetail doctor={selected} onBack={() => setSelected(null)} />

  return (
    <div>
      <div className="page-header">
        <h1>Médecins</h1>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <input
            className="form-control"
            placeholder="🔍  Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            onClick={() => setShowFilters(v => !v)}
            style={{ padding: '0 14px', borderRadius: 10, background: showFilters ? 'var(--blue)' : 'var(--gray-100)', color: showFilters ? 'white' : 'var(--gray-600)', fontWeight: 600, fontSize: 13, flexShrink: 0 }}
          >
            Filtres
          </button>
        </div>

        {showFilters && (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <select className="form-control" value={specialite} onChange={e => setSpecialite(e.target.value)}>
              {SPECIALITES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="form-control" value={ville} onChange={e => setVille(e.target.value)}>
              {VILLES.map(v => <option key={v}>{v}</option>)}
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className={`toggle${tele ? ' on' : ''}`} onClick={() => setTele(v => !v)} />
              <span style={{ fontSize: 14, fontWeight: 500 }}>Téléconsultation uniquement</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '12px 16px' }}>
        <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 10 }}>{filtered.length} médecin{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(doc => (
            <DoctorCard key={doc.id} doctor={doc} onClick={() => setSelected(doc)} />
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gray-400)' }}>
              <p style={{ fontSize: 40 }}>🔍</p>
              <p style={{ marginTop: 12, fontWeight: 600 }}>Aucun résultat</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Essayez d&apos;autres critères</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DoctorCard({ doctor, onClick }) {
  const stars = '★'.repeat(Math.round(doctor.note)) + '☆'.repeat(5 - Math.round(doctor.note))
  const secteurLabel = doctor.secteur === 1 ? 'Secteur 1' : doctor.secteur === 2 ? 'Secteur 2' : 'Secteur 3'

  return (
    <button onClick={onClick} style={{ display: 'flex', gap: 12, padding: 14, background: 'white', borderRadius: 14, boxShadow: 'var(--shadow)', textAlign: 'left', width: '100%' }}>
      <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue-light), #f0fdf4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
        {doctor.genre === 'F' ? '👩‍⚕️' : '👨‍⚕️'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-800)' }}>Dr. {doctor.prenom} {doctor.nom}</p>
            <p style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 500, marginTop: 2 }}>{doctor.specialite}</p>
          </div>
          <p style={{ fontWeight: 700, color: 'var(--blue)', fontSize: 14, flexShrink: 0, marginLeft: 8 }}>{doctor.tarif} MAD</p>
        </div>
        <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>📍 {doctor.ville} • {secteurLabel}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
          <span style={{ fontSize: 12, color: '#f59e0b' }}>{stars}</span>
          <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{doctor.note} ({doctor.avis} avis)</span>
          {doctor.teleconsultation && <span className="badge badge-green" style={{ fontSize: 10, marginLeft: 4 }}>📹 Vidéo</span>}
        </div>
      </div>
    </button>
  )
}
