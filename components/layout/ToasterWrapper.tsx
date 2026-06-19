"use client"

import { Toaster } from "sonner"

export function ToasterWrapper() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          borderRadius: "12px",
          fontFamily: "var(--font-body)",
        },
      }}
    />
  )
}