"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PaymentFormWrapper } from "@/components/payment-form"
import { toast } from "sonner"
import { MapPin, Star, Camera, Clock, DollarSign, Award, CheckCircle2, X } from "lucide-react"
import { format, parseISO } from "date-fns"

// Mock photographer data - in real app, this would come from your database
const photographerData = {
  1: {
    id: 1,
    name: "John Smith",
    location: "New York, NY",
    mainStyle: "Wedding",
    additionalStyles: ["Portrait", "Event"],
    rating: 4.8,
    reviews: 120,
    basePrice: 500,
    hourlyRate: 150,
    bio: "Professional wedding photographer with over 8 years of experience capturing life's most precious moments. Specializing in candid, emotional storytelling through photography.",
    portfolioImages: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&h=400&fit=crop",
    ],
    equipment: ["Canon EOS R5", "Sony A7R IV", "Professional Lighting Kit"],
    experience: "8+ years",
    responseTime: "Within 2 hours",
    languages: ["English", "Spanish"],
    certifications: ["Professional Photographers of America", "Wedding Photography Certification"],
  },
  2: {
    id: 2,
    name: "Emily Johnson",
    location: "Los Angeles, CA",
    mainStyle: "Portrait",
    additionalStyles: ["Street", "Event"],
    rating: 4.9,
    reviews: 150,
    basePrice: 600,
    hourlyRate: 180,
    bio: "Creative portrait photographer passionate about capturing authentic personalities and emotions. Known for artistic composition and natural lighting techniques.",
    portfolioImages: [
      "https://images.unsplash.com/photo-1494790108755-2616c9c0e8e5?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=400&fit=crop",
    ],
    equipment: ["Nikon D850", "Canon 5D Mark IV", "Studio Lighting"],
    experience: "6+ years",
    responseTime: "Within 1 hour",
    languages: ["English"],
    certifications: ["Portrait Photography Master", "Adobe Certified Expert"],
  },
}

export default function BookPhotographerPage() {
  const { id } = useParams()
  const router = useRouter()
  const [photographer, setPhotographer] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [showPayment, setShowPayment] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    eventType: "",
    eventDate: "",
    eventTime: "",
    duration: "",
    location: "",
    description: "",
    budget: "",
    guestCount: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    additionalRequests: "",
  })

  useEffect(() => {
    // Get photographer data
    const photographerInfo = photographerData[id as keyof typeof photographerData]
    if (photographerInfo) {
      setPhotographer(photographerInfo)
    } else {
      toast.error("Photographer not found")
      router.push("/photographers")
    }
  }, [id, router])

  // Close calendar when changing steps
  useEffect(() => {
    setCalendarOpen(false)
  }, [currentStep])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      setFormData((prev) => ({ ...prev, eventDate: format(date, "yyyy-MM-dd") }))
      setCalendarOpen(false) // Close calendar after selection
    }
  }

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputDate = e.target.value
    if (inputDate) {
      // Use parseISO to correctly parse the date string
      const date = parseISO(inputDate)
      setSelectedDate(date)
      setFormData((prev) => ({ ...prev, eventDate: inputDate }))
    } else {
      setSelectedDate(undefined)
      setFormData((prev) => ({ ...prev, eventDate: "" }))
    }
  }

  const clearSelectedDate = () => {
    setSelectedDate(undefined)
    setFormData((prev) => ({ ...prev, eventDate: "" }))
  }

  const calculateEstimate = () => {
    if (!photographer || !formData.duration) return 0

    const hours = Number.parseInt(formData.duration.split("-")[0]) || 1
    return photographer.hourlyRate * hours
  }

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate step 1
      if (
        !formData.eventType ||
        !formData.eventDate ||
        !formData.eventTime ||
        !formData.duration ||
        !formData.location
      ) {
        toast.error("Please fill in all required fields")
        return
      }
    } else if (currentStep === 2) {
      // Validate step 2
      if (!formData.clientName || !formData.clientEmail) {
        toast.error("Please fill in your contact information")
        return
      }
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowPayment(true)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePaymentSuccess = (bookingId: string) => {
    toast.success("Booking confirmed! Redirecting to confirmation page...")
    setTimeout(() => {
      router.push(`/booking-confirmation/${bookingId}`)
    }, 2000)
  }

  const handlePaymentError = (error: string) => {
    toast.error(`Payment failed: ${error}`)
    setShowPayment(false)
  }

  if (!photographer) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (showPayment) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
              <p className="text-gray-600">Secure your session with {photographer.name}</p>
            </div>

            <PaymentFormWrapper
              amount={Math.round(calculateEstimate() * 0.3 * 100)} // 30% deposit in cents
              photographerId={photographer.id.toString()}
              bookingDetails={formData}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />

            <div className="text-center mt-6">
              <Button
                onClick={() => setShowPayment(false)}
                variant="outline"
                className="text-gray-700 hover:text-gray-900 bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg"
              >
                Back to Booking Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Format date for display
  const formatDisplayDate = () => {
    try {
      if (selectedDate) {
        return format(selectedDate, "EEEE, MMMM do, yyyy")
      } else if (formData.eventDate) {
        return format(parseISO(formData.eventDate), "EEEE, MMMM do, yyyy")
      }
      return "Not selected"
    } catch (error) {
      return formData.eventDate || "Not selected"
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Add this style override at the beginning of the return statement */}
      <style jsx>{`
        .rdp {
          display: none !important;
        }
        [data-radix-popper-content-wrapper] {
          display: none !important;
        }
      `}</style>
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="outline"
            onClick={() => router.push("/photographers")}
            className="mb-4 text-black border-2 border-gray-300 bg-white hover:bg-gray-50 hover:text-black hover:border-gray-400 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            ← Back to Photographers
          </Button>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Photographer Info */}
            <div className="lg:w-1/3">
              <Card className="sticky top-6 bg-white">
                <CardHeader className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200">
                    <img
                      src={photographer.portfolioImages[0] || "/placeholder.svg"}
                      alt={photographer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-2xl text-black">{photographer.name}</CardTitle>
                  <div className="flex items-center justify-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4" />
                    {photographer.location}
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-black">{photographer.rating}</span>
                    <span className="text-gray-700">({photographer.reviews} reviews)</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-black">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="default" className="flex items-center gap-1 bg-black text-white">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {photographer.mainStyle}
                      </Badge>
                      {photographer.additionalStyles.map((style: string, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-gray-200 text-black">
                          {style}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span className="text-black">Responds {photographer.responseTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-gray-600" />
                      <span className="text-black">{photographer.experience} experience</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-600" />
                      <span className="text-black">Starting at ${photographer.basePrice}</span>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2 text-black">About</h4>
                    <p className="text-sm text-gray-700">{photographer.bio}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Form */}
            <div className="lg:w-2/3">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-black">
                    <Camera className="w-5 h-5" />
                    Book {photographer.name}
                  </CardTitle>
                  <CardDescription className="text-gray-700">
                    Step {currentStep} of 3:{" "}
                    {currentStep === 1
                      ? "Event Details"
                      : currentStep === 2
                        ? "Contact Information"
                        : "Review & Confirm"}
                  </CardDescription>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <div
                      className="bg-black h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(currentStep / 3) * 100}%` }}
                    ></div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Step 1: Event Details */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="eventType" className="text-black">
                            Event Type *
                          </Label>
                          <div className="relative">
                            <select
                              id="eventType"
                              className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-black"
                              value={formData.eventType}
                              onChange={(e) => handleInputChange("eventType", e.target.value)}
                            >
                              <option value="" disabled>
                                Select event type
                              </option>
                              <option value="wedding">Wedding</option>
                              <option value="portrait">Portrait Session</option>
                              <option value="event">Event Photography</option>
                              <option value="corporate">Corporate Event</option>
                              <option value="family">Family Photos</option>
                              <option value="engagement">Engagement</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="duration" className="text-black">
                            Duration *
                          </Label>
                          <div className="relative">
                            <select
                              id="duration"
                              className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-black"
                              value={formData.duration}
                              onChange={(e) => handleInputChange("duration", e.target.value)}
                            >
                              <option value="" disabled>
                                Select duration
                              </option>
                              <option value="1-hour">1 Hour</option>
                              <option value="2-hours">2 Hours</option>
                              <option value="3-hours">3 Hours</option>
                              <option value="4-hours">4 Hours</option>
                              <option value="6-hours">6 Hours</option>
                              <option value="8-hours">8 Hours</option>
                              <option value="full-day">Full Day</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="eventDate" className="text-black">
                            Event Date *
                          </Label>
                          {selectedDate ? (
                            <div className="flex items-center mt-1">
                              <div className="flex-grow p-2 bg-white border border-gray-300 rounded-md text-black">
                                {format(selectedDate, "EEEE, MMMM do, yyyy")}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={clearSelectedDate}
                                className="ml-2"
                                title="Clear date"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Input
                              type="date"
                              id="eventDate"
                              className="mt-1 bg-white border-gray-300 text-black"
                              value={formData.eventDate}
                              onChange={handleDateInputChange}
                            />
                          )}
                        </div>

                        <div>
                          <Label htmlFor="eventTime" className="text-black">
                            Event Time *
                          </Label>
                          <Input
                            type="time"
                            className="bg-white border-gray-300 text-black"
                            value={formData.eventTime}
                            onChange={(e) => handleInputChange("eventTime", e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="location" className="text-black">
                          Event Location *
                        </Label>
                        <Input
                          placeholder="Enter the event address or venue"
                          className="bg-white border-gray-300 text-black placeholder-gray-500"
                          value={formData.location}
                          onChange={(e) => handleInputChange("location", e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="guestCount" className="text-black">
                          Expected Guest Count
                        </Label>
                        <div className="relative">
                          <select
                            id="guestCount"
                            className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-black"
                            value={formData.guestCount}
                            onChange={(e) => handleInputChange("guestCount", e.target.value)}
                          >
                            <option value="" disabled>
                              Select guest count
                            </option>
                            <option value="1-10">1-10 people</option>
                            <option value="11-25">11-25 people</option>
                            <option value="26-50">26-50 people</option>
                            <option value="51-100">51-100 people</option>
                            <option value="101-200">101-200 people</option>
                            <option value="200+">200+ people</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-black">
                          Event Description
                        </Label>
                        <Textarea
                          placeholder="Tell us more about your event, style preferences, or special requirements..."
                          className="bg-white border-gray-300 text-black placeholder-gray-500"
                          value={formData.description}
                          onChange={(e) => handleInputChange("description", e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Contact Information */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="clientName" className="text-black">
                            Full Name *
                          </Label>
                          <Input
                            placeholder="Your full name"
                            className="bg-white border-gray-300 text-black placeholder-gray-500"
                            value={formData.clientName}
                            onChange={(e) => handleInputChange("clientName", e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="clientEmail" className="text-black">
                            Email Address *
                          </Label>
                          <Input
                            type="email"
                            placeholder="your.email@example.com"
                            className="bg-white border-gray-300 text-black placeholder-gray-500"
                            value={formData.clientEmail}
                            onChange={(e) => handleInputChange("clientEmail", e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="clientPhone" className="text-black">
                          Phone Number
                        </Label>
                        <Input
                          type="tel"
                          placeholder="(555) 123-4567"
                          className="bg-white border-gray-300 text-black placeholder-gray-500"
                          value={formData.clientPhone}
                          onChange={(e) => handleInputChange("clientPhone", e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="budget" className="text-black">
                          Budget Range
                        </Label>
                        <div className="relative">
                          <select
                            id="budget"
                            className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-black"
                            value={formData.budget}
                            onChange={(e) => handleInputChange("budget", e.target.value)}
                          >
                            <option value="" disabled>
                              Select your budget range
                            </option>
                            <option value="under-500">Under $500</option>
                            <option value="500-1000">$500 - $1,000</option>
                            <option value="1000-2000">$1,000 - $2,000</option>
                            <option value="2000-5000">$2,000 - $5,000</option>
                            <option value="5000+">$5,000+</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="additionalRequests" className="text-black">
                          Additional Requests
                        </Label>
                        <Textarea
                          placeholder="Any special requests, specific shots you want, or other details..."
                          className="bg-white border-gray-300 text-black placeholder-gray-500"
                          value={formData.additionalRequests}
                          onChange={(e) => handleInputChange("additionalRequests", e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Review & Confirm */}
                  {currentStep === 3 && (
                    <div className="space-y-6 relative z-10">
                      {/* Event Summary */}
                      <div className="bg-white border border-gray-300 rounded-lg p-6 relative z-20">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-black">
                          <span className="w-5 h-5 text-black">📅</span>
                          Event Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                                Event Type
                              </span>
                              <p className="text-lg font-semibold capitalize mt-1 text-black">{formData.eventType}</p>
                            </div>

                            <div>
                              <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">Date</span>
                              <p className="text-lg font-semibold mt-1 text-black">{formatDisplayDate()}</p>
                            </div>

                            <div>
                              <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">Time</span>
                              <p className="text-lg font-semibold mt-1 text-black">{formData.eventTime}</p>
                            </div>

                            <div>
                              <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                                Duration
                              </span>
                              <p className="text-lg font-semibold mt-1 text-black">
                                {formData.duration.replace("-", " ")}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                                Location
                              </span>
                              <p className="text-lg font-semibold mt-1 text-black">{formData.location}</p>
                            </div>

                            {formData.guestCount && (
                              <div>
                                <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                                  Expected Guests
                                </span>
                                <p className="text-lg font-semibold mt-1 text-black">{formData.guestCount}</p>
                              </div>
                            )}

                            {formData.budget && (
                              <div>
                                <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                                  Your Budget Range
                                </span>
                                <p className="text-lg font-semibold mt-1 text-black">{formData.budget}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {formData.description && (
                          <div className="mt-6 pt-6 border-t">
                            <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                              Event Description
                            </span>
                            <p className="text-base mt-2 leading-relaxed text-black">{formData.description}</p>
                          </div>
                        )}
                      </div>

                      {/* Contact Information */}
                      <div className="bg-white border border-gray-300 rounded-lg p-6 relative z-20">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-black">
                          <span className="w-5 h-5 text-black">👤</span>
                          Your Contact Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">Full Name</span>
                            <p className="text-lg font-semibold mt-1 text-black">{formData.clientName}</p>
                          </div>

                          <div>
                            <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                              Email Address
                            </span>
                            <p className="text-lg font-semibold mt-1 text-black">{formData.clientEmail}</p>
                          </div>

                          {formData.clientPhone && (
                            <div>
                              <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                                Phone Number
                              </span>
                              <p className="text-lg font-semibold mt-1 text-black">{formData.clientPhone}</p>
                            </div>
                          )}
                        </div>

                        {formData.additionalRequests && (
                          <div className="mt-6 pt-6 border-t">
                            <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                              Special Requests
                            </span>
                            <p className="text-base mt-2 leading-relaxed text-black">{formData.additionalRequests}</p>
                          </div>
                        )}
                      </div>

                      {/* Pricing Breakdown */}
                      <div className="bg-white border border-gray-300 rounded-lg p-6 relative z-20">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-black">
                          <DollarSign className="w-5 h-5" />
                          Pricing Breakdown
                        </h3>

                        <div className="space-y-4">
                          {/* Hourly Rate Calculation */}
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-black font-medium">Photographer's Hourly Rate</span>
                              <span className="font-semibold text-black">${photographer.hourlyRate}/hour</span>
                            </div>

                            <div className="flex justify-between items-center mb-3">
                              <span className="text-black font-medium">Session Duration</span>
                              <span className="font-semibold text-black">
                                {Number.parseInt(formData.duration.split("-")[0]) || 1} hour
                                {Number.parseInt(formData.duration.split("-")[0]) > 1 ? "s" : ""}
                              </span>
                            </div>

                            <div className="border-t pt-3">
                              <div className="flex justify-between items-center text-lg">
                                <span className="font-semibold text-black">Total Session Cost</span>
                                <span className="font-bold text-black">
                                  ${photographer.hourlyRate * (Number.parseInt(formData.duration.split("-")[0]) || 1)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Payment Breakdown */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                              <div className="text-center">
                                <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                                  Deposit Required Today
                                </span>
                                <p className="text-3xl font-bold text-black mt-2">
                                  $
                                  {Math.round(
                                    photographer.hourlyRate *
                                      (Number.parseInt(formData.duration.split("-")[0]) || 1) *
                                      0.3,
                                  )}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">30% to secure booking</p>
                              </div>
                            </div>

                            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                              <div className="text-center">
                                <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                                  Remaining Balance
                                </span>
                                <p className="text-3xl font-bold text-black mt-2">
                                  $
                                  {photographer.hourlyRate * (Number.parseInt(formData.duration.split("-")[0]) || 1) -
                                    Math.round(
                                      photographer.hourlyRate *
                                        (Number.parseInt(formData.duration.split("-")[0]) || 1) *
                                        0.3,
                                    )}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">Due on event day</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* What Happens Next */}
                      <div className="bg-white border border-gray-300 rounded-lg p-6 relative z-20">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-black">
                          <CheckCircle2 className="w-5 h-5" />
                          What Happens Next?
                        </h3>

                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                              1
                            </div>
                            <div>
                              <p className="font-semibold text-black">Pay Deposit & Secure Your Date</p>
                              <p className="text-sm text-gray-700 mt-1">
                                Pay $
                                {Math.round(
                                  photographer.hourlyRate *
                                    (Number.parseInt(formData.duration.split("-")[0]) || 1) *
                                    0.3,
                                )}{" "}
                                now to reserve your date with {photographer.name}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                              2
                            </div>
                            <div>
                              <p className="font-semibold text-black">Photographer Confirmation</p>
                              <p className="text-sm text-gray-700 mt-1">
                                {photographer.name} will review your booking and confirm availability within{" "}
                                {photographer.responseTime.toLowerCase()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                              3
                            </div>
                            <div>
                              <p className="font-semibold text-black">Pre-Event Planning</p>
                              <p className="text-sm text-gray-700 mt-1">
                                Discuss shot list, timeline, and any special requirements via our messaging system
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                              4
                            </div>
                            <div>
                              <p className="font-semibold text-black">Event Day</p>
                              <p className="text-sm text-gray-700 mt-1">
                                Pay remaining $
                                {photographer.hourlyRate * (Number.parseInt(formData.duration.split("-")[0]) || 1) -
                                  Math.round(
                                    photographer.hourlyRate *
                                      (Number.parseInt(formData.duration.split("-")[0]) || 1) *
                                      0.3,
                                  )}{" "}
                                and enjoy your {Number.parseInt(formData.duration.split("-")[0]) || 1}-hour photography
                                session
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Important Notes */}
                      <div className="bg-white border border-gray-300 rounded-lg p-4 relative z-20">
                        <h4 className="font-semibold text-black mb-3">📋 Important Information:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                          <ul className="space-y-2">
                            <li>• Deposit is fully refundable if photographer cancels</li>
                            <li>• Travel fees may apply for locations over 25 miles</li>
                            <li>• Raw photos delivered within 48 hours</li>
                          </ul>
                          <ul className="space-y-2">
                            <li>• Edited photos delivered within 1-2 weeks</li>
                            <li>• Cancellation policy details in confirmation email</li>
                            <li>• Direct messaging available after booking</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={handlePrevStep}
                      disabled={currentStep === 1}
                      className="border-2 border-gray-300 text-black bg-white hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg"
                    >
                      Previous
                    </Button>

                    <Button
                      onClick={handleNextStep}
                      className="bg-black hover:bg-gray-800 text-white shadow-md hover:shadow-lg"
                    >
                      {currentStep === 3 ? "Proceed to Payment" : "Next"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
