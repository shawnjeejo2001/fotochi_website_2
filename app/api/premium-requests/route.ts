import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email, name, message } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Try to insert into the premium_requests table
    const { data, error } = await supabase
      .from("premium_requests")
      .insert({
        email: email,
        name: name || "Unknown",
        message: message || "Premium membership request",
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to submit request" }, { status: 500 })
    }

    console.log("Premium request saved successfully:", data)

    return NextResponse.json({
      success: true,
      message: "Premium membership request submitted successfully",
      data: data[0],
    })
  } catch (error) {
    console.error("Error in premium request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Fetch all premium requests
    const { data, error } = await supabase
      .from("premium_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching premium requests:", error)
      return NextResponse.json({
        success: false,
        error: "Failed to fetch premium requests",
        requests: [],
      })
    }

    return NextResponse.json({
      success: true,
      requests: data || [],
    })
  } catch (error) {
    console.error("Error in GET premium requests:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error",
      requests: [],
    })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json()

    if (!id || !status) {
      return NextResponse.json({ error: "ID and status are required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("premium_requests")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error updating premium request:", error)
      return NextResponse.json({ error: "Failed to update request" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Premium request updated successfully",
      data: data[0],
    })
  } catch (error) {
    console.error("Error in PATCH premium requests:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
