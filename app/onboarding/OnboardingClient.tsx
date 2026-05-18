"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Building2,
  Package,
  TrendingUp,
  Check,
  Loader2,
  Store,
  Factory,
  Briefcase,
  Layers,
  ChevronRight,
  Sparkles,
  CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createWorkspace } from "@/lib/actions/workspace"
import { getPlanById, formatKES } from "@/lib/plans"
import { toast } from "sonner"

const steps = [
  {
    id: "name",
    title: "Welcome to StockVault",
    description: "Let's start with your business name.",
    icon: <Sparkles className="h-4 w-4 text-primary" />,
  },
  {
    id: "type",
    title: "Business Type",
    description: "What kind of business are you running?",
    icon: <Building2 className="h-4 w-4 text-primary" />,
  },
  {
    id: "size",
    title: "Inventory Size",
    description: "How many products do you plan to manage?",
    icon: <Package className="h-4 w-4 text-primary" />,
  },
  {
    id: "goals",
    title: "Your Goals",
    description: "What are your primary objectives?",
    icon: <TrendingUp className="h-4 w-4 text-primary" />,
  },
]

const businessTypes = [
  { id: "retail", label: "Retail", icon: <Store className="h-4 w-4" /> },
  {
    id: "manufacturing",
    label: "Manufacturing",
    icon: <Factory className="h-4 w-4" />,
  },
  { id: "wholesale", label: "Wholesale", icon: <Layers className="h-4 w-4" /> },
  {
    id: "services",
    label: "Services",
    icon: <Briefcase className="h-4 w-4" />,
  },
]

const inventorySizes = [
  { id: "small", label: "1 – 100", description: "Just starting out" },
  { id: "medium", label: "100 – 1,000", description: "Growing business" },
  {
    id: "large",
    label: "1,000 – 10,000",
    description: "Established enterprise",
  },
  { id: "enterprise", label: "10,000+", description: "Large scale operations" },
]

const goalOptions = [
  { id: "tracking", label: "Inventory Tracking" },
  { id: "sales", label: "Sales Management" },
  { id: "analytics", label: "Business Analytics" },
  { id: "low-stock", label: "Low Stock Alerts" },
]

interface OnboardingClientProps {
  initialWorkspaceId?: string
  initialWorkspaceName?: string
  initialPlanName?: string
  initialBusinessType?: string
  initialInventorySize?: string
}

export default function OnboardingClient({
  initialWorkspaceId,
  initialWorkspaceName,
  initialPlanName,
  initialBusinessType,
  initialInventorySize,
}: OnboardingClientProps) {
  const { update } = useSession()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    name: initialWorkspaceName || "",
    businessType: initialBusinessType || "",
    inventorySize: initialInventorySize || "",
    goals: [] as string[],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPlanConfirmation, setShowPlanConfirmation] = useState(!!initialWorkspaceId)
  const [workspaceData, setWorkspaceData] = useState<{
    workspaceId: string
    workspaceName: string
  } | null>(
    initialWorkspaceId && initialWorkspaceName
      ? { workspaceId: initialWorkspaceId, workspaceName: initialWorkspaceName }
      : null
  )

  const [activePlanId, setActivePlanId] = useState<string>("trial")

  useEffect(() => {
    const urlPlan = searchParams.get("plan") || initialPlanName
    if (urlPlan) {
      setActivePlanId(urlPlan)
      sessionStorage.setItem("selectedPlan", urlPlan)
    } else {
      const stored = sessionStorage.getItem("selectedPlan")
      if (stored) {
        setActivePlanId(stored)
      }
    }
  }, [searchParams, initialPlanName])

  const selectedPlan = getPlanById(activePlanId)

  const canAdvance =
    (currentStep === 0 && !!formData.name.trim()) ||
    (currentStep === 1 && !!formData.businessType) ||
    (currentStep === 2 && !!formData.inventorySize) ||
    currentStep === 3

  const handleCreateWorkspace = useCallback(async () => {
    if (!formData.name || !formData.businessType || !formData.inventorySize) {
      toast.error("Please fill in all details.")
      return
    }
    setIsSubmitting(true)
    try {
      const result = await createWorkspace({
        ...formData,
        planId: selectedPlan?.id,
      })
      if (result.success) {
        setWorkspaceData({
          workspaceId: result.workspaceId!,
          workspaceName: result.workspaceName!,
        })

        // Show plan confirmation if there's a paid plan
        if (selectedPlan && selectedPlan.monthlyPrice > 0) {
          setShowPlanConfirmation(true)
        } else {
          // Free plan or trial - complete immediately
          await update({
            workspaceId: result.workspaceId!,
            workspaceName: result.workspaceName!,
          })
          toast.success("Workspace created successfully!")
          window.location.href = "/dashboard"
        }
      } else {
        toast.error(result.error || "Failed to create workspace")
      }
    } catch {
      toast.error("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, update, selectedPlan])

  const handleConfirmPlan = useCallback(async () => {
    if (!workspaceData || !selectedPlan) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan.id,
          workspaceId: workspaceData.workspaceId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize payment")
      }

      if (data.authorizationUrl) {
        // Redirect to Paystack payment page
        window.location.href = data.authorizationUrl
      } else {
        // Free plan confirmed
        await update({
          workspaceId: workspaceData.workspaceId,
          workspaceName: workspaceData.workspaceName,
        })
        toast.success("Plan confirmed!")
        window.location.href = "/dashboard"
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to confirm plan"
      )
      setIsSubmitting(false)
    }
  }, [workspaceData, selectedPlan, update])

  const handleNext = useCallback(() => {
    if (!canAdvance) return
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1)
    } else {
      handleCreateWorkspace()
    }
  }, [canAdvance, currentStep, handleCreateWorkspace])

  // Enter key support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleNext()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [handleNext])

  const toggleGoal = (goalId: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter((g) => g !== goalId)
        : [...prev.goals, goalId],
    }))
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 selection:bg-primary/30">
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 h-1/2 w-1/2 rounded-full bg-primary/8 blur-[100px]" />
        <div className="absolute -right-1/4 -bottom-1/4 h-1/2 w-1/2 rounded-full bg-blue-500/8 blur-[100px]" />
      </div>

      {showPlanConfirmation && selectedPlan && workspaceData ? (
        // Beautiful Premium Split Layout Confirmation Screen
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-4xl px-4"
        >
          {/* Header */}
          <div className="text-center mb-8 space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Complete Your Subscription
            </h1>
            <p className="text-base text-slate-400 max-w-xl mx-auto">
              You're just one step away from launching your new workspace, <span className="text-primary font-semibold">{workspaceData.workspaceName}</span>. Confirm your selected plan below to proceed.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-5 items-stretch">
            {/* Left side: Workspace & Onboarding summary (2 cols) */}
            <Card className="md:col-span-2 overflow-hidden border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl flex flex-col justify-between p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">Workspace Setup</span>
                  <h3 className="text-xl font-bold text-white">{workspaceData.workspaceName}</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-white/5 p-2 shrink-0 border border-white/10">
                      <Building2 className="h-4 w-4 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-slate-400">Business Type</h4>
                      <p className="text-sm font-semibold text-white capitalize">{formData.businessType || "Retail"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-white/5 p-2 shrink-0 border border-white/10">
                      <Layers className="h-4 w-4 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-slate-400">Inventory Size</h4>
                      <p className="text-sm font-semibold text-white capitalize">{formData.inventorySize || "1 - 100 SKUs"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-white/5 p-2 shrink-0 border border-white/10">
                      <Check className="h-4 w-4 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-slate-400">Setup Status</h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                        <p className="text-xs font-semibold text-yellow-500 capitalize">Payment Pending</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <p className="text-xs text-slate-500">
                  By clicking proceed, you will be redirected to Paystack for a secure and encrypted payment transaction.
                </p>
              </div>
            </Card>

            {/* Right side: Premium Selected Plan (3 cols) */}
            <Card className="md:col-span-3 overflow-hidden border-primary/40 bg-card/40 shadow-2xl backdrop-blur-xl ring-2 ring-primary/20 flex flex-col justify-between p-8 relative">
              <div className="absolute top-0 right-0 p-4">
                <Badge className="bg-primary text-slate-950 font-bold px-3 py-1 flex gap-1 items-center shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                  Your Selected Plan
                </Badge>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-white">{selectedPlan.displayName} Plan</h3>
                  <p className="text-sm text-slate-400 mt-1">{selectedPlan.description}</p>
                </div>

                <div className="flex items-baseline text-4xl font-extrabold text-white">
                  {formatKES(selectedPlan.monthlyPrice)}
                  <span className="ml-1 text-base font-medium text-slate-400">/month</span>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Included Features:</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {selectedPlan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0 bg-primary/10 p-0.5 rounded-full" />
                        <span className="text-slate-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-8 border-t border-white/10 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setShowPlanConfirmation(false)}
                  className="h-12 flex-1 rounded-xl text-slate-400 border border-white/10 hover:bg-white/5 hover:text-white transition-all"
                  disabled={isSubmitting}
                >
                  Back to Setup
                </Button>
                <Button
                  onClick={handleConfirmPlan}
                  disabled={isSubmitting}
                  className="h-12 flex-1 rounded-xl bg-primary text-slate-950 font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 fill-current" />
                      Proceed to Checkout
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </motion.div>
      ) : (
        // Onboarding Steps
        <div className="relative w-full max-w-md">
        {/* Header: icon + title + description */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`header-${currentStep}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mb-4 flex items-center gap-2.5"
          >
            <div className="shrink-0 rounded-lg border border-primary/20 bg-primary/10 p-2">
              {steps[currentStep].icon}
            </div>
            <div>
              <h1 className="text-lg leading-tight font-semibold text-white">
                {steps[currentStep].title}
              </h1>
              <p className="text-xs leading-snug text-slate-400">
                {steps[currentStep].description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress pills */}
        <div className="mb-4 flex gap-1.5">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className="h-1 flex-1 overflow-hidden rounded-full bg-white/10"
            >
              <motion.div
                className="h-full rounded-full bg-primary"
                animate={{ width: idx <= currentStep ? "100%" : "0%" }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
            </div>
          ))}
        </div>

        {/* Card */}
        <Card className="overflow-hidden border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 16, filter: "blur(6px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -16, filter: "blur(6px)" }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="p-5"
            >
              {/* Step 0: Business name */}
              {currentStep === 0 && (
                <div className="group relative">
                  <Input
                    autoFocus
                    placeholder="e.g. Acme Corporation"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="h-10 border-white/10 bg-white/5 px-3 text-sm text-white transition-all placeholder:text-slate-500 focus:border-primary/60 focus:ring-primary/20"
                  />
                  <div className="absolute top-1/2 right-3 -translate-y-1/2 opacity-0 transition-opacity group-focus-within:opacity-100">
                    <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                      ↵
                    </kbd>
                  </div>
                </div>
              )}

              {/* Step 1: Business type */}
              {currentStep === 1 && (
                <div className="grid grid-cols-2 gap-2">
                  {businessTypes.map((type) => {
                    const active = formData.businessType === type.id
                    return (
                      <button
                        key={type.id}
                        onClick={() =>
                          setFormData({ ...formData, businessType: type.id })
                        }
                        className={`flex items-center gap-2.5 rounded-xl border px-3 py-3 text-left transition-all duration-200 ${
                          active
                            ? "border-primary/60 bg-primary/15 text-white"
                            : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/8"
                        }`}
                      >
                        <div
                          className={`shrink-0 transition-colors ${active ? "text-primary" : "text-slate-500"}`}
                        >
                          {type.icon}
                        </div>
                        <span className="text-sm font-medium">
                          {type.label}
                        </span>
                        {active && (
                          <div className="ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary">
                            <Check className="h-2.5 w-2.5 stroke-3 text-slate-950" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Step 2: Inventory size */}
              {currentStep === 2 && (
                <div className="space-y-2">
                  {inventorySizes.map((size) => {
                    const active = formData.inventorySize === size.id
                    return (
                      <button
                        key={size.id}
                        onClick={() =>
                          setFormData({ ...formData, inventorySize: size.id })
                        }
                        className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-all duration-200 ${
                          active
                            ? "border-primary/60 bg-primary/15"
                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
                        }`}
                      >
                        <div>
                          <div
                            className={`text-sm font-medium ${active ? "text-white" : "text-slate-200"}`}
                          >
                            {size.label}
                          </div>
                          <div className="text-xs text-slate-500">
                            {size.description}
                          </div>
                        </div>
                        <div
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${
                            active
                              ? "border-primary bg-primary"
                              : "border-white/20"
                          }`}
                        >
                          {active && (
                            <Check className="h-2.5 w-2.5 stroke-3 text-slate-950" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Step 3: Goals */}
              {currentStep === 3 && (
                <div className="grid grid-cols-2 gap-2">
                  {goalOptions.map((goal) => {
                    const active = formData.goals.includes(goal.id)
                    return (
                      <button
                        key={goal.id}
                        onClick={() => toggleGoal(goal.id)}
                        className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-all duration-200 ${
                          active
                            ? "border-primary/60 bg-primary/15 text-white"
                            : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/8"
                        }`}
                      >
                        <span className="text-sm font-medium">
                          {goal.label}
                        </span>
                        <div
                          className={`ml-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all ${
                            active
                              ? "border-primary bg-primary"
                              : "border-white/20"
                          }`}
                        >
                          {active && (
                            <Check className="h-2.5 w-2.5 stroke-[3] text-slate-950" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Navigation */}
              <div className="mt-4 flex gap-2">
                {currentStep > 0 && (
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentStep((s) => s - 1)}
                    className="h-9 rounded-lg px-4 text-xs text-slate-400 transition-all hover:bg-white/5 hover:text-white"
                  >
                    Back
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={isSubmitting || !canAdvance}
                  className="h-9 flex-1 rounded-lg bg-primary text-sm font-semibold text-slate-950 shadow-[0_0_20px_rgba(var(--primary),0.25)] transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-40"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {currentStep === steps.length - 1
                        ? "Complete Setup"
                        : "Continue"}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </Card>

        {/* Footer */}
        <p className="mt-3 text-center text-xs text-slate-600">
          Step {currentStep + 1} of {steps.length} · Secure & Encrypted
        </p>
      </div>
      )}
    </div>
  )
}
