import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST() {
  try {
    const supabase = createServerSupabaseClient()

    // Helper function to get or create user
    async function getOrCreateUser(email: string, password: string) {
      // First try to get existing user
      const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email)

      if (existingUser?.user) {
        console.log(`User ${email} already exists with ID: ${existingUser.user.id}`)
        return { user: existingUser.user, created: false }
      }

      // If user doesn't exist, create them
      const { data: newUser, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

      if (error) {
        console.error(`Error creating user ${email}:`, error)
        return { user: null, created: false, error }
      }

      console.log(`Created new user ${email} with ID: ${newUser.user.id}`)
      return { user: newUser.user, created: true }
    }

    const results = []

    // Handle test photographer
    const photographerResult = await getOrCreateUser("test@photographer.com", "password123")
    if (photographerResult.user) {
      const { error: photographerProfileError } = await supabase.from("providers").upsert(
        {
          id: photographerResult.user.id,
          email: "test@photographer.com",
          name: "Test Photographer",
          status: "approved",
          is_active: true,
          location: "New York, NY",
          bio: "Test photographer for demo purposes",
          services: ["Photography", "Videography"],
          hourly_rate: 150,
        },
        { onConflict: "id" },
      )

      if (photographerProfileError) {
        console.error("Error upserting photographer profile:", photographerProfileError)
        results.push(`Photographer profile error: ${photographerProfileError.message}`)
      } else {
        results.push(`✅ Photographer profile created/updated for ${photographerResult.user.email}`)
      }
    }

    // Handle test client
    const clientResult = await getOrCreateUser("test@client.com", "password123")
    if (clientResult.user) {
      const { error: clientProfileError } = await supabase.from("clients").upsert(
        {
          id: clientResult.user.id,
          email: "test@client.com",
          full_name: "Test Client",
        },
        { onConflict: "id" },
      )

      if (clientProfileError) {
        console.error("Error upserting client profile:", clientProfileError)
        results.push(`Client profile error: ${clientProfileError.message}`)
      } else {
        results.push(`✅ Client profile created/updated for ${clientResult.user.email}`)
      }
    }

    // Handle admin user
    const adminResult = await getOrCreateUser("admin@fotorra.com", "admin123")
    if (adminResult.user) {
      // Admin doesn't need a separate profile table, just mark in auth metadata
      const { error: adminUpdateError } = await supabase.auth.admin.updateUserById(adminResult.user.id, {
        user_metadata: { role: "admin" },
      })

      if (adminUpdateError) {
        console.error("Error updating admin metadata:", adminUpdateError)
        results.push(`Admin metadata error: ${adminUpdateError.message}`)
      } else {
        results.push(`✅ Admin user created/updated for ${adminResult.user.email}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database setup completed",
      results,
      accounts: [
        "test@photographer.com / password123 (Photographer)",
        "test@client.com / password123 (Client)",
        "admin@fotorra.com / admin123 (Admin)",
      ],
    })
  } catch (error) {
    console.error("Database setup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Database setup failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
