import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

/**
 * GET /api/photographers
 * Returns a list of approved photographers with flexible field mapping so we
 * never break when the DB schema changes.
 */
export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    /* 1️⃣  Fetch every column (safer) from approved providers */
    const { data, error } = await supabase
      .from("providers")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching photographers:", error)
      return NextResponse.json({ error: "Failed to fetch photographers" }, { status: 500 })
    }

    /* 2️⃣  Helper to safely read the *first* existing field */
    const pick = <T extends Record<string, any>>(row: T, ...fields: (keyof T)[]) => {
      for (const f of fields) {
        const val = row[f]
        if (val !== null && val !== undefined && val !== "") return val
      }
      return null
    }

    /* 3️⃣  Transform rows for the front-end */
    const photographers = (data ?? []).map((p) => ({
      id: p.id,
      name: pick(p, "name", "full_name", "photographer_name") ?? "Unnamed",
      location: pick(p, "location", "city", "address") ?? "—",
      mainStyle: pick(p, "main_style", "style", "specialty") ?? "Photography",
      additionalStyles: [p.additional_style1, p.additional_style2, p.style2, p.style3].filter(Boolean),
      bio:
        pick(p, "bio", "about", "description", "summary") ??
        "Professional photographer ready to capture your special moments.",
      rating: p.rating ?? 4.5,
      reviews: p.total_bookings ?? 0,
      price: pick(p, "price_range", "pricing", "hourly_rate", "base_price") ?? "$500",
      profileImageUrl: pick(p, "profile_image", "avatar", "image"),
      portfolioImages: pick(p, "portfolio_files", "portfolio", "gallery") ?? [],
    }))

    return NextResponse.json(photographers)
  } catch (e: any) {
    console.error("Unhandled error in photographers API:", e)
    return NextResponse.json({ error: "Internal server error", details: e.message }, { status: 500 })
  }
}
