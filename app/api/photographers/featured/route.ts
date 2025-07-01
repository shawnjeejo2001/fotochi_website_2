import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    console.log("🌟 Featured API: Fetching featured photographers...")

    const supabase = createServerSupabaseClient()

    // First, try to get premium photographers
    const { data: premiumPhotographers, error: premiumError } = await supabase
      .from("providers")
      .select("*")
      .eq("status", "approved")
      .eq("is_active", true)
      .eq("subscription_plan", "premium")
      .order("created_at", { ascending: false })
      .limit(6)

    if (premiumError) {
      console.error("❌ Error fetching premium photographers:", premiumError)
    }

    let featuredPhotographers = premiumPhotographers || []

    // If we don't have enough premium photographers, fill with highest-rated ones
    if (featuredPhotographers.length < 6) {
      const remainingSlots = 6 - featuredPhotographers.length

      const { data: topRatedPhotographers, error: topRatedError } = await supabase
        .from("providers")
        .select("*")
        .select("*")
        .eq("status", "approved")
        .eq("is_active", true)
        .neq("subscription_plan", "premium")
        .order("rating", { ascending: false })
        .order("total_bookings", { ascending: false })
        .limit(remainingSlots)

      if (topRatedError) {
        console.error("❌ Error fetching top-rated photographers:", topRatedError)
      } else {
        featuredPhotographers = [...featuredPhotographers, ...(topRatedPhotographers || [])]
      }
    }

    console.log(`✅ Featured API: Found ${featuredPhotographers.length} featured photographers`)

    // Transform data for frontend
    const transformedPhotographers = featuredPhotographers.map((photographer) => ({
      id: photographer.id,
      name: photographer.name || photographer.full_name || "Unknown Photographer",
      location: photographer.location || photographer.city || "Location not specified",
      mainStyle: photographer.main_style || photographer.style || "General",
      additionalStyles: [photographer.additional_style1, photographer.additional_style2].filter(Boolean),
      rating: photographer.rating || 4.5,
      reviews: photographer.total_bookings || 0,
      price: photographer.price ? `$${photographer.price}` : "$500",
      priceType: photographer.price ? `Starting at $${photographer.price}` : "Starting at $500",
      portfolioImage: photographer.profile_image,
      portfolioImages: photographer.portfolio_files || [],
      subscriptionPlan: photographer.subscription_plan || "starter",
    }))

    return NextResponse.json({
      photographers: transformedPhotographers,
      total: transformedPhotographers.length,
      success: true,
    })
  } catch (error) {
    console.error("💥 Error in featured photographers:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 },
    )
  }
}
