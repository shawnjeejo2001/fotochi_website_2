import Stripe from "stripe"
import { createServerSupabaseClient } from "./supabase"

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function createPaymentIntent({
  amount,
  bookingId,
  photographerId,
  clientId,
  description,
}: {
  amount: number
  bookingId: string
  photographerId: string
  clientId: string
  description: string
}) {
  try {
    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      // Store booking information in metadata
      metadata: {
        bookingId,
        photographerId,
        clientId,
        description,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    // Update the booking with the payment intent ID
    const supabase = createServerSupabaseClient()
    await supabase
      .from("bookings")
      .update({
        payment_intent_id: paymentIntent.id,
        amount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)

    // Return the client secret for the frontend
    return {
      clientSecret: paymentIntent.client_secret,
    }
  } catch (error) {
    console.error("Error creating payment intent:", error)
    throw error
  }
}
