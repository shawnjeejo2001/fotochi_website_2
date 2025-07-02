"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Star, Camera, Calendar, Clock, User, Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

// Define a comprehensive interface for the photographer prop
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
    profile_image?: string // To support different data structures
    featured_images?: string[] // For the hover preview
}

interface PhotographerCardProps {
    photographer: Photographer
}

// Helper to get the correct color for a style badge
const getStyleColor = (style: string) => {
    const styleColors: { [key: string]: string } = {
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
    return styleColors[style?.toLowerCase()] || "bg-gray-100 text-gray-800"
}

// Helper to render the price with its type
const renderPrice = (price?: string, priceType?: string) => (
    <>
        <span className="text-2xl font-extrabold">{price || "$0"}</span>
        {priceType && <span className="ml-1 text-base font-semibold">/{priceType}</span>}
    </>
)

export function PhotographerCard({ photographer }: PhotographerCardProps) {
    const router = useRouter()
    const [isHovered, setIsHovered] = useState(false)
    const [isFavorite, setIsFavorite] = useState(false)

    // Consolidate data from different possible prop names
    const portfolioImage = photographer.portfolioImage || photographer.profile_image
    const featuredImages = photographer.featured_images || photographer.portfolioImages || []

    const toggleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsFavorite((prev) => !prev)
    }

    // Filter out the main style from additional styles to prevent duplicates
    const filteredAdditionalStyles = (photographer.additionalStyles || []).filter(
        (style) => (style || "").toLowerCase() !== (photographer.mainStyle || "").toLowerCase()
    );
    
    // Define the shadow for a cleaner look
    const cardShadow = "shadow-[0_6px_32px_0_rgba(64,104,179,0.12)]"

    return (
        <Card
            className={`bg-white border border-gray-100 rounded-2xl transition-all duration-300 relative overflow-hidden group h-[500px] cursor-pointer ${cardShadow} hover:shadow-2xl hover:border-blue-300 hover:scale-[1.025]`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => router.push(`/book/${photographer.id}`)}
        >
            {/* Favorite Button */}
            <button
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                onClick={toggleFavorite}
                className={`absolute top-4 right-4 z-20 p-2 rounded-full shadow-md bg-white/80 hover:bg-gray-100 border border-gray-100 transition-all duration-200 focus:ring-2 focus:ring-blue-300`}
            >
                <Heart
                    className={`w-5 h-5 transition-all duration-200 ${
                        isFavorite ? "fill-red-500 text-red-500 scale-110" : "text-gray-400 hover:text-red-400"
                    }`}
                />
            </button>
            
            {/* Default State */}
            <div className={`absolute inset-0 transition-opacity duration-300 ${isHovered ? "opacity-0" : "opacity-100"} flex flex-col p-7 bg-white text-gray-900 rounded-2xl`}>
                <div className="flex-shrink-0 pb-2 flex justify-center items-center">
                    <div className="w-36 h-36 rounded-full border-[3px] border-gray-100 bg-gray-100 shadow-lg overflow-hidden flex items-center justify-center relative">
                        {portfolioImage ? (
                            <img src={portfolioImage} alt={photographer.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                            <User className="w-16 h-16 text-gray-300" />
                        )}
                    </div>
                </div>

                <div className="flex-grow flex flex-col justify-between">
                    <div className="text-center mb-4">
                        <h3 className="text-2xl font-bold mb-0.5" style={{ color: 'black' }}>{photographer.name}</h3>
                        <div className="flex items-center justify-center gap-1 text-sm text-gray-700 font-medium">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            {photographer.location}
                        </div>
                        {photographer.mainStyle && <div className="mt-1 text-xs text-gray-600">{photographer.mainStyle} Photography</div>}
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                        {photographer.mainStyle && <Badge className={`${getStyleColor(photographer.mainStyle)} font-medium px-3 py-1 rounded-full`}>{photographer.mainStyle}</Badge>}
                        {filteredAdditionalStyles.slice(0, 2).map((style, index) => (
                            <Badge key={index} variant="outline" className="text-xs rounded-full border-gray-200 text-gray-700 bg-gray-100">{style}</Badge>
                        ))}
                    </div>
                    
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

                    <div className="text-center mt-auto pb-2">
                        <div className="inline-flex items-baseline rounded-full px-5 py-2 shadow-md bg-blue-100 text-blue-800 font-bold text-lg">
                            {renderPrice(photographer.price, photographer.priceType)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hover State */}
            <div className={`absolute inset-0 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"} flex flex-col overflow-hidden rounded-2xl`}>
                <div className="flex flex-col h-full">
                    <div className="flex-grow relative overflow-hidden">
                        <img src={featuredImages[0] || portfolioImage || "/placeholder.svg"} alt={`${photographer.name}'s portfolio 1`} className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow relative overflow-hidden">
                        <img src={featuredImages[1] || portfolioImage || "/placeholder.svg"} alt={`${photographer.name}'s portfolio 2`} className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/80 via-black/30 to-transparent text-white p-6">
                    <h3 className="text-3xl font-bold mb-2 text-center drop-shadow">{photographer.name}</h3>
                    <div className="flex items-center justify-center gap-1 text-base text-blue-100 mb-4">
                        <MapPin className="w-5 h-5" />
                        {photographer.location}
                    </div>
                    <Button onClick={() => router.push(`/book/${photographer.id}`)} className="w-3/4 max-w-sm border border-white text-white bg-blue-600 hover:bg-white hover:text-blue-600 transition-all duration-200 rounded-lg shadow-lg font-semibold py-2 text-lg">
                        View Portfolio & Book
                    </Button>
                </div>
            </div>
        </Card>
    )
}
