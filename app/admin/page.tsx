"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  Shield,
  AlertTriangle,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Settings,
  Users,
  Star,
  Database,
  Mail,
  Crown,
  User,
  ExternalLink,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface Provider {
  id: string
  name: string
  service: string
  location: string
  status: string
  created_at: string
  user_id: string
  membership_tier?: string
  email?: string
}

interface PremiumRequest {
  id: string
  email: string
  name: string
  message: string
  status: string
  created_at: string
}

export default function AdminPage() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState("")

  // Admin settings
  const [currentAdminPassword, setCurrentAdminPassword] = useState("")
  const [newAdminPassword, setNewAdminPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [showSettings, setShowSettings] = useState(false)

  // Data state
  const [providers, setProviders] = useState<Provider[]>([])
  const [premiumRequests, setPremiumRequests] = useState<PremiumRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [premiumTableExists, setPremiumTableExists] = useState(true)

  // Dialog states
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [providerToDelete, setProviderToDelete] = useState<Provider | null>(null)

  // Email dialog states
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [emailType, setEmailType] = useState<"single" | "bulk">("single")
  const [emailRecipient, setEmailRecipient] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [emailLoading, setEmailLoading] = useState(false)

  // Membership dialog states
  const [showMembershipDialog, setShowMembershipDialog] = useState(false)
  const [selectedProviderForMembership, setSelectedProviderForMembership] = useState<Provider | null>(null)
  const [newMembershipTier, setNewMembershipTier] = useState("")
  const [membershipLoading, setMembershipLoading] = useState(false)

  // Check if user is already authenticated on page load
  useEffect(() => {
    const authStatus = localStorage.getItem("admin_authenticated")
    if (authStatus === "true") {
      setIsAuthenticated(true)
      fetchData()
    }
  }, [])

  const handleLogin = async () => {
    setAuthLoading(true)
    setAuthError("")

    try {
      const storedPassword = localStorage.getItem("admin_password") || "admin123"

      if (password === storedPassword) {
        setIsAuthenticated(true)
        localStorage.setItem("admin_authenticated", "true")
        toast.success("Successfully logged in to admin panel")
        fetchData()
      } else {
        setAuthError("Incorrect password")
      }
    } catch (error) {
      setAuthError("Login failed")
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("admin_authenticated")
    setPassword("")
    toast.success("Logged out successfully")
  }

  const handlePasswordChange = () => {
    if (!currentAdminPassword) {
      toast.error("Please enter current password")
      return
    }

    if (newAdminPassword !== confirmNewPassword) {
      toast.error("New passwords don't match")
      return
    }

    if (newAdminPassword.length < 6) {
      toast.error("New password must be at least 6 characters")
      return
    }

    const storedPassword = localStorage.getItem("admin_password") || "admin123"

    if (currentAdminPassword !== storedPassword) {
      toast.error("Current password is incorrect")
      return
    }

    localStorage.setItem("admin_password", newAdminPassword)
    setCurrentAdminPassword("")
    setNewAdminPassword("")
    setConfirmNewPassword("")
    setShowSettings(false)
    toast.success("Admin password updated successfully")
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch providers
      const providersResponse = await fetch("/api/providers")
      const providersData = await providersResponse.json()

      if (providersData.success) {
        setProviders(providersData.providers)
      }

      // Fetch premium requests
      const premiumResponse = await fetch("/api/premium-requests")
      const premiumData = await premiumResponse.json()

      if (premiumData.success) {
        setPremiumRequests(premiumData.requests || [])
        setPremiumTableExists(true)
      } else {
        if (premiumData.message?.includes("table not found")) {
          setPremiumTableExists(false)
          setPremiumRequests([])
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Error fetching data")
    } finally {
      setLoading(false)
    }
  }

  const handleProviderAction = async (providerId: string, action: "approve" | "reject") => {
    try {
      const response = await fetch(`/api/providers/${providerId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Provider ${action}d successfully`)
        fetchData()
      } else {
        toast.error(`Failed to ${action} provider`)
      }
    } catch (error) {
      console.error(`Error ${action}ing provider:`, error)
      toast.error(`Error ${action}ing provider`)
    }
  }

  const handlePremiumRequestAction = async (requestId: string, action: "approved" | "rejected") => {
    try {
      const response = await fetch("/api/premium-requests", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: requestId, status: action }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Premium request ${action} successfully`)
        fetchData()
      } else {
        toast.error(`Failed to ${action.slice(0, -1)} premium request`)
      }
    } catch (error) {
      console.error(`Error ${action.slice(0, -1)}ing premium request:`, error)
      toast.error(`Error ${action.slice(0, -1)}ing premium request`)
    }
  }

  const handleSendEmail = async () => {
    if (!emailSubject || !emailMessage) {
      toast.error("Please fill in subject and message")
      return
    }

    if (emailType === "single" && !emailRecipient) {
      toast.error("Please enter recipient email")
      return
    }

    setEmailLoading(true)
    try {
      const recipients =
        emailType === "bulk" ? providers.filter((p) => p.status === "approved").map((p) => p.user_id) : undefined

      const response = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: emailType,
          recipient: emailRecipient,
          recipients,
          subject: emailSubject,
          message: emailMessage,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        setShowEmailDialog(false)
        setEmailSubject("")
        setEmailMessage("")
        setEmailRecipient("")
      } else {
        toast.error("Failed to send email")
      }
    } catch (error) {
      console.error("Error sending email:", error)
      toast.error("Error sending email")
    } finally {
      setEmailLoading(false)
    }
  }

  const handleUpdateMembership = async () => {
    if (!selectedProviderForMembership || !newMembershipTier) {
      toast.error("Please select a membership tier")
      return
    }

    setMembershipLoading(true)
    try {
      const response = await fetch("/api/admin/update-membership", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          providerId: selectedProviderForMembership.id,
          membershipTier: newMembershipTier,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Membership updated successfully")
        setShowMembershipDialog(false)
        setSelectedProviderForMembership(null)
        setNewMembershipTier("")
        fetchData()
      } else {
        toast.error("Failed to update membership")
      }
    } catch (error) {
      console.error("Error updating membership:", error)
      toast.error("Error updating membership")
    } finally {
      setMembershipLoading(false)
    }
  }

  const openEmailDialog = (type: "single" | "bulk", recipient?: string) => {
    setEmailType(type)
    setEmailRecipient(recipient || "")
    setEmailSubject("")
    setEmailMessage("")
    setShowEmailDialog(true)
  }

  const openMembershipDialog = (provider: Provider) => {
    setSelectedProviderForMembership(provider)
    setNewMembershipTier(provider.membership_tier || "free")
    setShowMembershipDialog(true)
  }

  const handleDeleteUser = async () => {
    if (!providerToDelete) return

    const storedPassword = localStorage.getItem("admin_password") || "admin123"

    if (deletePassword !== storedPassword) {
      setError("Incorrect admin password. Cannot delete user.")
      return
    }

    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/providers/${providerToDelete.id}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminPassword: deletePassword,
          userId: providerToDelete.user_id,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setProviders((prev) => prev.filter((provider) => provider.id !== providerToDelete.id))
        setShowDeleteDialog(false)
        setDeletePassword("")
        setProviderToDelete(null)
        setError("")
        toast.success("User deleted successfully")
      } else {
        setError(result.message || "Failed to delete user account")
      }
    } catch (err) {
      setError("Failed to delete user account")
    } finally {
      setDeleteLoading(false)
    }
  }

  const openDeleteDialog = (provider: Provider) => {
    setProviderToDelete(provider)
    setDeletePassword("")
    setError("")
    setShowDeleteDialog(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "approved":
        return <Badge variant="default">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getMembershipBadge = (tier?: string) => {
    switch (tier) {
      case "premium":
        return (
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        )
      case "mid":
        return (
          <Badge className="bg-gradient-to-r from-blue-400 to-purple-500 text-white">
            <Star className="w-3 h-3 mr-1" />
            Mid Tier
          </Badge>
        )
      case "free":
      default:
        return (
          <Badge variant="outline">
            <User className="w-3 h-3 mr-1" />
            Free
          </Badge>
        )
    }
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>Enter your admin password to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Admin Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="Enter admin password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{authError}</p>
              </div>
            )}

            <Button onClick={handleLogin} disabled={authLoading || !password} className="w-full">
              {authLoading ? "Logging in..." : "Login"}
            </Button>

            <div className="text-center text-sm text-gray-500">Default password: admin123</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Fotochi Admin</h1>
                <p className="text-sm text-gray-600">Management Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => openEmailDialog("bulk")}
                variant="outline"
                size="sm"
                className="bg-green-50 text-green-600 border-2 border-green-200 hover:bg-green-100"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email All
              </Button>
              <Button
                onClick={() => setShowSettings(true)}
                variant="outline"
                size="sm"
                className="bg-white text-black border-2 border-gray-300 hover:bg-gray-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                onClick={fetchData}
                variant="outline"
                size="sm"
                disabled={loading}
                className="bg-white text-black border-2 border-gray-300 hover:bg-gray-50"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100"
              >
                <Lock className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="providers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Provider Applications ({providers.length})
          </TabsTrigger>
          <TabsTrigger value="premium" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Premium Requests ({premiumRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Provider Applications Tab */}
        <TabsContent value="providers" className="space-y-6">
          {providers.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">No provider applications found.</p>
              </CardContent>
            </Card>
          ) : (
            providers.map((provider) => (
              <Card key={provider.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {provider.name}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(`/photographers/${provider.id}`, "_blank")}
                            className="h-6 w-6 p-0"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </CardTitle>
                        <CardDescription>
                          {provider.service} • {provider.location}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getMembershipBadge(provider.membership_tier)}
                      {getStatusBadge(provider.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 flex-wrap">
                    <p className="text-sm text-muted-foreground">
                      Applied: {new Date(provider.created_at).toLocaleDateString()}
                    </p>

                    <div className="flex gap-2 ml-auto flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEmailDialog("single", provider.user_id)}
                        className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                      >
                        <Mail className="w-3 h-3 mr-1" />
                        Email
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openMembershipDialog(provider)}
                        className="bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100"
                      >
                        <Crown className="w-3 h-3 mr-1" />
                        Membership
                      </Button>

                      {provider.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleProviderAction(provider.id, "reject")}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleProviderAction(provider.id, "approve")}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Approve
                          </Button>
                        </>
                      )}

                      <Button size="sm" variant="destructive" onClick={() => openDeleteDialog(provider)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Premium Requests Tab */}
        <TabsContent value="premium" className="space-y-6">
          {!premiumTableExists ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                    <Database className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Premium Requests Table Not Found</h3>
                    <p className="text-sm text-gray-600 mt-2">
                      The premium_requests table doesn't exist in your database yet.
                    </p>
                    <p className="text-sm text-gray-600">Please run the SQL setup script to create the table.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : premiumRequests.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">No premium membership requests found.</p>
              </CardContent>
            </Card>
          ) : (
            premiumRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{request.name || "Unknown"}</CardTitle>
                      <CardDescription>{request.email}</CardDescription>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {request.message && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Message:</p>
                        <p className="text-sm text-gray-600">{request.message}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Requested: {new Date(request.created_at).toLocaleDateString()}
                      </p>

                      {request.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePremiumRequestAction(request.id, "rejected")}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handlePremiumRequestAction(request.id, "approved")}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Approve
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              {emailType === "bulk" ? "Send Bulk Email" : "Send Email"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {emailType === "single" && (
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Email</Label>
                <Input
                  id="recipient"
                  type="email"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  placeholder="Enter recipient email"
                />
              </div>
            )}

            {emailType === "bulk" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  This will send an email to all {providers.filter((p) => p.status === "approved").length} approved
                  photographers.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Enter email subject"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Enter email message"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} disabled={emailLoading}>
              {emailLoading ? "Sending..." : "Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Membership Dialog */}
      <Dialog open={showMembershipDialog} onOpenChange={setShowMembershipDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5" />
              Update Membership
            </DialogTitle>
          </DialogHeader>

          {selectedProviderForMembership && (
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="font-medium">{selectedProviderForMembership.name}</p>
                <p className="text-sm text-gray-600">{selectedProviderForMembership.user_id}</p>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Current: </span>
                  {getMembershipBadge(selectedProviderForMembership.membership_tier)}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="membership-tier">New Membership Tier</Label>
                <Select value={newMembershipTier} onValueChange={setNewMembershipTier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select membership tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="mid">Mid Tier</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowMembershipDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateMembership} disabled={membershipLoading}>
              {membershipLoading ? "Updating..." : "Update Membership"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Admin Settings
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentAdminPassword}
                onChange={(e) => setCurrentAdminPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowSettings(false)
                setCurrentAdminPassword("")
                setNewAdminPassword("")
                setConfirmNewPassword("")
              }}
            >
              Cancel
            </Button>
            <Button onClick={handlePasswordChange}>Update Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Modal */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete User Account
            </DialogTitle>
          </DialogHeader>

          {providerToDelete && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 mb-2">
                  <strong>Warning:</strong> This action cannot be undone!
                </p>
                <p className="text-sm text-red-700">You are about to permanently delete the account for:</p>
                <div className="mt-2 p-2 bg-white rounded border">
                  <p className="font-medium">{providerToDelete.name}</p>
                  <p className="text-sm text-gray-600">{providerToDelete.user_id}</p>
                </div>
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter admin password to confirm deletion:
                </Label>
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false)
                setDeletePassword("")
                setProviderToDelete(null)
                setError("")
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={deleteLoading || !deletePassword}>
              {deleteLoading ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
