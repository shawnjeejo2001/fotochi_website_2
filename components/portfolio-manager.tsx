"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Camera, Upload, Trash2, Star, Crown, Zap, ImageIcon, AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PortfolioManagerProps {
  userId: string
}

interface PortfolioData {
  portfolioImages: string[]
  featuredImages: string[]
  profileImage?: string
  maxImages: number
  currentPlan: string
  remainingSlots: number
}

export default function PortfolioManager({ userId }: PortfolioManagerProps) {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    portfolioImages: [],
    featuredImages: [],
    maxImages: 5,
    currentPlan: "starter",
    remainingSlots: 5,
  })
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Plan configuration
  const planConfig = {
    starter: { maxImages: 5, icon: ImageIcon, color: "text-gray-600 bg-gray-50 border-gray-200" },
    professional: { maxImages: 20, icon: Zap, color: "text-blue-600 bg-blue-50 border-blue-200" },
    premium: { maxImages: 50, icon: Crown, color: "text-purple-600 bg-purple-50 border-purple-200" },
  }

  useEffect(() => {
    fetchPortfolioData()
  }, [userId])

  const fetchPortfolioData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/photographers/portfolio?userId=${userId}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Portfolio fetch failed:", errorText)
        throw new Error("Failed to fetch portfolio data")
      }

      const data = await response.json()
      setPortfolioData(data)
      console.log("Portfolio data loaded:", data)
    } catch (error) {
      console.error("Error fetching portfolio:", error)
      toast({
        title: "Error",
        description: "Failed to load portfolio data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshPortfolio = async () => {
    setRefreshing(true)
    await fetchPortfolioData()
    setRefreshing(false)
    toast({
      title: "Portfolio Refreshed",
      description: "Portfolio data has been updated",
    })
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    console.log("Files selected:", files.length)

    // Check if user has enough slots
    if (files.length > portfolioData.remainingSlots) {
      toast({
        title: "Upload Limit Exceeded",
        description: `You can only upload ${portfolioData.remainingSlots} more images. Your ${portfolioData.currentPlan} plan allows ${portfolioData.maxImages} total images.`,
        variant: "destructive",
      })
      return
    }

    // Validate file types and sizes
    const validFiles = Array.from(files).filter((file) => {
      const isValidType = ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB

      if (!isValidType) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not a valid image format. Please use JPG, PNG, or WebP.`,
          variant: "destructive",
        })
        return false
      }

      if (!isValidSize) {
        toast({
          title: "File Too Large",
          description: `${file.name} is too large. Maximum file size is 10MB.`,
          variant: "destructive",
        })
        return false
      }

      return true
    })

    if (validFiles.length === 0) return

    await uploadImages(validFiles)

    // Reset file input
    event.target.value = ""
  }

  const uploadImages = async (files: File[]) => {
    setUploading(true)
    try {
      console.log("Starting upload for", files.length, "files")

      const formData = new FormData()
      formData.append("userId", userId)

      files.forEach((file) => {
        formData.append("files", file)
      })

      const response = await fetch("/api/photographers/portfolio", {
        method: "POST",
        body: formData,
      })

      console.log("Upload response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Upload failed with response:", errorText)

        // Try to parse as JSON, fallback to text
        let errorMessage = "Failed to upload images"
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }

        toast({
          title: "Upload Failed",
          description: errorMessage,
          variant: "destructive",
        })
        return
      }

      const result = await response.json()
      console.log("Upload response:", result)

      toast({
        title: "Success",
        description: `${result.uploadedUrls.length} images uploaded successfully!`,
        variant: "default",
      })

      // Refresh portfolio data
      await fetchPortfolioData()
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Error",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const deleteImage = async (imageUrl: string) => {
    try {
      const response = await fetch("/api/photographers/portfolio", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          imageUrl,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Delete failed:", errorText)
        throw new Error("Failed to delete image")
      }

      const result = await response.json()

      toast({
        title: "Success",
        description: "Image deleted successfully",
        variant: "default",
      })

      // Refresh portfolio data
      await fetchPortfolioData()
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Error",
        description: "Failed to delete image. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleFeatured = async (imageUrl: string) => {
    const isFeatured = portfolioData.featuredImages.includes(imageUrl)
    let newFeaturedImages: string[]

    if (isFeatured) {
      // Remove from featured
      newFeaturedImages = portfolioData.featuredImages.filter((url) => url !== imageUrl)
    } else {
      // Add to featured (max 2)
      if (portfolioData.featuredImages.length >= 2) {
        toast({
          title: "Featured Limit",
          description: "You can only have 2 featured images. Remove one first.",
          variant: "destructive",
        })
        return
      }
      newFeaturedImages = [...portfolioData.featuredImages, imageUrl]
    }

    try {
      const response = await fetch("/api/photographers/portfolio", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          featuredImages: newFeaturedImages,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update featured images")
      }

      const result = await response.json()

      toast({
        title: "Success",
        description: isFeatured ? "Removed from featured" : "Added to featured",
        variant: "default",
      })

      // Update local state
      setPortfolioData((prev) => ({
        ...prev,
        featuredImages: newFeaturedImages,
      }))
    } catch (error) {
      console.error("Featured toggle error:", error)
      toast({
        title: "Error",
        description: "Failed to update featured images. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getPlanIcon = (plan: string) => {
    const config = planConfig[plan as keyof typeof planConfig] || planConfig.starter
    const IconComponent = config.icon
    return <IconComponent className="w-4 h-4" />
  }

  const getPlanColor = (plan: string) => {
    const config = planConfig[plan as keyof typeof planConfig] || planConfig.starter
    return config.color
  }

  if (loading) {
    return (
      <Card className="border shadow-sm bg-white">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading portfolio...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Plan Status */}
      <Card className="border shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900">Portfolio Management</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={refreshPortfolio} disabled={refreshing} className="bg-white">
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Badge className={`${getPlanColor(portfolioData.currentPlan)} border font-medium px-3 py-1`}>
                {getPlanIcon(portfolioData.currentPlan)}
                <span className="ml-1 capitalize">{portfolioData.currentPlan} Plan</span>
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">
                {portfolioData.portfolioImages.length} of {portfolioData.maxImages} images used
              </p>
              <div className="w-64 bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(portfolioData.portfolioImages.length / portfolioData.maxImages) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">{portfolioData.remainingSlots}</p>
              <p className="text-sm text-gray-600">slots remaining</p>
            </div>
          </div>

          {portfolioData.remainingSlots === 0 && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You've reached your plan limit. Upgrade to upload more images or delete existing ones to make space.
              </AlertDescription>
            </Alert>
          )}

          {/* Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              id="portfolio-files"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading || portfolioData.remainingSlots === 0}
            />

            {uploading ? (
              <div className="space-y-2">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-600">Uploading images...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <Button
                    onClick={() => {
                      console.log("Upload button clicked")
                      const fileInput = document.getElementById("portfolio-files") as HTMLInputElement
                      if (fileInput) {
                        fileInput.click()
                      } else {
                        console.error("File input not found")
                      }
                    }}
                    disabled={portfolioData.remainingSlots === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Upload Images
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  {portfolioData.remainingSlots > 0
                    ? `Upload up to ${portfolioData.remainingSlots} more images`
                    : "Plan limit reached"}
                </p>
                <p className="text-xs text-gray-400">JPG, PNG, WebP up to 10MB each</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Grid */}
      <Card className="border shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-gray-900">Your Portfolio ({portfolioData.portfolioImages.length})</CardTitle>
          <p className="text-gray-600">Click the star to feature up to 2 images on your profile</p>
        </CardHeader>
        <CardContent>
          {portfolioData.portfolioImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {portfolioData.portfolioImages.map((imageUrl, index) => {
                const isFeatured = portfolioData.featuredImages.includes(imageUrl)
                return (
                  <div key={index} className="relative group">
                    <div className="aspect-square overflow-hidden rounded-lg border bg-gray-100">
                      <img
                        src={
                          imageUrl && imageUrl !== "/placeholder.svg"
                            ? imageUrl
                            : "/placeholder.svg?height=300&width=300&text=Portfolio"
                        }
                        alt={`Portfolio image ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          console.error("Failed to load image:", imageUrl)
                          target.src = "/placeholder.svg?height=300&width=300&text=Failed"
                        }}
                        onLoad={() => {
                          console.log("Successfully loaded image:", imageUrl)
                        }}
                      />
                    </div>

                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                        <Button
                          size="sm"
                          variant={isFeatured ? "default" : "secondary"}
                          onClick={() => toggleFeatured(imageUrl)}
                          className={
                            isFeatured
                              ? "bg-yellow-500 hover:bg-yellow-600"
                              : "bg-white text-gray-900 hover:bg-gray-100"
                          }
                        >
                          <Star className={`w-4 h-4 ${isFeatured ? "fill-white" : ""}`} />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteImage(imageUrl)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Featured badge */}
                    {isFeatured && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-yellow-500 text-white border-0">
                          <Star className="w-3 h-3 mr-1 fill-white" />
                          Featured
                        </Badge>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No portfolio images yet</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Upload your best work to showcase your photography skills to potential clients.
              </p>
              <Button
                onClick={() => {
                  const fileInput = document.getElementById("portfolio-files") as HTMLInputElement
                  if (fileInput) {
                    fileInput.click()
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Camera className="w-4 h-4 mr-2" />
                Upload Your First Images
              </Button>
            </div>
          )}

          {portfolioData.portfolioImages.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Featured Images:</strong> {portfolioData.featuredImages.length}/2 selected
                {portfolioData.featuredImages.length !== 2 && (
                  <span className="block mt-1">
                    {portfolioData.featuredImages.length === 0
                      ? "Select 2 images to feature on your profile card"
                      : "Select 1 more image to complete your featured selection"}
                  </span>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
