import React, { ElementType } from "react";

interface AttendanceStatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ElementType; // Berubah agar bisa menerima komponen Lucide
  variant: "primary" | "error" | "tertiary";
  subValue?: string;
}

export function AttendanceStatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, // Di-alias menjadi huruf besar agar bisa di-render sebagai komponen
  variant, 
  subValue 
}: AttendanceStatCardProps) {
  
  const colorMap = {
    primary: {
      border: "border-emerald-50/50",
      blob: "bg-primary/5 group-hover:bg-primary/10",
      valueText: "text-primary",
      subtitleText: "text-primary",
      iconText: "text-primary/20" // Opacity sedikit dinaikkan agar SVG lebih jelas
    },
    error: {
      border: "border-error/5",
      blob: "bg-error/5 group-hover:bg-error/10",
      valueText: "text-error",
      subtitleText: "text-error",
      iconText: "text-error/20"
    },
    tertiary: {
      border: "border-emerald-50/50",
      blob: "bg-tertiary/5 group-hover:bg-tertiary/10",
      valueText: "text-tertiary",
      subtitleText: "text-on-surface-variant",
      iconText: "text-tertiary/20"
    }
  };

  const theme = colorMap[variant];

  return (
    <div className={`bg-surface-container-lowest p-6 rounded-3xl shadow-sm border relative overflow-hidden group ${theme.border}`}>
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl transition-all ${theme.blob}`}></div>
      
      <p className="text-sm text-on-surface-variant font-medium">{title}</p>
      
      <div className="flex items-baseline gap-2 mt-2">
        <span className={`font-headline text-4xl font-bold ${theme.valueText}`}>{value}</span>
        {subValue && <span className="text-xs text-slate-400">{subValue}</span>}
      </div>
      
      <p className={`text-xs mt-2 font-medium ${theme.subtitleText}`}>{subtitle}</p>
      
      {/* Menggunakan komponen Icon Lucide di sini */}
      <Icon className={`absolute right-6 bottom-6 w-12 h-12 ${theme.iconText}`} strokeWidth={1.5} />
    </div>
  );
}