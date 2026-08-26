export interface CondoUnit {
  id: string;
  number: string;
  type: 'departamento' | 'casa' | 'parcela' | 'bodega' | 'estacionamiento';
  sectorId: string;
  sectorName: string;
  ownerName: string;
  ownerRut: string;
  ownerEmail: string;
  ownerPhone: string;
  alicuotaPercentage: number; // Coefficient, e.g. 2.5 => 2.5%
  areaM2: number;
  unpaidBalanceCLP: number; // Integer CLP
  status: 'al_dia' | 'pendiente' | 'moroso';
  x?: number; // Visual grid coordinates for layout canvas
  y?: number;
}

export interface CondoSector {
  id: string;
  name: string;
  type: 'torre' | 'sector_casas' | 'sector_parcelas' | 'etapa';
  description: string;
  color: string;
}

export interface ExpenseItem {
  id: string;
  category: 'Mantención' | 'Conserjería' | 'Servicios Básicos' | 'Reparaciones' | 'Administración' | 'Seguros';
  description: string;
  amountCLP: number;
  supplierName?: string;
  documentNumber?: string;
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
  paymentMethod: 'transferencia' | 'webpay' | 'deposito' | 'efectivo' | 'cheque';
  referenceNumber: string;
  bankReconciled: boolean;
  notes?: string;
}

// Production Initial Datasets (Used as fallback/seed data)
export const INITIAL_SECTORS: CondoSector[] = [
  { id: 'sec-torre-a', name: 'Torre A (Avenida Los Alerces)', type: 'torre', description: 'Edificio 12 pisos con ascensores', color: 'blue' },
  { id: 'sec-torre-b', name: 'Torre B (Vista Parque)', type: 'torre', description: 'Edificio 10 pisos', color: 'emerald' },
];

export const INITIAL_UNITS: CondoUnit[] = [
  { id: 'u-101', number: 'Dpto 101', type: 'departamento', sectorId: 'sec-torre-a', sectorName: 'Torre A', ownerName: 'Carlos Mendoza Silva', ownerRut: '15.432.890-K', ownerEmail: 'carlos.mendoza@email.cl', ownerPhone: '+56 9 8765 4321', alicuotaPercentage: 2.50, areaM2: 85, unpaidBalanceCLP: 0, status: 'al_dia' },
  { id: 'u-102', number: 'Dpto 102', type: 'departamento', sectorId: 'sec-torre-a', sectorName: 'Torre A', ownerName: 'María José Fernández', ownerRut: '12.876.543-2', ownerEmail: 'mj.fernandez@email.cl', ownerPhone: '+56 9 7654 3210', alicuotaPercentage: 2.50, areaM2: 85, unpaidBalanceCLP: 112500, status: 'pendiente' },
  { id: 'u-103', number: 'Dpto 103', type: 'departamento', sectorId: 'sec-torre-a', sectorName: 'Torre A', ownerName: 'Inversiones Los Olivos SpA', ownerRut: '76.543.210-8', ownerEmail: 'contacto@losolivos.cl', ownerPhone: '+56 9 6543 2109', alicuotaPercentage: 3.10, areaM2: 105, unpaidBalanceCLP: 245000, status: 'moroso' },
  { id: 'u-201', number: 'Dpto 201', type: 'departamento', sectorId: 'sec-torre-b', sectorName: 'Torre B', ownerName: 'Andrés Morales Vera', ownerRut: '16.789.012-3', ownerEmail: 'amorales@email.cl', ownerPhone: '+56 9 5432 1098', alicuotaPercentage: 2.20, areaM2: 74, unpaidBalanceCLP: 0, status: 'al_dia' },
  { id: 'u-202', number: 'Dpto 202', type: 'departamento', sectorId: 'sec-torre-b', sectorName: 'Torre B', ownerName: 'Patricia Tapia Soto', ownerRut: '14.321.098-7', ownerEmail: 'ptapia@email.cl', ownerPhone: '+56 9 4321 0987', alicuotaPercentage: 2.20, areaM2: 74, unpaidBalanceCLP: 0, status: 'al_dia' },
];

export const INITIAL_PERIODS: CommonExpensePeriod[] = [
  {
    id: 'per-2026-03',
    periodName: 'Marzo 2026',
    periodDate: '2026-03',
    dueDate: '2026-04-10',
    status: 'emitido',
    reserveFundPercentage: 10,
    lateInterestRate: 1.5,
    items: [
      { id: 'item-1', category: 'Conserjería', description: 'Sueldos Remuneraciones Turno Marzo', amountCLP: 2800000, supplierName: 'Empresa Servicios Seguridad' },
      { id: 'item-2', category: 'Mantención', description: 'Mantención Mensual Ascensores Torre A y B', amountCLP: 450000, supplierName: 'Otis Chile' },
      { id: 'item-3', category: 'Servicios Básicos', description: 'Cuenta Agua Potable Áreas Comunes', amountCLP: 320000, supplierName: 'Aguas Andinas' },
      { id: 'item-4', category: 'Servicios Básicos', description: 'Cuenta Electricidad Alumbrado y Portón', amountCLP: 580000, supplierName: 'Enel Distribución' },
      { id: 'item-5', category: 'Reparaciones', description: 'Reparación Bomba de Agua Sanitaria', amountCLP: 350000, supplierName: 'Gasfitería e Hidráulica SpA' },
    ],
    totalExpensesCLP: 4500000,
    totalReserveFundCLP: 450000,
    totalBilledCLP: 4950000,
  },
];

export const INITIAL_PAYMENTS: PaymentReceipt[] = [
  {
    id: 'rec-001',
    unitId: 'u-101',
    unitNumber: 'Dpto 101',
    ownerName: 'Carlos Mendoza Silva',
    periodId: 'per-2026-03',
    amountCLP: 123750,
    paymentDate: '2026-03-25',
    paymentMethod: 'webpay',
    referenceNumber: 'WP-884920',
    bankReconciled: true,
    notes: 'Pago recibido vía portal online',
  },
];

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