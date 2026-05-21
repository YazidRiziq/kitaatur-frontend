import React, { ElementType } from "react";

interface LeaveStatCardProps {
  title: string;
  value: string | number;
  icon: ElementType;
  trendIcon: ElementType;
  trendText: string;
  variant: "tertiary" | "primary" | "secondary";
}

export function LeaveStatCard({ 
  title, 
  value, 
  icon: Icon, 
  trendIcon: TrendIcon, 
  trendText, 
  variant 
}: LeaveStatCardProps) {
  
  // Mapping warna sesuai desain Stitch AI
  const colorMap = {
    tertiary: {
      border: "border-tertiary",
      text: "text-tertiary",
      iconBg: "bg-tertiary-fixed text-on-tertiary-fixed",
    },
    primary: {
      border: "border-primary",
      text: "text-primary",
      iconBg: "bg-primary-fixed text-on-primary-fixed",
    },
    secondary: {
      border: "border-secondary",
      text: "text-secondary",
      iconBg: "bg-secondary-container text-on-secondary-container",
    }
  };

  const theme = colorMap[variant];

  return (
    <div className={`relative overflow-hidden bg-surface-container-lowest p-6 rounded-3xl shadow-[0_12px_40px_rgba(0,105,72,0.06)] border-l-4 ${theme.border}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-on-surface-variant text-sm font-medium mb-1">{title}</p>
          <h3 className={`font-headline text-3xl font-bold ${theme.text}`}>{value}</h3>
        </div>
        <div className={`p-3 rounded-2xl ${theme.iconBg}`}>
          <Icon size={24} strokeWidth={2} />
        </div>
      </div>
      <div className={`mt-4 flex items-center text-xs font-medium ${theme.text}`}>
        <TrendIcon size={16} className="mr-1" />
        <span>{trendText}</span>
      </div>
    </div>
  );
}