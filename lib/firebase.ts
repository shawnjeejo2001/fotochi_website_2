import { initializeApp, getApps, getApp } from "firebase/app"
import type { Auth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAuth } from "firebase/auth" // Declare getAuth before using it

const firebaseConfig = {
  apiKey: "AIzaSyArC3lT-l-tTbrccja9CzqjY8cVw4keBJE",
  authDomain: "fotochi-47cf6.firebaseapp.com",
  projectId: "fotochi-47cf6",
  storageBucket: "fotochi-47cf6.firebasestorage.app",
  messagingSenderId: "189583498164",
  appId: "1:189583498164:web:86b465498033f88a7030e1",
  measurementId: "G-DZC7FKZ468",
}

// Initialize Firebase (singleton pattern)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

/*----------------------------------------------------------------
  BROWSER-ONLY AUTH (fixes “Component auth has not been registered”)
----------------------------------------------------------------*/
let firebaseAuth: Auth | null = null
if (typeof window !== "undefined") {
  // We are in the browser – it’s safe to load Auth
  firebaseAuth = getAuth(app)
}

// Export `auth` – it will be `null` on the server and a valid
// Auth instance in the browser.
export const auth = firebaseAuth

// Initialize Firebase services
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
