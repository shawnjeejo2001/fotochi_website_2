import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(
  "sk_test_51RUEixEOKOohovxsI3isGqvaon43mmhrMsTeB3Snbg9mcahSvSMVUVVPzPq1MXxRADq3VxsTkr0UUSTjETNt4ucU00CrLQW6qZ",
  {
    apiVersion: "2023-10-16",
  },
)

export async function GET() {
  try {
    // Test creating a simple payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000, // $10.00
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      message: "Stripe is working correctly!",
    })
  } catch (error) {
    console.error("Stripe test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Stripe test failed",
      },
      { status: 500 },
    )
  }
}
