"use client"

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import type { OnboardingData, OnboardingState } from "@/lib/onboarding/types"
import { DEFAULT_ONBOARDING_DATA } from "@/lib/onboarding/types"

type OnboardingAction =
  | { type: "UPDATE_FIELD"; field: keyof OnboardingData; value: OnboardingData[keyof OnboardingData] }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "GO_TO_STEP"; step: number }
  | { type: "SET_SUBMITTING"; isSubmitting: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "RESTORE_DRAFT"; data: OnboardingData; step: number }

function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        data: { ...state.data, [action.field]: action.value },
        error: null,
      }
    case "NEXT_STEP":
      return { ...state, currentStep: state.currentStep + 1, error: null }
    case "PREV_STEP":
      return { ...state, currentStep: Math.max(0, state.currentStep - 1), error: null }
    case "GO_TO_STEP":
      return { ...state, currentStep: action.step, error: null }
    case "SET_SUBMITTING":
      return { ...state, isSubmitting: action.isSubmitting }
    case "SET_ERROR":
      return { ...state, error: action.error }
    case "RESTORE_DRAFT":
      return {
        data: action.data,
        currentStep: action.step,
        isSubmitting: false,
        error: null,
      }
    default:
      return state
  }
}

const STORAGE_KEY = "kitaatur-onboarding-draft"

interface OnboardingContextValue {
  state: OnboardingState
  dispatch: React.Dispatch<OnboardingAction>
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(onboardingReducer, {
    data: DEFAULT_ONBOARDING_DATA,
    currentStep: 0,
    isSubmitting: false,
    error: null,
  })

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        dispatch({
          type: "RESTORE_DRAFT",
          data: { ...DEFAULT_ONBOARDING_DATA, ...parsed.data },
          step: parsed.step ?? 0,
        })
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ data: state.data, step: state.currentStep })
      )
    } catch {
      // sessionStorage mungkin penuh atau tidak tersedia
    }
  }, [state.data, state.currentStep])

  return (
    <OnboardingContext.Provider value={{ state, dispatch }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext)
  if (!ctx) {
    throw new Error("useOnboarding must be used within OnboardingProvider")
  }
  return ctx
}