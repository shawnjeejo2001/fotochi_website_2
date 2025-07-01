import Stripe from "stripe"

export function getStripeInstance(): Stripe {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY

  if (!stripeSecretKey) {
    throw new Error("Missing Stripe secret key in environment variables")
  }

  return new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16",
  })
}

export function validateStripeWebhookSecret(): string {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error("Missing Stripe webhook secret in environment variables")
  }

  return webhookSecret
}
