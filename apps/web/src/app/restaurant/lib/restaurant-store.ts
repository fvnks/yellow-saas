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
