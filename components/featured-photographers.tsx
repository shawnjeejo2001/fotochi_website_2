"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Camera, MapPin, Heart, Calendar, Clock, User } from "lucide-react"

interface Photographer {
  id: string
  name: string
  location: string
  mainStyle: string
  additionalStyles?: string[]
  rating: number
  reviews: number
  price: string
  priceType?: string // Make optional for flexibility
  portfolioImage: string
  portfolioImages?: string[]
  subscriptionPlan?: string
  availability: string
  responseTime: string
}

export default function FeaturedPhotographers() {
  const [photographers, setPhotographers] = useState<Photographer[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const router = useRouter()

  const availabilityMapRef = useRef<Map<string, string>>(new Map())
  const responseTimeMapRef = useRef<Map<string, string>>(new Map())

  const getRandomAvailability = (photographerId: string) => {
    if (!availabilityMapRef.current.has(photographerId)) {
      const days = ["Mon", "Wed", "Fri", "Sat", "Sun"]
      availabilityMapRef.current.set(photographerId, days[Math.floor(Math.random() * days.length)])
    }
    return availabilityMapRef.current.get(photographerId)
  }

  const getRandomResponseTime = (photographerId: string) => {
    if (!responseTimeMapRef.current.has(photographerId)) {
      const times = ["< 1 hour", "2 hours", "Same day"]
      responseTimeMapRef.current.set(photographerId, times[Math.floor(Math.random() * times.length)])
    }
    return responseTimeMapRef.current.get(photographerId)
  }

  useEffect(() => {
    const fetchFeaturedPhotographers = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/photographers/featured")
        if (response.ok) {
          const data = await response.json()
          const photographersWithStaticData = data.photographers.map((p: Photographer) => ({
            ...p,
            availability: getRandomAvailability(p.id),
            responseTime: getRandomResponseTime(p.id),
            portfolioImages: p.portfolioImages || [],
          }))
          setPhotographers(photographersWithStaticData || [])
        } else {
          console.error("Failed to fetch featured photographers")
          setPhotographers([])
        }
      } catch (error) {
        console.error("Error fetching featured photographers:", error)
        setPhotographers([])
      } finally {
        setLoading(false)
      }
    }
    fetchFeaturedPhotographers()
  }, [])

  const toggleFavorite = (photographerId: string) => {
    setFavorites((prevFavorites) => {
      const newFavorites = new Set(prevFavorites)
      if (newFavorites.has(photographerId)) {
        newFavorites.delete(photographerId)
      } else {
        newFavorites.add(photographerId)
      }
      return newFavorites
    })
  }

  // Remove mainStyle from additionalStyles to avoid duplicate badge
  const getFilteredAdditionalStyles = (mainStyle: string, additionalStyles?: string[]) => {
    if (!additionalStyles) return []
    return additionalStyles.filter(
      (style) => style.toLowerCase() !== mainStyle.toLowerCase()
    )
  }

  const getStyleColor = (style: string, isDarkBackground: boolean) => {
    const styleColorsOnDark: { [key: string]: string } = {
      wedding: "bg-pink-300 text-pink-900",
      portrait: "bg-blue-300 text-blue-900",
      event: "bg-purple-300 text-purple-900",
      "real estate": "bg-green-300 text-green-900",
      food: "bg-orange-300 text-orange-900",
      product: "bg-gray-300 text-gray-900",
      sports: "bg-red-300 text-red-900",
      street: "bg-yellow-300 text-yellow-900",
      nature: "bg-emerald-300 text-emerald-900",
      pet: "bg-amber-300 text-amber-900",
    }
    const styleColorsOnLight: { [key: string]: string } = {
      wedding: "bg-pink-100 text-pink-800",
      portrait: "bg-blue-100 text-blue-800",
      event: "bg-purple-100 text-purple-800",
      "real estate": "bg-green-100 text-green-800",
      food: "bg-orange-100 text-orange-800",
      product: "bg-gray-100 text-gray-800",
      sports: "bg-red-100 text-red-800",
      street: "bg-yellow-100 text-yellow-800",
      nature: "bg-emerald-100 text-emerald-800",
      pet: "bg-amber-100 text-amber-800",
    }
    return isDarkBackground
      ? styleColorsOnDark[style.toLowerCase()] || "bg-gray-300 text-gray-900"
      : styleColorsOnLight[style.toLowerCase()] || "bg-blue-100 text-blue-800"
  }

  // Subtle box shadow for card hover
  const cardShadow = "shadow-[0_6px_32px_0_rgba(64,104,179,0.12)]"

  // Helper to display price with its type
  const renderPrice = (price: string, priceType?: string) => (
    <>
      <span className="text-2xl font-extrabold">{price}</span>
      {priceType && (
        <span className="ml-1 text-base font-semibold">
          {"/hour"}
        </span>
      )}
    </>
  )

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="h-[500px] bg-white rounded-2xl border-2 border-gray-100 animate-pulse shadow-sm">
            <div className="p-6 flex flex-col items-center">
              <div className="w-36 h-36 mx-auto mb-4 bg-gray-100 rounded-full"></div>
              <div className="h-5 bg-gray-100 w-3/4 rounded mb-2"></div>
              <div className="h-4 bg-gray-100 w-1/2 rounded mb-4"></div>
              <div className="h-8 bg-gray-100 w-full rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (photographers.length === 0) {
    return (
      <div className="text-center py-12">
        <Camera className="w-16 h-16 text-gray-200 mx-auto mb-6" />
        <h2 className="text-2xl font-semibold mb-2 text-gray-900">No featured photographers yet</h2>
        <p className="text-gray-600 mb-6">Check back soon as photographers join our platform</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 px-2 md:px-0">
      {photographers.map((photographer) => {
        const filteredAdditionalStyles = getFilteredAdditionalStyles(
          photographer.mainStyle,
          photographer.additionalStyles
        )
        return (
          <Card
            key={photographer.id}
            className={`bg-white border border-gray-100 rounded-2xl transition-all duration-200 relative overflow-hidden group h-[500px] cursor-pointer ${cardShadow} hover:shadow-2xl hover:border-blue-300 hover:scale-[1.025]`}
          >
            {/* Premium badge */}
            {photographer.subscriptionPlan === "premium" && (
              <div className="absolute top-4 left-4 z-20">
                <Badge className="bg-gradient-to-r from-purple-400 to-indigo-400 text-white font-medium shadow">
                  Premium
                </Badge>
              </div>
            )}

            {/* Favorite (heart) button with micro-interaction */}
            <button
              aria-label={favorites.has(photographer.id) ? "Remove from favorites" : "Add to favorites"}
              onClick={(e) => {
                e.stopPropagation()
                toggleFavorite(photographer.id)
              }}
              className={`absolute top-4 right-4 z-20 p-2 rounded-full shadow-md bg-white/80 hover:bg-gray-100 border border-gray-100 transition-all duration-200 focus:ring-2 focus:ring-blue-300`}
            >
              <Heart
                className={`w-5 h-5 transition-colors duration-100 ${
                  favorites.has(photographer.id) ? "fill-blue-500 text-blue-500 scale-110" : "text-gray-300 hover:text-blue-400"
                }`}
              />
            </button>

            {/* DEFAULT STATE: White background and readable text colors */}
            <div className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-0 flex flex-col p-7 bg-white text-gray-900 rounded-2xl">
              {/* Profile Image or Placeholder */}
              <div className="flex-shrink-0 pb-2 flex justify-center items-center">
                <div className="w-36 h-36 rounded-full border-[3px] border-gray-100 bg-gray-100 shadow-lg overflow-hidden flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border border-gray-200 pointer-events-none"></div>
                  {photographer.portfolioImage ? (
                    <img
                      src={photographer.portfolioImage || "/placeholder.svg"}
                      alt={photographer.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <User className="w-16 h-16 text-gray-200" />
                  )}
                </div>
              </div>

              {/* Card Content */}
              <div className="flex-grow flex flex-col justify-between">
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold mb-0.5">{photographer.name}</h3>
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-700 font-medium">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    {photographer.location}
                  </div>
                  <div className="mt-1 text-xs text-gray-600">{photographer.mainStyle} Photography</div>
                </div>
                {/* Badges for styles */}
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  <Badge className={`${getStyleColor(photographer.mainStyle, false)} font-medium px-3 py-1 rounded-full`}>
                    {photographer.mainStyle}
                  </Badge>
                  {filteredAdditionalStyles.slice(0, 2).map((style, index) => (
                    <Badge key={index} variant="outline" className="text-xs rounded-full border-gray-200 text-gray-700 bg-gray-100">
                      {style}
                    </Badge>
                  ))}
                </div>
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                  <div className="bg-white rounded-lg p-2 border border-gray-100 flex flex-col items-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-gray-900">{photographer.rating}</span>
                    </div>
                    <span className="text-xs text-gray-600 font-medium">({photographer.reviews})</span>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-gray-100 flex flex-col items-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <span className="font-medium text-gray-900">{photographer.availability}</span>
                    </div>
                    <span className="text-xs text-gray-600 font-medium">Available</span>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-gray-100 flex flex-col items-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Clock className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-gray-900">{photographer.responseTime}</span>
                    </div>
                    <span className="text-xs text-gray-600 font-medium">Response</span>
                  </div>
                </div>
                {/* Price Badge */}
                <div className="text-center mt-auto pb-2">
                  <div className="inline-flex items-baseline rounded-full px-5 py-2 shadow-md bg-blue-100 text-blue-800 font-bold text-lg tracking-wide hover:scale-105 transition-transform duration-200">
                    {renderPrice(photographer.price, photographer.priceType)}
                  </div>
                </div>
              </div>
            </div>
            {/* HOVER STATE: Portfolio Images & Overlay */}
            <div className="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col overflow-hidden rounded-2xl">
              {photographer.portfolioImages && photographer.portfolioImages.length >= 2 ? (
                <div className="flex flex-col h-full">
                  <div className="flex-grow relative overflow-hidden border-b border-gray-100">
                    <img
                      src={photographer.portfolioImages[0] || "/placeholder.svg"}
                      alt={`Portfolio image 1`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none rounded-t-2xl" />
                  </div>
                  <div className="flex-grow relative overflow-hidden">
                    <img
                      src={photographer.portfolioImages[1] || "/placeholder.svg"}
                      alt={`Portfolio image 2`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent pointer-events-none rounded-b-2xl" />
                  </div>
                </div>
              ) : (
                <div className="flex-grow flex items-center justify-center text-center text-gray-200 bg-gray-100">
                  <div className="p-4 flex flex-col items-center">
                    <Camera className="w-16 h-16 mb-2" />
                    <p className="text-base font-medium text-gray-400">Not enough portfolio images available</p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/80 via-black/30 to-transparent text-white p-6 opacity-100 transition-opacity duration-300 group-hover:opacity-100">
                <h3 className="text-3xl font-bold mb-2 text-center drop-shadow">{photographer.name}</h3>
                <div className="flex items-center justify-center gap-1 text-base text-blue-100 mb-4">
                  <MapPin className="w-5 h-5" />
                  {photographer.location}
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4 text-center w-full max-w-sm">
                  <div className="bg-white/15 rounded-lg p-2">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-white text-base">{photographer.rating}</span>
                    </div>
                    <p className="text-xs text-blue-100">({photographer.reviews})</p>
                  </div>
                  <div className="bg-white/15 rounded-lg p-2">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Calendar className="w-5 h-5 text-blue-300" />
                      <span className="font-medium text-white text-base">{photographer.availability}</span>
                    </div>
                    <p className="text-xs text-blue-100">Available</p>
                  </div>
                  <div className="bg-white/15 rounded-lg p-2">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="w-5 h-5 text-green-300" />
                      <span className="font-medium text-white text-base">{photographer.responseTime}</span>
                    </div>
                    <p className="text-xs text-blue-100">Response</p>
                  </div>
                </div>
                <div className="text-center mb-6">
                  <div className="text-xl font-bold text-white">
                    {renderPrice(photographer.price, photographer.priceType)}
                  </div>
                </div>
                <Button
                  onClick={() => router.push(`/book/${photographer.id}`)}
                  className="w-3/4 max-w-sm border border-white text-white bg-blue-600 hover:bg-white hover:text-blue-600 transition-all duration-200 rounded-lg shadow-lg hover:shadow-xl font-semibold py-2 text-lg"
                >
                  View Portfolio & Book
                </Button>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
