import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Profile picture upload started")

    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string
    const userType = (formData.get("userType") as string) || "provider"

    console.log("📝 Request data:", {
      fileName: file?.name,
      fileSize: file?.size,
      userId: userId?.substring(0, 8) + "...",
      userType,
    })

    if (!file || !userId) {
      return NextResponse.json({ error: "Missing file or userId" }, { status: 400 })
    }

    // Upload to storage
    const fileName = `profile-${userId}-${Date.now()}.${file.name.split(".").pop()}`
    console.log("📤 Uploading to storage:", fileName)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("profilepictures")
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      console.log("❌ Storage upload error:", uploadError)
      return NextResponse.json({ error: "Upload failed", details: uploadError }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("profilepictures").getPublicUrl(fileName)
    console.log("🔗 Public URL:", publicUrl)

    // Update based on user type using your actual schema
    let updateResult = null
    let updateError = null

    if (userType === "provider") {
      console.log("👨‍💼 Updating provider profile...")

      // Try the custom SQL function first
      const { data: sqlResult, error: sqlError } = await supabase.rpc("update_provider_profile_image", {
        p_user_id: userId,
        p_profile_image: publicUrl,
      })

      if (sqlResult && sqlResult.length > 0) {
        console.log("✅ SQL function SUCCESS:", sqlResult)
        updateResult = sqlResult[0]
      } else {
        // Fallback: direct update
        const { data: directResult, error: directError } = await supabase
          .from("providers")
          .update({ profile_image: publicUrl, updated_at: new Date().toISOString() })
          .eq("user_id", userId)
          .select()

        if (directResult && directResult.length > 0) {
          console.log("✅ Direct update SUCCESS:", directResult)
          updateResult = directResult[0]
        } else {
          updateError = directError || sqlError
        }
      }
    } else if (userType === "client") {
      console.log("👤 Updating client profile...")

      const { data: clientResult, error: clientError } = await supabase
        .from("clients")
        .update({ profile_image: publicUrl, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .select()

      if (clientResult && clientResult.length > 0) {
        console.log("✅ Client update SUCCESS:", clientResult)
        updateResult = clientResult[0]
      } else {
        updateError = clientError
      }
    }

    if (!updateResult) {
      console.log("❌ Database update failed:", updateError)
      return NextResponse.json(
        {
          error: "Failed to update profile in database",
          details: updateError,
          publicUrl, // Still return the URL so user knows file was uploaded
        },
        { status: 500 },
      )
    }

    console.log("🎉 Profile picture updated successfully!")
    return NextResponse.json({
      success: true,
      profileImage: publicUrl,
      data: updateResult,
    })
  } catch (error) {
    console.log("💥 Unexpected error:", error)
    return NextResponse.json(
      {
        error: "Server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
