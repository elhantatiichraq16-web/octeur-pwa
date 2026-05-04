// Play alarm sound ~3 seconds using Web Audio API
export function playAlarmSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const beepAt = [0, 0.7, 1.4, 2.1, 2.8]
    beepAt.forEach(startTime => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, ctx.currentTime + startTime)
      osc.frequency.setValueAtTime(1100, ctx.currentTime + startTime + 0.15)
      osc.frequency.setValueAtTime(880, ctx.currentTime + startTime + 0.3)
      gain.gain.setValueAtTime(0, ctx.currentTime + startTime)
      gain.gain.linearRampToValueAtTime(0.7, ctx.currentTime + startTime + 0.05)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + startTime + 0.55)
      osc.start(ctx.currentTime + startTime)
      osc.stop(ctx.currentTime + startTime + 0.6)
    })
    setTimeout(() => ctx.close(), 3500)
  } catch {}
}

export function vibrate() {
  try { if ('vibrate' in navigator) navigator.vibrate([500, 200, 500, 200, 500]) } catch {}
}

// Listen for PLAY_ALARM from service worker (user tapped notification on iOS)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type === 'PLAY_ALARM') {
      playAlarmSound()
      vibrate()
    }
  })
  // Also handle ?alarm=1 in URL (iOS fallback when app reopens)
  if (window.location?.search?.includes('alarm=1')) {
    window.addEventListener('load', () => {
      setTimeout(() => { playAlarmSound(); vibrate() }, 800)
      // Clean URL
      window.history.replaceState({}, '', '/')
    })
  }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return await Notification.requestPermission()
}

export function getNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

function showNotification(title, body, tag) {
  if (Notification.permission !== 'granted') return
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SHOW_NOTIFICATION', title, body, tag,
    })
  } else {
    new Notification(title, { body, icon: '/icons/icon-192.png', silent: false })
  }
}

export function triggerAlarm(title, body, tag) {
  showNotification(title, body, tag)
  playAlarmSound()
  vibrate()
}

// Per-user alarms stored in localStorage
function alarmsKey(userEmail) {
  return `meditrack_${userEmail}_alarms`
}
function getAlarms(userEmail) {
  try { return JSON.parse(localStorage.getItem(alarmsKey(userEmail)) || '[]') } catch { return [] }
}
function saveAlarms(userEmail, alarms) {
  localStorage.setItem(alarmsKey(userEmail), JSON.stringify(alarms))
}

export function scheduleMedAlarms(med, userEmail) {
  if (!userEmail) return
  const alarms = getAlarms(userEmail).filter(a => a.medId !== med.id)
  if (med.actif && med.heures?.length > 0) {
    med.heures.forEach(heure => {
      alarms.push({ medId: med.id, nomMed: med.nom, dosage: med.dosage || '', heure })
    })
  }
  saveAlarms(userEmail, alarms)
}

export function removeMedAlarms(medId, userEmail) {
  if (!userEmail) return
  saveAlarms(userEmail, getAlarms(userEmail).filter(a => a.medId !== medId))
}

export function syncAllMedAlarms(meds, userEmail) {
  if (!userEmail) return
  const alarms = []
  meds.filter(m => m.actif && m.heures?.length > 0).forEach(m => {
    m.heures.forEach(heure => {
      alarms.push({ medId: m.id, nomMed: m.nom, dosage: m.dosage || '', heure })
    })
  })
  saveAlarms(userEmail, alarms)
}

function checkAlarms(userEmail) {
  if (!userEmail) return
  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const lastFiredKey = `meditrack_lastfired_${userEmail}`
  if (localStorage.getItem(lastFiredKey) === currentTime) return

  const fired = getAlarms(userEmail).filter(a => a.heure === currentTime)
  if (fired.length > 0) {
    localStorage.setItem(lastFiredKey, currentTime)
    fired.forEach(alarm => {
      triggerAlarm(
        `💊 ${alarm.nomMed}`,
        alarm.dosage ? `Prenez votre dose : ${alarm.dosage}` : "C'est l'heure de prendre votre médicament !",
        alarm.medId
      )
    })
  }
}

let checkerInterval = null
let currentUserEmail = null

export function startAlarmChecker(userEmail) {
  currentUserEmail = userEmail
  if (checkerInterval) clearInterval(checkerInterval)
  checkAlarms(userEmail)
  checkerInterval = setInterval(() => checkAlarms(currentUserEmail), 30000)
}

export function stopAlarmChecker() {
  if (checkerInterval) { clearInterval(checkerInterval); checkerInterval = null }
  currentUserEmail = null
}

export function updateAlarmCheckerUser(userEmail) {
  currentUserEmail = userEmail
}
