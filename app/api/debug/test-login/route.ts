import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    const supabase = createServerSupabaseClient()

    console.log("Testing login for:", email)

    // Try to sign in with the provided credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Login test failed:", error)
      return NextResponse.json({
        success: false,
        error: error.message,
        errorCode: error.status,
      })
    }

    if (!data.user) {
      return NextResponse.json({
        success: false,
        error: "No user returned from authentication",
      })
    }

    console.log("Login test successful for user:", data.user.id)

    return NextResponse.json({
      success: true,
      message: "Login test successful",
      user: {
        id: data.user.id,
        email: data.user.email,
        metadata: data.user.user_metadata,
      },
    })
  } catch (error) {
    console.error("Test login error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
