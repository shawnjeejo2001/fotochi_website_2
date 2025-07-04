import { NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json()

    if (!idToken) {
      return NextResponse.json({ success: false, error: "Missing ID token" }, { status: 400 })
    }

    // Verify token & get UID
    const decoded = await adminAuth.verifyIdToken(idToken)
    const uid = decoded.uid

    // Fetch user profile from Firestore (create a stub if it doesn't exist)
    const userDoc = adminDb.collection("users").doc(uid)
    const snap = await userDoc.get()

    if (!snap.exists) {
      // First-time sign-in; create a minimal profile
      await userDoc.set({
        email: decoded.email,
        user_type: "client", // default, can be updated later
        created_at: new Date().toISOString(),
      })
    }

    const user = (await userDoc.get()).data()

    return NextResponse.json({ success: true, user })
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("Sign-in verification error:", err)
    return NextResponse.json({ success: false, error: err.message || "Internal server error" }, { status: 500 })
  }
}
