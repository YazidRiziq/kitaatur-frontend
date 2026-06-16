import { Check } from "lucide-react"
import type { OnboardingStep } from "@/lib/onboarding/types"

interface OnboardingStepperProps {
  steps: OnboardingStep[]
  currentStep: number
}

export function OnboardingStepper({ steps, currentStep }: OnboardingStepperProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center gap-0">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isActive = index === currentStep

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    isCompleted
                      ? "bg-primary text-white"
                      : isActive
                        ? "bg-primary text-white ring-4 ring-primary/20"
                        : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {isCompleted ? <Check size={14} /> : index + 1}
                </div>
                <span
                  className={`mt-1.5 text-[11px] font-medium text-center leading-tight max-w-16 ${
                    isActive ? "text-primary" : isCompleted ? "text-on-surface" : "text-slate-400"
                  }`}
                >
                  {step.title}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`w-10 h-0.5 mx-1 mb-5 rounded-full transition-all ${
                    index < currentStep ? "bg-primary" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}