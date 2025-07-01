"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Loader2 } from 'lucide-react'

// Define types for Google Maps API
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          AutocompleteService: new () => any
          PlacesServiceStatus: {
            OK: string
            ZERO_RESULTS: string
            OVER_QUERY_LIMIT: string
            REQUEST_DENIED: string
            INVALID_REQUEST: string
            UNKNOWN_ERROR: string
          }
        }
        Geocoder: new () => any
        GeocoderStatus: {
          OK: string
          ZERO_RESULTS: string
          OVER_QUERY_LIMIT: string
          REQUEST_DENIED: string
          INVALID_REQUEST: string
          UNKNOWN_ERROR: string
        }
      }
    }
  }
}

interface LocationInputProps {
  value: string
  onChange: (value: string) => void
  onCoordinatesChange?: (lat: number, lng: number) => void
  placeholder?: string
  className?: string
}

export default function LocationInput({
  value,
  onChange,
  onCoordinatesChange,
  placeholder = "Enter address, city, state, or zip",
  className = "",
}: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const autocompleteRef = useRef<any>(null)
  const geocoderRef = useRef<any>(null)
  const [googleLoaded, setGoogleLoaded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load Google Maps API
  useEffect(() => {
    // Skip if already loaded
    if (window.google?.maps?.places) {
      setGoogleLoaded(true)
      return
    }

    async function loadGoogleMapsAPI() {
      try {
        // Use the public API key directly for client-side
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

        if (!apiKey) {
          console.error("Google Maps API key not found in environment variables")
          return
        }

        // Load Google Maps API script
        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
        script.async = true
        script.defer = true
        script.onload = () => {
          console.log("Google Maps API loaded successfully")
          setGoogleLoaded(true)
        }
        script.onerror = (error) => {
          console.error("Error loading Google Maps API:", error)
        }
        document.head.appendChild(script)
      } catch (error) {
        console.error("Error setting up Google Maps API:", error)
      }
    }

    loadGoogleMapsAPI()
  }, [])

  // Initialize Google services when API is loaded
  useEffect(() => {
    if (googleLoaded && window.google?.maps?.places) {
      autocompleteRef.current = new window.google.maps.places.AutocompleteService()
      geocoderRef.current = new window.google.maps.Geocoder()
    }
  }, [googleLoaded])

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    if (newValue.length > 2 && autocompleteRef.current) {
      setLoading(true)
      autocompleteRef.current.getPlacePredictions(
        {
          input: newValue,
          types: ["address"],
          componentRestrictions: { country: "us" },
        },
        (predictions: any[], status: string) => {
          setLoading(false)
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions.map((p) => p.description))
            setShowSuggestions(true)
          } else {
            console.log("No predictions found, status:", status)
            setSuggestions([])
            setShowSuggestions(false)
          }
        },
      )
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Geocode the selected location to get coordinates
  const geocodeLocation = (address: string) => {
    if (!geocoderRef.current) return

    setLoading(true)
    geocoderRef.current.geocode(
      {
        address,
        componentRestrictions: { country: "US" },
      },
      (results: any[], status: string) => {
        setLoading(false)
        if (status === window.google.maps.GeocoderStatus.OK && results && results[0]) {
          const location = results[0].geometry.location
          const lat = location.lat()
          const lng = location.lng()
          console.log("Geocoded coordinates:", lat, lng)

          if (onCoordinatesChange) {
            onCoordinatesChange(lat, lng)
          }
        } else {
          console.error("Geocoding failed:", status)
          // Try fallback geocoding
          fallbackGeocodeLocation(address)
        }
      },
    )
  }

  const fallbackGeocodeLocation = async (address: string) => {
    if (!address) return

    setLoading(true)
    try {
      const response = await fetch(`/api/geocode-location?address=${encodeURIComponent(address)}`)
      const data = await response.json()

      if (response.ok && data.lat && data.lng) {
        console.log("Server geocoded coordinates:", data.lat, data.lng)

        if (onCoordinatesChange) {
          onCoordinatesChange(Number(data.lat), Number(data.lng))
        }
      } else {
        console.error("Server geocoding failed:", data.error || "Unknown error")
      }
    } catch (error) {
      console.error("Error with server geocoding:", error)
    } finally {
      setLoading(false)
    }
  }

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion)
    setSuggestions([])
    setShowSuggestions(false)

    // Get coordinates for the selected location
    if (geocoderRef.current) {
      geocodeLocation(suggestion)
    } else {
      // Use fallback if Google Maps API isn't loaded
      fallbackGeocodeLocation(suggestion)
    }
  }

  // Handle Enter key press to geocode current input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.length > 2) {
      setShowSuggestions(false)

      if (geocoderRef.current) {
        geocodeLocation(value)
      } else {
        // Use fallback if Google Maps API isn't loaded
        fallbackGeocodeLocation(value)
      }
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Add this useEffect to debug coordinate changes
  useEffect(() => {
    console.log("LocationInput: onCoordinatesChange prop:", onCoordinatesChange)
  }, [onCoordinatesChange])

  return (
    <div className="relative" ref={inputRef}>
      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className={className}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto text-gray-900">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
              onClick={() => handleSelectSuggestion(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}

      {showSuggestions && suggestions.length === 0 && value.length > 2 && !loading && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 p-3">
          <div className="text-sm text-gray-600">No suggestions found. Press Enter to search for "{value}"</div>
        </div>
      )}
    </div>
  )
}
