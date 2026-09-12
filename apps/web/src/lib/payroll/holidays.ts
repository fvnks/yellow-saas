/**
 * Chilean Public Holidays (Feriados Legales)
 * Based on Decreto Supremo that establishes annual holidays.
 * This covers 2025-2026; extend as needed.
 */

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
}

const HOLIDAYS: Holiday[] = [
  // 2025
  { date: '2025-01-01', name: 'Año Nuevo' },
  { date: '2025-04-18', name: 'Viernes Santo' },
  { date: '2025-04-19', name: 'Sábado Santo' },
  { date: '2025-05-01', name: 'Día del Trabajo' },
  { date: '2025-05-21', name: 'Glorias Navales' },
  { date: '2025-06-20', name: 'Día Nacional de los Pueblos Indígenas' },
  { date: '2025-06-26', name: 'San Pedro y San Pablo' },
  { date: '2025-07-16', name: 'Virgen del Carmen' },
  { date: '2025-08-15', name: 'Asunción de la Virgen' },
  { date: '2025-09-18', name: 'Independencia Nacional' },
  { date: '2025-09-19', name: 'Glorias del Ejército' },
  { date: '2025-10-12', name: 'Encuentro de Dos Mundos' },
  { date: '2025-10-31', name: 'Día de las Iglesias Evangélicas' },
  { date: '2025-11-01', name: 'Día de Todos los Santos' },
  { date: '2025-12-08', name: 'Inmaculada Concepción' },
  { date: '2025-12-25', name: 'Navidad' },
  // 2026
  { date: '2026-01-01', name: 'Año Nuevo' },
  { date: '2026-04-03', name: 'Viernes Santo' },
  { date: '2026-04-04', name: 'Sábado Santo' },
  { date: '2026-05-01', name: 'Día del Trabajo' },
  { date: '2026-05-21', name: 'Glorias Navales' },
  { date: '2026-06-20', name: 'Día Nacional de los Pueblos Indígenas' },
  { date: '2026-06-26', name: 'San Pedro y San Pablo' },
  { date: '2026-07-16', name: 'Virgen del Carmen' },
  { date: '2026-08-15', name: 'Asunción de la Virgen' },
  { date: '2026-09-18', name: 'Independencia Nacional' },
  { date: '2026-09-19', name: 'Glorias del Ejército' },
  { date: '2026-10-12', name: 'Encuentro de Dos Mundos' },
  { date: '2026-10-31', name: 'Día de las Iglesias Evangélicas' },
  { date: '2026-11-01', name: 'Día de Todos los Santos' },
  { date: '2026-12-08', name: 'Inmaculada Concepción' },
  { date: '2026-12-25', name: 'Navidad' },
];

function getHolidaySet(year: number): Set<string> {
  const set = new Set<string>();
  for (const h of HOLIDAYS) {
    if (new Date(h.date).getFullYear() === year) {
      set.add(h.date);
    }
  }
  return set;
}

/**
 * Count working days between two dates (inclusive), excluding weekends and Chilean holidays.
 */
export function countWorkingDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  // Build holiday sets for all relevant years
  const holidaySets = new Map<number, Set<string>>();
  for (let y = startYear; y <= endYear; y++) {
    holidaySets.set(y, getHolidaySet(y));
  }

  let days = 0;
  const current = new Date(start);
  while (current <= end) {
    const dow = current.getDay();
    const year = current.getFullYear();
    const dateStr = current.toISOString().split('T')[0];
    const holidays = holidaySets.get(year);

    if (dow !== 0 && dow !== 6 && (!holidays || !holidays.has(dateStr))) {
      days++;
    }
    current.setDate(current.getDate() + 1);
  }
  return days;
}

/**
 * Check if a specific date is a Chilean holiday.
 */
export function isHoliday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const holidays = getHolidaySet(d.getFullYear());
  return holidays.has(dateStr);
}
