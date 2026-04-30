import { useMemo } from 'react'
import doctors from '../data/doctors.json'

export default function HomePage({ onNavigate }) {
  const top3 = useMemo(() => [...doctors].sort((a, b) => b.note - a.note).slice(0, 3), [])

  return (
    <div>
      <div style={{ padding: '20px 16px 0', background: 'linear-gradient(135deg, #eff6ff 0%, #fdf2f8 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 20 }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 2 }}>Bonjour 👋</p>
            <h1 style={{ fontSize: 24, fontWeight: 700 }}>MediTrack</h1>
            <p style={{ fontSize: 14, color: 'var(--gray-600)', marginTop: 4 }}>Comment vous sentez-vous aujourd&apos;hui ?</p>
          </div>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
            ❤️
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, paddingBottom: 20 }}>
          {[
            { icon: '🩺', label: 'Médecins', tab: 'doctors', bg: '#eff6ff' },
            { icon: '🩸', label: 'Cycle', tab: 'cycle', bg: '#fdf2f8' },
            { icon: '💊', label: 'Médicaments', tab: 'meds', bg: '#f0fdf4' },
            { icon: '🤖', label: 'MediBot', tab: 'bot', bg: '#fff7ed' },
          ].map(({ icon, label, tab, bg }) => (
            <button key={tab} onClick={() => onNavigate(tab)} style={{ background: bg, borderRadius: 12, padding: '12px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 24 }}>{icon}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-600)' }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>Médecins les mieux notés</h2>
          <button onClick={() => onNavigate('doctors')} style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600 }}>Voir tout</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {top3.map(doc => (
            <MiniDoctorCard key={doc.id} doctor={doc} />
          ))}
        </div>

        <div style={{ marginTop: 20 }} className="card" onClick={() => onNavigate('bot')}
          style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: 16, padding: 20, cursor: 'pointer', marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 36 }}>🤖</span>
            <div>
              <p style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>MediBot — Votre assistant médical</p>
              <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 13, marginTop: 4 }}>Posez vos questions médicales 24h/24</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniDoctorCard({ doctor }) {
  const stars = '★'.repeat(Math.round(doctor.note)) + '☆'.repeat(5 - Math.round(doctor.note))
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
        {doctor.genre === 'F' ? '👩‍⚕️' : '👨‍⚕️'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Dr. {doctor.prenom} {doctor.nom}</p>
        <p style={{ fontSize: 13, color: 'var(--gray-600)' }}>{doctor.specialite}</p>
        <p style={{ fontSize: 12, color: '#f59e0b' }}>{stars} <span style={{ color: 'var(--gray-400)' }}>{doctor.note}/5</span></p>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)' }}>{doctor.tarif} MAD</p>
        {doctor.teleconsultation && <span className="badge badge-green" style={{ fontSize: 10 }}>📹 Vidéo</span>}
      </div>
    </div>
  )
}
