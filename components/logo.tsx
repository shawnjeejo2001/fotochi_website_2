interface LogoProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function Logo({ size = "md", className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Simple aperture/lens design */}
        <circle cx="12" cy="12" r="10" stroke="black" strokeWidth="2" fill="white" />
        <circle cx="12" cy="12" r="6" stroke="black" strokeWidth="1.5" fill="none" />

        {/* Aperture blades - simple geometric shapes */}
        <path d="M12 6 L15 9 L12 12 L9 9 Z" fill="black" />
        <path d="M18 12 L15 15 L12 12 L15 9 Z" fill="black" />
        <path d="M12 18 L9 15 L12 12 L15 15 Z" fill="black" />
        <path d="M6 12 L9 9 L12 12 L9 15 Z" fill="black" />
      </svg>
    </div>
  )
}
