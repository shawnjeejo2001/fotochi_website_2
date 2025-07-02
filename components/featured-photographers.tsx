"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Camera } from "lucide-react"
import { PhotographerCard } from "@/components/photographer-card"

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

interface FeaturedPhotographersProps {
  className?: string
}

const FeaturedPhotographers: React.FC<FeaturedPhotographersProps> = ({ className }) => {
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

  if (!photographers.length) {
    return (
      <div className="text-center py-12">
        <Camera className="w-16 h-16 text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-semibold mb-2 text-gray-900">No featured photographers yet</h2>
        <p className="text-gray-600">Check back soon as our community grows!</p>
      </div>
    )
  }

  return (
    <div className={className + " grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
      {photographers.map((photographer: Photographer, idx: number) => (
        <PhotographerCard
          key={idx}
          photographer={photographer}
        />
      ))}
    </div>
  )
}

export default FeaturedPhotographers
