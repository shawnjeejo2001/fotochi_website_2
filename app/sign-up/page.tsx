"use client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

const SignUpPage = () => {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm w-full">
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
          </div>
        </div>
      </header>

      <div className="bg-white p-8 rounded shadow-md w-96 mt-8">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-900">Join Our Platform</h2>

        <div className="space-y-4">
          <div className="text-center text-gray-600 mb-6">Choose how you'd like to join:</div>

          <Button
            onClick={() => router.push("/join-provider")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 shadow-md hover:shadow-lg"
          >
            Join as Photographer/Videographer
          </Button>

          <div className="text-center text-sm text-gray-500 my-4">or</div>

          <Button
            onClick={() => router.push("/join-client")}
            variant="outline"
            className="w-full py-3 bg-white text-black border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg"
          >
            Join as Client
          </Button>
        </div>

        <div className="mt-6 text-center">
          <span className="text-gray-600">Already have an account? </span>
          <Link href="/sign-in" className="text-blue-500 hover:text-blue-800 font-medium">
            Sign In
          </Link>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              <strong>Photographers/Videographers:</strong> Apply to join, get approved, start receiving bookings
            </p>
            <p>
              <strong>Clients:</strong> Browse photographers, book sessions, manage your events
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage
