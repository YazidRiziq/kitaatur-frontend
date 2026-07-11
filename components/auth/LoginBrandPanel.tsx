const attendanceRows = [
  { initials: "YR", name: "Yazid Riziq", time: "08:02", status: "Tepat Waktu", tone: "emerald" },
  { initials: "SP", name: "Siti Putri", time: "08:21", status: "Telat 21m", tone: "yellow" },
  { initials: "BS", name: "Budi Santoso", time: "—", status: "Di Luar Radius", tone: "tomato" },
] as const

const statusTone: Record<string, string> = {
  emerald: "bg-primary/15 text-primary",
  yellow: "bg-accent-yellow/15 text-accent-yellow",
  tomato: "bg-accent-tomato/15 text-accent-tomato",
}

const avatarTone: Record<string, string> = {
  emerald: "bg-primary/20 text-primary",
  yellow: "bg-accent-yellow/20 text-accent-yellow",
  tomato: "bg-accent-tomato/20 text-accent-tomato",
}

export function LoginBrandPanel() {
  return (
    <aside className="relative hidden lg:flex flex-col justify-between bg-canvas-night text-on-dark px-12 py-12 xl:px-16">
      <header className="flex items-center gap-2">
        <span className="text-lg font-medium tracking-tight">KitaAtur</span>
        <span className="size-1.5 rounded-full bg-primary" aria-hidden />
      </header>

      <div className="max-w-md">
        <h2 className="text-[2.25rem] leading-[1.15] font-medium tracking-[-0.72px]">
          Absensi, cuti, dan tim Anda — dalam satu dashboard.
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-mute-2">
          Absensi via WhatsApp tervalidasi lewat geofencing, cuti tercatat
          rapi, dan data karyawan terpusat. Tanpa spreadsheet, tanpa
          rumus manual.
        </p>

        <div className="relative mt-10">
          <div
            aria-hidden
            className="absolute -top-3 -right-3 inset-0 rounded-lg border border-white/5 bg-canvas-night-soft/60"
          />
          <div className="relative rounded-lg border border-white/10 bg-canvas-night-soft shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary" aria-hidden />
                <span className="text-[13px] font-medium text-on-dark">
                  Absensi · Hari Ini
                </span>
              </div>
              <span className="text-[12px] text-ink-faint">11 Jul 2026</span>
            </div>

            <div className="flex items-center gap-2 px-4 py-3">
              <Stat label="Hadir" value="12" tone="emerald" />
              <Stat label="Telat" value="2" tone="yellow" />
              <Stat label="Cuti" value="1" tone="muted" />
            </div>

            <div className="border-t border-white/10">
              {attendanceRows.map((row) => (
                <div
                  key={row.name}
                  className="flex items-center gap-3 border-b border-white/5 px-4 py-2.5 last:border-0"
                >
                  <div
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${avatarTone[row.tone]}`}
                  >
                    {row.initials}
                  </div>
                  <span className="flex-1 truncate text-[13px] text-on-dark">
                    {row.name}
                  </span>
                  <span className="text-[12px] tabular-nums text-ink-mute-2">
                    {row.time}
                  </span>
                  <span
                    className={`inline-flex h-5 items-center rounded-full px-2 text-[11px] font-medium ${statusTone[row.tone]}`}
                  >
                    {row.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="text-[12px] text-ink-faint">
        &copy; {new Date().getFullYear()} KitaAtur. Seluruh hak cipta dilindungi.
      </footer>
    </aside>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: "emerald" | "yellow" | "muted"
}) {
  const valueTone =
    tone === "emerald"
      ? "text-primary"
      : tone === "yellow"
        ? "text-accent-yellow"
        : "text-ink-mute-2"
  return (
    <div className="flex flex-col rounded-md bg-white/[0.03] px-3 py-1.5">
      <span className="text-[11px] text-ink-faint">{label}</span>
      <span className={`text-[15px] font-medium tabular-nums ${valueTone}`}>
        {value}
      </span>
    </div>
  )
}
