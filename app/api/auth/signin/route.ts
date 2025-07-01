import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

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

    const supabase = createServerSupabaseClient()

    // Attempt to sign in the user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    })

    if (authError) {
      console.error("Authentication failed:", authError)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 },
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication failed",
        },
        { status: 401 },
      )
    }

    console.log("User authenticated successfully:", authData.user.id)

    // Determine user type and fetch profile
    let userProfile = null
    let userType = "client" // default

    // Check if user is a client
    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", authData.user.id)
      .single()

    if (clientData && !clientError) {
      userProfile = clientData
      userType = "client"
    } else {
      // Check if user is a provider
      const { data: providerData, error: providerError } = await supabase
        .from("providers")
        .select("*")
        .eq("user_id", authData.user.id)
        .single()

      if (providerData && !providerError) {
        userProfile = providerData
        userType = "provider"
      }
    }

    if (!userProfile) {
      console.error("No profile found for user:", authData.user.id)
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
        id: authData.user.id,
        email: authData.user.email,
        user_type: userType,
        full_name: userProfile.full_name || userProfile.name,
        profile_image: userProfile.profile_image || null,
        provider: userType === "provider" ? userProfile : null,
        client: userType === "client" ? userProfile : null,
      },
    })
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
