export interface Position {
  id: string
  title: string
  grade: string | null
  employee_count: number
}

export interface PositionInput {
  title: string
  grade?: string
}