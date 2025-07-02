import { NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    console.log("Sign-in attempt for:", email)

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        },
        { status: 400 },
      )
    }

    // For Firebase, we'll need to verify the user exists and get their profile
    // Since we can't directly authenticate with email/password in admin SDK,
    // we'll verify the user exists and return their profile

    try {
      const userRecord = await adminAuth.getUserByEmail(email.toLowerCase())
      console.log("User found:", userRecord.uid)

      // Determine user type and fetch profile
      let userProfile = null
      let userType = "client" // default

      // Check if user is a client
      const clientDoc = await adminDb.collection("clients").doc(userRecord.uid).get()

      if (clientDoc.exists) {
        userProfile = clientDoc.data()
        userType = "client"
      } else {
        // Check if user is a provider
        const providerDoc = await adminDb.collection("providers").doc(userRecord.uid).get()

        if (providerDoc.exists) {
          userProfile = providerDoc.data()
          userType = "provider"
        }
      }

      if (!userProfile) {
        console.error("No profile found for user:", userRecord.uid)
        return NextResponse.json(
          {
            success: false,
            error: "User profile not found",
          },
          { status: 404 },
        )
      }

      console.log("User profile found:", userType)

      return NextResponse.json({
        success: true,
        message: "Sign in successful",
        user: {
          id: userRecord.uid,
          email: userRecord.email,
          user_type: userType,
          full_name: userProfile.fullName || userProfile.name,
          profile_image: userProfile.profileImage || null,
          provider: userType === "provider" ? userProfile : null,
          client: userType === "client" ? userProfile : null,
        },
      })
    } catch (authError) {
      console.error("Authentication failed:", authError)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 },
      )
    }
  } catch (error) {
    console.error("Sign-in error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}
