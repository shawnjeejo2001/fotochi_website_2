"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { Camera, Calendar, Clock, MapPin, MessageCircle, Settings, Bell, Star, Search } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function ClientDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sentRequests, setSentRequests] = useState([])
  const [uploading, setUploading] = useState(false)

  // Check for user data in localStorage or redirect to sign-in
  useEffect(() => {
    const checkAuthentication = () => {
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

        // Verify this is a client
        if (user.user_type === "provider") {
          console.log("User is not a client, redirecting")
          router.push("/dashboard/photographer")
          return
        }

        // Set user data
        setUserData({
          ...user,
          name: user.full_name || "Client",
          email: user.email,
          profileImage: user.profile_image || null,
          totalBookings: 0, // Default for new users
          activeRequests: 0, // Default for new users
          completedEvents: 0, // Default for new users
        })

        // For now, use empty arrays for requests
        setSentRequests([])
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
    // Clear user data from localStorage
    localStorage.removeItem("fotorra_user")
    router.push("/")
  }

  const handleMessagePhotographer = (photographerId: number) => {
    router.push(`/messages/${photographerId}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("userId", userData.id)
      formData.append("userType", "client")

      const response = await fetch("/api/profile-picture", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        // Update local user data
        const updatedUserData = {
          ...userData,
          profileImage: result.imageUrl,
        }
        setUserData(updatedUserData)
        localStorage.setItem("fotorra_user", JSON.stringify(updatedUserData))

        toast({
          title: "Success",
          description: "Profile picture updated successfully!",
          variant: "default",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to upload image",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-b-blue-600 border-l-gray-200 border-r-gray-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/")}
              className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              Fotochi
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
                className="bg-white text-black border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={userData.profileImage || "/placeholder.svg"} alt={userData.name} />
              <AvatarFallback>
                {userData.name ? userData.name.charAt(0).toUpperCase() : <Camera className="w-8 h-8" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{userData.name}</h1>
              <p className="text-gray-600 mb-2">{userData.email}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{userData.totalBookings || 0} total bookings</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-gray-400" />
                  <span>{userData.completedEvents || 0} completed events</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <input
                type="file"
                id="profile-picture"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePictureUpload}
              />
              <Button
                onClick={() => document.getElementById("profile-picture")?.click()}
                disabled={uploading}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
              >
                <Camera className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "Change Photo"}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Requests</p>
                  <p className="text-2xl font-bold">{userData.activeRequests || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed Events</p>
                  <p className="text-2xl font-bold">{userData.completedEvents || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Search className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold">{userData.totalBookings || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {sentRequests.length > 0 ? (
                    sentRequests.slice(0, 3).map((request: any) => (
                      <div key={request.id} className="border-b last:border-b-0 pb-4 last:pb-0 mb-4 last:mb-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage
                              src={request.photographerImage || "/placeholder.svg"}
                              alt={request.photographerName}
                            />
                            <AvatarFallback>
                              <Camera className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{request.eventType}</h4>
                            <p className="text-xs text-gray-600">with {request.photographerName}</p>
                          </div>
                          <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                        </div>
                        <p className="text-xs text-gray-500">{request.messageTime}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No activity yet</h3>
                      <p className="text-gray-500">Your recent photographer requests will appear here.</p>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full mt-4 bg-transparent"
                    onClick={() => setActiveTab("requests")}
                  >
                    View All Requests
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                    onClick={() => router.push("/")}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Find New Photographers
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-white text-black border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg"
                    onClick={() => setActiveTab("requests")}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    View Messages
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Consultation
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Photographer Requests</CardTitle>
                <p className="text-gray-600">View and manage your booking requests</p>
              </CardHeader>
              <CardContent>
                {sentRequests.length > 0 ? (
                  <div className="space-y-4">
                    {sentRequests.map((request: any) => (
                      <div key={request.id} className="border rounded-lg p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage
                              src={request.photographerImage || "/placeholder.svg"}
                              alt={request.photographerName}
                            />
                            <AvatarFallback>
                              <Camera className="w-6 h-6" />
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="text-lg font-semibold">{request.photographerName}</h3>
                                <div className="flex items-center gap-1 mb-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm font-medium">{request.rating}</span>
                                </div>
                              </div>
                              <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                            </div>

                            <div className="mb-3">
                              <h4 className="font-medium mb-1">{request.eventType}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {request.date}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {request.time}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {request.location}
                                </div>
                              </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                              <p className="text-sm text-gray-700 mb-1">
                                <strong>Last message:</strong> {request.lastMessage}
                              </p>
                              <p className="text-xs text-gray-500">{request.messageTime}</p>
                            </div>

                            <Button
                              onClick={() => handleMessagePhotographer(request.id)}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Message {request.photographerName}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No requests yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      You haven't sent any requests to photographers yet. Browse photographers and send booking requests
                      to get started.
                    </p>
                    <Button className="mt-6" onClick={() => router.push("/")}>
                      Find Photographers
                    </Button>
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
