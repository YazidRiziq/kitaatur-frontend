import Link from "next/link"
import { ElementType } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const sidebarItemVariants = cva(
  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-95 duration-200 w-full",
  {
    variants: {
      variant: {
        default: "text-slate-500 dark:text-slate-400 hover:text-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10",
        active: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 font-medium border-r-2 border-b-2 border-emerald-600",
        danger: "text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface SidebarItemProps extends VariantProps<typeof sidebarItemVariants> {
  href?: string
  icon: ElementType
  label: string
  className?: string
  onClick?: () => void
}

export function SidebarItem({
  href,
  icon: Icon,
  label,
  variant,
  className,
  onClick,
}: SidebarItemProps) {
  const content = (
    <>
      <Icon size={20} />
      <span className="font-headline tracking-tight">{label}</span>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={cn(sidebarItemVariants({ variant, className }))}>
        {content}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={cn(sidebarItemVariants({ variant, className }))}>
      {content}
    </button>
  )
}
