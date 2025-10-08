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

      let topRatedPhotographers: any[] | null = null

      // Try ordering by rating / total_bookings first
      let { data, error } = await supabase
        .from("providers")
        .select("*")
        .eq("status", "approved")
        .eq("is_active", true)
        .neq("subscription_plan", "premium")
        .order("rating", { ascending: false })
        .order("total_bookings", { ascending: false })
        .limit(remainingSlots)

      if (error) {
        console.warn("⚠️  Falling back to created_at ordering because:", error.message)
        // Retry with a simpler ordering guaranteed to exist
        const fallback = await supabase
          .from("providers")
          .select("*")
          .eq("status", "approved")
          .eq("is_active", true)
          .neq("subscription_plan", "premium")
          .order("created_at", { ascending: false })
          .limit(remainingSlots)

        data = fallback.data
        error = fallback.error
      }

      if (error) {
        console.error("❌ Error fetching top-rated photographers:", error)
      } else {
        topRatedPhotographers = data
      }

      if (topRatedPhotographers) {
        featuredPhotographers = [...featuredPhotographers, ...topRatedPhotographers]
      }
    }

    featuredPhotographers = featuredPhotographers.slice(0, 6)

    console.log(`✅ Featured API: Found ${featuredPhotographers.length} featured photographers`)

    // Transform data for frontend
    const transformedPhotographers = featuredPhotographers.map((photographer) => ({
      id: photographer.id,
      name: photographer.name || "Unknown Photographer",
      location: photographer.location || "Location not specified",
      mainStyle: photographer.main_style || "General",
      additionalStyles: photographer.additional_styles || [],
      rating: photographer.rating || 4.5,
      reviews: photographer.review_count || 0,
      price: photographer.price_range || "$500",
      priceType: photographer.price_range ? `Starting at ${photographer.price_range}` : "Starting at $500",
      portfolioImage: photographer.profile_picture_url || "/placeholder-user.jpg",
      portfolioImages: photographer.portfolio_images || [],
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
