import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    console.log("Stripe webhook received")

    // Get environment variables and validate them
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables for webhook")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Initialize Stripe inside the function
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    })

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      console.error("Missing Stripe signature")
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      console.log("Webhook signature verified successfully")
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    console.log("Processing webhook event:", event.type)

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log("Payment succeeded:", paymentIntent.id)

        // Update booking status in database
        try {
          const { error: updateError } = await supabase
            .from("bookings")
            .update({
              status: "confirmed",
              payment_intent_id: paymentIntent.id,
              updated_at: new Date().toISOString(),
            })
            .eq("payment_intent_id", paymentIntent.id)

          if (updateError) {
            console.error("Error updating booking:", updateError)
          } else {
            console.log("Booking status updated successfully")
          }
        } catch (dbError) {
          console.error("Database error:", dbError)
        }
        break

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object as Stripe.PaymentIntent
        console.log("Payment failed:", failedPayment.id)

        // Update booking status to failed
        try {
          const { error: updateError } = await supabase
            .from("bookings")
            .update({
              status: "payment_failed",
              updated_at: new Date().toISOString(),
            })
            .eq("payment_intent_id", failedPayment.id)

          if (updateError) {
            console.error("Error updating failed booking:", updateError)
          }
        } catch (dbError) {
          console.error("Database error:", dbError)
        }
        break

      case "payment_intent.canceled":
        const canceledPayment = event.data.object as Stripe.PaymentIntent
        console.log("Payment canceled:", canceledPayment.id)

        // Update booking status to canceled
        try {
          const { error: updateError } = await supabase
            .from("bookings")
            .update({
              status: "canceled",
              updated_at: new Date().toISOString(),
            })
            .eq("payment_intent_id", canceledPayment.id)

          if (updateError) {
            console.error("Error updating canceled booking:", updateError)
          }
        } catch (dbError) {
          console.error("Database error:", dbError)
        }
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      {
        error: "Webhook handler failed",
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
