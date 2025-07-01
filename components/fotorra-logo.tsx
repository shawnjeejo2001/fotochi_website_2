"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import type { FC } from "react"

/**
 * Preset sizes (image px + default text size).
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

type PresetSize = keyof typeof SIZE_MAP
type TextSize = PresetSize | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | "base" | "xs" | "sm" | "lg" | "xl"

export interface FotochiLogoProps {
  /** Preset size for PNG + default text size. */
  size?: PresetSize
  /** Explicit pixel size for the PNG (overrides `size`). */
  customSize?: number
  /** Override the text’s Tailwind size (e.g. `"5xl"`). */
  textSize?: TextSize
  /** Show / hide the PNG. */
  showLogo?: boolean
  /** Show / hide the “Fotochi” text. */
  showText?: boolean
  /** Swap between dark (default) and white text colouring. */
  variant?: "default" | "white"
  /** Extra Tailwind / CSS classes. */
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
  const imgPx = customSize ?? preset.px
  const textClass = textSize ? `text-${textSize}` : preset.text
  const colour = variant === "white" ? "text-white" : "text-gray-900"

  return (
    <span className={cn("inline-flex items-center gap-2 select-none", className)}>
      {showLogo && (
        <Image
          src="/fotochi-logo.png"
          alt="Fotochi logo"
          width={imgPx}
          height={imgPx}
          priority
          unoptimized /* avoid optimiser → blob URLs */
          className="object-contain"
        />
      )}
      {showText && <span className={cn("font-semibold leading-none", textClass, colour)}>Fotochi</span>}
    </span>
  )
}

/* default export for `import FotochiLogo from ...` */
export default FotochiLogo
