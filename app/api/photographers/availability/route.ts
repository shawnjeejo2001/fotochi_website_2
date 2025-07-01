import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, availableDates, unavailableDates } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Update photographer availability
    const { error } = await supabase
      .from("providers")
      .update({
        available_dates: availableDates,
        unavailable_dates: unavailableDates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("Error updating availability:", error)
      return NextResponse.json({ error: "Failed to update availability" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Availability updated successfully",
    })
  } catch (error) {
    console.error("Availability update error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("providers")
      .select("available_dates, unavailable_dates")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Error fetching availability:", error)
      return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 })
    }

    return NextResponse.json({
      availableDates: data.available_dates || [],
      unavailableDates: data.unavailable_dates || [],
    })
  } catch (error) {
    console.error("Availability fetch error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
