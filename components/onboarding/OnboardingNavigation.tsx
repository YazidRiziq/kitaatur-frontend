import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react"

interface OnboardingNavigationProps {
  onBack: () => void
  onNext: () => void
  isFirstStep: boolean
  isLastStep: boolean
  isSubmitting: boolean
}

export function OnboardingNavigation({
  onBack,
  onNext,
  isFirstStep,
  isLastStep,
  isSubmitting,
}: OnboardingNavigationProps) {
  return (
    <div className="flex items-center justify-between mt-6 gap-3">
      {!isFirstStep ? (
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="rounded-xl h-11 gap-2"
        >
          <ArrowLeft size={16} />
          Kembali
        </Button>
      ) : (
        <div />
      )}

      <Button
        type="button"
        onClick={onNext}
        disabled={isSubmitting}
        className="rounded-xl h-11 gap-2 bg-primary hover:bg-primary/90 font-semibold"
      >
        {isSubmitting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : isLastStep ? (
          <Check size={16} />
        ) : (
          <ArrowRight size={16} />
        )}
        {isLastStep ? "Selesaikan Pendaftaran" : "Lanjut"}
      </Button>
    </div>
  )
}