import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCardNumber(value: string) {
  const v = value.replace(/\D/g, "").substring(0, 16)
  const parts = []
  for (let i = 0; i < v.length; i += 4) {
    parts.push(v.substring(i, i + 4))
  }
  return parts.join(" ")
}

