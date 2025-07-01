import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  console.log("Geocode API: Called")

  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Address parameter is required" }, { status: 400 })
    }

    console.log("Geocode API: Looking up address:", address)

    // Use server-side API key (without referrer restrictions)
    const serverApiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY || process.env.GOOGLE_MAPS_API_KEY

    if (!serverApiKey) {
      console.error("Geocode API: No server-side Google Maps API key found")
      return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 })
    }

    console.log("Geocode API: Using server API key:", serverApiKey.substring(0, 10) + "...")

    // Call Google Geocoding API
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${serverApiKey}`
    console.log("Geocode API: Calling URL:", geocodeUrl.replace(serverApiKey, "API_KEY_HIDDEN"))

    const response = await fetch(geocodeUrl)
    const data = await response.json()

    console.log("Geocode API: Response status:", response.status)
    console.log("Geocode API: Response data:", JSON.stringify(data, null, 2))

    if (!response.ok) {
      console.error("Geocode API: HTTP error:", response.status, data)
      return NextResponse.json(
        {
          error: "Failed to geocode address",
          details: data,
          status: response.status,
        },
        { status: 500 },
      )
    }

    if (data.status === "OK" && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location
      console.log("Geocode API: Found coordinates:", location)

      return NextResponse.json({
        lat: location.lat,
        lng: location.lng,
        formatted_address: data.results[0].formatted_address,
      })
    } else {
      console.log("Geocode API: Google API status:", data.status)
      console.log("Geocode API: Error message:", data.error_message)

      // Return specific error based on Google's response
      let errorMessage = "Address not found"
      if (data.status === "REQUEST_DENIED") {
        errorMessage = "API key invalid or geocoding not enabled"
      } else if (data.status === "OVER_QUERY_LIMIT") {
        errorMessage = "API quota exceeded"
      } else if (data.status === "ZERO_RESULTS") {
        errorMessage = "No results found for this address"
      }

      return NextResponse.json(
        {
          error: errorMessage,
          google_status: data.status,
          google_error: data.error_message,
        },
        { status: 404 },
      )
    }
  } catch (error: any) {
    console.error("Geocode API: Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // This route is no longer needed since we're doing geocoding on the client side
  // We'll keep it as a fallback but it won't be used in the main flow
  return NextResponse.json(
    { error: "This API is deprecated. Geocoding now happens on the client side." },
    { status: 404 },
  )
}
