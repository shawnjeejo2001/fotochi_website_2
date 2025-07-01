import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { providerId, membershipTier } = await request.json()

    if (!providerId || !membershipTier) {
      return NextResponse.json({ error: "Provider ID and membership tier are required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Update the provider's membership tier
    const { data, error } = await supabase
      .from("providers")
      .update({
        membership_tier: membershipTier,
        updated_at: new Date().toISOString(),
      })
      .eq("id", providerId)
      .select()

    if (error) {
      console.error("Error updating membership:", error)
      return NextResponse.json({ error: "Failed to update membership" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Membership updated successfully",
      data: data[0],
    })
  } catch (error) {
    console.error("Error in update membership:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
