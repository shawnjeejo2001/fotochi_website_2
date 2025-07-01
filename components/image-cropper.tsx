"use client"

import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"

interface ImageCropperProps {
  image: string
  onCropComplete: (croppedAreaPixels: any, croppedImageUrl: string) => void
  onCancel: () => void
  aspectRatio?: number
  cropShape?: "rect" | "round"
}

export default function ImageCropper({
  image,
  onCropComplete,
  onCancel,
  aspectRatio = 1,
  cropShape = "round",
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const onCropCompleteCallback = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const createCroppedImage = useCallback(async () => {
    if (!croppedAreaPixels) return

    try {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const imageElement = new Image()

      imageElement.crossOrigin = "anonymous"
      imageElement.src = image

      await new Promise((resolve) => {
        imageElement.onload = resolve
      })

      const { width, height, x, y } = croppedAreaPixels

      canvas.width = width
      canvas.height = height

      ctx?.drawImage(imageElement, x, y, width, height, 0, 0, width, height)

      const croppedImageUrl = canvas.toDataURL("image/jpeg", 0.8)
      onCropComplete(croppedAreaPixels, croppedImageUrl)
    } catch (error) {
      console.error("Error creating cropped image:", error)
    }
  }, [croppedAreaPixels, image, onCropComplete])

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crop Profile Picture</DialogTitle>
        </DialogHeader>

        <div className="relative h-64 w-full">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            cropShape={cropShape}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteCallback}
            onZoomChange={setZoom}
            showGrid={false}
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Zoom</label>
            <Slider
              value={[zoom]}
              onValueChange={(value) => setZoom(value[0])}
              min={1}
              max={3}
              step={0.1}
              className="mt-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={createCroppedImage} className="bg-blue-600 hover:bg-blue-700 text-white">
            Crop & Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
