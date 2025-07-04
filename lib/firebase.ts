/**
 * Firebase core that is SAFE to import on the server.
 *  - Exposes the shared `app` instance
 *  - Exposes Firestore & Storage (both are isomorphic)
 *  - DOES NOT import `firebase/auth` (browser-only)
 */
import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

export const firebaseConfig = {
  apiKey: "AIzaSyArC3lT-l-tTbrccja9CzqjY8cVw4keBJE",
  authDomain: "fotochi-47cf6.firebaseapp.com",
  projectId: "fotochi-47cf6",
  storageBucket: "fotochi-47cf6.firebasestorage.app",
  messagingSenderId: "189583498164",
  appId: "1:189583498164:web:86b465498033f88a7030e1",
  measurementId: "G-DZC7FKZ468",
}

// Singleton pattern — reuse if already initialised
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export { app }
export const db = getFirestore(app)
export const storage = getStorage(app)
