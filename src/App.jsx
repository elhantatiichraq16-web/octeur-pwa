import { useState } from 'react'
import HomePage from './pages/HomePage'
import DoctorsPage from './pages/DoctorsPage'
import CyclePage from './pages/CyclePage'
import MedicationPage from './pages/MedicationPage'
import ChatBotPage from './pages/ChatBotPage'

const NAV = [
  { id: 'home', label: 'Accueil', icon: HomeIcon },
  { id: 'doctors', label: 'Médecins', icon: StethoscopeIcon },
  { id: 'cycle', label: 'Cycle', icon: DropIcon },
  { id: 'meds', label: 'Médicaments', icon: PillIcon },
  { id: 'bot', label: 'MediBot', icon: BotIcon },
]

export default function App() {
  const [tab, setTab] = useState('home')

  return (
    <div className="app">
      <div className="page">
        {tab === 'home' && <HomePage onNavigate={setTab} />}
        {tab === 'doctors' && <DoctorsPage />}
        {tab === 'cycle' && <CyclePage />}
        {tab === 'meds' && <MedicationPage />}
        {tab === 'bot' && <ChatBotPage />}
      </div>

      <nav className="nav">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item${tab === id ? ' active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon />
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}

function HomeIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
}
function StethoscopeIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 8C19 10.97 16.84 13.44 14 13.93V17C14 18.66 12.66 20 11 20S8 18.66 8 17V16.92C5.67 16.44 4 14.42 4 12V5H6V3H8V7H6V12C6 13.1 6.9 14 8 14S10 13.1 10 12V7H8V3H10V5H18V8H19M18 6H12V8H17C17 9.7 15.7 11 14 11C12.3 11 11 9.7 11 8H10C10 10.2 11.8 12 14 12C16.2 12 18 10.2 18 8V6Z"/></svg>
}
function DropIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C12 2 5 9.5 5 14.5C5 18.09 8.13 21 12 21S19 18.09 19 14.5C19 9.5 12 2 12 2Z"/></svg>
}
function PillIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.22 11.29L11.29 4.22C12.85 2.66 15.36 2.66 16.92 4.22L19.78 7.08C21.34 8.64 21.34 11.15 19.78 12.71L12.71 19.78C11.15 21.34 8.64 21.34 7.08 19.78L4.22 16.92C2.66 15.36 2.66 12.85 4.22 11.29M11 6L6 11L8 13L10 11L13 14L18 9L16 7L13 10L11 8L11 6Z"/></svg>
}
function BotIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.753 14a2.25 2.25 0 0 1 2.25 2.25v.905A3.75 3.75 0 0 1 18.696 20c-1.565 1.344-3.806 2-6.696 2s-5.131-.656-6.695-2a3.75 3.75 0 0 1-1.307-2.845v-.905A2.25 2.25 0 0 1 6.247 14h11.506ZM12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2Z"/></svg>
}
