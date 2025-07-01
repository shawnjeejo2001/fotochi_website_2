"use client"

import type React from "react"

import { useState } from "react"
import { Loader2 } from "lucide-react"

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc: string
}

export default function ImageWithFallback({ src, alt, fallbackSrc, className, ...rest }: ImageWithFallbackProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setError(true)
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}
      <img
        src={error ? fallbackSrc : src}
        alt={alt || "Image"}
        className={className}
        onLoad={handleLoad}
        onError={handleError}
        {...rest}
      />
    </div>
  )
}
