"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, XCircle, Eye, Camera, MapPin, Calendar } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Provider {
  id: string
  user_id: string
  name: string
  service: string
  location: string
  main_style: string
  about_text: string
  portfolio_files: string[]
  profile_image: string
  status: string
  created_at: string
  users: {
    email: string
    created_at: string
  }
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      const response = await fetch("/api/providers")
      const data = await response.json()

      if (data.success) {
        setProviders(data.providers)
      }
    } catch (error) {
      console.error("Error fetching providers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (providerId: string) => {
    try {
      const response = await fetch(`/api/providers/${providerId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved", is_active: true }),
      })

      if (response.ok) {
        fetchProviders() // Refresh the list
      }
    } catch (error) {
      console.error("Error approving provider:", error)
    }
  }

  const handleReject = async (providerId: string) => {
    try {
      const response = await fetch(`/api/providers/${providerId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected", is_active: false }),
      })

      if (response.ok) {
        fetchProviders() // Refresh the list
      }
    } catch (error) {
      console.error("Error rejecting provider:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-b-blue-600 border-l-gray-200 border-r-gray-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading provider applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Provider Applications</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          {providers.map((provider) => (
            <Card key={provider.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={provider.profile_image || "/placeholder.svg"} alt={provider.name} />
                      <AvatarFallback>
                        <Camera className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{provider.name}</h3>
                        <Badge className={getStatusColor(provider.status)}>{provider.status}</Badge>
                      </div>

                      <p className="text-gray-600 mb-2">{provider.users.email}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="font-medium">{provider.service}</span>
                        {provider.main_style && <span>• {provider.main_style}</span>}
                        {provider.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {provider.location}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-3 h-3" />
                        Applied: {new Date(provider.created_at).toLocaleDateString()}
                      </div>

                      {provider.portfolio_files && provider.portfolio_files.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 mb-2">
                            Portfolio: {provider.portfolio_files.length} images
                          </p>
                          <div className="flex gap-2">
                            {provider.portfolio_files.slice(0, 3).map((image, index) => (
                              <img
                                key={index}
                                src={image || "/placeholder.svg"}
                                alt={`Portfolio ${index + 1}`}
                                className="w-12 h-12 object-cover rounded border"
                              />
                            ))}
                            {provider.portfolio_files.length > 3 && (
                              <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                                +{provider.portfolio_files.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedProvider(provider)
                        setShowDetails(true)
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>

                    {provider.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(provider.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleReject(provider.id)}>
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {providers.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-500">Provider applications will appear here when submitted.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Provider Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Provider Application Details</DialogTitle>
          </DialogHeader>

          {selectedProvider && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={selectedProvider.profile_image || "/placeholder.svg"} alt={selectedProvider.name} />
                  <AvatarFallback>
                    <Camera className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{selectedProvider.name}</h3>
                  <p className="text-gray-600 mb-2">{selectedProvider.users.email}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <Badge className={getStatusColor(selectedProvider.status)}>{selectedProvider.status}</Badge>
                    <span>{selectedProvider.service}</span>
                    {selectedProvider.main_style && <span>• {selectedProvider.main_style}</span>}
                  </div>
                </div>
              </div>

              {selectedProvider.about_text && (
                <div>
                  <h4 className="font-semibold mb-2">About</h4>
                  <p className="text-gray-700">{selectedProvider.about_text}</p>
                </div>
              )}

              {selectedProvider.location && (
                <div>
                  <h4 className="font-semibold mb-2">Location</h4>
                  <p className="text-gray-700 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedProvider.location}
                  </p>
                </div>
              )}

              {selectedProvider.portfolio_files && selectedProvider.portfolio_files.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Portfolio ({selectedProvider.portfolio_files.length} images)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedProvider.portfolio_files.map((image, index) => (
                      <img
                        key={index}
                        src={image || "/placeholder.svg"}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full aspect-square object-cover rounded border"
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedProvider.status === "pending" && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => {
                      handleApprove(selectedProvider.id)
                      setShowDetails(false)
                    }}
                    className="bg-green-600 hover:bg-green-700 flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Application
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleReject(selectedProvider.id)
                      setShowDetails(false)
                    }}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Application
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
