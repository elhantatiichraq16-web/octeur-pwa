import { useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { ref, set, get } from 'firebase/database'
import { auth, db } from '../firebase'

function emailKey(email) {
  return email.replace(/\./g, ',')
}

export async function logout() {
  await signOut(auth)
}

export function getLoggedUser() {
  const u = auth.currentUser
  if (!u) return null
  return { email: u.email, prenom: u.displayName?.split(' ')[0] || '', nom: u.displayName?.split(' ').slice(1).join(' ') || '' }
}

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login')

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #1e40af 0%, #2563eb 40%, #7c3aed 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ width: 76, height: 76, borderRadius: 22, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, margin: '0 auto 14px', border: '2px solid rgba(255,255,255,0.3)' }}>
          🏥
        </div>
        <h1 style={{ color: 'white', fontSize: 28, fontWeight: 800 }}>MediTrack</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 4 }}>Votre santé, notre priorité</p>
      </div>

      <div style={{ width: '100%', maxWidth: 380, background: 'white', borderRadius: 24, padding: '28px 24px', boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}>
        {mode === 'login'    && <LoginForm    onLogin={onLogin} onRegister={() => setMode('register')} onForgot={() => setMode('forgot')} />}
        {mode === 'register' && <RegisterForm onLogin={onLogin} onBack={() => setMode('login')} />}
        {mode === 'forgot'   && <ForgotForm   onBack={() => setMode('login')} />}
      </div>
    </div>
  )
}

function LoginForm({ onLogin, onRegister, onForgot }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true); setError('')
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password)
      const snap = await get(ref(db, `users/${emailKey(cred.user.email)}/profile`))
      const profile = snap.exists() ? snap.val() : {}
      onLogin({ email: cred.user.email, prenom: profile.prenom || '', nom: profile.nom || '' })
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-email') {
        setError('Email ou mot de passe incorrect.')
      } else if (err.code === 'auth/wrong-password') {
        setError('Mot de passe incorrect.')
      } else {
        setError('Erreur de connexion. Vérifiez votre email et mot de passe.')
      }
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Connexion</h2>
        <p style={{ color: 'var(--gray-400)', fontSize: 14, marginTop: 4 }}>Bon retour sur MediTrack</p>
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Email</label>
        <input className="form-control" type="email" placeholder="votre@email.com" value={email}
          onChange={e => { setEmail(e.target.value); setError('') }} autoComplete="email" />
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Mot de passe</label>
        <div style={{ position: 'relative' }}>
          <input className="form-control" type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={password}
            onChange={e => { setPassword(e.target.value); setError('') }} autoComplete="current-password" style={{ paddingRight: 44 }} />
          <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: 'var(--gray-400)' }}>
            {showPwd ? '🙈' : '👁️'}
          </button>
        </div>
      </div>
      {error && <p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>}
      <button type="button" onClick={onForgot} style={{ fontSize: 13, color: 'var(--blue)', textAlign: 'right', fontWeight: 600 }}>
        Mot de passe oublié ?
      </button>
      <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ height: 48, fontSize: 15, borderRadius: 14 }}>
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
      <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--gray-400)' }}>
        Pas encore de compte ?{' '}
        <button type="button" onClick={onRegister} style={{ color: 'var(--blue)', fontWeight: 700 }}>S'inscrire</button>
      </p>
    </form>
  )
}

function RegisterForm({ onLogin, onBack }) {
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!prenom.trim() || !nom.trim()) { setError('Prénom et nom requis.'); return }
    if (password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    setLoading(true); setError('')
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password)
      await set(ref(db, `users/${emailKey(cred.user.email)}/profile`), {
        prenom: prenom.trim(), nom: nom.trim(), email: cred.user.email,
      })
      onLogin({ email: cred.user.email, prenom: prenom.trim(), nom: nom.trim() })
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Un compte existe déjà avec cet email.')
      } else if (err.code === 'auth/invalid-email') {
        setError('Email invalide.')
      } else {
        setError('Erreur lors de la création du compte.')
      }
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <button type="button" onClick={onBack} style={{ fontSize: 22, color: 'var(--gray-400)' }}>←</button>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Créer un compte</h2>
          <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Rejoignez MediTrack gratuitement</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Prénom *</label>
          <input className="form-control" placeholder="Yasmine" value={prenom} onChange={e => { setPrenom(e.target.value); setError('') }} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Nom *</label>
          <input className="form-control" placeholder="Benali" value={nom} onChange={e => { setNom(e.target.value); setError('') }} />
        </div>
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Email *</label>
        <input className="form-control" type="email" placeholder="votre@email.com" value={email} onChange={e => { setEmail(e.target.value); setError('') }} />
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Mot de passe * (min. 6 caractères)</label>
        <div style={{ position: 'relative' }}>
          <input className="form-control" type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={password}
            onChange={e => { setPassword(e.target.value); setError('') }} style={{ paddingRight: 44 }} />
          <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: 'var(--gray-400)' }}>
            {showPwd ? '🙈' : '👁️'}
          </button>
        </div>
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Confirmer le mot de passe *</label>
        <input className="form-control" type="password" placeholder="••••••••" value={confirm} onChange={e => { setConfirm(e.target.value); setError('') }} />
      </div>
      {error && <p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>}
      <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ height: 48, fontSize: 15, borderRadius: 14 }}>
        {loading ? 'Création...' : 'Créer mon compte'}
      </button>
    </form>
  )
}

function ForgotForm({ onBack }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase())
      setSent(true)
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email') {
        setError('Aucun compte avec cet email.')
      } else {
        setError('Erreur lors de l\'envoi. Réessayez.')
      }
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <button onClick={onBack} style={{ fontSize: 22, color: 'var(--gray-400)' }}>←</button>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Mot de passe oublié</h2>
          <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Réinitialiser par email</p>
        </div>
      </div>

      {sent ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <span style={{ fontSize: 56 }}>📧</span>
          <p style={{ fontWeight: 700, fontSize: 18, marginTop: 16 }}>Email envoyé !</p>
          <p style={{ color: 'var(--gray-400)', fontSize: 14, marginTop: 8 }}>
            Vérifiez votre boîte mail et suivez le lien pour réinitialiser votre mot de passe.
          </p>
          <button onClick={onBack} className="btn btn-primary" style={{ marginTop: 24, width: '100%', height: 48, borderRadius: 14 }}>
            Retour à la connexion
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Votre email</label>
            <input className="form-control" type="email" placeholder="votre@email.com" value={email}
              onChange={e => { setEmail(e.target.value); setError('') }} />
          </div>
          {error && <p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>}
          <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ height: 48, borderRadius: 14 }}>
            {loading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
          </button>
        </form>
      )}
    </div>
  )
}
