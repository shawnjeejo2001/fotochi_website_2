/* eslint-disable @typescript-eslint/consistent-type-imports */
// 'use server' – route handlers run on the server by default in Next.js,
// so we don't need the directive.

import { NextResponse } from "next/server"

// ---------------------------------------------------------------------------
// 1)  Helpers
// ---------------------------------------------------------------------------

// Convert degrees → radians
const toRad = (deg: number) => (deg * Math.PI) / 180

// Haversine distance (miles)
function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 3959 // radius of Earth - miles
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Case-insensitive / trimmed comparison
const normalise = (s: string | undefined) => (s ?? "").trim().toLowerCase()

// ---------------------------------------------------------------------------
// 2)  Mock data   (replace with a DB query in real deployment)
// ---------------------------------------------------------------------------

interface Photographer {
  id: number
  name: string
  location: string
  mainStyle: string
  additionalStyles: string[]
  rating: number
  reviews: number
  price: string
  priceType: string
  portfolioImage?: string
  profile_image?: string
  portfolioImages?: string[]
  // …any other fields your UI expects
}

const MOCK_PHOTOGRAPHERS: Photographer[] = [
  {
    id: 1,
    name: "Alex Morgan",
    location: "New York, NY",
    mainStyle: "Portrait",
    additionalStyles: ["Wedding", "Event"],
    rating: 4.9,
    reviews: 87,
    price: "$250",
    priceType: "hour",
    portfolioImage: "/placeholder-user.jpg",
    portfolioImages: ["/placeholder.jpg", "/placeholder.jpg"],
  },
  {
    id: 2,
    name: "Jamie Parker",
    location: "Austin, TX",
    mainStyle: "Event",
    additionalStyles: ["Portrait"],
    rating: 4.8,
    reviews: 62,
    price: "$180",
    priceType: "hour",
    portfolioImage: "/placeholder-user.jpg",
    portfolioImages: ["/placeholder.jpg", "/placeholder.jpg"],
  },
]

// ---------------------------------------------------------------------------
// 3)  Handler
// ---------------------------------------------------------------------------

export async function GET(req: Request) {
  const url = new URL(req.url)
  const styleParam = normalise(url.searchParams.get("style") || "")
  const latParam = url.searchParams.get("lat")
  const lngParam = url.searchParams.get("lng")
  const radiusParam = url.searchParams.get("radius") // miles

  // 3a)  Start with all rows (mock) – replace this with your real DB fetch
  let results: Photographer[] = [...MOCK_PHOTOGRAPHERS]

  // 3b)  Style filtering (only if a style was supplied)
  if (styleParam && styleParam !== "all") {
    results = results.filter((p) => {
      const main = normalise(p.mainStyle)
      const extras = (p.additionalStyles || []).map(normalise)
      return main === styleParam || extras.includes(styleParam)
    })
  }

  // 3c)  Radius filtering (optional)
  if (latParam && lngParam && radiusParam) {
    const lat = Number(latParam)
    const lng = Number(lngParam)
    const radiusMiles = Number(radiusParam)

    results = results
      .map((p) => {
        // NOTE: Replace these placeholder coords with real values from your DB
        const [cityLat, cityLng] = [40.7128, -74.006] // default NYC
        const miles = haversineMiles(lat, lng, cityLat, cityLng)
        return { ...p, distance: miles }
      })
      .filter((p) => (p as any).distance <= radiusMiles)
      .sort((a, b) => (a as any).distance - (b as any).distance)
  }

  // 3d)  Send JSON response
  return NextResponse.json(
    { photographers: results },
    {
      status: 200,
      headers: {
        "cache-control": "no-store",
      },
    },
  )
}

// ---------------------------------------------------------------------------
// 4)  Real DB example (commented for reference)
//
// import { createClient } from "@supabase/supabase-js"
// const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
//
// const { data, error } = await supabase
//   .from("providers")
//   .select("*")
//   .ilike("main_style,additional_style1,additional_style2", `%${styleParam}%`)
//   .maybeSingle()
// ---------------------------------------------------------------------------
