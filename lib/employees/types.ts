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