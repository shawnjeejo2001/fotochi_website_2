import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { email, password, userType } = await request.json()
    console.log("Testing registration for:", email, "as", userType)

    const supabase = createServerSupabaseClient()

    // Step 1: Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        user_type: userType,
        full_name: "Test User",
      },
    })

    if (authError) {
      return NextResponse.json({
        success: false,
        error: `Auth creation failed: ${authError.message}`,
        step: "auth_creation",
      })
    }

    // Step 2: Create profile based on user type
    let profileData = null
    let profileError = null

    if (userType === "client") {
      const { data, error } = await supabase
        .from("clients")
        .insert({
          user_id: authData.user.id,
          phone: "123-456-7890",
          address: "Test Address",
        })
        .select()
        .single()

      profileData = data
      profileError = error
    } else if (userType === "provider") {
      const { data, error } = await supabase
        .from("providers")
        .insert({
          user_id: authData.user.id,
          name: "Test Provider",
          service: "Photography",
          status: "pending",
        })
        .select()
        .single()

      profileData = data
      profileError = error
    }

    if (profileError) {
      // Clean up auth user
      await supabase.auth.admin.deleteUser(authData.user.id)

      return NextResponse.json({
        success: false,
        error: `Profile creation failed: ${profileError.message}`,
        step: "profile_creation",
      })
    }

    return NextResponse.json({
      success: true,
      message: "Test registration successful",
      authUser: {
        id: authData.user.id,
        email: authData.user.email,
      },
      profile: profileData,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      step: "unknown",
    })
  }
}
