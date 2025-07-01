import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { adminPassword, userId } = await request.json()

    // Verify admin password
    const ADMIN_PASSWORD = "admin123"
    if (adminPassword !== ADMIN_PASSWORD) {
      console.log("Delete attempt with invalid admin password")
      return NextResponse.json({ success: false, message: "Invalid admin password" }, { status: 401 })
    }

    const providerId = params.id
    console.log(`Admin delete request for provider: ${providerId}, user: ${userId}`)

    // First, get the provider details for logging
    const { data: provider, error: fetchError } = await supabase
      .from("providers")
      .select("name, users(email)")
      .eq("id", providerId)
      .single()

    if (fetchError) {
      console.error("Error fetching provider for deletion:", fetchError)
      return NextResponse.json({ success: false, message: "Provider not found" }, { status: 404 })
    }

    // Delete the provider first (this should cascade to related data)
    const { error: providerDeleteError } = await supabase.from("providers").delete().eq("id", providerId)

    if (providerDeleteError) {
      console.error("Error deleting provider:", providerDeleteError)
      return NextResponse.json({ success: false, message: "Failed to delete provider profile" }, { status: 500 })
    }

    // Delete the user account
    const { error: userDeleteError } = await supabase.auth.admin.deleteUser(userId)

    if (userDeleteError) {
      console.error("Error deleting user account:", userDeleteError)
      // Provider is already deleted, but log this for manual cleanup if needed
      console.log(`Provider ${providerId} deleted but user ${userId} deletion failed`)
    }

    // Also delete from users table if it exists
    const { error: userTableDeleteError } = await supabase.from("users").delete().eq("id", userId)

    if (userTableDeleteError) {
      console.error("Error deleting from users table:", userTableDeleteError)
    }

    console.log(`Successfully deleted provider: ${provider?.name} (${provider?.users?.email})`)

    return NextResponse.json({
      success: true,
      message: "User account deleted successfully",
    })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
