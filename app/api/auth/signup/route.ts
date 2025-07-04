import { NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

/**
 * This route is used by the Join-Provider and Join-Client pages.
 * It expects a Firebase ID-token (already authenticated on the client),
 * plus the extra registration fields.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { idToken, profile } = body

    if (!idToken || !profile) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 })
    }

    const decoded = await adminAuth.verifyIdToken(idToken)
    const uid = decoded.uid

    // Merge extra profile info into the user's Firestore document
    const userRef = adminDb.collection("users").doc(uid)
    await userRef.set(
      {
        ...profile,
        email: decoded.email,
        updated_at: new Date().toISOString(),
      },
      { merge: true },
    )

    const user = (await userRef.get()).data()

    return NextResponse.json({ success: true, user })
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("Registration error:", err)
    return NextResponse.json({ success: false, error: err.message || "Internal server error" }, { status: 500 })
  }
}
