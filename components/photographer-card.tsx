// components/photographer-card.tsx

"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Star, Camera, Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface PhotographerCardProps {
  photographer: {
    id: string | number
    name: string
    location: string
    mainStyle?: string
    main_style?: string
    additionalStyles?: string[]
    rating?: number
    reviews?: number
    price?: string
    price_range?: string
    portfolioImage?: string
    profile_image?: string
    featured_images?: string[]
    distance?: number
  }
}

export function PhotographerCard({ photographer }: PhotographerCardProps) {
  const router = useRouter()
  // The hover state is now managed inside each card individually
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const mainStyle = photographer.mainStyle || photographer.main_style || "Photography"
  const price = photographer.price || photographer.price_range || "Contact for pricing"
  const profileImage = photographer.profile_image || photographer.portfolioImage

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevents the card's onClick from firing
    setIsFavorite(!isFavorite)
  }

  return (
    <Card
      className="hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden group h-[420px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => router.push(`/book/${photographer.id}`)}
    >
      {/* Favorite Button */}
      <button
        aria-label="Toggle Favorite"
        onClick={toggleFavorite}
        className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-md"
      >
        <Heart
          className={`w-5 h-5 transition-colors ${
            isFavorite ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-400"
          }`}
        />
      </button>

      {/* Default Card Content */}
      <div
        className={`absolute inset-0 bg-white transition-opacity duration-300 ${
          isHovered ? "opacity-0" : "opacity-100"
        } p-6 flex flex-col`}
      >
        <CardHeader className="text-center relative p-0 mb-4">
          <div className="w-32 h-32 mx-auto mb-4 relative overflow-hidden rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-100 shadow-lg">
            {profileImage ? (
              <img
                src={profileImage}
                alt={photographer.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <Camera className="w-12 h-12 text-gray-400" />
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-900">{photographer.name}</h3>
          <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            {photographer.location}
            {photographer.distance && (
              <span className="text-xs text-blue-600 ml-2">({photographer.distance.toFixed(1)} mi)</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-0 flex-grow flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              <Badge variant="default" className="text-xs font-semibold">
                {mainStyle}
              </Badge>
              {photographer.additionalStyles?.slice(0, 2).map((style, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {style}
                </Badge>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                {photographer.rating && photographer.reviews != null && photographer.reviews > 0 ? (
                  <>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900">{photographer.rating}</span>
                    <span className="text-xs">({photographer.reviews})</span>
                  </>
                ) : (
                  <span className="font-semibold text-sm text-gray-700">New</span>
                )}
              </div>
              <span className="font-bold text-lg text-gray-900">{price}</span>
            </div>
          </div>
          <Button
            className="w-full bg-black text-white hover:bg-gray-800 transition-colors text-sm shadow-md hover:shadow-lg mt-4"
          >
            View Profile & Book
          </Button>
        </CardContent>
      </div>

      {/* Portfolio Preview Overlay (Hover State) */}
      <div className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${isHovered ? "opacity-100" : "opacity-0"}`}>
        <div className="w-full h-full grid grid-rows-2 gap-0">
          <div className="w-full h-full overflow-hidden">
            <img
              src={photographer.featured_images?.[0] || profileImage || "/placeholder.svg"}
              alt={`${photographer.name}'s portfolio 1`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="w-full h-full overflow-hidden">
            <img
              src={photographer.featured_images?.[1] || photographer.featured_images?.[0] || profileImage || "/placeholder.svg"}
              alt={`${photographer.name}'s portfolio 2`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/80 via-black/30 to-transparent text-white p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
            <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">{photographer.name}</h3>
            <Button
              className="bg-white text-black hover:bg-gray-100 transition-colors text-sm shadow-lg hover:shadow-xl"
            >
              View Profile & Book
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
