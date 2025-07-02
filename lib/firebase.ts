import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyArC3lT-l-tTbrccja9CzqjY8cVw4keBJE",
  authDomain: "fotochi-9dbcb.firebaseapp.com",
  projectId: "fotochi-9dbcb",
  storageBucket: "fotochi-9dbcb.firebasestorage.app",
  messagingSenderId: "189583498164",
  appId: "1:189583498164:web:86b465498033f88a7030e1",
  measurementId: "G-DZC7FKZ468",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Initialize Analytics (only in browser)
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null

export default app
