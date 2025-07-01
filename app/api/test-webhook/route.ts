import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const { eventType, paymentIntentId, bookingId } = await request.json()

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log(`Testing webhook event: ${eventType}`)

    // Simulate different webhook events
    switch (eventType) {
      case "payment_intent.succeeded":
        console.log("Simulating payment success for:", paymentIntentId)

        if (bookingId) {
          const { error } = await supabase
            .from("bookings")
            .update({
              status: "confirmed",
              payment_intent_id: paymentIntentId,
              updated_at: new Date().toISOString(),
            })
            .eq("id", bookingId)

          if (error) {
            console.error("Error updating booking:", error)
            return NextResponse.json({ error: "Database update failed" }, { status: 500 })
          }
        }
        break

      case "payment_intent.payment_failed":
        console.log("Simulating payment failure for:", paymentIntentId)

        if (bookingId) {
          const { error } = await supabase
            .from("bookings")
            .update({
              status: "payment_failed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", bookingId)

          if (error) {
            console.error("Error updating booking:", error)
            return NextResponse.json({ error: "Database update failed" }, { status: 500 })
          }
        }
        break

      case "payment_intent.canceled":
        console.log("Simulating payment cancellation for:", paymentIntentId)

        if (bookingId) {
          const { error } = await supabase
            .from("bookings")
            .update({
              status: "canceled",
              updated_at: new Date().toISOString(),
            })
            .eq("id", bookingId)

          if (error) {
            console.error("Error updating booking:", error)
            return NextResponse.json({ error: "Database update failed" }, { status: 500 })
          }
        }
        break

      default:
        return NextResponse.json({ error: "Unknown event type" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${eventType} event`,
      paymentIntentId,
      bookingId,
    })
  } catch (error) {
    console.error("Test webhook error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
