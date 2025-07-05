"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Camera, MapPin } from "lucide-react"

interface Photographer {
  id: string
  name: string
  location: string
  mainStyle: string
  additionalStyles?: string[]
  bio: string
  rating: number
  reviews: number
  price: string
  profileImageUrl: string
  portfolioImages?: string[]
}

export default function PhotographersPage() {
  const [photographers, setPhotographers] = useState<Photographer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchPhotographers = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/photographers/search")

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.photographers && Array.isArray(data.photographers)) {
          setPhotographers(data.photographers)
        } else {
          // Fallback to sample data if the response format is unexpected
          setPhotographers(samplePhotographers)
        }
      } catch (error) {
        console.error("Could not fetch photographers:", error)
        setError("Failed to load photographers. Using sample data instead.")
        setPhotographers(samplePhotographers)
      } finally {
        setLoading(false)
      }
    }

    fetchPhotographers()
  }, [])

  // Sample data as fallback with portfolio images
  const samplePhotographers: Photographer[] = [
    {
      id: "1",
      name: "John Smith",
      location: "New York, NY",
      mainStyle: "Wedding",
      additionalStyles: ["Portrait", "Event"],
      bio: "Professional wedding photographer with over 10 years of experience capturing special moments.",
      rating: 4.8,
      reviews: 120,
      price: "$500-$1000",
      profileImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop&crop=faces",
      portfolioImages: [
        "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop",
      ],
    },
    {
      id: "2",
      name: "Emily Johnson",
      location: "Los Angeles, CA",
      mainStyle: "Portrait",
      additionalStyles: ["Fashion", "Commercial"],
      bio: "Specializing in portrait photography that captures the essence of your personality.",
      rating: 4.9,
      reviews: 150,
      price: "$400-$800",
      profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616c9c0e8e5?w=400&h=400&fit=crop&crop=faces",
      portfolioImages: [
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=300&fit=crop",
      ],
    },
    {
      id: "3",
      name: "David Lee",
      location: "Chicago, IL",
      mainStyle: "Event",
      additionalStyles: ["Corporate", "Sports"],
      bio: "Event photographer focused on capturing the energy and excitement of your special occasions.",
      rating: 4.7,
      reviews: 100,
      price: "$300-$700",
      profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces",
      portfolioImages: [
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop",
      ],
    },
    {
      id: "4",
      name: "Sarah Brown",
      location: "Houston, TX",
      mainStyle: "Real Estate",
      additionalStyles: ["Architecture", "Interior"],
      bio: "Helping real estate agents showcase properties with stunning photography.",
      rating: 4.6,
      reviews: 90,
      price: "$200-$500",
      profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces",
      portfolioImages: [
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
      ],
    },
    {
      id: "5",
      name: "Michael Davis",
      location: "Miami, FL",
      mainStyle: "Street",
      additionalStyles: ["Documentary", "Travel"],
      bio: "Street photographer capturing authentic moments and urban landscapes.",
      rating: 4.5,
      reviews: 80,
      price: "$300-$600",
      profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces",
      portfolioImages: [
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
      ],
    },
    {
      id: "6",
      name: "Linda Wilson",
      location: "Seattle, WA",
      mainStyle: "Product",
      additionalStyles: ["Food", "Commercial"],
      bio: "Product photographer helping businesses showcase their items with professional imagery.",
      rating: 4.9,
      reviews: 130,
      price: "$400-$900",
      profileImageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces",
      portfolioImages: [
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
      ],
    },
  ]

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
        <span className="ml-1 text-xs text-gray-600">{rating.toFixed(1)}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <button
                onClick={() => router.push("/")}
                className="text-2xl sm:text-3xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
              >
                Fotochi
              </button>
              <p className="text-sm sm:text-base text-gray-600">
                Find the perfect photographer or videographer for your needs
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Button
                onClick={() => router.push("/sign-in")}
                className="text-sm bg-white text-black border border-gray-300 hover:bg-black hover:text-white hover:border-black transition-colors"
              >
                Sign In
              </Button>
              <Button onClick={() => router.push("/sign-up")} className="text-sm bg-blue-600 hover:bg-blue-700">
                Join Fotochi
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Camera className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">Photographers</h1>
          </div>
        </div>

        {error && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-yellow-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : photographers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {photographers.map((photographer) => (
              <Card
                key={photographer.id}
                className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full">
                    <img
                      src={
                        photographer.profileImageUrl ||
                        photographer.portfolioImages?.[0] ||
                        "/placeholder.svg?height=192&width=384&query=photographer"
                      }
                      alt={photographer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">{photographer.name}</h2>
                    {renderStars(photographer.rating)}
                  </div>

                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{photographer.location}</span>
                  </div>

                  <div className="mb-3">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1 inline-flex mr-2">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {photographer.mainStyle}
                    </Badge>

                    {photographer.additionalStyles?.slice(0, 2).map(
                      (style, index) =>
                        style && (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 inline-flex mr-2 mt-1"
                          >
                            {style}
                          </Badge>
                        ),
                    )}
                  </div>

                  {/* Portfolio Preview */}
                  {photographer.portfolioImages && photographer.portfolioImages.length > 0 && (
                    <div className="mb-4">
                      <div className="grid grid-cols-2 gap-2">
                        {photographer.portfolioImages.slice(0, 2).map((image, index) => (
                          <div key={index} className="relative h-20 w-full">
                            <img
                              src={image || "/placeholder.svg"}
                              alt={`${photographer.name}'s portfolio ${index + 1}`}
                              className="w-full h-full object-cover rounded"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600">{photographer.reviews} bookings</span>
                    <span className="font-medium text-gray-900">{photographer.price}</span>
                  </div>

                  <Button
                    onClick={() => router.push(`/book/${photographer.id}`)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0"
                  >
                    View Profile & Book
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2 text-gray-900">No photographers found</h2>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
