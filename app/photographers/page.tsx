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
import { PhotographerCard } from "@/components/photographer-card" // <-- Import the standardized card

// --- Data arrays (photographyStyles, videographyStyles) remain the same ---

const photographyStyles = [
  { value: "wedding", label: "Wedding", description: "Weddings, ceremonies, receptions", emoji: "💒", color: "bg-pink-100 text-pink-800" },
  { value: "portrait", label: "Portrait", description: "Individual and family portraits", emoji: "👤", color: "bg-blue-100 text-blue-800" },
  { value: "event", label: "Event", description: "Parties, celebrations, gatherings", emoji: "🎉", color: "bg-purple-100 text-purple-800" },
];

const videographyStyles = [
    { value: "wedding", label: "Wedding", description: "Wedding ceremonies and receptions", emoji: "💒", color: "bg-pink-100 text-pink-800" },
    { value: "event", label: "Event", description: "Parties and celebrations", emoji: "🎉", color: "bg-purple-100 text-purple-800" },
    { value: "corporate", label: "Corporate", description: "Business and promotional videos", emoji: "💼", color: "bg-blue-100 text-blue-800" },
];

// --- Helper functions (calculateDistance, getStyleColor) remain the same ---
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

export default function Home() {
  const router = useRouter()
  const [service, setService] = useState("photographer")
  const [style, setStyle] = useState("")
  const [location, setLocation] = useState("")
  const [searchCoordinates, setSearchCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [date, setDate] = useState("")
  const [duration, setDuration] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([]) // Use any[] for flexibility from API
  const [showResults, setShowResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchRadius, setSearchRadius] = useState(50)

  const handleCoordinatesChange = (lat: number, lng: number) => {
    setSearchCoordinates({ lat, lng })
  }

  const handleSearch = async () => {
    setIsSearching(true)
    setShowResults(true) // Show the results section immediately

    const searchParams = new URLSearchParams()
    if (style) searchParams.append("style", style)
    if (searchCoordinates) {
        searchParams.append("lat", searchCoordinates.lat.toString())
        searchParams.append("lng", searchCoordinates.lng.toString())
        searchParams.append("radius", searchRadius.toString())
    }

    try {
        const response = await fetch(`/api/photographers/search?${searchParams.toString()}`)
        if (response.ok) {
            const data = await response.json()
            setSearchResults(data.photographers || [])
        } else {
            setSearchResults([])
        }
    } catch (error) {
        console.error("Error searching photographers:", error)
        setSearchResults([])
    } finally {
        setIsSearching(false)
        setTimeout(() => {
            const resultsSection = document.getElementById("search-results")
            if (resultsSection) {
                resultsSection.scrollIntoView({ behavior: "smooth" })
            }
        }, 100)
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
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-gray-900 to-black">
      {/* --- Header and Hero Section remain the same --- */}
       <header className="bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <button onClick={() => router.push("/")} className="hover:opacity-80 transition-opacity">
                <span className="text-4xl font-semibold leading-none text-gray-900">Fotochi</span>
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Button onClick={() => router.push("/sign-in")} variant="outline" className="text-sm bg-white text-black border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 rounded-lg shadow-md hover:shadow-lg">
                Sign In
              </Button>
              <Button onClick={() => router.push("/sign-up")} className="text-sm bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 rounded-lg shadow-md hover:shadow-lg">
                Join Fotochi
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="py-8 sm:py-12 lg:py-20 bg-gradient-radial from-navy-800 via-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="max-w-6xl mx-auto bg-white shadow-2xl border-2 border-gray-300 rounded-xl">
                <CardContent className="p-6 sm:p-8 lg:p-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
                        <div className="space-y-3">
                            <Label htmlFor="service" className="text-base font-bold text-black">Service Type</Label>
                            <Select onValueChange={setService} value={service}>
                                <SelectTrigger className="bg-white text-black h-12 rounded-lg shadow-sm border-2 border-gray-200 hover:border-gray-300 transition-colors"><SelectValue placeholder="Select service" /></SelectTrigger>
                                <SelectContent><SelectItem value="photographer">Photographer</SelectItem><SelectItem value="videographer">Videographer</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="style" className="text-base font-bold text-black">{service === "photographer" ? "Photography Style" : "Videography Style"}</Label>
                            <Select onValueChange={setStyle} value={style}>
                                <SelectTrigger className="bg-white text-black h-12 rounded-lg shadow-sm border-2 border-gray-200 hover:border-gray-300 transition-colors"><SelectValue placeholder="Select style" /></SelectTrigger>
                                <SelectContent>
                                    {(service === "photographer" ? photographyStyles : videographyStyles).map(option => (
                                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="location" className="text-base font-bold text-black">Location</Label>
                            <LocationInput value={location} onChange={setLocation} onCoordinatesChange={handleCoordinatesChange} className="bg-white text-black h-12 rounded-lg shadow-sm border-2 border-gray-200 hover:border-gray-300 transition-colors" />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="date" className="text-base font-bold text-black">Event Date</Label>
                             <div className="relative">
                                <Input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-white text-black h-12 rounded-lg shadow-sm border-2 border-gray-200 hover:border-gray-300 transition-colors pr-10" />
                                <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                             </div>
                        </div>
                         <div className="space-y-3">
                            <Label htmlFor="duration" className="text-base font-bold text-black">Duration</Label>
                             <Select onValueChange={setDuration} value={duration}>
                                 <SelectTrigger className="bg-white text-black h-12 rounded-lg shadow-sm border-2 border-gray-200 hover:border-gray-300 transition-colors"><SelectValue placeholder="Select duration" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1-hour">1 Hour</SelectItem>
                                    <SelectItem value="2-hours">2 Hours</SelectItem>
                                </SelectContent>
                             </Select>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-base font-bold text-black opacity-0">Search</Label>
                            <Button onClick={handleSearch} className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg h-12 rounded-lg font-medium" disabled={isSearching}>
                                <Camera className="w-4 h-4 mr-2" />
                                {isSearching ? "Searching..." : "Find Providers"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </section>

      {showResults && (
        <section className="py-6 text-center">
            <Button onClick={handleReset} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-lg px-6 py-3">
                <RotateCcw className="w-4 h-4 mr-2" />
                Search Again
            </Button>
        </section>
      )}

      {/* MODIFIED SEARCH RESULTS SECTION */}
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

            {isSearching ? (
                 <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 rounded-full border-blue-500 border-t-transparent animate-spin mx-auto" />
                    <p className="mt-4 text-gray-600">Searching...</p>
                 </div>
            ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                    {/* Use the standardized PhotographerCard component here */}
                    {searchResults.map((photographer) => (
                        <PhotographerCard key={photographer.id} photographer={photographer} />
                    ))}
                </div>
            ) : (
              <div className="text-center py-12">
                <Camera className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                <h2 className="text-2xl font-semibold mb-2 text-gray-900">No photographers found</h2>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search criteria.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* --- Featured Photographers and Footer sections remain the same --- */}
       {!showResults && (
        <section className="py-8 sm:py-12 lg:py-16 bg-white/95 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8 sm:mb-12">
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Featured Photographers</h3>
                    <p className="text-base sm:text-lg text-gray-600">Discover top-rated professionals in your area</p>
                </div>
                <FeaturedPhotographers />
                <div className="text-center mt-8 sm:mt-12">
                    <Button onClick={() => router.push("/photographers")} variant="outline" size="lg" className="text-sm sm:text-base bg-white text-black hover:bg-gray-50">
                        View All Photographers
                    </Button>
                </div>
            </div>
        </section>
      )}

       <footer className="bg-gray-900 text-white py-8 sm:py-12">
            {/* Footer content */}
       </footer>
    </div>
  )
}
