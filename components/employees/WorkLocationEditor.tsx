"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Loader2, MapPin, Save, RotateCcw, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AddressSearch } from "@/components/settings/AddressSearch"
import {
  updateEmployeeWorkLocation,
  resetEmployeeWorkLocation,
} from "@/lib/employees/actions"
import type { WorkLocation } from "@/lib/employees/types"
import {
  DEFAULT_RADIUS_METERS,
  MIN_RADIUS_METERS,
  MAX_RADIUS_METERS,
} from "@/lib/settings/types"
import type { GeoLocation } from "@/lib/settings/types"

const OfficeMap = dynamic(
  () => import("@/components/settings/OfficeMap").then((m) => m.OfficeMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[280px] rounded-2xl border border-surface-variant/30 bg-surface-container-low">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    ),
  }
)

interface WorkLocationEditorProps {
  employeeId: string
  currentLocation: WorkLocation | null
  onUpdated?: (location: WorkLocation | null) => void
}

export function WorkLocationEditor({
  employeeId,
  currentLocation,
  onUpdated,
}: WorkLocationEditorProps) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [label, setLabel] = useState("")
  const [geo, setGeo] = useState<GeoLocation | null>(null)

  useEffect(() => {
    if (currentLocation) {
      setLabel(currentLocation.label)
      setGeo({
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        radiusMeters: currentLocation.radiusMeters,
      })
    } else {
      setLabel("")
      setGeo(null)
    }
  }, [currentLocation])

  function startEdit() {
    setEditing(true)
    if (!currentLocation) {
      setLabel("")
      setGeo(null)
    }
  }

  function cancelEdit() {
    setEditing(false)
    if (currentLocation) {
      setLabel(currentLocation.label)
      setGeo({
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        radiusMeters: currentLocation.radiusMeters,
      })
    } else {
      setLabel("")
      setGeo(null)
    }
  }

  function handleMapChange(loc: GeoLocation) {
    setGeo({
      lat: loc.lat,
      lng: loc.lng,
      radiusMeters: geo?.radiusMeters ?? DEFAULT_RADIUS_METERS,
    })
  }

  function handleAddressSelect(lat: number, lng: number, addrLabel: string) {
    if (!label) setLabel(addrLabel.split(",")[0])
    setGeo({
      lat,
      lng,
      radiusMeters: geo?.radiusMeters ?? DEFAULT_RADIUS_METERS,
    })
  }

  function handleRadiusChange(value: number) {
    const clamped = Math.max(MIN_RADIUS_METERS, Math.min(MAX_RADIUS_METERS, value))
    setGeo((prev) => (prev ? { ...prev, radiusMeters: clamped } : null))
  }

  async function handleSave() {
    if (!geo || !label.trim()) {
      toast.error("Lokasi dan label wajib diisi")
      return
    }

    setSaving(true)
    try {
      await updateEmployeeWorkLocation(employeeId, {
        lat: geo.lat,
        lng: geo.lng,
        radiusMeters: geo.radiusMeters,
        label: label.trim(),
      })
      toast.success("Lokasi kerja karyawan berhasil diperbarui")
      setEditing(false)
      onUpdated?.({
        ...geo,
        label: label.trim(),
      })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal memperbarui lokasi kerja"
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleReset() {
    setSaving(true)
    try {
      await resetEmployeeWorkLocation(employeeId)
      toast.success("Lokasi kerja direset ke default kantor")
      setEditing(false)
      setLabel("")
      setGeo(null)
      onUpdated?.(null)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal mereset lokasi kerja"
      )
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    if (currentLocation) {
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border border-surface-variant/20 bg-surface-container-low p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">
                    {currentLocation.label}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    Radius: {currentLocation.radiusMeters}m
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={handleReset}
              disabled={saving}
            >
              <RotateCcw size={14} />
              Reset ke Default
            </Button>
            <Button
              type="button"
              size="sm"
              className="rounded-xl"
              onClick={startEdit}
            >
              Ubah Lokasi
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-dashed border-surface-variant/40 bg-surface-container-low/50 p-4 text-center">
          <p className="text-sm text-on-surface-variant">
            Menggunakan lokasi default kantor
          </p>
          <p className="text-xs text-on-surface-variant mt-1">
            Karyawan ini belum punya lokasi kerja khusus
          </p>
        </div>
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            className="rounded-xl"
            onClick={startEdit}
          >
            <Plus size={14} />
            Atur Lokasi Khusus
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="work-location-label" className="text-xs font-semibold text-on-surface-variant">
          Nama Lokasi <span className="text-error">*</span>
        </Label>
        <Input
          id="work-location-label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Mis. Proyek Cluster A, Kantor Cabang"
          className="h-10 rounded-xl bg-surface-container-low"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold text-on-surface-variant">
          Cari Alamat
        </Label>
        <AddressSearch
          onSelect={handleAddressSelect}
          placeholder="Cari lokasi proyek..."
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold text-on-surface-variant">
          Pin Lokasi (klik peta atau seret pin)
        </Label>
        <OfficeMap
          location={geo}
          onChange={handleMapChange}
          radiusMeters={geo?.radiusMeters ?? DEFAULT_RADIUS_METERS}
          onRadiusChange={handleRadiusChange}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="work-radius" className="text-xs font-semibold text-on-surface-variant">
            Radius Toleransi
          </Label>
          <span className="text-sm font-bold text-primary">
            {geo?.radiusMeters ?? DEFAULT_RADIUS_METERS}m
          </span>
        </div>
        <input
          id="work-radius"
          type="range"
          min={MIN_RADIUS_METERS}
          max={MAX_RADIUS_METERS}
          step={10}
          value={geo?.radiusMeters ?? DEFAULT_RADIUS_METERS}
          onChange={(e) => handleRadiusChange(parseInt(e.target.value, 10))}
          className="w-full accent-primary"
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={cancelEdit}
          disabled={saving}
        >
          Batal
        </Button>
        <Button
          type="button"
          size="sm"
          className="rounded-xl"
          onClick={handleSave}
          disabled={saving || !geo || !label.trim()}
        >
          {saving ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save size={14} />
              Simpan
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
