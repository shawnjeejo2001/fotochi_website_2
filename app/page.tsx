"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { Camera, MapPin, Star, Calendar, Users, Award, RotateCcw, Heart, CalendarIcon } from "lucide-react"
import LocationInput from "@/components/location-input"
import { useRouter } from "next/navigation"
import FeaturedPhotographers from "@/components/featured-photographers"

const photographyStyles = [
  {
    value: "wedding",
    label: "Wedding",
    description: "Weddings, ceremonies, receptions",
    emoji: "💒",
    color: "bg-pink-100 text-pink-800",
  },
  {
    value: "portrait",
    label: "Portrait",
    description: "Individual and family portraits",
    emoji: "👤",
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "event",
    label: "Event",
    description: "Parties, celebrations, gatherings",
    emoji: "🎉",
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "real-estate",
    label: "Real Estate",
    description: "Property photography",
    emoji: "🏠",
    color: "bg-green-100 text-green-800",
  },
  {
    value: "food",
    label: "Food",
    description: "Restaurant and culinary photography",
    emoji: "🍽️",
    color: "bg-orange-100 text-orange-800",
  },
  {
    value: "product",
    label: "Product",
    description: "Commercial product photography",
    emoji: "📦",
    color: "bg-gray-100 text-gray-800",
  },
  {
    value: "sports",
    label: "Sports",
    description: "Athletic events and action shots",
    emoji: "⚽",
    color: "bg-red-100 text-red-800",
  },
  {
    value: "street",
    label: "Street",
    description: "Urban and lifestyle photography",
    emoji: "🏙️",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "nature",
    label: "Nature",
    description: "Outdoor and wildlife photography",
    emoji: "🌿",
    color: "bg-emerald-100 text-emerald-800",
  },
  {
    value: "pet",
    label: "Pet",
    description: "Animal and pet photography",
    emoji: "🐕",
    color: "bg-amber-100 text-amber-800",
  },
]

const videographyStyles = [
  {
    value: "wedding",
    label: "Wedding",
    description: "Wedding ceremonies and receptions",
    emoji: "💒",
    color: "bg-pink-100 text-pink-800",
  },
  {
    value: "event",
    label: "Event",
    description: "Parties and celebrations",
    emoji: "🎉",
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "corporate",
    label: "Corporate",
    description: "Business and promotional videos",
    emoji: "💼",
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "music",
    label: "Music Video",
    description: "Music videos and performances",
    emoji: "🎵",
    color: "bg-indigo-100 text-indigo-800",
  },
  {
    value: "real-estate",
    label: "Real Estate",
    description: "Property tour videos",
    emoji: "🏠",
    color: "bg-green-100 text-green-800",
  },
  {
    value: "documentary",
    label: "Documentary",
    description: "Storytelling and interviews",
    emoji: "📹",
    color: "bg-gray-100 text-gray-800",
  },
  {
    value: "sports",
    label: "Sports",
    description: "Athletic events and highlights",
    emoji: "⚽",
    color: "bg-red-100 text-red-800",
  },
  {
    value: "social",
    label: "Social Media",
    description: "Content for social platforms",
    emoji: "📱",
    color: "bg-cyan-100 text-cyan-800",
  },
]

// Function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLng = (lng2 - lng1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Get style color based on main style
function getStyleColor(style: string, service: string) {
  const styles = service === "photographer" ? photographyStyles : videographyStyles
  const styleObj = styles.find((s) => s.value === style.toLowerCase())
  return styleObj?.color || "bg-gray-100 text-gray-800"
}

export default function Home() {
  const router = useRouter()
  const [service, setService] = useState("photographer")
  const [style, setStyle] = useState("")
  const [location, setLocation] = useState("")
  const [searchCoordinates, setSearchCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [date, setDate] = useState("")
  const [duration, setDuration] = useState("")
  const [hoveredPhotographer, setHoveredPhotographer] = useState<number | null>(null)
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [email, setEmail] = useState("")
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [searchRadius, setSearchRadius] = useState(50) // Default 50 mile radius

  // Handle coordinates from LocationInput component
  const handleCoordinatesChange = (lat: number, lng: number) => {
    console.log("Got coordinates from LocationInput:", lat, lng)
    console.log("Setting search coordinates...")
    setSearchCoordinates({ lat, lng })
  }

  // Add this useEffect after the other state declarations
  useEffect(() => {
    console.log("Search coordinates updated:", searchCoordinates)
  }, [searchCoordinates])

  const toggleFavorite = (photographerId: number) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(photographerId)) {
        newFavorites.delete(photographerId)
      } else {
        newFavorites.add(photographerId)
      }
      return newFavorites
    })
  }

  const handleSearch = async () => {
    setIsSearching(true)
    console.log("=== STARTING SEARCH ===")
    console.log("Location:", location)
    console.log("Search coordinates:", searchCoordinates)
    console.log("Style:", style)
    console.log("Search radius:", searchRadius)

    try {
      // Prepare search parameters
      const searchParams = new URLSearchParams()

      if (style) {
        searchParams.append("style", style)
        console.log("Added style to search params:", style)
      }

      if (searchCoordinates) {
        searchParams.append("lat", searchCoordinates.lat.toString())
        searchParams.append("lng", searchCoordinates.lng.toString())
        searchParams.append("radius", searchRadius.toString())
        console.log("Added coordinates to search params:", searchCoordinates, "radius:", searchRadius)
      } else {
        console.warn("No search coordinates available - location search will not work")
      }

      const searchUrl = `/api/photographers/search?${searchParams.toString()}`
      console.log("Search URL:", searchUrl)

      // Call the API to search for photographers
      const response = await fetch(searchUrl)

      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Search API response:", data)

      if (data.photographers && Array.isArray(data.photographers)) {
        console.log(`Found ${data.photographers.length} photographers from API`)
        setSearchResults(data.photographers)
        setShowResults(true)

        // Scroll to results
        setTimeout(() => {
          const resultsSection = document.getElementById("search-results")
          if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: "smooth" })
          }
        }, 100)
      } else {
        console.error("Invalid search results format:", data)
        setSearchResults([])
        setShowResults(true)
      }
    } catch (error) {
      console.error("Error searching photographers:", error)
      console.log("Falling back to sample data...")

      // Fall back to sample data
      let filtered = []

      // Filter by style
      if (style) {
        console.log("Filtering sample data by style:", style)
        filtered = filtered.filter(
          (photographer) =>
            photographer.mainStyle.toLowerCase() === style.toLowerCase() ||
            photographer.additionalStyles.some((s) => s.toLowerCase() === style.toLowerCase()),
        )
      }

      // Filter by location if coordinates available
      if (searchCoordinates) {
        console.log("Filtering sample data by location:", searchCoordinates, "radius:", searchRadius)
        const photographersWithDistances = filtered.map((photographer) => {
          const distance = calculateDistance(
            searchCoordinates.lat,
            searchCoordinates.lng,
            photographer.coordinates.lat,
            photographer.coordinates.lng,
          )
          console.log(`Distance to ${photographer.name}:`, distance, "miles")
          return { ...photographer, distance }
        })

        filtered = photographersWithDistances
          .filter((photographer) => photographer.distance <= searchRadius)
          .sort((a, b) => a.distance - b.distance) // Sort by distance

        console.log(`After distance filtering: ${filtered.length} photographers`)
      }

      setSearchResults(filtered)
      setShowResults(true)
    } finally {
      setIsSearching(false)
      console.log("=== SEARCH COMPLETE ===")
    }
  }

  const handleReset = () => {
    setService("photographer")
    setStyle("")
    setLocation("")
    setSearchCoordinates(null)
    setDate("")
    setDuration("")
    setSearchResults([])
    setShowResults(false)
    setEmail("")
    setEmailSubmitted(false)

    // Scroll back to top
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleEmailSubmit = () => {
    if (email) {
      setEmailSubmitted(true)
      // In real app, you'd send this to your backend
      console.log("Email submitted:", email)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-gray-900 to-black">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1
                onClick={() => router.push("/")}
                className="text-3xl font-bold text-gray-900 cursor-pointer hover:opacity-80 transition-opacity"
              >
                Fotochi
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-2">
                Find the perfect photographer or videographer for your needs
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Button
                onClick={() => router.push("/sign-in")}
                variant="outline"
                className="text-sm bg-white text-black border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 rounded-lg shadow-md hover:shadow-lg"
              >
                Sign In
              </Button>
              <Button
                onClick={() => router.push("/sign-up")}
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 rounded-lg shadow-md hover:shadow-lg"
              >
                Join Us
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Radial Gradient */}
      <section className="py-8 sm:py-12 lg:py-20 bg-gradient-radial from-navy-800 via-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Capture Your Perfect Moment
            </h2>
            <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto drop-shadow-md mb-8">
              Connect with professional photographers and videographers in your area. From weddings to corporate events,
              find the perfect match for your vision.
            </p>
          </div>

          {/* Enhanced Search Form */}
          <Card className="max-w-6xl mx-auto bg-white shadow-2xl border-2 border-gray-300 rounded-xl">
            <CardContent className="p-6 sm:p-8 lg:p-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
                <div className="space-y-3">
                  <Label htmlFor="service" className="text-base font-bold text-black">
                    Service Type
                  </Label>
                  <Select onValueChange={(value) => setService(value)} value={service}>
                    <SelectTrigger className="bg-white text-black h-12 rounded-lg shadow-sm border-2 border-gray-200 hover:border-gray-300 transition-colors">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="photographer">Photographer</SelectItem>
                      <SelectItem value="videographer">Videographer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="style" className="text-base font-bold text-black">
                    {service === "photographer" ? "Photography Style" : "Videography Style"}
                  </Label>
                  <Select onValueChange={(value) => setStyle(value)} value={style}>
                    <SelectTrigger className="bg-white text-black h-12 rounded-lg shadow-sm border-2 border-gray-200 hover:border-gray-300 transition-colors">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80 overflow-y-auto">
                      {(service === "photographer" ? photographyStyles : videographyStyles).map((styleOption) => (
                        <SelectItem key={styleOption.value} value={styleOption.value}>
                          <div className="flex items-center gap-2 py-1 max-w-[250px]">
                            <span className="text-base flex-shrink-0">{styleOption.emoji}</span>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-sm truncate">{styleOption.label}</div>
                              <div className="text-xs text-gray-500 truncate">{styleOption.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="location" className="text-base font-bold text-black">
                    Location
                  </Label>
                  <LocationInput
                    value={location}
                    onChange={setLocation}
                    onCoordinatesChange={handleCoordinatesChange}
                    className="bg-white text-black h-12 rounded-lg shadow-sm border-2 border-gray-200 hover:border-gray-300 transition-colors"
                  />
                </div>

                {searchCoordinates && (
                  <div className="col-span-full">
                    <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>
                        Location coordinates set: {searchCoordinates.lat.toFixed(4)}, {searchCoordinates.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Label htmlFor="date" className="text-base font-bold text-black">
                    Event Date
                  </Label>
                  <div className="relative">
                    <Input
                      type="date"
                      id="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-white text-black h-12 rounded-lg shadow-sm border-2 border-gray-200 hover:border-gray-300 transition-colors pr-10"
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="duration" className="text-base font-bold text-black">
                    Duration
                  </Label>
                  <Select onValueChange={(value) => setDuration(value)} value={duration}>
                    <SelectTrigger className="bg-white text-black h-12 rounded-lg shadow-sm border-2 border-gray-200 hover:border-gray-300 transition-colors">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-hour">1 Hour</SelectItem>
                      <SelectItem value="2-hours">2 Hours</SelectItem>
                      <SelectItem value="3-hours">3 Hours</SelectItem>
                      <SelectItem value="4-hours">4 Hours</SelectItem>
                      <SelectItem value="6-hours">6 Hours</SelectItem>
                      <SelectItem value="8-hours">8 Hours</SelectItem>
                      <SelectItem value="full-day">Full Day</SelectItem>
                      <SelectItem value="multi-day">Multi-Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-bold text-black opacity-0">Search</Label>
                  <Button
                    onClick={handleSearch}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg h-12 rounded-lg transition-all duration-200 hover:shadow-xl font-medium"
                    disabled={isSearching}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {isSearching ? "Searching..." : "Find Providers"}
                  </Button>
                </div>
              </div>

              {/* Search radius selector */}
              {searchCoordinates && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Label htmlFor="radius" className="text-base font-medium text-gray-700">
                      Search radius: <span className="font-semibold">{searchRadius} miles</span>
                    </Label>
                    <div className="w-full sm:w-1/2 lg:w-1/3 flex items-center gap-4">
                      <span className="text-sm text-gray-500">10</span>
                      <input
                        type="range"
                        id="radius"
                        min="10"
                        max="100"
                        step="5"
                        value={searchRadius}
                        onChange={(e) => setSearchRadius(Number.parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-sm text-gray-500">100</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Social Proof */}
              <div className="text-center mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 font-medium">
                  Trusted by over 5,000 clients and creatives across the US
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {showResults && (
        <section className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Button
              onClick={handleReset}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-lg transition-all duration-200 hover:shadow-xl font-medium px-6 py-3"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Search Again
            </Button>
          </div>
        </section>
      )}

      {/* Search Results */}
      {showResults && (
        <section id="search-results" className="py-8 sm:py-12 lg:py-16 bg-white/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Search Results ({searchResults.length} found)
              </h3>
              {location && searchCoordinates && (
                <p className="text-base sm:text-lg text-gray-600 mb-4">
                  Showing providers within {searchRadius} miles of {location}
                </p>
              )}
              <p className="text-sm text-blue-600 italic mb-4">Hover over cards to preview their work</p>
            </div>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {searchResults.map((photographer) => (
                    <Card
                    key={photographer.id}
                    className="shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden group h-96 bg-white rounded-xl border-2 border-gray-100"
                >
                    {/* Favorite Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(photographer.id)
                        }}
                        className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-sm"
                    >
                        <Heart
                            className={`w-4 h-4 transition-colors ${
                                favorites.has(photographer.id)
                                    ? "fill-red-500 text-red-500"
                                    : "text-gray-400 hover:text-red-400"
                            }`}
                        />
                    </button>
                
                    {/* Portfolio Preview with 2 Images */}
                    <div className="absolute inset-0">
                        <div className="grid grid-rows-2 h-full">
                            <img
                                src={photographer.portfolioImages?.[0] || photographer.portfolioImage || "/placeholder.svg"}
                                alt={`${photographer.name}'s portfolio 1`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                            <img
                                src={photographer.portfolioImages?.[1] || photographer.portfolioImage || "/placeholder.svg"}
                                alt={`${photographer.name}'s portfolio 2`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-60 transition-all duration-500 flex flex-col justify-between p-6 text-white">
                            <div className="text-center opacity-100 transition-opacity duration-500 delay-200">
                                <h3 className="text-xl font-bold mb-2">{photographer.name}</h3>
                                <div className="flex items-center justify-center gap-1 text-sm mb-3">
                                    <MapPin className="w-4 h-4" />
                                    {photographer.location}
                                    {photographer.distance !== undefined && (
                                        <span className="text-xs ml-2 font-medium">
                                            ({(photographer as any).distance.toFixed(1)} mi)
                                        </span>
                                    )}
                                </div>
                                <Badge className={`${getStyleColor(photographer.mainStyle, service)} font-medium`}>
                                    {photographer.mainStyle}
                                </Badge>
                            </div>
                            <div className="text-center opacity-100 transition-opacity duration-500 delay-200">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                  {photographer.rating && photographer.reviews > 0 ? (
                                      <>
                                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                          <span className="font-semibold">{photographer.rating}</span>
                                          <span className="text-sm opacity-80">({photographer.reviews} reviews)</span>
                                      </>
                                  ) : (
                                      <span className="font-semibold">New</span>
                                  )}
                                </div>
                                <div className="text-xl font-bold mb-1">{photographer.price}</div>
                                <div className="text-sm opacity-80 mb-4">{photographer.priceType}</div>
                                <Button
                                    onClick={() => router.push(`/book/${photographer.id}`)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 rounded-lg shadow-lg"
                                >
                                    View Portfolio & Book
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Camera className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                <h2 className="text-2xl font-semibold mb-2 text-gray-900">No photographers found</h2>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search criteria</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Photographers */}
      {!showResults && (
        <section className="py-8 sm:py-12 lg:py-16 bg-white/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Featured Photographers</h3>
              <p className="text-base sm:text-lg text-gray-600 mb-2">Discover top-rated professionals in your area</p>
              <p className="text-sm text-blue-600 italic">Hover over cards to preview their work</p>
            </div>

            <FeaturedPhotographers />

            <div className="text-center mt-8 sm:mt-12">
              <Button
                onClick={() => router.push("/photographers")}
                variant="outline"
                size="lg"
                className="text-sm sm:text-base bg-white text-black hover:bg-gray-50 transition-all duration-200 rounded-lg border-2 border-gray-300 hover:border-gray-400 shadow-md hover:shadow-lg"
              >
                View All Photographers
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Features Section - Fixed visibility issues */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gray-50/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h3>
            <p className="text-base sm:text-lg text-gray-600">
              Everything you need to find and book the perfect photographer
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">Verified Professionals</h4>
              <p className="text-sm sm:text-base text-gray-600">
                All photographers are verified and reviewed by our community
              </p>
            </Card>

            <Card className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">Easy Booking</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Book and manage your sessions with our simple booking system
              </p>
            </Card>

            <Card className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">Quality Guarantee</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Satisfaction guaranteed or your money back*
                <br />
                <span className="text-xs text-gray-500">*Terms and conditions apply</span>
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-white">Fotochi</h2>
              <p className="text-sm text-gray-400">
                Connecting you with the best photographers and videographers in your area.
              </p>
            </div>
            <div>
              <h6 className="font-semibold mb-4">For Clients</h6>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => router.push("/")}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    Find Photographers
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/how-it-works")}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    How It Works
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/pricing")}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Pricing
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/reviews")}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Reviews
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">For Providers</h6>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => router.push("/join-provider")}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Join Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/provider-resources")}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Provider Resources
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/success-stories")}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Success Stories
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/support")}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Support
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Company</h6>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => router.push("/about")}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/contact")}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Contact
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/privacy")}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/terms")}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 FOTOCHI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
