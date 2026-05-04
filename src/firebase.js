import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyCSC6rUDi32ti_9mZfTTw8FvX9FPafWwWc",
  authDomain: "meditrack-dddc6.firebaseapp.com",
  projectId: "meditrack-dddc6",
  storageBucket: "meditrack-dddc6.firebasestorage.app",
  messagingSenderId: "590773225281",
  appId: "1:590773225281:web:f15c08a80e8c0c389783c0",
  databaseURL: "https://meditrack-dddc6-default-rtdb.firebaseio.com",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getDatabase(app)
