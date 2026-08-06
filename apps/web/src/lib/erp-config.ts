export const PURCHASE_CONFIG = {
  areas: [
    { value: 'LOGISTICA', label: 'Logística', color: 'bg-blue-50 text-blue-700 border border-blue-200' },
    { value: 'VERTIKAL', label: 'Vertikal', color: 'bg-blue-50 text-blue-700 border border-blue-200' },
    { value: 'CASA', label: 'Casa', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
    { value: 'BRONCES', label: 'Bronces', color: 'bg-orange-50 text-orange-700 border border-orange-200' },
  ],
  paymentTypes: [
    { value: 'tarjeta_credito', label: 'Tarjeta Crédito' },
    { value: 'tarjeta_debito', label: 'Tarjeta Débito' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'otro', label: 'Otro' },
  ],
  statuses: [
    { value: 'pagada', label: 'Pagada', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    { value: 'no_pagada', label: 'No Pagada', color: 'bg-rose-50 text-rose-700 border border-rose-200' },
  ],
} as const;

export const SALES_CONFIG = {
  statuses: [
    { value: 'pagada', label: 'Pagada', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    { value: 'confirming', label: 'Confirming', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
    { value: 'factoring', label: 'Factoring', color: 'bg-blue-50 text-blue-700 border border-blue-200' },
  ],
  sellers: [
    { value: 'FELIPE', label: 'Felipe', color: 'bg-blue-50 text-primary border border-primary/20' },
    { value: 'MACA', label: 'Maca', color: 'bg-blue-50 text-blue-700 border border-blue-200' },
  ],
  ivaRate: 0.19,
} as const;

export const IVA_RATE = 0.19;
