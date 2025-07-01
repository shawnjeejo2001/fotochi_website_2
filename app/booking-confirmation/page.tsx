"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ArrowLeft, Calendar, MapPin, Clock } from "lucide-react"

interface BookingDetails {
  photographerName: string
  eventType: string
  eventDate: string
  eventTime: string
  location: string
  clientName: string
  clientEmail: string
  bookingId: string | null
}

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null)

  // Fix: Extract params once on mount without dependencies
  useEffect(() => {
    const details: BookingDetails = {
      photographerName: searchParams.get("photographerName") || "Photographer",
      eventType: searchParams.get("eventType") || "Event",
      eventDate: searchParams.get("eventDate") || "Not specified",
      eventTime: searchParams.get("eventTime") || "Not specified",
      location: searchParams.get("location") || "Not specified",
      clientName: searchParams.get("clientName") || "Client",
      clientEmail: searchParams.get("clientEmail") || "",
      bookingId: searchParams.get("bookingId") || null,
    }

    setBookingDetails(details)
  }, []) // Empty dependency array - only run once on mount

  if (!bookingDetails) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => router.push("/")} className="mb-8 flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Home
        </Button>

        <Card className="border-green-200 shadow-lg">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-center text-2xl">Booking Request Submitted!</CardTitle>
            <CardDescription className="text-center text-base">
              {bookingDetails.bookingId
                ? `Your payment has been processed and booking is confirmed with ${bookingDetails.photographerName}`
                : `Your booking request has been sent to ${bookingDetails.photographerName}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg mb-2">Booking Details</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium mr-2">Event Type:</span> {bookingDetails.eventType}
                  </p>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium mr-2">Date:</span> {bookingDetails.eventDate}
                  </p>
                  <p className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium mr-2">Time:</span> {bookingDetails.eventTime}
                  </p>
                  <p className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium mr-2">Location:</span> {bookingDetails.location}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">What happens next?</h3>
                {bookingDetails.bookingId ? (
                  <ol className="list-decimal list-inside space-y-2 text-sm pl-2">
                    <li>Your booking is confirmed and payment has been processed</li>
                    <li>You'll receive a confirmation email at {bookingDetails.clientEmail}</li>
                    <li>{bookingDetails.photographerName} will contact you within 24 hours to discuss details</li>
                    <li>You can communicate directly with the photographer to finalize arrangements</li>
                  </ol>
                ) : (
                  <ol className="list-decimal list-inside space-y-2 text-sm pl-2">
                    <li>{bookingDetails.photographerName} will review your booking request</li>
                    <li>You'll receive an email at {bookingDetails.clientEmail} with their response</li>
                    <li>
                      Once confirmed, you'll be able to communicate directly with the photographer to discuss details
                    </li>
                  </ol>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button className="w-full" onClick={() => router.push("/")}>
              Return to Home
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push("/photographers")}>
              Browse More Photographers
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
