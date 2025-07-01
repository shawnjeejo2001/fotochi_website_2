import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase.from("providers").select("count").limit(1)

    if (connectionError) {
      return NextResponse.json({
        success: false,
        error: "Database connection failed",
        details: connectionError.message,
      })
    }

    // Test auth connection
    const { data: authTest, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      return NextResponse.json({
        success: false,
        error: "Auth connection failed",
        details: authError.message,
      })
    }

    return NextResponse.json({
      success: true,
      message: "All connections working",
      authUsersCount: authTest.users.length,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Unexpected error",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
