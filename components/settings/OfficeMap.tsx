"use client"

import { useEffect } from "react"
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents,
  useMap,
} from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { GeoLocation } from "@/lib/settings/types"

interface OfficeMapProps {
  location: GeoLocation | null
  onChange: (location: GeoLocation) => void
  radiusMeters: number
  onRadiusChange: (radius: number) => void
}

const DEFAULT_CENTER: [number, number] = [-0.0895, 100.3527] // Sumatera Barat (Padang area)

function createPinIcon(): L.DivIcon {
  return L.divIcon({
    className: "office-pin",
    html: `<div style="position:relative;transform:translate(-50%,-100%);">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C7.6 2 4 5.6 4 10c0 5.4 7 11.5 7.3 11.8.2.2.5.2.7 0C12.3 21.5 20 15.4 20 10c0-4.4-3.6-8-8-8z" fill="#006948" stroke="white" stroke-width="1.5"/>
        <circle cx="12" cy="10" r="3" fill="white"/>
      </svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  })
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function Recenter({ center }: { center: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, Math.max(map.getZoom(), 15))
    }
  }, [center, map])
  return null
}

export function OfficeMap({
  location,
  onChange,
  radiusMeters,
}: OfficeMapProps) {
  const center: [number, number] = location
    ? [location.lat, location.lng]
    : DEFAULT_CENTER
  const zoom = location ? 16 : 12

  function handleMapClick(lat: number, lng: number) {
    onChange({
      lat,
      lng,
      radiusMeters,
    })
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-surface-variant/30 h-[320px]">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onClick={handleMapClick} />
        <Recenter center={location ? [location.lat, location.lng] : null} />
        {location && (
          <>
            <Marker
              position={[location.lat, location.lng]}
              icon={createPinIcon()}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const m = e.target as L.Marker
                  const pos = m.getLatLng()
                  onChange({
                    lat: pos.lat,
                    lng: pos.lng,
                    radiusMeters,
                  })
                },
              }}
            />
            <Circle
              center={[location.lat, location.lng]}
              radius={radiusMeters}
              pathOptions={{
                color: "#006948",
                fillColor: "#006948",
                fillOpacity: 0.15,
                weight: 2,
              }}
            />
          </>
        )}
      </MapContainer>
    </div>
  )
}
