import { useState, useEffect, useRef } from 'react'
import { ref, get, set } from 'firebase/database'
import { db } from '../firebase'

export function useUserData(key, initialValue, userEmail) {
  const [value, setValue] = useState(initialValue)
  const [loaded, setLoaded] = useState(false)
  const saveTimer = useRef(null)
  const isFirstLoad = useRef(true)

  // Load from Firebase when user/key changes
  useEffect(() => {
    if (!userEmail) {
      setValue(initialValue)
      setLoaded(false)
      return
    }
    isFirstLoad.current = true
    setLoaded(false)
    // Encode email to be a valid Firebase key (replace . with ,)
    const emailKey = userEmail.replace(/\./g, ',')
    const dbRef = ref(db, `users/${emailKey}/${key}`)
    get(dbRef).then(snapshot => {
      if (snapshot.exists()) {
        setValue(snapshot.val())
      } else {
        setValue(initialValue)
      }
      setLoaded(true)
      isFirstLoad.current = false
    }).catch(() => {
      setValue(initialValue)
      setLoaded(true)
      isFirstLoad.current = false
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail, key])

  // Save to Firebase when value changes (debounced, skip initial load)
  useEffect(() => {
    if (!userEmail || !loaded || isFirstLoad.current) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      const emailKey = userEmail.replace(/\./g, ',')
      const dbRef = ref(db, `users/${emailKey}/${key}`)
      set(dbRef, value).catch(() => {})
    }, 800)
    return () => clearTimeout(saveTimer.current)
  }, [value, userEmail, key, loaded])

  return [value, setValue]
}
