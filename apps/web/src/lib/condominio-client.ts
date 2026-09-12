export interface CondoUnit {
  id: string;
  number: string;
  type: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  alicuotaPercentage: number;
  unpaidBalanceCLP: number;
  status: 'al_dia' | 'pendiente' | 'moroso';
  x?: number;
  y?: number;
}

export interface ExpenseItem {
  id: string;
  category: string;
  description: string;
  amountCLP: number;
}

export interface CommonExpensePeriod {
  id: string;
  periodName: string; // e.g. "Marzo 2026"
  periodDate: string; // "2026-03"
  dueDate: string; // "2026-04-10"
  status: 'borrador' | 'emitido' | 'cerrado';
  reserveFundPercentage: number; // e.g. 10 => 10%
  lateInterestRate: number; // e.g. 1.5 => 1.5% mensual
  items: ExpenseItem[];
  totalExpensesCLP: number;
  totalReserveFundCLP: number;
  totalBilledCLP: number;
}

export interface PaymentReceipt {
  id: string;
  unitId: string;
  unitNumber: string;
  ownerName: string;
  periodId: string;
  amountCLP: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber: string;
  notes?: string;
}

// Production Initial Datasets (Used as fallback/seed data)
export const INITIAL_UNITS: CondoUnit[] = [];

export const INITIAL_PERIODS: CommonExpensePeriod[] = [];

export const INITIAL_PAYMENTS: PaymentReceipt[] = [];

// Calculation Functions
export function calculateUnitExpense(
  unit: CondoUnit,
  period: CommonExpensePeriod
): {
  baseAmountCLP: number;
  reserveFundCLP: number;
  lateInterestCLP: number;
  previousBalanceCLP: number;
  totalToPayCLP: number;
} {
  const baseAmountCLP = Math.round(period.totalExpensesCLP * (unit.alicuotaPercentage / 100));
  const reserveFundCLP = Math.round(baseAmountCLP * (period.reserveFundPercentage / 100));
  
  // Calculate late interest if unit has unpaid previous balance
  let lateInterestCLP = 0;
  if (unit.unpaidBalanceCLP > 0) {
    lateInterestCLP = Math.round(unit.unpaidBalanceCLP * (period.lateInterestRate / 100));
  }

  const previousBalanceCLP = unit.unpaidBalanceCLP;
  const totalToPayCLP = baseAmountCLP + reserveFundCLP + lateInterestCLP + previousBalanceCLP;

  return {
    baseAmountCLP,
    reserveFundCLP,
    lateInterestCLP,
    previousBalanceCLP,
    totalToPayCLP,
  };
}

export function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}