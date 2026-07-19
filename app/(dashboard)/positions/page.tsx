"use client"

import { useState, useEffect, useCallback } from "react"
import { SearchIcon, Plus } from "lucide-react"
import { getPositions } from "@/lib/positions/actions"
import type { Position } from "@/lib/positions/types"
import { PositionTable } from "@/components/positions/PositionTable"
import { PositionSheet } from "@/components/positions/PositionSheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editPosition, setEditPosition] = useState<Position | null>(null)
  const [search, setSearch] = useState("")

  const fetchPositions = useCallback(() => {
    setLoading(true)
    getPositions()
      .then((data) => {
        const normalized = Array.isArray(data) ? data : data ?? []
        setPositions(normalized)
      })
      .catch(() => setPositions([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchPositions()
  }, [fetchPositions])

  function handleAdd() {
    setEditPosition(null)
    setSheetOpen(true)
  }

  function handleEdit(position: Position) {
    setEditPosition(position)
    setSheetOpen(true)
  }

  function handleSheetSuccess() {
    fetchPositions()
  }

  const filtered = search
    ? positions.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          (p.grade && p.grade.toLowerCase().includes(search.toLowerCase()))
      )
    : positions

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.75rem] leading-tight font-medium tracking-[-0.42px] text-foreground">
            Jabatan
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola data jabatan di perusahaan.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari jabatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={handleAdd} className="ml-auto">
          <Plus data-icon="inline-start" />
          Tambah Jabatan
        </Button>
      </div>

      <PositionTable
        data={filtered}
        loading={loading}
        onEdit={handleEdit}
        onRefresh={fetchPositions}
      />

      <PositionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={handleSheetSuccess}
        editPosition={editPosition}
      />
    </div>
  )
}
