"use client"
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback } from "react"
import { Plus } from "lucide-react"
import { getPositions } from "@/lib/positions/actions"
import type { Position } from "@/lib/positions/types"
import { PositionTable } from "@/components/positions/PositionTable"
import { PositionSheet } from "@/components/positions/PositionSheet"

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editPosition, setEditPosition] = useState<Position | null>(null)

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

  return (
    <div className="pl-8 pr-8 flex-1">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline tracking-tight text-3xl font-bold text-on-surface">
            Jabatan
          </h2>
          <p className="text-on-surface-variant mt-1">
            Kelola data jabatan di perusahaan.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAdd}
            className="bg-primary text-white px-6 py-2.5 rounded-3xl font-semibold shadow-lg shadow-primary/20 flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95"
          >
            <Plus size={20} />
            Tambah Jabatan
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <PositionTable
          data={positions}
          loading={loading}
          onEdit={handleEdit}
          onRefresh={fetchPositions}
        />
      </div>

      <PositionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={handleSheetSuccess}
        editPosition={editPosition}
      />
    </div>
  )
}