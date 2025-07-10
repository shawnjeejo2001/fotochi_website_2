// app/photographers/page.tsx

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PhotographerCard } from "@/components/photographer-card"
import { Camera } from "lucide-react"

interface Photographer {
  id: string;
  name: string;
  location: string;
  mainStyle: string;
  additionalStyles?: string[];
  rating: number;
  reviews: number;
  price: string;
  profile_image?: string;
  featured_images?: string[];
  distance?: number;
}

export default function PhotographersPage() {
  const [photographers, setPhotographers] = useState<Photographer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPhotographers = async () => {
      try {
        setLoading(true)
        // Extract search query from URL
        const searchParams = new URLSearchParams(window.location.search);
        const response = await fetch(`/api/photographers/search?${searchParams.toString()}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.photographers && Array.isArray(data.photographers)) {
          setPhotographers(data.photographers)
        } else {
          setError("Failed to load photographers. Please try again later.")
        }
      } catch (error) {
        console.error("Could not fetch photographers:", error)
        setError("Failed to load photographers. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchPhotographers()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
            <Link href="/" className="cursor-pointer">
              <h1 className="text-4xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                Fotochi
              </h1>
            </Link>
            <p className="text-xl text-gray-500 mt-2">
              Our Photographers
            </p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading Photographers...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {photographers.map((photographer) => (
              <PhotographerCard key={photographer.id} photographer={photographer} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
