import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient()

    // Get all authenticated users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    const results = {
      total_users: authUsers.users.length,
      profiles_created: 0,
      errors: [],
      details: [],
    }

    // For each auth user, check if they have a profile and create one if not
    for (const user of authUsers.users) {
      try {
        // Check if user already has a provider profile
        const { data: providerData } = await supabase.from("providers").select("id").eq("id", user.id).single()

        // Check if user already has a client profile
        const { data: clientData } = await supabase.from("clients").select("id").eq("id", user.id).single()

        // If no profile exists, create a client profile by default
        if (!providerData && !clientData) {
          const { error: insertError } = await supabase.from("clients").insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || "New User",
            created_at: new Date().toISOString(),
          })

          if (insertError) {
            results.errors.push(`Failed to create profile for ${user.email}: ${insertError.message}`)
          } else {
            results.profiles_created++
            results.details.push(`Created client profile for ${user.email}`)
          }
        } else {
          results.details.push(`User ${user.email} already has a profile`)
        }
      } catch (error) {
        results.errors.push(
          `Error processing user ${user.email}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
