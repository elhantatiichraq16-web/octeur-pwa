import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { ref, get } from 'firebase/database'
import { auth, db } from './firebase'
import AuthPage, { logout } from './pages/AuthPage'
import { startAlarmChecker, stopAlarmChecker, syncAllMedAlarms } from './notifications'
import HomePage from './pages/HomePage'
import DoctorsPage from './pages/DoctorsPage'
import CyclePage from './pages/CyclePage'
import MedicationPage from './pages/MedicationPage'
import ChatBotPage from './pages/ChatBotPage'
import RadiosPage from './pages/RadiosPage'
import AppointmentsPage from './pages/AppointmentsPage'
import HealthDossierPage from './pages/HealthDossierPage'
import VaccinationPage from './pages/VaccinationPage'

const NAV = [
  { id: 'home',    label: 'Accueil',  icon: HomeIcon },
  { id: 'doctors', label: 'Médecins', icon: StethoscopeIcon },
  { id: 'rdv',     label: 'RDV',      icon: CalendarIcon },
  { id: 'meds',    label: 'Médicaments', icon: PillIcon },
  { id: 'more',    label: 'Plus',     icon: GridIcon },
]

const MORE_PAGES = [
  { id: 'cycle',    label: 'Mon Cycle',      icon: '🩸' },
  { id: 'radios',   label: 'Documents',      icon: '🩻' },
  { id: 'vaccin',   label: 'Vaccinations',   icon: '💉' },
  { id: 'dossier',  label: 'Dossier Santé',  icon: '🏥' },
  { id: 'bot',      label: 'MediBot',        icon: '🤖' },
]

export default function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [tab, setTab] = useState('home')
  const [subPage, setSubPage] = useState(null)

  // Listen to Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        const emailKey = firebaseUser.email.replace(/\./g, ',')
        const snap = await get(ref(db, `users/${emailKey}/profile`))
        const profile = snap.exists() ? snap.val() : {}
        const u = { email: firebaseUser.email, prenom: profile.prenom || '', nom: profile.nom || '' }
        setUser(u)
        // Load meds from Firebase and sync alarms to localStorage before checker starts
        const medsSnap = await get(ref(db, `users/${emailKey}/meds`))
        const meds = medsSnap.exists() ? medsSnap.val() : []
        syncAllMedAlarms(Array.isArray(meds) ? meds : [], u.email)
        startAlarmChecker(u.email)
      } else {
        setUser(null)
        stopAlarmChecker()
      }
      setAuthLoading(false)
    })
    return () => { unsub(); stopAlarmChecker() }
  }, [])

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #1e40af, #7c3aed)' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏥</div>
          <p style={{ fontSize: 16, fontWeight: 600 }}>MediTrack</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthPage onLogin={u => setUser(u)} />
  }

  function handleLogout() {
    logout()
    setUser(null)
    setTab('home')
    setSubPage(null)
  }

  function navigateTo(page) {
    setSubPage(page)
    setTab('more')
  }

  const ue = user.email

  function renderPage() {
    if (tab === 'home')    return <HomePage onNavigate={navigateTo} user={user} onLogout={handleLogout} />
    if (tab === 'doctors') return <DoctorsPage />
    if (tab === 'rdv')     return <AppointmentsPage userEmail={ue} />
    if (tab === 'meds')    return <MedicationPage userEmail={ue} />
    if (tab === 'more') {
      if (!subPage)         return <MorePage onNavigate={setSubPage} user={user} onLogout={handleLogout} />
      if (subPage === 'cycle')   return <CyclePage userEmail={ue} />
      if (subPage === 'radios')  return <RadiosPage userEmail={ue} />
      if (subPage === 'vaccin')  return <VaccinationPage userEmail={ue} />
      if (subPage === 'dossier') return <HealthDossierPage userEmail={ue} />
      if (subPage === 'bot')     return <ChatBotPage />
    }
  }

  const showBack = tab === 'more' && subPage !== null

  return (
    <div className="app">
      {showBack && (
        <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, zIndex: 100, background: 'white', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 10 }}>
          <button onClick={() => setSubPage(null)} style={{ fontSize: 22, color: 'var(--blue)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            ← <span style={{ fontSize: 15 }}>Retour</span>
          </button>
        </div>
      )}

      <div className="page" style={{ paddingTop: showBack ? 52 : 0 }}>
        {renderPage()}
      </div>

      <nav className="nav">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item${tab === id ? ' active' : ''}`}
            onClick={() => { setTab(id); if (id !== 'more') setSubPage(null) }}
          >
            <Icon />
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}

function MorePage({ onNavigate, user, onLogout }) {
  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 20 }}>Plus</h1>
          <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>{user.prenom} {user.nom}</p>
        </div>
        <button onClick={onLogout} style={{ fontSize: 13, color: 'var(--red)', padding: '8px 14px', borderRadius: 10, background: '#fee2e2', fontWeight: 700 }}>
          Déconnexion
        </button>
      </div>

      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {MORE_PAGES.map(({ id, label, icon }) => (
          <button key={id} onClick={() => onNavigate(id)} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '16px', borderRadius: 16,
            background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', textAlign: 'left', width: '100%',
          }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
              {icon}
            </div>
            <p style={{ fontWeight: 600, fontSize: 16, flex: 1 }}>{label}</p>
            <span style={{ fontSize: 18, color: 'var(--gray-300)' }}>›</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// Icons
function HomeIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
}
function StethoscopeIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 8C19 10.97 16.84 13.44 14 13.93V17C14 18.66 12.66 20 11 20S8 18.66 8 17V16.92C5.67 16.44 4 14.42 4 12V5H6V3H8V7H6V12C6 13.1 6.9 14 8 14S10 13.1 10 12V7H8V3H10V5H18V8H19M18 6H12V8H17C17 9.7 15.7 11 14 11C12.3 11 11 9.7 11 8H10C10 10.2 11.8 12 14 12C16.2 12 18 10.2 18 8V6Z"/></svg>
}
function CalendarIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5C3.9 3 3 3.9 3 5v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H5V8h14v13zM7 10h5v5H7z"/></svg>
}
function PillIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.22 11.29L11.29 4.22C12.85 2.66 15.36 2.66 16.92 4.22L19.78 7.08C21.34 8.64 21.34 11.15 19.78 12.71L12.71 19.78C11.15 21.34 8.64 21.34 7.08 19.78L4.22 16.92C2.66 15.36 2.66 12.85 4.22 11.29M11 6L6 11L8 13L10 11L13 14L18 9L16 7L13 10L11 8L11 6Z"/></svg>
}
function GridIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h8v8H3zm0 10h8v8H3zm10-10h8v8h-8zm0 10h8v8h-8z"/></svg>
}
