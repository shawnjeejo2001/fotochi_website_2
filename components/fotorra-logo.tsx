interface FotorraLogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
  variant?: "default" | "white"
}

export default function FotorraLogo({
  size = "md",
  showText = true,
  className = "",
  variant = "default",
}: FotorraLogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  }

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  const colorClasses = variant === "white" ? "text-white" : "text-gray-900"

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Unique abstract F-shaped aperture logo */}
      <div className={`${sizeClasses[size]} relative`}>
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 6H26V12H14V16H22V22H14V26H6V6Z" fill={variant === "white" ? "white" : "black"} />
          <circle cx="19" cy="9" r="3" fill={variant === "white" ? "white" : "black"} />
        </svg>
      </div>
      {showText && <span className={`${textSizeClasses[size]} font-bold ${colorClasses}`}>Fotorra</span>}
    </div>
  )
}
