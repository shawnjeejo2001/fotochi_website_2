import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

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

    const supabase = createServerSupabaseClient()

    // First, create the auth user
    console.log("Creating auth user...")
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true, // Auto-confirm email for now
      user_metadata: {
        user_type: userType,
        full_name: fullName,
      },
    })

    if (authError) {
      console.error("Auth creation error:", authError)
      return NextResponse.json(
        {
          success: false,
          error: authError.message,
        },
        { status: 400 },
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create user account",
        },
        { status: 500 },
      )
    }

    console.log("Auth user created successfully:", authData.user.id)

    try {
      // Create the appropriate profile based on user type
      if (userType === "client") {
        console.log("Creating client profile...")
        const { error: clientError } = await supabase.from("clients").insert({
          user_id: authData.user.id,
          full_name: fullName || "",
          phone: phone || null,
          address: address || null,
          created_at: new Date().toISOString(),
        })

        if (clientError) {
          console.error("Client creation error:", clientError)
          // Clean up auth user if client creation fails
          await supabase.auth.admin.deleteUser(authData.user.id)
          return NextResponse.json(
            {
              success: false,
              error: "Failed to create client profile",
            },
            { status: 500 },
          )
        }

        console.log("Client profile created successfully")
      } else {
        // Clean up auth user for invalid user type
        await supabase.auth.admin.deleteUser(authData.user.id)
        return NextResponse.json(
          {
            success: false,
            error: "Invalid user type. Use /api/providers for photographer/videographer signup.",
          },
          { status: 400 },
        )
      }

      return NextResponse.json({
        success: true,
        message: "Account created successfully",
        user: {
          id: authData.user.id,
          email: normalizedEmail,
          userType,
          fullName,
        },
      })
    } catch (profileError) {
      console.error("Profile creation error:", profileError)
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
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
