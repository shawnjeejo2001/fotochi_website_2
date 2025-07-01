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

    console.log("🔍 Search parameters:", { style, lat, lng, radius })

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

    console.log(`📊 Found ${photographers?.length || 0} total photographers from database`)

    // Debug: Log first photographer's style fields
    if (photographers && photographers.length > 0) {
      console.log("🔍 Sample photographer data:", {
        name: photographers[0].name,
        main_style: photographers[0].main_style,
        additional_style1: photographers[0].additional_style1,
        additional_style2: photographers[0].additional_style2,
        specialty: photographers[0].specialty, // Check if this field exists
        styles: photographers[0].styles, // Check if this field exists
      })
    }

    let filteredPhotographers = photographers || []

    // Enhanced style filtering with more flexible matching
    if (style && style !== "all") {
      console.log(`🎯 Filtering by style: "${style}"`)

      filteredPhotographers = filteredPhotographers.filter((p) => {
        const styleToMatch = style.toLowerCase().trim()

        // Check multiple possible field names and formats
        const mainStyle = p.main_style?.toLowerCase().trim()
        const additionalStyle1 = p.additional_style1?.toLowerCase().trim()
        const additionalStyle2 = p.additional_style2?.toLowerCase().trim()
        const specialty = p.specialty?.toLowerCase().trim()

        // Also check if styles are stored as arrays or comma-separated strings
        let stylesArray = []
        if (p.styles) {
          if (Array.isArray(p.styles)) {
            stylesArray = p.styles.map((s) => s.toLowerCase().trim())
          } else if (typeof p.styles === "string") {
            stylesArray = p.styles.split(",").map((s) => s.toLowerCase().trim())
          }
        }

        const matches =
          mainStyle === styleToMatch ||
          additionalStyle1 === styleToMatch ||
          additionalStyle2 === styleToMatch ||
          specialty === styleToMatch ||
          stylesArray.includes(styleToMatch) ||
          // Partial matching for common variations
          mainStyle?.includes(styleToMatch) ||
          additionalStyle1?.includes(styleToMatch) ||
          additionalStyle2?.includes(styleToMatch) ||
          specialty?.includes(styleToMatch)

        if (matches) {
          console.log(
            `✅ Match found: ${p.name} - styles: ${mainStyle}, ${additionalStyle1}, ${additionalStyle2}, ${specialty}`,
          )
        }

        return matches
      })

      console.log(`🎯 After style filtering: ${filteredPhotographers.length} photographers`)
    }

    if (lat && lng) {
      const searchLat = Number.parseFloat(lat)
      const searchLng = Number.parseFloat(lng)
      console.log(`📍 Filtering by location: ${searchLat}, ${searchLng} within ${radius} miles`)

      filteredPhotographers = filteredPhotographers
        .map((p) => ({ ...p, distance: calculateDistance(searchLat, searchLng, p.latitude, p.longitude) }))
        .filter((p) => p.distance <= radius)
        .sort((a, b) => a.distance - b.distance)

      console.log(`📍 After location filtering: ${filteredPhotographers.length} photographers`)
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
        mainStyle: photographer.main_style || photographer.specialty || "General",
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

    // Debug: Log the styles of returned photographers
    if (transformedPhotographers.length > 0) {
      console.log(
        "🎨 Returned photographer styles:",
        transformedPhotographers.map((p) => ({
          name: p.name,
          mainStyle: p.mainStyle,
          additionalStyles: p.additionalStyles,
        })),
      )
    }

    return NextResponse.json({
      photographers: transformedPhotographers,
      total: transformedPhotographers.length,
      success: true,
    })
  } catch (error) {
    console.error("💥 Error in photographer search:", error)
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
