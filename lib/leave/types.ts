export const LEAVE_TYPES = [
  "Cuti Tahunan",
  "Izin Sakit",
  "Cuti Penting",
  "Cuti Melahirkan",
] as const

export type LeaveType = (typeof LEAVE_TYPES)[number]

export const LEAVE_STATUSES = ["Pending", "Approved", "Rejected"] as const

export type LeaveStatus = (typeof LEAVE_STATUSES)[number]

export interface LeaveRequest {
  id: string
  employee: {
    id: string
    name: string
    position: string
    avatarUrl: string | null
  }
  type: LeaveType
  startDate: string
  endDate: string
  duration: number
  reason: string
  status: LeaveStatus
  approver: {
    id: string
    name: string
  } | null
  createdAt: string
}

export interface LeaveStats {
  pending: number
  approved: number
  onLeaveToday: number
}

export interface LeaveFilters {
  search?: string
  status?: string
  type?: string
  page?: number
}

export interface LeavePagination {
  page: number
  totalPages: number
  total: number
  perPage: number
}

export interface LeavePaginatedResponse {
  data: LeaveRequest[]
  pagination: LeavePagination
}

export interface LeaveExportInfo {
  url: string
  token: string
}

export interface CreateLeaveInput {
  employee_id: string
  type: LeaveType
  start_date: string
  end_date: string
  reason: string
}

export interface CreateLeaveResponse {
  message: string
  data: LeaveRequest
}

export interface UpdateLeaveStatusInput {
  status: "Approved" | "Rejected"
  rejection_reason?: string
}

export interface UpdateLeaveStatusResponse {
  message: string
  data: LeaveRequest
}
