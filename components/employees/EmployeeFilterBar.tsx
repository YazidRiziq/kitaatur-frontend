"use client"

import { SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Department } from "@/lib/departments/types"
import type { Position } from "@/lib/positions/types"

interface EmployeeFilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  departmentId: string
  onDepartmentChange: (value: string) => void
  positionId: string
  onPositionChange: (value: string) => void
  departments: Department[]
  positions: Position[]
}

export function EmployeeFilterBar({
  search,
  onSearchChange,
  departmentId,
  onDepartmentChange,
  positionId,
  onPositionChange,
  departments,
  positions,
}: EmployeeFilterBarProps) {
  return (
    <>
      <div className="relative flex-1 min-w-48 max-w-xs">
        <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari nama atau email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select
        value={departmentId || "__all__"}
        onValueChange={(val) => onDepartmentChange(val === "__all__" ? "" : val)}
      >
        <SelectTrigger className="w-auto min-w-44 gap-2">
          <SelectValue placeholder="Semua Departemen" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Semua Departemen</SelectItem>
          {departments.map((dept) => (
            <SelectItem key={dept.id} value={dept.id}>
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={positionId || "__all__"}
        onValueChange={(val) => onPositionChange(val === "__all__" ? "" : val)}
      >
        <SelectTrigger className="w-auto min-w-36 gap-2">
          <SelectValue placeholder="Semua Jabatan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Semua Jabatan</SelectItem>
          {positions.map((pos) => (
            <SelectItem key={pos.id} value={pos.id}>
              {pos.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )
}
