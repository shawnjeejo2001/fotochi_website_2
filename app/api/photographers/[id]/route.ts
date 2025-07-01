import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  console.log("🔍 FETCHING PHOTOGRAPHER DATA for ID:", params.id)

  try {
    const { id } = params

    // Try to find photographer by user_id first, then by id
    let photographer = null

    const { data: byUserId, error: userIdError } = await supabase
      .from("providers")
      .select("*")
      .eq("user_id", id)
      .single()

    if (byUserId) {
      photographer = byUserId
      console.log("✅ Found photographer by user_id:", photographer)
    } else {
      const { data: byId, error: idError } = await supabase.from("providers").select("*").eq("id", id).single()

      if (byId) {
        photographer = byId
        console.log("✅ Found photographer by id:", photographer)
      } else {
        console.log("❌ Photographer not found:", { userIdError, idError })
        return NextResponse.json({ error: "Photographer not found" }, { status: 404 })
      }
    }

    console.log("📋 Returning photographer data:", {
      id: photographer.id,
      user_id: photographer.user_id,
      profile_image: photographer.profile_image,
      updated_at: photographer.updated_at,
    })

    return NextResponse.json(photographer)
  } catch (error) {
    console.error("💥 Error fetching photographer:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
