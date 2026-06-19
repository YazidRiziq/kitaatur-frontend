import type { Metadata } from "next";
import "./globals.css";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { ToasterWrapper } from "@/components/layout/ToasterWrapper";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-headline" });
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
        className={`min-h-screen bg-surface font-body text-on-surface overflow-x-hidden antialiased ${plusJakarta.variable} ${inter.variable}`}
      >
        {children}
        <ToasterWrapper />
      </body>
    </html>
  );
}
