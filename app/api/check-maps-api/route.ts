import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if we have the necessary API keys
    const clientKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    const serverKey = process.env.GOOGLE_MAPS_SERVER_API_KEY

    return NextResponse.json({
      clientKeyConfigured: !!clientKey,
      serverKeyConfigured: !!serverKey,
      // Don't expose actual key values, just prefixes for debugging
      clientKeyPrefix: clientKey ? clientKey.substring(0, 8) + "..." : null,
      serverKeyPrefix: serverKey ? serverKey.substring(0, 8) + "..." : null,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
