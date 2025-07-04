import { type NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idToken } = body

    if (!idToken) {
      return NextResponse.json({ error: "ID token is required" }, { status: 400 })
    }

    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    const uid = decodedToken.uid

    // Get user profile from Firestore
    const userDoc = await adminDb.collection("users").doc(uid).get()

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    const userData = userDoc.data()

    return NextResponse.json({
      success: true,
      user: {
        uid,
        email: decodedToken.email,
        ...userData,
      },
    })
  } catch (error: any) {
    console.error("Signin API Error:", error)

    if (error.code === "auth/id-token-expired") {
      return NextResponse.json({ error: "Session expired. Please sign in again." }, { status: 401 })
    }

    if (error.code === "auth/invalid-id-token") {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
