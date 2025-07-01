import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Create test photographer
    const { data: photographerAuthData, error: photographerAuthError } = await supabase.auth.admin.createUser({
      email: "test@photographer.com",
      password: "password123",
      email_confirm: true,
    })

    if (photographerAuthError) {
      console.error("Error creating photographer auth:", photographerAuthError)
    } else {
      // Create photographer profile
      const { error: photographerProfileError } = await supabase.from("providers").upsert({
        id: photographerAuthData.user.id,
        email: "test@photographer.com",
        name: "Test Photographer",
        status: "approved",
        is_active: true,
      })

      if (photographerProfileError) {
        console.error("Error creating photographer profile:", photographerProfileError)
      }
    }

    // Create test client
    const { data: clientAuthData, error: clientAuthError } = await supabase.auth.admin.createUser({
      email: "test@client.com",
      password: "password123",
      email_confirm: true,
    })

    if (clientAuthError) {
      console.error("Error creating client auth:", clientAuthError)
    } else {
      // Create client profile
      const { error: clientProfileError } = await supabase.from("clients").upsert({
        id: clientAuthData.user.id,
        email: "test@client.com",
        full_name: "Test Client",
      })

      if (clientProfileError) {
        console.error("Error creating client profile:", clientProfileError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Test users created successfully",
    })
  } catch (error) {
    console.error("Error creating test users:", error)
    return NextResponse.json({ error: "Failed to create test users" }, { status: 500 })
  }
}
