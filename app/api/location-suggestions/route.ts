import { type NextRequest, NextResponse } from "next/server"

// Sample US cities data for fallback
const US_CITIES = [
  { city: "New York", stateCode: "NY", zipCode: "10001" },
  { city: "Los Angeles", stateCode: "CA", zipCode: "90001" },
  { city: "Chicago", stateCode: "IL", zipCode: "60601" },
  { city: "Houston", stateCode: "TX", zipCode: "77001" },
  { city: "Phoenix", stateCode: "AZ", zipCode: "85001" },
  { city: "Philadelphia", stateCode: "PA", zipCode: "19019" },
  { city: "San Antonio", stateCode: "TX", zipCode: "78201" },
  { city: "San Diego", stateCode: "CA", zipCode: "92101" },
  { city: "Dallas", stateCode: "TX", zipCode: "75201" },
  { city: "San Jose", stateCode: "CA", zipCode: "95101" },
  { city: "Austin", stateCode: "TX", zipCode: "73301" },
  { city: "Jacksonville", stateCode: "FL", zipCode: "32099" },
  { city: "Fort Worth", stateCode: "TX", zipCode: "76101" },
  { city: "Columbus", stateCode: "OH", zipCode: "43085" },
  { city: "San Francisco", stateCode: "CA", zipCode: "94102" },
  { city: "Charlotte", stateCode: "NC", zipCode: "28201" },
  { city: "Indianapolis", stateCode: "IN", zipCode: "46201" },
  { city: "Seattle", stateCode: "WA", zipCode: "98101" },
  { city: "Denver", stateCode: "CO", zipCode: "80201" },
  { city: "Washington", stateCode: "DC", zipCode: "20001" },
  { city: "Boston", stateCode: "MA", zipCode: "02108" },
  { city: "El Paso", stateCode: "TX", zipCode: "79901" },
  { city: "Nashville", stateCode: "TN", zipCode: "37201" },
  { city: "Detroit", stateCode: "MI", zipCode: "48201" },
  { city: "Portland", stateCode: "OR", zipCode: "97201" },
  { city: "Las Vegas", stateCode: "NV", zipCode: "89101" },
  { city: "Memphis", stateCode: "TN", zipCode: "38101" },
  { city: "Louisville", stateCode: "KY", zipCode: "40201" },
  { city: "Baltimore", stateCode: "MD", zipCode: "21201" },
  { city: "Milwaukee", stateCode: "WI", zipCode: "53201" },
  { city: "Albuquerque", stateCode: "NM", zipCode: "87101" },
  { city: "Tucson", stateCode: "AZ", zipCode: "85701" },
  { city: "Fresno", stateCode: "CA", zipCode: "93701" },
  { city: "Sacramento", stateCode: "CA", zipCode: "94203" },
  { city: "Kansas City", stateCode: "MO", zipCode: "64101" },
  { city: "Miami", stateCode: "FL", zipCode: "33101" },
  { city: "Atlanta", stateCode: "GA", zipCode: "30301" },
  { city: "Tampa", stateCode: "FL", zipCode: "33601" },
  { city: "Orlando", stateCode: "FL", zipCode: "32801" },
  { city: "New Orleans", stateCode: "LA", zipCode: "70112" },
  // Additional zip codes for testing
  { city: "Beverly Hills", stateCode: "CA", zipCode: "90210" },
  { city: "Manhattan", stateCode: "NY", zipCode: "10001" },
  { city: "Brooklyn", stateCode: "NY", zipCode: "11201" },
  { city: "Queens", stateCode: "NY", zipCode: "11101" },
  { city: "Bronx", stateCode: "NY", zipCode: "10451" },
  { city: "Staten Island", stateCode: "NY", zipCode: "10301" },
  { city: "Chicago Loop", stateCode: "IL", zipCode: "60601" },
  { city: "Chicago North Side", stateCode: "IL", zipCode: "60613" },
  { city: "Chicago South Side", stateCode: "IL", zipCode: "60615" },
  { city: "Hollywood", stateCode: "CA", zipCode: "90028" },
]

export async function GET(request: NextRequest) {
  console.log("API: Location suggestions endpoint called")

  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")?.toLowerCase() || ""

    console.log("API: Query:", query)

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    // Check if query is a zip code
    const isZipCode = /^\d{1,5}$/.test(query)
    console.log("API: Is zip code query:", isZipCode)

    // Filter cities based on query
    let filteredCities = []

    if (isZipCode) {
      console.log("API: Processing as zip code:", query)
      filteredCities = US_CITIES.filter((city) => city.zipCode.startsWith(query)).map((city) => ({
        displayName: `${city.zipCode} - ${city.city}, ${city.stateCode}`,
        city: city.city,
        stateCode: city.stateCode,
        zipCode: city.zipCode,
        isZipCode: true,
      }))
    } else {
      console.log("API: Processing as city/state:", query)
      filteredCities = US_CITIES.filter((city) => {
        const cityMatch = city.city.toLowerCase().includes(query)
        const stateMatch = city.stateCode.toLowerCase() === query
        const combinedMatch = `${city.city.toLowerCase()}, ${city.stateCode.toLowerCase()}`.includes(query)
        return cityMatch || stateMatch || combinedMatch
      }).map((city) => ({
        displayName: `${city.city}, ${city.stateCode}`,
        city: city.city,
        stateCode: city.stateCode,
        zipCode: city.zipCode,
        isZipCode: false,
      }))
    }

    console.log("API: Filtered cities count:", filteredCities.length)
    console.log("API: First few results:", filteredCities.slice(0, 3))

    return NextResponse.json(filteredCities.slice(0, 10))
  } catch (error: any) {
    console.error("API: Error in location suggestions:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
