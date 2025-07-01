import { config } from "./config"

// Basic analytics tracking
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (config.app.environment === "production") {
    // In production, send to analytics service
    console.log("Analytics Event:", eventName, properties)

    // Example: Send to Google Analytics, Mixpanel, etc.
    if (typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("event", eventName, properties)
    }
  } else {
    console.log("Dev Analytics Event:", eventName, properties)
  }
}

// Performance monitoring
export function trackPerformance(metricName: string, value: number) {
  if (config.app.environment === "production") {
    console.log("Performance Metric:", metricName, value)

    // Send to monitoring service
    if (typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("event", "timing_complete", {
        name: metricName,
        value: value,
      })
    }
  }
}

// Error tracking
export function trackError(error: Error, context?: Record<string, any>) {
  console.error("Tracked Error:", error.message, context)

  if (config.app.environment === "production") {
    // Send to error tracking service like Sentry
    if (config.monitoring.sentryDsn) {
      // TODO: Initialize and use Sentry
    }
  }
}
