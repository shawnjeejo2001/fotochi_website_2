"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Users, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignUpPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const handleSelection = (type: string) => {
    setSelectedType(type)
    setTimeout(() => {
      if (type === "client") {
        router.push("/join-client")
      } else {
        router.push("/join-provider")
      }
    }, 200)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="text-4xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            Fotochi
          </Link>
          <p className="text-xl text-gray-600 mt-4">Choose how you'd like to join our community</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Client Card */}
          <Card
            className={`cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 border-2 ${
              selectedType === "client" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
            }`}
            onClick={() => handleSelection("client")}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">I'm looking to hire</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Find and book professional photographers for your events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Browse photographer portfolios</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Book sessions instantly</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Secure payment processing</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Review and rating system</span>
                </div>
              </div>

              <div className="pt-4">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg">
                  Join as Client
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Photographer Card */}
          <Card
            className={`cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 border-2 ${
              selectedType === "provider" ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-300"
            }`}
            onClick={() => handleSelection("provider")}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-10 h-10 text-purple-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">I'm a photographer</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Showcase your work and connect with clients who need your services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">Create stunning portfolio</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">Manage bookings & calendar</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">Set your own pricing</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">Get paid securely</span>
                </div>
              </div>

              <div className="pt-4">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-lg">
                  Apply as Photographer
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
