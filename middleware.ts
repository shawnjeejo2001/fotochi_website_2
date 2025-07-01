import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Only apply to webhook routes
  if (path.startsWith("/api/webhooks/")) {
    // For Stripe webhooks, we need to allow their requests
    if (path === "/api/webhooks/stripe") {
      // Stripe sends a specific signature header
      const stripeSignature = request.headers.get("stripe-signature")
      if (!stripeSignature) {
        return NextResponse.json({ error: "Missing stripe signature" }, { status: 401 })
      }
      // Allow the request to proceed
      return NextResponse.next()
    }
  }

  // Continue for all other requests
  return NextResponse.next()
}

export const config = {
  // Only run middleware on API routes
  matcher: "/api/:path*",
}
