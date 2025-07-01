import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase with service role key for admin operations
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: NextRequest) {
  console.log("🚀 PROFILE PICTURE UPLOAD - DEBUG VERSION")

  try {
    // Parse form data
    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string
    const userType = formData.get("userType") as string

    console.log("📋 Upload details:", {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      userId: userId,
      userType,
    })

    // Validation
    if (!file || !userId || !userType) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Step 1: Upload to Supabase Storage
    console.log("📤 Uploading to storage...")

    const fileExt = file.name.split(".").pop() || "jpg"
    const fileName = `${userType}-${userId}-${Date.now()}.${fileExt}`
    const bucketName = "profilepictures"

    const { data: uploadData, error: uploadError } = await supabase.storage.from(bucketName).upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (uploadError) {
      console.log("❌ Storage upload failed:", uploadError)
      return NextResponse.json({ success: false, error: "Storage upload failed" }, { status: 500 })
    }

    console.log("✅ Storage upload successful:", uploadData.path)

    // Step 2: Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(fileName)
    console.log("🔗 Public URL:", publicUrl)

    // Step 3: DEBUG - Check what's in the database BEFORE update
    console.log("🔍 DEBUGGING - Checking database BEFORE update...")

    const tableName = userType === "provider" ? "providers" : "clients"

    // Check all possible ways to find the user
    const { data: allRecords } = await supabase.from(tableName).select("*")
    console.log(`📊 Total ${tableName} records:`, allRecords?.length)

    const { data: byUserId } = await supabase.from(tableName).select("*").eq("user_id", userId)
    console.log("🔍 Records by user_id:", byUserId)

    const { data: byId } = await supabase.from(tableName).select("*").eq("id", userId)
    console.log("🔍 Records by id:", byId)

    // Find the correct record
    let targetRecord = null
    if (byUserId && byUserId.length > 0) {
      targetRecord = byUserId[0]
      console.log("✅ Found by user_id:", targetRecord)
    } else if (byId && byId.length > 0) {
      targetRecord = byId[0]
      console.log("✅ Found by id:", targetRecord)
    } else {
      console.log("❌ NO RECORD FOUND!")
      return NextResponse.json(
        {
          success: false,
          error: "User record not found",
          debug: {
            userId,
            userType,
            tableName,
            byUserId,
            byId,
            allRecordsCount: allRecords?.length,
          },
        },
        { status: 404 },
      )
    }

    // Step 4: Update the database
    console.log("💾 Updating database with record ID:", targetRecord.id)

    const { data: updateResult, error: updateError } = await supabase
      .from(tableName)
      .update({
        profile_image: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetRecord.id)
      .select()

    console.log("📝 Update result:", updateResult)
    console.log("❌ Update error:", updateError)

    if (updateError) {
      return NextResponse.json(
        {
          success: false,
          error: "Database update failed",
          details: updateError,
          debug: {
            targetRecordId: targetRecord.id,
            publicUrl,
            tableName,
          },
        },
        { status: 500 },
      )
    }

    // Step 5: Verify the update
    console.log("🔍 Verifying update...")

    const { data: verifyResult, error: verifyError } = await supabase
      .from(tableName)
      .select("*")
      .eq("id", targetRecord.id)
      .single()

    console.log("✅ Verification result:", verifyResult)
    console.log("❌ Verification error:", verifyError)

    if (verifyResult && verifyResult.profile_image === publicUrl) {
      console.log("🎉 SUCCESS! Database verified!")

      return NextResponse.json({
        success: true,
        imageUrl: publicUrl,
        data: verifyResult,
        verified: true,
        message: "Profile picture uploaded and saved successfully",
        debug: {
          userId,
          userType,
          tableName,
          recordId: targetRecord.id,
          fileName,
          publicUrl,
          beforeUpdate: targetRecord,
          afterUpdate: verifyResult,
        },
      })
    } else {
      console.log("❌ Verification failed!")

      return NextResponse.json(
        {
          success: false,
          error: "Database verification failed",
          debug: {
            expected: publicUrl,
            actual: verifyResult?.profile_image,
            verifyResult,
            verifyError,
          },
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.log("💥 CRITICAL ERROR:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
