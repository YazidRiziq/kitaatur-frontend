"use client"

import { useState } from "react"
import { DownloadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { getExportInfo } from "@/lib/attendance/actions"

interface ExportButtonProps {
  date: string
  search?: string
  departmentId?: string
}

export function ExportButton({ date, search, departmentId }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleExport() {
    setExporting(true)
    setError(null)
    try {
      const { url, token } = await getExportInfo({
        date,
        search,
        department_id: departmentId,
      })

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Export failed")

      const disposition = res.headers.get("Content-Disposition")
      let filename = "attendance-report.xlsx"
      if (disposition) {
        const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, "")
        }
      }

      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch {
      setError("Gagal mengekspor laporan. Silakan coba lagi.")
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {error && <span className="text-xs text-destructive">{error}</span>}
      <Button
        variant="outline"
        size="default"
        disabled={exporting}
        onClick={handleExport}
      >
        {exporting ? <Spinner data-icon="inline-start" /> : <DownloadIcon data-icon="inline-start" />}
        Export
      </Button>
    </div>
  )
}
