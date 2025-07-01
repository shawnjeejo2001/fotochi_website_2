"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CardElement, useStripe, useElements, Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(
  "pk_test_51RUEixEOKOohovxsC3YLgdLQcAkIrsMPMWYVD2IGVHZguegNugriqWJzxGL4Ng2f5vOhanV1Ou0E1A2DrhOo6EFz00XgAv44ex",
)

interface BookingDetails {
  eventType: string
  eventDate: string
  eventTime: string
  duration: string
  location: string
  description?: string
  budget: string
  guestCount?: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  additionalRequests?: string
}

interface PaymentFormWrapperProps {
  amount: number
  photographerId: string
  bookingDetails: BookingDetails
  onSuccess?: (bookingId: string) => void
  onError?: (error: string) => void
}

export function PaymentFormWrapper(props: PaymentFormWrapperProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  )
}

function PaymentForm({ amount, photographerId, bookingDetails, onSuccess, onError }: PaymentFormWrapperProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      setErrorMessage("Stripe has not loaded yet. Please try again.")
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      console.log("Creating payment intent with:", {
        amount,
        photographerId,
        bookingDetails,
      })

      // Create payment intent on the server
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount, // amount in cents
          photographerId,
          bookingDetails,
        }),
      })

      console.log("Payment intent response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Payment intent error:", errorData)
        throw new Error(errorData.error || "Failed to create payment intent")
      }

      const { clientSecret, bookingId } = await response.json()
      console.log("Payment intent created successfully:", {
        clientSecret: clientSecret ? "exists" : "missing",
        bookingId,
      })

      if (!clientSecret) {
        throw new Error("No client secret received from server")
      }

      // Confirm the payment with the card element
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error("Card element not found")
      }

      console.log("Confirming payment...")

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: bookingDetails.clientName,
            email: bookingDetails.clientEmail,
          },
        },
      })

      console.log("Payment confirmation result:", { error, paymentIntentStatus: paymentIntent?.status })

      if (error) {
        console.error("Payment confirmation error:", error)
        throw new Error(error.message || "Payment failed")
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        console.log("Payment succeeded!")
        // Payment successful
        if (onSuccess) {
          onSuccess(bookingId)
        } else {
          // Redirect to success page
          router.push(`/booking-confirmation?bookingId=${bookingId}`)
        }
      } else {
        throw new Error(`Payment failed with status: ${paymentIntent?.status}`)
      }
    } catch (error) {
      console.error("Payment error:", error)
      const errorMsg = error instanceof Error ? error.message : "An unknown error occurred"
      setErrorMessage(errorMsg)
      if (onError) {
        onError(errorMsg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete your booking</CardTitle>
        <CardDescription>
          Your payment is secure and encrypted. You will be charged a deposit to secure your booking.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Booking Summary</h3>
              <div className="text-sm text-muted-foreground">
                <p>
                  {bookingDetails.eventType} on {bookingDetails.eventDate}
                </p>
                <p>Duration: {bookingDetails.duration}</p>
                <p>Location: {bookingDetails.location}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Payment Details</h3>
              <div className="border rounded-md p-3">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: "16px",
                        color: "#424770",
                        "::placeholder": {
                          color: "#aab7c4",
                        },
                      },
                      invalid: {
                        color: "#9e2146",
                      },
                    },
                  }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Test card: 4242 4242 4242 4242, any future expiry, any CVC
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span>Deposit Amount</span>
              <span className="font-semibold">${(amount / 100).toFixed(2)}</span>
            </div>

            {errorMessage && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md border border-red-200">
                <strong>Payment Error:</strong> {errorMessage}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={!stripe || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay Deposit $${(amount / 100).toFixed(2)}`
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
