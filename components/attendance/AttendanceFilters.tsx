"use client"

import { useRef, useState } from "react"
import Form from "next/form"
import { SearchIcon, CalendarIcon } from "lucide-react"
import { format, parse } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { Input } from "@/components/ui/input"
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

interface AttendanceFiltersProps {
  departments: Department[]
  currentSearch: string
  currentDepartment: string
  currentDate: string
}

export function AttendanceFilters({
  departments,
  currentSearch,
  currentDepartment,
  currentDate,
}: AttendanceFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [department, setDepartment] = useState(currentDepartment || "__all__")
  const [date, setDate] = useState(currentDate)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const selectedDate = date
    ? parse(date, "yyyy-MM-dd", new Date())
    : new Date()

  function submitForm() {
    formRef.current?.requestSubmit()
  }

  return (
    <Form ref={formRef} action="/attendance" className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="view" value="snapshot" />
      <input type="hidden" name="department" value={department === "__all__" ? "" : department} />
      <input type="hidden" name="date" value={date} />

      {/* Search */}
      <div className="relative flex-1 min-w-48">
        <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="search"
          defaultValue={currentSearch}
          placeholder="Cari karyawan..."
          className="pl-9"
        />
      </div>

      {/* Department Select */}
      <Select
        value={department}
        onValueChange={(val) => {
          setDepartment(val)
          // defer submit so hidden input updates
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

      {/* Date Picker */}
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-auto min-w-36 justify-start gap-2 font-normal"
          >
            <CalendarIcon className="size-4 text-muted-foreground" />
            {date
              ? format(selectedDate, "d MMM yyyy", { locale: idLocale })
              : "Pilih tanggal"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(day) => {
              if (day) {
                setDate(format(day, "yyyy-MM-dd"))
                setCalendarOpen(false)
                setTimeout(submitForm, 0)
              }
            }}
            defaultMonth={selectedDate}
            locale={idLocale}
          />
        </PopoverContent>
      </Popover>
    </Form>
  )
}
