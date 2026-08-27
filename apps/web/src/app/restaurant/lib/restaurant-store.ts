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
    id: 'm1',
    name: 'Lomo a lo Pobre Tradicional',
    category: 'food',
    priceCLP: 12900,
    description: 'Lomo de res 300g, papas fritas caseras, cebolla frita y dos huevos fritos.',
    station: 'kitchen',
    inStock: true,
    image: '🥩',
    suggestion: 'Acompáñalo con un Vino Cabernet Sauvignon o Bebida',
  },
  {
    id: 'm2',
    name: 'Empanadas de Pino (3 un.)',
    category: 'food',
    priceCLP: 5500,
    description: 'Carne picada a cuchillo, cebolla, aceituna de Azapa y huevo duro.',
    station: 'kitchen',
    inStock: true,
    image: '🥟',
    suggestion: 'Recomendado con Pisco Sour Catedrático',
  },
  {
    id: 'm3',
    name: 'Ceviche Mixto del Pacífico',
    category: 'food',
    priceCLP: 9800,
    description: 'Reineta fresca, camarones, leche de tigre, cancha y camote.',
    station: 'kitchen',
    inStock: true,
    image: '🐟',
    suggestion: 'Ideal con Pisco Sour o Cerveza Artesanal',
  },
  {
    id: 'm4',
    name: 'Pisco Sour Catedrático',
    category: 'drink',
    priceCLP: 4900,
    description: 'Pisco chilenisimo 40°, limón de Pica, jarabe de goma y amargo de angostura.',
    station: 'bar',
    inStock: true,
    image: '🍸',
  },
  {
    id: 'm5',
    name: 'Cerveza Kross IPA 500cc',
    category: 'drink',
    priceCLP: 4200,
    description: 'Cerveza artesanal chilena con aroma cítrico y amargor balanceado.',
    station: 'bar',
    inStock: true,
    image: '🍺',
  },
  {
    id: 'm6',
    name: 'Mote con Huesillo Artesanal',
    category: 'dessert',
    priceCLP: 3500,
    description: 'Jugo natural de durazno deshidratado con trigo mote tierno bien helado.',
    station: 'bar',
    inStock: false, // Out of stock test case
    image: '🍑',
  },
];

export const INITIAL_TABLES: TableSession[] = [
  { tableId: 1, tableName: 'Mesa 1 (Terraza)', capacity: 2, status: 'occupied', pinCode: '7492' },
  { tableId: 2, tableName: 'Mesa 2 (Terraza)', capacity: 4, status: 'free', pinCode: '1839' },
  { tableId: 3, tableName: 'Mesa 3 (Salon Interior)', capacity: 4, status: 'occupied', pinCode: '4920' },
  { tableId: 4, tableName: 'Mesa 4 (Salon Interior)', capacity: 6, status: 'reserved', pinCode: '8501' },
  { tableId: 5, tableName: 'Mesa 5 (VIP Bar)', capacity: 2, status: 'bill_requested', pinCode: '3910' },
  { tableId: 6, tableName: 'Mesa 6 (Barra)', capacity: 2, status: 'free', pinCode: '6204' },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-101',
    tableId: 1,
    tableName: 'Mesa 1 (Terraza)',
    pinCode: '7492',
    totalCLP: 23300,
    createdAt: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
    status: 'active',
    waiterName: 'Carlos M.',
    items: [
      { id: 'i1', menuItemId: 'm1', name: 'Lomo a lo Pobre Tradicional', priceCLP: 12900, quantity: 1, station: 'kitchen', status: 'preparing' },
      { id: 'i2', menuItemId: 'm3', name: 'Ceviche Mixto del Pacífico', priceCLP: 9800, quantity: 1, station: 'kitchen', status: 'pending' },
      { id: 'i3', menuItemId: 'm4', name: 'Pisco Sour Catedrático', priceCLP: 4900, quantity: 2, station: 'bar', status: 'ready' },
    ],
  },
  {
    id: 'ORD-102',
    tableId: 3,
    tableName: 'Mesa 3 (Salon Interior)',
    pinCode: '4920',
    totalCLP: 15200,
    createdAt: new Date(Date.now() - 15 * 60000).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
    status: 'active',
    waiterName: 'Andrea R.',
    items: [
      { id: 'i4', menuItemId: 'm2', name: 'Empanadas de Pino (3 un.)', priceCLP: 5500, quantity: 2, station: 'kitchen', status: 'ready' },
      { id: 'i5', menuItemId: 'm5', name: 'Cerveza Kross IPA 500cc', priceCLP: 4200, quantity: 1, station: 'bar', status: 'ready' },
    ],
  },
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'res-1',
    reservationCode: 'RES-8921',
    customerName: 'Matías Silva',
    customerEmail: 'matias.silva@empresa.cl',
    customerPhone: '+56 9 8765 4321',
    tableId: 4,
    tableName: 'Mesa 4 (Salon Interior)',
    date: new Date().toISOString().split('T')[0],
    time: '20:30',
    peopleCount: 4,
    status: 'confirmed',
  },
];
