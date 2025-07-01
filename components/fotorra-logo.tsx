"use client"
import Image from "next/image"
import type { FC } from "react"

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl"
  variant?: "default" | "white"
  showText?: boolean
  showLogo?: boolean // New prop to control logo visibility
  className?: string
  customSize?: number
  textSize?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl"
}

const FotochiLogo: FC<LogoProps> = ({
  size = "2xl",
  variant = "default",
  showText = true,
  showLogo = true, // Default to showing logo
  className = "",
  customSize,
  textSize,
}) => {
  // Expanded size options including the new 4xl size
  const sizeMap = {
    xs: { width: 20, height: 20, textClass: "text-sm" },
    sm: { width: 32, height: 32, textClass: "text-lg" },
    md: { width: 40, height: 40, textClass: "text-xl" },
    lg: { width: 48, height: 48, textClass: "text-2xl" },
    xl: { width: 64, height: 64, textClass: "text-3xl" },
    "2xl": { width: 80, height: 80, textClass: "text-4xl" },
    "3xl": { width: 128, height: 128, textClass: "text-5xl" },
    "4xl": { width: 256, height: 256, textClass: "text-6xl" },
  }

  // Text size mapping
  const textSizeMap = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
    "5xl": "text-5xl",
    "6xl": "text-6xl",
  }

  // Use custom size if provided, otherwise use preset
  const dimensions = customSize ? { width: customSize, height: customSize, textClass: "text-xl" } : sizeMap[size]

  // Use custom text size if provided, otherwise use the default from size map
  const finalTextClass = textSize ? textSizeMap[textSize] : dimensions.textClass

  const colorClass = variant === "white" ? "text-white" : "text-gray-900"

  return (
    <div className={`flex items-center ${showLogo && showText ? "gap-2" : ""} ${className}`}>
      {showLogo && (
        <Image
          src="/fotochi-logo.png"
          alt="Fotochi logo"
          width={dimensions.width}
          height={dimensions.height}
          priority
          className="object-contain"
        />
      )}
      {showText && <span className={`${finalTextClass} font-bold ${colorClass}`}>Fotochi</span>}
    </div>
  )
}

export default FotochiLogo
