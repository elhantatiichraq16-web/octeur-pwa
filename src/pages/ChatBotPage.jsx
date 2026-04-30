import { useState, useRef, useEffect } from 'react'

const API_KEY = 'YOUR_ANTHROPIC_API_KEY'

const SYSTEM_PROMPT = `Tu es MediBot, un assistant médical intelligent et bienveillant intégré dans l'application MediTrack.

Ton rôle :
- Répondre aux questions médicales générales en français
- Expliquer les symptômes courants et leurs causes possibles
- Donner des informations sur les médicaments, leurs effets et interactions
- Conseiller sur le cycle menstruel, la santé féminine et reproductive
- Orienter vers le bon type de spécialiste selon les symptômes décrits
- Rappeler l'importance de consulter un médecin pour tout diagnostic
- Donner des conseils de prévention et de bien-être

Règles importantes :
- NE JAMAIS poser de diagnostic définitif — toujours recommander de consulter un médecin
- Utiliser un langage clair, accessible et rassurant
- Si urgence médicale détectée, orienter immédiatement vers le 15 (SAMU) ou urgences
- Préciser que tes réponses sont informatives et ne remplacent pas une consultation médicale
- Répondre UNIQUEMENT en français
- Être empathique et bienveillant

Mots-clés d'urgence : douleur thoracique, difficultés respiratoires, perte de conscience, AVC, infarctus, hémorragie, convulsions → Orienter IMMÉDIATEMENT vers les urgences (15 / 112).`

const WELCOME = {
  id: 'welcome',
  role: 'assistant',
  content: '👋 Bonjour ! Je suis **MediBot**, votre assistant médical.\n\nJe peux vous aider avec :\n• 💊 Questions sur les médicaments\n• 🔍 Comprendre vos symptômes\n• 👩‍⚕️ Trouver le bon spécialiste\n• 🌸 Santé féminine et cycle menstruel\n• 🩺 Conseils de prévention\n\n⚠️ *Mes réponses sont informatives et ne remplacent pas une consultation médicale.*\n\nComment puis-je vous aider ?',
  isError: false,
}

function renderContent(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>')
}

export default function ChatBotPage() {
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const userMsg = { id: Date.now(), role: 'user', content: text, isError: false }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    const history = [...messages, userMsg]
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .filter(m => m.id !== 'welcome')
      .map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-7',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: history,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const msg = res.status === 401
          ? '❌ Clé API invalide. Configurez votre clé Anthropic dans ChatBotPage.jsx'
          : `⚠️ Erreur API (${res.status}): ${err.error?.message || 'Erreur inconnue'}`
        setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: msg, isError: true }])
      } else {
        const data = await res.json()
        const reply = data.content?.[0]?.text ?? '…'
        setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: reply, isError: false }])
      }
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now(), role: 'assistant',
        content: '📵 Pas de connexion internet. Vérifiez votre réseau et réessayez.',
        isError: true,
      }])
    }

    setLoading(false)
    inputRef.current?.focus()
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function clearHistory() {
    setMessages([WELCOME])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
          <div>
            <h1 style={{ fontSize: 18, lineHeight: 1 }}>MediBot</h1>
            <p style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600, marginTop: 2 }}>● En ligne</p>
          </div>
        </div>
        <button onClick={clearHistory} style={{ fontSize: 13, color: 'var(--gray-400)', padding: '6px 10px', borderRadius: 8, background: 'var(--gray-100)', fontWeight: 600 }}>
          Effacer
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column' }}>
            {msg.role === 'user' ? (
              <div className="bubble-user">{msg.content}</div>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🤖</div>
                <div
                  className={msg.isError ? 'bubble-error' : 'bubble-bot'}
                  dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }}
                />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
            <div className="bubble-bot">
              <div className="dots">
                <div className="dot" />
                <div className="dot" />
                <div className="dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px 16px', borderTop: '1px solid var(--gray-100)', background: 'white' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            className="form-control"
            placeholder="Posez votre question médicale..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            style={{ flex: 1, resize: 'none', maxHeight: 120, overflowY: 'auto', lineHeight: 1.5 }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: input.trim() && !loading ? 'var(--blue)' : 'var(--gray-200)',
              color: input.trim() && !loading ? 'white' : 'var(--gray-400)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0, transition: 'all .2s',
            }}
          >
            ➤
          </button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--gray-400)', textAlign: 'center', marginTop: 8 }}>
          ⚠️ Ne remplace pas une consultation médicale
        </p>
      </div>
    </div>
  )
}
