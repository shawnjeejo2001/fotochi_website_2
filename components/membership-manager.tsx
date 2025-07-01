"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, Crown, Zap, ImageIcon, Calendar, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSupabaseClient } from "@supabase/auth-helpers-react"

interface MembershipManagerProps {
  userId: string
}

interface SubscriptionInfo {
  currentPlan: string
  billingCycleDate: string | null
  pendingPlanChange: string | null
  maxPortfolioImages: number
  pendingChange: any
}

export default function MembershipManager({ userId }: MembershipManagerProps) {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchSubscriptionInfo()
  }, [userId])

  const fetchSubscriptionInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/photographers/subscription?userId=${userId}`)
      const data = await response.json()

      if (response.ok) {
        setSubscriptionInfo(data)
      } else {
        setError(data.error || "Failed to load subscription info")
      }
    } catch (err) {
      setError("Failed to load subscription info")
    } finally {
      setLoading(false)
    }
  }

  const handlePlanChange = async (newPlan: string) => {
    if (!subscriptionInfo) return

    setUpdating(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/photographers/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          newPlan,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        if (result.requiresPayment) {
          // Redirect to payment page for new paid subscriptions
          router.push(`/payment?plan=${newPlan}&userId=${userId}`)
        } else {
          setSuccess(result.message)
          fetchSubscriptionInfo() // Refresh subscription info
        }
      } else {
        setError(result.error || "Failed to update subscription")
      }
    } catch (err) {
      setError("Failed to update subscription")
    } finally {
      setUpdating(false)
    }
  }

  const plans = [
    {
      name: "Starter",
      id: "starter",
      price: "Free",
      images: 5,
      features: ["Basic profile listing", "Up to 5 portfolio images", "Client messaging", "5% service fee"],
      icon: <ImageIcon className="w-6 h-6" />,
      color: "border-gray-200",
      buttonColor: "bg-gray-600 hover:bg-gray-700",
    },
    {
      name: "Professional",
      id: "professional",
      price: "$29/month",
      images: 25,
      features: [
        "Featured profile placement",
        "Up to 25 portfolio images",
        "Priority customer support",
        "3% service fee",
        "Analytics dashboard",
      ],
      icon: <Zap className="w-6 h-6 text-blue-600" />,
      color: "border-blue-200",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      popular: true,
    },
    {
      name: "Premium",
      id: "premium",
      price: "$99/month",
      images: 100,
      features: [
        "Top search placement",
        "Up to 100 portfolio images",
        "Dedicated account manager",
        "1% service fee",
        "Custom branding options",
      ],
      icon: <Crown className="w-6 h-6 text-purple-600" />,
      color: "border-purple-200",
      buttonColor: "bg-purple-600 hover:bg-purple-700",
    },
  ]

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">Loading subscription info...</div>
        </CardContent>
      </Card>
    )
  }

  if (!subscriptionInfo) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-red-600">Failed to load subscription information</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold capitalize">{subscriptionInfo.currentPlan} Plan</h3>
                <p className="text-gray-600">{subscriptionInfo.maxPortfolioImages} portfolio images included</p>
              </div>
              <Badge variant="outline" className="capitalize">
                {subscriptionInfo.currentPlan}
              </Badge>
            </div>

            {subscriptionInfo.billingCycleDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Next billing date: {new Date(subscriptionInfo.billingCycleDate).toLocaleDateString()}</span>
              </div>
            )}

            {subscriptionInfo.pendingPlanChange && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-800">
                  <strong>Pending Plan Change:</strong> Your plan will change to{" "}
                  <span className="capitalize">{subscriptionInfo.pendingPlanChange}</span> on your next billing date:{" "}
                  {subscriptionInfo.billingCycleDate
                    ? new Date(subscriptionInfo.billingCycleDate).toLocaleDateString()
                    : "TBD"}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Plan Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${plan.color} ${
              subscriptionInfo.currentPlan === plan.id ? "ring-2 ring-blue-500" : ""
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600">Most Popular</Badge>
            )}

            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">{plan.icon}</div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="text-2xl font-bold">{plan.price}</div>
              <p className="text-sm text-gray-600">{plan.images} portfolio images</p>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${plan.buttonColor}`}
                onClick={() => handlePlanChange(plan.id)}
                disabled={updating || subscriptionInfo.currentPlan === plan.id}
              >
                {updating
                  ? "Processing..."
                  : subscriptionInfo.currentPlan === plan.id
                    ? "Current Plan"
                    : subscriptionInfo.currentPlan === "starter" && plan.id !== "starter"
                      ? "Upgrade Now"
                      : "Select Plan"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Feature</th>
                  <th className="text-center py-2">Starter</th>
                  <th className="text-center py-2">Professional</th>
                  <th className="text-center py-2">Premium</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                <tr className="border-b">
                  <td className="py-2">Portfolio Images</td>
                  <td className="text-center py-2">5</td>
                  <td className="text-center py-2">25</td>
                  <td className="text-center py-2">100</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Service Fee</td>
                  <td className="text-center py-2">5%</td>
                  <td className="text-center py-2">3%</td>
                  <td className="text-center py-2">1%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Profile Placement</td>
                  <td className="text-center py-2">Basic</td>
                  <td className="text-center py-2">Featured</td>
                  <td className="text-center py-2">Top</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Customer Support</td>
                  <td className="text-center py-2">Standard</td>
                  <td className="text-center py-2">Priority</td>
                  <td className="text-center py-2">Dedicated</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
