import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // First, let's check if we can connect to Supabase
    console.log("Testing Supabase connection...")

    // Try to list existing users first
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error("Error listing users:", listError)
      return NextResponse.json({
        success: false,
        error: `Cannot connect to Supabase Auth: ${listError.message}`,
        step: "list_users",
      })
    }

    console.log("Supabase connection successful. Existing users:", existingUsers.users.length)

    // Check if test user already exists
    const testUserExists = existingUsers.users.find((user) => user.email === "test@fotorra.com")

    if (testUserExists) {
      console.log("Test user already exists:", testUserExists.id)

      // Check if client profile exists
      const { data: clientProfile } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", testUserExists.id)
        .single()

      if (!clientProfile) {
        // Create missing client profile
        const { error: clientError } = await supabase.from("clients").insert({
          user_id: testUserExists.id,
          phone: "555-123-4567",
          address: "123 Test St",
        })

        if (clientError) {
          console.error("Error creating client profile:", clientError)
          return NextResponse.json({
            success: false,
            error: `Failed to create client profile: ${clientError.message}`,
            step: "create_client_profile",
          })
        }
      }

      return NextResponse.json({
        success: true,
        message: "Test user already exists and profile verified",
        email: "test@fotorra.com",
        userId: testUserExists.id,
        existingUsers: existingUsers.users.length,
      })
    }

    // Create test user with Supabase Auth
    console.log("Creating new test user...")
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: "test@fotorra.com",
      password: "Password123!",
      email_confirm: true,
      user_metadata: {
        full_name: "Test User",
        user_type: "client",
      },
    })

    if (createError) {
      console.error("Error creating test user:", createError)
      return NextResponse.json({
        success: false,
        error: `Failed to create user: ${createError.message}`,
        step: "create_user",
      })
    }

    console.log("Test user created successfully:", newUser.user.id)

    // Create client profile in our custom table
    const { error: clientError } = await supabase.from("clients").insert({
      user_id: newUser.user.id,
      phone: "555-123-4567",
      address: "123 Test St",
    })

    if (clientError) {
      console.error("Error creating client profile:", clientError)
      return NextResponse.json({
        success: false,
        error: `Failed to create client profile: ${clientError.message}`,
        step: "create_client_profile",
      })
    }

    return NextResponse.json({
      success: true,
      message: "Test user created successfully",
      email: "test@fotorra.com",
      password: "Password123!",
      userId: newUser.user.id,
      totalUsers: existingUsers.users.length + 1,
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      step: "unexpected_error",
    })
  }
}
