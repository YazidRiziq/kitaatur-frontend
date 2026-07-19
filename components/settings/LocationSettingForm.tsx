"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { MapPin, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Spinner } from "@/components/ui/spinner"
import { AddressSearch } from "@/components/settings/AddressSearch"
import {
  getSettings,
  updateSettings,
} from "@/lib/settings/actions"
import type { GeoLocation } from "@/lib/settings/types"
import {
  DEFAULT_RADIUS_METERS,
  MIN_RADIUS_METERS,
  MAX_RADIUS_METERS,
} from "@/lib/settings/types"

const OfficeMap = dynamic(
  () => import("@/components/settings/OfficeMap").then((m) => m.OfficeMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[320px] rounded-lg border border-border bg-muted/30">
        <Spinner className="size-6" />
      </div>
    ),
  }
)

export function LocationSettingForm() {
  const [location, setLocation] = useState<GeoLocation | null>(null)
  const [radius, setRadius] = useState(DEFAULT_RADIUS_METERS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [addressLabel, setAddressLabel] = useState("")

  useEffect(() => {
    getSettings()
      .then((data) => {
        if (data.defaultLocation) {
          setLocation(data.defaultLocation)
          setRadius(data.defaultLocation.radiusMeters)
        }
      })
      .catch(() => toast.error("Gagal memuat pengaturan lokasi"))
      .finally(() => setLoading(false))
  }, [])

  function handleMapChange(loc: GeoLocation) {
    setLocation({
      lat: loc.lat,
      lng: loc.lng,
      radiusMeters: radius,
    })
  }

  function handleAddressSelect(lat: number, lng: number, label: string) {
    setAddressLabel(label)
    setLocation({ lat, lng, radiusMeters: radius })
  }

  function handleRadiusChange(value: number) {
    const clamped = Math.max(MIN_RADIUS_METERS, Math.min(MAX_RADIUS_METERS, value))
    setRadius(clamped)
    if (location) {
      setLocation({ ...location, radiusMeters: clamped })
    }
  }

  async function handleSave() {
    if (!location) {
      toast.error("Pilih lokasi kantor di peta terlebih dahulu")
      return
    }

    setSaving(true)
    try {
      await updateSettings({
        defaultLocation: {
          lat: location.lat,
          lng: location.lng,
          radiusMeters: radius,
        },
      })
      toast.success("Lokasi kantor berhasil disimpan")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan lokasi kantor"
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleReset() {
    setSaving(true)
    try {
      await updateSettings({ defaultLocation: null })
      setLocation(null)
      setRadius(DEFAULT_RADIUS_METERS)
      setAddressLabel("")
      toast.success("Lokasi kantor direset")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal mereset lokasi"
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="size-6" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
          <MapPin className="size-4" />
        </div>
        <div>
          <h3 className="text-base font-medium text-foreground">
            Lokasi Kantor
          </h3>
          <p className="text-sm text-muted-foreground">
            Tentukan lokasi dan radius absensi untuk karyawan kantor
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Cari Alamat</Label>
        <AddressSearch onSelect={handleAddressSelect} />
        {addressLabel && (
          <p className="text-xs text-muted-foreground mt-1">
            Terpilih: {addressLabel}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Pin Lokasi & Radius</Label>
        <p className="text-xs text-muted-foreground">
          Klik peta untuk set pin, atau seret pin untuk menyesuaikan
        </p>
        <OfficeMap
          location={location}
          onChange={handleMapChange}
          radiusMeters={radius}
          onRadiusChange={handleRadiusChange}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Radius Toleransi</Label>
          <span className="text-sm font-medium text-primary">{radius}m</span>
        </div>
        <Slider
          value={[radius]}
          min={MIN_RADIUS_METERS}
          max={MAX_RADIUS_METERS}
          step={10}
          onValueChange={([val]) => handleRadiusChange(val)}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Min: {MIN_RADIUS_METERS}m</span>
          <span>Rekomendasi: 150m</span>
          <span>Max: {MAX_RADIUS_METERS}m</span>
        </div>
      </div>

      {location && (
        <div className="rounded-lg bg-muted/30 p-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Koordinat:</span>{" "}
          {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        {location && (
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={saving}
          >
            <Trash2 className="size-3.5" />
            Reset
          </Button>
        )}
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving || !location}
        >
          {saving ? (
            <>
              <Spinner data-icon="inline-start" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="size-3.5" />
              Simpan Lokasi
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
