import { NextResponse } from "next/server"

export async function GET() {
  // Only return the client-safe Google Maps API key
  return NextResponse.json({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  })
}
