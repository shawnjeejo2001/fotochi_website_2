"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MapPin, CheckCircle, ArrowRight, Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import FeaturedPhotographers from "@/components/featured-photographers"
import LocationInput from "@/components/location-input"

export default function HomePage() {
  const router = useRouter()
  const [searchStyle, setSearchStyle] = useState("")
  const [searchLocation, setSearchLocation] = useState("")
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [radius, setRadius] = useState("25")
  const [isSearching, setIsSearching] = useState(false)

  const photographyStyles = [
    "Portrait Photography",
    "Wedding Photography",
    "Event Photography",
    "Corporate Photography",
    "Fashion Photography",
    "Nature Photography",
    "Street Photography",
    "Product Photography",
    "Real Estate Photography",
    "Sports Photography",
  ]

  const handleSearch = async () => {
    if (!searchStyle && !searchLocation) {
      router.push("/photographers")
      return
    }

    setIsSearching(true)

    try {
      const searchParams = new URLSearchParams()

      if (searchStyle && searchStyle !== "all") {
        searchParams.append("style", searchStyle.toLowerCase().replace(" photography", ""))
      }

      if (searchLocation) {
        searchParams.append("location", searchLocation)
      }

      if (coordinates) {
        searchParams.append("lat", coordinates.lat.toString())
        searchParams.append("lng", coordinates.lng.toString())
        searchParams.append("radius", radius)
      }

      router.push(`/photographers?${searchParams.toString()}`)
    } catch (error) {
      console.error("Search error:", error)
      router.push("/photographers")
    } finally {
      setIsSearching(false)
    }
  }

  const handleLocationSelect = (location: string, coords: { lat: number; lng: number } | null) => {
    setSearchLocation(location)
    setCoordinates(coords)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <span className="text-2xl font-bold text-gray-900">Fotochi</span>
              <nav className="hidden md:flex items-center gap-6">
                <a href="/how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
                  How it Works
                </a>
                <a href="/photographers" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Browse Photographers
                </a>
                <a href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Pricing
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => router.push("/sign-in")}>
                Sign In
              </Button>
              <Button onClick={() => router.push("/sign-up")} className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Find Your Perfect
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}
              Photographer
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Connect with talented photographers and videographers in your area. From weddings to corporate events, find
            the perfect professional for your special moments.
          </p>

          {/* Search Form */}
          <Card className="max-w-4xl mx-auto shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Photography Style</label>
                  <Select value={searchStyle} onValueChange={setSearchStyle}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Any style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any style</SelectItem>
                      {photographyStyles.map((style) => (
                        <SelectItem key={style} value={style}>
                          {style}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <LocationInput
                    value={searchLocation}
                    onChange={setSearchLocation}
                    onLocationSelect={handleLocationSelect}
                    placeholder="Enter city or address"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Radius</label>
                  <Select value={radius} onValueChange={setRadius}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 miles</SelectItem>
                      <SelectItem value="25">25 miles</SelectItem>
                      <SelectItem value="50">50 miles</SelectItem>
                      <SelectItem value="100">100 miles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">&nbsp;</label>
                  <Button
                    onClick={handleSearch}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Searching...
                      </div>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {coordinates && (
                <div className="text-sm text-gray-600 text-center">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Searching within {radius} miles of {searchLocation}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Fotochi?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make it easy to find, book, and work with professional photographers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Easy Discovery</h3>
                <p className="text-gray-600">
                  Search by style, location, and budget to find photographers that match your vision
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Verified Professionals</h3>
                <p className="text-gray-600">
                  All photographers are vetted and verified to ensure quality and professionalism
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Seamless Booking</h3>
                <p className="text-gray-600">
                  Book directly through our platform with secure payments and clear communication
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Photographers */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Photographers</h2>
            <p className="text-xl text-gray-600">Discover some of our top-rated professionals</p>
          </div>
          <FeaturedPhotographers />
          <div className="text-center mt-12">
            <Button
              onClick={() => router.push("/photographers")}
              variant="outline"
              size="lg"
              className="bg-white hover:bg-gray-50"
            >
              View All Photographers
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Find Your Photographer?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied clients who found their perfect photographer through Fotochi
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push("/sign-up")}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Get Started as Client
            </Button>
            <Button
              onClick={() => router.push("/join-provider")}
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              Join as Photographer
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <span className="text-2xl font-bold">Fotochi</span>
              <p className="text-gray-400 mt-4">
                Connecting clients with professional photographers and videographers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Clients</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="/how-it-works" className="hover:text-white">
                    How it Works
                  </a>
                </li>
                <li>
                  <a href="/photographers" className="hover:text-white">
                    Find Photographers
                  </a>
                </li>
                <li>
                  <a href="/pricing" className="hover:text-white">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Photographers</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="/join-provider" className="hover:text-white">
                    Join as Pro
                  </a>
                </li>
                <li>
                  <a href="/pricing" className="hover:text-white">
                    Pro Plans
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="/contact" className="hover:text-white">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-white">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="hover:text-white">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Fotochi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
