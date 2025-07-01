import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Get user details
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)

    if (userError || !userData?.user) {
      return NextResponse.json({ error: userError?.message || "User not found" }, { status: 404 })
    }

    // Check if user already has profiles
    const { data: providerData } = await supabase.from("providers").select("id").eq("id", userId).single()

    const { data: clientData } = await supabase.from("clients").select("id").eq("id", userId).single()

    const results = {
      user_email: userData.user.email,
      existing_profiles: {
        provider: !!providerData,
        client: !!clientData,
      },
      actions: [],
      errors: [],
    }

    // Create profiles if missing
    if (!providerData && !clientData) {
      // Create client profile by default
      const { error: clientError } = await supabase.from("clients").insert({
        id: userId,
        email: userData.user.email,
        full_name: userData.user.user_metadata?.full_name || "New User",
        created_at: new Date().toISOString(),
      })

      if (clientError) {
        results.errors.push(`Failed to create client profile: ${clientError.message}`)
      } else {
        results.actions.push("Created client profile")
      }

      // Also create provider profile for testing
      const { error: providerError } = await supabase.from("providers").insert({
        id: userId,
        email: userData.user.email,
        name: userData.user.user_metadata?.full_name || "New Photographer",
        status: "approved",
        is_active: true,
        created_at: new Date().toISOString(),
      })

      if (providerError) {
        results.errors.push(`Failed to create provider profile: ${providerError.message}`)
      } else {
        results.actions.push("Created provider profile")
      }
    } else {
      results.actions.push("No action needed - profiles already exist")
    }

    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
