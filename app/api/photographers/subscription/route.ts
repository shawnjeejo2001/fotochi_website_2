import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// Get current subscription info
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { data: provider, error } = await supabase
      .from("providers")
      .select("subscription_plan, billing_cycle_date, pending_plan_change, max_portfolio_images")
      .eq("user_id", userId)
      .single()

    if (error || !provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 })
    }

    // Get pending plan changes
    const { data: pendingChanges } = await supabase
      .from("plan_changes")
      .select("*")
      .eq("provider_id", provider.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)

    return NextResponse.json({
      currentPlan: provider.subscription_plan,
      billingCycleDate: provider.billing_cycle_date,
      pendingPlanChange: provider.pending_plan_change,
      maxPortfolioImages: provider.max_portfolio_images,
      pendingChange: pendingChanges?.[0] || null,
    })
  } catch (error) {
    console.error("Error fetching subscription:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

// Update subscription plan
export async function POST(request: Request) {
  try {
    const { userId, newPlan } = await request.json()

    if (!userId || !newPlan) {
      return NextResponse.json({ error: "User ID and new plan are required" }, { status: 400 })
    }

    const validPlans = ["starter", "professional", "premium"]
    if (!validPlans.includes(newPlan)) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Get current provider info
    const { data: provider, error: providerError } = await supabase
      .from("providers")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (providerError || !provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 })
    }

    const currentPlan = provider.subscription_plan
    const billingCycleDate = provider.billing_cycle_date

    // If upgrading from starter (free) to paid plan
    if (currentPlan === "starter" && newPlan !== "starter") {
      // Set billing cycle date to today for new paid subscribers
      const today = new Date().toISOString().split("T")[0]

      // Get max images for new plan
      const maxImages = newPlan === "professional" ? 25 : newPlan === "premium" ? 100 : 5

      const { error: updateError } = await supabase
        .from("providers")
        .update({
          subscription_plan: newPlan,
          billing_cycle_date: today,
          max_portfolio_images: maxImages,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      if (updateError) {
        return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 })
      }

      return NextResponse.json({
        message: "Subscription upgraded successfully!",
        currentPlan: newPlan,
        billingCycleDate: today,
        maxImages,
        requiresPayment: true,
      })
    }

    // If changing between paid plans
    if (currentPlan !== "starter" && newPlan !== "starter" && billingCycleDate) {
      // Schedule plan change for next billing cycle
      const { data: planChange, error: planChangeError } = await supabase
        .from("plan_changes")
        .insert({
          provider_id: provider.id,
          current_plan: currentPlan,
          new_plan: newPlan,
          effective_date: billingCycleDate,
          status: "pending",
        })
        .select()
        .single()

      if (planChangeError) {
        return NextResponse.json({ error: "Failed to schedule plan change" }, { status: 500 })
      }

      // Update pending plan change
      await supabase
        .from("providers")
        .update({
          pending_plan_change: newPlan,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      return NextResponse.json({
        message: `Plan change scheduled successfully! Your plan will change to ${newPlan} on your next billing date: ${billingCycleDate}`,
        currentPlan,
        pendingPlan: newPlan,
        effectiveDate: billingCycleDate,
        requiresPayment: false,
      })
    }

    // If downgrading to starter
    if (newPlan === "starter") {
      const { error: updateError } = await supabase
        .from("providers")
        .update({
          subscription_plan: "starter",
          billing_cycle_date: null,
          pending_plan_change: null,
          max_portfolio_images: 5,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      if (updateError) {
        return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 })
      }

      return NextResponse.json({
        message: "Downgraded to starter plan",
        currentPlan: "starter",
        maxImages: 5,
        requiresPayment: false,
      })
    }

    return NextResponse.json({ error: "Invalid plan change request" }, { status: 400 })
  } catch (error) {
    console.error("Error updating subscription:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
