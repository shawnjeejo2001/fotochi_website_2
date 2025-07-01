"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Camera, Database, Filter, Heart, MapPin, Search, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"

type ApiPhotographer = {
  id: string
  name: string
  location: string
  mainStyle: string
  additionalStyles: string[]
  rating: number
  reviews: number
  price: string
  priceType?: string
  priceValue?: number
  profileImageUrl?: string
  portfolioImages?: string[]
  status?: string
}

const photographyStyles = [
  { value: "all", label: "All Styles" },
  { value: "wedding", label: "Wedding", color: "bg-pink-100 text-pink-800" },
  { value: "portrait", label: "Portrait", color: "bg-blue-100 text-blue-800" },
  { value: "event", label: "Event", color: "bg-purple-100 text-purple-800" },
  { value: "real estate", label: "Real Estate", color: "bg-green-100 text-green-800" },
  { value: "food", label: "Food", color: "bg-orange-100 text-orange-800" },
  { value: "product", label: "Product", color: "bg-gray-100 text-gray-800" },
  { value: "sports", label: "Sports", color: "bg-red-100 text-red-800" },
  { value: "nature", label: "Nature", color: "bg-emerald-100 text-emerald-800" },
  { value: "pet", label: "Pet", color: "bg-amber-100 text-amber-800" },
]

function getStyleColor(style: string) {
  const match = photographyStyles.find((s) => s.value === style.toLowerCase())
  return match?.color || "bg-gray-100 text-gray-800"
}

export default function PhotographersPage() {
  const router = useRouter()

  const [photographers, setPhotographers] = useState<ApiPhotographer[]>([])
  const [filteredPhotographers, setFilteredPhotographers] = useState<ApiPhotographer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStyle, setSelectedStyle] = useState("all")
  const [sortBy, setSortBy] = useState("rating")
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [showDebug, setShowDebug] = useState(false)

  /* -------------------------------------------------------------------- */
  /*                             DATA FETCHING                            */
  /* -------------------------------------------------------------------- */
  const fetchPhotographers = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch("/api/photographers")
      const data = await res.json()

      // The API may return either { photographers: [...] }  OR  [...].
      const list = Array.isArray(data) ? data : data.photographers

      setPhotographers(list || [])
      setDebugInfo(data.debug || null)
    } catch (e) {
      console.error("Unable to fetch photographers:", e)
      setError("Failed to fetch photographers")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPhotographers()
  }, [])

  /* -------------------------------------------------------------------- */
  /*                         FILTERING /  SORTING                         */
  /* -------------------------------------------------------------------- */
  useEffect(() => {
    let result = [...photographers]

    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q) ||
          p.mainStyle?.toLowerCase().includes(q),
      )
    }

    if (selectedStyle !== "all") {
      result = result.filter(
        (p) =>
          p.mainStyle?.toLowerCase() === selectedStyle ||
          p.additionalStyles?.some((s) => s.toLowerCase() === selectedStyle),
      )
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.rating || 0) - (a.rating || 0)
        case "price-low":
          return (a.priceValue || 0) - (b.priceValue || 0)
        case "price-high":
          return (b.priceValue || 0) - (a.priceValue || 0)
        case "reviews":
          return (b.reviews || 0) - (a.reviews || 0)
        case "name":
          return (a.name || "").localeCompare(b.name || "")
        default:
          return 0
      }
    })

    setFilteredPhotographers(result)
  }, [photographers, searchTerm, selectedStyle, sortBy])

  /* -------------------------------------------------------------------- */
  /*                           INTERACTION HANDLERS                       */
  /* -------------------------------------------------------------------- */
  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const bookPhotographer = (id: string) => router.push(`/book/${id}`)

  /* -------------------------------------------------------------------- */
  /*                               RENDER                                 */
  /* -------------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 rounded-full border-blue-500 border-t-transparent animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading photographers…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ---------------------------------------------------------------- */}
      {/*                            HEADER                                */}
      {/* ---------------------------------------------------------------- */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            aria-label="Back to home"
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-900 hover:text-blue-600"
          >
            <ArrowLeft className="w-5 h-5" />
            Home
          </button>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push("/sign-in")}>
              Sign&nbsp;In
            </Button>
            <Button onClick={() => router.push("/sign-up")}>Join&nbsp;Fotochi</Button>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------------- */}
      {/*                      SEARCH / FILTER CONTROLS                    */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-white border-b py-6">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search photographers…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Style Filter */}
          <Select value={selectedStyle} onValueChange={setSelectedStyle}>
            <SelectTrigger>
              <SelectValue placeholder="Photography Style" />
            </SelectTrigger>
            <SelectContent>
              {photographyStyles.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="reviews">Most Reviews</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="name">Name A–Z</SelectItem>
            </SelectContent>
          </Select>

          {/* Results Count */}
          <div className="flex items-center text-sm text-gray-600">
            <Filter className="w-4 h-4 mr-2" />
            {filteredPhotographers.length}&nbsp;found
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/*                            CONTENT                               */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {filteredPhotographers.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPhotographers.map((p) => (
                <Card key={p.id} className="group relative hover:shadow-xl transition-all duration-300">
                  {/* Favorite button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(p.id)
                    }}
                    className="absolute top-3 right-3 z-10 p-2 bg-white/80 rounded-full hover:bg-white shadow"
                    aria-label={favorites.has(p.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        favorites.has(p.id) ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-400"
                      }`}
                    />
                  </button>

                  <CardHeader className="text-center p-4">
                    <Avatar className="w-20 h-20 mx-auto mb-3">
                      <AvatarImage
                        src={
                          p.profileImageUrl || "/placeholder.svg?width=80&height=80&query=user" || "/placeholder.svg"
                        }
                        alt={p.name}
                      />
                      <AvatarFallback>
                        <Camera className="w-8 h-8 text-gray-400" />
                      </AvatarFallback>
                    </Avatar>

                    <CardTitle className="text-lg font-bold mb-1">{p.name}</CardTitle>

                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-2">
                      <MapPin className="w-3 h-3" />
                      {p.location}
                    </div>

                    <Badge className={getStyleColor(p.mainStyle)}>{p.mainStyle}</Badge>
                  </CardHeader>

                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-center gap-1 mb-3">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-sm">{p.rating}</span>
                      <span className="text-sm text-gray-600">({p.reviews})</span>
                    </div>

                    <div className="text-center mb-4">
                      <div className="text-lg font-bold text-gray-900">{p.price}</div>
                      {p.priceType && <div className="text-xs text-gray-600">{p.priceType}</div>}
                    </div>

                    <Button
                      onClick={() => bookPhotographer(p.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
                    >
                      View&nbsp;Profile
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold mb-2 text-gray-900">No photographers found</h2>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedStyle !== "all"
                  ? "Try adjusting your search criteria or filters."
                  : "No photographers are currently available in the database."}
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedStyle("all")
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
                <Button onClick={fetchPhotographers} variant="outline">
                  Refresh Data
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Optional debug banner */}
      {debugInfo && (
        <div className="fixed bottom-0 left-0 right-0 bg-blue-50 border-t border-blue-200 text-xs px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-blue-800">
            <Database className="w-3 h-3" />
            <span>{debugInfo.totalRecordsInTable ?? photographers.length} records loaded</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowDebug(!showDebug)}
            className="text-blue-600 hover:text-blue-800"
          >
            {showDebug ? "Hide" : "Show"} Debug
          </Button>
        </div>
      )}
      {showDebug && debugInfo && (
        <pre className="fixed bottom-12 left-0 right-0 max-h-60 overflow-auto bg-white border-t p-4 text-xs">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      )}
    </main>
  )
}
