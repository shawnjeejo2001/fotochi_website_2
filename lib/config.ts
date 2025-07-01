// Environment configuration with validation
export const config = {
  // Database
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },

  // Stripe
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    // Don't access secretKey in client components
    secretKey: typeof window === "undefined" ? process.env.STRIPE_SECRET_KEY! : "",
    webhookSecret: typeof window === "undefined" ? process.env.STRIPE_WEBHOOK_SECRET! : "",
  },

  // Google Maps - separate client and server keys
  googleMaps: {
    // Client-side key (safe to expose)
    clientApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    // Server-side key (never exposed to client)
    serverApiKey: typeof window === "undefined" ? process.env.GOOGLE_MAPS_SERVER_API_KEY! : "",
  },

  // App
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || "https://fotorra.com",
    environment: process.env.NODE_ENV || "production",
  },

  // Monitoring
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN,
    logLevel: process.env.LOG_LEVEL || "info",
  },
}

// Validate required environment variables
export function validateConfig() {
  // Only run on server
  if (typeof window !== "undefined") return

  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
    "GOOGLE_MAPS_SERVER_API_KEY",
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }
}

// Call validation in development
if (process.env.NODE_ENV === "development" && typeof window === "undefined") {
  try {
    validateConfig()
  } catch (error) {
    console.warn("Environment validation warning:", error)
  }
}
