"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CreditCard, RefreshCw } from "lucide-react"

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  created: number
  metadata: {
    photographerId?: string
    clientName?: string
    bookingType?: string
    bookingDate?: string
  }
}

interface PaymentDashboardProps {
  customerEmail: string
}

export function PaymentDashboard({ customerEmail }: PaymentDashboardProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/payments?email=${encodeURIComponent(customerEmail)}`)

      if (!response.ok) {
        throw new Error("Failed to fetch payments")
      }

      const data = await response.json()
      setPayments(data.payments || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payments")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (customerEmail) {
      fetchPayments()
    }
  }, [customerEmail])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "succeeded":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "requires_payment_method":
        return "bg-red-100 text-red-800"
      case "canceled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading payments...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-800">{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Payment History</h2>
        <Button onClick={fetchPayments} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {payments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No payments found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {payments.map((payment) => (
            <Card key={payment.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{payment.metadata.bookingType || "Photography Booking"}</CardTitle>
                  <Badge className={getStatusColor(payment.status)}>
                    {payment.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
                <CardDescription>Payment ID: {payment.id}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-600">Amount</p>
                    <p className="text-lg font-bold">{formatAmount(payment.amount, payment.currency)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Date</p>
                    <p>{formatDate(payment.created)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Client</p>
                    <p>{payment.metadata.clientName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Event Date</p>
                    <p>{payment.metadata.bookingDate || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
