"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft, Users, Target, Award, Heart } from "lucide-react"

export default function AboutPage() {
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

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About Fotochi</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to connect clients with the perfect photographers and videographers, making professional
            photography accessible to everyone.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-bold">Our Mission</h2>
              </div>
              <p className="text-gray-600">
                To democratize professional photography by creating a platform where clients can easily find, connect
                with, and book talented photographers and videographers for any occasion.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-8 h-8 text-red-600" />
                <h2 className="text-2xl font-bold">Our Vision</h2>
              </div>
              <p className="text-gray-600">
                A world where every special moment is captured beautifully, and every talented photographer has the
                opportunity to grow their business and share their passion.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Our Story */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p>
                Fotochi was born from a simple observation: finding the right photographer for your special moments
                shouldn't be complicated. Whether you're planning a wedding, celebrating a milestone, or building your
                business brand, photography plays a crucial role in preserving those memories.
              </p>
              <p>
                We noticed that many talented photographers struggled to find clients, while clients often found it
                challenging to discover photographers who matched their style and budget. This gap inspired us to create
                a platform that benefits both sides of the equation.
              </p>
              <p>
                Today, Fotochi serves as a bridge between creativity and opportunity, helping thousands of clients find
                their perfect match while empowering photographers to grow their businesses and showcase their unique
                talents.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Values */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Quality</h3>
              <p className="text-gray-600">
                We maintain high standards for all photographers on our platform, ensuring clients receive exceptional
                service and results.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Community</h3>
              <p className="text-gray-600">
                We foster a supportive community where photographers can grow, learn, and connect with clients who
                appreciate their work.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Trust</h3>
              <p className="text-gray-600">
                We build trust through transparency, verified reviews, and secure payment processing for peace of mind
                on both sides.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-gray-600 mb-6">
              Join thousands of clients and photographers who trust Fotochi for their photography needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => router.push("/")} size="lg">
                Find a Photographer
              </Button>
              <Button onClick={() => router.push("/join-provider")} variant="outline" size="lg">
                Join as Provider
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
