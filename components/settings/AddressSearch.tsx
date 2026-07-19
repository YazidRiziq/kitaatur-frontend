"use client"

import { useState, useEffect, useRef } from "react"
import { Search, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

interface NominatimResult {
  lat: string
  lon: string
  display_name: string
}

interface AddressSearchProps {
  onSelect: (lat: number, lng: number, label: string) => void
  placeholder?: string
}

export function AddressSearch({
  onSelect,
  placeholder = "Cari alamat kantor...",
}: AddressSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<NominatimResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (query.trim().length < 3) {
      setResults([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}&countrycodes=id`,
          { headers: { "Accept-Language": "id" } }
        )
        if (res.ok) {
          const data: NominatimResult[] = await res.json()
          setResults(data)
          setOpen(true)
        }
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 1000)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleSelect(result: NominatimResult) {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    const label = result.display_name.split(",").slice(0, 3).join(", ")
    setQuery(label)
    setOpen(false)
    onSelect(lat, lng, label)
  }

  return (
    <div ref={containerRef} className="relative z-[1100]">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="pl-9"
        />
        {loading && (
          <Spinner className="absolute right-3 top-1/2 -translate-y-1/2 size-4" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute mt-1 w-full rounded-lg border border-border bg-popover shadow-lg overflow-hidden max-h-60 overflow-y-auto">
          {results.map((result, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(result)}
              className="flex items-start gap-2 w-full px-3 py-2.5 text-left text-sm hover:bg-muted transition-colors border-b border-border/50 last:border-0"
            >
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <span className="text-muted-foreground">
                {result.display_name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
