"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, MessageCircle, Calendar, Camera, Star, CreditCard } from "lucide-react"

export default function HowItWorksPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <button
              onClick={() => router.push("/")}
              className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              Fotochi
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">How Fotochi Works</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Getting professional photography has never been easier. Follow these simple steps to find and book the
            perfect photographer for your needs.
          </p>
        </div>

        {/* For Clients */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">For Clients</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-4">1. Search & Discover</h3>
                <p className="text-gray-600">
                  Use our advanced search to find photographers by style, location, budget, and availability. Browse
                  portfolios and read reviews from other clients.
                </p>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-4">2. Connect & Discuss</h3>
                <p className="text-gray-600">
                  Send a booking request with your event details. Chat with photographers to discuss your vision,
                  requirements, and finalize the details.
                </p>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-4">3. Book & Enjoy</h3>
                <p className="text-gray-600">
                  Confirm your booking with secure payment. Your photographer will capture your special moments, and
                  you'll receive your edited photos within the agreed timeframe.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* For Providers */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">For Photographers & Videographers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold mb-4">1. Create Your Profile</h3>
                <p className="text-gray-600">
                  Sign up and create a compelling profile showcasing your best work, specialties, and pricing. Upload
                  your portfolio and describe your style.
                </p>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold mb-4">2. Receive Requests</h3>
                <p className="text-gray-600">
                  Get booking requests from clients in your area. Review event details and communicate with potential
                  clients to understand their needs.
                </p>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold mb-4">3. Accept & Get Paid</h3>
                <p className="text-gray-600">
                  Accept bookings that fit your schedule and style. Complete the session, deliver your work, and receive
                  secure payment through our platform.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose Fotochi?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Verified Professionals</h3>
                <p className="text-gray-600">
                  All photographers undergo verification and maintain quality ratings based on client reviews.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Secure Payments</h3>
                <p className="text-gray-600">
                  Protected transactions with escrow services and secure payment processing.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Easy Communication</h3>
                <p className="text-gray-600">
                  Built-in messaging system to discuss details and track your booking progress.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Quality Guarantee</h3>
                <p className="text-gray-600">
                  Satisfaction guarantee with our dispute resolution system and refund protection.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-gray-600 mb-6">Join thousands who trust Fotochi for their photography needs.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => router.push("/")} size="lg">
                Find Photographers
              </Button>
              <Button onClick={() => router.push("/join-provider")} variant="outline" size="lg">
                Become a Provider
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
