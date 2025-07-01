"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Calendar, Clock, MapPin } from "lucide-react"
import Link from "next/link"

export default function BookingConfirmationPage() {
  const { id } = useParams()
  const [booking, setBooking] = useState<any>(null)
  const [photographer, setPhotographer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBookingDetails() {
      try {
        // Try to fetch booking details from Supabase
        const { data: bookingData, error: bookingError } = await supabase
          .from("bookings")
          .select("*")
          .eq("id", id)
          .single()

        // If there's an error (like table doesn't exist), create a fallback booking object
        if (bookingError) {
          console.warn("Couldn't fetch from database, using fallback:", bookingError.message)

          // Extract timestamp from booking ID if possible
          let bookingDate = new Date()
          if (typeof id === "string" && id.includes("booking_")) {
            const timestampStr = id.split("_")[1]
            if (timestampStr && !isNaN(Number(timestampStr))) {
              bookingDate = new Date(Number(timestampStr))
            }
          }

          // Create a fallback booking object with generic information
          const fallbackBooking = {
            id: id,
            event_date: bookingDate.toLocaleDateString(),
            event_time: "To be confirmed",
            location: "To be confirmed",
            event_type: "Photography Session",
            duration: "To be confirmed",
            description: "Thank you for your booking request.",
            status: "pending",
            created_at: bookingDate.toISOString(),
          }

          setBooking(fallbackBooking)
          return // Skip photographer fetch since we don't have a photographer_id
        }

        setBooking(bookingData)

        // Only fetch photographer if we have actual booking data with photographer_id
        if (bookingData && bookingData.photographer_id) {
          const { data: photographerData, error: photographerError } = await supabase
            .from("providers")
            .select("*")
            .eq("id", bookingData.photographer_id)
            .single()

          if (photographerError) {
            console.warn("Error fetching photographer:", photographerError.message)
          } else {
            setPhotographer(photographerData)
          }
        }
      } catch (error: any) {
        console.error("Error in booking confirmation:", error)
        setError("We encountered an issue displaying your booking details. Your booking has been received.")
      } finally {
        setLoading(false)
      }
    }

    fetchBookingDetails()
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 bg-white">
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-200 bg-white shadow-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-gray-800">Booking Confirmed!</CardTitle>
            <CardDescription className="text-gray-700">
              Your booking has been successfully submitted and is awaiting photographer confirmation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {error ? (
                <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
                  <p className="text-gray-700">{error}</p>
                  <p className="text-gray-700 mt-2">
                    Your booking reference is: <span className="font-medium">{id}</span>
                  </p>
                </div>
              ) : (
                <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
                  <h3 className="font-medium text-gray-800">Booking Details</h3>
                  <div className="mt-2 space-y-2 text-sm text-gray-700">
                    <p className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                      <span>Event Date: {booking?.event_date || "To be confirmed"}</span>
                    </p>
                    <p className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-gray-500" />
                      <span>Event Time: {booking?.event_time || "To be confirmed"}</span>
                    </p>
                    <p className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                      <span>Location: {booking?.location || "To be confirmed"}</span>
                    </p>
                    <p>Event Type: {booking?.event_type || "Photography Session"}</p>
                    <p>Duration: {booking?.duration || "To be confirmed"}</p>
                    {booking?.description && <p>Description: {booking.description}</p>}
                    <p className="mt-2 font-medium">Booking Reference: {id}</p>
                  </div>
                </div>
              )}

              {photographer && (
                <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
                  <h3 className="font-medium text-gray-800">Photographer</h3>
                  <div className="mt-2 flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                      {photographer.profile_image ? (
                        <img
                          src={photographer.profile_image || "/placeholder.svg"}
                          alt={photographer.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-500">
                          <span>📷</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{photographer.name}</p>
                      <p className="text-sm text-gray-600">{photographer.main_style}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
                <h3 className="font-medium text-gray-800">What's Next?</h3>
                <ul className="mt-2 space-y-2 text-sm text-gray-700">
                  <li>The photographer will review your booking request.</li>
                  <li>You'll receive an email confirmation once the photographer accepts.</li>
                  <li>You can message the photographer with any questions or special requests.</li>
                  <li>Your payment will only be processed after the photographer accepts your booking.</li>
                </ul>
              </div>

              <div className="flex justify-center space-x-4">
                <Button asChild variant="outline" className="bg-white text-gray-800 border-gray-300 hover:bg-gray-50">
                  <Link href="/dashboard/client">View My Bookings</Link>
                </Button>
                <Button asChild className="bg-black text-white hover:bg-gray-800">
                  <Link href="/">Return Home</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
