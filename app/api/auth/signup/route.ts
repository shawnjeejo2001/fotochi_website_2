import { type NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, user_type, ...profileData } = body

    // Validate required fields
    if (!email || !password || !user_type) {
      return NextResponse.json({ error: "Email, password, and user type are required" }, { status: 400 })
    }

    // Create user in Firebase Auth
    let userCredential
    try {
      // Use admin SDK to create user
      const userRecord = await adminAuth.createUser({
        email,
        password,
        emailVerified: false,
      })

      // Create user profile in Firestore
      const userProfile = {
        email,
        user_type,
        status: user_type === "provider" ? "pending" : "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...profileData,
      }

      await adminDb.collection("users").doc(userRecord.uid).set(userProfile)

      return NextResponse.json({
        success: true,
        message: "User created successfully",
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          user_type,
          status: userProfile.status,
        },
      })
    } catch (authError: any) {
      console.error("Firebase Auth Error:", authError)

      // Handle specific Firebase Auth errors
      if (authError.code === "auth/email-already-exists") {
        return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 })
      }

      if (authError.code === "auth/weak-password") {
        return NextResponse.json({ error: "Password should be at least 6 characters" }, { status: 400 })
      }

      if (authError.code === "auth/invalid-email") {
        return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
      }

      return NextResponse.json({ error: authError.message || "Failed to create user account" }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Signup API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
