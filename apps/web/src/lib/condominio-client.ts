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

// Initial Synthetic Demo Data
export const INITIAL_SECTORS: CondoSector[] = [
  { id: 'sec-1', name: 'Torre A - Los Alerces', type: 'torre', description: 'Edificio residencial 12 pisos', color: '#0EA5E9' },
  { id: 'sec-2', name: 'Torre B - Los Alerces', type: 'torre', description: 'Edificio residencial 12 pisos', color: '#6366F1' },
  { id: 'sec-3', name: 'Sector Parcelas El Valle', type: 'sector_parcelas', description: 'Macrolotes de 5.000m²', color: '#10B981' },
];

export const INITIAL_UNITS: CondoUnit[] = [
  {
    id: 'u-101',
    number: 'Dpto 101',
    type: 'departamento',
    sectorId: 'sec-1',
    sectorName: 'Torre A - Los Alerces',
    ownerName: 'Carlos Silva M.',
    ownerRut: '15.420.192-4',
    ownerEmail: 'carlos.silva@gmail.com',
    ownerPhone: '+56991234567',
    alicuotaPercentage: 4.5,
    areaM2: 85,
    unpaidBalanceCLP: 0,
    status: 'al_dia',
    x: 1, y: 1
  },
  {
    id: 'u-102',
    number: 'Dpto 102',
    type: 'departamento',
    sectorId: 'sec-1',
    sectorName: 'Torre A - Los Alerces',
    ownerName: 'María José Morales',
    ownerRut: '17.882.311-[#]',
    ownerEmail: 'mj.morales@empresa.cl',
    ownerPhone: '+56987654321',
    alicuotaPercentage: 4.5,
    areaM2: 85,
    unpaidBalanceCLP: 112500,
    status: 'pendiente',
    x: 2, y: 1
  },
  {
    id: 'u-201',
    number: 'Dpto 201',
    type: 'departamento',
    sectorId: 'sec-1',
    sectorName: 'Torre A - Los Alerces',
    ownerName: 'Empresa Inversiones Norte Ltda',
    ownerRut: '76.192.480-K',
    ownerEmail: 'contacto@inversionesnorte.cl',
    ownerPhone: '+56977112233',
    alicuotaPercentage: 5.0,
    areaM2: 98,
    unpaidBalanceCLP: 245000,
    status: 'moroso',
    x: 1, y: 2
  },
  {
    id: 'u-202',
    number: 'Dpto 202',
    type: 'departamento',
    sectorId: 'sec-1',
    sectorName: 'Torre A - Los Alerces',
    ownerName: 'Gonzalo Pérez R.',
    ownerRut: '16.510.992-1',
    ownerEmail: 'gperez@gmail.com',
    ownerPhone: '+56955443322',
    alicuotaPercentage: 5.0,
    areaM2: 98,
    unpaidBalanceCLP: 0,
    status: 'al_dia',
    x: 2, y: 2
  },
  {
    id: 'u-p01',
    number: 'Parcela 01 - Los Nogales',
    type: 'parcela',
    sectorId: 'sec-3',
    sectorName: 'Sector Parcelas El Valle',
    ownerName: 'Fernando Araya T.',
    ownerRut: '12.980.443-8',
    ownerEmail: 'faraya@agricola.cl',
    ownerPhone: '+56944332211',
    alicuotaPercentage: 15.0,
    areaM2: 5000,
    unpaidBalanceCLP: 0,
    status: 'al_dia',
    x: 3, y: 1
  },
  {
    id: 'u-p02',
    number: 'Parcela 02 - Los Almendros',
    type: 'parcela',
    sectorId: 'sec-3',
    sectorName: 'Sector Parcelas El Valle',
    ownerName: 'Valentina Soto V.',
    ownerRut: '18.339.102-5',
    ownerEmail: 'vale.soto@gmail.com',
    ownerPhone: '+56933221100',
    alicuotaPercentage: 15.0,
    areaM2: 5200,
    unpaidBalanceCLP: 345000,
    status: 'moroso',
    x: 3, y: 2
  },
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
      { id: 'exp-1', category: 'Conserjería', description: 'Remuneraciones y turnos conserjes', amountCLP: 1850000, supplierName: 'Personal Planta' },
      { id: 'exp-2', category: 'Mantención', description: 'Mantención preventiva ascensores Otis', amountCLP: 420000, supplierName: 'Otis Chile S.A.' },
      { id: 'exp-3', category: 'Servicios Básicos', description: 'Alumbrado áreas comunes y bomba de agua', amountCLP: 380000, supplierName: 'Enel Distribución' },
      { id: 'exp-4', category: 'Reparaciones', description: 'Reparación motor automatización portón principal', amountCLP: 195000, supplierName: 'Servicios de Automatización Spa' },
      { id: 'exp-5', category: 'Administración', description: 'Honorarios administración condominio', amountCLP: 450000, supplierName: 'Gestión Condominios SpA' },
    ],
    totalExpensesCLP: 3295000,
    totalReserveFundCLP: 329500,
    totalBilledCLP: 3624500,
  },
  {
    id: 'per-2026-02',
    periodName: 'Febrero 2026',
    periodDate: '2026-02',
    dueDate: '2026-03-10',
    status: 'cerrado',
    reserveFundPercentage: 10,
    lateInterestRate: 1.5,
    items: [
      { id: 'exp-201', category: 'Conserjería', description: 'Remuneraciones conserjería', amountCLP: 1800000 },
      { id: 'exp-202', category: 'Servicios Básicos', description: 'Luz y agua áreas comunes', amountCLP: 390000 },
      { id: 'exp-203', category: 'Mantención', description: 'Jardinería y mantención áreas verdes', amountCLP: 250000 },
    ],
    totalExpensesCLP: 2440000,
    totalReserveFundCLP: 244000,
    totalBilledCLP: 2684000,
  }
];

export const INITIAL_PAYMENTS: PaymentReceipt[] = [
  {
    id: 'pay-1001',
    unitId: 'u-101',
    unitNumber: 'Dpto 101',
    ownerName: 'Carlos Silva M.',
    periodId: 'per-2026-03',
    amountCLP: 163103,
    paymentDate: '2026-03-28',
    paymentMethod: 'transferencia',
    referenceNumber: 'TRF-9941203',
    bankReconciled: true,
    notes: 'Pago completo recibido por Banco de Chile'
  },
  {
    id: 'pay-1002',
    unitId: 'u-202',
    unitNumber: 'Dpto 202',
    ownerName: 'Gonzalo Pérez R.',
    periodId: 'per-2026-03',
    amountCLP: 181225,
    paymentDate: '2026-03-29',
    paymentMethod: 'webpay',
    referenceNumber: 'WP-8823104',
    bankReconciled: true,
  }
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