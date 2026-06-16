export type WorkingDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday"

export interface OnboardingData {
  companyName: string
  industry: string
  timezone: string

  workStartTime: string
  workEndTime: string
  lateThreshold: number
  workingDays: WorkingDay[]

  departments: string[]
}

export interface OnboardingState {
  data: OnboardingData
  currentStep: number
  isSubmitting: boolean
  error: string | null
}

export interface OnboardingStep {
  id: string
  title: string
  description: string
  validate: (data: OnboardingData) => string | null
}

export interface StepComponentProps {
  data: OnboardingData
  updateField: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void
  error: string | null
}

export const DEFAULT_ONBOARDING_DATA: OnboardingData = {
  companyName: "",
  industry: "",
  timezone: "WIB",
  workStartTime: "08:00",
  workEndTime: "17:00",
  lateThreshold: 15,
  workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  departments: [],
}

export const WORKING_DAY_LABELS: Record<WorkingDay, string> = {
  monday: "Senin",
  tuesday: "Selasa",
  wednesday: "Rabu",
  thursday: "Kamis",
  friday: "Jumat",
  saturday: "Sabtu",
  sunday: "Minggu",
}