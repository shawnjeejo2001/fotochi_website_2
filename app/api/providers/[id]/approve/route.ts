import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { action } = await request.json() // 'approve' or 'reject'
    const supabase = createServerSupabaseClient()

    if (action === "approve") {
      // Approve the provider and activate their account
      const { data, error } = await supabase
        .from("providers")
        .update({
          status: "approved",
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)
        .select()
        .single()

      if (error) {
        console.error("Error approving provider:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Provider approved successfully! Their portfolio is now active.",
        provider: data,
      })
    } else if (action === "reject") {
      // Reject the provider
      const { data, error } = await supabase
        .from("providers")
        .update({
          status: "rejected",
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)
        .select()
        .single()

      if (error) {
        console.error("Error rejecting provider:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Provider application rejected.",
        provider: data,
      })
    } else {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in provider approval:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
