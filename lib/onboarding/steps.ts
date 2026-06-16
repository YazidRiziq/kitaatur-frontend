import type { OnboardingData, OnboardingStep } from "@/lib/onboarding/types"

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "company",
    title: "Info Perusahaan",
    description: "Nama dan zona waktu perusahaan Anda",
    validate: (data: OnboardingData) => {
      if (!data.companyName.trim()) return "Nama perusahaan wajib diisi"
      if (!data.timezone) return "Zona waktu wajib dipilih"
      return null
    },
  },
  {
    id: "schedule",
    title: "Jam Kerja",
    description: "Atur jam masuk, pulang, dan toleransi",
    validate: (data: OnboardingData) => {
      if (data.workingDays.length === 0) return "Pilih minimal 1 hari kerja"
      return null
    },
  },
  {
    id: "departments",
    title: "Departemen",
    description: "Tambah departemen di perusahaan",
    validate: (data: OnboardingData) => {
      if (data.departments.length === 0) return "Minimal 1 departemen wajib ditambahkan"
      return null
    },
  },
  {
    id: "confirm",
    title: "Konfirmasi",
    description: "Tinjau dan selesaikan setup",
    validate: () => null,
  },
]