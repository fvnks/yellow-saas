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


export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'menu-1',
    name: 'Lomo a lo Pobre',
    category: 'food',
    priceCLP: 14900,
    description: 'Lomo de vacuno a la plancha con huevos fritos, cebolla caramelizada y papas fritas.',
    station: 'kitchen',
    inStock: true,
    image: '🥩',
  },
  {
    id: 'menu-2',
    name: 'Empanada de Pino Horno',
    category: 'food',
    priceCLP: 3500,
    description: 'Carne picada a cuchillo, cebolla, aceituna, huevo duro y pasa.',
    station: 'kitchen',
    inStock: true,
    image: '🥟',
  },
  {
    id: 'menu-3',
    name: 'Pastel de Choclo Tradicional',
    category: 'food',
    priceCLP: 11900,
    description: 'Pastel horneado en paila de greda con pino de vacuno y pollo.',
    station: 'kitchen',
    inStock: true,
    image: '🍲',
  },
  {
    id: 'menu-4',
    name: 'Machas a la Parmesana',
    category: 'food',
    priceCLP: 12900,
    description: 'Machas frescas gratinadas con queso parmesano, vino blanco y mantequilla.',
    station: 'kitchen',
    inStock: true,
    image: '🦪',
  },
  {
    id: 'menu-5',
    name: 'Completo Italiano Jumbo',
    category: 'food',
    priceCLP: 4200,
    description: 'Vienesa, palta molida fresca, tomate en cubos y mayonesa casera.',
    station: 'kitchen',
    inStock: true,
    image: '🌭',
  },
  {
    id: 'menu-6',
    name: 'Chorrillana ERP Tradicional',
    category: 'food',
    priceCLP: 16900,
    description: 'Cama de papas fritas, carne salteada, cebolla frita y 2 huevos al hilo.',
    station: 'kitchen',
    inStock: true,
    image: '🍟',
  },
  {
    id: 'menu-7',
    name: 'Pisco Sour Cátedra 35°',
    category: 'drink',
    priceCLP: 5900,
    description: 'Pisco chileno reservado, jugo de limón de Pica exprimido y goma.',
    station: 'bar',
    inStock: true,
    image: '🍸',
  },
  {
    id: 'menu-8',
    name: 'Schop Artesanal Kross 500cc',
    category: 'drink',
    priceCLP: 4800,
    description: 'Cerveza tirada helada estilo Amber Ale.',
    station: 'bar',
    inStock: true,
    image: '🍺',
  },
  {
    id: 'menu-9',
    name: 'Terremoto 500cc Tradicional',
    category: 'drink',
    priceCLP: 4500,
    description: 'Vino pipeño, helado de piña y granadina.',
    station: 'bar',
    inStock: true,
    image: '🍷',
  },
  {
    id: 'menu-10',
    name: 'Jugo Natural Chirimoya Alegre',
    category: 'drink',
    priceCLP: 3800,
    description: 'Jugo de chirimoya natural con toques de naranja.',
    station: 'bar',
    inStock: true,
    image: '🍹',
  },
];

export const INITIAL_TABLES: TableSession[] = [
  { tableId: 1, tableName: 'Mesa 01 - Salón', capacity: 2, status: 'occupied', pinCode: '1042' },
  { tableId: 2, tableName: 'Mesa 02 - Salón', capacity: 4, status: 'bill_requested', pinCode: '2891' },
  { tableId: 3, tableName: 'Mesa 03 - Salón', capacity: 4, status: 'free', pinCode: '3105' },
  { tableId: 4, tableName: 'Mesa 04 - Salón', capacity: 6, status: 'free', pinCode: '4412' },
  { tableId: 5, tableName: 'Mesa 05 - Terraza', capacity: 4, status: 'free', pinCode: '5920' },
  { tableId: 6, tableName: 'Mesa 06 - Terraza', capacity: 2, status: 'free', pinCode: '6814' },
  { tableId: 7, tableName: 'Mesa VIP 01', capacity: 8, status: 'reserved', pinCode: '7701' },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-101',
    tableId: 1,
    tableName: 'Mesa 01 - Salón',
    pinCode: '1042',
    totalCLP: 20800,
    createdAt: '13:45',
    status: 'active',
    waiterName: 'Matías Silva',
    items: [
      { id: 'i-101', menuItemId: 'menu-1', name: 'Lomo a lo Pobre', priceCLP: 14900, quantity: 1, station: 'kitchen', status: 'preparing' },
      { id: 'i-102', menuItemId: 'menu-7', name: 'Pisco Sour Cátedra 35°', priceCLP: 5900, quantity: 1, station: 'bar', status: 'ready' },
    ],
  },
  {
    id: 'ORD-102',
    tableId: 2,
    tableName: 'Mesa 02 - Salón',
    pinCode: '2891',
    totalCLP: 34300,
    createdAt: '13:10',
    status: 'active',
    waiterName: 'Camila Rojas',
    items: [
      { id: 'i-201', menuItemId: 'menu-3', name: 'Pastel de Choclo Tradicional', priceCLP: 11900, quantity: 1, station: 'kitchen', status: 'ready' },
      { id: 'i-202', menuItemId: 'menu-4', name: 'Machas a la Parmesana', priceCLP: 12900, quantity: 1, station: 'kitchen', status: 'ready' },
      { id: 'i-203', menuItemId: 'menu-8', name: 'Schop Artesanal Kross 500cc', priceCLP: 4800, quantity: 2, station: 'bar', status: 'ready' },
    ],
  },
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'RES-901',
    reservationCode: 'RES-901',
    customerName: 'Gonzalo Morales',
    customerEmail: 'gmorales@empresa.cl',
    customerPhone: '+56 9 8765 4321',
    tableId: 7,
    tableName: 'Mesa VIP 01',
    date: '2026-08-27',
    time: '20:30',
    peopleCount: 6,
    status: 'seated',
  },
];

export const INITIAL_RESTAURANT_USERS: RestaurantUser[] = [
  { id: 'usr-01', name: 'Ricardo Fuentes', email: 'dueno@erp.cl', role: 'owner', pin: '0001', active: true, lastLogin: '2026-08-27 21:10' },
  { id: 'usr-02', name: 'Valentina Salas', email: 'admin@erp.cl', role: 'admin', pin: '0002', active: true, lastLogin: '2026-08-28 09:00' },
  { id: 'usr-03', name: 'Cristian Pavez', email: 'cajero@erp.cl', role: 'cashier', pin: '0003', active: true, lastLogin: '2026-08-28 09:05' },
  { id: 'usr-04', name: 'Matías Silva', email: 'garzon@erp.cl', role: 'waiter', pin: '0004', active: true, lastLogin: '2026-08-28 08:58' },
  { id: 'usr-05', name: 'Camila Rojas', email: 'garzon2@erp.cl', role: 'waiter', pin: '0005', active: true },
  { id: 'usr-06', name: 'Jorge Tapia', email: 'cocina@erp.cl', role: 'kitchen', pin: '0006', active: true, lastLogin: '2026-08-28 08:45' },
  { id: 'usr-07', name: 'Francisca Vera', email: 'bar@erp.cl', role: 'bar', pin: '0007', active: true, lastLogin: '2026-08-28 08:50' },
];

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
  id: 'cc-01',
  turno: 'mañana',
  openedBy: 'Cristian Pavez',
  closedBy: 'Cristian Pavez',
  openedAt: '2026-08-28 09:00',
  closedAt: '2026-08-28 15:30',
  expectedTotalCLP: 428600,
  declaredCashCLP: 428600,
  discrepancyCLP: 0,
  payments: [
    { method: 'Efectivo', amountCLP: 172400 },
    { method: 'Transbank DB', amountCLP: 121600 },
    { method: 'Transbank CR', amountCLP: 98500 },
    { method: 'MercadoPago QR', amountCLP: 36100 },
  ],
  totalSalesCLP: 428600,
  tipsCLP: 38960,
  dteCount: 27,
  status: 'cerrada',
};

export const INITIAL_BOLETAS_DTE: DteBoleta[] = [
  {
    id: 'bol-01',
    folio: 1287,
    orderId: 'ORD-101',
    tableName: 'Mesa 01 - Salón',
    waiterName: 'Matías Silva',
    dateTime: '2026-08-28 13:45',
    netoCLP: 20800,
    ivaCLP: 3952,
    tipCLP: 2080,
    totalCLP: 26832,
    paymentMethod: 'Transbank DB',
    tipo: 'Afecta',
    retencion: 'no_retiro',
    siiStatus: 'Aceptado SII',
    tedCode: 'TED-88419-88',
  },
  {
    id: 'bol-02',
    folio: 1288,
    orderId: 'ORD-102',
    tableName: 'Mesa 02 - Salón',
    waiterName: 'Camila Rojas',
    dateTime: '2026-08-28 13:10',
    netoCLP: 34300,
    ivaCLP: 6517,
    tipCLP: 3430,
    totalCLP: 44247,
    paymentMethod: 'Efectivo',
    tipo: 'Afecta',
    retencion: 'no_retiro',
    siiStatus: 'Aceptado SII',
    tedCode: 'TED-88420-12',
  },
];

