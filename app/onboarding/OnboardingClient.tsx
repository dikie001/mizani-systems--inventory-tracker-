"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Building2, 
  Package, 
  TrendingUp, 
  ArrowRight, 
  Check, 
  Loader2,
  Store,
  Factory,
  Briefcase,
  Layers,
  ChevronRight,
  Sparkles
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
    icon: <Sparkles className="w-6 h-6 text-primary" />,
  },
  {
    id: "type",
    title: "Business Type",
    description: "What kind of business are you running?",
    icon: <Building2 className="w-6 h-6 text-primary" />,
  },
  {
    id: "size",
    title: "Inventory Size",
    description: "How many products do you plan to manage?",
    icon: <Package className="w-6 h-6 text-primary" />,
  },
  {
    id: "goals",
    title: "Your Goals",
    description: "What are your primary objectives?",
    icon: <TrendingUp className="w-6 h-6 text-primary" />,
  },
]

const businessTypes = [
  { id: "retail", label: "Retail", icon: <Store className="w-5 h-5" /> },
  { id: "manufacturing", label: "Manufacturing", icon: <Factory className="w-5 h-5" /> },
  { id: "wholesale", label: "Wholesale", icon: <Layers className="w-5 h-5" /> },
  { id: "services", label: "Services", icon: <Briefcase className="w-5 h-5" /> },
]

const inventorySizes = [
  { id: "small", label: "1 - 100", description: "Just starting out" },
  { id: "medium", label: "100 - 1,000", description: "Growing business" },
  { id: "large", label: "1,000 - 10,000", description: "Established enterprise" },
  { id: "enterprise", label: "10,000+", description: "Scale operations" },
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

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
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
        router.push("/dashboard")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to create workspace")
      }
    } catch (error) {
      toast.error("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleGoal = (goalId: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter((g) => g !== goalId)
        : [...prev.goals, goalId],
    }))
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-primary/30">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-xl relative">
        {/* Progress Bar */}
        <div className="mb-12 flex justify-between gap-2">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex-1">
              <div 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  idx <= currentStep ? "bg-primary" : "bg-white/10"
                }`}
              />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
                {steps[currentStep].icon}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {steps[currentStep].title}
                </h1>
                <p className="text-slate-400 text-sm">
                  {steps[currentStep].description}
                </p>
              </div>
            </div>

            <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-8 shadow-2xl">
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div className="relative group">
                    <Input
                      autoFocus
                      placeholder="e.g. Acme Corporation"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white/5 border-white/10 text-white h-14 text-lg px-4 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                      <kbd className="bg-white/10 text-slate-400 px-2 py-1 rounded text-xs">Enter</kbd>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="grid grid-cols-2 gap-4">
                  {businessTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setFormData({ ...formData, businessType: type.id })}
                      className={`flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all duration-300 ${
                        formData.businessType === type.id
                          ? "bg-primary/20 border-primary shadow-[0_0_20px_rgba(var(--primary),0.2)]"
                          : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                      }`}
                    >
                      <div className={`p-3 rounded-lg ${
                        formData.businessType === type.id ? "text-primary" : "text-slate-400"
                      }`}>
                        {type.icon}
                      </div>
                      <span className={`font-medium ${
                        formData.businessType === type.id ? "text-white" : "text-slate-300"
                      }`}>
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-3">
                  {inventorySizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setFormData({ ...formData, inventorySize: size.id })}
                      className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 text-left ${
                        formData.inventorySize === size.id
                          ? "bg-primary/20 border-primary"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div>
                        <div className={`font-semibold ${
                          formData.inventorySize === size.id ? "text-white" : "text-slate-200"
                        }`}>
                          {size.label}
                        </div>
                        <div className="text-slate-400 text-sm">{size.description}</div>
                      </div>
                      {formData.inventorySize === size.id && (
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {currentStep === 3 && (
                <div className="grid grid-cols-1 gap-3">
                  {goalOptions.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={`group w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 text-left ${
                        formData.goals.includes(goal.id)
                          ? "bg-primary/20 border-primary"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <span className={`font-medium ${
                        formData.goals.includes(goal.id) ? "text-white" : "text-slate-300"
                      }`}>
                        {goal.label}
                      </span>
                      <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                        formData.goals.includes(goal.id)
                          ? "bg-primary border-primary"
                          : "border-white/20 group-hover:border-white/40"
                      }`}>
                        {formData.goals.includes(goal.id) && <Check className="w-4 h-4 text-slate-950 stroke-[3]" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-8 flex gap-3">
                {currentStep > 0 && (
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="h-14 px-8 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    Back
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={
                    isSubmitting || 
                    (currentStep === 0 && !formData.name) ||
                    (currentStep === 1 && !formData.businessType) ||
                    (currentStep === 2 && !formData.inventorySize)
                  }
                  className="h-14 flex-1 bg-primary hover:bg-primary/90 text-slate-950 font-bold text-lg rounded-xl shadow-[0_0_30px_rgba(var(--primary),0.3)] transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {currentStep === steps.length - 1 ? "Complete Setup" : "Continue"}
                      <ChevronRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        <p className="mt-8 text-center text-slate-500 text-sm">
          Step {currentStep + 1} of {steps.length} • Secure & Encrypted
        </p>
      </div>
    </div>
  )
}
