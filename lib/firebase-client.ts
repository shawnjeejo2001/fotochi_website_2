/**
 * Browser-only Firebase helpers.
 * Import this file **only inside 'use client' components**.
 */
"use client"

import { app } from "./firebase"
import { getAuth } from "firebase/auth"
import type { Auth } from "firebase/auth"

/**
 * Lazily create / reuse a singleton Auth instance.
 * Will throw if imported on the server (SSR) to avoid
 * “Component auth has not been registered yet” errors.
 */
export const auth: Auth = (() => {
  if (typeof window === "undefined") {
    throw new Error("`auth` must only be imported from client-side code.")
  }
  return getAuth(app)
})()

/* Optional analytics helper (also browser-only) */
export async function initAnalytics() {
  if (typeof window === "undefined") return null
  const { getAnalytics } = await import("firebase/analytics")
  return getAnalytics(app)
}
