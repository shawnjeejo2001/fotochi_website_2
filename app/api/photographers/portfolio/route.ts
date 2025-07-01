import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create Supabase client with service role key for server operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const PORTFOLIO_BUCKET = "portfoliopictures"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get provider data including portfolio and subscription
    const { data: provider, error: providerError } = await supabase
      .from("providers")
      .select("portfolio_files, featured_images, subscription_plan, profile_image, user_id, id")
      .eq("user_id", userId)
      .single()

    if (providerError) {
      console.error("Provider fetch error:", providerError)

      // If provider not found, create a basic provider record
      if (providerError.code === "PGRST116") {
        console.log("Provider not found, creating basic record for user:", userId)

        const { data: newProvider, error: createError } = await supabase
          .from("providers")
          .insert({
            user_id: userId,
            portfolio_files: [],
            featured_images: [],
            subscription_plan: "starter",
            status: "pending",
          })
          .select("portfolio_files, featured_images, subscription_plan, profile_image")
          .single()

        if (createError) {
          console.error("Failed to create provider record:", createError)
          return NextResponse.json({ error: "Failed to initialize provider data" }, { status: 500 })
        }

        // Use the newly created provider data
        const portfolioImages: string[] = []
        const featuredImages: string[] = []
        const maxImages = 5
        const remainingSlots = 5

        return NextResponse.json({
          portfolioImages,
          featuredImages,
          profileImage: null,
          maxImages,
          currentPlan: "starter",
          remainingSlots,
        })
      }

      return NextResponse.json({ error: "Failed to fetch provider data" }, { status: 500 })
    }

    // Determine max images based on subscription plan
    const planLimits = {
      starter: 5,
      professional: 20,
      premium: 50,
    }

    const currentPlan = provider?.subscription_plan || "starter"
    const maxImages = planLimits[currentPlan as keyof typeof planLimits] || 5

    // Handle portfolio_files as array (could be JSONB or text[])
    let portfolioImages: string[] = []
    if (provider?.portfolio_files) {
      if (typeof provider.portfolio_files === "string") {
        try {
          portfolioImages = JSON.parse(provider.portfolio_files)
        } catch {
          portfolioImages = []
        }
      } else if (Array.isArray(provider.portfolio_files)) {
        portfolioImages = provider.portfolio_files
      }
    }

    // Handle featured_images as text[] array
    const featuredImages = provider?.featured_images || []

    const remainingSlots = Math.max(0, maxImages - portfolioImages.length)

    return NextResponse.json({
      portfolioImages,
      featuredImages,
      profileImage: provider?.profile_image,
      maxImages,
      currentPlan,
      remainingSlots,
    })
  } catch (error) {
    console.error("Portfolio fetch error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log("Portfolio upload started")

    const formData = await request.formData()
    const userId = formData.get("userId") as string
    const files = formData.getAll("files") as File[]

    console.log("Received upload request:", { userId, fileCount: files.length })

    if (!userId || !files || files.length === 0) {
      return NextResponse.json({ error: "User ID and files are required" }, { status: 400 })
    }

    // Get current provider data
    const { data: provider, error: providerError } = await supabase
      .from("providers")
      .select("portfolio_files, subscription_plan")
      .eq("user_id", userId)
      .single()

    if (providerError) {
      console.error("Provider fetch error:", providerError)

      // If provider not found, create a basic provider record
      if (providerError.code === "PGRST116") {
        const { data: newProvider, error: createError } = await supabase
          .from("providers")
          .insert({
            user_id: userId,
            portfolio_files: [],
            featured_images: [],
            subscription_plan: "starter",
            status: "pending",
          })
          .select("portfolio_files, featured_images, subscription_plan, profile_image")
          .single()

        if (createError) {
          console.error("Failed to create provider record:", createError)
          return NextResponse.json({ error: "Failed to initialize provider data" }, { status: 500 })
        }

        // Continue with upload using new provider data
        const currentImages: string[] = []
        const currentPlan = "starter"
        const maxImages = 5
        // Continue with the rest of the upload logic...
      } else {
        return NextResponse.json({ error: "Failed to fetch provider data" }, { status: 500 })
      }
    }

    // Check plan limits
    const planLimits = {
      starter: 5,
      professional: 20,
      premium: 50,
    }

    const currentPlan = provider?.subscription_plan || "starter"
    const maxImages = planLimits[currentPlan as keyof typeof planLimits] || 5

    // Handle portfolio_files as array
    let currentImages: string[] = []
    if (provider?.portfolio_files) {
      if (typeof provider.portfolio_files === "string") {
        try {
          currentImages = JSON.parse(provider.portfolio_files)
        } catch {
          currentImages = []
        }
      } else if (Array.isArray(provider.portfolio_files)) {
        currentImages = provider.portfolio_files
      }
    }

    const remainingSlots = Math.max(0, maxImages - currentImages.length)

    if (files.length > remainingSlots) {
      return NextResponse.json(
        {
          error: `You can only upload ${remainingSlots} more images. Your ${currentPlan} plan allows ${maxImages} total images.`,
        },
        { status: 400 },
      )
    }

    // Upload files to Supabase Storage
    const uploadedUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate file
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
      if (!allowedTypes.includes(file.type)) {
        console.log(`Skipping invalid file type: ${file.type}`)
        continue
      }

      if (file.size > 10 * 1024 * 1024) {
        console.log(`Skipping large file: ${file.size} bytes`)
        continue
      }

      try {
        // Generate unique filename
        const fileExt = file.name.split(".").pop()
        const fileName = `${userId}/${Date.now()}-${i}.${fileExt}`

        console.log("Uploading portfolio file:", fileName)

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(PORTFOLIO_BUCKET)
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: true,
          })

        if (uploadError) {
          console.error("Upload error:", uploadError)
          continue
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from(PORTFOLIO_BUCKET).getPublicUrl(fileName)

        const imageUrl = urlData.publicUrl
        uploadedUrls.push(imageUrl)
        console.log("Successfully uploaded:", imageUrl)
      } catch (fileError) {
        console.error("Error processing file", i, ":", fileError)
        continue
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json({ error: "No valid images were uploaded" }, { status: 400 })
    }

    // Update portfolio images in database
    const updatedPortfolioImages = [...currentImages, ...uploadedUrls]

    const { error: updateError } = await supabase
      .from("providers")
      .update({
        portfolio_files: updatedPortfolioImages,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (updateError) {
      console.error("Portfolio update error:", updateError)
      return NextResponse.json({ error: "Failed to update portfolio" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Images uploaded successfully",
      uploadedUrls,
      totalImages: updatedPortfolioImages.length,
      remainingSlots: maxImages - updatedPortfolioImages.length,
    })
  } catch (error) {
    console.error("Portfolio upload error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId, imageUrl } = await request.json()

    if (!userId || !imageUrl) {
      return NextResponse.json({ error: "User ID and image URL are required" }, { status: 400 })
    }

    // Extract filename from URL for deletion
    const urlParts = imageUrl.split("/")
    const fileName = urlParts[urlParts.length - 1]
    const filePath = `${userId}/${fileName}`

    // Delete from storage
    const { error: deleteError } = await supabase.storage.from(PORTFOLIO_BUCKET).remove([filePath])

    if (deleteError) {
      console.error("Storage delete error:", deleteError)
    }

    // Get current provider data
    const { data: provider, error: providerError } = await supabase
      .from("providers")
      .select("portfolio_files, featured_images")
      .eq("user_id", userId)
      .single()

    if (providerError) {
      console.error("Provider fetch error:", providerError)
      if (providerError.code === "PGRST116") {
        return NextResponse.json({ error: "Provider not found" }, { status: 404 })
      }
      return NextResponse.json({ error: "Failed to fetch provider data" }, { status: 500 })
    }

    // Handle portfolio_files as array
    let currentImages: string[] = []
    if (provider?.portfolio_files) {
      if (typeof provider.portfolio_files === "string") {
        try {
          currentImages = JSON.parse(provider.portfolio_files)
        } catch {
          currentImages = []
        }
      } else if (Array.isArray(provider.portfolio_files)) {
        currentImages = provider.portfolio_files
      }
    }

    // Handle featured_images as text[] array
    const currentFeatured = provider?.featured_images || []

    // Remove image from portfolio
    const updatedPortfolioImages = currentImages.filter((url: string) => url !== imageUrl)

    // Remove from featured if it was featured
    const updatedFeaturedImages = currentFeatured.filter((url: string) => url !== imageUrl)

    // Update database
    const { error: updateError } = await supabase
      .from("providers")
      .update({
        portfolio_files: updatedPortfolioImages,
        featured_images: updatedFeaturedImages,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (updateError) {
      console.error("Portfolio delete error:", updateError)
      return NextResponse.json({ error: "Failed to delete image" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Image deleted successfully",
      remainingImages: updatedPortfolioImages.length,
    })
  } catch (error) {
    console.error("Portfolio delete error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId, featuredImages } = await request.json()

    if (!userId || !Array.isArray(featuredImages)) {
      return NextResponse.json({ error: "User ID and featured images array are required" }, { status: 400 })
    }

    if (featuredImages.length > 2) {
      return NextResponse.json({ error: "Maximum 2 featured images allowed" }, { status: 400 })
    }

    // Update featured images
    const { error: updateError } = await supabase
      .from("providers")
      .update({
        featured_images: featuredImages,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (updateError) {
      console.error("Featured images update error:", updateError)
      return NextResponse.json({ error: "Failed to update featured images" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Featured images updated successfully",
      featuredImages,
    })
  } catch (error) {
    console.error("Featured images update error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
