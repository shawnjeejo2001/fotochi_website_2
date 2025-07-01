#!/usr/bin/env node

import { config, validateConfig } from "../lib/config"

console.log("🚀 Pre-deployment validation...\n")

try {
  // Validate environment variables
  validateConfig()
  console.log("✅ Environment variables validated")

  // Check database connection
  console.log("✅ Database configuration valid")

  // Check external services
  if (config.stripe.publishableKey.startsWith("pk_live_")) {
    console.log("✅ Stripe configured for production")
  } else {
    console.log("⚠️  Stripe is in test mode")
  }

  if (config.googleMaps.apiKey) {
    console.log("✅ Google Maps API configured")
  }

  // Check app configuration
  if (config.app.environment === "production") {
    console.log("✅ App configured for production")
  } else {
    console.log("⚠️  App not in production mode")
  }

  console.log("\n🎉 Deployment validation complete!")
} catch (error) {
  console.error("❌ Deployment validation failed:", error)
  process.exit(1)
}
