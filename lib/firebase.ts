import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

/**
 * Your Firebase web-app configuration (public, safe to ship to client).
 * NOTE: these values come directly from the user’s message.
 */
const firebaseConfig = {
  apiKey: "AIzaSyArC3lT-l-tTbrccja9CzqjY8cVw4keBJE",
  authDomain: "fotochi-9dbcb.firebaseapp.com",
  projectId: "fotochi-9dbcb",
  storageBucket: "fotochi-9dbcb.firebasestorage.app",
  messagingSenderId: "189583498164",
  appId: "1:189583498164:web:86b465498033f88a7030e1",
  measurementId: "G-DZC7FKZ468",
}

/*----------------------------------------------------------------
  SINGLETON INITIALISATION
----------------------------------------------------------------*/
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

/* Core services (safe on both client & server) */
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

/*----------------------------------------------------------------
  OPTIONAL ANALYTICS — browser-only, loaded lazily
----------------------------------------------------------------*/
export async function initAnalytics() {
  if (typeof window === "undefined") return null
  const { getAnalytics } = await import("firebase/analytics")
  return getAnalytics(app)
}

export default app
