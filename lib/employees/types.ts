import type { GeoLocation } from "@/lib/settings/types"

export interface WorkLocation extends GeoLocation {
  label: string
}

export interface Employee {
  id: string
  name: string
  email: string
  phone: string | null
  employee_number: string | null
  department: {
    id: string
    name: string
  }
  position: {
    id: string
    title: string
  }
  avatar_url: string | null
  joined_at: string
  workLocation: WorkLocation | null
}

export interface PendingInvitation {
  id: string
  name: string
  email: string
  invitation_token: string
  invitation_expires_at: string
}

export interface InviteEmployeeInput {
  name: string
  email: string
  phone?: string
  employee_number?: string
  department_id: string
  position_id: string
}

export interface UpdateEmployeeInput {
  name: string
  email: string
  phone?: string | null
  employee_number?: string | null
  department_id: string
  position_id: string
}

export interface UpdateEmployeeResponse {
  message: string
  data: Employee
}

export interface DeactivateEmployeeInput {
  reason?: string
}

export interface DeactivateEmployeeResponse {
  message: string
  data: {
    id: string
    name: string
    email: string
    employee_number: string | null
    status: string
    deactivated_at: string | null
    deactivation_reason: string | null
    department: {
      id: string
      name: string
    }
    position: {
      id: string
      title: string
    }
    deactivatedBy: {
      id: string
      full_name: string
    } | null
  }
}

export interface InviteEmployeeResponse {
  message: string
  data: {
    id: string
    name: string
    email: string
    invitation_code: string
    invitation_expires_at: string
  }
}

export interface ResendInvitationResponse {
  message: string
  data: {
    id: string
    name: string
    email: string
    invitation_code: string
    invitation_expires_at: string
  }
}

export interface RevokeInvitationResponse {
  message: string
  data: {
    id: string
    name: string
    email: string
  }
}

export interface UpdateWorkLocationInput {
  lat: number
  lng: number
  radiusMeters: number
  label: string
}

export interface UpdateWorkLocationResponse {
  message: string
  data: {
    id: string
    workLocation: WorkLocation | null
  }
}

export interface EmployeeFilters {
  search?: string
  department_id?: string
  position_id?: string
  page?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}