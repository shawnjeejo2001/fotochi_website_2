import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const { status } = await request.json()
    const providerId = params.id

    // Validate status
    if (!["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 })
    }

    // Update provider status
    const { data, error } = await supabase
      .from("providers")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", providerId)
      .select()
      .single()

    if (error) {
      console.error("Error updating provider status:", error)
      return NextResponse.json({ success: false, message: "Failed to update status" }, { status: 500 })
    }

    console.log(`Provider ${providerId} status updated to: ${status}`)

    return NextResponse.json({
      success: true,
      message: `Provider ${status} successfully`,
      provider: data,
    })
  } catch (error) {
    console.error("Error in PATCH /api/providers/[id]/status:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
