import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FolderTree, Plus, X } from "lucide-react"
import type { StepComponentProps } from "@/lib/onboarding/types"

export function DepartmentsStep({ data, updateField, error }: StepComponentProps) {
  const [newDepartment, setNewDepartment] = useState("")
  const [localError, setLocalError] = useState("")

  const handleAdd = () => {
    const trimmed = newDepartment.trim()
    if (!trimmed) {
      setLocalError("Nama departemen tidak boleh kosong")
      return
    }
    if (data.departments.some((d) => d.toLowerCase() === trimmed.toLowerCase())) {
      setLocalError("Departemen ini sudah ada")
      return
    }
    updateField("departments", [...data.departments, trimmed])
    setNewDepartment("")
    setLocalError("")
  }

  const handleRemove = (index: number) => {
    updateField("departments", data.departments.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
          <FolderTree size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface">
            Departemen
          </h2>
          <p className="text-sm text-on-surface-variant">
            Tambah departemen di perusahaan
          </p>
        </div>
      </div>

      {(error || localError) && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {localError || error}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Nama departemen"
          value={newDepartment}
          onChange={(e) => {
            setNewDepartment(e.target.value)
            setLocalError("")
          }}
          onKeyDown={handleKeyDown}
          className="rounded-xl h-11 flex-1"
        />
        <Button
          type="button"
          onClick={handleAdd}
          className="rounded-xl h-11 gap-2 bg-primary hover:bg-primary/90 font-semibold"
        >
          <Plus size={16} />
          Tambah
        </Button>
      </div>

      <div className="space-y-2">
        {data.departments.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            Belum ada departemen. Tambahkan minimal 1 departemen.
          </p>
        ) : (
          <div className="space-y-2">
            {data.departments.map((dept, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <FolderTree size={14} className="text-primary" />
                  </div>
                  <span className="text-sm font-medium text-on-surface">
                    {dept}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        {data.departments.length > 0 && (
          <p className="text-xs text-slate-400 text-center pt-1">
            {data.departments.length} departemen
          </p>
        )}
      </div>
    </div>
  )
}