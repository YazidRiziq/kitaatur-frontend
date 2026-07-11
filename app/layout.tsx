import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { ToasterWrapper } from "@/components/layout/ToasterWrapper";
import { TooltipWrapper } from "@/components/layout/TooltipWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "KitaAtur HRIS",
  description: "Dashboard Admin untuk KitaAtur",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`min-h-screen bg-surface font-body text-on-surface overflow-x-hidden antialiased ${inter.variable}`}
      >
        <TooltipWrapper>
          {children}
        </TooltipWrapper>
        <ToasterWrapper />
      </body>
    </html>
  );
}
