"use client"

import Form from "next/form"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import type { Department } from "@/lib/departments/types"

interface AttendanceTrendFiltersProps {
  departments: Department[]
  currentStart: string
  currentEnd: string
  currentDepartment: string
}

export function AttendanceTrendFilters({
  departments,
  currentStart,
  currentEnd,
  currentDepartment,
}: AttendanceTrendFiltersProps) {
  return (
    <Form action="/attendance" className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="view" value="trend" />

      <div className="flex items-center gap-2">
        <Input
          type="date"
          name="start"
          defaultValue={currentStart}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className="w-auto"
        />
        <span className="text-xs text-muted-foreground">sampai</span>
        <Input
          type="date"
          name="end"
          defaultValue={currentEnd}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className="w-auto"
        />
      </div>

      <NativeSelect
        name="department"
        defaultValue={currentDepartment}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="w-auto"
      >
        <NativeSelectOption value="">Semua Departemen</NativeSelectOption>
        {departments.map((dept) => (
          <NativeSelectOption key={dept.id} value={dept.id}>
            {dept.name}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </Form>
  )
}
