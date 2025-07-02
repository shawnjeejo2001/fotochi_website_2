"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import type { FC } from "react"

/**
 * Fully featured logo component (re-added because the file had been deleted).
 * Works with previous imports:
 *   import FotochiLogo from "@/components/fotorra-logo"
 *   import { FotochiLogo } from "@/components/fotorra-logo"
 */
const SIZE_MAP = {
  xs: { px: 20, text: "text-sm" },
  sm: { px: 32, text: "text-lg" },
  md: { px: 40, text: "text-xl" },
  lg: { px: 48, text: "text-2xl" },
  xl: { px: 64, text: "text-3xl" },
  "2xl": { px: 80, text: "text-4xl" },
  "3xl": { px: 128, text: "text-5xl" },
  "4xl": { px: 256, text: "text-6xl" },
} as const

type Preset = keyof typeof SIZE_MAP
type TextSize = Preset | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | "base"

export interface FotochiLogoProps {
  size?: Preset
  customSize?: number
  textSize?: TextSize
  showLogo?: boolean
  showText?: boolean
  variant?: "default" | "white"
  className?: string
}

export const FotochiLogo: FC<FotochiLogoProps> = ({
  size = "md",
  customSize,
  textSize,
  showLogo = true,
  showText = true,
  variant = "default",
  className,
}) => {
  const preset = SIZE_MAP[size]
  const px = customSize ?? preset.px
  const textClass = textSize ? `text-${textSize}` : preset.text
  const colour = variant === "white" ? "text-white" : "text-gray-900"

  return (
    <span className={cn("inline-flex items-center gap-2 select-none", className)}>
      {showLogo && (
        <Image
          src="/fotochi-logo.png"
          alt="Fotochi logo"
          width={px}
          height={px}
          priority
          unoptimized
          className="object-contain"
        />
      )}
      {showText && <span className={cn("font-semibold leading-none", textClass, colour)}>Fotochi</span>}
    </span>
  )
}

export default FotochiLogo
