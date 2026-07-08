import type { WorkingDay } from "@/lib/onboarding/types"

export interface GeoLocation {
  lat: number
  lng: number
  radiusMeters: number
}

export interface CompanySettings {
  workStartTime: string
  workEndTime: string
  lateThreshold: number
  workingDays: WorkingDay[]
  timezone: string
  defaultLocation: GeoLocation | null
}

export interface UpdateCompanySettingsInput {
  workStartTime?: string
  workEndTime?: string
  lateThreshold?: number
  workingDays?: WorkingDay[]
  timezone?: string
  defaultLocation?: GeoLocation | null
}

export interface UpdateCompanySettingsResponse {
  message: string
  data: CompanySettings
}

export const DEFAULT_RADIUS_METERS = 150
export const MIN_RADIUS_METERS = 100
export const MAX_RADIUS_METERS = 500
