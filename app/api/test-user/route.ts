import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Create a test user if it doesn't exist
    const testEmail = "test@fotorra.com"
    const testPassword = "Test123!"

    // Check if user exists
    const { data: existingUser } = await supabase.from("users").select("*").eq("email", testEmail).single()

    if (!existingUser) {
      // Hash password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(testPassword, salt)

      // Create user
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert({
          email: testEmail,
          password_hash: hashedPassword,
          user_type: "client",
          name: "Test User",
          created_at: new Date().toISOString(),
        })
        .select()

      if (userError) {
        return NextResponse.json({ success: false, message: "Failed to create test user", error: userError.message })
      }

      return NextResponse.json({
        success: true,
        message: "Test user created",
        user: { email: testEmail, password: testPassword },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Test user already exists",
      user: { email: testEmail, password: testPassword },
    })
  } catch (error) {
    console.error("Error creating test user:", error)
    return NextResponse.json({ success: false, message: "Internal server error" })
  }
}
