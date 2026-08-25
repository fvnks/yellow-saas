import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const DECIMAL_UNITS = ['KG', 'LT', 'MT', 'L', 'ML', 'G', 'GR', 'CM', 'MM', 'M2', 'M3']

export function unitUsesDecimals(unit?: string | null): boolean {
  if (!unit) return false
  return DECIMAL_UNITS.includes(unit.toUpperCase())
}

export function formatQuantity(value: number, unit?: string | null): string {
  const formatted = unitUsesDecimals(unit)
    ? Number(value).toLocaleString('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 2 })
    : Number(value).toLocaleString('es-CL', { maximumFractionDigits: 0 })
  return `${formatted} ${(unit || '').toUpperCase()}`
}
