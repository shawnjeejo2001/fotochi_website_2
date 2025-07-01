"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, CheckCircle, X, Upload, ArrowLeft } from "lucide-react"
import FotochiLogo from "@/components/fotorra-logo"

interface SocialMediaProfile {
  platform: string
  url: string
}

export default function JoinProviderPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Form data
  const [formData, setFormData] = useState({
    userType: "provider",
    service: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: "",
    mainStyle: "",
    additionalStyle1: "",
    additionalStyle2: "",
    location: "",
    aboutText: "",
  })

  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([])
  const [socialMediaProfiles, setSocialMediaProfiles] = useState<SocialMediaProfile[]>([{ platform: "", url: "" }])

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setPortfolioFiles((prev) => [...prev, ...files].slice(0, 10)) // Max 10 files
    }
  }

  const removeFile = (index: number) => {
    setPortfolioFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Social media functions
  const addSocialMediaProfile = () => {
    setSocialMediaProfiles((prev) => [...prev, { platform: "", url: "" }])
  }

  const removeSocialMediaProfile = (index: number) => {
    setSocialMediaProfiles((prev) => prev.filter((_, i) => i !== index))
  }

  const updateSocialMediaProfile = (index: number, field: "platform" | "url", value: string) => {
    setSocialMediaProfiles((prev) => prev.map((profile, i) => (i === index ? { ...profile, [field]: value } : profile)))
  }

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      return false
    }
    return true
  }

  // Password validation
  const validatePassword = (password: string) => {
    const hasLowerCase = /[a-z]/.test(password)
    const hasUpperCase = /[A-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(password)

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return false
    }

    if (!hasLowerCase || !hasUpperCase || !hasNumber || !hasSpecialChar) {
      setError(
        "Password must include at least one lowercase letter, one uppercase letter, one number, and one special character",
      )
      return false
    }

    return true
  }

  const validateStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        const isEmailValid = validateEmail(formData.email)
        const isPasswordValid = validatePassword(formData.password)
        return (
          formData.service &&
          formData.name &&
          isEmailValid &&
          isPasswordValid &&
          formData.password === formData.confirmPassword
        )
      case 2:
        return formData.dob && formData.location
      case 3:
        return formData.mainStyle && formData.aboutText.length >= 50
      case 4:
        return portfolioFiles.length >= 3
      default:
        return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Validate portfolio files
      if (portfolioFiles.length !== 3) {
        setError("Exactly 3 portfolio images are required")
        setLoading(false)
        return
      }

      const submitData = new FormData()

      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value)
      })

      // Add social media profiles
      submitData.append(
        "socialMediaProfiles",
        JSON.stringify(socialMediaProfiles.filter((profile) => profile.platform && profile.url)),
      )

      // Add portfolio files
      portfolioFiles.forEach((file, index) => {
        submitData.append(`portfolio_${index}`, file)
      })

      const response = await fetch("/api/providers", {
        method: "POST",
        body: submitData,
      })

      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text()
        console.error("API error response:", errorText)
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      // Check content type
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json()
        setSuccess(result.message || "Application submitted successfully!")

        // Redirect to home page after a delay
        setTimeout(() => {
          router.push("/")
        }, 2000)
      } else {
        // Handle non-JSON response
        const textResponse = await response.text()
        console.log("Non-JSON response:", textResponse)
        setSuccess("Application submitted successfully!")

        // Redirect to home page after a delay
        setTimeout(() => {
          router.push("/")
        }, 2000)
      }
    } catch (err) {
      console.error("Error submitting application:", err)
      setError(`Failed to submit application: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const photographyStyles = [
    "Wedding Photography",
    "Portrait Photography",
    "Event Photography",
    "Corporate Photography",
    "Fashion Photography",
    "Nature Photography",
    "Street Photography",
    "Product Photography",
    "Real Estate Photography",
    "Sports Photography",
  ]

  const videographyStyles = [
    "Wedding Videography",
    "Event Videography",
    "Corporate Videography",
    "Music Videos",
    "Documentary",
    "Commercial Videos",
    "Real Estate Videos",
    "Social Media Content",
    "Training Videos",
    "Promotional Videos",
  ]

  const availableStyles = formData.service === "Photography" ? photographyStyles : videographyStyles

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Added Back Button and grouped with FotochiLogo */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <button onClick={() => router.push("/")} className="flex items-center gap-2">
                <FotochiLogo size="md" />
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

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Join as a Provider</h1>
          <p className="text-xl text-gray-600">
            Share your talent with clients looking for professional photography and videography services
          </p>
        </div>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Provider Application</CardTitle>
            <p className="text-gray-600">
              Complete your application to join our network of professional photographers and videographers
            </p>
          </CardHeader>
          <CardContent className="bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email" className="text-gray-900">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    required
                    className="bg-white text-gray-900"
                    placeholder="Enter your email address"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-gray-900">
                    Password *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
                    required
                    className="bg-white text-gray-900"
                    placeholder="Create a password"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="text-gray-900">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    required
                    className="bg-white text-gray-900"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="service" className="text-gray-900">
                    Service Type *
                  </Label>
                  <Select value={formData.service} onValueChange={(value) => updateFormData("service", value)}>
                    <SelectTrigger className="bg-white text-gray-900">
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Photography">Photography</SelectItem>
                      <SelectItem value="Videography">Videography</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="dob" className="text-gray-900">
                    Date of Birth
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => updateFormData("dob", e.target.value)}
                    className="bg-white text-gray-900"
                    placeholder="Select your birth date"
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="text-gray-900">
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="City, State"
                    value={formData.location}
                    onChange={(e) => updateFormData("location", e.target.value)}
                    className="bg-white text-gray-900"
                  />
                </div>
              </div>

              {/* Specialization */}
              <div>
                <Label htmlFor="mainStyle" className="text-gray-900">
                  Main Specialization
                </Label>
                <Select
                  value={formData.mainStyle}
                  onValueChange={(value) => updateFormData("mainStyle", value)}
                  disabled={!formData.service}
                >
                  <SelectTrigger className="bg-white text-gray-900">
                    <SelectValue placeholder="Select your main specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStyles.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="additionalStyle1" className="text-gray-900">
                    Additional Specialization 1
                  </Label>
                  <Select
                    value={formData.additionalStyle1}
                    onValueChange={(value) => updateFormData("additionalStyle1", value)}
                    disabled={!formData.service}
                  >
                    <SelectTrigger className="bg-white text-gray-900">
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {availableStyles.map((style) => (
                        <SelectItem key={style} value={style}>
                          {style}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="additionalStyle2" className="text-gray-900">
                    Additional Specialization 2
                  </Label>
                  <Select
                    value={formData.additionalStyle2}
                    onValueChange={(value) => updateFormData("additionalStyle2", value)}
                    disabled={!formData.service}
                  >
                    <SelectTrigger className="bg-white text-gray-900">
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {availableStyles.map((style) => (
                        <SelectItem key={style} value={style}>
                          {style}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* About */}
              <div>
                <Label htmlFor="aboutText" className="text-gray-900">
                  About You
                </Label>
                <Textarea
                  id="aboutText"
                  placeholder="Tell us about your experience, style, and what makes you unique..."
                  value={formData.aboutText}
                  onChange={(e) => updateFormData("aboutText", e.target.value)}
                  rows={4}
                  className="bg-white text-gray-900"
                />
              </div>

              {/* Social Media Profiles */}
              <div>
                <Label className="text-gray-900">Social Media Profiles</Label>
                <div className="space-y-4 mt-2">
                  {socialMediaProfiles.map((profile, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-4 items-end">
                      <div className="flex-grow">
                        <Label htmlFor={`platform-${index}`} className="sr-only">
                          Platform
                        </Label>
                        <Input
                          id={`platform-${index}`}
                          placeholder="Platform (e.g., Instagram, Facebook)"
                          value={profile.platform}
                          onChange={(e) => updateSocialMediaProfile(index, "platform", e.target.value)}
                          className="bg-white text-gray-900"
                        />
                      </div>
                      <div className="flex-grow">
                        <Label htmlFor={`url-${index}`} className="sr-only">
                          URL
                        </Label>
                        <Input
                          id={`url-${index}`}
                          type="url"
                          placeholder="Profile URL (e.g., https://instagram.com/yourhandle)"
                          value={profile.url}
                          onChange={(e) => updateSocialMediaProfile(index, "url", e.target.value)}
                          className="bg-white text-gray-900"
                        />
                      </div>
                      {socialMediaProfiles.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeSocialMediaProfile(index)}
                          className="shrink-0"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove profile</span>
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSocialMediaProfile}
                    className="w-full bg-white text-black border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg"
                  >
                    Add Another Social Media Profile
                  </Button>
                </div>
              </div>
              {/* End Social Media Profiles */}

              {/* Portfolio Upload - Exactly 3 images required */}
              <div>
                <Label className="text-gray-900">Portfolio Images (Required: Exactly 3 images) *</Label>
                <div className="mt-2 space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-900">Upload Your Best Work</p>
                      <p className="text-gray-600">Upload exactly 3 high-quality images that showcase your skills</p>
                      <p className="text-sm text-gray-500">Accepted formats: JPG, PNG, WebP (max 10MB each)</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="portfolio-upload"
                      disabled={portfolioFiles.length >= 3}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4 bg-white text-black border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg"
                      onClick={() => document.getElementById("portfolio-upload")?.click()}
                      disabled={portfolioFiles.length >= 3}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {portfolioFiles.length === 0
                        ? "Choose Images"
                        : portfolioFiles.length < 3
                          ? `Add ${3 - portfolioFiles.length} More`
                          : "3 Images Selected"}
                    </Button>
                  </div>

                  {/* Display uploaded files */}
                  {portfolioFiles.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {portfolioFiles.map((file, index) => (
                        <div key={index} className="relative">
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                            <img
                              src={URL.createObjectURL(file) || "/placeholder.svg"}
                              alt={`Portfolio ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0 bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg"
                            onClick={() => removeFile(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <div className="mt-2 text-center">
                            <p className="text-sm font-medium text-gray-900">Image {index + 1}</p>
                            <p className="text-xs text-gray-500">{file.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Progress indicator */}
                  <div className="flex items-center justify-center space-x-2">
                    {[1, 2, 3].map((num) => (
                      <div
                        key={num}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          portfolioFiles.length >= num ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {portfolioFiles.length >= num ? <CheckCircle className="w-4 h-4" /> : num}
                      </div>
                    ))}
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
              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={loading || portfolioFiles.length !== 3}
                  className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                >
                  {loading ? "Submitting Application..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Application Requirements */}
        <Card className="mt-8 bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Application Requirements</CardTitle>
          </CardHeader>
          <CardContent className="bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-gray-900">Portfolio Requirements</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Exactly 3 high-quality images</li>
                  <li>• Images must showcase your best work</li>
                  <li>• Professional quality and composition</li>
                  <li>• Relevant to your chosen specialization</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-gray-900">Application Process</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Submit complete application</li>
                  <li>• Admin review (1-3 business days)</li>
                  <li>• Email notification of decision</li>
                  <li>• If approved, portfolio goes live</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
