import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { email, userType } = await request.json()

    if (!email || !userType) {
      return NextResponse.json({ error: "Email and userType are required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Get the existing user by email
    const { data: existingUser, error: getUserError } = await supabase.auth.admin.getUserByEmail(email)

    if (getUserError || !existingUser?.user) {
      return NextResponse.json({ error: "User not found in auth system" }, { status: 404 })
    }

    const userId = existingUser.user.id

    // Create the appropriate profile
    if (userType === "provider" || userType === "photographer") {
      const { error: providerError } = await supabase.from("providers").upsert(
        {
          id: userId,
          email: email.toLowerCase(),
          name: "Your Name", // User can update this later
          status: "approved",
          is_active: true,
          location: "",
          bio: "",
          services: ["Photography"],
          hourly_rate: 100,
        },
        { onConflict: "id" },
      )

      if (providerError) {
        return NextResponse.json(
          { error: `Failed to create provider profile: ${providerError.message}` },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        message: "Photographer profile created successfully",
        userId,
        userType: "provider",
      })
    } else if (userType === "client") {
      const { error: clientError } = await supabase.from("clients").upsert(
        {
          id: userId,
          email: email.toLowerCase(),
          full_name: "Your Name", // User can update this later
        },
        { onConflict: "id" },
      )

      if (clientError) {
        return NextResponse.json({ error: `Failed to create client profile: ${clientError.message}` }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Client profile created successfully",
        userId,
        userType: "client",
      })
    }

    return NextResponse.json({ error: "Invalid user type" }, { status: 400 })
  } catch (error) {
    console.error("Fix account error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
