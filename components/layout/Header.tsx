"use client"

import Image from "next/image"
import { Bell, Settings } from "lucide-react"

interface HeaderProps {
  userName?: string
  userRole?: string
  userAvatarUrl?: string
}

export function Header({ userName, userRole, userAvatarUrl }: HeaderProps) {
  return (
    <header className="fixed top-0 z-40 w-full h-15 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl flex items-center justify-end px-8 py-4 shadow-sm dark:shadow-none">
      <div className="ml-64" />
      <Bell className="w-8 h-8 p-2 text-slate-500 hover:text-emerald-500 transition-all active:scale-95"/>
      <Settings className="w-8 h-8 p-2 mr-4 text-slate-500 hover:text-emerald-500 transition-all active:scale-95"/>
      <div className="flex items-center gap-6">
        <div className="h-8 w-px bg-slate-200"></div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold font-headline leading-none">
              {userName}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              {userRole}
            </p>
          </div>
          <div className="relative">
            {userAvatarUrl ? (
              <Image
                src={userAvatarUrl}
                alt="Profile Picture"
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">
                  {userName?.charAt(0).toUpperCase() ?? "?"}
                </span>
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  )
}
