import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(
  "sk_test_51RUEixEOKOohovxsI3isGqvaon43mmhrMsTeB3Snbg9mcahSvSMVUVVPzPq1MXxRADq3VxsTkr0UUSTjETNt4ucU00CrLQW6qZ",
  {
    apiVersion: "2023-10-16",
  },
)

// Get all payments for a customer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerEmail = searchParams.get("email")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (!customerEmail) {
      return NextResponse.json({ error: "Customer email is required" }, { status: 400 })
    }

    // Search for payment intents by customer email
    const paymentIntents = await stripe.paymentIntents.list({
      limit: limit,
    })

    // Filter by customer email in metadata
    const customerPayments = paymentIntents.data.filter((pi) => pi.metadata.clientEmail === customerEmail)

    const payments = customerPayments.map((pi) => ({
      id: pi.id,
      amount: pi.amount,
      currency: pi.currency,
      status: pi.status,
      created: pi.created,
      metadata: pi.metadata,
    }))

    return NextResponse.json({ payments })
  } catch (error) {
    console.error("Error retrieving payments:", error)
    return NextResponse.json({ error: "Failed to retrieve payments" }, { status: 500 })
  }
}

// Refund a payment
export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, amount, reason } = await request.json()

    if (!paymentIntentId) {
      return NextResponse.json({ error: "Payment Intent ID is required" }, { status: 400 })
    }

    // Create a refund
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount, // Optional: partial refund amount in cents
      reason: reason || "requested_by_customer",
    })

    return NextResponse.json({
      refund: {
        id: refund.id,
        amount: refund.amount,
        status: refund.status,
        reason: refund.reason,
      },
    })
  } catch (error) {
    console.error("Error creating refund:", error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: `Stripe error: ${error.message}` }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to create refund" }, { status: 500 })
  }
}
