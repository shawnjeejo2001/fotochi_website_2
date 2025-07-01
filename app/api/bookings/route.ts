import { NextResponse } from "next/server"

// Simple in-memory storage for demo purposes
// In production, you'd use a proper database
const bookings: any[] = []

export async function POST(request: Request) {
  try {
    const bookingData = await request.json()

    const booking = {
      id: `booking_${Date.now()}`,
      ...bookingData,
      createdAt: new Date().toISOString(),
      status: "pending",
    }

    bookings.push(booking)

    return NextResponse.json({ booking })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ bookings })
}
