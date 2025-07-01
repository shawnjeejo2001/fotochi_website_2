"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Camera, Upload, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface ProfilePictureUploaderProps {
  currentImage?: string | null
  userId: string
  userType: "provider" | "client"
  userName?: string
  onUploadSuccess?: (imageUrl: string) => void
  className?: string
}

export default function ProfilePictureUploader({
  currentImage,
  userId,
  userType,
  userName = "",
  onUploadSuccess,
  className,
}: ProfilePictureUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (!file) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPEG, PNG, or WebP image",
        variant: "destructive",
      })
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file immediately
    uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    setUploadSuccess(false)

    try {
      console.log("🚀 Starting upload for user:", userId, "type:", userType)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("userId", userId)
      formData.append("userType", userType)

      const response = await fetch("/api/upload-profile-picture", {
        method: "POST",
        body: formData,
      })

      console.log("📡 Response status:", response.status)

      const result = await response.json()
      console.log("📋 FULL RESPONSE:", result)

      if (response.ok && result.success && result.verified) {
        // Complete success
        console.log("🎉 UPLOAD SUCCESS!")

        setUploadSuccess(true)
        setPreviewImage(null)

        toast({
          title: "Success!",
          description: "Profile picture saved to database",
          variant: "default",
        })

        // Update parent component immediately
        onUploadSuccess?.(result.imageUrl)

        // Fast refresh - only 500ms delay
        setRefreshing(true)
        setTimeout(() => {
          console.log("🔄 Fast refresh...")
          window.location.reload()
        }, 500)
      } else {
        // Upload failed - show debug info
        console.log("❌ UPLOAD FAILED:", result)

        toast({
          title: "Upload failed",
          description: result.error || "Check console for details",
          variant: "destructive",
        })

        // Log debug info for troubleshooting
        if (result.debug) {
          console.log("🐛 DEBUG INFO:", result.debug)
        }

        setPreviewImage(null)
      }
    } catch (error) {
      console.error("💥 Upload error:", error)

      toast({
        title: "Upload failed",
        description: "Network error. Check console for details.",
        variant: "destructive",
      })

      setPreviewImage(null)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const clearPreview = () => {
    setPreviewImage(null)
    setUploadSuccess(false)
  }

  const displayImage = previewImage || currentImage

  return (
    <div className={cn("space-y-6", className)}>
      {/* Current/Preview Image */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Avatar className="w-32 h-32 border-4 border-gray-200 shadow-lg">
            <AvatarImage
              src={displayImage ? `${displayImage}?t=${Date.now()}` : undefined}
              alt={userName}
              className="object-cover"
            />
            <AvatarFallback className="bg-gray-100 text-gray-600 text-4xl">
              {userName ? userName.charAt(0).toUpperCase() : <Camera className="w-12 h-12" />}
            </AvatarFallback>
          </Avatar>

          {(uploading || refreshing) && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {uploadSuccess && !refreshing && (
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          )}
        </div>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
          <p className="text-sm text-gray-600">
            {uploading
              ? "Uploading and saving..."
              : refreshing
                ? "Refreshing..."
                : uploadSuccess
                  ? "Successfully saved!"
                  : "Click or drag to upload"}
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
          dragOver
            ? "border-blue-500 bg-blue-50"
            : uploadSuccess
              ? "border-green-500 bg-green-50"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50",
          (uploading || refreshing) && "pointer-events-none opacity-50",
        )}
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            {uploading || refreshing ? (
              <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : uploadSuccess ? (
              <CheckCircle className="w-12 h-12 text-green-600" />
            ) : (
              <Upload className="w-12 h-12 text-gray-400" />
            )}
          </div>

          <div>
            <p className="text-lg font-medium text-gray-900">
              {uploading
                ? "Uploading and saving..."
                : refreshing
                  ? "Refreshing page..."
                  : uploadSuccess
                    ? "Successfully saved to database!"
                    : "Drop your image here"}
            </p>
            <p className="text-sm text-gray-600">
              {uploadSuccess ? "Refreshing in 0.5 seconds..." : "or click to browse files"}
            </p>
          </div>

          <div className="text-xs text-gray-500">Supports: JPEG, PNG, WebP • Max size: 5MB</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={openFileDialog}
          disabled={uploading || uploadSuccess || refreshing}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Camera className="w-4 h-4 mr-2" />
          {uploading ? "Uploading..." : refreshing ? "Refreshing..." : uploadSuccess ? "Saved!" : "Choose Photo"}
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileSelect(file)
        }}
        className="hidden"
      />
    </div>
  )
}
