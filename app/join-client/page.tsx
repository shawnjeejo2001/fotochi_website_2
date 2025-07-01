"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, User, Mail, Phone, MapPin } from "lucide-react"
import FotorraLogo from "@/components/fotorra-logo"

export default function JoinClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    address: "",
  })

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.fullName) {
      setError("Email, password, and full name are required")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userType: "client",
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess("Account created successfully! Redirecting to sign in...")
        setTimeout(() => {
          router.push("/sign-in")
        }, 2000)
      } else {
        setError(result.error || "Failed to create account")
      }
    } catch (err) {
      console.error("Error creating account:", err)
      setError("Failed to create account. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {" "}
      {/* Changed background to match join-provider */}
      {/* Header */}
      <header className="bg-white shadow-sm">
        {" "}
        {/* Simplified border-b */}
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {" "}
            {/* Adjusted to justify-between for consistency */}
            <div className="flex items-center gap-4">
              {" "}
              {/* Group back button and logo */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-gray-700 hover:bg-gray-100 hover:text-gray-900" // Removed redundant border-0
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <button onClick={() => router.push("/")} className="flex items-center gap-2">
                <FotorraLogo size="md" />
              </button>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/sign-in")}
              className="bg-white text-black border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-md mx-auto px-4 py-12">
        {" "}
        {/* Retained max-w-md for client form */}
        <Card className="bg-white">
          {" "}
          {/* Removed redundant shadow-lg border border-gray-200, Card usually has this */}
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Join as a Client</CardTitle>
            <p className="text-gray-600">Create your account to book photographers and videographers</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-gray-900 font-medium">
                    Full Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => updateFormData("fullName", e.target.value)}
                      className="pl-10 bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-900 font-medium">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      className="pl-10 bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-gray-900 font-medium">
                    Password *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
                    className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Create a password"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-gray-900 font-medium">
                    Confirm Password *
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                    className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Confirm your password"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-900 font-medium">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData("phone", e.target.value)}
                      className="pl-10 bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="text-gray-900 font-medium">
                    Address
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => updateFormData("address", e.target.value)}
                      className="pl-10 bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="City, State"
                    />
                  </div>
                </div>
              </div>

              {/* Messages */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 shadow-md hover:shadow-lg transition-all duration-200"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-gray-600">Already have an account? </span>
              <button
                onClick={() => router.push("/sign-in")}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Sign In
              </button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
