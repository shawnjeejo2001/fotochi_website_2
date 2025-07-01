"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function TestWebhooksPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<string>("")
  const [eventType, setEventType] = useState("payment_intent.succeeded")
  const [paymentIntentId, setPaymentIntentId] = useState("pi_test_" + Math.random().toString(36).substr(2, 9))
  const [bookingId, setBookingId] = useState("")

  const testWebhook = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventType,
          paymentIntentId,
          bookingId: bookingId || undefined,
        }),
      })

      const data = await response.json()
      setResults(JSON.stringify(data, null, 2))
    } catch (error) {
      setResults(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const testStripeConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-stripe")
      const data = await response.json()
      setResults(JSON.stringify(data, null, 2))
    } catch (error) {
      setResults(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const testRealStripeWebhook = async () => {
    setLoading(true)
    setResults("Go to your Stripe Dashboard → Developers → Webhooks → Select your webhook → Send test webhook")
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Webhook Testing Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Test Stripe Connection */}
        <Card>
          <CardHeader>
            <CardTitle>Test Stripe Connection</CardTitle>
            <CardDescription>Test if Stripe API is working correctly</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testStripeConnection} disabled={loading} className="w-full">
              Test Stripe API
            </Button>
          </CardContent>
        </Card>

        {/* Test Webhook Simulation */}
        <Card>
          <CardHeader>
            <CardTitle>Test Webhook Simulation</CardTitle>
            <CardDescription>Simulate webhook events without real payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="eventType">Event Type</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment_intent.succeeded">Payment Succeeded</SelectItem>
                  <SelectItem value="payment_intent.payment_failed">Payment Failed</SelectItem>
                  <SelectItem value="payment_intent.canceled">Payment Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="paymentIntentId">Payment Intent ID</Label>
              <Input
                id="paymentIntentId"
                value={paymentIntentId}
                onChange={(e) => setPaymentIntentId(e.target.value)}
                placeholder="pi_test_..."
              />
            </div>

            <div>
              <Label htmlFor="bookingId">Booking ID (Optional)</Label>
              <Input
                id="bookingId"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="Enter booking UUID to test database updates"
              />
            </div>

            <Button onClick={testWebhook} disabled={loading} className="w-full">
              Simulate Webhook Event
            </Button>
          </CardContent>
        </Card>

        {/* Test Real Stripe Webhook */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Test Real Stripe Webhook</CardTitle>
            <CardDescription>Instructions for testing with Stripe Dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Steps to test real webhook:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>
                  Go to{" "}
                  <a
                    href="https://dashboard.stripe.com/test/webhooks"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Stripe Dashboard → Webhooks
                  </a>
                </li>
                <li>
                  Find your webhook endpoint:{" "}
                  <code className="bg-gray-200 px-1 rounded">https://fotorra.com/api/webhooks/stripe</code>
                </li>
                <li>Click on the webhook</li>
                <li>Click "Send test webhook"</li>
                <li>Select an event type (e.g., payment_intent.succeeded)</li>
                <li>Click "Send test webhook"</li>
                <li>Check your application logs for the webhook receipt</li>
              </ol>
            </div>
            <Button onClick={testRealStripeWebhook} disabled={loading} className="w-full">
              Show Stripe Dashboard Instructions
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={results}
              readOnly
              placeholder="Test results will appear here..."
              className="min-h-[200px] font-mono text-sm"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
