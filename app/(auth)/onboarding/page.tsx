"use client"

import { OnboardingProvider, useOnboarding } from "@/lib/onboarding/onboarding-context"
import { ONBOARDING_STEPS } from "@/lib/onboarding/steps"
import { OnboardingStepper } from "@/components/onboarding/OnboardingStepper"
import { OnboardingNavigation } from "@/components/onboarding/OnboardingNavigation"
import { completeOnboardingAction } from "@/lib/onboarding/actions"
import { CompanyInfoStep } from "@/components/onboarding/steps/CompanyInfoStep"
import { WorkScheduleStep } from "@/components/onboarding/steps/WorkScheduleStep"
import { DepartmentsStep } from "@/components/onboarding/steps/DepartmentsStep"
import { ConfirmationStep } from "@/components/onboarding/steps/ConfirmationStep"

const STEP_COMPONENTS = [
  CompanyInfoStep,
  WorkScheduleStep,
  DepartmentsStep,
  ConfirmationStep,
]

function OnboardingFlow() {
  const { state, dispatch } = useOnboarding()
  const currentStep = ONBOARDING_STEPS[state.currentStep]
  const isLastStep = state.currentStep === ONBOARDING_STEPS.length - 1
  const StepComponent = STEP_COMPONENTS[state.currentStep]

  const handleNext = () => {
    const error = currentStep.validate(state.data)
    if (error) {
      dispatch({ type: "SET_ERROR", error })
      return
    }

    if (isLastStep) {
      dispatch({ type: "SET_SUBMITTING", isSubmitting: true })
      completeOnboardingAction(state.data)
        .catch((err) => {
          dispatch({ type: "SET_ERROR", error: err.message || "Terjadi kesalahan. Silakan coba lagi." })
          dispatch({ type: "SET_SUBMITTING", isSubmitting: false })
        })
    } else {
      dispatch({ type: "NEXT_STEP" })
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <OnboardingStepper steps={ONBOARDING_STEPS} currentStep={state.currentStep} />

      <div className="bg-surface-container-lowest rounded-3xl shadow-[0_12px_40px_rgba(0,105,72,0.08)] p-8">
        <StepComponent
          data={state.data}
          updateField={(field, value) =>
            dispatch({ type: "UPDATE_FIELD", field, value })
          }
          error={state.error}
        />
      </div>

      <OnboardingNavigation
        onBack={() => dispatch({ type: "PREV_STEP" })}
        onNext={handleNext}
        isFirstStep={state.currentStep === 0}
        isLastStep={isLastStep}
        isSubmitting={state.isSubmitting}
      />
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingFlow />
    </OnboardingProvider>
  )
}