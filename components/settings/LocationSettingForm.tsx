"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Loader2, MapPin, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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
      <div className="flex items-center justify-center h-[320px] rounded-2xl border border-surface-variant/30 bg-surface-container-low">
        <Loader2 size={24} className="animate-spin text-primary" />
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
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <MapPin size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="font-headline text-lg font-bold text-on-surface">
            Lokasi Kantor
          </h3>
          <p className="text-sm text-on-surface-variant">
            Tentukan lokasi dan radius absensi untuk karyawan kantor
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="font-body text-on-surface">
          Cari Alamat
        </Label>
        <AddressSearch onSelect={handleAddressSelect} />
        {addressLabel && (
          <p className="text-xs text-on-surface-variant mt-1">
            Terpilih: {addressLabel}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="font-body text-on-surface">
          Pin Lokasi & Radius
        </Label>
        <p className="text-xs text-on-surface-variant">
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
          <Label htmlFor="radius-slider" className="font-body text-on-surface">
            Radius Toleransi
          </Label>
          <span className="text-sm font-bold text-primary">{radius}m</span>
        </div>
        <input
          id="radius-slider"
          type="range"
          min={MIN_RADIUS_METERS}
          max={MAX_RADIUS_METERS}
          step={10}
          value={radius}
          onChange={(e) => handleRadiusChange(parseInt(e.target.value, 10))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-on-surface-variant">
          <span>Min: {MIN_RADIUS_METERS}m</span>
          <span>
            Rekomendasi: 150m (akurasi GPS WhatsApp ±50-100m)
          </span>
          <span>Max: {MAX_RADIUS_METERS}m</span>
        </div>
      </div>

      {location && (
        <div className="rounded-xl bg-surface-container-low p-3 text-sm text-on-surface-variant">
          <span className="font-medium text-on-surface">Koordinat:</span>{" "}
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
            className="rounded-xl"
          >
            <Trash2 size={16} />
            Reset
          </Button>
        )}
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving || !location}
          className="rounded-xl"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save size={16} />
              Simpan Lokasi
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
