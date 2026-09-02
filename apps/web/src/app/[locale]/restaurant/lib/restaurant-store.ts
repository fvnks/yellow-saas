'use client';

export interface MenuItem {
  id: string;
  name: string;
  category: 'food' | 'drink' | 'dessert';
  priceCLP: number;
  description: string;
  station: 'kitchen' | 'bar';
  inStock: boolean;
  image: string;
  suggestion?: string;
}

export interface TableSession {
  tableId: number;
  tableName: string;
  capacity: number;
  status: 'free' | 'occupied' | 'reserved' | 'bill_requested';
  pinCode: string;
  currentOrder?: Order;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  priceCLP: number;
  quantity: number;
  station: 'kitchen' | 'bar';
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
}

export interface Order {
  id: string;
  tableId: number;
  tableName: string;
  pinCode: string;
  items: OrderItem[];
  totalCLP: number;
  createdAt: string;
  status: 'active' | 'closed';
  waiterName?: string;
  dteStatus?: 'boleta_emitida' | 'pendiente';
}

export interface Reservation {
  id: string;
  reservationCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  tableId: number;
  tableName: string;
  date: string;
  time: string;
  peopleCount: number;
  status: 'confirmed' | 'cancelled' | 'seated';
}

export type RestaurantRole = 'owner' | 'admin' | 'cashier' | 'waiter' | 'kitchen' | 'bar';

export interface RestaurantUser {
  id: string;
  name: string;
  email: string;
  role: RestaurantRole;
  pin: string;
  active: boolean;
  lastLogin?: string;
}

export interface RolePermission {
  role: RestaurantRole;
  label: string;
  sections: {
    dashboard: boolean;
    pos: boolean;
    kiosk: boolean;
    kitchen: boolean;
    bar: boolean;
    sales: boolean;
    reservations: boolean;
    cashier: boolean;
    reports: boolean;
    users: boolean;
    admin: boolean;
  };
}

export interface PaymentLine {
  method: 'Efectivo' | 'Transbank DB' | 'Transbank CR' | 'MercadoPago QR';
  amountCLP: number;
}

export interface CashClosure {
  id: string;
  turno: 'mañana' | 'tarde' | 'noche';
  openedBy: string;
  closedBy: string;
  openedAt: string;
  closedAt: string;
  expectedTotalCLP: number;
  declaredCashCLP: number;
  discrepancyCLP: number;
  payments: PaymentLine[];
  totalSalesCLP: number;
  tipsCLP: number;
  dteCount: number;
  status: 'abierta' | 'cerrada';
}

export interface DteBoleta {
  id: string;
  folio: number;
  orderId: string;
  tableName: string;
  waiterName: string;
  dateTime: string;
  netoCLP: number;
  ivaCLP: number;
  tipCLP: number;
  totalCLP: number;
  paymentMethod: 'Efectivo' | 'Transbank DB' | 'Transbank CR' | 'MercadoPago QR';
  tipo: 'Afecta' | 'Exenta';
  retencion: 'retiro' | 'no_retiro';
  siiStatus: 'Aceptado SII' | 'Pendiente' | 'Rechazado';
  tedCode: string;
}


export const INITIAL_MENU_ITEMS: MenuItem[] = [];

export const INITIAL_TABLES: TableSession[] = [];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_RESERVATIONS: Reservation[] = [];

export const INITIAL_RESTAURANT_USERS: RestaurantUser[] = [];

export const ROLE_PERMISSIONS: RolePermission[] = [
  {
    role: 'owner',
    label: 'Dueño / Propietario',
    sections: { dashboard: true, pos: true, kiosk: true, kitchen: true, bar: true, sales: true, reservations: true, cashier: true, reports: true, users: true, admin: true },
  },
  {
    role: 'admin',
    label: 'Administrador',
    sections: { dashboard: true, pos: true, kiosk: true, kitchen: true, bar: true, sales: true, reservations: true, cashier: true, reports: true, users: true, admin: true },
  },
  {
    role: 'cashier',
    label: 'Cajero',
    sections: { dashboard: true, pos: true, kiosk: true, kitchen: false, bar: false, sales: true, reservations: true, cashier: true, reports: false, users: false, admin: false },
  },
  {
    role: 'waiter',
    label: 'Garzón / Mesero',
    sections: { dashboard: false, pos: true, kiosk: true, kitchen: false, bar: false, sales: false, reservations: true, cashier: false, reports: false, users: false, admin: false },
  },
  {
    role: 'kitchen',
    label: 'Cocina (KDS)',
    sections: { dashboard: false, pos: false, kiosk: false, kitchen: true, bar: false, sales: false, reservations: false, cashier: false, reports: false, users: false, admin: false },
  },
  {
    role: 'bar',
    label: 'Bar (KDS)',
    sections: { dashboard: false, pos: false, kiosk: false, kitchen: false, bar: true, sales: false, reservations: false, cashier: false, reports: false, users: false, admin: false },
  },
];

export const ROLE_LABELS: Record<RestaurantRole, string> = {
  owner: 'Dueño',
  admin: 'Administrador',
  cashier: 'Cajero',
  waiter: 'Garzón',
  kitchen: 'Cocina',
  bar: 'Bar',
};

export const ROLE_BADGES: Record<RestaurantRole, string> = {
  owner: 'bg-amber-100 text-amber-800 border-amber-200',
  admin: 'bg-slate-900 text-white border-slate-800',
  cashier: 'bg-blue-100 text-blue-800 border-blue-200',
  waiter: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  kitchen: 'bg-rose-100 text-rose-800 border-rose-200',
  bar: 'bg-purple-100 text-purple-800 border-purple-200',
};

export const INITIAL_CASH_CLOSURE: CashClosure = {
  id: '',
  turno: 'mañana',
  openedBy: '',
  closedBy: '',
  openedAt: '',
  closedAt: '',
  expectedTotalCLP: 0,
  declaredCashCLP: 0,
  discrepancyCLP: 0,
  payments: [],
  totalSalesCLP: 0,
  tipsCLP: 0,
  dteCount: 0,
  status: 'abierta',
};

export const INITIAL_BOLETAS_DTE: DteBoleta[] = [];

