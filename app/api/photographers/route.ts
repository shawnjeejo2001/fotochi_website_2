import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Get all approved photographers
    const { data: photographers, error } = await supabase
      .from("providers")
      .select(`
        id,
        name,
        location,
        main_style,
        additional_style1,
        additional_style2,
        bio,
        profile_image,
        portfolio_files,
        price_range,
        rating,
        total_bookings,
        latitude,
        longitude,
        status
      `)
      .eq("status", "approved")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching photographers:", error)
      return NextResponse.json({ error: "Failed to fetch photographers" }, { status: 500 })
    }

    // Transform data for frontend
    const transformedPhotographers = photographers.map((photographer) => ({
      id: photographer.id,
      name: photographer.name,
      location: photographer.location,
      mainStyle: photographer.main_style,
      additionalStyles: [photographer.additional_style1, photographer.additional_style2].filter(Boolean),
      bio: photographer.bio || "Professional photographer ready to capture your special moments.",
      rating: photographer.rating || 4.5,
      reviews: photographer.total_bookings || 0,
      price: photographer.price_range || "$500",
      profileImageUrl: photographer.profile_image,
      portfolioImages: photographer.portfolio_files || [],
    }))

    return NextResponse.json(transformedPhotographers)
  } catch (error) {
    console.error("Error in photographer API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
