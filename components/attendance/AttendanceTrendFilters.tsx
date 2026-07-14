"use client"

import { useRef, useState } from "react"
import Form from "next/form"
import { CalendarIcon } from "lucide-react"
import { format, parse } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
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
  const formRef = useRef<HTMLFormElement>(null)
  const [department, setDepartment] = useState(currentDepartment || "__all__")
  const [start, setStart] = useState(currentStart)
  const [end, setEnd] = useState(currentEnd)
  const [startOpen, setStartOpen] = useState(false)
  const [endOpen, setEndOpen] = useState(false)

  const startDate = start
    ? parse(start, "yyyy-MM-dd", new Date())
    : new Date()
  const endDate = end
    ? parse(end, "yyyy-MM-dd", new Date())
    : new Date()

  function submitForm() {
    formRef.current?.requestSubmit()
  }

  return (
    <Form ref={formRef} action="/attendance" className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="view" value="trend" />
      <input type="hidden" name="department" value={department === "__all__" ? "" : department} />
      <input type="hidden" name="start" value={start} />
      <input type="hidden" name="end" value={end} />

      {/* Date Range */}
      <div className="flex items-center gap-2">
        <Popover open={startOpen} onOpenChange={setStartOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-auto min-w-36 justify-start gap-2 font-normal"
            >
              <CalendarIcon className="size-4 text-muted-foreground" />
              {start
                ? format(startDate, "d MMM yyyy", { locale: idLocale })
                : "Tanggal mulai"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(day) => {
                if (day) {
                  setStart(format(day, "yyyy-MM-dd"))
                  setStartOpen(false)
                  setTimeout(submitForm, 0)
                }
              }}
              defaultMonth={startDate}
              locale={idLocale}
            />
          </PopoverContent>
        </Popover>

        <span className="text-xs text-muted-foreground">sampai</span>

        <Popover open={endOpen} onOpenChange={setEndOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-auto min-w-36 justify-start gap-2 font-normal"
            >
              <CalendarIcon className="size-4 text-muted-foreground" />
              {end
                ? format(endDate, "d MMM yyyy", { locale: idLocale })
                : "Tanggal akhir"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(day) => {
                if (day) {
                  setEnd(format(day, "yyyy-MM-dd"))
                  setEndOpen(false)
                  setTimeout(submitForm, 0)
                }
              }}
              defaultMonth={endDate}
              locale={idLocale}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Department Select */}
      <Select
        value={department}
        onValueChange={(val) => {
          setDepartment(val)
          setTimeout(submitForm, 0)
        }}
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
    </Form>
  )
}
