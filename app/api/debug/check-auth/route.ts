import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Test connection by making a simple query
    const {
      data: users,
      error,
      count,
    } = await supabase.auth.admin.listUsers({
      perPage: 10,
      page: 1,
    })

    if (error) {
      console.error("Database connection error:", error)
      return NextResponse.json({
        success: false,
        error: error.message,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Successfully connected to Supabase",
      userCount: count || users?.users?.length || 0,
    })
  } catch (error) {
    console.error("Check auth error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
