import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Check all users in auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      return NextResponse.json({
        success: false,
        error: `Auth error: ${authError.message}`,
      })
    }

    // Check clients table
    const { data: clients, error: clientsError } = await supabase.from("clients").select("*")

    // Check providers table
    const { data: providers, error: providersError } = await supabase.from("providers").select("*")

    return NextResponse.json({
      success: true,
      authUsers: authUsers.users.map((u) => ({
        id: u.id,
        email: u.email,
        metadata: u.user_metadata,
        created: u.created_at,
      })),
      clients: clients || [],
      providers: providers || [],
      clientsError: clientsError?.message,
      providersError: providersError?.message,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
