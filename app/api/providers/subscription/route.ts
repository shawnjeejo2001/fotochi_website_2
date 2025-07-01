import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { userId, plan } = await request.json()

    if (!userId || !plan) {
      return NextResponse.json({ success: false, message: "User ID and plan are required" }, { status: 400 })
    }

    // Update provider subscription plan
    const { error } = await supabase
      .from("providers")
      .update({
        subscription_plan: plan,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (error) {
      console.error("Error updating subscription:", error)
      return NextResponse.json({ success: false, message: "Failed to update subscription" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Subscription updated successfully",
    })
  } catch (error) {
    console.error("Error in subscription update:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
