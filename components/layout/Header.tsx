"use client";

import Image from "next/image";
import { Bell, Settings } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 z-40 w-full h-15 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl flex items-center justify-end px-8 py-4 shadow-sm dark:shadow-none">
      <Bell className="w-8 h-8 p-2 text-slate-500 hover:text-emerald-500 transition-all active:scale-95"/>
      <Settings className="w-8 h-8 p-2 mr-4 text-slate-500 hover:text-emerald-500 transition-all active:scale-95"/>
      <div className="flex items-center gap-6">
        <div className="h-8 w-px bg-slate-200"></div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold font-headline leading-none">
              Yazid Riziq
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              Administrator
            </p>
          </div>
          <div className="relative">
            <Image
              src="/yazid_riziq.jpg"
              alt="Profile Picture"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
}
