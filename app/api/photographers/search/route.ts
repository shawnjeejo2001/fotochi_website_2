import { type NextRequest, NextResponse } from "next/server"

// Mock data for preview - replace with real database query
const MOCK_PHOTOGRAPHERS = [
  {
    id: 1,
    name: "Sarah Johnson",
    main_style: "Portrait Photography",
    additional_style1: "Wedding Photography",
    additional_style2: "Event Photography",
    location: "New York, NY",
    lat: 40.7128,
    lng: -74.006,
    rating: 4.9,
    total_bookings: 45,
    profile_image: "/placeholder.svg",
    portfolio_images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
  },
  {
    id: 2,
    name: "Mike Chen",
    main_style: "Wedding Photography",
    additional_style1: "Portrait Photography",
    additional_style2: "Corporate Photography",
    location: "Los Angeles, CA",
    lat: 34.0522,
    lng: -118.2437,
    rating: 4.8,
    total_bookings: 38,
    profile_image: "/placeholder.svg",
    portfolio_images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
  },
  {
    id: 3,
    name: "Emily Davis",
    main_style: "Event Photography",
    additional_style1: "Corporate Photography",
    additional_style2: "Fashion Photography",
    location: "Chicago, IL",
    lat: 41.8781,
    lng: -87.6298,
    rating: 4.7,
    total_bookings: 32,
    profile_image: "/placeholder.svg",
    portfolio_images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
  },
]

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const style = searchParams.get("style")
    const location = searchParams.get("location")
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const radius = searchParams.get("radius")
    const minRating = searchParams.get("minRating")
    const maxPrice = searchParams.get("maxPrice")

    console.debug("Search params:", { style, location, lat, lng, radius, minRating, maxPrice })

    let filteredPhotographers = [...MOCK_PHOTOGRAPHERS]

    // Filter by style
    if (style && style !== "all") {
      filteredPhotographers = filteredPhotographers.filter((p) => {
        const styles = [
          p.main_style?.toLowerCase(),
          p.additional_style1?.toLowerCase(),
          p.additional_style2?.toLowerCase(),
        ].filter(Boolean)

        return styles.some((s) => s?.includes(style.toLowerCase()))
      })
    }

    // Filter by location/radius
    if (lat && lng && radius) {
      const searchLat = Number.parseFloat(lat)
      const searchLng = Number.parseFloat(lng)
      const searchRadius = Number.parseFloat(radius)

      filteredPhotographers = filteredPhotographers.filter((p) => {
        if (!p.lat || !p.lng) return false
        const distance = calculateDistance(searchLat, searchLng, p.lat, p.lng)
        return distance <= searchRadius
      })
    }

    // Filter by rating
    if (minRating) {
      const minRatingNum = Number.parseFloat(minRating)
      filteredPhotographers = filteredPhotographers.filter((p) => p.rating >= minRatingNum)
    }

    const transformedPhotographers = filteredPhotographers.map((photographer) => ({
      ...photographer,
      additionalStyles: [photographer.additional_style1, photographer.additional_style2].filter(Boolean),
    }));


    console.debug(`Found ${transformedPhotographers.length} photographers`)

    return NextResponse.json({
      success: true,
      photographers: transformedPhotographers,
      total: transformedPhotographers.length,
    })
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json({ success: false, error: "Failed to search photographers" }, { status: 500 })
  }
}
