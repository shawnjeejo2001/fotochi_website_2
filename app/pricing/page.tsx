"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Camera } from "lucide-react"

export default function PricingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <button
              onClick={() => router.push("/")}
              className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              Fotorra
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600">No hidden fees. Pay only when you book.</p>
        </div>

        {/* For Clients */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">For Clients</h2>
          <Card className="max-w-2xl mx-auto bg-white">
            <CardContent className="p-8 text-center">
              <Camera className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Free to Browse & Connect</h3>
              <p className="text-gray-600 mb-6">
                Search photographers, view portfolios, and send booking requests at no cost. You only pay the
                photographer directly for their services.
              </p>
              <div className="space-y-2 text-left max-w-md mx-auto">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Unlimited searches and browsing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Send unlimited booking requests</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Secure payment processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Customer support</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* For Providers */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">For Photographers & Videographers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <Card className="bg-white">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Starter</CardTitle>
                <div className="text-3xl font-bold">Free</div>
                <p className="text-gray-600">Perfect for getting started</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Basic profile listing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Up to 10 portfolio images</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Client messaging</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">5% service fee per booking</span>
                  </li>
                </ul>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                  onClick={() => router.push("/join-provider")}
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="border-blue-500 border-2 bg-white">
              <CardHeader className="text-center">
                <Badge className="mb-2 bg-blue-500">Most Popular</Badge>
                <CardTitle className="text-xl">Professional</CardTitle>
                <div className="text-3xl font-bold">
                  $29<span className="text-lg font-normal">/month</span>
                </div>
                <p className="text-gray-600">For growing businesses</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Featured profile placement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Unlimited portfolio images</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Priority customer support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">3% service fee per booking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Analytics dashboard</span>
                  </li>
                </ul>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                  onClick={() => router.push("/join-provider")}
                >
                  Start Professional
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="bg-white">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Premium</CardTitle>
                <div className="text-3xl font-bold">
                  $99<span className="text-lg font-normal">/month</span>
                </div>
                <p className="text-gray-600">For established studios</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Top search placement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Multiple team members</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Dedicated account manager</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">1% service fee per booking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Custom branding options</span>
                  </li>
                </ul>
                <Button
                  className="w-full bg-white text-black border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg"
                  variant="outline"
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/premium-requests", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          email: "user@example.com", // You'll need to get this from user context
                          name: "Interested Photographer",
                          message: "Interested in Premium membership",
                        }),
                      })

                      if (response.ok) {
                        alert("Premium membership request submitted! We'll contact you soon.")
                      } else {
                        alert("Failed to submit request. Please try again.")
                      }
                    } catch (error) {
                      alert("Failed to submit request. Please try again.")
                    }
                  }}
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="font-bold mb-2 text-gray-900">How do payments work?</h3>
                <p className="text-gray-600 text-sm">
                  Clients pay photographers directly through our secure payment system. We charge a small service fee to
                  providers based on their plan.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="font-bold mb-2 text-gray-900">Can I change plans anytime?</h3>
                <p className="text-gray-600 text-sm">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="font-bold mb-2 text-gray-900">Are there any hidden fees?</h3>
                <p className="text-gray-600 text-sm">
                  No hidden fees. The service fee is clearly stated and only applies to completed bookings.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="font-bold mb-2 text-gray-900">What payment methods do you accept?</h3>
                <p className="text-gray-600 text-sm">
                  We accept all major credit cards, PayPal, and bank transfers for subscription plans.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}
