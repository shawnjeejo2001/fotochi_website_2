import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Address parameter is required" }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY || process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.error("Google Maps API key not found")
      return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 })
    }

    console.log("Geocoding address:", address)

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address,
    )}&key=${apiKey}&components=country:US`

    const response = await fetch(geocodeUrl)
    const data = await response.json()

    console.log("Google Maps API response status:", data.status)

    if (data.status === "OK" && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location
      console.log("Geocoded coordinates:", location.lat, location.lng)

      return NextResponse.json({
        lat: location.lat,
        lng: location.lng,
        formatted_address: data.results[0].formatted_address,
      })
    } else {
      console.error("Geocoding failed:", data.status, data.error_message)
      return NextResponse.json(
        { error: `Geocoding failed: ${data.status}` },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error in geocoding API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
