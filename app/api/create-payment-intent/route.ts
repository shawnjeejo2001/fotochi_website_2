import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(request: Request) {
  try {
    console.log("Payment intent API called")

    // Initialize Stripe inside the function to avoid build-time issues
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    if (!stripeSecretKey) {
      console.error("Missing Stripe secret key in environment variables")
      return NextResponse.json({ error: "Server configuration error: Missing Stripe credentials" }, { status: 500 })
    }

    // Initialize Stripe with the validated key
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    })

    const body = await request.json()
    console.log("Request body:", body)

    const { amount, photographerId, bookingDetails } = body

    // Validate the request
    if (!amount || amount < 100) {
      console.error("Invalid amount:", amount)
      return NextResponse.json({ error: "Amount must be at least $1.00" }, { status: 400 })
    }

    if (!photographerId) {
      console.error("Missing photographer ID")
      return NextResponse.json({ error: "Photographer ID is required" }, { status: 400 })
    }

    if (!bookingDetails) {
      console.error("Missing booking details")
      return NextResponse.json({ error: "Booking details are required" }, { status: 400 })
    }

    console.log("Creating Stripe payment intent...")

    // Calculate platform fee (10%)
    const platformFee = Math.round(amount * 0.1)
    const photographerAmount = amount - platformFee

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        photographerId: photographerId.toString(),
        platformFee: platformFee.toString(),
        photographerAmount: photographerAmount.toString(),
        bookingType: bookingDetails.eventType || "photography",
        bookingDate: bookingDetails.eventDate || "",
        clientName: bookingDetails.clientName || "",
        clientEmail: bookingDetails.clientEmail || "",
        environment: process.env.NODE_ENV || "production",
      },
    })

    console.log("Payment intent created:", paymentIntent.id)

    // Generate a booking ID for tracking
    const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    console.log("Returning response with booking ID:", bookingId)

    // Return the client secret to the client
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      bookingId: bookingId,
    })
  } catch (error) {
    console.error("Error creating payment intent:", error)

    // More detailed error handling
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          error: `Stripe error: ${error.message}`,
          type: error.type,
          code: error.code,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to create payment intent",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : "Internal server error",
      },
      { status: 500 },
    )
  }
}
