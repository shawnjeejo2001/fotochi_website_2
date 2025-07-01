"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-lg text-gray-600">Last updated: January 1, 2024</p>
        </div>

        <Card>
          <CardContent className="p-8 prose prose-lg max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Fotochi, you accept and agree to be bound by the terms and provision of this
              agreement.
            </p>

            <h2>2. Service Description</h2>
            <p>
              Fotochi is a platform that connects clients with photographers and videographers. We facilitate bookings
              but are not responsible for the actual photography services.
            </p>

            <h2>3. User Accounts</h2>
            <p>
              Users must provide accurate information when creating accounts. You are responsible for maintaining the
              confidentiality of your account credentials.
            </p>

            <h2>4. Provider Responsibilities</h2>
            <p>Photographers and videographers must:</p>
            <ul>
              <li>Provide accurate portfolio information</li>
              <li>Only upload original work they have created</li>
              <li>Respond to booking requests in a timely manner</li>
              <li>Deliver services as agreed with clients</li>
            </ul>

            <h2>5. Client Responsibilities</h2>
            <p>Clients must:</p>
            <ul>
              <li>Provide accurate event information</li>
              <li>Make payments as agreed</li>
              <li>Treat service providers with respect</li>
              <li>Follow cancellation policies</li>
            </ul>

            <h2>6. Payments and Fees</h2>
            <p>
              Payments are processed securely through our platform. Service fees apply to providers based on their
              subscription plan.
            </p>

            <h2>7. Intellectual Property</h2>
            <p>
              Providers retain ownership of their portfolio images. Clients receive usage rights as agreed in their
              service contracts.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              Fotochi is not liable for disputes between clients and providers. We provide the platform but do not
              guarantee service quality.
            </p>

            <h2>9. Termination</h2>
            <p>
              We reserve the right to terminate accounts that violate these terms or engage in fraudulent activities.
            </p>

            <h2>10. Contact Information</h2>
            <p>For questions about these terms, contact us at legal@fotochi.com</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
