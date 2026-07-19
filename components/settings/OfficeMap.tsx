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

const DEFAULT_CENTER: [number, number] = [-0.0895, 100.3527]

function createPinIcon(): L.DivIcon {
  return L.divIcon({
    className: "office-pin",
    html: `<div style="position:relative;">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C7.6 2 4 5.6 4 10c0 5.4 7 11.5 7.3 11.8.2.2.5.2.7 0C12.3 21.5 20 15.4 20 10c0-4.4-3.6-8-8-8z" fill="#3ecf8e" stroke="white" stroke-width="1.5"/>
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
    <div className="rounded-lg overflow-hidden border border-border h-[320px]">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
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
                color: "#3ecf8e",
                fillColor: "#3ecf8e",
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
