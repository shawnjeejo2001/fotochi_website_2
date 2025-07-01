import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// --- Helper Functions & Data (Keep these as they are) ---

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const fakeProfilePictures = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1494790108755-2616c9c0e8e5?w=400&h=400&fit=crop&crop=faces",
]

const fakePortfolioImages = [
  "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=300&fit=crop",
]

// --- Main GET Function ---

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Search API: Starting photographer search...")

    const { searchParams } = new URL(request.url)
    const style = searchParams.get("style")
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const radius = Number.parseInt(searchParams.get("radius") || "50")

    const supabase = createServerSupabaseClient()
    
    // Fetch all approved and active providers
    const { data: photographers, error } = await supabase
      .from("providers")
      .select("*")
      .eq("status", "approved")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Error fetching photographers:", error)
      return NextResponse.json({ error: "Failed to fetch photographers", details: error.message }, { status: 500 })
    }
    
    let filteredPhotographers = photographers || []

    // --- (Filtering logic for style and location remains the same) ---
    if (style && style !== "all") {
        filteredPhotographers = filteredPhotographers.filter((p) => 
            p.main_style?.toLowerCase() === style.toLowerCase() || 
            p.additional_style1?.toLowerCase() === style.toLowerCase() ||
            p.additional_style2?.toLowerCase() === style.toLowerCase()
        );
    }
    
    if (lat && lng) {
        const searchLat = Number.parseFloat(lat);
        const searchLng = Number.parseFloat(lng);
        filteredPhotographers = filteredPhotographers
            .map(p => ({ ...p, distance: calculateDistance(searchLat, searchLng, p.latitude, p.longitude) }))
            .filter(p => p.distance <= radius)
            .sort((a, b) => a.distance - b.distance);
    }
    
    // Transform data for the frontend, ensuring it matches the card's expected props
    const transformedPhotographers = filteredPhotographers.map((photographer, index) => {
      const portfolioImages = photographer.portfolio_files || [
        fakePortfolioImages[(index * 2) % fakePortfolioImages.length],
        fakePortfolioImages[(index * 2 + 1) % fakePortfolioImages.length],
      ]

      return {
        id: photographer.id,
        name: photographer.name || "Unknown Photographer",
        location: photographer.location || "Location not specified",
        mainStyle: photographer.main_style || "General",
        additionalStyles: [photographer.additional_style1, photographer.additional_style2].filter(Boolean),
        rating: photographer.rating || 4.5,
        reviews: photographer.total_bookings || 0,
        price: photographer.price ? `$${photographer.price}` : "$500",
        priceType: photographer.price ? "Starting at" : "per hour",
        portfolioImage: photographer.profile_image || fakeProfilePictures[index % fakeProfilePictures.length],
        portfolioImages: portfolioImages,
        featured_images: photographer.featured_images || portfolioImages.slice(0, 2),
        subscriptionPlan: photographer.subscription_plan || "starter",
        // Add the missing availability and response time data
        availability: ["Mon", "Wed", "Fri", "Sat", "Sun"][index % 5],
        responseTime: ["< 1 hour", "2 hours", "Same day"][index % 3],
      }
    })

    console.log(`✅ Search API: Returning ${transformedPhotographers.length} photographers`)
    return NextResponse.json({
      photographers: transformedPhotographers,
      total: transformedPhotographers.length,
      success: true,
    })
  } catch (error) {
    console.error("💥 Error in photographer search:", error)
    return NextResponse.json({ error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error", success: false }, { status: 500 })
  }
}
