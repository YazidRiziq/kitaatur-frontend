import { type ElementType } from "react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: ElementType
  variant?: "default" | "destructive" | "secondary"
  subValue?: string
}

const variantStyles = {
  default: {
    iconBg: "bg-primary/10 text-primary",
    value: "text-foreground",
  },
  destructive: {
    iconBg: "bg-destructive/10 text-destructive",
    value: "text-destructive",
  },
  secondary: {
    iconBg: "bg-muted text-muted-foreground",
    value: "text-foreground",
  },
}

export function AttendanceStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  subValue,
}: StatCardProps) {
  const styles = variantStyles[variant]

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <span className={cn("flex size-7 items-center justify-center rounded-sm", styles.iconBg)}>
          <Icon className="size-4" />
        </span>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className={cn("text-3xl font-medium tabular-nums tracking-tight", styles.value)}>
          {value}
        </span>
        {subValue && (
          <span className="text-sm text-muted-foreground">{subValue}</span>
        )}
      </div>

      <p className="mt-1.5 text-xs text-muted-foreground">{subtitle}</p>
    </div>
  )
}
