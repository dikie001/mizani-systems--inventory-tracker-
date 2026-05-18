"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  )
  const [message, setMessage] = useState("")

  const reference = searchParams.get("reference")

  useEffect(() => {
    if (!reference) {
      setStatus("error")
      setMessage("No payment reference found")
      return
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch(
          `/api/payments/verify?reference=${reference}`
        )
        const data = await response.json()

        if (data.success) {
          setStatus("success")
          setMessage("Payment verified successfully!")
          toast.success("Payment completed successfully!")

          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push("/dashboard")
          }, 3000)
        } else {
          setStatus("error")
          setMessage(data.message || "Payment verification failed")
          toast.error(data.message || "Payment verification failed")
        }
      } catch (error) {
        setStatus("error")
        setMessage(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        )
        toast.error("Verification error")
      }
    }

    verifyPayment()
  }, [reference, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-6">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center space-y-4 pt-6">
          {status === "loading" && (
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          )}
          {status === "success" && (
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          )}
          {status === "error" && (
            <AlertCircle className="h-12 w-12 text-red-500" />
          )}

          <CardTitle>
            {status === "loading" && "Verifying Payment..."}
            {status === "success" && "Payment Successful"}
            {status === "error" && "Payment Failed"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            {message}
          </p>

          {status !== "loading" && (
            <div className="space-y-2">
              {status === "success" && (
                <p className="text-center text-xs text-muted-foreground">
                  Redirecting to dashboard in 3 seconds...
                </p>
              )}

              <Button
                asChild
                className="w-full"
                variant={status === "success" ? "default" : "destructive"}
              >
                <Link href="/dashboard">
                  {status === "success" ? "Go to Dashboard" : "Try Again"}
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
