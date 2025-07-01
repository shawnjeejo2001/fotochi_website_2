"use client"

import { cn } from "@/lib/utils"

interface FotochiLogoProps {
  showLogo?: boolean
  showText?: boolean
  textSize?: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl"
  logoSize?: "sm" | "md" | "lg" | "xl"
  className?: string
  variant?: "default" | "white"
  size?: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" // Legacy support
}

export default function FotochiLogo({
  showLogo = true,
  showText = true,
  textSize = "2xl",
  logoSize = "md",
  className,
  variant = "default",
  size, // Legacy support
}: FotochiLogoProps) {
  // Handle legacy size prop
  const actualTextSize = size || textSize

  const textColorClass = variant === "white" ? "text-white" : "text-gray-900"

  const logoSizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12",
  }

  const textSizeClasses = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
    "5xl": "text-5xl",
    "6xl": "text-6xl",
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showLogo && (
        <img src="/fotochi-logo.png" alt="Fotochi Logo" className={cn("object-contain", logoSizeClasses[logoSize])} />
      )}
      {showText && <span className={cn("font-bold", textSizeClasses[actualTextSize], textColorClass)}>Fotochi</span>}
    </div>
  )
}

export { FotochiLogo }
