"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Receipt,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { update } = useSession()
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  )
  const [message, setMessage] = useState("")
  const [planName, setPlanName] = useState("")
  const [countdown, setCountdown] = useState(5)
  const hasCalledRef = useRef(false)

  const reference = searchParams.get("reference") || searchParams.get("trxref")

  useEffect(() => {
    if (!reference) {
      setStatus("error")
      setMessage("No payment reference found. Please contact support.")
      return
    }

    if (hasCalledRef.current) return
    hasCalledRef.current = true

    let timer: NodeJS.Timeout

    const verifyPayment = async () => {
      try {
        const response = await fetch(
          `/api/payments/verify?reference=${reference}`
        )
        const data = await response.json()

        if (data.success) {
          setStatus("success")
          setMessage("Your subscription is now active. Welcome aboard!")
          setPlanName(data.subscription?.plan?.displayName || "")
          toast.success("Payment verified! Your plan is now active.")

          // Refresh session to pick up workspace/plan changes
          await update()

          // Countdown to dashboard redirect
          let count = 5
          timer = setInterval(() => {
            count -= 1
            setCountdown(count)
            if (count <= 0) {
              clearInterval(timer)
              router.push("/dashboard")
            }
          }, 1000)
        } else {
          setStatus("error")
          setMessage(
            data.message || "Payment verification failed. Please contact support."
          )
          toast.error(data.message || "Payment verification failed")
        }
      } catch (error) {
        setStatus("error")
        setMessage(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        )
        toast.error("Verification error. Please try again.")
      }
    }

    verifyPayment()

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [reference, router, update])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      {/* Logo */}
      <div className="relative z-10 mb-8 flex items-center gap-2.5">
        <Image
          src="/mizani_logo.png"
          alt="Mizani Systems"
          width={36}
          height={36}
          className="h-9 w-9 object-contain rounded-lg border border-border shadow-sm"
        />
        <span className="text-base font-bold tracking-tight text-foreground">Mizani Systems</span>
      </div>

      <Card className="relative z-10 w-full max-w-md overflow-hidden border-border/60 shadow-xl">
        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            {status === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center gap-5 py-4"
              >
                <div className="relative flex h-20 w-20 items-center justify-center">
                  <div className="absolute h-full w-full animate-ping rounded-full bg-primary/10" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                </div>
                <div className="text-center">
                  <h1 className="text-xl font-bold text-foreground">
                    Verifying Payment
                  </h1>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Please wait while we confirm your payment with Paystack…
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-border/50 bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                  Communicating with Paystack
                </div>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-5 py-4"
              >
                <div className="relative flex h-20 w-20 items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10"
                  >
                    <CheckCircle2 className="h-9 w-9 text-emerald-500" />
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3 }}
                    className="absolute -right-1 -top-1"
                  >
                    <Sparkles className="h-5 w-5 text-amber-400" />
                  </motion.div>
                </div>

                <div className="text-center">
                  <motion.h1
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-2xl font-bold text-foreground"
                  >
                    Payment Successful!
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="mt-2 text-sm text-muted-foreground"
                  >
                    {message}
                  </motion.p>
                </div>

                {planName && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="flex w-full items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3"
                  >
                    <Receipt className="h-4 w-4 shrink-0 text-emerald-600" />
                    <div>
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        Active Plan
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {planName}
                      </p>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  className="flex w-full flex-col gap-3"
                >
                  <p className="text-center text-xs text-muted-foreground">
                    Redirecting to dashboard in{" "}
                    <span className="font-semibold text-foreground">
                      {countdown}s
                    </span>
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/dashboard">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-5 py-4"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                  <AlertCircle className="h-9 w-9 text-red-500" />
                </div>

                <div className="text-center">
                  <h1 className="text-xl font-bold text-foreground">
                    Payment Failed
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {message}
                  </p>
                </div>

                <div className="flex w-full flex-col gap-2">
                  <Button asChild variant="destructive" className="w-full">
                    <Link href="/onboarding">Try Again</Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full">
                    <Link href="/dashboard">Skip for Now</Link>
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <p className="relative z-10 mt-6 text-center text-xs text-muted-foreground">
        Payments are secured by{" "}
        <span className="font-medium text-foreground">Paystack</span>. Need help?{" "}
        <Link href="mailto:support@mizanisystems.com" className="underline hover:text-foreground">
          Contact support
        </Link>
      </p>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
