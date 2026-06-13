import type { Metadata } from "next";
import "./globals.css";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

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
      {/* flex dan min-h-screen akan membuat sidebar dan konten bersebelahan penuh 1 layar */}
      <body
        suppressHydrationWarning
        className={`flex min-h-screen  bg-surface font-body text-on-surface overflow-x-hidden antialiased ${plusJakarta.variable} ${inter.variable}`}
      >
        {/* Ini Bingkai Kiri (Tetap) */}
        <Sidebar />

        {/* Ini Header (Tetap di atas) */}
        <Header />

        {/* Ini Layar Utama (Berubah-ubah sesuai halaman) */}
        <main className="flex-1 ml-64 mt-20">
          {children}
        </main>
      </body>
    </html>
  );
}
