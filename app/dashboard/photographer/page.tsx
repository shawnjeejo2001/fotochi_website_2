"use client"
import ImageCropper from "@/components/image-cropper" // Import ImageCropper component

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import {
  Camera,
  CalendarIcon,
  Clock,
  MessageCircle,
  Settings,
  Bell,
  Star,
  Users,
  CreditCard,
  Crown,
  Zap,
  ImageIcon,
  StarOff,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import PortfolioManager from "@/components/portfolio-manager"
import CustomCalendar from "@/components/custom-calendar"
import ProfilePictureUploader from "@/components/profile-picture-uploader"

export default function PhotographerDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [pendingRequests, setPendingRequests] = useState([])
  const [activeEvents, setActiveEvents] = useState([])
  const [reviews, setReviews] = useState([])
  const [uploading, setUploading] = useState(false)
  const [portfolioImages, setPortfolioImages] = useState<string[]>([])
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [availableDates, setAvailableDates] = useState<Date[]>([])
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([])
  const [availabilityMode, setAvailabilityMode] = useState<"available" | "unavailable">("available")
  const [cropperVisible, setCropperVisible] = useState(false)
  const [imageToEdit, setImageToEdit] = useState<string | null>(null)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [selectedReview, setSelectedReview] = useState<any>(null)
  const [reviewResponse, setReviewResponse] = useState("")

  // Sample reviews data
  const sampleReviews = [
    {
      id: 1,
      clientName: "Sarah Johnson",
      rating: 5,
      comment: "Amazing photographer! Captured our wedding perfectly. Professional and creative.",
      eventType: "Wedding",
      date: "2024-01-15",
      response: "Thank you so much Sarah! It was a pleasure working with you both.",
    },
    {
      id: 2,
      clientName: "Mike Chen",
      rating: 4,
      comment: "Great work on our corporate event. Very professional and delivered on time.",
      eventType: "Corporate Event",
      date: "2024-01-10",
      response: null,
    },
    {
      id: 3,
      clientName: "Emily Davis",
      rating: 5,
      comment: "Exceeded our expectations! The photos are stunning and captured every emotion.",
      eventType: "Portrait Session",
      date: "2024-01-05",
      response: "Thank you Emily! Your family was wonderful to work with.",
    },
  ]

  // Check for user data in localStorage or redirect to sign-in
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        setLoading(true)

        // Check if user data exists in localStorage (set during sign-in)
        const storedUser = localStorage.getItem("fotorra_user")

        if (!storedUser) {
          console.log("No user data found, redirecting to sign-in")
          router.push("/sign-in")
          return
        }

        const user = JSON.parse(storedUser)
        console.log("Stored user data:", user)

        // Verify this is a photographer
        if (user.user_type !== "provider") {
          console.log("User is not a photographer, redirecting")
          router.push("/dashboard/client")
          return
        }

        // Fetch fresh provider data from database to get the latest profile image
        try {
          const providerResponse = await fetch(`/api/photographers/${user.id}`)
          if (providerResponse.ok) {
            const providerData = await providerResponse.json()
            console.log("Fresh provider data:", providerData)

            // Update user data with fresh database info
            const updatedUser = {
              ...user,
              provider: providerData,
              profileImage: providerData.profile_image,
            }

            // Update localStorage with fresh data
            localStorage.setItem("fotorra_user", JSON.stringify(updatedUser))
            setUserData({
              ...updatedUser,
              name: user.full_name || providerData.name || "Photographer",
              email: user.email,
              profileImage: providerData.profile_image,
              // Remove these fake stats:
              // rating: providerData.rating || 4.8,
              // totalBookings: providerData.total_bookings || 12,
              // activeEvents: 3,
              // pendingRequests: 2,
            })

            // Load availability data
            if (providerData.available_dates) {
              setAvailableDates(providerData.available_dates.map((date: string) => new Date(date)))
            }
            if (providerData.unavailable_dates) {
              setUnavailableDates(providerData.unavailable_dates.map((date: string) => new Date(date)))
            }
          } else {
            // Fallback to stored user data
            setUserData({
              ...user,
              name: user.full_name || user.provider?.name || "Photographer",
              email: user.email,
              profileImage: user.provider?.profile_image || null,
              rating: user.provider?.rating || 4.8,
              totalBookings: user.provider?.total_bookings || 12,
              subscriptionPlan: user.provider?.subscription_plan || "starter",
              activeEvents: 3,
              pendingRequests: 2,
            })
          }
        } catch (error) {
          console.error("Error fetching fresh provider data:", error)
          // Fallback to stored user data
          setUserData({
            ...user,
            name: user.full_name || user.provider?.name || "Photographer",
            email: user.email,
            profileImage: user.provider?.profile_image || null,
            rating: user.provider?.rating || 4.8,
            totalBookings: user.provider?.total_bookings || 12,
            subscriptionPlan: user.provider?.subscription_plan || "starter",
            activeEvents: 3,
            pendingRequests: 2,
          })
        }

        // Fetch portfolio images
        try {
          const portfolioResponse = await fetch(`/api/photographers/portfolio?userId=${user.id}`)
          if (portfolioResponse.ok) {
            const portfolioData = await portfolioResponse.json()
            setPortfolioImages(portfolioData.portfolioImages || [])
          }
        } catch (error) {
          console.error("Error fetching portfolio:", error)
        }

        // Set sample reviews
        setReviews(sampleReviews)

        // For now, use empty arrays for requests and events
        setPendingRequests([])
        setActiveEvents([])
      } catch (error) {
        console.error("Error checking authentication:", error)
        router.push("/sign-in")
      } finally {
        setLoading(false)
      }
    }

    checkAuthentication()
  }, [router])

  const handleSignOut = () => {
    localStorage.removeItem("fotorra_user")
    router.push("/")
  }

  const handleRespondToReview = (review: any) => {
    setSelectedReview(review)
    setReviewResponse("")
    setShowReviewDialog(true)
  }

  const submitReviewResponse = async () => {
    if (!reviewResponse.trim()) return

    try {
      // In a real app, this would call an API
      console.log("Submitting response:", reviewResponse)

      // Update the review locally
      const updatedReviews = reviews.map((review: any) =>
        review.id === selectedReview.id ? { ...review, response: reviewResponse } : review,
      )
      setReviews(updatedReviews)

      toast({
        title: "Success",
        description: "Your response has been posted!",
        variant: "default",
      })

      setShowReviewDialog(false)
      setSelectedReview(null)
      setReviewResponse("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post response. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCropComplete = (croppedArea: any, croppedImage: string) => {
    // Handle crop complete logic here
    console.log("Cropped area:", croppedArea)
    console.log("Cropped image:", croppedImage)
    // Update profile image with cropped image
    const updatedUserData = {
      ...userData,
      profileImage: croppedImage,
    }
    setUserData(updatedUserData)
    localStorage.setItem("fotorra_user", JSON.stringify(updatedUserData))
    setCropperVisible(false)
  }

  const handleCropCancel = () => {
    // Handle crop cancel logic here
    setCropperVisible(false)
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case "professional":
        return <Zap className="w-4 h-4 text-blue-600" />
      case "premium":
        return <Crown className="w-4 h-4 text-purple-600" />
      default:
        return <ImageIcon className="w-4 h-4 text-gray-600" />
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "professional":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "premium":
        return "text-purple-600 bg-purple-50 border-purple-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const saveAvailability = async () => {
    try {
      console.log("Saving availability...")

      // Save to database first
      const response = await fetch("/api/photographers/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData.id,
          availableDates: availableDates.map((d) => d.toISOString().split("T")[0]),
          unavailableDates: unavailableDates.map((d) => d.toISOString().split("T")[0]),
        }),
      })

      if (response.ok) {
        // Clear selected dates after successful save
        setSelectedDates([])

        toast({
          title: "Availability Updated",
          description: "Your availability has been saved successfully",
        })
      } else {
        throw new Error("Failed to save availability")
      }
    } catch (error) {
      console.error("Error saving availability:", error)
      toast({
        title: "Error",
        description: "Failed to save availability. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Optimized date selection handler - no lag
  const handleDateSelect = (dates: Date[] | undefined) => {
    if (!dates) {
      setSelectedDates([])
      return
    }

    // Update selected dates immediately
    setSelectedDates(dates)

    // Update availability arrays immediately for visual feedback
    const newDate = dates[dates.length - 1] // Get the most recently selected date
    if (!newDate) return

    const dateString = newDate.toISOString().split("T")[0]

    if (availabilityMode === "available") {
      // Add to available dates immediately
      setAvailableDates((prev) => {
        const exists = prev.some((d) => d.toISOString().split("T")[0] === dateString)
        return exists ? prev : [...prev, newDate]
      })
      // Remove from unavailable
      setUnavailableDates((prev) => prev.filter((d) => d.toISOString().split("T")[0] !== dateString))
    } else {
      // Add to unavailable dates immediately
      setUnavailableDates((prev) => {
        const exists = prev.some((d) => d.toISOString().split("T")[0] === dateString)
        return exists ? prev : [...prev, newDate]
      })
      // Remove from available
      setAvailableDates((prev) => prev.filter((d) => d.toISOString().split("T")[0] !== dateString))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-b-blue-600 border-l-gray-200 border-r-gray-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">Unable to load your profile. Please sign in again.</p>
          <Button className="mt-4" onClick={() => router.push("/sign-in")}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Cropper */}
      {cropperVisible && imageToEdit && (
        <ImageCropper
          image={imageToEdit}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1}
          cropShape="round"
        />
      )}

      {/* Review Response Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Respond to Review</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < selectedReview.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{selectedReview.clientName}</span>
                </div>
                <p className="text-sm text-gray-700">{selectedReview.comment}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Your Response</label>
                <Textarea
                  value={reviewResponse}
                  onChange={(e) => setReviewResponse(e.target.value)}
                  placeholder="Thank you for your feedback..."
                  className="min-h-[100px] bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>
          )}
          <DialogFooter className="bg-white">
            <Button
              variant="outline"
              onClick={() => setShowReviewDialog(false)}
              className="bg-white text-gray-900 border-gray-300"
            >
              Cancel
            </Button>
            <Button onClick={submitReviewResponse} disabled={!reviewResponse.trim()} className="bg-blue-600 text-white">
              Post Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/")}
              className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              Fotorra
            </button>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="bg-white text-gray-900 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-16 h-16 border-2 border-gray-200">
                <AvatarImage
                  src={
                    userData.profileImage && userData.profileImage !== "/placeholder.svg"
                      ? `${userData.profileImage}?t=${Date.now()}`
                      : undefined
                  }
                  alt={userData.name}
                  className="object-cover"
                  key={userData.profileImage} // Force re-render when image changes
                />
                <AvatarFallback className="bg-gray-100 text-gray-600 text-2xl">
                  {userData.name ? userData.name.charAt(0).toUpperCase() : <Camera className="w-8 h-8" />}
                </AvatarFallback>
              </Avatar>
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2 text-gray-900">{userData.name}</h1>
              <p className="text-gray-600 mb-2">{userData.email}</p>
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-900">{userData.rating || "New"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{userData.totalBookings || 0} bookings</span>
                </div>
              </div>
              <Badge className={`${getPlanColor(userData.subscriptionPlan)} border font-medium px-3 py-1`}>
                {getPlanIcon(userData.subscriptionPlan)}
                <span className="ml-1 capitalize">{userData.subscriptionPlan} Plan</span>
              </Badge>
            </div>
            <ProfilePictureUploader
              currentImage={userData.profileImage}
              userId={userData.id}
              userType="provider"
              userName={userData.name}
              onUploadSuccess={(imageUrl) => {
                const updatedUserData = {
                  ...userData,
                  profileImage: imageUrl,
                }
                setUserData(updatedUserData)
                localStorage.setItem("fotorra_user", JSON.stringify(updatedUserData))
              }}
              className="max-w-md mx-auto"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Events</p>
                  <p className="text-2xl font-bold text-gray-900">{userData.activeEvents || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{userData.pendingRequests || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{userData.rating || "New"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 bg-white border shadow-sm">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=inactive]:text-gray-700 data-[state=inactive]:bg-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=inactive]:text-gray-700 data-[state=inactive]:bg-white"
            >
              Event Requests
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=inactive]:text-gray-700 data-[state=inactive]:bg-white"
            >
              Active Events
            </TabsTrigger>
            <TabsTrigger
              value="portfolio"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=inactive]:text-gray-700 data-[state=inactive]:bg-white"
            >
              Portfolio
            </TabsTrigger>
            <TabsTrigger
              value="availability"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=inactive]:text-gray-700 data-[state=inactive]:bg-white"
            >
              Availability
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=inactive]:text-gray-700 data-[state=inactive]:bg-white"
            >
              Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Portfolio Preview */}
              <Card className="border shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="text-gray-900">Portfolio Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  {portfolioImages.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {portfolioImages.slice(0, 4).map((image, index) => (
                        <div key={index} className="aspect-square overflow-hidden rounded-lg border">
                          <img
                            src={
                              image && image !== "/placeholder.svg"
                                ? image
                                : "/placeholder.svg?height=200&width=200&text=Portfolio"
                            }
                            alt={`Portfolio ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg?height=200&width=200&text=Portfolio"
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No portfolio images</h3>
                      <p className="text-gray-500">Upload your work to showcase your skills.</p>
                    </div>
                  )}
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab("portfolio")}>
                    Manage Portfolio
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Requests */}
              <Card className="border shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="text-gray-900">Recent Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No requests yet</h3>
                    <p className="text-gray-500">When clients request your services, they'll appear here.</p>
                  </div>
                  <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab("requests")}>
                    View All Requests
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button
                    onClick={() => setActiveTab("portfolio")}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                  >
                    <Camera className="w-4 h-4" />
                    Manage Portfolio
                  </Button>
                  <Button
                    onClick={() => setActiveTab("availability")}
                    variant="outline"
                    className="flex items-center gap-2 bg-white text-gray-900 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg"
                  >
                    <CalendarIcon className="w-4 h-4" />
                    Set Availability
                  </Button>
                  <Button
                    onClick={() => setActiveTab("reviews")}
                    variant="outline"
                    className="flex items-center gap-2 bg-white text-gray-900 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg"
                  >
                    <Star className="w-4 h-4" />
                    View Reviews
                  </Button>
                  <Button onClick={() => router.push("/pricing")} variant="outline" className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Upgrade Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <PortfolioManager userId={userData.id} />
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card className="border shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">Event Requests</CardTitle>
                <p className="text-gray-600">Review and respond to booking requests</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No requests yet</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    When clients request your services, they'll appear here. Make sure your profile is complete to
                    attract more clients.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            <Card className="border shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">Active Events</CardTitle>
                <p className="text-gray-600">Manage your confirmed bookings and upload photos</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No active events</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    When you accept booking requests, your scheduled events will appear here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability" className="space-y-6">
            <Card className="border shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">Manage Availability</CardTitle>
                <p className="text-gray-600">Set your availability up to 3 months in advance</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <Button
                      variant={availabilityMode === "available" ? "default" : "outline"}
                      onClick={() => setAvailabilityMode("available")}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Available
                    </Button>
                    <Button
                      variant={availabilityMode === "unavailable" ? "default" : "outline"}
                      onClick={() => setAvailabilityMode("unavailable")}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Mark as Unavailable
                    </Button>
                  </div>

                  <CustomCalendar
                    selectedDates={selectedDates}
                    onDateSelect={handleDateSelect}
                    availableDates={availableDates}
                    unavailableDates={unavailableDates}
                    mode="multiple"
                    className="max-w-4xl mx-auto"
                  />

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-200 border border-green-300 rounded"></div>
                      <span className="text-gray-700">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-200 border border-red-300 rounded"></div>
                      <span className="text-gray-700">Unavailable</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-600 rounded"></div>
                      <span className="text-gray-700">Selected</span>
                    </div>
                  </div>

                  {selectedDates.length > 0 && (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Selected Dates ({selectedDates.length})</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedDates.map((date, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                              {date.toLocaleDateString()}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-blue-700 mt-2">These dates will be marked as {availabilityMode}</p>
                      </div>

                      <Button onClick={saveAvailability} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        Save Availability Changes
                      </Button>
                    </div>
                  )}

                  {/* Current Availability Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Available Dates</h4>
                      <p className="text-sm text-green-700">{availableDates.length} dates marked as available</p>
                    </div>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-red-900 mb-2">Unavailable Dates</h4>
                      <p className="text-sm text-red-700">{unavailableDates.length} dates marked as unavailable</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card className="border shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">Client Reviews</CardTitle>
                <p className="text-gray-600">See what your clients are saying about your work</p>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="border rounded-lg p-6 bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">{review.clientName}</h4>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">{review.rating}/5</span>
                            </div>
                            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                              {review.eventType}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>

                        <p className="text-gray-700 mb-4">{review.comment}</p>

                        {review.response ? (
                          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                            <p className="text-sm font-medium text-blue-900 mb-1">Your Response:</p>
                            <p className="text-sm text-blue-800">{review.response}</p>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRespondToReview(review)}
                            className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Respond to Review
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <StarOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No reviews yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Complete your first booking to start receiving reviews from clients.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
