"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Camera, MapPin, Star, Heart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// The Photographer interface should match the one in PhotographerCard
interface Photographer {
  id: string | number
  name: string
  location: string
  mainStyle?: string
  additionalStyles?: string[]
  rating?: number
  reviews?: number
  price?: string
  priceType?: string
  portfolioImage?: string
  portfolioImages?: string[]
  subscriptionPlan?: string
  availability?: string
  responseTime?: string
  profile_image?: string
  featured_images?: string[]
}

// Get style color based on main style
function getStyleColor(style: string, service: string) {
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

  const styles = service === "photographer" ? photographyStyles : videographyStyles
  const styleObj = styles.find((s) => s.value === style.toLowerCase())
  return styleObj?.color || "bg-gray-100 text-gray-800"
}

export default function FeaturedPhotographers() {
  const [photographers, setPhotographers] = useState<Photographer[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredPhotographer, setHoveredPhotographer] = useState<number | null>(null)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
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

  useEffect(() => {
    const fetchFeaturedPhotographers = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/photographers/featured")
        if (response.ok) {
          const data = await response.json()
          const photographersWithStaticData = data.photographers.map((p: Photographer) => ({
            ...p,
            availability: getRandomAvailability(p.id as string),
            responseTime: getRandomResponseTime(p.id as string),
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

  if (loading) {
    // Skeleton loader for a better user experience
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="h-[500px] bg-gray-100 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    )
  }

  if (photographers.length === 0) {
    return (
      <div className="text-center py-12">
        <Camera className="w-16 h-16 text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-semibold mb-2 text-gray-900">No featured photographers yet</h2>
        <p className="text-gray-600">Check back soon as our community grows!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 px-2 md:px-0">
      {photographers.map((photographer) => (
        <Card
          key={photographer.id}
          className="hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden group h-96 bg-white rounded-xl border-2 border-gray-100 hover:border-gray-200"
          onMouseEnter={() => setHoveredPhotographer(photographer.id as number)}
          onMouseLeave={() => setHoveredPhotographer(null)}
        >
          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(photographer.id as number)
            }}
            className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-sm"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                favorites.has(photographer.id as number)
                  ? "fill-red-500 text-red-500"
                  : "text-gray-400 hover:text-red-400"
              }`}
            />
          </button>

          {/* Default Card Content */}
          <div
            className={`absolute inset-0 bg-white transition-opacity duration-300 ${
              hoveredPhotographer === photographer.id ? "opacity-0" : "opacity-100"
            }`}
          >
            <CardHeader className="text-center relative p-6">
              <div className="w-24 h-24 mx-auto mb-4 relative overflow-hidden rounded-full bg-gray-200 flex items-center justify-center">
                {photographer.profile_image || photographer.portfolioImage ? (
                  <img
                    src={photographer.profile_image || photographer.portfolioImage}
                    alt={photographer.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <Camera className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <CardTitle className="text-xl font-bold mb-2">{photographer.name}</CardTitle>
              <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-3">
                <MapPin className="w-4 h-4" />
                {photographer.location}
              </div>

              {/* Specialty Badge */}
              <Badge
                className={`${getStyleColor(photographer.mainStyle || "", "photographer")} font-medium px-3 py-1 rounded-full`}
              >
                {photographer.mainStyle}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              <div className="flex flex-wrap gap-1">
                {(photographer.additionalStyles || []).map((style, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-700 rounded-full">
                    {style}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-sm">{photographer.rating}</span>
                  <span className="text-xs text-gray-600">({photographer.reviews})</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 mb-1">{photographer.price}</div>
                <div className="text-sm text-gray-600 mb-4">{photographer.priceType}</div>
              </div>
              <Button
                onClick={() => router.push(`/book/${photographer.id}`)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 rounded-lg shadow-md hover:shadow-lg"
              >
                View Profile & Book
              </Button>
            </CardContent>
          </div>

          {/* Portfolio Preview Overlay with 2 Images */}
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${
              hoveredPhotographer === photographer.id ? "opacity-100" : "opacity-0"
            }`}
          >
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
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-500 flex flex-col justify-between p-6 text-white">
              <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                <h3 className="text-xl font-bold mb-2">{photographer.name}</h3>
                <div className="flex items-center justify-center gap-1 text-sm mb-3">
                  <MapPin className="w-4 h-4" />
                  {photographer.location}
                </div>
                <Badge className={`${getStyleColor(photographer.mainStyle || "", "photographer")} font-medium`}>
                  {photographer.mainStyle}
                </Badge>
              </div>
              <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{photographer.rating}</span>
                  <span className="text-sm opacity-80">({photographer.reviews} reviews)</span>
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
  )
}
