import { useState } from 'react'

export default function LoginPage({ onLogin }) {
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!prenom.trim() || !nom.trim()) {
      setError('Veuillez remplir votre prénom et nom.')
      return
    }
    onLogin({ prenom: prenom.trim(), nom: nom.trim() })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #1e40af 0%, #2563eb 40%, #7c3aed 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 22,
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 40, margin: '0 auto 16px',
          border: '2px solid rgba(255,255,255,0.3)',
        }}>
          🏥
        </div>
        <h1 style={{ color: 'white', fontSize: 30, fontWeight: 800, letterSpacing: -0.5 }}>MediTrack</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, marginTop: 6 }}>Votre santé, notre priorité</p>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 380,
        background: 'white',
        borderRadius: 24,
        padding: '32px 24px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Bienvenue</h2>
        <p style={{ color: 'var(--gray-400)', fontSize: 14, marginBottom: 28 }}>Entrez votre nom pour continuer</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Prénom</label>
            <input
              className="form-control"
              placeholder="ex: Yasmine"
              value={prenom}
              onChange={e => { setPrenom(e.target.value); setError('') }}
              autoComplete="given-name"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nom</label>
            <input
              className="form-control"
              placeholder="ex: Benali"
              value={nom}
              onChange={e => { setNom(e.target.value); setError('') }}
              autoComplete="family-name"
            />
          </div>

          {error && (
            <p style={{ color: 'var(--red)', fontSize: 13, marginTop: -4 }}>{error}</p>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            style={{ marginTop: 8, height: 50, fontSize: 16, borderRadius: 14 }}
          >
            Accéder à l'application →
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--gray-400)', marginTop: 20 }}>
          Aucun compte requis • Vos données restent sur cet appareil
        </p>
      </div>

      {/* Features preview */}
      <div style={{ marginTop: 32, display: 'flex', gap: 20 }}>
        {[
          { icon: '👨‍⚕️', label: 'Médecins' },
          { icon: '💊', label: 'Médicaments' },
          { icon: '🤖', label: 'MediBot' },
        ].map(({ icon, label }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, margin: '0 auto 6px',
            }}>{icon}</div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
