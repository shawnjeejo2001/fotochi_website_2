import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  console.log("Provider registration API called")

  try {
    // Set proper content type for the response
    const headers = {
      "Content-Type": "application/json",
    }

    // Parse form data
    const formData = await request.formData()
    console.log("Form data received, fields:", Array.from(formData.keys()))

    // Extract basic fields
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string
    const service = formData.get("service") as string
    const dob = formData.get("dob") as string
    const mainStyle = formData.get("mainStyle") as string
    const additionalStyle1 = formData.get("additionalStyle1") as string
    const additionalStyle2 = formData.get("additionalStyle2") as string
    const location = formData.get("location") as string
    const aboutText = formData.get("aboutText") as string

    console.log("Basic fields extracted:", { email, name, service, location })

    // Validate required fields
    if (!email || !password || !name || !service) {
      console.error("Missing required fields")
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    // Validate portfolio images (must have exactly 3)
    const portfolioFiles: File[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("portfolio_") && value instanceof File) {
        portfolioFiles.push(value as File)
      }
    }

    if (portfolioFiles.length !== 3) {
      return NextResponse.json(
        { success: false, message: "Exactly 3 portfolio images are required for application" },
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    // Initialize Supabase client
    const supabase = createServerSupabaseClient()

    // Step 1: Create user in Supabase Auth
    console.log("Creating auth user...")
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        user_type: "provider",
        full_name: name,
      },
    })

    if (authError) {
      console.error("Auth user creation failed:", authError)
      return NextResponse.json(
        { success: false, message: `Failed to create user account: ${authError.message}` },
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    if (!authData?.user) {
      console.error("No user returned from auth creation")
      return NextResponse.json(
        { success: false, message: "Failed to create user account" },
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }

    console.log("Auth user created successfully:", authData.user.id)

    // Step 2: Process the 3 required portfolio images
    const portfolioUrls: string[] = []
    for (let i = 0; i < portfolioFiles.length; i++) {
      const file = portfolioFiles[i]
      // For now, create placeholder URLs - in production you'd upload to storage
      const placeholderUrl = `/placeholder.svg?height=600&width=800&text=Portfolio${i + 1}-${encodeURIComponent(file.name)}`
      portfolioUrls.push(placeholderUrl)
    }

    // Step 3: Create provider profile
    console.log("Creating provider profile...")
    const { data: providerData, error: providerError } = await supabase
      .from("providers")
      .insert({
        user_id: authData.user.id,
        name,
        service,
        dob: dob || null,
        main_style: mainStyle || null,
        additional_style1: additionalStyle1 === "none" ? null : additionalStyle1,
        additional_style2: additionalStyle2 === "none" ? null : additionalStyle2,
        location: location || null,
        about_text: aboutText || null,
        portfolio_files: portfolioUrls,
        profile_image: portfolioUrls[0], // Use first portfolio image as profile
        featured_images: [portfolioUrls[0], portfolioUrls[1]], // First 2 images as featured
        status: "pending",
        subscription_plan: "starter",
        is_active: false,
        max_portfolio_images: 5, // Starter plan limit
      })
      .select()
      .single()

    if (providerError) {
      console.error("Provider profile creation failed:", providerError)

      // Clean up: Delete the auth user if profile creation fails
      try {
        await supabase.auth.admin.deleteUser(authData.user.id)
      } catch (cleanupError) {
        console.error("Failed to clean up auth user:", cleanupError)
      }

      return NextResponse.json(
        { success: false, message: `Failed to create provider profile: ${providerError.message}` },
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    console.log("Provider profile created successfully:", providerData?.id)

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully! We'll review it and get back to you soon.",
        user: {
          id: authData.user.id,
          email: authData.user.email,
          userType: "provider",
        },
        profile: providerData,
      },
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error("Unexpected error in provider registration:", error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}

// GET method to fetch providers for admin
export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const { data: providers, error } = await supabase
      .from("providers")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching providers:", error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }

    return NextResponse.json({ success: true, providers }, { headers: { "Content-Type": "application/json" } })
  } catch (error) {
    console.error("Error in GET providers:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
