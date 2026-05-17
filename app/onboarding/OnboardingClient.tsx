"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { createWorkspace } from "@/lib/actions/workspace"
import { toast } from "sonner"

const steps = [
  {
    id: "name",
    title: "Welcome to StockVault",
    description: "Let's start with your business name.",
    icon: <Sparkles className="w-4 h-4 text-primary" />,
  },
  {
    id: "type",
    title: "Business Type",
    description: "What kind of business are you running?",
    icon: <Building2 className="w-4 h-4 text-primary" />,
  },
  {
    id: "size",
    title: "Inventory Size",
    description: "How many products do you plan to manage?",
    icon: <Package className="w-4 h-4 text-primary" />,
  },
  {
    id: "goals",
    title: "Your Goals",
    description: "What are your primary objectives?",
    icon: <TrendingUp className="w-4 h-4 text-primary" />,
  },
]

const businessTypes = [
  { id: "retail", label: "Retail", icon: <Store className="w-4 h-4" /> },
  { id: "manufacturing", label: "Manufacturing", icon: <Factory className="w-4 h-4" /> },
  { id: "wholesale", label: "Wholesale", icon: <Layers className="w-4 h-4" /> },
  { id: "services", label: "Services", icon: <Briefcase className="w-4 h-4" /> },
]

const inventorySizes = [
  { id: "small", label: "1 – 100", description: "Just starting out" },
  { id: "medium", label: "100 – 1,000", description: "Growing business" },
  { id: "large", label: "1,000 – 10,000", description: "Established enterprise" },
  { id: "enterprise", label: "10,000+", description: "Large scale operations" },
]

const goalOptions = [
  { id: "tracking", label: "Inventory Tracking" },
  { id: "sales", label: "Sales Management" },
  { id: "analytics", label: "Business Analytics" },
  { id: "low-stock", label: "Low Stock Alerts" },
]

export default function OnboardingClient() {
  const { update } = useSession()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    name: "",
    businessType: "",
    inventorySize: "",
    goals: [] as string[],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const canAdvance =
    (currentStep === 0 && !!formData.name.trim()) ||
    (currentStep === 1 && !!formData.businessType) ||
    (currentStep === 2 && !!formData.inventorySize) ||
    currentStep === 3

  const handleSubmit = useCallback(async () => {
    if (!formData.name || !formData.businessType || !formData.inventorySize) {
      toast.error("Please fill in all details.")
      return
    }
    setIsSubmitting(true)
    try {
      const result = await createWorkspace(formData)
      if (result.success) {
        await update({ workspaceId: result.workspaceId, workspaceName: result.workspaceName })
        toast.success("Workspace created successfully!")
        window.location.href = "/dashboard"
      } else {
        toast.error(result.error || "Failed to create workspace")
      }
    } catch {
      toast.error("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, update])

  const handleNext = useCallback(() => {
    if (!canAdvance) return
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1)
    } else {
      handleSubmit()
    }
  }, [canAdvance, currentStep, handleSubmit])

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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-primary/30">
      {/* Background glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/8 rounded-full blur-[100px]" />
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-500/8 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Header: icon + title + description */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`header-${currentStep}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex items-center gap-2.5 mb-4"
          >
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20 shrink-0">
              {steps[currentStep].icon}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white leading-tight">
                {steps[currentStep].title}
              </h1>
              <p className="text-slate-400 text-xs leading-snug">
                {steps[currentStep].description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress pills */}
        <div className="flex gap-1.5 mb-4">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex-1 h-1 rounded-full overflow-hidden bg-white/10">
              <motion.div
                className="h-full bg-primary rounded-full"
                animate={{ width: idx <= currentStep ? "100%" : "0%" }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
            </div>
          ))}
        </div>

        {/* Card */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
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
                <div className="relative group">
                  <Input
                    autoFocus
                    placeholder="e.g. Acme Corporation"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white/5 border-white/10 text-white h-10 text-sm px-3 focus:ring-primary/20 focus:border-primary/60 transition-all placeholder:text-slate-500"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                    <kbd className="bg-white/10 text-slate-500 px-1.5 py-0.5 rounded text-[10px] font-mono">↵</kbd>
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
                        onClick={() => setFormData({ ...formData, businessType: type.id })}
                        className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border text-left transition-all duration-200 ${
                          active
                            ? "bg-primary/15 border-primary/60 text-white"
                            : "bg-white/5 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/8"
                        }`}
                      >
                        <div className={`shrink-0 transition-colors ${active ? "text-primary" : "text-slate-500"}`}>
                          {type.icon}
                        </div>
                        <span className="text-sm font-medium">{type.label}</span>
                        {active && (
                          <div className="ml-auto shrink-0 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />
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
                        onClick={() => setFormData({ ...formData, inventorySize: size.id })}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all duration-200 ${
                          active
                            ? "bg-primary/15 border-primary/60"
                            : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/8"
                        }`}
                      >
                        <div>
                          <div className={`text-sm font-medium ${active ? "text-white" : "text-slate-200"}`}>
                            {size.label}
                          </div>
                          <div className="text-xs text-slate-500">{size.description}</div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          active ? "bg-primary border-primary" : "border-white/20"
                        }`}>
                          {active && <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />}
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
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all duration-200 ${
                          active
                            ? "bg-primary/15 border-primary/60 text-white"
                            : "bg-white/5 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/8"
                        }`}
                      >
                        <span className="text-sm font-medium">{goal.label}</span>
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ml-2 ${
                          active ? "bg-primary border-primary" : "border-white/20"
                        }`}>
                          {active && <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />}
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
                    className="h-9 px-4 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  >
                    Back
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={isSubmitting || !canAdvance}
                  className="h-9 flex-1 bg-primary hover:bg-primary/90 disabled:opacity-40 text-slate-950 font-semibold text-sm rounded-lg shadow-[0_0_20px_rgba(var(--primary),0.25)] transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {currentStep === steps.length - 1 ? "Complete Setup" : "Continue"}
                      <ChevronRight className="ml-1 w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </Card>

        {/* Footer */}
        <p className="mt-3 text-center text-slate-600 text-xs">
          Step {currentStep + 1} of {steps.length} · Secure & Encrypted
        </p>
      </div>
    </div>
  )
}