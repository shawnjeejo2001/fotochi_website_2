import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

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

// Fake profile pictures for photographers without images
const fakeProfilePictures = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1494790108755-2616c9c0e8e5?w=400&h=400&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces",
]

// Fake portfolio images for photographers
const fakePortfolioImages = [
  "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
]

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Search API: Starting photographer search...")

    const { searchParams } = new URL(request.url)
    const style = searchParams.get("style")
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const radius = Number.parseInt(searchParams.get("radius") || "50")

    console.log("📊 Search API: Received params:", { style, lat, lng, radius })

    const supabase = createServerSupabaseClient()

    // First, let's get ALL columns to see what's actually available
    const { data: sampleData, error: sampleError } = await supabase.from("providers").select("*").limit(1)

    if (sampleError) {
      console.error("❌ Error checking table schema:", sampleError)
      return NextResponse.json({ error: "Failed to check table schema", details: sampleError.message }, { status: 500 })
    }

    // Log available columns for debugging
    const availableColumns = sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]) : []
    console.log("📋 Available columns in providers table:", availableColumns)

    // Get all providers with only basic columns that should exist
    const { data: photographers, error } = await supabase
      .from("providers")
      .select("*") // Select all columns to see what we have
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Error fetching photographers:", error)
      return NextResponse.json({ error: "Failed to fetch photographers", details: error.message }, { status: 500 })
    }

    console.log(`📊 Search API: Found ${photographers?.length || 0} total photographers`)

    // Log the first photographer to see the actual data structure
    if (photographers && photographers.length > 0) {
      console.log("📋 Sample photographer data:", photographers[0])
    }

    let filteredPhotographers = photographers || []

    // Filter by status if the column exists
    if (filteredPhotographers.length > 0 && "status" in filteredPhotographers[0]) {
      filteredPhotographers = filteredPhotographers.filter((p) => p.status === "approved")
      console.log(`✅ Filtered by status: ${filteredPhotographers.length} approved photographers`)
    }

    // Filter by active status if the column exists
    if (filteredPhotographers.length > 0 && "is_active" in filteredPhotographers[0]) {
      filteredPhotographers = filteredPhotographers.filter((p) => p.is_active === true)
      console.log(`✅ Filtered by is_active: ${filteredPhotographers.length} active photographers`)
    }

    // Filter by style if provided and the column exists
    if (style && style !== "all" && filteredPhotographers.length > 0) {
      console.log("🎨 Search API: Filtering by style:", style)
      const beforeCount = filteredPhotographers.length

      filteredPhotographers = filteredPhotographers.filter((photographer) => {
        const mainStyle = photographer.main_style || photographer.style || photographer.photography_style
        const additionalStyle1 = photographer.additional_style1 || photographer.style2
        const additionalStyle2 = photographer.additional_style2 || photographer.style3

        return (
          mainStyle?.toLowerCase() === style.toLowerCase() ||
          additionalStyle1?.toLowerCase() === style.toLowerCase() ||
          additionalStyle2?.toLowerCase() === style.toLowerCase()
        )
      })

      console.log(`🎨 Style filter: ${beforeCount} → ${filteredPhotographers.length} photographers`)
    }

    // Filter by location if coordinates provided and location columns exist
    if (lat && lng && filteredPhotographers.length > 0) {
      console.log("📍 Search API: Filtering by location within", radius, "miles")
      const searchLat = Number.parseFloat(lat)
      const searchLng = Number.parseFloat(lng)
      const beforeCount = filteredPhotographers.length

      // Check if location columns exist
      const hasLatitude = "latitude" in filteredPhotographers[0] || "lat" in filteredPhotographers[0]
      const hasLongitude = "longitude" in filteredPhotographers[0] || "lng" in filteredPhotographers[0]

      if (hasLatitude && hasLongitude) {
        // Calculate distance for each photographer
        const photographersWithDistance = filteredPhotographers.map((photographer) => {
          const photoLat = photographer.latitude || photographer.lat
          const photoLng = photographer.longitude || photographer.lng

          if (!photoLat || !photoLng) {
            return { ...photographer, distance: Number.POSITIVE_INFINITY }
          }

          const distance = calculateDistance(searchLat, searchLng, photoLat, photoLng)
          return { ...photographer, distance }
        })

        // Filter to only include photographers within the radius
        filteredPhotographers = photographersWithDistance
          .filter((photographer) => photographer.distance <= radius)
          .sort((a, b) => a.distance - b.distance)

        console.log(
          `📍 Location filter: ${beforeCount} → ${filteredPhotographers.length} photographers within ${radius} miles`,
        )
      } else {
        console.log("⚠️ No location columns found, skipping location filter")
      }
    }

    // Prioritize premium photographers in search results
    if (filteredPhotographers.length > 0) {
      filteredPhotographers.sort((a, b) => {
        // Premium photographers first
        const aPremium = a.subscription_plan === "premium" ? 1 : 0
        const bPremium = b.subscription_plan === "premium" ? 1 : 0

        if (aPremium !== bPremium) {
          return bPremium - aPremium // Premium first
        }

        // Then by rating
        const aRating = a.rating || 0
        const bRating = b.rating || 0

        if (aRating !== bRating) {
          return bRating - aRating // Higher rating first
        }

        // Then by distance if available
        if ((a as any).distance !== undefined && (b as any).distance !== undefined) {
          return (a as any).distance - (b as any).distance // Closer first
        }

        return 0
      })
    }

    // Transform data for frontend with flexible field mapping and fake images
    const transformedPhotographers = filteredPhotographers.map((photographer, index) => {
      // Get or assign fake profile picture
      const profileImage =
        photographer.profile_image ||
        photographer.avatar ||
        photographer.photo ||
        fakeProfilePictures[index % fakeProfilePictures.length]

      // Get or assign fake portfolio images
      const portfolioImages = photographer.portfolio_files ||
        photographer.portfolio_images ||
        photographer.gallery || [
          fakePortfolioImages[(index * 2) % fakePortfolioImages.length],
          fakePortfolioImages[(index * 2 + 1) % fakePortfolioImages.length],
        ]

      return {
        id: photographer.id,
        name: photographer.name || photographer.full_name || photographer.display_name || "Unknown Photographer",
        location: photographer.location || photographer.city || photographer.address || "Location not specified",
        mainStyle: photographer.main_style || photographer.style || photographer.photography_style || "General",
        main_style: photographer.main_style || photographer.style || photographer.photography_style || "General",
        additionalStyles: [
          photographer.additional_style1 || photographer.style2,
          photographer.additional_style2 || photographer.style3,
        ].filter(Boolean),
        rating: photographer.rating || 4.5,
        reviews: photographer.total_bookings || photographer.bookings_count || 0,
        price: photographer.price
          ? `$${photographer.price}`
          : photographer.hourly_rate
            ? `$${photographer.hourly_rate}/hr`
            : "$500",
        price_range: photographer.price
          ? `$${photographer.price}`
          : photographer.hourly_rate
            ? `$${photographer.hourly_rate}/hr`
            : "$500",
        portfolioImage: profileImage,
        profile_image: profileImage,
        portfolioImages: portfolioImages,
        featured_images: portfolioImages,
        // Include coordinates if available
        coordinates: {
          lat: photographer.latitude || photographer.lat || null,
          lng: photographer.longitude || photographer.lng || null,
        },
        distance: (photographer as any).distance,
      }
    })

    console.log(`✅ Search API: Returning ${transformedPhotographers.length} photographers with fake images`)
    return NextResponse.json({
      photographers: transformedPhotographers,
      total: transformedPhotographers.length,
      success: true,
      availableColumns: availableColumns, // Include this for debugging
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
