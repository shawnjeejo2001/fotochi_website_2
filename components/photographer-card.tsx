"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Star, Camera } from "lucide-react"
import { useRouter } from "next/navigation"

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
  isHovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export function PhotographerCard({ photographer, isHovered, onMouseEnter, onMouseLeave }: PhotographerCardProps) {
  const router = useRouter()

  const mainStyle = photographer.mainStyle || photographer.main_style || "Photography"
  const price = photographer.price || photographer.price_range || "Contact for pricing"
  const portfolioImage = photographer.portfolioImage || photographer.profile_image

  return (
    <Card
      className="hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden group h-80 sm:h-96"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Default Card Content */}
      <div
        className={`absolute inset-0 bg-white transition-opacity duration-300 ${
          isHovered ? "opacity-0" : "opacity-100"
        }`}
      >
        <CardHeader className="text-center relative">
          <div className="w-20 sm:w-24 md:w-32 h-20 sm:h-24 md:h-32 mx-auto mb-4 relative overflow-hidden rounded-full bg-gray-200 flex items-center justify-center">
            {photographer.profile_image || photographer.portfolioImage ? (
              <img
                src={photographer.profile_image || photographer.portfolioImage || "/placeholder.svg"}
                alt={photographer.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <Camera className="w-6 sm:w-8 md:w-12 h-6 sm:h-8 md:h-12 text-gray-400" />
            )}
          </div>
          <h3 className="text-lg sm:text-xl font-medium">{photographer.name}</h3>
          <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            {photographer.location}
            {photographer.distance && (
              <span className="text-xs text-blue-600 ml-2">({photographer.distance.toFixed(1)} mi)</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div>
            <Badge variant="default" className="mb-2 text-xs">
              {mainStyle}
            </Badge>
            {photographer.additionalStyles && (
              <div className="flex flex-wrap gap-1">
                {photographer.additionalStyles.map((style, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {style}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {photographer.rating && (
                <>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-sm">{photographer.rating}</span>
                  <span className="text-xs text-gray-600">({photographer.reviews})</span>
                </>
              )}
            </div>
            <span className="font-bold text-base sm:text-lg">{price}</span>
          </div>
          <Button
            onClick={() => router.push(`/book/${photographer.id}`)}
            className="w-full bg-black text-white hover:bg-gray-800 transition-colors text-sm shadow-md hover:shadow-lg"
          >
            View Profile & Book
          </Button>
        </CardContent>
      </div>

      {/* Portfolio Preview Overlay */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}>
        <div className="w-full h-full grid grid-rows-2 gap-0">
          <div className="w-full h-full overflow-hidden">
            <img
              src={
                photographer.featured_images?.[0] ||
                photographer.profile_image ||
                photographer.portfolioImage ||
                "/placeholder.svg?height=200&width=400&query=wedding photography" ||
                "/placeholder.svg" ||
                "/placeholder.svg"
              }
              alt={`${photographer.name}'s portfolio 1`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="w-full h-full overflow-hidden">
            <img
              src={
                photographer.featured_images?.[1] ||
                photographer.featured_images?.[0] ||
                photographer.profile_image ||
                "/placeholder.svg?height=200&width=400" ||
                "/placeholder.svg" ||
                "/placeholder.svg"
              }
              alt={`${photographer.name}'s portfolio 2`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-500 flex flex-col justify-between p-4 sm:p-6 text-white">
          <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <h3 className="text-lg sm:text-xl font-bold mb-2">{photographer.name}</h3>
            <div className="flex items-center justify-center gap-1 text-sm mb-3">
              <MapPin className="w-4 h-4" />
              {photographer.location}
            </div>
            <Badge variant="secondary" className="bg-white text-black text-xs">
              {mainStyle}
            </Badge>
          </div>
          <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            {photographer.rating && (
              <div className="flex items-center justify-center gap-2 mb-3">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{photographer.rating}</span>
                <span className="text-sm opacity-80">({photographer.reviews} reviews)</span>
              </div>
            )}
            <div className="text-xl sm:text-2xl font-bold mb-3">{price}</div>
            <Button
              onClick={() => router.push(`/book/${photographer.id}`)}
              className="bg-white text-black hover:bg-gray-100 transition-colors text-sm shadow-md hover:shadow-lg"
            >
              View Profile & Book
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
