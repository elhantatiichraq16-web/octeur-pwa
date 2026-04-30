import { useState } from 'react'
import BookingSheet from './BookingSheet'

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']

export default function DoctorDetail({ doctor, onBack }) {
  const [showBooking, setShowBooking] = useState(false)
  const [booked, setBooked] = useState(false)

  if (booked) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 72 }}>✅</div>
        <h2 style={{ marginTop: 16, fontSize: 22, fontWeight: 700 }}>Rendez-vous confirmé !</h2>
        <p style={{ color: 'var(--gray-600)', marginTop: 8, fontSize: 15 }}>Dr. {doctor.prenom} {doctor.nom} vous attend.</p>
        <button className="btn btn-primary btn-full" style={{ marginTop: 28 }} onClick={onBack}>Retour à la liste</button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--blue), #7c3aed)', padding: '16px 16px 24px' }}>
        <button onClick={onBack} style={{ color: 'white', fontSize: 22, marginBottom: 12 }}>←</button>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
            {doctor.genre === 'F' ? '👩‍⚕️' : '👨‍⚕️'}
          </div>
          <div>
            <h2 style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>Dr. {doctor.prenom} {doctor.nom}</h2>
            <p style={{ color: 'rgba(255,255,255,.85)', fontSize: 14, marginTop: 3 }}>{doctor.specialite}</p>
            <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 13, marginTop: 2 }}>📍 {doctor.ville} • {doctor.experience_annees} ans d&apos;expérience</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 16 }}>
          {[
            { label: 'Note', value: `${doctor.note}/5 ⭐` },
            { label: 'Avis', value: `${doctor.avis}` },
            { label: 'Tarif', value: `${doctor.tarif} MAD` },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,.15)', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 11 }}>{label}</p>
              <p style={{ color: 'white', fontWeight: 700, fontSize: 14, marginTop: 3 }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Infos */}
        <div className="card">
          <p style={{ fontWeight: 700, marginBottom: 10, fontSize: 15 }}>Informations</p>
          {[
            { icon: '📞', label: 'Téléphone', value: doctor.telephone },
            { icon: '📧', label: 'Email', value: doctor.email },
            { icon: '🏥', label: 'Adresse', value: doctor.adresse },
            { icon: '🌍', label: 'Langues', value: doctor.langues.join(', ') },
            { icon: '💳', label: 'Secteur', value: `Secteur ${doctor.secteur}` },
            { icon: '📹', label: 'Téléconsultation', value: doctor.teleconsultation ? 'Disponible' : 'Non disponible' },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
              <div>
                <p style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600 }}>{label}</p>
                <p style={{ fontSize: 14, marginTop: 1 }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        {doctor.description && (
          <div className="card">
            <p style={{ fontWeight: 700, marginBottom: 8, fontSize: 15 }}>À propos</p>
            <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.6 }}>{doctor.description}</p>
          </div>
        )}

        {/* Horaires */}
        <div className="card">
          <p style={{ fontWeight: 700, marginBottom: 10, fontSize: 15 }}>Horaires</p>
          {JOURS.map(jour => {
            const h = doctor.horaires[jour]
            return (
              <div key={jour} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 7, marginBottom: 7, borderBottom: '1px solid var(--gray-100)' }}>
                <span style={{ fontSize: 14, fontWeight: 500, textTransform: 'capitalize' }}>{jour}</span>
                {h === 'Fermé'
                  ? <span style={{ fontSize: 13, color: 'var(--red)', fontWeight: 600 }}>Fermé</span>
                  : <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>{h}</span>
                }
              </div>
            )
          })}
        </div>

        <button className="btn btn-primary btn-full" style={{ marginTop: 4 }} onClick={() => setShowBooking(true)}>
          📅 Prendre rendez-vous
        </button>
      </div>

      {showBooking && (
        <BookingSheet
          doctor={doctor}
          onClose={() => setShowBooking(false)}
          onConfirm={() => { setShowBooking(false); setBooked(true) }}
        />
      )}
    </div>
  )
}
