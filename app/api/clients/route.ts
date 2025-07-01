import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { email, password, fullName, phone, address } = await request.json()
    console.log("Creating client account for:", email)

    if (!email || !password || !fullName) {
      return NextResponse.json(
        {
          success: false,
          error: "Email, password, and full name are required",
        },
        { status: 400 },
      )
    }

    const supabase = createServerSupabaseClient()

    // Step 1: Create user in Supabase Auth
    console.log("Step 1: Creating auth user...")
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        user_type: "client",
        full_name: fullName,
      },
    })

    if (authError) {
      console.error("Auth user creation failed:", authError)
      return NextResponse.json(
        {
          success: false,
          error: `Failed to create user account: ${authError.message}`,
          step: "auth_creation",
        },
        { status: 400 },
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        {
          success: false,
          error: "No user returned from auth creation",
          step: "auth_creation",
        },
        { status: 400 },
      )
    }

    console.log("Auth user created successfully:", authData.user.id)

    // Step 2: Create client profile
    console.log("Step 2: Creating client profile...")
    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .insert({
        user_id: authData.user.id,
        phone: phone || null,
        address: address || null,
      })
      .select()
      .single()

    if (clientError) {
      console.error("Client profile creation failed:", clientError)

      // Clean up: Delete the auth user if profile creation fails
      console.log("Cleaning up auth user...")
      await supabase.auth.admin.deleteUser(authData.user.id)

      return NextResponse.json(
        {
          success: false,
          error: `Failed to create client profile: ${clientError.message}`,
          step: "profile_creation",
        },
        { status: 400 },
      )
    }

    console.log("Client profile created successfully:", clientData.id)

    return NextResponse.json({
      success: true,
      message: "Client account created successfully",
      user: {
        id: authData.user.id,
        email: authData.user.email,
        userType: "client",
      },
      profile: clientData,
    })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
        step: "unknown",
      },
      { status: 500 },
    )
  }
}
