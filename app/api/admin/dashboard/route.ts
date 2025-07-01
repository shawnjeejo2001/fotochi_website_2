import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Get total photographers
    const { count: photographersCount } = await supabase
      .from("photographers")
      .select("*", { count: "exact", head: true })

    // Get total clients
    const { count: clientsCount } = await supabase.from("clients").select("*", { count: "exact", head: true })

    // Get total bookings
    const { count: bookingsCount } = await supabase.from("bookings").select("*", { count: "exact", head: true })

    // Get pending bookings
    const { count: pendingBookingsCount } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")

    // Get completed bookings
    const { count: completedBookingsCount } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")

    // Get total revenue
    const { data: revenueData } = await supabase.from("bookings").select("amount").eq("status", "completed")

    const totalRevenue = revenueData?.reduce((sum, booking) => sum + (booking.amount || 0), 0) || 0

    // Get average rating (mock data for now)
    const averageRating = 4.7

    // Calculate monthly growth (mock data for now)
    const monthlyGrowth = 12

    // Get recent activity
    const { data: recentBookings } = await supabase
      .from("bookings")
      .select(`
        id,
        status,
        created_at,
        event_type,
        photographers (
          name
        ),
        clients (
          user_id
        )
      `)
      .order("created_at", { ascending: false })
      .limit(10)

    // Format recent activity
    const recentActivity =
      recentBookings?.map((booking) => ({
        id: booking.id,
        type: "booking" as const,
        message: `New ${booking.event_type} booking with ${booking.photographers?.name || "photographer"}`,
        timestamp: new Date(booking.created_at).toLocaleDateString(),
        status: booking.status,
      })) || []

    const stats = {
      totalPhotographers: photographersCount || 0,
      totalClients: clientsCount || 0,
      totalBookings: bookingsCount || 0,
      totalRevenue,
      pendingBookings: pendingBookingsCount || 0,
      completedBookings: completedBookingsCount || 0,
      averageRating,
      monthlyGrowth,
    }

    return NextResponse.json({
      success: true,
      stats,
      recentActivity,
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch dashboard data",
      stats: {
        totalPhotographers: 0,
        totalClients: 0,
        totalBookings: 0,
        totalRevenue: 0,
        pendingBookings: 0,
        completedBookings: 0,
        averageRating: 0,
        monthlyGrowth: 0,
      },
      recentActivity: [],
    })
  }
}
