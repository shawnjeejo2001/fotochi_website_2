import { NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  try {
    const { email, password, userType, fullName, phone, address } = await request.json()

    console.log("Signup request received:", { email, userType, fullName })

    if (!email || !password || !userType) {
      return NextResponse.json(
        {
          success: false,
          error: "Email, password, and user type are required",
        },
        { status: 400 },
      )
    }

    // Convert email to lowercase to make it case-insensitive
    const normalizedEmail = email.toLowerCase()

    // First, create the auth user
    console.log("Creating auth user...")
    const userRecord = await adminAuth.createUser({
      email: normalizedEmail,
      password,
      displayName: fullName,
    })

    console.log("Auth user created successfully:", userRecord.uid)

    try {
      // Create the appropriate profile based on user type
      if (userType === "client") {
        console.log("Creating client profile...")
        await adminDb
          .collection("clients")
          .doc(userRecord.uid)
          .set({
            userId: userRecord.uid,
            fullName: fullName || "",
            email: normalizedEmail,
            phone: phone || null,
            address: address || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          })

        console.log("Client profile created successfully")
      } else if (userType === "provider") {
        console.log("Creating provider profile...")
        await adminDb
          .collection("providers")
          .doc(userRecord.uid)
          .set({
            userId: userRecord.uid,
            fullName: fullName || "",
            email: normalizedEmail,
            phone: phone || null,
            address: address || null,
            status: "pending", // Providers need approval
            createdAt: new Date(),
            updatedAt: new Date(),
          })

        console.log("Provider profile created successfully")
      } else {
        // Clean up auth user for invalid user type
        await adminAuth.deleteUser(userRecord.uid)
        return NextResponse.json(
          {
            success: false,
            error: "Invalid user type. Must be 'client' or 'provider'.",
          },
          { status: 400 },
        )
      }

      return NextResponse.json({
        success: true,
        message: "Account created successfully",
        user: {
          id: userRecord.uid,
          email: normalizedEmail,
          userType,
          fullName,
        },
      })
    } catch (profileError) {
      console.error("Profile creation error:", profileError)
      // Clean up auth user if profile creation fails
      await adminAuth.deleteUser(userRecord.uid)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create user profile",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}
