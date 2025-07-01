import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "Webhook endpoint is accessible",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  console.log("Test webhook received:", body)

  return NextResponse.json({
    message: "Test webhook received successfully",
    received: body,
    timestamp: new Date().toISOString(),
  })
}
